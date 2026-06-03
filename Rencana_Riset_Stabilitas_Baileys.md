# Rencana Riset & Test Matrix — Stabilitas WhatsApp Unofficial via Baileys

**Untuk:** Tim Developer SatuInbox
**Tanggal:** 3 Juni 2026 · **Versi:** Draft 1.1 · **Status:** Untuk dieksekusi & diverifikasi

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

| Kode | Gejala | Detail dari laporan |
| --- | --- | --- |
| **G1** | Suspend tepat setelah connect | Sesaat setelah scan QR / connect dengan nomor yang di-scan, nomor langsung tersuspend sebelum/segera setelah aktivitas. |
| **G2** | Suspend setelah kirim beberapa chat | Setelah connect dan mengirim beberapa pesan, nomor tersuspend. |
| **G3** | Trigger via broadcast ke nomor asing | Initial message (BC) yang dikirim via Baileys ke nomor yang tidak dikenal oleh nomor sender memicu suspend. |
| **G4** | Trigger via kirim ke nomor dikenal | Suspend juga muncul saat kirim ke nomor yang sudah dikenal — bisa dengan isi pesan sama, bisa berbeda. |
| **G5** | Suspend sementara (2 jenis) | (a) Suspend di WhatsApp Web; (b) Suspend di mobile device. Membatasi pengiriman ke nomor baru, tetapi nomor yang sudah ada di chat sebelumnya masih bisa dikirim. |
| **G6** | BC tidak jadi conversation | Dari 5 broadcast, hanya 4 yang menjadi conversation. Belum diketahui apakah karena dikirim bersamaan atau sebab lain. |

---

## 3. Faktor Risiko & Pola Pemicu Suspend

Faktor pemicu dibagi dua kelompok: **pola perilaku pengiriman** (3.1) dan **faktor akun & infrastruktur** (3.2). Tiap faktor diberi ID (F1, F2, …) dan **bobot risiko** heuristik (skala 1–5) untuk dipakai dalam simulasi interaksi di 3.3. Bobot ini adalah titik awal yang **wajib dikalibrasi** dengan data eksperimen (Bagian 5 & 9), bukan konstanta yang sudah tervalidasi.

### 3.1 Pola Perilaku Pengiriman

| ID | Faktor | Penjelasan | Bobot |
| --- | --- | --- | --- |
| **F1** | Kirim ke nomor baru/asing (first-contact) | Pesan pertama ke nomor yang belum pernah berinteraksi — sinyal spam terkuat. | 3 |
| **F2** | New-conversation velocity tinggi | Banyak **first-contact unik** per jam/hari. Berbeda dari total volume: yang dihitung adalah jumlah percakapan baru yang dibuka, bukan jumlah pesan. | 4 |
| **F3** | Volume & kecepatan tinggi tanpa jeda | Banyak pesan dalam waktu singkat, ritme tidak manusiawi (machine-gun, 24/7). | 3 |
| **F4** | Pesan identik / broadcast | Konten persis sama dikirim ke banyak penerima — mudah terdeteksi sebagai bulk. | 2 |
| **F5** | Konten berisiko | Berisi link/shortlink, atau kata kunci promosi/pinjol/judi/crypto, atau media forwarded berulang. | 3 |
| **F6** | Kirim ke nomor tidak terdaftar WA | Banyak target gagal `onWhatsApp()` — pola "list tembak" klasik. | 2 |
| **F7** | Tanpa rate limit / batch | Kirim borongan tanpa throttle/jeda. | 3 |
| **F8** | Tanpa warm-up | Nomor langsung dipakai outbound volume tinggi tanpa pemanasan bertahap. | 2 |
| **F9** | Block/report dari penerima | Feedback negatif dari penerima. Pemicu **tercepat** dan bersifat **pengganda** (lihat aturan di 3.3). | 5 |
| **F10** | Operasi grup massal | Mass-add ke grup, membuat banyak grup, abuse broadcast list. | 2 |
| **F11** | Tanpa engagement dua arah | Pesan keluar tanpa balasan/percakapan — menurunkan "reputasi" nomor. | 2 |

