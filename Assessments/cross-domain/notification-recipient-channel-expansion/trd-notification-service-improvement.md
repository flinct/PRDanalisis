# TECHNICAL REQUIREMENT DOCUMENT (TRD)

**Feature**: Notification Recipient & Channel Expansion (web + mobile push via Expo)
**Source PRD**: [`prd/prd-notification-service-improvement.md`](../prd/prd-notification-service-improvement.md) (v0.3, 2026-08-10)
**Engineering Lead**: Naftal Yunior
**Status**: Draft for implementation hand-off
**Date (Asia/Jakarta)**: 2026-08-10

> **Scope of this TRD: backend (`backend/`) + web frontend (`frontend/`) only.** The mobile application is built by a **separate team** and is explicitly **not** planned here. What this TRD owes them is a frozen contract — token registration API, push payload/`data` shape, Android channel requirement, deep-link keys — specified in **§13**. No mobile screens, SDK wiring, permission flows, or app-store work appears in any phase below.
>
> Every "current state" claim is verified against source and cited as `path:line`. Product decisions **Q1–Q11 in the PRD are locked** and not re-opened. Where the code contradicts the PRD, **the code wins** and the contradiction is raised in §2.9.

---

## 1. How this maps to the PRD

| PRD cluster | FRs | TRD section | Phase |
|---|---|---|---|
| Recipient rules (assignee + supervisor by team scope) | FR-001..006 | §5.2, §4.2, §6 | 1, 2 |
| Channel preference (web/mobile independent, Member forced-on) | FR-007..012 | §3.1, §5.3, §7.1, §8.1 | 1, 2, 3 |
| Delivery rules + dedupe | FR-013, FR-014 | §3.4, §5.2.3 | 1, 2 |
| Expo push send / token lifecycle | FR-015..017 | §5.5, §5.7 | 4 |
| Tap-through navigation | FR-017a..f | §5.1, §8.2 | 2, 3 |
| Expo transport rules (batching, tickets, receipts, limits) | FR-017g..p | §5.5, §5.6, §10 | 4 |
| Event emission + intake transition guard | FR-018..022 | §6.1, §6.2, §6.3 | 1, 2 |
| Websocket audience rule | FR-023..025 | §7.2 | 2 |
| Error handling / edge cases | EH-001..014, EC-001..012 | §5.4, §5.5.3, §11 | all |

**One-line architecture:** source services enrich the *existing* `IN_APP_NOTIFICATION_CREATE` RabbitMQ envelope with `eventId` / `category` / `teamId` / `teamInboxId`; notification-service resolves recipients (assignee + supervisors via a new people-service RPC), dedupes on `(userId, eventId)`, applies the per-channel preference gate, then fans out to **web** (existing record + gateway socket emit) and **mobile** (new Expo batch send → ticket persisted → receipt reconciliation cron); api-gateway stays HTTP/WS only and gains 4 REST endpoints.

```
conversation-service / ticket-service
  └─ RMQ  in_app_notification.create   (envelope + eventId, category, teamId, teamInboxId)
        │
        ▼
notification-service  InAppNotificationProcessor
  ├─ resolve recipients ── gRPC → people-service  TeamService.GetSupervisorRecipientsByTeamScope  (NEW)
  ├─ role lookup       ── gRPC → people-service  MemberService.GetMemberByUserId  (exists, cached)
  ├─ dedupe            ── Mongo unique (userId, eventId)                     [notifications]
  ├─ preference gate   ── Mongo                                             [notificationpreferences]  (NEW)
  ├─ web   ─ create notification ─ RMQ → api-gateway → socket  user:{userId}
  └─ mobile ─ ExpoPushService ─ HTTPS → exp.host/--/api/v2/push/send
                │                       ├─ tickets  → [notificationdeliveryattempts]  (NEW)
                │                       └─ cron ≥15m → getReceipts → reconcile
                └─ tokens                                                   [mobiledevicetokens]  (NEW)

api-gateway (HTTP only)  GET/PATCH /notification-preferences/me
                         POST      /mobile-device-tokens/register|unregister
frontend (omnichannel)   Settings → Notification toggles;  clickable toast
```

---

## 2. Current state (verified)

### 2.1 The pipeline already exists end-to-end — this feature extends it, it does not build it

[`apps/notification-service/src/app/processors/in-app-notification.processor.ts`](../backend/apps/notification-service/src/app/processors/in-app-notification.processor.ts)

- `@MessagePattern(EventTypeEnum.IN_APP_NOTIFICATION_CREATE)` (`:56`) — **request/response** pattern, not `@EventPattern`. `EventTypeEnum.IN_APP_NOTIFICATION_CREATE = 'in_app_notification.create'` ([`libs/common/src/lib/enums/index.ts:274`](../backend/libs/common/src/lib/enums/index.ts)).
- The handler already: skips self-actor (`:65-70`), gates assignment events on `assignmentSource === 'manual'` (`:73-78`, `:226-228`), maps type → group (`:81`), builds a dedupe key and checks it (`:84-97`), applies **rollup + soft-cap for the UPDATES group** (`:100-126`), renders from templates (`:129`, `:166-194`), creates the record (`:132-154`) and emits to the gateway (`:157`, `:293-319`).
- **Every failure is swallowed**: the whole body is wrapped in `try/catch` that only logs (`:158-160`). With `@MessagePattern` there is no nack/redelivery today, so "RabbitMQ redelivery" (PRD EH-005) is **not** a mechanism we currently have — see §2.9-C.
- One notification = **one recipient**: the processor consumes one `recipientUserId` per message (`:58`, `:153`). Supervisor fan-out therefore has two possible homes; PRD Q7 locks it to notification-service, so the processor becomes 1 message → N recipients (§5.2).

### 2.2 The envelope is a plain TS interface, not proto

[`apps/notification-service/src/app/interfaces/in-app-notification.interface.ts`](../backend/apps/notification-service/src/app/interfaces/in-app-notification.interface.ts)

- `InAppNotificationPayload` (`:8-63`): `type`, `companyId`, `organizationId`, `recipientUserId`, `actorName?`, `actorUserId?`, `entityType: 'conversation' | 'ticket'`, `entityId`, `entityPublicId`, `actionLink`, `excerpt?`, `sla*`, `sourceId?`, `assignmentSource?`, `messageTemplate?`, `messageParams?`.
- **Absent:** `eventId`, `category`, `teamId`, `teamInboxId`, `occurredAt`, `assigneeUserIds`. `entityPublicId` is the PRD's `entityDisplayId`; `actionLink` already carries the deep link.
- Because the transport is RMQ/JSON (not proto), envelope additions need **no `generate-proto-types` run** and are backward-compatible by construction (PRD Q6).
- `NOTIFICATION_TYPE_GROUP_MAP` (`:70-102`), `DEDUP_WINDOW_SECONDS = 60` (`:107`), `ROLLUP_WINDOW_SECONDS = 120` (`:113`), `UPDATES_SOFT_CAP_PER_HOUR = 2` (`:118`).

### 2.3 The gateway socket rule is *already* user-room-first

[`apps/api-gateway/src/websocket/controllers/notification-emit.controller.ts:32-52`](../backend/apps/api-gateway/src/websocket/controllers/notification-emit.controller.ts) routes on presence of `data.userId`: user room when set, company room otherwise. [`websocket/services/notification.service.ts`](../backend/apps/api-gateway/src/websocket/services/notification.service.ts) has `emitNotification` → `company:{id}` (`:34-40`) and `emitToUser` → `user:{id}` (`:51-56`), both emitting `SocketEventEnum.NOTIFICATION_NEW`. Prefixes: `PREFIX_COMPANY = 'company:'` (`enums/index.ts:1167`), `PREFIX_USER = 'user:'` (`:1169`), `NOTIFICATION_NEW = 'notification.new'` (`:1180`).

