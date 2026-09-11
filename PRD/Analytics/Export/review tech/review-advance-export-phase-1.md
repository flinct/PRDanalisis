VERDICT
NEEDS REVISION

The PRD is unusually complete on structure (all 16 house sections plus Event Contract, Migration & Rollout, Data Lifecycle, Concurrency, Observability appendices — better than most PRDs in prd/). It is not ready for a TRD because three of its load-bearing premises are unverified-and-currently-false in this repo (domain lifecycle events on RabbitMQ, secondary-read capability, an APM latency baseline), and because the retention/PII/natural-key requirements contradict each other in ways a tech lead cannot resolve without a product decision.

A TRD written on v1.0 as-is would either stall on B-01/B-02/B-03 or silently invent answers.

---

BLOCKING ISSUES
B-01 — §2/§5/§6/Appendix E: the entire event-driven premise is asserted, not verified. The named events do not exist.

Quote (ASM-001): "Domain services already emit lifecycle events to RabbitMQ for conversation, ticket, and broadcast entities."

Quote (FR-013): "analytics-service MUST consume domain events from RabbitMQ for conversation, ticket, and broadcast lifecycle events."

Appendix E.1 lists 18 events as "(ASSUMED)": conversation.created, conversation.updated, conversation.message.received, ticket.statusChanged, ticket.closed, ticket.assigned, broadcast.sent/delivered/failed/scheduled/canceled/invalidNumber/invalidRequest, etc.

Verified: none of those 18 routing keys exist. What exists is materially different:

EventTypeEnum (libs/common/src/lib/enums/index.ts:209) has conversation.assigned/unassigned/pulled/closed (:341-344) and ticket.created/updated (:398-399) — but these are emitted to the api-gateway websocket queue only, e.g. apps/conversation-service/src/app/services/conversation.service.ts:1099,1653,2243 all emit via socketAsync. They are UI fan-out, not a domain-event stream, and carry a socket payload, not the ~40-field projection §10 needs.
conversation.created exists only as a MongoDB audit-trail enum for the conversationevents collection (apps/conversation-service/src/app/schemas/conversation-event.schema.ts:13), never published to RabbitMQ.
There are no broadcast.sent/delivered/failed/scheduled/canceled/invalid* patterns anywhere (grep 'BROADCAST_' libs/common/src/lib/enums/index.ts returns nothing matching sent/deliver/fail/schedul/cancel/invalid). Broadcast status arrives as EventTypeEnum.BROADCAST_MESSAGE_STATUS_UPDATE emitted into broadcast-service from apps/conversation-service/src/app/processors/outbound-message.processor.ts:324.
Today analytics does not consume; it pulls. apps/analytics-service/src/app/services/aggregation-scheduler.service.ts:208,434,549 sends request/response RMQ (ANALYTICS_AGGREGATE_CONVERSATION, ANALYTICS_AGGREGATE_TICKET_BATCH, ANALYTICS_AGGREGATE_BROADCAST_BATCH) which the domain services answer from @MessagePattern handlers (apps/conversation-service/src/app/controllers/conversation-aggregation.controller.ts:41, apps/ticket-service/.../ticket-aggregation.controller.ts:71, apps/broadcast-service/.../broadcast-aggregation.controller.ts:34).
Why this blocks: adding lifecycle event emission to three domain services is a domain-service change, and the Scope table lists neither in-scope nor out-of-scope for it (out-of-scope only says "Ubah schema collection operasional" — emitting events is not a schema change, so it falls in a hole). It is also the single largest work item implied by this PRD, and it is assigned to nobody: §12 puts it on "Engineering (domain teams)" as a dependency, and OQ-17 says the audit happens "before sync pipeline implementation". So the PRD ships a pipeline whose input does not exist and whose creation it does not own.

Suggested rewrite — Scope table, add an explicit In-Scope row and make §6 conditional:

> In Scope: "Domain-event emission contract: new RabbitMQ lifecycle events published by conversation-service, ticket-service and broadcast-service, sufficient to populate every §10 field. Producer-side implementation is owned by this PRD's epic (domain teams), not deferred."

> FR-013 (rewrite): "Domain services MUST publish lifecycle events on the exchange satuinbox-exchange with routing keys defined in Appendix E.1. analytics-service MUST consume them via a dedicated durable queue with DLX. Event names in Appendix E.1 are NEW — no existing EventTypeEnum member covers them; the existing conversation.assigned|closed|pulled and ticket.created|updated members are websocket fan-out payloads (conversation.service.ts:1099,1653,2243) and MUST NOT be reused."

