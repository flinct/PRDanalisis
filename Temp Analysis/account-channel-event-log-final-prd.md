# PRD Final: Account Channel Event Log

> Scope: SatuInbox v2, WhatsApp Web account channel lifecycle
> Status: Consolidated Draft
> Source: merged from `PRD Analysis Account Channel Event Log.MD` and `account-channel-event-log-analysis.md`
> Date: 2026-06-02

---

## 1. Summary

Account Channel Event Log adalah fitur untuk mencatat histori lifecycle account channel WhatsApp Web. Fitur ini membantu Admin dan Supervisor melihat kapan akun dibuat, diinisialisasi, discan, berhasil connected, disconnected, suspended, dan berapa lama akun aktif dalam satu atau beberapa sesi koneksi.

`LIFETIME` bukan event tersimpan. Lifetime adalah metric turunan dari pasangan event `CONNECTED` sampai `DISCONNECTED`.

Verdict implementasi: Conditional Go.

Blocking decisions sebelum sprint:

| ID    | Keputusan                                                             | Owner       |
| ----- | --------------------------------------------------------------------- | ----------- |
| OQ-01 | Apakah action `SUSPENDED` sudah ada atau harus dibuat bersamaan       | Engineering |
| OQ-02 | Retention policy final, terutama jika event disimpan di audit-service | PM / Legal  |
| OQ-03 | Sumber teknis event `SCAN` di Baileys                                 | Engineering |

---

## 2. Context

Kondisi saat ini berdasarkan memory FE dan BE:

| Area                        | Existing                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `channel-service`           | Mengelola account channel CRUD, group, reserved pool                                                              |
| `whatsapp` service          | Mengelola Baileys session lifecycle: `InitInstance`, `GetInstance`, `StopInstance`, `LogoutInstance`, `GetQRCode` |
| `audit-service`             | Sudah ada untuk compliance trail, belum ada account channel event log                                             |
| FE WA Web settings          | Sudah punya account management, QR connect, statistic cards                                                       |
| `ChannelSocketProvider`     | Sudah menerima status koneksi account channel secara realtime                                                     |
| `accountChannel.service.ts` | Sudah menjadi service FE untuk CRUD, QR, instance lifecycle                                                       |

Gap saat ini:

| Gap                                  | Dampak                                                  |
| ------------------------------------ | ------------------------------------------------------- |
| Tidak ada histori lifecycle account  | Admin hanya melihat status saat ini, bukan histori      |
| Tidak ada reason disconnect historis | Sulit debug timeout, conflict, logout, banned           |
| Tidak ada lifetime session           | Tidak bisa melihat durasi akun aktif sebelum disconnect |
| Tidak ada audit trail suspend        | Sulit membedakan suspend manual vs system policy        |

---

## 3. Goals And Non-Goals

### Goals

| ID   | Goal                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| G-01 | Mencatat event lifecycle account channel secara append-only                    |
| G-02 | Menampilkan timeline event per account channel di WA Web settings              |
| G-03 | Menghitung lifetime per session dan total lifetime dalam rentang query         |
| G-04 | Menyimpan actor, reason, source service, dan metadata debugging yang aman      |
| G-05 | Menjaga main flow create/connect/disconnect tidak ter-block jika logging gagal |

### Non-Goals Phase 1

| ID    | Non-Goal                                                   |
| ----- | ---------------------------------------------------------- |
| NG-01 | Global event log semua akun sebagai halaman terpisah       |
| NG-02 | Export CSV/XLSX                                            |
| NG-03 | Notification otomatis saat `DISCONNECTED` atau `SUSPENDED` |
| NG-04 | Pairing Code support                                       |
| NG-05 | Analytics uptime dashboard                                 |
| NG-06 | Retrospective backfill untuk histori sebelum fitur deploy  |

---

## 4. Event Taxonomy

### 4.1 Event Types

