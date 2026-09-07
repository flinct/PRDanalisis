# Conversation Feature — Data Model & API Contract Audit

Date: 2026-09-02
Scope: `apps/conversation-service` (data layer, Mongoose schemas, gRPC contract) + `apps/api-gateway/src/app/conversation` (REST contract) + `libs/common` (shared repo/pagination/proto).
Method: code review of schemas, indexes, repositories (queries + aggregation pipelines), proto definitions, gateway DTOs, error constants.
Repo: `Desktop/BE satuinbox/omnichannel-satuinbox-be`.

Severity legend: CRITICAL = data corruption / prod-scale outage risk. MAJOR = perf cliff or contract break under load / real traffic. MINOR = correctness or maintainability debt.

Total: 18 findings (3 CRITICAL, 8 MAJOR, 7 MINOR). Positive controls listed at end.

---

## CRITICAL

### D1 — Message collection has NO index on `conversationId` (or any query field)
File: `apps/conversation-service/src/app/schemas/message.schema.ts:180-183`
The `Message` schema defines `conversationId` with NO `index: true`, and the file has ZERO `MessageSchema.index(...)` compound-index calls (verified: 0 matches). Every message-history read (`findByConversationId`, `message.repository.ts:63`) does `$match: { conversationId }` with `$sort: { timestamp/createdAt }` — against a collection that the code's own comment says can hold "254K" docs per query path. Without `{ conversationId: 1, createdAt: -1 }` (or `timestamp`) this is a full COLLSCAN + in-memory sort on every open of a conversation. This is the single hottest read in the product.
Fix: `MessageSchema.index({ conversationId: 1, createdAt: -1 })` (+ `{ conversationId: 1, timestamp: -1 }` if timestamp is the sort key; align index with `buildFilterSort` output). Also index `parentExternalMessageId` (already `index:true` at :282 — good) is used by `populateAlbumMessages` `$in` lookup.
Effort: S (one line + migration/rolling index build).

### D2 — Soft-delete filter silently bypassed in every aggregation path
File: `libs/common/src/lib/database/database.module.ts:111-122`, `apps/conversation-service/src/app/repositories/message.repository.ts:88-120`
The soft-delete plugin only patches `pre(/^find/)` and `pre(/^countDocuments/)`. Mongoose aggregation pipelines do NOT trigger these hooks. `MessageRepository.findByConversationId` builds its `$match` filter with NO `isDeleted` clause, and `populateAlbumMessages` (`:159`) has no `isDeleted` guard either. Result: soft-deleted messages leak into message history and album lookups. (Conversation list path DOES add `isDeleted:false` explicitly — see D-note — but message path does not.)
Fix: add `isDeleted: { $ne: true }` to the message `$match` filter and the album `$match`; or a shared `withSoftDeleteMatch()` helper reused by every raw `aggregate()` in the service.
Effort: S.

### D3 — `findActiveConversationById` bypasses tenant scoping on the outbound send path
File: `apps/conversation-service/src/app/repositories/conversation.repository.ts:226-232`, called from `services/message.service.ts:991` (outbound message resolve) and `conversation-sla-reminder-cron.service.ts:136`
Query is `{ _id, status: OPEN }` with NO `companyId`/`organizationId`. The method's own doc says "without tenant scoping... where tenant context is not required" — but `message.service.ts` uses it to resolve the conversation an outbound message is sent through. If a caller passes a `conversationId` from another tenant (or an id is reused/guessed), the send proceeds against a foreign tenant's conversation. Multi-tenant isolation must never depend on "the caller passed the right id."
Fix: require `companyId`/`organizationId` and use `findOneByTenant`; if a truly global lookup is needed for cron, keep a separate explicitly-named method and assert the caller is a trusted internal cron, not the message send path.
Effort: M (thread tenant context through `message.service.ts` resolve).

---

## MAJOR

### A1 — Pagination `limit` is clamped to 5, not the intended max, on gRPC-driven reads
File: `libs/common/src/lib/decorators/index.ts:169-180`
Decorator does `limit: Math.min(parseInt(limit), DEFAULT_MIN_LIMIT_PAGINATION)` — it caps limit at the MIN (5), not `DEFAULT_MAX_LIMIT_PAGINATION` (200). Any endpoint using this decorator can never return more than 5 items regardless of client request. Either a latent bug or a copy-paste of the wrong constant; contract says max 200 (`PaginationDto` `@Max(200)` at `lib/dto/index.ts:67`).
Fix: `Math.min(parseInt(limit), DEFAULT_MAX_LIMIT_PAGINATION)`.
Effort: S. (Verify which endpoints use this decorator vs `PaginationDto` before shipping.)

