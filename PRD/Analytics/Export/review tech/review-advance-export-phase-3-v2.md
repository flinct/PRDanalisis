VERDICT: READY WITH MINOR EDITS
9/10 blocking issues fully closed. 1 partially closed (B-01 — count-column coverage gap). 2 new issues introduced by v2.0 (both paragraph-level fixes, <1 hr PM effort). Cross-phase dependencies are correctly stated and documented. The PRD is ready for TRD after two minor edits.

---

Closure Table
| Issue | Status | Evidence from v2.0 | Code Citation |

|---|---|---|---|

| B-01 | PARTIALLY CLOSED | FR-011a (§6): display→backend mapping via BroadcastStatusEnum 12 values. FR-022a: non-terminal set = {raw, text_processing, text_processed, schedule, pending, processing, sent, retry} (8 values), terminal = {delivered, failed, invalid, canceled} (4 values) = all 12 accounted for. Appendix A Stage 2 $cond blocks use real lowercase enum values. GAP: the 6 named count columns (successCount, inProgressCount, scheduledCount, failedCount, canceledCount, invalidCount) cover only 8 of 12 statuses. raw, text_processing, text_processed, and retry are counted in totalRecipients ($sum:1) but have NO named count column → counts don't sum to total when internal-processing recipients exist. | enums/index.ts:1264-1277 (12 values confirmed). broadcast-export.service.ts:299 (mapper still ignores _maskPii). |

| B-02 | CLOSED | FR-021 (§6): "groups broadcastexportdata rows by batchId (PRD-A v2.1 — bukan broadcastId; broadcastId adalah recipient PK, bukan campaign key)". FR-025: "groups by {companyId, organizationId, batchId}". Appendix A Stage 2: _id: { companyId, organizationId, batchId: "$batchId" }. Phase 1 v2.1 line 244 confirms batchId = BroadcastBatch._id (campaign key), line 245 confirms batchName = BroadcastBatch.name (clean), line 276: "Campaign-level aggregation groups by batchId, not rowKey." | Phase 1 v2.1 §10.3 lines 244-245, 276: fields confirmed present. |

| B-03 | CLOSED | FR-010 (§6): Channel filter = BroadcastPlatformEnum (whatsapp_api, whatsapp_web). FR-010a [NEW]: Source filter = BroadcastTypeEnum (manual, import, open-api). US-004: channel options = "WhatsApp API" + "WhatsApp Web" only. US-004a [NEW]: source options = "Manual" + "Import" + "Open API". §10.1 lines 168-169: filters.broadcastChannel = BroadcastPlatformEnum, filters.source = BroadcastTypeEnum. | enums/index.ts:726-730 (PlatformEnum: 2 values), 1254-1258 (TypeEnum: 3 values). Phase 1 v2.1 line 249: "Open API lives here, NOT in broadcastChannel." |

| B-04 | CLOSED-BY-DESCOPE | "US-013 (export INVALID_REQUEST rows) DEFERRED ke follow-up phase." (§6, line 106). FR-025 requestId fallback REMOVED. EH-008, EC-001 REMOVED from v2.0. Appendix B lines 436-439: requestId/idempotencyKey/requestPayloadJson/failureSource marked "(schema-ready, null) — DEFERRED". | post-open-api-broadcast.dto.ts (no requestId/idempotencyKey fields). broadcast.service.ts:433-434 (failed creates roll batch back). |

| B-05 | CLOSED | EC-004 (line 132): "Job rejected dengan pesan" — now a rejection, not "may take longer". EC-005 (line 133): "Job rejected dengan error: BROADCAST_EXPORT_LIMIT=20_000". §13 KPIs: no 1M-row KPI, adoption KR = ≥80% (not 100%). §15 (line 277): "Export cap: 20K rows per job." No ExcelJS/streaming/200K reference anywhere in v2.0. | broadcast-export.constant.ts:2: BROADCAST_EXPORT_LIMIT = 20_000. |

