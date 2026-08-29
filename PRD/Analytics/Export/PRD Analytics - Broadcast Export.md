# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Broadcast Export (Recipient + Campaign Level)
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: TBD

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD for Sub-PRD C: broadcast export with recipient-level + campaign-level granularity, broadcast-specific filters, and column picker integration. |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Extend the configurable column export system (PRD-B) to the broadcast domain with broadcast-specific UX: recipient-level and campaign-level granularity toggle, broadcast-specific filters (channel, status, creator, team inbox), and redirect from Broadcast page. Supersedes the legacy §17 "Default Broadcast" fixed-template approach. |
| Scope | Broadcast domain in column picker with recipient-level and campaign-level export modes. Broadcast-specific filter UI. Campaign-level aggregation pipeline. Redirect from Broadcast > Messages > Export. Feature-flagged migration from §17 legacy template. |
| Key Capabilities | (1) Recipient-level granularity: 1 row = 1 broadcast recipient from `broadcastexportdata`. (2) Campaign-level granularity: 1 row = 1 broadcast campaign with aggregate counts (total, success, failed, etc.). (3) Broadcast-specific filters: broadcast channel, broadcast status, creator, team inbox, date type selector. (4) Seamless integration with PRD-B's column picker, query builder, and streaming XLSX. (5) Feature-flagged coexistence with §17 legacy template during migration. |
| Outcome | Admin and Supervisor users can export broadcast data at either recipient or campaign granularity, with configurable column selection and broadcast-specific filtering, replacing the fixed-template approach. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Broadcast domain column picker (using PRD-B registry, `domainId = broadcast`) | Column registry definition and population → PRD-B |
| Granularitas toggle: Per Penerima (recipient-level) vs Per Kampanye (campaign-level) | Dynamic query builder core infrastructure → PRD-B |
| Broadcast-specific filters: channel, status, creator, team inbox, date type | XLSX generation infrastructure → PRD-B |
| Campaign-level aggregation pipeline (MongoDB aggregation on `broadcastexportdata`) | `broadcastexportdata` collection schema + event-driven sync → PRD-A |
| Column set for campaign-level (aggregate columns) | Conversation/ticket export → PRD-B |
| Redirect from Broadcast > Messages > Export with prefill | SAP 4-sheet template → Sub-PRD D |
| Feature-flagged migration from §17 legacy template | User-saved presets (P2 — future) |
| Campaign-level computed columns in column registry | Email delivery of export results |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Current broadcast export uses a fixed "Default Broadcast" template (§17) — users cannot choose which columns to include or exclude. | Users must export all 22 columns even when they need a subset, producing oversized files with unnecessary data. |
| PS-002 | No campaign-level broadcast export exists — only recipient-level data is available. | Managers and supervisors who need campaign performance summaries (total recipients, success rate, failure count) must manually aggregate recipient-level exports in spreadsheets. |
| PS-003 | Broadcast export has no column picker integration with PRD-B. | Broadcast is left behind as conversation and ticket exports move to configurable columns, creating inconsistent UX. |
| PS-004 | No granular date type selection for broadcast exports. | Users cannot distinguish between `createdAt` (when broadcast was created) and `scheduledAt` (when broadcast was scheduled to send), limiting reporting precision. |
| PS-005 | No broadcast-specific filter for creator or team inbox in configurable export. | Users cannot narrow broadcast exports to a specific creator or team without post-export filtering. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enable configurable column selection for broadcast exports | 100% of broadcast export jobs after launch use the column picker (no more implicit Default Broadcast template path once migration is complete). |
| Provide campaign-level broadcast summaries | Users can export 1-row-per-campaign with aggregate counts (total recipients, delivered, failed, etc.) without manual spreadsheet aggregation. |
| Reduce broadcast export file size for targeted use cases | Median broadcast export file size decreases by ≥ 30% for jobs using fewer than full column sets. |
| Maintain PII governance awareness for broadcast PII fields | 100% of broadcast jobs containing PII columns (recipientNumber, recipientName, senderNumber) require explicit user acknowledgment before submission. |
| Preserve existing broadcast export job reliability | Job completion rate remains ≥ 98% (matching existing offline-report KPI). |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to select "Broadcast" as Jenis Laporan so I can export broadcast data from the Offline Report page. | 1. Given I open the Offline Report page, When I select "Broadcast" as Jenis Laporan, Then the column picker shows broadcast-domain columns grouped by category. 2. Given I switch from "Broadcast" to "Tiket", When the picker reloads, Then broadcast-specific filters are hidden and column selections are cleared. 3. Given I select "Broadcast", When the form updates, Then broadcast-specific filters (channel, status, creator, team inbox, granularitas, date type) appear. |
| US-002 | P0 | As an Admin, I want to choose between recipient-level and campaign-level granularity so I can export data at the right level of detail. | 1. Given I select "Broadcast", When I view the Granularitas toggle, Then I see "Per Penerima" (recipient-level) and "Per Kampanye" (campaign-level). 2. Given I select "Per Kampanye", When the column picker updates, Then campaign-level aggregate columns are shown (e.g. Total Penerima, Berhasil, Gagal). 3. Given I switch from "Per Kampanye" to "Per Penerima", When the picker reloads, Then recipient-level columns are shown and campaign-level selections are cleared. |
| US-003 | P0 | As an Admin, I want to pick specific broadcast columns from a searchable list so I can export only the data I need. | 1. Given the column picker is open for Broadcast domain, When I search for "status", Then all broadcast columns with "status" in display name or description are shown. 2. Given I expand the "Status & Lifecycle" category, When I view the columns, Then I see broadcast status fields with checkboxes. 3. Given I select 8 columns, When I submit the job, Then the XLSX contains only those 8 columns as headers. |
| US-004 | P0 | As an Admin, I want to filter broadcast exports by broadcast channel so I can separate API, WhatsApp Web, and Open API records. | 1. Given I select "Broadcast", When I view the Broadcast Channel filter, Then I see multi-select with options "API", "WhatsApp Web", "Open API". 2. Given I select "Open API", When I submit, Then only broadcast records from Open API are exported. 3. Given I leave Channel empty, When I submit, Then all broadcast channels within my permission scope are included. |
| US-005 | P0 | As an Admin, I want to filter broadcast exports by broadcast status so I can focus on specific statuses. | 1. Given I select "Broadcast", When I open the Status filter, Then I see only broadcast statuses: SUCCESS, IN_PROGRESS, SCHEDULED, FAILED, CANCELED, INVALID_NUMBER, INVALID_REQUEST. 2. Given I select "FAILED" and "INVALID_REQUEST", When I submit, Then only rows with those statuses are exported. 3. Given I leave Status empty, When I submit, Then all broadcast statuses are included. |
| US-006 | P0 | As an Admin, I want to choose between createdAt and scheduledAt as the date type so I can filter by when the broadcast was created or when it was scheduled. | 1. Given I select "Broadcast", When I view the Date Type selector, Then I see "Tanggal Dibuat" (createdAt) and "Tanggal Terjadwal" (scheduledAt). 2. Given I select "Tanggal Terjadwal" and set a date range, When I submit, Then only broadcasts scheduled within that range are exported. 3. Given I select "Tanggal Dibuat", When I submit, Then the date range filters by broadcast creation time. |
| US-007 | P0 | As an Admin, I want to filter by Creator and Team Inbox so I can export broadcasts for a specific person or team. | 1. Given I select "Broadcast", When I open the Creator filter, Then I see a multi-select of users who created broadcasts within my permission scope. 2. Given I select specific creators, When I submit, Then only broadcasts created by those users are exported. 3. Given I select a Team Inbox, When I submit, Then only broadcasts sent from that team inbox are included. |
| US-008 | P0 | As an Admin, I want campaign-level exports to show aggregate counts per broadcast so I can see broadcast performance at a glance. | 1. Given I select "Per Kampanye" granularity, When the XLSX is generated, Then each row represents one broadcast campaign. 2. Given a broadcast campaign sent to 1000 recipients (800 SUCCESS, 150 FAILED, 50 INVALID_NUMBER), When exported, Then the row shows Total Penerima=1000, Berhasil=800, Gagal=150, Nomor Tidak Valid=50. 3. Given I select campaign-level columns [broadcastName, totalRecipients, successCount, failedCount], When exported, Then headers use Bahasa display names from the registry. |
| US-009 | P0 | As a Supervisor, I want broadcast export scoped to my Team Inbox permission so I do not export other team's broadcast data. | 1. Given I am a Supervisor, When I submit a broadcast export job, Then only broadcasts within my accessible Team Inbox scope are included. 2. Given I am a Supervisor, When I view the Creator filter, Then I see only creators within my Team Inbox scope. 3. Given I am a Supervisor, When I view the job list, Then I see only my own broadcast export jobs. |
| US-010 | P0 | As an Admin, I want PII columns flagged with a warning so I can make an informed decision before exporting recipient phone numbers. | 1. Given I select recipientNumber and recipientName, When I attempt to submit, Then a PII confirmation dialog appears. 2. Given I cancel the PII confirmation, When the dialog closes, Then PII columns are deselected. 3. Given I confirm the PII warning, When submission proceeds, Then the PII acknowledgment is recorded in the job audit log. |
| US-011 | P0 | As an Admin, I want the redirect from Broadcast > Messages > Export to prefill the report type and filters so I can quickly export. | 1. Given I click Export from Broadcast > Messages page, When the Offline Report page opens, Then Jenis Laporan is prefilled as "Broadcast". 2. Given the redirect passes date range and filters, When the form loads, Then Date Range, Status, Broadcast Channel, Creator, and Team Inbox are prefilled if available. 3. Given I review the prefilled values, When I modify them, Then the updated values are used for the export job. |
| US-012 | P1 | As an Admin, I want the export XLSX to contain exactly the columns I selected in the order I selected them with Bahasa display names as headers. | 1. Given I select columns [broadcastName, broadcastChannel, recipientNumber, status], When the XLSX is generated, Then headers are [Nama Broadcast, Channel Broadcast, Nomor Penerima, Status] in that order. 2. Given a field value is null for a row, When exported, Then the cell shows "-". 3. Given I select campaign-level columns, When exported, Then aggregate column headers use Bahasa names (Total Penerima, Berhasil, Gagal, etc.). |
| US-013 | P1 | As an Admin, I want invalid Open API requests included in broadcast exports so I can audit integration issues. | 1. Given an Open API payload is invalid, When the broadcast report is generated, Then the row appears with status `INVALID_REQUEST`. 2. Given the invalid payload has multiple errors, When exported, Then `reason` contains all validation failures. 3. Given no broadcast object was created, When exported, Then `broadcastId` may be empty but `requestId`, `status`, and `reason` are filled. |
| US-014 | P1 | As an Admin, I want the column picker to remember my last broadcast selection so I do not have to re-pick columns every time. | 1. Given I previously exported broadcast with columns [A, B, C], When I open the column picker for Broadcast domain again, Then those columns are pre-selected. 2. Given I switch granularity, When the picker reloads, Then the remembered selection is for the new granularity mode. |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| **Domain Registration** | FR-001 [P0]: System MUST support `domainId = broadcast` in the column picker, query builder, and export job pipeline. FR-002 [P0]: System MUST register broadcast-domain columns in `exportcolumnregistry` for both recipient-level and campaign-level granularity. FR-003 [P0]: Recipient-level columns MUST map 1:1 to `broadcastexportdata` collection fields (PRD-A §10.3 — 27+ fields). FR-004 [P0]: Campaign-level columns MUST include aggregate computed columns not present in the collection (totalRecipients, successCount, failedCount, etc. — see Appendix A). |
| **Granularitas Toggle** | FR-005 [P0]: System MUST provide a "Granularitas" toggle on the Broadcast export form with values "Per Penerima" (recipient-level) and "Per Kampanye" (campaign-level). FR-006 [P0]: Default granularitas MUST be "Per Penerima". FR-007 [P0]: When granularitas changes, system MUST reload the column picker with columns appropriate for the selected granularity. FR-008 [P0]: System MUST store selected granularitas in the job parameter snapshot. FR-009 [P0]: Column selections MUST be cleared when granularitas changes (columns valid for one granularity are not valid for the other). |
| **Broadcast-Specific Filters** | FR-010 [P0]: System MUST show a Broadcast Channel multi-select filter (API, WhatsApp Web, Open API) when Jenis Laporan = Broadcast. Reuse §17 AFR-014 values. FR-011 [P0]: Broadcast status options MUST be: SUCCESS, IN_PROGRESS, SCHEDULED, FAILED, CANCELED, INVALID_NUMBER, INVALID_REQUEST. Reuse §17 AFR-019. FR-012 [P0]: System MUST provide a Creator multi-select filter populated from `creatorUserId`/`creatorName` values in `broadcastexportdata` for the requester's tenant and permission scope. FR-013 [P0]: System MUST provide a Team Inbox multi-select filter populated from `teamInboxIdAtSendTime`/`teamInboxNameAtSendTime` values in `broadcastexportdata` for the requester's permission scope. FR-014 [P0]: System MUST provide a Date Type selector with options "Tanggal Dibuat" (maps to `createdAt`) and "Tanggal Terjadwal" (maps to `scheduledAt`). FR-015 [P0]: Default Date Type MUST be "Tanggal Dibuat". FR-016 [P0]: System MUST store all broadcast-specific filters (channel, status, creator, team inbox, date type) in the job parameter snapshot. FR-017 [P0]: Empty Broadcast Channel selection MUST mean all channels within scope. FR-018 [P0]: Empty Status selection MUST mean all broadcast statuses. FR-019 [P0]: Empty Creator selection MUST mean all creators within scope. FR-020 [P0]: Empty Team Inbox selection MUST mean all team inboxes within scope. |
| **Campaign-Level Aggregation** | FR-021 [P0]: When granularitas = "Per Kampanye", system MUST execute a MongoDB aggregation pipeline that groups `broadcastexportdata` rows by `broadcastId`. FR-022 [P0]: Campaign-level aggregation MUST produce per-broadcast aggregate counts: totalRecipients, successCount, inProgressCount, scheduledCount, failedCount, canceledCount, invalidNumberCount, invalidRequestCount. FR-023 [P0]: Campaign-level rows MUST carry broadcast-level metadata from the first (or any) row in the group: broadcastName, broadcastChannel, source, createdAt, scheduledAt, creatorUserId, creatorName, teamInboxIdAtSendTime, teamInboxNameAtSendTime, senderAccountName, senderNumber, templateUsed. FR-024 [P0]: Campaign-level aggregation MUST be scoped by the same tenant and filter criteria (date range, channel, status, creator, team inbox). FR-025 [P0]: Campaign-level aggregation MUST group by `{companyId, organizationId, broadcastId}`. For INVALID_REQUEST rows without `broadcastId`, system MUST group by `requestId` as fallback. |
| **Query Builder Extension** | FR-026 [P0]: Dynamic query builder (PRD-B) MUST support broadcast-specific filter parameters: `broadcastChannel[]`, `creatorUserIds[]`, `teamInboxIds[]`, `dateType` (createdAt or scheduledAt). FR-027 [P0]: When `dateType = scheduledAt`, query builder MUST filter on `scheduledAt` field instead of `createdAt` for the date range. FR-028 [P0]: When `dateType = scheduledAt` and `scheduledAt` is null (non-scheduled broadcasts), those rows MUST be excluded from the result set. FR-029 [P0]: When granularitas = "Per Kampanye", query builder MUST switch to aggregation pipeline mode (group + project) instead of simple find + project. |
| **Column Registry — Campaign-Level** | FR-030 [P0]: System MUST register campaign-level computed columns in `exportcolumnregistry` with `domainId = broadcast` and a `granularity = campaign` discriminator. FR-031 [P0]: Campaign-level columns MUST include: `broadcastId`, `broadcastName`, `broadcastChannel`, `source`, `createdAt`, `scheduledAt`, `creatorUserId`, `creatorName`, `teamInboxIdAtSendTime`, `teamInboxNameAtSendTime`, `senderAccountName`, `senderNumber`, `templateUsed`, `totalRecipients`, `successCount`, `inProgressCount`, `scheduledCount`, `failedCount`, `canceledCount`, `invalidNumberCount`, `invalidRequestCount`. FR-032 [P0]: Recipient-level columns MUST NOT appear in the picker when granularitas = "Per Kampanye". FR-033 [P0]: Campaign-level columns MUST NOT appear in the picker when granularitas = "Per Penerima". |
| **Redirect from Broadcast Page** | FR-034 [P0]: System MUST redirect Broadcast > Messages > Export to the Offline Report Download page. Reuse §17 AFR-032. FR-035 [P0]: Redirect MUST prefill Jenis Laporan as "Broadcast". Reuse §17 AFR-033. FR-036 [P1]: Redirect SHOULD prefill Date Range, Status, Broadcast Channel, Creator, and Team Inbox when values are available from the source context. Reuse §17 AFR-034. FR-037 [P0]: User MUST be able to review and edit prefilled values before submitting the job. Reuse §17 AFR-035. |
| **Backward Compatibility** | FR-038 [P0]: During migration, legacy "Default Broadcast" template (§17 AFR-009) MUST continue to function in parallel with configurable column approach. FR-039 [P0]: System MUST support both creation paths: (a) legacy template-based (`templateId = Default Broadcast`) and (b) configurable column-based (`domainId = broadcast`, `columns[]`, `granularity`). FR-040 [P0]: When `columns[]` is provided with `domainId = broadcast`, system MUST use the configurable path. When `templateId = Default Broadcast` is provided without `columns[]`, system MUST use the legacy template path. |
| **PII Handling** | FR-041 [P0]: Recipient-level PII fields (recipientNumber, recipientName, senderNumber) MUST be flagged with `isPII: true` in the column registry. FR-042 [P0]: PII confirmation flow MUST match PRD-B's PII confirmation dialog (same UX, same audit recording). FR-043 [P0]: Campaign-level exports MUST NOT include recipient-level PII columns (recipientNumber, recipientName are not available at campaign level). |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Granularitas value is missing or invalid. Reject job creation. | "Pilih granularitas: Per Penerima atau Per Kampanye". |
| EH-002 | Validation | Columns selected are not valid for the chosen granularitas. Reject job creation. | "Kolom tidak tersedia untuk granularitas yang dipilih". |
| EH-003 | Validation | Broadcast Channel contains unsupported value. Reject job creation. | "Channel broadcast tidak valid". |
| EH-004 | Validation | Broadcast Status contains non-broadcast status (e.g. UNASSIGNED). Reject job creation. | "Status tidak valid untuk broadcast". |
| EH-005 | Validation | Date Type is missing or invalid. Reject job creation. | "Pilih tipe tanggal: Tanggal Dibuat atau Tanggal Terjadwal". |
| EH-006 | Validation | Creator or Team Inbox filter values are outside requester's permission scope. Reject job creation. | "Akses ditolak". |
| EH-007 | Processing | Campaign-level aggregation pipeline times out or exceeds memory. Mark job FAILED. | "Gagal membuat laporan. Coba kurangi rentang tanggal atau filter yang lebih spesifik". |
| EH-008 | Processing | broadcastId is null for INVALID_REQUEST rows and requestId is also null. Group as "Unknown Campaign" in campaign-level aggregation. | No UI — rows grouped under fallback key. |
| EH-009 | PII | User selects PII columns without confirming. Block submission. | "Konfirmasi kolom PII diperlukan". |
| EH-010 | Empty Result | Broadcast job completes with zero matching rows. | Headers-only XLSX. "Laporan selesai tanpa data". |
| EH-011 | Duplicate | Identical job (same requester, domain, columns, filters, granularitas) already active. Block creation. | "Permintaan yang sama masih diproses". |
| EH-012 | Permission | Supervisor submits broadcast export with filters outside scope. System re-scopes at processing time. | If zero rows after scoping, job completes with headers-only XLSX. |
| EH-013 | Stale Column | Column deactivated between job creation and processing. Mark job FAILED. | "Kolom tidak tersedia: {displayName}". |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | INVALID_REQUEST row has no broadcastId and no requestId | System groups under a synthetic key `{companyId}:{organizationId}:UNKNOWN`. Campaign-level aggregation includes these under "Unknown Campaign" row. | No crash. Row appears in XLSX. |
| EC-002 | User switches from "Per Kampanye" to "Per Penerima" after selecting 10 campaign-level columns | Column picker clears selections and reloads recipient-level columns. | Brief loading state, then picker shows recipient columns with no pre-selection. |
| EC-003 | User selects "Tanggal Terjadwal" but most broadcasts are not scheduled (scheduledAt = null) | Those rows are excluded from the date-filtered result. Export may have fewer rows than expected. | No error. User chose scheduledAt filter — non-scheduled broadcasts are intentionally excluded. |
| EC-004 | Very large campaign (500K+ recipients) in campaign-level aggregation | MongoDB aggregation groups all 500K rows into 1 campaign row. Aggregation is CPU-intensive but result set is small. | Job may take longer than recipient-level. Progress indicator shows processing status. |
| EC-005 | Broadcast has recipients across multiple team inboxes | Campaign-level aggregation groups by broadcastId regardless of team inbox variation. Team inbox metadata is taken from the first row or most common value. | Single campaign row in XLSX. |
| EC-006 | User selects broadcast domain but Sub-PRD B infrastructure is not yet deployed | Job creation is blocked by feature flag. | "Fitur export konfigurabel belum tersedia. Gunakan template Default Broadcast". |
| EC-007 | Redirect from Broadcast page passes filters that are no longer valid (e.g. deleted team inbox) | Invalid filter values are silently dropped. User sees editable form with valid values prefilled. | Optional banner: "Beberapa filter tidak tersedia". |
| EC-008 | Legacy "Default Broadcast" template job submitted while configurable column system is active | Both paths work in parallel. Job list shows "Template: Default Broadcast" for legacy jobs. | Backward compatible display. |
| EC-009 | User selects > 50 columns for recipient-level broadcast export | Warning displayed: "Anda memilih lebih dari 50 kolom. Proses export mungkin lebih lama." Job proceeds. | Warning toast, non-blocking. |
| EC-010 | Campaign-level export with all columns selected (21 columns) | Job proceeds. Only 21 columns available for campaign-level (no recipient PII). | No special behavior. |
| EC-011 | Date type selector not visible for conversation/ticket domains | Date Type selector is broadcast-specific. For conversation/ticket, date type is always "Tanggal Dibuat" (no toggle needed). | Date Type selector hidden for non-broadcast domains. |
| EC-012 | Supervisor's Team Inbox scope changes between job creation and job processing | Processing uses current scope at execution time, not creation time. Job may produce fewer rows than expected. | No error. |

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Jenis Laporan Selector | Extended to include "Broadcast" alongside "Tiket" and "Percakapan". | Selecting "Broadcast" triggers broadcast filter panel + column picker reload. | US-001 |
| Granularitas Toggle | New component: radio button or segmented control with "Per Penerima" and "Per Kampanye". Visible only when Jenis Laporan = Broadcast. | Changing granularity reloads column picker with appropriate column set. | US-002 |
| Column Picker (Broadcast) | Same component as PRD-B column picker, loaded with broadcast-domain columns filtered by selected granularitas. | User browses/searches broadcast columns, checks desired columns. | US-003, US-008 |
| Broadcast Channel Filter | Multi-select dropdown. Options: API, WhatsApp Web, Open API. Visible only for Broadcast. | User selects one or more channels. Empty = all. | US-004 |
| Broadcast Status Filter | Multi-select dropdown. Options: SUCCESS, IN_PROGRESS, SCHEDULED, FAILED, CANCELED, INVALID_NUMBER, INVALID_REQUEST. Visible only for Broadcast. | User selects one or more statuses. Empty = all. | US-005 |
| Date Type Selector | Radio or segmented control: "Tanggal Dibuat" / "Tanggal Terjadwal". Visible only for Broadcast. | User selects date type. Date range filter applies to selected type. | US-006 |
| Creator Filter | Multi-select dropdown with search. Populated from broadcastexportdata creator values within scope. | User selects one or more creators. Empty = all. | US-007 |
| Team Inbox Filter | Multi-select dropdown with search. Populated from broadcastexportdata team inbox values within scope. | User selects one or more team inboxes. Empty = all. | US-007 |
| PII Confirmation Dialog | Same dialog as PRD-B. Triggered when recipient-level PII columns (recipientNumber, recipientName, senderNumber) are selected. | User reviews PII columns and confirms or cancels. | US-010 |
| Redirected Export State | From Broadcast > Messages > Export, page loads with Broadcast prefilled and filters populated. | User reviews and edits prefilled values before submitting. | US-011 |
| Loading State | Column picker shows skeleton/shimmer while registry loads for selected domain + granularitas. | Brief loading on granularitas change. | — |
| Empty State | "Tidak ada kolom tersedia" if registry returns empty for selected granularitas. | Shown when registry query fails or returns no results. | — |

