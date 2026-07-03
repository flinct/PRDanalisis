# Change Intake Brief: SuperAdmin Global Company Access and Tenant Impersonation

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `User request in chat to expand SuperAdmin scope so SatuInbox subscription and permissions can be managed dynamically from the superAdmin page, including company-level permissions rather than only per-user permissions. Clarification: subscription is the initial determinant of company access, including feature access and permission; resolver must update feature access and permission dynamically; if owner permission drops, all members must follow; superAdmin page is the place to change owner/company-level permission and subscription.`  
> **Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-change-intake-brief.md`  
> **Version:** `v1.3`  
> **Previous Version:** `Assessments/auth/superadmin-global-company-access/versions/superadmin-global-company-access-change-intake-brief-v1.2.md`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `PRD/Company n people/PRD Setting - Role management.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`  
> **Tanggal Intake:** 2026-06-22  
> **Status:** Hold

---

## 0. Ringkasan Update Brief

- Versi sebelumnya sudah menangkap bahwa system harus handle A/B/C dan owner permission berfungsi sebagai company ceiling.
- Klarifikasi terbaru dari user sekarang mengunci hal-hal penting berikut:
  - **subscription adalah penentu awal company access**, termasuk access feature dan permission
  - resolver harus **mengupdate feature access dan permission secara dinamis**
  - jika **owner permission turun, member harus ikut turun**
  - halaman untuk mengubah owner/company-level permission adalah **halaman superAdmin**
  - subscription control dari superAdmin harus bisa **change** dan **enable/disable**
- Dengan lock baru ini, arah model makin jelas: system membutuhkan **dynamic effective-access resolver** berbasis subscription → owner ceiling → member permission.
- Walau semantic makin jelas, requirement tetap high-risk dan belum aman langsung dipatch ke PRD tanpa mengunci perilaku downgrade, propagation, dan boundary antara billing state vs permission state.

---

## 1. Request Snapshot

**Request Summary:**
User wants a superAdmin control surface that can manage tenant subscription and company-level permissions dynamically. Subscription becomes the initial determinant of company access, including feature access and permission. Company owner permission acts as the company ceiling, and all members must always remain at or below that owner permission. Changes happen from the superAdmin page.

**Business Problem:**
Current superAdmin direction does not yet define a runtime governance model for combining subscription entitlement, company-wide permission ceiling, and member permission enforcement. Internal operations need a safe way to control tenant access and company-wide capability without manual engineering intervention or per-user ad hoc adjustments.

**Target User / Role / Stakeholder:**
- `SUPER_ADMIN`
- PM / Analyst / Security / Billing / BE / FE
- indirectly affected: tenant Admins, company owners, members, billing/finance ops

**Expected Outcome:**
Define a safe superAdmin capability model where:
- superAdmin can change, disable, or enable tenant subscription
- subscription determines initial company access surface
- owner permission defines company-wide ceiling
- member permissions dynamically follow both subscription access and owner ceiling

**Urgency / Why Now:**
User explicitly wants analysis first, and the clarification now turns this into a hard governance/runtime contract change rather than a generic admin enhancement.

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
- Request spans billing/subscription control, company-level governance, and member-permission propagation.
- This changes effective access resolution across tenant, role, and billing domains.
- Existing role-management PRD remains role-centric; new ask introduces a dynamic company ceiling and billing-first access gate.
- Existing billing/subscription PRD remains payment-service-centric; new ask adds superAdmin operational control over subscription state/change actions.
- Even if surfaced from one page, this is still a multi-track system change.

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
| FE | Partial | FE has route marker for `super-admin`, tenant settings role-management UI, and many page surfaces gated by `RolesGuard permission=...`. No evidence found yet of a company-level superAdmin entitlement editor or billing-admin UI in component search. |
| BE | Partial | Backend has role CRUD/update-permission flows in auth-service and member role update in people-service. Payment-service owns subscription lifecycle. Current runtime propagates `companyId + organizationId`; auth-service force-logs-out users on member role change events. |
| Runtime / Current Behavior | Partial / fragmented | User/member permissions are role-driven. Subscription exists in payment-service. No confirmed unified company-level capability resolver controlled by superAdmin was evidenced from current scan. |

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
- Analyze superAdmin control surface for **change / disable / enable subscription**.
- Analyze access resolver where **subscription is initial determinant** of company access, including feature access and permission envelope.
- Analyze **owner-derived company permission ceiling**.
- Analyze **member permission propagation** when owner permission changes downward.
- Identify impacted services, session model, audit, rollback, and resolver-order needs.

### 4.2 Out of Scope
- Final PRD patch in this turn.
- Implementing code changes.
- Defining final UI wireframe.
- Replacing tenant role-management PRD entirely.
- Rewriting billing commercial model beyond superAdmin control actions.

### 4.3 Protected Existing Behavior
- Payment/subscription lifecycle must remain owned by payment-service; no raw DB mutation shortcut.
- Tenant scoping and auditability must remain mandatory.
- Existing member role-management model must stay meaningful, even if its effective output becomes capped by owner/company access.
- Existing 3-phase superAdmin roadmap must not be silently collapsed into unrestricted write mode.
- Member permission must never exceed company owner effective permission.
- Subscription disable must not silently mutate unrelated tenant data beyond access/capability consequences explicitly defined by policy.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Subscription lifecycle now directly participates in effective access resolution. |
| RBAC / visibility / assignment | Yes | Owner-derived ceiling changes how member permissions are constrained and updated. |
| API / webhook / socket / queue / cron | Yes | Payment-service, auth-service, people-service, and FE session guards likely need contract changes. |
| SLA / reporting / export | Possible | If subscription or company access disables modules, reporting/export visibility changes indirectly. |
| Migration / rollback / feature flag | Yes | Existing companies need safe defaults, backfill, and rollback path. |
| Existing regression scope | Yes | Billing, login/session, permission resolution, module visibility, and support tooling all affected. |

### Early Blast-Radius Notes
- The user has now implicitly locked a dynamic resolver chain:
  `subscription access` ∩ `owner ceiling` ∩ `member permission`
- This means role editor output is no longer final by itself.
- If owner permission decreases, the system must dynamically clamp members downward.
- Since changes happen from superAdmin page, this becomes a centralized governance surface rather than tenant-local settings behavior.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `HOLD_NEEDS_DISCOVERY` |
| Recommended Next Rules | `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Analysis / runtime contract lock first, then split into PRD patches |
| Can Proceed to PRD? | No |

