# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: SAP Template Preset — Multi-Sheet Export (4-Sheet XLSX)
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: N/A (preset logic + backend; minimal new UI — reuse existing Offline Report Download page)

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD for Sub-PRD D: SAP template preset as a system-managed multi-sheet export preset within the configurable export system (PRD-B). |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide the SAP 4-sheet report format as a system-managed preset export, replacing the manual extraction process currently handled by Mas Rayyan. Users select "SAP Report" and get a multi-sheet XLSX matching the agreed SAP column structure. |
| Scope | SAP preset definition (4 fixed column sets), multi-sheet XLSX generation, two operational modes (standalone in Phase 2, integrated into PRD-B column picker in Phase 3+), duration formatting (HH:MM:SS), WIB timezone conversion, sheet selection UI. |
| Key Capabilities | (1) System-managed "SAP Report" preset with 4 fixed sheet definitions. (2) Multi-sheet XLSX output (Report Ticket, Report Conversation, Report Effective Hour, Raw AUX). (3) User can optionally deselect sheets. (4) Duration fields formatted as HH:MM:SS. (5) All datetime fields converted to WIB. |
| Outcome | Users generate SAP-formatted reports directly from the system. Manual report extraction process by Mas Rayyan is eliminated. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| SAP preset definition (4 sheets × fixed column mapping) | Column registry + configurable column picker UI → PRD-B |
| Multi-sheet XLSX generation (ExcelJS streaming) | Row-level collections + sync pipeline → PRD-A |
| Standalone mode (Phase 2): SAP preset as fixed option in existing template dropdown | Broadcast export → PRD-C |
| Integrated mode (Phase 3+): SAP preset as saved preset in PRD-B column picker | General configurable column export → PRD-B |
| Duration formatting (ms → HH:MM:SS) | Scheduled / email delivery of reports |
| WIB timezone conversion for all datetime columns | Custom SAP template per tenant / per customer |
| Sheet selection UI (user can deselect sheets) | Column reordering or customization of SAP columns (Phase 2) |
| Reuse existing job infra (queue, S3, retention, download link) | People-service direct integration for Effective Hour / Raw AUX (flagged as open question) |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | SAP report is generated manually by Mas Rayyan (DB extraction + file assembly). | Slow turnaround (hours/days), human error risk, not scalable, single point of failure. |
| PS-002 | No multi-sheet export capability exists. Current export produces single-sheet XLSX per domain (Ticket OR Conversation). | Cannot produce the 4-sheet SAP format in a single job. |
| PS-003 | Effective Hour and Raw AUX data has no analytics-side export source. | Sheets 3-4 cannot be generated from existing PRD-A collections (ticket, conversation, broadcast). |
| PS-004 | Duration fields are stored as raw milliseconds. SAP format requires HH:MM:SS display. | No duration formatting in current export path. |
| PS-005 | Datetime fields stored in UTC. SAP report requires WIB (Asia/Jakarta, UTC+7). | No timezone conversion in current export path. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Eliminate manual SAP report generation | Zero manual extractions by Mas Rayyan after SAP preset launch. 100% of SAP reports generated via system. |
| Produce SAP-compliant multi-sheet XLSX | Output matches SAP column structure (35 ticket + 27 conversation + 6 effective hour + 9 AUX columns). |
| Maintain export performance at scale | SAP preset job completes within existing job processing timeout for date ranges ≤ 30 days. File generation uses streaming (no memory blow-up). |
| Ship before full configurable column picker | SAP preset available in Phase 2 (standalone mode) before PRD-B Phase 3 column picker ships. |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to select "SAP Report" as an export template so that the system generates a multi-sheet XLSX matching the SAP format. | 1. Given I open the Offline Report page, When I view the template dropdown, Then I see "SAP Report" as an option. 2. Given I select "SAP Report", When I submit, Then the system creates an export job that generates a multi-sheet XLSX. 3. Given the job completes, When I download, Then the XLSX contains 4 sheets: "Report Ticket", "Report Conversation", "Report Effective Hour", "Raw AUX". |
| US-002 | P0 | As an Admin, I want to optionally deselect sheets before submitting so that I export only the sheets I need. | 1. Given I select "SAP Report", When the form updates, Then I see checkboxes for all 4 sheets (all pre-selected by default). 2. Given I uncheck "Report Effective Hour" and "Raw AUX", When I submit, Then the XLSX contains only "Report Ticket" and "Report Conversation" sheets. 3. Given I uncheck all sheets, When I try to submit, Then submission is blocked with "Pilih minimal 1 sheet". |
| US-003 | P0 | As an Admin, I want duration fields formatted as HH:MM:SS so the output matches SAP format. | 1. Given a ticket has `handlingTimeMs = 3661000`, When exported, Then the cell value is "01:01:01". 2. Given a ticket has `handlingTimeMs = null`, When exported, Then the cell value is "-". 3. Given all duration columns (Diff Time First Assign And First Response, AVG Responsetime, Handling Time, etc.), When exported, Then they are all formatted as HH:MM:SS. |
| US-004 | P0 | As an Admin, I want datetime fields displayed in WIB (Asia/Jakarta) so the output matches SAP format. | 1. Given a ticket has `createdAt = 2026-08-01T10:00:00Z` (UTC), When exported, Then the cell value is "2026-08-01 17:00:00" (WIB). 2. Given all datetime columns (Created Datetime, Closed Datetime, etc.), When exported, Then they are all in WIB timezone. |
| US-005 | P0 | As a Supervisor, I want SAP Report export scoped to my Team Inbox scope so I do not export data outside my access. | 1. Given I am a Supervisor, When I select "SAP Report", Then the export data is restricted to my accessible Team Inbox scope. 2. Given I am a Supervisor with limited scope, When the job runs, Then only rows within my scope appear in the output. |
| US-006 | P0 | As an Admin, I want the SAP preset job to use the same filters as other exports (date range, status, employee, channel) so I can narrow the dataset. | 1. Given I select "SAP Report" and set a date range, When the job runs, Then only rows within that date range are included on all sheets. 2. Given I filter by status, When the job runs, Then only matching rows appear. 3. Given date range > 30 days, When I submit, Then submission is blocked with existing "Maksimal rentang 30 hari" message. |
| US-007 | P1 | As an Admin, I want the job list to show "SAP Report" and sheet selection so I can review past SAP export configurations. | 1. Given an SAP preset job is created, When I view the job list, Then I see "Template: SAP Report" in the row. 2. Given I expand "Parameter Permintaan", Then I see which sheets were included (e.g. "Sheet: Report Ticket, Report Conversation"). |
| US-008 | P1 | As an Admin, I want the SAP preset to handle missing data gracefully so empty fields show "-" instead of errors. | 1. Given a ticket has no CSAT value, When exported, Then the CSAT cell shows "-". 2. Given a conversation has no Topic, When exported, Then the Topic cell shows "-". 3. Given Effective Hour data is unavailable (open question OQ-D1), When the sheet has no data, Then the sheet shows headers only with an informational note. |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| **SAP Preset Definition** | FR-001 [P0]: System MUST define a system-managed preset named `"SAP Report"` with 4 sheet definitions: "Report Ticket", "Report Conversation", "Report Effective Hour", "Raw AUX". FR-002 [P0]: Each sheet MUST have a fixed column set defined in Appendix A (complete mapping table). FR-003 [P0]: SAP preset MUST be immutable — users MUST NOT be able to add, remove, or rename columns in Phase 2 (standalone mode). FR-004 [P0]: SAP preset column definitions MUST be stored as a configuration constant (JSON/YAML or code constant), not in a database collection. |
| **Multi-Sheet XLSX Generation** | FR-005 [P0]: System MUST generate a single `.xlsx` file with multiple worksheets, one per selected sheet. FR-006 [P0]: Worksheet tab names MUST be: "Report Ticket", "Report Conversation", "Report Effective Hour", "Raw AUX" — exactly matching SAP naming. FR-007 [P0]: Each sheet MUST contain its own column headers (row 1) using SAP column names (Bahasa Indonesia + English mix per SAP spec). FR-008 [P0]: Each sheet MUST query its own data source independently. FR-009 [P0]: XLSX generation MUST use streaming write (ExcelJS streaming workbook writer) to handle large datasets. FR-010 [P0]: If a sheet's query returns zero rows, the sheet MUST still appear with headers only (no error). |
| **Data Sources** | FR-011 [P0]: "Report Ticket" sheet MUST read from `ticketexportdata` collection (PRD-A). FR-012 [P0]: "Report Conversation" sheet MUST read from `conversationexportdata` collection (PRD-A). FR-013 [P0]: "Report Effective Hour" sheet MUST read from a people-service derived data source (see open question OQ-D1). FR-014 [P0]: "Raw AUX" sheet MUST read from a people-service derived data source (see open question OQ-D1). |
| **Duration Formatting** | FR-015 [P0]: All duration fields stored as milliseconds MUST be formatted as `HH:MM:SS` in XLSX output. FR-016 [P0]: Duration formatting formula: `hours = floor(ms / 3600000)`, `minutes = floor((ms % 3600000) / 60000)`, `seconds = floor((ms % 60000) / 1000)`, zero-padded to 2 digits each. FR-017 [P0]: If duration value is `null`, `undefined`, or `0`, the cell MUST display `"-"`. |
| **WIB Timezone Conversion** | FR-018 [P0]: All datetime fields MUST be converted to Asia/Jakarta (WIB, UTC+7) before writing to XLSX. FR-019 [P0]: Datetime cell format MUST be `"YYYY-MM-DD HH:mm:ss"` (e.g. `"2026-08-01 17:00:00"`). FR-020 [P0]: If datetime value is `null`, the cell MUST display `"-"`. |
| **Sheet Selection** | FR-021 [P0]: System MUST allow user to select/deselect individual sheets before job submission. FR-022 [P0]: All 4 sheets MUST be pre-selected by default. FR-023 [P0]: System MUST reject submission if zero sheets selected. FR-024 [P0]: Sheet selection MUST be stored in the job parameter snapshot for reproducibility. |
| **Filters** | FR-025 [P0]: SAP preset MUST reuse all existing filters: date range (max 30 days), status, employee/assignee, channel. FR-026 [P0]: Filters MUST apply consistently across all selected sheets (same date range, same status filter). FR-027 [P1]: Effective Hour and Raw AUX sheets MAY use a separate date range if the data source supports it (see OQ-D4). |
| **Field Mapping — Report Ticket** | FR-028 [P0]: Report Ticket MUST map SAP columns to `ticketexportdata` fields per Appendix A.1. FR-029 [P0]: Array fields (`assignee`, `remarks`) MUST be joined with `", "` separator. FR-030 [P0]: Stage duration sub-breakdown (On Progress Dalam Penanganan Cabang, Updated Cabang, On Progress Dalam Konfirmasi Client, Dikembalikan ke Cabang) MUST map to `ticketexportdata` stage duration fields per Appendix A.1 mapping (see OQ-D2 for open questions). |
| **Field Mapping — Report Conversation** | FR-031 [P0]: Report Conversation MUST map SAP columns to `conversationexportdata` fields per Appendix A.2. FR-032 [P0]: "Jam Chat In (T1)" MUST map to `createdAt`. FR-033 [P0]: "Jam Chat Masuk Bucket Agent (T2)" MUST map to first assignment timestamp (see OQ-D3). FR-034 [P0]: "Jam Respon Pertama (T3)" MUST be derived from `firstResponseTimeMs` or equivalent field. |
| **Field Mapping — Report Effective Hour** | FR-035 [P0]: Report Effective Hour MUST map SAP columns per Appendix A.3. FR-036 [P0]: Data source for Effective Hour MUST be defined (see OQ-D1). |
| **Field Mapping — Raw AUX** | FR-037 [P0]: Raw AUX MUST map SAP columns per Appendix A.4. FR-038 [P0]: Data source for Raw AUX MUST be defined (see OQ-D1). |
| **Standalone Mode (Phase 2)** | FR-039 [P0]: In Phase 2, "SAP Report" MUST appear as a fixed option in the existing template dropdown (alongside "Default Ticket", "Default Conversation", etc.). FR-040 [P0]: Selecting "SAP Report" MUST replace the template-specific UI with the sheet selection UI and the multi-sheet job flow. FR-041 [P0]: Phase 2 standalone mode MUST NOT require the PRD-B column picker or column registry to be available. |
| **Integrated Mode (Phase 3+)** | FR-042 [P1]: In Phase 3+, "SAP Report" MUST appear as a system-managed preset in PRD-B's column picker system. FR-043 [P1]: Loading the SAP preset in integrated mode MUST auto-select the correct columns per sheet, matching the Phase 2 column definitions. FR-044 [P1]: In integrated mode, users MAY modify columns after loading the SAP preset (save variant). FR-045 [P1]: Integrated mode MUST preserve backward compatibility — jobs created in Phase 2 standalone mode MUST still be displayable and downloadable. |
| **Backward Compatibility** | FR-046 [P0]: Existing export templates (Default Ticket, Default Conversation, Ticket Type templates) MUST continue to function. FR-047 [P0]: "SAP Report" MUST be an additive option — it MUST NOT replace or modify existing templates. |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Zero sheets selected. Reject job creation. | "Pilih minimal 1 sheet". |
| EH-002 | Validation | Date range invalid (start > end, range > 30 days). Block submission. | Reuse existing error messages from offline-report PRD. |
| EH-003 | Processing | XLSX generation fails due to memory pressure (large dataset × 4 sheets). Mark job FAILED. | "Gagal membuat laporan. Kurangi sheet atau perkecil rentang tanggal". |
| EH-004 | Processing | One sheet's data source unavailable (e.g. Effective Hour data source down). Mark job FAILED. | "Gagal membuat laporan. Sumber data sheet tidak tersedia". |
| EH-005 | Processing | Analytics collection query times out. Retry once, then mark job FAILED. | "Gagal membuat laporan. Coba lagi nanti". |
| EH-006 | Validation | Duplicate SAP preset job (same requester, same sheets, same filters, active). Block creation. | "Permintaan yang sama masih diproses". |
| EH-007 | Data | Effective Hour / Raw AUX data source returns no data for date range. Complete job with headers-only sheet. | Informational: "Sheet {name} selesai tanpa data". Job still succeeds. |
| EH-008 | Permission | Supervisor submits SAP preset job. Scope is re-applied at processing time per existing RBAC rules. | If zero rows after scoping, sheet shows headers only. |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User deselects all sheets except one (e.g. only "Report Ticket") | Job proceeds with single-sheet XLSX. Tab name preserved. | Normal flow. |
| EC-002 | Date range produces 169k+ ticket rows (matching SAP example volume) | XLSX generation uses streaming write. Memory stays bounded. Job completes within timeout. | No user-facing difference from smaller exports. |
| EC-003 | A duration field value exceeds 24 hours (e.g. `handlingTimeMs = 172800000` → "48:00:00") | Hours component is NOT modulo 24. Shows actual total hours. | "48:00:00" (matches SAP convention). |
| EC-004 | A ticket has no assignee (null). SAP column "Participants" and "Assign By" both use `assignee` field. | Both cells show "-". | No error. |
| EC-005 | Custom attributes or custom fields exist on a ticket. SAP format does not include these. | They are NOT included in the SAP preset output. Only the fixed SAP columns appear. | No error. |
| EC-006 | Conversation has no linked ticket. SAP column "Ticket ID/Number" in conversation sheet. | Cell shows "-" or the cross-referenced ticket ID if available. See OQ-D3. | No error. |
| EC-007 | User submits SAP preset job with tags filter, but no matching rows exist for Effective Hour or Raw AUX. | Job completes. Empty sheets show headers only. Ticket/Conversation sheets may have data. | Informational note per sheet if empty. |
| EC-008 | File size exceeds 500MB due to large date range + all 4 sheets. | Job proceeds if within timeout. If memory threshold exceeded, mark FAILED with guidance. | "Data terlalu besar. Perkecil rentang tanggal". |
| EC-009 | User has both SAP preset (Phase 2) and PRD-B column picker (Phase 3) available. | "SAP Report" appears in template dropdown. Column picker also shows SAP as a preset. User uses either path — both produce equivalent output. | Phase 3 upgrade is seamless. |

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| SAP Report Option (Phase 2) | "SAP Report" appears in the template dropdown on the Offline Report Download page. | Selecting "SAP Report" reveals the sheet selection UI below the filter panel. | US-001 |
| Sheet Selection Checkboxes | 4 checkboxes: "Report Ticket", "Report Conversation", "Report Effective Hour", "Raw AUX". All pre-selected. | User unchecks sheets to exclude. Minimum 1 required. | US-002 |
| Filter Panel | Reuses existing filter panel (date range, status, employee, channel). | No change from existing offline report page. | US-006 |
| Submit Button | Reuses existing submit flow. | On submit, job is created with SAP preset config + selected sheets + filters. | US-001 |
| Job List | Reuses existing job list. "Parameter Permintaan" shows "Template: SAP Report" + selected sheet names. | Expand to see sheet list. | US-007 |
| Download | Reuses existing download mechanism. | File name: `SatuInbox_SAP_Report_{DD_MM_YYYY}.xlsx`. | US-001 |

