# QA Analysis: PRD Account Channel Event Log v1.2

> **Analysis Type:** Type 1 — Feature Development Analysis (Re-analysis dari v1.1)
> **Source PRD:** `PRD/Whatsapp web v2/PRD WA Web Account Channel Event Log.md` v1.2
> **Rules Applied:** `qa-analysis-rule.md`, `impact-analysis-rule.md`, `workflow-rule.md`
> **Analisa Sebelumnya:** `Temp Analysis/prd-analysis-account-channel-event-log-v1.1.md`
> **Tanggal Analisa:** 2026-06-02

---

## Ringkasan Perubahan v1.1 → v1.2

Revision history PRD menyatakan v1.2 menutup semua gap dari re-analisa v1.1:
> "Closed v1.1 re-analysis gaps: Redis session fallback TTL and staleness recovery, CREATED idempotency key typo, Supervisor scope resolution failure mode, suspend event ordering, FAILED status dependency, `dedupWindowMs` semantics, and duplicate CONNECTED pre-emit dedup."

### Status Gap dari Analisa v1.1

| Gap v1.1 | Deskripsi | Status di v1.2 |
|----------|-----------|----------------|
| NEW-GAP-01 | Redis session key no fallback TTL | ✅ CLOSED — Section 9.1: default 7 hari (`604800000` ms) |
| NEW-GAP-02 | No staleness detection | ✅ CLOSED — Section 9.1: "Stale session recovery" row baru |
| NEW-GAP-03 | CREATED idempotency key typo | ✅ CLOSED — Section 9.2: format diperbaiki ke `{accountChannelId}:CREATED:{occurredAtUnixMs}` |
| NEW-GAP-04 | Supervisor RBAC failure mode | ✅ CLOSED — Section 10: error 503-ACEL09 + caching 5 menit + Section 13 mitigation |
| NEW-GAP-05 | Suspend event ordering | ✅ CLOSED — Section 9.1 + EC-008: urutan DISCONNECTED(AUTO_SUSPEND) → SUSPENDED |
| MINOR-01 | FAILED status dependency on OQ-003 | ✅ CLOSED — Section 9.3: "FAILED for SCAN emitted only if OQ-003 confirms reliable signal" |
| MINOR-02 | `dedupWindowMs` metadata semantics | ✅ CLOSED — Section 9.4: "Store only on DISCONNECTED where producer evaluated dedup" |
| MINOR-03 | CONNECTED dedup harus sebelum emit | ✅ CLOSED — FR-031 baru + Section 9.1 updated |

**Semua 8 gap dari v1.1 sudah ditutup.** PRD v1.2 adalah versi paling matang sejauh ini.

---

## 1. Analisa Konten Baru v1.2

### 1.1 Section 9.1 — Stale Session Recovery (Baru)

Rule baru:
> "If `evt:session:{accountChannelId}` is older than `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS` **or otherwise fails active-session validation**, system MUST treat it as stale, emit orphan `DISCONNECTED`, delete stale key, then create new session."

**✅ Intent sudah benar.** Namun ada dua temuan:

---

**⚠️ NEW-GAP-01 [MEDIUM]: Stale session recovery bukan operasi atomic — race condition possible**

Stale recovery melibatkan urutan:
1. Baca Redis key → cek apakah stale
2. Emit orphan DISCONNECTED
3. Delete Redis key
4. Create new session

Jika dua proses (dua Baileys `connection: 'open'` event hampir bersamaan) sama-sama mendeteksi stale key di langkah (1) sebelum salah satu sempat menghapusnya di langkah (3), keduanya akan:
- Masing-masing emit orphan DISCONNECTED → 2 orphan events untuk session yang sama
- Masing-masing create session baru → 2 active sessions untuk 1 account channel

Ini check-then-act race condition klasik. Fix yang diperlukan: atomic Redis operation menggunakan Lua script atau WATCH/MULTI/EXEC yang menggabungkan read + stale check + delete + write menjadi satu operasi atomik.

**Rekomendasi:** Tambahkan note di Section 9.1: *"Stale session check-and-replace MUST be implemented as an atomic Redis operation (e.g., Lua script) to prevent duplicate orphan events from concurrent Baileys reconnect signals."*

---

**⚠️ NEW-GAP-02 [MEDIUM]: "Otherwise fails active-session validation" tidak terdefinisi**

