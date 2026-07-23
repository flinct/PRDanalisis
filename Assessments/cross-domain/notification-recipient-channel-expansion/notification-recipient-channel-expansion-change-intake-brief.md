# Change Intake Brief — Notification Recipient & Channel Expansion

- **Feature / Change Name:** Notification Recipient & Channel Expansion
- **Domain:** Cross-domain — Conversation, Ticket, Notification, People, Auth, Mobile
- **Owner / Requestor:** Dany Christian
- **Prepared By:** Dany Christian
- **Engineering Lead:** Naftal Yunior
- **Date:** 2026-07-13 (v0), 2026-07-21 (v0.2)
- **Change Type:** Existing behavior change + channel expansion + recipient rule tightening
- **Priority / Urgency:** High
- **Related Systems / Repos:**
  - `PRDanalisis`
  - `C:\Users\MyBook SAGA 12\Desktop\BE satuinbox\omnichannel-satuinbox-be`
  - mobile app repo (FCM integration target; repo path not yet loaded)

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v0 | 2026-07-13 | Dany Christian | Initial change intake brief. |
| v0.1 | 2026-07-13 | Dany Christian | BRD v0 written from this brief; brief unchanged. |
| **v0.2** | **2026-07-21** | **Dany Christian** | **Gap resolution merged into brief. See §13 Changelog for highlights.** |

---

## 1. Problem Statement

Current notification behavior is not strict enough for conversation/ticket recipient targeting and does not yet support independent per-channel delivery controls.

Current gaps:
- notification for conversation/ticket must end at specific assigned members, but current platform also still supports company-wide notification patterns for other notification classes.
- supervisor notification for team inbox intake/assignment is not yet formalized as product behavior.
- notification disable control is not split by channel.
- mobile push notification does not yet exist.
- notification coverage is currently anchored in conversation flows and must be expanded to ticket flows as part of canonical behavior.

Requested end state:
- conversation/ticket notification must be received by specific assigned member(s), regardless of role.
- supervisor must also receive notification for items that enter their scoped team inbox and when those items are assigned.
- web and mobile notification controls must be independent.
- mobile delivery must be added through Firebase push notification.
- non conversation/ticket notification types remain company-wide.

---

## 2. Requested Business Outcome

1. Ensure operational notification reaches only relevant users for conversation/ticket workflows.
2. Prevent unrelated users from receiving conversation/ticket notification noise.
3. Preserve company-wide notification only for non conversation/ticket categories.
4. Add mobile push as second delivery channel without coupling it to web delivery.
5. Give each user clear opt-out control per delivery channel.

---

## 3. Scope Definition

### In Scope
- Conversation notification recipient rule tightening.
- Ticket notification recipient rule tightening.
- Supervisor notification for:
  - new item entering team inbox
  - item assignment event
- Independent notification channel preferences:
  - web notification enable/disable
  - mobile notification enable/disable
- Mobile push notification via Firebase.
- Notification-service changes needed to gate delivery per channel.
- People-service integration to resolve supervisor recipients by team inbox / team scope.

### Out of Scope
- Replacing or redesigning company-wide notification behavior for billing / wallet / subscription / plan change.
- Email notification channel.
- Rich mobile notification center UX.
- Re-architecture of existing websocket stack.
- Broad RBAC redesign.

---

## 4. Locked Product Decisions

### 4.1 Recipient Rules
- For **conversation** and **ticket** notifications:
  - assigned member must receive notification.
  - role does not block delivery; member/admin/supervisor still receives if assigned.
- For **supervisor**:
  - supervisor receives notification when conversation/ticket enters team inbox.
  - supervisor receives notification again when conversation/ticket is assigned.
  - supervisor scope follows team inbox ownership / team coverage from people-service.
  - supervisor can belong to multiple teams.
- For **non conversation/ticket** notifications:
  - company-wide notification remains allowed.

### 4.2 Channel Preference Rules
- Web notification preference is separate from mobile notification preference.
- Disabling one channel does not disable the other.
- Default state for both channels: **ON**.
- Only `Supervisor` and `Admin` can configure toggles. `Member` is forced-on for `conversation_ticket` category.
- **[v0.2 correction]** Toggle controls **real-time delivery channel**, not historical notification list visibility. Users with both channels off can still browse notification list.

