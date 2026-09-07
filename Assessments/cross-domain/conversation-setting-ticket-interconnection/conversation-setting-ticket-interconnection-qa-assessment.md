# Assessment Report: Audit Interconnection Conversation ↔ Setting ↔ Ticket

> **Assessment Type:** Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `PRD/Conversationv2/` (V2), `PRD/ticketv2/` (V2), `PRD/SLA conversation n ticket/`, `PRD/Company n people/` (Settings)
> **Source Change Intake Brief:** `not-applicable` (audit, bukan change request)
> **Assessment Artifact Path:** `Assessments/cross-domain/conversation-setting-ticket-interconnection/conversation-setting-ticket-interconnection-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/core/task-router.md`, `Rules/core/analysis-and-risk.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`, `Assessments/reference/sla-system-full-analysis.md`, `Assessments/reference/sla-conversation-ticket.md`, `Assessments/reference/conversation-prd-cross-analysis.md`
> **Tanggal Analisa:** 2026-09-02
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Versi awal. Memetakan titik integrasi Conversation<->Setting dan Conversation<->Ticket, mencatat 20 temuan: gap, inkonsistensi, dan missing handoff.
- Severity tertinggi terkonsentrasi pada: (1) tiga sumber konfigurasi SLA yang saling tumpang tindih tanpa precedence, (2) dual-SLA conversation+ticket pada event yang sama, (3) state machine (Hold/Snooze/AUX/reopen) yang setting-nya sudah ada tapi state machine-nya belum dibangun.

---

## 1. Overview

**Feature / Issue:** Audit interconnection modul Conversation dengan modul Setting dan Ticket.

**Objective:** Menemukan masalah integrasi: config setting yang mempengaruhi conversation, alih conversation ke ticket, data tidak sinkron, dan dependency yang bikin conversation kurang nyaman digunakan.

**Business Context:** Conversation adalah modul pusat omnichannel. Perilakunya ditentukan oleh setting (SLA, office hour, shift, presence, team inbox, tag, RBAC, member) dan menghasilkan eskalasi ke Ticket. Setiap titik sambungan yang tidak terdefinisi menghasilkan perilaku runtime yang ambigu.

**Scope In:**
- Config setting yang mempengaruhi conversation (SLA, office hour, shift, presence/AUX, team inbox, tag/auto-tag, RBAC, member soft-delete, auto-reply).
- Alih conversation → ticket (create ticket dari bubble, context binding, linked conversation, dual SLA, origin indicator).
- Data tidak sinkron dan dependency yang belum ada handoff-nya.

**Scope Out:**
- Analisa domain WhatsApp Web / Broadcast / Contact / Analytics secara mandiri.
- Redesign SLA engine atau penulisan PRD baru (ini audit, bukan implementasi).

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `REVISE_PRD`

**Decision Class:** `NO_GO`

**Decision Statement:**
> Audit menemukan sejumlah interconnection yang butuh keputusan struktural sebelum feature turunan (Snooze Conversation, Hold/Resume, Related Conversations, Auto-Reply) bisa dibangun aman. Sebagian besar masalah bukan bug code, tapi ketiadaan precedence/handoff antar PRD — wajib dilock di level requirement dulu.

### 2.2 Required Actions Before Development

- [ ] Lock precedence tiga lapis konfigurasi SLA (per-channel vs per-ticket-type vs per-team-inbox Custom SLA).
- [ ] Lock definisi canonical state AUX (presence Away vs AUX) yang dipakai SLA pause + auto-reply eligibility + assignment.
- [ ] Lock dual-SLA attribution saat satu agent reply menyelesaikan conversation FRT dan ticket FRT sekaligus.
- [ ] Lock reopen conversation ↔ linked ticket (apakah reopen conversation membuka kembali ticket, atau independen).
- [ ] Selaraskan dua PRD pembuatan ticket (Create Ticket Consistency Patch vs Multi-Ticket Drafts) yang saat ini kontradiktif.

### 2.3 Key Blocking Reasons / Conditions

- Tiga sumber SLA config (channel / ticket-type / team-inbox) tidak punya precedence tertulis → implementasi bisa memilih yang salah.
- State machine yang diacu setting (Hold, Snooze, AUX) belum diimplementasi di FE/BE → setting jadi "config tanpa perilaku".
- "SLA Engine Contract" masih draft pending PM sign-off, tapi sudah jadi acuan banyak PRD turunan.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** SLA / RBAC / Integration / Database / UI

