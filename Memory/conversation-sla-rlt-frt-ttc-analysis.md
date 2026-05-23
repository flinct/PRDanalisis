# Conversation SLA: FRT, TTC, RLT Cross-PRD Analysis

> Analisis mendalam tentang definisi, overlap, dan conflict antara PRD Conversation SLA, PRD Ticket SLA, dan PRD Conversation RLT.

---

## Extracted Canonical Rules

### FRT — First Response Time / First Response Due

#### Conversation FRT (dari PRD Conversation SLA.md)

- FRT adalah SLA metric untuk mengukur waktu sampai agent memberi response pertama ke customer.
- Conversation SLA cycle start saat conversation pertama kali di-assign ke agent.
- FRT completed saat first agent message yang visible ke customer dikirim setelah SLA start.
- Internal notes tidak menghentikan FRT.
- Waiting on Customer tidak pause FRT.
- AUX bisa pause FRT jika policy "Hitung SLA saat agen dalam mode AUX" disabled.
- FRT tersedia untuk semua supported conversation channel, termasuk WA Web Group.
- FRT punya duration per channel.
- FRT punya maksimal 1 reminder per metric per channel.
- FRT reminder/breach bisa dikirim ke supervisor dan current assignee.
- Reminder tidak dikirim saat metric paused, dan dievaluasi ulang saat resume.
- Active FRT cycle memakai snapshot setting saat cycle start, tidak berubah jika admin edit setting.

#### Ticket FRT (dari PRD Ticket - SLA ticket.md)

- Ticket FRT start saat ticket dibuat dan masuk status non-resolved.
- Ticket FRT completed saat first agent response dikirim setelah SLA cycle start.
- Internal notes tidak dihitung sebagai agent response.
- Manual ticket tanpa customer message tetap start FRT dari ticket creation time.
- Ticket Waiting on Customer pause bisa pause FRT jika toggle enabled.
- Ticket reopen membuat SLA cycle baru, termasuk FRT baru.

---

### TTC — Time to Close / Time to Close Due

#### Conversation TTC (dari PRD Conversation SLA.md)

- TTC adalah SLA metric untuk mengukur waktu sampai conversation resolved/closed.
- Conversation SLA cycle start saat conversation pertama kali di-assign ke agent.
- TTC completed saat conversation diset ke resolved atau closed.
- TTC hanya dibuat untuk channel yang support TTC.
- WA Web Group tidak support TTC.
- Waiting on Customer hanya pause TTC, bukan FRT.
- AUX bisa pause TTC jika AUX counting disabled.
- TTC punya duration per channel.
- TTC punya maksimal 1 reminder per metric per channel.
- TTC reminder/breach bisa dikirim ke supervisor dan current assignee.
- TTC tidak dibuat retroaktif untuk unsupported channel.
- Active TTC cycle memakai snapshot setting saat cycle start.

#### Ticket TTC (dari PRD Ticket - SLA ticket.md)

- Ticket TTC start saat ticket dibuat dan masuk non-resolved status.
- TTC completed saat ticket transition ke resolved status.
- TTC tidak trigger reminder atau breach setelah completed.
- Waiting on Customer pause bisa pause TTC jika toggle enabled.
- Ticket reopen membuat SLA cycle baru, termasuk TTC baru.
- Stage SLA terpisah dari TTC tapi ikut pause policy ticket.

---

### RLT — Response Lead Time (dari PRD Conversation RLT.md)

- RLT adalah tracked metric, bukan SLA threshold di Phase 1.
- RLT mengukur staff handling time setelah conversation assigned ke agent.
- Formula: `RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time`
- RLT start dari first assignment timestamp.
- RLT stop saat first successful customer-facing reply dicatat.
- Internal notes, failed replies, drafts, dan system messages tidak dihitung sebagai first reply.
- Reassignment sebelum first reply tidak reset primary RLT.
- Multi-assignee conversation memakai earliest assignment sebagai T2.
- First responder disimpan sebagai agent yang mengirim first customer-facing reply.
- RLT harus ditampilkan sebagai live timer di Conversation Detail.
- Linked Ticket Detail menampilkan inherited RLT dari linked conversation.
- Internal-only ticket tanpa linked customer conversation menampilkan "Tidak berlaku".
- RLT harus disimpan di database: timestamps, raw duration, adjusted duration, status, quality flags.
- RLT Adjusted bisa memakai AUX/Snooze handling hanya jika existing SLA pause policy mendukung.
- Phase 1 tidak punya RLT SLA threshold.
- Phase 1 tidak memicu alert, reminder, breach badge, notification, escalation, atau sound untuk RLT.

### Wait Time in Queue (dari PRD Conversation RLT.md)

- Wait Time in Queue adalah tracked metric.
- Formula: `Wait Time in Queue = First Agent Assignment Time - First Customer Inbound Message Time`
- Timer start saat first customer inbound message masuk.
- Timer stop saat first agent assignment dicatat.
- Ditampilkan di Conversation Detail dan linked Ticket Detail.
- Ditambahkan ke Offline Report Download.
- Tidak punya SLA threshold, alert, reminder, breach, atau escalation di Phase 1.

---

## Critical Findings

### Finding 1: RLT vs FRT Duplication Potential

RLT PRD mendefinisikan:
- `RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time`

Conversation SLA mendefinisikan:
- FRT selesai saat first customer-facing agent message sent setelah SLA start.
- SLA start = first assignment.

**Jika FRT start dari assignment, maka:**
- `FRT = first agent reply - first assignment`
- `RLT = first agent reply - first assignment`
- **Hasil: dua metric nama berbeda, nilai identik.**

**Resolusi yang direkomendasikan:**
- FRT harus direvisi menjadi end-to-end dari sisi customer:
  `FRT = T_FirstCustomerFacingReply - T_FirstCustomerInboundMessage`
- Dengan demikian FRT = Wait Time + RLT, dan ketiga metric punya makna berbeda.

---

### Finding 2: Data Model Conflict — Persistence vs Real-time

| Aspek | SLA Canonical (Global Memory) | RLT PRD |
|---|---|---|
| Storage | Calculated real-time, NOT stored in conversation document | Wajib database persistence: timestamps, duration, status, quality flags |
| Sifat | SLA cycle dengan snapshot settings | Response metric dengan status lifecycle sendiri |

**Risk:** Implementasi bisa mencampur RLT persistence dengan SLA cycle, merusak model data existing.

**Resolusi:** RLT/Wait Time harus dipisah sebagai `response_metrics` terpisah dari SLA cycle.

---

### Finding 3: Pause Policy Fragmentation

| Mekanisme | Conversation SLA | Snooze PRD | Room PRD | RLT Adjusted |
|---|---|---|---|---|
| AUX | Pause active metrics jika policy disabled | N/A | N/A | Tergantung existing policy |
| Waiting on Customer | Pause TTC only, not FRT | N/A | N/A | N/A |
| Snooze | Tidak dibahas | "No SLA pause changes" (eksplisit) | N/A | "If existing SLA pause policy supports it" |
| Hold | N/A | N/A | "SLA countdown pauses on Hold" | Tidak disebut |

**Risk:** Implementasi RLT Adjusted bisa berbeda tergantung tim yang mengerjakan, karena tidak ada satu source of truth untuk pause policy.

---

### Finding 4: Linked Ticket Lifecycle Mismatch

- Conversation RLT inherit ke linked ticket.
- Ticket SLA punya lifecycle sendiri (start: ticket creation, reopen: new cycle).
- Satu ticket detail bisa menampilkan Ticket FRT/TTC dan Conversation RLT/Wait Time dengan start-point berbeda.
- Ticket linked ke multiple conversations belum punya attribution rule.

