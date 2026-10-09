# Onebox (onebox.co.id) — Competitive Deep Dive

**Status:** Draft, belum di-review PM/Eng Lead
**Tanggal riset:** 2026-10-02
**Metode:** Scrape langsung via browser (Playwright — situs diproteksi WAF yang memblokir fetcher biasa) + web search. Sumber: onebox.co.id (homepage, /produk/*, /solusi/*, /whatsnew, /faq, /pusatBantuan, /terms-condition, /privacy-policy, /sitemap.xml), ciptadrasoft.com, LinkedIn showcase, login app (cloud.onebox.co.id, docs.onebox.co.id). Cache scrape: `~/.hermes/cache/scratch/ob_*.txt`.
**Catatan metode:** 3 URL WhatsApp di sitemap sudah mati (404); halaman `/faq` berisi template sampah (FAQ disalin dari kompetitor Qontak); `/pusatBantuan` adalah stub mati (link template rusak).

---

## 1. Company Overview

- **Vendor:** PT Ciptadra Softindo (Depok, Jawa Barat) — berdiri 1999, 80+ engineer, kantor 1.000 m²
- **Produk utama:** Onebox CX (customer experience omnichannel) + Onebox PR (public relation/sentiment)
- **Positioning:** Enterprise & government omnichannel — klaim 200+ klien, 60+ wilayah, 18.000+ interaksi/hari (telekomunikasi)
- **Channel mix klaim (telekomunikasi):** Voice 72%, WhatsApp 15%, Email 8%, Sosmed 5%
- **Stack (dari profil engineer LinkedIn):** Phalcon/Laravel PHP legacy, jQuery, MySQL, React/Next.js untuk modul baru
- **Login app:** cloud.onebox.co.id, versi **Onebox 1.123.0 - Cloud © 2026**
- **Harga:** tidak dipublikasikan — demo-based sales

### Klien yang terlihat di logo wall
Bank Indonesia, Bank Mandiri, XL Axiata, Ciputra, AlloBank, BNI Life, OJK, Gojek, ANTAM, AXA, Cigna, Sompo, LRT Jakarta, TNI AU, Komdigi, Pemkot Bogor/Bandung/Depok, BNN, Kementerian, ~40+ lainnya.

---

## 2. Product Map

| Lini | Isi |
|---|---|
| **Customer Service** | Contact Center Omnichannel, Ticket Management, Chatbot (AI), Customer Relationship, Sistem Antrian, Outbound (reminder/sapa salam) |
| **Marketing & Sales** | Prospect & Sales Management, Telemarketing, Outbound & Broadcast Omnichannel |
| **Customer Feedback** | Customer Feedback, Media Monitoring, CSAT Layanan |
| **Public Relation** | Onebox PR (issue monitoring, sentiment, media) |
| **Lainnya** | API Omnichannel, BPO (outsourced contact center/telecollection) |

### Customer Journey (5 step, klaim resmi)
1. Terima interaksi pelanggan (WA, telepon, IG/FB/X/TikTok, email, live chat, Google Review)
2. Satukan kanal → Unified Inbox, Customer Profile, Auto Ticket, sinkronisasi percakapan
3. Proses & selesaikan → Auto Assign, SLA, Knowledge Base, AI Suggested Reply, reminder
4. Pantau kinerja → Supervisor: Monitoring SLA, Agent Performance, Workload, QA, real-time dashboard
5. Analisis & loyalitas → Customer Insight, Sentiment Analysis, Performance Report

### Industri target
Pemerintah, kesehatan (RS), keuangan/asuransi, telekomunikasi, properti, retail, MLM, non-profit.

---

## 3. WhatsApp Capabilities (1:1 Personal Chat)

### Inbound
- Pesan WA 1:1 masuk unified inbox; riwayat percakapan sinkron lintas kanal
- Auto ticket dari pesan WA ("antrean tiket masuk (email, sosmed, **wa**) → tiket terpusat otomatis")
- Customer profile gabungan lintas kanal; auto-assign ke agent
- Chatbot auto-respon 24/7 **terintegrasi database/core system** (klaim): cek data nasabah, billing, jadwal dokter, registrasi
- AI Suggested Reply, Knowledge Base untuk agent

### Outbound
- Broadcast via batch upload file **atau** via API omnichannel (ada API, tapi **tanpa dokumentasi publik**)
- Use case: billing, marketing, reminder, survey, sapa salam, notifikasi; personalisasi per segmen

### Bukti integrasi per industri (halaman studi kasus)
- **Asuransi:** WA + data polis/billing/claim; prospek via WA → followup sales
- **Retail:** "WA center" info produk/tagihan/registrasi; klaim petugas lebih sedikit (efisien)
- **Rum Sakit:** chatbot WA (jadwal dokter, registrasi, ketersediaan ruang, share location) + reduce agent headcount

### Celah WhatsApp
- **Tidak ada WhatsApp Group** — nol mention di seluruh situs (riset terpisah, terkonfirmasi)
- **Tidak ada bukti jalur API Meta resmi** — tidak ada penyebutan WhatsApp Business API/Cloud API/BSP di seluruh situs; hanya "link your Onebox account to WhatsApp Business" di Privacy Policy
- Tidak ada template message management (katalog, quality rating, 24h window) yang dipublikasikan
- Tidak ada dokumentasi API publik
- Changelog What's New (terakhir Des 2024) tanpa entri WhatsApp

---

## 4. RBAC — Implisit, Nol Dokumentasi

**Temuan inti:** model RBAC tidak dipublikasikan sama sekali. Yang ada hanya struktur peran implisit dari marketing copy + 1 penyebutan eksplisit di dokumen legal.

### Peran implisit (semua dari bukti scraping)

| Peran | Sumber | Kemampuan terpublikasi |
|---|---|---|
| **Admin** | ToS: "*reactivate its account from its own **admin dashboard***" | Kelola akun organisasi — **satu-satunya role bernama di dokumen legal** |
| **Supervisor** | Homepage step 4 | Monitoring SLA, agent performance, workload, QA, dashboard (read/monitor) |
| **Agent/CCC** | Homepage step 3; What's New (Reply/Note/Forward) | Handle chat, auto-assign, reply, note, forward, eskalasi tiket |
| **Sales Team** | ciptadrasoft.com/onebox-crm | Pipeline prospek, followup lead |
| **Marketing Team** | kartu yang sama | Broadcast/campaign |
| **Field/Petugas Lapangan** | /produk/manajemen-penugasan | Terima task + notifikasi via mobile, kolaborasi lintas tim |

Dimensi organisasi terlihat: unit/divisi ("eskalasi lintas antar-divisi"), wilayah (multi-wilayah), tim. **Hierarki & visibility scoping tidak didokumentasikan** (apakah supervisor hanya melihat timnya sendiri — tidak ada keterangan).

### Autentikasi (dari UI login asli)
- Email + password, "Forgot Password"
- **Google SSO** ("Continue with Google") — terlihat di login docs.onebox.co.id
- Tanpa 2FA/SAML/OIDC yang disebut; tanpa tenant picker di login
- Subdomain docs/help/support/developer/kb.onebox.co.id = wildcard → login yang sama (bukan portal dokumentasi)

### Kondisi dokumentasi/legal terkait akses
- **ToS:** `user` hanya didefinisikan untuk billing (MAU); End User Account bisa disuspend; tanpa definisi role/permission
- **Privacy Policy:** "akun dilindungi password" — generik
- **Pusat Bantuan:** stub mati (1 kategori → link template `service-details.html`)
- **FAQ:** template sampah, teks disalin dari Qontak
- **API Omnichannel:** marketing copy, tanpa spec autentikasi
- **Tidak disebut:** audit log, custom role, permission per module, scoping per unit

---

## 5. Nilai Kompetitif vs SatuInbox

### Kekuatan Onebox
1. **Kedalaman integrasi core system** (billing, polis, jaringan, pasien) — ini yang dijual, bukan fitur WA-nya sendiri
2. **Proof points industri** dengan klaim hasil konkret (efisiensi headcount, SLA 1 HK, 18K interaksi/hari)
3. **Dual product CX + PR** (sentiment/issue monitoring) — kompetitor umumnya terpisah
4. **Voice/call center** sebagai channel dominan (72% traffic) — SatuInbox bukan di ranah ini
5. **BPO services** — layanan outsource contact center
6. Google SSO, enterprise/government logo wall
7. Handle (agent) vs monitor (supervisor) + escalation lintas divisi sudah jelas di alur kerja

### Kelemahan Onebox (celah untuk SatuInbox)
1. **Zero public documentation** — RBAC, API, WhatsApp integration semuanya tanpa spec publik
2. **Tidak ada WhatsApp Group** — celah yang juga belum diisi SatuInbox (PRD WA Group Mention sudah ada, belum implementasi) → first-mover masih terbuka
3. FAQ/help center rusak/templated (bahkan menyalin teks kompetitor Qontak) — sinyal lemah di self-serve
4. Changelog mandek (Des 2024) — sinyal iterasi produk lambat di permukaan publik
5. Legacy stack (Phalcon/jQuery) — indikasi teknis, bukan klaim pasar

### Posisi ringkas
| Aspek | Onebox | SatuInbox |
|---|---|---|
| WA 1:1 chat | ✅ unified inbox | ✅ core domain |
| **WA Group** | ❌ | PRD ada, belum implementasi |
| Dokumentasi API publik | ❌ | — |
| RBAC terpublikasi | Implisit, nol dokumen | — |
| Voice/call center | ✅ dominan | ❌ |
| Sentiment/PR module | ✅ | ❌ |
| AI Suggested Reply | ✅ dijanjikan | ❌ belum ada |
| Broadcast WA | ✅ upload + API | ✅ domain Broadcast |
| Self-serve docs/FAQ | ❌ rusak | poin diferensiasi |

---

## 6. Rekomendasi (Draft)

1. **WhatsApp Group** tetap jadi prioritas — Onebox juga tidak punya, lapangan terbuka untuk SatuInbox
2. **AI Suggested Reply** dipertimbangkan masuk roadmap — sudah jadi klaim publik kompetitor
3. **Dokumentasi/API reference publik** = diferensiator murah yang bisa diunggulkan (Onebox nol)
4. Benchmark RBAC SatuInbox cukup pakai pola publik Onebox: handle vs monitor + escalation lintas divisi + admin dashboard — detail internal mereka tidak bisa diverifikasi tanpa akses demo
5. Integrasi core-billing adalah mode penjualan enterprise Onebox — bukan arena SatuInbox saat ini

---

*File ini bagian dari `Assessments/strategy/` — market/competitor/positioning, bukan decision report final per-feature.*
