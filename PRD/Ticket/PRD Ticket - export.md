# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticketing \- Export Ticket List (XLSX)  
**Product**: SatuInbox

| Role | Name |
| ----- | ----- |
| Product Manager | Yusril Ibnu Maulana |
| Engineering Lead | Naftal |
| Design Lead | Resky |
| Contributors | Engineering Team, QA Team, Design Team |
| Version | v1.0 |
| Last Updated (Asia/Jakarta) | 2026-02-09 |

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-02-09 | PM Assistant | Initial PRD for Ticket List export (XLSX), includes default columns \+ last reply message, optional custom fields when ticket type context is active. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable users to export the current Ticket List into XLSX for reporting and offline analysis, including last reply metadata and last reply message. |
| Outcome | Faster ops reporting, easier sharing across internal teams, and reduced manual copy-paste from Ticket List UI. |

### **Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Export Ticket List to **XLSX** only. | CSV export. |
| Default columns exactly as provided (see Section 10). | Export full conversation thread or activity log. |
| Always include: Last Reply By, Last Reply At, Last Reply Message. | Per-column selection UI, custom column builder. |
| Export respects current Ticket List filters, search, and sort snapshot at export time. | Scheduled exports, email delivery, recurring reports. |
| If the current context is **single ticket type** (ticket\_type\_id is set), append ticket type **custom field columns** for supported types: text, select, date, file. | Export custom fields when ticket list is "All ticket types" context. |
| Asynchronous export job, with progress, completion, and secure download link. | Real time streaming export in browser tab. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Users need reporting from Ticket List, but data is trapped in UI. | Manual work, errors, and slower operational decisions. |
| PS-002 | Users need last reply context without opening each ticket. | Longer investigation time and inconsistent follow ups. |
| PS-003 | Ticket Type custom fields are needed only when working per type. | Export becomes noisy if always included, but incomplete if never included. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result | Target |
| ----- | ----- | ----- |
| Reduce manual reporting effort | Time to prepare weekly ticket report | \-50% within 4 weeks |
| Improve visibility on latest handling | % exports that include last reply fields correctly | 99% within 4 weeks |
| Keep export relevant per context | % exports with correct custom field columns when ticket type context active | 95% within 8 weeks |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a user, I want to export the current Ticket List into XLSX so I can analyze it offline. | 1\. Given I am on Ticket List, When I click **Ekspor**, Then the system creates an export job **using the current filters**, search, and sort snapshot. 2\. Given the export job is created, When processing starts, Then I see a progress state and can close the modal without canceling the job. 3\. Given the job is completed, When I click **Unduh file**, Then an XLSX downloads successfully. |
| US-002 | P0 | As a user, I want the export to always include last reply fields so I do not open each ticket. | 1\. Given a ticket has messages, When exported, Then **Last Reply By**, **Last Reply At**, **Last Reply Message** are populated based on visibility rules in FR-009. 2\. Given a ticket has no messages, When exported, Then last reply columns are set to **\-**. |
| US-003 | P0 | As a user, I want exports in "All tickets" context to include only default columns so the file stays clean. | 1\. Given the ticket list context is "All ticket types", When I export, Then the XLSX contains only the default columns (no custom field columns). 2\. Given I switch filters after starting export, When export completes, Then the result still matches the snapshot at export time. |
| US-004 | P0 | As a user, I want exports in a specific ticket type context to include the ticket type custom fields. | 1\. Given the ticket list context has exactly one ticket type selected, When I export, Then custom field columns for that ticket type are appended after the default columns. 2\. Given a custom field type is unsupported, When I export, Then the column is omitted (MVP) and the job still succeeds. |
| US-005 | P0 | As an admin, I want export access controlled so sensitive fields (email, phone, message text) are not exposed to unauthorized roles. | 1\. Given I do not have export permission, When I open Ticket List, Then **Ekspor** is hidden or disabled with message **Anda tidak punya akses untuk mengekspor tiket.** 2\. Given I have export permission, When I export, Then the file includes all default columns including email, phone, and last reply message. |
| US-006 | P1 | As a user, I want a predictable file structure so downstream spreadsheets and automations do not break. | 1\. Given I export multiple times, When I compare XLSX headers, Then header names and order are consistent per context (All vs ticket type). 2\. Given custom fields are included, When exported, Then each column header is stable using the custom field label (and key disambiguation if needed). |
| US-007 | P1 | As a user, I want the system to handle large exports safely with clear limits. | 1\. Given the filtered result exceeds the export limit, When I click **Ekspor**, Then the system blocks export and shows **Jumlah tiket melebihi batas ekspor. Persempit filter Anda.** 2\. Given the result is within limit, When I export, Then the job completes without UI freezing. |
| US-008 | P1 | As a user, I want download links to be secure and time-limited. | 1\. Given an export is completed, When I click **Unduh file**, Then the system issues a time-limited download URL and downloads the file. 2\. Given the download link expires, When I click again, Then the system regenerates a new download link if the file is still retained. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| FR-001 Export entry point | 1\. FR-001: System MUST expose **Ekspor** action on Ticket List UI for users with permission. 2\. FR-002: System MUST export using the current Ticket List query snapshot (filters, search keyword, sort, and selected columns context). |
| FR-002 Format and worksheet | 1\. FR-003: System MUST generate **XLSX** format only. 2\. FR-004: System MUST generate a single worksheet named `Tickets`. 3\. FR-005: System MUST freeze the first row (header). |
| FR-003 Column schema | 1\. FR-006: System MUST include default columns in the exact order provided (Section 10). 2\. FR-007: System MUST always include the last reply fields (Last Reply By, Last Reply At, Last Reply Message). |
| FR-004 Context behavior | 1\. FR-008: If ticket\_type\_id is NOT set (All tickets context), system MUST NOT include custom field columns. 2\. FR-009: If exactly one ticket\_type\_id is set, system MUST append that ticket type custom fields for supported types only: text, select, date, file. |
| FR-005 Visibility rules for last reply | 1\. FR-010: System MUST compute Last Reply fields based on the latest message in the ticket timeline that the exporting user is allowed to see. 2\. FR-011: For roles that cannot view internal notes, system MUST exclude internal note messages when computing Last Reply fields. 3\. FR-012: If the latest visible message is an attachment-only message with empty body, system MUST set Last Reply Message to **\-**. |
| FR-006 Custom field rendering | 1\. FR-013: Text field exports as plain string. 2\. FR-014: Select field exports as the selected option label (string). 3\. FR-015: Date field exports as Excel date value with display format `yyyy-mm-dd`. 4\. FR-016: File field exports as an authenticated deep link to the file inside SatuInbox (not a public URL). If no file, export **\-**. |
| FR-007 Asynchronous job | 1\. FR-017: Export MUST run as an asynchronous job with statuses: `queued`, `processing`, `completed`, `failed`. 2\. FR-018: System MUST show job progress in UI and allow user to close the UI without canceling the job. 3\. FR-019: System MUST store the job snapshot including query filters and the generated file reference. |
| FR-008 Limits and retention | 1\. FR-020: System MUST enforce a max export row limit (configurable). Default: 10,000 rows. 2\. FR-021: System MUST retain generated XLSX for a limited retention period (configurable). Default: 7 days. 3\. FR-022: After retention, system MUST delete the file and mark download unavailable. |
| FR-009 Permissions | 1\. FR-023: System MUST gate export by permission `ticket.export` (RBAC). 2\. FR-024: System MUST only export tickets that the user can access in Ticket List (tenant \+ inbox \+ role rules). |
| FR-010 Auditing and observability | 1\. FR-025: System MUST log an audit event for export job created, completed, failed, and downloaded. 2\. FR-026: System MUST capture export job metrics: duration, row\_count, file\_size, status. |