**Risk:** Confusion di UI jika label tidak jelas membedakan "Conversation Response Metrics" vs "Ticket SLA".

---

### Finding 5: Offline Report Column Duplication

Default Ticket Columns yang sudah ada:
- `First Reply Time`
- `Customer First Wait`

RLT PRD menambahkan kolom baru:
- `First Customer Message At`, `First Assigned At`, `First Customer Reply At`
- `Wait Time in Queue`, `Response Lead Time`, `RLT Adjusted`

**Perlu mapping:** apakah `First Reply Time = RLT` / `Customer First Wait = Wait Time in Queue`, atau kolom lama deprecated.

---

## Impact Connection Matrix

| Area | Existing Rule | RLT Impact |
|---|---|---|
| Conversation SLA | FRT/TTC per channel, start at first assignment | RLT memakai start dan stop event yang sama dengan FRT |
| Ticket SLA | FRT/TTC per ticket type, start at ticket creation | Linked ticket akan punya metric inherited conversation yang beda lifecycle |
| Conversation Detail | Menampilkan First Response Due dan Time to Close Due | Harus tambah live timer RLT/Wait Time tanpa mengubah FRT/TTC |
| Ticket Detail | SLA sidebar FRT/Resolve remaining time | Harus bedakan Ticket SLA vs inherited Conversation response metrics |
| Chat List | SLA color threshold green/yellow/red | RLT/Wait Time tidak boleh ikut breach/threshold Phase 1 |
| Snooze | Tidak mengubah SLA pause | RLT Adjusted menyebut Snooze tapi belum ada rule pause |
| Room Hold | Hold pauses SLA | Conflict dengan Snooze dan belum jelas untuk RLT Adjusted |
| Offline Report | Sudah ada First Reply Time dan Customer First Wait | Perlu rename/mapping agar tidak duplicate |
| Data Model | SLA computed realtime, not stored in conversation document | RLT meminta persisted metrics; harus dipisah dari SLA cycle |

---

## Loophole Analysis

### L1 — Definisi FRT Conversation vs RLT belum di-lock
Jika FRT tetap start dari assignment, RLT redundant.

### L2 — Start point ambiguity
`First Customer Inbound Message Time` belum jelas untuk:
- Reopened conversation
- Resumed session
- Email transcript
- Imported WhatsApp
- Group chat
- Multiple inbound sebelum assignment

### L3 — Assignment time ambiguity
`First Agent Assignment Time` belum jelas untuk:
- Auto assignment vs round robin vs manual assign vs assign-to-me
- Reassignment (RLT tidak reset, tapi Wait Time?)
- Multi-assignee (pakai earliest assignment)
- Participant array yang masih undeveloped

### L4 — First reply definition gap
Exclude: internal notes, failed replies, drafts, system messages.
Belum clear: bot reply, welcome message, auto-reply, macro, bulk reply, email reply.

### L5 — Metric Quality Flags & Status undefined
- `Metric Quality Flags` disebut tapi tidak ada enum.
- `Metric Status` disebut tapi tidak ada lifecycle: running, completed, not_applicable, missing_data, invalid_sequence, etc.

### L6 — Multi-ticket / multi-conversation attribution
Ticket linked ke multiple conversations atau multiple tickets dari satu bubble belum punya attribution rule untuk inherited RLT.

---

---

## PRD Interconnection Analysis: RLT/FRT/TTC vs Seluruh Conversation PRD

### Metode

Setiap PRD di folder `PRD/Conversation/` diperiksa untuk:
- Referensi eksplisit ke FRT, TTC, RLT, SLA, First Response, Time to Close, Response Lead Time, Wait Time
- Implicit business rule yang bersinggungan dengan lifecycle metric (assignment, inbound, reply, reopen, move, hold, snooze, resolve)
- Broken requirement: aturan di PRD lain yang bertentangan dengan definisi FRT/TTC/RLT
- Ketentuan belum jelas: area yang tidak tercakup oleh definisi metric saat ini

---

### 1. Conversation Detail PRD (`PRD Inbox Conversation - detail.md`)

**Referensi SLA:**
- AC-02: `First Response Due countdown appears only when Unassigned`
- US-02: Supervisor/Admin dapat melihat SLA information (First Response Due, Time to Close Due)
- Header/timeline menampilkan SLA countdown

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Detail PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **FRT visibility** | FRT countdown hanya muncul saat **Unassigned** | **BROKEN REQUIREMENT.** FRT adalah metric dari inbound ke first reply. Jika FRT hanya muncul saat Unassigned, agent tidak bisa melihat FRT countdown setelah di-assign. Ini tabrakan langsung dengan definisi FRT yang memerlukan assignment sebagai start point (versi lama) atau inbound sebagai start point (versi baru). |
| **RLT live timer** | Tidak ada referensi | **MISSING.** RLT PRD mensyaratkan live timer di Conversation Detail. Detail PRD tidak punya slot UI untuk metric tambahan selain FRT/TTC. |
| **Wait Time display** | Tidak ada referensi | **MISSING.** Wait Time tidak disebut di mana pun di Detail PRD. |
| **Assignment state** | AC-01: Unassigned state vs Assigned state | **PENTING.** FRT/TTC start point bergantung pada assignment. Detail PRD perlu diperbarui untuk mendukung _assignment timestamp_ sebagai data point metric. |

**Broken Requirements:**
1. `AC-02` harus direvisi: FRT tidak boleh "hanya muncul saat Unassigned". FRT adalah end-to-end metric dari inbound. Jika FRT dihitung dari inbound, maka FRT visible sejak inbound diterima, bukan hanya saat Unassigned.
2. Detail PRD perlu tambahan section untuk RLT live timer dan Wait Time display.

**Unclear:**
- Apakah RLT timer muncul di tempat terpisah dari FRT/TTC, atau menggantikan FRT?
- Apakah Wait Time muncul sebagai label statis atau live timer juga?

---

### 2. Room PRD (`PRD Inbox Conversation - room.md`)

**Referensi SLA:**
- Header: "SLA countdown: Color-coded, pauses on Hold"
- P1 user story: "Resume restores SLA timer"
- Indicators: "SLA (color-coded)"
- Automation: bot auto-reply, welcome message (berpotensi sebagai first reply?)

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Room PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Hold → SLA pause** | Hold pauses SLA countdown, Resume restores | **FRAGMENTASI.** Room mengklaim Hold pause SLA. Tapi Conversation SLA PRD tidak mention Hold. Snooze PRD bilang "No SLA pause changes". RLT Adjusted bilang tergantung existing policy. **Tidak ada keputusan final.** |
| **Resume → SLA restore** | Resume restores SLA timer | **ALIGNED** dengan konsep pause/resume di Agent-Centric mode. Tapi tidak jelas apakah ini berlaku untuk FRT, TTC, atau keduanya. |
| **Reminder modal** | One-time / recurring reminder | **POTENSI DUPLIKASI.** Reminder terpisah dari SLA reminder. Bisakah reminder di Room dianggap sebagai first reply event? Tidak. |
| **Auto-reply / welcome message** | Bot auto-reply outside hours, welcome message during hours | **BROKEN.** Apakah auto-reply dihitung sebagai first customer-facing reply untuk FRT/RLT? Room tidak mendefinisikan ini. Auto-Reply PRD bilang auto-reply tidak dihitung sebagai SLA response. |

