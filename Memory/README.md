# Memory Index

## Purpose

Folder `Memory` menyimpan context kerja persisten untuk domain PRD Analysis.

> **IMPORTANT:** Per 2026-05-25:
> - **Conversation:** V2 (`PRD/Conversationv2/`) adalah source of truth. V1 (`PRD/Conversation/`) deprecated.
> - **Ticket:** V2 (`PRD/ticketv2/`) adalah source of truth. V1 (`PRD/Ticket/`) deprecated.
> - **WhatsApp Web:** V2 (`PRD/Whatsapp web v2/`) adalah source of truth. V1 (`PRD/Whatsapp web/`) deprecated.
> Lihat comparison files di folder Memory untuk detail perbedaan.

README ini harus konsisten dengan aturan di `Rules/`:

- `memory-routing-rule.md`
- `global-memory-write-rule.md`
- `global-memory-update-rule.md`
- `memory-write-rule.md`
- `prd-writing-rule.md` — Framework penulisan PRD dengan Lite/Standard/Full mode, conditional sections, dan quality gate berbasis Conversation V2 dan Ticket V2.
- `test-case-rule.md` — Framework penulisan QA test plan, test cases, test steps, coverage matrix, execution runbook, dan automation mapping berbasis hasil PRD analysis.
- `qa-analysis-rule.md` — **WAJIB.** Framework metodologi analisa QA senior untuk semua skenario: PRD analysis, feature dev, bug fix, interconnection, impact, risk. Merged from deprecated `analisa-prd-rule.md`.
- ~~`analisa-prd-rule.md`~~ — **DEPRECATED.** Semua konten sudah di-merge ke `qa-analysis-rule.md`. Jangan gunakan untuk analisa baru.

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
- Fungsi: detailed analysis lintas-PRD domain Conversation (V2 aligned)
- Isi utama:
  - loophole/conflict analysis (L1–L10, updated FE v2.5.0 status, V2 file references)
  - feature development status vs V2 (with V2 file numbers)
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
- Fungsi: analisa detail fitur conversation V2 belum develop
- Isi utama:
  - impact ranking (updated: excludes developed features)
  - feature-by-feature QA focus (with V2 file references)
  - test plan per fitur

### `conversation-sla-rlt-frt-ttc-analysis.md`
- Fungsi: analisis mendalam definisi, overlap, conflict antara V2 SLA metrics dan V2 Response Metrics
- Isi utama:
  - extracted canonical rules FRT/TTC/RLT/Wait Time (V2 aligned)
  - critical findings (duplikasi RLT/FRT, data model conflict, pause fragmentation, linked ticket mismatch, report duplication)
  - broken requirements (BR-01 s.d. BR-14)
  - V2 interconnection analysis (13 PRD conversation V2)
  - ketentuan belum jelas (28 item: A01–F06)
  - FE v2.5.0 gap analysis vs V2 (RLT/Wait Time status implementasi, 10 remaining gaps)
  - SLA metric formulas: `FRT = Wait Time + RLT`, business hours behavior per metric
- Pakai saat butuh detail definisi FRT/TTC/RLT, interkoneksi V2, status implementasi FE
- Jangan jadikan source of truth untuk canonical system rule — lihat `global-memory.md`

### `sla-conversation-ticket.md`
- Fungsi: cross-PRD analysis alignment risk antara Conversation V2 SLA dan Ticket V2 SLA
- Isi utama:
  - perbedaan lifecycle start: conversation (first inbound → FRT) vs ticket (creation → FRT)
  - perbedaan pause policy: conversation (TTC only) vs ticket (FRT+TTC+stage)
  - shared risk: reopen behavior undefined, Waiting on Customer mapping
- Pakai saat butuh alignment SLA conversation V2 dan SLA ticket V2

### `contact-context-visibility.md`
- Fungsi: analisis contact visibility dan RBAC scope untuk contact list/detail/picker
- Isi utama:
  - visibility rules berdasarkan role, team, division
  - server-side enforcement requirements
- Pakai saat butuh referensi RBAC contact

### `conversation-v1-vs-v2-comparison.md`
- Fungsi: perbandingan Conversation V1 vs V2 vs FE implementation
- Isi utama:
  - 20 feature comparison table
  - V2 supersedes V1 konfirmasi
  - FE alignment score: ~85% V2
  - 8 fitur V2 belum di FE
- Pakai saat butuh referensi migrasi Conversation V1→V2

### `ticket-v1-vs-v2-comparison.md`
- Fungsi: perbandingan Ticket V1 vs V2 vs FE vs SLA Ticket
- Isi utama:
  - 12 feature comparison table
  - V2 supersedes V1 (semua fitur absorbed)
  - FE alignment score: ~95% V2
  - 1 fitur V2 belum di FE (Related Tickets & Merge)
  - SLA Ticket cross-reference (FRT/TTC/stage SLA)
- Pakai saat butuh referensi migrasi Ticket V1→V2

### `whatsapp-web-v1-vs-v2-comparison.md`
- Fungsi: perbandingan WhatsApp Web V1 vs V2 vs FE + BE
- Isi utama:
  - 13 feature comparison table with BE column
  - V2 supersedes V1 + Anti Spam System baru
  - FE alignment: ~70%. BE alignment: ~70%
  - Import Modes & Anti Spam: **Not in FE or BE**
  - 4 FE-visible gaps (Bulk Scan popup, Pairing Code, Public Links, Name dropdown)
- Pakai saat butuh referensi WA Web V2

