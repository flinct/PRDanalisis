# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Special Message Types Display (Contact, Poll, Event, Shared Link, Account Detail, Order)  
**Product Lead**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**:  
**Version**: v1.1

---

## **1. Revision History**

| Version | Date       | Author         | Changes                                                                                                                                                                        |
| ------- | ---------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0    | 2026-06-08 | Dany Christian | Initial PRD — inbound display untuk Contact Card, Poll, Event, dan Link Preview dari WhatsApp.                                                                                 |
| v1.1    | 2026-06-08 | Dany Christian | Tambah 2 tipe baru: Account Detail dan Order. Update Overview, Scope, OKR, User Stories, FR, EH, EC, UI/UX, Field & Validation, API Contract, Dependencies, Metrics, Appendix. |

---

## **2. Overview**

| Item                 | Description                                                                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | SatuInbox harus menampilkan 6 tipe pesan WhatsApp — Contact, Poll, Event, Shared Link, Account Detail, dan Order — dengan tampilan yang setara WhatsApp Web, sehingga agen dapat memahami konteks percakapan secara lengkap tanpa informasi yang hilang. |
| **Scope**            | Phase 1 — inbound display read-only di Conversation Room. Baileys di BE sudah decode sebagian besar tipe ini; PRD ini mendefinisikan bagaimana data tersebut di-forward dan ditampilkan di FE.                                                           |
| **Key Capabilities** | Bubble per tipe: ContactCardBubble, PollBubble, EventBubble, LinkPreviewBubble, AccountDetailBubble, OrderBubble. Fallback bubble untuk tipe tidak dikenal.                                                                                              |
| **Outcome**          | Agen dapat membaca seluruh konteks percakapan WhatsApp tanpa informasi hilang. Mengurangi kebingungan akibat pesan yang tampil blank atau unsupported, dan mengurangi kebutuhan agen untuk meminta customer mengulang informasi.                         |

### **Scope Definition**

| In Scope                                                                                            | Out of Scope                                                                 |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Menampilkan Contact Card (nama, nomor telepon) — read-only                                          | Agent mengirim Contact Card ke customer (outbound)                           |
| Menampilkan Poll (pertanyaan, opsi, vote count) — read-only                                         | Agent vote pada poll dari SatuInbox                                          |
| Menampilkan Event (nama, tanggal/waktu, lokasi) — read-only                                         | Agent RSVP pada event dari SatuInbox                                         |
| Menampilkan Link Preview (thumbnail, judul, deskripsi, URL)                                         | Security proxy untuk URL di link preview                                     |
| Menampilkan Account Detail (nama bank/payment method, pemilik, nomor rekening, nominal) — read-only | Agent membuat payment request atau konfirmasi pembayaran dari SatuInbox      |
| Menampilkan Order summary (thumbnail, judul, jumlah item, total harga, status) — read-only          | Agent accept/decline order dari SatuInbox                                    |
| Fallback bubble "Pesan tidak didukung" untuk tipe tidak dikenal                                     | Detail item per-baris order (Phase 2 — butuh fetch terpisah ke WhatsApp API) |
| Poll vote count update via socket saat customer vote                                                | Tampilkan nama voter individual pada poll                                    |
| Channel: WhatsApp Web                                                                               | Channel lain (WA Official API, Widget, Instagram, Email)                     |

---

## **3. Problem Statement**

| ID     | Problem                                                                                                                                                                                                                    | Impact                                                                                                                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PS-001 | Ketika customer mengirim Contact Card, Poll, Event, Shared Link, Account Detail, atau Order melalui WhatsApp, SatuInbox tidak menampilkan konten tersebut — bubble tampil kosong atau dengan teks `[unsupported message]`. | Agen kehilangan konteks percakapan penting, harus meminta customer mengulang informasi, meningkatkan handling time dan menurunkan customer satisfaction. |
| PS-002 | PRD Room v1.1 hanya mendefinisikan: text, image, audio, video, document, voice note. Enam tipe pesan WhatsApp yang umum digunakan tidak pernah didefinisikan di PRD manapun.                                               | Gap requirement menyebabkan FE tidak memiliki komponen untuk menampilkan tipe-tipe ini, meskipun Baileys di BE sudah berhasil mendecodenya.              |
| PS-003 | Order dan Account Detail adalah tipe pesan yang sangat kritikal dalam konteks CS bisnis Indonesia — agen tidak bisa menindaklanjuti pesanan atau permintaan pembayaran customer jika kontennya tidak terbaca.              | Langsung berdampak ke konversi dan kepuasan customer, terutama untuk bisnis e-commerce dan retail yang menggunakan WhatsApp sebagai channel penjualan.   |
| PS-004 | Tidak ada fallback yang jelas untuk tipe pesan yang tidak dikenal — risiko crash atau blank yang mengganggu UX Conversation Room.                                                                                          | Instabilitas UI saat menerima tipe pesan baru di masa depan.                                                                                             |

---

## **4. Objectives and Key Results**

| Objective                                                                  | Key Result                                                                                                                                           |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Semua 6 tipe pesan WhatsApp yang umum dapat dibaca oleh agen di SatuInbox  | 100% pesan Contact, Poll, Event, Link Preview, Account Detail, dan Order ditampilkan dengan bubble yang sesuai — diverifikasi via QA regression test |
| Tidak ada informasi percakapan yang hilang akibat tipe pesan tidak dikenal | 0% crash atau blank bubble untuk tipe yang sudah didefinisikan di Phase 1                                                                            |
| Tampilan konsisten dengan referensi WhatsApp Web                           | ≥90% visual parity dengan WhatsApp Web berdasarkan design review                                                                                     |
| Fallback tersedia untuk tipe masa depan                                    | 100% tipe tidak dikenal menampilkan fallback bubble "Pesan tidak didukung"                                                                           |
| Agen dapat memahami konteks Order tanpa harus keluar dari SatuInbox        | ≥85% agen melaporkan dapat memahami isi order dari bubble (user research post-launch)                                                                |

---