### 4.3 Delivery Rules
- Web and mobile can both deliver for the same event.
- Push delivery should be sent to mobile even when web also receives notification.
- Mobile push implementation uses Firebase / FCM.
- **[v0.2 lock]** Dedupe key: `(recipientUserId, eventId)`. Same event to same user across multiple retries/paths = one notification record. Fan-out to multiple mobile devices is transport detail, not business duplicate.

---

## 5. Current-State Findings From BE Repo

### 5.1 Existing assignee-targeted event emission already exists

#### Conversation assignment
File:
- `apps/conversation-service/src/app/services/conversation.service.ts:2133-2144`
- `apps/conversation-service/src/app/services/conversation.service.ts:2585-2618`

Current behavior:
- `emitAssignNotifications(...)` loops through conversation participants.
- emits `EventTypeEnum.IN_APP_NOTIFICATION_CREATE` per participant.
- skips actor user.
- supports assignment source metadata.

#### Ticket assignment
File:
- `apps/ticket-service/src/app/services/ticket.service.ts:652-660`
- `apps/ticket-service/src/app/services/ticket.service.ts:1634-1642`
- `apps/ticket-service/src/app/services/ticket.service.ts:2070-2102`

Current behavior:
- `emitTicketAssignNotifications(...)` emits per member.
- recipient uses `member.user.id`.
- actor user is skipped.

### 5.2 Existing notification ingestion hub already centralized
File:
- `apps/notification-service/src/app/processors/in-app-notification.processor.ts`

Current behavior:
- notification-service receives `EventTypeEnum.IN_APP_NOTIFICATION_CREATE` from source services.
- processor applies existing create/rollup/dedup logic.
- notification record is created.
- `EventTypeEnum.NOTIFICATION_CREATED` is emitted for websocket delivery path.

### 5.3 People-service capability found
Files:
- `proto/people.proto:38-49`
- `apps/people-service/src/app/controllers/team.controller.ts:187-195`

Current behavior:
- `TeamService.GetTeamsByUserId` exists.
- `MemberService.GetMembersByIds` exists.
- **[v0.2 confirmed]** no `GetSupervisorsByTeamId` RPC exists.

### 5.4 **[v0.2 NEW]** Additional baseline verified this session

| Fact | Evidence |
|---|---|
| Conversation already carries `teamInboxId` in context creation | `apps/conversation-service/src/app/services/conversation.service.spec.ts:77-119` |
| Ticket schema only has `ticket.team.teamId`, **no `teamInboxId`** | `apps/ticket-service/src/app/services/message-authorization.service.ts:124` |
| Role management lives in **auth-service** (`RoleService`), not people-service | `proto/auth.proto:42-46` |
| Notification-service has **zero FCM/deviceToken code** | grep `fcm|firebase|deviceToken` in `apps/notification-service` → 0 matches |

---

## 6. Expected Target Behavior

### 6.1 Conversation / Ticket Assignee Notification
For notification types tied to conversation/ticket work items:
- deliver only to assigned member(s) plus eligible supervisors.
- do not use company-wide delivery for these entity types.
- assigned user receives notification on web if web enabled.
- assigned user receives push on mobile if mobile enabled.

### 6.2 Supervisor Intake Notification
For conversation/ticket team-inbox lifecycle:
- when item enters team inbox, notify supervisors that cover that team inbox.
- when item is assigned, notify supervisors that cover that team inbox.
- supervisor notification still respects channel preferences.
- supervisor notification defaults ON.

### 6.3 Non Conversation / Ticket Notification
For company-level notification classes such as billing/wallet/subscription/plan-changed:
- existing company-wide behavior stays valid.
- this change must not unintentionally force those types into assignee-only delivery.

---

## 7. Proposed Minimal Technical Direction

### 7.1 Reuse existing assignee emission helpers
Reuse, do not replace:
- `emitAssignNotifications(...)` in conversation-service
- `emitTicketAssignNotifications(...)` in ticket-service

### 7.2 **[v0.2 REVISED]** Preference model
Minimum preference fields per user:
- `webEnabled: boolean` default `true`
- `mobileEnabled: boolean` default `true`

**Removed from v0:** `supervisorIntakeEnabled` — dropped in v0.2. Supervisor-intake follows same `webEnabled`/`mobileEnabled` toggles as any other notification. Adding a third supervisor-scope toggle adds preference-matrix complexity without a user-requested need. → skipped: per-notification-type toggle, add when users explicitly ask for supervisor-intake mute separate from all other notifications.

