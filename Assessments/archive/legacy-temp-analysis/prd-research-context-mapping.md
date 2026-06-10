# Analisa: Research Context Mapping ke PRD Account Channel Event Log

> **Type:** Scope Clarification + Research Dependency Analysis
> **Input:** User goals statement + research items
> **Target:** Identifikasi apa yang masuk PRD v1.3 vs research track vs track terpisah
> **Rules Applied:** `qa-analysis-rule.md`, `impact-analysis-rule.md`
> **Tanggal:** 2026-06-02

---

## 1. Input User — 5 Item

| # | Item | Tipe |
|---|------|------|
| R-01 | Tim developer harus research untuk stability penggunaan Baileys | Research task |
| R-02 | Harus nyoba broadcast manual di WA Web / dari HP. A/B testing: broadcast ke nomer baru/tidak dikenal di SatuInbox vs WhatsApp langsung. Cek apakah sama-sama suspend atau tidak. | Research task + test |
| R-03 | Rate limit outbound conversation? | Technical question → PRD input |
| R-04 | Logging suspend nya kenapa | PRD requirement → event log |
| R-05 | Broadcast tidak muncul di conversation (dari 5 BC hanya 4 yang jadi conversation), tidak tahu apakah di-broadcast bersamaan atau tidak | Bug/investigation — track terpisah |

---

## 2. Mapping ke PRD Event Log

### R-01: Research Stability Baileys → PRD Dependency

**Relasi ke PRD:** Research ini adalah **prerequisite** sebelum `DisconnectReasonEnum` dan `SUSPENDED` event bisa didefinisikan secara lengkap.

PRD v1.2 sudah menyebut di Section 13 (Dependencies & Risks):
> "Changes may affect critical reconnect/auto-restore flow."

Tapi PRD belum mencatat bahwa stability research adalah **blocker untuk finalisasi reason enum**. Ini perlu ditambahkan ke Section 13 dan Section 18 Open Questions.

**Yang perlu masuk PRD v1.3:**
- Section 13: tambahkan risk baru — "Disconnect dan suspend reason taxonomy belum final karena Baileys stability behavior belum diresearch. Enum mungkin perlu update setelah research selesai."
- Section 18: tambahkan OQ-NEW-03 — "Apa saja disconnect/suspend reason yang dihasilkan Baileys dalam kondisi nyata? Diperlukan dari hasil research R-01 dan R-02."

---

### R-02: A/B Testing Broadcast → DisconnectReasonEnum + SUSPENDED

**Relasi ke PRD:** Ini adalah test untuk memahami **apakah broadcast ke nomer tidak dikenal memicu suspension**. Hasilnya langsung menentukan apakah `DisconnectReasonEnum` perlu nilai baru seperti `BROADCAST_SPAM` atau `RATE_LIMIT_EXCEEDED`.

**Skenario yang sedang diinvestigasi:**

```
SatuInbox broadcast 
  → kirim ke nomer baru/tidak dikenal
  → apakah trigger: DISCONNECTED? SUSPENDED? atau tidak ada?

WhatsApp langsung dari HP (control)
  → kirim ke nomer baru
  → apakah trigger: banned/suspended di WA side?

A/B comparison:
  → apakah behavior sama antara SatuInbox dan WhatsApp native?
  → apakah platform SatuInbox memperburuk risiko suspend?
```

**Implikasi ke PRD jika hasil A/B menunjukkan broadcast memicu suspend:**

Saat ini `DisconnectReasonEnum` di PRD Appendix 19.2 adalah:
```
LOGOUT_MANUAL, TIMEOUT, CONFLICT, BANNED, CONNECTION_LOST, AUTO_SUSPEND, UNKNOWN
```

Perlu ditambahkan:
- `BROADCAST_ABUSE` — akun di-flag/suspend karena pola broadcast ke nomer tidak dikenal
- `RATE_LIMIT_EXCEEDED` — akun di-throttle/suspend karena melebihi rate limit WhatsApp

**Yang perlu masuk PRD v1.3:**
- Appendix 19.2: catat bahwa enum ini **pending finalisasi** dari hasil research R-01/R-02. Tambahkan placeholder reasons.
- Section 13: tambahkan risk — "Suspend reason taxonomy mungkin tidak lengkap sebelum R-02 A/B test selesai."