| Event          | Source                               | Trigger                                                           | Notes                                                  |
| -------------- | ------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------ |
| `CREATED`      | `channel-service`                    | Account channel berhasil dibuat                                   | User-triggered oleh Admin/Supervisor sesuai permission |
| `INIT`         | `whatsapp` service                   | `InitInstance()` dimulai                                          | Belum tentu connected                                  |
| `SCAN`         | `whatsapp` service                   | QR benar-benar discan atau auth/pairing success signal terdeteksi | Tidak boleh di-emit dari `GetQRCode` biasa             |
| `CONNECTED`    | `whatsapp` service                   | Baileys `connection.update` menghasilkan `connection = open`      | Mulai active session dan lifetime                      |
| `DISCONNECTED` | `whatsapp` service                   | Baileys `connection.update` menghasilkan `connection = close`     | Menutup active session dan menghitung `durationMs`     |
| `SUSPENDED`    | `channel-service` atau system policy | Account diblokir dari penggunaan                                  | Tergantung ketersediaan suspend action                 |

### 4.2 Derived Metric

| Metric           | Formula                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| Session lifetime | `DISCONNECTED.occurredAt - CONNECTED.occurredAt` untuk `connectionSessionId` yang sama |
| Active lifetime  | `now - CONNECTED.occurredAt` jika belum ada `DISCONNECTED`                             |
| Total lifetime   | Sum semua completed session dalam filter query                                         |

`LIFETIME` tidak disimpan sebagai event type.

### 4.3 Critical Note For `SCAN`

`SCAN` harus merepresentasikan QR benar-benar discan, bukan QR berhasil digenerate.

Engineering wajib mengidentifikasi signal Baileys yang tepat. Jika signal tidak tersedia, opsi Phase 1 adalah:

| Option                                                        | Decision                                               |
| ------------------------------------------------------------- | ------------------------------------------------------ |
| Emit `SCAN` dari auth/pairing success signal                  | Preferred                                              |
| Emit `CONNECTED` saja dengan `metadata.connectionMethod = qr` | Acceptable fallback                                    |
| Rename event menjadi `QR_READY`                               | Butuh approval PM karena berbeda dari requirement awal |

---

## 5. Functional Requirements

| ID    | Requirement                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------- |
| FR-01 | Sistem mencatat `CREATED` saat account channel pertama kali dibuat                                   |
| FR-02 | Sistem mencatat `INIT` saat instance WhatsApp diinisialisasi                                         |
| FR-03 | Sistem mencatat `SCAN` saat QR benar-benar discan atau auth/pairing success signal tersedia          |
| FR-04 | Sistem mencatat `CONNECTED` saat session Baileys terbuka penuh dan siap kirim/terima pesan           |
| FR-05 | Sistem mencatat `DISCONNECTED` saat koneksi putus, lengkap dengan reason dan sanitized reason detail |
| FR-06 | Sistem mencatat `SUSPENDED` saat akun disuspend oleh admin atau system                               |
| FR-07 | Sistem menghitung lifetime per session dari `CONNECTED` sampai `DISCONNECTED`                        |
| FR-08 | Sistem menghitung active lifetime dari `CONNECTED` terakhir sampai now jika akun masih connected     |
| FR-09 | Admin dapat melihat event log per account channel, terurut `occurredAt` descending                   |
| FR-10 | Admin dapat filter log berdasarkan event type dan date range                                         |
| FR-11 | Supervisor hanya dapat melihat log account channel dalam scope team inbox-nya                        |
| FR-12 | Agent tidak dapat melihat tab log dan tidak dapat mengakses endpoint log                             |
| FR-13 | Event log bersifat append-only, tidak ada update/delete oleh user                                    |
| FR-14 | Event payload menyimpan tenant scope: `companyId` dan `organizationId`                               |
| FR-15 | Event payload menyimpan `connectionSessionId` untuk pairing `CONNECTED` dan `DISCONNECTED`           |
| FR-16 | Event payload menyimpan `idempotencyKey` untuk mencegah duplicate write dari retry RabbitMQ          |

---

## 6. Non-Functional Requirements

