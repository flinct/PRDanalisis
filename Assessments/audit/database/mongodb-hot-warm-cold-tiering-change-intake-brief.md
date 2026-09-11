# Change Intake Brief: MongoDB Hot/Warm/Cold Storage Tiering

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Proposed architecture change dari orchestrator context (MongoDB topology redesign), belum ada BRD formal
> **Artifact Path:** `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/mongodb-hot-warm-cold-tiering-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/task-router.md`, `Rules/profiles/satuinbox.yml`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `WORKFLOW_CONTEXT.md`
> **Tanggal Intake:** 2026-09-08
> **Status:** Draft

---

## 0. Ringkasan Update Brief

- Initial version — Phase 0 intake untuk perubahan topology MongoDB dari single-replicaset (`rs0`, 3-node, database-per-service) menjadi model **Hot/Warm/Cold storage tiering**.
- Scope fokus: dampak ke **conversation-service** (`satuinbox_conversation`) dan **ticket-service** (`satuinbox_ticket`). Service MongoDB lain dan sidecar `mongot` (Atlas Search) terdampak hanya jika keputusan topology bersifat global — ditandai sebagai asumsi/flag.
- Routing decision: `HOLD_NEEDS_DISCOVERY` — sejumlah pertanyaan blocking (semantik akses lintas-tier, strategi query-by-age, kontrak database-per-service vs S3) belum terjawab sebelum PRD / Assessment Report teknis layak dimulai.

---

## 1. Request Snapshot

**Request Summary:**
Mengganti topology MongoDB saat ini — satu replica set `rs0` (3 pod: mongodb-0 PRIMARY, mongodb-1/mongodb-2 SECONDARY; MongoDB 8.0.20 Community, WiredTiger, WT cache 9GiB, EBS gp3 200GiB data + 50GiB mongot-data per pod, sidecar `mongot` Atlas Search self-hosted) — dengan model penyimpanan bertingkat berdasarkan umur data:
- **HOT:** data 0–3 bulan — collection saat ini, full index, in-memory.
- **WARM:** data 4–6 bulan — collection terpisah/partitioned, partial index.
- **COLD:** data ≥7 bulan — arsip (export S3 atau collection tanpa index).

Berlaku primer untuk data yang dimiliki `conversation-service` dan `ticket-service`.

**Business Problem:**
Pertumbuhan data retensi penuh pada satu set collection (`conversations`, `messages`, `tickets`, `stages`, SLA metrics) di 3 node yang sama menaikkan footprint storage (EBS 200GiB/pod), tekanan WiredTiger cache 9GiB, dan biaya infra. Query terhadap data lama menurunkan performa segmen data hangat (hot working set kalah dari data dingin). Tiering bertujuan memisahkan beban panas/dingin tanpa kehilangan akses ke histori.

**Target User / Role / Stakeholder:**
- **Internal:** Agent & Supervisor CS (akses histori conversation/ticket lintas umur), Tech Lead / BE (owner infra MongoDB), Engineering Lead (Naftal Yunior).
- **Teknis:** conversation-service, ticket-service, dan operasional Mongo cluster.

**Expected Outcome:**
Working set HOT yang stabil dan cepat, data lama (WARM/COLD) tetap bisa diakses untuk detail/history/search/report/export, footprint storage & biaya EBS terkendali — TANPA mengubah perilaku user-facing (list, detail, SLA, socket, search, KPI, export).

**Urgency / Why Now:**
Infra driver (kapasitas/biaya/performa). Bukan L3/L4 workflow blocker user — demand screen `change-management.md`: L0/L1 signal, belum ada evidence operasional bahwa perf degradasi sudah memblokir kerja agent. Perlu konfirmasi demand sebelum PRD penuh.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `BEHAVIOR_CHANGE` (topology/penyimpanan data; komposit — menyentuh lifecycle data, storage, query path, search, reporting) |
| Primary Domain | `Cross-domain` (infra MongoDB; primer Conversation + Ticket) |
| Request Shape | Change (topology storage) — berpotensi Add (collection baru WARM/COLD, migration/archive job) |
| Initial Complexity Signal | Critical |
| Needs Split? | Yes (discovery infra ≠ PRD behavior per domain; lihat §6) |

