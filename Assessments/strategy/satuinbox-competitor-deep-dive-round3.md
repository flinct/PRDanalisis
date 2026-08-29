# SatuInbox — Competitor Deep-Dive Round 3: Fitur, Pricing, Client Fit & Kandidat Baru

> **Author:** Analyst (browser research langsung, bukan orchestrator — 2x percobaan delegate_task gagal: task timeout 600s dan `credit_balance_exhausted` di openai/gpt-5.5, lihat catatan di bawah)
> **Date:** 2026-08-20
> **Type:** Reusable reference — deep-dive per-platform (landing page + pricing + client + fit assessment)
> **Related:** `satuinbox-competitive-analysis.md` (global SaaS matrix), `satuinbox-usp-innovation-analysis.md` (USP roadmap), `satuinbox-logistics-vertical-positioning.md` (local competitor map round 2 + customer behavior data + global post-purchase tracking round 2)
> **Status:** Draft v1 — belum di-review PM/Eng Lead

---

## 0. Kenapa Round 3 Ini Beda dari Round 1-2

Round 1-2 (`satuinbox-logistics-vertical-positioning.md`) sudah memetakan *siapa* kompetitornya dan *positioning* strategisnya. Round 3 masuk lebih dalam per-platform:
1. **Fitur breakdown** langsung dari landing page tiap platform (bukan ringkasan sekunder).
2. **Pricing exact** kalau dipublish (banyak yang ternyata publish angka Rupiah jelas — tidak semua "hubungi sales").
3. **Client/case study riil** per platform + industri bisnis mereka — dicek apakah cocok dengan fitur yang dijual.
4. **3 kandidat baru** yang belum pernah dianalisis: Halo AI, Kata.ai, TapTalk OneTalk.

**Catatan proses:** User minta pakai orchestrator (`delegate_task` fan-out 3 subagent). Kedua percobaan gagal — 2 task timeout di 600 detik (kemungkinan macet di panggilan browser_exec pertama), 1 task kehabisan kredit `openai/gpt-5.5` (`credit_balance_exhausted`, sama seperti kegagalan `o3` sebelumnya). Riset ini akhirnya dikerjakan manual sequential via browser_exec langsung — lebih lambat tapi selesai dan terverifikasi.

---

## 1. Qontak (Mekari)

**Fitur (dari landing page + `/fitur/`):**
- Omnichannel: WA Business API, WA Blast, WA Centang Biru, Click-to-WA Ads, WA Call, WA Bulk, WA Flows, Instagram API, Tokopedia Chat, Embedded Live Chat
- CS: Manajemen Tiket, Manajemen SLA, Agent Scorecard, Chatbot & Conversational AI, Airene (AI assist), Agentic AI, Knowledge Base
- Sales: Manajemen Deal, Manajemen Kontak, Manajemen Goal, Sales GPS Tracking, Custom CRM Report
- Call Center cloud, Workflow Automation

**Pricing:** Tidak dipublish angka eksak di halaman `/harga/` (render JS-heavy, custom quote per paket — Pro/Business + add-on Mekari University). Riset round 2 sebelumnya dapat estimasi per-conversation Rp295-627 dari sumber pihak ketiga — belum terverifikasi langsung dari web resmi kali ini.

**Client (dari `/klien-kami/`):** KMN EyeCare (klinik mata), Sekolah Cikal (edukasi), Dapur Bu Sastro (F&B), IDS Medical System (kesehatan/regulasi), **TransGo** (transport — relevan!), Padma Hotel Bandung (perhotelan). Solusi industri eksplisit: Ritel, Keuangan, Kesehatan, Pendidikan, Perhotelan, Tour&Travel, **Logistik**, FMCG, Outsourcing, Teknologi.

**Fit assessment:** Client generic (banyak vertical, tidak fokus). Halaman `/solusi/logistik/` ada tapi kontennya generic ("lacak aktivitas bisnis dalam satu dasbor") — tidak ada bukti spesifik client logistik besar seperti case study TransGo. **Klaim vertical logistik ada, tapi shallow** — sejalan dengan temuan round 2.

---

## 2. Qiscus

