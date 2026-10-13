# Plan: Roadmap v2 — OpenProject sebagai Source of Truth

> Status: DRAFT (menunggu konfirmasi user)
> Tanggal: 2026-10-13
> Owner: Dany Christian (PM)

## Tujuan

Balik arsitektur roadmap QA Browser: **OpenProject (project 7) = source of truth**, cache
ke IndexedDB QA Browser, All/Month View jadi **filter murni** di atas cache. Intake baru:
**1 request → 1 Milestone (+ dokumen pendukung lokal) → push OP → breakdown jadi Feature
(parent-child WP) → push OP menyusul.** Field & kolom existing dipertahankan.

## Keputusan terkunci (dari user)

| Topik | Keputusan |
|---|---|
| Source of truth | **OP murni → Roadmap v2.** `roadmap_v1` + seed lokal ditinggalkan & akan dihapus. Draft lokal hanya staging sebelum push; sekali pushed tampil dari cache OP. |
| Dokumen pendukung | **Lokal saja** di QA Browser roadmap, untuk analisa awal milestone. TIDAK ikut ke OP. Bentuk: daftar link/path + catatan teks (belum final — lihat Open Question). |
| Hierarki | **Parent-child WP OP** (`_links.parent`). Feature = child dari Milestone WP. |
| Scope fetch | **Semua WP project 7** (semua version + backlog), cache sekali, filter di client. |

## Kondisi aktual kode (terverifikasi, bukan asumsi)

- Dashboard v1 & Roadmap v1 **sudah dibuang dari runtime.** `testcase-browser.html:6854`
  komentar "Dashboard v1 removed — v2 is the default landing". Nav utama hanya `dashboard-v2`.
- Dashboard v2 modular: tiap page diekstrak ke module (`Test/modules/ui-overview.js`,
  `ui-roadmap.js`, `ui-tracker-v2.js`, `ui-cost.js`), di-load sebagai `<script type="text/babel">`
  di `testcase-browser.html:388-391`, di-destructure di `:6779-6782`.
- **`RoadmapView` (v1 inline) SUDAH TIDAK ADA** di HTML. Satu-satunya roadmap aktif =
  `RoadmapPage` dari `window.RoadmapV2Module` (`ui-roadmap.js`), di-mount di
  `testcase-browser.html:8841` saat `dashV2Sub === "roadmap"`.
- **`Test/modules/ui-roadmap.js` (1868 baris)** = semua kerja roadmap ada di sini.

### Peta `ui-roadmap.js` (anchor line)

| Area | Line | Catatan |
|---|---|---|
| `tasksToSections(tasks)` | 188 | derive NOW/NEXT/BACKLOG dari `current`/`schedule`/`status` |
| IDB helpers (via window) | 222 | `loadRoadmapIDB`, `saveRoadmapIDB`, `RM_SEED_PATH` |
| `mvOp` state (OP rows) | 305 | `useState({verId,loading,rows})` — **in-memory, tidak di-cache** |
| OP meta fetch | 311 | `/api/dashboard/openproject/meta?projectId=7` |
| available-assignees | 316 | `/api/dashboard/openproject/available-assignees` |
| OP work-packages fetch | 336 | `work-packages?versionIds=...&pageSize=200` — **per-version** |
| `opRowView(wp)` | 376 | normalisasi WP → row view + opEdits overlay |
| `opSortRows` | 393 | sort prio-only |
| `checkDuplicateTask` | 410 | IDB fuzzy + OP search |
| `parseImportMd` | 397 | `## = milestone`, `### BD: = breakdown` |
| `createAddTasks` | 435 | bikin task lokal (type default 3=FEATURE) |
| `pushOpToOP(wp)` | 465 | PATCH WP OP (edit existing) |
| `rawTasks` ref + `applyRaw` | 519-521 | **IDB `roadmap_v1` = source saat ini** |
| initial load (IDB→seed) | 533-567 | load `roadmap_v1`, fallback seed file |
| `OP_TYPES` | 854 | `1=TASK 2=MILESTONE 3=FEATURE 4=EPIC 5=USER STORY 6=BUG` |
| create WP (push) | 928-938 | POST `/work-package` typeId=taskType |
| All View render | ~1430+ | roadmap rows + OP pill |
| Month View (`if(monthView)`) | 1370 | `filteredOpRows = opSortRows(mvOp.rows)...` (1383) |
| OP inline detail panel | 1572 | mirror DetailPanel, wired ke opRowView/setOpEdit |

### Server (`server.js`)

| Endpoint | Line | Perlu diubah? |
|---|---|---|
| `normalizeWorkPackage` | 258 | **YA** — tambah `parentId`+`parentName` dari `_links.parent` |
| GET `/work-packages` | 815 | sudah bisa semua WP (tanpa versionIds). Verifikasi `fetchAllOpenProjectWorkPackages` ambil semua. |
| GET `/work-package/:id` | 881 | ok |
| PATCH `/work-package/:id` | 893 | opsional: terima `parentId` untuk re-parent |
| POST `/work-package` | 942 | **YA** — terima `parentId` → `_links.parent` |
| available-assignees | 981 | ok |

## Fase implementasi