---

## **7\. Error Handling**

| ID | Scenario | Handling | UI Copy (Bahasa Indonesia only) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission denied | Block export action, hide or disable button | Anda tidak punya akses untuk mengekspor tiket. |
| EH-002 | Job creation fails | Do not start job, show retry | Gagal membuat ekspor. Coba lagi. |
| EH-003 | Export exceeds row limit | Block export, suggest narrowing filters | Jumlah tiket melebihi batas ekspor. Persempit filter Anda. |
| EH-004 | Job processing fails | Mark job failed, allow retry export | Ekspor gagal diproses. Coba lagi. |
| EH-005 | Download link expired | Regenerate link if file retained | Tautan unduhan kedaluwarsa. Coba unduh lagi. |
| EH-006 | File no longer retained | Disable download | File ekspor sudah kedaluwarsa. Silakan ekspor ulang. |
| EH-007 | Partial data for some fields | Fill missing cell with `-`, job still completes | Sebagian data tidak tersedia dan akan ditampilkan sebagai \-. |

---

## **8\. Edge Cases**

| ID | Case | Handling | UI Copy (Bahasa Indonesia only) |
| ----- | ----- | ----- | ----- |
| EC-001 | Ticket has no title | Export `Tanpa judul` in Ticket title | \- |
| EC-002 | Ticket has multiple assignees | Export as comma-separated list in Agent | \- |
| EC-003 | Ticket has multiple tags | Export as comma-separated list in Tag | \- |
| EC-004 | Last message is internal note but exporter cannot view internal notes | Skip internal note, use latest visible public message | \- |
| EC-005 | Last reply message exceeds Excel cell limit | Truncate to 32,000 chars and append `...` | \- |
| EC-006 | Custom field labels collide (same label) | Disambiguate header with `(field_key)` suffix | \- |
| EC-007 | Ticket type context selected but some tickets have missing custom fields | Export `-` for missing values | \- |
| EC-008 | File custom field contains multiple files | Export first file deep link (MVP), remaining omitted | \- |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Export button | Action on Ticket List toolbar | 1\. User clicks **Ekspor**. 2\. System creates job and shows modal status. | US-001, US-005 |
| Export modal (status) | Shows job status: queued, processing, completed, failed | 1\. When queued: show spinner and text **Menyiapkan ekspor...** 2\. When processing: show progress text **Memproses ekspor...** 3\. When completed: show **Unduh file** button. 4\. When failed: show **Coba lagi**. | US-001, US-007 |
| Completion toast | Lightweight confirmation | On completion, show toast **Ekspor siap diunduh.** with action **Unduh** | US-001 |
| Error states | Predictable errors with recovery | Show messages from Section 7, keep user on Ticket List | US-005, US-007 |
| Context hint | Clarifies whether custom fields are included | In modal, show subtitle: \- All context: **Kolom umum saja** \- Ticket type context: **Termasuk custom field ticket type** | US-003, US-004 |

