# Change Intake Brief: Agent Statistic Access (Mini Dashboard)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — request Mini Dashboard agent, 2026-08-03
> **Artifact Path:** `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md`
> **Version:** `v1.6`
> **Previous Version:** `v1.5`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `PRD/Analytics/*`, `PRD/Company n people/PRD Setting - Role management.md`, **BE repo `omnichannel-satuinbox-be` (#1291), FE repo `omnichannel-satuinbox-fe` (#1291/#1886)**
> **Tanggal Intake:** 2026-08-03
> **Status:** Partially Implemented (guard + logic fix + backfill diperlukan)

---

## 0. Ringkasan Update Brief

**v1.3 (2026-08-10) — VERIFIKASI CODEBASE DEEP-DIVE: temuan kritis merubah classification**

Verifikasi mendalam terhadap BE & FE codebase mengungkap bahwa klaim v1.2 ("guard sudah menutup data leak, feature code = 0, tinggal migration") **SALAH**. Temuan:

- **GAP-1 CRITICAL:** 4 analytics controller HANYA pakai `JwtAuthGuard`, **TANPA `PermissionsGuard`** → user tanpa permission statistic apapun (mis. Sales) bisa akses semua endpoint analytics & dapat data SEMUA agent. **Data leak sudah exist sekarang, bukan potensi.**
- **GAP-2 Medium:** `isSelfOnlyScope()` logic bug — user dengan `READ_TEAM+READ_OWN` (tanpa `READ`/`ALL`) salah di-force ke self-only.
- **GAP-3 Medium:** `broadcast-analytics.controller.ts` zero permission check + zero scope enforcement.
- **GAP-5 Medium:** export endpoint require `StatisticPermission.READ` → agent `READ_OWN`-only terblokir dari semua export.
- GAP-4, GAP-6, GAP-7, GAP-9: low/non-issue (metadata, backfill, audit log, cache — lihat detail di bawah).

QA gaps juga ditemukan: CSAT section tanpa selfContext FE, OfflineReportSection tanpa isSelfOnly filter, edge case precedence admin-extend-agent-access belum terdokumentasi, zero automated test untuk analytics-scope.util.ts.

**Konsekuensi:** Ini BUKAN migration-only. Ada BE guard fix (5 controller), isSelfOnlyScope logic fix, export compatibility fix, backfill migration, + QA work. Estimasi **3-4 hari dev + 1-2 hari QA**.

---

**v1.2 (2026-08-03) — VERIFIKASI CODEBASE: fitur sudah dibangun end-to-end**

Cek langsung ke repo BE & FE membalik asumsi v1.1. Temuan:

- **`statistic:read_own` SUDAH ADA** (bukan gap). Enum granular lengkap: `statistic:read` / `statistic:read_own` / `statistic:read_team` — sudah setara pattern Ticket. **Analisa "permission model gap" di v1.1 SALAH** — sumbernya PRD lama; kode sudah lebih maju dari PRD.
- **BE guard sudah jalan** — commit `f4e86266 feat: #1291 analytics self-filtered view based on RBAC (BE)`, merged **2026-05-18** (sebelum v2.8.0).
- **FE self-filter sudah jalan** — commit `41db146f feat: #1291 member analytics self-filtered view based on RBAC` + #1886.
- **Default role Agent seed sudah include** `StatisticPermission.READ_OWN`.
- **Q3 (agent tanpa team) solved otomatis** oleh guard — `resolveTeamId` strip team, `resolveAgentId` force `user.id`. Tidak bergantung team.
- **Q4 (`statistic:read_own` ada/tidak) solved** — ada, lengkap.

**Konseksi:** Feature code untuk ver2.8.1 ≠ 0. Yang tersisa = guard fix + logic fix + export fix + backfill migration + QA.

---

**v1.6 (2026-08-12) — 3-PATCH DECOMPOSITION + CROSS-IMPACT SAP + PARAMETER INVENTORY**

Brainstorm PM menghasilkan 3 artifact baru:

1. **Parameter Inventory** (`statistic-parameter-inventory-conversation-ticket.md`): inventory parameter Conversation + Ticket yang bisa dihitung & tampil di statistic. Quick win 🟡: priority/spam/junked/group (conversation), CSAT channel breakdown. Butuh compute 🔵: ticket priority/type, per-stage SLA, ticket channel breakdown.
2. **3-Patch Decomposition** (`statistic-3-patch-decomposition-analysis.md`): statistic work split jadi 3 patch — Patch 1 (this brief, security-fix), Patch 2 (parameter improvement, addendum PRD Analytics), Patch 3 (interactive dashboard, new PRD). Routing: Patch 1 = ROUTE_PATCH_EXISTING_PRD (artifact ada), Patch 2 = ROUTE_PATCH_EXISTING_PRD (addendum), Patch 3 = ROUTE_NEW_PRD. P1 ↔ P2 paralel-safe, keduanya prasyarat P3.
3. **Cross-Impact Statistic × SAP Export** (`cross-impact-statistic-sap-export.md`): intersection = 1 titik kritis — `statistic:export` permission (Patch 1 GAP-5) gates SEMUA export termasuk SAP Sub-PRD D. Patch 2 & 3 = zero impact ke SAP export (berbeda data layer). SAP Sub-PRD A/B harus REUSE `statistic:export`.

**Konsekuensi:** Brief ini (Patch 1) scope TIDAK berubah — tetap security-fix + backfill. Patches 2 & 3 = scope baru, di luar brief ini. Cross-impact dengan SAP = alignment `statistic:export` permission (sudah resolved di Patch 1 scope).

---

## 1. Request Snapshot

**Request Summary:** Agent ingin melihat statistik pribadi (FRT, RLT, wait time, TTC, CSAT) dengan scope terbatas pada data dirinya. **Sebagian sudah diimplementasi** di codebase (#1291/#1886), tetapi verifikasi mendalam menemukan BE permission gap kritis (data leak) + logic bug + export incompatibility. Sisa kerja = guard fix, logic fix, export fix, backfill permission, + QA validation.

**Business Problem:** Agent tidak punya visibilitas performa sendiri. (Sebagian teratasi di kode, tetapi ada data leak aktif di 4 controller tanpa PermissionsGuard.)

**Target User / Role / Stakeholder:** Agent. Admin/Supervisor tidak berubah. Stakeholder: PM, Engineering, QA.

**Expected Outcome:** (1) Semua analytics endpoint protected oleh PermissionsGuard — user tanpa permission statistic tidak bisa akses. (2) Agent existing dapat membuka halaman statistik dan hanya melihat data miliknya. (3) Agent READ_OWN dapat export report own data. (4) Permission `statistic:read_own` ter-backfill ke role Agent existing.

**Urgency / Why Now:** GAP-1 = data leak aktif (agent tanpa statistic permission bisa akses semua data agent). Target ver2.8.1 (17–28 Aug). Estimasi 3-4 hari dev + 1-2 hari QA — timeline ketat.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `MIXED_REQUEST` — `SECURITY_FIX` (GAP-1 data leak, GAP-3) + `BUG_FIX` (GAP-2 logic, GAP-5 export) + `ADDITIVE_IMPROVEMENT` (backfill permission) |
| Primary Domain | `Analytics` + `Company & People` (RBAC guard/migration) |
| Request Shape | Bug fix + Migration (guard fix 5 controller, isSelfOnlyScope fix, export compat, backfill permission ke role Agent existing) |
| Initial Complexity Signal | Low-Medium (~3-4 hari dev + 1-2 hari QA: guard fix 5 controller, isSelfOnlyScope fix, export compat, backfill+dry-run+audit) |
| Needs Split? | No — semua gap terkait langsung dan harus di-fix bersamaan |

### Classification Rationale
- v1.2 mengklaim fitur sudah shipped lengkap dan tinggal migration. **Salah.**
- 4 analytics controller tidak punya `PermissionsGuard` = data leak aktif (bukan "sudah ditutup guard").
- `isSelfOnlyScope()` punya logic bug yang salah classify user `READ_TEAM+READ_OWN`.
- Export endpoint incompatible dengan `READ_OWN` permission.
- Scope = guard fix + logic fix + export fix + backfill + QA validation, bukan migration-only.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Analytics/*`, `PRD/Company n people/PRD Setting - Role management.md` (Appendix D + E.3/E.4) |
| PRD status | Existing (shipped). **PRD tertinggal dari kode** — visibility mapping di PRD (Appendix E.4) menyebut semua radio resolve ke `statistic:read`, padahal kode sudah granular (`read_own`/`read_team`). |
| PRD treatment candidate | Patch dokumentasi (sinkronkan Appendix E.4 dengan enum kode) — bukan feature work. **BARU (v1.3):** PRD juga perlu patch untuk mendokumentasikan guard gap, fix scope, dan edge case precedence. |

### 3.2 Implementation Status (VERIFIED via codebase)

#### 3.2.1 Verified & Working
| Surface | Status | Evidence (file:line / commit) |
|---------|--------|-------------------------------|
| Permission enum | ✅ Ada, granular | `libs/common/src/lib/constants/default-permission.constant.ts:129` — `StatisticPermission = { ALL, BACKFILL, READ, READ_OWN, READ_TEAM }` |
| Default role Agent seed | ✅ Ada `READ_OWN` | `default-permission.constant.ts:230` (block `AGENT`, baris 198-231) |
| Seeder | ✅ Pakai `DEFAULT_PERMISSION.AGENT` | `apps/auth-service/src/app/seeders/role.seed.ts:48` — **hanya untuk company baru** |
| BE guard (self-scope logic) | ✅ Ada | `apps/api-gateway/src/app/analytics/analytics-scope.util.ts` — `isSelfOnlyScope` (line 15) / `resolveAgentId` (line 36) / `resolveTeamId` (line 57); commit `f4e86266 #1291` (2026-05-18) |
| FE access mode | ✅ Ada | `apps/omnichannel/hooks/useAnalyticsAccessMode.ts:83` — `READ_OWN → 'assigned_only' → isSelfOnly=true`; commit `41db146f #1291` |
| FE self-filter UI | ✅ Ada | `MemberPerformanceSection.tsx:45,192-213` — team/agent filter hidden saat `isSelfOnly` (FR-003), `SelfFilterChip isLocked`; `ResponsivenessFilterOptions.tsx:21`, `StatisticFilter.tsx:137` |
| FE menu gating | ✅ Ada | `SideNavLists.tsx:94-96` — gating `READ \| READ_OWN \| READ_TEAM` |
| Row hiding Member Performance | ✅ By design | `member-analytics.service.ts:317` `resolveAgentIds` → `params.agentId` (di-force ke self oleh gateway) → query hanya agent itu |
| FE priority chain | ✅ Ada, eksplisit | `useAnalyticsAccessMode.ts:76-81` — priority: `ALL > READ_TEAM > READ_OWN` |
| Redis cache scoping | ✅ Aman | `export-report-job.controller.ts:209` — cache scoped per `(companyId,userId,jobId)`, permission change TIDAK perlu cache invalidate (GAP-9 = non-issue) |
| Single-role system | ✅ Eksplisit | `RequestContextData.role: Role` (bukan array) → tidak ada permission merge complexity (EC-04) |

#### 3.2.2 BE GAPS (temuan v1.3)

| GAP | Severity | File:Line | Issue | Impact |
|-----|----------|-----------|-------|--------|
| GAP-1 | **CRITICAL** | `analytics.controller.ts:38`, `member-analytics.controller.ts:41`, `responsiveness-analytics.controller.ts:42`, `ticket-analytics.controller.ts:36` | 4 analytics controller HANYA pakai `JwtAuthGuard`, **TANPA `PermissionsGuard`** | User tanpa permission statistic apapun (mis. Sales) bisa akses SEMUA endpoint analytics & dapat data SEMUA agent. **Data leak aktif.** |
| GAP-2 | Medium | `analytics-scope.util.ts:21` | `isSelfOnlyScope()` = `hasStatisticReadOwn && !hasStatisticAll && !hasWildcard` — TIDAK cek `READ` & `READ_TEAM` | User dengan `READ_TEAM+READ_OWN` (tanpa `READ`/`ALL`) salah di-force ke self-only. Fix: `readOwn && !read && !readTeam && !all && !wildcard` |
| GAP-3 | Medium | `broadcast-analytics.controller.ts:38` | Zero permission check + zero scope enforcement (teamId pass-through) | User tanpa permission bisa akses broadcast analytics. |
| GAP-4 | Low | `analytics-metadata.controller.ts:38` | Zero permission check (metadata timestamps, no data leak) | Inkonsisten dengan pattern controller lain. No data leak karena metadata only. |
| GAP-5 | Medium | `export-report-job.controller.ts:93,140,190,232` | Require `StatisticPermission.READ` untuk semua export op | **Keputusan (v1.4):** Export DI-HIDE dari agent. Buat permission terpisah spesifik `statistic:export` (enum action `EXPORT='export'` sudah ada di `PermissionActionEnum:44`, tinggal tambah `StatisticPermission.EXPORT`). Ganti gate export dari `READ` → `EXPORT`. Agent (`READ_OWN`) TIDAK dapat `statistic:export` → export tetap tersembunyi. |
| GAP-6 | Low | `apps/auth-service/src/app/seeders/role.seed.ts` (0 file di seeders/untuk backfill) | Tidak ada backfill migration script. Seeder hanya jalan untuk company baru. | Workspace existing (pre-#1291) belum punya `statistic:read_own`. |
| GAP-7 | Low | (tidak ada audit log implementation) | Tidak ada audit log untuk permission/role change — backfill `$addToSet` = silent mutation | Perubahan permission tidak tercatat untuk audit trail. |
| GAP-9 | Non-issue | `export-report-job.controller.ts:209` | Redis cache scoped per `(companyId,userId,jobId)` | Permission change TIDAK perlu cache invalidate. Dokumentasi completeness only. |

**Fix prioritized:** GAP-1 (blocker) → GAP-2 → GAP-5 → GAP-3 → GAP-4/6/7 (low, can defer).

#### 3.2.3 QA GAPS (temuan v1.3)

| QA Gap | Surface | Issue | Risk |
|--------|---------|-------|------|
| QA-1 | CSAT section (`CsatSection.tsx`, `CsatResponsesTable.tsx`) | Panggil `useStatisticFilter` TANPA `selfContext` — relies on BE guard saja | Perlu test verify CSAT ter-filter untuk agent read_own |
| QA-2 | All FE sections | Tidak ada checklist loading/empty/error state saat `isSelfOnly` (`isLoading=true` / `selfUserId` undefined) | Risiko flash data orang lain sebelum filter terpasang |
| QA-3 | `OfflineReportSection.tsx` & `offline-reports/` folder | **TIDAK ADA** `isSelfOnly` filter (grep=0). `StatisticNav` tampilkan SEMUA 6 section ke agent `read_own` | Brief tak tentukan intended/gap — apakah agent boleh lihat offline report? |
| QA-4 | `BroadcastSection.tsx` | Import `useAnalyticsAccessMode` tapi perlu verify diterapkan secara efektif | Belum terkonfirmasi |
| QA-5 | FE + BE precedence | Admin tambah `statistic:read` ke role agent yang punya `read_own` → FE priority chain (`ALL>READ_TEAM>READ_OWN`) & BE guard: broader access TIDAK work (read_own ditelan duluan) | Perlu dokumentasi: intended behavior atau bug? |
| QA-6 | ROLLBACK | `$pull` reversible & idempotent (aman secara data), TAPI perlu session invalidation / force re-login supaya menu analytics hilang setelah rollback (FE cached session) | Rollback tanpa invalidation = agent masih lihat menu analytics |
| QA-7 | AUTOMATION | FE repo 0 automated test, BE hanya ada `client-contact.controller.spec.ts` (tidak ada test `analytics-scope.util.ts`) | Backfill tanpa safety net. Minimal: unit test `isSelfOnlyScope` + integration test backfill |

### 3.3 Koreksi Analisa v1.1 (permission model "gap")

v1.1 menyimpulkan Analytics hanya punya `statistic:read` untuk semua visibility (mengutip PRD Appendix E.4). **Salah.** Kode sudah granular:

```ts
// libs/common/.../default-permission.constant.ts:129
StatisticPermission = {
  ALL:       'statistic:all_access',
  BACKFILL:  'statistic:backfill',
  READ:      'statistic:read',
  READ_OWN:  'statistic:read_own',   // = assigned_only
  READ_TEAM: 'statistic:read_team',  // = team
}
```

```ts
// FE useAnalyticsAccessMode.ts:83
if (hasPermission(perms, StatisticPermission.ALL))       return 'all'
if (hasPermission(perms, StatisticPermission.READ_TEAM)) return 'team'
if (hasPermission(perms, StatisticPermission.READ_OWN))  return 'assigned_only'
return 'all_except_team'
```

Model Analytics **sudah setara Ticket**. PRD yang tertinggal, bukan kode.

### 3.4 Koreksi Klaim v1.2 ("guard sudah menutup data leak")

v1.2 mengklaim: _"Data leak: guard BE sudah menutup ini — tidak perlu kerja tambahan."_ **Salah.**

4 dari 6 analytics controller **TIDAK** punya `PermissionsGuard` — hanya `JwtAuthGuard`. Artinya user dengan JWT valid (login) tapi tanpa permission statistic apapun bisa akses endpoint dan dapat data semua agent. `isSelfOnlyScope` hanya jalan di controller yang benar-benar memanggil fungsi itu — dan GAP-1 menunjukkan 4 controller tidak memanggil.

### 3.5 Related Sources
- BE: `omnichannel-satuinbox-be` (`Desktop/BE satuinbox/`), commit `f4e86266` #1291
- FE: `omnichannel-satuinbox-fe` (`Desktop/FE satuinbox/`), commit `41db146f` #1291 + #1886
- `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`

---

## 4. Scope Boundary

### 4.1 In Scope (v1.3 — guard fix + logic fix + export fix + backfill)
- **GAP-1 fix:** Tambah `PermissionsGuard` + permission check ke 4 analytics controller (`analytics`, `member-analytics`, `responsiveness-analytics`, `ticket-analytics`).
- **GAP-2 fix:** Perbaiki `isSelfOnlyScope()` logic — tambah cek `READ` & `READ_TEAM` supaya user dengan `READ_TEAM+READ_OWN` tidak salah di-force ke self-only.
- **GAP-3 fix:** Tambah permission check + scope enforcement ke `broadcast-analytics.controller.ts`.
- **GAP-5 fix (export hide + permission terpisah):** Tambah key `StatisticPermission.EXPORT` (= `statistic:export`, action enum sudah ada). Ganti gate 4 export op (`export-report-job.controller.ts:93,140,190,232`) dari `StatisticPermission.READ` → `StatisticPermission.EXPORT`. **Agent tidak dapat `statistic:export`** → export tersembunyi. Grant `statistic:export` ke default role yang sebelumnya bisa export (Admin/Supervisor via `ALL`/`READ`) — backfill supaya mereka tidak kehilangan akses saat gate pindah dari READ→EXPORT.
- **GAP-4 fix (low):** Tambah permission check di `analytics-metadata.controller.ts` untuk konsistensi.
- **Backfill permission:** tambah `statistic:read_own` ke role Agent di workspace/company existing yang dibuat sebelum #1291 + dry-run + audit log.
- **Unit test:** `isSelfOnlyScope()` — minimal test coverage untuk logic fix.
- **Integration test:** backfill script — verify idempotency & non-destructive.
- **QA validation:** CSAT selfContext, OfflineReport visibility decision, BroadcastSection verify, precedence document, rollback session invalidation.
- **Patch dokumentasi PRD:** sinkronkan Appendix E.4 Role management + Analytics RBAC sections dengan enum kode (`read_own`/`read_team`) + dokumentasi guard gap & fix.

### 4.2 Out of Scope
- Dashboard/halaman/endpoint baru.
- Perubahan permission enum (sudah lengkap).
- Perubahan definisi metrik.
- FE automated test backfill (0 test infrastructure, terlalu besar scope untuk ver2.8.1).
- Audit log system-wide (GAP-7 — defer ke compliance initiative).
- **Patch 2 (Parameter Improvement)** — filter fix + new metrics (priority/spam/junked/group split, CSAT channel breakdown, ticket priority/type). Terpisah: addendum PRD Analytics. Brief: TBD.
- **Patch 3 (Interactive Dashboard)** — clickable KPI card + drill-down ke conversation/ticket list. Terpisah: PRD baru. Brief: TBD. Depend ke Patch 1 (guard fix) + Patch 2 (filter + parameter).
- **Mini dashboard terpisah** — DEFER. `/statistic` self-filtered sudah de-facto agent dashboard. YAGNI.

### 4.3 Protected Existing Behavior
- Role Admin/Supervisor tidak berubah (`statistic:all_access` / `statistic:read`).
- Company baru tetap dapat seed lengkap via `role.seed.ts`.
- Backfill hanya menambah `statistic:read_own` ke role Agent — tidak menyentuh permission lain.
- Idempotent: backfill yang dijalankan dua kali tidak menduplikasi permission.
- FE self-filter UI (`MemberPerformanceSection`, `StatisticFilter`, `ResponsivenessFilterOptions`) tidak berubah — sudah benar.
- FE menu gating (`SideNavLists.tsx:94-96`) tidak berubah — sudah benar.
- FE priority chain (`useAnalyticsAccessMode.ts:76-81`) tidak berubah — `ALL > READ_TEAM > READ_OWN` sudah benar.
- Redis cache scoping (`export-report-job.controller.ts:209`) tidak berubah — tidak perlu invalidation.
- Single-role system (`RequestContextData.role: Role`) tidak berubah.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | |
| RBAC / visibility / assignment | **Yes — CRITICAL** | GAP-1 = data leak aktif (4 controller tanpa PermissionsGuard). GAP-2 = scope logic bug. Backfill 1 permission ke role Agent existing. |
| API / webhook / socket / queue / cron | **Yes** | 5+ endpoint perlu PermissionsGuard baru (behavioral change untuk user tanpa permission: dari allow → 403) |
| SLA / reporting / export | **Yes** | GAP-5 = export endpoint incompatible dengan READ_OWN |
| Migration / rollback / feature flag | **Yes** | Backfill script; rollback = hapus `statistic:read_own` dari role Agent + rollback guard fix (feature flag recommended untuk guard fix) |
| Existing regression scope | **Medium** | Pastikan role Agent yang sudah dikustom admin tidak ke-overwrite. Pastikan Sales/CS user yang sebelumnya "bisa" akses analytics sekarang dapat 403 (expected behavior change, perlu QA). |

### Early Blast-Radius Notes
- **GAP-1 fix blast radius:** User yang sebelumnya bisa akses analytics endpoint (tanpa statistic permission) akan mulai dapat 403. Ini **intended** (fix data leak) tapi perlu QA + release note.
- **GAP-2 fix blast radius:** User dengan `READ_TEAM+READ_OWN` yang sebelumnya di-force ke self-only akan mulai lihat team data. Ini **intended** tapi perlu QA.
- **Idempotency & non-destructive:** backfill harus `$addToSet` (bukan overwrite array permission), supaya kustomisasi admin di role Agent tidak hilang.
- **Scope target:** hanya role dengan `code = AGENT` yang belum punya `statistic:read_own`. Jangan sentuh role custom buatan admin kecuali diputuskan lain.
- **Data leak fix:** GAP-1/3 fix = behavior change untuk user tanpa statistic permission. Perlu release note.
- **Rollback path:** guard fix perlu feature flag supaya bisa di-rollback tanpa code deploy. Backfill `$pull` reversible & idempotent, TAPI perlu session invalidation / force re-login supaya menu analytics hilang (FE cached session).

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` (guard fix + logic fix + export fix + backfill + doc sync) |
| Recommended Next Rules | `Rules/prd-writing-rule.md` (Patch/Addendum), `Rules/impact-analysis-rule.md`, `Rules/qa-analysis-rule.md` |
| Recommended Next Artifact | Patch PRD Analytics RBAC sections + backfill migration spec + guard fix spec + QA validation checklist |
| Can Proceed to PRD? | **Ya** — brief ini cukup matang untuk patch PRD addendum (lihat Section 12) |

### Routing Rationale
- v1.2 route ke `ROUTE_MIGRATION_ONLY` berdasarkan asumsi salah ("guard sudah menutup data leak").
- Verifikasi mendalam menemukan GAP-1 (critical data leak) + GAP-2 (logic bug) + GAP-5 (export incompatibility) yang memerlukan BE code changes.
- Classification berubah ke `ADDITIVE_IMPROVEMENT` — guard fix + logic fix + export fix + backfill.
- Perlu patch PRD (bukan PRD baru) karena core model Analytics tidak berubah — hanya guard enforcement + logic fix + backfill.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner | Status |
|----|----------------|----------------|-----------|-------|--------|
| OQ-01 | Agent akses halaman mana | Luas scope | — | PM | **Resolved (v1.1):** 6 halaman |
| OQ-02 | Masking / row hiding | Privasi | — | BE/FE | **Resolved (v1.2):** row hiding sudah by design (`resolveAgentId` force self) |
| OQ-03 | Agent tanpa team | Edge case | — | BE | **Resolved (v1.2):** guard tidak bergantung team; empty state saat belum ada data |
| OQ-04 | `statistic:read_own` ada? | Effort BE | — | BE | **Resolved (v1.2):** ADA, lengkap (#1291) |
| OQ-05 | **#1291/#1886 sudah rilis ke prod?** (merged 2026-05-18) | Menentukan apakah ver2.8.1 = backfill saja, atau backfill + release feature | **Yes** | Eng Lead (Naftal) | **Resolved (v1.5):** Sudah di prod ≥prod-2.5.0. `git tag --contains f4e86266` → prod-2.5.0/2.6.0/2.6.1/2.7.0. Zero commit lanjutan ke `analytics-scope.util.ts` sejak #1291. Scope ver2.8.1 = guard fix + logic fix + export fix + backfill. |
| OQ-06 | **Backfill role Agent existing:** apply ke SEMUA workspace, atau opt-in per workspace? | Kebijakan rollout — sebagian customer mungkin sengaja tidak beri agent akses statistik | **Yes** | PM | **Resolved (v1.5):** Rekomendasi backfill ALL (Opsi A). Seeder pakai `$setOnInsert` + `upsert:true` → hanya INSERT baru (`role.service.ts:176-186`), tidak update existing. `statistic:read_own` = agent lihat data sendiri, zero data leak risk. Admin sengaja restrict = edge case belum ada evidence. Backfill `$addToSet` idempotent. |
| OQ-07 | Backfill sentuh role custom (bukan default AGENT) yang mirip agent? | Scope target migration | No | PM | Open |
| OQ-08 | **Agent READ_OWN boleh akses export report?** | GAP-5 | — | PM | **Resolved (v1.4): TIDAK.** Export di-hide dari agent. Buat permission terpisah `statistic:export`; gate export pindah `READ`→`EXPORT`; agent tak dapat permission itu. |
| OQ-09 | **Offline-report & broadcast section: agent READ_OWN boleh lihat / disembunyikan?** | QA-3 — `OfflineReportSection` tanpa `isSelfOnly` filter, `StatisticNav` tampilkan SEMUA 6 section. Perlu PM putuskan intended scope. | **Yes** | PM | **Resolved (v1.5):** Semua section boleh dilihat agent. (1) `OfflineReportSection.tsx:15-55`: zero guard, zero self-filter. Company-level feature, bukan agent-scoped. (2) `BroadcastSection.tsx:9`: import `useAnalyticsAccessMode` tapi pass ke filter saja. (3) `StatisticNav.tsx:23-72`: hardcoded 6 items, zero filter. (4) Yang restrict = data di dalam section (BE scope enforcement), bukan menu visibility. Hide: tombol "Create Report" untuk user tanpa `statistic:export`. |
| OQ-10 | **CSAT multi-handled conversation:** agent A & B handle, customer rating — filter `agentId` vs field `handledBy`/`assignedTo` belum jelas. | QA-5 — attribution model CSAT belum terdefinisi untuk multi-agent case. | Medium | PM/BE | **Resolved (v1.5):** Existing model sudah handle. `base-csat.schema.ts:42-43`: `assignees?: CsatAssignee[]` (array multi-agent). `member-analytics.service.ts:446`: filter by `assignees.userId.some()` → semua agent yang ada di `assignees[]` melihat CSAT. Agent yang ada di assignees = semua CSAT di mana dia kontribusi. Document behavior. |
| OQ-11 | **Admin extend agent access via `statistic:read` — intended precedence atau bug?** | QA-5 — FE priority chain `ALL>READ_TEAM>READ_OWN`, BE guard: broader access tidak work (read_own ditelan duluan). Jika intended: document. Jika bug: fix precedence. | Medium | PM/BE | **Resolved (v1.5): BUG.** Evidence: (1) FE `useAnalyticsAccessMode.ts:76-81` — `statistic:read` TIDAK di priority chain, ditelan oleh `READ_OWN`. (2) BE `analytics-scope.util.ts:21`: `isSelfOnlyScope` tidak cek `statistic:read`/`statistic:read_team` (hanya cek ALL+wildcard). (3) `permission.guard.ts:39`: `statistic:read` ≠ wildcard (hanya `resource:*`). Fix sudah di-scope (GAP-2). Document sebagai known issue. |
| OQ-12 | **Guard fix perlu feature flag?** | GAP-1 fix mengubah behavior user tanpa statistic permission (dari allow → 403). Feature flag memungkinkan gradual rollout + instant rollback. | **Yes** | Eng Lead (Naftal) | **Resolved (v1.5):** Rekomendasi env var toggle (Opsi B). Zero feature flag library di codebase. Pattern existing: `broadcast-analytics.controller.ts:86` → `configService.get('AGGREGATION_ENABLED')`. Effort: +~2.5 jam (5 controller wrap). Rollback: set env var `false` + restart, zero code deploy. |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Rollout policy (OQ-06), export access (OQ-08), offline report scope (OQ-09), precedence decision (OQ-11) | Pending | |
| Eng Lead (Naftal) | Konfirmasi release #1291/#1886 (OQ-05), guard fix approach + feature flag (OQ-12) | Pending | merged 2026-05-18 |
| BE | Guard fix 5 controller, isSelfOnlyScope fix, export compat fix, backfill script | Pending | |
| FE | Verify CSAT selfContext, OfflineReportSection scope, BroadcastSection verify | Pending | |
| QA | Guard fix regression, selfOnlyScope validation, export test, backfill idempotency, session invalidation | Pending | |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| Patch PRD Analytics | `PRD/Analytics/*` (RBAC sections, Appendix E.4) | guard gap documentation, fix scope, permission matrix update |
| Patch PRD Role Management | `PRD/Company n people/PRD Setting - Role management.md` (Appendix E.4) | sinkronkan mapping visibility → permission dengan enum kode |
| Migration Script Spec | BE repo `auth-service` seeders/migrations | backfill target, idempotency rule |
| Guard Fix Spec | BE repo `api-gateway` controllers | 5 controller fix, PermissionsGuard pattern, isSelfOnlyScope logic |
| Export Fix Spec | BE repo `api-gateway` export-report-job | permission set expansion |
| QA Validation Checklist | QA Setup | guard regression, selfOnlyScope, export, backfill, session invalidation |
| Assessment Report | `Assessments/cross-domain/agent-statistic-access/` | verified implementation status, gap inventory, fix scope |
| Parameter Inventory | `Assessments/cross-domain/agent-statistic-access/statistic-parameter-inventory-conversation-ticket.md` | grounding untuk Patch 2 (parameter improvement) |
| 3-Patch Decomposition | `Assessments/cross-domain/agent-statistic-access/statistic-3-patch-decomposition-analysis.md` | roadmap statistic P1/P2/P3 + dependency + routing |
| Cross-Impact SAP | `Assessments/cross-domain/agent-statistic-access/cross-impact-statistic-sap-export.md` | alignment `statistic:export` ↔ SAP Sub-PRD D |
| Extensions Analysis | `Assessments/cross-domain/agent-statistic-access/agent-statistic-dashboard-extensions-analysis.md` | drill-down feasibility + mini dashboard YAGNI |

---

## 10. Implementation Spec (v1.3 — guard fix + logic fix + export fix + backfill)

### 10.1 GAP-1 Fix: PermissionsGuard di 4 Analytics Controllers + Env Var Toggle

```
[ ] Tambah PermissionsGuard + StatisticPermission check ke:
    - analytics.controller.ts (line 38)
    - member-analytics.controller.ts (line 41)
    - responsiveness-analytics.controller.ts (line 42)
    - ticket-analytics.controller.ts (line 36)
[ ] Pattern: @UseGuards(JwtAuthGuard, PermissionsGuard) + @Permissions(StatisticPermission.READ | READ_OWN | READ_TEAM | ALL)
[ ] Atau: gunakan unified guard yang combine auth + permission + scope
[ ] Pastikan 403 response konsisten (message: "Insufficient permissions" / standar error SatuInbox)
```

**Env var toggle (OQ-12 resolved, pattern existing `AGGREGATION_ENABLED`):**
```
[ ] ConfigService.get('ANALYTICS_PERMISSIONS_GUARD_ENABLED') → wrap PermissionsGuard conditional
[ ] Default: true (secure by default)
[ ] Instant rollback: set false + restart, zero code deploy
[ ] Effort: ~30 menit per controller (5 controller = ~2.5 jam)
```

### 10.2 GAP-2 Fix: isSelfOnlyScope Logic

```ts
// Current (BUG):
// analytics-scope.util.ts:21
return hasStatisticReadOwn && !hasStatisticAll && !hasWildcard

// Fix:
return readOwn && !read && !readTeam && !all && !wildcard
```

```
[ ] Fix isSelfOnlyScope() di analytics-scope.util.ts:21
[ ] Tambah check !hasStatisticRead && !hasStatisticReadTeam
[ ] Unit test: verify user READ_TEAM+READ_OWN → return false (not self-only)
[ ] Unit test: verify user READ_OWN only → return true (self-only)
[ ] Unit test: verify user READ → return false (not self-only)
[ ] Unit test: verify user ALL → return false
```

### 10.3 GAP-3 Fix: broadcast-analytics.controller.ts

```
[ ] Tambah PermissionsGuard + permission check di line 38
[ ] Pastikan scope enforcement (teamId filtering) saat user bukan ALL/READ
```

### 10.4 GAP-4 Fix: analytics-metadata.controller.ts (low priority)

```
[ ] Tambah PermissionsGuard di line 38 (konsistensi, no data leak risk)
```

### 10.5 GAP-5 Fix: Export Hide dari Agent + Permission Terpisah `statistic:export`

**Keputusan (OQ-08 resolved):** Agent TIDAK boleh export. Export butuh permission spesifik terpisah `statistic:export`.

```
[ ] Tambah key StatisticPermission.EXPORT di default-permission.constant.ts:129
    EXPORT: `${ResourceTypeEnum.STATISTIC}:${PermissionActionEnum.EXPORT}`  // = 'statistic:export'
    (PermissionActionEnum.EXPORT = 'export' SUDAH ada di enums/index.ts:44)
[ ] Ganti gate 4 export op di export-report-job.controller.ts:93,140,190,232
    dari @RequirePermissions([StatisticPermission.READ])
    ke   @RequirePermissions([StatisticPermission.EXPORT])
[ ] Default role Agent: JANGAN tambah statistic:export (agent tetap tanpa export)
[ ] FE: hide tombol/menu export untuk user tanpa statistic:export
    (grep export button di OfflineReportSection / StatisticNav → gate by permission)
```

**Backfill EXPORT untuk role yang sebelumnya bisa export:**
```
[ ] Guard verified (permission.guard.ts:39): permission `statistic:*` (StatisticPermission.ALL)
    OTOMATIS cover statistic:export via wildcard → Admin/Supervisor (punya ALL) TIDAK perlu backfill.
[ ] HANYA role dengan tepat `statistic:read` (tanpa ALL/wildcard) yang kehilangan export
    saat gate pindah READ→EXPORT → backfill $addToSet statistic:export ke role tsb.
[ ] Identifikasi role existing yang punya statistic:read tapi bukan ALL (query per company).
```

### 10.6 Backfill Migration (OQ-06 resolved: backfill ALL)

```
[ ] Migration script: untuk SEMUA company existing, cari role code=AGENT
    yang belum punya statistic:read_own → $addToSet permission
    (idempotent, non-destructive, jangan overwrite array)
[ ] Seeder verified: role.service.ts:176-186 pakai $setOnInsert+upsert →
    hanya INSERT baru, tidak update existing. Tidak ada mekanisme implicit backfill.
[ ] Dry-run: log jumlah role yang akan di-update sebelum apply
[ ] Audit log: catat company, roleId, permission added, timestamp
[ ] Rollback path: $pull statistic:read_own dari role AGENT
[ ] Session invalidation: force re-login supaya menu analytics hilang setelah rollback
```

Contoh runnable check (self-check logika backfill, tanpa framework):

```js
// ponytail: pure-function check for backfill idempotency; real migration wraps Mongo $addToSet
function backfillAgentPerms(perms, key = 'statistic:read_own') {
  return perms.includes(key) ? perms : [...perms, key];
}
console.assert(
  JSON.stringify(backfillAgentPerms(['conversation:read'])) ===
  JSON.stringify(['conversation:read', 'statistic:read_own']),
  'adds key when missing'
);
console.assert(
  backfillAgentPerms(['statistic:read_own']).length === 1,
  'idempotent when present'
);
console.log('backfill logic OK');
```

### 10.7 Unit & Integration Test Backfill

```
[ ] BE unit test: isSelfOnlyScope() — minimal 4 cases (READ_OWN only, READ_TEAM+READ_OWN, READ, ALL)
[ ] BE integration test: backfill script — verify $addToSet idempotent & non-destructive
```

### 10.8 Verifikasi release

```
[ ] Konfirmasi #1291 (BE f4e86266) + #1886 (FE) masuk tag release mana
[ ] Kalau belum di prod → include di ver2.8.1
[ ] Kalau sudah di prod → hanya guard fix + backfill yang perlu
```

### 10.9 Doc sync

```
[ ] Patch PRD Role management Appendix E.4: mapping visibility → permission
    (assigned_only → statistic:read_own, team → statistic:read_team)
[ ] Patch PRD Analytics: dokumentasi guard gap, fix scope, precedence rules
[ ] Document OQ-11 decision: BUG (not intended). statistic:read tidak override read_own.
[ ] Document OQ-10: CSAT attribution = assignees[] (multi-agent). Agent melihat
    semua CSAT di mana dia ada di assignees[].
[ ] Document OQ-09: broadcast boleh (company-level), offline-report boleh (tanpa export).
```

### 10.10 QA Checklist

```
[ ] GAP-1 regression: user tanpa statistic permission dapat 403 di SEMUA analytics endpoint
[ ] GAP-1 regression: user dengan statistic permission masih bisa akses normal
[ ] GAP-2 fix: user READ_TEAM+READ_OWN lihat team data (bukan hanya self)
[ ] GAP-2 fix: user READ_OWN-only tetap lihat self only
[ ] GAP-5 fix: export di-hide dari agent READ_OWN (menu/tombol export tersembunyi, endpoint return 403)
[ ] GAP-5 fix: user tanpa `statistic:export` tidak bisa hit export endpoint (403)
[ ] GAP-5 backfill: role existing dengan `statistic:read` (tanpa ALL) masih bisa export setelah backfill `statistic:export`
[ ] GAP-5 wild card: admin/supervisor (statistic:all_access) masih bisa export (wildcard cover via permission.guard.ts:39)
[ ] CSAT section: verify agent READ_OWN = data ter-filter (CsatSection.tsx, CsatResponsesTable.tsx)
[ ] OfflineReportSection: verify behavior sesuai OQ-09 decision
[ ] BroadcastSection: verify useAnalyticsAccessMode diterapkan
[ ] Precedence: admin extend agent access via statistic:read — verify behavior sesuai OQ-11 decision
[ ] Loading/empty/error state: verify tidak ada flash data orang lain saat isSelfOnly
[ ] Setelah backfill: agent existing bisa buka halaman statistik, data = miliknya
[ ] Data leak: Agent A tidak lihat data Agent B (confirm setelah GAP-1 fix)
[ ] Admin/Supervisor: tidak berubah
[ ] Role Agent yang dikustom admin: kustomisasi tidak hilang (non-destructive)
[ ] Company baru: seed tetap benar (regression seeder)
[ ] Backfill dijalankan 2x: tidak duplikat permission (idempotent)
[ ] Rollback: $pull + session invalidation → agent kehilangan menu analytics (verify re-login)
```

---

## 11. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-08-03 | v1.0 | Initial brief created | Dany Christian |
| 2026-08-03 | v1.1 | Deep-dive: permission model gap (asumsi tambah `statistic:read_own`), halaman scope 6, row hiding, implementation spec, OQ-01/02 resolved | Dany Christian |
| 2026-08-03 | v1.2 | **Verifikasi codebase membalik v1.1:** `statistic:read_own` + guard BE (#1291) + FE self-filter (#1886) SUDAH shipped (merged 2026-05-18). Feature code = 0. Scope jadi **migration only** (backfill permission role Agent workspace existing). Q3/Q4 resolved via kode. Routing → `ROUTE_MIGRATION_ONLY`. Status → Verified. Ditambah OQ-05 (release?) + OQ-06 (rollout policy). | Dany Christian |
| 2026-08-10 | v1.3 | **Verifikasi codebase deep-dive membalik klaim v1.2:** Temuan GAP-1 CRITICAL (4 analytics controller tanpa PermissionsGuard = data leak aktif), GAP-2 (isSelfOnlyScope logic bug), GAP-3 (broadcast zero permission), GAP-5 (export incompatible READ_OWN). QA gaps: CSAT tanpa selfContext, OfflineReport tanpa filter, zero automated test. **Status → Partially Implemented. Change Class → MIXED_REQUEST (SECURITY_FIX + BUG_FIX + ADDITIVE_IMPROVEMENT). Complexity → Low-Medium.** Routing → `ROUTE_PATCH_EXISTING_PRD`. Scope = guard fix + logic fix + export fix + backfill + QA. Tambah OQ-08 s/d OQ-12. Tambah Section 12 (PRD Readiness Assessment). Reviewer gate: PASS (GAP-1/2/5 diverifikasi langsung ke codebase, cocok file:line). | Dany Christian |
| 2026-08-10 | v1.4 | **Keputusan OQ-08 (export):** Export DI-HIDE dari agent. Buat permission terpisah spesifik `statistic:export` (enum action `EXPORT` sudah ada). Gate 4 export op pindah `StatisticPermission.READ`→`EXPORT`. Agent tak dapat `statistic:export`. Verified via `permission.guard.ts:39`: `statistic:all_access` wildcard OTOMATIS cover `statistic:export` → Admin/Supervisor tak perlu backfill; hanya role `statistic:read`-only (tanpa ALL) yang perlu grant `statistic:export`. Update GAP-5, Section 4.1, 10.5, OQ-08 resolved, QA checklist. | Dany Christian |
| 2026-08-10 | v1.5 | **Semua OQ resolved (brainstorm orchestrator).** OQ-05: sudah di prod ≥prod-2.5.0 (evidence: `git tag --contains`). OQ-06: backfill ALL (rekomendasi). OQ-09: semua section boleh dilihat agent (broadcast=company-level, offline-report=tanpa export). OQ-10: CSAT multi-agent = `assignees[]` (sudah handle, `base-csat.schema.ts:42-43`). OQ-11: BUG (sudah di-scope GAP-2). OQ-12: env var toggle `ANALYTICS_PERMISSIONS_GUARD_ENABLED` (pattern existing `AGGREGATION_ENABLED`). Update 10.1, 10.6, 10.9, OQ table. **Sisa OQ blocking untuk PRD: 0** (OQ-07 PM confirm opsional). | Dany Christian |
| 2026-08-12 | v1.6 | **3-patch decomposition + cross-impact SAP + parameter inventory.** PM propose statistic split jadi 3 patch: P1 (this brief, security-fix), P2 (parameter improvement, addendum PRD Analytics), P3 (interactive dashboard, new PRD). P1 ↔ P2 paralel-safe, keduanya prasyarat P3. Parameter inventory: quick win 🟡 (priority/spam/junked/group, CSAT channel), butuh compute 🔵 (ticket priority/type, per-stage SLA). Cross-impact: `statistic:export` (Patch 1) gates semua export termasuk SAP Sub-PRD D; Patch 2 & 3 zero impact ke SAP. Mini dashboard = DEFER (YAGNI). §4.2: Patch 2 & 3 + mini dashboard = out of scope. §9: 4 artifact baru ditambah ke downstream reuse map. | Dany Christian |

---

## 12. PRD Readiness Assessment

### 12.1 Evaluation Criteria (berdasarkan `Rules/prd-writing-rule.md` Quality Gate Checklist)

| Criteria | Status | Notes |
|----------|--------|-------|
| Source-of-truth domain identified | ✅ | Analytics + Company & People (RBAC) |
| Phase 1 scope explicit | ✅ | Section 4.1: guard fix 5 controller, isSelfOnlyScope fix, export fix, backfill, QA |
| In Scope / Out of Scope present | ✅ | Section 4.1 + 4.2 |
| User stories + acceptance criteria | ⚠️ | Brief punya request snapshot tapi belum punya formal US/AC (format US-001 + Given/When/Then) |
| Functional requirements (FR-xxx) | ⚠️ | Brief punya implementation spec tapi belum punya formal FR-ID dengan modal verbs (MUST/MUST NOT) |
| Error handling (EH-xxx) | ❌ | Belum didefinisikan — EH untuk 403 response, export failure, backfill failure |
| Edge cases (EC-xxx) | ⚠️ | QA gaps (QA-1 s/d QA-7) ada tapi belum diformat sebagai EC-xxx |
| Permission Matrix | ⚠️ | Ada di Section 3.2 tapi belum diformat sebagai Permission Matrix table (Role × Action) |
| Migration & Rollout Plan | ⚠️ | Backfill spec ada di 10.6 tapi belum lengkap (feature flag strategy, rollout stages, production smoke checks) |
| Dependencies & Risks | ⚠️ | Ada di Section 5 (Early Impact Flags) tapi belum format Dependencies + Risks + Owner + Mitigation |
| Success Metrics | ❌ | Tidak ada KPI/target/data source |
| Non-Functional Requirements | ❌ | Tidak ada (performance, security, observability) |
| Limitations | ⚠️ | Ada di scope boundary tapi belum format Limitation + Impact |
| API / Event Contract | ❌ | Tidak ada — guard fix mengubah response contract (200 → 403), perlu didokumentasikan |

### 12.2 Blocking Gaps (harus di-resolve sebelum PRD)

| # | Gap | Severity | Action Required |
|---|-----|----------|-----------------|
| B-1 | Tidak ada formal User Stories + Acceptance Criteria | High | Tulis US-001 s/d US-004 dengan Given/When/Then |
| B-2 | Tidak ada formal Functional Requirements (FR-xxx) | High | Tulis FR-001 s/d FR-010 dengan modal verbs |
| B-3 | Error handling belum didefinisikan | High | Definisikan EH-001 (403 tanpa permission), EH-002 (export failure), EH-003 (backfill failure) |
| B-4 | API contract change belum didokumentasikan | High | Guard fix mengubah response: 200 → 403. Perlu API Event Contract section. |
| B-5 | Migration & Rollout Plan belum lengkap | Medium | Tambahkan: feature flag strategy, rollout stages (canary → all), production smoke checks |
| B-6 | OQ-08 s/d OQ-12 belum dijawab | ~~Medium~~ | **Resolved (v1.4/v1.5):** Semua OQ sudah answered dengan evidence codebase. |
| B-7 | Success Metrics belum ada | Low | Tambahkan KPI (data leak = 0, agent akses = 100% post-backfill) |
| B-8 | Non-Functional Requirements belum ada | Low | Tambahkan: guard response time, backfill batch size, tenant isolation |

### 12.3 Verdict

**READY_FOR_PRD** — Brief v1.6 sudah cukup sebagai input untuk PRD writer.

**Update v1.6:** PRD Patch v1.0 (`PRD/Analytics/PRD Analytics - agent statistic access.md`, 349 baris) SUDAH DIWRITE — berisi formal US/AC (US-001 s/d US-004), Functional Requirements (FR-001 s/d FR-011), Error Handling (EH-001 s/d EH-005), Edge Cases (EC-001 s/d EC-011), Permission Matrix, API/Event Contract, Migration & Rollout Plan, NFR, Success Metrics, Limitations. Blocking gaps B-1 s/d B-8 = **resolved di PRD patch v1.0**.

**Path forward:** Brief ini = Phase 0 Change Intake (complete). PRD Patch v1.0 = PRD artifact (complete, Draft). Selanjutnya = PRD review (Gate A/B) → Requirement Package Freeze → implementation.

**Estimasi PRD draft:** ~1-2 jam dari brief v1.3 (asumsi OQ sudah dijawab).