---

### R-03: Rate Limit Outbound Conversation → PRD Section Baru

**Relasi ke PRD:** Rate limit outbound adalah salah satu penyebab potensial DISCONNECTED atau SUSPENDED yang **belum ada di PRD**. Ini bukan hanya reason enum — ini bisa jadi **event metadata** atau bahkan **event type tersendiri** jika rate limit perlu di-track secara granular.

**Dua skenario:**

**Skenario A — Rate limit sebagai disconnect reason:**
```
Account channel kirim pesan terlalu banyak/cepat
  → WhatsApp rate limit → session terputus
  → Event: DISCONNECTED { reason: RATE_LIMIT_EXCEEDED }
```

**Skenario B — Rate limit sebagai degraded state (sebelum disconnect):**
```
Account channel mendekati rate limit
  → WhatsApp throttle (pesan delay, tapi tidak disconnect)
  → Account masih CONNECTED tapi degraded
  → Event: ??? (tidak ada di PRD saat ini)
```

Skenario B tidak bisa di-capture oleh event log saat ini karena tidak ada state "degraded/throttled" di state machine.

**Yang perlu masuk PRD v1.3:**
- Appendix 19.2: tambahkan `RATE_LIMIT_EXCEEDED` ke `DisconnectReasonEnum`
- Section 18: tambahkan OQ-NEW-04 — "Apakah rate limit WhatsApp menghasilkan disconnect langsung atau throttled state? Jika throttled state, apakah perlu event baru atau cukup metadata di CONNECTED event?"
- FR-005 Note: tambahkan bahwa DISCONNECTED reason `RATE_LIMIT_EXCEEDED` harus bisa di-detect dari Baileys error signal

---

### R-04: Logging Suspend Kenapa → Core PRD Requirement

**Relasi ke PRD:** Ini adalah **inti dari tujuan event log** — dan langsung menjawab mengapa `SUSPENDED` event perlu `reason` field yang detail.

PRD v1.2 sudah punya:
- `SUSPENDED` event di Section 5
- `reason` field (conditional) di Section 9
- `DisconnectReasonEnum` di Appendix 19.2 (untuk DISCONNECTED)

**Gap yang belum ada:** PRD tidak mendefinisikan **`SuspendReasonEnum`** terpisah untuk event `SUSPENDED`. Saat ini hanya `DisconnectReasonEnum` yang ada.

Bedanya:
- `DisconnectReasonEnum` = mengapa koneksi Baileys terputus (TIMEOUT, CONFLICT, BANNED, dll.)
- `SuspendReasonEnum` = mengapa akun channel disuspend oleh sistem/admin SatuInbox (berbeda dari WhatsApp ban)

**SuspendReason yang mungkin berdasarkan R-01/R-02/R-03:**

| Reason | Deskripsi |
|--------|-----------|
| `ADMIN_MANUAL` | Admin sengaja suspend akun dari Settings |
| `BROADCAST_ABUSE_DETECTED` | Sistem deteksi pola broadcast berisiko |
| `RATE_LIMIT_EXCEEDED` | Akun melebihi batas outbound yang dikonfigurasi |
| `POLICY_VIOLATION` | Akun melanggar kebijakan platform (future) |
| `ACCOUNT_BANNED_BY_WA` | Nomor di-ban oleh WhatsApp (dari Baileys BANNED signal) |
| `INACTIVITY` | Auto-suspend karena tidak aktif dalam periode tertentu (future) |
| `SYSTEM_POLICY` | Auto-suspend oleh policy engine (future: anti-spam system) |
| `UNKNOWN` | Tidak bisa diidentifikasi |

**Yang perlu masuk PRD v1.3:**
- Appendix baru (19.4): `SuspendReasonEnum` terpisah dari `DisconnectReasonEnum`
- Section 9 Field: `reason` untuk event `SUSPENDED` menggunakan `SuspendReasonEnum` (berbeda dari `DisconnectReasonEnum` untuk DISCONNECTED)
- FR-006: update untuk mencantumkan bahwa SUSPENDED event MUST include reason from `SuspendReasonEnum` when available
- Section 18: OQ-NEW-03 (apa saja suspend reason yang muncul dari research?)

