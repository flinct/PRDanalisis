# UAT Prototype Modul Sales (SatuInbox)

- **Apps Name:** SatuInbox — Sales Module (prototype)
- **Version:** prototype 1.0
- **Date:** 2026-09-29
- **PM:** Dany Christian
- **QA Name:** Dany Christian
- **TechLead:** Naftal Yunior
- **Scope:** sales-clone/ (leads, visits, settings pipeline) — walkthrough manual di browser (file://)

> Kolom Pass/Fail & Catatan diisi tester saat eksekusi. Jangan diisi saat authoring.

| No | Area | Skenario | Langkah | Expected Result | Pass/Fail | Catatan |
|---|---|---|---|---|---|---|
| 1 | Navigasi | Landing default = Leads | Buka index.html sales-clone tanpa hash. | Halaman langsung ke Pipeline Leads (bukan blank / conversation). Rail hanya menampilkan Prospek. |  |  |
| 2 | Navigasi | Visit tidak ada di main nav | Perhatikan rail kiri. | Tidak ada tombol Kunjungan/Visit di rail. Visit hanya diakses dari dalam Leads. |  |  |
| 3 | View | Toggle Board / Table | Klik toggle Board lalu Table. | Board = kanban per stage; Table = list baris. Data lead sama di kedua view. |  |  |
| 4 | View | Filter pencarian lead | Ketik nama/company di kotak filter. | List lead menyusut sesuai keyword secara live. |  |  |
| 5 | View | Filter per stage (klik summary card) | Klik salah satu KPI/stage card di ringkasan. | List terfilter ke stage tsb; klik lagi = reset. |  |  |
| 6 | View | Sort arah asc/desc | Klik toggle arah sort. | Urutan default descending; toggle membalik urutan. |  |  |
| 7 | View | Follow-up filter | Aktifkan filter follow-up. | Hanya lead yang punya nextAction jatuh tempo yang tampil. |  |  |
| 8 | View | Pipeline value breakdown | Klik toggle breakdown nilai pipeline. | Muncul rincian total nilai per stage (termasuk Won/Lost value KPI). |  |  |
| 9 | Board | Drag lead antar stage | Board view: drag kartu lead ke kolom stage lain (non-terminal). | Lead pindah stage; toast konfirmasi; data persist setelah refresh. |  |  |
| 10 | Detail | Buka detail lead | Klik satu kartu/baris lead. | Modal detail terbuka: summary, stepper status, kontak, aktivitas, visit. |  |  |
| 11 | Detail | Inline-edit field | Edit field (mis. nilai/assignee) di detail lalu blur. | Nilai tersimpan otomatis (blur-save); toast konfirmasi; persist. |  |  |
| 12 | Detail | Tambah komentar/aktivitas | Isi form aktivitas lalu simpan. | Aktivitas baru muncul di timeline; toast konfirmasi. |  |  |
| 13 | Status Guard | Transisi forward hanya next stage | Buka popover status di detail, coba pindah maju. | Hanya next stage yang bisa dipilih untuk maju; lompat jauh diblok. |  |  |
| 14 | Status Guard | Won/Lost butuh alasan | Pilih status terminal (Won/Lost). | Wajib isi reason sebelum konfirmasi; tanpa reason tidak bisa lanjut. |  |  |
| 15 | Status Guard | Terminal tidak bisa balik | Lead yang sudah Won/Lost, coba ubah status. | Status terminal terkunci / tidak bisa kembali ke stage aktif. |  |  |
| 16 | Create | Toggle varian A/B/C | Buka Create Lead, klik toggle A, B, C. | Body form berubah (A detail-style, B ringkas, C sederhana); isian terjaga saat ganti varian. |  |  |
| 17 | Create | Stepper status varian A (default new) | Varian A: perhatikan stepper status, klik segmen. | Default stage pertama non-terminal (new). Klik segmen mengisi bar sampai segmen itu (done+current). Won/Lost tak bisa dipilih di create. |  |  |
| 18 | Create | Validasi Judul Lead min 3 karakter | Submit dengan Judul Lead kosong / <3 karakter. | Error 'Judul Lead minimal 3 karakter'; submit ditolak. |  |  |
| 19 | Create | Validasi format email | Isi email tidak valid lalu submit. | Error 'Format email tidak valid'; submit ditolak. |  |  |
| 20 | Create | Nilai negatif di-clamp | Isi Nilai negatif lalu submit. | Nilai tersimpan minimal 0 (tidak negatif). |  |  |
| 21 | Create | Autocomplete kontak | Ketik di Nama PIC, pilih saran kontak. | Field telepon/email terisi otomatis dari kontak; lead ter-link contactId. |  |  |
| 22 | Create | Label general (Judul Lead / Nama PIC) | Perhatikan label form. | Label 'Judul Lead' (placeholder Perusahaan / perorangan) & 'Nama PIC', bukan 'Nama perusahaan'/'Nama Kontak'. |  |  |
| 23 | Create | Simpan lead baru | Isi form valid lalu simpan. | Lead baru muncul di board/table pada stage yang dipilih; toast konfirmasi; persist. |  |  |
| 24 | Role | Delete lead sesuai role | Switch role (agent vs admin/spv) via role modal, cek aksi delete. | Delete hanya tersedia untuk role berwenang; agent tidak bisa delete. |  |  |
| 25 | Visit | Buka modal visit dari lead | Di detail lead, buka visit / check-in. | Modal visit terbuka; bisa buat/check-in kunjungan. |  |  |
| 26 | Visit | Approve / reject visit (waiting review) | Buka halaman visits (via dalam leads), approve/reject 1 visit. | Status visit berubah; bulk approve/reject & single check-in berfungsi. |  |  |
| 27 | Settings | Ganti preset pipeline | Settings > Pipeline Leads: pilih preset (Default/ClientA/Simple), Save & Apply. | Stage berubah; lead ter-remap by-position ke stage baru; board mencerminkan preset. |  |  |
| 28 | Data | Isolasi localStorage clone | Buka clone lalu induk di tab beda; ubah data di salah satu. | Data clone (satui_proto_data_saclone) terpisah dari induk; tidak saling menimpa. |  |  |