### Classification Rationale
- Bukan fitur baru user-facing murni; mengubah **di mana dan bagaimana data persisten diakses** untuk dua domain inti sekaligus.
- Menyentuh shared infra (satu cluster rs0 melayani banyak service) + lifecycle data + SLA + search + reporting/export → memenuhi kriteria `impact_analysis_shared` dan `governance: lane governed` (semua product behavior change di SatuInbox = governed, non-bypassable).
- Tidak ada PRD/requirement formal yang menspesifikasikan tiering → status demand belum terverifikasi.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | Tidak ada PRD untuk storage tiering / data retention / archive. Conversation V2 & Ticket V2 tidak menyebut tiering |
| PRD status | Not found |
| PRD treatment candidate | Assessment Report teknis (infra/discovery) → kemungkinan Patch PRD (NFR/retention) per domain bila behavior berubah |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Shipped, unaware of tiering | FE query via gateway; tidak baca MongoDB langsung |
| BE | Shipped — single rs0, database-per-service | `Memory/CLAUDE-be.md`: MongoDB 8.0.x via Mongoose `^8.x`, satu database per service; conversation-service pool terbesar (max 20); infra defaults MongoDB `localhost:27018` |
| Runtime / Current Behavior | rs0 3 pod, WT cache 9GiB, EBS gp3 200GiB data + 50GiB mongot-data; sidecar mongot Atlas Search tiap pod; services: mongodb (headless), mongodb-svc (ClusterIP), mongodb-search-svc (ClusterIP), mongodb-nlb (NLB). `GLOBAL_SEARCH_ATLAS_ENABLED=false` (regex/substring path aktif, Atlas Search dark), `GLOBAL_SEARCH_DEFAULT_WINDOW_MONTHS=3`. Database-per-service: tidak ada service baca DB service lain (data lintas-service lewat gRPC atau snapshot denormalized via event). FRT/TTC computed real-time/service-side; RLT + Wait Time persisted di `conversation_sla_metrics`. | Architecture context (diberikan orchestrator, diverifikasi konsisten dgn `Memory/CLAUDE-be.md`) |

### 3.3 Related Sources
- `Memory/global-memory.md`: canonical rules Conversation/Ticket (chat list query by status+updatedAt, SLA real-time, snooze sebagai state, KPI strip, export tanpa age filter, reopen SLA cycleId, Related Tickets & Merge undeveloped).
- `Memory/CLAUDE-be.md`: arsitektur BE, database-per-service, feature flags search, laporan migrasi Atlas → self-hosted (`devops/LAPORAN-MIGRASI-ATLAS-TO-SELFHOSTED-15-APRIL-2026.md`) — konteks penting: sudah pernah ada migrasi storage besar; tiering harus dievaluasi terhadap pelajaran migrasi tsb.
- `WORKFLOW_CONTEXT.md`: alur Phase 0 → Assessment Report → Reviewer Gates.

---

## 4. Scope Boundary

### 4.1 In Scope
- Evaluasi dampak tiering pada **conversation-service** (`satuinbox_conversation`: conversations, messages, notes, templates, SLA/FRT/TTC, CSAT, transcripts) dan **ticket-service** (`satuinbox_ticket`: tickets, stages, per-stage SLA state machine, snooze, bulk reply, exports).
- Pemetaan akses data existing ke model HOT/WARM/COLD: chat list (status+updatedAt+RBAC), detail conversation lintas umur, socket events untuk conversation lama, SLA (real-time, RLT/WaitTime persisted), global search (window 3 bulan, regex path aktif), ticket SLA cycleId (reopen), snooze lintas bulan, bulk reply FIFO async, KPI strip agregat seluruh umur, export full tanpa age filter.
- Pertanyaan arsitektur: mekanisme pemisahan (collection terpisah vs partition), partial index WARM, arsip COLD (S3 vs no-index collection), policy perpindahan tier (TTL/backfill job), dan implikasi terhadap aturan database-per-service.
- Impact flags: shared entity/lifecycle, SLA, search, reporting/export, migration/rollback/feature flag, regression scope.

### 4.2 Out of Scope
- Implementasi / perubahan kode service mana pun (belum — fase discovery).
- Desain final mekanisme COLD (S3 export format, lifecycle S3) — butuh discovery terpisah.
- Perubahan topology untuk database service lain di luar conversation/ticket (perlu re-confirm apakah tiering bersifat global rs0 atau per-DB).
- Perubahan UX/FE (kecuali discovery menemukan kebutuhan baru yang wajib di-PRD-kan).
- Perubahan semantik SLA metric (FRT/TTC/RLT/Wait Time) — non-goal; tiering tidak boleh mengubah formula.