**Fitur (dari homepage + pricing):**
- Omnichannel Chat: 20+ channel + custom channel
- Qiscus Helpdesk (ticketing dengan full context per keluhan)
- Qiscus AgentLabs (AI Agent agentic, autopilot ke sistem lain)
- Qiscus Agent Co-Pilot, Qiscus CRM, Qiscus Shop, Qiscus Call Centre, Qiscus Survey, Qiscus CDP (Customer Data Platform 360)
- WA: Broadcast, Call, OTP, Click-to-WA Ads, Flow, Coexistence — Official Meta Business Partner

**Pricing (dipublish eksak di `/pricing`):**
| Paket | Harga | Agen | MAU |
|---|---|---|---|
| Startup | Rp1.500.000/bulan | 5 | 3.000 |
| Grow | Rp3.500.000/bulan | 10 | 10.000 |
| Enterprise | Custom | Unlimited | >10.000 |

Tambahan: Rp250.000/500 MAU ekstra, Rp250.000/agent ekstra.

**Client (dari `/en/customer-success-story`):** ZAP (klinik kecantikan), EMZI Care, Brawijaya Hospital, Universitas Terbuka (200rb+ percakapan mahasiswa), Bethsaida Hospital, KPJ Healthcare, Panorama JTB (travel), Paragon (kosmetik/beauty), Sucor Sekuritas (finance/sekuritas).

**Fit assessment:** **Pola client 100% healthcare/beauty/education/finance — ZERO logistik.** Qiscus paling "enterprise-grade" secara marketing (SLA, analitik, ekosistem luas) tapi validasinya sepenuhnya di luar vertical logistik. Ini **memperkuat celah pasar** untuk SatuInbox — Qiscus kuat tapi tidak punya proof-of-scale logistik sama sekali.

---

## 3. Barantum (PT Kosada Group)

**Fitur (dari homepage):**
- CRM Sales & Service: pipeline drag-drop, GPS tracking sales lapangan, automasi reminder, mobile app
- Omnichannel & WA API: WA Centang Hijau, broadcast ratusan ribu kontak, AI chatbot dengan handover, WhatsApp Flows
- Cloud Call Center: IVR, auto-routing, auto-recording, dashboard performa agent

**Pricing:** Halaman `/harga` 404 saat dicek — sebelumnya diketahui 3-tier custom (Standar/Profesional/Enterprise), hubungi sales.

**Industri (dari `/id/industry` — 30+ template):** Travel&Umroh, Beauty&Klinik, Finance&Asuransi, Properti, Edukasi, Otomotif, ISP/Telco, Kesehatan, Dealer Mobil, Rental Mobil, Kontraktor, Healthcare, Pemerintah, Manufaktur, Non-Profit, Ritel&E-Commerce, Professional Service, Kursus, Kampus, Digital Agency, Restoran, Coffee Shop, Leasing, Asuransi, Bank, Koperasi, Rumah Sakit, **Ekspedisi & Cargo**, Pesantren, Kantor Hukum, Hotel, Event Organizer, Apotek, Klinik Gigi.

**Fit assessment — TEMUAN PENTING:** Barantum PUNYA halaman "Ekspedisi & Cargo" (deskripsi: "Kelola pengiriman & klien, update status otomatis, broadcast penawaran tarif via WhatsApp") — **TAPI ini cuma 1 dari 30+ card template generic** yang semuanya pakai copy serupa (CRM + WA + automasi, di-relabel per industri). Tidak ada bukti case study khusus client ekspedisi/logistik nyata di halaman ini — beda dengan SatuInbox yang punya 3 client logistik riil (SAPX, Lion Parcel, Lincah) sebagai proof. **Ini mengonfirmasi ulang temuan round 2: klaim vertical logistik Barantum adalah template marketing, bukan produk yang dibangun khusus untuk kebutuhan operasional kurir** (SatuInbox py fitur WA multi-device failover, SLA state machine granular — Barantum tidak expose fitur setara ini di manapun).

---

## 4. Cekat.AI

**Fitur (dari homepage + `/harga`):**
- AI Agent (Chat, CRM, Marketing, Order — bundling "Cekat 360")
- Flow Builder, Follow-up Otomatis, Ticketing, Automation, CSAT (fitur-fitur ini baru masuk mulai tier Business ke atas)
- Chatbot AI WhatsApp, WA Blast, Manajemen Data Pelanggan

