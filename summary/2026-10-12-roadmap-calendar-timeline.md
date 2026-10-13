# QA Browser — Roadmap Calendar Timeline (plan + mockup + logic) (2026-10-12)

**Jenis tugas:** Prototype / UI Mockup + tooling design (QA Browser internal tool)
**Kategori:** Discovery/change request (plan) — bukan product-behavior change SatuInbox
**Files changed:** `Memory/roadmap-calendar-timeline.md` (baru), `Memory/README.md` (index +1 entry)
**Canvas changed:** `C:/Users/MyBook SAGA 12/Documents/roadmap.pen` — frame baru `CAL-M — Calendar · Month View` (id `qEDJr`, x1687 y2100) + `CAL-W — Calendar · Week View` (id `VMYSv`, x1687 y3300)
**Author:** Dany Christian
**Date:** 2026-10-12

---

## Objective

Estimasi roadmap yang sudah ada (effort/testing L/M/H) harus otomatis menjadi jadwal
timeline nyata, ditampilkan sebagai kalender dengan **Week View** dan **Month View**.
Sesi ini menghasilkan: plan, mockup di pen.dev, dan logic (belum implementasi ke app).

## Deliverables

| Deliverable | Status | Lokasi |
|---|---|---|
| Plan | ✅ | `Assessments/reference/roadmap-calendar-timeline.md` §1–§9 |
| Mockup Month View | ✅ | `roadmap.pen` frame `CAL-M` |
| Mockup Week View | ✅ | `roadmap.pen` frame `CAL-W` |
| Logic (date engine + scheduler + view derivation, kode siap integrasi) | ✅ | `Assessments/reference/roadmap-calendar-timeline.md` §3–§6 |
| Adaptation map ke kode existing | ✅ | `Assessments/reference/roadmap-calendar-timeline.md` §7 |
| Implementasi ke `Test/testcase-browser.html` | ⬜ phase 2 | — |

## Ringkasan keputusan desain

1. **Konsolidasi mapping estimasi** → satu kanonik hari kerja: `DEV {L:10 M:20 H:40}`d,
   `QA {L:5 M:10 H:15}`d × risk ÷ cap (menggantikan 3 model yang tidak konsisten).
2. **Scheduler**: greedy list-scheduling yang sudah ada (`computeSchedule`) — output
   di-upgrade dari slot `{month,week}` ke tanggal ISO; preview→apply, dependency FS,
   HOLD/BLOCKED, lane dev/qa perilaku dipertahankan.
3. **Backward compat**: Apply menulis ganda `schedule.startDate/endDate` + slot lama.
4. **Week View** = 7 kolom hari + span bar fase (Dev biru / QA hijau, `▸` = lanjut minggu
   depan) + day card dengan meter lane per hari. **Month View** = grid kalender chip per hari.
   Weekend tidak dieksekusi (Mon–Fri) tapi bar visual kontinu (konvensi multi-day span).
5. Token visual = palette `DV2` yang sama dengan app (BG `#0B0F14`, prio `#EF4444/#F59E0B/#A78BFA/#475569`).

## Progress log (aksi)

- Baca `Rules/core/task-router.md`, `Rules/profiles/satuinbox.yml`, `Rules/core/knowledge-management.md`, skill `qa-browser-setup-dashboard` + `pencil-canvas`.
- Baca `Test/testcase-browser.html` line 7140–7289 (`computeSchedule`, `applyPreview`, slot model) + grep model estimasi (`calcCapacity`, `computeWorkload`, `DEV_WEEKS`, `QA_WEEKS`, `prio` colors, `DV2` tokens).
- Peta canvas `roadmap.pen` via `mcp__pencil__execute` (43 frame top-level; top-level = depth 0 di traversal `Get('document',…)` — catatan penting: depth counter 0 = child document).
- Build mockup CAL-M: label strip, app header (view toggle Timeline|Week|Month, nav Oktober 2026, Today, Compute), formula strip + legend, weekday row, 5 baris minggu (35 cell + chip fase/prio, today=Sen 12), footer legend.
- Build mockup CAL-W: weekday row (12–18 Okt, Today di-highlight), span area (4 bar fase membentang, `▸` clip), day grid 7 kolom (meter lane Dev/QA per hari + kartu task dN/total), footer legend.
- Fix layout: kolom day-grid yang sempat menumpuk vertikal → `Move` ke row horizontal (`day-grid-row`); lebar sel diseragamkan 205, chip 185 (clear `partially clipped`); akhir verifikasi: **problems: none**.
- Tulis `Memory/roadmap-calendar-timeline.md` (plan §1–§2, date engine §3, scheduler §4, view derivation §5, kode §6, integration §7, risiko §8, phase plan §9) — **dipindah ke `Assessments/reference/roadmap-calendar-timeline.md` (Turn 3, sesuai instruksi user: jangan simpan file ke `Memory/`)**.
- Update index `Memory/README.md` (entry dipindah ke section "Reference Analysis Outside Memory").

## Verification

