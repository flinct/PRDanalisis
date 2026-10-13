# Roadmap Calendar Timeline — Plan & Scheduling Logic

> Tooling design reference untuk QA Browser > Roadmap (`Test/testcase-browser.html`).
> Mockup visual: `roadmap.pen` → frame `CAL-M — Calendar · Month View` + `CAL-W — Calendar · Week View`
> (dibangun 2026-10-12, di canvas `C:/Users/MyBook SAGA 12/Documents/roadmap.pen`, posisi x1687 y2100 / y3300).
> Author: Dany Christian · Status: **PLAN + LOGIC + ADAPTATION MAP siap implementasi (belum di-merge ke app)**
> §7 = change map adaptasi ke kode existing — hasil cek nyata `testcase-browser.html`, 2026-10-12 (v2).

---

## 1. Problem

Roadmap sudah punya estimasi per task (`effort` L/M/H untuk dev, `testing` L/M/H untuk QA)
dan Auto-Scheduler (`computeSchedule`, greedy list-scheduling) — tapi output jadwal masih
**slot kasar `{ month, week }`** (4 slot per bulan). User ingin estimasi otomatis menjadi
**jadwal tanggal nyata** yang tampil sebagai **kalender: Week View + Month View**.

## 2. Scope sesi ini

| Deliverable | Status | Lokasi |
|---|---|---|
| Plan | ✅ | dokumen ini §1–§8 |
| Mockup pen (Month + Week view) | ✅ | `roadmap.pen` frame `CAL-M` / `CAL-W` |
| Logic (date engine + scheduler + view derivation) | ✅ | dokumen ini §3–§5 (kode siap pakai) |
| Implementasi ke `testcase-browser.html` | ⬜ phase 2 | — |

---

## 3. Date engine (estimasi → durasi → tanggal)

### 3.1 Mapping kanonik (SATU sumber — konsolidasi 3 model lama)

Model lama tidak konsisten (Capacity `DEV={L:2,M:4,H:8}` hari, Auto-Scheduler
`DEV_WEEKS={L:2,M:4,H:8}` minggu, Workload `WL_PW={L:1,M:2,H:3}` person-week).
Kanonik baru (hari kerja):

| Level | Dev | QA |
|---|---|---|
| L | 10 hari kerja (2 minggu) | 5 hari kerja (1 minggu) |
| M | 20 hari kerja (4 minggu) | 10 hari kerja (2 minggu) |
| H | 40 hari kerja (8 minggu) | 15 hari kerja (3 minggu) |

```
durasi = max(1, round(baseDays × risk ÷ cap))
```

- `risk` = `t.risk || 1` (pengali yang sudah ada di model).
- `cap` = `cfg.cap > 0 ? cfg.cap : 0.8` — semakin kecil kapasitas, semakin panjang durasi
  (semantics sama dengan `computeSchedule` lama: `DEV_WEEKS × risk / cap`).
- `pm_front_weeks` → offset hari kerja sebelum dev start.

### 3.2 Kalender kerja

- Hari kerja: **Mon–Fri**. Weekend di-skip, tapi bar visual boleh **kontinu** melewati weekend
  (konvensi Google Calendar multi-day span).
- `holidays`: Set ISO date (opsional, config; default kosong).
- `anchor`: **Senin minggu berjalan** (default), bisa dioverride per roadmap.

### 3.3 Fase per task

```
devStart → devEnd → qaStart (= hari kerja pertama setelah devEnd) → qaEnd
task.start = devStart · task.end = qaEnd
```

## 4. Scheduler (greedy list-scheduling → tanggal)

Algoritma identik dengan `computeSchedule` yang sudah ada dan tervalidasi — hanya output-nya
di-upgrade dari slot ke tanggal:

1. **Eligible**: bukan `hold`/`blocked`, dan section ≠ backlog (backlog tetap tidak dijadwalkan).
2. **Urutan**: section tier (current > next) → `prioScore` (priority×1000 + impact×100 +
   effort-inv×10 + testing) → `rank`.
3. **Lane**: `cfg.dev` lane dev paralel, `cfg.qa` lane QA paralel; tiap task mengambil lane
   ter-free paling awal.
4. **Dependency (FS)**: `devStart ≥ max(qaEnd semua dep)`; dep `hold` = inert, dep `blocked`
   = downstream ditahan (masuk `deferred`).
