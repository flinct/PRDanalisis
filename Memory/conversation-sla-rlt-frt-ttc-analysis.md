# Conversation SLA: FRT, TTC, RLT Cross-PRD Analysis

> Analisis mendalam tentang definisi, overlap, dan conflict antara PRD Conversation V2, PRD Ticket SLA, dan PRD Response Metrics.
>
> **Source of Truth:** Conversation V2 (`PRD/Conversationv2/`). V1 (`PRD/Conversation/`) deprecated.
> RLT & Wait Time: V2 file 3 (Response Metrics). SLA: V2 files 8, 9, 10.

---

## Extracted Canonical Rules

### FRT — First Response Time / First Response Due

#### Conversation FRT (dari V2 SLA metrics — files 3, 8, 10)

- FRT adalah SLA metric untuk mengukur waktu sampai agent memberi response pertama ke customer.
- FRT start dari first customer inbound (V2 data model: `frtCountingStartAt` = inbound). BUKAN dari assignment.
- FRT completed saat first agent message yang visible ke customer dikirim.
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

#### Conversation TTC (dari V2 — files 3, 8, 9, 10)

- TTC adalah SLA metric untuk mengukur waktu sampai conversation resolved/closed (`conversationClosedAt`).
- TTC completed saat conversation diset ke `closed`.
- TTC hanya dibuat untuk channel yang support TTC.
- WA Web Group tidak support TTC (V2 Omnichannel v1.1: group chats cannot be resolved).
- Waiting on Customer hanya pause TTC, bukan FRT.
- AUX bisa pause TTC jika AUX counting disabled.
- TTC punya duration per channel.
- TTC punya maksimal 1 reminder per metric per channel.
- TTC reminder/breach bisa dikirim ke supervisor dan current assignee.
- TTC tidak dibuat retroaktif untuk unsupported channel.
- Active TTC cycle memakai snapshot setting saat cycle start.
- **V2 SLA mode belum final:** Agent-Centric (pause/resume TTC) vs Customer-Centric (continuous TTC).

#### Ticket TTC (dari PRD Ticket - SLA ticket.md)

- Ticket TTC start saat ticket dibuat dan masuk non-resolved status.
- TTC completed saat ticket transition ke resolved status.
- TTC tidak trigger reminder atau breach setelah completed.
- Waiting on Customer pause bisa pause TTC jika toggle enabled.
- Ticket reopen membuat SLA cycle baru, termasuk TTC baru.
- Stage SLA terpisah dari TTC tapi ikut pause policy ticket.

---

### RLT — Response Lead Time (dari V2 Response Metrics — file 3)

- RLT adalah tracked metric, bukan SLA threshold di Phase 1 (V2 file 3).
- RLT mengukur staff handling time setelah conversation assigned ke agent.
- Formula: `RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time`
- RLT start dari first assignment timestamp (`firstAgentAssignmentAt`).
- RLT stop saat first successful customer-facing reply dicatat (`firstAgentReplyAt`).
- Internal notes, failed replies, drafts, dan system messages tidak dihitung sebagai first reply.
- Reassignment sebelum first reply tidak reset primary RLT.
- Multi-assignee conversation memakai earliest assignment sebagai T2.
- First responder disimpan sebagai agent yang mengirim first customer-facing reply (`firstResponderId`).
- RLT harus ditampilkan sebagai live timer di Conversation Detail (V2 Detail v2.1 — file 10).
- Linked Ticket Detail menampilkan inherited RLT dari linked conversation (V2 Ticketing — file 14).
- Internal-only ticket tanpa linked customer conversation menampilkan "Tidak berlaku".
- RLT harus disimpan di database: timestamps, raw duration, adjusted duration, status, quality flags.
- RLT Adjusted bisa memakai AUX/Snooze handling hanya jika existing SLA pause policy mendukung.
- Phase 1 tidak punya RLT SLA threshold.
- Phase 1 tidak memicu alert, reminder, breach badge, notification, escalation, atau sound untuk RLT.

### Wait Time in Queue (dari V2 Response Metrics — file 3)

