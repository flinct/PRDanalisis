> **FLAG: CANONICAL / USE THIS FIRST**  \n> Source of truth untuk prioritas audit dan backlog eksekusi. Jika konflik dengan file lain, file ini menang.

# SatuInbox — Audit Master Register

> **Version:** v1.2 | **Changelog:** v1.2 — synthesis audit-3 (t_ba1b1ec2): tambah DI-06 (RetryTracker in-memory), promote V17 config-trap ke confirmed (dup INT-01, close needs-validation part). v1.1 — tambah ENV-01 (branch conflict jadi finding, D3), tabel decision-taxonomy mapping (D2), blok versi (D4), per re-audit t_f4c645c2. v1.0 — baseline 59 temuan.
>
> **Single source of truth** untuk semua temuan audit. Laporan detail tetap di file asli — register ini untuk prioritisasi & tracking eksekusi.
>
> **Status:** `confirmed` (bukti kode) | `inference` (PRD/memory, belum verifikasi kode) | `corrected` (pernah salah, sudah dikoreksi) | `closed` | `needs-validation`
>
> **Severity:** Catastrophe (blocker release) | Major (fix before scale) | Medium (backlog) | Low (nice-to-have) | Positive (kontrol benar)
>
> **Repo baseline:** BE `prod-2.7.0`, FE `prod-2.7.0-11` (bukan v2.8.0)
>
> **Owner default:** PM = Dany Christian, Eng Lead = Naftal Yunior

---

## CONFIRMED — Prioritas Eksekusi

| # | ID | Domain | Finding | Severity | Evidence | Environment | Status | Owner | Remediation | Acceptance Test | Target |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | DI-01 | Broadcast / Data Integrity | Idempotency broadcast TIDAK enforced — proto `SendBroadcastRequest` tanpa `requestId`, `createBroadcast` tanpa dedup. Double-click/retry = broadcast ganda. | Major | `broadcast.proto:72-75` + `broadcast.service.ts:createBroadcast()` verified | BE prod-2.7.0, broadcast-service | **confirmed** | Naftal | Tambah `requestId` ke proto, enforce unique index `(companyId, requestId)` atau dedup di `createBroadcast` sebelum `createBroadcastBatch`. Proto change = build-breaking (regenerate ts-proto). FE harus kirim UUID per attempt. | Dua `sendBroadcast` requestId sama → hanya 1 batch | - |
| 2 | SEC-02 | Contact / Security | Contact phone index `sparse:true` **non-unique** — global-memory bilang "phone unique" tapi DB tidak enforce. | Major | `client-contact.schema.ts:101` verified | BE prod-2.7.0, people-service | **confirmed** | Naftal | Tambah unique index `(companyId, organizationId, normalizedPhone)` atau upsert atomik. Backfill dedup dulu sebelum enforce. | Insert 2 contact phone sama di tenant sama → expect 1 | - |
| 3 | DI-04 | Contact / Data Integrity | Contact merge atomic TIDAK ada — `checkDuplicateContact` (gateway) read-only, non-atomik. Race condition open. | Major | grep `merge.*contact` = absence verified | BE prod-2.7.0 | **confirmed** | Naftal | Implementasi `findOneAndUpdate` upsert by normalized phone. Jangan check-then-create. | Concurrent create 2 phone sama → 1 dokumen | - |
| 4 | SEC-04 | Audit / Security | Audit trail hanya tangkap Open API event (`OPEN_API_REQUEST_LOGGED`), tanpa aksi internal (login, assignment, delete, RBAC change). | Major | `audit-service/src/main.ts` + `app.module.ts` verified (1 consumer only) | BE prod-2.7.0, audit-service | **confirmed** | Naftal | Tambah event publisher untuk aksi internal critical. Beri read path (gRPC/export) atau monitor event-bus drop. | Event login/assignment/delete tercatat di audit DB | - |
| 5 | INT-03 | Integrasi / Security | DLQ consumer **fallback non-TLS** saat cert hilang — melanggar "mTLS mandatory". | Major | `broadcast-dlq.processor.ts:120` verified (`logger.warn('TLS certs not available...connecting without TLS')`) | BE prod-2.7.0, broadcast-service | **confirmed** | Naftal | Hard-fail (throw) bila cert tidak ada, bukan fallback non-TLS. Samakan dengan service lain. | DLQ consumer gagal start saat cert hilang (bukan downgrade) | - |
| 6 | SEC-01 | Security / PII | `console.log(payload)` bocorkan tenant ID + nomor WA bisnis ke stdout produksi. | Major | `whatsapp-api.controller.ts:144` verified | BE prod-2.7.0, api-gateway | **confirmed** | Naftal | Hapus `console.log`. Ganti logger level debug terstruktur dengan redaction. Sweep `console.log` lain di path controller. | `grep console.log apps/api-gateway/src` bersih | - |
| 7 | F-07 | UX / Error Handling | Raw backend error leakage — `throw-service-error.ts` pakai `error.response.data.message` apa adanya. 278 call sites, 132 files, 0 error mapper. UI campuran ID-Inggris, detail internal bocor. | Major | grep verified (278 non-import calls, FE prod-2.7.0-11) | FE prod-2.7.0-11, apps/omnichannel | **confirmed** | Dany + Naftal | Shared error mapper: BE kirim `{code, messageKey, fieldErrors, retryable, correlationId}`. FE i18n by code. Raw hanya ke log. Phased rollout dari 278 sites. | Negative-path test (5 flow): teks UI human-readable, bukan err.message | - |
| 8 | ENV-01 | Environment / Governance | **Branch target belum di-lock** — repo lokal `prod-2.7.0`, memory `v2.8.0`. Semua status `confirmed` valid HANYA untuk `prod-2.7.0`. `memory_conflict_flag` (non-bypassable) berlaku. (D3 meta-audit t_f4c645c2) | Major | repo baseline vs `global-memory` verified conflict | prod-2.7.0 vs v2.8.0 | **confirmed** | Naftal | Konfirmasi target branch final sebelum temuan `confirmed` dijadikan ticket. Jika target = v2.8.0, re-verify 7 confirmed prioritas di branch itu. | Branch target tertulis eksplisit di register + semua ticket refer branch yang sama | - |

