> **FLAG: EVIDENCE / CODE-VERIFIED**  \n> Pakai sebagai bukti teknis untuk item `confirmed` di `audit-master-register.md`. Register tetap menang untuk prioritas/status.

# SatuInbox — Code-Verified Audit: Security/RBAC/Privacy + Data Integrity + Integrasi (Draft)

| Item | Detail |
|---|---|
| **Tanggal** | 2026-09-02 |
| **Analyst** | Dany Christian |
| **Sifat** | Draft temuan TAMBAHAN — melengkapi `2026-09-01-satuinbox-system-audit.md` (sumbu Miss flow/UX/Belum matang/Judgment) dan `2026-09-02-...extension-performance-flow-ux.md` (sumbu P/FS/FA/UX). Sumbu baru: **Security/RBAC/Privacy (SEC), Data Integrity (DI), Integrasi (INT)** dengan **verifikasi kode aktual**. |
| **Basis** | Verifikasi grep/read ke repo BE + FE live. BUKAN desk-analysis. |
| **Metode** | grep tenant scoping, RBAC guard, DLQ, idempotency, circuit breaker, webhook signature, PII logging + pembacaan file kunci. |

> **Lingkungan terverifikasi (bukan dari memory):**
> - BE repo: branch `v2.7.0`, tag `prod-2.7.0` — **bukan v2.8.0** seperti yang dicatat memory (memory capture 2026-08-11 di branch v2.8.0).
> - FE repo: `prod-2.7.0-11-g7632dd92` (11 commit setelah tag prod-2.7.0).
> - Artinya temuan di bawah adalah status **prod-2.7.0**, bukan v2.8.0. Fitur v2.8.0 (relation-label, contact-sync, Atlas search) TIDAK diverifikasi di sini.

---

## 1 | SECURITY, RBAC, PRIVACY

### SEC-01 — `console.log(payload)` membocorkan payload tenant ke stdout 🔴 Major
- **Evidence:** `apps/api-gateway/src/app/account-channel/whatsapp-api.controller.ts:144` — `console.log(payload)` di handler `completeOauthMeta`. Payload berisi `phoneNumberId`, `company` (tenant), `userId`.
- **Verification:** verified (source code, dibaca langsung).
- **Environment:** BE `prod-2.7.0`, api-gateway.
- **Severity:** 🔴 Major (PII/tenant identifier + nomor WA bisnis tercetak di log produksi).
- **Rekomendasi:** hapus `console.log`; ganti logger level debug ter-struktur dengan redaction. Sweep `console.log` lain di path controller.
- **Regression scope:** tidak ada (hapus logging). Verifikasi: `grep -rn "console.log" apps/api-gateway/src` bersih di path controller.

### SEC-02 — Tenant isolation: contact phone TIDAK unique per tenant (`sparse:true`) 🔴 Major
- **Evidence:** `apps/people-service/src/app/schemas/client-contact.schema.ts:101` — `ClientContactSchema.index({ companyId:1, organizationId:1, phone:1 }, { sparse:true })`. **Tanpa `unique:true`.** Index unik yang benar hanya `{ channelId:1, referenceId:1 }` (line 100, `unique:true`).
- **Verification:** verified (schema dibaca langsung).
- **Environment:** BE `prod-2.7.0`, people-service, DB `satuinbox_people`.
- **Severity:** 🔴 Major — global-memory menetapkan "Phone number unique identifier" + "One global contact per customer", tapi DB **tidak menegakkan** uniqueness pada normalized phone. Duplicate contact race (open risk di memory) TIDAK tertutup di level constraint; hanya `checkDuplicateContact` (gateway) yang aplikatif, non-atomik.
- **Rekomendasi:** tambah unique index pada normalized phone (mis. field `normalizedPhone` + `companyId` + `organizationId`) ATAU tangani duplikat via upsert atomik pada create. `checkDuplicateContact` (gateway) tidak menggantikan constraint DB.
- **Regression scope:** migration index (perlu backfill dedup dulu sebelum enforce unique, atau index jadi `unique:false` selama masa transisi). Verifikasi: insert 2 contact phone sama di tenant sama → expect 1 (setelah fix).