---

## 3. Requirement Summary

### 3.1 Assumptions

- FE reference = `omnichannel-satuinbox-fe` v2.5.0 (+ v2.7.x prod line); BE reference = v2.8.0 in-dev, prod `prod-2.7.0.3`.
- Temuan yang menyebut "undeveloped" mengacu pada `Memory/CLAUDE-be.md` §11 dan `Memory/CLAUDE-fe.md` §16.

### 3.2 Clarifications Needed

- Apakah conversation assignee wajib divalidasi terhadap Team Inbox seperti ticket (Create Ticket Consistency FR-031..035)?
- Apakah reopen conversation otomatis men-trigger reopen pada linked ticket?

---

## 4. Temuan (daftar bernomor)

Setiap temuan: **Modul terkait** · **Lokasi** · **Dampak** · **Severity**.

### 4.1 Conversation ↔ Setting

**TEMUAN 1 — Tiga lapis konfigurasi SLA tanpa precedence.**
- Modul terkait: Conversation, Ticket, Setting (Team Inbox).
- Lokasi: `PRD/SLA conversation n ticket/PRD Conversation SLA.md` (per-channel), `PRD Ticket - SLA ticket.md` (per-ticket-type), `PRD/Company n people/PRD Setting - team inbox.md` §SLA (per-team Default/Custom + "SLA Apply to Ongoing" + "SLA Carry Over").
- Dampak: Satu conversation bisa punya tiga SLA candidate sekaligus (channel, ticket-type kalau di-ticket-kan, team inbox). Team Inbox PRD menyebut "Custom SLA per team" dan "SLA Carry Over" yang tidak dikenal di Conversation SLA PRD. Tidak ada PRD yang mendefinisikan precedence mana yang menang.
- Severity: **CRITICAL** (menentukan fairness SLA dan angka reporting).

**TEMUAN 2 — Setting AUX/Office-hour/presence ada, tapi state canonical-nya belum satu.**
- Modul terkait: Conversation, Setting (Presence, Office Hour, Shift).
- Lokasi: `PRD Setting - presence management.md` (Active/Away, 6 away reason), `PRD Conversation SLA.md` FR-013..015 (toggle "Hitung SLA saat AUX"), `PRD - Availability Auto-Reply...` FR-021 (eligible = bukan Away/AUX), `PRD Setting - shift.md` (shift per agent), `PRD Setting - office hour.md` (office hour umum).
- Dampak: Tiga sumber status waktu (presence Away, AUX, shift, office hour) tidak punya satu canonical state. Global memory L9 mencatat Presence PRD menghitung Away sebagai "Online" sedangkan Auto-Reply mengecualikan Away. Conversation SLA dependency-nya sendiri menyebut "Canonical AUX state" sebagai risiko belum terkunci. Akibat: agent bisa tampak tersedia di HUD tapi dianggap unavailable oleh auto-reply/SLA.
- Severity: **HIGH**.

**TEMUAN 3 — Office Hours vs Shift vs Timezone: tiga sumber waktu tanpa sinkronisasi.**
- Modul terkait: Conversation (SLA), Setting (General, Office Hour, Shift).
- Lokasi: `PRD Setting - general.md` (timezone, perubahan berlaku untuk data baru), `PRD Setting - office hour.md` (maks 4 interval + auto-merge overlap), `PRD Setting - shift.md` (multi-segmen per agent).
- Dampak: RLT/TTC office-hours-aware memakai office hour; auto-reply eligibility memakai shift; deadline memakai timezone workspace. Office Hour PRD punya auto-merge interval yang unik (tidak ada di shift), shift punya "skip holiday" yang tidak ada di office hour. Kalau office hour diubah mid-cycle, `officeHoursSnapshot` di SLA metrics menyimpan snapshot — tapi shift tidak punya mekanisme snapshot serupa untuk eligibility.
- Severity: **MEDIUM**.

**TEMUAN 4 — Team Inbox setting vs Conversation assignment/visibility.**
- Modul terkait: Conversation, Setting (Team Inbox, Roles).
- Lokasi: `PRD Setting - team inbox.md` (Supervisor lihat semua, Member lihat assigned saja; multi-membership), `PRD Setting - Role management.md` FR-019 (Inbox visibility: all/pull/assigned_or_team_only/all_except_team), Conversation V2 Chat List + Room.
- Dampak: Conversation `participants` = assignee, dan `team` single mandatory field. Team Inbox PRD mendefinisikan role Supervisor/Member per inbox, tapi Conversation PRD tidak menyebut validasi assignee terhadap membership team inbox (bandingkan ticket yang eksplisit: Create Ticket Consistency FR-031..035). Risk assignee di luar team scope.
- Severity: **MEDIUM**.