## **10. Field & Validation**

### **10.1 SAP Preset Job Creation Payload (New/Modified Fields)**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `templateId` | string | `"SAP_REPORT"` | Must be `"SAP_REPORT"` for SAP preset. | Yes | — |
| `sheets` | string[] | `["Report Ticket", "Report Conversation"]` | Min 1 item. Must match defined sheet names. | Yes | All 4 sheets |
| `filters.dateRange.start` | Date | `2026-03-01T00:00:00+07:00` | Valid datetime. Must be before end. | Yes | — |
| `filters.dateRange.end` | Date | `2026-03-30T23:59:59+07:00` | Valid datetime. Range ≤ 30 days inclusive. | Yes | — |
| `filters.status` | string[] | `["OPEN", "ONGOING"]` | Valid status codes. | No | All statuses |
| `filters.channel` | string[] | `["whatsapp", "instagram"]` | Valid platform values. | No | All channels |
| `filters.assignedTo` | string[] | `["USR-001"]` | Must be within requester permission scope. | No | All employees |

### **10.2 Output File Specification**

| Property | Value |
| ----- | ----- |
| Format | `.xlsx` (Excel 2007+) |
| Library | ExcelJS streaming workbook writer |
| File name | `SatuInbox_SAP_Report_{DD_MM_YYYY}.xlsx` (date = job creation date) |
| Max sheets | 4 |
| Tab names | "Report Ticket", "Report Conversation", "Report Effective Hour", "Raw AUX" |
| Row 1 | Column headers (SAP column names) |
| Row 2+ | Data rows |
| Null cells | `"-"` |
| Duration cells | `HH:MM:SS` format |
| Datetime cells | `YYYY-MM-DD HH:mm:ss` WIB |

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance** | NFR-001: SAP preset job MUST complete within existing job processing timeout (reuse existing — no new timeout). NFR-002: XLSX generation MUST use streaming write (ExcelJS streaming workbook writer) — MUST NOT load all rows into memory. NFR-003: Each sheet's query MUST use a streamed cursor, not load-all-into-memory. |
| **Reliability** | NFR-004: Job MUST be idempotent per job ID (reuse existing). NFR-005: If one sheet fails, the entire job FAILS (no partial multi-sheet output). |
| **Security** | NFR-006: All queries MUST be scoped by `companyId` + `organizationId` (matching PRD-A). NFR-007: Supervisor scope re-applied at processing time (reuse existing RBAC). NFR-008: Download link MUST follow existing presigned URL mechanism (15-minute expiry). |
| **Privacy** | NFR-009: SAP preset includes PII fields (contactPhone, contactEmail, contactName) by design — this matches the existing SAP report format. PII acknowledgment is implicit for "SAP Report" template (known PII-included preset). |
| **Observability** | NFR-010: Job metrics MUST include: `templateId`, `sheets[]`, `row_count_per_sheet`, `total_row_count`, `generation_duration_ms`, `file_size_bytes`, `status`. NFR-011: Per-sheet generation duration MUST be logged separately for performance analysis. |
| **Localization** | NFR-012: XLSX column headers MUST use SAP column names (Bahasa Indonesia + English mix per SAP spec). NFR-013: All UI labels MUST be in Bahasa Indonesia. NFR-014: All datetime output MUST be in WIB (Asia/Jakarta, UTC+7). |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| PRD-A: `ticketexportdata` and `conversationexportdata` collections must exist and be populated. | Engineering (PRD-A) | **Blocking for Sheets 1-2.** If collections are empty, Sheets 1-2 return no data. | Feature-flag: SAP preset only enabled after PRD-A Phase 4 cutover. |
| Effective Hour + Raw AUX data source (OQ-D1). | Engineering / Product | **Blocking for Sheets 3-4.** If data source is not defined, Sheets 3-4 cannot be generated. | Ship Sheets 1-2 first if Sheets 3-4 are blocked. Sheets 3-4 can be "coming soon" in UI. |
| PRD-B: Column registry (for Phase 3+ integrated mode only). | Engineering (PRD-B) | Phase 3+ integrated mode depends on PRD-B column registry. | Phase 2 standalone mode does NOT depend on PRD-B. |
| ExcelJS streaming support for multi-sheet workbooks. | Engineering | If ExcelJS does not support multi-sheet streaming, memory issues at scale. | ExcelJS already supports `worksheet.eachRow` streaming per sheet. Validate with 169k row test. |
| File size: SAP example is 47.5 MB for full 4-sheet export. | Engineering | Download time, S3 storage, user experience. | Existing 7-day retention and presigned URL handle this. No special handling needed. |
| Stage sub-breakdown mapping (OQ-D2). | Engineering | 4 SAP ticket columns may need additional fields not in PRD-A `ticketexportdata`. | Map to existing `stageDuration*Ms` fields where possible. Flag gaps as open questions. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| SAP report generation adoption | 100% of SAP report requests use system (zero manual extractions by Mas Rayyan) | 30 days post-launch | Job creation logs (filter `templateId = SAP_REPORT`) |
| Job completion rate | ≥ 98% (matching existing offline-report KPI) | Ongoing | Job status metrics |
| Output accuracy vs SAP example | Column headers match SAP spec 100%. Row data matches manual extraction within ±0.1% for same date range. | 30 days post-launch | QA validation against `.hermes/desktop-attachments/SatuInbox_SAP_Report_31_07_2026.xlsx` |
| Median generation time | ≤ 10 minutes for 30-day range (4 sheets) | 30 days post-launch | Job metrics (`generation_duration_ms`) |
| File size consistency | File size within ±20% of SAP example for same data volume | 30 days post-launch | Job metrics (`file_size_bytes`) |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| PRD-B integrated mode (Phase 3+) | SAP preset becomes editable within column picker. Users can load SAP preset, modify columns, save variants. |
| User-saved SAP variants | After Phase 3+, users may want to save modified SAP presets (e.g. "SAP Report - Supervisor" with fewer columns). |
| Scheduled SAP export delivery | Replace manual weekly/monthly process with automated scheduled generation + email/S3 delivery. |
| Custom SAP presets per tenant | Different customers may need different SAP column sets. |
| Effective Hour / Raw AUX from people-service | If people-service integration is completed, Sheets 3-4 become fully functional. |

