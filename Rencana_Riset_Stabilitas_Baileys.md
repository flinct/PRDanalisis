# Rencana Riset & Test Matrix — Stabilitas WhatsApp Unofficial via Baileys

**Untuk:** Tim Developer SatuInbox
**Tanggal:** 3 Juni 2026 · **Versi:** Draft 1.0 · **Status:** Untuk dieksekusi & diverifikasi

---

## 1. Ringkasan & Tujuan

Selama ini penggunaan WhatsApp unofficial dengan library Baileys di SatuInbox diklaim tidak stabil: nomor yang baru di-scan sering tersuspend, dan beberapa nomor tersuspend setelah mengirim beberapa pesan. Dokumen ini menstrukturkan gejala yang dilaporkan menjadi hipotesis yang bisa diuji, mendefinisikan rencana A/B testing yang terukur, serta menetapkan spesifikasi rate limiting, logging suspend, dan event log lifecycle account channel.

**Tujuan riset:**

- Mengidentifikasi **akar penyebab** suspend (root cause) dengan eksperimen terkontrol, bukan asumsi.
- Memisahkan apakah suspend disebabkan **perilaku unofficial automation** (deteksi anti-spam WhatsApp) atau **cara pakai/implementasi** (volume, pola pesan, nomor cold).
- Menetapkan **kebijakan rate limit** outbound yang aman untuk SatuInbox.
- Menetapkan **skema logging** agar setiap suspend bisa dianalisis (kenapa, kapan, di channel mana).
- Menetapkan **event log lifecycle** account channel: created, init, scan, connected, lifetime, disconnected, suspended.

> **Catatan penting (kerangka berpikir):** Baileys adalah library yang mengemulasi WhatsApp Web Multi-Device melalui WebSocket. Suspend hampir selalu merupakan tindakan penegakan anti-spam dari sisi WhatsApp, bukan bug library. Maintainer Baileys sendiri secara eksplisit tidak menganjurkan bulk/automated/broadcast messaging dan menyatakan penggunaan yang melanggar ToS WhatsApp ditanggung sendiri oleh pengguna. Karena itu "stabilitas" harus dipahami sebagai meminimalkan sinyal yang memicu deteksi spam WhatsApp, bukan sekadar mem-patch kode.

---

## 2. Kategorisasi Gejala yang Dilaporkan

| Kode   | Gejala                               | Detail dari laporan                                                                                                                                               |
| ------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **G1** | Suspend tepat setelah connect        | Sesaat setelah scan QR / connect dengan nomor yang di-scan, nomor langsung tersuspend sebelum/segera setelah aktivitas.                                           |
| **G2** | Suspend setelah kirim beberapa chat  | Setelah connect dan mengirim beberapa pesan, nomor tersuspend.                                                                                                    |
| **G3** | Trigger via broadcast ke nomor asing | Initial message (BC) yang dikirim via Baileys ke nomor yang tidak dikenal oleh nomor sender memicu suspend.                                                       |
| **G4** | Trigger via kirim ke nomor dikenal   | Suspend juga muncul saat kirim ke nomor yang sudah dikenal — bisa dengan isi pesan sama, bisa berbeda.                                                            |
| **G5** | Suspend sementara (2 jenis)          | (a) Suspend di WhatsApp Web; (b) Suspend di mobile device. Membatasi pengiriman ke nomor baru, tetapi nomor yang sudah ada di chat sebelumnya masih bisa dikirim. |
| **G6** | BC tidak jadi conversation           | Dari 5 broadcast, hanya 4 yang menjadi conversation. Belum diketahui apakah karena dikirim bersamaan atau sebab lain.                                             |

---

## 3. Faktor Risiko yang Diduga Memicu Suspend

Berdasarkan cara kerja deteksi anti-spam WhatsApp dan praktik umum komunitas, faktor-faktor berikut menjadi variabel yang perlu diuji:

- **Nomor cold / baru** — nomor yang baru didaftarkan atau baru login multi-device dan langsung mengirim ke banyak kontak sangat rentan.
- **Kirim ke nomor tidak dikenal** — mengirim pesan pertama ke nomor yang belum pernah berinteraksi (tidak ada di kontak/percakapan) adalah sinyal spam terkuat.
- **Volume & kecepatan** — banyak pesan dalam waktu singkat, tanpa jeda, tanpa pola manusiawi.
- **Pesan identik (broadcast)** — konten yang persis sama dikirim ke banyak penerima mudah terdeteksi sebagai bulk.
- **Rasio report/block** — jika penerima memblokir atau melaporkan, risiko suspend melonjak, terutama untuk nomor baru.
- **Tidak ada engagement dua arah** — pesan keluar tanpa balasan/percakapan menurunkan "reputasi" nomor.
- **Device/browser fingerprint & presence** — konfigurasi browser pada Baileys (`Browsers.ubuntu` / `macOS`), `markOnlineOnConnect`, dan absennya indikator "typing"/presence bisa memengaruhi.
- **Tidak ada warm-up** — nomor tidak "dipanaskan" bertahap sebelum dipakai outbound volume tinggi.

---

## 4. Hipotesis yang Akan Diuji

| ID     | Hipotesis                                                                                                       | Prediksi jika benar                                                                  | Test terkait |
| ------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| **H0** | Suspend bisa terjadi hanya karena proses login/connect tanpa outbound sama sekali.                              | Nomor tersuspend dalam 24–72 jam meski tidak mengirim pesan.                         | T0           |
| **H1** | Suspend dipicu terutama oleh pengiriman ke nomor BARU/tidak dikenal, bukan oleh Baileys itu sendiri.            | Kirim hanya ke nomor dikenal → tidak/jarang suspend; kirim ke nomor asing → suspend. | T1, T2       |
| **H2** | Broadcast (pesan identik) ke banyak nomor asing lebih cepat memicu suspend daripada pesan yang dipersonalisasi. | Isi pesan bervariasi menurunkan tingkat suspend dibanding isi identik.               | T2, T3       |
| **H3** | Suspend juga terjadi via WhatsApp Web/HP manual untuk pola yang sama (artinya bukan murni Baileys).             | BC manual ke nomor baru via WA Web/HP juga kena suspend.                             | T4, T5       |
| **H4** | Volume & kecepatan tinggi tanpa rate limit meningkatkan probabilitas suspend.                                   | Rate limit + jeda acak menurunkan tingkat suspend pada volume yang sama.             | T2, T3       |
| **H5** | Nomor tanpa warm-up jauh lebih rentan daripada nomor yang dipanaskan bertahap.                                  | Nomor yang di-warm-up bertahan lebih lama / batas kirim lebih tinggi.                | T7           |
| **H6** | BC tidak menjadi conversation (G6) terkait pengiriman simultan / pesan tertahan filter, bukan sekadar error UI. | Mengirim BC bertahap (drip) menaikkan rasio delivered→conversation.                  | T6           |
| **H7** | Konfigurasi socket (browser fingerprint, `markOnlineOnConnect`, presence) memengaruhi ketahanan nomor.          | Variasi konfigurasi menghasilkan perbedaan tingkat suspend yang terukur.             | T8           |

---

## 5. Rencana A/B Testing & Test Matrix

### 5.1 Variabel Eksperimen

- **Channel:** SatuInbox (Baileys) vs WhatsApp Web resmi vs HP (manual).
- **Target penerima:** nomor BARU/tidak dikenal vs nomor yang sudah dikenal (pernah ada percakapan).
- **Isi pesan:** identik (broadcast) vs dipersonalisasi/bervariasi.
- **Volume & rate:** tanpa limit vs dengan rate limit + jeda acak.
- **Warm-up:** nomor cold vs nomor yang sudah di-warm-up.
- **Cara broadcast:** dikirim bersamaan (batch) vs bertahap (drip).
- **Aktivitas outbound:** connect-only tanpa kirim pesan vs kirim pesan.

### 5.2 Prinsip Metodologi

