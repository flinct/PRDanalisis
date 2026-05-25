# BE Repo Memory

> **Sumber:** `C:\Users\MyBook SAGA 12\Desktop\BE satuinbox\omnichannel-satuinbox-be`
> **Dibuat:** 2026-05-25
> **Fungsi:** Canonical reference untuk arsitektur, service mapping, schema, dan implementation status BE.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (TypeScript ~5.9.2) |
| Framework | NestJS v11 |
| Monorepo | Nx v21.5.2 |
| Inter-service | gRPC (`@grpc/grpc-js`) via protobuf |
| Async | RabbitMQ (amqplib + amqp-connection-manager) |
| REST API | @nestjs/platform-express + Swagger |
| WebSocket | Socket.IO |
| Database | MongoDB via Mongoose v8 |
| Cache | Redis (cache-manager + ioredis) |
| Auth | Passport (JWT, Local) + @nestjs/jwt |
| Permissions | CASL (@casl/ability, @casl/mongoose) |
| WhatsApp Web | @whiskeysockets/baileys v7 |
| Object Storage | S3 / CloudFront (@aws-sdk) |

---

## 2. Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐
│   Mobile/   │────▶│  API Gateway  │────▶│  gRPC Services    │
│   Web App   │◀────│  (REST + WS)  │◀────│  (NestJS gRPC)    │
└─────────────┘     └──────┬───────┘     └────────┬──────────┘
                           │                       │
                           ▼                       ▼
                    ┌──────────────┐     ┌───────────────────┐
                    │  RabbitMQ    │     │     MongoDB       │
                    │  (Events)    │     │  (+ Redis Cache)  │
                    └──────────────┘     └───────────────────┘
