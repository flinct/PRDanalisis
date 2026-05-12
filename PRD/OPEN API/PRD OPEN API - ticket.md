# **Product Requirement Document (PRD)**

**Feature**: Open API Standalone Ticket and Replies

| Author | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.0 |
| **TRD** |  |

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-07 | Yusril | Initial PRD for standalone Open API tickets and replies. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide Open API endpoints to create and manage standalone tickets in Satuinbox, including timeline messages that are either visible to clients or internal to agents. |
| Outcome | Integrators can unify multi-party ticket handling while Satuinbox remains the single source of truth using Satuinbox ticket IDs. |

**Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Create standalone ticket with external identifiers. | Webhook delivery and retry policy. |
| Add message to ticket timeline with send\_to\_customer boolean to control visibility. | Channel conversations and omnichannel routing. |
| Update ticket status and metadata by API. | UI requirements and UI copy. |
| List ticket messages for client audience and agent audience. | File upload endpoints beyond URL ingestion. |
| Attachment ingestion via HTTPS file\_url. |  |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Multiple parties handle the same operational ticket, but history is fragmented across systems. | Lost context and duplicated work. |
| PS-002 | External actors are not registered in Satuinbox, causing missing attribution. | Weak audit trail and poor accountability. |
| PS-003 | API retries can create duplicate tickets and duplicate replies without strict idempotency. | Inconsistent timelines and operational noise. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Ensure Satuinbox becomes the single source of truth for API-created tickets. | 100 percent of successful API writes return a canonical ticket\_id and subsequent operations use ticket\_id. |
| Prevent duplicates caused by retries. | 99.9 percent of retries with the same idempotency key do not create duplicates. |
| Preserve attribution for external actors. | 100 percent of messages created via API store actor metadata and return it on read. |
| Prevent client-side leakage of internal notes. | 0 incidents of internal messages returned by default to client audience reads. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Integrator, I want to create a standalone ticket so I can track a case in Satuinbox using a canonical ticket ID. | 1\. Given a valid API key, When I create a ticket with required external identifiers, Then the system creates exactly one ticket and returns ticket\_id. 2\. Given a ticket is successfully created, When I store ticket\_id, Then I can use it for all subsequent operations without requiring external identifiers. 3\. Given required identifiers are missing, When I submit the request, Then the system returns 400 and creates no ticket. |
| US-002 | P0 | As an Integrator, I want ticket creation to be idempotent so retries do not create duplicates. | 1\. Given a create ticket request with Idempotency-Key, When the same request is retried with the same key and payload, Then the system returns the original response and creates no additional ticket. 2\. Given the same idempotency key is reused with a different payload, When the request is submitted, Then the system returns 409 and creates no ticket. 3\. Given a ticket already exists for the same external ticket key, When a new create request is submitted without a matching idempotency replay, Then the system returns 409 and does not create a ticket. |
| US-003 | P0 | As an Integrator, I want to add a message to a ticket timeline and decide whether the message is visible to clients or internal to agents. | 1\. Given an existing ticket, When I create a message with send\_to\_customer=true, Then the system stores the message as visibility=public and it is eligible to be returned to client audience reads. 2\. Given an existing ticket, When I create a message with send\_to\_customer=false, Then the system stores the message as visibility=internal and it is excluded from client audience reads by default. 3\. Given a message request has no body and no attachments, When the request is submitted, Then the system returns 400 and creates no message. |
| US-004 | P0 | As an Integrator, I want to read ticket messages for client views without risking internal note leakage. | 1\. Given a ticket contains both public and internal messages, When I list messages with default parameters, Then the response includes only public messages. 2\. Given a ticket contains both public and internal messages, When I list messages with audience=agent, Then the response includes both public and internal messages. 3\. Given an invalid audience value, When I submit the request, Then the system returns 400 and does not return messages. |
| US-005 | P0 | As an Integrator, I want each message to contain external actor identity so Satuinbox can show attribution even if the actor is not a Satuinbox user. | 1\. Given a message request includes required actor fields, When the message is created, Then the system stores the actor snapshot on the message and returns it on reads. 2\. Given a message request is missing required actor fields, When the request is submitted, Then the system returns 400 and creates no message. 3\. Given courier partner support writes messages, When actor organization is provided, Then the system stores actor.organization to distinguish partner agents from other agents. |
| US-006 | P0 | As an Integrator, I want to attach evidence using a file URL so the timeline contains supporting documents. | 1\. Given a message request includes attachments.file\_url that is reachable and valid, When the message is created, Then the system ingests the file and returns an attachment reference on the message. 2\. Given any attachment cannot be fetched or validated, When the request is submitted, Then the system returns 422 and creates no message. 3\. Given an attachment exceeds size limits, When the request is submitted, Then the system returns 413 and creates no message. |
| US-007 | P0 | As an Integrator, I want to update ticket status and metadata so operational workflows remain consistent. | 1\. Given an existing ticket, When I update status, Then the ticket reflects the new status and updated\_at changes. 2\. Given an update request includes custom fields in merge mode, When the update succeeds, Then only provided keys are overwritten and other keys remain unchanged. 3\. Given an update request includes custom fields in replace mode, When the update succeeds, Then the entire fields object is replaced. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Authentication | FR-001: System MUST authenticate requests using an API key. FR-002: System MUST return 401 for missing or invalid credentials. FR-003: System MUST scope all data access to the workspace that owns the API key. |
| Ticket Source and Canonical ID | FR-004: System MUST create tickets as standalone objects not linked to any conversation or channel. FR-005: System MUST set source=open\_api for all tickets created by these endpoints and MUST keep it immutable. FR-006: System MUST use ticket\_id as the canonical identifier for all write and read operations after creation. |
| External Identifiers | FR-007: System MUST require external\_namespace, and external\_client\_id on ticket creation for integrator-side mapping. FR-009: System MUST compute external\_client\_key as external\_namespace plus : plus external\_client\_id. FR-010: System MUST enforce uniqueness of external\_ticket\_key within a workspace. FR-011: System SHOULD treat external identifiers as integration metadata and MUST NOT require them for subsequent operations when ticket\_id is provided. |
| Ticket Create | FR-012: System MUST support creating a ticket with optional title, description, priority, tags, and fields. FR-013: System MUST return 201 with ticket\_id, created\_at, and updated\_at on success. |
| Ticket Read | FR-014: System MUST support retrieving a ticket by ticket\_id. FR-015: System MAY support resolving ticket\_id by external\_ticket\_key for recovery flows where the integrator lost local mapping. |
| Ticket Update | FR-016: System MUST support updating status, title, priority, tags, and fields by ticket\_id. FR-017: System MUST support fields\_mode with values merge and replace and default to merge if omitted. FR-018: System MUST update updated\_at on any successful update that changes persisted data. |
| Message Create and Visibility | FR-019: System MUST support adding messages to a ticket timeline by ticket\_id. FR-020: System MUST require send\_to\_customer boolean on message creation. FR-021: System MUST map send\_to\_customer=true to visibility=public. FR-022: System MUST map send\_to\_customer=false to visibility=internal. FR-023: System MUST require either body or attachments\[\] on message creation. |
| Audience Rules for Read | FR-024: System MUST support an audience selector on message listing with values client and agent. FR-025: System MUST default message listing to audience=client if omitted. FR-026: System MUST return only public messages when audience=client. FR-027: System MUST return both public and internal messages when audience=agent. |
| Actor Model | FR-028: System MUST require actor.user\_type with values client or agent on ticket creation and message creation. FR-029: System MUST require actor.id and actor.name on ticket creation and message creation. FR-030: System MUST store actor.organization when provided to distinguish partner agents from other agents. FR-031: System MUST store actor snapshot per message and MUST NOT retroactively change historical actor snapshots. |
| Attachments via File URL | FR-032: System MUST support attachments using HTTPS attachments\[\].file\_url. FR-033: System MUST reject non-HTTPS file\_url with 400. FR-034: System MUST fetch and validate all attachments before creating the message. FR-035: System MUST fail the whole request if any attachment fails validation or fetch. FR-036: System MUST enforce max\_attachments\_per\_message=5. FR-037: System MUST enforce max\_attachment\_size\_mb=10 per attachment. FR-038: System MUST limit redirects to 3 hops per attachment fetch. FR-039: System MUST enforce an attachment fetch timeout of 10 seconds per attachment. |
| Pagination | FR-040: System MUST support cursor-based pagination for message listing. FR-041: System MUST default limit=20 and enforce limit\_max=100. FR-042: System MUST return stable ordering by created\_at ascending and a next\_cursor when more results exist. |
| Idempotency | FR-043: System MUST require Idempotency-Key for ticket creation and message creation. FR-044: System MUST treat the same idempotency key with the same payload as a safe replay that returns the original response. FR-045: System MUST return 409 for idempotency key reuse with a different payload. |
| Audit Logging | FR-046: System MUST record an audit entry for ticket creation, ticket update, and message creation. FR-047: System MUST store request\_id when provided by the client. FR-048: System MUST store idempotency\_key for idempotent endpoints. FR-049: System MUST store actor snapshot in audit entries for ticket and message writes. |

