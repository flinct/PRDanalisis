VERDICT
NEEDS REVISION

Structurally this is the most complete of the four (canonical §1–§14 plus State Transition, Permission Matrix, API/Event Contract, Migration & Rollout, Data Lifecycle, Analytics & Observability, Concurrency — all correctly inserted as numbered sections, with §22 Limitations and §23 Appendix closing it, and a genuinely good Appendix A/B/C spec for duration + timezone formatting). The SAP output contract is the clearest artifact in the whole set.

It cannot go to TRD as written. The blocking problems are not gaps in the SAP format — they are that the delivery vehicle described does not exist in this codebase: there is no export-worker, no ExcelJS, no templateId, no multi-sheet path, and the volumes/file size the PRD is sized around (169k rows, 47.5 MB) are 8.5× and 2.4× over hard limits that are enforced today with thrown exceptions. Two of the five problem statements (PS-004, PS-005) are already solved in shipped code. Separately, the preset as specified would silently defeat the PII masking that the ticket export enforces today.

---

Blocking Issues
B-01 — No service owns multi-sheet generation; "export-worker" does not exist
> §17: "Producer: FE (Offline Report page) | Consumer: analytics-service / export-worker"

> §19: "SAP preset export file (.xlsx) | Owner: analytics-service / export-worker"

> FR-008: "Each sheet MUST query its own data source independently."

There is no export-worker app. backend/apps/ has 20 services and none is an export worker. The real topology is a fan-out, one file per domain service:

analytics-service only creates/tracks the job row and dispatches by channel — export-report-job.service.ts:358-390 switches on job.channel and emits EXPORT_REPORT_JOB_PROCESS to one of three RMQ clients (conversation / ticket / broadcast).
Each domain service generates its own single-sheet workbook in its own process: ticket-service/src/app/workers/ticket-export.worker.ts:52-57, conversation-service/src/app/workers/conversation-export.worker.ts:52-57, broadcast-service/src/app/services/broadcast-export.service.ts:332-341.
analytics-service never touches ticket or conversation data for export; it only receives EXPORT_REPORT_JOB_RESULT (processors/export-report-job.processor.ts:33-56).
A single XLSX containing Ticket + Conversation + people-service data has no owner in this design. Making analytics-service the generator is also a resource problem: devops/k8s/20.analytics-service.yaml:47-52 gives it requests 128Mi / limits 256Mi, against ticket-service's 2Gi/4Gi.

Suggested rewrite: replace "analytics-service / export-worker" everywhere with a named, decided owner and add it to §12 Dependencies. State explicitly which of the three options is chosen: (a) new orchestrator that collects per-domain buffers and merges sheets, (b) analytics-service becomes the generator and reads the PRD-A collections directly (needs a memory limit increase, name the number), or (c) each domain service returns a sheet and one service assembles. This is a §17 + §18 change, not a wording fix — the TRD cannot start without it.

B-02 — ExcelJS streaming is the load-bearing NFR and ExcelJS is not a dependency
> FR-009 [P0]: "XLSX generation MUST use streaming write (ExcelJS streaming workbook writer)"

> NFR-002 / NFR-003 / §10.2 "Library: ExcelJS streaming workbook writer"

> §12: "ExcelJS already supports worksheet.eachRow streaming per sheet."

backend/package.json has no exceljs. The dependency is "xlsx": "^0.18.5" (SheetJS, line 115), used identically by all three export paths, and it is fully in-memory: rows accumulate in a Record<string,string>[] array (ticket-export.service.ts:100,116-125), get handed whole to a worker thread, and XLSX.write(workbook, {type:'buffer'}) materialises the entire file (ticket-export.worker.ts:77-81). The Mongo read is cursor-batched (ticket.repository.ts:621-637, batch 2,000) but every batch is appended to allRows, so nothing streams to disk.

Also note worksheet.eachRow is a read iterator, not a streaming writer — the §12 mitigation would not mitigate anything even if ExcelJS were present.

Suggested rewrite: either (a) add "adopt exceljs as a new backend dependency" to §12 Dependencies as an explicit, owned decision and drop the "already proven" framing, or (b) rewrite FR-009/NFR-002/NFR-003 against SheetJS and accept in-memory generation — in which case B-03 and B-04 become hard caps, not risks.

