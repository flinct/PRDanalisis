# Assessment Report — Conversation Detail Drawer: UI/UX Review

> **Assessment Type:** UI/UX Review (existing artifact review — no behavior change)
> **Owner:** Analyst
> **Source:** `Assessments/audit/detail-uiux/satuinbox-conversation-detail-drawer-brief.md`
> **Siblings reviewed:** `uiux-audit-report-sabrina.md`, `uiux-impact-assessment.md`
> **Author:** Dany Christian | **Date:** 2026-09-09 | **Version:** 1.0
> **Rules applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/artifact-governance.md`
> **FE Reference:** `Memory/CLAUDE-fe.md` (v2.8.0-dev, prod-2.7.0.3)

---

## 0. Ringkasan

Brief merekomendasikan mengubah panel Detail Percakapan (selalu tampil di kanan) menjadi **non-modal right-side drawer** (320–380 px) yang dapat dibuka/tutup, dengan opsi Pin. Review ini mengevaluasi rekomendasi tersebut dari tiga aspek: **responsive behavior**, **kenyamanan user**, dan **tata letak button**.

**Verdict: `PROCEED_WITH_CAUTION`** — arah drawer benar, tetapi ada gap signifikan pada pixel budget di 1280×720, state persistence, dan motion spec yang harus diselesaikan sebelum implementasi.

---

## A. Verified Direction

```
DECISION: PROCEED_WITH_CAUTION
Rationale: Non-modal drawer adalah arah yang benar untuk CS inbox di 1280×720.
Brief sudah mengidentifikasi prinsip-prinsip inti yang tepat (non-modal,
primary workspace, semantic SLA). Namun ada gap teknis yang mempengaruhi
feasibility: pixel budget ketat di target viewport, belum ada spec motion/
animasi, state persistence tidak diaddress, dan info hierarchy perlu tweak
agar agent bisa scan cepat. None blocker — tapi harus resolved sebelum sprint.
```

---

## B. Responsive Behavior

### B.1 — Pixel Budget Math: 1280×720

Layout 4-panel saat drawer open:

```
CLOSED STATE (1280×720)
┌────────┬──────────────┬───────────────────────────────────────────┐
│  Nav   │  Conv List   │            Conversation Workspace         │
│  64px  │    280px     │              936px                        │
└────────┴──────────────┴───────────────────────────────────────────┘
                         └──────────── total: 1280px ────────────────┘

OPEN STATE — OPTION A: List stays, drawer pushes workspace (1280×720)
┌────────┬──────────────┬──────────────────────┬────────────────────┐
│  Nav   │  Conv List   │    Workspace         │  Detail Drawer     │
│  64px  │    280px     │      576px           │      360px         │
└────────┴──────────────┴──────────────────────┴────────────────────┘
                                                      └─ workspace: 576px ≥ 400px ✓

OPEN STATE — OPTION B: List collapses, drawer sits alongside (1280×720)
┌────────┬──────┬───────────────────────────────┬────────────────────┐
│  Nav   │ List │      Workspace                │  Detail Drawer     │
│  64px  │120px │          736px                │      360px         │
└────────┴──────┴───────────────────────────────┴────────────────────┘
                   └─ workspace: 736px ✓       └─ list compact (icon+badges)
