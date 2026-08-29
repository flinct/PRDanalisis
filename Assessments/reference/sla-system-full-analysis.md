# SLA System — Full-Stack Reference (Setting → Conversation → Ticket → Member → Statistic)

> **Tipe:** Reference analysis (non-decision-bearing). Ini adalah peta lengkap seluruh sistem SLA SatuInbox: dari admin setting, penerapan runtime di Conversation & Ticket, perhitungan per-member, sampai tampilan di Statistic.
> **Tanggal:** 2026-08-28
> **Author:** Dany Christian
> **Domain:** Conversation V2 × Ticket V2 × Analytics (SLA)
> **Anchor:** `summary/2026-08-28-sla-engine-contract-analytics-readmodel.md`
> **Source of Truth:** Conversation V2 (`PRD/Conversationv2/`), Ticket V2 (`PRD/ticketv2/`). V1 deprecated.
> **Verified against code:** `references/metric-aggregation-architecture.md` (skill `satuinbox-prd-workflow`, verified 2026-08-13/14).

---

## 0. Peta 5 Lapis SLA

| Lapis | Apa yang terjadi | Owner service | Source |
|---|---|---|---|
| **1. Setting** | Admin konfigurasi target FRT/TTC/stage + reminder + pause policy | conversation-service / ticket-service (settings) | `PRD Conversation SLA.md`, `PRD Ticket - SLA ticket.md` |
| **2. Conversation apply** | Runtime hitung FRT/TTC/RLT/Wait Time per conversation cycle | conversation-service (`conversation-sla-metrics.service.ts`) | `SLA Engine Contract`, global-memory |
| **3. Ticket apply** | Runtime hitung FRT/TTC/stage SLA per ticket cycle | ticket-service | `PRD Ticket - SLA ticket.md` |
| **4. Member calc** | Rollup per-agent (credit attribution) | people-service (`agent-conversation-metrics.service.ts`) → `agentperformancemetrics` | metric-aggregation ref |
| **5. Statistic** | Pre-aggregated daily → Statistic page (Responsiveness + Member Performance) | analytics-service (`responsivenessmetrics`) | metric-aggregation ref |

**Prinsip arsitektur (sudah best-practice):** read model berlapis (skenario B), bukan hitung independen per surface. Metric conversation vs ticket dipisah lewat discriminator `metricType` (`CONVERSATION_*` / `TICKET_*`). Aggregation cron-driven (3 jam), bukan realtime — beban CPU di upstream service, bukan analytics-service.

---

## 1. LAPIS 1 — SLA Setting

### 1.1 Conversation SLA Setting (`PRD Conversation SLA.md` v2.0)

**Model: per-channel.** Bukan lagi single global. Satu shared "Kebijakan" card + satu SLA card per channel.

| Item | Aturan |
|---|---|
| Scope metric | **Hanya FRT + TTC** (FR-007). RLT/Wait Time TIDAK punya setting target. |
| Channel | Widget, WhatsApp API, WA Web Group, WhatsApp Web, Instagram, FB Messenger, Telegram, Email (FR-004) |
| WA Web Group | FRT only; TTC disabled config + runtime (FR-009/FR-010) — group tidak bisa resolve |
| Duration | value + unit (Menit/Jam/Hari), integer 1–999, dinormalisasi ke menit (FR-016..019) |
| Reminder | 1 per metric per channel, offset harus `<` durasi SLA (FR-020..028) |
| Shared policy 1 | "Jeda SLA TTC saat menunggu balasan pelanggan" → **pause TTC only, TIDAK pause FRT** (FR-011/012) |
| Shared policy 2 | "Hitung SLA saat agen dalam mode AUX" → jika disabled, pause active metric saat agent AUX (FR-013..015) |
| Snapshot | Setting di-snapshot saat cycle start; edit setting hanya berlaku untuk cycle baru (FR-040..043) |
| Migration | Legacy global → per-channel, idempotent, FRT ke semua channel, TTC hanya ke channel yang support (FR-059..066) |
| Default baru | Seed per-channel standar (Appendix matrix) di workspace baru (FR-067..069) |
| RBAC | Admin edit; Supervisor read-only; unauthorized → "Akses ditolak" (FR-001..003) |

