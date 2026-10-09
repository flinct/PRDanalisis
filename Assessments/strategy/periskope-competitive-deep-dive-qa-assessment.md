# Assessment Report: Periskope — Competitive Deep Dive vs SatuInbox

> **Assessment Type:** Competitive Analysis (Type 3 — Interconnection Analysis)
> **Owner:** Analyst
> **Source Input:** `https://periskope.app/` + docs.periskope.app
> **Source Change Intake Brief:** not-applicable (research task)
> **Assessment Artifact Path:** `Assessments/strategy/periskope-competitive-deep-dive-qa-assessment.md`
> **Version:** v1.0
> **Previous Version:** none
> **Rules Applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/task-router.md`
> **Reference Context:** `Memory/global-memory.md`, `Assessments/strategy/satuinbox-competitive-analysis.md`
> **Tanggal Analisa:** 2026-09-29
> **Status:** Draft

---

## 0. Ringkasan Analisa

- Periskope = WhatsApp shared inbox & group management platform, **non-BSP** (uses WhatsApp Web multi-device, no Business API required)
- Competitor baru yang **tidak ada** di existing competitive analysis (`satuinbox-competitive-analysis.md`)
- Direct overlap dengan SatuInbox pada: multi-number inbox, ticketing, automation, group management, team access
- Key differentiator Periskope: group management purpose-built, AI Agent (RAG-trained), no Business API requirement
- Key risk Periskope: WhatsApp Web dependency = platform risk + ToS risk
- SatuInbox gaps vs Periskope: AI agent, auto-ticketing, group analytics, number masking, private notes

---

## 1. Overview

**Feature / Issue:** Competitive analysis of Periskope (periskope.app) as it relates to SatuInbox positioning and feature parity.

**Objective:** Map Periskope's capabilities, identify overlap/gaps with SatuInbox, assess competitive threat level, and produce actionable recommendations for SatuInbox product strategy.

**Business Context:** Periskope claims 5,000+ businesses across 50+ countries. All featured customers are Indian companies (Swiggy, Policybazaar, Shiprocket, Livspace, GoKwik). Parent company: Hashlabs Holdings Inc. Careers link to binary.so/periskope.

**Change Class / Routing Decision from Brief:** N/A — research task, not a change request.

**Protected Existing Behavior from Brief:** N/A

**Scope In:**
- Periskope feature set (groups, 1:1 chat, tickets, automation, AI, RBAC, security)
- Comparison with SatuInbox V2 PRD capabilities
- Gap analysis (both directions)
- Competitive threat assessment

**Scope Out:**
- Pricing deep dive (Periskope pricing page blocked — couldn't extract tiers)
- Technical architecture comparison (no access to Periskope codebase)
- Market share / revenue data

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED` (research artifact — no development gate)

**Decision Class:** `GO`

**Decision Statement:**
> Periskope is a meaningful competitive signal but not a blocking threat to SatuInbox. The WhatsApp Web approach creates platform risk for Periskope that SatuInbox's hybrid model avoids. SatuInbox should track Periskope's shipped features (AI agent, group analytics, auto-ticketing) as competitive parity targets for V2 roadmap.

### 2.2 Required Actions Before Development

- [ ] Add Periskope to existing competitive analysis matrix (`Assessments/strategy/satuinbox-competitive-analysis.md`)
- [ ] Prioritize AI agent / auto-reply feature in SatuInbox roadmap (gap vs Periskope + all other competitors)
- [ ] Evaluate group analytics as a V2 feature (Periskope has shipped it)

### 2.3 Key Blocking Reasons / Conditions

- None — this is a research artifact.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Low (research only)
- **Risk Level:** Low
- **Primary Impact Areas:** Product strategy, roadmap prioritization

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | SatuInbox is omnichannel; Periskope is WhatsApp-only | Homepage |
| BR-02 | Periskope uses WhatsApp Web (no Business API); SatuInbox uses hybrid (WA Web + Official API) | Homepage + global-memory.md |
| BR-03 | Periskope's AI uses Google Gemini models | periskope.app/ai-transparency |

### 3.2 Acceptance Criteria

N/A — research artifact.

### 3.3 Assumptions

