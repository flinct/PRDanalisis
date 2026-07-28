# **PRODUCT REQUIREMENT DOCUMENT**

- **Feature**: Notification Recipient & Channel Expansion
- **Product Manager**: Dany Christian
- **Engineering Lead**: Naftal Yunior
- **Design Lead**: TBD
- **Version**: v0
- **Status**: Draft — 8 open questions closed; ready for review

---

## **1. Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v0 | 2026-07-21 | Dany Christian | Initial Full PRD generated from BRD v0 + change intake brief v0.2. Contains 7 open technical items for brainstorming with tech lead. |
| v0.1 | 2026-07-22 | Dany Christian | Added US-009 (web tap-through parity with mobile). Added §6.3.1 Tap-Through Navigation with FR-017a–f. Updated §9 UI table for clickable card / toast semantics + mark-read side effect. |
| v0.2 | 2026-07-24 | Dany Christian | Closed all 8 open questions (§17) following assessment recommendations. Locked decisions: Opsi A (ticket teamInboxId), notification-service pref ownership, multi-device from launch, 90d retention, per-company flags, single cutover, resolver expansion, `conversation_ticket`-only gate. Updated all cross-references. |

Reference sources:
- `BRD/Notification/notification-recipient-channel-expansion-BRD-v0.md`
- `Assessments/cross-domain/notification-recipient-channel-expansion/notification-recipient-channel-expansion-change-intake-brief.md` (v0.2)

---

## **2. Overview**

| Item | Description |
|------|-------------|
| Purpose | Refine notification recipient targeting for conversation/ticket workflows to assigned members + supervisors by team scope, and expand delivery channels from web-only to independent web + mobile push (FCM). |
| Scope | Conversation & Ticket notification recipient tightening, supervisor intake/assignment notifications, independent per-channel preferences, mobile push via Firebase, notification category separation. |
| Key Capabilities | (a) recipient-specific delivery for conversation/ticket, (b) supervisor by team scope, (c) web/mobile independent toggles, (d) FCM push, (e) `conversation_ticket` vs `company_wide` category separation, (f) dedupe by `(userId, eventId)`. |
| Outcome | Operational users receive only relevant alerts; supervisors gain team-scope visibility; users control real-time delivery per channel; mobile experience reaches first-class parity. |

### **Scope Definition**

| In Scope | Out of Scope |
|----------|--------------|
| Conversation notification recipient refinement | Email notification channel |
| Ticket notification recipient refinement | Full redesign of notification center UX |
| Supervisor notification for team-inbox intake + assignment | Full RBAC redesign |
| Independent web/mobile channel preferences | Replacing websocket architecture |
| Mobile push via FCM | Changing company-wide behavior for billing/wallet/subscription/plan-changed |
| Backend recipient resolution + channel gating | SLA breach notification (separate domain) |
| People-service supervisor resolver RPC | Ticket transfer / conversation transfer notifications (team-scope re-eval not designed) |
| Delivery attempt log for observability | Internal note mention notification |
| `conversation_ticket` vs `company_wide` category distinction | Notification coalescing across events |

---

## **3. Problem Statement**

