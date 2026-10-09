# Product Requirement Document (PRD)

**Feature:** WA Web Feature Service — Geography-Based Entitlement Exclusion
**Product Manager / Author:** Dany Christian
**Engineering Lead:** Naftal Yunior
**Design Lead:** TBD
**PRD Mode:** Full (High complexity, shared-impact — Auth × WhatsApp Web × Subscription)
**Domain:** Cross-domain: Auth (registration/onboarding) + WhatsApp Web (feature-service) + Subscription (plan/add-on entitlement)
**Change Class:** `NEW_CAPABILITY`

---

## 1. Revision History

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-09-22 | Dany Christian (PM) | Initial PRD. Mechanism = country detection (phone `+62` prefix primary → IP geolocation fallback → declared country tiebreaker) + tenant-level entitlement gate, layered into the existing plan/add-on entitlement model. NOT RBAC. |

---

## 2. Overview

| Item | Description |
| ----- | ----- |
| Purpose | Exclude the WhatsApp Web feature-service (Baileys / unofficial-API based) from SatuInbox packages by default; include it **only** for tenants registering from Indonesia. This centralizes geography-dependent legal/ToS/compliance exposure at tenant provisioning in a SaaS multi-tenant-only product. |
| Key Capabilities | Server-side country detection at onboarding (`+62` phone prefix primary → IP geolocation fallback → declared-country tiebreaker); persisted, auditable tenant country field; tenant-level entitlement gate that controls WA Web availability in the add-on/plan wizard **and** server-side enforcement at `createAccountChannel`; billing exclusion for non-entitled tenants; super-admin override with audit trail. |
| Outcome | Tenants registering from outside Indonesia do not obtain the WA Web channel; Indonesian registrants do. Excluded tenants are never charged for WA Web. Existing onboarded Indonesian tenants keep WA Web with no billing regression. |
| Explicit Non-Goal | This is **not** an RBAC/permission feature. Geography is a tenant-level property, not a role/permission. RBAC (`people-service`/CASL) is untouched. |

### 2.1 Scope Definition

| In Scope | Out of Scope |
| ----- | ----- |
| Country detection for **new** registrants (Indonesia vs non-Indonesia) at onboarding. | Changing the underlying plan/add-on pricing model or price values. |
| Persisted tenant/company country field + detection-method metadata + audit trail. | Re-gating already-onboarded **Indonesian** tenants (their WA Web access is protected). |
| Tenant-level entitlement gate layered into the existing plan/add-on entitlement model (Option B + Option C). | Self-hosted/on-prem deployments (SatuInbox is SaaS multi-tenant only — N/A). |
| Server-side enforcement: add-on/plan wizard availability + `whatsapp` `createAccountChannel`/`InitInstance` gate + billing exclusion. | Re-defining RBAC roles, permissions, or the Super Admin role model. |
| Super-admin / ops override with full audit trail (tenant-scoped). | Anti-spoof controls beyond OTP ownership verification + cross-signal consistency + audit (e.g., full KYC/legal document verification) — see Security. |
| Re-evaluation policy for tenant country change (defined as trigger + recommended default). | Retro-active exclusion of existing non-Indonesian tenants (recommended: grandfather; see OQ-05). |

### 2.2 Release Scope by Phase

| Phase | Scope |
| ----- | ----- |
| Phase 1 | Country detection + persisted country field + entitlement gate + server-side enforcement at `createAccountChannel` + billing exclusion + audit trail + super-admin override. Rollout behind a feature flag; grandfather existing tenants. |
| Phase 2 (conditional on OQ-03 = legal/regulatory) | OTP ownership verification as a **required** anti-spoof signal; manual legal review queue for conflict/fail-closed cases; retention/purge policy for country-detection audit events. |

---

## 3. Problem Statement

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | WhatsApp Web (Baileys/unofficial API) carries geography-dependent legal/ToS/compliance exposure that varies by where the tenant is located. | Compliance/market-access risk if a non-Indonesian tenant is provisioned with WA Web. |
| PS-002 | Today WA Web is available as an add-on with **no geography gate**; there is no persisted country field on the tenant. | No way to centrally enforce an Indonesia-only inclusion rule. |
| PS-003 | Phone prefix and IP geolocation are both cheaply spoofable (VOIP numbers, VPN). | A naive signal check would make the gate cosmetic (theater) rather than an actual control. |
| PS-004 | Enforcement is not specified at a server-side boundary. | Hiding the UI button would be bypassable via direct API calls to the `whatsapp` service. |
| PS-005 | Entitlement gating is not coupled to billing. | Excluded tenants could still be charged for WA Web, or entitled tenants lose billing. |

---

## 4. Objectives & Key Results

| Objective | Key Result |
| ----- | ----- |
| Enforce Indonesia-only WA Web inclusion centrally and automatically. | 100% of new tenants with a non-Indonesia resolved country have WA Web excluded at provisioning; 100% of Indonesian tenants have it available. |
| Make enforcement server-side and bypass-resistant. | Direct API call to `createAccountChannel` for a non-entitled tenant is rejected 100% of the time (not merely hidden in UI). |
| Preserve existing tenants and billing. | 0 existing onboarded Indonesian tenants lose WA Web; 0 excluded tenants are charged a WA Web line item. |
| Make the geography decision auditable and defensible. | Every tenant carries `country` + `countrySource` + resolution timestamp; a `company_country_resolved` audit event is emitted for every resolution/override. |

