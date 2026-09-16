VERDICT: STILL NEEDS REVISION
The 12 blocking issues are in good shape — 9 CLOSED, 3 PARTIALLY CLOSED, none regressed. The revision is honest and materially better than v1.0.

It is not TRD-ready, however, because the revision surfaced 6 new blocking issues, four of which are cross-phase contract breaks that a TRD author cannot resolve alone:

phase 2 never consumes exportdatacoverage, which phase 1 v2.1 FR-036 makes mandatory for every export consumer;
the registry schema (Appendix A) cannot represent phase 3's granularity discriminator, and its unique index actively forbids it;
every ObjectId/ObjectId[] column in phase 1 is typed string/array in phase 2 and projected raw — the configurable export would emit hex ids where the legacy export emits agent names;
§10.1's parameters.* keys are stated as a Struct extension but the api-gateway DTO rejects every one of them today, and the DTO change is never stated;
D4 (phase 2 OWNS row-level permission scoping) is contradicted in five places.
Estimated PM effort: 3–5 hours. All six are paragraph/table-level edits plus one new FR+AC block for D4. No redesign.

---

1. Closure Table — B-01 … B-12
| ID | Status | Evidence in v2.0 | Verified against code |

|---|---|---|---|

| B-01 streaming XLSX "already proven" | CLOSED | §12: "XLSX writer: current is SheetJS in-memory (xlsx ^0.18.5), capped at 20,000 rows per job… Streaming write (ExcelJS WorkbookWriter or xlsx write-stream) is NEW capability, not existing." NFR-004 sets the 20 000 cap; §14 lists the streaming writer as Future; §15 + §24 + EC-001 consistent. No "already proven" text survives. | backend/package.json:115 = "xlsx": "^0.18.5"; no exceljs anywhere. apps/ticket-service/src/app/constants/ticket.constant.ts:15 TICKET_EXPORT_LIMIT = 20_000; apps/conversation-service/src/app/constants/conversation-export.constant.ts:1; apps/broadcast-service/src/app/constants/broadcast-export.constant.ts:2 — all 20 000. ticket-export.worker.ts:71-81 in-memory book_new → XLSX.write(..., {type:'buffer'}). D3 respected: no 200 000-row or exceljs-path claim anywhere in phase 2. Residual: §12 still frames this as "Decision required: (a) adopt streaming, or (b) retain cap" while NFR-004/§14/§15/§24 have already decided (b). Restate §12 as "decided: (b); (a) deferred to §14." |

| B-02 PII model regression | CLOSED | FR-062: "Configurable export HONOURS existing privacy:view_full_email and privacy:view_full_phone masking permissions… The PII acknowledgment dialog is ADDITIVE governance UX, not a replacement for masking." FR-061 names the masked columns. OQ-19 resolved "masking + acknowledgment". §18 "PII Column Access" and §15 agree. | apps/ticket-service/src/app/processors/export-job.processor.ts:77-81 and apps/broadcast-service/src/app/processors/export-job.processor.ts:71-74 — identical shouldMaskPii = !perms.includes('privacy:view_full_email') \|\| !perms.includes('privacy:view_full_phone'). libs/common/src/lib/constants/default-permission.constant.ts:190-191; libs/common/src/lib/enums/index.ts:96-97. D2 satisfied — see N-2 for a defect inside the now-correct model. |

| B-03 contactName PII vs Default preset | CLOSED | Contradiction gone in both places. §6/FR-004: "Conversation domain: contactPhone, contactEmail, contactName." Appendix C.1 line 493: contactName isPII true. Appendix B.1 main list = 29 rows, contactName absent; it appears only in B.1's "PII fields (excluded from Default, available opt-in)" table as P1. | n/a (internal consistency). New nit: B.1's non-PII list is 29 rows but C.1 has 33 entries of which 3 are PII → 30 non-PII. contactId is in C.1 (isPII false) and missing from B.1, so FR-058 ("Default = all non-PII active columns") is off by one. |

