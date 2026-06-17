# QA Assessments

Folder ini menyimpan **artefak analisis permanen** yang dipakai sebagai dasar decision sebelum development, test design, atau release planning.

Nama logis artefak permanen ini adalah **Assessment Report**. Untuk kompatibilitas dengan struktur repo saat ini, persisted filename masih boleh memakai suffix `-qa-assessment.md` sampai ada migrasi naming filesystem repo-wide.

## Struktur yang dipakai sekarang

- `templates/qa-assessment-report-template.md` — template baku laporan assessment
- `templates/Setup/*.md` — workflow templates untuk Assessment Report, QA pre/post validation, reviewer decision, dan automation mapping
- `<domain>/<feature-slug>/<feature-slug>-qa-assessment.md` — versi latest/current
- `<domain>/<feature-slug>/versions/...` — histori versi immutable
- `archive/legacy-temp-analysis/` — migrasi historis dari folder `Temp Analysis/` yang sudah dihapus

## Aturan penggunaan

1. Semua analisis yang ingin disimpan harus masuk ke `Assessments/` — **tidak ada lagi `Temp Analysis/`**.
2. Jika assessment direvisi, simpan versi sebelumnya ke folder `versions/` dan update file latest/current.
3. Setiap revisi wajib menulis:
   - `Version`
   - `Previous Version`
   - `Ringkasan Perubahan Analisa`
4. Ikuti template `templates/qa-assessment-report-template.md` agar output konsisten dan mudah ditrace.
5. Template workflow pendukung yang hidup di `templates/Setup/` boleh dipakai sebagai wrapper operasional selama tetap konsisten dengan template assessment canonical.
6. Domain folder sebaiknya mirror area PRD, misalnya:
   - `Assessments/conversation/`
   - `Assessments/ticket/`
   - `Assessments/whatsapp-web/`
   - `Assessments/cross-domain/`

## Naming convention

- lowercase
- hyphen-separated
- tanpa spasi
- suffix persisted filename saat ini: `-qa-assessment`

Judul dokumen boleh memakai nama **Assessment Report** selama struktur dan path tetap mengikuti convention di atas.

Contoh struktur:
- `Assessments/whatsapp-web/account-channel-event-log/account-channel-event-log-qa-assessment.md`
- `Assessments/whatsapp-web/account-channel-event-log/versions/account-channel-event-log-qa-assessment-v1.1.md`
- `Assessments/conversation/conversation-room/conversation-room-qa-assessment.md`
