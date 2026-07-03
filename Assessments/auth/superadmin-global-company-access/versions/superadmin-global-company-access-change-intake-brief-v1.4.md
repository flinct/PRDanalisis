# Change Intake Brief: SuperAdmin Global Company Access and Tenant Impersonation

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `User request in chat to expand SuperAdmin scope so SatuInbox subscription and permissions can be managed dynamically from the superAdmin page, including company-level permissions rather than only per-user permissions. Clarification lock: subscription is the initial determinant of company access, including feature access and permission; resolver must update feature access and permission dynamically; if owner permission drops, system must rewrite member permission/role in database and member permission must be cut; superAdmin may change all subscription aspects; owner/company-level permission may only be changed from superAdmin page.`  
> **Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-change-intake-brief.md`  
> **Version:** `v1.4`  
> **Previous Version:** `Assessments/auth/superadmin-global-company-access/versions/superadmin-global-company-access-change-intake-brief-v1.3.md`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `PRD/Company n people/PRD Setting - Role management.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`  
> **Tanggal Intake:** 2026-06-22  
> **Status:** Hold

---

## 0. Ringkasan Update Brief

- Versi sebelumnya sudah mengunci bahwa subscription adalah penentu awal access dan owner adalah company ceiling.
- Klarifikasi terbaru dari user sekarang mengunci hal-hal kritis berikut:
  - jika owner permission turun, system harus **rewrite permission/role member di database**
  - jika subscription turun/nonaktif, **permission ikut dipotong**
  - superAdmin subscription control mencakup **semua** aspek subscription
  - owner/company-level permission **hanya boleh diubah dari halaman superAdmin**
- Dengan lock baru ini, model governance sekarang bukan hanya runtime clamp, tapi juga **persisted propagation model**.
- Requirement masih high-risk, tetapi semantic contract inti sekarang jauh lebih jelas dan siap untuk analisa arsitektur mendalam / split-PRD planning.

---

## 1. Request Snapshot

**Request Summary:**
User wants a superAdmin control surface that can manage tenant subscription and company-level permissions dynamically. Subscription becomes the initial determinant of company access, including feature access and permission. Company owner permission acts as the company ceiling, and all members must always remain at or below that owner permission. If owner permission drops, the system must rewrite member role/permission in the database. If subscription is lowered or disabled, permission must also be cut. Subscription and owner/company permission changes happen only from the superAdmin page.

**Business Problem:**
Current superAdmin direction does not yet define a persisted governance model for combining subscription entitlement, company-wide permission ceiling, and member permission propagation. Internal operations need a safe centralized way to control tenant access and company-wide capability without manual engineering intervention or per-user ad hoc adjustments.

**Target User / Role / Stakeholder:**
- `SUPER_ADMIN`
- PM / Analyst / Security / Billing / BE / FE
- indirectly affected: tenant Admins, company owners, members, billing/finance ops

**Expected Outcome:**
Define a safe superAdmin governance model where:
- superAdmin can change, disable, enable, and otherwise control all subscription aspects
- subscription determines initial company access surface and permission envelope
- owner permission defines company-wide ceiling
- member role/permission is persistently rewritten downward when owner/subscription access drops

**Urgency / Why Now:**
User explicitly wants analysis first, and the requirement is now a hard governance/runtime + persistence contract change rather than a generic admin enhancement.

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
- Request spans billing/subscription control, company-level governance, persisted member-permission propagation, and centralized superAdmin-only authority.
- This changes effective access resolution and also changes how permission data is stored/rewritten.
- Existing role-management PRD remains role-centric; new ask introduces a dynamic company ceiling plus forced persisted rewrite behavior.
- Existing billing/subscription PRD remains payment-service-centric; new ask adds superAdmin operational control over the full subscription surface.
- Even if surfaced from one page, this remains a multi-track system change.

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
| Runtime / Current Behavior | Partial / fragmented | User/member permissions are role-driven. Subscription exists in payment-service. No confirmed unified company-level capability resolver or persisted downward-propagation model controlled by superAdmin was evidenced from current scan. |

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
- Analyze superAdmin control surface for **all subscription mutations**.
- Analyze access resolver where **subscription is initial determinant** of company access, including feature access and permission envelope.
- Analyze **owner-derived company permission ceiling**.
- Analyze **persisted member permission/role rewrite** when owner permission changes downward.
- Analyze **permission cutting** when subscription access drops or is disabled.
- Identify impacted services, session model, audit, rollback, and propagation needs.

### 4.2 Out of Scope
- Final PRD patch in this turn.
- Implementing code changes.
- Defining final UI wireframe.
- Replacing tenant role-management PRD entirely.
- Rewriting billing commercial model beyond superAdmin control actions.

### 4.3 Protected Existing Behavior
- Payment/subscription lifecycle must remain owned by payment-service; no raw DB mutation shortcut.
- Tenant scoping and auditability must remain mandatory.
- Existing member role-management model must stay meaningful, even if its stored output is rewritten by centralized governance rules.
- Existing 3-phase superAdmin roadmap must not be silently collapsed into unrestricted write mode.
- Member permission must never exceed company owner effective permission.
- Subscription disable must not silently mutate unrelated tenant data beyond access/capability and permission consequences explicitly defined by policy.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Subscription lifecycle now directly participates in effective access resolution and persisted permission changes. |
| RBAC / visibility / assignment | Yes | Owner-derived ceiling changes how member permissions are constrained, stored, and updated. |
| API / webhook / socket / queue / cron | Yes | Payment-service, auth-service, people-service, and FE session guards likely need contract changes. |
| SLA / reporting / export | Possible | If subscription or company access disables modules, reporting/export visibility changes indirectly. |
| Migration / rollback / feature flag | Yes | Existing companies need safe defaults, backfill, and rollback path. |
| Existing regression scope | Yes | Billing, login/session, permission resolution, stored role propagation, module visibility, and support tooling all affected. |

### Early Blast-Radius Notes
- The user has effectively locked a persisted resolver + propagation model:
  `subscription access` ∩ `owner ceiling` ∩ `member role permission`
- But unlike prior assumption, this is not runtime-only. When owner/subscription access drops, **stored member role/permission must be rewritten**.
- This means role editor output is no longer autonomous state; centralized governance can rewrite it.
- Since superAdmin can mutate all subscription aspects and owner/company permission only from one page, this becomes a platform-governance control plane.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `HOLD_NEEDS_DISCOVERY` |
| Recommended Next Rules | `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Analysis / split-runtime-contract first, then PRD patches |
| Can Proceed to PRD? | No |

