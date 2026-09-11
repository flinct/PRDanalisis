# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Column Registry + Configurable Column Export
**Phase**: Phase 2
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: TBD
**Link**: —
**Contributors**: Dany Christian, Naftal Yunior
**Version**: v2.0
**TRD**: — (pending)

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| --- | | --- | --- |
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD for Phase 2: column registry, configurable column picker UI, dynamic query builder, and export job enhancement. |
| v2.0 | 2026-08-19 | Dany Christian | Comprehensive revision addressing tech review (12 blocking issues, 22 nits). Key changes: corrected XLSX writer assumptions (B-01), restored field-level PII masking model (B-02), fixed contactName PII/default-preset conflict (B-03), replaced fictional templateId with actual CreateReportJob contract (B-04), added legacy column→registry mapping for 6 unmapped ticket columns (B-05), resolved object-field serialization to JSON string (B-06), added Column Registry Governance section (B-07), added column-lifecycle edge-case user stories and skip-with-warning for deactivated columns (B-08), corrected contradictory adoption KPIs (B-09), completed per-domain filter disposition table (B-10), removed unreachable columns-aware dedup (B-11), deleted subscription tier gating (Phase 4 concern) and moved PII ack to job document (B-12). Promoted appendices G–M to numbered sections §17–§23. Applied all 22 non-blocking nits. |

## **2. Overview**

| Item | Description |
| --- | | --- |
| Purpose | Provide user-configurable column selection for export jobs, replacing the fixed template system with a column registry + picker UI that reads from analytics row-level collections. |
| Scope | Column registry collection (`exportcolumnregistry`), column picker UI, dynamic query builder, export job enhancement to accept custom column sets, enhanced filter panel, enhanced job list. |
| Key Capabilities | (1) Metadata-driven column registry per domain. (2) Searchable, categorized column picker UI with PII badges and masking-aware warnings. (3) Dynamic MongoDB aggregation pipeline for selected-column projection. (4) Enhanced filter panel (tags, inbox/team). (5) Job list shows domain and column snapshot. |
| Outcome | Admin and Supervisor users can select exactly which columns to export per domain, with columns sourced from analytics row-level collections (PRD-A). PII fields are masked in accordance with existing `privacy:view_full_email` / `privacy:view_full_phone` permissions. |

> **Terminology note**: This document uses "Phase 2" numbering (PRD Analytics – Configurable Column Export). Earlier drafts referenced "Sub-PRD B". Downstream artifacts (TRD, prompts, plans, summary) should use the slug `advance-export-phase-2-column-registry-and-configurable`.

### **Scope Definition**