### SEC-03 — RBAC area context (Sales vs Operational) enforced di gateway ✅ (kontrol positif)
- **Evidence:** `apps/api-gateway/src/app/client-contact/contact-visibility-resolver.service.ts` — `getDefaultContactScope()`: Admin/SuperAdmin → `{areaScope:'all', visibilityScope:'all'}`; roleName berisi `SALES` → `sales`; Supervisor → `operational/team`; default Agent → `operational/own_and_assigned`. Area context di-resolve via gRPC `getContactIdsByAreaContext` dan di-intersect dengan role scope.
- **Verification:** verified. Super Admin bypass (`all/all`) sesuai canonical RBAC. Sales vs Operational dipisah pada **read** (list & detail).
- **Environment:** BE `prod-2.7.0`, api-gateway.
- **Catatan risiko (bukan temuan bug):** deteksi role sales memakai `roleName.includes('SALES')` (string matching, fragile terhadap rename/translate). Rekomendasi: pindah ke `role.code` enum, bukan `name`.

### SEC-04 — Audit trail hanya menangkap event Open API, tanpa gRPC 🔴 Major
- **Evidence:** `apps/audit-service/src/main.ts` — hanya bootstrap RabbitMQ, **tanpa gRPC server**. `apps/audit-service/src/app/app.module.ts` — satu controller `OpenApiLogProcessor` dengan **satu** `@EventPattern(EventTypeEnum.OPEN_API_REQUEST_LOGGED)`. Tidak ada consumer untuk aksi internal (login, assignment, delete message, RBAC change).
- **Verification:** verified (file dibaca langsung).
- **Environment:** BE `prod-2.7.0`, audit-service, DB `satuinbox_audit`.
- **Severity:** 🔴 Major — compliance trail untuk aksi **internal** (yang paling banyak terjadi) tidak ada. Audit gap tidak terdeteksi; tidak ada jalan baca sinkron (sesuai CLAUDE-be §7).
- **Rekomendasi:** (1) tambah event publisher untuk aksi internal critical (login, RBAC change, message delete, broadcast send); (2) beri read path (gRPC query atau export) atau minimal monitor event-bus drop; (3) cross-check bahwa `OPEN_API_REQUEST_LOGGED` benar di-publish gateway (lihat SEC-05 interceptor).

### SEC-05 — Header sanitization untuk audit log open-api ✅ (kontrol positif)
- **Evidence:** `apps/api-gateway/src/interceptors/open-api-log.interceptor.ts` — `sanitizeHeaders()` mengganti `SENSITIVE_HEADERS` (auth/api-key) dengan `API_KEY_MASK_PREFIX` sebelum log. Unit test `open-api-log.interceptor.spec.ts` memverifikasi masking.
- **Verification:** verified.
- **Environment:** BE `prod-2.7.0`, api-gateway.

### SEC-06 — Message edit/delete RBAC enforced server-side ✅ (kontrol positif)
- **Evidence:** `apps/conversation-service/src/app/services/message-authorization.service.ts` — `canEditMessage/canDeleteMessage`: wildcard (Admin) → permission-based (`EDIT/DELETE_TEAM_MESSAGE` untuk Supervisor + cek team membership; `EDIT/DELETE_OWN_MESSAGE` untuk Agent + cek creator) → fallback role-based. Team access diverifikasi via gRPC `getTeamsByUserId`.
- **Verification:** verified. RBAC tidak hanya di FE.
- **Environment:** BE `prod-2.7.0`, conversation-service.
- **Catatan risiko:** `hasAccessToConversationTeam` mengembalikan `true` bila conversation **tidak punya team** ("global conversation"). Bila ada conversation lintas-team tanpa `team`, Supervisor mana pun bisa edit/delete — potensi leak kecil. Rekomendasi: pastikan conversation selalu punya `team` sebelum multi-tenant penuh.