> Add FR-013a: "Each Appendix E.1 event payload MUST carry the full set of §10 fields for its target collection plus companyId, organizationId, sourceUpdatedAt. A partial payload is a producer defect, not a consumer fallback path."

Alternative, if the PM does not want to fund producer work in phase 1: state that phase 1 uses the existing pull-based aggregation path extended to row grain, and delete Appendix E — but that choice must be made in the PRD, not in the TRD.

---

B-02 — §6 FR-019/FR-021 and NFR: readPreference=secondary backfill is not achievable on the current deployment.

Quote (FR-019): "System MUST provide a one-time backfill mechanism that reads from MongoDB secondary nodes (readPreference=secondary)."

Quote (FR-021): "Backfill MUST NOT read from primary nodes."

Verified: MongoDB is a 3-replica set rs0 (backend/devops/k8s/23.mongodb.yaml:141-142,206), so secondaries physically exist. But:

every service connection string sets directConnection=true (backend/.env.example:53-70, and the file's own comment at :49 explains why: mongot / Atlas Search). With directConnection=true the driver does not do replica-set discovery and read preference is not routable — you get the node you dialed.
the k8s Service deliberately pins traffic to the primary: devops/k8s/23.mongodb.yaml:78 — "PENTING: selector hanya target mongodb-0 (PRIMARY) supaya write tidak kena secondary".
the global default is primary anyway: libs/common/src/lib/config/configurations/database.config.ts:10 — readPreference: process.env['MONGODB_READ_PREFERENCE'] ?? 'primary'.
So FR-019 + FR-021 as written cannot be satisfied without an infra change (a second connection/URI without directConnection, or a secondary-targeted Service). §12 lists "MongoDB secondary node availability for backfill" as a dependency with mitigation "Detect secondary unavailability, pause backfill, alert" — that mitigation addresses a node being down, not the routing being structurally unavailable, and ASM-002 only asks to verify a secondary exists.

Suggested rewrite — ASM-002 and §12:

> ASM-002 (rewrite): "A secondary-readable connection path exists for the analytics backfill. NOT TRUE TODAY: all service URIs use directConnection=true (backend/.env.example:49-70) and the MongoDB Service selector pins mongodb-0/primary (devops/k8s/23.mongodb.yaml:78); the global default read preference is primary (libs/common/src/lib/config/configurations/database.config.ts:10). Infra MUST provision a dedicated secondary-read connection (new MONGODB__BACKFILL_URI without directConnection, plus a Service or DNS target that resolves to non-primary members) before FR-019 can be implemented."*

> Add to Scope In-Scope: "A dedicated secondary-read connection for backfill (config + k8s Service), owned by infra."

> Or, if infra will not provide it, replace FR-019/FR-021 with a throttled primary-read backfill governed by the same NFR-003 latency guard, and say so explicitly.

---

B-03 — §4/§11/§6: the 2% latency guard — the PRD's headline OKR and its only CRITICAL NFR — has no metric producer, no baseline, and no alarm mechanism in this system.

Quotes: OKR "p95 and p99 latency MUST NOT increase by more than 2% ... measured over a 1-hour rolling window"; NFR-001/002/003 [CRITICAL]; FR-040 "System MUST alarm when domain-service p95 latency deviates > 2% from baseline"; NFR-014 "Alarm MUST fire within 5 minutes"; §13 data source "Domain service APM metrics"; Appendix I metric analytics_domain_service_latency_deviation_percent.

Verified: there is no application metrics stack in backend/. No prom-client, @willsoto/nestjs-prometheus, @opentelemetry/, statsd, Datadog, New Relic, elastic-apm or Sentry dependency in backend/package.json; no metrics registry, counter provider or /metrics route anywhere in apps/ or libs/ (grep for prom-client|makeCounterProvider|registerMetric → 0 hits). Prometheus/Grafana appear only as a planned cluster add-on comment* (devops/cluster.yaml:202). So every metric in Appendix I (13 metrics) and every alarm threshold currently has no producer, and "APM p95 baseline per domain service" does not exist to compare against.

This makes the PRD's primary success criterion untestable as written, which is exactly the failure mode a TRD cannot paper over. §12 half-notices it ("Cannot enforce 2% guard without baseline → Establish baseline p95/p99 metrics before enabling sync") but does not say who builds the measurement capability or that it does not exist.

Suggested rewrite:

> Add to Scope In-Scope: "Latency-guard instrumentation: request-duration histograms on conversation-service, ticket-service and broadcast-service, a metrics scrape endpoint, and the deviation alarm. NOT PRESENT TODAY — backend/package.json has no metrics/APM dependency and no /metrics route exists; Prometheus/Grafana are an unshipped cluster add-on (devops/cluster.yaml:202)."

> NFR-001 (rewrite): "Before sync is enabled, domain-service p95/p99 request duration MUST be instrumented and a 7-day baseline captured per service. During sync, p95 and p99 MUST NOT exceed baseline + 2%, evaluated on a 1-hour rolling window. If instrumentation is unavailable at cutover, sync MUST remain behind ENABLE_ROW_LEVEL_SYNC=false — the guard is a launch gate, not a post-launch aspiration."

> Then either fund instrumentation in this phase or downgrade NFR-001/002/003 from [CRITICAL] to a manual pre/post load-test acceptance gate with a named owner. Do not leave a CRITICAL NFR with no producer.

---

B-04 — §6 FR-011 vs FR-032 + §10.3: the broadcast natural key is PII, so the uniqueness requirement and the erasure requirement destroy each other.

Quotes: FR-011 "Each collection MUST have a unique index on its natural key for idempotent upsert"; §10.3 "Natural upsert key: {companyId, organizationId, broadcastId, recipientNumber} or {companyId, organizationId, requestId} for INVALID_REQUEST without broadcastId"; FR-032 "Right-to-erasure requests MUST trigger scrubbing of PII fields (... recipientNumber, recipientName) in affected rows"; §10.3 example value for recipientNumber is already masked: +6****10.

Three distinct defects in one place:

1. A unique index cannot be defined on "key A or key B". Mongo needs either one deterministic key or two partial unique indexes with mutually exclusive partialFilterExpressions (the codebase already uses that technique — apps/analytics-service/src/app/schemas/export-report-job.schema.ts:84-104), which the PRD must authorize because it changes the dedup contract.

2. Scrubbing recipientNumber (FR-032) mutates a component of the unique key, so the next broadcast.* event for that recipient upserts a second row instead of matching — breaking FR-016 idempotency and the ±0.1% parity metric.

3. §10.3's own example shows the value masked. If recipientNumber is stored masked, it is neither unique nor exportable at recipient grain (which is phase 3's whole deliverable). Store-masked vs store-raw is an unstated product decision.

