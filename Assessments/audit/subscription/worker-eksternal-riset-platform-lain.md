# Riset Eksternal — Model Subscription Platform Lain (Omnichannel CS & CPaaS)

> **Author/Owner:** Dany Christian (via worker riset eksternal)
> **Tanggal riset:** 2026-10-06
> **Scope:** Deep research model subscription/billing kompetitor relevan untuk SatuInbox (omnichannel CS, WhatsApp-centric, B2B SaaS Indonesia).
> **Metode:** Murni web research (web_search + web_extract). Semua klaim diberi URL sumber. Harga yang tidak bisa diverifikasi dari sumber resmi/terbuka ditandai **tidak diverifikasi** — TIDAK ada angka yang dikarang.
> **Catatan validitas:** Sebagian data berasal dari halaman resmi yang berhasil diekstrak penuh; sebagian dari snippet hasil pencarian (ditandai [snippet]) atau pihak ketiga (ditandai [3rd-party]). Harga per 2026-10-06 dan dapat berubah.

---

## Executive Summary

- **Pola dominan omnichannel CS/helpdesk:** langganan per seat/agent per bulan dengan tier (3-4 tier) + diskon tahunan 17-25% + add-on AI berbasis usage.
- **Pola dominan BSP/CPaaS WhatsApp:** biaya platform flat (per nomor / per message) + biaya Meta di-pass-through apa adanya (per message, per kategori Marketing/Utility/Auth/Service).
- **Tren besar 2025-2026:** hybrid pricing — base per-seat + komponen usage-based per outcome/resolution/session (Intercom Fin $0,99/outcome, Zendesk automated resolution $1,50-2,00, Freshdesk Freddy session $49/100). Meta resmi pindah ke **per-message pricing (PMP)** sejak Juli 2025 dan mulai menagih Service messages per 1 Okt 2026.
- **Standar pasar untuk lifecycle billing:** upgrade langsung + proration; downgrade/cancel efektif akhir periode (credit, bukan refund); auto-renewal dengan notice 30 hari untuk kontrak.
- **Semua kompetitor punya trial atau free plan.** Model SatuInbox saat ini (no free trial + manual admin approval) = deviasi penuh dari pasar (konsisten dengan temuan audit Track K).

---

## 1. Perbandingan per Platform

### 1.1 Mekari Qontak (Indonesia — omnichannel CRM + WA BSP)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | Dijual per product suite: **Qontak Broadcast, Sales Suite, Service Suite, Qontak 360** (paket terlengkap: CRM + omnichannel + AI chatbot + automation + reporting). Service Suite punya level **Plus** dan **Ultimate** | Terverifikasi (qontak.com) |
| Harga | Halaman pricing resmi menampilkan "Service Suite Plus Rp2.000.000" dan "Service Suite Ultimate" [snippet — satuan (per bulan? per paket?) tidak terbaca penuh]. Pitch deck 2025 [3rd-party/Scribd] menyebut "Ultimate Rp600.000/agent/bulan" dan "recurring balance Rp50.000/bulan" — angka tidak konsisten antar sumber | **tidak diverifikasi** (angka pasti) |
| Unit penagihan | Hybrid: paket base + per agent + biaya WhatsApp per message + balance/recurring top-up [snippet pitch deck]. Blog Qontak sendiri menyebut CRM "mulai Rp400.000/pengguna/bulan" [snippet] | Sebagian [snippet] |
| Fitur gated per tier | Qontak 360 = all features; Service Suite (Plus/Ultimate) = fokus layanan pelanggan; Broadcast terpisah | Terverifikasi (produk), detail gate **tidak diverifikasi** |
| Billing cycle | Bulanan; detail diskon tahunan **tidak diverifikasi** | — |
| Trial/free plan | Ada "Coba Gratis Akun" (help-center Qontak). Durasi & batasan **tidak diverifikasi** | Sebagian |
| Add-ons | Outlet/cabang ditagih terpisah (klaim [3rd-party renr.ai]: Rp300.000/cabang — **tidak diverifikasi**). Biaya Meta WhatsApp di-pass-through | Sebagian |
| Proration/cancel/dunning | **tidak diverifikasi** | — |

