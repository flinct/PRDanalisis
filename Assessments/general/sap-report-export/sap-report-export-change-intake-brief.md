# Change Intake Brief: SAP Report Export (General)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** User request (chat) — "SAP Report Export (General)" — user-configurable export from analytics collections
> **Artifact Path:** `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md`
> **Version:** `v3.0`
> **Previous Version:** `Assessments/general/sap-report-export/versions/sap-report-export-change-intake-brief-v2.1.md` (v2.1 archived in-place)
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, all 10 PRD Analytics files, BE repo `analytics-service` schemas, `Memory/reference-index.md`
> **Tanggal Intake:** 2026-08-11
> **Status:** SPLIT_REQUEST (PRD writing can begin per sub-PRD)
> **Author:** Dany Christian
> **Engineering Lead:** Naftal Yunior

---

## 0. Ringkasan Update Brief

- **v3.0:** All blocking OQ answered. Routing changed from HOLD_NEEDS_DISCOVERY → **SPLIT_REQUEST**. SAP-specific brief (cross-domain, v1.0) **CONSUMED** as preset within general system. Architecture decision locked: CQRS + zero-impact sync. 4 sub-PRDs defined.
- **v2.1:** Reviewer PASS. Tambah OQ-11 (sync pipeline ownership), OQ-12 (SAP backward compat).
- **v2.0:** Deep gap analysis — enumerasi lengkap perbandingan PRD analytics vs collection schema BE, identifikasi field yang hilang, analisis arsitektur export fleksibel vs template-fixed, dan penilaian completeness collection.
- **v1.0:** Initial Phase 0 intake. Verifikasi kode BE aktual: fitur export sudah SHIPPED (product ahead of PRD).

**Key v3.0 decisions:**
1. "Collection analytics" = **LITERAL row-level baru** di `satuinbox_analytics` (OQ-1)
2. "Kebebasan export" = **custom column picker** (OQ-3)
3. Cross-domain SAP brief = **first preset** dalam general configurable system (OQ-4)
4. Broadcast export = **recipient-level + campaign-level** (OQ-5)
5. **Hard constraint: ZERO performance impact on domain services** (OQ-11)
6. Architecture: **CQRS + zero-impact sync** (selected, not optional)

---

## 1. Request Summary

**Request Summary:**
Beri user kebebasan export data **conversation, ticket, broadcast** sesuai kebutuhan (configurable columns/filters), menggunakan data **dari collection analytics** (bukan collection operasional). Jika collection analytics belum lengkap untuk kebutuhan export, **lengkapi dulu** sebelum membangun export.

**Business Problem:**
1. Export existing baca collection operasional → user ingin decouple read-load export dari operasional.
2. Export existing template-fixed (Default Ticket, per-TicketType, Default Conversation) → user ingin flexible/configurable column selection.
3. Export broadcast **tidak ada** PRD tersendiri (hanya source collection export yang ada untuk ticket+conversation).
4. Analytics collections mungkin belum lengkap untuk semua field yang perlu di-export.

**Target User / Role / Stakeholder:**
- Admin & Supervisor (sesuai RBAC export existing)
- PM: Dany Christian
- Eng Lead: Naftal Yunior
- Stakeholder operasional: user SAP yang menerima file export

**Expected Outcome:**
User dapat memilih data apa yang ingin di-export (columns, filters, date range) dari lapisan analytics yang lengkap, tanpa mengubah/berisiko terhadap data operasional.

**Urgency / Why Now:**
- SAP template: ver2.8.2 target (31 Aug–18 Sep) — can ship as Phase 1 preset BEFORE full configurable picker
- General configurable export: no fixed deadline, ships incrementally

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `MIXED_REQUEST` (confirmed v3.0) |
| Components | NEW_FEATURE + ADDITIVE_IMPROVEMENT + BEHAVIOR_CHANGE |
| Primary Domain | `Analytics` (cross-domain: Conversation, Ticket, Broadcast) |
| Request Shape | Add (collection row-level baru + configurable export + column registry) + Change (data-source repoint) |
| Initial Complexity Signal | **Critical** (scope clarity achieved via OQ, but execution scope remains large) |
| Needs Split? | **Yes — 4 sub-PRDs** (lihat §6) |

### Classification Rationale (v3.0 — updated with OQ answers)

1. **NEW_FEATURE (component 1):** Configurable column selection = **custom column picker** (OQ-3 confirmed). Template fixed → configurable = **fundamental architecture change** di export pipeline. Column registry + UI + dynamic query builder = new subsystem.

2. **ADDITIVE_IMPROVEMENT (component 2):** Lengkapi collection analytics dengan **row-level data baru** (OQ-1 confirmed literal). 3 new collections: `conversationexportdata`, `ticketexportdata`, `broadcastexportdata`. Sync pipeline dari domain services. Backfill historis. Ini pekerjaan schema enrichment + backfill yang independen dari UI export.

3. **BEHAVIOR_CHANGE (component 3):** Repoint data source export dari collection operasional → collection analytics. Fitur sama, backing store beda, behavior output harus paritas.

