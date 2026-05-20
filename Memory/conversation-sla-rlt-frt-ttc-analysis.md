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

## QA Recommendations

1. **Lock FRT definition:** Minta PM/Engineering konfirmasi apakah FRT start dari first inbound atau first assignment. Jika dari first inbound, PRD Conversation SLA perlu direvisi.
2. **Buat "Response Metrics Contract"** terpisah dari "SLA Engine Contract": event source, timestamp source, persistence model, status enum, quality flags, pause adjustment.
3. **Phase 1 assertion:** RLT/Wait Time hanya visible/reporting, tidak masuk SLA urgency sorting, dashboard "SLA Hampir Terlewat", atau notification engine.
4. **Buat regression matrix** untuk event sequence: inbound → unassigned → assigned → first reply → reassigned → snoozed/hold/AUX → closed/reopened.
5. **Map kolom export lama** (`First Reply Time`, `Customer First Wait`) sebelum menambah kolom baru RLT.
6. **Label UI linked ticket:** "Conversation Response Metrics", bukan "Ticket SLA".

---

## Open Questions

1. Apakah RLT sengaja dibuat untuk menggantikan Conversation FRT, atau menjadi metric tambahan?
2. Apakah FRT Conversation seharusnya start dari first inbound customer message atau first assignment?
3. Apakah Hold, Snooze, AUX pause adjusted RLT?
4. Apa enum `Metric Status` dan `Metric Quality Flags`?
5. Untuk reopened conversation, apakah RLT/Wait Time cycle baru dibuat seperti Ticket SLA reopen?
6. Untuk linked ticket dengan >1 linked conversation, metric source yang dipakai yang mana?
