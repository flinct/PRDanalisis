# SatuInbox — Product Strategy Synthesis: Target Pasar, Fitur, Flow, Roadmap & Marketing

> **Author:** Analyst (orchestrator session)
> **Date:** 2026-08-26
> **Type:** Strategic Synthesis Report (menggabungkan & merevisi seluruh dokumen strategy sebelumnya)
> **Input utama:** `Assessments/strategy/new input/analisis strategy satuinbox.md` (brainstorm terbaru user, revisi ICP)
> **Input pendukung:** `SatuInbox_Product_Strategy_2026_2028.md` (+ versi lanjutan), `satuinbox-competitive-analysis.md`, `satuinbox-usp-innovation-analysis.md`, `satuinbox-logistics-vertical-positioning.md`, `satuinbox-competitor-deep-dive-round3.md`, `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `Memory/comprehensive-undeveloped-features-analysis.md`
> **Status:** Draft v1 — belum di-review PM/Eng Lead. Reference/strategy, bukan Assessment Report per-fitur.

---

## 0. Ringkasan Eksekutif

Analisa lama menyimpulkan **SatuInbox = Logistics Customer Operations Platform** (basis: SAPX, Lion Parcel, Lincah, JNE — 100% logistik). Data client terbaru (SAP/Digital Care, Bantu Saku, Farmacare, Song Fa) **membatalkan kesimpulan itu**. Pattern yang benar-benar konsisten lintas 5 client bukan industrinya, tapi bentuk masalahnya:

```
Customer → Conversation → Classification/Routing → Ticket/Sales/Broadcast → Agent/Team → SLA → Statistics
```

**Kesimpulan revisi (final, dipakai sebagai basis seluruh dokumen ini):**

> **SatuInbox = Customer Operations Platform untuk bisnis dengan volume customer conversation tinggi, multi-channel, multi-agent, butuh SLA & routing terstruktur.**
> **Logistics/Delivery tetap vertical terkuat** (3 dari 6 client/prospek, proof-of-scale nyata, kompetitor lokal belum ada yang benar-benar deep di situ) — tapi bukan satu-satunya vertical valid. Enterprise generic (SAP), Fintech (Bantu Saku), Healthcare (Farmacare), F&B (Song Fa) semuanya valid selama karakteristik "high-volume, multi-channel, multi-team" terpenuhi.

---

## 1. Target Pasar

### 1.1 Resolusi kontradiksi ICP (wajib dibaca dulu)

| Sumber | Klaim ICP | Status |
|---|---|---|
| `satuinbox-logistics-vertical-positioning.md` (2026-08-20) | "100% client SatuInbox = vertical logistik/ekspedisi/kurir" | **Superseded** — benar saat ditulis (data baru SAP/Bantu Saku/Farmacare/Song Fa belum ada) |
| `SatuInbox_Product_Strategy_2026_2028.md` (2026-08-21, draft awal) | "Beachhead: Logistics & Delivery" | **Superseded** oleh revisi di section 41-45 dokumen yang sama, dan oleh input baru user |
| `analisis strategy satuinbox.md` (2026-08-26, input terbaru) | "High-Volume Customer Operations, logistics salah satu vertical kuat" | **Final — dipakai di dokumen ini** |

Kenapa revisi ini benar, bukan sekadar "pendapat terbaru menang": kalau ICP dipersempit ke logistics-only, maka **SAP/Digital Care (Enterprise/Tech), Bantu Saku (Fintech), Farmacare (Healthcare), Song Fa (F&B)** semuanya jadi anomali yang harus diabaikan — padahal mereka collectively membuktikan pola commercial yang sama (omnichannel → team inbox → ticket/sales → SLA) berhasil di 4 industri berbeda di luar logistik. Data lebih kuat dari asumsi awal.

### 1.2 ICP Tiering

```
                         SATUINBOX ICP
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   TIER 1                TIER 2                 TIER 3
Enterprise/High-Volume   Mid-Market             SMB (opportunistic,
                                                  bukan target aktif)
        │                     │
  ┌─────┼─────┬─────┐    ┌────┼────┐
  │     │     │     │    │    │    │
 Logistics Enterprise Fintech Healthcare  E-commerce  F&B chain  Edu/Retail
 (SAPX,   Tech (SAP)  (Bantu  (Farmacare) (belum ada  (Song Fa)  (belum ada
  Lion,               Saku)               client)                client)
  Lincah,
  JNE-prospect)