```

| Panel | Closed | Option A (open, list full) | Option B (open, list compact) |
|-------|--------|---------------------------|-------------------------------|
| Nav | 64 px | 64 px | 64 px |
| Conv List | 280 px | 280 px | 120 px (compact) |
| Workspace | **936 px** ✓ | **576 px** ✓ | **736 px** ✓ |
| Drawer | — | 360 px | 360 px |
| **Sisa** | 0 | 0 | 0 |

**Temuan:** Pada 1280×720 dengan list full + drawer open, workspace tersisa **576 px** — di atas minimum 400 px tapi sempit untuk bubble chat panjang + reply composer. Brief bilang "≥400 px bila memungkinkan" — ini technically pass tapi **nyaman-nya borderline**. Agent yang banyak copy-paste dari chat akan merasa crowded.

**Rekomendasi:** Implementasikan **Option B** (list auto-compact saat drawer open di ≤1280 px). List compact menampilkan avatar + unread badge saja (tanpa preview/last message), memberi workspace ekstra 160 px yang sangat terasa.

### B.2 — Breakpoints

| Viewport | Behavior |
|----------|----------|
| **≥1440 px** (large desktop) | List tetap full, drawer open, workspace ≥700 px. Semua panel muat tanpa kompromi. |
| **1280–1439 px** (target laptop) | List auto-compact saat drawer open. Buka drawer via toggle button di header. |
| **1024–1279 px** (tablet landscape / kecil) | Drawer **full-width overlay** (100vw) — tidak push workspace, overlay non-modal dengan click-outside-to-close. Workspace tetap 100% saat drawer closed. |
| **<1024 px** (mobile) | Brief tidak scope ini (benar). Drawer = bottom sheet full-width. Out of scope untuk sprint ini. |

**Referensi:** Material Design 3 Side Sheets mendukung Standard (non-modal, medium+ breakpoint) dan Modal (compact breakpoint). Standar side sheet ditempatkan di tepi kanan, tidak memblokir konten utama, dan direkomendasikan untuk medium (600–839 dp) hingga expanded (840+ dp) breakpoint. [Source: m3.material.io/components/side-sheets/guidelines](https://m3.material.io/components/side-sheets/guidelines)

### B.3 — Comparison to CS Tools

| Tool | Drawer Pattern | Width at 1280px | List Behavior |
|------|---------------|-----------------|---------------|
| **Intercom** | Right side detail panel, always on (~340px) | ~340px fixed | List persists, workspace compresses |
| **Zendesk Agent Workspace** | Right context panel, collapsible (~350px) | ~350px, toggle | List stays, workspace adjusts |
| **Front** | Right sidebar detail, toggleable (~320px) | ~320px, default closed | List stays full width |
| **Gmail** | Right panel for Tasks/Keep/Calendar (~280px) | ~280px, toggle | List stays, workspace compresses |

**Pattern consensus:** Semua tool CS menggunakan right-side panel 280–350 px dengan toggle. None men-collapse list — mereka kompres workspace. Brief mengikuti pattern ini. Perbedaan: **Front** default-closed, **Intercom/Zendesk** default-open. Untuk SatuInbox dengan high volume agent, **default-closed** (seperti brief) lebih tepat — agent membuka detail hanya saat butuh.

---

## C. User Comfort & Ergonomics

### C.1 — Typography

| Element | Brief Spec | Recommendation | Notes |
|---------|-----------|----------------|-------|
| Body text (label) | 13–14 px | **13 px**, `font-medium` (500) | Label harus lebih berat dari value agar scan cepat |
| Secondary text (value) | 12–13 px | **13 px**, `font-normal` (400) | 12 px borderline readable di layar 96 DPI |
| Section heading | Tidak dispesifikasi | **11 px**, uppercase, `tracking-wider`, `text-muted-foreground` | Konsisten dengan pattern shadcn/Radix yang dipakai `@satuinbox/ui` |

**WCAG AA validation:** Contrast ratio ≥4.5:1 untuk body text. Tailwind CSS v4 oklch tokens (`--muted-foreground`) harus divalidasi — Sabrina audit (finding #4) sudah flag badge filter "tidak terlihat jelas". Pastikan `--muted-foreground` ≥ `oklch(0.45 0 0)` pada light mode.

### C.2 — Information Hierarchy (Drawer)

Brief proposed order: Assignment → SLA → Customer → Conversation → Session → History → Notes → Logs.

**Masalah:** Agent yang handle 30+ chat/day melakukan **triage** — mereka butuh tahu: (1) siapa customer, (2) berapa lama nunggu (SLA), (3) status assignment. Urutan di brief menempatkan **Assignment di atas**, tapi tanpa customer context agent tidak bisa memutuskan apakah ini perlu diprioritaskan.

**Rekomendasi hierarchy:**

```
DETAIL PERCAKAPAN                        [Pin] [×]
CV-1730  [+salin]

