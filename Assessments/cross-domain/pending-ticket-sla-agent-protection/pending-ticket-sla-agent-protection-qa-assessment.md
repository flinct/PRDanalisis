# Assessment Report: Pending Ticket & Conversation SLA Protection untuk Performa Agent

> **Assessment Type:** Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** User request — perbandingan 3 pola industri (Salesforce, Zendesk, Freshdesk) untuk menangani SLA dari Pending/Bottleneck Ticket **dan Conversation** agar tidak merugikan performa Agent. Scope perluasan: user meng-clarifikasi bahwa mekanisme ini **tidak hanya berlaku untuk Ticket, Conversation juga harus ada**.
> **Source Change Intake Brief:** `not-applicable` — request masih berupa perbandingan opsi, belum ada Change Intake Brief formal
> **Assessment Artifact Path:** `Assessments/cross-domain/pending-ticket-sla-agent-protection/pending-ticket-sla-agent-protection-qa-assessment.md`
> **Version:** `v1.1`
> **Previous Version:** `v1.0 — Assessments/cross-domain/pending-ticket-sla-agent-protection/versions/pending-ticket-sla-agent-protection-qa-assessment-v1.0.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Assessments/reference/sla-conversation-ticket.md`, `Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md`, `PRD/SLA conversation n ticket/PRD Ticket - SLA ticket.md`, `PRD/SLA conversation n ticket/PRD Conversation SLA.md`, `PRD/Conversationv2/PRD Ticket - Conversation Snooze (Conversation List).md`, `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Conversation Room.md`, `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Conversation Ownership Decoupling (Team Inbox x Channel Numbers).md`
> **Tanggal Analisa:** 2026-08-19
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Initial version. Draft rekomendasi analisa, **bukan approval resmi** — belum ada Change Intake Brief karena request masih tahap perbandingan opsi, belum jadi requirement yang di-lock.
- v1.0 revisi minor pasca-review: perbaiki atribusi audit-log Section 9 (FR-070–072 milik `PRD Conversation SLA.md`, bukan Ownership Decoupling — sebelumnya salah dikutip), tambah catatan risk gaming untuk Opsi 3 di Section 7.2. Verdict Reviewer: **PASS with minor notes**.
- **v1.1** — Perluasan scope: user clarify mekanisme ini **tidak hanya Ticket, Conversation juga harus ada**. Dampak utama: Conversation **sudah punya** Hold (klaim pause SLA) dan Snooze (eksplisit "No SLA pause changes") yang bentrok — jadi problem di Conversation lebih tentang **resolve existing ambiguity + tambah layer exclude-from-scoring**, bukan bikin dari nol. Section yang berubah: 1 (Overview), 2 (Decision — both domains), 4 (Current State — Conversation detail), 5 (Impact — Conversation SLA engine/module), 6 (Dependency — ConversationSLAMetrics), 10 (OQ-03 terjawab), 11 (Recommendation — Phase 1 sekarang both domains), 12 (Traceability — REQ per domain).

---

## 1. Overview

**Feature / Issue:** Pilih pola implementasi SLA agar Pending/Bottleneck **Ticket dan Conversation** tidak merugikan performa Agent (breach dianggap kesalahan agent padahal tiket/percakapan sedang menunggu pihak lain).

**Objective:** Bandingkan 3 pola industri (Salesforce/Zendesk/Freshdesk) dan rekomendasikan mana yang paling cocok untuk SatuInbox, dengan mempertimbangkan arsitektur SLA yang sudah ada **di kedua domain** dan konflik yang sudah terbuka (Hold vs Snooze vs SLA di Conversation domain).

**Business Context:** SatuInbox sudah punya SLA Engine untuk Conversation (per-channel) dan Ticket (per-type + stage). Kedua domain sudah punya mekanisme "agent tidak available/menunggu" tapi belum konsisten — ini exactly problem yang diminta user untuk diselesaikan lewat 3 opsi tsb.

**Change Class / Routing Decision from Brief:** N/A (belum ada brief). Berdasarkan isi, ini akan jadi **REQUIREMENT LIFECYCLE** lane (mengubah/menambah behavior SLA existing) begitu user memutuskan opsi.

**Protected Existing Behavior from Brief:** N/A.

