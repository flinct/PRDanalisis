# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Offline Report Download (Ticket, Conversation, and Broadcast)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-03-05 | Yusril\[ | Initial PRD for Offline Report Download MVP. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide asynchronous exports that users can request and download later without blocking the UI. |
| Scope | MVP includes a single page to create export jobs and view job history for Ticket and Conversation, output XLSX. |

| In Scope | Out of Scope |
| ----- | ----- |
| Channel selector: Ticket or Conversation. | Keyword filter. |
| Date type fixed to Create Date. | Other date types. |
| Start Date, Start Time, End Date, End Time. | Ticket IDs filter. |
| Max date range 30 days. | Date ranges greater than 30 days. |
| Template selection using system-managed templates only. | Template builder and template CRUD. |
| Ticket templates: Default Ticket plus Ticket Type templates (dynamic count). | Custom templates created by users. |
| Conversation template: Default Conversation always includes custom attributes and metadata. | Selective inclusion of conversation custom attributes and metadata. |
| Employee filter. | Employee group filter. |
| Status filter with internal codes and customizable labels. | Additional filters such as queue, folder, archive, prefix, zone, aging. |
| Format fixed to XLSX. | CSV export. |
| Asynchronous job processing, job list, secure download link. | Scheduled exports and email delivery. |
| Retention 7 days for completed files. | Retention customization. |
| Conversation export supports folder exclusion: Exclude Junk, Exclude Spam, atau Exclude both (via Status section, Conversation only). |  |

## **3\. Problem Statement**

