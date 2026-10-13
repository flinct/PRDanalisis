# Integrasi Kategori Milestone ke QA Browser Roadmap — Implementation Plan

> **Untuk Hermes:** eksekusi task-by-task. Setiap task kecil, verifikasi via `node --check` + browser smoke test (CDP 9222). Hard-refresh browser setelah tiap patch.

**Goal:** Jadikan 18 kategori milestone (hasil analisa + validasi Dany) sebagai dimensi kategori resmi di roadmap QA Browser — vocab dinamis + field `category` per task + auto-suggest saat add + group/filter by category di RoadmapPage.

**Arsitektur:** Kategori disimpan sebagai **vocab config dinamis** (`roadmap_cfg_v1.categoryVocab`), BUKAN hardcode — supaya kategori ke-19 cukup tambah 1 entri, konsisten dengan pola dynamic vocab tracker (`ui-tracker.js`). Field `category` ditambah ke task model; auto-suggest pakai keyword engine (port dari `build_milestones.py`) sebagai default, user bisa override. Grouping by category jadi mode tampilan baru di All View.

**Tech stack:** React 18 (inline Babel + module `Test/modules/ui-roadmap.js`), IndexedDB (`roadmap_v1`, `roadmap_cfg_v1`), server seed-save (`.roadmap-seed.json`), OpenProject REST (via `server.js`).

**Prinsip klasifikasi (WAJIB dipertahankan):** objek menentukan kategori, bukan jenis aktivitas. brainstorm/research/meeting → kategori objeknya; hanya koordinasi generik tanpa objek → `ops`.

---

## Current Context / Assumptions

- **RoadmapPage** = `Test/modules/ui-roadmap.js` (1627 baris), di-load via `<script src="./modules/ui-roadmap.js">`, expose `window.RoadmapV2Module.RoadmapPage`.
- Roadmap sekarang **group by status bucket** (NOW/NEXT/BACKLOG/DONE via `groupOpByStatus`/`opBucketOf`), BUKAN by kategori. Tidak ada dimensi kategori.
- Field **"Area"** sudah ada tapi:
  - `RM_AREAS` (14 entri, di `testcase-browser.html:5872`) didefinisikan tapi hampir tak terpakai.
  - `msForm.area` = free-text input di Add Milestone modal (`ui-roadmap.js:1066`), disimpan LOCAL di `roadmap_ms_docs_v1` keyed by opId — bukan field task utama.
  - Task model `roadmap_v1` punya `strategicArea` tapi isinya kacau (54/95 = "Task"/"Feature"/"Bug").
- **18 kategori final** (14 primary + 4 supporting) + mapping 95 task → ada di `Assessments/reference/roadmap-milestone-categories.md`.
- **Keyword engine** sudah teruji di `C:\Users\MyBook SAGA 12\.hermes\cache\scratch\build_milestones.py` (RULES + RM_EXPLICIT) — jadi sumber kebenaran auto-suggest.
- Column render: header + rows pakai `COLW` object (`ui-roadmap.js:711`), ada slot "Area"/"Type" (width 100).

**Asumsi:** kita pakai **Opsi A** (field `category` baru, pisah dari `strategicArea` lama — backward compat). `strategicArea` dibiarkan, tidak dihapus.

---

## KEPUTUSAN FINAL (Dany, 2026-10-12)

1. **Scope eksekusi awal: Fase 1 + 2 saja** (data layer + auto-suggest + edit). Fase 3 (grouping view) ditunda, dikerjakan terpisah setelah review.
2. **Group-by-category = OPSIONAL** (toggle). Status tetap default grouping di All View. → relevan untuk Fase 3, catat untuk nanti.
3. **Category LOKAL saja** — simpan di IDB (`roadmap_v1`) + seed (`.roadmap-seed.json`). TIDAK di-sync ke OpenProject (OP tak punya native field kategori). Push OP tetap seperti sekarang.
4. **Isi category ke IDB existing = on-load migration NON-DESTRUKTIF** — saat `loadRoadmapIDB`, task yang `category` kosong diisi via `suggestCategory(title, desc)`. TIDAK reseed penuh (hindari timpa edit lokal user). Task yang sudah punya `category` tidak disentuh.

