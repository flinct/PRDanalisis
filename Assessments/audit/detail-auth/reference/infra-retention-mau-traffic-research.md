# Research: Data Retention, MAU/MUV & Message Traffic → Kapasitas Server & Tier Pricing

> Tujuan: dasar nyata (bukan asumsi) untuk menentukan batas tier Basic/Premium/Enterprise SatuInbox dari sisi **biaya infra**, bukan hanya fitur.
> Status: riset eksternal, tiap klaim disertai sumber. Angka vendor = snapshot 2026; verifikasi ulang sebelum dikutip di PRD/kontrak.
> Relevansi SatuInbox: stack = NestJS + RabbitMQ + MongoDB + Socket.IO (dari AGENTS.md). Cost driver = storage MongoDB (retention), message throughput (RabbitMQ + WA API), concurrency (Socket.IO).

---

## 1. Tiga cost driver & kenapa jadi batas tier

| Driver | Apa yang dibatasi | Biaya infra yang ditekan |
|---|---|---|
| **Data retention** | berapa lama pesan/percakapan/kontak disimpan | Storage DB (MongoDB), backup, index RAM |
| **MAU / MUV** | jumlah user/visitor unik aktif per bulan | Compute, koneksi concurrent (Socket.IO), session |
| **Message traffic** | volume pesan masuk+keluar / broadcast per bulan | RabbitMQ throughput, WA API per-message cost, write IOPS DB |

Ketiganya **tidak linear dengan jumlah agent** — inilah alasan vendor besar TIDAK pakai per-agent murni untuk semua, melainkan gabungan seat + usage (MAU / message / resolution).

---

## 2. Referensi nyata — Data Retention per vendor

| Vendor | Kebijakan retention | Sumber |
|---|---|---|
| **Intercom** | Data visitor inaktif expire **9 bulan**; workspace inaktif expire **13 bulan**; data umumnya tersedia untuk export hingga **2 tahun** | intercom.com/help (How Intercom tracks and stores data); intercom.com/blog/data-privacy-compliance; getmacha export guide |
| **Zendesk** | Ticket dihapus → **soft delete 30 hari**, **permanent purge 90 hari** setelah delete awal; deletion schedule ticket default **365 hari** sejak modifikasi; user soft-delete 30 hari | support.zendesk.com Service Data Deletion Policy; "Are tickets kept permanently"; Creating ticket/end-user deletion schedules |
| **Cloud storage underlying** | Hot/standard **$0.023/GB-bln** (AWS S3), $0.026 (GCS multi-region), $0.0458 (Azure Hot NA); archive bisa **$0.00099/GB-bln** | otava.com cloud storage cost; aws.amazon.com/s3/pricing |

**Pola yang terbukti:** retention adalah **tiering lever** — vendor besar memberi retention panjang/konfigurable di tier atas, dan auto-purge di tier bawah. Storage hot ~23x lebih mahal dari archive → retention pendek di Basic = penghematan nyata.

**Implikasi SatuInbox (MongoDB):** tiap percakapan + pesan + attachment metadata = dokumen hot-storage. Retention 90 hari vs unlimited = perbedaan ukuran working set yang menentukan tier cluster (RAM untuk index). Attachment file idealnya ke object storage tier dingin saat tua.

---

## 3. Referensi nyata — MAU / MUV sebagai basis pricing

| Sumber | Temuan |
|---|---|
| **Model MAU** (mojoauth analysis) | MAU = user unik dalam rolling 30 hari; dipakai karena **cost mengikuti usage aktif**, bukan total akun terdaftar. Tiered (1K–50K) dengan **per-MAU turun saat skala** (contoh: tier 50K hemat 41% per-MAU vs 1K) |
| **Rasio MAU/total user per industri** | Social 30–50%, **Enterprise SaaS 10–20%**, E-commerce 15–25%, Productivity 20–30% (SaaS engagement studies) |
| **Hidden cost MAU** | overage saat spike (GetStream 10x rate), data-point caps (Braze), tiering per intensitas login (Logto: Occasional/Frequent/Almost-daily) |
| **Intercom** | hybrid: seat $29/$85/$132 (Essential/Advanced/Expert) **+ usage** (Fin $0.99/resolution). Seat = akses, usage = beban nyata | dragapp, usagepricing Intercom |

**MUV (Monthly Unique Visitors)** khusus live-chat widget: jumlah pengunjung unik situs yang bisa memicu chat/session Socket.IO. Ini cost driver concurrency, bukan storage. Vendor widget (Tidio/Crisp/LiveChat) lazim membatasi MUV/kontak per tier (belum berhasil extract angka spesifik — tandai perlu konfirmasi).

**Implikasi SatuInbox:** MUV membebani Socket.IO (koneksi concurrent) + session store. MAU (agent + end-customer aktif) membebani compute + DB read. Batas MUV/MAU per tier = proteksi langsung terhadap biaya concurrency.

---

## 4. Referensi nyata — Message Traffic

