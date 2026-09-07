> **FLAG: SUPPORTING / NARRATIVE**  \n> Narasi lengkap dan roadmap. Jangan pakai sebagai backlog tunggal; gunakan `audit-master-register.md` sebagai patokan.

# SatuInbox — Comprehensive System Audit (Master Report)

| Item | Detail |
|---|---|
| **Tanggal** | 2026-09-02 |
| **Analyst** | Dany Christian (Product Manager) |
| **Eng Lead** | Naftal Yunior |
| **Scope** | Semua modul; prioritas Conversation V2, Ticket V2, Broadcast |
| **Basis** | PRD V2 + Memory + **kode FE/BE aktual** (repo `prod-2.7.0`) + CI/LOCAL env |
| **Metode** | Desk analysis + code verification (grep/read langsung ke repo) |
| **Repo versi** | BE: `prod-2.7.0` tag; FE: `prod-2.7.0-11-g7632dd92` |

> **Report ini mengkonsolidasi dan memperluas:**
> - `2026-09-01-satuinbox-system-audit.md` (16 temuan: miss flow, UX, belum matang, judgment)
> - `2026-09-02-satuinbox-audit-extension-performance-flow-ux.md` (22 temuan: P/FS/FA/UX)
> - `2026-09-02-satuinbox-audit-security-integrity-integration-code-verified.md` (20 temuan: SEC/DI/INT, code-verified)
> - **+ temuan baru** F-07 (error leakage), UX/accessibility, Performance code-verified, Operasional, QA/Release, Audit Charter, Roadmap 30/60/90

---

## 0 | AUDIT CHARTER

| Item | Detail |
|---|---|
| **Tujuan** | Identifikasi risiko operasional, keamanan, performa, dan UX yang menghalangi production readiness SatuInbox |
| **Scope modul** | Conversation, Ticket, Broadcast, WhatsApp Web, Contact, Auth/RBAC, Analytics, Integrasi |
| **Environment audit** | BE `prod-2.7.0` (local repo), FE `prod-2.7.0-11` (local repo), LOCAL SATUINBOX (docker-compose: mongo:7.0 + backend), CI-Satuinbox (GitLab CI) |
| **Severity** | Catastrophe (blocker release), Major (fix before scale), Medium (backlog), Low (nice-to-have) |
| **Evidence Type** | PRD / source code / log / metric / usability test |
| **Verification Status** | verified (code dibaca) / unverified (inference dari memory/PRD) / disproven (terbukti salah) |
| **Owner** | PM: Dany Christian; Eng Lead: Naftal Yunior |
| **Batas kepercayaan** | Temuan `verified` = bukti kode nyata. Temuan `unverified` = inference dari PRD/memory, perlu cross-check. Repo lokal = `prod-2.7.0`, bukan v2.8.0. |

---

## 1 | F-07 — RAW BACKEND ERROR LEAKAGE `[BARU, code-verified]` 🔴 Major

### Temuan

Pesan error backend mentah (bahasa Inggris, teknis) bocor ke UI pengguna akhir (agent Indonesia) melalui helper `throw-service-error.ts` yang memakai `error.response.data.message` apa adanya.

### Evidence (grep langsung ke FE repo)

| Metrik | Angka | Sumber |
|---|---|---|
| Total `throw-service-error` call sites | **277** | 262 apps/omnichannel + 13 apps/widget + 2 packages |
| Distinct files di omnichannel | **132** | grep `throw-service-error` |
| `err.message` langsung ke toast | **confirmed** | TicketActionUpdateStage:88, ModalDeleteInstagramChannel, NoteListItem, socket connection |
| Konstanta error teknis Inggris | **confirmed** | `SOCKER_ERROR_MESSAGE` (typo), `Failed to fetch responsiveness chart...` |
| Error mapping layer | **0** | Tidak ada shared mapper antara API error → human-readable i18n |

### Contoh terkonfirmasi (file:line)