| \# | Problem | Impact |
| ----- | ----- | ----- |
| 1 | Large exports block the UI. | Users abandon exports and reporting is delayed. |
| 2 | No traceable export history. | Repeated exports and weak auditability. |
| 3 | Ticket schema differs by Ticket Type. | Exports become either noisy or incomplete without proper template strategy. |
| 4 | Conversation data relies heavily on metadata and custom attributes. | Default exports are incomplete without those fields. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Reduce UI waiting | P95 job submission response time under 1 second. |
| Improve reliability | 98 percent of created jobs reach a terminal status. |
| Improve traceability | 100 percent of completed jobs show parameter snapshot in the list. |
| Align ticket exports | Ticket template output matches Ticket List Export column rules for Default Ticket and Ticket Type templates. |
| Improve conversation completeness | Default Conversation export includes all custom attributes and metadata keys within scope. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin or Supervisor, I want to access the offline report page so I can request exports. | 1\. Given I am an Admin, When I open the page, Then I can view the filter form and the job list. 2\. Given I am a Supervisor, When I open the page, Then I can view the filter form and the job list. 3\. Given I am an Agent, When I open the page, Then I see "Akses ditolak". |
| US-002 | P0 | As a user, I want to choose Ticket or Conversation so I can export the correct dataset. | 1\. Given I select "Tiket", When the template dropdown opens, Then I see Default Ticket and Ticket Type templates. 2\. Given I select "Percakapan", When the template dropdown opens, Then I see only Default Conversation. 3\. Given I switch channel, When the previously selected template is invalid, Then it resets and shows "Template tidak tersedia". |
| US-003 | P0 | As a user, I want to set a create date time range so I can export a specific period. | 1\. Given I input Start and End, When Start is after End, Then submission is blocked and I see "Rentang tanggal tidak valid". 2\. Given I input a range greater than 30 days, When I click "Submit", Then submission is blocked and I see "Maksimal rentang 30 hari". 3\. Given any date or time field is empty, When I click "Submit", Then submission is blocked and I see "Wajib diisi". |
| US-004 | P0 | As a user, I want a predictable template strategy so downstream spreadsheets do not break. | 1\. Given I export Ticket using Default Ticket template, When I compare headers across exports, Then the header names and order are consistent. 2\. Given I export Ticket using a Ticket Type template, When I compare headers for the same Ticket Type, Then the header names and order are consistent. 3\. Given I export Conversation using Default Conversation, When I compare headers, Then the base columns are consistent and the custom attributes and metadata columns follow a deterministic ordering rule. |
| US-005 | P0 | As a user, I want Ticket Type templates to include that Ticket Type custom fields so I can export full operational detail. | 1\. Given I select a Ticket Type template, When I submit, Then the export includes default ticket columns plus that Ticket Type custom fields appended. 2\. Given I select a Ticket Type template, When I submit, Then the dataset is restricted to that Ticket Type only. 3\. Given a custom field type is unsupported, When I export, Then that field column is omitted and the job still completes. |
| US-006 | P0 | As a user, I want Conversation exports to always include custom attributes and metadata so I can analyze operational context. | 1\. Given I export Conversation with Default Conversation template, When the file is generated, Then the export includes base conversation columns plus all custom attribute keys and metadata keys within the exported dataset scope. 2\. Given a conversation has no value for a key, When exported, Then the cell value is "-". 3\. Given metadata contains nested objects, When exported, Then the cell contains a JSON string value. |
| US-007 | P0 | As a user, I want to filter by Employee so I can export records owned by specific members. | 1\. Given I open Employee filter, When I search, Then I can select members within my permission scope. 2\. Given I select employees, When I submit, Then only records whose primary assignee matches the selected employees at job start time are exported. 3\. Given I select an invalid employee, When I submit, Then submission is blocked and I see "Agent tidak valid". |
| US-008 | P0 | As a user, I want to filter by Status so I can export a subset of records. | 1\. Given I open Status filter, When I view options, Then I see workspace configured labels mapped to internal codes. 2\. Given I select one or more statuses, When I submit, Then the export filters by internal status codes corresponding to selected labels. 3\. Given labels change after job creation, When I view job parameters, Then I still see the label snapshot used for that job. |
| US-009 | P0 | As a user, I want the format to be fixed to XLSX so I can download a consistent file type. | 1\. Given I am on the page, When I view the format field, Then it shows "EXCEL" and is not editable. 2\. Given a job completes, When I download, Then the file extension is .xlsx. 3\. Given file generation fails, When the job ends, Then the status is "Gagal" and a reason is shown. |
| US-010 | P0 | As a user, I want to submit an offline export job and continue working while it processes. | 1\. Given my inputs are valid, When I click "Submit", Then I see "Permintaan laporan dibuat" and a new row appears with status "Diproses". 2\. Given I leave the page, When I return, Then the job row remains visible with updated status. 3\. Given I submit identical parameters while an identical job is active, When I click "Submit", Then no new job is created and I see "Permintaan yang sama masih diproses". |
| US-011 | P0 | As an Admin, I want to see jobs created by other allowed users so I can support operations. | 1\. Given I am an Admin, When I open the page, Then I can see jobs created by Admins and Supervisors in the workspace. 2\. Given I am an Admin, When I view a row, Then I see "Diminta Oleh". 3\. Given I lost access to underlying data, When I try to download, Then I see "Akses ditolak". |
| US-012 | P0 | As a Supervisor, I want my export scope limited to my Team Inbox scope so I do not export other team data. | 1\. Given I am a Supervisor, When I submit a job, Then the export is restricted to my accessible Team Inbox scope. 2\. Given I am a Supervisor, When I view the list, Then I only see jobs I created. 3\. Given my access changes, When I download, Then access is re-checked and blocked if needed. |
| US-013 | P0 | As a user, I want secure downloads with retention rules so exports are controlled. | 1\. Given a job is completed, When I click "Unduh", Then the system downloads without exposing raw storage URLs. 2\. Given the link expires, When I click again within retention, Then the system regenerates a new link. 3\. Given the job completed more than 7 days ago, When I open the list, Then status is "Kedaluwarsa" and download is disabled. |
| US-014 | P0 | As a user, I want to exclude Junk and/or Spam conversations so exported data stays clean. | 1\. Given channel \= Conversation, When I enable **Exclude Junk**, Then exported dataset MUST exclude records in Junk folder. 2\. Given channel \= Conversation, When I enable **Exclude Spam**, Then exported dataset MUST exclude records in Spam folder. 3\. Given both toggles enabled, Then records in Junk **or** Spam MUST be excluded. 4\. Given both toggles disabled, Then Junk and Spam records MAY be included (subject to other filters). 5\. Given I create a job, Then the exclusion flags are stored in job parameter snapshot and applied during processing. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| RBAC and Scope | FR-001: System MUST allow page access only for Admin and Supervisor. FR-002: System MUST block Agent access and show "Akses ditolak". FR-003: System MUST allow job creation only for Admin and Supervisor. FR-004: System MUST scope Supervisor exports to Supervisor accessible Team Inbox scope. FR-005: System MUST allow Admin exports across workspace scope. FR-006: System MUST re-check permission at download time and block if access is removed. |
| Channel | FR-007: System MUST provide a channel selector with values "Tiket" and "Percakapan". FR-008: System MUST store selected channel in job parameter snapshot. |
| Date Range | FR-009: System MUST support date type "Tanggal Dibuat" only in MVP. FR-010: System MUST require Start Date, Start Time, End Date, End Time. FR-011: System MUST validate Start is not after End. FR-012: System MUST enforce max range of 30 days inclusive. FR-013: System MUST interpret date time using workspace timezone Asia/Jakarta. FR-014: System MUST store start and end date time in job parameter snapshot. |
| Template Strategy | FR-015: System MUST provide system-managed templates only. FR-016: System MUST NOT allow user-created templates in MVP. FR-017: System MUST store template name snapshot in job parameter snapshot. FR-018: System MUST generate XLSX columns based on the template snapshot at job creation time. |
| Ticket Templates | FR-019: For channel Ticket, system MUST provide "Default Ticket" template. FR-020: For channel Ticket, system MUST provide one template per active Ticket Type named "Ticket \- {Ticket Type Name}". FR-021: Ticket Type templates count MUST be dynamic based on workspace Ticket Types. FR-022: Default Ticket template MUST export only default ticket columns. FR-023: Ticket Type template MUST export default ticket columns plus that Ticket Type custom fields appended. FR-024: When a Ticket Type template is selected, system MUST restrict dataset to that Ticket Type only. FR-025: Ticket custom fields supported types MUST include text, select, date, file. FR-026: Unsupported custom field types MUST be omitted from export and MUST NOT fail the job. |
| Conversation Template | FR-027: For channel Conversation, system MUST provide only one template named "Default Conversation". FR-028: Default Conversation MUST include base conversation columns plus all custom attributes and metadata keys within dataset scope at job start time. FR-029: Custom attributes columns MUST be prefixed "CA: " plus key name. FR-030: Metadata columns MUST be prefixed "META: " plus key name. FR-031: Conversation custom attributes and metadata column order MUST be deterministic using ascending key name ordering. FR-032: If a key count exceeds 200, system MUST export first 200 keys and MUST include overflow JSON columns "CA JSON" and "META JSON". FR-033: Nested objects and arrays MUST be exported as JSON string values. |
| Employee Filter | FR-034: System MUST provide an Employee selector restricted to requester permission scope. FR-035: System MUST allow selecting zero or more employees. FR-036: Empty employee selection MUST mean all employees within scope. FR-037: Employee filter MUST match primary assignee at job start time. FR-038: System MUST store selected employee display names snapshot in job parameter snapshot. |
| Status Filter | FR-039: System MUST support internal status codes UNASSIGNED, ONGOING, RESOLVED for Ticket and Conversation exports. FR-040: System MUST allow workspace configurable labels per channel mapped to those internal codes. FR-041: System MUST allow selecting zero or more statuses. FR-042: Empty status selection MUST mean all statuses. FR-043: System MUST store selected status codes and status label snapshot in job parameter snapshot.FR-044: For channel Conversation, system MUST support folder exclusion flags: exclude\_junk (boolean), exclude\_spam (boolean) FR-045: Default values for Conversation export MUST be: exclude\_junk \= true, exclude\_spam \= true FR-046: If exclude\_junk \= true, system MUST exclude conversations whose folder/category is Junk. FR-047: If exclude\_spam \= true, system MUST exclude conversations whose folder/category is Spam. FR-048: If both exclusions are enabled, system MUST exclude records that match either Junk or Spam. FR-049: System MUST store these flags in job parameter snapshot and apply them at job processing time.  |
| Format | FR-044: System MUST support XLSX only in MVP. FR-045: System MUST show a non-editable format field with value "EXCEL". |
| Job Creation | FR-046: System MUST create an offline job when user clicks "Submit". FR-047: System MUST return success without waiting for file generation. FR-048: System MUST prevent duplicate jobs for same requester, channel, template, date range, employee selection, status selection while an identical job is active. FR-049: System MUST limit active jobs per user to 1 per channel at a time. FR-050: System MUST rate limit job creation to 10 per hour per user. |
| Job Status | FR-051: System MUST process jobs asynchronously. FR-052: System MUST assign job statuses QUEUED, PROCESSING, COMPLETED, FAILED, EXPIRED. FR-053: System MUST show user-facing status labels "Antri", "Diproses", "Selesai", "Gagal", "Kedaluwarsa". FR-054: System MUST store a failure reason message when status is FAILED. |
| Job List | FR-055: System MUST display a job list table on the same page. FR-056: System MUST show columns "Nama Laporan", "Diminta Pada", "Diminta Oleh", "Selesai Pada", "Status", "Tautan Unduh", "Parameter Permintaan". FR-057: System MUST sort by "Diminta Pada" descending by default. FR-058: System MUST show latest 50 rows and allow pagination later. FR-059: Admin MUST see all jobs in workspace. FR-060: Supervisor MUST see only their own jobs. |
| Download | FR-061: System MUST enable "Unduh" only when status is COMPLETED. FR-062: System MUST disable download when status is FAILED or EXPIRED. FR-063: System MUST generate a short lived download link valid for 15 minutes. FR-064: System MUST not expose raw storage URLs in UI. FR-065: System MUST regenerate a new download link on click if expired and file is still retained. |
| Retention | FR-066: System MUST retain completed report files for 7 days from completion time. FR-067: After retention ends, system MUST mark job as EXPIRED and disable download. FR-068: System MUST remove or disable access to expired files. |
| Audit | FR-069: System MUST log audit events for job created, completed, failed, and downloaded. FR-070: System MUST capture metrics duration, row\_count, file\_size, status. |
| Localization | FR-071: System MUST display all UI labels and messages in Bahasa Indonesia only. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block page access. | "Akses ditolak". |
| EH-002 | Validation | Missing required date or time field blocks submit. | "Wajib diisi". |
| EH-003 | Validation | Start after End blocks submit. | "Rentang tanggal tidak valid". |
| EH-004 | Validation | Range greater than 30 days blocks submit. | "Maksimal rentang 30 hari". |
| EH-005 | Validation | Invalid employee selection blocks submit. | "Agent tidak valid". |
| EH-006 | Validation | Template not available for channel blocks submit. | "Template tidak tersedia". |
| EH-007 | Duplication | Block identical active job creation. | "Permintaan yang sama masih diproses". |
| EH-008 | Rate limit | Block excessive job creation. | "Terlalu banyak permintaan. Coba lagi nanti". |
| EH-009 | Processing | Mark job FAILED and store reason. | "Gagal membuat laporan". |
| EH-010 | Download | Link expired and cannot regenerate. | "Tautan unduhan kedaluwarsa". |
| EH-011 | Download | Permission removed after creation. | "Akses ditolak". |
| EH-012 | Retention | File expired. | "File sudah kedaluwarsa". |
| EH-013 | Conversation keys overflow | Export first 200 keys and store JSON overflow columns. | No blocking. Job completes. |
| EH-014 | Processing | If folder classification field is missing for some records, treat as “Not Junk/Spam” and continue job. | No blocking. Job completes. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User changes filters after submitting | Job uses snapshot from creation time. | Parameters show snapshot values. |
| EC-002 | Workspace status labels change after job creation | Export filters by stored status codes and shows stored label snapshot in parameters. | Parameters remain stable. |
| EC-003 | Ticket Type template selected but Ticket Type deleted before processing | Job fails with clear reason. | Status "Gagal". Message "Template tidak tersedia". |
| EC-004 | Ticket Type custom fields changed after job creation | Job uses schema snapshot at creation time. | Headers remain stable for that job. |
| EC-005 | Duplicate Ticket Type names | Template name disambiguated using type key suffix. | Example: "Ticket \- Return (tt\_123)". |
| EC-006 | Conversation metadata contains nested objects | Export JSON string for that cell. | No failure. |
| EC-007 | Conversation has more than 200 distinct keys | Export first 200 keys plus CA JSON and META JSON columns. | No failure. |
| EC-008 | Multiple submits due to double click | Only one job was created. | A single row appears. |
| EC-009 | Very large result set | Jobs may fail with guidance to reduce date range. | "Data terlalu besar. Perkecil rentang tanggal". |
| EC-010 | Conversation record incorrectly tagged as both Junk and Spam | If either exclusion flag is enabled, the record is excluded. | No user-facing error |
| EC-011 | Folder field null/unknown | Record is included unless other filters exclude it. | No user-facing error |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Page Header | Title "Laporan Offline". | Open page from reporting menu. | US-001 |
| Channel Selector | Label "Kanal". Values "Tiket" and "Percakapan". | Switching channel refreshes templates and status labels. | US-002 |
| Date Type | Label "Jenis Tanggal". Only "Tanggal Dibuat". | Default selected. | US-003 |
| Date Range | Labels "Tanggal Mulai", "Waktu Mulai", "Tanggal Selesai", "Waktu Selesai". | Validate on submit. | US-003 |
| Template Selector | Label "Pilih Template". | Ticket shows Default Ticket plus Ticket Type templates. Conversation shows only Default Conversation. | US-002, US-004, US-005, US-006 |
| Employee Selector | Label "Agent". Multi select with search. | Empty means all. | US-007 |
| Status Selector | Label "Status". Multi select. | Empty means all. | US-008 |
| Pengecualian Kondisi | Checkbox: “Kecualikan Junk” (default checked) Checkbox: “Kecualikan Spam” (default checked) | UI controls under Status filter when channel \= Conversation: | US-014 |
| Format Field | Label "Format". Value "EXCEL". Disabled. | Fixed output. | US-009 |
| Submit Button | Button "Submit". | Creates job, shows toast, adds row. | US-010 |
| Toast Success | "Permintaan laporan dibuat". | Shown after job creation. | US-010 |
| Toast Duplicate | "Permintaan yang sama masih diproses". | Shown when blocked. | US-010 |
| Job List Table | Shows job history and parameters. | Refresh without full page reload. | US-011, US-012, US-013 |
| Download Action | "Unduh". Enabled only when completed. | Regenerates link if expired within retention. | US-013 |
| Empty State | "Belum ada laporan". | Shown when list empty. | US-010 |