**TEMUAN 5 — RBAC conversation vs ticket tidak satu sumber (dua akses mode).**
- Modul terkait: Conversation, Ticket, Setting (Roles).
- Lokasi: `PRD Setting - Role management.md` FR-019 (conversation_access_mode) dan FR-020 (ticket_access_mode), Appendix C/D default matrix.
- Dampak: Conversation pakai "Pull conversations" dan "Assign to Me"; Ticket pakai "Claim tickets" / "Return to queue". Dua istilah paralel untuk konsep yang sama (pull/claim dari queue) tapi di modul berbeda, dengan permission key berbeda (`conversation:pull` vs `ticket:claim`). Agent yang boleh pull conversation belum tentu boleh claim ticket — perilaku tidak konsisten antar modul.
- Severity: **MEDIUM**.

**TEMUAN 6 — Data privacy masking (phone/email) vs conversation & ticket client data.**
- Modul terkait: Conversation, Ticket, Setting (Roles).
- Lokasi: `PRD Setting - Role management.md` FR-035..038 (Phone/Email Full/Masked), Conversation Detail client data, Ticket Detail client data (`client.name/email/phone`).
- Dampak: Masking di-set per role. Tapi conversation detail (`conversation:read_client_data` action) dan ticket client data punya gate terpisah dari privacy mode. Tidak ada satu spec yang menjamin masking konsisten di kedua permukaan (conversation detail vs ticket detail) untuk role yang sama.
- Severity: **MEDIUM**.

**TEMUAN 7 — Member soft-delete memicu unassign conversation+ticket lalu round robin.**
- Modul terkait: Conversation, Ticket, Setting (Member).
- Lokasi: `PRD Setting - member.md` FR-027..029 (unassign conversation & ticket jadi Unassigned; assignment engine boleh reassign kalau round robin aktif).
- Dampak: Delete member = side effect lintas modul yang menyentuh SLA (Wait Time/RLT `firstAssigneeId` historis), assignment, dan queue. Conversation SLA dependency `firstAgentAssignmentAt` harus tetap utuh (tidak reset) saat unassign paksa — tapi member PRD tidak menyebut interaksi dengan `conversation_sla_metrics`. Kalau round robin reassign otomatis, `firstAssigneeId` bisa berubah — berkonflik dengan definisi "first" di Response Metrics PRD.
- Severity: **HIGH**.

**TEMUAN 8 — Auto-tag scope ticket hanya jalan kalau ticket sudah ada.**
- Modul terkait: Conversation, Ticket, Setting (Auto Tag, Tag Management).
- Lokasi: `PRD Setting - auto tag.md` FR-028..031 (scope Percakapan/Tiket/Percakapan dan Tiket; "MUST NOT create a ticket just to apply tags"), EC-008; `PRD Setting - tag management.md` visibility (Conversation/Ticket/All).
- Dampak: Rule scope "Tiket" atau "Percakapan dan Tiket" dievaluasi per message event. Kalau message masuk sebelum ticket dibuat (ticket dibuat belakangan dari bubble yang sama), auto-tag ticket TIDAK diterapkan (no auto-create) — data tag tidak sinkron antara conversation dan ticket-nya. Tag visibility enum (Conversation/Ticket/All) juga harus konsisten dengan scope validation FR-032..035.
- Severity: **LOW**.

**TEMUAN 9 — Auto-reply (setting) vs SLA exclusion: handoff belum ada.**
- Modul terkait: Conversation, Ticket, Setting (Office Hour → Auto-reply).
- Lokasi: `PRD - Availability Auto-Reply...` FR-048 (auto-reply tidak dihitung FRT/ART/ticket SLA/agent reply), `PRD Conversation SLA.md` FR-036 (FRT = first agent message visible to customer), Response Metrics PRD FR-011 (bot-only system message bukan T3).
- Dampak: Auto-reply undeveloped. Saat dibangun, harus dipastikan SatuInbox Bot TIDAK menyelesaikan FRT/T3 di conversation maupun ticket. Spec sudah sejalan, tapi tidak ada kontrak eksplisit ke SLA engine yang mencegah regresi (kalau bot message tertulis sebagai "message visible to customer" tanpa flag bot). Missing handoff.
- Severity: **MEDIUM**.

