VERDICT
NEEDS REVISION

The document is structurally complete and unusually thorough — all 16 house sections plus State Transition, Permission Matrix, API Contract, Migration, Data Lifecycle, Concurrency and Observability appendices. The shape is TRD-ready.

It is not content-ready. Three classes of defect block handoff:

1. Load-bearing claims about "existing" behavior are false. ExcelJS streaming, templateId, the "new" Jenis Laporan job-list column, company.subscriptionTier / company.features.sapExportEnabled, and a job audit trail are all cited as things to "reuse" or "stay backward compatible with". None of them exist in this repo. A tech lead writing the TRD would design against fiction.

2. The PII model is a silent regression, not a simplification. The PRD's "warning-only, no field-level RBAC" (OQ-19) replaces a shipped permission-driven masking mechanism, and the ticket-domain default preset silently drops two columns that ship today.

3. The three questions the task was written to answer — who owns the registry, what exactly is configurable, and what happens when a column disappears — are not answered anywhere in the document.

Roughly 6–8 hours of PM revision. No re-architecture needed; almost every blocking issue is a paragraph, not a redesign.

---

Blocking Issues
B-01 — ExcelJS streaming does not exist in this codebase; the current writer is in-memory SheetJS
Quoted, §12 Dependencies & Risks:

> "Use ExcelJS streaming workbook writer (already proven in existing export infra)."

Also FR-029, NFR-004, ASM-003, EC-001, Appendix L, Appendix N Glossary.

Verified false. backend/package.json:115 declares "xlsx": "^0.18.5" (SheetJS). There is no exceljs dependency anywhere in the repo. Every existing export builds the whole workbook in memory then serialises:

apps/ticket-service/src/app/workers/ticket-export.worker.ts:72,77,214 — XLSX.utils.book_new() → XLSX.utils.json_to_sheet(rows, …) → XLSX.write(workbook, {type:'buffer'})
apps/conversation-service/src/app/workers/conversation-export.worker.ts:51-60 — same pattern
apps/broadcast-service/src/app/services/broadcast-export.service.ts:124 — accumulates allRows.push(...) in a plain array
This is why the shipped exports are hard-capped at 20 000 rows (TICKET_EXPORT_LIMIT, CONVERSATION_EXPORT_LIMIT, BROADCAST_EXPORT_LIMIT all 20_000). Streaming isn't "proven" — it's absent, and the row cap is the current mitigation.

Suggested rewrite (§12, ASM-003):

> "XLSX generation currently uses SheetJS (xlsx ^0.18.5) with a full in-memory workbook and a hard 20 000-row cap per job (apps//src/app/constants/-export.constant.ts). Streaming write is a new capability this PRD requires, not an existing one. Engineering must decide: (a) adopt a streaming writer (ExcelJS WorkbookWriter or xlsx write-stream), or (b) retain the 20 000-row cap and add it to §11 as an explicit NFR and to §9 as user-facing copy. This is a prerequisite, not a mitigation."

Then add the missing NFR: the PRD currently states no maximum row count for a configurable export job.

---

B-02 — The PII model is a regression: field-level permission masking already ships
Quoted, Appendix F OQ-19 and Appendix H:

> "ASSUMED: warning-only with acknowledgment. Any Admin/Supervisor can select PII columns after confirming the PII dialog. RBAC field-level gating deferred to future enhancement."

> "PII Column Access: Warning-only model. … No field-level RBAC gating in Phase 1."

The product already does field-level RBAC on export PII, driven by two permissions:

apps/ticket-service/src/app/processors/export-job.processor.ts:79-86 — shouldMaskPii = !perms.includes('privacy:view_full_email') || !perms.includes('privacy:view_full_phone'), passed as maskPii into the export
apps/ticket-service/src/app/workers/ticket-export.worker.ts:177,180,182 — 'Customer Email': maskPii && email !== '-' ? maskEmail(email) : email, same for phone and 'Client (Contact)'
apps/broadcast-service/src/app/processors/export-job.processor.ts:72-80 — identical permission computation
apps/api-gateway/src/interceptors/privacy-masking.interceptor.ts:16-19 — global response masking on the same two permissions
libs/common/src/lib/enums/index.ts:28-30 — PrivacyVisibilityEnum { FULL, MASKED }
So today a user without privacy:view_full_phone gets a masked phone in a ticket export. Under this PRD they tick a checkbox and get the raw value. The word maskPii appears nowhere in the PRD.

Suggested rewrite (OQ-19 → new §7 Permission & PII Model numbered section, renumber the tail):

