# Assessment Report: MUV per Channel Platform + WA Web Geography-Based Exclusion

> **Assessment Type:** Type 1 — Feature Development Analysis (two NEW_CAPABILITY requests, one composite brief)
> **Owner:** Analyst
> **Source Change Intake Brief:** `Assessments/change-intake/2026-09-22-muv-wa-web-geography-brief.md` (v1.0)
> **Assessment Artifact Path:** `Assessments/change-intake/2026-09-22-muv-wa-web-geography-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/analysis-and-risk.md`, `Rules/core/task-router.md`, `Rules/profiles/satuinbox.yml`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `PRD/Analytics/PRD Analytics - Visitor Analytics.md`, `PRD/Auth/PRD Auth - Dual Registration Flow (Personal vs Organization).md`, `PRD/Add ons/PRD Add ons.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`
> **Tanggal Analisa:** 2026-09-22
> **Status:** Draft (decision-bearing)

---

## 0. Ringkasan Perubahan Analisa

- Initial version. Two requests analyzed jointly per delegated scope; both confirmed as **independent** → `SPLIT_FEATURE` decision stands.
- Request 1 (MUV per channel): self-contained Analytics addition. **PROCEED_WITH_CAUTION** — terminology must be disambiguated from Visitor Analytics' GA4 "Monthly Visitors"; "inbound client" definition (OQ-01) unresolved.
- Request 2 (WA Web geography exclusion): cross-domain (Auth + WA Web + Subscription). **PROCEED_WITH_CAUTION** — mechanism recommendation (Option B+D) is sound, but two blocking decisions (OQ-02 authoritative country source, OQ-05 existing non-ID tenants) and a serious enforcement/spoofing risk must be closed before PRD freeze.
- Highest-risk findings: country-spoofing bypass (F-10), UI-only enforcement bypass (F-11), missing tenant country data model (F-14), and the misnamed "subscription-service" (F-12).

---

## 1. Overview

**Feature / Issue:**
1. Count unique inbound clients per channel platform per month (MUV per channel), company-scoped, no PII.
2. Exclude WhatsApp Web feature-service by default; include only for Indonesian registrants, enforced centrally at provisioning.

**Objective:**
- Give PM/ops per-channel unique-reach visibility for channel ROI/adoption.
- Centralize geography-dependent compliance exposure for WA Web (Baileys/unofficial API) at tenant provisioning, SaaS-only.

**Change Class / Routing Decision from Brief:** `SPLIT_REQUEST` → two independent NEW PRDs.

**Protected Existing Behavior (from brief):**
- Analytics sections (Conversation, Ticket, Responsiveness, Member Performance, Broadcast, Offline Report, Visitor Analytics) calculations unchanged (Visitor Analytics FR-033/FR-034).
- Existing RBAC/company scoping; no cross-company leakage.
- Existing WA Web access for already-onboarded Indonesian tenants; plan/add-on billing (proration, invoices) unbroken.
- Registration/onboarding flow, tenant bootstrap (`companyId + organizationId`), owner/admin role bootstrap intact.
- No PII sent to analytics or exposed by gating.

**Scope In:** (as brief §4.1) — per-channel monthly unique inbound client metric; country detection; central WA Web include/exclude; entitlement/feature-flag mechanism.

**Scope Out:** (as brief §4.2) — GA4/website tracking; raw visitor list/drill-down/PII export; arbitrary date ranges; cross-company compare; changing pricing model; re-gating existing ID tenants; self-hosted (N/A); RBAC redefinition.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `SPLIT_FEATURE`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
The two requests must remain split (different domains, owners, risks, delivery paths). Request 1 may proceed to a Lite/Standard PRD once the metric is renamed away from "MUV" and "inbound client" is defined. Request 2 may proceed to a Standard/Full PRD only after the authoritative country source (OQ-02), existing non-ID tenant handling (OQ-05), and a server-side enforcement + fail-closed default are locked.

### 2.2 Required Actions Before Development

- [ ] Resolve OQ-01 — define "inbound client" as unique normalized contact (not conversation) per channel per month; enumerate in-scope channels.
- [ ] Rename metric away from "MUV" (e.g. "Unique Inbound Clients" / "Pelanggan Unik Bulanan per Channel") — do not reuse the Visitor Analytics "MUV"/"Monthly Visitors" label space.
- [ ] Lock OQ-02 — authoritative country source priority + tie-breaker + fail-closed default (default deny for WA Web).
- [ ] Lock OQ-05 — grandfather vs retro-exclude existing non-ID tenants; define country-change re-evaluation.
- [ ] Define enforcement as server-side gate across provisioning, add-on wizard, AND `whatsapp` service `createAccountChannel` (not UI-hidden button).
- [ ] Add tenant country field + detection-method + audit trail to `company-service` schema.

### 2.3 Key Blocking Reasons / Conditions