## **10. Field & Validation**

### **10.1 Job Creation Payload (Broadcast-Specific Additions)**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `domainId` | string enum | `broadcast` | Must be `broadcast` for this flow. | Yes | — |
| `columns` | string[] | `["broadcastName", "recipientNumber", "status"]` | Min 1 item. All values must exist and be active in `exportcolumnregistry` for `domainId = broadcast` + selected granularitas. | Yes | — |
| `granularity` | string enum | `recipient` | Must be `recipient` or `campaign`. | Yes | `recipient` |
| `filters.broadcastChannel` | string[] | `["Open API", "API"]` | Valid values: API, WhatsApp Web, Open API. | No | All channels |
| `filters.status` | string[] | `["SUCCESS", "FAILED"]` | Valid broadcast status codes. | No | All statuses |
| `filters.creatorUserIds` | string[] | `["USR-123", "USR-456"]` | Must be within requester permission scope. | No | All creators |
| `filters.teamInboxIds` | string[] | `["TIN-123"]` | Must be within requester permission scope. | No | All teams |
| `filters.dateType` | string enum | `createdAt` | Must be `createdAt` or `scheduledAt`. | Yes | `createdAt` |
| `filters.dateRange.start` | Date | `2026-03-01T00:00:00+07:00` | Valid datetime. Must be before end. | Yes | — |
| `filters.dateRange.end` | Date | `2026-03-30T23:59:59+07:00` | Valid datetime. Range ≤ 30 days inclusive. | Yes | — |
| `piiAcknowledged` | boolean | `true` | Required `true` when any column in `columns[]` has `isPII: true`. Only applicable for recipient-level. | Conditional | `false` |

