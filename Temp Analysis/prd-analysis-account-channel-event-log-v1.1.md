# QA Analysis: PRD Account Channel Event Log v1.1

> **Analysis Type:** Type 1 — Feature Development Analysis (Re-analysis dari v1.0)
> **Source PRD:** `PRD/Whatsapp web v2/PRD WA Web Account Channel Event Log.md` v1.1
> **Rules Applied:** `qa-analysis-rule.md`, `impact-analysis-rule.md`, `workflow-rule.md`
> **Reference Memory:** `global-memory.md`, `whatsapp-web-v1-vs-v2-comparison.md`, `CLAUDE-be.md`, `CLAUDE-fe.md`
> **Analisa Sebelumnya:** `Temp Analysis/prd-analysis-account-channel-event-log.md` (v1.0)
> **Tanggal Analisa:** 2026-06-02

---

## Ringkasan Perubahan v1.0 → v1.1

Revision history PRD menyatakan v1.1 menutup 7 gap QA:
> "Closed QA gaps: connection session architecture, event status semantics, dedup window, idempotency key format, Supervisor RBAC dependency, metadata whitelist, and global endpoint Phase 1 scope."

### Status Gap dari Analisa v1.0

| Gap v1.0 | Deskripsi | Status di v1.1 |
|----------|-----------|----------------|
| GAP-01 | `connectionSessionId` architecture tidak dispesifikasikan | ✅ CLOSED — Section 9.1 baru |
| GAP-02 | `event_status: FAILED/SKIPPED` semantik ambigu | ✅ CLOSED — Section 9.3 baru |
| GAP-03 | Dedup window value tidak didefinisikan | ✅ CLOSED — FR-025: default 5s, env var `ACCOUNT_CHANNEL_DISCONNECT_DEDUP_WINDOW_MS` |
| GAP-04 | `idempotency_key` format tidak lengkap | ✅ CLOSED — Section 9.2 baru (dengan catatan — lihat NEW-GAP-01) |
| GAP-05 | Supervisor RBAC cross-service dependency | ✅ CLOSED — FR-021 diupdate + Section 13 ditambah |
| GAP-06 | `metadata` whitelist tidak didefinisikan | ✅ CLOSED — FR-030 baru + Section 9.4 whitelist table |
| GAP-07 | Global endpoint Phase 1 scope ambigu | ✅ CLOSED — Section 17 Limitations ditambah |

**Semua 7 gap dari v1.0 sudah ditutup di v1.1.** Analisa ini fokus pada gap baru yang ditemukan dari konten yang ditambahkan.

---

## 1. Overview

Sama dengan v1.0. Tidak ada perubahan pada Overview, Problem Statement, Objectives, Event Definitions, User Stories, dan sebagian besar FR.

Konten utama yang **ditambahkan** di v1.1:
- Section 9.1: Connection Session Architecture
- Section 9.2: Idempotency Key Format
- Section 9.3: Event Status Semantics
- Section 9.4: Metadata Whitelist
- FR-021 diupdate (Supervisor RBAC)
- FR-025 diupdate (dedup window + env var)
- FR-030 baru (metadata allowlist)
- Section 13: 2 risk baru ditambahkan
- Section 17: 1 limitation baru (global endpoint)

---

## 2. Analisa Konten Baru v1.1

### 2.1 Section 9.1 — Connection Session Architecture

Secara keseluruhan **solid dan well-specified**. Beberapa temuan:

**✅ Benar:**
- whatsapp-service sebagai owner `connectionSessionId` — tepat, karena ia source of truth Baileys
- Redis key `evt:session:{accountChannelId}` — namespace jelas
- Orphan handling dengan `metadata.orphan = true` — graceful
- Auto-restore `metadata.trigger = auto_restore` — konsisten dengan edge case EC-004

**⚠️ Temuan 1 — Session key TTL tidak memiliki practical fallback [NEW-GAP-01]**

PRD menyatakan:
> "Session key TTL MUST be configurable via `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS`. Default SHOULD be aligned with retention policy. **If retention is not confirmed, the key SHOULD be cleaned up on disconnect/delete rather than relying on short TTL.**"