Suggested rewrite:

> FR-005 (broadcast clause, rewrite): "broadcastexportdata MUST use a single deterministic rowKey string computed at projection time — sha256(companyId|organizationId|broadcastId|recipientNumber) when broadcastId is present, else sha256(companyId|organizationId|requestId) — and MUST carry a unique index on {companyId, organizationId, rowKey}. recipientNumber MUST NOT itself be part of any unique index, so that FR-032 PII scrubbing cannot break upsert identity."

> FR-032 (add): "Scrubbing MUST NOT modify rowKey or any indexed identity field. Scrubbed rows retain rowKey and are marked piiScrubbedAt."

> §10.3 (add a row): "recipientNumber is stored raw (unmasked) — masking is an export-time presentation concern (Sub-PRD C/D). Confirm with Legal via OQ-16." — or the inverse, but state one.

---

B-05 — PS-004 vs FR-029/FR-030 + Appendix F: a 90-day TTL on createdAt defeats the stated problem, and immediately deletes most of the backfill.

Quotes: PS-004 "Historical export data has no analytics-side store. If operational data changes or is archived, export parity is lost." / impact "Export reproducibility and audit trail depends on mutable operational data."

FR-029 "retained for a configurable period (default 90 days, ASSUMED)"; FR-030 "MUST use MongoDB TTL index on createdAt"; §10.1/10.2/10.3 "TTL index: on createdAt field"; Appendix F Phase 3 "Trigger one-time backfill from MongoDB secondary for target date range".

Two contradictions:

1. The problem statement is loss of historical reproducibility; the requirement is hard-delete history after 90 days. Under FR-029 the analytics store is strictly less historical than the operational collections it was created to protect against. §15 notices the symptom ("Retention window limits historical export range") but the PRD never reconciles it with PS-004 — one of the two must change.

2. TTL on createdAt + a backfill of an unspecified "target date range" means every backfilled row older than 90 days is deleted by the TTL monitor within ~60s of being written. So Appendix F Phase 3 and its parity check (FR-023, ±0.1%) are unsatisfiable for any range beyond 90 days, and the backfill throughput NFR (NFR-006, 50,000 docs/hour) is spent writing rows that evaporate. No target date range is stated anywhere in the PRD, so the size of this waste is also unknowable.

3. Separately, TTL on createdAt deletes still-open long-lived entities. A conversation created 91 days ago and updated yesterday is deleted while operationally active, taking sourceUpdatedAt ordering (FR-017) with it — a later event then re-creates a partial row.

