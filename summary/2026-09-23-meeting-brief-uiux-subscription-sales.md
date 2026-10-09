# Meeting Brief — SatuInbox Product Alignment

**Tanggal:** 23 September 2026
**Peserta:** Product Design, QA, PM (Dany Christian)
**Durasi:** ~90 menit

---

## 🔴 TOPIC 1: Conversation UI/UX Redesign (55 menit)

> **Bobot utama.** Ini topik paling berat — redesign seluruh halaman Conversation (sidenav + list + workspace + drawer), bukan drawer saja.

### Prototype Files (buka untuk review)

| Prototype | File | Isi |
|-----------|------|-----|
| **⭐ SatuInbox Full Prototype** | [`prototypes/satuinbox-prototype/index.html`](../prototypes/satuinbox-prototype/index.html) | **← Prototype utama.** Full app: auth, conversation (sidenav + list + workspace + drawer), ticketing, contacts, leads, broadcast, settings, statistic. Dummy data, localStorage CRUD, zero API. Login: `dany` / `password123`. 1523 lines conversation page sendiri. |
| **Redesign Wireframe** | [`prototypes/conversation-page-redesign/conversation-page-redesign.html`](../prototypes/conversation-page-redesign/conversation-page-redesign.html) | Wireframe mode — 55 controls, role switcher (Agent/SPV/Admin), pixel budget 1280/1440. Fokus layout & button placement. |
| **Baseline "Before"** | [`prototypes/conversation-detail-drawer.html`](../prototypes/conversation-detail-drawer.html) | Drawer prototype v1. Tanpa sidenav, hanya app rail 64px. Referensi "before". |
| **3 Direction Samples** | [`prototypes/sample-conversation-3-directions.html`](../prototypes/sample-conversation-3-directions.html) | Dark theme. 3 arah desain alternatif. |

---

### 1A. Audit Temuan (15 menit)

**Source:** Audit Sabrina, Jun 2026 — Nielsen 10-heuristic, 33 findings.

| Severity | Jumlah | Highlight |
|----------|--------|-----------|
| **3 — Major** | **12** | #1 counter sidebar ≠ list, #4 badge kontras rendah, #5 text overflow button, #17 auto-save tanpa confirm, #24 warna success = merah, #27 no breadcrumb, #29 no error recovery, #31 dropdown dead, #33 header tiket makan ruang laptop kecil |
| 2 — Minor | 16 | dropdown icon, badge inconsistent, form sizing |
| 1 — Cosmetic | 5 | toggle size, dsb. |

**Dominant violation:** Consistency & Standards **8/33 = 24%** → masalah utama = **design system belum enforce**, bukan fitur hilang.

**Verdict impact assessment:** `PROCEED_WITH_CAUTION` — audit layak jadi backlog input tapi **bukan satu-satunya decision source**. Mandatory revision: a11y formal (WCAG), i18n, responsive breakpoints, RBAC visibility.

---

### 1B. Redesign Direction — 5 P0 Decisions (15 menit)

> **Source:** `2026-09-11-conversation-page-redesign-review.md`

| P0 # | Problem | Keputusan Dibutuhkan |
|-------|---------|---------------------|
| **1** | **Sidenav hilang** — prototype v1 buang sidenav. SPV/Admin kehilangan navigasi lintas inbox/team/channel. | Sidenav wajib restore + collapsible behavior? |
| **2** | **1280px = 5 kolom** — nav + sidenav + list + workspace + drawer harus muat. | Drawer open ⇒ sidenav collapse 56px + list compact 120px? Workspace ≥680px? |
| **3** | **`Selesaikan` = primary styling** padahal destructive. | Restyle jadi secondary/danger + tambah confirmation dialog? |
| **4** | **Duplicate resolve** — `Selesaikan` (header) + `Tutup Percakapan` (drawer footer) = satu aksi, dua tempat, dua styling. | Pilih SATU lokasi? Yang mana? |
| **5** | **`⋯` More = dead icon** tanpa menu. | Jadikan real overflow menu? Isi apa? |

**Pixel budget (resolved):**
```
1440px (full):  Nav64 + Sidenav200 + List280 + Workspace536 + Drawer360 = 1440 ✓
1280px, drawer OPEN:  Nav64 + Side56 + List120 + WS680 + Drawer360 = 1280 ✓
1280px, drawer CLOSED: Nav64 + Side200 + List280 + WS736             = 1280 ✓
```

**Prinsip dari benchmark (Zendesk, Missive, Help Scout, Front):**
1. 3+ kolom = standard CS inbox (Missive)
2. Context panel = on-demand, right side, collapsible (Zendesk, Help Scout, Front)
3. Jangan permanently occupy real estate (Zendesk: "the app sidebar is dead")
4. Actions belong to their object, surfaced contextually
5. List density = deliberately medium

