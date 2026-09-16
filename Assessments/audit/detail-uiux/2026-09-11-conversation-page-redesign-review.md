# Assessment Report — Conversation Page Redesign: Layout & Button-Placement Review

> **Assessment Type:** UI/UX Review (whole-page redesign direction — no behavior change)
> **Owner:** Analyst | **Author:** Dany Christian | **Date:** 2026-09-11 | **Version:** 1.0
> **Rules applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/artifact-governance.md`
> **Requirement (spec):** `presentation/UI change qa browser/conversation-redesign-v1-0.md`
> **Prior review:** `Assessments/audit/detail-uiux/2026-09-09-conversation-detail-drawer-uiux-review.md`
> **Change list (sibling):** `Assessments/audit/detail-uiux/2026-09-11-conversation-page-change-list.md`
> **FE ground truth:** `Memory/CLAUDE-fe.md` (branch v2.8.0)
> **Note on delegation:** External-reference scan run directly by orchestrator after subagent upstream failed (openai auth expired, deepseek credit exhausted). Web backend returned partial results; empty tools noted with `[unretrieved]` and backfilled from the prior review's cited comparison rather than invented.

---

## 0. Ringkasan

User keluhan: halaman Conversation **terlalu penuh**, **penempatan button tidak diperhitungkan**, dan **tidak user-friendly**. Target: redesign seluruh halaman (sidenav + list + workspace + drawer), bukan drawer saja. Prototype sebelumnya (`conversation-detail-drawer.html`) memperbaiki drawer tetapi **membuang sidenav** — masalah baru, bukan solusi.

**Verdict: `PROCEED_WITH_CAUTION`** — arah redesign benar dan seluruhnya didukung FE yang sudah ada (0 fitur baru diperlukan). Yang menahan: pixel budget 1280px sekarang harus memuat 5 kolom (bukan 4), 12 open design decision belum ditutup, dan penempatan button aktual masih melanggar semantic grouping. Semua bisa diselesaikan di satu design pass; tidak ada blocker.

---

## A. Verified Direction

```
DECISION: PROCEED_WITH_CAUTION
Rationale: Whole-page redesign adalah arah benar. Sidenav WAJIB dikembalikan
(spec §5, AC-01) — pola 3+ kolom (nav + list + workspace) adalah konsensus
industri CS inbox. Semua capability yang divisualisasikan sudah BUILT di FE
(sidenav routes, bulk, relation labels, reassign channel, global search, SLA).
Gap: (1) 1280px sekarang 5-kolom, list-compact wajib; (2) button placement
aktual masih campur viewport-control + conversation-action + destructive;
(3) 12 open decision. None blocker — resolve di design pass sebelum sprint.
```

---

## B. Current-State Problems (crowding + button placement + friction)

Konkret, tiap item terikat ke spec/FE:

### B.1 — Workspace crowding

| # | Problem | Bukti | Ref |
|---|---|---|---|
| CR-1 | **Sidenav hilang** → workspace tampak lega tapi salah: SPV/Admin kehilangan navigasi lintas inbox/team/channel. Bukan "less crowded", tapi "fitur dibuang". | Prototype hanya punya app rail 64px; tidak ada `Your Inbox/All/Unassigned/…` | §1, §5, AC-01 |
| CR-2 | **1280px sekarang 5 kolom.** Prior review menghitung 4 kolom (nav64 + list280 + ws + drawer360). Tambah sidenav → nav64 + sidenav + list + ws + drawer harus muat di 1280. | Prior review B.1 pixel math | §20.3 |
| CR-3 | List item padat: avatar + nama + preview + waktu + unread + SLA dot + (butuh) channel indicator, dalam 280px. Tanpa compaction, kompetisi ruang. | §7.6 minimum fields | §7.6 |
| CR-4 | Workspace 576px saat 4-kolom drawer-open (prior review) → "borderline crowded" untuk power agent. 5-kolom memperburuk bila list tidak compact. | Prior review B.1 | §20.3 |

### B.2 — Button placement (tidak diperhitungkan)

| # | Problem | Bukti | Ref |
|---|---|---|---|
| BP-1 | **`Selesaikan` di-styling primary** (button paling menonjol di header) padahal destructive/state-changing. Melanggar prinsip destructive ≠ primary. | Prototype `.btn.primary` di header | §17, AC-11 |
| BP-2 | **Duplikat resolve**: `Selesaikan` (header, primary) DAN `Tutup Percakapan` (drawer footer, danger). Satu aksi, dua tempat, dua styling — membingungkan. | Prototype header + drawer footer | §14.2 vs §17 (OD-03) |
| BP-3 | **`⋯` More adalah icon mati** tanpa menu. Aksi yang seharusnya di overflow (reassign channel, dll) tak punya rumah → cenderung dipaksa ke header → header makin penuh. | Prototype `⋯` no handler | §14.3 |
| BP-4 | Viewport control (drawer toggle `▤`) dan conversation action (`Alihkan/Transfer/Selesaikan`) hanya dipisah 1 divider tipis — grouping semantic lemah. | Prototype `vdiv` | §24, review D.2 |
| BP-5 | Drawer copy buttons, accordion Histori/Catatan/Log = **statis tanpa handler** → button yang terlihat bisa diklik tapi tidak melakukan apa-apa (AC-10 gagal). | Prototype no handlers | §14.1, AC-10 |

### B.3 — Friction / not user-friendly

| # | Problem | Ref |
|---|---|---|
| FR-1 | Tidak ada state coverage: list/workspace/search/action tanpa loading/empty/error → agent melihat panel kosong saat data belum siap. | §8, §11, §35 |
| FR-2 | Composer bukan input asli (`<span>`) → tidak bisa demonstrasi typing/sending/error/offline. | §13 |
| FR-3 | Tidak ada role awareness → SPV/Admin dapat experience Agent yang tidak sesuai kebutuhan monitoring. | §6, AC-02/03 |
| FR-4 | Tidak ada realtime affordance (`New messages`, incoming) → agent yang scroll ke atas kehilangan konteks pesan baru. | §12, AC-12 |

---

## C. External Reference Scan

> Retrieval status: Zendesk, Missive, Help Scout resolved live (cited). Intercom & Front help-center pages `[unretrieved]` (JS-rendered, extract returned empty) — backfilled from the **prior review's cited comparison table** (2026-09-09, §B.3), not invented.

| Tool | Sidenav model | List density | Action placement | Workspace protection | Context panel | Source |
|---|---|---|---|---|---|---|
| **Zendesk Agent Workspace** | Left nav (views/folders) | Medium | Conversation actions in header; **apps/context in a resizable right panel**, not header | Context panel collapsible + resizable | Right context panel (~350px, toggle) | [support.zendesk.com — Using the context panel](https://support.zendesk.com/hc/en-us/articles/4408836526362-Using-the-context-panel); prior review B.3 |
| **Missive** | Left rail = unified mailboxes + labels | Medium | 3-column discipline; actions per-conversation | "Well-known 3 columns (mailboxes, emails, conversation)" kept deliberately to manage UX complexity | Right conversation panel | [medium.com/missive-app — design process](https://medium.com/missive-app/a-digital-product-design-process-ce3b16911fd9); [missiveapp.com compare](https://missiveapp.com/compare/frontapp-vs-missive) |
| **Help Scout** | Left sidebar **Views** (custom folders/conditions) | Email-like, roomy | Customer profile in a **side panel opened on demand** (click contact name) | Sidepanel is on-demand, not always-on | Right customer sidepanel | [docs.helpscout.com — Views](https://docs.helpscout.com/article/1578-create-and-manage-views); [Customer Profiles](https://docs.helpscout.com/article/73-customer-profiles) |
| **Intercom** `[unretrieved]` | Left inbox/team folders | Compact | Detail always-on right (~340px) | Workspace compresses, list persists | Right detail (~340px) | prior review B.3 (cited) |
| **Front** `[unretrieved]` | Left rail shared inboxes | Compact | Detail toggleable, **default-closed** (~320px) | List stays full; detail opens on demand | Right sidebar (~320px, default closed) | prior review B.3 (cited) |

**Anti-pattern citation:** Zendesk itself argues the always-on app sidebar became clutter — "the app sidebar is dead" — favoring on-demand/contextual surfacing over permanently occupied real estate. [cxtoday.com](https://www.cxtoday.com/contact-center/zendesk-explain-why-the-app-sidebar-is-dead-cs-0064/)

### Principles to adopt

1. **3+ column is the CS-inbox standard** (Missive states it explicitly) — restoring the sidenav aligns with convention, does not fight it.
2. **Context/detail panel is on-demand, right side, collapsible/resizable** (Zendesk, Help Scout, Front default-closed) — matches our non-modal drawer default-closed decision.
3. **Don't permanently occupy real estate** (Zendesk "sidebar is dead") — sidenav must be **collapsible** at 1280px, drawer default-closed. Give width back to the workspace.
4. **Actions belong to their object, surfaced contextually** (Help Scout opens customer panel on click, not always shown) — overflow menu + drawer footer for low-frequency/destructive, header only for primary.
5. **List density is deliberately medium** (all tools) — compact mode is a budget tool, not the default.

---

## D. Redesign Direction — column coexistence & action placement

### D.1 — Pixel budget with sidenav restored (the core new constraint)

```
1440px (full experience) — everything fits, no compromise
┌────┬─────────────┬───────────────┬──────────────────────┬────────────┐
│Nav │  Sidenav    │  Conv List    │      Workspace       │  Drawer    │
│ 64 │   200       │    280        │        536           │    360     │  = 1440 ✓
└────┴─────────────┴───────────────┴──────────────────────┴────────────┘