| ID | Problem | Impact |
|----|---------|--------|
| PS-001 | Conversation/ticket notifications still allow company-wide delivery patterns | Users receive irrelevant noise from work items they do not own |
| PS-002 | Supervisor visibility for team-inbox intake and assignment is not formalized | Supervisors miss team activity awareness |
| PS-003 | Web/mobile notification preferences are not split | Users cannot selectively opt out per channel |
| PS-004 | Mobile push notification does not exist | Mobile app users miss real-time alerts |
| PS-005 | No formal category boundary between operational vs company-wide notifications | Risk of accidental scope leak in either direction during future changes |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
|-----------|------------|
| Deliver conversation/ticket notifications only to operationally-relevant users | 0 cross-tenant/cross-team notification leaks in QA regression suite |
| Give supervisors team-scope monitoring | 100% of supervisor-eligible intake and assignment events produce supervisor notification within delivery SLA |
| Enable independent channel control | Web and mobile toggles function independently in all 4 on/off combinations without cross-channel side effects |
| Add mobile push channel | FCM push delivery success rate ≥95% for valid active tokens |
| Preserve company-wide notifications unchanged | 0 regression in existing billing/wallet/subscription/plan-changed/system-announcement notification flow |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| US-001 | P0 | As an assigned Member, I want to receive notification on all my active conversations and tickets so that I never miss operational work. | 1. Given I am assigned to conversation X, When any eligible event fires on X, Then I receive notification on web (if web available) and mobile (if token active). 2. Given I toggle any preference off, Then my assigned-user notifications for conversation/ticket still deliver (forced-on). |
| US-002 | P0 | As a Supervisor, I want to be notified when new items enter my team inbox so that I can monitor incoming workload. | 1. Given item Y enters team inbox scoped to my team, When intake event fires, Then I receive `*_ENTERED_TEAM_INBOX` notification. 2. Given I am not the actor, Then I receive notification even if I did not trigger the intake. |
| US-003 | P0 | As a Supervisor, I want to be notified when items in my team inbox are assigned so that I can track work distribution. | 1. Given item Y in my team-inbox scope is assigned, When assignment event fires, Then I receive supervisor-assignment notification. 2. Given I am also the assignee, Then I receive only ONE notification (dedupe). |
| US-004 | P1 | As a Supervisor/Admin, I want to disable web notifications while keeping mobile on so that I can focus on desktop work without popups. | 1. Given I set `webEnabled=false`, When event fires for me, Then no web notification is created but mobile push still delivers. |
| US-005 | P1 | As a Supervisor/Admin, I want to disable mobile notifications while keeping web on so that I control mobile noise. | 1. Given I set `mobileEnabled=false`, When event fires for me, Then no FCM push is sent but web notification still delivers. |
| US-006 | P1 | As a user, I want to still see historical notifications even when both channels are off so that I can catch up later. | 1. Given both `webEnabled=false` and `mobileEnabled=false`, When event fires for me, Then no real-time delivery, but notification record persists and appears in my notification list on next open. |
| US-007 | P1 | As a mobile user, I want push notifications to open the correct conversation/ticket so that I can respond quickly. | 1. Given push received with `entityId`, When I tap notification, Then app opens directly to that entity view. |
| US-008 | P0 | As a Member, I want to keep receiving company-wide notifications unchanged. | 1. Given a company-wide event (billing/wallet/subscription/plan-changed/announcement), When it fires, Then I receive it via existing company-wide path with no regression. |
| US-009 | P1 | As a web user, I want in-app notifications (toast and notification center card) to open the correct conversation/ticket so that I can respond quickly. | 1. Given a web toast is shown for a `conversation_ticket` notification, When I click the toast, Then the web app routes directly to that entity view. 2. Given a notification card in the notification center for a `conversation_ticket` notification, When I click the card, Then the web app routes directly to that entity view. 3. Given click routes to a specific entity, When the notification is opened, Then unread state for that notification is cleared. |

---

## **6. Functional Requirements**

### 6.1 Recipient Rules

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-001 | P0 | System MUST deliver conversation/ticket notifications to assigned member(s) regardless of role. |
| FR-002 | P0 | System MUST NOT deliver conversation/ticket notifications to unrelated company users. |
| FR-003 | P0 | System MUST resolve supervisor recipients by team-inbox / team scope for `*_ENTERED_TEAM_INBOX` and `*_ASSIGNED` events. |
| FR-004 | P0 | System MUST support a supervisor belonging to multiple teams (fan-out to all eligible team scopes). |
| FR-005 | P0 | System MUST NOT notify supervisor on `*_REOPENED` events (assignee-only). |
| FR-006 | P0 | System MUST preserve company-wide delivery for `company_wide` category notifications unchanged. |

### 6.2 Channel Preference Rules

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-007 | P0 | System MUST provide independent `webEnabled` and `mobileEnabled` preferences per user. |
| FR-008 | P0 | System MUST default `webEnabled=true` and `mobileEnabled=true` on user creation or first evaluation. |
| FR-009 | P0 | System MUST expose preference toggles only to `Supervisor` and `Admin` role in settings UI. |
| FR-010 | P0 | System MUST enforce Member forced-on: stored preferences for `Member` role are ignored for `conversation_ticket` category evaluation. |
| FR-011 | P0 | Channel toggle MUST control real-time delivery only. Historical notification list visibility MUST NOT be affected by toggle state. |
| FR-012 | P0 | System MUST allow the same event to deliver to both web and mobile when both channels are enabled. |

### 6.3 Delivery Rules

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-013 | P0 | System MUST create at most one notification record per `(recipientUserId, eventId)` pair (dedupe). |
| FR-014 | P0 | System MUST NOT coalesce different `eventId`s into a single notification. |
| FR-015 | P0 | System MUST send FCM push to all `active` device tokens of a recipient. |
| FR-016 | P0 | System MUST mark FCM token `invalid` on invalid-token response and stop retry to that token. |
| FR-017 | P1 | System SHOULD auto-purge tokens with `status=invalid` older than 30 days via weekly cleanup job. |

### 6.3.1 Tap-Through Navigation

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-017a | P0 | Notification event payload MUST carry `entityType` and `entityId` for every `conversation_ticket` notification so both web and mobile clients can deep-link. |
| FR-017b | P1 | Web toast for `conversation_ticket` notification MUST be clickable and route to the corresponding entity view on click. |
| FR-017c | P1 | Web notification center card for `conversation_ticket` notification MUST be clickable and route to the corresponding entity view on click. |
| FR-017d | P1 | Mobile push for `conversation_ticket` notification MUST deep-link to the corresponding entity view on tap. |
| FR-017e | P1 | Opening a notification via tap/click MUST mark that notification as read. |
| FR-017f | P2 | For `company_wide` notifications, tap-through behavior MAY route to a relevant surface (e.g. billing page) but is not required in v0. |

