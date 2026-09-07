# Security & Performance Audit — Conversation Feature

**Scope**: api-gateway conversation controllers, conversation-service message/conversation services, WebSocket gateway, DTOs, auth guards
**Date**: 2026-09-02
**Method**: Code review of actual source files (not docs/specs)

---

## SECURITY FINDINGS

### S1 — CRITICAL: `sendMessage` endpoint missing authorization
**Location**: `apps/api-gateway/src/app/conversation/conversation.controller.ts:1408-1425`
**Finding**: `POST /conversations/send` has NO `@RequirePermissions` decorator and NO `@Throttle`. Comment says "send message for testing only" but it's in production controller code. Any authenticated user (even with minimal role) can send messages to any conversation by providing a `conversationId`.
**Evidence**: Line 1408: `@Post('send')` — no guards beyond class-level `JwtAuthGuard` + `PermissionsGuard` (which requires `@RequirePermissions` to actually enforce).
**Impact**: Privilege escalation — agents can send messages to conversations they don't own, bypassing team/role boundaries.
**Recommendation**: Add `@RequirePermissions([ConversationPermission.SEND_MESSAGE])` and `@Throttle`. If truly test-only, move to a separate test controller behind dev-only feature flag.

### S2 — CRITICAL: Open API controller has zero rate limiting
**Location**: `apps/api-gateway/src/app/conversation/conversation.open.controller.ts` (entire file)
**Finding**: All endpoints use `@ApiKeyAuth()` but NONE have `@Throttle`. The open controller exposes `GET /conversation`, `GET /conversation/:id/messages`, `POST /conversation`, `PATCH /conversation/:id`, etc.
**Evidence**: `grep -n "@Throttle" conversation.open.controller.ts` returns empty.
**Impact**: API key compromise = unlimited request flood. Brute-force conversation enumeration, message scraping at full speed.
**Recommendation**: Add `@Throttle` to every endpoint. Consider stricter limits for open API (e.g. 30 req/min) since it's machine-to-machine.

### S3 — MAJOR: No content length validation on message body
**Location**: `libs/common/src/lib/dto/index.ts:171-250` (SendMessageDto), `627-720` (SocketInboundMessageDto, SocketOutboundMessageDto)
**Finding**: `content: string` has `@IsString()` but NO `@MaxLength()`. Same for `htmlContent`, `subject`, `metaData`. A client can send a multi-MB string as message content.
**Evidence**: All DTOs use bare `@IsString()` on content fields.
**Impact**: Storage abuse (MongoDB document size limit 16MB), memory exhaustion on service, bandwidth amplification.
**Recommendation**: Add `@MaxLength(10000)` to `content`, `@MaxLength(50000)` to `htmlContent`, `@MaxLength(500)` to `subject`. Enforce at gateway AND service level.

### S4 — MAJOR: No XSS/content sanitization anywhere
**Location**: Entire codebase
**Finding**: Zero results for `sanitize`, `xss`, `DOMPurify`, `sanitize-html` across all apps. `helmet()` is used in `main.ts` (good for HTTP headers) but message content is stored and served as-is.
**Evidence**: `grep -rn "sanitize\|xss\|DOMPurify\|sanitize-html" apps/` returns empty.
**Impact**: Stored XSS — if any frontend renders message content as HTML (email viewer, rich text), attacker-injected scripts execute in other users' browsers.
**Recommendation**: Sanitize `content` and `htmlContent` at ingestion (gateway level) using a whitelist-based sanitizer. At minimum, escape `<script>` tags and event handlers.

### S5 — MAJOR: `metaData` accepts arbitrary unvalidated objects
**Location**: `libs/common/src/lib/dto/index.ts` (SendMessageDto.metaData), `apps/conversation-service/src/app/dto/create-message.dto.ts` (CreateMessageDto.metaData)
**Finding**: `metaData: Record<string, any>` with only `@IsObject()` — no schema, no depth limit, no key allowlist.
**Impact**: Prototype pollution via `__proto__` key (mitigated by class-transformer defaults, but not explicitly blocked). Storage abuse with deeply nested objects. Potential injection if metaData is used in queries or template rendering.
**Recommendation**: Define a strict metaData schema per message type, or at minimum add `@IsObject()` + depth/size validation.