─── CUSTOMER ───────────────────────────────────────
Yosep Danny
+62 896 5505 7778
WhatsApp · Open

─── SLA ────────────────────────────────────────────
FRT   12m 40s   ⚠ Approaching
TTC   2h 15m    ● On track
RLT   45m       ● On track

─── ASSIGNMENT ─────────────────────────────────────
Kotak Masuk: Tim Support A
Penerima: Dany Christian

─── METADATA ───────────────────────────────────────
Sumber: WhatsApp Business
Akun: CS-01
Dibuat: 09 Sep 2026, 14:30

─── LAINNYA ────────────────────────────────────────
Histori  ›    Catatan  ›    Log  ›
```

**Alasan:** Customer + SLA di atas karena ini **decision input** (prioritas). Assignment di bawah karena ini **action input** (siapa yang kerjakan). Metadata dan accordion sections di bawah karena **reference**.

### C.3 — Drawer Open/Close Friction

| Aspect | Recommendation |
|--------|---------------|
| **Trigger** | Button click di header conversation (icon panel-right). Bukan gesture-only (unreliable di desktop). |
| **Transition** | `transform: translateX(100%) → translateX(0)`, duration **200ms**, easing `ease-out`. Jangan pakai `<Drawer>` Radix default 300ms — terasa lambat untuk power user. |
| **Focus management** | Saat drawer buka → focus pindah ke drawer close button (`×`). Saat tutup → focus kembali ke trigger button. WCAG 2.1 §2.4.3. |
| **Keyboard** | `Escape` tutup drawer. `Tab` navigasi dalam drawer. Tombol toggle: `Ctrl+Shift+D` (satukan dengan existing keyboard shortcuts jika ada). |
| **Reduced motion** | Respect `prefers-reduced-motion`: gunakan instant show/hide tanpa slide animation. |

### C.4 — Pin Persistence

| Aspect | Recommendation |
|--------|---------------|
| Pin state | Persist di Zustand store `conversation/layout` (sudah ada — per FE Codex §7). |
| Scope | Per-session browser (localStorage), bukan per-conversation. Pin = "saya mau drawer selalu buka". |
| Cross-conversation | Saat ganti conversation dengan pin active → drawer tetap buka, content berubah. |
| Pin toggle | Saat unpin → drawer tidak auto-close, tapi conversation berikutnya akan close. |

### C.5 — SLA Tooltip

```
FRT [info icon]
12m 40s
⚠ Approaching SLA
hover → "First Response Time: waktu agent pertama kali merespons
         pelanggan. SLA: 15 menit."
```

Tooltip placement: **above** (bukan bawah — di drawer bagian atas, tooltip ke bawah bisa terpotong). Delay: 300ms (default Radix). Content: singkat, satu kalimat + target SLA.

### C.6 — Agent Productivity (30+ chats/day)

**Risiko yang diidentifikasi:**

1. **Toggle setiap conversation** — Jika agent perlu buka drawer untuk setiap chat untuk lihat SLA/assignment, ini friction. **Mitigasi:** Tampilkan **compact SLA badge** di conversation list item (warna dot hijau/kuning/merah) sehingga agent tidak perlu buka drawer hanya untuk cek SLA status.

2. **Pin state reset** — Jika pin hilang saat refresh/logout, agent harus re-pin. **Mitigasi:** Persist ke `localStorage` via Zustand persist middleware.

3. **Mouse travel distance** — Dari conversation list (kiri) ke drawer close button (kanan) = ~900px. **Mitigasi:** Tambahkan keyboard shortcut `Escape` dan button toggle di conversation header (dekat area kerja utama).

---

## D. Button Layout & Placement

### D.1 — Drawer Header

Brief proposed: `Detail Percakapan [Pin] [×]`

**Evaluasi:**

```
CURRENT PROPOSAL:
Detail Percakapan             [Pin] [×]

