# SatuInbox — Client Profile Research: BantuSaku, Song Fa, Farmacare

> **Author:** Analyst (web research langsung)
> **Date:** 2026-08-26
> **Type:** Reference — profil bisnis 3 client SatuInbox (bukan riset SatuInbox usage mereka, itu ada di `satuinbox-product-strategy-synthesis-2026.md` §1-2)
> **Sumber:** kunjungan langsung website tiap client + web search cross-check
> **Status:** Draft — Farmacare partial (extraction blocked, lihat catatan)

---

## 1. BantuSaku — Fintech P2P Lending (Vertical: Fintech)

**Situs:** bantusaku.id | **Entitas legal:** PT Smartec Teknologi Indonesia

**Model bisnis:** Aplikasi pinjaman online (P2P lending) — pinjaman tunai tanpa jaminan Rp1.000.000–Rp20.000.000 (marketing claim naik ke Rp50.000.000 untuk limit tinggi), bunga 0,3%/hari, tenor hingga 90 hari. Produk dipecah 3 use-case: Bantu Belanja, Bantu Liburan, Bantu Usaha (modal bisnis).

**Regulasi & kredibilitas:**
- **Terdaftar & berizin OJK** — konfirmasi silang: OJK PDF resmi "Penyelenggara Fintech Lending Berizin OJK per 12 Juli 2024" nomor 87, izin KEP-91/D.05/2021 (8 September 2021).
- Terdaftar AFPI (Asosiasi Fintech Pendanaan Bersama Indonesia), Kominfo, LAPS (Lembaga Alternatif Penyelesaian Sengketa) — badge kepatuhan lengkap.
- ISMS certification (Information Security Management System) — badge "KAN" (Komite Akreditasi Nasional) di halaman utama.
- Ada whistleblowing channel resmi (whistleblowing@bantusaku.id) — indikasi tata kelola korporat matang.

**Skala operasi (klaim di web, per Agustus 2026):**
- 2,32 juta penerima dana sejak berdiri, 336,12 ribu tahun berjalan.
- Rp23,96 triliun dana tersalurkan sejak berdiri, Rp2,59 triliun tahun berjalan.
- TKB90 (rasio bayar tepat waktu) diklaim 100%; sumber independen (Tradingview) sebut TWP90 di 0% — dua metrik berbeda tapi konsisten arah "kualitas kredit baik".
- 98,4% pengajuan via aplikasi mobile — **mobile-first, hampir tidak ada jalur web/desktop untuk end-customer**.

**Leadership (dari halaman "Tentang Kami"):**
- Direktur Utama: Arnoldyth Rodes Medo — background fintech Indonesia sejak 2012, fokus risk management & fraud investigation.
- Direktur TI: Hui Wang — 15+ tahun software/big data/P2P lending, eks-CTO perusahaan teknologi China.
- Komisaris: Alan Yazid Ali — 20+ tahun risk & compliance, eks Bank Ekspor Indonesia.
- Pemegang saham mayoritas (72,24%): Ooi Chuan Hock (Clement Ooi) — pengalaman perbankan regional Asia-Pasifik, perusahaan solusi perbankan terdaftar NASDAQ.

**Kanal komunikasi resmi:** Telepon 1500-006, **WhatsApp 0889-1500-006**, Email cs@bantusaku.id — WhatsApp jadi kanal CS utama, sejalan dengan kenapa mereka pakai SatuInbox untuk Ticketing.

**Relevansi ke SatuInbox:** Ini client regulated industry (fintech/OJK) dengan compliance requirement ketat (whistleblowing, audit tahunan, ISMS). Konfirmasi temuan `satuinbox-product-strategy-synthesis-2026.md` §2 bahwa BantuSaku pakai **Ticketing SatuInbox berdiri sendiri** tanpa full omnichannel stack — masuk akal karena volume CS mereka kemungkinan didominasi keluhan structured (status pengajuan, pembayaran, penagihan) yang cocok jadi ticket, bukan percakapan open-ended. Skala 2,32 juta customer historis = volume conversation yang realistis tinggi, konsisten dengan kriteria ICP "high-volume".