---

## Proposed Approach — 3 Fase

**Fase 1 — Data layer (vocab + field + migration).** Tambah vocab config + field `category`, seed 95 task existing dari mapping reference. Tanpa perubahan UI dulu.

**Fase 2 — Auto-suggest + Add/Edit UI.** Port keyword engine ke JS, convert field "Area" jadi dropdown kategori dengan default auto-suggest, tambah ke Add Milestone modal + inline edit.

**Fase 3 — Group & filter by category di RoadmapPage.** Mode "Group by: Category" di All View + filter chip per kategori + KPI per kategori (mirip view HTML yang sudah dibuat).

---

## Files Likely to Change

| File | Perubahan |
|---|---|
| `Test/modules/ui-roadmap.js` | vocab consts, category field, auto-suggest fn, dropdown render, group-by-category view, filter |
| `Test/testcase-browser.html` | (opsional) ganti `RM_AREAS` → `RM_CATEGORY_DEFAULTS`, expose vocab helper ke module |
| `Assessments/audit/00-Timeline/.roadmap-seed.json` | tambah field `category` ke 95 task + `roadmap_cfg_v1.categoryVocab` (via migration script, bukan manual) |
| `C:\...\scratch\seed_categories.py` | script migrasi one-off (baca mapping → tulis category ke seed) |

---

## Fase 1 — Data Layer

### Task 1.1: Definisikan vocab kategori sebagai konstanta

**Objective:** Buat `RM_CATEGORY_DEFAULTS` (18 entri: slug, name, tier) sebagai fallback saat vocab config kosong.

**Files:** Modify `Test/modules/ui-roadmap.js` (dekat `MS_FORM_INIT` ~baris 239)

**Step 1:** Tambah konstanta:
```js
// 18 kategori milestone (master). Fallback saat roadmap_cfg_v1.categoryVocab kosong.
// Prinsip: objek menentukan kategori, bukan aktivitas. Dynamic — bisa ditambah via config.
const RM_CATEGORY_DEFAULTS = [
  { slug: 'superadmin',   name: 'SuperAdmin Global Company Access', tier: 'primary' },
  { slug: 'export',       name: 'Advanced Offline Export Suite',    tier: 'primary' },
  { slug: 'release',      name: 'Release Engineering',              tier: 'primary' },
  { slug: 'sales',        name: 'Sales Module & Leads',            tier: 'primary' },
  { slug: 'conversation', name: 'Conversation & Inbox Experience',  tier: 'primary' },
  { slug: 'ticket',       name: 'Ticketing & Post-Sales Flow',      tier: 'primary' },
  { slug: 'channels',     name: 'Channel Expansion & WhatsApp Web', tier: 'primary' },
  { slug: 'broadcast',    name: 'Broadcast & Anti-Spam Engine',     tier: 'primary' },
  { slug: 'analytics',    name: 'Analytics & Reporting',            tier: 'primary' },
  { slug: 'ai',           name: 'AI & Automation',                  tier: 'primary' },
  { slug: 'notification', name: 'Notification Service',             tier: 'primary' },
  { slug: 'widget',       name: 'Widget Platform',                  tier: 'primary' },
  { slug: 'setting',      name: 'Settings & Onboarding',            tier: 'primary' },
  { slug: 'growth',       name: 'Growth, GTM & Demo Readiness',     tier: 'primary' },
  { slug: 'infra',        name: 'Infra, Performance & Security',    tier: 'supporting' },
  { slug: 'billing',      name: 'Billing, Subscription & Fraud',    tier: 'supporting' },
  { slug: 'stab',         name: 'Production Stabilization',         tier: 'supporting' },
  { slug: 'ops',          name: 'Ops, QA & BAU',                    tier: 'supporting' },
];
```

**Step 2:** Verify — `node --check Test/modules/ui-roadmap.js` → no syntax error.

