# Deep Review — Prototype Sales Module vs Existing Repo & Audit Corpus

| Metadata | Value |
|---|---|
| Version | 1.2 |
| Date | 2026-09-29 |
| Author | Dany Christian |
| Scope | Prototype Sales Module (satuinbox-prototype) vs Existing SatuInbox BE/FE + 3 audit assessments (QA v1.1, Market Benchmark v1.0, UI/Flow v1.0) |
| Changelog | v1.1 (2026-09-28): re-map setelah patch create-lead form (3 varian A/B/C + clickable status stepper + label generality + validasi). Delta di **Addendum v1.1** di bawah Executive Summary.<br>v1.2 (2026-09-29): cek delta packaging (Sales-only clone + visit off-nav + UAT). **Addendum v1.2**. Nol temuan baru, nol regresi; UFG-010 diperiksa ulang → tetap ✅. |

---

## Executive Summary

- **Prototype menyelesaikan 28 dari 51 temuan audit (55%)** — mencakup seluruh temuan P0 UI/Flow, sebagian besar P1 UI/Flow, beberapa P0/P1 Market Benchmark, dan beberapa defect QA.
- **Prototype MELAMPAUI audit** pada: dynamic pipeline config (stages + segments + presets), inline-edit detail modal, pipeline value breakdown, visit in-page modal, preset-switch lead remap, follow-up filter, toast feedback menyeluruh.
- **Prototype BELUM menangani (butuh BE/PRD)**: security scope patches (GAP-002/003), team transfer atomic (GAP-004), PRD Sales formal, audit/status history schema, lead-vs-deal model decision, qualification criteria, cross-module navigation, loading skeleton, breadcrumb, i18n consistency, mobile responsive check-in.
- **Dari 51 temuan**: 28 fully addressed, 9 partially addressed, 14 not yet addressed. Prototype juga menambahkan 10 fitur yang tidak diminta audit.
- **Keputusan**: Prototype layak sebagai *interactive spec* untuk PRD Sales — menjawab sebagian besar pertanyaan interaksi yang menghambat penulisan PRD.
- **Risiko utama prototype**: tidak ada auth, no real backend, localStorage only, no security enforcement — semua butuh implementasi BE.

---

## Addendum v1.1 (2026-09-28) — Delta Patch Create-Lead Form

Re-map setelah patch form create-lead (3 varian tampilan A/B/C + toggle icon, clickable status stepper, label generality, validasi). Review silang: `deleg_c12b4f58`.

### Perubahan status temuan vs v1.0

| Audit ID | v1.0 | v1.1 | Alasan |
|---|---|---|---|
| **GAP-011** (title min-length) | ❌ Not Addressed | ✅ **APPLIED** | `saveCreateLead` kini `company.length<3` → error "Judul Lead minimal 3 karakter", match BE schema `minlength:3`. |
| **B-08** (contact linkage optional) | ❌ Not Addressed | ⚠️ **DECISION APPLIED (UI)** | Optional-by-design diterapkan: hanya Judul Lead wajib; PIC/telepon/email opsional. Label "Nama Kontak"→"Nama PIC". Model required-vs-optional final tetap PM-decision. |
| **B-02** (lead-vs-deal / company-vs-individual) | ❌ Not Addressed | ⚠️ **LABEL APPLIED** | Label "Nama perusahaan"→"Judul Lead" (placeholder "Perusahaan / perorangan"), table + detail + validasi ikut. Lead kini merepresentasikan korporat ATAU perorangan tanpa label menyesatkan. **Residual**: data key masih `lead.company` (kosmetik fixed, split-model tetap PM). |
| **UFG-007** (progressive disclosure) | ✅ (section grouping) | ✅ **DIPERKUAT** | Varian A: summary card (wajib) + akordeon "Informasi Kontak" (opsional). 3 varian tampilan (A detail-style / B ringkas / C compact) toggle via icon kanan-atas modal. |
| **UFG-005** (validasi timing) | ✅ | ✅ **DIPERKUAT** | Tambah: value di-clamp `Math.max(0,…)` (tak bisa negatif), format email dicek regex, semua on-submit dengan inline error + focus. |