**Scope In:**
- Perbandingan 3 opsi vs kondisi existing SatuInbox **di kedua domain (Ticket + Conversation)** — termasuk Ticket SLA (per-type + stage), Conversation SLA (per-channel), Hold, Snooze, Waiting on Customer, AUX policy, Ownership Decoupling/Move.
- Rekomendasi opsi/kombinasi + fase implementasi **untuk kedua domain sekaligus**.

**Scope Out:**
- Implementasi teknis detail (nama field, endpoint gRPC final).
- Keputusan final PM — output ini draft rekomendasi untuk didiskusikan, bukan sign-off.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Rekomendasi: **Opsi 1 (Status Khusus/On Hold, exclude dari scoring agent) sebagai fondasi, dikombinasikan dengan Opsi 3 (Queue Transfer) untuk kasus bottleneck yang genuinely bukan tanggung jawab agent lagi**. Opsi 2 (SLA Pause murni) **tidak direkomendasikan berdiri sendiri** karena resiko gaming tinggi dan bentrok langsung dengan konflik Hold/Snooze yang sudah ada dan belum di-lock. Scope mencakup **kedua domain: Ticket dan Conversation**. Boleh lanjut ke PRD formal, tapi **wajib** menyelesaikan 3-way conflict Hold/Snooze/SLA dulu sebagai prasyarat — kalau tidak, opsi baru manapun cuma menambah ambiguitas ke-4.

### 2.2 Required Actions Before Development

- [ ] Lock 3-way conflict Hold vs Snooze vs SLA pause (siapa pause apa, kapan) — PM/Engineering decision, sudah jadi open risk lama di global memory.
- [ ] Definisikan kriteria eksplisit "Pending" (Ticket **dan** Conversation) mana yang eligible exclude-dari-scoring vs yang harus tetap dihitung breach (definisi bottleneck: Waiting on Customer? Waiting on 3rd-party/internal team? Waiting on approval? Conversation yang sudah Hold?).
- [ ] Definisikan governance/approval untuk siapa yang boleh set status Pending (mencegah gaming oleh Agent sendiri) — idealnya butuh approval Supervisor atau restricted ke kondisi sistem-detected (mis. auto saat ticket di-assign ke pihak eksternal, atau conversation Hold oleh Supervisor).
- [ ] Tentukan apakah exclude-from-scoring butuh field terpisah dari SLA pause state (karena kedua konsep beda: satu soal breach-detection, satu soal agent-performance-attribution) — field ini harus konsisten di **kedua domain** (`ConversationSLAMetrics` dan Ticket SLA cycle).

### 2.3 Key Blocking Reasons / Conditions

- 3-way conflict Hold/Snooze/SLA belum resolved — decision policy final untuk pause behavior harus ada duluan sebelum extend ke Ticket **dan** Conversation domain.
- Belum ada definisi "siapa yang bisa trigger status pending" — risk gaming kalau agent bebas set sendiri **di kedua domain**.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Medium (opsi 1) — High (kalau ditambah opsi 3 queue infrastructure baru)
- **Risk Level:** Medium — High (kalau tidak resolve conflict existing dulu)
- **Primary Impact Areas:** SLA Engine (BE, kedua domain), Agent Performance/Statistic dashboard (kedua domain), Ticket Detail UI **+ Conversation Room UI** (pending indicator perlu di kedua tempat), RBAC (siapa boleh set status), Reporting/Analytics

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Ticket SLA sudah pause otomatis saat "Waiting on Customer" (FRT+TTC+stage sekaligus, toggle default enabled) | `PRD Ticket - SLA ticket.md` FR-008, FR-017 |
| BR-02 | Conversation SLA hanya pause TTC saat Waiting on Customer, FRT tetap jalan | `PRD Conversation SLA.md` FR-012 |
| BR-03 | Conversation Room mengklaim "Hold pauses SLA, Resume restores" — belum sinkron dengan Snooze | Global memory, Room v1.1 |
| BR-04 | Conversation Snooze eksplisit "No SLA pause changes" | `PRD Ticket - Conversation Snooze.md` Limitations |
| BR-05 | Move-to-Team (Ownership Decoupling) membuat SLA **stop** (bukan pause) dan assignee reset Unassigned | `PRD ... Ownership Decoupling.md` FR-006, FR-015 |
| BR-06 | Ticket View Scope sudah punya enum queue (`queue_team`, `queue_unassigned`) sebagai VIEW, bukan sebagai mekanisme keluar-dari-SLA-agent | Global memory Ticket View Scope |