---

## CONFIRMED — Kontrol Positif (sudah benar, pertahankan)

| # | ID | Domain | Finding | Evidence | Status |
|---|---|---|---|---|---|
| P1 | SEC-03 | Security | RBAC area context (Sales/Op/Admin) enforced di gateway | `contact-visibility-resolver.service.ts` verified | confirmed |
| P2 | SEC-05 | Security | Header sanitization untuk audit log Open API | `open-api-log.interceptor.ts` + spec verified | confirmed |
| P3 | SEC-06 | Security | Message edit/delete RBAC enforced server-side | `message-authorization.service.ts` verified | confirmed |
| P4 | SEC-08 | Privacy | PII masking di export, contact list, broadcast | BE + FE verified | confirmed |
| P5 | DI-02 | Data Integrity | Broadcast DLQ + retry **ADA** (koreksi FS-05) | `broadcast-dlq.processor.ts` + `broadcast-retry.processor.ts` verified | confirmed |
| P6 | DI-03 | Data Integrity | Conversation outbound DLQ per channel | `app.module.ts:268-279` verified | confirmed |
| P7 | DI-05 | Data Integrity | Idempotency parsial (export, log, channel event) | grep verified | confirmed |
| P8 | INT-04 | Integrasi | Webhook signature HMAC enforced (Messenger, IG, WA API) | `webhook.controller.ts` verified | confirmed |
| P9 | INT-05 | Integrasi | Baileys disconnect detection + reconnect | `app.controller.ts` verified | confirmed |
| P10 | OPS-03 | Operasional | SonarQube quality gate aktif di CI | `.gitlab-ci.yml` + `sonar-project.properties` verified | confirmed |

---

## CONFIRMED — Perlu Fix (non-prioritas)