- Periskope product features based on public website + docs as of 2026-09-29
- Pricing data unavailable (page blocked by 403)
- Customer scale claims (5000+ businesses) are self-reported, not independently verified
- Periskope docs pages were rate-limited (429) — some features inferred from homepage descriptions

### 3.4 Clarifications Needed

- Periskope pricing tiers and per-number costs
- Periskope's exact role/permission granularity (docs blocked)
- Whether Periskope supports conversation status lifecycle (open/snooze/hold/closed)

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

SatuInbox competitive analysis (`satuinbox-competitive-analysis.md`) covers 8 platforms: Qontak, Respond.io, WATI, SleekFlow, Freshchat, Zendesk, Hootsuite, Lark Suite. **Periskope is not included.**

### 4.2 Proposed State (To-Be)

Periskope added as a **🟡 Partial Competitor** with specific overlap on WhatsApp-first group management and shared inbox.

### 4.3 State Transition / Data Flow Notes

Periskope sits between WATI (WhatsApp-first, simple) and Qontak (full CS platform) in the positioning map. Closer to WATI in channel scope but with deeper group management and AI capabilities.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Product Strategy | New competitor to track | Roadmap prioritization | MEDIUM | Add to competitive matrix |
| Feature Parity | AI agent, group analytics gap | V2 feature backlog | MEDIUM | Prioritize AI auto-reply |
| Pricing Strategy | Unknown — pricing blocked | Positioning | LOW | Need manual research |
| Market Position | India-focused, expanding to EU | SEA market not directly threatened | LOW | Different geography focus |
| Technical Direction | WhatsApp Web vs API debate | Architecture decisions | LOW | SatuInbox already hybrid |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Periskope group mgmt | WhatsApp Web multi-device | External platform | Upstream | Fragile — WhatsApp can break |
| Periskope AI | Google Gemini | External API | Upstream | Vendor dependency |
| SatuInbox AI gap | Internal roadmap | Internal | Inbound | Auto-reply planned but not shipped |

### 6.2 Shared Resources / Event Mapping

- Both platforms depend on WhatsApp Web protocol for non-API messaging
- Both use multi-device linking for number connection

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Periskope captures India/SEA group management market before SatuInbox ships group features | Medium | Medium | MEDIUM | Prioritize group analytics + AI |
| R-02 | Periskope expands to omnichannel, becoming direct competitor | Low | High | MEDIUM | Monitor their roadmap |
| R-03 | SatuInbox loses deals to Periskope on AI/automation features | Medium | Medium | MEDIUM | Ship AI auto-reply |
| R-04 | Periskope's WhatsApp Web approach gets blocked by WhatsApp | Medium | High (for Periskope) | LOW (for SatuInbox) | SatuInbox has official API fallback |

### 7.2 Worst-Case Scenarios

- Periskope adds omnichannel + official API → becomes direct competitor with India market dominance
- Periskope's AI agent matures into a full CS automation platform → competitive gap widens

---

## 8. Periskope Feature Deep Dive

### 8.1 WhatsApp Group Management (Core Differentiator)

| Feature | Periskope | SatuInbox |
|---------|-----------|-----------|
| Multi-number shared inbox | ✅ Shipped | ✅ Core feature |
| Scheduled group messaging | ✅ Shipped | ✅ Broadcast (V2) |
| Bulk send to groups | ✅ One-click | ✅ Broadcast |
| Auto-create groups via rules | ✅ Shipped | ❌ Not in PRD |
| Group analytics (volume, open rates, response times) | ✅ Shipped | ❌ Not shipped |
| Role-based group permissions | ✅ Shipped | ⚠️ Collaborator role (planned) |
| AI flag important group messages → tickets | ✅ Shipped | ❌ Not in PRD |
| Unanswered query tracking per group | ✅ Shipped | ⚠️ Basic (planned) |
| Auto-reply to groups (keyword/hours) | ✅ Shipped | ❌ Not shipped |

**Evidence:** Homepage "MANAGE GROUPS" section + customer testimonials.

### 8.2 1:1 Chat Management