### 3.2 Acceptance Criteria

- Analisa harus menjelaskan overlap eksplisit tiap opsi terhadap BR-01 s/d BR-06 di atas (lihat Section 6).

### 3.3 Assumptions

- "Performa Agent" merujuk ke metric SLA breach attribution yang dipakai untuk scoring/statistic agent (mis. breach count, FRT/TTC compliance rate) — bukan hanya tampilan UI semata.
- Existing `pausedIntervals` / `totalPausedMs` field di `ConversationSLAMetrics` dianggap pattern reusable untuk pause-state tracking di semua opsi.

### 3.4 Clarifications Needed

- ~~Apakah "Pending Ticket" yang dimaksud user murni Ticket domain, atau juga berlaku ke Conversation?~~ → **CLARIFIED (v1.1):** User meng-clarifikasi bahwa mekanisme ini **tidak hanya berlaku untuk Ticket, Conversation juga harus ada**. Scope sekarang mencakup kedua domain. Perbedaan kritis: Conversation **sudah punya** Hold (klaim pause SLA) dan Snooze (eksplisit no SLA pause) yang bentrok — di Conversation, "exclude from scoring" layer ditambahkan di atas mekanisme existing yang ambigu, bukan bikin state baru dari nol.

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

| Domain | Mekanisme "Agent tidak salah" saat ini | Efek ke SLA | Efek ke Performance Metric |
|---|---|---|---|
| Ticket | Waiting on Customer (toggle) | Pause FRT+TTC+stage | Tidak eksplisit dikecualikan dari scoring — hanya pause, breach count tetap bergantung ke total elapsed non-paused time |
| Conversation | Waiting on Customer | Pause TTC only, FRT tetap jalan | Sama, tidak eksplisit exclude dari agent scoring |
| Conversation | Hold (Room) | Klaim pause SLA (belum lock) | Tidak didefinisikan |
| Conversation | Snooze | Eksplisit TIDAK pause SLA | Tidak didefinisikan, malah berpotensi tetap breach walau disembunyikan dari list |
| Conversation | Move to Team (Ownership Decoupling) | SLA **stop**, assignee reset | Assignee lama otomatis lepas tanggung jawab (mirip opsi 3) |

**Gap:** Tidak ada satupun existing mechanism yang secara eksplisit **exclude dari agent performance scoring** sambil **tetap menghitung durasi bottleneck** — ini berlaku untuk **kedua domain**: Ticket **dan** Conversation. Di Conversation, Hold **seharusnya** bisa jadi mekanisme ini, tapi policy-nya belum di-lock (3-way conflict). Di Ticket, "Waiting on Customer" sudah pause SLA tapi belum tentu berarti exclude dari agent scoring.

### 4.2 Proposed State (To-Be)

Lihat Section 6 (Head-to-Head) dan Section 11 (Rekomendasi).

### 4.3 State Transition / Data Flow Notes

- Opsi 1 & 2 keduanya menambah state pada SLA cycle (mis. `pendingState: { reason, setBy, setAt, excludedFromScoring }`) — field ini harus konsisten di **kedua domain**: `conversation_sla_metrics` collection (Conversation) dan Ticket SLA cycle document. Tidak mengubah status ticket/conversation utama (`open`/`close`) — sejalan dengan prinsip existing "Snooze is a state, not a status change" (global memory Ticket Status Model).
- Opsi 3 mengubah **ownership** (assignee) dan kemungkinan **team/queue** — blast radius lebih besar karena menyentuh assignment flow (regression-sensitive area per global memory). Di Conversation, ini langsung map ke Move-to-Team existing. Di Ticket, butuh entity Queue baru.

---

## 5. Impact Analysis

