# Session Summary: SAP Report Export (General) — Change Intake

**Tanggal:** 2026-08-11
**Session Title:** Analisa & Brainstorm SAP Report Export (General) — Orchestrator Mode
**Author:** Dany Christian
**Status:** Phase 0 Change Intake Brief v3.0 — all blocking OQ resolved, routing → SPLIT_REQUEST, reviewer PASS

---

## Tujuan / Request Utama

User request: "SAP Report Export (General)" — beri kebebasan user export data conversation, ticket, broadcast sesuai kebutuhan, dari collection analytics (bukan collection operasional). Jika collection analytics belum lengkap, harus dilengkapi dulu.

Mode: **Orchestrator** (worker → review → revise loop).

---

## Ringkasan Progres

### Context Gathering
- Loaded all required rules: `agent-instruction.md`, `requirements-lifecycle-rule.md`, `impact-analysis-rule.md`, `global-memory.md`, `CLAUDE-be.md`, `CLAUDE-fe.md`
- Read all 10 existing Analytics PRDs in `PRD/Analytics/`
- Inspected all 6 BE analytics schemas in `apps/analytics-service/src/app/schemas/`
- Read `export-report-job.service.ts` to understand current export architecture
- Read `export-report-job.processor.ts` to understand RMQ async processing

### Key Findings
1. **All 5 analytics collections are pre-aggregated daily counts only** — none have row-level data
2. **Existing export reads from SOURCE collections** (conversation-service, ticket-service), NOT analytics
3. **Gap severity per collection:**
   - `conversationdailymetrics`: 🔴 CRITICAL — no row-level records
   - `ticketdailymetrics`: 🔴 CRITICAL — no row-level records
   - `broadcastdailymetrics`: 🔴 CRITICAL — only 7 daily count fields
   - `responsivenessmetrics`: 🟡 MEDIUM — dashboard-only
   - `agentperformancemetrics`: 🟡 MEDIUM — missing presence/AUX/CSAT
4. **"SAP-style configurable columns"** is fundamentally different from template-fixed exports
5. **Two related briefs exist:** cross-domain (SAP-specific, ADDITIVE_IMPROVEMENT) vs general (configurable export, MIXED_REQUEST)

### Classification
- **MIXED_REQUEST**: NEW_FEATURE (configurable columns) + ADDITIVE_IMPROVEMENT (collection completeness) + BEHAVIOR_CHANGE (data source repoint)

### Routing
- **HOLD_NEEDS_DISCOVERY** — 10 open questions, 5 blocking
- **SPLIT recommended** into 4 sub-PRDs (A: row-level collections, B: repoint, C: configurable columns, D: broadcast export)

### Architecture Options Identified
- A: Clarify "analytics" meaning (0 sprint)
- B: CQRS row-level collections + sync (High)
- C: Hybrid operational + analytics enrichment (Medium)
- D: Snapshot on-demand (Medium)
- E: Read replica (Low-Medium)
- F: Phase 1 read replica → Phase 2 CQRS (Low→High)

---

## Artifacts Produced

| Artifact | Path | Version | Status |
|----------|------|---------|--------|
| Change Intake Brief (main) | `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` | v2.0 | Pending review |
| Brief v1.0 archive | `Assessments/general/sap-report-export/versions/sap-report-export-change-intake-brief-v1.0.md` | v1.0 | Archived |
| Existing SAP-specific brief | `Assessments/cross-domain/sap-report-export/sap-report-export-change-intake-brief.md` | v1.0 | Different request (left untouched) |

---

## Current Status

- Worker (o3-pro) completed: produced v2.0 brief with deep gap analysis
- Reviewer (gpt-5.5) dispatched: evaluating template compliance, Phase 0 completeness, gap analysis accuracy, classification, routing, impact flags
- Awaiting review verdict (PASS or NEEDS_REVISION)
- If NEEDS_REVISION: dispatch revision worker with feedback

---

## Blocking Questions (from brief)

| ID | Question | Blocking? |
|----|----------|-----------|
| OQ-1 | "Collection analytics" literal or logical? | Yes |
| OQ-2 | "Belum lengkap" = what kind of incomplete? | Yes |
| OQ-3 | "Kebebasan export" = column picker vs template+ vs presets? | Yes |
| OQ-4 | Relationship to existing offline report download PRD + cross-domain brief? | Yes |
| OQ-5 | Broadcast export: recipient-level or campaign-level? | Yes |
| OQ-6 | Analytics row-level retention/TTL? | Yes |
| OQ-7 | Volume per domain? | No |
| OQ-8 | PII retention/erasure in analytics? | No |
| OQ-9 | Format: XLSX only or CSV/PDF? | No |
| OQ-10 | Export SLA + acceptable eventual-consistency? | No |

---

## Next Steps

1. Await reviewer verdict
2. If PASS → present brief to user with summary and blocking questions
3. If NEEDS_REVISION → revise and re-review (max 3 rounds)
4. User answers OQ-1..OQ-5 → determine routing and proceed

---

## Transkrip Percakapan

### Turn 1 — User
> pakai orchestrator
>
> analisa dan brainstorm, deep detail cek
>
> Change Intake Brief: SAP Report Export (General)
>
> tujuan utama, memberikan kebebasaan user untuk export data conversation, ticket dan broadcast sesuai kebutuhan mereka berdasarkan data yang satuinbox miliki dan bisa provide, tanpa mengubah data input ( dari collection conversation, ticketing dan broadcast). data yang di berikan harus dari collection analytics, jadi jika collection analytics nya blm lengkap, harus dilengkapi juga
>
> PONYTAIL MODE ACTIVE — level: full

### Turn 2 — Assistant
Loaded all required context (rules, global-memory, BE/FE architecture, all 10 Analytics PRDs, BE analytics schemas). Dispatched analysis worker to o3-pro.

### Turn 3 — Assistant
Analysis worker returned. Key findings:
- All analytics collections are pre-aggregated daily counts only
- Gap severity: 3 CRITICAL, 2 MEDIUM
- MIXED_REQUEST classification
- HOLD_NEEDS_DISCOVERY routing
- 4 sub-PRD split recommended

Brief v2.0 persisted at `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` (497 lines, 31KB). Brief v1.0 archived to `versions/`.

Reviewer (gpt-5.5) dispatched.

### Turn 4 — (awaiting reviewer result)