## **5. User Stories and Acceptance Criteria**

| ID     | Priority | User Story                                                                                                                                                                                                         | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-001 | P0       | Sebagai Agen, saya ingin melihat Contact Card yang dikirim customer via WhatsApp sehingga saya tahu siapa yang direkomendasikan atau dibagikan customer.                                                           | 1. Given customer mengirim Contact Card, When agen membuka room, Then bubble contact_card tampil dengan nama dan minimal satu nomor telepon. 2. Given tidak ada nomor telepon, Then bubble tetap tampil dengan nama saja. 3. Given multi-kontak dalam satu pesan, Then setiap kontak tampil sebagai entry terpisah. 4. Given agen melihat Contact Card, Then tidak ada action yang mengirim data ke WhatsApp — read-only.                                                                                                                                                                                                                                            |
| US-002 | P1       | Sebagai Agen, saya ingin melihat Poll yang dibuat customer beserta vote count-nya sehingga saya memahami preferensi customer.                                                                                      | 1. Given customer membuat Poll, When agen membuka room, Then bubble poll tampil dengan pertanyaan dan semua opsi beserta vote count. 2. Given ada voter baru (socket event masuk), When agen sedang buka room, Then vote count ter-update real-time tanpa reload. 3. Given agen melihat Poll, Then tidak ada tombol vote — read-only. 4. Given poll 0 vote, Then semua opsi tampil dengan count 0.                                                                                                                                                                                                                                                                   |
| US-003 | P1       | Sebagai Agen, saya ingin melihat Event yang dibagikan customer sehingga saya tahu jadwal atau konteks event yang dibahas.                                                                                          | 1. Given customer mengirim Event, When agen membuka room, Then bubble event tampil dengan nama dan tanggal/waktu format Bahasa Indonesia. 2. Given event memiliki lokasi, Then lokasi ditampilkan. 3. Given event memiliki deskripsi, Then deskripsi tampil max 3 baris. 4. Given agen melihat Event, Then tidak ada tombol RSVP — read-only. 5. Given `isCanceled = true`, Then bubble menampilkan label "Dibatalkan".                                                                                                                                                                                                                                              |
| US-004 | P1       | Sebagai Agen, saya ingin melihat preview dari link yang dikirim customer sehingga saya dapat memahami konten link tanpa harus membukanya terlebih dahulu.                                                          | 1. Given customer kirim URL dengan OG metadata, When agen membuka room, Then bubble tampilkan thumbnail, judul, deskripsi, dan URL clickable. 2. Given thumbnail gagal load, Then placeholder icon tampil. 3. Given tidak ada OG metadata, Then URL tampil sebagai plain clickable link. 4. Given agen klik URL, Then URL buka di tab baru.                                                                                                                                                                                                                                                                                                                          |
| US-005 | P1       | Sebagai Agen, saya ingin melihat notifikasi yang jelas ketika menerima tipe pesan yang tidak didukung sehingga saya tahu ada pesan masuk.                                                                          | 1. Given tipe pesan tidak dikenal FE, When agen membuka room, Then bubble "Pesan tidak didukung" + icon info tampil — bukan blank bukan crash. 2. Given bubble fallback tampil, Then timestamp dan pengirim tetap benar.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| US-006 | P1       | Sebagai Agen, saya ingin melihat Account Detail yang dikirim customer atau business via WhatsApp sehingga saya dapat membantu proses pembayaran atau transfer tanpa meminta customer mengulang informasi rekening. | 1. Given customer atau business mengirim Account Detail, When agen membuka room, Then bubble account_detail tampil dengan nama bank/payment method, nama pemilik rekening, dan nomor rekening. 2. Given Account Detail memiliki nominal, Then nominal ditampilkan dalam format mata uang (contoh: "Rp 150.000"). 3. Given Account Detail memiliki catatan/note, Then catatan ditampilkan. 4. Given agen melihat Account Detail, Then tidak ada tombol "Bayar" atau action yang memproses pembayaran — read-only. 5. Given `expiryTimestamp` tersedia dan sudah lewat, Then bubble menampilkan badge "Kedaluwarsa".                                                   |
| US-007 | P0       | Sebagai Agen, saya ingin melihat Order yang dibuat customer via WhatsApp Business Catalog sehingga saya dapat memproses atau merespons pesanan customer dengan cepat.                                              | 1. Given customer mengirim Order via WA Business Catalog, When agen membuka room, Then bubble order tampil dengan thumbnail produk, judul order, jumlah item, total harga, dan status order. 2. Given status order adalah INQUIRY, Then badge "Menunggu" tampil. 3. Given status order adalah ACCEPTED, Then badge "Diterima" tampil. 4. Given status order adalah DECLINED, Then badge "Ditolak" tampil. 5. Given status order adalah CANCELLED, Then badge "Dibatalkan" tampil. 6. Given agen melihat Order, Then tidak ada tombol Accept/Decline di SatuInbox — read-only. 7. Given customer menyertakan pesan dalam order, Then pesan customer tampil di bubble. |

---

## **6. Functional Requirements**

### **Contact Card**

| Category          | Requirements                                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Display**       | FR-001 [P0]: Sistem MUST menampilkan bubble bertipe `contact_card` ketika `messageType === 'contact_card'`. FR-002 [P1]: Sistem MUST menampilkan nama kontak (`displayName`) dari vCard. FR-003 [P1]: Sistem MUST menampilkan semua nomor telepon dari field `TEL` vCard. FR-004 [P1]: Sistem MUST menampilkan avatar placeholder icon jika tidak ada foto profil. |
| **Read-only**     | FR-005 [P0]: Sistem MUST NOT menampilkan action yang dapat mengirim data ke WhatsApp dari bubble Contact Card.                                                                                                                                                                                                                                                     |
| **Multi-contact** | FR-006 [P2]: Jika satu pesan mengandung lebih dari satu kontak, Sistem SHOULD menampilkan setiap kontak sebagai entry terpisah dalam satu bubble.                                                                                                                                                                                                                  |
| **Fallback**      | FR-007 [P1]: Jika `displayName` kosong, Sistem MUST menampilkan nomor telepon pertama sebagai judul. Jika keduanya kosong, tampilkan "Kontak Tidak Diketahui".                                                                                                                                                                                                     |

