# PRD — Inbound Message → Outbound Webhook (Partner Verification Relay)

> **Product Manager:** Dany Christian
> **Engineering Lead:** Naftal Yunior
> **Domain:** Platform / Integration (Cross-domain — trigger di Conversation inbound path)
> **Status:** Draft v1.1
> **Source Brief:** `Assessments/cross-domain/inbound-message-outbound-webhook/inbound-message-outbound-webhook-change-intake-brief.md` (v1.1)
> **Rules Applied:** `Rules/core/requirements.md`, `Rules/core/analysis-and-risk.md`, `Rules/core/task-router.md`, `Rules/profiles/satuinbox.yml`
> **Tanggal:** 2026-09-15

---

## 1. Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| v1.0 | 2026-09-15 | Dany Christian (Analyst draft) | Initial PRD dari brief v1.0. OQ default = ASSUMED (lihat §19). |
| v1.1 | 2026-09-15 | Dany Christian (Analyst draft) | Webhook config pindah ke **company level** (koreksi user). Owner config: company-service. `accountChannelId` payload jadi wajib untuk partner-side filtering. Per-channel filter → Future. R-4 naik ke HIGH. |

---

## 2. Overview & Scope Definition

SatuInbox mendapatkan kemampuan **outbound webhook**: saat sebuah **company** yang di-opt-in menerima **inbound customer message** (di account-channel mana pun milik company), SatuInbox mengirim HTTP POST bertandatangan ke URL milik partner, berisi nomor pengirim dan isi pesan. Partner memakai ini untuk mereaksi pesan masuk secara real-time — kasus pertama: verifikasi user pihak e-com (Salfok), di mana user mengirim kode yang ditampilkan partner via WhatsApp, dan partner mencocokkannya dari payload webhook.

**In scope:** engine outbound webhook (trigger, payload, signature, retry, delivery-log), konfigurasi **per company** (satu webhook meliputi semua account-channel), observability, feature flag.
**Out of scope:** jalur balik partner→SatuInbox (partner validasi sendiri; tidak perlu), pengiriman OTP oleh SatuInbox, generic multi-event webhook platform (Future), **per-channel enable/filter** (payload membawa `accountChannelId`, partner filter sendiri — Future), matching identitas nomor↔akun partner (logika partner).

**Ceiling (ponytail):** PRD ini sengaja **single-event** (`message.inbound`). Multi-event webhook platform (assignment, close, ticket lifecycle) adalah Future (§17) — engine ini dirancang extensible ke sana tanpa breaking, tapi tidak dibangun sekarang.

---

## 3. Problem Statement

SatuInbox belum punya mekanisme mem-*push* event keluar. Semua webhook existing bersifat **inbound** (Meta/WA Cloud/IG/Messenger → SatuInbox). Partner Open API (`/open-api/docs`, `x-signature-key`) hanya **pull**. Partner yang ingin bereaksi terhadap pesan masuk secara real-time terpaksa polling — mahal, lambat, tidak event-driven. Use-case verifikasi Salfok tidak bisa berjalan tanpa push.

---

## 4. Objectives & Key Results

| Objective | Key Result |
|---|---|
| Enable real-time reaksi partner terhadap inbound message | Webhook terkirim ≤5s p95 dari saat pesan diterima, untuk company opt-in |
| Zero regresi pada jalur pesan existing | p95/p99 latency conversation-service inbound path tidak naik >2% dari baseline |
| Delivery andal | ≥99.5% webhook akhirnya terkirim (setelah retry), 0 kehilangan tanpa jejak |
| Aman | 100% request bertandatangan HMAC valid + timestamp anti-replay |

---

## 5. User Stories & Acceptance Criteria

**US-001 — Admin mengonfigurasi webhook**
Given saya Admin tenant, When saya membuka Company Settings → Webhook dan mengisi `targetUrl` + generate `signingSecret` + enable, Then konfigurasi tersimpan dan webhook aktif untuk semua inbound company (semua account-channel) berikutnya.

**US-002 — Partner menerima event inbound**
Given company C punya webhook enabled, When user mengirim pesan WhatsApp ke salah satu account-channel milik C, Then partner menerima HTTP POST `{phone, content, timestamp, messageId, accountChannelId, companyId}` dengan header signature valid dan `accountChannelId` yang benar (untuk filtering partner-side), dalam ≤5s (p95).