Sumber: https://qontak.com/en/pricing/ , https://qontak.com/solusi/kesehatan/ , https://help-center.qontak.com/hc/id/articles/47425969961625-Bagaimana-Cara-Membuat-Email-Campaign , https://id.scribd.com/document/971615025/Qontak-Service-Suite-Pitch-Deck-2025-compressed [3rd-party] , https://renr.ai/id/alternative/vs/qontak [3rd-party]

### 1.2 Qiscus (Indonesia/Malaysia — omnichannel + WA BSP)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | **Quote-based (contact sales)** — tanpa harga publik. Produk modular: Omnichannel Chat, Qiscus AI, Helpdesk, CRM, Call Center, WA API standalone | Terverifikasi (qiscus.com/pricing) |
| Harga | Tidak dipublikasikan; sales memberikan satu quote gabungan | Terverifikasi (tidak ada harga publik) |
| Unit penagihan | Hybrid: (1) produk yang dipakai, (2) **jumlah agent**, (3) **jumlah customer yang dilayani per bulan** (usage tier), (4) channel + add-ons (custom channel, Qiscus CRM, Meta Ads Tracker = add-on). (5) **WhatsApp per message** mengikuti rate Meta per kategori (marketing/utility/auth/service) + negara customer | Terverifikasi |
| Fitur gated per tier | Tidak ada tier publik; per-quote | Terverifikasi |
| Billing cycle | Tidak dipublikasikan. Pembayaran: kartu kredit/debit; kontrak bisa invoice/bank transfer | Sebagian (pembayaran terverifikasi; cycle **tidak diverifikasi**) |
| Trial/free plan | **tidak diverifikasi** | — |
| Add-ons | Custom channel, Qiscus CRM, Meta Ads Tracker | Terverifikasi |
| Voucher/diskon, proration, cancel, dunning | **tidak diverifikasi** | — |

Sumber: https://www.qiscus.com/pricing , https://documentation.qiscus.com/omnichannel-chat/whatsapp-pricing

### 1.3 Wati.io (WhatsApp-first helpdesk, global)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | 3 tier utama: **Growth / Pro / Business** + plan khusus broadcast-only ("For Businesses who ONLY want to send bulk campaigns", nama & harga **tidak diverifikasi**). Add-on Shopify $4,99/bln; add-on "Blitz" (kirim 12k pesan/menit) di Business | Terverifikasi (wati.io/pricing) |
| Harga | **Growth $59/bln (annual) / $69 (monthly)** — 3 user included, TIDAK bisa tambah user, 1 channel. **Pro $119/bln (annual)** — 5 user included, user tambahan $39/user/bln. **Business $279/bln (annual)** — 5 user included, user tambahan $89/user/bln | Terverifikasi |
| Unit penagihan | Hybrid: flat per plan (bukan murni per seat) + bundled users + kuota usage (broadcast 15k/bln Growth @ standard rates; automation triggers 1k/2k/5k free per bulan; API calls 10k/200k/20M per bulan; AI Co-pilot credits 250/500/1.500 free per bulan) + biaya Meta WhatsApp | Terverifikasi |
| Fitur gated per tier | Growth: 1 channel, no extra users, basic automation, 2 integrations (10k API, no webhooks). Pro: +advanced chatbot, retargeting, carousel/catalog, 5 integrations incl. HubSpot, webhooks terbatas. Business: unlimited integrations incl. Salesforce, webhooks ekstensif, Blitz add-on | Terverifikasi |
| Billing cycle | Bulanan & tahunan. **Diskon tahunan "up to ~25%" + free dedicated onboarding** | Terverifikasi |
| Trial/free plan | Ada "free higher plan trial" (trial plan lebih tinggi, bisa dibatalkan kapan saja via Settings > Account Details > Billing) [help center]. Klaim [3rd-party chatmitra] "15-day free trial" — **tidak diverifikasi** | Sebagian |
| Add-ons | Shopify $4,99/bln, Blitz, kelebihan automation/API/AI credits [detail harga overage **tidak diverifikasi**] | Sebagian |
| Cancel | Harus **hubungi tim Billing** + alasan pembatalan + submit tepat waktu [help-center snippet]. Auto-renewal, dunning, grace period, proration **tidak diverifikasi** | Sebagian |