> **FR-023/FR-024 are therefore ~90% satisfied today.** The residual work is a *guard*, not a rewrite: for `category=conversation_ticket` a missing `userId` must be treated as a defect (log + drop, never company-broadcast). The doc-comment on `emitToUser` ("Falls back to company room if userId is not provided") does not match the implementation — it never falls back.

### 2.4 Schemas and the 90-day TTL precedent

[`apps/notification-service/src/app/schemas/notification.schema.ts`](../backend/apps/notification-service/src/app/schemas/notification.schema.ts) — `@Schema({ collection: 'notifications', timestamps: true })` (note: **no `versionKey: false`**, unlike the house rule), `userId?` optional (null ⇒ company-wide), `type`, `group`, `title`, `message`, `messageTemplate?`, `messageParams?`, `actionLink?`, `metadata?`, `isRead`, `readAt?`, `readBy?`, `dedupKey?`; six compound indexes declared after `SchemaFactory`. **No `category`, no `eventId`.**

[`schemas/notification-log.schema.ts`](../backend/apps/notification-service/src/app/schemas/notification-log.schema.ts) is the exact precedent for the PRD's delivery-attempt log: `collection: 'notification_logs'`, `status: 'failed' | 'sent' | 'skipped'`, `failureReason?`, and `index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })` = **90 days** (`:42-44`). It is email/billing-specific (`recipientEmail`, `referenceType`), so the new per-channel log is a sibling collection, not a reuse.

### 2.5 gRPC surface of notification-service

[`proto/notification.proto`](../backend/proto/notification.proto) has exactly one service with 5 read/write RPCs (`:7-13`): `GetNotification`, `ListNotifications`, `MarkNotificationAsRead`, `MarkAllNotificationsAsRead`, `GetUnreadCount`. `ListNotificationsRequest` already carries `group` and `entity_filter` (`:26-27`). **No preference and no device-token RPC exists.** The HTTP front door is [`apps/api-gateway/src/app/notification/notification.controller.ts`](../backend/apps/api-gateway/src/app/notification/notification.controller.ts).

### 2.6 Source emitters — shape is right, envelope is thin

- Conversation: `emitAssignNotifications(...)` [`conversation.service.ts:2546-2583`](../backend/apps/conversation-service/src/app/services/conversation.service.ts) — resolves actor name via `userService.getUser` (`:2558`), `publicId = conversation.conversationNumber` (`:2560`), loops participants and skips the actor (`:2564`), emits with `actionLink = /conversation?conversationId=…` (`:2567`). Call site `:2095`. Other emit sites: `:1912`, `:2352`, plus [`conversation-sla-reminder-cron.service.ts:281`](../backend/apps/conversation-service/src/app/services/conversation-sla-reminder-cron.service.ts) and [`note.service.ts:487`](../backend/apps/conversation-service/src/app/services/note.service.ts).
- Ticket: `emitTicketAssignNotifications(...)` [`ticket.service.ts:2071-2107`](../backend/apps/ticket-service/src/app/services/ticket.service.ts) — same shape, `actionLink = /ticketing?ticketId=…` (`:2091`), `assignmentSource: 'manual'` hardcoded (`:2094`), and a documented quirk: **`member.user.id` is the real user id, `member.id` is what the ticket schema stores in `participant.userId`** (`:2067-2068`). Call sites `:655`, `:1637`, `:1680`; reopen emitter `:2112-2146`; other emits `:1963`, `:2021`, `:2090`, `:2130`.
- Neither emitter knows about teams, and **no `*_ENTERED_TEAM_INBOX` notification type exists** in `NotificationTypeEnum` (the group map at `interface:70-102` enumerates every type in use).

### 2.7 people-service has team RPCs but no supervisor-by-scope resolver

[`proto/people.proto`](../backend/proto/people.proto): `TeamService` (`:38-49`) — `GetTeams`, `GetTeamsWithMembers`, `GetTeamById`, `GetTeamByAccountChannelId`, `GetTeamsByUserId`, … ; `MemberService` (`:106-123`) — `GetMemberById`, `GetMemberByUserId` (`:110`), `GetMembersByIds` (`:117`), … ; `message Team` (`:408`), `MemberInfo` (`:436`). Roles come from `RoleTypeEnum` ([`libs/common/src/lib/enums/index.ts:14-22`](../backend/libs/common/src/lib/enums/index.ts)) which includes `SUPERVISOR`, `ADMIN`, `MANAGER`, `TEAM_LEAD`, `AGENT`. Member documents carry `roleId` and an embedded `role?: RoleInfo` ([`member.schema.ts:118-122`, `:211-214`](../backend/apps/people-service/src/app/schemas/member.schema.ts)).

### 2.8 Everything mobile-push-shaped is absent; the building blocks are not

- No preference, device-token, push, or receipt code anywhere in notification-service (`schemas/`, `services/`, `repositories/`, `processors/` inventories in §2.4/§2.5).
- **Cron precedent** (`@nestjs/schedule` + `ScheduleModule` in `app.module.ts`): [`conversation-sla-reminder-cron.service.ts`](../backend/apps/conversation-service/src/app/services/conversation-sla-reminder-cron.service.ts), [`ticket-service/…/sla-evaluation-cron.service.ts`](../backend/apps/ticket-service/src/app/services/sla-evaluation-cron.service.ts), [`analytics-service/…/aggregation-scheduler.service.ts`](../backend/apps/analytics-service/src/app/services/aggregation-scheduler.service.ts). notification-service does **not** import `ScheduleModule` yet.
- **Outbound HTTP precedent** (`@nestjs/axios`): [`company-service/…/contact-sync-setting.service.ts`](../backend/apps/company-service/src/app/services/contact-sync-setting.service.ts), [`analytics-service/…/redash.service.ts`](../backend/apps/analytics-service/src/app/services/redash.service.ts), [`conversation-service/…/livechat-transcript-webhook.service.ts`](../backend/apps/conversation-service/src/app/services/livechat-transcript-webhook.service.ts).

### 2.9 Frontend current state

| Surface | File | State |
|---|---|---|
| Notification page | [`components/pages/notification/ManageNotificationPage.tsx`](../frontend/apps/omnichannel/components/pages/notification/ManageNotificationPage.tsx) | exists |
| List / item / filters / tabs | [`components/molecules/notification/*`](../frontend/apps/omnichannel/components/molecules/notification/) | exists |
| **Card click-through** | `NotificationItem.tsx:226`, `:233`, `:240` | **already implemented** — `isNavigable = !!onNotificationClick && !!notification.actionLink`, marks read on click. FR-017c/FR-017e are effectively done for the card. |
| **Toast** | [`hooks/notification/socket/use-notification-socket-event.ts:37-56`](../frontend/apps/omnichannel/hooks/notification/socket/use-notification-socket-event.ts) | `showToast({ data: { description, title }, type: DEFAULT })` — **not clickable**; throttled to 3 per 30 s (`:13-29`); invalidates `FETCH_NOTIFICATIONS` + `FETCH_UNREAD_COUNT`. This is the FR-017b gap. |
| Query keys | [`constants/query-key.ts:309-312`](../frontend/apps/omnichannel/constants/query-key.ts) | `NOTIFICATION_QUERY_KEY = { FETCH_NOTIFICATIONS, FETCH_UNREAD_COUNT }` — a preference key must be added |
| Settings routes | `app/[locale]/(main)/settings/` | `channels`, `developer`, `inbox`, `organization`, `subscriptions`; `settings/inbox` holds `assignments`, `csat`, `macros`, `sla`, `team-inbox`, `tickets`. **No notification settings surface exists.** |
| i18n | [`packages/i18n/src/translations/`](../frontend/packages/i18n/src/translations/) | `notification` and `settings` namespaces already exist (`en` + `id`) |

### 2.10 Contradictions the PRD does not know about — must be resolved before Phase 2