| B-04 fictional templateId | PARTIALLY CLOSED | Contract text is now correct: FR-022 "Existing CreateReportJob payload contract retained: channel + parameters (Struct) + userContext. No new top-level fields introduced." FR-023 columns-presence discriminator; FR-024 "channel serves as domain identifier — no new domainId top-level field." §20.3 quotes the real proto message. templateId occurs zero times outside the revision note. D1 satisfied. | proto/analytics.proto:39-42 (ExportReportJobService: GetReportJobList / GetReportJobById / CreateReportJob / RetryReportJob) and :76-80 (CreateReportJobRequest{channel, parameters, userContext}) — §20.3's quote is exact. libs/common/src/lib/enums/index.ts:1917-1923 ExportJobStatus — §17's five states are exact. Gap → see N-1: the §20.2 parameter extension is stated at the proto/Struct layer only; the api-gateway DTO that actually validates it is never mentioned. |

| B-05 6 dropped ticket columns | PARTIALLY CLOSED | §19.1 now maps all 24 shipped headers. The six are marked, each: "Requires registry entry + PRD-A §10.2 schema addition." §19 Summary names all six. B.2 PII table adds customerEmail/customerPhone/clientContact as P1–P3 with the same note. §19.2 covers conversation, §19.3 broadcast. | Legacy headers confirmed: apps/ticket-service/src/app/workers/ticket-export.worker.ts:35-61 (24 headers) and :174-199. Phase 1 v2.1 §10.2 carries none of the six — I extracted all 51 rows of §10.2: no customerEmail, customerPhone, clientContact, sentiment, customerFirstWait, lifetime. So the disposition is honest but the phase-1 change request it implies has not been raised into phase 1 v2.1, and FR-002 ("registry MUST populate entries for all fields in ticketexportdata — 43 fields") + C.2 (exactly 43, none of the six) contradict FR-004, which mandates isPII: true on three fieldPaths that have no registry entry and no source. Also over-stated: Lifetime needs no schema addition — calculateLifetime(createdAt, closedAt, updatedAt) (ticket-export.worker.ts:330-341) is computable from fields phase 1 already carries; and Sentiment / Customer First Wait / Level are hardcoded '-' in production today (:181,189,192), i.e. they are dead columns, not lost data. Fix: split §19.1's disposition into derivable-from-phase-1 (Lifetime), never-populated-today (Sentiment, Customer First Wait), and genuine phase-1 CR (Customer Email, Customer Phone, Client (Contact)); then file the CR against phase 1 and reconcile FR-002/FR-004/C.2. |

| B-06 object fields: flatten vs JSON | CLOSED | Resolved to JSON string and consistent. FR-033: "the pipeline MUST serialize as JSON string. No flattening." EC-005 / EC-006 both "not flattened". §15 and ASM-006 agree. §19.2: "Legacy flattening stays on legacy path." No surviving normative "flatten" instruction. | apps/conversation-service/src/app/services/conversation-export.service.ts CA:/META: discovery remains legacy-only — consistent with §19.2. Nit: FR-036 restates the rule for remarks/rawEvent, but rawEvent is on C.1/C.2/C.3's "Excluded from registry" line, so FR-036 half-references a non-selectable field. Merge FR-036 into FR-033. |

| B-07 registry governance | CLOSED | New §21 Column Registry Governance: 21.1 ownership table (registry content = Analytics Engineer; schema changes = PRD-A eng; request process PM → Analytics Engineer, lead time 1 sprint; deprecation = PM). FR-063 registryVersion (semver) on every job snapshot. FR-064 field-name-aware drift check with alarm. §2 Out of Scope now carries "User-defined custom or computed columns (not in this phase)". PS-002 softened to "Not fully code-free, but decoupled." | n/a (process/spec). |

| B-08 column-lifecycle edge cases | CLOSED | US-010 hard-failure → skip-with-warning; US-012 deactivated-in-saved-preset with "Tidak Tersedia" badge + remove; US-013 localStorage auto-remove. FR-065 (skip + "Kolom [displayName] tidak tersedia dan dilewati."), FR-066 (snapshot displayName immutable). EH-011 matches. | n/a. Residual (pre-existing): EC-003 still ends "No user-facing error" for a registry entry whose field is all-null. FR-064 catches renames at CI/startup, which is the material fix, but EC-003 should cross-reference FR-064 so the "silent empty column" reading doesn't survive. |

