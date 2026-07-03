# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: SuperAdmin Global Company Access and Tenant Impersonation  
**Product Manager**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: TBD

---

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-06-22 | Dany Christian | Initial PRD for phased superAdmin company list/search, onboarding approval operations, tenant impersonation read-only mode, audit log, and controlled write mode. |
| v1.1 | 2026-07-01 | Naftal Yunior | Added SuperAdmin login email verification code (2FA): a 6-digit code emailed via `MAIL_FROM`, valid 24h, reused (same code resent) if a valid code already exists within the window. |
| v1.2 | 2026-06-22 | Dany Christian | Expanded PRD into combined superAdmin + subscription governance control plane with phased delivery: Phase 1 for company review, subscription control surface, owner/company permission governance, and tenant-side permission ceiling enforcement; Phase 2 for impersonation, async permission propagation orchestration, audit visibility, and controlled operational writes. |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a safe platform-admin surface for `SUPER_ADMIN` so they can review all companies in SatuInbox, approve onboarding companies, switch into tenant context safely, and later perform controlled write operations without breaking the existing single-tenant runtime model. |
| Scope | This PRD defines a phased delivery that combines superAdmin governance with subscription control: phase 1 centralized tenant review, subscription control surface, and company owner permission governance; phase 2 impersonation, async permission propagation orchestration, and controlled operational writes. |
| Key Capabilities | Central company list, owner visibility, new company highlighting, approval workflow, subscription mutation control, company owner permission ceiling governance, tenant-side permission ceiling enforcement, tenant impersonation, visible tenant banner, read-only enforcement, audit logging, and controlled operational writes. |
| Outcome | SatuInbox gains a centralized governance console where superAdmin can safely control tenant subscription access and company-wide permission ceilings without bypassing current tenant architecture blindly. |

### **2.1 Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Dedicated superAdmin platform-admin surface. | Removing `companyId + organizationId` tenant scoping from existing services. |
| Company list/search across all companies. | Open-ended global access for normal admin roles. |
| New company badge and owner visibility in company list. | Full cross-company analytics dashboard in Phase 1. |
| Approve / reject onboarding company review flow. | Silent background impersonation without visible indicator. |
| Subscription control surface: change, enable, disable, suspend, reactivate, and other explicit subscription mutations. | Rewriting payment-service ownership of subscription lifecycle. |
| Company owner permission governance as company-wide permission ceiling. | Tenant-side owner permission governance from normal settings pages. |
| Async member permission/role rewrite after owner/subscription downgrade. | Automatic re-grant of member permission when owner later increases again. |
| Tenant impersonation in read-only mode. | Unrestricted write access in early phases. |
| Audit logging for list, approve, reject, impersonation, and write-mode actions. | Broad mutation across all modules on first release. |
| Controlled write mode quick actions in later phase. | Permanent removal of tenant isolation from auth/session model. |
| SuperAdmin login email verification code (2FA), sent via `MAIL_FROM`. | Full OTP/2FA rollout for normal tenant roles. |

### **2.2 Release Scope by Phase**