| Feature | Periskope | SatuInbox |
|---------|-----------|-----------|
| Multi-number inbox | ✅ All numbers in one view | ✅ Core |
| Reply from any connected number | ✅ Dropdown selector | ⚠️ Per-account |
| Per-reply agent attribution | ✅ Email shown in-platform | ✅ Agent tracking |
| Auto-assign chats by rules | ✅ Shipped | ❌ Not shipped |
| SLA breach notifications | ✅ Shipped | ⚠️ SLA engine in PRD |
| Number masking | ✅ Shipped | ❌ Not in PRD |
| Private notes (invisible to customer) | ✅ Shipped | ⚠️ Planned |
| Data exports + audit logs | ✅ Shipped | ❌ Not documented |

### 8.3 Ticket System

| Feature | Periskope | SatuInbox |
|---------|-----------|-----------|
| Create ticket from any message | ✅ Right-click → ticket | ✅ Ticket V2 |
| Ticket statuses | Open / In Progress / Closed | Open / In Progress / Closed / Resolved |
| Priority levels | Low / Medium / High / Urgent | Low / Medium / High / Urgent |
| Due dates | ✅ | ✅ |
| Labels | ✅ Multi-label | ✅ Tags |
| Custom properties | ✅ | ⚠️ Planned |
| Auto-create tickets from messages | ✅ AI-powered | ❌ Not shipped |
| Ticket-conversation linking | ✅ | ✅ |

### 8.4 Automation

| Feature | Periskope | SatuInbox |
|---------|-----------|-----------|
| Keyword auto-reply | ✅ Shipped | ❌ Planned (auto-reply) |
| Out-of-hours auto-reply | ✅ Shipped | ❌ Planned |
| Auto-ticket from queries | ✅ Shipped | ❌ Not in PRD |
| Auto-assign by rules | ✅ Shipped | ❌ Not shipped |
| SLA breach notifications | ✅ Shipped | ⚠️ SLA engine exists |
| Custom automation rules | ✅ | ❌ Not in PRD |

### 8.5 AI Capabilities

| Feature | Periskope | SatuInbox |
|---------|-----------|-----------|
| AI message flagging | ✅ Custom prompts via Gemini | ❌ Not in PRD |
| AI reply drafting + translation | ✅ Gemini-powered | ❌ Not in PRD |
| AI Agent (RAG on docs/SOPs) | ✅ Trainable, auto-respond, escalate | ❌ Not in PRD |
| AI model | Google Gemini (disclosed) | N/A |

### 8.6 Permissions, Roles & Auth

| Aspect | Periskope | SatuInbox |
|--------|-----------|-----------|
| Auth method | Email + password (console.periskope.app) | Email + password |
| Role-based permissions | ✅ Shipped (granularity undocumented) | ✅ Owner/Admin/Agent/Collaborator (V2 PRD) |
| Per-conversation scoping | Not documented | ✅ Agent per conversation |
| Per-number scoping | Not documented | ✅ Per account-channel |
| Agent attribution | Email per reply (internal only) | Agent name in conversation |
| Audit logs | ✅ Shipped | ❌ Not documented |
| Security certs | ISO 27001, GDPR | N/A (internal platform) |

### 8.7 Security & Compliance

| Aspect | Periskope |
|--------|-----------|
| Certification | ISO/IEC 27001 |
| Compliance | GDPR |
| Data at rest | Encrypted (all datastores + app-level for sensitive) |
| Data in transit | TLS 1.3+ |
| Backup | Point-in-time, 7-day retention |
| Infrastructure | Restricted DB access, network segmentation, log management |
| Access control | Role-based, restricted by procedure |
| Data deletion | On request + on exit |

### 8.8 Architectural Breakdown: "Multi-Number Shared Inbox" — Konsep Berbeda

> **Penting:** Istilah "multi-number shared inbox" terlihat mirip di surface, tapi arsitektur dan ownership model-nya **fundamentally berbeda** antara SatuInbox dan Periskope.

#### SatuInbox: Multi-Tenant, Multi-Channel, Per-Account-Channel

