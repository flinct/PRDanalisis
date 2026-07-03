# Assessment Report: SuperAdmin Global Company Access and Tenant Impersonation

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`
> **Assessment Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-22
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Initial review for the newly drafted superAdmin PRD.
- Review conclusion: direction is correct and phase ordering is safer than direct global access.
- Main concern: PRD is **strong for Phase 1**, but **Phase 2 and Phase 3 still need several implementation-lock details** before handoff.

---

## 1. Overview

**Feature / Issue:**
Review PRD `SuperAdmin Global Company Access and Tenant Impersonation` for completeness, implementation readiness, and blast radius.

**Objective:**
Validate whether the PRD is clear enough and safe enough to move into development, especially around company-wide access, onboarding approval, impersonation, read-only enforcement, and future write mode.

**Business Context:**
From current repo evidence:
- `SUPER_ADMIN` role already exists in backend permission seed and default permission model.
- FE has a route constant `super-admin`, but no clear implemented platform-admin page surface was found from file inspection.
- Company listing exists in `company-service` gRPC (`ListCompanies`, `GetCompany`), but a dedicated HTTP super-admin list route was not found in API Gateway company controller.
- Current auth/session flow still carries one `company` and one `organization` in FE session, and many BE flows require both `companyId` and `organizationId`.

**Scope In:**
- PRD quality review
- implementation readiness review
- dependency, risk, and architecture review
- recommendations before development

**Scope Out:**
- code changes
- PRD rewrite
- test case authoring

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> PRD ini sudah punya arah yang benar, terutama karena memecah delivery menjadi 3 phase dan tidak memaksakan bypass tenant global. **Phase 1** cukup dekat ke implementation-ready. Namun **Phase 2 (impersonation read-only)** dan **Phase 3 (write mode)** masih butuh beberapa lock penting pada contract session, backend enforcement, organization targeting, dan allowlist mutation sebelum aman masuk development.

### 2.2 Required Actions Before Development

- [ ] Lock exact **company list row fields** untuk phase 1, minimal owner field mana yang tampil (`fullName`, `email`, status, createdAt, dsb).
- [ ] Tambahkan explicit rule bahwa **read-only enforcement wajib backend-enforced**, bukan FE-only dan bukan “frontend atau backend atau both”.
- [ ] Lock **organization selection rule** untuk impersonation karena runtime existing memakai `companyId + organizationId`.
- [ ] Definisikan **session switch mechanism** untuk impersonation: token issuance, FE `useSession()/update()` behavior, exit flow, stale tab behavior, refresh-token behavior.
- [ ] Definisikan **audit schema minimum** untuk impersonation dan write-mode actions.
- [ ] Definisikan **allowlist quick actions** Phase 3 lebih konkret, minimal starting set dan apa yang belum boleh.

### 2.3 Key Blocking Reasons / Conditions

- Runtime existing masih single-tenant dan banyak flow butuh `companyId + organizationId`.
- PRD belum cukup detail soal bagaimana impersonation mengganti context secara aman di FE + backend.
- Read-only mode belum dikunci sebagai backend-mandatory enforcement.
- Phase 3 write mode masih terlalu generik untuk dianggap implementation-ready.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** Critical
- **Primary Impact Areas:** Auth, Session, API Gateway, Company Service, RBAC, Security, Audit, FE Route Guard, Mutation Safety

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Hanya `SUPER_ADMIN` yang boleh mengakses lane ini. | PRD |
| BR-02 | Phase 1 fokus pada company list/search dan onboarding approval. | PRD |
| BR-03 | Phase 2 fokus pada impersonation read-only + audit. | PRD |
| BR-04 | Phase 3 fokus pada write mode terbatas + quick admin actions. | PRD |
| BR-05 | Tenant scoping existing tidak boleh dibypass mentah. | PRD + current architecture |

### 3.2 Acceptance Criteria Review

**Yang sudah kuat:**
- Phase split jelas.
- Onboarding approval dimasukkan ke phase 1 secara eksplisit.
- Impersonation dipisah dari phase 1, ini bagus.
- Write mode tidak langsung dibuka dari awal.

**Yang masih lemah / perlu penguncian:**
- owner fields exact yang harus tampil di company list
- organization targeting rule
- session refresh / session restore behavior
- backend read-only enforcement contract
- phase-3 action allowlist

### 3.3 Assumptions

- Company list akan dibangun sebagai surface baru, bukan reusing tenant settings biasa.
- Existing approve/reject company lifecycle di company-service akan direuse.
- Impersonation target tetap harus memilih atau menurunkan `organizationId`, bukan company saja.

### 3.4 Clarifications Needed

- Owner info apa yang boleh tampil di company list phase 1: nama saja, nama + email, atau juga phone?
- Kalau satu company punya banyak organization, default organization saat impersonation ditentukan bagaimana?
- Read-only mode perlu full backend lock semua mutation atau hanya allowlist denylist tertentu?
- Quick action phase 3 selain `change permission` apa saja yang benar-benar diinginkan?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- FE auth session membawa `company` dan `organization` tunggal.
- FE route constant `super-admin` ada, tetapi halaman operasional super-admin belum terbukti ada dari inspeksi file.
- API Gateway company controller saat ini expose register / approve / reject / webhook / csat, tetapi belum ada explicit HTTP route untuk list company super-admin.
- `company-service` gRPC sudah punya `ListCompanies` dan `GetCompany`.
- `SUPER_ADMIN` role dan wildcard access sudah ada.

### 4.2 Proposed State (To-Be)

- Phase 1 menambahkan platform-admin queue/list untuk review company.
- Phase 2 menambahkan switched tenant session read-only.
- Phase 3 menambahkan explicit write mode dan allowlisted quick actions.

### 4.3 State Transition / Data Flow Notes

**Phase 1 path**
`SUPER_ADMIN FE page` → `API Gateway super-admin company routes` → `company-service list/get/approve/reject`

**Phase 2 path**
`SUPER_ADMIN FE page` → `API Gateway impersonation route` → `auth/session layer issues switched tenant token` → `tenant UI loaded in read-only mode`

**Phase 3 path**
`impersonating write-mode session` → `allowlisted quick action endpoint` → `target service mutation` → `audit log`

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Tambah super-admin FE surface dan gateway routes | FE routing, API Gateway, company-service, auth/session | HIGH | phased delivery already helps |
| Database | Tidak harus menambah core business schema besar untuk phase 1, tetapi audit persistence penting | audit/security storage | MEDIUM | define audit model early |
| API | Perlu route baru untuk list/search/impersonation/quick action | API Gateway + gRPC usage | HIGH | new routes only, do not overload tenant routes ambiguously |
| UI/UX | New super-admin shell, badges, tenant banner | FE shell + guard flow | HIGH | explicit mode labels |
| Security / RBAC | Cross-company access and impersonation | auth, guards, tokens, downstream mutation | CRITICAL | backend enforcement mandatory |
| Performance | Company list and search across all companies | company-service, gateway | MEDIUM | pagination + server-side search |
| Integration | approval + auth/session + tenant UI reuse | company/auth/tenant modules | HIGH | define exact session-switch contract |
| Reporting / Analytics | Need action audit/report | audit tooling | MEDIUM | structured audit events |
| Financial / Operational | Wrong tenant mutation can be severe | onboarding/company governance, permission changes | HIGH | phase write mode only after locks |
| Concurrency | concurrent approve / concurrent impersonation / multi-tab state | gateway + auth + FE | HIGH | explicit retry/idempotency/session rules |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Company list/search | `company-service` `ListCompanies` | gRPC read | FE super-admin → Gateway → company-service | route not exposed yet in gateway |
| Approve/reject onboarding | existing company approval flow | mutation | FE super-admin → Gateway → company-service | good reuse path |
| Impersonation | auth/session/token | auth/security | FE super-admin → Gateway/auth-service | currently undefined in detail |
| Read-only mode | route guard + mutation guard | FE + BE | impersonated context → downstream modules | must be backend-enforced |
| Write mode | target mutation services | FE + BE | impersonated write mode → allowlisted services | allowlist not yet concrete |

### 6.2 Shared Resources / Event Mapping

- Shared FE session model from NextAuth.
- Shared refresh-token update path in FE.
- Shared tenant context in user session.
- Shared company approval flow in company-service.
- Shared role/permission model for future quick action `change permission`.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Read-only mode enforced only in FE and hidden mutation path still writes data | Medium | Critical | Critical | backend must be final authority |
| R-02 | Impersonation starts with wrong organization context | Medium | High | High | explicit organization targeting rule |
| R-03 | Multi-tab session confusion between normal superadmin and impersonated tenant | Medium | High | High | define tab/session behavior clearly |
| R-04 | Phase 3 write mode scope expands too fast | Medium | High | High | allowlist + separate gate per action |
| R-05 | Company list route accidentally exposed to non-superadmin | Low | Critical | High | strict role guard + test coverage |
| R-06 | Approval/rejection race creates ambiguous final state | Medium | Medium | Medium | idempotent review action + refreshed row state |

### 7.2 Worst-Case Scenarios

- SuperAdmin believes they are read-only but still mutates tenant data.
- SuperAdmin enters wrong organization under correct company and changes wrong records.
- Quick action `change permission` affects active users without proper session-refresh strategy.

---

## 8. Test Strategy

### 8.1 Functional Scope
- company list/search
- pending/new badge rendering
- approve/reject onboarding company
- impersonation start/end
- read-only write blocking
- write-mode quick action gating

### 8.2 Regression Scope
- existing onboarding flow remains valid
- existing tenant user sessions remain unaffected
- existing tenant routes do not become globally accessible

### 8.3 Integration Scope
- gateway ↔ company-service list/approve/reject
- gateway/auth ↔ switched-session issuance
- FE session update ↔ impersonation banner state
- write-mode action ↔ audit logging

### 8.4 UAT / Business Validation
- superAdmin can find new companies fast
- superAdmin can approve onboarding centrally
- superAdmin can inspect tenant safely in phase 2
- phase 3 write action is visibly controlled and auditable

### 8.5 Automation Candidates
- API contract tests company list/search
- API contract tests approve/reject onboarding
- FE E2E super-admin list + badge + review actions
- FE/BE integration tests for impersonation read-only blocking
- negative tests for non-superadmin access

---

## 9. Production Safety

- **Rollback Strategy:** independent feature flags for phase 1, phase 2, and phase 3.
- **Feature Toggle Requirement:** mandatory.
- **Backward Compatibility Notes:** preserve existing single-tenant runtime; do not weaken tenant filters globally.
- **Staged Rollout Recommendation:** phase 1 first, then phase 2 internal-only, then limited phase 3 quick actions.
- **Monitoring / Alerting Needs:** impersonation creation failure, read-only blocked writes, unauthorized super-admin route hits.
- **Logging / Audit Gaps:** PRD needs a more explicit minimum audit payload definition.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Exact owner fields shown in company list apa saja? | Privacy and FE contract | Yes |
| OQ-02 | Default organization selection saat impersonation bagaimana? | Current runtime butuh organizationId | Yes |
| OQ-03 | Session switch dan restore flow bagaimana detailnya di FE NextAuth? | Prevent stale or mixed contexts | Yes |
| OQ-04 | Read-only enforcement layer final ada di mana saja? | Security critical | Yes |
| OQ-05 | Phase-3 quick action allowlist apa saja selain change permission? | Prevent scope creep | Yes |
| OQ-06 | `change permission` butuh session refresh strategy untuk affected tenant users atau tidak? | Active-user authorization correctness | Yes |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- **Yang sudah bagus**
  - phase ordering benar
  - phase 1 terpisah dari impersonation
  - PRD tidak mendorong bypass tenant global
  - approve/reject onboarding reuse existing company lifecycle

- **Yang perlu revisi sebelum handoff dev**
  - read-only enforcement harus dikunci server-side
  - session-switch contract harus lebih detail
  - organization selection harus diputuskan
  - phase 3 action scope harus lebih sempit dan eksplisit

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / Analyst / FE / BE / Security |
| Required Revisions | lock owner fields, lock org targeting, lock session-switch contract, lock backend read-only enforcement, define phase-3 allowlist |
| Suggested Delivery Strategy | proceed phase 1 first; gate phase 2 and 3 with additional revision notes |
| Earliest Safe Next Step | patch PRD for the 5 lock items above before implementation planning |

---

## 12. Traceability Matrix

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-004 | Company list for superAdmin | Direction clear, but exact owner fields still vague | FE/API/Privacy | Pending | Needs revision |
| FR-010 | Approve onboarding company | Good reuse of existing company approval lifecycle | Company/API | Pending | Good |
| FR-015 | Impersonation switch context | Concept correct, but session contract underdefined | Auth/Session | Pending | Needs revision |
| FR-018 | Read-only mode | Good intent, but backend enforcement not explicit enough | Security/RBAC | Pending | Needs revision |
| FR-024 | Write mode | Correctly phased late, but allowlist too broad/vague | Mutation Safety | Pending | Needs revision |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial review assessment created | Hermes |
