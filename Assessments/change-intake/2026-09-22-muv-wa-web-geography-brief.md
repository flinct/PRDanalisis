# Change Intake Brief: MUV (Monthly Unique Visitors) per Channel + WA Web Geography-Based Exclusion

> **Artifact Type:** Change Intake Brief (Phase 0)
> **Source Request / BRD:** Delegated change-intake task (2 requests) — MUV per channel platform; WA Web feature-service geography-based exclusion
> **Artifact Path:** `Assessments/change-intake/2026-09-22-muv-wa-web-geography-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/task-router.md`, `Rules/profiles/satuinbox.yml`
> **Supporting Context:** `Memory/global-memory.md`, `PRD/Analytics/PRD Analytics - Visitor Analytics.md`, `PRD/Auth/PRD Auth - Dual Registration Flow (Personal vs Organization).md`, `PRD/Add ons/PRD Add ons.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`
> **Tanggal Intake:** 2026-09-22
> **Author / Owner:** Dany Christian (PM)
> **Status:** Scoped (composite; recommended SPLIT)

---

## 0. Ringkasan Update Brief

- Initial version. Two distinct requests captured in one brief per delegated task; recommended to split into two independent PRDs because domains, owners, risks, and delivery paths differ.
- Request 1 (MUV per channel) = Analytics NEW_CAPABILITY. Request 2 (WA Web geography exclusion) = cross-domain (Auth + WhatsApp Web + Subscription) NEW_CAPABILITY.
- Routing: `SPLIT_REQUEST` → each request routes to its own `NEW PRD`.

---

## 1. Request Snapshot

### Request 1 — MUV (Monthly Unique Visitors) per Channel Platform

- **Request Summary:** Count inbound clients to each channel platform in SatuInbox; unique count per month.
- **Business Problem:** Product/ops cannot see, per channel (WhatsApp Web, Widget, others), how many *unique* customers are inbound each month — only aggregate website traffic (GA4) and per-channel message-volume analytics exist today. Channel ROI/adoption by unique reach is not measurable.
- **Target User / Role / Stakeholder:** Company-level analytics users; PM / ops for channel-ROI decisions.
- **Expected Outcome:** A per-channel "unique inbound clients this month" metric inside the Analytics shell, company-scoped, no PII.
- **Urgency / Why Now:** Analytics/metrics capability; adjacent to existing channel usage analytics and Visitor Analytics. Not a workflow blocker.

### Request 2 — WA Web Feature Service Geography-Based Exclusion

- **Request Summary:** Default = exclude the WhatsApp Web feature service from SatuInbox packages; include only when the registering user is located in Indonesia; exclude when outside Indonesia. User question: what mechanism to use for include/exclude — should it use permissions?
- **Business Problem:** WA Web (Baileys/unofficial-API based) carries geography-dependent legal/ToS/compliance exposure. SatuInbox is SaaS multi-tenant ONLY, so this must be enforced centrally at provisioning, not per-deployment.
- **Target User / Role / Stakeholder:** New registrants (onboarding), Super Admin/ops, PM, Engineering.
- **Expected Outcome:** Tenants registering from outside Indonesia do not get the WA Web channel/feature-service; Indonesian registrants do. Enforcement is automatic and central.
- **Urgency / Why Now:** Compliance/market-access control; likely L3 (worth building), escalates to L4 if it is a legal/regulatory requirement.

---

## 2. Change Classification

| Item | Request 1 (MUV) | Request 2 (WA Web geography) |
|------|------------------|------------------------------|
| Change Class | `NEW_CAPABILITY` | `NEW_CAPABILITY` (tenant-level provisioning/gating behavior — no such mechanism exists today) |
| Primary Domain | Analytics | Cross-domain: Auth + WhatsApp Web (+ Subscription/Add-ons) |
| Request Shape | Add | Add |
| Initial Complexity Signal | Medium | High |
| Needs Split? | Yes (from Request 2) | Yes (from Request 1) |

### Classification Rationale

- **Request 1** is additive analytics with no existing equivalent metric → NEW_CAPABILITY, not a change to an existing metric.
- **Request 2** introduces a new gating/provisioning rule that does not exist; it is not a modification of existing channel behavior (WA Web currently has no geography rule to modify) → NEW_CAPABILITY rather than BEHAVIOR_CHANGE.
- Together the brief is `COMPOSITE_CHANGE`. Objectives, owners, risks, and delivery paths differ → `SPLIT_REQUEST`.

---

## 3. Current State Verification

### 3.1 PRD Status

| Item | Request 1 (MUV) | Request 2 (WA Web geography) |
|------|------------------|------------------------------|
| Relevant existing PRD | `PRD/Analytics/PRD Analytics - Visitor Analytics.md` (GA4 *website* visitors — different metric); `PRD/Add ons/PRD Add ons.md` (US-6 per-channel usage stats: messages, active convos, response time, CSAT) | `PRD/Auth/PRD Auth - Dual Registration Flow.md` (registration/onboarding, phone, tenant bootstrap); `PRD/Add ons/PRD Add ons.md` + `PRD/Subscription/PRD Prepaid Billing and Subscription.md` (channels are plan/add-on entitlements) |
| PRD status | Partial (adjacent metrics exist; the specific MUV-per-channel metric does NOT) | Not found for geography gating (registration + add-on model exist; no country rule) |
| PRD treatment candidate | New PRD | New PRD |

