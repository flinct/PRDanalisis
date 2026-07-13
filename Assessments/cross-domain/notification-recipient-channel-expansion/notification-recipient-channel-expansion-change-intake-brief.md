# Change Intake Brief — Notification Recipient & Channel Expansion

- **Feature / Change Name:** Notification Recipient & Channel Expansion
- **Domain:** Cross-domain — Conversation, Ticket, Notification, People, Mobile
- **Owner / Requestor:** Dany Christian
- **Prepared By:** Dany Christian
- **Date:** 2026-07-13
- **Change Type:** Existing behavior change + channel expansion + recipient rule tightening
- **Priority / Urgency:** High
- **Related Systems / Repos:**
  - `PRDanalisis`
  - `C:\Users\MyBook SAGA 12\Desktop\BE satuinbox\omnichannel-satuinbox-be`
  - mobile app repo (FCM integration target; repo path not yet loaded)

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
- If web notification is disabled:
  - user does not receive web notification.
  - mobile notification can still be delivered if mobile remains enabled.
- If mobile notification is disabled:
  - user does not receive mobile push notification.
  - web notification can still be delivered if web remains enabled.
- Default state for both channels: **ON**.

### 4.3 Delivery Rules
- Web and mobile can both deliver for the same event.
- Push delivery should be sent to mobile even when web also receives notification.
- Mobile push implementation uses Firebase / FCM.

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

Implication:
- conversation assignment already fans out to specific recipients.
- current path is reusable for assignee notifications.

#### Ticket assignment
File:
- `apps/ticket-service/src/app/services/ticket.service.ts:652-660`
- `apps/ticket-service/src/app/services/ticket.service.ts:1634-1642`
- `apps/ticket-service/src/app/services/ticket.service.ts:2070-2102`

Current behavior:
- `emitTicketAssignNotifications(...)` emits per member.
- recipient uses `member.user.id`.
- actor user is skipped.

Implication:
- ticket assignment already fans out to specific recipients.
- ticket path has known participant identity inconsistency, so existing helper should be reused rather than rebuilt.

### 5.2 Existing notification ingestion hub already centralized
File:
- `apps/notification-service/src/app/processors/in-app-notification.processor.ts`

Current behavior:
- notification-service receives `EventTypeEnum.IN_APP_NOTIFICATION_CREATE` from source services.
- processor applies existing create/rollup/dedup logic.
- notification record is created.
- `EventTypeEnum.NOTIFICATION_CREATED` is emitted for websocket delivery path.

Implication:
- channel gating should be inserted in notification-service, not duplicated across conversation/ticket services.
- this is shortest path for web/mobile split behavior.

### 5.3 People-service capability found
Files:
- `proto/people.proto:38-49`
- `apps/people-service/src/app/controllers/team.controller.ts:187-195`

Current behavior:
- `TeamService.GetTeamsByUserId` exists.
- `MemberService.GetMembersByIds` exists.
- no direct RPC found yet for “get supervisors by team inbox/team”.

Implication:
- supervisor recipient resolution likely needs small people-service contract extension.
- do not build a new permission engine; add narrow RPC for supervisor lookup.

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

Reason:
- assignee fan-out already exists.
- shortest safe diff is extending around current path, not rebuilding it.

### 7.2 Add independent per-channel preference model
Minimum preference fields per user:
- `webEnabled: boolean` default `true`
- `mobileEnabled: boolean` default `true`
- `supervisorIntakeEnabled: boolean` default `true`

Notes:
- keep channel toggles independent.
- supervisor toggle only affects supervisor-intake style notifications, not assignee notifications when supervisor is directly assigned.

### 7.3 Add mobile device token registration surface
Needed capability:
- register FCM token
- unregister FCM token
- map token(s) to user
- support multiple devices per user

### 7.4 Add supervisor recipient resolution path
Preferred minimal contract:
- people-service RPC to resolve active supervisor user IDs by team inbox / team ID

Reason:
- existing RPCs do not expose direct supervisor lookup.
- narrow RPC is smaller and safer than inferring supervisors indirectly in notification-service.

### 7.5 Gate channel delivery in notification-service
Notification-service should decide per recipient:
- if `webEnabled` false, skip DB/web notification creation for that user.
- if `mobileEnabled` true, send FCM push.
- if both false, skip delivery entirely.

Reason:
- existing hub already owns notification creation flow.
- central gating avoids duplicate checks in every source service.

---

## 8. Product / Technical Risks

1. **Supervisor recipient lookup contract missing**
   - current people-service surface does not show direct supervisor-by-team lookup.
   - needs contract addition or explicit existing path confirmation.

2. **Ticket participant identity inconsistency**
   - existing ticket helper already works around `member.id` vs `member.user.id` mismatch.
   - new logic must not bypass this helper carelessly.

3. **Web/mobile preference enforcement point**
   - if enforced too early in source services, behavior can drift across domains.
   - centralized enforcement in notification-service is safer.

4. **Company-wide notification regression risk**
   - change must scope assignee-only rule specifically to `conversation` and `ticket` entity types.

5. **Duplicate supervisor delivery**
   - supervisor may also be direct assignee.
   - recipient list must be deduplicated per event per user.

---

## 9. Dependencies

### Backend
- `conversation-service`
- `ticket-service`
- `notification-service`
- `people-service`
- `api-gateway` websocket / notification delivery chain

### Mobile
- mobile app repo
- Firebase / FCM setup and credentials lifecycle

### Frontend Web
- web settings/config surface for notification preference

---

## 10. Open Technical Items To Resolve In Next Phase

1. Exact event source and payload for “conversation enters team inbox”.
2. Exact event source and payload for “ticket enters team inbox”.
3. Whether supervisor intake toggle applies to both web and mobile together or needs future per-channel supervisor toggle.
4. Exact API / UI placement for notification preference management on web.
5. Exact API contract between mobile app and backend for FCM token registration.

---

## 11. Recommendation For Next Artifact

Next artifact should be an **Assessment Report** that covers:
- recipient resolution matrix by event type
- source-service event mapping
- people-service contract addition
- notification preference data model
- web/mobile delivery sequence
- regression impact on current notification, unread count, and websocket behavior

---

## 12. Decision Snapshot

- Proceed with assignee-only rule for `conversation` and `ticket` notification classes.
- Preserve company-wide rule for non conversation/ticket classes.
- Add supervisor notification for both intake and assignment events.
- Add independent web/mobile notification toggles.
- Add mobile push via Firebase.
- Reuse current assignee notification emitters; extend around them, do not replace them.
