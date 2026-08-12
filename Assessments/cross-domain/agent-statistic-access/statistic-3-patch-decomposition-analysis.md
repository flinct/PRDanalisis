# Deep Analysis: 3-Patch Decomposition — Statistic Feature Roadmap

> **Artifact Type:** Phase 0 Change Intake — Multi-Patch Classification
> **Author / Owner:** Dany Christian
> **Product:** SatuInbox
> **Domain:** Analytics
> **Date:** 2026-08-12
> **Status:** Draft
> **Source Request:** PM — decompose statistic work jadi 3 patch terpisah
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Artifacts:**
> - Change Intake Brief v1.5 — `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md`
> - PRD Patch v1.0 — `PRD/Analytics/PRD Analytics - agent statistic access.md`
> - Parameter Inventory — `Assessments/cross-domain/agent-statistic-access/statistic-parameter-inventory-conversation-ticket.md`
> - Extensions Analysis — `Assessments/cross-domain/agent-statistic-access/agent-statistic-dashboard-extensions-analysis.md`

---

## 0. Ringkasan

PM propose split statistic work jadi 3 patch terpisah, berurutan:

| # | Patch | Klasifikasi | Status |
|---|-------|-------------|--------|
| 1 | **Agent Statistic Access** | SECURITY_FIX + BUG_FIX + MIGRATION | PRD patch v1.0 + brief v1.5 SUDAH ADA — tinggal eksekusi |
| 2 | **Improvement Parameter Statistic Page** | ADDITIVE_IMPROVEMENT | BELUM ada artifact — perlu addendum PRD Analytics existing |
| 3 | **Interactive Dashboard (Drill-Down)** | NEW_FEATURE | BELUM ada artifact — depends Patch 2, perlu Change Intake Brief baru setelah Patch 2 di-freeze |

**Dependency:** P1 ↔ P2 paralel-safe. Keduanya prasyarat Patch 3 (guard fix + filter rapih). Patch 3 TIDAK boleh dibangun sebelum Patch 1 guard fix landing (data leak) dan Patch 2 parameter/filter lengkap (kalau gak, yang di-klik = data yang belum lengkap).

---

## 1. PATCH 1 — Agent Statistic Access (Security Fix + Backfill)

### 1.1 Classification

| Item | Value |
|------|-------|
| Change Class | `MIXED_REQUEST` — SECURITY_FIX (GAP-1 data leak, GAP-3 broadcast) + BUG_FIX (GAP-2 isSelfOnlyScope logic, GAP-5 export) + ADDITIVE_IMPROVEMENT (backfill permission) |
| Primary Domain | Analytics + Company & People (RBAC) |
| Request Shape | Guard fix + logic fix + export fix + backfill |
| Complexity | Low-Medium (3-4 hari dev + 1-2 hari QA) |

### 1.2 Artifact Status

| Artifact | Path | Status |
|----------|------|--------|
| Change Intake Brief v1.5 | `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md` | ✅ Complete — semua OQ resolved |
| PRD Patch v1.0 | `PRD/Analytics/PRD Analytics - agent statistic access.md` | ✅ Draft complete — 349 baris, US/FR/EH/EC/migration/API contract |

### 1.3 Scope (sudah terdefinisi)

- GAP-1 fix: PermissionsGuard di 5 controller (4 analytics + broadcast)
- GAP-2 fix: `isSelfOnlyScope()` logic — tambah cek `!read && !readTeam`
- GAP-3 fix: broadcast controller permission
- GAP-4 fix: metadata controller permission (low)
- GAP-5 fix: `statistic:export` permission terpisah, gate READ→EXPORT
- Backfill `statistic:read_own` ke role Agent existing (semua company)
- Backfill `statistic:export` ke role dengan `statistic:read` (tanpa ALL)
- Env var toggle `ANALYTICS_PERMISSIONS_GUARD_ENABLED`
- Unit test `isSelfOnlyScope()` + integration test backfill
- Doc sync PRD Role management Appendix E.4

### 1.4 Routing

**ROUTE_PATCH_EXISTING_PRD** — artifact sudah ada, tinggal eksekusi. Tidak perlu Change Intake Brief baru.

### 1.5 Relationship ke Patch 2 & 3

- **Prasyarat** untuk Patch 3 (interactive dashboard): guard fix harus landing duluan supaya agent drill-down tidak bocor data.
- **Tidak depend** ke Patch 2.
- Bisa dijalankan **paralel** dengan Patch 2, tapi Patch 3 harus tunggu keduanya selesai.

---

## 2. PATCH 2 — Improvement Parameter Statistic Page

### 2.1 Classification

| Item | Value |
|------|-------|
| Change Class | `ADDITIVE_IMPROVEMENT` — tambah parameter/metric + fix filter inconsistency |
| Primary Domain | Analytics |
| Request Shape | Filter fix + parameter addition |
| Complexity | Medium |