### 3.2 Faktor Akun & Infrastruktur

| ID | Faktor | Penjelasan | Bobot |
| --- | --- | --- | --- |
| **F12** | Nomor cold / baru | Baru didaftarkan atau baru login multi-device. | 3 |
| **F13** | Nomor VoIP / virtual | Bukan SIM fisik asli — jauh lebih rentan. | 3 |
| **F14** | Nomor daur ulang / bekas banned | Reputasi buruk melekat pada nomor. | 4 |
| **F15** | IP datacenter / VPN | Kirim dari server/VPN, bukan IP residensial. | 2 |
| **F16** | Geolokasi IP ≠ region SIM | Mismatch lokasi server vs region nomor (mis. SIM +62, IP luar negeri). | 2 |
| **F17** | Profil kosong | Tanpa nama, foto, atau verifikasi business profile. | 1 |
| **F18** | Reconnect / re-scan loop & multi-session | Sering putus-sambung, scan QR berulang, atau satu nomor di banyak session/server paralel. | 2 |
| **F19** | Manajemen auth/session buruk | `creds.update` tidak dipersist konsisten → re-sync berulang, pesan gagal sampai. | 2 |
| **F20** | Fleet correlation | Banyak nomor berperilaku identik dari infrastruktur/IP yang sama — bisa di-suspend berjamaah. | 3 |
| **F21** | Fingerprint/presence tidak manusiawi | Konfigurasi browser & presence statis, tanpa pola "typing"/online yang wajar. | 1 |

> **Interaksi bersifat multiplikatif, bukan sekadar penjumlahan.** Nomor VoIP cold (F12+F13) + IP datacenter (F15) + first-contact massal berisi link (F1+F2+F5) menghasilkan risiko jauh lebih tinggi daripada jumlah masing-masing faktor berdiri sendiri. Block/report (F9) mempercepat suspend secara drastis.

### 3.3 Simulasi Interaksi Antar Faktor

Model skor sederhana untuk memperkirakan tingkat risiko sebuah skenario: **jumlahkan bobot semua faktor yang aktif**, lalu petakan ke tier. Tujuannya bukan prediksi presisi, melainkan alat bantu prioritas dan komunikasi risiko sebelum data eksperimen masuk.

#### 3.3.1 Tier Risiko

| Skor total | Tier | Interpretasi |
| --- | --- | --- |
| 0–6 | **Rendah** | Pola mirip pengguna wajar. Suspend tidak diharapkan. |
| 7–12 | **Sedang** | Ada beberapa sinyal. Pantau ketat, batasi outbound ke nomor baru. |
| 13–19 | **Tinggi** | Kombinasi sinyal kuat. Suspend cukup mungkin dalam jam–hari. |
| ≥ 20 | **Kritis** | Pola spam jelas. Suspend sangat mungkin & cepat. |

> **Aturan pengganda:** jika **F9 (block/report) aktif**, naikkan **satu tier** dari skor mentahnya. Block dini dari penerima dapat memicu suspend tanpa memandang skor faktor lain.

#### 3.3.2 Skenario Simulasi

