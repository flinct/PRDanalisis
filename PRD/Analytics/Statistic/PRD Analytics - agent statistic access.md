# **PATCH PRODUCT REQUIREMENT DOCUMENT — Agent Statistic Access**

> **Feature**: Agent Statistic Access (Mini Dashboard) — Guard Fix, Logic Fix, Export Fix, Backfill
> **Author**: Dany Christian
> **Product Manager**: Dany Christian
> **Engineering Lead**: Naftal
> **Product**: SatuInbox
> **Domain**: Analytics + Company and People (RBAC)
> **Version**: v1.0
> **Status**: Draft
> **Source Brief**: `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md` v1.5
> **Rules Applied**: `Rules/prd-writing-rule.md`
> **Related PRD**: `PRD/Analytics/*`, `PRD/Company n people/PRD Setting - Role management.md`

---

## **1. Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-08-10 | Dany Christian | Initial PRD patch: guard fix 5 analytics controller (GAP-1 critical data leak), isSelfOnlyScope logic fix (GAP-2), broadcast permission fix (GAP-3), export gate READ→EXPORT (GAP-5), backfill `statistic:read_own` ke role Agent existing, permission matrix, error handling, edge cases, migration & rollout plan. |

---

## **2. Overview**

| Item | Description |
|------|-------------|
| Purpose | Menutup data leak aktif di 4 analytics controller yang hanya menggunakan `JwtAuthGuard` tanpa `PermissionsGuard`, memperbaiki logic bug pada `isSelfOnlyScope()`, menambahkan permission check di broadcast controller, mengubah gate export dari `READ` ke permission terpisah `EXPORT`, dan melakukan backfill permission `statistic:read_own` ke role Agent di workspace existing. |
| Scope | Guard fix 5 controller, isSelfOnlyScope logic fix, export permission terpisah, backfill permission, unit test, QA validation, doc sync. |
| Key Capabilities | (1) Semua analytics endpoint protected oleh PermissionsGuard. (2) Agent existing mendapat `statistic:read_own` via backfill. (3) Agent hanya melihat data miliknya sendiri. (4) Export hanya untuk role dengan `statistic:export`. (5) Env var toggle untuk instant rollback guard fix. |
| Outcome | Data leak = 0. Agent akses statistik pribadi = 100% post-backfill. Export tersembunyi dari Agent. |

### **Scope Definition**

| In Scope | Out of Scope |
|----------|-------------|
| GAP-1 fix: PermissionsGuard + permission check di 4 analytics controller (`analytics`, `member-analytics`, `responsiveness-analytics`, `ticket-analytics`) | Dashboard/halaman/endpoint baru |
| GAP-2 fix: `isSelfOnlyScope()` logic — tambah cek `READ` & `READ_TEAM` | Perubahan permission enum (sudah lengkap) |
| GAP-3 fix: Permission check + scope enforcement di `broadcast-analytics.controller.ts` | Perubahan definisi metrik |
| GAP-4 fix: Permission check di `analytics-metadata.controller.ts` (konsistensi) | FE automated test backfill (0 test infrastructure) |
| GAP-5 fix: Permission `statistic:export` terpisah, gate export pindah `READ`→`EXPORT` | Audit log system-wide (defer ke compliance initiative) |
| Backfill `statistic:read_own` ke role Agent di semua workspace existing | |
| Unit test `isSelfOnlyScope()` | |
| Integration test backfill idempotency | |
| Env var toggle `ANALYTICS_PERMISSIONS_GUARD_ENABLED` | |
| Doc sync PRD Role management Appendix E.4 | |

---

## **3. Problem Statement**

