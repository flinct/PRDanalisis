# **Product Requirement Document (PRD)**

**Feature:** Broadcast System \- Open API

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v2.0 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 31 Aug 2025 | Yusril Ibnu | Initial extraction from main Broadcast PRD focusing on API endpoints for send, cancel, status, and team inbox listing. |
| v2.0 | 03 Sep 2025 | Yusril Ibnu | Aligned to standard template. Added Impact to Problem Statement, Timeline to OKRs, numbered User Stories, Functional Requirements, Non-Functional Requirements, UI/UX Requirements table (minimal for API focus), Dependencies & Risks, enhanced Success Metrics with tools. Added detailed API specs with validation rules. Rechecked priorities (P0: Core endpoints; P1: Helper endpoints). Improved error handling with negative scenarios, added workarounds for limitations. Ensured consistency with Core Broadcast and Omnichannel Inbox (e.g., teamInboxId integration). |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide a robust Open API for the Broadcast System to trigger, cancel, monitor, and manage campaigns, integrating seamlessly with WhatsApp Web and Omnichannel Inbox workflows. |
| **Key Capabilities** | Endpoints: /broadcast/send (trigger), /broadcast/cancel (stop), /broadcast/status (monitor), /broadcast/team-inboxes (list inboxes/numbers/quotas). Supports tenant authentication, idempotency, rate limits, and detailed responses with ETA, quota, and per-recipient statuses. |
| **Outcome** | Enable developers to automate and monitor broadcasts with clear visibility, high reliability (≥99% uptime), and compliance with anti-spam policies, reducing manual intervention by ≥80%. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | No single API entry point for triggering/managing broadcasts. | Forces developers to use multiple systems, increasing complexity and integration errors. |
| 2 | Lack of status visibility for ongoing campaigns. | Hinders real-time monitoring, leading to delays in issue detection and resolution. |
| 3 | No ability to cancel running broadcasts programmatically. | Requires manual intervention, risking incomplete campaigns and compliance issues. |
| 4 | Missing team inbox/quota information via API. | Prevents automation of number selection, causing inefficiencies in large-scale setups. |
| 5 | Inconsistent error handling and rate limits. | Leads to unpredictable API behavior, developer frustration, and potential abuse. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Provide robust API for broadcast triggers | 100% of campaigns triggerable via /send with ETA/quotas. | Q4 2025 |
| Enable cancellation of broadcasts | 100% ongoing broadcasts cancellable via /cancel. | Q4 2025 |
| Offer detailed status monitoring | /status returns progress, ETA, recipient details for 100% campaigns. | Q4 2025 |
| Support inbox/number discovery | /team-inboxes lists 100% of inboxes with quotas/numbers. | Q4 2025 |
| Ensure API reliability and security | ≥99% uptime; 100% requests authenticated/rate-limited. | Q4 2025 |

---

## **4 | User Stories & Acceptance Criteria**

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As a Developer, I want to trigger broadcasts via API for automation. | \- /send accepts channel, teamInboxId, audience, message/templateId, properties, inboxMode. \- Returns broadcastId, ETA, quota, sampled results. \- Negative: Invalid payload returns 400 with error. |
| US-2 | P0 | As a Developer, I want to cancel broadcasts to stop unwanted campaigns. | \- /cancel accepts broadcastId. \- Marks pending/queued as cancelled; updates ETA. \- Negative: Non-existent ID returns 404; completed returns 409\. |
| US-3 | P0 | As a Developer, I want to monitor broadcast progress and statuses. | \- /status returns campaign status, progress %, ETA, per-recipient details (paginated). \- Negative: Invalid ID returns 404\. |
| US-4 | P1 | As a Developer, I want to list team inboxes and quotas for planning. | \- /team-inboxes returns inbox IDs, names, numbers, status, quotas. \- Includes history for usage tracking. \- Negative: No inboxes returns empty list. |
| US-5 | P0 | As a Developer, I want idempotent sends to prevent duplicates. | \- Optional Idempotency-Key header; same key returns same broadcastId. \- Negative: Key conflict on different payload returns 409\. |
| US-6 | P0 | As a Developer, I want secure, rate-limited APIs to prevent abuse. | \- Bearer token required; tenant-scoped. \- Max 5 concurrent /send per tenant. \- Negative: Unauth returns 401; rate limit returns 429\. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Triggering Broadcasts** | \- /send: Validates channel, teamInboxId, audience, message/template, properties, inboxMode. \- Returns broadcastId, ETA, quotas, sample results. \- Negative: Invalid data rejects with 400\. |
| **Cancellation** | \- /cancel: Stops pending/queued messages; updates status to cancelled. \- Returns sent vs cancelled counts. \- Negative: Invalid/completed ID rejects with 404/409. |
| **Status Monitoring** | \- /status: Aggregates campaign progress, ETA, recipient statuses. \- Paginate recipients (\>100). \- Negative: Non-existent ID returns 404\. |
| **Inbox Discovery** | \- /team-inboxes: Lists inboxes, numbers, status, quotas (todaySent/todayLimit/quotaLeft). \- Negative: Empty tenant returns \[\]. |
| **Security & Limits** | \- Tenant-scoped Bearer auth. \- Idempotency via header. \- Rate limit: 5 parallel /send. \- Negative: Violations return 401/429. |