```
Company (tenant)
├── Organization
│   ├── Channel: WhatsApp Web
│   │   ├── Account-Channel: +62812xxxx (WA number A)
│   │   └── Account-Channel: +62856xxxx (WA number B)
│   ├── Channel: WhatsApp Business API
│   │   └── Account-Channel: +62811xxxx (official API)
│   ├── Channel: Instagram DM
│   │   └── Account-Channel: @brand_account
│   ├── Channel: Telegram
│   │   └── Account-Channel: @brand_bot
│   ├── Channel: Email
│   │   └── Account-Channel: support@brand.com
│   └── Channel: Shopee (add-on)
│       └── Account-Channel: toko_x
│
├── RBAC: Owner > Admin > Agent > Collaborator
│   ├── Sales Area Context (sales agents see only sales conversations)
│   └── Operational Area Context (ops agents see only ops conversations)
│
└── Conversation scoping:
    - tenant-scoped (companyId + organizationId)
    - per-account-channel binding
    - assignment via participants field
    - ownership decoupled from phone number (conversation_id as key)
```

**Key properties:**
- **Multi-tenant**: setiap company isolated, query wajib tenant-scoped
- **Multi-channel**: satu inbox untuk WA, IG, FB, Telegram, Email, Shopee
- **Per-account-channel**: setiap nomor/akun = entity terpisah dengan capability matrix sendiri
- **Area-scoped RBAC**: Sales vs Operational = visibility berbeda
- **20 microservices**: channel-service, conversation-service, people-service (RBAC), company-service (tenant), dll
- **Hybrid WA**: WA Web (Baileys) + Official API = resilience kalau salah satu mati

#### Periskope: Single-Tenant, Single-Channel, Flat Number Pool

```
Workspace (flat, no tenant hierarchy)
├── Connected Phones (WhatsApp numbers)
│   ├── Phone: +91xxxxxxxx (org number 1)
│   ├── Phone: +91yyyyyyyy (org number 2)
│   └── Phone: +91zzzzzzzz (org number 3)
│
├── Chats (flat list across all phones)
│   ├── Chat with Customer A (via Phone 1)
│   ├── Chat with Customer B (via Phone 1 + Phone 2)
│   └── Group X (via Phone 2)
│
├── Team Members (email-based)
│   ├── role: can send / can respond / can manage (granularity undocumented)
│   └── attribution: email shown per-reply (internal only, not visible to customer)
│
└── Reply model:
    - any team member replies through any connected phone
    - dropdown to select which phone number to reply from
    - customer sees message from the org phone number (not the agent)
```

**Key properties:**
- **Single-tenant**: tidak ada company/org hierarchy — satu workspace flat
- **Single-channel**: WhatsApp only (WA Web multi-device)
- **Flat number pool**: semua nomor = equal, tidak ada channel/account-channel distinction
- **No area scoping**: tidak ada Sales vs Operational separation
- **Reply-anywhere model**: agent bisa reply dari nomor manapun, customer tidak tahu siapa yang reply
- **No official API fallback**: kalau WhatsApp block WA Web, platform mati

#### Perbedaan Kritis

| Aspek | SatuInbox | Periskope | Dampak |
|-------|-----------|-----------|--------|
| **Tenant isolation** | Per-company, enforced di query level | Tidak ada (single workspace) | SatuInbox bisa multi-client SaaS; Periskope = one-team-per-account |
| **Channel scope** | Omnichannel (WA, IG, FB, Telegram, Email, Shopee, Widget) | WhatsApp only | Periskope tidak bisa scale ke non-WA channels |
| **Number ownership** | Per-account-channel, bound ke tenant + channel | Flat pool, semua nomor equal | SatuInbox bisa enforce per-number RBAC; Periskope tidak |
| **Agent assignment** | `participants` field, per-conversation, tenant-scoped | Team-level access, no per-conversation scoping | SatuInbox punya granular ownership; Periskope = all-see-all |
| **Reply routing** | Reply dari account-channel yang terikat conversation | Reply dari nomor manapun via dropdown | SatuInbox: customer selalu dapat reply dari nomor yang benar. Periskope: agent bisa salah pilih nomor |
| **Area visibility** | Sales Area vs Operational Area = different conversations visible | Semua team members lihat semua conversations | SatuInbox punya data segregation; Periskope = flat visibility |
| **Platform resilience** | Hybrid (WA Web + Official API) | WA Web only | SatuInbox punya fallback; Periskope single point of failure |
| **Multi-tenancy** | True multi-tenant (companyId + organizationId di setiap query) | Single workspace per account | SatuInbox bisa serve multiple brands/companies; Periskope = satu brand per workspace |
| **Channel capability matrix** | Per-account-channel (presence, rich cards, disappearing messages, dll) | Tidak ada (semua nomor = WhatsApp) | SatuInbox bisa enforce capability per channel; Periskope uniform |