---

## **10\. Field & Validation**

### **10.1 Default Export Columns (Order is fixed)**

| Column Header | Type | Example | Validation | Required | Editable | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Ticket ID | string | TK-6749104949 | Non-empty | Yes | No | Unique identifier |
| Ticket title | string | Life Problem | If empty, set `Tanpa judul` | Yes | No | From ticket title |
| Client (Contact) | string | Brian Wakwaw | `-` if missing | No | No | Display name |
| Channel | enum | WA | Must be valid channel label | Yes | No | From ticket channel |
| Priority | enum/string | High | `-` if missing | No | No | Tenant config |
| Agent | string | John Doe, Jane Doe | `-` if none | No | No | Assignees joined by `,` |
| Status | enum/string | Waiting on Customer | `-` if missing | No | No | Per ticket type config |
| Sentiment | enum/string | Neutral | `-` if unknown | No | No | Values depend on current system |
| Inbox | string | Team Inbox Sales | Non-empty when ticket has team inbox | No | No | Team inbox label |
| Tag | string | shipping, refund | `-` if none | No | No | Ticket tags joined by `,` |
| Level | string | VIP | `-` if missing | No | No | Tenant-defined attribute |
| First Reply Time | duration | 01:12:30 | Must be \>= 0 or `-` | No | No | Excel duration format `[h]:mm:ss` |
| Customer First Wait | duration | 00:45:10 | Must be \>= 0 or `-` | No | No | Excel duration format `[h]:mm:ss` |
| Created Date | datetime | 2026-02-01 10:01:00 | Valid timestamp | Yes | No | Timezone Asia/Jakarta |
| Closed Date | datetime | 2026-02-01 18:20:00 | `-` if not closed | No | No | Timezone Asia/Jakarta |
| Updated Date | datetime | 2026-02-01 18:21:10 | Valid timestamp | Yes | No | Timezone Asia/Jakarta |
| Customer Email | string | user@mail.com | `-` if missing | No | No | PII |
| Customer Phone | string | \+62 812... | `-` if missing | No | No | PII |
| Lifetime | duration | 08:19:00 | Must be \>= 0 | No | No | Closed \- Created, else Updated \- Created |
| SLA | string | FRT ok, Resolve overdue | `-` if missing | No | No | Summary string (MVP) |
| Description | string | Customer said hello... | Truncate to 32,000 chars | No | No | From ticket description |
| Last Reply By | string | AGENT John Doe | `-` if no messages | No | No | Based on visibility rules |
| Last Reply At | datetime | 2026-02-01 18:10:00 | `-` if no messages | No | No | Timezone Asia/Jakarta |
| Last Reply Message | string | Please provide AWB... | Truncate to 32,000 chars | No | No | Based on visibility rules |

