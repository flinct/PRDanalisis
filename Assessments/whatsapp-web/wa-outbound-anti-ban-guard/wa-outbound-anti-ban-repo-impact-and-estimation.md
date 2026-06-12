# WA Outbound Anti-Ban Guard — Repo Impact & Development Estimation

> **Dibuat:** 2026-06-11
> **Diperbarui:** 2026-06-12 — diselaraskan dengan arsitektur terbaru (BE-driven, no tenant-facing settings page, localized Baileys sender-level queue, permission-based log access)
> **Berdasarkan:** QA Assessment v1.2 (2026-06-12) + Gap Review terbaru + PRD WA Web Outbound Anti-Ban Guard v0.3 + Technical Analysis Per-Sender Outbound Throttle
> **Status PRD saat ini:** `REVISE_PRD` (NO_GO) — 8 open questions / design locks masih blocking
> **Audience:** PM, Engineering Lead, QA Lead

---

## 1. Recap Status PRD

| Item         | Status                                                                                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Decision     | `REVISE_PRD` (NO_GO)                                                                                                                                                                      |
| Kompleksitas | High                                                                                                                                                                                      |
| Risk         | High                                                                                                                                                                                      |
| OQ / Locks   | 8 item (normalisasi fingerprint, collision precedence, sender queue key + gap semantics, FE evidence precedence, in-flight safe mode, health-state signal owner, queue overflow/retry semantics, permission gate) |

**PRD belum aman untuk masuk implementasi final.** Semua estimasi di bawah berlaku setelah OQ dan design locks dikunci.

---

## 2. Prinsip Arsitektur Terbaru

Sebelum estimasi, penting untuk memahami perubahan arah arsitektur yang memengaruhi scope dan impact:

| No | Prinsip | Implikasi ke Estimasi |
| -- | ------- | -------------------- |
| 1 | Tidak ada tenant-facing anti-ban settings page. Policy dikelola melalui **internal backend config / feature flag**. | BE tidak perlu membangun `PATCH /api/wa/outbound/anti-ban/settings` CRUD; FE tidak perlu membuat `AntiBanSettingsPage`. |
| 2 | Sender-level outbound serialization dilakukan di **localized queue dalam `whatsapp` / BaileysService** (single-instance assumption). | Tidak perlu distributed Redis token bucket atau anti-ban service terpisah untuk pacing. Cukup `OutboundSendQueue` class dalam `whatsapp` service. |
| 3 | FE boleh mengirim **behavioral context** (`pasteDetected`, `sourceMessageAction`, `sourceMessageOrigin`, `sendFromCopiedMessage`), tapi keputusan tetap di BE. | FE tidak perlu service hooks settings CRUD; yang perlu adalah payload enrichment dan socket listener. |
| 4 | Log access menggunakan **permission-based gating**, bukan role bernama Supervisor. | Tidak perlu membuat permission/role khusus, tapi perlu verifikasi gate di API. |
| 5 | Sender safe mode dan restriction signal dikelola sebagai **backend event/kondisi internal**, bukan admin-toggle dari dashboard. | Tidak perlu settings form untuk safe mode. Cukup event emission + state machine di `whatsapp` service. |

**Kesimpulan:** Estimasi sebelumnya (v1.0) sekitar ~144 SP (82 BE + 39 FE + 23 QA) dengan 4 sprint adalah **over-estimate** untuk arsitektur sekarang. Estimasi revisi di bawah ini lebih realistis untuk scope actual.

---

## 3. Impact ke Repo BE (`omnichannel-satuinbox-be`)

### 3.1 Services yang Terdampak Langsung