### 6.4 Event Emission Rules

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-018 | P0 | System MUST emit distinct business event types: `CONVERSATION_ENTERED_TEAM_INBOX`, `CONVERSATION_ASSIGNED`, `CONVERSATION_REOPENED`, `TICKET_ENTERED_TEAM_INBOX`, `TICKET_ASSIGNED`, `TICKET_REOPENED`. |
| FR-019 | P0 | System MUST fire `*_ENTERED_TEAM_INBOX` only on state transition from `null/external_intake/unowned_queue` → `team_inbox_scoped`. |
| FR-020 | P0 | System MUST NOT fire `*_ENTERED_TEAM_INBOX` on read-model rehydrate, socket reconnect, consumer retry without state change, or reassignment within same team. |
| FR-021 | P0 | System MUST include `category` field on all notification events (`conversation_ticket` or `company_wide`). |
| FR-022 | P0 | System MUST reuse existing `emitAssignNotifications` (conversation-service) and `emitTicketAssignNotifications` (ticket-service) helpers, extending payload rather than replacing helpers. |

### 6.5 Websocket / API Gateway Rules

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-023 | P0 | For `category=conversation_ticket`, api-gateway MUST emit websocket event to `user:{userId}` room only. |
| FR-024 | P0 | For `category=conversation_ticket`, api-gateway MUST NOT fall back to `company:{companyId}` room broadcast. |
| FR-025 | P0 | For `category=company_wide`, existing api-gateway websocket broadcast behavior MUST be preserved. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
|----|------|----------|-------|
| EH-001 | People-service supervisor RPC unavailable | Log error, fall back to assignee-only delivery for that event; do not block assignee notification. | No user-facing message. Observability alert fires. |
| EH-002 | Preference read fails | Assume default `webEnabled=true, mobileEnabled=true`; log error. | User sees notification as usual. |
| EH-003 | FCM push returns invalid token | Mark token `status=invalid`; skip retry to that token; continue delivery to other tokens. | No user impact. Silent. |
| EH-004 | FCM push transient failure (timeout, 5xx) | Retry up to 3 times with exponential backoff; log final failure. | No user impact. |
| EH-005 | Notification-service queue processor crashes mid-event | Rely on RabbitMQ ack/redelivery; dedupe key `(userId, eventId)` prevents duplicate on retry. | No user impact if dedupe holds. |
| EH-006 | Duplicate event received (same eventId) | Skip processing (dedupe hit); log info. | No user impact. |
| EH-007 | Preference API PATCH fails validation | Return 400 with error detail; do not partial-update. | Settings UI shows error toast; toggle reverts to server state. |
| EH-008 | Device token register API fails | Return 500; mobile app retries with exponential backoff. | Mobile app logs; no user-facing error unless persistent. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
|----|----------|-------------------|-------|
| EC-001 | User is both direct assignee AND supervisor for team-inbox scope | Deliver exactly ONE notification (dedupe by `userId + eventId`). | Single notification card. |
| EC-002 | Supervisor covers multiple teams; event fires in team A | Notify supervisor once (not once per team membership). | Single notification. |
| EC-003 | Actor is also the assignee (self-assign) | Skip notification to actor (existing `skip actor` logic preserved). | No self-notification. |
| EC-004 | Ticket has no `teamInboxId` | Derive `teamInboxId` from originating conversation (Opsi A). Ticket supervisor-intake unblocked. | Conversation-originated ticket resolves correctly; standalone ticket without conversation defers intake notification. |
| EC-005 | User has no device tokens registered | Skip mobile channel; web still delivers if enabled. | No user impact. |
| EC-006 | User has multiple device tokens (multi-device) | Send FCM to all active tokens. | Notification appears on all devices. |
| EC-007 | Both web and mobile disabled by Supervisor/Admin | Create notification record; skip real-time delivery. | Notification appears in list on next open. |
| EC-008 | Event fires but no supervisor exists for team scope | Deliver to assignee only (if applicable); no supervisor branch. | Normal behavior. |
| EC-009 | Team inbox reassignment (item moves between teams) | Fire `*_ENTERED_TEAM_INBOX` for new team scope only if it's the first entry into any team inbox; otherwise no fire (see FR-020). | Depends on transition state. |
| EC-010 | Conversation reopened and reassigned within same event window | Fire `CONVERSATION_REOPENED` (assignee-only) + `CONVERSATION_ASSIGNED` if assignee changes; two separate events, no coalesce. | Two notifications if assignee changed. |
| EC-011 | User logs out and back in on mobile (token refresh) | Existing token upserts by `deviceToken`; `userId` updates to new user. Old user no longer receives push on that device. | Transparent to user. |
| EC-012 | Company-wide event happens to a supervisor who has web disabled | Company-wide category not gated by user preference in v0; supervisor still receives (existing behavior preserved). Confirmed per §17 Q8 lock. | Notification delivers. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
|-----------|-------------|---------|------------------------|
| Settings — Notification Preferences | Two toggles: `Web notification` and `Mobile notification`. Visible only for `Supervisor` and `Admin`. Both default ON. | User navigates to Settings → Notification. Toggles independently. Saves via PATCH. Loading spinner + toast on success/error. | US-004, US-005 |
| Notification Center — Category Distinction | Visual distinction between `conversation_ticket` and `company_wide` notifications (label, icon, section, or filter tab — design phase decides). | User opens notification bell. Sees two categories clearly separated. | US-006, US-008 |
| Notification Card — Conversation/Ticket | Shows actor, entity type, entity display ID, short trigger message. Card is clickable; click opens entity detail view and marks notification read. | Click card → route to conversation/ticket → mark read. | US-001, US-002, US-003, US-009 |
| Mobile Push Card | Shows actor, entity type (`Conversation` or `Ticket`), entity display ID, short trigger message. Tap opens correct entity in mobile app and marks notification read. | Tap push → deep link → entity view → mark read. | US-007 |
| Web Toast | Respects existing throttle behavior. Toast is clickable for `conversation_ticket` notifications; click routes to entity view and marks notification read. Auto-dismiss respects existing timing. | Toast appears → user clicks → route to entity → mark read. | US-009 |
| Preference Disabled State | Toggle surface reflects current stored state. Loading indicator during save. Error state on failure. | Toggle switches; disabled state clearly shown. | US-004, US-005 |

