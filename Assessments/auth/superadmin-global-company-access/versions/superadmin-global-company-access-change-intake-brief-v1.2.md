# Change Intake Brief: SuperAdmin Global Company Access and Tenant Impersonation

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `User request in chat to expand SuperAdmin scope so SatuInbox subscription and permissions can be managed dynamically from the superAdmin page, including company-level permissions rather than only per-user permissions. Clarification: company permission must handle option A (feature entitlement), B (billing-derived entitlement), and C (company-wide ceiling derived from company owner permission).`  
> **Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-change-intake-brief.md`  
> **Version:** `v1.2`  
> **Previous Version:** `Assessments/auth/superadmin-global-company-access/versions/superadmin-global-company-access-change-intake-brief-v1.1.md`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `PRD/Company n people/PRD Setting - Role management.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`  
> **Tanggal Intake:** 2026-06-22  
> **Status:** Hold

---

## 0. Ringkasan Update Brief

- Versi sebelumnya menandai request ini sebagai mixed request dan hold karena arti “permission milik company” masih ambigu.
- Klarifikasi user sekarang mengunci bahwa solution **harus bisa handle opsi A, B, dan C sekaligus**:
  - **A** = feature/module entitlement
  - **B** = billing/subscription-derived entitlement
  - **C** = company-wide permission ceiling derived from company owner permission
- User juga mengunci bahwa subscription tetap **hanya control surface** dari superAdmin untuk mengubah, menonaktifkan, atau mengaktifkan subscription — source of truth tetap billing/subscription domain.
- User memberi arah model untuk company permission tanpa menambah layer baru: system membaca **company owner user permission** sebagai **company permission ceiling**, lalu semua member hanya boleh memiliki permission yang sama atau di bawah owner tersebut.
- Meskipun ambiguity berkurang, perubahan ini sekarang makin jelas sebagai **high-risk governance model change** dengan blast radius besar ke RBAC, billing, auth/session, and capability resolution. Belum aman patch PRD tanpa analisa lanjutan dan kemungkinan split track tetap tinggi.

---

## 1. Request Snapshot

**Request Summary:**
User wants superAdmin to dynamically manage subscription and permissions from the superAdmin page. Subscription control is only a control surface to change, disable, or enable tenant subscription. Company-level permission must support three models simultaneously: feature entitlement, billing-derived entitlement, and owner-derived company permission ceiling.

**Business Problem:**
Current superAdmin direction covers access, approval, impersonation, and audit, but it does not define a platform control plane for tenant commercial access and company-wide governance. Internal operations need a way to adjust tenant subscription state and govern tenant-wide capability/permission ceilings without manually editing each member or relying on engineering/database intervention.

**Target User / Role / Stakeholder:**
- `SUPER_ADMIN`
- PM / Analyst / Security / Billing / BE / FE
- indirectly affected: tenant Admins, company owners, members, billing/finance ops

**Expected Outcome:**
Clarify a safe superAdmin capability model where:
- superAdmin can enable/disable/change tenant subscription via control surface
- system can resolve company-level permission/capability using feature entitlement + billing-derived entitlement + owner-derived ceiling
- all member permissions stay at or below company owner permission ceiling

**Urgency / Why Now:**
User explicitly wants analysis first. This is a strategic governance change, not a cosmetic admin enhancement.

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
- Request now explicitly spans three permission semantics and one subscription control surface.
- This is not a simple write-mode addition; it changes the effective access-resolution model across tenant, role, and billing domains.
- Existing role-management PRD remains role-centric; the new ask introduces a **tenant/company-wide ceiling** and **billing-derived capability** behavior.
- Existing billing/subscription PRD remains payment-service-centric; the new ask adds superAdmin operational control over subscription status/change actions.
- Because A, B, and C must all be handled, this is very likely a multi-track change even if surfaced from one superAdmin page.

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
- Analyze company-level permission resolution that must handle:
  - **A. feature/module entitlement**
  - **B. billing/subscription-derived entitlement**
  - **C. company-wide permission ceiling from owner permission**
- Analyze how owner-derived ceiling interacts with member roles.
- Identify impacted services, session model, audit, rollback, and resolver-order needs.

### 4.2 Out of Scope
- Final PRD patch in this turn.
- Implementing code changes.
- Defining final UI wireframe.
- Replacing tenant role-management PRD entirely.
- Detailed pricing/billing policy rewrite beyond superAdmin control surface needs.

### 4.3 Protected Existing Behavior
- Current role-management model for members/users must remain valid unless explicitly changed.
- Existing 3-phase superAdmin roadmap must not be silently collapsed into unrestricted write mode.
- Payment/subscription lifecycle must remain owned by payment-service; no raw DB mutation shortcut.
- Tenant scoping and auditability must remain mandatory.
- Existing member role changes already have session-side effects; any owner-derived company ceiling model must not silently bypass those safeguards.
- Member permission must never exceed company owner effective permission under the user’s clarified direction.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Subscription lifecycle and tenant capability gating are shared behavior. |
| RBAC / visibility / assignment | Yes | Owner-derived company ceiling changes how member permissions are constrained. |
| API / webhook / socket / queue / cron | Yes | Payment-service, auth-service, people-service, and FE session guards likely need contract changes. |
| SLA / reporting / export | Possible | If company-level capability hides modules, reporting/export visibility can change indirectly. |
| Migration / rollback / feature flag | Yes | Existing companies need safe defaults and rollback path. |
| Existing regression scope | Yes | Billing, login/session, permission resolution, module visibility, and support tooling all affected. |

### Early Blast-Radius Notes
- Request now implies a **multi-input resolver chain**, not one flat permission source.
- Owner permission as company ceiling means role editor may no longer be sufficient on its own; role save could become invalid if it exceeds owner ceiling.
- Subscription change from superAdmin control surface can indirectly alter feature entitlement, which then intersects with owner ceiling and member role permission.
- This can create a 3-layer effective rule:
  `subscription entitlement` ∩ `company owner ceiling` ∩ `member role permission`
- If this is the intended model, both FE and BE enforcement must share one source of truth.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `HOLD_NEEDS_DISCOVERY` |
| Recommended Next Rules | `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Analysis / semantic lock first, then likely split into PRD patches |
| Can Proceed to PRD? | No |

