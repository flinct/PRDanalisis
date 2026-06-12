# SatuInbox v2 — Backend Technical Reference (CLAUDE.md)

> **Repo path:** `C:\Users\MyBook SAGA 12\Desktop\BE satuinbox\omnichannel-satuinbox-be`
> **Package name:** `@omnichannel-satuinbox-be/source`
> **Product:** Omnichannel CRM — unified inbox for WhatsApp, Instagram, Messenger, Email, Live Chat.
> **Architecture:** NestJS microservices (Nx monorepo). Each service owns its own MongoDB database. Services communicate via **gRPC** (sync) and **RabbitMQ** (async).
> **Source-of-truth release:** **v2.7.0** (branch `v2.7.0`). Verified against repo working tree on **2026-06-12**. See §14 for the v2.7.0 changelog.

---

## 1. Tech Stack

| Layer           | Technology                                                 | Version                                              |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| Language        | TypeScript                                                 | `~5.9.2`                                             |
| Runtime         | Node.js                                                    | 22+                                                  |
| Framework       | NestJS                                                     | `^11.0.0`                                            |
| Monorepo        | Nx                                                         | `21.5.2`                                             |
| Sync transport  | gRPC                                                       | `@grpc/grpc-js ^1.13.4`, `@grpc/proto-loader`        |
| Async transport | RabbitMQ                                                   | `amqplib ^0.10.9`, `amqp-connection-manager ^4.1.14` |
| Proto codegen   | ts-proto                                                   | `^2.7.7` (`nestJs=true`)                             |
| Database        | MongoDB via Mongoose                                       | `^8.18.1` — one DB per service                       |
| Cache / session | Redis                                                      | `ioredis ^5.7.0`                                     |
| Realtime        | Socket.IO                                                  | `^4.8.1`                                             |
| Auth            | JWT + API keys                                             | `@nestjs/jwt ^11.0.0`, `passport-jwt ^4.0.1`         |
| RBAC            | CASL                                                       | `@casl/ability ^6.7.3`                               |
| Hashing         | argon2 / bcrypt                                            | `^0.44.0` / `^6.0.0`                                 |
| Validation      | class-validator, Joi                                       | `^0.14.2`                                            |
| Object storage  | AWS S3 + CloudFront                                        | `@aws-sdk/client-s3 ^3.913.0`                        |
| Channel SDKs    | Baileys (WA), Meta Graph (IG/Messenger), IMAP/SMTP (Email) | Baileys `7.0.0-rc13` (pinned, updated in v2.7.0)     |
| Security        | mTLS, mongoose-encryption, crypto                          | `libs/security`                                      |
| API docs        | Swagger                                                    | `@nestjs/swagger ^11.2.0` at `/docs`                 |
| Scheduling      | `@nestjs/schedule ^6.0.1` + RabbitMQ delayed queues        |                                                      |
| gRPC errors     | nestjs-grpc-exceptions                                     | `^0.2.2`                                             |
| Testing         | Jest                                                       | `^30.0.2` + `mongodb-memory-server`                  |
| CI/CD           | GitLab CI, Docker, Kubernetes                              | `devops/`                                            |

---

## 2. Architecture Rules

- **API Gateway is the only public surface.** HTTP/REST + Swagger at port `3000`, WebSocket at port `3002`. Backend services do NOT expose HTTP.
- **Database-per-service.** No service reads another service's MongoDB. Cross-service data is fetched via gRPC or carried as denormalized snapshots via events.
- **gRPC for sync.** Use when caller needs an immediate response (reads, validations, command results).
- **RabbitMQ for async.** Use for fire-and-forget, fan-out, retryable, delayed, or bulk work.
- **mTLS required** for all inter-service transport (gRPC and RabbitMQ). Use helpers from `libs/common`.
- **Shared code in `libs/`.** Never duplicate across services.
- **Proto-first contracts.** Define in `proto/*.proto`, regenerate `libs/proto-types`, register in `PROTO` + `GRPC_ENV` constants.
- **Centralized event strings.** Use `EventTypeEnum` / `MessageQueuePatterns` from `libs/common`. Never hardcode.
- **Tenant scope mandatory.** Propagate `companyId` + `organizationId` from auth into every gRPC payload and document query.
- **Denormalized snapshots on hot paths.** Embed read-optimized snapshot with `lastSyncedAt`, refresh via events.

