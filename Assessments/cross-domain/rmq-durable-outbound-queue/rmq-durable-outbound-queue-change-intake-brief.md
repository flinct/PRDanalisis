# Change Intake Brief: RabbitMQ Durable Outbound Queue (Transactional Outbox)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi lisan user 2026-08-31 (isu: RMQ restart menghapus semua antrian → pesan outbound belum terkirim hilang)
> **Artifact Path:** `Assessments/cross-domain/rmq-durable-outbound-queue/rmq-durable-outbound-queue-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/task-router.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `prototypes/rmq-outbox-flow.html`
> **Tanggal Intake:** 2026-08-31
> **Status:** Draft

---

## 0. Ringkasan Update Brief

- Initial version.
- Scope dikunci ke **durabilitas antrian outbound** saat RabbitMQ restart. Instagram fix **out of scope** (sudah ada fix terpisah, dikonfirmasi user).
- Routing decision: butuh discovery BE (verifikasi config durable/persistent aktual) sebelum lock ke PRD.

---

## 1. Request Snapshot

**Request Summary:**
RabbitMQ restart menghapus semua antrian. Pesan outbound yang sedang mengantri untuk dikirim (WhatsApp/channel lain) hilang dan tidak ter-recover. User mengusulkan: persist ke DB pesan mana saja yang diantrikan, lalu setelah sukses terkirim, update state di DB dari antrian.

**Business Problem:**
Message loss saat operasional (restart broker, deploy, crash) — pesan pelanggan yang harusnya terkirim raib tanpa jejak dan tanpa retry. Merusak reliabilitas CS platform.

**Target User / Role / Stakeholder:**
Agent CS (pesan outbound-nya tidak terkirim), pelanggan akhir (tidak menerima balasan), Tech Lead / BE (owner infra RMQ).

**Expected Outcome:**
DB menjadi source of truth untuk pesan outbound. RMQ restart tidak menyebabkan message loss — antrian yang hilang di-refill dari DB. Tidak ada double-send.

**Urgency / Why Now:**
Message loss = data loss di jalur komunikasi pelanggan. User memberi zero-tolerance terhadap kehilangan pesan.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `BEHAVIOR_CHANGE` (durabilitas + recovery jalur outbound existing) |
| Primary Domain | `Cross-domain` (infra RMQ; menyentuh semua channel outbound, primer WhatsApp Web) |
| Request Shape | Add (persistence + recovery) + Change (urutan ack/update) |
| Initial Complexity Signal | High |
| Needs Split? | Yes (lihat §6) — quick-win durable/persistent vs full outbox |

### Classification Rationale
- Bukan fitur baru user-facing; mengubah **reliabilitas** jalur pengiriman pesan yang sudah ada.
- Menyentuh transport async inti (RabbitMQ) yang dipakai lintas service → blast radius besar → wajib Phase 0 + analysis-and-risk.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | Tidak ada PRD khusus durabilitas antrian outbound |
| PRD status | Not found |
| PRD treatment candidate | New PRD (infra/reliability) atau Assessment Report teknis |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Not applicable | jalur outbound murni BE/infra |
| BE | Partial / perlu verifikasi | `Memory/CLAUDE-be.md`: RabbitMQ `localhost:5672`, exchange `satuinbox-exchange`, queue prefix `satuinbox`, prefetch `10`. `conversation-service` punya per-channel outbound queue routing. Bulk reply sudah pakai `prefetch=1` + manual ack (FIFO). |
| Runtime / Current Behavior | Restart RMQ → antrian + isinya hilang (per laporan user). Belum terkonfirmasi apakah queue `durable` dan message pakai `deliveryMode=2` (persistent). | Perlu discovery BE |

### 3.3 Related Sources
- `Memory/global-memory.md`: canonical product rules.
- `Memory/CLAUDE-be.md`: arsitektur RMQ, mTLS wajib, `@nestjs/schedule` + RabbitMQ delayed queues (sweeper bisa reuse mekanisme scheduling yang sudah ada).
- `prototypes/rmq-outbox-flow.html`: diagram flow usulan (journey user vs outbox pattern + sweeper recovery).

---

## 4. Scope Boundary

### 4.1 In Scope
- Durabilitas pesan outbound di RabbitMQ (queue `durable`, message `persistent`).
- Persist pesan outbound ke DB (outbox collection) sebagai source of truth.
- Urutan yang benar: tulis `pending` → kirim → update `sent` → **manual ack RMQ paling akhir**.
- Idempotency via `messageId` + atomic claim (`update where status=pending`) untuk cegah double-send.
- Sweeper / recovery job: scan row `pending` yang nyangkut → re-publish ke RMQ setelah restart.

### 4.2 Out of Scope
- Instagram fix (sudah ada fix terpisah — dikonfirmasi user).
- Redesign broker/exchange topology.
- Perubahan jalur inbound (fokus outbound / pengiriman).
- Perubahan UX/FE.

### 4.3 Protected Existing Behavior
- Bulk reply FIFO existing (`prefetch=1`, manual ack) tidak boleh rusak.
- mTLS wajib untuk semua transport RMQ — tidak boleh dilonggarkan.
- Zero perf regression pada service existing (batasan user) — outbox write & sweeper tidak boleh menambah latency signifikan pada jalur kirim normal.
- Delayed queue (SLA breach/reminder) yang sudah pakai RMQ delayed tidak boleh terganggu.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | State pesan outbound (`pending`/`sending`/`sent`/`failed`) jadi entity baru / kolom baru |
| RBAC / visibility / assignment | No | murni infra pengiriman |
| API / webhook / socket / queue / cron | Yes | queue config (durable/persistent), cron sweeper baru, consumer ack behavior berubah |
| SLA / reporting / export | Yes (indirect) | pesan yang tadinya hilang kini terkirim → mempengaruhi metrik delivery/SLA; perlu cek dampak ke analytics |
| Migration / rollback / feature flag | Yes | outbox collection baru butuh migration; sweeper sebaiknya di belakang feature flag; rollback plan |
| Existing regression scope | Yes | semua jalur outbound (WA + channel lain), bulk reply, delayed queue |

### Early Blast-Radius Notes
- Perubahan titik ack (dari mana pun sekarang → paling akhir setelah DB update) mengubah semantik delivery di consumer — wajib regression jalur outbound penuh.
- Tanpa idempotency yang benar, redeliver RMQ (yang justru diinginkan untuk safety) bisa menyebabkan double-send ke pelanggan — risiko tinggi, harus dites eksplisit.
- Sweeper yang terlalu agresif bisa re-publish pesan yang sebenarnya sedang `sending` → double-send. Ambang waktu `now - Xs` harus dikalibrasi (ponytail: mulai konservatif, tuning dari observasi throughput riil).

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `SPLIT_REQUEST` + `HOLD_NEEDS_DISCOVERY` |
| Recommended Next Rules | `Rules/core/analysis-and-risk.md` (impact/regression), `Rules/core/requirements.md` (PRD reliability) |
| Recommended Next Artifact | Discovery BE → Assessment Report teknis / PRD reliability |
| Can Proceed to PRD? | No — perlu verifikasi config aktual dulu |

### Routing Rationale
- **Split A (quick-win):** verifikasi + set queue `durable` + message `persistent` (`deliveryMode=2`) + publisher confirms. Ini sendiri menutup mayoritas kasus "restart hapus antrian" tanpa outbox penuh. Diff kecil, resiko rendah.
- **Split B (full guarantee):** outbox collection + atomic claim + ack-terakhir + sweeper. Diperlukan hanya jika Split A masih meninggalkan celah (crash antara publish dan penerimaan, atau kebutuhan audit trail per pesan).
- **HOLD:** belum bisa ke PRD sebelum discovery memastikan apakah queue sudah durable/persistent hari ini. Kalau ternyata sudah durable dan pesan tetap hilang, akar masalahnya beda (mis. auto-delete queue, exclusive queue, atau non-persistent publish) dan brief ini di-update.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Apakah queue outbound saat ini `durable`? Message pakai `deliveryMode=2`? | Menentukan apakah cukup Split A atau butuh outbox penuh | Yes | BE / Tech Lead |
| OQ-02 | DB mana yang menampung outbox? (`conversation-service` DB? collection baru?) | Menentukan lokasi source of truth + transaksi | Yes | BE / Tech Lead |
| OQ-03 | Apakah channel provider (WA/Baileys) sudah expose ID/ack yang bisa dipakai idempotency? | Cegah double-send saat redeliver | Yes | BE |
| OQ-04 | Volume outbound puncak (msg/s)? | Kalibrasi ambang sweeper + validasi zero-perf-impact | No | BE / PM |
| OQ-05 | Toleransi terhadap double-send vs message-loss? (mana yang lebih parah bisnis) | Menentukan default at-least-once vs at-most-once | Yes | PM / Stakeholder |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Scope lock | Pending | |
| Stakeholder / Business User | Konfirmasi prioritas reliability vs risiko double-send | Pending | OQ-05 |
| BE / Tech Lead (Naftal Yunior) | Sanity check arah teknis + jawab OQ-01..04 | Pending | discovery gate |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| Discovery / Assessment Report | `Assessments/cross-domain/rmq-durable-outbound-queue/` | source scope, protected behavior, routing rationale |
| PRD (reliability) | TBD setelah discovery | source scope, change class, current-state baseline |
| QA Pre-Implementation Review | TBD | impact flags, protected behavior (bulk reply FIFO, mTLS, zero-perf) |
| QA Post-Implementation Validation | TBD | validasi: no message loss on restart, no double-send |
| Diagram | `prototypes/rmq-outbox-flow.html` | flow reference (journey user vs outbox + sweeper) |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-31 | Initial brief created dari diskusi RMQ restart / durable outbound queue | Analyst |