---

## **7\. Error Handling**

| ID | Type | Handling | API Response Example |
| ----- | ----- | ----- | ----- |
| EH-001 | Unauthorized | Return 401 with a stable error code. | {"error":{"code":"unauthorized","message":"Invalid API key."}} |
| EH-002 | Validation | Return 400 with field-level details. | {"error":{"code":"invalid\_request","message":"Validation failed.","details":{"field":"reason"}}} |
| EH-003 | Not found | Return 404 when ticket\_id does not exist. | {"error":{"code":"not\_found","message":"Ticket not found."}} |
| EH-004 | External key conflict | Return 409 when external\_ticket\_key already exists and request is not an idempotent replay. | {"error":{"code":"conflict\_external\_ticket\_key","message":"External ticket key already exists."}} |
| EH-005 | Idempotency mismatch | Return 409 when the same idempotency key is reused with a different payload. | {"error":{"code":"idempotency\_mismatch","message":"Idempotency key already used with a different payload."}} |
| EH-006 | Attachment fetch failed | Return 422 and do not create a message. | {"error":{"code":"attachment\_fetch\_failed","message":"Failed to fetch attachment.","details":{"file\_url":"https://..."}}} |
| EH-007 | Payload too large | Return 413 when attachment size exceeds limit. | {"error":{"code":"payload\_too\_large","message":"Attachment exceeds size limit."}} |
| EH-008 | Rate limited | Return 429 with retry guidance. | {"error":{"code":"rate\_limited","message":"Too many requests.","details":{"retry\_after\_seconds":30}}} |

