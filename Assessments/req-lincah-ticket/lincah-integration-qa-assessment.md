# Assessment Report — Lincah Integration Requirements for SatuInbox

> **Version:** 1.0
> **Date:** 2026-10-07
> **Analyst:** Dany Christian
> **Source:** PRD Lincah untuk SatuInbox V2 (PDF, 10 requirements 1A–10A)
> **Codebase verified:** BE v2.8.0 (`omnichannel-satuinbox-be`), FE v2.8.0 (`omnichannel-satuinbox-fe`)
> **Decision:** Proceed with conditions

---

## 1. Context

Lincah.id is a multi-carrier logistics aggregator and existing SatuInbox tenant. This document outlines 10 integration requirements (numbered 1A–10A) that extend SatuInbox's Open API, broadcast, webhook, and ticket management capabilities for Lincah's operational workflow.

All findings below are **code-verified** against the BE and FE working trees (v2.8.0 branch, verified 2026-10-07).

---

## 2. Requirement-by-Requirement Analysis

### 1A — Ticket Grouping by Custom Attribute

**User decision:** Handle via existing Relation Label system.

| Aspect | Status |
|---|---|
| BE relation label system | ✅ Exists: `bulkApplyRelationLabel`, `bulkUnlinkRelationLabel`, `relationLabels[]` on ticket schema |
| Open API filter | ✅ `relationLabelKey` filter on `GET /open-api/ticket` |
| FE group-by UI | ❌ No grouping UI in ticket list view |
| **Verdict** | **FE-only work.** BE is ready. |

**Gap:** Ticket list view needs a group-by dropdown that uses existing `relationLabels` to visually group tickets by label key.

---

### 2A — Link Chat to Ticket via Open API

| Aspect | Status |
|---|---|
| Link at creation time | ✅ `conversationId` on `BaseCreateTicketDto` → `POST /open-api/ticket` |
| Link post-creation | ❌ No endpoint to link existing conversation to existing ticket |
| Bubble message as ticket | ✅ `POST /open-api/ticket/:id/message` exists |
| **Verdict** | **Small extension.** Need dedicated link endpoint for post-creation linking. |

**Gap:** `POST /open-api/ticket/:id/link-conversation` or similar endpoint to associate an existing conversation with an existing ticket.

---

### 3A — Bulk Ticket Update (Custom Properties)

| Aspect | Status |
|---|---|
| Existing bulk operations | ✅ `bulkCreate`, `bulkMessage`, `bulkSnooze`, `bulkUnsnooze`, `bulkAddTags`, `bulkRemoveTags`, `bulkResolve` |
| Bulk infrastructure | ✅ `bulk-job.schema`, `bulk-job-row.schema`, `TICKET_BULK_LIMIT = 100` |
| Bulk update custom fields | ❌ Not exists — no `bulkUpdate` or `bulkUpdateTickets` |
| Cross-type concern | ⚠️ Different `ticketTypeId` → different `customAttributes[]` schemas. Need per-ticket type validation. |

**User decision:** V1 = same ticket type only. Cross-type bulk update deferred to v2.

**Gap:** New `POST /open-api/ticket/bulk-update` endpoint that accepts ticket IDs + field updates, validates `customAttributes` against each ticket's type definition.

**Supported field types (from PRD):** Selection (list_option), Text, Date, Image, Gallery (multiple images), File.

---

### 4A — Broadcast Create via Open API with Media Attachment

| Aspect | Status |
|---|---|
| `POST /open-api/broadcast` | ✅ Exists: `BroadcastOpenApiController.postOpenApiBroadcast()` |
| DTO fields | `name`, `channel`, `teamInboxId`, `sender`, `audience[]`, `message`, `scheduleAt`, `properties[]`, `broadcastTemplateId`, `variableSamples[]` |
| Attachment field | ❌ Not in `OpenApiBroadcastDto` |
| Current broadcast | Text/template only — no file upload in Open API |

**Gap:** Add `attachment` field (file URL or media ID) to `OpenApiBroadcastDto`. Handle media upload/download in broadcast service.

---

### 5A — Create Broadcast via Deep Link

**User decision:** Use Open API instead. No deep link needed.

**Verdict:** Covered by 4A. **No additional work.**

---

### 6A — Broadcast to WA Group via Open API