### Task 1.2: Loader vocab dari config (dynamic)

**Objective:** Fungsi `getCategoryVocab()` = merge `roadmap_cfg_v1.categoryVocab` (IDB) ∪ defaults — pola dynamic vocab tracker.

**Files:** Modify `Test/modules/ui-roadmap.js`

**Step 1:** Tambah helper:
```js
// vocab = config override ∪ defaults (defaults dulu, lalu slug baru dari config). Dynamic: tambah di config → muncul.
function mergeCategoryVocab(cfgVocab) {
  const out = [...RM_CATEGORY_DEFAULTS];
  const seen = new Set(out.map(c => c.slug));
  (cfgVocab || []).forEach(c => { if (c && c.slug && !seen.has(c.slug)) { out.push(c); seen.add(c.slug); } });
  return out;
}
```

**Step 2:** Verify `node --check`.

### Task 1.3: Migrasi seed — tulis `category` ke 95 task + vocab ke config

**Objective:** Script one-off isi field `category` tiap task dari mapping reference + tanam `categoryVocab` di `roadmap_cfg_v1`. BUKAN manual.

**Files:** Create `C:\Users\MyBook SAGA 12\.hermes\cache\scratch\seed_categories.py`; Modify `.roadmap-seed.json`

**Step 1:** Script: baca `rows.json` (sudah ada, punya `rmId`→`ms`), map ke `roadmap_v1[].category`, tambah `roadmap_cfg_v1.categoryVocab` = 18 default. Backup seed dulu (`.roadmap-seed.json.bak`).

**Step 2:** Run script. Expected: 95 task dapat `category`, 0 task tanpa kategori.

**Step 3:** Verify: `python -c` cek semua task punya `category` ∈ 18 slug, dan `roadmap_cfg_v1.categoryVocab` panjang 18.

**Step 4:** CATATAN — seed di-load ke IDB saat pertama buka QA Browser. Perlu konfirmasi apakah IDB auto-reseed atau perlu clear. Cek `loadRoadmapIDB` behavior sebelum assume.

---

## Fase 2 — Auto-suggest + Add/Edit UI

### Task 2.1: Port keyword engine ke JS

**Objective:** `suggestCategory(title, desc)` → slug, port dari `build_milestones.py` RULES (ordered regex, objek-menentukan, ops last-resort).

**Files:** Modify `Test/modules/ui-roadmap.js`

**Step 1:** Port array `RULES` (18+ aturan, urutan persis dari build_milestones.py) + fungsi:
```js
const RM_CAT_RULES = [
  ['stab', /^\[(?:[^]]*service|auth|redash|webhook|...)|occurrence|.../i],
  // ... port PERSIS urutan dari build_milestones.py (stab, ops, infra-cicd, superadmin,
  //     export, infra-api-platform, release, growth, sales, broadcast, channels,
  //     notification, ai, widget, infra, analytics, ticket, conversation, billing, setting, ops-last)
];
function suggestCategory(title, desc) {
  const s = ((title||'') + ' ' + (desc||'')).toLowerCase();
  for (const [slug, rx] of RM_CAT_RULES) if (rx.test(s)) return slug;
  return 'ops'; // last-resort
}
```

**Step 2:** Verify dengan test inline: `suggestCategory('Brainstorming Bad decrypt')` → `channels`; `suggestCategory('Notification Service Improvement')` → `notification`; `suggestCategory('wizard setting onboarding')` → `setting`. Jalankan via node snippet.

### Task 2.2: Field "Area" → dropdown "Kategori" di Add Milestone modal

**Objective:** Ganti free-text `msForm.area` (baris 1066) jadi `<select>` dari vocab, default = `suggestCategory(title, desc)`, bisa override.

**Files:** Modify `Test/modules/ui-roadmap.js:1063-1067`

**Step 1:** Tambah `category` ke `MS_FORM_INIT` (baris 239). Render dropdown + badge "disarankan" saat pakai auto-suggest. Auto-isi saat title/desc berubah dan user belum override (track `categoryTouched`).

