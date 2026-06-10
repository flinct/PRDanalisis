# QA Assessment Report: <Feature Name>

> **Assessment Type:** Type 1 — Feature Development Analysis / Type 2 — Bug Fix Analysis / Type 3 — Interconnection Analysis
> **Source PRD / Source Input:** `<path-to-prd-or-bug-report>`
> **Assessment Artifact Path:** `Assessments/<domain>/<feature-slug>/<feature-slug>-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none` / `Assessments/<domain>/<feature-slug>/versions/<feature-slug>-qa-assessment-v0.9.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `<other-memory-files-if-used>`
> **Tanggal Analisa:** YYYY-MM-DD
> **Status:** Draft / Reviewed / Approved / Superseded

---

## 0. Ringkasan Perubahan Analisa

- Initial version / perubahan utama dari versi sebelumnya
- Risiko baru yang muncul / risiko yang ditutup
- Keputusan yang berubah / tetap

---

## 1. Overview

**Feature / Issue:**

**Objective:**

**Business Context:**

**Scope In:**
- 

**Scope Out:**
- 

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED | PROCEED_WITH_CAUTION | REVISE_PRD | SPLIT_FEATURE | HOLD_FEATURE`

**Decision Class:** `GO | CONDITIONAL_GO | NO_GO`

**Decision Statement:**
> 1–3 kalimat yang menjelaskan apakah feature boleh lanjut, dalam kondisi apa, atau kenapa harus ditahan.

### 2.2 Required Actions Before Development

- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

### 2.3 Key Blocking Reasons / Conditions

- 

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Low / Medium / High / Critical
- **Risk Level:** Low / Medium / High / Critical
- **Primary Impact Areas:** UI / Backend / API / Database / RBAC / SLA / Reporting / Automation / Migration / Integration

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 |  |  |

### 3.2 Acceptance Criteria

- 

### 3.3 Assumptions

- 

### 3.4 Clarifications Needed

- 

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

### 4.2 Proposed State (To-Be)

### 4.3 State Transition / Data Flow Notes

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module |  |  | LOW / MEDIUM / HIGH |  |
| Database |  |  | LOW / MEDIUM / HIGH |  |
| API |  |  | LOW / MEDIUM / HIGH |  |
| UI/UX |  |  | LOW / MEDIUM / HIGH |  |
| Security / RBAC |  |  | LOW / MEDIUM / HIGH |  |
| Performance |  |  | LOW / MEDIUM / HIGH |  |
| Integration |  |  | LOW / MEDIUM / HIGH |  |
| Reporting / Analytics |  |  | LOW / MEDIUM / HIGH |  |
| Financial / Operational |  |  | LOW / MEDIUM / HIGH |  |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
|  |  |  |  |  |

### 6.2 Shared Resources / Event Mapping

- 

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 |  | Low / Medium / High | Low / Medium / High / Critical | Low / Medium / High / Critical |  |

### 7.2 Worst-Case Scenarios

- 

---

## 8. Test Strategy

### 8.1 Functional Scope
- 

### 8.2 Regression Scope
- 

### 8.3 Integration Scope
- 

### 8.4 UAT / Business Validation
- 

### 8.5 Automation Candidates
- 

---

## 9. Production Safety

- **Rollback Strategy:**
- **Feature Toggle Requirement:**
- **Backward Compatibility Notes:**
- **Staged Rollout Recommendation:**
- **Monitoring / Alerting Needs:**
- **Logging / Audit Gaps:**

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 |  |  | Yes / No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- 

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED / PROCEED_WITH_CAUTION / REVISE_PRD / SPLIT_FEATURE / HOLD_FEATURE` |
| Owner for Follow-up | PM / QA / FE / BE / Cross-team |
| Required Revisions |  |
| Suggested Delivery Strategy | Full scope / Phase split / Pilot / Hold |
| Earliest Safe Next Step | Design review / PRD revision / Dev ready / Additional discovery |

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 |  |  |  |  | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial assessment created |  |
