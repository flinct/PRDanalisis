# Conversation Feature — Functional & Business Logic Audit

**Scope:** Message send/receive flow, threading, state transitions, edge cases (empty, concurrent, retry).
**Codebase:** `omnichannel-satuinbox-be/apps/conversation-service/`
**Date:** 2026-09-02

---

## 1. State Machine

### Current States
```
ConversationStatusEnum: OPEN | CLOSE | UNRECOGNIZED
```

### Findings

| # | Severity | Finding |
|---|----------|---------|
| F-01 | HIGH | **No "pending" or "sending" intermediate state.** Messages go from created → delivered with no status tracking. If WhatsApp API is slow or fails, the message record exists but there's no way to distinguish "queued" from "sent" from "delivered" from "failed" at the conversation level. |
| F-02 | HIGH | **Reopen creates a NEW conversation document** (`reopenConversation` → `createUniqueConversation`), not a status flip on the closed one. Conversation history is split across two+ documents. Agents lose thread continuity unless they manually look up `parentReOpenId`. The FE must chain these via `parentReOpenId` to show history — if that link breaks, history is orphaned. |
| F-03 | MEDIUM | **No "snooze" or "waiting for customer" state.** Only OPEN/CLOSE. Agents who want to park a conversation (e.g. "waiting for callback") must either close it or leave it open, polluting the open queue. |
| F-04 | LOW | **UNRECOGNIZED status is defined but never set in conversation-service code.** No code path creates or transitions to UNRECOGNIZED. Dead enum value or external-only? |

---

## 2. Message Send Flow (Outbound)

### Flow
```
FE → message.controller.sendMessage → message.service.sendMessage
  → validateConversation (find active, select account channel)
  → validateWhatsappReEngagementWindow (WhatsApp API only)
  → checkOutboundDuplicate (Redis, tempMessageId key, 10min TTL)
  → outbound-message.processor.processOutboundMessage
    → channel adapter.send → saveMessageKey (Redis, 1 week TTL)
    → updateLastMessage on conversation
```

### Findings

| # | Severity | Finding |
|---|----------|---------|
| F-05 | HIGH | **Outbound dedup TTL = 10 minutes.** `saveOutboundMessageKey` uses `CacheTTLEnum.TEN_MINUTES`. If a network retry arrives after 10min (e.g. FE retry with backoff, mobile reconnect), the dedup check passes and a duplicate message is sent to the customer. The inbound dedup uses 1 week TTL — inconsistent. |
| F-06 | HIGH | **Dedup is Redis-only, no DB guard.** If Redis is down or restarted, `checkOutboundDuplicate` returns `false` (fail-open). Same for inbound `checkDuplicate`. No MongoDB-level unique index on `(externalMessageId, identifierId)` exists on the messages collection. Redis outage = duplicate messages. |
| F-07 | MEDIUM | **WhatsApp re-engagement window blocks free-form reply but offers no template fallback path.** `validateWhatsappReEngagementWindow` throws `GrpcBadRequestException` when the 23h45m window expires. The agent gets an error — there's no automatic switch to template message mode or guided UX to send a template instead. |
| F-08 | MEDIUM | **Account channel selection has no fallback when all channels are inactive.** `selectAccountChannelForOutbound` returns `undefined` → throws `NO_ELIGIBLE_ACCOUNT_CHANNEL`. No retry-when-channel-recovers mechanism; the message is lost unless the agent manually retries. |
| F-09 | LOW | **`updateLastMessage` is non-atomic for SLA direction tracking.** Reads `lastMessageDirection` in one query, then updates in a separate `findOneAndUpdate`. Under concurrent messages (agent + customer send simultaneously), the SLA pause/resume decision may use stale direction. |

---

## 3. Message Receive Flow (Inbound)

### Flow
```
Channel adapter → inbound-message.processor.processInboundMessage
  → checkDuplicate (Redis, externalMessageId+identifierId, 1 week TTL)
  → findOrCreateConversation (find active OPEN by channel+contact, or create new)
  → message.service.createMessage (persist)
  → updateLastMessage (latestMessage, unread++, lastReEngagementAt)
  → socket.emit (real-time to FE)
  → SLA tracking update
```

### Findings

| # | Severity | Finding |
|---|----------|---------|
| F-10 | HIGH | **TOCTOU race in `findOrCreateConversation`.** Classic find-then-create: two concurrent inbound messages from the same contact can both find `null`, then both create new conversations. The unique index `{accountChannel.id, channel.id, contactInfo.id}` with `partialFilterExpression: {deleted: false, status: 'open'}` helps but is **sparse + partial** — MongoDB partial indexes don't guarantee uniqueness as strongly as regular unique indexes in all race scenarios. The `createWithRetry` only retries on `conversationNumber` collision, not on the contact-channel unique violation. |
| F-11 | MEDIUM | **Inbound retry = 3 attempts, then dead letter queue.** `MAX_RETRIES_PROCESS_INBOUND_MESSAGE = 3` with `RETRIES_SECOND_PER_RETRIED = 2` (2s backoff). After 3 failures, message goes to `messageFailedRepository`. No automatic retry from DLQ, no admin UI to replay failed messages mentioned in code. |
| F-12 | MEDIUM | **`isNew` flag uses `conversation.latestMessage` check.** Line 654: `if (conversation && conversation.latestMessage) isNew = false`. A conversation that was created but has no messages yet (edge case: creation succeeded but message persist failed) will be treated as "new" on next inbound, potentially creating a duplicate conversation. |
| F-13 | LOW | **Group conversations skip SLA tracking entirely** (line 820: `if (!isGroup)`). By design, but no escalation path exists if a group conversation needs SLA compliance (e.g. enterprise support groups). |