| # | ID | Domain | Finding | Severity | Evidence | Status | Remediation |
|---|---|---|---|---|---|---|---|
| C1 | PERF-01 | Performance | `refetchOnReconnect` tidak diaktifkan → list stale setelah socket reconnect | Major | `makeQueryClientHelper.ts:11` verified | confirmed | `refetchOnReconnect: true` (1 baris) |
| C2 | PERF-04 | Performance | Tidak ada load test tooling (k6/artillery tidak ditemukan) | Major | grep CI+FE+BE = absence verified | confirmed | Tambah CI stage `performance` dengan k6 |
| C3 | UX-05 | UX / A11y | `<img>` tanpa alt 62% (13/21), `next/Image` tanpa alt 85% (29/34) | Medium | grep verified | confirmed | Tambah alt text. Quick win. |
| C4 | UX-06 | UX / A11y | Keyboard navigation parsial (ConversationCard tabIndex ada, handler stub) | Medium | grep verified | confirmed | Audit tab order flow inti |
| C5 | SEC-07 | Security | Dua guard baca shape user berbeda (RolesGuard vs PermissionsGuard) | Medium | kedua file verified | confirmed | Normalisasi satu userContext shape |
| C6 | INT-02 | Integrasi | Tidak ada circuit breaker gRPC, timeout-only (5s) | Medium | grep `opossum|polly|resilience` = kosong verified | confirmed | Tambah opossum/grpc interceptor |
| C7 | INT-06 | Integrasi | Broadcast retry backoff pakai `sleep` in-thread (blok consumer) | Medium | `broadcast.processor.ts:209` verified | confirmed | Pakai per-message TTL + DLX (delayed queue) |
| C8 | PERF-03 | Performance | Socket singleton tanpa reconnect config eksplisit | Medium | `socket.ts` verified | confirmed | Eksplisitkan reconnect config di satu tempat |
| C9 | OPS-01 | Operasional | Health endpoint minimal (liveness only, no readiness) | Medium | `app.controller.ts` verified | confirmed | Tambah readiness probe (DB+RMQ+gRPC) |
| C10 | OPS-02 | Operasional | Monitoring terbatas (SAP account cron, bukan system-wide) | Medium | CI-Satuinbox verified | confirmed | Prometheus + Grafana + alert |
| C11 | OPS-04 | Operasional | Tidak ada runbook terdokumentasi | Medium | grep = absence verified | confirmed | Buat runbook 4 scenario |
| C12 | QA-01 | QA | Test coverage tidak terukur (FE no test script, BE sonar.tests dikomentari) | Medium | `package.json` + `sonar-project.properties` verified | confirmed | Aktifkan sonar.tests + FE test script |
| C13 | QA-02 | QA | Feature flag tidak terstandar (env-based, no central management) | Medium | grep verified | confirmed | Standarisasi naming + dokumentasi |
| C14 | QA-03 | QA | Rollback strategy tidak terdokumentasi | Medium | CI stages verified (no rollback) | confirmed | Dokumentasikan rollback per service |
| C15 | UX-07 | UX | `SOCKER_ERROR_MESSAGE` typo di konstanta | Low | `packages/constants/src/socket.ts` verified | confirmed | Rename ke `SOCKET_ERROR_MESSAGE` |
| C16 | DI-06 | Data Integrity | `retryTracker` = `Map` in-memory (broadcast) — state retry tidak persist antar-restart → potensi retry tanpa batas. Follow-up dari koreksi FS-05 (X1). | Medium | `broadcast.processor.ts` verified (evidence DI-02) | confirmed | Persist retry count ke document broadcast atau AMQP `x-death` header |

---

## NEEDS-VALIDATION — dari PRD/Memory (belum verifikasi kode)