### **Poll**

| Category             | Requirements                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Display**          | FR-008 [P1]: Sistem MUST menampilkan bubble bertipe `poll` ketika `messageType === 'poll'`. FR-009 [P1]: Sistem MUST menampilkan pertanyaan poll sebagai judul bubble. FR-010 [P1]: Sistem MUST menampilkan semua opsi beserta vote count masing-masing. FR-011 [P1]: Sistem MUST menampilkan total vote count di footer bubble. FR-012 [P2]: Sistem SHOULD menampilkan progress bar persentase per opsi. |
| **Read-only**        | FR-013 [P0]: Sistem MUST NOT menampilkan tombol vote atau input apapun pada bubble Poll.                                                                                                                                                                                                                                                                                                                  |
| **Real-time update** | FR-014 [P1]: Ketika `conversation.poll.updated` socket event masuk, Sistem MUST memperbarui vote count tanpa reload. FR-015 [P1]: Jika room tidak terbuka saat update masuk, Sistem MUST menampilkan vote count terbaru saat room dibuka via REST.                                                                                                                                                        |
| **Zero vote state**  | FR-016 [P1]: Jika poll memiliki 0 vote, Sistem MUST menampilkan semua opsi dengan count 0 — tidak disembunyikan.                                                                                                                                                                                                                                                                                          |

### **Event**

| Category        | Requirements                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Display**     | FR-017 [P1]: Sistem MUST menampilkan bubble bertipe `event` ketika `messageType === 'event'`. FR-018 [P1]: Sistem MUST menampilkan nama event dan `startAt` dalam format lokal `id-ID`. FR-019 [P2]: Sistem SHOULD menampilkan lokasi jika tersedia. FR-020 [P2]: Sistem SHOULD menampilkan deskripsi jika tersedia (max 3 baris, ellipsis jika lebih). FR-021 [P1]: Jika `isCanceled === true`, Sistem MUST menampilkan badge "Dibatalkan". |
| **Read-only**   | FR-022 [P0]: Sistem MUST NOT menampilkan tombol RSVP atau action yang mengirim data ke WhatsApp.                                                                                                                                                                                                                                                                                                                                             |
| **Date format** | FR-023 [P1]: Tanggal MUST diformat locale `id-ID` (contoh: "Senin, 9 Juni 2026, 10.00"). Timezone mengikuti timezone browser.                                                                                                                                                                                                                                                                                                                |

### **Link Preview**

| Category                 | Requirements                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Display**              | FR-024 [P1]: Sistem MUST menampilkan link preview card di bawah teks ketika `messageType === 'link_preview'`. FR-025 [P1]: Sistem MUST menampilkan thumbnail jika tersedia. FR-026 [P1]: Sistem MUST menampilkan judul jika tersedia. FR-027 [P1]: Sistem MUST menampilkan deskripsi jika tersedia (max 2 baris, ellipsis). FR-028 [P1]: Sistem MUST menampilkan URL yang clickable. |
| **Click behavior**       | FR-029 [P1]: Klik URL MUST membuka di tab baru (`target="_blank"`, `rel="noopener noreferrer"`).                                                                                                                                                                                                                                                                                     |
| **Graceful degradation** | FR-030 [P1]: Jika thumbnail gagal load, Sistem MUST tampilkan placeholder icon. FR-031 [P1]: Jika tidak ada OG metadata, Sistem MUST tampilkan URL sebagai plain clickable link — tanpa card.                                                                                                                                                                                        |

### **Account Detail**

| Category      | Requirements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Display**   | FR-035 [P1]: Sistem MUST menampilkan bubble bertipe `account_detail` ketika `messageType === 'account_detail'`. FR-036 [P1]: Sistem MUST menampilkan nama bank atau payment method (`bankName`). FR-037 [P1]: Sistem MUST menampilkan nama pemilik rekening (`accountHolder`). FR-038 [P1]: Sistem MUST menampilkan nomor rekening (`accountNumber`). FR-039 [P1]: Jika `amount` tersedia, Sistem MUST menampilkan nominal dalam format mata uang lokal (contoh: "Rp 150.000"). FR-040 [P2]: Jika `note` tersedia, Sistem SHOULD menampilkan catatan pembayaran. |
| **Expiry**    | FR-041 [P1]: Jika `expiryTimestamp` tersedia dan sudah lewat saat bubble di-render, Sistem MUST menampilkan badge "Kedaluwarsa".                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Read-only** | FR-042 [P0]: Sistem MUST NOT menampilkan tombol "Bayar", "Konfirmasi Pembayaran", atau action apapun yang memproses transaksi dari SatuInbox.                                                                                                                                                                                                                                                                                                                                                                                                                    |

### **Order**

| Category         | Requirements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Display**      | FR-043 [P0]: Sistem MUST menampilkan bubble bertipe `order` ketika `messageType === 'order'`. FR-044 [P0]: Sistem MUST menampilkan thumbnail produk (`thumbnailUrl`) jika tersedia. FR-045 [P0]: Sistem MUST menampilkan judul order (`orderTitle`). FR-046 [P0]: Sistem MUST menampilkan jumlah item (`itemCount`) dengan format "X item". FR-047 [P0]: Sistem MUST menampilkan total harga dalam format mata uang (`totalAmount` + `currencyCode`). FR-048 [P0]: Sistem MUST menampilkan status order sebagai badge (lihat status mapping di bawah). FR-049 [P1]: Jika customer menyertakan pesan (`message`), Sistem MUST menampilkan pesan tersebut di bubble. |
| **Status badge** | FR-050 [P0]: Status INQUIRY → badge kuning "Menunggu". Status ACCEPTED → badge hijau "Diterima". Status DECLINED → badge merah "Ditolak". Status CANCELLED → badge abu "Dibatalkan".                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Read-only**    | FR-051 [P0]: Sistem MUST NOT menampilkan tombol Accept/Decline Order di SatuInbox Phase 1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Item detail**  | FR-052 [P2]: Sistem MAY menampilkan tombol "Lihat Detail Item" yang membuka modal/drawer dengan item-by-item breakdown (Phase 2 — membutuhkan fetch terpisah ke WhatsApp API via `getOrderDetails`).                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### **Fallback**