B-03 — The 169k-row target is 8.5× a hard cap that throws today
> EC-002: "Date range produces 169k+ ticket rows (matching SAP example volume) … Job completes within timeout."

> §21: "QA: validate with production-volume data (169k tickets, 88k conversations)."

> Appendix E: "Ticket rows ~169,000 | Conversation rows ~88,000 | Effective Hour rows ~65,000"

Every existing export path refuses anything over 20,000 rows, before generation, with a thrown gRPC error:

ticket-service/src/app/constants/ticket.constant.ts:15 — TICKET_EXPORT_LIMIT = 20_000, enforced at ticket-export.service.ts:187-195 (GrpcBadRequestException("Export limit exceeded. Maximum 20000 tickets allowed…"))
conversation-service/src/app/constants/conversation-export.constant.ts:1 — CONVERSATION_EXPORT_LIMIT = 20_000
broadcast-service/src/app/constants/broadcast-export.constant.ts:2 — BROADCAST_EXPORT_LIMIT = 20_000
The PRD has no max-row NFR at all, and §11 Performance says only "reuse existing — no new timeout".

Suggested rewrite: add an explicit NFR: "SAP preset MUST support at least N rows per sheet (N = ____), superseding TICKET_EXPORT_LIMIT / CONVERSATION_EXPORT_LIMIT of 20,000 for this preset" — and pair it with the decision in B-02, because 169k rows × 35 columns in an in-memory SheetJS workbook is the OOM that EH-003 is trying to describe. If the cap stays at 20,000, delete EC-002 and Appendix E's row counts and state the real limitation in §22.

B-04 — A 47.5 MB file cannot traverse the upload path
> §12: "File size: SAP example is 47.5 MB for full 4-sheet export … Existing 7-day retention and presigned URL handle this. No special handling needed."

> EC-008: "File size exceeds 500MB … Job proceeds if within timeout."

> §20: "Alert if > 500 MB"

The completed workbook is shipped to S3 as a gRPC payload through media-service (libs/common/src/lib/utils/export.utils.ts:28-41, uploadMedia with the whole fileBuffer). Two ceilings apply:

libs/common/src/lib/constants/base.constant.ts:152,165 — MAX_GRPC_MESSAGE_SIZE_MB = 30 (set on every server and client, main.utils.ts:144,318)
base.constant.ts:151,164 — MAX_FILE_SIZE_MB = 20 → MAX_MEDIA_SIZE, enforced on the media upload route (api-gateway/src/app/media/media.controller.ts:187)
47.5 MB exceeds both; 500 MB is off by more than an order of magnitude. "No special handling needed" is the opposite of true — this is the single most likely production failure of the feature.

Suggested rewrite: replace the §12 row with a real mitigation (direct-to-S3 multipart upload from the generating service, bypassing the gRPC media hop) and give §11 a file-size NFR that matches it. Re-derive EC-008's threshold from that decision instead of 500 MB.

B-05 — templateId does not exist and SAP_REPORT is rejected by validation
> §10.1: "templateId | string | "SAP_REPORT" | Must be "SAP_REPORT" for SAP preset. | Required: Yes"

> §17: "POST /api/offline-report/jobs (reuse existing endpoint) … { templateId: "SAP_REPORT", sheets: string[], filters: {...} } → { jobId, status: "DIPROSES" }"

> FR-039: "'SAP Report' MUST appear as a fixed option in the existing template dropdown (alongside 'Default Ticket', 'Default Conversation', etc.)"

Four separate mismatches against the shipped contract:

1. Route. The endpoint is POST /analytics/export-report (api-gateway/src/app/analytics/export-report-job.controller.ts:53,91), not /api/offline-report/jobs.

2. No templateId. The wire contract is CreateReportJobRequest { channel, parameters: Struct, userContext } (proto/analytics.proto:77-81). There is no template concept anywhere.

3. SAP_REPORT would be rejected. channel is @IsEnum(ExportReportChannelType) — exactly ticket | conversation | broadcast (libs/common/src/lib/enums/index.ts:1911-1915). And parameters is validated per-channel with {whitelist: true, forbidNonWhitelisted: true} (dto/export-report-job.dto.ts:40-66), so a templateId or sheets key inside parameters is a 400. Then dispatchExportJob throws 'Invalid job channel' on anything outside the three (export-report-job.service.ts:386-388).