---

### R-05: Broadcast Tidak Muncul di Conversation → Track Terpisah

**Relasi ke PRD Event Log:** Ini adalah **bug/investigasi terpisah** dari event log account channel. Broadcast yang tidak menjadi conversation adalah masalah di:
- `broadcast-service` (delivery logic)
- `conversation-service` (inbound message processing)
- Bukan di `channel-service` atau `whatsapp-service` account channel lifecycle

**Tidak ada yang perlu masuk PRD Account Channel Event Log.**

Namun ada **indirect relation**: jika 1 dari 5 broadcast tidak terkirim, ini bisa jadi signal bahwa account channel dalam kondisi degraded (rate limited, session unstable). Event log account channel bisa membantu investigate apakah ada DISCONNECTED atau SUSPENDED di waktu yang bersamaan.

**Yang perlu dilakukan:**
- Buat issue/ticket terpisah: "Broadcast tidak muncul di conversation (4/5 success rate)"
- Investigasi apakah timing broadcast failure berkorelasi dengan event log account channel
- Pertanyaan: apakah 5 broadcast dikirim dari 1 akun yang sama? Jika ya, rate limit bisa jadi penyebab.

---

## 3. Research Task List untuk Developer

Berdasarkan analisa, berikut research tasks yang perlu dilakukan **sebelum PRD v1.3 bisa di-finalize**:

### RES-01: Baileys Stability Research [HIGH PRIORITY]
**Apa:** Investigasi semua error/disconnect signal yang dihasilkan Baileys dalam kondisi nyata
**Output yang dibutuhkan:**
- List lengkap `lastDisconnect.error` dari Baileys dengan mapping ke behavior (rate limit, ban, conflict, dll.)
- Apakah Baileys punya explicit "rate limit" signal atau hanya generic error?
- Apakah ada pre-disconnect signal (warning) sebelum koneksi benar-benar putus?

**Cara:** Review Baileys source code (`@whiskeysockets/baileys`) error handling + test di staging

---

### RES-02: A/B Testing Broadcast Suspension [HIGH PRIORITY]
**Apa:** Test apakah broadcast ke nomer tidak dikenal memicu suspension, dan apakah SatuInbox vs WhatsApp native berbeda
**Setup:**
```
Test A (SatuInbox):
  1. Akun baru di SatuInbox
  2. Broadcast ke 20-50 nomer tidak dikenal
  3. Monitor: apakah akun disconnect/suspend? Berapa lama?
  4. Catat: error message dari Baileys

Test B (WhatsApp native dari HP):
  1. Akun berbeda (fresh)
  2. Kirim manual ke 20-50 nomer tidak dikenal
  3. Monitor: apakah banned/suspended di WhatsApp side?
  4. Compare dengan Test A

Observasi:
  - Apakah behavior sama?
  - Apakah ada rate/timing yang aman?
  - Apakah volume yang sama memicu suspend di SatuInbox tapi tidak di HP native?
```
**Output yang dibutuhkan:**
- Hasil perbandingan A vs B
- Rate limit threshold (jika ada)
- Suspend reason yang muncul dari Baileys

---

### RES-03: Rate Limit Outbound Investigation [MEDIUM PRIORITY]
**Apa:** Investigasi apakah ada rate limit outbound conversation yang perlu dikonfigurasi atau dimonitor
**Yang perlu dijawab:**
1. Apakah WhatsApp (via Baileys) punya dokumentasi rate limit?
2. Apakah sudah ada implementasi rate limit di `whatsapp-service` atau `broadcast-service`?
3. Apakah rate limit menghasilkan explicit error/disconnect atau silent throttle?
4. Berapa message per menit/jam yang "aman"?

---