1280px, drawer OPEN → sidenav collapses to icon rail + list compacts
┌────┬────┬──────┬───────────────────────────────┬────────────┐
│Nav │Side│ List │          Workspace            │  Drawer    │
│ 64 │ 56 │ 120  │            680                │    360     │  = 1280 ✓
└────┴────┴──────┴───────────────────────────────┴────────────┘
     └ collapsed: icon+tooltip+badge   └ compact: avatar+SLA dot+unread

1280px, drawer CLOSED → sidenav expanded, list full, workspace breathes
┌────┬─────────────┬───────────────┬─────────────────────────────────┐
│Nav │  Sidenav    │  Conv List    │           Workspace             │
│ 64 │   200       │    280        │             736                 │  = 1280 ✓
└────┴─────────────┴───────────────┴─────────────────────────────────┘
```

**Key rule:** at 1280px the sidenav and the list **never both stay full while the drawer is open**. Drawer open → sidenav collapses (56px) AND list compacts (120px). This is the single most important budget decision (OD-10). Workspace stays ≥680px — better than the prior 4-column 576px.

> `ponytail:` prior review's "list auto-compact" (P0 #1) still holds; the redesign just adds "sidenav auto-collapse" as its twin. Both driven by the same `drawerOpen && vp<=1280` condition — one guard, two effects.

### D.2 — Action class → location map

| Action class | Location | Members | Why |
|---|---|---|---|
| **Primary conversation action** | WS header, primary style | (define: likely reply/assign) | One prominent action max |
| **Secondary conversation action** | WS header, secondary style | `Alihkan`, `Transfer` | Frequent, but not destructive |
| **Destructive / state-changing** | Drawer footer + overflow, danger style, confirmation | `Selesaikan`/`Tutup Percakapan` (ONE, not two) | AC-11; away from `×`; resolve OD-03 |
| **Overflow (low-frequency)** | `⋯` real menu | reassign account channel, room CRUD, relation-label ops | Keeps header uncrowded (BP-3) |
| **Viewport control** | Separate cluster, divider | Drawer toggle `▤` | Not a conversation action (BP-4, review D.2) |
| **Bulk** | Floating bulk bar (appears on selection>0) | existing bulk actions | Off-canvas until needed |
| **Nav** | Sidenav | inbox scopes, channels, teams | Restored (CR-1) |

---

## E. Prioritized Recommendations

| # | Aspect | P | Action | Traces to |
|---|---|---|---|---|
| 1 | Crowding | **P0** | Restore sidenav; make it collapsible; at 1280+drawer collapse to 56px | CR-1, principle 1/3 |
| 2 | Crowding | **P0** | 1280 budget: drawer-open ⇒ sidenav 56 + list 120 + workspace ≥680 | CR-2/CR-4, OD-10 |
| 3 | Button | **P0** | `Selesaikan` → secondary/destructive styling, NOT primary; add confirmation | BP-1, AC-11 |
| 4 | Button | **P0** | Resolve duplicate: ONE resolve affordance (pick header OR footer) | BP-2, OD-03 |
| 5 | Button | **P0** | `⋯` becomes a real overflow menu; move low-freq actions there | BP-3, §14.3 |
| 6 | Button | P1 | Separate viewport-control cluster from conversation actions (divider + gap) | BP-4, review D.2 |
| 7 | Friction | P1 | Add list/workspace/search/action loading+empty+error states | FR-1, §35 |
| 8 | Friction | P1 | Composer → real input for typing/sending/error/offline | FR-2, §13 |
| 9 | Friction | P1 | Role simulation Agent/SPV/Admin drives sidenav visibility | FR-3, §6 |
| 10 | Friction | P1 | Realtime `New messages` affordance when scrolled up | FR-4, §12 |
| 11 | Placement | P1 | Bulk actions in a floating bar, not inline | principle 3, §18 |
| 12 | Gate | **P0** | Close 12 open decisions before implementation handoff | change list §6 |

---

## F. Decision Block

```
DECISION: PROCEED_WITH_CAUTION