| Phase | Scope |
| ----- | ----- |
| Phase 1 | Company list/search, new company badge/banner, owner user displayed at company list, approve/reject onboarding company, subscription control surface, owner/company permission governance, and tenant-side permission ceiling enforcement rules. |
| Phase 2 | Tenant impersonation / switch context, read-only mode, visible tenant banner, audit log for access, async member permission propagation orchestration, and controlled operational writes aligned with centralized governance. |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | `SUPER_ADMIN` role exists in backend permission model, but no confirmed end-user platform-admin surface is available to operate across all companies. | Operational support still depends on ad-hoc engineering or backend-level intervention. |
| PS-002 | Current FE/BE runtime is single-tenant by design, so “akses semua company” cannot be implemented safely by simply relaxing tenant guards. | High risk of cross-company data leakage and unsafe mutations. |
| PS-003 | Onboarding company approval exists as backend capability, but is not yet framed as a structured superAdmin workflow with queue/list visibility. | New company review process is less observable and harder to manage at scale. |
| PS-004 | Future write actions such as change permission are high-risk if launched before tenant-switch auditability and read-only experience are stable. | Security and governance exposure. |
| PS-005 | Subscription and tenant-wide access governance are currently split across billing, role management, and runtime enforcement with no centralized superAdmin control plane. | Operations require manual intervention and risk inconsistent tenant access states. |
| PS-006 | Tenant-side role management can become unsafe if members are allowed to author permissions above the company owner's allowed ceiling. | Privilege escalation risk and inconsistent governance. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Give `SUPER_ADMIN` a safe company-wide operational view. | 100% of pending onboarding companies can be discovered and reviewed from the superAdmin company list. |
| Preserve tenant isolation while enabling support access. | 0 confirmed cross-company data leakage incidents caused by superAdmin access flow. |
| Make impersonation explicit and auditable. | 100% of impersonation sessions create audit entries with actor, target company, target organization, time, and mode. |
| Avoid unsafe premature mutation. | Phase 2 ships read-only mode first; Phase 3 write mode is gated behind explicit policy and audit. |
| Centralize tenant subscription and company permission governance. | 100% of subscription status/plan changes and owner-ceiling changes are auditable and no tenant-side role save can exceed current owner ceiling. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a superAdmin, I want to see a company list across SatuInbox so that I can manage onboarding and monitor tenants centrally. | 1. Given I am logged in as `SUPER_ADMIN`, When I open the super-admin page, Then I see a company list. 2. Given the list loads, When data is displayed, Then each row shows company name, onboarding status, created date, and owner information. |
| US-002 | P0 | As a superAdmin, I want to search companies so that I can find tenants quickly. | 1. Given the company list is open, When I search by company name, owner name, owner email, or company identifier, Then the result list filters accordingly. 2. Given no result matches, When search completes, Then I see an empty state rather than stale rows. |
| US-003 | P0 | As a superAdmin, I want new companies waiting for onboarding approval to be clearly highlighted so that I can prioritize review. | 1. Given a company is in waiting-approval state, When the list loads, Then the row shows a `Baru` or equivalent new-company badge/banner. 2. Given a company has already been reviewed, When the list loads, Then the company no longer appears as a new pending item. |
| US-004 | P0 | As a superAdmin, I want to approve or reject onboarding companies from the super-admin lane so that onboarding operations are centralized. | 1. Given a company is waiting approval, When I click approve, Then the company approval state updates successfully. 2. Given I reject the company, When the action succeeds, Then the rejection result is recorded and reflected in list/detail state. |
| US-005 | P1 | As a superAdmin, I want to impersonate a tenant in read-only mode so that I can inspect company data safely without mutating it. | 1. Given phase 2 is enabled, When I choose a target company and organization, Then the system creates a switched tenant session. 2. Given I enter impersonation mode, When the tenant UI loads, Then a visible banner states that I am viewing as the selected tenant in read-only mode. 3. Given I try a write action in read-only mode, When the action is blocked, Then I see a clear message that write mode is disabled. |
| US-006 | P1 | As a security/governance system, I want every impersonation access logged so that support access is traceable. | 1. Given a superAdmin starts impersonation, When the session is created, Then an audit entry is recorded. 2. Given a superAdmin exits impersonation, When the mode ends, Then an exit audit entry is recorded. |
| US-007 | P2 | As a superAdmin, I want a controlled write mode in a later phase so that I can perform specific support/admin actions like change permission when necessary. | 1. Given phase 3 is enabled, When I enter write mode for a tenant, Then the UI clearly marks the session as write-enabled. 2. Given I execute an allowed quick admin action such as change permission, When the action succeeds, Then it is fully audited with before/after values. 3. Given the action is outside the approved quick-action list, When I attempt it, Then the system blocks the action. |
| US-008 | P0 | As a superAdmin, I want to receive a one-time verification code by email when I log in so that access to the platform-admin surface has a second security factor. | 1. Given I submit valid superAdmin credentials, When credentials are accepted, Then a 6-digit code is emailed to my registered address and I am prompted to enter it. 2. Given a valid code already exists within its 24h window, When I request a code again, Then the same code is resent (not regenerated). 3. Given I enter the correct code, When it is verified, Then my platform-admin session is issued. 4. Given I enter an invalid or expired code, When verification fails, Then access is denied with a clear message. |
| US-009 | P0 | As a superAdmin, I want to change all subscription aspects of a company from the superAdmin page so that company access can be governed centrally from billing authority. | 1. Given I open a company from the superAdmin page, When I change plan, addon, active state, suspend/reactivate state, expiry, grace, quota, or other allowed subscription fields, Then the change is recorded through the subscription domain and auditable. 2. Given a subscription downgrade or disable removes access, When the change is accepted, Then feature access and permission envelope are cut according to policy. |
| US-010 | P0 | As a superAdmin, I want to manage company owner permission as the tenant-wide permission ceiling so that no member can exceed the owner’s allowed access. | 1. Given I edit company owner permission from superAdmin, When I lower the owner ceiling, Then member roles/permissions above that ceiling are scheduled for async rewrite. 2. Given I raise owner permission later, When the save succeeds, Then only owner permission increases and member permission does not auto-restore. |
| US-011 | P0 | As a tenant admin, I want tenant-side role management to show only permissions allowed by the owner ceiling so that I cannot over-authorize members. | 1. Given I open tenant-side role management, When the page loads, Then permissions not owned by the company owner are hidden. 2. Given I try to save stale data above the owner ceiling, When save runs, Then the request is blocked with a clear error. |

