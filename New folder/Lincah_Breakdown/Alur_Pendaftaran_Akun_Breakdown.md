# Analisa & Breakdown — Alur Pendaftaran Akun LINCAH.ID

> Sumber: infografis "ALUR PENDAFTARAN AKUN lincah.id" (5 step horizontal, visit → form → T&C → submit → success).

---

## 1. Struktur Flow (5 Step)

| # | Step | Aksi User | Output |
|---|------|-----------|--------|
| 1 | Kunjungi Website | Buka `https://www.lincah.id` | Landing page |
| 2 | Isi Data Diri | Input 5 field | Form terisi |
| 3 | Syarat & Ketentuan | Centang checkbox T&C | Consent granted |
| 4 | Klik Tombol | Tekan "Bergabung Sekarang" | Submit registrasi |
| 5 | Pendaftaran Berhasil | — | Akun aktif, akses layanan |

---

## 2. Field di Step 2 (Isi Data Diri)

| Field | Type | Validasi (terlihat) |
|-------|------|---------------------|
| Nama Lengkap | text | — |
| No WhatsApp | text/tel | — |
| Email Address | email | — |
| Password | password + toggle eye | — |
| Ulangi Password | password + toggle eye | — |

**Tidak ada indikator**: password rule, strength meter, mismatch warning, email/WA format check.

---

## 3. Layanan Post-Register (Step 5)

Grid 6 layanan → **PPOB (Payment Point Online Bank)**:

- Pulsa & Data
- Paket Internet
- Token Listrik (PLN)
- Tagihan (PDAM/BPJS/kartu kredit/dll)
- Voucher Game
- Lainnya

Bukan logistics/kirim paket.

---

## 4. ⚠️ Cross-Check dengan Diagram Sebelumnya (Logistics 3PL)

Diagram pertama = **LINCAH.ID sebagai orchestrator logistics 3PL** (FM/Sorting/Line Haul/LM/POD/Remittance).
Diagram kedua = **LINCAH.ID sebagai PPOB aggregator** (pulsa, listrik, tagihan).

### Ada 3 hipotesa:
| Hipotesa | Penjelasan | Likelihood |
|----------|------------|-----------|
| (a) Pivot/Rebrand | Dulu logistics → sekarang PPOB (atau sebaliknya) | Perlu cek homepage |
| (b) Super-app | Satu brand, dua vertikal (logistics + PPOB) — logistics disembunyikan di "Lainnya" | Mungkin |
| (c) Dua produk beda brand sama | Unlikely | Rendah |

### Rekomendasi verifikasi
- Buka `https://www.lincah.id` cek dashboard aktual.
- Konfirmasi ke stakeholder: infografis logistics & PPOB **current di waktu bersamaan**?
- Cek apakah item "Lainnya" di grid step 5 = pintu ke modul kirim paket.

---

## 5. Gap & Missing Steps

### 🔴 Kritis (Security & Data Integrity)

1. **Tidak ada verifikasi WhatsApp/OTP** — No WA dikumpulkan tapi tak divalidasi. Rawan input palsu.
2. **Tidak ada verifikasi email** — tak ada link confirm / magic link. Email bisa fiktif.
3. **Tidak ada CAPTCHA / anti-bot** — rawan bot registration & abuse.
4. **Password rule tidak dispesifikasi** — tak ada min length, complexity, common-password check.
5. **Rate limiting tidak disebut** — bisa di-spam signup dari 1 IP.

### 🟡 Menengah (UX & Compliance)

6. **Mismatch password tidak ada indikator inline** — user baru tahu error setelah submit.
7. **Password strength meter absent** — user tak tahu kekuatan password.
8. **Consent tidak granular** — cuma 1 checkbox T&C. Tidak terpisah:
   - Privacy Policy
   - Marketing/promo opt-in
   - Data sharing dgn 3PL / mitra PPOB
9. **Error state tidak digambar** — invalid email, WA format salah, email sudah terdaftar, dll.
10. **Footer klaim "menjaga privasi & keamanan"** tapi flow tidak menunjukkan mekanismenya (encryption, 2FA opsi, dll).