1. Gunakan **beberapa nomor uji** yang setara per skenario (mis. 3–5 nomor) agar hasil tidak bias satu nomor.
2. Ubah **satu variabel pada satu waktu** (controlled experiment); sisanya dibuat konstan.
3. Sediakan **kelompok kontrol** (mis. nomor yang hanya kirim ke kontak dikenal, volume rendah).
4. Catat **waktu sampai suspend** (time-to-suspend) dan **jumlah pesan sebelum suspend** sebagai metrik utama.
5. Wajib jalankan **uji manual via WA Web / HP** untuk pola yang sama (terutama BC ke nomor baru) untuk memisahkan efek Baileys vs efek kebijakan WhatsApp.
6. Gunakan nomor & kontak "dummy" yang Anda kendalikan jika memungkinkan, untuk mengontrol risiko report/block.
7. Definisikan **nomor dikenal** secara konsisten: minimal pernah ada conversation/inbound sebelumnya. Kontak tersimpan dan hasil `onWhatsApp()` harus dicatat sebagai label terpisah, karena nomor valid belum tentu "dikenal".

### 5.3 Test Matrix (siap diisi)

| ID  | Hipotesis | Channel       | Target        | Isi pesan    | Volume/Rate      | Warm-up          | Cara kirim      | Ekspektasi                  | Suspend? | Jenis suspend | Msg sebelum suspend | Time-to-suspend | Delivered→Conv | Catatan                     |
| --- | --------- | ------------- | ------------- | ------------ | ---------------- | ---------------- | --------------- | --------------------------- | -------- | ------------- | ------------------- | --------------- | -------------- | --------------------------- |
| T0  | H0        | SatuInbox     | N/A           | Tidak ada    | 0 pesan          | Cold             | Connect-only    | Tidak suspend 24–72 jam     |          |               |                     |                 |                | Validasi G1 tanpa outbound  |
| T1  | H1        | SatuInbox     | Nomor dikenal | Bervariasi   | Limit + jeda     | Matured          | Drip            | Stabil (kontrol)            |          |               |                     |                 |                |                             |
| T2  | H1,H2     | SatuInbox     | Nomor baru    | Identik (BC) | Tanpa limit      | Cold             | Batch           | Cepat suspend               |          |               |                     |                 |                |                             |
| T3  | H2,H4     | SatuInbox     | Nomor baru    | Bervariasi   | Limit + jeda     | Cold             | Drip            | Lebih tahan dari T2         |          |               |                     |                 |                |                             |
| T4  | H3        | WA Web manual | Nomor baru    | Identik (BC) | Manual           | Cold             | Batch           | Bandingkan vs T2            |          |               |                     |                 |                | Wajib uji manual            |
| T5  | H3        | HP manual     | Nomor baru    | Identik (BC) | Manual           | Cold             | Batch           | Bandingkan vs T2/T4         |          |               |                     |                 |                | Wajib uji manual            |
| T6  | H6        | SatuInbox     | Nomor baru    | Identik      | Limit            | Cold             | Drip (bertahap) | Cek rasio jadi conversation |          |               |                     |                 |                | Jawab G6: 5 BC → brp conv?  |
| T7  | H5        | SatuInbox     | Nomor baru    | Bervariasi   | Warm-up schedule | Warm-up bertahap | Drip            | Bertahan lebih lama         |          |               |                     |                 |                |                             |
| T8  | H7        | SatuInbox     | Nomor baru    | Bervariasi   | Limit + jeda     | Cold             | Drip            | Beda config = beda hasil    |          |               |                     |                 |                | Variasikan browser/presence |

_Pilihan kolom: Suspend? = Y / N / Sebagian · Jenis suspend = WA Web / Mobile device / Sementara / Permanen / Tidak diketahui / N/A_

Catatan untuk G6: bedakan **Broadcast List native WhatsApp** dengan broadcast/fan-out dari SatuInbox. Broadcast List native WhatsApp hanya diterima oleh penerima yang menyimpan nomor sender; ini bisa menjelaskan kasus 5 BC hanya 4 yang menjadi conversation. Untuk SatuInbox, catat per-recipient apakah pesan benar-benar terkirim, delivered, dan berubah menjadi conversation.