| Aspect | Status |
|---|---|
| `BroadcastPlatformEnum` | `WHATSAPP_WEB`, `WHATSAPP_API` only |
| `GroupEnum` | Has `WHATSAPP_WEB_GROUP` but NOT in `BroadcastPlatformEnum` |
| Email channel | Not supported → **P2 deferred** |

**Gap:** Add `WHATSAPP_GROUP` to `BroadcastPlatformEnum`. Handle group broadcast delivery semantics in broadcast service (different from 1:1 delivery).

---

### 7A — Broadcast Status API + Retry via Open API

| Aspect | Status |
|---|---|
| List API | ✅ `GET /open-api/broadcast/list` with status filtering |
| Status enum | ✅ 13 statuses: RAW, TEXT_PROCESSING, TEXT_PROCESSED, SCHEDULE, PENDING, PROCESSING, SENT, DELIVERED, FAILED, RETRY, INVALID, CANCELED |
| Retry system | ✅ Internal: `BroadcastRetryStatusEnum` (NONE, PENDING, REPLIED, EXHAUSTED), `broadcastRetryEnabled`, `BroadcastRetryProcessor` |
| Per-recipient status API | ❌ Not exposed via Open API |
| Retry via Open API | ❌ No external retry endpoint |
| Broadcast detail endpoint | ❌ Only list, no `GET /open-api/broadcast/:id` |

**User decision:** Retry mechanism initiated by Lincah (not auto). Lincah calls status API → identifies failed recipients → calls retry API.

**Gap:**
1. `GET /open-api/broadcast/:id/status` — per-recipient status
2. `POST /open-api/broadcast/:id/retry` — retry failed recipients
3. `GET /open-api/broadcast/:id` — broadcast detail (optional, list API may suffice)

---

### 8A — Ticket Webhook Enhancement

| Aspect | Status |
|---|---|
| Webhook service | ✅ Fully implemented in `ticket-service/src/app/services/webhook.service.ts` |
| Events | ✅ `TICKET_CREATED`, `TICKET_UPDATED`, `TICKET_DELETED`, `MESSAGE_CREATED` |
| Retry | ✅ 3 attempts, 5s delay, 5s timeout per attempt |
| Logging | ✅ `ticket_webhook_logs` collection with status, errorCode, responseTimeMs |
| HMAC signature | ✅ Via API key token |
| Two-way sync | ✅ Lincah→SatuInbox via Open API, SatuInbox→Lincah via webhook |
| Granular change events | ❌ `TicketUpdateContext` only has `prevStatus`, `prevStageId/Name`, `statusReason` — no field-level diff |
| Custom property change detail | ❌ Not in webhook payload |
| Team inbox change event | ❌ Not tracked |
| Conversation-ticket linkage event | ❌ Not tracked |
| RETRY_EXHAUSTED status | ❌ Uses `FAILED` after retries exhausted |

**Webhook firing points (verified in code):**
- `updateTicket()` → `emitTicketUpdatedWebhook()` (line 1439)
- `updateTicketStage()` → `emitTicketUpdatedWebhook()` (line 1511)
- `updateTicketStatus()` close → `emitTicketUpdatedWebhook()` (line 1588)
- `updateTicketStatus()` reopen → `emitTicketUpdatedWebhook()` (line 1649)
- `createTicket()` → `emitTicketCreatedWebhook()` (line 2603)
- `deleteTicket()` → `emitTicketDeletedWebhook()` (line 1488)
- `createMessage()` → `sendMessageCreatedWebhook()` (line 815)

**Gap:** Enhance `TicketUpdateContext` to include changed field details. Add `RETRY_EXHAUSTED` to `WebhookLogStatusEnum`.

---

### 9A — Update Team Inbox via Open API

| Aspect | Status |
|---|---|
| `PATCH /open-api/ticket/:id/team` | ✅ Exists: `AssignTeamDto` on `TicketOpenApiController` |
| `PATCH /open-api/ticket/:id` | ✅ `UpdateTicketDto` has `teamId` field |
| **Verdict** | **No work needed.** Already exists. |

---

### 10A — Integration Identifiers

| Identifier | Status |
|---|---|
| `ticketId` | ✅ ObjectId on ticket schema |
| `conversationId` | ✅ ObjectId on conversation schema |
| `contactId` | ✅ Exists on conversation |
| `broadcastId` | ✅ Exists on broadcast |
| `teamInboxId` | ✅ Exists (team service) |
| `seller_id` | Custom attribute value, not system ID |
| `awb` | Custom attribute value, not system ID |