### A2 — Total-count contract is a lower-bound estimate, silently
File: `apps/conversation-service/src/app/repositories/conversation.repository.ts:264, 469`
Conversation list total comes from Atlas Search `$$SEARCH_META.count.lowerBound` with `count: { threshold: 100_000, type: 'lowerBound' }`. Above 100k matches the `total`/`totalPages`/`hasNext` in `PaginatedResponse` are WRONG (undercounted). The proto `PaginatedResponse.total` (`proto/common.proto:23`) is typed as an exact `int32` with no "approximate" flag — the FE cannot tell an estimate from a truth. Pagination past the estimated last page returns empty even though data exists.
Fix: either use `type: 'total'`, or add an `approximate`/`isLowerBound` bool to `PaginatedResponse` and have FE render "100,000+".
Effort: M.

### A3 — Main conversation list HARD-depends on Atlas Search; no working fallback
File: `apps/conversation-service/src/app/repositories/conversation.repository.ts:311-317`
`buildConversationPipeline` ALWAYS emits `$search` as stage 1 (`buildAtlasSearchPipelineStage`). The doc comments and a fully-built `buildSearchPipelineStage` (regex fallback, `:375`) claim a "falls back to regex if Atlas disabled" path, but nothing calls it from the list path — there is no `ATLAS_SEARCH.ENABLED` branch (grep: only referenced in a comment). If the `conversation-attribute-index` is absent, rebuilding, or the tier lacks Atlas Search, the entire conversation list endpoint 500s. Dead fallback code also misleads maintainers.
Fix: gate on a real `ATLAS_SEARCH.ENABLED` flag and route to the regex `$match` pipeline when off, or delete the dead regex path and document Atlas as a hard dependency + add a health check.
Effort: M.

### A4 — `metaData` typed as `[Mixed]` — unbounded, unindexed, unvalidated, and searched
File: `schemas/conversation.schema.ts:406-407` (`metaData?: Record<string, any>[]`), `message.schema.ts:` (`metaData?: Record<string, any>`), Atlas wildcard search on `metaData.*` (`conversation.repository.ts:` should-clauses)
Mixed arrays with a wildcard search path mean arbitrary client-supplied keys become searchable/stored with no shape, no size cap, no key allowlist. Combined with the security audit's "unvalidated metaData" (t_b2b7a6c0), this is a document-bloat + query-cost vector: a client can push large/deep metadata that inflates every list query's `$search` cost and gRPC payload.
Fix: define an explicit sub-schema or cap keys/size + validate at the DTO boundary; scope the wildcard search to an allowlist.
Effort: M.

### A5 — Conversation `sessionDetails` / `accountChannel` / `participants` are unbounded embedded arrays
File: `schemas/conversation.schema.ts` (`accountChannel: AccountChannelInfo[]` :400, `participants?: ParticipantInfo[]`, `sessionDetails?: CustomAttributeCollection[]`, `memberContactInfo: ContactInfo[]`)
Group conversations accumulate `accountChannel` entries "from many team members' accounts" (repo comment at `setAccountChannelInTeamFlag`). Unbounded embedded arrays inside a document that is returned on EVERY list page (with `$lookup` of latestMessage) risk the 16MB BSON limit and inflate every read. `accountChannel` array is also positionally significant ("tail = current sender") — array growth + positional semantics is fragile.
Fix: cap array sizes (or move `accountChannel` history to a side collection keeping only active on the doc); add a guard/alert when arrays exceed a threshold. Model "current sender" as an explicit field, not `array.at(-1)`.
Effort: L.

### A6 — Unique index on `(accountChannel.id, channel.id, contactInfo.id)` uses a hard-coded string status
File: `schemas/conversation.schema.ts:510-519`
The partial unique index filters on `status: 'open'` and `deleted: false` (literal strings). But (a) the schema field is `isDeleted` (soft-delete plugin), NOT `deleted` — so `partialFilterExpression: { deleted: false }` never matches any document and the partial filter is effectively inert on that key; (b) `status` enum value must exactly equal the stored casing from `ConversationStatusEnum.OPEN`. If enum value isn't the literal `'open'`, the index guards nothing. Net: the "one open conversation per (channel,contact)" invariant may not actually be enforced → duplicate open conversations. This matches the retry-on-`E11000` machinery in the repo (`MONGO_DUPLICATE_KEY_ERROR`) which only covers `conversationNumber`, not this compound.
Fix: change `deleted` → `isDeleted`; assert `status` literal matches the enum value (`ConversationStatusEnum.OPEN`) via a constant, not a magic string; verify the index is actually built and enforcing.
Effort: S–M (needs data cleanup for existing dupes before enabling).