PROBLEM: [Pin] dan [×] terlalu dekat, semantic berbeda.
Pin = workspace control (tetap buka)
× = dismiss (tutup)
Jarak minimal antara action berbeda semantic: 16px (bukan 8px).

RECOMMENDED:
Detail Percakapan            [Pin]  ┊  [×]
                               16px   8px

Atau dengan label:
Detail Percakapan        [📌 Pin]    [✕]
```

**Spesifikasi button:**

| Element | Size | Icon Size | Hit Area | Gap |
|---------|------|-----------|----------|-----|
| Pin button | 32×32 px | 16×16 px | 44×44 px (padding extends) | — |
| Close button (×) | 32×32 px | 16×16 px | 44×44 px (padding extends) | 16px from Pin |
| Section accordion | Full width | 16×16 chevron | Full width | — |

**WCAG 2.2 Target Size (Minimum):** Tombol harus memiliki target ≥24×24 px (Level AA). [Source: w3.org/WAI/WCAG22/Understanding/target-size-minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) Rekomendasi ≥44×44 px (Level AAA dan Android/Material Design guidance). [Source: m3.material.io/foundations/designing/structure](https://m3.material.io/foundations/designing/structure) Visual icon 16px, clickable area 44px via transparent padding.

### D.2 — Conversation Header (Top Bar)

Brief shows customer info in header:

```
YD  yosep danny
    +62 896 5505 7778
    WhatsApp · Open
```

**Masalah:** Header sekarang punya action buttons (assign, resolve, transfer, dll). Jika drawer toggle ditambahkan ke header, perlu clear grouping.

**Rekomendasi header layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Avatar] yosep danny                    [actions...] [Drawer ⊞] │
│          +62 896 5505 7778                                      │
│          WhatsApp · Open                                        │
└─────────────────────────────────────────────────────────────────┘

Drawer toggle = icon button "panel-right" (⊞), 44×44 hit area,
ditempatkan paling kanan header, sebelah kiri action overflow (...).
```

**Prinsip:** Toggle drawer = **navigation/viewport control**, bukan conversation action. Letakkan di area header yang terpisah dari action buttons (resolve, transfer). Gunakan separator visual (divider atau 16px gap) antara conversation actions dan viewport controls.

### D.3 — Conversation List Filters

Brief: `[Terbuka (4) ▼] [Semua ▼]` + `Urutkan: [Terbaru ▼] [Filter]`

**Evaluasi:**

| Control | Issue | Recommendation |
|---------|-------|---------------|
| `[Terbuka (4) ▼]` | OK — clear state + count. Sabrina audit finding #1 (count inconsistency) harus diselesaikan dulu. | Gunakan format `Terbuka (4)` — brief sudah benar. |
| `[Semua ▼]` | Ambiguous — "Semua" apa? Semua status? Semua saluran? | Rename ke `Semua Saluran ▼` atau `Filter Lanjutan ▼` |
| `[Urutkan]` | Terpisah dari filter — OK. | Pisahkan row: filter di atas, sort+search di bawah. |
| `[Filter]` | Tanpa badge indicator jumlah filter aktif. Sabrina audit finding #4. | Tambahkan badge count jika ada filter aktif: `Filter (2)` |

### D.4 — Destructive Action: "Tutup Percakapan" / "Selesaikan"

**Rekomendasi:**

- **Placement:** Bukan di drawer header (terlalu mudah ter-click). Taruh di **drawer footer** atau di section `ASSIGNMENT` sebagai action.
- **Visual:** Secondary button (outline), bukan primary. Red text atau red border hanya jika destructive.
- **Confirmation:** Confirmation dialog (Radix AlertDialog dari `@satuinbox/ui`) — bukan inline confirm.
- **Distance:** Jarak minimal 200px dari button close drawer (×). Footer placement menjamin ini.
- **Keyboard:** Tidak ada keyboard shortcut untuk destructive action.