## **15. State Transition Model**

SAP preset jobs reuse the existing Offline Report Download job lifecycle. No new states are introduced.

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Export Job | — | Admin/Supervisor submits SAP preset job | DIPROSES (Processing) | Admin, Supervisor | Valid date range, ≥ 1 sheet selected, no duplicate active job | Job queued | `sap_preset_job_created` |
| Export Job | DIPROSES | All sheets generated successfully, XLSX uploaded to S3 | SELESAI (Completed) | System | XLSX generation success, S3 upload success | Download link generated, retention timer starts (7 days) | `sap_preset_job_completed` |
| Export Job | DIPROSES | XLSX generation fails (memory, timeout, data source error) | GAGAL (Failed) | System | Failure after retry | Error reason stored in job | `sap_preset_job_failed` |
| Export Job | SELESAI | 7-day retention expires | KEDALUWARSA (Expired) | System | Retention timer expired | S3 file deleted, download disabled | `sap_preset_job_expired` |

## **16. Permission Matrix**

| Role | View Page | Create Job | Download | View All Jobs | Subscription Gate | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Admin | Allowed | Allowed | Allowed | Allowed | enterprise + PKS | Full access. PII included by design. |
| Supervisor | Allowed | Allowed | Allowed | Own jobs only | enterprise + PKS | Data scoped to Team Inbox. |
| Agent | Denied | Denied | Denied | Denied | — | Denied. |