**Broken Requirements:**
1. Room PRD mengasumsikan SLA pause pada Hold. Tapi Conversation SLA PRD dan Snooze PRD tidak sinkron. **Tiga PRD punya tiga asumsi berbeda tentang pause.**
2. Bot auto-reply / welcome message tidak didefinisikan statusnya sebagai first reply. Ini berdampak langsung ke FRT dan RLT completion.

**Unclear:**
- Apakah "SLA countdown" di Room merujuk ke FRT, TTC, atau keduanya?
- Apakah Hold pause juga RLT Adjusted? RLT Adjusted disebut AUX/Snooze, bukan Hold.
- Apakah resume setelah Hold juga meresume RLT timer?

---

### 3. Snooze PRD (`PRD Inbox Conversation - snooze conversation.md`)

**Referensi SLA:**
- Out of Scope: "SLA pause policy changes"
- Limitation: "No SLA pause changes. Snoozed conversations may still be considered in SLA calculations depending on existing SLA policy."
- Risk: "Hidden conversation causes missed inbound if auto-unsnooze fails → SLA and customer experience risk"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Snooze PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA pause** | "No SLA pause changes" — eksplisit | **BROKEN dengan Room PRD.** Room bilang Hold pause SLA. Snooze bilang tidak ada pause. Keduanya adalah mekanisme "agent tidak available" tapi punya efek SLA berbeda. |
| **RLT Adjusted** | N/A | **BROKEN dengan RLT PRD.** RLT Adjusted menyebut Snooze sebagai salah satu mekanisme pause yang mungkin berlaku ("if existing SLA pause policy supports it"). Tapi Snooze PRD secara eksplisit mengatakan tidak ada SLA pause. **Kontradiksi langsung.** |
| **Auto-unsnooze** | Inbound customer message → auto-unsnooze | **ALIGNED.** Inbound message setelah snooze akan meng-unsnooze dan agent bisa reply. Ini relevan untuk FRT/RLT jika snooze terjadi sebelum first reply. |
| **Wait Time** | N/A | **MISSING.** Apakah snooze mempengaruhi Wait Time? Wait Time stop di assignment. Snooze terjadi setelah assignment. Jadi Wait Time tidak terpengaruh. Tapi perlu dikonfirmasi. |

**Broken Requirements:**
1. **Snooze vs Room Hold:** Dua mekanisme "agent pause" yang berbeda. Satu tidak pause SLA, satu pause SLA. **QA harus tes keduanya dan pastikan ada keputusan final.**
2. **RLT Adjusted vs Snooze:** RLT PRD menyebut Snooze sebagai pause potensial. Snooze PRD bilang tidak ada SLA pause. **Salah satu harus direvisi.**

**Unclear:**
- Jika conversation di-snooze sebelum first reply, apakah RLT clock tetap berjalan (karena "no SLA pause changes")?
- Apakah auto-unsnooze oleh inbound message juga "meresume" RLT timer?

---

### 4. Chat Session Handling PRD (`PRD Inbox Conversation - chat session handling.md`)

**Referensi SLA:**
- FR-007: "System MUST carry over SLA across ownership changes and MUST NOT reset timers on reassign/unassign"
- FR-016: "On move, assignee MUST reset to Unassigned and SLA MUST stop immediately"
- US-011: "SLA to carry over across assignment changes"
- FR-005: "Group metadata updates MUST NOT alter session state/ownership/SLA"
- Move dialog: "Assignee will be reset to Unassigned and SLA will stop"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Session PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA carry over** | SLA tidak reset pada reassign/unassign | **ALIGNED dengan RLT.** RLT juga tidak reset primary RLT pada reassignment sebelum first reply. Konsisten. |
| **SLA stop on move** | SLA stop saat conversation di-move ke team lain | **BROKEN dengan RLT persistence.** RLT adalah persisted metric. Jika SLA stop, apakah RLT juga stop? RLT belum mendefinisikan behavior saat move. |
| **New session on reopen** | "Resolved → new inbound → new Unassigned session" | **IMPACT ke Wait Time.** Wait Time mengukur inbound → assignment. Jika reopen selalu bikin new session, Wait Time restart. Tapi RLT PRD tidak mendefinisikan reopen behavior. |
| **Group chat SLA** | "Group metadata updates MUST NOT alter SLA" | **ALIGNED.** Tapi group chat lifecycle masih undefined di cross-analysis L2. |

**Broken Requirements:**
1. **SLA carry over (FR-007) vs RLT non-reset (AC-06):** Sebenarnya aligned — keduanya tidak reset. Tapi FR-007 tidak menyebut RLT atau Wait Time karena PRD ini lebih tua.
2. **Move → SLA stop:** Jika SLA stop, haruskah RLT dan Wait Time juga di-freeze atau di-reset? Tidak didefinisikan.
3. **Session state machine vs FRT start:** FR-016 menciptakan "new session" tapi FRT/RLT/Wait Time mulai dari event pertama conversation. Perlu mapping lifecycle session vs lifecycle metric.

**Unclear:**
- Apakah SLA carry over berlaku juga untuk RLT dan Wait Time?
- Untuk reopened session (new Unassigned), apakah Wait Time restart dari 0?

---

### 5. Reassign Account Channel PRD (`PRD Inbox Conversation - reassign account channel.md`)

**Referensi SLA:**
- FR-006: "Move resets assignee to Unassigned and stops SLA immediately"
- FR-015: "On reopen in same team, SLA resumes per policy; on move-and-reopen, new SLA timer MAY start"
- PS-001: "Reassigning → SLA breaches, agent confusion"
- Move dialog: "SLA will stop"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Reassign PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA stop on move** | SLA stop immediately | **BROKEN dengan RLT persistence.** Sama dengan Session PRD. RLT & Wait Time sebagai persisted metric harus punya aturan sendiri untuk move. |
| **SLA resume on reopen** | SLA resumes per policy | **BROKEN dengan Session PRD.** Session bilang reopen = new session. Reassign bilang reopen = resume. Mana yang benar untuk FRT/TTC/RLT? |
| **Assignee reset** | Assignee → Unassigned setelah move | **IMPACT.** Jika assignee reset, assignment timestamp pertama (T2) tetap ada untuk RLT. Tapi Wait Time sudah pernah stop. Move tidak mengubah inbound timestamp (T1). |

**Broken Requirements:**
1. **Reopen behavior:** Tiga PRD (Session, Room, Reassign) punya tiga definisi reopen berbeda. Ini berdampak langsung ke kapan FRT/TTC/RLT restart atau resume.
2. **SLA resume vs new SLA cycle:** Reassign bilang MAY start new SLA timer. Tapi Ticket SLA bilang reopen = new SLA cycle. Mana untuk Conversation SLA?

**Unclear:**
- Apakah RLT & Wait Time ikut di-freeze saat move, atau tetap menyimpan nilai hingga close?
- Jika move-and-reopen terjadi, apakah RLT dihitung dari first assignment (di team lama) atau dari assignment baru (di team baru)?

---

### 6. Create Ticket from Conversation PRD (`PRD Inbox Conversation - create ticket from conversation.md`)

**Referensi SLA:**
- AC-05: "SLA for chat (response) and ticket (resolution) are tracked independently"
- "Dual SLA tracking (Chat SLA & Ticket SLA)"
- SLA Rules (Ticketing): SLA runs only when agent holds ball (Submitted/In Progress), pauses on Waiting on Customer, stops on Resolved, reopened = new countdown

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Create Ticket PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Dual SLA tracking** | Chat SLA dan Ticket SLA independen | **BROKEN oleh RLT.** RLT PRD bilang linked ticket menampilkan inherited RLT dari conversation. Ini menambah "third metric family" yang tidak ada dalam desain dual-SLA original. |
| **Chat SLA** | Tracked independently dari Ticket SLA | **ALIGNED.** RLT adalah bagian dari Chat/Conversation metric, bukan Ticket metric. Inherit ke ticket detail adalah view-only. |
| **Ticket SLA pause** | Pause on Waiting on Customer, stop on Resolved | **DIFFERENT** dari Conversation SLA. Conversation SLA hanya pause TTC pada Waiting on Customer, bukan FRT. Ticket SLA pause FRT dan TTC. |