| Service                | DB                       | Port     | Perubahan                                                                                                                                                                       |
| ---------------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `whatsapp`             | `satuinbox_whatsapp`     | `:50059` | **(1) Komponen baru utama:** `OutboundSendQueue` per `BaileysService` instance untuk sender-level serialization. **(2)** Tambah `antiBanSafeMode` di account state. **(3)** Emit `wa.sender.safe_mode.changed`. **(4)** Integrate protected resend guard ke send path. |
| `broadcast-service`    | `satuinbox_broadcast`    | `:50065` | Wrap dispatch flow dengan pre-send validation contract. Handle `DUPLICATE_SUPPRESSED`, `MANUAL_BROADCAST_RESEND_BLOCKED`, `COOLDOWN_ACTIVE` response. Integrate recipient-level lock sebelum dispatch worker. |
| `conversation-service` | `satuinbox_conversation` | `:50055` | Wrap manual outbound send dengan pre-send validation. Inject classifier evaluasi (protected broadcast resend atau normal) sebelum WA dispatch. Kirim behavioral context dari FE jika tersedia. |
| `api-gateway`          | —                        | `:3000`  | 2 endpoint baru: `POST /api/wa/outbound/validate` (internal pre-send), `GET /api/wa/outbound/anti-ban/logs` (permission-gated). RBAC guard per endpoint. **Tidak ada endpoint settings CRUD.** |

### 3.2 Komponen Baru di BE

#### A. Sender-Level Outbound Queue (komponen baru paling penting)

**Lokasi:** `backend/apps/whatsapp/src/app/services/outbound-send-queue.ts`

Satu `OutboundSendQueue` per `BaileysService` instance. Karena satu instance = satu sender (single-instance assumption), queue ini alami per-sender.

```
apps/whatsapp/src/app/services/
  outbound-send-queue.ts            ← Baru. Priority queue (UI HIGH, broadcast LOW) dengan min-gap 3–8s + jitter.
  outbound-send-queue.spec.ts       ← Baru. Unit test queue behavior.
```

**Konstanta** (env-configurable, bukan tenant dashboard):
- `WHATSAPP_OUTBOUND_MIN_GAP_MS` (default: 3000)
- `WHATSAPP_OUTBOUND_MAX_GAP_MS` (default: 8000)
- `WHATSAPP_OUTBOUND_LOW_PRIORITY_MAX_QUEUE` (default: 10000)

Dicatat di `backend/.env.example`.

#### B. Protected Resend Classifier (shared di `libs/`)

**Lokasi:** `libs/anti-ban/`

Berbeda dari desain v1.0 yang menyarankan 7+ service file besar, versi ini jauh lebih ramping karena fokus ke business guard, bukan operator risk scoring generik.

```
libs/
  anti-ban/
    services/
      anti-ban-evaluator.service.ts     ← Core: idempotency check + content matching + broadcast state lookup
      recipient-lock.service.ts         ← Redis in-flight lock per recipient
      audit-log.service.ts              ← MongoDB audit persistence
      reconciliation.service.ts         ← Unknown-state resolution flow
    schemas/
      wa-outbound-attempt.schema.ts     ← Idempotency key, state, retry, reconciliation status
      wa-anti-ban-audit-log.schema.ts   ← actor, reasonCode, dispatchCorrelationId, relatedBroadcastReference
    interfaces/
      anti-ban-evaluation-result.interface.ts
      anti-ban-reason-code.enum.ts      ← DUPLICATE_SUPPRESSED, LOCK_CONFLICT, MANUAL_BROADCAST_RESEND_BLOCKED, etc.
      outbound-attempt-state.enum.ts
```

**Yang dihilangkan dari desain v1.0:**
- ~~`wa-anti-ban-config.schema.ts`~~ — tidak ada tenant settings collection; pakai internal config / env
- ~~`risk-score.service.ts`~~ — tidak ada rolling risk window generik; fokus ke protected resend classifier
- ~~`cooldown.service.ts`~~ — cooldown adalah bagian dari decision engine di evaluator, bukan service terpisah
- ~~`idempotency.service.ts`~~ — digabung ke evaluator

#### C. Tidak perlu dedicated anti-ban service terpisah

Karena:
1. Queue ada di `whatsapp` service
2. Evaluator cukup sebagai shared lib
3. Audit bisa ditulis langsung dari lib ke MongoDB
4. Redis state minimal (dedupe + lock + sender safe-mode)

→ **Tidak ada `apps/anti-ban-service/` baru.**

### 3.3 Schema Baru (MongoDB)

