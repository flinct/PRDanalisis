# QA Assessment Report — WhatsApp Web Outbound Anti-Ban Guard

## 1. Overview

| Item | Value |
|------|-------|
| **Feature** | WhatsApp Web Outbound Anti-Ban Guard |
| **PRD Source** | `PRD/Whatsapp web v2/PRD WA Web Outbound Anti-Ban Guard.md` |
| **Assessment Path** | `Assessments/whatsapp-web/outbound-anti-ban-guard-qa-assessment.md` |
| **Version** | v1.0 |
| **Rules Applied** | `qa-analysis-rule.md`, `impact-analysis-rule.md`, `global-memory.md` |
| **Analysis Date** | 2026-07-16 |
| **Status** | Draft |

---

## 2. Decision Summary

| Field | Value |
|-------|-------|
| **Final Decision Enum** | `PROCEED_WITH_CAUTION` |
| **Decision Class** | `CONDITIONAL_GO` |
| **Decision Statement** | PRD ini sangat matang — requirement detail, scope jelas, state machine lengkap, error handling komprehensif. Namun ada **7 critical gap & risiko** yang harus diselesaikan SEBELUM engineering memulai implementasi. |
| **Complexity Level** | **HIGH** — melibatkan real-time risk scoring engine, idempotency layer, concurrency locking, reconciliation flow, integrasi dengan existing outbound pipeline dan broadcast worker. |
| **Risk Level** | **HIGH** — risiko false positive blocking yang mengganggu operasional agent, concurrency race condition antara multi-worker broadcast, dan integrasi dengan existing anti-spam system yang belum developed. |
| **Required Actions Before Dev** | Lihat bagian Rekomendasi |
| **Key Blocking Reasons** | 1) Belum ada impact analysis yang eksplisit terhadap existing system. 2) Integrasi dengan Anti Spam System yang belum developed. 3) Belum ada spesifikasi teknis untuk risk scoring engine. |

---

## 3. Impact Analysis — Sudah Ada atau Belum?

### Jawaban: **BELUM ADA IMPACT ANALYSIS EKSPLISIT**

PRD tidak memiliki section atau referensi ke impact analysis terhadap:
- **Existing WA Web outbound system** — bagaimana integrasi dengan current send pipeline?
- **Anti Spam System (5 file)** — disebut di Assumptions sebagai reused, tapi tidak ada analisis dampak overlap atau konflik
- **Broadcast worker** — disebut di Scope, tapi tidak ada analisis concurrency impact
- **Conversation room manual send** — FE submit protection disebut (FR-012), tapi tidak ada detail impact ke UX flow existing

### Yang Harus Dilakukan

Buat **Impact Analysis Document** yang mencakup:

#### 3.1 Direct Impact — Existing WA Web Outbound

**Current state:** WA Web V2 belum punya outbound pipeline yang mature. Implementasi existing:
- BE: `baileys.service.ts` — raw `sendMessage` dengan human-like simulation (typing, delay)
- FE: Send button di conversation room → langsung panggil API send
- Broadcast: worker-based, tanpa dedupe, tanpa risk scoring

**Impact yang harus dianalisis:**
- Perubahan dari `sendMessage` langsung → pre-send validation via `POST /api/wa/outbound/validate`
- Integrasi idempotency key generation ke setiap outbound request
- Perubahan retry flow — dari blind resend → reconciliation-aware
- Locking mechanism untuk broadcast worker

#### 3.2 Indirect Impact — Anti Spam System (Belum Developed)

**Critical finding:** PRD ini mengasumsikan Anti Spam System (broadcast humanization, warming, account pools rotation) sebagai **reused** canonical source of truth. 

**Fakta dari Global Memory:** Anti Spam System **BELUM DEVELOPED** — baik FE maupun BE.

**Risk:**
- Jika Anti-Ban Guard dibangun dulu, nanti Anti Spam System dibangun belakangan → **double work, konflik logika, dan inconsistency**.
- Contoh konkret: Account rotation logic di Anti Spam System (Account Pools V2 file 4) vs safe mode logic di Anti-Ban Guard — bisa saling override.

