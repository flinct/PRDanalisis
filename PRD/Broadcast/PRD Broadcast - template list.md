# **Product Requirement Document (PRD)**

**Feature:** Broadcast → Templates List (WhatsApp Web & WhatsApp API)

| Launch Date | 9 June 2025 |
| :---- | :---- |
| **Author** | Aryo, Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

# **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2025-09-30 | Aryo | Initial PRD for Templates List (search, filter, sort, pagination, open for edit, empty/error/loading). |

---

# **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a fast, organization-wide Templates List for WhatsApp Web (unofficial/Baileys) and WhatsApp API (official) so Admin/Supervisor can discover, filter, sort, and open templates for editing with full status visibility. |
| In Scope | Table list, search, multi-select filters (Channel, Category, Language, Status), sort on all columns, pagination, empty/error/loading UI, Create Template CTA, Edit action. |
| Out of Scope | Bulk actions, delete/archive, import/export, versioning, ownership transfer (future). |
| Success Criteria | P95 list load \<= 2s; P95 filter/sort response \< 750 ms; 0 data mismatch between row and edit view; \>= 90% users complete find+open within 8 s in usability tests. |

---

# **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Templates are numerous and span two channels with different states; discovery is slow without unified list and filters. | Longer campaign setup time, mis-sends using wrong status template. |
| PS-002 | Status meanings (especially Meta quality states) are unclear at-a-glance. | Avoidable edits/reviews, compliance risk. |

---

# **4\. Objectives and Key Results**

| Objective | Key Result | Target |
| ----- | ----- | ----- |
| Speed up discovery | P95 search/filter response time | \< 750 ms |
| Improve accuracy | Edit opened from the intended row (audit match) | 100% |
| Reduce setup time | Time to find and open a template | Median \<= 8 s |

---

# **5\. User Stories and Acceptance Criteria**

## **5.1 List, Search, Sort, Pagination**

| ID | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| US-001 | As an Admin/Supervisor, I want to see a paginated table of templates so I can browse quickly. | 1\. Given I open Templates, When the page loads, Then a table shows templates with columns defined in Section 9.2 and default sort Last modified (desc). 2\. Given there are more rows than page size, When I navigate pages, Then I see correct items and a footer "Showing X of Y". |
| US-002 | As a user, I want to search by name so I can find a specific template. | 1\. Given the list is loaded, When I type a keyword and press Enter, Then results return within 750 ms P95 and match substring case-insensitive on template name. 2\. Given no result, When search completes, Then I see an empty state with guidance and a "Create template" CTA. |
| US-003 | As a user, I want to sort by any column so I can order the list as needed. | 1\. Given table columns, When I click a column header, Then sort toggles asc/desc and an indicator shows the direction. 2\. Given equal values, When sorted, Then the order is stable within the subset (stable sort). |

## **5.2 Filters**

| ID | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| US-004 | As a user, I want to filter by Channel so I can isolate Web vs API templates. | 1\. Given the filter "Channel", When I select "WhatsApp Web" and/or "WhatsApp API", Then the table shows only matching rows. 2\. Given filters applied, When I reload or share URL, Then query state persists (URL params). |
| US-005 | As a user, I want to filter by Category (API only) so I can narrow review lists. | 1\. Given Category (Marketing, Utility, Authentication), When I select one or more, Then only rows with that category (API) are shown; Web rows display "—". |
| US-006 | As a user, I want to filter by Language so I can focus on a locale. | 1\. Given I select languages (English, Indonesian, etc.), When applied, Then only those languages appear. |
| US-007 | As a user, I want to filter by Status so I can act on review/quality states. | 1\. Given the Status filter, When I pick one or more defined statuses (Section 9.3), Then only matching rows appear. 2\. Given multiple filters active, When I click "Clear all", Then all filters reset and full list returns. |

## **5.3 Open for Edit**

| ID | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| US-008 | As a user, I want to open a row in edit so I can update the template. | 1\. Given a row is visible, When I click "Edit", Then the Template Edit screen opens and displays exactly the same core fields (name, language, header/body preview, channels, category for API, status). 2\. Given stale data, When Edit opens, Then the latest data is fetched before rendering fields. |

---