| ID     | Requirement                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------- |
| NFR-01 | Event ditulis async via RabbitMQ dan tidak boleh block main flow                                         |
| NFR-02 | Query per-account event log p95 kurang dari 500ms untuk limit 50                                         |
| NFR-03 | Semua query wajib tenant-scoped                                                                          |
| NFR-04 | `reasonDetail` tidak boleh menyimpan credential, encryption key, stack trace, atau raw sensitive payload |
| NFR-05 | Duplicate `DISCONNECTED` dalam reconnect loop harus dicegah                                              |
| NFR-06 | Duplicate consumer write harus dicegah dengan unique `idempotencyKey`                                    |
| NFR-07 | TTL retention hanya boleh diaktifkan setelah PM/Legal menyetujui policy                                  |
| NFR-08 | Event ordering pada UI menggunakan `occurredAt`, bukan `createdAt` consumer                              |

---

## 7. Data Model

### 7.1 Storage Decision

Phase 1 recommendation: simpan di `audit-service` database `satuinbox_audit`, collection `account_channel_event_logs`.

Rationale:

| Reason                 | Detail                                            |
| ---------------------- | ------------------------------------------------- |
| Separation of concerns | Lifecycle log adalah audit/observability trail    |
| Existing service       | `audit-service` sudah ada                         |
| Read model sederhana   | API Gateway dapat query via gRPC ke audit-service |

Alternative jika latency operational UI menjadi masalah: duplicate projection di `channel-service` sebagai read model Phase 2.

### 7.2 Schema Draft

```typescript
@Schema({ collection: "account_channel_event_logs", timestamps: true })
export class AccountChannelEventLog extends BaseAuditSchema {
  @Prop({ required: true, index: true })
  companyId: string;

  @Prop({ required: true, index: true })
  organizationId: string;

  @Prop({ type: SchemaTypes.ObjectId, required: true, index: true })
  accountChannelId: Types.ObjectId;

  @Prop({ required: true })
  accountChannelName: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ required: true, enum: AccountChannelEventTypeEnum, index: true })
  eventType: AccountChannelEventTypeEnum;

  @Prop({
    enum: AccountChannelEventStatusEnum,
    default: AccountChannelEventStatusEnum.SUCCESS,
  })
  eventStatus: AccountChannelEventStatusEnum;

  @Prop({ type: Date, required: true, index: true })
  occurredAt: Date;

  @Prop({ required: true, index: true })
  idempotencyKey: string;

  @Prop({ index: true })
  connectionSessionId?: string;

  @Prop({ enum: AccountChannelDisconnectReasonEnum })
  reason?: AccountChannelDisconnectReasonEnum;

  @Prop()
  reasonDetail?: string;

  @Prop({ type: Number })
  durationMs?: number;

  @Prop({ enum: ["user", "system"], default: "system" })
  actorType: "user" | "system";

  @Prop({ type: SchemaTypes.ObjectId })
  actorUserId?: Types.ObjectId;

  @Prop()
  actorUserName?: string;

  @Prop({ required: true })
  sourceService: "channel-service" | "whatsapp-service" | "system";

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}
```

### 7.3 Enums

```typescript
export enum AccountChannelEventTypeEnum {
  CREATED = "CREATED",
  INIT = "INIT",
  SCAN = "SCAN",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  SUSPENDED = "SUSPENDED",
}

export enum AccountChannelEventStatusEnum {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  SKIPPED = "SKIPPED",
}

export enum AccountChannelDisconnectReasonEnum {
  LOGOUT_MANUAL = "LOGOUT_MANUAL",
  TIMEOUT = "TIMEOUT",
  CONFLICT = "CONFLICT",
  BANNED = "BANNED",
  CONNECTION_LOST = "CONNECTION_LOST",
  AUTO_SUSPEND = "AUTO_SUSPEND",
  UNKNOWN = "UNKNOWN",
}
```

### 7.4 Indexes

```typescript
AccountChannelEventLogSchema.index({
  companyId: 1,
  organizationId: 1,
  accountChannelId: 1,
  occurredAt: -1,
});

AccountChannelEventLogSchema.index({
  companyId: 1,
  organizationId: 1,
  eventType: 1,
  occurredAt: -1,
});

AccountChannelEventLogSchema.index({ idempotencyKey: 1 }, { unique: true });

AccountChannelEventLogSchema.index({
  accountChannelId: 1,
  connectionSessionId: 1,
  eventType: 1,
});
```