---

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access Model | FR-001 [P0]: Only `SUPER_ADMIN` MUST be allowed to access the super-admin lane. FR-002 [P0]: Normal Admin, Supervisor, Agent, or other tenant roles MUST NOT access the lane. FR-003 [P0]: The super-admin lane MUST be a dedicated surface, not an overload of existing tenant settings pages. |
| Company List and Search | FR-004 [P0]: System MUST provide a paginated company list for superAdmin. FR-005 [P0]: List rows MUST include company name, onboarding status, created date, and owner user identity at minimum. FR-006 [P0]: Search MUST support company name and owner identity fields. FR-007 [P0]: System SHOULD support server-side pagination and sorting. |
| New Company Highlighting | FR-008 [P0]: Companies with onboarding status `waiting_approval` MUST be clearly marked as pending/new. FR-009 [P0]: Super-admin list SHOULD surface a pending-company count or equivalent visibility aid. |
| Onboarding Approval Operations | FR-010 [P0]: SuperAdmin MUST be able to approve onboarding companies from the super-admin lane. FR-011 [P0]: SuperAdmin MUST be able to reject onboarding companies from the super-admin lane. FR-012 [P0]: Approval/rejection actions MUST use the existing company approval lifecycle and MUST NOT create a second inconsistent approval model. |
| Company Detail Support | FR-013 [P0]: Phase 1 SHOULD provide enough row or detail visibility for superAdmin to inspect owner and onboarding review context before approval. FR-014 [P1]: A company detail drawer or page MAY be added if required for approval context, but is not mandatory if the list interaction is sufficient. |
| Subscription Governance | FR-015 [P0]: SuperAdmin MUST be able to mutate all allowed subscription aspects from the superAdmin page. FR-016 [P0]: Subscription lifecycle ownership MUST remain in payment-service or billing domain; superAdmin acts as control surface only. FR-017 [P0]: Subscription state MUST be treated as the initial determinant of company feature access and permission envelope. FR-018 [P0]: Subscription downgrade or disable MUST cut company access according to policy. |
| Company Permission Governance | FR-019 [P0]: Company owner permission MUST act as the company-wide permission ceiling. FR-020 [P0]: Company owner permission MUST be editable only from the superAdmin page. FR-021 [P0]: Effective member access MUST NOT exceed both subscription access and owner ceiling. FR-022 [P0]: When owner ceiling is lowered, member roles/permissions above that ceiling MUST be rewritten asynchronously in persistent storage. FR-023 [P0]: When owner permission later increases, member permission MUST NOT auto-restore. FR-024 [P0]: Tenant-side role management MUST hide permissions not owned by the owner. FR-025 [P0]: Tenant-side role saves above owner ceiling MUST be blocked. |
| Phase 2 Impersonation and Propagation | FR-026 [P1]: System MUST support superAdmin tenant impersonation / switch context into a chosen company and organization. FR-027 [P1]: Impersonation MUST preserve the existing single-tenant downstream runtime model. FR-028 [P1]: Impersonation session MUST carry actor metadata identifying the real `SUPER_ADMIN` and the impersonated target tenant. FR-029 [P1]: Async rewrite worker/process MUST handle member role/permission propagation after owner/subscription downgrade. |
| Read-Only Enforcement | FR-030 [P1]: Phase 2 impersonation MUST default to read-only mode. FR-031 [P1]: In read-only mode, downstream write-capable actions MUST be blocked either by backend guard, frontend guard, or both. FR-032 [P1]: The UI MUST visibly show read-only impersonation mode. |
| Audit and Observability | FR-033 [P0]: Company approval and rejection actions MUST be audited. FR-034 [P1]: Impersonation start and end MUST be audited. FR-035 [P1]: Subscription mutations and owner-ceiling changes MUST be audited with before/after values and actor metadata. FR-036 [P1]: Async propagation runs MUST be traceable with status, failures, and retry visibility. |
| Controlled Operational Writes | FR-037 [P1]: Controlled operational writes beyond subscription and owner governance MUST remain allowlisted and explicitly auditable. FR-038 [P1]: Write mode MUST NOT silently grant unrestricted mutation rights beyond the allowlisted action set. |
| Non-Side Effects | FR-039 [P0]: Super-admin company list MUST NOT alter normal tenant user sessions except where explicit permission/subscription governance requires re-evaluation or invalidation. FR-040 [P1]: Impersonation MUST NOT remove tenant scoping from downstream services. |
| SuperAdmin Login Verification (2FA) | FR-041 [P0]: SuperAdmin login MUST require a one-time email verification code as a second factor after password validation. FR-042 [P0]: The code MUST be sent to the superAdmin's registered email using the configured `MAIL_FROM` sender. FR-043 [P0]: The code MUST remain valid for 24 hours. FR-044 [P0]: If a valid code already exists within its window, the system MUST resend the same code rather than generate a new one. FR-045 [P0]: A platform-admin session MUST NOT be issued until the code is verified. FR-046 [P1]: Code verification attempts MUST be rate-limited to resist brute force. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Unauthorized access | Block page access. | Show `Akses ditolak` or redirect to forbidden page. |
| EH-002 | Company list load failure | Show recoverable error state. | Show `Gagal memuat daftar company` and retry action. |
| EH-003 | Approval conflict | If company already approved/rejected elsewhere, do not create duplicate finalization. | Show stable conflict info and refresh current row state. |
| EH-004 | Impersonation target invalid | Block session creation if company/org mapping is invalid. | Show `Target company tidak valid`. |
| EH-005 | Read-only blocked write | Deny mutation in phase 2. | Show `Mode baca saja aktif. Aksi ini tidak diizinkan.` |
| EH-006 | Write mode denied | Block entry to write mode when policy or flag is disabled. | Show `Mode tulis belum tersedia`. |
| EH-007 | Invalid or expired login code | Deny session issuance. | Show `Kode verifikasi tidak valid atau kedaluwarsa` and allow resend. |
| EH-008 | Verification email send failure | Fail the login-code step recoverably. | Show `Gagal mengirim kode verifikasi. Coba lagi.` |
| EH-009 | Subscription mutation rejected | Block mutation and keep prior subscription/access state. | Show clear billing/governance error message. |
| EH-010 | Owner-ceiling save causes async rewrite failures | Accept source change but track failed member propagation explicitly. | Show governance update accepted with propagation warning if applicable. |
| EH-011 | Tenant-side role save above owner ceiling | Block save. | Show `Permission melebihi batas akses owner company`. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Company approval state changes while list is open. | List refresh or refetch updates row status without duplicate action. | Row state updates safely. |
| EC-002 | SuperAdmin starts impersonation for a company with multiple organizations. | System requires explicit organization target selection or applies a clearly defined default rule. | User must not enter ambiguous tenant context silently. |
| EC-003 | Read-only mode attempts action from existing tenant page that is normally writable. | Action is blocked and audited if needed. | Clear read-only message shown. |
| EC-004 | Two superAdmins review the same waiting-approval company concurrently. | First final decision wins; second sees up-to-date resolved state. | Avoid duplicate approval/rejection side effects. |
| EC-005 | Quick admin action is allowlisted in phase 3 for one module only. | Other non-allowlisted writes remain blocked. | UI must not imply universal write access. |
| EC-006 | Login code requested again while a valid code exists. | System resends the same code; no new code is generated and the 24h window is not reset by a resend. | User receives the identical code. |
| EC-007 | Login code entered after its 24h window expired. | Verification fails; a fresh code must be requested. | Clear expired-code message + resend option. |
| EC-008 | Owner ceiling is raised after previous downgrade. | Owner permission increases only; member permissions do not auto-restore. | UI must not imply automatic recovery. |
| EC-009 | Tenant-side role editor opens legacy role with over-ceiling permissions. | Disallowed permissions are hidden and save above ceiling is blocked or legacy state is flagged per policy. | Clear ceiling guidance shown. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Super-admin landing page | Dedicated domains `system.satuinbox.com` surface for platform admin operations. | SuperAdmin logs in and opens the platform-admin page. | US-001 |
| Company list table | Central list with company data and owner info. | SuperAdmin scans, filters, and opens target companies. | US-001, US-002 |
| New company badge/banner | Visual emphasis for companies waiting approval. | Pending companies appear highlighted. | US-003 |
| Approval action controls | Approve / reject actions for onboarding review. | SuperAdmin reviews row/detail and executes decision. | US-004 |
| Tenant impersonation entry | Action to enter target tenant context. | SuperAdmin selects company/org and starts read-only session. | US-005 |
| Impersonation banner | Visible banner across impersonated tenant UI. | SuperAdmin sees active tenant and mode (`read-only` / `write mode`). | US-005, US-007 |
| Write mode indicator | Strong warning style when write mode enabled in phase 3. | SuperAdmin must understand they are no longer read-only. | US-007 |
| Subscription governance panel | Company-level panel for plan, addon, state, and other subscription controls. | SuperAdmin opens company governance and mutates subscription via controlled form. | US-009 |
| Owner ceiling governance panel | Company-level panel for owner permission ceiling management. | SuperAdmin opens company governance and edits owner permission. | US-010 |

