# **Product Requirement Document (PRD)**

**Feature:** Bulk Reply for Tickets (UI Upload \+ Open API Bulk Job)

| Author | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.0 |
| **TRD** |  |

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-07 | Yusril | Initial PRD for bulk reply using XLSX with identifier selection and single visibility per job. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable users and integrators to send bulk replies to existing tickets by uploading an XLSX, using either ticket number or a chosen custom field as the identifier, with a single visibility setting per bulk job. |
| Outcome | Faster operational replies at scale, consistent attribution, and safer client visibility by preventing internal note leakage. |

| In Scope | Out of Scope |
| ----- | ----- |
| UI bulk upload flow with identifier selection and a single visibility toggle per job. | Webhook for bulk job events. |
| Bulk reply processing as an asynchronous job with progress and result report download. | Per-row visibility selection inside XLSX. |
| Open API to create bulk jobs using XLSX `file_url` and to query job status and results. | Bulk ticket creation. |
| Identifier types: ticket number and custom field value. | Identifier types: ticket\_id and external\_ticket\_key. |

---

## **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Replying to many tickets is slow when done one by one. | High operational cost and delayed customer updates. |
| 2 | Bulk operations risk sending internal notes to clients. | Data leakage and compliance risk. |
| 3 | Identifier mismatch can route replies to the wrong ticket. | Wrong customer updates and operational errors. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Reduce time to reply at scale. | 80 percent reduction in time for replying to 100 tickets compared to manual replies. |
| Prevent internal note leakage to clients. | 0 internal messages returned in client audience reads created by bulk jobs. |
| Ensure safe and deterministic matching. | 99 percent of processed rows resolve to exactly one ticket or fail with a clear row-level error. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to upload an XLSX and choose an identifier type so I can reply to many tickets quickly. | 1\. Given I open the bulk reply tool, When I select identifier type and upload an XLSX, Then the system starts a bulk job and shows a job status view. 2\. Given the XLSX is missing required columns, When I upload it, Then the system blocks the job and shows a validation error. 3\. Given the XLSX exceeds the max rows limit, When I upload it, Then the system blocks the job and shows a limit error. |
| US-002 | P0 | As an Agent, I want to set one visibility for the entire bulk job so I can send either public replies or internal notes safely. | 1\. Given I am creating a bulk job, When I check "Kirim ke pelanggan", Then all created messages are public. 2\. Given I am creating a bulk job, When I uncheck "Kirim ke pelanggan", Then all created messages are internal notes. 3\. Given I am a client user, When I attempt to create a bulk job with "Kirim ke pelanggan" unchecked, Then the system blocks the action. |
| US-003 | P0 | As a Client user, I want to bulk send only public replies so internal notes are never exposed to me. | 1\. Given I am a client user, When I create a bulk job, Then the system forces public visibility and does not allow internal visibility. 2\. Given a bulk job created messages, When I view ticket timelines as a client, Then only public messages are visible. |
| US-004 | P0 | As an Integrator, I want an Open API to submit a bulk reply job so I can automate mass updates from external systems. | 1\. Given a valid API key, When I submit a bulk job with identifier configuration, send\_to\_customer, and file\_url, Then the system returns a job\_id and status queued. 2\. Given the file\_url cannot be fetched or validated, When I submit the request, Then the system rejects it with a structured error response. 3\. Given a valid job\_id, When I query job status, Then the system returns progress counts and final status when complete. |
| US-005 | P0 | As an Agent or Integrator, I want each reply to be attributed to the job initiator so timelines remain auditable. | 1\. Given a UI bulk job, When messages are created, Then each message author matches the logged-in user identity. 2\. Given an API bulk job, When messages are created, Then each message includes the actor snapshot from the API request. 3\. Given actor organization is provided, When viewing messages, Then organization is stored and retrievable to distinguish partner agents. |
| US-006 | P0 | As an Agent, I want a result report so I can see which rows succeeded or failed and why. | 1\. Given a bulk job completes, When I open the job detail, Then I can download a result report containing per-row success or failure details. 2\. Given a row fails due to no matching ticket, When I view the report, Then it contains a row-level error code and message. 3\. Given a row fails due to ambiguous matches, When I view the report, Then it contains a row-level error code and message. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Bulk Job Creation | FR-001: System MUST support creating a bulk reply job from UI file upload. FR-002: System MUST support creating a bulk reply job from Open API using an XLSX file\_url. FR-003: System MUST process bulk reply jobs asynchronously and provide a job status endpoint or view. |
| Identifier Configuration | FR-004: System MUST support identifier\_type values ticket\_number and custom\_field. FR-005: System MUST require field\_key when identifier\_type is custom\_field. FR-006: System MUST treat identifier matching as exact match after trimming leading and trailing whitespace. FR-007: System MUST resolve each row identifier to exactly one ticket, or fail the row with a deterministic error. |
| XLSX Format | FR-008: System MUST require XLSX columns identifier and reply. FR-009: System MUST reject files with missing required columns. FR-010: System MUST reject rows with empty identifier. FR-011: System MUST reject rows with empty reply. FR-012: System MUST enforce max\_rows\_per\_job of 5000\. FR-013: System MUST enforce max\_file\_size\_mb of 10 for XLSX uploads and file\_url fetches. |
| Visibility and Audience Safety | FR-014: System MUST require a single send\_to\_customer boolean per bulk job in UI and API. FR-015: System MUST map send\_to\_customer true to public visibility for all created messages in the job. FR-016: System MUST map send\_to\_customer false to internal visibility for all created messages in the job. FR-017: System MUST block client users from creating internal bulk jobs and MUST force send\_to\_customer true for client users. FR-018: System MUST never return internal messages to client audience reads, including messages created by bulk jobs. |
| Author Attribution | FR-019: For UI jobs, system MUST set message author to the logged-in user creating the job. FR-020: For API jobs, system MUST require actor.user\_type, actor.id, and actor.name and MUST store an actor snapshot on each created message. FR-021: System MUST store actor.organization when provided. FR-022: System MUST store actor snapshots as immutable per message. |
| Processing and Partial Failures | FR-023: System MUST process rows independently so one row failure does not fail the entire job. FR-024: System MUST create messages only for successful rows and MUST not create partial messages for a failing row. FR-025: System MUST expose job progress counters total, processed, success, failed. |
| Result Report | FR-026: System MUST generate a result report for every completed job. FR-027: Report MUST include row\_number, identifier, resolved\_ticket\_number, status, message\_id when success, error\_code when failed, and error\_message when failed. FR-028: System MUST keep the result report available for download for 30 days. |
| Open API Contracts | FR-029: System MUST provide an API to create a bulk reply job, query job status, and download job results. FR-030: System MUST require send\_to\_customer in API job creation requests. FR-031: System MUST validate API file\_url as HTTPS only and block private network targets. |
| Idempotency | FR-032: System MUST support Idempotency-Key for API bulk job creation to prevent duplicate job creation on retries. FR-033: System MUST return the original job\_id for a safe replay with the same payload and idempotency key. FR-034: System MUST return 409 for idempotency key reuse with a different payload. |
| Limits and Abuse Prevention | FR-035: System MUST rate limit bulk job submissions per workspace. FR-036: System MUST throttle row processing to protect the system under load. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Unauthorized | API returns 401 with `{"error":{"code":"unauthorized","message":"Invalid API key."}}`. | UI shows: `Akses ditolak` and `Kunci API tidak valid.` |
| EH-002 | Invalid file format | API returns 400 with `invalid_request` and details about missing columns. | UI shows: `File tidak valid` and `Pastikan kolom identifier dan reply tersedia.` |
| EH-003 | File fetch failed | API returns 422 with `file_fetch_failed` and details `file_url`. | UI shows: `Gagal mengambil file` and `Periksa tautan file.` |
| EH-004 | File too large | API returns 413 with `payload_too_large`. | UI shows: `Ukuran file terlalu besar` and `Maksimal 10 MB.` |
| EH-005 | Too many rows | API returns 413 with `row_limit_exceeded` and `max_rows`. | UI shows: `Terlalu banyak baris` and `Maksimal 5000 baris.` |
| EH-006 | Invalid identifier config | API returns 400 with `invalid_request` and details about identifier\_type or field\_key. | UI shows: `Konfigurasi tidak valid` and `Periksa tipe identifier.` |
| EH-007 | Client attempts internal job | API returns 403 with `forbidden` and message. | UI shows: `Akses ditolak` and `Klien hanya bisa kirim pesan publik.` |
| EH-008 | Job not found | API returns 404 with `not_found`. | UI shows: `Data tidak ditemukan` and `Job tidak ditemukan.` |

