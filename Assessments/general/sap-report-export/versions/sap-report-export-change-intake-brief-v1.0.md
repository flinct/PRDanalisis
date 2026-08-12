# Change Intake Brief: SAP Report Export (General)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** User request (chat) — "SAP Report Export (General)"
> **Artifact Path:** `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Analytics/PRD Analytics - offline report download.md`, `PRD/ticketv2/PRD Ticket - Export Ticket List (XLSX).md`, BE repo `analytics-service` / `conversation-service` / `ticket-service` / `broadcast-service`
> **Tanggal Intake:** 2026-08-11
> **Status:** Hold (Needs Discovery)
> **Author:** Dany Christian

---

## 0. Ringkasan Update Brief

- Initial version (v1.0). Phase 0 intake untuk request "SAP Report Export (General)".
- Verifikasi kode BE aktual: **fitur export sudah SHIPPED** (product ahead of PRD).
- Routing dikunci sementara ke `HOLD_NEEDS_DISCOVERY` karena satu ambiguitas inti (arti "collection analytics") menentukan apakah ini no-op klarifikasi atau buildout CQRS besar.

---

## 1. Request Snapshot

**Request Summary:**
Beri user kebebasan export data **conversation, ticket, broadcast** sesuai kebutuhan, dari data yang SatuInbox punya, **tanpa mengubah data input** (collection operasional conversation/ticket/broadcast). Data yang di-serve **harus dari collection analytics**; jika collection analytics belum lengkap, **lengkapi dulu**.

**Business Problem:**
User butuh self-serve reporting/export tanpa berisiko mengubah data operasional, dan (implisit) ingin sumber baca export dipisah ke lapisan analytics.

**Target User / Role / Stakeholder:**
Admin & Supervisor (sesuai RBAC export existing). PM: Dany Christian. Eng Lead: Naftal Yunior.

**Expected Outcome:**
Export fleksibel per kebutuhan user, read-only terhadap operasional, bersumber dari lapisan analytics yang lengkap.

**Urgency / Why Now:**
Belum dinyatakan — masuk open question.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `MIXED_REQUEST` (BEHAVIOR_CHANGE + ADDITIVE_IMPROVEMENT + potential REVIVE_UNDEVELOPED_PRD) |
| Primary Domain | `Analytics` (cross-domain: Conversation, Ticket, Broadcast) |
| Request Shape | Change (data-source re-point) + Add (lengkapi analytics) |
| Initial Complexity Signal | High (jika interpretasi literal) / Low (jika interpretasi loose) |
| Needs Split? | Maybe — jika "kebebasan export" berarti custom column picker (lihat OQ-5) |

