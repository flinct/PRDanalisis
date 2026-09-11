# Assessment Report — MongoDB Hot/Warm/Cold Storage Tiering (conversation-service & ticket-service)

> **Assessment Type:** Type 1 — Architecture / Discovery Impact Assessment
> **Owner:** Analyst
> **Source PRD / Source Input:** Change Intake Brief `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/mongodb-hot-warm-cold-tiering-change-intake-brief.md` (v1.0, 2026-09-08)
> **Source Change Intake Brief:** `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/mongodb-hot-warm-cold-tiering-change-intake-brief.md`
> **Assessment Artifact Path:** `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/mongodb-hot-warm-cold-tiering-qa-assessment.md`
> **Version:** `v1.1`
> **Previous Version:** `v1.0`
> **Rules Applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/task-router.md`, `Rules/core/change-management.md`, `Rules/profiles/satuinbox.yml`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Rules/core/task-router.md`, `Rules/profiles/satuinbox.yml`, code base `omnichannel-satuinbox-be` (branch `v2.7.0` working tree, read 2026-09-08)
> **Tanggal Analisa:** 2026-09-08
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- **Initial version** — Assessment teknis/discovery untuk proposal topology MongoDB Hot/Warm/Cold tiering, menjawab 10 blocking question (OQ-01..OQ-10) dari Change Intake Brief.
- **Risiko baru yang muncul:** CRITICAL read-path split-brain pada aggregate lintas-tier (KPI strip, export, SLA cron) dan cross-collection search (Atlas Search / regex) yang bertumpu pada asumsi data semua umur ada dalam satu collection. CRITICAL mekanisme arsip COLD melanggar rule non-bypassable database-per-service bila COLD = S3. HIGH state-machine corruption bila perpindahan tier berbasis umur saja, bukan state+SLA cycle.
- **Keputusan final:** `HOLD_FEATURE` — routing discovery **`SPLIT_A`** (data profiling OQ-01/02 + demand confirmation OQ-08 + keputusan mekanisme COLD OQ-03/04/05) wajib dijalankan sebelum PRD apa pun. `REVISE_PRD` tidak applicable: belum ada PRD formal untuk direvisi.
- **v1.1 change summary (revisi reviewer, verdict revise_analysis):** (1) decision enum dikoreksi `REVISE_PRD` → `HOLD_FEATURE` dengan routing eksplisit `SPLIT_A` + rationale demand/readiness/governance; (2) referensi finding ID menggantung (label SLA/SNOOZE/AGG/SR/COLD/DATA) direkonsiliasi ke header nyata F-01..F-10 / ASC-1; (3) QP-24 (snapshot sync conversation-ticket) & QP-25 (re-application RBAC per tier) ditambahkan ke peta query path. Evidence-grounding tidak berubah; test tetap Suggested/Pending.

---

## 1. Overview

**Feature / Issue:** Mengganti topology MongoDB saat ini (single replica set `rs0` 3-node, database-per-service) dengan model penyimpanan bertingkat berdasarkan umur data: HOT (0–3 bln, collection + full index), WARM (4–6 bln, collection terpisah/partitioned + partial index), COLD (≥7 bln, arsip S3 atau collection tanpa index). Berlaku primer untuk data yang dimiliki `conversation-service` dan `ticket-service`.

**Objective:** Menjaga working set HOT stabil & cepat, mempertahankan akses histori (detail/history/search/report/export), mengendalikan footprint EBS & biaya, TANPA mengubah perilaku user-facing (list, detail, SLA, socket, search, KPI, export), dan mematuhi rule database-per-service.

**Business Context:** Growth data retention penuh di satu set collection pada 3 node yang sama menaikkan footprint EBS 200GiB/pod, menekan WiredTiger cache 9GiB, dan query data lama menurunkan performa segmen hangat. Driver = infra (kapasitas/biaya/performa), demand level L0/L1 (belum ada evidence operasional perf blokir kerja agent).

**Change Class / Routing Decision from Brief:** `BEHAVIOR_CHANGE` (topology/penyimpanan; komposit). Brief routing: `HOLD_NEEDS_DISCOVERY` (potensi `SPLIT_REQUEST`). Assessment memetakan discovery brief ini sebagai **`SPLIT_A`** (lihat §2.1). Intake berstatus Draft; PM/BE/stakeholder approval pending.

**Protected Existing Behavior from Brief (§4.3):**
- Database-per-service rule (non-bypassable): tidak ada service membaca MongoDB service lain secara langsung; tiering/archive COLD tidak boleh memaksa cross-DB read (termasuk via S3) tanpa keputusan arsitektur eksplisit.
- Detail conversation/ticket lintas umur tetap bisa dibuka; histori tidak hilang / latency tak terkendali.
- Socket events bisa datang untuk conversation mana pun (termasuk thread lama) → data COLD/WARM tidak boleh "readonly mati"; update state/list harus tetap terpicu.
- SLA RLT/WaitTime (`conversation_sla_metrics`) + per-stage SLA ticket (`slaState.cycleId`) akurat untuk reopen & SLA continuation; data SLA lama tidak ter-archive sebelum siklus selesai.
- Ticket snooze state lintas bulan tidak kehilangan state saat pindah tier.
- KPI strip & queue views: agregasi seluruh tiket tanpa filter umur konsisten.
- Export full XLSX semua tiket tanpa age filter berfungsi.
- Global search (regex/substring aktif, window default 3 bln, `GLOBAL_SEARCH_ATLAS_ENABLED=false`) tidak berubah tanpa keputusan terpisah; mongot sudah jalan di tiap pod.
- Hubungan conversation↔ticket (linked bubble, snapshot denormalized) tidak putus oleh perbedaan tier.
- SLA engine & reminder/delayed-queue (RabbitMQ) yang membaca data SLA tidak kehilangan data yang dipindah.

**Scope In:** conversation-service (`satuinbox_conversation`: conversations, messages, notes, templates, SLA/FRT/TTC, CSAT, transcripts) + ticket-service (`satuinbox_ticket`: tickets, stages, per-stage SLA, snooze, bulk reply, exports). Pemetaan akses data ke HOT/WARM/COLD. Pertanyaan arsitektur (mekanisme, partial index, arsip, policy pindah, database-per-service).

**Scope Out:** Implementasi kode service manapun (fase discovery). Desain final mekanisme COLD (format ekspor S3, lifecycle). Perubahan topology DB service lain. Perubahan UX/FE. Perubahan semantik SLA metric (FRT/TTC/RLT/WaitTime).

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `HOLD_FEATURE` — jangan lanjut ke PRD; routing eksplisit ke discovery split **`SPLIT_A`** (data profiling + demand confirmation + keputusan mekanisme COLD) sebagai prasyarat sebelum PRD apa pun.