### 7.3 Add mobile device token registration surface
- register FCM token
- unregister FCM token
- map token(s) to user
- **[v0.2 lock]** multi-device supported (pending §11 Q3 confirmation)

### 7.4 Add supervisor recipient resolution path
- people-service RPC to resolve active supervisor user IDs by team inbox / team ID

### 7.5 Gate channel delivery in notification-service
- if `webEnabled` false, skip web notification for that user
- if `mobileEnabled` true, send FCM push
- if both false, skip real-time delivery (historical record still persisted so list stays visible)

---

## 8. Product / Technical Risks

1. Supervisor recipient lookup contract missing — resolved in §12.G2.
2. Ticket participant identity inconsistency — reuse existing helper only.
3. Web/mobile preference enforcement point — centralized in notification-service.
4. Company-wide notification regression risk — resolved via category branch (§12.G3).
5. Duplicate supervisor delivery — resolved via dedupe key (§4.3).
6. **[v0.2 NEW]** Ticket has no `teamInboxId` field — resolved in §12.G1a.
7. **[v0.2 NEW]** Websocket may fall back to company-room broadcast — resolved in §12.G7.
8. **[v0.2 NEW]** Backward-compat strategy for existing consumers of `IN_APP_NOTIFICATION_CREATE` — open, see §11 Q6.

---

## 9. Dependencies

### Backend
- `conversation-service`
- `ticket-service`
- `notification-service`
- `people-service`
- `auth-service` (indirect, via people-service role lookup)
- `api-gateway` websocket / notification delivery chain

### Mobile
- mobile app repo
- Firebase / FCM setup and credentials lifecycle

### Frontend Web
- web settings/config surface for notification preference

---

## 10. **[v0.2 REPLACED]** Open Technical Items → Now Resolved

Original v0 §10 listed 5 open items. Status in v0.2:

| # | v0 Open Item | Status | Reference |
|---|---|---|---|
| 1 | Event source for "conversation enters team inbox" | **RESOLVED** | §12.G1 |
| 2 | Event source for "ticket enters team inbox" | **RESOLVED (with sub-gap)** | §12.G1 + §12.G1a |
| 3 | Supervisor intake toggle scope | **RESOLVED — toggle dropped** | §7.2 |
| 4 | API/UI placement for preference management | **RESOLVED** | §12.G4 |
| 5 | Mobile FCM token registration contract | **RESOLVED** | §12.G5 |

---

## 11. **[v0.2 NEW]** Open Questions Requiring PM Decision

These need answers **before** Full PRD can be written without `TBD`.

1. **Ticket `teamInboxId` strategy** (§12.G1a) — derive from originating conversation (Opsi A, recommended), migrate ticket schema (Opsi B), or defer ticket-intake to v0.1 (Opsi C)?
2. **Preference storage ownership** — notification-service or user-service? Recommended: notification-service (single-service consistency with preference gate).
3. **Multi-device phase 1** — support multi-device from launch, or single-device only and defer multi-device?
4. **Delivery log retention** — 90 days (matches BRD target) or 30 days (storage saving)?
5. **Feature flag granularity** — per-company rollout or global cutover?
6. **[v0.2 review-added]** **Backward-compat strategy for `IN_APP_NOTIFICATION_CREATE`** — dual-emit old + new envelope during rollout, or single cutover with feature flag? Current recommendation: **reuse queue, add `eventType` field, single cutover behind flag** (§12.G3). Confirm.
7. **[v0.2 review-added]** **Supervisor fan-out placement** — supervisor recipient resolution done in source service (conversation/ticket-service calls people-service, then emits N events) OR in notification-service resolver (source emits 1 event with `teamInboxId`, resolver expands to N recipients)? Current recommendation: **resolver in notification-service** (source services stay ignorant of recipient topology, matches existing centralization). Confirm.

---

## 12. **[v0.2 NEW]** Gap Resolution — Contract Direction Per Gap

Menutup gap teknis dari BRD v0 §13. Format per gap: keputusan → alasan → contract snippet.

### G1 — Intake event source (RESOLVED)

**Decision:** Split business events explicitly. Do not overload `IN_APP_NOTIFICATION_CREATE` as business trigger.