| Schema              | Collection               | Keterangan                                                                                                                  |
| ------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `WaOutboundAttempt` | `wa_outbound_attempts`   | Idempotency key, state, retry count, reconciliation status, sender, recipient fingerprint, content fingerprint, dispatchCorrelationId, relatedBroadcastReference, classifier result, FE context |
| `WaAntiBanAuditLog` | `wa_anti_ban_audit_logs` | actor, senderAccountId, recipientFingerprint (masked), contentFingerprint, dispatchSource, classifier result, action, reasonCode, timestamp, attemptId, dispatchCorrelationId |

**Yang dihilangkan dari desain v1.0:**
- ~~`WaAntiBanConfig`~~ — tidak ada collection settings tenant; config via env/internal

**Schema perubahan pada existing:**

- `AccountChannel` schema (di `whatsapp` / `channel-service`): tambah field `antiBanSafeMode: 'NORMAL' | 'SAFE_MODE' | 'RESTRICTED'`, `safeModeEnteredAt`, `safeModeExpiresAt`

### 3.4 Redis Keys Baru

| Key Pattern                              | TTL                     | Fungsi                   | Catatan |
| ---------------------------------------- | ----------------------- | ------------------------ | ------- |
| `anti-ban:idem:{tenantId}:{hash}`        | = `dedupeWindowSeconds` | Dedupe key store         | Dipertahankan |
| `anti-ban:lock:{tenantId}:{recipientId}` | = send timeout          | Recipient in-flight lock | Dipertahankan |
| `anti-ban:sender:{tenantId}:{accountId}` | = `safeModeSeconds`     | Sender safe mode state   | Dipertahankan |

**Yang dihilangkan dari desain v1.0:**
- ~~`anti-ban:cooldown:*`~~ — cooldown ada di decision engine evaluator, tidak perlu Redis terpisah
- ~~`anti-ban:risk:*`~~ — tidak ada rolling risk window generik

### 3.5 RabbitMQ Patterns Baru

| Pattern                              | Producer                    | Consumer               | Fungsi                  |
| ------------------------------------ | --------------------------- | ---------------------- | ----------------------- |
| `wa.outbound.validation.result`      | anti-ban module             | worker / logging       | Hasil evaluasi pre-send |
| `wa.sender.safe_mode.changed`        | whatsapp service            | FE via socket, logging | Account state change    |
| `wa.outbound.reconciliation.updated` | worker / reconciliation svc | logging / support      | Status resolution       |
| `wa.outbound.duplicate.suppressed`   | anti-ban module             | audit                  | Duplicate event         |
| `wa.outbound.manual_resend.blocked`  | anti-ban module             | audit                  | Protected resend block  |

> Semua pattern baru harus didaftarkan ke `EventTypeEnum` / `MessageQueuePatterns` di `libs/common`. Jangan hardcode.

### 3.6 Proto Changes

**Hanya `proto/whatsapp.proto` yang disentuh** (bukan beberapa proto terpisah):

```
proto/whatsapp.proto:
  + rpc ValidateOutboundAttempt(ValidateOutboundRequest) returns (ValidateOutboundResponse)
  + message ValidateOutboundRequest { tenantId, outboundSource, senderAccountId, recipientId, contentFingerprint, actorId, optional behaviorContext }
  + message ValidateOutboundResponse { decision, reasonCode, cooldownSeconds, lockInfo }
  + message BehaviorContext { pasteDetected, sourceMessageAction, sourceMessageId, sourceMessageOrigin, sendFromCopiedMessage }
  + enum OutboundAttemptState { PENDING, VALIDATING, WARNED_RESEND, QUEUED_RESEND, BLOCKED_MANUAL_RESEND, LOCKED, SENT, SUPPRESSED_DUPLICATE, RECONCILIATION_PENDING, CONFIRMED_SENT, FAILED_FINAL }
  + enum AntiBanReasonCode { DUPLICATE_SUPPRESSED, LOCK_CONFLICT, MANUAL_BROADCAST_RESEND_BLOCKED, RECONCILIATION_PENDING, ACCOUNT_SAFE_MODE, ACCOUNT_INELIGIBLE, COOLDOWN_ACTIVE }
```