# **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | System MUST display a table with columns listed in Section 9.2 and default sort on Last modified (desc). |
| FR-002 | System MUST support search by template name (substring, case-insensitive). |
| FR-003 | System MUST provide multi-select filters for Channel, Category, Language, and Status with chips that can be cleared individually and via "Clear all". |
| FR-004 | System MUST allow sorting on all table columns, with visual indication of sort field and direction. |
| FR-005 | System MUST provide pagination controls (page size 25 default; options 25/50/100). |
| FR-006 | System MUST persist current query (search, filters, sort, page) in the URL so state survives refresh and is shareable. |
| FR-007 | System MUST show empty, loading (skeleton), and error states with actionable guidance. |
| FR-008 | System MUST include a primary "Create template" CTA and an "Edit" action per row. |
| FR-009 | System MUST restrict access to organization members with roles Admin or Supervisor; others see 403\. |
| FR-010 | System MUST localize all end-user UI copy in Bahasa Indonesia while keeping data values as stored. |
| FR-011 | System SHOULD refresh list data automatically on any filter/sort action and every 60 seconds while the page is active. |
| FR-012 | System SHOULD rank Status sort with the following precedence when sorting by Status: Active \- High quality \> Active \- Medium quality \> Active \- Low Quality \> Active \- Quality pending \> Appealed \- in Review \> In review \> Paused \> Disabled \> Rejected. |
| FR-013 | System SHOULD maintain stable sort order for equal values to avoid visual jumpiness. |

---

# **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Invalid filter/sort params | Ignore invalid parts and show banner; keep valid params applied. | "Filter tidak valid. Beberapa pilihan diabaikan." |
| EH-002 | 403 unauthorized | Block access and show 403 screen. | "Akses ditolak." |
| EH-003 | 5xx server error | Show error banner with Retry; preserve current query. | "Terjadi kesalahan server. Coba lagi." |
| EH-004 | Network timeout | Show inline toast and soft-retry once; on failure show Retry. | "Permintaan melebihi batas waktu. Coba lagi." |
| EH-005 | Row not found on Edit | Show toast and return to list with preserved query. | "Template tidak ditemukan." |

---

# **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EC-001 | No templates in org | Show empty state with CTA. | "Belum ada template. Mulai dengan membuat template baru." |
| EC-002 | Mixed channels in one row | Show "WhatsApp Web, WhatsApp API" in Channel; Category shows "—" if not applicable. | As labels. |
| EC-003 | Very long name/description | Truncate with ellipsis; full value on tooltip. | As labels. |
| EC-004 | Huge delivered count | Use thousands separators; numeric sort integrity preserved. | As labels. |
| EC-005 | Stale status (changed elsewhere) | Auto-refresh on next poll or filter/sort action; visual badge updates without full reload. | "Diperbarui beberapa saat yang lalu." |
| EC-006 | All filters yield zero results | Keep filters; show zero state with "Clear all". | "Tidak ada hasil. Ubah filter atau bersihkan semua." |

---

# **9\. UI & UX Requirements**

## **9.1 Top Bar**

| Component | Behavior | UI Copy (Bahasa Indonesia) | Traceability |
| ----- | ----- | ----- | ----- |
| Search input | Debounced (400 ms) or Enter to execute; clears with x icon. | Placeholder: "Cari nama template" | US-002 |
| Filter: Channel | Multi-select chips. | "Channel" options: "WhatsApp Web", "WhatsApp API" | US-004 |
| Filter: Category | Multi-select; API only values. | "Kategori" options: "Marketing", "Utility", "Authentication" | US-005 |
| Filter: Language | Multi-select locales. | "Bahasa" (e.g., "English", "Indonesian") | US-006 |
| Filter: Status | Multi-select statuses in 9.3. | "Status" | US-007 |
| Clear all | Clears all filters in one click. | "Bersihkan semua" | US-004..US-007 |
| Primary CTA | Opens create flow. | "Buat template" | FR-008 |

## **9.2 Table (Main UI)**

