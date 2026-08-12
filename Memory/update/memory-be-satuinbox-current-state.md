> ⚠️ **SUPERSEDED / ARSIP — JANGAN DIPAKAI SEBAGAI SOURCE OF TRUTH.**
> Konten file ini sudah dipromosikan ke canonical `Memory/CLAUDE-be.md` pada 2026-08-11.
> Semua pointer repo (Assessments, PRD, Rules, WORKFLOW_CONTEXT) menunjuk ke `Memory/CLAUDE-be.md`, bukan file ini.
> Disimpan hanya sebagai snapshot arsip verifikasi v2.8.0 / prod-2.7.0.3.

# SatuInbox — Backend Technical Reference (for Product Lead)

> **Purpose:** a self-contained picture of the backend for someone who does **not** have repo access.
> **Repo:** `gitlab.com:lolipad.id/omnichannel-satuinbox-be` · package `@omnichannel-satuinbox-be/source`
> **Product:** Omnichannel CRM — one unified inbox across WhatsApp Web, WhatsApp Business API, Instagram DM, Facebook Messenger, Email, and an embeddable Live Chat widget.
> **Architecture:** NestJS microservices in an Nx monorepo. Every service owns its own MongoDB database. Services talk over **gRPC** (synchronous) and **RabbitMQ** (asynchronous).
>
> **State captured:** working branch **`v2.8.0`** (unreleased). Latest **production tag is `prod-2.7.0.3`**.
> Verified directly against the working tree on **2026-08-11**. Everything below is read from source — not from READMEs.
>
> ⚠️ **Read this first:** `v2.8.0` is *in development*. The features in §14 exist in code but are **not yet in production**. Production today = `prod-2.7.0.3`.

---

## 1. Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Language | TypeScript | `~5.9.2` |
| Runtime | Node.js | 22+ |
| Framework | NestJS | `^11.0.0` |
| Monorepo | Nx | `21.5.2` |
| Sync transport | gRPC | `@grpc/grpc-js ^1.13.4`, `@grpc/proto-loader ^0.8.0` |
| Async transport | RabbitMQ | `amqplib ^0.10.9`, `amqp-connection-manager ^4.1.14` |
| Proto codegen | ts-proto (`nestJs=true`) | generated into `libs/proto-types` |
| Database | MongoDB via Mongoose | `^8.x` — **one database per service** |
| Search | MongoDB **Atlas Search** (feature-flagged) | used by global search |
| Cache / sessions | Redis | `ioredis ^5.7.0`, `cache-manager ^7.2.0` |
| Realtime | Socket.IO | `^4.8.1` (gateway only) |
| Auth | JWT + API keys | `@nestjs/jwt ^11.0.0`, Passport |
| RBAC | CASL | `@casl/ability ^6.7.3`, `@casl/mongoose ^8.0.3` |
| Hashing | argon2 / bcrypt | `^0.44.0` / `^6.0.0` |
| Validation | class-validator, Joi | `^0.14.2` |
| Object storage | AWS S3 + CloudFront signed URLs | `@aws-sdk/client-s3 ^3.913.0` |
| Email delivery | AWS SES v2 | `@aws-sdk/client-sesv2 ^3.911.0` |
| Channel SDKs | Baileys (WA Web), Meta Graph (IG / Messenger), IMAP+SMTP (Email) | Baileys pinned `7.0.0-rc13` |
| Security | mTLS, field encryption, crypto services | `libs/security` |
| API docs | Swagger | `@nestjs/swagger ^11.2.0` — `/docs` (internal) + `/open-api/docs` (partner) |
| Scheduling | `@nestjs/schedule ^6.0.1` + RabbitMQ delayed queues | |
| Rate limiting | `@nestjs/throttler ^6.4.0` | |
| Testing | Jest | co-located `*.spec.ts` |
| CI/CD | GitLab CI (`.gitlab-ci.yml`), Docker, Kubernetes (`devops/k8s`) | |

---

## 2. Architecture Rules (non-negotiable)

- **API Gateway is the only public surface.** HTTP/REST + Swagger on port `3000`, WebSocket on port `3002`. No other service exposes HTTP.
- **Database-per-service.** No service reads another service's MongoDB. Cross-service data comes over gRPC, or is carried as a denormalized snapshot via events.
- **gRPC for synchronous work** — when the caller needs an immediate answer (reads, validations, command results).
- **RabbitMQ for asynchronous work** — fire-and-forget, fan-out, retryable, delayed, or bulk jobs.
- **mTLS is mandatory** for all inter-service transport (both gRPC and RabbitMQ). Services will not start without certificates.
- **Proto-first contracts.** A cross-service change starts in `proto/*.proto`, then regenerates typed clients. A stale proto breaks the build.
- **Tenant scoping is mandatory.** Every query carries `companyId` (+ `organizationId` where applicable). This is the multi-tenancy guarantee.
- **Shared code lives in `libs/`** — never duplicated per service.