### 2.2 Problem Statement

Dua masalah di halaman statistic yang ada:

#### 2.2.1 Filter Inconsistency (harus dirapihkan dulu)

| Section | Filter yang tampil | Filter yang hilang |
|---------|-------------------|--------------------|
| Conversations | date + team + agent | channel, platform |
| Ticket | date + team + agent | channel, platform |
| Responsiveness | **date ONLY** (hideTeamFilter + hideAgentFilter) | team, agent (hilang) |
| Member Performance | direct hook (date + agent), **tanpa StatisticFilter** | team, channel |
| CSAT | **TANPA FILTER** (tanpa selfContext) | SEMUA — data bisa bocor |
| Broadcast | date + team (hideAgentFilter) | agent, channel |

**Hook (`useStatisticFilter`)** sudah support 8 param: `agentId, channelId, endDate, memberAgentId, platformId, source, startDate, teamId, type`. **UI (`StatisticFilter`)** cuma render 3 (date + team + agent). Sisanya = dead code di hook.

**Bug: CsatSection tanpa filter = data CSAT di semua section bisa berbeda filter context.** Ini bukan security bug (BE guard tetap jalan), tapi UX inconsistency.

**StatisticNav:** hardcoded 6 sections, tidak filter by role. Semua user lihat 6 section — ini OK (OQ-09 resolved: yang restrict = data di dalam, bukan menu).

#### 2.2.2 Parameter yang belum ditampilkan

Dari inventory parameter (verified codebase):

**Conversation — 🟡 quick win (data sudah ada di daily-metrics/schema):**

| Parameter | Sumber | Effort |
|-----------|--------|--------|
| Per priority | `conversation.priority` | S — tambah dimensi ke pipeline |
| Spam count | `conversation.isSpam` | S |
| Junked count | `conversation.isJunked` | S |
| Group vs non-group | `conversation.isGroup` | S |
| Resolved (bukan closed) | `conversation.resolvedAt` | S |

**Ticket — 🔵 butuh compute (field sumber ada, belum diagregasi):**

| Parameter | Sumber | Effort |
|-----------|--------|--------|
| Per priority | `ticket.priority` (TicketPriorityEnum) | M — tambah dimensi daily-metrics |
| Per ticket type/category | `ticket-type.schema.ts` | M |
| Ticket per channel/platform | `ticket.platform`/`channelId` | M |
| Per-stage SLA | `ticket.stages[].sla` | L — schema change |
| SLA pause/hold time | `TicketSlaState` + `StageSlaRuntime` | L |

**CSAT — 🟡:**

| Parameter | Sumber | Effort |
|-----------|--------|--------|
| Per channel breakdown | `channelPlatformCode`, `channelId` | S |
| Response rate (total/totalSent) | derived | S — sudah ada di type |

**Responsiveness — 🔵:**

| Parameter | Sumber | Effort |
|-----------|--------|--------|
| Shift-hours variant (FRT/TTC jam kerja) | `*ShiftHoursMs` di SLA metrics | M |
| SLA target vs actual gap | `frtSnapshotConfiguredMs` / `ttcSnapshotConfiguredMs` | S |

### 2.3 Scope (proposed)

**In Scope:**
- Fix filter inconsistency: satu komponen `StatisticFilter` konsisten dipakai semua section
- Tambah channel/platform filter dropdown (hook sudah support, tinggal UI)
- Tambah filter ke CsatSection (selfContext + StatisticFilter)
- Responsiveness: boleh filter team/agent (jangan hide semua)
- Tambah conversation parameter: priority, spam, junked, group (🟡, schema field ada)
- Tambah CSAT: channel breakdown
- Tambah ticket: per priority + per type (kalau effort allows)

**Out of Scope:**
- Per-stage SLA / SLA pause (L effort, schema change) — defer ke ticket SLA enhancement
- Shift-hours variant (M effort) — defer, ticket sudah punya, conversation bisa ikut nanti
- Interactive dashboard / clickable cards — Patch 3
- New backend services — reuse analytics-service pipeline existing
- New statistic sections (tidak menambah section di StatisticNav)

### 2.4 Filter Fix Detail

**Problem:** `StatisticFilter` dipanggil 6x dengan konfigurasi berbeda:

```
ConversationsSection  → <StatisticFilter analyticsContext={...} />
ResponsivenessSection → <StatisticFilter hideTeamFilter hideAgentFilter />
TicketSection         → <StatisticFilter analyticsContext={...} />
BroadcastSection      → <StatisticFilter hideAgentFilter />
CsatSection           → (nothing — ZERO filter)
MemberPerformance     → useStatisticFilter() directly, no StatisticFilter
```