**Masalah:** Jika whatsapp-service crash di tengah sesi aktif dan restart **tanpa** auto-restore (atau Baileys gagal reconnect), `DISCONNECTED` tidak pernah diemit — Redis session key `evt:session:{accountChannelId}` tidak pernah dihapus. Tanpa TTL, key ini **persist selamanya** di Redis.

Saat akun kemudian di-init ulang dan Baileys emit `CONNECTED` lagi, Section 9.1 menyatakan: *"If `evt:session:{accountChannelId}` already exists, system MUST NOT create a new active session unless the previous session has been closed."* → **New CONNECTED diblok karena stale key dari crash sebelumnya.**

Ini adalah **dead-lock scenario**: stale key → CONNECTED baru tidak bisa dibuat → lifetime tidak bisa dihitung → event log tidak dapat berfungsi.

**Rekomendasi:** Tetapkan fallback TTL pragmatis (misal 7 hari) yang independent dari retention policy. Ini jauh lebih besar dari session wajar normal, sehingga tidak akan memotong sesi aktif, tapi cukup untuk membersihkan stale key pasca crash.

```
ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS default = 7 * 24 * 60 * 60 * 1000  # 7 hari
```

**⚠️ Temuan 2 — Tidak ada mekanisme staleness detection untuk session key aktif [NEW-GAP-02]**

Berkaitan dengan GAP-01 di atas. Section 9.1 mendefinisikan *"Duplicate `CONNECTED` while active → Do not create new session"* tapi tidak mendefinisikan **kapan sebuah session key dianggap stale**.

Scenario: Redis key `evt:session:{accountChannelId}` ada (connectedAt = 5 hari lalu), tapi akun sudah disconnect secara paksa (server restart, Redis restart, dsb.) tanpa DISCONNECTED event terkirim.

**Tidak ada mekanisme untuk:**
- Mendeteksi bahwa session ini stale
- Memaksa close stale session
- Memperbolehkan CONNECTED baru menggantikan session lama yang sudah stale

**Rekomendasi:** Tambahkan rule di Section 9.1: *"If active session key is older than `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS`, treat as stale. Emit an orphan `DISCONNECTED` for the stale session, then create new session for the incoming `CONNECTED`."*

---

### 2.2 Section 9.2 — Idempotency Key Format

**⚠️ Temuan 3 — CREATED idempotency key format memiliki duplikasi [NEW-GAP-03]**

Section 9.2 mendefinisikan format untuk CREATED:
```
{accountChannelId}:CREATED:{accountChannelId}
```

Komponen ketiga adalah `accountChannelId` lagi — **ini adalah copy-paste error**. Format ini redundant dan tidak menambah uniqueness.

Perbandingan dengan pola event lain:
- CONNECTED: `{accountChannelId}:CONNECTED:{connectionSessionId}` — komponen ketiga adalah identifier unik yang bermakna
- DISCONNECTED: `{accountChannelId}:DISCONNECTED:{connectionSessionId|occurredAtUnixMs}` — identifier unik yang bermakna

Untuk CREATED, karena idealnya hanya ada **satu CREATED per account channel**, key paling sederhana dan correct adalah:
```
{accountChannelId}:CREATED
```
Atau jika edge case re-create perlu dihandle (delete + recreate akun dengan ID yang sama):
```
{accountChannelId}:CREATED:{occurredAtUnixMs}
```

**Rekomendasi:** Perbaiki format di Section 9.2:
```
CREATED → {accountChannelId}:CREATED:{occurredAtUnixMs}
```

---

### 2.3 Section 9.3 — Event Status Semantics

**✅ Sekarang jelas.** Tiga status terdefinisi dengan baik:
- `SUCCESS` = default untuk event yang benar-benar terjadi
- `FAILED` = hanya untuk explicit lifecycle failure signal
- `SKIPPED` = tidak dipersist; hanya dihitung di observability metrics

**Satu concern minor:** PRD menyatakan `FAILED` *"such as confirmed scan/auth failure if backend can detect it"*. Ini adalah use case di EC-003. Namun tidak ada FR yang secara eksplisit mewajibkan emitting `FAILED` event — ini hanya "if backend has reliable signal." Engineering perlu mengkonfirmasi apakah Baileys expose pairing failure event yang cukup reliable. Jika tidak, `FAILED` mungkin tidak pernah digunakan di Phase 1.