### A7 — No transaction around create-conversation + counter increment; partial-write window
File: `apps/conversation-service/src/app/repositories/conversation.repository.ts:` `generateConversationNumber` (findOneAndUpdate `$inc` upsert) then separate conversation insert with `MAX_CONVERSATION_RETRIES`/`delayWithJitter`
`conversationNumber` is generated by an atomic counter increment, then the conversation is inserted separately with retry-on-duplicate. If the insert fails permanently after the counter was incremented, that `CV-N` number is burned (gaps), and the retry loop re-increments on each attempt → non-contiguous numbers. Not corruption, but the "conversation number" is a user-facing identifier; gaps + races are a contract wart. Under high concurrency the jitter-retry is a soft-serialize, not a guarantee.
Fix: allocate number inside the same session/transaction as the insert, or accept gaps explicitly and document it. If contiguity matters, use a dedicated sequence with the insert in one txn.
Effort: M.

### A8 — Cross-service references stored as denormalized snapshots with no reconciliation contract
File: `schemas/conversation.schema.ts` (`ContactInfo`, `AccountChannelInfo`, `TeamInfo`, `TagInfo` all embedded with `lastSyncedAt`), synced via `@MessagePattern(CLIENT_CONTACT_UPDATED / ACCOUNT_CHANNEL_UPDATED / TEAM_ACCOUNT_CHANNEL_*)` in `conversation.controller.ts`
Contact/channel/team/tag data is snapshotted into every conversation and kept in sync ONLY by fire-and-forget RMQ events. There is no periodic reconciliation and the event handlers return `{success:false}` on missing fields rather than dead-lettering (`handleAutoPullParticipants`, `handleAgentStatusChanged` swallow with a warn log, `Promise.allSettled`). A dropped/failed event leaves conversations with stale contact names, phone numbers, team membership indefinitely. `lastSyncedAt` exists but nothing appears to act on staleness.
Fix: define a reconciliation job keyed on `lastSyncedAt`, and route failed sync events to a DLQ instead of returning a soft `success:false`.
Effort: L.

---

## MINOR

### M1 — `metadata` vs `metaData` field-name drift across layers
`conversation.controller.ts` manually does `obj['metadata'] = obj.metaData` before `mapMongoToProto` (twice: `getConversation`, `mapConversationsToProto`). Schema field is `metaData`, proto/FE field is `metadata`. This manual remap is easy to forget on new endpoints (any new read that returns a conversation must remember it). One canonical mapper should own the rename.
Fix: fold the rename into `mapMongoToProto` or a `toConversationProto` helper. Effort: S.

### M2 — `GetConversationHistoryDto.accountChannelIds` marked required but defaults to `[]`
File: `apps/api-gateway/src/app/conversation/dto/get-conversation-history.dto.ts`
`@IsNotEmpty() accountChannelIds: string[] = []` — a default of `[]` makes `@IsNotEmpty` on an array ambiguous (empty array may pass depending on validator config) and the field is documented `required: true`. Contract is self-contradictory.
Fix: `@ArrayNotEmpty()` and drop the `= []` default, or make it genuinely optional. Effort: S.

### M3 — Boolean query params validated with `@IsBoolean()` but arrive as strings
File: `apps/api-gateway/src/app/conversation/dto/getConversations.dto.ts` (`isFavorite/isSpam/assign/unassign/isJunked/reset` all `@IsBoolean()`), except `hideEmpty` which correctly uses `@IsBooleanString()`
Query-string values are strings (`?isFavorite=true`). `@IsBoolean()` without a `@Transform`/`@Type` will reject `"true"` unless global transform coerces it. Inconsistent with `hideEmpty`'s `@IsBooleanString()`. Either all should transform or all should be boolean-string.
Fix: add `@Transform(({value}) => value === 'true')` (or `@Type(() => Boolean)` with implicit conversion) consistently. Effort: S.