---

## **10. Field & Validation**

### 10.1 Notification Preference

| Field | Type | Example | Validation | Required | Default |
|-------|------|---------|------------|----------|---------|
| `webEnabled` | boolean | `true` | Must be boolean | No | `true` |
| `mobileEnabled` | boolean | `false` | Must be boolean | No | `true` |

### 10.2 Mobile Device Token

| Field | Type | Example | Validation | Required | Default |
|-------|------|---------|------------|----------|---------|
| `deviceToken` | string | FCM token string | Non-empty, ≤4096 chars | Yes | — |
| `platform` | enum | `ios` \| `android` | Must be one of allowed values | Yes | — |
| `appVersion` | string | `1.2.3` | Semver format | No | — |

### 10.3 Business Event Envelope

| Field | Type | Example | Validation | Required | Default |
|-------|------|---------|------------|----------|---------|
| `eventId` | UUID v4 | `550e8400-...` | UUID format | Yes | — |
| `eventType` | enum | `CONVERSATION_ENTERED_TEAM_INBOX` | Must match enum | Yes | — |
| `entityType` | enum | `conversation` \| `ticket` | Must match enum | Yes | — |
| `entityId` | ObjectId | `665f...` | Valid MongoDB ObjectId | Yes | — |
| `entityDisplayId` | string | `CONV-12345` | Non-empty | Yes | — |
| `companyId` | ObjectId | `665f...` | Valid ObjectId | Yes | — |
| `teamId` | ObjectId | `665f...` | Valid ObjectId | Conditional (all `conversation_ticket`) | — |
| `teamInboxId` | ObjectId | `665f...` | Valid ObjectId | Conditional (`*_ENTERED_TEAM_INBOX`) | — |
| `assigneeUserIds` | array<ObjectId> | `["665f..."]` | Non-empty for `*_ASSIGNED`/`*_REOPENED` | Conditional | — |
| `actorUserId` | ObjectId | `665f...` | Valid ObjectId | Yes | — |
| `occurredAt` | ISO8601 | `2026-07-21T10:00:00Z` | Valid ISO8601 | Yes | — |
| `category` | enum | `conversation_ticket` \| `company_wide` | Must match enum | Yes | — |
| `sourceChannel` | string | `whatsapp` | Optional context | No | — |

---

## **11. Non-Functional Requirements**

| Category | Requirement |
|----------|-------------|
| Performance | Notification delivery end-to-end (source event → user client) p95 ≤3 seconds under normal load. Recipient resolution RPC p95 ≤200ms. |
| Reliability | Dedupe by `(userId, eventId)` MUST be idempotent across retries. Message queue redelivery MUST NOT create duplicate notification records. |
| Security | Notification content MUST be scoped by `companyId`; cross-tenant leak = P0 bug. Preference API MUST authenticate user; toggle write MUST be role-gated (Supervisor/Admin only). |
| Privacy | Notification body MAY include entity display ID and actor name; MUST NOT include message body content in push preview for privacy (mobile push shows entity ID only). |
| Observability | Delivery attempt log records every send/skip/fail per channel with `eventId`, `userId`, `channel`, `result`, `errorCode`. Retention 90 days via TTL index. |
| Accessibility | Preference toggle UI keyboard-accessible; ARIA labels for screen readers. |
| Localization | Notification body copy localized per user locale (existing i18n framework). Time formatting per user timezone. |

