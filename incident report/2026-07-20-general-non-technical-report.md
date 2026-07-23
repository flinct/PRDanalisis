# Laporan Insiden — SatuInbox (20 Juli 2026)

**Untuk:** Manajemen, Tim Produk, Customer Success
**Tanggal:** 2026-07-20
**Status:** Sudah pulih. Perbaikan akar masalah belum di-deploy.

---

## Ringkasan Singkat

Hari ini SatuInbox mengalami **dua gangguan berturut-turut** yang membuat aplikasi lambat lalu sempat berhenti total menerima pesan masuk. Semua tenant terdampak. Tidak ada data pelanggan yang hilang.

| Insiden | Waktu | Dampak yang dirasakan user | Durasi |
|---|---|---|---|
| #1 — Conversation lambat | 10:00 – 10:55 WIB | Daftar percakapan blank / loading lama saat agent buka inbox | ~10–15 menit terasa di UI |
| #2 — SatuInbox blank total | 12:10 WIB | Aplikasi tidak menerima pesan dari channel manapun (WA, IG, FB, dll.) | Sampai tim melakukan restart RabbitMQ |

Kedua insiden **berkaitan tapi tidak sama**. Insiden #2 lebih parah dan menunjukkan masalah arsitektur yang lebih dalam.

---

## Insiden #1 — Conversation Lambat (10:00)

### Apa yang terjadi
Salah satu tenant menerima pesan masuk dalam jumlah tinggi dalam waktu singkat. Sistem yang seharusnya cukup untuk menangani load ini malah **memperbesar sendiri beban itu** melalui reaksi berantai internal antara backend dan frontend.

### Yang dilihat user
- Panel percakapan blank atau muter loading 10–15 menit
- Beberapa request timeout di sisi browser (1 menit lalu di-retry)
- Semua tenant lain ikut lambat, bukan hanya tenant yang trafiknya tinggi

### Penyebab (bahasa non-teknis)
1. **Satu pesan masuk → dikirim ke banyak "saluran notifikasi" sekaligus** ke aplikasi user.
2. Aplikasi user (browser) **mendengar dua saluran** untuk pesan yang sebenarnya sama, jadi kerjanya dobel.
3. Setiap kali counter (jumlah percakapan belum dibaca) berubah, browser **memaksa cek ulang ke server 1 detik kemudian**, padahal data sudah dikirim lewat notifikasi tadi. Ini bikin request `/count` menembak terus-menerus.
4. Kalau koneksi sempat putus dan tersambung lagi, browser **me-refresh SEMUA data**, bukan hanya bagian yang relevan.
5. Karena server & database dipakai bersama semua tenant, tekanan dari 1 tenant menular ke semua.

### Dampak
- SEV-2 (degradasi lintas tenant, bukan outage total)
- Agent kesulitan handle percakapan selama window insiden
- Kemungkinan SLA breach untuk beberapa percakapan
- Tidak ada data hilang

### Recovery
Insiden mereda sendiri saat gelombang pesan masuk turun. Tidak perlu intervensi manual.

---

## Insiden #2 — SatuInbox Blank Total (12:10)

### Apa yang terjadi
Ada **company baru yang baru join** ke SatuInbox. Mereka scan **6 nomor WhatsApp operasional sekaligus**, masing-masing punya history 2000–3000 chat per hari.

SatuInbox otomatis melakukan **sync history chat** untuk 6 nomor itu. Volume yang di-sync:

- **12.886 percakapan baru**
- **144.000+ pesan**
- masuk dalam ~1 jam 42 menit awal window sync

Volume ini menyebabkan **antrian internal RabbitMQ tersumbat**. Karena antrian sync history dan antrian pesan realtime **berada di 1 jalur yang sama**, pesan masuk baru dari channel manapun (semua tenant, semua platform) **menunggu di belakang sync history yang menumpuk**.

### Yang dilihat user
- SatuInbox blank total di semua fitur (bukan hanya percakapan)
- Pesan dari customer via WhatsApp, Instagram, Facebook, dll. **tidak muncul di agent inbox**
- Ticket module ikut mati
- Sistem tidak pulih sendiri

### Penyebab (bahasa non-teknis)
1. **1 jalur antrian dipakai untuk 2 tujuan berbeda** — sync history yang jumlahnya ratusan ribu pesan, dan pesan realtime yang jumlahnya sedikit tapi urgent. Ketika sync besar datang, realtime ikut tertahan.
2. **Sistem memperlakukan setiap pesan history sebagai pesan baru realtime** — jadi untuk setiap dari 144k pesan, sistem menjalankan proses lengkap: assignment ke agent, update counter, kirim notifikasi socket, sync ke ticket. Ini pekerjaan yang tidak perlu untuk pesan lama.
3. **Sync 6 nomor jalan bersamaan tanpa pembatasan kecepatan** — semua 6 channel meng-antri di jalur yang sama sekaligus.
4. **Semua masalah insiden #1 tetap aktif** dan sekarang berlaku pada skala 100× lebih besar (144k × 2 saluran notifikasi = 288k event socket).

