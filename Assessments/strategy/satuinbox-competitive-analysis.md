# SatuInbox — Competitive Analysis (Omnichannel CS Platforms)

> **Author:** Dany Christian
> **Date:** 2026-08-19
> **Type:** Competitive / Landscape Analysis
> **Status:** Draft v1

---

> **⚠️ KOREKSI 2026-08-26:** SatuInbox = SaaS multi-tenant ONLY, tidak ada self-hosted/on-premise. Semua baris di bawah yang klaim "Deployment flexibility" / self-hosted sebagai keunggulan SatuInbox adalah SALAH — dikoreksi inline. Lihat `satuinbox-usp-innovation-analysis.md` §1b untuk penjelasan lengkap dan USP pengganti (Proven Operation Engine lintas vertical).

---

## 1. Ringkasan Eksekutif

Dokumen ini memetakan **landscape kompetitor SatuInbox** — platform omnichannel customer service berbasis WhatsApp. Analisis mencakup 10 platform: mana yang **direct competitor**, mana yang **partial overlap**, dan mana yang **bukan competitor** tapi relevan untuk positioning.

### Klasifikasi Kompetitor

| Kategori | Platform | Overlap dengan SatuInbox |
|---|---|---|
| 🔴 **Direct Competitor** | Qontak (Mekari), Respond.io, WATI, SleekFlow | ~80-95% — omnichannel inbox + WhatsApp BSP + ticketing + broadcast |
| 🟡 **Partial Competitor** | Freshchat (Freshworks), Zendesk, Intercom, Crisp | ~40-60% — strong CS platform tapi WhatsApp bukan core fokus |
| 🟢 **Non-Competitor** | Hootsuite, Lark Suite | <10% — beda kategori (social media mgmt / internal collab) |

---

## 2. Perbandingan Fitur Detail

### 2.1 Feature Matrix

| Feature | **SatuInbox** | **Qontak** | **Respond.io** | **WATI** | **SleekFlow** | **Freshchat** | **Zendesk** |
|---|---|---|---|---|---|---|---|
| **Platform Type** | Omnichannel CS | Omnichannel CS + CRM | AI Conv. Mgmt | WhatsApp-first CS | Omnichannel Social CRM | Omnichannel Messaging | Customer Service Suite |
| **WhatsApp Web** | ✅ Core (Baileys) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **WhatsApp Business API** | ✅ Official (Meta Graph) | ✅ Official BSP | ✅ Official BSP | ✅ Official BSP | ✅ Official BSP | ✅ Via integration | ✅ Via integration |
| **Omnichannel Inbox** | ✅ | ✅ | ✅ | ✅ (WA-centric) | ✅ | ✅ | ✅ |
| **Ticketing System** | ✅ | ✅ | ✅ (basic) | ❌ (basic) | ⚠️ Premium+ only | ✅ | ✅ (strongest) |
| **SLA Management** | ✅ | ✅ | ⚠️ Limited | ❌ | ⚠️ Limited | ✅ | ✅ (strongest) |
| **Broadcast/Mass Msg** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ Limited |
| **Chatbot / AI** | ❌ (undeveloped) | ✅ No-code builder | ✅ AI Agents | ✅ No-code chatbot | ✅ AI chatbot | ✅ Freddy AI | ✅ AI agents |
| **Contact Management** | ✅ | ✅ (CRM) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Built-in CRM** | ❌ | ✅ Full CRM | ⚠️ Basic | ❌ | ✅ | ⚠️ Basic | ⚠️ (Sell add-on) |
| **Analytics/Reporting** | ⚠️ Basic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (advanced) |
| **Agent Management** | ✅ | ✅ (shifts, skills) | ✅ | ✅ | ✅ | ✅ | ✅ (advanced) |
| **Instagram DM** | ✅ (Meta Graph API) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Facebook Messenger** | ✅ (Meta Graph API) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Telegram** | ✅ (Bot API) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Email** | ✅ (IMAP/SMTP) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **LINE** | ❌ | ✅ | ✅ | ❌ | ✅ | ⚠️ | ⚠️ |
| **Live Chat Widget** | ✅ (embeddable) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Marketplace Channel** | ✅ Shopee (dev) | ✅ (Tokopedia, Shopee) | ⚠️ | ❌ | ⚠️ | ❌ | ❌ |
| **API/REST + Open API** | ✅ (gRPC + REST) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (strongest) |
| **Deployment model** | SaaS multi-tenant only | SaaS only | SaaS only | SaaS only | SaaS only | SaaS only | SaaS only |

