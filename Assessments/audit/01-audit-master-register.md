> **FLAG: CANONICAL / USE THIS FIRST**  \n> Source of truth untuk prioritas audit dan backlog eksekusi. Jika konflik dengan file lain, file ini menang.

# SatuInbox — Audit Master Register

> **Version:** v2.2 | **Changelog:** v2.2 — **BE code-verified Track K** (repo `omnichannel-satuinbox-be` ternyata ADA, branch `v2.7.0` commit `3e2d9bc1`; klaim awal "tak ter-clone" dikoreksi). +**AUTH-12** (P0 topup webhook double-credit, money path, `wallet.service.ts:459-498`). Promote AUTH-08/09/10 needs-validation→confirmed (proration rumus, quota carry-over type-dependent, webhook static-secret+payment-bill idempotent). AUTH-03 di-scope FE-only (BE JWT secret aman). AUTH-05 di-reframe (BE emit event via RabbitMQ, gap murni FE session-refresh). Track K 11→12; confirmed 5→9; needs-validation 38→35; Total 143→144. v2.1 — fold **Track K** (Auth/Register/Onboarding/Subscription as-built audit, 11 AUTH-01..11: 3 P0/4 P1/4 P2; 5 confirmed FE + 3 needs-validation + 3 needs-decision). Shadow domain: 4 domain live tanpa PRD/memory/test. Total 132→143. Detail di `detail-auth/` + competitor benchmark di `detail-auth/reference/`. v2.0 — fold Track I (Conversation-Room PRD, 15 CRM: inference/Major) + Track J (Conversation-Room product-reality, 16 CRX: 3 Catastrophe/8 Major/4 Medium/1 Low, 9 confirmed/6 needs-validation/1 inference). Dedup 23 ROOM linked-only (evidence ke existing, bukan ID baru). Total 101→132. Cross-ref objek bersama (16 pasang) di kepala kedua file audit. v1.9 — jelaskan formula 303 bruto → 101 register kanonik: 101 = A61 + F Critical10 + G12 + H folded18; 202 sisanya = B33 + D41 + E64 + F non-Critical59 + H clean/retracted5, belum/tidak di-fold karena overlap, raw backlog, atau bukan bug. Koreksi statistik Track H pasca v1.8: confirmed 17, needs-validation 29, corrected 2; total tetap 101. v1.8 — re-review Track H conversation-list open questions. `CLH-17` dipromosikan jadi **confirmed Low**: invalidation realtime memicu refetch berulang tanpa debounce, tetapi bukan thundering herd tak terbatas karena TanStack Query dedupe in-flight fetch. `CLH-18` **closed/corrected**: bulk-action RBAC terbukti enforced di BE `conversation.controller.ts` lewat `JwtAuthGuard` + `PermissionsGuard` + `@RequirePermissions(...)` per bulk endpoint; gap FE tinggal cosmetic visibility, bukan authz bypass. Statistik tetap **101** (1 item pindah bucket ke confirmed, 1 item keluar dari needs-validation). v1.7 — konsolidasi penuh Conversation-Sidebar-Navigation ke 1 file tunggal dan fold ke ID resmi CSN-01..12 (8 confirmed + 2 needs-validation + 2 needs-decision). Koreksi: C2 parity scope, C3 bypass claim diretract jadi coverage-risk, C5 capability gap bukan bug. Statistik 89 → 101. **Re-letter track:** F = Infra/DevOps, G = Conversation-Sidebar-Navigation — supaya urutan baca G (sidebar) → H (list) searah; entri changelog lama di bawah memakai huruf lama sebelum swap. v1.6 — fold penuh conversation-list deep audit (Track H) ke ID resmi CLH-01..18. Dedup: CLX-03 memperluas CL-01 tapi mekanisme baru tetap dipertahankan sebagai finding baru; CLX-04 diretract dan tidak di-fold; clean/retracted tidak masuk register. Branch baseline diselaraskan ke `prod-2.8.1` dengan memory FE/BE tetap patokan utama. Statistik 71 → 89. v1.5 — fold infra 10 Critical jadi ID resmi INFRA-01..10 (committed secrets, no alerting, 2× SPOF, CORS wildcard, FE/BE test coverage, docs, EKS public); status di Cakupan: orphan → folded (Critical only; High/Medium/Low tetap di source `detail-infra/satuinbox-infra-audit.md`). Arsip 9 file source 09-01/09-02 → `_source/`; conversation source → `conversation/_source/` + merged file. Statistik 61 → 71. v1.4 — review corpus 2026-09-03: tambah track infra orphan (`detail-infra/satuinbox-infra-audit.md`, 69 temuan) + Track B ke peta Cakupan; warning konflik layer RBAC (SEC-03 BE vs sidebar-nav C1 FE); konflik antar-file terdokumentasi di reading-list §5 (K1–K6). NO finding baru di-fold. v1.3 — tambah section "Cakupan Audit" (peta track). Register kini eksplisit sebagai master peta seluruh audit, bukan hanya Track A. v1.2 — synthesis audit-3 (t_ba1b1ec2): tambah DI-06 (RetryTracker in-memory), promote V17 config-trap ke confirmed (dup INT-01, close needs-validation part). v1.1 — tambah ENV-01 (branch conflict jadi finding, D3), tabel decision-taxonomy mapping (D2), blok versi (D4), per re-audit t_f4c645c2. v1.0 — baseline 59... [truncated]
>
> **Single source of truth** untuk semua temuan audit. Laporan detail tetap di file asli — register ini untuk prioritisasi & tracking eksekusi.
>
> **Status:** `confirmed` (bukti kode) | `inference` (PRD/memory, belum verifikasi kode) | `corrected` (pernah salah, sudah dikoreksi) | `closed` | `needs-validation`
>
> **Severity:** Catastrophe (blocker release) | Major (fix before scale) | Medium (backlog) | Low (nice-to-have) | Positive (kontrol benar)
>
> **Repo baseline:** FE/BE memory = patokan utama; branch kerja saat ini `prod-2.8.1` (repo reality lama di dokumen dianggap outdated dan digantikan catatan ini)
>
> **Owner default:** PM = Dany Christian, Eng Lead = Naftal Yunior

---

## Cakupan Audit (peta semua track)