### Dampak
- **SEV-1 (outage total)**
- Semua channel inbound stop diproses selama window insiden
- Customer eksternal kirim pesan → agent tidak lihat → risiko customer experience buruk lintas tenant
- 12886 percakapan tersimpan di database tapi **status assignment ke agent belum diverifikasi lengkap** — beberapa mungkin belum dapat agent
- Ticket module ikut down
- Sistem TIDAK pulih sendiri

### Recovery
Tim melakukan **restart RabbitMQ manual** untuk membersihkan antrian yang tersumbat. Setelah restart, sistem kembali normal. Ini berarti sebagian pesan sync yang belum sempat diproses **kemungkinan hilang** dari antrian (tapi data yang sudah sempat masuk ke MongoDB tetap aman — 12886 percakapan + 144k pesan tersimpan).

---

## Hubungan Antara Kedua Insiden

Insiden #2 adalah **versi lebih parah** dari insiden #1, dengan tambahan masalah arsitektur baru.

| Aspek | Insiden #1 (10:00) | Insiden #2 (12:10) |
|---|---|---|
| Pemicu | Pesan realtime tinggi 1 tenant | Sync history 6 channel company baru |
| Volume | Tidak spesifik, cukup bikin conn 794 | 12886 percakapan + 144k pesan |
| Yang bottleneck | Notifikasi socket + refresh UI | Antrian RabbitMQ tersumbat |
| Blast radius | Semua tenant lambat | Semua tenant + semua channel stop |
| Pulih | Otomatis | Butuh restart manual |

**Kalau insiden #1 sudah diperbaiki:** insiden #2 tetap akan terjadi tapi hanya "sync lambat", tidak sampai "aplikasi blank total".

**Kalau insiden #2 saja yang diperbaiki:** insiden #1 tetap akan terjadi berulang setiap ada trafik tinggi.

**Kesimpulan:** dua-duanya harus diperbaiki. Prioritas insiden #2 lebih tinggi karena SEV-1.

---

## Yang Sedang & Akan Dilakukan

### Perbaikan cepat (target minggu ini)
1. **Pisahkan antrian sync history dari antrian pesan realtime** → mencegah sync besar mengunci pesan realtime tenant lain
2. **Fast-path untuk sync history** → sistem tidak memperlakukan pesan lama sebagai pesan realtime baru (skip assignment, skip counter per-pesan, skip notifikasi socket per-pesan)
3. **Rate limit publisher sync** → sync jalan dengan kecepatan aman, tidak burst ratusan ribu pesan sekaligus
4. **Perbaikan sisi frontend:** hilangkan refresh counter yang tidak perlu, batasi refresh saat reconnect, kurangi retry timeout

### Perbaikan struktural (target 1–2 bulan)
1. Circuit breaker consumer → sistem otomatis pause saat database melambat, tidak perlu restart manual
2. Monitoring proaktif → alert saat antrian menumpuk, sebelum meledak
3. Review desain sync history → apakah harus lewat pipeline realtime sama sekali, atau lewat jalur import terpisah?
4. Studi isolasi database per tenant → menghilangkan blast radius lintas tenant

---

## Yang Perlu Kami Konfirmasi

Sebelum finalisasi perbaikan, kami butuh info:
1. Durasi pasti insiden #2 dari 12:10 sampai RMQ direstart (untuk hitung MTTR)
2. Apakah ada agent tenant company baru yang laporan menerima ratusan percakapan sekaligus di inbox mereka?
3. Berapa banyak dari 12886 percakapan itu yang **belum ter-assign** ke agent (butuh verifikasi manual di database)?
4. Config RabbitMQ produksi — konfirmasi struktur antrian untuk fix #1 di atas

---

## Yang Bisa Disampaikan ke Customer

**Untuk company baru yang trigger insiden #2:**
- History chat mereka sudah masuk dan tersimpan
- Namun sebagian percakapan mungkin belum otomatis ter-assign ke agent — perlu mereka cek dan assign manual, atau tim SatuInbox bantu batch assign
- Sync history untuk kasus onboarding besar ke depan akan kami handle dengan mode terpisah agar tidak menggangu operasional

**Untuk tenant lain yang terdampak:**
- Pesan customer yang masuk saat window blank kemungkinan tertahan di sisi channel (WA, IG, dll) dan akan retry — tapi ada window sekitar 30–60 menit di mana beberapa pesan mungkin perlu di-follow up manual
- Kami sudah identifikasi akar masalah, fix sedang disiapkan
- Kompensasi/komunikasi ke end-customer merupakan keputusan business — tim komunikasi silakan follow up

---

## Referensi Teknis (untuk engineering)

- Detail teknis insiden #1: `incident report/2026-07-20-1000-conversation-event-storm.md`
- Detail teknis insiden #2: `incident report/2026-07-20-1210-rmq-sync-history-saturation.md`

---

**Disiapkan oleh:** Dany Christian (Product Manager)
**Engineering Lead:** Naftal Yunior
**Distribusi:** Manajemen, Product, Customer Success, Engineering leadership