- Wait Time in Queue adalah tracked metric (V2 file 3).
- Formula: `Wait Time in Queue = First Agent Assignment Time - First Customer Inbound Message Time`
- Timer start saat first customer inbound message masuk (`firstCustomerMessageAt`).
- Timer stop saat first agent assignment dicatat (`firstAgentAssignmentAt`).
- Ditampilkan di Conversation Detail (V2 Detail v2.1 — file 10) dan linked Ticket Detail (V2 Ticketing — file 14).
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

## PRD Interconnection Analysis: RLT/FRT/TTC vs Seluruh Conversation V2

### Metode

Setiap PRD di folder `PRD/Conversationv2/` diperiksa untuk:
- Referensi eksplisit ke FRT, TTC, RLT, SLA, First Response, Time to Close, Response Lead Time, Wait Time
- Implicit business rule yang bersinggungan dengan lifecycle metric (assignment, inbound, reply, reopen, move, hold, snooze, resolve)
- Broken requirement: aturan di PRD lain yang bertentangan dengan definisi FRT/TTC/RLT
- Ketentuan belum jelas: area yang tidak tercakup oleh definisi metric saat ini

---

### 1. Conversation Detail V2 (file 10 — Detail v2.1)

**Referensi SLA:**
- AC-02: `First Response Due countdown appears only when Unassigned`
- Supervisor/Admin dapat melihat SLA information (First Response Due, Time to Close Due)
- Header/timeline menampilkan SLA countdown

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Detail V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **FRT visibility** | FRT countdown hanya muncul saat **Unassigned** | **BROKEN REQUIREMENT.** FRT adalah metric dari inbound ke first reply. Jika FRT hanya muncul saat Unassigned, agent tidak bisa melihat FRT countdown setelah di-assign. FE sudah menampilkan FRT meskipun assigned — V2 Detail AC-02 outdated vs implementasi. |
| **RLT live timer** | V2 Response Metrics (file 3) mensyaratkan live timer di Detail | ✅ **SUDAH di FE** — `buildRltItem`, `ElapsedBusinessMetricBadge` |
| **Wait Time display** | V2 Response Metrics (file 3) mensyaratkan display | ✅ **SUDAH di FE** — `buildWaitTimeItem`, `ElapsedMetricBadge` |
| **Assignment state** | V2 Detail: Assigned/Unassigned via participants | ✅ Aligned dengan FE |

**Broken Requirements:**
1. V2 Detail AC-02 harus direvisi: FRT tidak boleh "hanya muncul saat Unassigned". FE sudah implementasi lebih maju.
2. Butuh klarifikasi: apakah RLT timer muncul di tempat terpisah dari FRT/TTC, atau menggantikan FRT?

**Unclear:**
- Apakah RLT timer muncul di tempat terpisah dari FRT/TTC, atau menggantikan FRT?
- Apakah Wait Time muncul sebagai label statis atau live timer juga? (FE: live timer ✅)

---

### 2. Conversation Room V2 (file 9 — Room v1.1)

**Referensi SLA:**
- Header: "SLA countdown: Color-coded, pauses on Hold"
- P1 user story: "Resume restores SLA timer"
- Automation: bot auto-reply, welcome message

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Room V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Hold → SLA pause** | Hold pauses SLA countdown, Resume restores | **FRAGMENTASI.** V2 Room klaim Hold pause SLA. Tapi V2 Snooze (file 16) bilang "No SLA pause changes". V2 RLT Adjusted (file 3) bilang tergantung existing policy. **3-way conflict unresolved.** |
| **Resume → SLA restore** | Resume restores SLA timer | **ALIGNED** dengan Agent-Centric mode |
| **Reminder modal** | One-time / recurring reminder | **POTENSI DUPLIKASI** dengan SLA reminder |
| **Auto-reply / welcome message** | Bot auto-reply outside hours, welcome message during hours | V2 Auto-Reply (file 1, FR-048): auto-reply tidak dihitung sebagai SLA response |

**Broken Requirements:**
1. V2 Room mengasumsikan SLA pause pada Hold. Tapi V2 Snooze (file 16) tidak sinkron. **3-way conflict unresolved.**
2. Bot auto-reply / welcome message: V2 Auto-Reply (file 1) sudah define exclusion.

**Unclear:**
- Apakah "SLA countdown" di Room merujuk ke FRT, TTC, atau keduanya?
- Apakah Hold pause juga RLT Adjusted?
- Apakah resume setelah Hold juga meresume RLT timer?