---

## 4. Threading & Conversation Resolution

### Findings

| # | Severity | Finding |
|---|----------|---------|
| F-14 | HIGH | **Reopen chains are unbounded.** Each reopen creates a new conversation with `parentReOpenId` pointing to the previous one. There's no limit on reopen depth. A contact that opens/closes 50 times creates 50 documents chained by `parentReOpenId`. Querying full history requires recursive traversal with no index on `parentReOpenId`. |
| F-15 | MEDIUM | **Email threading uses `referenceId` on contact level** (line 647-653 area). The `findActiveConversation` for email uses `accountChannel.id` scoping. If the same customer sends from a different email address, a new conversation is created — no cross-address threading. |
| F-16 | MEDIUM | **Instagram comment threads use `rootCommentId`** for grouping (line 636-644). If `rootCommentId` is null/missing from the webhook payload, the comment falls through to standard contact-based lookup, potentially creating a separate conversation for a reply that should be threaded. |
| F-17 | LOW | **`conversationNumber` is generated with retry on collision** (`createWithRetry` up to `MAX_CONVERSATION_RETRIES`). The retry uses jitter delay. Under high concurrency, this could cause visible delays in conversation creation. |

---

## 5. Edge Cases

### Findings

| # | Severity | Finding |
|---|----------|---------|
| F-18 | HIGH | **Empty message body is not validated at the service layer.** The inbound processor persists whatever the channel adapter delivers. If a webhook delivers an empty text message (e.g. WhatsApp read receipt misclassified, or a media-only message with missing media URL), it creates a message record with no content. No guard at `message.service.createMessage`. |
| F-19 | MEDIUM | **Concurrent assign + unassign is not serialized.** `assignConversation` and `unassignConversation` both read-modify-write the participants array. Two agents assigning/unassigning simultaneously can lose one update (last-write-wins on the participants array). |
| F-20 | MEDIUM | **`markReadConversation` resets unread to 0** but doesn't use `$set` with a condition. If a new message arrives between the read and the update, the unread count is incorrectly zeroed. |
| F-21 | LOW | **`EDIT_DELETE_WINDOW_MS = 5 minutes`** is hardcoded. No per-tenant or per-platform configuration. WhatsApp allows editing within 15 minutes — the 5-minute window is more restrictive than the platform allows. |
| F-22 | LOW | **`CLEANED_UP_STALE_ENTRIES = 5 minutes`** — stale entry cleanup runs every 5 minutes. Under load, entries that are "stale" for 4 minutes 59 seconds are still considered active. No configurable threshold. |

---

## 6. Counter & Unread Management

### Findings

| # | Severity | Finding |
|---|----------|---------|
| F-23 | MEDIUM | **`counter.service.ts` is empty (0 bytes).** Counter logic appears to live in `conversation.service.updateCounter` and the repository layer. The empty file suggests incomplete refactoring or dead code artifact. |
| F-24 | MEDIUM | **Unread counter uses `$inc` operator** (line 899: `unread: 1`). This is atomic, but `markReadConversation` likely uses `$set: {unread: 0}` — the classic increment-vs-set race. A message arriving between markRead's read and set will have its increment lost. |

---

## 7. Summary by Severity

| Severity | Count | Key Themes |
|----------|-------|------------|
| HIGH | 6 | TOCTOU race, no intermediate states, Redis-only dedup, short dedup TTL, unbounded reopen chains, no empty message guard |
| MEDIUM | 10 | Non-atomic updates, no template fallback, DLQ without replay, concurrent participant edits, empty counter service |
| LOW | 6 | Dead enum, hardcoded windows, no group SLA, conversationNumber collision delay |

---

## 8. Recommended Priorities

1. **P0 — Fix TOCTOU race** (F-10): Add upsert-based conversation creation or use MongoDB transaction with the existing partial unique index.
2. **P0 — Align dedup TTLs** (F-05): Outbound dedup should match inbound (1 week) or at minimum 1 hour.
3. **P0 — Add DB-level message dedup** (F-06): Unique index on `(externalMessageId, identifierId)` in messages collection as fallback when Redis is down.
4. **P1 — Add message status enum** (F-01): PENDING → SENT → DELIVERED → READ/FAILED for outbound messages.
5. **P1 — Limit reopen chain depth** (F-14): Cap at N reopens or flatten history into the conversation document.
6. **P1 — Validate empty messages** (F-18): Reject or flag empty-body messages at the service boundary.
7. **P2 — Template message fallback** (F-07): When re-engagement window expires, return available templates instead of a bare error.
8. **P2 — Serialize participant updates** (F-19): Use `$addToSet`/`$pull` instead of full array replacement.