**Canonical API error object**

`{`  
  `"error": {`  
    `"code": "invalid_request",`  
    `"message": "Validation failed.",`  
    `"details": {`  
      `"field": "identifier_type",`  
      `"reason": "Unsupported value."`  
    `}`  
  `}`  
`}`

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Duplicate identifiers in the same XLSX | System MUST process rows in file order. System MUST allow multiple replies to the same ticket within one job. |
| EC-002 | Identifier resolves to zero tickets | System MUST fail the row with error\_code `ticket_not_found` and continue processing other rows. |
| EC-003 | Identifier resolves to more than one ticket | System MUST fail the row with error\_code `ambiguous_identifier` and continue processing other rows. |
| EC-004 | Ticket is resolved when row is processed | System MUST still allow creating a message unless the ticketing policy blocks replies to resolved tickets. Default is allow and create the message. |
| EC-005 | XLSX contains formula cells | System MUST read the evaluated string value. If empty after evaluation, treat as empty and fail the row. |
| EC-006 | API file\_url redirects more than 3 times | System MUST reject job creation with 422 `file_fetch_failed` and details `reason=too_many_redirects`. |
| EC-007 | API file\_url points to private network | System MUST reject job creation with 400 `invalid_request` and details `reason=private_network_not_allowed`. |
| EC-008 | Job processing interrupted mid-way | System MUST resume safely without duplicating successful rows. System MUST rely on internal row-level processing records to prevent double writes. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Bulk Reply entry point | Add entry point in ticket list actions. | 1\. User clicks `Balas Massal`. 2\. System opens bulk reply modal or page. | US-001 |
| Identifier selector | User selects identifier type and optional custom field key. | 1\. User selects `Nomor Tiket` or `Custom Field`. 2\. If `Custom Field`, user selects `Field Key`. | US-001 |
| Visibility toggle | Single toggle for entire job. | 1\. User sees checkbox `Kirim ke pelanggan`. 2\. If unchecked, label shows `Catatan internal`. 3\. If user is client, toggle is locked ON and shows helper `Klien hanya bisa kirim pesan publik.` | US-002, US-003 |
| File upload | Upload XLSX with only identifier and reply. | 1\. User uploads file. 2\. System validates columns and row count. 3\. System starts job on success. | US-001 |
| Job status view | Show progress and allow result download. | 1\. System shows `Diproses` with counters total, berhasil, gagal. 2\. When complete, show `Selesai` and button `Unduh hasil`. | US-006 |
| Error states | Show actionable errors for file and config issues. | 1\. On error, show message and how to fix. 2\. User can reupload file after fixing. | US-001, US-002 |