**Decision Class:** `NO_GO` untuk PRD penuh saat ini + `CONDITIONAL_GO`/discovery lane untuk **`SPLIT_A`** — PRD hanya boleh dimulai setelah SPLIT_A menyerahkan evidence data & keputusan mekanisme.

**Rationale — mengapa `HOLD_FEATURE`, bukan `REVISE_PRD`:**
> (a) **Demand gagal demand screen** — level L0/L1 (unconfirmed; OQ-08 belum ada evidence storage cap/perf breach terukur/biaya EBS) tidak memenuhi syarat change-management untuk full PRD. (b) **10/10 OQ blocking belum terjawab** (OQ-01..OQ-10, §10) — termasuk pola akses/umur data (OQ-01) dan scope topology rs0-global vs per-DB (OQ-09). (c) **Konflik governance COLD=S3 vs rule non-bypassable database-per-service belum diarbitrasi** (Finding F-03) — keputusan arsitektur eksplisit untuk PM/BE/Engineering Lead, bukan Analyst. (d) **Belum ada PRD formal** (§3: fase discovery) sehingga tidak ada requirement defect untuk direvisi — sesuai decision_taxonomy & qa semantics: REVISE_PRD = PRD requirements yang defect; HOLD_FEATURE = jangan proceed karena unresolved risk/dependency/readiness. Kasus ini masuk kategori terakhir.

**Decision Statement:**
> Model tiering HOT/WARM/COLD sebagaimana diusulkan brief **di-HOLD (`HOLD_FEATURE`): tidak layak lanjut ke PRD saat ini** karena: (1) bertentangan langsung dengan dua fetch path inti (KPI/export multi-collection dan socket write ke data lama) yang mengasumsikan satu collection per batch; (2) elemen COLD=S3 melanggar rule non-bypassable database-per-service (F-03); (3) tidak ada evidence demand L0/L1 (OQ-08) maupun verifikasi pola akses/umur data (OQ-01); (4) seluruh 10 OQ blocking masih unanswered. Arsitektur HS/W/C *dapat* bernilai jika dibatasi ke **tiering dalam satu database per service** (bukan lintas S3) + state-aware migration policy + query rewriter yang sinkron dengan repository — semua ini belum dispesifikasikan di brief. Maka: **`HOLD_FEATURE`** dengan routing ke **`SPLIT_A`** (data profiling OQ-01/02 + demand confirmation OQ-08 + scope lock OQ-09 + keputusan mekanisme COLD OQ-03/04/05); Assessment di-rerun setelah SPLIT_A untuk mengangkat HOLD menjadi keputusan definitif sebelum PRD dimulai.

### 2.2 Required Actions Before Development

- [ ] **OQ-01 — Data profiling wajib:** dapatkan ukuran & hitungan dokumen per collection per bulan (conversations, messages, tickets, stages, sla_metrics) dan % data >3/>6 bulan. Tanpa ini, asumsi demand tidak terverifikasi.
- [ ] **OQ-08 — Demand confirmation:** buktikan L3/L4 (storage cap, perf breach terukur, biaya EBS) dari PM/stakeholder. L0/L1 tidak boleh memicu PRD penuh.
- [ ] **OQ-09 — Scope lock:** putuskan tiering rs0-global vs per-DB conversation/ticket. Berdampak luas Assessment dan index/search sync.
- [ ] **OQ-04 — Keputusan arsitektur COLD eksplisit:** putuskan apakah COLD di dalam MongoDB (collection tanpa index, mongodump/mongorestore, sharded) vs S3. Jika S3 → wajib dokumen pemutusan/pengecualian rule database-per-service (non-bypassable; butuh approval eksplisit).
- [ ] **OQ-05 — State-aware tier policy:** definisikan perpindahan berbasis *state + umur*, bukan umur saja (conversation open, ticket snoozed, slaState.cycleId aktif, stage SLA RUNNING).
- [ ] **OQ-03 — Feasibility Community:** verifikasi fitur yang dipilih pada MongoDB 8.0.20 Community (tanpa Tiered Storage resmi; tidak ada offline/S3 tier bawaan) → desain mekanisme manual + job migrasi.
- [ ] **OQ-07 — Retention & compliance:** konfirmasi kewajiban simpan data >X tahun; tentukan apakah `expiresAt` diaktifkan; legal/ops.

### 2.3 Key Blocking Reasons / Conditions

- **P1 blocking (core infrastructure):** Tidak ada mekanisme tiering terkelola di MongoDB Community 8.0.20 untuk collection non-timeseries. Semua opsi = custom (collection terpisah / sharding / arsip). Ini membuat setiap desain penuh implikasi API/repository.
- **P1 blocking (protected behavior):** Read/socket/aggregate path membutuhkan akses lintas umur pada satu collection. Split fisik lintas collection/S3 memaksa tapis tambahan di setiap repository + re-route socket — bukan perubahan "storage-only".
- **P1 blocking (governance):** COLD lintas database (S3) menyentuh rule non-bypassable database-per-service; belum ada keputusan/approval pemutusan.
- **P2 blocking (demand):** Tidak ada evidence L0-L1 yang membenarkan full PRD; discovery & profiling belum dijalankan.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Critical
- **Risk Level:** Critical
- **Primary Impact Areas:** Database, Backend (repository/query path), Search (mongot/Atlas), Reporting/Export, SLA, Integration (socket/queue/cron), Migration, RBAC (visibility lintas-tier)

---

## 3. Requirement Summary

> Fase discovery — belum ada PRD formal. Requirement di sini = implikasi teknis dari OQ-01..OQ-10 dan protected behavior §4.3 dari brief.

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|-------|---------------|--------|
| BR-01 | Data conversation/ticket dilihat secara konsisten lintas umur; detail lama (≥7 bln) tetap terbuka agent. | Brief §4.3 / global-memory (Detail v2.1: detail history bebas umur) |
| BR-02 | Socket event (message baru, assignment, tag, dst.) untuk conversation mana pun — termasuk thread lama — harus memicu update state/list tanpa asumsi cold=readonly. | Brief §4.3 / global-memory Room rules (mutations update Chat List via socket) |
| BR-03 | SLA RLT/WaitTime (+ per-stage ticket SLA cycleId) akurat lintas reopen; data SLA lama tidak ter-archive sebelum siklus selesai. | Brief §4.3 / global-memory SLA Metric + Ticket SLA rules |
| BR-04 | Snooze ticket berbulan-bulan tidak kehilangan state saat pindah tier; wake-up (snoozedUntil) tetap berfungsi. | Brief §4.3 / ticket schema `snooze.snoozedUntil` (indexed) |
| BR-05 | KPI strip & queue views agregasi seluruh tiket tanpa filter umur; export full XLSX tanpa age filter berfungsi. | Brief §4.3 / ticket.repository getTicketKpiCounts, getTicketsForExport |
| BR-06 | Global search (regex/substring window 3 bln default) & mongot Atlas Search tidak berubah tanpa keputusan terpisah. | Brief §4.3 / CLAUDE-be §9 feature flags |
| BR-07 | Database-per-service non-bypassable; tidak ada service baca DB service lain (termasuk via S3). | Brief §4.3 / CLAUDE-be §2 architecture rule |
| BR-08 | Setiap query & mutation tenant-scoped (companyId + organizationId); visibility RBAC tidak berubah. | CLAUDE-be §8 / global-memory RBAC rules |