### SEC-07 — Dua guard baca shape user berbeda (RolesGuard vs PermissionsGuard) 🟡 Medium
- **Evidence:** `roles.guard.ts` membaca `user.role ?? user.userContext?.permission?.role ?? user.userContext?.role`. `permission.guard.ts` membaca `user.user.role.permission` (path nested berbeda). Dua guard tidak membaca sumber yang sama.
- **Verification:** verified (kedua file dibaca).
- **Severity:** 🟡 Medium — risiko misalignment: route yang dilindungi PermissionsGuard bisa gagal 403 bila JWT strategy tidak mengisi `user.user.role.permission`, sementara RolesGuard lolos. Bukan bug aktif, tapi rapuh.
- **Rekomendasi:** normalisasi satu `userContext` shape di JWT strategy; dua guard baca sumber yang sama.

### SEC-08 — PII masking di export & contact list ✅ (kontrol positif)
- **Evidence:** `ticket.controller.ts:178-202` (`shouldMaskPii` dari privacy permission) → `maskPii` diteruskan; `client-contact.controller.ts` (`maskPhone`/`maskIdentifier`, `maskedPhone: '*********7890'` di spec); `broadcast-export.service.ts` (`maskPii` param). FE `usePrivacyMasking` + privacy-settings route terkonfirmasi.
- **Verification:** verified (BE + FE).
- **Environment:** BE `prod-2.7.0`; FE `prod-2.7.0-11`.

---

## 2 | DATA INTEGRITY

### DI-01 — Idempotency broadcast (EC-004 request_id/draft_id) TIDAK enforced di BE 🔴 Major (konfirmasi audit 09-01 §4.4)
- **Evidence:** `proto/broadcast.proto` `SendBroadcastRequest` **tidak punya** field `request_id`/`draft_id`/`idempotencyKey`. `broadcast.service.ts:createBroadcast()` memanggil `createBroadcastBatch()` **tanpa dedup check** — setiap call membuat batch baru. `requestId` hanya ada di reqCtx gateway (logging), tidak dipakai sebagai key idempotency.
- **Verification:** verified (proto + service dibaca). **Ini menutup status ⚠️ audit 09-01 §4.4 → konfirmasi BUG.**
- **Environment:** BE `prod-2.7.0`, broadcast-service, `proto/broadcast.proto`.
- **Severity:** 🔴 Major — double-click / retry gRPC = broadcast ganda ke ribuan recipient. FE send path tidak menyediakan guard server-side.
- **Rekomendasi:** tambah `requestId` ke `SendBroadcastRequest`, enforce unique index `(companyId, requestId)` atau dedup di `createBroadcast` sebelum `createBroadcastBatch`.
- **Regression scope:** proto change (build-breaking, regenerate ts-proto), FE send harus kirim `requestId` (UUID per attempt, reuse pada retry). Verifikasi: dua `sendBroadcast` dengan `requestId` sama → hanya 1 batch.

### DI-02 — Broadcast DLQ + retry TERIMPLEMENTASI (bukan "no DLQ") ✅ — koreksi FS-05 (09-02)
- **Evidence:** `broadcast-dlq.processor.ts` (consumer DLQ `DEAD_LETTER_BROADCAST`, `durable:true`, `prefetch(1)`, `noAck:false`, ack-always untuk cegah infinite reprocess); `broadcast-retry.processor.ts` (requeue + backoff, `MAX_RETRY_PROCESS_RETRIES`); `broadcast.processor.ts:handleErrorProcessBroadcast()` (`MAX_RETRIES` → `nack(requeue)` → DLX → `handleFailedBroadcast`).
- **Verification:** verified. **Ini mengoreksi inferensi FS-05 audit 09-02 ("tidak ada DLQ") — untuk broadcast, DLQ + retry ADA.**
- **Environment:** BE `prod-2.7.0`, broadcast-service, exchange `satuinbox-exchange`.
- **Catatan (temuan lanjutan):** `retryTracker` adalah `Map` in-memory (`broadcast.processor.ts`) — state retry **tidak persist**. Restart service saat mid-retry = counter reset → potensi retry tanpa batas antar-restart. Rekomendasi: persist retry count ke document broadcast (atau x-death header AMQP).