- Request 2 blocking: OQ-02 (authoritative country source), OQ-05 (existing tenants), enforcement-boundary design.
- Request 1 non-blocking but required: OQ-01 (metric definition), terminology disambiguation.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Request 1 = Medium; Request 2 = High.
- **Risk Level:** Request 1 = Low-Medium; Request 2 = High (compliance-adjacent, spoofable signal).
- **Primary Impact Areas:** Backend, API, Database, Integration, RBAC-adjacent (tenant property, not RBAC), Reporting, Migration.

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | MUV-per-channel = unique inbound client count per channel per month, company-scoped, no PII. | Brief §1/§4.1 |
| BR-02 | WA Web excluded by default; included only for Indonesian registrants. | Brief §1 |
| BR-03 | Geography is a tenant-level property, NOT a permission/RBAC. | Brief §6 |
| BR-04 | Enforcement is central and automatic (SaaS multi-tenant only). | Brief §1/§6 |

### 3.2 Acceptance Criteria

- Per-channel unique inbound client count renders in Analytics shell, company-scoped, integer, no PII, monthly period.
- Non-ID registrants do not get WA Web channel; ID registrants do; exclusion does not create billing charges.

### 3.3 Assumptions

- A1. "Inbound client" = unique contact (normalized phone), not unique conversation — **to be confirmed (OQ-01)**.
- A2. Widget inbound clients exist as contacts (normalized phone) or are identifiable without PII — **to be confirmed**.
- A3. Phone prefix (`+62`) is the primary country signal and IP geo is the fallback (per brief recommendation).
- A4. Existing tenants are Indonesian by default (no re-gating) unless data shows otherwise — **to be confirmed (OQ-05)**.
- A5. There is no separate `subscription-service`; subscriptions live in `company-service` and billing in `payment-service` (per `Memory/CLAUDE-be.md`).

### 3.4 Clarifications Needed