| In Scope | Out of Scope |
| --- | | --- |
| Column registry collection (`exportcolumnregistry`) with per-field metadata per domain | SAP 4-sheet template preset → Phase 4 (this PRD builds the picker; Phase 4 adds SAP as a preset) |
| Column picker UI on existing Offline Report Download page | Broadcast-specific export UX → Phase 3 (this PRD allows broadcast domain in picker, but broadcast-specific filters and UX is Phase 3) |
| Export job enhancement: `columns[]` in job creation, project only selected columns into XLSX | The 3 new analytics collections (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`) → PRD-A |
| Dynamic query builder: MongoDB aggregation pipeline from analytics collections | The sync pipeline (event-driven + backfill) → PRD-A |
| Filter panel enhancement: Tags filter, Inbox/Team filter | Export job infra (queue, S3, retention, download link) → reuse existing offline-report-download |
| Job list enhancement: show domain, column snapshot | CSV/PDF format support |
| PII field warning badges in column picker + field-level masking per existing privacy permissions | User-defined custom or computed columns (not in this phase) |
| System-managed default presets per domain | User-saved presets (P2 — documented in Future Considerations) |
| Date range, status, employee, channel filters (reuse existing) | Keyword filter, Ticket IDs filter |
| Column registry is tenant-agnostic (defines available columns globally); filter option values (tags, inbox/team) are tenant-scoped (reflect tenant's data) | — |

## **3. Problem Statement**

| ID | Problem | Impact |
| --- | | --- |
| PS-001 | Current export uses fixed templates — users cannot choose which columns to include or exclude. | Users must export all columns even when they need only a subset, producing oversized files with unnecessary data. |
| PS-002 | No column metadata system exists — available columns are implicitly defined in backend code per template. | Adding new export columns requires a registry seed script update and potentially a PRD-A schema change. Not fully code-free, but decoupled from export query/generation logic. |
| PS-003 | Export reads from operational collections, coupling export read-load to domain-service performance. | Risk of performance degradation on live customer-service operations during heavy export jobs. (PRD-A solves the data source; this PRD builds the consumer.) |
| PS-004 | PII fields (phone, email) are included in exports without explicit user acknowledgment. | Compliance risk — users may unknowingly export PII without governance awareness. |
| PS-005 | Filter panel lacks tag-based and inbox/team-based filtering for exports. | Users cannot narrow export scope to specific tags or teams, requiring post-export manual filtering. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| --- | | --- |
| Enable user-driven column selection for exports | ≥ 80% of new export jobs created after launch use column picker (parameters.columns[] present) |
| Reduce export file size for targeted use cases | Median file_size_bytes per row for configurable jobs monitored vs trailing-30-day median of legacy jobs on same domain. Target: ≥ 30% reduction. Monitored metric, not KR. |
| Maintain PII governance awareness | 100% of jobs containing PII columns require explicit user acknowledgment before submission. |
| Maintain PII privacy compliance | Configurable export honours existing `privacy:view_full_email` and `privacy:view_full_phone` masking permissions — no regression from shipped behavior. |
| Provide discoverable column metadata | Column registry covers 100% of fields from PRD-A collections (§10.1, §10.2, §10.3). |
| Preserve existing export job reliability | Job completion rate remains ≥ 98% (matching existing offline-report KPI). |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| --- | | --- | --- |
| US-001 | P0 | As an Admin, I want to select a data domain (Tiket/Percakapan) so that the column picker shows columns relevant to that domain. | 1. Given I open the Offline Report page, When I select "Tiket" as Tipe Laporan, Then the column picker shows ticket-domain columns grouped by category. 2. Given I select "Percakapan", When the picker loads, Then conversation-domain columns are shown instead. 3. Given I switch domain, When previous column selections are invalid for the new domain, Then selections are cleared and the picker resets. |
| US-002 | P0 | As an Admin, I want to pick specific columns from a searchable, categorized list so I can export only the data I need. | 1. Given the column picker is open, When I search for "SLA", Then all columns with "SLA" in the display name or description are shown. 2. Given a category "Waktu & SLA" exists, When I expand it, Then I see all columns in that category with checkboxes. 3. Given I select 5 columns, When I submit the job, Then the XLSX contains only those 5 columns as headers, in the order I selected them. |
| US-003 | P0 | As an Admin, I want to select all columns in a category or all columns at once for convenience. | 1. Given I expand a category, When I click "Pilih Semua" for that category, Then all columns in that category are checked. 2. Given I click "Pilih Semua" (global), When applied, Then every column in the picker is checked. 3. Given I click "Hapus Semua", When applied, Then all column selections are cleared. |
| US-004 | P0 | As an Admin, I want PII columns flagged with a warning so I can make an informed decision before exporting sensitive data. | 1. Given PII columns exist (e.g. contactPhone, contactEmail), When I view the picker, Then these columns show a "PII" badge/warning icon. For users without full privacy:view_full_phone or privacy:view_full_email permission, the badge text reads "Akan Disamarkan". 2. Given I select a PII column, When I attempt to submit, Then a confirmation dialog appears. Dialog text for users without full privacy access: "Kolom PII akan disamarkan sesuai permission Anda". 3. Given I decline the PII confirmation, When the dialog closes, Then I return to the picker with my selection intact (PII columns remain checked) and submission is blocked. |
| US-005 | P0 | As an Admin, I want to set filters (date range, status, channel, employee, tags, inbox/team) so the export contains only relevant rows. | 1. Given I select "Tiket", When I open the Tags filter, Then I see a multi-select of tags available in ticket analytics data. 2. Given I select an Inbox/Team, When I submit, Then only rows belonging to that inbox/team are exported. 3. Given all existing filters (date range, status, employee, channel), When I apply them, Then they function identically to current offline-report behavior. |
| US-006 | P0 | As an Admin, I want the job list to show which domain and columns were selected so I can review past export configurations. | 1. Given a job is created, When I view the job list, Then I see "Tipe Laporan" (domain) in the row. (Note: this column already exists as TableOfflineReportColumn.tsx:145 — `channel` mapped to `t('report-type')`. Enhancement: relabel, not add.) 2. Given a job has a column snapshot, When I expand "Parameter Permintaan", Then I see the list of selected column display names. (Note: "Parameter Permintaan" is a NEW expandable UI component. The current job-list renders parameters as a single truncated JSON cell with tooltip, headed "Filter Data" (TableOfflineReportColumn.tsx:211-222). This FR replaces that cell with a structured expandable.) 3. Given an existing legacy job from before this feature, When I view the list, Then it shows the channel name in the parameters display (backward compatible with existing parameter rendering). |
| US-007 | P0 | As an Admin, I want the export XLSX to contain exactly the columns I selected, in the order I selected them, with Bahasa display names as headers. | 1. Given I select columns [contactName, status, createdAt, channel], When the XLSX is generated, Then the headers are [Nama Kontak, Status, Tanggal Dibuat, Kanal] in that order. 2. Given a field value is null for a row, When exported, Then the cell shows "-". 3. Given I select columns from the registry, When exported, Then the header uses the `displayName` from the registry snapshot stored at job creation time, not the raw field path. |
| US-008 | P0 | As a Supervisor, I want column access scoped to my permission level so I do not export PII data I am not authorized to see. | 1. Given I am a Supervisor, When I open the column picker, Then I see all non-PII columns normally. PII columns show "Akan Disamarkan" badge when I lack full privacy permissions. 2. Given I am a Supervisor, When PII columns are shown, Then the PII confirmation requires explicit opt-in, same as Admin. 3. Given my Team Inbox scope limits my data, When I export, Then the export path respects the existing list-level scoping (own jobs only for non-Admin roles per export-report-job.repository.ts:68,100). **Note**: row-level Team Inbox scoping within a single export job (filtering exported rows by team membership) is NOT implemented in the current export path — this is a known gap. Future enhancement required for per-row team scoping. |
| US-009 | P0 | As an Admin, I want the column picker to remember my last selection as a quick-start default so I do not have to re-pick columns every time. | 1. Given I previously exported with columns [A, B, C], When I open the column picker for the same domain again, Then those columns are pre-selected. 2. Given I clear selections and pick new ones, When I submit, Then the new selection becomes the remembered default. 3. Given I switch domain, When the picker reloads, Then the remembered default is for the new domain (not the previous domain). |
| US-010 | P0 | As an Admin, I want the export job to handle gracefully if a selected column is deactivated between creation and processing, so I do not lose the entire export for one unavailable column. | 1. Given I selected column "foo" and it was deactivated before job processing, When the job runs, Then the job proceeds WITHOUT that column, a warning is logged, and the completion message states: "Kolom [displayName] tidak tersedia dan dilewati." 2. Given all selected columns are valid, When the job runs, Then it completes normally. |
| US-011 | P2 | As an Admin, I want to save my current column selection as a named preset so I can reuse it across export jobs. | 1. Given I have selected 15 columns, When I click "Simpan Preset" and name it "Weekly Report", Then the preset is saved to my account. 2. Given I have saved presets, When I open the column picker, Then I see a "Presets" section with my saved presets. 3. Given I select a preset, When applied, Then the corresponding columns are checked. |
| US-012 | P1 | As a user, when I open the column picker and my saved preset contains a deactivated column, I want to see which columns are unavailable so I can repair my preset. | 1. Given my saved preset contains column "foo" which has been deactivated, When I open the picker and load that preset, Then deactivated columns are shown with a red badge "Tidak Tersedia". 2. Given I see a deactivated column in my preset, When I click remove on that column, Then it is removed from the preset. |
| US-013 | P1 | As a user, when my remembered selection (localStorage) contains a deactivated column, I want the picker to auto-remove it on load so submission doesn't fail. | 1. Given localStorage contains column "foo" for domain "ticket" and "foo" is now deactivated, When the picker loads for "ticket", Then "foo" is silently removed from the selection and the picker shows the remaining valid columns. |

## **6. Functional Requirements**

| Category | Requirements |
| --- | | --- |
| **Column Registry — Schema & Population** | FR-001 [P0]: System MUST create collection `exportcolumnregistry` in `satuinbox_analytics` with document shape defined in Appendix A. FR-002 [P0]: System MUST populate registry entries for all fields in `conversationexportdata` (PRD-A §10.1 — 33 fields), `ticketexportdata` (PRD-A §10.2 — 43 fields), and `broadcastexportdata` (PRD-A §10.3 — 24 fields). FR-003 [P0]: Each registry entry MUST include: `domainId`, `fieldPath`, `displayName` (Bahasa Indonesia), `dataType`, `category`, `description`, `sortWeight`, `isActive`, `isComputed`, `isPII`. FR-004 [P0]: System MUST flag PII fields with `isPII: true`: Conversation domain: `contactPhone`, `contactEmail`, `contactName`. Ticket domain: `customerEmail`, `customerPhone`, `clientContact` (see §19 Legacy Column Mapping). Broadcast domain: `recipientNumber`, `recipientName`, `senderNumber`. FR-005 [P0]: Registry MUST organize columns by category/group: "Informasi Dasar", "Kontak & Identitas", "Waktu & SLA", "Status & Lifecycle", "Tag & Kategori", "Kanal & Platform", "Custom Fields", "Metadata". FR-006 [P0]: Registry entries MUST be tenant-agnostic (shared across all tenants) — the registry defines available columns globally, not tenant-specific column permissions. Filter option values (tags, inbox/team) are tenant-scoped because they reflect each tenant's operational data. FR-007 [P1]: System MUST support `isComputed: true` for fields that are derived/computed (e.g. `handlingTimeMs`, `diffTimeFirstAssignAndFirstResponseMs`, `stageDuration*Ms`, `avgResponseTimeMs`). |
| **Column Registry — Query API** | FR-008 [P0]: System MUST expose a gRPC endpoint `GetColumnRegistry` that accepts `domainId` and returns all active columns for that domain, grouped by category. FR-009 [P0]: Response MUST include: `fieldPath`, `displayName`, `dataType`, `category`, `description`, `sortWeight`, `isPII`, `isComputed` per column. FR-010 [P0]: Response MUST be sorted by `sortWeight` ascending within each category group. FR-011 [P1]: System MUST support a `searchQuery` parameter that filters columns by `displayName` or `description` (case-insensitive substring match). |
| **Export Job — Column Selection** | FR-012 [P0]: Export job creation payload MUST accept `columns[]` (within `parameters` struct) — an array of `fieldPath` strings. The array order IS significant: it determines the column order in the generated XLSX file. FR-013 [P0]: System MUST validate that all `fieldPath` values in `columns[]` exist in the column registry for the selected domain. FR-014 [P0]: System MUST reject job creation if `columns[]` is empty (at least 1 column required). FR-015 [P0]: System MUST reject job creation if any `fieldPath` is not found or not active in the registry. FR-016 [P0]: System MUST store the full column snapshot (fieldPaths + displayNames + dataTypes + registryVersion) in the job parameter for reproducibility. FR-017 [P0]: System MUST read data from the corresponding PRD-A analytics collection (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`) based on domain (channel). FR-018 [P0]: System MUST project ONLY the selected columns into the XLSX output — no additional columns. Column order in XLSX MUST match the order of `columns[]` in the request. |
| **Export Job — Domain Support** | FR-019 [P0]: System MUST support domain values: `conversation`, `ticket`. FR-020 [P0]: Broadcast domain (`broadcast`) MUST be selectable in the column picker but broadcast-specific filters and UX is deferred to Phase 3. FR-021 [P0]: Each domain maps to one analytics collection: `conversation` → `conversationexportdata`, `ticket` → `ticketexportdata`, `broadcast` → `broadcastexportdata`. |
| **Export Job — Backward Compatibility** | FR-022 [P0]: Existing `CreateReportJob` payload contract retained: `channel` (ExportReportChannelType: ticket\|conversation\|broadcast) + `parameters` (Struct) + `userContext`. No new top-level fields introduced. FR-023 [P0]: The configurable path is selected when `parameters.columns[]` is present and non-empty; otherwise the legacy fixed-header path runs unchanged. FR-024 [P0]: `channel` serves as domain identifier — no new `domainId` top-level field is introduced. FR-056 [P0]: For legacy jobs without `columns[]`, "Parameter Permintaan" continues showing the existing parameter rendering (channel name, date range, filters). For configurable jobs, it shows selected column display names. |
| **Dynamic Query Builder** | FR-025 [P0]: System MUST build a MongoDB aggregation pipeline that takes `{channel, columns[], filters}` and produces a cursor over the corresponding analytics collection. FR-026 [P0]: Pipeline MUST include a `$match` stage with `{companyId, organizationId}` scoping as the first filter stage. FR-027 [P0]: Pipeline MUST support filter stages per domain (see §6 Filter Panel Per-Domain Disposition). FR-028 [P0]: Pipeline MUST include a `$project` stage that selects ONLY the fields in `columns[]` plus internal fields needed for dedup. FR-029 [P0]: Pipeline MUST return a streamed cursor (not load full result set into memory) for XLSX generation. The XLSX writer currently uses SheetJS (xlsx ^0.18.5) in-memory with a 20,000-row cap per job. See §12 for the streaming dependency decision. FR-030 [P0]: System MUST map `displayName` values as XLSX column headers, using the registry snapshot stored at job creation time. |
| **Dynamic Query Builder — Field Mapping** | FR-031 [P0]: For simple fields (string, number, Date, boolean), the pipeline MUST use direct field path projection. FR-032 [P0]: For array fields (`tags`, `assignedTo`, `assignee`, `participants`), the pipeline MUST join array elements with ", " separator for XLSX cell value. FR-033 [P0]: For object fields (`customAttributes`, `customFields`, `metadata`), the pipeline MUST serialize as JSON string. No flattening. FR-034 [P0]: For Date fields, the pipeline MUST format as `YYYY-MM-DD HH:mm:ss` in workspace timezone (Asia/Jakarta). FR-035 [P0]: For duration fields (ms values like `firstReplyTimeMs`, `handlingTimeMs`, `timeToCloseMs`), the pipeline MUST format as `HH:mm:ss` human-readable duration. FR-036 [P1]: For nested object fields (`remarks`, `rawEvent`), the pipeline MUST serialize as JSON string. |
| **Frontend — Column Picker UI** | FR-037 [P0]: System MUST render a column picker component on the Offline Report Download page when a domain is selected. FR-038 [P0]: Column picker MUST display columns grouped by category, each category collapsible/expansible. FR-039 [P0]: Each column row MUST show: checkbox, `displayName`, `dataType` badge, and (if PII) a warning icon/badge. For users without full privacy permissions, PII badge text MUST read "Akan Disamarkan". FR-040 [P0]: Column picker MUST include a search input that filters columns by `displayName` substring (debounced, client-side filter against pre-loaded registry). FR-041 [P0]: Column picker MUST provide "Pilih Semua" (select all) per category and "Pilih Semua" (global select all). FR-042 [P0]: Column picker MUST provide "Hapus Semua" (deselect all). FR-043 [P0]: Column picker MUST show a selected-column count indicator (e.g. "12 kolom dipilih"). FR-044 [P0]: Column picker MUST prevent submission if zero columns selected (show "Pilih minimal 1 kolom"). |
| **Frontend — PII Confirmation** | FR-045 [P0]: When user selects one or more PII-flagged columns, the submit action MUST trigger a confirmation dialog. FR-046 [P0]: Confirmation dialog MUST display: "Kolom yang dipilih mengandung data pribadi (PII). Kolom PII akan disamarkan sesuai permission Anda." with the list of PII column display names. FR-047 [P0]: If user cancels, the picker returns with selection intact (PII columns remain checked) and submission is blocked. FR-048 [P0]: If user confirms, submission proceeds and the PII acknowledgment is recorded on the job document: `parameters.piiAcknowledgedBy` (userId), `parameters.piiAcknowledgedAt` (ISO timestamp). Retained for the 7-day job lifecycle. |
| **Frontend — PII Masking (Privacy Compliance)** | FR-061 [P0]: When a requester lacks `privacy:view_full_phone` permission, PII columns (`contactPhone`, `recipientNumber`, `senderNumber`, `contactName`, `clientContact`) MUST be exported masked using `maskPhone()` from the common library. When requester lacks `privacy:view_full_email`, `contactEmail`, `customerEmail` MUST be exported masked using `maskEmail()`. The PII badge in the picker MUST indicate "Akan Disamarkan" rather than a plain warning for users without full privacy access. FR-062 [P0]: Configurable export HONOURS existing `privacy:view_full_email` and `privacy:view_full_phone` masking permissions (ticket-export.processor.ts:79-86, broadcast-export.processor.ts:72-80, privacy-masking.interceptor.ts:16-19). The PII acknowledgment dialog is ADDITIVE governance UX, not a replacement for masking. |
| **Frontend — Filter Panel Enhancement** | FR-049 [P0]: Filter panel MUST retain ALL existing filters per domain. See §6 Filter Panel Per-Domain Disposition table below. FR-050 [P0]: System MUST add a "Tag" multi-select filter that populates from tag values in the corresponding analytics collection for the selected domain. FR-051 [P0]: System MUST extend Inbox/Team filtering to conversation and ticket domains (broadcast already supports teamIds per existing BroadcastReportParamsDto). FR-052 [P1]: Tags and Inbox/Team filter options MUST be scoped to the requester's tenant and permission scope. FR-053 [P1]: Tags filter MUST support search-as-you-type for large tag sets. |
| **Frontend — Job List Enhancement** | FR-054 [P0]: Job list MUST continue to display "Tipe Laporan" (domain: Tiket/Percakapan/Broadcast) as a column in each job row. Note: this column already exists as TableOfflineReportColumn.tsx:145 (`channel` → `t('report-type')`). Enhancement is relabel/retain, not add. FR-055 [P0]: Job list MUST add a NEW "Parameter Permintaan" expandable section that shows selected column display names as a comma-separated list. (Current UI: single truncated JSON cell with tooltip, headed "Filter Data" (TableOfflineReportColumn.tsx:211-222). The new expandable replaces this cell for configurable jobs.) FR-057 [P1]: If column count exceeds 10 in the snapshot, "Parameter Permintaan" MUST show first 10 column names plus "dan {N} kolom lainnya". |
| **Frontend — Default Preset** | FR-058 [P0]: System MUST provide a system-managed "Default" preset per domain that includes all non-PII active columns (`isPII: false` per registry). FR-059 [P0]: "Default" preset MUST be pre-selected when the user opens the column picker and has no remembered selection in localStorage. FR-060 [P0]: System MUST persist the user's last column selection per domain in localStorage (client-side) for quick-start on next visit. If a persisted selection contains a deactivated column, the picker MUST auto-remove it on load (US-013). |
| **Column Registry — Governance** | FR-063 [P0]: Every job column snapshot MUST store `registryVersion` (semver) from the registry at creation time. FR-064 [P0]: System MUST run a registry-vs-collection field-name drift check (CI or startup). If a registry entry's `fieldPath` no longer exists in the target collection schema, alarm MUST fire. Count-based comparison is insufficient — must be field-name-aware. |
| **Column Lifecycle** | FR-065 [P0]: When a selected column is deactivated between job creation and processing, the export MUST proceed WITHOUT that column. Warning logged. User notified via job completion message: "Kolom [displayName] tidak tersedia dan dilewati." FR-066 [P1]: Job-list MUST display snapshot `displayName` for columns (immutable from creation time). Acceptable staleness if displayName changes after snapshot. |

