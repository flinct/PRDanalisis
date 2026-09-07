# SatuInbox — Conversation Feature Audit (Merged: Track D + Track E)

> **Gabungan 2 synthesis audit 2026-09-02** menjadi satu pintu masuk.
> - **Track E** — BE deep-dive (message engine, data model, API, security, perf, a11y) — 64 finding.
> - **Track D** — FE UX flow (first-time + returning user + interconnection Conversation↔Ticket↔Setting) — 41 finding.
>
> **Owner:** Dany Christian (PM) · **Eng Lead:** Naftal Yunior · **Tanggal:** 2026-09-02
> **Repo:** BE `omnichannel-satuinbox-be`, FE `omnichannel-satuinbox-fe` (baseline `prod-2.7.0` / `prod-2.7.0-11`)
>
> **Source detail (file:line penuh) diarsip di `_source/`:**
> Track E: `conversation-functional-business-logic.md`, `2026-09-02-conversation-data-model-api-contract-audit.md`, `2026-09-02-conversation-security-perf-audit.md`.
> Track D: `2026-09-02-conversation-first-time-user-flow-audit.md`, `2026-09-02-satuinbox-audit-2-conversation-returning-user-flow.md`.
>
> **Belum di-fold ke `core/audit-master-register.md`** — gate: ENV-01 branch-lock + dedup lintas-track (lihat `core/audit-review-and-reading-list.md` §4).

---

# BAGIAN 1 — TRACK E: BE Deep-Dive (Consolidated Shortcomings)

Sumber: 4 audit paralel — Functional & Business Logic (22), Data Model & API Contract (18), Security & Performance (13), UX & Accessibility (17). Raw 70 → **64 distinct** (6 overlap merged).

## 1.1 Ringkasan Prioritas

| Priority | Count | Definisi |
|----------|-------|----------|
| P0 — Blocker | 7 | Data corruption, tenant-isolation break, authz bypass, prod-scale outage. Fix sebelum rilis. |
| P1 — High | 15 | Correctness/perf cliff di traffic nyata, security hardening, a11y blocker. Next sprint. |
| P2 — Medium | 24 | Contract debt, non-atomic edge races, UX gaps. Backlog, bundle per area. |
| P3 — Low | 18 | Maintainability, config hardcoding, minor a11y polish. Opportunistic. |

**Tema:** (1) multi-tenant isolation leak di hot send path; (2) missing DB index + soft-delete gap di read terpanas; (3) input validation absent di trust boundary; (4) rate limit di 1 dari ~30 endpoint; (5) conversation state model terlalu tipis (no pending/sending, reopen fork dokumen); (6) a11y baseline hilang.

## 1.2 P0 — Blockers (fix sebelum rilis)

| ID | Aspect | Finding | Fix | Effort |
|----|--------|---------|-----|--------|
| P0-01 | Security | `POST /conversations/send` tanpa `@RequirePermissions` + tanpa throttle (label "test only" tapi di prod controller). Any authed user kirim ke conversation manapun → privilege escalation lintas team/role. `conversation.controller.ts:1408-1425` | Tambah `@RequirePermissions([SEND_MESSAGE])` + `@Throttle`; atau pindah ke dev-only controller di balik feature flag. | S |
| P0-02 | Data | Soft-delete filter di-bypass di semua aggregation — Mongoose `pre(/^find/)` hook tidak fire di `aggregate()`. `findByConversationId` + `populateAlbumMessages` tanpa `isDeleted` guard → deleted message bocor ke history + album. `message.repository.ts:88-120`, `database.module.ts:111-122` | Tambah `isDeleted:{$ne:true}` ke `$match` message + album; extract `withSoftDeleteMatch()` helper untuk semua raw `aggregate()`. | S |
| P0-03 | Data/Perf | Message collection ZERO index — `conversationId` unindexed, no compound index. Tiap open conversation = COLLSCAN + in-memory sort di collection ~254K/query. Read terpanas di produk. `message.schema.ts:180-183` | `MessageSchema.index({conversationId:1, createdAt:-1})` (+ `timestamp` variant jika itu sort key). Rolling index build. | S |
| P0-04 | Data/Security | `findActiveConversationById` (`{_id, status:OPEN}`, NO tenant scope) dipakai di outbound send path (`message.service.ts:991`). conversationId dari tenant lain resolve + send ke conversation tenant asing. Isolasi tidak boleh bergantung pada id dari caller. `conversation.repository.ts:226-232` | Wajibkan `companyId`/`organizationId`, pakai `findOneByTenant`. Simpan variant global sebagai method cron-only bernama terpisah. | M |
| P0-05 | Security | Open API controller (`@ApiKeyAuth()`) ZERO throttle di tiap endpoint (list, get, create, patch). Key compromise = flood unlimited, enumeration, scraping. `conversation.open.controller.ts` (whole file) | Tambah `@Throttle` tiap open endpoint; limit ketat (~30 req/min) untuk M2M. | S |
| P0-06 | Data | TOCTOU race di `findOrCreateConversation` — 2 inbound concurrent dari contact sama, dua-duanya find `null`, dua-duanya create. Partial-unique index guard-nya juga rusak (lihat P0-07), jadi tak ada yang catch dup. `createWithRetry` cuma retry di `conversationNumber`, bukan contact-channel violation. | Upsert-based creation atau transaction; `createWithRetry` catch `E11000` contact-channel juga. Depends on P0-07. | M |
| P0-07 | Data | Partial-unique index `(accountChannel.id, channel.id, contactInfo.id)` filter di `deleted:false` tapi field schema `isDeleted` → filter match nothing, index inert. Invariant "one open conversation per (channel,contact)" TIDAK enforced → duplicate open conversation. `conversation.schema.ts:510-519` | Ganti `deleted`→`isDeleted`; assert `status` literal = `ConversationStatusEnum.OPEN` via konstanta; bersihkan dup sebelum rebuild. | S code / M data |