> Register ini = **backlog eksekusi ter-triase**, bukan dump semua finding. Track A sudah di-fold jadi ID resmi di bawah. Track **G** dan **H** sudah folded ke ID resmi (CSN / CLH) di bawah. Track B/D/E/F non-critical masih banyak overlap/raw dan tetap dibaca via `02-reading-list-and-conflicts.md` (§1 peta, §4 khusus Conversation).

| Track | Scope | Finding | Di register? | Baca |
|---|---|---|---|---|
| **A** | Code + PRD audit system-wide (security, integrity, broadcast, contact, ops) | 61 (ter-triase) | ✅ **folded** (isi register ini) | register + `detail-infra/security-integrity-code-verified.md` |
| **B** | UI/UX heuristic (Nielsen, FE-only) | 33 | ❌ belum | `detail-uiux/uiux-audit-report-sabrina.md`, `detail-uiux/uiux-impact-assessment.md` |
| **D** | Conversation FE UX flow (first-time + returning user) | 41 | ❌ belum | `detail-conversation/2026-09-02-conversation-audit-merged.md` (Track D) |
| **E** | Conversation BE deep-dive (data model, security, perf, functional) | 64 | ❌ belum | `detail-conversation/2026-09-02-conversation-audit-merged.md` (Track E) |
| **F** | Infra/DevOps (secrets, CORS, SPOF, alerting, test coverage) | 69 (10 Critical/22 High/25 Med/12 Low) | ⚠️ **partial**: 10 Critical folded (INFRA-01..10); High/Med/Low belum | `detail-infra/satuinbox-infra-audit.md` (source lengkap 59 non-Critical) |
| **G** | Conversation-Sidebar-Navigation (counter, channel, team inbox) | 12 | ✅ **folded**: CSN-01..12; 4 butuh validation/decision | `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` |
| **H** | Conversation-list deep audit (chat-list panel, 10 aspek) | 23 (17 confirmed/1 corrected/5 clean+retracted + known overlap) | ✅ **folded**: CLH-01..18; clean/retracted tetap di source | `detail-conversation/2026-09-07-conversation-list-deep-audit.md` |
| **I** | Conversation-Room PRD-conformance | 23 triaged / **15 folded** + 8 linked-only | ✅ **partial folded**: CRM-01..15; ROOM-01/02/03/05/06/07/13/22 linked ke existing IDs | `detail-conversation/2026-09-07-conversation-room-deep-audit.md` |
| **J** | Conversation-Room product-reality (kode + heuristik) | 25 triaged / **16 folded** + 4 linked-only + 2 positive + 3 unique infra-quality | ✅ **partial folded**: CRX-01..16; linked evidence ke F-07/ROOM-21/CRM | `detail-conversation/2026-09-07-conversation-room-product-reality-audit.md` |
| **K** | Auth / Register / Onboarding / Subscription (as-built + flow + competitor benchmark) | 12 (4 P0 / 4 P1 / 4 P2) | ✅ **folded**: AUTH-01..12 | `detail-auth/auth-register-onboard-subscription-audit.md` (+ `reference/` competitor benchmark) |
| **TOTAL** | Corpus bruto seluruh track (A+B+D+E+F+G+H+I+J+K) | **363** | Register kanonik ter-triase & dedup = **144 finding** (statistik di bawah) | — |

> **Baca Total dengan benar:** 363 = corpus bruto sebelum triase/dedup. Register 144 = item yang sudah masuk canonical tracking: **A61 + F Critical10 + G12 + H folded18 + I CRM15 + J CRX16 + K AUTH12 = 144**. Selisih **219** = **B33 + D41 + E64 + F non-Critical59 + H clean/retracted5 + I linked-only8 + J linked-only4 + J positive2 + J unique-infra-quality3** yang belum/tidak di-fold karena overlap, raw backlog, kontrol positif, atau bukan bug. Kalau butuh satu angka eksekusi, pakai **144**.

> **⚠️ Track K auth shadow-domain:** 4 domain (auth/register/onboarding/subscription) **live di produksi tanpa 1 pun PRD, memory canonical, atau test** (AUTH-01). FE code-verified (branch `data-cy`); **BE code-verified** (branch `v2.7.0`, commit `3e2d9bc1` — klaim awal "BE tak ter-clone" SALAH, sudah dikoreksi). Deviasi industri terbesar: **satu-satunya** platform dengan manual approval gate + KYC upfront + **tanpa trial/free-tier** (semua kompetitor self-serve instan). P0: AUTH-02 (REJECTED+APPROVED blank page) + AUTH-03 (`NEXT_PUBLIC_SECRET` browser-exposed, FE-only) + **AUTH-12 (topup webhook double-credit, money path, BE-confirmed)**.

**Gate fold Track B/D/E/F:** dedup per overlap yang dicatat di `02-reading-list-and-conflicts.md` §4 masih wajib untuk track-track itu. **Track G** kini sudah dikonsolidasikan ke satu file tunggal dan di-fold ke `CSN-01..12`; item decision/validation tetap dipisah di section khusus. **Track H** dikecualikan sesuai keputusan user dan sudah di-fold penuh untuk non-clean findings; clean/retracted tetap tinggal di source supaya register tidak double-count non-bug.

> **⚠️ Konflik layer RBAC (jangan salah baca):** P1 **SEC-03** di bawah = kontrol positif RBAC di **BE gateway** (benar, enforced). Track G / **CSN-01** = gate visibility RBAC di **FE sidebar** (RUSAK — `role.name` vs `role.code`). Dua-duanya benar di layer berbeda. SEC-03 positif TIDAK berarti FE gate aman.
> **⚠️ Track F infra (INFRA-01..10 folded):** 10 Critical dari `detail-infra/satuinbox-infra-audit.md` kini jadi ID resmi di section **CONFIRMED — Track F Infra/DevOps** di bawah. Severity Track F = `Critical` (skala infra), setara **Major/Catastrophe** di skala produk register. Sisa 59 (High/Med/Low) TETAP di source, belum di-fold. INFRA-01 (committed secrets) time-sensitive — active risk, rotate segera.

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
| 8 | ENV-01 | Environment / Governance | **Branch baseline lama outdated** — target operasional sekarang `prod-2.8.1`; memory FE/BE menjadi patokan utama bila audit lama menyebut `prod-2.7.0` / `v2.8.0`. | Major | PM clarification 2026-09-07 | prod-2.8.1 | **closed** | Naftal | Saat ticketing, refer branch `prod-2.8.1` dan re-verify hanya jika finding menyentuh area yang berubah di 2.8.1. | Ticket mencantumkan branch baseline `prod-2.8.1` + source memory FE/BE | - |

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