## **10\. Field & Validation**

| Field Name | Type | Example Value | Validation | Required or Optional | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Kanal | Single select | Tiket | Must be Tiket or Percakapan. | Required | Tiket |
| Jenis Tanggal | Single select | Tanggal Dibuat | Only Tanggal Dibuat. | Required | Tanggal Dibuat |
| Tanggal Mulai | Date | 2026-03-01 | Must be valid date. | Required | Empty |
| Waktu Mulai | Time | 00:00 | HH:MM 24 hour. | Required | 00:00 |
| Tanggal Selesai | Date | 2026-03-30 | Must be valid date. Range must be 30 days or less. | Required | Empty |
| Waktu Selesai | Time | 23:59 | HH:MM 24 hour. | Required | 23:59 |
| Pilih Template | Single select | Default Ticket | Must exist for selected channel. | Required | Default per channel |
| Exeptional Condition | Multi select | Junk, Spam | True | Required | Junk OnSpam On |
| Agent | Multi select | Agent A | Must be within permission scope. | Optional | Empty means all |
| Status | Multi select | Ongoing | Must map to internal codes. | Optional | Empty means all |
| Format | Fixed | EXCEL | Not editable. | Required | EXCEL |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | P95 job submission response time under 1 second. |
| Performance | P95 job list load time under 2 seconds for 50 rows. |
| Reliability | Job processing is idempotent per job id. |
| Security | Download link is time-limited and does not expose raw storage URLs. |
| Privacy | Permission checked at job creation and at download time. |
| Observability | Metrics captured: duration, row\_count, file\_size, status, failure\_reason. |
| Accessibility | Keyboard navigation supported for all inputs and buttons. |
| Localization | All UI labels and messages in Bahasa Indonesia only. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ticket Type template generation needs Ticket Type schema | Engineering | Wrong columns for ticket type templates | Use Ticket Type configuration as single source of truth. Snapshot at job creation. |
| Conversation metadata key explosion | Engineering | Too many columns | Cap at 200 keys. Add CA JSON and META JSON overflow columns. |
| High volume exports | Engineering | Job delays and failures | Enforce 30 day range. Enforce active job limit. |
| Data leakage risk | Product and Engineering | Sensitive data exposure | Strict RBAC. Permission re-check at download. Audit logs. |
| Template name collisions | Product | Confusing UI | Disambiguate using type key suffix. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Job completion rate | 98 percent | 30 days | Job logs |
| Median completion time for typical exports | Under 5 minutes | 30 days | Job metrics |
| Duplicate job rate | Reduced by 80 percent | 30 days | Job logs |
| Ticket template alignment issues | Under 1 percent of exports | 30 days | QA and support tickets |
| Conversation export completeness | Under 1 percent missing attribute columns | 30 days | Export validation checks |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| More date types | Match legacy reporting needs. |
| CSV option | Faster for small exports. |
| Custom template builder | Self-serve column selection. |
| Notifications | Reduce manual polling of job list. |
| Scheduled reports | Recurring reporting automation. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No user-created templates | Users cannot customize columns in MVP. |
| 30 day date range limit | Some historical reporting needs require multiple exports. |
| Conversation keys capped | Some rare metadata keys may move into overflow JSON columns. |
| XLSX only | CSV workflows are not supported. |