**Rekomendasi minor:** Tambahkan catatan di Section 9.3 atau EC-003 bahwa `FAILED` untuk SCAN hanya diemit jika `OQ-003` (Baileys scan signal) dikonfirmasi tersedia. Tanpa konfirmasi ini, `FAILED` tidak diemit di Phase 1.

---

### 2.4 Section 9.4 — Metadata Whitelist

**✅ Solid.** 8 key yang didefinisikan logis dan safe.

**Satu temuan kecil:** Key `dedupWindowMs` ada di whitelist sebagai *"Deduplication window used by producer."* Ini menarik — artinya producer mencatat berapa window yang digunakan saat event diemit. Berguna untuk debugging. Namun:

- Apakah ini diisi di setiap DISCONNECTED event, atau hanya saat dedup active?
- Jika diisi di setiap event, nilainya sama selalu (dari env var) — redundant
- Jika hanya diisi saat dedup decision dibuat tapi event tetap lolos (no dup found), ini juga redundant

**Rekomendasi minor:** Klarifikasi kapan `dedupWindowMs` diisi — hanya perlu ada di metadata jika memang ada dedup logic yang berjalan (bukan default filler).

---

### 2.5 FR-021 — Supervisor RBAC

v1.1 menambahkan: *"validated server-side via Team Inbox to account channel mapping from `channel-service` or `company-service`."*

**⚠️ Temuan 4 — Supervisor RBAC memperkenalkan synchronous gRPC dependency baru di query path [NEW-GAP-04]**

Setiap kali Supervisor mengakses event log, api-gateway harus:
1. Call `channel-service` atau `company-service` untuk resolve team → account channel mapping
2. Validasi apakah `:accountChannelId` dalam scope team Supervisor
3. Baru query audit-service

Ini adalah **additional synchronous gRPC call di hot path** yang:
- Menambah latency query (potensi +50-150ms per call)
- Menambah failure dependency: jika channel-service down, Supervisor tidak bisa query log
- Perlu dipertimbangkan apakah perlu di-cache di Redis per supervisor session

**Konsekuensi yang tidak didefinisikan di PRD:** Jika channel-service tidak available saat query, apa yang terjadi?
- Return 503?
- Return cached scope (jika ada)?
- Deny with 403?

**Rekomendasi:** Tambahkan ke Section 10 (Error Handling): error code dan behavior saat team scope resolution gagal. Serta pertimbangkan caching scope result di Redis dengan TTL singkat (e.g., 5 menit) untuk mengurangi gRPC call frequency.

---

### 2.6 FR-025 — Dedup Window

**✅ Resolved.** Default 5 detik, env var terdefinisi.

**Catatan konsistensi:** FR-025 mendefinisikan dedup untuk `DISCONNECTED`. Namun CONNECTED juga bisa diemit multiple times oleh Baileys (misalnya rapid reconnect). Section 9.1 mencegah duplikat session creation via Redis key check, tapi **tidak mencegah emit multiple CONNECTED events ke RabbitMQ**.

Scenario:
1. Baileys emit `connection: 'open'` 
2. whatsapp-service: cek Redis → key ada → tidak buat session baru → tapi tetap emit CONNECTED ke RMQ?

**Tidak jelas:** apakah dedup check di Section 9.1 dilakukan **sebelum emit** (mencegah duplicate emit) atau **sebelum session creation** (mencegah duplicate session tapi masih emit).

Jika emit tetap terjadi dan consumer menerima duplikat CONNECTED dengan idempotency key yang sama (`{accountChannelId}:CONNECTED:{connectionSessionId}`), idempotency key akan de-dup di storage level. Ini fine dari storage perspective, tapi bisa membingungkan di log bahwa ada multiple CONNECTED attempts.

**Rekomendasi:** Clarify di Section 9.1: dedup check harus dilakukan **sebelum emit** (skip emit sepenuhnya jika session sudah aktif), bukan hanya sebelum session creation.

---

### 2.7 EC-008 — Suspend saat Akun CONNECTED

PRD menyatakan: *"Log `SUSPENDED`. Disconnect or block usage according to suspend policy."*