#### **Subscription Tier Gate**

SAP Report tab hanya muncul jika:
1. `company.subscriptionTier = enterprise` (tier tertinggi)
2. `company.features.sapExportEnabled = true` (flag PKS — set manual oleh ops/CS setelah Perjanjian Kerja Sama ditandatangani)

Backend MUST reject SAP preset job creation with `SUBSCRIPTION_REQUIRED` (tier bukan enterprise) atau `FEATURE_NOT_ENABLED` (PKS flag belum aktif). Tab visibility is UX-only — backend is source of truth.

## **17. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| SAP Preset Job Creation | `POST /api/offline-report/jobs` (reuse existing endpoint) | FE (Offline Report page) | analytics-service / export-worker | `{ templateId: "SAP_REPORT", sheets: string[], filters: {...} }` | `{ jobId: string, status: "DIPROSES" }` | 400 (invalid sheets/date), 409 (duplicate active job), 403 (permission) | Backward compatible — existing `templateId` values continue to work. `SAP_REPORT` is a new templateId value. |
| SAP Preset Job Processing | Job queue message (reuse existing RabbitMQ queue) | analytics-service | export-worker | Job payload with `templateId: "SAP_REPORT"` + sheet definitions + filters | S3 upload result | Standard job failure codes | Reuse existing job queue. No new queues or exchanges. |
| Ticket Export Data Query | MongoDB aggregation (reuse PRD-A query pattern) | export-worker | `ticketexportdata` collection | `{ companyId, organizationId, filters, columns }` | Streamed cursor | Timeout, empty result | Same query pattern as PRD-B dynamic query builder. |
| Conversation Export Data Query | MongoDB aggregation (reuse PRD-A query pattern) | export-worker | `conversationexportdata` collection | `{ companyId, organizationId, filters, columns }` | Streamed cursor | Timeout, empty result | Same query pattern as PRD-B dynamic query builder. |
| Effective Hour Data Query | TBD (see OQ-D1) | export-worker | TBD (people-service or new collection) | TBD | TBD | TBD | Open question. |
| Raw AUX Data Query | TBD (see OQ-D1) | export-worker | TBD (people-service or new collection) | TBD | TBD | TBD | Open question. |