**New event types:**
- `CONVERSATION_ENTERED_TEAM_INBOX`
- `CONVERSATION_ASSIGNED` (extend existing helper payload)
- `CONVERSATION_REOPENED`
- `TICKET_ENTERED_TEAM_INBOX`
- `TICKET_ASSIGNED` (extend existing helper payload)
- `TICKET_REOPENED`

**State-transition guard (mandatory at producer):**

Fire `*_ENTERED_TEAM_INBOX` ONLY on transition:
- `null | external_intake | unowned_queue` → `team_inbox_scoped`

Do NOT fire on:
- read-model rehydrate / socket reconnect
- consumer retry without state change
- reassignment within same team
- reopen (separate event)

### G1a — **[v0.2 NEW SUB-GAP]** Ticket `teamInboxId` absence

Discovered from code baseline: ticket schema only has `ticket.team.teamId`, no `teamInboxId`. Supervisor-intake for ticket **cannot fire** without one of:

- **Opsi A (recommended):** derive `teamInboxId` from originating conversation (zero schema migration; reuse existing conversation↔ticket relation)
- **Opsi B:** add `teamInboxId` field to ticket schema (requires backfill)
- **Opsi C:** defer ticket-intake to v0.1

→ Decision pending §11 Q1.

### G2 — Supervisor resolver RPC (RESOLVED)

**Decision:** Add one narrow RPC in **people-service** (not auth-service).

```protobuf
// proto/people.proto — TeamService
rpc GetSupervisorRecipientsByTeamScope(GetSupervisorRecipientsRequest)
    returns (SupervisorRecipientsResponse);

message GetSupervisorRecipientsRequest {
  common.UserContext userContext = 1;
  string companyId = 2;
  string teamId = 3;              // required
  string teamInboxId = 4;         // optional, finer scope
  bool activeOnly = 5;            // default true
}

message SupervisorRecipient {
  string userId = 1;
  string memberId = 2;
  string roleId = 3;
  repeated string teamIds = 4;
}

message SupervisorRecipientsResponse {
  repeated SupervisorRecipient recipients = 1;
}
```

**Why people-service, not auth-service:**
- team membership ownership is in people-service
- role check resolved internally via existing `auth-service.RoleService.GetRolesById` (or cached role snapshot on member document)
- caller (notification-service) needs one gRPC call, unaware of join rules

**Fallback:** if `teamInboxId` filled but not found → fall back to `teamId` scope. If `teamId` not found → return empty list (not error).

### G3 — Payload contract (RESOLVED)

**Canonical business event envelope:**

```json
{
  "eventId": "uuid-v4",
  "eventType": "CONVERSATION_ENTERED_TEAM_INBOX",
  "entityType": "conversation",
  "entityId": "665f...",
  "entityDisplayId": "CONV-12345",
  "companyId": "665f...",
  "teamId": "665f...",
  "teamInboxId": "665f...",
  "assigneeUserIds": ["665f..."],
  "actorUserId": "665f...",
  "occurredAt": "2026-07-21T10:00:00Z",
  "category": "conversation_ticket",
  "sourceChannel": "whatsapp"
}
```

**Mandatory:** `eventId`, `eventType`, `entityType`, `entityId`, `companyId`, `actorUserId`, `occurredAt`, `category`.

**Conditional mandatory:**
- `teamId` — all `conversation_ticket` events
- `teamInboxId` — all `*_ENTERED_TEAM_INBOX` events
- `assigneeUserIds` — all `*_ASSIGNED` and `*_REOPENED` events
- `entityDisplayId` — required (used in mobile push body)

**Dedupe key (locked):** `(recipientUserId, eventId)`. Not body hash, not entityId only.

**Backward compat:** reuse existing queue, add `eventType` field to envelope. Recommendation: single cutover behind feature flag (see §11 Q6).

### G4 — Preference persistence + API (RESOLVED)

**Data model** (extension on user doc or new `notification_preferences` collection):
```json
{
  "userId": "...",
  "companyId": "...",
  "webEnabled": true,
  "mobileEnabled": true,
  "updatedAt": "..."
}
```

**Effective evaluation** (locked in notification-service preference gate):
```
if category == "conversation_ticket" and userRole == "Member":
    effectiveWeb = channelAvailable("web")
    effectiveMobile = channelAvailable("mobile")
else:
    effectiveWeb = pref.webEnabled ?? true
    effectiveMobile = pref.mobileEnabled ?? true
```

