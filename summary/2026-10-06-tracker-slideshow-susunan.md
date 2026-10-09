# Summary — 2026-10-06 tracker slideshow susunan

## Scope
- Analisa + rearrange susunan slide tracker slideshow (`Test/modules/ui-tracker.js` → `buildSlideshowHtml`) sesuai 5 inti presentasi.

## Analisa
- Susunan lama: cover 1 slide (doughnut+KPI) + per user divider + 5 slide (Overview·Task Status / Activity·Diff·Priority / Task List / Last Period / This Period) = 1+6N slide (3 user = 19).
- Gap vs 5 inti: **statistic task keseluruhan** dan **list task keseluruhan** tidak pernah dipick dari deck cover (padahal part-nya ada); per user progress tergabung task status; per user statistic terbelah 2 slide; tiap user bawa 3 slide non-inti.

## What changed
- `buildSlideshowHtml` di-regroup:
  - Section 1 Keseluruhan (deck cover): **Progress** (`overview`) / **Statistic Task** (`task-status`+`activity-chart`+`diff-priority`) / **List Task** (`task-list`).
  - Section 2 Per User (per sheet deck): divider + **Progress** + **Statistic Task**.
- Divider eyebrow `Sheet` → `Per User`; badge slide = nama group; kind `cover` dihapus.
- Task List per user + Last/Now split tables keluar dari deck (UI-only; parts masih ada, catatan `ponytail:` di kode).
- Slide count: 3 + 3N (3 user = 12, dari 19). Murni perubahan builder — nol perubahan render/`data-slide-part`.

## Verification
- `node --check Test/modules/ui-tracker.js` → OK
- `node Scripts/_check-tracker-ui.js` → SELFCHECK ALL PASS
- Source assert susunan baru (group names + eyebrow baru ada; slot lama `kind:'cover'`/Doughnut+KPI hilang) → PASS

## Next suggested check
1. Buka tracker → Statistics → Slideshow: urutan harus Keseluruhan ×3 lalu per user (divider + 2 slide).
2. Cek slide "Statistic Task" (4 chart) tidak terpotong di resolusi 1080p.
3. Kalau perlu Task List per user / tabel Last-Now kembali ke deck, tambah group di `buildSlideshowHtml` (parts sudah tersedia).

## Update — slide List Task single scroll
- Screenshot user: double scroll di slide List Task (scrollbar `slide-body` full-height di kanan + scrollbar list wrapper). Rule: **yang scroll hanya list**.
- Fix CSS doc yang di-generate — **class-scoped** `slide-solo` (builder kasih flag `solo:true` di group List Task → `<section class="slide slide-solo">`), tanpa `:has()` (rule yang drop diam-diam = bug susah dilacak): `.slide-solo .slide-body` `overflow:hidden` + flex column, card `flex:1` + `margin-top:0 !important`, list wrapper `flex:1; min-height:0` (inline `overflow:auto` tetap). Header + KPI tetap di tempat, slide lain tidak tersentuh (fallback `overflow:auto` tetap ada).
- `margin-top:0 !important` penting: inline `marginTop:16` di luar tinggi flex item bikin slide-body overflow 16px lagi.
- Verifikasi: `node --check` OK, `SELFCHECK ALL PASS`, `node Scripts/_check-list-slide-scroll.js` (playwright, CSS asli diekstrak dari template) → `bodyOverflow: 0, listScrollable: 1515, headerMoved: 0` PASS.