**Canonical error object (best practice)**

{  
  "error": {  
    "code": "invalid\_request",  
    "message": "Validation failed.",  
    "details": {  
      "field": "actor.user\_type",  
      "reason": "Required."  
    }  
  }  
}

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Message created with attachments only and empty body | Accept if attachments\[\] contains **\>= 1** item and **all** attachments are valid and successfully ingested. Create message with body="" (or omit body) and return 201. |
| EC-002 | file\_url redirects more than 3 times | Reject with 422 attachment\_fetch\_failed. Create **no** message. Error details MUST include file\_url and reason=too\_many\_redirects. |
| EC-003 | file\_url resolves to private network / localhost / link-local / reserved ranges | Reject with 400 invalid\_request. Create **no** message. Error details MUST include file\_url and reason=private\_network\_not\_allowed. |
| EC-004 | Concurrent PATCH /tickets/{ticket\_id} updates | Apply **last-write-wins**. updated\_at MUST equal the timestamp of the last successful persisted update. System MAY support optimistic concurrency later (ETag), but not required in v1. |
| EC-005 | Client audience tries to fetch internal messages | When audience=client, server MUST **never** return visibility=internal messages, even if query attempts to override (e.g., include\_internal=true). Response returns public-only with 200. |
| EC-006 | Invalid pagination cursor | Reject with 400 invalid\_cursor. Create **no** side effects. Error details MUST include cursor and reason=malformed\_or\_expired. |
| EC-007 | Create ticket replay after partial network failure | If Idempotency-Key \+ payload match a previously succeeded request, return the original 201 response body including the same ticket\_id. No new ticket created. |
| EC-008 | External identifiers contain unexpected characters | Validate external\_namespace strictly (allowed charset \+ length). Reject violations with 400 invalid\_request. Accept UTF-8 for external\_client\_id within length limits; store as-is. |

---

## **9\. UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Not applicable | This feature is API-only. No UI requirements are defined in this PRD. | Not applicable. | US-001, US-003, US-004 |

---

## **10\. Field and Validation**