---

## 6. Usulan Rate Limiting Outbound (SatuInbox)

Pertanyaan "apakah perlu rate limit outbound?" jawabannya: **ya, sangat disarankan.** Rate limit adalah mitigasi paling langsung terhadap deteksi bulk. Usulan parameter awal (kalibrasi via eksperimen Bagian 5):

- **Jeda antar pesan acak (jitter)** — mis. 8–40 detik, bukan interval tetap, untuk meniru pola manusia.
- **Batas per jam & per hari** yang naik bertahap sesuai umur/warm-up nomor (lihat 6.1).
- **Batas khusus untuk pesan ke nomor BARU** yang jauh lebih ketat daripada ke nomor dikenal.
- **Drip, bukan batch** — hindari mengirim broadcast bersamaan; sebar dalam rentang waktu.
- **Presence sebagai variabel eksperimen** — uji `sendPresenceUpdate('composing')` dan jeda "mengetik" pada T8; jangan anggap sebagai mitigasi pasti sebelum ada data.
- **Hormati hasil cek nomor** — gunakan `onWhatsApp()` untuk memastikan nomor valid sebelum kirim; jangan kirim ke nomor invalid.
- **Circuit breaker** — jika terdeteksi error/disconnect tertentu, hentikan outbound otomatis untuk nomor itu.

### 6.1 Contoh Jadwal Warm-up (untuk dikalibrasi)

| Hari | Maks pesan/hari | Maks ke nomor baru/hari | Catatan                                               |
| ---- | --------------- | ----------------------- | ----------------------------------------------------- |
| 1–2  | 10–20           | 0–5                     | Utamakan balas chat masuk, bangun interaksi dua arah. |
| 3–7  | 20–40           | 5–10                    | Naikkan bertahap; pantau sinyal suspend.              |
| 8–14 | 40–80           | 10–20                   | Stabilkan; isi pesan tetap bervariasi.                |
| 15+  | 80–150+         | 20–40                   | Batas matang; tetap pakai jitter & drip.              |

> Angka di atas adalah titik awal yang konservatif dan **WAJIB dikalibrasi** dengan data eksperimen — bukan jaminan aman.

---

## 7. Spesifikasi Logging Suspend

Agar tiap suspend bisa dianalisis ("kenapa"), setiap kejadian disconnect/suspend harus dilog dengan konteks lengkap. Di Baileys, sinyal utama datang dari event `connection.update` (field `lastDisconnect.error`, biasanya Boom dengan `output.statusCode` / `DisconnectReason`).

| Field                       | Sumber                     | Keterangan                                                                         |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| `event_id` / `timestamp`    | sistem                     | Waktu kejadian (UTC + lokal).                                                      |
| `account_channel_id`        | sistem                     | Nomor / channel yang terdampak.                                                    |
| `disconnect_reason`         | Baileys `DisconnectReason` | loggedOut, restartRequired, connectionClosed, badSession, dll.                     |
| `status_code`               | Boom `output.statusCode`   | Kode numerik dari payload disconnect (401/403/440…).                               |
| `raw_error`                 | `lastDisconnect.error`     | Payload mentah (di-stringify) untuk forensik.                                      |
| `suspend_type`              | klasifikasi                | web / mobile / sementara / permanen / tidak diketahui.                             |
| `last_actions` (N terakhir) | buffer aplikasi            | Aksi terakhir sebelum suspend: ke nomor mana, isi, baru/dikenal, jenis (BC/biasa). |
| `recipient_hashes`          | aplikasi                   | Hash nomor penerima pada aksi terakhir, bukan nomor mentah.                        |
| `message_fingerprint`       | aplikasi                   | Hash konten/template/normalized message untuk mendeteksi pesan identik.            |
| `msgs_sent_in_window`       | metrik                     | Jumlah pesan dalam X menit/jam terakhir.                                           |
| `msgs_to_new_numbers`       | metrik                     | Berapa di antaranya ke nomor baru.                                                 |
| `time_since_connect`        | metrik                     | Jeda sejak connect/scan sampai suspend.                                            |
| `socket_config`             | konfigurasi                | browser, `markOnlineOnConnect`, presence, dll.                                     |

