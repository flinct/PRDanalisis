# QA Analysis: PRD Account Channel Event Log v1.0

> **Analysis Type:** Type 1 — Feature Development Analysis
> **Source PRD:** `PRD/Whatsapp web v2/PRD WA Web Account Channel Event Log.md` v1.0
> **Rules Applied:** `qa-analysis-rule.md`, `impact-analysis-rule.md`, `workflow-rule.md`
> **Reference Memory:** `global-memory.md`, `whatsapp-web-v1-vs-v2-comparison.md`, `CLAUDE-be.md`, `CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-02

---

## 1. Overview

**Feature:** Account Channel Event Log — WhatsApp Web
**Objective:** Rekam lifecycle event account channel (CREATED, INIT, SCAN, CONNECTED, DISCONNECTED, SUSPENDED) secara append-only. Admin dan Supervisor bisa investigasi incident, lacak uptime, dan audit trail channel operations.
**Scope Phase 1:** Per-account event timeline, lifetime per sesi, filter by type/date, RBAC per role, backend event capture via RabbitMQ async.
**Out of Scope Phase 1:** Export CSV/XLSX, notifikasi disconnect/suspend, realtime socket dedicated, global log semua akun, non-WhatsApp channel.
**Business Context:** Saat ini tidak ada histori lifecycle — gap audit trail, incident investigation lambat. `audit-service` sudah ada di BE namun belum digunakan untuk channel lifecycle.

---

## 2. Requirement Summary

### 2.1 Business Rules yang Di-Extract dari PRD

| BR ID | Business Rule | Source |
|-------|--------------|--------|
| BR-01 | Setiap event harus append-only — tidak ada delete/update oleh user | Section 4, Section 10 |
| BR-02 | SCAN hanya diemit saat QR scan / auth pairing benar-benar confirmed, BUKAN saat QR di-generate atau di-refresh | FR-003, EC-001 |
| BR-03 | QR refresh setiap 30 detik TIDAK boleh menghasilkan SCAN event berulang | FR-027 |
| BR-04 | LIFETIME bukan event tersimpan — dihitung dari CONNECTED → DISCONNECTED pair yang sama `connectionSessionId` | Section 5, Appendix 19.1 |
| BR-05 | Event write harus async (RabbitMQ) dan tidak boleh memblok lifecycle operation | FR-024 |
| BR-06 | Consumer harus idempotent — retry tidak boleh menghasilkan duplikat | FR-026, US-007 |
| BR-07 | Duplikat DISCONNECTED dalam reconnect loop harus dideduplikasi | FR-025, EC-005 |
| BR-08 | SUSPENDED hanya dicatat jika action suspend sudah ada di channel-service | FR-006 (conditional) |
| BR-09 | `occurred_at` diisi dari sisi producer, bukan consumer | Section 9, US-007 |
| BR-10 | `reason_detail` harus disanitasi — tidak boleh mengandung credential, token, key, stack trace | Section 9, Section 13 |

### 2.2 Acceptance Criteria yang Testable

Semua AC dari US-001 s.d. US-007 dapat dipetakan ke test case. Lihat Section 11 (Traceability Matrix).

### 2.3 Assumptions dari PRD

- `audit-service` dipilih sebagai storage (Section 13)
- Retention belum diaktifkan TTL-nya hingga PM/Legal konfirmasi (FR-028, FR-029)
- Phase 1 tidak mencakup export, notifikasi, realtime socket dedicated, non-WA channel

### 2.4 Clarifications yang Belum Terjawab di PRD

Lihat Section 9 (Open Questions) — 8 OQ diidentifikasi, termasuk OQ-001 (`SUSPENDED` action), OQ-003 (`SCAN` Baileys signal), OQ-004 (lifetime display).

---

## 3. Flow Analysis

### 3.1 As-Is Flow

```
createAccountChannel()     → DB saved          → [tidak ada log]
InitInstance()             → Baileys start      → [tidak ada log]
QR scan                    → pairing success    → [tidak ada log]
connection.update 'open'   → session ready      → [tidak ada log]
connection.update 'close'  → session lost       → [tidak ada log]
suspendAccountChannel()    → blocked            → [tidak ada log]
```

Admin hanya bisa lihat **current state** (connected/disconnected) di UI — tidak ada histori, tidak ada reason, tidak ada durasi.

### 3.2 To-Be Flow

```
createAccountChannel()
  → emit RMQ: CREATED {actorType:'user', actorUserId, occurredAt}
  → audit-service consumer → store AccountChannelEventLog

InitInstance()
  → emit RMQ: INIT {actorType:'user'|'system', occurredAt}
  → audit-service consumer → store

Baileys: pairing/auth success
  → emit RMQ: SCAN {actorType:'user', occurredAt}
  → audit-service consumer → store

Baileys: connection.update { connection:'open' }
  → generate connectionSessionId
  → store sessionId + connectedAt ke Redis
  → emit RMQ: CONNECTED {connectionSessionId, actorType:'system', occurredAt}
  → audit-service consumer → store

Baileys: connection.update { connection:'close', lastDisconnect:{error} }
  → deduplication check (Redis TTL key)
  → map error → DisconnectReasonEnum
  → fetch sessionId dari Redis → calculate durationMs
  → emit RMQ: DISCONNECTED {connectionSessionId, reason, durationMs, actorType, occurredAt}
  → audit-service consumer → store

suspendAccountChannel()
  → emit RMQ: SUSPENDED {actorType:'user', occurredAt}
  → audit-service consumer → store
```

### 3.3 State Transition Account Channel

```
[CREATED / NOT_CONNECTED]
        │
        ▼ INIT
[INITIALIZING]
        │
        ▼ SCAN (pairing confirmed)
[PAIRING]
        │
        ▼ CONNECTED (Baileys open)
[CONNECTED] ──────────────────────── auto-restore ──────────┐
        │                                                    │
        ▼ DISCONNECTED (Baileys close)                       │
[DISCONNECTED] ─── admin klik connect lagi ── INIT ─────────┘
        │
        ▼ SUSPENDED (admin/system)