```

**Checklist ICP fit** (dari kesimpulan revisi user, section 25 input baru):
- Volume conversation tinggi ✓
- Multi-channel ✓
- Multi-agent / multi-team ✓
- Butuh SLA terukur ✓
- Butuh operational visibility (management reporting) ✓

Semakin banyak checklist terpenuhi → semakin cocok, **independen dari industrinya**.

### 1.3 Kenapa Logistics tetap dapat prioritas khusus (bukan "salah satu vertical yang setara")

Ini bagian yang perlu ditegaskan karena dua sumber lama over-index ke logistik dan input baru under-index-nya balik — kebenarannya di tengah:

1. **Proof-of-scale terbanyak**: 3 dari 5 client existing + 1 prospek besar (JNE) ada di logistik. Fintech/Healthcare/F&B baru 1 client masing-masing.
2. **Structured intent paling tinggi** (`analisis strategy satuinbox.md` §13): "paket dimana", "kurir belum datang", "COD gimana" — ini pattern paling gampang dijadikan AI/automation use-case duluan dibanding keluhan Fintech/Healthcare yang lebih bervariasi & sensitif regulasi.
3. **Kompetitor lokal (Barantum, Qontak) klaim vertical logistik tapi shallow** (`satuinbox-competitor-deep-dive-round3.md` §11) — tidak ada case study client logistik riil yang bisa diverifikasi di web mereka. SatuInbox punya proof nyata (SAPX, Lion Parcel, Lincah) yang kompetitor tidak punya.

**Kesimpulan posisi:** Market level = horizontal (High-Volume Customer Operations). Solution/sales level = verticalized, dengan **Logistics sebagai flagship vertical package** (bukti terkuat, paling mudah dijual pakai case study nyata), dan **Enterprise/Fintech/Healthcare/F&B sebagai secondary vertical** yang dilayani dengan produk sama tanpa vertical-specific package dulu.

---

## 2. Fitur yang Cocok untuk Target Pasar

Untuk tiap segmen, fitur existing mana yang paling menjawab kebutuhan mereka riil (bukan asumsi):

| Segmen | Bukti pemakaian riil | Fitur SatuInbox yang match |
|---|---|---|
| **Enterprise generic (SAP)** | 6 channel + Team Inbox + Round Robin + Ticket + SLA + Statistics, dipakai lintas 2 tim (Digital Care + Sales) | Omnichannel Inbox, Team Inbox routing, Ticket↔Conversation link, SLA engine granular (FRT/TTC/RLT/Wait Time), Statistics |
| **Logistics (Lion Parcel, SAPX, Lincah)** | WA Group untuk komunikasi operasional, butuh ticketing untuk structured issue | WhatsApp Group support, Ticket (belum dipakai penuh — ini gap, lihat §4), Shipping Credentials (BE sudah ada), potensi AI intent classification untuk "cek resi" |
| **Fintech (Bantu Saku)** | Cuma pakai Ticketing, tanpa full omnichannel stack | Ticketing berdiri sendiri (bukti Ticketing = core capability, bukan cuma ekstensi Conversation) |
| **Healthcare (Farmacare)** | Conversation + Group Chat + Ticketing + Sales sekaligus | Collaborative Customer Operations — conversation yang butuh banyak pihak (CS + Sales + Specialist) bekerja bareng, bukan 1:1 |
| **F&B (Song Fa)** | Broadcast + Conversation, model proaktif bukan reaktif | Broadcast campaign, WA Template, funneling Broadcast reply → Conversation |

> **⚠️ 2026-08-26:** Client research (`satuinbox-client-profiles-research.md`) menemukan operator Indonesia bukan "Song Fa" pusat (Singapura), tapi **GFC Group** (@songfajakarta) — entitas lokal terpisah. Sebelum dipakai jadi case study/marketing, verifikasi ke sales/CS internal siapa sebenarnya klien SatuInbox: GFC Group atau Song Fa pusat.
> **⚠️ Farmacare** di baris di atas dan di §6.4 case study table masih berdasar temuan internal (produk usage) — riset eksternal (`satuinbox-client-profiles-research.md`) baru dapat data dari search snippet (extraction situs diblokir), evidence produk/kompetitor Farmacare belum verified langsung.

**Insight kunci** (`analisis strategy satuinbox.md` §21): fitur SatuInbox sebenarnya sudah terbagi jadi 4 "engine" alami berdasarkan pemakaian riil, bukan berdasarkan urutan development:

```
Conversation Engine   → WA/Email/IG/Messenger/Widget/Group Chat  (foundation, entry point)
Operation Engine      → Team Inbox, Round Robin, Ticket, SLA     (core value — ini yang dibayar mahal enterprise)
Engagement Engine     → Broadcast, Sales/Leads                    (revenue-generating, bukan sekadar CS)
Intelligence Engine   → Statistics, Analytics, (AI — belum ada)   (differentiator masa depan)
```

Rule produk baru: **fitur baru harus jelas masuk salah satu dari 4 engine ini dan memperkuat minimal 2 dari 5 kriteria** (conversation handling, agent efficiency, engagement/revenue, intelligence, enterprise-relevance) — kalau tidak, dipertanyakan sebelum masuk roadmap (`analisis strategy satuinbox.md` §31).

---

## 3. Flow Eksisting Sekarang (End-to-End)

### 3.1 Channel yang didukung (per `Memory/CLAUDE-be.md` §4, cross-check `satuinbox-competitive-analysis.md`)

WhatsApp Web (Baileys), WhatsApp Business API (Meta Graph, official), Instagram DM, Facebook Messenger, Email (IMAP/SMTP), Live Chat Widget (embeddable). Shopee dalam development. LINE/Telegram/TikTok **tidak ada** — dan menurut kesimpulan `analisis strategy satuinbox.md` §35-36 ini **disengaja**, bukan gap: channel expansion bukan differentiation, depth di 6 channel lebih valuable daripada breadth 15 channel dangkal.

### 3.2 Flow produksi saat ini (dari `Memory/global-memory.md` + `CLAUDE-be.md`)

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐
│ Customer │──▶│ Channel  │──▶│Conversation│─▶│ Assignment│──▶│  Ticket    │──▶│   SLA    │
│          │   │ (6 chan) │   │  Service  │  │(participants│  │ (optional, │   │  Engine  │
└──────────┘   └──────────┘   └──────────┘   │  = assignee)│  │ manual)    │   └────┬─────┘
                                              └──────────┘   └────────────┘        │
                                                                                    ▼
                                                                           ┌─────────────┐
                                                                           │ Resolution   │
                                                                           │ (Close/     │
                                                                           │  Resolve)   │
                                                                           └──────┬──────┘
                                                                                  ▼
                                                                          ┌───────────────┐
                                                                          │ Statistics /   │
                                                                          │ Analytics      │
                                                                          │ (FRT/TTC/RLT/  │
                                                                          │  Wait Time)    │
                                                                          └───────────────┘
```