| # | Conflict | Impact | Proposal |
|---|---|---|---|
| **A** | PRD FR-013 dedupe = `(userId, eventId)`. Code dedupes on `dedupKey = recipient:type:entityType:entityId:sourceId` within **60 s** and only when `sourceId` is present (`processor:234-240`). | Two dedupe mechanisms would coexist. | Add `eventId` + a **partial unique index**; leave `dedupKey` untouched for legacy types (§3.4). Both may run; `eventId` wins for enriched envelopes. |
| **B** | `UPDATES` group is **rolled up** (previous notification for same entity+type **deleted** within 120 s, `processor:104-111`) and **soft-capped**, replacing further notifications with a digest (`:114-125`). `CONVERSATION_ASSIGNED` / `TICKET_ASSIGNED` / `*_REOPENED` are all in `UPDATES` (`interface:91-96`). This directly violates **FR-011** (history must persist) and **FR-014** (no coalescing). | Supervisor fan-out makes it worse: `UPDATES_SOFT_CAP_PER_HOUR = 2` (`interface:118`) — the third operational notification in an hour becomes a digest and is lost as a discrete item. The constant also contradicts its own doc comment ("20/hour", `:116-117`) and the PRD's FR-043 lineage. | **Gate rollup + soft cap on `category`**: skip both when `category === 'conversation_ticket'` (§5.2.4). Legacy/`company_wide` behavior untouched. **Needs PM sign-off — it changes noise characteristics for assignees.** |
| **C** | PRD EH-005 relies on "RabbitMQ ack/redelivery". The processor uses `@MessagePattern` and catches everything (`:56-160`), so a crash mid-event is **not** redelivered today. | The reliability claim is aspirational. | Keep `@MessagePattern` (changing it is out of scope), but make each recipient's dispatch independently idempotent and log-visible (§5.4). Note as a residual risk (§14 R-3). |
| **D** | `notifications` uses `timestamps: true` **without** `versionKey: false`, against `.claude/rules/backend-coding-patterns.md`. | Cosmetic; touching it rewrites documents. | Do **not** change the existing schema decorator. New collections follow the house rule. |
| **E** | Ticket participants store `member.id` in `participant.userId` (`ticket.service.ts:2067-2068`). | Supervisor/assignee resolution can silently target the wrong id space. | All new envelope ids MUST be **user ids**; reuse `resolveParticipantUserIds` (`ticket.service.ts:2148+`) rather than reading `participant.userId` directly (§6.1). |

---

## 3. Data model (notification-service, `MONGODB_NOTIFICATION_URI`)

All new schemas: `@Schema({ timestamps: true, versionKey: false })`, explicit `type` on every `@Prop`, repository access only.

### 3.1 `notificationpreferences` (NEW) — FR-007..011, Q2

| Field | Type | Notes |
|---|---|---|
| `userId` | `Types.ObjectId` | `required`, **unique** |
| `companyId` | `Types.ObjectId` | `required`, `index` (multi-tenancy) |
| `organizationId` | `Types.ObjectId` | `required` |
| `webEnabled` | `Boolean` | `default: true` |
| `mobileEnabled` | `Boolean` | `default: true` |

- Index: `{ userId: 1 }` unique. **No backfill** — a missing document means both channels enabled (FR-008, EH-002).
- Write path is `findOneAndUpdate(..., { upsert: true, new: true })` so concurrent PATCH cannot lose the row (PRD §18 "Preference collection uniqueness").

### 3.2 `mobiledevicetokens` (NEW) — FR-015..017, FR-017g, Q3

| Field | Type | Notes |
|---|---|---|
| `expoPushToken` | `String` | `required`, **unique**; validated against `EXPO_PUSH_TOKEN_REGEX` |
| `userId` | `Types.ObjectId` | `required`, `index` |
| `companyId` / `organizationId` | `Types.ObjectId` | `required` (tenant scope) |
| `platform` | `String` | enum `ios` \| `android` |
| `appVersion` | `String` | optional |
| `status` | `String` | enum `active` \| `invalid` \| `revoked`, `default: 'active'` |
| `invalidatedAt` | `Date` | set on `DeviceNotRegistered` — drives the 30-day purge (FR-017) |
| `lastSuccessAt` | `Date` | last `status: ok` receipt |

- Indexes: `{ expoPushToken: 1 }` unique; `{ userId: 1, status: 1 }`; `{ status: 1, invalidatedAt: 1 }` (purge job).
- Upsert by `expoPushToken` and overwrite `userId` — satisfies EC-011 (logout/login on the same device).

### 3.3 `notificationdeliveryattempts` (NEW) — FR-017p, §11 Observability

| Field | Type | Notes |
|---|---|---|
| `eventId` | `String` | `index` |
| `userId` / `companyId` | `Types.ObjectId` | `index` on `companyId` |
| `channel` | `String` | enum `web` \| `mobile` |
| `result` | `String` | enum `sent` \| `skipped` \| `failed` \| `unresolved` |
| `skipReason` | `String` | `preference_off` \| `no_token` \| `duplicate` \| `actor_is_recipient` |
| `errorCode` | `String` | Expo ticket/receipt `details.error`, or transport code |
| `ticketId` | `String` | sparse `index` — Expo push ticket id |
| `receiptStatus` | `String` | `pending` \| `ok` \| `error` \| `expired` |
| `tokenRef` | `String` | **last 6 chars only** — never the full token (§9) |

- TTL: `index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })` — copy of `notification-log.schema.ts:42-44` (90 days, Q4).
- Reconciliation index: `{ receiptStatus: 1, createdAt: 1 }`.

### 3.4 `notifications` — two additive fields (contradiction A)

```ts
@Prop({ enum: NotificationCategoryEnum, index: true, type: String })
category?: NotificationCategoryEnum;   // 'conversation_ticket' | 'company_wide'

@Prop({ index: true, type: String })
eventId?: string;                      // envelope UUID v4
```

```ts
NotificationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { eventId: { $exists: true } } },
);
```

The partial filter is mandatory — a plain unique index would collide across every legacy document where `eventId` is undefined. **Uniqueness lives in the DB, not in application code** (PRD §18). A duplicate insert raises Mongo `E11000`, which the processor catches and logs as `skipped/duplicate` (EH-006).

### 3.5 Constants — `apps/notification-service/src/app/constant/expo-push.constant.ts` (NEW)

`EXPO_PUSH_SEND_URL`, `EXPO_PUSH_RECEIPTS_URL`, `EXPO_PUSH_MAX_BATCH = 100`, `EXPO_RECEIPT_MAX_IDS = 1000`, `EXPO_MAX_CONCURRENCY = 6`, `EXPO_MAX_NOTIFICATIONS_PER_SECOND = 600`, `EXPO_PAYLOAD_MAX_BYTES = 4096`, `RECEIPT_MIN_AGE_MINUTES = 15`, `RECEIPT_EXPIRY_HOURS = 24`, `TOKEN_PURGE_AFTER_DAYS = 30`, `EXPO_PUSH_TOKEN_REGEX`, `EXPO_ERROR_CODE` map, plus `ERROR_CODE` additions in [`constant/error.constant.ts`](../backend/apps/notification-service/src/app/constant/error.constant.ts) for the new `Grpc*Exception` internal codes.

### 3.6 `libs/common` additions

- `NotificationCategoryEnum { CONVERSATION_TICKET = 'conversation_ticket', COMPANY_WIDE = 'company_wide' }`.
- `NotificationTypeEnum`: `CONVERSATION_ENTERED_TEAM_INBOX`, `TICKET_ENTERED_TEAM_INBOX` (FR-018).
- A `NOTIFICATION_TYPE_CATEGORY_MAP` next to the existing group map, so category is derived server-side even if a producer omits it (defensive default: `company_wide` for known billing types, `conversation_ticket` for conversation/ticket types).

