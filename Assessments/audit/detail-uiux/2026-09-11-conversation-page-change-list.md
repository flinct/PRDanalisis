# CHANGE LIST — Conversation Page Redesign (v1.0)

> **Artifact type:** Change List (implementation-facing, no behavior change approved)
> **Scope owner:** Analyst | **Date:** 2026-09-11 | **Version:** 1.0
> **Rules applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/change-management.md`
> **Spec (requirement):** `presentation/UI change qa browser/conversation-redesign-v1-0.md`
> **Baseline artifact:** `prototypes/conversation-detail-drawer.html` (453 lines, read line-by-line)
> **Prior review:** `Assessments/audit/detail-uiux/2026-09-09-conversation-detail-drawer-uiux-review.md`
> **FE ground truth:** `Memory/CLAUDE-fe.md` (branch `v2.8.0`, prod `prod-2.7.0.3`)
> **Invented business behavior in this document: 0.** Every row traces to a spec § or FE reference.

---

## 1. Scope and Baseline

### 1.1 What changes

The redesign is **not a drawer redesign only** (spec §41). It re-scopes the whole Conversation page: restore the conversation sidenav, de-clutter the workspace under a strict pixel budget, fix action-button placement, and make every interaction state demonstrable.

### 1.2 Baseline — what `conversation-detail-drawer.html` actually contains today

| Present in prototype | Detail |
|---|---|
| App nav rail (64px) | Logo + 5 icon tiles: Percakapan (active), Kontak, Broadcast, Laporan, Pengaturan. Not buttons — `div.ico` with `title`. |
| Conversation list (280px / 120px compact) | 4 static items, SLA dot on avatar corner, unread badge, timestamp. |
| List header | Title `Percakapan` + 5 **non-interactive `<span>`** chips: `Terbuka (4)`, `Semua Saluran ▾`, `🔎 Cari…`, `Urutkan: Terbaru ▾`, `Filter (2)`. |
| Workspace header | Avatar, name, `+62 … · WhatsApp · Open`, then 5 controls. |
| Message thread | 4 static bubbles (2 in / 2 out) with timestamps. No wiring, no scroll logic. |
| Composer | Non-input `<span class="field">Ketik balasan…</span>` + `📎` + `Kirim`. |
| Drawer | Non-modal right-side 360px, no backdrop, Pin + ×, sections Customer → SLA (FRT/TTC/RLT + tooltips) → Assignment → Metadata → Histori/Catatan/Log accordions → footer `Tutup Percakapan`. |
| Drawer states | Loaded, Loading (skeleton), Empty. |
| Responsive | 1280 / 1440 toggle; auto-compact list at 1280 + drawer open. |
| Accessibility bits | 44×44 hit area via `::before{inset:-6px}`, `prefers-reduced-motion` block, `tabindex=0` on SLA info, Esc + Ctrl+Shift+D. |
| Prototype control bar | Fidelity (2), Drawer (2), Viewport (2), Drawer content (3). |

### 1.3 What the baseline **dropped** (the reason this redesign exists)

| Dropped | Consequence | Spec |
|---|---|---|
| **Entire conversation sidenav** | No `Your Inbox / All / Unassigned / Starred / Spam / Junk / Channels / Team Inboxes / Group Chat`. Only the app-level 64px rail exists. | §1 problem, §5, AC-01 |
| Role simulation | Prototype is Agent-shaped only; no SPV/Admin perspective. | §6, AC-02/03 |
| Conversation list at scale | 4 hard-coded items; not virtualized, no channel indicator, no bulk selection. | §7.6, §18 |
| **All list/workspace state coverage** | Only drawer has loading/empty. List, workspace, search and action states are absent. | §8, §11, §35 |
| Action interactivity | `Alihkan`, `Transfer`, `Selesaikan`, `⋯`, `Kirim`, `📎`, all copy buttons and the 3 accordions have **no handlers**. | §14.1, AC-10 |
| Relation labels, reassign account channel, global search | FE-built capabilities absent from prototype. | §2.1, §14.2 |
| Realtime affordances | No incoming-message, no `New messages`, no typing. | §12, AC-12 |

**Baseline verdict:** the artifact is a valid **drawer** prototype (review `PROCEED_WITH_CAUTION`, 8 P0 items) but an incomplete **Conversation page** prototype. Spec §35/§37 would fail today on nearly every checklist section except Layout (drawer) and part of Drawer.

---

## 2. Change Table (grouped by region)

**Change types:** `RESTORE` = re-add dropped UI · `MOVE` = relocate · `REGROUP` = re-cluster without behavior change · `RESTYLE` = visual only · `ADD-STATE` = add interaction/state to an existing element · `KEEP` = keep as-is.
`Invented?` is `No` on every row by construction.

### (a) Conversation Sidenav

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Sidenav | Sidenav region itself | **Absent** | RESTORE | SPV/Admin need cross-inbox navigation; only 64px app rail exists today | §5.1, §1 problem, AC-01 | No |
| Sidenav | `Your Inbox` item | Absent | RESTORE | Personal scope = Agent default | §5.2, §6.1 | No |
| Sidenav | `All` item | Absent | RESTORE | Global scope; permission-gated | §5.2, §6.3 | No |
| Sidenav | `Unassigned` item | Absent | RESTORE | Triage queue | §5.2, §6.2 | No |
| Sidenav | `Starred` item | Absent | RESTORE | Personal classification | §5.2 | No |
| Sidenav | `Spam` item | Absent | RESTORE | Classification / quarantine | §5.2 | No |
| Sidenav | `Junk` item | Absent | RESTORE | Classification / quarantine | §5.2 | No |
| Sidenav | `Channels` disclosure + channel items | Absent | RESTORE | Dynamic list; only permitted channels | §5.2 | No |
| Sidenav | `Team Inboxes` disclosure + items | Absent | RESTORE | Only accessible team inboxes | §5.2 | No |
| Sidenav | `Group Chat` item | Absent | RESTORE | Show if current route supports it | §5.2, FE §5 `[convoSection]` | No |
| Sidenav | Count badges on items | n/a | ADD-STATE | No `0` badge; active stays visible at 0; not colour-only | §5.3 | No |
| Sidenav | Active navigation state | n/a | ADD-STATE | Background + text/icon + optional accent bar; never colour-only | §5.4 | No |
| Sidenav | Collapse / expand behavior | Absent | ADD-STATE | Collapsed = icon+tooltip+badge+indicator; expanded = icon+label+count | §5.5, §30 | No |
| Sidenav | Role-aware visibility | Absent | ADD-STATE | Reuse `useRolePermission` + `RolesGuard`; no new role checks | §5.1, §6, FE §9 | No |
| Sidenav | App nav rail (64px, 5 icons) | Present | KEEP | Application navigation, out of scope | FE §12 `main-side-nav` | No |

### (b) Conversation List — header, filters, item

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| List | `Percakapan` title | Present (static) | KEEP | Matches §7.1 header | §7.1 | No |
| List | Status control (`[Status ▼]`) | Static `<span>` chip | ADD-STATE | Must be a real dropdown w/ state + count | §7.1, §7.4 | No |
| List | Channel control (`Semua Saluran ▾`) | Static chip; label already de-ambiguated | ADD-STATE | Avoid ambiguous `Semua`; real dropdown | §7.1, review D.3 | No |
| List | Search field | Static span `🔎 Cari…` | ADD-STATE | Real input + 6 states (idle/typing/result/no-result/loading/error) | §7.2, §8.4 | No |
| List | Sort control | Static chip `Urutkan: Terbaru ▾` | ADD-STATE | Real menu; conceptual states Terbaru/Terlama only | §7.3 | No |
| List | Filter control + count badge | Static chip `Filter (2)` | ADD-STATE | Real panel trigger; count = active filters | §7.5, §27, review D.3 | No |
| List | Advanced filter UI | Absent | NEW (structure only) | FE has advanced filters built; show group/field/operator/value + Reset/Apply | §7.4 | No |
| List | Filter chip/value echo after apply | Absent | ADD-STATE | `Filter chip/value appears` step in filter flow | §27 | No |
| List | Conversation items (4 rows) | Present | KEEP | §7.6 minimum fields already met | §7.6 | No |
| List | Item selection (single) | Present (`li.sel`) | KEEP | Selected item must be clear | §9 | No |
| List | Compact-list at 1280 | Present (CSS) | KEEP | +160px workspace; review P0 #1 | §20.3, review B.1 | No |
| List | SLA dot on item | Present (dot only) | RESTYLE | Colour must not be sole indicator — add text/tooltip/semantic state | §7.6, §26 | No |
| List | Channel indicator on item | Absent | ADD-STATE | Required list field | §7.6 | No |
| List | Loading skeleton | Absent | ADD-STATE | Skeleton, never blank panel | §8.1, AC-04 | No |
| List | Empty (no conversation) | Absent | ADD-STATE | `No conversations` + scope-unselected variant | §8.2, §10 | No |
| List | Empty (filtered) + `Clear filters` | Absent | ADD-STATE | `No conversations match your filters.` | §8.3 | No |
| List | Search no-result | Absent | ADD-STATE | `No results found / Try another keyword.` | §8.4 | No |
| List | Search loading / search error | Absent | ADD-STATE | Required search states | §7.2 | No |
| List | List error + `Retry` | Absent | ADD-STATE | `Unable to load conversations.` | §8.5 | No |
| List | Per-item selection checkbox | Absent | NEW | Selection state for bulk | §18 | No |
| List | Star/unstar control on item | Absent | **DESIGN DECISION REQUIRED** | `Starred` exists as nav scope; per-item star control not verifiable in source | §5.2 | No |

### (c) List Bulk-Selection Bar

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Bulk bar | Selection counter (`3 selected`) | Absent | NEW | Shown when selection > 0 | §18 | No |
| Bulk bar | Bulk action bar buttons | Absent | NEW placeholder | FE bulk actions built; exact list = current implementation | §18, FE §16 | No |
| Bulk bar | Select-all + partially-selected state | Absent | NEW | Explicit required states | §18 | No |
| Bulk bar | Confirmation dialog | Absent | ADD-STATE | Confirmation step in bulk flow | §18 | No |
| Bulk bar | Processing / partial success / success / error | Absent | ADD-STATE | All required bulk states | §18 | No |

### (d) Workspace Header Actions

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| WS header | Customer block (avatar/name/contact/channel/status) | Present | KEEP | Minimum header content met | §9 | No |
| WS header | `Alihkan` | Static `<button>`, no handler | ADD-STATE | Every action needs full interaction (§14.1); keep label + behavior | §9, §14.1/§14.2 | No |
| WS header | `Transfer` | Static, no handler | ADD-STATE | Needs dialog → destination → Cancel/Transfer → loading → success/error; not destructive | §2.1, §16 | No |
| WS header | `Selesaikan` | Static, styled **primary** | RESTYLE + ADD-STATE | Spec wants secondary/destructive styling + confirmation; currently the most prominent button | §17, AC-11 | No |
| WS header | Panel Detail toggle (`▤`) | Interactive (drawer) | MOVE + ADD-STATE | Must sit in a separate viewport-control cluster; add focus return to trigger | §24, review D.2 | No |
| WS header | `More` overflow (`⋯`) | Static icon, no menu | ADD-STATE | Overflow must be a real menu (existing actions + destructive group) | §14.3 | No |
| WS header | `Reassign account channel` | Absent | NEW placeholder | FE-built; placement/label unverified → preserve current behavior | §14.2, §35 actions, FE §16 | No |
| WS header | Action cluster separation | Present (`vdiv` divider) | KEEP | Viewport control must be separated from conversation actions | review D.2 | No |
| WS | No-selection empty state | Absent | ADD-STATE | Workspace must not show stale detail | §10 | No |
| WS | Workspace loading state | Absent | ADD-STATE | Required workspace state | §11, AC-04 | No |

### (e) Message Thread + Realtime Affordances

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Thread | Inbound / outbound bubbles + timestamps | Present | KEEP | Base thread already correct | §12 | No |
| Thread | Message grouping | Absent | ADD-STATE | Listed thread requirement | §12 | No |
| Thread | `New messages` affordance | Absent | ADD-STATE | Shown only when user is scrolled up; no forced scroll | §12, AC-12 | No |
| Thread | Realtime incoming message | Absent | ADD-STATE | Keep existing Socket.IO `message` event | §11, §12, FE §10 | No |
| Thread | Realtime conversation update | Absent | ADD-STATE | Keep `conversation-updated` | §11, FE §10 | No |
| Thread | Typing indicator | Absent | ADD-STATE | Existing socket `typing` event | FE §10 | No |
| Thread | Load older messages | Absent | ADD-STATE (if applicable) | Listed as conditional | §12 | No |
| Thread | Voice-note playback controls | Absent | NEW placeholder | FE-built (`wavesurfer`/`media-chrome`); exact controls unverified → preserve behavior | FE §16, §2 | No |
| Thread | Screenshot capture (`SnippingOverlay`) | Absent | NEW placeholder | FE-built; trigger placement unverified → preserve behavior | FE §16, §12 | No |
| Thread | Linked-ticket action from a message bubble | Absent | NEW placeholder | FE-built (`multiple tickets from a message bubble`); interaction unverified | FE §16 | No |
| Thread | Message action affordance set | Absent | **DESIGN DECISION REQUIRED** | Spec makes it conditional (`jika existing FE memilikinya`) | §12 | No |

### (f) Composer

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Composer | Input field | Non-input `<span>` | ADD-STATE | Must be a real input to show Empty/Typing | §13 | No |
| Composer | Attachment (`📎`) | Static, no handler | ADD-STATE | Listed composer control | §13 | No |
| Composer | `Kirim` / Send | Static primary button | ADD-STATE | Needs disabled/loading (sending), success, error + retry affordance | §13, AC-10 | No |
| Composer | Failed-send retry affordance | Absent | ADD-STATE | Error state on message | §13 | No |
| Composer | Offline / buffered indicator | Absent | ADD-STATE | Use existing offline buffer behavior; no new rule | §13, FE §10/§7 | No |

### (g) Detail Drawer — header, sections, footer

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Drawer | Non-modal right-side model, no backdrop | Present | KEEP | Correct direction | §20.1, AC-06 | No |
| Drawer | Width 360px (320–380 range) | Present | KEEP | Within spec range | §20.2 | No |
| Drawer | Hierarchy Customer → SLA → Assignment → Metadata → Lainnya | Present | KEEP | Customer+SLA above Assignment = triage decision inputs | §21, review C.2 (P0 #3) | No |
| Drawer | `Pin` toggle | Interactive | KEEP + ADD-STATE | Persist to Zustand `conversation/layout` + localStorage; not per-conversation | §23, review C.4 | No |
| Drawer | Close `×` | Interactive | KEEP + ADD-STATE | Esc only when not pinned; focus returns to trigger | §24, review C.3 | No |
| Drawer | Copy conversation ID (`⧉ salin`) | Static, no handler | ADD-STATE | Header action required | §25 | No |
| Drawer | Copy contact number (`⧉`) | Static, no handler | ADD-STATE | Same copy affordance | §21 | No |
| Drawer | SLA FRT / TTC / RLT (value + state label + tooltip) | Present | KEEP | Text label + tooltip already meet §26 | §26 | No |
| Drawer | SLA wait-time row | Absent | ADD-STATE (if available) | Spec lists wait time when available | §21, §26, FE §16 | No |
| Drawer | Assignment source field | Absent | ADD-STATE | FE-built display: manual / self-pull / system / bulk | §15, §21, FE §16 | No |
| Drawer | Assignment control (open → select → apply → loading → success) | Absent (display-only `kv` rows) | NEW placeholder | Spec requires the interaction model; target list = agent + team inbox context | §15 | No |
| Drawer | Metadata section (Sumber / Akun / Dibuat) | Present | KEEP | Matches spec | §21 | No |
| Drawer | Accordions `Histori` / `Catatan` / `Log` | Present but **no handlers** | ADD-STATE | Listed as `LAINNYA` sections; must expand | §21 | No |
| Drawer | Drawer error state + `Retry` | Absent | ADD-STATE | Required drawer state | §22, AC-04 | No |
| Drawer | Switch-conversation / refresh / action-in-progress | Absent (content static) | ADD-STATE | Required drawer states | §22 | No |
| Drawer | Footer `Tutup Percakapan` | Present, `alert()` mock | RESTYLE + ADD-STATE | Real `AlertDialog`; destructive ≠ primary | §17, AC-11 | No |
| Drawer | Destructive kept away from `×` | Present (footer) | KEEP | ≥16px semantic separation + remote placement | §25, §17 | No |
| Drawer | Pin ↔ × 16px semantic gap | Present (`gap16`) | KEEP | Satisfies review P0 #9 | §25, review D.1 | No |
| Drawer | 44×44 hit area / 32×32 button / 16×16 icon | Present | KEEP | Satisfies review P0 #9 and §31 | §31, §25 | No |

### (h) Global Search

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Global search | Global search entry point | Absent | NEW placeholder | FE `global-search` molecule is built and must stay compatible; placement unverified | §7.2, FE §16/§12 | No |
| Global search | Relationship to list search | Absent | **DESIGN DECISION REQUIRED** | Spec only says "must remain compatible" | §7.2 | No |

### (i) Relation Labels

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Relation labels | Label display / chip on conversation | Absent | NEW placeholder | FE-built feature absent from prototype; exact chips unverified | §19, FE §16 | No |
| Relation labels | Apply / add label | Absent | NEW placeholder | Spec says "add/apply **jika tersedia**" → verify against FE | §19 | No |
| Relation labels | Unlink / remove (single) | Absent | NEW placeholder | FE v2.8.0 #2836 confirms single unlink | §19, FE §15 | No |
| Relation labels | Unlink / remove (bulk) | Absent | NEW placeholder | FE v2.8.0 #2836 confirms bulk unlink | §19, FE §15 | No |
| Relation labels | Long-label overflow behavior | Absent | ADD-STATE | FE v2.8.0 #2981 fixed chip/modal overflow | §19, FE §15 | No |
| Relation labels | Filter by label | Absent | ADD-STATE | FE feature; interacts with list filter | FE §16 | No |

### Prototype control panel (not production UI)

| Region | Element / Action | Current state | Change | Rationale | Source ref | Invented? |
|---|---|---|---|---|---|---|
| Control bar | Fidelity / Viewport / Drawer-content toggles | Present | KEEP | Useful review controls | §34 | No |
| Control bar | Role row `[Agent][SPV][Admin]` | Absent | ADD-STATE | Role simulation required | §34, §6 | No |
| Control bar | Navigation row | Absent | ADD-STATE | Required | §34 | No |
| Control bar | Conversation row (No Selection/Loading/Loaded/Error) | Absent | ADD-STATE | Required | §34 | No |
| Control bar | List row (Loaded/Loading/Empty/No Result/Error) | Absent | ADD-STATE | Required | §34 | No |
| Control bar | Filter row (None/Active/No Result) | Absent | ADD-STATE | Required | §34 | No |
| Control bar | Action row (Default/Menu Open/Confirm/Loading/Success/Error) | Absent | ADD-STATE | Drives §14.1 state coverage | §34, §14.1 | No |
| Control bar | Panel must not ship to production | Present | KEEP | Explicitly prototype-only | §34 | No |

---

## 3. ACTION BUTTON INVENTORY (exhaustive)

Interaction states required per **§14.1**: `Default → Hover → Open/interaction → Confirmation (if needed) → Loading → Success → Error`.
Type legend: **P**=primary, **S**=secondary, **I**=icon-only, **O**=overflow item, **B**=bulk, **D**=destructive, **N**=navigation item, **C**=checkbox.

| # | Label / Control | Location | Type | Required states (§14.1) | Source | FE status |
|---|---|---|---|---|---|---|
| 1 | `Alihkan` | WS header | S | all | §9, §14.2, §15 | EXISTS — action present, behavior preserve |
| 2 | `Transfer` | WS header | S | all (no destructive confirm unless impl needs it) | §16, §2.1 | EXISTS — preserve current behavior |
| 3 | `Selesaikan` | WS header | S→D | all + confirmation (AlertDialog) | §17, AC-11 | EXISTS — preserve, restyle |
| 4 | Panel Detail toggle `▤` | WS header (viewport cluster) | I (toggle) | default/hover/open/on-state | §24, §9 | EXISTS |
| 5 | `More` overflow `⋯` | WS header | I → menu | default/hover/open, item states | §14.3, §9 | EXISTS (menu items unverified) |
| 6 | Reassign account channel | WS header overflow | O | all | §14.2, §35, FE §16 | EXISTS in FE — NEW to prototype |
| 7 | `Pin` | Drawer header | I (toggle) | default/hover/on, persist | §23, §25 | EXISTS |
| 8 | Close `×` | Drawer header | I | default/hover/close, Esc, focus return | §24, §25 | EXISTS |
| 9 | Copy conversation ID | Drawer header | I/S | default/hover/copied | §25 | EXISTS (static) |
| 10 | Copy contact number | Drawer Customer section | I | default/hover/copied | §21 | EXISTS (static) |
| 11 | `Histori` accordion | Drawer LAINNYA | I (disclosure) | default/hover/open/loading/empty/error | §21 | EXISTS (no handler) |
| 12 | `Catatan` accordion | Drawer LAINNYA | I (disclosure) | default/hover/open/loading/empty/error | §21 | EXISTS (no handler) |
| 13 | `Log` accordion | Drawer LAINNYA | I (disclosure) | default/hover/open/loading/empty/error | §21 | EXISTS (no handler) |
| 14 | Assignment control (open → select agent/team inbox → apply) | Drawer ASSIGNMENT | S | all | §15 | EXISTS in FE (assignment source built); control unverified |
| 15 | `Tutup Percakapan` | Drawer footer | D | all + confirmation | §17 | EXISTS (alert mock) |
| 16 | Attachment `📎` | Composer | I | default/hover/open/picker states | §13 | EXISTS (static) |
| 17 | `Kirim` / Send | Composer | P | default/hover/sending(disabled)/success/error | §13, AC-10 | EXISTS (static) |
| 18 | Voice-note play / pause / seek | Message bubble | I/media | default/hover/playing/error | FE §16, §2 | EXISTS in FE — NEW to prototype |
| 19 | Screenshot capture | Thread / global overlay | I | default/active/captured/error | FE §16, §12 | EXISTS in FE — NEW to prototype |
| 20 | Linked-ticket action from message bubble | Message bubble | O | default/hover/loading/success/error | FE §16 | EXISTS in FE — NEW to prototype |
| 21 | `New messages` scroll-to-latest | Thread (floating) | S | hidden/visible/clicked | §12, AC-12 | NEW to prototype (realtime affordance) |
| 22 | Search input | List header | Input | idle/typing/result/no-result/loading/error | §7.2 | EXISTS in FE — NEW to prototype |
| 23 | Status dropdown | List header | S (select) | default/hover/open/selected | §7.1, §7.4 | EXISTS in FE — NEW to prototype |
| 24 | Channel dropdown (`Semua Saluran ▾`) | List header | S (select) | default/hover/open/selected | §7.1, §7.4 | EXISTS in FE — NEW to prototype |
| 25 | Sort dropdown (`Urutkan ▾`) | List header | S (select) | default/hover/open/selected | §7.3 | EXISTS in FE — NEW to prototype |
| 26 | Filter control + count badge | List header | S (panel trigger) | default/hover/open/active-count | §7.5, §27 | EXISTS in FE — NEW to prototype |
| 27 | `Apply` (filter) | Filter panel | P | default/hover/loading/applied/error | §7.4, §27 | EXISTS in FE — NEW to prototype |
| 28 | `Reset` (filter) | Filter panel | S | default/hover/reset | §7.4, §27 | EXISTS in FE — NEW to prototype |
| 29 | Advanced filter: add group / field / operator / value / remove | Filter panel (advanced) | S/I | add/remove/apply/reset | §7.4 | EXISTS in FE (advanced filters built) — structure unverified |
| 30 | `Clear filters` | List empty-filtered state | S | default/hover/cleared | §8.3 | EXISTS in FE — NEW to prototype |
| 31 | `Retry` | List error state | S | default/hover/loading/retry | §8.5 | EXISTS in FE — NEW to prototype |
| 32 | Conversation item (select) | List item | row/N | default/hover/selected/unread | §7.6, §9 | EXISTS |
| 33 | Star / unstar toggle | List item | I (toggle) | default/hover/on/off | §5.2 | **DESIGN DECISION REQUIRED** |
| 34 | Room CRUD (create / edit / delete room) | List header / item menu | S/O | all | FE §16 (room CRUD built) | EXISTS in FE — label/placement unverified |
| 35 | `Your Inbox` | Sidenav · Personal | N | default/hover/active/badge | §5.2, §5.4 | EXISTS in FE — RESTORE to prototype |
| 36 | `Starred` | Sidenav · Personal | N | default/hover/active/badge | §5.2 | EXISTS in FE — RESTORE |
| 37 | `All` | Sidenav · Global | N | default/hover/active/badge | §5.2 | EXISTS in FE — RESTORE |
| 38 | `Unassigned` | Sidenav · Global | N | default/hover/active/badge | §5.2 | EXISTS in FE — RESTORE |
| 39 | `Spam` | Sidenav · Quarantine | N | default/hover/active/badge | §5.2 | EXISTS in FE — RESTORE |
| 40 | `Junk` | Sidenav · Quarantine | N | default/hover/active/badge | §5.2 | EXISTS in FE — RESTORE |
| 41 | `Group Chat` | Sidenav | N | default/hover/active/badge | §5.2, FE §5 | EXISTS in FE — RESTORE (if route supports) |
| 42 | `Channels` expand/collapse | Sidenav | I (disclosure) | collapsed/expanded/empty | §5.2, §5.5 | EXISTS in FE — RESTORE |
| 43 | Channel item (per channel) | Sidenav · Channels | N | default/hover/active/badge | §5.2 | EXISTS in FE — RESTORE |
| 44 | `Team Inboxes` expand/collapse | Sidenav | I (disclosure) | collapsed/expanded/empty | §5.2, §5.5 | EXISTS in FE — RESTORE |
| 45 | Team inbox item | Sidenav · Team Inboxes | N | default/hover/active/badge | §5.2 | EXISTS in FE — RESTORE |
| 46 | Sidenav collapse toggle | Sidenav header | I | expanded/collapsed/tooltip | §5.5, §30 | NEW to prototype |
| 47 | Role switcher `[Agent][SPV][Admin]` | Control panel (prototype only) | segment | selected/unselected | §6, §34 | Prototype-only |
| 48 | Per-item selection checkbox | List item | C | unchecked/checked/indeterminate/hover | §18 | EXISTS in FE (bulk built) — NEW to prototype |
| 49 | Select-all checkbox | Bulk bar / list header | C | unchecked/checked/indeterminate | §18 | EXISTS in FE — NEW to prototype |
| 50 | Bulk action buttons (`[existing bulk action]` ×3) | Bulk bar | B | menu open/confirm/processing/partial/success/error | §18 | EXISTS in FE — exact list = current implementation |
| 51 | Global search entry | App/Conv header | S/I | idle/typing/result/no-result/loading/error | §7.2, FE §16 | EXISTS in FE — NEW to prototype |
| 52 | Relation label apply/add | Drawer / list item | S | default/hover/loading/success/error | §19 | EXISTS in FE — "jika tersedia" |
| 53 | Relation label unlink (single) | Chip / modal | O/S | default/confirm/loading/success/error | §19, FE §15 #2836 | EXISTS in FE — NEW to prototype |
| 54 | Relation label unlink (bulk) | Bulk bar | B | confirm/processing/partial/success/error | §19, FE §15 #2836 | EXISTS in FE — NEW to prototype |
| 55 | Relation label chip (display / filter) | Conversation + list | chip/N | default/hover/active/long-label | §19 | EXISTS in FE — NEW to prototype |

**Inventory total: 55 controls.** No FE-built conversation action is omitted; nothing invented.

**Placeholder rows (15)** — ship as structure + explicit `existing FE action — preserve current behavior` marker; exact label/list/placement is *not* verifiable from the given sources and must be filled from `omnichannel-satuinbox-fe`, never invented:
`#5` More overflow items · `#6` reassign account channel · `#14` assignment control · `#18` voice-note playback · `#19` screenshot capture · `#20` linked-ticket bubble action · `#23` Status values · `#29` advanced-filter fields/operators · `#34` room CRUD labels · `#50` bulk action list · `#51` global search placement · `#52` relation-label apply · `#53` relation-label unlink (single) · `#54` relation-label unlink (bulk) · `#55` relation-label chip display/filter.