**Detail per tahap (implementasi nyata, bukan PRD ideal):**

1. **Inbound** — pesan masuk lewat salah satu dari 6 channel, dinormalisasi jadi `Conversation` document (`satuinbox_conversation` DB, service `conversation-service`).
2. **Assignment/Routing** — saat ini murni manual/Round Robin dasar via `Team Inbox`. **Tidak ada** skill-based, capacity-based, atau SLA-aware routing (§4.1 di bawah — ini gap besar).
3. **Ticket creation** — opsional, agent manual create ticket dari conversation. `Ticket` dan `Conversation` adalah dua object terpisah yang di-link, bukan otomatis derived.
4. **SLA tracking** — berjalan real-time, dihitung dari 4 event timestamp (`firstCustomerMessageAt`, `firstAgentAssignmentAt`, `firstAgentReplyAt`, `conversationClosedAt`) menghasilkan 4 metric (Wait Time, RLT, FRT, TTC). Disimpan terpisah di `conversation_sla_metrics` collection, bukan di dalam conversation document.
5. **Resolution** — status flow `open` → `closed` (V2 canonical, bukan Ongoing/Resolved versi lama). Reopen toggle balik ke `open`.
6. **Analytics** — Statistics dashboard basic (per `satuinbox-competitive-analysis.md` §2.1: "⚠️ Basic" dibanding kompetitor yang "✅ advanced").

