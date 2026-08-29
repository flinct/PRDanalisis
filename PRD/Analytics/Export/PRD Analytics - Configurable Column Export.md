# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Column Registry + Configurable Column Export
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: TBD

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD for Sub-PRD B: column registry, configurable column picker UI, dynamic query builder, and export job enhancement. |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide user-configurable column selection for export jobs, replacing the fixed template system with a column registry + picker UI that reads from analytics row-level collections. |
| Scope | Column registry collection (`exportcolumnregistry`), column picker UI, dynamic query builder, export job enhancement to accept custom column sets, enhanced filter panel, enhanced job list. |
| Key Capabilities | (1) Metadata-driven column registry per domain. (2) Searchable, categorized column picker UI with PII warnings. (3) Dynamic MongoDB aggregation pipeline for selected-column projection. (4) Enhanced filter panel (tags, inbox/team). (5) Job list shows column snapshot and domain. |
| Outcome | Admin and Supervisor users can select exactly which columns to export per domain, with columns sourced from analytics row-level collections (PRD-A). |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Column registry collection (`exportcolumnregistry`) with per-field metadata per domain | SAP 4-sheet template preset → Sub-PRD D (this PRD builds the picker; D adds SAP as a preset) |
| Column picker UI on existing Offline Report Download page | Broadcast-specific export UX → Sub-PRD C (this PRD allows broadcast domain in picker, but broadcast-specific filters and UX is C) |
| Export job enhancement: `columns[]` in job creation, project only selected columns into XLSX | The 3 new analytics collections (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`) → PRD-A |
| Dynamic query builder: MongoDB aggregation pipeline from analytics collections | The sync pipeline (event-driven + backfill) → PRD-A |
| Filter panel enhancement: Tags filter, Inbox/Team filter | Export job infra (queue, S3, retention, download link) → reuse existing offline-report-download |
| Job list enhancement: show domain, column snapshot | CSV/PDF format support |
| PII field warning badges in column picker | Field-level RBAC enforcement (warning-only approach; RBAC gating is future consideration) |
| System-managed default presets per domain | User-saved presets (P2 — documented in Future Considerations) |
| Date range, status, employee, channel filters (reuse existing) | Keyword filter, Ticket IDs filter |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Current export uses fixed templates — users cannot choose which columns to include or exclude. | Users must export all columns even when they need only a subset, producing oversized files with unnecessary data. |
| PS-002 | No column metadata system exists — available columns are implicitly defined in backend code per template. | Adding new export columns requires code changes. No search, categorization, or documentation of available fields. |
| PS-003 | Export reads from operational collections, coupling export read-load to domain-service performance. | Risk of performance degradation on live customer-service operations during heavy export jobs. (PRD-A solves the data source; this PRD builds the consumer.) |
| PS-004 | PII fields (phone, email) are included in exports without explicit user acknowledgment. | Compliance risk — users may unknowingly export PII without governance awareness. |
| PS-005 | Filter panel lacks tag-based and inbox/team-based filtering for exports. | Users cannot narrow export scope to specific tags or teams, requiring post-export manual filtering. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enable user-driven column selection for exports | 100% of export jobs created after launch use the column picker (no more implicit template-only path). |
| Reduce export file size for targeted use cases | Median export file size decreases by ≥ 30% for jobs using fewer than full column sets. |
| Maintain PII governance awareness | 100% of jobs containing PII columns require explicit user acknowledgment before submission. |
| Provide discoverable column metadata | Column registry covers 100% of fields from PRD-A collections (§10.1, §10.2, §10.3). |
| Preserve existing export job reliability | Job completion rate remains ≥ 98% (matching existing offline-report KPI). |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to select a data domain (Tiket/Percakapan) so that the column picker shows columns relevant to that domain. | 1. Given I open the Offline Report page, When I select "Tiket" as Jenis Laporan, Then the column picker shows ticket-domain columns grouped by category. 2. Given I select "Percakapan", When the picker loads, Then conversation-domain columns are shown instead. 3. Given I switch domain, When previous column selections are invalid for the new domain, Then selections are cleared and the picker resets. |
| US-002 | P0 | As an Admin, I want to pick specific columns from a searchable, categorized list so I can export only the data I need. | 1. Given the column picker is open, When I search for "SLA", Then all columns with "SLA" in the display name or description are shown. 2. Given a category "Waktu & SLA" exists, When I expand it, Then I see all columns in that category with checkboxes. 3. Given I select 5 columns, When I submit the job, Then the XLSX contains only those 5 columns as headers. |
| US-003 | P0 | As an Admin, I want to select all columns in a category or all columns at once for convenience. | 1. Given I expand a category, When I click "Pilih Semua" for that category, Then all columns in that category are checked. 2. Given I click "Pilih Semua" (global), When applied, Then every column in the picker is checked. 3. Given I click "Hapus Semua", When applied, Then all column selections are cleared. |
| US-004 | P0 | As an Admin, I want PII columns flagged with a warning so I can make an informed decision before exporting sensitive data. | 1. Given PII columns exist (e.g. contactPhone, contactEmail), When I view the picker, Then these columns show a "PII" badge/warning icon. 2. Given I select a PII column, When I attempt to submit, Then a confirmation dialog appears stating "Kolom ini mengandung data pribadi (PII)". 3. Given I decline the PII confirmation, When the dialog closes, Then the PII columns are deselected. |
| US-005 | P0 | As an Admin, I want to set filters (date range, status, channel, employee, tags, inbox/team) so the export contains only relevant rows. | 1. Given I select "Tiket", When I open the Tags filter, Then I see a multi-select of tags available in ticket analytics data. 2. Given I select an Inbox/Team, When I submit, Then only rows belonging to that inbox/team are exported. 3. Given all existing filters (date range, status, employee, channel), When I apply them, Then they function identically to current offline-report behavior. |
| US-006 | P0 | As an Admin, I want the job list to show which domain and columns were selected so I can review past export configurations. | 1. Given a job is created, When I view the job list, Then I see "Jenis Laporan" (domain) in the row. 2. Given a job has a column snapshot, When I expand "Parameter Permintaan", Then I see the list of selected column display names. 3. Given an existing template-based job from before this feature, When I view the list, Then it shows "Template: Default Ticket" in parameters (backward compatible). |
| US-007 | P0 | As an Admin, I want the export XLSX to contain exactly the columns I selected, in the order I selected them, with Bahasa display names as headers. | 1. Given I select columns [contactName, status, createdAt, channel], When the XLSX is generated, Then the headers are [Nama Kontak, Status, Tanggal Dibuat, Kanal] in that order. 2. Given a field value is null for a row, When exported, Then the cell shows "-". 3. Given I select columns from the registry, When exported, Then the header uses the `displayName` from the registry, not the raw field path. |
| US-008 | P0 | As a Supervisor, I want column access scoped to my permission level so I do not export PII data I am not authorized to see. | 1. Given I am a Supervisor, When I open the column picker, Then I see all non-PII columns normally. 2. Given I am a Supervisor, When PII columns are shown, Then the PII warning requires explicit opt-in, same as Admin. 3. Given my Team Inbox scope limits my data, When I export, Then only rows within my scope are included regardless of column selection. |
| US-009 | P1 | As an Admin, I want the column picker to remember my last selection as a quick-start default so I do not have to re-pick columns every time. | 1. Given I previously exported with columns [A, B, C], When I open the column picker for the same domain again, Then those columns are pre-selected. 2. Given I clear selections and pick new ones, When I submit, Then the new selection becomes the remembered default. 3. Given I switch domain, When the picker reloads, Then the remembered default is for the new domain (not the previous domain). |
| US-010 | P1 | As an Admin, I want the export job to fail gracefully if the selected columns no longer exist in the registry so I am not confused by a partial file. | 1. Given I selected column "foo" and it was deactivated before job processing, When the job runs, Then the job FAILS with reason "Kolom tidak tersedia: foo". 2. Given all selected columns are valid, When the job runs, Then it completes normally. |
| US-011 | P2 | As an Admin, I want to save my current column selection as a named preset so I can reuse it across export jobs. | 1. Given I have selected 15 columns, When I click "Simpan Preset" and name it "Weekly Report", Then the preset is saved to my account. 2. Given I have saved presets, When I open the column picker, Then I see a "Presets" section with my saved presets. 3. Given I select a preset, When applied, Then the corresponding columns are checked. |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| **Column Registry — Schema & Population** | FR-001 [P0]: System MUST create collection `exportcolumnregistry` in `satuinbox_analytics` with document shape defined in Appendix A. FR-002 [P0]: System MUST populate registry entries for all fields in `conversationexportdata` (PRD-A §10.1 — 37+ fields), `ticketexportdata` (PRD-A §10.2 — 46+ fields), and `broadcastexportdata` (PRD-A §10.3 — 27+ fields). FR-003 [P0]: Each registry entry MUST include: `domainId`, `fieldPath`, `displayName` (Bahasa Indonesia), `dataType`, `category`, `description`, `sortWeight`, `isActive`, `isComputed`, `isPII`. FR-004 [P0]: System MUST flag PII fields (`contactPhone`, `contactEmail`, `recipientNumber`, `recipientName`, `senderNumber`, `contactName`) with `isPII: true`. FR-005 [P0]: Registry MUST organize columns by category/group: "Informasi Dasar", "Kontak & Identitas", "Waktu & SLA", "Status & Lifecycle", "Tag & Kategori", "Kanal & Platform", "Custom Fields", "Metadata". FR-006 [P0]: Registry entries MUST be tenant-agnostic (shared across all tenants) — the registry defines available columns, not tenant-specific column permissions. FR-007 [P1]: System MUST support `isComputed: true` for fields that are derived/computed (e.g. `handlingTimeMs`, `diffTimeFirstAssignAndFirstResponseMs`, `stageDuration*Ms`). |
| **Column Registry — Query API** | FR-008 [P0]: System MUST expose a gRPC endpoint `GetColumnRegistry` that accepts `domainId` and returns all active columns for that domain, grouped by category. FR-009 [P0]: Response MUST include: `fieldPath`, `displayName`, `dataType`, `category`, `description`, `sortWeight`, `isPII`, `isComputed` per column. FR-010 [P0]: Response MUST be sorted by `sortWeight` ascending within each category group. FR-011 [P1]: System MUST support a `searchQuery` parameter that filters columns by `displayName` or `description` (case-insensitive substring match). |
| **Export Job — Column Selection** | FR-012 [P0]: Export job creation payload MUST accept `columns[]` — an array of `fieldPath` strings. FR-013 [P0]: System MUST validate that all `fieldPath` values in `columns[]` exist in the column registry for the selected `domainId`. FR-014 [P0]: System MUST reject job creation if `columns[]` is empty (at least 1 column required). FR-015 [P0]: System MUST reject job creation if any `fieldPath` is not found or not active in the registry. FR-016 [P0]: System MUST store the full column snapshot (fieldPaths + displayNames + dataTypes) in the job parameter for reproducibility. FR-017 [P0]: System MUST read data from the corresponding PRD-A analytics collection (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`) based on `domainId`. FR-018 [P0]: System MUST project ONLY the selected columns into the XLSX output — no additional columns. |
| **Export Job — Domain Support** | FR-019 [P0]: System MUST support `domainId` values: `conversation`, `ticket`. FR-020 [P0]: Broadcast domain (`broadcast`) MUST be selectable in the column picker but broadcast-specific filters and UX is deferred to Sub-PRD C. FR-021 [P0]: Each domain maps to one analytics collection: `conversation` → `conversationexportdata`, `ticket` → `ticketexportdata`, `broadcast` → `broadcastexportdata`. |
| **Export Job — Backward Compatibility** | FR-022 [P0]: Existing template-based export jobs (Default Ticket, per-TicketType, Default Conversation, Default Broadcast) MUST continue to function during the migration period. FR-023 [P0]: System MUST support both creation paths in parallel: (a) legacy template-based (`templateId`) and (b) configurable column-based (`columns[]` + `domainId`). FR-024 [P0]: When `columns[]` is provided, system MUST use the configurable path. When `templateId` is provided without `columns[]`, system MUST use the legacy template path. |
| **Dynamic Query Builder** | FR-025 [P0]: System MUST build a MongoDB aggregation pipeline that takes `{domain, columns[], filters}` and produces a cursor over the corresponding analytics collection. FR-026 [P0]: Pipeline MUST include a `$match` stage with `{companyId, organizationId}` scoping as the first filter stage. FR-027 [P0]: Pipeline MUST support filter stages for: `createdAt` (date range), `status`, `channel`, `assignedTo`/`assignee`, `tags`, `inboxId`/`teamId`. FR-028 [P0]: Pipeline MUST include a `$project` stage that selects ONLY the fields in `columns[]` plus internal fields needed for dedup. FR-029 [P0]: Pipeline MUST return a streamed cursor (not load full result set into memory) for XLSX generation. FR-030 [P0]: System MUST map `displayName` values as XLSX column headers, using the registry snapshot stored at job creation time. |
| **Dynamic Query Builder — Field Mapping** | FR-031 [P0]: For simple fields (string, number, Date, boolean), the pipeline MUST use direct field path projection. FR-032 [P0]: For array fields (`tags`, `assignedTo`, `assignee`, `participants`), the pipeline MUST join array elements with ", " separator for XLSX cell value. FR-033 [P0]: For object fields (`customAttributes`, `customFields`, `metadata`), the pipeline MUST flatten or serialize as JSON string in the XLSX cell. FR-034 [P0]: For Date fields, the pipeline MUST format as `YYYY-MM-DD HH:mm:ss` in workspace timezone (Asia/Jakarta). FR-035 [P0]: For duration fields (ms values like `firstReplyTimeMs`, `handlingTimeMs`, `timeToCloseMs`), the pipeline MUST format as `HH:mm:ss` human-readable duration. FR-036 [P1]: For nested object fields (`remarks`, `rawEvent`), the pipeline MUST serialize as JSON string. |
| **Frontend — Column Picker UI** | FR-037 [P0]: System MUST render a column picker component on the Offline Report Download page when `domainId` is selected. FR-038 [P0]: Column picker MUST display columns grouped by category, each category collapsible/expansible. FR-039 [P0]: Each column row MUST show: checkbox, `displayName`, `dataType` badge, and (if PII) a warning icon/badge. FR-040 [P0]: Column picker MUST include a search input that filters columns by `displayName` substring (debounced, client-side filter against pre-loaded registry). FR-041 [P0]: Column picker MUST provide "Pilih Semua" (select all) per category and "Pilih Semua" (global select all). FR-042 [P0]: Column picker MUST provide "Hapus Semua" (deselect all). FR-043 [P0]: Column picker MUST show a selected-column count indicator (e.g. "12 kolom dipilih"). FR-044 [P0]: Column picker MUST prevent submission if zero columns selected (show "Pilih minimal 1 kolom"). |
| **Frontend — PII Confirmation** | FR-045 [P0]: When user selects one or more PII-flagged columns, the submit action MUST trigger a confirmation dialog. FR-046 [P0]: Confirmation dialog MUST display: "Kolom yang dipilih mengandung data pribadi (PII). Lanjutkan?" with the list of PII column display names. FR-047 [P0]: If user cancels, PII columns MUST be deselected and submission blocked. FR-048 [P0]: If user confirms, submission proceeds and the PII acknowledgment is recorded in the job audit log. |
| **Frontend — Filter Panel Enhancement** | FR-049 [P0]: Filter panel MUST retain all existing filters: date range (Start Date, Start Time, End Date, End Time with 30-day cap), status (dynamic by domain), employee/assignee, channel. FR-050 [P0]: System MUST add a "Tag" multi-select filter that populates from tag values in the corresponding analytics collection for the selected domain. FR-051 [P0]: System MUST add an "Inbox/Team" multi-select filter that populates from inboxName/teamId values in the corresponding analytics collection. FR-052 [P1]: Tags and Inbox/Team filter options MUST be scoped to the requester's tenant and permission scope. FR-053 [P1]: Tags filter MUST support search-as-you-type for large tag sets. |
| **Frontend — Job List Enhancement** | FR-054 [P0]: Job list MUST display "Jenis Laporan" (domain: Tiket/Percakapan/Broadcast) as a column in each job row. FR-055 [P0]: Job list "Parameter Permintaan" expandable MUST show the selected column display names as a comma-separated list. FR-056 [P0]: For legacy template-based jobs, "Parameter Permintaan" MUST continue showing "Template: {template name}" (backward compatible). FR-057 [P1]: If column count exceeds 10 in the snapshot, "Parameter Permintaan" MUST show first 10 column names plus "dan {N} kolom lainnya". |
| **Frontend — Default Preset** | FR-058 [P0]: System MUST provide a system-managed "Default" preset per domain that includes all non-PII active columns. FR-059 [P0]: "Default" preset MUST be pre-selected when the user opens the column picker for the first time (or has no remembered selection). FR-060 [P1]: System MUST persist the user's last column selection per domain in localStorage (client-side) for quick-start on next visit. |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | `columns[]` is empty. Reject job creation. | "Pilih minimal 1 kolom". |
| EH-002 | Validation | One or more `fieldPath` values not found in registry. Reject job creation. | "Kolom tidak valid: {fieldPath}". |
| EH-003 | Validation | One or more `fieldPath` values are inactive in registry. Reject job creation. | "Kolom tidak tersedia: {displayName}". |
| EH-004 | Validation | `domainId` is missing or invalid. Reject job creation. | "Jenis laporan tidak valid". |
| EH-005 | Validation | Date range invalid (start > end, range > 30 days, empty). Block submission. | Reuse existing error messages from offline-report PRD. |
| EH-006 | PII | User selects PII columns without confirming. Block submission. | "Konfirmasi kolom PII diperlukan". |
| EH-007 | Processing | XLSX generation fails due to memory pressure (too many columns × rows). Mark job FAILED. | "Gagal membuat laporan. Kurangi jumlah kolom atau perkecil rentang tanggal". |
| EH-008 | Processing | Analytics collection query times out. Retry once, then mark job FAILED. | "Gagal membuat laporan. Coba lagi nanti". |
| EH-009 | Registry | Column registry is empty or unavailable at job creation time. Reject job creation. | "Registri kolom tidak tersedia. Coba lagi nanti". |
| EH-010 | Permission | Supervisor submits job with columns outside scope. System re-scopes at processing time. | If zero rows after scoping, job completes with headers-only XLSX. "Laporan selesai tanpa data". |
| EH-011 | Stale Data | Column deactivated between job creation and processing. Mark job FAILED. | "Kolom tidak tersedia: {displayName}". |
| EH-012 | Duplicate | Identical job (same requester, domain, columns, filters) already active. Block creation. | "Permintaan yang sama masih diproses". |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User selects all columns (80+ for ticket domain) | Job proceeds. XLSX generation uses streaming to avoid memory spike. If file size exceeds safe threshold (500MB), mark FAILED with guidance to reduce columns or date range. | "Data terlalu besar. Kurangi kolom atau perkecil rentang tanggal". |
| EC-002 | User selects only PII columns (e.g. contactPhone, contactEmail) | PII confirmation dialog shown. If confirmed, job proceeds with only those columns. | Normal flow after PII confirmation. |
| EC-003 | Column registry entry exists but corresponding field is missing from analytics collection row (null in every row) | Column appears in XLSX with all cells showing "-". Column is not removed from output. | No user-facing error. |
| EC-004 | User switches from "Tiket" to "Percakapan" after selecting 20 ticket columns | Column picker clears selections and reloads conversation-domain columns. | Brief loading state, then picker shows conversation columns with no pre-selection. |
| EC-005 | Custom attributes / metadata columns from conversation domain (CA: / META: prefix columns) | These are NOT individual registry entries. Instead, the registry has two computed entries: `customAttributes` (object, flattened to JSON) and `metadata` (object, flattened to JSON). User selects the object field; at export time all keys are flattened. | Object fields show as "Objek (JSON)" type badge. |
| EC-006 | Ticket custom fields from `customFields` object | Same as EC-005 — `customFields` is a single registry entry of type object. At export time, all keys are flattened into columns prefixed "CF: ". | Object field badge. |
| EC-007 | User submits with tags filter but no matching rows exist | Job completes with headers-only XLSX. | "Laporan selesai tanpa data". |
| EC-008 | Legacy template-based job submitted while configurable column system is active | Both paths work in parallel. Job list correctly shows template name for legacy jobs and column list for configurable jobs. | Backward compatible display. |
| EC-009 | User selects > 50 columns | Warning displayed: "Anda memilih lebih dari 50 kolom. Proses export mungkin lebih lama." Job proceeds. | Warning toast, non-blocking. |
| EC-010 | Supervisor's Team Inbox scope changes between job creation and processing | Processing uses current scope at execution time, not creation time. | Job may produce fewer rows than expected. No error. |
| EC-011 | Broadcast domain selected in picker but Sub-PRD C broadcast-specific UX not yet shipped | Column picker shows broadcast-domain columns. Filters show generic filters only (date range, status). Broadcast-specific filters (broadcast channel) added by Sub-PRD C. | Functional but limited filter set. |
| EC-012 | Concurrent requests to create identical configurable export jobs | Dedup check: same requester + domain + columns[] (sorted) + filters = identical. Second request blocked. | "Permintaan yang sama masih diproses". |

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Domain Selector | Renamed from "Kanal" to "Jenis Laporan". Values: Tiket, Percakapan. (Broadcast added by Sub-PRD C.) | Selecting domain triggers column picker reload and filter panel update. | US-001 |
| Column Picker Panel | New component below domain selector. Shows searchable, categorized, checkbox-based column list. | User browses or searches columns, checks desired columns, sees count indicator. | US-002, US-003 |
| Column Category Group | Collapsible section with category name (e.g. "Waktu & SLA"), per-category "Pilih Semua" link, and column rows. | Click category header to expand/collapse. Click "Pilih Semua" to check all in category. | US-003 |
| Column Row | Checkbox + display name + data type badge + PII badge (if applicable). | Click checkbox to toggle. PII badge is informational. | US-002, US-004 |
| Search Input | Debounced search field at top of column picker. Filters columns by display name substring. | Type to filter. Clear button resets filter. | US-002 |
| Global Actions | "Pilih Semua" and "Hapus Semua" buttons above column list. | Select all or clear all columns across all categories. | US-003 |
| Selection Counter | "N kolom dipilih" indicator near column picker header. | Updates in real-time as user toggles checkboxes. | US-002 |
| PII Confirmation Dialog | Modal dialog triggered on submit when PII columns are selected. Lists PII column names. "Lanjutkan" / "Batal" buttons. | User reviews PII columns and decides. "Batal" deselects PII columns. | US-004 |
| Tags Filter | Multi-select dropdown with search. Populated from analytics collection tag values. | User selects one or more tags. Empty = all tags. | US-005 |
| Inbox/Team Filter | Multi-select dropdown with search. Populated from analytics collection inbox/team values. | User selects one or more inboxes/teams. Empty = all. | US-005 |
| Job List — Jenis Laporan Column | New table column showing domain per job. | Displayed for all jobs (legacy shows template domain, new shows explicit domain). | US-006 |
| Job List — Parameter Permintaan Enhancement | Expandable section shows selected column display names (max 10 + "dan N lainnya"). | Click to expand and see full column list. | US-006 |
| Loading State | Column picker shows skeleton/shimmer while registry loads. | Brief loading on domain selection change. | — |
| Empty State | "Tidak ada kolom tersedia" if registry returns empty. | Shown when registry is empty or query fails. | — |
| Default Preset Pre-selection | On first visit or when no remembered selection exists, "Default" preset (all non-PII columns) is pre-selected. | User sees pre-checked columns and can modify before submitting. | US-009 |

