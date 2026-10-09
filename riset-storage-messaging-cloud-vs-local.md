# Arsitektur Storage Sistem Messaging Skala Miliaran Pesan
### WhatsApp, Telegram, Discord (+ Signal & Slack) — Cloud vs On-Device, dan Bagaimana Mereka Menyimpannya

**Konteks:** riset untuk tim produk SatuInbox (customer-service omnichannel; NestJS, RabbitMQ, MongoDB, Socket.IO). Tujuan: memahami pola penyimpanan pesan nyata di platform skala besar sebagai referensi desain.
**Metode:** setiap angka/klaim ditautkan ke URL sumber. Klaim dari sumber sekunder (blog analis, vendor, Wikipedia) ditandai. Klaim yang tidak dapat diverifikasi dari sumber resmi ditandai **[tidak terkonfirmasi]**.

---

## 1. WhatsApp — Storage Lokal (On-Device) sebagai Default; Server Hanya Transit

**Ringkasan satu baris:** WhatsApp adalah contoh arsitektur *local-first* — konten pesan hidup di perangkat, server hanya menampung pesan terenkripsi dalam antrean sementara sampai terkirim.

### 1.1 Di mana pesan disimpan
Kebijakan privasi resmi WhatsApp menyatakan eksplisit: *"Typically your messages are stored on your device(s) and not on our servers. We temporarily store your messages in encrypted form while they are being delivered. Once your messages are delivered, they are deleted from our servers."* ([WhatsApp Privacy Policy – EEA](https://www.whatsapp.com/legal/privacy-policy-eea)).

- **Pesan terkirim:** disimpan di perangkat; begitu terkirim, dihapus dari server ([WhatsApp Privacy Policy – EEA](https://www.whatsapp.com/legal/privacy-policy-eea)).
- **Pesan gagal kirim:** disimpan terenkripsi di server **maksimum 30 hari**, lalu dihapus ([WhatsApp Privacy Policy – EEA](https://www.whatsapp.com/legal/privacy-policy-eea)).
- Ini konsisten dengan arsitektur server era Erlang: *"Messages and multimedia are only stored while they are being delivered"* ([HighScalability – How WhatsApp Grew](https://highscalability.com/how-whatsapp-grew-to-nearly-500-million-users-11000-cores-an/)).

### 1.2 Peran E2E encryption
WhatsApp memakai **Signal Protocol**; enkripsi/dekripsi terjadi di klien, dan kunci ada di perangkat — bukan di server ([analisis WhatsApp Web, Medium](https://medium.com/@emmaakachukwu/whatsapp-webs-data-journey-storage-locations-and-end-to-end-encryption-412a0812cbb8)). Karena server hanya menyimpan ciphertext dalam antrean, WhatsApp tidak bisa membaca isi pesan. **Batasan penting:** E2EE melindungi *isi pesan*, bukan **metadata** (info perangkat, IP, dll.) yang tetap dicatat dan disimpan di server ([Wire – WhatsApp E2E Encryption Risks](https://wire.com/en/blog/whatsapp-end-to-end-encryption-risks)).

### 1.3 Backup (iCloud / Google Drive) — siapa host dan siapa pegang kunci
- Backup chat disimpan di **Google Drive (Android)** atau **iCloud (iOS)** — yaitu infrastruktur Google/Apple, bukan server WhatsApp ([Wire](https://wire.com/en/blog/whatsapp-end-to-end-encryption-risks)).
- Secara historis backup **tidak dienkripsi E2E** (dibaca Google/Apple); WhatsApp kemudian menambah **End-to-End Encrypted Backup** yang bersifat **opt-in** — diaktifkan manual dengan **password** atau **64-digit key** ([Wire](https://wire.com/en/blog/whatsapp-end-to-end-encryption-risks); [PhishDef – WhatsApp E2EE Backup](https://phish-def.com/blog/cybersecurity/whatsapps-end-to-end-encrypted-backup-feature/)).
- Fitur backup terenkripsi memakai **AES-256**, enkripsi **client-side** (data dienkripsi di perangkat sebelum diunggah) — sehingga Google/Apple/Meta tidak bisa mendekripsinya ([PhishDef](https://phish-def.com/blog/cybersecurity/whatsapps-end-to-end-encrypted-backup-feature/); [WhatsApp FAQ – About end-to-end encrypted backup](https://faq.whatsapp.com/490592613091019)).
- **Konsekuensi:** kehilangan password/key = kehilangan akses ke riwayat backup ([WhatsApp FAQ](https://faq.whatsapp.com/490592613091019)).

### 1.4 Media store
Media dalam pesan disimpan terenkripsi di server **hingga 30 hari** untuk membantu pengiriman efisien (mis. saat penerima mem-forward) — server tidak bisa melihat isinya ([WhatsApp Privacy Policy – EEA](https://www.whatsapp.com/legal/privacy-policy-eea)).

### 1.5 DB on-device (SQLite?)
- Aplikasi native WhatsApp menyimpan pesan di **SQLite** (database embedded), dan melakukan backup lokal harian (mis. ~pukul 02:00) ke storage perangkat ([analisis, Medium](https://medium.com/@emmaakachukwu/whatsapp-webs-data-journey-storage-locations-and-end-to-end-encryption-412a0812cbb8)). Catatan: ini sumber sekunder (analisis pihak ketiga), bukan dokumentasi resmi WhatsApp.
- **WhatsApp Web/desktop** menyimpan data di **IndexedDB** browser; store `signal-storage` menampung material kunci Signal (registration id, identity key, pre-keys, session) — mengonfirmasi bahwa state kripto tinggal di klien ([Medium](https://medium.com/@emmaakachukwu/whatsapp-webs-data-journey-storage-locations-and-end-to-end-encryption-412a0812cbb8)).

### 1.6 Infra server (sejarah Erlang)
- WhatsApp dibangun dengan **Erlang** (dan FreeBSD) — tercatat di infobox Wikipedia ([Wikipedia – WhatsApp](https://en.wikipedia.org/wiki/WhatsApp)).
- Pada puncak arsitektur Erlang (era ~2014): **±550 server**, **>11.000 core**, **~2 juta koneksi per server** (kemudian diturunkan ke ~1 juta untuk headroom), database in-memory **Mnesia** (~2 TB RAM, 16 partisi, ~18 miliar record), dan **19 miliar pesan masuk / 40 miliar keluar per hari** ([HighScalability](https://highscalability.com/how-whatsapp-grew-to-nearly-500-million-users-11000-cores-an/)).
- Riwayat: pesan dan media **hanya disimpan selama proses pengiriman**; backend menahan pesan selama transit antar pengguna ([HighScalability](https://highscalability.com/how-whatsapp-grew-to-nearly-500-million-users-11000-cores-an/)).
- **[Catatan]** Angka Erlang di atas bersifat **historis** (presentasi 2014). Infrastruktur produksi WhatsApp saat ini (di bawah Meta) tidak dipublikasikan secara rinci — arsitektur terkini **[tidak terkonfirmasi]**.

---

## 2. Telegram — Cloud-First, Dua Mode Storage yang Berbeda Total

**Ringkasan satu baris:** Telegram default-nya **cloud** (pesan di server, sinkron multi-perangkat), dengan **secret chat** sebagai jalur E2E yang murni on-device.

### 2.1 Cloud chats (default) — pesan di server
Kebijakan privasi resmi: *"Telegram is a cloud service. We store messages, photos, videos and documents from your cloud chats on our servers so that you can access your data from any of your devices anytime... All data is stored heavily encrypted and the encryption keys in each case are stored in several other data centers in different jurisdictions."* ([Telegram Privacy Policy, §3.3.1 Cloud Chats](https://telegram.org/privacy)).
- Karena cloud, cloud chats **tersinkron ke semua perangkat** (multi-device) tanpa backup pihak ketiga ([Telegram Privacy Policy](https://telegram.org/privacy); [ESET – Telegram Privacy Explained](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).
- **Penting:** cloud chat memakai **client–server encryption** (bukan E2EE). Pesan didekripsi di server agar bisa dikirim ke penerima, lalu disimpan di cloud — artinya **Telegram punya akses teknis ke konten** ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).
- Grup (hingga 200.000 anggota) dan channel publik juga **cloud chat** (bukan E2EE) ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).

### 2.2 Secret chats (on-device, E2EE)
- *"Secret chats use end-to-end encryption... We do not store your secret chats on our servers. We also do not keep any logs for messages in secret chats"* ([Telegram Privacy Policy, §3.3.2 Secret Chats](https://telegram.org/privacy)).
- Media di secret chat dienkripsi dengan kunci terpisah sebelum upload; server hanya melihat data acak, dan kuncinya tidak diketahui server ([Telegram Privacy Policy, §3.3.3](https://telegram.org/privacy)).
- Secret chat **terikat ke device** tempat ia dimulai — **tidak bisa diakses dari perangkat lain** (tidak ikut sinkron cloud) ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).
- Dilengkapi opsi **self-destruct timer** (pesan hilang setelah dibaca) ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).

### 2.3 MTProto
- Telegram memakai protokol miliknya sendiri, **MTProto 2.0** (AES-256, SHA-256), baik untuk cloud chat (client–server) maupun secret chat (E2E) ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).
- MTProto dikritik karena **tidak sepenuhnya open untuk audit independen**, berbeda dari protokol Signal ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).

### 2.4 Datacenter terdistribusi
- Wikipedia: *"Its servers are distributed worldwide with several data centers"* ([Wikipedia – Telegram](https://en.wikipedia.org/wiki/Telegram_(software))).
- Analisis pihak ketiga: Telegram mengklaim **5 data center (DC1–DC5)** — DC1 & DC3 di Miami (AS), DC2 & DC4 di Amsterdam (Belanda), DC5 di Singapura. Setiap akun dikaitkan ke **satu DC saat registrasi** dan tidak berpindah ([Coxxs/dev.moe – Mysteries of Telegram DC](https://dev.moe/en/3025)). Sumber ini **pihak ketiga [tidak resmi]**, tapi konsisten dengan penamaan DC di kode klien Telegram.
- Kebijakan privasi mengonfirmasi distribusi jurisdiksi: kunci enkripsi cloud chat "disimpan di beberapa data center lain di yurisdiksi berbeda" untuk mencegah akses engineer lokal / penyusup fisik ([Telegram Privacy Policy](https://telegram.org/privacy)).
- Pengguna di UK/EEA: data pribadi disimpan di **server di Belanda** ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).

### 2.5 Bagaimana handle miliaran pesan
- Dilaporkan menangani **>1 miliar MAU dan >70 miliar pesan/hari** (awal 2025) — angka dari artikel vendor **[sumber sekunder]** ([Frugal Testing – How Telegram Ensures Speed & Reliability](https://www.frugaltesting.com/blog/how-telegram-ensures-speed-reliability-at-massive-scale)).
- Pola yang disebut: **database sharding** (shard per-himpunan pengguna), **arsitektur event-driven + message queue**, microservices (auth, messaging, media, bots terpisah), dan load balancer lintas region ([Frugal Testing](https://www.frugaltesting.com/blog/how-telegram-ensures-speed-reliability-at-massive-scale)). **[Sumber sekunder — perlu verifikasi independen.]**
- Pesan disimpan di queue sampai ada **konfirmasi dari perangkat penerima**, untuk mencegah kehilangan ([Frugal Testing](https://www.frugaltesting.com/blog/how-telegram-ensures-speed-reliability-at-massive-scale)).

### 2.6 Retensi
- Akun tidak aktif → data cloud (pesan, media, kontak) dihapus otomatis **setelah 18 bulan** tidak online (default, bisa diubah di Settings) ([Telegram Privacy Policy, §4.1 Storing Data](https://telegram.org/privacy)).
- IP address disimpan **maksimum 12 bulan** menurut kebijakan ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).

---

## 3. Discord — Server-Side Skala Besar: Cassandra → ScyllaDB

**Ringkasan satu baris:** Discord murni *server-side* (tanpa E2EE konten) dan menjadi studi kasus paling konkret untuk menyimpan **triliunan pesan** di database terdistribusi.

### 3.1 Angka nyata
- 2017: cluster `cassandra-messages` berisi **12 node Cassandra**, menyimpan **miliaran** pesan ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- Awal 2022: **177 node**, menyimpan **triliunan (trillions)** pesan — dan menjadi sistem high-toil (on-call sering dipanggil, latensi tak terduga) ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).

### 3.2 Skema & sharding
Skema inti (versi minimal):
```sql
CREATE TABLE messages (
  channel_id bigint,
  bucket int,
  message_id bigint,
  author_id bigint,
  content text,
  PRIMARY KEY ((channel_id, bucket), message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
```
- ID memakai **Snowflake** (sortable secara kronologis); partisi = **(channel_id, bucket)** dengan `bucket` = jendela waktu statis ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- **Masalah:** di Cassandra, *read* lebih mahal daripada *write* (write ke commit log + memtable; read menembus memtable + beberapa SSTable) → **hot partition** menaikkan latensi satu node dan menjalar ke cluster (quorum reads/writes) ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- Masalah operasional: kompaksi tertinggal, tuning GC/JVM, dan "gossip dance" untuk menyembuhkan node ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).

### 3.3 Migrasi ke ScyllaDB
- Discord bermigrasi ke **ScyllaDB** (Cassandra-compatible, ditulis C++, tanpa garbage collector, **shard-per-core**). Pada 2020 hampir semua DB sudah pindah ke ScyllaDB — kecuali cluster pesan ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages); [ScyllaDB Tech Talk](https://www.scylladb.com/tech-talk/how-discord-migrated-trillions-of-messages-from-cassandra-to-scylladb/)).
- Strategi migrasi: **dual-write** ke Cassandra + ScyllaDB, lalu firehose data historis dengan migrator custom (memakai **checkpoint SQLite** untuk token range). Kecepatan migrasi hingga **3,2 juta pesan/detik**; estimasi awal 3 bulan berubah jadi **~9 hari** ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- Migrasi sempat "stuck di 99,9999%" karena range token berisi **tombstone** raksasa yang belum dikompaksi ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- **Data services** diletakkan antara API dan ScyllaDB, berisi ~1 endpoint gRPC per query DB tanpa business logic; fitur utama: **request coalescing** (banyak pembaca baris sama → satu query DB) ([How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages)).

### 3.4 Indexing / search massal
- Search memakai **Elasticsearch** dengan pesan di-shard ke banyak index; satu index = satu Lucene index dengan batas **MAX_DOC ~2 miliar dokumen/index** ([How Discord Indexes Trillions of Messages](https://discord.com/blog/how-discord-indexes-trillions-of-messages)).
- Cluster lama membengkak **>200 node**, master node sering OOM, dan bulk indexing rentan: dengan 100 node & batch 50 pesan, kegagalan **satu** node membuat **~40%** operasi bulk index gagal ([How Discord Indexes Trillions of Messages](https://discord.com/blog/how-discord-indexes-trillions-of-messages)).
- Solusi: pindah ke **Kubernetes + Elastic Kubernetes Operator (ECK)**, arsitektur **multi-cluster "cell"** yang berisi banyak cluster Elasticsearch kecil (target **~200 juta pesan / 50 GB per index**), dan mengganti antrean Redis dengan **Google PubSub** (menjamin delivery, tahan backlog) ([How Discord Indexes Trillions of Messages](https://discord.com/blog/how-discord-indexes-trillions-of-messages)).
- Pekerja indexing mengelompokkan pesan berdasarkan `Destination` (cluster + index), sehingga kegagalan satu node hanya berdampak pada batchnya ([How Discord Indexes Trillions of Messages](https://discord.com/blog/how-discord-indexes-trillions-of-messages)).

---

## 4. Signal & Slack (pembanding singkat)

### 4.1 Signal — server hanya antrean sementara, hampir tidak menyimpan apa pun
- *"When you send a message, the Signal service temporarily queues that message for delivery. As soon as your message is delivered... it can be dropped from the queue."* Storage file E2E juga temporer ([Signal – Privacy is Priceless, but Signal is Expensive](https://signal.org/blog/signal-is-expensive/)).
- Signal secara desain **tidak menyimpan** daftar kontak, social graph, daftar percakapan, lokasi, avatar, nama profil, keanggotaan grup ([Signal – Sealed Sender](https://signal.org/blog/sealed-sender/)).
- **Sealed sender** menyembunyikan identitas pengirim dari server: server hanya perlu tahu tujuan, bukan asal pesan ([Signal – Sealed Sender](https://signal.org/blog/sealed-sender/)).
- Biaya infrastruktur tahunan (per Nov 2023): **Storage $1,3 jt**, **Servers $2,9 jt**, **Registration fees $6 jt**, **Bandwidth $2,8 jt** → total **~$14 jt/tahun**; infra disewa multi-cloud (AWS, GCP, Azure) karena E2EE membuatnya aman ([Signal](https://signal.org/blog/signal-is-expensive/)).

### 4.2 Slack — MySQL/Vitess, pesan dipersist sebelum dikirim
- *"Every message sent in Slack is persisted before it's sent across the real-time websocket stack and shown to other members"* — storage adalah jalur kritis ([Slack Engineering – Scaling Datastores at Slack with Vitess](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).
- Slack memakai **MySQL** sejak awal, lalu bermigrasi ke **Vitess** (horizontal scaling untuk MySQL); Vitess kini melayani **99% query load** ([Slack Engineering](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).
- Skala: **2,3 juta QPS saat puncak** (2 juta read, 300 ribu write), **median latensi 2 ms**, **p99 11 ms** ([Slack Engineering](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).
- Arsitektur lama: sharding per **workspace id** (semua data satu workspace di satu shard) + cluster metadata + "kitchen sink"; migrasi Vitess memungkinkan sharding per **channel id** agar beban merata ([Slack Engineering](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)). Fitur **data residency** internasional dibangun di atas fleksibilitas ini ([Slack Engineering](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).
- Chat history **dipersist** (Slack dianggap hybrid E-mail/IRC karena persistensi pesannya) ([System Design – Slack Architecture](https://systemdesign.one/slack-architecture/)).

---

## 5. Pola & Trade-off

### 5.1 Kapan on-device (local), kapan cloud (server-side)

| Dimensi | On-device / local-first | Cloud / server-side |
|---|---|---|
| Contoh | WhatsApp (default), Secret Chat Telegram, Signal (konten) | Telegram cloud chat, Discord, Slack, WhatsApp (backup) |
| Konten pesan | Di perangkat (SQLite/IndexedDB); server hanya transit | Di server (Cassandra/ScyllaDB/MySQL), persisten |
| E2EE default | Ya (kunci di klien) | Tidak untuk cloud chat Telegram; Discord/Slack tidak E2E |
| Multi-device sync | Terbatas / butuh mekanisme tambahan | Native (ambil dari server kapan saja) |
| Server bisa membaca konten | Tidak | Ya (kecuali secret chat Telegram) |
| Biaya storage server | Rendah (hanya antrean sementara) | Tinggi (tumbuh tanpa batas seiring riwayat) |

Sumber baris tabel: WhatsApp Policy (https://www.whatsapp.com/legal/privacy-policy-eea), Telegram Policy (https://telegram.org/privacy), Discord blogs (https://discord.com/blog/how-discord-stores-trillions-of-messages), Slack (https://slack.engineering/scaling-datastores-at-slack-with-vitess/).

### 5.2 Trade-off utama

1. **Biaya storage.** Menyimpan semua pesan selamanya mahal secara horizontal. Signal memilih *storage-as-queue* (~$1,3 jt/tahun) justru karena tidak menyimpan permanen ([Signal](https://signal.org/blog/signal-is-expensive/)). Discord dan Slack harus berinvestasi pada cluster terdistribusi (Cassandra/ScyllaDB, MySQL/Vitess) untuk menampung riwayat ([Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages); [Slack](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).

2. **Privacy / E2EE.** E2EE menuntut kunci ada di klien → server tidak bisa membaca → server juga tidak bisa meng-index isi pesan untuk server-side search tanpa teknologi khusus. Telegram mengorbankan E2EE pada cloud chat demi fitur cloud sync; WhatsApp mempertahankan E2EE tapi menyerahkan **backup** ke cloud pihak ketiga (Google/Apple) yang secara default tidak E2E ([Wire](https://wire.com/en/blog/whatsapp-end-to-end-encryption-risks); [ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).

3. **Multi-device sync.** Cloud storage membuat sync multi-device trivial (Telegram: buka di device mana pun) ([Telegram Policy](https://telegram.org/privacy)). Model local-first (WhatsApp, secret chat Telegram) justru mengikat data ke device; secret chat Telegram **tidak** bisa dibuka di perangkat lain ([ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/)).

4. **Searchability.** Server-side search membutuhkan penyalinan/indeks tambahan: Discord membangun sistem Elasticsearch multi-cluster khusus ([Discord Indexes](https://discord.com/blog/how-discord-indexes-trillions-of-messages)). Slack memilih tetap di MySQL/Vitess dan menolak NoSQL (DynamoDB/Cassandra/Spanner) demi konsistensi relasional dan kecepatan pengembangan fitur ([Slack](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).

5. **Retention / compliance.** Cloud memudahkan retensi (dan *data residency*): Slack membangun fitur data residency di atas Vitess ([Slack](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)). Namun retensi juga menimbulkan kewajiban kepatuhan — Telegram memberi auto-delete akun tak aktif 18 bulan, dan menyimpan kunci cloud chat tersebar antar-jurisdiksi ([Telegram Policy](https://telegram.org/privacy)). Local-first menghindari masalah ini hampir seluruhnya: WhatsApp hanya menyimpan pesan gagal kirim ≤30 hari ([WhatsApp Policy](https://www.whatsapp.com/legal/privacy-policy-eea)).

### 5.3 Implikasi untuk SatuInbox (NestJS + RabbitMQ + MongoDB + Socket.IO)
- **Arsitektur SatuInbox menyerupai model cloud/server-side** (Discord/Slack/Telegram cloud), bukan local-first — pesan masuk dari pelanggan disimpan dan diproses di server. **Pola Discord/Slack yang relevan:** sharding per-tenant/channel, **request coalescing** untuk melindungi DB dari hot partition, dan penulisan pesan dipersist **sebelum** di-broadcast (seperti Slack) ([Slack](https://slack.engineering/scaling-datastores-at-slack-with-vitess/); [Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- **RabbitMQ** cocok dengan pola Telegram "pesan di queue sampai ada konfirmasi penerima" dan pola Discord "ganti Redis queue dengan PubSub agar tidak drop saat backlog" ([Frugal Testing](https://www.frugaltesting.com/blog/how-telegram-ensures-speed-reliability-at-massive-scale); [Discord Indexes](https://discord.com/blog/how-discord-indexes-trillions-of-messages)).
- **MongoDB** adalah pilihan *document store* server-side; untuk skala besar, pola sharding (mis. per `channel_id`/tenant + bucket waktu) mengurangi hot partition — analog dengan `(channel_id, bucket)` Discord ([Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- **Socket.IO**: Slack menegaskan pesan harus dipersist **sebelum** dikirim ke websocket stack, agar konsistensi dan tidak ada pesan hilang ([Slack](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).
- **Search:** jika butuh pencarian lintas percakapan, siapkan indeks terpisah (model Discord/Elasticsearch), bukan mengandalkan query langsung ke store transaksional ([Discord Indexes](https://discord.com/blog/how-discord-indexes-trillions-of-messages)).

---

## Catatan metodologi & keterbatasan
- **Sumber resmi (primary):** WhatsApp Privacy Policy, Telegram Privacy Policy, blog engineering Discord, blog Signal, blog engineering Slack.
- **Sumber sekunder (ditandai):** blog analis/vendor (ESET, Wire, PhishDef, Frugal Testing, Medium/Coxxs), dan Wikipedia. Angka dari sumber sekunder (mis. 70 miliar pesan/hari Telegram, lokasi DC Telegram, SQLite WhatsApp) dicatat sebagai **[perlu verifikasi independen]**.
- **Tidak dapat diakses saat riset:** `faq.whatsapp.com` dan `telegram.org/faq` (blocked/timeout) — klaim dari halaman tersebut hanya dikutip bila juga tercantum di sumber yang dapat diakses.
- **Historis vs terkini:** angka Erlang WhatsApp berasal dari presentasi ~2014; infrastruktur terkini di bawah Meta **[tidak terkonfirmasi]**.
- Angka Discord (triliunan pesan, 177 node, 3,2 juta pesan/detik, >200 node Elasticsearch) berasal langsung dari blog resmi Discord (2023).

---

## Sumber (18)
1. https://www.whatsapp.com/legal/privacy-policy-eea
2. https://faq.whatsapp.com/490592613091019
3. https://wire.com/en/blog/whatsapp-end-to-end-encryption-risks
4. https://wire.com/en/blog/when-opt-in-security-fails-whatsapp-backup-example
5. https://phish-def.com/blog/cybersecurity/whatsapps-end-to-end-encrypted-backup-feature/
6. https://highscalability.com/how-whatsapp-grew-to-nearly-500-million-users-11000-cores-an/
7. https://medium.com/@emmaakachukwu/whatsapp-webs-data-journey-storage-locations-and-end-to-end-encryption-412a0812cbb8
8. https://en.wikipedia.org/wiki/WhatsApp
9. https://telegram.org/privacy
10. https://en.wikipedia.org/wiki/Telegram_(software)
11. https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/
12. https://www.frugaltesting.com/blog/how-telegram-ensures-speed-reliability-at-massive-scale
13. https://dev.moe/en/3025
14. https://discord.com/blog/how-discord-stores-trillions-of-messages
15. https://discord.com/blog/how-discord-indexes-trillions-of-messages
16. https://www.scylladb.com/tech-talk/how-discord-migrated-trillions-of-messages-from-cassandra-to-scylladb/
17. https://signal.org/blog/sealed-sender/
18. https://signal.org/blog/signal-is-expensive/
19. https://slack.engineering/scaling-datastores-at-slack-with-vitess/
20. https://systemdesign.one/slack-architecture/