### 4.2 Conversation ↔ Ticket

**TEMUAN 10 — Dual-SLA: satu agent reply menyelesaikan dua FRT berbeda.**
- Modul terkait: Conversation, Ticket, SLA.
- Lokasi: `PRD Ticket - Ticketing V2.md` AC-05 (SLA chat & ticket independen), `PRD Ticket - SLA ticket.md` FR-020 (ticket FRT = first agent response after cycle start), Response Metrics PRD FR-086 (T3 dari ticket reply UI valid jika linked conversation sama).
- Dampak: Ketika ticket dibuat dari conversation, satu reply agent bisa menyelesaikan conversation FRT (T1→T3) DAN ticket FRT (creation→reply) sekaligus, tapi dengan start-point berbeda. Tidak ada PRD yang mendefinisikan apakah satu event reply menyelesaikan keduanya, atau butuh reply terpisah. Response Metrics PRD hanya mewariskan RLT/Wait Time ke ticket, tidak menyelesaikan dual-FRT. Risk double-count / salah atribusi di reporting.
- Severity: **CRITICAL**.

**TEMUAN 11 — WoC pause beda domain pada customer wait yang sama.**
- Modul terkait: Conversation, Ticket, SLA.
- Lokasi: `PRD Conversation SLA.md` FR-011..012 (WoC pause TTC only), `PRD Ticket - SLA ticket.md` FR-008..010 (WoC pause FRT+TTC+stage, default enabled).
- Dampak: Conversation yang di-link ke ticket, saat sama-sama "waiting on customer", conversation FRT tetap jalan (hanya TTC pause) tapi ticket FRT ikut pause. Metric yang "seharusnya sama-sama menunggu customer" berperilaku beda. Sudah dicatat di `sla-conversation-ticket.md` sebagai alignment risk; masih open.
- Severity: **HIGH**.

**TEMUAN 12 — Reopen conversation vs reopen ticket: tidak ada handoff.**
- Modul terkait: Conversation, Ticket, SLA.
- Lokasi: `PRD Ticket - SLA ticket.md` FR-019 (ticket reopen = new cycle `cycleId`), SLA Engine Contract §5.4 (conversation reopen = Room-style, TTC cycle baru, FRT historis — masih draft), global memory "conversation SLA reopen undefined".
- Dampak: Ticket punya definisi reopen yang locked; conversation masih 3-way conflict + draft contract. Tidak ada PRD yang mendefinisikan apa yang terjadi pada linked ticket ketika conversation-nya di-reopen (atau sebaliknya). Kalau conversation di-reopen tapi ticket tetap closed, status tidak sinkron.
- Severity: **HIGH**.

**TEMUAN 13 — Dua PRD pembuatan ticket dari bubble saling kontradiktif.**
- Modul terkait: Conversation, Ticket.
- Lokasi: `PRD Ticket - Create Ticket Consistency Patch.md` (satu bubble = satu ticket; multi-bubble = block), `PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble.md` (satu bubble = N draft ticket), `PRD Ticket - Ticketing V2.md` AC-01 (multi bubble = satu form).
- Dampak: Tiga PRD punya model seleksi bubble yang berbeda (1 bubble → 1 ticket vs 1 bubble → N draft vs multi bubble → 1 ticket). Belum ada resolusi mana yang canonical. QA tidak bisa menulis satu test suite. FE sudah ship "multiple tickets from a message bubble" (per CLAUDE-fe), tapi Create Ticket Consistency Patch mengunci "one selected bubble can create one ticket".
- Severity: **HIGH**.

**TEMUAN 14 — Linked conversation vs primary linked conversation saat multi-link.**
- Modul terkait: Conversation, Ticket.
- Lokasi: `PRD Ticket - Ticket Detail.md` FR-075..077 (linked conversation section, hidden kalau null), Response Metrics PRD FR-090 / EC-029 (Phase 1 pakai primary linked conversation saja; quality flag `multiple_links_primary_used`), `PRD Ticket - Omnichannel Inbox - Related Conversations Grouping.md` (Primary+Child).
- Dampak: Ticket bisa punya >1 linked conversation. Response Metrics Phase 1 hanya pakai primary link. Related Conversations grouping punya Primary+Child sendiri. Tidak ada satu definisi "primary linked conversation" yang konsisten di ketiga tempat. Risk metric inherit salah conversation.
- Severity: **MEDIUM**.