| Skenario | Faktor aktif | Skor | Tier | Gejala yang dijelaskan |
| --- | --- | --- | --- | --- |
| **S0 — Kontrol aman** | (tidak ada faktor risiko: nomor matured, SIM asli, IP residensial, kirim ke kontak lama, isi bervariasi, rate limit, warm-up) | 0 | Rendah | — (baseline T1) |
| **S1 — Campuran moderat** | F1(3) + F4(2) + F8(2) | 7 | Sedang | G2 ringan |
| **S2 — Outbound agresif (Baileys)** | F1(3) + F2(4) + F3(3) + F4(2) + F7(3) + F8(2) + F12(3) | 20 | Kritis | G2, G3, G5 |
| **S3 — Broadcast spam klasik** | F1(3) + F2(4) + F4(2) + F5(3) + F6(2) + F7(3) + F8(2) + F12(3) | 22 | Kritis | G3, G6 |
| **S4 — Infra buruk + broadcast** | F13(3) + F14(4) + F15(2) + F1(3) + F2(4) + F4(2) + F5(3) + F7(3) + F8(2) + F20(3) | 29 | Kritis (suspend sangat cepat) | G2, G3 |
| **S5 — Connect-only (jelaskan G1)** | F12(3) + F14(4) + F15(2) + F16(2) + F18(2) + F19(2) | 15 | Tinggi | G1 — nomor bekas banned + infra datacenter bisa suspend **tanpa kirim pesan** (validasi via H0/T0) |
| **S6 — Efek block/report** | Basis F1(3) + F4(2) + F8(2) = 7 (Sedang) **+ F9(5)** → 12, lalu **aturan pengganda → naik ke Tinggi** | 12 → Tinggi | Tinggi | G4, G5 — suspend cepat walau volume rendah |

**Cara baca:** S2 dan S3 menjelaskan kenapa broadcast ke nomor baru tanpa warm-up/limit hampir pasti suspend (G2/G3). S4 menunjukkan kombinasi infrastruktur buruk + broadcast adalah kondisi paling berbahaya. S5 menjelaskan suspend yang muncul tanpa outbound (G1) — yang akan diuji terpisah lewat H0/T0. S6 menggambarkan kenapa skenario "sedang" pun bisa langsung suspend begitu ada block/report dari penerima (G4/G5).

> Bobot, tier, dan skor di atas **heuristik dan untuk dikalibrasi**. Setelah data eksperimen terkumpul (Bagian 9), bobot sebaiknya disetel ulang — idealnya lewat analisis regresi/korelasi antara faktor aktif dan time-to-suspend/suspend rate — sehingga model menjadi data-driven, bukan tebakan.

---

## 4. Hipotesis yang Akan Diuji

| ID | Hipotesis | Prediksi jika benar | Test terkait |
| --- | --- | --- | --- |
| **H0** | Suspend bisa terjadi hanya karena proses login/connect tanpa outbound sama sekali. | Nomor tersuspend dalam 24–72 jam meski tidak mengirim pesan. | T0 |
| **H1** | Suspend dipicu terutama oleh pengiriman ke nomor BARU/tidak dikenal, bukan oleh Baileys itu sendiri. | Kirim hanya ke nomor dikenal → tidak/jarang suspend; kirim ke nomor asing → suspend. | T1, T2 |
| **H2** | Broadcast (pesan identik) ke banyak nomor asing lebih cepat memicu suspend daripada pesan yang dipersonalisasi. | Isi pesan bervariasi menurunkan tingkat suspend dibanding isi identik. | T2, T3 |
| **H3** | Suspend juga terjadi via WhatsApp Web/HP manual untuk pola yang sama (artinya bukan murni Baileys). | BC manual ke nomor baru via WA Web/HP juga kena suspend. | T4, T5 |
| **H4** | Volume & kecepatan tinggi tanpa rate limit meningkatkan probabilitas suspend. | Rate limit + jeda acak menurunkan tingkat suspend pada volume yang sama. | T2, T3 |
| **H5** | Nomor tanpa warm-up jauh lebih rentan daripada nomor yang dipanaskan bertahap. | Nomor yang di-warm-up bertahan lebih lama / batas kirim lebih tinggi. | T7 |
| **H6** | BC tidak menjadi conversation (G6) terkait pengiriman simultan / pesan tertahan filter, bukan sekadar error UI. | Mengirim BC bertahap (drip) menaikkan rasio delivered→conversation. | T6 |
| **H7** | Konfigurasi socket (browser fingerprint, `markOnlineOnConnect`, presence) memengaruhi ketahanan nomor. | Variasi konfigurasi menghasilkan perbedaan tingkat suspend yang terukur. | T8 |
| **H8** | New-conversation velocity (F2) memprediksi suspend lebih kuat daripada total volume pesan (F3). | Pada total pesan yang sama, banyak first-contact unik → suspend lebih cepat. | T9 |
| **H9** | Block/report dini dari penerima (F9) memicu suspend tercepat, independen dari volume. | Sedikit block di jam-jam awal → suspend walau volume rendah. | T10 |
| **H10** | Konten berisiko (F5: link/kata kunci promosi) menaikkan suspend rate dibanding teks polos. | Pesan berisi link → suspend lebih tinggi dibanding teks polos serupa. | T11 |
| **H11** | Jenis nomor & reputasi IP (F13/F14/F15) menurunkan ketahanan dibanding SIM asli + IP residensial. | Nomor VoIP / IP datacenter → time-to-suspend lebih pendek. | T12 |
| **H12** | Reconnect/re-scan loop & multi-session paralel (F18) menaikkan risiko suspend. | Loop/multi-session → suspend naik dibanding session stabil. | T13 |