**Yang TIDAK ada di flow ini (penting untuk section 4 & 5):** tidak ada intent classification, tidak ada AI apapun, tidak ada auto-reply, routing masih rule-dasar bukan predictive.

---

## 4. Perbaikan yang Diperlukan untuk Fitur Eksisting

Dipisah tegas 3 kategori sesuai instruksi — jangan campur bug dengan feature request.

### 4.1 Bug / Gap Teknis Implementasi (kode sudah ada, tapi salah/tidak sesuai PRD)

| Gap | Sumber | Detail |
|---|---|---|
| **SLA color threshold mismatch** | `Memory/global-memory.md` §"V2 vs Implementation Delta" | PRD (Chat List V2 file 8) pakai percentage sisa budget (>50%/≤50%&>10%/≤10%). FE implementasi masih pakai absolute time (10 menit/1 hari). **Customer-facing bug** — SLA color yang ditampilkan tidak sesuai definisi resmi. |
| **Group chat FRT disembunyikan** | `Memory/global-memory.md` §"Open Risks" | PRD bilang FRT harus tetap jalan untuk semua channel termasuk group. FE sengaja sembunyikan FRT untuk group chat karena TTC infinite (tidak bisa resolve) — tapi FRT seharusnya tetap independen dari TTC. |
| **`GRPC_ANALYTICS_URL` port konflik** | `Memory/CLAUDE-be.md` §3 | `.env.example` define port 2x (`:50053` dan `:50069`). Port efektif `:50069`, tapi ini "latent config trap" — risk kalau ada dev baru pakai env lama. |
| **FE zero automated test** | `Memory/CLAUDE-fe.md` §2 | ⚠️ **Bukan bug, tapi precondition semua bug di atas jadi lebih berbahaya.** "No Vitest/Jest dependency or config anywhere." Semua verifikasi manual. Untuk enterprise client (SAP-tier), ini risk regresi besar tiap release. |
| **Round Robin belum punya PRD sendiri** | `Memory/global-memory.md` §"Critical Dependencies" | "Round Robin critical dependency — belum punya PRD sendiri." Fitur yang paling dibutuhkan (dipakai SAP) justru paling tidak terdokumentasi, susah diaudit correctness-nya. |

### 4.2 Open PRD Risk (behavior belum diputuskan, bukan salah implementasi)

| Risk | Sumber | Dampak bisnis |
|---|---|---|
| **Hold/Snooze/SLA 3-way conflict (BELUM DIRESOLVE)** | `Memory/global-memory.md` §"Open Risks", juga muncul di `Memory/comprehensive-undeveloped-features-analysis.md` §1.7 | Room v1.1 bilang Hold pause SLA. Snooze v1.0 bilang tidak ada perubahan SLA. Kalau enterprise client (SAP-tier, yang SLA-nya dipakai untuk hitung performa agent) menemukan angka SLA yang tidak konsisten karena konflik behavior ini, **trust ke reporting rusak** — ini risk paling kritis di seluruh dokumen memory. |
| **Conversation SLA reopen behavior undefined** | `Memory/global-memory.md` §"Open Questions" | Ticket SLA sudah define reopen = new cycle, Conversation SLA belum. Ambiguitas ini bisa distort metric FRT/TTC kalau conversation sering reopen (customer follow-up berulang — umum di logistik "paket saya kok belum juga"). |
| **SLA mode Agent-Centric vs Customer-Centric belum final** | `Memory/global-memory.md` §"Canonical Metric Definitions" | Menentukan apakah TTC pause saat nunggu customer atau jalan terus. Ini keputusan produk fundamental yang mempengaruhi semua angka SLA yang dijual ke enterprise sebagai bukti performa. |
| **FRT formula start point belum di-lock** | `Memory/global-memory.md` | Inbound vs assignment — field `firstAgentAssignmentAt` ada terpisah, indikasi mengarah ke inbound, tapi belum dikonfirmasi PM. |

### 4.3 Missing Test Coverage (spesifik, bukan cuma "no tests" umum)