---

### 3. Snooze Conversation V2 (file 16 — Snooze v1.0)

**Referensi SLA:**
- Out of Scope: "SLA pause policy changes"
- Limitation: "No SLA pause changes. Snoozed conversations may still be considered in SLA calculations depending on existing SLA policy."
- Risk: "Hidden conversation causes missed inbound if auto-unsnooze fails → SLA and customer experience risk"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Snooze V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA pause** | "No SLA pause changes" — eksplisit | **BROKEN dengan V2 Room (file 9).** Room bilang Hold pause SLA. Snooze bilang tidak ada pause. |
| **RLT Adjusted** | N/A | **BROKEN dengan V2 Response Metrics (file 3).** RLT Adjusted menyebut Snooze sebagai mekanisme pause potensial. Tapi Snooze V2 secara eksplisit tidak ada SLA pause. **Kontradiksi langsung.** |
| **Auto-unsnooze** | Inbound customer message → auto-unsnooze | **ALIGNED.** |
| **Wait Time** | N/A | **MISSING.** Apakah snooze mempengaruhi Wait Time? |

**Broken Requirements:**
1. **V2 Room Hold vs V2 Snooze:** Dua mekanisme "agent pause" berbeda. Satu pause SLA, satu tidak.
2. **V2 RLT Adjusted vs V2 Snooze:** Kontradiksi langsung.

**Unclear:**
- Jika conversation di-snooze sebelum first reply, apakah RLT clock tetap berjalan?
- Apakah auto-unsnooze oleh inbound message juga "meresume" RLT timer?

---

### 4. Chat Sessions V2 (file 12 — Sessions v1.1)

**Referensi SLA:**
- FR-007: "System MUST carry over SLA across ownership changes and MUST NOT reset timers on reassign/unassign"
- FR-016: "On move, assignee MUST reset to Unassigned and SLA MUST stop immediately"
- FR-005: "Group metadata updates MUST NOT alter session state/ownership/SLA"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Sessions V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA carry over** | SLA tidak reset pada reassign/unassign | **ALIGNED dengan RLT.** RLT juga tidak reset primary RLT pada reassignment sebelum first reply. |
| **SLA stop on move** | SLA stop saat conversation di-move ke team lain | **BROKEN dengan RLT persistence.** Jika SLA stop, apakah RLT juga stop? Tidak didefinisikan. |
| **New session on reopen** | "Resolved → new inbound → new Unassigned session" | **IMPACT ke Wait Time.** Wait Time restart jika reopen bikin new session? |
| **Group chat SLA** | "Group metadata updates MUST NOT alter SLA" | **ALIGNED.** |

**Broken Requirements:**
1. **Move → SLA stop:** Haruskah RLT dan Wait Time juga di-freeze atau di-reset? Tidak didefinisikan.
2. **Session state machine vs FRT start:** Perlu mapping lifecycle session vs lifecycle metric.

**Unclear:**
- Apakah SLA carry over berlaku juga untuk RLT dan Wait Time?
- Untuk reopened session (new Unassigned), apakah Wait Time restart dari 0?

---

### 5. Reassign Account Channel V2 (file 13 — Ownership Decoupling v1.4)

**Referensi SLA:**
- FR-006: "Move resets assignee to Unassigned and stops SLA immediately"
- FR-015: "On reopen in same team, SLA resumes per policy; on move-and-reopen, new SLA timer MAY start"
- Move dialog: "SLA will stop"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Reassign V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA stop on move** | SLA stop immediately | **BROKEN dengan RLT persistence.** RLT & Wait Time sebagai persisted metric harus punya aturan sendiri untuk move. |
| **SLA resume on reopen** | SLA resumes per policy | **BROKEN dengan V2 Sessions (file 12).** Sessions bilang reopen = new session. Reassign bilang reopen = resume. |
| **Assignee reset** | Assignee → Unassigned setelah move | **IMPACT.** Assignment timestamp pertama (T2) tetap ada untuk RLT. Move tidak mengubah inbound timestamp (T1). |