| Category         | Requirements                                                                                                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Unknown type** | FR-032 [P0]: Jika `messageType` tidak dikenali FE, Sistem MUST menampilkan bubble "Pesan tidak didukung" + icon info. FR-033 [P0]: Bubble fallback MUST tetap menampilkan timestamp dan nama pengirim. FR-034 [P0]: Bubble fallback MUST NOT menyebabkan crash atau hilangnya bubble lain. |

---

## **7. Error Handling**

| ID     | Type                                 | Handling                                                                           | UI/UX                                                                             |
| ------ | ------------------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| EH-001 | vCard parse error                    | Jika vCard tidak dapat di-parse, tampilkan `displayName` saja — skip nomor telepon | Bubble Contact Card tetap tampil dengan nama. Tidak ada error ke agen.            |
| EH-002 | Poll data tidak lengkap              | Jika payload poll tidak memiliki `question` atau `options`                         | Render UnsupportedBubble "Pesan tidak didukung"                                   |
| EH-003 | Socket `poll.updated` gagal diterima | Jika socket disconnect, vote count tidak ter-update real-time                      | Tampilkan count terakhir. Re-fetch via REST saat room re-open.                    |
| EH-004 | Link thumbnail timeout               | Jika thumbnail tidak selesai load dalam 5 detik                                    | Ganti dengan placeholder icon. Tidak ada retry.                                   |
| EH-005 | Event `startAt` invalid timestamp    | Jika tidak dapat di-parse                                                          | Tampilkan nama event saja tanpa tanggal. Jangan crash.                            |
| EH-006 | `messageType` null atau undefined    | Jika field tidak ada di payload                                                    | Render UnsupportedBubble.                                                         |
| EH-007 | Account Detail payload tidak lengkap | Jika `accountNumber` atau `bankName` tidak ada                                     | Render UnsupportedBubble — bukan bubble parsial yang membingungkan agen           |
| EH-008 | Order `totalAmount1000` tidak valid  | Jika nilai negatif atau bukan number                                               | Tampilkan "-" sebagai total harga. Jangan crash bubble.                           |
| EH-009 | Order thumbnail gagal load           | Jika gambar produk tidak dapat di-fetch                                            | Tampilkan placeholder icon produk. Bubble order tetap tampil dengan data lainnya. |

---

## **8. Edge Cases**

| ID     | Scenario                                                             | Expected Behavior                                                                                   | UI/UX                                                          |
| ------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| EC-001 | Contact Card tanpa nomor telepon                                     | Tampilkan nama kontak saja                                                                          | Avatar placeholder + nama. Tidak ada baris telepon.            |
| EC-002 | Contact Card dengan multiple kontak                                  | Tampilkan semua dalam satu bubble sebagai daftar                                                    | Setiap entry: avatar + nama + nomor                            |
| EC-003 | Poll dengan satu opsi                                                | Tampilkan opsi tunggal dengan vote count                                                            | Tidak ada perubahan layout                                     |
| EC-004 | Poll update untuk `pollId` yang tidak ada di history yang dimuat     | Skip update                                                                                         | Tidak ada error di UI                                          |
| EC-005 | Poll update masuk saat agent sedang mengetik di room yang sama       | Update vote count tanpa mengganggu input area                                                       | Vote count berubah, input area tidak terpengaruh               |
| EC-006 | Event dengan `endAt` sebelum `startAt`                               | Tampilkan `startAt` saja, abaikan `endAt`                                                           | Tidak ada error message                                        |
| EC-007 | Event `isCanceled` berubah setelah bubble tampil                     | Badge "Dibatalkan" muncul via socket atau saat reload                                               | State berubah langsung, tidak ada animasi khusus               |
| EC-008 | Link preview URL sangat panjang (>200 karakter)                      | Truncate URL di display, URL asli tetap saat klik                                                   | URL display dipotong, bukan URL target                         |
| EC-009 | Link preview URL 404                                                 | Link tetap tampil dan clickable                                                                     | Agen mendapat 404 di tab baru — accepted behavior              |
| EC-010 | Poll dari percakapan lama (berbulan-bulan)                           | Vote count adalah snapshot terakhir di BE                                                           | Tidak ada indikator "data lama" — accepted Phase 1             |
| EC-011 | Account Detail dengan `expiryTimestamp` di masa lalu                 | Badge "Kedaluwarsa" tampil                                                                          | Badge merah di pojok bubble                                    |
| EC-012 | Account Detail tanpa nominal (`amount = null`)                       | Tampilkan data rekening tanpa baris nominal                                                         | Hanya `bankName`, `accountHolder`, `accountNumber` yang tampil |
| EC-013 | Account Detail nomor rekening sangat panjang (>20 digit)             | Tampilkan nomor apa adanya tanpa truncate                                                           | Agen perlu melihat nomor lengkap untuk keperluan transfer      |
| EC-014 | Order dengan `itemCount = 0`                                         | Tampilkan "0 item" — jangan sembunyikan baris item count                                            | Bubble tetap konsisten                                         |
| EC-015 | Order status berubah setelah bubble ditampilkan (INQUIRY → ACCEPTED) | Status badge diupdate via socket event `conversation.order.updated` jika ada, atau saat room reload | Tidak ada animasi — state langsung berubah                     |
| EC-016 | Order `totalAmount1000 = 0`                                          | Tampilkan "Rp 0" atau "Gratis" sesuai konteks bisnis                                                | TBD — perlu konfirmasi PM (lihat OQ-9)                         |

---

## **9. UI & UX Requirements**