5. **Chain**: `qaStart ≥ devEnd task sendiri` (hari kerja berikutnya) dan `≥ qaFree[qaLane]`.
6. Output per task: `{ devStart, devEnd, qaStart, qaEnd, start, end }` (ISO `YYYY-MM-DD`),
   plus `deferred` list (dep cycle / blocked-downstream) → di-UI tetap visible sebagai unscheduled.
7. **Preview → Apply** dipertahankan: Compute menghasilkan ghost preview, Apply commit
   `schedule` + persist IDB.

**Backward compat**: `applyPreview` versi baru menulis DUA bentuk sekaligus:

```js
schedule: {
  start: { month: MONTH_NAMES[d.getUTCMonth()], week: min(4, ceil(d.getUTCDate()/7)) },
  end:   { ... },
  startDate: 'YYYY-MM-DD',   // baru
  endDate:   'YYYY-MM-DD',   // baru
}
```

View lama (MonthView quarter pill / All View grid) tetap jalan dari `{month, week}`;
view kalender baru membaca `startDate/endDate` (fallback hitung ulang dari slot bila kosong).

## 5. View derivation (data → kalender)

- `buildDayMap(tasksById, result, rangeStart, rangeEnd)` → `Map<ISO, [{id,title,phase,prio,d,total}]>`
  — dipakai **Month View** (chip per hari yang terlewati, maks 2 chip + "+N more") dan
  day-detail **Week View**.
- `buildSpanList(...)` → bar per fase yang di-clip ke range tampil, dengan flag `clip`
  (render `▸` bila lanjut ke luar range) — dipakai **Week View** span row.
- Kapasitas per hari: `devActive = # task dengan devStart ≤ d < devEnd` vs `cfg.dev`
  (meter + overload merah bila > kapasitas).

### UI (lihat mockup CAL-M / CAL-W)

- **Toggle**: `[Timeline | Week | Month]` di header roadmap (Timeline = grid slot lama).
- **Month View**: grid kalender standar (Mon-start, 5–6 baris), cell = tanggal + chip per task
  (dot biru = fase Dev, hijau = fase QA, tint = prioritas), today = border+teks biru,
  weekend shading, "+N more" bila padat.
- **Week View**: 7 kolom hari; **span row** = bar fase per task membentang lintas kolom
  (clip `▸` bila lanjut minggu depan); **day detail** = meter lane per hari + kartu task
  (badge prio, fase, `dN/total`).
- Navigasi `‹ ›` per minggu/bulan, tombol **Today**, klik chip/kartu → DetailPanel yang ada.
- Drag chip untuk geser jadwal = **phase 3** (belum di mockup sebagai behavior).

## 6. Kode siap integrasi