### RES-04: Broadcast-Conversation Gap Investigation [MEDIUM PRIORITY]
**Apa:** Dari 5 broadcast, hanya 4 yang menjadi conversation. Investigasi mengapa.
**Yang perlu dicek:**
1. Apakah 5 broadcast dikirim dari 1 akun yang sama atau berbeda?
2. Apakah ada log di `broadcast-service` untuk delivery failure?
3. Apakah ada log di `whatsapp-service` untuk message yang tidak terkirim?
4. Apakah timing broadcast sama (bulk bersamaan) atau berurutan?
5. Apakah nomer penerima valid semua?

**Catatan:** Ini investigation terpisah, bukan bagian PRD event log. Tapi hasilnya bisa inform rate limit behavior.

---

## 4. Perubahan PRD v1.3 yang Diperlukan dari Context Ini

### Mandatory

| # | Perubahan | Section |
|---|-----------|---------|
| M-11 | Tambah `SuspendReasonEnum` terpisah dari `DisconnectReasonEnum` | Appendix baru 19.4 |
| M-12 | Update FR-006: SUSPENDED event MUST include `suspendReason` dari `SuspendReasonEnum` | Section 7 |
| M-13 | Update Section 9 field: `reason` untuk SUSPENDED menggunakan `SuspendReasonEnum` | Section 9 |
| M-14 | Tambah `RATE_LIMIT_EXCEEDED` ke `DisconnectReasonEnum` (Appendix 19.2) | Section 19.2 |
| M-15 | Tambah risk di Section 13: disconnect/suspend reason taxonomy belum final | Section 13 |
| M-16 | Catat bahwa Appendix 19.2 dan 19.4 pending finalisasi dari research R-01/R-02 | Section 13 / 18 |

### Open Questions Baru

| OQ ID | Pertanyaan | Owner | Priority |
|-------|-----------|-------|----------|
| OQ-NEW-03 | Apa saja disconnect/suspend reason dari Baileys dalam kondisi nyata? Butuh dari hasil RES-01 + RES-02 | Engineering | **BLOCKER untuk finalisasi enum** |
| OQ-NEW-04 | Rate limit outbound: apakah disconnect langsung atau throttled state? | Engineering | HIGH |
| OQ-NEW-05 | Apakah rate limit perlu event/metadata khusus di event log, atau cukup sebagai reason? | PM + Engineering | MEDIUM |

---

## 5. Track Diagram

```
PRD Account Channel Event Log v1.3
  ├── RE_INIT event (dari analisa sebelumnya)
  ├── SuspendReasonEnum (dari R-04)
  ├── RATE_LIMIT_EXCEEDED di DisconnectReasonEnum (dari R-03)
  ├── OQ-NEW-03, OQ-NEW-04, OQ-NEW-05 (pending research)
  └── Pending: finalisasi enum setelah RES-01 + RES-02 selesai

Research Track (Engineering — prerequisite PRD finalization)
  ├── RES-01: Baileys stability + error signal mapping
  ├── RES-02: A/B testing broadcast suspension
  ├── RES-03: Rate limit outbound investigation
  └── RES-04: Broadcast-conversation gap (4/5 issue)

Separate Track (bukan bagian PRD event log)
  └── Bug: Broadcast tidak muncul di conversation
```

---

## 6. Recommendation

PRD v1.3 perlu memuat:
1. **RE_INIT** event (dari analisa gap goals)
2. **SuspendReasonEnum** terpisah dari DisconnectReasonEnum — suspend oleh sistem/admin berbeda dari disconnect oleh Baileys
3. **RATE_LIMIT_EXCEEDED** di DisconnectReasonEnum
4. **Catatan eksplisit** bahwa reason enums pending finalisasi dari hasil RES-01 + RES-02

Developer tidak bisa mulai implementasi SUSPENDED dan DISCONNECTED reason mapping **sebelum RES-01 dan RES-02 selesai** — karena tanpa tahu apa signal yang dihasilkan Baileys di kondisi nyata, implementasi mapping akan spekulatif dan mungkin salah.

**Urutan eksekusi yang disarankan:**
```
1. Engineering mulai RES-01 (Baileys error signal mapping) — 1-2 hari
2. Engineering jalankan RES-02 (A/B test broadcast) — 1-2 hari, parallel dengan RES-01
3. Update PRD v1.3 dengan hasil research → finalisasi enum
4. Sprint planning dengan PRD final
5. Implementasi
```
