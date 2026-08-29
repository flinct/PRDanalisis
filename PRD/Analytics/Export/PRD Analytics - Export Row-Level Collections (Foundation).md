# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics Row-Level Export Collections + Zero-Impact Sync Pipeline
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: N/A (system/infrastructure PRD — no UI)

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD for Sub-PRD A: row-level export collections + zero-impact sync pipeline. |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide row-level data collections in `satuinbox_analytics` for export use cases, decoupling export read-load from domain-service operational collections. |
| Scope | Three new MongoDB collections (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`), event-driven sync pipeline from domain services, historical backfill, retention, and multi-tenant isolation. |
| Key Capabilities | (1) Per-entity row-level analytics data matching SAP/report column requirements. (2) Zero-impact sync pipeline consuming domain events via RabbitMQ. (3) Backfill from MongoDB secondary reads. (4) Strict tenant scoping on every read/write. |
| Outcome | Export jobs (Sub-PRD B/D) can read from analytics instead of operational collections, with zero performance impact on domain services. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| 3 new row-level collections in `satuinbox_analytics` | Column registry + configurable column picker UI → Sub-PRD B |
| Schema definition, indexes, validation | Export job/download UX (reuse existing offline-report infra) → Sub-PRD B/D |
| Event-driven sync pipeline (RabbitMQ consumers) | SAP 4-sheet template mapping → Sub-PRD D |
| Backfill from MongoDB secondary reads | Broadcast export UX → Sub-PRD C |
| Data retention & TTL policy | Format export baru selain XLSX |
| Multi-tenant scoping enforcement | Ubah schema collection operasional |
| PII handling for exported row data | Ubah dashboard/metrics analytics agregat |
| Observability: sync lag, backfill progress, latency guard | |
| Idempotent upsert, out-of-order event handling | |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | All 5 existing analytics collections store only pre-aggregated daily counts — no row-level records exist for export. | Export cannot read from analytics. Must read from operational collections, coupling export load to domain-service performance. |
| PS-002 | Export reads operational collections directly, adding read pressure to conversation-service, ticket-service, and broadcast-service primary nodes. | Risk of performance degradation on live customer-service operations during heavy export jobs. OQ-11 hard constraint violated. |
| PS-003 | No dedicated broadcast export collection exists. Broadcast daily metrics only has 7 aggregate count fields. | Cannot support recipient-level or campaign-level broadcast exports from analytics. |
| PS-004 | Historical export data has no analytics-side store. If operational data changes or is archived, export parity is lost. | Export reproducibility and audit trail depends on mutable operational data. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Decouple export read-load from domain services | All export reads route to analytics row-level collections; zero direct operational-collection reads from export path after cutover. |
| Zero performance impact on domain services | Domain service (conversation/ticket/broadcast-service) p95 and p99 latency MUST NOT increase by more than 2% during sync or backfill, measured over a 1-hour rolling window. |
| Provide complete row-level data for all export domains | 3 new collections cover: 27+ columns for conversation, 35+ columns for ticket, 23+ columns for broadcast — sufficient for SAP report + configurable picker. |
| Maintain multi-tenant isolation | 100% of reads and writes scoped by `companyId` + `organizationId`. Zero cross-tenant data leaks. |
| Keep data fresh for export consumers | Sync lag from domain event to analytics collection < 5 minutes at p95. |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Data Engineer, I want row-level conversation data in analytics collections so that export jobs can read from analytics instead of operational databases. | 1. Given a conversation exists in conversation-service, When the sync pipeline processes the corresponding domain event, Then a row appears in `conversationexportdata` within 5 minutes. 2. Given a conversation update event (status change, assignment, close), When processed, Then the existing row is upserted with updated fields. 3. Given the row is queried, When scoped by `companyId` + `organizationId`, Then only rows belonging to that tenant are returned. |
| US-002 | P0 | As a Data Engineer, I want row-level ticket data in analytics collections so that export jobs can read ticket details from analytics. | 1. Given a ticket exists in ticket-service, When the sync pipeline processes the domain event, Then a row appears in `ticketexportdata`. 2. Given a ticket has custom fields, When synced, Then custom field values are stored as a map/array in the row. 3. Given a ticket status changes, When the update event is processed, Then the row reflects the new status and stage durations are recalculated. |
| US-003 | P0 | As a Data Engineer, I want row-level broadcast recipient data in analytics collections so that broadcast exports can read from analytics. | 1. Given a broadcast is sent to a recipient, When the domain event is processed, Then a row appears in `broadcastexportdata` with status, recipient info, and broadcast metadata. 2. Given an Open API request fails validation (INVALID_REQUEST), When processed, Then a row appears with `status = INVALID_REQUEST` and `reason` contains validation details. 3. Given a broadcast row already exists (duplicate event), When re-processed, Then the row is upserted idempotently. |
| US-004 | P0 | As an Engineering Lead, I want the sync pipeline to have zero measurable impact on domain-service performance so that customer-service operations are not degraded. | 1. Given the sync pipeline is running, When domain services process normal traffic, Then p95 latency deviation is < 2% compared to baseline without sync. 2. Given backfill is running, When domain services process normal traffic, Then p95 latency deviation is < 2% compared to baseline. 3. Given domain service latency exceeds threshold, When the guard alarm fires, Then backfill is automatically paused and an alert is sent. |
| US-005 | P0 | As a Data Engineer, I want historical data backfilled into the new collections so that export jobs can cover the full date range from day one. | 1. Given backfill is triggered, When it reads from MongoDB secondary, Then it processes data in configurable chunk sizes with throttling. 2. Given backfill is running, When progress is checked, Then a progress metric shows percentage complete and estimated time remaining. 3. Given backfill completes, When a parity check runs, Then row counts match source collection counts for the backfilled date range (±0.1% tolerance for concurrent writes during backfill). |
| US-006 | P0 | As a Platform Engineer, I want all reads and writes on the new collections to be scoped by `companyId` + `organizationId` so that no cross-tenant data leak can occur. | 1. Given a query without `companyId`, When executed, Then it MUST be rejected or return zero results. 2. Given a query with wrong `organizationId`, When executed, Then zero rows are returned even if the `companyId` matches. 3. Given an event without tenant dimensions, When consumed, Then the event is rejected and logged as an error. |
| US-007 | P1 | As a Data Engineer, I want row-level export data retained for a defined period and automatically purged so that storage stays bounded. | 1. Given the retention window is 90 days (ASSUMED), When a row's `createdAt` exceeds the window, Then the row is deleted by TTL index or cleanup job. 2. Given retention policy changes, When updated, Then new TTL applies within the next cleanup cycle. |
| US-008 | P1 | As a Compliance Officer, I want PII fields in export data handled according to governance policy so that customer data is protected. | 1. Given a right-to-erasure request, When processed, Then PII fields (phone, email, name) in matching rows are scrubbed/anonymized. 2. Given export data is downloaded, When written to S3, Then file access is restricted by the existing presigned-URL mechanism. |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| **Collection Schema** | FR-001 [P0]: System MUST create collection `conversationexportdata` in `satuinbox_analytics` with fields defined in §10 (Field & Validation). FR-002 [P0]: System MUST create collection `ticketexportdata` in `satuinbox_analytics` with fields defined in §10. FR-003 [P0]: System MUST create collection `broadcastexportdata` in `satuinbox_analytics` with fields defined in §10. FR-004 [P0]: All three collections MUST have `companyId` and `organizationId` as mandatory dimensions on every document. FR-005 [P0]: Each collection MUST use the source entity's primary key (e.g. `conversationId`, `ticketId`, `broadcastId` + `recipientNumber` or `requestId`) as the natural dedup/upsert key. FR-006 [P0]: Collections MUST be append/upsert projections — they are NOT the source of truth. Domain services remain source of truth. FR-007 [P0]: System MUST NOT create read dependencies from analytics-service back to operational collections at query time. All data MUST be materialized in the analytics collections. |
| **Indexes** | FR-008 [P0]: `conversationexportdata` MUST have compound index on `{companyId, organizationId, createdAt, status}`. FR-009 [P0]: `ticketexportdata` MUST have compound index on `{companyId, organizationId, createdAt, status}`. FR-010 [P0]: `broadcastexportdata` MUST have compound index on `{companyId, organizationId, createdAt, status}`. FR-011 [P0]: Each collection MUST have a unique index on its natural key for idempotent upsert (see FR-005). FR-012 [P1]: System SHOULD add secondary indexes on `channel`, `assignedTo`/`assignee`, and `closedAt` per collection based on query pattern profiling. |
| **Sync Pipeline — Event-Driven** | FR-013 [P0]: analytics-service MUST consume domain events from RabbitMQ for conversation, ticket, and broadcast lifecycle events. FR-014 [P0]: System MUST project consumed events into the corresponding row-level collection via upsert. FR-015 [P0]: Sync pipeline MUST NOT make any gRPC calls to conversation-service, ticket-service, or broadcast-service during normal event processing. FR-016 [P0]: System MUST process events idempotently — re-processing the same event MUST NOT create duplicate rows. FR-017 [P0]: System MUST handle out-of-order events — a later event with older `updatedAt` MUST NOT overwrite a more recent projection (last-writer-wins by `sourceUpdatedAt` or event timestamp, not by processing order). FR-018 [P0]: System MUST log and dead-letter events that fail projection after 3 retry attempts. |
| **Sync Pipeline — Backfill** | FR-019 [P0]: System MUST provide a one-time backfill mechanism that reads from MongoDB secondary nodes (`readPreference=secondary`). FR-020 [P0]: Backfill MUST be throttled and chunked (configurable chunk size, default 500 docs/batch, configurable delay between batches). FR-021 [P0]: Backfill MUST NOT read from primary nodes. FR-022 [P1]: Backfill MUST expose a progress metric (percentage complete, estimated time remaining). FR-023 [P1]: After backfill completes, system MUST run a parity check comparing source row counts to projected row counts per tenant per date range. FR-024 [P1]: Backfill MUST be pausable and resumable. |
| **Tenant Scoping** | FR-025 [P0]: Every write to a row-level collection MUST include `companyId` and `organizationId`. FR-026 [P0]: Every read/query on a row-level collection MUST be scoped by `companyId` and `organizationId`. FR-027 [P0]: System MUST NOT allow queries without both `companyId` and `organizationId` — unscoped queries MUST be rejected at the query-builder level. FR-028 [P0]: If a consumed domain event lacks `companyId` or `organizationId`, the system MUST reject the event, log an error, and send to dead-letter queue. |
| **Retention / Lifecycle** | FR-029 [P1]: Row-level export data MUST be retained for a configurable period (default 90 days, ASSUMED — see OQ in Appendix). FR-030 [P1]: System MUST use MongoDB TTL index on `createdAt` or a scheduled cleanup job to enforce retention. FR-031 [P1]: TTL value MUST be configurable per environment without code change. FR-032 [P1]: Right-to-erasure requests MUST trigger scrubbing of PII fields (contactName, contactPhone, contactEmail, recipientNumber, recipientName) in affected rows. FR-033 [P1]: Scrubbed rows MUST retain non-PII fields for operational continuity. |
| **Consistency** | FR-034 [P0]: System MUST achieve eventual consistency — sync lag from domain event to analytics projection MUST be < 5 minutes at p95 (ASSUMED target — see OQ in Appendix). FR-035 [P1]: System MUST expose a `syncLagMs` metric per collection for monitoring. FR-036 [P1]: Export consumers (Sub-PRD B/D) MUST be able to identify whether a given date range is fully backfilled vs still syncing. |
| **Observability** | FR-037 [P0]: System MUST emit metrics: events consumed, events projected, events failed, sync lag per collection. FR-038 [P0]: System MUST emit backfill progress metrics: percentage complete, batch rate, estimated completion time. FR-039 [P0]: System MUST log every dead-letter event with full payload and failure reason. FR-040 [P0]: System MUST alarm when domain-service p95 latency deviates > 2% from baseline during sync or backfill (latency guard alarm). |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Event missing `companyId` or `organizationId` | Reject event, log error, send to dead-letter queue. Do NOT project. | No UI — system-level alert. |
| EH-002 | Event projection fails (e.g. schema mismatch, write error) | Retry up to 3 times with exponential backoff. After 3 failures, send to dead-letter queue. | No UI — alarm to engineering. |
| EH-003 | Backfill read error (secondary unavailable) | Pause backfill, retry after configurable delay. Alert if pause exceeds 30 minutes. | No UI — alarm to engineering. |
| EH-004 | Backfill write error (target collection write failure) | Log failed batch, retry batch up to 2 times. If still fails, skip batch and log for manual review. | No UI — metric + alarm. |
| EH-005 | Domain-service latency guard alarm triggers | Pause backfill automatically. Resume only after latency returns below threshold for 10 consecutive minutes. | No UI — alarm to engineering. |
| EH-006 | Duplicate event (same entity, same version) | Idempotent upsert — existing row unchanged. Log at DEBUG level. | No UI. |
| EH-007 | Out-of-order event | Compare `sourceUpdatedAt` timestamps. Only update if incoming event is newer. Log at WARN if stale event detected. | No UI. |
| EH-008 | Dead-letter queue accumulation exceeds threshold (e.g. 1000 messages) | Alarm to engineering. | No UI. |
| EH-009 | TTL index not created or misconfigured | Startup validation MUST fail fast if TTL index is missing for collections with retention enabled. | No UI — deployment fails. |
| EH-010 | Right-to-erasure target not found in analytics collections | Log warning. Do NOT block the erasure pipeline — analytics is not source of truth. | No UI. |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Domain event arrives before backfill has processed that entity | Event-based projection creates the row. Backfill later encounters the row and skips (upsert is idempotent). | No UI. |
| EC-002 | Backfill runs concurrently with live event processing for same entity | Upsert by natural key ensures one row. Last-writer-wins by `sourceUpdatedAt`. | No UI. |
| EC-003 | Conversation or ticket deleted from operational collections before event is consumed | Event may reference a deleted entity. System MUST still project the row if event payload contains sufficient data. If payload is insufficient, log and skip. | No UI. |
| EC-004 | Broadcast `INVALID_REQUEST` row has no `broadcastId` | Use `requestId` as part of the natural key. `broadcastId` stored as null. | No UI. |
| EC-005 | Very large conversation with 500+ metadata keys | Store all keys in the row-level collection (no 200-key cap at storage level — cap applies at export time per Sub-PRD B/D). | No UI. |
| EC-006 | Tenant has millions of export rows | Compound index `{companyId, organizationId, createdAt, status}` MUST support efficient range queries. Export consumers MUST paginate. | No UI. |
| EC-007 | Backfill runs during a MongoDB primary failover | Backfill reads from secondary. If secondary becomes primary during failover, backfill pauses and reconfigures read preference. | No UI. |
| EC-008 | Sync pipeline restarts mid-event-processing | Consumer offset management ensures events are re-processed from last committed offset. Idempotent upsert prevents duplicates. | No UI. |
| EC-009 | Domain service emits event with fields not yet mapped in projection | Unknown fields are preserved in a `rawEvent` catch-all field. System MUST NOT fail projection due to unmapped fields. | No UI. |
| EC-010 | Right-to-erasure request during active backfill for same customer | Erasure scrub runs on already-projected rows. Backfill may re-create rows from pre-erasure source data — backfill MUST check erasure flag and skip/scrub affected entities. | No UI. |

## **9. UI & UX Requirements**

> N/A — This PRD is system/infrastructure. No user-facing UI changes. All artifacts (collections, pipeline, metrics) are backend-only.

## **10. Field & Validation**

### **10.1 `conversationexportdata`**

| Field | Type | Example | Validation | Required | Default | Source |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `_id` | ObjectId | — | Auto-generated | Auto | — | MongoDB |
| `companyId` | string | `comp_abc123` | Non-empty | Yes | — | Event payload |
| `organizationId` | string | `org_xyz789` | Non-empty | Yes | — | Event payload |
| `conversationId` | string | `CNV-88921` | Unique per tenant | Yes | — | Domain event |
| `contactId` | string | `CNT-456` | — | Conditional | null | Domain event |
| `contactName` | string | `Budi Santoso` | — | No | null | Domain event |
| `contactPhone` | string | `+62812xxxx` | — | No | null | Domain event (PII) |
| `contactEmail` | string | `user@mail.com` | — | No | null | Domain event (PII) |
| `status` | string | `OPEN` | Valid enum | Yes | — | Domain event |
| `channel` | string | `whatsapp` | Valid platform | Yes | — | Domain event |
| `platformId` | string | `wa_biz_01` | — | No | null | Domain event |
| `assignedTo` | string[] | `["USR-001", "USR-002"]` | — | No | [] | Domain event |
| `participants` | string[] | `["USR-001"]` | — | No | [] | Domain event |
| `createdAt` | Date | `2026-03-01T09:10:00Z` | Valid datetime | Yes | — | Domain event |
| `updatedAt` | Date | `2026-03-01T10:20:00Z` | Valid datetime | Yes | — | Domain event |
| `closedAt` | Date | `2026-03-01T18:20:00Z` | ≥ createdAt | No | null | Domain event |
| `closedBy` | string | `USR-001` | — | No | null | Domain event |
| `tags` | string[] | `["lead", "pricing"]` | — | No | [] | Domain event |
| `topic` | string | `Product Inquiry` | — | No | null | Domain event |
| `subTopic` | string | `Pricing` | — | No | null | Domain event |
| `inboxId` | string | `TIN-123` | — | No | null | Domain event |
| `inboxName` | string | `Support - Jakarta` | — | No | null | Domain event |
| `teamId` | string | `TEAM-01` | — | No | null | Domain event |
| `firstReplyTimeMs` | number | `4350000` | ≥ 0 | No | null | Domain event |
| `firstResponseTimeMs` | number | `2710000` | ≥ 0 | No | null | Domain event |
| `timeToCloseMs` | number | `29940000` | ≥ 0 | No | null | Domain event |
| `avgResponseTimeMs` | number | `1800000` | ≥ 0 | No | null | Derived from event |
| `slaFrtStatus` | string | `MET` | MET/BREACHED/N/A | No | null | Domain event |
| `slaArtStatus` | string | `MET` | MET/BREACHED/N/A | No | null | Domain event |
| `slaTtcStatus` | string | `N/A` | MET/BREACHED/N/A | No | null | Domain event |
| `lastMessageBy` | string | `CUSTOMER` | AGENT/CUSTOMER/SYSTEM | No | null | Domain event |
| `lastMessageAt` | Date | `2026-03-01T10:20:00Z` | — | No | null | Domain event |
| `lastMessageText` | string | `How much is Pro plan` | — | No | null | Domain event |
| `customAttributes` | object | `{segment: "VIP"}` | — | No | {} | Domain event |
| `metadata` | object | `{external_thread_id: "ig_123"}` | — | No | {} | Domain event |
| `folder` | string | `inbox` | inbox/junk/spam/archive | No | `inbox` | Domain event |
| `sourceUpdatedAt` | Date | `2026-03-01T10:20:00Z` | — | Yes | — | Domain event (for out-of-order handling) |
| `rawEvent` | object | `{...}` | — | No | {} | Catches unmapped fields |
| `syncedAt` | Date | `2026-08-12T03:00:00Z` | — | Auto | now() | Sync pipeline |

**Natural upsert key:** `{companyId, organizationId, conversationId}`
**TTL index:** on `createdAt` field (configured per environment)

### **10.2 `ticketexportdata`**

| Field | Type | Example | Validation | Required | Default | Source |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `_id` | ObjectId | — | Auto-generated | Auto | — | MongoDB |
| `companyId` | string | `comp_abc123` | Non-empty | Yes | — | Event payload |
| `organizationId` | string | `org_xyz789` | Non-empty | Yes | — | Event payload |
| `ticketId` | string | `TKT-6749104949` | Unique per tenant | Yes | — | Domain event |
| `ticketNumber` | string | `TK-6749104949` | — | Yes | — | Domain event |
| `title` | string | `Life Problem` | — | No | null | Domain event |
| `awb` | string | `AWB123456` | — | No | null | Domain event / custom field |
| `status` | string | `UNASSIGNED` | Valid enum | Yes | — | Domain event |
| `currentStage` | string | `On Progress` | Unattended/Open/On Progress/Done | No | null | Domain event |
| `stageDurationUnattendedMs` | number | `3600000` | ≥ 0 | No | null | Derived |
| `stageDurationOpenMs` | number | `7200000` | ≥ 0 | No | null | Derived |
| `stageDurationOnProgressMs` | number | `14400000` | ≥ 0 | No | null | Derived |
| `stageDurationDoneMs` | number | `0` | ≥ 0 | No | null | Derived |
| `assignee` | string[] | `["USR-001"]` | — | No | [] | Domain event |
| `createdBy` | string | `USR-002` | — | No | null | Domain event |
| `createdAt` | Date | `2026-02-01T10:01:00Z` | Valid datetime | Yes | — | Domain event |
| `updatedAt` | Date | `2026-02-01T18:21:10Z` | Valid datetime | Yes | — | Domain event |
| `closedAt` | Date | `2026-02-01T18:20:00Z` | ≥ createdAt | No | null | Domain event |
| `closedBy` | string | `USR-001` | — | No | null | Domain event |
| `channel` | string | `whatsapp` | — | Yes | — | Domain event |
| `platformId` | string | `wa_biz_01` | — | No | null | Domain event |
| `tribe` | string | `Support` | — | No | null | Domain event |
| `typeComplaint` | string | `Return` | — | No | null | Domain event / ticket type |
| `ticketTypeName` | string | `Return` | — | No | null | Domain event |
| `csat` | number | `4` | 1-5 | No | null | Domain event |
| `handlingTimeMs` | number | `28800000` | ≥ 0 | No | null | Derived |
| `diffTimeFirstAssignAndFirstResponseMs` | number | `900000` | ≥ 0 | No | null | Derived |
| `firstReplyTimeMs` | number | `4350000` | ≥ 0 | No | null | Domain event |
| `firstResponseTimeMs` | number | `2710000` | ≥ 0 | No | null | Domain event |
| `timeToCloseMs` | number | `29940000` | ≥ 0 | No | null | Domain event |
| `reopenedCount` | number | `0` | ≥ 0 | No | 0 | Domain event |
| `replyCount` | number | `3` | ≥ 0 | No | 0 | Domain event |
| `lastReplyBy` | string | `AGENT` | AGENT/CUSTOMER/SYSTEM | No | null | Domain event |
| `lastReplyAt` | Date | `2026-02-01T18:10:00Z` | — | No | null | Domain event |
| `lastReplyMessage` | string | `Please provide AWB` | — | No | null | Domain event |
| `priority` | string | `HIGH` | — | No | null | Domain event |
| `level` | string | `VIP` | — | No | null | Domain event |
| `tags` | string[] | `["shipping", "refund"]` | — | No | [] | Domain event |
| `inboxId` | string | `TIN-123` | — | No | null | Domain event |
| `inboxName` | string | `Support - Jakarta` | — | No | null | Domain event |
| `teamId` | string | `TEAM-01` | — | No | null | Domain event |
| `description` | string | `Customer said hello` | — | No | null | Domain event |
| `slaFrtStatus` | string | `MET` | MET/BREACHED/N/A | No | null | Domain event |
| `slaResolveStatus` | string | `BREACHED` | MET/BREACHED/N/A | No | null | Domain event |
| `customFields` | object | `{awb_number: "AWB123"}` | — | No | {} | Domain event |
| `remarks` | object[] | `[{text: "...", by: "USR-001", at: "..."}]` | — | No | [] | Domain event |
| `sourceUpdatedAt` | Date | `2026-02-01T18:21:10Z` | — | Yes | — | Domain event |
| `rawEvent` | object | `{...}` | — | No | {} | Catches unmapped fields |
| `syncedAt` | Date | `2026-08-12T03:00:00Z` | — | Auto | now() | Sync pipeline |

**Natural upsert key:** `{companyId, organizationId, ticketId}`
**TTL index:** on `createdAt` field

### **10.3 `broadcastexportdata`**

| Field | Type | Example | Validation | Required | Default | Source |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `_id` | ObjectId | — | Auto-generated | Auto | — | MongoDB |
| `companyId` | string | `comp_abc123` | Non-empty | Yes | — | Event payload |
| `organizationId` | string | `org_xyz789` | Non-empty | Yes | — | Event payload |
| `broadcastId` | string | `BRD-12345` | — | Conditional | null | Domain event |
| `broadcastName` | string | `Promo May` | — | No | null | Domain event |
| `broadcastChannel` | string | `Open API` | API/WhatsApp Web/Open API | Yes | — | Domain event |
| `source` | string | `Open API` | Dashboard/Open API | No | null | Domain event |
| `recipientNumber` | string | `+628****3210` | — | Conditional | null | Domain event (PII) |
| `recipientName` | string | `Budi` | — | No | null | Domain event (PII) |
| `status` | string | `SUCCESS` | SUCCESS/IN_PROGRESS/SCHEDULED/FAILED/CANCELED/INVALID_NUMBER/INVALID_REQUEST | Yes | — | Domain event |
| `reason` | string | `recipientNumber is required.` | — | No | null | Domain event |
| `failureSource` | string | `OPEN_API` | OPEN_API/PROVIDER/SYSTEM/USER/empty | No | null | Domain event |
| `createdAt` | Date | `2026-05-04T10:00:00Z` | Valid datetime | Yes | — | Domain event |
| `scheduledAt` | Date | `2026-05-04T15:00:00Z` | — | No | null | Domain event |
| `creatorUserId` | string | `USR-123` | — | No | null | Domain event |
| `creatorName` | string | `Admin A` | — | No | null | Domain event |
| `teamInboxIdAtSendTime` | string | `TIN-123` | — | No | null | Domain event |
| `teamInboxNameAtSendTime` | string | `Support` | — | No | null | Domain event |
| `senderAccountName` | string | `WA Official Main` | — | No | null | Domain event |
| `senderNumber` | string | `+628****7890` | — | No | null | Domain event |
| `templateUsed` | string | `order_update` | — | No | null | Domain event |
| `messageContent` | string | `Your order is ready` | — | No | null | Domain event |
| `requestId` | string | `REQ-123` | — | No | null | Domain event |
| `idempotencyKey` | string | `idem-abc` | — | No | null | Domain event |
| `attemptNumber` | number | `2` | ≥ 1 | No | null | Domain event |
| `requestPayloadJson` | string | `{"recipientNumber":""}` | Sanitized | No | null | Domain event |
| `attributesJson` | string | `{"orderId":"123"}` | — | No | null | Domain event |
| `sourceUpdatedAt` | Date | `2026-05-04T10:00:05Z` | — | Yes | — | Domain event |
| `rawEvent` | object | `{...}` | — | No | {} | Catches unmapped fields |
| `syncedAt` | Date | `2026-08-12T03:00:00Z` | — | Auto | now() | Sync pipeline |

**Natural upsert key:** `{companyId, organizationId, broadcastId, recipientNumber}` or `{companyId, organizationId, requestId}` for INVALID_REQUEST without broadcastId.
**TTL index:** on `createdAt` field

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance — Zero-Impact** | NFR-001 [CRITICAL]: Domain service (conversation-service, ticket-service, broadcast-service) p95 latency MUST NOT increase by more than **2%** from pre-sync baseline, measured over a 1-hour rolling window, during normal sync operation. NFR-002 [CRITICAL]: Domain service p99 latency MUST NOT increase by more than **2%** from pre-sync baseline under the same conditions. NFR-003 [CRITICAL]: During backfill, the same 2% latency guard applies. Backfill MUST auto-pause if threshold is breached. |
| **Performance — Sync** | NFR-004: Event-to-projection lag MUST be < 5 minutes at p95 under normal load (ASSUMED). NFR-005: Sync pipeline MUST handle burst of 10,000 events/minute without event loss (events may be delayed but MUST NOT be dropped). |
| **Performance — Backfill** | NFR-006: Backfill MUST process at least 50,000 documents/hour per collection at default throttle settings. NFR-007: Backfill MUST NOT create > 50 concurrent MongoDB connections. |
| **Reliability** | NFR-008: All upserts MUST be idempotent — same event processed N times produces same row state. NFR-009: Dead-letter queue MUST preserve failed events for at least 7 days for manual replay. NFR-010: Sync pipeline MUST recover from crash within 30 seconds and resume from last committed consumer offset. |
| **Security** | NFR-011: All queries MUST be scoped by `companyId` + `organizationId`. Unscoped queries MUST be rejected. NFR-012: PII fields (phone, email, name) in export collections MUST follow the same governance as existing PII in operational collections. |
| **Observability** | NFR-013: Metrics MUST include: `events_consumed_total`, `events_projected_total`, `events_failed_total`, `sync_lag_ms` (per collection), `backfill_progress_percent`, `backfill_batch_rate`, `domain_service_latency_deviation_percent`. NFR-014: Alarm MUST fire within 5 minutes when domain-service latency deviation exceeds 2%. |
| **Scalability** | NFR-015: Row-level collections MUST support at least 10M documents per collection per tenant without query degradation (compound index on main query pattern). |
| **Privacy** | NFR-016: Right-to-erasure requests MUST be reconciled against export collections within 24 hours. NFR-017: Export files in S3 MUST follow existing presigned-URL mechanism with 15-minute expiry. |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Domain services (conversation/ticket/broadcast) MUST emit domain events for all lifecycle actions | Engineering (domain teams) | If events are missing, row-level collections will have gaps. | Audit event coverage before backfill. Backfill covers historical; events cover ongoing. |
| RabbitMQ infrastructure availability | Engineering (infra) | If RabbitMQ is down, sync pipeline stalls. | Dead-letter queue for failed events. Retry mechanism. Backfill as recovery mechanism. |
| MongoDB secondary node availability for backfill | Engineering (infra) | Backfill cannot run without secondary reads. | Detect secondary unavailability, pause backfill, alert. |
| Domain-service latency measurement baseline | Engineering | Cannot enforce 2% guard without baseline. | Establish baseline p95/p99 metrics before enabling sync. |
| PII governance policy for analytics store | PM / Legal | If policy disallows PII in analytics, collection schema must be redesigned (masked fields). | Flag as Open Question — OQ-16. |
| Retention window decision | PM | If retention is too short, historical exports fail. If too long, storage grows. | Flag as Open Question. Default 90 days ASSUMED. |
| Volume data per tenant | Engineering | If a tenant has millions of conversations, compound index performance must be validated. | Load test before GA. Consider sharding strategy if needed. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Domain service latency deviation during sync | < 2% p95 deviation | Ongoing, 1-hour rolling window | Domain service APM metrics |
| Sync lag (event → projection) | < 5 minutes at p95 | Ongoing | `sync_lag_ms` metric |
| Backfill completion rate | 100% of targeted date range | Within backfill window | Backfill progress metric |
| Backfill parity (row count match) | ± 0.1% of source count | Post-backfill | Parity check job |
| Dead-letter event rate | < 0.01% of consumed events | Ongoing | Dead-letter queue size metric |
| Cross-tenant data leak incidents | 0 | Ongoing | Audit logs, query-scoping enforcement |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| MongoDB Change Streams as alternative sync mechanism | More granular than event-based, captures field-level changes. Re-evaluate if event gaps are discovered. |
| Real-time streaming to downstream data warehouse | If analytics consumers need sub-second freshness beyond export use case. |
| Per-collection query analytics | Track which fields are most queried/exported to optimize indexes. |
| Column-level encryption for PII fields | If compliance requirements tighten beyond current PII governance. |
| Archive tier for old export data | Move expired rows to cold storage (S3 Glacier) instead of hard delete for audit recovery. |

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Eventual consistency — export data is not real-time | Export consumers see data up to 5 minutes behind operational data. For most export use cases, this is acceptable. |
| Backfill is a one-time operation | Future data gaps (e.g. missed events) require manual intervention or re-backfill for that window. |
| Retention window limits historical export range | If retention is 90 days, exports cannot cover data older than 90 days from this collection. PM must decide on retention vs historical need. |
| Derived fields (stage durations, handling time) depend on domain event payload completeness | If events lack timestamps needed for derivation, derived fields will be null. |
| No built-in column registry in this PRD | Column registry is Sub-PRD B. Until B is complete, export consumers must know field names directly. |

## **16. Appendix**

### **A. Glossary**

| Term | Definition |
| ----- | ----- |
| Row-level collection | A MongoDB collection where each document represents one entity (conversation, ticket, broadcast recipient), as opposed to pre-aggregated daily counts. |
| Projection | The process of transforming a domain event into a row-level analytics document. Not to be confused with MongoDB projection (field selection). |
| Backfill | One-time batch process to populate row-level collections from historical operational data, reading from MongoDB secondary nodes. |
| Source of truth | The canonical data store — domain service operational collections. Analytics row-level collections are derived projections. |
| Natural key | The combination of fields that uniquely identifies a row for upsert purposes (e.g. `companyId + organizationId + conversationId`). |
| Dead-letter queue | A RabbitMQ queue where events that fail processing after retries are sent for manual inspection and replay. |
| Zero-impact constraint | OQ-11 hard constraint: analytics sync/backfill MUST NOT increase domain service latency by more than 2%. |
| Sync lag | Time elapsed between a domain event being emitted and the corresponding row being available in the analytics collection. |
| TTL | Time-To-Live — MongoDB feature that automatically deletes documents after a specified duration from a date field. |

### **B. Source References**

| Reference | Path | Relevance |
| ----- | ----- | ----- |
| Change Intake Brief v3.0 | `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` | Routing, OQ decisions, gap analysis §5A, architecture §10 |
| Sibling PRD: Offline Report Download | `PRD/Analytics/PRD Analytics - offline report download.md` | Existing export UX, RBAC, retention, §17 broadcast addendum columns |
| Cross-Domain SAP Brief (consumed) | `Assessments/cross-domain/sap-report-export/` | SAP column specs (35+27+6+9) for Sub-PRD D field coverage |
| Global Memory | `Memory/global-memory.md` | Canonical product rules, protected behavior |
| BE Architecture Reference | `Memory/CLAUDE-be.md` | analytics-service ownership, service topology, RabbitMQ conventions |
| PRD Writing Rule | `Rules/prd-writing-rule.md` | Template structure, mandatory sections |

### **C. Assumptions**

| ID | Assumption | Impact If Wrong | Validation Needed |
| ----- | ----- | ----- | ----- |
| ASM-001 | Domain services already emit lifecycle events to RabbitMQ for conversation, ticket, and broadcast entities. | If events are missing, sync pipeline will have gaps. May need to add event emission in domain services first. | Engineering audit of existing RabbitMQ event catalog. |
| ASM-002 | MongoDB replica set with at least one secondary node is available for read-preference=secondary backfill. | If no secondary exists, backfill must use an alternative zero-impact read mechanism. | Infrastructure verification. |
| ASM-003 | Sync lag target of < 5 minutes at p95 is acceptable for export use cases. | If tighter SLA needed (e.g. < 1 min), architecture may need to change to Change Streams. | PM / stakeholder confirmation. |
| ASM-004 | Retention window of 90 days (default) is sufficient for export needs. | If historical exports need > 90 days, retention must be extended or a separate archive mechanism is needed. | PM decision. |
| ASM-005 | PII in analytics row-level collections is governed by the same policy as PII in operational collections. | If stricter policy applies to analytics, PII fields may need masking/encryption at write time. | Legal / compliance review. |
| ASM-006 | `sourceUpdatedAt` is available in all domain events for out-of-order handling. | If not available, must fall back to event timestamp (less accurate for out-of-order detection). | Domain service event audit. |

### **D. Open Questions**

| ID | Question | Status | Owner | Blocking? |
| ----- | ----- | ----- | ----- | ----- |
| OQ-13 | Sync mechanism: event-driven (RabbitMQ) + MongoDB Change Streams + secondary-read backfill? | **ASSUMED: event-driven via RabbitMQ for incremental sync + MongoDB secondary-read backfill for historical.** Confirm with Eng Lead. | Engineering Lead | Yes — implementation approach |
| OQ-14 | Backfill approach: one-time batch from MongoDB secondary + ongoing event-based incremental? | **ASSUMED: one-time secondary batch for historical data + incremental event-driven sync for ongoing.** Confirm with Eng Lead. | Engineering Lead | Yes — backfill strategy |
| OQ-15 | Retention window for row-level export data? Default 90 days assumed. Does this conflict with need for historical exports spanning > 90 days? | **ASSUMED: 90 days.** Needs PM decision on retention vs historical export range. | PM | Yes — schema design |
| OQ-16 | PII (phone, email, customer name) in analytics row-level collections — is this allowed under current data governance? Does right-to-erasure require scrubbing analytics rows? | **ASSUMED: PII allowed, erasure reconciliation required.** Needs governance decision. | PM / Legal | No — can proceed with assumption |
| OQ-17 | What domain events are currently emitted by conversation-service, ticket-service, and broadcast-service? Is event coverage complete for all lifecycle transitions? | **Open.** Engineering must audit RabbitMQ event catalog before sync pipeline implementation. | Engineering | Yes — determines projection completeness |
| OQ-18 | `sourceUpdatedAt` field — is it present in all domain events? If not, what is the fallback for out-of-order detection? | **Open.** Must verify against actual event payloads. | Engineering | No — has fallback (event timestamp) |

### **E. Event Contract Detail**

> This section documents the assumed RabbitMQ event consumption contract for the sync pipeline. Exact queue names, exchange names, and payload schemas must be confirmed against the actual domain-service event catalog (OQ-17).

#### **E.1 Consumed Events**

| Event Name (ASSUMED) | Producer Service | Routing Key (ASSUMED) | Target Collection | Projection Action |
| ----- | ----- | ----- | ----- | ----- |
| `conversation.created` | conversation-service | `conversation.created` | `conversationexportdata` | Insert/upsert |
| `conversation.updated` | conversation-service | `conversation.updated` | `conversationexportdata` | Upsert |
| `conversation.closed` | conversation-service | `conversation.closed` | `conversationexportdata` | Upsert (set closedAt, closedBy) |
| `conversation.assigned` | conversation-service | `conversation.assigned` | `conversationexportdata` | Upsert (set assignedTo) |
| `conversation.message.received` | conversation-service | `conversation.message.received` | `conversationexportdata` | Upsert (update lastMessage*, response times) |
| `ticket.created` | ticket-service | `ticket.created` | `ticketexportdata` | Insert/upsert |
| `ticket.updated` | ticket-service | `ticket.updated` | `ticketexportdata` | Upsert |
| `ticket.statusChanged` | ticket-service | `ticket.statusChanged` | `ticketexportdata` | Upsert (update status, stage, stage durations) |
| `ticket.closed` | ticket-service | `ticket.closed` | `ticketexportdata` | Upsert (set closedAt, closedBy, timeToClose) |
| `ticket.assigned` | ticket-service | `ticket.assigned` | `ticketexportdata` | Upsert (set assignee) |
| `ticket.message.received` | ticket-service | `ticket.message.received` | `ticketexportdata` | Upsert (update lastMessage*, response times) |
| `broadcast.scheduled` | broadcast-service | `broadcast.scheduled` | `broadcastexportdata` | Insert/upsert |
| `broadcast.sent` | broadcast-service | `broadcast.sent` | `broadcastexportdata` | Upsert (update status) |
| `broadcast.delivered` | broadcast-service | `broadcast.delivered` | `broadcastexportdata` | Upsert (update status) |
| `broadcast.failed` | broadcast-service | `broadcast.failed` | `broadcastexportdata` | Upsert (update status, reason, failureSource) |
| `broadcast.canceled` | broadcast-service | `broadcast.canceled` | `broadcastexportdata` | Upsert (update status) |
| `broadcast.invalidNumber` | broadcast-service | `broadcast.invalidNumber` | `broadcastexportdata` | Upsert (update status, reason) |
| `broadcast.invalidRequest` | broadcast-service | `broadcast.invalidRequest` | `broadcastexportdata` | Insert/upsert (INVALID_REQUEST rows) |

#### **E.2 Projection Logic Summary**

| Domain | Source Event Fields → Target Collection Fields | Derived Computation |
| ----- | ----- | ----- |
| Conversation | Map event payload fields to `conversationexportdata` fields. SLA fields computed from domain-service SLA engine output. | `avgResponseTimeMs` = computed if multiple interactions exist; otherwise null. |
| Ticket | Map event payload fields to `ticketexportdata` fields. Stage durations from status-change timestamp diffs. | `handlingTimeMs` = closedAt - firstAssignAt. `diffTimeFirstAssignAndFirstResponseMs` from timestamps in events. |
| Broadcast | Map event payload fields to `broadcastexportdata` fields. One row per recipient. | No derived computation — all fields sourced directly from event. |

#### **E.3 Idempotency & Ordering**

| Scenario | Behavior |
| ----- | ----- |
| Same event delivered twice (RabbitMQ redelivery) | Upsert by natural key. Idempotent — row state unchanged. |
| Events arrive out of order | Compare `sourceUpdatedAt` on incoming event vs existing row. Only update if incoming is newer. |
| Event for already-deleted entity (soft delete) | Project the row. Analytics collections do not enforce operational deletion semantics. |
| Missing fields in event payload | Store null for missing fields. Do NOT fail projection. Store full event in `rawEvent`. |

### **F. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| **Collection Creation** | Create 3 new collections + indexes via migration script. No impact on existing collections. | Engineering | Collections exist with correct indexes in `satuinbox_analytics` DB. | Drop collections if needed (no impact on existing data). |
| **Feature Flag** | `ENABLE_ROW_LEVEL_SYNC` — boolean flag on analytics-service. When disabled, sync pipeline does not consume events. | Engineering | Flag toggles consumer on/off. | Disable flag → sync pipeline stops. No data loss (events remain in RabbitMQ within retention window). |
| **Phase 1: Shadow Mode** | Enable sync pipeline but do NOT point export consumers to new collections. Pipeline writes silently. | Engineering | Rows appear in new collections. No consumer reads them yet. | Disable feature flag. |
| **Phase 2: Parity Validation** | Run side-by-side comparison: old export (reads operational) vs new export (reads analytics row-level) for same date range/tenant. Compare row counts + sample field values. | Engineering + QA | Row count parity ±0.1%. Field value parity for sampled rows. | Stay in shadow mode until parity confirmed. |
| **Phase 3: Backfill** | Trigger one-time backfill from MongoDB secondary for target date range. Monitor latency guard. | Engineering | Backfill progress reaches 100%. Parity check passes. Domain service latency deviation < 2%. | Backfill is pausable. If issues detected, pause and investigate. |
| **Phase 4: Cutover** | Point export consumers (Sub-PRD B/D) to new analytics collections. Existing operational-based export decommissioned after validation period. | Engineering + PM | Export output parity confirmed by QA. User acceptance. | Revert export consumers to operational collections (Sub-PRD B/D rollback, not this PRD's rollback). |
| **Backfill Strategy** | One-time batch from MongoDB secondary (`readPreference=secondary`). Chunked: 500 docs/batch, configurable delay. Processed in reverse chronological order (newest first). | Engineering | Progress metric + parity check. | Pausable at any time. |
| **Data Rollback** | New collections can be dropped without affecting operational data. Analytics daily-metrics collections remain untouched. | Engineering | Confirm no existing collection is modified. | Drop `conversationexportdata`, `ticketexportdata`, `broadcastexportdata`. |

### **G. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `conversationexportdata` rows | analytics-service | Sync pipeline (event-driven) + backfill | 90 days from `createdAt` (ASSUMED — see OQ-15) | TTL index auto-deletes. No archive. | Exported via Sub-PRD B/D consumers. File retained 7 days in S3 per existing offline-report PRD. | Contains PII: `contactName`, `contactPhone`, `contactEmail`. Right-to-erasure reconciliation required. |
| `ticketexportdata` rows | analytics-service | Sync pipeline + backfill | 90 days from `createdAt` (ASSUMED) | TTL index auto-deletes. No archive. | Same as above. | Contains PII: contact info in custom fields. Erasure reconciliation required. |
| `broadcastexportdata` rows | analytics-service | Sync pipeline + backfill | 90 days from `createdAt` (ASSUMED) | TTL index auto-deletes. No archive. | Same as above. | Contains PII: `recipientNumber`, `recipientName`. Erasure reconciliation required. |
| Dead-letter queue messages | analytics-service | Failed event processing | 7 days | RabbitMQ TTL on DLQ exchange. | Not exported. | Contains raw event payload which may include PII. Access restricted to engineering. |

### **H. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| Duplicate RabbitMQ event delivery | Duplicate row in collection | Upsert by natural key — idempotent. Second delivery overwrites with same data (no-op). | Send same event twice, verify single row with expected data. |
| Out-of-order event delivery | Stale data overwrites newer data | Compare `sourceUpdatedAt`. Only update if incoming event timestamp > existing row timestamp. | Send events in reverse order, verify final row state matches latest event. |
| Concurrent backfill + live event processing for same entity | Race condition between backfill batch write and event-driven upsert | MongoDB upsert is atomic. Last-writer-wins by `sourceUpdatedAt`. Both paths write same natural key. | Run backfill while live events are flowing. Verify no duplicate rows and final state is correct. |
| Multiple backfill instances running simultaneously | Duplicate work, potential write contention | Only one backfill instance per collection allowed. Distributed lock via MongoDB advisory lock or leader election. | Attempt to start second backfill — must be rejected. |
| High-volume event burst (e.g. mass broadcast send) | Sync pipeline falls behind, consumer lag grows | Consumer auto-scales (within configured max concurrency). Events buffered in RabbitMQ. Alert if lag exceeds 10 minutes. | Simulate burst of 10K events. Verify all processed within SLA. |
| Right-to-erasure during active backfill | Backfill re-creates scrubbed rows from pre-erasure source | Backfill checks erasure flag/hash set before projecting. If entity is in erasure set, skip or project with scrubbed PII. | Trigger erasure during backfill. Verify erased entities are not re-projected with PII. |

### **I. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **Metric** | `analytics_sync_events_consumed_total` | Event consumed from RabbitMQ | `collection`, `event_type`, `companyId` | Engineering | — |
| **Metric** | `analytics_sync_events_projected_total` | Event successfully projected | `collection`, `event_type` | Engineering | — |
| **Metric** | `analytics_sync_events_failed_total` | Event projection failed (sent to DLQ) | `collection`, `event_type`, `error_type` | Engineering | Alert if > 0.01% of consumed |
| **Metric** | `analytics_sync_lag_ms` | Time from event emission to projection | `collection`, `companyId`, `p50/p95/p99` | Engineering | Alert if p95 > 5 min |
| **Metric** | `analytics_backfill_progress_percent` | Backfill progress | `collection`, `companyId` | Engineering | — |
| **Metric** | `analytics_backfill_batch_rate` | Documents processed per hour during backfill | `collection` | Engineering | Alert if < 50K/hr sustained |
| **Metric** | `analytics_domain_service_latency_deviation_percent` | Domain service p95 latency deviation from baseline | `service`, `metric` | Engineering | **CRITICAL: Alert if > 2%** |
| **Log** | `analytics_sync_dead_letter` | Event sent to dead-letter queue | `event_payload`, `error_message`, `retry_count`, `collection` | Engineering | Alert if DLQ size > 1000 |
| **Log** | `analytics_sync_projection_error` | Projection error (before retry) | `event_type`, `error`, `collection` | Engineering | — |
| **Log** | `analytics_backfill_batch_error` | Backfill batch failure | `collection`, `batch_range`, `error` | Engineering | Alert if > 3 consecutive failures |
| **Audit** | `analytics_row_level_collection_created` | New collection created via migration | `collection_name`, `indexes`, `actor` | Engineering | — |
| **Audit** | `analytics_backfill_started` | Backfill initiated | `collection`, `date_range`, `actor`, `estimated_docs` | Engineering | — |
| **Audit** | `analytics_backfill_completed` | Backfill finished | `collection`, `total_docs`, `duration`, `parity_check_result` | Engineering | — |
| **Audit** | `analytics_erasure_scrub_executed` | PII scrub for right-to-erasure | `collection`, `entity_count`, `actor` | Engineering | — |