## 1.3 P1 — High (next sprint)

| ID | Aspect | Finding | Fix | Effort |
|----|--------|---------|-----|--------|
| P1-01 | Data/API | Pagination `limit` di-clamp ke MIN (5) bukan MAX (200) — `Math.min(limit, DEFAULT_MIN_LIMIT_PAGINATION)`. Endpoint via decorator ini tak pernah return >5 item. `decorators/index.ts:169-180` | `Math.min(limit, DEFAULT_MAX_LIMIT_PAGINATION)`. Verify endpoint pakai decorator vs `PaginationDto`. | S |
| P1-02 | Perf/Security | Rate limit di 1 dari ~30 endpoint conversation (cuma `countConversation`). Semua write endpoint (send/edit/delete/assign/bulk) unthrottled. | `@Throttle` di semua write endpoint; consider controller-wide guard. | S–M |
| P1-03 | Security | No content-length validation — `content`/`htmlContent`/`subject` bare `@IsString()`. Multi-MB string abuse → 16MB BSON limit, memory exhaustion. `libs/common/.../dto/index.ts:171-250` | `@MaxLength(10000)` content, `50000` htmlContent, `500` subject; enforce gateway + service. | S |
| P1-04 | Security/Data | `metaData: Record<string,any>` cuma `@IsObject()` — no schema/depth/key allowlist. Prototype-pollution surface + doc bloat; wildcard-searched (`metaData.*`) inflate cost tiap list `$search`. | Strict per-type sub-schema atau key/size cap + depth validation di DTO boundary; scope wildcard search ke allowlist. | M |
| P1-05 | Security | No XSS/content sanitization (zero `sanitize`/`xss`/`DOMPurify`). Message + email HTML stored + served as-is → stored XSS jika ada FE render HTML. | Whitelist sanitizer `content`/`htmlContent` di ingestion; min strip `<script>` + event handler. | M |
| P1-06 | Functional/Data | Message dedup Redis-only, fail-open — Redis down = `false` = duplicate delivered. No DB unique index `(externalMessageId, identifierId)`. Outbound dedup TTL 10min vs inbound 1week (inkonsisten). | Tambah DB unique index sebagai fallback; align outbound TTL ke ≥1h (ideal 1week). | S–M |
| P1-07 | Security | WebSocket widget impersonation — `SET_WIDGET_USER` simpan arbitrary `id`/`name` sebagai `userId` tanpa cek vs authed identity. Impersonate any agent. `conversation.gateway.ts:130-150` | Untuk API_KEY auth, validate `payload.id`==authed contact; untuk BEARER reject `SET_WIDGET_USER`. | M |
| P1-08 | Security/Perf | `BatchDeleteMessageDto.messages[]` no `@ArrayMaxSize` DAN `batchDeleteMessage` sequential (`for … await`). Ribuan id × sequential DB+authz+socket = DoS. | `@ArrayMaxSize(50)`; parallelize `Promise.allSettled` atau chunk 10. | S |
| P1-09 | Data | Conversation list HARD-depend Atlas Search; "regex fallback" = dead code tak pernah dipanggil. Index missing/rebuild = seluruh list endpoint 500. `conversation.repository.ts:311-317` | Gate `ATLAS_SEARCH.ENABLED` routing ke regex `$match`, atau hapus dead path + dokumen hard dep + health check. | M |
| P1-10 | Functional | No message status enum — created→delivered tanpa PENDING/SENT/DELIVERED/READ/FAILED. WA API lambat/gagal = record tanpa status → agent tak bisa bedakan queued dari failed. | Tambah message-status enum + transition di outbound. | M |
| P1-11 | Functional | Reopen bikin conversation doc BARU (`reopenConversation`→`createUniqueConversation`), bukan status flip. History pecah lintas `parentReOpenId` docs; link putus = history orphan. Chain unbounded (F-14). | Flatten history ke satu doc ATAU cap reopen depth + index `parentReOpenId`. | M |
| P1-12 | Functional | Empty message body tak divalidasi di service layer — inbound processor persist apapun dari adapter (empty text, media-only tanpa URL). No guard di `message.service.createMessage`. | Reject/flag empty-body message di service boundary. | S |
| P1-13 | A11y | Icon-only button tanpa accessible label — header action (screenshot/ticket/sidebar/close) + input toolbar (macro/attach/emoji). SR announce bare "button". | Tambah `aria-label` (translated) ke `ActionIconButton` + tiap input action button. | S |
| P1-14 | A11y | No landmark / skip nav — 3-column layout plain `<div>`, no `<nav>/<main>/<aside>`, no skip link. `ManageConversationPage.tsx:42-57` | Wrap panel dalam semantic landmark + visually-hidden skip link. | S |
| P1-15 | A11y/UX | Mention badge rusak — `CLS.MESSAGE_MENTION_BADGE` direferensikan tapi tak pernah didefinisikan → className `undefined`, badge invisible. Agent miss @mention. `ConversationCard.tsx:464` | Definisikan `MESSAGE_MENTION_BADGE` di `CLS`. | S |