### S6 — MAJOR: WebSocket widget user impersonation
**Location**: `apps/api-gateway/src/websocket/gateways/conversation.gateway.ts:130-150` (handleWidgetSetUserData)
**Finding**: Widget clients call `SET_WIDGET_USER` with arbitrary `id` and `name`. The handler stores this as `client.data.sender.userId` without verifying the claimed ID matches the authenticated identity. Subsequent outbound messages use this userId.
**Evidence**: `client.data = { ...client.data, sender: { ...client.data?.sender, user: { ...payload, fullName: payload.name }, userId: payload.id } }` — no validation against auth context.
**Impact**: A widget user can impersonate any user ID, potentially sending messages that appear to come from a different agent.
**Recommendation**: For API_KEY auth type, validate that `payload.id` matches the authenticated contact ID. For BEARER auth, reject `SET_WIDGET_USER` entirely (agents don't need to set their own identity).

### S7 — MAJOR: `BatchDeleteMessageDto` has no array size limit
**Location**: `apps/api-gateway/src/app/conversation/dto/batch-delete-message.dto.ts`
**Finding**: `messages: DeleteMessageItemDto[]` with `@IsArray()` + `@ValidateNested()` but NO `@ArrayMaxSize()`.
**Impact**: Client can send thousands of message IDs in one request, each triggering a full validation + DB roundtrip (sequential — see P1). DoS vector.
**Recommendation**: Add `@ArrayMaxSize(50)` to the array field.

### S8 — MINOR: `htmlContent` stored without sanitization
**Location**: `libs/common/src/lib/dto/index.ts` (SendMessageDto.htmlContent, SocketOutboundMessageDto.htmlContent)
**Finding**: Email HTML content is stored directly in MongoDB. If rendered in any web view without escaping, it's a stored XSS vector.
**Impact**: Medium — depends on frontend rendering. Email HTML is inherently untrusted.
**Recommendation**: Sanitize with a whitelist allowlist (e.g. `sanitize-html` with allowed tags for email formatting).

### S9 — MINOR: WebSocket CORS env var crash
**Location**: `apps/api-gateway/src/websocket/gateways/conversation.gateway.ts:38`
**Finding**: `origin: process.env[CORS_CONFIG_KEY].split(',') ?? '*'` — if `CORS_CONFIG_KEY` env var is undefined, `.split()` throws TypeError at startup. The `??` fallback never executes because the error happens before the nullish coalescing.
**Impact**: Service crash on misconfiguration.
**Recommendation**: `(process.env[CORS_CONFIG_KEY] ?? '*').split(',')`

---

## PERFORMANCE FINDINGS

### P1 — MAJOR: `batchDeleteMessage` is sequential
**Location**: `apps/conversation-service/src/app/services/message.service.ts:1490-1510`
**Finding**: `for (const request of requests) { await this.deleteMessage(...) }` — each delete does full validation (message lookup + authz check + platform validation + DB update + socket emit). For N messages, this is N sequential roundtrips.
**Impact**: 50-message batch delete = 50 sequential DB queries + 50 authz checks + 50 socket emits. Latency grows linearly with batch size.
**Recommendation**: Use `Promise.allSettled()` for parallel execution, or process in chunks of 10.

### P2 — MAJOR: Rate limiting only on 1 of ~30 conversation endpoints
**Location**: `apps/api-gateway/src/app/conversation/conversation.controller.ts`
**Finding**: Only `countConversation` (line 405) has `@Throttle`. All other endpoints (list, get, send, edit, delete, assign, bulk operations, search, notes, screenshots) have NO rate limiting.
**Evidence**: `grep -c "@Throttle" conversation.controller.ts` = 1.
**Impact**: Authenticated users can hammer write endpoints (send, edit, delete, bulk operations) at unlimited speed.
**Recommendation**: Apply `@Throttle` to all write endpoints at minimum. Consider a global rate limit guard for the entire controller.

### P3 — MINOR: Typing indicators broadcast to entire company
**Location**: `apps/api-gateway/src/websocket/gateways/conversation.gateway.ts:230-260`
**Finding**: `client.to(SocketEventEnum.PREFIX_COMPANY + companyId).emit(SocketEventEnum.TYPING_INDICATOR, ...)` broadcasts to ALL connected sockets in the company namespace, not just conversation participants.
**Impact**: In a company with 100 agents, every keystroke event is broadcast to 99 irrelevant clients. Scales as O(agents × typing_events).
**Recommendation**: Broadcast to conversation room only: `client.to(PREFIX_CONVERSATION + conversationId).emit(...)`.

### P4 — MINOR: Regex-based search fallback
**Location**: `apps/conversation-service/src/app/repositories/conversation-search.repository.ts:107-313`
**Finding**: Search uses `escapeRegex()` (good — prevents ReDoS/injection) then `$regex` queries across multiple fields. While Atlas Search is mentioned in comments, the regex path exists as fallback.
**Impact**: Regex queries without text index are collection scans. Fine for small tenants, problematic at scale.
**Recommendation**: Ensure Atlas Search index is always available; disable regex fallback or add compound indexes on searched fields.

---

## POSITIVE CONTROLS (things done well)

1. **RBAC on edit/delete**: `MessageAuthorizationService` implements proper permission-based + role-based authz with team scoping.
2. **Edit/delete time window**: `EDIT_DELETE_WINDOW_MS` prevents stale message manipulation.
3. **Outbound-only restriction**: Edit/delete only allowed on outbound messages (direction check).
4. **WebSocket auth**: `WsAuthGuard` validates JWT or API key on every WS message handler.
5. **Global ValidationPipe**: `whitelist: true` + `forbidNonWhitelisted: true` strips unknown fields.
6. **helmet()**: HTTP security headers applied globally.
7. **Regex escaping**: `escapeRegex()` used before MongoDB `$regex` queries.
8. **Duplicate message detection**: Redis-based dedup for outbound messages.
9. **Soft delete**: Messages are marked as deleted, not physically removed.

---

## SEVERITY SUMMARY

| Severity | Count | IDs |
|----------|-------|-----|
| CRITICAL | 2 | S1, S2 |
| MAJOR | 7 | S3, S4, S5, S6, S7, P1, P2 |
| MINOR | 4 | S8, S9, P3, P4 |

**Top 3 to fix first**: S1 (sendMessage authz bypass), S2 (open API no rate limit), S3 (no content length limit).