---

## 4. STATE MATRIX (spec §35 — 53 required states)

`Yes` = demonstrable in the current prototype · `Static` = element rendered but non-interactive · `No` = absent.

### Navigation (9)

| # | State | Prototype today | Change |
|---|---|---|---|
| 1 | Agent navigation | No | ADD (role-aware sidenav) |
| 2 | SPV navigation | No | ADD |
| 3 | Admin navigation | No | ADD |
| 4 | Expanded sidenav | No | ADD |
| 5 | Collapsed sidenav | No | ADD |
| 6 | Active navigation | Static (app rail only) | ADD for conversation sidenav |
| 7 | Badge count | Static (list chip only) | ADD to sidenav items |
| 8 | Channel list expanded | No | ADD |
| 9 | Team inbox list expanded | No | ADD |

### Conversation List (15)

| # | State | Prototype today | Change |
|---|---|---|---|
| 10 | Loaded | Yes | KEEP |
| 11 | Loading | No | ADD skeleton |
| 12 | Empty | No | ADD |
| 13 | Empty due to filter | No | ADD (+ Clear filters) |
| 14 | Search | Static | ADD real input |
| 15 | Search loading | No | ADD |
| 16 | Search no result | No | ADD |
| 17 | Search error | No | ADD |
| 18 | Filter closed | Static | ADD |
| 19 | Filter open | No | ADD panel |
| 20 | Filter active | Static (`Filter (2)`) | ADD real active state |
| 21 | Sort menu open | No | ADD |
| 22 | Single selection | Yes (`li.sel`) | KEEP |
| 23 | Multi selection | No | ADD |
| 24 | Bulk action menu | No | ADD |