Suggested rewrite:

> FR-029 (rewrite): "Row-level export data MUST be retained for EXPORT_ROW_RETENTION_DAYS, which MUST be ≥ the maximum historical export range the product commits to (see OQ-15). Retention MUST NOT be shorter than the backfill target range."

> FR-030 (rewrite): "System MUST enforce retention via a TTL index on a dedicated expireAt field set at projection time (expireAt = max(createdAt, sourceUpdatedAt) + retention), NOT on createdAt, so that still-active entities are not purged mid-lifecycle."

> Appendix F Phase 3 (add): "Backfill target range: <VALUE> (PM to set). This value MUST be ≤ retention; backfilling beyond retention is a no-op because TTL deletes the rows on write."

> PS-004/§15: state the resolution explicitly — either analytics is an audit store (retention ≥ audit need, add the Glacier tier from §14 now) or it is a 90-day cache and PS-004 is descoped.

---

B-06 — §6 FR-032/EC-010/Appendix H: right-to-erasure is required, but no erasure trigger, no erasure flag, and no requester exist in this system, and the PII field list is incomplete.

Quotes: FR-032 "Right-to-erasure requests MUST trigger scrubbing of PII fields (contactName, contactPhone, contactEmail, recipientNumber, recipientName)"; NFR-016 "reconciled against export collections within 24 hours"; Appendix H "Backfill checks erasure flag/hash set before projecting"; EC-010 same.

Verified: there is no right-to-erasure pipeline in backend/. The only GDPR-adjacent code is a Facebook-specific data-deletion callback (apps/messenger/src/app/controllers/messenger.controller.ts:130, apps/messenger/src/app/services/messenger.service.ts:1241) and a comment about conversation-event deletion (apps/conversation-service/src/app/services/conversation-event.service.ts:325). So FR-032's trigger, and the "erasure flag/hash set" that Appendix H and EC-010 both depend on, do not exist and are not declared in scope. A TRD cannot design a consumer for an event nobody emits.

Also, the PII list is under-inclusive. These §10 fields are free text that routinely carries customer PII and are neither marked (PII) nor in FR-032's scrub list: lastMessageText (§10.1), metadata / customAttributes (§10.1), description, remarks[], lastReplyMessage, customFields (§10.2 — §Appendix G even admits "Contains PII: contact info in custom fields" while FR-032 does not scrub it), messageContent, requestPayloadJson, attributesJson (§10.3). A scrub that misses them is not an erasure.

Suggested rewrite:

> FR-032 (rewrite): "On receipt of an erasure event privacy.erasure.requested (NEW — producer and requester UX are OUT OF SCOPE here and MUST be specified before FR-032 is implementable; no erasure pipeline exists today), the system MUST scrub every field classified PII in §10.4."

> Add §10.4 "PII classification": one table listing, per collection, each field as IDENTIFIER | FREE_TEXT_MAY_CONTAIN_PII | NON_PII, with the scrub action for each. Include lastMessageText, lastReplyMessage, description, remarks[], customFields, customAttributes, metadata, messageContent, requestPayloadJson, attributesJson.

> Move FR-032/NFR-016/EC-010 behind an explicit gate row in §12 owned by PM/Legal, or descope erasure from phase 1 and say so in Out of Scope. Do not leave a MUST whose trigger does not exist.

---

B-07 — §10: declared field types contradict every existing collection in satuinbox_analytics and the shared tenant contract.

Quote (§10.1/10.2/10.3): companyId | string | comp_abc123, organizationId | string | org_xyz789, conversationId | string | CNV-88921, ticketId | string | TKT-6749104949.

Verified: every existing analytics collection stores tenant dimensions as ObjectId, e.g. apps/analytics-service/src/app/schemas/responsiveness-metrics.schema.ts:41-42,58-59 (@Prop({ index: true, required: true, type: SchemaTypes.ObjectId }) companyId: Types.ObjectId;), same in broadcast-daily-metrics.schema.ts:47-48,56-57 and export-report-job.schema.ts:68-72 (ITenantEntity). Entity ids are likewise ObjectId across services.

If §10 is taken literally, the new collections cannot join or share repository/tenant-scoping helpers with the rest of analytics, and every FR-025..FR-028 query guard would need a parallel string-typed path. The example values (comp_abc123, CNV-88921, TKT-6749104949) look like illustrative placeholders rather than a deliberate decision — but §10 is normative ("fields defined in §10" per FR-001..003), so a TRD would be entitled to implement it as written.

Suggested rewrite:

> §10 (all three tables): change companyId, organizationId, contactId, conversationId, ticketId, broadcastId, closedBy, createdBy, assignedTo[], assignee[], participants[], teamId, inboxId, platformId, creatorUserId to type ObjectId, with realistic example values, and add a note: "Tenant and entity identifiers are ObjectId to match existing analytics collections (responsiveness-metrics.schema.ts:41, broadcast-daily-metrics.schema.ts:47) and the shared ITenantEntity contract. Display-formatted ids (TKT-…) are presentation-layer only."

> Keep ticketNumber as string (it genuinely is a display code — apps/ticket-service/src/app/schemas/ticket.schema.ts).

---

B-08 — §5/§6: no permission/row-scope requirement, which breaks the phase-2 contract that depends on this PRD.

Quote (US-006): "As a Platform Engineer, I want all reads and writes ... scoped by companyId + organizationId so that no cross-tenant data leak can occur." — tenant isolation only. FR-025..FR-028 likewise stop at company+org. §9 says "N/A — no user-facing UI", and there is no persona for the human who actually runs exports.

Verified there is a second, finer authorization layer that this PRD ignores: the export endpoint is guarded by JwtAuthGuard, PermissionsGuard (apps/api-gateway/src/app/analytics/export-report-job.controller.ts:54), roles carry a contactScope (libs/common/src/lib/dto/company-roles-created-event.dto.ts:27), and ticket visibility has row-level scopes such as ALL_TICKET_TEAM (libs/common/src/lib/enums/index.ts:1133-1137, "All tickets with the same team as the requesting user (supervisor)").

And phase 2 explicitly relies on it: prd-advance-export-phase-2-column-registry-and-configurable.md:86 FR-052 — "Tags and Inbox/Team filter options MUST be scoped to the requester's tenant and permission scope." Phase 2 cannot enforce team/agent/contact scope if phase 1 does not guarantee the scoping keys are present and correct: in §10.1/§10.2 teamId, inboxId and assignedTo/assignee are all Required: No, Default: null/[]. A supervisor-scoped export would silently leak or silently drop rows depending on how the TRD guesses.

Suggested rewrite:

> Add US-009 (P0): "As an Admin/Supervisor exporting data, I want export rows filtered to the same scope I can see in the app, so that an export cannot reveal rows the UI hides. AC1: Given a Supervisor with ALL_TICKET_TEAM scope, When rows are read for export, Then only rows whose teamId is in the requester's team set are returned. AC2: Given a row is projected, When teamId/assignee are absent from the event payload, Then the projection is rejected to DLQ rather than stored unscopable. AC3: Given a role's contactScope restricts contact visibility, When rows are read, Then the same restriction applies."

> FR-026 (extend): "...MUST be scoped by companyId and organizationId, and by the requester's row-level permission scope (team/assignee/contactScope) as enforced today by PermissionsGuard (apps/api-gateway/src/app/analytics/export-report-job.controller.ts:54) and TicketViewEnum (libs/common/src/lib/enums/index.ts:1133)."

> §10.1/§10.2: make teamId and assignedTo/assignee Required: Yes (empty array allowed, null not allowed) since they are authorization inputs, not decoration.

---

B-09 — §11: three of the five NFR classes this review was asked to check are absent — export size, timeouts, concurrency limits, storage sizing.

What is missing, and why the TRD cannot infer it:

Size/row limits. The PRD sets no cap on rows returned per export read. The existing system caps hard at 20,000 rows per job: CONVERSATION_EXPORT_LIMIT = 20_000 (apps/conversation-service/src/app/constants/conversation-export.constant.ts:1), TICKET_EXPORT_LIMIT = 20_000 (apps/ticket-service/src/app/constants/ticket.constant.ts:15), BROADCAST_EXPORT_LIMIT = 20_000 (apps/broadcast-service/src/app/constants/broadcast-export.constant.ts:2), batched at EXPORT_BATCH_SIZE = 2_000 with CONTENT_MAX_LENGTH = 32_000. PRD-1 neither restates, inherits, nor supersedes that cap, yet EC-006 tells consumers to "paginate" with no page size.
Timeouts. No consumer ack/processing timeout, no backfill batch timeout, no query timeout (maxTimeMS). RABBITMQ_PREFETCH exists as a config (backend/.env.example) and is not addressed, so consumer memory behaviour under NFR-005's 10,000 events/minute burst is undefined.
Concurrency. Appendix H says the consumer "auto-scales (within configured max concurrency)" — no number, and no per-tenant fairness rule. NFR-005's own example (a mass broadcast) is precisely the case where one tenant's burst starves every other tenant's sync and blows the 5-minute lag SLA for all of them. NFR-007 caps backfill at 50 Mongo connections but the per-service pool default is MONGODB_ANALYTICS_MAX_POOL_SIZE=10 (backend/.env.example:54) — 50 exceeds the configured pool, so NFR-007 is either dead or requires a pool change the PRD does not request.
Storage. NFR-015 asserts "at least 10M documents per collection per tenant" with no per-row size estimate and no total disk requirement, while MongoDB runs on a fixed-PVC StatefulSet (devops/k8s/23.mongodb.yaml:199-206). 10M rows × 3 collections × N tenants with rawEvent catch-all (FR/EC-009) duplicating the full payload is a capacity request nobody has costed.
Suggested rewrite — add to §11:

> "NFR-018: A single export read MUST NOT return more than EXPORT_MAX_ROWS (default 20,000, matching the existing per-job cap in conversation-export.constant.ts:1 / ticket.constant.ts:15 / broadcast-export.constant.ts:2); consumers MUST page at 2,000 rows (EXPORT_BATCH_SIZE). NFR-019: Every analytics read MUST set maxTimeMS ≤ 30s; event projection MUST ack or nack within 30s; a backfill batch MUST complete within 60s or be retried per EH-004. NFR-020: Consumer concurrency MUST be bounded by SYNC_MAX_CONCURRENCY (default 4) with RABBITMQ_PREFETCH set so that worst-case in-flight payload stays under the pod memory limit; a single tenant MUST NOT consume more than 50% of consumer capacity for longer than 5 minutes. NFR-021: Backfill connection ceiling MUST fit within MONGODB_ANALYTICS_MAX_POOL_SIZE (currently 10, .env.example:54) or that pool MUST be raised explicitly. NFR-022: Storage: estimated bytes/row per collection × projected 12-month volume MUST be documented and the MongoDB PVC sized accordingly before backfill (devops/k8s/23.mongodb.yaml); rawEvent retention MUST be capped or made opt-out per collection since it duplicates the entire payload."

---

B-10 — §5/§6/§8: the "empty range" case is required in spirit and specified nowhere, and its enabling requirement is hand-waved.

Quote (FR-036): "Export consumers (Sub-PRD B/D) MUST be able to identify whether a given date range is fully backfilled vs still syncing." — marked [P1], with no mechanism, no data structure, and no acceptance criterion anywhere in §5.

This is the one edge case the review brief named that the PRD does not cover at all. §8 has ten edge cases and none is "the query returns zero rows". That leaves a user-visible correctness hole: zero rows because the tenant genuinely had no conversations is indistinguishable from zero rows because backfill has not reached that range or the TTL already purged it (B-05). Phase 2/4 will then render an empty XLSX and call it success. Also note FR-036 is P1 while the P0 cutover in Appendix F Phase 4 depends on it.

Suggested rewrite:

> Promote FR-036 to [P0] and make it concrete: "System MUST maintain a exportdatacoverage document per {companyId, organizationId, collection, date} recording state ∈ {NOT_BACKFILLED, BACKFILLING, COMPLETE}, rowCount, lastSyncedAt. Export consumers MUST read coverage before reading rows and MUST fail the job with a distinguishable error when any requested date is not COMPLETE."

> Add EC-011: "Query returns zero rows for a date range. Expected: if coverage is COMPLETE for every date in range → legitimate empty result, export succeeds with a header-only file; if any date is NOT_BACKFILLED/BACKFILLING → job fails with DATA_NOT_READY and the uncovered range in the message; if any date precedes the retention window → job fails with DATA_EXPIRED."

> Add the matching AC to US-005.

---

NON-BLOCKING NITS
1. Metadata block is missing 4 house fields. The PRD has only Feature, Product Manager, Engineering Lead, Design Lead. The canonical template (prd/prd-global-search.md:1-9) also carries Link, Contributors, Version, TRD. Add all four (TRD: — until trd/trd-advance-export-phase-1-row-level-collections.md exists). Phases 2/3/4 have the same omission — fix consistently.

2. Every Source Reference path is unresolvable in this repo. §16.B cites Assessments/general/sap-report-export/..., PRD/Analytics/PRD Analytics - offline report download.md, Memory/global-memory.md, Memory/CLAUDE-be.md, Rules/prd-writing-rule.md. Verified: no Assessments/, Memory/ or Rules/ directory exists at the repo root (only backend brief diagram frontend images prd prompt reports research summary trd + PRD which does not contain Analytics/), and no sap brief exists. Repath to repo-relative locations (brief/brief-<slug>.md) or mark each as EXTERNAL with its真 source, otherwise the TRD author cannot follow a single citation. Same issue in phases 2 and 3 (:773-776, :381).