| Field Name | Type | Description | Example Value | Validation | Required/Optional | Applies To |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Authorization | String | API credential for workspace access. | Bearer xxxxx | Must match active API key. | Required | All endpoints |
| Idempotency-Key | String | Key to deduplicate retries for write endpoints. | c2f1c3d8-... | Length 8 to 128\. ASCII. | Required | Create ticket, create message |
| request\_id | String | Client-provided correlation ID for tracing. | req\_01J... | Length 1 to 64\. ASCII. | Optional | All endpoints |
| ticket\_id | String | Canonical Satuinbox ticket identifier. | tkt\_01J... | System-generated. | Required | All endpoints after create |
| source | Enum | Ticket origin. | open\_api | Must be open\_api for this feature. Immutable. | System | Ticket |
| external\_namespace | String | Integrator prefix to prevent collisions across integrators. | acme | Lowercase. Length 2 to 32\. Allowed a-z, 0-9, \_, \-. | Required | Create ticket |
| external\_client\_id | String | Integrator client identifier for client-side partitioning. | seller-00123 | Length 1 to 128\. | Required | Create ticket |
| external\_ticket\_key | String | Derived unique key for ticket mapping. | acme:9b1deb4d... | Computed by system. Unique in workspace. | System | Ticket |
| external\_client\_key | String | Derived key for client mapping. | acme:seller-00123 | Computed by system. | System | Ticket |
| title | String | Ticket title summary. | Shipment delayed | Length 1 to 200\. | Optional | Create ticket, update ticket |
| description | String | Ticket description details. | Package not moving | Length 1 to 5000\. | Optional | Create ticket |
| status | Enum | Current ticket status. | ongoing | Allowed: unassigned, ongoing, resolved. | Optional | Create ticket, update ticket |
| priority | Enum | Ticket priority. | high | Allowed: low, normal, high, urgent. | Optional | Create ticket, update ticket |
| tags | Array | Ticket labels for filtering and grouping. | \["delay"\] | Max 20\. Each length 1 to 32\. | Optional | Create ticket, update ticket |
| fields | Object | Custom properties for integrations. | {"awb":"JNE123"} | Max 100 keys. Key length 1 to 50\. Value length 0 to 1024\. | Optional | Create ticket, update ticket |
| fields\_mode | Enum | Custom fields update strategy. | merge | Allowed: merge, replace. Default merge. | Optional | Update ticket |
| message\_id | String | Canonical message identifier for ticket timeline. | msg\_01J... | System-generated. | System | Message |
| send\_to\_customer | Boolean | Visibility selector. True means visible to client audience. False means internal to agents. | true | Must be boolean. | Required | Create message |
| visibility | Enum | Stored visibility derived from send\_to\_customer. | public | Allowed: public, internal. | System | Message |
| body | String | Message text content. | We are checking this. | Length 1 to 10000\. Required unless attachments exist. | Conditional | Create message |
| audience | Enum | Read audience that controls message visibility in list responses. | client | Allowed: client, agent. Default client. | Optional | List messages |
| actor.user\_type | Enum | Actor category for audience and audit. | agent | Allowed: client, agent. | Required | Create ticket, create message |
| actor.id | String | Integrator actor identifier. | agent-8891 | Length 1 to 128\. | Required | Create ticket, create message |
| actor.name | String | Display name for attribution. | Aldo | Length 1 to 100\. | Required | Create ticket, create message |
| actor.role | String | Freeform role name stored as-is. | courier\_partner\_agent | Length 1 to 64\. | Optional | Create ticket, create message |
| actor.organization | String | Organization label to distinguish partner agents. | JNE | Length 1 to 64\. | Optional | Create ticket, create message |
| attachments | Array | Attachment list for a message. | \[{...}\] | Max 5 items. | Optional | Create message |
| attachments.file\_url | String | HTTPS URL to ingest attachment. | https://.../scan.jpg | HTTPS only. Max length 2048\. Redirect max 3\. | Required per item | Create message |
| attachments.file\_name | String | Original file name hint. | scan.jpg | Length 1 to 255\. | Optional | Create message |
| attachments.mime\_type | String | MIME type hint. | image/jpeg | Must be in allowlist if provided. | Optional | Create message |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Availability | 99.9 percent monthly availability for API endpoints. |
| Performance | P95 create ticket under 600 ms excluding downstream storage variance. |
| Performance | P95 create message under 700 ms without attachments. |
| Performance | Attachment ingestion timeout 10 seconds per attachment. Total request timeout 20 seconds. |
| Security | Enforce HTTPS for all API traffic and attachment URLs. |
| Security | Reject attachment URLs pointing to private network ranges. |
| Privacy | Do not store raw attachment source URLs in message objects after ingestion. |
| Observability | Log request\_id, ticket\_id, message\_id, and error code for every request. Retain logs 30 days. |
| Rate limiting | Default 60 requests per minute per API key. Return 429 with retry\_after\_seconds. |
| Data retention | Retain tickets and messages per workspace policy. Default 2 years. |

---

