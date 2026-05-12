# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Broadcast System Open API \- List Broadcasts Endpoint (`GET /v1/broadcast/list`)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-30 | Yusril | Initial PRD for `GET /v1/broadcast/list` with optional `status` filter, aligned to existing pagination patterns. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a single endpoint to retrieve a paginated list of broadcasts, optionally filtered by broadcast `status`, to support programmatic monitoring and admin tooling. |
| Scope | Add `GET /v1/broadcast/list` under `/v1` with tenant-scoped auth, offset/limit pagination, and optional `status` filter. |

| In Scope | Out of Scope |
| ----- | ----- |
| `GET /v1/broadcast/list` endpoint. | Webhook for broadcast updates. |
| Optional filter: `status`. | Complex filtering (date range, keyword search, multi-filter). |
| Pagination: `offset`, `limit`. | Sorting customization beyond default. |
| Standard error responses and rate limits. | Returning per-recipient statuses (use `/broadcast/status`). |

---

## **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | No endpoint to list broadcasts for a tenant. | Integrators must track IDs externally, reducing observability and increasing operational overhead. |
| 2 | No server-side filtering by status for broadcast listing. | Monitoring tools must fetch everything and filter client-side, increasing latency and API load. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Enable broadcast discovery via API. | 100% broadcasts can be listed via `GET /v1/broadcast/list` with stable pagination. |
| Reduce monitoring complexity. | ≥80% reduction in client-side filtering calls by using `status` filter. |
| Maintain predictable performance. | p95 latency ≤ 500 ms for typical tenants (limit ≤ 50). |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Developer, I want to retrieve a list of broadcasts so that I can build monitoring and operational tools. | 1\. Given a valid tenant token, When I call `GET /v1/broadcast/list` without filters, Then the API returns a paginated list of broadcasts ordered by newest first. 2\. Given an empty tenant, When I call the endpoint, Then the API returns `items=[]` with `hasMore=false`. 3\. Given an invalid token, When I call the endpoint, Then the API returns 401\. |
| US-002 | P0 | As a Developer, I want to filter broadcasts by status so that I can monitor only relevant campaigns. | 1\. Given valid input, When I set `status=in_progress`, Then the API returns only broadcasts with `status=in_progress`. 2\. Given an unknown status value, When I call the endpoint, Then the API returns 400 with a validation error. 3\. Given a status filter that matches none, When I call the endpoint, Then the API returns `items=[]` with `hasMore=false`. |
| US-003 | P0 | As a Developer, I want predictable pagination so that I can fetch lists safely and consistently. | 1\. Given `offset` and `limit`, When I call the endpoint, Then the API returns at most `limit` items and echoes `offset` and `limit` in response. 2\. Given `limit` greater than max, When I call the endpoint, Then the API returns 400\. 3\. Given `offset` negative, When I call the endpoint, Then the API returns 400\. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Endpoint | FR-001: System MUST expose `GET /v1/broadcast/list`. FR-002: System MUST require tenant-scoped Bearer authentication for this endpoint. |
| Filtering | FR-003: System MUST support optional `status` query parameter. FR-004: System MUST validate `status` against enum: `in_progress`, `completed`, `cancelled`, `failed`. |
| Pagination | FR-005: System MUST support `offset` query parameter with default `0`. FR-006: System MUST support `limit` query parameter with default `50` and max `100`. FR-007: System MUST return `hasMore` boolean. FR-008: System MUST return `nextOffset` when `hasMore=true`, else return `nextOffset=null`. |
| Sorting | FR-009: System MUST return broadcasts sorted by `createdAt` descending (newest first). |
| Response shape | FR-010: System MUST return `items[]` where each item contains broadcast summary fields needed for monitoring without calling `/status` for every broadcast. |
| Consistency | FR-011: System SHOULD be eventually consistent. A broadcast status may change between page requests. |
| Rate limits | FR-012: System MUST enforce rate limit consistent with other read endpoints: 100 requests per minute per tenant. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Unauthorized | Return 401\. No data returned. | Message (Bahasa Indonesia): "Akses ditolak". |
| EH-002 | Invalid query parameter | Return 400 with canonical error object including invalid field and reason. | Message (Bahasa Indonesia): "Parameter tidak valid". |
| EH-003 | Rate limited | Return 429 with retry guidance in error details. | Message (Bahasa Indonesia): "Batas panggilan tercapai". |
| EH-004 | Server error | Return 500 with request correlation info when available. | Message (Bahasa Indonesia): "Terjadi kesalahan. Silakan coba lagi". |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Tenant has zero broadcasts | Return 200 with `items=[]`, `hasMore=false`, `nextOffset=null`. |
| EC-002 | Broadcast status changes between pagination calls | API returns current snapshot at read time. Client must not assume stable membership across pages. |
| EC-003 | Very large `offset` | Return 200 with empty `items` when offset beyond dataset size. |
| EC-004 | `limit=0` | Reject with 400\. |
| EC-005 | Multiple clients paging concurrently | Independent paging. No locking. Eventually consistent list. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Not applicable | This feature is API-only. No UI requirements are defined in this PRD. | Not applicable. | US-001, US-002, US-003 |