---

## 5. Rencana A/B Testing & Test Matrix

### 5.1 Variabel Eksperimen

- **Channel:** SatuInbox (Baileys) vs WhatsApp Web resmi vs HP (manual).
- **Target penerima:** nomor BARU/tidak dikenal vs nomor yang sudah dikenal (pernah ada percakapan).
- **Isi pesan:** identik (broadcast) vs dipersonalisasi/bervariasi.
- **Jenis konten:** teks polos vs berisi link/kata kunci promosi.
- **Volume & rate:** tanpa limit vs dengan rate limit + jeda acak.
- **New-conversation velocity:** jumlah first-contact unik per jam (rendah vs tinggi) pada total pesan yang sama.
- **Warm-up:** nomor cold vs nomor yang sudah di-warm-up.
- **Cara broadcast:** dikirim bersamaan (batch) vs bertahap (drip).
- **Jenis nomor & IP:** SIM asli + IP residensial vs VoIP/virtual + IP datacenter.
- **Stabilitas session:** session stabil vs reconnect loop / multi-session paralel.
- **Aktivitas outbound:** connect-only tanpa kirim pesan vs kirim pesan.

### 5.2 Prinsip Metodologi

1. Gunakan **beberapa nomor uji** yang setara per skenario (mis. 3–5 nomor) agar hasil tidak bias satu nomor.
2. Ubah **satu variabel pada satu waktu** (controlled experiment); sisanya dibuat konstan.
3. Sediakan **kelompok kontrol** (mis. nomor yang hanya kirim ke kontak dikenal, volume rendah).
4. Catat **waktu sampai suspend** (time-to-suspend) dan **jumlah pesan sebelum suspend** sebagai metrik utama.
5. Wajib jalankan **uji manual via WA Web / HP** untuk pola yang sama (terutama BC ke nomor baru) untuk memisahkan efek Baileys vs efek kebijakan WhatsApp.
6. Gunakan nomor & kontak "dummy" yang Anda kendalikan jika memungkinkan, untuk mengontrol risiko report/block.
7. Definisikan **nomor dikenal** secara konsisten: minimal pernah ada conversation/inbound sebelumnya. Kontak tersimpan dan hasil `onWhatsApp()` harus dicatat sebagai label terpisah, karena nomor valid belum tentu "dikenal".
8. Catat **faktor risiko aktif (F1–F21)** dan **skor simulasi (3.3)** untuk tiap baris uji, agar hasil aktual bisa dibandingkan dengan prediksi model dan dipakai mengkalibrasi bobot.

### 5.3 Test Matrix (siap diisi)