**Verdict:** Documentation only. `seller_id` and `awb` are Lincah-specific custom attribute keys, not system identifiers.

---

## 3. Broadcast Status Reference (for 7A)

### BroadcastStatusEnum (existing)

| Status | Description |
|---|---|
| `RAW` | Initial state |
| `TEXT_PROCESSING` | Message being processed |
| `TEXT_PROCESSED` | Message processed |
| `SCHEDULE` | Scheduled for later |
| `PENDING` | Queued for sending |
| `PROCESSING` | Currently sending |
| `SENT` | All messages sent |
| `DELIVERED` | All messages delivered |
| `FAILED` | All messages failed |
| `RETRY` | Some messages being retried |
| `INVALID` | Invalid configuration |
| `CANCELED` | Cancelled by user |

### BroadcastRetryStatusEnum (existing)

| Status | Description |
|---|---|
| `NONE` | No retry in progress |
| `PENDING` | Retry pending |
| `REPLIED` | Customer replied, retry cancelled |
| `EXHAUSTED` | All retry attempts exhausted |

### Lincah expected per-recipient statuses

| Lincah requirement | SatuInbox equivalent |
|---|---|
| Pending | `PENDING` |
| Queued | `PROCESSING` |
| Sent / Success | `SENT` / `DELIVERED` |
| Failed | `FAILED` |
| Cancelled | `CANCELED` |

**Coverage:** All Lincah-required statuses map to existing `BroadcastStatusEnum`. Per-recipient status tracking exists internally but is not exposed via Open API → gap is API exposure only, not data model.

---

## 4. Webhook Event Coverage (for 8A)

### Existing events vs Lincah requirements

| Lincah requirement | Event | Status |
|---|---|---|
| Status berubah | `TICKET_UPDATED` | ✅ Fires on status change |
| Assignment berubah | `TICKET_UPDATED` | ⚠️ Fires but no assignment-specific field in payload |
| Team Inbox berubah | `TICKET_UPDATED` | ⚠️ Fires but no team-specific field in payload |
| Custom property berubah | `TICKET_UPDATED` | ⚠️ Fires but no custom field diff in payload |
| Ticket resolved/reopened | `TICKET_UPDATED` | ✅ Fires with `prevStatus` |
| Ticket–conversation linkage berubah | — | ❌ No event for this |

**Coverage:** 6/6 events technically fire via `TICKET_UPDATED`, but only 2/6 have meaningful payload detail. The others fire but with generic payload (no field-level change tracking).

---

## 5. Revised Gap Summary

| # | Feature | Status | Effort | Notes |
|---|---|---|---|---|
| **1A** | Grouping by Relation Label | FE-only (BE ready) | 3-4d dev, 2d QA | Fastest win |
| **2A** | Link Chat↔Ticket API | Small extension | 2-3d dev, 1-2d QA | Need post-creation link endpoint |
| **3A** | Bulk Update Custom Props | New endpoint | 5-7d dev, 3d QA | V1: same type only |
| **4A** | Broadcast + Attachment | DTO extension | 3-4d dev, 2d QA | Add attachment to OpenApiBroadcastDto |
| **5A** | Deep Link → Open API | Done | 0 | Covered by 4A |
| **6A** | WA Group Broadcast | Enum + flow | 4-5d dev, 2-3d QA | Add WHATSAPP_GROUP to BroadcastPlatformEnum |
| **7A** | Broadcast Status/Retry API | New endpoints | 4-5d dev, 2-3d QA | Wires existing internal retry to Open API |
| **8A** | Webhook Enhancement | Payload extension | 3-4d dev, 2d QA | Add field-level change tracking |
| **9A** | Team Inbox PATCH | Done | 0 | `PATCH /ticket/:id/team` exists |
| **10A** | Identifiers | Docs only | 1d | seller_id/awb are custom attrs |

**Total new work:** ~24-32 dev days, ~14-17 QA days

---

## 6. Timeline — Accelerated (1 month 3 weeks)

**Resources:** 1 dev (BE+FE), 2 QA
**Strategy:** Drop existing backlog clearance to parallel track. Overlap QA with dev.