**US-003 — Partner memverifikasi tanpa balasan**
Given partner menerima payload, When partner mencocokkan `phone`+`content` dengan kode yang tadi ditampilkan, Then verifikasi selesai di sisi partner; SatuInbox tidak menunggu / tidak butuh respons balik (respons 2xx cukup untuk menandai delivered).

**US-004 — Delivery gagal di-retry**
Given endpoint partner down / timeout / non-2xx, When webhook gagal, Then SatuInbox retry dengan exponential backoff sampai N kali; jika tetap gagal, delivery ditandai `failed` dan tercatat, tanpa memengaruhi pemrosesan pesan.

**US-005 — Trigger tidak bocor ke event lain**
Given webhook enabled, When yang terjadi adalah pesan **agent/outbound/system** (bukan inbound customer), Then webhook TIDAK terkirim.

**US-006 — Suppress conversation (opsional)**
Given company dengan `suppressFromInbox=true` (dipakai bila seluruh company dedicated verifikasi), When inbound diterima, Then conversation tidak muncul di inbox agent dan tidak men-set T1 SLA metric; webhook tetap terkirim.

---

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | Sistem MUST menyediakan konfigurasi webhook **per company** (disimpan di company-service): `enabled` (bool), `targetUrl` (https), `signingSecret` (write-only), `triggerScope` (enum, default `customer_inbound`), `suppressFromInbox` (bool, default false). Konfigurasi berlaku untuk semua account-channel milik company. |
| FR-002 | `targetUrl` MUST divalidasi: skema `https` wajib, host bukan private/loopback/link-local range (anti-SSRF). |
| FR-003 | Saat inbound message diterima pada account-channel mana pun milik company dengan `enabled=true` dan message memenuhi `triggerScope`, sistem MUST meng-enqueue satu delivery job (async, non-blocking terhadap message processing). |
| FR-004 | Payload MUST berisi: `phone` (E.164), `content` (string), `timestamp` (ISO8601 UTC), `messageId` (stabil, unik per pesan), `accountChannelId` (WAJIB — dasar filtering partner-side pada config company-level), `companyId`, `event` (`"message.inbound"`). |
| FR-005 | Setiap request MUST menyertakan header `X-Satuinbox-Signature: sha256=<hmac>` (HMAC-SHA256 atas raw body dengan `signingSecret`) dan `X-Satuinbox-Timestamp`. |
| FR-006 | Sistem MUST men-treat HTTP 2xx sebagai `delivered`; selain itu (timeout/4xx/5xx/network) sebagai `failed` yang memicu retry. |
| FR-007 | Retry MUST exponential backoff, maksimum N attempt (default 5), timeout per attempt terbatas (default 10s). Setelah N gagal → status `failed`, tidak retry lagi (sweeper tidak menyentuh `failed` final). |
| FR-008 | Setiap delivery MUST punya idempotency key = `messageId`; retry MUST memakai `messageId` yang sama agar partner dapat dedup. |
| FR-009 | Delivery state MUST dipersist di DB (`pending` → `delivered`/`failed`) sebagai source of truth; job hilang dari RMQ (restart) MUST dapat di-recover oleh sweeper — reuse pola `rmq-durable-outbound-queue`. |
| FR-010 | Emisi webhook MUST out-of-band: kegagalan enqueue/kirim webhook MUST NOT menggagalkan atau memperlambat conversation/room creation, assignment, atau SLA path. |
| FR-011 | Bila `suppressFromInbox=true`, sistem MUST NOT memunculkan conversation ke inbox agent DAN MUST NOT men-set SLA T1 untuk pesan tersebut; webhook tetap terkirim. (ponytail: default false — jangan sembunyikan kecuali diminta.) |
| FR-012 | Sistem MUST menyediakan endpoint uji ("Send test event") yang mengirim payload contoh bertandatangan ke `targetUrl` untuk validasi setup partner. |

---

## 7. Permission Matrix