4. No template dropdown exists. The create modal has three tabs (Ticket / Conversation / Broadcast) driven by TAB_OPTIONS, each with its own zod schema and hardcoded defaults — frontend/apps/omnichannel/components/molecules/statistic/offline-reports/CreateReportModal.tsx:52-57 and useCreateReportModal.ts:25-55. "Default Ticket" / "Default Conversation" are not options in any dropdown; they are tabs. FR-039's "alongside" is describing UI that isn't there.

Note this is the same false premise as phase-2 B-04, so the fix must be agreed once across phases 2 and 4 or the two PRDs will specify conflicting job payloads.

Suggested rewrite: state the actual contract change being requested — e.g. "add a fourth ExportReportChannelType value sap with its own SapReportParamsDto { sheets: string[], startDate, endDate, … }" — and rewrite §17, §10.1, FR-039 and FR-046/047 against it. Also correct the response shape: CreateReportJob returns common.Success, and job status values are QUEUED | PROCESSING | COMPLETED | FAILED | EXPIRED (enums/index.ts:1917-1923), not DIPROSES / SELESAI / GAGAL / KEDALUWARSA (those are Indonesian display labels, not states — §15 currently reads as if they were the persisted enum).

B-06 — PS-004 and PS-005 are false; both are already implemented
> PS-004: "Duration fields are stored as raw milliseconds. SAP format requires HH:MM:SS display. | Impact: No duration formatting in current export path."

> PS-005: "Datetime fields stored in UTC. SAP report requires WIB … | Impact: No timezone conversion in current export path."

Both already ship, in exactly the form the PRD asks for:

Duration → HH:MM:SS, non-modulo hours, zero-padded: ticket-export.worker.ts:290-302. This matches Appendix B's formula and EC-003's "48:00:00" convention line for line.
WIB conversion, YYYY-MM-DD HH:MM:SS: ticket-export.worker.ts:6 (const TIMEZONE = 'Asia/Jakarta'), :24-33 (Intl.DateTimeFormat('en-CA', {…timeZone: TIMEZONE, hour12: false})), :310-319. Identical code in conversation-export.worker.ts:5,20-23. There is also a shared TIMEZONE_WIB = 'Asia/Jakarta' in libs/common/src/lib/constants/date-time.constant.ts:8.
This matters beyond accuracy: FR-015–FR-020 and Appendix B/C are ~40% of the PRD's functional surface and are being presented as new work. It also changes the §12 recommendation — Appendix C suggests adding date-fns-tz or luxon; date-fns-tz ^3.2.0 is already a dependency (package.json:80), and the shipped code uses neither, just Intl.

Suggested rewrite: delete PS-004 and PS-005 or restate them as "existing HH:MM:SS / WIB formatters in ticket-export.worker.ts and conversation-export.worker.ts MUST be extracted to a shared util and reused by the SAP preset". Change FR-015–FR-020 from "MUST implement" to "MUST reuse", cite the file, and drop the Appendix C library recommendation.

B-07 — The preset silently bypasses enforced PII masking
> NFR-009: "SAP preset includes PII fields (contactPhone, contactEmail, contactName) by design … PII acknowledgment is implicit for 'SAP Report' template (known PII-included preset)."

> §22: "PII fields included by design — no per-column opt-out for SAP preset. | Matches SAP contract. Users accept PII inclusion when using 'SAP Report' template."

Masking is not a convention here, it is enforced per-request from the caller's permissions. ticket-service/src/app/processors/export-job.processor.ts:83-86:

ts
const userPermissions: string[] = data.userContext?.permission?.permissions ?? [];
const shouldMaskPii =
  !userPermissions.includes('privacy:view_full_email') ||
  !userPermissions.includes('privacy:view_full_phone');
which drives maskEmail / maskPhone on Customer Email, Customer Phone and Client (Contact) (ticket-export.worker.ts:177-182). The permissions are real (libs/common/src/lib/enums/index.ts:96-97).