Rule menyebut dua kondisi untuk staleness:
1. Key lebih tua dari `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS` — ✅ jelas dan measurable
2. "Or otherwise fails active-session validation" — ❌ tidak jelas

Kondisi apa lagi yang membuat session dianggap tidak valid? Kemungkinan yang dimaksud:
- Key ada tapi data corrupt / schema mismatch?
- Key ada tapi `connectionSessionId` tidak bisa di-parse?
- Kondisi lain?

Tanpa definisi eksplisit, developer akan menginterpretasi secara berbeda.

**Rekomendasi:** Ganti dengan kondisi konkret atau hapus clause ini dan batasi hanya pada TTL-based staleness: *"If `evt:session:{accountChannelId}` exists and `connectedAt` is older than `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS`..."*

---

### 1.2 Section 9.1 — "Suspend While Connected" (Baru)

Rule:
> "system MUST close the active session first and emit `DISCONNECTED` with `reason = AUTO_SUSPEND`, then emit `SUSPENDED`. `duration_ms` is calculated from `CONNECTED` to this `DISCONNECTED`."

**✅ Event ordering dan duration_ms sudah benar.** Namun ada satu concern:

---

**⚠️ NEW-GAP-03 [MEDIUM]: Suspend flow berpotensi produce duplikat DISCONNECTED**

Saat suspend dipicu:
1. `channel-service` atau business logic emit DISCONNECTED(`reason=AUTO_SUSPEND`) — session key dihapus dari Redis
2. `channel-service` emit SUSPENDED

Masalah: jika Baileys session tidak langsung di-terminate secara paksa oleh suspend action, Baileys mungkin mendeteksi koneksi terputus secara mandiri dan juga emit `connection.update { connection: 'close' }` melalui `whatsapp-service`.

Dua path DISCONNECTED:
- Path A (suspend): DISCONNECTED(AUTO_SUSPEND) dengan `connectionSessionId` — session key sudah dihapus
- Path B (Baileys close): DISCONNECTED tanpa session key di Redis → orphan DISCONNECTED(`metadata.orphan=true`)

Idempotency key keduanya berbeda:
- Path A: `{accountChannelId}:DISCONNECTED:{connectionSessionId}` 
- Path B: `{accountChannelId}:DISCONNECTED:{occurredAtUnixMs}` (fallback karena session key sudah dihapus)

Keduanya akan **lolos** idempotency check dan **disimpan sebagai dua event berbeda**. Admin melihat dua DISCONNECTED untuk sesi yang sama.

**Rekomendasi:** Tambahkan ke EC-008 atau Section 9.1: *"After emitting DISCONNECTED(AUTO_SUSPEND), system MUST immediately terminate or mark the Baileys session as suspended before Baileys emits its own `connection.update close`. If Baileys close fires after AUTO_SUSPEND DISCONNECTED is emitted, the subsequent DISCONNECTED SHOULD be suppressed via dedup window (treat as duplicate within 5s window)."*

---

### 1.3 Section 9.1 — Duplicate CONNECTED + FR-031

FR-031 baru:
> "Duplicate `CONNECTED` while an active session exists MUST be skipped before RMQ emit, not only deduplicated at storage."

Section 9.1 updated:
> "system MUST skip creating a new session and MUST skip emitting duplicate `CONNECTED` to RabbitMQ."

**✅ Fully correct.**

**Satu clarification perlu dijawab:**

Saat DISCONNECTED di-dedup (tidak diemit), apakah Redis session key juga TIDAK dihapus?

Section 9.1: *"emits `DISCONNECTED`, then deletes the Redis session key"* — delete hanya terjadi setelah emit. Jika emit di-skip karena dedup, key tidak dihapus. Ini berarti:
- Session key tetap aktif saat Baileys reconnect loop
- CONNECTED berikutnya (setelah reconnect) diblok karena session masih ada
- Ini correct behavior — session yang masih aktif tidak perlu direbuat

**✅ Logika konsisten, tidak ada gap.**

---

### 1.4 Section 10 — 503-ACEL09 (Baru)

Error baru:
> "API Gateway MAY use cached scope for up to 5 minutes if cache is fresh and tenant-scoped."

**✅ Solid.** 503 dengan fail-closed + optional cache adalah pendekatan yang tepat.

**⚠️ NEW-GAP-04 [LOW]: Cache invalidation pada perubahan team scope tidak didefinisikan**

