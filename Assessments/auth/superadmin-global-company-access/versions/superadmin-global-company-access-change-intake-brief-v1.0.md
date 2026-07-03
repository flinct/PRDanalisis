# Change Intake Brief: SuperAdmin Global Company Access and Tenant Impersonation

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** `User request in chat to compare old PRD with C:\Users\MyBook SAGA 12\Downloads\prd-superadmin-global-access.md and update the existing workspace PRD with the changes found there.`  
> **Artifact Path:** `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-change-intake-brief.md`  
> **Version:** `v1.0`  
> **Previous Version:** `none`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`, `C:\Users\MyBook SAGA 12\Downloads\prd-superadmin-global-access.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`  
> **Tanggal Intake:** 2026-06-22  
> **Status:** Ready for PRD

---

## 0. Ringkasan Update Brief

- Initial brief created for change request against existing SuperAdmin PRD.
- Scope change identified: add SuperAdmin login email verification code (2FA), shift platform-admin route namespace from `/super-admin/*` to `/system/*`, and move surface direction from in-app `/super-admin` route wording to dedicated `system.satuinbox.com` system surface wording.
- Routing remains **patch existing PRD**, not rewrite, because the 3-phase superAdmin model remains intact and only targeted behavior / contract changes are added.

---

## 1. Request Snapshot

**Request Summary:**
User asked to compare the downloaded PRD with the old workspace PRD and then update the old PRD with the detected changes.

**Business Problem:**
The old workspace PRD is outdated relative to the newer source document. If left unchanged, product, engineering, and QA can implement against stale auth flow, stale route namespace, and stale platform surface assumptions.

**Target User / Role / Stakeholder:**
- `SUPER_ADMIN`
- PM / Analyst / Engineering / QA / Security

**Expected Outcome:**
The workspace PRD becomes aligned with the newer source document, especially for superAdmin access security and platform-admin routing/surface assumptions.

**Urgency / Why Now:**
The new document already encodes behavior changes that materially affect auth flow, API contract, and FE surface direction. Keeping the old PRD risks implementation drift.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `BEHAVIOR_CHANGE` |
| Primary Domain | `Auth` |
| Request Shape | Change |
| Initial Complexity Signal | High |
| Needs Split? | No |

### Classification Rationale
- This is not a brand-new feature request because an existing SuperAdmin PRD already exists.
- The new document changes login behavior by adding a required email verification code step.
- The new document also changes API route namespace and platform surface assumptions.
- The 3-phase superAdmin model stays intact, so the PRD can be patched rather than fully rewritten.

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` |
| PRD status | Existing |
| PRD treatment candidate | Patch |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Partial | FE has `PAGES.SUPERADMIN.ROOT_PAGE_KEY = 'super-admin'` and proxy/robots references, but no evidence of `system.satuinbox.com` or `/system/*` surface was found. |
| BE | Partial | API Gateway currently has plain `POST /auth/login`, and company approve/reject endpoints exist; no `/system/auth/*` or `/system/companies` routes were found. |
| Runtime / Current Behavior | Partial / Not aligned with new PRD | Existing auth flow is standard login-first issuance. Shared security utility already has numeric verification code generation and config already reads `MAIL_FROM`, but the superAdmin 2FA flow is not evidenced as shipped. |

### 3.3 Related Sources
- `Memory/global-memory.md`: tenant isolation and RBAC baseline
- `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`: current workspace PRD
- `C:\Users\MyBook SAGA 12\Downloads\prd-superadmin-global-access.md`: updated source PRD with new changes
- FE / BE reference: route/search evidence from `apps/omnichannel/constants/pages.ts`, `apps/omnichannel/proxy.ts`, `apps/api-gateway/src/app/auth/auth.controller.ts`, `libs/security/src/lib/encryption/token.service.ts`, and notification config using `MAIL_FROM`

---

## 4. Scope Boundary

### 4.1 In Scope
- Add SuperAdmin login email verification code (2FA) behavior into the existing PRD.
- Add supporting error handling, edge cases, field validation, and API contract rows for the login-code flow.
- Update route namespace in the PRD from `/super-admin/*` to `/system/*` where the new source document requires it.
- Update platform-admin landing/surface wording to the `system.satuinbox.com` direction stated in the new source PRD.
- Keep assessment lineage aligned with the changed PRD.

### 4.2 Out of Scope
- Implementing code changes in FE/BE.
- Redesigning the 3-phase rollout model.
- Expanding 2FA to normal tenant roles.
- Resolving all deeper design gaps around session-switch contract, organization targeting, or full phase-3 allowlist beyond documenting the changed PRD baseline.

### 4.3 Protected Existing Behavior
- The 3-phase roadmap stays intact: phase 1 company review, phase 2 read-only impersonation, phase 3 controlled write mode.
- The PRD must continue to forbid raw tenant-bypass access.
- Existing company approval/rejection lifecycle reuse remains intact.
- Phase 2 must stay read-only-first before phase 3 write mode.
- Non-superAdmin tenant roles must remain out of scope for the new login-code requirement.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | Yes | Auth/session issuance flow changes for superAdmin access. |
| RBAC / visibility / assignment | Yes | Access chain changes from role-only to role + verification step. |
| API / webhook / socket / queue / cron | Yes | New `/system/auth/*` routes and renamed `/system/*` namespace. |
| SLA / reporting / export | No | No direct SLA/report/export change requested. |
| Migration / rollback / feature flag | Yes | Namespace and login flow changes should be rollout-controlled. |
| Existing regression scope | Yes | Login flow, company list endpoints, and superAdmin FE navigation all need regression review. |

### Early Blast-Radius Notes
- Auth flow is newly impacted because platform-admin session issuance is no longer plain login.
- FE/API contract drift risk is high because the new source PRD changes route prefixes and surface assumptions.
- Session, impersonation, and dedicated system-surface assumptions must stay aligned in downstream artifacts.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | Patch existing PRD + update Assessment Report |
| Can Proceed to PRD? | Yes |

### Routing Rationale
- The existing PRD remains the correct lineage and should not be replaced by a duplicate document.
- The new source document introduces scoped but material changes to behavior and contract.
- The correct downstream action is to patch the existing PRD and update the linked assessment in lockstep.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Is 24-hour validity acceptable for superAdmin login verification code, or should product/security shorten it? | Security posture and abuse risk | No | PM / Security |
| OQ-02 | Is `system.satuinbox.com` a dedicated app/domain or just wording for a separated route namespace? | FE architecture and deployment scope | No | PM / FE / BE |
| OQ-03 | How should login-code verification bind to session/device/request attempt? | Prevent replay/confusion | No | BE / Security |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM / Analyst | Scope lock | Aligned | Source downloaded PRD provides explicit requested changes. |
| Stakeholder / Business User | Business intent confirmation | Aligned | User explicitly asked to update the old PRD with the new changes. |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Needed later for implementation planning, not for PRD patch itself. |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md` | Patch scope, protected behavior, and route change baseline |
| Assessment Report | `Assessments/auth/superadmin-global-company-access/superadmin-global-company-access-qa-assessment.md` | Updated auth-risk and contract-change rationale |
| QA Pre-Implementation Review | `TBD` | Will inherit new auth flow and route-namespace regression scope |
| QA Post-Implementation Validation | `TBD` | Will validate 2FA flow and route migration safety |
| Automation Mapping / Test Spec | `TBD` | Will trace new login-code behavior and `/system/*` contract changes |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial brief created for PRD patch based on downloaded superAdmin PRD changes | Hermes |