### 3.2 Acceptance Criteria (discovery gate)

- Mekanisme tiering yang dipilih compatible dengan MongoDB 8.0.20 Community (evidence, bukan asumsi).
- Ada peta lengkap query path → tier (HOT/WARM/COLD) untuk seluruh fetch di conversation & ticket service.
- Predikat state-aware migration (open/snoozed/cycleId/status) didefinisikan dan diuji terhadap skenario reopen/snooze/SLA.
- Rollback & feature-flag plan untuk migrasi data lintas-tier berdasar pelajaran migrasi Atlas→self-hosted.
- Keputusan COLD eksplisit (MongoDB vs S3) dengan approval rule database-per-service.

### 3.3 Assumptions

- MongoDB 8.0.20 Community (bukan Atlas) — **CONFIRMED** (context), kecuali verified berbeda.
- Konektifitas terbatas web source (403) → klaim versi fitur Community berbasis knowledge model, diberi label evidence/knowledge, bukan verified-docs.
- `expiresAt` field ada di conversation schema dengan TTL index (`expireAfterSeconds: 0`), default null → awareness: mengaktifkannya OTTOMATIS menghapus dokumen (TTL delete), BUKAN memindahkannya — ini risiko besar berupa data loss, bukan tiering.

### 3.4 Clarifications Needed

- Apakah tiering dimaksudkan juga untuk `messages` dan `conversation_sla_metrics` atau hanya collection utama? (Mempengaruhi aggregate index & SLA fetch.)
- Apakah mongot (Atlas Search) index perlu mencakup WARM/COLD, atau tetap HOT-only dengan window 3 bln? (OQ-06.)
- Definisikan "archive" vs "deleted": TTL delete ≠ archive; bedanya material.

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- MongoDB 8.0.20 Community, rs0 3-node, WiredTiger cache 9GiB, EBS gp3 200GiB data/pod, database-per-service; conversation-service pakai pool max 20, `satuinbox_conversation` & `satuinbox_ticket` berdiri sendiri.
- Semua collection utama: `conversations`, `messages`, `notes`, `templates`, `conversation_sla_metrics`, `csats`, `transcripts` (conversation) dan `tickets`, `stages`, `bulk_jobs`, `bulk_job_rows`, `csats`, `ticket_types`, `messages` (ticket).
- Search: `GLOBAL_SEARCH_ATLAS_ENABLED=false` → regex/substring path aktif; mongot sidecar jalan tiap pod; `GLOBAL_SEARCH_DEFAULT_WINDOW_MONTHS=3`; Atlas Search pipeline code ada tapi gate flag dependen (`ATLAS_SEARCH.ENABLED` tidak ditemukan di constant → dead/typo risk, lihat Finding ASC-1).
- SLA: FRT/TTC dihitung real-time/service-side (bukan disimpan di doc conversation); RLT+WaitTime disimpan di `conversation_sla_metrics`. Ticket: per-stage SLA state machine, `slaState.cycleId`, `snooze.snoozedUntil` indexed, bulk reply FIFO (`prefetch=1`), export cursor batch.
- Semua akses data satu collection per collection: chat list by status+updatedAt+RBAC+companyId; detail by _id; socket by conversationId; KPI/export aggregate satu collection `tickets`; SLA cron `findTicketsForSlaEvaluation` scan satu collection.

### 4.2 Proposed State (To-Be)

- HOT 0–3 bln: collection saat ini, full index, in-memory.
- WARM 4–6 bln: collection terpisah / partitioned / partial index.
- COLD ≥7 bln: arsip (S3 atau collection tanpa index).
- Berlaku untuk data conversation & ticket service. Semua user-facing behavior harus identik dengan as-is.

### 4.3 State Transition / Data Flow Notes

- Setiap data pindah HOT→WARM→COLD memicu kebutuhan: repository/query rewriter, socket routing, search index scope, aggregate scope, SLA cron scope, export scope.
- Perpindahan berdasarkan umur saja akan memindahkan entitas stateful (conversation open yang sudah lama, ticket snoozed berbulan-bulan, ticket dgn SLA cycle belum selesai) ke tier yang tidak lagi mendukung write/socket/snooze-wake → korupsi state machine (Finding F-01 — aspek SLA cycle & snooze state).

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Database | Split collection / partition / arsip per umur; partial index WARM; TTL dilewati | Setiap repository query + aggregate + index | HIGH | Query rewriter per repository; view/union; index migration |
| API | Query path mengarah ke collection berbeda tergantung umur; balikan host harus sama | Chat list, detail, search, KPI, export endpoint | HIGH | Abstraction repository, sepakati kontrak polycollection |
| UI/UX | Tidak berubah (dijaga) bila transparan | FE hanya lihat data | MEDIUM (jika bocor) | Tanpa perubahan behavior user-facing |
| Security / RBAC | Visibility lintas tier harus menghormati scope sama; risiko data tak terlihat jika query miss tier | Chat list RBAC, ticket views | HIGH | Setiap query rewriter wajib terapkan filter tenant+RBAc identik |
| Performance | Working set HOT stabil; WARM read slower (partial index / no-index COLD); aggregate lintas tier mahal | KPI, export, SLA cron | HIGH | Copy-on-read / materialized aggregate; batasi window; rumah HOT
| Integration | Socket event ke thread lama; bulk reply FIFO lintas umur; snooze wake; SLA reminder delayed queue | Gateway socket, bulk worker, cron, queue | HIGH | Re-route socket lookup; idempotency lintas tier |
| Reporting / Analytics | KPI strip & export full tanpa age filter harus membaca seluruh tier | analytics-service / ticket export | HIGH | Aggregation span collection/S3 = tantangan utama |
| Financial / Operational | EBS turun (COLD ke S3/lower tier) tapi biaya egress/query & migration/ops naik | Infra cost | MEDIUM | Net-cost model harus dihitung (OQ-01/OQ-08) |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Conversation detail by id | collection lookup by _id | read | HOT/WARM needed | detail akses bebas umur → `_id` lookup lintas collection |
| Chat list / search | index on status+updatedAt+companyId | read | HOT primary | query multi-branch regex/search; split → N query |
| Socket event | message.write by conversationId | write/read | HOT always | event ke thread lama → data bisa WARM/COLD |
| SLA RLT/WaitTime | `conversation_sla_metrics` by conversationId | read | HOT/WARM | migrated after cycle ends only |
| Ticket KPI / export / queue | aggregate on `tickets` (no age filter) | read | ALL tiers | HARUS lintas collection/S3 |
| Ticket SLA cron | `findTicketsForSlaEvaluation` scan | read | HOT primary | scan `slaState.isPaused`, snooze, status |
| Snooze wake | `snooze.snoozedUntil` index | read/write | HOT primary | wake-up on expired snooze → must stay writable |
| Bulk reply FIFO | messages/tickets by id batch | read/write | ALL tiers | async job menyentuh tiket umur apa pun |
| Search (mongot/Atlas) | Search index per collection | read | HOT default (window 3m) | index scope vs tier |