---

## 5. User Stories & Acceptance Criteria

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a new registrant located in Indonesia, I want WA Web to be available to me after onboarding so I can use the WhatsApp Web channel. | 1. Given I register with an E.164 `+62` phone number and (when required) complete OTP ownership verification, When country resolution runs, Then my tenant `country` = `ID` and `waWebGeographyState` = `entitled`. 2. Given an `entitled` tenant, When I open the add-on/plan wizard, Then the WA Web option is visible and selectable. |
| US-002 | P0 | As a new registrant located outside Indonesia, I want the WA Web feature-service to be excluded from my package so my account never includes or charges for it. | 1. Given I register with a non-`+62` number and a non-Indonesia IP, When country resolution runs, Then my tenant `country` ≠ `ID` and `waWebGeographyState` = `excluded`. 2. Given an `excluded` tenant, When I open the add-on wizard, Then WA Web is not selectable; and When I (or any client) call the WA Web activation API directly, Then the server rejects the call. |
| US-003 | P0 | As a Super Admin / ops user, I want to override a tenant's WA Web geography state (allow or exclude) with a full audit trail so I can handle exceptional cases. | 1. Given I have Super Admin access, When I change a tenant's `waWebGeographyState` to `override_allowed` or `override_excluded`, Then the change records `waWebGeographyChangedBy`, `waWebGeographyChangedAt`, and an audit event, and does **not** affect any other tenant. 2. Given an impersonation session, When I attempt the override, Then the target tenant's own `companyId` is the only record modified and the action is attributed to the impersonating actor. |
| US-004 | P0 | As the billing system, I want excluded tenants to never receive a WA Web charge so revenue/entitlement stay consistent. | 1. Given an `excluded` tenant, When invoices are generated, Then no WA Web line item is produced and no WA Web proration applies. 2. Given an `entitled` tenant, When they add WA Web, Then existing proration/invoice behavior is unchanged. |
| US-005 | P0 | As an existing onboarded tenant, I want my current WA Web access to continue unchanged after this feature ships so there is no regression. | 1. Given an existing tenant with WA Web access, When the feature flag is enabled and migration runs, Then the tenant is marked `grandfathered` and WA Web remains available and billed exactly as today. |
| US-006 | P1 | As a compliance/ops reviewer, I want to see why a tenant was classified and any signal conflict so I can audit and, if needed, manually review. | 1. Given a tenant resolved via any path, When I inspect the tenant record, Then I can see `country`, `countrySource`, `countryDetection` (prefix/IP/declared + `conflictFlag`), and `countryResolvedAt`. 2. Given a conflict or fail-closed resolution, When it occurs, Then an audit event records the conflict and the tenant is flagged for manual review. |

---

## 6. Functional Requirements

### 6.1 Country Detection (Mechanism — NOT RBAC)

| ID | Requirement |
| ----- | ----- |
| FR-001 | System MUST model geography as a **tenant-level property**, not a permission/RBAC grant. No CASL permission, role, or ability MUST be created for WA Web geography. RBAC (`people-service`) remains untouched. |
| FR-002 | System MUST resolve the tenant country at onboarding using the following priority, applied in order: (1) **primary** — E.164-normalized registered phone with country code `+62` → candidate Indonesia; (2) **fallback** — when the phone is absent, unparseable, or non-`+62`, IP geolocation of the registration request → candidate country; (3) **tiebreaker** — user-declared country, used ONLY when the phone and IP signals conflict or are both ambiguous. |
| FR-003 | System MUST normalize the phone to E.164 before the `+62` prefix check, so `0812…`, `+62812…`, and `62812…` classify identically. |
| FR-004 | System MUST treat phone prefix and IP geolocation as **heuristics, not proof**, and MUST record which signal(s) decided the result (see Data Model). |
| FR-005 | **[DECISION NEEDED — OQ-02]** System MUST default to **fail-closed** (`excluded`) on any unresolved ambiguity or signal conflict. **RECOMMENDED DEFAULT:** `+62` prefix primary; IP geolocation fallback; declared country tiebreaker only; fail-closed `excluded` on ambiguity/conflict. **Sign-off: PM (Dany Christian) + Engineering Lead (Naftal Yunior).** |
| FR-006 | When the primary `+62` phone signal is used, System MUST require proof of ownership of the `+62` number via OTP verification before that signal is accepted as authoritative; an unverified `+62` number MUST NOT, by itself, grant WA Web (anti-spoof, F-10). |

### 6.2 Tenant Country Data Model & Audit (F-14)

