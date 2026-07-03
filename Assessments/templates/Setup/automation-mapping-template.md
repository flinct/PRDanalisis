# Automation Mapping Template

> **Owner:** QA Agent / Coder (automation)  
> **Purpose:** Memetakan requirement dan candidate test ke target automation yang nyata, termasuk readiness, split spec, dan batasan harness.  
> **Derived From:** `Rules/automation-bridge-rule.md`, `Rules/test-case-rule.md`, contoh `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md`

---

# Automation Mapping: <Feature Name>

> **Artifact Type:** Automation Mapping  
> **Source Change Intake Brief:** `<path-to-change-intake-brief>`  
> **Source PRD:** `<path-to-prd>`  
> **Source Assessment Report:** `<path-to-assessment-report>`  
> **Source QA Review / Test Spec:** `<path-to-qa-review-or-test-spec>`  
> **Artifact Path:** `Test/<domain>/<feature-slug>-automation-mapping.md`  
> **Automation Repo / Target:** `<repo-path-or-suite-root>`  
> **Version:** `v1.0`  
> **Status:** Draft / Reviewed / Approved / Synchronized

---

## 1. Recommendation

Jelaskan strategi automation secara ringkas:
- mana yang cocok untuk UI/E2E
- mana yang lebih cocok untuk API/integration/backend harness
- mana yang manual only
- batasan env/fixture paling penting

---

## 2. Proposed Automation Split

| Proposed File / Suite | Main Scope | Suggested Page Objects / Helpers | Framework | Notes |
|-----------------------|-----------|----------------------------------|-----------|-------|
| `playwright/tests/...` |  |  | Playwright / API / Other |  |

---

## 3. Candidate Matrix

| TC-ID / Req ID | Scenario | Candidate for Automation | Proposed Target | Test Class / Suite | Method / Flow | Framework | Status | Notes |
|----------------|----------|--------------------------|-----------------|--------------------|---------------|-----------|--------|-------|
| TC-XXX-001 / FR-001 |  | Yes / Conditional / No |  |  |  | Playwright / API / Other | Ready / Pending / Automated / Manual Only / Blocked / Flaky |  |

---

## 4. Automation Readiness Evaluation

Mark scenario `Ready` only when:
- [ ] precondition dapat dibuat via API / fixture / seed / stable setup
- [ ] test data deterministic
- [ ] expected result dapat di-assert otomatis
- [ ] test independent dan bisa run in any order
- [ ] cleanup dapat diotomasi
- [ ] env stabil untuk repeat execution
- [ ] tidak perlu OTP / CAPTCHA / external approval / manual wait

### 4.1 Blocking Reasons for Non-Ready Cases

| TC-ID / Req ID | Blocking Reason | Needed to Unblock | Owner |
|----------------|-----------------|-------------------|-------|
|  |  |  | QA / Coder / PM / Infra |

---

## 5. Summary

- **Ready now:** 
- **Conditional / near-ready:** 
- **Manual only / harness only:** 
- **Not suitable for current automation repo:** 

---

## 6. Alignment Notes

- mapping harus align dengan PRD, Assessment Report, QA review, dan test spec/TSV
- test case yang manual-only tetap harus ditrace, jangan hilang dari coverage
- jika ada drift antara scope PRD dan target automation, jelaskan di sini

### 6.1 Requirement ↔ Automation Traceability

| Req ID | Requirement Summary | Test Case ID | Automation Target | Status |
|--------|---------------------|--------------|-------------------|--------|
| FR-001 |  | TC-XXX-001 |  | Ready / Pending / Manual Only |

---

## 7. Sync Notes

Gunakan section ini untuk integrasi lintas repo bila relevan.

| Layer | Source | Target | Sync Action | Notes |
|------|--------|--------|-------------|-------|
| PRD |  |  |  |  |
| Test Case / Spec |  |  |  |  |
| Parsed JSON / Manifest |  |  |  |  |
| Automation Repo |  |  |  |  |

---

## 8. Open Questions / Dependencies

| ID | Item | Why It Matters | Blocking? |
|----|------|----------------|-----------|
| AM-01 |  |  | Yes / No |

---

## 9. Approval / Handoff

| Item | Value |
|------|-------|
| Ready for Reviewer? | Yes / No |
| Ready for Coder? | Yes / No |
| Needs fixture / env prep? | Yes / No |
| Next Recommended Step |  |