### `comprehensive-undeveloped-features-analysis.md`
- Fungsi: analisis komprehensif semua fitur undeveloped dari 3 domain (Conversation, Ticket, WhatsApp Web)
- Isi utama:
  - 15 fitur undeveloped dengan detail: FE status, BE status, impact area, QA handling
  - Konfirmasi BE: Related Tickets, Import Modes, Anti Spam System — **semua 0% di BE juga**
  - Impact matrix per fitur (risk level, domain, impact area)
  - Cross-feature integration test suites (4 suites)
  - Release gate recommendations
- Pakai saat butuh referensi lengkap fitur yang belum developed + QA strategy

### `CLAUDE-fe.md`
- Fungsi: canonical reference untuk FE repo `omnichannel-satuinbox-fe`
- Isi utama:
  - Tech stack (Next.js `^16.0.10`, React 19, Zustand 5, TanStack Query 5, Tailwind CSS 4, Socket.IO 4, TypeScript 5.9.2)
  - 2 aplikasi: `apps/omnichannel` (port 3002, agent dashboard) + `apps/widget` (port 3001, embeddable chat)
  - Monorepo Turborepo — 6 shared packages (`@satuinbox/types`, `constants`, `helpers`, `i18n`, `react-query`, `ui`)
  - Full directory tree `apps/omnichannel/` dengan penjelasan per folder
  - Routing structure: `[locale]/(auth)/` + `[locale]/(main)/` + `[convoSection]` mapping (your-inbox, unassigned, all, starred, spam, junk, channel, team, group-chat)
  - State management: Zustand stores per domain (conversation, ticket, broadcast, notification, WA Web, pending-socket-queue, dll)
  - React Query pattern: `useQueryWithSession`, `useInfiniteQueryWithSession`, naming `use<Action><Resource>.service.ts`
  - Axios/session flow: request interceptor (inject Bearer token), response interceptor (401 → refresh → retry, SESSION_INVALIDATED → force logout)
  - Socket.IO namespaces: `/conversations`, `/tickets`, `/notifications` + provider/hook mapping per domain
  - Component architecture: 3-column conversation (ChatList / ChatRoom / ChatDetails), drawer ticket, WhatsApp Web settings layout
  - Backend API paths via API Gateway `:3000` (20+ resource paths)
  - V2 implementation status per domain: Conversation (~85% V2), Ticket (~95% V2), WhatsApp Web (~70% V2)
  - FE + BE alignment: no asymmetry confirmed — undeveloped features sama di kedua sisi
- Pakai saat butuh referensi struktur FE, component mapping, state management, service hooks, data model, atau status implementasi FE vs PRD

### `impact-linked-chat-bubble-patch.md`
- Fungsi: impact analysis untuk Ticketing Patch — Linked Chat Bubble Append, Remove, Navigation, and Reply-Based Sync
- Isi utama:
  - Ringkasan 4 kemampuan baru vs existing implementation
  - Yang SUDAH ada (tidak berubah): 10 komponen teridentifikasi
  - Yang HARUS diupdate: 4 area dengan detail FE/BE changes per sub-feature
  - Error handler mapping (12 EH): status implementasi saat ini
  - Edge case mapping (10 EC): status implementasi saat ini
  - QA test strategy: 50+ test cases (append, remove, navigation, sync, concurrency, regression, data integrity)
  - Cross-feature dependencies & risks (TicketDetailsDrawer refactor, cross-service gRPC)
  - Recommended development sequence (4 phases)
- Pakai saat butuh referensi implementasi patch linked chat bubble, test plan, impact estimation

### `CLAUDE-be.md`
- Fungsi: canonical reference untuk BE repo `omnichannel-satuinbox-be`
- Isi utama:
  - Tech stack (NestJS `^11.0.0`, Node.js 22+, TypeScript `~5.9.2`, Nx monorepo `21.5.2`, gRPC, RabbitMQ, MongoDB/Mongoose `^8.18.1`, Redis, Socket.IO `^4.8.1`, Baileys)
  - Architecture: API Gateway (HTTP `:3000` + WS `:3002`) → gRPC (sync, mTLS) → 20 microservices
  - Service map: 20 services dengan GRPC_ENV key, gRPC port, MongoDB DB per service
  - Directory layout: `apps/<service>/`, `libs/` (common, proto-types, cache, security), `proto/`
  - Service internal layout: controllers, services, repositories, schemas, processors/workers
  - Key constants: `PROTO`, `GRPC_ENV`, `MONGODB_URI_KEY`, infra defaults (ports, TTLs, limits)
  - gRPC rules: proto-first contracts, ts-proto codegen, `@GrpcCacheable` decorator
  - RabbitMQ patterns: known event patterns catalog (message.inbound.*, ticket.sla.breach.check, bulk-reply.job.*, dll)
  - Schema & data modeling rules: BaseAuditSchema, ITenantEntity, compound indexes, denormalized snapshots
  - Security: mTLS inter-service, JWT/API-key gateway auth, CASL RBAC, mongoose-encryption
  - Domain implementation: Conversation SLA (FRT/TTC/RLT/Wait Time formulas + pause reasons), Ticket SLA (per-stage state machine, cycleId, delayed queues), WhatsApp Web (Baileys key files)
  - BE-side features NOT implemented: Collaborator role, Snooze Conversation, Related Conversations, Related Tickets & Merge, WA Group Mention, Auto-reply, Import Modes, Anti-spam system, Room Reminder, Hold state
  - BE + FE alignment: no asymmetry — undeveloped features sama di kedua sisi
- Pakai saat butuh referensi arsitektur BE, service boundaries, schema, proto contracts, RabbitMQ patterns, atau cross-check implementasi BE vs PRD

## Agent Instructions

Sebelum melakukan tugas apapun, baca `Rules/agent-instruction.md` — ini adalah entry point yang mendeteksi tipe tugas dan menentukan rule mana yang harus dimuat.

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