**Pricing (dipublish tier tanpa angka Rupiah — beda dari riset round 2 yang dapat ~Rp500rb/bulan dari sumber lain):**
| Paket | WABA | MAU | Seats | Fitur |
|---|---|---|---|---|
| Pro | 1 | 3.000 | 5 | AI Simple, tanpa Ticketing/Automation |
| Business | 3 | 10.000 | 7 | AI Full, + Flow Builder, Follow-up, **Ticketing** |
| Enterprise | 5 | 30.000 | 10 | + Automation, CSAT |
| Custom | Unlimited | Unlimited | Custom | Semua |

**Industri (dari homepage):** Kesehatan, Ritel&E-Commerce, F&B, Pendidikan, Keuangan, Pemerintahan — **tidak ada logistik/ekspedisi** eksplisit di top-level industri.

**Fit assessment:** Ticketing baru masuk di tier Business ke atas (bukan default) — konsisten dengan positioning "AI-native, entry-level murah" bukan enterprise CS-suite penuh. **Tidak ada bukti klaim vertical logistik sama sekali di versi web terbaru** — sedikit berbeda dari catatan round 2 ("use-case cek resi otomatis"), kemungkinan itu klaim di materi marketing/blog bukan landing utama.

---

## 5. SleekFlow

**Fitur (dari homepage + pricing):**
- AgentFlow: unlimited AI agent untuk Sales/CS/Marketing, "AI workforce" (bukan chatbot generik)
- Inbound Agent (integrasi Shopify/CRM tanpa coding), Data Analyst Agent
- Omnichannel: WA, Instagram, TikTok, email, telepon → satu inbox terhubung CRM

**Pricing (dipublish eksak, IDR):**
|| Paket | Harga/bulan | Kontak aktif | User accounts |
||---|---|---|---|
|| Pro AI | US$199/mo (monthly) / US$149/mo (yearly) | 500 MAC (max 2K) | 3 seats included |
|| Premium AI | US$399/mo (monthly) / US$349/mo (yearly) | 1.000 MAC (max 12K) | 5 seats included |
|| Enterprise AI | Konsultasi | Custom | Custom |

> **⚠️ Koreksi 2026-08-26:** Harga sebelumnya dalam IDR (Rp1.58M/4.77M) kemungkinan dari regional tier Indonesia yang lebih murah. Harga di atas = US/UK/EU tier dalam USD (verified eesel.ai, Aug 2026). SleekFlow pricing **per-plan** (bukan per-agent) — seats included, add-on per-seat rate tidak dipublish. Ticketing hanya tersedia di Premium+ (Pro tidak ada ticketing).

Add-on: Onboarding khusus 60 hari US$499 sekali bayar.

**Client:** "2000+ bisnis", testimoni umum (tidak ada daftar nama client spesifik yang berhasil diambil — halaman `/customers` 404). Positioning: keamanan kelas dunia (ISO 27001, GDPR, SOC 2 Type 2) — appeal ke enterprise/regulated industry.

**Fit assessment:** Generic, tidak ada klaim vertical apapun (tidak logistik, tidak lainnya) — pure horizontal play dengan diferensiasi di AI unlimited + compliance. Tidak overlap langsung sama SatuInbox soal vertical logistik, tapi harga Premium (Rp4,7jt/bulan untuk 10 user) jauh lebih murah dari enterprise Indonesia lain kalau cuma butuh AI unlimited generic.

---

## 6. Chatwoot

**Fitur:** Omnichannel (website, email, social, WA, Telegram, LINE), Captain AI (assistant + copilot + memories + reply suggestion + summarization + content gap), live chat widget custom branding, API developer.

**Pricing (dipublish eksak, USD, per agent/bulan):**
| Cloud | Self-hosted |
|---|---|
| Hacker: $0 (2 agent, 500 conv/bln) | Community Edition: $0 forever |
| Startups: $19 | Premium Support: $19 |
| Business: $39 | Enterprise: $99 |
| Enterprise: $99 | (semua self-host di infrastruktur sendiri) |

Captain AI credits: $20/1.000 credit tambahan.

**Client:** "15.000+ organisasi", 36k GitHub stars — case study disebut (FairDee, Converso) tapi generic tanpa detail industri jelas.

**Fit assessment:** Open-source self-hosted = kontrol data penuh (appeal untuk client yang butuh data residency Indonesia/compliance ketat), tapi generic tanpa fitur SLA-engine granular atau ticketing per-stage state machine seperti SatuInbox. Tidak ada positioning vertical apapun.

---

## 7. Kandidat Baru #1 — Halo AI

