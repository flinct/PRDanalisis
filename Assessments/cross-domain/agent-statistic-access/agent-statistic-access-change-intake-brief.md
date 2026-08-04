# Change Intake Brief: Agent Statistic Access (Mini Dashboard)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — request Mini Dashboard agent, 2026-08-03
> **Artifact Path:** `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md`
> **Version:** `v1.2`
> **Previous Version:** `v1.1`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `PRD/Analytics/*`, `PRD/Company n people/PRD Setting - Role management.md`, **BE repo `omnichannel-satuinbox-be` (#1291), FE repo `omnichannel-satuinbox-fe` (#1291/#1886)**
> **Tanggal Intake:** 2026-08-03
> **Status:** Verified — Already Implemented (scope = migration only)

---

## 0. Ringkasan Update Brief

**v1.2 (2026-08-03) — VERIFIKASI CODEBASE: fitur sudah dibangun end-to-end**

Cek langsung ke repo BE & FE membalik asumsi v1.1. Temuan:

- **`statistic:read_own` SUDAH ADA** (bukan gap). Enum granular lengkap: `statistic:read` / `statistic:read_own` / `statistic:read_team` — sudah setara pattern Ticket. **Analisa "permission model gap" di v1.1 SALAH** — sumbernya PRD lama; kode sudah lebih maju dari PRD.
- **BE guard sudah jalan** — commit `f4e86266 feat: #1291 analytics self-filtered view based on RBAC (BE)`, merged **2026-05-18** (sebelum v2.8.0).
- **FE self-filter sudah jalan** — commit `41db146f feat: #1291 member analytics self-filtered view based on RBAC` + #1886.
- **Default role Agent seed sudah include** `StatisticPermission.READ_OWN`.
- **Q3 (agent tanpa team) solved otomatis** oleh guard — `resolveTeamId` strip team, `resolveAgentId` force `user.id`. Tidak bergantung team.
- **Q4 (`statistic:read_own` ada/tidak) solved** — ada, lengkap.

**Konsekuensi:** Feature code untuk ver2.8.1 = **0**. Yang tersisa hanya **migrasi permission workspace existing** (role Agent yang dibuat sebelum #1291 belum punya `statistic:read_own` — seeder hanya jalan untuk company baru, tidak ada backfill migration ditemukan).

- Routing decision berubah: `ADDITIVE_IMPROVEMENT` → **`ALREADY_IMPLEMENTED` / `ROUTE_MIGRATION_ONLY`**.

---

## 1. Request Snapshot

**Request Summary:** Agent ingin melihat statistik pribadi (FRT, RLT, wait time, TTC, CSAT) dengan scope terbatas pada data dirinya. **Sudah diimplementasi** di codebase (#1291/#1886). Sisa kerja = pastikan workspace existing mendapat permission `statistic:read_own`.

**Business Problem:** Agent tidak punya visibilitas performa sendiri. (Sudah teratasi di kode, kemungkinan belum aktif di workspace lama karena permission belum ter-backfill.)

**Target User / Role / Stakeholder:** Agent. Admin/Supervisor tidak berubah. Stakeholder: PM, Engineering.

**Expected Outcome:** Agent existing dapat membuka halaman statistik dan hanya melihat data miliknya — setelah permission `statistic:read_own` ditambahkan ke role Agent existing.

**Urgency / Why Now:** Paket 3 task pasca-ver2.8.0, target ver2.8.1 (17–28 Aug). Karena feature code = 0, ver2.8.1 punya slack besar.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `ALREADY_IMPLEMENTED` → sisa `DATA_MIGRATION` |
| Primary Domain | `Analytics` + `Company & People` (RBAC seed/migration) |
| Request Shape | Migration (backfill permission ke role Agent existing) |
| Initial Complexity Signal | Very Low (migration only, feature code = 0) |
| Needs Split? | No |

### Classification Rationale
- Fitur (permission enum, BE guard, FE self-filter, menu gating, row-scoping) sudah shipped via #1291/#1886.
- Yang belum: role Agent di workspace existing (pre-#1291) belum punya `statistic:read_own`. Seeder `role.seed.ts` hanya jalan untuk company baru.
- Kerja = 1 backfill script + verifikasi release.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Analytics/*`, `PRD/Company n people/PRD Setting - Role management.md` (Appendix D + E.3/E.4) |
| PRD status | Existing (shipped). **PRD tertinggal dari kode** — visibility mapping di PRD (Appendix E.4) menyebut semua radio resolve ke `statistic:read`, padahal kode sudah granular (`read_own`/`read_team`). |
| PRD treatment candidate | Patch dokumentasi (sinkronkan Appendix E.4 dengan enum kode) — bukan feature work |

### 3.2 Implementation Status (VERIFIED via codebase)
| Surface | Status | Evidence (file:line / commit) |
|---------|--------|-------------------------------|
| Permission enum | ✅ Ada, granular | `libs/common/src/lib/constants/default-permission.constant.ts:129` — `StatisticPermission = { ALL, BACKFILL, READ, READ_OWN, READ_TEAM }` |
| Default role Agent seed | ✅ Ada `READ_OWN` | `default-permission.constant.ts:230` (block `AGENT`, baris 198-231) |
| Seeder | ✅ Pakai `DEFAULT_PERMISSION.AGENT` | `apps/auth-service/src/app/seeders/role.seed.ts:48` — **hanya untuk company baru** |
| BE guard (self-scope) | ✅ Ada | `apps/api-gateway/src/app/analytics/analytics-scope.util.ts` — `isSelfOnlyScope` / `resolveAgentId` / `resolveTeamId`; commit `f4e86266 #1291` (2026-05-18) |
| BE guard usage | ✅ Semua endpoint | `analytics.controller.ts:79,83` + `member-analytics.controller.ts:78,85,97,107` |
| FE access mode | ✅ Ada | `apps/omnichannel/hooks/useAnalyticsAccessMode.ts:83` — `READ_OWN → 'assigned_only' → isSelfOnly=true`; commit `41db146f #1291` |
| FE self-filter UI | ✅ Ada | `MemberPerformanceSection.tsx:45,192-213` — team/agent filter hidden saat `isSelfOnly` (FR-003), `SelfFilterChip isLocked`; `ResponsivenessFilterOptions.tsx:21`, `StatisticFilter.tsx:137` |
| FE menu gating | ✅ Ada | `SideNavLists.tsx:94-96` — gating `READ \| READ_OWN \| READ_TEAM` |
| Row hiding Member Performance | ✅ By design | `member-analytics.service.ts:317` `resolveAgentIds` → `params.agentId` (di-force ke self oleh gateway) → query hanya agent itu |

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

### 3.4 Related Sources
- BE: `omnichannel-satuinbox-be` (`Desktop/BE satuinbox/`), commit `f4e86266` #1291
- FE: `omnichannel-satuinbox-fe` (`Desktop/FE satuinbox/`), commit `41db146f` #1291 + #1886
- `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`

---

## 4. Scope Boundary

### 4.1 In Scope (v1.2 — migration only)
- **Backfill permission:** tambah `statistic:read_own` ke role Agent di workspace/company existing yang dibuat sebelum #1291.
- **Verifikasi release:** konfirmasi #1291/#1886 sudah masuk build prod (merged 2026-05-18 → kemungkinan sudah, perlu konfirmasi tag/release).
- **Patch dokumentasi PRD:** sinkronkan Appendix E.4 Role management + Analytics RBAC sections dengan enum kode (`read_own`/`read_team`).

### 4.2 Out of Scope
- Feature development (semua sudah ada).
- Dashboard/halaman/endpoint baru.
- Perubahan permission enum, guard, atau UI (sudah jalan).
- Perubahan definisi metrik.

### 4.3 Protected Existing Behavior
- Role Admin/Supervisor tidak berubah (`statistic:all_access` / `statistic:read`).
- Company baru tetap dapat seed lengkap via `role.seed.ts`.
- Backfill hanya menambah `statistic:read_own` ke role Agent — tidak menyentuh permission lain.
- Idempotent: backfill yang dijalankan dua kali tidak menduplikasi permission.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | |
| RBAC / visibility / assignment | **Yes** | Backfill 1 permission ke role Agent existing |
| API / webhook / socket / queue / cron | No | Guard endpoint sudah ada |
| SLA / reporting / export | No | |
| Migration / rollback / feature flag | **Yes** | Backfill script; rollback = hapus `statistic:read_own` dari role Agent |
| Existing regression scope | Yes (kecil) | Pastikan role Agent yang sudah dikustom admin tidak ke-overwrite |

### Early Blast-Radius Notes
- **Idempotency & non-destructive:** backfill harus `$addToSet` (bukan overwrite array permission), supaya kustomisasi admin di role Agent tidak hilang.
- **Scope target:** hanya role dengan `code = AGENT` yang belum punya `statistic:read_own`. Jangan sentuh role custom buatan admin kecuali diputuskan lain.
- **Data leak:** guard BE sudah menutup ini — tidak perlu kerja tambahan.
- **Beban:** nihil (tidak ada endpoint/query baru).

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_MIGRATION_ONLY` (+ patch dokumentasi PRD) |
| Recommended Next Rules | `Rules/impact-analysis-rule.md`, `Rules/qa-analysis-rule.md` |
| Recommended Next Artifact | Backfill script spec + verifikasi release; patch PRD Role management Appendix E.4 |
| Can Proceed to PRD? | Tidak perlu PRD baru — cukup migration spec + doc sync |

### Routing Rationale
- Feature sudah shipped. Tidak ada requirement baru untuk di-PRD-kan.
- Kerja nyata = backfill migration + verifikasi, sisanya sinkronisasi dokumentasi.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner | Status |
|----|----------------|----------------|-----------|-------|--------|
| OQ-01 | Agent akses halaman mana | Luas scope | — | PM | **Resolved (v1.1):** 6 halaman |
| OQ-02 | Masking / row hiding | Privasi | — | BE/FE | **Resolved (v1.2):** row hiding sudah by design (`resolveAgentId` force self) |
| OQ-03 | Agent tanpa team | Edge case | — | BE | **Resolved (v1.2):** guard tidak bergantung team; empty state saat belum ada data |
| OQ-04 | `statistic:read_own` ada? | Effort BE | — | BE | **Resolved (v1.2):** ADA, lengkap (#1291) |
| OQ-05 | **#1291/#1886 sudah rilis ke prod?** (merged 2026-05-18) | Menentukan apakah ver2.8.1 = backfill saja, atau backfill + release feature | **Yes** | Eng Lead (Naftal) | Open |
| OQ-06 | **Backfill role Agent existing:** apply ke SEMUA workspace, atau opt-in per workspace? | Kebijakan rollout — sebagian customer mungkin sengaja tidak beri agent akses statistik | **Yes** | PM | Open |
| OQ-07 | Backfill sentuh role custom (bukan default AGENT) yang mirip agent? | Scope target migration | No | PM | Open |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Rollout policy (OQ-06) | Pending | |
| Eng Lead (Naftal) | Konfirmasi release #1291/#1886 (OQ-05) | Pending | merged 2026-05-18 |
| BE | Backfill script (idempotent, `$addToSet`) | Pending | |
| QA | Regression + confirm agent existing dapat akses | Pending | |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| Migration Script Spec | BE repo `auth-service` seeders/migrations | backfill target, idempotency rule |
| PRD Doc Sync | `PRD/Company n people/PRD Setting - Role management.md` (Appendix E.4) | sinkronkan mapping visibility → permission dengan enum kode |
| Assessment Report | `Assessments/cross-domain/agent-statistic-access/` | verified implementation status, migration scope |
| QA Validation | template Setup | confirm agent existing akses + data leak (guard sudah ada) |

---

## 10. Implementation Spec (v1.2 — migration only)

### 10.1 Backfill migration (BE auth-service)

```
[ ] Migration script: untuk setiap company existing, cari role code=AGENT
    yang belum punya statistic:read_own → $addToSet permission
    (idempotent, non-destructive, jangan overwrite array)
[ ] Dry-run: log jumlah role yang akan di-update sebelum apply
[ ] Rollback path: $pull statistic:read_own dari role AGENT
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

### 10.2 Verifikasi release

```
[ ] Konfirmasi #1291 (BE f4e86266) + #1886 (FE) masuk tag release mana
[ ] Kalau belum di prod → include di ver2.8.1
[ ] Kalau sudah di prod → hanya backfill yang perlu
```

### 10.3 Doc sync (opsional, non-blocking)

```
[ ] Patch PRD Role management Appendix E.4: mapping visibility → permission
    (assigned_only → statistic:read_own, team → statistic:read_team)
```

### 10.4 QA Checklist

```
[ ] Setelah backfill: agent existing bisa buka halaman statistik, data = miliknya
[ ] Data leak: Agent A tidak lihat data Agent B (guard sudah ada, confirm)
[ ] Admin/Supervisor: tidak berubah
[ ] Role Agent yang dikustom admin: kustomisasi tidak hilang (non-destructive)
[ ] Company baru: seed tetap benar (regression seeder)
[ ] Backfill dijalankan 2x: tidak duplikat permission (idempotent)
```

---

## 11. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-08-03 | v1.0 | Initial brief created | Dany Christian |
| 2026-08-03 | v1.1 | Deep-dive: permission model gap (asumsi tambah `statistic:read_own`), halaman scope 6, row hiding, implementation spec, OQ-01/02 resolved | Dany Christian |
| 2026-08-03 | v1.2 | **Verifikasi codebase membalik v1.1:** `statistic:read_own` + guard BE (#1291) + FE self-filter (#1886) SUDAH shipped (merged 2026-05-18). Feature code = 0. Scope jadi **migration only** (backfill permission role Agent workspace existing). Q3/Q4 resolved via kode. Routing → `ROUTE_MIGRATION_ONLY`. Status → Verified. Ditambah OQ-05 (release?) + OQ-06 (rollout policy). | Dany Christian |