**Default matrix (Appendix):** Widget FRT 5m/TTC 30m; WA API & WA Web & IG & FB & Telegram FRT 15m/TTC 8j; WA Web Group FRT 30m/TTC off; Email FRT 60m/TTC 24j.

### 1.2 Ticket SLA Setting (`PRD Ticket - SLA ticket.md` v1.0)

**Model: per ticket-type.** Section "Metrik SLA" ditambahkan ke Ticket Type create/edit.

| Item | Aturan |
|---|---|
| Scope metric | FRT + TTC (per ticket type) + **stage SLA** (unik ticket, tidak ada di conversation) |
| Global pause | 1 toggle "Jeda SLA saat menunggu balasan pelanggan" → **pause FRT + TTC + SEMUA stage SLA** (FR-008..010). **Default ENABLED** (beda dari conversation yang default false). |
| AUX policy | **Tidak ada** di ticket (hanya conversation) |
| Stage SLA | cumulative time-in-stage, exclude paused interval, reset saat reopen (FR-025..027) |
| Reminder | 1 per metric + 1 per stage; disable kalau stage duration kosong (FR-011..014) |
| Reopen | **new SLA cycle** (`slaState.cycleId`) — eksplisit terdefinisi (FR-019) |
| Manual ticket | FRT start dari ticket creation time meski tanpa customer message (FR-022) |
| Snapshot | per cycle, tidak retroaktif (FR-037/038) |
| RBAC | Admin edit; Supervisor read-only; Agent denied (FR-001..003) |

### 1.3 Perbedaan setting Conversation vs Ticket (KRITIS)

| Aspek | Conversation | Ticket |
|---|---|---|
| Scope config | per-channel | per ticket-type |
| WoC pause | **TTC only** | **FRT + TTC + stage** |
| AUX policy | Ada | **Tidak ada** |
| Stage SLA | Tidak ada | Ada |
| Pause default | false | **true** |
| SLA start | first customer inbound (T1) | ticket creation |
| Reopen | **3-way conflict (unresolved)** | new cycle (locked) |
| Bootstrap | migration + default seed | **tidak ada** equivalent — ticket type lama underspecified |

---

## 2. LAPIS 2 — Conversation SLA Apply (runtime)

Collection: `conversation_sla_metrics` (bukan di conversation document). Dihitung real-time/service-side.

### 2.1 Timing chain — 4 timestamp, 5 metric

```
T1 firstCustomerMessageAt
  → [Wait Time in Queue] → T2 firstAgentAssignmentAt
    → [RLT] → T3 firstAgentReplyAt   (FRT juga T1→T3, formula beda)
      → [...]              → T4 conversationClosedAt (TTC)
```

| Metric | Formula (code-verified) | File:line | Office-hours? | Persisted field |
|---|---|---|---|---|
| **FRT** | `agentReplyAt − firstCustomerMessageAt − totalFrtPausedMs` | `conversation-sla-metrics.service.ts:649 calculateFrtMs()` | **No** (raw wall-clock, sengaja abaikan office hours) | `frtMs` |
| **Wait Time** | `firstAgentAssignmentAt − firstCustomerMessageAt` | `conversation-sla-metrics.repository.ts:189` (`$max`/`$subtract` di pipeline, bukan service layer) | No | `waitTimeInQueueMs` |
| **RLT** | `businessMsBetween(firstAgentAssignmentAt, agentReplyAt)`, fallback wall-clock kalau reply di luar office hours (hindari RLT=0) | `conversation-sla-metrics.service.ts:666 calculateRltMs()` | **Yes** | `rltMs` |
| **TTC** | `closedAt − conversationCreatedAt − pausedMs` | `conversation-sla-metrics.service.ts:939 calculateTtcMs()` | Yes (kalau office hours diset) | `ttcMs` |
| **ART** | `replyAt − lastUserMessageAt`, dihitung SETIAP reply lalu di-rata2 | `agent-conversation-metrics.service.ts:300 computeResponseMs()` | No | (people-service) |

**Invariant (canonical, global-memory):** `FRT = Wait Time + RLT` — harus selalu terpenuhi. Ini alasan FRT di-anchor ke inbound (T1), BUKAN assignment (T2). Kalau FRT start dari assignment → `FRT ≡ RLT` (redundant, Finding 1). **Locked di SLA Engine Contract §5.1.**