| B-06 | CLOSED | US-008 AC2: uses real statuses (delivered/failed/invalid) + batchId. US-009 AC1 (line 84): explicitly states "Row-level scoping...adalah new work (saat ini enforcement hanya di job-list visibility)". US-014 AC2 (line 88): "selections CLEARED (sesuai FR-009 — selections tidak valid lintas granularity; saved selections per granularity disimpan terpisah di localStorage)". US-010 AC3 (line 85): "acknowledgment disimpan pada job document...bukan pada audit log (tidak ada audit sink saat ini)". US-002 AC2: names exact column set. US-011 AC2: specifies exact prefilled params. | — |

| B-07 | CLOSED | FR-034 (line 103): "System MUST add an Export action button di Broadcast > Messages page (tidak ada saat ini — ManageBroadcastMessagePage.tsx hanya memiliki 'Bulk Broadcast' dan 'New Broadcast')." FR-035: "Offline Report page MUST membaca nilai dari URL param create...Saat ini hanya cek presence dan selalu default ke Ticket tab (useCreateReportModal.ts:62)". FR-036: "seed react-hook-form defaults dari URL params...bukan dari BROADCAST_DEFAULT_VALUES". URL param contract table at §10.1 (lines 180-194): 9 params with types, form mappings, and invalid behaviors. All 3 FRs correctly labeled "new FE work, bukan reuse." | ManageBroadcastMessagePage.tsx:33-46 (no Export button — confirmed). OfflineReportSection.tsx:19-24 (checks presence only). useCreateReportModal.ts:63 (defaults to TICKET). use-export-ticket.ts:12 (redirect pattern). |

| B-08 | CLOSED | NFR-013 (Async Job & Delivery group): full RMQ pipeline described (CreateReportJob → RMQ → ExportJobProcessor → S3 → RESULT). NFR-013a: "broadcast export generation berjalan INLINE di processor (tidak ada worker thread)". NFR-013b: "Progress feedback adalah one-shot flip QUEUED → PROCESSING...EC-004's 'Progress indicator shows processing status' merujuk ke status badge 'Sedang Diproses' (static)". NFR-014: "File retention: 7 hari...Presigned URL: 15 menit". NFR-015: "Rate limits: MAX_JOBS_PER_HOUR=10, MAX_ACTIVE_JOBS_PER_CHANNEL=1, MAX_DATE_RANGE_DAYS=31". FR-044 (line 105): "Broadcast row mapper MUST honour maskPii parameter...Saat ini ada live gap: processor compute shouldMaskPii tapi mapper ignores it (broadcast-export.service.ts:299)". §15 (line 285): "Consent untuk recipient contact data diatur upstream di broadcast-send time. Out of scope untuk export." | broadcast-export.service.ts:299 (_maskPii ignored — live gap confirmed). export-job.processor.ts:72-80 (shouldMaskPii computed from permissions). media-service/src/constants/config.constant.ts (7-day retention). analytics-service/src/app/constants/report-job.constant.ts:1-5 (rate limits). |

| B-09 | CLOSED | 6 new P1 user stories added: US-008a (in-progress campaign indicator), US-008b (failure filter), US-008c (row cap feedback), US-008d (deleted/expired campaign handling), US-015 (file expiry notification), US-016 (aggregation failure/recovery). Covers all 4 originally-named edge cases plus 2 more. EH-007/EH-010 promoted to P1 stories with testable ACs. | — |

| B-10 | CLOSED | NFR-018a (line 235): "Platform dependency — tidak ada prom-client/OTel/APM di backend/package.json. Metrics belum dapat diemit saat ini. Interim: structured log entries. Shared platform gap dengan Phase-1 dan Phase-2 — fix once, cross-reference. Owner: Eng Lead." §12 (line 246): "Feature flag via company.features.broadcastConfigurableExportEnabled (ops-set, sama pola dengan SAP gate di PRD-D). Cross-phase fix...fix once." Both correctly stated as shared platform dependencies with named owner. | — |

---

New Issues Introduced by v2.0
NI-01 — Count columns don't cover 4 internal processing statuses (derived from B-01 partial gap)
Quote: FR-022 (line 100): Campaign counts = totalRecipients, successCount(delivered), inProgressCount(pending+processing+sent), scheduledCount(schedule), failedCount(failed), canceledCount(canceled), invalidCount(invalid).

