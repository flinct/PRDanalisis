# Assessment Report Template

> **Owner:** Analyst  
> **Purpose:** Artefak assessment awal untuk baseline risk, dependency, gap, dan impact sebelum PRD dibekukan untuk implementasi.  
> **Derived From:** `Assessments/templates/qa-assessment-report-template.md`, `Rules/core/analysis-and-risk.md`, `Rules/core/analysis-and-risk.md`, `Rules/core/task-router.md`  
> **Compatibility Note:** Untuk kompatibilitas dengan struktur repo saat ini, file final yang dipersist di `Assessments/` boleh tetap memakai naming path existing `*-qa-assessment.md` sampai ada migrasi naming filesystem repo-wide. Judul artefak ini tetap **Assessment Report** agar ownership Analyst jelas.

---

# Assessment Report: <Feature Name>

> **Assessment Type:** Type 1 — Feature Development Analysis / Type 2 — Bug Fix Analysis / Type 3 — Interconnection Analysis  
> **Owner:** Analyst  
> **Source PRD / Source Input:** `<path-to-prd-or-request-or-bug-report>`  
> **Source Change Intake Brief:** `Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md` / `not-applicable`  
> **Assessment Artifact Path:** `Assessments/<domain>/<feature-slug>/<feature-slug>-qa-assessment.md`  
> **Version:** `v1.0`  
> **Previous Version:** `none` / `<path-to-previous-version>`  
> **Rules Applied:** `Rules/core/analysis-and-risk.md`, `Rules/core/analysis-and-risk.md`, `Rules/core/task-router.md`  
> **Reference Context:** `Memory/global-memory.md`, `Assessments/reference/<reference-file>.md`, `<other-context-if-used>`  
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

**Change Class / Routing Decision from Brief:**

**Protected Existing Behavior from Brief:**

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

## 5. Analyst Review Checklist

Checklist minimum yang WAJIB dicek Analyst:

- [ ] lifecycle / state impact
- [ ] SLA impact
- [ ] RBAC / permission impact
- [ ] dependency impact
- [ ] backward compatibility
- [ ] edge-case / exception behavior

### 5.1 Notes per Checklist Item

| Area | Finding | Impact Level | Notes / Clarification Needed |
|------|---------|--------------|-------------------------------|
| Lifecycle / State |  | LOW / MEDIUM / HIGH |  |
| SLA |  | LOW / MEDIUM / HIGH |  |
| RBAC / Permission |  | LOW / MEDIUM / HIGH |  |
| Dependency |  | LOW / MEDIUM / HIGH |  |
| Backward Compatibility |  | LOW / MEDIUM / HIGH |  |
| Edge / Exception |  | LOW / MEDIUM / HIGH |  |

---

## 6. Impact Analysis

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

## 7. Dependency Analysis

### 7.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
|  |  |  |  |  |

### 7.2 Shared Resources / Event Mapping

- 

---

## 8. Risk Analysis

### 8.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 |  | Low / Medium / High | Low / Medium / High / Critical | Low / Medium / High / Critical |  |

### 8.2 Worst-Case Scenarios

- 

---

## 9. Test Strategy Input for QA

### 9.1 Functional Scope
- 

### 9.2 Regression Scope
- 

### 9.3 Integration Scope
- 

### 9.4 UAT / Business Validation
- 

### 9.5 Automation-Relevant Notes
- 

---

## 10. Production Safety

- **Rollback Strategy:**
- **Feature Toggle Requirement:**
- **Backward Compatibility Notes:**
- **Staged Rollout Recommendation:**
- **Monitoring / Alerting Needs:**
- **Logging / Audit Gaps:**

---

## 11. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 |  |  | Yes / No |

---

## 12. Recommendation

### 12.1 Recommendation Rationale

- 

### 12.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED / PROCEED_WITH_CAUTION / REVISE_PRD / SPLIT_FEATURE / HOLD_FEATURE` |
| Owner for Follow-up | PM / Analyst / QA / FE / BE / Cross-team |
| Required Revisions |  |
| Suggested Delivery Strategy | Full scope / Phase split / Pilot / Hold |
| Earliest Safe Next Step | PRD revision / Reviewer early review / Additional discovery |

---

## 13. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → QA Input Status

| Req ID | Requirement | Finding | Impact Area | QA Input Status |
|--------|-------------|---------|-------------|-----------------|
| FR-01 |  |  |  | Pending |

---

## 14. Change Log

| Date | Change | Author |
|------|--------|--------|
| YYYY-MM-DD | Initial assessment created |  |
