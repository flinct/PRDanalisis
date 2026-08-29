# Reviewer Decision Template

> **Owner:** Reviewer  
> **Purpose:** Template keputusan baku untuk Gate A, Gate B, dan Gate C agar Orchestrator bisa meroute next step tanpa interpretasi naratif panjang.  
> **Derived From:** SOP workflow multi-agent, `Rules/core/analysis-and-risk.md` decision discipline, dan requirement package freeze convention.

---

# Reviewer Decision: <Feature Name>

> **Gate:** `A / B / C`  
> **Reviewer:** `<name>`  
> **Source Inputs:** `<paths-to-prd-assessment-qa-artifacts>`  
> **Tanggal Review:** YYYY-MM-DD  
> **Status:** Draft / Final

---

## 1. Review Context

**What is being reviewed:**
- 

**Artifacts reviewed:**
- 

**Review objective:**
- 

---

## 2. Decision Output

Pilih hanya satu schema sesuai gate yang aktif.

### Gate A — Early Review

**Allowed Status:**
- `APPROVE_WITH_NOTES`
- `REVISE_ASSESSMENT`
- `REVISE_PRD_DRAFT`
- `HOLD`

**Selected Gate A Status:** `<pick one>`

### Gate B — Requirement Package Approval

**Allowed Status:**
- `APPROVED`
- `APPROVED_WITH_CAUTION`
- `REVISE_PRD`
- `HOLD`

**Selected Gate B Status:** `<pick one>`

### Gate C — Final Review

**Allowed Status:**
- `FINAL_APPROVE`
- `REVISE_CODER`
- `REVISE_QA`
- `REOPEN_REQUIREMENT`

**Selected Gate C Status:** `<pick one>`

---

## 3. Decision Summary

**Decision Statement:**
> 1–3 kalimat singkat yang menyatakan keputusan reviewer.

**Reasoning Summary:**
- 

**Blocking / Conditional Notes:**
- 

---

## 4. Finding Matrix

| Finding ID | Artifact | Finding | Severity | Action Owner |
|------------|----------|---------|----------|--------------|
| RV-01 | PRD / Assessment / QA / Code / Mapping |  | Low / Medium / High / Critical | Analyst / PRD Writer / QA / Coder / Reviewer |

---

## 5. Routing Instruction for Orchestrator

| Condition | Next Step | Owner |
|-----------|-----------|-------|
| If approved |  |  |
| If revision needed |  |  |
| If hold / reopen needed |  |  |

---

## 6. Gate-Specific Checklist

### 6.1 Gate A Checklist
- [ ] Assessment cukup grounded
- [ ] Draft PRD tidak melenceng dari objective
- [ ] Gap besar sudah teridentifikasi
- [ ] Next step untuk PRD Writer jelas

### 6.2 Gate B Checklist
- [ ] PRD requirement-ready
- [ ] Assessment Report tersedia
- [ ] QA pre-implementation review tersedia
- [ ] Regression / coverage / automation scope cukup jelas
- [ ] Package layak dibekukan

### 6.3 Gate C Checklist
- [ ] Implementation sesuai frozen requirement package
- [ ] QA post-implementation validation tersedia
- [ ] Regression/alignment evidence cukup
- [ ] Tidak ada issue yang sebenarnya butuh reopen requirement

---

## 7. Requirement Package Freeze Note

Isi section ini hanya untuk **Gate B** atau **Gate C** bila relevan.

| Item | Value |
|------|-------|
| Freeze Status | Not Applicable / Approved and Frozen / Freeze Violated |
| Change After Freeze Detected? | Yes / No |
| If Yes, Required Action | Re-review delta / Reopen requirement / Return to PRD lane |

---

## 8. Final Handoff Note

> Tulis arahan singkat, operasional, dan langsung bisa dipakai oleh Orchestrator untuk step berikutnya.