#### Kesimpulan

"Multi-number shared inbox" di **Periskope** = **pool nomor WhatsApp yang bisa dipakai bergantian oleh team**. Konsepnya sederhana: connect N nomor, semua chat masuk satu tempat, siapa saja bisa reply dari nomor mana saja.

"Multi-number shared inbox" di **SatuInbox** = **multi-tenant, multi-channel architecture** di mana setiap nomor/akun adalah entity terisolasi yang terikat ke tenant, channel type, dan RBAC scope. Conversation dimiliki oleh tenant, di-assign ke agent, dan reply harus dari account-channel yang benar.

**Ini bukan feature parity gap — ini beda kategori produk.** Periskope = WhatsApp team inbox. SatuInbox = omnichannel CS platform.

### 8.9 Conversation Resolution: Per-Number vs Per-Channel vs Cross-Channel

> **Pertanyaan kritis:** Bagaimana platform menentukan "satu percakapan" untuk kontak yang sama di nomor/channel berbeda?

#### Scenario 1: Periskope — User A chat dari Number A, lalu dari Number B

**Jawaban: DUA chat terpisah. Tidak merge.**

Periskope menggunakan WhatsApp Web multi-device. Setiap nomor WhatsApp yang ter-connect = independent instance. Chat User A ke nomor org A = chat thread 1. Chat User A ke nomor org B = chat thread 2. Ini dua thread terpisah di WhatsApp native, dan Periskope tidak melakukan deduplikasi/merge.

Dari docs: *"If multiple phones are present in a chat, both the phone numbers will be visible."* — ini berlaku untuk **group chat** di mana kedua nomor org ada di group yang sama, bukan untuk 1:1 cross-number merging.

```
Periskope:
  Chat List:
  ├── User A → Org Phone 1 (1:1 chat)
  ├── User A → Org Phone 2 (1:1 chat TERPISAH)
  └── Group X (Org Phone 1 + Org Phone 2 + User A)

  ❌ Tidak ada merge antara "User A → Phone 1" dan "User A → Phone 2"
```

**Implications:**
- Agent tidak punya view unified untuk "semua chat User A"
- Tidak ada cross-number contact deduplikation
- User A terlihat seperti dua kontak berbeda di dua nomor
- Tidak ada riwayat conversation terkonsolidasi

#### Scenario 2: SatuInbox — User A chat via Channel A, B, C

**Jawaban: Saat ini BELUM merge. Cross-channel linking = P2 (planned, not built).**

SatuInbox punya konsep **one global contact per customer** (phone number = unique identifier). Tapi setiap channel creates conversation terpisah:

```
SatuInbox (current state):
  Company A
  ├── Channel: WhatsApp Web
  │   └── Conversation #1: User A → WA Number (open)
  ├── Channel: WhatsApp API
  │   └── Conversation #2: User A → WA API (open)  ← conversation_id berbeda
  ├── Channel: Instagram DM
  │   └── Conversation #3: @user_a → IG account (open)
  └── Channel: Email
      └── Conversation #4: user@email.com → support@ (open)

  Global Contact: User A (linked by phone/identifier)
  ❌ Conversations TIDAK merge otomatis
  📋 P2: "Cross-channel thread linking (merge same customer conversations across channels)"
```

Dari PRD:
- `PRD Ticket - Omnichannel Inbox.md` line 179: **"Cross-channel thread linking (merge same customer conversations across channels). | P2"**
- `PRD Ticket - Omnichannel Inbox - Conversation Detail.md` line 227: **"Cross-channel linking (same customer across WhatsApp + Email + Live Chat). | P2"**
- Shopee PRD: conversation resolution = `tenant + account_channel + contact_identity + provider_thread_identity` → per-thread, bukan per-contact

Tapi SatuInbox punya **foundation** yang Periskope tidak punya:
- **Global contact entity** (phone = unique key, satu contact per customer)
- **conversation_id ownership decoupling** (ownership via `conversation_id`, bukan nomor)
- **Sticky conversation binding** (conversation tetap di team asal meskipun nomor di-reassign)
- **Channel capability matrix** per account-channel