**Fix:** 
1. **CsatSection:** tambah `<StatisticFilter analyticsContext={...} />` + pass `selfContext` ke data hook.
2. **ResponsivenessSection:** re-enable team + agent filter (jangan hide semua). Ada argumen untuk hide agent (responsiveness bisa lintas-agent), tapi hide team = overkill.
3. **Channel/Platform dropdown:** tambah ke `StatisticFilter` — optional, tergantung section. Hook sudah support `channelId`/`platformId`.
4. **Satu `StatisticFilter` component** dengan `mode` prop (`full` | `date-only` | `compact`) bukannya 3 boolean hide props.

### 2.5 Routing

**ROUTE_PATCH_EXISTING_PRD** — perlu addendum PRD Analytics existing + Change Intake Brief baru. Core model Analytics tidak berubah (daily-metrics pipeline + statistic page), hanya menambah dimensi/filter + fix inconsistency. Treatment = addendum/patch, bukan PRD baru.

### 2.6 Relationship ke Patch 1 & 3

- **Tidak depend** ke Patch 1 secara teknis (filter fix + parameter addition tidak butuh guard fix).
- **Paralel-safe** dengan Patch 1.
- **Prasyarat** untuk Patch 3: kalau parameter belum lengkap, clickable card = card yang incomplete. Patch 2 harus freeze duluan sebelum Patch 3 mulai.

---

## 3. PATCH 3 — Interactive Dashboard (Drill-Down)

### 3.1 Classification

| Item | Value |
|------|-------|
| Change Class | `NEW_FEATURE` — menambah behavior baru (clickable → list/navigate) |
| Primary Domain | Analytics + Conversation + Ticket |
| Request Shape | UI interaction enhancement + BE drill endpoint |
| Complexity | Medium-Large (phased) |

### 3.2 Problem Statement

KPI card di statistic saat ini = **statik** (plain div, tidak clickable). User ingin klik angka → lihat data aktual di balik angka tersebut.

### 3.3 Hard Problem (sudah dianalisa di extensions-analysis)

| Masalah | Detail |
|---------|--------|
| Card = count tanpa ID | Endpoint return `data.repliedConversations: number`, bukan list. Drill butuh query ulang. |
| Tidak semua card punya filter paritet | "Replied conversations" tidak punya filter `replied` di conversation list DTO. Screenshot juga tidak. |
| Date-range wajib konsisten | Navigate-with-filter tanpa date-range → angka beda → bug report. |
| RBAC dependency | Drill-down wajib lewat guard fix (Patch 1) supaya agent self-scoped. |
| Metric rasio bukan "list" | SLA rate %, one-touch %, response rate = derived dari 2 angka. Tidak punya daftar natural. Jangan clickable. |

### 3.4 Recommended Approach (per-card)

| Card / Metric | Approach | Alasan |
|---|---|---|
| Conversation: open/closed/unassigned/total | **Navigate + filter** (store hydration) | Filter paritet ada (`status`, `unassign`), tinggal bawa date-range |
| Conversation: replied | **Modal + drill endpoint** | Filter `replied` tidak ada di list DTO |
| Conversation: screenshots | **Non-clickable** (atau modal drill) | Bukan "list of conversations" natural |
| Conversation: by channel / by tag | **Navigate + filter** | `channel` dan `tags` ada di ConversationFilter |
| Ticket: total/active/closed/reopened/unassigned | **Navigate + filter** | Filter paritet ada |
| Ticket: overdue SLA / SLA met | **Modal + drill endpoint** | Derived metric, filter paritet tidak ada |
| Ticket: one-touch | **Non-clickable** | Ratio derived |
| Responsiveness: ART/FRT/TTC | **Non-clickable** | Average, bukan "list" |
| Responsiveness: SLA breakdown | **Modal + drill endpoint** | Daftar conversation/ticket di bucket "in SLA" / "over SLA" ada |
| CSAT: good/bad count | **Modal + drill endpoint** | List review dengan rating filter |
| CSAT: response rate | **Non-clickable** | Ratio |
| Member Performance: per-agent metrics | **Navigate → member performance detail** (kalau ada) atau modal | Perlu decide |

### 3.5 Phasing

| Fase | Isi | Sizing | Depends |
|------|-----|--------|---------|
| **3a** | FE: StatisticCard onClick + cursor-pointer + aria. Store hydration for navigate (date-range + status filter). Conversation card open/closed/unassigned → navigate to conversation page with filters. | M | Patch 1 (guard), Patch 2 (filter rapih) |
| **3b** | Ticket cards: total/active/closed/reopened → navigate to ticket page with filters. | M | 3a (pattern established) |
| **3c** | Modal + drill endpoint: replied conversation, overdue SLA ticket, CSAT good/bad, SLA breakdown. BE: drill endpoint per metric (reuse aggregate query, return list instead of count). | L | 3a (UI pattern), Patch 1 (guard) |
| **3d** | Advanced: by-channel/by-tag drill, member-performance drill. | M | 3c |