---

## 4. Contracts

### 4.1 `proto/notification.proto` — two new services

```proto
service NotificationPreferenceService {
  rpc GetMyNotificationPreference(GetMyNotificationPreferenceRequest) returns (NotificationPreference);
  rpc UpdateMyNotificationPreference(UpdateMyNotificationPreferenceRequest) returns (NotificationPreference);
}

service MobileDeviceTokenService {
  rpc RegisterMobileDeviceToken(RegisterMobileDeviceTokenRequest) returns (MobileDeviceToken);
  rpc UnregisterMobileDeviceToken(UnregisterMobileDeviceTokenRequest) returns (common.Success);
}
```

- `UpdateMyNotificationPreferenceRequest` uses **`google.protobuf.BoolValue`** (or two `*_set` companion booleans) for `web_enabled` / `mobile_enabled`, because proto3 cannot distinguish "absent" from `false` and FR-007's PATCH semantics are partial.
- Requests carry `user_context` (`companyId`, `organizationId`, `userId`, `roleType`) exactly like the existing gateway→service calls, so the service never trusts client-sent ids.
- **After editing the proto run `npm run generate-proto-types`.** Adding an RPC to a *new* service is inert for existing controllers; adding one to an *existing* service breaks its controller with TS2420 until implemented — that is why preferences and tokens get their own services.

### 4.2 `proto/people.proto` — one new RPC on `TeamService` (FR-003/004, Q7)

```proto
rpc GetSupervisorRecipientsByTeamScope(GetSupervisorRecipientsByTeamScopeRequest)
    returns (SupervisorRecipientsResponse);

message GetSupervisorRecipientsByTeamScopeRequest {
  common.UserContext user_context = 1;
  string company_id = 2;
  string organization_id = 3;
  string team_id = 4;
  string team_inbox_id = 5;   // optional
  bool active_only = 6;       // default true
}
message SupervisorRecipient {
  string user_id = 1;
  string member_id = 2;
  string role_id = 3;
  string role_type = 4;       // RoleTypeEnum
  repeated string team_ids = 5;
}
message SupervisorRecipientsResponse { repeated SupervisorRecipient recipients = 1; }
```

Implementation: resolve the team, take its member list, filter `isActive` + `role.type ∈ {SUPERVISOR, ADMIN}` (PRD §13 permission matrix), **de-duplicate by `user_id`** (EC-002), and return an **empty list rather than `NOT_FOUND`** when no supervisor exists (EC-008, PRD §14.1). This is a read-only RPC — it must not mutate. Target p95 ≤200 ms (PRD §11); cache per `(companyId, teamId)` in the `cache` lib with a short TTL since team membership changes rarely.

### 4.3 Envelope (RMQ JSON) — additive fields on `InAppNotificationPayload`

```ts
eventId: string;                       // UUID v4, REQUIRED for enriched producers
category: NotificationCategoryEnum;
teamId?: string;                       // required for conversation_ticket
teamInboxId?: string;                  // required for *_ENTERED_TEAM_INBOX
assigneeUserIds?: string[];            // *_ASSIGNED / *_REOPENED
occurredAt?: string;                   // ISO8601
recipientUserId?: string;              // now OPTIONAL — see §5.2
```

`recipientUserId` becoming optional is the only semantically breaking change and it is **read-side tolerant**: when present the processor targets that user (all legacy producers), when absent it resolves recipients itself. No producer needs to change in the same deploy as the consumer.

---

## 5. Backend design — notification-service

### 5.1 Processor restructure

`handleInAppNotification` is already `// eslint-disable-next-line max-lines-per-function` + `complexity` (`processor:55-57`) — it must **not** absorb more logic. Extract into `services/`:

| New unit | Responsibility |
|---|---|
| `NotificationRecipientResolverService` | envelope → deduped recipient list (§5.2) |
| `NotificationPreferenceService` | per-recipient channel gate + preference CRUD (§5.3) |
| `NotificationDispatcherService` | per-recipient web/mobile fan-out + delivery log (§5.4) |
| `ExpoPushService` | Expo transport only (§5.5) |
| `ExpoReceiptReconciliationService` | cron + receipt handling (§5.6) |
| `MobileDeviceTokenService` | token CRUD, invalidation, purge (§5.7) |

The processor keeps: parse/validate envelope → `resolver` → `for each recipient: dedupe → gate → dispatch`. Each unit stays < 50 lines per method; new files are 200–400 lines max.

`entityType`/`entityId` are already on the envelope and `actionLink` already carries the deep link (`processor:133`), so **FR-017a needs no producer change** — but the gateway payload must also carry `entityType`/`entityId`/`category`, which today it does implicitly via `metadata` (`processor:140-149`) and not at all for `category`. Add `category` to the emitted socket payload (`processor:299-315`).

### 5.2 Recipient resolution

1. **Legacy path** — `recipientUserId` present ⇒ `[recipientUserId]`. Behavior identical to today.
2. **Assignees** — `assigneeUserIds` (already user ids per §2.10-E), minus `actorUserId` (EC-003, preserving `processor:65-70`).
3. **Supervisors** — only for `*_ENTERED_TEAM_INBOX` and `*_ASSIGNED` (FR-003), never `*_REOPENED` (FR-005). Call `GetSupervisorRecipientsByTeamScope`; on failure **log and continue with assignees only** (EH-001) — the assignee notification must never be blocked by people-service.
4. **Union + dedupe by `userId`** (EC-001, EC-002).
5. **Dedupe per recipient** — insert with `eventId`; `E11000` ⇒ log `skipped/duplicate` and continue (FR-013, EH-006).

### 5.3 Preference gate (FR-007..012)

- `category === 'company_wide'` ⇒ **no gate at all** (Q8, EC-012). Return `{ web: true, mobile: true }` before any lookup.
- `category === 'conversation_ticket'`:
  - Resolve the recipient's role. notification-service holds no member data, so call `MemberService.GetMemberByUserId` (`people.proto:110`) and **cache** the `roleType` per `(companyId, userId)` via the `cache` lib (`CacheTTLEnum`) — without the cache this adds one RPC per recipient per event and blows the p95 ≤3 s budget on supervisor fan-out.
  - `roleType` resolves to Member/Agent ⇒ **forced on**, stored preference ignored (FR-010).
  - Otherwise read `notificationpreferences`; missing document or read error ⇒ both channels enabled (FR-008, EH-002).
- The gate governs **real-time delivery only**. The notification record is created regardless (FR-011, US-006, EC-007) — this is why the gate runs *after* the record insert, not before.

### 5.4 Dispatch + delivery log

| Channel | Action | Log row |
|---|---|---|
| web | existing `emitNotificationToGateway` (`processor:293-319`) + `category` | `channel: web`, `result: sent` |
| web (gated off) | skip emit, record already persisted | `result: skipped`, `skipReason: preference_off` |
| mobile | `ExpoPushService.enqueue(recipient, notification)` | one row **per token**, `result: sent` + `ticketId`, or `skipped/no_token` |

Every branch writes exactly one row per `(eventId, userId, channel[, token])`. A dispatch failure on one channel must not abort the other (EH-003/EH-012).

### 5.5 `ExpoPushService` — the transport (FR-015, FR-017g..p)

**Library decision:** use **`expo-server-sdk`** (npm) wrapped in our own service, rather than hand-rolling `HttpService` calls. It implements chunking to 100, gzip, `ExponentPushToken` validation, and `chunkPushNotificationReceiptIds`, i.e. FR-017h/FR-017k plumbing we would otherwise re-derive. The wrapper keeps the transport swappable (PRD §20 direct-FCM row). *If dependency approval is refused*, the fallback is `@nestjs/axios` following the `redash.service.ts` precedent (§2.8) — the wrapper interface does not change either way.

**Send path**