4. **Preset subsumption (v3.0):** Cross-domain SAP brief (v1.0) = ADDITIVE_IMPROVEMENT yang sekarang menjadi **Sub-PRD D** dalam general system. SAP template = first preset. Cross-domain brief CONSUMED — lihat §5C.

---

## 3. Current State Verification

### 3.1 PRD Status

| Item | Finding |
|------|---------|
| Relevant existing PRDs | `PRD/Analytics/PRD Analytics - offline report download.md` (v1.0, 2026-03-05), `PRD/ticketv2/PRD Ticket - Export Ticket List (XLSX).md` (v1.0) |
| PRD status | **Existing (partial)** — cover job lifecycle, RBAC, template system, retention, rate-limit. **TIDAK** mengatur: (a) data-source clause (operasional vs analytics), (b) configurable columns, (c) broadcast export PRD. |
| PRD treatment candidate | **Split per sub-PRD** (lihat §6). Each sub-PRD gets its own treatment. |

### 3.2 Implementation Status

| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | **Shipped** — halaman Offline Report Download aktif | PRD + timesheet testing 2026-05-21 |
| BE | **Shipped** — export job infrastruktur | `analytics-service/export-report-job.service.ts` (orkestrasi, dedup, rate-limit 10/hr, 1 active/channel, 30-day cap, 7-day expiry, S3). Row-building di `conversation-service`, `ticket-service`, `broadcast-service` (`export-job.processor.ts`, worker_threads). |
| Runtime / Current Behavior | **Active** — export baca collection **operasional read-only** | `getConversationsForExportBatched(...)` dll. Tidak mutasi input. |

> **FLAG: Product AHEAD of PRD.** BE sudah ship export sebelum ada PRD formal untuk data-source requirement. Constraint "harus dari collection analytics" adalah **BARU** dan belum tercermin di kode maupun PRD.

### 3.3 Related Sources

- `Memory/global-memory.md`: regression-sensitive areas
- `Memory/CLAUDE-be.md`: analytics-service owns `satuinbox_analytics` DB, service topology, proto-first
- PRD offline-report §17 addendum: Broadcast recipient-level rows incl `INVALID_REQUEST`
- Cross-domain SAP brief (v1.0, 2026-08-03): **CONSUMED by general brief** — SAP template becomes Sub-PRD D preset. Relationship documented in §5C.

---

## 4. Scope Boundary

### 4.1 In Scope

