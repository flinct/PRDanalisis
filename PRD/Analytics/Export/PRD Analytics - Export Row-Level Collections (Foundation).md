# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics Row-Level Export Collections + Zero-Impact Sync Pipeline
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: N/A (system/infrastructure PRD — no UI)
**Version**: 2.0
**TRD**: — (until trd/trd-advance-export-phase-1-row-level-collections.md exists)

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD for Phase 1: row-level export collections + zero-impact sync pipeline. |
| v2.0 | 2026-08-19 | Dany Christian | Major revision: pivot from event-driven to pull-based sync (B-01); throttled primary-read backfill (B-02); manual load test as launch gate replacing APM (B-03); hash-based rowKey for broadcast + raw PII storage + erasure descoped (B-04); TTL on expireAt, retention 180 days (B-05); erasure moved to out-of-scope + PII classification table (B-06); ObjectId types for tenant/entity IDs (B-07); permission scope deferred to Phase 2 (B-08); added NFR-018..NFR-022 for export caps, timeouts, concurrency, storage (B-09); empty-range handling via coverage collection (B-10); terminology standardized to Phase-N; nits applied (EC-005, NFR-017, §16.B, revision history). |
| v2.1 | 2026-08-19 | Dany Christian | Phase-3 (PRD-C) prerequisite corrections: (a) `broadcastexportdata.status` now stores the real `BroadcastStatusEnum` 12-value vocabulary (`libs/common/src/lib/enums/index.ts:1228`) with a display-mapping note, replacing the invented `SUCCESS/IN_PROGRESS/...` set; (b) added `batchId` (campaign key = `BroadcastBatch._id`) distinct from `broadcastId` (recipient row PK = `Broadcast._id`), and campaign-clean `batchName` from `BroadcastBatch.name`, enabling PRD-C campaign-level `$group`; (c) `rowKey` corrected — `broadcastId` IS the recipient PK, so `{companyId, organizationId, broadcastId}` alone is the deterministic recipient key; (d) `broadcastChannel` fixed to `BroadcastPlatformEnum` (`whatsapp_web`/`whatsapp_api`), `source` to `BroadcastTypeEnum` (`manual`/`import`/`open-api`) — "Open API" is a source `type`, not a platform; (e) US-013/INVALID_REQUEST scope softened to a deferred future capability (no domain record exists today — rejected Open API requests are discarded before persistence). |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide row-level data collections in `satuinbox_analytics` for export use cases, decoupling export read-load from domain-service operational collections. |
| Scope | Three new MongoDB collections (`conversationexportdata`, `ticketexportdata`, `broadcastexportdata`) plus one coverage tracking collection (`exportdatacoverage`), pull-based sync pipeline extending existing RabbitMQ request/response pattern to row-grain, historical backfill, retention, and multi-tenant isolation. |
| Key Capabilities | (1) Per-entity row-level analytics data matching SAP/report column requirements. (2) Zero-impact pull-based sync extending existing aggregation-scheduler pattern to row-level projection. (3) Throttled primary-read backfill under latency guard. (4) Strict tenant scoping on every read/write. |
| Outcome | Export jobs (Phase 2/D) can read from analytics instead of operational collections, with zero performance impact on domain services. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| 3 new row-level collections in `satuinbox_analytics` | Column registry + configurable column picker UI → Phase 2 |
| `exportdatacoverage` collection for empty-range handling | Export job/download UX (reuse existing offline-report infra) → Phase 2/D |
| Schema definition, indexes, validation | SAP 4-sheet template mapping → Phase 4 |
| Pull-based sync pipeline extending existing RMQ request/response to row-grain projection. Event-driven push deferred to post-MVP. | Broadcast export UX → Phase 3 |
| Throttled primary-read backfill under latency guard | Format export baru selain XLSX |
| Data retention & TTL policy (180 days) | Ubah schema collection operasional |
| Multi-tenant scoping enforcement | Ubah dashboard/metrics analytics agregat |
| Observability: sync lag, backfill progress, latency guard | Right-to-erasure pipeline (no erasure pipeline exists in the product today) |
| Idempotent upsert, out-of-order event handling | Row-level permission scope (team/agent/contactScope) → Phase 2 FR-052 |
| Latency guard via manual pre/post load test | Formal APM instrumentation (prom-client, Grafana) → post-MVP |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | All 5 existing analytics collections store only pre-aggregated daily counts — no row-level records exist for export. | Export cannot read from analytics. Must read from operational collections, coupling export load to domain-service performance. |
| PS-002 | Export reads operational collections directly, adding read pressure to conversation-service, ticket-service, and broadcast-service primary nodes. | Risk of performance degradation on live customer-service operations during heavy export jobs. OQ-11 hard constraint violated. |
| PS-003 | No dedicated broadcast export collection exists. Broadcast daily metrics only has 7 aggregate count fields. | Cannot support recipient-level or campaign-level broadcast exports from analytics. |
| PS-004 | Historical export data has no analytics-side store. If operational data changes or is archived, export parity is lost. | Export reproducibility and audit trail depends on mutable operational data. **Resolution:** Analytics is a 180-day audit store, not a 90-day cache. Retention (180 days) exceeds backfill range (90 days) by 2x. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Decouple export read-load from domain services | All export reads route to analytics row-level collections; zero direct operational-collection reads from export path after cutover. |
| Zero performance impact on domain services | Domain service (conversation/ticket/broadcast-service) p95 and p99 latency MUST NOT increase by more than 2% during sync or backfill, measured over a 1-hour rolling window. Enforced via manual pre/post load test launch gate (NFR-001). |
| Provide complete row-level data for all export domains | 3 new collections cover: 27+ columns for conversation, 35+ columns for ticket, 23+ columns for broadcast — sufficient for SAP report + configurable picker. |
| Maintain multi-tenant isolation | 100% of reads and writes scoped by `companyId` + `organizationId`. Zero cross-tenant data leaks. |
| Keep data fresh for export consumers | Sync lag from domain event to analytics collection < 5 minutes at p95. |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Data Engineer, I want row-level conversation data in analytics collections so that export jobs can read from analytics instead of operational databases. | 1. Given a conversation exists in conversation-service, When the pull-sync pipeline requests row-grain data, Then a row appears in `conversationexportdata` within 5 minutes. 2. Given a conversation update (status change, assignment, close), When the next pull cycle runs, Then the existing row is upserted with updated fields. 3. Given the row is queried, When scoped by `companyId` + `organizationId`, Then only rows belonging to that tenant are returned. |
| US-002 | P0 | As a Data Engineer, I want row-level ticket data in analytics collections so that export jobs can read ticket details from analytics. | 1. Given a ticket exists in ticket-service, When the pull-sync pipeline requests row-grain data, Then a row appears in `ticketexportdata`. 2. Given a ticket has custom fields, When synced, Then custom field values are stored as a map/array in the row. 3. Given a ticket status changes, When the next pull cycle runs, Then the row reflects the new status and stage durations are recalculated. |
| US-003 | P0 | As a Data Engineer, I want row-level broadcast recipient data in analytics collections so that broadcast exports can read from analytics. | 1. Given a broadcast is sent to a recipient, When the pull-sync pipeline requests row-grain data, Then a row appears in `broadcastexportdata` with `status` (raw `BroadcastStatusEnum`), `batchId` (campaign key), `broadcastId` (recipient PK), recipient info, and broadcast metadata. 2. Given a broadcast row already exists (duplicate pull), When re-processed, Then the row is upserted idempotently on `{companyId, organizationId, rowKey}`. 3. Given many recipients share one campaign, When synced, Then every recipient row carries the same `batchId` and `batchName` (from `BroadcastBatch.name`), enabling campaign-level aggregation in PRD-C. |
| US-004 | P0 | As an Engineering Lead, I want the sync pipeline to have zero measurable impact on domain-service performance so that customer-service operations are not degraded. | 1. Given the sync pipeline is running, When a pre/post load test is conducted, Then p95 latency deviation is < 2% compared to baseline. 2. Given backfill is running, When a pre/post load test is conducted, Then p95 latency deviation is < 2% compared to baseline. 3. Given domain service latency exceeds threshold, When the guard alarm fires, Then backfill is automatically paused and an alert is sent. |
| US-005 | P0 | As a Data Engineer, I want historical data backfilled into the new collections so that export jobs can cover the full date range from day one. | 1. Given backfill is triggered, When it reads from MongoDB primary with throttled batches (500/batch, configurable delay), Then it processes data without exceeding NFR-003 latency guard. 2. Given backfill is running, When progress is checked, Then a progress metric shows percentage complete and estimated time remaining. 3. Given backfill completes, When a parity check runs, Then row counts match source collection counts for the backfilled date range (±0.1% tolerance for concurrent writes during backfill). 4. Given a date range is not yet backfilled, When an export consumer queries it, Then the consumer receives a DATA_NOT_READY error. |
| US-006 | P0 | As a Platform Engineer, I want all reads and writes on the new collections to be scoped by `companyId` + `organizationId` so that no cross-tenant data leak can occur. | 1. Given a query without `companyId`, When executed, Then it MUST be rejected or return zero results. 2. Given a query with wrong `organizationId`, When executed, Then zero rows are returned even if the `companyId` matches. 3. Given an event without tenant dimensions, When consumed, Then the event is rejected and logged as an error. |
| US-007 | P1 | As a Data Engineer, I want row-level export data retained for a defined period and automatically purged so that storage stays bounded. | 1. Given the retention window is 180 days, When a row's `expireAt` timestamp is reached, Then the row is deleted by TTL index. 2. Given retention policy changes, When updated, Then new TTL applies within 24 hours of the config change. |
| US-008 | P1 | As a Compliance Officer, I want PII fields in export data classified so that customer data governance can be applied. | 1. Given a row-level collection exists, When reviewed, Then every field is classified as IDENTIFIER, FREE_TEXT_MAY_CONTAIN_PII, or NON_PII per §10.4. 2. Given export data is downloaded, When written to S3, Then file access is restricted by the existing presigned-URL mechanism (SEVEN_DAYS_MS retention per export-report-job.processor.ts:44). |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| **Collection Schema** | FR-001 [P0]: System MUST create collection `conversationexportdata` in `satuinbox_analytics` with fields defined in §10 (Field & Validation). FR-002 [P0]: System MUST create collection `ticketexportdata` in `satuinbox_analytics` with fields defined in §10. FR-003 [P0]: System MUST create collection `broadcastexportdata` in `satuinbox_analytics` with fields defined in §10. FR-004 [P0]: All three collections MUST have `companyId` and `organizationId` as mandatory dimensions on every document. FR-005 [P0]: Each collection MUST use the source entity's primary key as the natural dedup/upsert key. For `broadcastexportdata`, `rowKey` = `sha256(companyId\|organizationId\|broadcastId)` — `broadcastId` (= `Broadcast._id`) is the recipient row's unique PK, sufficient alone. Unique index on `{companyId, organizationId, rowKey}`. `recipientNumber` MUST NOT be part of any unique index. Campaign identity is carried by `batchId` (= `BroadcastBatch._id`), a separate non-unique field used by PRD-C for campaign-level `$group`. FR-006 [P0]: Collections MUST be append/upsert projections — they are NOT the source of truth. Domain services remain source of truth. FR-007 [P0]: System MUST NOT create read dependencies from analytics-service back to operational collections at query time. All data MUST be materialized in the analytics collections. |
| **Indexes** | FR-008 [P0]: `conversationexportdata` MUST have compound index on `{companyId, organizationId, createdAt, status}`. FR-009 [P0]: `ticketexportdata` MUST have compound index on `{companyId, organizationId, createdAt, status}`. FR-010 [P0]: `broadcastexportdata` MUST have compound index on `{companyId, organizationId, createdAt, status}`. FR-011 [P0]: Each collection MUST have a unique index on its natural key for idempotent upsert (see FR-005). FR-012 [P1]: System SHOULD add secondary indexes on `channel`, `assignedTo`/`assignee`, and `closedAt` per collection — final index list decided in TRD based on query pattern. |
| **Sync Pipeline — Pull-Based (Existing Pattern Extended)** | FR-013 [P0]: analytics-service MUST pull row-level data from domain services via RabbitMQ request/response using `ANALYTICS_AGGREGATE_*` patterns, extended to row-grain payloads. Domain services respond to RMQ aggregation requests (aggregation-scheduler.service.ts:208,434,549). Row-grain projection extends this pattern with per-entity payloads. FR-014 [P0]: System MUST project pulled data into the corresponding row-level collection via upsert. FR-015 [P0]: Pull sync MUST NOT make gRPC calls — only RabbitMQ request/response via existing MessagePattern handlers. FR-016 [P0]: System MUST process responses idempotently — re-processing the same response MUST NOT create duplicate rows. FR-017 [P0]: System MUST handle out-of-order responses — a later response with older `updatedAt` MUST NOT overwrite a more recent projection (last-writer-wins by `sourceUpdatedAt` or response timestamp, not by processing order). FR-018 [P0]: System MUST log and dead-letter responses that fail projection after 3 retry attempts. |
| **Sync Pipeline — Backfill** | FR-019 [P0]: Backfill MUST read from primary with throttled batches (500/batch, configurable delay). System MUST support `readPreference=secondaryPreferred` when `MONGODB_ANALYTICS_BACKFILL_URI` is provisioned (toggle: `ENABLE_SECONDARY_READ`). FR-020 [P0]: Backfill MUST be throttled and chunked (configurable chunk size, default 500 docs/batch, configurable delay between batches). FR-021 [P0]: Backfill MUST NOT exceed the latency guard (NFR-003). When `ENABLE_SECONDARY_READ=true`, backfill MUST use the secondary-read URI. FR-022 [P1]: Backfill MUST expose a progress metric (percentage complete, estimated time remaining). FR-023 [P1]: After backfill completes, system MUST run a parity check comparing source row counts to projected row counts per tenant per date range. FR-024 [P1]: Backfill MUST be pausable and resumable. |
| **Tenant Scoping** | FR-025 [P0]: Every write to a row-level collection MUST include `companyId` and `organizationId`. FR-026 [P0]: Every read/query on a row-level collection MUST be scoped by `companyId` and `organizationId`. Phase 1 scope: company + organization isolation only. Row-level permission scope (team/agent/contactScope per PermissionsGuard and TicketViewEnum) is owned by Phase 2 FR-052. Phase 1 guarantees scoping fields (`teamId`, `assignedTo`, `assignee`) are populated in every projected row. FR-027 [P0]: System MUST NOT allow queries without both `companyId` and `organizationId` — unscoped queries MUST be rejected at the query-builder level. FR-028 [P0]: If a pulled response lacks `companyId` or `organizationId`, the system MUST reject the response, log an error, and send to dead-letter queue. |
| **Retention / Lifecycle** | FR-029 [P1]: Row-level export data MUST be retained for `EXPORT_ROW_RETENTION_DAYS` (default 180, configurable). Retention MUST be >= backfill target range (90 days). FR-030 [P1]: System MUST enforce retention via TTL index on a dedicated `expireAt` field set at projection time: `expireAt = max(createdAt, sourceUpdatedAt) + RETENTION_DAYS`. NOT on `createdAt` — active entities must not be purged mid-lifecycle. FR-031 [P1]: TTL value MUST be configurable per environment without code change. |
| **Consistency** | FR-034 [P0]: System MUST achieve eventual consistency — sync lag from domain event to analytics projection MUST be < 5 minutes at p95 (ASSUMED target — see OQ in Appendix). FR-035 [P1]: System MUST expose a `syncLagMs` metric per collection for monitoring. FR-036 [P0]: System MUST maintain an `exportdatacoverage` document per `{companyId, organizationId, collection, date}` recording state ∈ {NOT_BACKFILLED, BACKFILLING, COMPLETE}, `rowCount`, `lastSyncedAt`. Export consumers MUST read coverage before querying rows and MUST fail with `DATA_NOT_READY` when any requested date is not COMPLETE. |
| **Observability** | FR-037 [P0]: System MUST emit metrics: items consumed, items projected, items failed, sync lag per collection. FR-038 [P0]: System MUST emit backfill progress metrics: percentage complete, batch rate, estimated completion time. FR-039 [P0]: System MUST log every dead-letter item with full payload and failure reason. FR-040 [P0]: System MUST alarm via log warning + RMQ notification when estimated sync load exceeds safe threshold. Formal APM instrumentation (prom-client, Grafana) is post-MVP. |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Response missing `companyId` or `organizationId` | Reject response, log error, send to dead-letter queue. Do NOT project. | No UI — system-level alert. |
| EH-002 | Projection fails (e.g. schema mismatch, write error) | Retry up to 3 times with exponential backoff. After 3 failures, send to dead-letter queue. | No UI — alarm to engineering. |
| EH-003 | Backfill read error (primary unavailable) | Pause backfill, retry after configurable delay. Alert if pause exceeds 30 minutes. | No UI — alarm to engineering. |
| EH-004 | Backfill write error (target collection write failure) | Log failed batch, retry batch up to 2 times. If still fails, skip batch and log for manual review. | No UI — metric + alarm. |
| EH-005 | Domain-service latency guard alarm triggers | Pause backfill automatically. Resume only after latency returns below threshold for 10 consecutive minutes. | No UI — alarm to engineering. |
| EH-006 | Duplicate response (same entity, same version) | Idempotent upsert — existing row unchanged. Log at DEBUG level. | No UI. |
| EH-007 | Out-of-order response | Compare `sourceUpdatedAt` timestamps. Only update if incoming response is newer. Log at WARN if stale response detected. | No UI. |
| EH-008 | Dead-letter queue accumulation exceeds threshold (e.g. 1000 messages) | Alarm to engineering. | No UI. |
| EH-009 | TTL index not created or misconfigured | Startup validation MUST fail fast if TTL index is missing for collections with retention enabled. | No UI — deployment fails. |
| EH-010 | Export query for uncovered date range | Read `exportdatacoverage` before querying. If state is NOT_BACKFILLED or BACKFILLING, fail with `DATA_NOT_READY`. If date precedes retention, fail with `DATA_EXPIRED`. | No UI — error propagated to export consumer. |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Pull-sync processes entity before backfill has reached that entity | Pull-sync projection creates the row. Backfill later encounters the row and skips (upsert is idempotent). | No UI. |
| EC-002 | Backfill runs concurrently with live pull-sync for same entity | Upsert by natural key ensures one row. Last-writer-wins by `sourceUpdatedAt`. | No UI. |
| EC-003 | Conversation or ticket deleted from operational collections before pull-sync processes it | Pull response may reference a deleted entity. System MUST still project the row if response payload contains sufficient data (minimum: `companyId`, `organizationId`, natural key, `sourceUpdatedAt`). If payload is insufficient, log and skip. | No UI. |
| EC-004 | Rejected Open API request (would-be `INVALID_REQUEST`) | DEFERRED — no domain record exists today; rejected requests are discarded before persistence. No row is written until a future `broadcast.invalidRequest` event is added (PRD-C US-013). | No UI. |
| EC-005 | Very large conversation with 500+ metadata keys | Store all keys in the row-level collection (no cap at storage level — export-time cap is 50 dynamic columns (conversation-export.constant.ts:4)). | No UI. |
| EC-006 | Tenant has millions of export rows | Compound index `{companyId, organizationId, createdAt, status}` MUST support p95 < 2s for a 30-day, 20,000-row range at 10M docs/tenant. Export consumers MUST paginate at 2,000 rows (NFR-018). | No UI. |
| EC-007 | Backfill runs during a MongoDB primary failover | Backfill reads from primary (throttled). If `ENABLE_SECONDARY_READ=true`, backfill reads from secondary. If secondary becomes primary during failover, backfill pauses and reconfigures. | No UI. |
| EC-008 | Pull-sync pipeline restarts mid-processing | Consumer offset management ensures responses are re-processed from last committed offset. Idempotent upsert prevents duplicates. | No UI. |
| EC-009 | Domain service returns data with fields not yet mapped in projection | Unknown fields are preserved in a `rawEvent` catch-all field. System MUST NOT fail projection due to unmapped fields. | No UI. |
| EC-010 | Right-to-erasure request | **OUT OF SCOPE** — no erasure pipeline exists in the product today. `piiScrubbedAt` field added in §10 for future readiness. | No UI. |
| EC-011 | Query returns zero rows for a date range | If coverage=COMPLETE for every date in range → legitimate empty result, export succeeds with header-only XLSX. If any date is NOT_BACKFILLED/BACKFILLING → fail with `DATA_NOT_READY` + uncovered range in message. If any date precedes retention window → fail with `DATA_EXPIRED`. | No UI. |