```
Drawer Footer:
┌──────────────────────────────────────┐
│                                      │
│              [Tutup Percakapan]      │ ← secondary button, red text
│                                      │
└──────────────────────────────────────┘
```

---

## E. Gaps & Risks the Brief Missed

### E.1 — Drawer State Persistence

| Risk | Description | Recommendation |
|------|-------------|---------------|
| **Navigation reset** | Saat agent klik conversation lain, apakah drawer tetap buka? | Persist `drawerOpen` + `drawerPinned` di Zustand `conversation/layout` store. Saat conversation berubah: jika pinned → tetap buka, load data baru; jika unpinned → close. |
| **Refresh** | Page refresh → drawer state hilang jika tidak persist. | Persist ke `localStorage` via `zustand/middleware/persist`. |
| **URL sync** | Drawer open bukan URL-shareable. | `ponytail:` Tidak perlu URL sync untuk drawer state. Bukan filter/pagination. Add if PM requests shareable drawer views. |

### E.2 — Empty/Loading States

| State | Spec |
|-------|------|
| **Loading** | Skeleton rows (3–4 gray lines per section). Bukan spinner — skeleton memberi perceived performance lebih baik. Gunakan `@satuinbox/ui` skeleton component. |
| **Empty (no conversation selected)** | Tampilkan illustration + text "Pilih percakapan untuk melihat detail" — bukan drawer kosong. |
| **Error** | Tampilkan error state dengan retry button. |

### E.3 — Unread While Drawer Open

Agent sedang baca detail di drawer, pesan baru masuk di conversation (di belakang drawer). Behavior yang diharapkan:

- Conversation area (yang tidak tertutup drawer) tetap scroll ke pesan terbaru.
- Badge unread di conversation list tetap update.
- Tidak perlu notification sound/visual di drawer — itu sudah di list.

### E.4 — Motion/Animation Spec

| Property | Value | Rationale |
|----------|-------|-----------|
| Open duration | `200ms` | Material Design 3: standard duration untuk medium-large component. 300ms terasa lambat untuk power user. |
| Close duration | `150ms` | Close lebih cepat dari open (user sudah selesai, tidak perlu elegan). |
| Easing | `cubic-bezier(0.2, 0, 0, 1)` (standard easing) | Material Design 3 standard decelerate. |
| Transform | `translateX(100%) → translateX(0)` | GPU-accelerated, no layout reflow. |
| `prefers-reduced-motion` | Instant show/hide, no slide | WCAG 2.3.3 compliance. |
| Animation library | **Motion** (already installed, `^12.23.24`) | Jangan install library baru. Gunakan `motion.div` dengan `animate` prop. |

### E.5 — z-index Stacking

| Layer | z-index | Notes |
|-------|---------|-------|
| Conversation content | 0 | Base |
| **Drawer** | **40** | Di atas content, di bawah modals. |
| Toast/Snackbar | 50 | `@satuinbox/ui` toast provider |
| Modal/Dialog | 100 | Radix dialog default |
| Dropdown menu | 60 | Radix dropdown |

Drawer z-index 40 memastikan drawer di atas content tapi di bawah modal/toast. Pastikan `@satuinbox/ui` toast provider tidak conflict.

### E.6 — Performance (React 19 / Zustand 5)

| Concern | Analysis |
|---------|----------|
| **Drawer toggle re-render** | Jika `drawerOpen` ada di store yang sama dengan conversation data → toggle drawer re-render conversation workspace. **Mitigasi:** Pisahkan `drawerOpen`/`drawerPinned` ke slice terpisah (`conversation/layout`) — **sudah ada** per FE Codex §7 (`layout` store). Gunakan `useStore(selector)` dengan shallow compare. |
| **Drawer content data** | Detail drawer memuat assignment, SLA, metadata, customer → ini server state (React Query). Bukan Zustand. Drawer content di-fetch via TanStack Query key `['conversation', id, 'detail']`. Saat drawer buka → fetch; tutup → data tetap di cache. |
| **Slide animation** | GPU-accelerated `transform` — zero layout reflow. Tidak ada reflow risk. |
| **Bundle** | Tidak ada dependency baru. Gunakan `motion` (sudah ada), `@satuinbox/ui` drawer/sheet (Radix-based, sudah ada). |