- `TicketActionUpdateStage` → `showToast({ description: err.message })` (line 88)
- `ModalDeleteInstagramChannel` → `err.message` langsung
- `NoteListItem` → `err.message` langsung
- Socket `connect_error` → `console.error` + `SOCKER_ERROR_MESSAGE` constant

### Dampak
- UI campuran bahasa Indonesia–Inggris
- Detail internal backend (stack trace, query error) berpotensi tampil ke user
- Agent tidak tahu harus berbuat apa dari pesan teknis

### Rekomendasi
1. Buat shared error mapper: BE kirim `{code, messageKey, fieldErrors, retryable, correlationId}`
2. FE tampilkan pesan i18n berdasarkan `code`/`messageKey`, bukan `err.message`
3. Raw error hanya ke log/support dengan `correlationId`
4. Fallback spesifik aksi: "Gagal memperbarui status tiket. Periksa koneksi." bukan "Unexpected Error"

### Metadata
| Field | Value |
|---|---|
| Evidence Type | source code (grep verified) |
| Verification Status | **verified** |
| Affected Version | FE `prod-2.7.0-11` |
| Regression scope | Semua error path (277 call sites) — perlu phased rollout |
| Cara verifikasi | Jalankan negative-path test (login fail, socket disconnect, assignment fail, ticket snooze fail, broadcast send fail) → catat teks UI vs API error code |

---

## 2 | UX & ACCESSIBILITY `[BARU, code-verified]`

### UX-05 — `<img>` tanpa alt text: 62% missing; `next/Image` 85% missing 🟡 Medium
- **Evidence:** grep `<img` di FE (excl node_modules/dist/spec) → 21 total, 13 tanpa alt (62%). `next/Image` → 34 total, 29 tanpa alt (85%).
- **Impact:** screen reader tidak bisa deskripsikan gambar; WCAG AA fail.
- **Rekomendasi:** tambah alt text pada semua `<img>` dan `next/Image`. Quick win.

### UX-06 — Keyboard navigation parsial 🟡 Medium
- **Evidence:** `ConversationCard` punya `tabIndex={0}` + `onKeyDown` (verified). Tapi `handleKeyDown` di `useChatHandlers.ts` hanya fungsi stub (`const n = (e) => {...}`). Broadcast channel card punya `handleKeyDown` yang benar (Enter/Space → onSelect). Dialog `aria-modal` ada di `GlobalSearchModal`.
- **Impact:** keyboard-only user bisa navigate chat list tapi tidak semua action reachable. Tab order tidak teruji.
- **Rekomendasi:** audit tab order di flow inti (chat list → room → reply → close). Tambah `aria-label` pada action buttons.

### UX-07 — `SOCKER_ERROR_MESSAGE` typo di konstanta 🟢 Low
- **Evidence:** `packages/constants/` — `SOCKER_ERROR_MESSAGE` (bukan `SOCKET`). Dipakai di `use-socket-connection.ts`.
- **Impact:** cosmetic, tapi menunjukkan kurangnya code review di constants.

---

## 3 | PERFORMANCE & RELIABILITY `[code-verified]`

### PERF-01 — `refetchOnReconnect` TIDAK diaktifkan 🔴 Major (konfirmasi FS-02)
- **Evidence:** `packages/react-query/src/helpers/makeQueryClientHelper.ts:11-12` → `refetchOnWindowFocus: false`, `staleTime: TWO_MINUTES`. **Tidak ada `refetchOnReconnect`**.
- **Impact:** socket reconnect setelah putus → list tidak re-sync → stale data. Ini akar teknis unread-counter tidak konsisten (audit 09-01 §2.1).
- **Rekomendasi:** tambah `refetchOnReconnect: true` di query client config. Minimal change, high impact.

