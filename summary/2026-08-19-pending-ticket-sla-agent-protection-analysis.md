# Summary Session — 2026-08-19

## Judul
Analisa Orchestrator: Perbandingan 3 Opsi SLA Pending Ticket vs Performa Agent (Salesforce/Zendesk/Freshdesk)

## Tujuan / Request Utama User
User minta (mode orchestrator) analisa 3 opsi implementasi industri untuk mengatasi SLA dari Pending Ticket agar tidak merugikan performa Agent:
1. Status Khusus (On Hold/Pending) — timer jalan, exclude dari performa agent.
2. SLA Pause Condition — timer berhenti.
3. Queue/Group Transfer otomatis — ticket keluar dari dashboard agent, SLA agent berhenti.
Diminta rekomendasi mana yang paling cocok untuk SatuInbox.

## Ringkasan Progres

1. Baca Rules/agent-instruction.md, workflow-rule.md, qa-analysis-rule.md, impact-analysis-rule.md, Memory/global-memory.md, Memory/reference-index.md, Assessments/reference/sla-conversation-ticket.md, Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md.
2. Baca PRD sumber: PRD Conversation SLA, PRD Ticket SLA, PRD Conversation Snooze, PRD Conversation Room, PRD Ownership Decoupling (Team Inbox x Channel Numbers).
3. Delegate worker (kind=analysis) untuk analisa mendalam — **timeout setelah 600s** (masih explore file, belum sempat nulis output). Tidak retry worker kedua karena konteks sudah cukup lengkap dari riset manual.
4. Susun sendiri Assessment Report Type 3 — Interconnection Analysis, disimpan permanen di:
   `Assessments/cross-domain/pending-ticket-sla-agent-protection/pending-ticket-sla-agent-protection-qa-assessment.md`
5. Delegate reviewer (kind=review) untuk validasi report v1.0 — **PASS** dengan catatan minor (atribusi FR-070–072, risk gaming Opsi 3). Revisi minor diterapkan.
6. User clarify: "ini ga cuma berlaku untuk ticket, conversation juga harus ada" → scope diperluas ke v1.1 (kedua domain).
7. Assessment Report v1.1 sudah persisted dengan perluasan: Conversation punya Hold & Snooze existing yang ambigu → strategy berbeda (resolve ambiguity + add exclude layer, bukan bikin dari nol). Phase 1 sekarang kedua domain.

## Temuan Kunci

- SatuInbox SUDAH punya mekanisme mirip Opsi 1 & 2 di level Conversation: **Hold** (klaim pause SLA) vs **Snooze** (eksplisit "No SLA pause changes") — dan keduanya **kontradiksi**, belum di-lock PM/Engineering (3-way conflict lama, tercatat di global memory).
- Ticket SLA sudah punya "Waiting on Customer" pause (FRT+TTC+stage sekaligus). Conversation SLA hanya pause TTC saat WoC.
- Ownership Decoupling (Move-to-Team) sudah mirip pola Opsi 3: SLA stop + assignee reset Unassigned — tapi levelnya conversation, bukan queue-bottleneck khusus.
- Round Robin/Auto-Pull queue distribution belum ada PRD sendiri — jadi blocker kalau mau implement Opsi 3.
- **Perbedaan strategi kedua domain (v1.1):**
  - **Ticket:** Problem lebih straightforward — tambah exclude-from-scoring state baru (mirip Waiting on Customer tapi lebih granular).
  - **Conversation:** Problem lebih kompleks karena Hold & Snooze SUDAH exist tapi ambigu — "exclude from scoring" layer ditambah di **atas** ambiguity existing, bukan bikin dari nol. Wajib lock 3-way conflict duluan.
- Rekomendasi draft: **Opsi 1 sebagai fondasi (Phase 1) — BOTH domain**, **Opsi 3 sebagai Phase 2** (setelah Round Robin dapat PRD), **Opsi 2 di-hold** sampai 3-way conflict Hold/Snooze/SLA di-lock. Decision Enum: `PROCEED_WITH_CAUTION`.

## Status Terakhir / Next Step

- Assessment Report v1.0 sudah persisted (dengan revisi minor pasca-review).
- Reviewer verdict: **PASS** (dengan catatan minor: perbaiki atribusi FR-070–072 audit log, tambah catatan risk gaming Opsi 3 — sudah diperbaiki).
- Task selesai. Rekomendasi final sudah dilaporkan ke user.
- Next step kalau user mau lanjut: buat Change Intake Brief formal untuk Phase 1 (Opsi 1) + eskalasi ke PM soal lock 3-way conflict Hold/Snooze/SLA.

---

## Transkrip Percakapan

### Turn 1 — User
> pakai orchestrator
> analisa dari 3 opsi ini, mana yang lebih cocok untuk di terapkan ke satuinbox
> Salesforce, Zendesk dan Freshdesk memiliki 3 implementasi yang dapat dipilih untuk mengatasi SLA dari Pending Ticket agar tidak merugikan Performa Agent.
>
> 1. Status Khusus (On Hold / Pending) untuk menandai tiket yang sedang bottleneck, timer tetap berjalan untuk menghitung berapa lama Tiket tersebut Pending, seluruh Status Khusus ini tidak dilekatkan pada Performa Agent.
> 2. SLA Pause Condition agar timer berhenti menghitung kerugian waktu bagi Agent.
> 3. Queue/Group Transfer otomatis agar tiket keluar dari Dashboard Harian Agent yang bersangkutan, sehingga SLA di sisi Agent juga berhenti saat Tiket telah dipindahkan. Disini kita harus membuat Queue/Group Khusus.

### Turn 1 — Assistant
Membaca seluruh rule (agent-instruction, workflow-rule, qa-analysis-rule, impact-analysis-rule), global memory, reference index, reference SLA analysis, dan PRD sumber (Conversation SLA, Ticket SLA, Conversation Snooze, Conversation Room, Ownership Decoupling). Mendelegasikan worker analysis (background, timeout 600s tanpa hasil tertulis). Menyusun sendiri Assessment Report Type 3 (Interconnection Analysis) berdasarkan riset yang sudah dikumpulkan, disimpan ke `Assessments/cross-domain/pending-ticket-sla-agent-protection/pending-ticket-sla-agent-protection-qa-assessment.md`. Mendelegasikan reviewer untuk validasi report (PASS + minor notes). Revisi minor diterapkan.

### Turn 2 — User
> ini ga cuma berlaku untuk ticket, conversation juga harus ada

### Turn 2 — Assistant
Scope diperluas dari Ticket-only ke **Ticket + Conversation** (kedua domain). Assessment Report update ke v1.1: title, scope, overview, decision statement, required actions, current-state gap analysis, data flow notes, recommendation rationale, operational recommendation (Phase 1 sekarang both domains), traceability matrix (tambah REQ-01C untuk Conversation), change log. Perbedaan strategi kritis: Conversation SUDAH punya Hold & Snooze existing yang ambigu (3-way conflict) → "exclude from scoring" layer ditambah di atas ambiguity, bukan bikin dari nol seperti di Ticket.