| Dimension | Opsi 1 (Status Khusus, exclude scoring) | Opsi 2 (SLA Pause) | Opsi 3 (Queue Transfer) | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------|--------------------|
| Module | SLA Engine (metadata tambahan), Agent Statistic/Dashboard (filter exclude) | SLA Engine (pause logic — sudah ada infra `pausedIntervals`) | SLA Engine + Assignment/Queue service + Round Robin (belum ada PRD) | HIGH untuk Opsi 3 (nyentuh 3 module berbeda), MEDIUM utk Opsi 1 & 2 | Opsi 3 butuh definisi Queue baru dulu |
| Database | Tambah field `pendingReason`, `excludedFromScoring`, `pendingSetBy/At` di ticket SLA cycle | Reuse pattern `pausedIntervals`/`totalPausedMs` (sudah ada precedent di Conversation, tinggal port ke Ticket) | Tambah `queueId` khusus + histori transfer + reset assignee | LOW (Opsi 1&2, karena ada precedent), MEDIUM (Opsi 3, entity baru Queue) | Tidak perlu migrasi besar untuk 1 & 2 |
| API | Endpoint baru: set/unset pending state, filter agent stats by exclude flag | Reuse pause/resume SLA endpoint pattern existing | Endpoint baru: transfer-to-queue, queue re-entry/round-robin pull | MEDIUM | Opsi 3 kemungkinan breaking terhadap `TicketViewEnum` existing (perlu enum baru: `queue_pending_bottleneck` atau serupa) |
| UI/UX | Badge "Pending" di Ticket Detail/List (mirip Hold indicator existing), toggle reason dropdown | Countdown SLA menampilkan "Paused" state — sudah ada pattern SLA badge existing | Ticket hilang dari Dashboard Agent, muncul di Queue View baru — perlu UI Queue Khusus | MEDIUM — HIGH (Opsi 3 butuh UI baru) | Opsi 1 paling ringan reuse Hold indicator pattern |
| Security / RBAC | WAJIB restrict siapa boleh set Pending (Agent sendiri = risk gaming) — idealnya Supervisor approval atau sistem-triggered | Sama isu RBAC-nya kalau agent bisa toggle sendiri | Transfer butuh permission "Move ticket" — sudah ada pattern serupa (Move to Team, Agent/Supervisor/Admin boleh) | HIGH utk semua opsi kalau tidak di-gate | RBAC gate wajib di semua opsi — bukan cuma nice-to-have |
| Performance | Minimal — hanya tambahan filter query saat agregasi statistic | Minimal — reuse existing pause interval calculation | Berpotensi N+1 di re-assignment/round-robin re-entry logic kalau queue besar | LOW (1,2), MEDIUM (3) | — |
| Integration | Agent Statistic Dashboard perlu tahu flag baru untuk exclude | SLA Engine internal saja | Round Robin/Auto-Pull service (belum ada PRD — dependency open risk!) | HIGH utk Opsi 3 karena bergantung ke service yang belum terdokumentasi | Opsi 3 blocked sampai Round Robin punya PRD sendiri |
| Reporting/Analytics | Butuh kolom baru "Pending (excluded)" di SLA report supaya tidak silently mempengaruhi angka lama | SLA report harus jelas differentiate "paused" vs "running" durasi — kalau tidak, breach reporting bisa terlihat inconsistent vs periode sebelumnya | Ticket pindah kepemilikan → historical attribution jadi rumit (siapa "pemilik" breach: agent lama atau queue?) | MEDIUM — HIGH | Opsi 3 paling rawan distorsi historical reporting |
| Financial/Operational | Tidak langsung, tapi mempengaruhi KPI/insentif agent kalau dipakai untuk bonus/scoring | Sama | Bisa mempengaruhi workload distribution antar tim (butuh keputusan operasional siapa yang "punya" queue khusus itu) | MEDIUM | — |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Opsi 1 (Status Khusus) | Agent Statistic/Dashboard service | Direct (perlu expose exclude flag) | A -> B | Statistic service harus baca flag baru |
| Opsi 1 (Status Khusus) | Ticket SLA cycle snapshot | Shared entity | A <-> B | Field baru masuk snapshot per cycle, ikut policy freeze existing |
| Opsi 2 (SLA Pause) | Existing Waiting on Customer pause logic | Direct (extend, bukan replace) | A -> B | Risk: kalau tumpang tindih toggle WoC, perlu differensiasi reason enum |
| Opsi 2 (SLA Pause) | 3-way conflict Hold/Snooze/SLA (Conversation) | Indirect/precedent risk | A -> B | Kalau pattern ini di-lock utk Ticket duluan tanpa resolve Conversation, makin ambigu lintas domain |
| Opsi 3 (Queue Transfer) | Round Robin / Auto-Pull service | Direct, BLOCKING | A -> B | Belum ada PRD — dependency open risk sudah tercatat di global memory |
| Opsi 3 (Queue Transfer) | Ticket View Scope (`TicketViewEnum`) | Direct (extend enum) | A -> B | Perlu enum baru + RBAC scope baru |
| Opsi 3 (Queue Transfer) | Assignment/Ownership flow | Shared lifecycle, regression-sensitive | A <-> B | Assignment flow sudah ditandai "Regression Sensitive" di global memory |