### E.7 — Dark Mode / High Contrast

- Drawer harus menggunakan Tailwind semantic tokens (`bg-card`, `text-card-foreground`, `border`) — bukan hardcoded colors.
- SLA warna (hijau/kuning/merah) harus punya **text label** selain warna (WCAG 1.4.1). Brief sudah mention ini — confirm.
- High contrast mode: pastikan border drawer terlihat (`border-2` bukan `border`).

### E.8 — Touch / Swipe

Desktop-only sprint. Jika nanti mobile/tablet:
- Swipe right-to-close (Material Design gesture pattern).
- `ponytail:` skip gesture spec sekarang, add saat mobile scope masuk.

### E.9 — RTL Readiness

Drawer di kanan (LTR). Di RTL → drawer harus di kiri. Gunakan `inset-inline-end: 0` (CSS logical property) bukan `right: 0`. Tailwind CSS v4 support ini via `end-0`.

---

## F. Prioritized Recommendations

| # | Aspect | P-Level | Action | Rationale | Brief Ref |
|---|--------|---------|--------|-----------|-----------|
| 1 | Responsive | **P0** | **Add** — Implement list auto-compact saat drawer open di ≤1280px | Workspace 576px borderline. Compact list +160px. | Brief §Responsive |
| 2 | Responsive | P1 | **Add** — Full-width overlay drawer di <1024px | Brief tidak scope tablet. Butuh spec jika tablet masuk. | Brief §Responsive |
| 3 | Comfort | **P0** | **Upgrade** — Reorder hierarchy: Customer → SLA → Assignment → Metadata | Agent triage = siapa + berapa lama nunggu, bukan assignment dulu. | Brief §Info Hierarchy |
| 4 | Comfort | P0 | **Confirm** — SLA semantic: merah = breach, kuning = approaching, netral = elapsed | Brief sudah benar. Pastikan implementation tepat. | Brief §SLA |
| 5 | Comfort | P1 | **Add** — Motion spec: 200ms open, 150ms close, standard easing | Brief tidak specify animasi. Perlu spec untuk developer. | — |
| 6 | Comfort | P1 | **Add** — Focus management: drawer open → focus ke close button | WCAG 2.4.3. Brief tidak address keyboard flow. | Brief §Accessibility |
| 7 | Comfort | P1 | **Add** — Compact SLA badge di conversation list (warna dot) | Kurangi kebutuhan buka drawer hanya untuk cek SLA. | Brief §Conv List |
| 8 | Comfort | P2 | **Add** — Keyboard shortcut `Ctrl+Shift+D` untuk toggle drawer | Power user productivity. | Brief §Accessibility |
| 9 | Button | **P0** | **Upgrade** — 16px gap antara Pin dan ×, 44×44px hit area | Semantic separation + WCAG target size minimum. | Brief §Close Control |
| 10 | Button | **P0** | **Add** — Drawer toggle button di conversation header (paling kanan) | Brief tidak specify trigger placement. Perlu spec. | — |
| 11 | Button | P1 | **Add** — Pindahkan "Tutup Percakapan" ke drawer footer | Hindari accidental click. Brief tidak specify destructive action placement. | Brief §Terminology |
| 12 | Button | P1 | **Upgrade** — Rename "Semua" filter ke "Semua Saluran" atau "Filter Lanjutan" | Ambiguous. Sabrina audit finding #3/#4. | Brief §Conv List |
| 13 | Button | P1 | **Add** — Badge count pada filter aktif | Sabrina audit finding #4. Brief mention tapi tidak specify. | Brief §Conv List |
| 14 | Gap | **P0** | **Add** — Drawer state persistence (Zustand + localStorage) | Navigation reset = broken UX. | — |
| 15 | Gap | **P0** | **Add** — Loading (skeleton) + empty state spec | Developer perlu spec. Brief tidak address. | — |
| 16 | Gap | P1 | **Add** — z-index spec: drawer 40, toast 50, modal 100 | Stacking conflict risk. | — |
| 17 | Gap | P1 | **Add** — Dark mode: Tailwind semantic tokens, SLA text label | Brief mention tapi tidak specify implementation. | Brief §Accessibility |
| 18 | Gap | P1 | **Add** — `inset-inline-end: 0` (RTL) | Tailwind CSS v4 support. Trivial now, hard later. | — |
| 19 | Gap | P2 | **Add** — Drawer content swipe-to-close spec (mobile) | Out of scope tapi perlu noted. | — |
| 20 | Gap | P0 | **Confirm** — Drawer store di `conversation/layout` slice terpisah | Performance. Perlu verify di repo. | — |