### M4 — `Pagination.sort`/`order` are free-form strings — no field allowlist
File: `proto/common.proto:16-21` (`string sort`, `optional string order`), consumed by `buildFilterSort`
Sort field is a client-supplied string mapped to a Mongo sort. Without an allowlist, a client can request a sort on an unindexed field → forces in-memory sort / COLLSCAN (perf DoS), and it's a weak contract (typos silently ignored or error unpredictably).
Fix: allowlist sortable fields in `buildFilterSort`, reject others with a clear 400. Effort: S.

### M5 — Event-handler payloads typed `any`, validated ad-hoc
File: `conversation.controller.ts` (`handleTeamAccountChannelAdded/Removed/SyncTeamConversations` all `@Payload() data: any` with inline `if (!data.x)` checks)
RMQ message contracts are untyped `any` with hand-rolled required-field checks that return `{success:false}`. No schema, no shared DTO, drift-prone between producer and consumer.
Fix: shared typed DTOs (like `RoundRobinByParticipantsDto`, `UpdateMemberContactDto` already used elsewhere) for every `@MessagePattern`. Effort: M.

### M6 — Mixed sort keys: `createdAt` vs `timestamp` vs `updatedAt` inconsistently across queries
`getConversationsForExportBatched` sorts `{ createdAt: 1 }`, `findUnassignedConversationGroups` `{ createdAt: 1 }`, message reads sort by `buildFilterSort` (client-driven), conversation has both a `timestamp` field AND schema `timestamps:true` (`createdAt`/`updatedAt`). Three time fields with overlapping meaning invite index misses and ordering bugs.
Fix: document which field is authoritative for ordering and index that one; consider dropping the redundant manual `timestamp` if `createdAt` suffices. Effort: M.

### M7 — `counter`/`conversation_counters` collections have no upper-bound / overflow handling; `Counter.channels`/`teamInboxes` unbounded arrays
File: `schemas/counter.schema.ts`, `conversation-counter.schema.ts`
`ConversationCounter.counter` is an ever-incrementing `Number` (fine at JS scale) but `Counter.channels[]`/`teamInboxes[]` are unbounded embedded arrays recomputed and pushed on counter updates; large workspaces bloat the per-user counter doc read on every inbox load.
Fix: cap or paginate; verify counter recompute isn't O(conversations) per update. Effort: M.

---

## Positive controls (correctly handled — do not regress)

- `messages` pagination lookups run AFTER `$skip/$limit` inside `$facet` (`message.repository.ts:88-120`) — avoids N+1 on attachments/reply; album fetched in ONE batched `$in` query (`populateAlbumMessages`), explicitly replacing a nested-lookup N+1. Good.
- `htmlContent` (multi-MB email body) projected OUT of conversation list lookups to avoid gRPC max-message-size (`conversation.repository.ts` `buildLookupPipeline` `$project`). Good.
- `conversationNumber` uniqueness enforced by a real partial unique index + `E11000` retry-with-jitter (`conversation.repository.ts` `generateConversationNumber` / `isDuplicateConversationNumber`). Good (contrast with A6 which does NOT work).
- Session-detail collection/field renames use atomic `findOneAndUpdate` with `$elemMatch $ne` uniqueness guard + `arrayFilters` (`renameSessionDetailCollection`, `updateSessionDetailField`) — race-safe. Good.
- TTL index on `expiresAt` (`conversation.schema.ts:456` `expireAfterSeconds:0`) for auto-expiry. Good.
- Bulk ops (`bulkPin/Spam/Read/Star/Junked`) are single `updateMany` with tenant scoping — not per-id loops. Good.
- `phoneLast4` indexed + short-numeric-query heuristic for privacy-safe phone search. Good.

---

## Recommended fix order (data/API only)

1. D1 (message index) — S, highest ROI, prod-scale read.
2. D2 (soft-delete in aggregations) — S, correctness/data-leak.
3. A1 (limit clamp bug) — S, likely breaking pagination now.
4. D3 (tenant bypass on send) — M, isolation.
5. A6 (broken partial unique index) — S code / M data cleanup, dup-conversation invariant.
6. A3 (Atlas hard-dependency) — M, availability.
7. A2 (approximate count contract) — M, FE correctness.
8. A4/A5/A7/A8 — M/L, schedule as hardening.
9. Minor batch (M1–M7) — bundle into contract-cleanup PR.

Cross-ref: security/perf findings (unvalidated metaData, no content-length cap, unbounded batch-delete array) in `2026-09-02-conversation-security-perf-audit.md` (t_b2b7a6c0) overlap with A4 and D-notes — dedupe at consolidation (t_513dd719).