TTL index is conditional and must not be enabled before retention policy is approved:

```typescript
AccountChannelEventLogSchema.index(
  { occurredAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);
```

---

## 8. Backend Architecture

### 8.1 Event Flow

```text
channel-service
  createAccountChannel()
    -> emit account-channel.event.log CREATED

  suspendAccountChannel()
    -> emit account-channel.event.log SUSPENDED

whatsapp-service
  InitInstance()
    -> emit account-channel.event.log INIT

  Baileys auth/pairing success signal
    -> emit account-channel.event.log SCAN

  Baileys connection.update open
    -> create/resolve connectionSessionId
    -> emit account-channel.event.log CONNECTED

  Baileys connection.update close
    -> resolve active connectionSessionId
    -> calculate durationMs if possible
    -> emit account-channel.event.log DISCONNECTED

RabbitMQ
  pattern: account-channel.event.log

audit-service
  consume event
  sanitize payload
  upsert/insert by idempotencyKey
  store in account_channel_event_logs

api-gateway
  query audit-service via gRPC
  expose REST endpoint to FE
```

### 8.2 RabbitMQ Pattern

Add to shared constants:

```typescript
ACCOUNT_CHANNEL_EVENT_LOG = "account-channel.event.log";
```

Payload:

```typescript
interface AccountChannelEventPayload {
  companyId: string;
  organizationId: string;
  accountChannelId: string;
  accountChannelName: string;
  phoneNumber?: string;
  eventType: AccountChannelEventTypeEnum;
  eventStatus?: AccountChannelEventStatusEnum;
  occurredAt: string;
  idempotencyKey: string;
  connectionSessionId?: string;
  reason?: AccountChannelDisconnectReasonEnum;
  reasonDetail?: string;
  durationMs?: number;
  actorType: "user" | "system";
  actorUserId?: string;
  actorUserName?: string;
  sourceService: "channel-service" | "whatsapp-service" | "system";
  metadata?: Record<string, unknown>;
}
```

### 8.3 Connection Session Rules

| Rule                                   | Behavior                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------- |
| New `CONNECTED` with no active session | Generate new `connectionSessionId`                                          |
| Duplicate `CONNECTED` while active     | Do not create new session unless previous session was closed                |
| `DISCONNECTED` with active session     | Use active `connectionSessionId`, calculate `durationMs`                    |
| `DISCONNECTED` without active session  | Store event only if useful for debugging, mark `metadata.orphan = true`     |
| Auto-restore                           | `CONNECTED` with `actorType = system` and `metadata.trigger = auto_restore` |

### 8.4 Deduplication And Idempotency

| Problem                                   | Mitigation                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| Baileys emits repeated close              | Redis TTL key, e.g. `evt:disconnected:{accountChannelId}` for 5 seconds |
| RabbitMQ retry writes duplicate           | Unique `idempotencyKey` and consumer idempotent insert                  |
| Event ordering differs from consume order | Sort and pair by `occurredAt`                                           |
| Reconnect loop creates noisy sessions     | Prevent new `CONNECTED` session if active session is not closed         |

Suggested idempotency key:

```text
{accountChannelId}:{eventType}:{connectionSessionId || 'none'}:{occurredAtEpochMsRounded}
```

For user action events, include request id if available.

### 8.5 gRPC Proto

Add service to `proto/audit.proto`:

```protobuf
service AccountChannelEventLogService {
  rpc GetEventLogs(GetAccountChannelEventLogsRequest)
      returns (GetAccountChannelEventLogsResponse);
  rpc GetLifetimeSummary(GetLifetimeSummaryRequest)
      returns (GetLifetimeSummaryResponse);
}

message GetAccountChannelEventLogsRequest {
  string company_id = 1;
  string organization_id = 2;
  string account_channel_id = 3;
  repeated string event_types = 4;
  string start_date = 5;
  string end_date = 6;
  int32 page = 7;
  int32 limit = 8;
}
```

### 8.6 REST API

Phase 1 endpoints:

| Method | Path                                   | Description                                  |
| ------ | -------------------------------------- | -------------------------------------------- |
| `GET`  | `/api/account-channels/:id/event-logs` | Get event timeline for one account channel   |
| `GET`  | `/api/account-channels/:id/lifetime`   | Get lifetime summary for one account channel |

Query params:

| Param          | Description                |
| -------------- | -------------------------- |
| `page`         | Page number                |
| `limit`        | Page size, default 50      |
| `eventTypes[]` | Optional event type filter |
| `startDate`    | Optional ISO date          |
| `endDate`      | Optional ISO date          |
| `sortBy`       | Default `occurredAt`       |
| `order`        | Default `desc`             |

Global endpoint is Phase 2:

| Method | Path                               | Description                             |
| ------ | ---------------------------------- | --------------------------------------- |
| `GET`  | `/api/account-channels/event-logs` | Global log across accounts with filters |

---

## 9. Frontend Scope

### 9.1 UI Location

Add a `Log Aktivitas` tab/section in WhatsApp Web account detail/drawer under:

```text
Settings -> Channels -> WhatsApp Web -> Account Detail -> Log Aktivitas
```

Phase 1 UI:

| UI Element    | Requirement                                              |
| ------------- | -------------------------------------------------------- |
| Timeline list | Shows latest event first                                 |
| Event row     | Shows event type, timestamp, actor, reason if any        |
| Lifetime row  | Shows duration under `DISCONNECTED` event when available |
| Active badge  | Shows `Aktif sejak X` for currently connected account    |
| Filter        | Event type and date range                                |
| Pagination    | Load more or paginated list                              |

Do not show Export button in Phase 1 unless PM approves export scope.

### 9.2 FE Files

```text
apps/omnichannel/
  services/account-channel-event-log/
    useGetAccountChannelEventLogs.service.ts
    useGetAccountChannelLifetime.service.ts
  components/pages/settings/channels/whatsapp-web/
    AccountChannelEventLogTab.tsx
    AccountChannelEventLogItem.tsx
    AccountChannelLifetimeBadge.tsx
  types/
    account-channel-event-log.types.ts
```

If shared across app, types should move to `@satuinbox/types`.

### 9.3 Data Fetching Strategy

Phase 1 recommendation:

| Strategy                                               | Decision                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------- |
| React Query fetch on tab open                          | Required                                                            |
| Refetch every 30s while tab is open                    | Acceptable for Phase 1                                              |
| Invalidate on existing connection status socket update | Recommended if event already available from `ChannelSocketProvider` |
| Dedicated `account-channel.event.log` Socket.IO event  | Phase 2 unless PM requires realtime timeline                        |

Rationale: event log is operational history, not a sub-second realtime surface. Existing connection status UI remains the realtime source of truth.

### 9.4 Accessibility

| Area                 | Requirement                           |
| -------------------- | ------------------------------------- |
| Event icon           | Must have text label or `aria-label`  |
| Filter               | Keyboard navigable                    |
| Pagination/load more | Keyboard navigable                    |
| Timestamp            | Localized with `next-intl` formatting |

---

## 10. RBAC And Security

| Role        | Access                                                     |
| ----------- | ---------------------------------------------------------- |
| Super Admin | Full access according to platform policy                   |
| Admin       | Can view all account channel logs in own company/org       |
| Supervisor  | Can view logs for account channels in own team inbox scope |
| Agent       | No access to settings channel log                          |

Security requirements:

| Requirement               | Detail                                                                  |
| ------------------------- | ----------------------------------------------------------------------- |
| Tenant isolation          | All queries include `companyId` and `organizationId` from auth context  |
| Team scope                | Supervisor cannot access logs for unrelated team inbox account channels |
| Read-only                 | No update/delete endpoint for event log                                 |
| Sanitization              | Strip stack trace, credentials, tokens, encryption key, session payload |
| FE hiding is not security | API Gateway must enforce RBAC and tenant scope                          |

---

## 11. Edge Cases