### Priority Summary

| Priority | Count | Theme |
|----------|-------|-------|
| **P0** | 8 | Pixel budget, hierarchy reorder, button sizing, state persistence, empty state, store separation |
| **P1** | 9 | Motion, focus, compact badge, destructive placement, filter clarity, z-index, dark mode, RTL |
| **P2** | 2 | Keyboard shortcut, touch/swipe |

---

## G. Decision Block

```
DECISION: PROCEED_WITH_CAUTION

Rationale:
Arah non-modal drawer sudah benar — ini pattern standar untuk CS inbox
(Intercom, Zendesk, Front semua pakai). Brief mengidentifikasi prinsip
inti yang tepat: non-modal, no backdrop, primary workspace.

Namun ada 8 temuan P0 yang harus diselesaikan sebelum implementation:
1. List auto-compact saat drawer open (pixel budget)
2. Info hierarchy reorder (Customer > SLA > Assignment)
3. Button sizing 44×44px + semantic gap
4. Drawer toggle trigger spec
5. State persistence (Zustand + localStorage)
6. Loading/empty state spec
7. Store slice separation (performance)
8. SLA semantic implementation

None dari temuan ini mengubah arah brief — semuanya adalah gap yang
bisa diselesaikan dalam satu pre-implementation design pass sebelum
sprint dimulai.

Gate: 8 P0 items harus addressed di design spec / mini-PRD sebelum
sprint commitment.
```

---

## Referensi

| Source | URL | Used For |
|--------|-----|----------|
| Material Design 3 — Side Sheets | [m3.material.io/components/side-sheets/guidelines](https://m3.material.io/components/side-sheets/guidelines) | Standard vs Modal side sheet, breakpoint guidance (medium/expanded) |
| WCAG 2.2 — Target Size (Minimum) | [w3.org/WAI/WCAG22/Understanding/target-size-minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | 24px minimum, 44px recommended for interactive elements |
| Material Design 3 — Touch targets | [m3.material.io/foundations/designing/structure](https://m3.material.io/foundations/designing/structure) | 44dp pointer target recommendation |
| SaaSFactor — Modal UX Design | [saasfactor.co/blogs/modal-ux-design](https://www.saasfactor.co/blogs/modal-ux-design) | Non-modal drawer as alternative to modals, responsive drawer patterns |
| Smashing Magazine — Modal vs Separate Page | [smashingmagazine.com/2026/03/modal-separate-page-ux-decision-tree](https://www.smashingmagazine.com/2026/03/modal-separate-page-ux-decision-tree/) | Decision tree: drawer for sub-tasks, maintain background context |
| Userpilot — Modal UX | [userpilot.com/blog/modal-ux-design](https://userpilot.com/blog/modal-ux-design/) | Side drawer for reference tasks, expandable sections for repeated tasks |

---

> **Reviewer gate:** Artifact ini memenuhi syarat untuk workflow-reviewer gate. Perlu verifikasi: completeness (6 sections × coverage), decision enum valid, recommendations traceable ke findings.