## 1.4 P2 — Medium (backlog, bundle per area)

| ID | Aspect | Finding | Fix | Effort |
|----|--------|---------|-----|--------|
| P2-01 | Data/API | Total-count = silent lower-bound estimate (`$$SEARCH_META.count.lowerBound`, threshold 100k). Proto `total` typed exact int32, no approx flag → FE paginate past real last page ke empty. | `type:'total'` atau tambah `isLowerBound` flag + FE "100,000+". | M |
| P2-02 | Data | No transaction sekitar create-conversation + counter `$inc` → burned `CV-N` number + gap non-contiguous saat retry. | Alokasi number dalam txn/session sama dengan insert, atau dokumen gap sebagai accepted. | M |
| P2-03 | Data | Denormalized snapshot (contact/channel/team/tag) sync cuma fire-and-forget RMQ; failure return soft `{success:false}`, no DLQ, no reconciliation → stale nama/phone indefinite. `lastSyncedAt` unused. | Reconciliation job di `lastSyncedAt` + DLQ failed sync event. | L |
| P2-04 | Data | Unbounded embedded array di conversation (`accountChannel[]`, `participants[]`, `sessionDetails[]`, `memberContactInfo[]`) di-return tiap list page → 16MB BSON risk + read bloat; `accountChannel` positional "current sender" fragile. | Cap array size / pindah history ke side collection; model current sender sebagai field eksplisit. | L |
| P2-05 | Functional | WhatsApp re-engagement window throw bare error, no template fallback path/UX. | Return available templates, bukan raw error; guided template send. | M |
| P2-06 | Functional | Account channel selection no fallback saat semua channel inactive → `NO_ELIGIBLE_ACCOUNT_CHANNEL`, message lost sampai manual retry. | Retry-when-channel-recovers atau queue + notify. | M |
| P2-07 | Functional | Non-atomic unread/counter — `markReadConversation` `$set:{unread:0}` vs inbound `$inc` = increment-vs-set race. `updateLastMessage` SLA direction juga non-atomic (F-09). | Conditional `$set` guarded version/timestamp, atau compute unread dari query; atomic direction read+write. | M |
| P2-08 | Functional | Inbound DLQ no replay — 3 retry lalu `messageFailedRepository`, no auto-retry, no admin replay UI. | DLQ replay mechanism + admin UI/endpoint. | M |
| P2-09 | Functional | `isNew` pakai `conversation.latestMessage` — conversation created tapi message-persist gagal dianggap "new" next inbound → duplicate conversation. line 654 | Base `isNew` pada existence/age, bukan `latestMessage`. | S |
| P2-10 | Functional | Concurrent assign/unassign tak serialized — dua-duanya read-modify-write participants array, last-write-wins hilangkan update. | `$addToSet`/`$pull` bukan full array replace. | S |
| P2-11 | Functional | Email threading keyed `accountChannel.id` only — customer sama dari email address beda fork conversation baru, no cross-address threading. | Thread di contact-level `referenceId` lintas address. | M |
| P2-12 | Functional | Instagram comment threading fall-through saat `rootCommentId` null/missing → reply fork conversation terpisah. | Fallback threading heuristic saat `rootCommentId` absent. | S |
| P2-13 | Functional | No snooze / "waiting for customer" state — cuma OPEN/CLOSE, agent polusi open queue atau close prematur. | Tambah intermediate state (snooze/pending) + queue filter. | M |
| P2-14 | Perf | Typing indicator broadcast ke seluruh company namespace, bukan conversation room — O(agents × keystroke). `conversation.gateway.ts:230-260` | Broadcast ke `PREFIX_CONVERSATION + conversationId` room. | S |
| P2-15 | Perf | Regex search fallback = collection scan tanpa text index; fine kecil, buruk di scale. `conversation-search.repository.ts:107-313` | Pastikan Atlas index selalu ada atau tambah compound index di searched field. | M |
| P2-16 | A11y | No focus management saat switch conversation — focus tetap di list item; `autoFocus` cuma di mount. `ManageConversationPage.tsx` | On `activeConversation.id` change, focus chat room/input via ref. | S |
| P2-17 | A11y | No `aria-live` di chat room — new message/typing/error tak diumumkan. `ConversationChatRoomContainer.tsx` | `aria-live="polite"` region announce new message/sender. | S |
| P2-18 | A11y | Status banner (removed-from-conv, disconnected-account, no-session) tanpa `role="alert"`. | Tambah `role="alert"` ke tiap banner container. | S |
| P2-19 | UX | Auto-scroll cuma di own pending message — incoming customer message tak scroll. `ConversationChatRoomContainer.tsx:77-87` | Scroll juga di new incoming saat near-bottom. | S |
| P2-20 | A11y | Screenshot overlay = full-viewport `<button>`, no `aria-label`, no `role`, no Escape dismissal. `ManageConversationPage.tsx:48-55` | `aria-label="Cancel screenshot"`, `role="dialog"`, Escape handler. | S |
| P2-21 | UX/i18n | Empty chat-room state = image only, no heading/desc/CTA. `ConversationChatRoomEmpty.tsx` | Tambah heading + description mirror `EmptyConversation`. | S |
| P2-22 | UX/i18n | InvalidState hardcoded English "Conversation not found.", no i18n, no recovery. `InvalidState.tsx` | i18n + icon + back-to-list link. | S |
| P2-23 | A11y | Color contrast — `gray-500`/`slate-500` on white ~4.6:1, `text-xs` mungkin fail WCAG AA. | Bump small text ke `*-600/700`. | S |
| P2-24 | Data | Message aggregation partial-index + `metaData` search cost cluster — covered P0-03/P1-04, flagged untuk combined index-tuning PR. | Bundle dengan P0-03 index work. | S |

