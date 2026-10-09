# Change Intake Brief: Auto-Response Flow (Interactive Decision Tree Bot)

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** User request 2026-09-17 — interactive menu-driven auto-reply across all channels  
> **Artifact Path:** `Assessments/conversation/auto-response-flow/auto-response-flow-change-intake-brief.md`  
> **Version:** `v1.0`  
> **Previous Version:** none  
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/task-router.md`  
> **Supporting Context:** `Memory/global-memory.md`, `Memory/conversation-undeveloped-features-analysis.md`, `PRD/Conversationv2/PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates.md`  
> **Tanggal Intake:** 2026-09-17  
> **Status:** Draft

---

## 0. Ringkasan Update Brief

- Initial version — fitur baru, belum ada PRD sebelumnya.
- Existing Availability Auto-Reply (V2 file 1) = simple statis auto-reply. Fitur ini = multi-step interactive flow. **Bukan extend, tapi fitur terpisah.**
- Scope: interactive decision tree bot, configurable per company, all active channels.

---

## 1. Request Snapshot

**Request Summary:**  
SatuInbox harus bisa memberikan jawaban otomatis interaktif — greeting → menu pilihan (a/b/c) → sub-menu → dst — ke customer di semua channel aktif per company. Konfigurasi berupa decision tree yang bisa diatur admin.

**Business Problem:**  
Customer yang menghubungi SatuInbox di luar jam operasional atau saat queue penuh hanya mendapat satu pesan statis. Tidak ada cara untuk mengarahkan customer ke topik yang tepat, mengumpulkan informasi awal, atau memberikan self-service sebelum agent mengambil alih. Ini menyebabkan: (1) agent memulai dari nol setiap percakapan, (2) customer menunggu lebih lama untuk resolusi, (3) volume repeat inquiry meningkat karena tidak ada routing otomatis.

**Target User / Role / Stakeholder:**
- **Admin/Supervisor:** mengkonfigurasi flow di Settings
- **Customer:** menerima dan berinteraksi dengan menu otomatis
- **Agent:** melihat status flow di room, bisa take over
- **PM (Dany Christian):** owner fitur
- **Engineering Lead (Naftal Yunior):** arsitektur BE

**Expected Outcome:**  
Customer mendapat pengalaman terstruktur saat menghubungi SatuInbox — greeting, menu, sub-menu — sehingga informasi terkumpul sebelum agent masuk. Agent mendapat context dari pilihan customer. Self-service untuk FAQ/routing sederhana.

**Urgency / Why Now:**  
Competitor (Chatwoot, Freshdesk, Zendesk) sudah punya bot flow builder. Ini standar industri untuk CS platform. Demand level: **L3** — real workflow blocker untuk customer yang ingin automated triage.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `NEW_FEATURE` |
| Primary Domain | `Cross-domain` (Conversation + WhatsApp Web + Ticket context) |
| Request Shape | Add |
| Initial Complexity Signal | **Critical** |
| Needs Split? | Yes — minimum 2 phase (MVP text-based → full interactive) |

### Classification Rationale
- Fitur baru yang tidak ada PRD sebelumnya.
- Bukan extend dari existing Auto-Reply (V2 file 1) karena arsitektur berbeda: stateless vs stateful, one-message vs multi-step, trigger-based vs always-on.
- Menyentuh inbound processing pipeline (jalur kritis), SLA, assignment, channel adapter, dan reporting — cross-domain.
- Butuh data model baru (flow tree + state tracking), engine baru (flow evaluator), dan UI baru (flow builder).

---

## 3. Current State Verification

### 3.1 PRD Status

| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Conversationv2/PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates.md` (V2 file 1) |
| PRD status | Existing — **undeveloped** (FE + BE belum implement) |
| PRD treatment candidate | **New PRD** — existing auto-reply PRD tidak bisa di-extend jadi interactive flow |

### 3.2 Implementation Status

| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Not found | `Memory/conversation-undeveloped-features-analysis.md` — Auto-reply Templates = ❌ Undeveloped |
| BE | Not found | Tidak ada flow engine atau decision tree logic di existing codebase |
| Runtime / Current Behavior | Tidak ada auto-reply aktif | Inbound message langsung ke agent queue tanpa bot intercept |

