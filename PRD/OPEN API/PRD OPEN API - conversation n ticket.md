# **Product Requirement Document (PRD)**

**Feature:** Open API – Inbox (Conversation & Ticket)

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.0 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide RESTful Open API endpoints to query, update, and enrich Inbox entities (conversations & tickets). |
| **Key Capabilities** | Search Inbox by properties, update properties & status, enrich Single Customer View with transaction history, link external tickets. |
| **Outcome** | Enable enterprise clients to automate workflows, sync external data (e.g., SAPX), and enrich customer context in Inbox. |

---

## **2 | Problem Statement**

1. Developers cannot programmatically search or update conversations/tickets.  
2. No API to sync external identifiers (e.g., AWB, courier status).  
3. Single Customer View cannot be enriched with external transactions.  
4. No webhook or bulk API support for enterprise-scale automation.

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Provide robust search API | 100% Inbox items searchable with filters. |
| Enable reliable update API | ≥ 95% success rate for status/property updates with audit logging. |
| Enrich customer view | ≥ 80% clients with SAPX/ERP integration use transaction API. |
| Enterprise readiness | Bulk, webhook, rate-limit & security requirements met by design. |

---

## **4 | Success Metrics**

| Category | Metric | Target |
| ----- | ----- | ----- |
| Reliability | API uptime | ≥ 99.9% |
| Performance | Search latency | ≤ 1s for ≤1000 items |
| Scalability | Bulk ops throughput | ≥ 10k items/min |
| Security | PII masking in API | 100% compliance |
| Adoption | Tenants using API in 3 months | ≥ 70% |

---

## **5 | User Stories & Acceptance Criteria**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| P0 | As a Developer, I want to search Inbox items by properties. | \- `GET /inbox?properties[awb]=12345` returns results. \- Supports AND/OR filters. \- Filter by status, date range, team, agent. \- Pagination (`page`, `limit`) and cursor-based supported. |
| P0 | As a Developer, I want to update properties and status via API. | \- `PATCH /inbox/{id}` updates properties. \- Status transitions validated (`unassigned → ongoing → resolved`). \- Reject invalid with `400`. \- All updates logged in Audit with `source=api`. |
| P0 | As a Developer, I want external systems to auto-resolve Inbox items. | \- `PATCH /inbox/{id}` with `status=resolved` allowed. \- Example: SAPX → auto-resolve ticket. \- Audit includes external event ID. |
| P1 | As a Developer, I want to enrich Single Customer View with transaction history. | \- `PUT /contacts/{id}` accepts phone/email validation. \- `transactions[]` array accepted. \- Transactions appear in sidebar UI. \- Invalid rejected with `400`. |
| P1 | As a Developer, I want to link external tickets to conversations. | \- `POST /inbox/{id}/links` attaches external ticket. \- Duplicate rejected with `409`. \- Visible in Linked Tickets section. |
| P1 | As a Developer, I want bulk update capability. | \- `PATCH /inbox/bulk` accepts list of IDs and updates. \- Max 1000 IDs per request. \- Async mode for \>1000 with job ID. |
| P2 | As a Developer, I want webhook event push. | \- Register webhook per tenant. \- Events: `INBOX_CREATED`, `STATUS_CHANGED`, `PROPERTY_UPDATED`, `RESOLVED`. \- Payload includes ID, status, properties. \- Retry on failure with exponential backoff. |

---

## **6 | Field-Level Details & Validation**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| id | String | UUID | `conv-12345` |
| status | Enum | `unassigned`, `ongoing`, `resolved` | `resolved` |
| properties | JSON | Key ≤64 chars, value ≤1024 chars | `{ "awb": "AWB12345" }` |
| transactions | Array | Optional | see below |
| transactions\[\].ref\_id | String | External reference ID | `ORD-9912` |
| transactions\[\].status | String | Generalized status string | `delivered` |
| transactions\[\].date | ISO DateTime | Required | `2025-08-29T12:00:00Z` |
| transactions\[\].amount | Number | Required | `250000` |
| transactions\[\].currency | String | ISO 4217 | `IDR` |
| transactions\[\].metadata | JSON | Flexible data | `{ "awb": "123456789", "courier": "JNE" }` |
| contact.phone | String | E.164 format | `+6281234567890` |
| contact.email | String | Email regex | `customer@email.com` |

---

## **7 | Error Handling**

| Code | Scenario | Response |
| ----- | ----- | ----- |
| 400-INV-PROP | Invalid property format | `{ "error": "Invalid property format" }` |
| 400-INV-STATUS | Illegal status transition | `{ "error": "Invalid status transition" }` |
| 404-NOT-FOUND | ID not found | `{ "error": "Inbox item not found" }` |
| 409-DUP-LINK | Duplicate linked item | `{ "error": "Already linked" }` |
| 429-RATE-LIMIT | Exceeded rate limit | `{ "error": "Too many requests", "retry_after": 5 }` |
| 500-SRV-ERR | Server error | `{ "error": "Internal server error" }` |

---

## **8 | Sample API Usage**

### **Search**

`GET /v1/inbox?properties[awb]=123456789&status=ongoing&page=1&limit=20`

### **Update & Resolve**

`PATCH /v1/inbox/conv-12345`  
`{`  
  `"status": "resolved",`  
  `"properties": { "awb": "123456789", "resolved_by": "SAPX" }`  
`}`

### **Enrich Customer View**

`PUT /v1/contacts/cust-1001`  
`{`  
  `"phone": "+6281234567890",`  
  `"transactions": [`  
    `{`  
      `"ref_id": "ORD-9912",`  
      `"status": "delivered",`  
      `"date": "2025-08-29T12:00:00Z",`  
      `"amount": 250000,`  
      `"currency": "IDR",`  
      `"metadata": { "awb": "123456789", "courier": "JNE" }`  
    `}`  
  `]`  
`}`

### **Link External Ticket**

`POST /v1/inbox/conv-12345/links`  
`{`  
  `"external_ticket_id": "SAPX-777",`  
  `"source": "SAPX",`  
  `"url": "https://sapx.com/ticket/777"`  
`}`

---

## **9 | Non-Functional & Security Considerations**

* **Authentication:** OAuth2.0 Client Credentials or API Key per tenant.  
* **Authorization:** Role-based scopes (`read`, `write`, `admin`).  
* **PII Masking:** API responses mask phone/email unless caller has `admin` scope.  
* **Rate Limits:** 100 requests/sec per tenant, 429 error if exceeded.  
* **Idempotency:** `Idempotency-Key` header supported for `PATCH` and `POST`.  
* **Pagination:** Default page-based; cursor pagination available for \>10k records.  
* **Versioning:** All endpoints prefixed with `/v1/`. Future changes use `/v2/`.  
* **Audit Trail:** Every API action logged with `actor`, `source`, `timestamp`.

---

## **10 | Future Considerations**

1. Async export/import jobs for \>1M records.  
2. Multi-region API endpoints for latency reduction.  
3. Advanced query DSL for complex filters.

---

## **11 | Limitations**

* Transactions array limited to 200 per contact.  
* Properties JSON ≤ 8KB per Inbox item.  
* Bulk update max 1000 items per call (async required for more).