## 1.5 P3 — Low (opportunistic / maintainability)

| ID | Aspect | Finding | Fix |
|----|--------|---------|-----|
| P3-01 | Data | `metadata` vs `metaData` field-name drift — manual remap per endpoint. | Fold rename ke `mapMongoToProto`/`toConversationProto`. |
| P3-02 | API | `GetConversationHistoryDto.accountChannelIds` `@IsNotEmpty()` dengan `= []` default — contract kontradiktif. | `@ArrayNotEmpty()`, drop default, atau optional. |
| P3-03 | API | Boolean query param `@IsBoolean()` tapi datang string; inkonsisten dengan `hideEmpty` `@IsBooleanString()`. | Consistent `@Transform(value==='true')` atau boolean-string. |
| P3-04 | API/Perf | `Pagination.sort`/`order` free-form string, no field allowlist → sort di unindexed field = COLLSCAN. | Allowlist sortable field di `buildFilterSort`, reject others 400. |
| P3-05 | API | RMQ `@MessagePattern` payload typed `any` dengan ad-hoc `if(!data.x)`, no shared DTO. | Shared typed DTO per pattern. |
| P3-06 | Data | Mixed time key — `createdAt` vs `timestamp` vs `updatedAt` → index miss/ordering bug. | Dokumen authoritative ordering field, index-kan, drop redundant. |
| P3-07 | Data | `Counter.channels[]`/`teamInboxes[]` unbounded array recomputed tiap counter update; bloat per-user counter read. | Cap/paginate; verify recompute bukan O(conversations). |
| P3-08 | Security | WebSocket CORS crash — `process.env[KEY].split(',') ?? '*'` throw jika env undefined. `conversation.gateway.ts:38` | `(process.env[KEY] ?? '*').split(',')`. |
| P3-09 | Functional | `UNRECOGNIZED` status didefinisikan tapi tak pernah di-set — dead enum atau external-only. | Remove atau dokumen external-only source. |
| P3-10 | Functional | Group conversation skip SLA (`if(!isGroup)`) tanpa escalation path untuk enterprise support group. | Optional group-SLA opt-in. |
| P3-11 | Functional | `EDIT_DELETE_WINDOW_MS = 5min` hardcoded, lebih restriktif dari WhatsApp 15min; no per-tenant/platform config. | Window configurable per platform. |
| P3-12 | Functional | `CLEANED_UP_STALE_ENTRIES = 5min` hardcoded stale-cleanup threshold, not configurable. | Config threshold. |
| P3-13 | Functional | `conversationNumber` retry-on-collision dengan jitter bisa delay creation visible di high concurrency. | Dedicated sequence allocator (ties P2-02). |
| P3-14 | Functional | `counter.service.ts` empty (0 bytes) — incomplete refactor / dead artifact. | Delete file atau selesaikan extraction. |
| P3-15 | UX | Chat list hardcoded viewport height `h-[calc(100vh-120px)]` — overflow saat header berubah. | Flexbox `flex-1 overflow-y-auto`. |
| P3-16 | A11y | `autoFocus` chat input jump focus on mount, disorient SR user. | Remove `autoFocus`; programmatic focus after selection (ties P2-16). |
| P3-17 | A11y | `ConversationCard` pakai `title` attr untuk truncated name (not keyboard-accessible) + typing indicator abaikan `prefers-reduced-motion` + `ExpiredConversationWindow` fn-returns-fn handler confusing. | `aria-label`/tooltip; reduced-motion guard; simplify handler. |
| P3-18 | UX | Filter bar no visible "Clear all" reset. `ConversationChatListFilter.tsx` | "Clear filters" button saat ada filter aktif. |