### **6.1 Filter Panel Per-Domain Disposition**

All existing filters MUST be retained. This table is the authoritative list per domain.

**Ticket domain** (`export-parameter.dto.ts:20-27`):

| Filter | Retained | Notes |
| --- | | --- |
| ticketTypeId | Yes | Existing template selector; retained as filter |
| startDate / endDate | Yes | Date range cap: MAX_DATE_RANGE_DAYS = 31 (report-job.constant.ts:4) |
| participants | Yes | |
| stageTypes | Yes | |
| tags | NEW | Added by this PRD (FR-050) |
| inboxIds / teamIds | NEW | Extended to ticket domain (FR-051) |

**Conversation domain** (`export-parameter.dto.ts`):

| Filter | Retained | Notes |
| --- | | --- |
| startDate / endDate | Yes | MAX_DATE_RANGE_DAYS = 31 |
| participants | Yes | |
| excludeJunked | Yes | |
| excludeSpam | Yes | |
| statuses | Yes | |
| tags | NEW | Added by this PRD (FR-050) |
| inboxIds / teamIds | NEW | Extended to conversation domain (FR-051) |

**Broadcast domain** (`BroadcastReportParamsDto`):

| Filter | Retained | Notes |
| --- | | --- |
| channels | Yes | Broadcast-specific channel filter |
| createdBy | Yes | |
| startDate / endDate | Yes | MAX_DATE_RANGE_DAYS = 31 |
| statuses | Yes | |
| teamIds | Yes | Already supported |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| --- | | --- | --- |
| EH-001 | Validation | `columns[]` is empty. Reject job creation. | "Pilih minimal 1 kolom". |
| EH-002 | Validation | One or more `fieldPath` values not found in registry. Reject job creation. | "Kolom tidak valid: {fieldPath}". |
| EH-003 | Validation | One or more `fieldPath` values are inactive in registry. Reject job creation. | "Kolom tidak tersedia: {displayName}". Note: deactivated columns within the registry TTL window (5 min) may cause this on submit — acceptable trade-off. |
| EH-004 | Validation | Domain (channel) is missing or invalid. Reject job creation. | "Jenis laporan tidak valid". |
| EH-005 | Validation | Date range invalid (start > end, range > 31 days, empty). Block submission. | Reuse existing error messages from offline-report PRD. |
| EH-006 | PII | User selects PII columns without confirming. Block submission. | "Konfirmasi kolom PII diperlukan". |
| EH-007 | Processing | XLSX generation fails due to row cap (20,000 rows exceeded). Mark job FAILED. | "Gagal membuat laporan. Kurangi jumlah kolom atau perkecil rentang tanggal. Batas maksimum 20.000 baris per job." |
| EH-008 | Processing | Analytics collection query times out. Retry once, then mark job FAILED. | "Gagal membuat laporan. Coba lagi nanti". |
| EH-009 | Registry | Column registry is empty or unavailable at job creation time. Reject job creation. | "Registri kolom tidak tersedia. Coba lagi nanti". |
| EH-010 | Permission | Supervisor submits job — system re-scopes at processing time using current permission scope. | If zero rows after scoping, job completes with headers-only XLSX. "Laporan selesai tanpa data". |
| EH-011 | Stale Data | Column deactivated between job creation and processing. Export proceeds WITHOUT that column, warning logged. | "Kolom [displayName] tidak tersedia dan dilewati." (skip-with-warning, not all-or-nothing failure) |
| EH-012 | Duplicate | User already has an active job for this domain. Block creation. | "Too many active export jobs" (existing error per MAX_ACTIVE_JOBS_PER_CHANNEL = 1). |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| --- | | --- | --- |
| EC-001 | User selects all columns (43 for ticket domain) | Job proceeds. XLSX generation uses current in-memory writer (SheetJS). Enforces 20,000-row cap per job. | "Data terlalu besar. Kurangi jumlah kolom atau perkecil rentang tanggal. Batas maksimum 20.000 baris per job." |
| EC-002 | User selects only PII columns (e.g. contactPhone, contactEmail) | PII confirmation dialog shown. If confirmed, job proceeds with only those columns. Columns exported with masking per requester's privacy permissions. | Normal flow after PII confirmation. |
| EC-003 | Column registry entry exists but corresponding field is missing from analytics collection row (null in every row) | Column appears in XLSX with all cells showing "-". Column is not removed from output. | No user-facing error. |
| EC-004 | User switches from "Tiket" to "Percakapan" after selecting 20 ticket columns | Column picker clears selections and reloads conversation-domain columns. | Brief loading state, then picker shows conversation columns with no pre-selection. |
| EC-005 | Custom attributes / metadata columns from conversation domain | Object fields (`customAttributes`, `metadata`) are exported as JSON strings, not flattened. Each is a single registry entry. | Object fields show as "Objek (JSON)" type badge. |
| EC-006 | Ticket custom fields from `customFields` object | Same as EC-005 — `customFields` is a single registry entry of type object. Exported as JSON string, not flattened into per-key columns. | Object field badge. |
| EC-007 | User submits with tags filter but no matching rows exist | Job completes with headers-only XLSX. | "Laporan selesai tanpa data". |
| EC-008 | Legacy job submitted while configurable column system is active | Both paths work in parallel. Job list correctly shows parameter display for legacy jobs (channel name, date range) and column list for configurable jobs. | Backward compatible display. |
| EC-009 | User selects > 50 columns | Warning displayed: "Anda memilih lebih dari 50 kolom. Proses export mungkin lebih lama." Job proceeds. | Warning toast, non-blocking. |
| EC-010 | Supervisor's Team Inbox scope changes between job creation and Processing | Processing uses current list-level scope at execution time (own jobs only for non-Admin). Row-level team scoping within export data is not implemented — see US-008 AC3. | Job may produce different results than expected. No error. |
| EC-011 | Broadcast domain selected in picker but Phase 3 broadcast-specific UX not yet shipped | Column picker shows broadcast-domain columns. Filters show broadcast's actual existing filters: channels, createdBy, startDate, endDate, statuses, teamIds. | Functional but no broadcast-specific picker UX. |
| EC-012 | User already has an active job for this domain | MAX_ACTIVE_JOBS_PER_CHANNEL = 1 per user per domain blocks the second submission. | "Too many active export jobs" (existing error). |

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| --- | | --- | --- |
| Domain Selector | Existing "Tipe Laporan" selector (i18n key: `report-type`). Values: Tiket, Percakapan. (Broadcast added by Phase 3.) | Selecting domain triggers column picker reload and filter panel update. | US-001 |
| Column Picker Panel | New component below domain selector. Shows searchable, categorized, checkbox-based column list. | User browses or searches columns, checks desired columns, sees count indicator. | US-002, US-003 |
| Column Category Group | Collapsible section with category name (e.g. "Waktu & SLA"), per-category "Pilih Semua" link, and column rows. | Click category header to expand/collapse. Click "Pilih Semua" to check all in category. | US-003 |
| Column Row | Checkbox + display name + data type badge + PII badge (if applicable). PII badge shows "Akan Disamarkan" for users without full privacy permission. | Click checkbox to toggle. PII badge is informational. | US-002, US-004 |
| Search Input | Debounced search field at top of column picker. Filters columns by display name substring. | Type to filter. Clear button resets filter. | US-002 |
| Global Actions | "Pilih Semua" and "Hapus Semua" buttons above column list. | Select all or clear all columns across all categories. | US-003 |
| Selection Counter | "N kolom dipilih" indicator near column picker header. | Updates in real-time as user toggles checkboxes. | US-002 |
| PII Confirmation Dialog | Modal dialog triggered on submit when PII columns are selected. Lists PII column names. "Lanjutkan" / "Batal" buttons. Dialog text: "Kolom PII akan disamarkan sesuai permission Anda". | User reviews PII columns and decides. "Batal" returns to picker with selection intact. | US-004 |
| Tags Filter | Multi-select dropdown with search. Populated from analytics collection tag values. | User selects one or more tags. Empty = all tags. | US-005 |
| Inbox/Team Filter | Multi-select dropdown with search. Populated from analytics collection inbox/team values. | User selects one or more inboxes/teams. Empty = all. | US-005 |
| Job List — Tipe Laporan Column | Existing table column (`TableOfflineReportColumn.tsx:145`) showing domain per job, mapped to `t('report-type')`. | Displayed for all jobs (legacy shows channel, new shows explicit domain). | US-006 |
| Job List — Parameter Permintaan | NEW expandable section replacing current truncated JSON cell. Shows selected column display names (max 10 + "dan N lainnya"). | Click to expand and see full column list. | US-006 |
| Deactivated Column Badge | Red "Tidak Tersedia" badge shown on deactivated columns in saved presets. | User can remove deactivated columns from preset. | US-012 |
| Loading State | Column picker shows skeleton/shimmer while registry loads. | Brief loading on domain selection change. | — |
| Empty State | "Tidak ada kolom tersedia" if registry returns empty. | Shown when registry is empty or query fails. | — |
| Default Preset Pre-selection | On first visit or when no remembered selection exists, "Default" preset (all non-PII columns) is pre-selected. | User sees pre-checked columns and can modify before submitting. | US-009 |

## **10. Field & Validation**

### **10.1 Job Creation Payload (Existing Contract — Extended Parameters)**

The existing `CreateReportJob` gRPC contract is retained. New fields are added to the `parameters` Struct, not as top-level fields.

| Field | Location | Type | Example | Validation | Required | Default |
| --- | | --- | --- | --- | --- | --- |
| `channel` | Top-level (existing) | ExportReportChannelType | `ticket` | Must be one of: `conversation`, `ticket`, `broadcast` | Yes | — |
| `parameters.columns` | parameters struct | string[] | `["contactName", "status", "createdAt"]` | Min 1 item. All values must exist and be active in `exportcolumnregistry` for the domain. Array order is significant (maps to XLSX column order). | Yes (for configurable path) | — |
| `parameters.dateRange.start` | parameters struct | Date | `2026-03-01T00:00:00+07:00` | Valid datetime. Must be before end. | Yes | — |
| `parameters.dateRange.end` | parameters struct | Date | `2026-03-31T23:59:59+07:00` | Valid datetime. Range ≤ 31 days inclusive. | Yes | — |
| `parameters.status` | parameters struct | string[] | `["OPEN", "ONGOING"]` | Must be valid status codes for domain. | No | All statuses |
| `parameters.channel` | parameters struct (domain filter) | string[] | `["whatsapp", "instagram"]` | Valid platform values. | No | All channels |
| `parameters.assignedTo` | parameters struct | string[] | `["USR-001", "USR-002"]` | Must be within requester permission scope. | No | All employees |
| `parameters.tags` | parameters struct | string[] | `["shipping", "refund"]` | Valid tag values from analytics data. | No | All tags |
| `parameters.inboxIds` | parameters struct | string[] | `["TIN-123", "TIN-456"]` | Must be within requester permission scope. | No | All inboxes |
| `parameters.teamIds` | parameters struct | string[] | `["TEAM-01"]` | Must be within requester permission scope. | No | All teams |
| `parameters.piiAcknowledged` | parameters struct | boolean | `true` | Required `true` when any column in `columns[]` has `isPII: true`. | Conditional | `false` |
| `parameters.piiAcknowledgedBy` | parameters struct (auto-set) | string | `USR-001` | Set automatically on PII confirmation. | Auto | — |
| `parameters.piiAcknowledgedAt` | parameters struct (auto-set) | ISO string | `2026-08-19T10:00:00+07:00` | Set automatically on PII confirmation. | Auto | — |