As written, a Supervisor without privacy:view_full_phone — who gets masked phone numbers from the Ticket export today — receives 88k unmasked contactPhone values from the SAP preset because "acknowledgment is implicit". That is a privacy regression introduced by a PRD sentence, and "the user accepts it by choosing the template" is not an authorization control. (Phase 2's B-02 flags the same regression from the other direction, so this needs one cross-phase decision.)

Suggested rewrite: make the PII inclusion a permission, not an acknowledgment: "SAP preset job creation MUST be rejected unless the requester holds both privacy:view_full_email and privacy:view_full_phone; masking MUST NOT be applied when it is permitted." Add the corresponding row to §16 and an error code to §7. If the SAP contract genuinely requires raw PII for users who lack those permissions, that is a Product/Legal decision and belongs in Open Questions, not in an NFR.

B-08 — Subscription gate references fields that do not exist, and the permission model is not role-based
> §16 Subscription Tier Gate: "1. company.subscriptionTier = enterprise (tier tertinggi) 2. company.features.sapExportEnabled = true (flag PKS…)"

> §16 Permission Matrix: "Agent | Denied | Denied | Denied | Denied"

company.schema.ts has no subscriptionTier and no features object — its fields are name / tax & licence numbers / owner / verification / phone / email / webhooks. Subscription state lives in payment-service as subscription.packageId + packageName (payment-service/src/app/schemas/subscription.schema.ts:82,85). There is no tier enum and no per-feature flag mechanism anywhere.
Access to the export endpoints is permission-based, not role-based: @UseGuards(JwtAuthGuard, PermissionsGuard) + @RequirePermissions([StatisticPermission.READ]) (export-report-job.controller.ts:54,93). Any role granted statistic:read can create a job, so "Agent | Denied" is not expressible without a new permission (e.g. statistic:export_sap).
The audit rows have no sink. §20's sap_preset_export_audit and §15's sap_preset_job_* audit events have nowhere to land: audit-service holds only open-api-request-log.schema.ts, and the proto AuditService.LogEvent has zero callers in the repo.
§20's four Metric/Alert rows ("Alert if p95 > 10 min", "Alert if failure rate > 5%") have no producer: the backend has no prom-client, no OpenTelemetry, no APM package, and no /metrics route.
This is the identical gap phase 1 (B-03) and phase 2 (B-12) hit — the observability plans across all four PRDs assume a metrics stack that does not exist.

Suggested rewrite: replace the two field names with the real gate you intend (a new Subscription-side entitlement, or a company-level features sub-document that this PRD explicitly asks to create — either way it is new schema and belongs in §12 and §18). Replace the role matrix with a permission matrix keyed on StatisticPermission plus the new permission. For §20, either name the owner who will introduce the metrics/audit sink as a dependency, or downgrade the rows to "structured log fields" (sap_preset_generation_duration_ms as a log line is achievable today; an alert threshold is not).

B-09 — US-005's Supervisor Team-Inbox scoping does not exist in any export path
> US-005 [P0]: "As a Supervisor, I want SAP Report export scoped to my Team Inbox scope … AC1: the export data is restricted to my accessible Team Inbox scope. AC2: only rows within my scope appear in the output."

> NFR-007: "Supervisor scope re-applied at processing time (reuse existing RBAC)."

> EH-008: "Scope is re-applied at processing time per existing RBAC rules."

There is no such existing behavior to reuse. Export queries scope on tenant only: ticket.repository.ts:604-619 builds tenantMatch = { companyId, organizationId } and unshifts it — no team, no participant, no role branch. Neither ticket-export.service.ts nor conversation-export.service.ts reads role, team or scope from the userContext at all.

The only role logic in this area is on the job list, not the data: findByIdScoped and the paginated list restrict which job rows you can see to your own unless you are ADMIN or SUPER_ADMIN (analytics-service/src/app/repositories/export-report-job.repository.ts:57-74) — and SUPERVISOR is not a case there, it just falls into "own jobs only". §16's "Supervisor | View All Jobs: Own jobs only" is correct; US-005/NFR-007/EH-008 are not.

Phase 3 raised the same defect (its B-06) and phase 2's FR-052 promises permission-scoped filters that phase 1 never delivers. Three PRDs now assume row scoping that no phase actually builds.

Suggested rewrite: either drop US-005 to a Future Consideration and add "SAP preset rows are scoped to company + organization only; a Supervisor sees all tenant rows" to §22 Limitations — or keep it P0 and add explicit FRs for the scoping predicate (which field: teamId? participants? assignee?) plus a note in §12 that phase 1 must carry that field. Do not describe it as reuse.

B-10 — Column counts contradict themselves, so there is no testable acceptance target
> §4 KR: "Output matches SAP column structure (35 ticket + 27 conversation + 6 effective hour + 9 AUX columns)."

> Appendix A.1 note: "Original SAP spec lists 35 columns but the exact list has 31 identifiable mappings … The remaining 4 columns in the SAP example file need final verification."

> Appendix A.2 note: "Original SAP spec lists 27 columns. 23 are identifiable above."

> §13: "Column headers match SAP spec 100%" — Data Source: "QA validation against .hermes/desktop-attachments/SatuInbox_SAP_Report_31_07_2026.xlsx"

Eight columns (4 ticket + 4 conversation) are unnamed and unmapped, yet the headline KR and the §13 KPI both demand 100% match. QA cannot pass or fail this. Worse, the one artifact that would resolve it — the reference file cited in §13 and Appendix E — is not in the repo: .hermes/desktop-attachments/ does not exist under the repo root or the user home. Every "verify against the SAP example file" instruction in this PRD is currently unfollowable, which is the same unfollowable-citation problem flagged in phases 1–3.

Suggested rewrite: either enumerate all 35/27 columns in Appendix A (preferred — this is the whole point of the document), or change the KR and KPI to the verified subset ("31 ticket + 23 conversation columns match the SAP spec; the remaining 8 are tracked in OQ-D6 and are out of scope for Phase 2"). Attach the reference workbook to the ticket or commit it to a durable path and cite that path instead.

B-11 — Sheets 3–4 are P0 requirements resting entirely on an unresolved OQ — and the OQ understates what exists
> FR-013/FR-014 [P0]: "MUST read from a people-service derived data source (see open question OQ-D1)."

> FR-036/FR-038 [P0]: "Data source for Effective Hour / Raw AUX MUST be defined (see OQ-D1)."

> OQ-D1: "Where does presence/AUX data live? … Status: OPEN"

Half of the deliverable (2 of 4 sheets, 15 of the ~77 columns) is specified as "P0, MUST, source TBD". A P0 functional requirement whose content is "define the source" is not a requirement.

On investigation, OQ-D1 is partly answerable today — and the PRD is more pessimistic than reality on Raw AUX, more optimistic than reality on Effective Hour:

Raw AUX is ~7 of 9 columns backed already. people-service/src/app/schemas/agent-aux-interval.schema.ts defines collection agentauxintervals with memberId, companyId, organizationId, reasonId, reasonText, startAt, endAt, totalAwayMs — that is Appendix A.4's User ID, Reason Away, Start Away, End Away and Total Away directly. It is already indexed for exactly this query shape ({organizationId: 1, startAt: -1}, "get all away intervals in an org for a time period").
A gRPC path already exists and analytics-service already uses it. proto/people.proto:124,762-778 defines GetAuxSummary(memberIds, startDate, endDate) → AuxSummaryItem{memberId, reasonId, reasonText, totalMs}, implemented at member.controller.ts:565 / member.service.ts:2606-2637, and analytics-service already calls it (utils/member-analytics.util.ts:308-340) over its existing PEOPLES client (app.module.ts:95). But it returns a per-member/per-reason aggregate, not the per-interval rows Raw AUX needs — so a new RPC (e.g. GetAuxIntervals) is required, not a new collection.
Effective Hour is the genuinely missing half. "Work Hours Shift" needs attendance (actual shift start/end per date). What exists is only configuration: member.shift?: ShiftInfo (member.schema.ts:197-198) pointing at a company-level Shift whose intervals are {dayOfWeek, start: "08:00", end: "17:00"} (proto/company.proto:391-407). There is no clock-in/clock-out record anywhere in people-service or auth-service. So "Start Shift"/"End Shift" (A.4 #5/#6) and "Work Hours Shift" (A.3 #4) can only be scheduled values, not actual — which changes what the numbers mean to the SAP team.
Suggested rewrite: split OQ-D1 into OQ-D1a (Raw AUX — resolved: source is agentauxintervals; scope item is a new per-interval RPC on people-service, owner = BE) and OQ-D1b (Effective Hour — genuinely blocked: no attendance data exists; product must decide between scheduled-shift hours, first-to-last-activity derivation, or deferring the sheet). Then either demote FR-013/FR-014/FR-035–FR-038 to P1 with an explicit "Sheets 3–4 ship in a later increment" line in §22, or keep them P0 and accept that the whole feature is blocked on OQ-D1b. The §12 mitigation ("Ship Sheets 1-2 first … Sheets 3-4 can be 'coming soon' in UI") contradicts their P0 status and US-002's "all 4 pre-selected by default" — pick one.

B-12 — Concurrency, dedup and date-range acceptance criteria contradict enforced constants
> US-006 AC3: "Given date range > 30 days, When I submit, Then submission is blocked with existing "Maksimal rentang 30 hari" message."

> §21: "Duplicate SAP preset job (same requester, sheets, filters, active) … Block second job. Return existing job ID. Reuse existing dedup logic"

> §21: "QA: run 3 concurrent SAP jobs → all complete within timeout."

> §17: "Error Codes: 400 …, 409 (duplicate active job), 403 (permission)"

Four checkable mismatches:

1. 31, not 30. report-job.constant.ts:4 — MAX_DATE_RANGE_DAYS = 31, enforced at export-report-job.service.ts:314-318 with the English message "Date range cannot exceed 31 days". There is no "Maksimal rentang 30 hari" string in the backend. §10.1 ("Range ≤ 30 days inclusive"), FR-025, EH-002 and §22 all repeat the wrong number.

2. Sheets are not part of the dedup key. The real key is channel + createdBy + companyId + startDate + endDate (export-report-job.repository.ts findActiveDuplicateJob, schema index at export-report-job.schema.ts:96-104). Two SAP jobs differing only by sheet selection are indistinguishable to it — exactly the phase-2 B-11 problem.

3. Three concurrent jobs is impossible for one user. MAX_ACTIVE_JOBS_PER_CHANNEL = 1 (report-job.constant.ts:1, enforced export-report-job.service.ts:398-405 → "Too many active export jobs"). The QA step as written can only be run by three different users. There is also MAX_JOBS_PER_HOUR = 10 per user (:2, enforced :417-424) which §21 does not mention at all.

4. No 409 and no returned job ID. Both duplicate and active-limit paths throw GrpcBadRequestException → 400, and neither returns the existing job's id (the controller's @ApiResponse claiming 429 for "Too many active jobs" is itself wrong).

Suggested rewrite: change all "30 days" to 31 and quote the actual message (or specify the new Indonesian copy as an explicit FE change); state whether sheets must join the dedup key (it should, or the second submission is silently blocked); rewrite the §21 QA steps against MAX_ACTIVE_JOBS_PER_CHANNEL = 1 and add the 10/hour limit; correct §17's error codes to 400 or specify the 409 as a deliberate change.

---

Non-blocking Nits
1. Metadata block incomplete. §Feature/PM/Eng Lead/Design Lead only. The canonical template (prd/prd-global-search.md:3-10) also carries Link, Contributors, Version, TRD. All four advance-export PRDs share this gap — worth fixing once, consistently.

2. Sub-PRD A/B/C/D vocabulary vs phase-1..4 filenames. The body says "PRD-A/B/C/D" throughout (§2 Scope, FR-011/012, §12, Appendix F glossary) while the filename says phase-4. The downstream trd-, prompt/, .claude/plans/ and summary/ chain must reuse one slug. Recommend standardising on the phase numbering and keeping the letters only as a glossary alias.

3. §13 KPI "Median generation time ≤ 10 minutes" vs §20 "Alert if p95 > 10 min" — a p50 target and a p95 alert set to the same value; the alert will fire constantly if the median is at target.

4. FR-017 treats 0 as missing. "If duration value is null, undefined, or 0, the cell MUST display -" loses genuine zero durations, and diverges from shipped formatDuration which returns "00:00:00" for 0 and - only for null/undefined/negative (ticket-export.worker.ts:291). Recommend matching the existing behavior unless SAP explicitly wants - for zero.

5. FR-026 vs FR-027 contradiction. FR-026 [P0] "Filters MUST apply consistently across all selected sheets (same date range)"; FR-027 [P1] "Effective Hour and Raw AUX sheets MAY use a separate date range". One of these has to go (or FR-026 must be scoped to sheets 1–2).

6. FR-004 vs FR-042/043 contradiction. FR-004 [P0] "column definitions MUST be stored as a configuration constant … not in a database collection"; FR-042/043 [P1] require the same preset to live inside phase 2's exportcolumnregistry collection. Integrated mode needs a stated migration of the constant into the registry, or two sources of truth will drift.

7. §4 KR "Ship before full configurable column picker" is a schedule commitment, not a key result. It is also in tension with FR-042–FR-045 which describe the post-picker world.

8. EC-009 "both produce equivalent output" is untestable as worded — equivalent in columns, ordering, formatting, or bytes?

9. A.1 #8 and #11 map "Participants" and "Assign By" to the same assignee field, producing two identical columns. EC-004 confirms this is intentional; add a one-line note in A.1 so it doesn't get "fixed" as a bug during implementation.

10. A.1 #13 tribe and #14 typeComplaint exist only in phase 1's proposed ticketexportdata (prd-advance-export-phase-1…md:190-191); grep finds neither string anywhere in backend/. Phase 1 owes an upstream source for these before phase 4 can map them.

11. A.2 #14 diffTimeFirstAssignAndFirstResponseMs and #16 Handling Time are mapped to conversationexportdata, but phase 1 §10.1 does not define either field on that collection (only §10.2 ticket has the diff-time field). The "If field exists / May need computed field" hedges should become explicit change requests against phase 1.

12. OQ-D3(a) is answerable. conversationNumber does exist on the conversation domain object (conversation-service/src/app/constants/atlas-search-index.constant.ts:83,119; processors/inbound-message.processor.ts:373; surfaced by search at api-gateway/src/app/search/search.controller.ts:486). What's missing is that phase 1's conversationexportdata §10.1 omits it — so this is a one-field change request to phase 1, not an unknown.

13. OQ-D6 (Topic/Sub-Topic) is answerable. subTopic exists at conversation-service/src/app/schemas/conversation.schema.ts:90. The "ASSUMED" can become "CONFIRMED" with that citation.

14. §15 state names. DIPROSES / SELESAI / GAGAL / KEDALUWARSA are Indonesian display labels; the persisted enum is QUEUED | PROCESSING | COMPLETED | FAILED | EXPIRED. Also QUEUED is missing entirely from the table — jobs are created QUEUED and flipped to PROCESSING by EXPORT_REPORT_JOB_PROGRESS (processors/export-report-job.processor.ts:84-88).

15. NFR-004 "Job MUST be idempotent per job ID (reuse existing)" — the existing retry path is not idempotent-by-design, it is once-only: validateRetryRequest refuses any job with retryCount > 0 (export-report-job.service.ts:193-195). Worth stating that a SAP job gets exactly one retry.

16. EH-005 "Retry once, then mark job FAILED" conflicts with the above and with retryable semantics (a job that failed on invalid request is marked non-retryable). Specify which failures set retryable: false.

17. NFR-008 is correct and worth citing. 15-minute presigned expiry is real: media-service/src/constants/config.constant.ts:3,7 (PRESIGNED_URL_EXPIRE_MINUTES = 15). Same for the 7-day retention (report-job.constant.ts:5, EXPIRATION_DELAY_MS = 604800000, and SEVEN_DAYS_MS in the processor). Adding the file:line makes these verifiable.

18. File name convention diverges. PRD specifies SatuInbox_SAP_Report_{DD_MM_YYYY}.xlsx; every existing export uses <domain>-export-<ISO timestamp>.xlsx (ticket-export.service.ts:136, conversation-export.service.ts:119, broadcast-export.service.ts:134). Fine as a deliberate choice — just call it out so it isn't "fixed" to match.

19. US-007's "Template: SAP Report" column doesn't exist in the job list, which renders channel (TableOfflineReportColumn.tsx:146-150). Small FE addition, currently unstated in §9.

20. §9 "Offline Report Download page" — the actual surface is the Statistic page's Offline Report section (components/molecules/statistic/offline-reports/OfflineReportSection.tsx), opened via a ?create= search param. Naming it precisely will save the TRD a lookup.

21. §16 is written in Indonesian ("Tab hanya muncul jika…", "flag PKS — set manual oleh ops/CS…") while the rest of the document is English. Consistent with NFR-013's "All UI labels in Bahasa Indonesia" for copy, but this is spec prose, not copy.

22. Appendix C's library recommendation is redundant — date-fns ^4.1.0 and date-fns-tz ^3.2.0 are already dependencies (package.json:79-80), and the shipped formatters use neither (plain Intl). Recommend "reuse the existing Intl-based formatter" instead of naming luxon.

23. §19 "No PII in job record — only filters and metadata" is not quite right: parameters persists participants[] (user IDs) and is rendered in the job list's "Filter Data" column. Not customer PII, but it is personal data about staff.

24. EC-005 (custom attributes excluded) is correct for SAP but note the existing ticket export adds custom-attribute columns dynamically when ticketTypeId is set (ticket-export.service.ts:112, ticket-export.worker.ts:134-151). Worth an explicit "SAP preset MUST NOT collect custom headers" FR so the shared code path isn't reused wholesale.

25. §22 "File size can reach 47.5 MB … Acceptable for download" contradicts B-04 and EC-008's 500 MB. Once B-04 is resolved, these three numbers need to agree.

---

Open Questions For The Product Owner
Numbered continuing the PRD's own scheme so they can be pasted into Appendix D.

Gating the TRD (must be answered before technical design starts):

OQ-D7 — Which service generates the multi-sheet file? (B-01) Options: new orchestrator service; analytics-service reads PRD-A collections directly (needs its 256Mi limit raised — to what?); or per-domain sheet assembly. This determines the entire TRD structure.
OQ-D8 — ExcelJS or SheetJS? (B-02) Adopting exceljs is a new backend dependency and a decision with a memory/perf rationale; staying on SheetJS means accepting in-memory generation and answering OQ-D9 conservatively.
OQ-D9 — What is the real row cap per sheet? (B-03) 20,000 is enforced today with a thrown exception; the SAP reference is 169,000. Confirm the target and who owns raising the three *_EXPORT_LIMIT constants.
OQ-D10 — How does a 47.5 MB file reach S3? (B-04) The current gRPC media hop caps at 30 MB (and the media route at 20 MB). Direct-to-S3 upload from the generating service is the obvious answer but it is a new pattern and needs sign-off.
OQ-D11 — What is the job payload for a SAP export? (B-05) A fourth ExportReportChannelType value, a templateId field added to the contract, or something else. Phase 2 assumes templateId too, so this answer must be shared between the two PRDs.
OQ-D1b — Effective Hour source (re-scoped from OQ-D1). (B-11) No attendance/clock-in data exists. Choose: scheduled shift hours from member.shift + company Shift.intervals; derived first-to-last-activity; or defer Sheet 3. Sheet 4 (Raw AUX) is resolvable without this (agentauxintervals + a new per-interval RPC).
Product/policy decisions (needed before launch, not before TRD):

OQ-D12 — Who may export unmasked PII? (B-07) Should the SAP preset require privacy:view_full_email + privacy:view_full_phone, or genuinely override masking for anyone with the template? If the latter, this needs Legal/DPO sign-off, not a PRD footnote.
OQ-D13 — What is the entitlement mechanism? (B-08) company.subscriptionTier and company.features.sapExportEnabled do not exist. Should this be a payment-service entitlement on the subscription, or a new company-level feature-flag sub-document? Who sets it operationally?
OQ-D14 — Is Supervisor row scoping in or out? (B-09) No export path scopes below tenant today. Either fund the scoping work (and say which field defines "Team Inbox scope") or accept that Supervisors see all tenant rows and record it as a limitation.
OQ-D15 — What are the 8 unnamed columns? (B-10) 4 ticket + 4 conversation. Also: where can the team actually obtain SatuInbox_SAP_Report_31_07_2026.xlsx? The cited path does not exist in this repo.
OQ-D16 — Do sheets 3–4 block launch? (B-11) §12 says ship Sheets 1–2 first with 3–4 "coming soon"; FR-013/014 say P0; US-002 says all 4 pre-selected. Confirm the launch scope.
OQ-D17 — Is sheets part of the duplicate-job key? (B-12) Today a user has exactly one active job per channel and dedup ignores column/sheet selection, so a second SAP submission with different sheets is rejected outright.
OQ-D4 (existing, still open) — separate date range for Sheets 3–4. Note this currently contradicts FR-026; answering it resolves nit #5.
Cross-phase items the consolidator should route rather than fix here:

The templateId contract (OQ-D11) is shared with phase 2 (its B-04) — decide once.
The PII masking policy (OQ-D12) is shared with phase 2 (its B-02) and phase 3 (its live broadcast-export.service.ts:299 gap) — decide once.
Supervisor/team row scoping (OQ-D14) is asserted by phases 2, 3 and 4 and delivered by none — decide once, in phase 1.
Metrics/audit sink absence (B-08) is identical in all four PRDs.
The metadata-block gap and the Sub-PRD-letter vs phase-number slug conflict (nits 1–2) are set-wide.