## 1.6 Traceability (source ID → consolidated ID)

**Functional (F):** F-01→P1-10, F-02→P1-11, F-03→P2-13, F-04→P3-09, F-05→P1-06, F-06→P1-06, F-07→P2-05, F-08→P2-06, F-09→P2-07, F-10→P0-06, F-11→P2-08, F-12→P2-09, F-13→P3-10, F-14→P1-11, F-15→P2-11, F-16→P2-12, F-17→P3-13, F-18→P1-12, F-19→P2-10, F-20→P2-07, F-21→P3-11, F-22→P3-12, F-23→P3-14, F-24→P2-07.

**Data (D/A/M):** D1→P0-03, D2→P0-02, D3→P0-04, A1→P1-01, A2→P2-01, A3→P1-09, A4→P1-04, A5→P2-04, A6→P0-07, A7→P2-02, A8→P2-03, M1→P3-01, M2→P3-02, M3→P3-03, M4→P3-04, M5→P3-05, M6→P3-06, M7→P3-07.

**Security/Perf (S/P):** S1→P0-01, S2→P0-05, S3→P1-03, S4→P1-05, S5→P1-04, S6→P1-07, S7→P1-08, S8→P1-05, S9→P3-08, P1→P1-08, P2→P1-02, P3→P2-14, P4→P2-15.

**UX (C/M/N):** C1→P1-13, C2→P1-13, C3→P1-14, C4→P1-15, C5→P2-16, M1→P2-21, M2→P2-22, M3→P2-17, M4→P2-18, M5→P2-19, M6→P2-23, M7→P2-20, N1→P3-15, N2→P3-16, N3→P3-17, N4→P3-17, N5→P3-17, N6→P3-18.

**Merges:** {S5,A4}→P1-04 · {F-05,F-06}→P1-06 · {F-09,F-20,F-24}→P2-07 · {F-02,F-14}→P1-11 · {S4,S8}→P1-05 · {S7,P1}→P1-08. Positive control (25) dipertahankan di source — jangan regress.

## 1.7 Positive Controls (BE — sudah benar, jangan regress)

Data/API: batched `$facet` pagination (no N+1), `htmlContent` projected out dari list lookup, `conversationNumber` partial unique + `E11000` retry, session-detail atomic `findOneAndUpdate` + `arrayFilters`, TTL index `expiresAt`, bulk ops single `updateMany` tenant-scoped, `phoneLast4` index privacy-safe search.
Security: RBAC edit/delete (`MessageAuthorizationService`), edit/delete time window, outbound-only edit restriction, `WsAuthGuard` JWT/API-key, global `ValidationPipe` whitelist, `helmet()`, `escapeRegex()`, Redis dedup, soft delete.

---

# BAGIAN 2 — TRACK D: FE UX Flow (Phase 2 Synthesis)

Sumber: 3 audit — first-time user flow (12), returning/power user flow (12), interconnection Conversation↔Setting↔Ticket (20). Raw 44 → **41 unik** (3 merger). **Decision:** `REVISE_PRD` (blok struktural) + `PROCEED_WITH_CAUTION` (quick-win FE).

## 2.1 Distribusi Severity & Tema