Jika Supervisor di-assign ulang ke team berbeda (oleh Admin), cached scope (5 menit) masih mengizinkan akses ke akun dari team lama, dan menolak akun dari team baru.

Untuk context read-only event log ini acceptable secara operasional. Namun dari perspektif security/compliance, akses ke event log akun yang sudah bukan scope-nya berpotensi menjadi temuan audit.

**Rekomendasi:** Tambahkan note di Section 10 atau Section 13: *"Cached scope has max 5-minute staleness window. Team assignment changes may not be reflected immediately. This is acceptable for read-only audit log access but should be noted in compliance documentation."*

---

### 1.5 Section 9.2 — Idempotency Keys

**✅ CREATED typo sudah diperbaiki:** `{accountChannelId}:CREATED:{occurredAtUnixMs}` — benar.

**⚠️ NEW-GAP-05 [LOW]: `requestId` dan `connectionAttemptId` tidak didefinisikan**

Format untuk INIT: `{accountChannelId}:INIT:{requestId|occurredAtUnixMs}`
Format untuk SCAN: `{accountChannelId}:SCAN:{connectionAttemptId|occurredAtUnixMs}`

PRD menyatakan: *"`requestId` or `connectionAttemptId` SHOULD be used when available"* — tapi tidak mendefinisikan dari mana identifier ini berasal.

Jika tidak ada dalam implementasi saat ini, semua INIT dan SCAN fallback ke `occurredAtUnixMs`. Concern:
- Admin klik Connect → dua INIT di detik yang sama (sangat unlikely, tapi possible)
- Keduanya punya idempotency key yang sama → hanya satu yang tersimpan

Ini risiko sangat rendah, tapi definisi `requestId` perlu ada.

**Rekomendasi:** Tambahkan klarifikasi: *"`requestId` SHOULD be a UUID generated by API Gateway or `whatsapp-service` at the start of the connect request. If not available in Phase 1, `occurredAtUnixMs` is acceptable fallback."*

---

### 1.6 EC-010 — Retention + Orphan Pair Behavior (Masih Open)

EC-010 menyatakan:
> "Lifetime query must handle missing pair gracefully."

Ini masih tidak mendefinisikan secara konkret apa behavior "gracefully" dari perspektif API response dan FE rendering.

**⚠️ NEW-GAP-06 [MEDIUM]: EC-010 "handle gracefully" tidak dispesifikasikan secara konkret**

Scenario: CONNECTED dari 95 hari lalu sudah dihapus oleh TTL, DISCONNECTED-nya masih ada (baru 10 hari lalu).

Yang tidak didefinisikan:
- FR-012 response: apakah `durationMs` di DISCONNECTED event diisi dengan nilai dari saat pertama kali tersimpan (karena `duration_ms` disimpan di DISCONNECTED document), atau dihitung ulang dari query?
- FR-014 (total lifetime): apakah sesi dengan missing CONNECTED di-include atau di-exclude dari total?
- FE: apa yang ditampilkan untuk sesi dengan `durationMs = null` karena orphan?

**Note penting:** Karena `duration_ms` disimpan **langsung di DISCONNECTED document** saat emit (Section 9.1), bukan dihitung ulang dari query, kehilangan CONNECTED karena TTL sebenarnya **tidak mempengaruhi `duration_ms` yang sudah tersimpan**. Nilai sudah di-capture saat DISCONNECTED diemit.

Yang tetap terpengaruh adalah:
- FR-012: matching `CONNECTED` untuk display (menampilkan `connectedAt` dari CONNECTED event)
- FR-013: jika CONNECTED terhapus TTL tapi akun masih connected (edge case: akun connected > 90 hari terus-menerus)

**Rekomendasi:** Tambahkan clarification di EC-010: *"Because `duration_ms` is stored on the `DISCONNECTED` document at emit time, TTL deletion of `CONNECTED` does not affect stored duration. However, displaying `connectedAt` timestamp for a completed session requires the paired `CONNECTED` document. If missing, show `DISCONNECTED` duration only, without `connectedAt` start time. For FR-013 (active lifetime), if `CONNECTED` is removed by TTL while session is still active, display `Aktif sejak unknown` or equivalent."*

---

### 1.7 Section 12 — NFR Observability (Update)

v1.2 menambahkan:
> "Dedup skips SHOULD increment a metric counter such as `account_channel_event_log_dedup_skipped_total`."

**✅ Gap MINOR dari v1.1 (dedup skipped count instrumentation) tertutup.**