| Column | Description | Sortable | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| Template name | Primary name (lowercase\_underscored). Subtext: "Created by {user}". Optional third line: Description (one-line). | Yes | "Nama template" (sub: "Dibuat oleh {user}") |
| Channel | Comma list of channels. | Yes | "Channel" |
| Language | Localized language. | Yes | "Bahasa" |
| Message | Concise preview of header+body (first \~90 chars); variables shown literally like {{full\_name}}. | Yes | "Pesan" |
| Message delivered | Total sent metric (read-only). | Yes | "Pesan terkirim" |
| Status | Badge from Section 9.3. | Yes | "Status" |
| Last modified | Absolute date with relative tooltip. | Yes | "Terakhir diubah" |
| Action | Edit button per row. | N/A | "Edit" |

## **9.3 Status Badges (exact labels)**

| Status | Badge (Bahasa Indonesia) | Color hint |
| ----- | ----- | ----- |
| In review | "Dalam peninjauan" | Neutral |
| Rejected | "Ditolak" | Red |
| Paused | "Dijeda" | Amber |
| Appealed \- in Review | "Banding \- dalam peninjauan" | Amber |
| Disabled | "Dinonaktifkan" | Red |
| Active \- Quality pending | "Aktif \- kualitas menunggu" | Green-muted |
| Active \- Low Quality | "Aktif \- kualitas rendah" | Green-light |
| Active \- Medium quality | "Aktif \- kualitas sedang" | Green |
| Active \- High quality | "Aktif \- kualitas tinggi" | Green-dark |

For WhatsApp Web templates, show "Aktif \- kualitas tinggi" for consistency.

## **9.4 States**

| State | Behavior | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Loading | Show 8–12 row skeletons; controls disabled until first payload. | "Memuat..." |
| Empty | Illustration, guidance, CTA. | "Tidak ada template ditemukan. Sesuaikan filter atau buat template baru." |
| Error | Full-width banner with Retry; keep current query. | "Gagal memuat data. Coba lagi." |

---

# **10\. Field & Validation**

| Field | Constraints | Validation Behavior | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| Template name | Displayed as stored (lowercase\_underscore recommended). | Search is substring, case-insensitive. | N/A |
| Channel | One or both of Web/API. | Filter must match any selected channels. | N/A |
| Category | Marketing/Utility/Authentication (API only). | Filter ignores Web rows (display "—"). | "—" |
| Language | Supported locale names. | Filter must match exact selected locales. | N/A |
| Status | Must be one of Section 9.3. | Filter multi-select OR logic. Sorting uses precedence in FR-012. | N/A |
| Message delivered | Integer \>= 0\. | Sort numeric; shown with thousands separators. | N/A |
| Last modified | Valid datetime. | Sort chronological. | N/A |

---

# **11\. Non-Functional Requirements**

| Area | Target |
| ----- | ----- |
| Performance | P95 list endpoint \<= 700 ms for 30 items; client render \<= 300 ms after data arrival. |
| Reliability | 99.9% availability; graceful degradation on partial failures. |
| Security | RBAC enforced; org-level isolation; audit "Edit" opens. |
| Accessibility | Keyboard navigation for sort/filter; WCAG AA colors and focus rings. |
| Localization | All static UI text in Bahasa Indonesia. |

---

# **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| External | Meta template status feed (API) | Status mapping drift | Maintain mapping table; default to "Dalam peninjauan" on unknown. |
| Internal | Template Edit flow | Edit view fields must mirror list | Align contract; regression tests. |
| Internal | Analytics metric "Message delivered" | Eventual consistency can confuse sorting | Tooltip "Data mungkin tertunda". |

---

# **13\. Success Metrics**

| KPI | Definition | Target |
| ----- | ----- | ----- |
| List load performance | P95 time to first paint with data | \<= 2 s |
| Filter/sort responsiveness | P95 backend \+ render | \< 750 ms |
| Find-to-edit time | Median time to open target item | \<= 8 s |
| Error rate | 5xx per 1,000 requests | \<= 2 |

---

# **14\. Future Considerations**

| Idea | Benefit |
| ----- | ----- |
| Bulk actions (archive, enable/disable) | Ops efficiency at scale |
| Saved filter views per user | Faster repeat workflows |
| Import/export | Migration, audits |
| Versioning and diff | Safer edits and rollbacks |

---

# **15\. Limitations**