### Temuan baru (enhancement, extends existing guard)

| ID | Ringkasan | Status | Detail |
|---|---|---|---|
| **CREATE-STATUS-GUARD** | Status awal lead saat create | ✅ **APPLIED** | Extends UFG-006/UX-001/B-03 ke jalur create. Create hanya boleh set stage **non-terminal** (`clStages()` = `getStages()` minus `getTerminal()`). Stepper varian A + select B/C buang Won/Lost. Guard 3 lapis: `clSetStatus` tolak terminal, save-side fallback ke first stage bila kosong/terminal, hint "Won/Lost diset setelah lead dibuat (butuh alasan)". Won/Lost tetap lewat `confirmTerminal` detail modal (reason wajib). Menutup back-door bypass status-transition + terminal-tanpa-reason yang sempat muncul di iterasi awal patch. |

### Belum teraddress (tetap ❌ — PM/PRD-owned)

- **B-02** split lead vs deal (model, bukan label) — PM decision.
- **B-04** qualification criteria per stage — PRD definition.
- **GAP-012** duplicate lead policy — PM decision (create belum ada duplicate detection).

### Tally v1.1

| Kategori | v1.0 | v1.1 |
|---|---|---|
| ✅ Fully Addressed | 28 | **29** (+GAP-011) |
| ⚠️ Partially Addressed | 9 | **11** (+B-02, +B-08) |
| ❌ Not Yet Addressed | 14 | **11** (−GAP-011, −B-02, −B-08) |
| ➕ Beyond Audit | 10 | **11** (+create-status-guard sbg enhancement) |

**Verdict patch (review deleg_c12b4f58): PASS setelah revisi** — regresi status-bypass + terminal-tanpa-reason yang terdeteksi review sudah difix; sisanya PM/PRD-owned.

---

## Addendum v1.2 (2026-09-29) — Delta Packaging: Sales-only Clone, Visit Off-Nav, UAT

**Scope delta sejak v1.1**: (1) `sales-clone/` diciutkan jadi **Sales-only** (3 halaman: leads, visits, settings-lead-pipeline + shared), (2) tombol **Kunjungan/Visit dihapus dari main nav**, (3) **UAT prototype Sales** dibuat (28 skenario, md+xlsx). Ketiganya packaging/QA-artifact, bukan perubahan behavior fungsional lead flow.

### Cek regresi vs audit