### DI-03 — Conversation outbound punya DLQ per channel ✅ (kontrol positif)
- **Evidence:** `conversation-service/src/app/app.module.ts:268-279` — `deadLetterQueue: DEAD_LETTER_OUTBOUND`, `DEAD_LETTER_OUTBOUND_WHATSAPP_WEB`, `DEAD_LETTER_OUTBOUND_WHATSAPP_API`.
- **Verification:** verified.
- **Environment:** BE `prod-2.7.0`, conversation-service.

### DI-04 — Duplicate contact merge race: TIDAK ada code path merge atomik 🔴 Major
- **Evidence:** `grep "merge.*contact|mergeContact"` → **tidak ada** logic merge contact di BE (hanya "merge teams" di `conversation.service.ts:5578`, unrelated). Dedup contact hanya `checkDuplicateContact` (gateway, read-only check) + index phone `sparse:true` non-unique (SEC-02).
- **Verification:** verified (absence by grep; merge code tidak ditemukan). Race dari global-memory ("Duplicate contact merge race condition") masih **open risk penuh**.
- **Severity:** 🔴 Major — dua agent create contact phone sama bersamaan → dua dokumen (karena tidak ada constraint unik) → "One global contact" rusak → broadcast/room routing ke kontak yang salah.
- **Rekomendasi:** implementasi upsert atomik by normalized phone (findOneAndUpdate with upsert) + unique index (SEC-02). Jangan bergantung check-then-create.
- **Regression scope:** contact create path, contact sync worker (v2.8.0 — di luar branch ini). Verifikasi: concurrent create 2 phone sama → 1 dokumen.

### DI-05 — Idempotency parsial terverifikasi di jalur lain (bukan broadcast) 🟢
- **Evidence:** `analytics-service/export-report-job` `findActiveDuplicateJob` + index dedup (`FR-048/FR-049`) ✅; `whatsapp` account-channel event log `buildDisconnectDedupKey` ✅; conversation `addAccountChannelsToConversation` memakai `$pull`+`$push` atomic `findOneAndUpdate` (idempotent) ✅.
- **Verification:** verified.
- **Kesimpulan:** pola idempotency ada di beberapa titik, tapi **belum** di jalur paling berisiko (broadcast send, DI-01).

---

## 3 | INTEGRASI (WhatsApp / gRPC / webhook / queue)

### INT-01 — `GRPC_ANALYTICS_URL` config trap dikonfirmasi di kode ✅ (konfirmasi FS-04 audit 09-02)
- **Evidence:** `.env.example:77` → `GRPC_ANALYTICS_URL=localhost:50053`; `.env.example:91` → `GRPC_ANALYTICS_URL=localhost:50069`. Key dibaca via `libs/common/.../base.constant.ts:129` `ANALYTICS: 'GRPC_ANALYTICS_URL'`.
- **Verification:** verified. Dua nilai berbeda di file yang sama; runtime effective `:50069` (per CLAUDE-be). Salah set = analytics gRPC gagal.
- **Rekomendasi:** satu source, hapus duplikat.