Satu catatan: `SHOULD` vs `MUST`. Untuk metric yang masuk sebagai KPI di Section 14 ("Duplicate disconnect suppression >= 90%"), metric counter ini perlu MUST, bukan SHOULD, agar KPI bisa diukur.

**Rekomendasi minor:** Ganti `SHOULD` menjadi `MUST` untuk metric counter ini karena merupakan data source KPI Section 14.

---

## 2. Gap Summary v1.2

| Gap ID | Deskripsi | Severity | Section |
|--------|-----------|----------|---------|
| **NEW-GAP-01** | Stale session recovery bukan operasi atomic — concurrent CONNECTED bisa produce duplikat orphan DISCONNECTED dan duplikat session | **MEDIUM** | Section 9.1 |
| **NEW-GAP-02** | "Otherwise fails active-session validation" tidak didefinisikan secara konkret | **MEDIUM** | Section 9.1 |
| **NEW-GAP-03** | Suspend while connected berpotensi produce duplikat DISCONNECTED dari dua path (suspend emit vs Baileys `connection.update close`) | **MEDIUM** | Section 9.1, EC-008 |
| **NEW-GAP-06** | EC-010 "handle gracefully" tidak spesifik — behavior API dan FE untuk missing CONNECTED pair tidak didefinisikan | **MEDIUM** | EC-010, FR-012, FR-013 |
| **NEW-GAP-04** | 503-ACEL09 cache invalidation pada perubahan team scope tidak didefinisikan | LOW | Section 10 |
| **NEW-GAP-05** | `requestId` dan `connectionAttemptId` di idempotency key format tidak didefinisikan sumbernya | LOW | Section 9.2 |
| **MINOR-01** | Section 12 NFR: `SHOULD` increment dedup counter — seharusnya `MUST` karena merupakan KPI data source | LOW | Section 12 |

---

## 3. Open Questions Status

| OQ ID | Pertanyaan | Status |
|-------|-----------|--------|
| OQ-001 | `suspendAccountChannel` sudah ada? | ⚠️ **Masih open — BLOCKER** |
| OQ-002 | Retention policy final? | ⚠️ **Masih open — HIGH** |
| OQ-003 | Exact Baileys signal untuk SCAN? | ⚠️ **Masih open — BLOCKER** |
| OQ-004 | Lifetime: per-session, total, atau keduanya? | ⚠️ **Masih open — MEDIUM** |
| OQ-005–008 | Export, notifikasi, generic taxonomy, PAIRED | ✅ Effectively deferred to Phase 2/Future |

**2 blocker masih unresolved:** OQ-001 dan OQ-003.

---

## 4. Concurrency Impact Update

| Skenario | v1.0 | v1.1 | v1.2 |
|----------|------|------|------|
| DISCONNECTED duplikat reconnect loop | ❌ | ✅ | ✅ |
| Consumer retry duplikat | ❌ | ✅ | ✅ |
| Duplicate CONNECTED session | ❌ | ✅ (partial) | ✅ (pre-emit dedup, FR-031) |
| Service crash → stale session key | ❌ | ❌ | ✅ (TTL 7d + recovery) |
| Stale recovery non-atomic | — | — | ⚠️ **NEW-GAP-01** |
| Suspend → dual DISCONNECTED path | — | — | ⚠️ **NEW-GAP-03** |

---

## 5. Risk Matrix (Delta v1.2)

| Risk | Probability | Impact | Severity | Status |
|------|------------|--------|----------|--------|
| Stale session recovery race condition | LOW | MEDIUM | MEDIUM | **Baru — NEW-GAP-01** |
| Suspend produces duplicate DISCONNECTED | MEDIUM | LOW | MEDIUM | **Baru — NEW-GAP-03** |
| EC-010 query behavior undefined | LOW | LOW | MEDIUM | **Baru — NEW-GAP-06** |
| OQ-001: SUSPENDED action belum ada | HIGH | HIGH | CRITICAL | Unchanged |
| OQ-003: SCAN signal tidak reliable | MEDIUM | HIGH | HIGH | Unchanged |
| Retention TTL + session pair integrity | MEDIUM | MEDIUM | MEDIUM | Partially mitigated (duration_ms stored at emit time) |

---

## 6. Test Strategy — Tambahan dari v1.2

Tambahkan ke suite test sebelumnya:

| TC-ID | Scenario | Priority | Level |
|-------|----------|----------|-------|
| TC-ACEL-022 | Concurrent CONNECTED detect stale session → hanya 1 orphan DISCONNECTED + 1 new session (atomic check) | P1 | Integration |
| TC-ACEL-023 | Suspend akun connected → DISCONNECTED(AUTO_SUSPEND) tersimpan → Baileys juga fire close → tidak ada duplikat DISCONNECTED kedua | P1 | Integration |
| TC-ACEL-024 | Query lifetime saat CONNECTED sudah TTL-expired → DISCONNECTED masih tampil dengan `duration_ms` yang benar, `connectedAt` tidak tersedia | P2 | Integration |
| TC-ACEL-025 | Team scope cache: Supervisor akses setelah di-re-assign ke team lain (dalam 5 menit) → behavior terdefinisi | P2 | E2E |

---

## 7. Recommendation (Update)

### Progress Per Versi

| Versi | Gap Ditemukan | Gap Ditutup | Blocker OQ |
|-------|--------------|-------------|------------|
| v1.0 | 7 gap | 0 | 2 (OQ-001, OQ-003) |
| v1.1 | 8 gap (5 new + 3 minor) | 7 ✅ | 2 (unchanged) |
| v1.2 | 7 gap (6 new + 1 minor) | 8 ✅ | 2 (unchanged) |

Gap tersisa di v1.2 lebih kecil dan lebih focused pada concurrency edge cases. Tidak ada gap yang memblok implementasi utama.

### Aksi yang Dibutuhkan Sebelum Sprint

| Prioritas | Item | Aksi |
|-----------|------|------|
| **BLOCKER** | OQ-001: SUSPENDED action | Engineering konfirmasi sebelum sprint |
| **BLOCKER** | OQ-003: Baileys SCAN signal | Engineering konfirmasi sebelum sprint |
| **MEDIUM** | NEW-GAP-01: Stale session atomic | Tambahkan note ke Section 9.1 tentang atomic Redis operation requirement |
| **MEDIUM** | NEW-GAP-02: "Otherwise fails" undefined | Perjelas atau hapus clause di Section 9.1 |
| **MEDIUM** | NEW-GAP-03: Suspend dual DISCONNECTED | Tambahkan suppression rule ke EC-008/Section 9.1 |
| **MEDIUM** | NEW-GAP-06: EC-010 graceful behavior | Definisikan konkret behavior FE dan API response |
| **LOW** | MINOR-01: `SHOULD` → `MUST` untuk dedup counter | Perbaiki Section 12 NFR |
| **LOW** | NEW-GAP-04 + NEW-GAP-05 | Tambahkan notes sebelum implementasi dimulai |

### Go/No-Go Assessment (Update)

| Kondisi | v1.0 | v1.1 | v1.2 |
|---------|------|------|------|
| Event definitions | ✅ | ✅ | ✅ |
| FR lengkap | ✅ | ✅ | ✅ |
| connectionSessionId architecture | ❌ | ✅ | ✅ |
| Idempotency key format | ❌ | ✅ | ✅ |
| Metadata whitelist | ❌ | ✅ | ✅ |
| Dedup window defined | ❌ | ✅ | ✅ |
| Supervisor RBAC + failure mode | ❌ | ✅ | ✅ |
| Session TTL fallback | ❌ | ❌ | ✅ |
| Stale session recovery | ❌ | ❌ | ✅ (tapi non-atomic — NEW-GAP-01) |
| Suspend event ordering | ❌ | ❌ | ✅ (tapi dual-path risk — NEW-GAP-03) |
| Duplicate CONNECTED pre-emit dedup | ❌ | ❌ | ✅ |
| OQ-001 SUSPENDED confirmed | ❌ | ❌ | ❌ |
| OQ-003 SCAN signal confirmed | ❌ | ❌ | ❌ |

**Verdict: CONDITIONAL GO — semakin dekat ke Go.**

PRD v1.2 sudah sangat matang. Gap yang tersisa adalah edge case concurrency yang tidak memblok arsitektur utama, dan 2 blocker OQ yang sama sejak awal (OQ-001, OQ-003). Jika OQ-001 dan OQ-003 dikonfirmasi, PRD ini siap untuk sprint planning dan implementation.

Gap concurrency (NEW-GAP-01, -03) lebih tepat diaddress di level engineering design/implementation daripada di PRD — bisa diselesaikan saat engineering mulai menulis spesifikasi teknis.