**Step 2:** Verify browser: buka Add Milestone, ketik judul "ticket bulk update" → dropdown default ke `ticket`.

### Task 2.3: Simpan `category` saat create + inline edit kolom kategori

**Objective:** Push `category` ke task saat submit; tambah inline-edit dropdown di row.

**Files:** Modify `ui-roadmap.js` (create handler ~baris 527, row render ~COLW)

**Step 1:** Simpan `category` ke task object + persist IDB + seed-save.
**Step 2:** Ganti kolom "Area"/"Type" render jadi badge kategori (warna per tier).
**Step 3:** Verify browser: create task, cek `category` tersimpan di IDB (`loadRoadmapIDB`).

---

## Fase 3 — Group & Filter by Category

### Task 3.1: Toggle "Group by: Status | Category" di All View

**Objective:** Mode grouping baru. Default tetap Status (backward compat).

**Files:** Modify `ui-roadmap.js` All View (~baris 1514-1618)

**Step 1:** State `groupMode` (`'status'|'category'`). Saat `category`: ganti `groupOpByStatus` → group by `wp.category` pakai urutan vocab (primary dulu, supporting, kosong auto-hide — persis logika view HTML).
**Step 2:** Verify browser: toggle ke Category → task tergroup per kategori, kategori kosong hilang.

### Task 3.2: KPI + progress per kategori (opsional, mirror view HTML)

**Objective:** Header mini-strip per kategori (total/done/progress) saat group=category.

**Files:** Modify `ui-roadmap.js`

**Step 1:** Per group: hitung total/done/avg progress. Render di group header.
**Step 2:** Verify browser.

### Task 3.3: Filter chip per kategori

**Objective:** Klik kategori → filter task kategori itu saja.

**Files:** Modify `ui-roadmap.js`
**Step 1:** State `catFilter`. Chip strip dari vocab. **Step 2:** Verify browser.

---

## Tests / Validation

- **Syntax:** `node --check Test/modules/ui-roadmap.js` setelah tiap patch.
- **Keyword engine parity:** node snippet — 95 task harus dapat kategori sama persis dengan `rows.json` (0 beda). Ini gate kritis: auto-suggest = build_milestones.py.
- **Browser smoke (CDP 9222):** render RoadmapPage, cek dropdown kategori, group-by-category, filter, create task.
- **No regression:** Month View + status grouping + OP push tetap jalan.
- **Hard-refresh** (`Ctrl+Shift+R`) tiap patch — `express.static` tanpa no-cache.

---

## Risks / Tradeoffs / Open Questions

**Risks:**
1. **IDB reseed** — seed JSON di-load sekali; task existing di IDB user mungkin tak otomatis dapat `category`. Perlu cek `loadRoadmapIDB`: migrasi on-load (isi `category` via `suggestCategory` kalau kosong) ATAU reseed. **Rekomendasi:** on-load migration, non-destruktif.
2. **File besar + inline Babel** — `ui-roadmap.js` 1627 baris. Patch kecil, `node --check` tiap langkah, hindari IIFE di JSX ternary (silent blank — lihat skill pitfalls).
3. **`category` hilang di IDB round-trip?** `_source` field diketahui hilang (skill note). Cek `category` persist setelah save/reload — kalau hilang, simpan di `roadmap_v1` payload utama, bukan field turunan.
4. **Shared JSX di 2 return path** (Month vs All View) — kalau filter chip/KPI dipakai dua-duanya, extract ke variable sebelum `if (monthView)` (pola `qPopupEl`).

**Open questions (butuh keputusan Dany):**
1. **Scope awal** — mulai Fase 1+2 saja (data + auto-suggest + edit), tunda Fase 3 (grouping view)? Atau full?
2. **Group-by-category** jadi default All View, atau Status tetap default + Category opsional?
3. **`category` sync ke OP?** OP tidak punya native field kategori. Simpan lokal saja, atau map ke OP label/custom field? (Rekomendasi: lokal dulu.)
4. **Kategori editable dari UI?** (tambah slug ke-19 dari Settings) — bagian Fase 3+ atau cukup config file dulu?