### INT-02 — Tidak ada circuit breaker; gRPC mengandalkan timeout saja 🟡 Medium
- **Evidence:** `grep "opossum|polly|resilience|circuit"` di `package.json` → **kosong**. Timeout: `MICROSERVICE_TIMEOUT=5000` (default, `app.config.ts:30`) + per-call `.pipe(timeout(GRPC_TIMEOUT_MS=5000))` (search.controller.ts). mTLS: `loadTLSCertificates` di semua `main.ts`, `rejectUnauthorized` (per CLAUDE-be).
- **Verification:** verified (absence circuit breaker by grep; timeout + mTLS ada).
- **Severity:** 🟡 Medium — downstream gRPC lambat/dead memblok gateway sampai deadline 5s; tanpa breaker, cascade failure tidak terputus (sejalan FS-04).
- **Rekomendasi:** tambah circuit breaker (opossum/grpc interceptor) pada client gRPC gateway; timeout per-domain berbeda untuk path berat.

### INT-03 — DLQ consumer downgrade ke non-TLS saat cert hilang 🔴 Major
- **Evidence:** `broadcast-service/src/app/processors/broadcast-dlq.processor.ts:120` — `logger.warn('TLS certs not available for DLQ consumer, connecting without TLS')`. Berarti **soft-fail** ke koneksi non-mTLS, melanggar aturan arsitektur "mTLS mandatory, services will not start without certificates".
- **Verification:** verified.
- **Severity:** 🔴 Major — inter-service traffic (broadcast DLQ) bisa jalan tanpa mTLS diam-diam saat cert misconfigured; melanggar non-negotiable rule CLAUDE-be §2.
- **Rekomendasi:** hard-fail (throw) bila cert tidak ada, bukan fallback non-TLS. Samakan dengan service lain.

### INT-04 — Webhook signature verification enforced ✅ (kontrol positif)
- **Evidence:** messenger `webhook.controller.ts` (`X-Hub-Signature-256` HMAC-SHA256, `verifyWebhookSignature`, reject bila header absent) ✅; instagram `webhook.controller.ts` (`signed_request` HMAC-SHA256) ✅; whatsapp-api pakai `verifyToken` (`FAILED_VERIFY_WEBHOOK`) ✅.
- **Verification:** verified.
- **Environment:** BE `prod-2.7.0`, api-gateway + whatsapp-api.

### INT-05 — WhatsApp (Baileys) disconnect detection + reconnect ada ✅ (kontrol positif)
- **Evidence:** `whatsapp/src/app/app.controller.ts` — `DISCONNECTION_PATTERNS`, `handleDisconnectionIfNeeded()` → set account channel `INACTIVE`, disconnect context (`sourcePhase`/`trigger`), event log dengan dedup key.
- **Verification:** verified.
- **Environment:** BE `prod-2.7.0`, whatsapp-service (Baileys `7.0.0-rc13` pinned).

### INT-06 — Broadcast retry: requeue tanpa delay-header eksplisit pada nack 🟡 Medium
- **Evidence:** `broadcast.processor.ts:209` — `channel.nack(originalMessage, false, true)` (requeue) setelah `sleep(RETRIES_SECOND_PER_RETRIED)`. Requeue via DLX (per provider `deadLetterExchange`/`deadLetterRoutingKey`), tapi backoff diimplementasi dengan `sleep` in-thread, bukan TTL/delayed queue — selama sleep, worker terblok.
- **Verification:** verified (dibaca).
- **Severity:** 🟡 Medium — backoff memblok consumer (prefetch 10) alih-alih delayed requeue; pada volume besar memperlambat throughput queue (interaksi P-03/P-06 audit 09-02).
- **Rekomendasi:** gunakan per-message TTL + DLX (delayed queue) untuk backoff, bukan `sleep` in-thread; pisahkan queue broadcast dari conversation (sudah disarankan 09-02 P-03).

---

## Master Severity Matrix (sumbu baru, code-verified)