**Broken Requirements:**
1. **Reopen behavior:** Tiga V2 PRD (Sessions file 12, Room file 9, Reassign file 13) punya tiga definisi reopen berbeda.
2. **SLA resume vs new SLA cycle:** Reassign bilang MAY start new SLA timer. Ticket SLA bilang reopen = new cycle.

**Unclear:**
- Apakah RLT & Wait Time ikut di-freeze saat move, atau tetap menyimpan nilai hingga close?
- Jika move-and-reopen terjadi, apakah RLT dihitung dari first assignment (team lama) atau dari assignment baru (team baru)?

---

### 6. Ticketing V2 (file 14 — Ticketing V2)

**Referensi SLA:**
- "Dual SLA tracking (Chat SLA & Ticket SLA)"
- SLA Rules: SLA runs only when agent holds ball (Submitted/In Progress), pauses on Waiting on Customer, stops on Resolved, reopened = new countdown

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Ticketing V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Dual SLA tracking** | Chat SLA dan Ticket SLA independen | **BROKEN oleh RLT.** V2 Response Metrics (file 3) bilang linked ticket menampilkan inherited RLT dari conversation. Ini menambah "third metric family". |
| **Chat SLA** | Tracked independently dari Ticket SLA | **ALIGNED.** RLT adalah bagian dari Chat/Conversation metric. |
| **Ticket SLA pause** | Pause on Waiting on Customer, stop on Resolved | **DIFFERENT** dari Conversation SLA yang hanya pause TTC pada WoC. |

**Broken Requirements:**
1. **Dual SLA menjadi Triple SLA:** Chat SLA + Ticket SLA + Inherited Response Metrics.
2. **Pause policy mismatch:** Ticket SLA pause FRT+TTC saat WoC. Conversation SLA hanya pause TTC.

**Unclear:**
- Jika ticket dibuat dari conversation sebelum first reply terjadi, apakah RLT tetap running?
- Ticket reopened = new SLA cycle. Apakah RLT juga new cycle atau tetap dari conversation original?

---

### 7. Chat List V2 (file 8 — Chat List v1.1)

**Referensi SLA:**
- US-14: "SLA countdown with colors: Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue). Configurable via Settings"
- Hold indicator (icon + tooltip)
- Sorting: Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Chat List V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA color threshold** | Green/Yellow/Red berdasarkan % sisa waktu | **MISSING definisi metric.** Threshold untuk FRT atau TTC? Tidak didefinisikan. |
| **Filter SLA** | Filter Overdue / Near Due | **RISK dengan RLT.** RLT Phase 1 tidak punya threshold/breach. |
| **Sort by SLA** | Sorting options: SLA Urgency | **RISK.** Jika RLT tidak boleh trigger alert, apakah RLT boleh mempengaruhi SLA Urgency sort? |
| **Hold indicator** | Hold icon + tooltip | **HOLD vs SLA.** V2 Room bilang Hold pause SLA. V2 Snooze bilang tidak ada pause. |

**Broken Requirements:**
1. **SLA color metric undefined:** V2 Chat List define threshold tapi tidak bilang metric mana.
2. **Hold ↔ Snooze ambiguity:** Tiga mekanisme berbeda untuk "agent tidak available".

**Unclear:**
- Apakah warna SLA di Chat List berdasarkan FRT, TTC, atau overdue?
- Jika RLT Phase 1 tidak punya threshold, apakah Chat List tetap menampilkan timer RLT/Wait Time?
- Apakah filter "SLA Overdue" juga mencakup conversation yang RLT-nya overdue? Harusnya tidak.

---

### 8. Agent Pull V2 (file 7 — Agent Pull v2.1)

**Referensi SLA:**
- Future: "SLA-aware prioritization (push nearing SLA to top of queue)"
- "Maintain SLA with optional timeout: 90% of conversations returned to queue if idle beyond timeout"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Agent Pull V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Queue prioritization** | Future: SLA-aware → push nearing SLA to top | **RISK.** Metric mana yang dipakai? FRT? TTC? RLT? Wait Time? |
| **Timeout return** | Inactive chat returned to queue | **IMPACT ke Wait Time.** Restart atau akumulasi? |
| **Assignment timestamp** | Pull = auto-assign → assignment timestamp | **ALIGNED.** T2 jelas: saat pull. |