| # | ID | Domain | Finding | Severity | Source | Status | Validation needed |
|---|---|---|---|---|---|---|---|
| V1 | F-01 | SLA | SLA pause 3-way conflict (Hold vs Snooze vs SLA) — 3 PRD bertentangan | Catastrophe | PRD Conv file 9, 16 | **needs-validation** | Lock policy matrix PM+Eng (bukan kode, tapi keputusan) |
| V2 | F-02 | SLA | Reopen Conversation punya 3 definisi berbeda | Catastrophe | PRD Conv file 9, 12, 13 | **needs-validation** | Lock definisi kanonik PM+Eng |
| V3 | F-03 | SLA / UX | SLA color FE absolute-time vs PRD percentage | Major | global-memory §Chat List | **needs-validation** | Cek kode FE SLA color rendering |
| V4 | F-04 | Broadcast | Broadcast room paradox (REPLY_ONLY + hidden room = reply hilang) | Major | PRD Broadcast US-1/US-2 | **needs-validation** | Cek kode room creation saat broadcast |
| V5 | F-05 | SLA | FRT start (`frtCountingStartAt`) belum di-lock: inbound vs assignment | Major | global-memory §SLA | **needs-validation** | Konfirmasi PM + cek kode |
| V6 | SLA-mode | SLA | Agent-Centric vs Customer-Centric belum final | Major | global-memory §SLA | **needs-validation** | Keputusan PM+Eng |
| V7 | F-06 | SLA / UX | Group chat FRT disembunyikan di FE | Medium | global-memory §Chat List | **needs-validation** | Cek kode FE group FRT visibility |
| V8 | P-01 | Performance | Chat list irisan 4-dimensi tanpa compound index | Major | global-memory §Filtering | **needs-validation** | Cek MongoDB index conversation collection |
| V9 | P-02 | Performance | Atlas search: `ENABLED` flag NOT defined in code (dead code?) | Medium | `base.constant.ts:216` + `conversation.repository.ts:283` | **needs-validation** | Cek apakah Atlas index aktif di MongoDB Atlas production |
| V10 | P-03 | Performance | Broadcast 10k ~13.3 jam wall-clock, tanpa DLQ/backpressure terukur | Major | PRD Broadcast US-7 + NFR | **needs-validation** | Load test 10k recipients |
| V11 | P-04 | Performance | Socket event storm (mutasi × N agent × broadcast append) | Major | global-memory §Room Rules | **needs-validation** | Load test socket throughput |
| V12 | P-05 | Performance | SLA real-time compute per-row di list | Medium | global-memory §Detail | **needs-validation** | Cek kode SLA compute path |
| V13 | P-06 | Performance | Noisy-neighbor multi-tenant pada shared worker/queue | Medium | PRD Broadcast NFR | **needs-validation** | Monitor per-tenant queue latency |
| V14 | FS-01 | Flow Sistem | Dual async path (snapshot event vs socket) order tak dijamin | Major | CLAUDE-be §2/§12 | **needs-validation** | Race test close→reopen antar 2 agent |
| V15 | FS-02 | Flow Sistem | Socket-only propagation, no fallback reconcile | Major | CLAUDE-fe §10 | **needs-validation** | (PERF-01 sudah confirmed — ini root cause) |
| V16 | FS-03 | Flow Sistem | SLA event ordering lintas service (FRT=Wait+RLT bisa pecah) | Major | global-memory §SLA | **needs-validation** | Test event reorder scenario |
| V17 | FS-04 | Flow Sistem | ~~gRPC no circuit breaker + `GRPC_ANALYTICS_URL` config trap~~ **CLOSED (dup)** — config trap = confirmed via INT-01 (`.env.example:77` vs `:91`), circuit breaker = confirmed via C6/INT-02. (audit-3 synthesis) | Medium | `.env.example:77,91` verified | **closed** | Duplikat — remediation tercakup INT-01 (hapus duplikat env) + C6 (opossum) |
| V18 | FA-01 | Flow Aplikasi | Login gate berlapis + dead-end Agent (empty inbox) | Medium | CLAUDE-fe §9 | **needs-validation** | Test Agent baru login |
| V19 | FA-02 | Flow Aplikasi | Create ticket race multi-handler | Medium | CLAUDE-fe §7 | **needs-validation** | Test 2-agent concurrent create |
| V20 | FA-03 | Flow Aplikasi | Close/reopen last-write-wins tanpa versioning | Major | global-memory §Regression | **needs-validation** | Test concurrent close/reopen |
| V21 | FA-04 | Flow Aplikasi | Broadcast create reload loss + validasi akhir | Medium | PRD Broadcast Create §15 | **needs-validation** | Test reload mid-compose |
| V22 | FA-05 | Flow Aplikasi | Message order jitter dua sumber | Low | CLAUDE-be §7, CLAUDE-fe §15 | **needs-validation** | Test reconnect message order |
| V23 | UX-01 | UX | SLA countdown tanpa tooltip/legend | Medium | global-memory §Ticket | **needs-validation** | Usability test agent |
| V24 | UX-02 | UX | Empty inbox tanpa next action CTA | Medium | global-memory §Chat List | **needs-validation** | Usability test Agent baru |
| V25 | UX-03 | UX | Recipient collapse sembunyikan audience sebelum kirim | Medium | PRD Broadcast Create EC-002 | **needs-validation** | Usability test broadcast |
| V26 | UX-04 | UX | Sender disconnect tidak disurfaced di composer | Medium | CLAUDE-fe §10 | **needs-validation** | Test sender disconnect mid-compose |