| Area | Limitation |
| ----- | ----- |
| Real-time metrics | "Message delivered" may lag live sends. |
| Ownership | No transfer or team ownership in MVP. |
| Actions | No bulk operations in MVP. |

---

# **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Roles | Admin, Supervisor (view \+ edit); others blocked. |
| Default page size | 25 (options 25/50/100). |
| Default sort | Last modified (desc). |

# **17\. ADDENDUM Feature: Broadcast Report via Offline Report Download**

## **17.1 Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Allow users to generate Broadcast report exports through the centralized Offline Report Download flow, so Ticket, Conversation, and Broadcast reports use one async export pipeline. |
| Data Granularity | 1 row \= 1 recipient send record or 1 Open API request recipient record. |
| Entry Point | Broadcast \> Messages \> Export redirects user to Offline Report Download with `Report Type = Broadcast`. |
| In Scope | Broadcast report type in Offline Report Download, async job creation, job history, secure XLSX download, Broadcast filters, Open API invalid request visibility, recipient-level status and reason. |
| Out of Scope | Direct synchronous export from Broadcast List, scheduled exports, recurring delivery, custom column builder, multi-sheet breakdown. |

---

## **17.2 Behavior Minimum Requirements**

| ID | Requirement |
| ----- | ----- |
| BR-001 | When user clicks **Export** from Broadcast \> Messages, system MUST redirect to Offline Report Download instead of generating a file directly. |
| BR-002 | Offline Report Download MUST support a new report type: `Broadcast`. |
| BR-003 | If user comes from Broadcast \> Messages, Offline Report Download SHOULD prefill Broadcast filters from the current list context. |
| BR-004 | User MUST be able to review and edit filters before submitting the export job. |
| BR-005 | Export job MUST process asynchronously using the same job lifecycle as Ticket and Conversation reports. |
| BR-006 | Export result MUST be `.xlsx`. |
| BR-007 | Export MUST include all matching rows, not only the current Broadcast List page. |
| BR-008 | Export MUST keep invalid, failed, canceled, scheduled, in-progress, and successful records visible in the file. |
| BR-009 | Export MUST NOT include `exportedByUserId`, `exportedByName`, or `appliedFiltersJson` as XLSX columns. |
| BR-010 | Request parameters MAY still be stored in Offline Report Download job parameter snapshot for traceability, but not inside the exported XLSX columns. |

---

## **17.3 User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-015 | P0 | As an Admin or Supervisor, I want Broadcast export to use Offline Report Download so all reports follow one flow. | 1\. Given I am on Broadcast \> Messages, When I click "Export", Then I am redirected to Offline Report Download with report type "Broadcast". 2\. Given Broadcast filters are active, When I land on Offline Report Download, Then supported filters are prefilled from the Broadcast list context. 3\. Given I submit the report request, When the job is created, Then I see "Permintaan laporan dibuat" and the job appears in the report list. |
| US-016 | P0 | As an Admin or Supervisor, I want to export recipient-level Broadcast results so I can audit delivery per recipient. | 1\. Given a Broadcast has multiple recipients, When the export completes, Then the XLSX contains 1 row per recipient send record. 2\. Given results span multiple pages, When exported, Then all matching rows are included. 3\. Given there are no matching results, When the job completes, Then the XLSX contains headers only. |
| US-017 | P0 | As an Admin or Supervisor, I want invalid Open API requests to appear in the export so I can debug integration issues. | 1\. Given an Open API request has invalid payload, When exported, Then the row status is `INVALID_REQUEST`. 2\. Given a request is invalid, When exported, Then the `reason` column contains a clear field-level validation reason. 3\. Given multiple fields are invalid, When exported, Then the `reason` column lists all invalid fields in readable text. |
| US-018 | P0 | As an Admin or Supervisor, I want export access to follow my session scope so I cannot export unauthorized Broadcast data. | 1\. Given my session allows only selected Team Inboxes, When I create a Broadcast report, Then only rows within my scope are exported. 2\. Given a row has `teamInboxIdAtSendTime = null`, When I export, Then it is included only if my role or permission allows viewing unassigned Broadcast records. 3\. Given I tamper with request parameters, When the job is processed, Then server-side scope validation still prevents unauthorized rows. |

---