### 4.3 Protected Existing Behavior
- **Database-per-service rule (non-bypassable):** tidak ada service yang membaca MongoDB service lain secara langsung. Tiering/archive COLD tidak boleh memaksa cross-DB read (termasuk via S3) tanpa keputusan arsitektur eksplisit.
- Detail conversation/ticket: **conversation lama (≥7 bulan) tetap bisa dibuka agent** — histori tidak boleh hilang atau latency tak terkendali.
- Socket events bisa datang untuk conversation **mana pun** (message baru di thread lama) → pesan masuk ke data COLD/WARM harus tetap memicu update state/list tanpa asumsi "cold = readonly mati".
- SLA: RLT/WaitTime di `conversation_sla_metrics` + per-stage SLA ticket (`slaState.cycleId`) harus tetap akurat untuk **reopen & SLA continuation** — data SLA lama tidak boleh ter-archive sebelum siklus selesai.
- Ticket snooze state lintas bulan; ticket yang snoozed berbulan-bulan tidak boleh kehilangan state saat pindah tier.
- KPI strip & queue views: agregasi **seluruh tiket tanpa filter umur** (Semua tiket, Lewat SLA, Selesai, Snoozed) harus tetap konsisten.
- Export full XLSX semua tiket tanpa age filter harus tetap berfungsi.
- Global search behavior saat ini (regex/substring, window default 3 bulan) tidak boleh berubah tanpa keputusan terpisah — terlebih `GLOBAL_SEARCH_ATLAS_ENABLED=false` dan mongot sudah jalan di tiap pod.
- Hubungan conversation↔ticket (linked bubble, denormalized snapshot) tidak boleh putus oleh perbedaan tier data.
- SLA engine & reminder/delayed-queue (RabbitMQ) yang membaca data SLA tidak boleh kehilangan data yang di-pindah.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Conversation/ticket lifecycle kini punya dimensi tier; state (open/closed/snoozed/SLA cycle) melintasi tier boundary |
| RBAC / visibility / assignment | Yes (indirect) | Chat list & ticket views scoped RBAC + filter; query lintas tier harus menghormati scope visibility yang sama; risiko data "tidak terlihat" jika query miss tier |
| API / webhook / socket / queue / cron | Yes | Socket events untuk data lama; bulk reply FIFO job lintas umur; archive/backfill job baru; gateway tidak boleh berubah kontrak |
| SLA / reporting / export | Yes | KPI agregat semua umur; export full; SLA reopen cycleId; RLT/WaitTime persistence |
| Migration / rollback / feature flag | Yes | Perpindahan data antar tier = migrasi data besar + berisiko; wajib feature flag & rollback plan (pelajaran migrasi Atlas→self-hosted) |
| Existing regression scope | Yes | Chat list, room/detail history, global search, KPI, export, SLA engine, socket delivery, bulk reply — di dua service |

### Early Blast-Radius Notes
- Risiko terbesar = **read-path split brain**: query yang tidak tahu tier (mis. membuka conversation 8 bulan lalu, socket event ke thread lama, reopen tiket yang SLA cycle-nya mulai 5 bulan lalu) gagal/lemot jika data sudah dipindah.
- Data yang dipindah ke tier dingin tapi masih dirujuk oleh state aktif (snoozed ticket, conversation open lama, cycleId SLA belum selesai) = inkonsistensi state machine — aturan perpindahan harus berbasis **state + umur**, bukan umur saja.
- Setiap arsitektur COLD di luar MongoDB (S3) berpotensi melanggar database-per-service dan menambah jalur I/O baru (download ke memori) — keputusan ini wajib eksplisit.
- MongoDB Community (8.0.20) tanpa fitur enterprise (ttl-expressions terbatas, tanpa time-series tiered storage resmi) → partial index/partitioning manual + job migrasi; validasi versi Community mendukung strategi yang dipilih.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `HOLD_NEEDS_DISCOVERY` (potensi `SPLIT_REQUEST` setelah discovery) |
| Recommended Next Rules | `Rules/core/analysis-and-risk.md` (blast radius/impact — wajib untuk shared lifecycle/SLA/contract), lalu `Rules/core/requirements.md` bila PRD patch dibutuhkan |
| Recommended Next Artifact | Discovery/Assessment Report teknis di `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/` → lalu kemungkinan patch PRD Conversation/Ticket (NFR retention) |
| Can Proceed to PRD? | No — blocking questions §7 belum terjawab |

### Routing Rationale
- **HOLD:** belum bisa ke PRD. Tidak ada bukti demand user (L0/L1) dan belum ada verifikasi pola akses data aktual (distribusi umur data, ukuran per collection, query aktual terhadap data >3 bulan). Keputusan tiering tanpa data ini spekulatif.
- **Split setelah discovery:**
  - **Split A (infra/discovery):** profiling data (ukuran/umur/akses), pemilihan mekanisme (partition vs collection terpisah vs archive), design archive COLD, policy pindah tier, feature flag, rollback. Output = Assessment Report teknis.
  - **Split B (PRD per domain):** hanya jika discovery membuktikan perubahan perilaku user-facing (mis. detail lama perlu loading state, search window berubah, KPI/export perlu strategi baru) → patch PRD Conversation V2 / Ticket V2 dengan NFR/retention.
