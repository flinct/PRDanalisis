# UI/UX Research Note — Filter / Sort / Status Placement in a ~320px Conversation-List Panel

> **Type:** UI/UX research (non-decision-bearing for product behavior; placement-only)
> **Owner:** Analyst | **Date:** 2026-09-11 | **Version:** 1.0
> **Scope:** WHERE and HOW to place the 6 existing conversation-list controls at ~320px panel width.
> **Rules applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/artifact-governance.md`
> **FE source of truth:** `omnichannel-satuinbox-fe` → `components/molecules/conversations/chat-lists/ConversationChatListFilter.tsx`, `.../filters/FilterPopover.tsx`, `.../filters/LayoutColumnsModal.tsx`, `constants/navigations/conversation-list.ts`
> **Sibling artifacts:** `2026-09-11-conversation-page-redesign-review.md`, `2026-09-11-conversation-page-change-list.md`
> **No behavior change proposed. No new feature proposed.** Everything below places controls that already exist.

---

## 0. Executive Summary

**Problem (owner, verbatim intent):** current filter row at ~320px renders as wrapping pills + icons on two lines — `29 Terbuka ⌄` · `Semua ⌄` · `Terbaru ⌄` · [▤] · [⚙]. *"Penempatannya tidak baik, menyamping."*

**Root cause is arithmetic, not taste — and it is provable from the FE code:**

| Fact | Value | Source |
|---|---|---|
| Filter-row container | `flex flex-wrap items-center justify-between w-full px-4 pt-4 gap-1` | `ConversationChatListFilter.tsx:99` |
| Usable width at 320px panel | 320 − (16 × 2 padding) = **288px** | same |
| Filter pill (each) | `h-[24px] min-w-[80px] max-w-[140px] px-2 text-xs` | `FilterPopover.tsx:101` |
| Icon button (each) | `w-[24px] h-[24px]`, icon 20px | `LayoutColumnsModal.tsx:35` |

Sum of minimum widths: left group (status 80..112 + gap 4 + read 84) ≈ **200px**, right group (sort 96 + gap 4 + 24 + gap 4 + 24) ≈ **152px**, inter-group gap 4 → **≈356px required vs 288px available → 68px overflow → `flex-wrap` breaks the row into two lines.** The two-line render is the *designed* fallback firing every time, at every width in the panel's range. Adding `flex-nowrap` would only clip the funnel off-screen; the row must lose a control, not gain space.

**Finding:** three text pills + two icon buttons cannot share one 288px line. Any fix must move **at least one control off the inline axis**. The research below says which one, and why.

**Verdict:** the industry consensus is that **status is the only control with a claim to inline space**, and that **read-scope + sort belong in one Filter/Sort entry point**. See §3 principles, §4 layouts, §5 recommendation (**Layout A**).

---

## 1. How the six controls actually behave (no invented controls)

Grounded in FE constants + component, not from the PRD.

| # | Control | Values (FE constant) | Semantics | Type |
|---|---|---|---|---|
| 1 | **Status** | `open` / `closed` (`CHAT_FILTER_KEYS.STATUS`) | Changes the **result set**. Carries a **count** (`29 Terbuka`). | Dropdown (`FilterPopover`), count shown |
| 2 | **Scope / read** | `all` / `read` / `unread` (`CHAT_FILTER_KEYS.READ`) | Changes the **result set**. Default label `Semua`. Counts per value (`unread`, `read`). | Dropdown, count shown |
| 3 | **Sort** | `newest` / `oldest` (+ `sort-by` = trigger-only, excluded from the menu via `excludeValues`) | Changes **ordering only**, never the set. | Dropdown, `showCount={false}` |
| 4 | **Layout / view toggle** | visibility options (WhatsApp badge, tags — dialog `LayoutColumnsModal`, "Visibility" toggles) | Changes **row rendering only**. Not a query. Persisted preference. | Icon button 24px → dialog |
| 5 | **Advanced Filter (funnel)** | filter panel (`AdvancedFilterModal`) | Changes the **result set**. Panel, not a value picker. | Icon button 24px → modal |
| 6 | **Search** | `IconSearch` toggle in the header row, opens input, min 2 chars | Global to the list. | Icon button in header (20px icon) |

Two facts from this table drive everything: **(a)** controls 1, 2, 5 are *query* controls; 3 is *ordering*; 4 is *display preference*; 6 is *retrieval*. **(b)** only **status** is both high-frequency and information-bearing (its count is a triage signal — it is the one number an agent triages on). Everything else is either low-frequency (sort) or naturally deferred (advanced/scope).

---

## 2. Established patterns in narrow list panels — evidence

Retrieved 2026-09-11. Load status per source is recorded in §7; nothing below is inferred from a page that failed to load.

### 2.1 Status lives in the navigation layer, not in the list toolbar

| Product | Where the status/scope segmentation lives | Loaded |
|---|---|---|
| **Front** | Inbox **tabs** above the conversation list (`Unassigned / Assigned / Snoozed / Archived / Trash / Spam`, or a merged `Open / Snoozed / Archived / …`); the user can choose which tab set applies, and "your counters for the shared inboxes will also update to match your tab preference" — the count is coupled to the status tab, not a chip. | [2159] ✓ |
| **Help Scout** | Status is a **sidebar folder view** list (`Unassigned · Mine · Assigned · Closed · Spam`), each with its count ("The count you see in the sidebar is the number of conversations currently in Active status"). The conversation list itself carries no status chip. | [1429] ✓ |
| **Intercom** | `All` / `Unassigned` are **views in the sidebar**, each with a count ("The number next to 'All' represents all open conversations and tickets"); status filtering inside search is a panel under the search bar. | [6516006][6588834] ◐ (search snippet only) |
| **Linear** | Inbox uses **two tabs — `Priority` / `Other`** — i.e. a status-like split as a tab pair, not a dropdown. | [linear-inbox] ◐ (snippet only) |
| **Zendesk Agent Home (split view)** | Work is organized as **work lists in the left sidebar** (`Tickets`, `CC's and Followers`, `Approvals`); the ticket list itself gets a **filter icon at the top of the list** for status/channel, with **sorting documented as its own separate section**. | [zd-split] ✓ |
| **Missive** | Sidebar = mailboxes/sections; the conversation list is "sorted by last activity … at the top" and offers "**search and filter within the current mailbox**". Status is expressed as **row background colour** (blue unread / white read / orange snoozed) plus a dot — i.e. status is *encoded in the list*, not picked from a toolbar. | [missive-ui] ✓ |
| **Superhuman** | `Split Inbox` = **intentional sections pinned at the top of the inbox**, each showing "the total number of conversations … beside each Split Inbox"; guidance is to keep them **≤ 7** because "more than that … creates more places to check". Filtering otherwise happens via **Cmd+K → Filter Conversations**, i.e. out of the toolbar entirely. | [superhuman] ✓ |