| Action | Agent | Supervisor | Admin | Super Admin |
|---|---|---|---|---|
| Lihat status webhook company | ❌ | ✅ (scoped team) | ✅ | ✅ |
| Buat/ubah `targetUrl` / `triggerScope` / `suppress` | ❌ | ❌ | ✅ | ✅ |
| Generate/rotate `signingSecret` | ❌ | ❌ | ✅ | ✅ |
| Kirim test event | ❌ | ❌ | ✅ | ✅ |
| Lihat delivery log | ❌ | ✅ (scoped) | ✅ | ✅ |

> `signingSecret` = kredensial sensitif → tulis Admin-only, **write-only** (tidak pernah dikembalikan plaintext setelah disimpan; hanya bisa di-rotate).

---

## 8. Error Handling

| ID | Kondisi | Perilaku |
|---|---|---|
| EH-001 | `targetUrl` non-https / private range saat simpan | Tolak simpan, pesan: "URL webhook harus HTTPS dan bukan alamat internal." |
| EH-002 | Endpoint partner timeout (>10s) | Tandai attempt gagal, jadwalkan retry backoff. |
| EH-003 | Partner balas non-2xx | Sama seperti EH-002 (retry). 4xx tetap di-retry (partner mungkin transient) sampai N; setelah N → `failed`. |
| EH-004 | Semua N retry habis | Status `failed`, catat `lastError`, expose di delivery log; TIDAK ada dampak ke pesan/conversation. |
| EH-005 | RMQ restart / job hilang saat `pending` | Sweeper cron memindai row `pending` yang melewati ambang usia → re-enqueue. Idempotency `messageId` cegah double-send. |
| EH-006 | `signingSecret` kosong saat enable | Tolak enable; wajib secret sebelum aktif. |

---

## 9. Edge Cases

| ID | Kasus | Penanganan |
|---|---|---|
| EC-001 | User kirim beberapa pesan beruntun | Satu webhook per pesan inbound (per `messageId`), berurutan best-effort (bukan strict-order; partner dedup by messageId). |
| EC-002 | Pesan non-teks (gambar/attachment) | `content` = caption bila ada, else placeholder tipe (`[image]`); `messageId` tetap dikirim. (ponytail: verifikasi kode = teks; media di luar use-case tapi tidak boleh crash.) |
| EC-003 | Nomor pengirim tidak dikenal partner | Bukan urusan SatuInbox; payload tetap terkirim apa adanya, partner yang memutuskan. |
| EC-004 | Webhook di-disable saat ada job `pending` di antrian | Job in-flight tetap diselesaikan; enqueue baru berhenti. (Atau: drop pending — default: selesaikan in-flight, dokumentasikan.) |
| EC-005 | `targetUrl` di-rotate saat retry berjalan | Retry berikutnya memakai `targetUrl` terkini dari config (bukan snapshot lama). |
| EC-006 | Sweeper re-enqueue pesan yang sebenarnya `delivered` | Atomic claim (`update where status=pending`) mencegah; hanya `pending` yang di-klaim. |

---

## 10. UI & UX Requirements

| Komponen | Behavior | Permission Gate | States |
|---|---|---|---|
| Section "Webhook" di **Company Settings** | Toggle enable + field URL + tombol Generate/Rotate Secret + dropdown Trigger Scope + toggle Suppress from Inbox + tombol Send Test | Admin (write), Supervisor (read) | disabled / enabled / testing / test-ok / test-failed |
| Field Signing Secret | Tampilkan hanya saat generate (one-time reveal); setelah itu masked, hanya bisa rotate | Admin | new / masked |
| Delivery Log (tabel) | List: waktu, messageId, status (delivered/failed), attempts, lastError, HTTP code | Admin, Supervisor (scoped) | empty / rows / loading |
| Test Event hasil | Inline banner sukses/gagal dengan HTTP code + response snippet | Admin | idle / success / error |

---

## 11. Field & Validation

| Field | Type | Validation | Default |
|---|---|---|---|
| `webhook.enabled` | boolean | — | false |
| `webhook.targetUrl` | string | required if enabled; `https://`; host bukan private/loopback/link-local; ≤2048 char | — |
| `webhook.signingSecret` | string (write-only) | required if enabled; ≥32 char (generated); disimpan encrypted | — |
| `webhook.triggerScope` | enum | `customer_inbound` (v1 hanya nilai ini) | `customer_inbound` |
| `webhook.suppressFromInbox` | boolean | — | false |
| `deliveryLog.messageId` | string | unik per pesan | — |
| `deliveryLog.status` | enum | `pending`/`delivered`/`failed` | `pending` |
| `deliveryLog.attempts` | int | 0..N | 0 |