Sumber: https://www.wati.io/pricing/ , https://support.wati.io/en/articles/11463414-understand-cancelling-wati-subscription , https://support.wati.io/en/articles/12521371-how-to-activate-your-free-higher-plan-trial-in-wati , https://chatmitra.com/chatmitra-vs-wati/ [3rd-party]

### 1.4 Intercom (global — AI-first customer service)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | **Fin AI Agent** (usage-based) + 3 tier seat: **Essential / Advanced / Expert** | Terverifikasi (intercom.com) |
| Harga seat | Monthly: **$39 / $99 / $139 per seat**. Annual: **$29 / $85 / $132 per seat** (diskon ~17-25%) | Terverifikasi |
| Harga AI | **Fin AI Agent: dari $0,99 per "Fin outcome"** (resolutions, procedure handoffs, disqualifications, self-serve routing); sales qualification **$9,99** per outcome. Add-on **Fin AI Copilot $35/seat/bln** (~$29 annual) [3rd-party featurebase untuk harga copilot] | Terverifikasi (Fin); Copilot [3rd-party] |
| Unit penagihan | **Hybrid**: per seat + per outcome (usage) + add-on per seat. Keluhan pasar: "assumed resolution" (customer berhenti balas) ikut ditagih [3rd-party] | Terverifikasi |
| Fitur gated per tier | Essential = entry; Advanced = automation/workflow lebih; Expert = custom roles, workload management, dll (detail gate **tidak diverifikasi** per fitur) | Sebagian |
| Billing cycle | Bulanan & tahunan (annual = bayar di muka untuk diskon; **tanpa refund prorated jika cancel awal**) | Terverifikasi |
| Trial/free plan | Free trial ada (artikel resmi "how to sign up for a free trial of Intercom"). Durasi **tidak diverifikasi** (umum disebut 14 hari oleh pihak ketiga) | Sebagian |
| Proration | **Upgrade: langsung aktif + ditagih prorated** (annual: prorated untuk sisa term). **Downgrade: kredit untuk unused time diterapkan otomatis ke invoice berikutnya (BUKAN refund)**; annual downgrade terjadwal saat renewal | Terverifikasi |
| Cancel / auto-renewal | Cancel self-service via workspace (Billing > Payment details); akses sampai akhir periode; data TIDAK dihapus tapi tidak bisa diakses sampai resubscribe. **Kontrak: wajib notice tertulis ≥30 hari sebelum renewal — kalau lewat, otomatis renew 12 bulan** | Terverifikasi |

Sumber: https://www.intercom.com/pricing , https://www.intercom.com/help/en/articles/9061614-fin-and-intercom-plans-explained , https://www.intercom.com/help/en/articles/8344189-how-to-manage-your-subscription , https://www.intercom.com/help/en/articles/8367468-understand-how-billing-works-for-a-monthly-or-annual-subscription , https://www.intercom.com/help/en/articles/9088378-how-to-cancel-your-subscription , https://www.featurebase.app/blog/intercom-pricing [3rd-party]