**Fitur:** AI Agent all-in-one untuk sales/CS (close sales, appointment booking, resolve issue) — chatbot demo di homepage nunjukin use-case retail (jual sneakers). Positioning "#1 South East Asia CX AI".

**Pricing:** Tidak dipublish — full konsultasi/custom (tidak ada halaman harga sama sekali).

**Industri (dari homepage tab):** Retail, Healthcare, Travel, Edu-Tech — **tidak ada logistik**.

**Fit assessment:** Ini murni **AI sales-chatbot layer**, bukan full CS platform dengan ticketing/SLA/multi-agent inbox seperti SatuInbox. Kategori beda — komplemen bukan kompetitor langsung untuk use-case ticketing enterprise. Tidak relevan sebagai ancaman langsung ke SatuInbox.

## 8. Kandidat Baru #2 — Kata.ai

**Fitur:** AI Customer Service Agent, AI Marketing Agent, AI Sales Agent, AI HR&Recruitment Agent — model bisnisnya integrasi ke **Oracle, SAP, Salesforce, Zendesk, HubSpot** (AI layer di atas sistem lain, bukan inbox/ticketing native sendiri).

**Pricing:** Tidak dipublish — full enterprise custom quote.

**Industri:** Financial Service, FMCG&Retail, Healthcare&Insurance, Automotive — **tidak ada logistik**.

**Fit assessment:** "Trusted by 250+ leading brands" — kredibel di enterprise Indonesia, tapi **beda kategori produk**: Kata.ai adalah AI-agent-as-a-layer yang nempel ke Zendesk/Salesforce dst, bukan pengganti CS inbox seperti SatuInbox. Bisa jadi kompetitor tidak langsung kalau client memilih "beli AI layer + Zendesk" ketimbang "beli SatuInbox full-suite" — tapi jarang jadi keputusan head-to-head sama.

## 9. Kandidat Baru #3 — TapTalk OneTalk

**Fitur:** GenAI Chatbot (ChatGPT-based), WA Business API (Centang Hijau), Omnichannel inbox terpusat, **Assignment Rules + sistem ticketing** (ada eksplisit!), Advanced Broadcast dengan tracking, Overview Report (performa agent).

**Pricing:** Halaman harga tidak ditemukan (404) — kemungkinan custom quote via form konsultasi.

**Client/industri:** Tidak ada daftar client atau vertical industri spesifik ditemukan di landing page utama — generic "sales, marketing, customer support".

**Fit assessment:** Ini yang **paling mirip SatuInbox secara arsitektur produk** (assignment rules + ticketing + broadcast + overview report — bukan cuma chatbot generic seperti Halo AI/Kata.ai). Tapi tidak ada bukti fokus/klaim vertical logistik maupun proof-of-scale client besar. **Worth dimasukkan ke watchlist kompetitor tier-menengah**, meski belum ada sinyal ancaman langsung ke segmen logistik.

---

## 10. Tabel Ringkasan Perbandingan

| Platform | Kategori Produk | Ticketing/SLA Native? | Klaim Vertical Logistik? | Pricing Publik? | Client Terverifikasi (Industri) |
|---|---|---|---|---|---|
| **SatuInbox** | Full CS omnichannel + ticketing | Ya, SLA engine granular (FRT/TTC/RLT/Wait) | Ya (produk didesain untuk itu) | N/A (internal) | SAPX, Lion Parcel, Lincah (100% logistik) |
| Qontak | Full CS + Sales + Broadcast suite | Ya (Manajemen SLA, Agent Scorecard) | Ya (halaman solusi ada, shallow) | Tidak (custom quote) | Multi-vertical (klinik, edukasi, F&B, transport-TransGo, hotel) |
| Qiscus | Full CS + AI agentic + CDP | Ya (Helpdesk) | Tidak | Ya (Rp1,5-3,5jt/bln + custom) | 100% healthcare/beauty/education/finance — **zero logistik** |
| Barantum | CRM + Omnichannel + Call Center | Dasar (bukan SLA-engine granular) | Ya (template generic, bukan deep) | Tidak (custom) | 30+ industri template, tanpa case study logistik spesifik |
| Cekat.AI | AI-native chat + CRM + Order | Ya (mulai tier Business) | Tidak (versi terbaru) | Tier tanpa angka Rupiah | Kesehatan, Ritel, F&B, Edukasi, Keuangan, Pemerintahan |
| SleekFlow | AI workforce omnichannel | ⚠️ Premium+ only (Pro tidak ada) | Tidak | Ya (Pro $149/mo, Premium $349/mo, per-plan) | Generic 2000+ bisnis, no detail |
| Chatwoot | Open-source CS self-host | Dasar (help desk generic) | Tidak | Ya ($0-99/agent/bln) | 15.000+ organisasi, generic |
| Halo AI | AI sales-chatbot layer | Tidak | Tidak | Tidak | Retail, Healthcare, Travel, Edu-Tech |
| Kata.ai | AI-agent-as-layer (integrasi Zendesk/SAP dst) | Tidak (bergantung sistem induk) | Tidak | Tidak | Finance, FMCG&Retail, Healthcare, Automotive |
| TapTalk OneTalk | Omnichannel + ticketing dasar | Ya (Assignment Rules + ticketing) | Tidak | Tidak | Tidak ditemukan |