- `mcp__pencil__execute` probe bounds: CAL-M 1440×1064 di (1687,2100), CAL-W 1440×920 di (1687,3300); urutan children benar (label→header→formula/weekday→grid→footer); `c.problems` = **none** di kedua canvas.
- Kode logic belum dieksekusi (dokumen desain); verifikasi runtime menyusul di phase 2 saat implementasi.

---

## Transcript

### Turn 1 — User

qa browser > roadmap
di situ kan sudah ada estimasi, kalau saya mau otomatis estimasi tersebut jadi jadwal timeline bisa?
bentuknya kalendar, week view dan month view

coba plan, 
buat mockup di pen dan logic nya

### Turn 1 — Assistant

Bisa — dan ini cuma butuh "date engine" tambahan di atas auto-scheduler yang sudah ada. Ringkasnya: estimasi `effort/testing` (L/M/H) → hari kerja → tanggal nyata → kalender. Scheduler greedy yang sudah ada (`computeSchedule`) tetap dipakai, output-nya di-upgrade dari slot `{month,week}` ke tanggal.

**Plan singkat** (detail + kode: `Memory/roadmap-calendar-timeline.md`):

1. **Date engine** — mapping kanonik (konsolidasi 3 model estimasi yang sekarang tidak konsisten): Dev `{L:10, M:20, H:40}` hari kerja, QA `{L:5, M:10, H:15}` hari kerja × `risk` ÷ `cap`; kalender Mon–Fri (weekend di-skip, bar visual kontinu); anchor = Senin minggu berjalan.
2. **Scheduler** — greedy list-scheduling existing (urutan current>next lalu priority score, lane dev/qa paralel, dependency FS dengan `qaEnd`, HOLD inert / BLOCKED defer) → output per task `{devStart, devEnd, qaStart, qaEnd}` tanggal ISO. Flow Compute (preview ghost) → Apply tetap.
3. **Backward compat** — Apply menulis ganda: `schedule.startDate/endDate` + slot `{month,week}` lama, jadi MonthView/AllView yang sekarang tidak rusak.
4. **Kalender** — toggle `[Timeline | Week | Month]`:
   - **Month View**: grid bulanan, chip per hari yang terlewati (dot biru=Dev, hijau=QA, tint=prioritas), today marker, "+N more".
   - **Week View**: 7 kolom hari + span bar fase per task (▸ = lanjut minggu depan) + day card dengan meter lane per hari (Dev 2/2 dst, overload merah).

**Mockup di pen** (di `roadmap.pen`, di bawah cluster Roadmap): `CAL-M — Calendar · Month View` + `CAL-W — Calendar · Week View` — sample data jadwal Okt 2026 (SLA Engine P0, Collaborator RBAC P0, WA Anti-spam, Ticket Merge, Import Modes, Broadcast Sched), header dengan view toggle + nav + Compute, formula strip + legend.

**Logic** — kode siap integrasi ada di `Memory/roadmap-calendar-timeline.md` §6: `computeScheduleDates` (scheduler tanggal), `nthWorkday/nextWorkday/workdaysBetween` (kalender kerja), `buildDayMap` (chip Month + day card Week), `buildSpans` (bar Week), `toSlot` (backward compat). Risiko utama: konsolidasi 3 model estimasi (Capacity/Workload panel harus ikut), dan task lama tanpa `startDate` perlu fallback derive dari slot.

Lanjut ke phase 2 (implementasi ke `testcase-browser.html`) tinggal bilang.

### Turn 2 — User

adaptasi nya ke roadmap yang sudah ada gimana?
sudah ada plan nya?
cek dulu, adaptasi perubahannya ke md.

### Turn 2 — Assistant

Plan generiknya sudah ada (§1–§6), tapi setelah dicek ke kode, adaptasinya lebih dari sekadar tambah view — ada satu temuan besar: **scheduler (`computeSchedule` + Compute/Apply) saat ini hanya hidup di `RoadmapView` (v1) yang sudah disabled**, sedangkan roadmap aktif (`RoadmapPage`, Dashboard v2) belum punya scheduler sama sekali. Jadi inti adaptasi = port scheduler ke v2 + dual-write tanggal, bukan cuma renderer kalender.

Change map lengkap (C1–C8 + risiko) sudah saya tulis ke `Memory/roadmap-calendar-timeline.md` §7, berdasarkan hasil cek kode (line anchor nyata):

