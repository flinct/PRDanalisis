# Analisa & Breakdown — Diagram Flow Pengiriman Barang (LINCAH.ID)

> Sumber: infografis "DIAGRAM FLOW PENGIRIMAN BARANG" (7 step vertical, FM → Sorting → Line Haul → LM → POD → Remittance).

---

## 1. Struktur Flow (7 Step)

| # | Step | Fase Logistik | Aktor Utama | Output Status |
|---|------|--------------|-------------|---------------|
| 1 | Order Masuk | Pre-shipment | Buyer + platform Lincah | Data order tersimpan |
| 2 | Penjemputan Paket | **First Mile (FM)** | Kurir 3PL @ Seller | "Paket di-pickup" |
| 3 | Proses Sortir | **Mid Mile (Hub in)** | Tim gudang 3PL | Timbang ulang + scan-in + sortir |
| 4 | Antar Kota/Hub | **Line Haul** | 3PL (truk/pesawat) | In-transit ke hub tujuan |
| 5 | Last Mile Delivery | **Last Mile (LM)** | Kurir 3PL @ kota tujuan | Out-for-delivery |
| 6 | Paket Diterima | **POD** | Kurir → Penerima | Delivered + foto/ttd |
| 7 | Remittance | Post-shipment | Finance 3PL ↔ LINCAH | Uang & laporan direkonsiliasi |

Happy path COD/non-COD lengkap.

---

## 2. Peran LINCAH.ID vs 3PL

- **LINCAH.ID** = orchestrator/data layer. Terima order → titip ke 3PL → monitor status → terima remitansi COD → forward ke Seller.
- **3PL** = eksekutor fisik. FM, sorting, line haul, LM, POD, collect COD.
- **"Tugas Kita"** = tanggung jawab tim internal LINCAH (monitoring, bukan eksekusi fisik). Sifat **QA/supervisory**, bukan operasional.

---

## 3. Titik Kontrol Internal ("Tugas Kita")

Hanya muncul di **step 2, 3, 5, 6**:

| Step | Tugas | Sifat |
|------|-------|-------|
| 2 FM | Pastikan status update ke mid mile | Status tracking |
| 3 Sorting | Pastikan status update ke mid mile | Status tracking (duplikat step 2) |
| 5 LM | Pastikan SLA + semua terkirim | SLA + delivery assurance |
| 6 POD | Pastikan POD tidak fake | Fraud prevention |

**Step 1, 4, 7 tidak punya "Tugas Kita"** — hanya info-box. Ini gap (lihat §5).

---

## 4. Flow Uang (Step 7 + NOTE COD)

```
Buyer (COD) ──bayar tunai──▶ Kurir 3PL @ step 6
                                     │
                                     ▼
                              3PL kumpul & validasi
                                     │
                        ──potong biaya layanan──
                                     ▼
                              Transfer ke LINCAH.ID
                                     ▼
                       [Rekonsiliasi admin/finance]
                                     ▼
                              Setor ke Seller/Penjual
```

> ⚠️ Di diagram tertulis "LINCAH setorkan kepada 3PL" — **kontradiktif** (uang balik ke pengirimnya). Kemungkinan typo, seharusnya **"Seller/Penjual"**.

---

## 5. Gap & Inkonsistensi

### 🔴 Kritis
1. **Step 7 alur uang salah tulis** — "LINCAH setorkan kepada 3PL" → harusnya **Seller/Penjual**. Ini merusak arti proses remitansi.
2. **Step 3 target status salah** — "update ke mid mile" padahal step 3 SUDAH di mid mile. Harusnya "update ke **line haul**" atau "**sorting complete**".
3. **COD collection missing di step 6** — NOTE bilang "paket COD dibayar dulu", tapi step 6 (POD) tidak menyebut collection uang. Buyer bayar ke siapa & kapan tidak eksplisit di main flow.

### 🟡 Menengah
4. **"Tugas Kita" tidak konsisten** — hilang di step 1, 4, 7. Step 4 (line haul) rawan salah kendaraan tapi tidak ada monitoring internal.
5. **Terminologi "mid mile" tidak didefinisikan** — muncul di tugas, tapi tidak ada step berlabel mid mile. Line haul (step 4) ≈ mid mile? Ambigu.
6. **Step 1 edge case** — otomatis hanya jika seller pakai platform Lincah. Jalur non-Lincah (manual input) tidak digambar.

