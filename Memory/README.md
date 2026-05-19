# Memory Index

## Purpose

Folder `Memory` dipakai untuk menyimpan context kerja yang persisten untuk domain PRD Analysis.

README ini harus konsisten dengan aturan di folder `Rules`, terutama:

- `memory-routing-rule.md`
- `global-memory-write-rule.md`
- `global-memory-update-rule.md`
- `memory-write-rule.md`

## Files

### `global-memory.md`
- Fungsi: global summary / canonical product context
- Isi utama:
  - Canonical Product Rules (includes Chat List Rules, Conversation Room Rules, and Conversation Detail Rules)
  - Current Implemented Conversation Rules (includes Confirmed Data Model from production)
  - Omnichannel Filtering Baseline (includes PRD vs Implementation Delta)
  - Critical Dependencies & Open Risks
- Pakai file ini saat butuh baseline aplikasi yang sedang berjalan
- Hanya simpan rule yang stabil, reusable, dan system-wide
- Jangan simpan detail UI lokal, raw PRD wording, test case, speculative reasoning, atau workaround sementara

### `conversation-prd-cross-analysis.md`
- Fungsi: detailed analysis lintas-PRD untuk domain Conversation
- Isi utama:
  - loophole/conflict analysis
  - impact priority
  - QA recommendations
  - undeveloped feature analysis
  - omnichannel deep analysis
  - three-PRD logical intersection
  - current implemented filtering rules (includes Confirmed Against Production Data)
  - Chat List cross-PRD analysis (7 critical gaps, 3-PRD integration mapping, QA implications)
  - Chat List recommendations (5 items: navigation harmonization, SLA sync, Hold↔Snooze, Assign to Me access, search scope)
  - Room PRD cross-PRD analysis (status model conflict, assignment source, Hold/Snooze/SLA, Room→Chat List mutation, channel capability matrix)
  - Detail PRD cross-PRD analysis (assignment state vs status, FRT/TTC SLA, reminder visibility, attributes ownership, history/related/broadcast dependencies)
- Pakai file ini saat butuh reasoning detail, conflict mapping, atau QA deep dive
- File ini boleh menyimpan loophole, gap, conflict, QA reasoning, dan impact analysis
- Jangan jadikan file ini source of truth untuk canonical system rule jika sudah ada di `global-memory.md`

### `conversation-undeveloped-features-analysis.md`
- Fungsi: analisa detail khusus fitur conversation yang belum develop
- Isi utama:
  - impact ranking
  - feature-by-feature QA focus
  - test plan per fitur

## Usage Rule

1. Simpan aturan aplikasi yang sudah stabil dan berlaku lintas fitur di `global-memory.md`.
2. Simpan analisa PRD, loophole, dan reasoning investigatif di file detail.
3. Jangan overwrite file memory; update section yang relevan saja.
4. Jangan duplikasi canonical rules di file detail jika rule tersebut sudah ada di `global-memory.md`.
5. Jika ada konflik antara rule baru dan global memory, jangan overwrite otomatis; flag inconsistency dan tunggu klarifikasi.
6. Global memory harus di-update incremental, bukan diregenerate dari nol.

## Routing Guide

### Tulis ke `global-memory.md` jika isinya:
- reusable lintas fitur
- system-wide behavior
- shared lifecycle/state flow
- shared RBAC logic
- shared integration flow
- architecture constraints
- recurring system risks

### Tulis ke file detail jika isinya:
- feature-specific behavior
- loophole/conflict analysis
- local edge case
- feature-local dependency
- QA deep dive
- impact analysis

### Jangan persist jika isinya:
- generated test cases
- raw PRD explanation
- verbose narrative
- temporary assumption
- one-off exception
- implementation noise