### 6.2 Shared Resources / Event Mapping

- MongoDB rs0 shared; mongot sidecar shared; RabbitMQ `satuinbox-exchange`; socket gateway `:3002`; SLA cron & auto-pull cron (conversation) dan SLA eval cron (ticket).
- Cross-domain link conversation↔ticket via denormalized snapshot (no cross-DB read) — tier split tidak boleh memutus snapshot refresh event.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Perpindahan umur-only memindahkan conversation open lama / ticket snoozed / SLA cycle belum selesai → write/socket/snooze-wake gagal | High | Critical | Critical | State-aware migration policy (BR-03/04) + gate checker sebelum pindah + idempotent re-route |
| R-02 | KPI strip / export full / SLA cron mulai membaca banyak collection/S3; agregasi lintas-tier lambat / timeout / double-count (join duplikat antar tier) | High | High | High | Query rewriter + merged aggregation; materialized KPI; paginate & cursor; no global cross-DB |
| R-03 | COLD = S3 melanggar rule non-bypassable database-per-service & menambah jalur I/O download | High | High | High | Keputusan eksplisit + approval; atau tahan COLD di MongoDB (collection no-index/archived) |
| R-04 | Search (mongot Atlas Search / regex) hanya indeks HOT; pencarian data lama gagal/tidak konsisten | Medium | High | High | Search window policy eksplisit; tambah index bila perlu; user-facing tidak berubah |
| R-05 | Socket event ke thread WARM/COLD gagal karena data dipindah tanpa re-wiring lookup | Medium | High | Medium | Lookup by conversationId lintas tier + event fan-out idempotent |
| R-06 | Migrasi data besar (tier move) downtime / kehilangan update konkuren (balasan/socket selama migrasi) | Medium | High | High | Pelajaran migrasi Atlas→self-hosted; backfill job; feature flag; rollback drill |
| R-07 | TTL `expiresAt` diaktifkan → soft-delete/delete data (bukan archive) | Medium | Critical | High | JANGAN aktifkan TTL untuk tiering; archive ≠ TTL delete (Finding F-05) |

### 7.2 Worst-Case Scenarios

- Data conversation/ticket lama yang masih dirujuk oleh state aktif (snoozed, open, SLA RUNNING) kehilangan mutability → agent tidak bisa membalas/conversation "beku", ticket tidak wake dari snooze, SLA breach salah dihitung.
- Export full & KPI strip memuat seluruh tier termasuk S3 dalam satu request → RTO terlampaui, timeout, ancaman stabilitas gateway.
- Rollback migrasi sulit karena data sudah terpecah antar penyimpanan → regenerasi/histori tidak konsisten.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Chat list / room detail untuk conversation lintas umur (0 vs 4 vs 8 bln) — akses & latency terkendali.
- Socket event (message baru, assignment, tag) ke conversation 8 bulan + reopen toggling closed→open.
- SLA reopen cycleId + snooze wake lintas bulan + stage SLA resume.
- Global search dengan dan tanpa Atlas Search + window 3 bln.
- KPI strip (Semua tiket / Lewat SLA / Selesai / Snoozed) & export full memuat seluruh umur.

### 8.2 Regression Scope
Detail conversation, chat list filter RBAC, bulk reply FIFO, reminder/SLA cron, replay/create ticket consistency, linked conversation↔ticket snapshot, export XLSX.

### 8.3 Integration Scope
Socket gateway → service → Mongo; bulk worker → Mongo; SLA delayed-queue; analytics-service aggregate; mongot sync (jika lintas tier).

### 8.4 UAT / Business Validation
Agent buka histori lama; supervisor KPI strip akurat; export besar tidak pecah; reopen/snooze/SLA berkelanjutan.

### 8.5 Automation Candidates
Query path mapping lintas tier (fixture data 3 umur); SLA state machine replay; KPI aggregation consistency checker; migration/rollback drill.

---

## 9. Production Safety

- **Rollback Strategy:** Tiering wajib feature-flagged; sebelum rollback, pastikan versi lama dapat membaca collection SEPERTI as-is; data yang sudah dipindah ke WARM/COLD harus bisa di-restore/tarik balik ke HOT tanpa kehilangan state.
- **Feature Toggle Requirement:** Ya — flag runtime per tier / per collection; migrasi & pembacaan lintas-tier gated.
- **Backward Compatibility Notes:** API/UI kontrak tidak boleh berubah; repository harus abstraksi.
- **Staged Rollout Recommendation:** Expansion dari HOT-only terlebih dahulu; WARM hanya untuk collection yang aksesnya terbukti read-only; COLD hanya setelah approval rule database-per-service & net-cost model.
- **Monitoring / Alerting Needs:** Durasi query lintas-tier, kecepatan tier-move job, error socket route ke WARM/COLD, waktu export/KPI, ukuran collection per tier.
- **Logging / Audit Gaps:** Audit trail move antar tier; log event yang menyentuh data pindah (reopen/snooze/SLA).

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|-------|----------|----------------|-----------|
| OQ-01 | Distribusi data aktual (ukuran/hitungan per collection per bulan; % >3/>6 bln) | Memvalidasi demand & desain tier | **Yes** |
| OQ-02 | Pola akses data lama aktual (detail lama, socket, export, search, KPI) | Menentukan tier yang harus queryable real-time | **Yes** |
| OQ-03 | Mekanisme tiering mana (collection terpisah / partition / S3 / no-index) & compatible Community 8.0.20? | Feasibility teknis | **Yes** |
| OQ-04 | Read-path lintas-tier tanpa melanggar database-per-service; siapa query join agregat lintas tier? | KPI/export/search | **Yes** |
| OQ-05 | Policy pindah tier: umur vs state; update/socket ke data COLD? | State machine SLA/snooze/reopen | **Yes** |
| OQ-06 | Search window (3 bln) & mongot scope vs tier? | Desain index & search | **Yes** |
| OQ-07 | Retention & compliance; apakah `expiresAt` diaktifkan? | Legal/ops; risiko TTL delete | **Yes** |
| OQ-08 | Evidence demand (storage cap / perf breach / biaya EBS) dari user/stakeholder? | Demand screen L0-L4 | **Yes** |
| OQ-09 | Topology rs0-global vs per-DB conversation/ticket? | Scope assessment | **Yes** |
| OQ-10 | Migration mechanics & rollback tanpa downtime/kehilangan update konkuren; feature flag mana? | Migrasi data besar | **Yes** |

