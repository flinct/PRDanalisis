> **Assessment Type:** Type 1 — Feature Development Analysis
> **Source PRD / Source Input:** User request in chat — "adding channel shopee" (belum ada PRD formal)
> **Assessment Artifact Path:** `Assessments/cross-domain/shopee-channel-addon/shopee-channel-addon-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `WORKFLOW_CONTEXT.md`
> **Tanggal Analisa:** 2026-06-17
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Initial version.
- Fokus analisa: kesiapan tech stack SatuInbox saat ini untuk menambah channel Shopee sebagai add-on baru.
- Asumsi kerja: "channel Shopee" = integrasi messaging/customer chat marketplace ke inbox omnichannel, bukan full OMS / order management.

---

## 1. Overview

**Feature / Issue:**

Integrasi channel Shopee ke SatuInbox sebagai add-on channel baru agar percakapan buyer–seller bisa masuk ke unified inbox, diproses agent, dan ikut lifecycle conversation/ticket existing.

**Objective:**

Menentukan apa saja yang harus disiapkan dari stack saat ini sebelum development dimulai.

**Business Context:**

Stack saat ini sudah punya pola add-on channel dan multi-platform conversation:
- BE punya `Platform` / `Channel` / `AccountChannel` generic model.
- FE punya add-on settings flow dan routing umum ke `/settings/channels/addon`.
- Existing dedicated channel services sudah ada untuk `instagram`, `messenger`, `whatsapp-api`, `email`, dan `whatsapp`.
- Conversation/message model sudah menyimpan snapshot `platform`, `channel`, `accountChannel`, `externalMessageId`, dan `metaData`.

**Scope In:**
- Registrasi platform Shopee di layer platform/channel.
- Onboarding auth/credential/webhook Shopee.
- Inbound message sync Shopee → conversation/message/contact.
- Outbound reply dari inbox → Shopee.
- Status update, attachment handling, socket update, analytics by platform.
- FE settings add-on dan conversation capability adaptation.

**Scope Out:**
- Order management full sync.
- Refund / return / logistics workflow.
- Product catalog sync.
- Broadcast marketplace automation.
- Seller center reporting di luar conversation/ticket context.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Tech stack SatuInbox saat ini cukup modular untuk menambah channel Shopee, tetapi implementasi aman baru bisa dimulai setelah kontrak integrasi Shopee dikunci: auth model, webhook/event model, outbound permission, rate limit, identity model buyer, dan capability matrix media/status. Tanpa discovery ini, risiko redesign BE/FE sangat tinggi.

### 2.2 Required Actions Before Development

- [ ] Lakukan integration spike resmi: validasi API Shopee yang tersedia untuk chat, webhook, media, status, dan outbound reply.
- [ ] Lock scope Phase 1: chat only vs chat + order context.
- [ ] Tentukan identity strategy: buyer `referenceId`, `channelId`, store/account binding, dan aturan dedup contact lintas channel.
- [ ] Definisikan capability matrix Shopee: text, image, file, quoted reply, read status, delivery status, template, bot restriction, attachment size.
- [ ] Tentukan auth & secret lifecycle: OAuth/app key vs token/manual credential, refresh policy, webhook signature verification.
- [ ] Tentukan billing/add-on behavior: apakah Shopee dihitung per account, per store, atau per connected shop.
- [ ] Siapkan PRD formal sebelum build cross-team dimulai.

### 2.3 Key Blocking Reasons / Conditions

- Belum ada PRD formal.
- Belum tervalidasi surface integrasi Shopee resmi.
- Belum jelas apakah channel identity berbasis buyer chat ID, order ID, shop ID, atau kombinasi.
- Belum jelas apakah phase 1 hanya message inbox atau wajib tampilkan konteks order.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** Backend / API / Database / UI / RBAC / Reporting / Integration / Automation

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Shopee harus tampil sebagai platform/channel baru yang bisa diaktifkan tenant sebagai add-on. | Analisa stack existing add-on |
| BR-02 | Inbound chat Shopee harus membuat / me-resolve conversation existing di unified inbox. | Analisa conversation architecture |
| BR-03 | Agent harus bisa reply outbound dari conversation room ke Shopee bila capability channel mengizinkan. | Analisa conversation room existing |
| BR-04 | Identity buyer harus stabil per channel/account agar tidak membuat duplikasi contact liar. | Analisa people/contact schema |
| BR-05 | Status dan event message Shopee harus masuk ke realtime update dan analytics existing. | Analisa socket + analytics |
| BR-06 | Integrasi harus tenant-scoped dan mengikuti RBAC existing. | BE/FE architecture rules |
| BR-07 | Shopee harus masuk model billing add-on bila memang commercialized sebagai add-on. | Platform/account-channel/payment flow |
| BR-08 | Unsupported capability Shopee harus diproteksi di FE/BE, bukan diasumsikan sama dengan WhatsApp. | Capability matrix requirement |

### 3.2 Acceptance Criteria

- Platform Shopee bisa didaftarkan dan diaktifkan tenant dari flow add-on.
- Toko / account Shopee bisa terhubung dengan state connection yang jelas.
- Message inbound Shopee membuat atau mengupdate conversation existing tanpa duplikasi tidak terkendali.
- Agent bisa reply outbound sesuai limit/capability channel.
- Status event minimum: received, sent/accepted, failed; read/delivered jika API Shopee mendukung.
- Percakapan Shopee bisa difilter di inbox berdasarkan channel/platform.
- Analytics by platform dan SLA per channel tidak rusak setelah Shopee ditambahkan.

### 3.3 Assumptions

- Shopee menyediakan API resmi / partner API untuk messaging atau event yang legal dipakai tenant.
- Phase 1 fokus pada conversation inbox, bukan order management penuh.
- Shopee akan diperlakukan sebagai add-on platform, bukan core built-in seperti Widget/WA Web.

### 3.4 Clarifications Needed

- Auth model Shopee apa?
- Apakah satu tenant bisa connect banyak shop?
- Apakah satu buyer bisa punya banyak thread per order?
- Apakah order context wajib tampil di sidebar room?
- Apakah message edit/delete/status callbacks tersedia?
- Apakah attachment download/upload disediakan resmi?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

**Yang sudah reusable dari stack sekarang:**

1. **Platform/channel/add-on model sudah ada**
   - `Platform` punya `code`, `isAddOns`, `isBroadcast`, `billing`.
   - `Channel` merefer ke `Platform`.
   - `AccountChannel` merefer ke `Channel` dan menyimpan identity dasar seperti `name`, `phoneNumber`, `email`, `username`, `connectionStatus`, `totalOutbound`.

2. **Flow add-on billing sudah ada**
   - FE memakai `/payment/addons/activate`, `/platform`, `/channel`.
   - BE `createAccountChannel()` sudah memanggil `connectAddon()` ketika `platform.isAddOns = true`.

3. **Pattern per-platform service sudah matang**
   - Ada service terpisah untuk `instagram`, `messenger`, `whatsapp-api`, `email`, `whatsapp`.
   - Pattern existing mencakup webhook service, OAuth/auth flow, repository, schema, processor, sender/resolver.

4. **Conversation/message model sudah semi-generic**
   - `conversation` menyimpan snapshot `platform`, `channel`, `accountChannel`, `contactInfo`.
   - `message` menyimpan `externalMessageId`, `accountChannel`, `metaData`, `parentExternalMessageId`.
   - Sudah ada contoh extension platform-specific pada email (`subject`, `references`, `htmlContent`).

5. **FE sudah punya extension point platform-specific**
   - `platformBubbleRegistry` dan `platformInputRegistry` untuk bubble/input khusus per platform.
   - Default bubble/input tetap bisa dipakai bila Shopee hanya butuh text/media standar.

6. **People/contact model tidak murni phone-only di schema**
   - `ClientContact` unique index ada di `{ channelId, referenceId }`.
   - Ini cocok untuk social/marketplace buyer identity yang tidak selalu berbasis nomor telepon.

### 4.2 Proposed State (To-Be)

Tambahkan satu capability lane baru bernama **Shopee Channel** dengan pola berikut:

`Shopee API/Webhook` → `new shopee service` → `conversation-service / people-service / media-service / notification-service / analytics-service` → `api-gateway` → `FE settings + inbox + ticketing`

### 4.3 State Transition / Data Flow Notes

**Inbound:**
1. Shopee kirim webhook/event.
2. `shopee service` verifikasi signature + parse event.
3. Resolve tenant, shop, accountChannel.
4. Resolve/create `ClientContact` via `referenceId + channelId`.
5. Resolve/create conversation.
6. Persist message dengan `externalMessageId` + `metaData` Shopee.
7. Emit status/UI updates ke socket + analytics.

**Outbound:**
1. Agent reply dari room.
2. System pilih account channel Shopee yang valid.
3. `shopee service` kirim message ke API Shopee.
4. Persist status sent/failed.
5. Update UI melalui socket/event existing.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Tambah platform + service baru | channel-service, conversation-service, people-service, analytics, notification, media, FE settings/inbox | HIGH | Ikuti pattern service existing per platform, jangan taruh logic Shopee di API gateway langsung |
| Database | Tambah platform/channel/account binding + credential/session/event log | channel DB, shopee DB baru, conversation/message/contact metadata | HIGH | Buat schema khusus Shopee; gunakan snapshot + unique idempotency key |
| API | Endpoint auth/connect/disconnect/webhook/callback baru | api-gateway, proto, FE hooks | HIGH | Definisikan contract dulu sebelum implementasi UI |
| UI/UX | Tambah menu/settings/onboarding/account state + kemungkinan bubble/input khusus | settings/channels/addon, conversation room, filters, account list | MEDIUM | Reuse addon page + registry; tambah custom UI hanya jika capability Shopee beda signifikan |
| Security / RBAC | Secret storage, webhook signature, permission settings access | channel-service, FE route guard, audit | HIGH | Simpan credential terenkripsi; validasi signature; reuse permission model settings |
| Performance | Inbound webhook burst, media download, retry queue | shopee service, media-service, RabbitMQ | MEDIUM | Gunakan async processor + idempotency + bounded retry |
| Integration | Dependensi API external baru | Shopee API, webhook infra, secrets, DNS | HIGH | Mulai dengan spike + sandbox verification |
| Reporting / Analytics | Platform baru harus muncul di analytics by platform dan SLA per channel | analytics-service, dashboard cards | MEDIUM | Tambah platformCode mapping dan grouping sejak awal |
| Financial / Operational | Add-on billing dan support ops | payment/addon flow, support playbook | MEDIUM | Lock apakah billing per shop/account sebelum build |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Shopee onboarding | channel-service | DB + gRPC | Shopee → Channel | Butuh platform, channel, account-channel registration |
| Shopee onboarding | payment/addon flow | API/gRPC | Shopee → Payment | Karena add-on activation dan quota tracking sudah existing |
| Shopee inbound | people-service | gRPC/DB | Shopee → People | Resolve/create contact dengan `referenceId + channelId` |
| Shopee inbound | conversation-service | gRPC/event | Shopee → Conversation | Create/update conversation dan message |
| Shopee inbound media | media-service | API/storage | Shopee → Media | Download/upload attachment |
| Shopee status update | notification/socket | event | Shopee → Notification/API Gateway | UI realtime |
| Shopee analytics | analytics-service | event/query | Shopee → Analytics | Grouping by platform |
| FE addon settings | api-gateway | REST | FE → Gateway | Auth/connect/disconnect endpoints |
| FE conversation room | platform registries | component | FE internal | Bubble/input khusus bila diperlukan |

### 6.2 Shared Resources / Event Mapping

- Shared resource: `PlatformEnum` di BE dan FE.
- Shared resource: `Platform` / `Channel` / `AccountChannel` collections.
- Shared resource: `Conversation`, `Message`, `ClientContact` identity and indexing.
- Shared resource: `/conversations` and `/notifications` socket update flow.
- Shared resource: analytics by platform dan SLA per channel.
- New recommended events:
  - `SHOPEE_INCOMING_MESSAGE`
  - `SHOPEE_MESSAGE_STATUS_UPDATE`
  - `SHOPEE_ACCOUNT_CONNECTED`
  - `SHOPEE_ACCOUNT_DISCONNECTED`
  - `SHOPEE_TOKEN_REFRESH` / `SHOPEE_TOKEN_EXPIRED` (jika auth model memerlukan)

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Shopee API ternyata tidak menyediakan capability inbox yang dibutuhkan | Medium | Critical | High | Spike resmi sebelum PRD final |
| R-02 | Duplikasi contact/conversation karena identity buyer tidak stabil | High | High | High | Lock key strategy: `channelId + referenceId + shop/account scope` |
| R-03 | Inbound webhook retry membuat duplicate message | High | High | High | Idempotency by external event/message id |
| R-04 | Outbound gagal tetapi UI menandai sent | Medium | High | High | Status callback + retry + failed state mapping |
| R-05 | FE mengasumsikan capability sama dengan WhatsApp | High | Medium | High | Capability matrix per platform, guard di input/bubble/actions |
| R-06 | Analytics / SLA salah grouping | Medium | Medium | Medium | Tambah `platformCode` mapping dan regression reporting |
| R-07 | Credential/token bocor atau expire tanpa refresh handling | Medium | Critical | High | Encrypted storage, refresh worker, audit trail |
| R-08 | Scope creep ke order management | High | Medium | High | Phase 1 chat-only boundary |

### 7.2 Worst-Case Scenarios

- Shopee webhook masuk tetapi tidak bisa di-resolve ke tenant/account yang benar.
- Buyer message membuat banyak conversation duplikat untuk thread yang sama.
- Agent reply berhasil tersimpan lokal tetapi gagal terkirim ke Shopee.
- UI room mengizinkan action yang ternyata tidak didukung Shopee.
- Reporting by platform dan SLA per channel rusak setelah enum/platform baru ditambahkan.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Add-on activation dan platform visibility.
- Account/shop connect, reconnect, disconnect.
- Inbound text, media, status callback.
- Outbound text, media (jika supported), failed send.
- Conversation creation vs conversation reuse.
- Contact identity resolution.
- Channel filter dan analytics label.

### 8.2 Regression Scope
- Existing Instagram/Messenger/WhatsApp API/Email flows.
- Channel settings add-on page.
- Conversation list channel filtering.
- Message persistence and socket update.
- Contact creation and duplicate detection.
- Billing/add-on quota logic.

### 8.3 Integration Scope
- Webhook signature verification.
- Token refresh / credential renewal.
- Media fetch/upload pipeline.
- Idempotency untuk retried webhook.
- Cross-service events ke analytics/notification.

### 8.4 UAT / Business Validation
- Seller menerima buyer chat Shopee di inbox yang benar.
- Agent reply tampil kembali di thread Shopee yang sama.
- Multi-shop tenant tetap terisolasi benar.
- Unsupported action tidak muncul atau ditolak jelas.

### 8.5 Automation Candidates
- Connect/disconnect flow via API mock.
- Inbound webhook happy path + duplicate retry path.
- Outbound success/fail path.
- Channel filter + conversation rendering.
- Analytics by platform smoke tests.

---

## 9. Production Safety

- **Rollback Strategy:** feature flag per tenant / per platform; ability to disable webhook consumer dan hide FE route.
- **Feature Toggle Requirement:** wajib.
- **Backward Compatibility Notes:** enum/platform baru menyentuh BE + FE + analytics; default handling harus aman untuk platform existing.
- **Staged Rollout Recommendation:** sandbox → internal tenant → pilot tenant → broader rollout.
- **Monitoring / Alerting Needs:** webhook failure rate, token expiry, duplicate event count, outbound fail rate, queue lag, attachment failure.
- **Logging / Audit Gaps:** butuh audit untuk connect/disconnect shop, credential rotation, webhook rejection, outbound failure reason.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Shopee auth model apa yang tersedia untuk tenant? | Menentukan onboarding FE/BE dan secret lifecycle | Yes |
| OQ-02 | Event apa saja yang disediakan Shopee? | Menentukan status/message model | Yes |
| OQ-03 | Identifier buyer/thread/order mana yang stabil? | Menentukan dedup contact & conversation | Yes |
| OQ-04 | Apakah order context wajib tampil di inbox? | Menentukan scope Phase 1 vs cross-domain OMS | Yes |
| OQ-05 | Media types dan size limit apa yang didukung? | Menentukan reuse vs custom UI/input | Yes |
| OQ-06 | Apakah Shopee dihitung sebagai add-on per shop/account? | Menentukan billing & quota | Yes |
| OQ-07 | Perlu ticket auto-link dari chat Shopee tidak? | Menentukan dependency ke ticketing | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- **Kekuatan stack saat ini:**
  - Multi-service architecture sudah mendukung channel-specific service.
  - Data model platform/channel/account sudah ada.
  - Conversation/message/contact model sudah cukup extensible.
  - FE add-on dan platform registry sudah menyediakan extension point nyata.

- **Gap utama sebelum build:**
  - Belum ada kontrak integrasi Shopee yang terkunci.
  - Belum ada identity strategy buyer/thread/order.
  - Belum ada capability matrix untuk input, bubble, status, dan media.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / BE / FE / Cross-team |
| Required Revisions | Buat PRD formal + hasil integration spike Shopee |
| Suggested Delivery Strategy | Phase split |
| Earliest Safe Next Step | 3-7 hari technical spike untuk auth/webhook/message/status/identity feasibility |

**Suggested phase split:**
1. **Phase 0 — Spike**: auth, webhook, identity, media, outbound feasibility.
2. **Phase 1 — Core Inbox**: connect account, inbound/outbound text, filters, basic analytics.
3. **Phase 2 — Advanced Capability**: media, status parity, order context, ticket enrichment.

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | Shopee sebagai add-on platform | Existing add-on model reusable | Backend / Billing | Pending | Pending |
| FR-02 | Inbound message masuk inbox | Butuh new channel service + idempotent webhook pipeline | Backend / Integration | Pending | Pending |
| FR-03 | Agent bisa reply | Butuh outbound sender + status mapping | Backend / UI | Pending | Pending |
| FR-04 | Contact tidak duplikat | Gunakan `channelId + referenceId`, bukan asumsi phone-only | Data / People | Pending | Pending |
| FR-05 | Channel tampil di FE | Tambah enum, route, settings hook, registry/capability handling | Frontend | Pending | Pending |
| FR-06 | Analytics tetap benar | Tambah platform grouping dan regression reporting | Analytics | Pending | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-17 | Initial assessment created | Hermes |