| ID | Problem | Impact |
|----|---------|--------|
| PS-001 | 4 analytics controller hanya menggunakan `JwtAuthGuard` tanpa `PermissionsGuard` — user dengan JWT valid tapi tanpa permission statistic apapun dapat mengakses semua endpoint analytics dan mendapat data semua agent. | **Data leak aktif.** User role Sales atau role lain tanpa statistic permission bisa melihat data performa semua agent. Pelanggaran isolasi tenant dan potensi pelanggaran privasi. |
| PS-002 | `isSelfOnlyScope()` memiliki logic bug — hanya mengecek `ALL` dan `wildcard` tanpa mengecek `READ` dan `READ_TEAM`. User dengan `READ_TEAM+READ_OWN` salah di-force ke self-only. | User yang seharusnya bisa melihat team data hanya melihat data sendiri. Precedence permission tidak konsisten (OQ-11 = confirmed BUG). |
| PS-003 | `broadcast-analytics.controller.ts` tidak memiliki permission check maupun scope enforcement. | User tanpa permission bisa mengakses broadcast analytics. |
| PS-004 | Export endpoint mengharuskan `StatisticPermission.READ` — agent dengan `READ_OWN` saja terblokir dari semua export. | Agent tidak bisa export data sendiri (sebelum keputusan OQ-08). Setelah OQ-08: export DI-HIDE dari agent, perlu permission terpisah. |
| PS-005 | Seeder hanya berjalan untuk company baru (`role.seed.ts` pakai `$setOnInsert+upsert`) — workspace existing tidak mendapat `statistic:read_own` di role Agent. | Agent di workspace existing tidak punya akses statistik meskipun feature code sudah shipped (sejak 2026-05-18). |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
|-----------|-----------|
| Tutup data leak analytics | KR-1: 100% analytics endpoint (6 controller) protected oleh PermissionsGuard setelah deploy ver2.8.1 |
| Agent dapat akses statistik pribadi | KR-2: 100% role Agent di workspace existing memiliki `statistic:read_own` setelah backfill |
| Isolasi data antar agent terjaga | KR-3: 0 kasus Agent A melihat data Agent B (data leak = 0) post-deploy |
| Export hanya untuk role berwenang | KR-4: 100% export endpoint menggunakan gate `statistic:export`; agent `READ_OWN` tidak dapat akses export |
| Guard fix dapat di-rollback tanpa code deploy | KR-5: Env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED` aktif di 5 controller; rollback = set `false` + restart |

---

## **5. User Stories & Acceptance Criteria**

| ID | Role | Story | Acceptance Criteria |
|----|------|-------|---------------------|
| US-001 | Agent | Saya ingin melihat statistik performa pribadi (FRT, RLT, CSAT) di halaman Analitik | Given Agent login dengan `statistic:read_own`, When membuka halaman Analitik, Then hanya data miliknya yang tampil (Member Performance: 1 baris, Responsiveness: self-filtered, CSAT: data sendiri) |
| US-002 | Admin | Saya ingin memastikan user tanpa permission statistic tidak bisa mengakses endpoint analytics | Given user dengan role Sales (tanpa `statistic:*`), When mengakses endpoint analytics manapun, Then response HTTP 403 |
| US-003 | Admin | Saya ingin export report hanya bisa diakses oleh user dengan permission khusus export | Given user dengan `statistic:read_own` (tanpa `statistic:export`), When mencoba akses export endpoint, Then response HTTP 403 dan tombol export tidak terlihat di FE |
| US-004 | Admin | Saya ingin backfill permission `statistic:read_own` ke role Agent existing tanpa mengubah kustomisasi permission lain | Given role Agent existing dengan kustomisasi admin, When backfill dijalankan, Then `statistic:read_own` ditambahkan tanpa menghapus permission lain |

---

## **6. Functional Requirements**

| ID | Priority | System Behavior | Acceptance Criteria |
|----|----------|----------------|---------------------|
| FR-001 | P0 | System **MUST** menambahkan `PermissionsGuard` dengan permission check (`StatisticPermission.READ \| READ_OWN \| READ_TEAM \| ALL`) ke `analytics.controller.ts`, `member-analytics.controller.ts`, `responsiveness-analytics.controller.ts`, dan `ticket-analytics.controller.ts`. | 1. Given user tanpa permission statistic, When mengakses endpoint analytics manapun, Then response HTTP 403 dengan pesan "Insufficient permissions". 2. Given user dengan `statistic:read_own`, When mengakses endpoint analytics, Then response HTTP 200 dengan data miliknya. 3. Given user dengan `statistic:all_access`, When mengakses endpoint analytics, Then response HTTP 200 dengan data semua agent. |
| FR-002 | P0 | System **MUST** memperbaiki `isSelfOnlyScope()` di `analytics-scope.util.ts:21` agar mengecek `!hasStatisticRead && !hasStatisticReadTeam` selain `!hasStatisticAll && !hasWildcard`. | 1. Given user dengan `READ_TEAM+READ_OWN` (tanpa `READ`/`ALL`), When memanggil analytics endpoint, Then `isSelfOnlyScope()` mengembalikan `false` (melihat team data). 2. Given user dengan `READ_OWN` saja, When memanggil analytics endpoint, Then `isSelfOnlyScope()` mengembalikan `true` (hanya data sendiri). 3. Given user dengan `READ` saja, When memanggil analytics endpoint, Then `isSelfOnlyScope()` mengembalikan `false`. 4. Given user dengan `ALL`, When memanggil analytics endpoint, Then `isSelfOnlyScope()` mengembalikan `false`. |
| FR-003 | P0 | System **MUST** menambahkan permission check + scope enforcement di `broadcast-analytics.controller.ts`. | 1. Given user tanpa permission statistic, When mengakses broadcast analytics endpoint, Then response HTTP 403. 2. Given user dengan `READ_OWN`, When mengakses broadcast analytics, Then scope enforcement memfilter data sesuai permission. |
| FR-004 | P0 | System **MUST** menambahkan permission check di `analytics-metadata.controller.ts` untuk konsistensi. | 1. Given user tanpa permission statistic, When mengakses metadata endpoint, Then response HTTP 403. |
| FR-005 | P0 | System **MUST** menambahkan key `StatisticPermission.EXPORT` (`statistic:export`) di `default-permission.constant.ts` dan mengganti gate 4 export op di `export-report-job.controller.ts` dari `StatisticPermission.READ` ke `StatisticPermission.EXPORT`. | 1. Given user dengan `statistic:read_own` (tanpa `statistic:export`), When mencoba akses export endpoint, Then response HTTP 403. 2. Given user dengan `statistic:export`, When mengakses export endpoint, Then response HTTP 200 dan export berjalan normal. 3. Given Admin/Supervisor dengan `statistic:all_access`, When mengakses export endpoint, Then response HTTP 200 (wildcard `statistic:*` otomatis cover `statistic:export` via `permission.guard.ts:39`). 4. Given role dengan `statistic:read` (tanpa ALL) yang belum di-backfill `statistic:export`, When mengakses export endpoint, Then response HTTP 403. |
| FR-006 | P0 | System **MUST** melakukan backfill `statistic:read_own` ke role Agent (`code=AGENT`) di SEMUA company existing yang belum memiliki permission tersebut, menggunakan operasi `$addToSet`. | 1. Given company existing dengan role Agent tanpa `statistic:read_own`, When backfill dijalankan, Then `statistic:read_own` ditambahkan ke array permission role Agent. 2. Given company existing dengan role Agent yang sudah memiliki `statistic:read_own`, When backfill dijalankan 2x, Then tidak ada duplikasi permission (idempotent). 3. Given role Agent yang sudah dikustom admin (permission lain ditambah/hapus), When backfill dijalankan, Then kustomisasi admin tidak hilang (non-destructive, `$addToSet` bukan overwrite). |
| FR-007 | P0 | System **MUST** melakukan backfill `statistic:export` ke role yang memiliki `statistic:read` tanpa `statistic:all_access` (agar tidak kehilangan export saat gate pindah dari `READ` ke `EXPORT`). | 1. Given role dengan `statistic:read` (tanpa ALL/wildcard), When gate export berubah dari `READ` ke `EXPORT`, Then role tersebut mendapat `statistic:export` via backfill sehingga export tetap berfungsi. 2. Given Admin/Supervisor dengan `statistic:all_access`, When gate export berubah, Then tidak perlu backfill (wildcard cover). |
| FR-008 | P0 | System **MUST** menyediakan env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED` yang membungkus `PermissionsGuard` secara conditional di 5 controller, dengan default `true`. | 1. Given env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED=true`, When user tanpa permission mengakses analytics endpoint, Then response HTTP 403. 2. Given env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED=false`, When user tanpa permission mengakses analytics endpoint, Then response HTTP 200 (perilaku lama, guard dilangkahi). 3. Given env var tidak diset, When service start, Then guard aktif (default `true`). |
| FR-009 | P1 | System **MUST** menyediakan dry-run mode untuk backfill script yang mencatat jumlah role yang akan di-update sebelum apply. | 1. Given backfill script dijalankan dengan flag dry-run, When menemukan role Agent tanpa `statistic:read_own`, Then log jumlah role yang akan di-update tanpa melakukan perubahan data. |
| FR-010 | P1 | System **MUST** mencatat audit log untuk setiap operasi backfill (company, roleId, permission added, timestamp). | 1. Given backfill script mengubah role Agent di company X, When `$addToSet` berhasil, Then audit log tercatat dengan company ID, role ID, permission key, dan timestamp. |
| FR-011 | P1 | System **MUST** menyembunyikan tombol/menu export di FE untuk user tanpa permission `statistic:export`. | 1. Given user dengan `READ_OWN` (tanpa `statistic:export`), When membuka halaman analytics, Then tombol export tidak terlihat. 2. Given user dengan `statistic:export`, When membuka halaman analytics, Then tombol export terlihat. |