### 3.2 Implementation Status

| Surface | Request 1 (MUV) | Request 2 (WA Web geography) |
|---------|------------------|------------------------------|
| FE | Analytics shell + per-channel usage dashboard exist | Onboarding type selector + add-on marketplace exist |
| BE | `analytics-service` (GA4 connector) exists; Conversation/Contact data available (`firstCustomerMessageAt`, channel, normalized phone) | Auth/company onboarding + subscription/add-on entitlement exist; no country detection/gating |
| Runtime / Current Behavior | No "unique inbound client per channel per month" metric is computed or shown | WA Web available as add-on with no geography gate |

### 3.3 Related Sources

- `Memory/global-memory.md`: Contact = one global contact, phone = unique identifier; RBAC = Admin/Supervisor/Agent (+ Sales/Operational area context, Super Admin); SatuInbox = SaaS multi-tenant ONLY (no self-hosted).
- `PRD/Analytics/PRD Analytics - Visitor Analytics.md`: explicitly forbids showing `MUV` alone as a label; defines "Monthly Visitors" = GA4 Users/Total Users. **Terminology collision risk** with the new MUV-per-channel request.
- `PRD/Add ons/PRD Add ons.md` (US-6): per-channel usage analytics (messages, active conversations, response time, CSAT) — closest existing surface, but lacks unique-inbound-client monthly count.
- `PRD/Subscription/PRD Prepaid Billing and Subscription.md`: hybrid "plan + addons" pricing; channels (WhatsApp API, WhatsApp Web, Telegram, Facebook, Email) are add-on entitlements; WhatsApp Web = fixed pricing.
- `PRD/Auth/PRD Auth - Dual Registration Flow.md`: registration captures phone; onboarding splits Personal vs Organization; tenant bootstrap creates `companyId + organizationId`. Phone prefix is available for country inference but not currently used for channel gating.

---

## 4. Scope Boundary

### 4.1 In Scope

**Request 1 (MUV):**
- Define and compute a per-channel monthly *unique inbound client* count (WA Web, Widget, and any channel with inbound traffic).
- Company-scoped, no PII, monthly summary period (aligned with Visitor Analytics period rules).
- New Analytics section/KPI or extension of existing channel usage analytics (decision left to PRD).

**Request 2 (WA Web geography):**
- Country detection for new registrants (Indonesia vs non-Indonesia).
- Central enforcement: WA Web feature service excluded by default; auto-included only for Indonesia.
- Define where enforcement lives (tenant entitlement/feature flag vs. new permission).

### 4.2 Out of Scope

**Request 1 (MUV):**
- Website/GA4 visitor tracking (already covered by Visitor Analytics).
- Raw visitor list, per-user drill-down, PII export.
- Arbitrary date ranges, cross-company comparison (Phase 1).

**Request 2 (WA Web geography):**
- Changing the underlying plan/add-on pricing model.
- Re-gating existing Indonesian tenants' WA Web access.
- Self-hosted/on-prem (N/A — SaaS only).
- Re-defining RBAC roles.

### 4.3 Protected Existing Behavior

- Existing Analytics sections (Conversation, Ticket, Responsiveness, Member Performance, Broadcast, Offline Report, Visitor Analytics) must not change calculations (Visitor Analytics FR-033/FR-034).
- Existing RBAC/visibility (company scoping, role login determines visibility) and no cross-company data leakage.
- Existing WA Web access for already-onboarded Indonesian tenants; existing plan/add-on billing (proration, invoices) must not break.
- Registration/onboarding flow, tenant bootstrap (`companyId + organizationId`), and owner/admin role bootstrap must remain intact.
- No PII (email, phone, full name, message body, tokens) sent to analytics or exposed by gating.

---

## 5. Early Impact Flags

| Area | Request 1 (MUV) | Request 2 (WA Web geography) | Notes |
|------|------------------|------------------------------|-------|
| Shared entity / lifecycle / state | No | Yes | Gating touches tenant/company provisioning state |
| RBAC / visibility / assignment | Yes (company scope) | No (not a permission — a tenant property) | Geography must NOT be modeled as RBAC |
| API / webhook / socket / queue / cron | Yes (analytics-service RPC + endpoint) | Yes (onboarding/company-service, subscription-service) | |
| SLA / reporting / export | Yes (new report) | No | |
| Migration / rollback / feature flag | Yes | Yes | Both should ship behind feature flags |
| Existing regression scope | Yes (analytics shell) | Yes (onboarding + add-on billing) | |

### Early Blast-Radius Notes