### 2.2 Pause policy per trigger (SLA Engine Contract §5.3 — locked)

| Trigger | FRT | TTC | RLT | Catatan |
|---|---|---|---|---|
| **Hold** | Pause | Pause | Pause | Agent stop clock eksplisit, semua freeze bareng |
| **Snooze** | No | No | No | Snooze = visibility only, SLA tetap jalan (biar breach kelihatan) |
| **Waiting on Customer** | No | Pause | No (sudah stop di first reply) | Canonical existing |
| **AUX/Away** | per-setting | per-setting | per-setting | Toggle "Hitung SLA saat AUX" |

### 2.3 Field schema `ConversationSLAMetrics` (v2.5.0)

`firstCustomerMessageAt`, `frtCountingStartAt`, `firstAgentAssignmentAt`, `firstAgentReplyAt`, `conversationClosedAt`, `frtMs`, `ttcMs`, `waitTimeInQueueMs`, `rltMs`, `firstAssigneeId`, `firstResponderId`, `officeHoursSnapshot`, `isFrtPaused`/`isTtcPaused`, `pausedIntervals[]`, `totalPausedMs`/`totalFrtPausedMs`/`totalTtcPausedMs`.

`waitTimeInQueueMs`, `rltMs`, `firstAssigneeId`, `firstResponderId` = **baru v2.5.0**.

---

## 3. LAPIS 3 — Ticket SLA Apply (runtime)

Ticket = state machine, kadang tanpa pesan sama sekali → butuh 4 primitif (created, assignee set, message, status/stage transition). Conversation cukup 2 (join + message).

| Metric | Formula | Status-driven? | Catatan |
|---|---|---|---|
| **FRT** | `firstReply − ticketCreatedAt` | message-driven completion | **GAP: ticket resolve tanpa reply → FRT zombie** (running/breach selamanya). Fix usulan: status `not_applicable` saat Resolved & FRT belum complete. |
| **TTC** | `resolvedAt − ticketCreatedAt` | Yes (status-driven murni) | Aman |
| **Stage SLA** | cumulative time-in-stage, exclude paused | Yes | Aman |

**GAP: Ticket tidak punya RLT sendiri.** Manual ticket (tanpa linked conversation) = blind spot untuk "seberapa cepat agent respon setelah di-assign". Conversation RLT bisa inherit ke linked ticket, tapi manual ticket tidak dapat. Usulan "Ticket Handling Time" = `firstReply − assigneeSetAt` — **belum di-lock**.

**Dual SLA → triple metric family di ticket detail:** Ticket FRT/TTC (own lifecycle, start=creation) + inherited Conversation RLT/Wait Time (start=inbound/assignment). Start-point beda → label UI wajib jelas bedakan "Ticket SLA" vs "Conversation Response Metrics" (Finding 4).

---

## 4. LAPIS 4 — Per-Member Calculation

Collection: `agentperformancemetrics` (dari people-service). Service: `agent-conversation-metrics.service.ts`.

### 4.1 Credit attribution (siapa dapat metric)

| Metric | Credit ke |
|---|---|
| FRT / RLT | **first responder** (`firstResponderId`) |
| TTC | **resolver** |
| Wait Time | **assignee** (`firstAssigneeId`) |

### 4.2 Aturan tampil per-member (locked di diskusi)

- **Compliance rate** = metric utama; avg/median = sekunder.
- **`#Handled` (volume) WAJIB tampil** — compliance rate tanpa denominator = misleading (90% dari 2 chat ≠ 90% dari 200).
- **RBAC data performa (sensitif):** agent lihat data sendiri, supervisor lihat tim, admin lihat semua.

### 4.3 ⚠️ VERIFIKASI BELUM SELESAI

**`agentperformancemetrics` rollup FROM `responsivenessmetrics` atau hitung independen?** Kalau independen → risiko divergensi definisi (angka member ≠ angka Responsiveness untuk metric sama = L1 fragmentasi lagi). **Belum dikonfirmasi di code.** Ini blocking untuk klaim "member SLA konsisten dengan statistic".

---

## 5. LAPIS 5 — Statistic Display