| ID | Requirement |
| ----- | ----- |
| FR-007 | System MUST persist on the company record (in `company-service`) the resolved `country` (ISO 3166-1 alpha-2), `countrySource` (`phone_prefix` \| `ip_geolocation` \| `declared` \| `manual_override` \| `fail_closed`), and `countryResolvedAt` (timestamp). |
| FR-008 | System MUST persist `countryDetection` detail: `phonePrefixE164`, `ipCountry`, `declaredCountry`, `conflictFlag`, and `decidedBy`, sufficient to reconstruct **why** a tenant was classified. |
| FR-009 | System MUST emit a `company_country_resolved` audit event (to `audit-service`, which is event-driven/consume-only) for every country resolution, including conflict/fail-closed outcomes, with actor and timestamp. |
| FR-010 | System MUST NOT send raw phone or other PII into audit events beyond the E.164 country-code-level signal necessary for the geography decision (no full number, no IP beyond country-level). |

### 6.3 Entitlement Gate (Option B + Option C)

| ID | Requirement |
| ----- | ----- |
| FR-011 | System MUST derive and persist a tenant-level `waWebGeographyState` enum on the company record: `entitled` (country `ID`), `excluded` (country ≠ `ID`), `grandfathered` (pre-existing tenant), `override_allowed`, `override_excluded`. |
| FR-012 | System MUST layer the geography rule into the **existing plan/add-on entitlement model** (Option C). WA Web is already an add-on entitlement; the geography rule gates the **availability** of that entitlement, not a parallel permission system. |
| FR-013 | System MUST make WA Web available in the add-on/plan wizard **only** when `waWebGeographyState ∈ {entitled, grandfathered, override_allowed}`; otherwise the WA Web option MUST be hidden/disabled (UI convenience only — never the enforcement point). |
| FR-014 | System MUST enforce the gate **server-side** in the `whatsapp` service at `createAccountChannel`/`InitInstance`: reject creation when `waWebGeographyState ∈ {excluded, override_excluded}`, returning a deterministic error code (see EH). UI hiding is NOT enforcement (F-11). |
| FR-015 | System MUST read the gating decision strictly from the authenticated tenant's own `companyId` (tenant-scoped). A shared/global flag MUST NOT be used (F-15). |

### 6.4 Billing Exclusion (F-19)

| ID | Requirement |
| ----- | ----- |
| FR-016 | System MUST ensure `payment-service` never creates a WA Web line item (recurring or prorated) for a tenant whose `waWebGeographyState ∈ {excluded, override_excluded}`. |
| FR-017 | System MUST keep existing WA Web billing (proration, invoices) for `entitled` and `grandfathered` tenants byte-for-byte unchanged. |
| FR-018 | System MUST synchronize entitlement↔billing so that an override that changes a tenant from `entitled`→`excluded` does not leave a stale WA Web charge on a future invoice (and vice versa). |

### 6.5 Super-Admin Override (F-15)

| ID | Requirement |
| ----- | ----- |
| FR-019 | System MUST allow a Super Admin (or authorized ops) to set a tenant's `waWebGeographyState` to `override_allowed` or `override_excluded`. The override MUST be tenant-scoped (single `companyId`) and MUST NOT propagate to any other tenant. |
| FR-020 | System MUST record `waWebGeographyChangedBy` + `waWebGeographyChangedAt` and emit an audit event for every override, including overrides performed through a Super Admin impersonation session (attributed to the impersonating actor). |
| FR-021 | System MUST ensure a Super Admin impersonation session modifies only the target tenant's record and never a global flag; the target's own `companyId` is the only write target. |

### 6.6 Protected Existing Behavior

| ID | Requirement |
| ----- | ----- |
| FR-022 | System MUST preserve WA Web access for already-onboarded Indonesian tenants (no re-gating). |
| FR-023 | System MUST preserve the registration/onboarding flow and tenant bootstrap (`companyId + organizationId`) exactly as today; country resolution is an additive step, not a rewrite. |
| FR-024 | System MUST preserve existing plan/add-on billing (proration formulas, invoice generation, PPN) unchanged for entitled tenants. |

---

## 7. Error Handling

| ID | Condition | System Behavior | User/API Message |
| ----- | ----- | ----- | ----- |
| EH-001 | `createAccountChannel`/`InitInstance` called for an `excluded`/`override_excluded` tenant. | Reject at the `whatsapp` service boundary with deterministic code `403-WAGEO-EXCLUDED`; emit audit event; do not create the account channel. | API: `403` `WA_WEB_GEOGRAPHY_EXCLUDED`. UI (if ever surfaced): "Fitur WhatsApp Web tidak tersedia untuk akun Anda." |
| EH-002 | Country resolution is ambiguous / signals conflict. | Fail-closed → `excluded`; set `conflictFlag = true`; emit `company_country_resolved` with conflict detail; flag tenant for manual review. | Internal review queue entry. |
| EH-003 | `+62` phone signal unverified (OTP not completed). | Do not accept `+62` as authoritative; fall through to IP geolocation/declared; if still unresolved, fail-closed. | (Onboarding) "Verifikasi nomor WhatsApp Anda untuk melanjutkan." |
| EH-004 | IP geolocation lookup fails or is unavailable (no confidence). | Treat as ambiguous → fail-closed `excluded`; record `ipCountry = null`, `conflictFlag = true`. | Internal. |
| EH-005 | Entitlement↔billing sync fails for an override (entitled→excluded). | Block the override until billing state is consistent; do not leave a stale WA Web charge. | "Perubahan tidak dapat disimpan saat ini. Silakan coba lagi." |
| EH-006 | Country resolution service (`company-service`) unreachable at onboarding. | Fail-closed: tenant is not granted WA Web until resolution succeeds; onboarding may proceed but WA Web stays `excluded` pending resolution. | Internal + non-blocking onboarding notice. |
| EH-007 | Super Admin override targets a non-existent `companyId` or is attempted cross-tenant. | Reject; no write. | "Tenant tidak ditemukan." |
| EH-008 | `waWebGeographyState` read is missing/unset (legacy record). | Treat as `grandfathered` if tenant pre-dates the feature and has WA Web; otherwise `excluded` (fail-closed). | Internal. |

