# QA Pre-Implementation Review Template

> **Owner:** QA Agent  
> **Purpose:** Review requirement package sebelum coding dimulai. Fokus pada PRD review, regression impact, coverage/test strategy, dan automation candidate mapping.  
> **Derived From:** `Rules/test-case-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`

---

# QA Pre-Implementation Review: <Feature Name>

> **Artifact Type:** QA Pre-Implementation Review  
> **Source Change Intake Brief:** `<path-to-change-intake-brief>`  
> **Source PRD:** `<path-to-prd>`  
> **Source Assessment Report:** `<path-to-assessment-report>`  
> **Artifact Path:** `Test/<domain>/<feature-slug>-qa-pre-implementation-review.md`  
> **Companion Artifacts:** `<test-spec / automation-mapping / assessment paths>`  
> **Version:** `v1.0`  
> **Tanggal Review:** YYYY-MM-DD  
> **Status:** Draft / Reviewed / Ready for Reviewer / Blocked

---

## 1. Review Objective

**Review Scope:**
- PRD clarity and testability
- regression/test impact
- coverage completeness
- automation candidate readiness

**Out of Scope:**
- post-implementation execution result
- final regression pass/fail
- defect conclusion from coded implementation

---

## 2. Requirement Package Input

| Item | Path / Reference | Status | Notes |
|------|------------------|--------|-------|
| Change Intake Brief |  | Available / Missing / Not Applicable |  |
| PRD |  | Available / Missing |  |
| Assessment Report |  | Available / Missing |  |
| Related Memory |  | Available / Missing |  |
| Related Existing Tests |  | Available / Missing |  |
| Impact Inputs |  | Available / Missing |  |

---

## 3. QA Readiness Snapshot

| Area | Status | Notes |
|------|--------|-------|
| Requirement clarity | Ready / Partial / Blocked |  |
| Acceptance criteria completeness | Ready / Partial / Blocked |  |
| Negative/edge coverage basis | Ready / Partial / Blocked |  |
| Regression scope definition | Ready / Partial / Blocked |  |
| Automation candidate identification | Ready / Partial / Blocked |  |

---

## 4. PRD Review Findings

| Finding ID | Area | Finding | Severity | Required Action |
|------------|------|---------|----------|-----------------|
| QAF-01 | Scope / flow / state / RBAC / SLA / API |  | Low / Medium / High / Critical |  |

### 4.1 Ambiguity / Missing Behavior
- 

### 4.2 Contradiction / Conflict
- 

### 4.3 Testability Concerns
- 

---

## 5. Requirement Coverage Matrix

| Req ID | Requirement Summary | Assessment Finding / Risk | Planned Test Coverage | Coverage Status |
|--------|---------------------|---------------------------|----------------------|-----------------|
| FR-001 |  |  | TC outline / suite | Covered / Partial / Blocked |

---

## 6. Regression & Impact Analysis

| Impact Area | Existing Behavior at Risk | Risk Level | Required Regression Scope | Notes |
|-------------|---------------------------|------------|---------------------------|-------|
| Module / flow |  | LOW / MEDIUM / HIGH |  |  |

### 6.1 Required Cross-Feature Validation
- 

### 6.2 Contract / Integration Validation Needs
- 

---

## 7. Test Strategy

| Test Type | Scope | Priority | Environment | Notes |
|-----------|-------|----------|-------------|-------|
| Smoke |  | P0 | Staging |  |
| Functional |  | P0 / P1 | Staging |  |
| Regression |  | P0 / P1 | Staging |  |
| Integration |  | P0 / P1 | Staging |  |
| UAT |  | P1 / P2 | UAT / Staging |  |

---

## 8. Test Case Outline / Candidate Suites

| Suite ID | Suite Name | Purpose | Planned Test Case IDs | Execution Trigger |
|----------|------------|---------|-----------------------|-------------------|
| TS-001 |  |  |  |  |

### 8.1 Priority Guidance
- **P0:** release blocker / critical path / data integrity / access control / SLA / automation-critical
- **P1:** core behavior and high-value regression
- **P2:** edge case / exception / secondary path
- **P3:** low-risk negative / long-tail behavior

---

## 9. Automation Candidate Mapping

| Req / TC Candidate | Proposed Automation File | Test Class / Suite | Test Method / Flow | Framework | Automation Status | Notes |
|--------------------|--------------------------|--------------------|--------------------|-----------|-------------------|-------|
| FR-001 / TC-XXX-001 |  |  |  | Playwright / API / Other | Ready / Pending / Manual Only / Blocked |  |

### 9.1 Automation Readiness Checklist

Mark candidate `Ready` only when:
- [ ] precondition dapat dibuat via API / fixture / seed / stable setup
- [ ] data deterministic
- [ ] expected result dapat di-assert otomatis
- [ ] test independent dan bisa dijalankan dalam urutan apa pun
- [ ] cleanup bisa diotomasi
- [ ] environment stabil untuk repeat execution
- [ ] tidak butuh OTP / CAPTCHA / human approval / manual wait

---

## 10. Blockers & Open Questions

| ID | Item | Impact | Blocking? | Owner |
|----|------|--------|-----------|-------|
| B-01 |  |  | Yes / No | PM / Analyst / QA / Eng |

---

## 11. QA Recommendation to Reviewer

| Item | Value |
|------|-------|
| QA Package Status | READY_FOR_REVIEW / READY_WITH_GAPS / BLOCKED |
| Freeze Readiness | Ready / Not Ready |
| Must-Fix Before Gate B |  |
| Safe Next Step | Reviewer approval / PRD revision / Assessment revision |

### Summary Note
> 3–5 kalimat ringkas untuk Reviewer tentang apakah package sudah layak masuk Gate B.