**What this means commercially:** each channel and each domain can be scaled, deployed, and failed independently. The trade-off is that any feature crossing two domains (e.g. "show ticket data inside a conversation") requires a contract change on both sides, which is why cross-domain features cost more than they look.

---

## 3. Service Topology

```
                         ┌─────────────────────────────┐
   FE / Partners ───────▶│        API Gateway          │  HTTP/REST + Swagger + WebSocket
   (JWT / x-signature-key)│  (apps/api-gateway, :3000) │  Validation, AuthN/AuthZ, routing
                         └──────────────┬──────────────┘
                                        │
                 ┌──────────────────────┼───────────────────────┐
                 │ gRPC (sync, mTLS)    │  RabbitMQ (async events)
                 ▼                      ▼                       ▼
        ┌────────────────┐     ┌────────────────┐      ┌────────────────┐
        │  auth-service  │     │ ticket-service │ ...  │ analytics-svc  │
        │   (own DB)     │     │   (own DB)     │      │   (own DB)     │
        └────────────────┘     └────────────────┘      └────────────────┘

   Infra:  MongoDB (DB per service)  ·  Redis (cache/sessions)  ·  AWS S3 (media)
           RabbitMQ exchange `satuinbox-exchange`, queue prefix `satuinbox`
```

### Service Map — 20 services

| Service (app) | gRPC port (dev) | MongoDB database | What it owns |
| --- | --- | --- | --- |
| `api-gateway` | — (HTTP `:3000`, WS `:3002`) | — | REST + Swagger + WebSocket; the only public door |
| `auth-service` | `:50051` | `satuinbox_auth` | Login, JWT, refresh tokens, API keys, sessions |
| `company-service` | `:50052` | `satuinbox_company` | Companies, organizations, teams, shifts/office hours, tags, **relation labels**, **contact-sync settings**, subscriptions |
| `analytics-service` | `:50069` *(see note)* | `satuinbox_analytics` | Metrics, pre-aggregation, reports, exports |
| `people-service` | `:50054` | `satuinbox_people` + `satuinbox_rbac` | Users, members, roles/RBAC, profiles, **third-party contact sync worker** |
| `conversation-service` | `:50055` | `satuinbox_conversation` | Conversations, messages, notes, templates, SLA/FRT/TTC, CSAT, transcripts, screenshots, auto-pull |
| `payment-service` | `:50057` | `satuinbox_payment` | Payments, wallets, billing, gateway webhooks |
| `channel-service` | `:50058` | `satuinbox_channel` | Channel + account-channel integrations, client contacts |
| `whatsapp` (WA Web) | `:50059` | `satuinbox_whatsapp` | Baileys sessions, QR pairing, connection lifecycle, history sync |
| `notification-service` | `:50060` | `satuinbox_notification` | In-app + push notification fan-out |
| `media-service` | `:50062` | `satuinbox_media` + S3 | Upload/download, presigned URLs, image processing |
| `widget` | `:50063` | `satuinbox_widget` | Live-chat widget sessions |
| `ticket-service` | `:50064` | `satuinbox_ticket` | Tickets, types, stages, per-stage SLA, snooze, CSAT, bulk reply, exports |
| `broadcast-service` | `:50065` | `satuinbox_broadcast` | Broadcast campaigns, drafts, **WhatsApp templates + Meta submission** |
| `email` | `:50066` | `satuinbox_email` | IMAP/SMTP channel, transcript emails |
| `instagram` | `:50067` | `satuinbox_instagram` | Instagram DM + Meta Graph webhooks |
| `whatsapp-api` | `:50068` | `satuinbox_whatsapp_api` | Official WhatsApp Business Cloud API, template sync/pricing, webhooks |
| `messenger` | `:50070` | `satuinbox_messenger` | Facebook Messenger + Meta Graph webhooks |
| `sales-service` | `:50071` | `satuinbox_sales` | Leads, visits, comments, sales pipeline |
| `audit-service` | **none** | `satuinbox_audit` | Audit / compliance trail — **RabbitMQ-only listener, no gRPC server** |