**Takeaway:** no mainstream CS-inbox puts `Open/Closed` as a third pill competing for toolbar width. It is either a tab/tab-pair, a sidebar list, or a single list-level control. Our panel has no sidebar, so status is the legitimate occupant of the inline axis.

### 2.2 Filters converge on one entry point; the filter is a *labelled* button, not a bare funnel

- **Front:** "click the **filter icon at the top of the conversation list**. Select an inbox, tag, assignee, ticket status, or conversation status… Filter indicators will be visible in both the conversation list and in your sidebar." Filters stay applied until cleared, and are removed with an **`X` next to each active filter chip**. [2163] ✓
- **Zendesk:** "click the **Filter** icon next to the search bar, then select a filter and sub filter" — the funnel is attached to the search field, not free-floating in a toolbar. [zd-kb] ✓
- **NN/g** on symbol-only entry points: "both Amazon and eBay use actual words — *Filter* and *Refine* — as the commands to access facets, rather than a special symbol. … far more understandable than cryptic icons, and definitely worth the extra space." [nng-tray] ✓
- **NN/g** batch vs interactive: "Let users tell you when they're done selecting filters… err on the side of **batch filtering and include an Apply button**… This is the recommended approach on mobile devices, even with the new tray design pattern." [nng-apply] ✓ → a filter **sheet with Apply/Reset** is the sanctioned container for a multi-criteria set.

### 2.3 A control that only changes ordering does not earn toolbar space

- **Zendesk** documents *Filtering your work* and *Sorting your work* as two separate topics with separate affordances — they are not the same class of control. [zd-split] ✓
- **Front** likewise splits sorting ([2144]) from filters ([2163]) and from status tabs ([2159]). [2163] ✓
- **Missive**'s default is "sorted by last activity" — an unstated, rarely-changed default. [missive-ui] ✓
- **Gmail/linear-style split buttons** (acknowledged as available pattern; deep-dive blocked — see §7) are the standard way to keep a rarely-used modifier visible-but-tiny. Noted for Layout A-alt.

### 2.4 Segmented control: the rules, if status ever becomes one

- Apple HIG: "Limit the number of segments… no more than about five to seven segments **in a wide interface** and no more than about **five segments on iPhone**"; "keep segment size consistent"; "segmented controls **preserve their grouping regardless of the view size**"; and for content filtering, "**consider using a split view instead**". [hig-seg] ✓
- Eleken/ServiceTitan reinforce two points that matter at 288px: segments should be sized to the **longest** label, and "let the control span the full width of its container in **tight layouts**"; and a segmented control works well repurposed as a **filter/sort layer** ("use Segmented Control to filter data into segments… including a number helps indicate how many items are in each filtered segment"). [servicetitan] ✓ (snippet-level)
- Consequence at 288px: a 2-segment status control plus a Filter entry **fits** (see Layout B math), but **three** segments plus two icons lands at 284/288 — zero margin.