| Sumber | Temuan |
|---|---|
| **Meta WhatsApp Business Platform** | Sejak 1 Jul 2025: **per-message pricing** (bukan per-conversation). Hanya charge pesan **business→user yang terkirim**; user→business **gratis**. Rate per **kategori × market** (Marketing/Utility/Auth/Service). **Volume tier** untuk Utility & Auth (makin banyak makin murah per pesan) | developers.facebook.com WhatsApp pricing |
| **WA free allowance** | **1.000 service conversation gratis/bulan**, setelah itu charge per kategori | Reddit r/whatsapp (perlu re-verify ke Meta doc karena model berubah ke per-message Jul 2025) |
| **Per-resolution model** | Intercom Fin $0.99/resolution; Gorgias Sidekick $0.60/conversation; Help Scout AI $0.75/resolution | vendor pages |

**Pola:** message traffic adalah **pass-through cost + infra cost**. WA API = biaya langsung ke Meta per pesan (harus diteruskan/di-markup). Broadcast volume = beban RabbitMQ (fan-out) + write DB. Karena biaya riil per pesan, broadcast quota per tier adalah keharusan, bukan opsional.

**Implikasi SatuInbox (RabbitMQ):** broadcast = fan-out job besar; quota broadcast/bulan per tier melindungi queue dari saturasi + membatasi pass-through cost WA API. Inbound user→business gratis dari Meta, tapi tetap membebani write DB + Socket.IO push.

---

## 5. Sintesis → Batas tier SatuInbox (usulan berbasis cost)

Tiga lever kuota ditambahkan ke matrix fitur. Angka = **placeholder**, perlu dikalibrasi dengan data biaya infra nyata SatuInbox (ukuran dokumen rata-rata di MongoDB, cost cluster, rate WA per market Indonesia).

| Lever | Basic | Premium | Enterprise | Dasar referensi |
|---|---|---|---|---|
| **Data retention** | 90 hari (auto-purge) | 12 bulan | Konfigurable / unlimited | Zendesk 90d purge; Intercom 13mo; hot storage 23x archive |
| **MAU** (end-customer unik/bln) | batas kecil (mis. 1.000) | menengah (mis. 10.000) | kustom | MAU model tiered; CS SaaS ratio 10–20% |
| **MUV** (live-chat widget visitor/bln) | batas kecil | menengah | kustom | widget concurrency driver (Socket.IO) |
| **Message traffic** (broadcast + outbound/bln) | kuota kecil | kuota besar | unlimited/nego | WA per-message pass-through; RabbitMQ fan-out |
| **Agent (seat)** | 3 | 10 | kustom | Intercom hybrid seat+usage |
| **Channel** | 1 | 3 | kustom | metered RulePrice[] SatuInbox |

### Prinsip (dari pola vendor)
1. **Retention pendek di Basic = penghematan storage nyata** (hot ~23x archive). Attachment lama → tier dingin / purge.
2. **MAU/MUV membatasi concurrency & compute**, bukan hanya "fitur" — ini yang menjaga Socket.IO + cluster tidak jebol di tier murah.
3. **Message/broadcast quota wajib** karena WA API = biaya langsung per pesan + beban RabbitMQ. Bukan soal "fitur premium", tapi pass-through cost.
4. **Hybrid seat + usage** (Intercom) lebih adil dari per-agent murni: seat untuk akses, usage (MAU/message/retention) untuk beban infra.
5. **Overage, bukan hard-block**, untuk spike (hindari putus layanan) — tapi tandai, karena konsumsi infra tetap terjadi.

---

## 6. Yang belum terkonfirmasi (perlu riset lanjut / data internal)
- Angka MUV/kontak spesifik per tier vendor widget (Tidio/Crisp/LiveChat) — extract gagal, perlu cek langsung halaman pricing.
- WA free-conversation allowance pasca perubahan per-message Jul 2025 (1.000 service conv masih berlaku?) — verifikasi ke Meta doc resmi, bukan Reddit.
- **Data internal SatuInbox**: ukuran rata-rata dokumen pesan di MongoDB, biaya cluster saat ini, rate WA API market Indonesia, profil concurrency Socket.IO. Tanpa ini, angka tier = tebakan.
- Biaya RabbitMQ pada beban broadcast puncak (perlu load simulation — lihat skill `satuinbox-load-simulation`).

---

## Sumber (URL)
- Intercom retention: https://www.intercom.com/help/en/articles/1722980-how-intercom-tracks-and-stores-data · https://www.intercom.com/blog/data-privacy-compliance/
- Zendesk deletion: https://support.zendesk.com/hc/en-us/articles/4408883628954-Zendesk-Service-Data-Deletion-Policy · https://support.zendesk.com/hc/en-us/articles/4408883501210
- Meta WA pricing: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- WA free allowance (unverified): https://www.reddit.com/r/whatsapp/comments/1pi0utz/
- MAU pricing model: https://mojoauth.com/blog/understanding-mau-based-pricing-models-cost-efficiency-through-active-user-engagement
- Cloud storage cost: https://www.otava.com/blog/faq/how-much-does-cloud-storage-cost/ · https://aws.amazon.com/s3/pricing/
- Intercom pricing (hybrid): https://www.dragapp.com/blog/intercom-pricing/ · https://www.usagepricing.com/blueprint/intercom
- Per-resolution: https://www.gorgias.com/blog/help-scout-pricing · https://www.helpscout.com/compare/gorgias/