**Broken Requirements:**
1. **SLA-aware prioritization metric undefined.**
2. **Timeout → return → re-assign:** RLT non-reset untuk first reply. Tapi Wait Time?

**Unclear:**
- Apakah timeout return to queue menghapus assignment timestamp pertama?
- Jika agent A pull + timeout, lalu agent B pull + reply, apakah RLT agent A = 0?

---

### 9. Omnichannel V2 (file 4 — Omnichannel v1.1)

**Referensi SLA:**
- "SLA-compliance monitoring"
- OKR: "≥95% SLA breaches flagged in real-time"
- Success metric: "SLA Breach Detection Accuracy: 100%"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Omnichannel V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA breach monitoring** | 100% breach detection accuracy | **RISK.** RLT Phase 1 harus exclude dari breach detection. |
| **Group chat lifecycle** | "Group chats cannot be resolved" | **BROKEN dengan TTC.** TTC tidak bisa complete untuk group chat. |

**Broken Requirements:**
1. **Group chat + TTC infinite:** V2 Omnichannel bilang "cannot be resolved" → TTC infinite.
2. **RLT tidak terintegrasi** ke monitoring SLA.

**Unclear:**
- Apakah SLA breach monitoring hanya untuk FRT dan TTC, atau nanti termasuk RLT dan Wait Time?
- Untuk group chat yang tidak bisa resolve, apakah FRT tetap berjalan?

---

### 10. Multi-Ticket Drafts V2 (file 18 — Multi-Ticket v0.1)

**Referensi SLA:**
- FR-026: "System MUST not change the ticket SLA model and ticket state machine in this feature scope"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Multi-Ticket V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **SLA unchanged** | Ticket SLA model tidak berubah | **ALIGNED.** |
| **Multiple tickets → metric inheritance** | Satu conversation dengan 2+ tickets | **BROKEN.** V2 Response Metrics bilang linked ticket menampilkan inherited RLT. Satu conversation punya 2+ tickets — RLT di-duplicate ke semua? |

**Broken Requirements:**
1. **RLT inheritance cardinality:** Satu conversation → banyak tickets. Semua ticket dapat RLT yang sama? Hanya ticket pertama?

**Unclear:**
- Apakah RLT harus inherit ke semua ticket yang linked ke conversation yang sama?
- Jika ya, apakah RLT di semua ticket nilainya identik?

---

### 11. Live Chat Transcript Reply via Email V2 (file 20 — Transcript v1.0)

**Referensi SLA:**
- FR-042–FR-046: SLA rules untuk Email conversation: "Start Email conversation SLA based on Email channel SLA rules", "MUST NOT restart Live Chat SLA after Email reply"

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Transcript V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Dual conversation** | Email reply = new Email conversation + keep Live Chat resolved | **IMPACT.** Dua conversation, dua SLA lifecycle. RLT dari Live Chat original tetap ada. |
| **First reply attribution** | "MUST attribute Email response events to the Email conversation" | **ALIGNED.** |
| **Channel SLA** | Email channel SLA rules → FRT/TTC per channel | **ALIGNED.** |

**Unclear:**
- Jika customer reply via Email dan agent reply di Email conversation, apakah itu dianggap "first customer-facing reply" untuk Live Chat RLT? Seharusnya tidak.

---

### 12. Relational Conversation V2 (file 19 — Related Conversations v1.0)

*(Tidak ada referensi SLA eksplisit, tapi relevan secara tidak langsung)*

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Relational V2 | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Primary + Child** | Relational grouping = Primary + Child | **IMPACT.** Apakah metric dihitung individual atau aggregate di level Primary? |
| **Matching** | Matching berdasarkan Custom Attributes & Properties | **RISK.** Attribute berubah → grouping bubar → metric history? |

**Unclear:**
- Apakah FRT/TTC/RLT untuk child conversation dihitung dari inbound child atau dari inbound primary?
- Jika child dibuat setelah primary, apakah child FRT start dari inbound child atau dari primary inbound?

---

### 13. Broadcast PRD (`PRD/Broadcast`)

*(Relevan untuk scenario Broadcast → SLA pause/resume)*

**Interkoneksi dengan RLT/FRT/TTC:**

