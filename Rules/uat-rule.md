> ⚠️ **SUPERSEDED** — canonical rule sekarang di `integrations/satuinbox-openproject-adapter.md`.
> File ini dipertahankan sebagai detail reference (metodologi/checklist lama) selama transisi;
> jangan pakai sebagai entry point untuk pekerjaan baru. Peta lengkap: `Rules/MIGRATION.md`.
> Isi di bawah TIDAK dihapus untuk menghindari silent degradation pada referensi lama.

# UAT Writing Rule

## Purpose
Rule ini mengatur cara menulis dokumen User Acceptance Test (UAT) SatuInbox agar format, traceability, dan isi kolom konsisten dengan template resmi tim.

## When to Use
Gunakan rule ini saat:
- membuat dokumen UAT untuk release version dari OpenProject
- merevisi dokumen UAT existing agar mengikuti template resmi tim
- menurunkan scope release ticket menjadi lembar eksekusi UAT

## Mandatory Inputs
Sebelum menulis UAT, kumpulkan input berikut:
1. target version release di OpenProject, contoh `prod-2.7.0`
2. daftar work package dari version target
3. template UAT resmi tim; jika user melampirkan file spreadsheet/image, itu jadi source of truth format
4. owner metadata:
   - PM: `Dany Christian`
   - QA: `Dany Christian`
   - TechLead: `Naftal Yunior`

## Source Priority
Urutan source of truth:
1. template UAT resmi tim yang dilampirkan user
2. OpenProject version scope
3. penjelasan user untuk mapping isi kolom
4. rule QA/test case existing di repo

Jika ada konflik format, ikuti template UAT resmi tim.

## Required Template Structure
Dokumen UAT wajib mengikuti struktur berikut.

### 1. Metadata Header
Header atas wajib memuat:
- judul dokumen UAT
- `Apps Name`
- `Version`
- `Date`
- `PM`
- `QA Name`
- `TechLead`

### 2. Tabel UAT Utama
Tabel utama hanya memakai 5 kolom berikut, urutan persis:
1. `Feature`
2. `Description`
3. `Enhancement`
4. `Evidence`
5. `Test Results`

Jangan tambah kolom lain kecuali user minta.

## Column Writing Rules
### Feature
Isi dengan judul ticket / subject work package OpenProject.

### Description
Isi dengan rangkuman singkat dari deskripsi ticket.
Prioritas isi:
1. paragraph pertama yang menjelaskan overview masalah/perubahan
2. jika description kosong atau placeholder, pakai fallback `<Type>: <Subject>`

Description harus ringkas dan tester-readable. Jangan dump seluruh body ticket mentah.

### Enhancement
Isi dengan rangkuman apa yang berubah di SatuInbox dari ticket tersebut.
Bukan sekadar `Yes/No`.

Aturan praktis:
- untuk feature atau user story: tulis perubahan/kemampuan baru yang hadir di UI/flow
- untuk bug: tulis perilaku yang diperbaiki atau kondisi yang kini seharusnya benar
- jika detail perubahan minim, turunkan dari subject + description menjadi satu kalimat ringkas

Contoh:
- `Agent sekarang bisa melihat status channel lebih konsisten setelah sinkronisasi disconnect diperbaiki.`
- `Sistem sekarang menampilkan reply context pada pesan WhatsApp Group yang sebelumnya hilang.`

### Evidence
Isi dengan link penuh work package OpenProject:
`https://project.ordo.co.id/wp/{id}`

### Test Results
Kosongkan saat authoring awal. Kolom ini diisi saat eksekusi UAT.

## Scope Selection Rules
### Include
Masukkan work package bila type termasuk:
- `Feature`
- `Bug`
- `User story`

### Exclude
Jangan masukkan item berikut kecuali user eksplisit minta:
- `Task` koordinasi internal
- item deploy/release operational
- audit, meeting, grooming/gromming
- monitoring/support-only scope tanpa acceptance flow UI yang diuji user

## Authoring Flow
1. Identifikasi target version di OpenProject.
2. Ambil seluruh work package version tersebut.
3. Filter scope memakai rules include/exclude.
4. Ambil subject, type, description, dan id work package.
5. Isi `Feature` dari subject ticket.
6. Ringkas `Description` dari deskripsi ticket.
7. Tulis `Enhancement` sebagai ringkasan perubahan ke SatuInbox berdasarkan ticket.
8. Isi `Evidence` dengan link OpenProject.
9. Biarkan `Test Results` kosong.
10. Verifikasi jumlah row dan konsistensi isi kolom.

## Output Rules
- Jika user memberi template `.xlsx`, output utama sebaiknya `.xlsx`.
- CSV boleh sebagai export tambahan bila memudahkan review.
- Simpan artefak per version, contoh:
  `Assessments/openproject/prod-2.7.0/`

Nama file disarankan:
- `prod-<version>-uat.xlsx`
- `prod-<version>-uat.csv`

## Verification Checklist
Sebelum menutup task, cek:
- version header cocok dengan version target
- 5 kolom header sesuai template
- setiap row punya `Feature`, `Description`, `Enhancement`, `Evidence`
- `Test Results` kosong pada initial draft
- evidence selalu link OpenProject penuh
- jumlah row konsisten dengan hasil filter OpenProject

## Non-Negotiable Rules
- Jangan invent hasil test execution.
- Jangan isi `Pass/Fail` jika UAT belum dijalankan.
- Jangan hilangkan traceability ke work package OpenProject.
- Jangan ubah header tabel tanpa instruksi user.

## Relationship to Other Rules
- `Rules/test-case-rule.md` untuk testcase detail per langkah.
- Rule ini untuk lembar UAT release-level ringkas sesuai template user.

## Escalation
Jika template user berubah lagi, update rule ini lalu regenerasi file UAT agar format tetap sinkron dengan template terbaru.