**Rekomendasi:**
- Definisikan **dependency order**: Anti-Ban Guard vs Anti Spam System
- Jika Anti-Ban Guard jalan duluan, pastikan **interface segregation** sehingga Anti Spam System bisa plug-in later
- Jangan sampai Anti-Ban Guard membuat asumsi yang mengunci arsitektur Anti Spam System

#### 3.3 Impact ke Broadcast System

**Current broadcast flow:** Worker mengambil recipient list → sendMessage per recipient → no dedupe. 

**Dengan Anti-Ban Guard:**
- Setiap recipient melewati `POST /api/wa/outbound/validate` — **additional latency**
- Recipient-level lock — **potential bottleneck untuk large broadcast**
- Broadcast burst threshold berbeda dengan manual send (FR-020) — perlu konfigurasi terpisah

**Performance concern:** PRD NFR-01 bilang pre-send validation ≤ 100ms p95. Tapi untuk broadcast 10,000 recipient:
- 10,000 × 100ms = 1,000 seconds (16.7 menit) tambahan waktu sebelum broadcast dimulai
- Ini hanya validation — belum termasuk actual send

#### 3.4 Impact ke Conversation Room (Manual Send)

**FE Impact:**
- FR-012: UI disable repeated submit — perlu perubahan komponen send button
- EH-001 sampai EH-008: Semua error handling butuh Bahasa Indonesia toast/warning baru
- Operator risk warning (US-006) — inline warning system baru

**BE Impact:**
- Setiap manual send harus melewati risk scoring
- Cooldown/throttle per operator dan per account
- Safe mode integration — akun yang masuk safe mode harus langsung distop

---

## 4. Gap Analysis & Revisi yang Diperlukan

### Gap 1: Risk Scoring Engine — Black Box

**Masalah:** PRD menyebut risk scoring (FR-014, FR-015) tapi:
- Tidak ada spesifikasi **bagaimana scoring dihitung**
- Tidak ada definisi **bobot per signal** (paste, cadence, content similarity)
- Tidak ada threshold numeric untuk setiap enforcement mode
- Tidak ada definisi **rolling window** — sliding window? fixed window? decay function?

**Risiko:**
- Developer akan membuat asumsi sendiri → inconsistency dengan ekspektasi Product
- QA tidak punya baseline untuk validasi scoring accuracy
- False positive rate tidak bisa diukur

**Revisi yang diperlukan:**
Tambah sub-section di Functional Requirements:

```
FR-014a [P0]: Risk scoring formula MUST use weighted sum of signals:
  - pasteSignal: weight 0.3 — binary (paste detected / not)
  - composeToSendDurationMs: weight 0.4 — linear scale (faster = higher risk)
  - contentSimilarityScore: weight 0.2 — cosine similarity to last N messages
  - burstFrequency: weight 0.1 — count of sends in rolling 60s window

FR-014b [P0]: Rolling risk score calculation:
  - Window: sliding 60-second window, reset on cooldown
  - Score range: 0-100
  - Decay: 50% reduction per minute of normal activity

FR-014c [P0]: Threshold mapping:
  - monitor_only: log only, no action
  - warning_only: warn at score > 40
  - soft_block: delay at score > 50, queue at > 70
  - strict: block at score > 40
```

### Gap 2: Dedupe Fingerprint Specification — Detail Kurang

**Masalah:** FR-001 menyebut `normalized content fingerprint` tapi:
- Tidak ada spesifikasi **normalization rules**
- Tidak disebutkan apa yang termasuk dalam idempotency key (tenant, channel, sender, recipient, content, source, scope)
- EC-005 menyebut whitespace/capitalization handling tapi tidak detail

**Risiko:**
- Implementasi fingerprint bisa berbeda antara developer → false positive atau miss duplicate
- Dua pesan "Halo" vs "halo " (spasi tambahan) bisa dianggap berbeda

**Revisi yang diperlukan:**

```
FR-001a [P0]: Content normalization MUST:
  - Trim leading/trailing whitespace
  - Collapse multiple spaces to single space
  - Convert to lowercase
  - Remove zero-width characters (U+200B, U+200C, U+200D, U+FEFF)
  - Preserve emoji and non-latin characters as-is

FR-001b [P0]: Idempotency key components (ordered):
  1. tenantId
  2. channelType (fixed: "whatsapp")
  3. senderAccountId
  4. recipientId (normalized phone number)
  5. contentFingerprint (sha256 of normalized content)
  6. outboundSource (enum: broadcast | conversation_manual)
  7. logicalScopeReference (broadcastId or conversationId)
```