## **16\. Appendix**

### **A. UI Copy (Bahasa Indonesia)**

| Context | Copy |
| ----- | ----- |
| Permission | "Akses ditolak" |
| Required field | "Wajib diisi" |
| Invalid range | "Rentang tanggal tidak valid" |
| Range limit | "Maksimal rentang 30 hari" |
| Invalid employee | "Agent tidak valid" |
| Template invalid | "Template tidak tersedia" |
| Duplicate | "Permintaan yang sama masih diproses" |
| Rate limit | "Terlalu banyak permintaan. Coba lagi nanti" |
| Job created | "Permintaan laporan dibuat" |
| Processing failed | "Gagal membuat laporan" |
| Link expired | "Tautan unduhan kedaluwarsa" |
| File expired | "File sudah kedaluwarsa" |
| Empty list | "Belum ada laporan" |
| Too large | "Data terlalu besar. Perkecil rentang tanggal" |

### **B. System-Managed Templates (MVP)**

| Channel | Template Name | Template Type | Behavior |
| ----- | ----- | ----- | ----- |
| Ticket | Default Ticket | Default | Exports default ticket columns only. Includes all ticket types within scope. |
| Ticket | Ticket \- {Ticket Type Name} | Dynamic per Ticket Type | Exports default ticket columns plus that Ticket Type custom fields. Dataset restricted to that Ticket Type. |
| Conversation | Default Conversation | Default | Exports base conversation columns plus custom attributes and metadata keys within dataset scope. |