## CONFIRMED — Track F Infra/DevOps (10 Critical folded dari `detail-infra/satuinbox-infra-audit.md`)

> Severity `Critical` = skala infra (setara Major/Catastrophe skala produk). Owner default **Naftal**. Sisa 59 Track F (High/Med/Low) belum di-fold — baca source. **INFRA-01 = active risk, kerjakan lebih dulu.**

| # | ID | Domain | Finding | Severity | Evidence | Status | Remediation | Effort |
|---|---|---|---|---|---|---|---|---|
| F1 | INFRA-01 | Security / Secrets | **Committed secrets di git** — `docker/local/.env` (tracked), `atlas-search/conversation-indexes.sh` (Mongo password hardcoded), `docker/dev/docker-compose.yml` (Redash+Mongo password). Siapapun dengan akses repo punya DB password + API key. | Critical | source-verified (t_4544c1c3 C-1/2/3) | **confirmed** | `git rm --cached`, **rotate SEMUA** credential terekspos, `.gitignore`. | 30 min |
| F2 | INFRA-02 | Observability | **Zero alerting** — Prometheus collect metric tapi 0 PrometheusRule CRD. Tidak ada yang di-page. Failure baru ketahuan saat customer lapor. | Critical | t_f652d37d IV-1 | **confirmed** | Alertmanager: pod-not-ready >5min, MongoDB RS unhealthy, gRPC error >5%, mem >85%. | 1 day |
| F3 | INFRA-03 | Architecture / SPOF | **API Gateway single-replica** — satu-satunya entry HTTP/WS, no HPA (VPA only). Crash = outage total semua traffic. | Critical | t_f652d37d I-1 | **confirmed** | HPA min 2 replica. | 1 hr |
| F4 | INFRA-04 | Architecture / SPOF | **WhatsApp Service single-replica** — Baileys session stateful, tak bisa scale horizontal. Crash = semua sesi WA hilang, butuh re-auth. | Critical | t_f652d37d I-2 | **confirmed** | Session persistence untuk fast recovery; long-term migrasi WA Business API akun non-kritikal. | M |
| F5 | INFRA-05 | Security / CORS | **CORS wildcard** — `CORS_ORIGINS` unset → `'*'`. Plus env var name mismatch (plural/singular di `.env.example`). Domain manapun bisa authenticated cross-origin. | Critical | `api-gateway/src/main.ts:70-77` + WS gateway | **confirmed** | Default ke domain produksi, fix nama env var. | 30 min |
| F6 | INFRA-06 | Code Quality / Test | **FE zero test coverage** — 1 test file / 1.777 source, no test runner. Regresi ship diam-diam. | Critical | t_865726e9 | **confirmed** | Vitest + critical-path test (auth, conversation list). Tie C12/QA-01. | 1-2 days |
| F7 | INFRA-07 | Quality / Test | **BE e2e semua stub** — 18 e2e app test endpoint `/api` yang tak ada. 0% real e2e. False confidence. | Critical | t_1e8f8b8c | **confirmed** | Ganti dgn integration test nyata, mulai auth-service. Tie C12. | 2-3 days |
| F8 | INFRA-08 | Documentation | **Zero per-service docs** — 0/38 service punya README di arsitektur 19-microservice. Onboarding blocker. | Critical | t_1e8f8b8c | **confirmed** | Template README, mulai conversation-service. | 2-3 days |
| F9 | INFRA-09 | Documentation | **No CHANGELOG / release process** — tak ada CHANGELOG.md, semver, release notes. | Critical | t_1e8f8b8c | **confirmed** | keepachangelog format, backfill dari git history. | 0.5 day |
| F10 | INFRA-10 | Security / Infra | **EKS public endpoint** — cluster API internet-accessible, private access disabled. | Critical | t_f652d37d III-4 | **confirmed** | Enable private access, VPN/bastion untuk kubectl. | 1 day |

---

## CONFIRMED — Track G Conversation-Sidebar-Navigation (8 folded dari `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md`)

> Track G sekarang punya satu file tunggal. Fold dilakukan untuk 8 temuan confirmed. Blocking: **CSN-01**. Decision/validation tetap di section bawah agar register tidak memalsukan status.

| # | ID | Domain | Finding | Severity | Evidence | Status | Remediation | Effort |
|---|---|---|---|---|---|---|---|---|
| G1 | CSN-01 | Sidebar Navigation / RBAC | FE sidebar memakai `userRole?.name` untuk gate AGENT/SUPERVISOR/ADMIN, padahal enum membandingkan code. SALES agent salah melihat `Unassigned/All`; SUPERVISOR SALES kehilangan tombol create team. | Major | FE `ConversationNavItemDefault.tsx:142,294-295`; BE `role.seed.ts:51-67` | **confirmed** | Ganti check ke `userRole?.code` di dua titik. | S |
| G2 | CSN-02 | Sidebar Navigation / Counter | Lifecycle invalidation counter tidak lengkap: new message pada conversation existing, perubahan status channel, dan perubahan role tidak dijamin refresh. Tidak ada TTL/polling safety-net. | Major | FE `conversation.service.ts:348-366`; `use-invalidate-conversation.ts:163-173`; BE `conversation.service.ts:1300-1302`; `counter.repository.ts:90-93` | **confirmed** | Pusatkan kontrak invalidation counter + fallback TTL/polling terukur. | M |
| G3 | CSN-04 | Sidebar Navigation / Counter | Socket handler `conversation.counter` skip diam-diam saat `userId` mismatch/null, tanpa telemetry atau recovery eksplisit. | Low | FE `use-conversation-socket-event.ts:570-589` | **confirmed** | Normalisasi ID, log mismatch aman, lalu refetch/invalidate. | S |
| G4 | CSN-06 | Sidebar Navigation / Channel | `getActiveChannel` membatasi fetch ke 25 channel sebelum filter ACTIVE, sehingga active channel di luar page pertama bisa hilang. | Medium | BE `conversation.service.ts:2857,2861-2865,2873` | **confirmed** | Filter ACTIVE server-side dan paginate sampai selesai. | S-M |
| G5 | CSN-07 | Sidebar Navigation / Channel | Pipeline count memakai whitelist platform hardcoded, bukan capability/active-channel company. Platform valid di luar list hilang dari sidebar/count. | Medium | BE `conversation.repository.ts:1969-1988` | **confirmed** | Derive platform set dari active channel/capability company. | M |
| G6 | CSN-08 | Sidebar Navigation / Channel | Aggregasi channel masih menghitung history dari channel non-active. | Low | BE `conversation.repository.ts:1956` | **confirmed** | Filter dengan active channel IDs bila kontrak hanya channel aktif. | M |
| G7 | CSN-09 | Team Inbox / Counter Parity | `resolveTeams` memfilter semua non-ADMIN, tetapi `shouldScopeByTeam` hanya AGENT/SUPERVISOR. Re-verifikasi membuktikan ini parity issue, bukan leak row team asing. | Medium | BE `conversation.service.ts:1332-1341,6477`; `buildCountResponse:1233-1287` | **confirmed** | Samakan scope builder dengan `role !== ADMIN` atau shared helper. | S-M |
| G8 | CSN-12 | Team Inbox / Documentation | Union visibility team (membership ∪ assigned conversation) intentional tetapi belum terdokumentasi dekat contract sidebar/counter. | Low | BE `conversation.service.ts:5555-5582` | **confirmed** | Dokumentasikan rule + tambah satu contract test. | S |