### Gap 3: Concurrency & Race Condition — Detail Implementasi Kurang

**Masalah:** PRD section 17 sudah listing concurrency scenarios, tapi:
- Tidak ada spesifikasi **lock timeout**
- Tidak ada mekanisme **deadlock detection**
- Tidak ada strategi untuk **lock contention** ketika 100 worker broadcast mengenai recipient yang sama
- FR-007 menyebut TTL tapi tidak ada default value

**Risiko:**
- Stale lock bisa memblokir recipient forever (jika worker crash tanpa release lock)
- Deadlock antara lock acquisition dan reconciliation flow

**Revisi yang diperlukan:**

```
FR-005a [P0]: Lock acquisition timeout: 5 seconds
FR-005b [P0]: Lock TTL default: 30 seconds
FR-005c [P0]: Lock recovery mechanism:
  - If lock held > TTL without heartbeat, force release
  - Force-released lock triggers re-evaluation (not auto-dispatch)
FR-005d [P1]: Deadlock detection: Background worker checks for circular lock dependency every 60 seconds
```

### Gap 4: Reconciliation Flow — State Transition Tidak Lengkap

**Masalah:** State transition model (section 11) memiliki beberapa missing states:
- Tidak ada state untuk `DISPATCHING` — antara `LOCKED` dan `SENT`
- Tidak ada state untuk `QUEUED` — ketika throttle/cooldown aktif
- Tidak ada state untuk `RETRYING` — antara `RECONCILIATION_PENDING` dan retry

**Risiko:**
- Reconciliation flow tidak bisa di-trace secara granular
- QA tidak bisa memvalidasi intermediate states

**Revisi:**
Tambah states:
- `DISPATCHING` — setelah lock berhasil, sebelum WA ack
- `QUEUED` — ketika masuk antrian cooldown
- `RETRYING` — retry setelah reconciliation pending

### Gap 5: No Fallback Behavior for Anti-Ban Service Failure

**Masalah:** NFR (Availability) menyebut "degrade safely" tapi tidak ada detail:
- Apa yang terjadi jika Anti-Ban Service down?
- Apakah outbound tetap jalan (fail-open) atau di-block (fail-close)?
- Apa impact ke existing send flow jika service unavailable?

**Risiko:**
- **Fail-open:** Risiko duplicate send dan ban tetap terjadi saat service down
- **Fail-close:** Semua outbound terblokir sampai service pulih — operasional stop total

**Revisi yang diperlukan:**

```
FR-033 [P0]: Anti-Ban Service failure behavior:
  - If service is unavailable > 5 seconds, fall back to fail-open mode
  - Log degraded mode entry in audit trail
  - Alert admin that protection is degraded
  - Resume normal validation when service recovers (max 10 second window)
  - Fail-open mode MUST still enforce idempotency key check via local cache
```

### Gap 6: Default Values Tidak Mempertimbangkan Use Case Real

**Masalah:** Beberapa default values terlalu agresif:
- `dedupeWindowSeconds: 120` — terlalu pendek untuk broadcast yang butuh waktu > 2 menit
- `pasteFastSendThresholdMs: 1200` — 1.2 detik untuk paste-to-send terlalu pendek? Beberapa operator mungkin lebih cepat
- `senderSafeModeDurationSeconds: 300` — 5 menit safe mode terlalu pendek untuk recovery akun

**Revisi yang diperlukan:**
```
Dedupe window: increase to 300 (5 min) as default
pasteFastSendThresholdMs: 2000 (2 sec) — accommodates faster operators
senderSafeModeDurationSeconds: 1800 (30 min) — more realistic recovery
```

### Gap 7: Tidak Ada Monitoring untuk False Positive

**Masalah:** PRD punya observability untuk blocking events, tapi tidak ada:
- Mekanisme **operator appeal** — apa yang dilakukan operator jika merasa di-block tanpa alasan?
- **Feedback loop** untuk false positive detection
- **Dashboard** untuk melihat false positive rate

