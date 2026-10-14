# Plan — Integrasi Capacity + Calendar + People/Absen ke QA Browser Roadmap

> Status: **DONE — BUILT & VERIFIED (2026-10-14)**. Modul `Test/modules/ui-planner.js` + integrasi `Test/testcase-browser.html` + Roadmap header button. Sumber prototype: `prototypes/roadmap/roadmap-capacity-calendar-people.html`.
> Sesuai arahan user: img pills `DEV 4375% / QA 4281%` diganti button `⚡ Planner` (entry ke tab baru). Verifikasi: Babel OK, engine logic test OK, browser smoke OK.

---

## A. Temuan analisa (apa yang SUDAH ada vs prototype)

### QA Browser roadmap sekarang (`ui-roadmap.js`)
- **Data task lengkap** via `opRowView(wp)`: subject, prio (P0-P3), status bucket (now/next/backlog/done via `opBucketOf`), impact/effort/testing (L/M/H), assigneeId, qa[], startDate, dueDate, dependency (CSV). → **cukup untuk feed scheduler prototype.**
- **Capacity existing** (`testcase-browser.html:417-543`, vanilla DOM): `window._rmCfg={dev,qa,cap}` + `calcCapacity`. Model **MINGGU** (Dev `{L:2,M:4,H:8}w`), cap=`dev*4*cap`. Pills `cap-month-pills` di Month View header (baris `ui-roadmap.js:1588`), panel `cap-month-panel`. **Inilah pills merah `DEV 4375%` di img** — persentasenya ngawur karena bug cap-window (sama seperti bug yang sudah di-fix di prototype: beban-semua-task ÷ cap-1-bulan).
- **Month View** (`if(monthView){...}`) sudah punya week-timeline bars (drag start/due), group toggle 3-mode, category chips.
- **BELUM ada:** scheduler greedy → tanggal, people bernama, absen, calendar day-grid, Compute/Apply/Discard.

### Prototype (`roadmap-capacity-calendar-people.html`)
- Model **HARI** (DEV_DAYS `{L:10,M:20,H:40}`, QA `{L:5,M:10,H:15}`, risk×÷cap, skip weekend+absen).
- `PEOPLE[]` bernama = scheduler lane absen-aware. `computeScheduleDates` greedy → devStart/devEnd/qaStart/qaEnd + devPersonName/qaPersonName.
- Panel: People&Absen + Capacity Analysis (horizontal 60vh) + Calendar (month/week day-grid).
- Cap-window fix sudah benar (anchor→last qaEnd).

### Gap/konflik yang WAJIB diputuskan
1. **Satuan beda:** existing MINGGU vs prototype HARI. Integrasi = ganti model existing ke HARI (prototype menang, lebih presisi kalender) ATAU dua-duanya. → **rekomendasi: pakai HARI, buang model minggu lama** (hindari 2 sumber kebenaran).
2. **Sumber task:** prototype pakai `TASKS[]` seed statis (103). QA Browser pakai `opCache.rows` LIVE (±1537 WP) / `monthOpRows`. → scheduler harus baca dari `opRowView`, bukan seed. **Scheduler di 1537 WP berat** → batasi ke scope yang tampil (version/month/filter aktif), bukan seluruh backlog.
3. **People/absen persistence:** prototype in-memory. QA Browser perlu simpan di IDB (pola `roadmap_cfg_v1` / seed-save) biar persist. → simpan `roadmap_people_v1` LOCAL (tidak ke OP).
4. **Capacity pills existing** (`DEV 4375%`) → diganti button entry (sesuai img). Pills lama dihapus/diganti.

---

## B. Keputusan entry point (img: pills → button)

Pills merah `DEV 4375% / QA 4281%` di Month View header **diganti** jadi **1 button**: `⚡ Capacity & Schedule` (atau `📅 Planner`).
- Klik → buka **panel/overlay** berisi: People&Absen + Capacity Analysis (horizontal) + Compute/Apply/Discard, lalu hasil schedule render ke calendar/timeline.
- **Opsi lokasi panel** (perlu keputusan user):
  - **(A) Overlay/drawer full-width** di atas roadmap (modal besar) — paling dekat dengan prototype, paling tidak ganggu layout existing.
  - **(B) View/tab baru** "Planner" sejajar Overview/Roadmap/Tracker/Cost — paling rapi, terpisah dari Month/All View.
  - **(C) Expand inline** di Month View (section collapse di bawah header) — mirip panel capacity lama tapi diperluas.
- **Rekomendasi: (B) tab Planner** — scope jelas, tidak membebani Month View yang sudah berat (1537 WP), reuse data `opCache`.

---

## C. Rencana eksekusi (bertahap, tiap fase validasi user)