---

### 1C. Change List — 55 Controls + 53 States (15 menit)

> **Source:** `2026-09-11-conversation-page-change-list.md`

**Scope per region:**

| Region | Controls | Status |
|--------|----------|--------|
| **(a) Sidenav** | 14 items | Semua RESTORE dari FE yang sudah built |
| **(b) List header/filters** | 22 items | Mix RESTORE + ADD-STATE |
| **(c) Bulk bar** | 5 items | NEW |
| **(d) Workspace header** | 10 items | Mix KEEP + ADD-STATE + RESTYLE |
| **(e) Thread + realtime** | 11 items | ADD-STATE (socket events exist) |
| **(f) Composer** | 5 items | ADD-STATE (span → real input) |
| **(g) Drawer** | 18 items | Mix KEEP + ADD-STATE |
| **(h) Global Search** | 2 items | NEW placeholder |
| **(i) Relation Labels** | 6 items | NEW placeholder |

**State coverage today:**
- Interactive: **9/53** (17%)
- Static but non-functional: **8/53** (15%)
- Absent: **36/53** (68%)

**Placeholder items (15)** — ship as structure + `preserve current behavior` marker, fill from FE repo:
> More overflow items, reassign channel, assignment control, voice-note, screenshot, linked-ticket, status values, advanced filter, room CRUD, bulk actions, global search, relation labels (3), relation label chip

---

### 1D. 12 Open Design Decisions (10 menit)

> Must close before implementation handoff.

| ID | Decision | Block? |
|----|----------|--------|
| OD-01 | Filter persistence across nav switch — persisted, reset, or scoped? | Yes |
| OD-02 | Default active sidenav item per role (Agent vs SPV vs Admin landing) | Yes |
| OD-03 | **Duplicate resolve**: `Selesaikan` vs `Tutup Percakapan` — same action or two distinct? | Yes |
| OD-04 | `Alihkan` vs `Transfer` — which is assignment, which is team/channel transfer? | Yes |
| OD-05 | Drawer ASSIGNMENT: editable control vs read-only display? | Yes |
| OD-06 | Star/unstar per conversation item — does it exist? | Yes |
| OD-07 | Message-bubble actions (linked ticket, screenshot, voice note) — show or hide? | Yes |
| OD-08 | Overflow menu item list + which is destructive? | Yes |
| OD-09 | Bulk action list — exact items? | Yes |
| OD-10 | Sidenav collapse default state + persistence + 1280px interaction | Yes |
| OD-11 | List search vs global search — one control or two? | Yes |
| OD-12 | Group Chat sidenav visibility — always or only when route supports? | Yes |

---

### 1E. Undeveloped Features Impact on Redesign

| Fitur | Status | Block Redesign? |
|-------|--------|-----------------|
| Collaborator role | Partial | Tidak — redesign tidak sentuh permission model |
| Snooze Conversation | ❌ | Tidak — indicator bisa di-add later |
| Related Conversations | ❌ | Tidak — grouping bisa di-add later |
| Hold/Resume header | ❌ | Tidak — button slot di header bisa reserve |
| Room Reminder | ❌ | Tidak — drawer section bisa reserve |
| Collections | ❌ | Tidak — sidebar section bisa reserve |

**Decision:** Redesign proceed tanpa menunggu undeveloped features. Placeholder structure di-include agar tidak rework nanti.

---

### 1F. Recommendation — 6 Phase Rollout

| Phase | Scope | Risk | Effort |
|-------|-------|------|--------|
| **0** | Atom refactor (`packages/ui`) — Badge, Button, Input, Select size/contrast/scale | CRITICAL | Storybook |
| **1** | Sidebar (tooltip + hide disabled + active state) | Medium | Quick win |
| **2** | Settings Save/Cancel pattern (8+ pages) | High | Pattern first |
| **3** | Inbox (counter sync + bulk + filter + Done CTA) | High | Critical path |
| **4** | Ticket (back/breadcrumb + responsive header) | Medium | |
| **5** | Broadcast (preview + active state + error wording) | Low | |
| **6** | Contacts + Leads + Reporting | Low | |

**Gate:** Phase 0 selesai + 12 OD closed → baru Phase 1 mulai.

---

## 🟡 TOPIC 2: Modul Sales (15 menit)

**Sales = visibility scope, bukan CRM.** Area Context model (`sales` / `operational`) sudah built via `PRD/Contact/PRD Contact - context and visibility.md`.

