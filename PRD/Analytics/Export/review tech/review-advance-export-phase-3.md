VERDICT
NEEDS REVISION

This is the tightest-written document of the four. It knows what it is, its scope table is disciplined about what belongs to PRD-A/PRD-B, the granularity concept is unambiguous, and Appendix A gives a nearly implementable aggregation pipeline. On the task's evaluation axes it scores well on 1 (problem statement), 2 (scope) and 5 (phase dependencies) — better than either sibling.

It cannot go to a tech lead yet, for three reasons:

1. The domain vocabulary in this PRD does not exist in the product. Seven broadcast statuses, three broadcast channels, "campaign", broadcastId, requestId, failureSource, idempotencyKey — none of these are real. The shipped BroadcastStatusEnum has twelve values, none of which are SUCCESS/IN_PROGRESS/SCHEDULED/INVALID_NUMBER/INVALID_REQUEST. BroadcastPlatformEnum has two values, and "Open API" is not one of them — it's a type, not a platform. Every filter FR, every error-handling row, every enum in §10.1 and the whole $cond block in Appendix A are written against a status vocabulary that must first be invented in PRD-A. That's fine as a target state, but the PRD asserts it as reuse ("Reuse §17 AFR-019").

2. The campaign-level feature is built on a grouping key the data model does not have. A broadcast document is one recipient. The campaign is the BroadcastBatch. There is no broadcastId field on the recipient row that identifies a campaign — the PRD's $group: { _id: "$broadcastId" } would group by the recipient's own _id, producing exactly one row per recipient and silently defeating the entire feature. broadcastName is also per-recipient ("${broadcastName} - (${recipient})", broadcast.service.ts:995), so $first: "$broadcastName" would emit a campaign row named after one arbitrary recipient.

3. Three of the six areas the task asked about are thin or absent: user-story coverage of the stated edge cases (in-progress, partially-failed, huge recipient lists, deleted/archived), acceptance-criteria testability in the campaign-level stories, and the async/progress/expiry/rate-limit/consent half of the NFRs.

Estimated PM effort: 4–6 hours, conditional on PRD-A answering the status-vocabulary and campaign-key questions first. Issue B-01 and B-02 are not phase-3 defects to fix locally — they are change requests against phase 1.

---

Blocking Issues
B-01 — The seven broadcast statuses in this PRD do not exist; the real enum has twelve different values
Quoted, FR-011:

> "Broadcast status options MUST be: SUCCESS, IN\_PROGRESS, SCHEDULED, FAILED, CANCELED, INVALID\_NUMBER, INVALID\_REQUEST. Reuse §17 AFR-019."

Also US-005 AC1, EH-004, §10.1 filters.status, §10.2 (all eight count columns), FR-022, FR-031, and every $cond in Appendix A Stage 2.

Verified against libs/common/src/lib/enums/index.ts:1264-1277:


BroadcastStatusEnum = raw, text_processing, text_processed, schedule,
                      pending, processing, sent, delivered, failed,
                      retry, invalid, canceled
Twelve lowercase values. The overlap with the PRD's list is failed and canceled only — and even those differ in case, which matters because BroadcastReportParamsDto.statuses is validated with @IsEnum(BroadcastStatusEnum, { each: true }) (apps/api-gateway/src/app/analytics/dto/export-parameter.dto.ts:160-166). A job submitted with "SUCCESS" is rejected at the gateway today.

The frontend does not use the raw enum either. It presents a six-value display grouping (frontend/packages/constants/src/broadcast.ts:17-24): delivered, sending, scheduled, failed, invalid, canceled, with an explicit two-way mapping (BROADCAST_STATUS_GROUP / BROADCAST_DISPLAY_TO_BACKEND_STATUS, lines 27-60) — and the offline-report broadcast filter hardcodes a fourth, different list of four (BroadcastReportFilter.tsx:22-27: delivered, pending, failed, invalid).

So there are four status vocabularies in play (backend enum, FE display enum, FE export-filter list, this PRD) and the PRD's is the only one with no implementation.

Suggested rewrite (FR-011):

> "FR-011: Broadcast status filter options MUST be the display-level statuses defined in @satuinbox/constants BroadcastDisplayStatusEnum (delivered, sending, scheduled, failed, invalid, canceled), translated to backend BroadcastStatusEnum values via BROADCAST_DISPLAY_TO_BACKEND_STATUS before querying. Note: the SUCCESS / IN_PROGRESS / INVALID_NUMBER / INVALID_REQUEST vocabulary used elsewhere in this PRD is a target vocabulary that PRD-A must materialise on broadcastexportdata; it is not the current product enum. Until PRD-A defines that mapping, §10.2's aggregate count columns are unimplementable."

Then propagate a single decision through §10.2, FR-022, FR-031, Appendix A and Appendix B. This is the largest single source of rework in the document — every count column depends on it.

Also note: the shipped export filter (BroadcastReportFilter.tsx:22-27) offers four statuses out of twelve, which means eight backend statuses are currently unfilterable. Worth a line — it's a real gap this PRD is well-placed to close.

---

B-02 — Campaign-level grouping uses broadcastId, but a broadcast document is a recipient; the campaign is BroadcastBatch
Quoted, FR-021 / FR-025:

> "system MUST execute a MongoDB aggregation pipeline that groups broadcastexportdata rows by broadcastId."

> "Campaign-level aggregation MUST group by {companyId, organizationId, broadcastId}."

