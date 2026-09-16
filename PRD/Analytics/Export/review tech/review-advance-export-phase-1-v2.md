VERDICT: READY WITH MINOR EDITS

9 of 10 blocking issues are genuinely closed (5 by fix, 4 by descope/decision). B-09 is only partially closed — an internal NFR contradiction survives. Seven new issues were introduced by the v2.0→v2.1 rewrite; six are text/example defects fixable in a single editing pass, one (N-01, recipientName provenance) is a real missing requirement that a TRD author cannot resolve alone.

---

1. Closure table (B-01 … B-10)
| ID | Status | Evidence from v2.1 | Code verification |

|---|---|---|---|

| B-01 event-driven premise false (18 non-existent RMQ lifecycle events) | CLOSED | FR-013: "analytics-service MUST pull row-level data from domain services via RabbitMQ request/response using ANALYTICS_AGGREGATE_ patterns, extended to row-grain payloads… (aggregation-scheduler.service.ts:208,434,549)". FR-015: "Pull sync MUST NOT make gRPC calls — only RabbitMQ request/response via existing MessagePattern handlers." Appendix E.1 event list removed. | VERIFIED. backend/apps/analytics-service/src/app/services/aggregation-scheduler.service.ts:204-215 (aggregateAndWriteSingle), :432-440 (broadcast batch), :547-556 (ticket batch) — RMQ send() request/response, ANALYTICS_AGGREGATE_ patterns real. Pull pattern exists and is extensible as written. Matches D6. |

| B-02 readPreference=secondary backfill not achievable | CLOSED | FR-019: "Backfill MUST read from primary with throttled batches (500/batch, configurable delay). System MUST support readPreference=secondaryPreferred when MONGODB_ANALYTICS_BACKFILL_URI is provisioned (toggle: ENABLE_SECONDARY_READ)." | VERIFIED. backend/.env.example:53 — analytics URI carries directConnection=true (as do all URIs, :49-70); k8s Service pins mongodb-0 (devops/k8s/23.mongodb.yaml:78); default read pref is primary (libs/common/src/lib/config/database.config.ts:10). Primary-read default is the only achievable baseline today; the separate-URI toggle is the correct escape hatch. |

