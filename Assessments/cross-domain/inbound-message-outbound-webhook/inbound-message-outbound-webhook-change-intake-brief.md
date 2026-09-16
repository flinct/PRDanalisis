# Change Intake Brief: Inbound Message → Outbound Webhook (Partner Verification Relay)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi user 2026-09-15 (use-case: partner e-com "Salfok" verifikasi user via kode yang dikirim user ke nomor WA SatuInbox)
> **Artifact Path:** `Assessments/cross-domain/inbound-message-outbound-webhook/inbound-message-outbound-webhook-change-intake-brief.md`
> **Version:** `v1.1`
> **Previous Version:** `v1.0` (inline, lihat Change Log)
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/task-router.md`, `Rules/core/analysis-and-risk.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Assessments/cross-domain/rmq-durable-outbound-queue/rmq-durable-outbound-queue-change-intake-brief.md`
> **Tanggal Intake:** 2026-09-15
> **Status:** Ready for PRD

---

## 0. Ringkasan Update Brief

- **v1.1 (2026-09-15):** Koreksi user — konfigurasi webhook di **company level**, BUKAN per account-channel. Satu webhook per company, meliputi semua account-channel milik company. `accountChannelId` di payload jadi wajib (partner filter sendiri channel relevan). Config owner pindah: channel-service → **company-service**. Per-channel filter = out of scope (Future).
- Initial version.
- Scope dikunci ke **satu arah**: SatuInbox push webhook keluar saat menerima inbound message pada **company** yang di-opt-in. Partner memvalidasi sendiri; **tidak ada** jalur kirim-balik / API call dari partner (dikonfirmasi user 2026-09-15).
- Risiko ToS WhatsApp (blast OTP via WA Web) **gugur** — SatuInbox hanya menerima, tidak mengirim OTP.
- Fondasi infra reuse pola `rmq-durable-outbound-queue` (DB-as-source-of-truth + sweeper + idempotency) untuk delivery guarantee webhook.

---

## 1. Request Snapshot

**Request Summary:**
Partner e-com (Salfok) memakai WhatsApp SatuInbox sebagai kanal verifikasi. Alur: partner menampilkan kode verifikasi ke user di aplikasi e-com → user mengirim kode itu via WhatsApp ke nomor Salfok yang sudah discan di SatuInbox → saat inbound diterima, SatuInbox mengirim **webhook** berisi `{nomor pengirim, isi pesan}` ke endpoint Salfok → Salfok mencocokkan nomor + kode untuk verifikasi. Tidak ada respons balik ke SatuInbox.

**Business Problem:**
SatuInbox belum punya mekanisme **outbound webhook** (push event inbound ke sistem pihak ketiga). Semua webhook existing bersifat inbound (Meta/WA Cloud → SatuInbox). Partner yang ingin bereaksi terhadap pesan masuk tidak punya jalur event-driven; harus polling Open API (mahal, lambat, tidak real-time).

**Target User / Role / Stakeholder:**
Partner integrator (Salfok, dan partner sejenis ke depan), Admin/Supervisor tenant (yang mengaktifkan + mengonfigurasi webhook per account-channel), user akhir (yang verifikasi), Tech Lead/BE (owner infra).

**Expected Outcome:**
Saat account-channel yang di-opt-in menerima inbound message, SatuInbox mengirim HTTP POST tertandatangan (HMAC) ke URL partner dengan payload minimal `{nomor, content}` + metadata (timestamp, messageId, accountChannelId), dengan retry + delivery guarantee, tanpa membebani jalur pesan existing.

**Urgency / Why Now:**
Ada partner riil (Salfok) dengan use-case verifikasi konkret — bukan spekulasi. Demand level **L3** (workflow blocker: tanpa webhook, verifikasi partner tidak bisa jalan).

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `NEW_CAPABILITY` (outbound webhook engine — belum ada di platform) |
| Primary Domain | `Cross-domain` (Platform/Integration; trigger di conversation-service inbound path, config lintas account-channel) |
| Request Shape | Add |
| Initial Complexity Signal | High |
| Needs Split? | No — satu capability tunggal, satu arah. (Fitur ini disengaja di-scope sempit; generic partner-webbook platform = Future.) |

### Classification Rationale
- Fitur baru murni: platform belum punya outbound webhook sama sekali (evidence: `Memory/CLAUDE-be.md` — semua webhook existing = inbound dari Meta/WA/IG/Messenger).
- Menyentuh jalur inbound message (hot path, lintas channel) → blast radius + zero-perf constraint → wajib Phase 0 + analysis-and-risk.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | Tidak ada. Grep `PRD/` untuk webhook/outbound/verif = 0 match relevan (hanya inbound WA-API webhook). |
| PRD status | Not found |
| PRD treatment candidate | New PRD (Platform/Integration reliability) |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Not found | Belum ada UI konfigurasi outbound webhook. Perlu setting per account-channel (URL, secret, enable, scope). |
| BE | Not found (outbound push) | `Memory/CLAUDE-be.md`: webhook yang ada = `webhook/whatsapp-api`, IG/Messenger/Meta = **inbound receiver**. Tidak ada outbound-push engine. Partner Open API (`/open-api/docs`, auth `x-signature-key`) = **pull**, bukan push. |
| Runtime / Current Behavior | Inbound message diproses di `conversation-service` (owns conversations, messages; per-channel routing). Tidak ada emisi event keluar ke sistem eksternal. | `Memory/CLAUDE-be.md` |

### 3.3 Related Sources
- `Memory/global-memory.md`: canonical product rules (contact = phone unique, inbound → conversation/room).
- `Memory/CLAUDE-be.md`: arsitektur BE — api-gateway satu-satunya pintu publik; conversation-service `:50055`; RMQ `satuinbox-exchange`; mTLS wajib internal; `@nestjs/schedule` + delayed queue tersedia untuk sweeper.
- `Assessments/cross-domain/rmq-durable-outbound-queue/...`: pola reliability (DB source-of-truth + atomic claim + sweeper + idempotency) yang **direuse** untuk delivery guarantee webhook ini.

---

## 4. Scope Boundary

### 4.1 In Scope
- Outbound webhook engine: kirim HTTP POST ke URL partner saat inbound message diterima pada account-channel mana pun milik **company** yang di-opt-in.
- Konfigurasi **per company** (company-service): `enabled`, `targetUrl`, `signingSecret`, `triggerScope`, `suppressFromInbox`. Berlaku untuk SEMUA account-channel milik company.
- Payload minimal `{ phone, content }` + metadata `{ timestamp, messageId, accountChannelId, companyId }`.
- Keamanan: HMAC-SHA256 signature header (`X-Satuinbox-Signature`) + timestamp anti-replay.
- Reliability: at-least-once, retry exponential backoff, timeout terbatas, idempotency key (`messageId`), delivery state persist di DB, sweeper re-deliver yang gagal — reuse pola RMQ durable outbound.
- Suppress/route: keputusan apakah conversation dari account-channel webhook-only ini muncul di inbox agent (default: tetap muncul; opsi suppress via flag).
- Observability: log delivery attempt, status, latency; metric gagal-kirim.

### 4.2 Out of Scope
- Jalur kirim-balik / partner → SatuInbox untuk mengirim pesan (dikonfirmasi tidak perlu). Partner validasi sendiri.
- SatuInbox mengirim OTP/kode ke user (SatuInbox hanya menerima; kode digenerate & ditampilkan oleh partner).
- Generic multi-event partner webhook platform (assignment, close, ticket events, dsb) — Future.
- Per-channel enable/filter (Future) — payload membawa `accountChannelId`, partner filter sendiri; redesign Open API pull.
- Matching identitas nomor↔akun partner (itu logika partner, bukan SatuInbox).

### 4.3 Protected Existing Behavior
- Jalur inbound message existing (conversation/room creation, assignment, SLA T1 `firstCustomerMessageAt`) **tidak boleh** berubah semantik atau bertambah latency signifikan (zero-perf constraint user).
- Emisi webhook harus **async / out-of-band** — kegagalan kirim webhook tidak boleh menggagalkan atau memperlambat pemrosesan pesan masuk.
- mTLS internal RMQ tidak boleh dilonggarkan.
- Socket/event update ke Chat List existing tidak boleh terganggu.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Entity baru: konfigurasi webhook di company (company-service) + delivery-log collection (state `pending`/`delivered`/`failed`). |
| RBAC / visibility / assignment | Yes | Siapa boleh konfigurasi webhook (URL + secret = sensitif) → Admin only. Inbound verifikasi bisa memunculkan conversation ke agent (perlu keputusan suppress). |
| API / webhook / socket / queue / cron | Yes | Outbound webhook baru, RMQ queue delivery, cron sweeper retry. Signature verification contract untuk partner. |
| SLA / reporting / export | Yes (indirect) | Inbound verifikasi tetap set T1 SLA & masuk metrik conversation kalau tidak disuppress → bisa mencemari FRT/volume metric. |
| Migration / rollback / feature flag | Yes | Config collection baru + delivery-log; engine di belakang feature flag; rollback = disable flag (config tetap, tidak destruktif). |
| Existing regression scope | Yes | Jalur inbound semua channel yang share consumer; conversation creation; SLA T1; Chat List socket update. |

### Early Blast-Radius Notes
- Trigger di hot path inbound → wajib **fire-and-forget async** (enqueue ke RMQ, jangan blocking). Sinkron = risiko latency + kegagalan pesan masuk.
- Signature wajib: tanpa HMAC, penyerang bisa memalsukan "user X kirim kode Y" ke endpoint partner → bypass verifikasi. Ini **security boundary**, non-negotiable.
- Reliability = keamanan verifikasi di sini: webhook hilang/telat → user gagal verifikasi walau benar. Retry + sweeper wajib, bukan optional.
- Scoping trigger: company-level berarti SEMUA inbound semua channel ter-push, termasuk chat CS biasa → volume + kebocoran data lebih besar dari desain per-channel. `triggerScope` + partner-side filter via `accountChannelId` wajib; risiko data-leak naik ke HIGH.
- Idempotency: retry/sweeper bisa kirim ganda → partner harus bisa dedup via `messageId`; SatuInbox harus jamin `messageId` stabil per pesan.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_NEW_PRD` |
| Recommended Next Rules | `Rules/core/requirements.md`, `Rules/core/analysis-and-risk.md`, `Rules/core/test-design.md` |
| Recommended Next Artifact | PRD (Platform/Integration) — file ini langsung dilanjutkan ke PRD di sesi yang sama |
| Can Proceed to PRD? | Yes |