| Aspek | Broadcast PRD | Konflik dengan FRT/TTC/RLT |
|---|---|---|
| **Broadcast → inbound** | Broadcast dikirim, customer reply = inbound | **SCENARIO.** Untuk Agent-Centric mode: saat broadcast dikirim, FRT/TTC pause. RLT & Wait Time belum didefinisikan untuk broadcast scenario. |

**Unclear:**
- Untuk broadcast scenario, apakah RLT dihitung dari assignment (setelah customer reply) atau dari broadcast send time?

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

## FE Implementation vs V2: Gap Analysis v2.5.0

### Sumber: `apps/omnichannel/` dari repo `omnichannel-satuinbox-fe` (v2.5.0)
### PRD Source: V2 (`PRD/Conversationv2/`)

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

| Aspek | Implementasi v2.5.0 | V2 Requirement | Gap |
|---|---|---|---|
| **FRT countdown** | ✅ Real-time via `RealTimeSLABadge`, 1s tick, `officeHoursSnapshot: null` (wall-clock) | V2 Detail (file 10): FRT harus visible | ✅ |
| **FRT success badge** | ✅ `outlineSuccess` / `destructive` | ✅ | ✅ |
| **TTC countdown** | ✅ Real-time via `RealTimeSLABadge`, 1s tick, office-hours-aware | V2 Detail: TTC countdown | ✅ |
| **TTC success badge** | ✅ `outlineSuccess` / `destructive` | ✅ | ✅ |
| **Paused state** | ✅ Grey badge + `IconPlayerPauseFilled` | ✅ | ✅ |
| **RLT — resolved** | ✅ `buildRltItem` — `Badge variant="secondary"` + `formatSLATime(rltMs)` | V2 Response Metrics (file 3): displayed in Detail | ✅ **SESUAI V2** |
| **RLT — pending** | ✅ `ElapsedBusinessMetricBadge` — **office-hours-aware** live timer | V2 Response Metrics (file 3): live timer | ✅ **SESUAI V2** |
| **Wait Time — resolved** | ✅ `buildWaitTimeItem` — `Badge variant="secondary"` + `formatSLATime(waitTimeInQueueMs)` | V2 Response Metrics (file 3): displayed in Detail | ✅ **SESUAI V2** |
| **Wait Time — pending (unassigned)** | ✅ `ElapsedMetricBadge` — **wall-clock** live timer dari `firstCustomerMessageAt` | V2 Response Metrics (file 3): live timer | ✅ **SESUAI V2** |
| **Tooltip per metric** | ✅ `buildMetricLabel` — tooltip dengan title + description | ✅ Good UX | ✅ |
| **Group chat SLA** | ⚠️ Masih disembunyikan total (`isGroup ? [] : slaItems`) | V2: FRT harus tetap jalan untuk group | ❌ **MASIH MISSING** |
| **FRT office hours** | ✅ `{ ...metrics, officeHoursSnapshot: null }` — FRT wall-clock | ✅ Sesuai V2: WoC tidak pause FRT | ✅ |

**Kesimpulan:** RLT dan Wait Time **SUDAH diimplementasi** sesuai V2 Response Metrics (file 3).

---

### 3. Chat List — SLA Display (`ConversationCard.tsx`)

| Aspek | Implementasi v2.5.0 | V2 Requirement | Gap |
|---|---|---|---|
| **SLA indicator** | ✅ `DurationBadge` — elapsed time sejak `createdAt` | V2 Chat List (file 8): remaining budget | ⚠️ Masih elapsed, bukan remaining |
| **SLA color** | ❌ Hanya yellow badge | V2 Chat List: **Green/Yellow/Red** (US-14) | ❌ **MASIH MISSING** |
| **Hold indicator** | ❌ Tidak ada | V2 Chat List: Hold icon + tooltip | ❌ **MASIH MISSING** |
| **Filter SLA** | ❌ Tidak ada | V2 Chat List: Filter Overdue/Near Due | ❌ **MASIH MISSING** |

---

### 4. Conversation Room Header (`ConversationChatRoomHeader.tsx`)

