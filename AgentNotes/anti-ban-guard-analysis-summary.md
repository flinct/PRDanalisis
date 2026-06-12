# Ringkasan Analisa — WhatsApp Web Outbound Anti-Ban Guard

## 1. Impact Analysis: Belum Ada

PRD tidak memiliki impact analysis section eksplisit. Perlu dibuat yang mencakup:
- Direct: existing WA Web send pipeline, broadcast worker, conversation room
- Indirect: Anti Spam System (5 file) — YANG BELUM DEVELOPED
- Concurrency: lock contention, race condition, deadlock
- Performance: broadcast validation overhead ~16 menit untuk 10k recipient

## 2. FE & BE — Hal yang Harus Diperhatikan

### FE
- Send button disable + loading state + error state
- Error handling UI (10 error types) — semua Bahasa Indonesia
- Risk warning inline di conversation room
- Cooldown countdown display
- Audit log read-only table (Admin/Supervisor/Support)
- Admin settings page (thresholds, mode, dedupe window)
- Safe mode indicator di account detail
- Broadcast pre-check warning
- Operator appeal button ("Laporkan masalah")
- Permission-based visibility (Operator vs Supervisor vs Admin vs Support)

### BE
- Idempotency key: tenantId + channelType + sender + recipient + contentFingerprint + source + scope → SHA-256
- Dedupe cache (Redis), TTL configurable, default 300s
- Recipient lock (Redis), TTL 30s, heartbeat 10s, timeout 5s
- Risk scoring engine: weighted sum (paste 0.3, composeSpeed 0.4, similarity 0.2, burst 0.1), rolling 60s window, decay 50%/min
- Reconciliation: timeout → PENDING → scheduled check → confirm/fail/timeout — NO blind resend
- Safe mode: auto-trigger on restriction, stop new sends
- Audit log: 8 reason codes
- 3 API endpoints + 3 events
- Feature flag: monitor → warning → soft_block → strict
- Performance: pre-send validation ≤ 100ms p95

## 3. QA — Hal yang Harus Diperhatikan

### P0 (Smoke)
- Double-click → 1 send only
- Two tabs same message → duplicate suppressed
- Duplicate broadcast recipient → 1 winner
- Risk threshold (paste, burst) → block
- Safe mode trigger → stop sends
- Reconciliation timeout → no blind resend

### P1 (Regression)
- Existing send flow normal
- Broadcast existing behavior
- Conversation room UX
- Account management unaffected

### P2 (Edge)
- 100 workers → same recipient (lock contention)
- Lock timeout recovery
- Service failure → fail-open
- Fingerprint normalization (unicode, whitespace, emoji)

### P3 (Negative)
- Invalid config → safe default
- Permission violation → proper error

### Automation Priority
P0: Duplicate send, idempotency key, safe mode trigger
P1: Risk scoring threshold, cooldown, reconciliation, service failure fallback
P2: Lock contention, lock timeout, fingerprint normalization

## 4. Revisi yang Perlu ke PRD

1. Risk scoring formula — bobot + threshold per mode (FR-014a/b/c baru)
2. Content normalization rules (FR-001a/b baru)
3. Lock timeout + TTL + heartbeat (FR-005a-d baru)
4. State transition: tambah DISPATCHING, QUEUED, RETRYING
5. Service failure fallback behavior (FR-033 baru)
6. Default values adjustment: dedupe 300s, paste threshold 2000ms, safe mode 1800s
7. False positive dashboard + operator appeal (FR-034/035 baru)

## Decision: PROCEED_WITH_CAUTION — 5 blocking issues harus diselesaikan
