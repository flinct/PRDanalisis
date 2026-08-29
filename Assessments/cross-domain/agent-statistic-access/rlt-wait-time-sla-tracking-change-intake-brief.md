# Change Intake Brief: RLT & Wait Time SLA Tracking (Patch 4)

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** Diskusi PM (Dany Christian) — identifikasi gap metric saat deep-dive Responsiveness section, 2026-08-14  
> **Artifact Path:** `Assessments/cross-domain/agent-statistic-access/rlt-wait-time-sla-tracking-change-intake-brief.md`  
> **Version:** `v1.0`  
> **Previous Version:** `none`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `PRD/Analytics/Statistic/PRD Analytics - statistic parameter improvement.md` (Patch 2 v1.1), `Assessments/cross-domain/agent-statistic-access/metric-storage-architecture-analysis.md`  
> **Tanggal Intake:** 2026-08-14  
> **Status:** Draft — Scoped for PRD (ROUTE_NEW_PRD)

---

## 0. Ringkasan Update Brief

**v1.0 (2026-08-14) — Initial brief created**

Deep-dive Responsiveness section statistic mengungkap dua metric yang sudah dihitung dan disimpan oleh BE (conversation-service) tetapi **tidak pernah diekspos** ke analytics-service atau FE:

1. **Response Lead Time (RLT)** — waktu dari agent di-assign hingga agent membalas (business-time aware, office hours supported). Field `rltMs` di `conversation-sla-metrics.schema.ts:109`, formula `calculateRltMs()` di `conversation-sla-metrics.service.ts:666`.
2. **Wait Time in Queue** — waktu dari customer chat masuk hingga agent di-assign. Field `waitTimeInQueueMs` di `conversation-sla-metrics.schema.ts:102`, dihitung otomatis oleh repository saat assignment pertama.

Kedua metric ini **tidak masuk** `ResponsivenessMetricType` enum di analytics-service, sehingga cron pre-aggregasi 3 jam tidak pernah mengambil data ini, dan FE tidak punya card/breakdown apapun untuk menampilkannya.

**RLT SLA breakdown (In SLA / Over SLA) tidak mungkin dibangun saat ini karena tidak ada SLA target/threshold untuk RLT di manapun di sistem** — `SLASettingMetricEnum` hanya punya `FIRST_RESPONSE_TIME` dan `TIME_TO_CLOSE`. Patch ini bertujuan menambah RLT sebagai SLA metric baru (baris 1+2), bukan sekadar expose raw average.

---

## 1. Request Snapshot

**Request Summary:**  
Tambahkan RLT sebagai SLA metric baru yang terintegrasi penuh — admin bisa set target RLT, BE menghitung in-SLA/over-SLA saat agent reply, data ter-agregasi ke analytics-service, dan FE menampilkan RLT In SLA / RLT Over SLA breakdown card. Wait Time in Queue di-expose sebagai informational card (raw average) tanpa SLA target, kecuali ada keputusan bisnis sebaliknya (lihat OQ-01).

**Business Problem:**  
Metric RLT (Response Lead Time) sudah dihitung dan disimpan oleh conversation-service tetapi tidak pernah sampai ke statistic page. Agent dan admin tidak punya visibilitas terhadap seberapa cepat agent merespons SETELAH di-assign — ini pengukuran kualitas layanan yang berbeda dari FRT (yang mengukur dari customer chat masuk, termasuk waktu antrian). Tanpa RLT SLA breakdown, organisasi tidak bisa membedakan agent lambat merespons (RLT tinggi) dari antrian panjang (Wait Time tinggi).

**Target User / Role / Stakeholder:**  
Admin, Supervisor (konfigurasi SLA target + lihat breakdown per agent/team). Agent (lihat own data, Patch 1 dependency). Stakeholder: PM (Dany Christian), Engineering (Naftal Yunior).

**Expected Outcome:**
1. Admin bisa menambah RLT sebagai metric SLA baru di halaman SLA Settings (sama seperti FRT/TTC).
2. Saat agent membalas pertama kali, BE menghitung `rltSlaMet = rltMs <= rltConfiguredMs` dan menyimpan snapshot target + status.
3. `ResponsivenessMetricType` enum bertambah `CONVERSATION_RLT`, cron pre-agregasi 3 jam mengumpulkan RLT in/over count.
4. FE Responsiveness SLA Breakdown section menampilkan RLT In SLA / RLT Over SLA card (2 kolom grid hijau/merah + count + percent, persis pattern FRT/TTC/Solving).
5. Summary card Average Response Lead Time (raw average, tanpa SLA breakdown) tampil di Responsiveness section (sudah di-PRD-kan di Patch 2 v1.1).