| B-09 100% vs 80% adoption + unmeasurable file-size KR | CLOSED | §4 KR: "≥ 80% of new export jobs created after launch use column picker (parameters.columns[] present)". §13 identical. OQ-23: "100% adoption KR is unreachable by design — 80% target set instead." File-size KR restated measurably in both §4 and §13 as per-row file_size_bytes vs trailing-30-day legacy median, and explicitly demoted: "Monitored metric, not KR." | Surviving 100% occurrences are all non-adoption and legitimate: PII-ack coverage (§4, §13) and registry field coverage (§4, §13). No contradiction. |

| B-10 filter disposition | CLOSED | New §6.1 Filter Panel Per-Domain Disposition, authoritative per domain. FR-051 corrected to "extend Inbox/Team filtering to conversation and ticket domains (broadcast already supports teamIds per existing BroadcastReportParamsDto)". EC-011 lists broadcast's real filters. | Verified field-by-field against apps/api-gateway/src/app/analytics/dto/export-parameter.dto.ts: Ticket (:20-68) = ticketTypeId, startDate, endDate, participants, stageTypes ✓; Conversation (:74-126) = startDate, endDate, participants, excludeJunked, excludeSpam, statuses ✓; Broadcast (:132-186) = channels, startDate, endDate, statuses, teamIds (:177), createdBy ✓. §6.1 matches the DTOs exactly. MAX_DATE_RANGE_DAYS = 31 cited correctly (apps/analytics-service/src/app/constants/report-job.constant.ts:4) — the v1.0 "30 days" nit is fixed. |

| B-11 unreachable columns-hash dedup | CLOSED | Dedup hash deleted. §24 has only the real mechanism: "MAX_ACTIVE_JOBS_PER_CHANNEL = 1 per user per domain… Second submission rejected with 'Too many active export jobs'." Double-click handled by the same cap; rate limit 10/hr. EH-012 and EC-012 both use the active-job-limit copy. | report-job.constant.ts:1 MAX_ACTIVE_JOBS_PER_CHANNEL = 1, :2 MAX_JOBS_PER_HOUR = 10 — both figures correct. Nit: FR-028 still says "$project stage that selects ONLY the fields in columns[] plus internal fields needed for dedup" — a stray survivor of the deleted concept. Reword to "plus internal fields needed for tenant scoping". |

| B-12 subscription gating + audit sink | CLOSED | subscriptionTier and sapExportEnabled occur zero times in v2.0 (only the revision note mentions their deletion). Ack moved onto the job doc: FR-048 parameters.piiAcknowledgedBy / piiAcknowledgedAt, NFR-008 7-day lifecycle, §23 row, and §14 keeps the honest note "90-day audit retention for PII acknowledgments — Requires audit-service schema extension (future enhancement)." No audit-service dependency is asserted as existing. NFR-012 states log-based monitoring, no APM. | Consistent with the shipped reality (no subscriptionTier/features on company schema; AuditService.LogEvent has no callers; no prom-client/OTel in backend/package.json). |

---

2. New Issues Introduced by / Surviving v2.0
N-1 [BLOCKING] §20.2's parameter extension is stated at the proto layer but rejected by the api-gateway DTO, and the DTO change is never stated
§20.2 adds to parameters: columns[], tags[], inboxIds[], teamIds[], piiAcknowledged, piiAcknowledgedBy, piiAcknowledgedAt, and calls the change "Backward compatible: columns[] is optional."

It is not, as currently configured. apps/api-gateway/src/app/analytics/dto/export-report-job.dto.ts:62-66:

ts
const dtoInstance = plainToInstance(dtoClassRef, parameters);
const errors = validateSync(dtoInstance as object, {
  forbidNonWhitelisted: true,
  whitelist: true,
});
Every key not declared on TicketReportParamsDto / ConversationReportParamsDto / BroadcastReportParamsDto is a validation failure, not a silently-stripped extra. Against today's DTOs (export-parameter.dto.ts:20-186):