1. Load `active` tokens for the recipient (EC-005 ⇒ skip channel; EC-006 ⇒ one message per token so tickets stay 1:1 traceable).
2. Build the message per PRD §10.4. Assert `Buffer.byteLength(JSON.stringify(message)) <= 4096`; if over, truncate `body` deterministically with an ellipsis (FR-017l) — never drop the push.
3. Chunk to ≤100, cap concurrency at 6, pace to ≤600/s (FR-017h/m). Bursts wait in the queue; they are never dropped (EH-009).
4. Headers + `Authorization: Bearer ${EXPO_ACCESS_TOKEN}` from `ConfigService` (FR-017i, §9).
5. Persist every ticket id (FR-017j) and apply the ticket-error policy below.

**Error mapping (single source of truth for EH-003, EH-009..EH-013)**

| Expo error | Layer | Action | Token effect |
|---|---|---|---|
| `DeviceNotRegistered` | ticket + receipt | log `failed`, stop sending | `status: invalid`, `invalidatedAt = now` |
| `MessageTooBig` | receipt | **no retry**, alert (payload-builder bug) | none |
| `MessageRateExceeded` | receipt | per-token exponential backoff window | none |
| `MismatchSenderId`, `InvalidCredentials`, `InvalidProviderToken` | receipt | **page DevOps**; credential-class, mobile channel degraded | **none — must not invalidate** |
| `UNAUTHORIZED` | request | fail fast + alert; never retry unauthenticated | none |
| `TOO_MANY_REQUESTS` / HTTP 429 / 5xx / timeout | request | re-queue batch, exp. backoff + jitter, ≤3 attempts | none |
| `PUSH_TOO_MANY_NOTIFICATIONS` / `PUSH_TOO_MANY_RECEIPTS` | request | internal bug — chunking regressed; alert | none |

### 5.6 Receipt reconciliation cron (FR-017k, Q10)

- `@Cron` every 5 minutes in `ExpoReceiptReconciliationService`, following the SLA-cron precedent (§2.8). notification-service must add `ScheduleModule.forRoot()` to [`app.module.ts`](../backend/apps/notification-service/src/app/app.module.ts).
- Query: `receiptStatus: 'pending'` **AND** `createdAt <= now - 15 min` **AND** `createdAt > now - 24 h`; chunk ids to ≤1000; `getReceipts`; write `ok` / `error` + `errorCode`.
- Rows older than 24 h with no receipt ⇒ `receiptStatus: 'expired'`, `result: 'unresolved'` (EH-014) — excluded from both sides of the ≥95 % KPI.
- **Multi-replica hazard:** notification-service can run more than one instance, and every replica would fire the same cron. Take a Redis lock (`cache` lib, TTL ≈ run interval) before each pass. The existing SLA crons do **not** do this — do not copy that part.

### 5.7 Token lifecycle (FR-016, FR-017)

`register` upserts by `expoPushToken` (format-validated, FR-017g ⇒ `GrpcBadRequestException` with an internal code); `unregister` sets `revoked`; `DeviceNotRegistered` sets `invalid`; a weekly `@Cron` hard-deletes `invalid` older than 30 days.

### 5.8 Rollup / soft-cap exemption (contradiction B) — per-event semantics

Verified against code: rollup (`rollupPrevious`, `notification.service.ts:296`) already keys on `(userId, entityType, entityId, type)` — entity-scoped and correct. The soft-cap (`countUpdatesInLastHour`, `:113`) keys on `userId` only — entity/type-blind, and it is the actual FR-011/FR-014 violator.

Split by event semantics, **not** by category:

- **Discrete events** — `*_ASSIGNED`, `*_REOPENED`: skip **both** the rollup call (`:104-111`) and the soft-cap/digest branch (`:114-125`). Each assignment/reopen to a distinct entity is a distinct history item.
- **State-update / latest-wins events** — SLA reminders today, a future `*_NEW_MESSAGE`: keep rollup (already per-entity — same conversation replaces, different conversation stays separate) and keep the cap.

Implementation: gate on an event-semantic predicate, e.g. `if (!isDiscreteEvent(data.type))` around the rollup + soft-cap block, where `isDiscreteEvent` returns true for `*_ASSIGNED`/`*_REOPENED`. Group assignment (`processor:81`) is **unchanged** — bell-badge semantics stay as they are. Rationale and PM-gate in §16 R-1.

`// ponytail: predicate over the two discrete types; promote to a per-type behavior map only if a third semantic class appears.`

---

## 6. Source services

### 6.1 Envelope enrichment (FR-022 — extend, never replace)

Both helpers keep their signatures and gain the new fields:

- `emitAssignNotifications` (`conversation.service.ts:2546`): add `eventId: randomUUID()` **per recipient-set event** (one `eventId` per business event, *not* per recipient — dedupe is `(userId, eventId)`), `category: CONVERSATION_TICKET`, `teamId`, `teamInboxId?`, `assigneeUserIds`, `occurredAt`.
- `emitTicketAssignNotifications` (`ticket.service.ts:2071`) + `emitTicketReopenNotification` (`:2112`): same, and resolve user ids via `resolveParticipantUserIds` rather than `participant.userId` (§2.10-E).
- The two SLA/note emitters (`conversation-sla-reminder-cron.service.ts:281`, `note.service.ts:487`, `message.service.ts:1244`) stay on the legacy path — they still send `recipientUserId` and get default category from the type map (§3.6). **Out of scope for this feature.**

### 6.2 Intake events (FR-018..020)

`*_ENTERED_TEAM_INBOX` must fire **only** on the first transition into a team-inbox scope, and must survive consumer retries, socket reconnects, and read-model rehydrates (FR-020, EC-009). A time window is not sufficient — this needs a **persisted marker**:

- conversation-service: `teamInboxNotifiedAt?: Date` on the conversation schema; emit inside the same update that sets it, guarded by `findOneAndUpdate({ _id, teamInboxNotifiedAt: { $exists: false } }, { $set: { teamInboxNotifiedAt: now } })` — emit only when the update matched. Idempotent by construction.
- ticket-service: same field on the ticket schema.

Reassignment within the same team, or between teams after the first entry, does not re-fire (FR-020, EC-009).

### 6.3 Ticket `teamInboxId` (Q1 — Opsi A)

Derive from the originating conversation. Ticket already has a conversation linkage used by [`message-authorization.service.ts:124`](../backend/apps/ticket-service/src/app/services/message-authorization.service.ts); resolve `teamInboxId` from that conversation at emit time. A standalone ticket with no conversation ⇒ omit `teamInboxId`, skip the supervisor-intake branch, still notify assignees (EC-004).

---

## 7. api-gateway (HTTP + WS only — never a gRPC server)

### 7.1 New REST endpoints (PRD §14.2, §14.3)

New `apps/api-gateway/src/app/notification/notification-preference.controller.ts` and `mobile-device-token.controller.ts` — **sibling controllers**, so the existing `notification.controller.ts` and its specs stay untouched.

| Method | Path | Guards | Body | Notes |
|---|---|---|---|---|
| `GET` | `/notification-preferences/me` | `JwtAuthGuard` | — | returns defaults when no row (FR-008) |
| `PATCH` | `/notification-preferences/me` | `JwtAuthGuard` + role check | `{ webEnabled?, mobileEnabled? }` | `403` for Member/Agent (FR-009/010); partial update; `400` on non-boolean (EH-007) |
| `POST` | `/mobile-device-tokens/register` | `JwtAuthGuard` | `{ expoPushToken, platform, appVersion? }` | `400` on bad token format (FR-017g) |
| `POST` | `/mobile-device-tokens/unregister` | `JwtAuthGuard` | `{ expoPushToken }` | idempotent |

DTOs use `class-validator` on **every** property (`@IsBoolean`, `@IsOptional`, `@IsString`, `@Matches(EXPO_PUSH_TOKEN_REGEX)`, `@IsIn(['ios','android'])`) plus `@ApiProperty` for Swagger at `/docs`. `userId`/`companyId`/`organizationId` come **only** from the JWT context, never the body.