**Risiko:**
- False positive blocking akan dilaporkan via manual complaint (inefisien)
- Tim Support tidak punya data untuk membedakan false positive vs true positive
- Produk tidak bisa improve threshold berdasarkan feedback

**Revisi yang diperlukan:**

```
FR-034 [P1]: Operator appeal mechanism:
  - When send is blocked, operator can click "Laporkan masalah" 
  - Creates support ticket referencing the blocked attempt ID
  - Admin can review, override, and update risk model

FR-035 [P1]: False positive dashboard:
  - Daily report of blocked vs warned vs allowed sends
  - Top 10 operators by block count
  - Appeal-to-block ratio per tenant
```

---

## 5. Yang Harus Diperhatikan FE & BE Saat Implementasi

### FE — Frontend

| Area | Detail |
|------|--------|
| **Send Button State** | Button MUST disable on submit (FR-012). Loading state, error state, blocked state. Jangan sampai double-click bypass. |
| **Error Handling UI** | Semua error handling (EH-001 sampai EH-010) butuh UI component: toast, inline warning, blocking modal. Semua teks Bahasa Indonesia. |
| **Risk Warning System** | Inline warning di conversation room saat operator mendekati threshold. Jangan blocking — warning only. |
| **Cooldown Countdown** | Saat cooldown aktif, operator harus tahu berapa lama harus menunggu. UI countdown. |
| **Audit Log View** | Read-only table (US-004, US-008). Filter by account, actor, time range, reason code. Masked recipient. |
| **Admin Settings Page** | US-005: Configurable thresholds, enforcement mode, dedupe window. Validasi input client-side + server-side. |
| **Safe Mode Indicator** | Account detail page — tunjukkan status safe mode, duration, dan reason. |
| **Broadcast Pre-check** | Sebelum broadcast campaign start, tampilkan warning jika ada risiko. |
| **Operator Appeal UI** | Jika di-block, operator bisa klik "Laporkan masalah" → create support ticket. |
| **Permission-based Menu** | Operator → warning only. Supervisor → read-only logs. Admin → full config. Super Admin → same + cross-tenant. Support → read-only + TBD override. |

### BE — Backend

| Area | Detail |
|------|--------|
| **Idempotency Key Generation** | MUST consist of: tenantId + channelType + senderAccountId + recipientId + contentFingerprint + outboundSource + logicalScopeReference. SHA-256 of concatenated fields. |
| **Dedupe Cache** | Redis or equivalent. Configurable TTL (default 300s). MUST survive service restart. |
| **Recipient Lock** | Distributed lock (Redis). TTL 30s. Heartbeat every 10s. Timeout 5s. Force-release after TTL. |
| **Risk Scoring Engine** | Weighted sum of pasteSignal, composeToSendDuration, contentSimilarity, burstFrequency. Rolling 60s window. Decay 50%/minute. |
| **Reconciliation Flow** | POST-dispatch timeout → `RECONCILIATION_PENDING` → scheduled check → confirm/fail/timeout. NO blind resend. |
| **Safe Mode** | Integration with existing account eligibility. Automatic trigger when restriction detected. |
| **Audit Log** | Reason codes: `DUPLICATE_SUPPRESSED`, `LOCK_CONFLICT`, `RECONCILIATION_PENDING`, `PASTE_RISK`, `BURST_RISK`, `ACCOUNT_SAFE_MODE`, `ACCOUNT_INELIGIBLE`, `COOLDOWN_ACTIVE`. |
| **API Endpoints** | `POST /api/wa/outbound/validate`, `GET /api/wa/outbound/anti-ban/logs`, `PATCH /api/wa/outbound/anti-ban/settings`, events: `wa.outbound.validation.result`, `wa.sender.safe_mode.changed`, `wa.outbound.reconciliation.updated` |
| **Feature Flag** | Tenant-scoped. Modes: `monitor_only` → `warning_only` → `soft_block` → `strict`. |
| **Performance** | Pre-send validation ≤ 100ms p95. Cache scoring results for same operator in same window. |

---

## 6. Yang Harus QA Perhatikan

### Test Strategy Priority

