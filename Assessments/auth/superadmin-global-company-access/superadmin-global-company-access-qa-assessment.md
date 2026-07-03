# Assessment Report: SuperAdmin Global Company Access and Tenant Impersonation

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`
> **Assessment Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md`
> **Version:** `v1.1`
> **Previous Version:** `Assessments/auth/superadmin-global-company-access/versions/superadmin-global-company-access-qa-assessment-v1.0.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-22
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Previous version reviewed the initial superAdmin PRD baseline.
- This revision incorporates the newer source PRD change set: **SuperAdmin login email verification code (2FA)**, **route namespace shift from `/super-admin/*` to `/system/*`**, and **system surface direction to `system.satuinbox.com`**.
- Decision remains `PROCEED_WITH_CAUTION`, but auth/security and route-migration scope are now broader than in v1.0.

---

## 1. Overview

**Feature / Issue:**
Review PRD `SuperAdmin Global Company Access and Tenant Impersonation` for completeness, implementation readiness, and blast radius.

**Objective:**
Validate whether the PRD is clear enough and safe enough to move into development, especially around company-wide access, SuperAdmin login security, onboarding approval, impersonation, read-only enforcement, and future write mode.

**Business Context:**
From current repo evidence:
- `SUPER_ADMIN` role already exists in backend permission seed and default permission model.
- FE has a route constant `super-admin`, but no clear implemented platform-admin page surface was found from file inspection.
- Company listing exists in `company-service` gRPC (`ListCompanies`, `GetCompany`), but a dedicated HTTP super-admin list route was not found in API Gateway company controller.
- API Gateway currently exposes plain `POST /auth/login`; no `/system/auth/request-code` or `/system/auth/login` route was evidenced from repo inspection.
- Shared security utility already supports generating numeric verification codes, and notification config already reads `MAIL_FROM`, so some lower-level primitives exist.
- No FE evidence of `system.satuinbox.com` or `/system/*` superAdmin surface was found.
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
> PRD ini tetap punya arah yang benar karena memecah delivery menjadi 3 phase dan tidak memaksakan bypass tenant global. Namun versi revisi sekarang juga menambahkan **auth gate baru untuk SuperAdmin (email verification code / 2FA)** serta **perubahan namespace/surface** yang memperluas scope ke contract login, route migration, dan dependency email delivery. **Phase 1** masih cukup dekat ke implementation-ready, tetapi auth/security contract baru, **Phase 2 (impersonation read-only)**, dan **Phase 3 (write mode)** tetap butuh lock detail sebelum aman masuk development.

### 2.2 Required Actions Before Development

- [ ] Lock exact **company list row fields** untuk phase 1, minimal owner field mana yang tampil (`fullName`, `email`, status, createdAt, dsb).
- [ ] Tambahkan explicit rule bahwa **read-only enforcement wajib backend-enforced**, bukan FE-only dan bukan “frontend atau backend atau both”.
- [ ] Lock **organization selection rule** untuk impersonation karena runtime existing memakai `companyId + organizationId`.
- [ ] Definisikan **session switch mechanism** untuk impersonation: token issuance, FE `useSession()/update()` behavior, exit flow, stale tab behavior, refresh-token behavior.
- [ ] Definisikan **audit schema minimum** untuk impersonation dan write-mode actions.
- [ ] Definisikan **allowlist quick actions** Phase 3 lebih konkret, minimal starting set dan apa yang belum boleh.
- [ ] Lock **SuperAdmin login-code contract**: code storage/binding, resend behavior, verify attempt limits, invalidation rules, and whether 24h validity is acceptable.
- [ ] Lock **system surface migration contract**: apakah `system.satuinbox.com` adalah app/domain terpisah atau hanya namespace/route baru dalam FE existing.
- [ ] Lock backward-compatibility expectation between existing `/auth/login` flow and new `/system/auth/*` flow for SuperAdmin.

### 2.3 Key Blocking Reasons / Conditions

- Runtime existing masih single-tenant dan banyak flow butuh `companyId + organizationId`.
- PRD belum cukup detail soal bagaimana impersonation mengganti context secara aman di FE + backend.
- Read-only mode belum dikunci sebagai backend-mandatory enforcement.
- Phase 3 write mode masih terlalu generik untuk dianggap implementation-ready.
- Auth gate baru masih belum cukup detail soal code lifecycle, binding model, dan fallback saat email delivery gagal.
- Perubahan namespace `/super-admin/*` ke `/system/*` dan surface `system.satuinbox.com` belum menjelaskan cutover/migration path.

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
| BR-06 | SuperAdmin login sekarang membutuhkan email verification code sebagai second factor sebelum session platform-admin diterbitkan. | PRD |
| BR-07 | Verification code berlaku 24 jam dan, jika masih valid, harus di-resend sebagai code yang sama. | PRD |

### 3.2 Acceptance Criteria Review

**Yang sudah kuat:**
- Phase split jelas.
- Onboarding approval dimasukkan ke phase 1 secara eksplisit.
- Impersonation dipisah dari phase 1, ini bagus.
- Write mode tidak langsung dibuka dari awal.
- Ada tambahan security gate untuk SuperAdmin sehingga access ke platform-admin tidak hanya bergantung pada password.

**Yang masih lemah / perlu penguncian:**
- owner fields exact yang harus tampil di company list
- organization targeting rule
- session refresh / session restore behavior
- backend read-only enforcement contract
- phase-3 action allowlist
- login-code lifecycle / binding / retry / invalidation contract
- route/domain migration contract untuk `/system/*` dan `system.satuinbox.com`

### 3.3 Assumptions

- Company list akan dibangun sebagai surface baru, bukan reusing tenant settings biasa.
- Existing approve/reject company lifecycle di company-service akan direuse.
- Impersonation target tetap harus memilih atau menurunkan `organizationId`, bukan company saja.
- Login-code flow hanya berlaku untuk SuperAdmin / system surface, bukan untuk semua tenant role.

### 3.4 Clarifications Needed

- Owner info apa yang boleh tampil di company list phase 1: nama saja, nama + email, atau juga phone?
- Kalau satu company punya banyak organization, default organization saat impersonation ditentukan bagaimana?
- Read-only mode perlu full backend lock semua mutation atau hanya allowlist denylist tertentu?
- Quick action phase 3 selain `change permission` apa saja yang benar-benar diinginkan?
- Apakah code 24 jam memang acceptable untuk admin-security posture, atau harus diperpendek?
- `system.satuinbox.com` ini app/domain terpisah atau representasi route namespace baru saja?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- FE auth session membawa `company` dan `organization` tunggal.
- FE route constant `super-admin` ada, tetapi halaman operasional super-admin belum terbukti ada dari inspeksi file.
- FE belum menunjukkan surface `system.satuinbox.com` atau route namespace `/system/*`.
- API Gateway company controller saat ini expose register / approve / reject / webhook / csat, tetapi belum ada explicit HTTP route untuk list company super-admin.
- API Gateway auth controller saat ini masih plain `POST /auth/login`; route login-code khusus SuperAdmin belum terbukti ada.
- `company-service` gRPC sudah punya `ListCompanies` dan `GetCompany`.
- BE already has verification-code generation primitive and `MAIL_FROM` config, but no evidenced end-to-end SuperAdmin 2FA flow.
- `SUPER_ADMIN` role dan wildcard access sudah ada.

### 4.2 Proposed State (To-Be)

- Phase 1 menambahkan platform-admin queue/list untuk review company.
- Pre-access auth menambahkan request-code dan verify-code flow sebelum platform-admin session issuance.
- Phase 2 menambahkan switched tenant session read-only.
- Phase 3 menambahkan explicit write mode dan allowlisted quick actions.
- Platform-admin API namespace bergeser ke `/system/*`, dan surface direction bergeser ke `system.satuinbox.com`.

### 4.3 State Transition / Data Flow Notes

**Pre-access path**
`SUPER_ADMIN credentials` → `request login code` → `email delivery via MAIL_FROM` → `verify 6-digit code` → `platform-admin session issued`

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
| API | Perlu route baru untuk list/search/impersonation/quick action dan login-code flow `/system/auth/*` | API Gateway + gRPC usage | HIGH | new routes only, do not overload tenant routes ambiguously |
| UI/UX | New system login step, super-admin shell, badges, tenant banner | FE shell + guard flow | HIGH | explicit mode labels and clear pre-auth verification step |
| Security / RBAC | Cross-company access, impersonation, and new SuperAdmin auth gate | auth, guards, tokens, downstream mutation | CRITICAL | backend enforcement mandatory + auth contract lock |
| Performance | Company list and search across all companies | company-service, gateway | MEDIUM | pagination + server-side search |
| Integration | approval + auth/session + tenant UI reuse + notification/email delivery | company/auth/tenant/notification modules | HIGH | define exact session-switch and login-code contract |
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
| Login verification code | auth-service + notification delivery | auth/security | FE system login → Gateway/auth-service → notification/email | new flow, only low-level primitives evidenced |
| Impersonation | auth/session/token | auth/security | FE super-admin → Gateway/auth-service | currently undefined in detail |
| Read-only mode | route guard + mutation guard | FE + BE | impersonated context → downstream modules | must be backend-enforced |
| Write mode | target mutation services | FE + BE | impersonated write mode → allowlisted services | allowlist not yet concrete |

### 6.2 Shared Resources / Event Mapping

- Shared FE session model from NextAuth.
- Shared refresh-token update path in FE.
- Shared tenant context in user session.
- Shared company approval flow in company-service.
- Shared role/permission model for future quick action `change permission`.
- Shared notification/email sender dependency for login-code delivery.

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
| R-07 | 24-hour verification code validity creates wider misuse window than expected for admin access | Medium | High | High | re-evaluate TTL and invalidation policy |
| R-08 | Email delivery failure blocks all SuperAdmin login attempts | Medium | High | High | delivery monitoring, resend policy, operational fallback |
| R-09 | `/system/*` route migration drifts from existing FE/BE namespace implementation | Medium | High | High | explicit cutover and compatibility plan |

### 7.2 Worst-Case Scenarios

- SuperAdmin believes they are read-only but still mutates tenant data.
- SuperAdmin enters wrong organization under correct company and changes wrong records.
- Quick action `change permission` affects active users without proper session-refresh strategy.
- SuperAdmin cannot access the platform-admin surface during mail outage or repeated code-send failure.

---

## 8. Test Strategy

### 8.1 Functional Scope
- request login code / resend same valid code
- verify valid code / invalid code / expired code
- company list/search
- pending/new badge rendering
- approve/reject onboarding company
- impersonation start/end
- read-only write blocking
- write-mode quick action gating

### 8.2 Regression Scope
- existing normal tenant `/auth/login` flow remains unaffected
- existing onboarding flow remains valid
- existing tenant user sessions remain unaffected
- existing tenant routes do not become globally accessible

### 8.3 Integration Scope
- gateway/auth ↔ notification delivery for login code
- gateway/auth ↔ verification-code storage / TTL / rate limit behavior
- gateway ↔ company-service list/approve/reject
- gateway/auth ↔ switched-session issuance
- FE session update ↔ impersonation banner state
- write-mode action ↔ audit logging

### 8.4 UAT / Business Validation
- superAdmin can complete secure login via email code
- superAdmin can find new companies fast
- superAdmin can approve onboarding centrally
- superAdmin can inspect tenant safely in phase 2
- phase 3 write action is visibly controlled and auditable

### 8.5 Automation Candidates
- API contract tests request-code and verify-code flow
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
- **Monitoring / Alerting Needs:** login-code send failure, invalid-code spike, impersonation creation failure, read-only blocked writes, unauthorized super-admin route hits.
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
| OQ-07 | Apakah verification code 24 jam acceptable untuk admin access atau harus lebih pendek? | Security posture | Yes |
| OQ-08 | `system.satuinbox.com` apakah domain/app terpisah atau hanya route namespace baru? | FE/API migration scope | Yes |
| OQ-09 | Bagaimana code di-bind ke user/session/device dan kapan code lama di-invalidasi? | Replay / stale-auth risk | Yes |

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
  - login-code 2FA contract harus lebih detail
  - `/system/*` dan `system.satuinbox.com` migration contract harus lebih jelas

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / Analyst / FE / BE / Security |
| Required Revisions | lock owner fields, lock org targeting, lock session-switch contract, lock backend read-only enforcement, define phase-3 allowlist, define SuperAdmin 2FA lifecycle, define `/system/*` surface migration contract |
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
| FR-031 | SuperAdmin login verification code | Security direction is sensible, but lifecycle/TTL/binding details remain underdefined | Auth/Security | Pending | Needs revision |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial review assessment created | Hermes |
| 2026-06-22 | Updated assessment for SuperAdmin 2FA login flow and `/system/*` route/surface change set | Hermes |