| ID | Temuan | Sumbu | Severity | Verification |
|---|---|---|---|---|
| SEC-01 | `console.log(payload)` bocorkan tenant/WA number | Security | 🔴 Major | verified |
| SEC-02 | Contact phone index `sparse:true` non-unique | Security/DI | 🔴 Major | verified |
| SEC-03 | RBAC area context (Sales/Op/Admin) enforced | Security | ✅ | verified |
| SEC-04 | Audit hanya Open API, tanpa gRPC/internal | Security | 🔴 Major | verified |
| SEC-05 | Header sanitization audit log | Security | ✅ | verified |
| SEC-06 | Message edit/delete RBAC server-side | Security | ✅ | verified |
| SEC-07 | Dua guard baca shape user beda | Security | 🟡 Medium | verified |
| SEC-08 | PII masking export/contact | Privacy | ✅ | verified |
| DI-01 | Broadcast idempotency TIDAK enforced | Data integrity | 🔴 Major | verified (menutup ⚠️ 09-01 §4.4) |
| DI-02 | Broadcast DLQ+retry ADA (koreksi FS-05) | Data integrity | ✅ | verified |
| DI-03 | Conversation outbound DLQ per channel | Data integrity | ✅ | verified |
| DI-04 | Contact merge atomic TIDAK ada | Data integrity | 🔴 Major | verified (absence) |
| DI-05 | Idempotency parsial (export/log/channel) | Data integrity | 🟢 | verified |
| INT-01 | `GRPC_ANALYTICS_URL` trap | Integrasi | ✅ (trap) | verified |
| INT-02 | No circuit breaker, timeout-only | Integrasi | 🟡 Medium | verified (absence) |
| INT-03 | DLQ consumer fallback non-TLS | Integrasi | 🔴 Major | verified |
| INT-04 | Webhook signature HMAC enforced | Integrasi | ✅ | verified |
| INT-05 | Baileys disconnect/reconnect | Integrasi | ✅ | verified |
| INT-06 | Retry backoff `sleep` in-thread | Integrasi | 🟡 Medium | verified |

## Rekomendasi Prioritas (melengkapi 09-01 §7 & 09-02)

1. **DI-01 broadcast idempotency** — konfirmasi bug paling mahal (double-send massal); proto change + unique `requestId`. Blocker sebelum broadcast volume produksi.
2. **SEC-02 + DI-04 contact uniqueness** — constraint DB + upsert atomik; menutup duplicate-merge race yang jadi open risk memory.
3. **SEC-04 audit trail internal** — compliance gap; tambah publisher aksi internal.
4. **INT-03 hard-fail mTLS DLQ** — jangan biarkan downgrade non-TLS diam-diam.
5. **SEC-01 hapus console.log PII** — quick win, zero regression.
6. **INT-02 circuit breaker + INT-06 delayed requeue** — hardening async, sejalan FS-04/P-03.

## Open Questions untuk Reviewer

- Apakah `OPEN_API_REQUEST_LOGGED` benar di-publish dari gateway untuk semua partner call, atau hanya subset? (SEC-04/SEC-05)
- Apakah ada rencana normalize `role.name` → `role.code` untuk deteksi Sales scope? (SEC-03)
- Apakah branch audit (prod-2.7.0) yang benar, atau harusnya v2.8.0? Memory mencatat v2.8.0 tapi repo lokal di 2.7.0. (environment)

---

**[iter 1] analyzer(sec) ->** Code-verified, 3 area (SEC/DI/INT), 20 temuan (6 Major). Mengkonfirmasi 3 item lama (09-01 §4.4 idempotency=BUG; 09-02 FS-04 config trap; FS-05 DLQ=ADA di broadcast, koreksi). Temuan baru tertinggi: contact phone non-unique (sparse:true) + tidak ada merge atomik; audit-service hanya Open API tanpa gRPC; `console.log` bocorkan PII; DLQ consumer fallback non-TLS. Basis repo prod-2.7.0 (bukan v2.8.0). Draft ditulis ke `Assessments/audit/2026-09-02-satuinbox-audit-security-integrity-integration-code-verified.md`. Reviewer handoff: perlu konfirmasi branch target (2.7.0 vs 2.8.0) + apakah audit 09-01/09-02 cukup untuk 2 temuan Major baru (SEC-02/DI-04).