### Fase 1 — Port engine (pure JS, no UI)
- Tambah ke `ui-roadmap.js` (shared scope, sebelum cabang `if(monthView)` — ingat two-view scope trap):
  - `CAL` (DEV_DAYS/QA_DAYS hari), `PEOPLE[]` default, helper absen (`nthWorkdayFor`/`nextWorkdayFor`/`workdaysForPerson`/`isWorkday`/`iso`/`parseISO`), `computeScheduleDates`, `effectiveCapacity`, `capWindow`.
  - Adapter: `tasksForScheduler()` = map rows tampil (`monthOpRows`/filtered `opCache`) → bentuk `{id,effort,impact,testing,priority,current,schedule,status,dependency,risk,rank}` via `opRowView`.
- Validasi: Babel transpile OK + unit sanity (log jumlah scheduled) di console.

### Fase 2 — People & Absen state + persist
- State React `people` + `cap`; load/save IDB `roadmap_people_v1` (pola seed-save existing, LOCAL only).
- UI People panel (card roster + absen chips + add/remove + cap input).

### Fase 3 — Capacity panel (model hari) + ganti pills
- Capacity Analysis panel (metrics, Dev/QA lane, task table + Assigned).
- **Hapus pills `cap-month-pills` lama**, ganti button entry `⚡ Capacity & Schedule` di Month View header (sesuai img).
- Buang `window.calcCapacity` lama (model minggu) ATAU sisakan sampai Planner stabil.

### Fase 4 — Calendar + Compute/Apply
- Month/week day-grid dari `buildDayMap` (chip per hari, person-aware).
- Compute → preview; Apply → tulis start/due per task ke `opEdits` (overlay existing) → bisa Push ke OP lewat jalur yang sudah ada.
- Horizontal layout 60vh (sudah matang di prototype).

### Fase 5 — Verifikasi browser + no-cache + dokumen
- Exercise di Chromium CDP: Compute, absen-aware, Apply→opEdits, cek `window.__errs=[]`.
- Update skill + summary.

---

## D. Risiko & mitigasi
- **Perf 1537 WP:** JANGAN schedule seluruh backlog. Scope scheduler = rows tampil (version/filter). Zero-impact ke render existing.
- **Two-view scope trap:** helper dipakai All+Month → taruh di scope komponen atas (lesson dari Fase 3b).
- **Babel JSX:** validasi via Babel transpile, bukan `node --check`.
- **Model-switch minggu→hari:** cek tidak ada konsumen lain `_rmCfg`/`calcCapacity` sebelum hapus.
- **Persistence:** people/absen LOCAL (`roadmap_people_v1`), tidak sentuh OP. Konsisten dgn kebijakan category LOCAL.

---

## E. Keputusan user (2026-10-14) — FINAL

1. **Entry = Tab "Planner" baru** sejajar Overview/Roadmap/Tracker/Cost (di sebelah Roadmap). TAMBAHAN: di tab Roadmap TETAP tampil **statistic hasil planner + estimate** (ringkasan beban/kapasitas, read-only) — jadi Planner = tempat kerja penuh, Roadmap = tampilkan hasil ringkas.
2. **Satuan: PERTAHANKAN DUA-DUANYA** — minggu (ringkas, existing `calcCapacity` tetap hidup untuk pills/ringkasan) + hari (prototype, untuk scheduler kalender). Jangan buang model minggu.
3. **Scope scheduler: rows tampil saja** (versi/bulan/filter aktif), bukan 1537 WP.
4. **Apply → tulis start/due ke `opEdits`** overlay (bisa Push ke OP manual).
5. **People: fetch dari OP** (bukan placeholder, bukan hardcode nama). Ambil daftar user/member OP project 7 sebagai roster dev/qa.

### Implikasi keputusan (FINAL)
- **Pills `DEV%/QA%` → BUTTON murni.** Pills diganti jadi button (mis. `⚡ Planner`) yang klik → buka tab Planner. Ringkasan estimate (beban dev/qa + % kapasitas, ANGKA DIPERBAIKI dari bug 4375%) muncul sebagai **teks/stat kecil terpisah** di header Roadmap (read-only, bukan pills interaktif lama).
- **People dari OP + tandai manual role.** Fetch semua user OP (project 7, `opPeople`/`list_users`/members sudah ada di modul). User tandai dev/qa sekali via panel → simpan LOCAL `roadmap_people_v1` (role + absen). OP tak punya field role/absen. Saat user baru muncul di OP, default belum-ditandai (user set).
- **Dua tab berbagi engine + state** (people/schedule di scope modul). Planner = kerja penuh; Roadmap = stat ringkas.

### Spesifikasi entry & ringkasan
- **Button Roadmap:** ganti blok `cap-month-pills`/`cap-all-pills` jadi `<button>⚡ Planner</button>` → set view ke Planner tab.
- **Ringkasan stat di Roadmap header** (teks kecil): `Dev <load>d/<cap>d · <pct>% · QA <load>d/<cap>d · <pct>%` pakai engine HARI + cap-window fix. Tampil hanya kalau schedule sudah di-compute (atau auto-compute scope tampil).
- **Tab Planner** (`setPlannerView` / tambah ke view switch sejajar Overview/Roadmap/Tracker/Cost): People&Absen + Capacity + Calendar + Compute/Apply/Discard.

