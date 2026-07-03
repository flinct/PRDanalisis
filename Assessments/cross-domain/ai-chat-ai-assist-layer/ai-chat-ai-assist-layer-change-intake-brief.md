# Change Intake Brief: AI Chat / AI Assist Layer

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `User request in current session: implement fitur chat bot / AI chat untuk live chat, whatsapp, ticketing analisa`  
> **Artifact Path:** `Assessments/cross-domain/ai-chat-ai-assist-layer/ai-chat-ai-assist-layer-change-intake-brief.md`  
> **Version:** `v1.2`  
> **Previous Version:** `none`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `Memory/reference-index.md`, `Memory/comprehensive-undeveloped-features-analysis.md`, `PRD/Widget/PRD Widget.md`, `PRD/Add ons/Whatsapp official/PRD Whatsapp official.md`, `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox.md`, `PRD/Conversationv2/PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates.md`, `PRD/Analytics/PRD Analytics - Conversation.md`, `PRD/Analytics/PRD Analytics - Ticket.md`  
> **Tanggal Intake:** 2026-07-01  
> **Status:** Scoped

---

## 0. Ringkasan Update Brief

- Initial version.
- Initial version dibuat dari request awal umum.
- Update v1.1: actor definitions, external orchestration model, MCP bridge, partner Open API dependency, escalation ke human, kebutuhan menjaga round robin / pull conversation / SLA / AUX, escalation visibility, human-SLA timestamp, channel notes, config-page need, final-answer policy, RBAC default, dan escalation summary utility message ditambahkan.
- Update v1.2: referensi nyata CS dari `Downloads/Case CS - Sheet1.tsv` ditambahkan sebagai baseline use case operasional untuk intent, routing divisi, macro answer pattern, dan close-vs-escalate decision shape.
- Routing tetap ke capability lintas domain; BRD draft harus memakai model SatuInbox front layer → chatbox.id AI orchestration → partner data source.

---

## 1. Request Snapshot

**Request Summary:**
Implement AI chat / chatbot orchestration di SatuInbox untuk live chat dan WhatsApp, dengan SatuInbox sebagai front layer customer-facing dan chatbox.id sebagai penyedia layanan agent AI terintegrasi via MCP. Tambahkan juga AI-assisted ticketing analytics/handling untuk flow eskalasi dan operasional.

**Business Problem:**
SatuInbox sudah punya omnichannel inbox, widget, WhatsApp, ticketing, dan analytics dasar, tetapi belum punya lapisan orkestrasi AI eksternal yang mampu menerima chat dari customer, meneruskan ke chatbox.id, mengonsumsi jawaban AI, melakukan eskalasi ke human agent, dan tetap menjaga kompatibilitas dengan routing human serta SLA existing.

**Target User / Role / Stakeholder:**
- **Customer**: orang yang bertanya ke client/user melalui channel SatuInbox
- **Client/User**: pengguna SatuInbox (agent, supervisor, admin)
- **chatbox.id**: penyedia layanan agent AI
- **Partner**: pihak penyedia data support yang diakses chatbox.id via Open API bila AI perlu data eksternal
- Admin / Ops / PM untuk kontrol enablement, audit, analytics, dan quality monitoring

**Expected Outcome:**
- Chat customer masuk lewat SatuInbox lalu diteruskan ke chatbox.id via MCP saat channel eligible
- chatbox.id mengolah pertanyaan, opsional memanggil Open API partner, lalu mengembalikan jawaban ke SatuInbox untuk dikirim ke customer
- Conversation yang masih bisa dijawab AI tetap ditangani AI sampai selesai atau closed by AI
- Jika AI gagal / tidak bisa menjawab, chatbox.id memicu eskalasi ke human agent melalui SatuInbox
- Saat eskalasi terjadi, seluruh riwayat chat antara AI dan customer harus visible dan dapat dibaca oleh human agent di Conversation
- Chat yang masuk ke account channel milik company tertentu harus kembali ditangani oleh client/user yang terdaftar dalam company yang sama
- Setelah eskalasi, conversation masuk ke dashboard Conversation dan diproses dengan mekanisme assignment/routing human yang semestinya
- Management bisa melihat analytics penggunaan dan kualitas AI

**Urgency / Why Now:**
Request masuk sebagai enhancement strategis lintas channel untuk menaikkan self-service, menurunkan manual load agent, dan menambah insight operasional.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `MIXED_REQUEST` |
| Primary Domain | `Cross-domain` |
| Request Shape | Add + Change |
| Initial Complexity Signal | Critical |
| Needs Split? | Yes |