### Routing Rationale
- User has clarified the intended direction, but the resolver contract is now more complex, not simpler.
- Before PRD patching, we still need to lock:
  - effective permission resolution order
  - owner change behavior
  - what happens when owner permission is lowered below existing member roles
  - what subscription changes are allowed vs audited vs reversible
- Direct PRD patch now would likely mix billing control, feature entitlement, and RBAC ceiling into one underdefined write-mode section.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Effective resolver order exact-nya apa? Apakah final access = subscription entitlement ∩ owner ceiling ∩ member role permission? | This becomes the core runtime contract | Yes | User / PM / Analyst / BE |
| OQ-02 | Kalau company owner permission turun, apa yang terjadi ke member yang saat ini sudah punya permission lebih tinggi? | Needs deterministic downgrade / enforcement / session behavior | Yes | User / PM / BE |
| OQ-03 | Siapa yang boleh mengubah permission owner? SuperAdmin saja, owner sendiri, atau tenant admin? | Owner is now company ceiling source | Yes | User / PM / Security |
| OQ-04 | Perubahan subscription apa saja yang boleh dari superAdmin: plan, addon, status, suspend, expiry, grace, usage cap, manual entitlement? | Financial/commercial boundary | Yes | User / PM / Billing |
| OQ-05 | A, B, dan C apakah harus muncul sebagai konsep terpisah di UI, atau hanya 1 result state “company capability” yang dihitung system? | UX and implementation shape differ significantly | Yes | User / PM / FE |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Pending | Need semantic lock for final resolver chain |
| Stakeholder / Business User | Business intent confirmation | Pending | User provided major clarification, but not final contract |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Needed after resolver order is proposed |
| Billing / Security | Governance and override policy | Pending | Required because superAdmin changes subscription state and company-wide permission ceiling indirectly |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` | Likely patch with new section for company capability governance or later phase extension |
| Related PRD | `PRD/Company n people/PRD Setting - Role management.md` | May need relation notes or patch because owner-ceiling model changes role validity/resolution |
| Related PRD | `PRD/Subscription/PRD Prepaid Billing and Subscription.md` | May need relation notes or patch because superAdmin can control subscription status/change actions |
| Assessment Report | `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md` | Will need revision after semantic lock |
| QA / Automation | `TBD` | Depends on whether scope splits into billing control + entitlement resolver tracks |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial brief created for PRD patch based on downloaded superAdmin PRD changes | Hermes |
| 2026-06-22 | Updated brief for new request: dynamic subscription and company-level permission management from superAdmin page | Hermes |
| 2026-06-22 | Updated brief with user clarification: must handle option A/B/C, subscription remains control surface, and company permission may derive from company owner permission ceiling | Hermes |