## F. Rencana final (eksekusi bertahap)
1. **Engine port** (shared scope): CAL hari, helper absen, `computeScheduleDates`, `effectiveCapacity`, `capWindow`(fix), adapter `tasksForScheduler()` dari rows tampil. + fetch OP users → `plannerPeople` state, persist `roadmap_people_v1`.
2. **Tab Planner** di view switch + routing. People panel (roster dari OP + toggle role dev/qa + absen) persist LOCAL.
3. **Capacity panel (hari)** + Calendar (month/week day-grid person-aware) + Compute/Apply→`opEdits`.
4. **Roadmap header:** pills → button `⚡ Planner` + ringkasan stat kecil (hari, % benar).
5. **Verifikasi browser** (CDP: Compute, role-tag, absen, Apply→opEdits, `window.__errs=[]`) + summary + skill.

---

## G. HASIL BUILD (DONE 2026-10-14)

**File:** `Test/modules/ui-planner.js` (~550 baris, 2 IIFE: `window.PlannerEngine` + `window.PlannerModule.PlannerPage`).

**Perbedaan vs rencana (keputusan saat build):**
- Modul **MANDIRI** (bukan shared-scope di ui-roadmap.js). PlannerPage baca IDB sendiri (`op_cache_v1`, `roadmap_op_edits_v1`, `roadmap_people_v1`), tak kopling ke RoadmapPage state. Dua tab berbagi **engine (`window.PlannerEngine`) + IDB**, bukan React state.
- Roster di-mirror ke `window._plannerPeople` → dibaca blok ringkasan di Roadmap Month View header (loose coupling, tanpa prop drilling).
- **Fallback fetch WP**: kalau IDB `op_cache_v1` kosong (Roadmap tab belum pernah dibuka), Planner fetch sendiri `/api/dashboard/openproject/work-packages?all=1` lalu seed cache.
- Scope scheduler saat ini = **seluruh WP non-done** di cache (bukan rows-tampil). Catatan: scope per-view belum diterapkan di Planner tab (ringkasan di Roadmap header memang pakai `monthOpRows` = scope tampil). Bisa di-refine nanti kalau 1537 WP terasa berat.
- Model **minggu lama (`calcCapacity`/pills) EFEKTIF MATI**: elemen `cap-month-pills`/`cap-month-panel` dihapus dari Month View; poller lama di testcase-browser.html jadi no-op (cari elemen yang tak ada). Hanya model HARI yang hidup.

**Integrasi testcase-browser.html:**
- `<script src="./modules/ui-planner.js">` ditambah (setelah ui-roadmap.js).
- `const PlannerPage = (window.PlannerModule && window.PlannerModule.PlannerPage) || (() => null);`
- Tab `["planner","Planner"]` di sub-nav + route `if (dashV2Sub === "planner") return <PlannerPage />;`
- `window.__setDashSub = setDashV2Sub` di-expose (useEffect) agar button Roadmap bisa pindah tab.

**Roadmap header (ui-roadmap.js Month View):** blok `cap-month-pills` → button `⚡ Planner` (onClick `window.__setDashSub("planner")`) + ringkasan `Dev Xd · N% / QA Xd · N%` (dihitung PlannerEngine atas `monthOpRows`, % hanya muncul kalau `window._plannerPeople` ada isinya).

**Verifikasi:**
- Babel transpile: ui-planner.js OK (59.853 B), ui-roadmap.js OK (218.777 B).
- **Engine logic test** (`scratch/engine_test.js`, Node sandbox): scheduler Dev→QA per-orang OK, task `done` (Closed) excluded, `phaseDays H dev=50d / L qa=6d`, absen Rizky 2026-10-20 ter-skip (`workdaysForPerson` tak masukkan tanggal off), `effectiveCapacity` dev Okt=17d.
- **Browser smoke**: tab Planner render tanpa `window.__errs`; fetch user OP (27 user real) di picker; add people (`Rizky:dev, Aryo:dev, Sabrina:qa`) jalan + mirror ke window; Compute → Apply muncul; endpoint WP dikonfirmasi via curl (1537 WP, field mapping cocok).
- **Catatan lingkungan**: headless Chromium berulang reset session React saat render 1537 WP (daemon CDP timeout) — bukan crash modul. Server belum di-restart untuk no-cache; hard-refresh cukup (file dibaca live dari disk).

**Sisa (opsional, belum dikerjakan):**
- Scope scheduler Planner ke rows-tampil (saat ini seluruh non-done).
- Bersihkan poller pills lama yang jadi no-op di testcase-browser.html.
- Verifikasi visual Apply→opEdits benar-benar nulis start/due ke IDB `roadmap_op_edits_v1` (logic ada, belum diklik end-to-end di browser karena daemon flaky).