### 3.3 Related Sources
- `Memory/global-memory.md`: Auto-reply listed as undeveloped feature, critical dependency on inbound pipeline
- `Memory/conversation-undeveloped-features-analysis.md`: Auto-reply Templates ranked #1 impact (highest risk among undeveloped features)
- `Memory/reference-index.md`: not yet relevant (no existing analysis for this feature)
- `Memory/Codex-be.md`: BE architecture — 20 microservices, RabbitMQ, Socket.IO
- `Memory/Codex-fe.md`: FE architecture — Next.js, Zustand, TanStack Query
- Existing PRD (V2 file 1): Defines SatuInbox Bot sender, SLA exclusion, frequency limit, cancel-on-agent-reply — **semua ini bisa di-reuse sebagai foundation**

---

## 4. Scope Boundary

### 4.1 In Scope (MVP — Phase 1)
- **Flow Configuration:** Admin bisa buat decision tree sederhana (greeting → menu → sub-menu → end/handoff) via form-based editor di Settings > Bot > Auto-Response Flow
- **Tree Structure:** Node (message + options) → Edge (option → next node). Max depth 5 level, max 10 options per node.
- **Channel Rendering:** Text-based numbered menu (universal fallback). Tidak ada WhatsApp button/list di MVP.
- **Trigger:** Always-on — setiap inbound customer message masuk flow jika flow aktif.
- **State Tracking:** Persist posisi customer di tree (current node, selected options history).
- **Handoff to Agent:** Leaf node yang ditandai "handoff" → conversation masuk agent queue dengan context dari flow.
- **SatuInbox Bot Sender:** Reuse existing bot sender definition dari PRD V2 file 1.
- **SLA Exclusion:** Bot flow messages tidak hitung FRT/ART/TTC/RLT (reuse PRD V2 file 1 rule).
- **Frequency/Timeout:** Reset flow setelah X menit tidak ada response (configurable, default 30 menit).
- **Scope:** Per company, semua channel aktif.

### 4.2 Out of Scope (Phase 2+)
- Visual drag-and-drop flow builder
- WhatsApp Interactive Messages (buttons, list messages)
- Telegram inline keyboard / Web widget rich rendering
- Conditional branching berdasarkan customer data / ticket status
- Integration dengan external API / CRM di tengah flow
- AI-powered response suggestion
- Flow analytics dashboard (completion rate, drop-off)
- Per-channel template override
- Per-customer segment rules
- Holiday override
- Flow templates library (pre-built flows)

### 4.3 Protected Existing Behavior
- **Existing Auto-Reply PRD (V2 file 1)** belum developed — tidak ada behavior yang rusak karena belum aktif. Tapi: flow harus coexist, bukan replace. Keduanya punya trigger berbeda (flow = always-on, auto-reply = conditional).
- **Inbound processing pipeline** tidak boleh terganggu — flow intercept harus fail-safe (jika flow engine error, message tetap masuk queue normal).
- **Assignment flow** — agent pull, round robin, manual assign harus tetap jalan setelah flow handoff.
- **SLA metrics** — bot messages dari flow tidak boleh masuk hitungan FRT/ART/TTC/RLT.
- **Chat list** — sorting, filtering, status tidak terpengaruh flow state.
- **RBAC** — flow settings hanya bisa diakses Admin / authorized Supervisor.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | **Yes** | Conversation state bertambah: flow_state (current node, history, timeout). State machine baru di jalur inbound. |
| RBAC / visibility / assignment | **Yes** | Flow handoff = conversation masuk queue. Harus ikuti existing assignment rules. |
| API / webhook / socket / queue / cron | **Yes** | Inbound processing pipeline terpengaruh (intercept before agent queue). Socket events untuk flow state update. Timeout = cron/scheduler job baru. |
| SLA / reporting / export | **Yes** | Bot exclusion dari SLA metrics. Flow completion reporting (Phase 2). |
| Migration / rollback / feature flag | **Yes** | Feature flag wajib (company-level toggle). Rollback = disable flag, flow state orphan cleanup. |
| Existing regression scope | **Yes** | Inbound processing, assignment flow, SLA calculation, chat list display. |