> The gateway exception filter does not forward `internalCode` — the HTTP body will show `message` + `statusCode` only. Do not design FE behavior around `internalCode`.

### 7.2 Socket audience rule (FR-023..025)

In [`notification-emit.controller.ts:47-51`](../backend/apps/api-gateway/src/websocket/controllers/notification-emit.controller.ts):

```
if (data.userId)                        → emitToUser        (unchanged)
else if (category === conversation_ticket) → log.error + DROP   (FR-024, new)
else                                    → emitNotification (company room, FR-025 unchanged)
```

Fix the stale "falls back to company room" doc-comment on `emitToUser` (§2.3) while touching the file.

---

## 8. Frontend (`frontend/apps/omnichannel`)

### 8.1 Notification preference toggles (US-004, US-005, FR-009)

- **Route:** new `app/[locale]/(main)/settings/notification/page.tsx` + `components/pages/settings/notification/ManageNotificationSettingsPage.tsx`. A sibling of `settings/inbox`, not a child — the preference is per-user, while `settings/inbox/*` is org configuration.
- **Data:** `services/notification/use-get-notification-preference.service.ts` (`useQueryWithSession`) and `use-action-update-notification-preference.service.ts` (`useMutation` + `invalidateQueries`), both through `useAxiosPrivateApi()`. Add `FETCH_PREFERENCE: 'FetchNotificationPreference'` to `NOTIFICATION_QUERY_KEY` (`constants/query-key.ts:309`).
- **Role gate:** render the surface (and its nav entry) only for Supervisor/Admin from `session.user` role/permission data — mirroring how other role-gated settings hide themselves. The `403` from §7.1 is the real enforcement; the FE gate is UX only.
- **UX:** optimistic toggle, revert to server state on error, `showToast` on both success and error with i18n keys (EH-007). Toggles are `@satuinbox/ui` switches; no new shadcn install.
- **i18n:** new keys under the existing `settings` (or `notification`) namespace for **both `en` and `id`**. ESLint fails the build on hardcoded user-facing strings.

### 8.2 Tap-through (FR-017b/c/e, US-009)

- Card + mark-read: **already implemented** (`NotificationItem.tsx:226-240`) — verify `ManageNotificationPage` passes `onNotificationClick`, no rewrite.
- Toast: in `use-notification-socket-event.ts:44-52`, make the toast clickable — route to `notification.actionLink` (fall back to `metadata.entityType`/`entityId`) and call the existing mark-read mutation on click. Keep the 3-per-30 s throttle (`:13-29`) untouched. If `@satuinbox/ui`'s `showToast` has no action/click affordance, add one to the toast atom in the package rather than bypassing it per-app.
- No `company_wide` tap-through work (FR-017f is P2, explicitly not in v0).

### 8.3 What the frontend does **not** get

No device-token registration, no push permission prompt, no service worker, no web-push. Mobile push is mobile-only (PRD §20 lists web push as future).

---

## 9. Security & multi-tenancy

- `EXPO_ACCESS_TOKEN` via `ConfigService` only; never logged, never in a commit, never in an error message. Enable push security in the EAS dashboard for production (FR-017i).
- Expo push tokens are credential-adjacent: log the **last 6 characters** only (`tokenRef`, §3.3). No full token in logs, traces, or the delivery log.
- Every new query is tenant-scoped (`companyId`, plus `organizationId` where present); preference and token reads are keyed by `userId` from the JWT. Cross-tenant notification leakage is a P0 (PRD §11).
- Push body carries entity display id + actor name only — never message content (FR-017n, PRD §11 Privacy).
- Preference write is role-gated server-side; token register/unregister requires an authenticated session. No endpoint ships without a guard.

---

## 10. Configuration

Add to `backend/.env.example` (and every deployment env):

| Var | Example | Notes |
|---|---|---|
| `EXPO_ACCESS_TOKEN` | `<secret>` | required when push security is on |
| `EXPO_PUSH_ENABLED` | `false` | service-level kill switch, independent of the per-company flag |
| `EXPO_PUSH_TTL_SECONDS` | `2592000` | message `ttl` |
| `EXPO_PUSH_ANDROID_CHANNEL_ID` | `satuinbox-operational` | **must match the channel the mobile app creates** (§13) |
| `EXPO_PUSH_MAX_BATCH` / `_CONCURRENCY` / `_RATE_PER_SECOND` | `100` / `6` / `600` | FR-017h/m, overridable for load tests |
| `EXPO_RECEIPT_CRON` | `*/5 * * * *` | reconciliation cadence |
| `NOTIFICATION_RECIPIENT_TARGETING_V2` / `NOTIFICATION_MOBILE_PUSH_V1` | per-company flags | PRD §15, Q5 |

Outbound egress to `exp.host:443` must be open from the notification-service network — confirm with DevOps before Phase 4 (PRD §22 Assumptions).

---

## 11. Test plan

**Backend — unit (Jest, `npx nx test <service>`)**

| Unit | Cases |
|---|---|
| `NotificationRecipientResolverService` | assignee-only; supervisor fan-out; assignee ∩ supervisor ⇒ 1 (EC-001); multi-team supervisor ⇒ 1 (EC-002); actor excluded (EC-003); RPC failure ⇒ assignees only (EH-001); no supervisor ⇒ empty (EC-008); `*_REOPENED` never resolves supervisors (FR-005) |
| `NotificationPreferenceService` | 4 on/off combinations (US-004/005, FR-012); Member forced-on (FR-010); missing row ⇒ defaults (FR-008); read throws ⇒ defaults (EH-002); `company_wide` ungated (Q8, EC-012) |
| `ExpoPushService` | token format validation (FR-017g); chunking at exactly 100/101 (FR-017h); 4096-byte truncation boundary (FR-017l); every row of the §5.5 error table; 429 backoff (EH-009); credential errors do **not** invalidate tokens (EH-012) |
| `ExpoReceiptReconciliationService` | <15 min not polled; ≥15 min polled; >24 h ⇒ `unresolved` (EH-014); ≤1000 id chunking |
| Processor | `E11000` ⇒ skipped/duplicate (FR-013, EH-006); `conversation_ticket` skips rollup + soft cap (§5.8); `company_wide` still rolls up |
| Intake guard | second call after `teamInboxNotifiedAt` is set emits nothing (FR-020, EC-009) |

**Backend — integration:** mock the Expo HTTP layer (`HttpService`/SDK stub) and assert request shape, batch sizes, and headers — never hit `exp.host` in tests. gRPC clients and repositories are mocked; no real infra.

**Frontend:** there is **no `test` script** in `frontend/`. Verification is `npm run check-types` + `npm run lint` plus a manual matrix: 4 toggle combinations, Member sees no toggle, toast click routes + marks read, card click still works, both locales render.

**Known baselines — report deltas, not absolutes:** the three backend projects touched here carry pre-existing scaffolded spec failures, api-gateway has pre-existing test debt and no supertest, `frontend` `npm run lint` is broken repo-wide under Next 16, and `backend` `npm run format:check` fails on ~1729 files due to CRLF. **Never run `npm run format` to "fix" that** — it would rewrite the whole repo.

---

## 12. Phases (backend + frontend only)