**Broken Requirements:**
1. **Dual SLA menjadi Triple SLA:** Desain original adalah Chat SLA + Ticket SLA. RLT memperkenalkan Response Metrics yang inherit ke ticket. Ini perlu diklarifikasi: apakah "dual" masih valid atau perlu konsep baru.
2. **Pause policy mismatch:** Ticket SLA pause FRT+TTC saat Waiting on Customer. Conversation SLA hanya pause TTC. Jika linked ticket menampilkan conversation metric, metric tersebut tidak terpengaruh oleh ticket pause policy. **Agent bisa lihat inkonsistensi di ticket detail.**

**Unclear:**
- Jika ticket dibuat dari conversation sebelum first reply terjadi, apakah RLT terhitung? RLT memerlukan first reply untuk stop. Jika ticket dibuat sebelum reply, apakah RLT tetap running?
- Ticket reopened = new SLA cycle. Apakah RLT juga new cycle atau tetap dari conversation original?

---

### 7. Chat List PRD (`PRD Inbox Conversation - chat list.md`)

**Referensi SLA:**
- US-14: "SLA countdown with colors: Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue). Configurable via Settings"
- US-11: "Filters: SLA (Overdue, Near Due)"
- US-13: Hold indicator (icon + tooltip)
- US-15: Sorting: Most Recent, Longest Waiting, Mentions, Reminder

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Chat List PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA color threshold** | Green/Yellow/Red berdasarkan % sisa waktu | **MISSING definisi metric.** Threshold ini untuk FRT atau TTC? Tidak didefinisikan. SLA metric mana yang dipakai UI belum ditentukan. |
| **Filter SLA** | Filter Overdue / Near Due | **RISK dengan RLT.** RLT Phase 1 tidak punya threshold/breach. Tapi filter SLA mungkin tetap memasukkan RLT sebagai metric — harus eksplisit dicegah. |
| **Sort by SLA** | Sorting options include SLA Urgency (implementasi) | **RISK.** Jika RLT tidak boleh trigger alert, apakah RLT boleh mempengaruhi SLA Urgency sort? Tidak jelas. |
| **Hold indicator** | Hold icon + tooltip | **HOLD vs SLA.** Room bilang Hold pause SLA. Chat List menampilkan Hold indicator. Snooze PRD bilang tidak ada pause. Chat List perlu sinkron dengan keputusan final. |

**Broken Requirements:**
1. **SLA color metric undefined:** Chat List adalah satu-satunya PRD yang mendefinisikan threshold warna. Tapi tidak bilang metric mana. Ini harus diputuskan di SLA Engine Contract.
2. **Hold ↔ Snooze ↔ Room ambiguity:** Tiga mekanisme berbeda untuk "agent tidak available". Chat List menampilkan Hold indicator tapi tidak bisa membedakan Hold, Snooze, atau AUX.

**Unclear:**
- Apakah warna SLA di Chat List berdasarkan FRT, TTC, atau yang lebih buruk (overdue)?
- Jika RLT Phase 1 tidak punya threshold, apakah Chat List tetap menampilkan timer RLT/Wait Time?
- Apakah filter "SLA Overdue" juga mencakup conversation yang RLT-nya overdue? Harusnya tidak (Phase 1).

---

### 8. Agent Pull Conversation PRD (`PRD Inbox Conversation - agent pull conversation.md`)

**Referensi SLA:**
- Future Consideration: "SLA-aware prioritization (push nearing SLA to top of queue)"
- "Maintain SLA with optional timeout: 90% of conversations returned to queue if idle beyond timeout"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Agent Pull PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Queue prioritization** | Future: SLA-aware → push nearing SLA to top | **RISK.** Jika SLA-aware prioritization diimplementasi, metric mana yang dipakai? FRT? TTC? RLT? Wait Time? |
| **Timeout return** | Inactive chat returned to queue | **IMPACT ke Wait Time.** Jika chat di-pull lalu timeout → return to queue → di-pull lagi oleh agent lain. Wait Time restart? Atau akumulasi? |
| **Assignment timestamp** | Pull = auto-assign → mencatat assignment timestamp | **ALIGNED.** T2 jelas: saat pull terjadi. Tapi perlu dipastikan sistem menyimpan T2 untuk RLT dan Wait Time. |

**Broken Requirements:**
1. **SLA-aware prioritization metric undefined:** Jika future ini direalisasi, harus jelas metric mana yang dipakai. RLT Phase 1 seharusnya tidak masuk hitungan SLA.
2. **Timeout → return to queue → re-assign:** Ini adalah reassignment scenario. RLT non-reset untuk first reply. Tapi Wait Time? Apakah dihitung dari T1 pertama atau di-reset?

**Unclear:**
- Apakah timeout return to queue menghapus assignment timestamp pertama atau tetap disimpan?
- Jika agent A pull + timeout, lalu agent B pull + reply, apakah RLT agent A = 0 (tidak pernah reply) dan RLT agent B = waktu dari assignment B ke reply?

---

### 9. Omnichannel PRD (`PRD Inbox Conversation - omnichannel.md`)

**Referensi SLA:**
- "SLA-compliance monitoring"
- OKR: "≥95% SLA breaches flagged in real-time"
- Success metric: "SLA Breach Detection Accuracy: 100%"
- Observability: "Metrics: SLA breaches, query times"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Omnichannel PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA breach monitoring** | 100% breach detection accuracy | **RISK.** Jika RLT tidak punya threshold/breach (Phase 1), sistem monitoring harus exclude RLT dari breach detection. Tapi Omnichannel PRD tidak tahu tentang RLT. |
| **Group chat lifecycle** | "Group chats cannot be resolved" | **BROKEN dengan TTC.** TTC tidak bisa pernah complete untuk group chat. WA Web Group sudah disabled TTC. Tapi group chat channel lain (WhatsApp API, Instagram) belum punya rule. |

**Broken Requirements:**
1. **Group chat + TTC infinite:** Cross-analysis L2 sudah mendeteksi ini. WA Web Group disable TTC. Tapi group chat di channel lain tidak didefinisikan. Omnichannel bilang "cannot be resolved" → TTC infinite.
2. **RLT tidak terintegrasi** ke monitoring SLA. Perlu ditambahkan exclusion rule.

**Unclear:**
- Apakah SLA breach monitoring hanya untuk FRT dan TTC, atau nanti termasuk RLT dan Wait Time?
- Untuk group chat yang tidak bisa resolve, apakah FRT tetap berjalan? (Seharusnya ya, FRT untuk inbound → first reply masih valid).

---

### 10. Multiple Ticket from Single Bubble Chat PRD (`PRD Inbox Conversation - multiple ticket from single bubble chat.md`)

