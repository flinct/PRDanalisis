# Summary: Competitive Analysis — Omnichannel CS Platforms vs SatuInbox

> **Session:** 2026-08-19
> **Mode:** Orchestrator (3 parallel workers + compile)
> **Author:** Dany Christian

---

## Task
User meminta competitive analysis SatuInbox vs platform serupa: Hootsuite, Qontak, dan platform lain yang mirip.

## Approach
Orchestrator mode → 3 parallel research workers:
- Worker A: Lark Suite research (via browser + web search)
- Worker B: Hootsuite + Qontak research (via training knowledge — web tools unavailable)
- Worker C: Respond.io, Freshchat, Zendesk, WATI, SleekFlow + others (partial — timeout 600s, tapi data parsial cukup: pricing metadata Respond.io, page titles/descriptions semua platform)

## Key Findings

### Klasifikasi Kompetitor
- **🔴 Direct (80-95% overlap):** Qontak, Respond.io, WATI, SleekFlow
- **🟡 Partial (40-60%):** Freshchat, Zendesk, Intercom, Crisp
- **🟢 Non-competitor (<10%):** Hootsuite (social media mgmt), Lark Suite (internal collab)

### Unique SatuInbox Advantages
1. Self-hosted/on-premise (tidak ada kompetitor yang bisa)
2. WhatsApp Web = zero BSP cost, zero Meta conversation fees (hybrid: WA Web + Official WA API)
3. Full ownership, no vendor lock-in
4. Richest channel coverage among self-hosted: WA Web, WA API, IG DM, Messenger, Email, Live Chat, Telegram, Shopee (dev)

### Gaps vs Kompetitor
1. Chatbot/AI (semua kompetitor sudah punya)
2. Built-in CRM (deal pipeline)
3. LINE channel
4. No-code automation / workflow builder
5. CSAT scoring

### Correction Note (2026-08-19)
Feature matrix awal salah mark ❌ untuk Instagram DM, Messenger, Email, Live Chat, Telegram, WA API. User correction → verified dari PRD files dan BE architecture (CLAUDE-be.md). SatuInbox punya 8 channel: WA Web, WA API, IG DM, Messenger, Email, Live Chat Widget, Telegram, Shopee (in dev).

### USP & Innovation Analysis (2026-08-19)
Reviewer found critical blind spot: **Chatwoot** (open-source, self-hostable, 20K+ GitHub stars) directly challenges self-hosted USP. Revised positioning from "only self-hosted" to "best self-hosted for Indonesian enterprise". Realistic TCO after DevOps: 1.5x-3x cheaper (not 10x-50x). Baileys legal risk elevated to Critical (ToS violation, not just blocking).

## Output
- **Competitive Analysis:** `Assessments/reference/satuinbox-competitive-analysis.md`
- **USP & Innovation Analysis:** `Assessments/reference/satuinbox-usp-innovation-analysis.md`
- Covers 10 platforms: Qontak, Respond.io, WATI, SleekFlow, Freshchat, Zendesk, Hootsuite, Lark Suite
- Feature matrix, pricing comparison, WhatsApp API approach, positioning map, strategic recommendations

## Issues
- FIRECRAWL_API_KEY not configured → web_search & web_extract unavailable for subagents
- Browser requires user confirmation → subagents couldn't use browser without approval
- Worker C timed out (600s) — partial data recovered from transcript
- Most data sourced from training knowledge + structured metadata (JSON-LD) from platform websites

## Status: ✅ Complete