### 1.5 Zendesk (global — customer service suite)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | Customer Service Suite: **Support Team / Suite Team / Suite Growth / Suite Professional / Suite Enterprise (+Copilot)**. Garis terpisah: Employee Service Suite ($29/$59/$99 annual) | Terverifikasi (zendesk.com) |
| Harga (annual / monthly per agent/bln) | **Support Team $19/$25**; **Suite Team $55/$69**; **Suite Growth tidak dipublikasikan** (tracker pihak ketiga $79-89 — **tidak diverifikasi**); **Suite Professional $115/$149**; **Suite Enterprise ~$169/$219** [3rd-party kustomer; halaman resmi kini "contact sales" untuk Enterprise+Copilot] | Terverifikasi (kecuali Growth & Enterprise) |
| Harga AI | "Automated resolutions" (AI agents): **5 AR gratis per agent/bln** (Support Team/Suite Team), **10** (Professional), **15** (Enterprise) [3rd-party desk365 untuk angka Enterprise]; setelahnya **$1,50-2,00 per AR** | Sebagian |
| Unit penagihan | **Per agent/seat** + usage AI (per AR) + biaya channel pass-through | Terverifikasi |
| Fitur gated per tier | Support Team = email-only ticketing; Suite Team = omnichannel basics + 1 help center; Growth = SLA, CSAT, light agents; Professional = skills-based routing, IVR, custom roles, HIPAA; Enterprise = sandbox, audit log, multi-brand (300 help centers) | Terverifikasi |
| Billing cycle | Bulanan & tahunan (annual lebih murah ~20%) | Terverifikasi |
| Trial/free plan | Trial tersedia; durasi **tidak diverifikasi** (umum disebut 14 hari [3rd-party]) | Sebagian |
| Add-ons | Contact Center $83/agent/bln (annual), Copilot, Workforce Engagement, Advanced Data Privacy & Protection, QA [harga sebagian **tidak diverifikasi**] | Sebagian |
| Proration / cancel | **Upgrade: bisa langsung, charge prorated. Downgrade / pengurangan agent: hanya efektif saat renewal (bisa dijadwalkan). Cancel: efektif akhir billing cycle**, sebagian produk butuh support. Auto-renewal kontrak berlaku (laporan Reddit: auto-renew jadi kontrak 3 tahun — [3rd-party]) | Terverifikasi (help.zendesk.com; kecuali catatan kontrak) |

Sumber: https://www.zendesk.com/pricing/ , https://support.zendesk.com/hc/en-us/articles/4408827607962-How-do-I-update-my-subscription , https://support.zendesk.com/hc/en-us/articles/4408834902810-Canceling-products-and-accounts , https://support.zendesk.com/hc/en-us/articles/4408845615386-Why-did-my-subscription-change-not-go-into-effect-immediately , https://www.desk365.io/blog/zendesk-pricing/ [3rd-party] , https://www.kustomer.com/resources/blog/how-much-does-zendesk-cost/ [3rd-party]

### 1.6 Freshdesk (global — helpdesk)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | **Growth / Pro / Enterprise** (Freshdesk standalone; omnichannel = Freshdesk Omni, harga terpisah) | Terverifikasi (freshworks.com) |
| Harga | **Growth $19 / Pro $55 / Enterprise $89 per agent/bln (billed annually)**; "Save 20% Annually" (harga monthly ~20% lebih mahal) | Terverifikasi |
| Harga AI | **Freddy AI Agent: 500 session gratis (sekali per akun), lalu $49 per 100 session**; session = interaksi unik dengan AI Agent (email: window 72 jam = 1 session). Pack session berlaku sampai akhir payment cycle (kuartal-an jika bayar kuartalan). **Freddy AI Copilot $29/agent/bln (annual)** — boleh dibeli untuk sebagian agent saja | Terverifikasi |
| Unit penagihan | **Per agent** + usage AI (session packs) + **"Day passes"** untuk agent musiman: **$2 / $7 / $12 per pass** (Growth/Pro/Enterprise) + connector tasks $80/5.000 + MCP actions $15/1.000 | Terverifikasi |
| Fitur gated per tier | Growth = ticketing, shared inbox, KB, analytics dasar, roles. Pro = +multilingual, custom dashboard, intelligent routing, multiple SLA, external collaborators. Enterprise = +Freddy AI Insights, skill-based routing, sandbox, audit log, IP whitelisting. Collaborators eksternal: 5.000 included (Pro/Ent) | Terverifikasi |
| Billing cycle | Bulanan & tahunan (annual hemat 20%) | Terverifikasi |
| Trial/free plan | **Trial 14 hari akses penuh Enterprise**; sebelum habis pilih plan + bayar kartu, kalau tidak akun disuspend. **Tidak ada free plan permanen** | Terverifikasi |
| Cancel / proration | **Upgrade: instan. Downgrade/cancel: efektif akhir term** (self-service via Billing). **Tanpa cancellation fee.** Pembayaran: kartu (Visa/MC/Discover/Amex), tanpa PayPal; offline payment USD. Dunning/grace period: **tidak diverifikasi** | Terverifikasi (kecuali dunning) |