### **10.2 Campaign-Level Aggregate Column Definitions**

| fieldPath | displayName | dataType | category | Description | isComputed |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `totalRecipients` | Total Penerima | number | Statistik Kampanye | Total rows grouped by broadcastId. | true |
| `successCount` | Berhasil | number | Statistik Kampanye | Count where status = SUCCESS. | true |
| `inProgressCount` | Diproses | number | Statistik Kampanye | Count where status = IN_PROGRESS. | true |
| `scheduledCount` | Terjadwal | number | Statistik Kampanye | Count where status = SCHEDULED. | true |
| `failedCount` | Gagal | number | Statistik Kampanye | Count where status = FAILED. | true |
| `canceledCount` | Dibatalkan | number | Statistik Kampanye | Count where status = CANCELED. | true |
| `invalidNumberCount` | Nomor Tidak Valid | number | Statistik Kampanye | Count where status = INVALID_NUMBER. | true |
| `invalidRequestCount` | Request Tidak Valid | number | Statistik Kampanye | Count where status = INVALID_REQUEST. | true |
| `successRate` | Tingkat Keberhasilan | number | Statistik Kampanye | successCount / totalRecipients * 100 (percentage, 2 decimal). | true |

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance** | NFR-001: Recipient-level broadcast export MUST have comparable performance to conversation/ticket export (same query builder path). NFR-002: Campaign-level aggregation pipeline MUST complete within 2× the time of an equivalent recipient-level query for the same filters. NFR-003: Column registry query for broadcast domain MUST return in < 200ms at p95. NFR-004: Granularitas toggle column picker reload MUST render within 500ms. |
| **Reliability** | NFR-005: Broadcast export job MUST be idempotent per job ID (reuse existing). NFR-006: Column validation MUST be performed at job creation time AND at job processing time (double-check against stale registry). NFR-007: Campaign-level aggregation MUST handle broadcastId=null rows gracefully without pipeline failure. |
| **Security** | NFR-008: All broadcast export queries MUST be scoped by `companyId` + `organizationId` (matching PRD-A). NFR-009: PII column selection for recipient-level MUST be audited with user acknowledgment timestamp. NFR-010: Supervisor scope MUST be enforced at query time for broadcast exports. NFR-016: Broadcast Advance Export is available to all subscription tiers. Only SAP preset requires Enterprise + PKS. |
| **Privacy** | NFR-011: Recipient-level PII fields (recipientNumber, recipientName, senderNumber) MUST show explicit warning. NFR-012: Campaign-level exports MUST NOT expose individual recipient PII. |
| **Observability** | NFR-013: Job metrics MUST include: `granularity` (recipient/campaign), `column_count`, `row_count`, `generation_duration_ms`, `file_size_bytes`, `domain`, `status`. NFR-014: Campaign-level aggregation metrics MUST include: `aggregation_duration_ms`, `group_count`. |
| **Localization** | NFR-015: All broadcast-specific UI labels, filter labels, column display names, and error messages MUST be in Bahasa Indonesia. |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| PRD-A: `broadcastexportdata` collection must exist and be populated. | Engineering (PRD-A) | **Blocking.** Empty collection = empty exports. | Feature-flag: broadcast configurable export only enabled after PRD-A broadcast backfill is complete. |
| PRD-B: Column registry, column picker UI, dynamic query builder, streaming XLSX must be available. | Engineering (PRD-B) | **Blocking for configurable path.** Legacy template path remains as fallback. | Feature-flag coexistence. PRD-C extends PRD-B infrastructure — cannot ship before PRD-B core. |
| PRD-B: Column registry must support domain discriminator for granularitas-level column filtering. | Engineering (PRD-B) | If registry does not support granularitas filter, campaign-level and recipient-level columns will mix in picker. | Extend registry schema with `granularity` field or use category-based filtering. |
| Campaign-level MongoDB aggregation performance on large datasets. | Engineering | Aggregation on millions of broadcast rows may be slow. | Ensure compound index on `{companyId, organizationId, broadcastId, status}`. Test with production-scale data. |
| §17 legacy template coexistence during migration period. | Product / Engineering | Two export paths for broadcast may confuse users. | Clear UI labeling. Feature flag for gradual rollout. Deprecation notice when PRD-C is stable. |
| Redirect URL construction from Broadcast > Messages > Export page. | Engineering (Frontend) | If redirect URL params are not correctly passed, prefill will not work. | Document redirect URL param spec. Integration test. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Broadcast configurable export adoption rate | ≥ 80% of new broadcast export jobs use column picker (vs legacy template) | 30 days post-launch | Job creation logs (`columns[]` vs `templateId`) |
| Campaign-level export usage | ≥ 20% of broadcast export jobs use campaign-level granularity | 30 days post-launch | Job creation logs (`granularity` field) |
| Median broadcast export file size reduction | ≥ 30% smaller than full-template export for same filters | 30 days post-launch | Job metrics (`file_size_bytes`) |
| PII acknowledgment rate | 100% of recipient-level PII-containing jobs have `piiAcknowledged: true` | Ongoing | Job audit trail |
| Job completion rate (broadcast configurable path) | ≥ 98% | 30 days post-launch | Job status metrics |
| Campaign-level aggregation p95 duration | < 30 seconds for 1M recipient rows | Ongoing | `aggregation_duration_ms` metric |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| User-saved presets for broadcast columns | Power users want to save and reuse broadcast column selections across export jobs (P2 — deferred from PRD-B). |
| Campaign-level drill-down | From campaign-level export, users may want to click through to recipient-level detail for a specific campaign. |
| Scheduled broadcast exports | Recurring broadcast exports (daily/weekly campaign summaries) delivered via email. |
| Campaign-level dashboard integration | Campaign-level aggregation could feed a broadcast performance dashboard beyond just export. |
| Real-time campaign-level aggregation | If campaign-level stats are needed in near-real-time, a pre-aggregated collection may be preferred over on-demand aggregation. |
| Multi-date-type filter | Allow filtering by both createdAt and scheduledAt simultaneously (OR logic). |

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Campaign-level aggregation is on-demand MongoDB aggregation, not pre-computed. | Campaign-level exports may be slower than recipient-level for very large datasets. No separate campaign-level collection exists. |
| Campaign-level aggregate columns are computed at export time, not at sync time. | Aggregate values reflect the state of `broadcastexportdata` at query time. If sync lag exists, recent broadcasts may have incomplete aggregate counts. |
| Granularitas column picker relies on registry schema extension (granularity discriminator). | Until PRD-B registry supports this discriminator, column filtering may use category-based workaround. |
| Date Type selector is broadcast-specific. | Conversation and ticket domains do not have this toggle. If future domains need multiple date types, a more generic mechanism is needed. |
| Redirect prefill depends on Broadcast page passing correct URL params. | If source page does not pass filters, prefill will be partial. |
| Legacy §17 template coexists during migration period. | Users may see two paths for broadcast export temporarily. Clear labeling required. |