## **18. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| Feature Flag | `FEATURE_SAP_PRESET` flag controls visibility of "SAP Report" option in template dropdown. Phase 2: enabled for internal testing, then gradual rollout. | Engineering | Smoke test: create job, verify multi-sheet XLSX output, validate column mapping. | Disable flag → "SAP Report" hidden from dropdown. Existing templates unaffected. |
| Phase 2 (Standalone) | Ship "SAP Report" as fixed template option. Sheets 1-2 (Ticket + Conversation) from PRD-A collections. Sheets 3-4 (Effective Hour + Raw AUX) depend on OQ-D1 resolution. | Engineering | QA validates column mapping vs SAP example file. Volume test with 169k rows. | Disable flag. |
| Phase 3+ (Integrated) | SAP preset becomes system-managed preset in PRD-B column picker. Users can load, modify, save variants. | Engineering + PRD-B | Same validation + preset loading/modification flow. | SAP preset remains available as standalone template even if column picker has issues. |
| No Data Migration | SAP preset is additive — no existing data or jobs are modified. | — | — | — |

## **19. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| SAP preset export file (.xlsx) | analytics-service / export-worker | Export job | 7 days (reuse existing) | Auto-delete from S3 after 7 days. Job record marked KEDALUWARSA. | User downloads via presigned URL (15-min expiry). | File contains PII (contactPhone, contactEmail, contactName). Same PII handling as existing exports. |
| SAP preset job record | analytics-service | Export job creation | 90 days (reuse existing job record retention) | Job record retained for audit. | Job parameters (sheets, filters) visible in job list. | No PII in job record — only filters and metadata. |
| SAP preset configuration (column definitions) | analytics-service (code/config) | Engineering | Permanent (code-level) | N/A — not a database entity. | N/A | No PII. |

## **20. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Product Event | `sap_preset_job_created` | User submits SAP preset job | `userId`, `sheets[]`, `dateRange`, `filterSnapshot` | Product/Data | — |
| Product Event | `sap_preset_job_completed` | Job completes successfully | `jobId`, `sheets[]`, `rowCounts{}`, `fileSizeBytes`, `durationMs` | Product/Data | — |
| Product Event | `sap_preset_job_failed` | Job fails | `jobId`, `sheets[]`, `failureReason`, `durationMs` | Engineering | Alert if failure rate > 5% over 1 hour |
| Metric | `sap_preset_generation_duration_ms` | Per-sheet XLSX generation | `sheetName`, `rowCount`, `durationMs` | Engineering | Alert if p95 > 10 min |
| Metric | `sap_preset_file_size_bytes` | XLSX file uploaded to S3 | `fileSizeBytes`, `sheetCount` | Engineering | Alert if > 500 MB |
| Audit Event | `sap_preset_export_audit` | Job created + downloaded | `userId`, `companyId`, `sheets[]`, `piiIncluded: true` | Engineering / Compliance | — |