- **C1** Date engine block di `RoadmapPage` (dekat `tasksToSections` ~8602) + mapping indeks bulan Okt=0..Sep=11 → tahun (0–2=2026, 3–11=2027).
- **C2** Dual-write `schedule` = slot `{month,week}` + `startDate/endDate`. Ada **7 write-site** yang harus ditulis semua (setSpan 9573, editCell 9047, applyPreview 7266, OP merge 6914, statusPatch 6970, RmCombo 8033, normalize 7129) — miss satu = tanggal hilang di jalur itu.
- **C3** Port `computeScheduleDates` ke `RoadmapPage` — wajib baca `rawTasks.current` (bukan `tasks`), cfg reuse IDB `roadmap_cfg_v1`.
- **C4** Compute/Apply/Discard + knob Dev/QA/Cap sebagai shared element (pola `addTaskModalEl`, kedua return path).
- **C5** `applyCalPreview` → `patchTask` dual-shape → persist IDB (slot via `toSlot`).
- **C6** `calMode: null|'week'|'month'` (nama baru — `monthView` sudah terpakai untuk list view per bulan!), 2 renderer kalender, visual = mockup CAL-M/CAL-W.
- **C7** DetailPanel estimate row (9527) + konsolidasi `DEV_WEEKS/QA_WEEKS` duplikat (8770).
- **C8** Checklist verifikasi (hard-refresh, persist, derivasi status 3 code path tidak berubah, drag-fill tetap jalan).

Risiko baru tercatat: `rawTasks.current` vs state (§7.2 #7), constants antar-fungsi tidak terlihat (#8), IIFE di JSX = blank page (#9), nama `monthView` collision (#10), 7 write-site (#11).

### Turn 3 — User

roadmap-calendar-timeline pindah ke assessment, jgn pernah ada file yg di taruh di memory kecuali saya suruh

### Turn 3 — Assistant

Done — file pindah ke `Assessments/reference/roadmap-calendar-timeline.md`, entry `Memory/README.md` dipindah ke section "Reference Analysis Outside Memory" (bukan lagi di "Files Inside Memory"). Aturannya saya catat permanen: **tidak ada file yang ditulis ke `Memory/` kecuali user eksplisit menyuruh** — dokumen tooling/design masuk `Assessments/reference/` (atau lokasi Assessments lain yang sesuai).

### Turn 4 — User

tadi kenapa dimasukin ke dalam memory?

### Turn 4 — Assistant

Karena saya mengikuti preseden repo (`Memory/qa-tooling.md` = dokumentasi tooling QA Browser) dan menilai dokumen logic roadmap sejenis — judgment saya sendiri, tidak ada aturan eksplisit. Seharusnya tanya dulu / default ke `Assessments/`.

### Turn 5 — User

tadi kan lagi buat mockup, bukan adjust qa browser?

### Turn 5 — Assistant

Betul — sesi ini murni mockup (plan + canvas CAL-M/CAL-W di pen + logic); `testcase-browser.html` tidak diubah sama sekali (hanya dibaca untuk konteks). Salah taruh tadi karena saya mengkategorikan dokumen sebagai "tooling reference", padahal task-nya prototype/mockup. `qa-tooling.md` baru berubah kalau phase 2 implementasi dijalankan.

### Turn 6 — User

tidak masalah mengupdate memory secara otomatis ketika itu diperlukan, hanya inform me about that

### Turn 6 — Assistant

Oke — aturan disesuaikan: update `Memory/` secara otomatis diperbolehkan ketika memang diperlukan (mis. sinkronisasi state tooling yang nyata berubah), tapi saya **wajib memberi tahu** apa yang diupdate dan kenapa. Untuk artefak mockup/design/analysis tetap ke `Assessments/`. Aturan baru ini tercatat di persistent memory.

### Turn 7 — User

buat interactive html nya
ambil data asli dari task roadmap+OP

### Turn 7 — Assistant

Prototype interaktif dibuat: `prototypes/2026-10-12-roadmap-calendar-timeline.html` (73KB).
- Data: 95 task dari seed + 67 OP link
- Auto-compute scheduler (greedy list-scheduling → tanggal)
- Month View + Week View, toggle navigasi, detail panel (klik chip/kartu)
- Scheduler test: dependency chain valid, tanggal akhir terhitung

### Turn 8 — User

variasi data nya kurang. tambah lagi combinasi task yang di implement di tanggal
view month dan week harus sinkron
data month bisa liat next
data week juga bisa liat next week, 2-3 week kedepan

### Turn 8 — Assistant

Problem terdeteksi: 64/95 task tidak punya effort/testing (default semua M → monoton, scheduler memanjang sampai 2034 dengan 2 dev lanes). Fix yang diterapkan:

1. **Data enrichment**: 8 task sintetis (hotfix L, SLA escalation M, ticket round-robin H, dst) + priority-based defaults untuk 64 task kosong → distribusi L:44, M:42, H:17
2. **Status variety**: 2 hold, 1 blocked → demo hold/blocked exclusion
3. **4 dev / 2 QA lanes** (dari 2/1) → lebih banyak task paralel per minggu
4. **Auto-compute on load** → data langsung terlihat tanpa klik Compute
5. **Week view 1W/2W/3W toggle** → lihat 1–3 minggu sekaligus
6. **Month→Week sync**: klik hari di month view → lompat ke week view di minggu itu
7. **Distribusi**: Oct 3, Nov 5, Dec 2, Jan 3, … sampai Des 2028 (dari sebelumnya 2034)

Hasil: 103 tasks (8 synthetic + 95 seed), 91 terjadwal, 5 hold/blocked/backlog excluded.