---

## 8. Edge Cases

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Phone says `+62` but IP is clearly non-Indonesia (VPN/roaming/Google Voice). | `+62` is primary; if OTP-verified, classified Indonesia but `conflictFlag` recorded for audit; if not OTP-verified, fall back → likely `excluded`. Residual risk documented to legal (OQ-03). |
| EC-002 | Non-ID phone number but Indonesia IP (traveler / ID VPN). | IP geolocation fallback applies → candidate Indonesia; fail-closed review if confidence low. |
| EC-003 | Indonesian tenant registers with a non-`+62` number (e.g., foreign SIM) and a non-ID IP. | Classified non-Indonesia → `excluded` by default; Super Admin override is the remediation path (audited). |
| EC-004 | Number portability / shared/office number / international formatting. | E.164 normalization first (FR-003); prefix treated as heuristic only. |
| EC-005 | Tenant country changes later (relocation, M&A, branch). | No automatic re-inclusion. Country is resolved at onboarding and only changes via Super Admin override (audited). **[DECISION NEEDED — OQ-05]** Recommended default: immutable-at-onboarding + manual ops override. |
| EC-006 | Existing non-Indonesian tenant already has WA Web. | **[DECISION NEEDED — OQ-05]** Recommended default: grandfather (keep WA Web + billing; mark `grandfathered`). Retro-exclusion is the alternative and requires explicit PM sign-off + billing credit plan. |
| EC-007 | Ambiguous prefix (neither `+62` nor a clear other country) with low-confidence IP. | Fail-closed `excluded` + manual review (F-18). |
| EC-008 | Feature flag off / rollback. | Remove country-gate effect: set gate to allow-all; do NOT retro-exclude existing tenants. |

---

## 9. UI & UX Requirements

