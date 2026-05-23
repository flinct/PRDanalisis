# Memory Index

## Purpose

Folder `Memory` menyimpan context kerja persisten untuk domain PRD Analysis.

README ini harus konsisten dengan aturan di `Rules/`:

- `memory-routing-rule.md`
- `global-memory-write-rule.md`
- `global-memory-update-rule.md`
- `memory-write-rule.md`

## Files

### `global-memory.md`
- Fungsi: global summary / canonical product context
- Isi utama:
  - Canonical Product Rules (Chat List Rules, Conversation Room Rules, SLA Metric Definitions, Conversation Detail Rules)
  - Current Implemented Conversation Rules (Confirmed Data Model from production + FE v2.5.0 SLA metrics fields)
  - Omnichannel Filtering Baseline (PRD vs Implementation Delta)
  - Critical Dependencies & Open Risks (RLT/Wait Time, SLA mode, reopen, group chat, Hold/Snooze conflicts)
- Pakai saat butuh baseline aplikasi berjalan
- Simpan rule stabil, reusable, system-wide
- Jangan simpan UI lokal, raw PRD wording, test case, speculative reasoning, workaround sementara

### `conversation-prd-cross-analysis.md`
- Fungsi: detailed analysis lintas-PRD domain Conversation
- Isi utama:
  - loophole/conflict analysis (L1–L10, updated FE v2.5.0 status)
  - feature development status vs PRD (8 fitur dicek FE)
  - QA analysis & testing guidance per loophole (L1–L10: FE status, impact, testing steps, regression risk, test level)
  - prioritas testing berdasarkan FE readiness (P0 immediate, P1, P2, Future)
  - omnichannel deep analysis
  - three-PRD logical intersection
  - current implemented filtering rules (Confirmed Against Production Data)
  - Chat List cross-PRD analysis (7 gaps, 3-PRD mapping, QA implications)
  - Chat List recommendations (5 items: navigation harmonization, SLA sync, Hold↔Snooze, Assign to Me access, search scope)
  - Room cross-PRD analysis (status conflict, assignment source, Hold/Snooze/SLA, Room→Chat List mutation, channel capability matrix)
  - Detail cross-PRD analysis (assignment state vs status, FRT/TTC SLA, reminder visibility, attributes ownership, history/related/broadcast dependencies)
- Pakai saat butuh reasoning detail, conflict mapping, QA deep dive, testing guidance
- Boleh simpan loophole, gap, conflict, QA reasoning, QA test plan, impact analysis
- Jangan jadikan source of truth untuk canonical system rule jika sudah di `global-memory.md`

### `conversation-undeveloped-features-analysis.md`
- Fungsi: analisa detail fitur conversation belum develop
- Isi utama:
  - impact ranking
  - feature-by-feature QA focus
  - test plan per fitur

### `conversation-sla-rlt-frt-ttc-analysis.md`
- Fungsi: analisis mendalam definisi, overlap, conflict antara PRD Conversation SLA, PRD Ticket SLA, PRD Conversation RLT
- Isi utama:
  - extracted canonical rules FRT/TTC/RLT/Wait Time
  - critical findings (duplikasi RLT/FRT, data model conflict, pause fragmentation, linked ticket mismatch, report duplication)
  - broken requirements (BR-01 s.d. BR-14)
  - PRD interconnection analysis (13 PRD conversation)
  - ketentuan belum jelas (28 item: A01–F06)
  - FE v2.5.0 gap analysis (RLT/Wait Time status implementasi, 10 remaining gaps)
  - SLA metric formulas: `FRT = Wait Time + RLT`, business hours behavior per metric
- Pakai saat butuh detail definisi FRT/TTC/RLT, interkoneksi PRD lain, status implementasi FE
- Jangan jadikan source of truth untuk canonical system rule — lihat `global-memory.md`

### `sla-conversation-ticket.md`
- Fungsi: cross-PRD analysis alignment risk antara conversation SLA dan ticket SLA
- Isi utama:
  - perbedaan lifecycle start: conversation (first assignment) vs ticket (creation)
  - perbedaan pause policy: conversation (TTC only) vs ticket (FRT+TTC)
  - shared risk: reopen behavior undefined, Waiting on Customer mapping
- Pakai saat butuh alignment SLA conversation dan SLA ticket

### `contact-context-visibility.md`
- Fungsi: analisis contact visibility dan RBAC scope untuk contact list/detail/picker
- Isi utama:
  - visibility rules berdasarkan role, team, division
  - server-side enforcement requirements
- Pakai saat butuh referensi RBAC contact

## Usage Rule

1. Simpan aturan stabil lintas fitur di `global-memory.md`.
2. Simpan analisa PRD, loophole, reasoning investigatif di file detail.
3. Jangan overwrite file memory. Update section relevan saja.
4. Jangan duplikasi canonical rules di file detail jika sudah ada di `global-memory.md`.
5. Jika konflik antara rule baru dan global memory, jangan overwrite otomatis. Flag inconsistency. Tunggu klarifikasi.
6. Global memory di-update incremental. Jangan regenerate dari nol.

## Routing Guide

### Tulis ke `global-memory.md` jika:
- reusable lintas fitur
- system-wide behavior
- shared lifecycle/state flow
- shared RBAC logic
- shared integration flow
- architecture constraints
- recurring system risks

### Tulis ke file detail jika:
- feature-specific behavior
- loophole/conflict analysis
- local edge case
- feature-local dependency
- QA deep dive
- impact analysis

### Jangan persist jika:
- generated test cases
- raw PRD explanation
- verbose narrative
- temporary assumption
- one-off exception
- implementation noise