**⚠️ Temuan 5 — Suspend policy untuk akun yang sedang CONNECTED tidak terdefinisi [NEW-GAP-05]**

EC-008 mengakui ada dua kemungkinan aksi saat suspend:
1. **Disconnect**: Baileys session dihentikan → emit DISCONNECTED → emit SUSPENDED
2. **Block usage**: Session tetap hidup tapi tidak bisa kirim/terima pesan → hanya SUSPENDED

Urutan event sangat berbeda antara dua skenario ini:

**Scenario A (Disconnect first):**
```
CONNECTED → (admin suspend) → DISCONNECTED (reason: AUTO_SUSPEND?) → SUSPENDED
```

**Scenario B (Block only):**
```
CONNECTED → (admin suspend) → SUSPENDED → (session eventually closed by other reason) → DISCONNECTED
```

Ini berdampak pada:
- `duration_ms` pada DISCONNECTED: apakah dihitung dari CONNECTED ke SUSPENDED atau ke DISCONNECTED yang sebenarnya?
- Apakah SUSPENDED di-emit **sebelum** atau **setelah** DISCONNECTED?
- Apakah `reason` di DISCONNECTED adalah `AUTO_SUSPEND` saat ini terjadi?

**Rekomendasi:** Tambahkan sub-rule di EC-008 atau Section 9.1 yang mendefinisikan urutan event saat suspend:
- Jika suspend → disconnect: emit `DISCONNECTED` dengan `reason: AUTO_SUSPEND` terlebih dahulu, lalu `SUSPENDED`
- `duration_ms` dihitung dari CONNECTED → DISCONNECTED (bukan ke SUSPENDED)

---

## 3. Gap Summary v1.1

| Gap ID | Deskripsi | Severity | Section Terdampak |
|--------|-----------|----------|-------------------|
| **NEW-GAP-01** | Redis session key tidak punya practical fallback TTL — stale key pasca crash akan block CONNECTED baru | **HIGH** | Section 9.1 |
| **NEW-GAP-02** | Tidak ada staleness detection mechanism untuk session key — tidak ada cara recover dari stale session | **HIGH** | Section 9.1 |
| **NEW-GAP-03** | CREATED idempotency key format duplikasi `accountChannelId` — likely copy-paste error | **MEDIUM** | Section 9.2 |
| **NEW-GAP-04** | Supervisor RBAC gRPC dependency — failure mode dan caching strategy tidak didefinisikan | **MEDIUM** | FR-021, Section 10 |
| **NEW-GAP-05** | Suspend policy untuk akun CONNECTED — urutan event SUSPENDED vs DISCONNECTED tidak didefinisikan | **MEDIUM** | EC-008, Section 9.1 |
| **MINOR-01** | `FAILED` event_status untuk SCAN tergantung OQ-003 — tidak disebutkan di Section 9.3 | LOW | Section 9.3 |
| **MINOR-02** | `dedupWindowMs` metadata key — kapan diisi tidak jelas | LOW | Section 9.4 |
| **MINOR-03** | CONNECTED dedup check — tidak jelas apakah sebelum atau setelah emit | LOW | Section 9.1, FR-025 |

---

## 4. Open Questions Status

| OQ ID | Pertanyaan | Status | Priority |
|-------|-----------|--------|----------|
| OQ-001 | `suspendAccountChannel` sudah ada? | ⚠️ **Masih open** — FR-006 conditional | BLOCKER |
| OQ-002 | Retention policy final? | ⚠️ **Masih open** — TTL disabled | HIGH |
| OQ-003 | Exact Baileys signal untuk SCAN? | ⚠️ **Masih open** — FR-003 at risk | BLOCKER |
| OQ-004 | Lifetime: per-session, total, atau keduanya? | ⚠️ **Masih open** — UI/API design pending | MEDIUM |
| OQ-005 | Export Phase 1? | ✅ Effectively closed — Section 17 exclusion | LOW |
| OQ-006 | Notifikasi Phase 1? | ✅ Effectively closed — Section 17 exclusion | LOW |
| OQ-007 | Generic taxonomy? | ✅ Deferred to Future (Section 16) | LOW |
| OQ-008 | SCAN → PAIRED for Pairing Code? | ✅ Deferred to Future (Section 16) | LOW |