And Appendix A Stage 2: _id: { broadcastId: { $ifNull: ["$broadcastId", "$requestId"] } }.

The data model does not work this way. In apps/broadcast-service/src/app/services/broadcast.service.ts:983-1010, buildBroadcastDocumentsForAudience loops for (const recipient of audience) and pushes one Broadcast document per recipient, all carrying the same batch: batchId. The parent campaign is BroadcastBatch (schemas/broadcast-batch.schema.ts), which owns name, type, fileName, rawBroadcasts and the tenant/creator fields.

Consequences as written:

The legacy export already maps broadcastId: String(doc._id) (broadcast-export.service.ts:308) — i.e. broadcastId is the recipient row's own primary key. $group: { _id: "$broadcastId" } therefore yields totalRecipients: 1 for every group and one output row per recipient. The campaign-level mode silently degenerates into the recipient-level mode with worse performance.
US-008 AC2 ("a broadcast campaign sent to 1000 recipients … Total Penerima=1000") is not achievable with this key.
FR-023's $first: "$broadcastName" is worse than arbitrary: name is written per-recipient as ` ${broadcastName} - (${recipient}) (broadcast.service.ts:995), so every campaign row would be labelled with one random recipient's phone number appended. The legacy export maps broadcastName: doc.name ?? '-' (broadcast-export.service.ts:309`) and inherits the same defect — but at recipient granularity nobody notices.
EC-005 ("Broadcast has recipients across multiple team inboxes") cannot occur under the current model: team is resolved once per batch from the account channel (broadcast.service.ts:944-947) and stamped identically onto every row. Either the edge case is fictional or PRD-A is changing the model.
Suggested rewrite (FR-021/FR-023/FR-025 + Appendix A):

> "The campaign identity in the source system is BroadcastBatch._id (apps/broadcast-service/src/app/schemas/broadcast-batch.schema.ts); an individual Broadcast document is a single recipient (broadcast.service.ts:983-1010). PRD-A MUST therefore carry a distinct batchId (campaign key) and broadcastId (recipient row key) onto broadcastexportdata, plus a clean campaign-level broadcastName taken from BroadcastBatch.name rather than the per-recipient Broadcast.name, which is suffixed with the recipient number. FR-021: campaign-level aggregation groups by {companyId, organizationId, batchId}. FR-023: campaign metadata is sourced from batch-level fields, not $first over recipient rows."

This is a change request against phase 1. broadcastexportdata in prd-advance-export-phase-1-row-level-collections.md:222-258 has no batchId field and its natural upsert key is {companyId, organizationId, broadcastId, recipientNumber} — which, if broadcastId is the recipient _id, is redundant, and if it is the batch id, then phase 1's own §10.3 mislabels it. Phase 1 must be corrected before this PRD's core feature is specifiable. Raise it explicitly in §12 as blocking.

---

B-03 — "Open API" is not a broadcast channel; the channel/source distinction is inverted
Quoted, FR-010:

> "System MUST show a Broadcast Channel multi-select filter (API, WhatsApp Web, Open API) when Jenis Laporan = Broadcast. Reuse §17 AFR-014 values."

Also US-004 (all three ACs), §10.1 filters.broadcastChannel, EH-003, Appendix A Stage 1 (broadcastChannel: { $in: broadcastChannel }).

Two separate fields are being conflated:

| Concept | Real field | Real values | Source |

|---|---|---|---|

| Channel / platform | Broadcast.platform | whatsapp_web, whatsapp_api | BroadcastPlatformEnum, enums/index.ts:726-730 |

| Origin / source | Broadcast.type | open-api, manual, import | BroadcastTypeEnum, enums/index.ts:1254-1258 |

The legacy export already keeps them apart correctly: broadcastChannel: doc.platform and source: doc.type (broadcast-export.service.ts:307,320). The filter builder maps parameters.channels → filter.platform (broadcast-export.service.ts:160-162), and the FE offers exactly two channel options — WhatsApp API and WhatsApp Web (BroadcastReportFilter.tsx:17-20).

So "Open API" as a channel value would match nothing, while the genuinely useful "show me only Open API-originated broadcasts" filter — which PS-005 and US-013 both want — is a filter on source/type that the PRD never specifies.

Suggested rewrite:

> "FR-010: Broadcast Channel multi-select filter values MUST be whatsapp_api and whatsapp_web (BroadcastPlatformEnum), mapping to broadcastChannel on broadcastexportdata (source: Broadcast.platform).

> FR-010a [new]: System MUST provide a separate Source multi-select filter with values manual, import, open-api (BroadcastTypeEnum), mapping to source (source: Broadcast.type). This is the filter that satisfies US-013 (auditing Open API integration issues)."

Then correct US-004, EH-003, §10.1, §9's Broadcast Channel Filter row, and Appendix A Stage 1 to match. The source column already exists in §10.2's campaign metadata list and Appendix B — it just has no filter.

---

B-04 — requestId, idempotencyKey and failureSource do not exist, so US-013 and the INVALID_REQUEST fallback have no data behind them
Quoted, FR-025:

> "For INVALID\_REQUEST rows without broadcastId, system MUST group by requestId as fallback."

Also EH-008, EC-001, US-013 AC3 ("broadcastId may be empty but requestId, status, and reason are filled"), Appendix A Stage 2 $ifNull: ["$broadcastId", "$requestId"], and Appendix B rows for requestId / idempotencyKey / requestPayloadJson / failureSource.

Verified absent: grep -rn "requestId\|idempotencyKey\|failureSource" over apps/broadcast-service/src/app/schemas/ and broadcast.service.ts returns nothing. The Broadcast schema has no such fields. Neither does OpenApiBroadcastDto (apps/api-gateway/src/app/broadcast/dto/post-open-api-broadcast.dto.ts) — it validates name, audience, message/broadcastTemplateId, teamInboxId/sender, platform, scheduleAt, variableSample, with no request-id or idempotency-key concept.

More fundamentally: when Open API validation fails today, no row is persisted at all. OpenApiBroadcastDto is rejected by the global ValidationPipe before createBroadcast runs, and even inside createBroadcast a downstream failure deletes the batch (broadcast.service.ts:433-434, findOneAndDelete). There is no INVALID_REQUEST record anywhere in the system. The only trace is OpenApiRequestLog in audit-service, which is a raw HTTP request log with a 90-day TTL, not a broadcast row.

So US-013 ("I want invalid Open API requests included in broadcast exports so I can audit integration issues") is a genuinely valuable new capability that requires broadcast-service (or the api-gateway open-api layer) to start emitting a rejection event. The PRD presents it as an export-formatting concern.

Suggested rewrite (US-013 + FR-025 + a new §12 row):

> "US-013 depends on a capability that does not exist: rejected Open API broadcast requests are currently discarded by DTO validation and leave no domain record (post-open-api-broadcast.dto.ts; failed creates roll the batch back at broadcast.service.ts:433-434). Producing INVALID_REQUEST rows requires broadcast-service or api-gateway to emit a broadcast.invalidRequest event carrying a synthetic requestId, the sanitized payload and the validation errors — listed in PRD-A §16 event catalogue but not implemented. Until that event exists, FR-025's requestId fallback, EH-008, EC-001 and the requestId/idempotencyKey/requestPayloadJson/failureSource columns in Appendix B are unbacked. Recommend deferring US-013 to a follow-up phase or raising it as a PRD-A change request."

---

B-05 — The task's four named edge cases are absent from the user stories (task evaluation point 3)
The task asked specifically for persona-tied stories covering: broadcast still in progress, partially failed sends, very large recipient lists, deleted/archived broadcasts. Actual coverage:

| Edge case | Where it appears | Adequate? |

|---|---|---|

| Broadcast still in progress | inProgressCount column (§10.2); nothing else | No. No story, no AC, and no statement of what a campaign row means mid-send. The counts are a point-in-time snapshot of a moving target; §15 hints at this ("sync lag … recent broadcasts may have incomplete aggregate counts") but conflates sync lag with genuinely-still-sending. A user exporting a live campaign gets successRate computed against a denominator that is still growing, with no marker distinguishing "50% failed" from "50% not sent yet". Needs a story, an AC, and probably an isComplete / campaignStatus indicator — which OQ-C-03 currently answers "no" to. |

| Partially failed sends | US-008 AC2 (800 SUCCESS / 150 FAILED / 50 INVALID_NUMBER) | Partially. The happy-path arithmetic is there; no story asks for "show me only campaigns with failures", and failureSource (the field that would explain why) is unbacked per B-04. |

| Very large recipient lists | EC-004 (500K+ recipients), NFR-002, §13 KPI (1M rows < 30s) | No — and the numbers contradict the product. BROADCAST_EXPORT_LIMIT = 20_000 (apps/broadcast-service/src/app/constants/broadcast-export.constant.ts:2), enforced at broadcast-export.service.ts:192-197 with a hard GrpcBadRequestException. Today a 500K-recipient export fails outright. EC-004's "job may take longer" and the 1M-row KPI assume a cap that does not exist and a streaming writer that phase 2's B-01 established is also absent. Either the cap is lifted (an explicit requirement, currently unstated anywhere in the four PRDs) or these rows are fiction. |

| Deleted / archived broadcasts | Nowhere | No. Not in §5, §7, §8, §15 or Appendix D. Relevant because (a) failed campaign creation deletes the batch (broadcast.service.ts:365,434) while recipient rows may already be in broadcastexportdata, leaving orphans, and (b) broadcastexportdata has its own 90-day TTL (phase 1 §10.3) independent of the operational collection, so an export can return rows for a campaign that no longer exists — or omit rows for one that does. No requirement states which is correct. |

Suggested rewrite: add four user stories with testable ACs — in-progress campaign semantics, failure-focused filtering, large-campaign behavior under the row cap, and deleted/orphaned campaign handling — plus a §8 row for the orphaned-recipient-rows case and a §15 line on analytics-vs-operational divergence.

---

B-06 — Acceptance criteria in the campaign-level and permission stories are not testable as written
Task evaluation point 4. Most ACs in §5 are properly Given/When/Then and genuinely checkable (US-003 AC3, US-006 AC2, US-012 AC1 are all good). These are not:

| AC | Quote | Problem |

|---|---|---|

| US-008 AC2 | "Given a broadcast campaign sent to 1000 recipients (800 SUCCESS, 150 FAILED, 50 INVALID\_NUMBER)" | Untestable: the statuses don't exist (B-01) and the campaign key doesn't exist (B-02). The arithmetic is also incomplete — 800+150+50 = 1000 with zero in-progress, so the scenario silently assumes a finished campaign, which is the case B-05 says is unaddressed. |

| US-009 AC1 | "Then only broadcasts within my accessible Team Inbox scope are included" | No team-inbox row-scoping exists in the export path. The broadcast export applies companyId + organizationId only (broadcast-export.service.ts:98-99, broadcast.repository.ts:393); team is a user-supplied filter (parameters.teamIds), not an enforced scope. List-level scoping is role === ADMIN \|\| SUPER_ADMIN → all, else own (export-report-job.repository.ts:68,100). "Supervisor" is not a case that exists in that check. Same defect as phase 2's nit 12. |

| US-009 AC2 | "Then I see only creators within my Team Inbox scope" | The Creator filter is populated by ReportMemberField from the member list, unscoped by team (BroadcastReportFilter.tsx:150-156). No requirement describes how the scoped list would be built. |

| US-014 AC2 | "Given I switch granularity, When the picker reloads, Then the remembered selection is for the new granularity mode" | Ambiguous: does the remembered selection persist per granularity (two stored sets), or is it cleared? FR-009 says selections are cleared on granularity change, which appears to contradict remembering them. Also inherits phase 2's FR-060 localStorage mechanism, whose own invalidation rules are unspecified (phase 2 B-08). |

| US-010 AC3 | "Then the PII acknowledgment is recorded in the job audit log" | No audit sink exists — audit-service holds only OpenApiRequestLog and AuditService.LogEvent has zero callers (established in phase 2 B-12). Not testable. |

| US-002 AC2 | "Then campaign-level aggregate columns are shown (e.g. Total Penerima, Berhasil, Gagal)" | "e.g." makes the assertion open-ended. §10.2 defines exactly nine; the AC should name the set or reference §10.2. |

| US-011 AC2 | "Then Date Range, Status, Broadcast Channel, Creator, and Team Inbox are prefilled if available" | "if available" is unfalsifiable. Specify which params the source page passes (see B-07). |

Suggested rewrite: pin US-008 AC2 to the real status vocabulary and campaign key once B-01/B-02 are resolved; restate US-009 in terms of StatisticPermission.READ_OWN / READ_TEAM / ALL (libs/common/src/lib/constants/default-permission.constant.ts:131-137) and state plainly that team-level row scoping is new work, not enforcement of an existing rule; resolve the FR-009 ↔ US-014 AC2 contradiction; and replace "e.g."/"if available" with enumerations.

---

B-07 — The redirect from Broadcast > Messages > Export does not exist, and the page has no Export control at all
Quoted, FR-034:

> "System MUST redirect Broadcast > Messages > Export to the Offline Report Download page. Reuse §17 AFR-032."

Also US-011 (all ACs), FR-035/036/037, §9 "Redirected Export State", §12 risk row, §15.

ManageBroadcastMessagePage.tsx — the Broadcast > Messages page — has exactly two header actions: Bulk Broadcast and New Broadcast (ManageBroadcastMessagePage.tsx:33-46). There is no Export button. FilterBroadcastMessage.tsx has search, date, team and status filters — no export. Grepping Export|Unduh|Download across components/molecules/broadcast/ returns nothing.

The pattern the PRD wants does exist, but only for tickets: useExportTicket does router.push('/statistic?section=offline-report&create=ticket') (apps/omnichannel/hooks/ticket/use-export-ticket.ts:12), consumed by TicketingFilter.tsx:271,281. The receiving side reads only the presence of create and opens the modal — it does not read its value or any other param (OfflineReportSection.tsx:19-24), and the modal always defaults to the Ticket tab (useCreateReportModal.ts:62, useState(TAB_OPTIONS.TICKET)).

So: the "reuse" is a new button on the broadcast page plus a new capability on the offline-report page (reading create=broadcast to pick the tab, and reading filter params to prefill a react-hook-form that currently initialises from a hardcoded BROADCAST_DEFAULT_VALUES constant, useCreateReportModal.ts:48-55). Even the ticket redirect that "works" doesn't prefill anything.

Suggested rewrite:

> "FR-034: System MUST add an Export action to Broadcast > Messages (no such control exists today — ManageBroadcastMessagePage.tsx:33-46), following the ticket pattern in hooks/ticket/use-export-ticket.ts:12. FR-035: the offline-report page MUST read the create query param value to preselect the report-type tab; today it only checks presence (OfflineReportSection.tsx:19-24) and always defaults to Ticket (useCreateReportModal.ts:62). FR-036: prefill requires an explicit URL param contract — define it here — and useCreateReportModal must seed react-hook-form defaults from those params instead of the static BROADCAST_DEFAULT_VALUES. None of this is 'reuse'; all three are new frontend work."

Add the param contract as a table (name / type / maps-to-form-field / behavior when invalid). §12's risk row already anticipates the need ("Document redirect URL param spec") — promote it from mitigation to requirement.

---

B-08 — §11 omits async/progress/expiry/rate-limit/consent entirely (task evaluation point 6)
The task asked specifically about async job expectations, progress feedback, expiry of generated files, rate limits, and PII/consent handling for recipient contact data. §11 has 16 NFRs across Performance / Reliability / Security / Privacy / Observability. Coverage:

| Asked | In §11? | Reality in code |

|---|---|---|

| Async / background job expectations | No | Real and unstated: CreateReportJob → RMQ EXPORT_REPORT_JOB_PROCESS → broadcast-service ExportJobProcessor → S3 upload → EXPORT_REPORT_JOB_RESULT (apps/broadcast-service/src/app/processors/export-job.processor.ts:56-118). Notably, broadcast generation runs inline in the processor, unlike ticket/conversation which use worker threads (broadcast-export.service.ts:331 "Generates XLSX buffer directly (no worker thread)"). Campaign-level aggregation on top of that inline path is a real risk worth an NFR. |

| Progress feedback | No | Only a binary transition exists: the processor emits EXPORT_REPORT_JOB_PROGRESS once at the start, which just flips the row to PROCESSING (export-report-job.processor.ts:86-90). The FE renders a static "On Progress" badge (TableOfflineReportColumn.tsx:42). Yet EC-004 promises "Progress indicator shows processing status" — implying percentage/row-count feedback that does not exist and that no FR requires. |

| Expiry of generated files | No | Real: EXPIRATION_DELAY_MS = 604800000 (7 days) and the presigned URL is 15 minutes (apps/media-service/src/constants/config.constant.ts). Not stated anywhere in this PRD. |

| Rate limits | No | Real: MAX_JOBS_PER_HOUR = 10, MAX_ACTIVE_JOBS_PER_CHANNEL = 1, MAX_DATE_RANGE_DAYS = 31 (apps/analytics-service/src/app/constants/report-job.constant.ts:1-5). §10.1 says "Range ≤ 30 days" — off by one against the enforced 31 (same defect as phase 2 nit 2). EH-011's duplicate-job rejection is unreachable behind the 1-active-job cap (phase 2 B-11 applies verbatim here). |

| PII / consent for recipient contact data | Partial, and regressive | NFR-009/011/012, FR-041/042/043 cover acknowledgment and campaign-level exclusion — genuinely good. But consent is never mentioned, and the acknowledgment model inherits phase 2's B-02 regression. Worse for broadcast specifically: mapBroadcastToRow takes _maskPii and ignores it — // mask pii not used in broadcast for now (broadcast-export.service.ts:299) — while the processor computes shouldMaskPii from privacy:view_full_email/privacy:view_full_phone and passes it in (export-job.processor.ts:71-80). So broadcast recipient phone numbers are exported unmasked today regardless of permission. That's a live privacy gap this PRD is the natural place to close, and it says nothing about it. |

Suggested rewrite: add an Async Job & Delivery NFR group stating the RMQ pipeline, the inline-vs-worker-thread difference for broadcast, the 20 000-row cap, the 7-day retention, the 15-minute presigned URL, and the 10/hour + 1-active + 31-day limits — each as an explicit NFR rather than an assumption. Add a Consent line to §11 Privacy or state in §15 that recipient consent is governed upstream at broadcast-send time and is out of scope for export. And add an FR requiring maskPii to actually be honoured in the broadcast row mapper, citing broadcast-export.service.ts:299 as the current gap.

---

B-09 — §5 has fourteen user stories and no non-happy-path story; §7/§8 carry the entire burden
Every one of US-001 … US-014 is a capability statement ("I want to select…", "I want to filter…", "I want the export to contain…"). All fourteen are Admin or Supervisor. There is no story for a failed job, a timed-out aggregation, an empty result, an expired file, or a mid-flight permission change — all of which appear only as EH/EC rows with no owning persona and no priority.

That matters here more than in phases 1–2 because campaign-level aggregation is the PRD's headline feature and its most likely failure mode (EH-007: "aggregation pipeline times out or exceeds memory") has no story, no P-level, and no acceptance criteria — just an error string.

Suggested rewrite: promote at least EH-007 (aggregation failure/timeout), EH-010 (empty result), and the file-expiry case into P1 user stories with ACs. Keep the EH/EC tables as the detailed reference.

---

B-10 — Metrics, feature flag, and observability requirements have no producer
Quoted, NFR-013/014:

> "Job metrics MUST include: granularity, column_count, row_count, generation_duration_ms, file_size_bytes, domain, status."

> "Campaign-level aggregation metrics MUST include: aggregation_duration_ms, group_count."

Also §13's entire Data Source column (five of six KPIs read from job metrics or audit trail) and §12/EC-006's feature-flag mitigation.

Same platform gap phases 1 and 2 hit: no prom-client, no OpenTelemetry, no APM in backend/package.json; /metrics appears only as a route exclusion in apps/api-gateway/src/main.ts. Nothing emits generation_duration_ms today.

Feature flags: there is exactly one flag service in the repo, NotificationFeatureFlagService (apps/notification-service/src/app/services/notification-dispatcher.service.ts:52,59,218), scoped to mobile-push rollout. There is no general per-company flag mechanism, and company.schema.ts has no features object (phase 2 B-12). So "Feature-flag: broadcast configurable export only enabled after PRD-A backfill is complete" (§12) and EC-006's flag-gated block describe infrastructure that must be built.

Suggested rewrite: state both as shared platform dependencies in §12 with an owner, rather than as mitigations that assume the mechanism exists. Cross-reference phase 1 and phase 2 so it's fixed once, not three times.

---

Non-blocking Nits
1. Metadata block is missing four fields. Header has Feature / Product Manager / Engineering Lead / Design Lead. The canonical template (prd/prd-global-search.md:3-10) also carries Link, Contributors, Version, TRD. Same omission in all four advance-export PRDs.

2. §10.1 says "Range ≤ 30 days"; enforced value is 31. MAX_DATE_RANGE_DAYS = 31 (apps/analytics-service/src/app/constants/report-job.constant.ts:4). Also EH rows and phase 2. Pick the real number.

3. attemptNumber maps to a retry counter with different semantics. The legacy export sets attemptNumber: doc.retryCount?.toString() (broadcast-export.service.ts:305), and retryCount is the retry-until-reply counter (broadcast.schema.ts:224-228, alongside retryStatus/nextRetryAt/repliedAt), not a send-attempt counter. Phase 1 §10.3 documents attemptNumber as "≥ 1". Worth one line so nobody builds a delivery-reliability report on it.

4. The legacy export emits 20 columns, not 22. PS-001 says "users must export all 22 columns"; §17 Appendix B lists 24 rows. FIXED_HEADERS has exactly 20 (broadcast-export.service.ts:40-61) — and it omits requestId, idempotencyKey, requestPayloadJson, failureSource (which don't exist, per B-04). One authoritative number, please; PS-001's premise depends on it.

5. Appendix B's mapping table is the strongest artefact here but silently assumes PRD-A fields that don't exist. Rows for requestId, idempotencyKey, requestPayloadJson, failureSource have a "PRD-A fieldPath" but no source in the product (B-04). Add a Source column distinguishing "exists in Broadcast" / "derived" / "requires PRD-A + domain-event work".

6. templateUsed exports an ObjectId, not a template name. templateUsed: doc.templateId ? String(doc.templateId) : '-' (broadcast-export.service.ts:324). §10.2/Appendix B present it as campaign metadata a human reads; phase 1 §10.3 example is order_update (a name). Someone must resolve the id → name; say who.

7. messageContent is truncated at 1000 chars. CONTENT_MAX_LENGTH = 1000 (broadcast-export.constant.ts:8), applied at broadcast-export.service.ts:313. Not mentioned in §10, §15 or Appendix B. Users will notice.

8. Recipient-name resolution is a per-batch N-query gRPC fan-out. resolveRecipientNames calls getClientContactByPhone once per unique recipient per 2000-row batch, via Promise.allSettled, swallowing all errors (broadcast-export.service.ts:257-289). At 20 000 rows that's up to 20 000 cross-service calls, and a missing contact silently yields '-'. NFR-001 claims recipient-level broadcast export has "comparable performance to conversation/ticket export (same query builder path)" — it doesn't today, and if PRD-A denormalises recipientName onto broadcastexportdata this disappears. Worth stating as a phase-1 benefit.

9. senderNumber is flagged PII but is a company-owned number. FR-041 groups it with recipientNumber/recipientName. It's the business's own WhatsApp sender (doc.sender ?? doc.accountChannel?.phoneNumber, broadcast-export.service.ts:302) and is exported at campaign level too (Appendix B marks it ✅ for campaign) — which contradicts FR-043 / NFR-012 ("Campaign-level exports MUST NOT include recipient-level PII" / "MUST NOT expose individual recipient PII"). If senderNumber is PII, campaign-level exports contain PII. Either de-flag it or fix Appendix B and FR-043.

10. §4's first KR contradicts FR-038/039 and §13. KR: "100% of broadcast export jobs after launch use the column picker". §13: "≥ 80% … (vs legacy template)". FR-038 mandates the legacy path keeps working and OQ-C-05 sets no deprecation date. Identical defect to phase 2 B-09; 80% is the defensible number.

11. The file-size KR is unmeasurable. "Median broadcast export file size decreases by ≥ 30% for jobs using fewer than full column sets" compares against a counterfactual full-column export of the same filters that is never run. Same as phase 2 B-09.

12. §13's "1M recipient rows < 30s" is unreachable behind the 20 000-row cap (B-05). Also Appendix A's performance note ("For 1M recipient rows … ~1K–10K campaign rows").

13. EC-010 says "21 columns" for campaign-level; FR-031 lists 21 but §10.2 defines 9 aggregates + 13 metadata = 22 including successRate. successRate is in §10.2 and Appendix B but missing from FR-031's enumeration. Off-by-one that a seed script will inherit.

14. successRate has no null/zero-denominator display rule at the XLSX level. Appendix A Stage 4 correctly guards totalRecipients = 0 → 0. But US-012 AC2 says null values render as "-", and 0% vs "no recipients" are different facts. One line in §10.2.

15. Appendix A has a syntax error and a stray word. Line 239: organizationId": "<organizationId>" — unbalanced quote. Line 313: "ponytail: MongoDB aggregation is sufficient on-demand" — looks like a stray autocomplete artifact; presumably "Rationale:" or similar. A TRD author copying this pipeline will hit both.

16. Appendix A Stage 3 is illustrative, not specified. // ... only columns user selected ... inside a normative appendix. Since FR-029 requires the query builder to "switch to aggregation pipeline mode (group + project)", the projection-construction rule is exactly the part that needs specifying. Either complete it or mark the appendix explicitly non-normative.

17. EC-005 describes an impossible state. "Broadcast has recipients across multiple team inboxes" — team is resolved once per batch and stamped on every row (broadcast.service.ts:944-947). Either delete the row or state that PRD-A is changing the model.

18. EC-011 and §15 present a broadcast-only Date Type selector as a limitation, but the conversation/ticket asymmetry is larger than stated. Ticket export already has ticketTypeId and stageTypes; conversation has excludeJunked/excludeSpam (export-parameter.dto.ts). Domain-specific filters are the norm, not a broadcast exception. Reframe.

19. "Jenis Laporan" vs the shipped "Tipe Laporan". US-001, FR-010/011, §9 use "Jenis Laporan"; the i18n key is report-type → "Tipe Laporan" (frontend/packages/i18n/src/translations/statistic/id.json:164) and the UI renders tabs, not a dropdown (CreateReportModal.tsx:47-60). Same nit as phase 2 (nit 6) — fix consistently across the set.

20. "Granularitas" is a coined term with no i18n key. Reasonable Indonesian, but per @satuinbox/eslint-config all copy must go through next-intl. Appendix D-style UI-copy table (which phase 2 has and phase 3 lacks) would let the i18n keys be created in one pass. Recommend adding one.

21. §9 "Broadcast Status Filter … Visible only for Broadcast" duplicates an existing component. BroadcastStatusField already exists (BroadcastReportFilter.tsx:101-125) and is already broadcast-only via the tab structure. It's an extension (4 → 6+ statuses), not a new component.

22. Source References cite paths that don't exist in this repo. Appendix E points at PRD/Analytics/Export/…, Assessments/general/sap-report-export/…, Rules/prd-writing-rule.md. None of PRD/, Assessments/, Rules/ exist at the repo root. No citation is followable. Same defect in phases 1, 2 and 4.

23. "Sub-PRD C" vocabulary vs the phase-3 filename. The body says "PRD-C"/"Sub-PRD C" throughout; phase 4 refers to it as "PRD-C" too (line 447). The downstream chain must reuse the slug advance-export-phase-3-broadcast-export. One mapping line in §2, or a global rename.

24. Escaped-markdown artifacts throughout. Google-Docs export residue: \----- table rules, \\\ fences, \[P0\], \backticks\. prd/prd-global-search.md` is clean. Cosmetic; affects every reader.

25. House-structure note (positive). Unlike phase 1 and 2, phase 3 does not bury substantive sections in appendices — §7–§15 are all numbered and in canonical order. This one is right; the drift flagged in phases 1/2 should be fixed toward this shape.

26. §14 "Scheduled broadcast exports … delivered via email" conflicts with §2's Out of Scope "Email delivery of export results". Consistent (future vs now), but worth a cross-reference so a reader doesn't think it's contradictory.

---

Open Questions For The Product Owner
Ordered by blocking impact on the TRD.

OQ-P3-01 — What is the canonical broadcast status vocabulary? (blocks TRD, blocks PRD-A)

Four vocabularies exist: backend BroadcastStatusEnum (12), FE BroadcastDisplayStatusEnum (6), the shipped export filter (4), and this PRD (7). Which one does broadcastexportdata.status store, and what is the mapping? Every count column in §10.2, every $cond in Appendix A, FR-011, EH-004 and §10.1 depend on the answer. See B-01. Owner: PM + Eng Lead, coordinated with PRD-A.

OQ-P3-02 — What is the campaign key? (blocks TRD, blocks PRD-A)

A Broadcast document is one recipient; the campaign is BroadcastBatch. Does PRD-A add batchId to broadcastexportdata, and does campaign-level broadcastName come from BroadcastBatch.name (clean) rather than the per-recipient Broadcast.name (suffixed with the recipient number)? Without this the campaign-level feature — the headline of this PRD — cannot be built. See B-02. Owner: PM + Eng Lead, coordinated with PRD-A.

OQ-P3-03 — Channel vs source: two filters or one? (blocks TRD)

platform (whatsapp_api / whatsapp_web) and type (manual / import / open-api) are distinct fields that the PRD merges into one "Broadcast Channel" filter containing "Open API". Confirm two separate filters, and confirm the Source filter is what satisfies US-013 and PS-005. See B-03. Owner: PM.

OQ-P3-04 — Is US-013 (INVALID_REQUEST rows) in scope for this phase?

Rejected Open API requests currently leave no domain record at all — DTO validation rejects before persistence, and failed creates roll the batch back. Producing these rows is new broadcast-service work, not export formatting. Keep it (and raise a PRD-A change request for the broadcast.invalidRequest event) or defer it? If deferred, FR-025's fallback, EH-008, EC-001 and four Appendix B rows come out. See B-04. Owner: PM.

OQ-P3-05 — What happens to the 20 000-row export cap?

BROADCAST_EXPORT_LIMIT = 20_000 is enforced today with a hard rejection. EC-004 (500K recipients), NFR-002 and the §13 1M-row KPI all assume it's gone. Is lifting it a requirement of this phase, of phase 2, or not at all? If not, EC-004 needs rewriting as "job is rejected" and the KPIs need new numbers. Note this is the same decision as phase 2's OQ-P2-02 (streaming writer) — answer once. See B-05. Owner: Eng Lead.

OQ-P3-06 — What does a campaign-level row mean for a broadcast still in progress?

successRate against a growing denominator is misleading. Options: (a) exclude in-flight campaigns, (b) add a completeness indicator column, (c) export as-is and document it. OQ-C-03 currently answers "no campaign status column" — which forecloses (b) without addressing this case. See B-05. Owner: PM.

OQ-P3-07 — Deleted / archived campaigns.

broadcastexportdata has an independent 90-day TTL and failed campaign creation deletes the batch while recipient rows may already be synced. Should exports include campaigns deleted from the operational store? Should orphaned recipient rows be grouped, suppressed, or flagged? Nothing in §5/§7/§8/§15 addresses this. See B-05. Owner: PM.

OQ-P3-08 — Does broadcast export honour privacy:view_full_phone masking?

Right now it does not: the processor computes shouldMaskPii and passes it in, and the row mapper ignores it — // mask pii not used in broadcast for now (broadcast-export.service.ts:299). Recipient phone numbers are exported in full to every user with statistic:read. Ticket export masks correctly on the same permission. Is closing this gap in scope here? This is a live privacy issue independent of the acknowledgment-dialog question (phase 2 OQ-P2-01). Owner: PM + Legal.

OQ-P3-09 — Is senderNumber PII?

FR-041 flags it; Appendix B exports it at campaign level; FR-043 and NFR-012 forbid PII at campaign level. It's the company's own number, so the cleanest resolution is to de-flag it — but that contradicts FR-041 and the §4 OKR wording. See nit 9. Owner: PM.

OQ-P3-10 — What progress feedback is actually promised?

EC-004 says "Progress indicator shows processing status", but the only mechanism is a one-shot QUEUED → PROCESSING flip and a static badge. Is per-job progress (rows processed / total) a requirement of this phase? If yes it needs an FR and an NFR; if no, EC-004's copy should say "job shows PROCESSING until complete". See B-08. Owner: PM + UX.

OQ-P3-11 — Who builds the feature-flag mechanism?

§12 and EC-006 both mitigate with a feature flag. The only flag service in the repo is notification-scoped, and company.schema.ts has no features object. Is a general per-company flag a prerequisite this PRD is claiming, and who owns it? Shared with phases 1, 2 and 4. See B-10. Owner: Eng Lead.

OQ-P3-12 — Does the redirect prefill contract get specified here or in the TRD?

§12 lists "Document redirect URL param spec" as a mitigation. Given the receiving component currently ignores the param value entirely, the contract is a product decision (which filters survive a redirect, what happens to invalid ones — EC-007 says "silently dropped" with an "optional banner"). Recommend specifying it in §10 as a table. See B-07. Owner: PM.

---

What is genuinely good (so revision doesn't over-correct)
The scope table (§2) is the best in the set. Nine in-scope items, each paired with the sibling PRD that owns the excluded counterpart. This is exactly the discipline the task's evaluation point 5 asks for, and phase 3 does it better than phases 1, 2 or 4. Dependencies on PRD-A (broadcastexportdata) and PRD-B (registry, query builder, column picker, streaming XLSX) are named explicitly in §2, §6, §12 and §15 — stated, not implied.
Granularity as a first-class concept is well-designed. FR-005 → FR-009 (toggle, default, reload, snapshot, clear-on-change) plus FR-030 → FR-033 (mutual exclusion in the picker) is a complete, traceable, unambiguous chain. The Glossary entry pins the semantics. A TRD can implement this without interpretation once the underlying key question (B-02) is answered.
§10.2's campaign aggregate column table — fieldPath / displayName / dataType / category / description / isComputed — is directly seedable and correctly separates computed from stored.
Appendix B's §17 → PRD-A → recipient/campaign matrix with explicit ❌ + reason per cell is the right artefact for a migration, and the "not at campaign level" rationales are correct product thinking.
FR-043 and NFR-012 (campaign-level exports exclude recipient PII) are a genuinely good privacy-by-design decision, arrived at by reasoning about the granularity rather than bolted on.
§15 Limitations is honest — it names the on-demand aggregation cost, the sync-lag effect on aggregate accuracy, and the registry-discriminator dependency instead of hiding them.
Structure is canonical: §1–§16 in template order, no substantive section demoted to an appendix. Phases 1 and 2 should be fixed toward this shape.
---

Recommended path
1. PRD-A owner answers OQ-P3-01 and OQ-P3-02 first. These are not phase-3 edits — they are change requests against prd-advance-export-phase-1-row-level-collections.md §10.3 (status vocabulary + a batchId campaign key + a clean campaign broadcastName). Nothing else in this PRD can be finalised until they land.

2. PM answers OQ-P3-03 through OQ-P3-05 (channel/source split, US-013 scope, row cap).

3. PM applies B-03, B-05, B-06, B-07, B-08, B-09 and nits 2/4/9/10/11/13/15/16/17 as in-place edits, adding a v1.1 row to §1 Revision History.

4. Add the missing UI-copy table (nit 20) so i18n keys can be created in one pass.

5. Re-review, then hand to technical-analyst for trd/trd-advance-export-phase-3-broadcast-export.md.

Sequencing note for the orchestrator. All three phase-1..3 reviews now return NEEDS REVISION, and the dependency chain is strictly linear: phase 3 needs phase 2's registry + query builder + XLSX path, and phase 2 needs phase 1's collections. Phase 3 additionally needs two new things from phase 1 that phase 1 does not currently specify (B-01, B-02). Issuing these TRDs in parallel would produce three documents designing against each other's unresolved assumptions. Recommend: fix phase 1 → fix phase 2 → fix phase 3, and gate each TRD on the prior phase's PRD being re-reviewed.

Three defects are shared across the set and should be fixed once, centrally, rather than three times: the missing metadata fields (nit 1), the unfollowable Source References (nit 22), and the absent metrics/feature-flag platform (B-10). Phase 2's completion metadata already carries a cross_phase_notes_for_consolidator list; this review's cross-phase items are consistent with it.