---

## **12. State Transition Model**

### 12.1 Notification Delivery State

| Entity | Current State | Action/Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
|--------|---------------|----------------|------------|---------------|------------------|--------------|-------------|
| Notification Event | `received` | Processor picks up event from queue | `resolving_recipients` | system | valid envelope schema | — | `notification.event.received` |
| Notification Event | `resolving_recipients` | Supervisor RPC + assignee list resolved | `applying_dedupe` | system | resolver success | — | — |
| Notification Event | `applying_dedupe` | `(userId, eventId)` uniqueness check | `applying_preference_gate` | system | no duplicate found | Skip duplicates | `notification.event.deduped` (if skip) |
| Notification Event | `applying_preference_gate` | Read preference per recipient | `dispatching_channels` | system | pref resolved | — | — |
| Notification Event | `dispatching_channels` | Fan out to web + mobile | `delivered` \| `partial` \| `skipped` | system | at least one channel eligible | Web: create record + socket emit. Mobile: FCM send. | `notification.delivered` |
| Device Token | `active` | FCM invalid token response | `invalid` | system | token flagged by FCM | Stop retry to this token | `token.marked_invalid` |
| Device Token | `active` | User explicit logout | `revoked` | user | unregister API called | — | `token.revoked` |
| Device Token | `invalid` | Weekly cleanup, age >30d | `deleted` | system | age threshold | Hard delete row | `token.cleanup` |

### 12.2 Team-Inbox Intake State (Conversation/Ticket)

| Entity | Current State | Action/Trigger | Next State | Emits Event |
|--------|---------------|----------------|------------|-------------|
| Conversation | `null` / `external_intake` / `unowned_queue` | Assigned to team-inbox for first time | `team_inbox_scoped` | `CONVERSATION_ENTERED_TEAM_INBOX` |
| Conversation | `team_inbox_scoped` | Member assigned | `assigned` | `CONVERSATION_ASSIGNED` |
| Conversation | `closed` | Reopen | `assigned` (previous assignee) | `CONVERSATION_REOPENED` |
| Ticket | `null` / `external_intake` / `unowned_queue` | Enters team-inbox for first time | `team_inbox_scoped` | `TICKET_ENTERED_TEAM_INBOX` (derived via originating conversation teamInboxId — Opsi A) |
| Ticket | `team_inbox_scoped` | Assigned | `assigned` | `TICKET_ASSIGNED` |
| Ticket | `closed` | Reopen | `assigned` | `TICKET_REOPENED` |

---

## **13. Permission Matrix**

| Role | View Own Notifications | Configure Web Toggle | Configure Mobile Toggle | Receive Conv/Ticket Notif | Receive Supervisor-Intake Notif | Receive Company-wide Notif |
|------|----------------------|---------------------|------------------------|--------------------------|-------------------------------|---------------------------|
| Member | Allowed | Denied | Denied | Forced-on (if assigned) | N/A | Allowed (existing) |
| Supervisor | Allowed | Allowed | Allowed | Allowed (if assigned) + supervisor path | Allowed (by team scope) | Allowed (existing) |
| Admin | Allowed | Allowed | Allowed | Allowed (if assigned) | Allowed (by team scope) | Allowed (existing) |
| SuperAdmin | Allowed | Allowed | Allowed | N/A (rarely assigned) | N/A | Allowed (existing) |

---

## **14. API / Event Contract**

### 14.1 New RPC — people-service

| Contract | Method/Event | Producer | Consumer | Request/Payload | Response/Ack | Error Codes | Compatibility Notes |
|----------|--------------|----------|----------|-----------------|--------------|-------------|---------------------|
| `GetSupervisorRecipientsByTeamScope` | gRPC | notification-service | people-service | `{ userContext, companyId, teamId, teamInboxId?, activeOnly=true }` | `{ recipients: [{ userId, memberId, roleId, teamIds[] }] }` | `NOT_FOUND` (empty list, not error), `INTERNAL` | New RPC, no backward-compat issue |

### 14.2 New REST — Notification Preferences

| Contract | Method/Event | Producer | Consumer | Request/Payload | Response/Ack | Error Codes | Compatibility Notes |
|----------|--------------|----------|----------|-----------------|--------------|-------------|---------------------|
| Get own preferences | `GET /api/v1/notification-preferences/me` | Web/Mobile | notification-service | Auth header | `{ webEnabled, mobileEnabled }` | `401`, `500` | New endpoint |
| Update own preferences | `PATCH /api/v1/notification-preferences/me` | Web/Mobile | notification-service | `{ webEnabled?, mobileEnabled? }` | `{ webEnabled, mobileEnabled }` | `400`, `401`, `403` (Member), `500` | New endpoint; role-gated |

### 14.3 New REST — Mobile Device Tokens