**Referensi SLA:**
- "Tickets created reference the same selected message as context. Changing ticket state machine and SLA rules."
- FR-026: "System MUST not change the ticket SLA model and ticket state machine in this feature scope"
- "Reference behavior to keep unchanged: Ticket state machine, SLA tracking, and audit trail remain unchanged in this feature scope"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Multiple Ticket PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA unchanged** | Ticket SLA model tidak berubah | **ALIGNED.** PRD ini eksplisit tidak mengubah SLA. Tapi Multiple Ticket membuat satu conversation bisa memiliki >1 ticket. RLT inherit ke semua ticket? |
| **Multiple tickets → multiple metric inheritance** | Satu conversation dengan 2+ tickets | **BROKEN.** RLT PRD bilang linked ticket menampilkan inherited RLT. Tapi jika satu conversation punya 2+ tickets, apakah RLT di-duplicate ke semua ticket? Atau hanya ke ticket pertama? |

**Broken Requirements:**
1. **RLT inheritance cardinality:** Satu conversation → banyak tickets. RTL source yang mana? Jika semua ticket mewarisi RLT yang sama, itu duplikasi data. Jika hanya ticket pertama, ticket lain tidak punya response metric.

**Unclear:**
- Apakah RLT harus inherit ke semua ticket yang linked ke conversation yang sama?
- Jika ya, apakah RLT di semua ticket nilainya identik?

---

### 11. Reply via Email / Transcript PRD (`PRD Transcript email\PRD Inbox Conversation - reply via email.md`)

**Referensi SLA:**
- FR-042–FR-046: SLA rules untuk Email conversation: "Start Email conversation SLA based on Email channel SLA rules", "MUST NOT restart Live Chat SLA after Email reply", "MUST attribute Email response events to Email conversation"
- EC-012: "Email channel SLA is not configured → Apply workspace default Email SLA if available"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Email Transcript PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Dual conversation** | Email reply = new Email conversation + keep Live Chat resolved | **IMPACT.** Dua conversation, dua SLA lifecycle. Tapi RLT dari Live Chat original tetap ada. Email conversation punya RLT sendiri. |
| **First reply attribution** | "MUST attribute Email response events to the Email conversation" | **ALIGNED.** Berarti first reply untuk Live Chat tetap dari Live Chat agent, bukan dari Email. Tapi perlu dipastikan Email reply tidak menghentikan RLT Live Chat. |
| **Channel SLA** | Email channel SLA rules → FRT/TTC per channel | **ALIGNED** dengan Conversation SLA per-channel design. |

**Unclear:**
- Jika customer reply via Email dan agent reply di Email conversation, apakah itu dianggap "first customer-facing reply" untuk Live Chat RLT? Seharusnya tidak, karena Live Chat sudah resolved.
- Tapi di skenario non-resolved: customer kirim Email, agent balas di Email. Live Chat tetap open. Apakah RLT di Live Chat ikut terpengaruh?

---

### 12. Relational Conversation PRD (`PRD Inbox Conversation - relational conversation.md`)

*(Tidak ada referensi SLA eksplisit di grep, tapi relevan secara tidak langsung)*

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Relational PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Primary + Child** | Relational grouping = Primary + Child conversations | **IMPACT ke FRT/TTC/RLT.** Apakah metric dihitung per conversation individual atau di-aggregate di level Primary? |
| **Matching** | Matching berdasarkan Custom Attributes | **RISK.** Jika attribute berubah, grouping bubar. Apa yang terjadi dengan metric history? |

**Unclear:**
- Apakah FRT/TTC/RLT untuk child conversation dihitung dari inbound child atau dari inbound primary?
- Jika child dibuat setelah primary, apakah child FRT start dari inbound child atau dari primary inbound?

---

### 13. Broadcast PRD (`PRD Broadcast\*`)

*(Relevan untuk scenario Broadcast → SLA pause/resume)*

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Broadcast PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Broadcast → inbound** | Broadcast dikirim, customer reply = inbound | **SCENARIO.** Untuk SLA Agent-Centric mode: saat broadcast dikirim, FRT/TTC pause. Saat customer reply, resume. Tapi RLT & Wait Time belum didefinisikan untuk broadcast scenario. |

**Unclear:**
- Untuk broadcast scenario, apakah RLT dihitung dari assignment (yang mungkin terjadi setelah customer reply) atau dari broadcast send time?

---

## Ringkasan Broken Requirements

| # | Broken Requirement | PRD Source | Terkait Metric |
|---|---|---|---|
| BR-01 | FRT hanya muncul saat Unassigned (AC-02) | Conversation Detail | FRT |
| BR-02 | Hold pause SLA (Room) vs No SLA pause (Snooze) — kontradiksi | Room, Snooze | FRT, TTC, RLT Adjusted |
| BR-03 | Snooze "No SLA pause" vs RLT Adjusted "if policy supports Snooze" | Snooze, RLT | RLT Adjusted |
| BR-04 | Dual SLA menjadi Triple SLA dengan hadirnya RLT inherit | Create Ticket, RLT | RLT, FRT, TTC |
| BR-05 | SLA color threshold tidak define metric mana (FRT/TTC) | Chat List | FRT, TTC |
| BR-06 | Group chat TTC infinite (cannot resolve + TTC supported) | Omnichannel, SLA | TTC |
| BR-07 | Move → SLA stop, tapi RLT/Wait Time behavior undefined | Session, Reassign | RLT, Wait Time |
| BR-08 | Reopen: 3 definisi berbeda (Session=new, Room=reopen, Reassign=modal) | Session, Room, Reassign | FRT, TTC, RLT, Wait Time |
| BR-09 | RLT inherit ke multiple tickets dari satu conversation | Multiple Ticket, RLT | RLT |
| BR-10 | Bot auto-reply / welcome message status sebagai first reply undefined | Room, Auto-Reply | FRT, RLT |
| BR-11 | Pause policy mismatch: Ticket pause FRT+TTC vs Conversation pause TTC only | Create Ticket, SLA | FRT, TTC |
| BR-12 | Queue timeout → return → re-assign: Wait Time restart atau akumulasi? | Agent Pull | Wait Time |
| BR-13 | Relational grouping: metric individual vs aggregate undefined | Relational | FRT, TTC, RLT, Wait Time |
| BR-14 | Email transcript: dual conversation, dual metric lifecycle, RLT attribution undefined | Reply via Email | RLT, FRT |

## Ketentuan yang Belum Jelas

### A. Waktu (Timestamps)

| # | Pertanyaan | Relevan ke |
|---|---|---|
| A-01 | `First Customer Inbound Message Time` untuk reopened conversation: pakai inbound pertama atau inbound setelah reopen? | FRT, Wait Time |
| A-02 | `First Customer Inbound Message Time` untuk email transcript: inbound di email baru atau inbound asli live chat? | FRT, Wait Time |
| A-03 | `First Agent Assignment Time` untuk auto-assign via Agent Pull: saat klik "Get Conversation" atau saat sistem mencatat assign? | RLT, Wait Time |
| A-04 | `First Agent Assignment Time` untuk round robin: waktu round robin menugaskan atau waktu sistem mencatat? | RLT, Wait Time |
| A-05 | `First successful customer-facing reply` untuk email reply: dihitung dari Email conversation atau Live Chat? | FRT, RLT |
| A-06 | Multiple inbound sebelum assignment: T1 pakai inbound pertama atau inbound yang memicu assignment? | FRT, Wait Time |

### B. Pause / Resume

| # | Pertanyaan | Relevan ke |
|---|---|---|
| B-01 | Hold pause RLT Adjusted? | RLT Adjusted |
| B-02 | Snooze pause RLT Adjusted? | RLT Adjusted |
| B-03 | AUX pause RLT Adjusted? | RLT Adjusted |
| B-04 | Apakah resume dari Hold juga meresume RLT timer? | RLT |
| B-05 | Apakah auto-unsnooze oleh inbound juga meresume RLT/FRT/TTC timer? | FRT, TTC, RLT |
| B-06 | Waiting on Customer pause FRT untuk Conversation atau tidak? (SLA: tidak, Ticket PRD: ya) | FRT |