- **Request 1** touches `analytics-service`, Analytics shell, and depends on Contact (unique phone) + Conversation (channel + `firstCustomerMessageAt`) data. Terminology must be disambiguated from Visitor Analytics' GA4 "Monthly Visitors".
- **Request 2** touches registration/onboarding, company/tenant provisioning, subscription/add-on entitlements, and the WhatsApp Web service. The include/exclude decision must not leak into billing (excluded tenants must not be charged) and must not regress the plan/add-on selection wizard.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `SPLIT_REQUEST` |
| Request 1 Routing | `ROUTE_NEW_PRD` (Analytics domain) |
| Request 2 Routing | `ROUTE_NEW_PRD` (cross-domain: Auth + WhatsApp Web + Subscription) |
| Recommended Next Rules | `Rules/core/requirements.md`, `Rules/core/analysis-and-risk.md`, `Rules/core/test-design.md` |
| Recommended Next Artifact | Two separate PRDs; small discovery follow-up on Request 2 mechanism + Request 1 metric source |
| Can Proceed to PRD? | Yes for both — but **Request 2 has a blocking mechanism decision first** (see §7 OQ-02) |

### Routing Rationale

- Different domains, owners, risks, and delivery paths → split, do not merge into one PRD.
- **Request 1** is a self-contained analytics addition (Medium complexity) → New PRD, Lite/Standard mode.
- **Request 2** is a shared/gated provisioning change (High complexity) → New PRD, Standard/Full mode, with mandatory shared-impact analysis (touches subscription + onboarding + WA Web).

### Mechanism Recommendation (Request 2 — answering "should it use permissions?")

**Answer: NO — do not use permissions/RBAC (Option A).**

- RBAC models *who* (role) can do *what* inside a tenant; geography is a *tenant-level property*, not a role/permission. Modeling "WA Web allowed for Indonesian tenants" as a permission type would conflate entitlement with authorization and leak into every permission check.
- **Recommended: Option D + Option B, layered into the existing plan/add-on entitlement model (Option C).**
  - **Detection (Option D):** country detection at registration/onboarding — primary = phone country prefix (`+62` = Indonesia); secondary/fallback = IP geolocation; explicit user-declared country field as tiebreaker if ambiguous.
  - **Enforcement (Option B):** persist the resolved country on the tenant/company; a tenant-level feature flag / entitlement controls whether the WhatsApp Web channel is available and selectable in the add-on/plan wizard.
  - **Fit (Option C):** WhatsApp Web is already a plan/add-on entitlement, so the geography rule should gate *availability* of that entitlement, not create a parallel permission system.
- This is the most SatuInbox-aligned: it reuses the existing registration phone field, the existing add-on entitlement surface, and the existing feature-flag rollout pattern, while keeping RBAC untouched.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | For Request 1, is "inbound client" a unique *contact* (normalized phone) per channel per month, or a unique *conversation*? Which channels are in scope (WA Web, Widget, + which Add-on channels)? | Metric definition changes data source and aggregation entirely. | Yes | PM |
| OQ-02 | For Request 2, confirm the mechanism = tenant-level feature flag/entitlement (Option B+D) rather than RBAC (Option A). Also confirm: what is the authoritative country source (phone prefix vs IP vs declared)? | Determines the entire provisioning design and whether onboarding/session data model changes. | Yes | PM + Engineering |
| OQ-03 | Is the WA Web geography restriction driven by legal/regulatory compliance (→ L4) or product/market strategy (→ L3)? | Changes priority and whether legal sign-off is required. | No (affects priority, not routing) | PM |
| OQ-04 | For Request 1, should MUV-per-channel live as a new Analytics section or extend the existing channel usage analytics (Add-ons US-6)? | Avoids duplicate surfaces. | No | PM + Analyst |
| OQ-05 | For Request 2, how are existing non-Indonesian tenants (if any) handled — grandfather or retro-exclude? | Data/compliance migration scope. | Yes (before PRD) | PM |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM (Dany Christian) | Scope lock + OQ-01/OQ-02 decisions | Pending | |
| Engineering Lead (Naftal Yunior) | Country-detection + entitlement mechanism sanity check | Pending | |
| Analyst | Assessment Report + terminology disambiguation | Pending | |
| Stakeholder / Business | Confirm geography intent + MUV value | Pending | |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD — MUV per channel | `PRD/Analytics/` (new) | scope, change class, current-state baseline, protected behavior |
| PRD — WA Web geography exclusion | `PRD/` cross-domain (new) | scope, mechanism recommendation, protected behavior, routing rationale |
| Assessment Report | `Assessments/<domain>/<slug>/<slug>-qa-assessment.md` | source scope, protected behavior, impact flags |
| QA Pre-Implementation Review | `Assessments/templates/Setup/` | impact flags, protected behavior, regression scope |
| QA Post-Implementation Validation | `Assessments/templates/Setup/` | validate against original scoped intent |
| Automation Mapping / Test Spec | `Test/<domain>/` | traceability + non-scope guard |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-09-22 | Initial brief created (composite; recommended SPLIT) | Dany Christian (PM) |