| Component                 | Description                                                                                                                                                                                                                                            | UX Flow                                                                                | Related User Story IDs |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ---------------------- |
| **ContactCardBubble**     | Card dengan avatar placeholder (icon silhouette), nama bold, daftar nomor telepon. Background bubble sesuai arah pesan.                                                                                                                                | Muncul sebagai bubble reguler. Tidak interaktif.                                       | US-001                 |
| **PollBubble**            | Card dengan icon poll + "Jajak Pendapat", pertanyaan bold, daftar opsi dengan count dan progress bar tipis, total vote di footer.                                                                                                                      | Vote count berubah via socket tanpa interaksi. Tidak ada tombol vote.                  | US-002                 |
| **EventBubble**           | Card dengan icon kalender, nama bold, baris tanggal/waktu, lokasi, deskripsi max 3 baris. Badge "Dibatalkan" merah di pojok kanan atas jika dibatalkan.                                                                                                | Tidak interaktif.                                                                      | US-003                 |
| **LinkPreviewBubble**     | Teks pesan di atas, card di bawah: thumbnail (kiri) + judul bold + deskripsi 2 baris + domain. Card dan URL clickable.                                                                                                                                 | Klik → buka tab baru.                                                                  | US-004                 |
| **AccountDetailBubble**   | Card dengan icon bank/wallet, header "Detail Rekening", nama bank bold, baris pemilik rekening, baris nomor rekening (font monospace atau spasi tiap 4 digit), baris nominal jika ada, baris catatan jika ada. Badge "Kedaluwarsa" merah jika expired. | Tidak interaktif. Nomor rekening dapat di-select untuk copy (native browser behavior). | US-006                 |
| **OrderBubble**           | Card dengan thumbnail produk (kiri, fallback icon produk), kolom kanan: judul order bold, baris "X item", baris total harga bold, badge status (warna sesuai status), baris pesan customer jika ada.                                                   | Tidak interaktif di Phase 1. Tidak ada tombol Accept/Decline.                          | US-007                 |
| **UnsupportedBubble**     | Bubble abu-abu, icon info (ⓘ), teks "Pesan tidak didukung". Timestamp + pengirim tetap ada.                                                                                                                                                            | Tidak interaktif.                                                                      | US-005                 |
| **Loading state**         | Skeleton loader saat payload masih di-fetch                                                                                                                                                                                                            | Skeleton → konten saat data ready                                                      | Semua                  |
| **Empty state per field** | Field null/kosong tidak di-render — tidak ada label kosong                                                                                                                                                                                             | Hanya field berisi nilai yang tampil                                                   | US-003, US-006         |
| **Bahasa UI**             | Semua label Bahasa Indonesia                                                                                                                                                                                                                           | Lihat UI Labels di Appendix                                                            | Semua                  |

---

## **10. Field & Validation**

### Contact Card Payload

| Field         | Type     | Example          | Validation                          | Required    | Default                           |
| ------------- | -------- | ---------------- | ----------------------------------- | ----------- | --------------------------------- |
| `displayName` | string   | "Budi Santoso"   | Render apa adanya                   | Conditional | Gunakan phone pertama jika kosong |
| `phones`      | string[] | ["628123456789"] | Array, boleh kosong                 | Conditional | `[]`                              |
| `vcard`       | string   | "BEGIN:VCARD..." | Raw vCard — parse di FE untuk `TEL` | No          | ""                                |

### Poll Payload

| Field             | Type                                  | Example                           | Validation       | Required | Default |
| ----------------- | ------------------------------------- | --------------------------------- | ---------------- | -------- | ------- |
| `pollId`          | string                                | "abc123"                          | Non-empty        | Yes      | —       |
| `question`        | string                                | "Kapan kamu bisa meeting?"        | Non-empty        | Yes      | —       |
| `options`         | `{name: string, voteCount: number}[]` | `[{name: "Senin", voteCount: 3}]` | Array min 1 item | Yes      | —       |
| `totalVotes`      | number                                | 7                                 | Integer ≥ 0      | Yes      | 0       |
| `selectableCount` | number                                | 1                                 | Integer ≥ 1      | Yes      | 1       |

### Event Payload

| Field         | Type              | Example                | Validation                  | Required | Default |
| ------------- | ----------------- | ---------------------- | --------------------------- | -------- | ------- |
| `name`        | string            | "Rapat Bulanan"        | Non-empty                   | Yes      | —       |
| `startAt`     | string (ISO 8601) | "2026-06-15T10:00:00Z" | Valid timestamp             | Yes      | —       |
| `endAt`       | string?           | "2026-06-15T12:00:00Z" | Valid timestamp > `startAt` | No       | null    |
| `location`    | string?           | "Kantor Jakarta"       | Free text                   | No       | null    |
| `description` | string?           | "Agenda: review Q2"    | Free text                   | No       | null    |
| `isCanceled`  | boolean           | false                  | Boolean                     | Yes      | false   |

### Link Preview Payload

| Field          | Type    | Example                           | Validation      | Required | Default |
| -------------- | ------- | --------------------------------- | --------------- | -------- | ------- |
| `text`         | string  | "Cek ini https://example.com"     | Teks pesan asli | Yes      | —       |
| `url`          | string  | "https://example.com/article"     | Valid URL       | Yes      | —       |
| `title`        | string? | "Judul Artikel"                   | Free text       | No       | null    |
| `description`  | string? | "Deskripsi singkat..."            | Free text       | No       | null    |
| `thumbnailUrl` | string? | "https://cdn.example.com/img.jpg" | Valid URL       | No       | null    |

### Account Detail Payload

