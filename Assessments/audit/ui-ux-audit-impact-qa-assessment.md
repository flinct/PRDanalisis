# Assessment Report: UI/UX Audit Findings — Analysis & Repo Impact

> **Assessment Type:** Type 3 — Interconnection Analysis (cross-domain UI/UX) + Type 2 — Bug Fix Analysis (per-finding)
> **Owner:** Analyst
> **Source Input:** `Assessments/audit/Satuinbox  - UI_UX Audit Report.md` (Heuristic Evaluation by Sabrina, 5 June 2026)
> **Assessment Artifact Path:** `Assessments/audit/ui-ux-audit-impact-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** none
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-23
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Initial version. Dokumen ini menganalisis **dua hal sekaligus** karena diminta dalam satu prompt:
  1. **Analisa audit itu sendiri** — apa yang sudah kuat, apa yang lemah, dan apakah metodologi/cakupan cukup untuk jadi basis perbaikan FE.
  2. **Impact ketika audit diterapkan ke repo FE SatuInbox** (`omnichannel-satuinbox-fe`) — apa yang berubah, di mana, dengan risiko apa.
- Risiko baru yang muncul: audit sama sekali tidak menyentuh **a11y formal (WCAG)**, **state-driven permission visibility**, **socket-driven realtime consistency**, dan **performance/bundle** — padahal ini semua bagian integral dari FE v2.7.0. Tanpa cakupan itu, audit tidak boleh dipakai sebagai basis PROCEED tunggal.
- Keputusan: `PROCEED_WITH_CAUTION` per-cluster, dengan gate mandatory: audit harus direvisi untuk a11y + i18n + responsive breakpoint + permissions, lalu dipecah per-area kerja (Inbox / Ticket / Broadcast / Settings) menjadi PRD mini + Test Spec + Automation Mapping.

---

## 1. Overview

### 1.1 Feature / Issue

**UI/UX Audit Heuristic Evaluation** oleh Sabrina (5 Juni 2026) terhadap produk SatuInbox FE v2.7.0. Mengacu pada **Jakob Nielsen's 10 usability heuristics** dengan severity rating 0–4.

### 1.2 Objective

Mengevaluasi:

1. Apakah audit itu sendiri metodologis cukup untuk jadi decision-bearing input.
2. Bila audit diterapkan sebagai remediation backlog ke repo FE, apa blast radius-nya: modul FE mana, atom mana, package mana, state apa, dan apa risiko regresi.

### 1.3 Business Context

- **Produk:** Omnichannel CS platform dengan WA Web integration.
- **FE release canonical saat ini:** `v2.7.0` (per `Memory/CLAUDE-fe.md`, verified 2026-06-12).
- **FE audit coverage:** 7 area (Registration/Auth, Team Invitation, Channel Setup, **Inbox & Omnichannel**, **Ticketing**, **Reporting & Dashboard**, **Settings**) → 4 area bermasalah.
- **Total temuan:** 31 (audit mencantumkan 30 bernomor + 3 temuan sidebar/minimize → total 33, dengan 2 tanpa nomor).

### 1.4 Scope In

- 31+ temuan UI/UX heuristic bernomor dan non-bernomor (sidebar, minimize, header tiket).
- Mapping ke struktur FE repo (`apps/omnichannel/**`, `packages/ui/**`).
- Identifikasi risiko regresi, a11y gap, dan dependencies ke atom UI.
- Rekomendasi cluster kerja.

### 1.5 Scope Out

- Audit BE (audit murni FE — tidak menyentuh service/gRPC/queue).
- Performance engineering / bundle size (tidak di-scope audit, meski beberapa item terkait).
- Pemenuhan formal WCAG 2.2 AA (tidak diukur audit, meski sebagian implisit di severity 3).
- Audit terhadap repositori lain (`sixV2Automation`, `backend-v2`, dsb.) — di luar konteks prompt.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`
**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**

Audit layak dipakai sebagai **backlog input** tapi **bukan satu-satunya decision-bearing source**. Wajib ada **revision pass** dulu (tambah cakupan a11y formal, i18n string completeness, responsive breakpoint matrix, RBAC visibility) sebelum setiap item Severity 3 di-commit. Implementasi harus **dipecah per-cluster** (Settings, Inbox, Ticket, Broadcast, Sidebar, Reporting), bukan flat 33-item sprint, karena banyak item menyentuh atom UI shared yang akan mem-blast seluruh aplikasi.

### 2.2 Required Actions Before Development

- [ ] **AUD-REV-01** — Tambah section cakupan: **a11y formal** (contrast ratio ≥ 4.5:1 untuk body text per WCAG 2.1 AA), **keyboard-only navigation**, **screen reader semantics** (ARIA roles, live regions).
- [ ] **AUD-REV-02** — Tambah section **i18n completeness** — apakah semua string baru sudah masuk `next-intl`? (per FE rule: "All user-visible text must use next-intl. Never hardcode display strings.")
- [ ] **AUD-REV-03** — Tambah section **responsive breakpoints** — ukur di ≥3 viewport: mobile <640px, tablet 768–1024, laptop 1280–1440, large 1920+. Audit cuma menyebut "layar laptop kecil" (item #33).
- [ ] **AUD-REV-04** — Tambah section **permission-driven visibility** — apakah perubahan CTA/Save/Cancel konsisten untuk semua role (Agent/Supervisor/Admin/Super Admin)?
- [ ] **AUD-REV-05** — Setiap Severity 3 dipecah jadi mini-PRD dengan acceptance criteria + test case TC-XXX-XXX sebelum di-sprint.
- [ ] **AUD-REV-06** — Cross-check dengan **feature memory undeveloped** (Hold/Snooze/Related/Collections) karena beberapa area audit (mis. "Tambah tombol Save di Roles" #22) bisa conflict dengan rencana RBAC v2.
- [ ] **AUD-REV-07** — Audit fitur non-listed (Broadcast preview, Shift Hours delete, WhatsApp Web filter clear) untuk konfirmasi tidak ada dependensi BE yang belum ada.

### 2.3 Key Blocking Reasons / Conditions

- **B-01 — A11y tidak diukur:** Item #4 (warna badge filter) disebut "tidak terlihat jelas" — tanpa angka kontras, sulit dijadikan acceptance criterion.
- **B-02 — Responsive tidak terukur:** Item #33 (panel atas tiket makan ruang) menyebut "layar lebih kecil" tanpa ukuran. Implementasi butuh spec eksplisit (px breakpoint).
- **B-03 — Atom dependency belum dipetakan:** Item #8, #13, #16, #26 semua menyentuh "field dan badge ukuran tidak konsisten" — tanpa mapping ke `@satuinbox/ui` atoms (badge, button, input), perbaikan bisa di-skip di satu halaman tapi tidak di yang lain.
- **B-04 — PRD V2 conflict potential:** Item #22 (Save di Roles) dan item #17 (auto-save di roles) — perlu dicek apakah V2 Conversation / V2 Ticket / V2 WA Web sudah pernah menentukan pattern. Jangan override tanpa diskusi PM.

### 2.4 Complexity and Risk Snapshot

| Item | Value |
|------|-------|
| **Complexity Level** | **High** (33 item, multi-domain, menyentuh shared atoms + state) |
| **Risk Level** | **HIGH** (blast radius ke shared UI + i18n + RBAC + responsive) |
| **Primary Impact Areas** | UI / i18n / RBAC / Responsive / State (Zustand) / Automation (Page Objects) |
| **Estimated Effort Bucket** | ~10–14 sprint-weeks untuk Severity 3 saja (8 item × ~1.5 SP rata-rata + shared refactor) |

---

## 3. Audit Methodology Analysis (Analisa Audit Itu Sendiri)

### 3.1 Apa yang sudah kuat

| Aspek | Penilaian | Bukti |
|-------|-----------|-------|
| Framework acuan | ✅ Kuat | Nielsen's 10 heuristics — standariasi industri, mudah diaudit. |
| Severity rating | ✅ Kuat | Skala 0–4 dengan definisi eksplisit. Semua item P0–P3 bisa dipetakan. |
| Scope area | ⚠️ Cukup, tapi ada gap | 7 area; Inbox + Settings paling detail. Tidak menyentuh Lead, Notification, CSAT, Transcript, Statistic (kecuali Analytic card). |
| Severity distribution | ✅ Realistis | 0 catastrophe, 6 major (sev 3), 25 minor/cosmetic. Menunjukkan produk sudah cukup mature. |
| Heuristic principle summary | ✅ Kuat | Tabel count per principle — gampang dibaca PM. |
| Solution/recommendation per item | ✅ Kuat | Setiap finding ada saran konkret — langsung jadi acceptance criterion. |

### 3.2 Apa yang lemah / hilang

| Aspek | Penilaian | Risiko |
|-------|-----------|--------|
| **A11y formal (WCAG 2.1 AA)** | ❌ Tidak diukur | Backlog jadi bias "visual only". Risk: gagal compliance, gagal screen reader test. |
| **Keyboard navigation** | ❌ Tidak diuji | Semua Save/Cancel baru (item #17, #22, #28) tanpa keyboard flow = eksklusi agent dengan motor impairment. |
| **i18n coverage** | ❌ Tidak disentuh | FE rule eksplisit: "All user-visible text must use next-intl". Audit #11 (broadcast error "bahasa teknis") dan #28 (Save button) bisa di-handle via i18n key. |
| **Responsive matrix eksplisit** | ⚠️ Parsial | Hanya item #33 menyebut laptop. Padahal FE punya komponen kompleks (3-column conversation, drawer ticket) yang sering break di tablet. |
| **Performance / bundle** | ❌ Tidak disentuh | Tambah 31 item UI berpotensi nambah bundle. Tanpa baseline, tak terukur. |
| **RBAC matrix** | ❌ Tidak disentuh | Save/Cancel yang ditambahkan (#17, #22, #28) harus diverifikasi untuk 4 role (Agent/Supervisor/Admin/Super Admin). Agent role punya batasan permission. |
| **Realtime consistency** | ❌ Tidak disentuh | Item #1 (counter pesan tidak sinkron) bisa terkait event socket `/conversations`. Audit tidak sebut ini. |
| **State coverage (Zustand)** | ❌ Tidak disentuh | Item #1 (counter) dan item #6 (Done button) bisa saling konflik dengan persisted filter state di `conversation.store.ts`. |
| **Data flow / BE contract** | ⚠️ Parsial | Item #21 (filter WA Web tanpa All/Clear) dan #29 (CTA error) bisa jadi masalah BE response shape, bukan murni FE. |
| **Numbered vs unnumbered findings** | ❌ Inkonsisten | Audit punya 30 bernomor + 3 tanpa nomor (sidebar minimize, sidebar clutter, header tiket laptop). 3 terakhir gampang terlewat. |
| **Visual evidence / screenshot** | ⚠️ Minim | Hanya 1 inline image + 1 base64 (kebanyakan hanya di-decode). Untuk Severity 3, evidence visual wajib. |

### 3.3 Heuristic principle distribution (dari audit)

| Principle | Count | Catatan Kritis |
|-----------|------:|----------------|
| Consistency & Standards | 8 | Tertinggi — indikasi design system belum enforced. |
| Visibility of System Status | 6 | Counter & state indicator lemah. |
| User Control & Freedom | 3 | Back/Cancel/Reset hilang. |
| Recognition Rather Than Recall | 3 | Selection counter & metadata hilang. |
| Aesthetic & Minimalist Design | 3 | Ukuran & spacing tidak konsisten. |
| Error Prevention | 2 | Auto-save tanpa confirmation. |
| Match Between System & Real World | 2 | Bahasa teknis, icon tidak familiar. |
| Flexibility & Efficiency of Use | 2 | Filter tanggal, table rapi. |
| Help Users Recognize/Diagnose/Recover | 1 | Empty state error WA Web. |
| Help & Documentation | 0 | Audit tidak menemukan gap — tapi juga tidak menguji help system. |

**Interpretasi:** Proporsi Consistency & Standards (8/33 = 24%) mengkonfirmasi bahwa masalah utamanya bukan "fitur hilang" tapi **design system belum dipaksakan**. Ini bukan sprint 33-item — ini **design system enforcement project** yang harus dimulai dari atom dan baru kemudian override per-halaman.

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

```
┌────────────────────────────────────────────────────────────────────┐
│ CURRENT FE STATE (v2.7.0) — Audit Findings as-is                  │
├────────────────────────────────────────────────────────────────────┤
│ Inbox & Omnichannel:                                               │
│  - Sidebar counter ≠ list counter (item #1)                        │
│  - Bulk select tanpa counter "X dipilih" (#2)                       │
│  - Filter dropdown tanpa chevron icon (#3)                          │
│  - Badge filter kontras rendah + no clear-all (#4)                  │
│  - Button text overflow (#5)                                       │
│  - Visibility update tanpa Done CTA (#6)                            │
│  - Create Ticket CTA kurang menonjol (#7)                           │
│                                                                    │
│ Ticketing:                                                          │
│  - Field & badge size in-konsisten (#8)                              │
│  - Header tiket makan ruang di laptop kecil (#33)                    │
│                                                                    │
│ Broadcast:                                                          │
│  - Template tanpa preview (#9)                                      │
│  - Sidebar broadcast icon no active state (#10)                     │
│  - Draft error message bahasa teknis (#11)                          │
│                                                                    │
│ Reporting:                                                          │
│  - Card metric conversation no visual differentiation (#12)         │
│                                                                    │
│ Contacts:                                                           │
│  - Form add contact field size warna beda (#13)                     │
│  - Filter contact no date/terbaru (#14)                             │
│                                                                    │
│ Leads:                                                              │
│  - "Hapus Semua" tampil meski tidak ada filter (#15)                │
│  - Field & badge size beda (#16)                                    │
│                                                                    │
│ Settings:                                                           │
│  - Roles auto-save tanpa Save/Cancel (#17, #22)                     │
│  - CSAT card toggle size beda (#18)                                 │
│  - Widget button icon tidak familiar + checkbox unclear (#19)       │
│  - WA Web button hilang saat disabled (#20)                         │
│  - WA Web filter no All/Clear (#21)                                 │
│  - Shift Hours table alignment + no Delete action (#23)             │
│  - Tag success pakai warna merah (#24)                              │
│  - "Kontak Masuk Tim" search no metadata (#25)                      │
│  - Settings Tickets section title inconsistent (#26)                │
│  - Ticket Tipe Tiket Tambah no back/breadcrumb (#27)                │
│  - Jam Shift button "kurang terlihat" (#28)                         │
│  - WA Web error no actionable CTA (#29)                              │
│  - Settings Tickets form not clean (#30)                            │
│  - Settings Anggota dropdown useless (#31)                          │
│                                                                    │
│ Global/Sidebar:                                                     │
│  - Sidebar minimize no tooltip label (sidebar #1)                   │
│  - Sidebar channel list cluttered (sidebar #2)                      │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 Proposed State (To-Be)

```
┌────────────────────────────────────────────────────────────────────┐
│ PROPOSED TARGET STATE — Post-Remediation                          │
├────────────────────────────────────────────────────────────────────┤
│ A. ATOM LEVEL (packages/ui) — refactor dulu:                       │
│   1. <Badge /> variants unified size (sm/md) + contrast token       │
│   2. <Button /> consistent size scale (xs/sm/md/lg) per page role  │
│   3. <Input /> field unified width + border + spacing               │
│   4. <Select /> mandatory chevron icon                              │
│   5. <DropdownMenu /> hide if no actions                            │
│   6. <Toggle /> aligned grid sizing                                  │
│   7. <Form /> pattern (label, helper, error) standardized           │
│   8. <EmptyState /> with primary CTA + secondary action             │
│   9. <CounterChip /> for "X dipilih"                                │
│  10. <SidebarTooltip /> for minimized state                         │
│                                                                    │
│ B. SHARED TOKENS:                                                    │
│   1. status-color: success/green, warning/yellow, danger/red        │
│      (audit #24 fix: tag success pakai merah → harus hijau)         │
│   2. spacing token scale (consistent field heights & paddings)      │
│   3. responsive breakpoints (mobile/tablet/laptop/large)             │
│                                                                    │
│ C. PAGE-LEVEL OVERRIDES:                                             │
│   1. Inbox chat list: counter sync via store + socket               │
│   2. Bulk select: counter chip + sticky action bar                   │
│   3. Filter bar: chevron + clear-all + a11y badge color              │
│   4. Settings forms: Save/Cancel pattern + dirty-state               │
│   5. WA Web filter: All/Clear/Reset + empty-state CTA                │
│   6. Tipe Tiket Tambah: Back button + breadcrumb                     │
│   7. Sidebar minimize: tooltip on hover                              │
│   8. Sidebar: hide disabled channels                                 │
│                                                                    │
│ D. PATTERN LIBRARY:                                                  │
│   1. <ConfirmationDialog /> for risky changes (auto-save override)  │
│   2. <DirtyStateGuard /> untuk Save/Cancel flow                     │
│   3. <ResponsivePanel /> untuk collapsible side panel                │
└────────────────────────────────────────────────────────────────────┘
```

### 4.3 State Transition / Data Flow Notes

| Finding | State yang berubah | Flow impact |
|---------|--------------------|-------------|
| #1 counter sync | `conversation.store.ts` (counter) + `/conversations` socket event payload | Tambah `unread_count` field consistency; perlu subscribe event `conversation-updated` |
| #6 Done button | `conversation.store.ts` (visibility settings) | Tambah explicit commit action, tidak auto-save |
| #9 Preview template | `broadcast/draft` state + modal baru | Tambah `previewOpen` + `selectedTemplateId` di store |
| #15 Hide CTA when empty | `leads.store.ts` (active filters) | Computed `hasActiveFilters` di selector |
| #17, #22 Save/Cancel | `setting.store.ts` (roles) + `member/` service | Tambah dirty-state tracking + rollback on cancel |
| #21 WA Web filter | `whatsappWeb.store.ts` (filters) | Tambah `clearAllFilters()` action + "All" option |
| #28 Save button visibility | `shift-hours/` service | Tambah `isDirty` derived state |
| #33 Responsive header | layout component (ticket detail drawer) | Conditional render ticket description on mobile |

---

## 5. Impact Analysis (Ketika Audit Diterapkan ke Repo FE)

### 5.1 Impact Matrix per Dimension

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|-----------|-------------|------------------|--------------|--------------------|
| **Module — Sidebar** | Tambah tooltip + hide disabled channel | `components/molecules/main-side-nav/**` + nav config | **HIGH** | Perlu audit seluruh channel config dari settings, jangan hide channel yang masih punya notifikasi aktif. |
| **Module — Inbox** | Counter sync + bulk counter + filter chevron + clear-all + Done CTA | `components/molecules/conversations/**` + `components/pages/conversations/**` + `stores/conversation/**` | **HIGH** | Counter sync wajib single source of truth di store, bukan derived di 2 tempat. |
| **Module — Ticket Detail** | Back/breadcrumb + form pattern + responsive header | `components/molecules/ticket/**` + `components/molecules/ticketing/**` + `app/[locale]/(main)/ticketing/**` | **HIGH** | Hati-hati: drawer layout (v2.7.0) — back button behavior beda dengan page route. |
| **Module — Settings** | Save/Cancel pattern (Roles, Shift Hours, Tag, Tickets) + WA Web filter | `components/molecules/settings/**` (10+ sub-folder) + `components/pages/settings/**` | **HIGH** | 8+ settings page terdampak — refactor pattern dulu baru override. |
| **Module — Broadcast** | Template preview + sidebar active state + error wording | `components/molecules/broadcast/**` + `components/pages/broadcast/**` + `app/[locale]/(main)/broadcast/{draft,templates}/**` | **MEDIUM** | Sidebar active state bisa bentrok dengan current logic di `main-side-nav`. |
| **Module — Contacts** | Form unified + filter date | `components/molecules/contacts/**` + `components/pages/contacts/**` | **MEDIUM** | Tambah date filter mungkin butuh BE endpoint baru (`?sort=latest`). |
| **Module — Leads** | Hide CTA empty + badge size | `components/molecules/sales/**` (leads pakai sales folder) + `app/[locale]/(main)/leads/**` | **MEDIUM** | Computed state `hasActiveFilters` sederhana. |
| **Module — Reporting** | Visual differentiation metric cards | `components/molecules/statistic/**` + `app/[locale]/(main)/statistic/**` | **MEDIUM** | Tambah icon + accent color, pastikan a11y color-blind friendly. |
| **Database** | Tidak ada impact langsung | — | **NONE** | Semua perubahan level UI/UX, tidak butuh migrasi DB. |
| **API Contract** | Sort/filter contact mungkin tambah param | `services/contacts/` | **LOW** | Tambah optional `sort=latest` query param ke existing endpoint, backward compatible. |
| **UI/UX — Atom Library** | Refactor atoms di `packages/ui` | `packages/ui/src/components/atoms/{badge,button,input,select,dropdown-menu,toggle,form}.tsx` + downstream consumers | **CRITICAL** | Ini menyentuh seluruh aplikasi — pakai **codemod** atau **adapter pattern** untuk backward compat. |
| **UI/UX — i18n** | Tambah translation keys untuk string baru | `packages/i18n/**` + `next-intl` message files (en/id/…) | **MEDIUM** | Wajib isi semua locale aktif. Audit string bahasa Inggris yang ada harus diterjemahkan ke id. |
| **UI/UX — a11y** | ARIA roles + focus management + screen reader text | Semua component impacted | **HIGH** | Butuh a11y audit tool (axe-core) di CI. |
| **UI/UX — Responsive** | Breakpoint behavior untuk Inbox, Ticket Detail, Sidebar | Layout components + page-level CSS | **HIGH** | Tambah Storybook stories untuk tiap breakpoint. |
| **Security / RBAC** | Save/Cancel flow harus respect permission | `proxy.ts` middleware + role permission | **MEDIUM** | Save button visible tapi disabled if no permission (bukan hidden) untuk konsistensi. |
| **Performance** | Bundle size naik ~5–10% dari atoms baru + tooltip + icon | `next build` output | **MEDIUM** | Tree-shaking harus jalan — verify dengan bundle analyzer. |
| **Integration — Socket.IO** | Counter sync mungkin butuh event baru | `/conversations` namespace | **LOW** | Existing event `conversation-updated` bisa reuse — verify payload. |
| **Reporting / Analytics** | Card metric visual differentiation tidak ubah data | `services/statistic/**` | **NONE** | Pure visual. |
| **Financial / Compliance** | Tag success warna merah→hijau (#24) bisa salah signal ke user finansial | — | **LOW** | Visual only, tidak ubah kalkulasi. |
| **Concurrency** | Auto-save race condition di Settings (#17, #22) | `setting.store.ts` mutation | **MEDIUM** | Save/Cancel pattern harus optimistic lock + rollback on conflict. |
| **Automation — Page Objects** | 18+ Page Objects terdampak jika layout berubah | `sixV2Automation/**` | **HIGH** | Audit tanpa update PO = automation regression 100%. |
| **Automation — Test Cases** | 31 audit item harus jadi TC baru atau update existing | `Test/conversation/`, `Test/ticket/`, `Test/broadcast/`, `Test/settings/` | **HIGH** | Setiap Severity 3 → minimal 1 E2E test. |

### 5.2 Directly Affected Modules

| Path | Alasan |
|------|--------|
| `packages/ui/src/components/atoms/badge.tsx` | Ukuran + contrast (audit #4, #8, #13, #16) |
| `packages/ui/src/components/atoms/button.tsx` | Ukuran + state aktif (audit #7, #20, #28) |
| `packages/ui/src/components/atoms/input.tsx` | Field size + warna (audit #13, #16, #25) |
| `packages/ui/src/components/atoms/select.tsx` | Chevron icon (audit #3) |
| `packages/ui/src/components/atoms/dropdown-menu.tsx` | Hide jika no action (audit #31) |
| `packages/ui/src/components/atoms/switch.tsx` | Toggle card alignment (audit #18) |
| `packages/ui/src/components/molecules/conversations/**` | Counter sync, bulk select counter, filter badge, Done CTA |
| `components/molecules/settings/**` (10 sub-area) | Save/Cancel pattern, WA Web filter, Shift Hours table, CSAT toggle |
| `components/molecules/ticket/**` | Tipe Tiket Tambah back/breadcrumb, form clean |
| `components/molecules/main-side-nav/**` | Tooltip minimize, hide disabled channel, broadcast active state |
| `components/molecules/broadcast/**` | Template preview, draft error wording |
| `components/molecules/contacts/**` | Form unified, filter date |
| `components/molecules/sales/**` (leads) | Hide CTA empty, badge size |
| `components/molecules/statistic/**` | Metric card differentiation |
| `stores/conversation/**` | Counter source of truth + visibility update |
| `stores/leads/**` | hasActiveFilters computed |
| `stores/setting/**` | Dirty-state tracking roles/shift hours |
| `stores/whatsappWeb.store.ts` | clearAllFilters + All option |
| `services/contacts/**` | Tambah optional sort param |
| `app/[locale]/(main)/ticketing/**` | Responsive header |

### 5.3 Indirectly Affected Modules

| Path | Alasan |
|------|--------|
| `proxy.ts` (permission middleware) | Save/Cancel flow harus respect role |
| `hooks/**` | Bulk select counter mungkin butuh hook baru |
| `mappers/**` | Counter sync mungkin butuh mapper |
| `schemas/**` | Form pattern (Zod) baru |
| `validations/**` | Save/Cancel dirty state |
| `next-intl` message files | Semua string baru → translate |
| `sixV2Automation` repo | 18+ Page Objects terdampak |
| `Test/**` (TSV) | 30+ test cases baru atau update |
| CI/CD (`.gitlab-ci.yml`) | Tambah a11y check (axe-core) |
| Storybook (kalau ada) | Tambah stories per atom + per breakpoint |

### 5.4 Database Impact

**NONE — direct.** Semua perubahan level visual + state management. Tidak butuh migrasi schema.

### 5.5 API Contract Impact

| Endpoint | Impact |
|----------|--------|
| `GET /api/contacts/?sort=latest` | Tambah optional param (backward compatible) |
| `GET /api/whatsapp-web/accounts/?status=` | Mungkin tambah "all" option (verify BE) |
| `GET /api/shift-hours/` | Mungkin tambah DELETE method (audit #23) — verify BE |
| Socket `/conversations` `conversation-updated` | Verify payload include counter fields |

### 5.6 Frontend Impact

**CRITICAL — menyentuh shared atoms.** Lihat §5.2. Wajib pakai **adapter / deprecation path** jika atoms di-break (mis. `<Button size="sm" />` jadi variant baru, old size masih jalan).

### 5.7 Automation Testing Impact

| Page Object | Area | Affected |
|-------------|------|----------|
| `ConversationListPage` | Inbox list | Counter sync, bulk counter, filter clear |
| `ConversationRoomPage` | Detail | Done CTA visibility |
| `TicketDetailPage` | Ticket detail | Back/breadcrumb, responsive header |
| `TicketTypePage` | Settings Tickets | Form pattern, back button |
| `SettingsRolesPage` | Settings Roles | Save/Cancel flow |
| `SettingsShiftHoursPage` | Settings Shift Hours | Delete action, alignment |
| `SettingsCSATPage` | Settings CSAT | Toggle alignment |
| `SettingsWhatsAppWebPage` | Settings WA Web | Filter All/Clear, error CTA |
| `BroadcastTemplatesPage` | Broadcast | Preview button |
| `ContactsPage` | Contacts | Date filter |
| `LeadsPage` | Leads | Hide CTA empty |
| `StatisticPage` | Reporting | Card differentiation |
| `MainSideNavComponent` | Sidebar | Tooltip, hide disabled, active state |

### 5.8 Security / RBAC Impact

- Save/Cancel pattern di Settings **harus hidden atau disabled** untuk role yang tidak punya permission (Agent vs Supervisor vs Admin).
- Audit #17, #22 menyentuh privacy/roles — pastikan RBAC matrix tetap respected.
- Audit #31 (dropdown useless di Anggota) — kalau dropdown berisi action "Edit User" yang restricted untuk Agent, hide via RBAC (bukan remove total).

### 5.9 Performance Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Bundle naik dari icon library baru + tooltip lib | MEDIUM | Lazy load icon; pakai existing `@radix-ui/react-tooltip` (sudah di Shadcn). |
| Re-render dari counter sync | LOW | Selector Zustand sudah memoized by default. |
| Date filter query lambat | LOW | Verify index di BE — `contacts.createdAt`. |

### 5.10 Concurrency Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Save race condition di Settings (#17, #22) | MEDIUM | Optimistic update + rollback on 409. |
| Counter sync antara sidebar & list | LOW | Single source of truth di store + socket event. |
| Auto-save pattern bentrok dengan offline mode | MEDIUM | Pending socket queue (`pending-socket-queue.store.ts`) sudah handle — verify. |

### 5.11 Migration / Deployment Risks

- **Backward compatibility:** atoms di `packages/ui` adalah shared lib — breaking change akan butuh coordinated release dengan seluruh consuming apps (omnichannel + widget).
- **Rollback:** per-cluster rollback aman (independent commit per cluster).
- **Feature flag:** tidak wajib, kecuali refactor atom besar.

### 5.12 Regression Scope

| Area | Risk | Alasan |
|------|------|--------|
| Conversation list | HIGH | Counter sync, filter, bulk action — semua critical path agent. |
| Ticket detail drawer | HIGH | Back button + responsive header — agent kerja harian. |
| Settings (semua) | HIGH | 8+ halaman Settings terdampak pattern Save/Cancel. |
| Sidebar minimize | MEDIUM | Tooltip + hide channel bisa sembunyikan menu aktif kalau logic salah. |
| Atom library | CRITICAL | Refactor button/badge/input = blast radius ke seluruh FE. |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Module | Depends On | Type | Direction | Notes |
|--------|-----------|------|-----------|-------|
| Counter sync (Inbox) | Socket `/conversations` event | Async event | FE ← BE | Verify event payload. |
| Save/Cancel Settings | `setting.store.ts` mutation + permission | Sync + state | FE internal | RBAC-gated. |
| Sidebar hide disabled | Channel settings + member permission | Sync | FE ← settings | Hide channel only if no unread + permission off. |
| Filter chevron + clear-all | `conversation.store.ts` filter | State | FE internal | Computed. |
| Template preview broadcast | Template service + modal store | Sync | FE ← BE | Verify template API return body. |
| Date filter contacts | `services/contacts/` query | Sync | FE → BE | Optional param. |
| Responsive header ticket | Layout breakpoint | CSS | FE internal | Tailwind v4 breakpoint tokens. |
| Sidebar tooltip | `@radix-ui/react-tooltip` (Shadcn) | Component | FE internal | Verify sudah ada di package. |
| Tag success color | `tailwind-config` token | Token | FE internal | Replace red → green token. |

### 6.2 Shared Resources / Event Mapping

| Shared Resource | Audit Item | Risiko |
|-----------------|-----------|--------|
| `@satuinbox/ui` Badge | #4, #8, #13, #16 | Wajib refactor atom dulu. |
| `@satuinbox/ui` Button | #7, #20, #28 | Variant baru + disabled state pattern. |
| `@satuinbox/ui` Input | #13, #16, #25 | Form pattern unified. |
| `conversation.store.ts` counter | #1, #2 | Single source of truth. |
| `setting.store.ts` dirty-state | #17, #22, #28 | Pattern Save/Cancel. |
| Socket `/conversations` payload | #1 | Verify counter included. |
| Tailwind tokens (color) | #24 | success/warning/danger color system. |

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Refactor atom breaking change consume di seluruh app | High | Critical | **CRITICAL** | Adapter pattern + deprecation warning + codemod. |
| R-02 | Counter sync FE/BE out of sync (event payload tidak include counter) | Medium | High | HIGH | Tambah field optional di BE event, fallback client compute. |
| R-03 | Save/Cancel pattern bentrok dengan auto-save existing feature (Hold/Snooze) | Medium | Medium | MEDIUM | Cross-check dengan `Assessments/reference/conversation-v1-vs-v2-comparison.md` undeveloped features. |
| R-04 | Hide disabled channel di sidebar sembunyikan menu yang masih ada unread | Medium | High | HIGH | Logic: hide only if disabled AND zero unread AND zero pending. |
| R-05 | Tag success color merah→hijau bentrok dengan brand color | Low | Low | LOW | Verify design system approval. |
| R-06 | Tooltip di sidebar minimize interfere dengan navigation | Low | Medium | LOW | Pakai `@radix-ui/react-tooltip` default delay 300ms. |
| R-07 | Bundle size naik signifikan dari icon library baru | Medium | Low | LOW | Tree-shaking + bundle analyzer di CI. |
| R-08 | Responsive header ticket break di breakpoint spesifik | Medium | Medium | MEDIUM | Storybook visual test + 4 viewport. |
| R-09 | Save/Cancel flow di Roles bentrok dengan V2 RBAC plan (undeveloped Collaborator role) | High | Medium | **HIGH** | HOLD — tunggu PRD V2 RBAC final. |
| R-10 | i18n string baru tidak diterjemahkan | High | Medium | HIGH | Wajib 100% locale coverage untuk shipped string. |
| R-11 | Audit #33 (panel tiket laptop kecil) ternyata butuh refactor layout besar | Medium | High | HIGH | Spike dulu sebelum commit sprint. |
| R-12 | Auto-save race condition dengan offline mode (`pending-socket-queue`) | Medium | Medium | MEDIUM | Test dengan offline simulation. |
| R-13 | Feature Hold/Snooze (undeveloped) tiba-tiba butuh Save pattern = double work | Medium | Medium | MEDIUM | Sync dengan PM roadmap. |

### 7.2 Worst-Case Scenarios

- **WCS-01:** Refactor `<Button>` atom menyebabkan 80+ page error → butuh hotfix release → on-call bangun tengah malam.
- **WCS-02:** Counter sync FE/BE mismatch → agent salah hitung SLA → customer complaint naik.
- **WCS-03:** Save/Cancel pattern di Settings membingungkan agent → user error rate naik → CSAT turun.
- **WCS-04:** Sidebar hide channel menyembunyikan menu penting → agent tidak bisa akses Inbox → blocker harian.

---

## 8. Test Strategy

### 8.1 Functional Scope

Per Severity 3 item, butuh minimal 1 functional test:

| TC-ID | Area | Audit Item | Steps singkat |
|-------|------|-----------|---------------|
| TC-INBOX-001 | Counter sync | #1 | Reload page → counter sidebar == counter list |
| TC-INBOX-002 | Bulk counter | #2 | Select 3 chat → muncul "3 dipilih" |
| TC-INBOX-003 | Filter clear | #4 | Apply filter → click "Clear All" → reset |
| TC-INBOX-004 | Done CTA | #6 | Update visibility → "Done" button muncul |
| TC-BC-001 | Preview template | #9 | Click template → modal preview terbuka |
| TC-BC-002 | Sidebar active state | #10 | Navigate broadcast → icon broadcast highlight |
| TC-BC-003 | Error wording | #11 | Trigger broadcast error → pesan user-friendly |
| TC-CONTACT-001 | Form unified | #13 | Add contact → semua field size sama |
| TC-CONTACT-002 | Date filter | #14 | Filter by date → list urut terbaru |
| TC-SET-001 | Roles Save/Cancel | #17, #22 | Edit role → klik Cancel → tidak tersimpan |
| TC-SET-002 | Shift Hours Delete | #23 | Click "..." → Delete action ada |
| TC-SET-003 | Tag color | #24 | Save tag success → warna hijau |
| TC-SET-004 | Ticket back/breadcrumb | #27 | Click Tambah Tipe → Back button ada |
| TC-SET-005 | WA Web filter All/Clear | #21 | Apply filter → "All" / "Clear" muncul |
| TC-SET-006 | WA Web error CTA | #29 | Trigger error → CTA actionable |
| TC-SET-007 | Toggle alignment | #18 | CSAT page → semua toggle size sama |
| TC-SET-008 | Disabled button | #20 | WA Web button disabled → tetap visible |
| TC-SET-009 | Settings form clean | #30 | Ticket form → struktur clean + tombol primary |
| TC-SET-010 | Dropdown remove | #31 | Settings Anggota → dropdown removed jika no action |
| TC-STAT-001 | Card differentiation | #12 | Conversation analytics → card visually distinct |
| TC-LEAD-001 | Hide CTA empty | #15 | Leads tanpa filter → "Hapus Semua" hidden |
| TC-SIDE-001 | Tooltip minimize | sidebar #1 | Hover icon minimized → tooltip muncul |
| TC-SIDE-002 | Hide disabled channel | sidebar #2 | Disable channel di settings → tidak muncul di sidebar |
| TC-LAYOUT-001 | Responsive ticket header | #33 | Resize ke laptop kecil → header collapse, chat area lebar |

### 8.2 Regression Scope

- **CRITICAL:** Conversation list counter, bulk action, ticket detail layout, sidebar navigation.
- **HIGH:** Settings 10+ halaman (semua pattern Save/Cancel), Broadcast templates, Contacts form.
- **MEDIUM:** Reporting cards, Leads filter, Shift Hours.
- **LOW:** CSAT toggle, Tag color (visual only).

### 8.3 Integration Scope

| Integration | Test |
|-------------|------|
| Socket `/conversations` counter | Integration test — event payload include counter |
| Contact date filter BE | Integration test — `?sort=latest` works |
| Shift Hours DELETE BE | Integration test — endpoint exists (jika belum ada, HOLD item ini) |
| Save/Cancel dirty state offline | Integration test — queue replay tidak bentrok |

### 8.4 UAT / Business Validation

- Run heuristic evaluation ulang oleh Sabrina atau QA lain (post-implementation).
- Bandingkan severity count pre vs post — target: 0 Severity 3, ≤3 Severity 2.
- User testing dengan 5 agent aktif — observe task completion rate.

### 8.5 Automation Candidates

| TC | Automation |
|----|------------|
| TC-INBOX-001 (counter sync) | HIGH value — repeatable E2E |
| TC-INBOX-002 (bulk counter) | HIGH value |
| TC-SET-001 (Save/Cancel) | HIGH value — critical path |
| TC-SET-005 (WA Web filter) | HIGH value |
| TC-SIDE-001 (tooltip) | MEDIUM value |
| TC-LAYOUT-001 (responsive) | MEDIUM — visual regression via Storybook |

### 8.6 Environment Strategy

| Environment | Purpose |
|-------------|---------|
| Local | Atom refactor + unit test (Storybook visual test ideal) |
| Staging | Full regression + UAT by Sabrina |
| Production | Canary per cluster (Settings → Inbox → Ticket → Sidebar → Broadcast) |

---

## 9. Production Safety

### 9.1 Rollback Strategy

- **Per-cluster independent rollback** — setiap cluster (Settings / Inbox / Ticket / Sidebar / Broadcast) commit terpisah.
- **Atom refactor:** pakai **adapter pattern** + feature flag untuk atomic baru.
- **State store changes:** Zustand persist middleware `version` bump + migration function.

### 9.2 Feature Toggle Requirement

- **Atom refactor besar:** butuh feature flag untuk `<Button>` variant baru.
- **Counter sync:** butuh flag per-release (toggle ke old compute vs new).
- **Settings Save/Cancel pattern:** bisa flag per-halaman untuk gradual rollout.

### 9.3 Backward Compatibility Notes

- Atom API harus backward compat (variant baru, old default tetap jalan).
- State store: tambah field baru, jangan rename/deprecate existing.
- i18n keys: tambah baru, jangan rename existing key.
- API contract: optional param only (sort=latest, dll).

### 9.4 Staged Rollout Recommendation

| Phase | Scope | Risk Gate |
|-------|-------|-----------|
| Phase 0 | Atom refactor di Storybook + visual baseline | Bundle size check + visual diff approval |
| Phase 1 | Sidebar (tooltip + hide channel + active state) | UAT 5 agent |
| Phase 2 | Settings Save/Cancel pattern + WA Web filter + CSAT toggle | UAT 5 agent + Sabrina re-audit |
| Phase 3 | Inbox counter sync + bulk counter + filter clear + Done CTA | Regression full + counter accuracy check |
| Phase 4 | Ticket detail (back/breadcrumb + responsive header + form clean) | Regression full + responsive visual test |
| Phase 5 | Broadcast (preview + sidebar active + error wording) | Regression full |
| Phase 6 | Contacts (form + date filter) + Leads (hide CTA + badge) + Reporting (card diff) | Regression final |

### 9.5 Monitoring / Alerting Needs

- **Counter sync drift:** track event payload FE vs BE counter value daily.
- **Save/Cancel error rate:** 4xx response pada dirty-state save.
- **Bundle size CI gate:** max +5% per release.
- **A11y regression:** axe-core scan di CI, max 0 critical violations.

### 9.6 Logging / Audit Gaps

- Audit tidak menyentuh logging FE (console.error, Sentry). Tidak perlu tambah untuk audit fix.
- BE event payload change harus di-log untuk debugging (counter sync).

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Apakah BE `/conversations` event `conversation-updated` sudah kirim `unread_count`? | Counter sync FE-BE | **Yes** |
| OQ-02 | Apakah BE sudah support `GET /contacts?sort=latest`? | Date filter contact | **Yes** (kalau belum, butuh sprint BE terpisah) |
| OQ-03 | Apakah BE sudah support DELETE `/shift-hours/{id}`? | Audit #23 delete action | **Yes** |
| OQ-04 | Apakah V2 PRD sudah final untuk RBAC Roles? Pattern Save/Cancel bisa conflict dengan plan RBAC v2 | Audit #17, #22 | **Yes** — HOLD jika V2 belum final |
| OQ-05 | Apakah Hold/Snooze (undeveloped per global memory) bakal butuh Save/Cancel pattern juga? | Audit #17 Save/Cancel pattern reusable? | No — bisa dirancang generik |
| OQ-06 | Apakah desain hijau untuk tag success bentrok dengan brand color? | Audit #24 | No — bisa design review |
| OQ-07 | Apakah ada design system / Figma library untuk cross-check atom size scale? | Audit #7, #8, #13, #16, #18 | **Yes** (kalau tidak ada, perlu definisikan dulu) |
| OQ-08 | Apakah WCAG 2.1 AA compliance jadi target produk? | Audit #4 a11y color, #27 back button | **Yes** untuk Severity 3 acceptance |
| OQ-09 | Apakah Sabrina akan re-audit setelah implementasi? | Validasi perbaikan | No |
| OQ-10 | Apakah audit ini akan di-include di PRD V2.x atau berdiri sendiri? | Governance | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

Audit ini **bermanfaat sebagai visibility tool** tapi **tidak cukup untuk direct commit**. Pola yang muncul (33 item, 24% Consistency & Standards, 8 Severity 3) mengindikasikan masalah **design system enforcement**, bukan sprint 33-item. Tanpa a11y formal, i18n coverage, responsive matrix, dan RBAC verification, audit ini risk under-scope.

Pendekatan yang benar:

1. **Treat audit sebagai sinyal**, bukan sprint backlog langsung.
2. **Mulai dari atom** — refactor design system dulu, baru override per-halaman.
3. **Cluster per-domain** — Settings / Inbox / Ticket / Broadcast / Sidebar / Reporting, masing-masing jadi mini-PRD + Test Spec + Automation Mapping.
4. **Gate mandatory** — a11y pass + i18n 100% + responsive verified + RBAC respected sebelum Severity 3 di-merge.
5. **HOLD** item yang konflik dengan undeveloped V2 (Hold/Snooze/Collaborator).

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| **Final Decision Enum** | `PROCEED_WITH_CAUTION` |
| **Owner for Follow-up** | PM (Dany Christian) + Analyst + FE Lead + UX (Sabrina untuk re-audit) |
| **Required Revisions** | 7 items dari §2.2 (AUD-REV-01 sampai AUD-REV-07) |
| **Suggested Delivery Strategy** | **Phase split** — 6 fase (§9.4) selama ~6 sprint (10–14 sprint-weeks) |
| **Earliest Safe Next Step** | **(1)** Audit revision pass (AUD-REV-01..07) → **(2)** Figma/design system check (OQ-07) → **(3)** Atom refactor spike (Storybook) → **(4)** Phase 1 (Sidebar) mulai setelah gate |

### 11.3 Cluster Prioritization

| Cluster | Severity 3 count | Effort | Risk | Rekomendasi |
|---------|----------------:|--------|------|------------|
| Sidebar (tooltip + hide channel + active state) | 0 (3 sev 2) | Low | Medium | **Phase 1 — quick win** |
| Settings (Save/Cancel + WA Web filter + CSAT + Tag color + Widget + Shift Hours + Breadcrumb + Form + Dropdown) | 5 | High | High | **Phase 2 — pattern first** |
| Inbox (counter sync + bulk + filter + Done + Create Ticket) | 3 | High | High | **Phase 3 — critical path** |
| Ticket (responsive header + back/breadcrumb + form) | 1 | Medium | Medium | **Phase 4** |
| Broadcast (preview + active + error wording) | 1 | Low | Low | **Phase 5** |
| Contacts + Leads + Reporting | 0 (4 sev 2) | Low | Low | **Phase 6** |

---

## 12. Traceability Matrix

Audit Item → Finding → Impact Area → Affected Path → Test Case → Status

| Audit ID | Finding | Impact Area | Affected Path | TC | Status |
|----------|---------|-------------|---------------|-----|--------|
| #1 | Counter sync | State + Socket | `stores/conversation/**` + `/conversations` event | TC-INBOX-001 | Pending |
| #2 | Bulk counter | UI | `components/molecules/conversations/bulk-action` | TC-INBOX-002 | Pending |
| #3 | Filter chevron | UI atom | `packages/ui/atoms/select` | TC-INBOX-003 (partial) | Pending |
| #4 | Filter badge contrast + clear-all | UI + i18n | `packages/ui/atoms/badge` + filter component | TC-INBOX-003 | Pending |
| #5 | Button overflow | UI atom | `packages/ui/atoms/button` | visual test | Pending |
| #6 | Done CTA | UI + state | `components/molecules/conversations/visibility` | TC-INBOX-004 | Pending |
| #7 | Create Ticket CTA | UI atom | `packages/ui/atoms/button` | visual test | Pending |
| #8 | Ticket field badge size | UI atom | `packages/ui/atoms/{badge,input}` | TC-TICKET-002 | Pending |
| #9 | Broadcast preview | UI + state | `components/molecules/broadcast/templates` + `stores/broadcast` | TC-BC-001 | Pending |
| #10 | Sidebar broadcast active | UI | `components/molecules/main-side-nav` | TC-BC-002 | Pending |
| #11 | Broadcast error wording | i18n + BE | `next-intl` message file + error mapper | TC-BC-003 | Pending |
| #12 | Reporting card diff | UI | `components/molecules/statistic/cards` | TC-STAT-001 | Pending |
| #13 | Contact form size | UI atom | `packages/ui/atoms/input` + form pattern | TC-CONTACT-001 | Pending |
| #14 | Contact date filter | UI + API | `components/molecules/contacts/filter` + `services/contacts` | TC-CONTACT-002 | Pending |
| #15 | Leads hide CTA | UI + state | `stores/leads` + `components/molecules/sales/leads` | TC-LEAD-001 | Pending |
| #16 | Leads field badge size | UI atom | `packages/ui/atoms/{badge,input}` | visual test | Pending |
| #17, #22 | Settings Save/Cancel | UI + state + RBAC | `components/molecules/settings/roles` + `stores/setting` + `proxy.ts` | TC-SET-001 | **HOLD pending V2 RBAC final** |
| #18 | CSAT toggle alignment | UI atom | `packages/ui/atoms/switch` | TC-SET-007 | Pending |
| #19 | Widget button icon | UI + i18n | `components/molecules/settings/widget` | visual + a11y test | Pending |
| #20 | WA Web disabled button | UI | `components/molecules/settings/channels/whatsapp-web` | TC-SET-008 | Pending |
| #21 | WA Web filter All/Clear | UI + state | `components/molecules/settings/channels/whatsapp-web` + `stores/whatsappWeb` | TC-SET-005 | Pending |
| #23 | Shift Hours Delete | UI + API | `components/molecules/settings/inbox/shift-hours` + `services/shift-hours` (DELETE?) | TC-SET-002 | **HOLD pending BE DELETE** |
| #24 | Tag success color | UI token | `tailwind-config` color token | TC-SET-003 | Pending |
| #25 | Kontak search metadata | UI + API | `components/molecules/settings/inbox/team-inbox/search` | TC-SET-011 (new) | Pending |
| #26 | Ticket settings title | UI | `components/molecules/settings/inbox/tickets` | visual | Pending |
| #27 | Tipe Tiket back/breadcrumb | UI + routing | `app/[locale]/(main)/settings/inbox/tickets/types/add` | TC-SET-004 | Pending |
| #28 | Jam Shift button visibility | UI | `components/molecules/settings/inbox/shift-hours` | TC-SET-012 (new) | Pending |
| #29 | WA Web error CTA | UI + empty state | `packages/ui/atoms/empty-state` (new) + WA Web page | TC-SET-006 | Pending |
| #30 | Ticket form clean | UI + form pattern | `components/molecules/settings/inbox/tickets/forms` | TC-SET-009 | Pending |
| #31 | Settings Anggota dropdown | UI + RBAC | `components/molecules/settings/organization/members` | TC-SET-010 | Pending |
| Sidebar #1 | Tooltip minimize | UI | `components/molecules/main-side-nav` | TC-SIDE-001 | Pending |
| Sidebar #2 | Hide disabled channel | UI + state | `components/molecules/main-side-nav` + channel settings | TC-SIDE-002 | Pending |
| Layout #33 | Ticket responsive header | UI + responsive | `components/molecules/ticket/details/header` | TC-LAYOUT-001 | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-23 | Initial assessment created — Type 3 interconnection analysis for UI/UX Audit Report by Sabrina. Maps 33 audit findings to FE v2.7.0 impact, identifies 2 HOLD items (audit #17/#22 awaiting V2 RBAC final; audit #23 awaiting BE DELETE), recommends 6-phase rollout starting from Sidebar (Phase 1) → Settings (Phase 2) → Inbox (Phase 3) → Ticket (Phase 4) → Broadcast (Phase 5) → Contacts/Leads/Reporting (Phase 6). | Analyst |