## **10. Field & Validation**

### **10.1 Job Creation Payload (New/Modified Fields)**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `domainId` | string enum | `ticket` | Must be one of: `conversation`, `ticket`, `broadcast` | Yes | — |
| `columns` | string[] | `["contactName", "status", "createdAt"]` | Min 1 item. All values must exist and be active in `exportcolumnregistry` for `domainId`. | Yes (when not using template) | — |
| `filters.dateRange.start` | Date | `2026-03-01T00:00:00+07:00` | Valid datetime. Must be before end. | Yes | — |
| `filters.dateRange.end` | Date | `2026-03-30T23:59:59+07:00` | Valid datetime. Range ≤ 30 days inclusive. | Yes | — |
| `filters.status` | string[] | `["OPEN", "ONGOING"]` | Must be valid status codes for domain. | No | All statuses |
| `filters.channel` | string[] | `["whatsapp", "instagram"]` | Valid platform values. | No | All channels |
| `filters.assignedTo` | string[] | `["USR-001", "USR-002"]` | Must be within requester permission scope. | No | All employees |
| `filters.tags` | string[] | `["shipping", "refund"]` | Valid tag values from analytics data. | No | All tags |
| `filters.inboxIds` | string[] | `["TIN-123", "TIN-456"]` | Must be within requester permission scope. | No | All inboxes |
| `filters.teamIds` | string[] | `["TEAM-01"]` | Must be within requester permission scope. | No | All teams |
| `piiAcknowledged` | boolean | `true` | Required `true` when any column in `columns[]` has `isPII: true`. | Conditional | `false` |