---

## 3. Service Topology

```
                         ┌─────────────────────────────┐
   FE / Partners ───────▶│        API Gateway          │  HTTP/REST + Swagger + WebSocket
   (JWT / x-api-key)     │  (apps/api-gateway, :3000)  │  Validation, AuthN/AuthZ, routing
                         └──────────────┬──────────────┘
                                        │
                 ┌──────────────────────┼───────────────────────┐
                 │ gRPC (sync, mTLS)     │  RabbitMQ (async events)│
                 ▼                       ▼                         ▼
        ┌────────────────┐      ┌────────────────┐       ┌────────────────┐
        │  auth-service  │      │ ticket-service │  ...  │ analytics-svc  │
        │   (own DB)     │      │   (own DB)     │       │   (own DB)     │
        └────────────────┘      └────────────────┘       └────────────────┘
                 │   ▲                  │  ▲                       ▲
                 └───┴──────────────────┴──┴───────────────────────┘
            gRPC for sync reads/writes   ·   RabbitMQ exchange `satuinbox-exchange`
                                              for domain events & jobs

   Infra:  MongoDB (DB per service)  ·  Redis (cache/sessions)  ·  AWS S3 (media)
```

### Service Map

| Service (app)          | GRPC_ENV key   | gRPC port (dev)     | MongoDB DB               | Notes                                                  |
| ---------------------- | -------------- | ------------------- | ------------------------ | ------------------------------------------------------ |
| `api-gateway`          | —              | `:3000` HTTP        | —                        | REST + Swagger + WebSocket                             |
| `auth-service`         | `AUTH`         | `:50051`            | `satuinbox_auth`         | Login, JWT, API keys, sessions                         |
| `company-service`      | `COMPANY`      | `:50052`            | `satuinbox_company`      | Companies, orgs, teams, shifts, tags, subscriptions    |
| `analytics-service`    | `ANALYTICS`    | `:50053` / `:50069` | `satuinbox_analytics`    | Metrics, pre-aggregation, reports, exports             |
| `people-service`       | `PEOPLE`       | `:50054`            | `satuinbox_people`       | Users, members, roles/RBAC, profiles                   |
| `conversation-service` | `CONVERSATION` | `:50055`            | `satuinbox_conversation` | Conversations, messages, notes, templates, SLA/FRT/TTC |
| `payment-service`      | `PAYMENT`      | `:50057`            | `satuinbox_payment`      | Payments, wallets, billing, webhooks                   |
| `channel-service`      | `CHANNEL`      | `:50058`            | `satuinbox_channel`      | Channel/account-channel integrations, client contacts  |
| `whatsapp`             | _(direct env)_ | `:50059`            | `satuinbox_whatsapp`     | WhatsApp Web / Baileys sessions                        |
| `notification-service` | `NOTIFICATION` | `:50060`            | `satuinbox_notification` | In-app + push notification fan-out                     |
| `media-service`        | `MEDIA`        | `:50062`            | `satuinbox_media` + S3   | Upload/download, presigned URLs, sharp processing      |
| `widget`               | `WIDGET`       | `:50063`            | `satuinbox_widget`       | Live chat widget WebSocket sessions                    |
| `ticket-service`       | `TICKET`       | `:50064`            | `satuinbox_ticket`       | Tickets, types, stages, SLA, CSAT, bulk reply, exports |
| `broadcast-service`    | `BROADCAST`    | `:50065`            | `satuinbox_broadcast`    | Broadcast campaigns, drafts, templates                 |
| `email`                | `EMAIL`        | `:50066`            | `satuinbox_email`        | IMAP/SMTP, transcript emails                           |
| `instagram`            | `INSTAGRAM`    | `:50067`            | `satuinbox_instagram`    | Instagram DM + Meta Graph webhooks                     |
| `whatsapp-api`         | `WHATSAPP_API` | `:50068`            | `satuinbox_whatsapp_api` | Official WhatsApp Business Cloud API + webhooks        |
| `messenger`            | `MESSENGER`    | `:50070`            | `satuinbox_messenger`    | Facebook Messenger + Meta Graph webhooks               |
| `sales-service`        | `SALES`        | `:50071`            | `satuinbox_sales`        | Leads, visits, comments, sales pipeline                |
| `audit-service`        | —              | env-defined         | `satuinbox_audit`        | Audit logging / compliance trail                       |