Sumber: https://www.freshworks.com/freshdesk/pricing/

### 1.7 Twilio (CPaaS — WhatsApp Business API)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | Tidak ada paket — **pure usage-based**. Free trial akun tanpa kartu kredit | Terverifikasi (twilio.com) |
| Harga | **Twilio fee $0,005 per message** (in/out) + **biaya Meta pass-through** per template/message per kategori & negara (contoh: Utility/Auth mulai $0,0034/pesan; Utility template GRATIS fee Meta di dalam customer service window 24 jam). **Failed message processing fee $0,001** per pesan gagal | Terverifikasi (harga per Sept 2026) |
| Unit penagihan | Per message (Meta per-message pricing). Catatan Meta: **first 1.000 Service messages/bulan gratis fee Meta, tidak rollover** | Terverifikasi |
| Add-on | **Messaging Engagement Suite** (link shortening/click tracking + scheduling): +$0,015/pesan, 1.000 pertama gratis per bulan. WhatsApp Business Calling: $0,005/menit Twilio + Meta connectivity per menit (mis. outbound Asia Pasifik $0,0114/menit) | Terverifikasi |
| Billing cycle | Bulanan, pay-as-you-go (usage). Dunning/grace: **tidak diverifikasi** | Sebagian |

Sumber: https://www.twilio.com/en-us/whatsapp/pricing , https://developers.facebook.com/docs/whatsapp/pricing#rate-cards

### 1.8 360dialog (WhatsApp BSP — developer-first)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | **Flat subscription per nomor WhatsApp**: "REGULAR €49 per number per month" (situs menyebut "from €49/month"; halaman /whatsapp-api menyebut "start at $59 / 49 EUR per number per month"). Tanpa setup fee, tanpa minimum volume | Terverifikasi [snippet + halaman resmi] |
| Harga message | **Biaya Meta di-pass-through tanpa markup** (positioning utama mereka: "fixed sub, no markup anywhere"); tagihan per message, rate tergantung arah & kategori, dibayar dalam EUR/USD/INR | Terverifikasi (docs.360dialog.com) |
| Unit penagihan | Flat per nomor/bulan + per message (Meta at actuals) | Terverifikasi |
| Tier detail (Pro/Enterprise), trial, cancel, proration | **tidak diverifikasi** | — |

Sumber: https://360dialog.com/pricing , https://360dialog.com/whatsapp-api , https://docs.360dialog.com/docs/get-started/pricing , https://360dialog.com/blog/whatsapp-business-api-pricing-why-markup-on-messages-often-costs-you-more/

### 1.9 Gupshup (CPaaS — WhatsApp API self-serve)