| Phase | Deliverable | Blocked by |
|---|---|---|
| **1 — Foundation** | `libs/common` enums + category map; envelope fields; 3 new collections + `notifications.category`/`eventId` + partial unique index; `expo-push.constant.ts`; people-service `GetSupervisorRecipientsByTeamScope` (+ `generate-proto-types`) | — |
| **2 — Recipient targeting (web only)** | resolver + preference gate + dedupe + delivery log (web rows); rollup/cap exemption (§5.8); intake events + persisted marker in both source services; gateway socket guard; flag `NOTIFICATION_RECIPIENT_TARGETING_V2` per company | 1; **PM sign-off on §2.10-B** |
| **3 — Preference API + UI** | notification.proto preference service; gateway `GET`/`PATCH`; FE settings surface + i18n (`en`/`id`) | 1, 2 |
| **4 — Expo push (backend)** | token service + gateway register/unregister; `ExpoPushService`; receipt cron + Redis lock; `ScheduleModule` in notification-service; token purge job; flag `NOTIFICATION_MOBILE_PUSH_V1` | 1; EAS credentials + `EXPO_ACCESS_TOKEN` + egress |
| **5 — Cleanup** | remove flag guards after the canary window; confirm TTLs purging; dashboards/alerts from §5.5 | 4 |

Phase 4 is **testable without the mobile app**: register a token generated by Expo's push tool (or any test build the mobile team provides) and assert tickets + receipts. Mobile app delivery is verified jointly once that team ships — it is not a gate on merging Phase 4.

---

## 13. Contract handed to the mobile team (their implementation, not ours)

Frozen by this TRD; changes require a new version of both docs.

1. **Token:** obtain via `expo-notifications` → `getExpoPushTokenAsync({ projectId })`. Format `ExponentPushToken[...]`. Raw FCM/APNs tokens are **rejected** (PRD Q11).
2. **Register:** `POST /mobile-device-tokens/register` `{ expoPushToken, platform: 'ios'|'android', appVersion? }` with the user's Bearer token, on login and on token change. `POST /mobile-device-tokens/unregister` `{ expoPushToken }` on logout.
3. **Android channel:** the app MUST create a notification channel whose id equals `EXPO_PUSH_ANDROID_CHANNEL_ID` (default `satuinbox-operational`, §10) — otherwise Android falls back to the default channel and importance is wrong.
4. **Payload:** `title`, `body` (entity display id + actor name; **never** message content), and `data = { notificationId, category, entityType, entityId, entityDisplayId }`.
5. **Deep link (FR-017d):** tap ⇒ route by `data.entityType` + `data.entityId`; then mark read (FR-017e) via the existing read endpoint using `data.notificationId`.
6. **No coalescing:** we never set `collapseId`/`tag` (FR-017o) — do not collapse client-side either.
7. **Credentials:** FCM v1 service account (with matching `google-services.json` sender id) and the APNs key live in **EAS**, owned by DevOps + mobile. Credential-class receipt errors (`MismatchSenderId`, `InvalidCredentials`, `InvalidProviderToken`) page DevOps and mean the mobile channel is down until fixed.

---

## 14. Risks & open items

| # | Item | Owner | Handling |
|---|---|---|---|
| **R-1** | §2.10-B rollup/soft-cap conflict (`UPDATES_SOFT_CAP_PER_HOUR = 2`) silently converts operational notifications into a digest | PM + Eng | **Blocks Phase 2.** Proposal: exempt `conversation_ticket`. Needs an explicit product decision. |
| **R-2** | Role lookup per recipient (`GetMemberByUserId`) could dominate latency on wide supervisor fan-out | Eng | Cache `roleType`; load-test worst-case fan-out in staging against the p95 ≤3 s target |
| **R-3** | `@MessagePattern` + catch-all means no redelivery (§2.10-C); a crash between record insert and dispatch leaves a notification with no real-time delivery | Eng | Accepted for v0 — record still appears in the list (FR-011). Alert on `result: failed` rate. |
| **R-4** | Receipt cron on multiple replicas double-polls | Eng | Redis lock (§5.6); do not copy the existing lock-free SLA crons |
| **R-5** | `expo-server-sdk` dependency approval | Eng lead | Fallback to `@nestjs/axios` behind the same wrapper (§5.5) |
| **R-6** | Egress to `exp.host` blocked in production | DevOps | Confirm before Phase 4; `EXPO_PUSH_ENABLED=false` keeps the service healthy meanwhile |
| **R-7** | Mobile app is built by another team on an unknown timeline | Both | Phases 1–4 ship and are verifiable without it (§12); the §13 contract is the only coupling |
| **R-8** | `mobiledevicetokens` unique index on `expoPushToken` conflicts if the same token is registered concurrently by two users | Eng | Upsert by token with `userId` overwrite (§3.2), not insert-then-check |

---

## 15. Acceptance traceability

| PRD | Where implemented |
|---|---|
| FR-001..002 | §5.2 (assignee union, no company fan-out for `conversation_ticket`) |
| FR-003..005 | §4.2, §5.2.3 |
| FR-006, FR-025 | §5.3 (ungated), §7.2 (company room preserved) |
| FR-007..008, FR-011 | §3.1, §5.3, §5.4 |
| FR-009..010 | §7.1 (403), §5.3 (forced-on), §8.1 (UI gate) |
| FR-012 | §5.4 |
| FR-013..014 | §3.4, §5.2.5, §5.8 |
| FR-015..017 | §5.5, §5.7 |
| FR-017a..f | §5.1, §8.2 |
| FR-017g..p | §3.2, §3.5, §5.5, §5.6, §10 |
| FR-018..020 | §3.6, §6.2 |
| FR-021..022 | §4.3, §6.1 |
| FR-023..024 | §7.2 |
| EH-001..014 | §5.2.3, §5.3, §5.5, §5.6, §7.1 |
| EC-001..012 | §4.2, §5.2, §5.5, §6.3, §3.2 |
| NFR performance / observability / security | §5.3 (cache), §3.3, §9 |

---

## 16. Risk & Open-Item Resolution Log

Resolution of §14 (R-1..R-8) and §2.10 (conflicts A..E). Each item is either **RESOLVED-ENGINEERING** (decision made here, design already lives in the cited section) or **BLOCKED-EXTERNAL** (needs a named non-engineering owner; recommended default stated, no external approval is claimed).

### R-1 / Conflict B — Soft-cap silently digests discrete operational notifications
**Status:** RESOLVED — PM approved (Dany Christian, 2026-08-11)
**Decision/Owner:** PM (Dany Christian) + Eng. **Approved:** discrete assignment/reopen notifications bypass the `UPDATES_SOFT_CAP_PER_HOUR = 2` digest (`processor:114-125`). Per-event-semantic split, not per-category.

**Verified against code:**
- **Rollup** (`rollupPrevious`, `notification.service.ts:296`) keys on `(userId, entityType, entityId, type)` — **already entity-scoped and correct**. Assign conv A then assign conv **B** = different `entityId` = two separate notifications. Assign/new-state on the **same** entity within 120 s replaces the old one ("latest wins"). Right for *state-update* semantics.
- **Soft-cap** (`countUpdatesInLastHour`, `:113`) keys on **`userId` only** — entity/type-blind. The 3rd `UPDATES` notification in an hour becomes a digest even for an assignment to a **different** conversation/ticket. This is the real FR-011/FR-014 violator.

**Decision (approved):**
1. **Discrete events** (`*_ASSIGNED`, `*_REOPENED`) → **exempt from soft-cap** (never digested) *and* exempt from rollup — each is a distinct history item (FR-011). Gate in §5.8.
2. **State-update / latest-wins events** (SLA reminders now; a future `*_NEW_MESSAGE`) → keep rollup (already per-entity) and keep the cap.

Note: `*_NEW_MESSAGE` is not an existing notification type (UPDATES group = assign/unassign/reopen/SLA only) — the state-update rule is forward-looking.
**Phase impact:** **Phase 2 unblocked.** Implement §5.8 `isDiscreteEvent` guard.