| Aspek | Implementasi v2.5.0 | V2 Requirement | Gap |
|---|---|---|---|
| **Close** | ✅ | V2 Room (file 9): ✅ | ✅ |
| **Reopen** | ✅ | V2 Room: ✅ | ✅ |
| **Screenshot** | ✅ | V2 Room: ✅ | ✅ |
| **Ticket creation** | ✅ | V2 Ticketing (file 14): ✅ | ✅ |
| **Hold/Resume** | ❌ Tidak ada | V2 Room v1.1 P1 | ❌ **MASIH MISSING** |
| **Reminder** | ❌ Tidak ada | V2 Room v1.1 | ❌ **MASIH MISSING** |
| **SLA countdown** | ❌ Tidak ada | V2 Room v1.1: SLA countdown in header | ❌ **MASIH MISSING** |

---

### 5. SLA Color Threshold (`getDueDateBadgeVariant`)

| Aspek | FE v2.5.0 | V2 Chat List US-14 | Gap |
|---|---|---|---|
| **Threshold basis** | Absolute time (ms) | **Percentage** of remaining SLA budget | ❌ **Konsep berbeda** |
| **Green (>50%)** | ❌ Tidak ada | ✅ | ❌ |
| **Yellow (≤50% & >10%)** | ⚠️ `warning` = < 1 hari | ✅ | ❌ |
| **Red (≤10% / overdue)** | ⚠️ `destructive` = < 10 menit | ✅ | ❌ |
| **Info (blue, >1 hari)** | ✅ Ada | Tidak di V2 | ⚠️ FE ekstra |

---

### 6. Ringkasan Perubahan v2.5.0 (vs V2)

| V2 Feature | Sebelumnya | v2.5.0 | Status vs V2 |
|---|---|---|---|
| RLT & Wait Time (V2 file 3) | ❌ Tidak ada | ✅ `rltMs`, `waitTimeInQueueMs` | ✅ **SESUAI V2** |
| `firstAgentAssignmentAt` (V2 file 3) | ❌ Tidak ada | ✅ Field terpisah | ✅ **SESUAI V2** |
| Group chat SLA (FRT) (V2 file 4) | ❌ | Masih disembunyikan | ❌ **BELUM SESUAI** |
| Chat List SLA color (V2 file 8) | ❌ | Masih yellow only | ❌ **BELUM SESUAI** |
| Hold/Resume (V2 file 9) | ❌ | Tidak ada | ❌ **BELUM SESUAI** |
| SLA color threshold (V2 file 8) | ❌ | Absolute time | ❌ **BELUM SESUAI** |
| Snooze (V2 file 16) | ❌ | Tidak ada | ❌ **UNDEVELOPED** |

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
| FE-01 | `frtCountingStartAt` — assignment atau inbound? | ✅ **Terklarisifikasi via data model** — `firstAgentAssignmentAt` adalah field terpisah, jadi `frtCountingStartAt` kemungkinan inbound. Sesuai V2 formula FRT = Wait Time + RLT. |
| FE-07 | RLT dan Wait Time — backend atau frontend? | ✅ **SELESAI** — Backend sudah expose `rltMs`, `waitTimeInQueueMs`, `firstAgentAssignmentAt`. Sesuai V2 Response Metrics (file 3). |

| # | Question | Relevance | V2 Source |
|---|---|---|---|
| FE-02 | Kenapa Chat List `DurationBadge` pakai elapsed dari `createdAt`, bukan remaining SLA budget? | Chat List | V2 Chat List (file 8): remaining budget |
| FE-03 | SLA color threshold FE berbeda dengan V2 (absolute time vs percentage). Mana yang benar? | `getDueDateBadgeVariant` | V2 Chat List (file 8): percentage |
| FE-04 | Group chat FRT disembunyikan total. V2 menyebut FRT harus tetap jalan. | `ConversationAsigneeContent` | V2 Omnichannel (file 4) + SLA |
| FE-05 | Hold/Resume tidak ada di Room Header. Sesuai V2 Room (file 9) P1. | `ConversationChatRoomHeader` | V2 Room (file 9) |
| FE-06 | Snooze Conversation tidak ada. Sesuai V2 Snooze (file 16) — undeveloped. | Seluruh Snooze | V2 Snooze (file 16) |
| FE-08 | Apakah Chat List akan tetap pakai simple elapsed time, atau diubah ke SLA budget remaining? | Chat List | V2 Chat List (file 8) |