> **Notes worth knowing**
> - `audit-service` is the one service with **no gRPC surface** — it only consumes events off RabbitMQ. Nothing can query it synchronously today.
> - `.env.example` defines `GRPC_ANALYTICS_URL` twice (`:50053` and `:50069`). The effective runtime port is **`:50069`**. This is a latent config trap.
> - `whatsapp` (WA Web) reads its URL from `GRPC_WHATSAPP_URL` directly rather than the shared registry.
> - `MONGODB_RBAC_URI` (`satuinbox_rbac`) exists, but there is **no standalone RBAC service** — RBAC lives inside `people-service`.
> - `email` and `sales-service` are the two services without a paired `*-e2e` project.

### Infrastructure Defaults

| Infra | Default |
| --- | --- |
| MongoDB | `localhost:27018` (auth source `admin`); per-service pool sizes, conversation gets the largest (max 20) |
| Redis | `localhost:6379`, key prefix `cache:` |
| RabbitMQ | `localhost:5672`, exchange `satuinbox-exchange`, queue prefix `satuinbox`, prefetch `10` |
| API Gateway | `:3000` |
| WebSocket | `:3002` |
| JWT access token | `15m` |
| JWT refresh token | `24h` |
| API key header | `x-signature-key` |

---

## 4. Public API Surface (what the gateway exposes)

Everything the frontend and partners can call, grouped by route prefix:

**Inbox & messaging** — `conversation`, `conversations`, `conversation-note`, `conversation-sla-metrics`, `sla-setting`, `csat`, `transcript`, `tracking`
**Tickets** — `ticket`, `ticket-type`, `ticket/bulk-reply`, `stage`
**Search** — `search` (global, `/conversations`, `/tickets`), `search/relation-labels` (list / apply / unlink)
**Channels** — `channel`, `account-channel`, `account-group`, `account-channel/whatsapp-api`, `account-channel/whatsapp/history-sync`, `instagram`, `messenger`, `whatsapp`, `widget`
**Contacts & people** — `client-contact` (incl. `sync`, `sync/status`), `member`, `team`, `role`, `privacy`
**Company setup** — `company`, `organization`, `shifts`, `tag`, `away-reasons`, `macros`, `settings/sync-contact`, `shipping-credentials`, `shipping-vendors`
**Broadcast** — `broadcast`, `broadcast/draft`, `broadcast/template`, `system/template-pricing`
**Analytics** — `analytics` (+ `/conversation`, `/ticket`, `/member`, `/responsiveness`, `/broadcast`, `/backfill`, `/export-report`)
**Commerce** — `payment`, `payment-webhook`, `wallet`
**Platform** — `auth`, `notifications`, `media`, `platform`, `health`, `webhook/whatsapp-api`

**Two documented API surfaces:**
- `/docs` — internal Swagger, used by the SatuInbox frontend.
- `/open-api/docs` — the **partner/public API**, authenticated with `x-signature-key`. Open endpoints exist for auth, conversations, tickets, broadcast, media, client contacts, teams, widget, bulk reply, ticket types, and (new in v2.8.0) a WhatsApp number-registration check.

**Realtime:** four WebSocket emitters — conversation, ticket, channel, notification.

---

## 5. Directory Layout

```
apps/
  api-gateway/        # Public HTTP + WS entry point
  <service>/          # NestJS microservice (+ <service>-e2e where present)
libs/
  common/             # Config, constants, enums, DTOs, helpers, base repos, gRPC/RMQ bootstrap
  proto-types/        # ts-proto generated types
  cache/              # Redis module, @GrpcCacheable decorator
  security/           # Crypto, hashing, token services, field encryption
proto/                # 23 contract files (see §6)
docs/                 # Architecture and implementation guides
devops/               # Kubernetes, Docker, MongoDB migration scripts
```

### Inside a service (`apps/<service>/src/app/`)

`controllers/` (gRPC + RabbitMQ handlers) → `services/` (business logic) → `repositories/` (Mongoose access) → `schemas/` (models).
Larger services add `processors/`, `workers/`, `adapters/`, `factories/`, `providers/`.
**Rule:** business logic never touches Mongoose directly — always through a repository.

---

## 6. Contract Files (`proto/` — 23)

`analytics · audit · auth · broadcast · channel · common · company · conversation · email · html-input-type · instagram · media · messenger · money · notification · payment · people · relation-label · sales · ticket · whatsapp · whatsapp-api · widget`

> `relation-label.proto` is **new in v2.8.0**.

---

## 7. Domain Implementation Notes

### Conversation Service (the most complex service)