| Tema | CRIT | HIGH | MED | LOW | Total |
|---|---|---|---|---|---|
| A. SLA & Metrik (config, precedence, atribusi) | 2 | 3 | 4 | 0 | 9 |
| B. Assignment, Ownership & RBAC | 0 | 3 | 2 | 0 | 5 |
| C. Conversation↔Ticket Handoff & Data Sync | 0 | 2 | 4 | 1 | 7 |
| D. Onboarding & Empty States (user baru) | 0 | 1 | 4 | 3 | 8 |
| E. Efisiensi Daily-Use & Performa (user lama) | 0 | 2 | 6 | 4 | 12 |
| **Total** | **2** | **11** | **20** | **8** | **41** |

**2 CRITICAL = ketiadaan keputusan struktural di level requirement (bukan bug):**
1. **A1** — 3 lapis config SLA tanpa precedence (per-channel vs per-ticket-type vs per-team-inbox).
2. **A2** — Dual-SLA: satu reply agent bisa selesaikan 2 FRT beda (conversation + ticket) tanpa aturan atribusi.

## 2.2 Tema A — SLA & Metrik

| ID | Sev | Dampak | Rekomendasi |
|---|---|---|---|
| **A1** | CRIT | Satu conversation punya 3 kandidat SLA (channel, ticket-type, team-inbox) tanpa aturan pemenang → fairness & reporting salah. | Lock precedence: channel → ticket-type → team-inbox Custom SLA + definisi "Carry Over"/"Apply to Ongoing" vs snapshot rule. |
| **A2** | CRIT | Satu reply selesaikan conversation FRT (T1→T3) DAN ticket FRT (creation→reply) sekaligus, start-point beda → double-count / salah atribusi. | Definisikan dual-SLA attribution: satu event selesaikan keduanya, atau butuh reply terpisah. |
| **A3** | HIGH | 3 sumber status waktu (presence Away, AUX, shift, office hour) tanpa canonical state → agent available di HUD tapi unavailable di auto-reply/SLA. | Lock canonical AUX/presence state sebelum Snooze/Hold/Auto-Reply. Satu enum untuk SLA pause + auto-reply eligibility + assignment. |
| **A4** | HIGH | Linked conversation-ticket "waiting on customer": conversation FRT jalan (TTC pause) tapi ticket FRT ikut pause → metric inkonsisten. | Selaraskan definisi WoC pause antar modul. |
| **A5** | HIGH | Reopen conversation vs reopen ticket tanpa handoff → status tak sinkron. | Definisikan handoff reopen: reopen conversation trigger reopen linked ticket, atau independen. |
| **A6** | MED | 3 sumber waktu (office hour, shift, timezone) tanpa sinkronisasi; office hour punya auto-merge+snapshot yang tak ada di shift. | Unifikasi model waktu: satu sumber kanonik untuk RLT/TTC/eligibility/deadline. |
| **A7** | MED | Auto-reply (undeveloped) belum punya kontrak ke SLA engine → bot bisa selesaikan FRT/T3 tanpa flag bot. | Kontrak: SatuInbox Bot TIDAK selesaikan FRT/ART/ticket SLA; flag bot message. |
| **A8** | MED | Ticket manual tanpa customer message di-resolve tanpa reply → ticket FRT running/breach selamanya (zombie). | Fix `not_applicable` untuk ticket manual tanpa reply. |
| **A9** | MED | Ticket manual tak punya RLT (blind spot); ticket detail UI cuma FRT+Resolve chips. | Lock "Ticket Handling Time" + tambah slot RLT di ticket detail. |

## 2.3 Tema B — Assignment, Ownership & RBAC

| ID | Sev | Dampak | Rekomendasi |
|---|---|---|---|
| **B1** | HIGH | Conversation di-assign tak tampilkan agen sebagai assignee (`participants=[]`) → ragu ownership, dobel-pull/reply; no validasi assignee vs Team Inbox. | Implementasi `participants` agar ownership terlihat + validasi assignee vs membership Team Inbox. |
| **B2** | HIGH | Role AGENT di org round-robin tak punya jalur terlihat ambil percakapan pertama (Pull button + tab Unassigned/All disembunyikan tanpa penjelasan) → "tidak ada kerjaan / produk rusak". | Pastikan jalur akses percakapan pertama untuk AGENT selalu ada & dijelaskan. |
| **B3** | HIGH | Delete member = side effect lintas modul (unassign conversation+ticket → round robin reassign) bisa ubah `firstAssigneeId` historis → metric korup. | Pertahankan `firstAssigneeId` historis saat unassign paksa; definisikan interaksi member-delete dengan `conversation_sla_metrics`. |
| **B4** | MED | Conversation & Ticket pakai 2 istilah paralel (pull/claim) dengan permission key beda (`conversation:pull` vs `ticket:claim`). | Satukan terminologi & mapping permission lintas modul. |
| **B5** | MED | Masking phone/email per-role tak punya satu spec konsisten di conversation vs ticket detail. | Satu spec masking konsisten di kedua permukaan. |