Problem: 7 count columns cover 8 of 12 BroadcastStatusEnum values. The 4 internal processing statuses (raw, text_processing, text_processed, retry) ARE counted in totalRecipients ($sum:1) and in nonTerminalCount (for campaignStatus derivation), but have NO named count column. Consequence: totalRecipients ≠ successCount + inProgressCount + scheduledCount + failedCount + canceledCount + invalidCount when recipients exist in these 4 states.

Suggested fix: Add one column: processingCount (Sedang Diproses) = count where status IN (raw, text_processing, text_processed, retry). This also makes campaignStatus derivation transparent to the user (they can see WHY it's "Berlangsung"). Update FR-022, FR-031 column count (22→23), §10.2 table, Appendix A Stage 2, Appendix B, and the UI-copy table. Alternatively, document the gap in §15 and instruct the TRD author to add the column during implementation.

NI-02 — FR-044 masking logic is ambiguous about per-field permission mapping
Quote: FR-044 (line 105): "recipientNumber dan recipientName MUST be masked ketika user tidak memiliki privacy:view_full_phone/privacy:view_full_email."

Problem: The "/" is ambiguous — does it mean "either permission missing triggers masking" or "each field has its own permission"? The actual code at export-job.processor.ts:72-74 uses || (OR): !userPermissions.includes('privacy:view_full_email') || !userPermissions.includes('privacy:view_full_phone'). This means if EITHER permission is missing, ALL PII fields are masked. Additionally, recipientName is not obviously covered by either "email" or "phone" permission — what permission governs name masking?

Suggested rewrite: "FR-044: Broadcast row mapper MUST honour the maskPii parameter passed by the processor. When maskPii = true: recipientNumber MUST be masked (phone permission), recipientName MUST be masked (treated as PII for recipient identity). The processor computes shouldMaskPii at export-job.processor.ts:72-74 using || over privacy:view_full_email and privacy:view_full_phone — mask if EITHER permission is absent. Clarify whether recipientName masking is governed by the same composite check or needs its own permission."

---

Shared Epic Decision Compliance
| Decision | Phase 3 v2.0 | Status |

|---|---|---|

| D1 Job contract: no templateId; channel = broadcast; configurable path via non-empty parameters.columns[]; granularity is parameters.* | FR-040 (configurable path via columns[]), §10.1 (form-level view). Minor nit: §10.1 shows granularity at the same level as domainId/columns — should add a note that it maps to parameters.granularity per phase 2's wire contract. | COMPLIANT (minor presentation nit) |

| D2 PII: permission-driven masking is authoritative | FR-041/042/043/044 all correctly state permission masking + acknowledgment. FR-044 closes live gap. §15 consent line correct. | COMPLIANT |

| D3 Volume: 20K cap retained; no ExcelJS/200K | EC-004/EC-005 rejections. §15 states cap. No streaming/XLSX reference. | COMPLIANT |

| D4 Row-level scoping: phase 2 owns it | US-009 AC1 (line 84): "Row-level scoping...adalah new work" — correctly depends on phase 2. | COMPLIANT |

| D5 Generation owner: analytics-service reads directly | No export-worker. Analytics-service reads broadcastexportdata. | COMPLIANT |

| D6 Phase-1 sync: pull-based | §12 references PRD-A v2.1 sync. No domain lifecycle events. | COMPLIANT |

| D7 Phase-4 sheets: not relevant to phase 3 | N/A | N/A |

| D8: FR-044 as fix spec for live unmasked-broadcast-phone defect | FR-044 correctly describes fix: mapper MUST honour maskPii parameter, currently ignored at broadcast-export.service.ts:299. | COMPLIANT |

---

Cross-Phase Consistency Findings
Fields phase 3 consumes from phase 1 §10.3 (broadcastexportdata)
| Field | Phase 1 v2.1 §10.3 | Phase 3 v2.0 | Match? |

|---|---|---|---|

| batchId (ObjectId) | Line 244: "campaign key = BroadcastBatch._id" | FR-021, FR-025, Appendix A Stage 2 | ✅ |

| batchName (string) | Line 245: "campaign name = BroadcastBatch.name, clean" | FR-023, §10.2, Appendix A Stage 2 | ✅ |

| broadcastId (ObjectId) | Line 246: "recipient row PK = Broadcast._id" | §10.2 (recipient-level) | ✅ |

| broadcastChannel (string) | Line 248: "= Broadcast.platform" | FR-010, FR-026, §10.2 | ✅ |

| source (string) | Line 249: "= Broadcast.type" | FR-010a, FR-026, §10.2 | ✅ |

| status (string, 12 values) | Line 252: "BroadcastStatusEnum, 12 values" | FR-011a display mapping, Appendix A $cond | ✅ |

| teamInboxIdAtSendTime (string) | Present in §10.3 | FR-013, FR-026, §10.2 | ✅ |

| senderNumber | Present, flagged "PII — stored raw" | FR-041: "MUST NOT be flagged PII" | ⚠️ Phase 1 still shows it as PII in §10.3 line 250. Phase 3 de-flags it. Minor inconsistency — both PRDs should align. |

Capabilities phase 3 consumes from phase 2 (column registry, query builder, column picker)
| Capability | Phase 2 v2.0 | Phase 3 v2.0 | Gap? |

|---|---|---|---|

| Registry domainId = broadcast | FR-002 (broadcast columns populated), Appendix A schema | FR-001/002/003 | ✅ |

| Registry granularity discriminator | NOT in phase 2 schema (Appendix A has no granularity field) | FR-030: "domainId = broadcast dan granularity = campaign discriminator" | ⚠️ Phase 3 needs a granularity field on registry entries that phase 2 doesn't specify. Phase 3 §15 acknowledges this: "Sampai PRD-B registry mendukung discriminator ini, column filtering mungkin menggunakan category-based workaround." TRD can handle with workaround. |

| Column picker UI | Phase 2 FR-038+ | Phase 3 FR-007 (reload on granularity change) | ✅ |

| Query builder aggregation mode | Phase 2 FR-025 (builds pipeline) | Phase 3 FR-029: "switch ke aggregation pipeline mode (group + project)" | ✅ — natural extension |

| SheetJS XLSX (20K cap) | Phase 2 NFR-004, ASM-003 | Phase 3 NFR-015 (rate limits reference same 20K cap) | ✅ |

| CreateReportJob contract | Phase 2 FR-022/023/024 (channel + parameters.columns[] + userContext) | Phase 3 FR-038/039/040 (legacy + configurable dual path) | ✅ |

Regression: senderNumber PII alignment
Phase 1 v2.1 §10.3 line 250 still shows senderNumber as "PII — IDENTIFIER, stored raw". Phase 3 FR-041 explicitly de-flags it as PII. Phase 2 FR-004 still lists senderNumber as isPII: true. This is a 3-PRD inconsistency — phase 3 is correct (company-owned number), but phases 1 and 2 haven't been updated. Should be flagged for the consolidator.

---

Residual Open Questions That Would Block a TRD Author
1. NI-01 count-column gap: Should the TRD author add a processingCount column for the 4 internal statuses (raw/text_processing/text_processed/retry), or document that totalRecipients may exceed the sum of named counts? Needs PM decision.

2. FR-044 permission granularity: Which permission governs recipientName masking? Currently the processor uses privacy:view_full_email || privacy:view_full_phone as a composite mask trigger. Is this intentional, or should recipientName have its own permission?

3. senderNumber PII alignment across phases: Phase 3 de-flags senderNumber, phases 1 and 2 still flag it. The consolidator should ensure all three are updated consistently.

---

What Is Still Genuinely Good
The scope table (§2) remains the best in the set — every out-of-scope item paired with the owning PRD.
Granularity as a first-class concept is fully traceable: FR-005→FR-009 (toggle/reload/clear), FR-021→FR-025 (aggregation pipeline), FR-030→FR-033 (registry discriminator + picker mutual exclusion).
§10.2 campaign aggregate table is directly seedable (fieldPath/displayName/dataType/category/isComputed).
Appendix A pipeline is now normative and nearly implementable (Stage 4 $project construction rule added).
FR-044 + §12 risk row correctly identifies and specifies the fix for the live privacy gap — this is the right place to close it.
US-008a/b/c/d + US-015/016 fill every edge case gap from v1.0 with testable ACs.
NFR-013/013a/013b/014/015 (Async Job & Delivery group) fills every NFR gap from v1.0.
§12 dependencies are correctly stated with owners and mitigations — no "reuse existing X" assertions that don't exist.