# Deep Research: Subscription / Billing / Pricing — SaaS & Omnichannel CS Platforms

Konteks: input riset untuk Assessment Report audit modul subscription/billing SatuInbox (omnichannel CS, SaaS multi-tenant Indonesia; payment-service + billing: wallet/top-up, gateway webhooks, invoice, proration, voucher, quota/token usage, upcoming bill, packages, add-on prices).

Metodologi: `web_search` + `web_extract` (sebagian via proxy `r.jina.ai` karena extractor utama kena 403 di beberapa domain). Setiap klaim diberi URL sumber. Yang tidak ketemu ditandai **TIDAK TERKONFIRMASI**. Harga = per bulan kecuali disebut lain; mata uang USD kecuali disebut. Snapshot: Okt 2026 (sumber bertanggal 2025–2026).

Grup A = omnichannel CS (Intercom, Zendesk, Freshchat/Freshdesk, Qiscus). Grup B = SaaS best-practice umum (Slack, Notion, Linear).

---

## 1. Intercom (rebrand → "Fin"; Salesforce acquisition signed Jun 2026, belum closed)

**Sumber:** https://www.intercom.com/pricing ; https://www.featurebase.app/blog/intercom-pricing ; https://www.intercom.com/help/en/articles/8205718-fin-ai-agent-outcomes

- **Pricing model:** hybrid — per-seat (helpdesk) **+** usage-based per-outcome (Fin AI) **+** add-on **+** usage-based channels.
- **Plan & harga (per seat/mo):**
  | Plan | Monthly | Annual | Lite seats gratis |
  |---|---|---|---|
  | Essential | $39 | $29 | — |
  | Advanced | $99 | $85 | 20 |
  | Expert | $139 | $132 | 50 |
  (Harga via featurebase; halaman resmi menampilkan angka ter-obfuscate tapi mencantumkan "Save up to 26%" untuk annual.)