| Field             | Type    | Example                       | Validation                                | Required | Default |
| ----------------- | ------- | ----------------------------- | ----------------------------------------- | -------- | ------- |
| `bankName`        | string  | "BCA"                         | Non-empty                                 | Yes      | —       |
| `accountHolder`   | string  | "PT Ordo Indonesia"           | Non-empty                                 | Yes      | —       |
| `accountNumber`   | string  | "1234567890"                  | Non-empty string, render apa adanya       | Yes      | —       |
| `amount`          | number? | 150000                        | Integer ≥ 0 dalam unit terkecil mata uang | No       | null    |
| `currencyCode`    | string? | "IDR"                         | ISO 4217 currency code                    | No       | "IDR"   |
| `note`            | string? | "Pembayaran invoice #INV-001" | Free text                                 | No       | null    |
| `expiryTimestamp` | string? | "2026-06-10T23:59:59Z"        | ISO 8601 timestamp                        | No       | null    |

### Order Payload

| Field          | Type    | Example                  | Validation                                                        | Required | Default   |
| -------------- | ------- | ------------------------ | ----------------------------------------------------------------- | -------- | --------- |
| `orderId`      | string  | "order_abc123"           | Non-empty                                                         | Yes      | —         |
| `orderTitle`   | string  | "Pesanan dari Katalog"   | Non-empty                                                         | Yes      | —         |
| `itemCount`    | number  | 3                        | Integer ≥ 0                                                       | Yes      | 0         |
| `totalAmount`  | number  | 150000                   | Number ≥ 0 (sudah dikonversi dari `totalAmount1000 / 1000` di BE) | Yes      | 0         |
| `currencyCode` | string  | "IDR"                    | ISO 4217                                                          | Yes      | "IDR"     |
| `status`       | enum    | "INQUIRY"                | INQUIRY \| ACCEPTED \| DECLINED \| CANCELLED                      | Yes      | "INQUIRY" |
| `thumbnailUrl` | string? | "https://..."            | Valid URL atau null                                               | No       | null      |
| `message`      | string? | "Tolong packing rapi ya" | Pesan dari buyer                                                  | No       | null      |
| `sellerJid`    | string  | "628x@s.whatsapp.net"    | WA JID format                                                     | Yes      | —         |
| `token`        | string  | "token_xyz"              | Non-empty — untuk fetch detail item Phase 2                       | Yes      | —         |

---

## **11. Non-Functional Requirements**

| Category          | Requirement                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance**   | Semua bubble baru MUST ter-render dalam ≤500ms setelah data diterima. vCard parsing MUST ≤50ms. Link/order thumbnail MUST timeout ≤5s sebelum fallback.                                        |
| **Reliability**   | Poll vote count MUST konsisten antara socket update dan REST fetch. Tidak boleh ada race condition yang menyebabkan vote count turun. Order status MUST mencerminkan snapshot terbaru dari BE. |
| **Security**      | URL dari link preview MUST dibuka dengan `target="_blank"` dan `rel="noopener noreferrer"`. Account number MUST tidak masuk ke analytics/tracking events.                                      |
| **Privacy**       | Konten Contact Card (nama, nomor) dan Account Detail (nomor rekening, nominal) MUST diperlakukan sebagai data sensitif customer — tidak dikirim ke third-party analytics.                      |
| **Observability** | Error saat parse, render, atau socket update MUST di-log ke konsol dengan label `[MessageBubble:<type>]`.                                                                                      |
| **Accessibility** | Setiap bubble MUST memiliki ARIA label deskriptif. Poll MUST `role="list"`. Account number MUST `aria-label="Nomor rekening: <nomor>"`.                                                        |
| **Localization**  | Semua tanggal MUST format `id-ID`. Nominal MUST format `Intl.NumberFormat('id-ID', {style: 'currency', currency: currencyCode})`. Semua label MUST via `next-intl`.                            |

---

## **12. API / Event Contract**

### Message Schema Extension (BE → FE)

| Contract            | Method / Event                        | Producer             | Consumer                | Payload                                                                                                                               | Compatibility Notes                                                                                                |
| ------------------- | ------------------------------------- | -------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Message inbound     | Socket `conversation.message.inbound` | BE (message-service) | FE ConversationChatRoom | Extend `messageType` enum: + `contact_card`, `poll`, `event`, `link_preview`, `account_detail`, `order`. Tambah typed payload fields. | Backward compatible — consumer tidak kenal tipe baru MUST render UnsupportedBubble. Unknown fields MUST diabaikan. |
| Poll state update   | Socket `conversation.poll.updated`    | BE                   | FE PollBubble           | `{ pollId, options: [{name, voteCount}], totalVotes }`                                                                                | New event                                                                                                          |
| Order status update | Socket `conversation.order.updated`   | BE                   | FE OrderBubble          | `{ orderId, status, totalAmount, itemCount }`                                                                                         | New event                                                                                                          |
| Poll state fetch    | `GET /api/messages/:messageId/poll`   | FE                   | BE                      | —                                                                                                                                     | `{ pollId, question, options, totalVotes, selectableCount }` — New endpoint                                        |

### Message Payload Schema

```typescript
// Enum diperluas
type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "voice_note" // existing
  | "contact_card"
  | "poll"
  | "event"
  | "link_preview" // v1.0
  | "account_detail"
  | "order"; // v1.1 NEW

interface InboundMessage {
  id: string;
  conversationId: string;
  messageType: MessageType;
  timestamp: string;
  sender: { id: string; name: string; type: "customer" | "agent" };

  // Typed payloads — hanya ada jika messageType match
  contactCardPayload?: ContactCardPayload;
  pollPayload?: PollPayload;
  eventPayload?: EventPayload;
  linkPreviewPayload?: LinkPreviewPayload;
  accountDetailPayload?: AccountDetailPayload; // NEW v1.1
  orderPayload?: OrderPayload; // NEW v1.1
}

// NEW v1.1
interface AccountDetailPayload {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  amount?: number; // sudah dalam unit display (bukan *1000)
  currencyCode?: string; // default "IDR"
  note?: string;
  expiryTimestamp?: string; // ISO 8601
}

// NEW v1.1
interface OrderPayload {
  orderId: string;
  orderTitle: string;
  itemCount: number;
  totalAmount: number; // sudah dikonversi dari totalAmount1000/1000 di BE
  currencyCode: string;
  status: "INQUIRY" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  thumbnailUrl?: string; // BE convert bytes → URL via /api/media/
  message?: string;
  sellerJid: string;
  token: string; // disimpan BE untuk keperluan fetch detail Phase 2
}
```