> **Status seluruh OQ: UNANSWERED (10/10 blocking).** Semua ditandai blocking di brief; belum ada jawaban/evidence dari BE/PM/stakeholder pada saat penulisan assessment ini.

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Brief menyebut 10 OQ, semuanya blocking, dan routing `HOLD_NEEDS_DISCOVERY`. Assessment ini menegaskan bahwa blocking bersifat material (bukan formalitas): dua fetch path paling dilindungi (KPI/export dan socket-write ke data lama) pada implementasi saat ini mengasumsikan **satu collection** dan **data timeline penuh**.
- MongoDB Community 8.0.20 tanpa tiered storage resmi untuk non-timeseries → setiap pilihan mekanisme adalah custom engineering dengan permukaan API/repository yang luas. Assessment tidak dapat memberikan rekomendasi mekanika hingga OQ-03 didiskusikan dengan evidence data (OQ-01/02).
- Rule non-bypassable database-per-service secara langsung menghambat COLD=S3 spesifikasi brief; ini keputusan arsitektur eksplisit yang harus diputuskan PM/BE/Engineering Lead, bukan oleh Analyst.
- Demand level L0/L1 (menurut brief) tidak membenarkan full PRD sebelum ada evidence operasional.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `HOLD_FEATURE` — routing **`SPLIT_A`** (discovery); lihat §2.1. HOLD diangkat (→ `PROCEED_WITH_CAUTION` / `REVISE_PRD` saat PRD sudah ada) hanya setelah SPLIT_A menjawab OQ-01/03/04/08/09 |
| Owner for Follow-up | BE / Tech Lead (Naftal Yunior) untuk OQ-01..06, OQ-09..10; PM/Dany Christian untuk OQ-07/08 |
| Required Revisions | Brief: definisi state-aware tier policy (OQ-05), keputusan COLD eksplisit (OQ-04), scope topology (OQ-09), peringatan TTL≠archive (OQ-07) |
| Suggested Delivery Strategy | Pilot / phase split — HOT-first, WARM hanya read-only, COLD tunda sampai approval & net-cost |
| Earliest Safe Next Step | Jalankan data profiling + demand confirmation (OQ-01, OQ-08) → lalu rerun assessment; tanpa itu, PRD tidak boleh dimulai |

---

## 12. Traceability Matrix

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| BR-01 | Detail lintas umur tetap terbuka | QP-01..QP-12, QP-24 | conversation/ticket detail | TC-tier-detail | Pending |
| BR-02 | Socket ke thread lama utuh | QP-13..QP-15 | socket/gateway | TC-tier-socket | Pending |
| BR-03 | SLA reopen/continuation utuh | F-01 | SLA engine | TC-tier-sla-reopen | Pending |
| BR-04 | Snooze state utuh lintas bulan | F-01 | ticket snooze | TC-tier-snooze-wake | Pending |
| BR-05 | KPI/export full tanpa age filter konsisten | QP-16..QP-19, F-02 | KPI/export | TC-tier-kpi-export | Pending |
| BR-06 | Global search window & mongot scope | ASC-1, F-06 | search | TC-tier-search | Pending |
| BR-07 | Database-per-service non-bypassable | F-03 | arsip | TC-tier-db-per-service | Pending |
| BR-08 | RBAC/tenant scope (companyId+organizationId) tidak berubah lintas tier | QP-25 | RBAC (list/detail lintas-tier) | TC-tier-rbac | Pending |

---

## 13. Findings

### F-01 P0 CRITICAL / RISK — Migrasi umur-only menyebabkan korupsi state machine (open conversation, snoozed ticket, SLA cycle)

**Status:** Confirmed (state-machine risk; mekanisme final belum dipilih)
**Location:** conversation-service (`conversations.status` open/closed), ticket-service (`snooze.snoozedUntil`, `slaState.cycleId`, `stages.sla.state`)
**Scenario:** Conversation dibuka >6 bulan (tidak ditutup) → bergeser ke WARM/COLD → message baru/socket datang → update gagal karena collection read-only/dipindah. Ticket disnooze berbulan-bulan → dikategorikan COLD → wake-up (`snoozedUntil` sweep) tidak menemukan/menulis → ticket tetap "beku". Ticket dengan `slaState.cycleId` RUNNING yang dipindah → SLA cron `findTicketsForSlaEvaluation` scan satu collection tidak menemukannya.
**Expected:** Seluruh entitas stateful lintas tier tetap mutable & terdeteksi oleh cron/socket/snooze-wake.
**Actual / Failure Mode:** Data dipindah prematur berdasarkan umur tanpa memeriksa status/snooze/cycle; update&scan miss; SLA & reopen rusak.
**Root Cause:** Brief §5/§7 mengajukan `policy perpindahan tier (TTL/backfill job)` yang tampak berbasis umur ("age vs state" OQ-05 belum dijawab).
**Evidence:** `ticket.repository.ts:1121-1143` scan `findTicketsForSlaEvaluation` filter `{slaState.isPaused:false, snooze.snoozedUntil<=now, status:OPEN, stages.sla.state:RUNNING}` dan `this.model.find(...).limit(limit)` — satu collection. conversation schema `status` open/closed + `updatedAt` index (`conversation.repository.ts`).
**Impact:** Agent tidak bisa menuntaskan pekerjaan (conversation terblokir), SLA salah/beku, kredibilitas metrik rusak.
**Blast Radius:** Semua tenant; conversation & ticket service; SLA engine; socket; cron.
**Recommendation:** Tier policy WAJIB state-aware: jangan pindahkan entitas dengan status open / snooze aktif / stage SLA RUNNING / cycleId belum terminal. Tambahkan gate checker pra-migrasi + idempotent re-route saat event masuk ke data tier-dingin.
**Suggested Test:** Fixture 3 umur; pindahkan conversation open & ticket snoozed secara manual → assert socket/message/snooze-wake/SLA masih berfungsi.

---

### F-02 P1 HIGH / DATA INTEGRITY ISSUE — Agregasi KPI, export, dan SLA cron mengasumsikan satu collection dan seluruh timeline