Rationale:
Whole-page redesign benar dan konvensi-selaras (Missive 3-column, Zendesk/
Help Scout/Front on-demand right panel). Sidenav WAJIB kembali (AC-01) —
membuangnya adalah regression, bukan decluttering. Semua capability sudah
BUILT di FE; nol fitur baru diperlukan.

5 temuan P0 harus diselesaikan sebelum sprint:
1. Sidenav restore + collapse behavior
2. 1280px 5-column budget (sidenav collapse + list compact bersamaan)
3. Selesaikan de-primary + confirmation
4. Resolve duplicate resolve affordance (OD-03)
5. Overflow menu nyata untuk low-frequency actions

Plus P0 gate: tutup 12 open decision (change list §6) sebelum handoff.

Prototype rework (Phase 4) boleh mulai untuk region yang fully spec-backed
(sidenav, list, workspace header, drawer); region dengan placeholder
(bulk exact list, relation labels, reassign) ship sebagai struktur +
preserve-behavior marker, diisi dari omnichannel-satuinbox-fe — jangan dikarang.

Gate: 5 P0 + 12 open decisions addressed di design spec sebelum sprint commit.
```

---

## Referensi

| Source | URL | Used for |
|---|---|---|
| Zendesk — Using the context panel | https://support.zendesk.com/hc/en-us/articles/4408836526362-Using-the-context-panel | Right context panel resizable/collapsible |
| Zendesk — Configuring the context panel | https://support.zendesk.com/hc/en-us/articles/4408828503450-Configuring-the-context-panel-in-the-Zendesk-Agent-Workspace | Context panel settings model |
| CX Today — "the app sidebar is dead" | https://www.cxtoday.com/contact-center/zendesk-explain-why-the-app-sidebar-is-dead-cs-0064/ | Anti-pattern: don't permanently occupy real estate |
| Missive — design process | https://medium.com/missive-app/a-digital-product-design-process-ce3b16911fd9 | 3-column CS-inbox convention |
| Missive vs Front compare | https://missiveapp.com/compare/frontapp-vs-missive | 3-column mailboxes/list/conversation |
| Help Scout — Views | https://docs.helpscout.com/article/1578-create-and-manage-views | Left-sidebar view folders |
| Help Scout — Customer Profiles | https://docs.helpscout.com/article/73-customer-profiles | On-demand customer side panel |
| Prior review (2026-09-09) B.3 | `Assessments/audit/detail-uiux/2026-09-09-conversation-detail-drawer-uiux-review.md` | Intercom/Front/Zendesk/Gmail cited widths (backfill for unretrieved) |

---

{"verdict":"PROCEED_WITH_CAUTION","artifact":"C:/Users/MyBook SAGA 12/Desktop/PRDanalisis/Assessments/audit/detail-uiux/2026-09-11-conversation-page-redesign-review.md","top_findings":["Sidenav dropped by prior prototype must be restored (AC-01); removing it is a regression not decluttering","1280px is now a 5-column budget: drawer-open must trigger sidenav-collapse AND list-compact together, workspace stays >=680px","Selesaikan is styled primary but is destructive, and resolve is duplicated in header + drawer footer (OD-03)","More overflow is a dead icon; low-frequency actions have no home, pushing clutter into the header","All capabilities are FE-built — zero new behavior needed; 15 placeholders + 12 open decisions must close before handoff"]}