### **C. Default Ticket Columns**

| Column Name (XLSX Header) | Example | Type |
| ----- | ----- | ----- |
| Ticket ID | TK-6749104949 | string |
| Ticket title | Life Problem | string |
| Client (Contact) | Brian Wakwaw | string |
| Channel | WA | string |
| Priority | High | string |
| Agent | John Doe, Jane Doe | string |
| Status | Waiting on Customer | string |
| Inbox | Support \- Jakarta | string |
| Tag | shipping, refund | string |
| Level | VIP | string |
| First Reply Time | 01:12:30 | duration |
| Customer First Wait | 00:45:10 | duration |
| Created Date | 2026-02-01 10:01:00 | datetime string |
| Closed Date | 2026-02-01 18:20:00 | datetime string |
| Updated Date | 2026-02-01 18:21:10 | datetime string |
| Customer Email | user@mail.com | string |
| Customer Phone | \+62812xxxx | string |
| Lifetime | 08:19:00 | duration |
| SLA | FRT ok, Resolve overdue | string |
| Description | Customer said hello | string |
| Last Reply By | AGENT John Doe | string |
| Last Reply At | 2026-02-01 18:10:00 | datetime string |
| Last Reply Message | Please provide AWB | string |

### **D. Ticket Type Custom Fields (Appended Columns)**

| Custom Field Type | Column Header Rule | Example Cell | Type |
| ----- | ----- | ----- | ----- |
| Text | CF: {Field Label} | AWB 123456 | string |
| Select | CF: {Field Label} | Refund | string |
| Date | CF: {Field Label} | 2026-02-01 | date |
| File | CF: {Field Label} | Lihat file | string |

**Collision rule**

* If two custom fields share the same label, header MUST be `CF: {Field Label} ({field_key})`.

### **E. Default Conversation Base Columns**

| Column Name (XLSX Header) | Example | Type |
| ----- | ----- | ----- |
| Conversation ID | CNV-88921 | string |
| Contact Name | Budi Santoso | string |
| Contact Identifier | \+6281234567890 | string |
| Channel | instagram | string |
| Agent | John Doe | string |
| Status | Open | string |
| Inbox | Support \- Jakarta | string |
| Tags | lead, pricing | string |
| Created Date | 2026-03-01 09:10:00 | datetime string |
| Updated Date | 2026-03-01 10:20:00 | datetime string |
| Closed Date | \- | datetime string |
| Last Message By | CUSTOMER | string |
| Last Message At | 2026-03-01 10:20:00 | datetime string |
| Last Message Text | How much is Pro plan | string |

### **F. Conversation Custom Attributes and Metadata Columns**

| Category | Column Header Prefix | Example Column | Example Cell | Type |
| ----- | ----- | ----- | ----- | ----- |
| Custom Attributes | CA: | CA: segment | VIP | string |
| Metadata | META: | META: external\_thread\_id | ig\_12345 | string |
| Nested values | CA: or META: | META: payload | {"a":1} | string (JSON) |
| Overflow | CA JSON and META JSON | CA JSON | {"k1":"v1"} | string (JSON) |

