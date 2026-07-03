# Flow -- Cara Seller Cek Dana Sudah Masuk / Belum

## Tujuan

Flow ini menjelaskan cara seller memverifikasi apakah dana hasil
pengiriman telah masuk ke saldo akun melalui menu **Saldoku → Daftar
Invoice**. Proses ini membantu seller mengecek status pencairan
berdasarkan invoice.

------------------------------------------------------------------------

# Ringkasan Proses

``` text
Login Dashboard
      │
      ▼
Masuk Menu Saldoku
      │
      ▼
Buka Daftar Invoice
      │
      ▼
Atur Filter
      │
      ▼
Export Invoice
      │
      ▼
Buka File Excel
      │
      ▼
Cek Status Invoice
```

------------------------------------------------------------------------

# Breakdown Proses

## STEP 1 -- Login Dashboard

### Tujuan

Masuk ke akun seller.

### Aktivitas

-   Login menggunakan Email/Username.
-   Masukkan Password.

### Output

-   Dashboard seller berhasil diakses.

------------------------------------------------------------------------

## STEP 2 -- Buka Menu Saldoku

### Tujuan

Masuk ke modul keuangan.

### Aktivitas

-   Klik **Saldoku** pada sidebar.

### Output

-   Halaman Saldoku terbuka.

------------------------------------------------------------------------

## STEP 3 -- Pilih Daftar Invoice

### Tujuan

Melihat seluruh invoice pencairan.

### Aktivitas

-   Klik menu **Daftar Invoice**.

### Output

-   Daftar invoice ditampilkan.

------------------------------------------------------------------------

## STEP 4 -- Atur Filter

### Tujuan

Mempermudah pencarian invoice.

### Filter yang tersedia

-   Tanggal
-   Jasa Kirim
-   Status Invoice
-   Metode Pembayaran

Klik **Terapkan Filter** setelah memilih filter.

### Output

-   Data invoice sesuai filter.

------------------------------------------------------------------------

## STEP 5 -- Export Invoice

### Tujuan

Mengunduh data invoice.

### Aktivitas

-   Klik **Export Invoice**.
-   Tunggu proses download selesai.

### Output

-   File Excel berhasil diunduh.

------------------------------------------------------------------------

## STEP 6 -- Verifikasi Dana

### Tujuan

Memastikan status pencairan dana.

### Aktivitas

-   Buka file Excel.
-   Periksa kolom **Status Invoice**.

### Interpretasi Status

  Status        Arti
  ------------- --------------------------------------------
  Lunas         Dana sudah masuk ke Saldoku.
  Belum Lunas   Dana belum masuk / masih proses pencairan.

------------------------------------------------------------------------

# Decision Tree

``` text
Login
 │
 ▼
Saldoku
 │
 ▼
Daftar Invoice
 │
 ▼
Filter
 │
 ▼
Export
 │
 ▼
Buka Excel
 │
 ▼
Status Invoice?
 │
 ├── Lunas
 │      └── Dana sudah masuk
 │
 └── Belum Lunas
        └── Dana belum masuk / proses pencairan
```

------------------------------------------------------------------------

# Actor

## Seller

-   Login ke dashboard.
-   Memfilter invoice.
-   Mengunduh laporan.
-   Memverifikasi status dana.

## Sistem

-   Menampilkan data invoice.
-   Menghasilkan file Excel.
-   Menyimpan status invoice.

------------------------------------------------------------------------

# Data yang Dibutuhkan

## Input

-   Akun seller
-   Rentang tanggal (opsional)
-   Jasa kirim
-   Metode pembayaran
-   Status invoice

## Output

-   File Excel invoice
-   Status pencairan dana

------------------------------------------------------------------------

# Kelebihan Flow

-   Verifikasi dana dapat dilakukan secara mandiri.
-   Mendukung pencarian menggunakan filter.
-   Dapat diarsipkan dalam bentuk Excel.
-   Memudahkan rekonsiliasi keuangan.

------------------------------------------------------------------------

# Rekomendasi

Pisahkan menjadi beberapa SOP:

1.  SOP Login Dashboard Seller
2.  SOP Akses Menu Saldoku
3.  SOP Filter Invoice
4.  SOP Export Invoice
5.  SOP Verifikasi Status Dana
6.  SOP Rekonsiliasi Invoice