### 🟢 Minor
7. **Grammar** — step 3 "memastikan **jika**" → harusnya "**bahwa**". Step 6 huruf besar-kecil inkonsisten.
8. **Warna band tidak semantik** — tidak beda FM/MM/LM by color. Peluang untuk group visual.

---

## 6. Yang Hilang di Flow

- **Exception paths**: return-to-sender (RTS), pengiriman gagal (3× attempt), paket rusak/hilang, cancel order.
- **SLA per fase** — angka konkret (FM 1 hari, LH 2 hari, LM 1 hari, dll).
- **Notifikasi buyer/seller** — kapan WA/email dikirim di tiap milestone.
- **Escalation matrix** — siapa dikontak kalau status stuck > X jam per fase.
- **COD failure handling** — buyer nolak bayar / tidak di tempat.
- **Rekonsiliasi timeline** — H+berapa remitansi masuk?

---

## 7. Rekomendasi Perbaikan Cepat

1. Fix teks step 7: "3PL → LINCAH.ID → **Seller**".
2. Fix tugas step 3: "update ke **proses line haul**".
3. Tambah sub-step di step 6 untuk COD: "Kurir terima pembayaran tunai sesuai tagihan".
4. Tambah "Tugas Kita" di step 1 (validasi data order), step 4 (monitor line haul on-time), step 7 (verifikasi remitansi & setor ke seller).
5. Legend warna: FM=hijau, MM/sorting+line haul=biru, LM=oranye, POD/remit=abu. Biar semantik.
6. Sidebar exception flow (RTS, gagal kirim).

---

## 8. Ringkasan Per Step (detail)

### Step 1 — ORDER MASUK
- **Trigger**: Buyer order di Social Media / Website / Marketplace (Tokopedia, Shopee, IG).
- **Sistem**: Auto-capture data pesanan (nama, alamat, no. HP, detail barang) → tersimpan di LINCAH.ID.
- **Prasyarat**: Seller pakai platform Lincah.
- **Gap**: jalur non-Lincah tidak dijelaskan.

### Step 2 — PENJEMPUTAN PAKET (FM)
- Seller pack & siapkan paket.
- Kurir 3PL datang ke pickup point → scan barcode/AWB.
- Status → "Paket telah di-pickup".
- **Tugas Kita**: pastikan status update ke mid mile.

### Step 3 — PROSES SORTIR (Sorting Center)
- Semua paket dari berbagai FM dikumpul di Hub/Gudang.
- Tim 3PL: terima, timbang ulang, scan-in, sortir per kota tujuan.
- **Tugas Kita**: pastikan status update ke mid mile *(redundan/salah target — harusnya line haul)*.

### Step 4 — PENGIRIMAN ANTAR KOTA/HUB (Line Haul)
- Paket dikirim via truk/pesawat ke Hub kota tujuan.
- 3PL pastikan masuk kendaraan benar + status ter-update.
- **Tidak ada "Tugas Kita"** *(gap: rawan salah kendaraan)*.

### Step 5 — LAST MILE DELIVERY
- Paket dari Hub tujuan → kurir last mile.
- Kurir rencana rute → antar satu per satu.
- **Tugas Kita**: pastikan SLA + semua paket terkirim tanpa masalah.

### Step 6 — PAKET DITERIMA (POD)
- Kurir serah paket ke penerima.
- Wajib: tanda tangan (jika perlu) + foto paket (di depan rumah/bersama penerima).
- Status → "Delivered/Terkirim".
- **Tugas Kita**: pastikan POD tidak fake.
- **Missing di flow**: collection uang COD (padahal disebut di NOTE).

### Step 7 — PENYELESAIAN & LAPORAN (Remittance)
- Uang COD terkumpul & divalidasi 3PL.
- 3PL potong biaya layanan → transfer ke LINCAH.ID.
- LINCAH setor ke Seller *(bukan 3PL — koreksi typo)*.
- Rekonsiliasi berkala oleh admin/finance.
- **Tidak ada "Tugas Kita"** *(gap: verifikasi remitansi)*.

---

## 9. NOTE COD (dari infografis)

> Khusus COD, paket harus dibayar terlebih dahulu sesuai tagihan. Tim admin/keuangan lalu melakukan rekonsiliasi antara uang yang disetor dengan paket COD yang terkirim.

Implication: pembayaran terjadi di step 6, rekonsiliasi di step 7. Namun step 6 tidak eksplisit menuliskan langkah collection.

---

*Dokumen ini adalah breakdown analitis dari infografis, bukan PRD/SOP formal. Untuk turunan PRD/SOP/test case QA, lihat dokumen lanjutan (jika sudah dibuat).*