**TEMUAN 15 — Related Conversations grouping vs ticket flagging (L5, undeveloped).**
- Modul terkait: Conversation, Ticket.
- Lokasi: `PRD Ticket - Omnichannel Inbox - Related Conversations Grouping.md` §Limitations ("No ticket scope in this PRD"), `PRD Ticket - Ticketing V2.md` AC-03 (`is_ticket_message=true` untuk semua message setelah creation).
- Dampak: Kalau conversation dalam grup Primary+Child di-ticket-kan, apakah `is_ticket_message` berlaku ke semua child? Tidak ada PRD yang menyambungkan. Related Conversations undeveloped; ketika dibangun, interaksi dengan ticket flag harus didefinisikan.
- Severity: **HIGH** (blocking untuk fitur undeveloped).

**TEMUAN 16 — Custom attributes conversation vs ticket vs ticket-type: tiga sumber tanpa sync.**
- Modul terkait: Conversation, Ticket, Setting (Ticket Type).
- Lokasi: `PRD Ticket - Conversation Custom Attributes (Single + Collections).md` (ui_editable + collections), `PRD Ticket - Ticket Detail.md` FR-063..068 (custom field readOnly per-field), `PRD Ticket - Create Ticket Consistency Patch.md` (Additional Fields dari Ticket Type).
- Dampak: Conversation punya custom attributes sendiri, ticket punya custom fields dari ticket-type, dan ticket detail punya readOnly per-field. Tidak ada spec yang menyinkronkan conversation custom attributes ke linked ticket (atau sebaliknya). Data yang sama bisa berbeda di dua permukaan.
- Severity: **MEDIUM**.

**TEMUAN 17 — Ticket Room vs Conversation Room: dua composer di thread yang sama.**
- Modul terkait: Conversation, Ticket.
- Lokasi: `PRD Ticket - Ticket Room.md` (composer Balas pelanggan/Catatan internal, origin indicator "Dari tiket #ID", mention), Conversation Room PRD (composer).
- Dampak: Agent bisa reply dari Conversation Room atau Ticket Room ke conversation yang sama. Dua write-path untuk satu thread. Ticket Room punya origin indicator + mention+assign flow; Conversation Room tidak. Draft preservation beda (ticket per-tab per-ticket; conversation room tidak didefinisikan). Risk: delivery state / tempMessageId reconciliation, dan konsistensi thread ketika reply dari dua surface.
- Severity: **MEDIUM**.

**TEMUAN 18 — Ticket FRT zombie pada ticket resolve tanpa reply (G-01).**
- Modul terkait: Ticket, SLA.
- Lokasi: `PRD Ticket - SLA ticket.md` FR-022 (manual ticket FRT dari creation), `Assessments/reference/sla-system-full-analysis.md` G-01.
- Dampak: Ticket manual (tanpa customer message) yang di-resolve tanpa agent reply → ticket FRT tetap running/breach selamanya. Fix usulan `not_applicable` belum masuk PRD. Berinteraksi dengan Response Metrics "internal-only ticket = Not Applicable" — dua konsep "not applicable" (response metric vs SLA FRT) belum disatukan.
- Severity: **MEDIUM**.

**TEMUAN 19 — Ticket tanpa RLT sendiri (G-02) vs inherit RLT conversation.**
- Modul terkait: Conversation, Ticket, SLA.
- Lokasi: `sla-system-full-analysis.md` G-02, Response Metrics PRD FR-084..085 (inherit completed conversation metrics), `PRD Ticket - Ticket Detail.md` SLA section (FRT + Resolve chips saja, tidak ada RLT).
- Dampak: Ticket yang ter-link ke conversation mewarisi RLT/Wait Time; ticket manual tidak punya RLT sama sekali (blind spot). Ticket detail UI hanya menampilkan FRT+Resolve chips, tidak ada slot RLT. Usulan "Ticket Handling Time" belum di-lock. Konsekuensi: performa agent untuk ticket manual tidak terukur.
- Severity: **MEDIUM**.