| ID | Hipotesis | Channel | Target | Isi pesan | Volume/Rate | Warm-up | Cara kirim | Ekspektasi | Suspend? | Jenis suspend | Msg sebelum suspend | Time-to-suspend | Delivered→Conv | Catatan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T0 | H0 | SatuInbox | N/A | Tidak ada | 0 pesan | Cold | Connect-only | Tidak suspend 24–72 jam | | | | | | Validasi G1/S5 tanpa outbound |
| T1 | H1 | SatuInbox | Nomor dikenal | Bervariasi | Limit + jeda | Matured | Drip | Stabil (kontrol) | | | | | | Baseline S0 |
| T2 | H1,H2 | SatuInbox | Nomor baru | Identik (BC) | Tanpa limit | Cold | Batch | Cepat suspend | | | | | | Mirip S2 |
| T3 | H2,H4 | SatuInbox | Nomor baru | Bervariasi | Limit + jeda | Cold | Drip | Lebih tahan dari T2 | | | | | | |
| T4 | H3 | WA Web manual | Nomor baru | Identik (BC) | Manual | Cold | Batch | Bandingkan vs T2 | | | | | | Wajib uji manual |
| T5 | H3 | HP manual | Nomor baru | Identik (BC) | Manual | Cold | Batch | Bandingkan vs T2/T4 | | | | | | Wajib uji manual |
| T6 | H6 | SatuInbox | Nomor baru | Identik | Limit | Cold | Drip (bertahap) | Cek rasio jadi conversation | | | | | | Jawab G6: 5 BC → brp conv? |
| T7 | H5 | SatuInbox | Nomor baru | Bervariasi | Warm-up schedule | Warm-up bertahap | Drip | Bertahan lebih lama | | | | | | |
| T8 | H7 | SatuInbox | Nomor baru | Bervariasi | Limit + jeda | Cold | Drip | Beda config = beda hasil | | | | | | Variasikan browser/presence |
| T9 | H8 | SatuInbox | Nomor baru (banyak unik) | Bervariasi | Volume tetap, limit | Cold | Drip | Velocity tinggi → suspend lebih cepat | | | | | | Bandingkan vs T3 (volume sama, unik sedikit) |
| T10 | H9 | SatuInbox | Nomor baru (dummy yg report) | Bervariasi | Volume rendah, limit | Cold | Drip | Block dini → suspend tercepat | | | | | | Gunakan kontak dummy yang sengaja block/report |
| T11 | H10 | SatuInbox | Nomor baru | Identik + link | Limit | Cold | Drip | Konten link → suspend lebih tinggi | | | | | | Bandingkan vs T3 (tanpa link) |
| T12 | H11 | SatuInbox (VoIP + IP DC) | Nomor baru | Bervariasi | Limit | Cold | Drip | VoIP/IP DC → time-to-suspend pendek | | | | | | Bandingkan vs SIM asli + IP residensial |
| T13 | H12 | SatuInbox | Nomor dikenal | Bervariasi | Limit | Matured | Reconnect loop / multi-session | Loop/multi-session → suspend naik | | | | | | Variasikan: session stabil vs loop/2 session |

_Pilihan kolom: Suspend? = Y / N / Sebagian · Jenis suspend = WA Web / Mobile device / Sementara / Permanen / Tidak diketahui / N/A_

Catatan untuk G6: bedakan **Broadcast List native WhatsApp** dengan broadcast/fan-out dari SatuInbox. Broadcast List native WhatsApp hanya diterima oleh penerima yang menyimpan nomor sender; ini bisa menjelaskan kasus 5 BC hanya 4 yang menjadi conversation. Untuk SatuInbox, catat per-recipient apakah pesan benar-benar terkirim, delivered, dan berubah menjadi conversation.

---

## 6. Usulan Rate Limiting Outbound (SatuInbox)

Pertanyaan "apakah perlu rate limit outbound?" jawabannya: **ya, sangat disarankan.** Rate limit adalah mitigasi paling langsung terhadap deteksi bulk. Usulan parameter awal (kalibrasi via eksperimen Bagian 5):