### Baileys Mapping (BE Internal)

| Baileys Message Type                         | Internal `messageType` | Catatan                                                                                           |
| -------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| `contactMessage`                             | `contact_card`         | Parse `displayName` + `TEL` dari `vcard`                                                          |
| `contactsArrayMessage`                       | `contact_card`         | Multi-kontak — wrap dalam array                                                                   |
| `pollCreationMessage`                        | `poll`                 | Init `voteCount: 0` per opsi                                                                      |
| `pollUpdateMessage`                          | —                      | Tidak jadi pesan baru — update state, emit `conversation.poll.updated`                            |
| `eventMessage`                               | `event`                | Map fields langsung                                                                               |
| `extendedTextMessage` (dengan `matchedText`) | `link_preview`         | Hanya jika `canonicalUrl` tersedia                                                                |
| `requestPaymentMessage`                      | `account_detail`       | **⚠️ Perlu konfirmasi Engineering** — kandidat utama untuk Account Detail di Baileys. Lihat OQ-7. |
| `orderMessage`                               | `order`                | `totalAmount = totalAmount1000 / 1000`. Thumbnail bytes → upload ke media storage → URL.          |

---

## **13. Dependencies & Risks**

| Dependency / Risk                                                                     | Owner           | Impact                                                          | Mitigation                                                                                 |
| ------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| BE konfirmasi bahwa Baileys sudah forward 6 tipe ini ke message schema                | Engineering     | Blocker — FE tidak bisa develop tanpa data terstruktur          | Spike/PoC di BE sebelum FE sprint                                                          |
| **Baileys type untuk Account Detail belum dikonfirmasi** (OQ-7)                       | Engineering     | Account Detail bubble tidak bisa diimplementasikan              | Engineering harus identifikasi Baileys type yang tepat dan konfirmasi ke PM sebelum sprint |
| **Order item detail membutuhkan `getOrderDetails()` dari WhatsApp API**               | Engineering     | Detail per-item tidak tersedia dari `orderMessage` payload saja | Phase 1: tampilkan summary saja. Phase 2: tambahkan fetch `getOrderDetails`                |
| Poll vote aggregation race condition                                                  | Engineering     | Vote count tidak akurat                                         | Atomic increment Redis per `pollId` + option                                               |
| Socket disconnect → poll/order count stale                                            | Engineering     | Agen melihat angka lama                                         | Re-fetch REST saat room re-open                                                            |
| Order thumbnail bytes di Baileys perlu di-convert ke URL                              | Engineering     | FE tidak bisa render bytes langsung                             | BE upload thumbnail ke media storage, forward URL ke FE                                    |
| Baileys versi baru mengubah `orderMessage` atau `requestPaymentMessage` schema        | Engineering     | Parser error di BE                                              | Abstract Baileys mapping di adapter layer                                                  |
| PM belum konfirmasi: save contact dari bubble ke Contact DB (OQ-1)                    | Product Manager | Scope ContactCardBubble Phase 2                                 | Defer Phase 2; Phase 1 read-only                                                           |
| PM belum konfirmasi: `totalAmount = 0` di Order tampilkan "Rp 0" atau "Gratis" (OQ-9) | Product Manager | Label di OrderBubble                                            | Default "Rp 0" sampai PM konfirmasi                                                        |

---

## **14. Success Metrics**

| KPI                                                                            | Target                                                    | Time Window          | Data Source                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------------- | -------------------- | ------------------------------------------ |
| % pesan 6 tipe yang tampil dengan bubble benar (bukan fallback/blank)          | ≥98%                                                      | 2 minggu post-launch | FE log — bubble render error tracking      |
| % crash atau blank bubble tipe tidak dikenal                                   | 0%                                                        | Ongoing              | Sentry / error monitoring                  |
| Penurunan handling time percakapan yang mengandung Order atau Account Detail   | ≥15% vs baseline                                          | 30 hari post-launch  | Analytics — avg conversation handling time |
| Poll vote count update latency via socket                                      | ≤2s dari saat customer vote sampai agen melihat perubahan | Ongoing              | Performance monitoring                     |
| % OrderBubble yang tampil lengkap (thumbnail + title + count + total + status) | ≥95% dari semua order masuk                               | 30 hari post-launch  | FE log — field completeness tracking       |

---

## **15. Future Considerations**

| Topic                                                | Why It Matters Later                                                                                                                   |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Order item detail per-baris**                      | Agen melihat nama produk, qty, harga per item — butuh `getOrderDetails()` dari WhatsApp API. Ditunda karena complexity fetch terpisah. |
| **Accept/Decline Order dari SatuInbox**              | Agen dapat merespons order langsung dari bubble tanpa pindah ke WhatsApp. Butuh WA Business API integration.                           |
| **Save contact dari bubble ke SatuInbox Contact DB** | Meningkatkan efisiensi CRM. Butuh Contact write + duplicate check.                                                                     |
| **Konfirmasi pembayaran dari Account Detail bubble** | Agen tandai pembayaran sudah diterima langsung dari bubble. Butuh integrasi sistem pembayaran.                                         |
| **Tampilkan nama voter pada Poll**                   | Butuh voter identity tracking yang kompleks di BE.                                                                                     |
| **Agent vote pada Poll**                             | Butuh WA API support untuk agent vote.                                                                                                 |
| **Real-time Order status update**                    | Socket `conversation.order.updated` sudah didefinisikan — implementasi penuh di Phase 2.                                               |
| **Security proxy untuk Link Preview URL**            | Melindungi agen dari URL malicious. Butuh proxy infrastructure.                                                                        |
| **Support channel lain**                             | Extend tipe-tipe ini ke WA Official API dan channel lain.                                                                              |

---

## **16. Limitations**