- OQ-01 (metric definition), OQ-02 (mechanism/source), OQ-03 (legal vs product), OQ-04 (new section vs extend US-6), OQ-05 (existing tenants).

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- `analytics-service` (`:50069`, `satuinbox_analytics`) owns metrics, **pre-aggregation**, reports, exports. No per-channel unique-inbound-client metric exists.
- Per-channel usage exists in Add-ons US-6 (messages, active convos, response time, CSAT) — no unique inbound count.
- Visitor Analytics shows GA4 "Monthly Visitors"/"Monthly Active Users" (website traffic), explicitly forbids "MUV" as sole label (FR-010).
- `company-service` (`:50052`, `satuinbox_company`) owns companies/organizations/teams/**subscriptions**. No country field on company.
- `payment-service` (`:50057`) owns payments/wallets/**billing**.
- `channel-service` (`:50058`) owns client contacts (`client-contact`); Contact = one global contact, phone = unique identifier (normalized).
- `conversation-service` (`:50055`) owns conversations + `firstCustomerMessageAt`, channel.
- `whatsapp` (WA Web) service owns Baileys sessions; `createAccountChannel`/`InitInstance` creates a WA Web account channel.
- RBAC = CASL in `people-service`; Super Admin bypasses restrictions; Sales/Operational area-context scoping.
- Auth registration captures `phone` (Dual Registration FR-001); phone prefix available but unused for gating.

### 4.2 Proposed State (To-Be)

- Request 1: analytics-service computes/stores per-channel monthly distinct inbound contact count; FE renders in Analytics shell.
- Request 2: onboarding resolves country (phone prefix → IP geo → declared); country persisted on company; tenant-level feature flag/entitlement gates WA Web availability in wizard + activation + account-channel create.

### 4.3 State Transition / Data Flow Notes

- Request 1: conversation inbound event (`firstCustomerMessageAt` + channel) → analytics-service aggregation (distinct normalized phone per channel per month).
- Request 2: onboarding submit → country resolution → company.country persisted → entitlement/flag set → wizard hides WA Web for non-ID → `createAccountChannel` rejects non-ID at runtime.

---

## 5. Analyst Review Checklist

### 5.1 Notes per Checklist Item

| Area | Finding | Impact Level | Notes / Clarification Needed |
|------|---------|--------------|-------------------------------|
| Lifecycle / State | New country field lifecycle; entitlement availability state | HIGH | Source of truth + mutation + re-evaluation undefined (F-14, F-18) |
| SLA | None (no SLA impact) | LOW | N/A |
| RBAC / Permission | Geography MUST NOT be RBAC; but gating read must be tenant-scoped | HIGH | F-15 (super admin impersonation toggle) |
| Dependency | Cross-service: analytics (conversation+channel), gating (company+payment+whatsapp) | HIGH | F-04, F-12, F-19 |
| Backward Compatibility | Existing ID tenants must keep WA Web; billing unaffected | HIGH | F-13 (grandfather), F-19 (billing leak) |
| Edge / Exception | Month boundary, country ambiguity, spoofing | HIGH | F-07, F-16, F-17, F-18 |

---

## 6. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | analytics-service aggregation; company-service country field; whatsapp-service gate | analytics, company, whatsapp | HIGH | Server-side gate at all activation paths (F-11) |
| Database | New company country field + detection metadata; analytics pre-aggregation collection | satuinbox_company, satuinbox_analytics | HIGH | F-14, F-04 |
| API | New analytics endpoint/KPI contract; new country resolution in onboarding | gateway, proto contracts | MEDIUM | Proto-first; new gRPC contracts |
| UI/UX | Analytics KPI card/section; add-on wizard hides WA Web for non-ID | analytics shell, add-on wizard | MEDIUM | UI-only hiding is NOT enforcement (F-11) |
| Security / RBAC | Country spoofing, enforcement boundary, tenant isolation | onboarding, whatsapp | HIGH | F-10, F-11, F-15 |
| Performance | Distinct-count over conversation history | analytics-service | MEDIUM | Pre-aggregation + HLL (F-06) |
| Integration | analytics↔conversation/channel; company↔payment↔whatsapp | gRPC + RabbitMQ | HIGH | F-04, F-12, F-19 |
| Reporting / Analytics | New KPI | analytics shell | MEDIUM | Terminology (F-02) |
| Financial / Operational | Excluded tenants must not be charged for WA Web | payment/billing | MEDIUM | F-19 |

---

## 7. Dependency Analysis

### 7.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| MUV aggregation | conversation-service (channel + `firstCustomerMessageAt`) | event / gRPC | inbound | DB-per-service; no cross-service reads |
| MUV distinct contact | channel-service client-contact (normalized phone) | event / gRPC | inbound | phone is PII; must aggregate, not store raw |
| Country resolution | auth/onboarding phone field | gRPC (sync) | inbound | E.164 normalization required |
| WA Web gating | company-service country field + entitlement | gRPC (sync) | inbound | tenant-scoped read |
| WA Web activation gate | whatsapp-service `createAccountChannel` | gRPC (sync) | inbound | server-side rejection for non-ID |
| Billing exclusion | payment-service entitlement sync | event | outbound | excluded tenants not charged |

### 7.2 Shared Resources / Event Mapping

- Conversation inbound event (channel + timestamp) already flows for SLA; MUV aggregation can reuse it if it carries a contact/phone key.
- `analytics-service` pre-aggregation pattern (`ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`) is the natural home for MUV distinct-count.

---

## 8. Risk Analysis

### 8.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Non-ID tenant registers with spoofed +62 number / VPN IP and gains WA Web | High | Critical | Critical | Fail-closed; server-side enforcement; don't trust single signal (F-10) |
| R-02 | WA Web hidden only in wizard UI → activated via direct API | Medium | High | High | Enforce at `createAccountChannel` + provisioning (F-11) |
| R-03 | Metric mislabeled "MUV" → confused with GA4 Monthly Visitors | High | Medium | Medium | Rename + tooltip + glossary lock (F-02) |
| R-04 | Excluded tenant still charged for WA Web | Medium | High | High | Entitlement↔billing sync; wizard cannot select (F-19) |
| R-05 | Phone/IP country signal wrong → false include/exclude | Medium | High | High | E.164 normalization; tie-breaker; audit (F-16/F-17/F-18) |

### 8.2 Worst-Case Scenarios

- Compliance/legal exposure: a non-ID tenant obtains WA Web via spoofed signal and generates geography-restricted traffic → L4 legal/ToS breach (F-10 + F-11 together).
- Data integrity: MUV double-counts or under-counts because phone normalization differs from duplicate-detection normalization → misleading channel-ROI decisions (F-05).

---

## 9. Test Strategy Input for QA

### 9.1 Functional Scope
- MUV: per-channel distinct contact count for a fixed month; company scoping; zero-data month; multi-channel same contact counts once per channel.
- Gating: ID registrant gets WA Web; non-ID registrant does not; wizard hides vs API rejection parity.

### 9.2 Regression Scope
- Visitor Analytics FR-033/FR-034 (no calculation change); existing add-on wizard; onboarding flow; existing ID tenant WA Web access.

### 9.3 Integration Scope
- analytics↔conversation/channel distinct-count; company↔payment entitlement sync; whatsapp `createAccountChannel` gate.

### 9.4 UAT / Business Validation
- PM verifies MUV naming + value vs manual sample; ops verifies non-ID tenant cannot activate WA Web.

### 9.5 Automation-Relevant Notes
- Spoofing scenarios: +62 number with non-ID IP; non-ID number with ID IP; VPN/proxy IP; ambiguous country tie-breaker.

---

## 10. Production Safety

- **Rollback Strategy:** feature-flag off (both ship behind flags). Request 2 rollback = remove country field effect / set flag to allow-all; do NOT retro-exclude existing tenants.
- **Feature Toggle Requirement:** Yes for both (brief §5).
- **Backward Compatibility Notes:** existing ID tenants unaffected; billing unchanged; onboarding path preserved.
- **Staged Rollout Recommendation:** internal tenants → limited ID cohort → full; validate gating on staging first.
- **Monitoring / Alerting Needs:** country-resolution outcome metrics; gating rejection rate; MUV aggregation lag; billing/entitlement mismatch alerts.
- **Logging / Audit Gaps:** country detection method + source must be audited (which signal decided ID vs non-ID) for compliance; audit-service consumes events only (no sync query) — audit trail must be event-driven.

---

## 11. Findings

### Request 1 — MUV per Channel

#### F-01 · P2 Medium · REQUIREMENT GAP — "inbound client" is undefined (OQ-01)
**Status:** Confirmed
**Location:** Requirement (Brief §7 OQ-01); metric definition
**Scenario:** PM asks "unique inbound clients this month"; aggregator must know whether to dedupe by contact (normalized phone) or by conversation.
**Expected:** A machine-executable definition: unique normalized contact per channel per calendar month, company-scoped.
**Actual / Failure Mode:** Brief leaves it open; the two readings produce materially different numbers and different data sources (Contact vs Conversation).
**Root Cause:** Metric semantics not finalized before intake.
**Evidence:** Brief §7 OQ-01; `Memory/global-memory.md` (Contact = one global contact, phone = unique identifier).
**Impact:** Wrong aggregation path chosen at design time → rework + misleading ROI metric.
**Blast Radius:** analytics-service aggregation, Contact/Conversation data.
**Recommendation:** Lock "unique normalized contact per channel per month" in PRD; reject conversation-based dedupe.
**Suggested Test:** Same contact messages twice in same channel/month → counted once; same contact in two channels → counted once per channel.

#### F-02 · P2 Medium · INCONSISTENCY — "MUV" label collides with Visitor Analytics terminology
**Status:** Confirmed
**Location:** Terminology / Analytics shell
**Scenario:** New metric is requested as "MUV per channel"; Visitor Analytics already uses "Monthly Visitors" and explicitly forbids "MUV" as a standalone label.
**Expected:** Distinct, non-ambiguous label for the per-channel metric.
**Actual / Failure Mode:** Reusing "MUV" creates two different metrics sharing an acronym (GA4 website visitors vs inbound channel clients) → user/decision confusion.
**Root Cause:** Domain terminology not reconciled across PRDs.
**Evidence:** `PRD/Analytics/PRD Analytics - Visitor Analytics.md` FR-010 ("MUST NOT show MUV as the only visible label"), OKR (avoid "MUV" alone), FR-008 (Monthly Visitors = GA4 Users/Total Users).
**Impact:** Misleading analytics; violates Visitor Analytics naming discipline.
**Blast Radius:** Analytics shell, reporting, PM/ops decisions.
**Recommendation:** Name it "Unique Inbound Clients" / "Pelanggan Unik Bulanan per Channel"; never "MUV"; add glossary + tooltip.
**Suggested Test:** KPI label/glossary does not contain "MUV"; tooltip distinguishes from "Monthly Visitors".

#### F-03 · P3 Low · REQUIREMENT GAP — in-scope channel enumeration missing
**Status:** Confirmed
**Location:** Requirement (Brief §4.1)
**Scenario:** Metric covers "WA Web, Widget, and any channel with inbound traffic" — enumeration is open-ended.
**Expected:** Explicit channel list (WA Web, Widget, WhatsApp API, Instagram, Messenger, Telegram, Email, Shopee) with Widget inbound semantics defined.
**Actual / Failure Mode:** "any channel with inbound traffic" is ambiguous; Widget may be anonymous (no phone) — cannot dedupe by phone.
**Root Cause:** Scope not pinned.
**Evidence:** Brief §4.1; `Memory/CLAUDE-be.md` (widget service, client contacts in channel-service).
**Impact:** Metric may silently exclude channels or fail on anonymous Widget traffic.
**Blast Radius:** analytics-service, widget/channel.
**Recommendation:** Enumerate channels; define Widget identity key (contact id / session fingerprint, no PII) separately.
**Suggested Test:** Widget inbound counted correctly per defined identity key.

#### F-04 · P2 Medium · DESIGN FLAW — MUV aggregation source is cross-service + PII-bearing
**Status:** Confirmed
**Location:** Data model / analytics-service
**Scenario:** Distinct contact count needs conversation (channel + `firstCustomerMessageAt`) AND contact (normalized phone) — both in different services; DB-per-service forbids cross-service reads; phone is PII.
**Expected:** Event-driven distinct-count that never persists raw phone into analytics.
**Actual / Failure Mode:** Naive design either (a) calls conversation+channel service per query (N+1/scale) or (b) stores raw phone in analytics (PII breach, violates brief "no PII").
**Root Cause:** DB-per-service + PII constraint not reconciled in brief.
**Evidence:** `Memory/CLAUDE-be.md` §2 (DB-per-service), §3 (channel-service owns client contacts; analytics-service owns pre-aggregation); Brief §4.1 (no PII).
**Impact:** PII leakage or unbounded cross-service queries.
**Blast Radius:** analytics-service, conversation-service, channel-service.
**Recommendation:** Reuse `ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`; aggregate distinct phone via hashed key or HyperLogLog per channel per month; no raw phone storage.
**Suggested Test:** Verify analytics DB has no raw phone column; distinct count matches sampled truth.

#### F-05 · P2 Medium · DATA INTEGRITY — phone normalization must match duplicate-detection
**Status:** Suspected
**Location:** Data / analytics aggregation
**Scenario:** MUV dedupes by phone; duplicate-detection already uses normalized phone (`global-memory.md`).
**Expected:** MUV uses the identical normalization so counts are consistent with contact dedupe.
**Actual / Failure Mode:** A divergent normalization (e.g. +62 vs 0 prefix, separators) over- or under-counts unique clients.
**Root Cause:** No shared normalization contract referenced.
**Evidence:** `Memory/global-memory.md` (duplicate detection uses normalized phone); Brief §3.2.
**Impact:** Inflated/deflated unique counts → wrong channel-ROI.
**Blast Radius:** analytics aggregation, contact identity.
**Recommendation:** Reuse the same normalized-phone function/contract; document it as the MUV identity key.
**Suggested Test:** `+62812...` and `0812...` same contact → one unique client.

#### F-06 · P3 Low · PERFORMANCE — distinct-count at scale needs pre-aggregation
**Status:** Possible
**Location:** analytics-service
**Scenario:** Distinct-count over all conversations per company per month is expensive as companies grow (10x/100x).
**Expected:** Bounded query via pre-aggregation (daily unique keys) or approximate distinct-count.
**Actual / Failure Mode:** Naive full-scan distinct-count degrades as volume grows.
**Root Cause:** Scale not addressed in brief.
**Evidence:** `Memory/CLAUDE-be.md` (analytics-service already has pre-aggregation).
**Impact:** Slow analytics response at scale.
**Blast Radius:** analytics-service.
**Recommendation:** Pre-aggregate per day per channel (hashed distinct keys), roll up monthly; HLL if approximate acceptable.
**Suggested Test:** Load test with large conversation volume; response within analytics SLO.

#### F-07 · P3 Low · EDGE — month boundary timezone unspecified
**Status:** Confirmed
**Location:** Metric period rule
**Scenario:** Monthly bucket boundary must be defined (company workspace timezone vs WIB vs UTC).
**Expected:** Explicit timezone for month bucketing, aligned with Visitor Analytics FR-012.
**Actual / Failure Mode:** Visitor Analytics uses company workspace timezone (FR-012); billing uses WIB (FR-007); MUV left unspecified → midnight-boundary miscounts.
**Root Cause:** Period rule not specified in brief.
**Evidence:** Visitor Analytics FR-012; Subscription FR-007.
**Impact:** Inbound near month boundary misattributed.
**Blast Radius:** analytics aggregation.
**Recommendation:** Align MUV month to company workspace timezone (consistency with Visitor Analytics); use `>= start AND < end`.
**Suggested Test:** Inbound at month-boundary second lands in correct month.

#### F-08 · P3 Low · OPERABILITY — no backfill definition
**Status:** Confirmed
**Location:** Rollout / recovery
**Scenario:** New metric shows 0 for historical months unless backfill is defined.
**Expected:** Explicit backfill (or "starts from go-live") decision.
**Actual / Failure Mode:** PM reads 0 for prior months and misreads adoption.
**Root Cause:** Not addressed in brief.
**Evidence:** Brief §4.1 (monthly summary; no backfill note).
**Impact:** Misleading empty states.
**Blast Radius:** analytics reporting.
**Recommendation:** State "metric counts from go-live; no historical backfill in Phase 1" or run backfill job.
**Suggested Test:** Empty-state helper copy present for pre-launch months.

### Request 2 — WA Web Geography Exclusion

#### F-09 · P1 High · REQUIREMENT GAP — authoritative country source not locked (OQ-02, blocking)
**Status:** Confirmed
**Location:** Requirement (Brief §7 OQ-02)
**Scenario:** Include/exclude depends on a country decision; the authoritative signal priority (phone vs IP vs declared) and tie-breaker are unresolved.
**Expected:** Locked priority + tie-breaker + fail-closed default before PRD.
**Actual / Failure Mode:** Engineering proceeds without a definitive rule → ad-hoc, non-deterministic gating.
**Root Cause:** Mechanism recommended (Option B+D) but source authority left open.
**Evidence:** Brief §6 (recommendation) and §7 OQ-02 ("authoritative country source ... ?").
**Impact:** Non-deterministic enforcement; rework; compliance ambiguity.
**Blast Radius:** onboarding, company-service, whatsapp gating.
**Recommendation:** Lock: (1) +62 phone prefix primary, (2) IP geo fallback, (3) declared only as tie-breaker, (4) default deny on ambiguity.
**Suggested Test:** Each signal combination produces deterministic ID/non-ID.

#### F-10 · P1 High · SECURITY — country spoofing undermines the exclusion
**Status:** Confirmed
**Location:** Enforcement / onboarding
**Scenario:** `+62` prefix and IP geo are both cheaply spoofable: a non-ID actor registers with a +62 VOIP/Google-Voice number or behind an ID VPN/proxy → gets WA Web.
**Expected:** Geography intent (legal/ToS exposure control) actually holds against spoofing.
**Actual / Failure Mode:** Signal-based gating is bypassed; the compliance exposure the feature exists to prevent remains.
**Root Cause:** Phone prefix + IP geo are weak identity/geography proofs; brief relies on them without anti-spoof control.
**Evidence:** Brief §6 (phone prefix primary, IP geo fallback); `Memory/global-memory.md` (RBAC Super Admin bypass; SaaS multi-tenant).
**Impact:** L3/L4 compliance/ToS breach; geography gate is theater for a motivated non-ID tenant.
**Blast Radius:** legal/compliance, WA Web service, trust in gate.
**Recommendation:** Treat phone prefix/IP as *heuristics*, not proof; add stronger signals (phone OTP ownership verification to a +62 number, payment/billing geography) and accept residual risk; document residual risk to legal (OQ-03).
**Suggested Test:** Non-ID actor with spoofed +62 number + VPN — assert gating still rejects or risk is explicitly accepted by legal.

#### F-11 · P1 High · SECURITY — enforcement must be server-side at every activation path, not UI-only
**Status:** Confirmed
**Location:** Enforcement boundary
**Scenario:** Hiding WA Web in the add-on wizard is cosmetic; a non-ID tenant (or a buggy/bad client) can still call the whatsapp-service `createAccountChannel`/`InitInstance` API directly.
**Expected:** Server-side rejection at provisioning + wizard availability + account-channel creation.
**Actual / Failure Mode:** UI-hidden button mistaken for authorization (skill explicitly forbids this).
**Root Cause:** Enforcement point not specified in brief; current runtime has no geography gate at all.
**Evidence:** `Memory/CLAUDE-be.md` §3 (whatsapp service `createAccountChannel`, `InitInstance`); Brief §6 (gating "availability of entitlement").
**Impact:** Non-ID tenants gain WA Web despite exclusion; gate bypassable.
**Blast Radius:** whatsapp service, API gateway, provisioning.
**Recommendation:** Enforce a tenant-scoped server-side check in whatsapp-service at `createAccountChannel` + wizard availability + subscription entitlement; never rely on FE hiding.
**Suggested Test:** Direct API call to create WA Web account for non-ID tenant → rejected.

#### F-12 · P2 Medium · INCONSISTENCY — "subscription-service" does not exist as a distinct service
**Status:** Confirmed
**Location:** Integration naming (Brief §1/§5/§6)
**Scenario:** Brief lists integration risk against "subscription-service"; the BE topology has no such service.
**Expected:** Correct service targets for the entitlement/billing change.
**Actual / Failure Mode:** Subscriptions are owned by `company-service`; billing by `payment-service`. Planning against a phantom service mislocates the change.
**Root Cause:** Brief used a conceptual name, not the verified service map.
**Evidence:** `Memory/CLAUDE-be.md` §3 (company-service owns "subscriptions"; payment-service owns "billing"); Brief §1/§5/§6.
**Impact:** Wrong impact analysis; missed contract changes on company/payment services.
**Blast Radius:** company-service, payment-service.
**Recommendation:** Correct PRD to reference `company-service` (entitlement/flag) + `payment-service` (billing) + `whatsapp` (activation).
**Suggested Test:** Trace change to actual services; confirm entitlement flag lives in company-service.

#### F-13 · P2 Medium · REQUIREMENT GAP — existing non-ID tenants handling (OQ-05, blocking)
**Status:** Confirmed
**Location:** Migration scope
**Scenario:** If any tenant registered outside Indonesia (or with non-ID signal) already has WA Web, must decide grandfather vs retro-exclude; and what happens when a tenant's country changes later.
**Expected:** Explicit grandfather/re-evaluation policy before PRD.
**Actual / Failure Mode:** Retro-exclusion breaks existing paid access/billing; undefined country-change leaves stale gating.
**Root Cause:** Not resolved in brief (OQ-05 blocking).
**Evidence:** Brief §7 OQ-05; §4.3 (protected: existing ID tenants; but non-ID not addressed).
**Impact:** Customer churn/billing breakage or compliance gap.
**Blast Radius:** existing tenants, billing, whatsapp.
**Recommendation:** Grandfather existing tenants; define country-change re-evaluation trigger (or immutable country at onboarding with manual ops override).
**Suggested Test:** Existing non-ID tenant keeps WA Web after rollout; country-change re-evaluation path defined.

#### F-14 · P2 Medium · REQUIREMENT GAP — tenant country field data model undefined
**Status:** Confirmed
**Location:** Data model (company-service)
**Scenario:** No country field exists on company; gating needs a persisted, auditable country + detection method.
**Expected:** `company.country` + `countryDetectionMethod` (phone/ip/declared) + `countryResolvedAt` + audit event.
**Actual / Failure Mode:** Without detection-method metadata, compliance cannot show *why* a tenant was classified; without audit, cannot defend decisions.
**Root Cause:** New field not specified.
**Evidence:** `Memory/CLAUDE-be.md` §3 (company-service schema, no country); Dual Registration PRD §10 (no country field).
**Impact:** Non-auditable gating; compliance defensibility weak.
**Blast Radius:** company-service, audit-service.
**Recommendation:** Add field + method + timestamp; emit `company_country_resolved` audit event (audit-service is event-driven only).
**Suggested Test:** Field populated on onboarding; audit event emitted; method recorded.

#### F-15 · P2 Medium · SECURITY — country flag must be tenant-scoped; super-admin impersonation risk
**Status:** Suspected
**Location:** Security / multi-tenant
**Scenario:** Country gating read must scope strictly by `companyId`; Super Admin bypass (global-memory) or tenant impersonation could alter a tenant's country/flag.
**Expected:** Gating decision derived only from the authenticated tenant's own company record; impersonation/super-admin changes audited.
**Actual / Failure Mode:** A shared/global flag or an impersonation session flips gating for the wrong tenant → cross-tenant behavior change.
**Root Cause:** Super Admin bypass + impersonation exist; not addressed by brief.
**Evidence:** `Memory/global-memory.md` (Super Admin bypasses restrictions); `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`.
**Impact:** Cross-tenant gating manipulation.
**Blast Radius:** all tenants via super-admin path.
**Recommendation:** Store country/flag on company record; gating reads `companyId` only; audit super-admin/impersonation writes.
**Suggested Test:** Super admin impersonation does not change target tenant's gating without audit trail.

#### F-16 · P3 Low · DESIGN FLAW — phone-prefix reliability is weak
**Status:** Confirmed
**Location:** Country detection
**Scenario:** Number portability, international formatting (`+62`/`62`/`08`), shared/office numbers, and non-ID numbers carrying `+62` in caller context all weaken prefix inference.
**Expected:** E.164 normalization before prefix check; known-limitation documented.
**Actual / Failure Mode:** Un-normalized prefix check yields false ID/non-ID.
**Root Cause:** Brief assumes prefix is reliable (primary signal).
**Evidence:** Brief §6 (phone prefix primary); Dual Registration FR-001 (phone captured raw).
**Impact:** False include/exclude.
**Blast Radius:** onboarding.
**Recommendation:** Normalize to E.164 before `+62` check; treat prefix as heuristic (see F-10).
**Suggested Test:** `0812…`, `+62812…`, `62812…` all classify consistently.

#### F-17 · P3 Low · DESIGN FLAW — IP geo is coarse and spoofable
**Status:** Confirmed
**Location:** Country detection (fallback)
**Scenario:** IP geo is coarse (region/city precision), affected by carrier NAT/CGNAT and mobile networks, and bypassed by VPN/proxy.
**Expected:** IP used only as fallback, with known false-positive/negative rate accepted.
**Actual / Failure Mode:** IP geo misclassifies → wrong gating.
**Root Cause:** IP geo limitation not acknowledged in brief.
**Evidence:** Brief §6 (IP geo fallback).
**Impact:** False include/exclude.
**Blast Radius:** onboarding.
**Recommendation:** Document IP geo as best-effort fallback; fail-closed on low confidence.
**Suggested Test:** VPN/CNAT IP → deterministic default-deny behavior.

#### F-18 · P2 Medium · REQUIREMENT GAP — ambiguous-country tie-breaker + fail-closed default undefined
**Status:** Confirmed
**Location:** Country resolution
**Scenario:** Phone says ID, IP says non-ID (or reverse, or both ambiguous) — no rule defined.
**Expected:** Explicit tie-breaker; default deny (fail-closed) for compliance.
**Actual / Failure Mode:** Unspecified default could default-allow → non-ID tenant gets WA Web.
**Root Cause:** Not addressed.
**Evidence:** Brief §6 (declared as tiebreaker, but conflict rule unspecified).
**Impact:** Non-deterministic or permissive gating.
**Blast Radius:** onboarding.
**Recommendation:** Lock priority + default-deny on any ambiguity; log the conflict for audit.
**Suggested Test:** Conflicting phone/IP signals → default deny + audit log.

#### F-19 · P2 Medium · DESIGN FLAW — entitlement gating must not leak into billing; add-on exposure state
**Status:** Suspected
**Location:** Subscription/billing integration
**Scenario:** Excluded tenants must not be charged for WA Web; also WA Web add-on may not even be separately exposed yet (FR-004 "if exposed separately").
**Expected:** Wizard cannot select WA Web for non-ID; billing never creates a WA Web line item for non-ID; existing ID billing unchanged.
**Actual / Failure Mode:** Gating availability only, but a stale/leftover entitlement or a direct billing path still charges non-ID tenants; or WA Web exposure state itself is unresolved.
**Root Cause:** Entitlement↔billing sync + WA Web exposure state not pinned.
**Evidence:** Subscription PRD FR-004 (WA Web "if exposed separately"), FR-008/FR-010 (proration), Appendix A-001 (WA Web pricing configurable); Brief §4.3.
**Impact:** Revenue/compliance error (charged-but-excluded, or excluded-but-charged).
**Blast Radius:** payment-service, company-service.
**Recommendation:** Couple availability gate to entitlement + billing; verify WA Web add-on exposure state as a dependency before PRD.
**Suggested Test:** Non-ID tenant's invoice has no WA Web line item; ID tenant billing unchanged.

#### F-20 · P2 Medium · REQUIREMENT GAP — legal vs product driver unconfirmed (OQ-03)
**Status:** Confirmed
**Location:** Priority/compliance
**Scenario:** Is the exclusion legal/regulatory (→ L4) or product/market (→ L3)? Unconfirmed.
**Expected:** Confirm driver; if legal, require legal sign-off + fail-closed + audit trail + retention.
**Actual / Failure Mode:** Built as L3 product feature when it is actually a legal requirement → insufficient rigor; or over-built for a product preference.
**Root Cause:** Not resolved (OQ-03 non-blocking but severity-affecting).
**Evidence:** Brief §7 OQ-03; §1 (L3 → L4 if legal).
**Impact:** Wrong priority + wrong rigor + wrong sign-off.
**Blast Radius:** legal, compliance, delivery.
**Recommendation:** PM confirms legal vs product; escalate rigor if legal.
**Suggested Test:** N/A (decision), but gates F-09/F-10/F-11 to L4 rigor if legal.

---

## 12. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | "Inbound client" = unique contact vs conversation; channel list | Aggregation source + identity key | Yes (PRD) |
| OQ-02 | Authoritative country source + tie-breaker + fail-closed | Deterministic gating | Yes (PRD) |
| OQ-03 | Legal/regulatory vs product/market driver | Priority + rigor + sign-off | No (priority) |
| OQ-04 | New Analytics section vs extend Add-ons US-6 | Duplicate surface | No |
| OQ-05 | Existing non-ID tenants: grandfather vs retro-exclude; country change | Migration scope | Yes (PRD) |

---

## 13. Recommendation

### 13.1 Recommendation Rationale

- Both requests are legitimate and independently shippable → **SPLIT_FEATURE** (confirms brief's `SPLIT_REQUEST`).
- Request 1 is low-risk and self-contained but must fix terminology (F-02) and define the metric (F-01) — **PROCEED_WITH_CAUTION**.
- Request 2 is high-risk (compliance-adjacent, spoofable signal, cross-service) with two blocking decisions (F-09, F-13) and a serious spoofing/enforcement gap (F-10, F-11) — **PROCEED_WITH_CAUTION** pending OQ-02/OQ-05 and server-side enforcement design.

### 13.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `SPLIT_FEATURE` |
| Owner for Follow-up | PM (OQ-01/02/03/05), Engineering Lead (mechanism + enforcement) |
| Required Revisions | Rename metric; lock country source + fail-closed; server-side gate; tenant country field |
| Suggested Delivery Strategy | Phase split: Request 1 first (independent), Request 2 second (after OQ-02/OQ-05 + legal confirm) |
| Earliest Safe Next Step | PM resolves OQ-01/OQ-02/OQ-05; Analyst re-labels metric; Engineering sanity-checks country-detection + enforcement |

---

## 14. Traceability Matrix

| Req ID | Requirement | Finding | Impact Area | QA Input Status |
|--------|-------------|---------|-------------|-----------------|
| BR-01 | MUV per channel, no PII | F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08 | Analytics | Pending |
| BR-02 | WA Web exclude by default, ID-only | F-09, F-10, F-11, F-13, F-16, F-17, F-18 | Auth + WA Web | Pending |
| BR-03 | Geography = tenant property, not RBAC | F-15 | Security/RBAC | Pending |
| BR-04 | Central automatic enforcement | F-11, F-12, F-19 | Integration | Pending |

---

## 15. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-09-22 | Initial assessment created (SPLIT_FEATURE; Request 1 PROCEED_WITH_CAUTION, Request 2 PROCEED_WITH_CAUTION) | Analyst |