### **10.2 Column Registry Document Shape**

> Full schema in Appendix A.

| Field | Type | Example | Validation | Required | Default |
| --- | | --- | --- | --- | --- |
| `domainId` | string enum | `ticket` | `conversation`, `ticket`, `broadcast` | Yes | — |
| `fieldPath` | string | `firstReplyTimeMs` | Dot-notation for nested fields. Unique per domain. | Yes | — |
| `displayName` | string | `Waktu Balasan Pertama` | Bahasa Indonesia. Max 100 chars. | Yes | — |
| `dataType` | string enum | `duration` | `string`, `number`, `boolean`, `date`, `datetime`, `duration`, `array`, `object`, `enum` | Yes | — |
| `category` | string | `Waktu & SLA` | Must match predefined category list. | Yes | — |
| `description` | string | `Waktu balasan pertama dari agent dalam milidetik` | Max 500 chars. | No | null |
| `sortWeight` | number | `30` | Integer. Lower = higher in picker order. | Yes | 100 |
| `isActive` | boolean | `true` | If false, column not shown in picker and rejected in job creation. | Yes | `true` |
| `isComputed` | boolean | `false` | If true, field is derived at sync time, not directly from event payload. | Yes | `false` |
| `isPII` | boolean | `false` | If true, picker shows PII warning and submit requires confirmation. | Yes | `false` |
| `deprecatedAt` | Date | `null` | Set when column is deprecated. `isActive:false` hides from picker. Existing presets/job snapshots retain reference. | No | null |
| `createdAt` | Date | `2026-08-12T00:00:00Z` | Auto-generated | Auto | now() |
| `updatedAt` | Date | `2026-08-12T00:00:00Z` | Auto-generated | Auto | now() |

## **11. Non-Functional Requirements**

| Category | Requirement |
| --- | | --- |
| **Performance** | NFR-001: Column registry query MUST return in < 200ms at p95 (cached after first load, in-memory cache with 5-minute TTL). Note: deactivated columns within the TTL window may cause EH-003 on submit — acceptable trade-off. NFR-002: Column picker UI MUST render within 500ms of domain selection (registry pre-loaded). NFR-003: Dynamic query builder aggregation pipeline MUST complete within the existing job processing timeout (reuse existing). NFR-004: Configurable export jobs MUST enforce a maximum of 20,000 rows per job (matching TICKET_EXPORT_LIMIT, CONVERSATION_EXPORT_LIMIT, BROADCAST_EXPORT_LIMIT all at 20,000). Export MUST display clear user-facing error when row count exceeds cap. |
| **Reliability** | NFR-005: Export job MUST be idempotent per job ID (reuse existing). NFR-006: Column validation MUST be performed at job creation time AND at job processing time (double-check against stale registry). |
| **Security** | NFR-007: All export queries MUST be scoped by `companyId` + `organizationId` (matching PRD-A). NFR-008: PII column selection MUST be recorded on the job document (`parameters.piiAcknowledgedBy`, `parameters.piiAcknowledgedAt`) for the 7-day job lifecycle. NFR-009: Download link MUST follow existing 15-minute presigned URL mechanism. |
| **Privacy** | NFR-010: PII fields MUST show "Akan Disamarkan" badge for users without full privacy permissions. NFR-011: PII masking MUST be applied at export time per existing `privacy:view_full_email` / `privacy:view_full_phone` permissions. PII acknowledgment stored on job document (see NFR-008). |
| **Observability** | NFR-012: Job metrics MUST include: `column_count`, `row_count`, `generation_duration_ms`, `file_size_bytes`, `domain`, `status`. Monitoring is log-based (no APM dependency — no prom-client/OTel in backend). NFR-013: Column registry query MUST be logged with cache hit/miss ratio. |
| **Accessibility** | NFR-014: Column picker MUST support keyboard navigation (Tab, Space/Enter for checkbox toggle, arrow keys for category navigation). |
| **Localization** | NFR-015: All column display names, category names, UI labels, and error messages MUST be in Bahasa Indonesia. |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| --- | | --- | --- |
| PRD-A: Row-level analytics collections must exist and be populated before configurable export jobs can read from them. | Engineering (PRD-A) | **Blocking for production use.** If collections are empty, export returns no data. | Feature-flag: configurable export only enabled after PRD-A Phase 4 cutover. Legacy template path remains available. |
| PRD-A: Sync pipeline must have acceptable lag (< 5 min p95). | Engineering (PRD-A) | Export data freshness depends on sync lag. | Document expected lag in UI (informational). Existing offline-report already has similar lag characteristics. |
| Column registry population must be complete for all domains. | Engineering (Phase 2) | If registry is incomplete, picker will show fewer columns than available in collections. | Seed script must cover all fields per Appendix C (33 conversation + 43 ticket + 24 broadcast). CI field-name-aware drift check (FR-064). |
| XLSX writer: current is SheetJS in-memory (xlsx ^0.18.5), capped at 20,000 rows per job (ticket-export.worker.ts:72,77). Streaming write (ExcelJS WorkbookWriter or xlsx write-stream) is NEW capability, not existing. | Engineering | **Decision required**: (a) adopt streaming writer to lift 20K cap, or (b) retain 20K cap and surface it in UI as explicit NFR. Option (b) is the immediate path; option (a) is §14 Future. | Document the 20K cap as explicit NFR (NFR-004). Clear user-facing error at cap. |
| Large column count × large row count may produce oversized files. | Engineering | File generation may fail or produce files too large for download. | 20K row cap limits output. Warn at > 50 columns at submission time. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| --- | | --- | --- |
| Configurable export adoption rate | ≥ 80% of new export jobs use column picker (parameters.columns[] present) | 30 days post-launch | Job creation logs (check `parameters.columns[]` presence) |
| Median export file size per row | Monitored metric: file_size_bytes per row for configurable jobs vs trailing-30-day median of legacy jobs on same domain. Target: ≥ 30% reduction. | 30 days post-launch | Job metrics (`file_size_bytes`, `row_count`) |
| PII column selection rate with acknowledgment | 100% of PII-containing jobs have `piiAcknowledged: true` | Ongoing | Job document (`parameters.piiAcknowledgedBy`) |
| Job completion rate (configurable path) | ≥ 98% (matching existing offline-report KPI) | 30 days post-launch | Job status metrics |
| Column registry coverage | 100% of PRD-A collection fields have registry entries | At launch | Compare registry count vs collection schema count (field-name-aware, not count-only) |
| P95 registry query latency | < 200ms | Ongoing | Application logs |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| --- | | --- |
| User-saved presets (P2) | Power users want to save and reuse column selections. US-011 covers this but marked P2. |
| Streaming XLSX writer (ExcelJS WorkbookWriter or xlsx write-stream) | To lift the 20,000-row cap per job. Requires dependency adoption decision. |
| Multi-domain single job (multi-sheet XLSX) | Allow one export job to produce multiple sheets (one per domain) in a single XLSX file. |
| Column reordering in picker UI | Current approach: columns[] array order = XLSX column order. Future: drag-and-drop reorder UI for convenience. |
| CSV/PDF format support | Beyond XLSX. Lower priority per brief. |
| Column-level data profiling | Show preview stats (row count, null %, distinct values) per column in the picker to help users make informed selections. |
| Preset sharing across users | Allow admins to create shared presets for the workspace. |
| User-defined custom or computed columns | Not in this phase. Columns are system-managed via registry seed script. |
| 90-day audit retention for PII acknowledgments | Requires audit-service schema extension (future enhancement). Current: 7-day job document retention. |

## **15. Limitations**

| Limitation | Impact |
| --- | | --- |
| Configurable export depends on PRD-A analytics collections being populated. | Cannot use configurable export until PRD-A Phase 4 cutover. Legacy template path works in parallel. |
| Column registry is populated via seed script, not auto-discovered from collection schema. | If PRD-A collection schema changes, registry must be updated via seed script. CI drift check (FR-064) alarms on mismatch. |
| PII masking uses existing privacy permissions. PII acknowledgment dialog is additive governance UX. | Any Admin/Supervisor can select PII columns; values are masked per their privacy permissions. No additional RBAC field-level gating. |
| Tags and Inbox/Team filter values are loaded from analytics collection data, not from a separate tag/team service. | If tags or teams are not yet synced to analytics, filter options may be incomplete. |
| Broadcast domain in column picker has only existing broadcast filters (channels, createdBy, statuses, teamIds, dates) until Phase 3 ships broadcast-specific UX. | Functional but no broadcast-specific picker enhancements. |
| Object-type fields (customAttributes, customFields, metadata) exported as JSON strings, not flattened columns. | Less human-readable than individual columns. CA:/META: prefix flattening from legacy template is not replicated for configurable export. Users migrating from legacy conversation export lose per-key CA:/META: columns. Legacy path remains available for that use case. |
| isPII flag covers structured identifier fields only. Free-text columns that routinely carry PII (lastMessageText, lastReplyMessage, description, remarks, messageContent, requestPayloadJson, attributesJson, customAttributes, customFields, metadata) are NOT flagged as isPII. | Users should be aware that free-text fields may contain PII even without a PII badge. |
| User column selection memory is client-side (localStorage). | Selections are per-browser, per-device. Not synced across sessions or devices. |
| XLSX generation uses in-memory SheetJS with 20,000-row cap per job. | Large datasets exceeding 20K rows are not supported. Streaming writer is a §14 Future enhancement. |
| Row-level Team Inbox scoping within export data is not implemented. | List-level scoping (own vs all jobs) works. Per-row team filtering within a single export is a known gap (see US-008 AC3). |

## **16. Appendix**

### **A. Column Registry Schema — `exportcolumnregistry` Collection**

Full MongoDB document shape:

```json
{
  "_id": "ObjectId",
  "domainId": "ticket | conversation | broadcast",
  "fieldPath": "firstReplyTimeMs",
  "displayName": "Waktu Balasan Pertama",
  "dataType": "duration",
  "category": "Waktu & SLA",
  "description": "Waktu balasan pertama dari agent dalam milidetik",
  "sortWeight": 30,
  "isActive": true,
  "isComputed": false,
  "isPII": false,
  "deprecatedAt": null,
  "createdAt": "2026-08-12T00:00:00Z",
  "updatedAt": "2026-08-12T00:00:00Z"
}
```

**Indexes:**

| Index | Fields | Type | Purpose |
| --- | | --- | --- |
| Primary query | `{ domainId: 1, isActive: 1, category: 1, sortWeight: 1 }` | Compound | Fetch active columns per domain, grouped by category |
| Unique | `{ domainId: 1, fieldPath: 1 }` | Unique | One registry entry per field per domain |
| Search | `{ displayName: "text", description: "text" }` | Text | Server-side text search (fallback if client-side filtering insufficient) |

**Predefined Categories (Bahasa Indonesia):**

| Category | Sort Weight | Description |
| --- | | --- |
| Informasi Dasar | 10 | Entity ID, name, number, title |
| Kontak & Identitas | 20 | Contact/recipient name, phone, email, sender info |
| Status & Lifecycle | 30 | Status, stage, closedAt, closedBy |
| Waktu & SLA | 40 | createdAt, updatedAt, closedAt, firstReplyTime, handlingTime, stage durations, SLA status |
| Kanal & Platform | 50 | channel, platformId, broadcastChannel, source |
| Tag & Kategori | 60 | tags, topic, subTopic, tribe, typeComplaint, ticketTypeName |
| Assignment & Team | 70 | assignedTo, assignee, participants, inboxId, inboxName, teamId |
| Custom Fields | 80 | customAttributes, customFields, metadata |
| Message & Content | 90 | lastMessage*, description, messageContent, remarks |
| Metadata & System | 100 | sourceUpdatedAt, syncedAt, rawEvent |

### **B. Default Column Presets Per Domain**