```js
// ── roadmap-calendar-timeline.js — date engine + scheduler + view derivation ──
// Tempatkan di scope RoadmapView/RoadmapPage (duplikasi konstanta = pola yang ada,
// lihat pitfall "Constants scoped to RoadmapView are invisible in RoadmapPage").

const CAL = {
  DEV_DAYS: { L: 10, M: 20, H: 40 },
  QA_DAYS: { L: 5, M: 10, H: 15 },
  DEFAULT_CAP: 0.8,
};

// ── util tanggal (ISO 'YYYY-MM-DD', UTC-safe) ─────────────────────────────
const DAY_MS = 86400000;
const isoOf = (d) => d.toISOString().slice(0, 10);
const parseISO = (s) => new Date(s + 'T00:00:00Z');
const maxISO = (arr) => arr.slice().sort().pop();
const isWorkday = (d, hol) =>
  d.getUTCDay() >= 1 && d.getUTCDay() <= 5 && !hol.has(isoOf(d));

function startOfWeekISO(date) { // Senin minggu berjalan (anchor default)
  const d = new Date(date);
  const wd = (d.getUTCDay() + 6) % 7; // 0 = Mon
  d.setUTCDate(d.getUTCDate() - wd);
  return isoOf(d);
}

function nthWorkday(startISO, n, hol) { // hari kerja ke-n, start dihitung hari ke-1
  let d = parseISO(startISO), count = 0;
  while (count < n) {
    if (isWorkday(d, hol)) count++;
    if (count < n) d = new Date(d.getTime() + DAY_MS);
  }
  return isoOf(d);
}

function nextWorkday(dateISO, hol) {
  let d = new Date(parseISO(dateISO).getTime() + DAY_MS);
  while (!isWorkday(d, hol)) d = new Date(d.getTime() + DAY_MS);
  return isoOf(d);
}

function workdaysBetween(fromISO, toISO, hol) { // inklusif
  const out = [];
  let d = parseISO(fromISO);
  const end = parseISO(toISO);
  while (d <= end) {
    if (isWorkday(d, hol)) out.push(isoOf(d));
    d = new Date(d.getTime() + DAY_MS);
  }
  return out;
}

function phaseDays(level, kind, risk, cap) {
  const base = (kind === 'dev' ? CAL.DEV_DAYS : CAL.QA_DAYS)[level] || (kind === 'dev' ? 20 : 10);
  return Math.max(1, Math.round((base * risk) / (cap || CAL.DEFAULT_CAP)));
}

// ── scheduler (greedy list-scheduling → tanggal) ──────────────────────────
function computeScheduleDates(tasks, cfg, opts = {}) {
  const hol = new Set(opts.holidays || []);
  const anchor = opts.anchor || startOfWeekISO(new Date());
  const cap = cfg.cap > 0 ? cfg.cap : CAL.DEFAULT_CAP;
  const nDev = Math.max(1, cfg.dev | 0);
  const nQa = Math.max(1, cfg.qa | 0);
  const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
  const isHold = (t) => t.status === 'hold';
  const isBlocked = (t) => t.status === 'blocked';
  const sectionOf = (t) => (t.current ? 'current' : t.schedule ? 'next' : 'backlog');
  const SECT = { current: 2, next: 1, backlog: 0 };
  const IMPW = { H: 3, M: 2, L: 1 };
  const EFFINV = { L: 3, M: 2, H: 1 };
  const prioScore = (t) => {
    const P = { P0: 4, P1: 3, P2: 2, P3: 1, Backlog: 0 }[t.priority] || 0;
    return P * 1000 + (IMPW[t.impact] || 0) * 100 + (EFFINV[t.effort] || 0) * 10 +
      ({ L: 3, M: 2, H: 1 }[t.testing] || 0);
  };
  const active = tasks.filter((t) => !isHold(t) && !isBlocked(t) && sectionOf(t) !== 'backlog');
  const blockedIds = new Set(tasks.filter(isBlocked).map((t) => t.id));
  const depsOf = (t) => (Array.isArray(t.dependency) ? t.dependency : t.dependency ? [t.dependency] : []);
  const depOk = (t) => {
    for (const d of depsOf(t)) {
      if (blockedIds.has(d)) return false;
      const dt = byId[d];
      if (!dt || isHold(dt)) continue;
      if (remaining.has(d)) return false;
    }
    return true;
  };
  const devFree = new Array(nDev).fill(anchor);
  const qaFree = new Array(nQa).fill(anchor);
  const done = {};   // id -> qaEnd
  const result = {}; // id -> { devStart, devEnd, qaStart, qaEnd, start, end }
  const remaining = new Set(active.map((t) => t.id));
  let guard = 0;
  while (remaining.size && guard++ < 2000) {
    const ready = active.filter((t) => remaining.has(t.id) && depOk(t));
    if (!ready.length) break; // sisanya deferred (blocked-downstream / dep cycle)
    ready.sort((a, b) =>
      SECT[sectionOf(b)] - SECT[sectionOf(a)] || prioScore(b) - prioScore(a) || (a.rank || 0) - (b.rank || 0));
    const t = ready[0];
    const depEnds = depsOf(t).map((d) => done[d] || anchor);
    const pmStart = t.pm_front_weeks ? nthWorkday(anchor, Math.round(t.pm_front_weeks * 5), hol) : anchor;
    const dl = devFree.indexOf(devFree.slice().sort()[0]);
    const devStart = maxISO([devFree[dl], ...depEnds, pmStart]);
    const devEnd = nthWorkday(devStart, phaseDays(t.effort, 'dev', t.risk || 1, cap), hol);
    devFree[dl] = nextWorkday(devEnd, hol);
    const ql = qaFree.indexOf(qaFree.slice().sort()[0]);
    const qaStart = maxISO([qaFree[ql], nextWorkday(devEnd, hol)]);
    const qaEnd = nthWorkday(qaStart, phaseDays(t.testing, 'qa', 1, cap), hol);
    qaFree[ql] = nextWorkday(qaEnd, hol);
    done[t.id] = qaEnd;
    result[t.id] = { devStart, devEnd, qaStart, qaEnd, start: devStart, end: qaEnd };
    remaining.delete(t.id);
  }
  return { result, deferred: [...remaining] };
}

// ── backward compat: tanggal → slot {month, week} model lama ─────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function toSlot(isoDate) {
  const d = parseISO(isoDate);
  return { month: MONTH_NAMES[d.getUTCMonth()], week: Math.min(4, Math.ceil(d.getUTCDate() / 7)) };
}

// ── view derivation ──────────────────────────────────────────────────────
function buildDayMap(tasksById, result, rangeStart, rangeEnd, hol = new Set()) {
  const map = new Map();
  for (const [id, r] of Object.entries(result)) {
    const t = tasksById[id];
    const devD = workdaysBetween(r.devStart, r.devEnd, hol);
    const qaD = workdaysBetween(r.qaStart, r.qaEnd, hol);
    devD.forEach((d, i) => {
      if (d < rangeStart || d > rangeEnd) return;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push({ id, title: t.title, phase: 'Dev', prio: t.priority, d: i + 1, total: devD.length });
    });
    qaD.forEach((d, i) => {
      if (d < rangeStart || d > rangeEnd) return;
      if (!map.has(d)) map.set(d, []);
      map.get(d).push({ id, title: t.title, phase: 'QA', prio: t.priority, d: i + 1, total: qaD.length });
    });
  }
  return map; // Month View chip / Week View day card dari sini
}

function buildSpans(tasksById, result, weekStartISO, hol = new Set()) {
  // bar per fase, di-clip ke [weekStart, weekStart+6 hari] untuk Week View span row
  const weekEnd = isoOf(new Date(parseISO(weekStartISO).getTime() + 6 * DAY_MS));
  const spans = [];
  for (const [id, r] of Object.entries(result)) {
    const t = tasksById[id];
    for (const [phase, from, to] of [['Dev', r.devStart, r.devEnd], ['QA', r.qaStart, r.qaEnd]]) {
      if (to < weekStartISO || from > weekEnd) continue;
      spans.push({
        id, title: t.title, phase, prio: t.priority, from, to,
        fromClipped: from < weekStartISO, toClipped: to > weekEnd,
      });
    }
  }
  return spans.sort((a, b) => (a.from < b.from ? -1 : 1));
}
```