**Urgency / Why Now:**  
Patch 2 v1.1 sudah menambahkan informational RLT card ke Responsiveness section PRD, tapi tanpa SLA breakdown — card hanya menunjukkan rata-rata tanpa konteks "baik/tidak baik". Patch 4 menutup gap ini. Jika Patch 2 diimplement tanpa Patch 4, user dapat melihat angka RLT rata-rata tetapi tidak tahu apakah itu di dalam target SLA atau tidak.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `NEW_FEATURE` — metric SLA baru (RESPONSE_LEAD_TIME) yang belum ada konsep target-nya di sistem |
| Primary Domain | `Analytics` + `Conversation` (SLA Settings UI + schema) |
| Request Shape | Add — enum value baru, schema fields baru, aggregation pipeline extension, FE SLA breakdown card baru |
| Initial Complexity Signal | **Medium** — pattern sudah ada (FRT/TTC SLA = template), tapi cross-service (conversation-service schema + SLA Settings UI + analytics-service enum + aggregation + FE). Bukan critical karena pola identical dengan FRT/TTC. |
| Needs Split? | No — satu patch, satu kohesi (SLA metric baru = 1 unit fitur) |

### Classification Rationale
Ini bukan bug fix atau filter fix — ini kemampuan bisnis baru yang baru (new SLA metric type). Mengikuti pola existing FRT/TTC SLA tracking yang sudah ada, hanya menambah satu metric type lagi. Perubahan additive (enum value baru, field baru, card baru), tidak mengubah behavior existing.

---

## 3. Current State Verification

### 3.1 PRD Status

| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Analytics/Statistic/PRD Analytics - statistic parameter improvement.md` (Patch 2) — v1.1 sudah mencatat RLT dan Wait Time in Queue sebagai "orphaned data" + out-of-scope RLT SLA breakdown di Patch 2. Patch 2 mengekspos raw average saja. |
| PRD status | Not found — belum ada PRD untuk RLT SLA tracking (Patch 4 belum dimulai) |
| PRD treatment candidate | **New PRD** — baru, karena ini bukan perbaikan PRD existing tapi kemampuan SLA metric baru |

### 3.2 Implementation Status

| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Not found — tidak ada RLT card atau SLA breakdown RLT di statistic page | FE repo grep `rlt\|Rlt` di statistic komponen: tidak ada match |
| BE — calculation | **Shipped** — RLT sudah dihitung dan disimpan (`rltMs` field) setiap agent reply pertama | `conversation-sla-metrics.service.ts:666 calculateRltMs()` |
| BE — wait time | **Shipped** — Wait Time in Queue sudah dihitung dan disimpan (`waitTimeInQueueMs`) saat assignment pertama | `conversation-sla-metrics.repository.ts:189`, field di schema line 102 |
| BE — SLA target | **Not found** — tidak ada `RESPONSE_LEAD_TIME` di `SLASettingMetricEnum`, tidak ada `rltConfiguredMs`/`rltSlaMet` fields | `libs/common/src/lib/enums/index.ts:1138` — hanya FIRST_RESPONSE_TIME, TIME_TO_CLOSE |
| BE — analytics aggregation | **Not found** — tidak ada `CONVERSATION_RLT`/`TICKET_RLT` di `ResponsivenessMetricType`, cron pre-agregasi 3 jam tidak pernah mengambil data RLT | `responsiveness-metrics.schema.ts` — enum hanya ART/FRT/TTC per-domain |
| Runtime / Current Behavior | RLT dihitung tapi orphan — data ada di conversation-service database, tidak pernah di-forward ke analytics-service atau FE |

### 3.3 Related Sources
- `Memory/global-memory.md`: canonical product state, not mentioning RLT SLA
- `Memory/CLAUDE-be.md`: BE architecture reference
- `Memory/CLAUDE-fe.md`: FE architecture reference
- `Assessments/cross-domain/agent-statistic-access/metric-storage-architecture-analysis.md`: arsitektur metric storage (5 pre-aggregated collection, cron 3 jam, dual code path via AGGREGATION_ENABLED flag, responsiveness SLA breakdown SELALU Redash path)
- `PRD/Analytics/Statistic/PRD Analytics - statistic parameter improvement.md`: Patch 2 PRD — Appendix H baru (T1→T4 timeline, metric definition table) dan PS-007 (orphaned data finding)

---

## 4. Scope Boundary

### 4.1 In Scope
- Tambah `RESPONSE_LEAD_TIME` ke `SLASettingMetricEnum` (BE common lib)
- Tambah SLA Settings UI untuk admin konfigurasi RLT target (sama page/pattern FRT/TTC)
- Tambah `rltConfiguredMs` + `rltSlaMet` fields ke `conversation-sla-metrics.schema.ts` (conversation-service)
- Hitung `rltSlaMet` di `handleFirstAgentReplied()` (conversation-service) — snapshot target pada saat reply, sama pattern FRT/TTC
- Tambah `CONVERSATION_RLT` ke `ResponsivenessMetricType` enum (analytics-service)
- Extend aggregation pipeline untuk kumpulkan RLT in-SLA/over-SLA count dari conversation-service ke `responsivenessmetrics` collection (analytics-service)
- Tambah "RLT In SLA" + "RLT Over SLA" card ke SLA Breakdown section di FE (Responsiveness section)
- Expose Wait Time in Queue sebagai informational summary card di Responsiveness section (raw average, **tanpa SLA breakdown**) — sudah di-PRD-kan di Patch 2 v1.1, tidak perlu ulang scope

### 4.2 Out of Scope
- **Wait Time in Queue SLA target** — tidak ada SLA target untuk Wait Time saat ini, kecuali OQ-01 mengonfirmasi sebaliknya. Wait Time informational card (raw average) = Patch 2 scope.
- **SLA Reminder untuk RLT** — FRT dan TTC punya `reminderMinutes` + reminder notification; RLT reminder tidak dimasukkan dalam scope ini (bisa ditambah sebagai enhancement lanjutan jika perlu)
- **RLT shift-hours-adjusted variant** — BE sudah punya `calculateRltMs()` dengan office-hours support; ini sudah termasuk dalam perhitungan (sudah ada). Yang di-exclude adalah varian shift-hours yang terpisah untuk ticket-service (karena ticket-service tidak punya RLT logic)
- **Ticket domain RLT** — ticket-service tidak punya assignment-flow yang sama dengan conversation, RLT tidak relevan di domain ticket (tidak ada logic `handleAgentAssigned` + `handleFirstAgentReplied` di ticket-service)
- **Prototype update** — prototype statistic (HTML) sudah menampilkan RLT card (informasional dummy value); penambahan RLT SLA breakdown ke prototype = Patch 3 scope (interactive dashboard drill-down)
- Perubahan behavior FRT/TTC SLA existing — tidak boleh rusak

### 4.3 Protected Existing Behavior
- FRT SLA tracking (enum, schema, aggregation, FE card) — tidak boleh berubah
- TTC SLA tracking (enum, schema, aggregation, FE card) — tidak boleh berubah
- RLT `rltMs` calculation existing — tidak boleh berubah (hanya menambah `rltConfiguredMs` + `rltSlaMet`)
- Wait Time in Queue `waitTimeInQueueMs` calculation — tidak boleh berubah
- SLA Settings page existing (FRT/TTC config) — tidak boleh rusak, hanya tambah opsi baru
- Cron pre-agregasi 3 jam existing untuk ART/FRT/TTC — tidak boleh rusak (hanya extend, bukan overwrite)
- `handleAgentReplied()` flow existing — tidak boleh berubah, hanya menambah snapshot RLT target
- Redash fallback path (AGGREGATION_ENABLED=false) — tidak boleh berubah

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | **Yes** | `conversation-sla-metrics` schema bertambah field baru — additive, backward-compatible (field baru nullable, default=undefined) |
| RBAC / visibility / assignment | **No** | Tidak ada perubahan RBAC. Data RLT SLA mengikuti visibility yang sama dengan FRT/TTC SLA (statistic:read, statistic:read_team, statistic:read_own) — Patch 1 scope, bukan Patch 4 |
| API / webhook / socket / queue / cron | **Yes** | Enum `ResponsivenessMetricType` bertambah → cron pre-agregasi 3 jam perlu extend pipeline. Endpoint statistic existing tidak perlu diubah (SLA breakdown data sudah di-return, hanya field-nya yang bertambah) |
| SLA / reporting / export | **Yes** | SLA Settings page bertambah opsi metric baru + field config baru. Export statistic (Patch 1 scope) tidak terpengaruh kecuali export menyertakan SLA breakdown — perlu verifikasi |
| Migration / rollback / feature flag | **Medium** | Schema additive = tidak perlu migration script (Mongoose `strict:false` atau default undefined). Rollback = hapus enum value + field, cron berhenti aggregate metric baru. Feature flag opsional (flag toggle RLT SLA section di FE) |
| Existing regression scope | **Low** | Additive changes, tidak mengubah existing path. Regression risk = enum change di `SLASettingMetricEnum` bisa di-pick oleh code yang switch-case over enum values — perlu verify tidak ada exhaustive switch yang akan throw error |

### Early Blast-Radius Notes
- `SLASettingMetricEnum` ditambah value baru → cek semua switch/if exhaustive di SLA setting resolver dan admin UI form. Pastikan unknown enum value gracefully handled (default skip, bukan crash)
- `ResponsivenessMetricType` ditambah value baru → cek aggregation pipeline loop di `responsiveness-analytics.service.ts` — pastikan unknown metricType di-skip, bukan error
- RLT SLA breakdown di FE dimasukkan ke grid existing (FRT/TTC/Solving → FRT/TTC/Solving/RLT) → pastikan grid layout tetap responsif (2 kolom, 4 card = 2 row)

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_NEW_PRD` — ini kemampuan SLA metric baru yang belum ada konsep target-nya, bukan perbaikan PRD existing |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | **New PRD** — `PRD/Analytics/Statistic/PRD Analytics - rlt wait time sla tracking.md` (subfolder Statistic/ mengikuti Patch 1/2/3) |
| Can Proceed to PRD? | Yes — semua gap sudah diidentifikasi, pattern FRT/TTC = template |