## 2.4 Tema C — Conversation↔Ticket Handoff & Data Sync

| ID | Sev | Dampak | Rekomendasi |
|---|---|---|---|
| **C1** | HIGH | 3 PRD create-ticket dari bubble kontradiktif (1→1 vs 1→N vs multi→1); FE ship "multiple tickets" tapi Consistency Patch kunci "one bubble = one ticket". | Resolusi konflik jadi satu model seleksi bubble kanonik sebelum tulis test suite. |
| **C2** | HIGH | Related Conversations grouping (Primary+Child) dengan flag `is_ticket_message` tak didefinisikan → blocking saat fitur undeveloped dibangun. | Definisikan `is_ticket_message` berlaku ke semua child saat grup di-ticket-kan. |
| **C3** | MED | Ticket >1 linked conversation; "primary link" beda di 3 tempat → metric inherit salah conversation. | Satu definisi "primary linked conversation" konsisten. |
| **C4** | MED | Custom attributes conversation vs custom fields ticket vs ticket-type tak disinkronkan. | Definisikan sinkronisasi conversation custom attributes ↔ linked ticket fields. |
| **C5** | MED | Dua composer (Conversation Room & Ticket Room) untuk satu thread → 2 write-path, draft preservation beda. | Unifikasi delivery state & draft preservation antar composer. |
| **C6** | MED | Conversation snooze undeveloped vs ticket snooze developed → asimetri; interaksi snooze conversation ↔ linked ticket tak didefinisikan. | Definisikan snooze conversation & interaksinya dengan linked ticket. |
| **C7** | LOW | Auto-tag scope "Tiket"/"Percakapan dan Tiket" tak diterapkan kalau ticket dibuat belakangan dari bubble sama. | Definisikan backfill auto-tag saat ticket dibuat setelah message masuk. |

## 2.5 Tema D — Onboarding & Empty States (user baru)

| ID | Sev | Dampak | Rekomendasi | Lokasi |
|---|---|---|---|---|
| **D1** | HIGH | User baru mendarat di layar buntu: empty state chat list tanpa CTA. | Tambah CTA kontekstual di empty state chat list. | `EmptyChat.tsx` |
| **D2** | MED | Chat room empty state = ilustrasi saja tanpa judul/instruksi. | Tambah teks/label instruktif konsisten dengan empty state list. | `ConversationChatRoomEmpty.tsx` |
| **D3** | MED | No in-product onboarding (tour/coachmark) — satu-satunya onboarding = KYC. | Tambah guided onboarding fitur inti (filter, assign, bulk, SLA). | grep absence |
| **D4** | MED | Banner "channel terputus" cuma di dalam chat room; di list tak ada indikasi. | Prompt setup kanal proaktif di list level. | `ConversationChatRoomNoSession.tsx` |
| **D5** | MED | Setup pasca-approve (channel, team, shift, SLA) tak dipandu & default senyap kosong. | Nudge terstruktur pasca-approve + init default aman. | `ManageOnboardingPage.tsx` |
| **D6** | LOW | "Conversation not found." hardcoded (non-i18n, English di locale `id`) tanpa retry/back. | Via next-intl + aksi pemulihan. | `InvalidState.tsx` |
| **D7** | LOW | Account channel selector fallback ke kanal pertama walau inactive. | Fallback ke kanal `active` pertama, bukan index 0. | `AccountChannelSelector.tsx` |
| **D8** | LOW | Halaman onboarding render kosong untuk status tak dikenal. | Render fallback state untuk status tak dikenal. | `ManageOnboardingPage.tsx` |

## 2.6 Tema E — Efisiensi Daily-Use & Performa (user lama)