### Workspace (10)

| # | State | Prototype today | Change |
|---|---|---|---|
| 25 | No selected conversation | No | ADD |
| 26 | Loading | No | ADD |
| 27 | Loaded | Yes | KEEP |
| 28 | Incoming message | No | ADD |
| 29 | New message while scrolled up | No | ADD (`New messages` affordance) |
| 30 | Composer typing | No | ADD (field is a span) |
| 31 | Sending | No | ADD |
| 32 | Send error | No | ADD (+ retry) |
| 33 | Offline | No | ADD (existing buffer behavior) |
| 34 | Conversation action menu | Static (`⋯` only) | ADD real menu |

### Drawer (11)

| # | State | Prototype today | Change |
|---|---|---|---|
| 35 | Closed | Yes | KEEP |
| 36 | Open | Yes | KEEP |
| 37 | Loading | Yes (skeleton) | KEEP |
| 38 | Empty | Yes | KEEP |
| 39 | Error | No | ADD (+ Retry) |
| 40 | Pinned | Yes | KEEP (+ persist) |
| 41 | Unpinned | Yes | KEEP |
| 42 | Switching conversation | No | ADD |
| 43 | Action loading | No | ADD |
| 44 | Action success | No | ADD |
| 45 | Action error | No | ADD |

### Actions (8)