## 7. Adaptasi ke Roadmap yang Ada (change map — verified 2026-10-12)

> Basis: `Test/testcase-browser.html` (13.461 line). Line anchor = posisi sesi ini, bisa drift —
> cari symbol-nya, jangan line number mentah.

### 7.0 Fakta arsitektur yang mengubah rencana

| Fakta | Bukti (line) | Konsekuensi |
|---|---|---|
| Roadmap **aktif** = `RoadmapPage` (Dashboard v2 → Roadmap) | mount `dashV2Sub === "roadmap"` → `<RoadmapPage/>` (12973) | calendar views hidup di sini |
| `RoadmapView` (v1) **disabled** — "kept as the IDB data editor only" | komentar 12046 | jangan sentuh behavior-nya (protected) |
| **Scheduler `computeSchedule` + preview/apply hanya ada di v1** | `preview` state 6792, `computeSchedule` 7167–7254, `applyPreview` 7257–7279, UI Auto-Schedule box 7711–7731 | scheduler harus **di-port** ke `RoadmapPage`, bukan sekadar dipakai ulang |
| `RoadmapPage` baca data dari `rawTasks.current` (useRef, IDB `roadmap_v1`) + `sections` via `tasksToSections` | 8602–8627, mount effect 8946–8986 | kode di `RoadmapPage` wajib pakai `rawTasks.current`, bukan `tasks` |
| Row model `sections`: `[#, task, area, prio, status, E, I, T, assignees[], [mStart,mEnd], …, id=r[12]]` | `tasksToSections` 8603, `editCell(r[12], …)` 9047 | estimasi = `r[5]` (E), `r[7]` (T) — sumber kalender |
| Bulan = indeks relatif Okt=0..Sep=11 (`RM_IDX_MON` 8944, `RM_CAL` 8606), window Q4 2026–Q3 2027 (`QUARTERS_INIT` 8639) | | mapping indeks → tahun: 0–2 = 2026, 3–11 = 2027 |
| `monthView` state (8683) = `{qLabel, mi}` — **list view per bulan**, BUKAN kalender | | state mode kalender harus nama baru (`calMode`), jangan overload `monthView` |
| 2 return path: `if (monthView) return …` (~9786) lalu All View; shared overlay = pola `addTaskModalEl`/`qPopupEl` (`const el = cond && (()=>{…})()` sebelum `if`, `{el}` di kedua return) | 9700–9775 | toggle + Compute bar = shared element |
| `DEV_WEEKS`/`QA_WEEKS` di-duplikat manual di `RoadmapPage` (8770–8772) untuk DetailPanel estimate (9527–9528) | | konsolidasi mapping menyentuh 2 tempat ini |

