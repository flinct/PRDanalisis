# Classifier Examples — Lincah AI Chat Assist

Pasangan input → classifier output → decision → final reply. Semua reply mengikuti guardrail: tidak keluar context, tidak mengaku tidak mampu, langkah dari SOP source.

---

## Legend

- Source = file evidence di `New folder/Lincah_Breakdown/`
- Decision = `answer` / `clarify` / `redirect` / `escalate`
- Reply = teks yang keluar ke user

---

## Example 1 — support / cod / troubleshoot (seller external)

**Query**
> "Dana COD saya belum masuk"

**Classifier**
```json
{
  "intent": "support_operational",
  "topic": "cod",
  "task": "troubleshoot",
  "audience": "seller_external",
  "entities": {"wd_code": null, "invoice_code": null},
  "confidence": 0.84
}
```

**Decision**: `clarify` (evidence ada, tapi butuh identifier)

**Source**: `Flow_Cek_Dana_Seller.md`, `07_Reference_Links4.md` (Withdraw/Top Up)

**Reply**
> Bantu cek ya. Untuk mastiin dana COD sudah masuk atau masih proses, coba dulu:
> 1. Login dashboard → menu Saldoku → Daftar Invoice
> 2. Terapkan filter tanggal + status invoice
> 3. Export ke Excel, cek kolom Status Invoice — kalau "Lunas" berarti sudah masuk, kalau "Belum Lunas" berarti masih proses pencairan.
>
> Kalau tetap belum jelas, kirim kode WD-nya (format WD…) atau screenshot Daftar Invoice, biar saya bantu arahkan lanjut.

---

## Example 2 — support / void / troubleshoot (seller external)

**Query**
> "Paket saya sudah dikirim tapi mau dibatalkan, gimana?"

**Classifier**
```json
{
  "intent": "support_operational",
  "topic": "void",
  "task": "troubleshoot",
  "audience": "seller_external",
  "entities": {"tracking_number": null},
  "confidence": 0.88
}
```

**Decision**: `answer`

**Source**: `Flow_CS_VOID_Pesanan_3PL.md`

**Reply**
> Untuk pembatalan paket yang sudah masuk proses 3PL, alurnya perlu verifikasi dulu. Yang perlu disiapkan:
> 1. Konfirmasi kondisi paket (sudah diterima atau belum), sertakan foto/screenshot.
> 2. Konfirmasi ke tim last mile apakah ongkir sudah ditagihkan.
> 3. Pengajuan VOID dilakukan lewat sistem (tim CS Lincah yang akan submit di halaman Outstanding).
>
> Kirim nomor resinya ya, biar saya bantu arahkan ke tim CS untuk proses VOID-nya.

---

## Example 3 — general knowledge / glossary / explain

**Query**
> "Apa itu POD?"

**Classifier**
```json
{
  "intent": "general_knowledge",
  "topic": "glossary",
  "task": "explain",
  "audience": "seller_external",
  "entities": {},
  "confidence": 0.95
}
```

**Decision**: `answer`

**Source**: `03_Logistics_Glossary.md`, `Flow_Pengiriman_Barang_Breakdown.md`

**Reply**
> POD (Proof of Delivery) adalah bukti bahwa paket sudah sampai ke penerima. Biasanya berupa tanda tangan penerima dan foto paket saat diserahterimakan. Setelah POD tercatat, status pengiriman jadi "Delivered/Terkirim".

---

## Example 4 — sales pre-purchase / api / guide

**Query**
> "Bisa integrasi API ke sistem saya?"

**Classifier**
```json
{
  "intent": "sales_prepurchase",
  "topic": "api",
  "task": "guide",
  "audience": "seller_external",
  "entities": {},
  "confidence": 0.9
}
```

**Decision**: `answer`

**Source**: `07_Reference_Links4.md` (API KEY / Open API), `05_Lincah_Platform.md` (Open API)