### **10.2 Custom Field Columns (Only when single ticket type context is active)**

| Custom Field Type | Export Cell Type | Example | Rules |
| :---- | :---- | :---- | :---- |
| Text | string | "AWB 123456" | Plain string |
| Select (dropdown option) | string | "Refund" | Export selected option label |
| Date (calendar) | date | 2026-02-01 | Excel date value, format yyyy-mm-dd |
| File | string (deep link) | "Lihat file" | Export authenticated deep link to the file in SatuInbox, not a public URL |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Export job creation UI acknowledgement \<= 300ms after server accepts job. |
| Performance | 10,000 rows export completes \<= 2 minutes P95 (baseline target). |
| Reliability | Job processing must be idempotent per job\_id. Retry on transient failures up to 3 times with backoff. |
| Security | Export permission required. Download link must be time-limited. Stored file must be private. |
| Privacy | Export includes PII fields only for authorized roles. Audit download events. |
| Observability | Metrics: job\_duration\_ms, row\_count, file\_size\_bytes, status. Logs for create, complete, fail, download. |
| Accessibility | Export button and modal controls keyboard reachable with clear focus order. |
| Localization | All UI labels and messages in Bahasa Indonesia. |

---

## **12\. Dependencies & Risks**

| Type | Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| Dependency | Ticket List query snapshot capability (filters, sort) | Backend | Wrong dataset exported | Store query snapshot in job payload |
| Dependency | Efficient retrieval of last visible message per ticket | Backend | Slow exports | Use precomputed last\_message fields or optimized query |
| Dependency | Custom field schema per ticket type | Backend | Wrong custom field columns | Use ticket type config as source of truth |
| Risk | Data leakage via exported XLSX sharing | Product | PII exposure | Strict RBAC for export, audit logs, retention limit |
| Risk | Large exports overload workers | Engineering | Queue delays | Enforce row limits, throttling, and backpressure |
| Risk | Inconsistent duration formats | Product | Hard to analyze in Excel | Standardize Excel duration format `[h]:mm:ss` |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Export success rate | \>= 99% | 30 days | Export job logs |
| Median time to complete export (10k rows) | \<= 2 minutes | 30 days | Job metrics |
| % exports downloaded after completion | \>= 70% | 30 days | Download audit events |
| Support tickets about export mismatch | \-50% | 8 weeks | Support analytics |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| CSV support | Integrations and lightweight pipelines |
| Column picker | Different teams need different views |
| Multi-sheet output | Separate summary, SLA breakdown, and custom fields |
| Scheduled exports | Automated reporting |
| Export center page | Better discoverability of past exports |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No CSV | Users must use XLSX only |
| No full conversation export | Only last reply is available |
| Only single ticket type custom fields supported | Multi-type export does not include custom fields |
| Unsupported custom field types omitted | Some data may not be exportable in MVP |

---

## **16\. Appendix**

### **UI Copy Glossary (Bahasa Indonesia only)**

* Ekspor  
* Menyiapkan ekspor...  
* Memproses ekspor...  
* Ekspor siap diunduh.  
* Unduh file  
* Coba lagi  
* Anda tidak punya akses untuk mengekspor tiket.  
* Gagal membuat ekspor. Coba lagi.  
* Jumlah tiket melebihi batas ekspor. Persempit filter Anda.  
* Ekspor gagal diproses. Coba lagi.  
* Tautan unduhan kedaluwarsa. Coba unduh lagi.  
* File ekspor sudah kedaluwarsa. Silakan ekspor ulang.

