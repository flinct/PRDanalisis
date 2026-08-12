# Change Intake Brief: Statistic Parameter Improvement

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — decompose statistic roadmap, 2026-08-12
> **Artifact Path:** `Assessments/cross-domain/agent-statistic-access/statistic-parameter-improvement-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`, `PRD/Analytics/*`, `Assessments/cross-domain/agent-statistic-access/statistic-parameter-inventory-conversation-ticket.md`, `Assessments/cross-domain/agent-statistic-access/statistic-3-patch-decomposition-analysis.md`
> **Tanggal Intake:** 2026-08-12
> **Status:** Draft
> **Author:** Dany Christian

---

## 0. Ringkasan Update Brief

- Initial version. Request: merapihkan filter halaman statistic + menambah parameter/metric baru dari inventory.
- Klasifikasi: `ADDITIVE_IMPROVEMENT`. Routing: `ROUTE_PATCH_EXISTING_PRD` (addendum PRD Analytics existing).
- Core model Analytics tidak berubah (daily-metrics pipeline). Yang berubah: filter UI consistency + dimensi baru di pipeline + section baru/tambahan.
- P1 ↔ P2 paralel-safe. P3 (interactive dashboard) depend ke P2.

---

## 1. Request Snapshot

**Request Summary:** Merapihkan halaman statistic yang ada (filter inconsistency) dan menambah parameter/metric baru berdasarkan inventory codebase. Dua masalah: (1) filter tidak konsisten antar section, (2) banyak parameter yang sudah tersedia di schema tapi belum ditampilkan.

**Business Problem:**
1. Filter statistic tidak konsisten: CsatSection tanpa filter, ResponsivenessSection cuma date, 6 section pakai filter berbeda-beda.
2. Parameter yang sudah ada di daily-metrics schema belum diekspos: conversation priority, spam, junked, group; ticket priority/type; CSAT channel breakdown.
3. Hook `useStatisticFilter` support 8 param tapi UI cuma render 3 (date + team + agent) → dead code.

**Target User / Role / Stakeholder:** Admin, Supervisor, Agent (sesuai RBAC statistic — Patch 1). Stakeholder: PM, Engineering, QA.

**Expected Outcome:**
1. Satu `StatisticFilter` component konsisten dipakai semua section (dengan mode per section).
2. CsatSection punya filter (date + selfContext).
3. Responsiveness section: re-enable team + agent filter.
4. Parameter baru tampil: conversation (priority, spam, junked, group), CSAT (channel breakdown), ticket (priority, type — kalau effort allows).

**Urgency / Why Now:** Filter fix = UX quality. Parameter baru = foundation untuk Patch 3 (interactive dashboard — lebih banyak card = lebih banyak yang bisa di-klik). Target ver2.9/3.0.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `ADDITIVE_IMPROVEMENT` |
| Primary Domain | Analytics |
| Request Shape | Fix (filter inconsistency) + Add (new parameter/metric) |
| Initial Complexity Signal | Medium |
| Needs Split? | No — filter fix dan parameter addition terkait langsung (sama-sama di halaman statistic) |