### C. Reopen / Move

| # | Pertanyaan | Relevan ke |
|---|---|---|
| C-01 | Reopen conversation: FRT/RLT new cycle atau lanjut? | FRT, RLT |
| C-02 | Move ke team lain: RLT & Wait Time di-freeze atau di-reset? | RLT, Wait Time |
| C-03 | Move-and-reopen: RLT dari first assignment (old team) atau dari new assignment (new team)? | RLT |
| C-04 | Queue timeout + return + re-assign: Wait Time restart atau cumulative? | Wait Time |

### D. Multi-entity

| # | Pertanyaan | Relevan ke |
|---|---|---|
| D-01 | Satu conversation → multiple tickets: RLT inherit ke semua ticket atau hanya ticket pertama? | RLT |
| D-02 | Satu ticket → multiple linked conversations: metric source yang dipakai yang mana? | RLT, FRT, TTC |
| D-03 | Relational Primary + Child: FRT/RLT individual per conversation atau aggregate? | FRT, RLT |
| D-04 | Group chat non-resolvable: FRT tetap berjalan? TTC disabled untuk semua channel group atau hanya WA Web Group? | FRT, TTC |

### E. Definisi & Enum

| # | Pertanyaan | Relevan ke |
|---|---|---|
| E-01 | Apa enum `Metric Status`? (running, completed, not_applicable, missing_data, invalid_sequence?) | RLT, Wait Time |
| E-02 | Apa enum `Metric Quality Flags`? | RLT |
| E-03 | Apakah bot auto-reply dihitung sebagai first customer-facing reply? | FRT, RLT |
| E-04 | Apakah welcome message dihitung sebagai first customer-facing reply? | FRT, RLT |
| E-05 | Apakah macro / quick reply dihitung sebagai first customer-facing reply? | FRT, RLT |
| E-06 | Apakah bulk reply dihitung sebagai first customer-facing reply? | FRT, RLT |

### F. UI & Reporting

| # | Pertanyaan | Relevan ke |
|---|---|---|
| F-01 | Dimana RLT live timer ditempatkan di Conversation Detail? | RLT |
| F-02 | Dimana Wait Time display di Conversation Detail? | Wait Time |
| F-03 | Apakah Chat List menampilkan timer RLT/Wait Time atau hanya FRT/TTC? | Chat List |
| F-04 | Mapping kolom offline report: `First Reply Time` = FRT atau RLT? `Customer First Wait` = Wait Time? | Offline Report |
| F-05 | Apakah SLA color di Chat List berdasarkan metric mana? FRT, TTC, atau overdue? | Chat List |
| F-06 | Apakah filter "SLA Overdue" juga mencakup conversation tanpa threshold (RLT Phase 1)? | Chat List |

---

## FE Implementation vs PRD: Gap Analysis v2.5.0

### Sumber: `apps/omnichannel/` dari repo `omnichannel-satuinbox-fe` (v2.5.0)

### 1. Conversation SLAMetrics — Data Model Aktual (v2.5.0)

```typescript
interface ConversationSLAMetrics {
  // === Timestamp Events ===
  firstCustomerMessageAt: string            // ✅ T1 — first customer message
  frtCountingStartAt: string                // ✅ FRT start (seharusnya = firstCustomerMessageAt setelah revisi)
  firstAgentAssignmentAt?: string | null    // ✅ [NEW] T2 — first agent assignment
  firstAgentReplyAt: string | null          // ✅ T3 — first agent reply
  conversationCreatedAt: string             // ✅ Conversation creation
  conversationClosedAt: string | null       // ✅ T4 — close time

  // === FRT ===
  frtMs: number | null                      // ✅ FRT duration (ms)
  frtSnapshotConfiguredMs: number           // ✅ Configured FRT threshold
  slaFrtSuccess: boolean | null             // ✅ FRT SLA met?

  // === TTC ===
  ttcMs: number | null                      // ✅ TTC duration (ms)
  ttcSnapshotConfiguredMs: number           // ✅ Configured TTC threshold
  slaTtcSuccess: boolean | null             // ✅ TTC SLA met?

  // === RLT & Wait Time [NEW in v2.5.0] ===
  waitTimeInQueueMs?: number | null         // ✅ [NEW] Wait Time (ms)
  rltMs?: number | null                     // ✅ [NEW] RLT (ms)
  firstAssigneeId?: string | null           // ✅ [NEW] first assignee user ID
  firstResponderId?: string | null          // ✅ [NEW] first responder user ID

  // === Pause / Office Hours ===
  officeHoursSnapshot: OfficeHoursSnapshot | null
  isFrtPaused?: boolean
  isTtcPaused?: boolean
  pausedIntervals?: PausedInterval[]
  totalPausedMs?: number
  totalFrtPausedMs?: number
  totalTtcPausedMs?: number

  // ❌ MASIH BELUM ADA:
  // - metricStatus (enum running/completed/etc)
  // - metricQualityFlags
}
```

**Status v2.5.0:** FRT ✅, TTC ✅, RLT ✅ **(BARU)**, Wait Time ✅ **(BARU)**

**Kesimpulan data model:** FRT, TTC, RLT, Wait Time semua sudah punya field di data model. Dengan `firstAgentAssignmentAt` sebagai T2, formulasinya konsisten:
- `Wait Time = frtCountingStartAt → firstAgentAssignmentAt` (inbound → assignment)
- `RLT = firstAgentAssignmentAt → firstAgentReplyAt` (assignment → reply)
- `FRT = frtCountingStartAt → firstAgentReplyAt` (inbound → reply) = Wait Time + RLT

---

### 2. Conversation Detail — FRT/TTC/RLT/Wait Time Display (`ConversationAsigneeContent.tsx`)

| Aspek | Implementasi v2.5.0 | PRD Requirement | Gap |
|---|---|---|---|
| **FRT countdown** | ✅ Real-time via `RealTimeSLABadge`, 1s tick, `officeHoursSnapshot: null` (wall-clock) | FRT harus visible | ✅ |
| **FRT success badge** | ✅ `outlineSuccess` / `destructive` | ✅ | ✅ |
| **TTC countdown** | ✅ Real-time via `RealTimeSLABadge`, 1s tick, office-hours-aware | TTC countdown until SLA resolution | ✅ |
| **TTC success badge** | ✅ `outlineSuccess` / `destructive` | ✅ | ✅ |
| **Paused state** | ✅ Grey badge + `IconPlayerPauseFilled` | ✅ | ✅ |
| **RLT — resolved** | ✅ `buildRltItem` — `Badge variant="secondary"` + `formatSLATime(rltMs)` | RLT PRD: displayed in Detail | ✅ **BARU** |
| **RLT — pending** | ✅ `ElapsedBusinessMetricBadge` — **office-hours-aware** live timer | RLT PRD: live timer | ✅ **BARU** |
| **Wait Time — resolved** | ✅ `buildWaitTimeItem` — `Badge variant="secondary"` + `formatSLATime(waitTimeInQueueMs)` | RLT PRD: displayed in Detail | ✅ **BARU** |
| **Wait Time — pending (unassigned)** | ✅ `ElapsedMetricBadge` — **wall-clock** live timer dari `firstCustomerMessageAt` | RLT PRD: live timer | ✅ **BARU** |
| **Tooltip per metric** | ✅ `buildMetricLabel` — tooltip dengan title + description | ✅ Good UX | ✅ **BARU** |
| **Group chat SLA** | ⚠️ Masih disembunyikan total (`isGroup ? [] : slaItems`) | FRT harus tetap jalan untuk group | ❌ **MASIH MISSING** |
| **FRT office hours** | ✅ `{ ...metrics, officeHoursSnapshot: null }` — FRT wall-clock | ✅ Sesuai PRD: WoC tidak pause FRT | ✅ |