| Priority | Area |
|----------|------|
| **P0 — Smoke** | 1. Idempotency: double-click, two tabs, duplicate broadcast recipient 2. Risk blocking: trigger paste threshold, burst threshold 3. Safe mode: account restriction triggers stop 4. Reconciliation: timeout flow no blind resend |
| **P1 — Regression** | 1. Existing send flow masih jalan normal 2. Broadcast existing behavior tidak broken 3. Conversation room UX tidak terganggu 4. Account management (add, edit, QR) tidak affected |
| **P2 — Edge Cases** | 1. Concurrency: 100 worker → same recipient 2. Lock timeout recovery 3. Service failure → fail-open fallback 4. Fingerprint normalization (whitespace, unicode, emoji) |
| **P3 — Negative** | 1. Invalid config → safe default fallback 2. Service down → graceful degradation 3. Invalid idempotency key → proper error 4. Permission violation → proper error |

### Concurrency Test Scenarios

1. **Double-click send** — UI disabled + server idempotency → 1 send only
2. **Two browser tabs** — same message, same account, near-simultaneous → 1 send, other suppressed
3. **Two broadcast workers** — overlapping recipient → lock contention, one winner
4. **Timeout + retry** — post-dispatch timeout → `RECONCILIATION_PENDING` → no blind resend
5. **Operator burst** — rapid paste-send 5 messages in 60s → threshold → cooldown
6. **Account restriction mid-broadcast** — remaining recipients blocked

### Regression Test Areas

| Area | Impact | Must Test |
|------|--------|-----------|
| WA Web send flow | HIGH | Send from room, send from broadcast, retry, attachment |
| Anti Spam (if developed) | HIGH | Humanization timing, warming rotation → should not conflict |
| Broadcast worker | HIGH | Worker dispatch, queue management, error recovery |
| Account management | MEDIUM | Add/edit/remove account, QR scan, session management |
| Conversation room | MEDIUM | Send button, typing indicator, read receipt |
| Admin settings | MEDIUM | All existing settings pages — no broken layout/validation |

### Automation Candidate

| TC | Level | Priority |
|----|-------|----------|
| Duplicate send suppression | Integration | P0 |
| Idempotency key generation | Unit | P0 |
| Risk scoring threshold | Integration | P1 |
| Cooldown timing | Integration | P1 |
| Safe mode trigger | Integration | P0 |
| Reconciliation flow | E2E | P1 |
| Lock contention | Integration | P2 |
| Lock timeout recovery | Integration | P2 |
| Service failure fallback | Integration | P1 |
| Fingerprint normalization | Unit | P2 |

### Environment Strategy

| Environment | Scope |
|-------------|-------|
| Dev | Unit test, component test for risk engine, idempotency |
| Staging | Full regression, concurrency test, integration with broadcast worker |
| Staging (canary) | `monitor_only` mode → validate logs, no false blocking |
| Production (canary) | 1 tenant → `warning_only` → monitor false positive |
| Production (full) | Gradual: `soft_block` → `strict` per tenant |

---

## 7. Risk Matrix

| Risk Scenario | Probability | Impact | Mitigation |
|--------------|-------------|--------|------------|
| False positive blocking of legitimate send | Medium | HIGH | Monitor-only rollout, operator appeal mechanism, false positive dashboard |
| Stale lock blocks recipient forever | Low | HIGH | TTL auto-expire, heartbeat, background recovery worker |
| Deadlock between lock + reconciliation | Low | MEDIUM | Lock timeout, deadlock detection worker |
| Anti-Ban Service down → all outbound blocked | Low | CRITICAL | Fail-open fallback after 5s, local cache idempotency |
| Anti Spam System built later conflicts with Anti-Ban | Medium | HIGH | Define interface contract now, document assumptions clearly |
| Broadcast validation performance bottleneck | Medium | HIGH | Cache per-operator scoring results, async validation for large broadcast |
| Reconciliation blind resend due to worker bug | Medium | CRITICAL | Route ALL retry through anti-ban identity layer, no bypass path |

---

## 8. Dependency Analysis

| Feature | Depends On | Type | Status |
|---------|-----------|------|--------|
| Anti-Ban Guard | Existing WA Web send pipeline | Direct | ✅ Existing |
| Anti-Ban Guard | Existing broadcast worker | Direct | ✅ Existing |
| Anti-Ban Guard | Existing account eligibility logic | Direct | ✅ Existing |
| Anti-Ban Guard | Redis distributed lock | Infrastructure | ✅ Assumed |
| Anti-Ban Guard | Anti Spam System (Account Pools) | Indirect — Shared Logic | ❌ **Belum developed** |
| Anti-Ban Guard | Anti Spam System (Broadcast Humanization) | Indirect — Timing overlap | ❌ **Belum developed** |