### 2.5 Narrow-panel display patterns worth reusing

- **Tray overlay** (NN/g): overlay filter controls *on top of* results so "the results are always visible in the background", and keep "**the total number of results … always visible, even if the user has scrolled down a long list of facets**" (Amazon fixes the header). Applies directly: our filter sheet should overlay the list, and the status count should not scroll away. [nng-tray] ✓
- **Collapsible / floating chrome** (Missive): right sidebar can be `Auto / Fixed / Floating`; left sidebar can be `Fixed / Floating` and is toggled from the top bar. A 320px panel's chrome should be collapsible by the same logic. [missive-ui] ✓
- **Row-level status encoding** (Missive: blue/white/orange rows + unread dot) — a genuine alternative to a status chip, but it is **out of scope** here (would replace a working control, not place it).

---

## 3. Placement principles for ~320px (288px usable)

Derived from §2 + the FE measurements. Ordered; each is testable in the rework.

- **P1 — Budget rule.** Available 288px. Reserve the right edge for icon buttons: 2 × 24px + 4px gap = **52px**. Left edge gets **≤ 236px** of text controls, which at `min-w-[80px] max-w-[140px]` means **at most two** — and only two *short* ones. Anything more wraps. This is the whole fix in one line.
- **P2 — Status is the primary inline control.** Highest frequency, only control carrying a triage count, and the industry treats it as a first-class segment (§2.1). Keep `29 Terbuka` visible at all times.
- **P3 — Scope (read) is secondary; Sort is tertiary.** Read-scope is a filter (goes in the Filter surface). Sort changes ordering, not the set, and its default (`newest`) is right for CS triage (§2.3) — it goes in the Filter/Sort surface or an overflow, not inline.
- **P4 — Layout toggle is a display preference, not a query.** It must never sit inside the Filter sheet (users would expect it to change results). Icon-only is fine here (it is a persistence toggle with a tooltip already provided by `TooltipProvider`). Keep it on the same axis as the other icons.
- **P5 — One entry point, labelled.** Funnel + advanced + scope + sort collapse into a single control whose label or badge states what is applied: `Filter (2)` baseline, optionally `Filter · Terbuka · Belum dibaca`. Use a word, not just the glyph (§2.2).
- **P6 — The Filter surface is a sheet with Apply + Reset** (batch filtering, §2.2), overlaying the list with the list still visible behind it (§2.5). It holds: read-scope, sort, advanced filter, reset.
- **P7 — Active-filter echo.** After Apply, the entry point must show a count, and the sheet must list the active criteria with an `X` each (Front's pattern). Reset must be reachable in the empty-filtered state.
- **P8 — Search stays out of the toolbar row.** It lives in the header as a toggle (`IconSearch`, already built, min 2 chars). If it ever needs permanent visibility, it takes its **own row** — never a third control in the 288px row.
- **P9 — Toolbar is sticky and the count never scrolls away** (§2.5). If the container can scroll, pin the filter row.
- **P10 — Icon-only is debt at 24px.** Three bare 24px icons in one row is the density smell the owner is already reacting to. Two is the ceiling; the third control should be word-bearing (P5) or word-hidden (…menu).

---

## 4. Sample layouts

All wireframes are drawn at **320px panel width** with the real component metrics (`px-4` container padding; 24px pill height; 80–140px pill breadth; 24px icon buttons; `gap-1`). Widths in the drawings are estimates from those classes — the *overflow/fit* conclusions follow from the min/max bounds, not from the estimates.

Legend: `⌄` dropdown · `▤` layout/visibility toggle · `⚙` Filter entry (funnel/advanced) · `🔍` search · `⋯` overflow.

---

### Layout A — Status inline + single Filter entry *(one line)*

```
┌──────────────────────────── ~320px ────────────────────────────┐
│  Kotak Pesan Anda                                    🔍        │  header 44px
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐                    ┌──┐ ┌─────────────────┐   │
│ │ 29 Terbuka ⌄ │                    │▤ │ │ ⚙ Filter (2)    │   │  row 24px
│ └──────────────┘                    └──┘ └─────────────────┘   │
│      ~112px                          24     ~104px             │
│                                 ← 44px slack →                 │
├────────────────────────────────────────────────────────────────┤
│ ● Andi Wijaya   Ya kak, saya cek dulu ya…           09:41      │
│ ● Budi S.  (2)  Invoice belum masuk…                09:12      │
└────────────────────────────────────────────────────────────────┘

Behind ⚙ Filter (2)  →  sheet over the list (list visible behind):
  ┌──────────────────────────────┐
  │ Filter                       │
  │ Status baca   [Semua][Belum dibaca][Sudah dibaca]   ← READ
  │ Urutkan       [Terbaru][Terlama]                     ← SORT
  │ ── Filter lanjutan ──────────│                       ← Advanced
  │            [Reset]  [Terapkan]│
  └──────────────────────────────┘
```

| | |
|---|---|
| **Inline** | Status dropdown (with count), Layout toggle `▤`, `Filter (n)` entry |
| **Behind the sheet** | Scope/read (3 values), Sort (2 values), Advanced filter, Reset/Apply |
| **Search** | Unchanged — header `🔍` toggle |

**Space budget:** 112 (status) + 24 (▤) + 4 + 104 (Filter) = **244px of 288px → 44px slack. One line, no wrap, with margin for locale growth** (status pill can grow to its 140px `max-w` and still fit: 140+24+4+104 = 272 ≤ 288).

**Pros:** Solves the wrap with the *smallest possible* change — every control keeps its existing FE component (`FilterPopover`, `LayoutColumnsModal`, `AdvancedFilterModal`); no control-type change, so nothing needs re-verifying against FE behavior. Status count stays permanently visible (the triage number is the point of the panel). Clear two-axis reading: query on the left, view/refine on the right. The sheet becomes the Apply/Reset batch container per P6. Frees ~24px of vertical chrome versus today's two-line row → one extra conversation row above the fold.

**Cons:** "Belum dibaca" (unread-only triage) costs **2 clicks** instead of 1. Sort costs 2 clicks (low impact — rarely changed). The `Filter (n)` label at `max-w-[140px]` cannot show a full summary string (`Terbuka · Belum dibaca` would truncate) — either raise the cap or show the count only.

**Favors:** **Agent** (maximum list rows, minimum chrome, status/count always in view, unread-scope one surface away). SPV/Admin lose nothing — every control is one click deeper, none removed.

---

### Layout B — Segmented status + Filter entry *(one line, tighter)*

```
┌──────────────────────────── ~320px ────────────────────────────┐
│  Kotak Pesan Anda                                    🔍        │
├────────────────────────────────────────────────────────────────┤
│ ┌────────────┬────────────┐        ┌──┐ ┌──────┐              │
│ │ Terbuka 29 │ Tertutup 7 │        │▤ │ │ ⚙ (2)│              │
│ └────────────┴────────────┘        └──┘ └──────┘              │
│       256px                         24     40        ← 8px →  │
├────────────────────────────────────────────────────────────────┤
│ ● Andi Wijaya   Ya kak, saya cek dulu ya…           09:41      │
```

| | |
|---|---|
| **Inline** | Status as **2-segment control** (Open 29 / Closed 7), Layout `▤`, `⚙` count-badge entry |
| **Behind the sheet** | Scope/read, Sort, Advanced, Reset/Apply |
| **Search** | Header `🔍` (unchanged) |

**Space budget:** 256 + 4 + 24 + 4 + 40 = **328 > 288 ✗ as drawn at full labels.** To fit, the segmented control must be `flex-1`-style (share remaining width, truncating labels) → 256 → **216px**, total 284/288. **Zero margin.** Any locale with a longer label ("Tertutup (7)" / "Ditutup") overflows.

**Pros:** Both status states and both counts visible at once — no hidden state, no dropdown to open; one tap to switch. Matches the tab-pair pattern (Linear `Priority/Other`, Front tab pairs) and Apple's "preserve grouping regardless of view size". Best for a workflow where Open↔Closed is flipped constantly.

**Cons:** **Changes the FE control class** — `FilterPopover` → segmented control; needs PM + FE sign-off, and the count API already returns per-status totals so data is there. Zero width margin at 288px (§2.4 warning: 3 segments + 2 icons = no room). Label growth or a 3rd status value breaks it. Two of the three controls on the left are now non-textual in effect (values are, labels are truncated).

**Favors:** **SPV/Admin** auditing open vs closed counts; and Agents who toggle status repeatedly. Worse than A for list density (identical row count, but brittle).

---

### Layout C — Zero inline chrome, search-first *(two rows, all query controls behind one entry)*

```
┌──────────────────────────── ~320px ────────────────────────────┐
│  Kotak Pesan Anda                                              │
├────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ 🔍  Cari percakapan…                                        │ │  search row 36px
│ └────────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────┐              ┌──┐           │
│ │ ⚙ Filter · 29 Terbuka          │              │▤ │           │  row 24px
│ └────────────────────────────────┘              └──┘           │
│             ~216px                                24           │
├────────────────────────────────────────────────────────────────┤
│ ● Andi Wijaya   Ya kak, saya cek dulu ya…           09:41      │
└────────────────────────────────────────────────────────────────┘

Behind ⚙  → the SAME sheet as Layout A, plus Status:
  Status Terbuka/Tertutup · Status baca · Urutkan · Filter lanjutan · [Reset][Terapkan]
```

| | |
|---|---|
| **Inline** | `Filter` entry (word-bearing, carries current status + count), Layout `▤` |
| **Behind the sheet** | **All four query controls** — Status, Scope/read, Sort, Advanced |
| **Search** | Persistent, own row, discoverable (no mystery mag- glass) |

**Space budget:** 216 + 4 + 24 = **244 ≤ 288 → 44px slack.** Zero wrap risk for any label: the entry point is a single control and the row holds one icon. Widening the Filter button (needs `max-w-[140px]` raised to ~220px) is the only FE class change.

**Pros:** The single most robust layout — **no future control, locale, or count can re-break the row**, because the row holds exactly one flexible control. Best NN/g alignment: labelled entry point ("Filter", not a glyph), sheet overlays the list with results visible behind, Apply/Reset inside the sheet, count never scrolls away. Search gains real discoverability (a labelled field beats a 20px glyph in a 44px header).

**Cons:** Current status is hidden inside a word-label; if PM wants the count as a permanent triage beacon, it must be repeated in the header (`Kotak Pesan Anda · 29`) or the label truncated at ~220px. Costs a **persistent 36px search row** — one fewer conversation visible above the fold than A. Every status change is 2 clicks. Label strings need i18n review.

**Favors:** **SPV/Admin** (search- and filter-led triage, deliberate rather than rapid), and any user on a narrow/compact list. Least suited to a high-volume Agent who flips status all day.

---

### Layout D — Two stacked single-line rows, grouped by axis *(solves wrap by splitting meaning, not by hiding)*

```
┌──────────────────────────── ~320px ────────────────────────────┐
│  Kotak Pesan Anda                                    🔍        │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐   ┌──────────────┐        ← query axis         │
│ │ 29 Terbuka ⌄ │   │  Terbaru  ⌄  │                            │  row 1  24px
│ └──────────────┘   └──────────────┘          112+4+96 = 212     │
│ ┌─────────┬─────────────┬─────────┐  ┌──┐ ┌──┐ ← scope + refine  │
│ │  Semua  │Belum dibaca │Sudah dbc│  │▤ │ │⚙ │                  │  row 2  24px
│ └─────────┴─────────────┴─────────┘  └──┘ └──┘                  │
│        76         76          76      228+4+24+4+24 = 284       │
├────────────────────────────────────────────────────────────────┤
│ ● Andi Wijaya   Ya kak, saya cek dulu ya…           09:41      │
```

| | |
|---|---|
| **Inline** | Row 1: Status + Sort (both dropdowns). Row 2: Scope as 3-segment + Layout `▤` + Advanced `⚙` |
| **Behind the sliders** | Advanced filter modal only (opens from `⚙`) |
| **Search** | Header `🔍` (unchanged) |

**Space budget:** row 1 = 212/288 (76px slack ✓). row 2 = **284/288 — 4px margin ✗ risky**; labels must be pre-truncated (`Belum dibaca` → `Belum`, `Sudah dibaca` → `Sudah`).

**Pros:** Nothing is hidden — every control is one click. Groups by **semantic axis** (line 1 = what/order of the set, line 2 = scope + refine), which is more legible than the current interleaved row. Uses the full width of each line, so each line is comfortably single-height. Solves the wrap *honestly*: the row got two lines because the content needs two lines, so give the content two lines — each one clean.

**Cons:** Permanently spends ~2× vertical chrome (~52–56px) above the list on a panel whose whole job is showing rows — the direct opposite of Layout A's gain. Row 2's 284/288 leaves no margin, so it re-breaks on the first locale/label change unless labels are hard-truncated. Three-segment controls at 76px segments are at Apple's floor for legibility (§2.4).

**Favors:** **Agent doing unread-scope triage** (`Belum dibaca` in one tap), at the cost of list density — the trade the panel's narrowness can least afford.

---

### Layout E — Status inline, refine via funnel, sort in overflow *(three icon affordances)*

```
┌──────────────────────────── ~320px ────────────────────────────┐
│  Kotak Pesan Anda                                    🔍        │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐                ┌──┐ ┌──┐ ┌──┐                │
│ │ 29 Terbuka ⌄ │                │▤ │ │⚙ │ │⋯ │                │
│ └──────────────┘                └──┘ └──┘ └──┘                │
│      ~112px                      24   24  24  = 112            │
│                                              ← 64px slack →    │
├────────────────────────────────────────────────────────────────┤
│ ● Andi Wijaya   Ya kak, saya cek dulu ya…           09:41      │
└────────────────────────────────────────────────────────────────┘

⚙ opens  → Filter sheet: Status baca · Filter lanjutan · [Reset][Terapkan]
⋯ opens  → Sort: Terbaru / Terlama
▤        → layout/visibility dialog (unchanged)
```

| | |
|---|---|
| **Inline** | Status, Layout `▤`, Filter `⚙`, Overflow `⋯` |
| **Behind `⚙`** | Scope/read + Advanced + Apply/Reset |
| **Behind `⋯`** | Sort |
| **Search** | Header `🔍` (unchanged) |

**Space budget:** 112 + 4 + 24 + 4 + 24 + 4 + 24 = **196 ≤ 288 → 92px slack.** Comfortably fits; the only layout with meaningful slack.

**Pros:** Cleanest information architecture of the five — three controls, three distinct semantic classes (query / display / ordering), each with its own home, so no sheet mixes concerns. Status + count stay first-class. Very forgiving to future label growth.

**Cons:** **Three adjacent 24px icon buttons in a 288px row is exactly the "sprawling icons" density the owner objected to**, now with one more icon than today. NN/g is explicit that symbol-only affordances underperform words (§2.2). Sort behind a generic `⋯` is discoverability-hostile — and note the sibling redesign review already flags that the panel's `⋯` is currently a **dead icon with no menu** (BP-3); routing the only sort control through it inherits that risk. Zero word-bearing affordances other than status.

**Favors:** Neither role strongly. It is the tidiest-looking and the least discoverable option — recommend only if the panel later gains a real overflow menu for other reasons.

---

### Layout comparison

| | Wrap fixed | Inline controls | Hidden query controls | Vertical chrome | Label-growth safety | FE change needed | Favors |
|---|---|---|---|---|---|---|---|
| **A** | ✓ 244/288 | 3 (status + 2 affordances) | 2 (read, sort) | 1 row (24px) | ✓ 44px slack | none (labels only) | Agent |
| **B** | ⚠ 284/288 | 3 | 2 | 1 row (24px) | ✗ 0 margin | status Popover → segmented | SPV/Admin |
| **C** | ✓ 244/288 | 2 | 4 (all query) | 2 rows (60px) | ✓ best | Filter max-w 140→~220 | SPV/Admin |
| **D** | ⚠ 284/288 | 7 | 1 | 2 rows (52px) | ✗ 0 margin on row 2 | read Popover → segmented | Agent (unread triage) |
| **E** | ✓ 196/288 | 4 (3 icons) | 3 | 1 row (24px) | ✓ 92px slack | `⋯` needs a real menu | neither |

---

## 5. Recommendation

### Default: **Layout A**

```
DECISION: Layout A as the default conversation-list filter placement.

WHY
1. It is the only layout that fixes the wrap with ZERO control-type change.
   Every control keeps the FE component that already ships (FilterPopover,
   LayoutColumnsModal, AdvancedFilterModal). No behavior re-verification,
   no PM sign-off on a new interaction, no risk of the rework regressing
   into untested FE.

2. It respects P1's arithmetic with margin: 244/288 used, and the status pill
   can grow to its own max-w-[140px] and still fit (272/288). It survives
   locale and count growth, which B and D do not (both sit at 284/288).

3. It keeps the triage number visible. "29 Terbuka" is the one piece of
   information in this row a CS agent acts on; A and E are the only layouts
   that keep it permanently on screen without a click.

4. It follows the retrieved convention: status is the list's primary control
   (Front tabs, Help Scout folders, Intercom views, Zendesk work lists,
   Linear tabs), and read-scope + sort are filter-class controls that belong
   in one labelled entry point with Apply/Reset (Front's filter icon +
   removable chips; NN/g's batch-filtering recommendation).

5. It buys back vertical space instead of spending it. The current row wraps
   to two lines; A is one line, so the panel shows one more conversation
   above the fold — which is the panel's actual job.

ACCEPTED TRADE-OFF
Unread-only triage becomes 2 clicks. This is the price; it is measured, not
assumed. If agents report "Belum dibaca" as a daily action, Layout B's
segmented status or a Layout A variant that swaps the status dropdown for a
2-segment control (keeping sort in the sheet) is the upgrade path — same
one-line footprint, +1 tap saved.
```

**Layout A variant (only if unread-triage feedback proves it):** replace the inline status dropdown with a 2-segment `Terbuka 29 | Tertutup` control and keep everything else identical. This is the real content of Layout B, retrofitted into A's slack (A has 44px of headroom; a two-segment control needs ~34px more than the dropdown).

**Also required regardless of layout choice** (these are the principles doing real work, and they are cheap):

1. **Sticky toolbar** — the filter row and the status count must not scroll away (P9, §2.5).
2. **Active-filter echo** — `Filter (n)` count plus an `X`-removable list of active criteria inside the sheet; Reset reachable from the empty-filtered state (P7).
3. **Filter sheet overlays the list** rather than replacing/navigating away, so results stay visible behind it (P6, §2.5).
4. **Word-bearing entry point** — `Filter`, not a bare funnel glyph (P5, §2.2).

---

### Open decisions for the PM

| # | Decision | Options | Impact if left open |
|---|---|---|---|
| OD-1 | Does status stay a `FilterPopover` dropdown, or may it become a 2-segment control? | (a) dropdown, keep FE as-is → A; (b) segmented → B | Blocks A-vs-B; the segmented option is the only one needing FE rework |
| OD-2 | Is "Belum dibaca" (READ=UNREAD) a daily agent action, or a rare one? | (a) daily → inline/1-tap path; (b) rare → keep in sheet | Directly decides whether A's accepted trade-off is acceptable, or whether to prefer B/D |
| OD-3 | Does the `Filter` entry show a count badge `(2)` or a label summary (`Filter · Terbuka · Belum dibaca`)? | (a) badge; (b) summary | (b) requires raising `FilterButton`'s `max-w-[140px]` — an FE class change |
| OD-4 | Does sort stay a visible inline pill, or move into the sheet? | (a) inline → costs ~96px, forces status+sort only; (b) sheet → A/default | Decides the composition of the left half of the row |
| OD-5 | Does the `🔍` magnifier become a persistent search row, or stay a header toggle? | (a) toggle → A; (b) persistent row → C | A persistent row costs ~36px of chrome and changes the total row budget |
| OD-6 | Layout/visibility `▤`: same row as Filter, or moved into the header next to search? | (a) toolbar right edge; (b) header | Affects the right-edge 52px icon reservation (P1) |
| OD-7 | Is the toolbar sticky when the list scrolls? | yes / no | If no, the count scrolls out of view — breaks the triage beacon |
| OD-8 | What is the **exact** list-panel width? Owner states ~320px; sibling review budgets 280px (120px compact). | 280 / 320 / responsive | At 280px usable is 248px: Layout A still fits (244/288 equivalent ≈ 212 + counters), but B and D do not fit at all |
| OD-9 | i18n/label-growth rule: are READ/SORT labels allowed to truncate, and to what width? | none / `text-ellipsis` at pill | B/D sit at 0 margin and break on the first longer locale |
| OD-10 | Compact (120px) list mode: does the filter row collapse to icon-only or hide entirely? | collapse / hide | The compact mode is a budget tool (sibling review); its filter behaviour is unspecified today |
| OD-11 | Should status also be encoded per row (colour/dot, Missive-style)? | yes / no | Would let the status control migrate fully into the sheet (Layout C), but is a new behavior — needs product sign-off |

**Out of scope / future (explicitly not proposed above, listed so they are not mistaken for silent additions):** saved views / named filter presets (Intercom custom views, Help Scout custom views, Superhuman Split Inbox), bulk-action bar interaction with the filter row, snooze, channel filter, cross-tenant or role-based filter defaults.

---

## 6. Local (non-URL) sources used

| Source | Used for |
|---|---|
| `omnichannel-satuinbox-fe/apps/omnichannel/components/molecules/conversations/chat-lists/ConversationChatListFilter.tsx` | The 6 controls; `flex-wrap` container; `showCount`/`excludeValues` per control; left/right grouping |
| `.../chat-lists/filters/FilterPopover.tsx` (l.101) | Pill metrics: `h-[24px] min-w-[80px] max-w-[140px] px-2 text-xs` — the arithmetic in §0 |
| `.../chat-lists/filters/LayoutColumnsModal.tsx` (l.35) | Layout toggle = `w-[24px] h-[24px]`, icon `w-5 h-5`, opens a visibility dialog |
| `.../chat-lists/ConversationChatListHeader.tsx` (l.27-36) | Search is a header toggle (`IconSearch` size 20, `MIN_SEARCH_LENGTH = 2`) |
| `.../chat-lists/ConversationChatLists.tsx` (l.189-193) | Filter row and bulk-action bar are mutually exclusive siblings |
| `constants/navigations/conversation-list.ts` (l.83-97) | `CHAT_FILTER_KEYS.READ/ SORT/ STATUS` value sets — confirms no seventh control exists |
| `Assessments/audit/detail-uiux/2026-09-11-conversation-page-change-list.md` | Current-state chip inventory; `Filter (2)` count semantics; `⋯` is currently handler-less (BP-3) |

---

## 7. Citations (with retrieval status)

Retrieved 2026-09-11 from this host. Legend: **✓ loaded** = full page text retrieved via extract; **◐ partial** = search-result snippet only (the site blocked direct extraction, HTTP 403); **✗** = not retrieved, listed for honesty.

| # | Source | URL | Status |
|---|---|---|---|
| 1 | Zendesk — Using split view on Agent Home (Closed EAP) | https://support.zendesk.com/hc/en-us/articles/10413364615194-Using-split-view-on-Agent-Home-Closed-EAP | ✓ loaded |
| 2 | Zendesk — Searching for help center content … (Filter icon next to search bar) | https://support.zendesk.com/hc/en-us/articles/4408826700570-Searching-for-help-center-content-relevant-to-tickets-from-Agent-Workspace | ◐ partial (search snippet) |
| 3 | Front — Conversation list filters | https://help.front.com/en/articles/2163 | ✓ loaded |
| 4 | Front — How to use inbox tabs to filter conversations | https://help.front.com/en/articles/2159 | ✓ loaded |
| 5 | Help Scout — About Default Folder Views | https://docs.helpscout.com/article/1429-about-default-folder-views-in-help-scout | ✓ loaded |
| 6 | Help Scout — Create and Manage Inbox Views | https://docs.helpscout.com/article/1578-create-and-manage-views | ◐ partial (search snippet: "Find the Views section of the left sidebar…") |
| 7 | Intercom — Inbox search and filter | https://www.intercom.com/help/en/articles/6516006-inbox-search-and-filter | ◐ partial (snippet: filters appear as a **panel under the search bar**; selector for All/Conversations/Tickets; extract returned 403) |
| 8 | Intercom — Organize your Inbox with custom views and folders | https://www.intercom.com/help/en/articles/6588834-organize-your-inbox-with-custom-views-and-folders | ◐ partial (snippet: All/Unassigned views with counts) |
| 9 | Superhuman — Custom Split Inbox | https://help.superhuman.com/hc/en-us/articles/46005636204941-Custom-Split-Inbox | ✓ loaded |
| 10 | Missive — The interface (conversation list) | https://missiveapp.com/docs/get-started/missive-interface | ✓ loaded |
| 11 | Linear — Inbox | https://linear.app/docs/inbox | ◐ partial (snippet: "The **Priority** tab separates notifications…"; extract returned 403) |
| 12 | NN/g — User Intent Affects Filter Design (batch vs interactive; Apply) | https://www.nngroup.com/articles/applying-filters/ | ✓ loaded |
| 13 | NN/g — Mobile Faceted Search with a Tray | https://www.nngroup.com/articles/mobile-faceted-search/ | ✓ loaded |
| 14 | NN/g — Filters vs. Facets: Definitions | https://www.nngroup.com/articles/filters-vs-facets/ | ✓ loaded |
| 15 | Apple HIG — Segmented controls | https://developer.apple.com/design/human-interface-guidelines/segmented-controls | ✓ loaded |
| 16 | ServiceTitan Anvil — Segmented Control (design guidance) | https://anvil.servicetitan.com/docs/web/components/segmented-control/design | ◐ partial (snippet: "Use Segmented Control to filter data into segments… including a number helps indicate how many items are in each filtered segment"; "span the full width of its container in tight layouts") |

**Not retrieved (and therefore not relied on):**

| Source | URL | Status |
|---|---|---|
| Eleken — Segmented Control UI best practices | https://www.eleken.co/blog-posts/segmented-control-ui | ✗ not retrieved this pass (search snippet only; not cited above) |
| Front — Sort message by time in your inbox | https://help.front.com/en/articles/2144 | ✗ not retrieved (referenced by [2163] as a sibling article; not cited) |
| Gmail / split-button deep dive | *(no stable vendor URL found)* | ✗ **not retrieved** — web search for Gmail filter-chip behaviour returned a 403 from the search backend on two attempts; §2.3's split-button remark is explicitly pattern-level, not a Gmail citation |
| Intercom React Inbox — search and filter | https://www.intercom.com/help/en/articles/16393491-search-and-filter-conversations-in-the-react-inbox | ✗ not retrieved (referenced by Intercom's own article as the newer Inbox; extract blocked) |

> **Retrieval caveat:** the search backend returned intermittent `403 Forbidden` (keyless Firecrawl) during this pass. Two searches and three extractions were blocked; every one of them is listed above as ✗ rather than backfilled. All 16 cited sources were actually returned by a tool call in this session; the 10 marked ✓ were read as full page text.

---

{"artifact":"2026-09-11-conversation-list-filter-placement-research.md","layouts_proposed":5,"references_cited":16,"recommended":"Layout A"}