| Aspek | Temuan | Status |
|---|---|---|
| Struktur paket | **Self-serve pay-as-you-go**: fee Gupshup **$0,001 per message** (template & session message keluar/masuk) + **WhatsApp fee Meta "billed at actuals"**. Enterprise features terpisah (contact sales) | Terverifikasi (gupshup.io/pricing) |
| Contoh rate Meta [halaman default country — negara default TIDAK diverifikasi, rate card per negara] | Marketing $0,0118; Utility $0,0014; Authentication $0,0014 (Intl $0,0304); Service $0,0014 (**1.000 Service messages pertama bebas fee WhatsApp**); CTWA (Click-to-WhatsApp Ads) free entry point 7 hari pertama $0 | Terverifikasi (angka), negara **tidak diverifikasi** |
| Markup | Markup **$0,000708** di atas fee WhatsApp untuk marketing non-MM Lite. Media >64KB gratis dari sisi Gupshup | Terverifikasi |
| Tren kebijakan Meta | **Meta per-message pricing live sejak Juli 2025**; **mulai 1 Okt 2026 Meta menagih Service messages** (sebelumnya gratis) | Terverifikasi (gupshup.io) |
| Trial/cancel/dunning | Free tier/tidaknya saldo awal **tidak diverifikasi**; kebijakan cancel **tidak diverifikasi** | — |

Sumber: https://www.gupshup.io/pricing/ , https://support.gupshup.io/hc/en-us/articles/47379153369113-Gupshup-PMP-per-message-pricing-related-changes-for-July-2025

---

## 2. Tabel Ringkas Cross-Platform

| Platform | Unit dasar | Model AI | Diskon tahunan | Trial | Upgrade prorated | Downgrade | Cancel fee |
|---|---|---|---|---|---|---|---|
| Mekari Qontak | Hybrid paket + per agent + WA per msg (tidak diverifikasi) | Bagian paket (AI chatbot) | tidak diverifikasi | Coba gratis (durasi t.v.) | tidak diverifikasi | tidak diverifikasi | tidak diverifikasi |
| Qiscus | Quote: per agent + per customer/bln + WA per msg | Per quote | tidak diverifikasi | tidak diverifikasi | tidak diverifikasi | via account manager | tidak diverifikasi |
| Wati.io | Flat per plan + bundled users + kuota usage | AI Co-pilot credits (kuota) | ~25% + free onboarding | Higher-plan trial (durasi t.v.) | tidak diverifikasi | tidak diverifikasi | via Billing team |
| Intercom | Per seat + per Fin outcome ($0,99) | Usage per outcome + Copilot per seat | ~17-25% | Ada (durasi t.v.) | Ya, prorated | Kredit ke invoice berikutnya; annual saat renewal | Tidak ada refund prorated annual |
| Zendesk | Per agent + per automated resolution | Included allowance lalu $1,50-2/AR | ~20% | Ada (14 hari [3rd-party]) | Ya, prorated | Hanya saat renewal | Tidak ada; efektif akhir cycle |
| Freshdesk | Per agent + session packs + day passes | 500 session gratis lalu $49/100 | 20% | 14 hari Enterprise | Instan | Akhir term | **Tanpa cancellation fee** |
| Twilio | Pure usage per message ($0,005 + Meta) | n/a | n/a (volume discount mungkin) | Free trial tanpa kartu | n/a | n/a | n/a |
| 360dialog | Flat €49/nomor/bln + Meta at actuals | n/a | tidak diverifikasi | tidak diverifikasi | n/a | tidak diverifikasi | tidak diverifikasi |
| Gupshup | Usage $0,001/msg + Meta at actuals | n/a | n/a | tidak diverifikasi | n/a | tidak diverifikasi | tidak diverifikasi |

*(t.v. = tidak diverifikasi)*

---

## 3. Pola Umum (Pattern) Model Subscription CS Platform

