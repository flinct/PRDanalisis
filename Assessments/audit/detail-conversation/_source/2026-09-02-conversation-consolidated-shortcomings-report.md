# Conversation Feature — Consolidated Shortcomings Report

Date: 2026-09-02
Owner: Dany Christian (Product Manager) · Eng Lead: Naftal Yunior
Sources: 4 parallel audits of the SatuInbox Conversation feature
- Functional & Business Logic (t_4fce10b4) — 22 findings
- Data Model & API Contract (t_d2e41ce1) — 18 findings
- Security & Performance (t_b2b7a6c0) — 13 findings
- UX & Accessibility (t_ee1a7a9d) — 17 findings

Raw total 70. After dedupe: **64 distinct shortcomings** (6 cross-audit overlaps merged).
Backends: `Desktop/BE satuinbox/omnichannel-satuinbox-be`. Frontend: `omnichannel-satuinbox-fe`.

---

## 1. Executive Summary

| Priority | Count | Definition |
|----------|-------|------------|
| P0 — Blocker | 7 | Data corruption, tenant-isolation break, authz bypass, or prod-scale outage. Fix before next release. |
| P1 — High | 15 | Real-traffic correctness/perf cliff, security hardening, or a11y blocker. Next sprint. |
| P2 — Medium | 24 | Contract debt, non-atomic edge races, UX gaps. Backlog, bundle by area. |
| P3 — Low | 18 | Maintainability, config hardcoding, minor a11y polish. Opportunistic. |

Themes: (1) **multi-tenant isolation** leaks on the hot send path; (2) **missing DB indexes + soft-delete gaps** on the single hottest read; (3) **input validation absent at trust boundary** (no length caps, no sanitization, unbounded arrays/objects); (4) **rate limiting on 1 of ~30 endpoints**; (5) **conversation state model too thin** (no pending/sending, reopen forks documents); (6) **a11y baseline missing** (no labels, landmarks, focus management, aria-live).

Overlaps merged:
- unvalidated `metaData`: SEC S5 + DATA A4 → **P0-adjacent P1-04**
- content-length + storage bloat: SEC S3 + DATA A4/A5 notes → **P1-03**
- clear-all filter: UX N6 + prior 2026-06 UI audit finding #4 → **P3, noted once**
- soft-delete leak surfaces in both DATA D2 and functional edge → single entry **P0-02**
- Redis-only dedup + DB dedup index: FUNC F-06 references missing index that DATA also implies → **P1-06**
- non-atomic unread/counter: FUNC F-20 + F-24 → single entry **P2-07**

---

## 2. P0 — Blockers (fix before release)