### Routing Rationale
Patch ini menambah **metric SLA baru** (RESPONSE_LEAD_TIME) yang belum ada di sistem — bukan expose data existing yang hanya disembunyikan (Patch 2), bukan filter/display fix (Patch 2), dan bukan interaktivitas baru (Patch 3). `ROUTE_NEW_PRD` karena:
1. Ada UI surface baru (SLA Settings page — opsi metric baru)
2. Ada schema baru (field `rltConfiguredMs`/`rltSlaMet`)
3. Ada enum value baru (`SLASettingMetricEnum.RESPONSE_LEAD_TIME`, `ResponsivenessMetricType.CONVERSATION_RLT`)
4. Cross-service impact (conversation-service + analytics-service + SLA Settings UI di people/setting service)
5. Pattern identik dengan PRD Patch 1 (kemampuan baru) — new PRD bukan addendum

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner | Status |
|----|----------------|----------------|-----------|-------|--------|
| OQ-01 | Wait Time in Queue juga perlu SLA target? | Scope Patch 4 | **Resolved** | PM | **CLOSED — Tidak perlu SLA target untuk Wait Time.** Tetap informational card (raw average) di Patch 2, tanpa breakdown In/Over SLA. |
| OQ-02 | RLT SLA target default value? | Behavior saat admin belum konfigurasi | **Resolved** | PM + BE | **CLOSED — Samakan dengan FRT/TTC.** `DEFAULT_SETTINGS` (`sla-settings.constant.ts:42`) FRT dan TTC sama-sama `value: 60, unit: MINUTE, configuredMs: 3_600_000, pauseOnWaitingCustomer: true`. RLT ikut default sama: **60 menit**. |
| OQ-03 | Sistem reminder RLT gimana? | Implementation spec | **Resolved (mechanism), tetap opsional** | PM | **CLOSED (mechanism dikonfirmasi, keputusan build tetap opsional).** Reminder BUKAN fitur terpisah — field `reminderMinutes` opsional di `SLASetting` config yang sama. Snapshot ke `frtSnapshotReminderMs`/`ttcSnapshotReminderMs` saat conversation dibuat. Cron `ConversationSlaReminderCronService` jalan tiap 1 menit, cek kandidat belum selesai + belum di-pause + reminderMs>0 + belum pernah kirim (dedup flag `frtReminderSent`/`ttcReminderSent`), fire notification RMQ kalau elapsed masuk window `[configuredMs-reminderMs, configuredMs)`. RLT ikut pola sama: `rltSnapshotReminderMs` + `rltReminderSent` + tambah case `'rlt'` di `ReminderMetric` type + `resolveDueMetrics()`. **Reminder TIDAK wajib untuk SLA breakdown jalan** — breakdown in/over count independent dari reminder. Rekomendasi: reminder RLT masuk scope Patch 4 (murah, pattern sudah ada, tinggal tambah 1 case), tapi bisa dipisah jadi fast-follow kalau mau ship breakdown dulu. |
| OQ-04 | Protection Patch 1 — maksudnya ke mana? | Klarifikasi scope guard | **Resolved** | PM + BE | **CLOSED — No impact ke Patch 1.** Ini BUKAN soal RBAC/permission guard baru. Field baru `rltSlaMet`/`rltConfiguredMs` nempel di collection `conversation-sla-metrics` dan endpoint statistic yang SAMA dengan `frtSlaMet`/`ttcSlaMet` — otomatis ikut guard existing (`statistic:read`/`read_team`/`read_own` dari Patch 1). Tidak ada endpoint baru, tidak ada data classification berbeda, tidak perlu guard tambahan. |
| OQ-05 | RLT SLA breakdown di tab Ticket — tampilkan atau hide? | UI spec | **Resolved** | PM + FE | **CLOSED — Hide (sementara).** Ticket-service **SUDAH PUNYA** FRT (`firstResponseTimeMs`) dan TTC (`timeToCloseMs`) SLA breakdown sendiri (`ticket-sla-breakdown.service.ts`, on-the-fly `$expr` aggregation, bukan pre-computed boolean seperti conversation) — jadi FRT/TTC SLA breakdown domain-agnostic, tampil di kedua tab. **RLT beda: assignment-based logic (`calculateRltMs`) HANYA ada di conversation-service**, ticket-service tidak punya assignment-flow setara. Keputusan: **sembunyikan baris RLT SLA di tab Ticket** (bukan tampilkan N/A) sampai ada keputusan produk apakah ticket butuh RLT-equivalent metric. |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Scope lock, OQ-01 (Wait Time SLA), OQ-05 (tab behavior) | **Pending** | Brief ini = artifact untuk PM review |
| Stakeholder / Business User | RLT SLA target value validation (OQ-02) | Pending | Butuh input bisnis: berapa target RLT yang reasonable? |
| FE / BE / Tech Lead (Naftal Yunior) | Technical direction: additive schema, enum extension, aggregation pipeline change | Pending | Pattern identical FRT/TTC, technical risk rendah |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD Patch 4 | `PRD/Analytics/Statistic/PRD Analytics - rlt wait time sla tracking.md` (akan dibuat) | source scope, change class, OQ list, current-state baseline |
| Assessment Report | `Assessments/cross-domain/agent-statistic-access/` (jika diperlukan) | blast-radius analysis, cross-impact notes |
| QA Pre-Implementation Review | TBD | protected behavior list, early impact flags |
| QA Post-Implementation Validation | TBD | validate against original scoped intent (RLT SLA breakdown exists, target configurable, aggregation works) |
| Automation Mapping / Test Spec | TBD | traceability: RLT SLA calculation, enum extension, FE card rendering |
| Patch 2 PRD | `PRD/Analytics/Statistic/PRD Analytics - statistic parameter improvement.md` | patch ini feed ke Patch 2 (summary card RLT + SLA breakdown) |
| Patch 3 PRD | `PRD/Analytics/Statistic/PRD Analytics - statistic interactive dashboard.md` | patch ini feed ke Patch 3 (RLT SLA drill target baru) |

