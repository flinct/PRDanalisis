# Assessment Report: AI Chat / AI Assist Layer via chatbox.id MCP

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis  
> **Owner:** Analyst  
> **Source PRD / Source Input:** `User request in current session + clarified orchestration model (SatuInbox front layer, chatbox.id AI provider, partner Open API support)`  
> **Source Change Intake Brief:** `Assessments/cross-domain/ai-chat-ai-assist-layer/ai-chat-ai-assist-layer-change-intake-brief.md`  
> **Assessment Artifact Path:** `Assessments/cross-domain/ai-chat-ai-assist-layer/ai-chat-ai-assist-layer-qa-assessment.md`  
> **Version:** `v1.0`  
> **Previous Version:** `none`  
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`  
> **Reference Context:** `Memory/global-memory.md`, `Memory/comprehensive-undeveloped-features-analysis.md`, `PRD/Widget/PRD Widget.md`, `PRD/Add ons/Whatsapp official/PRD Whatsapp official.md`, `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox.md`, `PRD/Conversationv2/PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates.md`, `PRD/Analytics/PRD Analytics - Conversation.md`, `PRD/Analytics/PRD Analytics - Ticket.md`  
> **Tanggal Analisa:** 2026-07-01  
> **Status:** Superseded

---

## 0. Ringkasan Perubahan Analisa

- Initial assessment dibuat terlalu dini saat requirement masih berada di fase pelengkapan user story / change intake.
- Per 2026-07-01 file ini **bukan artefak aktif untuk requirement lane** dan tidak menjadi source utama untuk BRD berikutnya.
- Source aktif yang harus dipakai untuk melanjutkan requirement adalah `ai-chat-ai-assist-layer-change-intake-brief.md` sampai story dan scope cukup lengkap.
- File ini dipertahankan hanya sebagai catatan analisa prematur, bukan baseline decision gate.

---

## 1. Overview

**Feature / Issue:**
AI Chat / AI Assist Layer untuk live chat dan WhatsApp, di mana SatuInbox menerima chat customer, meneruskan ke chatbox.id melalui MCP, menerima jawaban AI kembali, dan hanya mengeskalasi ke human agent jika AI tidak dapat menyelesaikan percakapan.

**Objective:**
Menambahkan AI handling layer tanpa merusak mekanisme routing human yang sudah ada, tanpa mencemari SLA dan metrik agent, dan tanpa membuat customer conversation stuck saat external AI path gagal.

**Business Context:**
SatuInbox ingin tetap menjadi front layer customer-facing. chatbox.id bertindak sebagai agent AI processor. Jika AI butuh data tambahan, chatbox.id memanggil Open API partner dan mengolah hasilnya sebelum mengirim jawaban ke SatuInbox. Human agent di SatuInbox hanya terlibat saat AI mengeskalasi atau policy tertentu mensyaratkan handoff.

**Change Class / Routing Decision from Brief:**
`MIXED_REQUEST` + `SPLIT_REQUEST`

**Protected Existing Behavior from Brief:**
- manual live chat flow tetap jalan saat AI disabled
- WhatsApp Official connection CRUD tidak rusak
- round robin / pull conversation / SLA / agent AUX tetap benar untuk human lane
- AI messages tidak masuk FRT/ART/Ticket SLA/agent performance
- safe fallback wajib ada saat MCP / chatbox.id / partner path gagal

**Scope In:**
- MCP integration model SatuInbox ↔ chatbox.id
- AI-only handling, escalate-to-human, close-by-AI flow
- visibility policy ke dashboard Conversation
- compatibility dengan round robin / pull conversation / SLA / AUX
- AI analytics baseline dan auditability
- config need assessment

**Scope Out:**
- internal LLM/provider procurement inside SatuInbox
- direct partner data integration from SatuInbox
- WA Web phase 1 bot-first rollout
- advanced knowledge-management console

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `HOLD_FEATURE`

**Decision Class:** `NO_GO`

**Decision Statement:**
> Assessment formal ditahan. Requirement masih berada di fase change intake dan pelengkapan user story. Jangan gunakan file ini sebagai dasar GO / NO-GO development atau sebagai input langsung ke implementasi.

### 2.2 Required Actions Before Development

- [ ] Lanjutkan pelengkapan `Change Intake Brief` sebagai source aktif
- [ ] Susun BRD draft dari brief yang sudah lengkap
- [ ] Buat Assessment Report baru atau re-activate assessment hanya setelah BRD/requirement cukup matang

### 2.3 Key Blocking Reasons / Conditions

- Requirement masih berubah di level konsep dan actor model
- Visibility, SLA, routing, config, dan fallback belum terkunci sebagai requirement bisnis
- Assessment formal saat ini prematur dan berisiko dianggap baseline padahal scope belum settle

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Critical
- **Risk Level:** High
- **Primary Impact Areas:** Backend / API / Integration / SLA / RBAC / Reporting / Automation / Operational Routing / UI

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | SatuInbox remains customer-facing front layer. | User clarification |
| BR-02 | chatbox.id is AI handler through MCP integration, not native SatuInbox AI engine. | User clarification |
| BR-03 | partner data lookup is performed by chatbox.id via Open API when needed. | User clarification |
| BR-04 | AI continues handling conversation until resolved or escalated. | User clarification |
| BR-05 | Human agents should only handle conversation after AI escalation. | User clarification |
| BR-06 | round robin, pull conversation, SLA conversation, and agent AUX must remain valid for human lane. | User clarification |
| BR-07 | AI replies must not pollute agent/SLA metrics. | User clarification + auto-reply PRD baseline |

### 3.2 Acceptance Criteria

- Customer message can be forwarded to chatbox.id and receive AI reply back through SatuInbox
- Escalated chat appears to correct human lane in Conversation page
- Human routing respects configured operational flow
- AI-only close is auditable
- Failed MCP/AI/partner path does not create silent loss

### 3.3 Assumptions

- Conversation object still exists in SatuInbox from first inbound, even if human visibility may be delayed
- WhatsApp MVP is more realistic on Official API than WA Web
- AI close capability is policy-driven and not automatically universal to every channel

### 3.4 Clarifications Needed

- hidden vs monitor-only visibility
- exact SLA semantics
- auto-close scope by channel
- config page ownership and minimum controls
- provenance depth needed from partner lookups

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)
- SatuInbox already supports widget, WhatsApp Official, omnichannel inbox, ticketing, and analytics
- Automation-like inbound response overlap exists only in undeveloped Availability Auto-Reply PRD
- Human routing and SLA logic are designed around human-visible conversation ownership
- No AI orchestration layer or MCP contract is present in current sources

### 4.2 Proposed State (To-Be)
- Customer enters via SatuInbox channel
- SatuInbox decides eligible AI path and forwards message to chatbox.id via MCP
- chatbox.id may consult partner Open APIs and return AI reply / escalation / close action
- SatuInbox sends customer-facing reply, or injects escalated chat into human routing lane
- Human-only operational features activate when chat transitions into human lane

### 4.3 State Transition / Data Flow Notes
- Existing canonical status `open/closed` should remain stable
- New handling-state dimension is likely required, e.g. `handlingMode=ai|human`, `escalationState=none|requested|accepted`, `closedBy=ai|human|system`
- Human SLA should likely start at `escalated_to_human_at`, not at original inbound, unless separate AI SLA exists

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Adds AI orchestration lane above live chat / WA / inbox | Widget, WhatsApp Official, Conversation page, ticketing, analytics | HIGH | Use umbrella BRD/PRD first |
| Database | New AI handling metadata, event logs, config, escalation state likely needed | conversation-service, analytics-service, maybe config storage | HIGH | Keep status model stable; add sidecar metadata not core status rewrite |
| API | MCP contract + AI action payloads + config/log endpoints | API gateway, conversation-service, analytics-service | HIGH | Define action types and idempotency clearly |
| UI/UX | Config page, AI visibility behavior, escalation summary, AI audit surfaces | Settings, Conversation, maybe Ticket, Analytics | MEDIUM-HIGH | Start with minimal config and limited operator surfaces |
| Security / RBAC | Config rights, log visibility, audit access | people/auth/settings | HIGH | Permission-centric design, not role-name assumptions |
| Performance | Inbound path depends on external AI | channel receive path, reply latency | HIGH | Async boundary + timeout policy + fallback path |
| Integration | SatuInbox depends on chatbox.id and indirectly on partner APIs | MCP transport, external availability | HIGH | Health checks, retries, circuit-breaker-style fallback |
| Reporting / Analytics | Need AI-specific KPI separation and SLA exclusion | analytics-service, dashboards | HIGH | Separate AI metrics from human metrics |
| Financial / Operational | Wrong escalation routing or SLA start point can distort staffing and ops decisions | team inbox ops, supervisor workflows | HIGH | Lock routing and SLA semantics before dev |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| AI orchestration | Widget / WA inbound events | lifecycle input | inbound | customer message source |
| AI orchestration | chatbox.id MCP | external sync/async integration | SatuInbox -> chatbox.id | reply/escalate/close contract |
| chatbox.id response handling | Conversation routing | lifecycle dependency | chatbox.id -> SatuInbox human lane | escalation path |
| Human escalation | round robin / pull conversation / AUX / team inbox | routing dependency | SatuInbox internal | only after escalation |
| AI analytics | AI event logs + conversation outcomes | data aggregation | internal | separate from human metrics |
| AI answer quality | partner Open API via chatbox.id | third-party indirect dependency | chatbox.id -> partner | provenance/failure path issue |

### 6.2 Shared Resources / Event Mapping

- Shared conversation entity across AI lane and human lane
- Shared SLA engine / analytics aggregators
- Shared assignment/routing logic after escalation
- Shared timeline/audit history for AI and human events
- External event/action types needed: `reply`, `escalate`, `close`, `error`, maybe `no_action`

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Chat hidden in AI lane but MCP/chatbox.id fails, causing no human visibility and no customer reply | Medium | Critical | Critical | Mandatory fallback-to-human or visible failed state |
| R-02 | Human SLA starts too early and unfairly penalizes agent for AI-handled phase | High | High | Critical | Separate AI SLA vs human SLA; define escalation start clearly |
| R-03 | Escalated chat bypasses round robin / pull / AUX policy | Medium | High | High | Route escalation through existing routing contract, not side path |
| R-04 | AI reply counted as agent response | Medium | High | High | Explicit sender type + analytics exclusion rules |
| R-05 | chatbox.id or partner timeout creates duplicate or delayed replies | Medium | High | High | Idempotency key + timeout + duplicate guard |
| R-06 | AI auto-close closes conversation that should have been escalated | Medium | High | High | Restrict auto-close by policy/channel + audit + override |
| R-07 | No config surface makes rollout opaque and hard to disable per tenant | High | Medium | High | Minimal settings page with enablement + fallback + SLA policy |
| R-08 | Provenance from partner data missing, reducing auditability for sensitive answers | Medium | Medium | Medium | Decide provenance minimum in payload contract |

### 7.2 Worst-Case Scenarios

- Customer asks urgent issue, AI path fails silently, no human sees conversation
- AI keeps conversation too long, then escalates late and breaches customer expectation while SLA still looks green
- Escalated conversations flood wrong queue because routing contract not aligned with pull/round-robin policy
- Metrics show agent underperforming because AI activity counted as human reply

---

## 8. Test Strategy

### 8.1 Functional Scope
- inbound forward to chatbox.id
- AI reply round-trip back to customer
- AI close flow
- AI escalation flow
- config enable/disable by channel/account

### 8.2 Regression Scope
- Widget manual flow
- WhatsApp Official manual flow
- Conversation visibility and routing
- Conversation SLA and assignment behavior
- AUX-based routing eligibility
- Ticket analytics and conversation analytics baselines

### 8.3 Integration Scope
- MCP contract tests
- timeout/error path tests
- duplicate action/idempotency tests
- escalation payload completeness tests
- audit/timeline logging tests

### 8.4 UAT / Business Validation
- Supervisor validates hidden-vs-visible AI lane expectation
- Ops validates escalation lands in correct queue model
- PM validates AI close authority boundaries
- Analytics stakeholders validate separation of AI vs human metrics

### 8.5 Automation Candidates
- happy-path live chat AI reply
- escalation to round robin lane
- escalation to pull conversation lane
- AI reply excluded from SLA metrics
- MCP timeout fallback
- duplicate AI callback ignored

---

## 9. Production Safety

- **Rollback Strategy:** disable AI per tenant/channel and revert to manual routing only
- **Feature Toggle Requirement:** mandatory per tenant and per channel/account
- **Backward Compatibility Notes:** preserve open/closed status; avoid breaking existing conversation list semantics for manual chats
- **Staged Rollout Recommendation:** pilot on live chat first, then WhatsApp Official after contract stabilizes
- **Monitoring / Alerting Needs:** MCP timeout rate, escalation failure rate, stuck AI-handling conversations, duplicate action rate, AI close count
- **Logging / Audit Gaps:** need actor/action provenance from chatbox.id, escalation reason, confidence/summary, partner lookup summary if required

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Should AI-handled chats be completely hidden from client/user until escalation, or monitor-visible? | Affects operations, trust, audit, and UX | Yes |
| OQ-02 | When does human SLA start? | Prevents broken metrics and unfair agent evaluation | Yes |
| OQ-03 | Must MVP scope be WhatsApp Official only? | Avoids WA Web anti-ban/operational risk | Yes |
| OQ-04 | Can both round robin and pull conversation serve as escalation targets? | Defines routing architecture | Yes |
| OQ-05 | Is config page mandatory and what is minimum scope? | Determines operational control model | Yes |
| OQ-06 | How should SatuInbox behave when MCP/chatbox.id/partner path fails? | Prevents stuck or lost conversation | Yes |
| OQ-07 | How much provenance from partner lookups must return to SatuInbox? | Audit/data-lineage scope | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Assessment ini dibuat sebelum requirement benar-benar stabil.
- Menjaga file tetap ada berguna sebagai jejak kerja, tapi statusnya harus non-aktif supaya tidak mengganggu requirement lane.
- Brief tetap menjadi source utama sampai BRD selesai.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `HOLD_FEATURE` |
| Owner for Follow-up | PM / Analyst |
| Required Revisions | Lanjutkan brief, lalu BRD draft |
| Suggested Delivery Strategy | Return to requirement lane |
| Earliest Safe Next Step | BRD draft from updated Change Intake Brief |

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FUT-01 | AI handles inbound before human | Requires new handling-state model | Lifecycle / UI / SLA | Pending | Pending |
| FUT-02 | AI escalation to human | Must pass through existing routing compatibility rules | Routing / AUX / Queue | Pending | Pending |
| FUT-03 | AI close conversation | Requires policy and audit boundary | Lifecycle / Audit | Pending | Pending |
| FUT-04 | Preserve human SLA correctness | Human SLA start unresolved | SLA / Analytics | Pending | Pending |
| FUT-05 | Configurability | Minimal settings likely required | UI / RBAC / Ops | Pending | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-07-01 | Initial assessment created | Hermes |
| 2026-07-01 | Marked superseded/premature because requirement still in change-intake refinement stage | Hermes |