### Classification Rationale
- Request menambah capability baru: external AI conversation orchestration via chatbox.id + MCP.
- Request juga mengubah behavior existing pada widget, WhatsApp, visibility ke dashboard conversation, conversation handling ownership, escalation flow, ticketing assist, dan analytics.
- Scope menyentuh inbound pipeline, sender identity, routing, timeline/audit, SLA exclusion, close authority, partner-data dependency, dan human handoff. Ini bukan additive improvement kecil.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Widget/PRD Widget.md`, `PRD/Add ons/Whatsapp official/PRD Whatsapp official.md`, `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox.md`, `PRD/Conversationv2/PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates.md`, `PRD/Analytics/PRD Analytics - Conversation.md`, `PRD/Analytics/PRD Analytics - Ticket.md` |
| PRD status | Existing + partial overlap |
| PRD treatment candidate | New PRD + follow-up patch set |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Partial | Widget, inbox, ticket, analytics base already exist. No AI layer found. `Memory/CLAUDE-fe.md` marks auto-reply templates, related tickets, related conversations as not implemented. |
| BE | Partial | Core channel/inbox/ticket/analytics services exist. No AI orchestration or AI analytics contract found in loaded sources. Auto-reply engine still undeveloped per memory. |
| Runtime / Current Behavior | Existing non-AI product baseline | Live chat widget exists; WhatsApp Official account management exists; omnichannel inbox exists; ticket and analytics pages exist; bot/AI workflow belum ada sebagai shipped capability. |

### 3.3 Related Sources
- `Memory/global-memory.md`: canonical conversation, ticket, SLA, WA rules.
- `Memory/reference-index.md` / `Assessments/reference/...`: reusable cross-PRD references available, but no AI-specific reference found in assessment tree.
- `Memory/comprehensive-undeveloped-features-analysis.md`: auto-reply templates masih undeveloped dan sudah mengidentifikasi risk tinggi pada inbound pipeline + SLA exclusion.
- FE / BE reference: `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md` menunjukkan analytics-service, widget app, omnichannel app, ticketing, channel architecture sudah ada sebagai backbone.
- Real CS case reference loaded from `Downloads/Case CS - Sheet1.tsv`: operational FAQ, escalation patterns, macro-style responses, and divisional routing examples from current CS handling.

---

## 4. Scope Boundary

### 4.1 In Scope
- External AI orchestration capability lintas live chat, WhatsApp, inbox, ticketing, analytics
- MCP integration contract antara SatuInbox dan chatbox.id
- Channel eligibility dan enablement model per surface/account
- AI → human handoff / escalation behavior di omnichannel inbox
- Visibility policy: chat AI baru visible ke client/user ketika terjadi eskalasi ke human, dengan riwayat AI ↔ customer tetap bisa dibaca penuh oleh human agent
- Company-safe reassignment rule: chat yang masuk ke account channel company tertentu harus kembali ditangani oleh client/user di company yang sama
- AI message labeling / sender identity / timeline logging / auditability
- Escalation utility message / message utility berisi rangkuman chat AI untuk human agent
- Real-CS use case ingestion sebagai referensi requirement: FAQ intent, divisional routing, macro answer patterns, case-closed vs escalate decision shape
- AI close authority dan close-by-AI outcome
- AI-assisted ticket draft/summary/classification/prioritization recommendations setelah eskalasi atau assist flow
- AI-specific analytics baseline: usage, escalation, containment/deflection, unanswered intents, assist adoption
- SLA / reporting exclusion policy untuk AI-generated response dan timestamp eskalasi ke human
- Compatibility rules dengan round robin, pull conversation, conversation SLA, dan agent AUX

### 4.2 Out of Scope
- Full LLM provider / model procurement detail di dalam SatuInbox
- Direct partner Open API integration dari SatuInbox ke data partner bila kontrak itu hanya dimiliki chatbox.id
- Full knowledge base CMS / training console kompleks
- Autonomous destructive actions di luar close conversation yang diizinkan policy
- Channel lain di luar livechat widget, WhatsApp Web, dan WhatsApp Official untuk Phase 1
- Custom AI per trigger/channel/language model tuning UI detail jika belum diperlukan MVP

### 4.3 Protected Existing Behavior
- Existing widget installation and manual live chat flow must remain usable when AI disabled.
- Existing WhatsApp Official and WhatsApp Web connection/account behavior must remain intact.
- Existing omnichannel routing, assignment, conversation visibility, and RBAC must not regress for human-handled chat.
- Existing round robin, pull conversation, conversation SLA, and agent AUX must keep working for escalated human conversation.
- Human agent must be able to read prior AI ↔ customer transcript fully after escalation.
- Existing ticket lifecycle and analytics pages must remain valid for non-AI traffic.
- AI messages must not contaminate FRT/ART/Ticket SLA/agent performance metrics.
- Customer chat must not disappear silently on failed MCP / chatbox.id processing; safe fallback path required.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Conversation/ticket lifecycle, context resolution, sender identity, handoff state |
| RBAC / visibility / assignment | Yes | Who can configure AI, review logs, approve AI suggestions, see AI analytics |
| API / webhook / socket / queue / cron | Yes | Inbound event evaluation, async AI processing, reply generation, timeline/audit events |
| SLA / reporting / export | Yes | Bot exclusion, new AI KPIs, analytics attribution |
| Migration / rollback / feature flag | Yes | Strong candidate for phased rollout and per-channel feature flag |
| Existing regression scope | Yes | Widget, WA Official, inbox, ticket create-from-chat, analytics, timeline, notification |

### Early Blast-Radius Notes
- Existing undeveloped auto-reply PRD already proves inbound automation is high-risk even without AI generation.
- AI lane now has clearer visibility rule: human sees conversation only after escalation, but must receive full readable transcript and summary utility message.
- Real CS reference shows mixed response modes: some cases can be directly answered and closed, some require divisional routing (IT, LM, BD, Finance, FM), and some require templated macro education before close. This means AI needs explicit intent-to-action policy, not generic FAQ only.
- Ticket assist and analytics create secondary blast radius beyond channel send path.
- Human routing compatibility is critical because round robin / pull conversation / SLA / AUX must activate correctly only when chat enters human lane.
- MCP outage, chatbox.id timeout, and partner-data fetch failure all need explicit fallback behavior to avoid stuck customer conversations.
- Because escalation must stay inside same company boundary, tenant/company scoping and account-channel ownership are critical blast-radius areas.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `SPLIT_REQUEST` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Cross-domain PRD for AI Chat / AI Assist Layer + impact assessment + later patch set to existing PRDs |
| Can Proceed to PRD? | Yes |

### Routing Rationale
- One umbrella BRD/PRD lane needed first to lock common AI concepts: MCP integration model, channel eligibility, handling ownership state, escalation trigger, confidence/fallback, audit, analytics, SLA exclusion, and human-routing compatibility.
- After umbrella requirement exists, downstream patch/addendum can update widget, WhatsApp, ticket, analytics, and conversation-routing PRDs safely.
- Without umbrella requirement, patching per module will create duplicated or conflicting AI semantics.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Ticketing scope masih belum jelas: apakah ticketing di sini hanya analytics/assist setelah eskalasi, atau termasuk AI handling di ticket thread? | Menentukan apakah ticketing masuk Phase 1 sebagai lane operasional penuh atau hanya companion scope | Yes | PM / Stakeholder |
| OQ-02 | Breakdown fallback saat MCP timeout, chatbox.id gagal, atau partner Open API gagal perlu dirinci seperti apa? | Required untuk safe customer experience dan anti-stuck conversation | Yes | PM / Engineering |
| OQ-03 | Tiga channel awal yang disebut user story adalah livechat widget, WhatsApp Web, dan WhatsApp Official. Apakah stakeholder menyetujui ketiganya aktif di Phase 1? | Menentukan eligibility final per channel | Yes | PM / Stakeholder |
| OQ-04 | Apakah escalation utility message/rangkuman chat cukup satu message utility di conversation, atau perlu juga field/summary khusus lain? | Menentukan UX handoff ke human agent | No | PM / Analyst |
| OQ-05 | Role admin otomatis punya hak. Untuk role non-admin, permission key apa saja yang dibutuhkan untuk konfigurasi, log, dan analytics AI? | Menentukan model RBAC final | No | PM / Analyst |
| OQ-06 | Dari referensi case CS nyata, intent mana yang aman untuk AI jawab dan close sendiri, intent mana yang harus selalu eskalasi ke divisi/human tertentu? | Menentukan intent-action policy dari data real operasional | Yes | PM / Ops / Stakeholder |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Pending | Need MVP boundary and rollout sequence |
| Stakeholder / Business User | Business intent confirmation | Pending | Need confirmation live chat vs WA priority and ticketing depth |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Need async architecture, audit, and analytics feasibility alignment |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Add ons/AI Chat - AI Assist Layer.md` or equivalent | source scope, change class, common AI semantics |
| Assessment Report | `Assessments/cross-domain/ai-chat-ai-assist-layer/...` | source scope, protected behavior, blast radius |
| QA Pre-Implementation Review | `Assessments/cross-domain/ai-chat-ai-assist-layer/...` | source scope, impact flags, regression map |
| QA Post-Implementation Validation | `Assessments/cross-domain/ai-chat-ai-assist-layer/...` | validate shipped behavior vs scoped intent |
| Automation Mapping / Test Spec | `Test/...` | traceability for channel flows, handoff, analytics, ticket assist |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-07-01 | Initial brief created | Hermes |
| 2026-07-01 | Updated with external orchestration model, actor definitions, escalation behavior, and human-routing/SLA compatibility concerns | Hermes |
| 2026-07-01 | Updated with latest user-story clarifications: escalation visibility, human-SLA timestamp, channel notes, config-page need, final-answer policy, RBAC default, and escalation summary utility message | Hermes |
| 2026-07-01 | Added real CS case reference from TSV as operational use-case baseline for intent/routing/macro patterns | Hermes |