---

## 12. API / Event Contract

### 12.1 Outbound webhook (SatuInbox → Partner)
```
POST <targetUrl>
Content-Type: application/json
X-Satuinbox-Signature: sha256=<hex hmac of raw body>
X-Satuinbox-Timestamp: <unix seconds>

{
  "event": "message.inbound",
  "phone": "+628123456789",
  "content": "483920",
  "messageId": "conv_msg_66f0a1b2c3",
  "accountChannelId": "ac_abc123",
  "companyId": "co_xyz789",
  "timestamp": "2026-09-15T04:12:33Z"
}
```
Partner MUST verify: `hmac_sha256(rawBody, signingSecret) == signature` DAN `|now - X-Satuinbox-Timestamp| ≤ 300s` (anti-replay). Partner MUST respond 2xx untuk menandai delivered; respons body diabaikan SatuInbox.

### 12.2 Config API (FE → api-gateway → company-service)
- `PUT /company/:id/webhook` — set config (Admin). Secret dikirim sekali; server simpan encrypted, tidak pernah dikembalikan.
- `POST /company/:id/webhook/rotate-secret` — rotate (Admin).
- `POST /company/:id/webhook/test` — kirim test event.
- `GET /company/:id/webhook/deliveries` — delivery log (paginated).

### 12.3 Internal event (behavior change)
Inbound message handler di `conversation-service` menambah satu langkah **async** setelah persist message: resolve config webhook **company** (dari companyId pesan), lalu publish `webhook.delivery.requested` ke RMQ (`satuinbox-exchange`) bila company opt-in + scope match. **Tidak** mengubah urutan/latency langkah existing (message persist, room update, SLA, socket emit). Consumer webhook-delivery baru menangani kirim + retry + state. Config di-cache untuk hindari lookup company-service di hot path.

---

## 13. Migration & Rollout Plan

| Stage | Aksi | Rollback |
|---|---|---|
| 1 | Deploy schema: `webhook` config di **company** (company-service) + `webhook_deliveries` collection. Additive, tidak mengubah data existing. | Drop collection baru (kosong). |
| 2 | Deploy consumer webhook-delivery + sweeper cron, **di belakang feature flag** `WEBHOOK_OUTBOUND_ENABLED=false`. | Flag off = engine idle. |
| 3 | Deploy FE setting section (read-only bila flag off). | Hide section. |
| 4 | Enable flag di 1 tenant pilot (Salfok). Smoke: test event → 200, kirim pesan asli → payload diterima + signature valid, matikan endpoint → retry+failed tercatat, restart RMQ dengan job pending → sweeper re-deliver. | Flag off; config non-destruktif tetap ada. |
| 5 | General availability. | Flag off per-tenant bila perlu. |

Smoke checks stage 4 = acceptance minimum sebelum GA.

---

## 14. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-001 [CRITICAL] | Inbound message path p95 latency MUST NOT naik >2% dari baseline (rolling 1h). |
| NFR-002 [CRITICAL] | p99 sama seperti NFR-001. |
| NFR-003 | Emisi webhook async; kegagalan komponen webhook MUST NOT memengaruhi ketersediaan message processing. |
| NFR-004 | Delivery p95 ≤5s dari pesan diterima (endpoint partner sehat). |
| NFR-005 | Semua secret disimpan encrypted (reuse `libs/security` field encryption). Secret tidak pernah muncul di log/response. |
| NFR-006 | Anti-SSRF pada `targetUrl` (FR-002) dievaluasi ulang saat resolve DNS sebelum tiap kirim (cegah rebinding). (ponytail: cek at-send, bukan hanya at-save.) |
| NFR-007 | Observability: metric `webhook_delivery_total{status}`, `webhook_delivery_latency_ms`, `webhook_retry_total`; alarm bila failure-rate >5% / 5m. |

---

## 15. Success Metrics