> "PII in configurable exports is governed by the existing privacy permissions privacy:view_full_email and privacy:view_full_phone (apps/api-gateway/src/interceptors/privacy-masking.interceptor.ts:16-19). The acknowledgment dialog is additive governance UX, not a replacement for masking. FR-0xx: when a requester lacks the relevant privacy permission, the corresponding PII column MUST be exported masked, exactly as the legacy path does today; the PII badge MUST indicate 'akan disamarkan' rather than a plain warning. Removing masking would be a privacy regression and is out of scope."

Until this is decided the whole of §6 Frontend — PII Confirmation, EH-006, EC-002 and Appendix H are unsafe to implement.

---

B-03 — contactName is simultaneously PII and in the "all non-PII" default preset
Quoted, FR-004:

> "System MUST flag PII fields (contactPhone, contactEmail, recipientNumber, recipientName, senderNumber, contactName) with isPII: true."

Appendix C.1 agrees: contactName … isPII true.

FR-058: "'Default' preset … includes all non-PII active columns."

Appendix B.1 "Default Conversation Preset (all non-PII fields)" lists contactName at row #2, and its PII exclusion list contains only contactPhone and contactEmail.

A seed script cannot satisfy both. This is not cosmetic: contactName in the default preset means every default conversation export triggers the PII confirmation dialog, which destroys the "100% of jobs containing PII columns require explicit acknowledgment" OKR as a signal (it becomes 100% of all jobs) and makes FR-059's silent pre-selection contradict FR-045's mandatory dialog.