| # | State | Prototype today | Change |
|---|---|---|---|
| 46 | `Alihkan` | Static | ADD full interaction |
| 47 | `Transfer` | Static | ADD full interaction |
| 48 | `Selesaikan` | Static | ADD confirm + loading + success |
| 49 | More / overflow | Static (no menu) | ADD real menu |
| 50 | Assignment interaction | No | ADD (spec §15 model) |
| 51 | Existing bulk actions | No | ADD (exact list = current impl) |
| 52 | Existing relation-label actions | No | ADD (exact list = current impl) |
| 53 | Existing account-channel reassignment | No | ADD (preserve behavior) |

**Tally:** interactive today = **9** (List 2 = Loaded, Single selection · Workspace 1 = Loaded · Drawer 6) · present but **static** = **8** (nav active, list search, filter closed, filter active, workspace action menu, `Alihkan`, `Transfer`, `Selesaikan`) · **absent = 36** · total 53.
AC-10 ("a static button is not a completed prototype") is currently unmet: **44 of 53** state demos are missing or inert.

---

## 5. NOT Changing / Preserve Current Behavior

| Item | Why unchanged | Ref |
|---|---|---|
| App nav rail (64px, 5 icons) | Application navigation, outside Conversation scope | FE §12 |
| Drawer non-modal model, right side, no backdrop | Direction already validated | §20.1, AC-06 |
| Drawer width 360px | Inside 320–380 range | §20.2 |
| Drawer hierarchy Customer → SLA → Assignment → Metadata → Lainnya | Review P0 #3 resolution already applied | §21, review C.2 |
| SLA metric set FRT / TTC / RLT (+ wait time when available) | Matches FE-aligned metrics | §26, FE §16 |
| SLA state label + tooltip (colour never sole indicator) | Already WCAG-compliant | §26, §31 |
| Pin ↔ × 16px semantic gap; 32px button, 44×44 hit area | Review P0 #9 satisfied | §25, review D.1 |
| Destructive action in drawer footer, far from `×` | Review P1 #11 satisfied | §25, §17 |
| Motion: 200ms open / 150ms close / `cubic-bezier(0.2,0,0,1)` / `translateX` | Review P1 #5 satisfied | §24 |
| `prefers-reduced-motion` instant show/hide | Review satisfied | §24, §31 |
| Esc closes only when unpinned; `Ctrl+Shift+D` toggle | Review satisfied | §24 |
| Auto-compact list at 1280 + drawer open (120px) | Review P0 #1 satisfied; workspace 736px | §20.3, AC-07 |
| Selected list item highlight | Spec satisfied | §9 |
| Action labels `Alihkan` / `Transfer` / `Selesaikan` | Exact labels must match current implementation | §14.2 |
| Existing Socket.IO event names (`message`, `typing`, `read`, `delivered`, `conversation-updated`) | No parallel realtime channel | §29, FE §10 |
| State ownership split (URL = shareable, Zustand = UI, React Query = server) | No parallel state architecture | §29, §38 |
| `@satuinbox/ui`, Motion, RBAC, i18n, TanStack Virtual | No new library | §38, §39 |
| Drawer z-index 40 (toast 50, modal 100) | Review P1 #16 | review E.5 |
| i18n: every new string in `en` + `id` | Lint blocks hardcoded copy | §33, FE §13 |
| Dark mode via semantic tokens | No hard-coded light-only colours | §32 |
| Not-built features stay out | No new business rule | §3.2, FE §16 |