# **17\. ADDENDUM Feature: Broadcast Report Support**

## **17.1 Summary**

| Item | Description |
| ----- | ----- |
| Purpose | Extend Offline Report Download to support Broadcast reports using the same async export pipeline as Ticket and Conversation. |
| Main Change | Add `Broadcast` as a new report type. |
| Entry Point | User can create Broadcast report from Offline Report Download or from Broadcast \> Messages \> Export redirect. |
| Output | XLSX only. |
| Data Granularity | 1 row \= 1 broadcast recipient record or 1 invalid Open API request recipient record. |
| Job Status | Uses existing Offline Report job statuses: `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `EXPIRED`. |
| Broadcast Row Status | Uses Broadcast-specific statuses only. |

---

## **17.2 Required Existing PRD Patches**

| Existing Area | Current | Revised |
| ----- | ----- | ----- |
| Feature title | Offline Report Download (Ticket and Conversation) | Offline Report Download (Ticket, Conversation, and Broadcast) |
| Main selector | Kanal | Jenis Laporan |
| Main selector values | Tiket, Percakapan | Tiket, Percakapan, Broadcast |
| Broadcast channel filter | Not available | API, WhatsApp Web, Open API |
| Status filter | Shared Ticket and Conversation status | Dynamic by selected report type |
| Exceptional condition typo | Exeptional Condition | Exceptional Condition |
| UI label for exceptional condition | Pengecualian Kondisi | Keep as "Pengecualian Kondisi" |
| FR numbering | Existing duplicate FR-044 onward | Addendum uses `AFR-*` numbering to avoid conflict |

---

## **17.3 User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| AUS-001 | P0 | As an Admin or Supervisor, I want to select Broadcast as a report type so I can export Broadcast data from the same Offline Report page. | 1\. Given I open Offline Report Download, When I open "Jenis Laporan", Then I see "Tiket", "Percakapan", and "Broadcast". 2\. Given I select "Broadcast", When the form updates, Then Broadcast-specific filters are shown. 3\. Given I switch from Broadcast to another report type, When the previous Broadcast filters are no longer valid, Then invalid values are reset. |
| AUS-002 | P0 | As an Admin or Supervisor, I want to filter Broadcast report by Broadcast channel so I can separate API, WhatsApp Web, and Open API records. | 1\. Given I select "Broadcast", When I view the Channel selector, Then I see "API", "WhatsApp Web", and "Open API". 2\. Given I select one or more Broadcast channels, When I submit the report, Then only records matching selected channels are exported. 3\. Given I leave Channel empty, When I submit the report, Then all Broadcast channels within my permission scope are included. |
| AUS-003 | P0 | As an Admin or Supervisor, I want Broadcast to use its own status options so reports are not mixed with Ticket or Conversation statuses. | 1\. Given I select "Broadcast", When I open Status, Then I see only Broadcast statuses. 2\. Given I select "Tiket" or "Percakapan", When I open Status, Then I see only Ticket or Conversation statuses. 3\. Given I switch report type, When selected statuses are invalid for the new report type, Then the system resets the Status field. |
| AUS-004 | P0 | As an Admin or Supervisor, I want invalid Open API requests to be visible in Broadcast export so integration issues can be audited. | 1\. Given an Open API payload is invalid, When the Broadcast report is generated, Then the row appears with status `INVALID_REQUEST`. 2\. Given the invalid payload has multiple errors, When exported, Then `reason` contains all validation failures. 3\. Given no broadcast object was created, When exported, Then `broadcastId` may be empty but `requestId`, `status`, and `reason` must be filled. |
| AUS-005 | P0 | As an Admin or Supervisor, I want Broadcast export to follow the same async job flow so the UI does not block. | 1\. Given I submit valid Broadcast report parameters, When I click Submit, Then a job is created and shown in the same job list. 2\. Given the job is processing, When I leave and return, Then the job row remains visible with updated status. 3\. Given the job completes, When I click "Unduh", Then the XLSX downloads through the secure download flow. |

---

## **17.4 Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Report Type Selector | AFR-001: System MUST rename the main selector concept from `Channel` to `Report Type`. AFR-002: UI label for the main selector MUST be "Jenis Laporan". AFR-003: Report Type values MUST be `Tiket`, `Percakapan`, and `Broadcast`. AFR-004: System MUST store selected report type in the job parameter snapshot. |
| Dynamic Form Behavior | AFR-005: System MUST show fields based on selected report type. AFR-006: System MUST reset template, status, and report-specific filters when they are invalid for the newly selected report type. AFR-007: System MUST keep Date Range and Format values when switching report type if still valid. |
| Broadcast Report Type | AFR-008: System MUST support `Broadcast` as a report type in Offline Report Download. AFR-009: System MUST provide one system-managed template for Broadcast named `Default Broadcast`. AFR-010: Broadcast report MUST export recipient-level records. AFR-011: Broadcast report MUST include invalid Open API request records when available. |
| Broadcast Channel Filter | AFR-012: System MUST show a Broadcast Channel selector only when Report Type is `Broadcast`. AFR-013: Broadcast Channel selector MUST support multi-select. AFR-014: Broadcast Channel options MUST be `API`, `WhatsApp Web`, and `Open API`. AFR-015: Empty Broadcast Channel selection MUST mean all Broadcast channels within requester permission scope. AFR-016: Broadcast Channel filter MUST NOT appear for Ticket reports. AFR-017: Broadcast Channel filter MUST NOT reuse Conversation channel filter rules. |
| Broadcast Status Filter | AFR-018: System MUST show Broadcast-specific statuses when Report Type is `Broadcast`. AFR-019: Broadcast status options MUST be `SUCCESS`, `IN_PROGRESS`, `SCHEDULED`, `FAILED`, `CANCELED`, `INVALID_NUMBER`, and `INVALID_REQUEST`. AFR-020: Broadcast status options MUST NOT include `UNASSIGNED`, `ONGOING`, or `RESOLVED`. AFR-021: Ticket and Conversation status options MUST NOT include Broadcast-specific statuses. AFR-022: Empty Broadcast Status selection MUST mean all Broadcast statuses. |
| Open API Invalid Request | AFR-023: System MUST classify invalid Open API payload validation failures as `INVALID_REQUEST`. AFR-024: System MUST fill `reason` with field-level validation details for `INVALID_REQUEST` rows. AFR-025: If multiple validation errors exist, system MUST export all reasons in one readable string. AFR-026: System MUST NOT silently exclude invalid Open API request records from Broadcast export. AFR-027: System MUST sanitize request payload before exporting. |
| Job Status Separation | AFR-028: Offline Report job status MUST remain separate from Broadcast row status. AFR-029: Offline Report job status MUST continue using `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, and `EXPIRED`. AFR-030: `INVALID_REQUEST` MUST be a Broadcast row status only, not an Offline Report job status. AFR-031: A Broadcast export job with invalid request rows MAY still complete successfully if the XLSX is generated. |
| Redirect from Broadcast | AFR-032: System MUST redirect Broadcast \> Messages \> Export to Offline Report Download. AFR-033: Redirect SHOULD prefill Report Type as `Broadcast`. AFR-034: Redirect SHOULD prefill Date Range, Status, Broadcast Channel, Creator, and Team Inbox when available. AFR-035: User MUST be able to review and edit prefilled values before submitting the job. |
| Exceptional Condition | AFR-036: Technical field name MUST be `Exceptional Condition`. AFR-037: UI label MUST remain "Pengecualian Kondisi". AFR-038: Exceptional Condition MUST remain visible only for Conversation report unless another report type explicitly supports it later. AFR-039: Exceptional Condition MUST NOT appear for Broadcast in this addendum. |