Suggested rewrite: decide one way and propagate. Recommended — keep contactName as isPII: true (it is a customer's name, consistent with phase 1 FR-032 which scrubs contactName on erasure), remove it from Appendix B.1 row #2, and move it into B.1's PII opt-in table as P3.

---

B-04 — Backward compatibility is written against a templateId field that does not exist
Quoted, FR-023/FR-024:

> "System MUST support both creation paths in parallel: (a) legacy template-based (templateId) and (b) configurable column-based (columns[] + domainId). … When templateId is provided without columns[], system MUST use the legacy template path."

Also FR-022, FR-056, US-006 AC3 ("shows 'Template: Default Ticket' in parameters"), EC-008, §13 KPI ("check columns[] vs templateId").

There is no templateId anywhere in backend/. The real create payload is two fields:

proto/analytics.proto:76-80 — CreateReportJobRequest { string channel = 1; google.protobuf.Struct parameters = 2; common.UserContext userContext = 3; }
apps/api-gateway/src/app/analytics/dto/export-report-job.dto.ts:100-111 — channel: ExportReportChannelType + free-form parameters validated per-channel
libs/common/src/lib/enums/index.ts:1911-1915 — ExportReportChannelType { TICKET='ticket', CONVERSATION='conversation', BROADCAST='broadcast' }
The nearest thing to a "template" is TicketReportParamsDto.ticketTypeId (optional, apps/api-gateway/src/app/analytics/dto/export-parameter.dto.ts:20-27) plus the FE label "choose-template": "Pilih Template" / "default-ticket-template": "Template tiket default" (frontend/packages/i18n/src/translations/statistic/id.json:145-146). It selects a ticket type, not a column set.

Note also: channel already carries exactly the three values this PRD calls domainId. So the "legacy vs configurable" discriminator is not templateId vs columns[] — it is the presence of columns[] inside the existing parameters struct.

Suggested rewrite (FR-023/FR-024):

> "FR-023: the existing CreateReportJob payload (channel: ticket|conversation|broadcast, parameters: Struct) is retained. FR-024: the configurable path is selected when parameters.columns[] is present and non-empty; otherwise the legacy fixed-header path runs unchanged. channel serves as domainId — no new top-level field is introduced. There is no templateId in the current contract; §13's adoption KPI MUST be measured on presence of parameters.columns[]."

---

B-05 — The ticket default preset silently drops five columns that ship today, including two PII columns the PRD says don't exist
Appendix B.2 note:

> "Ticket domain has no direct PII fields in the exportdata collection (contact info is not stored in ticketexportdata per PRD-A §10.2). PII flag applies only if future schema additions include contact phone/email."

The shipped ticket export emits 24 fixed headers (apps/ticket-service/src/app/workers/ticket-export.worker.ts:35-61):

Ticket ID, Ticket Title, Client (Contact), Channel, Priority, Agent, Status, Sentiment, Inbox, Tag, Level, First Reply Time, Customer First Wait, Created Date, Closed Date, Updated Date, Customer Email, Customer Phone, Lifetime, SLA, Description, Last Reply By, Last Reply At, Last Reply Message

Cross-referencing Appendix C.2 (43 registry entries), these have no registry equivalent and no PRD-A §10.2 source field:

| Legacy ticket column | In registry C.2? | In PRD-A §10.2? |

|---|---|---|

| Customer Email | No | No |

| Customer Phone | No | No |

| Client (Contact) | No | No |

| Sentiment | No | No |

| Customer First Wait | No | No |

| Lifetime | No | No |

So the ticket-domain claim "no PII fields" is factually wrong about the product — the shipped ticket export includes Customer Email and Customer Phone (masked per B-02). Migrating a user to configurable export as specified is a data-loss migration: they lose six columns and gain no way to ask for them.

Suggested rewrite: add a Legacy Column → Registry Mapping table (new numbered section or Appendix P) covering all three domains, with an explicit disposition per legacy column: mapped / renamed / dropped, with rationale / requires PRD-A schema addition. Any column marked "requires PRD-A schema addition" is a phase-1 change request and must be raised against phase 1 before this PRD is approved.

The conversation-domain equivalent is partly handled (§15 admits the CA:/META: flattening difference) but Contact Identifier is unmapped too.

---

B-06 — Object-field handling is specified three mutually exclusive ways, and one of them breaks the column snapshot
Three statements, all normative:

FR-033: "For object fields (customAttributes, customFields, metadata), the pipeline MUST flatten or serialize as JSON string" — an unresolved or inside a MUST
EC-005 / EC-006: "at export time all keys are flattened" / "all keys are flattened into columns prefixed 'CF: '"
§15 Limitations + ASM-006: "exported as JSON strings, not flattened columns. CA:/META: prefix flattening from legacy template is not replicated"
These cannot all hold. It matters beyond tidiness: FR-016 stores "the full column snapshot (fieldPaths + displayNames + dataTypes) in the job parameter" at creation time, and FR-030 builds XLSX headers "using the registry snapshot stored at job creation time". If object fields flatten, the header set is only knowable after scanning the result rows — the snapshot cannot exist at creation time, and the job-list display (FR-055) cannot show the real columns.

For reference, the legacy flattening is real and bounded: apps/conversation-service/src/app/services/conversation-export.service.ts:127-141 discovers META: {key} and CA: {label} headers at query time, capped by MAX_DYNAMIC_COLUMNS = 50 (apps/conversation-service/src/app/constants/conversation-export.constant.ts:4).

Suggested rewrite: pick JSON-string serialisation (it preserves the creation-time snapshot invariant, and §15 already commits to it), delete the flattening language from EC-005/EC-006, resolve FR-033's or to a single MUST, and add to §15 the concrete consequence: "users migrating from the legacy conversation export lose the per-key CA:/META: columns; the legacy path remains available for that case."

If PM instead wants flattening, FR-016 and FR-030 must be rewritten to a two-phase header resolution and MAX_DYNAMIC_COLUMNS = 50 must be lifted into §11 as an NFR.

---

B-07 — Registry ownership, versioning, and custom columns are never specified (task evaluation point 2)
The task asks: who defines columns, where they live, how they are versioned, whether users can create custom/computed columns. The PRD answers only "where" (exportcolumnregistry in satuinbox_analytics, FR-001).

Who defines a column: unstated. ASM-002 says "manually seeded via migration script" — that's a mechanism, not an owner. There is no product owner, no request process, no admin UI, and no requirement that adding a column is a code change (which it is, and which contradicts PS-002's promise: "Adding new export columns requires code changes" is listed as the problem being solved, yet FR-001/ASM-002 preserve exactly that).
Versioning: entirely absent. The registry document (§10.2) has createdAt/updatedAt but no version, no deprecatedAt, no changelog. §15 admits "if PRD-A collection schema changes, registry must be manually updated" with no detection mechanism.
Custom / computed columns: isComputed is a system-set descriptive flag (FR-007). User-authored computed columns are neither offered nor listed in the §2 Out of Scope table nor in §14 Future Considerations. A reader cannot tell whether they were considered and rejected or simply forgotten.
Suggested rewrite: add a numbered Column Registry Governance section covering: owning role for registry content (PM or analytics eng?); the process to add/deprecate a column and its lead time; a registryVersion stamped onto every job's column snapshot so a job can be reproduced against the registry as it was; a deprecation lifecycle (isActive: false is a hard delete from the user's perspective today — see B-08); and an explicit line in §2 Out of Scope: "user-defined custom or computed columns — not in this phase."

Also fix PS-002, which currently promises the opposite of what FR-001/ASM-002 deliver.

---

B-08 — Column-lifecycle edge cases are missing or hostile (task evaluation point 4)
The task asks for: column removed after a saved config references it; renamed field; permission-restricted column visible to some roles only.

| Case | PRD coverage | Gap |

|---|---|---|

| Column deactivated between creation and processing | US-010, EH-011, Appendix L row 5 | Covered. Behavior is hard job failure — for one bad column out of 40, the user loses the whole export. No partial-export or skip-with-warning option is even discussed. |

