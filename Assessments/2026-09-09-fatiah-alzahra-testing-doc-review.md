# Assessment Report — Review Testing Documentation Fatiah Al Zahra (Rev 2)

- **Tanggal:** 2026-09-09
- **Owner:** Analyst (Dany Christian, PM)
- **Objek review:** `Testing_Documentation_SatuInbox_FatiahAlZahra.xlsx` (6 sheet: A Manual, B Exploratory, C UAT, D Playwright, E API, G Improvement)
- **Baseline pembanding:** Test Case Database SatuInbox V2 (`Test/`), untuk mengukur **cakupan core function per fitur** — bukan rasio jumlah global.

> **Perubahan metode (Rev 2, sesuai arahan):**
> 1. Cakupan dinilai **per-fitur** (apakah core function fitur yang diuji tercakup), bukan 33-vs-725 keseluruhan.
> 2. **Dimensi traceability-ke-PRD dihapus.** Test dibuat tanpa melihat PRD — kemungkinan metode monkey/exploratory testing. Tidak adil dinilai atas dokumen yang tidak dipakai.
> 3. Tiap bagian (A/B/C/D/E/G) **dinilai terpisah**.

---

## 1. Prinsip Scoring Baru

Cakupan diukur: **dari fitur yang tester pilih untuk diuji, seberapa lengkap core function fitur itu tercakup** — bukan dihukum karena tidak menguji seluruh produk. Fitur yang tidak dipilih tidak menurunkan skor cakupan; yang dinilai adalah kelengkapan dalam scope yang dia ambil.

Skala per bagian: **A–F** dengan angka 0–100.

---

## 2. Penilaian Per Bagian (Terpisah)

### Bagian A — Manual Test Case → **72/100 (B)**

33 TC pada 6 fitur inti. Cakupan core function per fitur:

| Fitur diuji | Core function fitur | Tercakup Fatiah | Cakupan |
|---|---|---|---|
| **Login & Auth** (5 TC) | valid, invalid, empty, remember-me, logout | valid + invalid + empty + remember + logout | **Tinggi ~90%** — hampir lengkap |
| **Inbox & Chat** (4 TC) | kirim/terima, upload file+limit, filter list, search | send/receive, file oversize, filter, search-not-found | **Sedang ~55%** — miss: bubble chat, timestamp, delivery status, reply, typing indicator, media open |
| **Kolaborasi** (4 TC) | assign/transfer, internal note, realtime sync, collision | transfer, internal note (Failed), realtime, collision | **Tinggi ~85%** — core kolaborasi tercover baik |
| **CRM & Tagging** (7 TC) | CRUD kontak, validasi, dup-reject, tag, boundary tag, import/export | add/edit, validasi, dup nomor, tag dropdown, 10 tag, import(Failed), export(Failed) | **Tinggi ~85%** |
| **Quick Reply** (6 TC) | CRUD makro, panggil shortcut, validasi label, boundary, cancel-empty | create/edit/delete, shortcut kirim, validasi label, boundary, cancel | **Tinggi ~90%** |
| **Dashboard** (7 TC) | akurasi metrik, date filter, interaktif chart, empty state, boundary, error, future-date block | semua 7 | **Tinggi ~95%** |

**Rata cakupan core-function dalam scope: kuat** (5 dari 6 fitur ≥85%). Inbox agak tipis.
Kualitas TC: Steps/Expected/Actual/Type ada; tiap fitur punya Positive+Negative+Boundary+Error — pola matang.
**Minus A:** status `"PASS "` (2 baris trailing space jadi kategori terpisah); Inbox miss banyak core chat function; sebagian steps 1-baris tanpa data uji konkret.

### Bagian B — Exploratory Testing → **80/100 (A-)**

3 temuan: (1) Internal Notes absen, (2) filter tanggal default ngawur ke 1997 + tak ada quick-preset, (3) RBAC leak agen bisa akses setting sensitif.
**Plus:** format temuan lengkap — kategori, deskripsi, potensi dampak, usulan solusi. RBAC leak = temuan keamanan bernilai tinggi. Ini justru bukti metode exploratory yang benar (cari bug tanpa terikat script).
**Minus:** hanya 3 temuan; nomor loncat (1,3,4 — item 2 hilang); tidak ada severity formal / langkah reproduksi.

