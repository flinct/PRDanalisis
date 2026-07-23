# Deck Update Rule

Folder kerja wajib:
- Root: `C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\presentation`
- Rule: `rules/deck-update-rule.md`
- Template: `template/`
- Output weekly: `weekly/`
- Output monthly: `monthly/`

## Input minimum
Setiap update deck harus baca dulu:
1. `rules/deck-update-rule.md`
2. template relevan di `template/`
3. source data terbaru yang user sebutkan

User cukup kirim perubahan seperti:
- jenis deck: weekly / monthly
- project / source data
- version closed / ongoing / next
- tanggal meeting / periode report
- tambahan highlight / blocker

## Rule umum
- Selalu pakai template lokal di folder ini sebagai source of truth presentasi.
- Selalu tampilkan tanggal jelas di cover dan konteks report.
- Jika source tidak punya actual deadline/release date, tulis `Estimated` atau `Belum tersedia`.
- Jangan invent data. Kalau date tidak ada di source, sebut tidak ada.
- Fokus management-friendly: singkat, status jelas, blocker jelas.
- Weekly dan monthly dipisah file outputnya.
- Nama file wajib pakai tanggal.

## Struktur output file
- Weekly: `weekly/YYYY-MM-DD_satuinbox_weekly_progress.html`
- Monthly: `monthly/YYYY-MM-DD_satuinbox_monthly_progress.html`

## Minimum isi weekly
1. Title
2. Executive Summary
3. Version Progress
4. Current Feature Status
5. Problem / Blocking
6. Next Week Plan
7. Q&A

## Minimum isi monthly
1. Title
2. Executive Summary
3. Progress (Last 2 Months)
4. Version Timeline
5. Feature Progress
6. Current Sprint / Current Version
7. Timeline / Gantt / release view
8. Problem / Blocking
9. Difficulty / workload analysis
10. Upcoming Release
11. Q&A

## Tanggal wajib
Tampilkan minimal:
- Tanggal generate deck
- Tanggal meeting / periode report
- Jika ada: actual release date
- Jika belum ada: label `Estimated`

## Update flow
1. Baca rule ini
2. Baca template weekly/monthly
3. Ambil data source terbaru
4. Buat / update file output sesuai jenis deck
5. Verifikasi file benar-benar tersimpan di folder ini

## Notes
- Default format boleh HTML kalau user belum minta PPTX.
- Jika nanti user minta PPTX, konten pakai rule dan template yang sama.