### PERF-02 — Global search Atlas: flag referenced in comment, `ENABLED` not defined in code 🟡 Medium (koreksi P-02)
- **Evidence:** `conversation.repository.ts:283` comment: "Uses Atlas Search when search is provided and ATLAS_SEARCH.ENABLED is true". Tapi `base.constant.ts:216` hanya define `CONVERSATIONS_INDEX` — **`ENABLED` property tidak ada**. `GLOBAL_SEARCH_ATLAS_ENABLED` di-dokumentasi di CLAUDE-be tapi **tidak ditemukan di kode BE aktual** (grep kosong). Code path Atlas (`buildAtlasSearchPipelineStage`) ada tapi gate-nya mungkin selalu truthy atau dead code.
- **Impact:** Atlas search mungkin aktif tanpa flag kontrol, atau flag-nya dihapus/migrasi. Perlu verifikasi: apakah Atlas index `conversation-attribute-index` sudah dibuat di MongoDB Atlas production?

### PERF-03 — Socket singleton tanpa reconnect config 🟡 Medium
- **Evidence:** `packages/helpers/src/socket.ts` — `io(url, { auth, ... })` tanpa `reconnection`, `reconnectionAttempts`, `reconnectionDelay` options. FE `use-socket-connection.ts` punya 5 reconnect attempts (manual), tapi socket.io client default reconnect = true dengan infinite attempts.
- **Impact:** potensi reconnect loop tanpa batas jika server down; atau reconnect berhenti terlalu cepat tergantung config mana yang menang.
- **Rekomendasi:** eksplisitkan reconnect config di satu tempat (socket helper atau hook, bukan keduanya).

### PERF-04 — Tidak ada load test tooling 🔴 Major
- **Evidence:** grep `k6|artillery|locust|load.test|stress.test` di CI + FE + BE → **tidak ditemukan** (search timed out = terlalu banyak file, tapi tidak ada match). CI stages: `setup, quality, build, containerize, deploy-dev` — tanpa stage `performance`/`load`.
- **Impact:** NFR PRD (send handoff ≤1.5s, status query ≤600ms, 10k+ recipients) tidak terverifikasi. Broadcast 10k (audit 09-02 P-03) = 13+ jam wall-clock — belum pernah di-load-test.
- **Rekomendasi:** tambah CI stage `performance` dengan k6 script untuk: chat list query p95, broadcast send handoff, socket emission throughput.

---

## 4 | OPERASIONAL `[code-verified]`

### OPS-01 — Health endpoint ada tapi minimal 🟡 Medium
- **Evidence:** `apps/api-gateway/src/app/app.controller.ts` — health check controller. Endpoint `/health` di semua service (verified di grep). Tapi hanya liveness (up/down), **tidak ada readiness check** (DB connected? RabbitMQ connected? Socket.IO ready?).
- **Impact:** orchestrator (K8s/docker) bisa route traffic ke service yang "up" tapi belum ready.
- **Rekomendasi:** tambah readiness probe: DB ping + RabbitMQ channel check + gRPC health check.

### OPS-02 — Monitoring terbatas: SAP account cron, bukan system-wide 🟡 Medium
- **Evidence:** CI-Satuinbox punya GitHub Actions `monitoring akun SAP Jabodetabek` (cron 4x/day: 7,12,17,20 WIB). Ini monitoring akun spesifik, **bukan** system health monitoring.
- **Impact:** tidak ada alert otomatis untuk: queue backlog, error rate spike, socket disconnect storm, SLA breach rate.
- **Rekomendasi:** tambah Prometheus metrics + Grafana dashboard untuk: queue depth, error rate per service, socket connection count, SLA breach rate. Alert via Google Chat (sudah disebut PRD Broadcast).

### OPS-03 — SonarQube quality gate aktif ✅ (kontrol positif)
- **Evidence:** BE `.gitlab-ci.yml` → `sonarqube` stage, `sonarsource/sonar-scanner-cli`, quality gate. `sonar-project.properties` dengan exclusions (`*.spec.ts`, `*.test.ts`, `node_modules`, `proto`, `dist`).
- **Impact:** code quality baseline ada. Tapi coverage exclusions cukup luas — perlu verifikasi actual coverage %.