---

## **17.5 Broadcast Status Set**

| Status Code | UI Label | Meaning | Export Rule |
| ----- | ----- | ----- | ----- |
| `SUCCESS` | Berhasil | Message was sent successfully. | Include row. `reason` empty. |
| `IN_PROGRESS` | Diproses | Message send is still being processed. | Include row. |
| `SCHEDULED` | Terjadwal | Broadcast is scheduled for future send. | Include row with `scheduledAt`. |
| `FAILED` | Gagal | Valid request failed during send, provider processing, or system processing. | Include row with `reason`. |
| `CANCELED` | Dibatalkan | Broadcast was canceled before completion. | Include row. |
| `INVALID_NUMBER` | Nomor tidak valid | Recipient number or identifier is invalid. | Include row with `reason`. |
| `INVALID_REQUEST` | Request tidak valid | Open API payload failed validation before valid send processing. | Include row with detailed `reason`. |

---

## **17.6 UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Report Type Selector | Main selector with label "Jenis Laporan". Values: Tiket, Percakapan, Broadcast. | User selects report type and the form updates dynamically. | AUS-001 |
| Broadcast Channel Selector | Multi-select visible only for Broadcast. Values: API, WhatsApp Web, Open API. | User filters Broadcast export by source channel. | AUS-002 |
| Status Selector | Dynamic status options based on selected report type. | User selects only statuses valid for the selected report type. | AUS-003 |
| Broadcast Template Selector | Shows only "Default Broadcast". | User cannot select Ticket or Conversation templates while Broadcast is selected. | AUS-001 |
| Exceptional Condition | Technical field corrected. UI label remains "Pengecualian Kondisi". | Visible only for Conversation. Hidden for Broadcast. | Existing US-014 |
| Redirected Export State | Coming from Broadcast \> Messages \> Export preselects Broadcast and supported filters. | User reviews and submits. | AUS-005 |
| Job List | Existing job list includes Ticket, Conversation, and Broadcast jobs. | User monitors and downloads completed report. | AUS-005 |

---

## **17.7 Field and Validation Additions**

| Field Name | UI Label | Type | Example Value | Validation | Required or Optional | Default |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Report Type | Jenis Laporan | Single select | Broadcast | Must be Tiket, Percakapan, or Broadcast. | Required | Tiket |
| Broadcast Channel | Channel | Multi select | Open API | Allowed values: API, WhatsApp Web, Open API. Valid only for Broadcast. | Optional | Empty means all |
| Template | Pilih Template | Single select | Default Broadcast | Must exist for selected report type. | Required | Default per report type |
| Status | Status | Multi select | INVALID\_REQUEST | Must be valid for selected report type. Broadcast cannot use UNASSIGNED, ONGOING, or RESOLVED. | Optional | Empty means all |
| Source Creator | Dibuat Oleh | Multi select | Admin A | Must be within permission scope. Valid for Broadcast if available. | Optional | Empty means all |
| Team Inbox | Team Inbox | Multi select | Support Team | Must be within permission scope. Valid for Broadcast if available. | Optional | Empty means all |
| Exceptional Condition | Pengecualian Kondisi | Multi select or checkbox group | Junk, Spam | Valid only for Conversation in current scope. | Optional | Junk and Spam checked by default for Conversation |