| Case                               | Expected Behavior                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| QR refresh every 30s               | Do not create repeated `SCAN` logs                                                            |
| QR generated but never scanned     | Log `INIT`; do not log `SCAN`                                                                 |
| QR scanned but connection fails    | Log `SCAN` if confirmed, then optional `DISCONNECTED` or failed event status depending signal |
| Auto-restore after service restart | Log `CONNECTED` with `actorType = system`, `metadata.trigger = auto_restore`                  |
| Repeated close events              | Deduplicate within 5 seconds                                                                  |
| Multiple connect/disconnect cycles | Show each session and total lifetime sum                                                      |
| Account never connected            | Lifetime is null or `Belum pernah connected`                                                  |
| Active account                     | Lifetime shows `Aktif sejak X`                                                                |
| `DISCONNECTED` without `CONNECTED` | Store as orphan debug event only if needed, with `metadata.orphan = true`                     |
| Suspended while connected          | Log `SUSPENDED`; system should then disconnect or block usage based on suspend policy         |

---

## 12. Acceptance Criteria

| ID    | Acceptance Criteria                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| AC-01 | Creating account channel stores one `CREATED` event with correct tenant and actor                            |
| AC-02 | Calling `InitInstance()` stores one `INIT` event without blocking init flow                                  |
| AC-03 | QR generation alone does not store `SCAN`                                                                    |
| AC-04 | Confirmed QR scan/auth success stores `SCAN` if the backend signal exists                                    |
| AC-05 | Baileys `connection = open` stores `CONNECTED` with active `connectionSessionId`                             |
| AC-06 | Baileys `connection = close` stores `DISCONNECTED` with reason and same `connectionSessionId` when available |
| AC-07 | `DISCONNECTED` event stores `durationMs` when paired with active `CONNECTED`                                 |
| AC-08 | Repeated disconnect events within dedup window create only one visible `DISCONNECTED` log                    |
| AC-09 | Event consumer retry does not duplicate logs                                                                 |
| AC-10 | Admin can view account event log sorted by `occurredAt desc`                                                 |
| AC-11 | Supervisor cannot view logs outside team scope                                                               |
| AC-12 | Agent receives 403 from endpoint and does not see log tab                                                    |
| AC-13 | Active connected account shows active lifetime from last `CONNECTED` to now                                  |
| AC-14 | Disconnected account shows completed session lifetime from `CONNECTED` to `DISCONNECTED`                     |
| AC-15 | Event filters by type and date range return correct scoped results                                           |
| AC-16 | `reasonDetail` is sanitized and does not expose sensitive data                                               |
| AC-17 | Feature can be disabled by feature flag without breaking existing account channel flow                       |

---

## 13. Test Strategy

### 13.1 Functional Tests

| ID          | Scenario                                            | Priority            |
| ----------- | --------------------------------------------------- | ------------------- |
| TC-ACEL-001 | Create account emits `CREATED`                      | P0                  |
| TC-ACEL-002 | Init instance emits `INIT`                          | P0                  |
| TC-ACEL-003 | QR generation does not emit `SCAN`                  | P0                  |
| TC-ACEL-004 | Pairing/auth success emits `SCAN`                   | P0 if signal exists |
| TC-ACEL-005 | Baileys open emits `CONNECTED`                      | P0                  |
| TC-ACEL-006 | Baileys close emits `DISCONNECTED` with reason      | P0                  |
| TC-ACEL-007 | Active lifetime uses now minus last connected       | P1                  |
| TC-ACEL-008 | Completed lifetime uses connected to disconnected   | P1                  |
| TC-ACEL-009 | Multiple sessions total lifetime is sum of sessions | P1                  |
| TC-ACEL-010 | Filter event log by type and date                   | P2                  |

### 13.2 Negative And Security Tests

| ID         | Scenario                                       | Expected                   |
| ---------- | ---------------------------------------------- | -------------------------- |
| TC-SEC-001 | Agent calls event log endpoint                 | 403                        |
| TC-SEC-002 | Supervisor accesses account outside team scope | 403 or empty scoped result |
| TC-SEC-003 | Cross-tenant account channel id                | No data leak               |
| TC-SEC-004 | Raw Baileys stack trace in reason detail       | Sanitized before save      |

