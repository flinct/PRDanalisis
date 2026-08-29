# Memory Index

## Purpose

Folder `Memory` menyimpan **canonical product memory**, **architecture reference**, **status summary** yang sering dipakai ulang, dan **index navigasi** ke reference analysis di luar folder ini.

> **IMPORTANT:**
> - Artefak analisa permanen yang **decision-bearing** disimpan di `Assessments/<domain>/<feature-slug>/...`.
> - Reusable **deep-dive / comparison / cross-PRD analysis** disimpan di `Assessments/reference/`.
> - Folder `Memory/` fokus pada canonical rules, baseline context, architecture reference, dan navigation index.

> **IMPORTANT:** Per 2026-05-25:
> - **Conversation:** V2 (`PRD/Conversationv2/`) adalah source of truth. V1 (`PRD/Conversation/`) deprecated.
> - **Ticket:** V2 (`PRD/ticketv2/`) adalah source of truth. V1 (`PRD/Ticket/`) deprecated.
> - **WhatsApp Web:** V2 (`PRD/Whatsapp web v2/`) adalah source of truth. V1 (`PRD/Whatsapp web/`) deprecated.
> - Lihat comparison files di `Assessments/reference/` atau `Memory/reference-index.md` untuk baseline perbedaan.

README ini harus konsisten dengan aturan di `Rules/`:
- `core/change-management.md` (Phase 0 change intake & classification)
- `core/knowledge-management.md` (routing + write/update memory)
- `core/requirements.md` (PRD writing)
- `core/test-design.md` (test case)
- `core/analysis-and-risk.md` (QA analysis + impact)
- `profiles/satuinbox.yml` (governance, owner, struktur)
- `Assessments/README.md`

## Files Inside Memory

### `global-memory.md`
- Fungsi: global summary / canonical product context
- Isi utama:
  - canonical product rules
  - current implemented behavior baseline
  - cross-domain dependency summary
  - critical open risks
- Pakai saat butuh baseline aplikasi berjalan
- Simpan rule stabil, reusable, system-wide

### `reference-index.md`
- Fungsi: pointer dari `Memory/` ke reusable PRD analysis references di `Assessments/reference/`
- Pakai saat butuh comparison, loophole map, atau deep-dive reasoning sebelum membaca seluruh reference file

### `conversation-undeveloped-features-analysis.md`
- Fungsi: analisa detail fitur Conversation V2 yang belum developed
- Isi utama:
  - impact ranking
  - feature-by-feature QA focus
  - test plan per fitur

### `comprehensive-undeveloped-features-analysis.md`
- Fungsi: analisis komprehensif fitur undeveloped lintas Conversation, Ticket, dan WhatsApp Web
- Isi utama:
  - status FE + BE per fitur
  - impact matrix per fitur
  - cross-feature integration suite
  - release gate recommendation

### `CLAUDE-fe.md`
- Fungsi: canonical reference untuk FE repo `omnichannel-satuinbox-fe`
- Pakai saat butuh struktur FE, component mapping, routing, state management, service hook, atau status implementasi FE vs PRD

### `CLAUDE-be.md`
- Fungsi: canonical reference untuk BE repo `omnichannel-satuinbox-be`
- Pakai saat butuh service boundary, proto contract, schema, RabbitMQ pattern, atau cross-check implementasi BE vs PRD

### `CLAUDE-mobile.md`
- Fungsi: canonical reference untuk mobile app `satuinbox-mobile` (React Native / Expo)
- Pakai saat butuh struktur mobile, routing, state management, socket pattern, push notification, auth/RBAC mobile, atau status implementasi mobile vs web vs PRD
- Mencakup: tech stack, route map, Zustand stores, API integration, realtime (Socket.IO), push notifications, telemetry, native config, build commands, standing constraints

### `impact-linked-chat-bubble-patch.md`
- Fungsi: impact analysis reference untuk patch linked chat bubble di Ticket
- Pakai saat butuh dependency map, regression scope, dan implementation shape patch tersebut

### `qa-tooling.md`
- Fungsi: dokumentasi state terkini QA Browser tool dan QA Agent infrastructure
- Pakai saat butuh referensi tooling QA Browser, setup agent server, atau status fitur tool

## Reference Analysis Outside Memory

Gunakan `Assessments/reference/` untuk reusable PRD analysis berikut:

### `Assessments/reference/conversation-prd-cross-analysis.md`
- Loophole analysis, conflict mapping, dan QA deep-dive Conversation V2

### `Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md`
- Deep-dive definisi, overlap, formula, dan gap implementasi SLA Conversation