Tambahan: simpan log mentah Baileys pada level `debug` saat investigasi (logger level "debug") agar frame WhatsApp terlihat, lalu turunkan level di produksi. Untuk privacy, hindari menyimpan nomor dan isi pesan mentah di log operasional; gunakan hash/fingerprint, dan simpan raw payload hanya untuk window investigasi terbatas.

---

## 8. Event Log Lifecycle Account Channel

Skema event untuk melacak siklus hidup tiap account channel, dari dibuat hingga tersuspend. "Lifetime" didefinisikan sebagai durasi dari channel berhasil connected hingga disconnected.

| Event          | Definisi                                                         | Field yang dicatat                                                                 |
| -------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `created`      | Record account channel dibuat di sistem.                         | channel_id, owner, msisdn (jika ada), created_at                                   |
| `init`         | Inisialisasi socket Baileys / persiapan auth state.              | channel_id, socket_config, init_at                                                 |
| `scan`         | QR/pairing code di-generate & proses scan.                       | channel_id, method (qr/pairing), scan_at, scan_result                              |
| `connected`    | Koneksi berhasil (`connection = 'open'`). Mulai hitung lifetime. | channel_id, connected_at                                                           |
| `lifetime`     | Durasi connected → disconnected (turunan, bukan event mentah).   | channel_id, connected_at, disconnected_at, duration                                |
| `disconnected` | Koneksi putus (`connection = 'close'`), bisa sengaja/tidak.      | channel_id, disconnected_at, reason, status_code, reconnect (Y/N)                  |
| `suspended`    | Terdeteksi dibatasi/suspend oleh WhatsApp.                       | channel_id, suspended_at, suspend_type, status_code, ref ke log suspend (Bagian 7) |

> **Catatan:** `disconnected` dan `suspended` berbeda. Disconnect bisa terjadi karena restartRequired/koneksi jaringan tanpa suspend; suspend adalah pembatasan dari WhatsApp. Bedakan keduanya lewat `status_code` / `DisconnectReason` agar metrik akurat.

### 8.1 Event Outbound Message

Event outbound diperlukan agar setiap pesan bisa ditelusuri dari queue sampai ack/failure.

| Event                  | Definisi                                      | Field minimum                                                                                  |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `outbound_queued`      | Pesan masuk antrean pengiriman.               | channel_id, recipient_hash, recipient_known_status, message_fingerprint, batch_id, queued_at   |
| `outbound_rate_limited` | Pesan ditahan oleh rate limiter.              | channel_id, recipient_hash, limiter_key, retry_after, reason, created_at                       |
| `outbound_sent`        | Pesan berhasil dikirim ke socket Baileys.     | channel_id, recipient_hash, message_id, message_fingerprint, sent_at                           |
| `outbound_delivered`   | Ack delivered diterima jika tersedia.         | channel_id, recipient_hash, message_id, ack_status, delivered_at                               |
| `outbound_read`        | Ack read diterima jika tersedia.              | channel_id, recipient_hash, message_id, read_at                                                |
| `outbound_failed`      | Pengiriman gagal sebelum/selama proses kirim. | channel_id, recipient_hash, message_id, error_code, error_message, failed_at                   |

### 8.2 Event Broadcast/Fan-out

Broadcast di SatuInbox sebaiknya dicatat sebagai fan-out per recipient agar kasus seperti G6 bisa diaudit.