**UI Copy Notes (Bahasa Indonesia):**
- `Daftar Company`
- `Company baru`
- `Menunggu approval`
- `Setujui onboarding`
- `Tolak onboarding`
- `Masuk sebagai tenant ini`
- `Mode baca saja`
- `Mode tulis`

---

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| companyId | String | `cmp_123` | Must be valid company ID from company-service | Yes | None |
| organizationId | String | `org_456` | Must be valid organization ID under selected company | Conditional | None |
| ownerUserName | String | `Dany Christian` | Display field from owner/company metadata | Yes | None |
| onboardingStatus | Enum | `waiting_approval` | Must map to valid onboarding status set | Yes | None |
| impersonationMode | Enum | `read_only` | Must be `read_only` or `write_mode` | Yes | `read_only` |
| quickActionType | Enum | `change_permission` | Must be in allowlist when phase 3 is enabled | Conditional | None |
| loginCode | String (numeric) | `483920` | 6 digits; must match the cached code for the user; valid 24h | Yes (superAdmin login) | None |
| subscriptionMutationType | Enum | `change_plan` | Must be one of allowed subscription mutation types | Yes when mutating subscription |
| ownerPermissionCeiling | Derived permission set | Current effective owner permission that acts as company ceiling | System field |

---

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Company list/search SHOULD load within 3 seconds for normal operational scale. |
| Reliability | Approval/rejection actions MUST remain idempotent and safe under retry. |
| Security | Impersonation MUST preserve tenant scoping and actor traceability. |
| Privacy | Company list MUST expose only the data needed for platform-admin operations. |
| Observability | All super-admin approval, rejection, impersonation, and write-mode actions MUST emit structured logs with correlation IDs. |
| Auditability | Platform-admin actions MUST be reviewable after the fact. |
| Security (login) | SuperAdmin login MUST require an email verification code (2FA) valid for 24h, reused-if-present, delivered via `MAIL_FROM`; verification MUST be rate-limited to resist brute force. |
| Consistency | Access resolution and tenant-side permission authoring MUST use the same owner-ceiling and subscription-entitlement source of truth. |