> ⚠️ `whatsapp` service is NOT registered in the shared `PROTO` / `GRPC_ENV` constants; its URL is read via `GRPC_WHATSAPP_URL` directly.
> ⚠️ `MONGODB_RBAC_URI` exists in env (`satuinbox_rbac`) but there is no standalone `rbac-service` app — RBAC is handled inside `people-service`.

### Infrastructure Defaults

| Infra          | Default                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------- |
| MongoDB        | `localhost:27018` (auth source: admin)                                                   |
| Redis          | `localhost:6379`, prefix `cache:`, code default TTL `7200s`, env `REDIS_TTL=3600`        |
| RabbitMQ       | `localhost:5672`, exchange `satuinbox-exchange`, queue prefix `satuinbox`, prefetch `10` |
| API Gateway    | port `3000`                                                                              |
| WebSocket      | port `3002`                                                                              |
| JWT access     | `15m`                                                                                    |
| JWT refresh    | `24h`                                                                                    |
| API key header | `x-signature-key`                                                                        |

---

## 4. Directory Layout

```
apps/
  <service>/          # NestJS microservice (+ <service>-e2e)
  api-gateway/        # Public HTTP + WS entry point
libs/
  common/             # Config, constants, enums, DTOs, helpers, base repos, gRPC/RMQ bootstrap
  proto-types/        # ts-proto generated types from proto/
  cache/              # Redis module, @GrpcCacheable decorator
  security/           # Crypto, hashing, token services, encryption
proto/                # *.proto source files (analytics, auth, broadcast, channel, company,
                      #   conversation, email, instagram, media, messenger, notification,
                      #   payment, people, sales, ticket, whatsapp-api, whatsapp, widget,
                      #   common, html-input-type, money, audit)
docs/                 # Architecture and implementation guides
devops/               # Kubernetes, Docker configs
```

### Service Internal Layout (`apps/<service>/src/app/`)

| Folder                                           | Purpose                                                                         |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `controllers/`                                   | gRPC handlers (`@XServiceControllerMethods`) + RMQ handlers (`@MessagePattern`) |
| `services/`                                      | Business logic                                                                  |
| `repositories/`                                  | Mongoose data access (extend shared base repo from `libs/common`)               |
| `schemas/`                                       | Mongoose schemas                                                                |
| `providers/`                                     | Custom providers                                                                |
| `processors/` / `workers/`                       | Async/CPU-heavy jobs, `worker_threads` exports                                  |
| `adapters/` / `factories/`                       | External integrations                                                           |
| `seeders/`, `constants/`, `interfaces/`, `libs/` | Supporting code                                                                 |

---

## 5. Key Constants (from `libs/common`)

### `PROTO` (proto filenames)

`ANALYTICS`, `AUTH`, `BROADCAST`, `CHANNEL`, `COMPANY`, `CONVERSATION`, `EMAIL`, `INSTAGRAM`, `MEDIA`, `MESSENGER`, `NOTIFICATION`, `PAYMENT`, `PEOPLE`, `SALES`, `TICKET`, `WHATSAPP_API`, `WIDGET`

### `GRPC_ENV` (env var keys for gRPC URLs)

Same keys as `PROTO` above.

### `MONGODB_URI_KEY` (env var keys for MongoDB URIs)

`ANALYTICS_SERVICE`, `AUDIT_SERVICE`, `AUTH_SERVICE`, `BROADCAST_SERVICE`, `CHANNEL_SERVICE`, `COMPANY_SERVICE`, `CONVERSATION_SERVICE`, `INSTAGRAM`, `MEDIA_SERVICE`, `MESSENGER`, `PAYMENT_SERVICE`, `PEOPLE_SERVICE`, `RBAC_SERVICE`, `SALES_SERVICE`, `TICKET_SERVICE`, `WHATSAPP_API`, `WHATSAPP_WEB`, `WIDGET`