---

## **6 | API Specification**

### **6.1 Authentication & Conventions**

| Item | Description |
| ----- | ----- |
| **Authentication** | Bearer token (JWT), tenant-scoped, required for all endpoints. |
| **Versioning** | Path-based: `/v1`. |
| **Idempotency** | Optional `Idempotency-Key` header for `/send` to prevent duplicates. |
| **Rate Limits** | Max 5 concurrent `/send` per tenant; 100 requests/min for other endpoints. |

---

### **6.2 POST /v1/broadcast/send**

**Purpose**: Trigger a broadcast campaign with fan-out, resilience, delays, and logging handled by the system.

#### **Request Body**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| `channel` | String | Enum: `whatsapp_web`. **Required**. | `whatsapp_web` |
| `teamInboxId` | String | Must exist; tenant-scoped. **Required**. | `TI-123` |
| `audience` | Array\<Object\> | List of recipients; min 1\. **Required**. | `[{"to":"+6281234567890"},{"to":"+6281111111111"}]` |
| `audience[].to` | String | E.164 format, 9–15 digits. **Required**. | `+6281234567890` |
| `inboxMode` | String | Enum: `ALL`, `REPLY_ONLY`. Default: `ALL`. | `ALL` |
| `message` | String or Array\<String\> | Max 4096 chars per string; supports spintax. Optional if `templateId` is set. | \`\["{Hello |
| `templateId` | String | Nullable; exclusive with empty `message`. | `TPL-45101` |
| `properties` | Object | JSON (string, number, bool, object); max 8KB. Optional. | `{"contactName":"Bagus","orderId":"AWB-12345"}` |

#### **Example Request (Raw Message)**

`{`  
  `"channel": "whatsapp_web",`  
  `"teamInboxId": "TI-123",`  
  `"audience": [`  
    `{ "to": "+6281234567890" },`  
    `{ "to": "+6281111111111" }`  
  `],`  
  `"inboxMode": "ALL",`  
  `"message": [`  
    `"{Hello|Hi}, {contactName}!",`  
    `"Order {orderId} is ready."`  
  `],`  
  `"properties": {`  
    `"contactName": "Bagus",`  
    `"orderId": "AWB-12345",`  
    `"division": "Jawa Barat",`  
    `"batchId": "BATCH001",`  
    `"priority": true`  
  `},`  
  `"templateId": null`  
`}`

#### **Example Request (Template)**

`{`  
  `"channel": "whatsapp_web",`  
  `"teamInboxId": "TI-123",`  
  `"audience": [{ "to": "+6281234567890" }],`  
  `"inboxMode": "REPLY_ONLY",`  
  `"templateId": "TPL-45101",`  
  `"properties": {`  
    `"contactName": "Bagus",`  
    `"orderId": "AWB-48928394294"`  
  `}`  
`}`

#### **Response**

| Field | Type | Description | Example |
| ----- | ----- | ----- | ----- |
| `broadcastId` | String | Unique campaign ID. | `BRD-20250831-001` |
| `status` | String | Campaign status: `in_progress`. | `in_progress` |
| `submitted` | Integer | Total recipients submitted. | `2` |
| `accepted` | Integer | Recipients accepted for processing. | `2` |
| `rejected` | Integer | Recipients rejected (invalid). | `0` |
| `connection` | String | Connection used: `main`, `secondary`, `backup_3`, `backup_4`. | `main` |
| `tier` | String | Account tier (1–6). | `Tier 4` |
| `quota` | Object | Quota details for selected number. | See below |
| `quota.number` | String | Phone number used. | `+6281234567890` |
| `quota.todaySent` | Integer | Messages sent today. | `765` |
| `quota.todayLimit` | Integer | Daily limit. | `1500` |
| `quota.quotaLeft` | Integer | Remaining quota. | `735` |
| `estimatedCompletion` | String | Estimated time to complete. | `18m 22s` |
| `resultsSample` | Array\<Object\> | Sample recipient statuses (max 10). | `[{"recipient":"+6281234567890","status":"queued","reason":null}]` |

#### **Example Response**

`{`  
  `"broadcastId": "BRD-20250831-001",`  
  `"status": "in_progress",`  
  `"submitted": 2,`  
  `"accepted": 2,`  
  `"rejected": 0,`  
  `"connection": "main",`  
  `"quota": {`  
    `"number": "+6281234567890",`  
    `"tier": "Tier 4",`  
    `"todaySent": 765,`  
    `"todayLimit": 1500,`  
    `"quotaLeft": 735`  
  `},`  
  `"estimatedCompletion": "18m 22s",`  
  `"resultsSample": [`  
    `{ "recipient": "+6281234567890", "status": "queued", "reason": null },`  
    `{ "recipient": "+6281111111111", "status": "queued", "reason": null }`  
  `]`  
`}`

#### **Errors**

| Code | Error Message (ID) | Description |
| ----- | ----- | ----- |
| 400-BRC01 | "Invalid payload" | Invalid request structure/values. |
| 403-BRC03 | "Daily limit reached" | Quota exceeded. |
| 404-TPL01 | "Template not found" | Invalid `templateId`. |
| 404-BRC04 | "Team Inbox not found" | Invalid `teamInboxId`. |
| 429-BRC08 | "Rate limit reached" | Rate limit exceeded. |

## **6.3 POST /v1/broadcast/cancel**

**Purpose**: Cancel an ongoing broadcast campaign.

### **Request Body**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| `broadcastId` | String | **Required**; valid campaign ID | `BRD-20250831-001` |

### **Example Request**

`{`  
  `"broadcastId": "BRD-20250831-001"`  
`}`

### **Response**

| Field | Type | Description | Example |
| ----- | ----- | ----- | ----- |
| `broadcastId` | String | Campaign ID. | `BRD-20250831-001` |
| `status` | String | Updated status: `cancelled`. | `cancelled` |
| `sent` | Integer | Messages already sent. | `120` |
| `remaining` | Integer | Messages cancelled. | `880` |
| `message` | String | Success confirmation. | `"Broadcast cancelled"` |

### **Example Response**

`{`  
  `"broadcastId": "BRD-20250831-001",`  
  `"status": "cancelled",`  
  `"sent": 120,`  
  `"remaining": 880,`  
  `"message": "Broadcast cancelled"`  
`}`

### **Errors**

| Code | Error Message (ID) | Description |
| ----- | ----- | ----- |
| 404-BRC09 | "Broadcast not found" | Invalid `broadcastId`. |
| 409-BRC10 | "Broadcast already completed" | Campaign already finished. |

---

## **6.4 GET /v1/broadcast/status**

**Purpose**: Retrieve progress, ETA, and per-recipient breakdown of a broadcast.

### **Query Parameters**

| Parameter | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| `broadcastId` | String | **Required**; valid campaign ID | `BRD-20250831-001` |
| `offset` | Integer | Optional; default `0`. | `0` |
| `limit` | Integer | Optional; max `100`, default `50`. | `50` |

**Example Query**:  
 `?broadcastId=BRD-20250831-001&offset=0&limit=50`

### **Response**

| Field | Type | Description | Example |
| ----- | ----- | ----- | ----- |
| `broadcastId` | String | Campaign ID. | `BRD-20250831-001` |
| `status` | String | Campaign status: `in_progress`, `completed`, `cancelled`, `failed`. | `in_progress` |
| `progress` | Object | Status counts. | See below |
| `progress.queued` | Integer | Messages queued. | `820` |
| `progress.pending` | Integer | Messages scheduled. | `60` |
| `progress.sent` | Integer | Messages delivered. | `120` |
| `progress.failed` | Integer | Messages failed. | `10` |
| `progress.invalid_contact` | Integer | Invalid recipients. | `5` |
| `progress.cancelled` | Integer | Messages cancelled. | `0` |
| `estimatedCompletion` | String | Time to complete. | `17m 05s` |
| `connection` | String | Connection used. | `main` |
| `tier` | String | Account tier. | `Tier 4` |
| `quota` | Object | Quota details. | See below |
| `recipients` | Array\<Object\> | Paginated recipient statuses. | See below |
| `recipients[].to` | String | Recipient number. | `+6281234567890` |
| `recipients[].status` | String | Status: `queued`, `pending`, `sent`, `failed`, `invalid_contact`, `cancelled`. | `sent` |
| `recipients[].reason` | String | Failure reason (nullable). | `null` |
| `recipients[].connection` | String | Connection used. | `main` |
| `recipients[].sentAt` | String | ISO timestamp (nullable). | `2025-08-31T09:32:10Z` |
| `recipients[].roomId` | String | Linked room (nullable). | `ROOM-55221` |

### **Example Response**

`{`  
  `"broadcastId": "BRD-20250831-001",`  
  `"status": "in_progress",`  
  `"progress": {`  
    `"queued": 820,`  
    `"pending": 60,`  
    `"sent": 120,`  
    `"failed": 10,`  
    `"invalid_contact": 5,`  
    `"cancelled": 0`  
  `},`  
  `"estimatedCompletion": "17m 05s",`  
  `"connection": "main",`  
  `"quota": {`  
    `"number": "+6281234567890",`  
    `"tier": "Tier 4",`  
    `"todaySent": 780,`  
    `"todayLimit": 1500,`  
    `"quotaLeft": 720`  
  `},`  
  `"recipients": [`  
    `{`  
      `"to": "+6281234567890",`  
      `"status": "sent",`  
      `"reason": null,`  
      `"connection": "main",`  
      `"sentAt": "2025-08-31T09:32:10Z",`  
      `"roomId": "ROOM-55221"`  
    `},`  
    `{`  
      `"to": "+6281111111111",`  
      `"status": "pending",`  
      `"reason": null,`  
      `"connection": "main"`  
    `}`  
  `]`  
`}`

### **Errors**

| Code | Error Message (ID) | Description |
| ----- | ----- | ----- |
| 404-BRC12 | "Broadcast not found" | Invalid `broadcastId`. |

---

## **6.5 GET /v1/broadcast/team-inboxes**

**Purpose**: List team inboxes, associated numbers, and quota information.

### **Response**

| Field | Type | Description | Example |
| ----- | ----- | ----- | ----- |
| `teamInboxes` | Array\<Object\> | List of inboxes. | See below |
| `teamInboxes[].id` | String | Inbox ID. | `TI123` |
| `teamInboxes[].name` | String | Inbox name. | `Inbox-CS` |
| `teamInboxes[].numbers` | Array\<Object\> | Associated numbers. | See below |
| `teamInboxes[].numbers[].number` | String | Phone number. | `+6281234567890` |
| `teamInboxes[].numbers[].status` | String | Status: `active`, `inactive`. | `active` |
| `teamInboxes[].numbers[].todaySent` | Integer | Messages sent today. | `765` |
| `teamInboxes[].numbers[].todayLimit` | Integer | Daily limit. | `1500` |
| `teamInboxes[].numbers[].quotaLeft` | Integer | Remaining quota. | `735` |

### **Example Response**

`{`  
  `"teamInboxes": [`  
    `{`  
      `"id": "TI123",`  
      `"name": "Inbox-CS",`  
      `"numbers": [`  
        `{`  
          `"number": "+6281234567890",`  
          `"status": "active",`  
          `"todaySent": 765,`  
          `"todayLimit": 1500,`  
          `"quotaLeft": 735`  
        `}`  
      `]`  
    `},`  
    `{`  
      `"id": "TI456",`  
      `"name": "Inbox-Sales",`  
      `"numbers": [`  
        `{`  
          `"number": "+628122222222",`  
          `"status": "inactive",`  
          `"todaySent": 0,`  
          `"todayLimit": 0,`  
          `"quotaLeft": 0`  
        `}`  
      `]`  
    `}`  
  `]`  
`}`

### **Errors**

* None specific; standard `401`/`429` for authentication and rate limits.

---

## **6.6 Validation Rules**

| Area | Rules |
| ----- | ----- |
| `audience` | Deduplicate numbers; must be in E.164 (9–15 digits); array cannot be empty. |
| `templateId` | Must exist if provided; body must not be empty. |
| `message` | String or array; each ≤ 4096 chars; supports spintax. |
| `properties` | JSON; keys ≤ 64 chars; total size ≤ 8KB. |
| `inboxMode` | Enum: `ALL`, `REPLY_ONLY`. |
| `quota` | Enforce tier cap per number per day. |
| `rateLimit` | Max 5 concurrent `/send`; 100/min for other endpoints. |
| `idempotency` | Same `Idempotency-Key` returns the same `broadcastId`. |

---

## **7 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- /send handoff ≤1.5s; /status ≤600ms; /team-inboxes ≤500ms. |
| **Scalability** | \- Handle 1,000+ concurrent API calls; scale via load balancers. |
| **Reliability** | \- ≥99% uptime; at-least-once delivery for /send. |
| **Security** | \- Tenant-scoped JWT; RBAC for endpoints. \- Encrypt sensitive fields (e.g., numbers). |
| **Observability** | \- Metrics: API latency, error rates (Prometheus). \- Logs: JSON in ELK for queries. |

---

## **8 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **API Dashboard** | Developer portal with endpoint docs, try-it-out forms. | Access → auth with token; test calls with sample payloads. |
| **Status Monitor** | Table of broadcast statuses; filter by ID/status. | Query /status → paginate results; export option. |
| **Error Toasts** | Inline errors for 400/403/429 with codes. | Call fails → show code/message; link to docs. |

---

## **9 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Invalid Payload | Reject with 400\. | "Payload tidak valid". |
| Quota Exceeded | Reject with 403\. | "Batas harian tercapai". |
| Broadcast Not Found | Reject with 404\. | "Broadcast tidak ditemukan". |
| Already Completed | Reject with 409\. | "Broadcast sudah selesai". |
| Rate Limit Exceeded | Reject with 429\. | "Batas panggilan tercapai". |
| Unauthorized | Reject with 401\. | "Akses ditolak". |

---

## **10 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Core Broadcast for campaign logic. \- Team Inbox for numbers/quotas. \- WhatsApp Libraries for delivery. |
| **External** | \- JWT provider for auth. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Rate Limit Overloads | Medium | High | Enforce strict limits; monitor usage. |
| Auth Failures | Low | Medium | Validate tokens; provide clear errors. |
| API Latency | Medium | Medium | Optimize queries; cache inboxes. |

---

## **11 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| API Uptime | ≥99% | Prometheus monitoring. |
| Call Success Rate | ≥95% | ELK log analysis. |
| Developer CSAT | ≥4/5 | Post-integration survey. |
| Rate Limit Violations | \<5% | Session tracking. |

---

## **12 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| Webhook for status updates. | P1 |
| Batch API for multiple broadcasts. | P1 |
| API versioning for backward compatibility. | P2 |

---

## **13 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Max 5 concurrent /send. | Queue additional calls. | P2 |
| No webhook for statuses. | Poll /status periodically. | P1 |
| Pagination for large recipient lists. | Use offset/limit in /status. | N/A |

