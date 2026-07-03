# Change Intake Brief: SuperAdmin Global Company Access and Tenant Impersonation

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `User request in chat to expand SuperAdmin scope so SatuInbox subscription and permissions can be managed dynamically from the superAdmin page, including company-level permissions rather than only per-user permissions. Final clarification lock: subscription is the initial determinant of company access, including feature access and permission; resolver must update feature access and permission dynamically; if owner or subscription permission drops, system must rewrite member permission/role in database asynchronously; tenant-side save above owner ceiling must be blocked and unavailable permissions must not be shown; if owner permission later rises, only owner permission rises (member permission does not auto-restore); superAdmin may change all subscription aspects; owner/company-level permission may only be changed from superAdmin page. User routing decision: patch role-management behavior into Roles Management & Custom RBAC PRD, while subscription and superAdmin stay combined in one PRD split into two phases.`  
> **Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-change-intake-brief.md`  
> **Version:** `v1.6`  
> **Previous Version:** `Assessments/auth/superadmin-global-company-access/versions/superadmin-global-company-access-change-intake-brief-v1.5.md`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `PRD/Company n people/PRD Setting - Role management.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`  
> **Tanggal Intake:** 2026-06-22  
> **Status:** Scoped

---

## 0. Ringkasan Update Brief

- Versi sebelumnya sudah mengunci async rewrite, no auto-restore, hidden permissions, dan block-save di atas owner ceiling.
- User sekarang mengunci routing artifact:
  - hal yang berhubungan dengan role management dipatch ke PRD `Roles Management & Custom RBAC`
  - subscription + superAdmin governance tetap digabung dalam **1 PRD** dan dibagi **2 phase pengerjaan**
- Dengan routing baru ini, change set sudah cukup siap untuk patch lintas PRD yang terarah.

---

## 1. Request Snapshot

**Request Summary:**
User wants a superAdmin control surface that can manage tenant subscription and company-level permissions dynamically. Subscription becomes the initial determinant of company access, including feature access and permission. Company owner permission acts as the company ceiling, and all members must always remain at or below that owner permission. If owner/subscription drops, the system must asynchronously rewrite member role/permission in the database. Tenant-side permission UI must hide permissions not owned by the owner, and tenant-side attempts to save above owner ceiling must be blocked. If owner permission later rises, only owner permission rises; member permission is not auto-restored. Role-management-specific behavior must be patched into the existing Roles Management PRD, while superAdmin + subscription stay combined in one phased PRD.

**Business Problem:**
Current PRD set does not yet define a centralized persisted governance model for combining subscription entitlement, company-wide permission ceiling, member permission propagation, and tenant-side authoring constraints, nor does it place those behaviors into the right artifact boundaries.

**Target User / Role / Stakeholder:**
- `SUPER_ADMIN`
- PM / Analyst / Security / Billing / BE / FE
- indirectly affected: tenant Admins, company owners, members, billing/finance ops

**Expected Outcome:**
Define a safe PRD patch set where:
- combined SuperAdmin PRD covers subscription governance + centralized company access governance in two phases
- Role Management PRD covers hidden options, blocked save, and owner-ceiling-aware role authoring behavior
- access contract remains consistent across subscription, owner ceiling, and member role permission

**Urgency / Why Now:**
User explicitly wants analysis first, then targeted PRD patching without creating duplicate PRDs.

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
- Request still spans billing/subscription control, company-level governance, persisted async member-permission propagation, and tenant-side role-authoring constraints.
- However, user has now clarified artifact routing, so the split is no longer about whether to split, but **where each concern belongs**.
- Existing role-management PRD is the right place for owner-ceiling-aware authoring constraints.
- Existing superAdmin PRD remains the right place for centralized governance and subscription control, but must be phased.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `PRD/Company n people/PRD Setting - Role management.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md` |
| PRD status | Existing / Partial overlap |
| PRD treatment candidate | Patch existing PRDs |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Partial | FE has route marker for `super-admin`, tenant settings role-management UI, and many page surfaces gated by `RolesGuard permission=...`. No evidence found yet of a company-level superAdmin entitlement editor or billing-admin UI in component search. |
| BE | Partial | Backend has role CRUD/update-permission flows in auth-service and member role update in people-service. Payment-service owns subscription lifecycle. Current runtime propagates `companyId + organizationId`; auth-service force-logs-out users on member role change events. |
| Runtime / Current Behavior | Partial / fragmented | User/member permissions are role-driven. Subscription exists in payment-service. No confirmed unified company-level capability resolver, persisted async downward-propagation model, or tenant-side hidden-permission authoring model controlled by superAdmin was evidenced from current scan. |

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
- Patch combined SuperAdmin PRD for:
  - all subscription mutations
  - subscription as initial determinant of access
  - owner-derived company ceiling governance
  - async propagated downward rewrite behavior
  - two-phase delivery plan
- Patch Role Management PRD for:
  - hidden permissions not owned by owner
  - blocked save above owner ceiling
  - owner-ceiling-aware role authoring
  - legacy over-ceiling handling notes if needed

### 4.2 Out of Scope
- Creating a brand-new PRD for subscription governance
- Implementing code changes
- Defining final UI wireframe
- Replacing tenant role-management PRD entirely

### 4.3 Protected Existing Behavior
- Payment/subscription lifecycle must remain owned by payment-service; no raw DB mutation shortcut.
- Tenant scoping and auditability must remain mandatory.
- Existing member role-management model must stay meaningful, even if its stored output is rewritten by centralized governance rules.
- Existing 3-phase superAdmin roadmap will be reframed into two phases for this expanded scope, not silently collapsed into unrestricted write mode.
- Member permission must never exceed company owner effective permission.
- Owner permission increase must not silently re-grant removed member permissions unless a future restore flow is explicitly introduced.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Subscription lifecycle now directly participates in effective access resolution and persisted permission changes. |
| RBAC / visibility / assignment | Yes | Owner-derived ceiling changes how member permissions are constrained, stored, updated, and authorable. |
| API / webhook / socket / queue / cron | Yes | Payment-service, auth-service, people-service, and FE session guards likely need contract changes. |
| SLA / reporting / export | Possible | If subscription or company access disables modules, reporting/export visibility changes indirectly. |
| Migration / rollback / feature flag | Yes | Existing companies need safe defaults, backfill, and rollback path. |
| Existing regression scope | Yes | Billing, login/session, permission resolution, stored role propagation, tenant-side role editing, module visibility, and support tooling all affected. |

### Early Blast-Radius Notes
- Combined SuperAdmin PRD must now cover centralized governance plus subscription mutation.
- Role Management PRD must explicitly stop presenting out-of-ceiling permissions to tenant-side admins.
- The user has locked a persisted async resolver + propagation model:
  `subscription access` ∩ `owner ceiling` ∩ `member role permission`

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Patch `PRD Setting - Role management.md` and patch combined `PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` |
| Can Proceed to PRD? | Yes |

### Routing Rationale
- Core semantics are sufficiently locked.
- User has chosen exact artifact routing.
- The next correct step is targeted PRD patching, not more discovery-first splitting.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Apakah final resolver order benar diperlakukan sebagai `subscription access ∩ owner ceiling ∩ member role permission`? | This is the core runtime contract | Yes | User / PM / Analyst / BE |
| OQ-02 | “Semua” aspect subscription itu tepatnya mencakup apa saja: plan, addon, active/inactive, suspend/reactivate, expiry, grace, quota, voucher/override entitlement? | Financial/commercial boundary and audit scope | Yes | User / PM / Billing |
| OQ-03 | Async rewrite worker behavior: batching, retry, failure visibility, and partial-failure policy bagaimana? | Operational safety and user consistency | Yes | PM / BE |
| OQ-04 | Bila tenant-side role editor membuka role existing yang sudah melebihi owner ceiling karena legacy data, apakah UI auto-strip sebelum save atau hanya block until adjusted? | UX and migration handling | Yes | PM / FE / BE |
| OQ-05 | Need explicit product decision whether owner itself is a special protected role or simply a user whose permission set is superAdmin-managed. | Affects data model and UX language | Yes | PM / Analyst |
| OQ-06 | Two phases for combined SuperAdmin+Subscription PRD need exact boundary. | Needed for clean PRD patch | Yes | User / PM |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Pending | Need exact subscription mutation list and phase boundary |
| Stakeholder / Business User | Business intent confirmation | Pending | Core contract is mostly locked; remaining points are operational detail |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Needed for async rewrite, hidden-option UI, and mutation orchestration |
| Billing / Security | Governance and override policy | Pending | Required because subscription state becomes both access determinant and destructive rewrite trigger |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` | Patch as combined superAdmin + subscription governance PRD with two phases |
| Related PRD | `PRD/Company n people/PRD Setting - Role management.md` | Patch because centralized owner ceiling changes visible options, blocked save behavior, and legacy handling |
| Related PRD | `PRD/Subscription/PRD Prepaid Billing and Subscription.md` | Reference source for subscription semantics; no direct patch if user keeps it merged into superAdmin PRD |
| Assessment Report | `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md` | Revise after PRD patch plan is applied |
| Related Assessment | `Assessments/company-n-people/roles-management-custom-rbac/roles-management-custom-rbac-qa-assessment.md` | Revise if role-management PRD patch changes governance decision materially |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial brief created for PRD patch based on downloaded superAdmin PRD changes | Hermes |
| 2026-06-22 | Updated brief for new request: dynamic subscription and company-level permission management from superAdmin page | Hermes |
| 2026-06-22 | Updated brief with user clarification: must handle option A/B/C, subscription remains control surface, and company permission may derive from company owner permission ceiling | Hermes |
| 2026-06-22 | Updated brief with latest clarification: subscription is initial access determinant, owner downgrade must propagate to members, and superAdmin page is owner/company permission control surface | Hermes |
| 2026-06-22 | Updated brief with hard lock: member role/permission rewrite is persisted in DB, subscription downgrade also cuts permission, all subscription aspects are in scope, and owner/company permission changes are superAdmin-only | Hermes |
| 2026-06-22 | Updated brief with final propagation lock: async rewrite, no auto-restore on owner increase, tenant-side hidden options + block-save above owner ceiling | Hermes |
| 2026-06-22 | Updated routing: patch role-management behavior in existing RBAC PRD and keep subscription+superAdmin combined in one phased PRD | Hermes |