---

## **10\. Field & Validation**

| Field Name | Type | Description | Example Value | Validation | Required/Optional | Applies To |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Authorization | String | Tenant-scoped API credential. | Bearer xxxxx | Must be valid and active. | Required | All requests |
| request\_id | String | Client-provided correlation ID for tracing. | req\_01J... | Length 1 to 64\. ASCII. | Optional | All requests |
| status | String | Filter broadcasts by status. | in\_progress | Enum: `in_progress`, `completed`, `cancelled`, `failed`. | Optional | Query |
| offset | Integer | Pagination offset. | 0 | Min 0\. Default 0\. | Optional | Query |
| limit | Integer | Pagination limit. | 50 | Min 1\. Max 100\. Default 50\. | Optional | Query |

---

## **11\. Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | p95 latency ≤ 500 ms for `limit ≤ 50` for typical tenants. |
| Reliability | ≥99% uptime aligned with Open API platform targets. |
| Security | Tenant-scoped authorization enforced on every request. No cross-tenant data leakage. |
| Observability | Log request outcome with status code and latency. Support correlation via `request_id` when provided. |

---

## **12\. Dependencies & Risks**

| Type | Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| Dependency | Broadcast datastore and indexing by tenant and createdAt. | Engineering | Slow listing at scale without indexes. | Ensure index on (tenantId, createdAt) and (tenantId, status, createdAt). |
| Risk | Counting total results is expensive at scale. | Engineering | Latency spikes if `total` is computed. | Do not return `total`. Use `hasMore` and `nextOffset`. |
| Risk | Eventual consistency confusion for clients paging. | Product | Duplicate or missing items across pages. | Document behavior in API docs. Encourage clients to store `broadcastId` seen. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Endpoint adoption | ≥50 active tenants using `/broadcast/list`. | 30 days post-release | API logs |
| Error rate | ≤1% 4xx excluding 401 for invalid tokens. | Weekly | API logs |
| p95 latency | ≤500 ms | Weekly | APM metrics |
| Polling efficiency | ≥30% reduction in `/status` calls per tenant for monitoring tools. | 60 days | API logs |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Additional filters (teamInboxId, channel, createdAt range) | Improve precision for large tenants without client-side filtering. |
| Cursor-based pagination | Better consistency under frequent inserts and status changes. |
| Webhook for broadcast status updates | Reduce polling needs and API load. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Only supports filtering by `status`. | Monitoring tools needing other filters must filter client-side. |
| Offset-based pagination with eventual consistency | Paging may not be perfectly stable during rapid changes. |

---

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Endpoint | `GET /v1/broadcast/list` |
| Query example | `GET /v1/broadcast/list?status=in_progress&offset=0&limit=50` |