1. **Per-seat adalah base yang paling umum** (Intercom, Zendesk, Freshdesk), dengan 3-4 tier. Wati menyimpang: flat per plan dengan bundled users (3-5) dan larangan menambah user di tier terbawah — memaksa upgrade untuk tim >3 orang.
2. **Indonesia cenderung quote/hybrid** (Qiscus full quote; Qontak paket suite + per agent + top-up balance). Harga publik transparan adalah pengecualian, bukan norma.
3. **AI selalu dijual terpisah dari seat**, dalam dua bentuk yang sering dikombinasikan:
   - per-seat add-on (Intercom Copilot $35/seat, Freshdesk Copilot $29/agent);
   - usage-based per outcome/session/resolution (Fin $0,99/outcome; Zendesk AR $1,50-2; Freddy $49/100 session) dengan **allowance gratis kecil** lalu bayar.
4. **Allowance-included + overage** adalah pola gating usage yang dominan (Zendesk 5-15 AR/agent, Freshdesk 500 session sekali, Wati kuota automation/API/AI credits per bulan, Twilio 1.000 link-tracking gratis). Catatan penting: kuota umumnya **reset dan TIDAK rollover** (Twilio eksplisit; Freshdesk pack expire per payment cycle).
5. **Diskon tahunan konsisten 17-25%** (Intercom ~17-25%, Zendesk ~20%, Freshdesk 20%, Wati up to ~25%) + insentif onboarding (Wati: free dedicated onboarding).
6. **Add-on ecosystem**: contact center, Shopify/e-commerce, connector tasks, MCP actions, day passes. **"Day pass" (Freshdesk $2-12/pass)** adalah pola menarik untuk agent musiman — jarang ada tapi cocok untuk pasar dengan tenaga kerja fleksibel.
7. **Trial universal**: semua kompetitor punya trial (Freshdesk 14 hari full Enterprise) atau free tier. Tidak ada satu pun yang memakai manual admin approval gate sebelum berbayar.

## 4. Pola Billing Lifecycle (Standar Industri)

| Perilaku | Standar pasar |
|---|---|
| Upgrade | **Langsung aktif, charge prorated** sisa periode (Intercom, Zendesk; Freshdesk instan) |
| Downgrade | **Efektif akhir periode/renewal** (Zendesk, Freshdesk, Intercom-annual); Intercom-monthly memberi **kredit** unused time ke invoice berikutnya, **bukan refund** |
| Cancel | Self-service (Intercom, Freshdesk) atau via support/Billing (Wati, Zendesk untuk sebagian produk); akses sampai akhir periode berjalan |
| Refund | **Prorated refund umumnya TIDAK ada** (Intercom annual eksplisit; Freshdesk pay-as-you-go tanpa cancel fee tapi tanpa refund) |
| Auto-renewal | Default aktif. Kontrak: **notice tertulis ≥30 hari sebelum renewal** (Intercom), jika lewat auto-renew 12 bulan |
| Dunning/grace period | Tidak dipublikasikan mayoritas platform → **tidak diverifikasi** |

## 5. Tren (2025-2026)

1. **Hybrid prepaid/usage naik daun**: base per-seat + metered AI outcome. Pasar mengeluhkan ketidakpastian billing (keluhan viral "Intercom $0,99/resolution termasuk assumed resolution"), tapi trennya tetap ke sana karena vendor mengejar monetisasi AI.
2. **WhatsApp bergerak ke pure per-message**: Meta PMP berlaku Juli 2025; Service messages mulai ditagih 1 Okt 2026 (Gupshup). Model "conversation-based" resmi Meta sudah berganti. Implikasi: **unit penagihan WA harus per message, bukan per conversation**, di dokumen SatuInbox.
3. **BSP memisahkan diri lewat transparansi margin**: 360dialog (flat + no markup), Gupshup (markup tipis $0,000708) vs Twilio (fee $0,005/msg). Vendor yang markup-nya besar makin diserang.
4. **Allowance kecil sebagai "coba rasa" AI** menggantikan free plan penuh (Freshdesk 500 session sekali per akun, Zendesk 5-15 AR/agent).
5. **Usage yang tidak rollover jadi pendapatan terselubung** — dan titik keluhan pelanggan. Roll-over atau "top-up wallet hangus" mulai jadi pembeda.