- **Jeda antar pesan acak (jitter)** — mis. 8–40 detik, bukan interval tetap, untuk meniru pola manusia.
- **Batas per jam & per hari** yang naik bertahap sesuai umur/warm-up nomor (lihat 6.1).
- **Batas khusus untuk pesan ke nomor BARU** yang jauh lebih ketat daripada ke nomor dikenal.
- **Batas new-conversation velocity** — plafon jumlah first-contact unik per jam/hari, terpisah dari plafon total pesan (sejalan dengan F2/H8).
- **Drip, bukan batch** — hindari mengirim broadcast bersamaan; sebar dalam rentang waktu.
- **Presence sebagai variabel eksperimen** — uji `sendPresenceUpdate('composing')` dan jeda "mengetik" pada T8; jangan anggap sebagai mitigasi pasti sebelum ada data.
- **Hormati hasil cek nomor** — gunakan `onWhatsApp()` untuk memastikan nomor valid sebelum kirim; jangan kirim ke nomor invalid (sejalan dengan F6).
- **Circuit breaker** — jika terdeteksi error/disconnect tertentu, atau lonjakan block/report (F9), hentikan outbound otomatis untuk nomor itu.

### 6.1 Contoh Jadwal Warm-up (untuk dikalibrasi)

| Hari | Maks pesan/hari | Maks ke nomor baru/hari | Catatan |
| --- | --- | --- | --- |
| 1–2 | 10–20 | 0–5 | Utamakan balas chat masuk, bangun interaksi dua arah. |
| 3–7 | 20–40 | 5–10 | Naikkan bertahap; pantau sinyal suspend. |
| 8–14 | 40–80 | 10–20 | Stabilkan; isi pesan tetap bervariasi. |
| 15+ | 80–150+ | 20–40 | Batas matang; tetap pakai jitter & drip. |

> Angka di atas adalah titik awal yang konservatif dan **WAJIB dikalibrasi** dengan data eksperimen — bukan jaminan aman.

---

## 7. Spesifikasi Logging Suspend

Agar tiap suspend bisa dianalisis ("kenapa"), setiap kejadian disconnect/suspend harus dilog dengan konteks lengkap. Di Baileys, sinyal utama datang dari event `connection.update` (field `lastDisconnect.error`, biasanya Boom dengan `output.statusCode` / `DisconnectReason`).

| Field | Sumber | Keterangan |
| --- | --- | --- |
| `event_id` / `timestamp` | sistem | Waktu kejadian (UTC + lokal). |
| `account_channel_id` | sistem | Nomor / channel yang terdampak. |
| `disconnect_reason` | Baileys `DisconnectReason` | loggedOut, restartRequired, connectionClosed, badSession, dll. |
| `status_code` | Boom `output.statusCode` | Kode numerik dari payload disconnect (401/403/440…). |
| `raw_error` | `lastDisconnect.error` | Payload mentah (di-stringify) untuk forensik. |
| `suspend_type` | klasifikasi | web / mobile / sementara / permanen / tidak diketahui. |
| `active_risk_factors` | aplikasi | Daftar faktor F1–F21 yang aktif saat kejadian + skor simulasi (3.3). |
| `last_actions` (N terakhir) | buffer aplikasi | Aksi terakhir sebelum suspend: ke nomor mana, isi, baru/dikenal, jenis (BC/biasa). |
| `recipient_hashes` | aplikasi | Hash nomor penerima pada aksi terakhir, bukan nomor mentah. |
| `message_fingerprint` | aplikasi | Hash konten/template/normalized message untuk mendeteksi pesan identik. |
| `new_conversation_count_window` | metrik | Jumlah first-contact unik dalam X menit/jam terakhir (F2). |
| `block_report_signals` | metrik | Indikasi block/report dari penerima jika terdeteksi (F9). |
| `msgs_sent_in_window` | metrik | Jumlah pesan dalam X menit/jam terakhir. |
| `msgs_to_new_numbers` | metrik | Berapa di antaranya ke nomor baru. |
| `time_since_connect` | metrik | Jeda sejak connect/scan sampai suspend. |
| `socket_config` | konfigurasi | browser, `markOnlineOnConnect`, presence, dll. |
| `number_type` / `ip_class` | konfigurasi | SIM asli vs VoIP; IP residensial vs datacenter (F13/F15). |

Tambahan: simpan log mentah Baileys pada level `debug` saat investigasi (logger level "debug") agar frame WhatsApp terlihat, lalu turunkan level di produksi. Untuk privacy, hindari menyimpan nomor dan isi pesan mentah di log operasional; gunakan hash/fingerprint, dan simpan raw payload hanya untuk window investigasi terbatas.