| Saat Ini | Gap |
|----------|-----|
| Contact Area Context: `sales` / `operational` per Team Inbox | No pipeline, deal, stage, follow-up workflow |
| RBAC: Contact Area Scope | No sales dashboard / metrics |
| Third-party sync → auto-area sales | No lead progression model |

**Decision needed:**
1. **CRM-lite** (pipeline + stages) → PRD baru, FE halaman baru, BE new entity → effort besar
2. **Visibility-only** → tinggal UI polish (filter, badge, dashboard)

---

## 🟡 TOPIC 3: Modul Subscription (15 menit)

**Tidak ada PRD dedicated.** Fragmen tersebar:

| Sumber | Scope |
|--------|-------|
| PRD Add ons | Channel pricing (WA Rp250rb/IG Rp100rb/dll) |
| PRD SuperAdmin v1.2 | Admin-side subscription control surface |
| PRD Suspend member | Auto-suspend on billing signal |

**Gap:** No plan tiers, no billing lifecycle, no self-serve, billing contract undefined.

**Decision needed:**
1. PRD dedicated atau extend existing?
2. Plan matrix (tiers, limits, feature gating)?
3. Customer self-serve — Phase 1 atau nanti?

---

## 4. Cross-Cutting Blockers

| Issue | Block Apa |
|-------|-----------|
| **Hold/Snooze/SLA 3-way conflict** | Snooze Conversation dev, SLA indicator UI |
| **Round Robin belum ada PRD** | Collaborator, queue, auto-assign |
| **SLA mode belum final** (Agent vs Customer-Centric) | SLA threshold design, reporting |
| **Group chat FRT hidden** | V2 spec visible, FE hidden |

---

## 5. Suggested Agenda

| # | Topik | Durasi | Owner |
|---|-------|--------|-------|
| 1 | **Prototype walkthrough** — buka Full Redesign, review sidenav + list + workspace + drawer | 15m | Design |
| 2 | **Audit severity-3** — mana yang fix bareng redesign, mana hotfix terpisah | 10m | QA |
| 3 | **5 P0 decisions** — sidenav restore, pixel budget, Selesaikan, duplicate resolve, overflow | 15m | PM + Design |
| 4 | **12 Open Decisions** — batch review, close yang bisa sekarang | 10m | PM + Design + QA |
| 5 | **Sales scope** — CRM-lite vs visibility-only | 10m | PM |
| 6 | **Subscription** — PRD dedicated vs extend + plan matrix | 10m | PM |
| 7 | **Cross-cutting blockers** — Hold/Snooze/SLA, Round Robin | 10m | PM + QA |
| 8 | **Action items** | 10m | PM |

**Total: ~90 menit**

---

## 6. References

### Audit & Redesign
- Executive Brief: `Assessments/audit/00-executive-brief.md` (101 findings, top 5 business risk)
- UI/UX Audit: `Assessments/audit/detail-uiux/uiux-audit-report-sabrina.md` (33 findings)
- Impact Assessment: `Assessments/audit/detail-uiux/uiux-impact-assessment.md` (FE repo blast radius)
- Redesign Review: `Assessments/audit/detail-uiux/2026-09-11-conversation-page-redesign-review.md`
- Change List: `Assessments/audit/detail-uiux/2026-09-11-conversation-page-change-list.md` (55 controls)
- Filter Research: `Assessments/audit/detail-uiux/2026-09-11-conversation-list-filter-placement-research.md`
- Drawer Review: `Assessments/audit/detail-uiux/2026-09-09-conversation-detail-drawer-uiux-review.md`
- CS Platform UX Research: `Assessments/audit/detail-uiux/2026-09-14-cs-platform-ux-patterns-research.md`
- Modern UI Research: `Assessments/audit/detail-uiux/2026-09-14-modern-seamless-ui-research.md`

### Prototypes
- **⭐ Main:** `prototypes/satuinbox-prototype/index.html` (full app, login: `dany`/`password123`)
- Redesign Wireframe: `prototypes/conversation-page-redesign/conversation-page-redesign.html`
- Baseline: `prototypes/conversation-detail-drawer.html`
- 3 Directions: `prototypes/sample-conversation-3-directions.html`

### Sales & Subscription
- Contact Area Context: `PRD/Contact/PRD Contact - context and visibility.md`
- Sync Contact: `PRD/Contact/prd-sync-contact-third-party.md`
- Add ons: `PRD/Add ons/PRD Add ons.md`
- SuperAdmin: `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`
- Suspend: `PRD/Company n people/PRD Setting - suspend member.md`

### Memory
- Undeveloped Features: `Memory/conversation-undeveloped-features-analysis.md`
- Global Memory: `Memory/global-memory.md`