### Routing Rationale
- Scope sudah dikunci satu arah + 4 keputusan default sudah di-set (lihat §7, semua `ASSUMED` bisa dikoreksi PM). User meminta "buat PRD langsung" → proceed dengan default engineering-pragmatic, flag ASSUMED di PRD.
- Fitur greenfield (tidak ada PRD/impl existing) → New PRD, bukan patch.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Default (ASSUMED) | Why It Matters | Blocking? | Owner |
|----|----------------|-------------------|----------------|-----------|-------|
| OQ-01 | Payload webhook cukup `{phone, content}` atau perlu metadata tambahan? | `{phone, content, timestamp, messageId, accountChannelId, companyId}` | metadata perlu untuk scoping + idempotency partner-side | No (default aman) | PM / Partner |
| OQ-02 | Scope trigger: semua inbound atau hanya customer message pertama / semua customer inbound? | Semua **inbound customer message** pada account-channel yang di-opt-in (exclude agent/system/outbound) | mencegah push chat CS biasa + noise | No | PM |
| OQ-03 | Reliability: retry policy & timeout? | Timeout 10s; retry exp backoff 5x (1s/5s/30s/2m/10m); at-least-once + idempotency `messageId` | webhook = jalur kritikal verifikasi | No | BE |
| OQ-04 | Conversation verifikasi muncul di inbox agent atau disuppress? | Default **muncul** (tetap conversation normal); flag `suppressFromInbox` opsional per config | dedicated-vs-shared nomor menentukan noise + SLA metric | Yes (jika nomor shared dengan CS) | PM |
| OQ-05 | Nomor account-channel ini dedicated untuk verifikasi atau shared dengan CS normal? | ASSUMED dedicated | menentukan OQ-04 + apakah T1 SLA harus di-exclude | Yes | PM / Partner |
| OQ-06 | Volume inbound puncak (msg/s) untuk kalibrasi retry & kapasitas? | ASSUMED rendah (<10/s) | validasi zero-perf + sizing queue | No | BE / PM |