| §20.2 key | Ticket | Conversation | Broadcast |

|---|---|---|---|

| columns[] | rejected | rejected | rejected |

| tags[] | rejected | rejected | rejected |

| inboxIds[] | rejected | rejected | rejected |

| teamIds[] | rejected | rejected | accepted (:177) |

| piiAcknowledged / …By / …At | rejected | rejected | rejected |

The PRD's only reference to this file is §6.1's filter-list citation and §27's source row. The DTO extension is assumed, not stated — which is precisely the failure mode B-04 was raised for.

Suggested rewrite (new row in §20.2, or a §20.6):

> "apps/api-gateway/src/app/analytics/dto/export-parameter.dto.ts — all three per-domain params DTOs MUST be extended with columns?: string[], tags?: string[], inboxIds?: string[], teamIds?: string[] (ticket + conversation only; broadcast already has it), piiAcknowledged?: boolean, piiAcknowledgedBy?: string, piiAcknowledgedAt?: string. Without this, ValidateDynamicParametersConstraint (export-report-job.dto.ts:62-66, {whitelist: true, forbidNonWhitelisted: true}) rejects every configurable job at the gateway before it reaches analytics-service. This is required work, not a free-form Struct passthrough."

Related, same file: §10.1 specifies parameters.dateRange.start / parameters.dateRange.end as a nested object with +07:00 offsets, while every shipped DTO uses flat startDate / endDate strings behind @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/) (export-parameter.dto.ts:35-49, 82-91, 149-158) — a Z-suffixed ISO string, not an offset. Either align §10.1 to startDate/endDate + …sssZ or state the DTO/regex change explicitly.

N-2 [BLOCKING] FR-061 masks contactName and clientContact with maskPhone(), which produces an empty string for a name
FR-061:

> "…PII columns (contactPhone, recipientNumber, senderNumber, contactName, clientContact) MUST be exported masked using maskPhone() from the common library."

maskPhone() (libs/common/src/lib/utils/privacy.utils.ts:194-256) strips to digits: const digits = numberPart.replace(/\D/g, ''), then if (digits.length === 0) return countryCode.trim();. For "Budi Santoso" there is no +, no leading 62/0, so countryCode = '' → the function returns ''. Every masked contactName cell would be blank, not masked.

This faithfully mirrors a live defect — ticket-export.worker.ts:177 'Client (Contact)': maskPii ? maskPhone(displayName) ?? displayName : displayName has the same bug (the ?? displayName fallback never fires because '' is not nullish) — but a PRD should not import it as a requirement.

Suggested rewrite: split FR-061 into (a) phone-shaped fields (contactPhone, recipientNumber, senderNumber) → maskPhone(); (b) email fields (contactEmail, customerEmail) → maskEmail(); (c) name fields (contactName, clientContact, recipientName) → no maskPhone(); specify either a new maskName() (first token + ***) or leave unmasked and rely on the acknowledgment record, and state which. Note the legacy defect explicitly so it is fixed rather than replicated.

N-3 [BLOCKING] Phase 2 never consumes exportdatacoverage — phase 1 v2.1 FR-036 makes this mandatory
Phase 1 v2.1 FR-036:

> "System MUST maintain an exportdatacoverage document per {companyId, organizationId, collection, date}… Export consumers MUST read coverage before querying rows and MUST fail with DATA_NOT_READY when any requested date is not COMPLETE."

Phase 1 EH-010 adds DATA_EXPIRED for pre-retention dates and says "No UI — error propagated to export consumer." Phase 2 is that consumer.

Phase 2 v2.0 contains zero occurrences of exportdatacoverage, DATA_NOT_READY, or DATA_EXPIRED. FR-025/FR-026 go straight to $match on the data collection. §7 Error Handling has no row for either code, §9 has no user-facing copy, §17's state table has no QUEUED→FAILED transition for them.