| KPI | Target | Window | Data source |
|---|---|---|---|
| Webhook delivery success (setelah retry) | ≥99.5% | rolling 7d | `webhook_deliveries` |
| Delivery latency p95 | ≤5s | rolling 24h | metric `webhook_delivery_latency_ms` |
| Message-path latency regression | ≤2% | rolling 1h | conversation-service p95/p99 |
| Signature-valid rate (partner-side) | 100% | per pilot | partner report / test event |

---

## 16. Limitations

- Single event type `message.inbound` saja (v1).
- Satu `targetUrl` per company (bukan multi-subscriber, bukan per-channel).
- Best-effort ordering, bukan strict FIFO per nomor.
- Tidak ada UI replay manual per delivery di v1 (sweeper otomatis saja).
- Media message: hanya caption/placeholder di `content`, bukan URL attachment.

---

## 17. Future Considerations

- Generic multi-event webhook platform (assignment, close, ticket lifecycle, contact update) — engine sudah extensible via field `event`.
- Multi-subscriber & per-channel enable/filter + per-event subscription.
- Manual replay / redrive delivery dari UI.
- Payload richer (attachment URL, contact metadata, conversation link).
- `triggerScope` tambahan (keyword-match, first-message-only).

---

## 18. Dependencies & Risks

### Dependencies
- `conversation-service` inbound message handler (titik trigger).
- `company-service` (owns company config webhook).
- RMQ `satuinbox-exchange` + `@nestjs/schedule` (sweeper) + `libs/security` (encrypt secret).
- Pola reliability `rmq-durable-outbound-queue` (DB source-of-truth + sweeper + idempotency).
- api-gateway (expose config endpoints).

### Risks
| ID | Risk | Severity | Mitigasi |
|---|---|---|---|
| R-1 | Emisi sinkron membebani hot path → regresi latency pesan | HIGH | Async fire-and-forget via RMQ; NFR-001/002 gate + alarm. |
| R-2 | Signature palsu → partner tertipu "user kirim kode" → bypass verifikasi | HIGH | HMAC wajib + timestamp anti-replay; secret write-only encrypted. |
| R-3 | Webhook hilang/telat → user gagal verifikasi walau benar | HIGH | Retry backoff + DB source-of-truth + sweeper re-deliver. |
| R-4 | Company-level = SEMUA inbound semua channel ter-push (chat CS biasa bocor + noise + volume naik) | **HIGH** | `triggerScope=customer_inbound` wajib + partner filter via `accountChannelId` + rekomendasi company dedicated verifikasi atau `suppressFromInbox` (OQ-05). |
| R-5 | SSRF via `targetUrl` ke internal | MEDIUM | Validasi at-save + at-send (NFR-006). |
| R-6 | Double-send saat retry/sweeper | MEDIUM | Idempotency `messageId` + atomic claim. |
| R-7 | Inbound verifikasi mencemari FRT/volume metric | LOW–MEDIUM | `suppressFromInbox` opsional (FR-011). |

---

## 19. Appendix — Open Questions (ASSUMED defaults, PM boleh koreksi)

| ID | Question | ASSUMED default in this PRD |
|---|---|---|
| OQ-01 | Payload minimal? | `{phone, content}` + metadata `{timestamp, messageId, accountChannelId, companyId}` |
| OQ-02 | Trigger scope? | `customer_inbound` (exclude agent/system/outbound) |
| OQ-03 | Retry & timeout? | 10s timeout, 5x exp backoff (1s/5s/30s/2m/10m), at-least-once |
| OQ-04 | Conversation muncul di inbox? | Default muncul; `suppressFromInbox` opsional |
| OQ-05 | Company dedicated verifikasi vs campur CS? | ASSUMED dedicated / `suppressFromInbox` bila campur |
| OQ-06 | Volume puncak? | ASSUMED <10 msg/s |

**Agent execution contract:** authoritative source = brief v1.1 + PRD ini; on conflict, brief menang untuk scope, PRD menang untuk detail requirement. Jangan menyentuh urutan/latency langkah inbound existing (protected). Setiap FR diverifikasi lewat smoke check §13 stage 4 + metric §15. Stop & escalate ke PM bila: company ternyata dipakai campur CS + verifikasi tanpa suppress (OQ-05), atau partner minta jalur balik (di luar scope brief).