**Explicitly NOT to be added (not built in FE):** snooze, hold/resume, related conversations, collaborator role UI, WhatsApp group mention picker, auto-reply templates, room reminder, extended custom attributes. (FE §16 `Not built`.)

---

## 6. OPEN DESIGN DECISIONS (require PM/user input — not hard-coded)

| ID | Decision | Why it cannot be defaulted | Ref |
|---|---|---|---|
| OD-01 | Filter persistence across navigation switch — persisted, reset, or scoped to nav? | Spec explicitly forbids assuming; demands `design decision required` if unverifiable | §28 |
| OD-02 | Default active sidenav item per role (Agent vs SPV vs Admin landing scope) | Not stated; affects first paint | §6 |
| OD-03 | Duplicate resolve affordance: header `Selesaikan` vs drawer footer `Tutup Percakapan` — same action surfaced twice, or two distinct actions? | Spec treats them as one action but prototype has both | §14.2, §17 |
| OD-04 | `Alihkan` vs `Transfer` semantics — which is agent assignment, which is team/channel transfer? | Labels must be preserved, but scope overlaps | §15, §16 |
| OD-05 | Drawer ASSIGNMENT section: editable control vs read-only display | §21 lists display fields, §15 requires an interaction model | §15 vs §21 |
| OD-06 | Star / unstar control on a conversation item — does it exist? | `Starred` is a nav scope only; per-item toggle unverified | §5.2 |
| OD-07 | Message-bubble action affordance set (linked ticket, screenshot, voice note) | Spec makes it conditional | §12, FE §16 |
| OD-08 | Overflow (`More`) menu item list + which item is destructive | Exact items unverifiable from source | §14.3 |
| OD-09 | Bulk action list (fed to the bulk bar placeholder) | "Exact bulk action list must follow current implementation" | §18 |
| OD-10 | Sidenav collapse: default state, persistence, and interaction with 1280px list compaction | Both consume the same pixel budget | §5.5 vs §20.3 |
| OD-11 | List search vs global search — one control or two, and their scope relationship | Spec only requires compatibility | §7.2 |
| OD-12 | `Group Chat` sidenav visibility rule (always, or only when route provides it) | Spec hedges with `jika tersedia` | §5.2 |