**Status:** Confirmed
**Location:** ticket-service (`getTicketKpiCounts`, `getTicketsForExport`, `countTicketsForExport`, `findTicketsForSlaEvaluation`), conversation-service KPI/export analog
**Scenario:** `getTicketKpiCounts` menjalankan satu `aggregate` dgn `$match` pada collection `tickets` (tanpa age filter) → data pindah ke WARM/COLD tidak masuk hitungan KPI/export.
**Expected:** "Semua tiket / Lewat SLA / Selesai / Snoozed" dan export XLSX memuat seluruh umur (BR-05).
**Actual / Failure Mode:** Query miss seluruh dokumen di collection terpisah/arsip → KPI under-count, export tidak lengkap, SLA over-sla count salah.
**Root Cause:** Repository dibuat satu-collection; tidak ada union/glue lintas collection/S3.
**Evidence:** `ticket.repository.ts:176-236` `getTicketKpiCounts` aggregate `$match combinedMatch` di `this.model` (satu collection `tickets`); `:490-534` export & count.
**Impact:** KPI strip & laporan menyesatkan; export kehilangan data; compliance/ops.
**Blast Radius:** Semua tenant yang memakai ticket KPI/export.
**Recommendation:** Desain lintas-tier wajib menyatukan agregasi (merged pipeline / materialized KPI / copy-on-read), atau constraint ketat bahwa collection tier tetap dalam satu database & satu query namespace (view/union). JANGAN S3 untuk data yang masih di-agregat full.
**Suggested Test:** Buat data 8 bln; pindahkan WARM/COLD; assert KPI & export count tidak berubah.

---

### F-03 P1 HIGH / SECURITY & GOVERNANCE / RISK — COLD=S3 melanggar rule non-bypassable database-per-service

**Status:** Suspected (keputusan mekanisme belum final)
**Location:** design/architecture (brief §1, §4.2 COLD arsip S3)
**Scenario:** Arsip COLD ke S3 → service perlu query S3 + simpan referensi; ini berarti API/data path keluar dari MongoDB service-nya, berpotensi lintas-service border, dan menambah jalur I/O download ke memori.
**Expected:** Database-per-service = service hanya baca DB sendiri, app transparan (CLAUDE-be §2). S3 bukan MongoDB → perlu keputusan arsitektur eksplisit & approval.
**Actual / Failure Mode:** Jika diterapkan tanpa pengecualian eksplisit, melanggar rule non-bypassable; risk data exposure/traceability; akses histori terpecah.
**Root Cause:** Brief mengajukan S3 sebagai opsi COLD tanpa arbitrasi terhadap database-per-service (OQ-04).
**Evidence:** CLAUDE-be §2 "No service reads another service's MongoDB"; brief §4.3 & §5 (OQ-04 risk).
**Impact:** Governance breach; kompleksitas akses lintas storage; RTO/obs layanan histori.
**Blast Radius:** conversation & ticket service, compliance/audit.
**Recommendation:** Keputusan eksplisit: (a) COLD tetap di DB service (collection no-index / archived, mongodump file sebagai metadata) → aman DB-per-service; atau (b) S3 dengan dokumen pengecualian + approval Engineering Lead & compliance. Jangan default S3.
**Suggested Test:** Validasi arsitektur review; cek bahwa semua read path memo hanya service-nya sendiri.

---

### F-04 P1 HIGH / RISK — Socket event & write ke thread WARM/COLD tidak ter-re-route; cold dianggap readonly

**Status:** Confirmed (behavioral gap)
**Location:** conversation-service socket handler/gateway (`:3002`), message write path
**Scenario:** Message baru masuk ke conversation >6 bln (sudah WARM/COLD) → repository lookup by conversationId di collection HOT gagal; event tidak meng-update thread/chat-list.
**Expected:** Socket event untuk conversation mana pun memicu update (BR-02) tanpa asumsi cold=readonly.
**Actual / Failure Mode:** Lookup Cuma HOT; socket menyala tapi data tujuan tak ditemukan → no delivery / no state update.
**Root Cause:** Write/read path di hardcode satu collection; tidak ada re-route lintas tier untuk event.
**Evidence:** conversation.repository match on `conversationId`; brief §4.3 socket events any conversation; message schema `conversationId` ref conversation.
**Impact:** Agen kehilangan pesan di thread lama; chat list & detail tidak sinkron; kesulitan diagnosa.
**Blast Radius:** Semua tenant.
**Recommendation:** Lookup layer lintas tier (by conversationId) + idempotent event fan-out; jangan tempatkan data lama di storage yang tidak menerima write.
**Suggested Test:** Kirim message ke conversation 8 bln (fisik di WARM/COLD) → assert deliverable & list update.

---

### F-05 P1 HIGH / DATA INTEGRITY ISSUE — TTL (`expiresAt`) adalah DELETE, bukan archive; mengaktifkannya = data loss

**Status:** Confirmed (schema)
**Location:** conversation.schema.ts `expiresAt` dengan `index: { expireAfterSeconds: 0 }`
**Scenario:** Jika tiering diaktifkan lewat `expiresAt` (OQ-07), dokumen dengan `expiresAt` di masa lalu OTOMATIS dihapus oleh TTL monitor — data hilang permanen, bukan dipindah.
**Expected:** Archive/tiering = memindahkan, bukan menghapus.
**Actual / Failure Mode:** TTL delete menghapus dokumen; histori hilang; compliance risk.
**Root Cause:** Confusion antara ekspor file vs TTL delete; brief menyebut "export S3 / collection tanpa index" tanpa mengecualikan TTL path.
**Evidence:** conversation.schema.ts:455-461 TTL index `expireAfterSeconds: 0`; global-memory:274 `expiresAt: null — retention field exists but not yet active`.
**Impact:** Data loss permanen bila salah aktifkan; regulatory/compliance breach.
**Blast Radius:** Semua tenant conversation.
**Recommendation:** Peringatan keras: tiering ≠ TTL. Jangan aktifkan `expiresAt` untuk tiering; gunakan marker tier terpisah + job migration; TTL hanya bila retention legal menuntut hard delete dan telah disetujui.
**Suggested Test:** Set `expiresAt` ke masa lalu di sandbox → observasi TTL menghapus doc (harus dicegah).

---

### F-06 P1 HIGH / SEARCH / RISK — mongot / Atlas Search index scope vs tier & flag gate ambigu

**Status:** Suspected
**Location:** search (global), `GLOBAL_SEARCH_ATLAS_ENABLED`, `GLOBAL_SEARCH_DEFAULT_WINDOW_MONTHS=3`, `ATLAS_SEARCH.CONVERSATIONS_INDEX`
**Scenario:** Search index (regex/substring dan/atau Atlas Search) di-create per collection. Data pindah WARM/COLD → index tidak menautkannya → pencarian histori lama gagal / window 3 bln tidak konsisten dengan tier.
**Expected:** Search tidak berubah tanpa keputusan terpisah (BR-06).
**Actual / Failure Mode:** Search miss data tier-dingin; atau window vs tier mismatch; globe flag → ops salah.
**Root Cause:** Index scope terikat collection & window flag; tier tidak dipetakan ke index; ada indikasi `ENABLED` gate tidak ada di constant (dead flag).
**Evidence:** `libs/common/.../base.constant.ts:216-219` `ATLAS_SEARCH` hanya `CONVERSATIONS_INDEX` — tidak ada `ENABLED` (audit `_source/...comprehensive-system-audit-master.md:109` mencatat gate code Atlas mungkin selalu truthy/dead); `GLOBAL_SEARCH_DEFAULT_WINDOW_MONTHS=3`.
**Impact:** Search rekap salah; konsistensi antara window & tier.
**Blast Radius:** Semua tenant search.
**Recommendation:** Buat keputusan eksplisit: index scope per tier; sinkronkan window bulan dengan batas tier; cleanup flag gate (dead code) sebelum dijadikan gate.
**Suggested Test:** Pindahkan doc ke WARM → search harus tetap menemukan / atau keputusan eksplisit window.