---

## 9. Open Questions

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | Apakah Anti-Ban Guard harus menunggu Anti Spam System selesai, atau bisa jalan duluan? | PM + Engineering | **YES** |
| 2 | Siapa yang menentukan formula risk scoring? Product atau Engineering? | PM | **YES** |
| 3 | Apakah ada budget performa untuk validasi 10,000 recipient broadcast? (estimated ~16 min overhead) | Engineering | **YES** |
| 4 | Fail-open atau fail-close saat Anti-Ban Service down? | PM + Engineering | **YES** |
| 5 | Apakah operator appeal mechanism termasuk di scope Phase 1? | PM | No |
| 6 | Siapa yang handle false positive monitoring — Product atau Support? | PM | No |
| 7 | Default values (dedupe window, threshold, cooldown) — final atau perlu riset lebih lanjut? | PM | **YES** |
| 8 | Bagaimana migration dari existing send flow ke Anti-Ban Guard? Bisa flag-based? | Engineering | No |
| 9 | Apakah perlu store raw content untuk audit, atau cukup fingerprint? | Engineering | No |

---

## 10. Rekomendasi

### Final Decision: `PROCEED_WITH_CAUTION`

### Required Actions Sebelum Engineering Mulai

1. **Product:** Finalisasi risk scoring formula (bobot per signal, threshold per mode) — blocking
2. **Product:** Tentukan dependency order dengan Anti Spam System — blocking
3. **Engineering:** Buat impact analysis document (existing send flow, broadcast, account management) — blocking
4. **Product + Engineering:** Tentukan fail-open vs fail-close behavior — blocking
5. **Product:** Review default values (dedupe window, paste threshold, safe mode duration)
6. **Engineering:** Define lock timeout, TTL, heartbeat interval
7. **Product:** Confirm Phase 1 scope — apakah appeal mechanism termasuk?

### Suggested Delivery Strategy

| Phase | Scope | Mode | Duration |
|-------|-------|------|----------|
| Phase 1a | Idempotency + dedupe + audit log | `monitor_only` | Sprint 1-2 |
| Phase 1b | Risk scoring + throttling + safe mode | `warning_only` | Sprint 3-4 |
| Phase 1c | Enforcement (soft_block + strict) | Gradual per tenant | Sprint 5-6 |
| Phase 2 | Operator appeal + false positive dashboard | All modes | Post-launch |

### Ringkasan Perubahan Analisa

Ini adalah assessment pertama (v1.0). Tidak ada revisi dari versi sebelumnya.

---

## 11. Traceability Matrix

| Req ID | Finding | Impact Area | Priority |
|--------|---------|-------------|----------|
| FR-001 – FR-004 | Idempotency key spec belum detail, normalization belum defined | Data integrity | P0 |
| FR-005 – FR-007 | Lock timeout & TTL belum ada default value | Concurrency | P0 |
| FR-008 – FR-011 | Reconciliation flow missing intermediate states | State machine | P1 |
| FR-014 – FR-016 | Risk scoring formula black box — bobot & threshold undefined | Logic gap | P0 |
| FR-017 – FR-020 | Default values terlalu agresif | Configuration | P1 |
| FR-021 – FR-023 | Integrasi dengan Anti Spam System yang belum developed | Dependency | P0 |
| FR-026 – FR-028 | Audit log sudah baik, reason code lengkap | ✅ OK | — |
| FR-029 – FR-030 | Config validation + safe default fallback sudah ada | ✅ OK | — |
| FR-031 – FR-033 | Non-behavior guarantees sudah baik | ✅ OK | — |
| NFR (Availability) | No fallback behavior for service failure | Production safety | P0 |
| NFR (Performance) | Broadcast validation overhead 16+ min | Performance | P0 |
| US-006 | Operator feedback UI diperlukan detail implementasi | UX | P1 |
| Migration Plan | Rollout strategy sudah detail | ✅ OK | — |
| Observability | False positive monitoring belum ada | Monitoring | P1 |