## **12\. Dependencies and Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Integrator uniqueness for external identifiers | Integrator | Duplicate ticket creation conflicts. | Enforce uniqueness on external\_ticket\_key and return clear 409 errors. |
| Attachment hosting availability | Integrator | Message creation failures. | Strict validation, actionable 422 errors, documented URL requirements. |
| Single API key used for both client and agent reads | Integrator | Accidental internal note exposure if not careful. | Default audience=client and exclude internal messages unless audience=agent. |
| High retry rates without idempotency key rotation | Integrator | Conflict errors and operational noise. | Require idempotency keys for write endpoints and document best practices. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Ticket create success rate | 99.5 percent | 30 days post launch | API logs |
| Message create success rate | 99.0 percent | 30 days post launch | API logs |
| Duplicate suppression rate | 99.9 percent | 30 days post launch | Idempotency logs |
| Internal note leakage incidents | 0 | 30 days post launch | Security review and sampling logs |
| Attachment ingestion success rate | 98.5 percent | 30 days post launch | Attachment logs |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Separate API keys by client or environment | Stronger governance and safer operations. |
| Attachment upload endpoint | Reduce dependency on external hosting and expiring URLs. |
| Field schema registry | Improve data quality for custom fields. |
| Fine-grained ticket permissions | Reduce reliance on integrator-side filtering logic. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Tickets are standalone and not linked to conversations or channels. | No channel delivery. Visibility controls only affect API reads and timeline semantics. |
| Single API key for all audiences | Separation relies on default audience behavior and integrator discipline. |
| Attachment ingestion depends on reachable HTTPS URLs | Attachments can fail if URLs expire or are blocked. |