| Component | Description | Copy (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Add-on wizard — WA Web card (excluded) | WA Web option hidden or disabled with an explanatory note. | "Fitur WhatsApp Web tidak tersedia untuk wilayah Anda." |
| Add-on wizard — WA Web card (entitled) | WA Web selectable exactly as today. | (existing add-on copy) |
| Onboarding — phone verification | When `+62` primary signal is used, OTP ownership verification step. | "Verifikasi nomor WhatsApp Anda" / "Masukkan kode OTP" |
| Super Admin override control | Tenant-scoped toggle/action with confirmation and reason field. | "Aktifkan WhatsApp Web (override)" / "Nonaktifkan WhatsApp Web (override)" |
| Manual review queue (Phase 2) | Conflict/fail-closed tenants surfaced for ops review. | "Perlu peninjauan wilayah" |

**UX Rules:** Geography must not be presented as a user-facing "permission". The add-on wizard must not leak the existence of WA Web in a way that invites support load; an excluded tenant sees a neutral "not available for your region" note, never an error that suggests a bug.

---

## 10. Field & Validation

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `country` | String (ISO 3166-1 alpha-2) | `"ID"` | Valid alpha-2 code | Yes (post-onboarding) | `null` (pre-resolution) |
| `countrySource` | Enum | `phone_prefix` | One of `phone_prefix`, `ip_geolocation`, `declared`, `manual_override`, `fail_closed` | Yes | `null` |
| `countryResolvedAt` | Timestamp | `2026-09-22T10:00:00Z` | Valid timestamp | Yes | `null` |
| `countryDetection.phonePrefixE164` | String | `"62"` | Country-code only, no subscriber digits | Conditional | `null` |
| `countryDetection.ipCountry` | String | `"SG"` | Alpha-2 or `null` | Conditional | `null` |
| `countryDetection.declaredCountry` | String | `"ID"` | Alpha-2 or `null` | Conditional | `null` |
| `countryDetection.conflictFlag` | Boolean | `false` | — | Yes | `false` |
| `countryDetection.decidedBy` | Enum | `phone_prefix` | Same as `countrySource` set | Yes | `null` |
| `waWebGeographyState` | Enum | `entitled` | One of `entitled`, `excluded`, `grandfathered`, `override_allowed`, `override_excluded` | Yes | `grandfathered` (migration) / derived (new) |
| `waWebGeographyChangedBy` | String (userId) | `usr_xxx` | Valid actor id | Conditional (override) | `null` |
| `waWebGeographyChangedAt` | Timestamp | `2026-09-22T11:00:00Z` | Valid timestamp | Conditional (override) | `null` |

**Validation Rules:** PII discipline — store only country-code-level phone signal and country-level IP signal, never the full phone number or raw IP, in the geography fields or audit events.

---

## 11. Data Model

Ownership follows the verified service map (corrects the "subscription-service" misnomer, F-12):

| Service | Responsibility | New Field(s) |
| ----- | ----- | ----- |
| `company-service` (`:50052`) | **Authoritative** owner of `company` record; owns subscriptions/entitlements. | `country`, `countrySource`, `countryResolvedAt`, `countryDetection{…}`, `waWebGeographyState`, `waWebGeographyChangedBy/At` |
| `payment-service` (`:50057`) | Billing/invoices; consumes entitlement state to exclude WA Web line items. | No new fields (reads entitlement via sync). |
| `whatsapp` service | Baileys sessions; `createAccountChannel`/`InitInstance`; consumes `waWebGeographyState` to gate activation. | No new fields (reads entitlement via sync). |
| `audit-service` | Event-driven consume-only audit log. | Consumes `company_country_resolved` and `wa_web_geography_override` events. |
| `auth` / onboarding | Registration phone (`phone`); country resolution invoked during onboarding submit. | No schema change (reads existing `phone`). |

---

## 12. Lifecycle / State — Entitlement Provisioning

| Entity | Current State | Action / Trigger | Next State | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Company country | `unresolved` | Onboarding submit → country resolution | `resolved` (`country` set) | Resolution algorithm (FR-002) + OTP if `+62` primary (FR-006) | `country`/`countrySource`/`countryDetection`/`countryResolvedAt` persisted | `company_country_resolved` |
| Company country | `resolved` | Signals conflict / ambiguity | `fail_closed` (`excluded`) | Fail-closed default (FR-005) | `conflictFlag = true`, manual-review flag | `company_country_resolved` (conflict) |
| WA Web entitlement | `—` (new tenant) | Country `ID` | `entitled` | `country == "ID"` | WA Web available in wizard + `createAccountChannel` allowed | (implicit) |
| WA Web entitlement | `—` (new tenant) | Country ≠ `ID` | `excluded` | `country != "ID"` | WA Web hidden + `createAccountChannel` rejected + billing excluded | (implicit) |
| WA Web entitlement | `—` (existing tenant) | Migration (feature flag on) | `grandfathered` | Tenant pre-dates feature and has WA Web | Access + billing unchanged | `company_country_resolved` (grandfathered) |
| WA Web entitlement | any | Super Admin override | `override_allowed` \| `override_excluded` | Super Admin / ops, tenant-scoped `companyId` | State + `ChangedBy/At` persisted; billing re-synced | `wa_web_geography_override` |

---

## 13. Permissions / Visibility

| Role | Resolve country | View tenant country | Override WA Web geography | Create WA Web account channel |
| ----- | ----- | ----- | ----- | ----- |
| System (onboarding) | Allowed (automatic) | N/A | N/A | N/A |
| Tenant Admin | N/A | Own tenant (read-only) | Denied | Gated by `waWebGeographyState` |
| Supervisor | N/A | Denied | Denied | Gated by `waWebGeographyState` |
| Agent | N/A | Denied | Denied | Denied (existing RBAC) |
| Super Admin / ops | N/A | All tenants | Allowed (tenant-scoped, audited) | Gated by `waWebGeographyState` (override applies) |

**Note:** Super Admin override does **not** bypass the geography rule globally — it sets a per-tenant state that is still read strictly from that tenant's own `companyId`. This satisfies F-15 (tenant-scoped, audited override) without converting geography into an RBAC grant.

---

## 14. Interface / Event Contract

| Contract | Type | Producer | Consumer | Payload (key fields) | Error | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Country resolution (onboarding) | gRPC (sync) | `auth`/onboarding → `company-service` | `company-service` | `phone` (E.164), `ip` (country-level), `declaredCountry?` | validation / fail-closed | Reuses existing onboarding submit path; additive. |
| Entitlement read (wizard) | gRPC (sync) | FE (via gateway) → `company-service` | `company-service` | `companyId` | — | Tenant-scoped read of `waWebGeographyState`. |
| **Activation gate** | gRPC (sync) | FE/API → `whatsapp` `createAccountChannel` | `whatsapp` | `companyId`, account channel payload | `403-WAGEO-EXCLUDED` | **Server-side enforcement point (F-11).** |
| Billing exclusion sync | event (RabbitMQ) | `company-service` | `payment-service` | `companyId`, `waWebGeographyState` | — | Ensures excluded tenants never charged (F-19). |
| Country resolved | event | `company-service` | `audit-service` | `companyId`, `country`, `countrySource`, `conflictFlag`, actor, ts | — | `company_country_resolved`. |
| Override | event | `company-service` | `audit-service` | `companyId`, `newState`, `ChangedBy`, `ChangedAt`, reason | — | `wa_web_geography_override`. |

---

## 15. Non-Functional Requirements

| Category | Requirement |
| ----- | ----- |
| Performance | Country resolution MUST complete within the onboarding request budget (no new user-perceived delay > 500ms); IP geolocation lookup MUST have a bounded timeout. |
| Reliability | Country resolution and override MUST be idempotent; retries MUST NOT create duplicate audit events. |
| Security | All enforcement server-side; no client-controlled geography value is trusted; fail-closed on any signal loss. See Security section. |
| Observability | Metrics: country-resolution outcome distribution, `createAccountChannel` rejection rate, override count, entitlement↔billing mismatch alerts. |
| Auditability | `audit-service` events are consume-only; country decisions and overrides MUST be fully reconstructable from events (no synchronous audit query dependency). |
| Localization | User-facing copy in Bahasa Indonesia; technical identifiers English/mixed per profile. |

---

## 16. Migration / Compatibility

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| Existing tenants | Grandfather: mark existing tenants (esp. any non-ID with WA Web) `grandfathered`; no retro-exclusion. | PM + Engineering | Migration job sets state; existing ID tenants keep WA Web; billing unchanged. | Set gate to allow-all; no re-gating. |
| Feature flag | Ship behind a feature flag (new registrations only first). | Engineering | Staging + limited cohort before full. | Flag off → country field inert, WA Web available as today. |
| `company-service` schema | Additive nullable fields; no destructive change. | Engineering | Existing records read with `null` → treated `grandfathered`/`excluded` per EH-008. | Fields dropped; no effect. |
| Billing | Entitlement↔billing sync added; no change to existing proration/invoice formulas. | Engineering + Finance | Non-ID tenant invoice has no WA Web line; ID tenant invoice unchanged. | Revert sync; billing returns to entitlement-agnostic. |

---

## 17. Security

| ID | Threat / Finding | Control |
| ----- | ----- | ----- |
| SEC-001 (F-10) | Country spoofing via `+62` VOIP/Google-Voice number or VPN. | Phone prefix + IP are **heuristics, not proof**. `+62` primary signal requires OTP ownership verification (FR-006). Cross-signal inconsistency recorded as `conflictFlag` for audit. Residual risk documented to legal (OQ-03). |
| SEC-002 (F-11) | UI-only enforcement bypass. | Server-side rejection at `whatsapp` `createAccountChannel`/`InitInstance` (FR-014) + wizard availability is cosmetic only. |
| SEC-003 (F-14) | Missing tenant country data model. | `company.country` + `countrySource` + `countryResolvedAt` + `countryDetection` + `company_country_resolved` audit event (FR-007–FR-010). |
| SEC-004 (F-18) | Ambiguous country default-allow. | Fail-closed `excluded` on ambiguity/conflict (FR-005, EH-002). |
| SEC-005 (F-15) | Cross-tenant / super-admin impersonation flip. | Gating reads only the authenticated tenant's own `companyId`; overrides are tenant-scoped + audited + attributed to the impersonating actor (FR-015, FR-019–FR-021). |
| SEC-006 (F-16/F-17) | Weak prefix / coarse IP geo. | E.164 normalization before prefix check; IP used only as fallback with accepted false-positive rate; fail-closed on low confidence. |
| SEC-007 | PII leakage via audit/analytics. | Only country-code phone signal and country-level IP are persisted/emitted; no full number or raw IP (FR-010). |

---

## 18. Shared-Impact Analysis

Geography gating touches **three** domains (Auth, WhatsApp Web, Subscription) and one shared entity (`company`), so a shared-impact analysis is mandatory.

| Shared Element | What Changes | Blast Radius | Mitigation |
| ----- | ----- | ----- | ----- |
| `company` record (shared entity) | New country + entitlement fields. | `company-service` consumers: `payment-service` (billing), `whatsapp` (activation), `people-service` (RBAC read), session/tenant bootstrap. | Additive nullable fields; tenant-scoped reads only; no cross-service direct DB reads. |
| Tenant provisioning lifecycle | New resolution step at onboarding + entitlement state. | Registration/onboarding flow, tenant bootstrap, approval lifecycle. | Resolution is additive; bootstrap preserved (FR-023); fail-closed doesn't block non-WA features. |
| Plan/add-on entitlement model | Geography rule gates WA Web add-on availability. | Add-on wizard, `payment-service` billing, proration/invoices. | Layer into existing entitlement model (Option C); billing sync (FR-016–FR-018). |
| WA Web activation path | `createAccountChannel`/`InitInstance` gains a gate. | `whatsapp` service, account-channel creation, Broadcast (depends on WA Web). | Server-side gate only; entitled/grandfathered tenants unaffected. |
| Super Admin / impersonation | Override path added. | All tenants via super-admin surface. | Tenant-scoped + audited override; no global flag. |

**Shared-Impact Conclusion:** The `company` record and the WA Web activation path are the two highest-risk shared surfaces. Both are mitigated by tenant-scoped reads/writes, additive schema, and server-side enforcement — but the feature is **cross-service** and must be validated end-to-end (onboarding → entitlement → wizard → `createAccountChannel` → billing) before go-live.

---

## 19. Dependencies & Risks

| ID | Type | Item | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| DEP-01 | Dependency | `company-service` owns subscriptions/entitlements; `payment-service` owns billing; `whatsapp` owns activation (there is **no** `subscription-service` — corrects F-12). | Wrong integration targets. | Plan against the verified service map (Data Model §11). |
| DEP-02 | Dependency | WA Web add-on exposure state — Subscription PRD FR-004/Appendix A-001 mark WA Web "if exposed separately". | If WA Web is not yet a separately-selectable add-on, the gate must strip it from any bundled plan for excluded tenants. | Confirm exposure state before build; gate applies regardless of exposure mode. |
| DEP-03 | Dependency | IP geolocation provider (accuracy/coverage) + OTP provider (for `+62` verification). | Detection quality. | Bound timeouts; fail-closed on provider failure. |
| DEP-04 | Dependency | `audit-service` is consume-only (event-driven). | Audit trail must be event-based, not sync query. | Emit events; no sync audit reads. |
| RISK-01 | Risk | Spoofing undermines the control (F-10). | Compliance breach. | OTP verification + cross-signal consistency + fail-closed + residual-risk sign-off (OQ-03). |
| RISK-02 | Risk | Retro-exclusion breaks existing paid tenants/billing. | Churn/revenue error. | Grandfather by default (OQ-05). |
| RISK-03 | Risk | Excluded tenant still charged (F-19). | Revenue/compliance error. | Billing sync + invoice-absence test. |
| RISK-04 | Risk | Gate default-allow on ambiguity. | Non-ID tenant gains WA Web. | Fail-closed + manual review. |

---

## 20. Open Questions

| OQ ID | Question | Why It Matters | Blocking? | Recommended Default | Sign-off |
| ----- | ----- | ----- | ----- | ----- | ----- |
| OQ-02 | Confirm mechanism = tenant-level entitlement/feature-flag (Option B+D+C), NOT RBAC (Option A); lock authoritative country source priority + fail-closed default. | Determines entire provisioning design and data model. | **Yes** | Entitlement (not RBAC); `+62` primary → IP fallback → declared tiebreaker; fail-closed `excluded`. | PM + Engineering Lead |
| OQ-05 | Existing non-Indonesian tenants (if any) with WA Web: grandfather or retro-exclude? And how is tenant country-change handled? | Migration/compliance scope + billing. | **Yes** | Grandfather existing tenants (`grandfathered`); country immutable at onboarding, changeable only via Super Admin override. | PM |
| OQ-03 | Is the exclusion legal/regulatory (→ L4) or product/market strategy (→ L3)? | Priority + rigor + legal sign-off + retention. | No (affects priority/rigor) | Escalate to L4 rigor if legal; require legal sign-off + retention policy for audit events. | PM + Legal |

> **[DECISION NEEDED]** markers above must be resolved and the decision log (Appendix) updated before PRD freeze (satuinbox.yml `requirement_package_freeze`). Do not silently assume.

---

## 21. Traceability Matrix

| Req ID | Requirement | Source (Brief/Assessment) | Verification (Test or Reason) |
| ----- | ----- | ----- | ----- |
| FR-001 | Geography = tenant property, not RBAC | BR-03 / F-15 | TC-WAGEO-001 |
| FR-002 | Country detection priority (phone→IP→declared) | Brief §6 Option D / F-09 | TC-WAGEO-002 |
| FR-003 | E.164 normalization | F-16 | TC-WAGEO-003 |
| FR-004 | Signals are heuristics, recorded | F-10 | TC-WAGEO-004 |
| FR-005 | Fail-closed default (OQ-02) | F-18 | TC-WAGEO-005 |
| FR-006 | OTP ownership verification for `+62` | F-10 | TC-WAGEO-006 |
| FR-007–FR-010 | Country field + detection metadata + audit | F-14 | TC-WAGEO-007 |
| FR-011–FR-013 | Entitlement state + wizard availability | F-11, F-19 | TC-WAGEO-008 |
| FR-014 | Server-side `createAccountChannel` gate | F-11 | TC-WAGEO-009 |
| FR-015 | Tenant-scoped gating read | F-15 | TC-WAGEO-010 |
| FR-016–FR-018 | Billing exclusion + sync | F-19 | TC-WAGEO-011 |
| FR-019–FR-021 | Super-admin override, tenant-scoped + audited | F-15 | TC-WAGEO-012 |
| FR-022–FR-024 | Protected existing behavior | Brief §4.3 | TC-WAGEO-013 |

**Test Cases (TC-WAGEO-NNN):**

| Test ID | Scenario | Expected |
| ----- | ----- | ----- |
| TC-WAGEO-001 | Verify no CASL permission/role is created for WA Web geography. | RBAC model unchanged. |
| TC-WAGEO-002 | Each signal combination (prefix/IP/declared) yields deterministic country. | Deterministic per FR-002. |
| TC-WAGEO-003 | `0812…` / `+62812…` / `62812…` classify identically. | All → `+62` candidate. |
| TC-WAGEO-004 | Detection method recorded for each resolution. | `countrySource` + `countryDetection` populated. |
| TC-WAGEO-005 | Conflicting phone/IP → default deny. | `excluded` + audit conflict. |
| TC-WAGEO-006 | Unverified `+62` (no OTP) does not alone grant WA Web. | Falls back / fail-closed. |
| TC-WAGEO-007 | Field populated on onboarding; `company_country_resolved` emitted; method recorded. | Data model verified. |
| TC-WAGEO-008 | Wizard hides/disables WA Web for non-entitled; shows for entitled. | UI parity (not enforcement). |
| TC-WAGEO-009 | Direct API call to `createAccountChannel` for non-entitled tenant → rejected. | `403-WAGEO-EXCLUDED`. |
| TC-WAGEO-010 | Super-admin impersonation cannot change another tenant's gating without audit. | Tenant-scoped write + audit. |
| TC-WAGEO-011 | Non-ID tenant invoice has no WA Web line item; ID tenant invoice unchanged. | Billing exclusion verified. |
| TC-WAGEO-012 | Override allowed/excluded applied to single tenant, audited. | `ChangedBy/At` + event. |
| TC-WAGEO-013 | Existing ID tenant keeps WA Web; onboarding + bootstrap intact. | No regression. |

---

## 22. Success Metrics

| ID | Metric | Target | Data Source |
| ----- | ----- | ----- | ----- |
| SM-001 | Non-ID new tenants excluded from WA Web at provisioning | 100% | `company-service` state + `createAccountChannel` logs |
| SM-002 | Direct-activation bypass attempts rejected | 100% rejection | `whatsapp` service gate logs |
| SM-003 | Excluded tenants with a WA Web billing line item | 0 | `payment-service` invoices |
| SM-004 | Existing tenants regressed (lost WA Web or billing change) | 0 | migration validation + support incidents |
| SM-005 | Country resolutions with complete audit trail | 100% | `audit-service` events |

---

## 23. Future Considerations

| Topic | Why It Matters Later |
| ----- | ----- |
| Legal retention/purge policy for country-detection audit events | Required if OQ-03 resolves to L4 legal/regulatory. |
| Broader geography gating for other channels | Pattern is reusable if other channels gain geography exposure. |
| Country-change self-service request flow | Currently Super Admin override only; a tenant-initiated request path may be needed. |
| Per-signal confidence scoring | Improve fail-closed precision beyond the current priority heuristic. |

---

## 24. Limitations

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| Phone prefix + IP geo are spoofable heuristics, not proof. | A determined actor may still bypass; control is risk-reduction, not absolute. | OTP verification + cross-signal consistency + fail-closed; residual risk accepted by legal (OQ-03). |
| Country immutable-at-onboarding in Phase 1. | Legitimate relocation requires ops intervention. | Super Admin override (audited). |
| WA Web add-on exposure state may be "if exposed separately". | If not separately exposed, gate must strip WA Web from bundled plans. | Confirm exposure state (DEP-02) before build. |

---

## 25. Appendix

### 25.1 Glossary

| Term | Definition |
| ----- | ----- |
| Tenant | A SatuInbox company/workspace (`companyId + organizationId`). |
| Entitlement | A plan/add-on feature a tenant may use; WA Web is one such entitlement. |
| Fail-closed | On ambiguity, default to the restrictive outcome (`excluded`). |
| Grandfather | Preserve an existing tenant's WA Web access/billing despite the new rule. |
| `waWebGeographyState` | Tenant-level state controlling WA Web availability (`entitled`/`excluded`/`grandfathered`/`override_allowed`/`override_excluded`). |

### 25.2 Service Name Corrections (F-12)

- Subscriptions/entitlements → `company-service` (NOT a phantom "subscription-service").
- Billing → `payment-service`.
- WA Web activation → `whatsapp` service (`createAccountChannel`/`InitInstance`).

### 25.3 Decision Log

| ID | Decision | Status | Decision By |
| ----- | ----- | ----- | ----- |
| OQ-02 | Mechanism + country source priority + fail-closed | **[DECISION NEEDED]** — recommended: entitlement (not RBAC); `+62`→IP→declared; fail-closed | PM + Engineering Lead |
| OQ-05 | Grandfather vs retro-exclude; country-change | **[DECISION NEEDED]** — recommended: grandfather; immutable-at-onboarding + override | PM |
| OQ-03 | Legal (L4) vs product (L3) | **[DECISION NEEDED]** — escalate rigor if legal | PM + Legal |

### 25.4 References

- `Assessments/change-intake/2026-09-22-muv-wa-web-geography-brief.md` (v1.0)
- `Assessments/change-intake/2026-09-22-muv-wa-web-geography-assessment.md` (v1.0)
- `PRD/Auth/PRD Auth - Dual Registration Flow (Personal vs Organization).md`
- `PRD/Subscription/PRD Prepaid Billing and Subscription.md`
- `PRD/Add ons/PRD Add ons.md`
- `PRD/Whatsapp web v2/PRD Satuinbox V2 (2).md` (Add Account v2.2 — `createAccountChannel`)
- `PRD/Auth/PRD SuperAdmin - Global Company Access and Tenant Impersonation.md`
- `Memory/CLAUDE-be.md` (service topology), `Memory/global-memory.md`