**Legend:** ✅ = Available/Strong | ⚠️ = Partial/Limited | ❌ = Not Available

---

### 2.2 Pricing Comparison

| Platform | Model | Entry Price | Mid Tier | Enterprise | Free Tier |
|---|---|---|---|---|---|
| **SatuInbox** | SaaS multi-tenant only | — (SaaS pricing TBD) | — | — | — (TBD) |
| **Qontak** | Per-agent/mo + per-msg | ~IDR 500K-1.5M/agent/mo (~$30-95) | Custom | Custom | ❌ (trial only) |
| **Respond.io** | Per-contact (pay for contacts you talk to) | $79/mo (Starter) | $159/mo (Growth) | $279/mo (Advanced) | ❌ (7-day trial) |
| **WATI** | Per-agent/mo | ~$49/agent/mo (Growth) | ~$99/agent/mo (Pro) | ~$299/mo (Business) | ❌ (trial only) |
| **SleekFlow** | Per-plan (bukan per-agent), seats included | Pro $149/mo (3 seats, 500 MAC) | Premium $349/mo (5 seats, 1K MAC) | Custom | ❌ (7-day trial, Pro only) |
| **Freshchat** | Per-agent/mo | Free (10 agents) | $19/agent/mo (Growth) | $79/agent/mo (Enterprise) | ✅ (up to 10 agents) |
| **Zendesk** | Per-agent/mo | $19/agent/mo (Support Team) | $55 (Suite Team) / $89 (Suite Growth) / $115 (Suite Professional) | Contact sales (was ~$169) | ❌ (trial only) |

> **Catatan:** Selain platform fee, WhatsApp BSP platforms (Qontak, Respond.io, WATI, SleekFlow) juga charge **Meta conversation fees** (~$0.01-0.08 per conversation tergantung region & category). SatuInbox via WA Web **tidak ada** Meta conversation fees.

---

### 2.3 WhatsApp Business API Approach

| Platform | Approach | Green Badge | Biaya Per-Conversation Meta | Kelebihan | Kekurangan |
|---|---|---|---|---|---|
| **SatuInbox** | **Hybrid: WA Web + Official WA API** | ✅ (via Official API) | ✅ Yes (via Official API) / ❌ No (via WA Web) | Zero BSP cost on WA Web; Official API available for green badge | WA Web risk block; Official API has per-conversation cost |
| **Qontak** | Official BSP (Meta partner) | ✅ | ✅ Yes | Full API, template messages, verified | Per-conversation cost, vendor lock-in |
| **Respond.io** | Official BSP (Meta partner) | ✅ | ✅ Yes | AI agents, automation | Per-contact pricing model |
| **WATI** | Official BSP (Meta partner) | ✅ | ✅ Yes | Simple setup, WA-focused | Limited non-WA channels |
| **SleekFlow** | Official BSP (Meta partner) | ✅ | ✅ Yes | Social commerce features | Higher pricing |

---

## 3. Profil Detail Per Kompetitor

### 3.1 🔴 Qontak (Mekari Qontak) — Direct Competitor Terkuat

**Positioning:** Omnichannel CS + CRM, Official WhatsApp Business Partner
**Target:** SMB-Enterprise di Indonesia & SEA
**Parent:** Mekari (ecosystem: Jurnal accounting, Talenta HR, Klikpajak tax)

**Strengths vs SatuInbox:**
- Official WhatsApp Business API + green badge
- Built-in CRM dengan deal pipeline
- No-code chatbot builder
- Ecosystem Mekari (accounting, HR, tax integrations)
- Integrasi e-commerce ID (Tokopedia, Shopee, Lazada)
- Established market presence di Indonesia

**Weaknesses vs SatuInbox:**
- Per-agent + per-conversation pricing (expensive at scale)
- Vendor lock-in ke Mekari ecosystem
- Meta conversation fees apply
- UI bisa terasa kurang polished vs global SaaS

---

### 3.2 🔴 Respond.io — AI-Powered Conversation Management

**Positioning:** AI-powered customer conversation management software
**Target:** B2C businesses (10,000+ customers globally)
**Pricing:** $79/mo (Starter) → $159/mo (Growth) → $279/mo (Advanced) → Enterprise (custom)
**Model:** Pay per contact you talk to