---

## 2. Song Fa Bak Kut Teh — F&B Chain (Vertical: F&B/Retail)

**Situs:** songfa.com.sg | **Berdiri:** 1969 (pushcart Teochew bak kut teh oleh Yeo Eng Song, Singapura)

**Skala jaringan (dari halaman Outlets + cross-check Michelin Guide/Reddit 2026):**
- **Singapura:** 10 outlet (termasuk 111 Somerset, Punggol Coast Mall, VivoCity, 11 New Bridge Road/flagship, Bukit Panjang Plaza, Chinatown Point, ESR BizPark Changi, Jem, Jewel Changi Airport, Mandai Wildlife East, Northpoint City, Suntec City, The Centrepoint, The Seletar Mall, Velocity@Novena, Waterway Point — lebih dari 10 lokasi tercantum di web, kemungkinan Michelin data agak lag).
- **Indonesia:** 7 outlet (per Michelin Guide 2026) — genap 10 tahun beroperasi di Indonesia, buka outlet ke-12/13 di Jakarta tahun ini (per Reddit r/singapore thread, sumber sekunder tapi konsisten dengan momentum ekspansi). Brand lokal: "Song Fa Bak Kut Teh - GFC Group" (@songfajakarta di Instagram) — outlet disebut: Ozone PIK, Central Park, Mall of Indonesia, Grand [lainnya terpotong].
- **China:** 6 outlet, **Bangkok:** 1 outlet, **Taipei:** ada outlet (jumlah tidak dirinci di web).
- **Total estimasi lintas negara:** ~24+ outlet di 4 negara (SG, ID, CN, TH) + Taipei.

**Positioning brand:** Michelin Bib Gourmand awardee (kategori restoran terjangkau berkualitas) + "Made With Passion" brand untuk produk retail. Brand story ditonjolkan sebagai warisan keluarga sejak 1969 — storytelling heritage jadi bagian marketing utama.

**Model operasi:** Multi-outlet F&B chain lintas negara dengan operator lokal berbeda per market (Indonesia dioperasikan grup terpisah "GFC Group" berdasarkan Instagram handle @songfajakarta, bukan entitas Singapura langsung) — pola **franchise/joint-venture regional**, bukan korporat tunggal terpusat.

**Relevansi ke SatuInbox:** Konfirmasi kenapa Song Fa cocok masuk kriteria ICP "high-volume, multi-channel" meski F&B (bukan tech/fintech/logistik): **multi-outlet lintas negara = multi-tim yang butuh koordinasi terpusat** untuk customer inquiry (reservasi, komplain, promo). Pola pemakaian SatuInbox di sini (Broadcast + Conversation, model proaktif — per `satuinbox-product-strategy-synthesis-2026.md` §2) masuk akal: F&B chain besar biasa broadcast promo/menu baru ke database customer, lalu funnel reply masuk ke Conversation untuk reservasi/komplain. **Catatan penting:** operator Indonesia (GFC Group) kemungkinan besar klien SatuInbox yang sebenarnya — bukan entitas pusat Song Fa Singapura — worth diverifikasi ke tim sales/CS internal sebelum dipakai sebagai nama case study resmi.

---

## 3. Farmacare — Software Apotek/Farmasi (Vertical: Healthcare)

> **⚠️ Extraction gagal** — `web_extract` kena 403 Forbidden dari provider (Firecrawl, tanpa API key terpasang) untuk `farmacare.id/` maupun `/tentang`. Data di bawah **seluruhnya dari snippet web search**, bukan kunjungan halaman langsung — lebih tipis dari 2 profil di atas. Kalau butuh detail lebih dalam (fitur produk, klien, harga), perlu browser_exec langsung atau extract ulang dengan API key Firecrawl terpasang.