### Other constants

- `DEFAULT_API_GATEWAY_PORT = 3000`
- `DEFAULT_JWT_ACCESS_EXPIRATION = '15m'`
- `DEFAULT_REDIS_TTL = 7200`
- `MONGO_DESCENDING_VALUE = -1`, `MONGO_ASCENDING_VALUE = 1`
- `TICKET_BULK_LIMIT = 100`
- `MAX_FILE_SIZE_MB = 20`, `MAX_GRPC_MESSAGE_SIZE_MB = 30`
- `ASYNC_SERVICE_PREFIX = 'async-service-'`
- `DEFAULT_RMQ_HEARTBEAT = 120`, `DEFAULT_RMQ_RECONNECT_TIME = 10`
- `DEFAULT_RATE_LIMIT_MAX = 100`, `DEFAULT_RATE_LIMIT_TTL = 60000`

---

## 6. Service Bootstrap Pattern

Canonical example: `apps/ticket-service/src/main.ts`

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = await getAppConfig(logger, app, GRPC_ENV.TICKET);
  const certs = loadTLSCertificates(config.mTLSConfig);
  const credentials = createGrpcCredentials(certs);

  await Promise.all([
    createGrpcMicroservice(config.grpcUrl, credentials, app, PACKAGE_NAME, protoPath, config.appConfig),
    createRabbitMQMicroservice(config.rabbitMQConfig, certs, app, PACKAGE_NAME),
    // additional queues (bulk reply, delayed DLX, export FIFO):
    createRabbitMQMicroservice(config.rabbitMQConfig, certs, app, BULK_REPLY_QUEUE_CONFIG.EXCHANGE),
    createRabbitMQDelayedQueueMicroservice(...),
    // export job: noAck: false, prefetchCount: 1 for strict FIFO
  ]);
  await app.startAllMicroservices();
  await app.init();
}
```

When adding a new service: copy bootstrap, add `PROTO` + `GRPC_ENV` entry, add `MONGODB_<SERVICE>_URI` + `GRPC_<SERVICE>_URL` env vars.

---

## 7. Schema & Data Modeling Rules

- Use `@Schema`, `@Prop`, `SchemaFactory.createForClass` (Mongoose + NestJS decorators).
- Extend `BaseAuditSchema` — adds `createdBy`, `updatedBy`, timestamps.
- Tenant documents implement `IBaseDocument & ITenantEntity` — adds `companyId`, `organizationId`.
- Top-level: `@Schema({ collection: 'tickets', timestamps: true })`.
- Embedded sub-docs: `@Schema({ _id: false })`.
- Use shared enums from `libs/common` (e.g. `TicketStatusEnum`, `SLAStateEnum`). Never inline string literals.
- ObjectId refs: `SchemaTypes.ObjectId` / `Types.ObjectId`; use `ref` only within the same service DB.
- Define explicit tenant-scoped compound indexes near schema:
  ```ts
  TicketSchema.index(
    { companyId: 1, organizationId: 1, ticketNumber: 1 },
    { unique: true },
  );
  ```
- Denormalized snapshots: embed with `lastSyncedAt`, refresh via events (e.g. `channelInfo`, `participants`, `contactInfo`).
- Sparse index for optional timer fields (e.g. `snooze.snoozedUntil`).

---

## 8. gRPC Rules

1. Define RPCs + messages in `proto/<service>.proto` (`syntax = "proto3"`, import from `common.proto`).
2. Run `npm run generate-proto-types` → ts-proto emits typed clients + `@XServiceControllerMethods()` into `libs/proto-types`.
3. Register proto filename in `PROTO` and URL env key in `GRPC_ENV`.
4. Service-side: implement generated interface + decorate with `@XServiceControllerMethods()`. Apply `@UseFilters(new GrpcExceptionFilter())`.
5. Client-side (Gateway/other service): inject via `ClientsModule.registerAsync`, resolve in `onModuleInit`, `firstValueFrom(observable)`.
6. Cache idempotent reads with `@GrpcCacheable` (`libs/cache`).

### Key proto services (actual)

| Proto                | Services                                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conversation.proto` | `ConversationService`, `MessageService`, `MessageUtilityService`, `ScreenshotService`, `SLASettingService`, `ConversationSLAMetricsService`, `TemplateMessageService`, `NoteService`, `CsatService` |
| `ticket.proto`       | `TicketService`, `TicketTypeService`, `MessageService`, `BulkReplyService`, `TrackingService`, `TicketViewSettingsService`, `CsatService`                                                           |
| `whatsapp.proto`     | `Whatsapp` — `InitInstance`, `GetInstance`, `GetQRCode`, `StopInstance`, `LogoutInstance`                                                                                                           |