### Routing Rationale
- Core semantics are now much clearer, but implementation consequences are larger.
- We still need to lock:
  - exact mutation list under “all subscription aspects”
  - rewrite algorithm for stored member role/permission
  - whether upward restoration happens automatically if owner/subscription later increases again
  - audit and rollback model for destructive permission cuts
- Direct PRD patch now would still be premature because propagation/recovery behavior is not fully specified.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Apakah final resolver order benar diperlakukan sebagai `subscription access ∩ owner ceiling ∩ member role permission`? | This is the core runtime contract | Yes | User / PM / Analyst / BE |
| OQ-02 | Saat owner/subscription turun dan member dipotong, kalau nanti owner/subscription naik lagi apakah permission member auto-restore atau tetap perlu set manual ulang? | This changes persistence/recovery design drastically | Yes | User / PM / BE |
| OQ-03 | “Semua” aspect subscription itu tepatnya mencakup apa saja: plan, addon, active/inactive, suspend/reactivate, expiry, grace, quota, voucher/override entitlement? | Financial/commercial boundary and audit scope | Yes | User / PM / Billing |
| OQ-04 | Rewrite permission/role member dilakukan sinkron saat save, async via event/job, atau hybrid? | Concurrency, rollback, and UX implications | Yes | User / PM / BE |
| OQ-05 | Kalau tenant-side role management mencoba menaikkan member di atas owner ceiling, apakah save diblok atau auto-clamped? | Ongoing governance consistency | Yes | User / PM / BE |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Pending | Need final propagation/recovery contract |
| Stakeholder / Business User | Business intent confirmation | Pending | User provided key clarification, but restore/recovery semantics still open |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Needed after propagation mode is proposed |
| Billing / Security | Governance and override policy | Pending | Required because subscription state becomes both access determinant and destructive rewrite trigger |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` | Likely patch with company-governance section or phase extension |
| Related PRD | `PRD/Company n people/PRD Setting - Role management.md` | May need relation notes or patch because centralized owner ceiling can rewrite member roles/permissions |
| Related PRD | `PRD/Subscription/PRD Prepaid Billing and Subscription.md` | May need relation notes or patch because subscription is explicit access determinant controlled by superAdmin |
| Assessment Report | `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md` | Will need revision after propagation/recovery contract lock |
| QA / Automation | `TBD` | Depends on whether scope splits into billing control + entitlement resolver + rewrite-propagation tracks |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial brief created for PRD patch based on downloaded superAdmin PRD changes | Hermes |
| 2026-06-22 | Updated brief for new request: dynamic subscription and company-level permission management from superAdmin page | Hermes |
| 2026-06-22 | Updated brief with user clarification: must handle option A/B/C, subscription remains control surface, and company permission may derive from company owner permission ceiling | Hermes |
| 2026-06-22 | Updated brief with latest clarification: subscription is initial access determinant, owner downgrade must propagate to members, and superAdmin page is owner/company permission control surface | Hermes |
| 2026-06-22 | Updated brief with hard lock: member role/permission rewrite is persisted in DB, subscription downgrade also cuts permission, all subscription aspects are in scope, and owner/company permission changes are superAdmin-only | Hermes |