**Model bisnis (dari meta description Google):** Farmacare = **platform SaaS B2B untuk manajemen apotek**, bukan apotek itu sendiri. Tagline: "Solusi Pengelolaan Apotek yang Lengkap dan [Mudah]". Klaim skala: **"bergabung dengan lebih dari 2.000 apotek di Indonesia"**.

**Cakupan layanan (dari deskripsi halaman "Tentang"):** "menyediakan solusi teknologi untuk **apotek, klinik, & PBF** (Pedagang Besar Farmasi)" — cakupan lebih luas dari sekadar POS apotek, masuk ke distribusi farmasi B2B juga.

**Positioning kompetitif (dari blog Farmacare sendiri):** Farmacare memposisikan diri sebagai salah satu dari "3 software apotek terkemuka di Indonesia" dengan klaim diferensiasi "fitur lengkap, antarmuka ramah pengguna" — indikasi ada minimal 2 kompetitor besar lain di kategori software-apotek Indonesia (nama kompetitor tidak tercantum di snippet).

**Base lokasi:** Denpasar, Bali (dari Facebook page "Farmacare.id | Denpasar", 585 likes).

**Relevansi ke SatuInbox:** Konsisten dengan temuan `satuinbox-product-strategy-synthesis-2026.md` §2 — Farmacare pakai Conversation+Group+Ticketing+Sales SatuInbox sekaligus ("Collaborative Customer Operations"). Masuk akal karena Farmacare sendiri B2B software vendor yang melayani 2000+ apotek sebagai customer — pola interaksinya kemungkinan **customer support B2B ke pemilik apotek** (onboarding, troubleshooting sistem, upsell modul baru) yang butuh banyak pihak terlibat (CS, sales, technical specialist) per konteks yang kompleks, bukan 1:1 simple chat.

---

## 4. Ringkasan Lintas 3 Client

| Client | Vertical | Model Bisnis | Skala | Regulasi Ketat? | Pola CS yang Masuk Akal |
|---|---|---|---|---|---|
| BantuSaku | Fintech (P2P Lending) | B2C — pinjaman online | 2,32 juta customer historis | ✅ OJK, AFPI, ISMS | Ticketing structured (status pinjaman, penagihan) |
| Song Fa | F&B Chain | B2C — restoran multi-outlet lintas negara | 24+ outlet, 4 negara | ❌ (F&B standar) | Broadcast promo → Conversation (reservasi/komplain) |
| Farmacare | Healthcare/Software B2B | B2B — SaaS untuk apotek/klinik/PBF | 2.000+ apotek customer | ⚠️ Tidak langsung diatur, tapi klien mereka (apotek) di industri teregulasi | Collaborative support B2B (CS+Sales+Technical) |

**Insight yang menguatkan kesimpulan `satuinbox-product-strategy-synthesis-2026.md`:** Ketiga client ini **sama sekali tidak overlap secara model bisnis** (B2C lending, B2C F&B chain, B2B SaaS) — satu-satunya benang merah adalah bentuk operasional: volume conversation tinggi, butuh multi-tim/multi-channel, butuh workflow terstruktur (ticket/broadcast/SLA). Ini memperkuat argumen ICP "high-volume customer operations" independen dari industri, bukan melemahkannya.

**Gap yang perlu ditindaklanjuti:**
1. **Farmacare perlu re-research** dengan akses penuh (bukan lewat search snippet) — data produk/fitur/kompetitor Farmacare belum cukup dalam untuk dipakai sebagai case study marketing.
2. **Verifikasi entitas Song Fa Indonesia** — apakah klien SatuInbox itu GFC Group (operator lokal) atau Song Fa pusat Singapura — ini menentukan siapa yang harus di-approach untuk izin case study.
3. Ketiga profil ini murni **profil bisnis eksternal** (dari web publik) — belum ada cross-check ke data pemakaian SatuInbox internal mereka (volume conversation aktual, channel apa yang dipakai, dll). Kalau mau dipakai sebagai case study resmi, perlu data internal + izin dari masing-masing client.