**Yang dihilangkan dari desain v1.0:**
- ~~`rpc GetAntiBanConfig`~~ — tidak ada settings CRUD
- ~~`rpc UpdateAntiBanConfig`~~ — tidak ada settings CRUD
- ~~`PASTE_RISK`, `BURST_RISK`~~ — tidak ada generic risk reason code

> Setelah edit proto → wajib `npm run generate-proto-types` → update `PROTO` + `GRPC_ENV` constants.

---

## 4. Impact ke Repo FE (`omnichannel-satuinbox-fe`)

### 4.1 Pages / Features yang Terdampak

| Area                       | File/Component                 | Perubahan                                                                                                                                                    |
| -------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Conversation Room          | `ConversationChatRoom`         | **(1)** Send button: loading/disabled state during pending. **(2)** Inline warning toast untuk delay/block (Bahasa Indonesia). **(3)** Socket listener untuk anti-ban state. **(4)** Payload enrichment: lampirkan `behaviorContext` jika tersedia (`pasteDetected`, `sourceMessageAction`, `sendFromCopiedMessage`). |
| Broadcast                  | Broadcast send flow            | Pre-dispatch validation before campaign starts; handle response `MANUAL_BROADCAST_RESEND_BLOCKED` / `DUPLICATE_SUPPRESSED` sebelum queue. |
| Settings > WA Web          | `ManageWhatsappWebSettingPage` | Account detail: show `antiBanSafeMode` state dan badge indicator untuk RESTRICTED / SAFE_MODE. |
| Audit Log (baru)           | `AntiBanAuditLogPage`          | Table: actor, sender, recipientFingerprint (masked), action, reasonCode, dispatchSource, dispatchCorrelationId, timestamp. Filter: time range, account, actor, result. **Permission-gated:** hanya user yang diizinkan. |

**Yang dihilangkan dari desain v1.0:**
- ~~`AntiBanSettingsPage` (baru)~~ — tidak ada halaman settings separate; policy via backend internal config
- ~~Form antiBanMode dropdown, dedupeWindowSeconds, cooldown, thresholds, pasteRiskEnabled toggle~~ — tidak diperlukan di FE

### 4.2 Service Hooks Baru (di `services/`)

```
services/anti-ban/
  useGetAntiBanAuditLogs.service.ts     ← Query audit logs (permission-gated)
  useValidateOutboundAttempt.service.ts  ← Dipanggil sebelum send
```

**Yang dihilangkan dari desain v1.0:**
- ~~`useGetAntiBanSettings.service.ts`~~ — tidak ada settings page
- ~~`useUpdateAntiBanSettings.service.ts`~~ — tidak ada settings page

### 4.3 Zustand Store

- Extend `whatsappWeb.store.ts`: tambah `senderSafeModeState: Record<accountId, 'NORMAL' | 'SAFE_MODE' | 'RESTRICTED'>`

### 4.4 Shared Types (di `@satuinbox/types` atau `packages/types/`)

```typescript
enum OutboundAttemptState { PENDING, VALIDATING, WARNED_RESEND, QUEUED_RESEND, BLOCKED_MANUAL_RESEND, LOCKED, SENT, SUPPRESSED_DUPLICATE, RECONCILIATION_PENDING, CONFIRMED_SENT, FAILED_FINAL }
enum AntiBanReasonCode { DUPLICATE_SUPPRESSED, LOCK_CONFLICT, MANUAL_BROADCAST_RESEND_BLOCKED, RECONCILIATION_PENDING, ACCOUNT_SAFE_MODE, ACCOUNT_INELIGIBLE, COOLDOWN_ACTIVE }
enum ReconciliationStatus { NONE, RECONCILIATION_PENDING, CONFIRMED_SENT, CONFIRMED_FAILED, UNRESOLVED_TIMEOUT }
enum ClassifierResult { NORMAL_MANUAL_SEND, COPY_PASTE_BROADCAST_CONFIRMED, MANUAL_BROADCAST_RESEND_MATCHED, MANUAL_BROADCAST_RESEND_SUSPECTED, SYSTEM_BROADCAST_SEND }
interface BehaviorContext { pasteDetected, sourceMessageAction, sourceMessageId, sourceMessageOrigin, sendFromCopiedMessage }
interface AntiBanAuditLogEntry { actor, senderAccountId, recipientFingerprint, classifierResult, reasonCode, action, dispatchCorrelationId, relatedBroadcastReference, timestamp }
```