### 7.1 Change list (urutan eksekusi)

**C1 — Date engine block** (baru, di atas `tasksToSections` ~8602):
`CAL` mapping + `nthWorkday/nextWorkday/workdaysBetween/phaseDays/startOfWeekISO` +
`idxToDate(i)` (RM_IDX_MON index → `{year, month}`; i<3 → 2026). Kode: §6.

**C2 — Dual-write `schedule`** (backward compat):
`schedule` → `{ start:{month,week}, end:{month,week}, startDate, endDate }`.
SEMUA write-site harus ditulis (pitfall "reset patterns" — miss satu = tanggal hilang di jalur itu):

| # | Write-site | Line | Catatan |
|---|---|---|---|
| 1 | `RoadmapPage.setSpan` (drag-fill bulan) | 9573 | startDate = tgl 1 bulan awal, endDate = akhir bulan akhir |
| 2 | `RoadmapPage.editCell` col 4 → 'next' | 9047 | default {month: RM_IDX_MON[0], week 1..4} |
| 3 | `RoadmapView.applyPreview` | 7266 | scheduler v1 — biarkan (disabled), jangan rusak |
| 4 | `RoadmapView` OP merge default | 6914 | idem |
| 5 | `RoadmapView.statusPatch` NEXT | 6970 | idem |
| 6 | `RoadmapView` RmCombo status onChange | 8033 | idem |
| 7 | `RoadmapView` normalize seed | 7129 | idem |

Pembaca toleran: `startDate` kosong → derive dari slot (approx) + tanda "≈" di chip.

**C3 — Scheduler port ke `RoadmapPage`** (inti):
`computeScheduleDates(tasks, cfg, {anchor, holidays})` (§4/§6) sebagai `useCallback`,
input `rawTasks.current`, cfg = `{dev, qa, cap}` load/save IDB **`roadmap_cfg_v1`**
(sama dengan v1 — `RM_DEFAULT_CFG = {dev:2, qa:1, cap:0.8}` 6789, jangan bikin key baru).
Output: `calPreview` state baru (`Map id → {devStart,devEnd,qaStart,qaEnd}` ISO) + `deferred`.
Anchor default = Senin minggu berjalan (12 Okt 2026 = di dalam window Okt26–Sep27 ✓).
Aturan lama dipertahankan: backlog tidak dijadwalkan, HOLD inert, BLOCKED defer downstream,
urutan section→prioScore→rank, lane dev/qa paralel, dep FS via `qaEnd`.

**C4 — Compute/Apply/Discard UI** (shared element):
Bikin `computeBarEl` dengan pola `addTaskModalEl` (sebelum `if (monthView)`, `{…}` di KEDUa return):
knob Dev/QA/Cap (reuse CSS `.rule-cfg`/`.rm-compute` 6047–6048, 6166) + ⚡ Compute →
`calPreview` ghost + ✓ Apply + ✕ Discard. Letak: header toolbar Month View (~9830, sebelah
`+ Add Task`) dan All View (~10077) — atau satu bar di atas KPI supaya tidak duplikat.

**C5 — `applyCalPreview`**: per task `patchTask(id, { schedule: dual-shape })` (helper
`patchTask` ~8938 → `applyRaw` → `saveRoadmapIDB` sudah persist). Tanggal → slot:
`toSlot()` (§6). `tasksToSections` re-derive otomatis (bulan pills tetap jalan).

**C6 — Mode kalender** (state + 2 renderer baru):
- State: `calMode: null | 'week' | 'month'` (null = timeline yang ada). Toggle
  `[Timeline | Week | Month]` di header (kedua view).
- Gate: `if (monthView && !calMode) …` supaya list-view dan kalender tidak tabrakan;
  `calMode` aktif → render `RoadmapCalendarMonth` / `RoadmapCalendarWeek` di body.