### 13.3 Concurrency Tests

| ID         | Scenario                              | Expected                                               |
| ---------- | ------------------------------------- | ------------------------------------------------------ |
| TC-CON-001 | Repeated close event within 5 seconds | One `DISCONNECTED` log                                 |
| TC-CON-002 | RabbitMQ consumer retry same payload  | One stored log                                         |
| TC-CON-003 | Open, close, open quickly             | Correct session boundaries by `connectionSessionId`    |
| TC-CON-004 | Two admin tabs call init              | Two `INIT` logs acceptable, no broken connection state |

### 13.4 Regression Tests

| Area                       | Regression Check                                              |
| -------------------------- | ------------------------------------------------------------- |
| `createAccountChannel()`   | Existing create flow still succeeds if event emit fails       |
| `InitInstance()`           | Existing QR/connect flow still succeeds if event emit fails   |
| Baileys connection handler | Auto-restore and reconnect behavior unchanged                 |
| Audit service              | Existing audit features unaffected                            |
| FE WA Web settings         | Existing connection status, account table, QR modal unchanged |

### 13.5 Smoke Test

| Step              | Expected                                        |
| ----------------- | ----------------------------------------------- |
| Create account    | `CREATED` visible in log                        |
| Init and connect  | `INIT`, optional `SCAN`, `CONNECTED` visible    |
| Disconnect/logout | `DISCONNECTED` visible with reason and lifetime |
| Query via REST    | Response 200 with paginated data                |

---

## 14. Impact Analysis

| Module             | Change                                           | Impact |
| ------------------ | ------------------------------------------------ | ------ |
| `channel-service`  | Emit `CREATED`, `SUSPENDED`                      | Medium |
| `whatsapp` service | Emit `INIT`, `SCAN`, `CONNECTED`, `DISCONNECTED` | High   |
| `audit-service`    | New module, schema, consumer, gRPC service       | High   |
| `api-gateway`      | New REST endpoints and RBAC guard                | Medium |
| `libs/common`      | New enums and RMQ pattern                        | Low    |
| FE WA Web settings | New log tab and services                         | Medium |
| Redis              | Deduplication key for reconnect loop             | Low    |

High-risk area: `whatsapp` service connection handler. Changes must be additive and must not alter Baileys behavior.

---

## 15. Production Safety

### 15.1 Feature Flag

Use env flag:

```text
ENABLE_ACCOUNT_CHANNEL_EVENT_LOG=false
```

Behavior:

| Flag    | Behavior                                                 |
| ------- | -------------------------------------------------------- |
| `false` | Producers skip emit; UI can hide tab or show empty state |
| `true`  | Producers emit lifecycle events                          |

### 15.2 Staged Rollout

| Step | Action                                                                 |
| ---- | ---------------------------------------------------------------------- |
| 1    | Deploy audit-service consumer and schema                               |
| 2    | Deploy api-gateway endpoints                                           |
| 3    | Deploy FE log tab behind permission/flag                               |
| 4    | Deploy producers in channel-service and whatsapp-service with flag off |
| 5    | Enable flag in staging                                                 |
| 6    | Validate smoke test and reconnect loop behavior                        |
| 7    | Enable flag in production for limited tenant if supported              |
| 8    | Monitor queue depth, write latency, and service errors                 |

### 15.3 Rollback

| Rollback Action      | Effect                                       |
| -------------------- | -------------------------------------------- |
| Disable feature flag | Stop new event emission                      |
| Disable FE tab       | Hide feature from users                      |
| Stop audit consumer  | Main account channel flow remains unaffected |
| Revert producer code | No data migration required                   |

No existing schema is changed, so rollback is low risk.

### 15.4 Monitoring

| Metric                                           | Threshold                        |
| ------------------------------------------------ | -------------------------------- |
| RabbitMQ queue depth `account-channel.event.log` | Alert if greater than 1000       |
| Audit consumer error rate                        | Alert if greater than 1 percent  |
| Event log write latency                          | Alert if p99 greater than 2s     |
| GET `/event-logs` latency                        | Alert if p95 greater than 500ms  |
| Duplicate event skipped count                    | Monitor for reconnect loop noise |