---

## CORRECTED

| # | ID | Finding lama | Koreksi | Bukti koreksi |
|---|---|---|---|---|
| X1 | FS-05 | "Tidak ada DLQ + audit fire-and-forget" | **DLQ + retry broadcast ADA.** `broadcast-dlq.processor.ts` + `broadcast-retry.processor.ts` verified. RetryTracker in-memory (Map) — state tidak persist antar-restart. | Code-verified (W2, reviewer) |

---

## Decision Taxonomy Mapping (D2 — per `satuinbox.yml`)

> Severity ≠ decision. Enum: `PROCEED | PROCEED_WITH_CAUTION | REVISE_PRD | SPLIT_FEATURE | HOLD_FEATURE`. Mapping untuk item Major/Catastrophe.

| ID(s) | Severity | Decision | Alasan |
|---|---|---|---|
| DI-01, DI-04, SEC-01, SEC-02, SEC-04, INT-03, F-07 | Major | **PROCEED** | Bug code-verified — langsung remediation, tak butuh keputusan bisnis |
| ENV-01 | Major | **HOLD_FEATURE** | Blocker: lock branch target dulu sebelum ticketing confirmed items |
| F-01, F-02 (V1, V2) | Catastrophe | **REVISE_PRD** | PRD saling bertentangan — butuh lock policy PM+Eng |
| F-03, F-04, F-05, SLA-mode (V3-V6) | Major | **HOLD_FEATURE** | Keputusan bisnis SLA belum diambil |
| C1-C15 (non-prioritas) | Major/Medium | **PROCEED** | Fix code-verified, backlog biasa |

---

## Statistik

| Status | Jumlah |
|---|---|
| Confirmed (prioritas) | 8 |
| Confirmed (kontrol positif) | 10 |
| Confirmed (non-prioritas) | 16 |
| Needs-validation | 25 |
| Corrected | 1 |
| Closed (dup) | 1 |
| **Total** | **61** |

---

## Catatan Eksekusi

1. **Item 1-7 (confirmed prioritas)** = langsung jadi ticket engineering. Tidak butuh keputusan PM — bukti kode sudah cukup. **Tapi ENV-01 (item 8) blocker:** lock branch target dulu sebelum item 1-7 jadi ticket.
2. **Item V1-V6 (Catastrophe + SLA decisions)** = butuh **decision meeting PM+Eng** sebelum bisa jadi ticket. Ini bukan bug — ini keputusan bisnis yang belum diambil.
3. **Item V8-V26 (needs-validation)** = butuh verifikasi kode/metric sebelum jadi keputusan. Sebagian bisa divalidasi dengan grep cepat, sebagian butuh load test.
4. **FS-05 (corrected)** = jangan masuk backlog. DLQ sudah ada. Tapi `retryTracker` in-memory = temuan lanjutan (state hilang antar-restart).
5. **Branch:** repo lokal = `prod-2.7.0`. Memory = `v2.8.0` (dev branch). Temuan confirmed = status prod-2.7.0. Fitur v2.8.0 belum terverifikasi.