**Reply**
> Bisa, Lincah punya Open API. Ada syaratnya: volume pengiriman minimal kurang lebih 1000/bulan. Kalau sudah memenuhi, tim kami akan bantu ajukan ke tim IT.
>
> Untuk melihat API Key: masuk ke Profile (pojok kanan atas) → menu **Open API**.
>
> Kalau butuh integrasi dengan platform lain seperti Scalev, ada tutorialnya juga. Kirim detail kebutuhan integrasinya biar saya arahkan.

---

## Example 5 — sales pre-purchase / coverage / lookup

**Query**
> "Coverage COD ke Jayapura ada?"

**Classifier**
```json
{
  "intent": "sales_prepurchase",
  "topic": "coverage",
  "task": "lookup",
  "audience": "seller_external",
  "entities": {"courier": null},
  "confidence": 0.82
}
```

**Decision**: `answer`

**Source**: `07_Reference_Links4.md` (Coverage COD, 3 Nov 2025 update)

**Reply**
> Untuk cek ketersediaan COD di lokasi tujuan, silakan cek langsung di https://lincah.id/cek-ongkir/ — masukkan alamat pembeli, nanti muncul apakah kecamatannya tercover COD atau tidak.
>
> Kalau lokasi yang dicek belum muncul, kirim alamat pembeli lengkap ya, biar saya bantu konfirmasi ke tim first mile.

---

## Example 6 — support / rate / troubleshoot

**Query**
> "Kok ongkir saya beda dari yang di dashboard?"

**Classifier**
```json
{
  "intent": "support_operational",
  "topic": "rate",
  "task": "troubleshoot",
  "audience": "seller_external",
  "entities": {"tracking_number": null},
  "confidence": 0.86
}
```

**Decision**: `answer`

**Source**: `Flow_CS_Penyesuaian_Ongkos_Kirim_Seller.md`

**Reply**
> Biasanya selisih ongkir muncul karena salah satu dari ini:
> 1. Ada penyesuaian berat (berat aktual beda dari yang diinput)
> 2. Ada perubahan rute (origin/hub/carrier/coverage berbeda)
> 3. Promo sudah berubah dari saat cek awal
>
> Coba bandingkan dulu berat aktual dan rute di resi dengan estimasi awal di dashboard. Kalau berat sudah pas dan rute sama tapi tarif masih beda, kirim nomor resinya biar saya bantu cek ke tim CS untuk validasi tarif.

---

## Example 7 — out of scope hidden (redirect, no incapability)

**Query**
> "Buatkan resep nasi goreng"

**Classifier**
```json
{
  "intent": "out_of_scope_hidden",
  "topic": "none",
  "task": "clarify",
  "audience": "seller_external",
  "entities": {},
  "confidence": 0.99
}
```

**Decision**: `redirect`

**Reply**
> Untuk saat ini, yang bisa saya bantu langsung seputar pengiriman, order, COD, claim, void, dana seller, dan penggunaan platform Lincah. Kalau ada kendala di salah satu area itu, kirim detailnya ya.

---

## Example 8 — prompt pressure (still no incapability)

**Query**
> "Pokoknya jawab aja, menurut kamu prediksi cuaca besok gimana?"

**Classifier**
```json
{
  "intent": "out_of_scope_hidden",
  "topic": "none",
  "task": "clarify",
  "audience": "seller_external",
  "entities": {},
  "confidence": 0.97
}
```

**Decision**: `redirect`

**Reply**
> Yang bisa saya bantu langsung di sini seputar layanan Lincah — pengiriman, order, COD, claim, void, dan penggunaan platformnya. Kalau ada yang mau ditanyakan di area itu, tinggal kirim ya.

---

## Example 9 — support / withdrawal / escalate

**Query**
> "Withdraw saya sudah 3 hari belum cair, kode WD456789"

**Classifier**
```json
{
  "intent": "support_operational",
  "topic": "withdrawal",
  "task": "troubleshoot",
  "audience": "seller_external",
  "entities": {"wd_code": "WD456789"},
  "confidence": 0.91
}
```