---

## NEEDS-VALIDATION / DECISION — Track G Conversation-Sidebar-Navigation

| # | ID | Domain | Finding | Severity | Source | Status | Validation needed |
|---|---|---|---|---|---|---|---|
| G9 | CSN-03 | Sidebar Navigation / Query Parity | Criteria count belum dibuktikan identik dengan criteria list (`assign`, `hideEmpty`, team/channel visibility). | Major | `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` | **needs-validation** | Trace pipeline final count vs list per role/filter matrix. |
| G10 | CSN-05 | Sidebar Navigation / Channel Policy | Guard active-channel merge membutuhkan keputusan policy untuk bucket sintetis (`WHATSAPP_WEB_GROUP`, `INSTAGRAM_COMMENT`). | Medium | `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` | **needs-validation** | Lock policy parent/bucket dengan PM+Tech sebelum patch `has()` guard. |
| G11 | CSN-10 | Team Inbox / Authorization Coverage | Klaim bypass AGENT via `assign=false` diretract; guard repo ada. Yang belum terbukti: semua entry point list/read memakai guard yang sama. | Medium | `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` | **needs-validation** | Inventaris semua read path conversation dan trace ke scope builder. |
| G12 | CSN-11 | Team Inbox / Capability | Hak create-team untuk MANAGER/TEAM_LEAD belum punya requirement kanonik. | Low | `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` | **needs-validation** | Lock capability matrix FE+BE dengan PM+Tech. |

---

## CONFIRMED — Track H Conversation-List (17 confirmed folded dari `detail-conversation/2026-09-07-conversation-list-deep-audit.md`)

> Track H folded penuh untuk non-clean findings: 17 confirmed di section ini + 1 corrected/closed di section bawah. Blocking: **CLH-02/CLH-03**. Dedup: CLX-03 memperluas CL-01, tetapi mekanisme virtualizer mismatch berbeda; CLX-04 diretract dan tidak di-fold.