### 4.5 Socket Events Baru

Tambah di `ChannelSocketProvider` (Settings WA Web):
- `wa.sender.safe_mode.changed` → update `senderSafeModeState` di store → update badge di account list

Tambah di `SocketProvider` (Conversation):
- `wa.outbound.validation.result` → update send button state, tampilkan warning jika delay/block

---

## 5. Blast Radius Summary

| Area                            | Scope                                                           | Severity   |
| ------------------------------- | --------------------------------------------------------------- | ---------- |
| `whatsapp` service BE           | **Komponen utama:** `OutboundSendQueue` + safe mode state machine + send path wrap | **HIGH**   |
| `broadcast-service` BE          | Dispatch flow wrap + worker integration                         | HIGH       |
| `conversation-service` BE       | Manual send path wrap + behavioral context forwarding           | MEDIUM     |
| `api-gateway`                   | 2 new endpoints + RBAC permission guards (validate + audit log) | MEDIUM     |
| `libs/anti-ban/` (shared)       | Protected resend classifier + recipient lock + audit persistence + reconciliation | HIGH       |
| Redis (new key namespaces)      | 3 namespaces (idem, lock, sender safe mode)                     | MEDIUM     |
| MongoDB (new collections)       | 2 new schemas (`wa_outbound_attempts`, `wa_anti_ban_audit_logs`) | MEDIUM     |
| Proto / gRPC contract           | New RPC `ValidateOutboundAttempt` + messages                    | MEDIUM     |
| RabbitMQ patterns               | 5 new patterns di EventTypeEnum                                 | LOW-MEDIUM |
| FE Conversation Room            | Send button + warning + behavioral context enrichment + socket listener | MEDIUM |
| FE Settings WA Web              | Account state display (safe mode badge)                         | LOW        |
| FE Audit Log (new page)         | Full new page (table + filter + permission gate)                | MEDIUM     |
| FE Broadcast flow               | Pre-dispatch validation                                         | LOW-MEDIUM |
| FE Shared types                 | New enums + interfaces                                          | LOW        |

---

## 6. Simulasi Estimasi Pengerjaan

> **Asumsi tim:** 2 BE engineer, 1 FE engineer, 1 QA engineer
> **Sprint duration:** 2 minggu (10 hari kerja)
> **Story Points:** Fibonacci scale. 1 SP ≈ 1 hari kerja 1 orang (untuk BE/FE mid-senior)

### 6.1 Story Point Breakdown

#### Backend

| Task                                                            | SP  | Notes                                                                   |
| --------------------------------------------------------------- | --- | ----------------------------------------------------------------------- |
| **OutboundSendQueue** — priority queue + min-gap + jitter di `whatsapp` service | 5   | Class + wire ke `BaileysService` + `dispose()` + env config |
| **OutboundSendQueue unit tests** — gap, preemption, overflow, dispose, error propagation | 3   | Jest, stubbed timer |
| Idempotency key + dedupe logic di evaluator | 3   | Redis TTL-based, merged ke evaluator |
| Recipient in-flight lock (Redis) | 3   | Acquire/release/TTL/stale recovery |
| Audit log schema + persistence service | 5   | MongoDB schema + write path from evaluator |
| Protected resend classifier (`anti-ban-evaluator.service.ts`) | 8   | Core pipeline: idem check → broadcast context lookup → content match → FE evidence precedence → classify → decision |
| Reconciliation state machine | 8   | RECONCILIATION_PENDING → CONFIRMED_SENT/FAILED/TIMEOUT |
| Sender safe mode state + event emission | 5   | Down dari 8 SP (tidak ada settings integrasi, murni state + event) |
| Integration: `whatsapp` service — wire queue + evaluator ke send path | 5   | Wrap `sendMessage` / `sendBroadcastMessage` melalui queue + evaluator |
| Integration: `broadcast-service` dispatch | 8   | Worker-level integration, recipient lock sebelum dispatch |
| Integration: `conversation-service` manual send | 5   | Room send hook ke evaluator + behavioral context forwarding |
| Proto + RabbitMQ event patterns | 3   | 1 new RPC (`ValidateOutboundAttempt`) + 5 event patterns di EventTypeEnum |
| Audit log query endpoint (`GET /api/wa/outbound/anti-ban/logs`) | 3   | Permission-gated, pagination + filter |
| Safe fallback + config validation | 2   | Env/internal config validation, no tenant settings CRUD |
| Observability setup (queue depth, overflow, inter-send gap, wait time) | 3   | Metric/log emission dari queue dan evaluator |