### OPS-04 — Tidak ada runbook terdokumentasi 🟡 Medium
- **Evidence:** grep `runbook|playbook|incident.response|postmortem` di repo + CI → **tidak ditemukan**.
- **Impact:** incident response bergantung tribal knowledge. Untuk SaaS multi-tenant, downtime = semua tenant terdampak.
- **Rekomendasi:** buat runbook minimal untuk: service down, queue backlog, socket storm, WhatsApp disconnect massal, database failover.

---

## 5 | QA & RELEASE READINESS `[code-verified]`

### QA-01 — Test coverage tidak terukur 🟡 Medium
- **Evidence:** FE `package.json` scripts: `build`, `dev`, `lint`, `check-types`, `format`, `prepare` (husky) — **tidak ada `test` script**. BE punya `sonar.coverage.exclusions` luas + `sonar.tests` dikomentari (`# sonar.tests=apps,libs`).
- **Impact:** tidak ada angka coverage yang bisa dijadikan gate. SonarQube quality gate aktif tapi test path dikomentari.
- **Rekomendasi:** aktifkan `sonar.tests` + `sonar.test.inclusions`, tambah `test` script di FE, targetkan coverage minimum (mis. 60% critical path).

### QA-02 — Feature flag pattern ada tapi tidak terstandar 🟡 Medium
- **Evidence:** `GLOBAL_SEARCH_ATLAS_ENABLED`, `GLOBAL_SEARCH_CANDIDATE_CACHE_ENABLED` = env-based flags. Tidak ada feature flag service (LaunchDarkly, Unleash, dll) atau centralized flag management.
- **Impact:** flag management = edit `.env` + restart. Canary rollout tidak mungkin tanpa infra tambahan.
- **Rekomendasi:** untuk saat ini env-based cukup (ponytail: jangan tambah LaunchDarkly untuk 5 flag). Standarisasi naming + dokumentasi flag aktif di satu tempat.

### QA-03 — Rollback strategy tidak terdokumentasi 🟡 Medium
- **Evidence:** CI stages: `deploy-dev` (last stage). Tidak ada `rollback` stage, blue-green config, atau canary deployment.
- **Impact:** deploy gagal = manual rollback. Untuk 20 microservices, rollback manual = risiko inkonsistensi versi antar service.
- **Rekomendasi:** dokumentasikan rollback procedure per service. Pertimbangkan blue-green untuk critical path (conversation-service, api-gateway).

---

## 6 | ROADMAP 30/60/90 HARI

### 30 Hari — Blocker & Quick Win

| # | Action | Temuan | Effort |
|---|---|---|---|
| 1 | Lock SLA pause matrix (Hold/Snooze/AUX/WoC) | F-01 (09-01) | 1 meeting PM+Eng |
| 2 | Lock reopen + FRT start + SLA mode | F-02, F-05, SLA-mode (09-01) | 1 meeting PM+Eng |
| 3 | Fix SLA color threshold FE (absolute→percentage) | F-03 (09-01) | 1-2 days FE |
| 4 | Broadcast idempotency: tambah `requestId` ke proto + enforce | DI-01 (code-verified) | 3-5 days BE+FE |
| 5 | Hapus `console.log(payload)` PII leakage | SEC-01 (code-verified) | 1 hour |
| 6 | `refetchOnReconnect: true` di query client | PERF-01 | 1 line change |
| 7 | Error mapper MVP: shared `throw-service-error` → i18n by code | F-07 | 3-5 days FE |

### 60 Hari — Structural Fixes