### 🟢 Minor (UX / Convenience)

11. **Tidak ada SSO** — Google/Apple/Facebook login absen.
12. **Tidak ada opsi register via mobile app** — cuma web.
13. **Tidak ada "Sudah punya akun? Login"** link di flow.
14. **Field "Ulangi Password" redundan** kalau ada eye toggle — bisa dipertimbangkan single-field pattern.
15. **Tidak ada progress indicator** di form (5 field terasa panjang tanpa step visual).

---

## 6. Yang Hilang di Flow (worth ditambahkan)

- **Step OTP WA / verifikasi email** (idealnya antara step 4 & 5).
- **Post-register onboarding**: setup toko, isi saldo, tutorial pertama.
- **Error/retry paths**: email duplicate → "sudah terdaftar, login?".
- **Password reset flow** (link "Lupa Password?").
- **Deactivation / delete account** (compliance PDP Indonesia).
- **Referral code field** (kalau ada program referral).
- **Business vs Personal account type** (kalau lincah.id juga untuk seller/mitra).

---

## 7. Rekomendasi Perbaikan

### Prioritas tinggi
1. **Tambah OTP WhatsApp** sebelum akun aktif (industry standard PPOB Indonesia — DANA/OVO/GoPay semua pakai).
2. **Tambah email verification** (link confirm).
3. **Password policy eksplisit**: min 8 char, kombinasi huruf+angka, tampilkan aturan di bawah field.
4. **Inline validation**: mismatch password, format email/WA, real-time.
5. **CAPTCHA** (hCaptcha / reCAPTCHA / Cloudflare Turnstile).

### Prioritas menengah
6. **Pisah consent**: T&C, Privacy Policy, Marketing (opt-in default off).
7. **Strength meter** + toggle password visibility (sudah ada eye icon, tinggal tambah meter).
8. **Error state UI** untuk tiap field.
9. **Link "Sudah punya akun? Masuk"** di step 2.

### Prioritas rendah
10. **SSO Google/Apple** untuk friction reduction.
11. **Referral code** (optional field).
12. **Account type selector** (Personal/Business) kalau relevan dengan logistics vertikal.

---

## 8. Ringkasan Per Step (detail)

### Step 1 — Kunjungi Website
- URL: `https://www.lincah.id`
- Trigger: user browsing / iklan / referral.
- **Missing**: tidak menyebut opsi mobile app / PWA.

### Step 2 — Isi Data Diri
- 5 field, semua required (assumed).
- Password + Ulangi Password + eye toggle.
- **Missing**: validation inline, strength meter, rule display.

### Step 3 — Syarat & Ketentuan
- Card berisi teks S&K (placeholder di gambar).
- 1 checkbox: "Saya telah membaca dan menyetujui Syarat dan Ketentuan".
- **Missing**: link ke dokumen S&K & Privacy Policy actual, consent terpisah untuk marketing.

### Step 4 — Klik Tombol
- CTA merah "Bergabung Sekarang".
- **Missing**: loading state, error handling, CAPTCHA gate.

### Step 5 — Pendaftaran Berhasil
- Success screen + 6 icon layanan (PPOB).
- **Missing**: verifikasi tahap (OTP/email), CTA next-step (isi saldo, verifikasi identitas, kunjungi dashboard).

---

## 9. Klaim Footer

> "Lincah.id berkomitmen untuk menjaga privasi dan keamanan data pengguna"

Klaim ini **tidak tercermin di flow**. Untuk konsisten, minimal harus ada:
- Verifikasi (OTP/email)
- Password policy eksplisit
- Anti-bot
- Consent granular
- HTTPS badge / trust marker

---

## 10. Cross-Reference

Lihat juga: `Flow_Pengiriman_Barang_Breakdown.md` (diagram logistics LINCAH.ID) — **perlu klarifikasi apakah kedua flow ini current bersamaan (super-app) atau salah satunya deprecated (pivot)**. Ini pengaruh besar ke scope PRD/produk.

---

*Dokumen ini adalah breakdown analitis dari infografis, bukan PRD/SOP formal.*