### `Assessments/reference/conversation-v1-vs-v2-comparison.md`
- Baseline migrasi Conversation V1 → V2 vs FE implementation

### `Assessments/reference/ticket-v1-vs-v2-comparison.md`
- Baseline migrasi Ticket V1 → V2 vs FE + SLA implementation

### `Assessments/reference/whatsapp-web-v1-vs-v2-comparison.md`
- Baseline migrasi WhatsApp Web V1 → V2 vs FE + BE implementation

### `Assessments/reference/sla-conversation-ticket.md`
- Alignment risk antara model SLA Conversation V2 dan Ticket V2

### `Assessments/reference/contact-context-visibility.md`
- Reference RBAC / visibility scope untuk Contact list, detail, dan picker

## Companion Artifacts Outside Memory

### `Assessments/`
- Simpan **Change Intake Brief** untuk artifact Phase 0 di path `Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md`.
- Simpan versi sebelumnya di `Assessments/<domain>/<feature-slug>/versions/<feature-slug>-change-intake-brief-vX.Y.md`.
- Simpan **Assessment Report** yang mengandung decision, recommendation, dan histori revisi.
- Pattern latest/current: `Assessments/<domain>/<feature-slug>/<feature-slug>-qa-assessment.md`
- Histori immutable: `Assessments/<domain>/<feature-slug>/versions/...`

### Reuse Flow
- BRD / discovery memakai `Change Intake Brief` sebagai baseline scope awal.
- PRD, Assessment Report, dan QA artifacts mereferensikan brief yang sama.
- Jika ada perubahan lanjutan pada feature yang sama, update brief itu dulu sebelum patch artifact downstream.

### `Assessments/reference/`
- Simpan reusable **reference analysis** yang bukan canonical memory dan bukan decision report final.
- Cocok untuk comparison, cross-PRD analysis, loophole map, dan supporting deep-dive.

### `Test/<domain>/`
- Simpan manual TSV, QA test spec, QA pre/post review docs, dan automation mapping.
- Pattern umum:
  - `<Feature>.tsv`
  - `<feature>-qa-test-spec.md`
  - `<feature>-qa-pre-implementation-review.md`
  - `<feature>-qa-post-implementation-validation.md`
  - `<feature>-automation-mapping.md`

## Agent Instructions

Sebelum melakukan tugas apapun, baca `Rules/core/task-router.md` (entry point) + `Rules/profiles/satuinbox.yml` (governance) — ini menentukan tipe tugas dan rule core/adapter mana yang harus dimuat.

Jika task berupa request **tambah / ubah / buang feature**, enhancement, atau revive PRD lama / undeveloped feature, jalankan dulu `Rules/core/change-management.md` (Phase 0) sebelum memilih lane PRD / analysis / impact.

## Usage Rule

1. Simpan aturan stabil lintas fitur di `global-memory.md`.
2. Simpan architecture reference dan status summary yang sering dipakai ulang di `Memory/`.
3. Simpan reusable deep-dive / comparison analysis di `Assessments/reference/`.
4. Jangan overwrite memory dari nol. Update section relevan saja.
5. Jangan duplikasi canonical rules di reference analysis jika sudah ada di `global-memory.md`.
6. Jika konflik antara rule baru dan global memory, jangan overwrite otomatis. Flag inconsistency. Tunggu klarifikasi.

## Routing Guide

### Tulis ke `global-memory.md` jika:
- reusable lintas fitur
- system-wide behavior
- shared lifecycle/state flow
- shared RBAC logic
- shared integration flow
- architecture constraints
- recurring system risks

### Tulis ke file lain di `Memory/` jika:
- baseline context masih dipakai sering lintas task
- implementation summary atau architecture reference perlu dibuka cepat
- status undeveloped/developed perlu dipakai ulang berkali-kali

Gunakan terutama untuk membantu Phase 0 di `Rules/core/change-management.md`, misalnya saat perlu memastikan request itu benar-benar feature baru atau sebenarnya revive dari PRD / feature undeveloped yang sudah pernah dicatat.

### Tulis ke `Assessments/reference/` jika:
- reusable deep-dive PRD analysis
- cross-PRD comparison
- loophole / conflict map
- supporting analysis untuk assessment atau PRD lain
- comparison baseline V1 vs V2 / FE / BE

### Jangan persist jika:
- generated test cases
- raw PRD explanation
- verbose narrative
- temporary assumption
- one-off exception
- implementation noise
- decision-bearing assessment drafts yang harus jadi Assessment Report
- companion QA artifacts yang harus masuk `Test/<domain>/`