## **17.4 Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Offline Report Integration | FR-072: System MUST add `Broadcast` as a selectable report type in Offline Report Download. FR-073: System MUST redirect Broadcast \> Messages \> Export to Offline Report Download. FR-074: System SHOULD prefill Offline Report Download fields using current Broadcast List filters when available. FR-075: System MUST allow user to modify prefilled filters before submission. |
| Job Processing | FR-076: Broadcast report MUST use the same async job processing model as Ticket and Conversation reports. FR-077: Broadcast report job MUST return success after job creation without waiting for XLSX generation. FR-078: Broadcast report job MUST appear in the same Offline Report Download job list. FR-079: Broadcast report file MUST follow the same secure download and retention rules as other offline reports. |
| Report Scope | FR-080: Export MUST include all matching Broadcast recipient records based on selected filters. FR-081: Export MUST NOT be limited to the current page. FR-082: Export MUST use `teamInboxIdAtSendTime` as the immutable historical Team Inbox scope field. FR-083: Export MUST apply server-side User Access Session validation during job creation and processing. |
| Broadcast Filters | FR-084: Broadcast report MUST support Date Range. FR-085: Broadcast report MUST support Status filter. FR-086: Broadcast report MUST support Channel filter. FR-087: Broadcast report MUST support Creator filter. FR-088: Broadcast report MUST support Team Inbox filter. FR-089: Empty filter selection MUST mean all values within requester permission scope. |
| Status Handling | FR-090: Broadcast recipient status MUST support `SUCCESS`, `IN_PROGRESS`, `SCHEDULED`, `FAILED`, `CANCELED`, `INVALID_NUMBER`, and `INVALID_REQUEST`. FR-091: `INVALID_REQUEST` MUST be used only when the Open API request payload fails validation before a valid send attempt can be created. FR-092: Provider send failures MUST use `FAILED`, not `INVALID_REQUEST`. FR-093: System MUST keep status mapping consistent between Broadcast Dashboard, Broadcast Detail, and Broadcast Report export. |
| Open API Invalid Request | FR-094: System MUST store invalid Open API request records when validation fails and the request is relevant for audit. FR-095: System MUST populate `reason` with clear validation detail for invalid requests. FR-096: If multiple validation errors exist, system MUST combine them into one readable reason string. FR-097: System MUST NOT drop invalid Open API records from export by default. FR-098: System SHOULD include sanitized request payload data for debugging. |
| XLSX Columns | FR-099: Export MUST NOT include `exportedByUserId`. FR-100: Export MUST NOT include `exportedByName`. FR-101: Export MUST NOT include `appliedFiltersJson`. FR-102: Export MUST protect against Excel formula injection by prefixing risky cell values that start with `=`, `+`, `-`, or `@` using `'`. |
| Attempt Number | FR-103: `attemptNumber` MUST be filled only for Open API retry records when attempt metadata exists. FR-104: Non Open API rows MUST show empty value for `attemptNumber`. FR-105: System MUST NOT infer attempt number when metadata is missing. |

---

## **17.5 Broadcast Report XLSX Columns**

| Group | Column Header | Type | Notes |
| ----- | ----- | ----- | ----- |
| Broadcast | `broadcastId` | string | Required when available |
| Broadcast | `broadcastName` | string | Nullable for invalid Open API request if no broadcast object was created |
| Broadcast | `channel` | enum | WhatsApp Web, WhatsApp API, Open API |
| Broadcast | `source` | enum | Dashboard, Open API |
| Time | `createdAt` | datetime | Request or send record created time |
| Time | `scheduledAt` | datetime | Nullable |
| Creator | `creatorUserId` | string | Nullable |
| Creator | `creatorName` | string | Nullable |
| Team Inbox | `teamInboxIdAtSendTime` | string | Nullable, immutable historical value |
| Team Inbox | `teamInboxNameAtSendTime` | string | Nullable |
| Sender | `senderAccountName` | string | Nullable for invalid request |
| Sender | `senderNumber` | string | Nullable |
| Recipient | `recipientNumber` | string | Nullable if invalid payload did not provide recipient |
| Recipient | `recipientName` | string | Nullable |
| Status | `status` | enum | SUCCESS, IN\_PROGRESS, SCHEDULED, FAILED, CANCELED, INVALID\_NUMBER, INVALID\_REQUEST |
| Status | `reason` | string | Required when status is FAILED, INVALID\_NUMBER, or INVALID\_REQUEST |
| Status | `failureSource` | enum | OPEN\_API, PROVIDER, SYSTEM, USER, empty when not failed |
| Attempt | `attemptNumber` | int | Open API only, nullable |
| Template and Content | `templateUsed` | string | Nullable |
| Template and Content | `messageContent` | string | Nullable, plain text |
| Open API | `requestId` | string | Nullable, useful for tracing Open API request |
| Open API | `idempotencyKey` | string | Nullable |
| Open API | `requestPayloadJson` | string | Nullable, sanitized payload only |
| Attributes | `attributesJson` | string | Nullable, full attributes serialized |