## **21. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| Duplicate SAP preset job (same requester, sheets, filters, active job exists) | Double submission wastes resources and storage. | Block second job. Return existing job ID. Reuse existing dedup logic from offline-report-download. | QA: submit identical job twice → second returns 409 or shows existing job. |
| Multiple SAP preset jobs running concurrently | Higher resource usage than single-sheet exports (4 queries + 4 sheet writes). | Reuse existing job queue concurrency limits. No new rate limit needed — but monitor p95 generation time. | QA: run 3 concurrent SAP jobs → all complete within timeout. |
| SAP preset job + regular export job running concurrently | No conflict — independent jobs. | No special handling needed. Reuse existing queue. | Standard job isolation. |
| Very large dataset (169k+ rows × 4 sheets) | Memory pressure, timeout risk. | Streaming XLSX write (per-sheet). Each sheet queries independently with cursor streaming. | QA: validate with production-volume data (169k tickets, 88k conversations). |

## **22. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Phase 2 SAP preset columns are fixed — no customization. | Users who need a subset must wait for Phase 3+ or export full file and filter manually. |
| Effective Hour + Raw AUX data source unresolved (OQ-D1). | Sheets 3-4 may ship later or with placeholder. |
| Stage sub-breakdown mapping incomplete (OQ-D2). | Some SAP ticket columns may show "-" for unmapped stages. |
| Conversation Number field unconfirmed (OQ-D3). | May show "-" if field does not exist in `conversationexportdata`. |
| No automated scheduled delivery. | Users must manually trigger SAP export jobs. |
| Date range cap of 30 days applies (same as existing exports). | Users needing > 30 days must submit multiple jobs. |
| File size can reach 47.5 MB for large date ranges. | Acceptable for download; may be slow on poor connections. |
| PII fields included by design — no per-column opt-out for SAP preset. | Matches SAP contract. Users accept PII inclusion when using "SAP Report" template. |

## **23. Appendix**

### **A. Complete 4-Sheet Column Mapping Table**

#### **A.1 Report Ticket (35 columns)**