Suggested rewrite: add FR-0xx [P0]: Before executing the query pipeline, the system MUST read exportdatacoverage for every date in the requested range (PRD-A FR-036). If any date is not COMPLETE, the job MUST fail with DATA_NOT_READY; if any date precedes retention, with DATA_EXPIRED. Plus EH rows and Bahasa copy (e.g. "Data untuk rentang tanggal ini belum siap. Coba lagi nanti." / "Data untuk rentang tanggal ini sudah melewati masa simpan."), and the corresponding §17 transitions.

N-4 [BLOCKING] ObjectId-typed columns are typed string/array and projected raw — the export would emit hex ids where legacy emits names
Phase 1 v2.1 §10.1/§10.2/§10.3 declare these as ObjectId or ObjectId[]: contactId, platformId, assignedTo, participants, closedBy, inboxId, teamId (conversation); ticketId, assignee, createdBy, closedBy, platformId, inboxId, teamId (ticket); batchId (broadcast).

Phase 2 C.1/C.2/C.3 type all of them string or array, and the projection rules are literal: FR-031 "direct field path projection", FR-032 "join array elements with ', ' separator". There is no $lookup, no name-resolution FR, and no dataType: "objectId" in Appendix A's dataType enum (string, number, boolean, date, datetime, duration, array, object, enum).

The shipped export resolves these to human names — formatParticipants() (ticket-export.worker.ts:266-271) returns p.fullName || p.username || p.userId, and Inbox: doc.team?.name. So a user selecting "Ditugaskan Ke" in the configurable picker would get 64a1b2c3d4e5f6a7b8c9d0e6, 64a1… instead of Budi, Sari. This is a silent quality regression on the epic's headline feature, and it is exactly the kind of string-vs-ObjectId mismatch the consolidated review flagged as P1-4 for phase 1.

Suggested rewrite: add objectId to Appendix A's dataType enum; correct C.1/C.2/C.3 types; and add FR-0xx [P0]: For objectId / objectId[] columns the pipeline MUST emit the human-readable denormalised value where phase 1 carries one (inboxName, creatorName, batchName), and otherwise MUST resolve display names via … — naming the resolution mechanism. If the decision is "emit raw ids", say so in §15 as an explicit, accepted difference from the legacy export.

N-5 [BLOCKING] Appendix A's registry schema cannot represent phase 3's granularity discriminator — and its unique index forbids it
Phase 3 v2.0 FR-030:

> "System MUST register campaign-level computed columns di exportcolumnregistry dengan domainId = broadcast dan granularity = campaign discriminator."

Phase 2 Appendix A's document shape has no granularity field, and the unique index is { domainId: 1, fieldPath: 1 }. Phase 3 FR-031's 22 campaign columns include batchId, batchName, broadcastChannel, source, createdAt, scheduledAt, creatorUserId, creatorName, teamInboxIdAtSendTime, teamInboxNameAtSendTime, senderAccountName, templateUsed — every one of which also exists at recipient level. Under {domainId, fieldPath} unique, the campaign rows cannot be inserted at all.

Phase 3 §15 already flags the dependency on phase 2's side: "Granularity column picker mengandalkan registry schema extension (granularity discriminator). Sampai PRD-B registry mendukung discriminator ini…" — phase 2 v2.0 does not answer it. granularity appears in phase 2 only in OQ-15, where it is used in an unrelated sense ("per-field or per-computed-metric").

Related, same seam: phase 3 FR-029 requires the query builder to "switch ke aggregation pipeline mode (group + project)" for campaign granularity, and FR-004 requires "aggregate computed columns yang tidak ada di collection". Phase 2's FR-025 builds $match + $project only, and its isComputed flag is defined as sync-time derivation (§10.2: "field is derived at sync time, not directly from event payload"), which cannot describe a query-time $group aggregate.

Suggested rewrite: add granularity: "recipient" | "campaign" (default "recipient") to Appendix A and §10.2; change the unique index to { domainId: 1, granularity: 1, fieldPath: 1 }; extend the primary query index the same way; add one line to FR-008 that GetColumnRegistry accepts an optional granularity; and add a §14 or §2 line stating that query-time aggregate columns are a phase-3 extension of the query builder, naming the contract.