#### **B.1 Default Conversation Preset (all non-PII fields)**

| # | fieldPath | displayName | category |
| --- | | --- | --- |
| 1 | conversationId | ID Percakapan | Informasi Dasar |
| 2 | status | Status | Status & Lifecycle |
| 3 | channel | Kanal | Kanal & Platform |
| 4 | platformId | ID Platform | Kanal & Platform |
| 5 | assignedTo | Ditugaskan Ke | Assignment & Team |
| 6 | participants | Peserta | Assignment & Team |
| 7 | createdAt | Tanggal Dibuat | Waktu & SLA |
| 8 | updatedAt | Tanggal Diperbarui | Waktu & SLA |
| 9 | closedAt | Tanggal Ditutup | Waktu & SLA |
| 10 | closedBy | Ditutup Oleh | Status & Lifecycle |
| 11 | tags | Tag | Tag & Kategori |
| 12 | topic | Topik | Tag & Kategori |
| 13 | subTopic | Sub Topik | Tag & Kategori |
| 14 | inboxId | ID Inbox | Assignment & Team |
| 15 | inboxName | Nama Inbox | Assignment & Team |
| 16 | teamId | ID Tim | Assignment & Team |
| 17 | firstReplyTimeMs | Waktu Balasan Pertama | Waktu & SLA |
| 18 | firstResponseTimeMs | Waktu Respons Pertama | Waktu & SLA |
| 19 | timeToCloseMs | Waktu Penyelesaian | Waktu & SLA |
| 20 | avgResponseTimeMs | Rata-rata Waktu Respons | Waktu & SLA |
| 21 | slaFrtStatus | Status SLA FRT | Waktu & SLA |
| 22 | slaArtStatus | Status SLA ART | Waktu & SLA |
| 23 | slaTtcStatus | Status SLA TTC | Waktu & SLA |
| 24 | lastMessageBy | Pesan Terakhir Oleh | Message & Content |
| 25 | lastMessageAt | Pesan Terakhir Pada | Message & Content |
| 26 | lastMessageText | Teks Pesan Terakhir | Message & Content |
| 27 | customAttributes | Atribut Kustom | Custom Fields |
| 28 | metadata | Metadata | Custom Fields |
| 29 | folder | Folder | Status & Lifecycle |

**PII fields (excluded from Default, available opt-in):**

| # | fieldPath | displayName | category | isPII |
| --- | | --- | --- | --- |
| P1 | contactName | Nama Kontak | Kontak & Identitas | true |
| P2 | contactPhone | Telepon Kontak | Kontak & Identitas | true |
| P3 | contactEmail | Email Kontak | Kontak & Identitas | true |

#### **B.2 Default Ticket Preset (all non-PII fields)**

| # | fieldPath | displayName | category |
| --- | | --- | --- |
| 1 | ticketId | ID Tiket | Informasi Dasar |
| 2 | ticketNumber | Nomor Tiket | Informasi Dasar |
| 3 | title | Judul | Informasi Dasar |
| 4 | awb | AWB | Informasi Dasar |
| 5 | status | Status | Status & Lifecycle |
| 6 | currentStage | Tahap Saat Ini | Status & Lifecycle |
| 7 | stageDurationUnattendedMs | Durasi Tahap Unattended | Waktu & SLA |
| 8 | stageDurationOpenMs | Durasi Tahap Open | Waktu & SLA |
| 9 | stageDurationOnProgressMs | Durasi Tahap On Progress | Waktu & SLA |
| 10 | stageDurationDoneMs | Durasi Tahap Done | Waktu & SLA |
| 11 | assignee | Ditugaskan Ke | Assignment & Team |
| 12 | createdBy | Dibuat Oleh | Status & Lifecycle |
| 13 | createdAt | Tanggal Dibuat | Waktu & SLA |
| 14 | updatedAt | Tanggal Diperbarui | Waktu & SLA |
| 15 | closedAt | Tanggal Ditutup | Waktu & SLA |
| 16 | closedBy | Ditutup Oleh | Status & Lifecycle |
| 17 | channel | Kanal | Kanal & Platform |
| 18 | platformId | ID Platform | Kanal & Platform |
| 19 | tribe | Tribe | Tag & Kategori |
| 20 | typeComplaint | Tipe Komplain | Tag & Kategori |
| 21 | ticketTypeName | Nama Tipe Tiket | Tag & Kategori |
| 22 | csat | CSAT | Message & Content |
| 23 | handlingTimeMs | Waktu Penanganan | Waktu & SLA |
| 24 | diffTimeFirstAssignAndFirstResponseMs | Waktu Assign ke Respons Pertama | Waktu & SLA |
| 25 | firstReplyTimeMs | Waktu Balasan Pertama | Waktu & SLA |
| 26 | firstResponseTimeMs | Waktu Respons Pertama | Waktu & SLA |
| 27 | timeToCloseMs | Waktu Penyelesaian | Waktu & SLA |
| 28 | reopenedCount | Jumlah Dibuka Ulang | Status & Lifecycle |
| 29 | replyCount | Jumlah Balasan | Message & Content |
| 30 | lastReplyBy | Balasan Terakhir Oleh | Message & Content |
| 31 | lastReplyAt | Balasan Terakhir Pada | Message & Content |
| 32 | lastReplyMessage | Pesan Balasan Terakhir | Message & Content |
| 33 | priority | Prioritas | Status & Lifecycle |
| 34 | level | Level | Status & Lifecycle |
| 35 | tags | Tag | Tag & Kategori |
| 36 | inboxId | ID Inbox | Assignment & Team |
| 37 | inboxName | Nama Inbox | Assignment & Team |
| 38 | teamId | ID Tim | Assignment & Team |
| 39 | description | Deskripsi | Message & Content |
| 40 | slaFrtStatus | Status SLA FRT | Waktu & SLA |
| 41 | slaResolveStatus | Status SLA Resolve | Waktu & SLA |
| 42 | customFields | Custom Fields | Custom Fields |
| 43 | remarks | Catatan | Message & Content |

**PII fields (excluded from Default, available opt-in):**

> Ticket domain DOES have PII fields in the shipped export: Customer Email and Customer Phone (masked per maskPii in ticket-export.worker.ts:177-182). The following columns require registry entries and are PII-flagged. See §19 Legacy Column Mapping for full disposition.

| # | fieldPath | displayName | category | isPII | Notes |
| --- | | --- | --- | --- | --- |
| P1 | customerEmail | Email Pelanggan | Kontak & Identitas | true | Requires registry entry + PRD-A §10.2 schema addition |
| P2 | customerPhone | Telepon Pelanggan | Kontak & Identitas | true | Requires registry entry + PRD-A §10.2 schema addition |
| P3 | clientContact | Kontak Klien | Kontak & Identitas | true | Requires registry entry + PRD-A §10.2 schema addition |

#### **B.3 Default Broadcast Preset (all non-PII fields)**

| # | fieldPath | displayName | category |
| --- | | --- | --- |
| 1 | broadcastId | ID Broadcast | Informasi Dasar |
| 2 | broadcastName | Nama Broadcast | Informasi Dasar |
| 3 | broadcastChannel | Channel Broadcast | Kanal & Platform |
| 4 | source | Sumber | Kanal & Platform |
| 5 | status | Status | Status & Lifecycle |
| 6 | reason | Alasan | Status & Lifecycle |
| 7 | failureSource | Sumber Kegagalan | Status & Lifecycle |
| 8 | createdAt | Tanggal Dibuat | Waktu & SLA |
| 9 | scheduledAt | Tanggal Terjadwal | Waktu & SLA |
| 10 | creatorUserId | ID Pembuat | Assignment & Team |
| 11 | creatorName | Nama Pembuat | Assignment & Team |
| 12 | teamInboxIdAtSendTime | ID Inbox Tim | Assignment & Team |
| 13 | teamInboxNameAtSendTime | Nama Inbox Tim | Assignment & Team |
| 14 | senderAccountName | Nama Akun Pengirim | Kontak & Identitas |
| 15 | templateUsed | Template Digunakan | Informasi Dasar |
| 16 | messageContent | Konten Pesan | Message & Content |
| 17 | requestId | ID Request | Informasi Dasar |
| 18 | idempotencyKey | Kunci Idempotensi | Metadata & System |
| 19 | attemptNumber | Nomor Percobaan | Metadata & System |
| 20 | requestPayloadJson | Payload Request (JSON) | Custom Fields |
| 21 | attributesJson | Atribut (JSON) | Custom Fields |

**PII fields (excluded from Default, available opt-in):**

| # | fieldPath | displayName | category |
| --- | | --- | --- |
| P1 | recipientNumber | Nomor Penerima | Kontak & Identitas |
| P2 | recipientName | Nama Penerima | Kontak & Identitas |
| P3 | senderNumber | Nomor Pengirim | Kontak & Identitas |

### **C. Cross-Reference: Registry Fields → PRD-A Collection Fields**

#### **C.1 Conversation Domain** (33 entries)

| PRD-A §10.1 Field | Registry fieldPath | Registry dataType | Registry category | isPII | isComputed |
| --- | | --- | --- | --- | --- |
| `conversationId` | `conversationId` | string | Informasi Dasar | false | false |
| `contactId` | `contactId` | string | Kontak & Identitas | false | false |
| `contactName` | `contactName` | string | Kontak & Identitas | **true** | false |
| `contactPhone` | `contactPhone` | string | Kontak & Identitas | **true** | false |
| `contactEmail` | `contactEmail` | string | Kontak & Identitas | **true** | false |
| `status` | `status` | enum | Status & Lifecycle | false | false |
| `channel` | `channel` | string | Kanal & Platform | false | false |
| `platformId` | `platformId` | string | Kanal & Platform | false | false |
| `assignedTo` | `assignedTo` | array | Assignment & Team | false | false |
| `participants` | `participants` | array | Assignment & Team | false | false |
| `createdAt` | `createdAt` | datetime | Waktu & SLA | false | false |
| `updatedAt` | `updatedAt` | datetime | Waktu & SLA | false | false |
| `closedAt` | `closedAt` | datetime | Waktu & SLA | false | false |
| `closedBy` | `closedBy` | string | Status & Lifecycle | false | false |
| `tags` | `tags` | array | Tag & Kategori | false | false |
| `topic` | `topic` | string | Tag & Kategori | false | false |
| `subTopic` | `subTopic` | string | Tag & Kategori | false | false |
| `inboxId` | `inboxId` | string | Assignment & Team | false | false |
| `inboxName` | `inboxName` | string | Assignment & Team | false | false |
| `teamId` | `teamId` | string | Assignment & Team | false | false |
| `firstReplyTimeMs` | `firstReplyTimeMs` | duration | Waktu & SLA | false | false |
| `firstResponseTimeMs` | `firstResponseTimeMs` | duration | Waktu & SLA | false | false |
| `timeToCloseMs` | `timeToCloseMs` | duration | Waktu & SLA | false | false |
| `avgResponseTimeMs` | `avgResponseTimeMs` | duration | Waktu & SLA | false | **true** |
| `slaFrtStatus` | `slaFrtStatus` | enum | Waktu & SLA | false | false |
| `slaArtStatus` | `slaArtStatus` | enum | Waktu & SLA | false | false |
| `slaTtcStatus` | `slaTtcStatus` | enum | Waktu & SLA | false | false |
| `lastMessageBy` | `lastMessageBy` | enum | Message & Content | false | false |
| `lastMessageAt` | `lastMessageAt` | datetime | Message & Content | false | false |
| `lastMessageText` | `lastMessageText` | string | Message & Content | false | false |
| `customAttributes` | `customAttributes` | object | Custom Fields | false | false |
| `metadata` | `metadata` | object | Custom Fields | false | false |
| `folder` | `folder` | enum | Status & Lifecycle | false | false |

> Excluded from registry: `_id`, `companyId`, `organizationId`, `sourceUpdatedAt`, `rawEvent`, `syncedAt` (internal fields, not user-selectable).