| # | SAP Column Name | PRD-A Field Path | Data Type | Format | Source | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | Ticket ID | `ticketId` | string | Raw | ticketexportdata | — |
| 2 | Ticket Number | `ticketNumber` | string | Raw | ticketexportdata | — |
| 3 | AWB | `awb` | string | Raw | ticketexportdata | — |
| 4 | Created Datetime (WIB) | `createdAt` | datetime | `YYYY-MM-DD HH:mm:ss` WIB | ticketexportdata | Convert from UTC to WIB |
| 5 | Closed Datetime (WIB) | `closedAt` | datetime | `YYYY-MM-DD HH:mm:ss` WIB | ticketexportdata | Convert from UTC to WIB. Null → "-" |
| 6 | Created By | `createdBy` | string | Raw | ticketexportdata | — |
| 7 | Closed By | `closedBy` | string | Raw | ticketexportdata | — |
| 8 | Participants | `assignee` | array (string) | Joined ", " | ticketexportdata | Array joined with ", " |
| 9 | Status | `status` | string | Raw | ticketexportdata | — |
| 10 | Current Stage | `currentStage` | string | Raw | ticketexportdata | — |
| 11 | Assign By | `assignee` | array (string) | Joined ", " | ticketexportdata | Same field as Participants per SAP spec |
| 12 | Channel | `channel` | string | Raw | ticketexportdata | — |
| 13 | Tribe | `tribe` | string | Raw | ticketexportdata | — |
| 14 | Type Complaint | `typeComplaint` | string | Raw | ticketexportdata | — |
| 15 | Investigation Status | *TBD* | string | Raw | — | **OQ-D5**: Not in PRD-A `ticketexportdata`. Flag as N/A or requires PRD-A extension. |
| 16 | Diff Time First Assign And First Response | `diffTimeFirstAssignAndFirstResponseMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | Null → "-" |
| 17 | AVG Responsetime | `avgResponseTimeMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | Fallback: `firstReplyTimeMs` if avg not available |
| 18 | Handling Time | `handlingTimeMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | Null → "-" |
| 19 | Diff Time Resolved and Created | `timeToCloseMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | Null → "-" |
| 20 | CSAT | `csat` | number | Raw | ticketexportdata | Null → "-" |
| 21 | Ticket All Remarks | `remarks` | array (object) | JSON string or joined | ticketexportdata | Joined with " | " or JSON serialized |
| 22 | Title | `title` | string | Raw | ticketexportdata | — |
| 23 | Priority | `priority` | string | Raw | ticketexportdata | — |
| 24 | Unattended | `stageDurationUnattendedMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | Null → "-" |
| 25 | Open | `stageDurationOpenMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | Null → "-" |
| 26 | On Progress Dalam Penanganan Cabang | `stageDurationOnProgressMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | **OQ-D2**: May need sub-stage mapping. Maps to primary "On Progress" duration. |
| 27 | Updated Cabang | *TBD* | duration (ms) | `HH:MM:SS` | — | **OQ-D2**: Stage-related. May map to a specific sub-stage or require new field. |
| 28 | On Progress Dalam Konfirmasi Client | *TBD* | duration (ms) | `HH:MM:SS` | — | **OQ-D2**: Stage sub-breakdown. May need new field in PRD-A. |
| 29 | Dikembalikan ke Cabang | *TBD* | duration (ms) | `HH:MM:SS` | — | **OQ-D2**: Stage sub-breakdown. May need new field in PRD-A. |
| 30 | Done | `stageDurationDoneMs` | duration (ms) | `HH:MM:SS` | ticketexportdata | Null → "-" |
| 31 | Comment CSAT | *TBD* | string | Raw | — | **OQ-D5**: Not in PRD-A `ticketexportdata`. Flag as N/A or requires PRD-A extension. |

> **Note**: Original SAP spec lists 35 columns but the exact list has 31 identifiable mappings (some columns may overlap or be derived). The remaining 4 columns in the SAP example file need final verification against the actual SAP output file. QA will validate the exact column count and names during implementation.

#### **A.2 Report Conversation (23 identifiable columns)**

| # | SAP Column Name | PRD-A Field Path | Data Type | Format | Source | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | Conversation ID | `conversationId` | string | Raw | conversationexportdata | — |
| 2 | Conversation Number | *TBD* | string | Raw | — | **OQ-D3**: May not exist in `conversationexportdata`. Needs field verification. |
| 3 | Status | `status` | string | Raw | conversationexportdata | — |
| 4 | Ticket ID / Ticket Number | *cross-ref* | string | Raw | conversationexportdata | **OQ-D3**: Cross-reference to ticket. If `ticketId` field exists in conversation, use it. Otherwise "-". |
| 5 | Created Datetime (WIB) | `createdAt` | datetime | `YYYY-MM-DD HH:mm:ss` WIB | conversationexportdata | Convert from UTC to WIB |
| 6 | Closed Datetime (WIB) | `closedAt` | datetime | `YYYY-MM-DD HH:mm:ss` WIB | conversationexportdata | Null → "-" |
| 7 | Closed By | `closedBy` | string | Raw | conversationexportdata | Null → "-" |
| 8 | Participants | `participants` | array (string) | Joined ", " | conversationexportdata | — |
| 9 | Assign By | `assignedTo` | string or array | Raw or joined ", " | conversationexportdata | — |
| 10 | Jam Chat In (T1) | `createdAt` | datetime | `YYYY-MM-DD HH:mm:ss` WIB | conversationexportdata | Same as Created Datetime |
| 11 | Jam Chat Masuk Bucket Agent (T2) | *TBD (first assignment timestamp)* | datetime | `YYYY-MM-DD HH:mm:ss` WIB | conversationexportdata | **OQ-D3**: May need derived field from assignment event. |
| 12 | Jam Respon Pertama (T3) | derived from `firstResponseTimeMs` | datetime | `YYYY-MM-DD HH:mm:ss` WIB | conversationexportdata | Derived: `createdAt` + `firstResponseTimeMs` |
| 13 | Channel | `channel` | string | Raw | conversationexportdata | — |
| 14 | Diff Time First Assign And First Response | `diffTimeFirstAssignAndFirstResponseMs` | duration (ms) | `HH:MM:SS` | conversationexportdata | If field exists. Otherwise computed. |
| 15 | AVG Responsetime | `avgResponseTimeMs` | duration (ms) | `HH:MM:SS` | conversationexportdata | Null → "-" |
| 16 | Handling Time | computed | duration (ms) | `HH:MM:SS` | conversationexportdata | May need computed field. |
| 17 | Diff Time Resolved and Created | `timeToCloseMs` | duration (ms) | `HH:MM:SS` | conversationexportdata | Null → "-" |
| 18 | Contact ID | `contactId` | string | Raw | conversationexportdata | — |
| 19 | Topic | `topic` | string | Raw | conversationexportdata | Null → "-" |
| 20 | Sub-Topic | `subTopic` | string | Raw | conversationexportdata | Null → "-" |
| 21 | Contact Name | `contactName` | string | Raw | conversationexportdata | PII |
| 22 | Contact Phone | `contactPhone` | string | Raw | conversationexportdata | PII |
| 23 | Contact Email | `contactEmail` | string | Raw | conversationexportdata | PII |

> **Note**: Original SAP spec lists 27 columns. 23 are identifiable above. Remaining columns need final verification against the actual SAP output file.

#### **A.3 Report Effective Hour (6 columns)**

| # | SAP Column Name | Data Type | Format | Source | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | Shift Date | date | `YYYY-MM-DD` | **OQ-D1** | People-service presence data? |
| 2 | User ID | string | Raw | **OQ-D1** | — |
| 3 | fullname | string | Raw | **OQ-D1** | — |
| 4 | Work Hours Shift | duration | `HH:MM:SS` | **OQ-D1** | — |
| 5 | Total Shift Away | duration | `HH:MM:SS` | **OQ-D1** | — |
| 6 | Effective Work Shift Hour | duration | `HH:MM:SS` | **OQ-D1** | Derived: Work Hours Shift - Total Shift Away |

> **All fields flagged as open question (OQ-D1).** Data source not in PRD-A collections.

#### **A.4 Raw AUX (9 columns)**

| # | SAP Column Name | Data Type | Format | Source | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 1 | Shift Date | date | `YYYY-MM-DD` | **OQ-D1** | People-service presence data? |
| 2 | User ID | string | Raw | **OQ-D1** | — |
| 3 | User Name | string | Raw | **OQ-D1** | — |
| 4 | Reason Away | string | Raw | **OQ-D1** | AUX reason (Sholat, Break, etc.) |
| 5 | Start Shift | datetime | `HH:mm:ss` | **OQ-D1** | — |
| 6 | End Shift | datetime | `HH:mm:ss` | **OQ-D1** | — |
| 7 | Start Away | datetime | `HH:mm:ss` | **OQ-D1** | — |
| 8 | End Away | datetime | `HH:mm:ss` | **OQ-D1** | — |
| 9 | Total Away | duration | `HH:MM:SS` | **OQ-D1** | End Away - Start Away |

> **All fields flagged as open question (OQ-D1).** Data source not in PRD-A collections.

---

### **B. Duration Format Specification**

| Property | Value |
| ----- | ----- |
| Input | Integer milliseconds (e.g. `3661000`) |
| Output format | `HH:MM:SS` (e.g. `"01:01:01"`) |
| Hours | NOT modulo 24. Shows total hours (e.g. `"48:00:00"` for 2 days) |
| Zero-padding | 2 digits each (e.g. `"01:01:01"`, not `"1:1:1"`) |
| Null/undefined/0 input | `"-"` |
| Formula | `H = floor(ms / 3600000)`, `M = floor((ms % 3600000) / 60000)`, `S = floor((ms % 60000) / 1000)` |
| Pseudocode | `if (!ms) return "-"; return pad2(H) + ":" + pad2(M) + ":" + pad2(S);` |

### **C. WIB Timezone Conversion Specification**

| Property | Value |
| ----- | ----- |
| Input | UTC datetime (ISO 8601, e.g. `2026-08-01T10:00:00Z`) |
| Target timezone | Asia/Jakarta (WIB, UTC+7, no DST) |
| Output format | `YYYY-MM-DD HH:mm:ss` (e.g. `"2026-08-01 17:00:00"`) |
| Library recommendation | `date-fns-tz` or `luxon` with IANA timezone support |
| Null input | `"-"` |
| DST note | Jakarta does not observe DST. Fixed UTC+7 offset year-round. |

### **D. Open Questions**

| ID | Question | Why It Matters | Status | Owner | Impact |
| ----- | ----- | ----- | ----- | ----- | ----- |
| OQ-D1 | **Effective Hour + Raw AUX data source**: Where does presence/AUX data live? Is it in people-service? Is there an `agentpresenceexportdata` collection in analytics? Or must PRD-A be extended with a 4th collection consuming people-service events? | **Blocking for Sheets 3-4.** Cannot build FR-013/014, FR-035/036/037/038 without defining the data source. | OPEN | Engineering / Product | Sheets 3-4 may ship separately or be "coming soon". |
| OQ-D2 | **Stage sub-breakdown mapping**: SAP ticket columns include "On Progress Dalam Penanganan Cabang", "Updated Cabang", "On Progress Dalam Konfirmasi Client", "Dikembalikan ke Cabang". Do these map to sub-stages of the "On Progress" stage in `ticketexportdata`? Does PRD-A store these as separate `stageDuration*Ms` fields, or must PRD-A be extended? | **Affects 4 ticket columns (26-29).** If PRD-A doesn't store sub-stage durations, these cells will show "-". | OPEN | BE / Product | Partial mapping acceptable for Phase 2. |
| OQ-D3 | **Conversation sheet gaps**: (a) Does `conversationNumber` field exist in `conversationexportdata`? (b) Does `conversationexportdata` store a `ticketId` cross-reference? (c) What field maps to "Jam Chat Masuk Bucket Agent (T2)" — is it the first assignment timestamp? | **Affects 3 conversation columns (2, 4, 11).** May need PRD-A field additions. | OPEN | BE / Product | "-" for missing fields in Phase 2. |
| OQ-D4 | **Separate date range for Effective Hour / Raw AUX**: Should sheets 3-4 use the same date range as sheets 1-2, or allow independent date ranges? | UX decision. Presence data may not cover the same date range as ticket/conversation data. | OPEN | PM | Same date range is simpler. |
| OQ-D5 | **Missing ticket fields**: (a) "Investigation Status" — not in PRD-A `ticketexportdata`. (b) "Comment CSAT" — not in PRD-A `ticketexportdata`. | **Affects 2 ticket columns (15, 31).** If fields don't exist in source, cells show "-". | OPEN | BE / Product | "-" acceptable for Phase 2. Add to PRD-A if fields exist in ticket-service. |
| OQ-01 (carryover) | Role Agent boleh export SAP report? | RBAC decision. | ASSUMED: No. Admin + Supervisor only. | PM | — |
| OQ-02 (carryover) | 4 sheet selalu sekaligus atau pilih? | UX decision. | ASSUMED: User can select sheets. | PM | — |
| OQ-05 (carryover) | Struktur SAP final — confirmed per contoh file analysis. | Contract with SAP. | ASSUMED: Confirmed. | PM / SAP | — |
| OQ-06 (carryover) | Topic/Sub-Topic source? | Field mapping. | ASSUMED: From `conversationexportdata.topic` / `subTopic`. | BE | — |

### **E. SAP Output File Reference**

| Property | Value |
| ----- | ----- |
| Reference file | `.hermes/desktop-attachments/SatuInbox_SAP_Report_31_07_2026.xlsx` |
| File size | 47.5 MB |
| Sheets | 4: Report Ticket, Report Conversation, Report Effective Hour, Raw AUX |
| Ticket rows | ~169,000 |
| Conversation rows | ~88,000 |
| Effective Hour rows | ~65,000 |
| Timezone | WIB (Asia/Jakarta, UTC+7) |
| Format | XLSX (Excel 2007+) |

### **F. Glossary**

| Term | Definition |
| ----- | ----- |
| SAP Report | 4-sheet Excel report format used by SAP team for operational reporting. Columns and structure defined by SAP business requirements. |
| WIB | Waktu Indonesia Barat (Western Indonesian Time). UTC+7. No DST. |
| AUX | Auxiliary status — agent away reason (Sholat, Break, Meeting, etc.). Tracked by people-service. |
| Effective Hour | Agent productive work hours. Calculated as shift hours minus away time. |
| PRD-A | Sub-PRD A: Export Row-Level Collections + Zero-Impact Sync Pipeline. |
| PRD-B | Sub-PRD B: Column Registry + Configurable Column Export. |
| PRD-C | Sub-PRD C: Broadcast Export. |
| Preset | A pre-defined column set for a specific export use case. System-managed presets are fixed; user presets are customizable. |
| Standalone mode | Phase 2: SAP preset appears as a fixed template option without PRD-B column picker. |
| Integrated mode | Phase 3+: SAP preset becomes a saved preset within PRD-B's column picker system. |