3. "Sub-PRD A/B/C/D" vs the phase-N filenames. The body says Sub-PRD A/B/C/D throughout; the files are prd-advance-export-phase-1..4. Pick one vocabulary — preferably phase-N, matching the filenames and the <feature-slug> chain that trd/, prompt/, .claude/plans/ and summary/ must reuse. Currently every cross-reference needs a mental mapping.

4. EC-005's "200-key cap" is a stale number. Quote: "no 200-key cap at storage level — cap applies at export time per Sub-PRD B/D". The real cap is 50: MAX_DYNAMIC_COLUMNS = 50 (apps/conversation-service/src/app/constants/conversation-export.constant.ts:4), and phase 2 also uses 50 as its warning threshold (prd-advance-export-phase-2...md:119,592). No "200" exists anywhere in the codebase. Change to "no cap at storage level — export-time cap is 50 dynamic columns (conversation-export.constant.ts:4)".

5. NFR-017's 15-minute presigned expiry is unverified and out of scope. Quote: "Export files in S3 MUST follow existing presigned-URL mechanism with 15-minute expiry." media-service takes a caller-supplied expiresInSeconds (apps/media-service/src/app/services/.ts:92-96,212-218) — no 15-minute constant was found. Also the Scope table puts "Export job/download UX" out of scope, so this requirement belongs in phase 2/4. Either drop it or cite the real default. (By contrast, Appendix G's "File retained 7 days in S3"* is correct — SEVEN_DAYS_MS at apps/analytics-service/src/app/processors/export-report-job.processor.ts:44. Cite it.)

6. Unmeasurable qualifiers in otherwise good ACs (none are marketing-speak — the PRD is admirably free of "fast/easy/seamless" — but these are untestable):

EC-006 "MUST support efficient range queries" → give a number: "p95 < 2s for a 30-day, 20,000-row range at 10M docs/tenant".
NFR-015 "without query degradation" → same target, stated once and referenced.
US-007 AC2 "new TTL applies within the next cleanup cycle" → "within 24 hours of the config change".
US-005 AC1 "configurable chunk sizes with throttling" → restate FR-020's defaults (500 docs/batch) in the AC so QA can test it.
FR-012 "based on query pattern profiling" → an index list decided in the TRD, or drop the FR.
EC-003 "If payload is insufficient, log and skip" → define the minimum viable field set (companyId, organizationId, natural key, sourceUpdatedAt).
7. §13 success metric has no data source. "Cross-tenant data leak incidents | 0 | Ongoing | Audit logs, query-scoping enforcement" — audit-service exists (port 50072) but nothing in this PRD requires an audit event on analytics reads, so the named data source produces nothing. Either add an FR emitting an audit record for analytics row reads, or change the data source to "quarterly query-guard test suite".

8. OKR column-count claim is unverifiable. "27+ columns for conversation, 35+ for ticket, 23+ for broadcast — sufficient for SAP report + configurable picker". §10 comfortably exceeds those counts, but the SAP column spec it must satisfy (§16.B "SAP column specs (35+27+6+9)") is not in the repo, so "sufficient" cannot be checked and phase 4 traceability is broken. Either commit the SAP spec to brief/ or restate the OKR as "covers every column in <committed spec path>".