| # | ID | Domain | Finding | Severity | Evidence | Status | Remediation | Effort |
|---|---|---|---|---|---|---|---|---|
| H1 | CLH-01 | Conversation List / A11y | Mention badge memakai `CLS.MESSAGE_MENTION_BADGE` yang tidak didefinisikan, sehingga styling indikator `@mention` hilang. | Major | `ConversationCard.tsx:464`; Track H CLX-01 | **confirmed** | Tambah konstanta CSS `MESSAGE_MENTION_BADGE`; pastikan type-check menangkap missing token. | S |
| H2 | CLH-02 | Conversation List / Pagination | `formatData` mengubah panjang array sementara virtualizer memakai `allRows.length`; unread-only bisa blank row / infinite-scroll tidak fetch page berikutnya. | Major | `ConversationChatLists.tsx:87-109`, `InfiniteVirtualContainer.tsx:246-268`; Track H CLX-03 | **confirmed** | Pakai `processedRows.length` konsisten atau pindahkan unread filter ke BE query. | S-M |
| H3 | CLH-03 | Conversation List / A11y | Virtualized list tidak punya parent `role="list"` dan row `role="listitem"`; screen reader kehilangan struktur/jumlah item. | Major | `ConversationChatLists.tsx:194-210`, `InfiniteVirtualContainer.tsx:246-268`; Track H CLX-15 | **confirmed** | Tambah semantic role di container + row, jaga virtualizer tetap jalan. | S |
| H4 | CLH-04 | Conversation List / Visual | Unread badge tidak clamp angka/label; angka besar bisa overflow dan SR tidak mendapat angka penuh yang aman. | Medium | Track H CLX-02 | **confirmed** | Clamp visual ke `99+`, simpan angka penuh di `aria-label`. | S |
| H5 | CLH-05 | Conversation List / Bulk Action | Select-all state sticky setelah refetch/filter berubah; aksi bulk destruktif bisa mengenai item yang tidak sedang dimaksud. | Medium | `conversationBulkAction.store.ts`; Track H CLX-11 | **confirmed** | Reset `isSelectAllActive` saat dataset/filter berubah atau simpan snapshot selection eksplisit. | S |
| H6 | CLH-06 | Conversation List / Bulk Action | Sebagian bulk action menganggap partial failure sebagai sukses penuh; user tidak tahu item mana gagal. | Medium | `ConversationChatListBulkAction.tsx`; Track H CLX-12 | **confirmed** | Standarkan response partial-success + UI retry/summary. | M |
| H7 | CLH-07 | Conversation List / Channel | Facebook/Messenger prod fallback ke ikon Live Chat; Telegram belum prod jadi future-risk saja. | Low | `ConversationCard.tsx:112-126`; PM answer 2026-09-07; Track H CLX-05 | **confirmed** | Tambah icon mapping Facebook/Messenger; fallback unknown netral. | S |
| H8 | CLH-08 | Conversation List / Content Preview | Email/content preview bisa menampilkan markup mentah bila ingestion tidak selalu plain-text. | Low | Track H CLX-06 | **confirmed** | Pastikan preview memakai plain-text sanitized field atau stripper sebelum render. | S |
| H9 | CLH-09 | Conversation List / Avatar | Avatar initial fallback kurang stabil/kurang jelas untuk nama kosong/duplikat. | Low | Track H CLX-07 | **confirmed** | Fallback ke channel/contact identifier yang deterministic. | S |
| H10 | CLH-10 | Conversation List / Component Drift | `TagList` dan dokumentasi/usage drift; risiko behavior beda antar consumer. | Low | Track H CLX-08 | **confirmed** | Rapikan contract `TagList` dan usage list. | S |
| H11 | CLH-11 | Conversation List / SLA | SLA ticker tetap berjalan untuk closed conversation; re-render tidak perlu di list. | Low | Track H CLX-09 | **confirmed** | Stop/turunkan ticker untuk status closed/non-active. | S |
| H12 | CLH-12 | Conversation List / Filter State | Advanced-filter store memakai `persist` kosong (`partialize: () => ({})`), membuat kebijakan persist filter tidak konsisten dengan filter store lain. | Low | `conversationAdvancedFilter.store.ts`; Track H CLX-13 | **confirmed** | Dokumentasikan no-op persist atau hapus persist wrapper; pilih satu policy filter state. | S |
| H13 | CLH-13 | Conversation List / Keyboard | Row bisa Enter/Space, tapi belum ada ArrowUp/ArrowDown traversal cepat untuk list padat. | Low | `ConversationCard.tsx`; Track H CLX-17 | **confirmed** | Tambah roving focus/arrow navigation di list. | M |
| H14 | CLH-14 | Conversation List / i18n | String aksesibilitas/aria masih hardcoded, tidak lewat `next-intl`. | Low | Track H CLX-18 | **confirmed** | Pindahkan aria/user-visible helper string ke translation key. | S |
| H15 | CLH-15 | Conversation List / Realtime UX | Refresh banner tidak auto-hide / tidak punya expiry; bisa menetap dan mengganggu alur. | Low | `ConversationRefreshNotification.tsx`; Track H CLX-20 | **confirmed** | Auto-hide setelah refresh/success atau TTL singkat. | S |
| H16 | CLH-16 | Shared UI / Error State | `InfiniteVirtualContainer` error branch tidak menerima `noDataError`/custom retry UI; empty-state bisa custom, error-state tidak. | Low | `InfiniteVirtualContainer.tsx:67-76,208-214`; Track H CLX-23 | **confirmed** | Tambah `errorElement` atau teruskan placeholder custom ke error branch. | S |
| H17 | CLH-17 | Conversation List / Realtime | Invalidation socket pada chat-list memicu refetch berulang tanpa debounce; TanStack Query dedupe fetch in-flight, jadi risikonya network churn/noise, bukan thundering herd tak terbatas. | Low | `use-invalidate-conversation.ts`; Track H CLX-19 re-verified 2026-09-07 | **confirmed** | Debounce/gabung invalidation list+counter pada burst event pendek (±250–500ms). | S |

---

## NEEDS-VALIDATION — Track H Conversation-List

| # | ID | Domain | Finding | Severity | Source | Status | Validation needed |
|---|---|---|---|---|---|---|---|
| H18 | CLH-18 | Conversation List / RBAC | Bulk-action visibility/permission gating di FE tidak konsisten dengan permission matrix, tetapi enforcement server-side sudah terbukti sehingga ini bukan authz bypass. | Low | Track H CLX-21 + BE `conversation.controller.ts:147,714,741,768,795,822,851,879,905` | **closed/corrected** | Tidak perlu validasi RBAC lagi; bila mau ditindaklanjuti, pindahkan sebagai UX visibility consistency backlog FE. |

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

## INFERENCE — Track I Conversation-Room PRD-conformance (folded dari `detail-conversation/2026-09-07-conversation-room-deep-audit.md`)

> PRD-conformance audit Room V2 (Rev 2, reviewer gate `ok`). Status `inference` = temuan dokumen/PRD, belum verifikasi kode. Cluster Catastrophe **ROOM-01/02/03 TIDAK jadi ID baru** — dedup sebagai evidence room-specific ke existing **F-01/F-02/V2** (anti double-count). Owner: Dany (PRD) + Naftal (impl).
> **Linked-only (bukan ID baru):** ROOM-01→F-01/V2 (status/reopen cluster), ROOM-02→F-02 (reopen 3 def), ROOM-03→F-01 (SLA 3-way), ROOM-05/06→V8/P-01/P-02 (perf), ROOM-07/22→FS-02/P-05 (socket/event), ROOM-13→cluster reminder Track D. Dicatat sebagai evidence room-specific, BUKAN ID baru (anti double-count).