**Total BE: ~64 SP** (turun dari ~82 SP karena tidak ada settings CRUD, tidak ada risk scoring, tidak ada cooldown service terpisah)

#### Frontend

| Task                                                    | SP  | Notes                                                                  |
| ------------------------------------------------------- | --- | ---------------------------------------------------------------------- |
| Shared types (enums + interfaces di `@satuinbox/types`) | 2   | AntiBanReasonCode, OutboundAttemptState, ReconciliationStatus, ClassifierResult, BehaviorContext |
| Zustand store extension (whatsappWeb.store.ts)          | 2   | senderSafeModeState tracking |
| Service hooks (2 hooks)                                 | 3   | useGetAntiBanAuditLogs + useValidateOutboundAttempt |
| Conversation Room send button + warning                 | 5   | Disable pending + send button retry prevention; inline warning/delay/block feedback; behavioral context enrichment |
| Audit log table page (baru)                             | 8   | Table + filter + permission gate + detail row + masking |
| Account detail safe mode badge                          | 3   | Tambah ke WhatsApp Web settings |
| Broadcast pre-dispatch validation UI                    | 3   | Pre-start validation flow |
| Socket events handling (2 baru)                         | 3   | wa.sender.safe_mode.changed + wa.outbound.validation.result |

**Total FE: ~29 SP** (turun dari ~39 SP karena tidak ada Anti-Ban Settings page dan hooks settings)

#### QA

| Task                                                               | SP  | Notes                                                  |
| ------------------------------------------------------------------ | --- | ------------------------------------------------------ |
| Functional test execution (mengikuti test spec v1.3)               | 5   | Termasuk protected resend guard, trace visibility, RBAC |
| Sender queue behavior validation (unit + integration)              | 5   | Gap, preemption, overflow, dispose — harness/backend lane |
| Concurrency + worker-level scenarios                               | 8   | Perlu injeksi worker-level, tidak bisa Playwright saja |
| UAT scenarios (operator warning flow, IT Support dashboard review) | 5   | End-to-end business validation |
| Bug fix regression cycle                                           | 5   | Estimasi 1 cycle post-QA |

**Total QA: ~28 SP** (naik sedikit dari 23 SP karena tambahan sender queue behavior validation)

### 6.2 Sprint Plan (2 Engineers BE + 1 FE + 1 QA)

Kapasitas per sprint:
- 2 BE × 10 hari × 1 SP/hari = **20 SP BE / sprint**
- 1 FE × 10 hari × 1 SP/hari = **10 SP FE / sprint**
- QA: mulai overlap sprint 2-3

---

**Pra-Sprint: Design Lock Workshop (2-3 hari)**

- Lock 8 design decisions:
  1. canonical fingerprint normalization
  2. collision precedence manual vs broadcast
  3. sender queue throttle key identity
  4. gap semantics (effective vs additive)
  5. FE evidence precedence dan fallback
  6. in-flight safe mode behavior
  7. restriction signal source owner
  8. queue overflow / retry / observability contract
- Output: design decision dokumen untuk PRD + implementasi rujukan

---

**Sprint 1 (2 minggu) — BE Foundation + Queue**

| Engineer | Tasks                                                                                         | SP  |
| -------- | --------------------------------------------------------------------------------------------- | --- |
| BE-1     | `OutboundSendQueue` class + unit tests; wire ke `BaileysService`; env config + constants      | 11  |
| BE-2     | Idempotency + dedupe logic; recipient lock (Redis); audit schema + persistence                | 11  |
| FE-1     | Shared types + enums; Zustand extension; service hooks (2 hooks)                              | 7   |