- **FE: nol automated test** di seluruh workspace (`Memory/CLAUDE-fe.md` §2) — quality gate cuma lint + type-check. Untuk client enterprise/logistik volume tinggi, critical path (Inbox, Ticketing, SLA) yang paling rawan regresi justru paling tidak ter-cover.
- Rekomendasi dari `satuinbox-logistics-vertical-positioning.md` §6 (masih valid): pasang Vitest minimum untuk 3 critical path itu dulu — bukan full coverage semua modul (over-engineering untuk kondisi zero-test saat ini).

### 4.4 Fitur V2 yang sudah di-PRD-kan tapi belum developed (FE+BE, bukan sekadar bug)

Dari `Memory/comprehensive-undeveloped-features-analysis.md` — daftar lengkap 14 fitur, yang **paling relevan untuk ICP high-volume customer ops**:

| Fitur | Risk | Kenapa relevan sekarang |
|---|---|---|
| Hold/Resume di Room Header | 🟡 Medium | Terkait langsung open risk §4.2 di atas — implementasi terhambat sampai policy final |
| Snooze Conversation | 🟡 Medium | Enterprise agent butuh ini untuk multi-conversation handling volume tinggi |
| Related/Relational Conversations | 🔴 High | Logistik & F&B sering dapat conversation berulang dari customer sama (follow-up status) — tanpa ini, agent tidak lihat histori terkait |
| Related Tickets & Merge | 🔴 High | Sama seperti di atas untuk Ticket — SAP/Bantu Saku pakai ticketing berat, duplicate ticket tanpa merge = clutter |
| Auto-reply Templates | 🔴 High | **Ini yang paling mendesak secara komersial** — lihat §5 di bawah, bukan cuma "undeveloped" tapi kandidat fitur baru prioritas #1 |

---

## 5. Fitur Baru untuk Mendukung Sales ke Target Pasar

### 5.1 Kerangka scoring (dari `analisis strategy satuinbox.md` §33, direplikasi persis)

7 kriteria, skala 0-5 tiap kriteria, TOTAL max = 35:
`Resolution Speed | Agent Efficiency | SLA Impact | AI Enablement | Relevansi Target Pasar (high-volume ops) | Enterprise-Readiness | Moat/Switching-Cost`

### 5.2 Scoring 5 kandidat fitur baru

| # | Kandidat | Resolution | Agent Eff. | SLA | AI | Target Pasar | Enterprise | Moat | **TOTAL** |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **AI Intent Classification + Auto-Reply** (tracking/status query auto-resolve) | 5 | 5 | 4 | 5 | 5 | 4 | 4 | **32** |
| 2 | **Smart/Predictive Routing** (capacity + skill + SLA-risk aware, upgrade dari Round Robin) | 4 | 5 | 5 | 3 | 4 | 5 | 3 | **29** |
| 3 | **Group Chat → Ticket workflow** (khusus Lion Parcel-style WA Group operational) | 4 | 4 | 3 | 1 | 4 | 3 | 3 | **22** |
| 4 | **Operational Intelligence layer** (root-cause insight di atas Statistics — "kenapa SLA turun", bukan cuma angka) | 3 | 3 | 3 | 4 | 4 | 5 | 5 | **27** |
| 5 | **Vertical Package: SatuInbox for Logistics** (bundling Shipment Tracking API integration + AI intent + case study) | 4 | 4 | 3 | 4 | 5 | 4 | 4 | **28** |
| 6 (bonus) | WhatsApp Anti-Spam / Account Pool Rotation (sudah di-PRD-kan, belum dev) | 2 | 2 | 1 | 0 | 4 | 4 | 2 | 15 |

**Ranking prioritas:** #1 AI Intent+Auto-Reply (32) > #2 Smart Routing (29) > #5 Logistics Package (28) > #4 Operational Intelligence (27) > #3 Group Chat→Ticket (22).

### 5.3 Kenapa #1 menang jauh (dan bagaimana bentuknya)

Data customer behavior Indonesia yang sudah dikumpulkan (`satuinbox-logistics-vertical-positioning.md` §3): **72% customer tidak sabar menunggu**, **46% langsung kabur kalau CS telat respon**. Kompetitor murah (Cekat.AI) sudah jual "cek resi otomatis" sebagai fitur utama mereka. Tanpa ini, SatuInbox kalah bahkan dari kompetitor tier bawah untuk use-case paling umum di logistik.