**2 blocker masih open:** OQ-001 dan OQ-003 harus dijawab sebelum sprint planning.

---

## 5. Impact Analysis Update (Delta dari v1.0)

### 5.1 Redis Impact (Baru karena Section 9.1)

| Key | TTL | Purpose | Gap |
|-----|-----|---------|-----|
| `evt:session:{accountChannelId}` | Configurable via `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS` | Session tracking (connectionSessionId + connectedAt) | **NEW-GAP-01: perlu fallback TTL** |
| `evt:dedup:disc:{accountChannelId}` | 5s (configurable via `ACCOUNT_CHANNEL_DISCONNECT_DEDUP_WINDOW_MS`) | DISCONNECTED deduplication | ✅ OK |

### 5.2 Concurrency Impact (Update)

| Skenario | Status |
|----------|--------|
| DISCONNECTED duplikat dari reconnect loop | ✅ Handled — FR-025 + Redis dedup key |
| Consumer retry duplikat | ✅ Handled — Section 9.2 idempotency key + unique index |
| Duplicate CONNECTED session | ⚠️ Partially handled — Redis key check, tapi fallback TTL tidak ada (NEW-GAP-01) |
| Service crash mid-session | ⚠️ **Not handled** — stale Redis key (NEW-GAP-01, NEW-GAP-02) |
| Suspend saat connected | ⚠️ **Not handled** — event ordering undefined (NEW-GAP-05) |

### 5.3 gRPC Path Update (Baru karena FR-021)

Tambahan dependency di query path untuk Supervisor:
```
FE → api-gateway → channel-service/company-service (scope resolve) → audit-service
```
Failure mode chain ini perlu error handling di level api-gateway (NEW-GAP-04).

---

## 6. Risk Analysis (Delta)

| Risk | Probability | Impact | Severity | Update dari v1.0 |
|------|------------|--------|----------|-----------------|
| Stale Redis session key block CONNECTED | MEDIUM | HIGH | **HIGH** | **Baru — dari Section 9.1** |
| Service crash → session key tidak dihapus | MEDIUM | MEDIUM | MEDIUM | **Baru — dari Section 9.1** |
| CREATED idempotency key format typo | HIGH | LOW | LOW | **Baru — dari Section 9.2** (mudah diperbaiki) |
| Supervisor scope gRPC chain failure | LOW | MEDIUM | MEDIUM | **Baru — dari FR-021** |
| EC-008 suspend event ordering mismatch | MEDIUM | MEDIUM | MEDIUM | **Baru — dari EC-008** |
| OQ-001: SUSPENDED action tidak ada | HIGH | HIGH | CRITICAL | Unchanged |
| OQ-003: SCAN signal tidak reliable | MEDIUM | HIGH | HIGH | Unchanged |

---

## 7. Test Strategy — Tambahan dari v1.1

Tambahkan test case berikut ke suite sebelumnya:

| TC-ID | Scenario | Priority | Level |
|-------|----------|----------|-------|
| TC-ACEL-016 | Service crash mid-session → restart → CONNECTED baru berhasil dibuat (tidak diblok stale key) | P0 | Integration |
| TC-ACEL-017 | Redis session key expired → CONNECTED baru menghasilkan session baru + orphan DISCONNECTED untuk session lama | P1 | Integration |
| TC-ACEL-018 | CREATED event idempotency key unik meski account channel di-delete dan re-create | P1 | Integration |
| TC-ACEL-019 | channel-service down saat Supervisor query → error response yang benar (tidak 500 tanpa pesan) | P1 | Integration |
| TC-ACEL-020 | Suspend akun saat CONNECTED → urutan event DISCONNECTED + SUSPENDED benar | P1 | Integration |
| TC-ACEL-021 | Duplicate CONNECTED emit dari Baileys saat session aktif → hanya 1 CONNECTED tersimpan | P1 | Integration |

---

## 8. Recommendation (Update)

### Status Gap v1.1

- **7 gap dari v1.0** → semua ✅ CLOSED
- **5 gap baru ditemukan** (2 HIGH, 3 MEDIUM)
- **2 blocker OQ masih open** (OQ-001, OQ-003)