| Column deactivated while referenced by a saved preset (US-011) | Absent | US-011 saves presets with no validation, no invalidation rule, no repair UX. The preset silently becomes a job that always fails. |

| Column deactivated while referenced by the localStorage remembered selection (FR-060) | Absent | Same failure, plus the user never explicitly chose it — FR-059 pre-selects it and submission fails with "Kolom tidak tersedia" for a column they didn't pick. |

| Source field renamed in PRD-A | Absent — nearest is EC-003 | EC-003: "Column registry entry exists but corresponding field is missing from analytics collection row (null in every row) → Column appears in XLSX with all cells showing '-'. No user-facing error." A rename therefore produces a silently all-empty column with no alert to anyone. Combined with B-07's lack of schema-drift detection, a PRD-A rename ships a broken export nobody notices. |

| displayName changed after a job's snapshot was taken | Implicitly fine (snapshot wins) | Not stated. Worth one line, because job-list (FR-055) then shows a stale name. |

| Permission-restricted column visible to some roles only | Explicitly deferred (OQ-19) | See B-02 — deferral is a regression, and the mechanism already exists. |

Suggested rewrite: add three user stories (preset invalidation, remembered-selection invalidation, source-field drift) with testable ACs; add an FR requiring a registry-vs-collection drift check to alarm rather than silently emit an empty column (ASM-002 already proposes a CI count comparison — promote it from an assumption to an FR and make it field-name-aware, not count-aware); and reconsider EH-011's all-or-nothing failure.

---

B-09 — §4 and §13 state contradictory adoption targets, and the file-size KPI is unmeasurable
§4 Objectives and Key Results:

> "100% of export jobs created after launch use the column picker (no more implicit template-only path)."

§13 Success Metrics:

> "Configurable export adoption rate | ≥ 80% of new export jobs use column picker (vs legacy template)"

And FR-022/023/024 mandate that the legacy path keeps working, while OQ-23 leaves deprecation open ("Both paths coexist indefinitely"). 100% is unreachable by the PRD's own design. Pick one number — 80% is the defensible one — and delete the 100% KR.

Second, both sections carry this:

> §4: "Median export file size decreases by ≥ 30% for jobs using fewer than full column sets."

> §13: "≥ 30% smaller than full-template export for same filters | Job metrics (file_size_bytes)"

This requires comparing each job against a counterfactual full-column export of the same filters that will never be run. As written it cannot be computed from file_size_bytes. Restate as something measurable, e.g. "median file_size_bytes per row for configurable jobs is ≥30% below the trailing-30-day median file_size_bytes per row of legacy jobs on the same domain", or drop it to a monitored metric rather than a KR.

---

B-10 — Filter requirements would regress existing filters, and one "new" filter already ships
FR-049:

> "Filter panel MUST retain all existing filters: date range (Start Date, Start Time, End Date, End Time with 30-day cap), status (dynamic by domain), employee/assignee, channel."