| ID | Sev | Dampak | Rekomendasi | Lokasi |
|---|---|---|---|---|
| **E1** | HIGH | Quick-action "Set Reminder" = stub `console.log` mati. | Sembunyikan "Set Reminder" sampai fitur ada (hapus dead-end). | `QuickAction.tsx:155-160` |
| **E2** | HIGH | Unread count "Your Inbox" undercount saat >20 conv (doc bilang 100, kode pakai `LIMIT=20`) + fetch list redundan. | Samakan limit ke 100 ATAU count endpoint khusus. | `conversation.service.ts:321-343` |
| **E3** | MED | Pencarian hilang diam-diam tiap ganti view. | Jangan reset search saat ganti view. | `ConversationNavItemDefault.tsx:224-283` |
| **E4** | MED | Filter tak persist (cuma `sort` diingat). | Persist search & filter seperti `sort`. | `conversationFilter.store.ts:44-49` |
| **E5** | MED | Load histori infinite-scroll 25/page tanpa lompat/search. | Tambah jump-to-date + search dalam conversation. | `use-message.service.ts:69-83` |
| **E6** | MED | List stale setelah socket reconnect (refetchOnReconnect off). | Aktifkan `refetchOnReconnect` (1 baris). | `makeQueryClientHelper.ts:11` |
| **E7** | MED | Keyboard nav parsial (tabIndex ada, handler stub). | Lengkapi handler keyboard (next/prev, buka room, quick-action). | `ConversationCard.tsx` + `useChatHandlers.ts` |
| **E8** | MED | Histori conversation sama-kontak butuh 3 level navigasi + collapsed 5 item / fetch max 100. | Flatten navigasi histori + naikkan limit. | `ConversationHistoryContent.tsx:181-221` |
| **E9** | LOW | Pesan sama di-fetch dua jalur (live vs history) tanpa cache bersama. | Unifikasi endpoint live/history + shared cache. | `use-messages-api.ts:63-75` |
| **E10** | LOW | Satu interval global re-render semua card SLA tiap detik. | Ganti ticker per-detik dengan deadline-based render. | `useGlobalTicker.tsx:3` |
| **E11** | LOW | System event cuma muncul dalam jendela 1 hari dari pesan tertua ter-load. | Basiskan window utility event pada rentang load penuh. | `use-combined-items.ts:56-64` |
| **E12** | LOW | Min karakter pencarian inkonsisten (kode 2 vs komentar 3). | Selaraskan nilai dengan hint text. | `ConversationChatListHeader.tsx:24` |

## 2.7 Quick-Win vs Big-Fix (Track D)

**Quick-Win (fix kecil, tak diblokir keputusan struktural):**
Q1 E1 (sembunyikan reminder, 1 baris) · Q2 E2 (unread limit 20→100) · Q3 D1 (empty state CTA) · Q4 E6 (refetchOnReconnect, 1 baris) · Q5 E3+E4 (preserve search & filter) · Q6 D6 (i18n + retry) · Q7 D7 (channel fallback active) · Q8 E12 (min-search-char).

**Big-Fix (effort / keputusan struktural):**
A1 (precedence 3 lapis SLA, REVISE_PRD) · A2 (dual-SLA attribution) · A3 (canonical AUX, blocker Snooze/Hold/Auto-Reply) · C1 (resolusi 3 PRD create-ticket) · A5 (reopen handoff) · B1 (`participants` model) · B2 (jalur AGENT round-robin) · E5+E8+E9 (search-in-conv + unifikasi endpoint) · E7 (keyboard nav) · C6 (snooze state machine).

**Ketergantungan kunci:** A3 (canonical AUX) prasyarat untuk C6 (snooze), A7 (auto-reply), B3 (member-delete). Jangan mulai fitur turunan sebelum A1/A2/A3 lock.

## 2.8 Open Questions (carry-forward)

| OQ | Pertanyaan | Blocker? |
|---|---|---|
| OQ-01 | Precedence SLA: channel vs ticket-type vs team-inbox mana menang? | Ya (A1) |
| OQ-02 | Satu agent reply selesaikan conversation FRT & ticket FRT sekaligus? | Ya (A2) |
| OQ-03 | Reopen conversation → linked ticket ikut reopen? | Ya (A5) |
| OQ-04 | Canonical AUX state: presence "Away" == SLA "AUX"? | Ya (A3) |
| OQ-05 | Conversation assignee divalidasi terhadap Team Inbox seperti ticket? | Tidak (B1) |
| OQ-06 | Model seleksi bubble kanonik (1→1 vs 1→N vs multi→1)? | Ya (C1) |

---

# BAGIAN 3 — Cross-Track & Next Steps

**Overlap yang harus di-dedup sebelum ticketing (per reading-list §4):**
- Track E DB-index (P0-03) ↔ register **V8/P-01** (compound index) — E code-verified outrank inference.
- Track E soft-delete/tenant-scope (P0-02/P0-04) ↔ register **SEC-*** family.
- Track D reminder/unread (E1/E2) ↔ Track E functional (reminder stub, counter).
- Track D RBAC-visibility (B1/B2) ↔ Track F (`2026-09-03-sidebar-navigation-synthesis.md`) C1/C2 (`role.name` vs `role.code`) ↔ Track B RBAC gap.

**Coverage gap (per `../2026-09-03-conversation-audit-coverage-gap-check.md`):** verdict PARTIAL, ~40% aspek Conversation belum di-audit — SLA engine vs contract, multi-tenant READ-path isolation, RabbitMQ event semantics, socket reconnect, observability, test coverage, migration/rollback P0, cron correctness, gRPC versioning, mobile.

**Prerequisite sebelum enforce unique index (P0-06/P0-07):** de-duplikasi conversation duplikat di production data DULU, baru rebuild index. Schedule data-cleanup migration ahead of index rebuild.