**API surface (minimum):**
- `GET  /api/v1/notification-preferences/me` → `{ webEnabled, mobileEnabled }`
- `PATCH /api/v1/notification-preferences/me` → `{ webEnabled?, mobileEnabled? }`

**Ownership:** notification-service (see §11 Q2 for confirmation).

### G5 — Device token lifecycle (RESOLVED)

**Data model** (new collection `mobile_device_tokens`):
```json
{
  "userId": "...",
  "companyId": "...",
  "deviceToken": "fcm-token-string",
  "platform": "ios | android",
  "appVersion": "1.2.3",
  "status": "active | invalid | revoked",
  "lastSeenAt": "...",
  "createdAt": "..."
}
```

Index unique on `(deviceToken)`.

**Lifecycle rules:**
- `POST /api/v1/mobile-device-tokens/register` — upsert by `deviceToken`. On relogin (token moves user), update `userId`, refresh `lastSeenAt`.
- `POST /api/v1/mobile-device-tokens/unregister` — mark `revoked`. Called on explicit logout.
- FCM invalid response → mark `status=invalid`, stop retry. Weekly cleanup job hard-deletes `invalid` tokens >30 days.

**Delivery policy:** send FCM to all `active` tokens for recipient. Fan-out is transport detail; business dedupe stays `(userId, eventId)`.

### G6 — Audit retention (RESOLVED)

**Split into two streams:**

1. **Notification record** (existing `notifications` collection) — main product retention.
2. **Delivery attempt log** (new `notification_delivery_logs` collection):
   ```json
   {
     "eventId": "...",
     "userId": "...",
     "channel": "web | mobile",
     "result": "sent | skipped_pref | skipped_role | invalid_token | failed",
     "errorCode": "...",
     "timestamp": "..."
   }
   ```
   Retention: **90 days** via TTL index on `timestamp` (see §11 Q4).

### G7 — **[v0.2 NEW]** Websocket audience filter

**Decision:** api-gateway socket relay rule — for `category == "conversation_ticket"`, emit to `user:{userId}` room only. Never fall back to `company:{companyId}` room for this category.

**Why:** BRD implies recipient-specific delivery but doesn't lock websocket audience. Without this rule, FE-side filtering becomes only guard → leak risk.

---

## 13. **[v0.2 NEW]** Changelog Highlights

### Removed
- `supervisorIntakeEnabled` preference toggle (§7.2). One less preference dimension.

### Corrected
- Preference toggle wording (§4.2): toggle controls **real-time delivery**, not list visibility. BRD v0 §13.5 wording was ambiguous.

### Added
- §5.4 baseline verification (4 code-level facts).
- §7.2 dedupe key lock in delivery rules.
- §8 risks 6–8 (ticket teamInbox, websocket audience, backward-compat).
- §11 — 7 open questions (5 restated + 2 review-added).
- §12 — full gap resolution G1–G7 with contract snippets.
- §13 (this section) — changelog.
- G1a — ticket `teamInboxId` sub-gap discovered from baseline.

### Preserved
- All locked product decisions from v0 §4 (except toggle wording clarification in §4.2 and toggle removal in §7.2).
- All current-state findings §5.1–5.3.
- Recipient rules, scope definition, target behavior §6.
- Original recommendation flow direction.

---

## 14. Decision Snapshot

- Proceed with assignee-only rule for `conversation` and `ticket` notification classes.
- Preserve company-wide rule for non conversation/ticket classes.
- Add supervisor notification for both intake and assignment events.
- Add independent web/mobile notification toggles (2 toggles, not 3).
- Add mobile push via Firebase.
- Reuse current assignee notification emitters; extend around them.
- **[v0.2]** Recipient fan-out topology: source emits 1 event with team scope; notification-service resolver expands to N recipients (pending §11 Q7).
- **[v0.2]** Backward-compat: reuse queue + `eventType` field + single cutover behind flag (pending §11 Q6).

---

## 15. Recommendation For Next Artifact

Next artifact: **Full PRD** (per `prd-writing-rule.md` — Full triggers all present: cross-service, RBAC, API/event contract, migration, data lifecycle, retention, feature flag).

**Blocker before PRD writing:** answer §11 Q1–Q7. Without those, PRD will carry 7 `TBD` markers in contract-bearing sections.