The actual per-domain parameter DTOs (apps/api-gateway/src/app/analytics/dto/export-parameter.dto.ts, mirrored in frontend/apps/omnichannel/validations/analytics/*.schema.ts):

Ticket: ticketTypeId, startDate, endDate, participants, stageTypes
Conversation: startDate, endDate, participants, excludeJunked, excludeSpam, statuses
Broadcast: channels, createdBy, startDate, endDate, statuses, teamIds
So FR-049's enumeration omits ticketTypeId, stageTypes, excludeJunked and excludeSpam — four shipped filters. "Retain all existing" plus an incomplete list is how filters get dropped in implementation.

And FR-051 says "System MUST add an 'Inbox/Team' multi-select filter", while §15 and EC-011 say broadcast has "only generic filters (date range, status only)". Broadcast already has teamIds and createdBy and channels.

Suggested rewrite: replace FR-049's prose list with a per-domain table of every current parameter and its disposition (retained / renamed / dropped), sourced from export-parameter.dto.ts. Correct FR-051 to "extend Inbox/Team filtering to the conversation and ticket domains (broadcast already supports teamIds)". Correct EC-011 and the §15 broadcast limitation row accordingly.

---

B-11 — The dedup requirement is unreachable behind the existing 1-active-job cap
Appendix L, row 1:

> "Dedup check: hash of {requesterId, domainId, sorted(columns[]), sorted(filters)}. If match found and existing job is QUEUED or PROCESSING, reject…"

Appendix L, row 4:

> "Active job limit … Reuse existing: max 1 active job per domain (channel) per user."

Row 4 is real: apps/analytics-service/src/app/constants/report-job.constant.ts:1 — MAX_ACTIVE_JOBS_PER_CHANNEL = 1, enforced at export-report-job.service.ts:398-405. With at most one active job per user per domain, a second submission is rejected as "Too many active export jobs" regardless of columns — the columns/filters terms in the hash can never decide anything. EH-012 and EC-012 inherit the same dead logic, and their user-facing copy ("Permintaan yang sama masih diproses") will never fire; the user sees the active-job-limit message instead.

Note the existing dedup index is narrower than the PRD assumes — {channel, companyId, createdBy, parameters.endDate, parameters.startDate} on active jobs only (apps/analytics-service/src/app/schemas/export-report-job.schema.ts:82-100).

Suggested rewrite: either delete the columns-aware dedup (redundant under a 1-job cap) and keep the existing behavior, or explicitly raise MAX_ACTIVE_JOBS_PER_CHANNEL and say so as a requirement with a new value. Also reconcile which of the two error strings the user actually sees.

---

B-12 — Subscription gating and the audit trail reference systems that do not exist
Appendix H, Subscription Tier Gating:

> "company.subscriptionTier = enterprise AND company.features.sapExportEnabled = true"

> "Server-side enforcement: CreateExportJob endpoint MUST check subscription tier + feature flags before accepting the job."

apps/company-service/src/app/schemas/company.schema.ts has no subscriptionTier and no features object. Subscription state lives in payment-service (apps/payment-service/src/app/schemas/subscription.schema.ts:82-85 — packageId, packageName; package-pricing.schema.ts — named packages with pricing tiers, not a Basic|Normal|Pro|Enterprise enum). There is no sapExportEnabled flag anywhere. The tier names in the table ("Basic, Normal, Pro, Enterprise") are not grounded in any enum in the repo.

Since this PRD gates nothing on tier (both its rows say "all tiers"), the cleanest fix is to delete the Subscription Tier Gating table from phase 2 entirely and let phase 4 own it — phase 4 is where the gate actually bites, and phase 4 repeats the same unverified fields (lines 217-221), so the correction belongs there too.

Audit trail — FR-048, NFR-008, NFR-011, Appendix K, Appendix M all require:

> "the PII acknowledgment is recorded in the job audit log" / "PII acknowledgment MUST be recorded in job audit trail with userId, timestamp, columns[]"

audit-service has exactly one schema — OpenApiRequestLog (apps/audit-service/src/app/schemas/open-api-request-log.schema.ts), TTL 90 days, fed by one publisher (apps/api-gateway/src/open-api-log/open-api-log.service.ts:32) for Open API traffic only. proto/audit.proto:9 declares rpc LogEvent(...) but nothing in the repo calls it. There is no general audit trail, and the export_job_created / export_job_downloaded audit events in Appendix M have no sink.

Suggested rewrite: state the dependency explicitly — "a general audit sink does not exist; audit-service today stores only Open API request logs and its LogEvent RPC has no callers. This PRD requires either (a) a first caller for AuditService.LogEvent with a new export-audit schema, or (b) storing the acknowledgment on the job document itself (parameters.piiAcknowledgedBy, parameters.piiAcknowledgedAt). Option (b) is scoped to the 7-day job retention and does not satisfy the 90-day retention asserted in Appendix K." Then pick one.

Related: Appendix M's 13 metrics and NFR-012/NFR-013 have no producer — the backend has no prom-client, no OpenTelemetry, no APM dependency (verified: backend/package.json), and the only /metrics reference is a route exclusion in apps/api-gateway/src/main.ts:97. This is the same finding as phase 1's B-03; state it once as a shared platform dependency rather than assuming it per-PRD.

---

Non-blocking Nits
1. Metadata block is missing four fields. Header has Feature / Product Manager / Engineering Lead / Design Lead. The canonical template (prd/prd-global-search.md:3-10) also carries Link, Contributors, Version, TRD. Same omission across all four advance-export PRDs.

2. Date-range cap is 31 days in code, not 30. §10.1 "Range ≤ 30 days inclusive", FR-049 "30-day cap", EH-005, and the api-gateway Swagger text all say 30. apps/analytics-service/src/app/constants/report-job.constant.ts:4 — MAX_DATE_RANGE_DAYS = 31, enforced at export-report-job.service.ts:312-317. Off-by-one; pick the real number.

3. FR-002's field counts contradict Appendices C and J. FR-002 says "37+", "46+", "27+" fields. Appendix C.1/C.2/C.3 contain exactly 33 / 43 / 24 entries, and Appendix J agrees ("~33 + ~43 + ~24 = ~100"). The registry-coverage KPI in §13 and the CI count check in ASM-002 both need one authoritative number.

4. EC-001 "80+ columns for ticket domain" — the ticket registry has 43 entries (C.2). The 80+ figure is unreachable unless object-flattening happens (see B-06), which §15 says it doesn't. Same for EC-009's ">50 columns" trigger and Appendix M's "Alert if median > 50".

5. 500 MB vs 512 MB conflates file size with process memory. EC-001 "file size exceeds safe threshold (500MB)"; Appendix L "memory exceeds threshold (ASSUMED: 512MB per worker)"; Appendix M "Alert if > 500MB". Three thresholds, two different quantities. With the current 20 000-row cap none of them is reachable.

6. "Renamed from 'Kanal' to 'Jenis Laporan'" is wrong about the current UI. §9 Domain Selector. The FE label is already report-type → "Tipe Laporan" (frontend/packages/i18n/src/translations/statistic/id.json:164), rendered as a tab set (useCreateReportModal.ts:25-29). Introducing "Jenis Laporan" (Appendix D) creates two Indonesian terms for one concept, which @satuinbox/eslint-config's hardcoded-string rule won't catch but reviewers will. Either keep "Tipe Laporan" or state that the i18n key is being renamed.

7. FR-054's "new" job-list column already exists. TableOfflineReportColumn.tsx:145-151 — accessorKey: 'channel', header: t('report-type'). FR-054 should read "retain and relabel", not "MUST display … as a new table column".

8. "Parameter Permintaan" is not an existing component. FR-055/FR-056/FR-057 and US-006 describe an expandable section. What ships is a single truncated cell rendering JSON.stringify(parameters) with a title tooltip, headed "Filter Data" (TableOfflineReportColumn.tsx:211-222, i18n key filter-data). The enhancement is fine — but it is net-new UI, not an enhancement of an expandable that exists, and the "backward compatible display" in FR-056/EC-008 has nothing to be compatible with.

9. Appendix I uses gRPC method names that don't exist. CreateExportJob and ListExportJobs. Actual (proto/analytics.proto:37-42, service ExportReportJobService): GetReportJobList, GetReportJobById, CreateReportJob, RetryReportJob. Appendix I.3's CreateExportJobRequest with fields 10-15 also doesn't match the real 3-field message. A TRD generated from Appendix I would not compile.

10. Appendix G lists a CANCELED state the product doesn't have. libs/common/src/lib/enums/index.ts:1917-1923 — ExportJobStatus { QUEUED, PROCESSING, COMPLETED, FAILED, EXPIRED }. Appendix G's own footer says "No new states introduced", then the table adds CANCELED (hedged as "if supported"). Delete the row or add cancellation as a real requirement. The table also omits the shipped one-shot retry (retryable, retryCount, validateRetryRequest at export-report-job.service.ts:180-195), which is a real FAILED → QUEUED transition.

11. Permission matrix is role-shaped; enforcement is permission-shaped. Appendix H rows are Admin / Supervisor / Agent. The endpoint guards on StatisticPermission.READ (apps/api-gateway/src/app/analytics/export-report-job.controller.ts:54,93), and list scoping keys off RoleTypeEnum.ADMIN || SUPER_ADMIN vs everyone-else-sees-own (apps/analytics-service/src/app/repositories/export-report-job.repository.ts:68,100). RoleTypeEnum has seven roles (libs/common/src/lib/enums/index.ts:14-22) — MANAGER, TEAM_LEAD, USER are unaddressed, and any role granted statistic:read can export regardless of what the matrix says. Restate the matrix in terms of statistic: and privacy: permissions. Related: StatisticPermission already has READ_OWN / READ_TEAM / ALL (libs/common/src/lib/constants/default-permission.constant.ts:131-137) which map neatly onto the scoping the PRD wants.

12. US-008 AC3 / EH-010 / EC-010 assume a Team Inbox row-scope that the export path doesn't implement. Nothing in export-report-job.service.ts or the three domain export services scopes rows by team inbox — only companyId/organizationId and the list-level own-vs-all rule. US-008 AC3 ("only rows within my scope are included") is not testable today.

13. §14 Future Considerations contradicts OQ-22. OQ-22 assumes XLSX column order = user selection order (so ordering is already user-controlled), while §14 lists "Column reordering in picker UI — allow drag-and-drop … to control XLSX column order" as a future want. Also, no FR states that columns[] array order is significant — US-007 AC1 and OQ-22 are the only places it appears. Add it to FR-012 or FR-018 explicitly, or an implementer will treat columns[] as a set.

14. FR-059 (P0) depends on FR-060 (P1). "Default preset MUST be pre-selected … (or has no remembered selection)" — the remembered-selection mechanism is P1 localStorage. A P0 requirement should not have a P1 dependency in its condition. Same for US-009 (P1) whose AC1 the P0 FR-059 references.

15. US-004 AC3 is hostile UX and conflicts with EH-006. "Given I decline the PII confirmation … Then the PII columns are deselected" (also FR-047). Cancelling a confirmation dialog destroying part of the user's selection is surprising; EH-006 meanwhile says the case is merely "Block submission". Recommend: cancel returns to the picker with selection intact and submission blocked.

16. Source References cite paths that don't exist in this repo. Appendix O points at Assessments/general/…, PRD/Analytics/…, Memory/global-memory.md, Memory/CLAUDE-be.md, Rules/prd-writing-rule.md. None of Assessments/, Memory/, Rules/, or PRD/ exist at the repo root. No citation in this PRD is followable. (Same defect in phases 1 and 3.)

17. "Sub-PRD A/B/C/D" vocabulary vs the phase-1..4 filenames. The body says "Sub-PRD B" throughout; the file is prd-advance-export-phase-2-…. The downstream trd-, prompt/, .claude/plans/ and summary- chain must reuse the slug advance-export-phase-2-column-registry-and-configurable. Recommend a one-line mapping note in §2 or a global find-replace to phase numbering.

18. Escaped-markdown artifacts throughout. The file is a Google-Docs export: \----- table rules, \\\ fences, \[P0\], \backticks\, §10.1\. trailing escapes. prd/prd-global-search.md` is clean markdown. Renders poorly in any viewer. Cosmetic but affects every reader. (All four advance-export PRDs share this.)

19. House-structure drift: seven substantive sections are buried in Appendix. State Transition Model (G), Permission Matrix (H), API/Event Contract (I), Migration & Rollout (J), Data Lifecycle & Retention (K), Concurrency/Rate Limit/Idempotency (L), Analytics & Observability (M) are all precedented as numbered sections in this repo's template. Filing them as appendix letters makes them look optional and makes FR/section cross-references harder. Recommend promoting and renumbering the tail. (Phase 1 has the same drift; fix consistently or not at all.)

20. PII field list is narrower than the data. FR-004 flags six identifier fields. Free-text columns that routinely carry PII are unflagged: lastMessageText, lastReplyMessage, description, remarks, messageContent, requestPayloadJson, attributesJson, plus the customAttributes / customFields / metadata blobs. Worth one line in §15 or the new PII section acknowledging that isPII covers structured identifiers only.

21. NFR-001's "cached after first load" has no cache invalidation rule. Appendix L specifies "in-memory cache with 5-minute TTL"; NFR-001 says <200ms p95 cached. Nothing says what happens to an in-flight picker when a registry entry is deactivated mid-TTL — a user can select a column the server has already deactivated and get EH-003 on submit. Acceptable, but state it.

22. Registry is declared tenant-agnostic (FR-006) while filter options are tenant-scoped (FR-052). Fine as designed, but a reader will wonder why the column list is global and the tag list isn't. One clarifying sentence in §2 or the Glossary.

---

Open Questions For The Product Owner
Ordered by blocking impact on the TRD.

OQ-P2-01 — PII masking vs acknowledgment (blocks TRD). Does the configurable export honour the existing privacy:view_full_email / privacy:view_full_phone masking (current shipped behavior on ticket and broadcast exports), or does the acknowledgment dialog replace it? "Replace" is a privacy regression and needs Legal sign-off, not a PM assumption. See B-02. Owner: PM + Legal.

OQ-P2-02 — Streaming writer or row cap (blocks TRD). Do we adopt a genuinely streaming XLSX writer, or keep the shipped 20 000-row-per-job cap and surface it in the UI? This determines whether EC-001, NFR-004, and the whole "large export" error family are real requirements or dead text. See B-01. Owner: Engineering Lead.

OQ-P2-03 — Object fields: flattened or JSON (blocks TRD). customAttributes / customFields / metadata: flatten to CA:/META:/CF: columns like the legacy path, or serialise as a JSON string? This decides whether the creation-time column snapshot (FR-016/FR-030) is even possible. See B-06. Owner: PM + Eng Lead.

OQ-P2-04 — Legacy column parity (blocks TRD). Six shipped ticket columns have no registry entry and no PRD-A source field: Customer Email, Customer Phone, Client (Contact), Sentiment, Customer First Wait, Lifetime. Do we (a) add them to PRD-A's ticketexportdata — a phase-1 change request, (b) accept the loss and document it, or (c) keep the legacy path permanently for these users? See B-05. Owner: PM.

OQ-P2-05 — Registry ownership and change process. Who is accountable for registry content? What is the lead time to add a column, and does the answer make PS-002 ("adding new export columns requires code changes") actually solved? Is there a registryVersion on the job snapshot for reproducibility? See B-07. Owner: PM + Eng Lead.

OQ-P2-06 — Is column renaming in scope? The task brief asks. The PRD offers no renaming, and does not list it as out of scope. Users exporting to downstream systems (SAP, phase 4) frequently need custom headers. Explicit yes/no, and if no, add it to §2 Out of Scope and §14. Owner: PM.

OQ-P2-07 — Per-user vs per-workspace configuration. Currently: system default preset (FR-058, global), remembered selection (FR-060, per-browser localStorage), saved presets (US-011, P2, per-account). No workspace-level default and no admin-curated preset except via §14. Is a workspace default needed for phase 2, and is per-browser (not per-account) memory acceptable? ASM-005 flags this for "UX review" that hasn't happened. Owner: PM + UX.

OQ-P2-08 — Where does the PII acknowledgment live, and for how long? No general audit sink exists (B-12). Options: new export-audit schema behind AuditService.LogEvent (90-day retention, matches Appendix K) or a field on the job document (7-day retention, contradicts Appendix K). Compliance needs to state the required retention before Engineering picks. Owner: PM + Legal.

OQ-P2-09 — Retention window vs export date range. Phase 1 sets a 90-day TTL on the analytics collections (assumed, PRD-A OQ-15) while this PRD caps a job at 30/31 days but places no floor on how far back the range may start. A user picking a 30-day window 120 days ago gets an empty file with no explanation (EC-007's "Laporan selesai tanpa data"). Should the date picker be bounded by the retention window, and who owns that copy? Owner: PM.

OQ-P2-10 — Failure granularity on a deactivated column. EH-011/US-010 fail the entire job if one selected column went inactive. For a 40-column export that is expensive. Is skip-the-column-and-annotate acceptable, or is all-or-nothing intentional? Owner: PM.

OQ-P2-11 — Does the aggregation/XLSX generation move into analytics-service? FR-017/FR-025 and Appendix I place the query and generation in analytics-service. Today analytics-service only orchestrates: it creates the job then RMQ-dispatches EXPORT_REPORT_JOB_PROCESS to conversation-service / ticket-service / broadcast-service, which each run their own worker thread and 20k cap (apps/analytics-service/src/app/services/export-report-job.service.ts:364-380). Moving generation into analytics-service is a real architectural change presented under "reuse existing export job infra" in §2. Confirm intent — it materially changes the TRD. Owner: Eng Lead. (Flagging as an open question rather than a blocking issue because the PRD's intent is defensible; it just isn't stated.)

OQ-P2-12 — Deprecation timeline for the legacy path (OQ-23, still open in the doc). "Coexist indefinitely" plus a 100% adoption KR (B-09) cannot both hold. A date or a trigger condition would let §13 be written honestly. Owner: PM.

---

What is genuinely good (so revision doesn't over-correct)
Appendix C's three cross-reference tables mapping every PRD-A field to a registry entry with dataType / category / isPII / isComputed are the strongest artefact in the set. A seed script can be written straight from them, and the Excluded from registry footers are exactly the right level of explicitness.
Appendix J's four-stage rollout behind ENABLE_CONFIGURABLE_EXPORT with per-stage validation and rollback is well-formed, and the shadow-mode first stage is the right call.
FR-012 → FR-018 (payload, validation, snapshot, projection) is a clean, traceable chain a TRD can implement without interpretation, once B-04's templateId is corrected.
Appendix D's UI copy table means the i18n keys can be created in one pass.
Double validation at creation and processing time (NFR-006) is the right instinct for a registry that can drift.
The Assumptions table (Appendix E) correctly separates assumptions from requirements — the problem is that ASM-003 and ASM-004 assumed things that are checkable and turn out false, not that the section is misconceived.
---

Recommended path
1. PM resolves OQ-P2-01 through OQ-P2-04 (the four TRD-blocking decisions) — these can be answered without new research.

2. PM applies B-01, B-03, B-04, B-05, B-09, B-10, B-11, B-12 as edits in place, adding a v1.1 row to the §1 Revision History.

3. PM adds the two missing sections from B-07 (Registry Governance) and B-08 (column lifecycle stories).

4. Re-review, then hand to technical-analyst for trd/trd-advance-export-phase-2-column-registry-and-configurable.md.

Note on sequencing: phase 1's review (t_83fba021) returned NEEDS REVISION with ten blocking issues, three of which invalidate premises this PRD depends on entirely — the 18 assumed RabbitMQ lifecycle events don't exist, secondary-read backfill is unroutable, and the 2% latency guard has no metrics producer. Phase 2 reads from collections phase 1 has not established. Even a fully corrected phase 2 PRD cannot be implemented until phase 1's blockers are resolved, and phase 2's §12/§15/ASM-001 correctly identify this as blocking for production use. Recommend the orchestrator sequence the TRDs accordingly rather than issuing them in parallel.