### Aksi yang Dibutuhkan Sebelum Sprint

| Prioritas | Item | Aksi |
|-----------|------|------|
| **BLOCKER** | OQ-001: SUSPENDED action | Engineering konfirmasi existence sebelum sprint |
| **BLOCKER** | OQ-003: Baileys SCAN signal | Engineering konfirmasi signal sebelum sprint |
| **HIGH** | NEW-GAP-01: Redis session TTL fallback | Tambahkan fallback TTL 7 hari ke Section 9.1 |
| **HIGH** | NEW-GAP-02: Staleness detection | Tambahkan staleness recovery rule ke Section 9.1 |
| **MEDIUM** | NEW-GAP-03: CREATED idempotency key | Perbaiki format typo di Section 9.2 |
| **MEDIUM** | NEW-GAP-04: Supervisor RBAC failure mode | Tambahkan error code ke Section 10 + caching consideration |
| **MEDIUM** | NEW-GAP-05: Suspend event ordering | Tambahkan sub-rule EC-008 atau Section 9.1 |

### Go/No-Go Assessment (Update)

| Kondisi | v1.0 | v1.1 |
|---------|------|------|
| Event definitions jelas | ✅ | ✅ |
| FR lengkap (kecuali SUSPENDED) | ✅ | ✅ |
| Arsitektur audit-service tersedia | ✅ | ✅ |
| connectionSessionId architecture | ⚠️ | ✅ (tapi ada NEW-GAP-01/02) |
| Idempotency key format | ⚠️ | ✅ (tapi ada NEW-GAP-03 typo) |
| Metadata whitelist | ⚠️ | ✅ |
| Dedup window defined | ⚠️ | ✅ |
| Supervisor RBAC defined | ⚠️ | ✅ (tapi ada NEW-GAP-04) |
| Global endpoint scope | ⚠️ | ✅ |
| Redis session fallback TTL | — | ⚠️ NEW-GAP-01 |
| Staleness recovery | — | ⚠️ NEW-GAP-02 |
| Suspend event ordering | — | ⚠️ NEW-GAP-05 |
| OQ-001 SUSPENDED confirmed | ⚠️ | ⚠️ (unchanged) |
| OQ-003 SCAN signal confirmed | ⚠️ | ⚠️ (unchanged) |

**Verdict: CONDITIONAL GO** (lebih dekat ke Go dibanding v1.0)

PRD v1.1 jauh lebih matang dari v1.0. Gap tersisa lebih kecil dan lebih focused. Dapat masuk sprint planning dengan syarat:
1. OQ-001 dan OQ-003 diselesaikan sebelum sprint day 1
2. NEW-GAP-01 dan NEW-GAP-02 (Redis session TTL) ditambahkan ke Section 9.1 sebelum implementasi `whatsapp-service` dimulai
3. NEW-GAP-03 (CREATED key format) diperbaiki — ini hanya typo, effort minimal

---

## 9. Traceability Matrix (Update — hanya row yang berubah dari v1.0)

| Req ID | Requirement | Finding v1.1 | Status |
|--------|-------------|-------------|--------|
| FR-009 | `connectionSessionId` di CONNECTED + DISCONNECTED | ✅ Section 9.1 mendefinisikan arsitektur lengkap. Tapi ada NEW-GAP-01 (no fallback TTL) dan NEW-GAP-02 (no staleness). | **Conditional** |
| FR-011 | `idempotencyKey` per event | ✅ Section 9.2 mendefinisikan format per event type. Tapi NEW-GAP-03: format CREATED punya typo | **Needs fix** |
| FR-021 | Supervisor scope server-side validation | ✅ Didefinisikan via channel-service/company-service. Tapi NEW-GAP-04: failure mode tidak didefinisikan | **Conditional** |
| FR-025 | Dedup DISCONNECTED 5s default | ✅ Resolved — default value dan env var defined | **Ready** |
| FR-030 | Metadata allowlist | ✅ Section 9.4 mendefinisikan 8 key dengan values | **Ready** |
| EC-008 | Suspend saat CONNECTED | NEW-GAP-05: event ordering SUSPENDED vs DISCONNECTED tidak didefinisikan | **Needs clarification** |