[SUSPENDED]
```

| Transisi | Event | Trigger |
|----------|-------|---------|
| NEW → CREATED | CREATED | user: `createAccountChannel()` |
| * → INITIALIZING | INIT | user/system: `InitInstance()` |
| INITIALIZING → PAIRING | SCAN | user: pairing/auth confirmed |
| PAIRING → CONNECTED | CONNECTED | system: Baileys `connection.update open` |
| CONNECTED → DISCONNECTED | DISCONNECTED | system/user: Baileys `connection.update close` |
| DISCONNECTED → CONNECTED | CONNECTED | system: auto-restore (metadata.trigger=auto_restore) |
| * → SUSPENDED | SUSPENDED | user/system: suspend action |

**Transisi invalid yang HARUS dicegah:**
- SUSPENDED → CONNECTED tanpa reaktivasi eksplisit
- Duplikat CONNECTED saat sesi masih aktif (Appendix 19.1)
- SCAN saat QR hanya di-generate/refresh (FR-027, EC-001)

---

## 4. Impact Analysis

### 4.1 Module Impact

| Module | Perubahan | Level |
|--------|-----------|-------|
| `whatsapp-service` | Tambah emit RMQ di `InitInstance()`, `connection.update` handler (SCAN, CONNECTED, DISCONNECTED). Tambah Redis session tracking untuk `connectionSessionId` dan `durationMs`. | **HIGH** |
| `channel-service` | Tambah emit RMQ di `createAccountChannel()` dan `suspendAccountChannel()` (jika ada). | MEDIUM |
| `audit-service` | Modul baru: schema, repo, service, consumer, gRPC handler `AccountChannelEventLogService`. | HIGH |
| `api-gateway` | 2 endpoint baru: `GET /api/account-channels/:id/event-logs`, `GET /api/account-channels/:id/lifetime`. gRPC client ke audit-service. | MEDIUM |
| `libs/common` | Enum baru: `AccountChannelEventTypeEnum`, `AccountChannelDisconnectReasonEnum`. Constant baru: `ACCOUNT_CHANNEL_EVENT_LOG` pattern. | LOW |
| FE `settings/channels/whatsapp-web` | Tab "Log Aktivitas" per akun. Komponen timeline, filter, lifetime badge. Extend `ChannelSocketProvider`. | MEDIUM |

**Mitigation HIGH whatsapp-service:** Perubahan di `whatsapp-connection.service.ts` harus dibungkus try-catch agar emit RMQ tidak pernah throw ke main connection flow. Feature flag `ENABLE_ACCOUNT_CHANNEL_EVENT_LOG` harus memblok emit sebelum siap.

### 4.2 Database Impact

| Aspek | Detail | Level |
|-------|--------|-------|
| Collection baru | `account_channel_event_logs` di `satuinbox_audit` | MEDIUM |
| Schema baru | `AccountChannelEventLog` — semua field dari Section 9 PRD | MEDIUM |
| Index compound baru | `{companyId, organizationId, accountChannelId, occurredAt: -1}` | MEDIUM |
| Index compound baru | `{companyId, organizationId, eventType, occurredAt: -1}` | LOW |
| Unique index (idempotency) | `{idempotencyKey: 1}` unique sparse | **HIGH** — wajib ada sebelum deploy |
| TTL index | `{occurredAt: 1}` — DINONAKTIFKAN sampai policy confirmed (FR-028) | LOW |
| Migration | Tidak diperlukan — collection baru | — |
| Redis keys baru | `evt:session:{accountChannelId}` (connectionSessionId + connectedAt), `evt:dedup:disc:{accountChannelId}` (dedup window) | MEDIUM |

> ⚠️ **Gap:** PRD tidak secara eksplisit mendefinisikan Redis key schema untuk session tracking (`connectionSessionId`). Ini harus dispesifikasikan sebelum implementasi.

### 4.3 API Impact

**Endpoint baru (backward compatible — tidak ada breaking change pada endpoint existing):**

```
GET /api/account-channels/:id/event-logs
  Headers: Authorization: Bearer {token}
  Query: page, limit, eventTypes[], startDate, endDate
  Response 200: { data: EventLog[], meta: { total, page, limit } }
  Error 403: ACEL01, ACEL02
  Error 404: ACEL03
  Error 400: ACEL04, ACEL05

GET /api/account-channels/:id/lifetime
  Headers: Authorization: Bearer {token}
  Response 200: { sessions: [...], totalLifetimeMs, activeSessionSince? }
  Error 500: ACEL07 (degraded — hide summary, keep timeline)