| Event                        | Definisi                                  | Field minimum                                                                    |
| ---------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- |
| `broadcast.started`          | Batch broadcast mulai dibuat/dijalankan.  | batch_id, channel_id, total_recipients, message_fingerprint, started_at          |
| `broadcast.recipient_queued` | Recipient masuk antrean broadcast.        | batch_id, channel_id, recipient_hash, recipient_known_status, queued_at          |
| `broadcast.recipient_sent`   | Pesan broadcast terkirim ke recipient.    | batch_id, channel_id, recipient_hash, message_id, sent_at                        |
| `broadcast.recipient_failed` | Pengiriman ke recipient gagal.            | batch_id, channel_id, recipient_hash, error_code, error_message, failed_at       |
| `broadcast.completed`        | Batch selesai atau dihentikan.            | batch_id, channel_id, total_sent, total_failed, total_rate_limited, completed_at |

---

## 9. Metrik Keberhasilan

- **Time-to-suspend** — rata-rata waktu/jumlah pesan sebelum suspend per skenario.
- **Suspend rate** — % nomor yang tersuspend per skenario.
- **Delivered→conversation ratio** — untuk menjawab G6 (BC jadi conversation).
- **Survival per warm-up tier** — ketahanan nomor menurut tahap warm-up.
- **Perbandingan channel** — SatuInbox vs WA Web vs HP pada pola identik.

---

## 10. Decision Gate Interpretasi Hasil

Gunakan hasil test matrix untuk membuat keputusan teknis, bukan hanya laporan observasi.

| Kondisi hasil riset                                      | Interpretasi utama                              | Keputusan yang disarankan                                                |
| -------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| WA Web/HP manual juga suspend pada pola yang sama         | Risiko berasal dari policy/behavior WhatsApp     | Batasi cold outbound/broadcast; prioritaskan WhatsApp Business API resmi |
| Hanya SatuInbox/Baileys yang suspend                      | Risiko kemungkinan dari implementasi/session     | Audit socket config, auth lifecycle, queue, rate limit, dan retry logic  |
| T0 connect-only suspend                                  | Masalah mungkin dari nomor, session, atau login  | Jangan lanjut outbound; isolasi nomor dan ulangi dengan nomor pembanding |
| Rate limit + drip menurunkan suspend secara signifikan    | Volume/rate adalah trigger dominan               | Jadikan queue, jitter, dan circuit breaker sebagai default produksi      |
| Delivered tinggi tapi conversation rendah pada broadcast  | Masalah metrik/conversation atau aturan broadcast | Audit ack, definisi conversation, dan syarat kontak menyimpan sender      |
| Suspend tetap tinggi meski guardrail diterapkan           | Use case tidak cocok untuk Baileys unofficial     | Hentikan use case outbound skala besar; migrasi ke channel resmi         |

---

## 11. Risiko & Catatan Kepatuhan

Baileys tidak berafiliasi dengan WhatsApp, dan maintainer-nya secara eksplisit tidak menganjurkan penggunaan untuk spam, bulk, atau automated messaging. Penggunaan unofficial berisiko melanggar Terms of Service WhatsApp, dan suspend/ban adalah konsekuensi yang melekat — tidak ada konfigurasi yang menjaminnya 100% aman. Riset ini bertujuan meminimalkan risiko operasional dan memahami perilaku sistem, bukan menjamin kekebalan. Tim sebaiknya juga mengevaluasi opsi **WhatsApp Business API (Cloud API)** resmi untuk use case broadcast/notifikasi berskala, sebagai jalur yang sah dan stabil.

---

## 12. Langkah Berikutnya

1. Siapkan nomor uji + kontak dummy yang dikendalikan tim.
2. Implementasikan logging suspend (Bagian 7) dan event log channel (Bagian 8) terlebih dulu — tanpa data, eksperimen tidak terukur.
3. Jalankan test matrix (Bagian 5.3), satu variabel per waktu, termasuk uji manual WA Web/HP.
4. Kalibrasi rate limit & warm-up dari hasil eksperimen.
5. Review temuan memakai decision gate (Bagian 10), putuskan kebijakan outbound final, dan evaluasi opsi WhatsApp Business API resmi.

---

_Sumber teknis: Baileys README — WhiskeySockets/Baileys (https://github.com/WhiskeySockets/Baileys)_