Sprint 1 Total: ~29 SP (BE: 22, FE: 7)
Accumulated BE: 22/64 | FE: 7/29

---

**Sprint 2 (2 minggu) — BE Core Logic + FE Conversation Room**

| Engineer | Tasks                                                                   | SP                         |
| -------- | ----------------------------------------------------------------------- | -------------------------- |
| BE-1     | Protected resend classifier (`anti-ban-evaluator.service.ts`)           | 8                          |
| BE-1     | Reconciliation state machine                                            | 8                          |
| BE-2     | Sender safe mode state + event emission                                 | 5                          |
| BE-2     | Integration: `broadcast-service` dispatch                               | 8                          |
| FE-1     | Conversation Room send button + warning + behavioral context enrichment | 5                          |
| QA       | Mulai: test spec review + siapkan test data + queue unit test review    | 3                          |

Sprint 2 Total: ~37 SP (BE: 29, FE: 5, QA: 3)
Accumulated BE: 51/64 | FE: 12/29

---

**Sprint 3 (2 minggu) — Integration + FE Features**

| Engineer | Tasks                                                                                                                 | SP                        |
| -------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| BE-1     | Integration: `whatsapp` service send path wrap (5); proto + RabbitMQ patterns (3)                                     | 8                         |
| BE-2     | Integration: `conversation-service` manual send (5); audit log query endpoint (3); safe fallback config (2)           | 10                        |
| FE-1     | Audit log table page (8); Account safe mode badge (3)                                                                 | 11                        |
| QA       | Func test execution (partial); sender queue harness validation                                                        | 8                         |

Sprint 3 Total: ~37 SP (BE: 18, FE: 11, QA: 8)
Accumulated BE: 69/64 ✅ (sedikit overflow dari safe fallback + edge cases, manageable) | FE: 23/29

---

**Sprint 4 (1.5 minggu) — FE Finish + QA Execution**

| Engineer | Tasks                                                                                    | SP  |
| -------- | ---------------------------------------------------------------------------------------- | --- |
| BE-1+2   | Observability setup (3); edge case fixes + code review (3)                               | 6   |
| FE-1     | Broadcast pre-dispatch UI (3); Socket events handling (3); detail polish                 | 6   |
| QA       | Concurrency + worker-level scenarios (8); UAT (5); bug fix cycle (5)                     | 18  |

Sprint 4 Total: ~30 SP
Accumulated: BE ~75 (target 64 + buffer) | FE 29/29 ✅ | QA 28/28 ✅

---

### 6.3 Timeline Summary

| Phase                              | Durasi          | Output                                                                |
| ---------------------------------- | --------------- | --------------------------------------------------------------------- |
| Pra-Sprint: Design Lock Workshop   | 2-3 hari        | 8 decision locks documented                                           |
| Sprint 1 — Queue + Foundation      | 2 minggu        | `OutboundSendQueue`, Redis services, schemas, shared types            |
| Sprint 2 — Core Logic              | 2 minggu        | Classifier, reconciliation, safe mode, broadcast integration          |
| Sprint 3 — Integration + FE        | 2 minggu        | Full BE integration, Audit log page, sender safe mode badge           |
| Sprint 4 — Finish + QA             | 1.5 minggu      | Observability, broadcast UI, QA execution, bug fixes                  |
| **Total**                          | **~7.5 minggu** | Feature ready for staging validation                                  |

> **Catatan:** Meskipun total timeline mirip dengan estimasi v1.0 (~7.5 minggu), **scope per sprint jauh lebih konkret** dan **tidak membuang waktu untuk settings CRUD, anti-ban service terpisah, atau risk scoring kompleks yang tidak diperlukan.** Real delivery risk lebih rendah.

---

### 6.4 Critical Path

```
Design Lock Workshop (2-3 hari)
  → BE: OutboundSendQueue (Sprint 1, BE-1) — BLOCKING untuk semua sender pacing
  → BE: Protected resend classifier (Sprint 2, BE-1) — BLOCKING untuk broadcast + conversation integration
  → BE: Integration broadcast-service (Sprint 2, BE-2) — BLOCKING untuk broadcast FE flow
  → FE: Service hooks + types (Sprint 1) — BLOCKING untuk semua FE pages
  → QA dapat mulai setelah Sprint 1 foundation dan Sprint 2 classifier siap
```