---

## 9. RabbitMQ Rules

- Producers: inject `ClientProxy`, call `.emit(pattern, payload)`.
- Consumers: `@MessagePattern(...)` for req/reply, `@EventPattern(...)` for fan-out.
- Manual ack: `noAck: false`, `prefetchCount: 1` for strict FIFO (e.g. export jobs).
- Delayed work: `createRabbitMQDelayedQueueMicroservice` + `ExtendedClientRMQ.emitWithDelay(pattern, data, delayMs)`.

### Known patterns / domains

| Pattern                         | Purpose                         |
| ------------------------------- | ------------------------------- |
| `message.inbound.*`             | Inbound message processing      |
| `message.outbound.*`            | Outbound message sending        |
| `ticket.sla.breach.check`       | Delayed SLA breach check        |
| `ticket.sla.reminder.check`     | Delayed SLA reminder check      |
| `ticket.auto.unsnooze`          | Auto-unsnooze tickets           |
| `bulk-reply.job.*`              | Bulk reply processing           |
| `livechat.transcript.send`      | Transcript email sending        |
| `analytics.aggregate.*`         | Analytics pre-aggregation       |
| `analytics.get.*.sla.breakdown` | Real-time SLA breakdown queries |

---

## 10. Security & Auth

- Gateway auth: `Authorization: Bearer {token}` (JWT) or `x-signature-key` (API key).
- Guards: `JwtAuthGuard` + `RolesGuard` (CASL `{ resource, action[] }` shape).
- All queries must be tenant-scoped (`companyId` + `organizationId`).
- Inter-service: mTLS with `rejectUnauthorized: true`.
- Sensitive fields: `mongoose-encryption` / `libs/security` crypto services.

---

## 11. New Work Checklist

- [ ] New cross-service contract → edit `proto/`, regenerate types, register `PROTO` + `GRPC_ENV`
- [ ] Immediate answer needed → **gRPC**; fire-and-forget / fan-out / delayed / bulk → **RabbitMQ**
- [ ] New event or pattern → add to `EventTypeEnum` / `MessageQueuePatterns`; never hardcode string
- [ ] Hot-path cross-service data → snapshot via events, not sync gRPC
- [ ] New schema → extend `BaseAuditSchema`, tenant-scope, compound index, shared enums, `lastSyncedAt` on snapshots
- [ ] Shared logic → `libs/`, not inside service
- [ ] All inter-service transport → use mTLS helpers from `libs/common`

---

## 12. Domain Implementation Notes

### Conversation Service