**TEMUAN 20 — Conversation snooze undeveloped vs ticket snooze developed (state vs visibility).**
- Modul terkait: Conversation, Ticket, SLA.
- Lokasi: `PRD Ticket - Conversation Snooze (Conversation List).md` (undeveloped), `Memory/CLAUDE-be.md` §11 + §7.4 (snooze ticket-only, state bukan status), Engine Contract §5.3 (snooze = no SLA pause).
- Dampak: Ticket snooze adalah state; conversation snooze belum ada. Ketika conversation snooze dibangun (blokir oleh Engine Contract §5.3), tidak ada definisi apakah snooze conversation mempengaruhi linked ticket (atau sebaliknya). Asimetri perilaku snooze antar modul.
- Severity: **MEDIUM**.

---

## 5. Dependency Matrix (ringkas)

| Conversation bergantung pada | Jenis | Status |
|---|---|---|
| SLA setting per-channel (Setting) | config → runtime | Developed, tapi precedence vs team/ticket belum lock (T1) |
| Office hour / shift / timezone (Setting) | config → runtime | Developed, tapi multi-sumber belum sinkron (T3) |
| Presence / AUX state (Setting) | state → pause/eligibility | Canonical state belum lock (T2) |
| Team Inbox membership (Setting) | config → assignment/visibility | Tidak ada validasi assignee (T4) |
| RBAC access mode (Setting) | permission → visibility | Dua mode paralel, tidak satu sumber (T5) |
| Member soft-delete (Setting) | lifecycle → unassign | Side effect ke SLA belum didefinisikan (T7) |
| Ticket context binding (Ticket) | conversation → ticket | Developed, tapi multi-PRD kontradiktif (T13) |
| Dual SLA (Ticket) | conversation → ticket | Attribution belum lock (T10) |
| Linked conversation (Ticket) | conversation → ticket | Primary link belum satu definisi (T14) |
| Reopen (Ticket) | conversation ↔ ticket | Handoff belum ada (T12) |

---

## 6. Risk Analysis

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---|---|---|---|---|---|
| R-01 | Salah pilih SLA config (channel vs team vs ticket-type) | High | Critical | Critical | Lock precedence di satu PRD governance |
| R-02 | Satu reply agent menyelesaikan dua FRT (double count / salah atribusi) | High | Critical | Critical | Definisikan dual-SLA completion rule |
| R-03 | Reopen conversation tidak sinkron dengan linked ticket | Medium | High | High | Definisikan handoff reopen antar modul |
| R-04 | Snooze/Hold/AUX dibangun tanpa canonical state → setting salah terapan | Medium | High | High | Lock state machine sebelum develop fitur |
| R-05 | Member delete reset first-assignee → metric korup | Low | High | Medium | Pertahankan firstAssigneeId historis |

---

## 7. Rekomendasi

1. **Buat satu dokumen precedence SLA** (mirip SLA Engine Contract §5.3 yang sudah mulai) yang menetapkan urutan menang: per-channel conversation SLA → per-ticket-type ticket SLA → per-team-inbox Custom SLA, dan definisikan interaksi "SLA Carry Over" + "Apply to Ongoing" terhadap snapshot rule.
2. **Lock canonical AUX/presence state** sebelum Snooze/Hold/Auto-Reply dibangun — satu enum yang dipakai SLA pause, auto-reply eligibility, dan assignment engine.
3. **Definisikan dual-SLA attribution** untuk event reply pertama pada conversation yang punya ticket aktif.
4. **Resolusi konflik 2 PRD create-ticket** (Consistency Patch vs Multi-Ticket Drafts) menjadi satu model seleksi bubble.
5. **Definisikan reopen handoff** conversation ↔ linked ticket.
6. Temuan 8, 14, 16 (sync data) bisa ditangani sebagai follow-up patch terpisah setelah precedence utama dilock.

---

## 8. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|---|---|---|---|
| OQ-01 | Precedence SLA: channel vs ticket-type vs team-inbox mana yang menang? | Menentukan fairness SLA & reporting | Ya |
| OQ-02 | Apakah satu agent reply menyelesaikan conversation FRT dan ticket FRT sekaligus? | Double-count / atribusi | Ya |
| OQ-03 | Reopen conversation → apakah linked ticket ikut reopen? | Sinkronisasi status | Ya |
| OQ-04 | Apakah conversation assignee divalidasi terhadap Team Inbox seperti ticket? | Assignment di luar scope | Tidak |
| OQ-05 | Canonical AUX state: presence "Away" == SLA "AUX"? | Pause & eligibility | Ya |

---

## 9. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-09-02 | Initial interconnection audit (20 temuan) | Dany Christian |