### 6.2 Shared Resources / Event Mapping

- Semua opsi berbagi **SLA cycle snapshot mechanism** (freeze setting per cycle) — perubahan apapun harus ikut aturan "snapshot saat cycle start, tidak retroaktif ke cycle aktif" (konsisten existing FR-037/FR-038 Ticket SLA).
- Opsi 3 additionally menyentuh **event assignment** (perlu emit event ke Socket.IO/RabbitMQ untuk update Dashboard Agent real-time saat ticket ditarik keluar) — pola sama dengan Move-to-Team existing.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Agent set status Pending secara sepihak untuk menghindari breach (gaming) | High | High | HIGH | Wajib approval Supervisor atau restrict ke sistem-triggered condition, bukan free-toggle agent |
| R-02 | Opsi 2 (pure pause) menambah ambiguitas ke-4 di atas konflik Hold/Snooze yang sudah ada | High | Medium | HIGH | Lock 3-way conflict dulu sebelum extend pause mechanism baru |
| R-03 | Opsi 3 bergantung ke Round Robin/Auto-Pull yang belum ada PRD — implementasi bisa stuck/ad-hoc | Medium | High | HIGH | Buat PRD Round Robin dulu, atau split Opsi 3 jadi phase terpisah |
| R-04 | Historical SLA reporting jadi tidak comparable setelah field baru ditambahkan (breach rate terlihat "membaik" padahal cuma exclude scoring) | Medium | Medium | MEDIUM | Tambah kolom terpisah di report ("Total Breach" vs "Breach Excluding Pending"), jangan overwrite metric lama |
| R-05 | Opsi 3 memindah ticket ke queue khusus tanpa jelas siapa yang harus follow-up → ticket "hilang" di queue tak bertuan | Medium | High | HIGH | Queue khusus wajib punya SLA/monitoring sendiri + Supervisor visibility, bukan cuma dashboard hidden |
| R-06 | Definisi "Pending"/"bottleneck" tidak konsisten antar tim → dipakai sembarangan sehingga breach rate agent jadi tidak informatif sama sekali | Medium | Medium | MEDIUM | Kunci daftar reason code terbatas (mis. "Menunggu approval internal", "Menunggu vendor", bukan free text) |

### 7.2 Worst-Case Scenarios

- Semua tiket yang berisiko breach di-set "Pending" oleh agent tanpa kontrol → SLA metric jadi tidak berarti, Supervisor kehilangan visibility real bottleneck (kalau Opsi 1/2 tidak digate RBAC).
- Ticket masuk Queue Khusus (Opsi 3) tapi tidak ada round robin/monitoring balik → ticket stuck permanen, worse daripada sebelum ada fitur ini.
- Opsi 3 juga punya risk gaming versi lain: kalau Agent sendiri (bukan hanya Supervisor) bisa trigger "Transfer ke Queue" bebas, agent bisa buang ticket sulit ke queue khusus supaya lepas dari SLA-nya tanpa alasan sah — sama seperti risk R-01 di Opsi 1/2, transfer wajib digate approval/reason code, bukan self-service penuh oleh Agent.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Set/unset Pending state (Opsi 1) dengan RBAC gate.
- Pause/resume SLA timer behavior (Opsi 2), termasuk snapshot freeze per cycle.
- Transfer ke Queue Khusus (Opsi 3): assignee reset, SLA stop/restart, ticket muncul di queue view baru.

### 8.2 Regression Scope
- Existing Waiting on Customer pause (Ticket) — pastikan reason baru tidak overlap/duplikat trigger.
- Existing Ticket View Scope RBAC (`queue_team`, `queue_unassigned`) — pastikan enum baru tidak break existing filter.
- Assignment flow & reopen flow (regression-sensitive per global memory).

### 8.3 Integration Scope
- Agent Statistic/Dashboard service membaca flag exclude dengan benar.
- Socket/event update real-time saat ticket keluar dari Dashboard Agent (Opsi 3).