- **FRT:** `frtCountingStartAt → firstAgentReplyAt`
- **TTC:** `firstCustomerMessageAt → conversationClosedAt`
- **RLT:** `firstAgentAssignmentAt → firstAgentReplyAt`
- **Wait time:** `firstCustomerMessageAt → firstAgentAssignmentAt`
- Pause reasons: `agent_away`, `pending_customer_initiation`, `waiting_on_customer`
- SLA states: `RUNNING`, `PAUSED`, `STOPPED`, `MISSED`
- Settings: per-channel with tenant default fallback, office-hours support
- **Assignment source tracking (v2.7.0, feat #2112):** conversation schema carries `assignSource?: AssignmentSourceEnum` — `manual` (supervisor/operator assigns via UI), `self_pull` (agent claims themselves), `system` (auto round-robin / auto-pull), `bulk` (bulk assignment op). Surfaced to FE and to in-app notifications.

### Ticket Service

- Per-stage SLA state machine: each stage has `slaValue`, `slaUnit`, `pauseOnWaitingCustomer`, `reminderMs`
- `cycleId` resets on reopen; pause intervals tracked in `StageSlaRuntime`
- Stage SLA cumulative per stage, excluding paused intervals
- Delayed breach/reminder via RabbitMQ delayed queues

### WhatsApp Web Service

- Baileys `7.0.0-rc13` (v2.7.0): QR login, encrypted credential persistence, auto-restore, human-like send (typing indicators, random delays)
- Key files: `baileys.service.ts`, `baileys.factory.ts`, `session.service.ts`, `whatsapp-connection.service.ts`, `whatsapp-message.service.ts`
- **Account Channel Event Log (v2.7.0, feat #2004):** immutable lifecycle event log for WA Web accounts → `AccountChannelEventLog` schema (`account-channel-event-log.schema.ts`). Fields: `accountChannelId`, `eventType` (enum), `idempotencyKey` (unique), `occurredAt`, `connectionSessionId`, `durationMs`, `phoneNumber`, `reason`, `actor`, `metadata`, `sourceService`. TTL retention (`ACCOUNT_CHANNEL_EVENT_LOG_RETENTION_SECONDS`); index `{accountChannelId:1, occurredAt:-1}`. Intended for Redash analytics on connect/disconnect/pairing lifecycle.
- **Startup status reconcile (v2.7.0, fix #2052):** on service startup, reconciles stale WhatsApp Web account-channel status so DB no longer reports paired/connected accounts that are actually dead.

### Features NOT implemented in BE

- Collaborator role (no `collaboratorIds` in schema)
- Snooze Conversation (snooze exists on ticket only)
- Related/Relational Conversations (`relatedConversationIds`)
- Related Tickets & Merge (`relatedTicketIds`, merge logic)
- WA Group Mention validation
- Auto-reply engine / scheduler
- Import Modes (WhatsApp service)
- Anti-spam system (warming, humanization, rotation)
- Room Reminder engine for conversations
- Hold state in conversation

---

## 13. Reference Docs (`docs/`)

- `GRPC_CACHING_GUIDE.md`
- `EVENT_DRIVEN_COUNTER_GUIDE.md`
- `CONVERSATION_SLA_FRT_TTC.md`
- `PER_CHANNEL_SLA_IMPLEMENTATION_PLAN.md`
- `ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`
- `contact-area-context-rbac-spec.md` / `contact-area-context-rbac-implementation-plan.md`
- `development.md`, `deployment.md`

---

## 14. v2.7.0 Changelog (BE — branch `v2.7.0`, verified 2026-06-12)

New since v2.5.0/v2.6.0 baseline. All confirmed against repo working tree.

| Area | Change | Ref |
| ---- | ------ | --- |
| conversation-service | **Assignment source** — `assignSource` field + `AssignmentSourceEnum` (`manual` / `self_pull` / `system` / `bulk`); propagated to in-app notifications | feat #2112 |
| whatsapp (WA Web) | **Baileys → `7.0.0-rc13`** (pinned) | feat #1820 |
| whatsapp (WA Web) | **Account Channel Event Log** — immutable lifecycle event log schema with idempotency + TTL retention, for Redash analytics | feat #2004 |
| whatsapp (WA Web) | **Startup reconcile** of stale account-channel connection status | fix #2052 |
| people-service | **Member active/deactivate** — `auths.isActive` toggle + `AuthActiveFilterEnum` (`ACTIVE` / `INACTIVE` / `ALL`) member-listing filter | feat #1934 |
| ticket-service / conversation-service | **Sync & add ticket message** from conversation linked-chat bubble (linked bubble append/sync) | feat #1613 |
| media-service / api-gateway | **HEIC/HEIF** file support | fix #1959 |
| company-service | **Shift cache invalidation on update** — fixes stale office-hours after shift edit | fix #1975 |

### Still NOT implemented in shipped v2.7.0

The undeveloped-feature set from §12 is unchanged. Note: **WA Group Mention** has an active feature branch `feat/266-group-mention-v2.7.0` (present in both BE and FE remotes) but it is **not merged** into `v2.7.0` — so it remains out of the shipped release. Collaborator role, Snooze Conversation, Related/Relational Conversations, Related Tickets & Merge, Auto-reply, WA Import Modes, Anti-spam system, Room Reminder, and conversation Hold state all remain 0%.