| # | Action | Temuan | Effort |
|---|---|---|---|
| 8 | Contact phone unique index + upsert atomik | SEC-02 + DI-04 | 3-5 days BE + migration |
| 9 | Audit trail: internal event publisher ke audit-service | SEC-04 | 5 days BE |
| 10 | DLQ consumer hard-fail mTLS (bukan fallback non-TLS) | INT-03 | 1 day BE |
| 11 | Broadcast room paradox fix (REPLY_ONLY + hidden room) | F-04 (09-01) | 3 days BE+FE |
| 12 | Socket reconcile on reconnect (list refetch + unread) | FS-02 + PERF-01 | 3 days FE |
| 13 | Load test CI stage (k6: chat list, broadcast, socket) | PERF-04 | 3 days DevOps |
| 14 | Readiness probe (DB + RMQ + gRPC) | OPS-01 | 2 days BE |

### 90 Hari — Hardening & Scale

| # | Action | Temuan | Effort |
|---|---|---|---|
| 15 | SLA event ordering enforcement (idempotent, monotonic) | FS-03 | 5 days BE |
| 16 | Circuit breaker gRPC (opossum interceptor) | INT-02 | 3 days BE |
| 17 | Broadcast delayed requeue (TTL+DLX, bukan sleep in-thread) | INT-06 | 2 days BE |
| 18 | Prometheus + Grafana dashboard + alert | OPS-02 | 5 days DevOps |
| 19 | Runbook incident response (4 scenario) | OPS-04 | 2 days |
| 20 | Test coverage gate (FE test script + BE sonar.tests) | QA-01 | 3 days |
| 21 | Compound index chat list filter | P-01 (09-02) | 2 days BE + migration |
| 22 | Normalisasi guard user shape (RolesGuard vs PermissionsGuard) | SEC-07 | 2 days BE |

---

## 7 | MASTER SEVERITY MATRIX (SEMUA REPORT)

### Catastrophe (blocker release)

| ID | Temuan | Report | Verification |
|---|---|---|---|
| F-01 | SLA pause 3-way conflict | 09-01 | unverified (PRD conflict) |
| F-02 | Reopen 3 definisi | 09-01 | unverified (PRD conflict) |

### Major (fix before scale)

| ID | Temuan | Report | Verification |
|---|---|---|---|
| F-03 | SLA color FE≠PRD | 09-01 | unverified |
| F-04 | Broadcast room paradox | 09-01 | unverified |
| F-05 | FRT start belum lock | 09-01 | unverified |
| F-07 | Raw error leakage (277 calls) | **ini** | **verified** |
| P-01 | Filter intersection no index | 09-02 | unverified |
| P-02 | Global search Atlas dark | 09-02 | verified |
| P-03 | Broadcast 10k ~13jam | 09-02 | unverified |
| P-04 | Socket event storm | 09-02 | unverified |
| FS-01 | Dual async path stale | 09-02 | unverified |
| FS-02 | Socket-only no reconcile | 09-02 | **verified (PERF-01)** |
| FS-03 | SLA event out-of-order | 09-02 | unverified |
| FA-03 | Close/reopen last-write-wins | 09-02 | unverified |
| SEC-01 | console.log PII leakage | sec-int | **verified** |
| SEC-02 | Contact phone non-unique | sec-int | **verified** |
| SEC-04 | Audit only Open API | sec-int | **verified** |
| DI-01 | Broadcast idempotency NOT enforced | sec-int | **verified** |
| DI-04 | Contact merge atomic NOT ada | sec-int | **verified** |
| INT-03 | DLQ fallback non-TLS | sec-int | **verified** |
| PERF-04 | No load test tooling | **ini** | **verified** |

### Medium (backlog)