## **16. Appendix**

### **A. Campaign-Level Aggregation Pipeline Specification**

MongoDB aggregation pipeline for `granularity = campaign`:

```javascript
// Stage 1: Match — tenant scope + filters
{
  $match: {
    companyId: "<companyId>",
    organizationId": "<organizationId>",
    // Date filter on selected dateType
    [dateTypeField]: { $gte: startDate, $lte: endDate },  // dateTypeField = "createdAt" or "scheduledAt"
    // Optional filters
    ...(broadcastChannel.length && { broadcastChannel: { $in: broadcastChannel } }),
    ...(status.length && { status: { $in: status } }),
    ...(creatorUserIds.length && { creatorUserId: { $in: creatorUserIds } }),
    ...(teamInboxIds.length && { teamInboxIdAtSendTime: { $in: teamInboxIds } })
  }
}

// Stage 2: Group by broadcastId (with null fallback to requestId)
{
  $group: {
    _id: {
      broadcastId: { $ifNull: ["$broadcastId", "$requestId"] }
    },
    // Broadcast-level metadata (first value in group)
    broadcastName: { $first: "$broadcastName" },
    broadcastChannel: { $first: "$broadcastChannel" },
    source: { $first: "$source" },
    createdAt: { $first: "$createdAt" },
    scheduledAt: { $first: "$scheduledAt" },
    creatorUserId: { $first: "$creatorUserId" },
    creatorName: { $first: "$creatorName" },
    teamInboxIdAtSendTime: { $first: "$teamInboxIdAtSendTime" },
    teamInboxNameAtSendTime: { $first: "$teamInboxNameAtSendTime" },
    senderAccountName: { $first: "$senderAccountName" },
    senderNumber: { $first: "$senderNumber" },
    templateUsed: { $first: "$templateUsed" },
    // Aggregate counts
    totalRecipients: { $sum: 1 },
    successCount: { $sum: { $cond: [{ $eq: ["$status", "SUCCESS"] }, 1, 0] } },
    inProgressCount: { $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] } },
    scheduledCount: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
    failedCount: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
    canceledCount: { $sum: { $cond: [{ $eq: ["$status", "CANCELED"] }, 1, 0] } },
    invalidNumberCount: { $sum: { $cond: [{ $eq: ["$status", "INVALID_NUMBER"] }, 1, 0] } },
    invalidRequestCount: { $sum: { $cond: [{ $eq: ["$status", "INVALID_REQUEST"] }, 1, 0] } }
  }
}

// Stage 3: Project — select only user-chosen columns + rename _id back to broadcastId
{
  $project: {
    _id: 0,
    broadcastId: "$_id.broadcastId",
    broadcastName: 1,
    broadcastChannel: 1,
    // ... only columns user selected ...
    totalRecipients: 1,
    successCount: 1,
    // successRate computed post-aggregation or in $addFields
  }
}

// Stage 4 (optional): Add computed fields
{
  $addFields: {
    successRate: {
      $cond: [
        { $eq: ["$totalRecipients", 0] },
        0,
        { $round: [{ $multiply: [{ $divide: ["$successCount", "$totalRecipients"] }, 100] }, 2] }
      ]
    }
  }
}
```