---

## 8. Event Log Lifecycle Account Channel

Skema event untuk melacak siklus hidup tiap account channel, dari dibuat hingga tersuspend. "Lifetime" didefinisikan sebagai durasi dari channel berhasil connected hingga disconnected.

| Event | Definisi | Field yang dicatat |
| --- | --- | --- |
| `created` | Record account channel dibuat di sistem. | channel_id, owner, msisdn (jika ada), created_at |
| `init` | Inisialisasi socket Baileys / persiapan auth state. | channel_id, socket_config, init_at |
| `scan` | QR/pairing code di-generate & proses scan. | channel_id, method (qr/pairing), scan_at, scan_result |
| `connected` | Koneksi berhasil (`connection = 'open'`). Mulai hitung lifetime. | channel_id, connected_at |
| `lifetime` | Durasi connected → disconnected (turunan, bukan event mentah). | channel_id, connected_at, disconnected_at, duration |
| `disconnected` | Koneksi putus (`connection = 'close'`), bisa sengaja/tidak. | channel_id, disconnected_at, reason, status_code, reconnect (Y/N) |
| `suspended` | Terdeteksi dibatasi/suspend oleh WhatsApp. | channel_id, suspended_at, suspend_type, status_code, ref ke log suspend (Bagian 7) |

> **Catatan:** `disconnected` dan `suspended` berbeda. Disconnect bisa terjadi karena restartRequired/koneksi jaringan tanpa suspend; suspend adalah pembatasan dari WhatsApp. Bedakan keduanya lewat `status_code` / `DisconnectReason` agar metrik akurat.

### 8.1 Event Outbound Message

Event outbound diperlukan agar setiap pesan bisa ditelusuri dari queue sampai ack/failure.

| Event | Definisi | Field minimum |
| --- | --- | --- |
| `outbound_queued` | Pesan masuk antrean pengiriman. | channel_id, recipient_hash, recipient_known_status, message_fingerprint, batch_id, queued_at |
| `outbound_rate_limited` | Pesan ditahan oleh rate limiter. | channel_id, recipient_hash, limiter_key, retry_after, reason, created_at |
| `outbound_sent` | Pesan berhasil dikirim ke socket Baileys. | channel_id, recipient_hash, message_id, message_fingerprint, sent_at |
| `outbound_delivered` | Ack delivered diterima jika tersedia. | channel_id, recipient_hash, message_id, ack_status, delivered_at |
| `outbound_read` | Ack read diterima jika tersedia. | channel_id, recipient_hash, message_id, read_at |
| `outbound_failed` | Pengiriman gagal sebelum/selama proses kirim. | channel_id, recipient_hash, message_id, error_code, error_message, failed_at |

### 8.2 Event Broadcast/Fan-out

Broadcast di SatuInbox sebaiknya dicatat sebagai fan-out per recipient agar kasus seperti G6 bisa diaudit.

| Event | Definisi | Field minimum |
| --- | --- | --- |
| `broadcast.started` | Batch broadcast mulai dibuat/dijalankan. | batch_id, channel_id, total_recipients, message_fingerprint, started_at |
| `broadcast.recipient_queued` | Recipient masuk antrean broadcast. | batch_id, channel_id, recipient_hash, recipient_known_status, queued_at |
| `broadcast.recipient_sent` | Pesan broadcast terkirim ke recipient. | batch_id, channel_id, recipient_hash, message_id, sent_at |
| `broadcast.recipient_failed` | Pengiriman ke recipient gagal. | batch_id, channel_id, recipient_hash, error_code, error_message, failed_at |
| `broadcast.completed` | Batch selesai atau dihentikan. | batch_id, channel_id, total_sent, total_failed, total_rate_limited, completed_at |

---

## 9. Metrik Keberhasilan