**Open decisions: 12.**

---

## 7. Traceability Summary

| Spec section | Change rows |
|---|---|
| §5 Sidenav | (a) 1–14 |
| §6 Roles | (a) 14, control bar role row, OD-02 |
| §7 List header/filters | (b) 2–8, 14–21 |
| §8 List states | (b) 14–19 |
| §9/§10/§11 Workspace | (d) 1–10, (e) 1–10 |
| §12 Thread/realtime | (e) 1–11 |
| §13 Composer | (f) 1–5 |
| §14 Action system | (d) 2–7, inventory 1–6,1–55 |
| §15 Assignment | (g) 10–11, inventory 14 |
| §16 Transfer | (d) 3 |
| §17 Resolve | (d) 4, (g) 16 |
| §18 Bulk | (c) 1–5 |
| §19 Relation labels | (i) 1–6 |
| §20–§25 Drawer | (g) 1–18 |
| §26 SLA | (g) 8–9 |
| §27 Filtering UX | (b) 7–9, inventory 26–29 |
| §28 Nav+filter | OD-01 |
| §34 Control panel | control-bar rows |
| §35 States | §4 matrix (53) |
| §36 AC | §5 testable per row |

---

## 8. Recommended Next Action

`PROCEED_WITH_CAUTION` — the change list is implementation-ready for regions (a), (b), (d), (g) because they are fully spec-backed. Regions (c), (h), (i) and inventory items 5, 6, 14, 18–20, 23, 29, 34, 50–55 must ship as **structure + placeholder marker** and be filled from the current frontend implementation (`omnichannel-satuinbox-fe`), not invented. The 12 open decisions should be closed before the prototype is handed to implementation, per the reviewer gate.

---

{"artifact":"C:/Users/MyBook SAGA 12/Desktop/PRDanalisis/Assessments/audit/detail-uiux/2026-09-11-conversation-page-change-list.md","total_actions":55,"new_placeholders":15,"open_decisions":12}