**Performance notes:**
- Pipeline benefits from compound index: `{companyId, organizationId, broadcastId, status}`.
- For 1M recipient rows, aggregation produces ~1K–10K campaign rows. Aggregation should complete in < 30s with proper indexing.
- ponytail: MongoDB aggregation is sufficient on-demand. Pre-computed campaign collection is YAGNI until proven slow at production scale.

### **B. Mapping: §17 Default Broadcast Columns → PRD-A `broadcastexportdata` Fields**

| §17 Column (XLSX Header) | PRD-A `broadcastexportdata` fieldPath | PRD-C Recipient-Level | PRD-C Campaign-Level |
| ----- | ----- | ----- | ----- |
| broadcastId | `broadcastId` | ✅ | ✅ |
| broadcastName | `broadcastName` | ✅ | ✅ |
| broadcastChannel | `broadcastChannel` | ✅ | ✅ |
| source | `source` | ✅ | ✅ |
| createdAt | `createdAt` | ✅ | ✅ |
| scheduledAt | `scheduledAt` | ✅ | ✅ |
| creatorUserId | `creatorUserId` | ✅ | ✅ |
| creatorName | `creatorName` | ✅ | ✅ |
| teamInboxIdAtSendTime | `teamInboxIdAtSendTime` | ✅ | ✅ |
| teamInboxNameAtSendTime | `teamInboxNameAtSendTime` | ✅ | ✅ |
| senderAccountName | `senderAccountName` | ✅ | ✅ |
| senderNumber | `senderNumber` (PII) | ✅ | ✅ |
| recipientNumber | `recipientNumber` (PII) | ✅ | ❌ (not at campaign level) |
| recipientName | `recipientName` (PII) | ✅ | ❌ (not at campaign level) |
| status | `status` | ✅ | ❌ (replaced by aggregate counts) |
| reason | `reason` | ✅ | ❌ (not at campaign level) |
| failureSource | `failureSource` | ✅ | ❌ (not at campaign level) |
| attemptNumber | `attemptNumber` | ✅ | ❌ (not at campaign level) |
| templateUsed | `templateUsed` | ✅ | ✅ |
| messageContent | `messageContent` | ✅ | ❌ (not at campaign level) |
| requestId | `requestId` | ✅ | ❌ (not at campaign level) |
| idempotencyKey | `idempotencyKey` | ✅ | ❌ (not at campaign level) |
| requestPayloadJson | `requestPayloadJson` | ✅ | ❌ (not at campaign level) |
| attributesJson | `attributesJson` | ✅ | ❌ (not at campaign level) |
| *(new)* totalRecipients | *computed* | ❌ | ✅ |
| *(new)* successCount | *computed* | ❌ | ✅ |
| *(new)* inProgressCount | *computed* | ❌ | ✅ |
| *(new)* scheduledCount | *computed* | ❌ | ✅ |
| *(new)* failedCount | *computed* | ❌ | ✅ |
| *(new)* canceledCount | *computed* | ❌ | ✅ |
| *(new)* invalidNumberCount | *computed* | ❌ | ✅ |
| *(new)* invalidRequestCount | *computed* | ❌ | ✅ |
| *(new)* successRate | *computed* | ❌ | ✅ |