### Classification Rationale
- **BEHAVIOR_CHANGE (utama):** repoint sumber baca export dari collection operasional → collection analytics. Fitur sama, backing store beda.
- **ADDITIVE_IMPROVEMENT:** "lengkapi collection analytics" = kerja tambahan di subsistem analytics (schema/projection/backfill), independen dari flow export.
- **REVIVE_UNDEVELOPED_PRD (potensial):** PRD `Analytics - offline report download.md` (v1.0) sudah cover ~90% goal export, tapi belum pernah di-sign-off sebagai PRD untuk request spesifik ini, dan **tidak** memuat klausa data-source. Perlu konfirmasi PM (OQ-4).

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Analytics/PRD Analytics - offline report download.md` (v1.0, 2026-03-05, PM Yusril); `PRD/ticketv2/PRD Ticket - Export Ticket List (XLSX).md` (v1.0) |
| PRD status | Existing (partial) — cover job lifecycle, RBAC, templates, retention, rate-limit. **TIDAK** mengatur data-source (operasional vs analytics). |
| PRD treatment candidate | Patch (loose) / New PRD (literal row-level) — ditentukan setelah discovery |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | **Shipped** | Export UI memicu offline report job |
| BE | **Shipped** | `analytics-service/export-report-job.service.ts` (orkestrasi job, dedup, rate-limit 10/hr, 1 active/channel, 30-day cap, 7-day expiry, S3 via media-service). Row-building di `conversation-service` / `ticket-service` / `broadcast-service` export workers (`export-job.processor.ts`, `*-export.service.ts`, worker_threads). |
| Runtime / Current Behavior | **Active** | Export baca collection **operasional read-only** (batched, `getConversationsForExportBatched(...)` dsb), map ke row, generate XLSX. Tidak mutasi input. |

**Data source aktual (verified):**
- Job orchestration + status/lifecycle → `analytics-service` (DB `satuinbox_analytics`, `OfflineReportJob`).
- Row-level data → **collection operasional** di masing-masing domain service (read-only).
- Collection analytics (`conversationdailymetrics`, `ticketdailymetrics`, `broadcastdailymetrics`) → **pre-aggregated daily COUNTS saja**, tidak ada row-level record.

> **FLAG: Product AHEAD of PRD.** BE sudah men-ship export sebelum ada PRD formal untuk requirement data-source. Requirement "harus dari collection analytics" adalah constraint BARU yang belum tercermin di kode maupun PRD.

### 3.3 Related Sources
- `Memory/global-memory.md`: status open/closed; `participants`=assignee; **SLA disimpan di collection `conversation_sla_metrics`** (terpisah dari conversation doc); regression-sensitive: assignment, reopen, broadcast filtering, multi-handler sync.
- PRD offline-report §17 addendum: Broadcast recipient-level rows incl `INVALID_REQUEST` (Open API).
- BE schema: `analytics.aggregate.*` RMQ pipeline mengisi daily-metrics collections.

---

## 4. Scope Boundary

### 4.1 In Scope
- Keputusan arsitektur data-source export (operasional vs analytics vs hybrid vs replica).
- Jika analytics dipilih: desain schema row-level analytics/reporting + pipeline backfill historis.
- Repoint export services ke sumber baru + jaga paritas output (row count & kolom identik).
- Klarifikasi arti "kebebasan export" (template existing vs custom column selection).
- Menjaga RBAC, rate-limit, retention, dedup tetap utuh.

### 4.2 Out of Scope
- Ubah lifecycle job export (create/queue/process/complete/expire/S3) — sudah matang.
- Ubah schema collection operasional (dilarang eksplisit: "tanpa mengubah data input").
- Ubah dashboard/metrics analytics agregat (daily-counts untuk dashboard = terpisah).
- Ubah logika broadcast filtering.
- Format export baru selain XLSX (tidak disebut).

### 4.3 Protected Existing Behavior
- Export job lifecycle: create → queue → process → complete → expire (7d) → S3 delete.
- **Multi-tenant/company scoping (KRITIS):** semua baca export WAJIB tetap ter-scope per company/organization/team. Projection/snapshot baru WAJIB membawa `companyId`/`organizationId` dan di-index/partisi atasnya. Kehilangan isolasi = **cross-tenant data leak**.
- **PII & data governance (KRITIS):** row export membawa PII pelanggan (nomor telepon, isi pesan, field `CA:`/`META:`) ke S3 via link 15-menit. Retensi PII hasil export, keamanan link, dan **right-to-erasure vs immutable analytics store** harus dijaga/di-reconcile.
- RBAC: Admin+Supervisor only, Agent denied, Supervisor scoped ke Team Inbox.
- Rate limit: 10/jam per user, max 1 active job per channel; dedup active job per user+channel.
- Date range cap 30 hari.
- Template system: Default + per-Ticket-Type custom fields; Conversation `CA:`/`META:` (cap 200 keys + JSON overflow); Broadcast recipient rows incl `INVALID_REQUEST`.
- Secure download link 15 menit.
- **Read-only terhadap collection operasional** (sudah dijamin hari ini — jangan sampai regress).

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | **Yes (HIGH)** | Conversation/Ticket/Broadcast core entity. Projection/sync menyentuh objek bisnis utama. |
| **Multi-tenant / company scoping** | **Yes (HIGH)** | Read-model/snapshot baru yang salah scope = cross-tenant leak. `tenantId` wajib carry + index. |
| **PII / data governance / compliance** | **Yes (HIGH)** | Row-level export = PII ke S3. Immutable analytics store bentrok dengan erasure/retensi. |
| RBAC / visibility / assignment | Low | Model RBAC tak berubah (gate Admin+Supervisor tetap). |
| API / webhook / socket / queue / cron | **Yes (MEDIUM)** | Jika projection dibangun: event/consumer baru (mis. `analytics.export.project.*`), mungkin extend `analytics.aggregate.*`. |
| SLA / reporting / export | **Yes (HIGH)** | Export = reporting surface. Data-source change pengaruh correctness; wajib paritas row-count old-vs-new. `conversation_sla_metrics` (collection terpisah) harus di-inventarisasi bila kolom SLA ikut di-export. |
| Migration / backfill / feature flag | **Yes (HIGH)** | Backfill historis (**asumsi** volume besar/jutaan record — belum diverifikasi, lihat OQ-7). |
| Existing regression scope | **Yes (HIGH)** | Custom attr cols, metadata 200-key JSON overflow, broadcast `INVALID_REQUEST`, dedup. Side-by-side validation wajib. |

### Early Blast-Radius Notes
- Konflik latent: **analytics daily-metrics TTL/retention vs kebutuhan retensi historis export** — harus dibuat eksplisit (analytics collections mungkin ber-TTL; export butuh histori panjang).
- `conversation_sla_metrics` adalah collection terpisah dari conversation doc — bila export perlu field SLA, sumbernya bukan conversation collection.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `HOLD_NEEDS_DISCOVERY` (primary) |
| Recommended Next Rules | Setelah discovery: `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Jawaban OQ-1..OQ-3 dulu → lalu PRD patch / PRD baru / split |
| Can Proceed to PRD? | **No** — blokir sampai OQ-1..OQ-3 terjawab |