| Limitation                                                                                | Impact                                                                     |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Phase 1 hanya support inbound dari WhatsApp Web — bukan WA Official API atau channel lain | Customer dari channel non-WA Web tidak mendapat tampilan khusus            |
| Order hanya menampilkan summary — tidak ada detail per item                               | Agen tidak tahu produk spesifik apa yang dipesan tanpa membuka WA langsung |
| Poll vote count real-time via socket best-effort                                          | Jika socket disconnect, agen melihat angka lama hingga reload room         |
| Baileys type untuk Account Detail belum dikonfirmasi Engineering                          | Account Detail mungkin tidak dapat diimplementasikan sampai OQ-7 dijawab   |
| Order thumbnail diambil dari Baileys bytes — kualitas tergantung WA                       | Thumbnail mungkin beresolusi rendah atau tidak tersedia                    |
| Account number ditampilkan full — tidak ada masking                                       | Pertimbangkan data masking policy jika diperlukan (lihat OQ-10)            |

---

## **17. Appendix**

### Glossary

| Term              | Definition                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Contact Card      | Pesan WhatsApp berisi informasi kontak (vCard format), dikirim via "Share Contact"                               |
| Poll              | Jajak pendapat via fitur Poll WhatsApp — pertanyaan + opsi pilihan                                               |
| Event             | Undangan atau jadwal via fitur Event WhatsApp                                                                    |
| Link Preview      | Teks berisi URL yang di-enrich Baileys dengan OG metadata                                                        |
| Account Detail    | Pesan berisi informasi rekening bank atau payment method untuk keperluan transfer pembayaran                     |
| Order             | Pesanan customer via WhatsApp Business Catalog — berisi summary produk, jumlah, total harga                      |
| vCard             | Format standar (RFC 6350) untuk informasi kontak dalam teks terstruktur                                          |
| OG Metadata       | Open Graph metadata (og:title, og:description, og:image) dari halaman web                                        |
| Baileys           | Library open-source untuk komunikasi dengan WhatsApp Web protocol di BE SatuInbox                                |
| UnsupportedBubble | Bubble fallback untuk tipe pesan yang belum dikenal FE                                                           |
| `totalAmount1000` | Konvensi Baileys: amount × 1000 disimpan sebagai integer. BE MUST konversi ke amount asli sebelum dikirim ke FE. |

### UI Labels (Bahasa Indonesia)

| Label                    | Context                                                                     |
| ------------------------ | --------------------------------------------------------------------------- |
| "Jajak Pendapat"         | Header label pada PollBubble                                                |
| "Dibatalkan"             | Badge pada EventBubble (`isCanceled`) dan OrderBubble (status CANCELLED)    |
| "Pesan tidak didukung"   | Text pada UnsupportedBubble                                                 |
| "Kontak Tidak Diketahui" | Fallback nama ContactCardBubble                                             |
| "Detail Rekening"        | Header label pada AccountDetailBubble                                       |
| "Kedaluwarsa"            | Badge pada AccountDetailBubble jika `expiryTimestamp` lewat                 |
| "Pesanan"                | Header label pada OrderBubble                                               |
| "Menunggu"               | Badge OrderBubble status INQUIRY — kuning                                   |
| "Diterima"               | Badge OrderBubble status ACCEPTED — hijau                                   |
| "Ditolak"                | Badge OrderBubble status DECLINED — merah                                   |
| Format tanggal Event     | `EEEE, d MMMM yyyy, HH.mm` locale `id-ID`                                   |
| Format nominal           | `Intl.NumberFormat('id-ID', { style: 'currency', currency: currencyCode })` |
| Format jumlah item       | "{n} item"                                                                  |

### Open Questions

| ID    | Pertanyaan                                                                                                         | Impact                                             | Owner                              |
| ----- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ---------------------------------- |
| OQ-1  | Apakah agen bisa save Contact Card langsung ke SatuInbox Contact DB dari bubble?                                   | Ada/tidaknya CTA Phase 2 di ContactCardBubble      | Product Manager                    |
| OQ-2  | Poll: tampilkan nama voter per opsi, atau cukup count?                                                             | Complexity aggregation BE                          | Product Manager                    |
| OQ-3  | Jika poll update masuk saat room tidak terbuka, apakah perlu notifikasi unread?                                    | Notification + badge design                        | Product Manager                    |
| OQ-4  | Event RSVP status dari customer perlu ditampilkan?                                                                 | Parser tambahan BE + field baru                    | Product Manager                    |
| OQ-5  | Link preview perlu security proxy?                                                                                 | Infrastruktur proxy + latency                      | Engineering Lead                   |
| OQ-6  | Behavior 6 tipe ini di channel WA Official API?                                                                    | Schema channel-agnostic atau WA-Web-specific?      | Engineering Lead                   |
| OQ-7  | **Baileys type yang tepat untuk Account Detail?** `requestPaymentMessage`? `paymentInviteMessage`? Atau tipe lain? | **Blocker untuk implementasi AccountDetailBubble** | Engineering Lead                   |
| OQ-8  | Order item detail per-baris: apakah Phase 1 perlu `getOrderDetails()` fetch, atau summary cukup?                   | Scope OrderBubble Phase 1 vs Phase 2               | Product Manager + Engineering Lead |
| OQ-9  | `totalAmount = 0` di Order ditampilkan sebagai "Rp 0" atau "Gratis"?                                               | Label di OrderBubble                               | Product Manager                    |
| OQ-10 | Account number perlu di-masking (contoh: "1234 \***\* \*\*** 7890")?                                               | Security dan privacy policy                        | Product Manager + Compliance       |

### References

| Item                       | Link / Path                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| PRD Conversation Room v1.1 | `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Conversation Room.md` |
| Analysis file              | `temp analysis/Analysis - WhatsApp Special Message Types Display.md`       |
| CLAUDE-fe.md               | `Memory/CLAUDE-fe.md`                                                      |
| CLAUDE-be.md               | `Memory/CLAUDE-be.md`                                                      |
| Global Memory              | `Memory/global-memory.md`                                                  |
| WhatsApp Web V2 Comparison | `Memory/whatsapp-web-v1-vs-v2-comparison.md`                               |