**Strengths:**
- Strong AI agent capabilities
- Unified WhatsApp, TikTok, Instagram, Facebook
- Good automation & workflow engine
- Growing in SEA market
- WhatsApp Business Calling API support

**Weaknesses vs SatuInbox:**
- Per-contact pricing can get expensive
- Ticketing is basic compared to dedicated CS platforms
- No built-in CRM depth

---

### 3.3 🔴 WATI (WhatsApp Team Inbox)

**Positioning:** WhatsApp-first customer service for SMBs
**Target:** Small-medium businesses globally, strong in SEA & India
**Pricing:** ~$49/agent/mo (Growth) → ~$99 (Pro) → ~$299 (Business)

**Strengths:**
- Simple, focused on WhatsApp
- No-code chatbot flow builder
- Easy setup and onboarding
- Affordable entry point
- Good for SMBs that primarily use WhatsApp

**Weaknesses vs SatuInbox:**
- Very WhatsApp-centric (limited non-WA channels)
- No real ticketing system
- No SLA management
- Basic analytics

---

### 3.4 🔴 SleekFlow — Social Commerce CRM

**Positioning:** Omnichannel social commerce platform with CRM
**Target:** E-commerce & retail brands in SEA & global
**Pricing:** Pro $149/mo (3 seats, 500 MAC) / Premium $349/mo (5 seats, 1K MAC) / Enterprise custom — per-plan, bukan per-agent (verified 2026-08-26)

**Strengths:**
- Strong social commerce features (product catalog in chat)
- Good automation workflows
- Multi-channel: WA, IG, FB, Telegram, LINE, WeChat
- Growing presence in Indonesia

**Weaknesses vs SatuInbox:**
- More commerce-focused than CS-focused
- Higher pricing
- SLA management limited

---

### 3.5 🟡 Freshchat (Freshworks) — Partial Competitor

**Positioning:** Modern messaging software for sales & customer engagement
**Target:** SMB-Enterprise globally
**Pricing:** Free (up to 10 agents) → $19/agent/mo (Growth) → $49 (Pro) → $79 (Enterprise)

**Strengths:**
- Generous free tier
- Part of Freshworks ecosystem (Freshdesk, Freshsales, Freshcaller)
- Strong AI (Freddy AI)
- Omnichannel: WA, FB, IG, LINE, Telegram, email, web
- Good analytics

**Weaknesses vs SatuInbox:**
- WhatsApp not primary channel (add-on)
- Higher tiers get expensive
- Less Indonesia-specific focus

---

### 3.6 🟡 Zendesk — Partial Competitor (Enterprise)

**Positioning:** Complete customer service solution suite
**Target:** Mid-market to Enterprise globally
**Pricing:** $19/agent/mo (Support Team, email-only) → $55 (Suite Team) → $89 (Suite Growth) → $115 (Suite Professional) → Contact sales (Enterprise, was ~$169) — verified 2026-08-26

**Strengths:**
- Industry leader, most mature platform
- Best-in-class ticketing & SLA management
- Massive integration marketplace (1,500+)
- Advanced analytics & reporting
- Strong API & developer ecosystem

**Weaknesses vs SatuInbox:**
- WhatsApp is add-on/limited (requires Sunshine Conversations)
- Expensive at scale
- Complex configuration
- No Indonesia/SEA-specific features

---

### 3.7 🟢 Hootsuite — Non-Competitor

**Positioning:** Social media management platform
**Category:** Social publishing, scheduling, monitoring — **NOT customer service**

**Overlap:** Minimal. Hootsuite's inbox is for social media engagement, not CS ticketing. WhatsApp support is limited via Heyday (acquired chatbot).

---

### 3.8 🟢 Lark Suite (ByteDance) — Non-Competitor

**Positioning:** All-in-one team collaboration suite (like Slack + Zoom + Google Workspace)
**Category:** Internal team productivity — **NOT customer service**

**Overlap:** Zero for CS use case. Lark recently added CRM but it's internal sales pipeline, not customer-facing omnichannel.

---

## 4. Positioning Map

```
                    High CS Depth (ticketing, SLA, workflow)
                                    │
                                    │
                    Zendesk ●       │       ● Qontak
                                    │
            Freshchat ●             │           ● Respond.io
                                    │
                    ────────────────┼────────────────
                    Multi-channel   │   WhatsApp-first
                                    │
                        SleekFlow ● │ ● WATI
                                    │
                                    │       ● SatuInbox
                                    │         (SaaS, Hybrid WA,
                                    │          deep SLA engine)
                                    │
                    Low CS Depth    │
                                    │
                    Hootsuite ●     │   ● Lark Suite
                    (social mgmt)   │   (collab suite)
```