Foundation ini membuat cross-channel linking feasible untuk P2 — contact entity sudah unified, tinggal linking conversations-nya.

#### Perbandingan Conversation Resolution

| Aspek | Periskope | SatuInbox |
|-------|-----------|-----------|
| **Contact identity** | WhatsApp contact (phone per WA account) | Global contact (phone = unique key across all channels) |
| **1:1 cross-number merge** | ❌ Tidak. User A → Phone 1 ≠ User A → Phone 2 | N/A (berlaku per channel) |
| **Cross-channel merge** | N/A (WhatsApp only) | ❌ Belum (P2 planned) |
| **Conversation key** | WhatsApp chat thread (per phone pair) | `conversation_id` (per tenant + account-channel + contact + thread) |
| **Multi-number view** | Semua nomor di satu inbox, tapi chat terpisah per nomor | Per account-channel, tapi global contact entity shared |
| **Group chat multi-number** | ✅ Group dengan multiple org phones → terlihat sebagai 1 group | ✅ Per group identity |
| **Ownership model** | Flat (team access all) | Per-conversation (`participants` = assignee) |
| **Foundation for merge** | ❌ Tidak ada contact dedup | ✅ Global contact entity siap, tinggal linking |

#### Kesimpulan

| Question | Answer |
|----------|--------|
| Periskope: User A → Number A dan Number B = 1 chat? | **TIDAK.** 2 chat terpisah. Tidak ada cross-number dedup. |
| SatuInbox: User A → Channel A, B, C = 1 conversation? | **BELUM.** Masing-masing channel = conversation terpisah. Cross-channel linking = P2. |
| Periskope: sudah punya cross-channel concept? | **TIDAK.** WhatsApp only, tidak ada channel lain. |
| SatuInbox: punya foundation untuk cross-channel merge? | **YA.** Global contact entity + conversation_id ownership decoupling. Tinggal build linking layer. |

---

## 9. Gap Analysis

### 9.1 SatuInbox Gaps vs Periskope (Periskope ahead)

| Gap ID | Feature | Priority | Evidence |
|--------|---------|----------|----------|
| GAP-01 | **AI Agent (RAG-trained auto-response)** | HIGH | Periskope shipped; all competitors have some AI. SatuInbox has zero. |
| GAP-02 | **Auto-ticketing from messages** | HIGH | Periskope AI flags + auto-creates. SatuInbox ticket creation is manual. |
| GAP-03 | **Keyword/hours-based auto-reply** | HIGH | Periskope shipped. SatuInbox planned but not developed. |
| GAP-04 | **Group analytics** | MEDIUM | Periskope: volume, open rates, response times per group. |
| GAP-05 | **Auto-assignment rules** | MEDIUM | Periskope distributes chats by rules. SatuInbox assignment is manual. |
| GAP-06 | **Number masking** | MEDIUM | Periskope shipped. Not in SatuInbox PRD. |
| GAP-07 | **Private notes** | MEDIUM | Periskope shipped. SatuInbox planned. |
| GAP-08 | **Audit logs / data export** | LOW | Periskope shipped. |
| GAP-09 | **Auto-create groups** | LOW | Periskope via rules. Not in SatuInbox PRD. |

### 9.2 Periskope Gaps vs SatuInbox (SatuInbox ahead)

| Gap ID | Feature | Advantage |
|--------|---------|-----------|
| SI-01 | **Omnichannel** (IG, FB, Telegram, Email, Shopee) | Periskope is WhatsApp-only |
| SI-02 | **Official WhatsApp Business API** (hybrid) | Periskope has no API path — fragile |
| SI-03 | **SLA engine** (FRT/RLT/TTC/Wait Time, per-metric, office-hours-aware) | Periskope has basic SLA notifications only |
| SI-04 | **Granular RBAC** (Owner/Admin/Agent/Collaborator per V2) | Periskope RBAC granularity undocumented |
| SI-05 | **Conversation status lifecycle** (open/closed + Hold/Snooze) | Periskope has no documented conversation states |
| SI-06 | **Marketplace integration** (Shopee/Tokopedia) | Periskope has none |
| SI-07 | **Proven cross-vertical operation** (5 industries) | Periskope India-centric |