```
                    Customer: "Paket saya dimana?"
                              │
                              ▼
                    ┌───────────────────┐
                    │  Intent Classifier │  (bisa mulai rule/keyword based,
                    │  (AI, on-prem opsi │   upgrade ke NLU/LLM incremental)
                    │  untuk regulated)  │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        TRACKING          COMPLAINT        LAINNYA
        (structured)      (unstructured)   (fallback)
              │               │               │
              ▼               ▼               ▼
      ┌───────────────┐  ┌──────────┐   ┌──────────┐
      │ Shipping API   │  │ Create   │   │  Route ke │
      │ (BE: shipping- │  │ Ticket   │   │  Agent    │
      │ credentials    │  │ Priority │   │  (manual) │
      │ sudah ada)     │  │ High     │   └──────────┘
      └───────┬───────┘  └────┬─────┘
              ▼               ▼
      Auto-reply status   Assign + SLA
      NO HUMAN AGENT      countdown mulai
```

**Kenapa achievable (bukan speculative)**: backend sudah punya `shipping-credentials` dan `shipping-vendors` endpoint (`Memory/CLAUDE-be.md` §4) — infrastruktur integrasi shipping API sudah ada, tinggal wire ke intent classifier + auto-reply engine (yang statusnya `Auto-reply Templates` — sudah di-PRD-kan V2 file 1, undeveloped FE+BE, lihat §4.4). Ini bukan membangun dari nol.

### 5.4 Yang sengaja TIDAK masuk rekomendasi (feature creep guardrail)

Konsisten dengan `analisis strategy satuinbox.md` §26 — jangan bangun: Payroll, HR, Accounting, full ERP, full CRM (Salesforce-level), full marketing automation, full call-center suite, warehouse/inventory management, full CDP. Semua ini "bisa diintegrasikan" tapi tidak boleh dibangun native — kalau butuh, integrasi API keluar, bukan modul baru.

---

## 6. Strategi Pemasaran untuk Target Pasar

### 6.1 Positioning statement (final, revisi dari 2 dokumen sebelumnya)

> **Product category:** Customer Operations Platform
> **ICP:** High-volume businesses dengan multi-channel customer interaction, multi-team, butuh SLA & operational visibility
> **Beachhead vertical:** Logistics & Delivery (proof-of-scale terkuat)
> **Secondary vertical:** Enterprise generic, Fintech, Healthcare, F&B chain

**Tagline kerja:** *"SatuInbox mengubah banyak channel customer menjadi satu operational workflow — bukan sekadar tempat agent membalas chat."*

### 6.2 Kenapa jangan pakai klaim "vertical logistik" sebagai headline generik

`satuinbox-competitor-deep-dive-round3.md` §11 sudah buktikan: Barantum dan Qontak SAMA-SAMA sudah punya halaman "solusi logistik" — klaim vertical semata sudah jadi **commodity message**, gampang ditiru copy marketing kompetitor semalam. Yang defensible bukan klaimnya, tapi **bukti nyata + kedalaman teknis** yang kompetitor tidak expose:

- SLA engine granular real-time (FRT/TTC/RLT/Wait Time per-metric) — kompetitor cuma slogan "SLA management"
- WA multi-device dengan failover (2 slot Main/Backup) — krusial volume tinggi, tidak disorot kompetitor manapun
- 3 client logistik riil sebagai reference (SAPX, Lion Parcel, Lincah) — Qontak/Barantum tidak punya case study logistik yang bisa diverifikasi

### 6.3 Messaging: Problem Selling, bukan Feature Selling

Ganti dari:
> "SatuInbox punya WhatsApp, Instagram, Email, Ticketing, Broadcast, CRM, Leads, Analytics..."

Menjadi pertanyaan discovery ala consultative selling (`analisis strategy satuinbox.md` §27):
> "Berapa banyak CS agent yang Anda punya?" / "Berapa persen customer menanyakan tracking?" / "Apakah agent harus buka sistem lain untuk cek shipment?"

Diikuti closing statement per-vertical:
- **Logistics:** *"SatuInbox menghubungkan conversation customer dengan operational workflow shipment perusahaan Anda."*
- **Enterprise generic:** *"SatuInbox menyatukan semua channel customer jadi satu operational workflow terukur — seperti yang sudah dijalankan SAP Digital Care."*

### 6.4 Case study angle per segmen (belum dibuat, prioritas produksi)