### 8.4 UAT / Business Validation
- Supervisor dapat melihat breach rate "murni" vs "termasuk pending" secara terpisah.
- Agent tidak bisa self-approve status Pending tanpa role yang sesuai.

### 8.5 Automation Candidates
- Reminder/breach trigger re-evaluation saat resume dari pause (pola sudah ada, tinggal reuse test case existing FR-047/FR-048 Conversation SLA).

---

## 9. Production Safety

- **Rollback Strategy:** Field/flag baru bersifat additive (tidak override existing status `open`/`close`); feature flag per-workspace untuk enable pending-exclusion.
- **Feature Toggle Requirement:** Wajib — terutama untuk Opsi 3 karena mengubah assignment/queue behavior.
- **Backward Compatibility Notes:** SLA cycle snapshot lama tidak berubah (ikuti FR-037/FR-038 existing).
- **Staged Rollout Recommendation:** Opsi 1 dulu (low risk, high value) → resolve 3-way conflict → baru evaluasi Opsi 3 setelah Round Robin punya PRD.
- **Monitoring / Alerting Needs:** Alert kalau jumlah ticket ber-status Pending naik drastis dalam waktu singkat (indikasi gaming).
- **Logging / Audit Gaps:** Audit log wajib untuk siapa set/unset Pending dan siapa approve — konsisten dengan pattern audit log yang sudah eksis: `Auditability` FR-070–FR-072 di `PRD Conversation SLA.md` (old/new value, actor, timestamp) dan FR-012 audit log di `PRD ... Ownership Decoupling.md` (actor, timestamps, from/to, conversation_id).

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Siapa yang boleh trigger status Pending — Agent bebas, atau perlu approval Supervisor / restricted ke kondisi sistem tertentu? | Menentukan risk gaming R-01 | Yes |
| OQ-02 | Apakah resolve 3-way conflict Hold/Snooze/SLA (Conversation) harus selesai dulu sebelum fitur ini masuk Ticket domain, atau bisa paralel dengan kebijakan terpisah? | Menentukan apakah opsi baru menambah ambiguitas ke-4 | Yes |
| OQ-03 | ~~Apakah "Pending Ticket" yang dimaksud murni Ticket, atau juga perlu align ke Conversation Hold?~~ → **CLARIFIED (v1.1):** Scope mencakup kedua domain: Ticket **dan** Conversation. | Menentukan scope PRD (single-domain vs cross-domain) | Yes → **Answered** |
| OQ-04 | Kalau pilih Opsi 3, siapa owner Queue Khusus itu — tim tertentu, atau pool umum dengan re-assignment otomatis? | Menentukan kebutuhan Round Robin PRD sebagai prasyarat | Yes |
| OQ-05 | Apakah exclude-from-scoring memengaruhi insentif/bonus agent (finansial) atau murni dashboard visual? | Menentukan sensitivitas Financial/Operational impact | No (bisa didiskusikan belakangan, tapi baik untuk diketahui PM) |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

**Head-to-Head Ringkas:**

| Kriteria | Opsi 1 (Status Khusus) | Opsi 2 (SLA Pause) | Opsi 3 (Queue Transfer) |
|---|---|---|---|
| Dampak ke performa Agent | Langsung exclude, paling presisi | Tidak langsung — cuma pause timer, breach count agent tetap "milik" agent kalau resume dan overdue | Paling tegas — ticket lepas dari agent sepenuhnya |
| Akurasi SLA reporting | Tinggi (durasi bottleneck tetap tercatat, hanya exclude dari personal scoring) | Rawan distorsi (SLA "terlihat" tidak breach padahal delay riil terjadi) | Rawan reporting attribution ambiguous (siapa "pemilik" breach setelah transfer) |
| Effort implementasi | Rendah — reuse existing pattern (Hold indicator, pause interval) | Rendah-Medium — reuse `pausedIntervals`, tapi bentrok governance dgn WoC & Hold/Snooze existing | Tinggi — butuh entity Queue baru + bergantung Round Robin yang belum ada PRD |
| Risk gaming | Sedang (bisa dimitigasi RBAC) | Tinggi (agent termotivasi pause SLA sesering mungkin) | Rendah (begitu keluar dashboard, bukan urusan agent lagi) |
| Kesesuaian pattern existing | Tinggi — selaras "Snooze is a state, not a status change" | Sedang — tumpang tindih & extend konflik existing (Hold vs Snooze) | Sedang — mirip Move-to-Team existing tapi beda level (ticket-bottleneck bukan number-remap) |