### **10.2 Column Registry Document Shape**

> Full schema in Appendix A.

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
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
| `createdAt` | Date | `2026-08-12T00:00:00Z` | Auto-generated | Auto | now() |
| `updatedAt` | Date | `2026-08-12T00:00:00Z` | Auto-generated | Auto | now() |

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance** | NFR-001: Column registry query MUST return in < 200ms at p95 (cached after first load). NFR-002: Column picker UI MUST render within 500ms of domain selection (registry pre-loaded). NFR-003: Dynamic query builder aggregation pipeline MUST complete within the existing job processing timeout (reuse existing). NFR-004: XLSX generation MUST use streaming write (not load-all-into-memory) to handle large datasets. |
| **Reliability** | NFR-005: Export job MUST be idempotent per job ID (reuse existing). NFR-006: Column validation MUST be performed at job creation time AND at job processing time (double-check against stale registry). |
| **Security** | NFR-007: All export queries MUST be scoped by `companyId` + `organizationId` (matching PRD-A FR-025/026/027). NFR-008: PII column selection MUST be audited with user acknowledgment timestamp. NFR-009: Download link MUST follow existing 15-minute presigned URL mechanism. |
| **Privacy** | NFR-010: PII fields MUST show explicit warning in column picker. NFR-011: PII acknowledgment MUST be recorded in job audit trail with `userId`, `timestamp`, `columns[]`. |
| **Observability** | NFR-012: Job metrics MUST include: `column_count`, `row_count`, `generation_duration_ms`, `file_size_bytes`, `domain`, `status`. NFR-013: Column registry query MUST be logged with cache hit/miss ratio. |
| **Accessibility** | NFR-014: Column picker MUST support keyboard navigation (Tab, Space/Enter for checkbox toggle, arrow keys for category navigation). |
| **Localization** | NFR-015: All column display names, category names, UI labels, and error messages MUST be in Bahasa Indonesia. |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| PRD-A: Row-level analytics collections must exist and be populated before configurable export jobs can read from them. | Engineering (PRD-A) | **Blocking for production use.** If collections are empty, export returns no data. | Feature-flag: configurable export only enabled after PRD-A Phase 4 cutover. Legacy template path remains available. |
| PRD-A: Sync pipeline must have acceptable lag (< 5 min p95). | Engineering (PRD-A) | Export data freshness depends on sync lag. | Document expected lag in UI (informational). Existing offline-report already has similar lag characteristics. |
| Column registry population must be complete for all domains. | Engineering (PRD-B) | If registry is incomplete, picker will show fewer columns than available in collections. | Seed script must cover 100% of PRD-A §10.1/10.2/10.3 fields. Validation test: compare registry entry count vs collection field count per domain. |
| XLSX library (ExcelJS or equivalent) streaming support. | Engineering | If library does not support streaming for large files, memory issues possible. | Use ExcelJS streaming workbook writer (already proven in existing export infra). |
| Large column count × large row count may produce oversized files. | Engineering | File generation may fail or produce files too large for download. | Warn at > 50 columns. Fail gracefully at memory threshold. Existing 30-day range cap limits row count. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Configurable export adoption rate | ≥ 80% of new export jobs use column picker (vs legacy template) | 30 days post-launch | Job creation logs (check `columns[]` vs `templateId`) |
| Median export file size reduction | ≥ 30% smaller than full-template export for same filters | 30 days post-launch | Job metrics (`file_size_bytes`) |
| PII column selection rate with acknowledgment | 100% of PII-containing jobs have `piiAcknowledged: true` | Ongoing | Job audit trail |
| Job completion rate (configurable path) | ≥ 98% (matching existing offline-report KPI) | 30 days post-launch | Job status metrics |
| Column registry coverage | 100% of PRD-A collection fields have registry entries | At launch | Compare registry count vs collection schema count |
| P95 registry query latency | < 200ms | Ongoing | Application metrics |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| User-saved presets (P2) | Power users want to save and reuse column selections. US-011 covers this but marked P2. |
| Field-level RBAC for PII columns | Current approach is warning-only. If compliance requires, PII columns can be RBAC-gated (Admin-only or role-based visibility). |
| Multi-domain single job (multi-sheet XLSX) | Allow one export job to produce multiple sheets (one per domain) in a single XLSX file. |
| Column reordering in picker UI | Allow drag-and-drop column reordering to control XLSX column order. |
| CSV/PDF format support | Beyond XLSX. Lower priority per brief. |
| Column-level data profiling | Show preview stats (row count, null %, distinct values) per column in the picker to help users make informed selections. |
| Preset sharing across users | Allow admins to create shared presets for the workspace. |

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Configurable export depends on PRD-A analytics collections being populated. | Cannot use configurable export until PRD-A Phase 4 cutover. Legacy template path works in parallel. |
| Column registry is populated via seed script, not auto-discovered from collection schema. | If PRD-A collection schema changes, registry must be manually updated (or a sync mechanism added later). |
| PII handling is warning-only, not RBAC-gated. | Any Admin/Supervisor can select PII columns after acknowledging the warning. RBAC field-level gating is a future enhancement. |
| Tags and Inbox/Team filter values are loaded from analytics collection data, not from a separate tag/team service. | If tags or teams are not yet synced to analytics, filter options may be incomplete. |
| Broadcast domain in column picker has only generic filters until Sub-PRD C ships broadcast-specific UX. | Users can select broadcast columns but filtering is limited (date range, status only). |
| Object-type fields (customAttributes, customFields, metadata) exported as JSON strings, not flattened columns. | Less human-readable than individual columns. CA:/META: prefix flattening from legacy template is not replicated by default for configurable export. |
| User column selection memory is client-side (localStorage). | Selections are per-browser, per-device. Not synced across sessions or devices. |

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
  "createdAt": "2026-08-12T00:00:00Z",
  "updatedAt": "2026-08-12T00:00:00Z"
}
```

**Indexes:**

| Index | Fields | Type | Purpose |
| ----- | ----- | ----- | ----- |
| Primary query | `{ domainId: 1, isActive: 1, category: 1, sortWeight: 1 }` | Compound | Fetch active columns per domain, grouped by category |
| Unique | `{ domainId: 1, fieldPath: 1 }` | Unique | One registry entry per field per domain |
| Search | `{ displayName: "text", description: "text" }` | Text | Server-side text search (fallback if client-side filtering insufficient) |

**Predefined Categories (Bahasa Indonesia):**

| Category | Sort Weight | Description |
| ----- | ----- | ----- |
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
| ----- | ----- | ----- | ----- |
| 1 | conversationId | ID Percakapan | Informasi Dasar |
| 2 | contactName | Nama Kontak | Kontak & Identitas |
| 3 | status | Status | Status & Lifecycle |
| 4 | channel | Kanal | Kanal & Platform |
| 5 | platformId | ID Platform | Kanal & Platform |
| 6 | assignedTo | Ditugaskan Ke | Assignment & Team |
| 7 | participants | Peserta | Assignment & Team |
| 8 | createdAt | Tanggal Dibuat | Waktu & SLA |
| 9 | updatedAt | Tanggal Diperbarui | Waktu & SLA |
| 10 | closedAt | Tanggal Ditutup | Waktu & SLA |
| 11 | closedBy | Ditutup Oleh | Status & Lifecycle |
| 12 | tags | Tag | Tag & Kategori |
| 13 | topic | Topik | Tag & Kategori |
| 14 | subTopic | Sub Topik | Tag & Kategori |
| 15 | inboxId | ID Inbox | Assignment & Team |
| 16 | inboxName | Nama Inbox | Assignment & Team |
| 17 | teamId | ID Tim | Assignment & Team |
| 18 | firstReplyTimeMs | Waktu Balasan Pertama | Waktu & SLA |
| 19 | firstResponseTimeMs | Waktu Respons Pertama | Waktu & SLA |
| 20 | timeToCloseMs | Waktu Penyelesaian | Waktu & SLA |
| 21 | avgResponseTimeMs | Rata-rata Waktu Respons | Waktu & SLA |
| 22 | slaFrtStatus | Status SLA FRT | Waktu & SLA |
| 23 | slaArtStatus | Status SLA ART | Waktu & SLA |
| 24 | slaTtcStatus | Status SLA TTC | Waktu & SLA |
| 25 | lastMessageBy | Pesan Terakhir Oleh | Message & Content |
| 26 | lastMessageAt | Pesan Terakhir Pada | Message & Content |
| 27 | lastMessageText | Teks Pesan Terakhir | Message & Content |
| 28 | customAttributes | Atribut Kustom | Custom Fields |
| 29 | metadata | Metadata | Custom Fields |
| 30 | folder | Folder | Status & Lifecycle |

**PII fields (excluded from Default, available opt-in):**

| # | fieldPath | displayName | category |
| ----- | ----- | ----- | ----- |
| P1 | contactPhone | Telepon Kontak | Kontak & Identitas |
| P2 | contactEmail | Email Kontak | Kontak & Identitas |

#### **B.2 Default Ticket Preset (all non-PII fields)**

| # | fieldPath | displayName | category |
| ----- | ----- | ----- | ----- |
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

> Ticket domain has no direct PII fields in the exportdata collection (contact info is not stored in `ticketexportdata` per PRD-A §10.2). PII flag applies only if future schema additions include contact phone/email.

#### **B.3 Default Broadcast Preset (all non-PII fields)**

| # | fieldPath | displayName | category |
| ----- | ----- | ----- | ----- |
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
| ----- | ----- | ----- | ----- |
| P1 | recipientNumber | Nomor Penerima | Kontak & Identitas |
| P2 | recipientName | Nama Penerima | Kontak & Identitas |
| P3 | senderNumber | Nomor Pengirim | Kontak & Identitas |

### **C. Cross-Reference: Registry Fields → PRD-A Collection Fields**

#### **C.1 Conversation Domain**

| PRD-A §10.1 Field | Registry fieldPath | Registry dataType | Registry category | isPII | isComputed |
| ----- | ----- | ----- | ----- | ----- | ----- |
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

#### **C.2 Ticket Domain**

| PRD-A §10.2 Field | Registry fieldPath | Registry dataType | Registry category | isPII | isComputed |
| ----- | ----- | ----- | ----- | ----- | ----- |
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

#### **C.3 Broadcast Domain**

| PRD-A §10.3 Field | Registry fieldPath | Registry dataType | Registry category | isPII | isComputed |
| ----- | ----- | ----- | ----- | ----- | ----- |
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
| ----- | ----- |
| Page title | "Laporan Offline" |
| Domain selector label | "Jenis Laporan" |
| Column picker section title | "Pilih Kolom" |
| Search placeholder | "Cari kolom..." |
| Category select all | "Pilih Semua" |
| Category deselect all | "Hapus Semua" |
| Global select all | "Pilih Semua Kolom" |
| Global deselect all | "Hapus Semua Kolom" |
| Selection counter | "{N} kolom dipilih" |
| PII badge | "PII" |
| PII warning title | "Peringatan Data Pribadi" |
| PII warning body | "Kolom yang dipilih mengandung data pribadi (PII). Pastikan Anda memiliki izin untuk mengekspor data ini." |
| PII confirm button | "Lanjutkan" |
| PII cancel button | "Batal" |
| Min column required | "Pilih minimal 1 kolom" |
| Column count warning | "Anda memilih lebih dari 50 kolom. Proses export mungkin lebih lama." |
| Tags filter label | "Tag" |
| Inbox/Team filter label | "Inbox / Tim" |
| Job list domain column | "Jenis Laporan" |
| Job list column snapshot header | "Kolom yang Dipilih" |
| Job list column overflow | "dan {N} kolom lainnya" |
| Invalid column | "Kolom tidak valid: {fieldPath}" |
| Unavailable column | "Kolom tidak tersedia: {displayName}" |
| Registry unavailable | "Registri kolom tidak tersedia. Coba lagi nanti." |
| Invalid domain | "Jenis laporan tidak valid" |
| PII acknowledgment required | "Konfirmasi kolom PII diperlukan" |
| Processing failed (memory) | "Gagal membuat laporan. Kurangi jumlah kolom atau perkecil rentang tanggal" |
| Processing failed (timeout) | "Gagal membuat laporan. Coba lagi nanti" |
| Empty result | "Laporan selesai tanpa data" |
| Duplicate job | "Permintaan yang sama masih diproses" |
| Default preset name | "Default" |
| No columns available | "Tidak ada kolom tersedia" |

### **E. Assumptions**

| ID | Assumption | Impact If Wrong | Validation Needed |
| ----- | ----- | ----- | ----- |
| ASM-001 | PRD-A analytics collections are populated and have acceptable sync lag (< 5 min p95) before configurable export is enabled. | If collections are empty or stale, export produces no data or outdated data. | Feature-flag gating: only enable configurable export after PRD-A Phase 4 cutover. |
| ASM-002 | Column registry entries are manually seeded via migration script and updated when PRD-A schema changes. | If registry is stale, picker shows incorrect columns or missing new fields. | Seed script version-tracked. Compare registry count vs collection schema in CI. |
| ASM-003 | ExcelJS streaming workbook writer is used for XLSX generation (already proven in existing export infra). | If streaming library not available, memory issues for large exports. | Verify ExcelJS streaming support in current dependency tree. |
| ASM-004 | PII governance allows PII in export files with user acknowledgment (not RBAC-gated). | If policy requires RBAC-gated PII, additional permission checks needed per column. | PM / Legal confirmation. |
| ASM-005 | localStorage is acceptable for persisting user's last column selection (client-side only). | If cross-device sync is needed, a server-side user preference API would be required. | UX review. |
| ASM-006 | Object-type fields (customAttributes, customFields, metadata) are exported as JSON strings in configurable export (not flattened to individual columns). | If users expect CA:/META: prefix flattening (like legacy template), additional pipeline logic needed. | Document this as a known behavior difference from legacy template. |

### **F. Open Questions**

| ID | Question | Status | Owner | Blocking? |
| ----- | ----- | ----- | ----- | ----- |
| OQ-15 | Column registry granularity: per-field or per-computed-metric? | **ASSUMED: per-field.** Each field in PRD-A collection = one registry entry. Computed fields (handlingTimeMs, stageDuration*Ms) are entries with `isComputed: true`. | PM / Eng Lead | No — assumption is sufficient for implementation |
| OQ-19 | PII column access control: RBAC field-level enforcement or warning-only with user acknowledgment? | **ASSUMED: warning-only with acknowledgment.** Any Admin/Supervisor can select PII columns after confirming the PII dialog. RBAC field-level gating deferred to future enhancement. | PM / Legal | No — warning-only is simpler and sufficient for Phase 1 |
| OQ-20 | Max column count per job: hard cap or soft warning? | **ASSUMED: no hard cap.** Warning at > 50 columns. Job fails gracefully at memory threshold during XLSX generation. | Engineering | No — soft warning is sufficient |
| OQ-21 | Multi-domain single job: one XLSX with multiple sheets vs separate jobs per domain? | **ASSUMED: separate jobs per domain.** Each job = one domain = one sheet. Multi-sheet (multi-domain single job) deferred to Future Considerations. | PM | No — separate jobs is simpler for Phase 1 |
| OQ-22 | Column ordering in XLSX: user-selection order or registry sortWeight order? | **ASSUMED: user-selection order.** Columns appear in XLSX in the order the user checked them in the picker. | PM / UX | No — user order is more intuitive |
| OQ-23 | Should the legacy template path be deprecated on a specific timeline? | **Open.** Both paths coexist indefinitely in Phase 1. Deprecation timeline TBD after adoption metrics. | PM | No — both paths work in parallel |

### **G. State Transition Model**

> Export job lifecycle is **unchanged** from existing offline-report PRD. This section documents the states for completeness and confirms no new states or sub-states are needed.

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Export Job | — | User submits valid job (configurable path) | QUEUED | Admin, Supervisor | `columns[]` validated against registry. `domainId` valid. Filters valid. Rate limit not exceeded. No duplicate active job. PII acknowledged if needed. | Job created with column snapshot in parameters. Message enqueued to RabbitMQ. | `export_job_created` |
| Export Job | QUEUED | Worker picks up job | PROCESSING | System | Job exists and is QUEUED. | Worker begins aggregation pipeline + XLSX generation. | `export_job_processing` |
| Export Job | PROCESSING | XLSX generation completes | COMPLETED | System | File uploaded to S3. | File URL stored. Completion timestamp recorded. | `export_job_completed` |
| Export Job | PROCESSING | XLSX generation fails | FAILED | System | Error occurred (memory, timeout, invalid column, etc.) | Failure reason stored. | `export_job_failed` |
| Export Job | COMPLETED | 7-day retention expires | EXPIRED | System (TTL) | Completion time + 7 days exceeded. | File deleted from S3. Download disabled. | `export_job_expired` |
| Export Job | QUEUED | User cancels (if supported) | CANCELED | Admin, Supervisor (own job) | Job is still QUEUED. | Job removed from queue. | `export_job_canceled` |

**No new states introduced.** Configurable export jobs use the same `QUEUED → PROCESSING → COMPLETED/FAILED → EXPIRED` lifecycle as existing template-based jobs.

### **H. Permission Matrix**

| Role | View Page | Export (Template) | Advance Export (Configurable) | Select PII Columns | View All Jobs | Download Own Job | Download Others' Job | Subscription Gate | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Admin | Allowed | Allowed | Allowed | Allowed (with acknowledgment) | Allowed | Allowed | Allowed | See tier table below | Full workspace scope. |
| Supervisor | Allowed | Allowed | Allowed | Allowed (with acknowledgment) | Denied (own jobs only) | Allowed | Denied | See tier table below | Scoped to own Team Inbox. |
| Agent | Denied | Denied | Denied | Denied | Denied | Denied | Denied | — | "Akses ditolak" |

#### **Subscription Tier Gating**

| Tab / Feature | Required Tier | Gate Mechanism | Notes |
| ----- | ----- | ----- | ----- |
| Export (template tetap) | — (all tiers) | Always visible for all subscribed companies | Existing feature, no change. Available to Basic, Normal, Pro, Enterprise. |
| Advance Export (configurable column) | — (all tiers) | Always visible for all subscribed companies | Open to all subscription tiers including Basic. |
| 👑 SAP Report (premium preset) | `enterprise` + PKS flag | `company.subscriptionTier = enterprise` AND `company.features.sapExportEnabled = true` | Exclusive to Enterprise + PKS (Perjanjian Kerja Sama). Flag set manually by ops. |

**Server-side enforcement:** `CreateExportJob` endpoint MUST check subscription tier + feature flags before accepting the job. Tab visibility is a UX convenience — the backend is the source of truth.

**PII Column Access:** Warning-only model. Both Admin and Supervisor can select PII columns after explicit acknowledgment dialog. No field-level RBAC gating in Phase 1.

**Server-side enforcement:** Permission re-checked at download time (reuse existing behavior from offline-report PRD).

### **I. API / Event Contract**

#### **I.1 New gRPC Endpoints**

| Contract | Method | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `GetColumnRegistry` | gRPC Unary | analytics-service | FE (Next.js API route) | `{ domainId: string }` | `{ columns: ColumnRegistryEntry[] }` grouped by category | `INVALID_ARGUMENT` (bad domainId), `INTERNAL` (registry unavailable) | New endpoint. No backward compat concern. |
| `SearchColumnRegistry` | gRPC Unary | analytics-service | FE (Next.js API route) | `{ domainId: string, searchQuery: string }` | `{ columns: ColumnRegistryEntry[] }` | Same as above | New endpoint. Optional — client-side filtering may be sufficient. |

#### **I.2 Modified gRPC Endpoints**

| Contract | Method | Change | Request Change | Response Change | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `CreateExportJob` | gRPC Unary | Extended to accept configurable column parameters | Added: `domainId`, `columns[]`, `filters.tags[]`, `filters.inboxIds[]`, `filters.teamIds[]`, `piiAcknowledged` | Unchanged (returns job ID) | Added: `INVALID_COLUMNS`, `EMPTY_COLUMNS`, `PII_NOT_ACKNOWLEDGED` | Backward compatible: `columns[]` is optional. When absent, legacy template path is used. |
| `ListExportJobs` | gRPC Unary | Extended response to include domain and column snapshot | Unchanged | Added: `domainId`, `selectedColumnNames[]` in job row | Unchanged | Backward compatible: new fields added to response. |

#### **I.3 gRPC Message Definitions**

```protobuf
// New message
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