### Classification Rationale
- Filter fix = behavioral correction (consistency), bukan new feature.
- Parameter baru = additive (menambah dimensi di pipeline yang sudah ada).
- Core model Analytics tidak berubah (daily-metrics pipeline tetap, tambah field/dimensi).
- Bukan `NEW_FEATURE` karena tidak membuka flow baru (user tetap di halaman statistic yang sama).

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Analytics/*` (sudah cover halaman statistic existing) |
| PRD status | Existing (shipped) |
| PRD treatment candidate | **Addendum** — core model tidak berubah, hanya tambah filter consistency + parameter baru |

### 3.2 Filter Inconsistency (VERIFIED via codebase)

| Section | Filter tampil | Yang hilang / bermasalah |
|---------|--------------|--------------------------|
| Conversations | date + team + agent (`<StatisticFilter>`) | channel, platform belum tampil (hook support, UI tidak render) |
| Ticket | date + team + agent (`<StatisticFilter>`) | channel, platform belum tampil |
| Responsiveness | **date ONLY** (`hideTeamFilter` + `hideAgentFilter=true`) | team + agent filter hilang — agent tidak bisa filter data per-agent |
| Member Performance | direct hook (date + agent) | tanpa `<StatisticFilter>` component, inline |
| CSAT | **TANPA FILTER** (tanpa selfContext) | SEMUA filter hilang — data tidak terkonsisten dengan section lain |
| Broadcast | date + team (`hideAgentFilter`) | agent belum tampil |

**Hook `useStatisticFilter`:** support `agentId, channelId, endDate, memberAgentId, platformId, source, startDate, teamId, type` — 8 param. UI (`StatisticFilter`) cuma render date + team + agent.

### 3.3 Parameter Inventory (VERIFIED via codebase)

#### Conversation — 🟡 quick win (data sudah ada)
| Parameter | Sumber schema | Effort |
|-----------|--------------|--------|
| Per priority | `conversation.priority` | S — tambah dimensi ke pipeline |
| Spam count | `conversation.isSpam` | S |
| Junked count | `conversation.isJunked` | S |
| Group vs non-group | `conversation.isGroup` | S |
| Resolved (vs closed) | `conversation.resolvedAt` | S — perlu definisi |

#### Ticket — 🔵 butuh compute
| Parameter | Sumber schema | Effort |
|-----------|--------------|--------|
| Per priority | `ticket.priority` (TicketPriorityEnum) | M — tambah dimensi daily-metrics |
| Per ticket type/category | `ticket-type.schema.ts` | M |
| Ticket per channel/platform | `ticket.platform` / `channelId` | M |

#### CSAT — 🟡
| Parameter | Sumber schema | Effort |
|-----------|--------------|--------|
| Per channel breakdown | `channelPlatformCode`, `channelId` | S |
| Response rate | derived (totalResponses/totalSent) | S — sudah ada di type |

#### Responsiveness — 🔵
| Parameter | Sumber schema | Effort |
|-----------|--------------|--------|
| Shift-hours variant (jam kerja) | `*ShiftHoursMs` di SLA metrics | M |
| SLA target vs actual gap | `frtSnapshotConfiguredMs` / `ttcSnapshotConfiguredMs` | S |

---

## 4. Scope Boundary

### 4.1 In Scope
- **Filter fix:** CsatSection tambah `<StatisticFilter>` + selfContext.
- **Filter fix:** Responsiveness re-enable team + agent filter.
- **Filter fix:** Tambah channel/platform dropdown ke `StatisticFilter` (optional per section).
- **Filter fix:** Unified filter component (`mode` prop) mengganti 3 boolean hide.
- **Conversation 🟡:** Tambah priority, spam, junked, group split ke daily-metrics pipeline.
- **CSAT 🟡:** Tambah channel breakdown.
- **Ticket 🔵:** Tambah priority + type breakdown (kalau effort allows).
- **CSAT 🟡:** Response rate display.
- **Doc sync PRD Analytics:** update filter specification, parameter list.

### 4.2 Out of Scope
- **Patch 1 (Agent Statistic Access)** — guard fix + backfill. Brief terpisah: v1.6.
- **Patch 3 (Interactive Dashboard)** — clickable card + drill-down. Brief terpisah.
- Per-stage SLA / SLA pause/hold time (L effort, schema change).
- Shift-hours variant (M effort, ticket sudah punya, conversation bisa ikut nanti).
- FE automated test backfill (0 infrastructure).
- New statistic sections di StatisticNav (6 section tetap).
- New backend services (reuse analytics-service pipeline existing).

### 4.3 Protected Existing Behavior
- Semua metric existing tetap tampil & berfungsi.
- Filter existing (date, team, agent) tetap jalan.
- RBAC self-scope (`useAnalyticsAccessMode` + `isSelfOnly`) tetap jalan.
- `StatisticNav` hardcoded 6 section — tidak berubah.
- Daily-metrics pipeline indexing strategy tidak berubah.
- URL-driven filter pattern (`useSearchParams`) tetap jalan.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | Tambah field ke daily-metrics, tidak mengubah existing |
| RBAC / visibility / assignment | No | Filter fix = consistency, bukan permission change |
| API / webhook / socket / queue / cron | **Yes (minor)** | Tambah dimensi ke analytics aggregate pipeline (BE analytics-service) |
| SLA / reporting / export | No | Export tidak terpengaruh (berbeda layer) |
| Migration / rollback / feature flag | Yes (minor) | Tambah field ke daily-metrics schema = backward-compatible additive |
| Existing regression scope | Medium | Pastikan filter fix tidak break metric existing |

### Blast-Radius Notes
- **Filter fix blast radius:** CsatSection yang tadinya tanpa filter → sekarang punya filter → data berubah (ter-filter). Ini **intended** tapi perlu QA.
- **Responsiveness filter re-enable:** Agent yang tadinya tidak bisa filter per-agent di responsiveness → sekarang bisa. **Intended.**
- **New parameter:** additive only — card/section baru, tidak mengubah card existing.
- **Schema additive:** `conversationdailymetrics` dan `ticketdailymetrics` tambah field = backward-compatible (field baru punya default 0).

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` (addendum PRD Analytics) |
| Recommended Next Rules | `Rules/prd-writing-rule.md` (Patch/Addendum), `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Addendum PRD Analytics (filter spec + parameter spec + permission matrix update) |
| Can Proceed to PRD? | Ya — brief ini cukup matang untuk addendum |

### Routing Rationale
- Core model Analytics tidak berubah (daily-metrics pipeline tetap). Treatment = addendum/patch.
- Filter fix + parameter addition = same surface area (halaman statistic), better handled as one addendum.
- Bukan PRD baru karena tidak membuka flow baru.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner | Status |
|----|----------------|----------------|-----------|-------|--------|
| OQ-P2-01 | Channel/platform filter di SEMUA section atau hanya section yang relevan? Plus: filter mana yang perlu tampil per section? | Menentukan scope filter fix | **Yes** | PM | Open |
| OQ-P2-02 | Responsiveness: team + agent filter di-re-enable, atau emang sengaja di-hide? | Menentukan scope filter fix | **Yes** | PM | Open |
| OQ-P2-03 | Ticket priority + type breakdown = P0 atau P1? | Effort M, value tinggi | Medium | PM | Open |
| OQ-P2-04 | CSAT channel breakdown: perlu sekarang atau defer? | Effort kecil (S) | Low | PM | Open |
| OQ-P2-05 | Shift-hours variant untuk conversation: perlu? | Ticket sudah punya, conversation belum | Low | PM | Open |

---

## 8. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| Addendum PRD Analytics | `PRD/Analytics/*` | filter spec, parameter list, permission matrix update |
| Patch 3 Brief | TBD | Patch 3 depend: filter rapih + parameter lengkap = lebih banyak card yang bisa di-klik |
| Parameter Inventory | `statistic-parameter-inventory-conversation-ticket.md` | sumber data untuk scope definisi |
| 3-Patch Decomposition | `statistic-3-patch-decomposition-analysis.md` | roadmap context, dependency, routing |

---

## 9. Effort Sizing

| Component | Effort | Dependencies |
|-----------|--------|-------------|
| Filter fix (CsatSection + Responsiveness + unified component) | S–M | FE only |
| Channel/platform dropdown | S | FE (hook already supports) |
| Conversation priority/spam/junked/group | S–M | BE analytics-service pipeline |
| CSAT channel breakdown | S | BE analytics-service pipeline |
| Ticket priority + type breakdown | M | BE analytics-service pipeline + daily-metrics schema |
| **Total** | **Medium** | 3-5d dev + 1-2d QA |

---

## 10. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-08-12 | v1.0 | Initial brief: filter fix + parameter improvement decomposed from Patch 1 brief v1.6. Source: parameter inventory + 3-patch decomposition analysis. | Dany Christian |