---

## **17.8 Error Handling Additions**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| AEH-001 | Validation | Invalid report type blocks submit. | "Jenis laporan tidak valid". |
| AEH-002 | Validation | Broadcast Channel contains unsupported value. | "Channel tidak valid". |
| AEH-003 | Validation | Broadcast Status contains Ticket or Conversation status. | "Status tidak valid". |
| AEH-004 | Validation | Template does not match selected report type. | "Template tidak tersedia". |
| AEH-005 | Permission | Broadcast Team Inbox filter contains unauthorized value. | "Akses ditolak". |
| AEH-006 | Processing | Broadcast XLSX generation fails. Mark job FAILED and store reason. | "Gagal membuat laporan". |
| AEH-007 | Empty Result | Broadcast job completes with headers-only XLSX. | "Laporan selesai tanpa data". |
| AEH-008 | Open API Invalid Payload | Export row as `INVALID_REQUEST` with detailed reason. | No blocking. Visible in XLSX. |

---

## **17.9 Edge Cases Additions**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| AEC-001 | User switches from Broadcast to Ticket after selecting `INVALID_REQUEST` | Status field resets because status is invalid for Ticket. | No error. |
| AEC-002 | User switches from Conversation to Broadcast while Exceptional Condition is selected | Exceptional Condition is hidden and not applied to Broadcast job. | No error. |
| AEC-003 | User selects Broadcast Channel `Open API` and Status `INVALID_REQUEST` | Export includes only invalid Open API request rows within scope. | Job completes if file generated. |
| AEC-004 | Broadcast List redirect includes unsupported filter | Unsupported value is ignored and user sees editable form. | Optional banner: "Beberapa filter tidak tersedia". |
| AEC-005 | Invalid Open API request has no recipient number | Row is exported with empty `recipientNumber` and reason explains missing recipient. | No crash. |
| AEC-006 | Invalid Open API request created no broadcast object | Row is exported with empty `broadcastId`, but `requestId`, `status`, and `reason` are filled. | No crash. |
| AEC-007 | Broadcast job contains only invalid request rows | Job status is `COMPLETED` if XLSX generation succeeds. | Download enabled. |
| AEC-008 | Report job fails due to storage or XLSX generation | Job status is `FAILED`, not `INVALID_REQUEST`. | "Gagal membuat laporan". |

---

## **17.10 Appendix Patch: System-Managed Templates**

| Report Type | Template Name | Template Type | Behavior |
| ----- | ----- | ----- | ----- |
| Ticket | Default Ticket | Default | Exports default ticket columns only. Includes all ticket types within scope. |
| Ticket | Ticket \- {Ticket Type Name} | Dynamic per Ticket Type | Exports default ticket columns plus that Ticket Type custom fields. Dataset restricted to that Ticket Type. |
| Conversation | Default Conversation | Default | Exports base conversation columns plus custom attributes and metadata keys within dataset scope. |
| Broadcast | Default Broadcast | Default | Exports fixed Broadcast recipient-level columns. Includes invalid Open API request records when available. |

---

## **17.11 Appendix Patch: Default Broadcast Columns**

| Column Name XLSX Header | Example | Type | Notes |
| ----- | ----- | ----- | ----- |
| broadcastId | BRD-12345 | string | Nullable if invalid request created no broadcast object. |
| broadcastName | Promo May | string | Nullable. |
| broadcastChannel | Open API | string | API, WhatsApp Web, Open API. |
| source | Open API | string | Dashboard or Open API if needed. |
| createdAt | 2026-05-04 10:00:00 | datetime string | Workspace timezone. |
| scheduledAt | 2026-05-04 15:00:00 | datetime string | Nullable. |
| creatorUserId | USR-123 | string | Nullable. |
| creatorName | Admin A | string | Nullable. |
| teamInboxIdAtSendTime | TIN-123 | string | Nullable. |
| teamInboxNameAtSendTime | Support | string | Nullable. |
| senderAccountName | WA Official Main | string | Nullable. |
| senderNumber | \+6281234567890 | string | Nullable. |
| recipientNumber | \+6289876543210 | string | Nullable for invalid request. |
| recipientName | Budi | string | Nullable. |
| status | INVALID\_REQUEST | enum | Broadcast row status. |
| reason | recipientNumber is required. | string | Required for failed or invalid rows. |
| failureSource | OPEN\_API | enum | OPEN\_API, PROVIDER, SYSTEM, USER, or empty. |
| attemptNumber | 2 | int | Open API only. Nullable. |
| templateUsed | order\_update | string | Nullable. |
| messageContent | Your order is ready | string | Plain text. Nullable. |
| requestId | REQ-123 | string | Open API tracing. Nullable. |
| idempotencyKey | idem-abc | string | Nullable. |
| requestPayloadJson | {"recipientNumber":"\[empty\]"} | string | Sanitized only. |
| attributesJson | {"orderId":"123"} | string | Nullable. |