---

## 16. Implementation Checklist

### Backend

| Item                                                        | Status           |
| ----------------------------------------------------------- | ---------------- |
| Add `AccountChannelEventTypeEnum`                           | Todo             |
| Add `AccountChannelEventStatusEnum`                         | Todo             |
| Add `AccountChannelDisconnectReasonEnum`                    | Todo             |
| Add `ACCOUNT_CHANNEL_EVENT_LOG` pattern                     | Todo             |
| Add event schema and repository in audit-service            | Todo             |
| Add RabbitMQ consumer in audit-service                      | Todo             |
| Add idempotent insert by `idempotencyKey`                   | Todo             |
| Add gRPC service in `proto/audit.proto`                     | Todo             |
| Add API Gateway endpoints                                   | Todo             |
| Add RBAC and tenant guard                                   | Todo             |
| Emit `CREATED` from channel-service                         | Todo             |
| Confirm and emit `SUSPENDED` from channel-service           | Blocked by OQ-01 |
| Emit `INIT` from whatsapp-service                           | Todo             |
| Identify and emit `SCAN` source                             | Blocked by OQ-03 |
| Emit `CONNECTED` and `DISCONNECTED` from connection handler | Todo             |
| Add Redis deduplication for repeated disconnect             | Todo             |
| Sanitize `reasonDetail`                                     | Todo             |
| Add indexes before production enablement                    | Todo             |
| Decide and configure TTL                                    | Blocked by OQ-02 |

### Frontend

| Item                                                       | Status |
| ---------------------------------------------------------- | ------ |
| Add event log types                                        | Todo   |
| Add `useGetAccountChannelEventLogs`                        | Todo   |
| Add `useGetAccountChannelLifetime`                         | Todo   |
| Add `AccountChannelEventLogTab`                            | Todo   |
| Add `AccountChannelEventLogItem`                           | Todo   |
| Add `AccountChannelLifetimeBadge`                          | Todo   |
| Add event type and date filters                            | Todo   |
| Add permission-driven visibility                           | Todo   |
| Add React Query polling/refetch while tab open             | Todo   |
| Optionally invalidate on existing connection status socket | Todo   |

---

## 17. Open Questions

| ID    | Question                                                  | Impact                                       | Owner            |
| ----- | --------------------------------------------------------- | -------------------------------------------- | ---------------- |
| OQ-01 | Does `suspendAccountChannel` already exist?               | May add backend scope                        | Engineering      |
| OQ-02 | What is final retention policy?                           | Determines TTL index and compliance behavior | PM / Legal       |
| OQ-03 | What exact Baileys signal proves QR was scanned?          | Determines `SCAN` correctness                | Engineering      |
| OQ-04 | Should lifetime display per-session, total, or both?      | Affects UI and API response                  | PM               |
| OQ-05 | Is export CSV/XLSX needed in Phase 1?                     | Adds backend/FE effort                       | PM               |
| OQ-06 | Should disconnected/suspended trigger notification?       | Adds notification-service dependency         | PM               |
| OQ-07 | Should event taxonomy support non-WA channels in Phase 2? | Affects generic naming and schema            | PM / Engineering |
| OQ-08 | Should `SCAN` become `PAIRED` when Pairing Code exists?   | Affects future enum design                   | PM / Engineering |

---

## 18. Final Recommendation

Use this as the final PRD baseline.

Implementation can start after these decisions:

| Decision                        | Required Before                      |
| ------------------------------- | ------------------------------------ |
| `SUSPENDED` action availability | Sprint commitment                    |
| Retention policy                | Production enablement                |
| `SCAN` technical source         | Backend implementation of scan event |

Recommended Phase 1 scope:

| Included                       | Excluded                        |
| ------------------------------ | ------------------------------- |
| Per-account event log timeline | Global event log page           |
| Lifetime per account           | Export CSV/XLSX                 |
| Audit-service storage          | Analytics dashboard             |
| React Query fetch/polling      | Dedicated realtime event socket |
| RBAC and tenant guard          | Notification triggers           |