| Contract | Method/Event | Producer | Consumer | Request/Payload | Response/Ack | Error Codes | Compatibility Notes |
|----------|--------------|----------|----------|-----------------|--------------|-------------|---------------------|
| Register token | `POST /api/v1/mobile-device-tokens/register` | Mobile app | notification-service | `{ deviceToken, platform, appVersion? }` | `{ id, status: "active" }` | `400`, `401`, `500` | New endpoint; upsert by `deviceToken` |
| Unregister token | `POST /api/v1/mobile-device-tokens/unregister` | Mobile app | notification-service | `{ deviceToken }` | `{ status: "revoked" }` | `400`, `401`, `404`, `500` | New endpoint |

### 14.4 Business Event Envelope (RabbitMQ)

| Contract | Method/Event | Producer | Consumer | Request/Payload | Response/Ack | Error Codes | Compatibility Notes |
|----------|--------------|----------|----------|-----------------|--------------|-------------|---------------------|
| Conversation/Ticket notification event | RabbitMQ msg via existing `IN_APP_NOTIFICATION_CREATE` queue with new `eventType` field | conversation-service, ticket-service | notification-service | See §10.3 envelope schema | Ack on process | Redelivery on nack | Single cutover behind flag (Q6 resolved) |

### 14.5 Websocket Delivery

| Contract | Method/Event | Producer | Consumer | Request/Payload | Response/Ack | Error Codes | Compatibility Notes |
|----------|--------------|----------|----------|-----------------|--------------|-------------|---------------------|
| Notification created | `NOTIFICATION_CREATED` socket event | notification-service | api-gateway | `{ notificationId, userId, category, ... }` | — | — | Existing event; api-gateway MUST route to `user:{userId}` for `category=conversation_ticket` (FR-023) |

### 14.6 FCM Push

| Contract | Method/Event | Producer | Consumer | Request/Payload | Response/Ack | Error Codes | Compatibility Notes |
|----------|--------------|----------|----------|-----------------|--------------|-------------|---------------------|
| Send FCM push | Firebase HTTP v1 API | notification-service | Firebase | `{ token, notification: { title, body }, data: { entityType, entityId } }` | FCM message ID | `INVALID_ARGUMENT`, `UNREGISTERED`, `INTERNAL` | New integration |

---

## **15. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
|------|------|-------|------------|----------|
| Preference collection | Create empty collection with default-on semantics; no backfill needed (missing = default true) | Engineering (notification-service) | Read returns defaults for users without record | Drop collection; treat all users as default-on |
| Device token collection | Create empty collection; unique index on `deviceToken` | Engineering (notification-service) | Empty state OK; tokens register as users open mobile app | Drop collection |
| Delivery log collection | Create with TTL index on `timestamp` (90d) | Engineering (notification-service) | Log rows appear after first event; TTL purges after retention | Drop collection |
| people-service RPC | Deploy new RPC; notification-service calls behind feature flag | Engineering (people-service, notification-service) | RPC returns expected supervisor list in staging | Disable flag; fall back to assignee-only |
| Event envelope migration | Producers add `eventType` + `category` fields; consumers ignore unknown fields initially | Engineering (all services) | Staging events carry new fields; consumers still work | Envelope changes are additive; no rollback needed |
| Feature flag `notification.recipient_targeting_v2` | Enable per-company | Product/Engineering | Canary company monitored for 1 week before broader rollout | Disable flag; revert to old broadcast path |
| Feature flag `notification.mobile_push_v1` | Enable per-company after mobile app FCM integration ships | Product/Engineering | Test devices receive push in staging | Disable flag; skip mobile branch |
| FE settings UI rollout | Deploy toggle UI behind role check; only Supervisor/Admin sees it | Frontend | Members do not see toggle in settings | Feature flag on FE component |
| Mobile app FCM integration | Ship in mobile release; behind app-level flag | Mobile Engineering | Devices receive test push | Disable FCM init at app boot |
| Old broadcast path retirement | After all companies on flag ≥30 days with 0 regression, retire dual-emit code | Engineering | Metrics show 100% flag adoption | Keep old path; skip retirement |

### Rollout Phases

1. **Phase 1 — Foundation (BE only, no user visibility):** Deploy people-service RPC, collections, delivery log, envelope field additions. Producers dual-emit (old + new envelope) for safety.
2. **Phase 2 — Recipient targeting (web-only, feature-flagged per company):** notification-service applies category branch, supervisor resolver, preference gate, dedupe. api-gateway applies socket audience rule.
3. **Phase 3 — Preference UI:** FE settings toggle live. `PATCH /notification-preferences/me` accepts writes.
4. **Phase 4 — Mobile push:** FCM module live in notification-service. Mobile token register/unregister API live. Mobile app FCM integration shipped. Feature flag `mobile_push_v1` per company.
5. **Phase 5 — Cleanup:** Retire dual-emit path in producers after all companies on flag with no regression.