- **Response-time metrics:**
  - FRT (first response time): `frtCountingStartAt → firstAgentReplyAt`
  - TTC (time to close): `firstCustomerMessageAt → conversationClosedAt`
  - RLT (reply lead time): `firstAgentAssignmentAt → firstAgentReplyAt`
  - Wait time: `firstCustomerMessageAt → firstAgentAssignmentAt`
- **SLA pause reasons:** `agent_away`, `pending_customer_initiation`, `waiting_on_customer`
- **SLA states:** `RUNNING`, `PAUSED`, `STOPPED`, `MISSED`
- **SLA settings** are per-channel with a tenant-level default fallback, and respect office hours.
- **Assignment source tracking:** every assignment records how it happened — `manual`, `self_pull`, `system` (auto round-robin / auto-pull), or `bulk`. Surfaced to the UI and to notifications.
- **Auto-pull** runs on a cron and now has a **rate cap** (see §14).
- Also owns: notes, template messages, CSAT, live-chat transcript delivery, screenshots (with variables + settings), conversation export, and per-channel outbound queue routing.

### Ticket Service

- **Per-stage SLA state machine.** Each stage carries `slaValue`, `slaUnit`, `pauseOnWaitingCustomer`, and a reminder interval.
- `cycleId` resets when a ticket is reopened; paused intervals are tracked and excluded from elapsed SLA.
- Breach and reminder checks fire through RabbitMQ **delayed** queues.
- Snooze (single + bulk) is a **ticket-only** capability — it does not exist for conversations.
- Bulk reply runs as an async job with strict FIFO ordering (`prefetch=1`, manual ack).

### WhatsApp Web Service

- Baileys `7.0.0-rc13` (pinned): QR login, encrypted credential persistence, auto-restore on restart, human-like send behaviour (typing indicators, randomised delays).
- **Account Channel Event Log** — an immutable lifecycle log (connect / disconnect / pairing) with idempotency keys and TTL retention, built for Redash analytics.
- **Startup reconcile** — on boot the service corrects stale account-channel status so the database stops reporting dead accounts as connected.
- **History sync drain** — a gateway-triggered job to pull historical WhatsApp messages into the inbox.

### Message Lifecycle

Message statuses are: `pending → processing → sent → delivered → read`, plus `failed` and `retry`.
Outbound messages carry a `tempMessageId` so the client-side optimistic bubble reconciles against the persisted message rather than duplicating it.

---

## 8. Security & Compliance

- Gateway auth: `Authorization: Bearer <JWT>` for the app, `x-signature-key` for partner API keys.
- Guards: `JwtAuthGuard` + `RolesGuard`, permissions expressed as CASL `{ resource, action[] }`.
- **Every query is tenant-scoped** (`companyId` + `organizationId`).
- Inter-service traffic is mTLS with `rejectUnauthorized: true`.
- Sensitive values (third-party API tokens, credentials) are stored **encrypted at rest**; only a last-4 fragment is kept in plaintext so the UI can render a mask without decrypting.
- Rate limiting via `@nestjs/throttler`.
- `audit-service` records a compliance trail off the event bus.

---

## 9. Feature Flags (env-controlled, all default OFF)

| Flag | Default | Effect |
| --- | --- | --- |
| `GLOBAL_SEARCH_ATLAS_ENABLED` | `false` | Switches global search from the regex/substring path to MongoDB Atlas Search |
| `GLOBAL_SEARCH_CANDIDATE_CACHE_ENABLED` | `false` | Caches search candidate id sets (TTL 600s) |
| `GLOBAL_SEARCH_DEFAULT_WINDOW_MONTHS` | `3` | Default look-back window for global search |
| `ATLAS_SEARCH_COUNT_META_ENABLED` | `false` | Enables Atlas total-count metadata (costs extra query time) |

**Product implication:** the Atlas-powered global search shipped in code is **dark by default**. Turning it on is an ops decision per environment, and it requires Atlas Search indexes to exist. Treat "global search is fast now" as *not yet true in production* until the flag is flipped.

---

## 10. v2.8.0 — What's New (branch `v2.8.0`, not yet in production)

Delta over the `prod-2.7.0.3` production tag. 15 substantive commits.