// Modified: CreateExportJobRequest additions
message CreateExportJobRequest {
  // ... existing fields (template_id, date_range, status, channel, employee) ...
  
  // NEW for configurable export:
  string domain_id = 10;               // "conversation" | "ticket" | "broadcast"
  repeated string columns = 11;        // fieldPath strings
  repeated string tags = 12;           // tag filter
  repeated string inbox_ids = 13;      // inbox filter
  repeated string team_ids = 14;       // team filter
  bool pii_acknowledged = 15;          // PII confirmation
}
```

#### **I.4 FE API Routes (Next.js)**

| Route | Method | Purpose | Proxy To |
| ----- | ----- | ----- | ----- |
| `/api/analytics/column-registry?domainId={domain}` | GET | Fetch column registry for domain | analytics-service `GetColumnRegistry` gRPC |
| `/api/offline-report/create` | POST | Create export job (existing, extended) | analytics-service `CreateExportJob` gRPC |

### **J. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| **Column Registry Collection** | Create `exportcolumnregistry` collection + indexes via migration script. Seed all entries from PRD-A §10.1/10.2/10.3 field definitions. | Engineering | Collection exists with correct indexes. Entry count matches expected: ~33 conversation + ~43 ticket + ~24 broadcast = ~100 entries. | Drop collection. No impact on existing functionality. |
| **Feature Flag: `ENABLE_CONFIGURABLE_EXPORT`** | Boolean flag on analytics-service. When disabled, column picker UI hidden, `CreateExportJob` rejects `columns[]` parameter, only template path works. | Engineering | Flag toggles UI visibility and API behavior. | Disable flag → falls back to template-only path. No data loss. |
| **Phase 1: Registry + UI (Shadow)** | Deploy column registry + column picker UI. Picker visible but jobs still use template path (column selection stored but not used for query). | Engineering + QA | Column picker renders correctly. Column selection stored in job parameters. Existing template jobs unaffected. | Disable feature flag. |
| **Phase 2: Configurable Query Path** | Enable dynamic query builder for new jobs with `columns[]`. Jobs read from analytics collections (PRD-A). Template path still works for legacy jobs. | Engineering + QA | New configurable jobs produce correct XLSX with selected columns from analytics data. Row count parity with template path for same filters. | Disable feature flag → new jobs use template path. In-flight configurable jobs complete normally. |
| **Phase 3: Enhanced Filters** | Enable Tags and Inbox/Team filters on the filter panel. | Engineering | Filters populate from analytics data. Filtered exports contain only matching rows. | Filters hidden when flag disabled. |
| **Phase 4: Default Preset + Polish** | Enable "Default" preset pre-selection. localStorage memory for last selection. Job list enhancement (domain column, column snapshot). | Engineering + QA | Default preset loads on first visit. Job list shows domain and column snapshot. | UI-only changes. Disable flag hides enhancements. |
| **Data Backfill** | Column registry is seed data, not user data. No backfill needed. | — | — | — |
| **Rollback Strategy** | Feature-flag disable is the primary rollback. No data migration to undo. Analytics collections (PRD-A) are independent and unaffected. | Engineering | Flag disabled = system behaves exactly as before this feature. | Code rollback only if feature-flag mechanism fails. |

### **K. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `exportcolumnregistry` entries | analytics-service | Migration seed script | Permanent (no TTL) | Manual update when schema changes. No auto-delete. | Not exported (system metadata). | No PII in registry. |
| Column snapshot in job parameters | analytics-service | Job creation request | Tied to job retention (7 days from completion, then job expires) | Job expiry deletes job record. Column snapshot is embedded in job document. | Included in job parameter display. | No PII in column names. |
| PII acknowledgment audit record | analytics-service | Job creation (when `piiAcknowledged = true`) | Same as job retention + audit log retention (ASSUMED: 90 days) | Audit log retention per existing policy. | Not directly exported. Accessible via audit trail. | Records which user acknowledged PII columns. |
| Generated XLSX file | analytics-service → S3 | Job processing | 7 days from completion (reuse existing) | S3 lifecycle policy deletes after 7 days. | Downloaded via 15-min presigned URL. | File may contain PII if user selected PII columns. |
| User's last column selection | Browser localStorage | Client-side | Until user clears browser data | Browser-managed. No server-side storage. | Not exported. | No PII. Column names only. |

### **L. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| Duplicate configurable export job creation | Same requester submits identical job (same domain, columns, filters) while first is active | Dedup check: hash of `{requesterId, domainId, sorted(columns[]), sorted(filters)}`. If match found and existing job is QUEUED or PROCESSING, reject with "Permintaan yang sama masih diproses". | Submit identical job twice. Second must be rejected. |
| Double-click on Submit | Two rapid submissions | Same dedup mechanism catches this. Only one job created. | Rapid double-click. Single job row appears. |
| Rate limit: configurable export | Excessive job creation | Reuse existing rate limit: 10 jobs per hour per user. Applies to both template and configurable paths combined. | Create 11 jobs in 1 hour. 11th rejected. |
| Active job limit | Too many concurrent jobs | Reuse existing: max 1 active job per domain (channel) per user. | Submit second active job for same domain. Rejected. |
| Column registry update during active job | Registry entry deactivated between creation and processing | Processing re-validates columns against registry. If a selected column is now inactive, job FAILS with "Kolom tidak tersedia: {displayName}". | Deactivate a registry entry while a job is QUEUED. Job must fail at processing time. |
| Very large column × row output | Memory pressure during XLSX generation | Use streaming XLSX writer (ExcelJS). If memory exceeds threshold (ASSUMED: 512MB per worker), mark job FAILED with guidance message. No hard column cap, but warn at > 50 columns at submission time. | Submit job with 80 columns × 30-day range. Verify graceful handling. |
| Concurrent column registry reads | Multiple users loading picker simultaneously | Registry is read-only, tenant-agnostic. In-memory cache with 5-minute TTL. No locking needed. | Multiple simultaneous picker opens. All succeed within < 200ms. |
| XLSX generation timeout | Large export exceeds processing timeout | Reuse existing job timeout. If exceeded, job marked FAILED. User can retry with fewer columns or smaller date range. | Submit very large job. Verify timeout handling. |

### **M. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **Product Event** | `export_column_picker_opened` | User opens column picker | `domainId`, `userId`, `companyId` | Product/Data | — |
| **Product Event** | `export_pii_acknowledged` | User confirms PII column selection | `userId`, `companyId`, `piiColumns[]`, `domainId` | Product/Data | — |
| **Product Event** | `export_configurable_job_created` | Configurable export job submitted | `domainId`, `columnCount`, `hasPII`, `filterCount`, `userId` | Product/Data | — |
| **Product Event** | `export_default_preset_used` | User submits with default preset (no modifications) | `domainId`, `userId` | Product/Data | Track adoption of custom vs default selections. |
| **Metric** | `export_job_column_count` | Job created | `domainId`, `columnCount` | Engineering | Alert if median > 50 (may indicate UX issue). |
| **Metric** | `export_job_row_count` | Job completed | `domainId`, `rowCount` | Engineering | — |
| **Metric** | `export_job_generation_duration_ms` | Job completed/failed | `domainId`, `columnCount`, `rowCount`, `status` | Engineering | Alert if p95 > existing timeout threshold. |
| **Metric** | `export_job_file_size_bytes` | Job completed | `domainId`, `columnCount`, `rowCount`, `fileSize` | Engineering | Alert if > 500MB. |
| **Metric** | `export_column_registry_cache_hit_ratio` | Registry query | `hit`, `miss` | Engineering | Alert if < 80% hit ratio. |
| **Metric** | `export_column_registry_query_duration_ms` | Registry query | `cacheHit`, `duration` | Engineering | Alert if p95 > 200ms. |
| **Log** | `export_configurable_job_failed` | Job marked FAILED | `jobId`, `domainId`, `columnCount`, `failureReason` | Engineering | Alert if failure rate > 2%. |
| **Log** | `export_column_validation_error` | Job creation rejected due to invalid columns | `domainId`, `invalidColumns[]`, `userId` | Engineering | — |
| **Audit** | `export_job_created` | Job created (both paths) | `jobId`, `userId`, `domainId`, `pathType` (template/configurable), `columnCount`, `piiAcknowledged`, `filterSummary` | Engineering | — |
| **Audit** | `export_job_downloaded` | File downloaded | `jobId`, `userId`, `timestamp` | Engineering | — |

### **N. Glossary**

| Term | Definition |
| ----- | ----- |
| Column Registry | A MongoDB collection (`exportcolumnregistry`) that defines available export columns per domain with metadata (display name, type, category, PII flag). |
| Domain | The data entity type for export: `conversation`, `ticket`, or `broadcast`. Each domain maps to one analytics row-level collection. |
| Configurable Export | An export job where the user selects specific columns from the column registry, as opposed to using a fixed template. |
| Default Preset | A system-managed column selection per domain that includes all non-PII active columns. Pre-selected when user opens the picker. |
| PII Acknowledgment | A user confirmation action required when selecting columns flagged as containing Personally Identifiable Information. |
| Dynamic Query Builder | The backend component that translates `{domain, columns[], filters}` into a MongoDB aggregation pipeline over the corresponding analytics collection. |
| Streaming XLSX Writer | A technique for generating XLSX files row-by-row without loading the entire dataset into memory, using ExcelJS streaming API. |
| Legacy Template Path | The existing export mechanism where columns are determined by a fixed template (Default Ticket, per-TicketType, Default Conversation). |

### **O. Source References**

| Reference | Path | Relevance |
| ----- | ----- | ----- |
| Change Intake Brief v3.0 | `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` | §5B export flexibility gap, OQ-3 (custom column picker), OQ-15 (column registry granularity) |
| PRD-A: Row-Level Collections | `PRD/Analytics/Export/PRD Analytics - Export Row-Level Collections (Foundation).md` | §10.1/10.2/10.3 field definitions (source for column registry), FR-001 to FR-040 (collections this PRD reads from) |
| Sibling PRD: Offline Report Download | `PRD/Analytics/PRD Analytics - offline report download.md` | Existing export UX, RBAC, retention, job lifecycle, rate limits, UI components to extend |
| Cross-Domain SAP Brief (consumed) | `Assessments/cross-domain/sap-report-export/` | SAP column specs — referenced for Sub-PRD D, not directly used here |
| Global Memory | `Memory/global-memory.md` | Canonical product rules, protected behavior |
| BE Architecture Reference | `Memory/CLAUDE-be.md` | analytics-service ownership, service topology, proto-first, RabbitMQ conventions |
| PRD Writing Rule | `Rules/prd-writing-rule.md` | Template structure, mandatory sections |