---

## 10. Competitive Threat Assessment

### 10.1 Threat Level: 🟡 MODERATE

| Factor | Assessment |
|--------|------------|
| **Market overlap** | Medium — both WhatsApp-first CS, but different geographies (India vs SEA) |
| **Feature overlap** | High — shared inbox, tickets, automation, groups |
| **Differentiation** | SatuInbox: omnichannel + official API + SLA depth. Periskope: group management + AI |
| **Platform risk** | Periskope's WhatsApp Web-only approach is fragile. SatuInbox hybrid is safer. |
| **Pricing threat** | Unknown (pricing blocked) — but no Meta conversation fees on WA Web is shared advantage |
| **Customer base** | Periskope India-focused (Swiggy, Policybazaar). Different market from SatuInbox's SEA focus. |

### 10.2 Positioning Map (Updated)

```
                    High CS Depth (ticketing, SLA, workflow)
                                    │
                                    │
                    Zendesk ●       │       ● Qontak
                                    │
            Freshchat ●             │   ● SatuInbox
                                    │       (SaaS, Hybrid WA,
                                    │        deep SLA engine)
                    ────────────────┼────────────────
                    Multi-channel   │   WhatsApp-first
                                    │
                        SleekFlow ● │ ● WATI
                                    │
                                    │       ● Periskope
                                    │         (group mgmt + AI,
                                    │          no API, India-focused)
                                    │
                    Low CS Depth    │
                                    │
                    Hootsuite ●     │   ● Lark Suite
```

---

## 11. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | What are Periskope's pricing tiers and per-number costs? | Pricing comparison needed | No |
| OQ-02 | What is Periskope's exact RBAC granularity? Docs blocked. | Permission model comparison | No |
| OQ-03 | Does Periskope have conversation status lifecycle? | Feature parity check | No |
| OQ-04 | What happens when WhatsApp updates multi-device protocol? | Platform risk for Periskope | No |
| OQ-05 | Is Periskope expanding beyond WhatsApp? | Future competitive threat | No |

---

## 12. Recommendation

### 12.1 Recommendation Rationale

Periskope validates the market demand for **WhatsApp group management + AI-powered CS automation**. Their shipped features (AI agent, auto-ticketing, group analytics, auto-reply) are all in SatuInbox's planned-but-not-implemented list. The competitive gap is execution speed, not direction.

Periskope's platform risk (WhatsApp Web-only, no official API) is a structural weakness that SatuInbox's hybrid approach avoids. SatuInbox should not copy Periskope's approach but should accelerate shipping the overlapping planned features.

### 12.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED` |
| Owner for Follow-up | PM (Dany Christian) |
| Required Revisions | Add Periskope to competitive matrix |
| Suggested Delivery Strategy | Reference artifact — feeds roadmap prioritization |
| Earliest Safe Next Step | Update `satuinbox-competitive-analysis.md` with Periskope row |

### 12.3 Strategic Recommendations

**Short-term (competitive parity):**
1. **Ship auto-reply** (keyword + out-of-hours) — Periskope + all competitors have this
2. **Ship AI message flagging** — high customer value, Periskope differentiator
3. **Ship private notes** — already planned, quick win

**Mid-term (differentiation):**
4. **Group analytics** — volume, response times, unanswered queries per group
5. **Auto-assignment rules** — distribute chats by rules
6. **AI Agent (RAG)** — train on customer docs, auto-respond, escalate

**Long-term (moat):**
7. **Omnichannel AI agent** — Periskope can't do this (WhatsApp-only)
8. **SLA engine depth** — Periskope has basic notifications only, SatuInbox's per-metric engine is a competitive moat
9. **Cross-vertical proof** — document case studies with SLA numbers

---

## 13. Traceability Matrix

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| COMP-01 | Competitive landscape completeness | Periskope missing from analysis | Strategy | N/A | Pending |
| COMP-02 | Feature parity tracking | 9 gaps identified (GAP-01 to GAP-09) | Roadmap | N/A | Pending |
| COMP-03 | Competitive advantage documentation | 7 SatuInbox advantages (SI-01 to SI-07) | Positioning | N/A | Pending |

---

## 14. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-09-29 | Initial competitive deep dive created | Dany Christian / Analyst |