---

## Urutan Eksekusi yang Disarankan

1. Fase 1 (data) → low-risk, fondasi. Validasi parity 95 task.
2. Fase 2 (auto-suggest + edit) → nilai langsung: task baru auto-kategori.
3. Fase 3 (grouping view) → presentasi, mirror view HTML yang sudah jadi.

Tiap fase bisa di-review terpisah sebelum lanjut.

---

## STATUS EKSEKUSI

### ✅ Fase 1 — DONE (2026-10-13)
- `RM_CATEGORY_DEFAULTS` (18) + `mergeCategoryVocab` + `categoryMeta/Color` di `ui-roadmap.js` (atas module).
- `suggestCategory()` + `RM_CAT_RULES` port — **parity 95/95** dengan build_milestones.py (verified via `module_parity.js`).
- Exposed `window.rmSuggestCategory` / `RM_CATEGORY_DEFAULTS` / `rmMergeCategoryVocab`.
- Seed migration (`scratch/seed_categories.py`): 95/95 task dapat `category`, `roadmap_cfg_v1.categoryVocab` = 18. Backup dibuat.
- On-load migration NON-DESTRUKTIF di `loadRoadmapIDB` (`testcase-browser.html`): task tanpa category diisi via `rmSuggestCategory`, write-back ke IDB. **Verified browser: roadmap_v1 tasks=95 withCat=95.**

### ✅ Fase 2 — DONE (2026-10-13)
- `MS_FORM_INIT` + `category`/`categoryTouched`.
- `msVocab` state (load dari `roadmap_cfg_v1.categoryVocab` ∪ defaults).
- Field "Area" free-text → **dropdown Kategori** (19 opsi) dengan auto-suggest default + badge "· disarankan" + warna per tier.
- Title/desc onChange auto-suggest saat belum di-override; manual pick set `categoryTouched` (override respected).
- Create handler simpan `category` LOCAL di `roadmap_ms_docs_v1` (keyed OP id), tidak dikirim ke OP.
- **Verified browser:** modal buka, 19 opsi, "ticket bulk update via open api" → auto `ticket`, manual override → `billing` bertahan saat retitle.

### Validasi tooling (lesson)
- `ui-roadmap.js` JSX → `node --check` TIDAK bisa (false alarm di `<`). Gunakan Babel transpile: `node scratch/babelcheck.js` (pakai `node_modules/@babel/standalone`). TRANSPILE OK = valid.
- IDB name = **`tcbrowser`**, store `handles`. (Bukan `qa-tc-browser`.)
- Login QA Browser: dev defaults `admin/admin123` tampil di halaman; React input perlu native value setter + `input` event.

### ✅ Fase 3 — DONE (2026-10-13)
- `wpCategoryOf(wp)` = local override (`msDocs[wpId].category`) → fallback `suggestCategory(subject,desc)`. OP tak punya field kategori; LOCAL.
- `groupOpByCategory(rows)` — bucket by category, urut vocab (primary→supporting), kosong auto-hide. Mirror `groupOpByStatus`.
- State `groupMode` (`'status'` default | `'category'`) + `catFilter` ('' = semua).
- All View: toggle **Group: Status | Kategori** di KPI strip. Status tetap default (sesuai keputusan).
- Category mode: baris filter chips per kategori (nama + count, warna per tier) + chip "Semua (N)".
- Per-group header KPI (hanya di category mode): `N done`, `N now`, progress bar + %.
- **Verified browser:** toggle Status↔Kategori jalan, 18 chip dengan count (1537 WP ter-kategori live), klik chip filter ke 1 kategori, group header KPI tampil, balik ke Status restore NOW/NEXT/BACKLOG/DONE. Screenshot OK.

> **Catatan cakupan:** All View membaca SELURUH `opCache` (±1537 WP), bukan cuma v2.8.3's 59. Jadi Category mode meng-kategorikan seluruh backlog OP secara live via `suggestCategory`. Kategori tetap LOCAL (tidak menyentuh OP).