---

## **16. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
|------|-------|------------|-----------|----------------------|---------------|---------------|
| Notification record | notification-service | Event processor | Existing product retention (unchanged) | Existing policy | Existing policy | Contains entity IDs + user IDs; scoped by companyId |
| Delivery attempt log | notification-service | Event processor | 90 days | TTL index auto-purge | Not exported | Contains eventId, userId, channel, result — no PII beyond user reference |
| Notification preference | notification-service | User via PATCH endpoint | Lifetime of user account | Delete on user deletion | Not exported | webEnabled, mobileEnabled per user |
| Mobile device token | notification-service | Mobile app via register endpoint | Until unregistered or auto-cleanup | `revoked` on logout; hard-delete `invalid` >30d | Not exported | FCM token strings — treated as credential-adjacent, no logging in plain form |

---

## **17. Open Questions (CLOSED — all decisions locked)**

| # | Question | Decision (per assessment recommendation) | Rationale |
|---|----------|------------------------------------------|----------|
| Q1 | **Ticket `teamInboxId` strategy** — ticket has no `teamInboxId`. | **Opsi A — derive from originating conversation.** | Conversation-originated ticket resolves via parent conversation's `teamInboxId`. Standalone ticket w/o conversation defers intake notification — acceptable for v0. |
| Q2 | **Preference storage ownership** — notification-service or user-service? | **notification-service.** | Single-service consistency with preference gate; avoids cross-service RPC on every preference read. |
| Q3 | **Multi-device support in phase 1** — multi-device or single-device? | **Multi-device from launch.** | Unique index on `deviceToken`, upsert semantics. No migration cost later. |
| Q4 | **Delivery log retention** — 90 or 30 days? | **90 days.** | Matches BRD target; storage cost negligible. |
| Q5 | **Feature flag granularity** — per-company or global cutover? | **Per-company.** | Safer canary + rollback isolation. |
| Q6 | **Backward-compat strategy for `IN_APP_NOTIFICATION_CREATE`** — dual-emit or single cutover? | **Reuse queue, add fields, single cutover behind flag.** | Envelope additions backward-compatible (consumers ignore unknown fields); dual-emit adds producer complexity. |
| Q7 | **Supervisor fan-out placement** — source-service expand or notification-service expand? | **notification-service resolver expands.** | Source services stay ignorant of recipient topology; matches existing centralization pattern. |
| Q8 | **Company-wide preference gate** — applies to `company_wide` too? | **Only `conversation_ticket`.** | Preserves existing company-wide behavior fully unchanged per BRD BR-11. |

---

## **18. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
|--------------------|-------|--------|------------|
| people-service RPC availability | Engineering (people-service) | Blocks supervisor recipient resolution | Feature flag; fall back to assignee-only if RPC down (EH-001) |
| Ticket `teamInboxId` decision — resolved (Opsi A: derive from conversation) | Product + Engineering | N/A — resolved | Opsi A chosen; no blocking path |
| FCM credentials setup | DevOps + Mobile | Blocks mobile push channel | Provision credentials in staging first; feature flag mobile push |
| Mobile app FCM integration | Mobile Engineering | Blocks Phase 4 rollout | Ship BE first; mobile follows independently behind app flag |
| api-gateway socket rule change | Engineering (api-gateway) | Regression risk on existing socket delivery | Extensive regression testing; feature flag on gateway rule |
| Existing consumer of `IN_APP_NOTIFICATION_CREATE` | Engineering (notification-service) | Envelope changes could break current processing | Envelope additions only (backward-compatible); single cutover behind flag — confirmed (Q6). |
| Preference collection uniqueness | Engineering | Race condition on concurrent PATCH could lose write | Optimistic concurrency or transaction on PATCH |
| Dedupe key implementation | Engineering (notification-service) | Wrong dedupe = double delivery or missed delivery | Unique index on `(userId, eventId)` at DB level, not app-level check |

---

## **19. Success Metrics**

| KPI | Target | Time Window | Data Source |
|-----|--------|-------------|-------------|
| Cross-tenant/cross-team notification leak count | 0 | Post-launch first 30 days | Delivery attempt log + QA regression |
| Supervisor intake notification success rate | ≥99% within 3s p95 | Rolling 7 days post-launch | Delivery attempt log |
| FCM push delivery success rate (valid active tokens) | ≥95% | Rolling 7 days post-launch | FCM API response + delivery log |
| Web notification delivery p95 latency | ≤3 seconds | Rolling 7 days | Trace + delivery log |
| Preference toggle write success rate | ≥99.5% | Rolling 30 days | API metrics |
| Company-wide notification regression count | 0 | Post-launch first 30 days | Existing company-wide flow monitoring |
| Duplicate delivery per `(userId, eventId)` | 0 | Continuous | Delivery log + dedupe index violation alerts |
| Percentage of Supervisors/Admins actively using channel toggles | Baseline only (informational) | 30 days post Phase 3 | Preference collection reads |