1. **Row-level analytics collections baru** — 3 new collections (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`) di `satuinbox_analytics`.
2. **Sync pipeline** — analytics-service pulls from domain services via zero-impact mechanism (event-based or read replica — NOT direct gRPC polling).
3. **Backfill historis** — populate collection baru dari data existing.
4. **Column registry** — metadata about available columns per domain (name, type, source, dependencies).
5. **Configurable column export** — user column picker UI + dynamic query builder.
6. **Broadcast export** — recipient-level rows + campaign-level summary.
7. **SAP template preset** — 4-sheet SAP template as first preset within configurable system (consumes cross-domain brief).
8. Menjaga RBAC, rate-limit, retention, dedup tetap utuh.

### 4.2 Out of Scope

- Ubah lifecycle job export (create/queue/process/complete/expire/S3) — sudah matang.
- Ubah schema collection operasional (dilarang eksplisit: "tanpa mengubah data input").
- Ubah dashboard/metrics analytics agregat (daily-counts untuk dashboard = terpisah).
- Format export baru selain XLSX (tidak disebut).
- Ubah logika broadcast filtering.
- Scheduled/email delivery report (tidak disebut).
- Direct queries on operational collections from analytics (violates OQ-11 hard constraint).

### 4.3 Protected Existing Behavior

- `conversation_sla_metrics` collection terpisah (sourced from conversation-service) — behavior dan schema tidak boleh berubah tanpa impact analysis.
- Export job lifecycle: create → queue → process → complete → expire (7d) → S3 delete.
- **Multi-tenant/company scoping (KRITIS):** semua baca export WAJIB ter-scope per `companyId`/`organizationId`. Cross-scope = **cross-tenant data leak**.
- **PII & data governance (KRITIS):** row export membawa PII pelanggan ke S3. Retensi PII, right-to-erasure vs immutable analytics store harus di-reconcile.
- RBAC: Admin+Supervisor only, Agent denied, Supervisor scoped ke Team Inbox.
- Rate limit: 10/jam per user, max 1 active job per channel.
- Date range cap 30 hari.
- Template system existing: Default + per-Ticket-Type custom fields; Conversation `CA:`/`META:` (cap 200 keys + JSON overflow).
- Secure download link 15 menit.
- Read-only terhadap collection operasional.
- **Parallel system coexistence (v3.0):** Existing export infrastructure (job lifecycle, RBAC, retention, rate limits) must coexist with new analytics-based export. Both systems may need to run in parallel during migration. Old system decommissioned only after parity validation.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | **Yes (HIGH)** | Conversation/Ticket/Broadcast core entity. New row-level collection + sync pipeline touches core business objects. |
| Multi-tenant / company scoping | **Yes (HIGH)** | New read-model/snapshot yang salah scope = cross-tenant leak. `companyId` + `organizationId` wajib carry + index. |
| PII / data governance / compliance | **Yes (HIGH)** | Row-level export = PII ke S3. Immutable analytics store bentrok dengan erasure/retensi. |
| RBAC / visibility / assignment | **Yes (MEDIUM)** | Jika configurable columns: user bisa memilih kolom PII-sensitive (phone, email) → RBAC column-level mungkin diperlukan. |
| API / webhook / socket / queue / cron | **Yes (MEDIUM)** | Event/consumer baru untuk row-level sync (mis. `analytics.export.project.*`), extend `analytics.aggregate.*`. |
| SLA / reporting / export | **Yes (HIGH)** | Export = reporting surface. Data-source change wajib paritas row-count old-vs-new. |
| Migration / backfill / feature flag | **Yes (HIGH)** | Backfill historis (volume besar — contoh SAP file 169k ticket, 88k conversation). |
| Existing regression scope | **Yes (HIGH)** | Custom attr cols, metadata 200-key JSON overflow, broadcast `INVALID_REQUEST`, dedup. Side-by-side validation wajib. |
| Configurable column export | **Yes (HIGH)** | Fundamentally different from template-fixed. Requires column registry, validation, potentially per-user saved presets. |
| Parallel system coexistence | **Yes (MEDIUM)** | Old (operational) + new (analytics) export systems run in parallel during migration. |

### Early Blast-Radius Notes

- **Konflik latent:** Analytics daily-metrics TTL/retention vs kebutuhan retensi historis export — harus dibuat eksplisit.
- `conversation_sla_metrics` collection terpisah — bila export perlu SLA fields, sumbernya bukan `conversationdailymetrics`.
- Broadcast export: **TIDAK ADA PRD existing** — perlu scope dari nol.

---

## 5A. Deep Gap Analysis — Analytics Collection Completeness vs PRD Definitions

### 5A.1 `conversationdailymetrics` vs PRD Analytics - Conversation

**Apa yang ADA di collection:**

| Field | Path | Tipe |
|-------|------|------|
| Daily total conversations | `counts.total` | number |
| Daily closed conversations | `counts.closed` | number |
| Daily open conversations | `counts.open` | number |
| Daily unassigned conversations | `counts.unassigned` | number |
| By platform breakdown | `byPlatform[]` | array |
| By tag breakdown | `byTag[]` | array |
| Replied conversations count | `replies.repliedConversations` | number |
| Total replies sent | `replies.totalRepliesSent` | number |
| Total screenshots | `screenshots.totalScreenshots` | number |
| Conversations with screenshots | `screenshots.conversationsWithScreenshots` | number |
| Dimensions | `companyId`, `organizationId`, `date`, `teamId?`, `agentId?` | — |

**Apa yang PRD definisikan tapi TIDAK ADA di collection:**

| Missing Field | PRD Source | Notes |
|---------------|-----------|-------|
| Channel name/label (per-channel detail) | PRD Conversation Analytics, "by time by channel" chart | `byPlatform[]` mungkin punya platform ID tapi label channel (WhatsApp Business, Instagram, dll) perlu join ke channel-service |
| Tag category name/label | "tags by category" chart | `byTag[]` punya data tapi label kategori perlu enrichment |
| **Row-level conversation detail** | Semua export use case | **TIDAK ADA** — collection hanya pre-aggregated daily counts. Tidak ada `conversationId`, `contactId`, `status`, `createdAt`, `closedAt`, `assignedTo`, dll |
| Conversation source (manual/auto) | Tidak ada di collection | Tidak ada field source |
| CSAT score per conversation | PRD Member Performance + Post Survey | Tidak ada di `conversationdailymetrics` |

**Gap Severity: 🔴 CRITICAL** — Untuk export row-level conversation data, collection ini **TIDAK BISA DIPAKAI** karena hanya menyimpan aggregated counts. Dibutuhkan collection row-level baru → **Sub-PRD A**.

---

### 5A.2 `ticketdailymetrics` vs PRD Analytics - Ticket

**Apa yang ADA di collection:**

| Field | Path | Tipe |
|-------|------|------|
| Daily total/closed/active/reopened | `counts.total/closed/active/reopened` | number |
| SLA met/overdue/unassigned/unresolved | `counts.slaMet/overdueSla/unassigned/unresolved` | number |
| Closed count, one-touch count | `performance.closedCount/oneTouchCount` | number |
| Total replies | `performance.totalReplies` | number |
| Total response time ms | `performance.totalResponseTimeMs` | number |
| Tickets with first response | `performance.totalTicketsWithFirstResponse` | number |
| Time to close ms | `performance.totalTimeToCloseMs` | number |
| Hourly distribution | `hourly.hourCounts` (Map<string, number>) | map |
| Weekly distribution | `weekly.dayCounts` (Map<string, number>) | map |
| FRT distribution | `frtDistribution[]` | array |
| Wait time distribution | `waitTimeDistribution[]` | array |
| Reply metrics | `replyMetrics[]` | array |
| Dimensions | Same as conversation: `companyId`, `organizationId`, `date`, `teamId?`, `agentId?` | — |

**Apa yang PRD definisikan tapi TIDAK ADA di collection:**

| Missing Field | PRD Source | Notes |
|---------------|-----------|-------|
| **Row-level ticket detail** | Semua export use case | **TIDAK ADA** — aggregated counts only. Tidak ada `ticketId`, `ticketNumber`, `AWB`, `status`, `stage`, `assignee`, `createdAt`, `closedAt`, dll |
| Ticket type name/label | Ticket type distribution | `ticketdailymetrics` tidak punya type breakdown |
| Stage duration (per stage) | SAP export: Unattended/Open/On Progress/Done duration | Collection hanya punya aggregate time-to-close, bukan per-stage duration |
| `handlingTime` | SAP export | Tidak ada — hanya `totalTimeToCloseMs` aggregate |
| Custom field values | Export existing: per-TicketType template | Tidak ada di analytics collection |
| CSAT per ticket | PRD Ticket + Member Performance | Tidak ada |
| `diffTimeFirstAssignAndFirstResponse` | SAP export | Tidak ada — hanya aggregate `totalResponseTimeMs` |
| Comment/remark count | SAP export | Tidak ada |

**Gap Severity: 🔴 CRITICAL** — Sama dengan conversation. Row-level export membutuhkan collection baru → **Sub-PRD A**.

---

### 5A.3 `broadcastdailymetrics` vs PRD Analytics - Broadcast

**Apa yang ADA di collection:**

| Field | Path | Tipe |
|-------|------|------|
| Total broadcast | `counts.totalBroadcast` | number |
| Delivered | `counts.totalBroadcastDelivered` | number |
| Failed | `counts.totalBroadcastFailed` | number |
| Pending | `counts.totalBroadcastPending` | number |
| Canceled | `counts.totalBroadcastCanceled` | number |
| Scheduled | `counts.totalBroadcastSchedule` | number |
| Invalid | `counts.totalBroadcastInvalid` | number |
| Dimensions | `companyId`, `organizationId`, `date`, `accountChannelId?` | — |

**Apa yang PRD definisikan tapi TIDAK ADA di collection:**

| Missing Field | PRD Source | Notes |
|---------------|-----------|---|
| **Row-level broadcast detail** | Export use case (broadcast recipient rows) | **TIDAK ADA** — aggregated counts only. Tidak ada `broadcastId`, `recipientPhone`, `status`, `sentAt`, `errorMessage`, dll |
| Broadcast campaign name | UI display | Tidak ada |
| Template name/content | Template system | Tidak ada |
| Recipient-level status | Offline Report PRD §17: per-recipient rows incl `INVALID_REQUEST` | Tidak ada — hanya daily aggregate counts |
| Channel detail (WhatsApp vs Email) | Channel breakdown | `accountChannelId` ada tapi label perlu enrichment |

**Gap Severity: 🔴 CRITICAL** — Broadcast collection paling minimal. Hanya 7 daily count fields. Untuk export broadcast row-level (recipient detail), collection ini **sangat tidak memadai**. Butuh collection row-level baru → **Sub-PRD A + Sub-PRD C**.

---

### 5A.4 `responsivenessmetrics` vs PRD Analytics - Responsiveness

**Apa yang ADA di collection:**

| Field | Path | Tipe |
|-------|------|------|
| Metric sum | `sum` | number |
| Metric count | `count` | number |
| Metric average | `avg` | number |
| Metric type | `metricType` | enum: CONVERSATION_ART/FRT/TTC, TICKET_ART/FRT/TTC |
| Dimensions | `companyId`, `organizationId`, `date`, `metricType`, `teamId?`, `agentId?`, `platformId?` | — |

**Gap Severity: 🟡 MEDIUM** — Responsiveness collection sudah cukup untuk dashboard aggregation. Untuk export, perlu row-level records per-interaction. Covered by Sub-PRD A scope.

---

### 5A.5 `agentperformancemetrics` vs PRD Analytics - Member Performance

**Apa yang ADA di collection:**

| Field | Path | Tipe |
|-------|------|------|
| Total/closed conversations | `conversations.totalConversations/closedConversations` | number |
| Total conversation responses | `conversations.totalResponses` | number |
| Avg reply time conversations | `conversations.avgReplyTime` | number |
| Avg time to close conversations | `conversations.avgTimeToClose` | number |
| Total/closed tickets | `tickets.totalTickets/closedTickets` | number |
| Total ticket responses | `tickets.totalResponses` | number |
| Avg reply time tickets | `tickets.avgReplyTime` | number |
| Avg time to close tickets | `tickets.avgTimeToClose` | number |
| Dimensions | `companyId`, `organizationId`, `agentId`, `date` | — |

**Gap Severity: 🟡 MEDIUM** — Cukup untuk conversation/ticket performance export. Tapi agent-level enrichment (presence, AUX, CSAT, shift) perlu source lain. Note: SAP export butuh Effective Hour + Raw AUX yang jelas **bukan dari analytics collection** ini — perlu people-service. Covered by Sub-PRD D (SAP preset).

---

### 5A.6 Summary: Gap Severity per Collection

| Collection | Dashboard Adequate? | Export Row-Level Adequate? | Gap Severity | What's Missing for Export | Sub-PRD |
|------------|--------------------|-----------------------------|--------------|--------------------------|---------|
| `conversationdailymetrics` | ✅ Yes | ❌ **No** — aggregated only | 🔴 CRITICAL | Row-level: `conversationId`, `status`, `createdAt`, `closedBy`, `channel`, `contactName`, `contactPhone`, tags, custom attrs, SLA fields | A |
| `ticketdailymetrics` | ✅ Yes | ❌ **No** — aggregated only | 🔴 CRITICAL | Row-level: `ticketId`, `ticketNumber`, `AWB`, `status`, `stage`, `assignee`, stage durations, custom fields, CSAT | A |
| `broadcastdailymetrics` | ✅ Yes | ❌ **No** — aggregated only | 🔴 CRITICAL | Row-level: `broadcastId`, `recipientPhone`, `status`, `sentAt`, `errorMessage`, campaign info | A + C |
| `responsivenessmetrics` | ✅ Yes | ❌ **No** — aggregated only | 🟡 MEDIUM | Per-interaction ART/FRT/TTC values, SLA threshold compliance | A |
| `agentperformancemetrics` | ✅ Yes | 🟡 Partial | 🟡 MEDIUM | Presence, AUX, CSAT, shift data per agent | D |

**Bottom line:** Semua collection analytics saat ini **hanya pre-aggregated daily counts** yang cukup untuk dashboard, tapi **TIDAK ADA** yang punya row-level data untuk export. Membangun export dari analytics collections = **membangun collection row-level baru** + **pipeline sinkronisasi** + **backfill historis**. Ini = Sub-PRD A.

---

## 5B. Export Flexibility Gap — Template-Fixed vs Configurable Column

### Current Architecture (Template-Fixed)

```
User selects template (Default Ticket / per-TicketType / Default Conversation)
  → API creates job with {channel, template, dateRange, filters}
  → RMQ queue (per channel)
  → Worker reads from SOURCE collection (conversation-service/ticket-service)
  → Maps to fixed column set per template
  → Generates XLSX
  → Uploads to S3
  → User downloads via 15-min presigned URL
```

**Characteristics:**
- Columns are **hardcoded per template** (Default Ticket = ~20 fixed columns, per-TicketType = fixed + custom fields, Default Conversation = base + CA + META)
- User cannot choose which columns to include/exclude
- Templates are defined in backend code, not configurable by user
- XLSX format only

### Required Architecture (Configurable Column Export — confirmed v3.0 via OQ-3)

```
User selects data domain (Conversation / Ticket / Broadcast / Multi)
  → User picks columns from available column registry (custom picker)
  → User sets filters (date range, agents, teams, status, etc.)
  → API creates job with {domain, columns[], filters}
  → RMQ queue
  → Worker reads from ANALYTICS row-level collection (Sub-PRD A output)
  → Projects ONLY selected columns
  → Generates XLSX
  → S3 → download
```

**What changes:**

| Aspect | Template-Fixed (Current) | Configurable (Required — v3.0 confirmed) |
|--------|--------------------------|-------------------------|
| Column selection | Backend-hardcoded per template | **User-driven from column registry** |
| Column registry | Implicit in code | **Needs explicit registry/metadata system** |
| Validation | Template enum → fixed mapping | Per-column validation, dependency check |
| Data source | Source collections (operasional) | **Analytics row-level collections** (new) |
| Presets | Template = preset | Template presets (e.g. SAP) + user-saved column sets |
| Multi-domain | Single channel per job | Possibly multi-domain in one file |
| Output format | XLSX only | XLSX (potentially CSV/PDF later) |

**Effort Estimate:**

| Component | Effort | Notes | Sub-PRD |
|-----------|--------|-------|---------|
| Column registry service | Medium | Metadata about available columns per domain, data types, labels, dependencies | B |
| Column picker UI (FE) | Medium | Searchable, categorized column selector, save presets | B |
| Dynamic query builder (BE) | High | Map selected columns → MongoDB aggregation pipeline on analytics collection | B |
| Analytics row-level collections (BE) | **High** | 3 new collections + sync pipeline + backfill | A |
| Parity validation | High | Side-by-side old vs new output for correctness | A + B |
| SAP preset | Low–Medium | 4-sheet template as preset within registry | D |
| Total | **Critical** | This is a multi-sprint effort | — |

---

## 5C. Cross-Domain vs General Brief Comparison (NEW §5C — OQ-4)

### Relationship

| Aspect | Cross-Domain Brief (v1.0, 2026-08-03) | General Brief (this document, v3.0) |
|--------|----------------------------------------|-------------------------------------|
| **Path** | `Assessments/cross-domain/sap-report-export/` | `Assessments/general/sap-report-export/` |
| **Scope** | SAP-specific template (4 sheets: Report Ticket 35 cols, Report Conversation 27 cols, Report Effective Hour 6 cols, Raw AUX 9 cols) | General configurable export system for all domains |
| **Classification** | ADDITIVE_IMPROVEMENT (patch existing PRD) | MIXED_REQUEST (NEW_FEATURE + ADDITIVE + BEHAVIOR_CHANGE) |
| **Routing** | ROUTE_PATCH_EXISTING_PRD | SPLIT_REQUEST (4 sub-PRDs) |
| **Effort** | Low (dev) / Medium (testing) | Critical (multi-sprint) |
| **Data source** | Existing operational collections | New analytics row-level collections |
| **Column selection** | FIXED template (user cannot choose) | Configurable (custom column picker) |
| **Target** | Replace manual process by Mas Rayyan | General system for all export use cases |
| **Urgency** | ver2.8.2 target (31 Aug–18 Sep) | SAP preset can ship Phase 1; full system incremental |

### Subsumption Decision

**General brief SUBSUMES cross-domain brief.** SAP template becomes **Sub-PRD D: first preset** within the general configurable system.

**Key insights from comparison:**

1. **Cross-domain SAP template = ONE PRESET** in the new general system. The 4-sheet structure with 35+27+6+9 columns is a specific column selection that users would save as a preset.

2. **Data source shift:** Cross-domain reads from operational collections → general reads from analytics (new row-level collections from Sub-PRD A). This means Sub-PRD D **depends on Sub-PRD A** being complete.

3. **Fixed → configurable:** Cross-domain is fixed columns → general is configurable columns. BUT: the SAP preset can potentially ship BEFORE full configurable picker (as a fixed preset on new analytics data source) — this satisfies ver2.8.2 urgency.

4. **Urgency bridge:** Sub-PRD D (SAP preset) can ship as Phase 1 — either:
   - (a) As a fixed preset in the new analytics-based system (column picker not yet built, SAP columns hardcoded as preset), OR
   - (b) After full Sub-PRD B (column registry + picker) — SAP becomes a saved preset
   
   Option (a) is faster for ver2.8.2. **Recommended: ship SAP as fixed preset first, integrate into configurable system later.**

5. **Cross-domain OQs carry over:** Stage duration mapping (OQ-03 from cross-domain), topic/sub-topic source (OQ-06), Effective Hour data source — these remain relevant for Sub-PRD D.

### Cross-Domain Brief Status

> **Status: CONSUMED by general brief.** The cross-domain brief is NOT deleted — it remains as reference. Its SAP column specifications (35+27+6+9), stage duration mapping, and OQ-01..06 carry forward as inputs to Sub-PRD D.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | **`SPLIT_REQUEST`** (v3.0 — previously HOLD_NEEDS_DISCOVERY) |
| Recommended Next Rules | `Rules/prd-writing-rule.md` (per sub-PRD), `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | PRD per sub-PRD (A first, then B/C/D in parallel where possible) |
| Can Proceed to PRD? | **Yes** — PRD writing can begin per sub-PRD. Sub-PRD A is the blocker for B/C/D. |

### Routing Rationale (v3.0)

**Mengapa SPLIT (all blocking OQ answered):**
1. OQ-1 answered: literal row-level = CQRS buildout confirmed
2. OQ-3 answered: custom column picker = NEW_FEATURE confirmed
3. OQ-4 answered: cross-domain consumed as preset
4. Scope now clear enough to write per-sub-PRD PRDs

### Revised Sub-PRD Split (v3.0)

| Sub-PRD | Scope | Complexity | Dependencies | Effort |
|---------|-------|------------|--------------|--------|
| **A: Analytics Row-Level Collections + Sync Pipeline** | 3 new collections (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`). Sync pipeline from domain services. Backfill historis. **Hard constraint: ZERO performance impact on domain services** — use read replicas, secondary reads, or event-based sync (NOT direct queries on operational collections). | **Critical** | **None — this is the FOUNDATION** | High |
| **B: Column Registry + Configurable Column Export** | Column registry (metadata per domain: name, type, source, dependencies). User column picker UI. Dynamic query builder on analytics row-level collections. XLSX generation with selected columns. Replace or coexist with template-fixed system. | **High** | Sub-PRD A complete | High |
| **C: Broadcast Export (Recipient + Campaign Level)** | New export domain for broadcast. Both recipient-level rows AND campaign-level summary. User filter selects which rows to include. | **Medium** | Sub-PRD A complete (broadcast row-level data) | Medium |
| **D: SAP Template Preset** | 4-sheet SAP template as PRESET within configurable system. Column mapping for Report Ticket (35 cols), Report Conversation (27 cols), Effective Hour (6 cols), Raw AUX (9 cols). Can potentially ship BEFORE full configurable picker (as fixed preset on new analytics data source). Cross-domain brief OQs carry over. | **Medium** | Sub-PRD A complete (for analytics-based data source) | Low-Medium |

### Phase Order

1. **Phase 1: Sub-PRD A** (collection buildout + sync + backfill) — foundation. Everything depends on this.
2. **Phase 2: Sub-PRD D** (SAP preset) — fastest path to ver2.8.2 value. Can ship as fixed preset on new analytics data BEFORE full configurable picker.
3. **Phase 3: Sub-PRD B** (column registry + configurable picker) + **Sub-PRD C** (broadcast export) — can be parallel.
4. **Phase 4:** Integration — SAP preset moves into configurable system as saved preset. Old operational-based export decommissioned after parity validation.

### Conditional Routing (resolved v3.0)

| OQ | Jawaban (resolved) | Route Impact |
|----|-------------------|--------------|
| OQ-1 | Literal row-level analytics collection | → SPLIT_REQUEST confirmed. Sub-PRD A is CQRS buildout. |
| OQ-2 | Row-level data doesn't exist yet | → Sub-PRD A must build new collections from scratch |
| OQ-3 | Custom column picker (user pilih kolom) | → Sub-PRD B = NEW_FEATURE (column registry + picker) |
| OQ-4 | Cross-domain brief = preset within general system | → Sub-PRD D consumes cross-domain brief |
| OQ-5 | Broadcast = recipient-level + campaign-level | → Sub-PRD C scope confirmed |
| OQ-11 | Zero performance impact on domain services | → Architecture: event-based sync or read replica, NOT direct gRPC polling |

---

## 7. Blocking Questions & Decisions Needed

### Resolved Questions (v3.0)

| ID | Question | Answer | Resolved By | Date |
|----|----------|--------|-------------|------|
| OQ-1 | "Collection analytics" — literal or logical? | **LITERAL row-level baru** di `satuinbox_analytics`. Diperlukan agar export langsung dari analytics, bukan dari domain services. | User / PM | 2026-08-11 |
| OQ-2 | "Belum lengkap" — incomplete-nya bagaimana? | **Row-level data belum ada.** Analytics collection saat ini hanya aggregated daily counts. Perlu row-level baru yang bisa provide data SAP-style (35 kolom ticket, 27 kolom conversation, dll). | User / PM | 2026-08-11 |
| OQ-3 | "Kebebasan export" = apa? | **User bisa pilih kolom sendiri** (custom column picker). Bukan template fixed. | User / PM | 2026-08-11 |
| OQ-4 | Hubungan dengan cross-domain brief? | Cross-domain SAP brief (v1.0) **CONSUMED** sebagai preset dalam general system. SAP template = Sub-PRD D. | User / PM | 2026-08-11 |
| OQ-5 | Broadcast export scope? | **Harus mencakup recipient-level + campaign-level.** User pilih filter sebelum export untuk menentukan row mana yang tampil. | User / PM | 2026-08-11 |
| OQ-11 | Siapa yang owns row-level sync pipeline? | **Hard constraint: ZERO performance impact on domain services.** Analytics harus tidak mengganggu performance conversation-service, ticket-service, broadcast-service sedikitpun. Analytics ambil data berkala. | User / PM | 2026-08-11 |

### Open Questions (NEW — emerge from v3.0)

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-13 | Sync mechanism: **event-based (RabbitMQ)** or periodic gRPC pull or MongoDB Change Streams? | Menentukan implementation approach Sub-PRD A. Each has different latency, complexity, and zero-impact tradeoff. | **Yes** (Sub-PRD A) | Eng Lead |
| OQ-14 | Backfill approach: **one-time batch** or incremental? | Menentukan backfill strategy Sub-PRD A. Batch = faster initial load but blocks. Incremental = slower but safer. | **Yes** (Sub-PRD A) | Eng Lead |
| OQ-15 | Column registry granularity: **per-field** or **per-computed-metric**? | Menentukan scope column registry (Sub-PRD B). Per-field = simple but limited. Per-computed = more powerful but complex (e.g. "handling time" = computed). | Yes (Sub-PRD B) | PM / Eng Lead |
| OQ-16 | SAP preset ships when: **with full configurable system** or **earlier as fixed preset**? | Menentukan Phase 2 vs Phase 3 ordering. Earlier = faster ver2.8.2 delivery but tech debt (fixed preset to refactor later). | **Yes** (timeline) | PM |
| OQ-6 | Retensi collection analytics row-level berapa lama? TTL? | Schema design + indexing strategy Sub-PRD A | Yes | PM / Eng Lead |
| OQ-7 | Volume record per domain? | Backfill feasibility & timeline | No | Engineering |
| OQ-8 | Retensi PII hasil export & rekonsiliasi right-to-erasure vs immutable analytics store? | Compliance/governance | No | PM / Legal / Eng |
| OQ-9 | Perlu CSV/PDF selain XLSX? | Format support scope | No | PM |
| OQ-10 | SLA performa export dari analytics + acceptable eventual-consistency lag? | Requirement performa & konsistensi | No | Eng Lead / PM |
| OQ-12 | Apakah column name/structure existing export harus backward-compatible untuk SAP consumer? | Business continuity risk — SAP user sudah punya automasi parsing file | No | PM / Stakeholder |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM (Dany Christian) | Scope lock + OQ answers | ✅ **Resolved** (v3.0) | All blocking OQ answered 2026-08-11 |
| Eng Lead (Naftal Yunior) | Sanity arsitektur (CQRS + zero-impact sync), volume/backfill, OQ-13/14 | **Pending** | Architecture decision locked at high level; implementation details need Eng Lead input |
| Stakeholder/Business | Verifikasi intent bisnis | ✅ **Resolved** | Literal row-level, configurable columns confirmed |
| QA | Test strategy: side-by-side parity validation, volume test | **Pending** | After Sub-PRD A scope lock |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD: Analytics Row-Level Collections (Sub-PRD A) | `PRD/Analytics/Export/` | Gap analysis §5A, collection completeness table, zero-impact constraint |
| PRD: Column Registry + Configurable Export (Sub-PRD B) | `PRD/Analytics/Export/` | Export flexibility gap §5B, architecture comparison |
| PRD: Broadcast Export (Sub-PRD C) | `PRD/Analytics/Export/` | Gap analysis §5A.3, scope boundary, recipient+campaign requirement |
| PRD: SAP Template Preset (Sub-PRD D) | `PRD/Analytics/Export/` or patch existing | §5C comparison, cross-domain brief column specs, stage duration mapping |
| Cross-Domain Brief (consumed) | `Assessments/cross-domain/sap-report-export/` | SAP column specs (35+27+6+9), OQ carryover for Sub-PRD D |
| Assessment Report | `Assessments/general/sap-report-export/` | Impact flags, routing rationale, gap tables |
| QA Pre-Implementation Review | TBD | Impact flags, parity validation strategy |
| Automation Mapping / Test Spec | TBD | Traceability + non-scope guard |

---

## 10. Architectural Options (v3.0 — DECISION LOCKED)

### v3.0 Architecture Decision

**SELECTED: Option B (CQRS) with zero-impact sync constraint.**

| Opt | Pendekatan | Status | Tradeoff |
|-----|-----------|--------|----------|
| ~~A~~ | Tetap baca operasional read-only | **REJECTED** (OQ-1: literal confirmed) | — |
| **B** | **CQRS row-level read-model** per domain (3 collections: `conversationexportdata`, `ticketexportdata`, `broadcastexportdata`), sync from domain services | **SELECTED** | Decouple bersih, future-proof; infra besar, backfill berat |
| ~~C~~ | Hybrid: operasional untuk row detail + analytics untuk enrichment aggregate | **REJECTED** (still reads operational) | — |
| ~~D~~ | Snapshot on-demand | **REJECTED** (still reads operational) | — |
| ~~E~~ | Read replica / secondary read | **REJECTED** (data operasional-shaped, no row-level enrichment) | — |
| ~~F~~ | Phase 1: E → Phase 2: B | **REJECTED** (OQ-1: must be literal analytics from start) | — |

### Zero-Impact Sync Constraint (OQ-11)

Hard constraint: **ZERO performance impact on domain services** (conversation-service, ticket-service, broadcast-service).

**Allowed sync mechanisms:**
- **Event-based:** Domain services publish events to RabbitMQ → analytics-service consumes and writes to row-level collections. Zero query load on domain DBs.
- **Read replica:** Analytics reads from MongoDB secondary/replica set. No impact on primary.
- **Change Streams:** MongoDB Change Streams on domain DBs → analytics-service tails and mirrors to row-level collections.

**NOT allowed:**
- Direct gRPC polling from analytics → domain services (would add query load to domain DBs)
- Direct queries on operational collections from analytics

**Decision: OQ-13 (sync mechanism selection) is the key remaining question for Sub-PRD A.**

---

## 11. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-11 | **v3.0:** All blocking OQ resolved. Routing → SPLIT_REQUEST. Cross-domain brief consumed as preset. Architecture decision locked: CQRS + zero-impact sync. 4 sub-PRDs defined (A: row-level collections + sync, B: column registry + configurable export, C: broadcast export, D: SAP template preset). §5C comparison added. Protected behavior updated (parallel coexistence). 4 new OQ (13-16). | Dany Christian |
| 2026-08-11 | v2.1: Reviewer PASS. Tambah OQ-11 (sync pipeline ownership), OQ-12 (SAP backward compat). Tambah `conversation_sla_metrics` ke protected behavior. | Dany Christian |
| 2026-08-11 | v2.0: Deep gap analysis — per-collection completeness table (§5A), export flexibility gap analysis (§5B), split recommendation, architecture options A-F, 10 open questions. | Dany Christian |