### Early Blast-Radius Notes
- **Inbound pipeline** = jalur paling kritis. Bug di flow engine bisa block semua inbound messages. Fail-safe wajib: error di flow → bypass flow → message ke queue normal.
- **SLA** = risiko kedua. Bot messages yang salah hitung sebagai agent reply akan corrupt semua SLA metrics.
- **Assignment** = risiko ketiga. Flow handoff yang salah routing bisa membuat conversation hilang dari queue.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_NEW_PRD` |
| Recommended Next Rules | `Rules/core/requirements.md` (PRD writing), `Rules/core/analysis-and-risk.md` (impact analysis), `Rules/core/test-design.md` (test design) |
| Recommended Next Artifact | PRD baru — "Auto-Response Flow" |
| Can Proceed to PRD? | **Yes** — setelah blocking questions dijawab |

### Routing Rationale
- Fitur baru, tidak ada PRD existing yang bisa di-patch atau di-revive.
- Existing Auto-Reply PRD (V2 file 1) adalah **separate feature** yang bisa coexist, bukan base untuk extend.
- Butuh PRD baru karena: data model baru (flow tree), engine baru (flow evaluator), UI baru (flow builder), integration baru (inbound intercept + handoff).
- Cross-domain impact (Conversation + WhatsApp Web + Ticket) memerlukan comprehensive PRD.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Apakah flow harus always-on (setiap inbound masuk flow) atau conditional (hanya di luar jam / tidak ada agent)? | Mengubah trigger logic dan interaction model. Always-on = fitur baru fundamental. Conditional = extend existing auto-reply. | **Yes** | PM |
| OQ-02 | Apakah SLA di-pause saat customer sedang di flow, atau tetap jalan? | Dampak ke SLA engine, reporting, dan compliance. Jika pause → butuh SLA state baru. Jika jalan → bot response time masuk hitungan. | **Yes** | PM |
| OQ-03 | Bagaimana handoff dari flow ke agent? Otomatis (setelah selesai flow) atau manual (customer minta agent)? | Mengubah assignment flow dan queue behavior. Otomatis = conversation langsung masuk queue. Manual = customer harus trigger. | **Yes** | PM |
| OQ-04 | Apakah flow berlaku untuk conversation yang sudah punya open ticket, atau hanya new conversation? | Ticket context resolution — apakah flow jalan di atas ticket context atau skip? | **Yes** | PM |
| OQ-05 | Channel mana yang prioritas di MVP? Semua sekaligus atau satu dulu? | Effort dan risk berbeda per channel. WA = user base terbesar tapi capability terbatas. Web widget = paling fleksibel. | **No** (rekomendasi: WA first) | PM + Eng |
| OQ-06 | Bagaimana interaction model di channel yang tidak support interactive messages (email, SMS)? | Text-based numbered menu = universal fallback, tapi UX beda jauh dari button/list. | **No** (default: text fallback) | PM |
| OQ-07 | Apakah agent bisa melihat dan mengambil alih conversation yang sedang di flow? | Mengubah room UI dan assignment flow. Takeover = agent break flow, customer langsung ke agent. | **No** (Phase 2) | PM |
| OQ-08 | Apakah existing Auto-Reply (V2 file 1) harus developed dulu sebelum fitur ini, atau bisa paralel? | Dependency assessment. Jika paralel → perlu define priority saat keduanya aktif. | **No** (rekomendasi: paralel, flow = priority 1) | PM + Eng |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Dany Christian | Scope lock, OQ-01 sampai OQ-08 | **Pending** | Brief ini draft — perlu PM decision sebelum PRD |
| Stakeholder / Business User | Business intent confirmation | Pending | Tidak ada stakeholder eksternal yang teridentifikasi selain internal PM |
| FE / BE / Tech Lead (Naftal) | Technical direction sanity check | **Pending** | Perlu review: inbound pipeline intercept, flow engine architecture, channel adapter strategy |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD Auto-Response Flow | `PRD/Conversationv2/` (baru) | source scope, change class, current-state baseline, protected behavior |
| Assessment Report | `Assessments/conversation/auto-response-flow/` | source scope, protected behavior, routing rationale, impact flags |
| QA Pre-Implementation Review | `Test/` | source scope, impact flags, protected behavior, blast radius |
| QA Post-Implementation Validation | `Test/` | validate against original scoped intent |
| Automation Mapping / Test Spec | `Test/` | traceability and non-scope guard |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-09-17 | Initial brief created | Dany Christian |