**Kesimpulan:** RLT dan Wait Time **SUDAH diimplementasi** di v2.5.0. Formula terlihat konsisten dengan analisis PRD.

---

### 3. Chat List — SLA Display (`ConversationCard.tsx`)

| Aspek | Implementasi v2.5.0 | PRD Requirement | Gap |
|---|---|---|---|
| **SLA indicator** | ✅ `DurationBadge` — elapsed time sejak `createdAt` | ✅ Ada timer | ⚠️ Masih elapsed dari creation, bukan remaining FRT/TTC budget |
| **SLA color** | ❌ Hanya yellow badge (`bg-yellow-100 text-yellow-600`) | **Green/Yellow/Red** (US-14) | ❌ **MASIH MISSING** |
| **Hold indicator** | ❌ Tidak ada | US-13: Hold icon + tooltip | ❌ **MASIH MISSING** |
| **Filter SLA Overdue/Near Due** | ❌ Tidak ada | US-11: Advanced Filters include SLA | ❌ **MASIH MISSING** |

---

### 4. Conversation Room Header (`ConversationChatRoomHeader.tsx`)

| Aspek | Implementasi v2.5.0 | PRD Requirement | Gap |
|---|---|---|---|
| **Close** | ✅ | ✅ | ✅ |
| **Reopen** | ✅ | ✅ | ✅ |
| **Screenshot** | ✅ | ✅ | ✅ |
| **Ticket creation** | ✅ | ✅ | ✅ |
| **Hold/Resume** | ❌ Tidak ada | Room PRD P1 | ❌ **MASIH MISSING** |
| **Reminder** | ❌ Tidak ada | Room PRD | ❌ **MASIH MISSING** |
| **More menu (alias, pin)** | ❌ Tidak ada | Room PRD | ❌ **MASIH MISSING** |
| **SLA countdown di header** | ❌ Tidak ada | Room PRD | ❌ **MASIH MISSING** |

---

### 5. SLA Color Threshold (`getDueDateBadgeVariant`)

| Aspek | FE v2.5.0 | PRD Chat List US-14 | Gap |
|---|---|---|---|
| **Threshold basis** | Absolute time (ms) | **Percentage** of remaining SLA budget | ❌ **Konsep berbeda** |
| **Green (>50%)** | ❌ Tidak ada | ✅ | ❌ |
| **Yellow (≤50% & >10%)** | ⚠️ `warning` = < 1 hari | ✅ | ❌ |
| **Red (≤10% / overdue)** | ⚠️ `destructive` = < 10 menit | ✅ | ❌ |
| **Info (blue, >1 hari)** | ✅ Ada | Tidak di PRD | ⚠️ FE ekstra |

---

### 6. Ringkasan Perubahan v2.5.0 (dari versi sebelumnya)

| Sebelumnya | v2.5.0 | Status |
|---|---|---|
| ❌ RLT tidak ada | ✅ `rltMs`, `firstAgentAssignmentAt`, `ElapsedBusinessMetricBadge` | ✅ **FIXED** |
| ❌ Wait Time tidak ada | ✅ `waitTimeInQueueMs`, `ElapsedMetricBadge` | ✅ **FIXED** |
| ❓ FRT start source tidak jelas | 🆕 `firstAgentAssignmentAt` sebagai field terpisah → `frtCountingStartAt` kemungkinan inbound | ✅ **TERKLARIFIKASI** (dengan asumsi FRT = end-to-end) |
| ❌ Group chat SLA (FRT) | Masih disembunyikan | ❌ **BELUM FIXED** |
| ❌ Chat List SLA color | Masih yellow only | ❌ **BELUM FIXED** |
| ❌ Hold/Resume | Masih tidak ada | ❌ **BELUM FIXED** |
| ❌ SLA color threshold | Masih absolute time | ❌ **BELUM FIXED** |
| ❌ Snooze Conversation | Masih tidak ada | ❌ **BELUM FIXED** (undeveloped) |

---

### 7. Remaining Gap (v2.5.0)

| # | Gap | Severity | File |
|---|---|---|---|
| G-01 | **Chat List SLA color** — masih yellow badge, belum green/yellow/red threshold | 🟡 MEDIUM | `ConversationCard.tsx` |
| G-02 | **Chat List SLA metric** — masih elapsed dari `createdAt`, bukan remaining budget | 🟡 MEDIUM | `ConversationCard.tsx` |
| G-03 | **Hold/Resume** — tidak ada di Room Header | 🟡 MEDIUM | `ConversationChatRoomHeader.tsx` |
| G-04 | **Snooze Conversation** — belum diimplementasi | 🟡 MEDIUM | (undeveloped) |
| G-05 | **Reminder di Room Header** — tidak ada | 🟢 LOW | `ConversationChatRoomHeader.tsx` |
| G-06 | **SLA countdown di Room Header** — tidak ada | 🟢 LOW | `ConversationChatRoomHeader.tsx` |
| G-07 | **Group chat FRT** — disembunyikan total, padahal FRT harus tetap jalan | 🟢 LOW | `ConversationAsigneeContent.tsx` |
| G-08 | **SLA color threshold** — absolute time vs percentage mismatch | 🟡 MEDIUM | `getDueDateBadgeVariant` |
| G-09 | **Filter SLA Overdue/Near Due** — tidak ada di Chat List | 🟡 MEDIUM | `ConversationChatListHeader.tsx` |
| G-10 | **Metric status & quality flags** — belum ada enum di data model | 🟢 LOW | `ConversationSLAMetrics` |

---

## QA Recommendations (Update dari Cross-PRD Interconnection)

### Prioritas P0 — Lock Definisi

1. **Lock FRT definition:** Tentukan final: FRT = `working_dur(inbound, first_reply)` atau `working_dur(assignment, first_reply)`. Jika dari inbound, revisi Conversation SLA PRD.
2. **Lock SLA mode:** Agent-Centric (pause/resume) atau Customer-Centric (continuous). Pilihan mode menentukan TTC behavior dan RLT Adjusted.
3. **Lock pause policy final:** Hold pause SLA? Snooze pause SLA? AUX pause SLA? Satu keputusan untuk semua PRD.
4. **Lock FRT visibility di Detail PRD:** Revisi AC-02. FRT harus visible meskipun conversation sudah assigned.

### Prioritas P1 — Resolusi Broken Requirements

5. **Buat "Response Metrics Contract":** Dokumen terpisah dari "SLA Engine Contract" yang mencakup: event source, timestamp source, persistence model, status enum, quality flags, pause adjustment untuk RLT dan Wait Time.
6. **Resolve reopen ambiguity:** Pilih satu definisi reopen untuk Session, Room, dan Reassign PRD. Tentukan dampak ke FRT/TTC/RLT/Wait Time.
7. **Definisikan RLT behavior pada move:** Freeze? Reset? Lanjut? Sama untuk Wait Time.
8. **Definisikan RLT inheritance untuk multiple tickets:** Satu RLT untuk semua linked tickets? Atau per ticket?
9. **Definisikan group chat SLA:** FRT tetap jalan, TTC disabled untuk semua group chat channel.

### Prioritas P2 — Implementasi Detail (v2.5.0 — sudah ter-resolve)