- Blast radius menyentuh dua domain + shared infra → Assessment Report wajib sebelum PRD patch.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Distribusi data aktual: ukuran & jumlah dokumen per collection (conversations, messages, tickets, stages, sla_metrics) per bulan? Berapa % data >3 bulan / >6 bulan? | Menentukan apakah tiering benar-benar menyelesaikan masalah storage/perf; validasi asumsi demand | Yes | BE / Tech Lead (discovery) |
| OQ-02 | Pola akses data lama saat ini: seberapa sering query menyentuh data >3 bulan (detail lama, socket ke thread lama, export, search window, KPI)? | Menentukan tier mana yang harus tetap queryable real-time vs acceptable latency/archive | Yes | BE / Tech Lead |
| OQ-03 | Mekanisme tiering mana yang dipilih (collection terpisah + partial index, partition, archive S3, no-index collection)? Kompatibel dengan MongoDB 8.0.20 **Community**? | Feasibility teknis; Community edition tidak punya fitur tiering enterprise | Yes | BE / Tech Lead |
| OQ-04 | Bagaimana read-path lintas tier bekerja TANPA melanggar database-per-service? Siapa yang melakukan query join/agregasi lintas tier (HOT+WARM+COLD)? | KPI agregat & export full butuh seluruh umur; S3 bukan MongoDB → aturan "no cross-DB read" berpotensi dilanggar | Yes | BE / Tech Lead / Engineering Lead |
| OQ-05 | Policy pindah tier: apakah perpindahan berbasis umur saja, atau mempertimbangkan state (conversation open, ticket snoozed, SLA cycleId belum selesai)? Bagaimana update (socket event, balasan baru) ke data yang sudah di COLD? | Data stateful yang dipindah prematur merusak state machine SLA/snooze/reopen | Yes | BE / PM |
| OQ-06 | Dampak ke global search: search window default 3 bulan (flag `GLOBAL_SEARCH_ATLAS_ENABLED=false`, regex path) — apakah search harus menjangkau WARM/COLD? Bagaimana mongot berinteraksi dengan tier? | Search lintas tier menentukan desain index & mongot sync | Yes | BE / PM |
| OQ-07 | Retention & compliance: apakah ada kewajiban simpan data >X tahun, atau boleh archive/delete? Ada `expiresAt` field di conversation (belum aktif) — apakah tiering mengaktifkannya? | Menentukan batas COLD dan apakah data pernah dihapus; berdampak legal/ops | Yes | PM / Stakeholder |
| OQ-08 | Demand level: evidence user/cost issue apa yang memicu proposal ini? (storage cap tercapai? perf breach terukur? biaya EBS?) | Demand screen: L0-L2 tidak boleh memicu PRD penuh tanpa konfirmasi | Yes | PM |
| OQ-09 | Scope topology: tiering berlaku untuk rs0 global (semua service DB) atau hanya conversation & ticket DB? | Menentukan apakah service lain (people, whatsapp, dll) ikut dalam Assessment | Yes | Engineering Lead |
| OQ-10 | Migration mechanics & rollback: bagaimana data dipindah antar tier tanpa downtime & tanpa kehilangan update konkuren (socket/balasan selama migrasi)? Feature flag mana? | Migrasi data besar = risiko tertinggi; pelajaran migrasi Atlas→self-hosted harus dipakai | Yes | BE / Tech Lead |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst (Dany Christian) | Scope lock + demand confirmation | Pending | jawab OQ-08 |
| Stakeholder / Business User | Konfirmasi kebutuhan retention & cost driver | Pending | OQ-01, OQ-07 |
| BE / Tech Lead (Naftal Yunior) | Sanity check arah teknis + discovery (OQ-01..06, OQ-09..10) | Pending | discovery gate |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| Assessment Report (discovery) | `Assessments/cross-domain/mongodb-hot-warm-cold-tiering/` | source scope, protected behavior, impact flags, routing rationale |
| PRD Conversation V2 / Ticket V2 (patch) | `PRD/Conversationv2/`, `PRD/ticketv2/` | hanya bila discovery membuktikan perubahan behavior user-facing |
| QA Pre-Implementation Review | TBD | protected behavior (detail lama, socket, SLA reopen, snooze, KPI, export, search) |
| QA Post-Implementation Validation | TBD | validasi: no data loss lintas tier, no behavior change user-facing, rollback ok |
| Automation Mapping / Test Spec | TBD | traceability dan non-scope guard |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-09-08 | Initial brief created (Phase 0 intake MongoDB Hot/Warm/Cold tiering) | Dany Christian |