---

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Company list API exposure | Engineering | FE cannot render platform-admin list without gateway route | Add dedicated API Gateway exposure for company list/search |
| Tenant session switching contract | Engineering / Security | Unsafe impersonation if contract is vague | Define explicit switched-session token shape |
| Read-only enforcement coverage | Engineering | Hidden write paths may still mutate data | Enforce at backend and review critical FE write entry points |
| Write mode scope creep | Product / Security | Phase 3 can become too broad | Allowlist quick actions and phase-gate them |
| Async propagation failure | Engineering / Security | Company owner/subscription change may leave partial member rewrite state | Define worker status, retry, and operator visibility |

---

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Pending onboarding company review visibility | 100% of waiting-approval companies visible in super-admin queue | First 30 days | Company list audits |
| Impersonation audit coverage | 100% of impersonation sessions logged | Ongoing | Audit log |
| Cross-company data leakage incidents | 0 | Ongoing | Security incident log |
| Read-only blocked write attempts correctly denied | 100% of sampled attempts | First 30 days after phase 2 | Security / QA validation |
| Owner-ceiling violations saved from tenant-side UI | 0 | Ongoing | Audit/security logs |

---

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Company detail audit panel | Gives richer review context per tenant. |
| Additional quick admin actions | Support/billing/member tooling can expand after write-mode foundation is proven safe. |
| Cross-tenant support notes | Helps support teams leave platform-admin annotations. |
| Platform-admin analytics | Useful for governance and operational load monitoring. |