**Removed columns:**

| Removed Column | Reason |
| ----- | ----- |
| `exportedByUserId` | Already covered by Offline Report Download job metadata. Not needed in XLSX. |
| `exportedByName` | Already visible in job list as requester metadata. |
| `appliedFiltersJson` | Already stored in job parameter snapshot. Avoid duplicate noisy column in XLSX. |

---

## **17.6 Status Definition**

| Status | Meaning | Export Behavior | Dashboard Behavior |
| ----- | ----- | ----- | ----- |
| `SUCCESS` | Message sent successfully. | Include row. `reason` empty. | Show as success or delivered. |
| `IN_PROGRESS` | Send process is still running. | Include row. `reason` empty unless available. | Show as sending. |
| `SCHEDULED` | Broadcast is scheduled but not sent yet. | Include row. `scheduledAt` required. | Show as scheduled. |
| `FAILED` | Valid request was accepted but send failed due to provider, system, or user-side failure. | Include row. `reason` required. | Show as failed. |
| `CANCELED` | Broadcast was canceled before completion. | Include row. `reason` optional. | Show as canceled. |
| `INVALID_NUMBER` | Recipient address or number is invalid. | Include row. `reason` required. | Show as invalid recipient. |
| `INVALID_REQUEST` | Open API payload failed validation before send record could be processed. | Include row. `reason` required. | Show as invalid request. |

---

## **17.7 Invalid Request Reason Rules**

| Invalid Case | Example Reason |
| ----- | ----- |
| Missing recipient | `recipientNumber is required.` |
| Invalid recipient format | `recipientNumber must use E.164 format.` |
| Missing template | `templateId is required.` |
| Template not found | `templateId was not found or is not active.` |
| Missing message content | `messageContent is required when templateId is empty.` |
| Invalid scheduled time | `scheduledAt must be a future datetime.` |
| Invalid sender | `senderAccountId is not valid or not accessible.` |
| Invalid Team Inbox | `teamInboxId is not accessible for this API credential.` |
| Invalid attributes format | `attributes must be a valid JSON object.` |
| Multiple errors | `recipientNumber is required. templateId was not found. scheduledAt must be a future datetime.` |

---

## **17.8 Permission and Security**

| Area | Requirement |
| ----- | ----- |
| Access Control | Broadcast report creation MUST be available only to Admin and Supervisor unless explicitly granted by RBAC. |
| Scope Enforcement | Export MUST apply the same User Access Session scope as Broadcast List and Detail. |
| Team Inbox Scope | Rows are included only if `teamInboxIdAtSendTime` is within requester scope. |
| Unassigned Rows | Rows with `teamInboxIdAtSendTime = null` are included only when requester has permission to view unassigned Broadcast records. |
| Download Security | Download MUST use Offline Report Download secure link rules. Raw storage URLs MUST NOT be exposed. |
| Payload Sanitization | `requestPayloadJson` MUST mask authorization headers, tokens, API keys, credentials, and secrets. |
| Formula Injection | XLSX generation MUST escape formula-like values. |

---