| Area | Change | Ref |
| --- | --- | --- |
| **Contacts** | **Third-party contact sync** — per-organization configuration (API URI, auth-token header, encrypted token, page size, field mappings, connection test) stored on the organization; a paged sync worker in `people-service` with run tracking and cursor resume; gateway endpoints to trigger a sync and poll status | #2739 |
| **Search** | **Global search migrated to Atlas Search**, split into per-domain endpoints (`/search/conversations`, `/search/tickets`) so each domain loads independently | #2410 |
| **Search** | **Fuzzy matching + candidate caching** added to global search; Atlas result handling hardened | #2969 |
| **Search** | Atlas search ids chunked to avoid a `maxClauseCount` overflow on large result sets | #2732 |
| **Relation labels** | New cross-object labelling feature — schema and service in `company-service`, filtering across conversations and tickets, plus gateway routes to **apply** and **unlink** labels (single item and bulk) | #2836 + base |
| **Relation labels** | Comma-separated relation-label filters normalized and forwarded correctly across gateway and services | #2228 |
| **Broadcast / WA API** | **WhatsApp template builder** — full component model (header / body / footer / buttons) with structural validation, submission to Meta, template reconciliation, and a `system/template-pricing` admin surface | #2373 |
| **Broadcast / WA API** | Meta-imported templates no longer rejected for missing an approval token | #2958 |
| **Partner API** | New **open API endpoint to check whether a number is registered on WhatsApp** | #2953 |
| **Inbox routing** | **Auto-assign unassigned conversations** when a channel is added to a team | #2903 |
| **Inbox routing** | **Auto-pull is now rate-capped** so a single agent cannot drain the backlog — fairer distribution across agents | #2711 |
| **Instagram / Messenger** | **Token-disconnect detection + channel reconnect** — the system now notices an expired Meta token and exposes a reconnect path instead of silently failing | #2360 |
| **Messaging reliability** | `tempMessageId` persisted and outbound de-duplication hardened — fixes duplicate message bubbles | #2455 |

---

## 11. Explicitly NOT Built (verified absent from the codebase)

These come up repeatedly in planning. As of `v2.8.0` there is **no code** for any of them — searched by field name and by feature keyword:

| Feature | Status |
| --- | --- |
| Collaborator role on conversations (`collaboratorIds`) | Not present |
| Snooze **conversation** (snooze exists for tickets only) | Not present |
| Related / relational conversations (`relatedConversationIds`) | Not present |
| Related tickets + merge (`relatedTicketIds`) | Not present |
| WhatsApp **group mention** handling / validation | Not present |
| Auto-reply engine or scheduler | Not present |
| WhatsApp **import modes** | Not present |
| **Anti-ban / anti-spam system** (warming, humanization beyond send delays, account rotation, held/blocked message states) | Not present — message status enum has no held/blocked state |
| Room reminder engine for conversations | Not present |
| Hold / resume state on conversations | Not present |
| **SuperAdmin / cross-company system console** (beyond the single `system/template-pricing` route) | Not present on this branch |

> The one exception worth naming: `system/template-pricing` is the *only* `/system` route that exists. It is an admin surface for WhatsApp template pricing, not a general super-admin console.

---

## 12. Working Practices (for planning conversations)

- **New cross-service contract** → edit `proto/`, regenerate types, register the service. This is a build-breaking change if skipped, so contract changes are never "just frontend".
- **Immediate answer needed** → gRPC. **Fire-and-forget / fan-out / delayed / bulk** → RabbitMQ.
- **Hot-path cross-service data** → denormalized snapshot refreshed by events, not a synchronous call. This is why some fields lag briefly after an edit.
- Local development requires mTLS certificates, MongoDB, Redis, and RabbitMQ running — spinning up the backend is not a one-command affair.
- Backend install requires `--legacy-peer-deps`; there are no root `build`/`test`/`start` scripts — everything goes through Nx.

---

## 13. Reference Documents (in-repo, `docs/`)

- `CONVERSATION_SLA_FRT_TTC.md` — the definitive SLA metric definitions
- `PER_CHANNEL_SLA_IMPLEMENTATION_PLAN.md`
- `ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`
- `GRPC_CACHING_GUIDE.md`, `EVENT_DRIVEN_COUNTER_GUIDE.md`
- `contact-area-context-rbac-spec.md` + implementation plan + API contract diff
- `livechat-transcript-email.md`, `whatsapp-recipient-not-available.md`
- `development.md`, `deployment.md`, `docs/incidents/`
- `devops/LAPORAN-MIGRASI-ATLAS-TO-SELFHOSTED-15-APRIL-2026.md` — MongoDB moved from Atlas to self-hosted; relevant context for why Atlas Search is flag-gated

---

## 14. Release History (tags)

`prod-2.4.3.3` → `prod-2.5.0` → `prod-2.6.0` → `prod-2.6.1` → `prod-2.7.0` → `prod-2.7.0.1` → `prod-2.7.0.2` → **`prod-2.7.0.3` (current production)** → `v2.8.0` (in development)