---

### 6.5 Risiko Estimasi

| Risiko                                                             | Probabilitas | Impact ke Timeline | Mitigasi |
| ------------------------------------------------------------------ | ------------ | ------------------ | -------- |
| Design lock workshop lebih dari 3 hari                             | Medium       | +3-5 hari          | Siapkan pre-read + decision matrix sebelum workshop |
| `OutboundSendQueue` perlu refaktor karena gap semantics vs presence simulation | Medium       | +2-3 hari BE       | Lock definisi gap di workshop, jangan spekulasikan saat coding |
| Sender key identity tidak 1:1 dengan `BaileysService` instance     | Low-Medium   | +3-5 hari BE       | Validasi `SessionService.sessions` mapping sebelum Sprint 1 |
| Integration broadcast-service complex karena worker pattern        | High         | +3-5 hari BE       | Mulai integration spike di akhir Sprint 1 |
| Restriction signal dari whatsapp service belum ada/butuh buat baru | High         | +3-5 hari BE       | Survey existing health signal sebelum Sprint 2; siapkan fallback safe mode trigger |
| Audit log page FE lebih kompleks dari estimasi (filter, masking, permission) | Medium       | +2-3 hari FE       | Mulai wireframe audit log di Sprint 1, jangan tunda ke Sprint 3 |

---

## 7. Perbandingan Estimasi v1.0 vs v2.0

| Aspek | v1.0 (lama) | v2.0 (revisi) | Alasan Perubahan |
| ----- | ----------- | ------------- | ---------------- |
| BE SP | ~82 SP | ~64 SP | Tidak ada settings CRUD, tidak ada risk scoring service, tidak ada anti-ban service terpisah |
| FE SP | ~39 SP | ~29 SP | Tidak ada Anti-Ban Settings page, hooks lebih sedikit |
| QA SP | ~23 SP | ~28 SP | Naik karena tambahan sender queue behavior validation |
| Total SP | ~144 SP | ~121 SP | Lebih compact, scope lebih konkret |
| Timeline | ~7.5 minggu | ~7.5 minggu | Sama secara durasi, tapi risiko delivery lebih rendah karena scope lebih fokus |
| Settings page | Ada (BE + FE) | Tidak ada | Diganti internal config / feature flag |
| Anti-ban service terpisah | Opsional | Tidak diperlukan | Queue di `whatsapp`, evaluator shared lib |
| Risk scoring | Rolling window + paste/burst | Tidak ada | Diganti protected resend classifier |
| Sender queue | Tidak ada | Ada — `OutboundSendQueue` | Temuan teknis baru yang kritis |

---

## 8. Rekomendasi Langkah Berikutnya

1. **Minggu ini:** Design lock workshop. Fokus pada 8 decision locks (normalisasi, precedence, sender queue key, gap semantics, FE evidence, in-flight safe mode, health signal owner, overflow/retry contract).
2. **Setelah workshop:** Mulai Sprint 1 dengan `OutboundSendQueue` sebagai deliverable pertama. Queue adalah **blocker untuk semua sender pacing ke depannya.**
3. **Parallel ke Sprint 1:** QA mulai persiapkan test data, test environment, dan review test spec v1.3. Validasi `SessionService.sessions` mapping untuk pastikan asumsi single-instance.
4. **Pertimbangkan:** Mulai dengan `monitor_only` mode untuk protected resend guard di Sprint 1-2. Sender-level queue bisa diaktifkan lebih awal karena purely internal dan tidak ada UI dependency.
5. **Jangan mulai** integration ke `broadcast-service` dan `conversation-service` sebelum classifier di Sprint 2 sudah proven.
6. **Jangan bangun** settings page, anti-ban service terpisah, atau risk scoring generik yang tidak diperlukan untuk Phase 1.

---

_Dibuat oleh: Agent — direvisi dari v1.0 (2026-06-11) ke v2.0 (2026-06-12) berdasarkan PRD v0.3 + QA Assessment v1.2 + Final Gap Review terbaru + Technical Analysis Per-Sender Outbound Throttle_