### Bagian C — UAT → **55/100 (C)**

4 skenario acceptance end-to-end (multi-agent collab, quick reply handling, CRM sync, analytics review). Alur & expected result jelas dan realistis (mencerminkan journey user nyata).
**Minus besar:** kolom **Actual/Status kosong** — UAT belum dieksekusi atau hasil tidak dicatat. UAT tanpa hasil = rencana, bukan bukti. Nilai tertahan di sini.

### Bagian D — Playwright UI Automation → **65/100 (B-)**  *(revisi naik: +25)*

Dokumen Automation (`Laporan Automation Testing`) mengoreksi penilaian awal. Bukan "3 TC di PDF" — ini **nyata & runnable**:
- **Repo GitHub publik** (`github.com/Fatiahalzahra/Testing_Interview_PT_Lincah`) + README, Node v18+, `npx playwright test`.
- **CLI evidence:** `3 passed (46.5s)` + screenshot terminal.
- TC-01 E2E Flow (Login→Inbox→Quick Reply→Assign) = alur bisnis inti, bukan sekadar navigasi.
**Minus:** hanya 3 skenario; TC-02/TC-03 masih "navigation accessibility" (buka halaman, belum validasi fungsi dalam); tak pakai Page Object seperti standar DB (`.page.js`). Tapi eksekusi terbukti nyata.

### Bagian F — API Automation (Postman + Newman) → **78/100 (B+)**  *(baru dari dok Automation; gantikan penilaian "E" lama)*

Ini yang paling matang secara teknik:
- **Postman Collection** dieksekusi via **Newman CLI** — otomasi nyata, bukan manual.
- **Token Chaining:** token dari Auth Login dipakai dinamis ke endpoint Inbox & Assign Chat — pola API testing tingkat menengah-atas.
- **Evidence:** `6 assertions executed, 0 failed (100% PASSED)`.
- **Konsekuensi verifikasi:** karena Newman lolos, endpoint `/api/v1/auth/login`, `/inbox/list`, `/chat/assign` **kemungkinan besar benar-benar ada & responsif** (Newman tak akan pass di endpoint 404). Risiko "endpoint fiktif" pada penilaian awal **berkurang drastis** — tapi konfirmasi final ke BE tetap disarankan.
**Minus:** hanya 3 skenario POST/GET happy-path; belum ada negative-case otomatis (401/400/422) yang di Bagian E manual justru ada. Manual (E) & automation (F) belum digabung jadi satu suite.

> Catatan: Bagian E (manual API, 10 case POS/NEG) dan Bagian F (automation, 3 case) saling melengkapi — E kuat di coverage negatif, F kuat di eksekusi otomatis + token chaining. Dinilai sebagai satu domain API.

### Bagian G — Improvement Report → **75/100 (B)**

3 usulan teknis: global exception handler (error selalu JSON), refresh token, rate limiting login. Semua valid, berdampak, prioritas jelas.
**Minus:** sheet diduplikasi (di file TSV G & G-2 identik) — cacat penyusunan. Hanya 3 item.

### Bagian H — Testing Strategy → **85/100 (A)**  *(baru — dimensi terkuat)*

Menunjukkan **QA thinking** setara mid-level:
- **Time-crunch (4 jam pre-release):** Risk-Based Testing, fokus Auth/Core Messaging/Assign — argumen *core value* SatuInbox tepat (kalau pesan mati, operasional klien lumpuh).
- **RCA bug critical "pesan gagal ke WA":** severity Critical, cek Network/Console FE + Queue/Worker/Webhook log BE + rate-limit Meta API. **Akurat** — memang arsitektur SatuInbox (RabbitMQ + webhook WhatsApp).
- **Env discrepancy "works on local":** banding `.env`/base-URL/dependency, uji payload presisi via Postman, kirim `.har`. Praktik solid.
- **Test pruning 100/500:** rasio P0 40% / recent-change 35% / high-traffic 15% / bug-prone 10% — matang.
- **Go/No-Go:** blocker vs known-issue jelas.
**Minus:** strategi generik (belum spesifik ke modul SatuInbox tertentu di beberapa poin), tapi untuk technical-test kandidat ini kuat.

---

## 3. Skor Gabungan (rata-rata berbobot antar bagian)