---

### F-07 P2 MEDIUM / RISK — Runtime migration & rollback data besar tanpa downtime/konkuren update belum didesain

**Status:** Suspected
**Location:** migration/backfill job (tidak ada kode saat ini), feature flag
**Scenario:** Memindahkan jutaan dokumen antar tier while write aktif → race (dokumen diupdate saat/migrasi keluar), downtime, atau rollback tidak mungkin karena data sudah terpecah.
**Expected:** Migrasi aman + rollback plan berdasar pelajaran migrasi Atlas→self-hosted (CLAUDE-be §13/devops LAPORAN-MIGRASI...).
**Actual / Failure Mode:** Kehilangan update / inkonsistensi / tidak ada path balik karena data fisik tersebar.
**Root Cause:** Tidak ada rename/repoint mekanisme; OQ-10 belum dijawab.
**Impact:** Data integrity; RTO.
**Blast Radius:** Semua tenant.
**Recommendation:** Desain job migrasi (backfill, gate state-aware, idempotent), feature flag per tier, rollback drill; jangan mulai migrasi tanpa plan.
**Suggested Test:** Simulasi migrasi dengan concurrent writes; assert count & referensi utuh; rollback drill.

---

### F-08 P2 MEDIUM / DESIGN FLAW — Tidak ada stratifikasi antara "archive" dan "deleted" / definisi hot set

**Status:** Confirmed (available data)
**Location:** Requirement, schema
**Scenario:** Brief tidak mendefinisikan batas HOT/WARM/COLD berbasis evidence (aggressive 3/6/7 bln bertahan) dan tidak membedakan "cold=archivable" vs "cold=read-only vs cold=immutable". Ini menyulitkan verifikasi demand & desain.
**Expected:** Batas tier berdasar data profiling (OQ-01/02) + klasifikasi akses.
**Actual / Failure Mode:** Over/under-provisioning, kesalahan tier, hidden behavior change.
**Root Cause:** Absence of profiling → batas spekulatif.
**Impact:** Desain tidak dapat diverifikasi; kemungkinan re-work.
**Blast Radius:** Semua desain downstream.
**Recommendation:** Profiling data (OQ-01); set tier boundary berdasar evidence; definisikan term "archive" presisi.
**Suggested Test:** Statistik ukuran/akses per bulan → derive tier boundaries.

---

### F-09 P3 LOW / OPERABILITY ISSUE — Observability lintas-tier belum disiapkan (query time, migration progress, event re-route)

**Status:** Suspected
**Location:** Ops/tracing
**Scenario:** Tanpa metrik query lintas-tier / migration job / socket re-route, engineer tidak bisa diagnosa (3am) dari mana request hits (HOT vs WARM/COLD).
**Expected:** Tracing & metrik per-tier; alert migration & SLA breach.
**Actual / Failure Mode:** Diagnosa lambat; path not found mystery.
**Root Cause:** No instrumentasi machine-tier.
**Impact:** Operability.
**Blast Radius:** DevOps.
**Recommendation:** Tambah metrik tier + alert SLA/socket/migration.
**Suggested Test:** Inject span tier; assert telemetry.

---

### F-10 P3 LOW / RISK — Bulk reply & export worker menjangkau tiket umur apa pun; cross-tier batch lookup

**Status:** Confirmed
**Location:** ticket-service bulk worker (`bulk-job`, `bulk_job_rows`), export worker
**Scenario:** Bulk reply FIFO / export berjalan di tiket batch yang bisa berisi dokumen pindah ke WARM/COLD; lookup by id miss jika collection terpisah.
**Expected:** Batch menyentuh seluruh umur; FIFO & export utuh.
**Actual / Failure Mode:** Integer/partial batch; export missing rows.
**Root Cause:** Repository one-collection lookup; tier split.
**Impact:** Bulk ops gagal sebagian; export tidak lengkap.
**Blast Radius:** Ticket service job queue.
**Recommendation:** Batch lookup lintas tier; re-route; idempotent.
**Suggested Test:** Batch berisi tiket 0\~8 bln; assert aksi applied & export lengkap.

---

### ASC-1 P2 MEDIUM / RISK — Flag gate Atlas Search ambigu (dead `ENABLED`) — relevan sebelum jadikan tier gate

**Status:** Suspected (dari audit corpus)
**Location:** `libs/common/.../base.constant.ts` / search repository
**Scenario:** `ATLAS_SEARCH.CONVERSATIONS_INDEX` exist tapi `ENABLED` tidak ditemukan di source → code path Atlas (`buildAtlasSearchPipelineStage`) gate-nya mungkin selalu truthy/dead; `GLOBAL_SEARCH_ATLAS_ENABLED` di-dokumentasi CLAUDE-be tapi tidak di grep di code aktual.
**Expected:** Gate eksplisit & diverifikasi.
**Actual / Failure Mode:** Ops salah menilai search aktif/dark; search path tak terduga.
**Root Cause:** Flag mismatch doc vs code.
**Impact:** Kejutan produksi saat golive tiering (index scope).
**Blast Radius:** Search.
**Recommendation:** Bersihkan/verifikasi gate sebelum tiering menjadikannya kontrol.
**Suggested Test:** Grep `GLOBAL_SEARCH_ATLAS_ENABLED` & `buildAtlasSearchPipelineStage`; tes on/off.

---

## QP — Query Path / Tier Mapping

> Kontrak: **HOT** = wajib read+write real-time (in-memory, full index). **WARM** = boleh read, write harus di-re-route. **COLD** = read via re-hydrasi / arsip; write wajib re-warming (copy-back). Setiap path yang butuh full-timeline atau write harus HOT-Union-aware.

### conversation-service

