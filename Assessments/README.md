# Assessment & Change Intake Artifacts

Folder ini menyimpan **artefak Phase 0 Change Intake** dan **Assessment Report permanen** yang dipakai sebagai dasar decision sebelum PRD final, development, test design, atau release planning.

Nama logis artefak Phase 0 adalah **Change Intake Brief**. Nama logis artefak assessment permanen adalah **Assessment Report**. Untuk kompatibilitas dengan struktur repo saat ini, persisted filename masih boleh memakai suffix `-qa-assessment.md` sampai ada migrasi naming filesystem repo-wide.

## Struktur yang dipakai sekarang

- `templates/Setup/change-intake-brief-template.md` — template artefak Phase 0 Change Intake Brief
- `templates/qa-assessment-report-template.md` — template baku laporan assessment
- `templates/Setup/*.md` — workflow templates untuk Assessment Report, QA pre/post validation, reviewer decision, dan automation mapping
- `reference/*.md` — reusable PRD analysis reference (comparison, deep-dive, loophole map) yang **bukan** decision report final
- `<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md` — versi latest/current Change Intake Brief untuk feature tersebut
- `<domain>/<feature-slug>/<feature-slug>-qa-assessment.md` — versi latest/current Assessment Report
- `<domain>/<feature-slug>/versions/<feature-slug>-change-intake-brief-vX.Y.md` — histori versi immutable Change Intake Brief
- `<domain>/<feature-slug>/versions/...` — histori versi immutable
- `archive/legacy-temp-analysis/` — migrasi historis dari folder `Temp Analysis/` yang sudah dihapus

## Aturan penggunaan

1. Semua analisis dan intake artifacts yang ingin disimpan harus masuk ke `Assessments/` — **tidak ada lagi `Temp Analysis/`**.
2. Jika request menambah / mengubah / membuang / merevive behavior, buat **Change Intake Brief** lebih dulu di `Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md`.
3. Jika dokumen berisi keputusan resmi (`PROCEED`, `REVISE_PRD`, `HOLD`, dll), simpan sebagai Assessment Report di `Assessments/<domain>/<feature-slug>/...`.
4. Jika dokumen adalah reusable deep-dive / comparison / supporting PRD analysis tanpa decision final feature-spesifik, simpan di `Assessments/reference/`.
5. Jika Change Intake Brief atau Assessment Report direvisi, simpan versi sebelumnya ke folder `versions/` dan update file latest/current.
6. Setiap revisi Assessment Report wajib menulis:
   - `Version`
   - `Previous Version`
   - `Ringkasan Perubahan Analisa`
7. Setiap revisi Change Intake Brief juga wajib menulis `Version`, `Previous Version`, dan ringkasan perubahan scope / routing.
8. Ikuti template `templates/qa-assessment-report-template.md` dan `templates/Setup/change-intake-brief-template.md` agar output konsisten dan mudah ditrace.
9. Template workflow pendukung yang hidup di `templates/Setup/` boleh dipakai sebagai wrapper operasional selama tetap konsisten dengan template assessment canonical.
10. Domain folder sebaiknya mirror area PRD, misalnya:
   - `Assessments/conversation/`
   - `Assessments/ticket/`
   - `Assessments/whatsapp-web/`
   - `Assessments/cross-domain/`

## Reuse Rule

- BRD / discovery discussion harus mereferensikan Change Intake Brief bila artifact itu sudah ada.
- PRD harus membaca brief ini sebagai baseline scope, change class, dan protected existing behavior.
- Assessment Report harus mereferensikan brief ini sebagai source baseline bila request berasal dari requirement lifecycle lane.
- QA artifacts harus mereferensikan brief ini agar expected behavior tidak drift dari scope awal.
- Jika ada perubahan lanjutan pada feature yang sama, **update brief itu dulu** sebelum patch PRD, Assessment Report, atau QA artifacts.

## Naming convention

- lowercase
- hyphen-separated
- tanpa spasi
- suffix persisted filename saat ini: `-qa-assessment` dan `-change-intake-brief`

Judul dokumen boleh memakai nama **Change Intake Brief** atau **Assessment Report** selama struktur dan path tetap mengikuti convention di atas.

## Contoh struktur
- `Assessments/reference/conversation-v1-vs-v2-comparison.md`
- `Assessments/reference/contact-context-visibility.md`
- `Assessments/conversation/conversation-room/conversation-room-change-intake-brief.md`
- `Assessments/whatsapp-web/account-channel-event-log/account-channel-event-log-qa-assessment.md`
- `Assessments/whatsapp-web/account-channel-event-log/versions/account-channel-event-log-qa-assessment-v1.1.md`
- `Assessments/conversation/conversation-room/conversation-room-qa-assessment.md`