| Sprint | Features | Dev | QA | Deps | Notes |
|---|---|---|---|---|---|
| **Week 1** | **1A** Grouping by Relation Label (FE) | 4d | 2d | — | BE ready, fastest win |
| **Week 2** | **2A** Link API (2d) + **8A** Webhook Enhancement (3d) | 5d | 4d | — | QA tests 1A while dev builds |
| **Week 3** | **3A** Bulk Update — same type only | 5d | 3d | — | Cross-type deferred to v2 |
| **Week 4** | **4A** Broadcast + Attachment (3d) + start **6A** WA Group (2d) | 5d | 2d | — | 4A+6A share broadcast service changes |
| **Week 5** | **6A** finish (3d) + start **7A** Status API (2d) | 5d | 3d | 4A | |
| **Week 6** | **7A** finish — per-recipient status + retry | 3d | 3d | 4A+6A | |
| **Week 6.5** | Buffer + regression | 0.5d | 2d | — | |

**Total: ~6.5 weeks (1 bulan 3 minggu). Dev 27.5d, QA 19d.**

### Trade-offs for acceleration

| Item | Full version | Accelerated | Impact |
|---|---|---|---|
| Existing backlog | 2 weeks clearance | Parallel track | Risk: context switch if dev handles bugs |
| 3A Bulk Update | Cross-type validation | Same type only v1 | Lincah can bulk per type, not mixed |
| 4A+6A | Separate sprints | Combined | Tight but feasible — shared broadcast service |
| 7A | Full detail + per-recipient + retry | Per-recipient + retry only | Detail page via existing list API |

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 3A cross-type custom field edge cases | Medium | +2-3d | V1 scope limited to same type |
| WA Group delivery semantics differ from 1:1 | Medium | +1-2d | Test with real WA Group early |
| Webhook payload backward compatibility | Low | Breaking change for existing consumers | Add new fields only, don't remove existing |
| 4A media attachment upload flow | Low | +1-2d | Reuse existing media service if available |
| Dev context switch (existing backlog) | Medium | -1-2d velocity | Dedicated Lincah sprint focus |

---

## 8. Decision

**Proceed with conditions:**
1. Phase 0 Change Intake Brief required before implementation starts
2. V1 scope = accelerated plan (6.5 weeks, same-type bulk update only)
3. Cross-type bulk update, email broadcast, broadcast detail endpoint = V2
4. Existing backlog runs on parallel track, not blocking Lincah timeline

---

## 9. Files Referenced

| File | What was checked |
|---|---|
| `apps/ticket-service/src/app/services/webhook.service.ts` | Full webhook implementation (4 events, retry, logging) |
| `apps/ticket-service/src/app/schemas/ticket-webhook-log.schema.ts` | Webhook log schema |
| `apps/api-gateway/src/app/ticket/ticket.open.controller.ts` | Open API ticket endpoints (GET, POST, PATCH, DELETE, bulk, team) |
| `apps/api-gateway/src/app/ticket/dtos/update-ticket.dto.ts` | PATCH ticket fields (status, teamId, memberIds, priority, title, description) |
| `apps/api-gateway/src/app/ticket/dtos/base-create-ticket.dto.ts` | Create ticket fields (conversationId, messageIds, teamId, memberIds) |
| `apps/api-gateway/src/app/broadcast/broadcast.open.controller.ts` | Open API broadcast (create, list, team-inboxes) |
| `apps/api-gateway/src/app/broadcast/dto/post-open-api-broadcast.dto.ts` | Broadcast create DTO (no attachment) |
| `libs/common/src/lib/enums/index.ts` | BroadcastPlatformEnum, BroadcastStatusEnum, WebhookEventTypeEnum, WebhookLogStatusEnum |
| `libs/common/src/lib/constants/webhook.constant.ts` | Webhook config (retry=3, delay=5s, timeout=5s) |
| `libs/common/src/lib/constants/base.constant.ts` | TICKET_BULK_LIMIT = 100 |
| `apps/api-gateway/src/app/open-api/open-api.module.ts` | Open API module registration (all controllers) |
| `apps/api-gateway/src/app/conversation/dto/updateConversation.dto.ts` | Conversation PATCH DTO (no teamId) |
| `apps/ticket-service/src/app/services/ticket.service.ts` | Bulk operations, webhook emission points |