| # | Query Path (source) | Tier Requirement | Must Stay HOT? | Breaks if COLD=offline/S3? |
|----|--------------------|-------------------|----------------|------------------------------|
| QP-01 | Chat list (status+updatedAt+companyId+RBAC) — `conversation.repository.ts` | HOT default | Yes (working set) | Yes — list miss bila cold; hanya HOT yang muncul |
| QP-02 | Detail conversation by id (bebas umur) | HOT+WARM lookup; COLD rehydrate | Detail hotspot harus HOT | Ya, jika COLD tidak queryable → detail lama tak terbuka |
| QP-03 | Message fetch for a conversation (thread) | Per conversation timestamp | Thread lama boleh WARM (read) | Ya jika COLD immutable & write tak ada |
| QP-04 | Socket message inbound → write message + update conversation latestMessage | HOT/WARM write | Yes — write path hot | Yes — thread lama ke WARM/COLD tidak berfungsi |
| QP-05 | Socket assignment/tag/status mutation → update list | HOT write | Yes | Yes — cold update miss (BR-02) |
| QP-06 | Reopen closed conversation (closed→open) | HOT write + SLA recompute | Yes | Ya — reopen thread lama di cold gagal |
| QP-07 | SLA FRT/TTC real-time (compute from conversation events) | HOT+WARM read | Yes (open cycles) | Ya — read cold untuk cycle lama salah |
| QP-08 | SLA RLT/WaitTime read (`.sla_metrics` by conversationId) | HOT read; WARM bila cycle lain | Yes for active | Ya bila poin laporan mengambil lintas-season |
| QP-09 | Global search (regex window 3m / Atlas seed) | HOT (window) | Yes (window default) | Ya bila index tidak menjangkau tier |
| QP-10 | CSAT retrieval | HOT/WARM | Hot-ish | Bisa WARM read; COLD rehydrate utk audit |
| QP-11 | Transcript delivery / export | HOT read | Yes | Ya, export lintas umur |
| QP-12 | Note/template read | HOT | Yes | Ya bila dipindahkan |

### ticket-service

| # | Query Path (source) | Tier Requirement | Must Stay HOT? | Breaks if COLD=offline/S3? |
|----|--------------------|-------------------|----------------|------------------------------|
| QP-13 | Ticket list views (RBAC scoped, all semantics) | HOT | Yes (working set) | Ya → list miss |
| QP-14 | Ticket detail by id | HOT/WARM + COLD rehydrate | Hot for recent | Ya bila COLD off |
| QP-15 | Per-stage SLA state machine (progress/breach) | HOT+WARM read | Yes active | Ya bila stage moved |
| QP-16 | Ticket KPI strip (all/inProgress/needs/new/overSla/snoozed/solved) — no age filter | **All tiers** (whole timeline) | Must span all | **Ya — krn aggregate satu collection** |
| QP-17 | "Lewat SLA" / over-sla aggregation | All tiers | Yes | Ya |
| QP-18 | Export full XLSX (no age filter) | All tiers | Span all | Ya — missing rows |
| QP-19 | Bulk reply FIFO worker (any age) | All tiers write | Yes | Ya — lookup miss |
| QP-20 | Snooze wake sweep (`snoozedUntil`) | HOT+WARM | Yes | Ya — snooze beku |
| QP-21 | SLA cron scan (`findTicketsForSlaEvaluation`) | HOT+WARM | Yes | Ya — scan miss |
| QP-22 | Create / reopen ticket (new cycleId) | HOT write | Yes | Baik |
| QP-23 | Ticket type / template / settings | HOT | Yes | Baik |

### cross-domain (snapshot link & RBAC)

| # | Query Path (source) | Tier Requirement | Must Stay HOT? | Breaks if COLD=offline/S3? |
|----|--------------------|-------------------|----------------|------------------------------|
| QP-24 | Linked conversation↔ticket snapshot/link sync — linked-conversation di ticket detail (snapshot denormalized cross-DB, no cross-DB read; protected brief §4.3) | Konsisten lintas semua tier (HOT+WARM write refresh; COLD re-warm sebelum update) | No — harus tetap konsisten lintas tier | Ya — entitas ter-link yang pindah ke COLD tidak ter-refresh → link bubble basi/putus (denormalized divergence) |
| QP-25 | Per-tier RBAC/visibility filter re-application — tiap query rewriter yang baca WARM/COLD wajib re-apply scope companyId+organizationId+RBAC identik dengan HOT (BR-08) | Konsisten lintas semua tier (read path semua tier) | No — harus tetap konsisten lintas tier | Ya — filter/RBAC re-check ter-skip di tier dingin → cross-tenant exposure atau data tak terlihat |

**Summary of query-path impact:**
- 17 mapped paths (QP-01, QP-04..QP-09, QP-11..QP-13, QP-15, QP-17, QP-19..QP-23) MUST retain HOT read/write semantics.
- 4 paths (QP-02, QP-03, QP-10, QP-14) can tolerate WARM latency but need COLD re-hydration if archived.
- **Every aggregation/export/worker path (QP-16..QP-18) plus cross-tier-consistency paths (QP-24..QP-25) requires spanning ALL tiers consistently** — the highest-risk cluster; fails under naive one-collection split or S3-only COLD.
- None of the paths can tolerate COLD being fully offline-only/S3 with no re-hydration gate, because detail (QP-02), socket (QP-04/05), reopen (QP-06), KPI/export (QP-16/18), snapshot sync (QP-24), and RBAC re-application (QP-25) all read/write cross-age.

---

## Open Questions (executive, carry-forward)

- All OQ-01..OQ-10 remain **blocking & unanswered** (see §10). Decision `HOLD_FEATURE` (routing `SPLIT_A`) contingent on them — HOLD bertahan sampai SPLIT_A menyediakan evidence & keputusan mekanisme.
- Architectural decision: COLD in-MongoDB (no-index / archived collection) vs S3 (requires non-bypassable rule exception) — must be decided & approved before PRD.

---

## Recommendation / Next Action

- **Earliest Safe Next Step:** Run discovery **`SPLIT_A`** (data profiling OQ-01/02 + demand confirmation OQ-08 + scope lock OQ-09 + keputusan mekanisme COLD OQ-03/04/05) — lihat §2.1 (brief Routing §6: `HOLD_NEEDS_DISCOVERY`).
- **Do NOT** start PRD Conversation/Ticket patch until the 10 OQ are resolved (decision: `HOLD_FEATURE`).
- Produce a **mechanism decision memo** (OQ-03/04/05) with evidence from profiling; then re-run this assessment to lift/confirm the HOLD (→ `PROCEED_WITH_CAUTION` / `REVISE_PRD` saat PRD sudah ada, atau tetap `HOLD_FEATURE` / `SPLIT_FEATURE`).
- Leverage past migration lessons (Atlas→self-hosted) for migration/rollback (OQ-10).

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-09-08 | Initial assessment created (discovery/technical review of MongoDB Hot/Warm/Cold tiering impact) | Analyst |
| 2026-09-08 | v1.1 revision (reviewer verdict revise_analysis): decision `REVISE_PRD` → `HOLD_FEATURE` + routing eksplisit `SPLIT_A`; dangling finding IDs (SLA/SNOOZE/AGG/SR/COLD/DATA labels) direkonsiliasi ke F-01..F-10/ASC-1; QP-24 (snapshot sync) & QP-25 (RBAC per-tier) ditambahkan; evidence-grounding & test status dipertahankan | Analyst |