#### **C.2 Ticket Domain** (43 entries)

| PRD-A §10.2 Field | Registry fieldPath | Registry dataType | Registry category | isPII | isComputed |
| --- | | --- | --- | --- | --- |
| `ticketId` | `ticketId` | string | Informasi Dasar | false | false |
| `ticketNumber` | `ticketNumber` | string | Informasi Dasar | false | false |
| `title` | `title` | string | Informasi Dasar | false | false |
| `awb` | `awb` | string | Informasi Dasar | false | false |
| `status` | `status` | enum | Status & Lifecycle | false | false |
| `currentStage` | `currentStage` | string | Status & Lifecycle | false | false |
| `stageDurationUnattendedMs` | `stageDurationUnattendedMs` | duration | Waktu & SLA | false | **true** |
| `stageDurationOpenMs` | `stageDurationOpenMs` | duration | Waktu & SLA | false | **true** |
| `stageDurationOnProgressMs` | `stageDurationOnProgressMs` | duration | Waktu & SLA | false | **true** |
| `stageDurationDoneMs` | `stageDurationDoneMs` | duration | Waktu & SLA | false | **true** |
| `assignee` | `assignee` | array | Assignment & Team | false | false |
| `createdBy` | `createdBy` | string | Status & Lifecycle | false | false |
| `createdAt` | `createdAt` | datetime | Waktu & SLA | false | false |
| `updatedAt` | `updatedAt` | datetime | Waktu & SLA | false | false |
| `closedAt` | `closedAt` | datetime | Waktu & SLA | false | false |
| `closedBy` | `closedBy` | string | Status & Lifecycle | false | false |
| `channel` | `channel` | string | Kanal & Platform | false | false |
| `platformId` | `platformId` | string | Kanal & Platform | false | false |
| `tribe` | `tribe` | string | Tag & Kategori | false | false |
| `typeComplaint` | `typeComplaint` | string | Tag & Kategori | false | false |
| `ticketTypeName` | `ticketTypeName` | string | Tag & Kategori | false | false |
| `csat` | `csat` | number | Message & Content | false | false |
| `handlingTimeMs` | `handlingTimeMs` | duration | Waktu & SLA | false | **true** |
| `diffTimeFirstAssignAndFirstResponseMs` | `diffTimeFirstAssignAndFirstResponseMs` | duration | Waktu & SLA | false | **true** |
| `firstReplyTimeMs` | `firstReplyTimeMs` | duration | Waktu & SLA | false | false |
| `firstResponseTimeMs` | `firstResponseTimeMs` | duration | Waktu & SLA | false | false |
| `timeToCloseMs` | `timeToCloseMs` | duration | Waktu & SLA | false | false |
| `reopenedCount` | `reopenedCount` | number | Status & Lifecycle | false | false |
| `replyCount` | `replyCount` | number | Message & Content | false | false |
| `lastReplyBy` | `lastReplyBy` | enum | Message & Content | false | false |
| `lastReplyAt` | `lastReplyAt` | datetime | Message & Content | false | false |
| `lastReplyMessage` | `lastReplyMessage` | string | Message & Content | false | false |
| `priority` | `priority` | string | Status & Lifecycle | false | false |
| `level` | `level` | string | Status & Lifecycle | false | false |
| `tags` | `tags` | array | Tag & Kategori | false | false |
| `inboxId` | `inboxId` | string | Assignment & Team | false | false |
| `inboxName` | `inboxName` | string | Assignment & Team | false | false |
| `teamId` | `teamId` | string | Assignment & Team | false | false |
| `description` | `description` | string | Message & Content | false | false |
| `slaFrtStatus` | `slaFrtStatus` | enum | Waktu & SLA | false | false |
| `slaResolveStatus` | `slaResolveStatus` | enum | Waktu & SLA | false | false |
| `customFields` | `customFields` | object | Custom Fields | false | false |
| `remarks` | `remarks` | array | Message & Content | false | false |

> Excluded from registry: `_id`, `companyId`, `organizationId`, `sourceUpdatedAt`, `rawEvent`, `syncedAt`.

#### **C.3 Broadcast Domain** (24 entries)

| PRD-A §10.3 Field | Registry fieldPath | Registry dataType | Registry category | isPII | isComputed |
| --- | | --- | --- | --- | --- |
| `broadcastId` | `broadcastId` | string | Informasi Dasar | false | false |
| `broadcastName` | `broadcastName` | string | Informasi Dasar | false | false |
| `broadcastChannel` | `broadcastChannel` | string | Kanal & Platform | false | false |
| `source` | `source` | string | Kanal & Platform | false | false |
| `recipientNumber` | `recipientNumber` | string | Kontak & Identitas | **true** | false |
| `recipientName` | `recipientName` | string | Kontak & Identitas | **true** | false |
| `status` | `status` | enum | Status & Lifecycle | false | false |
| `reason` | `reason` | string | Status & Lifecycle | false | false |
| `failureSource` | `failureSource` | string | Status & Lifecycle | false | false |
| `createdAt` | `createdAt` | datetime | Waktu & SLA | false | false |
| `scheduledAt` | `scheduledAt` | datetime | Waktu & SLA | false | false |
| `creatorUserId` | `creatorUserId` | string | Assignment & Team | false | false |
| `creatorName` | `creatorName` | string | Assignment & Team | false | false |
| `teamInboxIdAtSendTime` | `teamInboxIdAtSendTime` | string | Assignment & Team | false | false |
| `teamInboxNameAtSendTime` | `teamInboxNameAtSendTime` | string | Assignment & Team | false | false |
| `senderAccountName` | `senderAccountName` | string | Kontak & Identitas | false | false |
| `senderNumber` | `senderNumber` | string | Kontak & Identitas | **true** | false |
| `templateUsed` | `templateUsed` | string | Informasi Dasar | false | false |
| `messageContent` | `messageContent` | string | Message & Content | false | false |
| `requestId` | `requestId` | string | Informasi Dasar | false | false |
| `idempotencyKey` | `idempotencyKey` | string | Metadata & System | false | false |
| `attemptNumber` | `attemptNumber` | number | Metadata & System | false | false |
| `requestPayloadJson` | `requestPayloadJson` | string | Custom Fields | false | false |
| `attributesJson` | `attributesJson` | string | Custom Fields | false | false |

> Excluded from registry: `_id`, `companyId`, `organizationId`, `sourceUpdatedAt`, `rawEvent`, `syncedAt`.

### **D. UI Copy (Bahasa Indonesia)**

| Context | Copy |
| --- | | --- |
| Page title | "Laporan Offline" |
| Domain selector label | "Tipe Laporan" |
| Column picker section title | "Pilih Kolom" |
| Search placeholder | "Cari kolom..." |
| Category select all | "Pilih Semua" |
| Category deselect all | "Hapus Semua" |
| Global select all | "Pilih Semua Kolom" |
| Global deselect all | "Hapus Semua Kolom" |
| Selection counter | "{N} kolom dipilih" |
| PII badge (with permission) | "PII" |
| PII badge (masked) | "Akan Disamarkan" |
| PII warning title | "Peringatan Data Pribadi" |
| PII warning body | "Kolom yang dipilih mengandung data pribadi (PII). Kolom PII akan disamarkan sesuai permission Anda." |
| PII confirm button | "Lanjutkan" |
| PII cancel button | "Batal" |
| Min column required | "Pilih minimal 1 kolom" |
| Column count warning | "Anda memilih lebih dari 50 kolom. Proses export mungkin lebih lama." |
| Row cap exceeded | "Data terlalu besar. Kurangi jumlah kolom atau perkecil rentang tanggal. Batas maksimum 20.000 baris per job." |
| Tags filter label | "Tag" |
| Inbox/Team filter label | "Inbox / Tim" |
| Job list domain column | "Tipe Laporan" |
| Job list column snapshot header | "Kolom yang Dipilih" |
| Job list column overflow | "dan {N} kolom lainnya" |
| Invalid column | "Kolom tidak valid: {fieldPath}" |
| Unavailable column | "Kolom tidak tersedia: {displayName}" |
| Column skipped | "Kolom {displayName} tidak tersedia dan dilewati." |
| Deactivated column in preset | "Tidak Tersedia" |
| Registry unavailable | "Registri kolom tidak tersedia. Coba lagi nanti." |
| Invalid domain | "Jenis laporan tidak valid" |
| PII acknowledgment required | "Konfirmasi kolom PII diperlukan" |
| Processing failed (row cap) | "Gagal membuat laporan. Kurangi jumlah kolom atau perkecil rentang tanggal. Batas maksimum 20.000 baris per job." |
| Processing failed (timeout) | "Gagal membuat laporan. Coba lagi nanti" |
| Empty result | "Laporan selesai tanpa data" |
| Duplicate job | "Too many active export jobs" |
| Default preset name | "Default" |
| No columns available | "Tidak ada kolom tersedia" |

### **E. Assumptions**

| ID | Assumption | Impact If Wrong | Validation Needed |
| --- | | --- | --- |
| ASM-001 | PRD-A analytics collections are populated and have acceptable sync lag (< 5 min p95) before configurable export is enabled. | If collections are empty or stale, export produces no data or outdated data. | Feature-flag gating: only enable configurable export after PRD-A Phase 4 cutover. |
| ASM-002 | Column registry entries are seeded via migration script and updated when PRD-A schema changes. | If registry is stale, picker shows incorrect columns or missing new fields. | Seed script version-tracked. CI field-name-aware drift check (FR-064). |
| ASM-003 | XLSX generation uses SheetJS (xlsx ^0.18.5) in-memory with 20,000-row cap per job (ticket-export.worker.ts:72,77). Streaming write (ExcelJS WorkbookWriter or xlsx write-stream) is NEW capability, not existing. | If streaming is not adopted, 20K row cap remains hard limit. | Engineering decision: adopt streaming (§14 Future) or enforce 20K cap (NFR-004). |
| ASM-004 | PII governance: field-level masking is retained per existing `privacy:view_full_email` / `privacy:view_full_phone` permissions. The PII acknowledgment dialog is additive. | If policy requires additional RBAC gating, additional permission checks needed. | PM / Legal confirmation. |
| ASM-005 | localStorage is acceptable for persisting user's last column selection (client-side only). | If cross-device sync is needed, a server-side user preference API would be required. | UX review. |
| ASM-006 | Object-type fields (customAttributes, customFields, metadata) are exported as JSON strings in configurable export (not flattened to individual columns). | If users expect CA:/META: prefix flattening (like legacy template), FR-016 snapshot invariant is broken and two-phase header resolution is needed. | Document this as a known behavior difference from legacy template. Legacy path remains available. |

### **F. Open Questions (Resolved)**

| ID | Question | Resolution | Owner |
| --- | | --- | --- |
| OQ-15 | Column registry granularity: per-field or per-computed-metric? | **Resolved: per-field.** Each field in PRD-A collection = one registry entry. Computed fields have `isComputed: true`. | PM / Eng Lead |
| OQ-19 | PII column access control: RBAC field-level enforcement or warning-only with user acknowledgment? | **Resolved: masking + acknowledgment.** Configurable export HONOURS existing `privacy:view_full_email` and `privacy:view_full_phone` masking permissions (ticket-export.processor.ts:79-86, broadcast-export.processor.ts:72-80, privacy-masking.interceptor.ts:16-19). The PII acknowledgment dialog is ADDITIVE governance UX, not a replacement for masking. | PM / Legal |
| OQ-20 | Max column count per job: hard cap or soft warning? | **Resolved: no hard column cap, 20K row cap.** Warning at > 50 columns. Job enforced at 20,000 rows (NFR-004). | Engineering |
| OQ-21 | Multi-domain single job: one XLSX with multiple sheets vs separate jobs per domain? | **Resolved: separate jobs per domain.** Each job = one domain = one sheet. Multi-sheet deferred to §14 Future. | PM |
| OQ-22 | Column ordering in XLSX: user-selection order or registry sortWeight order? | **Resolved: user-selection order.** `columns[]` array order IS significant (FR-012, FR-018). Columns appear in XLSX in the order provided in the request. | PM / UX |
| OQ-23 | Should the legacy template path be deprecated on a specific timeline? | **Resolved: coexist indefinitely for now.** Both paths work in parallel. Deprecation timeline TBD after adoption metrics. 100% adoption KR is unreachable by design — 80% target set instead. | PM |