---

## **7. Permission Matrix**

| Role | View Statistik Sendiri | View Statistik Team | View Semua Statistik | Export Report | Metadata Access | Broadcast Analytics | Scope Enforcement |
|------|----------------------|--------------------|--------------------|--------------|----------------|--------------------|--------------------|
| Agent (`READ_OWN`) | ✅ Allowed | ❌ Hidden | ❌ Hidden | ❌ Hidden | ✅ Allowed | ✅ Self-filtered | `isSelfOnlyScope=true` — `resolveAgentId` force `user.id` |
| Supervisor (`READ_TEAM`) | ✅ Allowed | ✅ Allowed | ❌ Hidden | ✅ Allowed (jika punya `statistic:export`) | ✅ Allowed | ✅ Team-filtered | `resolveTeamId` filter by team |
| Admin (`READ`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed (jika punya `statistic:export`) | ✅ Allowed | ✅ Unfiltered | No scope restriction |
| Admin/Supervisor (`ALL`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed (wildcard cover) | ✅ Allowed | ✅ Unfiltered | No scope restriction, wildcard `statistic:*` cover semua termasuk `statistic:export` |
| User tanpa permission statistic | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | PermissionsGuard block semua |
| Agent (lama, belum backfill) | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | Tidak punya `statistic:read_own` |

> **Catatan:** Agent yang belum di-backfill akan mendapat 403 di semua analytics endpoint. Setelah backfill, Agent mendapat akses statistik sendiri. Admin yang menambah `statistic:read` ke role Agent: behavior = BUG (OQ-11) — `statistic:read` tidak override `READ_OWN` karena `isSelfOnlyScope` tidak cek `READ`. Sudah di-scope fix di GAP-2.

---

## **8. Error Handling**

| ID | Type | Handling | UI/UX |
|----|------|---------|-------|
| EH-001 | Permission Denied — user tanpa permission statistic mengakses analytics endpoint | System MUST mengembalikan HTTP 403 dengan response body `{"statusCode":403,"message":"Insufficient permissions"}` (standar error SatuInbox). Tidak ada data yang dikembalikan. | FE menampilkan pesan error standar "Anda tidak memiliki akses ke halaman ini" atau redirect ke dashboard. Menu analytics tidak muncul di SideNav (sudah di-gate oleh `SideNavLists.tsx:94-96`). |
| EH-002 | Export failure — user tanpa `statistic:export` mencoba akses export endpoint | System MUST mengembalikan HTTP 403. Gate berubah dari `StatisticPermission.READ` ke `StatisticPermission.EXPORT`. | FE: tombol export tersembunyi (FR-011). Jika user mengakses endpoint langsung: 403. |
| EH-003 | Backfill failure — migration script gagal di tengah jalan | System **MUST** log error per-company dan melanjutkan ke company berikutnya (partial failure tidak memblokir seluruh batch). Script **MUST** idempotent — dapat dijalankan ulang tanpa duplikasi. | Engineering: audit log mencatat company yang gagal. Re-run script untuk retry. |
| EH-004 | Backfill failure — koneksi MongoDB timeout saat `$addToSet` | System **MUST** me-retry 3x dengan exponential backoff sebelum skip company tersebut dan log error. | Engineering: log per-company status (success/fail/retry). |
| EH-005 | Guard toggle — env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED` tidak terbaca | System **MUST** treat missing env var sebagai `true` (secure by default). Guard aktif. | Tidak ada perubahan UI — perilaku sama dengan `true`. |

---

## **9. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
|----|----------|-------------------|-------|
| EC-001 | Agent tanpa team memanggil analytics endpoint | `resolveTeamId` strip team, `resolveAgentId` force `user.id`. Agent melihat data miliknya tanpa team context. Empty state jika belum ada data. | FE: section team tersembunyi, data hanya milik agent. |
| EC-002 | Admin menambah `statistic:read` ke role Agent yang sudah punya `READ_OWN` | **BUG (OQ-11):** `statistic:read` tidak override `READ_OWN`. `isSelfOnlyScope()` tidak cek `READ` — user tetap di-force ke self-only. Fix GAP-2 memperbaiki ini: user `READ_TEAM+READ_OWN` akan melihat team data. | FE priority chain: `ALL > READ_TEAM > READ_OWN`. `statistic:read` tidak ada di priority chain. |
| EC-003 | Backfill dijalankan 2x terhadap role Agent yang sama | `$addToSet` idempotent — tidak ada duplikasi permission. Role tidak berubah. | Tidak ada perubahan UI. |
| EC-004 | Role Agent sudah dikustom admin (permission lain ditambah/hapus) | Backfill hanya menambah `statistic:read_own` via `$addToSet`. Permission lain tidak terpengaruh. Non-destructive. | Kustomisasi admin tetap utuh. |
| EC-005 | CSAT multi-agent — conversation ditangani Agent A dan B, customer memberi rating | Model CSAT (`base-csat.schema.ts:42-43`) memiliki `assignees?: CsatAssignee[]` (array). `member-analytics.service.ts:446` filter by `assignees.userId.some()`. Semua agent yang ada di `assignees[]` melihat CSAT tersebut. | Agent A dan Agent B keduanya melihat CSAT di statistik masing-masing. |
| EC-006 | Loading state saat `isSelfOnly=true` dan `selfUserId` belum resolved | FE **MUST NOT** menampilkan data sebelum filter self-only terpasang. Loading state ditampilkan sampai `selfUserId` tersedia. | Prevent flash data orang lain. |
| EC-007 | User yang sebelumnya "bisa" akses analytics (tanpa permission statistic) setelah GAP-1 fix | User mendapat 403. Ini **intended** (fix data leak). Perlu release note. | Menu analytics hilang dari SideNav. Jika user bookmark URL langsung: halaman error 403. |
| EC-008 | Rollback guard fix via env var `false` | User tanpa permission statistic kembali bisa akses analytics (perilaku pra-fix). Data leak kembali aktif. **Hanya untuk emergency rollback.** | Menu analytics muncul kembali untuk semua user login. |
| EC-009 | Rollback backfill via `$pull` | Permission `statistic:read_own` dihapus dari role Agent. Agent kehilangan akses statistik. Tapi FE cached session masih menampilkan menu analytics sampai session invalidation / force re-login. | Agent harus re-login untuk melihat perubahan. Tanpa re-login: menu masih muncul tapi endpoint return 403. |
| EC-010 | `OfflineReportSection` dan `BroadcastSection` untuk agent `READ_OWN` | Semua section analytics boleh dilihat agent (OQ-09). Yang restrict = data di dalam section (BE scope enforcement), bukan menu visibility. Hide: tombol "Create Report" untuk user tanpa `statistic:export`. | FE: semua 6 section tampil di `StatisticNav`. Tombol Create Report hidden untuk agent. |
| EC-011 | Role dengan `statistic:read` (tanpa ALL) yang belum di-backfill `statistic:export` setelah gate pindah | Export return 403. Harus di-backfill `statistic:export` (FR-007). | Export button hilang/error. |

---

## **10. UI & UX Requirements**

| Component | Behavior | Permission Gate | States |
|-----------|----------|----------------|--------|
| StatisticNav (sidebar) | Tampilkan semua 6 section (conversations, ticket, responsiveness, member-performance, broadcast, offline-report) | Menu tampil untuk SEMUA user dengan `statistic:read*` / `statistic:all_access` / `statistic:read_own` / `statistic:read_team` | Loading: skeleton nav. Error: fallback. Empty: tidak applicable |
| MemberPerformanceSection | Tampilkan hanya baris agent sendiri saat `isSelfOnly` | `isSelfOnly=true` (BE `resolveAgentId` force self) | Loading: skeleton table. Empty (0 data): "Belum ada data performa". Error: toast |
| ResponsivenessFilterOptions | Sembunyikan filter agent/team saat `isSelfOnly` | `isSelfOnly=true` | Loading: skeleton. Error: fallback |
| StatisticFilter | Lock filter ke agent sendiri saat `isSelfOnly` (`SelfFilterChip isLocked`) | `isSelfOnly=true` | Loading: skeleton. Error: fallback |
| CsatSection + CsatResponsesTable | Data filtered by BE guard (`assignees[]`) | `statistic:read_own` → data agent sendiri | Loading: skeleton. Empty: "Belum ada CSAT". Error: toast |
| OfflineReportSection | Semua user bisa lihat, tapi tombol "Create Report" disembunyikan | `statistic:export` untuk tombol Create | Loading: skeleton. Empty: "Belum ada report". Error: toast |
| BroadcastSection | Data company-level (bukan agent-scoped) | Permission guard (GAP-3 fix) | Loading: skeleton. Empty: "Belum ada data broadcast". Error: toast |
| Export buttons | Sembunyikan tombol export untuk user tanpa `statistic:export` | `statistic:export` permission | - |

---

## **11. Field & Validation**

| Field | Type | Required | Default | Validation | Notes |
|-------|------|----------|---------|------------|-------|
| `StatisticPermission.EXPORT` | `string` (`statistic:export`) | Yes (new key) | N/A | Harus unik di enum, tidak boleh collision dengan key existing | Ditambahkan di `default-permission.constant.ts` baris 129 |
| `ANALYTICS_PERMISSIONS_GUARD_ENABLED` | `env var (boolean)` | No | `true` | `true`/`false`/unset (default `true`) | Wrap `PermissionsGuard` conditional di 5 controller |
| Role Agent permission array | `string[]` | Yes | seed value | `$addToSet` (idempotent), jangan overwrite | Backfill target: `statistic:read_own` |

---

## **12. API / Event Contract**

### **12.1 Guard Fix — Response Contract Change**

Semua analytics endpoint berikut berubah response untuk user tanpa permission statistic:

| Endpoint | Controller | Method | Before (Current) | After (Post-Fix) | Permission Required |
|----------|-----------|--------|-------------------|-------------------|---------------------|
| `/analytics/*` | `analytics.controller.ts:38` | GET | HTTP 200 (data semua agent) | HTTP 403 | `StatisticPermission.READ \| READ_OWN \| READ_TEAM \| ALL` |
| `/analytics/member/*` | `member-analytics.controller.ts:41` | GET | HTTP 200 (data semua agent) | HTTP 403 | `StatisticPermission.READ \| READ_OWN \| READ_TEAM \| ALL` |
| `/analytics/responsiveness/*` | `responsiveness-analytics.controller.ts:42` | GET | HTTP 200 (data semua agent) | HTTP 403 | `StatisticPermission.READ \| READ_OWN \| READ_TEAM \| ALL` |
| `/analytics/ticket/*` | `ticket-analytics.controller.ts:36` | GET | HTTP 200 (data semua agent) | HTTP 403 | `StatisticPermission.READ \| READ_OWN \| READ_TEAM \| ALL` |
| `/analytics/broadcast/*` | `broadcast-analytics.controller.ts:38` | GET | HTTP 200 (zero check) | HTTP 403 | `StatisticPermission.READ \| READ_OWN \| READ_TEAM \| ALL` |
| `/analytics/metadata/*` | `analytics-metadata.controller.ts:38` | GET | HTTP 200 (zero check) | HTTP 403 | `StatisticPermission.READ \| READ_OWN \| READ_TEAM \| ALL` |

### **12.2 Export Gate Change**

| Endpoint | Controller | Method | Before (Current) | After (Post-Fix) | Permission Required |
|----------|-----------|--------|-------------------|-------------------|---------------------|
| 4 export op | `export-report-job.controller.ts:93,140,190,232` | POST/GET | Gate: `StatisticPermission.READ` | Gate: `StatisticPermission.EXPORT` | `statistic:export` (baru) |

### **12.3 Error Response Contract**

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

> **Breaking change untuk user tanpa permission:** Response berubah dari HTTP 200 (dengan data) menjadi HTTP 403. Ini **intended** (fix data leak). FE sudah menangani 403 via `SideNavLists.tsx` gating — user tidak akan melihat menu analytics.

---

## **13. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
|------|------|-------|------------|---------|
| **Guard Fix (GAP-1,3,4)** | Tambah `PermissionsGuard` + `@Permissions()` decorator ke 6 controller. Bungkus dengan env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED` (default `true`). Pattern existing: `configService.get('AGGREGATION_ENABLED')`. | Engineering (BE) | QA: user tanpa permission dapat 403 di semua 6 endpoint. User dengan permission masih bisa akses. | Set env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED=false` + restart. Instant rollback, zero code deploy. |
| **Logic Fix (GAP-2)** | Fix `isSelfOnlyScope()` — tambah cek `!read && !readTeam`. Unit test 4 cases. | Engineering (BE) | Unit test: `READ_OWN` only → true, `READ_TEAM+READ_OWN` → false, `READ` → false, `ALL` → false. | Rollback code deploy (revert commit). |
| **Export Fix (GAP-5)** | Tambah `StatisticPermission.EXPORT`. Ganti gate 4 export op. Backfill `statistic:export` ke role dengan `statistic:read` (tanpa ALL). | Engineering (BE) | QA: agent `READ_OWN` tidak bisa export. Admin/Supervisor tetap bisa export. Role `read`-only di-backfill. | Rollback code deploy + `$pull` `statistic:export` dari role yang di-backfill. |
| **Backfill — `statistic:read_own`** | Migration script: `$addToSet` `statistic:read_own` ke role `AGENT` di SEMUA company existing. Dry-run dulu, lalu apply. | Engineering (BE) | Dry-run: log jumlah role. Post-apply: query verify role Agent punya `statistic:read_own`. Idempotent test: run 2x, tidak duplikat. | `$pull` `statistic:read_own` dari role AGENT. Idempotent & reversible. |
| **Backfill — `statistic:export`** | Migration script: `$addToSet` `statistic:export` ke role yang punya `statistic:read` tanpa `statistic:all_access`. | Engineering (BE) | Query verify role dengan `statistic:read` (tanpa ALL) punya `statistic:export`. | `$pull` `statistic:export`. |
| **Session Invalidation** | Setelah rollback backfill: force re-login agent supaya menu analytics hilang (FE cached session). | Engineering (BE+FE) | QA: setelah rollback + re-login, menu analytics tidak muncul untuk agent. | N/A — re-login sudah rollback. |
| **Rollout Stages** | 1. Deploy code + env var `true` (secure by default). 2. Run dry-run backfill. 3. Run backfill apply. 4. Monitor 24 jam. 5. Jika issue: env var `false` untuk guard, `$pull` untuk backfill. | Engineering + PM | Smoke test: agent login → buka statistik → data miliknya only. Admin login → data semua agent. Export berfungsi untuk admin. | Env var `false` + `$pull` backfill + session invalidation. |

---

## **14. Non-Functional Requirements**

| Category | Requirement |
|----------|------------|
| Performance | Guard check (`PermissionsGuard`) **MUST** menambah response time ≤ 5ms per request. Permission lookup dari `RequestContextData` (sudah di-load oleh `JwtAuthGuard`), bukan query baru. |
| Security | Tenant isolation: user **MUST NOT** dapat mengakses data analytics dari company lain. Scope enforcement (`resolveAgentId`, `resolveTeamId`) sudah menjamin ini. |
| Security | Secure by default: env var `ANALYTICS_PERMISSIONS_GUARD_ENABLED` **MUST** default ke `true` jika tidak diset. |
| Reliability | Backfill script **MUST** idempotent — `$addToSet` tidak menduplikasi permission. Re-run aman. |
| Reliability | Backfill script **MUST** non-destructive — `$addToSet` bukan overwrite array. Kustomisasi admin tetap utuh. |
| Observability | Backfill script **MUST** log per-company: company ID, role ID, permission key, timestamp, status (success/fail). |
| Observability | Guard deny **MUST** ter-log (user ID, endpoint, timestamp) untuk audit dan monitoring data leak prevention. |

---

## **15. Success Metrics**

| KPI | Target | Time Window | Data Source |
|-----|--------|-------------|-------------|
| Data leak incidents (user tanpa permission akses analytics) | 0 | Post-deploy ver2.8.1, ongoing | BE log: 403 deny count vs unexpected 200 for unpermitted users |
| Agent akses statistik pribadi | 100% role Agent di semua company punya `statistic:read_own` | Post-backfill | MongoDB query: count role `AGENT` dengan `statistic:read_own` in permissions |
| Guard coverage | 100% analytics controller (6/6) protected oleh `PermissionsGuard` | Post-deploy ver2.8.1 | Code review: controller count dengan `@UseGuards(PermissionsGuard)` |
| Export isolation | 100% export endpoint menggunakan `statistic:export` gate | Post-deploy ver2.8.1 | Code review: export op count dengan `@RequirePermissions([StatisticPermission.EXPORT])` |
| Rollback readiness | Env var toggle aktif di 5 controller | Post-deploy ver2.8.1 | Config check: `ANALYTICS_PERMISSIONS_GUARD_ENABLED` readable di semua controller |

---

## **16. Limitations**

| Limitation | Impact |
|-----------|--------|
| FE automated test tidak di-backfill (0 test infrastructure) | Guard fix tanpa FE safety net. Risk: regression di UI flow analytics agent tidak terdeteksi otomatis. Mitigasi: manual QA checklist. |
| Audit log system-wide tidak dimasukkan (GAP-7) | Perubahan permission via backfill tidak tercatat di system audit trail. Mitigasi: backfill script punya log sendiri. Defer ke compliance initiative. |
| OQ-07 belum resolved (role custom mirip Agent) | Backfill hanya target role `code=AGENT`. Role custom buatan admin yang mirip agent tidak di-backfill. PM perlu konfirmasi apakah ini perlu. |
| Precedence fix (GAP-2) mengubah behavior untuk user `READ_TEAM+READ_OWN` | User yang sebelumnya di-force ke self-only akan mulai melihat team data. Perlu QA dan release note. |
| Guard fix behavior change: user tanpa statistic permission dari bisa akses → 403 | Perilaku berubah. Perlu release note dan komunikasi ke customer yang terdampak. |
| Rollback backfill memerlukan session invalidation / force re-login | FE cached session masih menampilkan menu analytics setelah `$pull`. Agent harus re-login. |

---

## **17. Future Considerations**

| Item | Current Status | Future Action |
|------|---------------|---------------|
| FE automated test backfill untuk analytics | 0 test files di FE repo | Defer ke QA initiative — minimal unit test `isSelfOnlyScope` + integration test backfill |
| Audit log system-wide untuk permission/role changes | Tidak ada (GAP-7) | Defer ke compliance initiative — backfill saat ini pakai `console.log` |
| Custom role scope (OQ-07) | Admin bisa buat custom role mirip AGENT tanpa `statistic:read_own` | Defer: document behavior. Backfill hanya sentuh `code=AGENT`, bukan custom |
| CSAT section self-filter di FE | `CsatSection.tsx` tanpa `selfContext`, relies on BE guard | Evaluate: tambah FE self-filter untuk UX consistency, atau keep BE-only |
| OfflineReportSection self-filter | Tidak ada `isSelfOnly` filter | Evaluate: data company-level, mungkin tidak perlu self-filter |
| Analytics observability | Guard deny logging (NFR) | Tambah formal event table untuk guard deny di analytics-service |

---

## **18. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
|-------------------|-------|--------|------------|
| **Dep:** #1291/#1886 sudah di-prod (merged 2026-05-18, tag `prod-2.5.0`) | Engineering (Naftal) | Guard fix + backfill = scope ver2.8.1, bukan full feature build. Sudah dikonfirmasi. | Sudah verified via `git tag --contains f4e86266`. |
| **Dep:** `PermissionActionEnum.EXPORT` sudah ada di enum | Engineering (BE) | Hanya perlu tambah `StatisticPermission.EXPORT` key, tidak perlu ubah enum. | Verified: `enums/index.ts:44`. |
| **Risk:** User yang sebelumnya "bisa" akses analytics (tanpa permission) mendapat 403 | Engineering + PM | Behavior change — perlu release note dan support readiness. | Env var toggle untuk gradual rollout. Release note. Support briefing. |
| **Risk:** Backfill meng-overwrite permission role Agent yang dikustom admin | Engineering (BE) | Mitigasi sudah ada: `$addToSet` (bukan overwrite). | Verified: `$addToSet` hanya menambah, tidak menghapus. |
| **Risk:** Backfill script gagal di tengah jalan (timeout, connection drop) | Engineering (BE) | Sebagian company belum ter-backfill. | Idempotent — re-run. Log per-company status. Retry 3x per-company. |
| **Risk:** FE cached session setelah rollback | Engineering (FE) | Agent masih melihat menu analytics setelah permission di-pull. | Force re-login / session invalidation. Document di runbook rollback. |
| **Risk:** Timeline ketat (3-4 hari dev + 1-2 hari QA, target ver2.8.1 17-28 Aug) | PM + Engineering | Potensi cut scope atau delay. | Prioritas: GAP-1 (blocker) → GAP-2 → GAP-5 → GAP-3 → GAP-4 (low, can defer). |

---

## **19. Appendix**

### **A. Implementation Spec (Reference Only)**

Implementation detail lengkap tersedia di Change Intake Brief v1.5 Section 10:
`Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md`

Ringkasan:
- **10.1** GAP-1: PermissionsGuard di 4 controller + env var toggle
- **10.2** GAP-2: `isSelfOnlyScope()` logic fix (`analytics-scope.util.ts:21`)
- **10.3** GAP-3: broadcast controller permission + scope
- **10.4** GAP-4: metadata controller permission (low)
- **10.5** GAP-5: `StatisticPermission.EXPORT` + gate change + backfill
- **10.6** Backfill migration: `$addToSet` role AGENT all companies
- **10.7** Unit & integration test
- **10.8** Verifikasi release #1291/#1886
- **10.9** Doc sync
- **10.10** QA checklist (20 item)

### **B. Verified Implementation Status**

| Surface | Status | Evidence |
|---------|--------|----------|
| Permission enum granular | ✅ Sudah ada | `default-permission.constant.ts:129` |
| Default role Agent seed | ✅ Sudah ada `READ_OWN` | `default-permission.constant.ts:230` |
| Seeder | ✅ Hanya company baru | `role.seed.ts:48` — `$setOnInsert+upsert` |
| BE guard (self-scope) | ✅ Sudah ada | `analytics-scope.util.ts`, commit `f4e86266` |
| FE access mode | ✅ Sudah ada | `useAnalyticsAccessMode.ts:83` |
| FE self-filter UI | ✅ Sudah ada | `MemberPerformanceSection.tsx:45,192-213` |
| FE menu gating | ✅ Sudah ada | `SideNavLists.tsx:94-96` |
| Redis cache scoping | ✅ Aman | Per `(companyId,userId,jobId)`, tidak perlu invalidation |

### **C. Visibility Mapping (sinkronisasi Appendix E.4 PRD Role Management)**

| Visibility Mode | Permission Key | `isSelfOnlyScope` | FE Priority |
|----------------|---------------|-------------------|-------------|
| `all` | `statistic:all_access` | `false` | 1 (highest) |
| `team` | `statistic:read_team` | `false` | 2 |
| `assigned_only` | `statistic:read_own` | `true` | 3 |
| `all_except_team` | (default — no statistic permission) | `false` | 4 (lowest) |

> PRD lama Appendix E.4 menyebut semua radio resolve ke `statistic:read` — **salah**. Kode sudah granular. Mapping di atas sesuai kode (`useAnalyticsAccessMode.ts:76-83`).

### **D. Glossary**

| Term | Definition |
|------|-----------|
| `PermissionsGuard` | NestJS guard yang memverifikasi permission user berdasarkan role. Pattern existing di Ticket controller. |
| `isSelfOnlyScope()` | Utility function di `analytics-scope.util.ts` yang menentukan apakah user hanya boleh melihat data sendiri. |
| `$addToSet` | MongoDB operator yang menambah elemen ke array hanya jika belum ada (idempotent). |
| `$pull` | MongoDB operator yang menghapus elemen dari array (rollback path). |
| `statistic:export` | Permission baru untuk akses export report analytics. Terpisah dari `statistic:read`. |
| Env var toggle | Environment variable `ANALYTICS_PERMISSIONS_GUARD_ENABLED` untuk enable/disable guard tanpa code deploy. |

### **E. References**

- Change Intake Brief: `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md` v1.5
- BE repo: `omnichannel-satuinbox-be` (commit `f4e86266` #1291)
- FE repo: `omnichannel-satuinbox-fe` (commit `41db146f` #1291 + #1886)
- PRD Role Management: `PRD/Company n people/PRD Setting - Role management.md` (Appendix D, E.3, E.4)
- Memory: `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`