## **17.9 Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-015 | Permission | Block Broadcast report creation if user lacks permission. | "Akses ditolak". |
| EH-016 | Validation | Invalid Offline Report Download fields block submission. | "Parameter laporan tidak valid". |
| EH-017 | Empty Result | Job completes with headers-only XLSX. | "Laporan selesai tanpa data". |
| EH-018 | Processing | Job fails if XLSX generation fails. Store failure reason. | "Gagal membuat laporan". |
| EH-019 | Download | Expired file follows Offline Report Download retention behavior. | "File sudah kedaluwarsa". |
| EH-020 | Scope Changed | Re-check permission at download time. Block if access removed. | "Akses ditolak". |
| EH-021 | Invalid Open API Payload | Store row or request record as `INVALID_REQUEST` with reason. | No blocking in export. Visible in XLSX. |

---

## **17.10 Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-019 | User clicks Export from Broadcast List with active filters | Redirect to Offline Report Download and prefill supported filters. |
| EC-020 | User changes filters after redirect | Export uses final submitted Offline Report Download filters, not original Broadcast List filters. |
| EC-021 | Broadcast has mixed statuses | Export includes all rows unless status filter excludes them. |
| EC-022 | Open API request invalid before broadcast object is created | Export row may have empty `broadcastId` and `broadcastName`, but MUST include `requestId`, `status = INVALID_REQUEST`, and `reason`. |
| EC-023 | Invalid request has no recipient number | `recipientNumber` remains empty and reason explains missing recipient. |
| EC-024 | Team Inbox mapping changes after send | Export uses historical `teamInboxIdAtSendTime`. |
| EC-025 | Attempt metadata missing | `attemptNumber` remains empty. No inference. |
| EC-026 | Very large payload | Export sanitized JSON as text. If truncation is required, system MUST append `[truncated]` in the cell. |
| EC-027 | User tampers Team Inbox filter | Server-side scope validation still applies. Unauthorized rows are excluded or request is denied. |

---

## **17.11 UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Broadcast Export Button | Button label remains "Export". | User clicks Export from Broadcast \> Messages. System redirects to Offline Report Download. | US-015 |
| Offline Report Type | Add report type option "Broadcast". | User selects or lands with Broadcast preselected. | US-015 |
| Prefilled Filters | Date Range, Status, Channel, Creator, Team Inbox are prefilled when available. | User reviews filters before submit. | US-015 |
| Submit Button | Uses existing Offline Report Download submit behavior. | User clicks "Submit". Job is created. | US-015 |
| Job List | Shows Broadcast jobs together with Ticket and Conversation jobs. | User monitors status and downloads when completed. | US-016 |
| Status Filter | Includes Broadcast statuses, including "Invalid Request". | User can export only invalid requests for debugging. | US-017 |
| Download Action | Uses existing "Unduh" action. | Enabled only when job is completed. | US-016 |

**UI copy:**

| Key | Copy |
| ----- | ----- |
| Report type | "Broadcast" |
| Status label | "Invalid Request" |
| Submit success | "Permintaan laporan dibuat" |
| Empty completed report | "Laporan selesai tanpa data" |
| Invalid parameter | "Parameter laporan tidak valid" |
| Download | "Unduh" |

---

## **17.12 Non-Functional Requirements**

| ID | Category | Requirement |
| ----- | ----- | ----- |
| NFR-011 | Performance | Job creation response P95 MUST stay under 1 second. |
| NFR-012 | Processing | Broadcast report processing SHOULD not block Broadcast List performance. |
| NFR-013 | Reliability | 98 percent of Broadcast export jobs SHOULD reach terminal status. |
| NFR-014 | Security | Export MUST enforce tenant isolation and requester scope. |
| NFR-015 | Privacy | Sanitized payload export MUST not expose secrets, tokens, API keys, or credentials. |
| NFR-016 | Observability | System MUST log job status, row count, invalid request count, failed count, file size, and processing duration. |

---

## **17.13 Appendix**

| Item | Content |
| ----- | ----- |
| Report Type | Broadcast |
| Default Format | XLSX |
| Sheet Name | Recipient Send Records |
| Default Sort | `createdAt desc` |
| New Status | `INVALID_REQUEST` |
| Recommended Status Strategy | Keep dashboard status values consistent. Use `FAILED` for valid request send failure. Use `INVALID_REQUEST` only for invalid Open API payload validation. |
| Removed XLSX Columns | `exportedByUserId`, `exportedByName`, `appliedFiltersJson` |
| Export Pipeline | Offline Report Download only |