---

## **20. Future Considerations**

| Topic | Why It Matters Later |
|-------|---------------------|
| Email notification channel | Requested but explicitly out of scope for v0; likely follow-up |
| Per-notification-type preference toggle | User may want to mute supervisor-intake separately from other notifications (dropped from v0 §7.2) |
| SLA breach notification integration | SLA domain currently separate; integration point for supervisor alerting exists |
| Ticket transfer / conversation transfer notifications | Team-scope re-eval logic not designed in v0 |
| Rich mobile notification center UX | Deferred; v0 uses basic push presentation |
| Internal note mention notifications | Mention semantics not defined |
| Notification coalescing across events | Explicitly out of scope in v0 (FR-014) |
| Web push (browser-side push notification without websocket) | Alternative channel; not in v0 |
| Company-wide preference gate | Q8 locked to "only `conversation_ticket`". If decision reopens, follow-up scope. |

---

## **21. Limitations**

| Limitation | Impact |
|------------|--------|
| Member cannot mute conversation/ticket notifications | Intentional design (BR-10); users may complain about noise if over-assigned |
| Company-wide notifications remain company-wide by design | Non-operational classes still broadcast; user cannot opt out in v0 |
| Reopen does not notify supervisor | Intentional (§12.3); supervisor loses reopen visibility |
| No email fallback | Users who disable both channels see notifications only on next login |
| Mobile push preview shows entity ID, not message body | Privacy-first choice; may reduce push actionability |
| Multi-device dedupe is at `(userId, eventId)` level, not device level | User sees notification on all devices; not one device at a time |
| FCM invalid-token cleanup runs weekly | Between marking and cleanup, token stays as `invalid` occupying storage |

---

## **22. Appendix**

### Glossary

| Term | Definition |
|------|------------|
| Assignee | User currently owning a conversation or ticket via assignment. |
| Supervisor | Role with team-inbox scope monitoring privilege; can also be assignee. |
| Team Inbox | Scoped queue where new conversations/tickets land before assignment. |
| Category | Notification classification: `conversation_ticket` (operational) or `company_wide` (announcements, billing, etc.). |
| Dedupe Key | `(recipientUserId, eventId)` pair used to prevent duplicate notification records. |
| Forced-on | Behavior where user preference is ignored and notification always delivers. |
| Intake | First entry of a conversation/ticket into a team inbox scope. |
| FCM | Firebase Cloud Messaging — Google's mobile push service. |
| Event Envelope | Standard payload schema for RabbitMQ business events (see §10.3). |

### UI Labels (initial — final copy pending design phase)

| Surface | Label |
|---------|-------|
| Settings toggle — Web | `Web notification` |
| Settings toggle — Mobile | `Mobile notification` |
| Notification category — operational | `Conversations & Tickets` |
| Notification category — company | `Company Updates` |
| Push title (conversation) | `New conversation activity` |
| Push title (ticket) | `New ticket activity` |

### Assumptions

| Item | Assumption |
|------|------------|
| Existing conversation/ticket assignee helpers work correctly | Confirmed via code baseline (§5.1, §5.2 of change intake brief v0.2) |
| Notification-service can handle additional per-event RPC call cost | Assumed; performance test needed in staging |
| Mobile app can be updated to integrate FCM within rollout timeline | Assumed; mobile team confirms feasibility |
| Feature flag infrastructure supports per-company toggling | Assumed based on existing SatuInbox flag patterns |

### Open Questions

See §17. All 8 questions closed with decisions locked.

1. Ticket `teamInboxId` strategy → **Opsi A — derive from conversation**
2. Preference storage ownership → **notification-service**
3. Multi-device phase 1 support → **yes, from launch**
4. Delivery log retention → **90 days**
5. Feature flag granularity → **per-company**
6. Backward-compat strategy → **single cutover behind flag**
7. Supervisor fan-out placement → **notification-service resolver**
8. Company-wide preference gate → **only `conversation_ticket`**

### References

| Item | Path |
|------|------|
| BRD source | `BRD/Notification/notification-recipient-channel-expansion-BRD-v0.md` |
| Change intake brief (v0.2) | `Assessments/cross-domain/notification-recipient-channel-expansion/notification-recipient-channel-expansion-change-intake-brief.md` |
| Conversation assignee emitter | `apps/conversation-service/src/app/services/conversation.service.ts:2133-2144, 2585-2618` |
| Ticket assignee emitter | `apps/ticket-service/src/app/services/ticket.service.ts:652-660, 1634-1642, 2070-2102` |
| Notification hub processor | `apps/notification-service/src/app/processors/in-app-notification.processor.ts` |
| People-service proto | `proto/people.proto:38-49, 52-70` |
| Ticket team reference | `apps/ticket-service/src/app/services/message-authorization.service.ts:124` |
| Auth-service role proto | `proto/auth.proto:42-46` |