### Routing Rationale
- Core direction is clearer, but the runtime consequences are now even more concrete and high-risk.
- Before PRD patching, we still need to lock:
  - what “change subscription” exactly includes
  - how access propagates when subscription changes
  - how member permission is clamped when owner permission changes
  - whether member stored roles are rewritten or only runtime-effective access is reduced
- Direct PRD patch now would still be premature because downgrade/propagation behavior is not yet fully specified.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Apakah final resolver order benar diperlakukan sebagai `subscription access ∩ owner ceiling ∩ member role permission`? | This is the core runtime contract | Yes | User / PM / Analyst / BE |
| OQ-02 | Saat owner permission turun, apakah system mengubah stored member-role permission data, atau hanya menurunkan effective runtime access? | Data-model and propagation behavior differ significantly | Yes | User / PM / BE |
| OQ-03 | Saat subscription turun/nonaktif, apakah stored permission tetap disimpan tapi feature/access diblok, atau permission ikut diturunkan juga? | Billing-state vs permission-state boundary | Yes | User / PM / Billing / BE |
| OQ-04 | “Change subscription” dari superAdmin mencakup apa saja tepatnya: plan, addon, active/inactive, suspend/reactivate, expiry/grace, quota? | Financial/commercial boundary and audit scope | Yes | User / PM / Billing |
| OQ-05 | Apakah company owner permission source itu sendiri hanya boleh diubah dari halaman superAdmin, atau tenant-side role management owner juga masih boleh? | Governance boundary and conflict prevention | Yes | User / PM / Security |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Pending | Need final runtime contract and governance boundary |
| Stakeholder / Business User | Business intent confirmation | Pending | User provided key clarification, but propagation semantics still open |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Needed after propagation model is proposed |
| Billing / Security | Governance and override policy | Pending | Required because subscription state becomes access determinant |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` | Likely patch with company-governance section or phase extension |
| Related PRD | `PRD/Company n people/PRD Setting - Role management.md` | May need relation notes or patch because owner-ceiling model changes role validity/resolution |
| Related PRD | `PRD/Subscription/PRD Prepaid Billing and Subscription.md` | May need relation notes or patch because subscription is now explicit access determinant controlled by superAdmin |
| Assessment Report | `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md` | Will need revision after runtime contract lock |
| QA / Automation | `TBD` | Depends on whether scope splits into billing control + entitlement resolver tracks |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial brief created for PRD patch based on downloaded superAdmin PRD changes | Hermes |
| 2026-06-22 | Updated brief for new request: dynamic subscription and company-level permission management from superAdmin page | Hermes |
| 2026-06-22 | Updated brief with user clarification: must handle option A/B/C, subscription remains control surface, and company permission may derive from company owner permission ceiling | Hermes |
| 2026-06-22 | Updated brief with latest clarification: subscription is initial access determinant, owner downgrade must propagate to members, and superAdmin page is owner/company permission control surface | Hermes |
