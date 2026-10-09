# Riset Storage untuk SatuInbox — Local vs Cloud, Tiered Storage & Object Storage Media

> Lingkup: platform customer-service omnichannel berbasis **WEB**, multi-tenant, agent-facing.
> Stack: NestJS + gRPC + RabbitMQ + MongoDB + Socket.IO; frontend Next.js.
> Fokus masalah: biaya storage & kapasitas infra saat data percakapan (retention, MAU, message traffic) membengkak.
> TIDAK ada perubahan kode — ini laporan riset + analisa kelayakan.

---

## 1. Konsep: Local/On-Device vs On-Premise vs Cloud vs Hybrid

### 1.1 Definisi singkat
- **Local-first / on-device** — data primer hidup di perangkat klien (HP/browser lokal). Contoh arsitektur publik: WhatsApp — pesan bertahan di perangkat, backup bersifat opsional ke iCloud/Google Drive ([Medium: WhatsApp Web’s Data Journey](https://medium.com/@emmaakachukwu/whatsapp-webs-data-journey-storage-locations-and-end-to-end-encryption-412a0812cbb8)). *(Sumber sekunder untuk detail arsitektur internal — tandai **tidak terkonfirmasi resmi**.)* Konsekuensi yang banyak dilaporkan: tanpa cloud backup, history hilang saat ganti/reinstall perangkat ([Reddit/Quora diskusi WhatsApp vs Telegram](https://www.reddit.com/r/Telegram/comments/qb8wty/how_exactly_does_telegram_backs_up_my_account/)).
- **On-premise** — server fisik dikelola sendiri di datacenter. CapEx tinggi, kendali penuh, latency rendah untuk pengguna di lokasi sama; TCO mencakup listrik, tenaga kerja, dan refresh hardware ([45Drives — Cloud vs On-Prem TCO](https://www.45drives.com/blog/cloud-storage/total-cost-of-ownership-cloud-vs-on-premise-storage/); [DataBank — 10 Cost Factors](https://www.databank.com/resources/blogs/on-prem-vs-cloud-cost-comparison-10-cost-factors-you-must-compare-before-deciding/)).
- **Cloud** — object storage terkelola (S3/GCS/Azure Blob) + managed DB (mis. MongoDB Atlas). OpEx, elastis; objek S3 menyediakan durability 99,999999999% (“eleven nines”) ([CloudZero — S3 pricing](https://www.cloudzero.com/blog/s3-pricing/)).
- **Hybrid / tiered** — data panas di managed DB, data dingin di object storage/archive, media di object storage; opsional sebagian on-prem (mis. MinIO S3-compatible) untuk data residency ([DBSync — Object Storage vs Databases](https://www.mydbsync.com/blogs/object-storage-vs-databases)).

### 1.2 Trade-off (ringkas)

| Dimensi | Local/on-device | On-premise | Cloud (S3 + managed DB) | Hybrid |
|---|---|---|---|---|
| Biaya | Nyaris nol bagi penyedia (beban ke user) | CapEx besar + OpEx (listrik, SDM, refresh) | OpEx, bayar per GB/request/egress | Optimal: panas mahal, dingin murah |
| Latensi | Instan lokal; sinkronisasi lintas device lambat/rumit | Sangat rendah di lokasi | Rendah di region yang sama; egress lintas region menambah biaya | Panas cepat, dingin lebih lambat (OK untuk arsip) |
| Skalabilitas | Terbatas ke perangkat | Manual/berjenjang | Elastis, praktis tak terbatas | Elastis + kontrol biaya |
| Durability | Bergantung perangkat (rentan hilang) | Bergantung redundansi sendiri | 11 nines (S3) | Tinggi |
| Compliance/data residency | Sulit diaudit terpusat | Kendali penuh, mudah patuh residency | Pilih region / residency; cukup | Terbaik untuk residency (region/on-prem) |
| Kendali | Penuh di klien | Penuh | Terbatas pada API provider | Seimbang |

Keputusan on-prem vs cloud murni soal TCO jangka panjang: biaya cloud naik seiring retensi data (log, gambar, artefak) sementara on-prem berat di CapEx/ops ([DataBank](https://www.databank.com/resources/blogs/on-prem-vs-cloud-cost-comparison-10-cost-factors-you-must-compare-before-deciding/), [SMS — Honest TCO](https://www.sms.com/blog/cloud-vs-onpremises-cost-breakdown/)).

---

## 2. Tiered Storage: Hot → Warm → Cold/Archive

Prinsip: data yang jarang diakses cukup mahal bila tinggal di storage SSD/transaksional. Pindahkan ke tier murah.

### 2.1 Angka nyata $/GB per tier (AWS S3, us-east-1)
Dari [CloudZero — S3 pricing 2026](https://www.cloudzero.com/blog/s3-pricing/):

| Tier | Contoh kelas | $/GB/bulan | Retrieval | Min. durasi | Durability |
|---|---|---|---|---|---|
| **Hot** | S3 Standard | **$0.023** | Instan (ms) | — | 11 nines |
| Warm | S3 Standard-IA | **$0.0125** | Instan, +$0.01/GB | 30 hari | 11 nines |
| Warm | S3 One Zone-IA | **$0.01** | Instan | 30 hari | single-AZ |
| **Cold** | S3 Glacier Instant Retrieval | **$0.004** | Instan (ms) | 90 hari | 11 nines |
| Cold | S3 Glacier Flexible Retrieval | **$0.0036** | Menit–12 jam | 90 hari | 11 nines |
| **Archive** | S3 Glacier Deep Archive | **$0.00099** | s/d 12 jam | 180 hari | 11 nines |

Spread Standard → Deep Archive = **23x**. Contoh nyata: 100 TB data dingin di S3 Standard = **$2.305/bulan**; di Deep Archive = **$101,38/bulan** → hemat **~$26.944/tahun** dari satu lifecycle policy ([CloudZero](https://www.cloudzero.com/blog/s3-pricing/)).
Biaya request tetap ada (mis. GET Standard $0,0004/1.000; Deep Archive GET $0,0004/1.000, PUT $0,05/1.000) dan retrieval Standard-IA $0,01/GB, Deep Archive bulk $0,025/GB ([CloudZero](https://www.cloudzero.com/blog/s3-pricing/)).

### 2.2 Tiered di dalam database (MongoDB)
- **MongoDB Atlas Online Archive** memindahkan data lama dari cluster ke cloud object storage, tetap **queryable** lewat unified query experience ([MongoDB Docs — Online Archive Overview](https://www.mongodb.com/docs/atlas/online-archive/overview/)).
- Biaya query archive: **$5,00 per TB data yang diproses**, minimum 10 MB per query ([MongoDB Docs — Online Archive Costs](https://www.mongodb.com/docs/atlas/billing/online-archive/)).
- Perbandingan tier: Atlas cluster SSD ≈ **$0,25/GB/bulan** vs Online Archive ≈ **$0,023/GB/bulan** → **10–30x lebih murah** ([OneUptime — Atlas Online Archive to Reduce Storage Costs](https://oneuptime.com/blog/post/2026-03-31-mongodb-how-to-use-atlas-online-archive-to-reduce-storage-costs/view)).
- Ekspor ke object storage: Atlas menagih **$0,125/GB** untuk data yang diekspor ke S3/Blob/GCS ([MongoDB Docs — Data Transfer Costs](https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/)).

### 2.3 Contoh aplikasi chat/CS
- **Discord**: pindah dari MongoDB → Cassandra, lalu Cassandra → ScyllaDB saat cluster mencapai **177 node & triliunan pesan**; menambah *data service* di antara API dan DB (gRPC, request coalescing) untuk melindungi DB dari hot partition ([Discord — How Discord Stores Trillions of Messages](https://discord.com/blog/how-discord-stores-trillions-of-messages); [ScyllaDB tech-talk](https://www.scylladb.com/tech-talk/how-discord-migrated-trillions-of-messages-from-cassandra-to-scylladb/)).
- **Retention policy** (pola SaaS chat): GetStream menyediakan auto-delete pesan lama & channel inaktif, rentang **24 jam–5 tahun**, hard-delete, dijalankan async ([GetStream — Data Retention Policy](https://getstream.io/chat/docs/go-golang/data-retention-policy/)).
- **Microsoft Teams** mengatur retensi chat/channel via policy (retain/delete) ([Microsoft Learn — Retention for Teams](https://learn.microsoft.com/en-us/purview/retention-policies-teams)); contoh kebijakan kampus: retensi 1 tahun untuk menekan biaya kapasitas ([UC Irvine — Chat Message Retention](https://www.oit.uci.edu/org/projects/chat-message-retention/)).

### 2.4 Alternatif object storage (S3-compatible) — untuk menekan biaya self-managed/hybrid
Harga $/TB/bulan (perbandingan 20+ provider): **Wasabi $6,99**, **Storj $7,00**, **Hetzner $12,30**, **Cloudflare R2 $15,00** (R2 tanpa egress fee), min. retensi bervariasi 0–90 hari ([s3compare.io](https://www.s3compare.io/)). Untuk on-prem: **MinIO** (S3-compatible) memungkinkan pola cloud di infrastruktur sendiri ([DBSync](https://www.mydbsync.com/blogs/object-storage-vs-databases)).

---

## 3. Object Storage untuk Media/Attachment

### 3.1 Kenapa media TIDAK disimpan di DB transaksional
- **Memory pressure & query lambat**: menyimpan biner besar (PG `bytea`, MySQL `BLOB`, MongoDB `GridFS`) menaikkan pemakaian memori, memperlambat query, dan menekan throughput backend; pada volume tinggi berujung **OOM** ([Engineering At Scale — Databases vs Object Storage](https://engineeringatscale.substack.com/p/when-to-use-blob-storage-vs-database)).
- **Batas ukuran field**: PostgreSQL maks ~1 GB, MySQL ~4 GB ([Engineering At Scale](https://engineeringatscale.substack.com/p/when-to-use-blob-storage-vs-database)).
- **Karakter media** (unstructured, immutable, besar, disajikan ke banyak user) secara desain cocok untuk **object storage** S3-compatible, bukan baris DB ([DBSync — Object Storage vs Databases](https://www.mydbsync.com/blogs/object-storage-vs-databases)).

### 3.2 Pola yang benar
1. Simpan **blob** di object storage (S3/GCS/MinIO); simpan **metadata + object key** di MongoDB.
2. **Upload langsung client↔S3** memakai **pre-signed URL** (time-limited) → bypass app server, turunkan beban server, lebih scalable ([dev.to — S3 Pre-Signed URLs](https://dev.to/ehsaantech/aws-s3-pre-signed-urls-your-key-to-secure-media-uploads-35kl)).
3. **Download/disajikan lewat CDN** dengan **signed URL / signed cookies** (CloudFront) agar cache + kontrol akses tanpa membuka bucket ([AWS Docs — CloudFront Signed URLs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html)). Catatan: signed URL S3 mentah tidak ter-cache di CDN — gunakan CloudFront signing bila butuh caching ([AWS re:Post](https://repost.aws/questions/QUyBvy4E_7QLOVj1bOY_ffrg/can-you-used-presigned-urls-aws-media-services)).

---

## 4. Kelayakan untuk SatuInbox

SatuInbox = **web**, multi-tenant, multi-agent, agent-facing; stack NestJS + gRPC + RabbitMQ + MongoDB + Socket.IO.

### 4.1 Verdict per model

| Model | Kelayakan | Alasan |
|---|---|---|
| **On-device / local-first ala WhatsApp** | ❌ **TIDAK COCOK** | Agent bekerja lintas device & sesi (desktop + mobile + shift), butuh **history terpusat** yang konsisten. Handover percakapan antar agent, audit, dan SLA menuntut *source of truth* server-side. Local-first memaksa sync/CRDT kompleks namun tetap tak menjawab audit/compliance. Model WhatsApp bisa local-centric karena sifat 1:1/device-bound; CS multi-agent tidak. |
| **Cloud server-side (ala Telegram/Discord)** | ✅ **COCOK** | Server = source of truth; client tipis; konsisten lintas device; mudah diaudit. Discord membuktikan model ini untuk chat masif ([Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages)). |
| **Hybrid + tiered storage** | ✅ **WAJIB** | Panas di MongoDB (akses rendah-latensi), dingin/arkib & media di object storage → biaya 10–30x lebih murah pada volume dingin ([OneUptime](https://oneuptime.com/blog/post/2026-03-31-mongodb-how-to-use-atlas-online-archive-to-reduce-storage-costs/view), [CloudZero](https://www.cloudzero.com/blog/s3-pricing/)). |

### 4.2 Mengapa cloud server-side (bukan local-first)
- **Konsistensi lintas device/sesi** — kebutuhan inti CS: satu percakapan dilihat sama oleh semua agent yang menanganinya.
- **Handover & kolaborasi** — routing/assignment percakapan antar agent tidak mungkin andal tanpa state terpusat.
- **Audit & compliance** — retensi, WORM, dan residency butuh penyimpanan terpusat ([Microsoft Learn](https://learn.microsoft.com/en-us/purview/retention-policies-teams)).
- Preseden teknis: Discord mengelola triliunan pesan dengan **server-side DB + data service** ([Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages)); Telegram (cloud) juga menjadikan server sebagai sumber history lintas device (diskusi sekunder: [Reddit](https://www.reddit.com/r/Telegram/comments/qb8wty/how_exactly_does_telegram_backs_up_my_account/) — **tidak terkonfirmasi resmi**).

### 4.3 Dampak ke komponen SatuInbox
- **MongoDB**: performa ditentukan *working set* di RAM (data panas + index). Bila seluruh history menumpuk di cluster utama, RAM yang dibutuhkan → biaya cluster naik nonlinear. Mengarsipkan data lama mengecilkan working set & index → biaya turun ([MongoDB Online Archive Overview](https://www.mongodb.com/docs/atlas/online-archive/overview/), [OneUptime](https://oneuptime.com/blog/post/2026-03-31-mongodb-how-to-use-atlas-online-archive-to-reduce-storage-costs/view)).
- **RabbitMQ**: **bukan** penyimpanan jangka panjang. Queue hanya buffer transit; backlog besar = konsumsi RAM/disk broker. Pesan chat & media jangan dijadikan backlog permanen di queue — queue memuat *event*/*referensi*, bukan blob.
- **Biaya**: penggerak utama adalah **retensi data dingin di storage panas** dan **media di DB/primary**. Lifecycle & tiering mengatasinya.

### 4.4 Rekomendasi layout (hot/cold/retention)

| Jenis data | Tempat | Alasan |
|---|---|---|
| Pesan aktif (< 30–90 hari) | MongoDB (hot set) | akses cepat, index, real-time |
| Pesan lama | MongoDB Online Archive / S3 Standard-IA / Glacier Instant Retrieval | 10–30x lebih murah, tetap queryable; retrieval tetap ms |
| Media/attachment | Object storage (S3/MinIO/R2) + CDN + signed URL | unstructured/immutable; hemat & scalable |
| Audit / log / compliance | Object storage WORM / Glacier Deep Archive | $0,00099/GB/bulan |
| Queue (RabbitMQ) | Transit saja | cegah backlog permanen |

Retensi per tier: **hot 30–90 hari → warm s/d 1 tahun → cold/archive sesuai kebijakan klien** (pola 1 tahun lazim, mis. [UC Irvine](https://www.oit.uci.edu/org/projects/chat-message-retention/)); menerapkan tier ini ke volume dingin memangkas biaya 10–30x ([OneUptime](https://oneuptime.com/blog/post/2026-03-31-mongodb-how-to-use-atlas-online-archive-to-reduce-storage-costs/view)).
**Jangan** taruh data yang sering diakses ke tier arsip — retrieval Standard-IA $0,01/GB, Deep Archive bulk $0,025/GB ([CloudZero](https://www.cloudzero.com/blog/s3-pricing/)).

### 4.5 Risiko, effort migrasi & constraint zero-perf
- **Effort**: tinggi — butuh **data service / query router** yang memisahkan hot vs archive secara transparan, backfill bertahap, dan cutover tanpa downtime. Preseden Discord menunjukkan ini program multi-tahun dengan penambahan data service ber-gRPC ([Discord](https://discord.com/blog/how-discord-stores-trillions-of-messages)).
- **Zero-regression (layanan existing tidak boleh turun)**: migrasi **online** (dual-write + backfill → cutover), perluas query layer agar arsip transparan, **jangan ubah API/contract**. Query ke arsip memang lebih lambat — pastikan hanya dipicu untuk data lama, bukan hot path.
- **Compliance/data residency**: pilih region object storage atau **MinIO on-prem** untuk memenuhi syarat residency ([DBSync](https://www.mydbsync.com/blogs/object-storage-vs-databases)).
- **Biaya tersembunyi**: request, egress, dan retrieval fee bisa menggerus penghematan bila salah menaruh tier ([CloudZero](https://www.cloudzero.com/blog/s3-pricing/)).

### 4.6 Verdict (1 kalimat)
**Model on-device/local-first ala WhatsApp TIDAK cocok untuk SatuInbox — karena web, multi-tenant, multi-agent yang butuh history terpusat lintas device/sesi, audit, dan handover — maka adaptasi yang realistis dan layak adalah cloud server-side (ala Telegram/Discord) dengan MongoDB untuk data panas, tiered storage/Online Archive untuk data dingin, dan object storage + CDN + signed URL untuk media, diterapkan bertahap tanpa regresi layanan.**

---

## Daftar Sumber (24)
1. https://www.cloudzero.com/blog/s3-pricing/
2. https://www.mongodb.com/docs/atlas/billing/online-archive/
3. https://www.mongodb.com/docs/atlas/online-archive/overview/
4. https://www.mongodb.com/docs/atlas/billing/data-transfer-costs/
5. https://oneuptime.com/blog/post/2026-03-31-mongodb-how-to-use-atlas-online-archive-to-reduce-storage-costs/view
6. https://discord.com/blog/how-discord-stores-trillions-of-messages
7. https://www.scylladb.com/tech-talk/how-discord-migrated-trillions-of-messages-from-cassandra-to-scylladb/
8. https://getstream.io/chat/docs/go-golang/data-retention-policy/
9. https://www.s3compare.io/
10. https://engineeringatscale.substack.com/p/when-to-use-blob-storage-vs-database
11. https://www.mydbsync.com/blogs/object-storage-vs-databases
12. https://dev.to/ehsaantech/aws-s3-pre-signed-urls-your-key-to-secure-media-uploads-35kl
13. https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-signed-urls.html
14. https://repost.aws/questions/QUyBvy4E_7QLOVj1bOY_ffrg/can-you-used-presigned-urls-aws-media-services
15. https://www.mongodb.com/pricing
16. https://aws.amazon.com/s3/pricing/
17. https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html
18. https://learn.microsoft.com/en-us/purview/retention-policies-teams
19. https://www.oit.uci.edu/org/projects/chat-message-retention/
20. https://practical365.com/how-long-should-teams-chat-and-channel-retention-be/
21. https://www.45drives.com/blog/cloud-storage/total-cost-of-ownership-cloud-vs-on-premise-storage/
22. https://www.databank.com/resources/blogs/on-prem-vs-cloud-cost-comparison-10-cost-factors-you-must-compare-before-deciding/
23. https://www.sms.com/blog/cloud-vs-onpremises-cost-breakdown/
24. https://medium.com/@emmaakachukwu/whatsapp-webs-data-journey-storage-locations-and-end-to-end-encryption-412a0812cbb8