**Kenapa Opsi 1 direkomendasikan sebagai fondasi:** paling presisi menjawab masalah asli user — "SLA dari Pending Ticket **dan Conversation** agar tidak merugikan performa agent" — tanpa menyembunyikan durasi delay yang riil (masih auditable untuk manajemen), risknya paling terkontrol (tinggal gate RBAC), dan effort paling rendah karena tinggal reuse pola exclude/badge yang sudah eksis (Hold indicator di Conversation, Waiting on Customer indicator di Ticket). **Di kedua domain, state "pending/exclude" yang sama dipakai** supaya Agent Statistic dashboard punya satu mekanisme filter konsisten lintas domain.

**Kenapa Opsi 2 tidak direkomendasikan berdiri sendiri:** karena masalah yang diminta bukan "hentikan jam SLA" tapi "jangan salahkan agent" — dua hal beda. Pause murni menyembunyikan durasi delay riil dari laporan, dan tumpang tindih langsung dengan konflik Hold vs Snooze yang sudah terbuka dan belum di-lock; menambah pause mechanism baru di Ticket tanpa resolve itu berisiko menambah ambiguitas.

**Kenapa Opsi 3 baik tapi harus jadi Phase 2, bukan Phase 1:** paling cocok untuk kasus bottleneck yang genuinely bukan tanggung jawab agent lagi (mis. eskalasi ke tim lain), tapi bergantung ke Round Robin/Auto-Pull yang belum punya PRD sendiri (open risk tercatat di global memory) — implementasi sebelum itu selesai akan ad-hoc dan berisiko regression di assignment flow yang sudah ditandai sensitive.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM (Yusril) untuk lock kebijakan pause/hold, Analyst untuk lanjut ke Change Intake Brief formal |
| Required Revisions | Resolve 3-way conflict Hold/Snooze/SLA dulu; definisikan governance approval untuk status Pending |
| Suggested Delivery Strategy | Phase split — Phase 1: Opsi 1 (Status Khusus + exclude scoring) **di kedua domain (Ticket + Conversation)** dengan unified `excludedFromScoring` flag di kedua SLA system. Phase 2: evaluasi Opsi 3 setelah Round Robin PRD ada. Opsi 2 di-hold sampai konflik existing di-lock. |
| Earliest Safe Next Step | Buat Change Intake Brief formal untuk Phase 1 (Opsi 1) sambil eskalasi ke PM soal 3-way conflict lock |

---

## 12. Traceability Matrix

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| REQ-01 | **Ticket** pending tidak boleh merugikan performa agent | Opsi 1 direkomendasikan; butuh flag `excludedFromScoring` di Ticket SLA cycle | Agent Statistic, SLA Engine | TC-PENDING-001 (pending set, breach excluded dari agent stat Ticket) | Pending |
| REQ-01C | **Conversation** pending/Hold tidak boleh merugikan performa agent | Layer `excludedFromScoring` ditambah di atas Hold existing (resolve ambiguity 3-way conflict first) | Agent Statistic, SLA Engine (ConversationSLAMetrics) | TC-PENDING-001C (Hold + exclude flag, FRT/TTC excluded dari agent stat Conversation) | Pending |
| REQ-02 | Durasi delay tetap harus tercatat untuk visibility manajemen (kedua domain) | Opsi 1 tetap jalankan timer, hanya exclude scoring — berlaku di ConversationSLAMetrics dan Ticket SLA cycle | Reporting/Analytics | TC-PENDING-002 (durasi pending tercatat di report per domain) | Pending |
| REQ-03 | Cegah gaming oleh agent (kedua domain) | RBAC gate + reason code terbatas | Security/RBAC | TC-PENDING-003 (agent tanpa approval tidak bisa set pending di Ticket maupun Conversation) | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-19 | v1.0 — Initial assessment created (Ticket-only scope). Reviewed PASS with minor notes. | Dany Christian |
| 2026-08-19 | v1.1 — Scope perluasan: user clarify "Conversation juga harus ada" → Report mencakup kedua domain (Ticket + Conversation). Impact: Conversation punya Hold & Snooze existing yang ambigu → strategy berbeda (resolve ambiguity + add exclude layer, bukan bikin dari nol). | Dany Christian |
