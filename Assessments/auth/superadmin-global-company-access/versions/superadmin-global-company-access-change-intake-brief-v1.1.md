# Change Intake Brief: SuperAdmin Global Company Access and Tenant Impersonation

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `User request in chat to expand SuperAdmin scope so SatuInbox subscription and permissions can be managed dynamically from the superAdmin page, including company-level permissions rather than only per-user permissions.`  
> **Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-change-intake-brief.md`  
> **Version:** `v1.1`  
> **Previous Version:** `Assessments/auth/superadmin-global-company-access/versions/superadmin-global-company-access-change-intake-brief-v1.0.md`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `PRD/Company n people/PRD Setting - Role management.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`  
> **Tanggal Intake:** 2026-06-22  
> **Status:** Hold

---

## 0. Ringkasan Update Brief

- Versi sebelumnya fokus pada patch PRD superAdmin untuk 2FA login, namespace `/system/*`, dan arah surface `system.satuinbox.com`.
- Versi ini menambahkan refinement baru: superAdmin harus bisa mengatur **subscription** dan **permission** secara dinamis dari halaman superAdmin.
- Perubahan ini bukan sekadar quick admin action per-user. Scope sekarang meluas ke **company-level entitlement / permission model**, sehingga blast radius naik ke billing, RBAC, auth/session, dan tenant capability gating.
- Routing berubah dari `ROUTE_PATCH_EXISTING_PRD` sederhana menjadi **belum siap langsung patch PRD** karena requirement inti masih ambigu di area “permission milik company” dan hubungan permission vs subscription belum terkunci.

---

## 1. Request Snapshot

**Request Summary:**
User wants analysis first before changing the SuperAdmin PRD so superAdmin can dynamically manage SatuInbox subscription and permissions, including changing permission owned by the company itself, not only per-user permission.

**Business Problem:**
Current superAdmin direction covers company list, onboarding approval, impersonation, audit, and future write mode, but it does not yet define a governance model for platform-level entitlement changes such as subscription state and company-wide capabilities. Without this, internal operations still need engineering/manual intervention to adjust tenant commercial access or tenant-level feature access.

**Target User / Role / Stakeholder:**
- `SUPER_ADMIN`
- PM / Analyst / Security / Billing / BE / FE
- indirectly affected: tenant Admins, members, billing/finance ops

**Expected Outcome:**
Clarify whether superAdmin should gain a controlled company-level control plane for:
- subscription state / plan / addon / billing entitlement
- company-level permissions or capability flags
- possible downstream effect on user permissions and visible modules

**Urgency / Why Now:**
User explicitly wants this capability from the superAdmin page and asked for analysis first. This is high-risk because it changes governance boundaries across billing and RBAC.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `MIXED_REQUEST` |
| Primary Domain | `Auth` |
| Request Shape | Change |
| Initial Complexity Signal | Critical |
| Needs Split? | Yes |

### Classification Rationale
- This is not one simple additive action.
- The request mixes at least two major capability classes:
  1. **subscription / commercial entitlement management**
  2. **company-level permission / capability management**
- Existing role-management PRD is centered on **role-based user/member access**, while the new ask introduces **tenant/company-level control**.
- Existing billing/subscription PRD is centered on onboarding, invoices, addons, tokens, and voucher/billing lifecycle, not global platform-admin override tooling.
- Because the request also says the goal is **not only** changing user permission, the company-level model must be clarified first before patching the superAdmin PRD.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `PRD/Company n people/PRD Setting - Role management.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md` |
| PRD status | Existing / Partial overlap |
| PRD treatment candidate | Split then patch / addendum |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Partial | FE has route marker for `super-admin`, settings role-management UI exists under tenant settings, and many page surfaces are gated by `RolesGuard permission=...`. No evidence found yet of a company-level superAdmin entitlement editor or billing-admin UI in component search. |
| BE | Partial | Backend has role CRUD/update-permission flows in auth-service and member role update in people-service. Payment-service owns `subscription.service.ts`. Current runtime propagates `companyId + organizationId` and auth-service force-logs-out users on member role change events. |
| Runtime / Current Behavior | Partial / fragmented | User/member permissions are role-driven. Subscription exists in payment-service. No confirmed unified company-level capability layer controlled by superAdmin was evidenced from current scan. |

### 3.3 Related Sources
- `Memory/global-memory.md`: super admin bypasses restrictions, tenant scoping remains mandatory
- `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`: current superAdmin roadmap
- `PRD/Company n people/PRD Setting - Role management.md`: current user/member role & RBAC baseline
- `PRD/Subscription/PRD Prepaid Billing and Subscription.md`: current subscription/billing baseline
- `Memory/CLAUDE-be.md`: auth-service, people-service, payment-service ownership
- `Memory/CLAUDE-fe.md`: NextAuth session, RolesGuard, route/layout boundaries

---

## 4. Scope Boundary

### 4.1 In Scope
- Analyze whether superAdmin should manage **subscription state / plan / addon / entitlement** from the superAdmin surface.
- Analyze whether superAdmin should manage **company-level permission/capability** separate from per-user role permission.
- Identify whether this should be modeled as:
  - billing entitlement
  - tenant feature flags / capability matrix
  - role mutation shortcut
  - or combination of these with clear boundaries.
- Identify impacted services, session model, audit, and rollback needs.

### 4.2 Out of Scope
- Final PRD patch in this turn.
- Implementing code changes.
- Defining exact UI layout for all new controls.
- Replacing tenant role-management PRD entirely.

### 4.3 Protected Existing Behavior
- Current role-management model for members/users must remain valid unless explicitly changed.
- Existing 3-phase superAdmin roadmap must not be silently collapsed into unrestricted write mode.
- Payment/subscription lifecycle must remain owned by payment-service; no raw DB mutation shortcut.
- Tenant scoping and auditability must remain mandatory.
- Existing member role changes already have session-side effects; any new company-level permission model must not silently bypass those safeguards.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Subscription lifecycle and tenant capability gating are shared behavior. |
| RBAC / visibility / assignment | Yes | New company-level permission model can overlap/conflict with role-level permission model. |
| API / webhook / socket / queue / cron | Yes | Payment-service, auth-service, people-service, and FE session guards likely need contract changes. |
| SLA / reporting / export | Possible | If company-level permission hides modules, reporting/export visibility can change indirectly. |
| Migration / rollback / feature flag | Yes | Existing companies need safe defaults and rollback path. |
| Existing regression scope | Yes | Billing, login/session, permission resolution, module visibility, and support tooling all affected. |

### Early Blast-Radius Notes
- This request likely needs a **resolver chain** decision: subscription entitlement vs company capability vs role permission vs user assignment.
- If “permission company” means module availability, this can be a different layer from user role permissions and must not be jammed into role editor logic.
- If superAdmin can change subscription and company capabilities directly, audit, versioning, and rollback become mandatory.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `HOLD_NEEDS_DISCOVERY` |
| Recommended Next Rules | `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Analysis / scope clarification first, then split into PRD patches if user confirms direction |
| Can Proceed to PRD? | No |

### Routing Rationale
- Request intent is clear at a high level, but core model is still ambiguous.
- “Permission milik company” can mean several very different things:
  1. company-level feature entitlements
  2. company-wide permission presets pushed into all roles
  3. billing-driven module enable/disable
  4. explicit tenant capability flags independent from billing and roles
- Patching PRD now would risk mixing billing, RBAC, and entitlement concerns into one vague write-mode section.
- Safer route: analyze and likely split into at least two subtracks before PRD patching.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | “Permission milik company” maksudnya apa tepatnya: feature/module entitlement, capability flags, atau template default untuk semua user role? | This decides data model and resolver chain | Yes | User / PM / Analyst |
| OQ-02 | Apakah subscription menentukan permission company secara otomatis, atau superAdmin boleh override manual? | Billing-to-permission coupling risk | Yes | User / PM / Billing / Security |
| OQ-03 | Jika company permission berubah, apakah semua role/user langsung ikut berubah atau hanya visibility layer di atas role existing? | Session invalidation and enforcement scope | Yes | User / PM / BE |
| OQ-04 | Apakah superAdmin boleh mengubah plan/addon/subscription status langsung, atau hanya grant temporary override / capability? | Financial/commercial risk | Yes | User / PM / Billing |
| OQ-05 | Perubahan ini masuk phase 3 write mode saja, atau harus jadi phase tersendiri setelah phase 2? | Roadmap safety and PRD structure | Yes | User / PM |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Pending | Need semantic lock for company-level permission meaning |
| Stakeholder / Business User | Business intent confirmation | Pending | User asked for analysis first; requirement not yet locked |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Needed after semantic model is clarified |
| Billing / Security | Governance and override policy | Pending | Required if superAdmin can mutate subscription or company entitlements |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` | Only after scope is clarified; likely patch with split sections or phase extension |
| Related PRD | `PRD/Company n people/PRD Setting - Role management.md` | May need relation notes or patch if company-level permission affects role resolver |
| Related PRD | `PRD/Subscription/PRD Prepaid Billing and Subscription.md` | May need relation notes or patch if subscription becomes superAdmin-mutable |
| Assessment Report | `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md` | Will need revision after semantic lock |
| QA / Automation | `TBD` | Depends on whether scope splits into billing + entitlement tracks |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial brief created for PRD patch based on downloaded superAdmin PRD changes | Hermes |
| 2026-06-22 | Updated brief for new request: dynamic subscription and company-level permission management from superAdmin page | Hermes |