### R-2 — roleType cache staleness could mis-apply the forced-on gate
**Status:** RESOLVED-ENGINEERING
**Decision/Owner:** Eng. Cache key `role:type:{companyId}:{userId}` in the `cache` lib, short TTL (`CacheTTLEnum`, ≈5 min).
**Mechanism / what unblocks:** Honest read: this is a **correctness risk, not just latency**. The dangerous direction is a Supervisor→Member demotion — while the stale entry lives, the recipient's stored preference is honored and a Member who must be forced-on (FR-010) could have suppressed a delivery. Promotion the other way is harmless (Member forced-on is the safe default). Mitigation: bound the exposure with the 5-min TTL (role changes are rare); if a member role-change event/RPC exists, invalidate the key on it — otherwise the TTL is the accepted ceiling. Load-test worst-case supervisor fan-out against p95 ≤3 s.
**Phase impact:** No blocker. Applies from Phase 2 (gate). `// ponytail: TTL-bounded staleness; add event-driven invalidation if a role-change signal appears.`

### R-3 / Conflict C — `@MessagePattern` catch-all = no redelivery
**Status:** RESOLVED-ENGINEERING (accepted residual risk)
**Decision/Owner:** Eng. Keep `@MessagePattern`; changing the transport is out of scope.
**Mechanism / what unblocks:** Make each recipient's dispatch independently idempotent (dedupe insert first, per-channel delivery-log row) and log-visible; a crash between record-insert and dispatch still leaves the notification in the list (FR-011). Backstop = alert on `result: failed` rate (§5.5). Accepted for v0.
**Phase impact:** No blocker. Design already in §5.4/§5.8.

### R-4 — Receipt cron double-polls across replicas
**Status:** RESOLVED-ENGINEERING
**Decision/Owner:** Eng. Single global Redis lock `lock:notif:receipt-cron` taken before each pass (§5.6).
**Mechanism / what unblocks:** Lock TTL **< run interval** (≈4 min for a 5-min `@Cron`) so a replica that dies holding the lock auto-releases before the next tick — no permanent stall. If a run ever exceeds the TTL and a second replica starts, the reconciliation is **idempotent** (re-reading receipts and rewriting the same `ok`/`error` is a no-op), so the lock is an optimization, not a correctness dependency. Do **not** copy the lock-free SLA crons.
**Phase impact:** No blocker (Phase 4).

### R-5 — `expo-server-sdk` dependency approval
**Status:** BLOCKED-EXTERNAL
**Decision/Owner:** Eng lead (Naftal Yunior). Decision: approve adding `expo-server-sdk`?
**Mechanism / what unblocks:** Recommended default = **approve** (it supplies chunking/gzip/token-validation/receipt-chunking, i.e. FR-017h/k plumbing). Fallback is `@nestjs/axios` behind the same `ExpoPushService` wrapper interface, so the design does not change either way. Unblocked by an approve/deny on the dependency.
**Phase impact:** Needed before Phase 4 ships; does not block Phases 1–3.

### R-6 — Egress to `exp.host:443` blocked in production
**Status:** BLOCKED-EXTERNAL
**Decision/Owner:** DevOps. Confirm outbound egress from the notification-service network to `exp.host:443`.
**Mechanism / what unblocks:** `EXPO_PUSH_ENABLED=false` keeps the service healthy meanwhile (§10). Unblocked by a DevOps firewall/egress confirmation before Phase 4 push verification.
**Phase impact:** Blocks Phase 4 delivery verification only.

### R-7 — Mobile app owned by another team, unknown timeline
**Status:** BLOCKED-EXTERNAL
**Decision/Owner:** Mobile team + Eng (joint). Their build consumes the §13 frozen contract.
**Mechanism / what unblocks:** Not a merge blocker — Phases 1–4 ship and are testable without the app (register an Expo-tool-generated token, assert tickets+receipts, §12). The §13 contract (token API, payload/`data` shape, Android channel id, deep-link keys) is the only coupling. End-to-end tap-through is verified jointly whenever the app ships.
**Phase impact:** No blocker on Phases 1–4.

### R-8 — `mobiledevicetokens` unique-index race on concurrent registration
**Status:** RESOLVED-ENGINEERING
**Decision/Owner:** Eng. Upsert keyed on the unique field `expoPushToken`, overwrite `userId`, and **catch `E11000` + retry once** as an update.
**Mechanism / what unblocks:** `findOneAndUpdate({ expoPushToken }, {...}, { upsert:true })` is *not* fully race-safe on its own — two concurrent upserts inserting the same token can both miss the existing doc and one throws `E11000`. Because the filter is the unique key, a single retry converges to an update. Register must also **reset `status:'active'` and `invalidatedAt:null`** on upsert, which is what fully covers EC-011 (logout/login on the same device reactivates a previously `revoked`/`invalid` token). Add this retry+reset to §3.2/§5.7.
**Phase impact:** No blocker (Phase 4); spec detail added.

### Conflict A — Two dedupe mechanisms coexist
**Status:** RESOLVED-ENGINEERING
**Decision/Owner:** Eng. Partial unique index on `(eventId, userId)`; leave legacy `dedupKey` untouched (§3.4).
**Mechanism / what unblocks:** `partialFilterExpression: { eventId: { $exists: true } }` scopes uniqueness to enriched envelopes only, so legacy `eventId: undefined` docs never collide. Both run; `eventId` wins for enriched producers. Uniqueness lives in the DB; `E11000` → `skipped/duplicate` (EH-006).
**Phase impact:** No blocker. Phase 1 foundation.

### Conflict D — `notifications` schema lacks `versionKey: false`
**Status:** RESOLVED-ENGINEERING
**Decision/Owner:** Eng. Do **not** touch the existing schema decorator.
**Mechanism / what unblocks:** Cosmetic house-rule drift; changing it rewrites documents for no functional gain. All **new** collections follow `{ timestamps: true, versionKey: false }` (§3). No change required.
**Phase impact:** No blocker.

### Conflict E — Ticket participants store `member.id` in `participant.userId`
**Status:** RESOLVED-ENGINEERING
**Decision/Owner:** Eng. All new envelope ids MUST be **user ids**; resolve via `resolveParticipantUserIds` (`ticket.service.ts:2148+`), never read `participant.userId` directly.
**Mechanism / what unblocks:** Wiring the id-space fix into `emitTicketAssignNotifications` / `emitTicketReopenNotification` enrichment (§6.1) prevents supervisor/assignee resolution from silently targeting the wrong id space. This is a correctness precondition for Phase 2 targeting but is fully resolved in design.
**Phase impact:** Must land with Phase 2 (resolved-eng, no external decision).

### Summary

| Item | Status | Owner | Blocks phase |
|---|---|---|---|
| R-1 / B | RESOLVED — PM approved (Dany Christian) | PM + Eng | — (Phase 2 unblocked) |
| R-2 | RESOLVED-ENGINEERING | Eng | — |
| R-3 / C | RESOLVED-ENGINEERING (accepted) | Eng | — |
| R-4 | RESOLVED-ENGINEERING | Eng | — (Phase 4) |
| R-5 | BLOCKED-EXTERNAL | Eng lead (Naftal Yunior) | Phase 4 ship |
| R-6 | BLOCKED-EXTERNAL | DevOps | Phase 4 verification |
| R-7 | BLOCKED-EXTERNAL | Mobile team + Eng | — (not a merge blocker) |
| R-8 | RESOLVED-ENGINEERING | Eng | — (Phase 4) |
| A | RESOLVED-ENGINEERING | Eng | — (Phase 1) |
| D | RESOLVED-ENGINEERING | Eng | — |
| E | RESOLVED-ENGINEERING | Eng | Phase 2 (resolved-eng) |

**Net:** 9 of 13 resolved (R-1/B now PM-approved). 4 remain BLOCKED-EXTERNAL — all Phase-4 only (R-5 dependency approval, R-6 egress, R-7 mobile team). With R-1 approved, **Phase 2 has no open blockers**; R-5/R-6/R-7 stay Phase-4 concerns with `EXPO_PUSH_ENABLED=false` and the §12 test path keeping earlier phases unblocked.