| ID | Aspect | Finding | Source | Fix | Effort |
|----|--------|---------|--------|-----|--------|
| P0-01 | Security | `POST /conversations/send` has NO `@RequirePermissions` and no throttle (labeled "test only" but in prod controller). Any authed user sends to any conversation → privilege escalation across team/role boundaries. `conversation.controller.ts:1408-1425` | SEC S1 | Add `@RequirePermissions([SEND_MESSAGE])` + `@Throttle`; or move to dev-only test controller behind feature flag. | S |
| P0-02 | Data | Soft-delete filter bypassed in every aggregation path — Mongoose `pre(/^find/)` hooks don't fire on `aggregate()`. `findByConversationId` + `populateAlbumMessages` have no `isDeleted` guard → deleted messages leak into history + album lookups. `message.repository.ts:88-120`, `database.module.ts:111-122` | DATA D2 | Add `isDeleted: { $ne: true }` to message `$match` + album `$match`; extract `withSoftDeleteMatch()` helper for all raw `aggregate()`. | S |
| P0-03 | Data/Perf | Message collection has ZERO indexes — `conversationId` unindexed, no compound index. Every conversation open = COLLSCAN + in-memory sort on a collection sized ~254K/query. Hottest read in the product. `message.schema.ts:180-183` | DATA D1 | `MessageSchema.index({ conversationId: 1, createdAt: -1 })` (+ `timestamp` variant if that's the sort key). Rolling index build. | S |
| P0-04 | Data/Security | `findActiveConversationById` (`{_id, status:OPEN}`, NO tenant scope) is used on the **outbound send path** (`message.service.ts:991`). A conversationId from another tenant resolves + sends against a foreign tenant's conversation. Isolation must not depend on caller-supplied id. `conversation.repository.ts:226-232` | DATA D3 | Require `companyId`/`organizationId`, use `findOneByTenant`. Keep any global variant as a separately-named cron-only method. | M |
| P0-05 | Security | Open API controller (`@ApiKeyAuth()`) has ZERO throttling on every endpoint (list, get messages, create, patch). Key compromise = unlimited flood, enumeration, scraping. `conversation.open.controller.ts` (whole file) | SEC S2 | Add `@Throttle` to every open endpoint; stricter limit (~30 req/min) for M2M. | S |
| P0-06 | Data | TOCTOU race in `findOrCreateConversation` — two concurrent inbound msgs from same contact both find `null`, both create. The guarding partial-unique index is also broken (see P0-07), so nothing catches the dup. `createWithRetry` only retries on `conversationNumber`, not the contact-channel violation. | FUNC F-10 | Upsert-based creation or transaction; make `createWithRetry` catch the contact-channel `E11000` too. Depends on P0-07 index fix. | M |
| P0-07 | Data | Partial-unique index on `(accountChannel.id, channel.id, contactInfo.id)` filters on `deleted:false` but the schema field is `isDeleted` → filter matches nothing, index is inert. "One open conversation per (channel,contact)" invariant NOT enforced → duplicate open conversations. `conversation.schema.ts:510-519` | DATA A6 | Change `deleted`→`isDeleted`; assert `status` literal equals `ConversationStatusEnum.OPEN` via constant; clean existing dupes before rebuild. | S code / M data |

---

## 3. P1 — High (next sprint)

| ID | Aspect | Finding | Source | Fix | Effort |
|----|--------|---------|--------|-----|--------|
| P1-01 | Data/API | Pagination `limit` clamped to MIN (5) not MAX (200) — `Math.min(limit, DEFAULT_MIN_LIMIT_PAGINATION)`. Any endpoint via this decorator can never return >5 items. `decorators/index.ts:169-180` | DATA A1 | `Math.min(limit, DEFAULT_MAX_LIMIT_PAGINATION)`. Verify which endpoints use decorator vs `PaginationDto`. | S |
| P1-02 | Perf/Security | Rate limiting on 1 of ~30 conversation endpoints (only `countConversation`). All write endpoints (send/edit/delete/assign/bulk) unthrottled. `conversation.controller.ts` | SEC P2 | `@Throttle` on all write endpoints; consider controller-wide guard. | S–M |
| P1-03 | Security | No content-length validation — `content`/`htmlContent`/`subject` are bare `@IsString()`. Multi-MB string abuse → hits 16MB BSON limit, memory exhaustion. `libs/common/.../dto/index.ts:171-250` | SEC S3 | `@MaxLength(10000)` content, `50000` htmlContent, `500` subject; enforce gateway + service. | S |
| P1-04 | Security/Data | `metaData: Record<string,any>` only `@IsObject()` — no schema/depth/key allowlist. Prototype-pollution surface + doc bloat; also wildcard-searched (`metaData.*`) so it inflates every list `$search` cost. `dto/index.ts`, `create-message.dto.ts`, `conversation.schema.ts:406-407` | SEC S5 + DATA A4 | Strict per-type sub-schema or key/size cap + depth validation at DTO boundary; scope wildcard search to allowlist. | M |
| P1-05 | Security | No XSS/content sanitization anywhere (zero `sanitize`/`xss`/`DOMPurify`). Message + email HTML stored + served as-is → stored XSS if any FE renders as HTML. | SEC S4 (+S8) | Whitelist sanitizer on `content`/`htmlContent` at ingestion; at min strip `<script>` + event handlers. | M |
| P1-06 | Functional/Data | Message dedup is Redis-only, fail-open — Redis down = `false` = duplicate delivered. No DB unique index on `(externalMessageId, identifierId)`. Outbound dedup TTL 10min vs inbound 1week (inconsistent). | FUNC F-05 + F-06 | Add DB unique index as fallback; align outbound TTL to ≥1h (ideally 1week). | S–M |
| P1-07 | Security | WebSocket widget user impersonation — `SET_WIDGET_USER` stores arbitrary `id`/`name` as `userId` with no check vs authed identity. Impersonate any agent. `conversation.gateway.ts:130-150` | SEC S6 | For API_KEY auth, validate `payload.id` == authed contact; for BEARER reject `SET_WIDGET_USER`. | M |
| P1-08 | Security/Perf | `BatchDeleteMessageDto.messages[]` no `@ArrayMaxSize` AND `batchDeleteMessage` processes sequentially (`for … await deleteMessage`). Thousands of ids × sequential DB+authz+socket = DoS. `batch-delete-message.dto.ts`, `message.service.ts:1490-1510` | SEC S7 + P1 | `@ArrayMaxSize(50)`; parallelize with `Promise.allSettled` or chunks of 10. | S |
| P1-09 | Data | Conversation list HARD-depends on Atlas Search; the "regex fallback" is dead code never called. Missing/rebuilding index = whole list endpoint 500s. `conversation.repository.ts:311-317` | DATA A3 | Gate on real `ATLAS_SEARCH.ENABLED` flag routing to regex `$match`, or delete dead path + document hard dep + add health check. | M |
| P1-10 | Functional | No message status enum — created→delivered with no PENDING/SENT/DELIVERED/READ/FAILED. Slow/failed WhatsApp API leaves record with no status → agents can't tell queued from failed. | FUNC F-01 | Add message-status enum + transitions on outbound. | M |
| P1-11 | Functional | Reopen creates a NEW conversation doc (`reopenConversation`→`createUniqueConversation`), not a status flip. History split across chained `parentReOpenId` docs; broken link = orphaned history. Chains also unbounded (F-14). | FUNC F-02 + F-14 | Flatten history into one doc OR cap reopen depth + index `parentReOpenId` for traversal. | M |
| P1-12 | Functional | Empty message body not validated at service layer — inbound processor persists whatever adapter delivers (empty text, media-only w/ missing URL). No guard at `message.service.createMessage`. | FUNC F-18 | Reject/flag empty-body messages at service boundary. | S |
| P1-13 | A11y | Icon-only buttons have no accessible labels — header actions (screenshot/ticket/sidebar/close) `C1` + input toolbar (macro/attach/emoji) `C2`. Screen readers announce bare "button". | UX C1 + C2 | Add `aria-label` (translated) to `ActionIconButton` and each input action button. | S |
| P1-14 | A11y | No landmarks / skip nav — 3-column layout is plain `<div>`s, no `<nav>/<main>/<aside>`, no skip link. SR users can't navigate panels. `ManageConversationPage.tsx:42-57` | UX C3 | Wrap panels in semantic landmarks + visually-hidden skip link. | S |
| P1-15 | A11y/UX | Mention badge broken — `CLS.MESSAGE_MENTION_BADGE` referenced but never defined → className `undefined`, badge unstyled/invisible. Agents miss @mentions. `ConversationCard.tsx:464` | UX C4 | Define `MESSAGE_MENTION_BADGE` in `CLS`. | S |

---

## 4. P2 — Medium (backlog, bundle by area)

| ID | Aspect | Finding | Source | Fix | Effort |
|----|--------|---------|--------|-----|--------|
| P2-01 | Data/API | Total-count is a silent lower-bound estimate (`$$SEARCH_META.count.lowerBound`, threshold 100k). Proto `total` typed exact int32, no approx flag → FE paginates past real last page into empties. | DATA A2 | `type:'total'` or add `isLowerBound` flag + FE "100,000+". | M |
| P2-02 | Data | No transaction around create-conversation + counter `$inc` → burned `CV-N` numbers + non-contiguous gaps under retry. User-facing id wart. | DATA A7 | Allocate number in same txn/session as insert, or document gaps as accepted. | M |
| P2-03 | Data | Denormalized contact/channel/team/tag snapshots synced only by fire-and-forget RMQ; failures return soft `{success:false}`, no DLQ, no reconciliation → stale names/phones indefinitely. `lastSyncedAt` unused. | DATA A8 | Reconciliation job on `lastSyncedAt` + DLQ failed sync events. | L |
| P2-04 | Data | Unbounded embedded arrays on conversation (`accountChannel[]`, `participants[]`, `sessionDetails[]`, `memberContactInfo[]`) returned on every list page → 16MB BSON risk + read bloat; `accountChannel` positional "current sender" fragile. | DATA A5 | Cap array sizes / move history to side collection; model current sender as explicit field. | L |
| P2-05 | Functional | WhatsApp re-engagement window throws bare error, no template fallback path/UX. `validateWhatsappReEngagementWindow` | FUNC F-07 | Return available templates instead of raw error; guided template send. | M |
| P2-06 | Functional | Account channel selection no fallback when all channels inactive → `NO_ELIGIBLE_ACCOUNT_CHANNEL`, message lost until manual retry. | FUNC F-08 | Retry-when-channel-recovers or queue + notify. | M |
| P2-07 | Functional | Non-atomic unread/counter — `markReadConversation` `$set:{unread:0}` vs inbound `$inc` = classic increment-vs-set race; message between read+set loses its increment. `updateLastMessage` SLA direction also non-atomic (F-09). | FUNC F-20 + F-24 + F-09 | Conditional `$set` guarded by version/timestamp, or compute unread from query; atomic direction read+write. | M |
| P2-08 | Functional | Inbound DLQ has no replay — 3 retries then `messageFailedRepository`, no auto-retry, no admin replay UI. | FUNC F-11 | DLQ replay mechanism + admin UI/endpoint. | M |
| P2-09 | Functional | `isNew` uses `conversation.latestMessage` — a conversation created but with failed message-persist is treated "new" next inbound → duplicate conversation. line 654 | FUNC F-12 | Base `isNew` on existence/age, not `latestMessage`. | S |
| P2-10 | Functional | Concurrent assign/unassign not serialized — both read-modify-write participants array, last-write-wins loses an update. | FUNC F-19 | `$addToSet`/`$pull` instead of full array replace. | S |
| P2-11 | Functional | Email threading keyed on `accountChannel.id` only — same customer from a different email address forks a new conversation, no cross-address threading. | FUNC F-15 | Thread on contact-level `referenceId` across addresses where identity known. | M |
| P2-12 | Functional | Instagram comment threading falls through when `rootCommentId` null/missing → reply forks separate conversation. | FUNC F-16 | Fallback threading heuristic when `rootCommentId` absent. | S |
| P2-13 | Functional | No snooze / "waiting for customer" state — only OPEN/CLOSE, agents pollute open queue or close prematurely. | FUNC F-03 | Add intermediate state (snooze/pending) + queue filter. | M |
| P2-14 | Perf | Typing indicators broadcast to entire company namespace, not conversation room — O(agents × keystrokes). `conversation.gateway.ts:230-260` | SEC P3 | Broadcast to `PREFIX_CONVERSATION + conversationId` room. | S |
| P2-15 | Perf | Regex search fallback = collection scan without text index; fine small, bad at scale. `conversation-search.repository.ts:107-313` | SEC P4 | Ensure Atlas index always present or add compound indexes on searched fields. | M |
| P2-16 | A11y | No focus management on conversation switch — focus stays on list item; `autoFocus` fires only on mount. `ManageConversationPage.tsx` | UX C5 | On `activeConversation.id` change, focus chat room/input via ref. | S |
| P2-17 | A11y | No `aria-live` in chat room — new messages/typing/errors not announced. `ConversationChatRoomContainer.tsx` | UX M3 | `aria-live="polite"` region announcing new message/sender. | S |
| P2-18 | A11y | Status banners (removed-from-conversation, disconnected-account, no-session) lack `role="alert"`. | UX M4 | Add `role="alert"` to each banner container. | S |
| P2-19 | UX | Auto-scroll only on own pending messages — incoming customer messages don't scroll. `ConversationChatRoomContainer.tsx:77-87` | UX M5 | Also scroll on new incoming when near-bottom. | S |
| P2-20 | A11y | Screenshot overlay = full-viewport `<button>`, no `aria-label`, no `role`, no Escape dismissal. `ManageConversationPage.tsx:48-55` | UX M7 | `aria-label="Cancel screenshot"`, `role="dialog"`, Escape handler. | S |
| P2-21 | UX/i18n | Empty chat-room state = image only, no heading/desc/CTA (vs proper `EmptyConversation`). `ConversationChatRoomEmpty.tsx` | UX M1 | Add heading + description mirroring `EmptyConversation`. | S |
| P2-22 | UX/i18n | InvalidState hardcoded English "Conversation not found.", no i18n, no recovery action. `InvalidState.tsx` | UX M2 | i18n + icon + back-to-list link. | S |
| P2-23 | A11y | Color contrast — `gray-500`/`slate-500` on white ~4.6:1, `text-xs` may fail WCAG AA. | UX M6 | Bump small text to `*-600/700`. | S |
| P2-24 | Data | Message aggregation partial-index dependency + `metaData` search cost cluster — covered by P0-03/P1-04 but flagged for combined index-tuning PR. | DATA (cross) | Bundle with P0-03 index work. | S |

---

## 5. P3 — Low (opportunistic / maintainability)

| ID | Aspect | Finding | Source | Fix | Effort |
|----|--------|---------|--------|-----|--------|
| P3-01 | Data | `metadata` vs `metaData` field-name drift — manual remap per endpoint, easy to forget on new reads. | DATA M1 | Fold rename into `mapMongoToProto`/`toConversationProto`. | S |
| P3-02 | API | `GetConversationHistoryDto.accountChannelIds` `@IsNotEmpty()` with `= []` default — contradictory contract. | DATA M2 | `@ArrayNotEmpty()`, drop default, or make optional. | S |
| P3-03 | API | Boolean query params `@IsBoolean()` but arrive as strings; inconsistent with `hideEmpty`'s `@IsBooleanString()`. | DATA M3 | Consistent `@Transform(value==='true')` or boolean-string across all. | S |
| P3-04 | API/Perf | `Pagination.sort`/`order` free-form strings, no field allowlist → sort on unindexed field = COLLSCAN (perf DoS). | DATA M4 | Allowlist sortable fields in `buildFilterSort`, reject others 400. | S |
| P3-05 | API | RMQ `@MessagePattern` payloads typed `any` with ad-hoc `if(!data.x)` checks, no shared DTO. | DATA M5 | Shared typed DTOs per pattern. | M |
| P3-06 | Data | Mixed time keys — `createdAt` vs `timestamp` vs `updatedAt` across queries invite index misses/ordering bugs. | DATA M6 | Document authoritative ordering field, index it, drop redundant. | M |
| P3-07 | Data | `Counter.channels[]`/`teamInboxes[]` unbounded arrays recomputed on counter update; bloats per-user counter read on every inbox load. | DATA M7 | Cap/paginate; verify recompute isn't O(conversations). | M |
| P3-08 | Security | WebSocket CORS crash — `process.env[KEY].split(',') ?? '*'` throws if env undefined (error before `??`). `conversation.gateway.ts:38` | SEC S9 | `(process.env[KEY] ?? '*').split(',')`. | S |
| P3-09 | Functional | `UNRECOGNIZED` conversation status defined but never set — dead enum or external-only, unclear. | FUNC F-04 | Remove or document external-only source. | S |
| P3-10 | Functional | Group conversations skip SLA tracking (`if(!isGroup)`) with no escalation path for enterprise support groups. | FUNC F-13 | Optional group-SLA opt-in. | M |
| P3-11 | Functional | `EDIT_DELETE_WINDOW_MS = 5min` hardcoded, more restrictive than WhatsApp's 15min; no per-tenant/platform config. | FUNC F-21 | Make window configurable per platform. | S |
| P3-12 | Functional | `CLEANED_UP_STALE_ENTRIES = 5min` hardcoded stale-cleanup threshold, not configurable. | FUNC F-22 | Config threshold. | S |
| P3-13 | Functional | `conversationNumber` retry-on-collision with jitter may cause visible creation delay under high concurrency. | FUNC F-17 | Dedicated sequence allocator (ties to P2-02). | M |
| P3-14 | Functional | `counter.service.ts` is empty (0 bytes) — incomplete refactor / dead artifact. | FUNC F-23 | Delete file or complete intended extraction. | S |
| P3-15 | UX | Chat list hardcoded viewport heights `h-[calc(100vh-120px)]` — overflow/underflow when header height changes. | UX N1 | Flexbox `flex-1 overflow-y-auto`. | S |
| P3-16 | A11y | `autoFocus` on chat input jumps focus on mount, disorients SR users. | UX N2 | Remove `autoFocus`; programmatic focus after selection (ties P2-16). | S |
| P3-17 | A11y | `ConversationCard` uses `title` attr for truncated name (not keyboard-accessible). + typing indicator ignores `prefers-reduced-motion` (N4). + `ExpiredConversationWindow` fn-returns-fn handler confusing (N5). | UX N3+N4+N5 | `aria-label`/tooltip; reduced-motion guard; simplify handler. | S |
| P3-18 | UX | Filter bar has no visible "Clear all" reset (also in prior 2026-06 UI audit #4). `ConversationChatListFilter.tsx` | UX N6 | "Clear filters" button when any filter active. | S |

---

## 6. Recommended Next-Step Roadmap

Phase 0 — Hotfix (this week, all S-effort, high ROI)
1. P0-03 message index (COLLSCAN kill) → 1 line + rolling build.
2. P0-02 soft-delete in aggregations (data leak) → helper + 2 `$match`.
3. P0-01 sendMessage authz + P0-05 open-API throttle (authz/DoS).
4. P1-01 pagination limit clamp (likely breaking now).
5. P0-07 fix `deleted`→`isDeleted` in partial index (needs dup data cleanup first).

Phase 1 — Isolation & validation (next sprint)
6. P0-04 tenant scope on send path (M) + P0-06 TOCTOU (depends on P0-07).
7. P1-03/P1-04/P1-05 input validation cluster (length + metaData + sanitization) — one DTO-hardening PR.
8. P1-02/P1-08 rate-limit + batch-delete DoS.
9. P1-06 DB dedup index + TTL alignment.
10. P1-13/P1-14/P1-15 a11y quick wins (labels, landmarks, mention badge) — one FE PR.

Phase 2 — Model & availability
11. P1-09 Atlas fallback/health; P1-10 message-status enum; P1-11 reopen model.
12. P1-07 WS impersonation; P1-12 empty-message guard.
13. P2 data-hardening batch (A2/A5/A7/A8) + functional race batch (F-19/F-20/F-24).

Phase 3 — Polish
14. P2 a11y/UX batch (focus, aria-live, banners, empty states, contrast).
15. P3 contract-cleanup PR (M1–M7 minors) + config-extraction PR (hardcoded windows).

Cleanup prerequisite: P0-07 and P0-06 require de-duplicating existing duplicate open conversations in production data BEFORE enabling the enforced unique index. Schedule a data-cleanup migration ahead of the index rebuild.

---

## 7. Traceability Matrix (source ID → consolidated ID)

Functional (F): F-01→P1-10, F-02→P1-11, F-03→P2-13, F-04→P3-09, F-05→P1-06, F-06→P1-06, F-07→P2-05, F-08→P2-06, F-09→P2-07, F-10→P0-06, F-11→P2-08, F-12→P2-09, F-13→P3-10, F-14→P1-11, F-15→P2-11, F-16→P2-12, F-17→P3-13, F-18→P1-12, F-19→P2-10, F-20→P2-07, F-21→P3-11, F-22→P3-12, F-23→P3-14, F-24→P2-07.

Data (D/A/M): D1→P0-03, D2→P0-02, D3→P0-04, A1→P1-01, A2→P2-01, A3→P1-09, A4→P1-04, A5→P2-04, A6→P0-07, A7→P2-02, A8→P2-03, M1→P3-01, M2→P3-02, M3→P3-03, M4→P3-04, M5→P3-05, M6→P3-06, M7→P3-07.

Security/Perf (S/P): S1→P0-01, S2→P0-05, S3→P1-03, S4→P1-05, S5→P1-04, S6→P1-07, S7→P1-08, S8→P1-05, S9→P3-08, P1→P1-08, P2→P1-02, P3→P2-14, P4→P2-15.

UX (C/M/N): C1→P1-13, C2→P1-13, C3→P1-14, C4→P1-15, C5→P2-16, M1→P2-21, M2→P2-22, M3→P2-17, M4→P2-18, M5→P2-19, M6→P2-23, M7→P2-20, N1→P3-15, N2→P3-16, N3→P3-17, N4→P3-17, N5→P3-17, N6→P3-18.

Merges: {S5,A4}→P1-04 · {F-05,F-06}→P1-06 · {F-09,F-20,F-24}→P2-07 · {F-02,F-14}→P1-11 · {S4,S8}→P1-05 · {S7,P1}→P1-08. Positive controls from all four audits (25 total) preserved in source reports — do not regress.