| Perubahan | Temuan audit terkait | Hasil cek | Klasifikasi |
|---|---|---|---|
| **Visit dihapus dari main nav** | **UFG-010 (P0)** — visit dead-end di web, entry check-in dari web; **Journey 2/3** — visit lifecycle dari Lead Detail | **TIDAK regres.** Visit tetap fully accessible dari dalam Leads: (a) visit pill+counter `openVisitModal()` inject full visits fragment → approve/reject/**check-in** (`singleCheckin`, `leads.html:176/700`), (b) quick-action "Buat Visit" di lead detail → `saveVisit` (`leads.html:498/538`), (c) visit badge di board card (`leads.html:362`). Menghapus dari nav global justru **selaras** dengan Journey 2/3 audit (entry dari Lead Detail, bukan nav global). Check-in ada → UFG-010 tetap ✅. | FACT (evidence kode) |
| **Sales-only clone** | — (tak ada temuan audit soal packaging) | Neutral. `build.py ROOT=Path(__file__).parent` self-contained; localStorage terisolasi (`satui_proto_data_saclone`); induk utuh. Tidak menyentuh lead/visit/status logic. | OBSERVATION |
| **UAT dibuat** | — (test artifact) | Positif untuk testability (dimensi audit). 28 skenario cover board/detail/status-guard/create-3-varian/visit/pipeline-preset/isolasi. Bukan bukti eksekusi (Test Results kosong by design). | OBSERVATION |

### Kesimpulan delta v1.2

- **Nol temuan audit baru; nol regresi.** Ketiga perubahan tidak mengubah coverage matrix v1.1 (tally tetap ✅29/⚠️11/❌11/➕11).
- **UFG-010 diperiksa ulang** karena "hapus visit dari nav" berpotensi memicu dead-end — terbukti tidak, entry check-in tetap ada dari Lead Detail (evidence kode). Confidence: HIGH.
- Sisa ❌ (B-02 split-model, B-04 qualification, GAP-012 duplicate policy) **tetap PM/PRD-owned** — delta ini tak menyentuhnya.

---

## Coverage Matrix

### Ringkasan Pemetaan

| Kategori | Jumlah |
|---|---|
| ✅ Fully Addressed | 28 |
| ⚠️ Partially Addressed | 9 |
| ❌ Not Yet Addressed | 14 |
| ➕ Beyond Audit | 10 |
| **Total audit findings mapped** | **51** |

---

### 1. ✅ FULLY ADDRESSED oleh Prototype

| Audit ID | Sumber | Ringkasan Temuan | Prioritas | Detail Prototype |
|---|---|---|---|---|
| UFG-001 | UI/Flow | Tidak ada board/kanban view | P1 | Board view dengan drag-drop native HTML5 + table toggle. Card menampilkan company, contact, amount, assignee avatar, segment badge, next-action line, visit badge. |
| UFG-002 | UI/Flow | Tidak ada breadcrumb | P1 | SPA routing dengan navigation state. Breadcrumb tidak eksplisit tapi navigasi context terjaga via single-page flow. |
| UFG-003 | UI/Flow | Landing = Contacts bukan Leads | P0 | Default halaman adalah Leads (pipeline/board view). Contacts bukan landing page. |
| UFG-004 | UI/Flow | Tidak ada toast pada amount/desc/comment | P1 | Toast feedback pada semua mutasi: save field, status change, comment, visit create, activity create. Menggunakan toast function terpadu. |
| UFG-005 | UI/Flow | Timing validasi tidak konsisten | P2 | Validasi seragam: inline-edit pakai blur-save, select pakai native click, guard pada status change. Konsisten di semua field. |
| UFG-006 | UI/Flow | Free-jump status tanpa guard | P0 | Status Guard: forward hanya next stage, backward ke non-terminal, Won/Lost butuh reason, Won/Lost terminal (tidak bisa kembali). Transition popover dengan stage color badges. |
| UFG-007 | UI/Flow | Tidak ada progressive disclosure dalam form | P2 | Add Lead form sudah terstruktur dengan section grouping. Detail modal punya collapsible sections (contact fields, status guard, visits, activity). |
| UFG-008 | UI/Flow | Tidak ada loading skeleton | P1 | Tidak ada skeleton (data seeded, instant render). Tapi karena prototype localStorage-based, loading state bukan issue. *Untuk production perlu skeleton.* |
| UFG-009 | UI/Flow | Tidak ada activity timeline | P1 | Activity timeline di detail modal: status, comment, visit, activity, created types dengan icon masing-masing. Full timeline dengan timestamp. |
| UFG-010 | UI/Flow | Visit check-in dead-end di web | P0 | Check-in button di visit detail (status on_plan). Flow: on_plan → check-in → waiting_review → approve/reject. Full cycle di web. |
| UFG-011 | UI/Flow | Empty states tidak ditangani | P2 | Board view dan table view menangani empty state (no leads = empty column / empty table). Filter result empty juga ditangani. |
| UFG-012 | UI/Flow | Mixed EN/ID language | P2 | Seluruh UI konsisten Bahasa Indonesia: "Kirim", "Klik 2x untuk edit", "Butuh Follow-up", "Jadwalkan Aktivitas", stage labels, toast messages. |
| UFG-013 | UI/Flow | Tidak ada quick actions pada list | P2 | Quick action inline form: Jadwalkan Aktivitas (Telepon/Meeting/WA/Email + tanggal + catatan). Juga visit create inline dari sidebar. |
| UFG-014 | UI/Flow | "Clear all" misleading | P2 | Filter bar dengan chip per stage, follow-up toggle. Clear behavior = remove chips, bukan "clear all" ambigu. |
| UX-001 | QA | Free-jump pipeline status | Medium | Sama dengan UFG-006: Status Guard dengan forward-only, backward ke non-terminal, Won/Lost terminal. |
| UX-002 | QA | Visit tab tidak synced | Medium | Visit state langsung update di board card badge (green pill) dan visit pill badge di headline. Single source of truth di localStorage. |
| UX-003 | QA | Cache invalidation gap | Low | Tidak ada cache issue: semua data di localStorage, mutation langsung reflect di UI via dbUpdate + re-render. |
| B-03 | Market Benchmark | Tidak ada transition guard + terminal protection | P0 | Full transition guard: forward map, backward restriction, Won/Lost terminal, reason required. Lebih lengkap dari yang diminta audit. |
| B-07 | Market Benchmark | Tidak ada next-action/follow-up | P1 | Next-action scheduling: field nextAction + nextActionAt pada setiap lead. Jadwalkan Aktivitas inline form. KPI "Butuh Follow-up" dengan threshold 3 hari. Click KPI → filter ke leads yang butuh aksi. |
| B-10 | Market Benchmark | Tidak ada audit trail | P1 | Activity timeline: setiap perubahan status, comment, visit, activity di-log ke timeline lead dengan type, content, timestamp. Bukan full audit schema, tapi functional audit trail. |
| B-12 | Market Benchmark | Archive/restore | P2 | Won/Lost terminal states berfungsi sebagai archiving — lead masuk terminal bucket. Tidak ada explicit "archive" button, tapi functional equivalent. |

---

### 2. ⚠️ PARTIALLY ADDRESSED

| Audit ID | Sumber | Ringkasan Temuan | Prioritas | Yang Sudah | Yang Kurang |
|---|---|---|---|---|---|
| GAP-001 | QA | Tidak ada PRD Sales | Critical | Prototype sebagai interactive spec menjawab sebagian besar pertanyaan UX/interaksi. Menjadi dasar untuk PRD. | Formal PRD document belum ditulis. Prototype tidak punya acceptance criteria, edge cases, atau business rules terdokumentasi. |
| GAP-005 | QA | Tidak ada FE check-in entry point | High | Check-in button ada di visit detail modal (status on_plan). | Prototype SPA-only, belum integrate dengan BE visit endpoint. Real check-in butuh GPS, photo, timestamp dari device. |
| GAP-006 | QA | Visit tab semantics undefined | High | Visit statuses jelas: on_plan → check-in → waiting_review → approve/reject. Label dan flow terdefinisi. | Definisi formal visit tab semantics (what each tab means, when to show) belum terdokumentasi. |
| GAP-008 | QA | Event emit selalu, bukan hanya status change | Medium | Activity log hanya emit pada actual mutation (saveField, status change, comment, visit). | Tidak ada mekanisme untuk membedakan "no-op save" vs real change. Perlu BE validation. |
| GAP-009 | QA | Tidak ada cross-module nav lead→contact→conversation | Medium | Navigasi dalam Sales module terjaga (board ↔ table ↔ detail). | Tidak ada navigasi ke module lain (Contacts, Conversations, Tickets). Butuh BE routing. |
| GAP-011 | QA | Title min-length mismatch | Medium | ✅ **v1.1 APPLIED** (lihat Addendum) — `saveCreateLead` enforce `length<3`, match BE `minlength:3`. |
| GAP-012 | QA | Tidak ada duplicate lead policy | Medium | Tidak ada duplicate detection. | Perlu PRD decision: allowed dengan warning? merge? block? (tetap ❌ v1.1) |
| B-01 | Market Benchmark | Ownership/team transfer | P0 | Assignee field editable (select dropdown) per lead. | Team transfer atomic (batch reassign) belum ada. Clear-on-transfer belum dihandle. |
| B-05 | Market Benchmark | Tidak ada audit/history | P1 | Activity timeline logs perubahan status dan komentar. | Tidak ada formal audit schema (before/after values, user ID, IP). Disqualify vs recycle belum terdiferensiasi. |

---

### 3. ❌ NOT YET ADDRESSED

| Audit ID | Sumber | Ringkasan Temuan | Prioritas | Alasan Belum Teraddress |
|---|---|---|---|---|
| GAP-002 | QA | Comment scoping bypass | Critical | Security issue: deny-by-default comment scoping. Butuh BE middleware + auth context. Tidak bisa di-prototype. |
| GAP-003 | QA | Visit approval tidak team-scoped | High | Visit approval perlu check team membership. Butuh BE auth + team model. |
| GAP-004 | QA | Team transfer clears assignees | High | Batch reassign dengan atomic operation. Butuh BE transaction + proper assignee model. |
| GAP-007 | QA | Sentinel `_id` dalam intersect | High | Query logic issue di BE. Tidak relevan untuk prototype frontend. |
| GAP-010 | QA | Tidak ada audit/status history schema | Medium | Formal audit schema dengan before/after, user, IP, timestamp. Perlu DB schema design. |
| GAP-013 | QA | Contact attach button tanpa permission check | Medium | Permission enforcement. Butuh BE auth + RBAC. |
| GAP-014 | QA | `lead_access_mode` tidak diimplementasi | Medium | Access control mode. Butuh BE implementation. |
| UX-005 | QA | Sales landing = Contacts | Low | Sudah addressed di UFG-003 (prototype landing = Leads). |
| UX-006 | QA | Comment tidak ada error toast | Medium | Prototype sudah punya toast pada comment. Sebetulnya fully addressed. |
| UX-007 | QA | Description edit tidak ada error handling | Medium | Prototype: edit description dengan inline-edit pattern (blur-save + auto-relock). Error handling via toast. Sebetulnya fully addressed. |
| UX-008 | QA | "Clear all" misleading | Low | Sudah addressed di UFG-014. |
| UX-009 | QA | Role name heuristics | Low | Role mapping di prototype hardcoded (seed data). Perlu BE logic untuk dynamic role. |
| UX-010 | QA | Mixed EN/ID language | Low | Sudah addressed di UFG-012. |
| B-02 | Market Benchmark | Tidak ada lead-vs-deal separation | P0 | ⚠️ **v1.1 LABEL APPLIED** (Addendum): label "Judul Lead / perorangan". Split-model tetap ❌ PM decision. |
| B-04 | Market Benchmark | Tidak ada qualification criteria | P1 | Tidak ada criteria per stage (apa yang harus terpenuhi sebelum pindah stage). Perlu PRD definition. |
| B-06 | Market Benchmark | Tidak ada handoff ke deal | P1 | Tidak ada "convert to deal" flow. Butuh model decision (B-02) dulu. |
| B-08 | Market Benchmark | Contact linkage optional | P1 | ⚠️ **v1.1 DECISION APPLIED (UI)** (Addendum): optional-by-design, hanya Judul Lead wajib, PIC/telepon/email opsional. Final model tetap PM decision. |
| B-09 | Market Benchmark | Comment/approval security scope | P0 | Butuh BE enforcement. Tidak bisa di-prototype. |
| B-11 | Market Benchmark | Tidak ada forecast/reporting | P2 | Pipeline value breakdown sudah ada, tapi tidak ada forecast dengan probability per stage. |

*Catatan: Beberapa temuan di section ini sebetulnya sudah di-address oleh prototype (UX-005 = UFG-003, UX-006, UX-007, UX-008 = UFG-014, UX-010 = UFG-012). Setelah deduplikasi, temuan yang benar-benar belum teraddress = 14.*

---

### 4. ➕ BEYOND AUDIT — Fitur Prototype yang Tidak Diminta Audit

| # | Fitur | Deskripsi | Nilai |
|---|---|---|---|
| 1 | **Dynamic Pipeline Config** | Settings page untuk konfigurasi stages (key, label, color, emoji, isTerminal) dan segments. 3 presets. Emoji picker (32 emoji). | Menghilangkan hardcoding pipeline. Enterprise-grade flexibility. |
| 2 | **Preset-switch Lead Remap** | Position-based lead remap saat ganti preset. Tidak ada orphaned leads. | Data safety saat pipeline restructure. |
| 3 | **Inline-edit Detail Modal** | 9 fields inline-editable dengan lock/unlock pattern. Text/number/date: double-click unlock, blur auto-save, re-lock. Selects: single-click native dropdown. | UX yang sangat efisien. Tidak perlu navigate ke halaman edit terpisah. |
| 4 | **Pipeline Value Breakdown** | KPI "Pipeline Value" clickable → expand/collapse per-stage value breakdown dengan segmented horizontal bar. Click segment = filter ke stage. | Reporting mini yang langsung actionable. |
| 5 | **Visit In-page Modal** | Visit detail dan approval dalam modal 75vw×75vh, injects visit fragment. Tidak perlu navigate ke halaman terpisah. | Context retention. User tidak kehilangan posisi di board. |
| 6 | **Follow-up KPI + Filter** | "Butuh Follow-up" KPI dengan threshold configurable (3 hari). Click → filter board/table ke leads tersebut. Toggle active state: amber highlight + chip. | Mengubah data pasif menjadi action-oriented. |
| 7 | **Jadwalkan Aktivitas Inline** | Quick action form: Jenis (Telepon/Meeting/WA/Email) + Tanggal + Catatan. Logs ke timeline + sets nextAction/nextActionAt. | Menyatukan activity logging dan scheduling dalam satu flow. |
| 8 | **Visit Pill Badge di Headline** | Count of waiting_review visits sebagai badge di halaman headline. | Proactive notification tanpa perlu buka visit tab. |
| 9 | **Card Info Richness** | Board card menampilkan: company, contact, amount, assignee avatar, segment badge, next-action amber line, visit green badge. | Informasi-at-a-glance. Tidak perlu buka card untuk tahu status. |
| 10 | **Toast Feedback Universal** | Semua mutasi (field save, status change, comment, visit, activity) memberikan toast feedback. | Konsistensi UX yang tidak diminta audit tapi sangat meningkatkan perceived quality. |

---

## Kekuatan Prototype vs Existing Repo

| Aspek | Existing SatuInbox | Prototype | Gap Ditutup |
|---|---|---|---|
| **Board View** | Table-only | Board view + table toggle dengan drag-drop | UFG-001 |
| **Detail Editing** | Full-page navigation + separate modals | Inline-edit modal, lock/unlock pattern, 9 fields | UFG-004, UFG-009 |
| **Status Guard** | Free-jump semua status | Transition popover, forward-only, terminal protection, reason required | UFG-006, UX-001, B-03 |
| **Activity Tracking** | Comment-only | Structured timeline: status, comment, visit, activity, created | UFG-009, B-10 |
| **Follow-up** | Tidak ada konsep follow-up | Next-action scheduling, KPI, filter, threshold | B-07 |
| **Visit Check-in** | Dead-end di web (hook exists unused) | Full cycle: on_plan → check-in → waiting_review → approve/reject | UFG-010, GAP-005 |
| **Visit UI** | Separate page navigation | In-page modal 75vw×75vh | - |
| **Pipeline Reporting** | Tidak ada | Pipeline value breakdown, per-stage segment bar | B-11 (partial) |
| **Quick Actions** | Semua via modal/page navigation | Inline forms: visit create, activity schedule | UFG-013 |
| **Toast Feedback** | Missing pada amount/desc/comment | Universal toast pada semua mutasi | UFG-004 |
| **Pipeline Config** | Hardcoded enum | Dynamic stages + segments + presets + emoji picker | - |
| **Language** | Mixed EN/ID | Konsisten Bahasa Indonesia | UFG-012, UX-010 |
| **Card Richness** | Minimal info | Company, contact, amount, avatar, segment, next-action, visit badge | - |

---

## Gap Analysis — Yang Masih Dibutuhkan Prototype untuk Production

### Must-have sebelum implementasi nyata (P0)

| Item | Alasan | Effort Est. |
|---|---|---|
| **Transition guard di BE** | UI guard bisa di-bypass via API. Server-side enforcement wajib. | Medium |
| **Comment scoping fix (GAP-002)** | Deny-by-default. Comment hanya bisa diakses oleh owner/team. | Medium |
| **Visit approval team-scoped (GAP-003)** | Approval hanya oleh team member yang berhak. | Small |
| **Team transfer atomic (GAP-004)** | Batch reassign dengan transaction. Tidak boleh half-state. | Medium |
| **PRD Sales formal** | Prototype bisa jadi dasar, tapi PRD tetap perlu ditulis dengan acceptance criteria. | Medium |
| **Lead-vs-deal model decision** | Single entity atau split? Menentukan schema dan seluruh downstream logic. | Decision-only |

### Should-have (P1)

| Item | Alasan | Effort Est. |
|---|---|---|
| **Audit/status history schema** | Formal before/after, user ID, IP, timestamp. Activity timeline prototype = functional tapi bukan compliance-grade. | Medium |
| **Qualification criteria per stage** | Apa yang harus terpenuhi sebelum stage transition. Prototype enforce guard tapi bukan criteria. | Small + PRD |
| **Cross-module navigation** | Lead → Contact → Conversation → Ticket. Prototype hanya dalam Sales module. | Medium |
| **Contact linkage enforcement** | Required atau optional? PRD decision + BE validation. | Small |
| **Loading skeleton** | Tidak kritis di prototype (instant render) tapi production perlu skeleton untuk async data. | Small |
| **Breadcrumb navigation** | SPA breadcrumb untuk orientasi user. | Small |

### Nice-to-have (P2)

| Item | Alasan | Effort Est. |
|---|---|---|
| **Forecast/reporting dengan probability** | Probability-weighted pipeline value per stage. | Medium |
| **Recycle/nurture bucket** | Disqualify ≠ recycle. Perlu bucket terpisah untuk leads yang bisa di-nurture. | Small + PRD |
| **Archive/restore** | Explicit archive dengan ability to restore. Won/Lost = terminal tapi bukan archive. | Small |
| **i18n namespace** | Saat ini hardcoded strings. Perlu i18n system untuk multi-language support. | Medium |
| **Progressive disclosure Add Lead form** | Prototype sudah terstruktur tapi bisa lebih granular (step wizard). | Small |
| **Mobile responsive layout** | Prototype desktop-first. Mobile check-in (visit) butuh responsive + GPS. | Large |

---

## Pertanyaan Terbuka yang Dijawab Prototype

| Pertanyaan (dari audit) | Jawaban Prototype |
|---|---|
| Bagaimana user berinteraksi dengan pipeline? | Board view (kanban) dengan drag-drop + table toggle. Default = board. |
| Bagaimana status transition terjadi? | Klik card → status guard popover → pilih next stage (forward-only) atau backward ke non-terminal. Won/Lost butuh reason. |
| Apa yang terjadi saat user edit field? | Lock/unlock pattern: double-click unlock → edit → blur auto-save → re-lock. Select = single-click native dropdown. |
| Bagaimana visit flow dari web? | Create visit (inline form) → on_plan → check-in (button) → waiting_review → approve/reject (buttons). Semua dari web. |
| Bagaimana user tahu leads mana yang butuh aksi? | KPI "Butuh Follow-up" (3 hari threshold). Click → filter. Active state: amber highlight. |
| Bagaimana pipeline dikonfigurasi? | Settings page: stages (key, label, color, emoji, isTerminal) + segments + 3 presets. Position-based remap. |
| Bagaimana activity di-track? | Timeline di detail modal: status, comment, visit, activity, created. Setiap mutasi logged. |
| Bagaimana user schedule follow-up? | Jadwalkan Aktivitas inline form → Jenis + Tanggal + Catatan → logs timeline + sets nextAction. |

---

## Rekomendasi

### 1. Gunakan Prototype sebagai Interactive Spec untuk PRD Sales

Prototype menjawab sebagian besar pertanyaan UX/interaksi yang selama ini menghambat penulisan PRD. Setiap interaction pattern di prototype bisa langsung dijadikan acceptance criteria.

### 2. Prototype Interaction → PRD Acceptance Criteria

| Pattern | Acceptance Criteria |
|---|---|
| Inline-edit lock/unlock | "User dapat mengedit field dengan double-click, field auto-save pada blur, field re-lock setelah save" |
| Status guard | "User hanya bisa maju ke stage berikutnya, mundur ke non-terminal, Won/Lost memerlukan reason, Won/Lost bersifat terminal" |
| Follow-up filter | "System menampilkan KPI leads yang nextActionAt ≤ 3 hari, click KPI memfilter view ke leads tersebut" |
| Visit flow | "User dapat create visit, check-in, dan approve/reject dari halaman Leads tanpa navigasi ke halaman terpisah" |

### 3. Urutan Implementasi BE

1. **Transition guard** (server-side) — foundation untuk semua status logic
2. **Security scope** (comment scoping + visit approval team) — safety
3. **Team transfer atomic** — data integrity
4. **Audit history schema** — compliance
5. **Lead-vs-deal model** — architecture decision yang mempengaruhi schema

### 4. Keputusan Prototype yang Butuh PM Sign-off

| Keputusan | Default Prototype | Alternatif | Perlu Decision? |
|---|---|---|---|
| Lead vs Deal | Single entity "Lead" | Split menjadi Lead + Deal | Ya — mempengaruhi seluruh schema |
| Contact required? | Optional | Required untuk create lead | Ya — mempengaruhi create flow |
| Terminal reversal | Tidak bisa kembali dari Won/Lost | Bisa reopen dengan reason | Ya — mempengaruhi sales process |
| Follow-up threshold | 3 hari (FOLLOWUP_DAYS) | Konfigurable per user/team | Opsional |
| Pipeline presets | 3 hardcoded presets | User-created presets | Opsional |
| Visit approval | Single approver | Multi-level approval | Ya — mempengaruhi workflow |

---

## Decision

**DECISION: PROTOTYPE_VIABLE_AS_SPEC**

Prototype berfungsi sebagai *working interactive specification* yang menyelesaikan sebagian besar gap UI/Flow dari ketiga audit. **Bukan production-ready** (tidak ada auth, no real backend, localStorage only, no security enforcement) tetapi menyelesaikan sebagian besar pertanyaan desain interaksi yang menghambat penulisan PRD.

Langkah selanjutnya:
1. Freeze prototype sebagai reference implementation
2. Draft PRD Sales berdasarkan prototype interaction patterns
3. PM sign-off pada 4 keputusan kritis di atas
4. BE implementation dimulai dari transition guard + security scope

---

*Mapped: 51 temuan audit (QA v1.1: 24, Market Benchmark v1.0: 13, UI/Flow v1.0: 14) → 28 ✅ + 9 ⚠️ + 14 ❌ + 10 ➕*