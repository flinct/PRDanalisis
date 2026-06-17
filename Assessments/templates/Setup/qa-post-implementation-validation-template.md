# QA Post-Implementation Validation Template

> **Owner:** QA Agent  
> **Purpose:** Validasi setelah implementation selesai. Fokus pada regression result, automation alignment, coverage confirmation, dan uncovered gaps/defects.  
> **Derived From:** `Rules/test-case-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`

---

# QA Post-Implementation Validation: <Feature Name>

> **Artifact Type:** QA Post-Implementation Validation  
> **Source PRD:** `<path-to-prd>`  
> **Source Assessment Report:** `<path-to-assessment-report>`  
> **Source QA Pre-Implementation Review:** `<path-to-pre-implementation-review>`  
> **Implementation Reference:** `<repo / branch / PR / commit / spec path>`  
> **Artifact Path:** `Test/<domain>/<feature-slug>-qa-post-implementation-validation.md`  
> **Version:** `v1.0`  
> **Tanggal Validasi:** YYYY-MM-DD  
> **Status:** Draft / In Validation / Ready for Reviewer / Blocked

---

## 1. Validation Scope

**In Scope:**
- regression result
- automation alignment
- coverage confirmation
- mismatch / defect / uncovered gap

**Out of Scope:**
- redefining business requirement without reopening requirement lane
- re-authoring PRD

---

## 2. Inputs Checked

| Item | Path / Reference | Status | Notes |
|------|------------------|--------|-------|
| Frozen PRD |  | Available / Missing |  |
| Assessment Report |  | Available / Missing |  |
| QA Pre-Implementation Review |  | Available / Missing |  |
| Implementation Artifact |  | Available / Missing |  |
| Test Spec / TSV / Mapping |  | Available / Missing |  |

---

## 3. Execution Summary

| Area | Result | Evidence | Notes |
|------|--------|----------|-------|
| Smoke | Pass / Partial / Fail / Blocked |  |  |
| Functional | Pass / Partial / Fail / Blocked |  |  |
| Regression | Pass / Partial / Fail / Blocked |  |  |
| Integration | Pass / Partial / Fail / Blocked |  |  |
| Automation Execution | Pass / Partial / Fail / Blocked |  |  |

---

## 4. Requirement Coverage Confirmation

| Req ID | Expected Behavior | Validation Evidence | Coverage Result | Notes |
|--------|-------------------|--------------------|-----------------|-------|
| FR-001 |  |  | Covered / Partial / Not Covered |  |

---

## 5. Regression Result

| Impact Area | Planned Regression Scope | Execution Result | Risk Outcome | Notes |
|-------------|--------------------------|------------------|--------------|-------|
| Module / flow |  | Pass / Partial / Fail / Blocked | Low / Medium / High |  |

### 5.1 Unexpected Regressions
- 

---

## 6. Automation Alignment Validation

| TC-ID / Scenario | Planned Automation Target | Actual Implementation Target | Alignment Status | Notes |
|------------------|---------------------------|------------------------------|------------------|-------|
| TC-XXX-001 |  |  | Aligned / Partial / Mismatch / Not Implemented |  |

### 6.1 Automation Status Summary
- **Automated:** 
- **Ready but not implemented:** 
- **Manual only:** 
- **Blocked:** 

---

## 7. Defects / Mismatches / Gaps

| Defect ID | Related Req / TC | Severity | Actual Result | Expected Result | Recommended Routing |
|-----------|------------------|----------|---------------|-----------------|---------------------|
| BUG-001 |  | Critical / High / Medium / Low |  |  | Revise Coder / Revise QA / Reopen Requirement |

### 7.1 Uncovered Gaps
- 

---

## 8. Freeze Integrity Check

Gunakan section ini untuk memastikan implementation masih sesuai dengan **Requirement Package Freeze**.

| Check Item | Result | Notes |
|-----------|--------|-------|
| No silent requirement change detected | Yes / No |  |
| No hidden scope expansion detected | Yes / No |  |
| No changed expected behavior without approval | Yes / No |  |
| No mapping drift between PRD and automation | Yes / No |  |

Jika ada `No`, jelaskan apakah issue harus diroute ke `REOPEN_REQUIREMENT`.

---

## 9. QA Recommendation to Reviewer

| Item | Value |
|------|-------|
| QA Validation Status | READY_FOR_FINAL_REVIEW / READY_WITH_ISSUES / BLOCKED |
| Recommended Gate C Direction | FINAL_APPROVE / REVISE_CODER / REVISE_QA / REOPEN_REQUIREMENT |
| Must-Fix Before Sign-Off |  |
| Evidence Bundle |  |

### Summary Note
> 3–5 kalimat ringkas untuk Reviewer tentang apakah hasil implementasi layak sign-off.