| B-03 2% latency guard has no metric producer | CLOSED | NFR-001 [CRITICAL]: "Latency guard is a LAUNCH GATE enforced by manual pre/post load test." FR-040: "…alarm via log warning + RMQ notification… Formal APM instrumentation (prom-client, Grafana) is post-MVP." Appendix I load-test gate analytics_latency_guard_result with verdict. | VERIFIED. No prom-client/@opentelemetry/* in backend/package.json, no /metrics route; Prometheus is only a planned cluster add-on (devops/cluster.yaml:202). Log-based + manual gate is the only honest option. Matches D6. |

| B-04 broadcast natural key is PII | CLOSED | FR-005: "rowKey = sha256(companyId\|organizationId\|broadcastId) — broadcastId (= Broadcast._id) is the recipient row's unique PK, sufficient alone… recipientNumber MUST NOT be part of any unique index." §10.3 note: "recipientNumber is stored raw (unmasked). Masking is an export-time presentation concern." | VERIFIED. Broadcast._id is the per-recipient PK (backend/apps/broadcast-service/src/app/schemas/broadcast.schema.ts, one doc per recipient — recipients: string at :109-114). Hash over the PK is deterministic and PII-free. Raw storage matches D2. ⚠️ but see N-02/N-03 — the §10.3 examples still show the old PII-bearing key and a masked number. |

| B-05 90-day TTL on createdAt defeats PS-004 | CLOSED | FR-030: "TTL index on a dedicated expireAt field set at projection time: expireAt = max(createdAt, sourceUpdatedAt) + RETENTION_DAYS. NOT on createdAt — active entities must not be purged mid-lifecycle." FR-029: retention default 180, "MUST be >= backfill target range (90 days)". PS-004: "Analytics is a 180-day audit store, not a 90-day cache." | Applied consistently in all three tables: expireAt rows at §10.1 line 171, §10.2 line 230, §10.3 line 273, each with the identical max(createdAt, sourceUpdatedAt) + RETENTION_DAYS formula and a TTL-index note. No surviving requirement depends on data older than 180d — backfill target is 90d (Appendix F "Phase 3: Backfill … target date range: 90 days"), and §15 states the limitation explicitly. |

| B-06 right-to-erasure has no trigger/flag/requester | CLOSED-BY-DESCOPE | §2 non-goals: "Right-to-erasure pipeline (no erasure pipeline exists in the product today)". OQ-16 RESOLVED; §10.4 PII Classification table added (IDENTIFIER / FREE_TEXT_MAY_CONTAIN_PII / NON_PII), piiScrubbedAt kept for future readiness. §15: "PII data will persist for the full retention period (180 days)." | Consistent with D2. FR-032/FR-033 and NFR-016 removed, leaving numbering gaps 031→034 and NFR-015→017 — acceptable (published FR IDs stay stable). §10.4 now covers the under-inclusive field list from the v1.0 finding (lastMessageText, metadata, customAttributes, description, remarks[], lastReplyMessage, customFields, messageContent, requestPayloadJson, attributesJson). |

| B-07 IDs typed string instead of ObjectId | CLOSED | All three §10 tables now type tenant + entity IDs as ObjectId: §10.1 companyId/organizationId/conversationId/contactId/platformId/assignedTo[]/participants[]/closedBy/inboxId/teamId; §10.2 ticketId/assignee[]/createdBy/inboxId/teamId; §10.3 batchId/broadcastId/creatorUserId/teamInboxIdAtSendTime; §10.5 companyId/organizationId. | VERIFIED consistent across all three tables + the coverage collection — matches existing analytics convention (responsiveness-metrics.schema.ts:41-42, broadcast-daily-metrics.schema.ts:47-48, export-report-job.schema.ts:68-72 ITenantEntity). ⚠️ one residual defect: N-04 (teamId typed singular ObjectId but Default []). |

| B-08 no row-level permission scope requirement | CLOSED-BY-DESCOPE | FR-026: "Phase 1 scope: company + organization isolation only. Row-level permission scope (team/agent/contactScope per PermissionsGuard and TicketViewEnum) is owned by Phase 2 FR-052. Phase 1 guarantees scoping fields (teamId, assignedTo, assignee) are populated in every projected row." §2 non-goals row: "Row-level permission scope (team/agent/contactScope) → Phase 2 FR-052". | Matches D4 exactly, and the "guarantee the fields are populated" clause is the right handoff contract for Phase 2. No phase-1 text silently assumes scoping. |

| B-09 missing operational NFRs (caps, timeouts, concurrency, storage) | PARTIALLY CLOSED | NFR-018 (20,000-row export cap), NFR-019 (maxTimeMS=30s, 30s ack/nack, 60s backfill batch), NFR-021, NFR-022 added. | Caps VERIFIED accurate: conversation-export.constant.ts:1 = 20_000, :2 = 2_000; ticket.constant.ts:15,16; broadcast-export.constant.ts:2,5. Matches D3. Gap: NFR-007 "Backfill MUST NOT create > 50 concurrent MongoDB connections" directly contradicts NFR-021 "Backfill connections MUST fit within MONGODB_ANALYTICS_MAX_POOL_SIZE (currently 10, .env.example:54)". Confirmed MONGODB_ANALYTICS_MAX_POOL_SIZE=10 at backend/.env.example:54. See N-05. |

| B-10 FR-036 coverage had no mechanism | CLOSED (with one mechanism gap, see N-06) | FR-036: "MUST maintain an exportdatacoverage document per {companyId, organizationId, collection, date} recording state ∈ {NOT_BACKFILLED, BACKFILLING, COMPLETE}, rowCount, lastSyncedAt. Export consumers MUST read coverage before querying rows and MUST fail with DATA_NOT_READY…". §10.5 full schema + unique index {companyId, organizationId, collection, date}. EH-010 adds DATA_NOT_READY / DATA_EXPIRED. | Schema is concrete enough to implement. Two unspecified behaviours remain (N-06): who writes coverage for live/in-flight days (how does today ever reach COMPLETE), and coverage-doc expiry vs row TTL. |

Score: 9 closed (5 fixed, 2 by-descope, 2 by-decision) / 1 partial.

---

2. New issues introduced by v2.1
N-01 [BLOCKING for TRD] — recipientName has no provenance and no sync requirement.

§10.3 line 251 lists recipientName as "Domain data (PII — IDENTIFIER)". It is not a field on the Broadcast schema (backend/apps/broadcast-service/src/app/schemas/broadcast.schema.ts:109-114 has only recipients: string). Today it is resolved at export time by a cross-service gRPC call to people-service getClientContactByPhone, one lookup per unique recipient phone (broadcast-export.service.ts:256-289, mapped at :315). That directly collides with FR-007 ("MUST NOT create read dependencies from analytics-service back to operational collections at query time. All data MUST be materialized"), and with FR-015 (no gRPC in the sync path). No FR specifies who performs the N-phone contact resolution during sync, what happens when the contact is missing, or what the fallback value is.

Suggested rewrite — add to §7 Functional Requirements, Sync Pipeline block:

> FR-013a [P0]: For broadcastexportdata, recipientName MUST be resolved at projection time by batch-resolving unique recipientNumber values against people-service contacts (mirroring the export-time lookup at broadcast-export.service.ts:256-289), de-duplicated per pull batch. If no contact matches, recipientName MUST be stored as null and rendered as - at export time. Resolution failures MUST NOT fail the row projection — the row is written with recipientName = null and retried on the next pull cycle.

Also state whether this resolution is exempt from FR-015's no-gRPC rule or must go over RMQ.

N-02 [important] — §10.3 rowKey example still contains the recipient phone.

Line 243 Example: ` sha256(comp\|org\|brd\|+628...) — four components including the phone number. This contradicts FR-005, the §10.3 natural-key note, and revision-note (c), all of which say {companyId, organizationId, broadcastId}` alone. A TRD author copying the example reintroduces B-04.

Suggested rewrite: Example → ` sha256(comp|org|64a1b2c3d4e5f6a7b8c9d101) `.

N-03 [nit] — §10.3 recipientNumber example is masked but the field is raw.

Line 250 Example +6**10, while the §10.3 note says "stored raw (unmasked)". Same for senderNumber (+6**90). Contradicts D2's store-raw/mask-at-export decision.

Suggested rewrite: use unmasked realistic examples (+628****6710), and add "(masking applied at export time only — Phase 3)".

N-04 [important] — teamId type/default mismatch in both §10.1 and §10.2.

§10.1 line 154 and §10.2 line 221: teamId | ObjectId | … | Required Yes | Default []. A singular ObjectId cannot default to an array, and "Required Yes with a default" is self-contradictory. Since FR-026 promises teamId is populated for Phase-2 scoping, the ambiguity is load-bearing.

Suggested rewrite: ` teamId | ObjectId[] | ["64a1…0ea"] | — | No | [] — or make it a singular required ObjectId` with no default. Pick one and apply identically in both tables.

N-05 [important] — NFR-007 vs NFR-021 concurrency contradiction (residual from B-09).

NFR-007 caps backfill at 50 concurrent connections; NFR-021 caps it at MONGODB_ANALYTICS_MAX_POOL_SIZE = 10 (backend/.env.example:54). Both are normative.

Suggested rewrite: delete the absolute number from NFR-007 and make it derived — "NFR-007: Backfill concurrency MUST NOT exceed MONGODB_ANALYTICS_MAX_POOL_SIZE (currently 10). Raising the ceiling requires an explicit pool-size increase per NFR-021."

N-06 [important] — coverage collection has no live-day and no expiry semantics.

FR-036 + §10.5 define the document, but nothing says (a) who flips a day to COMPLETE for today, which is still receiving rows — under a strict reading every export including today fails DATA_NOT_READY; (b) whether coverage docs expire. Appendix G says coverage retention is "Same as parent collection (no independent TTL)", but §10.5 has no expireAt field and no TTL index, so coverage docs live forever while rows TTL out at 180d — a date beyond retention will report COMPLETE with a stale rowCount while the rows are gone. EH-010's DATA_EXPIRED therefore cannot be derived from coverage state.

Suggested rewrite: add

> FR-036a [P0]: The current UTC day's coverage document is maintained in state COMPLETE with a rolling rowCount/lastSyncedAt updated each pull cycle; export consumers MUST treat COMPLETE with lastSyncedAt older than the sync-lag SLO (NFR-004, 5 min) as DATA_NOT_READY.

> FR-036b [P0]: DATA_EXPIRED MUST be determined by comparing the requested date against now - EXPORT_ROW_RETENTION_DAYS, not from coverage state. Coverage documents for dates outside the retention window MUST be deleted by the same TTL policy (add expireAt to §10.5).

N-07 [nit] — three stale cross-references / metadata defects.

(a) Header metadata block says Version: 2.0 while revision history's newest row is v2.1 — stamp is stale. (b) Metadata block is missing the house-template Link and Contributors rows. (c) §12 risk row still reads "Flag as Open Question — OQ-16" while OQ-16 is marked RESOLVED in Appendix D. (d) Revision note (a) cites libs/common/src/lib/enums/index.ts:1228 for BroadcastStatusEnum; the actual declaration is at libs/common/src/lib/enums/index.ts:1264-1277.

N-08 [important, carried from run-14 verification] — broadcastChannel enum is wrong.

§10.3 line 248 validates broadcastChannel as ` whatsapp_web/whatsapp_api (BroadcastPlatformEnum) sourced from Broadcast.platform. But Broadcast.platform is typed PlatformEnum, not BroadcastPlatformEnum — broadcast.schema.ts:180-185 → libs/common/src/lib/enums/index.ts:712-720, six values: whatsapp_api, whatsapp_web, widget, email, instagram, facebook_messenger. BroadcastPlatformEnum (enums/index.ts:726-729`) is a different, 2-value enum not used by the schema. As written the projection would reject or silently drop any non-WhatsApp broadcast row.

Suggested rewrite: ` broadcastChannel | string | whatsapp_api | PlatformEnum (whatsapp_api/whatsapp_web/widget/email/instagram/facebook_messenger) | Yes | — | Domain data (= Broadcast.platform, typed PlatformEnum at broadcast.schema.ts:180-185) `. If the product intent really is WhatsApp-only, say so as an explicit filter requirement rather than as a narrower type.

---

3. Residual open questions that would block a TRD author
1. OQ-17 is still Open (Appendix D: "Open. Yes — determines projection completeness"). It gates how complete the pull-side projection must be; a TRD author cannot design the row-grain payload contract around an unresolved answer. Needs PM/Eng resolution before TRD.

2. N-01 recipientName resolution — owner, transport (gRPC vs RMQ), failure mode, fallback. Not inferable from the PRD.

3. Row-grain payload contract itself — FR-013 says "ANALYTICS_AGGREGATE_* patterns, extended to row-grain payloads" but no payload shape, page size, cursor, or per-cycle date-window is specified. NFR-018's 2,000-row pagination (cited in EC-006) is the only hint. Acceptable as a TRD deliverable, but should be named explicitly as such.

4. Backfill operator authorization — §7 note: "Authorization: admin *** only (to be confirmed in TRD)". The redaction/typo should be resolved; backfill.controller.ts:57 @EventPattern('analytics.backfill') has no auth surface today.

5. Status vocabulary for conversation/ticket — §10.1 line 140 status example OPEN with validation "Valid enum" and §10.2 line 188 UNASSIGNED, neither naming the enum. Broadcast got fixed in v2.1; the other two did not. Name the source enums (ConversationStatusEnum / ticket equivalent) so the TRD can validate.

---

4. Cross-phase consistency findings (vs D1–D8)
| Decision | Phase-1 v2.1 status |

|---|---|

| D1 no templateId | ✅ No occurrence of templateId anywhere in the document. |

| D2 permission-driven masking authoritative, raw PII stored, erasure out of scope | ✅ §10.3 "stored raw… masking is an export-time presentation concern (Phase 3/D)"; erasure out of scope, §10.4 classification. ⚠️ §10.3 examples still show masked values (N-03), and §10.4 lists "Redact" for recipientName which reads as a storage instruction contradicting the store-raw note — worth one clarifying word ("redact at export"). |

| D3 20,000-row cap retained | ✅ NFR-018, verified against conversation-export.constant.ts:1, ticket.constant.ts:15, broadcast-export.constant.ts:2. No 200,000/exceljs claim leaks into phase 1. |

| D4 row-level scoping deferred to phase 2 | ✅ FR-026 + §2 non-goals name Phase 2 FR-052 explicitly, and phase 1 commits only to populating the fields. No silent assumption found. |

| D5 analytics-service reads collections directly, no export-worker | ✅ No export-worker string in the document; FR-013/FR-036 assign ownership to analytics-service. |

| D6 pull-based, no new domain events, manual load test not APM | ✅ FR-013/FR-015, NFR-001, Appendix I. Appendix E.1's invented event list is gone. |

| D7 phase-4 sheets | n/a to phase 1. |

| D8 unmasked-broadcast-phone defect → phase 3 FR-044 | ✅ Consistent — phase 1 stores raw and explicitly delegates masking to Phase 3/D. |

Consumer-contract checks requested by the card:

batchId / batchName — ✅ reachable. BroadcastBatch.name exists at apps/broadcast-service/src/app/schemas/broadcast-batch.schema.ts:17 (String, required, indexed), _id auto, tenant fields ObjectId at :40,:43. ⚠️ one naming caveat: on the Broadcast document the FK field is literally batch, not batchId (broadcast.schema.ts:102-107, batch?: Types.ObjectId ref BroadcastBatch). The PRD's mapping is correct but never states the source field name, so a TRD author will grep for batchId on the Broadcast schema and find nothing. Add "(source field: Broadcast.batch)" to the §10.3 batchId row.
Status vocabulary — ✅ exact match. PRD §10.3 line 252 lists 12 lowercase values raw/text_processing/text_processed/schedule/pending/processing/sent/delivered/failed/retry/invalid/canceled; BroadcastStatusEnum at libs/common/src/lib/enums/index.ts:1264-1277 has exactly those 12, same spelling and case. (Only the line-number citation in the revision note is wrong — N-07d.)
ObjectId types — ✅ applied consistently across §10.1, §10.2, §10.3 and §10.5, matching ITenantEntity (export-report-job.schema.ts:68-72). One defect: N-04.
Coverage collection — ✅ concrete enough to implement the schema and the DATA_NOT_READY path; ⚠️ live-day and expiry semantics missing (N-06).
rowKey determinism — ✅ broadcastId = Broadcast._id is genuinely the per-recipient PK, so the 3-component hash is deterministic and stable across re-pulls. The FR text is right; only the example is wrong (N-02).
---

5. Recommended action
Return to PM for one editing pass covering N-01 (new FR — needs a real decision, not just wording), N-04, N-05, N-06, N-08 (substantive), plus N-02, N-03, N-07 (text/example fixes). None of these require re-architecting the document — the v2.0/v2.1 structural pivots are sound and verified against source. Once N-01, N-05, N-06 and N-08 are settled and OQ-17 is resolved, this PRD is TRD-ready.

Verification basis: backend/ at current working tree — libs/common/src/lib/enums/index.ts, libs/common/src/lib/config/database.config.ts, apps/broadcast-service/src/app/schemas/{broadcast,broadcast-batch}.schema.ts, apps/analytics-service/src/app/services/aggregation-scheduler.service.ts, apps/analytics-service/src/app/controllers/backfill.controller.ts, apps//src/app/constants/export.constant.ts, backend/.env.example, devops/k8s/23.mongodb.yaml, devops/cluster.yaml, backend/package.json. PRD file not modified.*