### **C. Glossary**

| Term | Definition |
| ----- | ----- |
| Granularitas | Export granularity level. "Per Penerima" = 1 row per broadcast recipient. "Per Kampanye" = 1 row per broadcast campaign with aggregate counts. |
| Recipient-level | Export mode where each row in the XLSX represents one broadcast recipient, with fields directly from `broadcastexportdata`. |
| Campaign-level | Export mode where each row represents one broadcast campaign, with aggregated counts from all recipients in that campaign. |
| `broadcastexportdata` | PRD-A analytics collection storing row-level broadcast recipient data, synced from broadcast-service domain events. |
| §17 Legacy Template | The existing "Default Broadcast" fixed-template export defined in the offline-report addendum (§17 of `PRD Analytics - offline report download.md`). Superseded by this PRD's configurable column approach. |
| Column Registry | PRD-B's `exportcolumnregistry` collection defining available columns per domain with metadata (displayName, category, PII flag, etc.). |

### **D. Open Questions**

| ID | Question | Current Assumption | Impact If Wrong |
| ----- | ----- | ----- | ----- |
| OQ-C-01 | Campaign-level aggregation: MongoDB on-demand aggregation vs pre-computed separate collection? | MongoDB aggregation on-demand, no separate collection. | If aggregation is too slow at scale, a pre-aggregated `broadcastcampaignstats` collection may be needed (would require PRD-A extension). |
| OQ-C-02 | How to handle broadcast metadata inconsistency across recipients (e.g. broadcastName changes mid-send)? | Use `{ $first: "$fieldName" }` — first document's value in the group. | If metadata is not stable across recipients, campaign-level metadata may be misleading. Alternative: use `{ $max: "$updatedAt" }` to get the most recent value. |
| OQ-C-03 | Should campaign-level aggregation include a `status` column showing the broadcast's overall status? | No — replaced by aggregate counts. Overall status is ambiguous when a campaign has mixed recipient statuses. | If stakeholders want a single "campaign status", a heuristic (e.g. all-success = SUCCESS, any-failed = PARTIAL_FAILED) would need to be defined. |
| OQ-C-04 | Should the `scheduledAt` date type also support filtering by `updatedAt` or `completedAt`? | No — only `createdAt` and `scheduledAt` in Phase 1. | If users need additional date types, the Date Type selector can be extended in a future phase. |
| OQ-C-05 | Does the §17 legacy "Default Broadcast" template get a deprecation timeline? | No hard timeline. Both coexist until PRD-C configurable path adoption ≥ 90%, then §17 template is deprecated with 30-day notice. | If deprecation is too aggressive, users who depend on the fixed template may lose export capability before learning the new UX. |

### **E. Source References**

| Reference | Path | Relevance |
| ----- | ----- | ----- |
| PRD-A: Export Row-Level Collections | `PRD/Analytics/Export/PRD Analytics - Export Row-Level Collections (Foundation).md` | `broadcastexportdata` collection schema (§10.3), sync pipeline, retention, tenant scoping |
| PRD-B: Configurable Column Export | `PRD/Analytics/Export/PRD Analytics - Configurable Column Export.md` | Column registry, column picker UI, dynamic query builder, streaming XLSX, job creation payload |
| Offline Report Download + §17 Addendum | `PRD/Analytics/PRD Analytics - offline report download.md` | Existing export UX, RBAC, retention, §17 broadcast addendum (AFR-001 through AFR-039, §17.11 default broadcast columns) |
| Change Intake Brief v3.0 | `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` | OQ-5 answer: broadcast = recipient-level + campaign-level, user picks filters |
| PRD Writing Rule | `Rules/prd-writing-rule.md` | Template structure, mandatory/conditional sections |