> Catatan: OQ-04 & OQ-05 ditandai Blocking hanya bila nomor **shared** dengan CS. Karena user mengonfirmasi flow verifikasi dedicated, default ASSUMED dipakai; PM tetap bisa mengoreksi.

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Scope lock + konfirmasi OQ-04/05 | Pending | |
| Partner (Salfok) | Konfirmasi payload + endpoint + signature contract | Pending | OQ-01, OQ-03 |
| BE / Tech Lead (Naftal Yunior) | Sanity check arah teknis (async emit, reuse RMQ outbox, sweeper) | Pending | zero-perf gate |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Platform/PRD Platform - Inbound Message Outbound Webhook.md` | source scope, change class, current-state baseline, default decisions |
| Assessment Report | `Assessments/cross-domain/inbound-message-outbound-webhook/` | protected behavior, blast radius, routing rationale |
| QA Pre-Implementation Review | TBD | impact flags, protected behavior (async emit, zero-perf, SLA T1) |
| QA Post-Implementation Validation | TBD | validasi: no message-path latency regression, no missed delivery, signature valid, no double-send |
| Reliability reuse | `Assessments/cross-domain/rmq-durable-outbound-queue/` | pola DB source-of-truth + sweeper + idempotency |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-09-15 | Initial brief dari diskusi Salfok verification webhook; scope dikunci satu arah, 6 OQ dengan default ASSUMED | Analyst |
| 2026-09-15 | v1.1 — webhook config pindah ke company level (koreksi user); owner config = company-service; `accountChannelId` payload jadi wajib; per-channel filter out of scope (Future) | Analyst |