`ManageStatisticPage.tsx` sudah punya **6 section**: conversations, ticket, broadcast, **responsiveness**, **member-performance**, offline-report.

> SLA Member = `member-performance` **SUDAH ADA**. SLA responsiveness (FRT/TTC breakdown) = `responsiveness` **SUDAH ADA**. Bukan bangun baru.

### 5.1 Analytics collections (6, aktual)

`agentperformancemetrics`, `broadcastdailymetrics`, `conversationdailymetrics`, `offlinereportjobs`, `responsivenessmetrics`, `ticketdailymetrics`. **Semua pre-aggregated daily counts** (per v2.7.0) — tidak ada row-level.

### 5.2 `responsivenessmetrics` schema

- Discriminator `metricType`: `CONVERSATION_ART/FRT/TTC`, `TICKET_ART/FRT/TTC`. Grain = daily. Field = `avg/sum/count` per agent/team/company.
- **Tab "All / Conversations / Ticket" bukan display filter** — switching tab query metricType berbeda, jadi FRT/TTC/SLA-breakdown beda per tab. Model sebagai per-tab dataset.
- **Wait Time & RLT TIDAK ada di `ResponsivenessMetricType` enum** → tidak pernah sampai FE. Cuma ART/FRT/TTC (×conv/ticket) yang exposed. Nambah Wait Time/RLT card = (1) tambah enum, (2) wire ke cron 3-jam, (3) baru FE — bukan FE-only.
- **Ticket tidak punya Wait Time/RLT** → card harus N/A/hidden di Ticket tab, bukan angka fabricated.

### 5.3 Data flow (cron-driven, 3 jam)

1. `AggregationSchedulerService` bangun tiap `@Cron(EVERY_3_HOURS)`.
2. Kirim RMQ batch ke upstream (conversation/ticket/people/broadcast service).
3. Tiap upstream jalan aggregation pipeline di raw collection-nya sendiri (beban CPU di upstream).
4. Upstream balikin hasil via RMQ.
5. analytics-service `bulkWrite` upsert ke 5 collection pre-aggregated.

**`AGGREGATION_ENABLED` dual-path:** true → baca pre-aggregated (cepat, zero upstream load); false → legacy "Redash" query upstream langsung tiap request (lambat, beban nyata).

**2 endpoint SELALU Redash/direct-query (risk area, bukan cron):**
- **CSAT** — tiap request 2 RMQ RPC ke conversation+ticket service, aggregate live di raw `csats`. Tidak ada pre-aggregated CSAT collection.
- **Responsiveness SLA Breakdown** (`getResponsivenessSLABreakdown`, `responsiveness-analytics.service.ts:521-534`) — selalu Redash, tidak ada pre-aggregated equivalent.

### 5.4 ROOT CAUSE "belum best-practice"

**Bukan** arsitektur (read model + discriminator sudah benar).

**Root cause:** `responsivenessmetrics` cuma simpan `avg/sum/count` → **tidak bisa hitung compliance rate, median, breach count, atau exclude not_applicable.** Avg 4.4m tanpa % on-time = tidak actionable.

**Fix minimal (ponytail, 0 collection baru):** tambah 3 field ke `responsivenessmetrics`:
```
+ metCount    (value ≤ SLA threshold)
+ breachCount (value > SLA threshold)
+ naCount     (not_applicable, excluded dari avg/sum/count)
```
- Compliance rate = `metCount / count × 100%`
- Threshold = snapshot dari SLA Settings saat aggregation (bukan realtime query) — inilah yang bikin 3-jenis SLA share setting.
- `not_applicable` (ticket resolve tanpa reply) → `naCount`, exclude dari avg. Butuh event dari ticket-service.
- Median = YAGNI fase ini. Upgrade: field p50/histogram bucket kalau diminta.

### 5.5 SLA breakdown hanya untuk metric yang punya target

`SLASettingMetricEnum` (`libs/common/src/lib/enums/index.ts:1138`) **cuma 2 value: `FIRST_RESPONSE_TIME`, `TIME_TO_CLOSE`.**

- FRT, TTC → SLA breakdown legit (target configurable).
- RLT, Wait Time, ART → **tidak ada target di schema.** "RLT In SLA/Over SLA" butuh enum value baru + admin UI set target + field `rltConfiguredMs`/`rltSlaMet` = product-scope addition, bukan data-exposure. (Patch 4 brief menangani ini untuk RLT.)