### Routing Rationale
Ambiguitas inti — **"collection analytics" literal (physical DB collection) vs logical (analytics-service pipeline)** — menentukan apakah ini zero-work klarifikasi (fitur sudah jalan lewat analytics-service) atau buildout CQRS multi-sprint. Menulis PRD sebelum OQ-1..OQ-3 terjawab berisiko PRD salah arah.

**Conditional routing (post-discovery):**

| Jika OQ-1 jawabannya... | Route ke... |
|---|---|
| "Analytics pipeline, bukan literal collection" | `ROUTE_PATCH_EXISTING_PRD` — patch PRD offline-report untuk formalkan jaminan data-source + read-only. Engineering minimal. |
| "Literal analytics DB, row-level" | `ROUTE_NEW_PRD` — PRD baru untuk CQRS read-model + repoint export. |
| "Analytics DB tapi agregat cukup" | `ROUTE_PATCH_EXISTING_PRD` — extend export dgn kolom agregat opsional. |
| "Tujuan = decouple read-load saja" | Pertimbangkan **Option E (read replica / secondary read)** sebelum CQRS. |
| "kebebasan export" = custom column picker | `SPLIT_REQUEST` — column picker = NEW_FEATURE, PRD terpisah. |

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-1 | "Collection analytics" itu **literal** collection di DB `satuinbox_analytics` (mis. row-level baru) atau **logical** = analytics-service pipeline (yang sudah orkestrasi job export)? | Menentukan zero-work vs CQRS buildout besar. | **Yes** | PM / User |
| OQ-2 | "Belum lengkap" itu incomplete-nya bagaimana — kolom hilang, tidak ada row-level, atau histori belum ter-backfill? | Menentukan scope gap-closure (enrich schema vs collection baru vs backfill). | **Yes** | PM / User |
| OQ-3 | Tujuan utama data-source change: (a) decouple read-load dari operasional, (b) governance/immutability, (c) retensi historis melebihi TTL operasional, (d) compliance/audit? | (a)→read replica/CQRS; (c)→TTL-aware projection; (d)→immutable snapshot+audit. | **Yes** | PM / User |
| OQ-4 | PRD `offline report download` (v1.0) dianggap PRD untuk request ini atau request terpisah? | Routing REVIVE vs NEW vs PATCH. | Yes | PM |
| OQ-5 | "Kebebasan export sesuai kebutuhan" = user bisa pilih kolom (custom column picker) atau cukup template existing (Default + per-type)? | Column picker = NEW_FEATURE (kandidat SPLIT). | Yes | PM |
| OQ-6 | Ada SLA/performa baru untuk export dari analytics + apakah eventual-consistency lag (projection async) acceptable? | Requirement performa & konsistensi. | No | Eng Lead / PM |
| OQ-7 | Volume record conversation/ticket/broadcast berapa? (\"jutaan\" masih **asumsi**, belum diverifikasi.) | Feasibility & timeline backfill (critical path bila >10M). | No | Engineering |
| OQ-8 | Retensi PII hasil export & rekonsiliasi **right-to-erasure vs immutable analytics store**? | Compliance/governance; bisa jadi blocker legal. | No | PM / Legal / Eng |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM (Dany Christian) | Scope lock + jawab OQ-1..OQ-5 | Pending | Blocker utama |
| Eng Lead (Naftal Yunior) | Sanity arsitektur (Option A–E), volume/backfill | Pending | OQ-6/OQ-7 |
| Stakeholder/Business | Konfirmasi intent bisnis "dari analytics" | Pending | OQ-3 |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD (patch/new) | TBD post-discovery | source scope, change class, current-state baseline |
| Assessment Report | `Assessments/general/sap-report-export/` | protected behavior, impact flags, routing rationale |
| QA Pre-Implementation Review | TBD | impact flags, protected behavior, parity validation |
| Automation Mapping / Test Spec | TBD | traceability + non-scope guard |

---

## 10. Architectural Options (Brainstorm — untuk Discussion, bukan keputusan final)

| Opt | Pendekatan | Tradeoff | Effort |
|-----|-----------|----------|--------|
| **A** | Tetap baca operasional read-only; interpret "analytics" = analytics-service pipeline (sudah begitu) | Memuaskan interpretasi loose; 0 kode; risiko ditolak jika user maksud literal | 0 (klarifikasi PM) |
| **B** | CQRS row-level read-model baru (`conversation_export_view`/`ticket_export_view`/`broadcast_export_view`), sync event-driven + backfill | Decouple bersih, retensi historis, future-proof; tapi infra besar, eventual-consistency lag, backfill berat, schema drift | High |
| **C** | Hybrid: operasional untuk row detail + analytics untuk enrichment agregat (mis. SLA dari `conversation_sla_metrics`) | Perubahan minimal, enrich tanpa collection baru; tapi masih baca operasional (mungkin tak penuhi mandat literal), 2-source latency | Medium |
| **D** | Snapshot on-demand: bikin row-level snapshot sementara dari operasional saat request, render XLSX, buang | Konseptual "dari analytics" tanpa collection persisten; tapi tetap baca operasional saat snapshot, delay, storage temp | Medium |
| **E** | **Read replica / secondary read** (Mongo secondary) atau analytical store (columnar/ClickHouse via CDC) — export workers baca dari replica, bukan primary | Jawaban "lazy mid-rung" untuk tujuan **decouple read-load** tanpa bangun CQRS penuh & tanpa sentuh write operasional; tapi tetap operasional-shaped data, bukan analytics semantik | Low–Medium |

**Rekomendasi:** **A (klarifikasi dulu) → E jika tujuannya cuma decouple read-load → B jika benar-benar butuh analytics DB literal row-level.** C/D adalah half-measure yang tetap menyentuh operasional; berpotensi jadi tech-debt.

---

## 11. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-11 | Initial brief (v1.0). Phase 0 intake + verifikasi kode BE (product ahead of PRD). Routing HOLD_NEEDS_DISCOVERY. 5 opsi arsitektur, 8 open question. Reviewer-hardened: tambah multi-tenant scoping (HIGH), PII/governance (HIGH), Option E (read replica), inventarisasi `conversation_sla_metrics`. | Dany Christian |
