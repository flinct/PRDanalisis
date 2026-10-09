# Research: Storage Local vs Cloud — WhatsApp/Telegram/Discord & Kelayakan Adaptasi SatuInbox

> Tujuan: jawab apakah SatuInbox bisa mengadopsi metode storage sistem messaging skala miliaran pesan.
> Metode: riset eksternal (orchestrator, 2 worker paralel). Tiap klaim angka/fakta cite URL. Klaim sumber sekunder/blog ditandai; yang tak dapat diverifikasi ditandai **[tidak terkonfirmasi]**.
> Relevansi SatuInbox: WEB app, multi-tenant, multi-agent, agent-facing. Stack: NestJS + gRPC + RabbitMQ + MongoDB + Socket.IO.
> Pelengkap file: `infra-retention-mau-traffic-research.md` (retention/MAU/traffic → tier) di folder yang sama.

---

## TL;DR — Verdict

**Model on-device/local-first ala WhatsApp TIDAK cocok untuk SatuInbox.** SatuInbox web + multi-agent butuh history TERPUSAT lintas device/sesi (handover percakapan, audit, SLA). Model yang realistis = **cloud server-side** (ala Telegram/Discord) + **tiered storage** (hot MongoDB → cold archive) + **object storage + CDN + signed URL** untuk media. Diterapkan bertahap, zero-regression.

---

## 1. Di mana platform besar menyimpan pesan?