### 3.6 BE Drill Endpoint Design

```
POST /analytics/drill
Body: { metric: 'replied_conversations', startDate, endDate, teamId?, agentId?, page, limit }
Response: { items: Conversation[], pagination: {...}, totalFromMetric: number }

- Guard: PermissionsGuard (statistic:read | read_own | read_team | all)
- Scope: isSelfOnlyScope() → resolveAgentId force user.id
- Query: reuse analytics-service aggregate pipeline, tapi return document list (bukan count)
- Konsistensi: pakai DEFINISI METRIC YANG SAMA dengan count endpoint supaya angka match
```

Satu endpoint generic (parameter `metric`) lebih baik daripada N endpoint per-metric — kurang kode, kurang guard.

### 3.7 Routing

**ROUTE_NEW_PRD** — perlu Change Intake Brief terpisah + PRD baru. Ini NEW_FEATURE, bukan improvement.

### 3.8 Relationship ke Patch 1 & 2

- **Hard depend** ke Patch 1 (guard fix — data leak risk).
- **Soft depend** ke Patch 2 (parameter lengkap = lebih banyak card yang bisa di-klik).
- **TIDAK boleh paralel** — harus tunggu Patch 1 freeze + Patch 2 minimal filter-fix freeze.

---

## 4. Dependency Graph & Timeline

```
PATCH 1 (Agent Statistic Access)     PATCH 2 (Parameter Improvement)
   [ver2.8.1 — security-fix]            [PRD baru — additive]
           │                                      │
           │      ← paralel-safe →               │
           │                                      │
           └──────────┬───────────────────────────┘
                      │
                      ▼
         PATCH 3 (Interactive Dashboard)
         [PRD baru — new feature]
         [depend: P1 guard + P2 filter]
```

| Patch | Target Release | Effort | PRD Artifact |
|-------|---------------|--------|-------------|
| 1 | ver2.8.1 (17-28 Aug 2026) | 3-4d dev + 1-2d QA | ✅ sudah ada (PRD patch v1.0) |
| 2 | ver2.9.0 / ver3.0.0 | 3-5d dev + 1-2d QA | ❌ perlu bikin |
| 3 | ver3.0.0+ | 5-8d dev + 2-3d QA (phased) | ❌ perlu bikin |

---

## 5. Open Questions (PM / Engineering)

### Patch 1 (sudah resolved di brief v1.5 — no new OQ)

### Patch 2
- **OQ-P2-01:** Channel/platform filter mau tampil di SEMUA section atau hanya section yang relevan? (mis. channel filter di ticket = tidak relevan kalau ticket tidak punya channel concept). Untuk setiap section: filter mana yang perlu tampil?
- **OQ-P2-02:** Responsiveness section: team + agent filter mau di-re-enable? Atau memang sengaja di-hide (alasan design)?
- **OQ-P2-03:** Priority + type breakdown untuk ticket = P0 atau P1? (effort M, tapi value tinggi)
- **OQ-P2-04:** CSAT channel breakdown: perlu sekarang atau defer?
- **OQ-P2-05:** (merged ke OQ-P2-01 — shift-hours & filter scope per section termasuk pertanyaan yang sama)

### Patch 3
- **OQ-P3-01:** Card mana yang WAJIB clickable? (rekomendasi: mulai open/closed/unassigned/replied)
- **OQ-P3-02:** Metric rasio (SLA rate %, response rate) = non-clickable, setuju?
- **OQ-P3-03:** Drill endpoint generic (satu endpoint, parametric) vs per-metric endpoint? (rekomendasi: generic)
- **OQ-P3-04:** Navigate-with-filter vs modal — setuju per-card approach (navigate untuk yang filter paritet ada, modal untuk yang butuh drill endpoint)?
- **OQ-P3-05:** "Replied conversations" drill = P0? (contoh PM yang paling sering dipakai, tapi paling sulit — butuh drill endpoint)

---

## 6. Ringkasan Routing

| Patch | Route | Artifact Needed |
|-------|-------|----------------|
| 1 | Agent Statistic Access | `ROUTE_PATCH_EXISTING_PRD` (artifact sudah ada) | ✅ sudah ada — tinggal eksekusi |
| 2 | Parameter Improvement | `ROUTE_PATCH_EXISTING_PRD` (addendum PRD Analytics) | ✅ Change Intake Brief + addendum PRD Analytics existing |
| 3 | Interactive Dashboard | `ROUTE_NEW_PRD` | ✅ Change Intake Brief + PRD baru (terpisah) |