---

## 11. Insight Strategis Round 3

1. **Konfirmasi ulang temuan round 2 dengan bukti lebih kuat:** Barantum & Qontak memang "klaim" vertical logistik, tapi keduanya bersifat **template/generic** — tidak ada satupun case study client logistik riil yang bisa diverifikasi di web mereka (Qontak ada TransGo — transport, tapi bukan ekspedisi paket/kargo persis). SatuInbox 3 client logistik riil (SAPX, Lion Parcel, Lincah) tetap **proof-of-scale yang tak tertandingi** kompetitor manapun di riset ini.
2. **Qiscus paling berbahaya di luar vertical logistik** — paling matang secara produk (Helpdesk+AgentLabs+CDP) dan pricing published jelas, tapi 100% fokusnya di healthcare/education/finance. Kalau SatuInbox mau ekspansi horizontal suatu saat, Qiscus adalah benchmark produk paling matang untuk ditandingi — bukan ancaman langsung di logistik.
3. **Kandidat baru (Halo AI, Kata.ai) BUKAN ancaman langsung** — beda kategori produk (AI-chatbot-layer, bukan full CS suite dengan ticketing/SLA/multi-agent-inbox).
4. **TapTalk OneTalk paling dekat secara arsitektur produk** (assignment rules + ticketing + broadcast + report) — masuk watchlist meski belum ada sinyal fokus vertical atau proof-of-scale.
5. **Pricing landscape:** kompetitor yang publish harga (Qiscus, SleekFlow, Chatwoot) semuanya jauh lebih murah dari enterprise custom quote (Qontak/Barantum/Cekat.AI/Halo AI/Kata.ai/TapTalk) — segmen harga terbuka vs tertutup ini bisa jadi sinyal soal siapa yang main di SME vs enterprise.

---

## 12. Sumber Data

| Source | Catatan |
|---|---|
| qontak.com (home, /fitur/, /solusi/logistik/, /klien-kami/) | Browser direct visit, 2026-08-20 |
| qiscus.com (home, /pricing, /en/customer-success-story) | Browser direct visit, 2026-08-20 |
| barantum.com (home, /id/industry) | Browser direct visit, 2026-08-20 |
| cekat.ai (home, /harga) | Browser direct visit, 2026-08-20 |
| sleekflow.io/id-id (home, /pricing) | Browser direct visit, 2026-08-20 |
| chatwoot.com (home, /pricing, /pricing/self-hosted-plans) | Browser direct visit, 2026-08-20 |
| haloai.co.id | Browser direct visit, 2026-08-20 |
| kata.ai | Browser direct visit, 2026-08-20 |
| taptalk.io/onetalk-id | Browser direct visit, 2026-08-20 |
| `Assessments/strategy/satuinbox-logistics-vertical-positioning.md` | Reference existing, round 2 |

> **Disclaimer:** Data fitur/pricing/client dari kunjungan langsung landing page Agustus 2026 — bisa berubah sewaktu-waktu (halaman dinamis, pricing bisa direvisi kompetitor). Beberapa halaman pricing/case-study tidak dapat diakses (404) saat riset — dicatat sebagai gap, bukan diasumsikan tidak ada.
> **Catatan proses:** 2x percobaan orchestrator (`delegate_task` fan-out 3 subagent, model `openai/gpt-5.5` reasoning_effort high) gagal — 2 timeout 600s, 1 kehabisan kredit. Riset final dikerjakan manual browser_exec sequential.

---

*Belum di-review PM/Eng Lead. Perlu alignment sebelum jadi dasar keputusan roadmap/marketing resmi.*