N-6 [BLOCKING] D4 (phase 2 OWNS row-level permission scoping) is contradicted in five places
§10.1 requires it three times — parameters.assignedTo, parameters.inboxIds, parameters.teamIds all carry "Must be within requester permission scope." But there is no FR or AC that implements it, and five passages explicitly disclaim it:

US-008 AC3: "Note: row-level Team Inbox scoping within a single export job (filtering exported rows by team membership) is NOT implemented in the current export path — this is a known gap. Future enhancement required."
§15 Limitations: "Row-level Team Inbox scoping within export data is not implemented."
§18 Permission Model: "Row-level Team Inbox scoping within export data is NOT implemented (see US-008 AC3 — known gap)."
EC-010: "Row-level team scoping within export data is not implemented."
FR-052 [P1] scopes only the filter option values, not the exported rows, and carries no AC.
FR-026 makes the scoping surface explicit and exhaustive: "Pipeline MUST include a $match stage with {companyId, organizationId} scoping as the first filter stage." Under the settled epic decision D4, phase 1 does not deliver row-level scoping and phase 2 owns it — so "known gap, future enhancement" is not an available disposition here.

Code confirms the gap is real and is only list-level today: apps/analytics-service/src/app/repositories/export-report-job.repository.ts:67-71 and :99-103 — isAdmin = role === ADMIN || SUPER_ADMIN; if (!isAdmin && userId) filter.createdBy = … (which jobs you can see, not which rows land in the file). The primitives exist unused: StatisticPermission.READ_OWN / READ_TEAM / ALL (libs/common/src/lib/constants/default-permission.constant.ts:131-137 — §18's citation is exact) and PermissionActionEnum.READ_OWN/READ_TEAM (libs/common/src/lib/enums/index.ts:46-48).

Suggested rewrite: add a P0 FR block, e.g.

> FR-0xx [P0]: The $match stage MUST append a row-scope predicate derived from the requester's StatisticPermission scope: READ_ALL → no additional predicate; READ_TEAM → { teamId: { $in: <requester team ids> } }; READ_OWN → { $or: [{assignedTo: <userId>}, {assignee: <userId>}, {participants: <userId>}, {createdBy: <userId>}] } (per domain).

> FR-0xx [P0]: Requested assignedTo / inboxIds / teamIds values outside the requester's scope MUST be rejected at job creation (INVALID_SCOPE), not silently dropped.

…plus a US-008 AC that is testable (Supervisor exports; rows outside their team are absent), an EH row for INVALID_SCOPE, and deletion of the five "not implemented / known gap" disclaimers. Note phase 3 FR-012/FR-013 also say "dalam permission scope requester" and will inherit whatever phase 2 specifies.

---

3. Residual Open Questions That Would Block a TRD Author
1. Which service executes the configurable pipeline and writes the XLSX? (D5) Phase 2 never says. §20.1 makes analytics-service the producer of GetColumnRegistry; §23 says the generated XLSX is owned by "analytics-service → S3"; but §12/ASM-003/§27 cite ticket-export.worker.ts (a ticket-service worker thread) as the writer, and FR-017 only says "read from the corresponding PRD-A analytics collection". Today the real topology is fan-out: analytics-service creates the job row and RMQ-dispatches per channel to ticket/conversation/broadcast-service, each generating its own file. D5 says analytics-service reads the phase-1 collections directly with no export-worker. Add one FR naming the generating service and stating that the per-channel RMQ fan-out is bypassed for the configurable path — otherwise the TRD author invents a topology.

2. N-4's resolution — raw ObjectIds or resolved display names. Materially changes the pipeline (projection vs $lookup) and the phase-1 contract.

3. N-5's registry schema — must be settled in phase 2, before phase 3's TRD, not during it.

4. B-05's three genuine phase-1 CRs (customerEmail, customerPhone, clientContact on ticketexportdata) — is phase 1 growing them, or is ticket configurable export shipping without contact columns and the legacy path staying permanently for those users? Phase 1 v2.1 is already published without them.

5. N-2's masking function for name fields — needs a named function or an explicit "unmasked, ack-recorded" decision; this is a Legal-visible choice.

6. §12's (a)/(b) streaming decision is presented as open while four other sections treat (b) as settled. One-line fix, but a TRD author reading §12 first will think it's live.

---

4. Cross-Phase Consistency Findings
Does phase 2 consume exactly what phase 1 v2.1 produces?
I extracted every field row from phase 1 v2.1 §10.1/§10.2/§10.3 and diffed against phase 2's C.1/C.2/C.3.

| Domain | Phase 1 §10.x (minus internals) | Phase 2 registry | Diff |

|---|---|---|---|

| Conversation | 33 | 33 (C.1) | exact match, both directions |

| Ticket | 43 | 43 (C.2) | exact match, both directions |

| Broadcast | 26 | 24 (C.3) | batchId and batchName missing from phase 2 |

Field names: clean. Every phase-2 fieldPath exists in phase 1 v2.1 and vice-versa, except the two below. The §22 seed target ("33 + 43 + 24 = 100 entries") is arithmetically consistent with C.1–C.3 but is 2 short of phase 1's broadcast schema.
batchId / batchName [BLOCKING]: phase 1 v2.1 added these specifically to enable campaign aggregation (§10.3:244, and v2.1's revision note (b): "added batchId (campaign key = BroadcastBatch._id)… enabling PRD-C campaign-level $group"). Phase 2 C.3 omits both, and its "Excluded from registry" line lists only _id, companyId, organizationId, sourceUpdatedAt, rawEvent, syncedAt — so the omission is unexplained, not deliberate. Phase 3 FR-003 requires recipient-level columns to map 1:1 to §10.3 "semua fields termasuk batchId, batchName", and FR-023 requires campaign rows to carry batchName from BroadcastBatch.name. Add batchId (Informasi Dasar, isPII false) and batchName (Informasi Dasar, isPII false) to C.3 and B.3; update §22's expected count 24 → 26 and 100 → 102. (rowKey is correctly excluded as internal.)
ObjectId types: mismatched — see N-4.
exportdatacoverage: not consumed — see N-3.
12-value BroadcastStatusEnum: no conflict. Phase 2 C.3 types status as generic enum and §6.1 reuses the existing broadcast statuses filter, which is already @IsEnum(BroadcastStatusEnum, {each:true}) (export-parameter.dto.ts:168) — the full 12-value vocabulary. Phase 2 never enumerates a competing list, and the display↔backend mapping is correctly left to phase 3 (FR-011a). Good.
Does phase 2's registry/query-builder contract match what phase 3 v2.0 says it extends?
| Phase 3 requirement | Phase 2 v2.0 | Status |

|---|---|---|

| FR-030: registry entries discriminated by granularity | Appendix A has no granularity; unique index {domainId, fieldPath} blocks dual-granularity rows | Breaks — N-5 |

| FR-031: 22 campaign-level computed columns | isComputed defined as sync-time derivation (§10.2); no query-time aggregate concept | Breaks — N-5 |

| FR-029: builder switches to aggregation ($group + $project) mode | FR-025 specifies $match + $project only | Gap — name it as a phase-3 extension point |

| FR-003: recipient columns map 1:1 to §10.3 incl. batchId/batchName | C.3 omits both | Breaks — add them |

| FR-026: builder accepts broadcastChannel[], source[], creatorUserIds[], teamInboxIds[], dateType | §6.1 broadcast row lists only today's DTO filters, correctly scoped to phase 3 | OK (correct descoping; EC-011 says so) |

| FR-040 / §2: columns[]-presence selects the configurable path | FR-023 identical | OK — D1 consistent across both |

| 20K cap retained (phase 3 US-008c, §2 key capability 4) | NFR-004 identical | OK — D3 consistent |

| FR-012/FR-013 "dalam permission scope requester" | phase 2 disclaims row-level scoping | Breaks — N-6; phase 3 inherits whatever phase 2 specifies |

Against the other binding decisions
| Decision | Phase 2 v2.0 |

|---|---|

| D1 no templateId; channel is the discriminator | Respected — FR-022/023/024, §20.3. Zero templateId. domainId appears only as a registry field and a GetColumnRegistry request field, never as a CreateReportJob top-level field. |

| D2 masking authoritative, ack is a record | Respected — FR-045..048 record piiAcknowledgedBy/piiAcknowledgedAt; FR-062 + §18 state the dialog is additive. No override path exists in the text. (Defect within the model: N-2.) |

| D3 20 000 cap retained; streaming is §14 Future; 200 000/exceljs is phase-4 only | Respected — NFR-004, §14, §15, §24, EC-001. No 200 000-row or exceljs-code-path claim. (§12's stale "decision required" framing is the only blemish.) |

| D4 phase 2 owns row-level scoping | Violated — N-6. |

| D5 analytics-service generates; no export-worker | Ambiguous — no export-worker is invented (good), but no FR names the generator and §12/ASM-003 point at a ticket-service worker. See residual OQ-1. |

| D6 pull-based sync, no new lifecycle events, manual load-test gate | Respected — phase 2 asserts no events; §12 treats phase-1 sync lag as an external dependency only. |

| D7 / D8 phase-4 sheets, phase-3 FR-044 | N/A to phase 2 — correctly out of scope (§2). |

---

5. Non-blocking Nits (v2.0)
1. §12 presents the streaming decision as open while NFR-004/§14/§15/§24 have decided it. Restate as decided.

2. FR-028's "internal fields needed for dedup" is a survivor of the deleted B-11 dedup hash.

3. FR-036 duplicates FR-033 and half-targets rawEvent, which is excluded from the registry. Merge.

4. Appendix B.1 omits contactId, so the "all non-PII" default preset is 29 of 30 non-PII conversation columns. Either add it or state the exclusion.

5. FR-062 and OQ-19 cite ticket-export.processor.ts:79-86 and broadcast-export.processor.ts:72-80. Neither filename exists. The real paths are apps/ticket-service/src/app/processors/export-job.processor.ts:77-81 and apps/broadcast-service/src/app/processors/export-job.processor.ts:71-74. (v1.0's review cited them correctly; the shortening introduced the error.) privacy-masking.interceptor.ts:16-19 is correct.

6. §27 Source References still lists five EXTERNAL: paths (Assessments/…, PRD/Analytics/…, Memory/global-memory.md, Memory/CLAUDE-be.md, Rules/prd-writing-rule.md) that do not exist in this repo. The in-repo citations added in v2.0 (proto/analytics.proto:37-42,76-80, export-parameter.dto.ts:20-27, ticket-export.worker.ts:35-61,72,77, report-job.constant.ts:1,4, default-permission.constant.ts:131-137, enums/index.ts:1917-1923) all verify correct — good improvement; only the EXTERNAL rows remain unfollowable.

7. EC-003 should cross-reference FR-064 so the "silent all-empty column, no user-facing error" reading doesn't survive alongside the new drift alarm.

8. §19.1 marks Lifetime, Sentiment, Customer First Wait as needing a phase-1 schema addition; Lifetime is computable from fields phase 1 already carries, and the other two are hardcoded '-' in production (ticket-export.worker.ts:181,192). Retitle their disposition so the phase-1 CR covers only the three genuine PII columns.

---

6. Recommended Path to READY FOR TRD
1. Fix N-1 (DTO extension stated), N-3 (exportdatacoverage consumption), N-6 (D4 row-scope FR + AC) — these three are what keep the verdict at STILL NEEDS REVISION.

2. Fix N-5 (granularity in Appendix A + unique index) and add batchId/batchName to C.3/B.3 — required before phase 3's TRD, cheapest to do here.

3. Decide N-2 (name masking) and N-4 (ObjectId display) — both are one-paragraph decisions with Legal / UX consequences.

4. Name the generating service (residual OQ-1, D5).

5. Sweep nits 1–8 and add a v2.1 row to §1 Revision History.

After (1)–(4) this PRD is TRD-ready. The v2.0 revision closed the hard parts; what remains is contract-surface plumbing and two decisions the PM can make without new research.