| # | ID | Domain | Finding | Severity | Evidence | Status | Decision | Remediation/Note |
|---|---|---|---|---|---|---|---|---|
| 1 | CRM-01 | Attachment | Room PRD kontradiktif: attachment max 100MB vs 15MB di file yang sama. | Major | `ROOM-04` (room audit 2026-09-07) | inference | Revise | Room-specific contradiction, bukan overlap. |
| 2 | CRM-02 | Status indicator | Delivery/read status bisa difabrikasi di channel yang tak dukung status. | Major | `ROOM-09` (room audit 2026-09-07) | inference | Proceed w/ cond | Butuh channel capability matrix. |
| 3 | CRM-03 | Composer | Auto-retry butuh idempotency key stabil agar tak dobel-send. | Major | `ROOM-10` (room audit 2026-09-07) | inference | Proceed w/ cond | Link tempMessageId existing. |
| 4 | CRM-04 | RBAC/composer | Collaborator/reassignment race butuh submit-time permission check. | Major | `ROOM-11` (room audit 2026-09-07) | inference | Hold validation | Room-specific authz gap. |
| 5 | CRM-05 | Collaborator | Collaborator role dijanjikan PRD tapi belum dibangun. | Major | `ROOM-12` (room audit 2026-09-07) | inference | Split | Undeveloped feature. |
| 6 | CRM-06 | Hold/Resume | Hold/Resume header/list state belum dibangun. | Major | `ROOM-14` (room audit 2026-09-07) | inference | Split | Depends F-01 (ROOM-03). |
| 7 | CRM-07 | WA group | Group room butuh send-as/quoted/system-message rules. | Major | `ROOM-17` (room audit 2026-09-07) | inference | Split | Cross-channel journey. |
| 8 | CRM-08 | Security/notes | Boundary leakage private-note belum diaudit (customer-visible?). | Major | `ROOM-18` (room audit 2026-09-07) | inference | Hold validation | Multi-tenant notes sweep. |
| 9 | CRM-09 | Accessibility | Klaim WCAG AA tanpa kriteria acceptance konkret utk room. | Major | `ROOM-19` (room audit 2026-09-07) | inference | Revise | Room-specific, terpisah dari list a11y (CLH-03). |
| 10 | CRM-10 | Assignment | Assignment workflow room tak lengkap vs Detail/Permission/Sessions. | Major | `ROOM-23` (room audit 2026-09-07) | inference | Revise | Ownership model. |
| 11 | CRM-11 | API contract | Message content capability matrix kanonik tak ada. | Major | `ROOM-24` (room audit 2026-09-07) | inference | Revise | Channel capability matrix. |
| 12 | CRM-12 | Bot/SLA | Auto-reply bot bubble harus diekslusi dari SLA/agent metric. | Major | `ROOM-26` (room audit 2026-09-07) | inference | Split | Future auto-reply dependency. |
| 13 | CRM-13 | Closed state | Closed immutable room butuh read-only/reopen composer state. | Major | `ROOM-27` (room audit 2026-09-07) | inference | Revise | State machine (⇄ CRX-03). |
| 14 | CRM-14 | PII | Masking PII header room tak selaras masking list. | Major | `ROOM-32` (room audit 2026-09-07) | inference | Hold validation | Security/RBAC sweep. |
| 15 | CRM-15 | Attachment security | Kontrak download/upload security attachment tak lengkap (scan/filename/PII). | Major | `ROOM-34` (room audit 2026-09-07) | inference | Hold validation | Media-service audit (⇄ CRX-15). |

---

## CONFIRMED/NEEDS-VALIDATION — Track J Conversation-Room product-reality (folded dari `detail-conversation/2026-09-07-conversation-room-product-reality-audit.md`)

> Product-reality audit (reviewer gate `ok`): produk aktual FE/BE + memory + heuristik, BUKAN PRD-conformance. `confirmed` = code-verified via spot-check orchestrator (3 finding) + reviewer (6 finding); `needs-validation` = klaim security/runtime belum diuji (no load/axe/pentest). Blocking: **CRX-03** (state drift, confirmed) + **CRX-05/CRX-12** (send/join authz, needs-validation). Cross-ref objek bersama dgn Track I ada di tabel 🔗 Objek Bersama di kepala kedua file audit.
> **Linked-only / positive (bukan ID baru):** ROOMX-04→ROOM-21 (empty state), ROOMX-08→F-07 (raw error leak, room evidence), ROOMX-16→ROOM-21 (degraded states). Dicatat evidence, bukan ID baru. ROOMX-18 (positive email BSON cap) → kontrol positif, bukan defect.

| # | ID | Domain | Finding | Severity | Evidence | Status | Decision | Remediation/Note |
|---|---|---|---|---|---|---|---|---|
| 1 | CRX-01 | Performance | Timeline pakai react-infinite-scroll-component + .map semua item; tak ada virtualization. DOM tumbuh O(N). | Major | `ROOMX-01` (room audit 2026-09-07) | confirmed | Revise | Evidence kode baru; konsep overlap ROOM-05/06 (dicatat). |
| 2 | CRX-02 | State/realtime | Message state duplikat di React-Query + Zustand + localStorage + socket queue; sumber kebenaran ganda. | Major | `ROOMX-02` (room audit 2026-09-07) | confirmed | Revise | Implementation-only; no PRD dup. |
| 3 | CRX-03 | State machine | FE disable composer pakai status `'close'` sedangkan memory/data-model `'closed'` → drift; composer bisa aktif di room terminal. | Catastrophe | `ROOMX-03` (room audit 2026-09-07) | confirmed | Revise | Code drift confirmed (⇄ CRM-13/ROOM-27). |
| 4 | CRX-04 | Accessibility | ARIA footprint di folder room hampir nol; icon-only button tanpa label. | Major | `ROOMX-05` (room audit 2026-09-07) | confirmed | Hold | Evidence kode kuat (⇄ CRM-09/ROOM-19). |
| 5 | CRX-05 | Security/send | Outbound send authz tak terlihat di socket/service boundary. | Catastrophe | `ROOMX-07` (room audit 2026-09-07) | needs-validation | Hold | Actual-path evidence (⇄ ROOM-11/CRM-04). |
| 6 | CRX-06 | PII | Header identity tanpa masking room-level padahal bubble mask. | Major | `ROOMX-09` (room audit 2026-09-07) | needs-validation | Hold validation | Code-specific (⇄ CRM-14/ROOM-32). |
| 7 | CRX-07 | Composer | Enter-send abaikan IME composition guard → kirim prematur di input CJK/IME. | Medium | `ROOMX-11` (room audit 2026-09-07) | confirmed | Proceed w/ cond | Implementation-only UX. |
| 8 | CRX-08 | Macro/a11y | Macro autocomplete tanpa listbox/option semantics. | Medium | `ROOMX-12` (room audit 2026-09-07) | confirmed | Revise | Room actual a11y. |
| 9 | CRX-09 | Re-render | Bubble memo comparator abaikan prop render-affecting (pin/delete/edit/action-disabled) → UI stale. | Major | `ROOMX-13` (room audit 2026-09-07) | confirmed | Revise | Implementation-only. |
| 10 | CRX-10 | State/memory | bubleRefsMap mutasi Zustand in-place, refs null/stale tak di-clear saat pindah room. | Medium | `ROOMX-14` (room audit 2026-09-07) | confirmed | Revise | Implementation-only. |
| 11 | CRX-11 | Attachment | Download fallback pakai copy hardcoded + navigasi URL asli; bisa bypass signed-media path. | Major | `ROOMX-15` (room audit 2026-09-07) | needs-validation | Hold validation | Code evidence (⇄ CRM-15/ROOM-34). |
| 12 | CRX-12 | Security/socket | Join room by id tanpa object-authorization terlihat di handler; klien authenticated bisa join room mana pun. | Catastrophe | `ROOMX-19` (room audit 2026-09-07) | needs-validation | Hold | Critical actual-code; needs-validation (⇄ ROOM-18/32). |
| 13 | CRX-13 | Read path | Repository filter message tak menampakkan tenant/user scope di path yang diperiksa. | Major | `ROOMX-20` (room audit 2026-09-07) | needs-validation | Hold validation | Related read/search auth (⇄ ROOM-31/32). |
| 14 | CRX-14 | UI perf | useIsFetching predikat luas bisa flicker header/input lintas query room/detail. | Low | `ROOMX-21` (room audit 2026-09-07) | inference | Proceed w/ cond | Implementation-only polish. |
| 15 | CRX-15 | Quality gate | FE tanpa automated test padahal room sangat stateful; regresi lolos diam. | Major | `ROOMX-24` (room audit 2026-09-07) | confirmed | Revise | Tie C12/QA-01/INFRA-06 (quality-gate cluster). |
| 16 | CRX-16 | No-session UX | No-session CTA hardcode path WhatsApp-Web; misroute user non-WA/WA-API. | Medium | `ROOMX-25` (room audit 2026-09-07) | needs-validation | Proceed w/ cond | Actual UX unless WA-only. |