> **⚠️ Koreksi 2026-08-26:** Posisi SatuInbox di map ini perlu digeser **naik** ke High CS Depth quadrant — SLA engine granular (FRT/TTC/RLT/Wait Time per-metric) dan ticketing per-stage state machine adalah core value SatuInbox, bukan secondary feature. Map asli (2026-08-19) mengasumsikan SatuInbox = WhatsApp-first dangkal; revisi ICP dan USP (2026-08-26) membuktikan sebaliknya. SatuInbox seharusnya sejajar secara depth dengan Qontak/Zendesk, di kuadran **High CS Depth + WhatsApp-first**.

---

## 5. Competitive Advantages SatuInbox

### 5.1 Unik / Defensif
1. **Proven Operation Engine lintas vertical** — bukti produksi nyata (Round Robin+Ticket+SLA+Statistics) berjalan di 5 industri berbeda (Enterprise/SAP, Logistics, Fintech, Healthcare, F&B), bukan cuma demo. Detail: `satuinbox-usp-innovation-analysis.md` §1b.
2. **WhatsApp Web integration** — zero BSP cost, zero Meta conversation fees pada jalur WA Web. Signifikan untuk volume tinggi.
3. **Cost advantage relatif** — tanpa Meta conversation fee pada jalur WA Web (bukan "zero fee" total — SatuInbox tetap charge platform fee SaaS seperti kompetitor).

> ~~Deployment flexibility / self-hosted / full ownership open-source~~ — **dibuang 2026-08-26**. SatuInbox SaaS-only, sama seperti kompetitor lain di sini kecuali Chatwoot.

### 5.2 Gap yang Perlu Ditutup
1. **Chatbot / AI** — semua kompetitor sudah punya, SatuInbox belum develop (PRD: `PRD Ticket - Availability Auto-Reply` exists tapi undeveloped)
2. **CRM integration** — Qontak punya built-in CRM, Respond.io punya basic CRM. SatuInbox punya Contact management tapi belum full CRM deal pipeline
3. **No-code automation** — chatbot builder, workflow automation
4. **LINE channel** — belum ada, kompetitor SEA sudah support
5. **Social commerce features** — SleekFlow punya product catalog in-chat
6. **CSAT / Customer satisfaction scoring** — perlu measurement system

---

## 6. Rekomendasi Strategis

### Short-term (Quick Wins)
- Prioritas **Instagram DM + Facebook Messenger** sebagai channel baru — ini yang diminta semua kompetitor
- **Live chat widget** untuk website — low effort, high impact
- **Analytics dashboard** yang lebih kaya (agent performance, response time)

### Mid-term (Differentiator)
- **Chatbot builder** (no-code) — hampir semua kompetitor sudah punya
- **CRM basic** — contact + deal pipeline minimum viable
- **Telegram + Email** integration — broaden channel coverage

### Long-term (Market Positioning)
- **WhatsApp Business API** as official BSP option — hybrid approach (WA Web untuk cost-saving + Official API untuk green badge)
- **AI agent / auto-reply** — competitive parity dengan Respond.io dan Qontak
- **Proof-of-scale lintas vertical** sebagai unique selling point utama — dokumentasikan case study SAP + Lion Parcel dengan angka SLA konkret (bukan deployment model, itu sudah dibuang)

---

## 7. Sumber Data

| Source | Type | Note |
|---|---|---|
| respond.io/pricing | Structured data (JSON-LD) | Pricing confirmed: $79/$159/$279/mo |
| qontak.com | Training knowledge | Custom pricing, ID-focused |
| wati.io | Training knowledge + metadata | WA-first platform |
| sleekflow.io | Training knowledge + metadata | Social commerce CRM |
| freshworks.com/freshchat | Training knowledge | Free tier confirmed |
| zendesk.com | Training knowledge | Industry leader |
| hootsuite.com | Training knowledge + Worker B research | Social media mgmt |
| larksuite.com | Worker A research (browser + search) | Collaboration suite |

> **Disclaimer:** Pricing dan fitur berdasarkan data yang tersedia per Agustus 2026. Beberapa data pricing bersifat publik/structured, lainnya dari training knowledge dan bisa berubah.

---

*Last updated: 2026-08-19*