- **Fin AI Agent: $0.99 per OUTCOME** di semua plan (bukan per-resolution flat, bukan per-seat). Outcome = resolution / procedure handoff / disqualification @ $0.99; **lead qualification @ $9.99**. **Max 1 outcome per conversation**; jika conversation reopened, outcome **di-refund**. Tidak dibayar jika Fin gagal menjawab atau customer minta human. **Minimum 50 outcomes/bulan.** Spending limits + alerts tersedia. Fin Voice $1.99/voice outcome (via sales). (https://www.intercom.com/pricing)
- **Billing mechanics:** monthly vs annual (annual diskon ~25–35%/seat per featurebase; resmi "up to 26%"). Usage-based channels (WhatsApp, SMS, phone) ditagih terpisah per usage — kategori "Usage-based channels" ada di help center (https://www.intercom.com/help/en/articles/9061703-usage-based-channels) tapi **tarif per-channel TIDAK TERKONFIRMASI** (body SPA tidak ter-extract).
- **Proration saat upgrade/downgrade mid-cycle: TIDAK TERKONFIRMASI** (artikel billing resmi `8367468` client-side rendered, body tidak terbaca via extractor/proxy).
- **Add-ons:** Pro (Operator) dari $99/workspace/mo; Copilot $29/teammate/mo (10 Copilot + 10 AI auto-translation conv/agent/mo gratis); Proactive Support Plus. (https://www.intercom.com/pricing)
- **Self-serve:** manage subscription, view/download invoice, cancel — semua ada sebagai artikel help center (collection "Managing your subscription"). **Voucher/coupon publik: TIDAK TERKONFIRMASI** (ada program diskon: Early Stage 93% off + $6,500 Fin credit; new-customer 35% off Essential).
- **Payment/dunning:** gateway & metode pembayaran spesifik **TIDAK TERKONFIRMASI**; "update billing details" artikel ada. Dunning/failed-payment handling **TIDAK TERKONFIRMASI**.
- **Trial→paid:** 14-day free trial, **no credit card required**, full access + unlimited Fin outcomes gratis saat trial; lanjut = tambah payment details & confirm plan. (featurebase)

---

## 2. Zendesk (Suite)

**Sumber:** https://www.zendesk.com/pricing/ ; https://www.helpdesk.com/blog/zendesk-pricing/ ; https://support.zendesk.com/hc/en-us/articles/4408846875034-About-the-Zendesk-Suite-plan-types

- **Pricing model:** per-agent, flat tier; AI & add-on usage-based di atasnya.
- **Plan & harga (per agent/mo):**
  | Plan | Annual | Monthly |
  |---|---|---|
  | Support Team (ticketing-only) | $19 | $25 |
  | Suite Team | $55 | $69 |
  | Suite Professional | $115 | $149 |
  | Suite Enterprise | quote-only | quote-only |
  (Suite Growth **dihapus** dari halaman publik 2026; buyer baru pilih Team/Professional.) (helpdesk.com, 2026)
- **Billing:** monthly vs annual (annual ~20%+ lebih murah). Add-on terpisah per-seat: Copilot ~$50, QA ~$35; outcome-based AI meter + voice minutes = biaya variabel. "Floor, not forecast." (helpdesk.com)
- **Proration mid-cycle: TIDAK TERKONFIRMASI** (artikel plan-types ter-extract tapi body plan detail terpotong; artikel proration spesifik belum diambil).
- **Self-serve up/down/cancel, invoice history, voucher: TIDAK TERKONFIRMASI** detilnya dari sumber yang diambil.
- **Payment/dunning:** **TIDAK TERKONFIRMASI.**
- **Trial→paid:** **no free plan**, 14-day trial; Zendesk for Startups program ada. (helpdesk.com)

---

## 3. Freshworks — Freshchat & Freshdesk Omni

**Sumber:** https://www.eesel.ai/blog/freshchat-pricing ; https://www.featurebase.app/blog/freshdesk-pricing ; https://www.freshworks.com/freshdesk/omni/pricing/

- **Pricing model:** per-agent flat tier + usage-based AI (Freddy "sessions") + add-on.
- **Freshchat (per agent/mo):**
  | Plan | Annual | Monthly |
  |---|---|---|
  | Free (≤10 agents) | $0 | $0 |
  | Growth | $19 | $23 |
  | Pro | $49 | $59 |
  | Enterprise | $79 | $95 |
  (eesel.ai) Semua paid: **500 Freddy AI sessions/mo included, lalu pay-as-you-go.** Session = 1 unique bot↔customer chat per 24 jam.
- **Freshdesk Omni (ticketing+messaging, per agent/mo):**
  | Plan | Annual | Monthly |
  |---|---|---|
  | Omni Growth | $29 | $35 |
  | Omni Pro | $79 | $95 |
  | Omni Enterprise | $119 | $143 |
  (featurebase, 2026) Core Freshdesk (ticketing) terpisah: Growth $19 / Pro $55 / Enterprise $89 annual.
- **Usage overage:** Freddy AI Copilot **$29/agent/mo (annual)** di Pro/Enterprise. **AI Agent: $49 per 100 sessions** setelah 500 one-time sessions included; unused sessions **expire akhir billing cycle.** Campaign contacts juga metered. (featurebase, eesel)
- **Billing:** monthly vs annual (annual ~17% lebih murah). **Proration mid-cycle: TIDAK TERKONFIRMASI.**
- **Self-serve/cancel:** cancel tidak kena fee terpisah; **efektif akhir billing term** (annual tidak di-refund partial). Voucher/invoice history **TIDAK TERKONFIRMASI.**
- **Payment/dunning:** **TIDAK TERKONFIRMASI.**
- **Trial→paid:** **Free Program** $0 untuk 1–2 agent selama **6 bulan** (Freshdesk core saja, **tidak** untuk Omni); 14-day Enterprise trial. (featurebase)

---

## 4. Qiscus (Omnichannel Chat) — Indonesia, Meta Business Partner ⭐ paling relevan untuk SatuInbox

**Sumber:** https://www.qiscus.com/en/pricing ; https://www.eesel.ai/blog/qiscus-pricing ; https://documentation.qiscus.com/omnichannel-chat/subscriptions ; https://documentation.qiscus.com/omnichannel-chat/self-top-up-credit ; https://documentation.qiscus.com/omnichannel-chat/whatsapp-pricing

- **Pricing model: 3 meter bertumpuk** — (a) plan (seats + MAU cap) flat, (b) overage (extra MAU + extra agent), (c) WhatsApp per-message pass-through dari Meta.
- **Plan (Omnichannel Chat, USD/mo):**
  | Plan | Harga | Agents | MAU cap | Agent Co-Pilot |
  |---|---|---|---|---|
  | Startup | $115 | 5 | ≤3,000 | tidak |
  | Grow | $270 | 10 | ≤10,000 | ya |
  | Enterprise | Custom | Unlimited | >10,000 | ya |
  (eesel.ai) Harga USD berlaku untuk **nomor WhatsApp Indonesia**; negara/currency lain quote-only.
- **Usage overage:** **$18 per tambahan 500 MAU/mo** (hingga +10,000); **$18 per extra agent seat/mo** (hingga +7). Di atas itu → sales quote. (eesel.ai) MAU = unique user yang messaging dalam sebulan (broadcast marketing bisa mendorong naik).
- **WhatsApp usage (wallet/credit model):**
  - Dua balance: **Credit** (prepaid, harga per-conversation tergantung country code) + **Free Session**. (self-top-up-credit doc)
  - **Prepaid:** balance dicek sebelum tiap service message, deduct per delivered; habis → sending stop sampai top up. **Postpaid:** masuk invoice bulanan, bisa set **Daily Budget** per conversation/channel. (whatsapp-pricing doc)
  - Mulai **1 Okt 2026:** service message & utility template dalam window jadi **chargeable** (perubahan Meta); admin harus **approve per-message billing** sebelum 1 Okt 2026 atau agent tak bisa kirim WA reply. Free Entry Point window (72 jam) tetap gratis.
- **Self-serve subscription (dashboard Settings → Subscription):** Current Subscription, **Usage Activity (MAU: Limit MAU Plan + Extra MAU, update harian 13:00 WIB)**, Billing Email, **Top Up MAU**, **Upgrade Plan** (USD/IDR), **Subscription History**, **MAU Top Up History**, Payment Method. (subscriptions doc)
- **Self top-up credit:** via dashboard, **IDR atau USD**. IDR: Credit Card (Visa/Mastercard/JCB) + **Virtual Account (BNI, BRI, Mandiri, Permata, CIMB, BCA coming soon)**, min Rp10K. USD: credit card, min $10K unit. Unpaid transaction auto-cancel; harus selesai ≤3 hari. (self-top-up-credit doc)
- **Payment/gateway:** recurring card billing; saat add kartu ada **charge verifikasi Rp10,000 yang auto-refund**. Gateway fee di-pass ke user:
  - IDR card: **3.7% + Rp2,500** (Rp10K–800jt) + **11% VAT**
  - USD card: **4.8% + $3** ($ equiv)
  - **Virtual Account: Rp5,000** + 11% VAT
  - DBS manual transfer: tanpa platform fee (bank charge mungkin ada). (subscriptions doc → Additional Fee)
  - USD juga mendukung **manual bank transfer**.
- **Proration mid-cycle: TIDAK TERKONFIRMASI** (upgrade plan ada tapi mekanik proration tidak dijelaskan di doc yang diambil).
- **Voucher/coupon: TIDAK TERKONFIRMASI.**
- **Trial→paid:** **14-day trial** untuk user baru; lanjut via Subscription menu. (subscriptions doc)

---

## 5. Slack (grup B — benchmark per-seat fair-billing)

**Sumber:** https://slack.com/pricing ; https://slack.com/help/articles/218915077-Slacks-Fair-Billing-Policy

- **Pricing model:** per active user, flat tier.
- **Plan (per user/mo):**
  | Plan | Monthly | Annual |
  |---|---|---|
  | Free | $0 | $0 |
  | Pro | $8.75 | $7.25 |
  | Business+ | $18 | $15 |
  | Enterprise+ | contact sales | — |
  (Promo saat snapshot: 50% off 3 bulan Pro/Business+.)
- **Billing / proration ("Fair Billing Policy") — contoh kuat untuk SatuInbox:**
  - Ditagih hanya untuk **active members**; member inactive >28 hari → **prorated CREDIT** otomatis ke akun, dipakai untuk pembayaran/renewal berikut.
  - Tambah member mid-cycle → prorated charge. Rumus: **(harga/seat ÷ hari dalam bulan) × hari tersisa.** Contoh: $8.75 ÷ 30 × 20 = $5.83.
  - Deaktivasi member mid-cycle → prorated credit (contoh $8.75 ÷ 30 × 15 = $4.38, deposit keesokan hari).
  - Minimum ditagih 1 member. Add-on dihitung cara sama.
  - Annual by invoice: outstanding ditagih **per kuartal**. (fair-billing doc)
- **Self-serve:** upgrade/downgrade/cancel + billing details di dashboard (artikel "Manage your Slack plan and billing details"). **Voucher: TIDAK TERKONFIRMASI.**
- **Payment:** credit card atau self-serve invoicing (pay by invoice). Dunning spesifik **TIDAK TERKONFIRMASI.**
- **Trial→paid:** Free plan permanen (bukan trial); upgrade kapan saja. Paid vs Free doc tersedia.

---

## 6. Notion (grup B)

**Sumber:** https://www.notion.com/pricing ; https://www.notion.com/help/upgrade-or-downgrade-your-plan ; https://lifestack.ai/blog/notion-pricing

- **Pricing model:** per-member, flat tier + AI credits usage add-on.
- **Plan (per member/mo):**
  | Plan | Annual | Catatan |
  |---|---|---|
  | Free | $0 | 7-day history, 5MB upload, 10 guest |
  | Plus | $10 | unlimited upload, 30-day history |
  | Business | $20 | full AI (Notion Agent), 90-day history, SAML SSO |
  | Enterprise | Custom | SCIM, audit log, zero-data-retention |
  (lifestack, 2026) Monthly lebih mahal; **annual hemat ~20%** ("Save up to 20% with yearly" — halaman resmi).
- **Usage overage / add-on:** **Custom Agents: $10 per 1,000 monthly Notion credits**; Workers (beta) butuh Notion credits. (notion.com/pricing)
- **Proration mid-cycle (eksplisit di help resmi):** upgrade mid-interval → plan baru **efektif langsung + mulai billing period baru**; **ditagih langsung dikurangi prorated amount** dari sisa waktu plan lama. (upgrade-or-downgrade doc)
- **Self-serve:** upgrade/downgrade/cancel di Settings; billing per-workspace (multi-workspace bisa beda plan). Members bisa **request upgrade/add-on** (owner approve). **Voucher: TIDAK TERKONFIRMASI** (ada Education free & 30-day Business trial).
- **Payment:** **Stripe** — credit/debit card, Apple Pay, Google Pay. Mobile purchase via App Store/Play Store (kelola di sana). Dunning spesifik **TIDAK TERKONFIRMASI.**
- **Trial→paid:** Free plan permanen; **30-day Business trial**; upgrade via Settings.

---

## 7. Linear (grup B)

**Sumber:** https://linear.app/pricing

- **Pricing model:** per-user, flat tier + AI credits.
- **Plan (per user/mo):**
  | Plan | Harga | Catatan |
  |---|---|---|
  | Free | $0 | unlimited members, 2 teams, 250 issues |
  | Basic | $10 (billed yearly) | 5 teams, unlimited issues |
  | Business | $16 (billed yearly) | unlimited teams, private teams, intelligence features |
  | Enterprise | Custom (annual only) | Invoice/PO billing, SAML/SCIM |
  (Harga resmi tercantum "billed yearly"; monthly rate **TIDAK TERKONFIRMASI** dari halaman — resmi hanya menampilkan yearly.)
- **Usage overage:** Coding sessions & Loops butuh **AI credits** (https://linear.app/docs/ai-credits). Salesforce integration = add-on. Detail harga credit **TIDAK TERKONFIRMASI.**
- **Proration mid-cycle: TIDAK TERKONFIRMASI** (halaman docs billing & secondary sources kena 403).
- **Self-serve:** upgrade/plan change di `linear.app/settings/plans`. Enterprise = invoice/PO. Voucher/invoice history **TIDAK TERKONFIRMASI.**
- **Payment/dunning:** **TIDAK TERKONFIRMASI** (Enterprise: invoice/PO billing).
- **Trial→paid:** Free plan permanen; trial Basic/Business **TIDAK TERKONFIRMASI** detilnya.

---

## Tabel Komparasi

| Platform | Pricing basis | Annual discount | Proration (up/down mid-cycle) | Self-serve up/downgrade | Usage overage | Voucher/coupon |
|---|---|---|---|---|---|---|
| **Intercom** | Per-seat + per-outcome (Fin $0.99) + usage channels | ~25–35%/seat (resmi "up to 26%") | TIDAK TERKONFIRMASI | Ya (dashboard; cancel/invoice artikel ada) | Fin $0.99/outcome (min 50/mo, reopen=refund); channels (WA/SMS) metered | Program diskon (Early Stage 93%, 35% off Essential); coupon umum TIDAK TERKONFIRMASI |
| **Zendesk** | Per-agent flat tier + AI meter | ~20%+ (Team $55 vs $69) | TIDAK TERKONFIRMASI | TIDAK TERKONFIRMASI (detil) | Copilot $50, QA $35, outcome AI, voice minutes | TIDAK TERKONFIRMASI |
| **Freshchat/Omni** | Per-agent flat tier + Freddy sessions | ~17% (Growth $19 vs $23) | TIDAK TERKONFIRMASI | Cancel di akhir term (no partial refund) | 500 AI sessions incl., lalu $49/100; Copilot $29/agent | TIDAK TERKONFIRMASI |
| **Qiscus** | Per-plan (seats+MAU) + MAU/agent overage + WA per-msg wallet | TIDAK TERKONFIRMASI (plan bulanan) | TIDAK TERKONFIRMASI | **Ya (Settings→Subscription: upgrade, Top Up MAU, history, payment method)** | **$18/500 MAU, $18/agent; WA credit prepaid/postpaid + Daily Budget** | TIDAK TERKONFIRMASI |
| **Slack** | Per active user flat tier | ~17% (Pro $8.75 vs $7.25) | **Ya — prorated charge & auto credit (Fair Billing)** | Ya (dashboard) | Add-on prorated sama; AI per-plan limits | TIDAK TERKONFIRMASI |
| **Notion** | Per-member flat tier + AI credits | ~20% ("up to 20% yearly") | **Ya — upgrade langsung + prorated credit sisa plan lama** | **Ya (Settings; member request→owner approve)** | Custom Agents $10/1,000 credits; Workers credits | TIDAK TERKONFIRMASI (Education free, 30-day Business trial) |
| **Linear** | Per-user flat tier + AI credits | Resmi hanya tampilkan yearly | TIDAK TERKONFIRMASI | Ya (settings/plans) | AI credits (coding sessions, Loops) | TIDAK TERKONFIRMASI |

---

## Insight langsung relevan untuk audit SatuInbox

1. **Wallet/top-up/credit model** → Qiscus adalah mirror paling dekat: prepaid credit (balance dicek per message, stop saat habis) + postpaid (invoice + Daily Budget), self top-up IDR/USD via **Virtual Account (BNI/BRI/Mandiri/Permata/CIMB/BCA) & card**, min top-up, unpaid auto-cancel ≤3 hari, kartu diverifikasi via charge Rp10,000 auto-refund. Audit SatuInbox payment-service (wallet, top-up, gateway webhooks) sebaiknya cek: handling saldo habis mid-conversation, idempotency webhook, auto-cancel unpaid, verifikasi kartu.
2. **Usage-based quota (token/pesan)** → pola industri: kuota included + overage metered yang **expire di akhir cycle** (Freshdesk sessions, Notion credits). Cek apakah token SatuInbox roll-over atau hangus, dan apakah ada Daily Budget/spending cap (Qiscus & Intercom punya; mitigasi tagihan liar).
3. **Proration** → best-practice jelas: Slack (prorated charge + auto credit, rumus hari) & Notion (upgrade langsung, credit sisa plan lama). Audit proration calc SatuInbox bisa dibandingkan ke rumus Slack `(price/seat ÷ days) × days_remaining`.
4. **Voucher** → **tidak satupun** platform mengekspos skema voucher/coupon publik (semua TIDAK TERKONFIRMASI); jadi modul voucher SatuInbox adalah diferensiator/area tanpa benchmark langsung — audit validasi voucher tanpa acuan eksternal.
5. **Gateway lokal** → Qiscus pakai VA bank-bank Indonesia + card + manual transfer, fee di-pass ke user (3.7%+Rp2,500 / Rp5,000 VA + 11% VAT). Relevan dengan "API Bayar" di env FE SatuInbox — cek fee pass-through, VAT 11%, dan dukungan VA.

## Gap / tidak terkonfirmasi (perlu riset lanjutan bila dibutuhkan)
- Dunning / failed-payment / retry logic: **semua platform TIDAK TERKONFIRMASI.**
- Proration Intercom, Zendesk, Freshworks, Qiscus, Linear: TIDAK TERKONFIRMASI.
- Voucher/coupon publik: semua TIDAK TERKONFIRMASI.
- Intercom usage-based channel tarif (WhatsApp/SMS per unit): TIDAK TERKONFIRMASI (SPA body tak ter-extract).
- Linear monthly (non-annual) rate & trial: TIDAK TERKONFIRMASI.