---

## 6. Dua Konteks Warna SLA — JANGAN DICAMPUR

| Konteks | Basis warna | Threshold | Status |
|---|---|---|---|
| **Chat List** (per-item) | budget TTC tersisa % | >50% green / ≤50%&>10% yellow / ≤10% red (US-14) | **BUG LIVE:** FE pakai absolute time, harus fix ke persentase (Engine Contract §5.5 FR-011) |
| **Statistic** (agregat) | compliance rate | ≥90% green / 70–90% yellow / <70% red | Target, belum ada breakdown karena field kurang (§5.4) |

Semantik BEDA — tulis eksplisit di PRD, jangan reuse token sembarangan.

---

## 7. Daftar Gap & Konflik (konsolidasi)

| ID | Gap/Konflik | Lapis | Status |
|---|---|---|---|
| G-01 | FRT zombie: ticket resolve tanpa reply → FRT running selamanya | 3 | Fix: `not_applicable` status enum |
| G-02 | Ticket tanpa RLT sendiri (manual ticket blind spot) | 3 | Usul "Ticket Handling Time", belum lock |
| G-03 | `responsivenessmetrics` tanpa met/breach/na count → no compliance rate | 5 | Fix: +3 field |
| G-04 | Wait Time/RLT tidak di `ResponsivenessMetricType` enum (orphaned) | 5 | Patch 4 brief (add enum + cron + FE) |
| G-05 | RLT/Wait Time/ART tanpa SLA target di `SLASettingMetricEnum` | 1/5 | Butuh enum+UI+field baru |
| G-06 | `agentperformancemetrics` rollup vs independen? | 4 | **VERIFIKASI belum, blocking** |
| C-01 | Chat List color absolute vs %-budget | 2/6 | BUG live, Engine Contract §5.5 |
| C-02 | Reopen 3-way conflict (Sessions/Room/Reassign) | 2 | Engine Contract §5.4 pick Room-style (pending PM) |
| C-03 | Hold/Snooze/AUX/WoC pause 3-way | 2 | Engine Contract §5.3 (pending PM) |
| C-04 | WoC pause: conv (TTC only) vs ticket (FRT+TTC+stage) | 1/2/3 | By design beda, dokumentasikan |
| C-05 | Group chat: FE hide FRT juga (harusnya TTC only) | 2/5 | BUG live, Engine Contract §5.2 |
| C-06 | Ticket type lama tanpa FRT/TTC config (no bootstrap) | 1 | Underspecified |

---

## 8. Status Artifact & Blocking Decisions

**SLA Engine Contract** (`PRD/Conversationv2/PRD - SLA Engine Contract (Conversation x Ticket).md` v1.0) = draft, pending PM sign-off. Belum masukkan: FRT `not_applicable`, §5.7 read model 3-field, koreksi "member-performance existing".

**Blocking PM decisions:** DECISION-A (reopen new-cycle vs resume), -B (pause Hold/Snooze/AUX), -C (RLT inherit ke N ticket), -D (move freeze/reset), -E (reassign Wait Time), -F (macro/bulk/email count first reply?), -G (Chat List color basis FRT/TTC).

**Next verifications:** (1) `agentperformancemetrics` rollup-vs-independen [G-06, blocking], (2) metricType Wait Time ada/tidak, (3) lock "Ticket Handling Time".

---

## 9. Referensi

- `PRD/SLA conversation n ticket/PRD Conversation SLA.md` (v2.0)
- `PRD/SLA conversation n ticket/PRD Ticket - SLA ticket.md` (v1.0)
- `PRD/Conversationv2/PRD - SLA Engine Contract (Conversation x Ticket).md` (v1.0 draft)
- `Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md` (cross-PRD, 869 lines)
- `Assessments/reference/sla-conversation-ticket.md`
- `Assessments/cross-domain/agent-statistic-access/rlt-wait-time-sla-tracking-change-intake-brief.md` (Patch 4)
- Skill `satuinbox-prd-workflow` → `references/metric-aggregation-architecture.md` (code-verified)
- `Memory/global-memory.md` → Conversation SLA Canonical Metric Definitions