9. FR-017 / ASM-006 ordering fallback is undefined. FR-017 mandates last-writer-wins by sourceUpdatedAt; §10 marks sourceUpdatedAt Required: Yes; ASM-006 and OQ-18 admit it may not exist and propose "event timestamp" as a fallback. A required field cannot have an optional fallback. Decide: either producers MUST include it (then reject events without it, consistent with FR-028's treatment of missing tenant ids) or it is optional with a documented fallback and a metric counting fallbacks.

10. Appendix E queue/exchange names are absent. Appendix E.1 gives routing keys but no queue name, exchange, DLX or prefetch, while the codebase has firm conventions (RABBITMQ_QUEUE_PREFIX=satuinbox, RABBITMQ_EXCHANGE=satuinbox-exchange, queue naming ${queuePrefix}-${packageName} at libs/common/src/lib/utils/main.utils.ts:169, DLQ naming <queue>.dlq per MessageQueueName). Naming them in the PRD is cheap and prevents the TRD from inventing a divergent scheme.

11. §9 "N/A — no user-facing UI" is right but incomplete. Backfill start/pause/resume, DLQ replay and erasure scrub are operator actions. There is already an RMQ-triggered backfill surface (apps/analytics-service/src/app/controllers/backfill.controller.ts:57 @EventPattern('analytics.backfill'), exposed via apps/api-gateway/src/app/analytics/backfill.controller.ts). Say whether phase 1 extends that endpoint or adds a new one, and who is authorized to call it — otherwise "pausable and resumable" (FR-024) has no interface.

---

OPEN QUESTIONS FOR THE PRODUCT OWNER
Ordered by how hard they block the TRD. Q1–Q4 must be answered before a TRD can start; Q5–Q9 can be answered during it.

Q1 (blocks B-01, supersedes OQ-17). Does phase 1 own building the domain-event producers in conversation-service, ticket-service and broadcast-service? None of the 18 events in Appendix E.1 exists today. If yes, it enters In Scope and needs the domain teams' capacity. If no, phase 1 must be re-architected onto the existing pull-based aggregation path (aggregation-scheduler.service.ts:208,434,549) and Appendix E deleted. → PM + Engineering Lead.

Q2 (blocks B-05, supersedes OQ-15). What is the maximum historical range an export must cover, and how far back does the initial backfill go? This single answer sets retention, TTL, backfill volume, storage cost, and whether PS-004 ("export reproducibility and audit trail") survives at all. Note that with the current FR-030 (TTL on createdAt, 90 days) any backfill older than 90 days is deleted on write. → PM.

Q3 (blocks B-03). Is instrumentation funded in this phase? The 2% latency guard is the PRD's headline OKR and its only CRITICAL NFR, and backend/ has no metrics/APM dependency and no /metrics endpoint at all. Options: (a) fund histograms + scrape + alarm in phase 1; (b) replace the guard with a manual pre/post load test as a launch gate; (c) accept the risk and downgrade NFR-001/002/003. → PM + Engineering Lead.

Q4 (blocks B-02). Will infra provision a secondary-read connection path? Today every URI is directConnection=true and the Service pins the primary, so readPreference=secondary is not routable. If not, does the PM accept a throttled primary-read backfill under the same latency guard? → Engineering Lead + Infra.

Q5 (blocks B-06, refines OQ-16). Two sub-questions: (a) is raw customer PII permitted in satuinbox_analytics, or must recipientNumber/contactPhone be masked at write time (which would break recipient-grain export in phase 3 and the upsert key per B-04)? (b) Is right-to-erasure in scope for phase 1 at all, given no erasure pipeline exists anywhere in the product? → PM + Legal.

Q6 (blocks B-08). Must export rows honour row-level permission scope (team / assignee / contactScope), or is company+organization isolation sufficient for phase 1? Phase 2 FR-052 already promises permission-scoped filters, so a "company+org is enough" answer creates a contradiction to resolve in phase 2. → PM.

Q7. Confirm the export row cap. Is the existing 20,000-rows-per-job limit retained, raised, or removed now that reads no longer touch operational collections? The stated motivation for the cap was operational load, which this PRD removes. → PM.

Q8. Does the SAP column specification exist as a committable document? §16.B references Assessments/cross-domain/sap-report-export/ which is not in this repo. Without it, the OKR's "sufficient for SAP report" is unverifiable and phase 4 has no traceable source. → PM.

Q9. Is a customer-visible persona intended? All eight user stories are internal (Data Engineer, Engineering Lead, Platform Engineer, Compliance Officer). Acceptable for an infrastructure PRD, but §13 has no metric tied to the Admin/Supervisor who actually exports, so "did this help anyone?" is unanswerable at review time. → PM.

---

WHAT IS GOOD (keep as-is)
Worth stating so revision does not regress it: PS-001 and PS-002 are verified true — analytics holds only pre-aggregated daily counts (conversation-daily-metrics, ticket-daily-metrics, broadcast-daily-metrics, agent-performance-metrics, responsiveness-metrics in apps/analytics-service/src/app/schemas/), and export genuinely does run inside the domain services against operational data today (apps/analytics-service/.../export-report-job.service.ts:364-380 dispatches EXPORT_REPORT_JOB_PROCESS to apps/{conversation,ticket,broadcast}-service/src/app/processors/export-job.processor.ts, which read their own collections — e.g. conversation-export.service.ts). PS-003 is verified too: broadcast daily metrics has exactly 7 aggregate counters (broadcast-daily-metrics.schema.ts:10-29). The idempotency/ordering treatment (FR-016/FR-017, EH-006/EH-007, Appendix H) is correct and well specified; Appendix F's shadow → parity → backfill → cutover sequence with a feature flag is the right rollout shape; and the Appendix G/H/I additions are above the bar for this repo. The problems above are premise-verification and internal-consistency problems, not structural ones.