| Platform | Model | Lokasi pesan | Bukti |
|---|---|---|---|
| **WhatsApp** | **Local-first** | Di **device**; server hanya transit (ciphertext antre, dihapus setelah terkirim; pesan gagal ≤30 hari) | [WhatsApp Privacy Policy EEA](https://www.whatsapp.com/legal/privacy-policy-eea) |
| **Telegram** | **Cloud-first** | Cloud chat di **server** (sinkron multi-device, client–server encryption, Telegram bisa akses konten); secret chat = on-device E2EE | [Telegram Privacy §3.3](https://telegram.org/privacy); [ESET](https://www.eset.com/blog/en/home-topics/privacy-and-identity-protection/telegram-privacy-explained/) |
| **Discord** | **Server-side** | DB terdistribusi; **triliunan** pesan di 177 node (2022) | [Discord — Stores Trillions](https://discord.com/blog/how-discord-stores-trillions-of-messages) |
| **Signal** | **Server minimal** | Server hanya antre sementara; tak simpan kontak/graph/percakapan | [Signal — Sealed Sender](https://signal.org/blog/sealed-sender/) |
| **Slack** | **Server-side** | Pesan dipersist SEBELUM dikirim via websocket; MySQL→Vitess | [Slack Eng — Vitess](https://slack.engineering/scaling-datastores-at-slack-with-vitess/) |

### Poin kunci (bukti nyata)
- **WhatsApp local-first**: *"Typically your messages are stored on your device(s) and not on our servers"* — backup ke Google Drive/iCloud (infra Google/Apple, bukan WhatsApp), E2EE backup opt-in (AES-256, client-side, password/64-digit key) ([WhatsApp Policy](https://www.whatsapp.com/legal/privacy-policy-eea); [WhatsApp FAQ E2EE backup](https://faq.whatsapp.com/490592613091019)). DB on-device = SQLite; WhatsApp Web = IndexedDB ([Medium analisis, sekunder](https://medium.com/@emmaakachukwu/whatsapp-webs-data-journey-storage-locations-and-end-to-end-encryption-412a0812cbb8)). Infra server era Erlang: ~550 server, 19 miliar pesan masuk/hari (2014; infra Meta terkini **[tidak terkonfirmasi]**) ([HighScalability](https://highscalability.com/how-whatsapp-grew-to-nearly-500-million-users-11000-cores-an/)).
- **Telegram cloud**: *"We store messages, photos, videos and documents from your cloud chats on our servers so that you can access your data from any of your devices anytime"* — 5 datacenter terdistribusi (DC1–DC5), kunci cloud chat tersebar antar-jurisdiksi; retensi akun inaktif auto-delete 18 bulan ([Telegram Privacy](https://telegram.org/privacy)). ~70 miliar pesan/hari **[sumber sekunder]** ([Frugal Testing](https://www.frugaltesting.com/blog/how-telegram-ensures-speed-reliability-at-massive-scale)).
- **Discord server-side**: skema partisi `(channel_id, bucket)` + Snowflake ID; Cassandra → **ScyllaDB** (shard-per-core, no GC) saat 177 node triliunan pesan; migrasi 3,2 juta pesan/detik; **data service gRPC** di depan DB dengan **request coalescing** (banyak pembaca baris sama → 1 query DB) untuk tahan hot partition ([Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages); [ScyllaDB](https://www.scylladb.com/tech-talk/how-discord-migrated-trillions-of-messages-from-cassandra-to-scylladb/)).
- **Slack**: pesan **dipersist sebelum dikirim** ke websocket (storage = jalur kritis); Vitess layani 2,3 juta QPS puncak, median 2ms ([Slack Eng](https://slack.engineering/scaling-datastores-at-slack-with-vitess/)).

---

## 2. Local vs Cloud — trade-off

| Dimensi | Local/on-device | On-premise | Cloud (S3 + managed DB) | Hybrid/tiered |
|---|---|---|---|---|
| Biaya | ~0 bagi penyedia (beban ke user) | CapEx besar + ops | OpEx per GB/request/egress | Optimal: panas mahal, dingin murah |
| Latensi | Instan lokal; sync lintas-device rumit | Rendah di lokasi | Rendah di region sama | Panas cepat, dingin lambat (OK arsip) |
| Durability | Rentan hilang (device) | Redundansi sendiri | **11 nines** (S3) | Tinggi |
| Multi-device sync | Sulit/rumit | — | Native | Native |
| Audit/compliance | Sulit (tersebar) | Kendali penuh | Pilih region/residency | Terbaik |

Sumber: [CloudZero S3](https://www.cloudzero.com/blog/s3-pricing/), [DataBank TCO](https://www.databank.com/resources/blogs/on-prem-vs-cloud-cost-comparison-10-cost-factors-you-must-compare-before-deciding/), [DBSync](https://www.mydbsync.com/blogs/object-storage-vs-databases).

**Kapan local dipilih:** privacy/E2EE prioritas, komunikasi 1:1 device-bound (WhatsApp/Signal). **Kapan cloud:** multi-device sync, searchability, audit/retention, kolaborasi (Telegram/Discord/Slack) — persis kebutuhan CS multi-agent.

---

## 3. Tiered storage (hot→warm→cold) — angka nyata

### S3 (us-east-1) — spread Standard→Deep Archive = **23x** ([CloudZero](https://www.cloudzero.com/blog/s3-pricing/))

| Tier | Kelas | $/GB/bln | Retrieval | Min durasi |
|---|---|---|---|---|
| Hot | S3 Standard | $0.023 | instan | — |
| Warm | Standard-IA | $0.0125 | instan +$0.01/GB | 30 hari |
| Cold | Glacier Instant | $0.004 | instan | 90 hari |
| Archive | Glacier Deep Archive | $0.00099 | s/d 12 jam | 180 hari |

Contoh: 100 TB data dingin di Standard = $2.305/bln vs Deep Archive = $101/bln → hemat ~$26.944/tahun dari satu lifecycle policy.

### MongoDB Atlas Online Archive
- Pindah data lama ke object storage, **tetap queryable** (unified query) ([MongoDB Docs](https://www.mongodb.com/docs/atlas/online-archive/overview/)).
- Cluster SSD ~$0.25/GB/bln vs Online Archive ~$0.023/GB/bln → **10–30x lebih murah** ([OneUptime](https://oneuptime.com/blog/post/2026-03-31-mongodb-how-to-use-atlas-online-archive-to-reduce-storage-costs/view)). Query archive $5/TB diproses ([MongoDB billing](https://www.mongodb.com/docs/atlas/billing/online-archive/)).

### Retention policy nyata (chat/CS)
- GetStream auto-delete 24 jam–5 tahun, hard-delete async ([GetStream](https://getstream.io/chat/docs/go-golang/data-retention-policy/)).
- MS Teams retention policy retain/delete; contoh kampus retensi 1 tahun demi tekan biaya ([Microsoft Learn](https://learn.microsoft.com/en-us/purview/retention-policies-teams); [UC Irvine](https://www.oit.uci.edu/org/projects/chat-message-retention/)).

---

## 4. Object storage untuk media/attachment

**Media JANGAN disimpan di DB transaksional:** BLOB besar naikkan memori, perlambat query, risiko OOM; batas field PG ~1GB, MySQL ~4GB ([Engineering At Scale](https://engineeringatscale.substack.com/p/when-to-use-blob-storage-vs-database)). Media = unstructured/immutable → cocok object storage ([DBSync](https://www.mydbsync.com/blogs/object-storage-vs-databases)).

**Pola benar:**
1. Blob di object storage (S3/GCS/MinIO); metadata + object key di MongoDB.
2. Upload **client↔S3 via pre-signed URL** (bypass app server) ([dev.to](https://dev.to/ehsaantech/aws-s3-pre-signed-urls-your-key-to-secure-media-uploads-35kl)).
3. Serve via **CDN + signed URL** (CloudFront) untuk cache + kontrol akses ([AWS Docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html)).

Alternatif hemat: Wasabi $6.99/TB, Cloudflare R2 $15/TB (no egress) ([s3compare](https://www.s3compare.io/)); on-prem → MinIO (S3-compatible, data residency).

---

## 5. Kelayakan SatuInbox

### 5.1 Verdict per model

| Model | Kelayakan | Alasan |
|---|---|---|
| On-device/local-first (WhatsApp) | ❌ **TIDAK** | Agent lintas device/sesi/shift butuh history terpusat konsisten; handover + audit + SLA menuntut source-of-truth server. Local-first paksa sync/CRDT rumit tapi tetap tak jawab audit/compliance. |
| Cloud server-side (Telegram/Discord) | ✅ **COCOK** | Server = source of truth, client tipis, konsisten lintas device, mudah diaudit. Discord bukti skala triliunan. |
| Hybrid + tiered | ✅ **WAJIB** | Panas di MongoDB, dingin+media di object storage → 10–30x lebih murah pada volume dingin. |

### 5.2 Dampak ke komponen SatuInbox
- **MongoDB**: performa = working set (data panas + index) di RAM. History menumpuk di cluster utama → RAM naik nonlinear → biaya naik. Arsip data lama mengecilkan working set → biaya turun. Sharding per `tenant/channel_id` + bucket waktu (ala Discord `(channel_id, bucket)`) kurangi hot partition.
- **RabbitMQ**: BUKAN storage jangka panjang. Queue = buffer transit; muat *event/referensi*, bukan blob. Backlog besar = beban RAM/disk broker.
- **Socket.IO**: pesan **dipersist dulu sebelum broadcast** (pola Slack) — konsistensi, tak ada pesan hilang.
- **Search lintas percakapan** (Global Search — fitur yang belum ada): butuh **index terpisah** (ala Discord/Elasticsearch), bukan query langsung ke store transaksional.

### 5.3 Rekomendasi layout

| Data | Tempat | Alasan |
|---|---|---|
| Pesan aktif (<30–90 hari) | MongoDB (hot) | real-time, index |
| Pesan lama | Online Archive / Glacier Instant | 10–30x murah, tetap queryable |
| Media/attachment | Object storage + CDN + signed URL | unstructured, hemat, scalable |
| Audit/log | Glacier Deep Archive / WORM | $0.00099/GB/bln |
| Queue | RabbitMQ transit saja | cegah backlog permanen |

### 5.4 Risiko & zero-perf constraint
- **Effort tinggi**: butuh data service / query router yang pisahkan hot vs archive transparan (preseden Discord = program multi-tahun + data service gRPC).
- **Zero-regression**: migrasi **online** (dual-write + backfill → cutover), perluas query layer tanpa ubah API/contract. Query arsip lebih lambat — hanya untuk data lama, **jangan di hot path**.
- **Data residency**: pilih region object storage atau MinIO on-prem.
- **Biaya tersembunyi**: request/egress/retrieval fee bisa gerus penghematan bila salah taruh tier.

---

## 6. Hubungan ke tier paket (sambung ke `infra-retention-mau-traffic-research.md`)
Storage model ini MEMPERKUAT lever tier di file retention/MAU/traffic:
- **Retention pendek di Basic** = data cepat turun ke cold/archive = hemat 23x (hot vs deep archive). Retention panjang/unlimited Enterprise = biaya hot storage lebih besar → wajar jadi pembeda tier.
- **Media quota per tier**: object storage + CDN berbiaya per GB + egress → batas penyimpanan media wajar jadi lever tier.
- **Global Search** (fitur belum ada): butuh index terpisah (infra tambahan) → wajar Premium+, bukan sekadar "fitur".

---

## 7. Belum terkonfirmasi / butuh data internal
- Infra WhatsApp terkini di bawah Meta (angka Erlang = historis 2014).
- Telegram 70 miliar pesan/hari + lokasi DC = sumber sekunder, perlu verifikasi.
- **Data SatuInbox nyata**: ukuran dokumen pesan rata-rata MongoDB, cost cluster, volume media, profil concurrency Socket.IO — tanpa ini, angka biaya/tier masih estimasi.

---

## Sumber (gabungan)
WhatsApp: whatsapp.com/legal/privacy-policy-eea · faq.whatsapp.com/490592613091019 · highscalability.com/how-whatsapp-grew · wire.com/en/blog/whatsapp-end-to-end-encryption-risks · phish-def.com (E2EE backup) · medium @emmaakachukwu (sekunder)
Telegram: telegram.org/privacy · eset.com telegram-privacy-explained · frugaltesting.com (sekunder) · dev.moe/en/3025 (sekunder)
Discord: discord.com/blog/how-discord-stores-trillions-of-messages · how-discord-indexes-trillions-of-messages · scylladb.com tech-talk
Signal: signal.org/blog/sealed-sender · signal-is-expensive
Slack: slack.engineering/scaling-datastores-at-slack-with-vitess
Storage/cost: cloudzero.com/blog/s3-pricing · mongodb.com/docs/atlas/online-archive · oneuptime.com (Atlas archive) · s3compare.io · engineeringatscale.substack.com · mydbsync.com object-storage-vs-databases · aws.amazon.com/s3/pricing
Media/CDN: dev.to AWS S3 pre-signed URLs · docs.aws.amazon.com CloudFront signed-urls
Retention: getstream.io data-retention-policy · learn.microsoft.com retention-policies-teams · oit.uci.edu chat-message-retention
TCO: 45drives.com · databank.com · sms.com cloud-vs-onpremises
