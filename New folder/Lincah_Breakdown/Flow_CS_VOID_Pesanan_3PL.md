# Flow CS -- Cara Membatalkan Pesanan yang Sudah Dikirim (VOID dari 3PL)

## Tujuan

Flow ini digunakan oleh Customer Service (CS) untuk menangani permintaan
pembatalan (VOID) terhadap pesanan yang **sudah masuk ke proses
pengiriman** oleh pihak 3PL. Tujuan utama flow ini adalah memastikan
pembatalan hanya dilakukan apabila memenuhi syarat serta seluruh bukti
pendukung telah diverifikasi.

------------------------------------------------------------------------

# Ringkasan Proses

``` text
Seller meminta VOID
        │
        ▼
Konfirmasi paket sudah diterima?
        │
        ▼
Konfirmasi ke LM apakah ongkir ditagihkan?
        │
        ▼
Ajukan VOID melalui halaman Outstanding
        │
        ▼
Monitor progres (Tech / Finance)
        │
        ▼
Status Done
```

------------------------------------------------------------------------

# Breakdown Proses

## STEP 1 -- Konfirmasi ke Seller

### Tujuan

Memastikan kondisi fisik paket sebelum pengajuan pembatalan dilakukan.

### Aktivitas

-   Konfirmasi kepada seller apakah paket sudah diterima.
-   Minta screenshot atau bukti fisik paket.

### Output

-   Screenshot bukti paket.

------------------------------------------------------------------------

## STEP 2 -- Konfirmasi ke Last Mile (LM)

### Tujuan

Memastikan status biaya pengiriman dari pihak 3PL.

### Aktivitas

-   Hubungi tim Last Mile.
-   Konfirmasi apakah ongkos kirim sudah ditagihkan oleh jasa kirim.
-   Minta screenshot sebagai bukti.

### Output

-   Screenshot konfirmasi biaya ongkir.

------------------------------------------------------------------------

## STEP 3 -- Pengajuan VOID

### Tujuan

Mengajukan permintaan pembatalan melalui sistem.

### Lokasi

    https://app.lincah.id/monitor/no-update-v2

### Langkah

1.  Klik **Tindak Lanjut**.
2.  Pilih tipe permohonan **Cancel**.
3.  Isi catatan sesuai hasil konfirmasi seller.
4.  Upload dua dokumen pendukung:
    -   Bukti seller.
    -   Bukti konfirmasi LM.
5.  Klik **Submit**.

------------------------------------------------------------------------

## STEP 4 -- Monitoring Progress

### Tujuan

Memastikan pengajuan diproses hingga selesai.

### Status

-   New / All
-   Tech
-   Finance
-   Done

### Keterangan

Apabila masih berada pada tab **Tech** atau **Finance**, berarti
pengajuan masih diproses oleh tim terkait.

------------------------------------------------------------------------

## STEP 5 -- Selesai

### Kondisi Berhasil

-   Status berpindah ke tab **Done**.
-   Resi muncul pada daftar Done.
-   VOID dinyatakan berhasil.

------------------------------------------------------------------------

# Decision Tree

``` text
Seller meminta pembatalan
            │
            ▼
Paket sudah diterima?
            │
            ▼
Konfirmasi ke LM
            │
            ▼
Ongkir sudah ditagihkan?
            │
            ▼
Ajukan VOID
            │
            ▼
Upload bukti
            │
            ▼
Monitoring
            │
      ┌─────┴─────┐
      │           │
   Diproses     Done
      │           │
      ▼           ▼
Menunggu      Selesai
```

------------------------------------------------------------------------

# Actor

## Seller

-   Mengajukan permintaan pembatalan.
-   Memberikan bukti fisik paket.

## Customer Service

-   Melakukan verifikasi awal.
-   Berkoordinasi dengan LM.
-   Mengajukan VOID.
-   Memonitor status.

## Last Mile (LM)

-   Memberikan konfirmasi status ongkir.
-   Menyediakan bukti screenshot.

## Tech / Finance

-   Memproses permohonan VOID.
-   Mengubah status hingga selesai.

------------------------------------------------------------------------

# Data yang Dibutuhkan

## Dari Seller

-   Nomor resi
-   Screenshot atau bukti paket

## Dari LM

-   Screenshot status penagihan ongkir

## Sistem

-   Halaman Outstanding / No Update
-   Form permohonan Cancel

------------------------------------------------------------------------

# Output

  Tahap               Output
  ------------------- --------------------------
  Konfirmasi Seller   Bukti paket
  Konfirmasi LM       Bukti ongkir
  Submit              Permohonan VOID tercatat
  Monitoring          Status Tech / Finance
  Selesai             Status Done

------------------------------------------------------------------------

# Kelebihan Flow

-   Seluruh permohonan memiliki bukti pendukung.
-   Menghindari pembatalan tanpa validasi.
-   Memastikan koordinasi antara CS, LM, dan tim internal.
-   Status pengajuan dapat dipantau secara transparan.

------------------------------------------------------------------------

# Rekomendasi

Pisahkan proses ini menjadi beberapa SOP yang lebih kecil:

1.  SOP Verifikasi Permintaan VOID
2.  SOP Konfirmasi Last Mile
3.  SOP Pengajuan VOID pada Sistem
4.  SOP Monitoring Progress VOID
5.  SOP Penyelesaian VOID