## **9. UI & UX Requirements**

> N/A — This PRD is system/infrastructure. No user-facing UI changes. All artifacts (collections, pipeline, metrics) are backend-only.
>
> **Operator surface note:** Backfill start/pause/resume is triggered via existing RMQ-based backfill controller (backfill.controller.ts:57, @EventPattern('analytics.backfill')). Phase 1 extends that endpoint for the new row-level collections. Authorization: admin role only (to be confirmed in TRD).

## **10. Field & Validation**

> **Type convention:** Tenant and entity identifiers are ObjectId to match existing analytics collections (responsiveness-metrics.schema.ts:41, broadcast-daily-metrics.schema.ts:47) and the shared ITenantEntity contract. Display-formatted IDs (TKT-..., CNV-...) are presentation-layer only.

### **10.1 `conversationexportdata`**

| Field | Type | Example | Validation | Required | Default | Source |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `_id` | ObjectId | — | Auto-generated | Auto | — | MongoDB |
| `companyId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e1` | Non-empty | Yes | — | Pull response |
| `organizationId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e2` | Non-empty | Yes | — | Pull response |
| `conversationId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e3` | Unique per tenant | Yes | — | Domain data |
| `contactId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e4` | — | Conditional | null | Domain data |
| `contactName` | string | `Budi Santoso` | — | No | null | Domain data |
| `contactPhone` | string | `+62812xxxx` | — | No | null | Domain data (PII — IDENTIFIER) |
| `contactEmail` | string | `user@mail.com` | — | No | null | Domain data (PII — IDENTIFIER) |
| `status` | string | `OPEN` | Valid enum | Yes | — | Domain data |
| `channel` | string | `whatsapp` | Valid platform | Yes | — | Domain data |
| `platformId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e5` | — | No | null | Domain data |
| `assignedTo` | ObjectId[] | `[64a1b2c3d4e5f6a7b8c9d0e6, ...]` | — | Yes | [] | Domain data |
| `participants` | ObjectId[] | `[64a1b2c3d4e5f6a7b8c9d0e7]` | — | No | [] | Domain data |
| `createdAt` | Date | `2026-03-01T09:10:00Z` | Valid datetime | Yes | — | Domain data |
| `updatedAt` | Date | `2026-03-01T10:20:00Z` | Valid datetime | Yes | — | Domain data |
| `closedAt` | Date | `2026-03-01T18:20:00Z` | ≥ createdAt | No | null | Domain data |
| `closedBy` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e8` | — | No | null | Domain data |
| `tags` | string[] | `["lead", "pricing"]` | — | No | [] | Domain data |
| `topic` | string | `Product Inquiry` | — | No | null | Domain data |
| `subTopic` | string | `Pricing` | — | No | null | Domain data |
| `inboxId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e9` | — | No | null | Domain data |
| `inboxName` | string | `Support - Jakarta` | — | No | null | Domain data |
| `teamId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0ea` | — | Yes | [] | Domain data |
| `firstReplyTimeMs` | number | `4350000` | ≥ 0 | No | null | Domain data |
| `firstResponseTimeMs` | number | `2710000` | ≥ 0 | No | null | Domain data |
| `timeToCloseMs` | number | `29940000` | ≥ 0 | No | null | Domain data |
| `avgResponseTimeMs` | number | `1800000` | ≥ 0 | No | null | Derived from data |
| `slaFrtStatus` | string | `MET` | MET/BREACHED/N/A | No | null | Domain data |
| `slaArtStatus` | string | `MET` | MET/BREACHED/N/A | No | null | Domain data |
| `slaTtcStatus` | string | `N/A` | MET/BREACHED/N/A | No | null | Domain data |
| `lastMessageBy` | string | `CUSTOMER` | AGENT/CUSTOMER/SYSTEM | No | null | Domain data |
| `lastMessageAt` | Date | `2026-03-01T10:20:00Z` | — | No | null | Domain data |
| `lastMessageText` | string | `How much is Pro plan` | — | No | null | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `customAttributes` | object | `{segment: "VIP"}` | — | No | {} | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `metadata` | object | `{external_thread_id: "ig_123"}` | — | No | {} | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `folder` | string | `inbox` | inbox/junk/spam/archive | No | `inbox` | Domain data |
| `sourceUpdatedAt` | Date | `2026-03-01T10:20:00Z` | — | Yes | — | Domain data (for out-of-order handling) |
| `rawEvent` | object | `{...}` | — | No | {} | Catches unmapped fields |
| `syncedAt` | Date | `2026-08-12T03:00:00Z` | — | Auto | now() | Sync pipeline |
| `expireAt` | Date | `2027-02-27T10:20:00Z` | max(createdAt, sourceUpdatedAt) + RETENTION_DAYS | Auto | computed | Sync pipeline (TTL index) |
| `piiScrubbedAt` | Date | — | — | No | null | Future readiness |

**Natural upsert key:** `{companyId, organizationId, conversationId}`
**TTL index:** on `expireAt` field (configured per environment)

### **10.2 `ticketexportdata`**

| Field | Type | Example | Validation | Required | Default | Source |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `_id` | ObjectId | — | Auto-generated | Auto | — | MongoDB |
| `companyId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e1` | Non-empty | Yes | — | Pull response |
| `organizationId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e2` | Non-empty | Yes | — | Pull response |
| `ticketId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0f1` | Unique per tenant | Yes | — | Domain data |
| `ticketNumber` | string | `TK-6749104949` | — | Yes | — | Domain data (display code, string) |
| `title` | string | `Life Problem` | — | No | null | Domain data |
| `awb` | string | `AWB123456` | — | No | null | Domain data / custom field |
| `status` | string | `UNASSIGNED` | Valid enum | Yes | — | Domain data |
| `currentStage` | string | `On Progress` | Unattended/Open/On Progress/Done | No | null | Domain data |
| `stageDurationUnattendedMs` | number | `3600000` | ≥ 0 | No | null | Derived |
| `stageDurationOpenMs` | number | `7200000` | ≥ 0 | No | null | Derived |
| `stageDurationOnProgressMs` | number | `14400000` | ≥ 0 | No | null | Derived |
| `stageDurationDoneMs` | number | `0` | ≥ 0 | No | null | Derived |
| `assignee` | ObjectId[] | `[64a1b2c3d4e5f6a7b8c9d0f2]` | — | Yes | [] | Domain data |
| `createdBy` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0f3` | — | No | null | Domain data |
| `createdAt` | Date | `2026-02-01T10:01:00Z` | Valid datetime | Yes | — | Domain data |
| `updatedAt` | Date | `2026-02-01T18:21:10Z` | Valid datetime | Yes | — | Domain data |
| `closedAt` | Date | `2026-02-01T18:20:00Z` | ≥ createdAt | No | null | Domain data |
| `closedBy` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0f4` | — | No | null | Domain data |
| `channel` | string | `whatsapp` | — | Yes | — | Domain data |
| `platformId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0f5` | — | No | null | Domain data |
| `tribe` | string | `Support` | — | No | null | Domain data |
| `typeComplaint` | string | `Return` | — | No | null | Domain data / ticket type |
| `ticketTypeName` | string | `Return` | — | No | null | Domain data |
| `csat` | number | `4` | 1-5 | No | null | Domain data |
| `handlingTimeMs` | number | `28800000` | ≥ 0 | No | null | Derived |
| `diffTimeFirstAssignAndFirstResponseMs` | number | `900000` | ≥ 0 | No | null | Derived |
| `firstReplyTimeMs` | number | `4350000` | ≥ 0 | No | null | Domain data |
| `firstResponseTimeMs` | number | `2710000` | ≥ 0 | No | null | Domain data |
| `timeToCloseMs` | number | `29940000` | ≥ 0 | No | null | Domain data |
| `reopenedCount` | number | `0` | ≥ 0 | No | 0 | Domain data |
| `replyCount` | number | `3` | ≥ 0 | No | 0 | Domain data |
| `lastReplyBy` | string | `AGENT` | AGENT/CUSTOMER/SYSTEM | No | null | Domain data |
| `lastReplyAt` | Date | `2026-02-01T18:10:00Z` | — | No | null | Domain data |
| `lastReplyMessage` | string | `Please provide AWB` | — | No | null | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `priority` | string | `HIGH` | — | No | null | Domain data |
| `level` | string | `VIP` | — | No | null | Domain data |
| `tags` | string[] | `["shipping", "refund"]` | — | No | [] | Domain data |
| `inboxId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0f6` | — | No | null | Domain data |
| `inboxName` | string | `Support - Jakarta` | — | No | null | Domain data |
| `teamId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0f7` | — | Yes | [] | Domain data |
| `description` | string | `Customer said hello` | — | No | null | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `slaFrtStatus` | string | `MET` | MET/BREACHED/N/A | No | null | Domain data |
| `slaResolveStatus` | string | `BREACHED` | MET/BREACHED/N/A | No | null | Domain data |
| `customFields` | object | `{awb_number: "AWB123"}` | — | No | {} | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `remarks` | object[] | `[{text: "...", by: "USR-001", at: "..."}]` | — | No | [] | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `sourceUpdatedAt` | Date | `2026-02-01T18:21:10Z` | — | Yes | — | Domain data |
| `rawEvent` | object | `{...}` | — | No | {} | Catches unmapped fields |
| `syncedAt` | Date | `2026-08-12T03:00:00Z` | — | Auto | now() | Sync pipeline |
| `expireAt` | Date | `2027-07-30T18:21:10Z` | max(createdAt, sourceUpdatedAt) + RETENTION_DAYS | Auto | computed | Sync pipeline (TTL index) |
| `piiScrubbedAt` | Date | — | — | No | null | Future readiness |

**Natural upsert key:** `{companyId, organizationId, ticketId}`
**TTL index:** on `expireAt` field

### **10.3 `broadcastexportdata`**

| Field | Type | Example | Validation | Required | Default | Source |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `_id` | ObjectId | — | Auto-generated | Auto | — | MongoDB |
| `companyId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e1` | Non-empty | Yes | — | Pull response |
| `organizationId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e2` | Non-empty | Yes | — | Pull response |
| `rowKey` | string | `sha256(comp\|org\|brd\|+628...)` | Deterministic hash | Yes | — | Computed at projection time |
| `batchId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d100` | — | Yes | — | Domain data (campaign key = `BroadcastBatch._id`) |
| `batchName` | string | `Promo May` | — | No | null | Domain data (campaign name = `BroadcastBatch.name`, clean; NOT the per-recipient `Broadcast.name` which is suffixed with the recipient number) |
| `broadcastId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d101` | — | Yes | — | Domain data (recipient row PK = `Broadcast._id`) |
| `broadcastName` | string | `Promo May - (+628...)` | — | No | null | Domain data (per-recipient `Broadcast.name`, suffixed — for recipient-level rows only) |
| `broadcastChannel` | string | `whatsapp_api` | `whatsapp_web`/`whatsapp_api` (`BroadcastPlatformEnum`) | Yes | — | Domain data (= `Broadcast.platform`) |
| `source` | string | `open-api` | `manual`/`import`/`open-api` (`BroadcastTypeEnum`) | No | null | Domain data (= `Broadcast.type`; "Open API" lives here, NOT in `broadcastChannel`) |
| `recipientNumber` | string | `+628****3210` | — | Conditional | null | Domain data (PII — IDENTIFIER, stored raw) |
| `recipientName` | string | `Budi` | — | No | null | Domain data (PII — IDENTIFIER) |
| `status` | string | `delivered` | `raw`/`text_processing`/`text_processed`/`schedule`/`pending`/`processing`/`sent`/`delivered`/`failed`/`retry`/`invalid`/`canceled` (`BroadcastStatusEnum`, 12 values) | Yes | — | Domain data |
| `reason` | string | `recipientNumber is required.` | — | No | null | Domain data |
| `failureSource` | string | `OPEN_API` | OPEN_API/PROVIDER/SYSTEM/USER/empty | No | null | Domain data |
| `createdAt` | Date | `2026-05-04T10:00:00Z` | Valid datetime | Yes | — | Domain data |
| `scheduledAt` | Date | `2026-05-04T15:00:00Z` | — | No | null | Domain data |
| `creatorUserId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d102` | — | No | null | Domain data |
| `creatorName` | string | `Admin A` | — | No | null | Domain data |
| `teamInboxIdAtSendTime` | ObjectId | `64a1b2c3d4e5f6a7b8c9d103` | — | No | null | Domain data |
| `teamInboxNameAtSendTime` | string | `Support` | — | No | null | Domain data |
| `senderAccountName` | string | `WA Official Main` | — | No | null | Domain data |
| `senderNumber` | string | `+628****7890` | — | No | null | Domain data |
| `templateUsed` | string | `order_update` | — | No | null | Domain data |
| `messageContent` | string | `Your order is ready` | — | No | null | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `requestId` | string | `REQ-123` | — | No | null | Domain data |
| `idempotencyKey` | string | `idem-abc` | — | No | null | Domain data |
| `attemptNumber` | number | `2` | ≥ 1 | No | null | Domain data |
| `requestPayloadJson` | string | `{"recipientNumber":""}` | Sanitized | No | null | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `attributesJson` | string | `{"orderId":"123"}` | — | No | null | Domain data (FREE_TEXT_MAY_CONTAIN_PII) |
| `sourceUpdatedAt` | Date | `2026-05-04T10:00:05Z` | — | Yes | — | Domain data |
| `rawEvent` | object | `{...}` | — | No | {} | Catches unmapped fields |
| `syncedAt` | Date | `2026-08-12T03:00:00Z` | — | Auto | now() | Sync pipeline |
| `expireAt` | Date | `2026-10-31T10:00:05Z` | max(createdAt, sourceUpdatedAt) + RETENTION_DAYS | Auto | computed | Sync pipeline (TTL index) |
| `piiScrubbedAt` | Date | — | — | No | null | Future readiness |

**Natural upsert key:** `{companyId, organizationId, rowKey}` where `rowKey = sha256(companyId|organizationId|broadcastId)`. Note: `broadcastId` (= `Broadcast._id`) is already the recipient row's unique PK, so it alone is the deterministic per-recipient key — `recipientNumber` is NOT part of the key (multiple rows can share a number across campaigns; the PK disambiguates). Campaign-level aggregation (PRD-C) groups by `batchId`, not `rowKey`.
**TTL index:** on `expireAt` field
**Note (status vocabulary):** `status` stores the raw backend `BroadcastStatusEnum` (12 lowercase values). The FE presents a smaller display grouping; the display↔backend mapping is a PRD-C / FE concern, not stored here.
**Note (INVALID_REQUEST — deferred):** `reason`, `failureSource`, `requestId`, `idempotencyKey`, `requestPayloadJson`, `attemptNumber` support a future "export rejected Open API requests" capability (PRD-C US-013). No such domain record exists today — rejected Open API requests are discarded by DTO validation before persistence (`broadcast.service.ts` rolls the batch back on failure). These fields stay in the schema as target-state readiness but are NOT populated until a `broadcast.invalidRequest` event is added in a follow-up phase. For all current rows they are null.
**Note:** `recipientNumber` is stored raw (unmasked). Masking is an export-time presentation concern (Phase 3/D).

### **10.4 PII Classification**

> Right-to-erasure is OUT OF SCOPE — no erasure pipeline exists in the product today. `piiScrubbedAt` field added for future readiness. This table documents PII classification for when erasure enters scope.

| Field | Classification | Scrub Action (future) | Collections |
| ----- | ----- | ----- | ----- |
| `contactPhone` | IDENTIFIER | Mask/redact | conversation |
| `contactEmail` | IDENTIFIER | Mask/redact | conversation |
| `contactName` | IDENTIFIER | Redact | conversation |
| `recipientNumber` | IDENTIFIER | Mask/redact | broadcast |
| `recipientName` | IDENTIFIER | Redact | broadcast |
| `senderNumber` | IDENTIFIER | Mask/redact | broadcast |
| `lastMessageText` | FREE_TEXT_MAY_CONTAIN_PII | Redact | conversation |
| `customAttributes` | FREE_TEXT_MAY_CONTAIN_PII | Audit + redact PII keys | conversation |
| `metadata` | FREE_TEXT_MAY_CONTAIN_PII | Audit + redact PII keys | conversation |
| `lastReplyMessage` | FREE_TEXT_MAY_CONTAIN_PII | Redact | ticket |
| `description` | FREE_TEXT_MAY_CONTAIN_PII | Redact | ticket |
| `remarks` | FREE_TEXT_MAY_CONTAIN_PII | Redact text fields | ticket |
| `customFields` | FREE_TEXT_MAY_CONTAIN_PII | Audit + redact PII keys | ticket |
| `messageContent` | FREE_TEXT_MAY_CONTAIN_PII | Redact | broadcast |
| `requestPayloadJson` | FREE_TEXT_MAY_CONTAIN_PII | Audit + redact PII keys | broadcast |
| `attributesJson` | FREE_TEXT_MAY_CONTAIN_PII | Audit + redact PII keys | broadcast |
| All other fields | NON_PII | No action | all |

### **10.5 `exportdatacoverage`**

| Field | Type | Example | Validation | Required | Default | Source |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `_id` | ObjectId | — | Auto-generated | Auto | — | MongoDB |
| `companyId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e1` | Non-empty | Yes | — | Scope |
| `organizationId` | ObjectId | `64a1b2c3d4e5f6a7b8c9d0e2` | Non-empty | Yes | — | Scope |
| `collection` | string | `conversationexportdata` | Valid collection name | Yes | — | Backfill/sync |
| `date` | Date | `2026-03-01T00:00:00Z` | Day boundary | Yes | — | Backfill/sync |
| `state` | string | `COMPLETE` | NOT_BACKFILLED/BACKFILLING/COMPLETE | Yes | NOT_BACKFILLED | Backfill/sync |
| `rowCount` | number | `1542` | ≥ 0 | Yes | 0 | Backfill/sync |
| `lastSyncedAt` | Date | `2026-08-12T03:00:00Z` | — | Yes | — | Backfill/sync |

**Unique index:** `{companyId, organizationId, collection, date}`

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance — Zero-Impact** | NFR-001 [CRITICAL]: Before `ENABLE_ROW_LEVEL_SYNC=true`, engineering MUST run a load test measuring domain service p95/p99 latency (pre-sync baseline vs post-sync running 1 hour). If deviation > 2%, sync MUST remain disabled. Latency guard is a LAUNCH GATE enforced by manual pre/post load test. NFR-002 [CRITICAL]: Domain service p99 latency MUST NOT increase by more than **2%** from pre-sync baseline. Enforced per NFR-001 launch gate. NFR-003 [CRITICAL]: During backfill, the same 2% latency guard applies per NFR-001. Backfill MUST auto-pause if threshold is breached. |
| **Performance — Sync** | NFR-004: Sync lag MUST be < 5 minutes at p95 under normal load (ASSUMED). NFR-005: Sync pipeline MUST handle burst of 10,000 items/minute without data loss (items may be delayed but MUST NOT be dropped). |
| **Performance — Backfill** | NFR-006: Backfill MUST process at least 50,000 documents/hour per collection at default throttle settings. NFR-007: Backfill MUST NOT create > 50 concurrent MongoDB connections. |
| **Reliability** | NFR-008: All upserts MUST be idempotent — same response processed N times produces same row state. NFR-009: Dead-letter queue MUST preserve failed items for at least 7 days for manual replay. NFR-010: Sync pipeline MUST recover from crash within 30 seconds and resume from last committed consumer offset. |
| **Security** | NFR-011: All queries MUST be scoped by `companyId` + `organizationId`. Unscoped queries MUST be rejected. NFR-012: PII fields (phone, email, name) in export collections MUST follow the same governance as existing PII in operational collections. |
| **Observability** | NFR-013: Metrics MUST include: `items_consumed_total`, `items_projected_total`, `items_failed_total`, `sync_lag_ms` (per collection), `backfill_progress_percent`, `backfill_batch_rate`. NFR-014: Alarm MUST fire within 5 minutes when domain-service latency deviation exceeds 2% (via log warning + RMQ notification; formal APM post-MVP). |
| **Scalability** | NFR-015: Row-level collections MUST support at least 10M documents per collection per tenant with p95 < 2s for a 30-day, 20,000-row range query (compound index on main query pattern). |
| **Privacy** | NFR-017: Export files in S3 MUST follow existing retention of SEVEN_DAYS_MS (export-report-job.processor.ts:44). Presigned URL expiry is configured by media-service per-request (media-service :92-96) — not in this PRD's scope. |
| **Export Limits** | NFR-018: Export row cap = 20,000 rows/job, batch 2,000 (matching existing conversation-export.constant.ts:1, ticket.constant.ts:15, broadcast-export.constant.ts:2,5). Consumers MUST paginate at 2,000 rows. |
| **Timeouts** | NFR-019: Query timeout `maxTimeMS=30s`; event ack/nack within 30s; backfill batch must complete within 60s or be retried per EH-004. |
| **Concurrency** | NFR-020: Consumer concurrency bounded by `SYNC_MAX_CONCURRENCY=4` (default). RABBITMQ_PREFETCH set so worst-case in-flight payload stays under pod memory limit. A single tenant MUST NOT consume more than 50% of consumer capacity for longer than 5 minutes. |
| **Backfill Connections** | NFR-021: Backfill connections MUST fit within `MONGODB_ANALYTICS_MAX_POOL_SIZE` (currently 10, .env.example:54) or that pool MUST be raised explicitly before backfill runs. |
| **Storage** | NFR-022: Estimated bytes/row per collection × projected 12-month volume MUST be documented and MongoDB PVC sized accordingly before backfill (devops/k8s/23.mongodb.yaml). `rawEvent` retention MUST be capped or made opt-out per collection since it duplicates the entire payload. |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Domain services (conversation/ticket/broadcast) MUST respond to RMQ row-grain aggregation requests via existing MessagePattern handlers | Engineering (domain teams) | If domain services don't support row-grain payloads, sync pipeline will have gaps. | Extend existing ANALYTICS_AGGREGATE_* patterns. Backfill covers historical; pull-sync covers ongoing. |
| RabbitMQ infrastructure availability | Engineering (infra) | If RabbitMQ is down, sync pipeline stalls. | Dead-letter queue for failed items. Retry mechanism. Backfill as recovery mechanism. |
| MongoDB primary read capacity for backfill | Engineering (infra) | Backfill reads from primary with throttled batches. Must not exceed latency guard. | Throttled batches (500/batch, configurable delay). Latency guard (NFR-001/003) as launch gate. Optional secondary-read URI when provisioned. |
| Domain-service latency measurement baseline | Engineering | Cannot enforce 2% guard without baseline. | **Latency guard is a LAUNCH GATE (NFR-001).** Manual pre/post load test before enabling sync. If deviation > 2%, sync remains disabled. |
| PII governance policy for analytics store | PM / Legal | If policy disallows PII in analytics, collection schema must be redesigned (masked fields). | Flag as Open Question — OQ-16. |
| Retention window decision | PM | Retention is 180 days (default). Must be >= backfill target range (90 days). | Retention exceeds backfill by 2x. Configurable per environment. |
| Volume data per tenant | Engineering | If a tenant has millions of conversations, compound index performance must be validated. | Load test before GA. Storage estimate required per NFR-022. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Domain service latency deviation during sync | < 2% p95 deviation | Pre/post load test, 1-hour window | Manual load test results |
| Sync lag (pull → projection) | < 5 minutes at p95 | Ongoing | `sync_lag_ms` metric |
| Backfill completion rate | 100% of targeted date range | Within backfill window | Backfill progress metric |
| Backfill parity (row count match) | ± 0.1% of source count | Post-backfill | Parity check job |
| Dead-letter rate | < 0.01% of consumed items | Ongoing | Dead-letter queue size metric |
| Cross-tenant data leak incidents | 0 | Ongoing | Quarterly query-guard test suite |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Event-driven push sync (post-MVP) | Move from pull-based to event-driven push when domain services emit lifecycle events. More granular than pull-based, captures field-level changes. |
| MongoDB Change Streams as alternative sync mechanism | More granular than event-based, captures field-level changes. Re-evaluate if pull gaps are discovered. |
| Real-time streaming to downstream data warehouse | If analytics consumers need sub-second freshness beyond export use case. |
| Per-collection query analytics | Track which fields are most queried/exported to optimize indexes. |
| Column-level encryption for PII fields | If compliance requirements tighten beyond current PII governance. |
| Archive tier for old export data | Move expired rows to cold storage (S3 Glacier) instead of hard delete for audit recovery. |
| Right-to-erasure pipeline | When erasure infrastructure is built, activate PII classification table (§10.4) and implement scrub actions. |
| Formal APM instrumentation | prom-client, Grafana dashboards for domain service latency. Replace manual load test gate with continuous monitoring. |

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Eventual consistency — export data is not real-time | Export consumers see data up to 5 minutes behind operational data. For most export use cases, this is acceptable. |
| Backfill is a one-time operation | Future data gaps (e.g. missed pull responses) require manual intervention or re-backfill for that window. |
| Retention window (180 days) limits historical export range | Exports cannot cover data older than 180 days from this collection. Backfill target range is 90 days, well within retention. |
| Derived fields (stage durations, handling time) depend on data payload completeness | If responses lack timestamps needed for derivation, derived fields will be null. |
| No built-in column registry in this PRD | Column registry is Phase 2. Until Phase 2 is complete, export consumers must know field names directly. |
| Pull-based sync depends on domain service response latency | If domain services are slow to respond to row-grain requests, sync lag may exceed 5-minute target. |
| Right-to-erasure not supported | No erasure pipeline exists in the product today. PII data will persist for the full retention period (180 days). |

## **16. Appendix**

### **A. Glossary**

| Term | Definition |
| ----- | ----- |
| Row-level collection | A MongoDB collection where each document represents one entity (conversation, ticket, broadcast recipient), as opposed to pre-aggregated daily counts. |
| Projection | The process of transforming pulled domain data into a row-level analytics document. Not to be confused with MongoDB projection (field selection). |
| Pull sync | The existing RabbitMQ request/response pattern (ANALYTICS_AGGREGATE_*) where analytics-service requests data from domain services, extended to row-grain payloads. |
| Backfill | One-time batch process to populate row-level collections from historical operational data, reading from MongoDB primary (throttled). |
| Source of truth | The canonical data store — domain service operational collections. Analytics row-level collections are derived projections. |
| Natural key | The combination of fields that uniquely identifies a row for upsert purposes (e.g. `companyId + organizationId + conversationId`). For broadcast: `{companyId, organizationId, rowKey}` where rowKey is a sha256 hash. |
| Dead-letter queue | A RabbitMQ queue where items that fail processing after retries are sent for manual inspection and replay. |
| Zero-impact constraint | OQ-11 hard constraint: analytics sync/backfill MUST NOT increase domain service latency by more than 2%. Enforced via manual pre/post load test launch gate (NFR-001). |
| Sync lag | Time elapsed between a domain data change and the corresponding row being available in the analytics collection. |
| TTL | Time-To-Live — MongoDB feature that automatically deletes documents after a specified duration from a date field. |
| Export coverage | The `exportdatacoverage` collection tracking backfill completeness per {tenant, collection, date} so export consumers can distinguish empty results from unbacked ranges. |

### **B. Source References**

| Reference | Path | Relevance |
| ----- | ----- | ----- |
| EXTERNAL: Change Intake Brief v3.0 | `EXTERNAL: Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` | Routing, OQ decisions, gap analysis §5A, architecture §10 |
| Sibling PRD: Offline Report Download | `PRD/Analytics/PRD Analytics - offline report download.md` | Existing export UX, RBAC, retention, §17 broadcast addendum columns |
| EXTERNAL: Cross-Domain SAP Brief (consumed) | `EXTERNAL: Assessments/cross-domain/sap-report-export/` | SAP column specs (35+27+6+9) for Phase 4 field coverage |
| EXTERNAL: Global Memory | `EXTERNAL: Memory/global-memory.md` | Canonical product rules, protected behavior |
| EXTERNAL: BE Architecture Reference | `EXTERNAL: Memory/Codex-be.md` | analytics-service ownership, service topology, RabbitMQ conventions |
| EXTERNAL: PRD Writing Rule | `EXTERNAL: Rules/prd-writing-rule.md` | Template structure, mandatory sections |
| aggregation-scheduler.service.ts | `apps/analytics-service/src/app/services/aggregation-scheduler.service.ts:208,434,549` | Existing pull-based aggregation pattern extended in this PRD |
| conversation-aggregation.controller.ts | `apps/conversation-service/src/app/controllers/conversation-aggregation.controller.ts:41` | Existing MessagePattern handler for ANALYTICS_AGGREGATE_CONVERSATION |
| ticket-aggregation.controller.ts | `apps/ticket-service/src/app/controllers/ticket-aggregation.controller.ts:71` | Existing MessagePattern handler |
| broadcast-aggregation.controller.ts | `apps/broadcast-service/src/app/controllers/broadcast-aggregation.controller.ts:34` | Existing MessagePattern handler |
| export-report-job.processor.ts | `apps/analytics-service/src/app/processors/export-report-job.processor.ts:44` | SEVEN_DAYS_MS retention for export files |
| conversation-export.constant.ts | `apps/conversation-service/src/app/constants/conversation-export.constant.ts:1,4` | EXPORT_LIMIT 20K, MAX_DYNAMIC_COLUMNS 50 |
| .env.example | `backend/.env.example:49-70` | directConnection=true, MONGODB_ANALYTICS_MAX_POOL_SIZE=10 |

### **C. Assumptions**

| ID | Assumption | Impact If Wrong | Validation Needed |
| ----- | ----- | ----- | ----- |
| ASM-001 | Domain services respond to RMQ aggregation requests (aggregation-scheduler.service.ts:208,434,549). Row-grain projection extends this pattern with per-entity payloads. | If domain services cannot support row-grain payloads, sync pipeline will have gaps. May need to add new MessagePattern handlers. | Engineering audit of existing aggregation handler payload capabilities. |
| ASM-002 | All MongoDB URIs use `directConnection=true` (.env.example:35-49). `readPreference=secondary` is not routable today. Backfill uses throttled primary read until a secondary-read URI is provisioned. | If primary read capacity is insufficient under throttle, backfill may need a provisioned secondary-read URI sooner. | Infrastructure verification of primary read headroom. |
| ASM-003 | Sync lag target of < 5 minutes at p95 is acceptable for export use cases. | If tighter SLA needed (e.g. < 1 min), architecture may need to change to Change Streams. | PM / stakeholder confirmation. |
| ASM-004 | Retention window of 180 days (default) is sufficient for export needs. Retention MUST be >= backfill target range (90 days). | If historical exports need > 180 days, retention must be extended or a separate archive mechanism is needed. | PM decision. |
| ASM-005 | PII in analytics row-level collections is governed by the same policy as PII in operational collections. Right-to-erasure is OUT OF SCOPE for Phase 1. | If stricter policy applies to analytics, PII fields may need masking/encryption at write time. | Legal / compliance review. |
| ASM-006 | `sourceUpdatedAt` is available in all domain data responses for out-of-order handling. | If not available, must fall back to response timestamp (less accurate for out-of-order detection). | Domain service data audit. |

### **D. Open Questions**

| ID | Question | Status | Owner | Blocking? |
| ----- | ----- | ----- | ----- | ----- |
| OQ-13 | Sync mechanism: pull-based via existing RMQ request/response pattern extended to row-grain, with backfill from MongoDB primary. | **RESOLVED: pull-based via existing ANALYTICS_AGGREGATE_* pattern.** Event-driven push deferred to post-MVP. | Engineering Lead | No — resolved |
| OQ-14 | Backfill approach: one-time batch from MongoDB primary (throttled) + pull-based incremental sync for ongoing? | **RESOLVED: throttled primary-read batch for historical + pull-based for ongoing.** Optional secondary-read when URI provisioned. | Engineering Lead | No — resolved |
| OQ-15 | Retention window for row-level export data? | **RESOLVED: 180 days default, configurable.** Retention exceeds backfill range (90 days) by 2x. Analytics is an audit store, not a 90-day cache. | PM | No — resolved |
| OQ-16 | PII (phone, email, customer name) in analytics row-level collections — is this allowed under current data governance? Does right-to-erasure require scrubbing analytics rows? | **RESOLVED for Phase 1: PII allowed, erasure OUT OF SCOPE.** PII classification table (§10.4) added for future readiness. piiScrubbedAt field added. | PM / Legal | No — resolved |
| OQ-17 | What domain data payloads are currently returned by conversation-service, ticket-service, and broadcast-service aggregation handlers? Is row-grain payload coverage complete for all §10 fields? | **Open.** Engineering must audit existing MessagePattern handler payloads before sync pipeline implementation. | Engineering | Yes — determines projection completeness |
| OQ-18 | `sourceUpdatedAt` field — is it present in all domain data responses? If not, what is the fallback for out-of-order detection? | **Open.** Must verify against actual response payloads. | Engineering | No — has fallback (response timestamp) |

### ~~**E. Event Contract Detail**~~

> **DELETED in v2.0.** Appendix E documented assumed RabbitMQ event consumption contracts that do not exist in the codebase. Phase 1 uses the existing pull-based aggregation pattern (ANALYTICS_AGGREGATE_* via MessagePattern) extended to row-grain. Event-driven push is deferred to post-MVP (see §14 Future Considerations).

### **F. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| **Collection Creation** | Create 3 new collections + `exportdatacoverage` + indexes via migration script. No impact on existing collections. | Engineering | Collections exist with correct indexes in `satuinbox_analytics` DB. | Drop collections if needed (no impact on existing data). |
| **Feature Flag** | `ENABLE_ROW_LEVEL_SYNC` — boolean flag on analytics-service. When disabled, pull-sync pipeline does not run. | Engineering | Flag toggles consumer on/off. | Disable flag → sync pipeline stops. |
| **Phase 1: Shadow Mode** | Enable pull-sync pipeline but do NOT point export consumers to new collections. Pipeline writes silently. | Engineering | Rows appear in new collections. No consumer reads them yet. | Disable feature flag. |
| **Phase 2: Parity Validation** | Run side-by-side comparison: old export (reads operational) vs new export (reads analytics row-level) for same date range/tenant. Compare row counts + sample field values. | Engineering + QA | Row count parity ±0.1%. Field value parity for sampled rows. | Stay in shadow mode until parity confirmed. |
| **Phase 3: Backfill** | Trigger one-time backfill from MongoDB primary for target date range: **90 days**. Monitor latency guard via pre/post load test. | Engineering | Backfill progress reaches 100%. Parity check passes. Domain service latency deviation < 2%. | Backfill is pausable. If issues detected, pause and investigate. |
| **Phase 4: Cutover** | Point export consumers (Phase 2/D) to new analytics collections. Existing operational-based export decommissioned after validation period. | Engineering + PM | Export output parity confirmed by QA. User acceptance. Coverage collection shows COMPLETE for all target dates. | Revert export consumers to operational collections (Phase 2/D rollback, not this PRD's rollback). |
| **Backfill Strategy** | One-time batch from MongoDB primary (throttled). Chunked: 500 docs/batch, configurable delay. Processed in reverse chronological order (newest first). Backfill target range: **90 days**. | Engineering | Progress metric + parity check. | Pausable at any time. |
| **Data Rollback** | New collections can be dropped without affecting operational data. Analytics daily-metrics collections remain untouched. | Engineering | Confirm no existing collection is modified. | Drop `conversationexportdata`, `ticketexportdata`, `broadcastexportdata`, `exportdatacoverage`. |

### **G. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `conversationexportdata` rows | analytics-service | Pull-sync pipeline + backfill | 180 days from `expireAt` (TTL index) | TTL index auto-deletes on `expireAt`. No archive. | Exported via Phase 2/D consumers. File retained 7 days in S3 per existing offline-report PRD (SEVEN_DAYS_MS). | Contains PII: `contactName`, `contactPhone`, `contactEmail`. Erasure OUT OF SCOPE — `piiScrubbedAt` field for future readiness. |
| `ticketexportdata` rows | analytics-service | Pull-sync pipeline + backfill | 180 days from `expireAt` (TTL index) | TTL index auto-deletes on `expireAt`. No archive. | Same as above. | Contains PII: contact info in custom fields. Erasure OUT OF SCOPE. |
| `broadcastexportdata` rows | analytics-service | Pull-sync pipeline + backfill | 180 days from `expireAt` (TTL index) | TTL index auto-deletes on `expireAt`. No archive. | Same as above. | Contains PII: `recipientNumber`, `recipientName`. Erasure OUT OF SCOPE. |
| `exportdatacoverage` | analytics-service | Backfill + sync pipeline | Same as parent collection (no independent TTL) | Dropped with parent collection if needed. | Not exported. | Non-PII metadata only. |
| Dead-letter queue messages | analytics-service | Failed processing | 7 days | RabbitMQ TTL on DLQ exchange. | Not exported. | Contains raw response payload which may include PII. Access restricted to engineering. |

### **H. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| Duplicate RabbitMQ response delivery | Duplicate row in collection | Upsert by natural key — idempotent. Second delivery overwrites with same data (no-op). | Send same response twice, verify single row with expected data. |
| Out-of-order response delivery | Stale data overwrites newer data | Compare `sourceUpdatedAt`. Only update if incoming timestamp > existing row timestamp. | Send responses in reverse order, verify final row state matches latest. |
| Concurrent backfill + live pull-sync for same entity | Race condition between backfill batch write and pull-sync upsert | MongoDB upsert is atomic. Last-writer-wins by `sourceUpdatedAt`. Both paths write same natural key. | Run backfill while live pull-sync is running. Verify no duplicate rows and final state is correct. |
| Multiple backfill instances running simultaneously | Duplicate work, potential write contention | Only one backfill instance per collection allowed. Distributed lock via MongoDB advisory lock or leader election. | Attempt to start second backfill — must be rejected. |
| High-volume burst (e.g. mass broadcast send) | Pull-sync falls behind, lag grows | Consumer bounded by SYNC_MAX_CONCURRENCY=4 (NFR-020). Single tenant must not consume > 50% capacity for > 5min. Alert if lag exceeds 10 minutes. | Simulate burst of 10K items. Verify all processed within SLA. |

### **I. Analytics & Observability Plan**

> **v2.0 note:** Formal APM instrumentation (prom-client, Grafana) is post-MVP. Observability uses log-based metrics + RMQ notifications. Latency guard is enforced via manual pre/post load test (NFR-001).

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **Log** | `analytics_sync_items_consumed` | Item consumed from RMQ pull response | `collection`, `companyId` | Engineering | — |
| **Log** | `analytics_sync_items_projected` | Item successfully projected | `collection` | Engineering | — |
| **Log** | `analytics_sync_items_failed` | Item projection failed (sent to DLQ) | `collection`, `error_type` | Engineering | Alert if > 0.01% of consumed |
| **Log** | `analytics_sync_lag_ms` | Time from data change to projection | `collection`, `companyId` | Engineering | Alert if p95 > 5 min |
| **Log** | `analytics_backfill_progress_percent` | Backfill progress | `collection`, `companyId` | Engineering | — |
| **Log** | `analytics_backfill_batch_rate` | Documents processed per hour during backfill | `collection` | Engineering | Alert if < 50K/hr sustained |
| **Log** | `analytics_domain_service_load_warning` | Estimated sync load exceeds safe threshold | `service`, `estimated_deviation` | Engineering | **ALERT: log warning + RMQ notification** |
| **Log** | `analytics_sync_dead_letter` | Item sent to dead-letter queue | `item_payload`, `error_message`, `retry_count`, `collection` | Engineering | Alert if DLQ size > 1000 |
| **Log** | `analytics_sync_projection_error` | Projection error (before retry) | `error`, `collection` | Engineering | — |
| **Log** | `analytics_backfill_batch_error` | Backfill batch failure | `collection`, `batch_range`, `error` | Engineering | Alert if > 3 consecutive failures |
| **Audit** | `analytics_row_level_collection_created` | New collection created via migration | `collection_name`, `indexes`, `actor` | Engineering | — |
| **Audit** | `analytics_backfill_started` | Backfill initiated | `collection`, `date_range`, `actor`, `estimated_docs` | Engineering | — |
| **Audit** | `analytics_backfill_completed` | Backfill finished | `collection`, `total_docs`, `duration`, `parity_check_result` | Engineering | — |
| **Load Test** | `analytics_latency_guard_result` | Manual pre/post load test executed | `service`, `baseline_p95`, `post_p95`, `deviation_pct`, `verdict` | Engineering | **LAUNCH GATE: deviation > 2% → sync MUST remain disabled** |

| Load Test Result Table | Baseline p95 | Post-Sync p95 | Deviation | Verdict |
| ----- | ----- | ----- | ----- | ----- |
| conversation-service | TBD | TBD | TBD | TBD |
| ticket-service | TBD | TBD | TBD | TBD |
| broadcast-service | TBD | TBD | TBD | TBD |

> Populated by engineering before `ENABLE_ROW_LEVEL_SYNC=true`. All three rows MUST show deviation ≤ 2% to pass the launch gate.