- **Time-to-suspend** — rata-rata waktu/jumlah pesan sebelum suspend per skenario.
- **Suspend rate** — % nomor yang tersuspend per skenario.
- **Delivered→conversation ratio** — untuk menjawab G6 (BC jadi conversation).
- **Survival per warm-up tier** — ketahanan nomor menurut tahap warm-up.
- **Perbandingan channel** — SatuInbox vs WA Web vs HP pada pola identik.
- **Akurasi model skor (3.3)** — korelasi antara skor/tier prediksi dengan suspend aktual; dipakai untuk mengkalibrasi ulang bobot faktor.

---

## 10. Decision Gate Interpretasi Hasil

Gunakan hasil test matrix untuk membuat keputusan teknis, bukan hanya laporan observasi.

| Kondisi hasil riset | Interpretasi utama | Keputusan yang disarankan |
| --- | --- | --- |
| WA Web/HP manual juga suspend pada pola yang sama | Risiko berasal dari policy/behavior WhatsApp | Batasi cold outbound/broadcast; prioritaskan WhatsApp Business API resmi |
| Hanya SatuInbox/Baileys yang suspend | Risiko kemungkinan dari implementasi/session | Audit socket config, auth lifecycle, queue, rate limit, dan retry logic |
| T0 connect-only suspend | Masalah mungkin dari nomor, session, atau login | Jangan lanjut outbound; isolasi nomor dan ulangi dengan nomor pembanding |
| Rate limit + drip menurunkan suspend secara signifikan | Volume/rate adalah trigger dominan | Jadikan queue, jitter, dan circuit breaker sebagai default produksi |
| Velocity tinggi suspend lebih cepat dari volume setara (T9) | New-conversation velocity adalah trigger dominan | Terapkan plafon first-contact unik per jam, terpisah dari plafon total pesan |
| VoIP/IP datacenter jauh lebih cepat suspend (T12) | Reputasi nomor/IP signifikan | Wajibkan SIM asli + IP residensial untuk channel produksi |
| Delivered tinggi tapi conversation rendah pada broadcast | Masalah metrik/conversation atau aturan broadcast | Audit ack, definisi conversation, dan syarat kontak menyimpan sender |
| Suspend tetap tinggi meski guardrail diterapkan | Use case tidak cocok untuk Baileys unofficial | Hentikan use case outbound skala besar; migrasi ke channel resmi |

---

## 11. Risiko & Catatan Kepatuhan

Baileys tidak berafiliasi dengan WhatsApp, dan maintainer-nya secara eksplisit tidak menganjurkan penggunaan untuk spam, bulk, atau automated messaging. Penggunaan unofficial berisiko melanggar Terms of Service WhatsApp, dan suspend/ban adalah konsekuensi yang melekat — tidak ada konfigurasi yang menjaminnya 100% aman. Riset ini bertujuan meminimalkan risiko operasional dan memahami perilaku sistem, bukan menjamin kekebalan. Tim sebaiknya juga mengevaluasi opsi **WhatsApp Business API (Cloud API)** resmi untuk use case broadcast/notifikasi berskala, sebagai jalur yang sah dan stabil.

---

## 12. Langkah Berikutnya

1. Siapkan nomor uji + kontak dummy yang dikendalikan tim (termasuk variasi SIM asli vs VoIP, IP residensial vs datacenter untuk T12).
2. Implementasikan logging suspend (Bagian 7) dan event log channel (Bagian 8) terlebih dulu — tanpa data, eksperimen tidak terukur.
3. Jalankan test matrix (Bagian 5.3), satu variabel per waktu, termasuk uji manual WA Web/HP. Catat faktor aktif & skor simulasi (3.3) tiap baris.
4. Kalibrasi rate limit, warm-up, dan bobot model skor (3.3) dari hasil eksperimen.
5. Review temuan memakai decision gate (Bagian 10), putuskan kebijakan outbound final, dan evaluasi opsi WhatsApp Business API resmi.

---

_Sumber teknis: Baileys README — WhiskeySockets/Baileys (https://github.com/WhiskeySockets/Baileys)_