- Data: `buildDayMap`/`buildSpans` (§6) atas hasil `computeScheduleDates` ATAU
  `schedule.startDate/endDate` yang sudah tersimpan (kalender tetap berguna tanpa Compute ulang).
- Visual = mockup CAL-M/CAL-W (chip dot biru/hijau, tint prio, today marker, meter lane,
  span bar + `▸`). Warna: var CSS tema yang ada / DV2 (`#0B0F14`…), jangan hardcode tema baru.
- Detail card klik → DetailPanel yang ada (row `r[12]`).

**C7 — DetailPanel estimate row** (9527–9528): tambah tanggal aktual
(`Estimate: Dev 20d (12 Okt–9 Nov) + QA 10d …` dari `schedule.startDate/endDate` atau preview).
Ganti `DEV_WEEKS/QA_WEEKS` duplikat (8770–8772) ke sumber `CAL` (÷5 untuk display weeks) —
sekalian konsolidasi mapping, jangan biarkan 2 mapping hidup bersamaan.

**C8 — Verifikasi** (wajib, urut):
1. Hard-refresh (`Ctrl+Shift+R`) — cache pitfall.
2. Compute → ghost preview di Timeline & kalender → Apply → refresh → `startDate/endDate` + slot persist di IDB.
3. Derivasi status NOW/NEXT/BACKLOG tidak berubah (3 code path: 8033/6969/9045 — jangan sentuh logic-nya, hanya dual-write).
4. Drag-fill bulan di All View (9566–9590) masih menulis slot + tanggal.
5. Task tanpa `startDate` → fallback "≈" tanpa crash; OP push/sync tidak terpengaruh.
6. Backlog/HOLD/BLOCKED tetap tidak masuk kalender sebagai scheduled.

### 7.2 Risiko tambahan (dari hasil cek kode)

| # | Risiko | Mitigasi |
|---|---|---|
| 7 | `RoadmapPage` tidak punya state `tasks` (hanya `rawTasks.current` ref) — scheduler yang dibuat asal akan baca state kosong | port wajib pakai `rawTasks.current` + `applyRaw` (lihat pitfall skill) |
| 8 | Constants `RoadmapView` tidak terlihat di `RoadmapPage` (beda fungsi) | definisikan `CAL` di scope `RoadmapPage` / module-level, jangan impor dari v1 |
| 9 | `IIFE (()=>{…})()` dalam JSX ternary = blank page di Babel standalone | pre-compute variabel sebelum `return` (lihat 9832 yang sudah ada — jangan ditiru pola IIFE baru) |
| 10 | Nama `monthView` sudah terpakai (list view) | state kalender = `calMode`; jangan sentuh `monthView` semantics |
| 11 | 7 write-site `schedule` (C2) | kerjakan C2 satu patch per site, verifikasi grep `schedule: {` bersih dari shape lama di jalur v2 |

## 8. Risiko / keputusan terbuka

| # | Risiko | Mitigasi |
|---|---|---|
| 1 | 3 model estimasi tidak konsisten | konsolidasi ke `CAL` mapping; Capacity & Workload panel ikut (ubah `calcCapacity` `DEV` dan `WL_PW` ke hari/minggu setara) |
| 2 | Backward compat view slot lama | tulis ganda slot + ISO saat Apply |
| 3 | Task lama tanpa `startDate` | fallback derive dari slot, tanda "≈" di chip sampai re-compute |
| 4 | Weekend/holiday policy | default Mon–Fri; holiday set opsional; bar visual kontinu (mockup sudah kasih konvensi ini) |
| 5 | Deferred / dep cycle | tetap visible sebagai unscheduled + banner, perilaku sama dengan Compute lama |
| 6 | Drag-to-adjust (phase 3) | di luar scope; jangan setengah implement di phase 2 |

## 9. Phase plan

- **Phase 1 (sesi ini, selesai)**: plan + mockup pen (CAL-M/CAL-W) + logic spec (dokumen ini).
- **Phase 2 (implementasi)**: date engine + `computeScheduleDates` + toggle + 2 renderer kalender
  + preview/apply; smoke test: Compute → Apply → refresh → tanggal & slot persist.
- **Phase 3 (opsional)**: drag geser jadwal, config holiday, export `.ics`, heatmap workload bulanan.
