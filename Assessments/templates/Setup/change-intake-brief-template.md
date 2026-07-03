# Change Intake Brief Template

> **Owner:** Analyst / PM / Orchestrator  
> **Purpose:** Artefak Phase 0 untuk mengklasifikasikan request change sebelum PRD, Assessment Report, atau QA artifacts dibuat / direvisi.  
> **Derived From:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`  
> **Reuse Rule:** BRD, PRD, Assessment Report, QA review, dan perubahan lanjutan harus mereferensikan brief ini. Jika scope berubah di tengah jalan, **update brief ini dulu** sebelum patch artefak downstream.

---

# Change Intake Brief: <Feature Name>

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `<path-to-brd-or-request-source>`  
> **Artifact Path:** `Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md`  
> **Version:** `v1.0`  
> **Previous Version:** `none` / `Assessments/<domain>/<feature-slug>/versions/<feature-slug>-change-intake-brief-v0.9.md`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `Memory/reference-index.md`, `<other-context-if-used>`  
> **Tanggal Intake:** YYYY-MM-DD  
> **Status:** Draft / Scoped / Ready for PRD / Hold / Superseded

---

## 0. Ringkasan Update Brief

- Initial version / perubahan utama dari versi sebelumnya
- Scope yang ditambah / dikurangi / dikunci
- Routing decision yang berubah / tetap

---

## 1. Request Snapshot

**Request Summary:**

**Business Problem:**

**Target User / Role / Stakeholder:**

**Expected Outcome:**

**Urgency / Why Now:**

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `NEW_FEATURE / ADDITIVE_IMPROVEMENT / BEHAVIOR_CHANGE / DEPRECATION_OR_REMOVAL / REVIVE_UNDEVELOPED_PRD / MIXED_REQUEST` |
| Primary Domain | `Conversation / Ticket / WhatsApp Web / Broadcast / Contact / Auth / Analytics / Cross-domain / Other` |
| Request Shape | Add / Change / Remove / Revive |
| Initial Complexity Signal | Low / Medium / High / Critical |
| Needs Split? | Yes / No |

### Classification Rationale
- 

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD |  |
| PRD status | Not found / Existing / Partial / Deprecated / Undeveloped |
| PRD treatment candidate | New PRD / Patch / Rewrite / Revive |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Not found / Partial / Shipped |  |
| BE | Not found / Partial / Shipped |  |
| Runtime / Current Behavior |  |  |

### 3.3 Related Sources
- `Memory/global-memory.md`:
- `Memory/reference-index.md` / `Assessments/reference/...`:
- `Memory/comprehensive-undeveloped-features-analysis.md` atau feature undeveloped memory:
- FE / BE reference:

---

## 4. Scope Boundary

### 4.1 In Scope
- 

### 4.2 Out of Scope
- 

### 4.3 Protected Existing Behavior
- behavior existing yang tidak boleh rusak / berubah tanpa keputusan eksplisit
- dependency / lifecycle / RBAC / report yang harus tetap aman

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes / No |  |
| RBAC / visibility / assignment | Yes / No |  |
| API / webhook / socket / queue / cron | Yes / No |  |
| SLA / reporting / export | Yes / No |  |
| Migration / rollback / feature flag | Yes / No |  |
| Existing regression scope | Yes / No |  |

### Early Blast-Radius Notes
- 

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_NEW_PRD / ROUTE_PATCH_EXISTING_PRD / ROUTE_REWRITE_EXISTING_PRD / ROUTE_REVIVE_UNDEVELOPED_PRD / ROUTE_DEPRECATION_REMOVAL / SPLIT_REQUEST / HOLD_NEEDS_DISCOVERY` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/test-case-rule.md`, dll |
| Recommended Next Artifact | PRD baru / Patch PRD / Assessment Report / Change split / Discovery follow-up |
| Can Proceed to PRD? | Yes / No |

### Routing Rationale
- 

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 |  |  | Yes / No | PM / Analyst / QA / FE / BE / Stakeholder |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Pending / Aligned |  |
| Stakeholder / Business User | Business intent confirmation | Pending / Aligned |  |
| FE / BE / Tech Lead | Technical direction sanity check | Pending / Aligned |  |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD |  | source scope, change class, current-state baseline |
| Assessment Report |  | source scope, protected behavior, routing rationale |
| QA Pre-Implementation Review |  | source scope, impact flags, protected behavior |
| QA Post-Implementation Validation |  | validate against original scoped intent |
| Automation Mapping / Test Spec |  | traceability and non-scope guard |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial brief created |  |