| Bagian | Skor | Bobot | Kontribusi |
|---|---|---|---|
| A — Manual TC | 72 | 30% | 21.6 |
| B — Exploratory | 80 | 12% | 9.6 |
| C — UAT | 55 | 12% | 6.6 |
| D — Playwright | 65 | 12% | 7.8 |
| E+F — API (manual + automation) | 72 | 14% | 10.1 |
| G — Improvement | 75 | 8% | 6.0 |
| H — Testing Strategy | 85 | 12% | 10.2 |
| **Total** | | **100%** | **≈72 / 100 (B)** |

> Rev 3: naik 67→72 setelah dokumen Automation masuk — Playwright terbukti runnable (repo+CLI evidence), API automation Newman+token chaining nyata, dan Bagian H (strategy) jadi dimensi terkuat. E+F digabung sebagai satu domain API (72 = rata E 62 manual-coverage-negatif + F 78 eksekusi otomatis, dibulatkan ke bukti terkuat).

---

## 4. Poin Plus (+) Keseluruhan

1. **Cakupan core-function per fitur kuat** — 5 dari 6 fitur di Bagian A mencakup ≥85% fungsi inti (Login, Kolaborasi, CRM, Quick Reply, Dashboard nyaris lengkap).
2. **Kedalaman tipe uji konsisten** — tiap fitur punya Positive + Negative + Boundary + Error Handling, bukan happy-path saja.
3. **Automation terbukti nyata** — Playwright (repo GitHub + `3 passed 46.5s`) dan API Newman + **Token Chaining** (`6 assertions, 0 failed`). Bukan klaim; ada evidence eksekusi.
4. **Testing Strategy matang** — RBT time-crunch, RCA bug WA yang akurat ke arsitektur, test pruning berbasis rasio, Go/No-Go. Menunjukkan cara berpikir QA, bukan cuma eksekusi.
5. **Exploratory tajam** — RBAC leak & Internal Notes absen, dilaporkan lengkap dengan dampak+solusi.
6. **Failed dilaporkan jujur** — Internal Notes, import/export kontak ditandai Failed, tidak dipaksa PASS.
7. **Multi-layer lengkap** — manual + exploratory + UAT + E2E automation + API automation + strategy.

## 5. Poin Minus (−) Keseluruhan

1. **Inbox/Chat under-tested** — core chat (bubble, timestamp, delivery status, reply, typing, media open) hampir tak tersentuh; ini fitur paling padat di produk.
2. **UAT tanpa hasil eksekusi** — Actual/Status kosong (Bagian C).
3. **Automation dangkal jumlahnya** — Playwright 3 skenario (2 masih navigasi), API automation 3 case happy-path tanpa negative otomatis. Nyata tapi tipis.
4. **Manual & automation API belum disatukan** — Bagian E (negatif) & F (otomatis) terpisah, belum jadi satu suite.
5. **Cacat file** — status `"PASS "` trailing space; sheet G duplikat.

---

## 6. Belum Diverifikasi (butuh handoff)

- Konfirmasi final endpoint `/api/v1/...` ke tim BE / `Memory/Codex-be.md` — risiko turun (Newman pass = endpoint hidup), tapi schema response belum diaudit.
- Repo GitHub `Fatiahalzahra/Testing_Interview_PT_Lincah` belum di-clone/direview kodenya (kualitas spec, selector, assertion).
- Link Google Drive spreadsheet & video belum dibuka.

---

## 7. Kesimpulan

Metode Fatiah konsisten dengan **exploratory/manual testing tanpa PRD** — dan dinilai atas dasar itu. Dalam scope fitur yang ia pilih, **cakupan core function kuat**, kedalaman jenis uji matang, automation **terbukti berjalan** (Playwright CLI pass + Newman token chaining), dan Testing Strategy menunjukkan cara berpikir QA yang paling menonjol dari seluruh deliverable. Kelemahan tersisa: **UAT tanpa hasil**, **Inbox chat under-tested**, dan **volume automation tipis**.

**Skor akhir: ≈72/100 (B)** — kandidat QA dengan fondasi teknik dan cara berpikir yang baik; gap ada di kedisiplinan menutup eksekusi (UAT) dan kedalaman coverage chat.
