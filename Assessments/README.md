# QA Assessments

Folder ini menyimpan **artefak analisis permanen** yang dipakai sebagai dasar decision sebelum development, test design, atau release planning.

## Struktur yang dipakai sekarang

- `templates/qa-assessment-report-template.md` — template baku laporan assessment
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
5. Domain folder sebaiknya mirror area PRD, misalnya:
   - `Assessments/conversation/`
   - `Assessments/ticket/`
   - `Assessments/whatsapp-web/`
   - `Assessments/cross-domain/`

## Naming convention

- lowercase
- hyphen-separated
- tanpa spasi
- suffix wajib: `-qa-assessment`

Contoh struktur:
- `Assessments/whatsapp-web/account-channel-event-log/account-channel-event-log-qa-assessment.md`
- `Assessments/whatsapp-web/account-channel-event-log/versions/account-channel-event-log-qa-assessment-v1.1.md`
- `Assessments/conversation/conversation-room/conversation-room-qa-assessment.md`