---

## CONFIRMED/INFERENCE — Track K Auth/Register/Onboarding/Subscription (12 folded dari `detail-auth/auth-register-onboard-subscription-audit.md`)

> Audit as-built (code) + flow + competitor benchmark. **Shadow domain:** 4 domain live tanpa PRD/memory/test. FE code-verified (branch `data-cy`, commit `7632dd92`); **BE code-verified sesi lanjutan 2026-10-01** (branch `v2.7.0`, commit `3e2d9bc1`) — klaim awal "BE tak ter-clone" SALAH, sudah dikoreksi. P0: **AUTH-02** (REJECTED+APPROVED blank page), **AUTH-03** (`NEXT_PUBLIC_SECRET` browser-exposed, FE-only), **AUTH-12** (topup webhook double-credit, money path). Benchmark detail + URL per klaim di `detail-auth/reference/`. Owner: Dany (PRD) + Naftal (impl).

| # | ID | Domain | Finding | Severity | Evidence | Status | Remediation |
|---|---|---|---|---|---|---|---|
| K1 | AUTH-01 | Seluruh / Governance | Nol PRD + nol memory canonical + nol test untuk 4 domain. Shadow domain di produksi. | P0 | `PRD/` 0 hit; `global-memory.md` 0 mention; FE 0 test (grep *.test/*.spec/*.cy → 0) | **confirmed** | PRD-isasi + angkat baseline ke global-memory |
| K2 | AUTH-02 | Onboarding / UX | `ManageOnboardingPage` hanya handle `onboarding` + `waiting_approval` → `REJECTED` **dan** `APPROVED` jatuh ke `return undefined` = **blank page**. | P0 | FE `ManageOnboardingPage.tsx:19-43` (2 branch); enum `packages/types/src/company.ts:25-30` | **confirmed** | UI state REJECTED (alasan + re-submit) + APPROVED (redirect dashboard) |
| K3 | AUTH-03 | Auth / Security | **FE-only:** `NEXT_PUBLIC_SECRET` dipakai sebagai NextAuth signing secret — ter-inline ke bundle browser. **BE aman** (JWT `jwt.access/refresh.secret` server-only, `getOrThrow`, HS256). | P0 | FE `authOption.ts:174` + `proxy.ts:448`; BE `jwt-token.service.ts:45-46,137-163` (REFUTED weakness) | **confirmed** | Pindah ke server-only `SECRET` (sudah ada di README, tak dipakai) |
| K4 | AUTH-04 | Auth / Perf | Axios refresh tanpa shared mutex; `_retry` per-request. Burst N×401 paralel → N refresh racing. **Single-flight sudah ADA tapi tak dipakai di sini.** | P1 | FE `useAxiosPrivateApi.ts:87-88,136-156`; kontras `helpers/refresh-access-token.ts:74-82` (`refreshInFlight`) | **confirmed** | Reuse `refreshInFlight` dari `refresh-access-token.ts` |
| K5 | AUTH-05 | Session | **BE emit event** (`COMPANY_APPROVE`/`COMPANY_REJECTED` via RabbitMQ → auth-service update onboardingStatus+session). Propagasi BE **ADA**; gap murni FE: session cookie tak refresh tanpa `session.update()`, no socket listener. | P1 | BE `company.service.ts:180,199,422-449` (emit confirmed); FE `useOnboardingForm` manual update | **confirmed** | FE subscribe event approval (socket) → auto `session.update()` |
| K6 | AUTH-06 | Register / Product | Flow "dual registration personal vs org" (assessment 2026-06) **belum terimplementasi**; `register/` = company owner, `register/member/` = invite. Friksi signup tinggi (KYC upfront). | P1 | FE register components; assessment `auth/dual-registration-flow` | **needs-decision** | Putuskan revive dual-flow (assessment lama) |
| K7 | AUTH-07 | Onboarding / Product | Tak ada free trial / free tier; semua user wajib approval + legal KYC sebelum pakai produk. Deviasi 100% dari kompetitor (semua self-serve). | P1 | benchmark §5.1; `onboardingSchema.ts` | **needs-decision** | Keputusan PM: pertahankan (B2B managed) atau tambah trial/self-serve |
| K8 | AUTH-08 | Subscription | Rumus proration **verified** BE: `(remainingDays / totalDaysInMonth) × price` (remainingDays inklusif hari ini). Masuk akal. Upgrade/downgrade punya layer tambahan. | P2 | BE `payment.service.ts:1237-1250` (base) + `subscription.service.ts:975-1061` | **confirmed** | PRD-kan rumus + tinjau layer upgrade/downgrade vs benchmark Slack |
| K9 | AUTH-09 | Subscription | Roll-over **type-dependent** (verified): CHANNEL/AGENT **carry-over** lintas transisi; BROADCAST **reset bulanan** (hangus). Expiry (endDate+10d) tak carry-over. | P2 | BE `quota-usage.service.ts:282-339`, `broadcast-reset.processor.ts:176-196` | **confirmed** | Dokumentasikan per-type di PRD (jangan generalisasi "hangus") |
| K10 | AUTH-10 | Wallet / Security | Payment **webhook auth = static shared-secret header** (APIBayar `webhookKey !== expected`), bukan HMAC. Payment-bill webhook **idempotent** (guard `billingCycle.status !== COMPLETED`). | P1 | BE `payment-webhook.controller.ts` + `webhook-payment.guard.ts:28`; `payment.service.ts:723` | **confirmed** | Pertimbangkan HMAC + replay-nonce; static secret OK bila rotate + TLS |
| K11 | AUTH-11 | Auth / Product | Tak ada SSO/SAML/social login (hanya Credentials, BE-confirmed: cuma `local` + `refresh` Passport strategy). Enterprise buyer biasa minta SAML. | P2 | FE `authOption.ts`; BE `strategies/local.strategy.ts` + `refresh.strategy.ts` (no SSO) | **needs-decision** | Keputusan roadmap |
| K12 | AUTH-12 | Wallet / Data Integrity | **Topup webhook TIDAK idempotent** → double-credit saldo saat gateway re-deliver "Paid". `handleTopupWebhook` update status lalu `$inc token` tanpa guard status-sebelumnya (beda dari payment-bill path yang di-guard). **Money path.** | P0 | BE `wallet.service.ts:459-498` (`updateToken` `$inc` di `wallet.repository.ts:88`), kontras `payment.service.ts:723` | **confirmed** | Guard status `!= Paid` sebelum `$inc`, atau atomic `findOneAndUpdate({status:{$ne:Paid}})`. Deduct path (`deductToken` `$expr:$gte`) sudah aman |

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
| ENV-01 | Major | **CLOSED** | Target operasional sudah dikunci oleh PM: `prod-2.8.1`; memory FE/BE jadi patokan utama |
| F-01, F-02 (V1, V2) | Catastrophe | **REVISE_PRD** | PRD saling bertentangan — butuh lock policy PM+Eng |
| F-03, F-04, F-05, SLA-mode (V3-V6) | Major | **HOLD_FEATURE** | Keputusan bisnis SLA belum diambil |
| C1-C16 + CSN-01..02 + CSN-04 + CSN-06..09 + CSN-12 + CLH-01..16 | Major/Medium/Low | **PROCEED** | Fix code-verified, backlog biasa |
| CRX-03 | Catastrophe | **PROCEED** | Code drift `'close'` vs `'closed'` confirmed — patch shared status helper, quick fix |
| CRX-05, CRX-12 | Catastrophe | **HOLD_FEATURE** | Object-authz socket send/join — validasi WsAuthGuard + negative test dulu sebelum ticket |
| CRX-01, CRX-02, CRX-09, CRX-10, CRX-15 | Major/Medium | **PROCEED** | Code-verified engineering debt (virtualization, state coupling, memo, refs, test) |
| CRM-01..15 | Major | **REVISE_PRD / SPLIT** per kolom Decision | Temuan dokumen — masuk backlog PRD revision, bukan ticket engineering langsung |
| AUTH-01 | P0/Major | **REVISE_PRD** | Shadow domain — PRD-isasi 4 domain + angkat baseline ke global-memory |
| AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-08, AUTH-09, AUTH-10, AUTH-12 | P0/P1/P2 | **PROCEED** | Code-verified FE+BE — langsung remediation (REJECTED/APPROVED UI, server-only secret, single-flight refresh, session sync via event, proration/quota dokumentasi, HMAC webhook, **AUTH-12 topup idempotency guard P0**) |
| AUTH-06, AUTH-07, AUTH-11 | P1/P2 | **HOLD_FEATURE** | Keputusan produk PM: dual-flow revive / trial-vs-managed-onboarding / SSO-SAML roadmap |

---

## Statistik

| Status | Jumlah |
|---|---|
| Confirmed (prioritas) | 7 |
| Confirmed (kontrol positif) | 10 |
| Confirmed (non-prioritas) | 16 |
| Confirmed (Track F infra Critical) | 10 |
| Confirmed (Track G sidebar-navigation) | 8 |
| Confirmed (Track H conversation-list) | 17 |
| Confirmed (Track J room product-reality) | 9 |
| Confirmed (Track K auth/register/onboard/subscription) | 9 |
| Inference (Track I room PRD) | 15 |
| Inference (Track J room product-reality) | 1 |
| Needs-validation | 35 |
| Needs-decision (Track K product/roadmap) | 3 |
| Corrected | 2 |
| Closed (dup/operational) | 2 |
| **Total** | **144** |

---

## Catatan Eksekusi

1. **Item 1-7 (confirmed prioritas)** = langsung jadi ticket engineering. Tidak butuh keputusan PM — bukti kode sudah cukup. **ENV-01 sudah di-resolve operasional:** branch kerja sekarang `prod-2.8.1`; memory FE/BE tetap patokan utama bila dokumen lama menyebut 2.7.x/2.8.0.
2. **Item V1-V6 (Catastrophe + SLA decisions)** = butuh **decision meeting PM+Eng** sebelum bisa jadi ticket. Ini bukan bug — ini keputusan bisnis yang belum diambil.
3. **Item V1-V6, V8-V26, CSN-03/05/10/11 (needs-validation / decision)** = butuh verifikasi kode/metric atau keputusan PM+Eng sebelum jadi ticket final. **CLH-17** sudah confirmed Low dan masuk backlog engineering; **CLH-18** closed/corrected, bukan ticket.
4. **FS-05 (corrected)** = jangan masuk backlog. DLQ sudah ada. Tapi `retryTracker` in-memory = temuan lanjutan (state hilang antar-restart).
5. **Branch:** target operasional sekarang `prod-2.8.1`; memory FE/BE adalah patokan utama. Dokumen lama yang menyebut `prod-2.7.0`/`v2.8.0` dianggap baseline historis.
6. **Track I/J Conversation Room:** kerjakan per **objek bersama**, bukan per file. Buka cross-ref dua arah di kedua audit. CRM = PRD/contract work; CRX = code/runtime work. Jangan buat dua ticket untuk pasangan CRM⇄CRX yang satu objek; satu work package, dua acceptance layer.