10. ~~**RLT live timer di Detail**~~ ✅ **SELESAI** di v2.5.0 (`buildRltItem`, `ElapsedBusinessMetricBadge`)
11. ~~**Wait Time display di Detail**~~ ✅ **SELESAI** di v2.5.0 (`buildWaitTimeItem`, `ElapsedMetricBadge`)
12. ~~**Backend contract RLT/Wait Time**~~ ✅ **SELESAI** — field `rltMs`, `waitTimeInQueueMs`, `firstAgentAssignmentAt` sudah ada di `ConversationSLAMetrics`

### Prioritas P3 — Implementasi Detail (masih perlu)

13. **Phase 1 assertion:** RLT/Wait Time hanya visible/reporting, belum masuk SLA urgency sorting, dashboard "SLA Hampir Terlewat", SLA color threshold, atau notification engine. (Perlu dipastikan BE tidak mengirim RLT ke SLA engine)
14. **Map kolom export lama** (`First Reply Time` → FRT?, `Customer First Wait` → Wait Time?) sebelum menambah kolom baru RLT.
15. **Label UI linked ticket:** "Conversation Response Metrics", bukan "Ticket SLA".
16. **Buat regression matrix** untuk event sequence: inbound → unassigned → assigned → first reply → reassigned → moved → snoozed → hold → AUX → reopened → group chat → email transcript → multiple tickets.

### Prioritas P4 — FE-Specific Fixes (v2.5.0 — masih gap)

17. **Chat List SLA:** Ubah `DurationBadge` dari elapsed time (`createdAt`) menjadi remaining FRT/TTC budget dengan warna threshold sesuai PRD US-14 (green/yellow/red).
18. **SLA color threshold:** Sinkronkan `getDueDateBadgeVariant` dengan PRD: Green >50%, Yellow ≤50% & >10%, Red ≤10% atau overdue. Ganti threshold absolute time (10 menit, 1 hari) dengan percentage-based.
19. **Hold/Resume buttons:** Tambahkan ke `ConversationChatRoomHeader.tsx` sesuai Room PRD. Tentukan pause policy untuk FRT/TTC/RLT saat Hold.
20. **SLA countdown di Room Header:** Tambahkan SLA color-coded countdown di header sesuai Room PRD.
21. **Filter SLA Overdue/Near Due:** Tambahkan ke `ConversationChatListHeader.tsx` advanced filters sesuai Chat List PRD US-11.
22. **Group chat FRT:** Jangan sembunyikan SLA untuk group chat. TTC tetap disabled untuk WA Web Group, tapi FRT harus tetap visible.
23. **Konfirmasi `frtCountingStartAt`:** Verifikasi apakah `frtCountingStartAt === firstCustomerMessageAt`. Jika tidak, klarifikasi dengan BE.

---

## Open Questions (Lengkap dari Cross-PRD Interconnection)

### Definisi Dasar

| # | Question | Relevan PRD |
|---|---|---|
| Q01 | Apakah RLT intended sebagai replacement FRT Conversation atau metric tambahan? | Conversation SLA, RLT |
| Q02 | FRT start dari inbound atau assignment? | Conversation SLA |
| Q03 | SLA mode: Agent-Centric (pause/resume) atau Customer-Centric (continuous)? | Semua PRD |
| Q04 | Apakah Hold pause SLA (Room) atau tidak (Snooze)? | Room, Snooze |
| Q05 | Apakah Snooze pause SLA atau tidak? | Snooze, RLT |
| Q06 | Apakah AUX pause FRT? pause TTC? pause RLT Adjusted? | Conversation SLA, RLT |
| Q07 | Apa enum `Metric Status`? (running, completed, not_applicable, missing_data, invalid_sequence, ...) | RLT |
| Q08 | Apa enum `Metric Quality Flags`? | RLT |

### Edge Cases

| # | Question | Relevan |
|---|---|---|
| Q09 | Bot auto-reply = first customer-facing reply? | FRT, RLT |
| Q10 | Welcome message = first customer-facing reply? | FRT, RLT |
| Q11 | Macro / quick reply = first customer-facing reply? | FRT, RLT |
| Q12 | Bulk reply = first customer-facing reply? | FRT, RLT |
| Q13 | Reopened conversation: FRT/RLT/Wait Time new cycle atau lanjut? | FRT, RLT, Wait Time |
| Q14 | Move antar team: RLT & Wait Time di-freeze, di-reset, atau lanjut? | RLT, Wait Time |
| Q15 | Queue timeout → return → re-assign: Wait Time restart atau akumulasi? | Wait Time |
| Q16 | Group chat non-resolvable: FRT tetap jalan? TTC disabled untuk semua channel group? | FRT, TTC |
| Q17 | Satu conversation → multiple tickets: RLT inherit ke semua atau hanya ticket pertama? | RLT |
| Q18 | Satu ticket → multiple linked conversations: metric source yang dipakai yang mana? | RLT |
| Q19 | Relational Primary + Child: FRT/RLT individual per conversation atau aggregate? | FRT, RLT |
| Q20 | Email transcript: email reply jadi first reply untuk Live Chat RLT atau untuk Email RLT? | RLT |

### UI & Reporting

| # | Question | Relevan |
|---|---|---|
| Q21 | Dimana RLT live timer ditempatkan di Conversation Detail? | Detail |
| Q22 | Dimana Wait Time display di Conversation Detail? | Detail |
| Q23 | Apakah Chat List menampilkan timer RLT/Wait Time? | Chat List |
| Q24 | Mapping: `First Reply Time` (existing column) = FRT atau RLT? | Offline Report |
| Q25 | Mapping: `Customer First Wait` (existing column) = Wait Time? | Offline Report |
| Q26 | SLA color threshold di Chat List berdasarkan metric mana? FRT atau TTC? | Chat List |
| Q27 | Filter "SLA Overdue" mencakup RLT Phase 1? (Harusnya tidak) | Chat List |
| Q28 | SLA-aware prioritization (Agent Pull future) pakai metric mana? | Agent Pull |

### FE Implementation v2.5.0 — Resolved

| # | Question | Status |
|---|---|---|
| FE-01 | `frtCountingStartAt` — assignment atau inbound? | ✅ **Terklarisifikasi via data model** — `firstAgentAssignmentAt` adalah field terpisah, jadi `frtCountingStartAt` kemungkinan inbound. Tapi perlu konfirmasi final. |
| FE-07 | RLT dan Wait Time — backend atau frontend? | ✅ **SELESAI** — Backend sudah expose `rltMs`, `waitTimeInQueueMs`, `firstAgentAssignmentAt` di endpoint SLA metrics. |

| # | Question | Relevance |
|---|---|---|
| FE-02 | Kenapa Chat List `DurationBadge` pakai elapsed dari `createdAt`, bukan remaining SLA budget dari FRT/TTC? | Chat List |
| FE-03 | SLA color threshold FE berbeda dengan PRD (absolute time vs percentage). Mana yang benar? | getDueDateBadgeVariant |
| FE-04 | Group chat FRT disembunyikan total. Apakah ini sengaja karena FRT tidak relevan untuk group, atau karena group chat lifecycle undefined? | ConversationAsigneeContent |
| FE-05 | Hold/Resume tidak ada di Room Header. Apakah ini sengaja di-delay atau belum diimplementasi? | ConversationChatRoomHeader |
| FE-06 | Snooze Conversation tidak ada. Sesuai cross-analysis, fitur ini undeveloped. Ada timeline? | Seluruh Snooze |
| FE-08 | Apakah Chat List akan tetap pakai simple elapsed time, atau akan diubah ke SLA budget remaining dengan FRT/TTC threshold warna? | Chat List |