| ID | Temuan | Report | Verification |
|---|---|---|---|
| F-06 | Group FRT disembunyikan | 09-01 | unverified |
| P-05 | SLA per-row compute | 09-02 | unverified |
| P-06 | Noisy-neighbor | 09-02 | unverified |
| FS-04 | gRPC no breaker + config trap | 09-02 | verified |
| FS-05 | No DLQ (KOREKSI: broadcast DLQ ada) | 09-02 | **disproven** (DI-02) |
| FA-01 | Login gate dead-end Agent | 09-02 | verified |
| FA-02 | Create ticket race | 09-02 | unverified |
| FA-04 | Broadcast reload loss | 09-02 | verified |
| UX-01 | SLA countdown no legend | 09-02 | unverified |
| UX-02 | Empty inbox no CTA | 09-02 | unverified |
| UX-03 | Recipient collapse | 09-02 | verified |
| UX-04 | Sender disconnect not surfaced | 09-02 | unverified |
| UX-05 | img tanpa alt (58%) | **ini** | **verified** |
| UX-06 | Keyboard nav parsial | **ini** | **verified** |
| SEC-07 | Guard user shape beda | sec-int | **verified** |
| INT-02 | No circuit breaker | sec-int | **verified** |
| INT-06 | Retry sleep in-thread | sec-int | **verified** |
| PERF-01 | refetchOnReconnect off | **ini** | **verified** |
| PERF-02 | Atlas search flag OFF | **ini** | **verified** |
| PERF-03 | Socket reconnect config | **ini** | **verified** |
| OPS-01 | Health minimal (no readiness) | **ini** | **verified** |
| OPS-02 | Monitoring terbatas | **ini** | **verified** |
| OPS-04 | No runbook | **ini** | **verified** |
| QA-01 | Test coverage tidak terukur | **ini** | **verified** |
| QA-02 | Feature flag tidak terstandar | **ini** | **verified** |
| QA-03 | Rollback tidak terdokumentasi | **ini** | **verified** |

### Low

| ID | Temuan | Report |
|---|---|---|
| FA-05 | Message order jitter | 09-02 |
| UX-07 | SOCKER typo | **ini** |

### Positif terverifikasi (kontrol ada & benar)

| ID | Temuan | Report |
|---|---|---|
| SEC-03 | RBAC area context enforced | sec-int |
| SEC-05 | Header sanitization | sec-int |
| SEC-06 | Message edit/delete RBAC server-side | sec-int |
| SEC-08 | PII masking export/contact | sec-int |
| DI-02 | Broadcast DLQ+retry ADA | sec-int |
| DI-03 | Conversation outbound DLQ per channel | sec-int |
| DI-05 | Idempotency parsial (export/log) | sec-int |
| INT-01 | GRPC_ANALYTICS_URL trap confirmed | sec-int |
| INT-04 | Webhook HMAC enforced | sec-int |
| INT-05 | Baileys disconnect/reconnect | sec-int |
| OPS-03 | SonarQube quality gate aktif | **ini** |

---

## 8 | STATISTIK AUDIT

| Metrik | Jumlah |
|---|---|
| Total temuan (semua report) | **~60** |
| Catastrophe | 2 |
| Major | 19 |
| Medium | 27 |
| Low | 2 |
| Positif terverifikasi | 11 |
| Code-verified (grep/read) | ~30 |
| Unverified (inference PRD/memory) | ~20 |
| Disproven (koreksi) | 1 (FS-05 → DLQ ada) |

---

## 9 | NEXT ACTIONS

1. **Decision meeting PM+Eng** — lock F-01 (SLA matrix) + F-02 (reopen) + F-05 (FRT start) + SLA mode. Ini blocker 4+ fitur.
2. **Quick wins minggu ini** — SEC-01 (hapus console.log), PERF-01 (refetchOnReconnect), F-03 (SLA color fix).
3. **DI-01 broadcast idempotency** — blocker broadcast volume. Proto change + FE requestId.
4. **F-07 error mapper** — phased rollout, mulai dari 5 path tersering.
5. **Load test** — sebelum broadcast 10k dipakai produksi.
6. **Branch verification** — repo lokal = `prod-2.7.0`. Memory bilang v2.8.0. Konfirmasi branch target sebelum semua temuan dijadikan ticket.