---

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Phase 1 does not include impersonation. | SuperAdmin can review companies and govern subscription/owner ceiling but cannot inspect tenant UI yet. |
| Phase 2 uses async propagation for member rewrite. | Effective state may require monitored completion rather than instant full persistence across all members. |
| Owner permission increase does not auto-restore member permissions. | Re-grant remains explicit and manual unless future restore flow is introduced. |

---

## **16. Appendix**

| Item | Notes |
| ----- | ----- |
| Glossary | `Impersonation` = switched tenant context while preserving real actor identity. `Read-only mode` = tenant UI inspection without mutation rights. |
| Assumptions | Existing company approval endpoints are reused for phase 1. Existing runtime remains single-tenant downstream. |
| Open Questions | Exact owner data fields shown in company list, explicit default organization selection rule, exact subscription mutation list, async propagation behavior, and owner special-role semantics. |
| References | `Assessments/cross-domain/referral-subscription-and-superadmin-global-access/referral-subscription-and-superadmin-global-access-qa-assessment.md`, `PRD/Auth/PRD Setting - activate-deactivate-member.md`, `PRD/Company n people/PRD Setting - Role management.md` |

---

## **17. State Transition Model**

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Company Review Item | `waiting_approval` | SuperAdmin approves company | `approved` | SUPER_ADMIN | Company is still pending | Company approval lifecycle updates | `superadmin_company_approved` |
| Company Review Item | `waiting_approval` | SuperAdmin rejects company | `rejected` | SUPER_ADMIN | Company is still pending | Company rejection lifecycle updates | `superadmin_company_rejected` |
| SuperAdmin Session | `normal_superadmin` | Start impersonation | `impersonating_read_only` | SUPER_ADMIN | Valid target company/org | Switched tenant session issued | `superadmin_impersonation_started` |
| SuperAdmin Session | `impersonating_read_only` | Exit impersonation | `normal_superadmin` | SUPER_ADMIN | Session active | Return to platform-admin context | `superadmin_impersonation_ended` |
| SuperAdmin Session | `impersonating_read_only` | Enable write mode (phase 3) | `impersonating_write_mode` | SUPER_ADMIN | Feature flag enabled and action allowlist policy satisfied | Write mode warning/banner active | `superadmin_write_mode_enabled` |
| SuperAdmin Session | `impersonating_write_mode` | Disable write mode / exit | `impersonating_read_only` or `normal_superadmin` | SUPER_ADMIN | Session active | Write rights removed | `superadmin_write_mode_disabled` |

---

## **18. Permission Matrix**

| Role | View Company List | Search Company | Approve/Reject Onboarding | Impersonate Read-Only | Enable Write Mode | Execute Quick Admin Actions | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| SUPER_ADMIN | Allowed | Allowed | Allowed | Allowed (phase 2) | Allowed by explicit policy only (phase 3) | Allowlisted only | Dedicated platform-admin role |
| Tenant Admin | Denied | Denied | Denied | Denied | Denied | Denied | No cross-company access |
| Supervisor / Agent / Others | Denied | Denied | Denied | Denied | Denied | Denied | No cross-company access |

---