```

**gRPC baru di `proto/audit.proto`:**
```protobuf
service AccountChannelEventLogService {
  rpc GetEventLogs(GetAccountChannelEventLogsRequest) returns (GetAccountChannelEventLogsResponse);
  rpc GetLifetimeSummary(GetLifetimeSummaryRequest) returns (GetLifetimeSummaryResponse);
}
```

> ⚠️ **Gap API:** PRD tidak mendefinisikan apakah endpoint `/event-logs` menerima query tanpa `:id` (global log lintas semua akun). Section 16 Future Considerations menyebut "Global event log page" sebagai future — artinya global endpoint OUT OF SCOPE Phase 1. Ini perlu eksplisit dicatat sebagai limitasi di PRD.

### 4.4 UI/UX Impact

| Komponen | Perubahan | Level |
|----------|-----------|-------|
| Account detail/drawer | Tambah tab "Log Aktivitas" | MEDIUM |
| Timeline event item | Komponen baru: icon event type, timestamp, actor, reason, lifetime chip | MEDIUM |
| Lifetime badge | Badge "Aktif sejak X" / durasi sesi | LOW |
| Filter bar | Multi-select event type + date range | LOW |
| Empty state | Komponen empty state (no logs, no filter result) | LOW |
| Permission guard | Hide tab untuk Agent role | LOW |

**Accessibility (dari NFR PRD Section 12):**
- Timeline icon harus ada `aria-label`
- Filter dan pagination harus keyboard-navigable
- Wajib dicek dengan screen reader di staging

**Data fetching strategy (dari Section 8 PRD):**
- Fetch on tab open
- Refetch setiap 30 detik (React Query `refetchInterval`)
- Invalidate React Query jika ada socket update di `ChannelSocketProvider` (recommended)
- Dedicated realtime socket: OUT OF SCOPE Phase 1

### 4.5 Security Impact

| Aspek | Risiko | Level | Mitigasi |
|-------|--------|-------|----------|
| Tenant isolation | Event log company lain bisa diakses jika guard tidak ketat | **HIGH** | Mandatory `companyId + organizationId` scope di semua query. Server-side guard di api-gateway, bukan hanya FE. |
| RBAC enforcement | Agent mengakses endpoint langsung via curl | HIGH | `RolesGuard` wajib di endpoint, bukan hanya UI hide. Error 403-ACEL01. |
| Data sanitization | `reasonDetail` dari Baileys mengandung internal error info / stack trace | MEDIUM | Strip stack trace sebelum simpan. Simpan hanya error code + message singkat. |
| Append-only | User bisa hit DELETE endpoint jika dibuat | LOW | Tidak buat endpoint DELETE/UPDATE untuk event log. Audit trail immutable. |
| `metadata` exposure | Metadata bisa mengandung session token atau internal ID | MEDIUM | Define allowed metadata keys whitelist sebelum simpan. Strip key di luar whitelist. |

> ⚠️ **Gap Security:** PRD Section 9 mendefinisikan `metadata` sebagai `Object` dengan contoh `{trigger: "auto_restore"}` tapi tidak mendefinisikan whitelist key yang diizinkan. Tanpa whitelist, ada risiko developer menulis data sensitif ke metadata secara tidak sengaja.

### 4.6 Performance Impact

| Aspek | Estimasi | Level | Mitigasi |
|-------|----------|-------|----------|
| RabbitMQ throughput tambahan | ~6 event per connect cycle per akun. Low frequency kecuali reconnect loop. | LOW | Tidak signifikan dalam kondisi normal. |
| MongoDB insert per event | 1 document per event. Estimasi < 20 doc/detik per company dalam kondisi normal. | LOW | Acceptable. |
| Query event log (indexed) | Compound index `{companyId, organizationId, accountChannelId, occurredAt}` → O(log n) | LOW | Index WAJIB ada sebelum deploy. |
| Lifetime calculation | N events per akun, pair CONNECTED↔DISCONNECTED di memory | MEDIUM | Batasi query range (default max 90 hari atau 200 event). Jangan load semua event tanpa limit. |
| Redis write (session tracking) | 2 Redis write per connect cycle (session key + dedup key) | LOW | Tidak signifikan. |
| N+1 risk | Jika FE render lifetime summary untuk semua akun di list view | MEDIUM | Lazy load per akun. Jangan bulk-fetch lifetime semua akun di settings list. |

**Target NFR dari PRD:** Query p95 ≤ 500ms untuk 1 akun, limit 50, indexed filters.

### 4.7 Integration Impact

| Komponen | Perubahan | Level |
|----------|-----------|-------|
| `whatsapp-service` → RabbitMQ | 3 emit baru: INIT, SCAN, CONNECTED/DISCONNECTED | **HIGH** — menyentuh core Baileys connection handler |
| `channel-service` → RabbitMQ | 2 emit baru: CREATED, SUSPENDED | MEDIUM |
| `audit-service` ← RabbitMQ | Consumer baru pattern `account-channel.event.log` | HIGH |
| `api-gateway` → `audit-service` (gRPC) | Client baru, proto baru | MEDIUM |
| Baileys `connection.update` | Modify handler yang sudah ada — high-risk area | **HIGH** |
| Redis (whatsapp-service) | Tambah 2 key namespace baru | LOW |
| FE `ChannelSocketProvider` | Extend event listener (optional Phase 1) | LOW |

> ⚠️ **Gap Integration:** PRD tidak mendefinisikan **siapa yang bertanggung jawab generate `connectionSessionId`**. Jika whatsapp-service generate saat emit CONNECTED, harus ada mekanisme penyimpanan session ID ke Redis agar bisa direferensikan saat DISCONNECTED emit. Arsitektur ini tidak disebutkan secara eksplisit. Ini adalah **architectural gap kritis** yang harus diselesaikan di design phase.

### 4.8 Reporting & Analytics Impact

| Aspek | Level |
|-------|-------|
| Dashboard analytics existing (`analytics-service`) | LOW — tidak ada perubahan |
| Event log sebagai data source baru | LOW — data tersimpan, siap dipakai future analytics (Section 16: Uptime analytics dashboard) |
| Success metrics PRD (Section 14) | Perlu instrumen: event capture completeness counter, query latency, dedup skipped count |

> ⚠️ **Gap Observability:** PRD Section 14 menyebut "Dedup skipped count" sebagai KPI tapi tidak mendefinisikan bagaimana counter ini diinstrumentasikan. Perlu disepakati: apakah log level `info`, metric counter, atau keduanya.

### 4.9 Financial & Compliance Impact

| Aspek | Level | Catatan |
|-------|-------|---------|
| Kalkulasi finansial | LOW | Tidak ada kalkulasi finansial yang berubah. |
| Audit trail | LOW+ | Event log memperkuat audit trail — positif untuk compliance. |
| Retention policy | MEDIUM | TTL 90 hari belum dikonfirmasi. Tergantung kebijakan Legal. FR-028 mengakui ini. |
| EC-010 (TTL + session pairing) | **HIGH** | Jika CONNECTED dihapus TTL tapi DISCONNECTED belum, lifetime calculation broken. Harus define behavior sebelum aktifkan TTL. |

### 4.10 Concurrency Impact

| Skenario | Risiko | Level | Mitigasi |
|----------|--------|-------|----------|
| Baileys reconnect loop: rapid close → open → close | Duplikat DISCONNECTED event dalam hitungan detik | **HIGH** | Redis dedup TTL key per `accountChannelId`. PRD menyebut "configured window" tapi **tidak mendefinisikan nilai default-nya** — ini GAP. |
| RabbitMQ consumer crash + retry | Duplikat event log ditulis | HIGH | Idempotency key `{accountChannelId}:{eventType}:{connectionSessionId?}:{occurredAt}` + unique index MongoDB. |
| Concurrent `InitInstance` dari 2 admin di 2 tab | 2 INIT event dalam detik yang sama | LOW | Acceptable — keduanya dicatat. Bukan duplikat karena `occurred_at` berbeda. |
| `duration_ms` race: DISCONNECTED emit sebelum CONNECTED tersimpan | `durationMs` bernilai negatif atau nol | MEDIUM | Gunakan `connectedAt` dari Redis (ditulis saat emit CONNECTED) sebagai baseline, bukan dari audit-service read. |
| Auto-restore bersamaan dengan manual connect | 2 CONNECTED event untuk akun yang sama hampir bersamaan | MEDIUM | Appendix 19.1: "Duplicate CONNECTED while active → Do not create new session unless prior is closed." Perlu logic session management di whatsapp-service. |
| Event ordering di consumer | Consumer memproses DISCONNECTED sebelum CONNECTED (rare) | LOW | `occurred_at` dari producer sebagai canonical time. Audit-service simpan berdasarkan `occurred_at`. |

---

## 5. Dependency Analysis

### 5.1 Dependency Matrix

| Service | Depends On | Tipe | Arah |
|---------|-----------|------|------|
| Event capture | `whatsapp-service` (emit) | Internal trigger | whatsapp → RMQ → audit |
| Event capture | `channel-service` (emit) | Internal trigger | channel → RMQ → audit |
| Event storage | `audit-service` (consumer + DB) | Async consumer | — |
| Event query | `api-gateway` → `audit-service` (gRPC) | Sync gRPC | gateway → audit |
| Session tracking | `whatsapp-service` → Redis | Shared cache | — |
| Deduplication | `whatsapp-service` → Redis | Shared cache | — |
| FE log tab | `api-gateway` REST endpoints | HTTP | FE → gateway |
| Supervisor RBAC scope | `channel-service` atau `company-service` (team scope) | Cross-service | audit-service / api-gateway → channel/company |

> ⚠️ **Gap Dependency:** RBAC Supervisor memerlukan api-gateway mengetahui akun-akun mana yang ada dalam scope team Supervisor. Ini bergantung pada `channel-service` (atau `company-service`) menyediakan team → account channel mapping. Dependency ini **tidak disebutkan eksplisit** di PRD Section 13.

### 5.2 Event Mapping

| RMQ Pattern | Producer | Consumer | Type |
|-------------|----------|----------|------|
| `account-channel.event.log` (CREATED) | channel-service | audit-service | fanout |
| `account-channel.event.log` (INIT) | whatsapp-service | audit-service | fanout |
| `account-channel.event.log` (SCAN) | whatsapp-service | audit-service | fanout |
| `account-channel.event.log` (CONNECTED) | whatsapp-service | audit-service | fanout |
| `account-channel.event.log` (DISCONNECTED) | whatsapp-service | audit-service | fanout |
| `account-channel.event.log` (SUSPENDED) | channel-service | audit-service | fanout |

Semua event menggunakan **1 pattern dengan `eventType` sebagai differentiator** — 1 consumer handler di audit-service.

### 5.3 Shared Resources

| Resource | Siapa yang Share | Risiko |
|----------|-----------------|--------|
| Redis | whatsapp-service (session + dedup keys) + existing Redis usage | Key namespace collision → gunakan prefix eksplisit `evt:session:` dan `evt:dedup:disc:` |
| `satuinbox_audit` MongoDB | Audit-service (existing audit trail + event log baru) | Collection baru, tidak konflik |
| `ChannelSocketProvider` FE | WhatsApp Web settings + existing connection status listener | Extend tanpa break existing listener |
| `libs/common` enums | Semua service | Naming conflict → gunakan `AccountChannelEventTypeEnum` terpisah |

---

## 6. Risk Analysis

| Risk | Probability | Impact | Severity | Mitigasi |
|------|------------|--------|----------|----------|
| **`SUSPENDED` action tidak ada di channel-service** | HIGH | HIGH | **CRITICAL** | Konfirmasi ke Engineering SEBELUM sprint. Jika tidak ada, SUSPENDED out of scope Phase 1. |
| **`SCAN` signal tidak reliable di Baileys** | MEDIUM | HIGH | **HIGH** | OQ-003 harus dijawab Engineering sebelum sprint. Fallback: emit SCAN dari `CONNECTED` metadata jika tidak ada explicit scan signal. |
| **`connectionSessionId` management tidak dispesifikasikan** | HIGH | HIGH | **HIGH** | Harus ada design decision: siapa generate ID, simpan di mana (Redis), bagaimana match CONNECTED↔DISCONNECTED. Ini adalah **architectural gap** di PRD v1.0. |
| **Dedup window value tidak didefinisikan** | HIGH | MEDIUM | HIGH | PRD hanya menyebut "configured window" tanpa nilai default. Harus ditetapkan (saran: 5 detik) dan dicatat di PRD. |
| **TTL retention + EC-010 (orphan pair)** | MEDIUM | HIGH | HIGH | Jika CONNECTED terhapus TTL tapi DISCONNECTED masih ada, lifetime broken. Define graceful handling sebelum aktifkan TTL. Alternatif: pair kedua event dalam retention window yang sama. |
| **Emit RMQ di `connection.update` handler crash** | LOW | HIGH | HIGH | Wrap emit dalam try-catch. Main flow tidak boleh terpengaruh (async). Feature flag sebagai kill switch. |
| **`metadata` whitelist tidak ada** | HIGH | MEDIUM | MEDIUM | Developer bisa menulis data sensitif ke metadata. Define dan enforce whitelist key sebelum implementasi. |
| **`event_status: FAILED` semantics ambigu** | HIGH | MEDIUM | MEDIUM | Kapan FAILED dicatat? Lihat Gap #3. Perlu klarifikasi di PRD. |
| **Idempotency key format tidak lengkap** | MEDIUM | MEDIUM | MEDIUM | Contoh di Section 9: `acc_123:CONNECTED:sess_abc:...` — trailing `...` tidak selesai. Format untuk CREATED/INIT (tanpa sessionId) tidak didefinisikan. |
| **Supervisor RBAC cross-service dependency** | MEDIUM | MEDIUM | MEDIUM | Team → account mapping perlu cross-service call. Latency + failure mode perlu didesain. |
| **`duration_ms` race condition** | LOW | LOW | LOW | Jika `connectedAt` dari Redis sudah expired saat DISCONNECTED dihitung. TTL Redis session key harus > expected max lifetime. |

---

## 7. Identified Gaps dalam PRD v1.0

Gap berikut ditemukan melalui analisa — **bukan ada di PRD, dan harus diselesaikan sebelum implementasi:**

### GAP-01: `connectionSessionId` — Tidak ada spesifikasi arsitektur [CRITICAL]

**PRD menyebut:** `connectionSessionId` MUST be included for CONNECTED and DISCONNECTED (FR-009). Appendix 19.1 mendefinisikan pairing rules.

**Yang tidak ada:** Siapa yang generate `connectionSessionId`? Bagaimana whatsapp-service menyimpannya untuk direferensikan saat DISCONNECTED emit? PRD tidak mendefinisikan komponen ini.

**Implikasi:** Tanpa ini, `durationMs` tidak bisa dihitung di sisi producer, dan pairing di audit-service menjadi probabilistik (urutan waktu), bukan deterministik (ID-based).

**Rekomendasi:** whatsapp-service generate UUID saat emit CONNECTED, simpan ke Redis `evt:session:{accountChannelId}` dengan TTL = expected max lifetime (misal 7 hari). Saat DISCONNECTED, fetch dari Redis, hitung `durationMs = occurredAt - connectedAt`, include dalam emit.

---

### GAP-02: `event_status` field — Semantik FAILED dan SKIPPED tidak jelas [HIGH]

**PRD menyebut:** Section 9 mendefinisikan `event_status` enum: `SUCCESS`, `FAILED`, `SKIPPED`.

**Yang tidak jelas:**
- Kapan `FAILED`? Jika main action (connect) gagal sebelum CONNECTED terjadi, tidak ada event CONNECTED — tidak ada yang perlu di-mark FAILED. Jika emit RMQ gagal, consumer tidak mendapat pesan dan tidak bisa tulis FAILED.
- Kapan `SKIPPED`? Untuk deduplication? Jika di-skip, event tidak disimpan sama sekali — tidak ada yang perlu dicatat.

**Implikasi:** Field ini bisa misleading atau tidak pernah terisi selain `SUCCESS`.

**Rekomendasi:** Klarifikasi atau hilangkan `event_status` dari schema Phase 1. Alternatif: simpan sebagai optional field hanya untuk kasus EC-003 (SCAN terkonfirmasi tapi CONNECTED gagal, jika ada signal-nya).

---

### GAP-03: Deduplication window value tidak didefinisikan [HIGH]

**PRD menyebut:** "deduplicate repeated `DISCONNECTED` within the configured window" (EC-005), "Duplicate disconnect from reconnect loop MUST be deduplicated" (FR-025).

**Yang tidak ada:** Nilai window (5 detik? 10 detik? 30 detik?) dan siapa yang "configure" ini (env var? hardcoded?).

**Rekomendasi:** Tetapkan default 5 detik. Expose sebagai env var `ACCOUNT_CHANNEL_DEDUP_WINDOW_MS=5000`. Tambahkan ke PRD sebagai NFR atau ke Section 9 (Field/Validation).

---

### GAP-04: `idempotency_key` format tidak lengkap [MEDIUM]

**PRD menyebut:** Section 9 contoh: `acc_123:CONNECTED:sess_abc:...` — trailing `...` tidak diselesaikan.

**Yang tidak ada:** Format lengkap. Untuk event yang tidak punya `connectionSessionId` (CREATED, INIT, SUSPENDED), apa komponen idempotency key-nya?

**Rekomendasi:** Tetapkan format: `{accountChannelId}:{eventType}:{connectionSessionId|"none"}:{occurredAt_unix_ms}`. Tambahkan ke PRD Section 9.

---

### GAP-05: Supervisor RBAC — cross-service dependency tidak dispesifikasikan [MEDIUM]

**PRD menyebut:** US-005: Supervisor hanya bisa view log akun dalam Team Inbox scope.

**Yang tidak ada:** Bagaimana api-gateway mengetahui akun mana yang ada dalam scope team Supervisor? Ini memerlukan cross-service lookup (channel-service atau company-service). Tidak disebutkan di Section 13 Dependencies.

**Rekomendasi:** Tambahkan ke Section 13: api-gateway perlu call `channel-service.getAccountChannelsByTeam(supervisorTeamIds)` untuk memvalidasi apakah `:id` dalam scope. Atau: audit-service query dengan filter `teamId` jika account channel memiliki `teamId` field yang didenormalisasi.

---

### GAP-06: `metadata` whitelist tidak didefinisikan [MEDIUM]

**PRD menyebut:** Section 9 `metadata` sebagai `Object`, contoh `{trigger: "auto_restore"}`. Section 13 menyebut "Safe metadata only."

**Yang tidak ada:** List key yang diizinkan. Tanpa ini, developer bisa menulis key sembarang.

**Rekomendasi:** Definisikan allowed metadata keys: `trigger` (enum: `auto_restore`, `manual`, `policy`), `deviceId`, `libraryVersion`, `slotIndex`. Strip key lain sebelum simpan.

---

### GAP-07: Global event log endpoint — in/out scope ambigu [LOW]

**PRD menyebut:** Semua FR dan US hanya bicara per-account (`/api/account-channels/:id/event-logs`). Section 16 menyebut "Global event log page" sebagai future.

**Yang tidak ada:** Eksplisit statement bahwa `GET /api/account-channels/event-logs` (tanpa `:id`) adalah OUT OF SCOPE Phase 1.

**Rekomendasi:** Tambahkan ke Section 17 (Limitations): "Global event log endpoint lintas semua akun adalah out of scope Phase 1."

---

## 8. Test Strategy

### 8.1 Functional Test Scope

**Positive (P0):**
- CREATED event tersimpan saat `createAccountChannel()` berhasil
- INIT event tersimpan saat `InitInstance()` dipanggil
- CONNECTED event tersimpan saat Baileys `connection.update { connection:'open' }`
- DISCONNECTED event tersimpan saat Baileys close, dengan reason dan `durationMs` yang benar
- SCAN event tersimpan hanya saat pairing/auth success confirmed (bukan saat QR generate)
- Query `GET /event-logs` mengembalikan events urut `occurredAt` desc
- Lifetime akun aktif = now - lastConnectedAt
- Lifetime akun disconnected = `durationMs` dari DISCONNECTED event

**Positive (P1):**
- Filter by `eventType` mengembalikan hanya event yang sesuai
- Filter by date range mengembalikan hanya event dalam range
- Pagination berfungsi (page 2 mengembalikan set berbeda dari page 1)
- Auto-restore CONNECTED punya `actorType:'system'` dan `metadata.trigger:'auto_restore'`
- Multiple sesi (CONNECTED → DISCONNECTED → CONNECTED → DISCONNECTED) semua tercatat
- `connectionSessionId` sama untuk pasangan CONNECTED dan DISCONNECTED

**Negative:**
- Agent `GET /event-logs` → 403 ACEL01
- Supervisor akses akun luar scope → 403 ACEL02 atau 0 result
- Query company lain tanpa scope → 0 result (tenant isolation)
- Request tanpa auth token → 401
- Invalid date range → 400 ACEL04
- Invalid `eventType` filter → 400 ACEL05
- Account channel tidak ditemukan → 404 ACEL03

**Edge Cases:**
- Akun belum pernah CONNECTED → lifetime empty state ("Belum pernah connected")
- Akun punya DISCONNECTED tanpa matching CONNECTED (orphan) → ditandai di metadata, tidak crash lifetime query
- QR di-refresh 10x tanpa scan → hanya ada INIT event (tidak ada SCAN berulang)
- Baileys emit close 5x dalam 3 detik (reconnect loop) → hanya 1 DISCONNECTED tersimpan
- RabbitMQ consumer crash + retry → tidak ada duplikat event (idempotency key)
- `reasonDetail` mengandung stack trace dari Baileys → tersanitasi sebelum simpan

### 8.2 Regression Test Scope

| Area | Risiko Regresi |
|------|----------------|
| `createAccountChannel()` | Emit RMQ tidak memperkenalkan latency atau error ke create flow |
| `InitInstance()` | Emit tidak mengganggu Baileys init sequence |
| `connection.update` handler | Core connection flow (reconnect, auto-restore) harus tetap normal setelah emit ditambahkan |
| `ChannelSocketProvider` FE | Existing connection status socket update masih berfungsi |
| `audit-service` existing functionality | Audit trail lain tidak terpengaruh module baru |
| QR refresh 30 detik | Tidak menghasilkan SCAN atau INIT event |

### 8.3 Integration Test Scope

- End-to-end: `createAccountChannel()` → CREATED event tersimpan di `satuinbox_audit`
- End-to-end: Baileys disconnect → DISCONNECTED tersimpan dengan reason yang benar
- End-to-end: Reconnect loop 5x → 1 DISCONNECTED dalam window dedup
- gRPC: api-gateway → audit-service `GetEventLogs` → response dengan pagination yang benar
- RabbitMQ: emit dari whatsapp-service → consumer audit-service menerima dan simpan dengan idempotency key

### 8.4 UAT Scenarios

| Scenario | User | Expected |
|----------|------|----------|
| Admin investigasi disconnect | Admin | Buka account detail → Log Aktivitas → lihat DISCONNECTED event dengan reason dan lifetime |
| Admin cek akun aktif | Admin | Lihat badge "Aktif sejak X hari" untuk akun CONNECTED |
| Admin filter DISCONNECTED saja | Admin | Hanya event DISCONNECTED muncul, events lain hilang |
| Admin cek akun tidak pernah connect | Admin | Empty state: "Belum pernah connected" |
| Supervisor buka akun scope-nya | Supervisor | Log muncul normal |
| Supervisor coba akun luar scope | Supervisor | Akses ditolak atau 0 result |
| Agent buka settings WA Web | Agent | Tab "Log Aktivitas" tidak terlihat |
| Agent hit endpoint langsung | Agent | 403 Forbidden |

### 8.5 Smoke Test (P0 — Gate Release)

Mengacu Appendix 19.3 PRD:
1. Buat akun → CREATED event muncul
2. Init connection → INIT event muncul
3. Scan/connect → SCAN (jika confirmed) + CONNECTED muncul
4. Disconnect/logout → DISCONNECTED muncul dengan reason dan lifetime
5. Query REST endpoint → 200 dengan data
6. Agent access → API 403, UI tab tidak muncul

### 8.6 Automation Candidates

| TC-ID | Scenario | Priority | Level |
|-------|----------|----------|-------|
| TC-ACEL-001 | createAccountChannel() emit CREATED event | P0 | Integration |
| TC-ACEL-002 | Baileys open emit CONNECTED + store sessionId Redis | P0 | Unit + Integration |
| TC-ACEL-003 | Baileys close emit DISCONNECTED + reason mapping + durationMs | P0 | Unit + Integration |
| TC-ACEL-004 | Deduplication: 5x DISCONNECTED dalam 3s → 1 event tersimpan | P0 | Integration |
| TC-ACEL-005 | Consumer retry idempotency — tidak duplikat | P0 | Integration |
| TC-ACEL-006 | Agent GET /event-logs → 403 | P0 | E2E |
| TC-ACEL-007 | Tenant isolation: query company lain → 0 result | P0 | Integration |
| TC-ACEL-008 | Lifetime dua sesi completed | P1 | Unit |
| TC-ACEL-009 | Lifetime akun aktif = now - lastConnectedAt | P1 | Unit |
| TC-ACEL-010 | SCAN tidak muncul saat QR di-refresh | P1 | Integration |
| TC-ACEL-011 | Filter by eventType | P2 | E2E |
| TC-ACEL-012 | Filter by date range | P2 | E2E |
| TC-ACEL-013 | connectionSessionId sama untuk CONNECTED + DISCONNECTED pair | P1 | Integration |
| TC-ACEL-014 | reasonDetail tersanitasi sebelum simpan | P1 | Unit |
| TC-ACEL-015 | Supervisor akses akun luar scope → denied | P1 | E2E |

---

## 9. Production Safety

### 9.1 Rollback Strategy

Fitur ini **additive only**:
- Collection baru → bisa di-drop
- Endpoint baru → bisa dinonaktifkan
- RMQ emit → bisa dimatikan via feature flag
- Tidak ada migration, tidak ada schema change existing
- **Rollback tidak merusak data existing dan tidak memerlukan data repair**

### 9.2 Feature Flag

PRD mendefinisikan: `ENABLE_ACCOUNT_CHANNEL_EVENT_LOG=false` (Section 15)

Pastikan flag:
- Memblok seluruh emit RMQ di whatsapp-service dan channel-service
- Mengembalikan 404 atau empty untuk endpoint event log
- Menyembunyikan tab FE

### 9.3 Staged Rollout (dari PRD Section 15)

Urutan deploy sudah benar di PRD:
1. audit-service (schema + consumer + index) — FIRST
2. api-gateway endpoints
3. FE tab (behind permission + flag)
4. channel-service + whatsapp-service producers (flag OFF)
5. Flip flag di staging → smoke test
6. Flip flag di production (limited tenant jika tersedia)

> ✅ Urutan ini sudah benar: consumer harus siap sebelum producer diaktifkan.

### 9.4 Monitoring & Alerting (dari PRD Section 12 + 14)

| Metric | Target | Alert |
|--------|--------|-------|
| RabbitMQ queue depth `account-channel.event.log` | Normal: < 100 | Alert > 1000 |
| Consumer error rate | Target: >= 99% success | Alert > 1% error |
| Event log write latency | — | Alert > 2s p99 |
| GET /event-logs latency | p95 <= 500ms | Alert > 500ms p95 |
| Dedup skipped count | Track as info counter | No alert, monitoring only |

> ⚠️ **Gap:** PRD tidak mendefinisikan instrumentasi "dedup skipped count" — ini perlu ditambahkan sebagai metric counter (Redis incr atau logger metric) saat deduplication skips.

### 9.5 Backward Compatibility

- ✅ Tidak ada perubahan schema existing
- ✅ Tidak ada perubahan API existing
- ✅ Emit RMQ fire-and-forget — jika consumer mati, main flow tidak terpengaruh
- ✅ FE changes additive (tab baru)
- ✅ Baileys behavior tidak berubah — hanya tambah emit setelah handler existing

---

## 10. Open Questions

OQ dari PRD v1.0 (Section 18) ditambah OQ baru dari analisa:

| OQ ID | Pertanyaan | Impact | Owner | Priority |
|-------|-----------|--------|-------|----------|
| OQ-001 | Does `suspendAccountChannel` already exist? | FR-006 BLOCKED jika tidak ada | Engineering | **BLOCKER** |
| OQ-003 | Exact Baileys signal untuk SCAN? | FR-003 di-risk jika tidak ada reliable signal | Engineering | **BLOCKER** |
| OQ-A01 | `connectionSessionId` — siapa generate, simpan di mana? | GAP-01 — arsitektur belum selesai | Engineering | **BLOCKER** |
| OQ-A02 | Dedup window value berapa? (default recommendation: 5s) | GAP-03 — NFR belum complete | Engineering + PM | HIGH |
| OQ-A03 | `event_status: FAILED` dan `SKIPPED` — kapan digunakan? | GAP-02 — semantik ambigu | Engineering | HIGH |
| OQ-A04 | `idempotency_key` format lengkap untuk semua event type? | GAP-04 — format incomplete | Engineering | HIGH |
| OQ-A05 | Supervisor RBAC: bagaimana api-gateway resolve team scope? | GAP-05 — cross-service dependency | Engineering | MEDIUM |
| OQ-A06 | `metadata` allowed key whitelist? | GAP-06 — security risk | Engineering | MEDIUM |
| OQ-002 | Retention policy final (90 hari?) | TTL config | PM / Legal | HIGH |
| OQ-004 | Lifetime: per-session, total, atau keduanya? | UI + API design | PM | MEDIUM |
| OQ-005 | Export CSV/XLSX required Phase 1? | Scope dan effort | PM | LOW |
| OQ-006 | Disconnect/suspend trigger notifikasi? | notification-service dependency | PM | LOW |
| OQ-007 | Event taxonomy generic untuk future channels? | Schema design | PM + Engineering | LOW |
| OQ-008 | SCAN → PAIRED saat Pairing Code tersedia? | Future enum design | PM + Engineering | LOW |

---

## 11. Recommendation

### Summary Temuan

PRD v1.0 sudah **solid** dalam banyak aspek:
- Event definitions jelas (Section 5)
- User stories + AC testable (Section 6)
- FR lengkap dengan conditional yang tepat (Section 7)
- Error handling terdefinisi (Section 10)
- Edge cases diidentifikasi (Section 11)
- Rollout safety sudah benar (Section 15)
- Limitations jelas (Section 17)
- 8 Open Questions sudah diidentifikasi (Section 18)
- Appendix 19.1 (session pairing rules) dan 19.3 (smoke test) sangat berguna

### Critical Gaps yang Harus Diselesaikan Sebelum Sprint

| # | Gap | Aksi |
|---|-----|------|
| GAP-01 | `connectionSessionId` architecture tidak dispesifikasikan | Engineering harus design dan tambahkan ke PRD sebagai sub-section |
| GAP-02 | `event_status: FAILED/SKIPPED` semantik ambigu | Klarifikasi atau remove dari Phase 1 |
| GAP-03 | Dedup window value tidak didefinisikan | PM + Engineering sepakati nilai default, tambah ke PRD |
| OQ-001 | `SUSPENDED` action belum dikonfirmasi ada | Engineering confirm before sprint start |
| OQ-003 | Baileys SCAN signal belum dikonfirmasi | Engineering confirm before sprint start |

### Go/No-Go Assessment

| Kondisi | Status |
|---------|--------|
| Event definitions jelas | ✅ Go |
| FR lengkap (kecuali SUSPENDED) | ✅ Go |
| Arsitektur audit-service tersedia | ✅ Go |
| Rollout safety dan feature flag defined | ✅ Go |
| `connectionSessionId` architecture | ⚠️ **Conditional — harus diselesaikan** |
| `SUSPENDED` action confirmed | ⚠️ **Conditional — OQ-001** |
| `SCAN` Baileys signal confirmed | ⚠️ **Conditional — OQ-003** |
| Dedup window value defined | ⚠️ **Conditional — GAP-03** |
| `event_status` semantik jelas | ⚠️ **Conditional — GAP-02** |

**Verdict: CONDITIONAL GO**
PRD v1.0 layak untuk sprint planning setelah 5 item conditional di atas diselesaikan. Tanpa penyelesaian GAP-01 (`connectionSessionId`) dan OQ-001 (`SUSPENDED`), implementasi akan hit blocker di tengah sprint.

---

## 12. Traceability Matrix

| Req ID | Requirement | Finding | Impact Area | TC-ID | Status |
|--------|-------------|---------|-------------|-------|--------|
| FR-001 | Catat CREATED | Emit di `createAccountChannel()` — straightforward | channel-service, audit | TC-ACEL-001 | Ready |
| FR-002 | Catat INIT | Emit di `InitInstance()` | whatsapp-service, audit | TC-ACEL-002 | Ready |
| FR-003 | Catat SCAN hanya saat confirmed | Bergantung pada OQ-003 (Baileys signal) | whatsapp-service | TC-ACEL-010 | **Blocked OQ-003** |
| FR-004 | Catat CONNECTED saat session open | `connection.update { open }` handler — ada | whatsapp-service | TC-ACEL-002 | Ready |
| FR-005 | Catat DISCONNECTED saat session close | `connection.update { close }` + reason mapping + dedup | whatsapp-service, concurrency | TC-ACEL-003, TC-ACEL-004 | Ready |
| FR-006 | Catat SUSPENDED | Bergantung OQ-001 | channel-service | — | **Blocked OQ-001** |
| FR-007 | Payload wajib (7 fields) | Semua fields terdefinisi di Section 9 | audit-service schema | TC-ACEL-001 | Ready |
| FR-008 | Snapshot name + phone | Denormalized — simpan saat event, bukan join | audit-service | TC-ACEL-001 | Ready |
| FR-009 | `connectionSessionId` di CONNECTED + DISCONNECTED | **GAP-01** — arsitektur belum selesai | whatsapp-service, Redis | TC-ACEL-013 | **Blocked GAP-01** |
| FR-010 | Disconnect reason + sanitized detail | Error mapping Baileys → enum + sanitize | whatsapp-service | TC-ACEL-003, TC-ACEL-014 | Ready |
| FR-011 | `idempotencyKey` per event | **GAP-04** — format belum complete | audit-service | TC-ACEL-005 | **Needs clarification** |
| FR-012 | Completed lifetime = CONNECTED→DISCONNECTED pair | Pairing by `connectionSessionId` — **blocked GAP-01** | audit-service, api-gateway | TC-ACEL-008 | **Blocked GAP-01** |
| FR-013 | Active lifetime = last CONNECTED → now | `connectedAt` dari Redis, bukan DB query | api-gateway | TC-ACEL-009 | Ready |
| FR-014 | Total lifetime = sum sesi completed | Sum `durationMs` in query range | api-gateway | TC-ACEL-008 | Ready |
| FR-015 | Timeline UI per akun | Tab komponen FE | FE | TC-ACEL-011 | Ready |
| FR-016 | Sort by `occurredAt` desc | Default query sort | api-gateway, audit | TC-ACEL-001 | Ready |
| FR-017 | Display: type, timestamp, actor, reason, lifetime | UI render per item | FE | TC-ACEL-011 | Ready |
| FR-018 | Filter by event type + date range | Query params di endpoint | api-gateway, FE | TC-ACEL-011, TC-ACEL-012 | Ready |
| FR-019 | Pagination atau load more | `page` + `limit` params | api-gateway | TC-ACEL-011 | Ready |
| FR-020 | Admin akses semua log dalam company | RBAC Admin scope | api-gateway | TC-ACEL-006, TC-ACEL-007 | Ready |
| FR-021 | Supervisor scope team inbox | **GAP-05** — cross-service team scope | api-gateway, channel/company | TC-ACEL-015 | **Needs clarification** |
| FR-022 | Agent tidak bisa akses | RBAC guard + FE hide | api-gateway, FE | TC-ACEL-006 | Ready |
| FR-023 | Server-side RBAC + tenant scope | `RolesGuard` + companyId filter | api-gateway | TC-ACEL-006, TC-ACEL-007 | Ready |
| FR-024 | Async write, tidak block lifecycle | RabbitMQ fire-and-forget, try-catch wrap | whatsapp-service, channel-service | TC-ACEL-001 regression | Ready |
| FR-025 | Dedup disconnect reconnect loop | Redis TTL dedup key — **GAP-03**: window belum defined | whatsapp-service, Redis | TC-ACEL-004 | **Needs value** |
| FR-026 | Consumer idempotent | Idempotency key + unique index — **GAP-04** format perlu lengkap | audit-service | TC-ACEL-005 | **Needs clarification** |
| FR-027 | QR refresh 30s tidak trigger SCAN | Emit SCAN hanya dari pairing confirmed, bukan QR generate | whatsapp-service | TC-ACEL-010 | **Blocked OQ-003** |
| FR-028 | Retention policy confirmed sebelum TTL | TTL disabled sampai disetujui | audit-service, Legal/PM | — | **Blocked OQ-002** |
| FR-029 | TTL configurable | Env var atau config — perlu di-spec | audit-service | — | Pending |
| NFR-01 | Query p95 ≤ 500ms | Compound index wajib ada sebelum deploy | DB, performance | — | Ready |
| NFR-02 | Reliability async + idempotent | RabbitMQ noAck:false + retry + idempotency key | Integration | TC-ACEL-005 | Ready |
| NFR-03 | RBAC + tenant scope | Server-side enforcement, tidak hanya FE | Security | TC-ACEL-006, TC-ACEL-007 | Ready |
| NFR-04 | No sensitive data di logs | Sanitize reasonDetail, metadata whitelist | Security | TC-ACEL-014 | **GAP-06 needs whitelist** |