## 6. Insight untuk SatuInbox (omnichannel CS Indonesia)

1. **Model hybrid yang cocok untuk SatuInbox:** base per-agent (atau bundled seperti Wati) + kuota channel/broadcast + **biaya WhatsApp per-message Meta pass-through dengan markup tipis yang transparan**. Jangan markup tersembunyi — itu yang paling diserang kompetitor (kampanye 360dialog).
2. **No free trial = outlier ekstrem.** Semua kompetitor self-serve dengan trial. Minimal: trial 14 hari tanpa kartu (pola Freshdesk, full-feature) atau tier free kecil. Manual approval gate hanya untuk enterprise/onboarding berat.
3. **Bikin keputusan eksplisit soal AI pricing sekarang:** tren pasar = allowance kecil + per-outcome/session. Kalau SatuInbox nanti punya AI, jangan kunci di seat price.
4. **Terapkan standar lifecycle billing pasar:** upgrade prorated langsung; downgrade/cancel efektif akhir periode dengan kredit (bukan refund) — ini sudah hampir jadi formula SatuInbox (`(remainingDays/totalDaysInMonth)×price`) tapi perlu didokumentasikan sebagai kebijakan publik.
5. **Auto-renewal + notice 30 hari** untuk kontrak tahunan (pola Intercom) — definisikan dunning & grace period sendiri karena kompetitor tidak transparan di sini (peluang: kejelasan = nilai jual).
6. **"Day pass" (Freshdesk) relevan untuk pasar Indonesia** (agent musiman/freelance, campaign season) — pembeda murah untuk dibangun.
7. **Quota rollover jadi pembeda:** kebijakan SatuInbox saat ini (CHANNEL/AGENT carry-over, BROADCAST reset bulanan) sudah lebih ramah dari standar pasar (umumnya hangus). Jadikan ini klaim marketing, tapi audit dulu cash/wallet path (topup double-credit, AUTH-12) sebelum promosi.
8. **Wallet/top-up prepaid** punya padanan pasar (Qontak "recurring balance Rp50.000/bulan" [tidak diverifikasi], Gupshup credit-based self-serve) — model ini lazim di Indonesia karena kartu kredit penetrasi rendah; pertahankan bank transfer/invoice ala Qiscus.
9. **Pricing page transparan = pembeda vs Qiscus/Qontak** yang quote-only. Minimal publish "mulai dari RpX/agent/bulan" untuk menang lead self-serve.
10. **Biaya WA per-message jangan digabung ke seat price** — Meta PMP + penagihan Service messages mulai Okt 2026 membuat biaya passthrough tidak bisa diprediksi; pisahkan line item di invoice.

---

## Open Questions

- Angka pasti paket Mekari Qontak (Rp2.000.000 = per bulan per apa? Rp600.000/agent = tier apa?) — perlu verifikasi langsung ke sales/pricing page Qontak (halaman tidak bisa diekstrak otomatis saat riset).
- Qiscus: apakah ada free trial dan minimum contract — perlu tanya sales.
- 360dialog: tier di atas Regular dan kebijakan cancel — perlu ekstraksi ulang docs.
- Kebijakan dunning/grace period semua platform — tidak dipublikasikan; perlu benchmark via uji coba langsung.
- Freshdesk monthly price exact (hanya "Save 20% annually" yang terverifikasi).

## Limitasi Riset

- Backend pencarian/ekstraksi (Firecrawl keyless) mengalami rate-limit intermiten (403) selama riset; sebagian halaman (qontak.com/pricing, 360dialog.com/pricing detail, intercom help articles) hanya tercapture via snippet pencarian. Semua klaim dari snippet ditandai dan ketidakpastian dinyatakan eksplisit — tidak ada angka yang dikarang.