### Fase 1 — Server: hierarki + create-with-parent
1. `normalizeWorkPackage` (server.js:258): tambah `parentId` (dari `pickHref(wp,"parent")`) + `parentName`.
2. POST `/work-package` (server.js:942): terima `req.body.parentId` → `_links.parent = {href:/api/v3/work_packages/<id>}`.
3. (opsional) PATCH terima `parentId` untuk re-parent.
4. Verifikasi GET all WP project 7 (tanpa versionIds) mengembalikan semua termasuk backlog + closed.
   Cek quirk closed-status (perlu `status_id` filter? — lihat openproject-mcp skill).
   **Test nyata vs OP project 7**, bukan asumsi.

### Fase 2 — Cache OP di IndexedDB (sumber baru `op_cache_v1`)
5. Tambah helper fetch-all WP project 7 → simpan `op_cache_v1` + `op_cache_ts` di IndexedDB
   (pakai `saveRoadmapIDB`/`loadRoadmapIDB` yang sudah ada, key baru).
6. Boot `RoadmapPage`: load `op_cache_v1` dari IDB dulu (instant), lalu refresh async dari server.
7. Tombol Refresh: re-GET semua WP → update cache + timestamp. Tampilkan "last synced".
8. Bentuk tree parent-child dari `parentId` → Milestone (type 2) sebagai node, Feature (type 3) sebagai child.

### Fase 3 — All/Month View = filter murni di atas cache
9. Ganti sumber: All View & Month View baca dari `op_cache_v1`, BUKAN `mvOp.rows` per-version
   & BUKAN `rawTasks`/`roadmap_v1`.
10. Month View: filter by version/bulan di atas cache. All View: filter global.
11. **Kolom & field existing dipertahankan** (`task/area/prio/status/E/I/T/assignees/schedule`).
    Hilangkan path fetch per-version lama (`mvOp` fetch di :336) setelah cache jadi sumber.

### Fase 4 — Intake: 1 Request → 1 Milestone (+ dokumen pendukung lokal)
12. Form New Milestone: judul, desc, area, prio, + **dokumen pendukung (lokal, analisa awal)**.
13. Simpan draft lokal (type=MILESTONE/2) di IDB key staging baru (mis. `roadmap_drafts_v1`).
14. Tombol **Push ke OP** → POST create typeId=2 → simpan `opId` di draft → refresh cache.
    Setelah pushed, milestone tampil dari `op_cache_v1`; draft ditandai pushed.

### Fase 5 — Breakdown Feature (menyusul push)
15. Dari milestone (sudah punya `opId`) → tambah N Feature (type=3) sebagai draft child.
16. Push Feature: POST create typeId=3 + `parentId = milestone.opId` → refresh cache.
17. State per item: `draft / pushed`. **Milestone wajib pushed dulu** (punya opId) sebelum
    feature bisa nempel. UI block push feature kalau parent belum punya opId.

### Fase 6 — Pembersihan `roadmap_v1`
18. Setelah v2 (OP source) terverifikasi jalan: lepas ketergantungan `rawTasks`/`roadmap_v1`
    di `ui-roadmap.js` (519-567), hapus seed-file mirror path yang tak relevan.
19. Hapus `roadmap_v1`-related keys di `RM_SERVER_KEYS` (testcase-browser.html:1811) yang
    sudah tidak dipakai. Jangan hapus yang masih dipakai (quarters/q_link/op_edits kalau masih relevan).

## Verifikasi per fase
- JSX edit (`ui-roadmap.js`): Babel-compile block / module sesuai skill (jangan asal, blank page silent).
- Server: test endpoint nyata vs OP project 7 (curl / fetch), tampilkan response count real.
- Cache: smoke test render count di browser (jumlah milestone, feature child, filter All vs Month).
- Hard-refresh (Ctrl+Shift+R) wajib disebut ke user (express.static no-cache).

## Keputusan final (OQ terjawab)
- **OQ1 — Dokumen pendukung:** tetap LOKAL. Yang masuk ke OP saat push HANYA description.
- **OQ2 — Eksekusi:** stop & review per fase.
- **OQ3 — Alur submit milestone:** form → create OP → refetch cache.

## REVISI MODEL HIERARKI (temuan Fase 5, 2026-10-13)
OpenProject project 7 **menolak Milestone sebagai parent** (`"Parent cannot be a milestone."`).
Milestone di OP = penanda tanggal, tidak bisa punya child. Model direvisi:
- **Task utama / "Milestone" di roadmap → dibuat sebagai EPIC (type 5) di OP.** Label roadmap tetap "Milestone", backing OP = Epic.
- **Breakdown → FEATURE (type 4), parentId = epic.** (Epic & Feature BISA punya child — terverifikasi.)
- **Type ID dinamis** via `opTypeId(name)` dari OP meta (`opMeta.types`), bukan hardcode. Project 7: Task=1, Milestone=2, Summary task=3, Feature=4, Epic=5, User story=6, Bug=7, Recruitment=8, IT Support=9.
- **Bug diperbaiki:** `OP_TYPES` lama hardcode salah (Feature=3 → harusnya 4). Sudah dikoreksi + dibikin dinamis.
- Status "milestone" di roadmap tidak dipakai/ditampilkan.
- **Verifikasi end-to-end NYATA (2026-10-13):** Epic 4428 + Feature child 4429 (parentId sticky). ✅

## WP UJI DI OP — SUDAH DIHAPUS (via endpoint DELETE, 2026-10-13) ✅
- 4426, 4427, 4428 dihapus langsung. 4429 ikut terhapus (cascade saat Epic 4428 dihapus).
- Endpoint `DELETE /api/dashboard/openproject/work-package/:id` ditambahkan (server.js).