## **17. State Transition Model**

> Export job lifecycle is **unchanged** from existing offline-report PRD. This section documents the states for completeness and confirms no new states or sub-states are needed.

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| --- | | --- | --- | --- | --- | --- |
| Export Job | — | User submits valid job (configurable path) | QUEUED | statistic:read | `columns[]` validated against registry. Domain valid. Filters valid. Rate limit not exceeded. No active job for this domain (MAX_ACTIVE_JOBS_PER_CHANNEL = 1). PII acknowledged if needed. | Job created with column snapshot + registryVersion in parameters. Message enqueued to RabbitMQ. | `export_job_created` |
| Export Job | QUEUED | Worker picks up job | PROCESSING | System | Job exists and is QUEUED. | Worker begins aggregation pipeline + XLSX generation. | `export_job_processing` |
| Export Job | PROCESSING | XLSX generation completes | COMPLETED | System | File uploaded to S3. | File URL stored. Completion timestamp recorded. Completion message may include column-skip warnings (EH-011). | `export_job_completed` |
| Export Job | PROCESSING | XLSX generation fails | FAILED | System | Error occurred (row cap, timeout, etc.) | Failure reason stored. | `export_job_failed` |
| Export Job | COMPLETED | 7-day retention expires | EXPIRED | System (TTL) | Completion time + 7 days exceeded. | File deleted from S3. Download disabled. | `export_job_expired` |
| Export Job | FAILED | User triggers retry (RetryReportJob) | QUEUED | statistic:read | Job is FAILED. Retryable. retryCount not exceeded. | Job re-queued for processing. | `export_job_retried` |

**No new states introduced.** Configurable export jobs use the same `QUEUED → PROCESSING → COMPLETED/FAILED → EXPIRED` lifecycle as existing template-based jobs. Retry transition (FAILED → QUEUED) is an existing shipped capability via `RetryReportJob`.

## **18. Permission Model**

Permissions are enforced at the endpoint level, not by role name. Any role granted the relevant permission can access the feature.

| Permission | Scope | Capability | Maps to Roles (default-permission.constant.ts:131-137) |
| --- | | --- | --- |
| `statistic:read` | READ_OWN | View page, create own export jobs, download own jobs | All roles with this permission |
| `statistic:read` | READ_TEAM | View page, create export jobs, view team jobs | Supervisor, Manager |
| `statistic:read` | READ_ALL | View page, create export jobs, view all jobs, download all | Admin, Super Admin |
| `privacy:view_full_phone` | — | Export PII phone columns unmasked | Per permission grant |
| `privacy:view_full_email` | — | Export PII email columns unmasked | Per permission grant |

**List-level scoping** (export-report-job.repository.ts:68,100): Admin / Super Admin sees all jobs; other roles see own jobs only. Row-level Team Inbox scoping within export data is NOT implemented (see US-008 AC3 — known gap).

**PII Column Access:** Configurable export honours existing `privacy:view_full_email` / `privacy:view_full_phone` masking. The PII acknowledgment dialog is additive governance UX.

## **19. Legacy Column → Registry Mapping**

This table maps shipped export columns to the column registry. Unmapped columns require action before configurable export can achieve parity with legacy exports.

### **19.1 Ticket Domain**

Shipped headers (ticket-export.worker.ts:35-61): 24 columns.

| Legacy Column | In Registry C.2? | In PRD-A §10.2? | Disposition |
| --- | | --- | --- |
| Ticket ID | Yes (`ticketId`) | Yes | Mapped |
| Ticket Title | Yes (`title`) | Yes | Mapped |
| Client (Contact) | **No** | **No** | **Requires registry entry + PRD-A §10.2 schema addition. isPII: true.** |
| Channel | Yes (`channel`) | Yes | Mapped |
| Priority | Yes (`priority`) | Yes | Mapped |
| Agent | Yes (`assignee`) | Yes | Mapped |
| Status | Yes (`status`) | Yes | Mapped |
| Sentiment | **No** | **No** | **Requires registry entry + PRD-A §10.2 schema addition. isPII: false, isComputed: true.** |
| Inbox | Yes (`inboxName`) | Yes | Mapped |
| Tag | Yes (`tags`) | Yes | Mapped |
| Level | Yes (`level`) | Yes | Mapped |
| First Reply Time | Yes (`firstReplyTimeMs`) | Yes | Mapped |
| Customer First Wait | **No** | **No** | **Requires registry entry + PRD-A §10.2 schema addition. isPII: false, isComputed: true.** |
| Created Date | Yes (`createdAt`) | Yes | Mapped |
| Closed Date | Yes (`closedAt`) | Yes | Mapped |
| Updated Date | Yes (`updatedAt`) | Yes | Mapped |
| Customer Email | **No** | **No** | **Requires registry entry + PRD-A §10.2 schema addition. isPII: true.** |
| Customer Phone | **No** | **No** | **Requires registry entry + PRD-A §10.2 schema addition. isPII: true.** |
| Lifetime | **No** | **No** | **Requires registry entry + PRD-A §10.2 schema addition. isPII: false, isComputed: true.** |
| SLA | Yes (`slaFrtStatus`) | Yes | Mapped (note: shipped "SLA" maps to FRT SLA status) |
| Description | Yes (`description`) | Yes | Mapped |
| Last Reply By | Yes (`lastReplyBy`) | Yes | Mapped |
| Last Reply At | Yes (`lastReplyAt`) | Yes | Mapped |
| Last Reply Message | Yes (`lastReplyMessage`) | Yes | Mapped |

**Summary**: 6 legacy ticket columns have no registry entry and no PRD-A source field: Customer Email (PII), Customer Phone (PII), Client/Contact (PII), Sentiment (computed), Customer First Wait (computed), Lifetime (computed). These require PRD-A schema additions and registry seed updates before configurable export achieves parity.

### **19.2 Conversation Domain**

| Legacy Column | In Registry C.1? | Disposition |
| --- | | --- |
| Contact Identifier (legacy field name for contactId/contactName) | Partial — `contactId` and `contactName` are separate entries | Mapped (split into two fields) |
| All CA:/META: prefixed columns | **Not in registry** | Object fields exported as JSON string (FR-033). Legacy flattening stays on legacy path. |

### **19.3 Broadcast Domain**

All 24 broadcast columns mapped to registry entries. No unmapped legacy columns.

## **20. API / Contract**

### **20.1 New gRPC Endpoints**

| Contract | Method | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| --- | | --- | --- | --- | --- | --- | --- |
| `GetColumnRegistry` | gRPC Unary | analytics-service | FE (Next.js API route) | `{ domainId: string }` | `{ columns: ColumnRegistryEntry[] }` grouped by category | `INVALID_ARGUMENT` (bad domainId), `INTERNAL` (registry unavailable) | New endpoint. No backward compat concern. |
| `SearchColumnRegistry` | gRPC Unary | analytics-service | FE (Next.js API route) | `{ domainId: string, searchQuery: string }` | `{ columns: ColumnRegistryEntry[] }` | Same as above | New endpoint. Optional — client-side filtering may be sufficient. |

### **20.2 Modified gRPC Endpoints**

Actual gRPC method names (proto/analytics.proto:37-42, service `ExportReportJobService`):

| Contract | Method | Change | Request Change | Response Change | Error Codes | Compatibility Notes |
| --- | | --- | --- | --- | --- | --- |
| `CreateReportJob` | gRPC Unary | Extended parameters Struct to accept configurable column parameters | Added to `parameters`: `columns[]`, `tags[]`, `inboxIds[]`, `teamIds[]`, `piiAcknowledged`, `piiAcknowledgedBy`, `piiAcknowledgedAt` | Unchanged (returns job ID) | Added: `INVALID_COLUMNS`, `EMPTY_COLUMNS`, `PII_NOT_ACKNOWLEDGED` | Backward compatible: `columns[]` is optional. When absent, legacy fixed-header path is used. |
| `GetReportJobList` | gRPC Unary | Extended response to include domain and column snapshot | Unchanged | Added: `domainId`, `selectedColumnNames[]` in job row | Unchanged | Backward compatible: new fields added to response. |
| `RetryReportJob` | gRPC Unary | No change | Unchanged | Unchanged | Unchanged | Existing capability: FAILED → QUEUED transition. |

### **20.3 Actual CreateReportJob Request (proto/analytics.proto:76-80)**

```protobuf
// Existing message — no new top-level fields
message CreateReportJobRequest {
  string channel = 1;                    // ExportReportChannelType: ticket | conversation | broadcast
  google.protobuf.Struct parameters = 2; // Free-form; extended with columns[], tags[], etc.
  common.UserContext userContext = 3;     // Requester context
}
```

### **20.4 New Message Definitions**

```protobuf
// New message for GetColumnRegistry
message ColumnRegistryEntry {
  string domain_id = 1;
  string field_path = 2;
  string display_name = 3;
  string data_type = 4;
  string category = 5;
  string description = 6;
  int32 sort_weight = 7;
  bool is_active = 8;
  bool is_computed = 9;
  bool is_pii = 10;
}

message GetColumnRegistryRequest {
  string domain_id = 1;
}

message GetColumnRegistryResponse {
  repeated ColumnRegistryCategory categories = 1;
}

message ColumnRegistryCategory {
  string category_name = 1;
  repeated ColumnRegistryEntry columns = 2;
}
```

### **20.5 FE API Routes (Next.js)**

| Route | Method | Purpose | Proxy To |
| --- | | --- | --- |
| `/api/analytics/column-registry?domainId={domain}` | GET | Fetch column registry for domain | analytics-service `GetColumnRegistry` gRPC |
| `/api/offline-report/create` | POST | Create export job (existing, extended) | analytics-service `CreateReportJob` gRPC |

## **21. Column Registry Governance**

### **21.1 Ownership**

| Aspect | Owner | Detail |
| --- | | --- |
| Registry content accuracy | Analytics Engineer | Responsible for ensuring registry entries match PRD-A collection schemas |
| Schema changes (new fields) | Engineering (PRD-A) | PRD-A schema additions trigger registry seed script update |
| Column request process | PM → Analytics Engineer | Request → schema review → seed script update → deploy. Lead time = 1 sprint cycle. |
| Deprecation decision | PM | `isActive: false` hides from picker. `deprecatedAt` timestamp added. |

### **21.2 Versioning**

- Registry documents carry `createdAt` / `updatedAt` timestamps.
- Every job column snapshot MUST store `registryVersion` (semver) from the registry at creation time (FR-063).
- `registryVersion` enables reproduction of a job's column set against the registry as it existed at creation time.

### **21.3 Deprecation Lifecycle**

1. Column marked `isActive: false` → hidden from picker for new selections.
2. `deprecatedAt` timestamp set.
3. Existing presets retain reference but show "Tidak Tersedia" badge (US-012).
4. Existing job snapshots are immutable — they retain the column reference.
5. Job processing: deactivated columns are skipped with warning (EH-011, FR-065).

### **21.4 Schema Drift Detection**

- CI or startup check (FR-064): registry-vs-collection field-name comparison.
- Count-based comparison is insufficient — must be field-name-aware.
- Alarm fires if a registry entry's `fieldPath` no longer exists in the target collection.

### **21.5 Custom / Computed Columns**

User-defined custom or computed columns are **OUT OF SCOPE** for Phase 2. See §2 Scope Definition and §14 Future Considerations.