## **19. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Company list fetch | `GET /system/companies` | FE super-admin page | API Gateway / company-service | search, pagination, filters | paginated company list with owner fields | `forbidden`, `load_failed` | New route |
| Company approval | `POST /system/companies/:id/approve` | FE super-admin page | API Gateway / company-service | companyId + actor context | success | `conflict`, `not_found`, `forbidden` | Reuses existing company approval lifecycle |
| Company rejection | `POST /system/companies/:id/reject` | FE super-admin page | API Gateway / company-service | companyId + reason + actor context | success | `conflict`, `not_found`, `forbidden` | Reuses existing company rejection lifecycle |
| Subscription mutation | `POST /system/companies/:id/subscription-actions/:action` | FE super-admin page | API Gateway / payment-service | companyId + mutation payload | success/failure | `forbidden`, `invalid_mutation`, `conflict` | SuperAdmin control surface; payment-service remains source of truth |
| Owner ceiling mutation | `POST /system/companies/:id/owner-permission` | FE super-admin page | API Gateway / auth-service / people-service | companyId + owner permission payload | accepted / propagation status | `forbidden`, `invalid_permission` | Triggers async member rewrite when ceiling lowered |
| Start impersonation | `POST /system/impersonation/start` | FE super-admin page | API Gateway / auth-service | target companyId, organizationId | switched tenant session/token | `invalid_target`, `forbidden` | New route |
| End impersonation | `POST /system/impersonation/end` | FE tenant view | API Gateway / auth-service | current impersonation session | restored super-admin context | `not_impersonating` | New route |
| Quick action write | `POST /system/quick-actions/:action` | FE tenant/admin shell | API Gateway / target service | allowlisted action payload | success/failure | `write_mode_disabled`, `action_not_allowed`, `forbidden` | Phase 3 only |
| Request login code | `POST /system/auth/request-code` | FE system login | API Gateway / auth-service | identifier + password | `{ sent, maskedEmail, expiresInSec }` | `forbidden`, `email_send_failed` | New route; public (pre-auth), rate-limited |
| SuperAdmin login (code) | `POST /system/auth/login` | FE system login | API Gateway / auth-service | identifier + password + code | platform-admin session/token | `invalid_code`, `code_expired`, `forbidden` | New route; replaces plain `/auth/login` for the system app |

---

## **20. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| Phase 1 company list | Expose company list/search route for superAdmin only | Engineering | Verify rows, owner data, pending status, approve/reject actions | Disable route and FE entry |
| Phase 2 impersonation | Add switched-session contract and read-only enforcement | Engineering / Security | Validate banner, tenant scope, blocked writes | Disable impersonation route/flag |
| Phase 3 write mode | Add allowlisted quick actions one by one | Engineering / Security / Product | Validate audits and before/after logs per action | Disable write mode flag or action allowlist |
| Feature flags | Separate flags per phase | Product / Engineering | Internal rollout first | Turn off flag per phase |

---

## **21. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Company list cache/query result | company-service / gateway | System | Short-lived operational cache | Auto-expire | Not exportable by tenant users | Contains company/owner operational metadata |
| Impersonation audit log | audit/security layer | System | Long-term audit retention | Immutable preferred | Internal audit export only | Must preserve actor and target tenant |
| Write-mode action audit log | audit/security layer | System | Long-term audit retention | Immutable preferred | Internal only | Must include before/after values |

---

## **22. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Backend Metric | `superadmin_company_list_fetch_total` | Company list fetched | actorId, resultCount | Engineering | Monitor failure rate |
| Audit Event | `superadmin_company_review_action` | Approve or reject onboarding | actorId, companyId, action, result | Security / Engineering | Required |
| Audit Event | `superadmin_impersonation_started` | Start impersonation | actorId, companyId, organizationId, mode | Security / Engineering | Required |
| Audit Event | `superadmin_impersonation_ended` | End impersonation | actorId, companyId, organizationId | Security / Engineering | Required |
| Backend Metric | `superadmin_readonly_block_total` | Write attempt blocked in read-only mode | actorId, route, action | Engineering | Alert if unexpected spikes |
| Audit Event | `superadmin_write_action_executed` | Quick write action succeeds | actorId, actionType, targetTenant | Security / Engineering | Required |

---

## **23. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| Two superAdmins approve same company concurrently | Duplicate approval side effect | Only one final approval succeeds; second sees current resolved state | Concurrent approve test |
| Impersonation session opened in multiple tabs | Context confusion | System MUST keep actor + target metadata unambiguous per session/tab strategy | Multi-tab test |
| Read-only mode UI misses a hidden write path | Unauthorized mutation | Backend MUST enforce read-only guard for protected writes, not FE only | Negative mutation test |
| Quick action retried | Duplicate mutation | Phase-3 quick actions MUST define idempotency or safe retry behavior where relevant | Retry test per action |