---

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Glossary | Client: The party that should only see public messages on a ticket. Agent: The party that may see public and internal messages and may write internal notes. Public message: Timeline item visible to client audience reads. Internal note: Timeline item excluded from client audience reads. |
| Recommended endpoints summary | POST /v1/tickets create ticket. GET /v1/tickets/{ticket\_id} get ticket. PATCH /v1/tickets/{ticket\_id} update ticket. POST /v1/tickets/{ticket\_id}/messages create message. \`GET /v1/tickets/{ticket\_id}/messages?audience=client |
| Idempotency rules | Same Idempotency-Key plus same payload returns the original success response. Same Idempotency-Key plus different payload returns 409 idempotency\_mismatch. Idempotency applies per endpoint. Keys are not shared across endpoints. |
| Message visibility rules | send\_to\_customer=true stores visibility=public. send\_to\_customer=false stores visibility=internal. Default message list returns public only via audience=client. |

—

# **Product Requirement Document (PRD)**

**Feature:** Open API – Webhook Ticket

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
| v1.0 | 07 Jan 2026 | Product Team | Initial PRD for outbound ticket sync webhooks. |

## **2\. Overview**

Enable external ticket frontends to stay consistent with Satuinbox tickets using outbound webhooks for ticket creation, ticket updates, replies, and attachments. This reduces manual reconciliation and prevents status and timeline mismatches.

| In Scope | Out of Scope |
| ----- | ----- |
| Outbound webhooks for TICKET\_CREATED, TICKET\_UPDATED, MESSAGE\_CREATED | Bulk backfill of historical tickets. |
| Webhook configuration UI per workspace. | Two way sync defined as webhook in both directions. |
| Delivery logs, retry policy, and test webhook. | Ticket merge and split. |
| Attachment metadata delivery with time limited access. | Editing an existing message content. |
| Idempotency and ordering safeguards. |  |

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| External ticket UI and Satuinbox diverge on status, owner, fields, and timeline. | Agents and admins act on outdated information. This increases SLA misses and duplicated work. |
| Missed events and retries can create duplicate tickets or out of order updates. | Data integrity issues. Higher support cost and manual reconciliation. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Keep ticket data consistent across systems. | 99 percent of webhook events delivered successfully within 2 minutes. |
| Reduce manual reconciliation work. | 80 percent reduction in manual ticket mismatch reports within 30 days of launch. |
| Ensure safe and predictable integration behavior. | 0 duplicate tickets caused by retries when client implements idempotency with event\_id. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to add a webhook endpoint so my external system can receive ticket events. | 1\. Given I am an Admin, When I open **"Pengaturan"** and **"Webhook"**, Then I see **"Tambah Webhook"**. 2\. Given I input a valid URL and secret, When I click **"Simpan"**, Then the webhook is created with status **"Aktif"**. 3\. Given I input an invalid URL, When I click **"Simpan"**, Then I see **"URL tidak valid"** and the webhook is not saved. 4\. Given I am not an Admin, When I open **"Webhook"**, Then I see **"Akses ditolak"**. |
| US-002 | P1 | As an Admin, I want to test webhook delivery so I can validate setup before enabling in production. | 1\. Given a webhook is configured, When I click **"Uji Webhook"**, Then system sends a test event and shows **"Tes berhasil"** or **"Tes gagal"**. 2\. Given the test fails, When I view details, Then I see actionable guidance text and a **"Coba lagi"** action. |
| US-003 | P0 | As an Admin, I want to enable and disable a webhook so I can pause delivery during maintenance. | 1\. Given a webhook is active, When I click **"Nonaktifkan"**, Then status becomes **"Nonaktif"** and events stop sending. 2\. Given a webhook is inactive, When I click **"Aktifkan"**, Then status becomes **"Aktif"** and events resume sending. |
| US-004 | P0 | As a Client System, I want to receive TICKET\_CREATED so I can create or link a ticket in my system. | 1\. Given a new Satuinbox ticket is created, When webhook delivery succeeds, Then the payload includes event\_id, event\_type, occurred\_at, ticket\_id, and a ticket snapshot. 2\. Given delivery fails, When retries happen, Then the same event\_id is reused for all attempts for idempotency. |
| US-005 | P0 | As a Client System, I want to receive TICKET\_UPDATED so I can sync status, assignment, and fields. | 1\. Given a ticket status changes, When the update occurs, Then payload includes status, prev\_status, and status\_changed\_at. 2\. Given assignment changes, When the update occurs, Then payload includes assignee\_id, team\_id, and assignment\_source. 3\. Given fields change, When the update occurs, Then payload includes the full fields object after update. 4\. Given updates arrive out of order, When client compares updated\_at, Then client can ignore older updates safely. |
| US-006 | P0 | As a Client System, I want to receive MESSAGE\_CREATED so I can sync replies in the ticket timeline. | 1\. Given an inbound or outbound reply is created, When the event fires, Then payload includes message\_id, direction, visibility, and content. 2\. Given the message is internal, When the event fires, Then visibility is internal and client can hide it from customer views. |
| US-007 | P0 | As a Client System, I want attachments metadata so I can render and allow downloads in my UI. | 1\. Given a message includes attachments, When MESSAGE\_CREATED is sent, Then payload includes attachments\[\] with metadata and a time limited access method. 2\. Given an attachment access method expires, When client tries to download, Then client can request a refreshed access method from Satuinbox using a supported method or show **"Tautan kedaluwarsa"**. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Webhook Management | FR-001: System MUST allow Admin to create one or more webhooks per workspace. FR-002: System MUST restrict webhook management to Admin role. FR-003: System MUST allow enabling and disabling a webhook. FR-005: System MUST validate webhook URL format and require HTTPS. FR-006: System MUST store a webhook secret and never display it in full after saving. |
| Event Emission | FR-007: System MUST emit TICKET\_CREATED when a new ticket is created in Satuinbox. FR-008: System MUST emit TICKET\_UPDATED when any of these change: status, assignee, team, priority, tags, fields, title, due time if applicable. FR-009: System MUST emit MESSAGE\_CREATED when a new message is added to a ticket timeline. |
| Payload Consistency | FR-011: System MUST include event\_id as a globally unique identifier per event occurrence. FR-012: System MUST include occurred\_at in ISO 8601 format. FR-013: System MUST include ticket\_id for all ticket related events. FR-014: System MUST include updated\_at in ticket snapshots for ordering safeguards. FR-015: System MUST reuse the same event\_id across retries for the same event delivery attempt set. |
| Status and Reopen Rules | FR-016: System MUST support ticket statuses e.g.: unassigned, ongoing, resolved. FR-017: System MUST represent reopen by changing status from resolved to ongoing and setting status\_reason to customer\_reply. FR-018: System MUST include prev\_status for every TICKET\_UPDATED that changes status. |
| Assignment Rules | FR-019: System MUST include assignee\_id and team\_id in TICKET\_UPDATED ticket snapshots. FR-020: System MUST include assignment\_source with values manual, auto, or system when assignment changes. |
| Fields and Custom Properties | FR-021: System MUST include the full current fields object in TICKET\_CREATED and TICKET\_UPDATED. FR-022: System MUST support string values up to 1024 characters per field value. FR-023: System MUST support up to 100 custom fields per ticket. |
| Replies and Visibility | FR-024: System MUST include direction with values inbound or outbound for MESSAGE\_CREATED. FR-025: System MUST include visibility with values public or internal for MESSAGE\_CREATED. FR-026: System MUST include author\_type with values customer, agent, or system for MESSAGE\_CREATED. |
| Attachments | FR-027: System MUST include attachments\[\] when present on a message. FR-028: System MUST provide attachment access using a time limited URL or a time limited token. FR-029: System MUST set attachment access expiry to 10 minutes by default. FR-030: System MUST not include permanent private storage URLs in payloads. |
| Delivery and Retry | FR-031: System MUST consider a delivery successful only on HTTP 2xx response. FR-032: System MUST timeout a webhook request after 5 seconds. FR-033: System MUST retry failed deliveries up to 8 attempts within 24 hours. FR-034: System MUST apply exponential backoff between retries. FR-035: System MUST stop retries when webhook is disabled. |
| Delivery Logs | FR-036: System MUST store delivery attempts with timestamp, status, and failure category. FR-037: System MUST allow Admin to view delivery logs for the last 30 days. FR-038: System MUST allow filtering logs by event type and delivery status. |
| Test Webhook | FR-039: System MUST support a test delivery action from the webhook settings UI. FR-040: System MUST not impact real tickets when running a test delivery. |

## **7\. Error Handling**

| ID | Type | Handling | UI and UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block save if URL is invalid. | Show **"URL tidak valid"** under the field. Disable **"Simpan"** until fixed. |
| EH-002 | Validation | Block save if no event type selected. | Show **"Pilih minimal 1 event"**. Keep user on the same form. |
| EH-003 | Network | Retry failed delivery based on policy. | In logs show **"Gagal"** with next retry time. Provide **"Coba lagi"** for manual retry when retries are exhausted. |
| EH-004 | Timeout | Treat request as failed after 5 seconds. | Log failure category as timeout. Show **"Waktu tunggu habis"** in delivery detail. |
| EH-005 | Auth | If signature validation fails on client, it returns non 2xx. System retries. | In delivery detail show **"Ditolak oleh endpoint"**. Suggest rechecking secret in helper text. |
| EH-006 | Payload size | If payload exceeds limit, truncate non essential debug fields and keep required fields. | Show **"Payload terlalu besar"** in detail. Provide guidance: reduce fields or attachments usage. |
| EH-007 | Attachment expired | If client uses expired access method, download fails. | Client side should show **"Tautan kedaluwarsa"**. Satuinbox side logs no error since delivery succeeded. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Duplicate delivery due to retries and late 2xx response. | Same event\_id across attempts. Client can deduplicate safely. |
| EC-002 | Out of order updates for the same ticket. | Payload includes updated\_at. Client should apply last write wins by updated\_at. |
| EC-003 | Ticket resolved then inbound message arrives. | Emit MESSAGE\_CREATED for inbound. Emit TICKET\_UPDATED changing status to ongoing with status\_reason customer\_reply. |
| EC-005 | Webhook disabled during retry window. | Stop retries immediately. Mark remaining attempts as canceled in logs. |
| EC-006 | Attachment list is large. | Enforce max 20 attachments per message. Extra attachments are omitted and logged. |
| EC-007 | Internal note should not appear in customer UI. | visibility set to internal. Client can filter. |

## **9\. UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Webhook List Page | List of configured webhooks with status, URL, events, last delivery status. | 1\. Admin opens **"Pengaturan"**. 2\. Admin clicks **"Webhook"**. 3\. Admin sees list or empty state **"Belum ada webhook"** and button **"Tambah Webhook"**. | US-001, US-003, US-009 |
| Create Webhook Form | Form to input URL, secret, event selection, and default status. | 1\. Admin clicks **"Tambah Webhook"**. 2\. Admin fills fields. 3\. Admin clicks **"Simpan"**. 4\. Success toast **"Webhook berhasil disimpan"**. | US-001, US-002 |
| Test Webhook | Button to send test payload. | 1\. Admin clicks **"Uji Webhook"**. 2\. UI shows loading **"Mengirim tes"**. 3\. Show result **"Tes berhasil"** or **"Tes gagal"** with **"Lihat detail"**. | US-010 |
| Delivery Logs | Table view of delivery attempts. | 1\. Admin opens **"Riwayat Pengiriman"**. 2\. Admin filters by **"Event"** and **"Status"**. 3\. Admin opens detail drawer for one row. | US-009 |
| Delivery Detail Drawer | Shows attempt timeline, HTTP status, failure category, and next retry. | 1\. Admin opens a row. 2\. UI shows **"Rincian pengiriman"** with **"Coba lagi"** when applicable. | US-009 |
| Permission Block | Non Admin sees no access. | Show **"Akses ditolak"** and hide create button. | US-001 |

## **10\. Field and Validation**

### **10.1 Webhook Settings Fields**

| Field Name | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| Webhook Name | String | Client Ticket Webhook | 1\. Max 60 chars. 2\. No leading or trailing spaces. | Yes |
| Endpoint URL | URL | https://client.example.com/webhook | 1\. Must be HTTPS. 2\. Max 2048 chars. 3\. Must not include spaces. | Yes |
| Secret | String | \*\*\*\*\*\*\*\* | 1\. Min 16 chars. 2\. Max 64 chars. 3\. Can be rotated. 4\. After save, display masked only. | Yes |
| Event Types | Multi select | TICKET\_CREATED | 1\. At least 1 selected. 2\. Max 10 selected. | Yes |
| Status | Enum | Aktif | Allowed: Aktif, Nonaktif. | Yes |
| Description | String | Sync tickets to client UI | Max 200 chars. | No |

### **10.2 Event Payload Fields**

| Field Name | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| event\_id | String | evt\_abc123 | Unique per event occurrence. | Yes |
| event\_type | Enum | TICKET\_UPDATED | Allowed: TICKET\_CREATED, TICKET\_UPDATED, MESSAGE\_CREATED, T | Yes |
| occurred\_at | Timestamp | 2026-01-07T10:00:00Z | ISO 8601\. | Yes |
| ticket\_id | String | tkt\_123 | Non empty. | Yes |
| updated\_at | Timestamp | 2026-01-07T10:01:00Z | ISO 8601\. Required for ticket snapshots. | For ticket snapshots |
| status | Enum | ongoing | Allowed: unassigned, ongoing, resolved. | For TICKET\_CREATED, TICKET\_UPDATED |
| prev\_status | Enum | resolved | Same allowed values as status. | When status changes |
| status\_reason | Enum | customer\_reply | Allowed: agent\_action, customer\_reply, automation, system. | When status changes |
| assignee\_id | String or null | agent\_9 | Nullable. | For ticket snapshots |
| team\_id | String or null | team\_2 | Nullable. | For ticket snapshots |
| fields | Object | { "awb": "JNE123" } | 1\. Max 100 keys. 2\. Key max 64 chars. 3\. Value max 1024 chars. | For ticket snapshots |
| message\_id | String | msg\_555 | Non empty. | For MESSAGE\_CREATED |
| direction | Enum | inbound | Allowed: inbound, outbound. | For MESSAGE\_CREATED |
| visibility | Enum | public | Allowed: public, internal. | For MESSAGE\_CREATED |
| attachments | Array | \[ ... \] | Max 20 items. | When present |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | 1\. Deliver 99 percent of events within 2 minutes. 2\. Webhook request timeout is 5 seconds. |
| Availability | Webhook delivery pipeline availability 99.9 percent monthly. |
| Security | 1\. Require HTTPS endpoints. 2\. Sign payload using the stored secret. 3\. Mask secrets in UI and logs. |
| Privacy | 1\. Do not send sensitive personal data not required for ticket ops. 2\. Retain delivery logs for 30 days. |
| Observability | 1\. Track delivery success rate by workspace and event type. 2\. Track retry counts and failure categories. |
| Accessibility | Settings UI supports keyboard navigation and visible focus states. |

## **12\. Dependencies and Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Client endpoint is slow or unstable. | Client | Higher retry volume and delayed sync. | Enforce 5 second timeout. Provide clear logs and disable toggle. |
| Client does not implement idempotency. | Client | Duplicate tickets or messages. | Provide event\_id and integration guide. Surface warning in UI help text. |
| Attachment access leakage. | Satuinbox | Data exposure risk. | Use time limited access. Do not share permanent URLs. |
| Payload growth. | Satuinbox | Delivery failures. | Enforce limits and omit non essential fields. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Webhook delivery success rate | 99% | 30 days | Delivery logs |
| Median delivery latency | 30s | 30 days | Delivery logs |
| Ticket mismatch reports | \-80% | 30 days | Support tickets |
| Admin setup success rate | 95% | 30 days | Test webhook results |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Backfill and reconciliation tools. | Reduces impact of missed events during outages. |
| Additional events like tag changes as separate event types. | Improves client side UX without parsing diffs. |
| Inbound update flows from client to Satuinbox. | Enables true two way sync. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No bulk backfill in v1. | First time migrations need separate approach. |
| No message edits sync. | Client timeline may not reflect edits. |

## 