## **22. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| --- | | --- | --- | --- |
| **Column Registry Collection** | Create `exportcolumnregistry` collection + indexes via migration script. Seed all entries from PRD-A §10.1/10.2/10.3 field definitions. | Engineering | Collection exists with correct indexes. Entry count matches expected: 33 conversation + 43 ticket + 24 broadcast = 100 entries. Field-name-aware validation (not count-only). | Drop collection. No impact on existing functionality. |
| **Feature Flag: `ENABLE_CONFIGURABLE_EXPORT`** | Boolean flag on analytics-service. When disabled, column picker UI hidden, `CreateReportJob` rejects `columns[]` parameter, only legacy fixed-header path works. | Engineering | Flag toggles UI visibility and API behavior. | Disable flag → falls back to legacy path. No data loss. |
| **Phase 1: Registry + UI (Shadow)** | Deploy column registry + column picker UI. Picker visible but jobs still use legacy path (column selection stored but not used for query). | Engineering + QA | Column picker renders correctly. Column selection stored in job parameters. Existing legacy jobs unaffected. | Disable feature flag. |
| **Phase 2: Configurable Query Path** | Enable dynamic query builder for new jobs with `columns[]`. Jobs read from analytics collections (PRD-A). Legacy path still works for legacy jobs. | Engineering + QA | New configurable jobs produce correct XLSX with selected columns from analytics data. Row count parity with legacy path for same filters. | Disable feature flag → new jobs use legacy path. In-flight configurable jobs complete normally. |
| **Phase 3: Enhanced Filters** | Enable Tags and Inbox/Team filters on the filter panel. | Engineering | Filters populate from analytics data. Filtered exports contain only matching rows. | Filters hidden when flag disabled. |
| **Phase 4: Default Preset + Polish** | Enable "Default" preset pre-selection. localStorage memory for last selection. Job list enhancement (Parameter Permintaan expandable). | Engineering + QA | Default preset loads on first visit. Job list shows column snapshot. | UI-only changes. Disable flag hides enhancements. |
| **Data Backfill** | Column registry is seed data, not user data. No backfill needed. | — | — | — |
| **Rollback Strategy** | Feature-flag disable is the primary rollback. No data migration to undo. Analytics collections (PRD-A) are independent and unaffected. | Engineering | Flag disabled = system behaves exactly as before this feature. | Code rollback only if feature-flag mechanism fails. |

## **23. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| --- | | --- | --- | --- | --- | --- |
| `exportcolumnregistry` entries | analytics-service | Migration seed script | Permanent (no TTL) | Manual update when schema changes. No auto-delete. | Not exported (system metadata). | No PII in registry. |
| Column snapshot in job parameters | analytics-service | Job creation request | Tied to job retention (7 days from completion, then job expires) | Job expiry deletes job record. Column snapshot is embedded in job document. | Included in job parameter display. | No PII in column names. |
| PII acknowledgment on job document | analytics-service | Job creation (when `piiAcknowledged = true`) | 7-day job lifecycle (tied to job retention) | Job expiry deletes job record including acknowledgment fields. | Not directly exported. | Records which user acknowledged PII columns. 90-day audit retention requires audit-service schema extension (future enhancement). |
| Generated XLSX file | analytics-service → S3 | Job processing | 7 days from completion (reuse existing) | S3 lifecycle policy deletes after 7 days. | Downloaded via 15-min presigned URL. | File may contain PII (masked per privacy permissions) if user selected PII columns. |
| User's last column selection | Browser localStorage | Client-side | Until user clears browser data | Browser-managed. No server-side storage. | Not exported. | No PII. Column names only. |

## **24. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| --- | | --- | --- |
| Active job limit | User already has an active job for this domain | MAX_ACTIVE_JOBS_PER_CHANNEL = 1 per user per domain (report-job.constant.ts:1). Second submission rejected with "Too many active export jobs". | Submit second active job for same domain. Rejected. |
| Double-click on Submit | Two rapid submissions | Same active-job-limit mechanism catches this. Only one job created. | Rapid double-click. Single job row appears. |
| Rate limit: configurable export | Excessive job creation | Reuse existing rate limit: 10 jobs per hour per user. Applies to both legacy and configurable paths combined. | Create 11 jobs in 1 hour. 11th rejected. |
| Column registry update during active job | Registry entry deactivated between creation and Processing | Processing re-validates columns against registry. Deactivated columns are SKIPPED with warning (FR-065), not all-or-nothing failure. | Deactivate a registry entry while a job is QUEUED. Job completes with warning, column omitted. |
| Very large column × row output | Memory pressure during XLSX generation | 20,000-row cap enforced (NFR-004). In-memory SheetJS writer. If cap exceeded, mark job FAILED with guidance message. No hard column cap, but warn at > 50 columns at submission time. | Submit job with 43 columns × 31-day range. Verify 20K cap enforced. |
| Concurrent column registry reads | Multiple users loading picker simultaneously | Registry is read-only, tenant-agnostic. In-memory cache with 5-minute TTL. No locking needed. | Multiple simultaneous picker opens. All succeed within < 200ms. |
| XLSX generation timeout | Large export exceeds processing timeout | Reuse existing job timeout. If exceeded, job marked FAILED. User can retry with fewer columns or smaller date range (RetryReportJob). | Submit very large job. Verify timeout handling. |
| Column snapshot immutability | displayName changes after snapshot | Job-list displays snapshot displayName (immutable from creation). Acceptable staleness. | Change a registry displayName. Existing jobs show old name. |

## **25. Analytics & Observability Plan**

> Monitoring is log-based. No APM dependency (no prom-client / OpenTelemetry in backend). Same as Phase 1 v2.0.

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| --- | | --- | --- | --- | --- |
| **Product Event** | `export_column_picker_opened` | User opens column picker | `domainId`, `userId`, `companyId` | Product/Data | — |
| **Product Event** | `export_pii_acknowledged` | User confirms PII column selection | `userId`, `companyId`, `piiColumns[]`, `domainId` | Product/Data | — |
| **Product Event** | `export_configurable_job_created` | Configurable export job submitted | `domainId`, `columnCount`, `hasPII`, `filterCount`, `userId` | Product/Data | — |
| **Product Event** | `export_default_preset_used` | User submits with default preset (no modifications) | `domainId`, `userId` | Product/Data | Track adoption of custom vs default selections. |
| **Metric** | `export_job_column_count` | Job created | `domainId`, `columnCount` | Engineering | Alert if median > 50 (may indicate UX issue). |
| **Metric** | `export_job_row_count` | Job completed | `domainId`, `rowCount` | Engineering | Alert if approaching 20K cap frequently. |
| **Metric** | `export_job_generation_duration_ms` | Job completed/failed | `domainId`, `columnCount`, `rowCount`, `status` | Engineering | Alert if p95 > existing timeout threshold. |
| **Metric** | `export_job_file_size_bytes` | Job completed | `domainId`, `columnCount`, `rowCount`, `fileSize` | Engineering | Monitor for growth trends. |
| **Metric** | `export_column_registry_cache_hit_ratio` | Registry query | `hit`, `miss` | Engineering | Alert if < 80% hit ratio. |
| **Metric** | `export_column_registry_query_duration_ms` | Registry query | `cacheHit`, `duration` | Engineering | Alert if p95 > 200ms. |
| **Log** | `export_configurable_job_failed` | Job marked FAILED | `jobId`, `domainId`, `columnCount`, `failureReason` | Engineering | Alert if failure rate > 2%. |
| **Log** | `export_column_validation_error` | Job creation rejected due to invalid columns | `domainId`, `invalidColumns[]`, `userId` | Engineering | — |
| **Log** | `export_column_skipped` | Deactivated column skipped during processing | `jobId`, `fieldPath`, `displayName` | Engineering | — |

## **26. Glossary**

| Term | Definition |
| --- | | --- |
| Column Registry | A MongoDB collection (`exportcolumnregistry`) that defines available export columns per domain with metadata (display name, type, category, PII flag). |
| Domain | The data entity type for export: `conversation`, `ticket`, or `broadcast`. Each domain maps to one analytics row-level collection. Carried as `channel` in the CreateReportJob payload. |
| Configurable Export | An export job where the user selects specific columns from the column registry (`parameters.columns[]` present), as opposed to using the legacy fixed-header path. |
| Default Preset | A system-managed column selection per domain that includes all non-PII active columns (`isPII: false`). Pre-selected when user opens the picker. |
| PII Acknowledgment | A user confirmation action required when selecting columns flagged as containing Personally Identifiable Information. Stored on job document (`parameters.piiAcknowledgedBy`, `parameters.piiAcknowledgedAt`). Retained for 7-day job lifecycle. |
| PII Masking | Existing field-level privacy mechanism driven by `privacy:view_full_email` and `privacy:view_full_phone` permissions. Configurable export honours this — PII values are masked using `maskPhone()` / `maskEmail()` from the common library for users without full privacy access. |
| Dynamic Query Builder | The backend component that translates `{channel, columns[], filters}` into a MongoDB aggregation pipeline over the corresponding analytics collection. |
| Legacy Fixed-Header Path | The existing export mechanism where columns are determined by a fixed template per domain. Triggered when `parameters.columns[]` is absent or empty. |
| registryVersion | Semver string stamped on every job column snapshot at creation time, enabling reproduction of the column set against the registry as it existed at that moment. |

## **27. Source References**

| Reference | Path | Relevance |
| --- | | --- |
| Change Intake Brief v3.0 | EXTERNAL: `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` | §5B export flexibility gap, OQ-3 (custom column picker), OQ-15 (column registry granularity) |
| PRD-A: Row-Level Collections | EXTERNAL: `PRD/Analytics/Export/PRD Analytics - Export Row-Level Collections (Foundation).md` | §10.1/10.2/10.3 field definitions (source for column registry), FR-001 to FR-040 (collections this PRD reads from) |
| Sibling PRD: Offline Report Download | EXTERNAL: `PRD/Analytics/PRD Analytics - offline report download.md` | Existing export UX, RBAC, retention, job lifecycle, rate limits, UI components to extend |
| Cross-Domain SAP Brief (consumed) | EXTERNAL: `Assessments/cross-domain/sap-report-export/` | SAP column specs — referenced for Phase 4, not directly used here |
| Global Memory | EXTERNAL: `Memory/global-memory.md` | Canonical product rules, protected behavior |
| BE Architecture Reference | EXTERNAL: `Memory/CLAUDE-be.md` | analytics-service ownership, service topology, proto-first, RabbitMQ conventions |
| PRD Writing Rule | EXTERNAL: `Rules/prd-writing-rule.md` | Template structure, mandatory sections |
| analytics.proto | `proto/analytics.proto:37-42,76-80` | Actual gRPC service definition and CreateReportJobRequest message |
| export-parameter.dto.ts | `apps/api-gateway/src/app/analytics/dto/export-parameter.dto.ts:20-27` | Per-domain filter parameter DTOs |
| ticket-export.worker.ts | `apps/ticket-service/src/app/workers/ticket-export.worker.ts:35-61,72,77` | Shipped ticket export headers and SheetJS writer |
| report-job.constant.ts | `apps/analytics-service/src/app/constants/report-job.constant.ts:1,4` | MAX_ACTIVE_JOBS_PER_CHANNEL, MAX_DATE_RANGE_DAYS |
| privacy-masking.interceptor.ts | `apps/api-gateway/src/interceptors/privacy-masking.interceptor.ts:16-19` | Global PII masking on privacy permissions |
| default-permission.constant.ts | `libs/common/src/lib/constants/default-permission.constant.ts:131-137` | StatisticPermission.READ_OWN/READ_TEAM/ALL |
| ExportJobStatus enum | `libs/common/src/lib/enums/index.ts:1917-1923` | QUEUED, PROCESSING, COMPLETED, FAILED, EXPIRED |