---

## 10. Perubahan Teknis yang Dibutuhkan (Summary)

### Layer 1: SLA Target Configuration (BE common lib + SLA Settings UI)
```
libs/common/src/lib/enums/index.ts
  SLASettingMetricEnum.RESPONSE_LEAD_TIME = 'response_lead_time'   // TAMBAH
```
SLA Settings UI: tambah opsi "Response Lead Time" di dropdown/list metric config (sama pattern FRT/TTC — value + unit + reminderMinutes).

### Layer 2: Metrics Snapshot (conversation-service)
```
conversation-sla-metrics.schema.ts
  rltConfiguredMs?: number      // TAMBAH — snapshot target RLT saat reply pertama
  rltSlaMet?: boolean           // TAMBAH — computed: rltMs <= rltConfiguredMs
```
Update `handleFirstAgentReplied()` untuk snapshot `rltConfiguredMs` dari resolved SLA config (sama pattern `frtSnapshotConfiguredMs` yang sudah ada).

### Layer 3: Analytics Aggregation (analytics-service)
```
responsiveness-metrics.schema.ts
  ResponsivenessMetricType.CONVERSATION_RLT = 'conversation_rlt'  // TAMBAH
```
Extend cron aggregation pipeline (`responsiveness-analytics.service.ts ~line 521-534`) untuk query RLT in-SLA/over-SLA count dari conversation-service dan write ke `responsivenessmetrics` collection.

### Layer 4: FE Display (omnichannel-satuinbox-fe)
```
SLABreakdownSection.tsx
  Tambah baris "Response Lead Time" di grid In SLA / Over SLA
  (sama pattern FRT/TTC — 2 kolom hijau/merah, count + percent)
```
Layout: 2-kolom grid bertambah dari 3 rows (FRT/TTC/Solving) → 4 rows (FRT/TTC/Solving/RLT).

---

## 11. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-14 | Initial brief v1.0 created | Dany Christian |