```

### Flow:
- **API Gateway** (`api-gateway/`) — REST endpoints + WebSocket. Auth guards, permission checks, privacy masking. Proxies to microservices via gRPC.
- **Microservices** — each is standalone NestJS app with own MongoDB, gRPC server, optional RabbitMQ consumers.
- **gRPC** — synchronous inter-service calls (protobuf-defined).
- **RabbitMQ** — async events (message inbound/outbound, SLA breach check, bulk reply jobs).
- **Socket.IO** — real-time via API Gateway WebSocket gateway.

---

## 3. Microservices

| Service | Path | Domain | gRPC Proto |
|---------|------|--------|------------|
| **API Gateway** | `apps/api-gateway/` | REST + WS entry point | — |
| **Conversation** | `apps/conversation-service/` | Chat, messages, SLA, notes, screenshots | `conversation.proto` |
| **Ticket** | `apps/ticket-service/` | Tickets, types, bulk reply, tracking, SLA | `ticket.proto` |
| **WhatsApp Web** | `apps/whatsapp/` | Baileys instance mgmt, QR, send/receive | `whatsapp.proto` |
| **WhatsApp API** | `apps/whatsapp-api/` | Cloud API OAuth, webhook, messaging | `whatsapp-api.proto` |
| **Broadcast** | `apps/broadcast-service/` | Mass messaging | `broadcast.proto` |
| **Widget** | `apps/widget/` | Live chat | `widget.proto` |
| **Instagram** | `apps/instagram/` | Instagram messaging | `instagram.proto` |
| **Messenger** | `apps/messenger/` | Facebook Messenger | `messenger.proto` |
| **Email** | `apps/email/` | Email channel | `email.proto` |
| **People** | `apps/people-service/` | Contacts, members | `people.proto` |
| **Auth** | `apps/auth-service/` | Authentication | `auth.proto` |
| **Notification** | `apps/notification-service/` | Notifications | `notification.proto` |
| **Audit** | `apps/audit-service/` | Audit logging | `audit.proto` |
| **Analytics** | `apps/analytics-service/` | Analytics aggregation | `analytics.proto` |
| **Media** | `apps/media-service/` | File/media storage | `media.proto` |
| **Company** | `apps/company-service/` | Company/org settings | `company.proto` |
| **Payment** | `apps/payment-service/` | Billing | `payment.proto` |
| **Sales** | `apps/sales-service/` | Sales features | `sales.proto` |

---

## 4. Conversation Service (`conversation-service/`)

### gRPC Services (from `conversation.proto`)
| Service | Key Methods |
|---------|------------|
| `ConversationService` | Create, Get, List, Update, Delete, Assign, Unassign, Star, Close, Reopen, MarkSpam, BulkJunk, Pin, BulkAssign, BulkPin, BulkSpam, BulkClose, BulkReopen |
| `MessageService` | GetMessages, PinMessage, EditMessage, DeleteMessage, BatchDeleteMessages |
| `MessageUtilityService` | System messages/utilities |
| `ScreenshotService` | Capture, variables, webhook logs |
| `SLASettingService` | Get, List, Resolve, Update, Delete SLA settings |
| `ConversationSLAMetricsService` | Get FRT/TTC metrics |
| `TemplateMessageService` | CRUD saved reply templates |
| `NoteService` | Get, Create, Update, Delete, Pin |
| `CsatService` | Create, Get CSAT |

### Key Schemas
| Schema | Key Fields |
|--------|-----------|
| `conversation.schema.ts` | `status` (open/closed), `participants[]`, `team`, `tags[]`, `spams[]`, `favorites[]`, `isJunked`, `isPinned`, `sessionDetails[]`, `lastReEngagementAt`, `expiresAt` |
| `message.schema.ts` | `conversationId`, `sender`, `content`, `direction` (inbound/outbound), `type`, `status`, `attachments[]` |
| `conversation-sla-metrics.schema.ts` | `firstCustomerMessageAt`, `frtCountingStartAt`, `firstAgentAssignmentAt`, `firstAgentReplyAt`, `conversationClosedAt`, `frtMs`, `ttcMs`, `waitTimeInQueueMs`, `rltMs`, `firstAssigneeId`, `firstResponderId`, `officeHoursSnapshot`, `isFrtPaused`, `isTtcPaused`, `pausedIntervals[]` |
| `sla-setting.schema.ts` | Per-channel SLA config with FRT/TTC values, office hours, pause policies |
| `note.schema.ts` | Conversation notes |
| `template-message.schema.ts` | Saved reply templates |

### Key Services
| Service | Function |
|---------|----------|
| `conversation.service.ts` | Main business logic |
| `message.service.ts` | Message handling, routing, attachments |
| `conversation-sla-metrics.service.ts` | FRT/TTC calculation engine |
| `sla-pause.service.ts` | Pause/resume SLA timers |
| `sla-agent-aux.service.ts` | AUX mode SLA management |
| `sla-setting.service.ts` | SLA settings CRUD |
| `sla-setting-resolver.service.ts` | Resolve effective SLA with fallback chain |
| `conversation-sla-reminder-cron.service.ts` | SLA reminder scheduling |
| `auto-pull-cron.service.ts` | Auto-pull/round robin |

### Conversation SLA Implementation
- **FRT formula:** `frtCountingStartAt → firstAgentReplyAt` (inbound → first reply)
- **TTC formula:** `firstCustomerMessageAt → conversationClosedAt` (inbound → close)
- **RLT:** `firstAgentAssignmentAt → firstAgentReplyAt` (assignment → reply) — stored in metrics
- **Wait Time:** `firstCustomerMessageAt → firstAgentAssignmentAt` (inbound → assignment) — stored
- **Pause reasons:** `agent_away`, `pending_customer_initiation`, `waiting_on_customer`
- **SLA state enum:** `RUNNING`, `PAUSED`, `STOPPED`, `MISSED`
- **RabbitMQ patterns:** `TICKET_SLA_BREACH_CHECK`, `TICKET_SLA_REMINDER_CHECK`
- **Notification types:** `CONVERSATION_SLA_BREACHED_ASSIGNED`, `CONVERSATION_SLA_REMINDER_ASSIGNED`
- **Settings:** Per-channel with tenant default fallback, office hours support

---

## 5. Ticket Service (`ticket-service/`)

### gRPC Services (from `ticket.proto`)
| Service | Key Methods |
|---------|------------|
| `TicketService` | Create, Get, List, Update, Delete, Assign, Unassign, Close, Reopen, Snooze, Unsnooze, StageTransition, AddTag, RemoveTag, KPI, BulkResolve, BulkAddTag, BulkRemoveTag, BulkSnooze, BulkUnsnooze, Export |
| `TicketTypeService` | CRUD ticket types (stage defs, SLA values per stage) |
| `MessageService` | Ticket-scoped messages, media |
| `BulkReplyService` | Create job, get job, get result, cancel |
| `TrackingService` | Shipment tracking (SAP, JNE, JNT, Linc) |
| `TicketViewSettingsService` | Column config, view settings |
| `CsatService` | Ticket CSAT |

### Key Schemas
| Schema | Key Fields |
|--------|-----------|
| `ticket.schema.ts` | `status` (open/close), `ticketNumber`, `title`, `priority`, `currentStageId`, `stages[]`, `customAttributes[]`, `ticketTypeId`, `team`, `participants[]`, `conversationId`, `tags[]`, `snooze`, `slaState` |
| `ticket-type.schema.ts` | Stage definitions with SLA values per stage, custom field configs |
| `message.schema.ts` | Ticket messages |
| `bulk-job.schema.ts` | Bulk reply job tracking |
| `ticket-view-settings.schema.ts` | Column visibility/config |

### Key Services
| Service | Function |
|---------|----------|
| `ticket.service.ts` | Main business logic with SLA state machine |
| `sla.service.ts` | SLA evaluation per stage, pause/resume, cycle management |
| `sla-evaluation-cron.service.ts` | SLA breach/reminder cron |
| `ticket-type.service.ts` | Ticket type CRUD |
| `ticket-view-settings.service.ts` | Column config |
| `ticket-export.service.ts` | XLSX export |
| `bulk-reply.service.ts` | Bulk reply processing |
| `tracking.service.ts` | Shipment tracking |

### Ticket SLA Implementation
- **Per-stage state machine:** Each ticket type stage has `slaValue + slaUnit`, `pauseOnWaitingCustomer`, `reminderMs`
- **Cycle management:** `cycleId` resets on reopen; pause intervals tracked in `StageSlaRuntime`
- **FRT:** From ticket creation (or first agent response)
- **TTC:** From ticket creation + non-resolved → resolved/closed
- **Stage SLA:** Cumulative per stage, excluding paused intervals
- **Reopen:** New SLA cycle (`cycleId`)

---

## 6. WhatsApp Web Service (`whatsapp/`)

### gRPC Services (from `whatsapp.proto`)
| Service | Key Methods |
|---------|------------|
| `Whatsapp` | `InitInstance`, `GetInstance`, `GetQRCode`, `StopInstance`, `LogoutInstance` |

### Key Files
| File | Function |
|------|----------|
| `baileys.service.ts` | Core Baileys integration, message sending, auth |
| `baileys.factory.ts` | Baileys socket factory |
| `session.service.ts` | Session lifecycle management |
| `whatsapp-connection.service.ts` | Connection lifecycle (connect/disconnect/reconnect) |
| `whatsapp-message.service.ts` | Inbound/outbound message handling |
| `whatsapp-session-log.service.ts` | Session history logging |
| `schemas/whatsapp-session-history.schema.ts` | Session history |

### Implementation Status
| V2 Feature | BE Status | Notes |
|-----------|-----------|-------|
| Baileys connector | ✅ | `baileys.service.ts` |
| QR generation | ✅ | `GetQRCode` gRPC |
| Instance lifecycle | ✅ | `InitInstance`, `StopInstance`, `LogoutInstance` |
| Session management | ✅ | `session.service.ts` |
| Credential persistence | ✅ | Encrypted auth, auto-restore |
| Human-like send | ✅ | Typing indicators, random delays in baileys |
| Account Groups | ✅ | `account-channel-group` endpoints |
| Pairing Code | ❌ | Hanya QR, no Pairing Code flow |
| Auto-switch sessions | ⚠️ Partial | Basic recovery, multi-slot failover not explicit |
| Import Modes | ❌ **Not in BE** | No import-mode module/schema |
| Broadcast Humanization | ❌ **Not in BE** | No bubble-split/self-quote in broadcast |
| Warming System | ❌ **Not in BE** | No warming engine or topology |
| Account Pools Rotation | ❌ **Not in BE** | No auto-rotation logic |

---

## 7. RabbitMQ Message Patterns

| Pattern | Purpose |
|---------|---------|
| `message.inbound.*` | Inbound message processing |
| `message.outbound.*` | Outbound message sending |
| `ticket.sla.breach.check` | Delayed SLA breach check |
| `ticket.sla.reminder.check` | Delayed SLA reminder check |
| `ticket.auto.unsnooze` | Auto-unsnooze tickets |
| `bulk-reply.job.*` | Bulk reply processing |
| `livechat.transcript.send` | Transcript email sending |
| `analytics.aggregate.*` | Analytics pre-aggregation |
| `analytics.get.*.sla.breakdown` | Real-time SLA breakdown queries |

---

## 8. Key Protobuf Definitions

### Conversation Proto (`proto/conversation.proto`)
- **ConversationService:** Full conversation CRUD + bulk operations
- **MessageService:** Message CRUD + pin/edit/delete
- **SLASettingService:** SLA config management
- **ConversationSLAMetricsService:** FRT/TTC metrics
- **ScreenshotService:** Screenshot capture
- **TemplateMessageService:** Saved replies
- **NoteService:** Notes
- **CsatService:** CSAT ratings

### Ticket Proto (`proto/ticket.proto`)
- **TicketService:** Full ticket CRUD + stage/SLA/bulk
- **TicketTypeService:** Ticket types with stage SLA config
- **BulkReplyService:** Bulk reply jobs
- **TrackingService:** Shipping tracking (SAP, JNE, JNT, Linc)
- **TicketViewSettingsService:** Column config

### WhatsApp Proto (`proto/whatsapp.proto`)
- **Whatsapp:** `InitInstance`, `GetInstance`, `GetQRCode`, `StopInstance`, `LogoutInstance`

---

## 9. BE-side Features NOT Implemented

Berdasarkan eksplorasi kode, fitur-fitur berikut **belum ada di BE**:
- Collaborator role (tidak ada `collaboratorIds` di schema)
- Snooze Conversation (tidak ada `snooze` field di conversation schema. Hanya ticket)
- Related/Relational Conversations (tidak ada `relatedConversationIds`)
- Related Tickets & Merge (tidak ada `relatedTicketIds` atau merge logic)
- WA Group Mention (tidak ada mention validation logic)
- Auto-reply Templates (tidak ada auto-reply engine/scheduler)
- Import Modes (tidak ada import-mode module di whatsapp service)
- Anti Spam System (warming, humanization, rotation)
- Room Reminder engine (tidak ada reminder scheduler untuk conversation)
- Hold state management di conversation (tidak ada hold state)

---

## 10. BE + FE Alignment Summary

| Domain | FE Match | BE Match | Notes |
|--------|----------|----------|-------|
| Conversation SLA | ✅ | ✅ | FRT/TTC/RLT/Wait Time all implemented |
| Conversation features (basic) | ✅ | ✅ | CRUD, assign, close, reopen, spam, tags |
| Conversation V2 new features | ❌ 8 fitur | ❌ 8 fitur | All 0% both sides |
| Ticket SLA | ✅ | ✅ | Per-stage state machine, FRT/TTC/stage SLA |
| Ticket features (basic) | ✅ | ✅ | CRUD, types, stages, bulk, export, snooze |
| Ticket V2 new: Related Tickets | ❌ | ❌ | 0% |
| WhatsApp Web account mgmt | ✅ | ✅ | Add, edit, groups, reserved pool, QR |
| WhatsApp Web V2 new features | ❌ 6 fitur | ❌ 6 fitur | All 0% both sides |

**Kesimpulan:** Tidak ada fitur yang "sudah di BE tapi belum di FE" atau sebaliknya. Semua fitur developed = developed di kedua sisi. Semua fitur undeveloped = undeveloped di kedua sisi.
