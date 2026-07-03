# Flow CS -- Penyesuaian Ongkos Kirim Seller

## Tujuan

Flow ini digunakan oleh Customer Service (CS) untuk menangani komplain
seller terkait adanya penyesuaian ongkos kirim. Pendekatan yang
digunakan adalah eliminasi penyebab secara berurutan sehingga hanya
kasus yang benar-benar merupakan anomali yang diteruskan ke proses
penyesuaian tarif.

------------------------------------------------------------------------

# Alur Utama

``` text
Seller Komplain
        │
        ▼
Cek Penyesuaian Berat
        │
        ├── Ya
        │     ├── Edukasi Seller
        │     ├── Seller setuju?
        │     │      ├── Ya → Selesai
        │     │      └── Tidak
        │     │             └── Minta bukti dimensi
        │     │                     ↓
        │     │               Verifikasi Internal
        │
        └── Tidak
               ↓
      Cek Perubahan Rute
               │
               ├── Ya
               │     └── Edukasi Seller
               │
               └── Tidak
                      ↓
               Cek Promo
                      ↓
             Bandingkan Tarif
                      │
          ┌───────────┴───────────┐
          │                       │
        Sama                  Berbeda
          │                       │
   Edukasi Seller        Input Sheet
                          Penyesuaian Rate
```

------------------------------------------------------------------------

# Breakdown Proses

## STEP 1 -- Validasi Berat

### Tujuan

Menentukan apakah perubahan ongkir disebabkan oleh perubahan berat
aktual paket.

### Pemeriksaan

-   Cek dashboard.
-   Apakah terdapat penyesuaian berat?

### Jika YA

-   Edukasi seller mengenai berat terbaru.
-   Konfirmasi apakah seller menyatakan berat tidak sesuai.

#### Seller Setuju

-   Proses selesai.

#### Seller Tidak Setuju

Minta bukti:

-   Panjang paket
-   Lebar paket
-   Tinggi paket

Selanjutnya dilakukan verifikasi internal sesuai SOP.

------------------------------------------------------------------------

## STEP 2 -- Validasi Perubahan Rute

Jika tidak terdapat perubahan berat.

### Pemeriksaan

-   Apakah terdapat perubahan rute pengiriman?

Contoh:

-   Origin berubah
-   Hub berubah
-   Carrier berubah
-   Coverage berubah

### Jika YA

-   Edukasi seller bahwa perubahan rute memengaruhi ongkos kirim.

------------------------------------------------------------------------

## STEP 3 -- Validasi Promo

Jika bukan karena berat maupun rute.

### Parameter yang dibandingkan

-   Alamat pembeli
-   Alamat penjual
-   Jasa kirim
-   Metode pembayaran (COD / Non-COD)
-   Pickup / Drop-off

Semua parameter harus sama dengan data pada resi seller.

------------------------------------------------------------------------

## STEP 4 -- Validasi Tarif

Bandingkan:

-   Tarif pada Dashboard
-   Tarif pada Resi Seller

### Tarif Sama

Kemungkinan:

-   Promo sudah berubah
-   Seller salah melihat tarif

Tindakan:

-   Edukasi seller.

### Tarif Berbeda

Tindakan:

-   Input data ke sheet **Penyesuaian Rate All 3PL**.
-   Lakukan proses penyesuaian tarif sesuai prosedur.

------------------------------------------------------------------------

# Decision Tree

``` text
Seller Komplain
        │
        ▼
Ada Penyesuaian Berat?
        │
 ┌──────┴───────┐
 │              │
YA            TIDAK
 │              │
 ▼              ▼
Edukasi     Ada Perubahan Rute?
 │              │
 │       ┌──────┴─────┐
 │       │            │
 │      YA         TIDAK
 │       │            │
 │       ▼            ▼
 │   Edukasi      Cek Promo
 │                     │
 │                     ▼
 │              Bandingkan Tarif
 │                     │
 │        ┌────────────┴────────────┐
 │        │                         │
 │      Sama                    Berbeda
 │        │                         │
 │   Edukasi Seller      Input Sheet Rate
 │
 ▼
END
```

------------------------------------------------------------------------

# Actor

## Seller

-   Melaporkan komplain ongkir.
-   Memberikan bukti dimensi apabila diperlukan.

## Customer Service

-   Validasi berat.
-   Validasi rute.
-   Validasi promo.
-   Validasi tarif.
-   Memberikan edukasi kepada seller.

## Internal Team

-   Melakukan verifikasi dimensi.
-   Melakukan validasi tarif.
-   Memproses penyesuaian rate.

------------------------------------------------------------------------

# Data yang Dibutuhkan

## Dashboard

-   Berat aktual
-   Rute
-   Ongkir
-   Promo
-   Pickup

## Seller

-   Nomor resi
-   Foto paket
-   Bukti ukuran paket
-   Bukti ongkir

------------------------------------------------------------------------

# Output

  Kondisi         Hasil
  --------------- --------------------------------------
  Berat berubah   Edukasi seller
  Rute berubah    Edukasi seller
  Promo berubah   Edukasi seller
  Tarif berbeda   Input Sheet Penyesuaian Rate All 3PL

------------------------------------------------------------------------

# Kelebihan Flow

-   Menggunakan proses eliminasi penyebab.
-   Mengurangi eskalasi yang tidak diperlukan.
-   Hanya anomali tarif yang diteruskan ke proses penyesuaian.

------------------------------------------------------------------------

# Rekomendasi

Pisahkan flow ini menjadi beberapa SOP agar lebih mudah dipelihara:

1.  SOP Validasi Berat Paket
2.  SOP Validasi Perubahan Rute
3.  SOP Validasi Promo
4.  SOP Penyesuaian Rate All 3PL