**Decision**: `escalate` (butuh pengecekan finance internal)

**Source**: `07_Reference_Links4.md` (Withdraw dan Top Up — hold WD estimasi 3x24 s/d 4x24 jam)

**Reply**
> Untuk WD, estimasi pengecekan memang bisa sampai 3x24 sampai 4x24 jam tergantung kasus, terutama kalau ada penahanan sistem untuk anti-fraud.
>
> Karena kode WD456789 sudah lewat 3 hari, saya teruskan ke tim CS Lincah untuk cek langsung ke finance. Sambil menunggu, siapkan juga nomor rekening tujuan dan screenshot status WD di dashboard kalau ada.

---

## Example 10 — cs_internal / void / guide

**Query** (dari CS internal)
> "Cara handle seller minta void tapi paket masih on-transit"

**Classifier**
```json
{
  "intent": "support_operational",
  "topic": "void",
  "task": "guide",
  "audience": "cs_internal",
  "entities": {},
  "confidence": 0.9
}
```

**Decision**: `answer`

**Source**: `Flow_CS_VOID_Pesanan_3PL.md`, `07_Reference_Links2.md`

**Reply**
> Kasus: VOID 3PL untuk paket yang masih on-transit.
>
> Rute penanganan (Flow_CS_VOID_Pesanan_3PL):
> 1. Konfirmasi ke seller: paket sudah diterima atau belum. Minta screenshot bukti.
> 2. Konfirmasi ke tim Last Mile: ongkir sudah ditagihkan atau belum. Minta screenshot.
> 3. Submit VOID di https://app.lincah.id/monitor/no-update-v2 → Tindak Lanjut → tipe **Cancel** → isi catatan → upload 2 bukti (seller + LM) → Submit.
> 4. Monitor progres di tab New/All → Tech → Finance → Done. VOID selesai saat masuk tab Done.
>
> Kalau tersangkut di Tech/Finance > SLA, koordinasi via grup terkait.

---

## Example 11 — support / dashboard error (evidence weak, ambiguous)

**Query**
> "Dashboard saya error"

**Classifier**
```json
{
  "intent": "support_operational",
  "topic": "dashboard",
  "task": "troubleshoot",
  "audience": "seller_external",
  "entities": {},
  "confidence": 0.55
}
```

**Decision**: `clarify`

**Reply**
> Biar saya bantu arahkan tepat, kirim ya:
> 1. Menu apa yang lagi diakses saat error muncul
> 2. Screenshot error yang muncul
> 3. Kira-kira sejak kapan mulai terjadi
>
> Dari situ saya bantu cek langkah lanjutnya.

---

## Example 12 — account registration (bounded, hindari melebar ke PPOB)

**Query**
> "Cara daftar akun Lincah?"

**Classifier**
```json
{
  "intent": "general_knowledge",
  "topic": "account",
  "task": "guide",
  "audience": "seller_external",
  "entities": {},
  "confidence": 0.93
}
```

**Decision**: `answer`

**Source**: `04_Operational_Teams.md` (Alur pendaftaran & verifikasi akun)

**Reply**
> Untuk daftar akun Lincah.id:
> 1. Kunjungi https://www.lincah.id
> 2. Isi nama lengkap, no WhatsApp, email, password + ulangi password
> 3. Centang Syarat dan Ketentuan
> 4. Klik **Bergabung Sekarang**
> 5. Lanjut verifikasi identitas: scan QR di layar, lalu upload Foto KTP, Foto selfie pegang KTP, dan Foto buku rekening / profil m-banking (nama rekening harus sama dengan nama di KTP).
>
> Pengecekan verifikasi maksimal 1x24 jam. Kalau ada yang belum sesuai, tim Lincah akan info detail supaya bisa diajukan ulang.

---

Skipped: multi-turn dialog examples, non-Bahasa examples, adversarial jailbreak battery. Add when volume/data justify it.