| Case study | Angle | Kenapa powerful |
|---|---|---|
| **SAP / Digital Care** (flagship enterprise reference) | "How SAP centralizes multi-channel customer operations with SatuInbox" — Before (multi-channel manual distribution, limited SLA visibility) vs After (Unified Conversation → Team Inbox → Round Robin → SLA → Statistics) | Bukti blueprint lengkap SatuInbox Enterprise berjalan nyata |
| **Lion Parcel** | "How Lion Parcel reduces customer response workload with SatuInbox" | Vertical logistik, WA Group use-case unik |
| **JNE (prospek, belum closing)** | Jangan jual sebagai software — jual sebagai "Customer Operations Transformation". SatuInbox = operational brain di belakang MyJNE, bukan pengganti MyJNE | Strategic account, high-touch enterprise sales |
| **Farmacare** | Collaborative Customer Operations (Conversation+Group+Ticket+Sales bersamaan) | Menunjukkan produk bisa dipakai lintas fungsi, bukan cuma CS |

> **⚠️ Evidence tipis (2026-08-26):** riset eksternal Farmacare gagal extract (403), hanya dari search snippet. Jangan publish sebagai case study sebelum verifikasi langsung ke tim account/CS.

### 6.5 Channel go-to-market

- **High-touch enterprise sales** (bukan self-serve SME) untuk Tier 1 — demo pakai skenario nyata industri prospek, expose metric SLA granular langsung di demo, bukan slide generic (`satuinbox-logistics-vertical-positioning.md` §5).
- **Deprioritize** self-serve funnel untuk SMB — SatuInbox belum punya infrastruktur billing/self-service yang matang, dan margin SMB rendah dibanding effort enterprise deal.
- Landing page/marketing collateral naik 1 level dari "WhatsApp Command Center" (positioning entry-level saat ini, masih relevan sebagai top-of-funnel) ke "Customer Operations Platform" (positioning enterprise) — funnel bertahap: WhatsApp problem → Team Inbox → Customer Operations → Automation → AI.

---

## 7. Kalau Cuma Bisa Pilih 3 Hal untuk 6 Bulan Ke Depan

**(1) Lock 3 open PRD risk SLA/Hold/Snooze/Reopen dulu sebelum apapun lain** — ini bukan pilihan opsional, karena semua fitur baru (routing, AI, ticketing) dibangun DI ATAS angka SLA yang sekarang inkonsisten; kalau tidak dikunci, setiap fitur baru mewarisi bug kepercayaan yang sama. **(2) Bangun AI Intent Classification + Auto-Reply untuk tracking/status query** (skor scoring tertinggi 32/35, infrastruktur shipping API sudah ada di BE, dan data customer behavior Indonesia bilang 72% tidak sabar menunggu — ini window kompetitif yang menutup cepat karena Cekat.AI sudah jual fitur serupa). **(3) Produksi 2 case study nyata (SAP + Lion Parcel)** dengan angka before/after SLA konkret — karena tanpa bukti terdokumentasi, semua depth teknis di atas tidak bisa dipakai sales untuk closing deal enterprise/JNE-tier yang butuh proof, bukan janji. Semua hal lain (fitur baru tambahan, ekspansi channel, CRM, call center) tunggu setelah 3 ini selesai — dan pasang Vitest minimum di jalur Ticketing+SLA sebagai net pengaman selagi 3 hal ini dibangun, supaya tidak menambah bug baru di atas yang sudah ada.

---

## Sumber

Semua sitasi section di atas merujuk file berikut (baca penuh sebelum dokumen ini ditulis):
`Assessments/strategy/new input/analisis strategy satuinbox.md`, `Assessments/strategy/new input/SatuInbox_Product_Strategy_2026_2028.md` (+ versi lanjutan), `Assessments/strategy/satuinbox-competitive-analysis.md`, `Assessments/strategy/satuinbox-usp-innovation-analysis.md`, `Assessments/strategy/satuinbox-logistics-vertical-positioning.md`, `Assessments/strategy/satuinbox-competitor-deep-dive-round3.md`, `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `Memory/comprehensive-undeveloped-features-analysis.md`.

*Belum di-review PM/Eng Lead. Perlu alignment sebelum jadi dasar keputusan roadmap resmi.*