---

## **10\. Field & Validation**

| Field Name | Type | Description | Example Value | Validation | Required/Optional |
| ----- | ----- | ----- | ----- | ----- | ----- |
| identifier\_type | Enum | Identifier mode used to resolve tickets. | `ticket_number` | Allowed: `ticket_number`, `custom_field`. | Required |
| field\_key | String | Ticket custom field key used when identifier\_type is custom\_field. | `awb` | 1 to 50 chars. ASCII. Must match an existing custom field key in the workspace. | Required if custom\_field |
| send\_to\_customer | Boolean | Visibility for all replies in the bulk job. | `true` | Must be boolean. If requester is client then must be true. | Required |
| xlsx\_file | File | XLSX uploaded from UI. | `bulk.xlsx` | Must be XLSX. Max 10 MB. Max 5000 rows. | Required in UI |
| file\_url | String | HTTPS URL to fetch XLSX for API jobs. | `https://files.example.com/bulk.xlsx` | HTTPS only. Max length 2048\. Redirect max 3\. Block private networks. Timeout 10 seconds. | Required in API |
| actor.user\_type | Enum | Author category for API jobs. | `agent` | Allowed: `client`, `agent`. If client then send\_to\_customer must be true. | Required in API |
| actor.id | String | External actor identifier for API jobs. | `agent-8891` | 1 to 128 chars. | Required in API |
| actor.name | String | Display name for attribution for API jobs. | `Aldo` | 1 to 100 chars. UTF-8 allowed. | Required in API |
| actor.organization | String | Optional org label to distinguish partner agents. | `JNE` | 1 to 64 chars. UTF-8 allowed. | Optional |
| xlsx.column.identifier | String | Ticket identifier value per row. | `SIB-120391` or `JNE1234567890` | Required. Trim whitespace. Max 256 chars. | Required |
| xlsx.column.reply | String | Reply body per row. | `Update: paket sedang diproses.` | Required. Max 10000 chars. | Required |
| max\_rows\_per\_job | Integer | Max XLSX rows processed per job. | `5000` | Hard limit. | System |
| max\_file\_size\_mb | Integer | Max XLSX size. | `10` | Hard limit. | System |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Availability | 99.9 percent monthly availability for bulk job APIs and UI flows. |
| Performance | Job creation response time P95 under 800 ms excluding file fetch time. |
| Processing | P95 time to process 1000 rows under 5 minutes under normal load. |
| Security | Enforce HTTPS for file\_url. Block private network destinations. |
| Security | Rate limit job submissions and protect against repeated large uploads. |
| Observability | Log job\_id, requester, identifier\_type, and per-row failure codes. Retain logs 30 days. |
| Privacy | Result report download must use time-limited access and must not expose raw file\_url after processing. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ticket number not unique in a workspace | Product | Ambiguous mapping and wrong replies. | Enforce uniqueness for ticket number. If not possible, fail rows as ambiguous. |
| Custom field values not unique | Product | Replies may target multiple tickets. | Fail row with `ambiguous_identifier`. Do not guess. |
| Large bulk jobs overload processing | Engineering | Slowdowns and degraded performance. | Throttle processing and enforce limits. |
| Client attempts to create internal notes | Product | Data leakage risk. | Force send\_to\_customer true for client. Block internal bulk jobs for client. |
| Unreliable file hosting for API file\_url | Integrator | Job creation failures. | Clear 422 errors and strict validation. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Bulk job completion rate | 98 percent | 30 days post launch | Job logs |
| Row success rate | 95 percent | 30 days post launch | Result reports |
| Internal leakage incidents | 0 | 30 days post launch | Audit sampling |
| Median time to reply 100 tickets | Under 3 minutes | 30 days post launch | UI analytics |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Per-row visibility override | Mixed workflows in one upload. |
| Per-row attachments | Bulk evidence sending. |
| Per-row deduplication options | Prevent accidental double replies when identifiers repeat. |
| Support CSV import | Lightweight option for non-Excel users. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| One visibility per job | Cannot mix public and internal messages in one upload. |
| No webhook for bulk job status | Integrators must poll job status. |

---

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| API Summary | 1\. Create job: `POST /v1/bulk/ticket-replies` with identifier\_type, field\_key when needed, send\_to\_customer, file\_url, actor, and Idempotency-Key. 2\. Get status: `GET /v1/bulk/jobs/{job_id}` returns counters and status. 3\. Get result: `GET /v1/bulk/jobs/{job_id}/result` returns a time-limited download URL. |
| Job Status Values | `queued`, `processing`, `completed`, `failed`, `canceled`. |
| Row Error Codes | `ticket_not_found`, `ambiguous_identifier`, `invalid_row`, `reply_too_long`. |
| UI Labels | `Balas Massal`, `Nomor Tiket`, `Custom Field`, `Kirim ke pelanggan`, `Catatan internal`, `Unduh hasil`, `Diproses`, `Selesai`. |

