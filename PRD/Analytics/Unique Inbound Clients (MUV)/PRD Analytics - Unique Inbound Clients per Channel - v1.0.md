# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics - Unique Inbound Clients per Channel
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: TBD

---

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-09-23 | Hermes (Planner) | Initial Standard-mode PRD. Split from composite change-intake brief. Metric renamed away from "MUV". |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a company-scoped Analytics section that shows, per channel platform (WhatsApp Web, Widget, and other inbound channels), how many *unique* inbound clients the company received in the current calendar month — without exposing any PII. |
| Scope | Phase 1 covers one new analytics section key under the existing Analytics shell, per-channel monthly distinct-inbound-client aggregation, summary KPI cards, error/empty states, and backend computation inside `analytics-service` from Contact + Conversation data. |
| Key Capabilities | Distinct inbound client count per channel per month; normalized-phone identity key; company scoping; no PII; monthly summary period; feature-flag gated. |
| Outcome | PM/ops can measure channel unique reach (ROI/adoption) inside SatuInbox without opening external tools, using a metric that is unambiguous versus Visitor Analytics' GA4 "Monthly Visitors". |
| Change Class | `NEW_CAPABILITY` (Analytics domain) |
| Complexity | Medium |
| PRD Mode | Standard |

### **2.1 Naming Decision (TERMINOLOGY — locked, non-negotiable)**

> **Constraint source:** Visitor Analytics FR-010 forbids showing `MUV` as a standalone label, and FR-008 defines "Monthly Visitors" as GA4 Users/Total Users. Reusing "MUV" or "Monthly Visitors" for this per-channel metric would create two different metrics sharing one acronym/label.

| Surface | Value |
| ----- | ----- |
| UI label (EN) | `Unique Inbound Clients` |
| UI label (ID) | `Pelanggan Unik Bulanan` |
| Section title | `Unique Inbound Clients` (per channel) |
| Section key (slug) | `unique-inbound-clients` |
| API/metric key | `uniqueInboundClientsPerChannel` |
| **Forbidden labels** | `MUV`, `Monthly Visitors`, `Monthly Active Users` (reserved for Visitor Analytics) |

A glossary entry and tooltip MUST explicitly distinguish this metric from Visitor Analytics' "Monthly Visitors" (GA4 website visitors) — see FR-009.

### **2.2 Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| New analytics section `Unique Inbound Clients` under existing Analytics page. | Website/GA4 visitor tracking (covered by Visitor Analytics). |
| Per-channel monthly distinct inbound client count, company-scoped, no PII. | Raw client list, per-user drill-down, PII export. |
| WhatsApp Web, Widget, and the other inbound Add-on channels (WhatsApp API, Instagram, Facebook Messenger, Telegram, Email) — subject to OQ-01 channel confirmation. | Arbitrary custom date ranges, cross-company comparison (Phase 1). |
| Server-side aggregation in `analytics-service` from Contact + Conversation data. | Changing existing Analytics section calculations or Add-ons US-6 usage stats. |
| Monthly summary period aligned to company workspace timezone. | Changing billing, RBAC roles, or channel entitlement model. |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Product/ops cannot see, per channel, how many *unique* customers are inbound each month — only aggregate website traffic (GA4) and per-channel message-volume analytics exist. | Channel ROI/adoption by unique reach is not measurable; channel investment decisions rely on proxy metrics. |
| PS-002 | Existing Analytics sections (Conversation, Ticket, Responsiveness, Member Performance, Broadcast, Offline Report, Visitor Analytics) and Add-ons US-6 do not expose a distinct-inbound-client monthly count. | No single surface answers "how many unique customers reached us via this channel this month." |
| PS-003 | The requested metric was originally named "MUV", which collides with Visitor Analytics' reserved "Monthly Visitors" label space. | An ambiguous label risks misleading analytics and violates Visitor Analytics naming discipline (FR-010). |
| PS-004 | The metric identity ("unique contact vs unique conversation") and channel enumeration were left open at intake. | Aggregation source and identity key cannot be locked without an explicit decision; wrong choice → rework and misleading ROI. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Make per-channel unique reach visible inside SatuInbox. | PM/ops can read the current-month distinct inbound client count per channel without leaving the Analytics shell. |
| Keep metric semantics unambiguous. | 100% of labels/tooltips use `Unique Inbound Clients`; the string `MUV` and `Monthly Visitors` never appear as this metric's label. |
| Preserve privacy and data boundaries. | 0 raw PII (phone/name/email/message body) persisted in analytics; 0 cross-company leakage. |
| Protect existing behavior. | 0 changes to existing Analytics sections and Add-ons US-6 calculations after release. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a company-level analytics user, I want a new `Unique Inbound Clients` section in Analytics so that I can access the per-channel unique-reach metric inside SatuInbox. | 1. Given I have company-level analytics access, When I open the Analytics page, Then I see a menu item labeled `Unique Inbound Clients`. 2. Given the feature flag is disabled, When I open Analytics, Then the menu item is hidden. |
| US-002 | P0 | As a company-level analytics user, I want to see the distinct inbound client count for each channel for the current month so that I can compare channel reach. | 1. Given my company has inbound data this month, When the section loads, Then each in-scope channel shows an integer distinct-client count. 2. Given a channel has no inbound this month, Then that channel shows `0` with an empty-state explanation. |
| US-003 | P0 | As a company-level analytics user, I want data scoped to my current company so that I never see another company's clients. | 1. Given I am authenticated under company A, When the section loads, Then all counts are derived only from company A's data. 2. Given a company has no data, Then the section shows an empty state instead of fallback data from another company. |
| US-004 | P0 | As a company-level analytics user, I want the metric labeled and explained distinctly from `Monthly Visitors` so that I do not confuse website visitors with channel clients. | 1. Given the section renders, Then the KPI label is `Unique Inbound Clients` (not `MUV`, not `Monthly Visitors`). 2. Given I hover the label, Then a tooltip explains the metric and contrasts it with Visitor Analytics' `Monthly Visitors`. |
| US-005 | P1 | As a company-level analytics user, I want clear loading/empty/error states so that I know whether the data is available and current. | 1. Given the fetch is in progress, Then a loading state renders. 2. Given the endpoint fails, Then an error state with a retry action renders. |

---

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Section & Navigation | FR-001 [P0]: System MUST add a new analytics section key `unique-inbound-clients` to the existing analytics shell. FR-002 [P0]: System MUST show a sidebar menu item labeled `Unique Inbound Clients` when the feature is enabled. FR-003 [P0]: System MUST render the section inside the existing Analytics page, not redirect externally. |
| Metric Definition | FR-004 [P0]: System MUST define the metric as the count of **distinct inbound clients** per channel per calendar month, company-scoped. **`[DECISION NEEDED — OQ-01]`** Recommended default: a *client* is a **unique normalized contact** (not a unique conversation). FR-005 [P0]: System MUST use the **normalized phone number** as the identity key, applying the **same normalization function** used by contact duplicate detection. FR-006 [P0]: System MUST count a contact **at most once per channel per month**, regardless of how many conversations or messages that contact initiated. FR-007 [P0]: System MUST count a contact **once per channel it contacted** — a contact reaching via two channels in the same month counts once in each channel. FR-008 [P0]: The UI MUST use the label `Unique Inbound Clients` (ID: `Pelanggan Unik Bulanan`) and MUST NOT use `MUV` or `Monthly Visitors` as this metric's label. FR-009 [P0]: System MUST provide a tooltip and glossary entry distinguishing this metric from Visitor Analytics' GA4 `Monthly Visitors`/`Monthly Active Users`. FR-010 [P1]: System MUST enumerate the in-scope channels. **`[DECISION NEEDED — OQ-01]`** Recommended default: WhatsApp Web, Widget, WhatsApp API, Instagram, Facebook Messenger, Telegram, Email. FR-011 [P0]: For Widget inbound with no phone, System MUST use a deterministic, non-PII identity key. **`[DECISION NEEDED]`** Recommended default: contact id when present, else a non-PII session fingerprint. |
| Period Rules | FR-012 [P0]: System MUST use a monthly summary period. FR-013 [P0]: Month boundaries MUST be computed in the **company workspace timezone**, aligned with Visitor Analytics FR-012. FR-014 [P0]: Phase 1 MUST NOT expose arbitrary custom date-range filters. |
| Scope & Permissions | FR-015 [P0]: System MUST scope every count by the authenticated `companyId`; no company switcher or cross-company compare in Phase 1. FR-016 [P0]: Access MUST be restricted to roles/permission scopes allowed to view company-level analytics; team-only and self-only scopes MUST be denied (parity with Visitor Analytics FR-005/FR-006). FR-017 [P0]: System MUST NOT return, display, or persist raw PII (phone, email, full name, message body) in the metric request, response, or storage. |
| Data Model & Aggregation | FR-018 [P0]: `analytics-service` MUST compute the metric from Conversation data (`channel` + `firstCustomerMessageAt`) and Contact data (normalized phone), via event-driven aggregation — **no cross-service reads at query time** (DB-per-service). FR-019 [P0]: `analytics-service` MUST NOT persist raw phone numbers; distinct counting MUST use a hashed identity key or HyperLogLog (approximate) per channel per month. FR-020 [P0]: KPI values MUST be non-negative integers. FR-021 [P0]: System MUST pre-aggregate per day per channel (hashed distinct keys) and roll up monthly to keep query cost bounded. |
| API Contract | FR-022 [P0]: FE MUST fetch the metric from a SatuInbox internal analytics endpoint only. FR-023 [P0]: The summary response MUST include per-channel distinct-client counts plus `periodStart`/`periodEnd` (and `lastUpdatedAt` when available). FR-024 [P0]: The new route/contract MUST be additive and MUST NOT change existing analytics routes or payloads. |
| Non-Side Effects (Protected) | FR-025 [P0]: This feature MUST NOT change the calculations of existing Analytics sections (Conversation, Ticket, Responsiveness, Member Performance, Broadcast, Offline Report, Visitor Analytics — incl. Visitor Analytics FR-033/FR-034). FR-026 [P0]: This feature MUST NOT change Add-ons US-6 per-channel usage calculations (messages, active conversations, response time, CSAT). |
| UI States | FR-027 [P0]: System MUST show loading, empty (zero-value with helper), and error (with retry) states. FR-028 [P0]: The section MUST be feature-flag gated and hidden when the flag is disabled. |
| Rollout | FR-029 [P1]: System MUST define backfill behavior. **`[DECISION NEEDED — minor]`** Recommended default: metric counts from go-live only; no historical backfill in Phase 1; pre-launch months show an empty-state helper. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block access to the section and do not fetch data. | `Akses ditolak` or hide the menu item per analytics-shell behavior. |
| EH-002 | Internal API failure | Return a safe error state without exposing backend internals. | `Gagal memuat data` + button `Coba lagi`. |
| EH-003 | Aggregation job failure / stale data | Return the last-known counts with `lastUpdatedAt` and a freshness indicator. | `Data mungkin belum terbarui` with timestamp. |
| EH-004 | Partial channel data unavailable | Return the available channels and hide/disable the unavailable channel(s) without breaking the section. | Disable card with `Belum tersedia`. |
| EH-005 | Missing channel identity data | Treat as zero-count for that channel, not an error. | `0` with empty-state helper. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Inbound lands exactly on a month boundary second. | Counted in the correct month using `>= start AND < end` in the company workspace timezone. | No special UI. |
| EC-002 | Company workspace timezone vs UTC/WIB discrepancy. | Month bucketing uses company workspace timezone (FR-013), not UTC or hard-coded WIB. | No special UI. |
| EC-003 | Widget inbound has no phone (anonymous). | Counted via the deterministic non-PII identity key (FR-011); never persisted as PII. | No PII exposed. |
| EC-004 | Same contact messages twice in the same channel in the same month. | Counted once (FR-006). | No special UI. |
| EC-005 | Same contact reaches via two different channels in the same month. | Counted once per channel (FR-007). | No special UI. |
| EC-006 | A channel has zero inbound this month. | Shows `0` with empty-state helper, not an error. | `Belum ada data` helper. |
| EC-007 | Contact phone stored in different formats (`+62812…`, `0812…`, `62812…`). | Normalized to one identity key by the shared normalization function (FR-005) → one client. | No special UI. |
| EC-008 | A month before go-live is viewed (if historical nav exists). | Shows empty-state helper (no backfill), not misleading `0`. | Helper text for pre-launch months. |
| EC-009 | Company mapping/timezone config changes mid-month. | New fetches use the latest config; counts are computed against the config in effect for that month's aggregation window. | Optional tooltip notes config change if implemented. |

---

## **9. Data Model**

### 9.1 Aggregation Storage (analytics-service, no PII)

| Field | Type | Example | Notes |
| ----- | ----- | ----- | ----- |
| `companyId` | string | `cmp_123` | Derived from authenticated tenant; not client-overridable. |
| `channel` | enum | `whatsapp_web` | In-scope channel key. |
| `periodMonth` | string | `2026-09` | Calendar month (company workspace timezone). |
| `periodStart` / `periodEnd` | ISO8601 | `2026-09-01T00:00:00+07:00` | Inclusive/exclusive bounds. |
| `distinctClientCount` | integer | `15432` | Non-negative; distinct hashed identity keys. |
| `identityHash` (internal only) | string (hash) | `sha256(normalizedPhone + salt)` | Never raw phone; used for distinct counting only. |
| `lastUpdatedAt` | ISO8601 | `2026-09-22T10:05:00+07:00` | Pre-aggregation write time. |

### 9.2 Identity Key

- **Primary key:** `normalizePhone(contact.phone)` — the **same function** used by contact duplicate detection (global-memory: "Duplicate detection uses normalized phone number").
- **Widget fallback (no phone):** contact id if present, else a non-PII session fingerprint (FR-011) — decision pending.
- **Privacy:** the raw phone is hashed (with a per-tenant or global salt) before it reaches analytics storage; HyperLogLog is acceptable if approximate distinct counts are agreed (FR-019).

---

## **10. Permissions / Visibility**

| Role / Permission Scope | View | Notes |
| ----- | ----- | ----- |
| Company-wide analytics access | Allowed | Sees the section for the authenticated company only. |
| Team-only analytics scope | Denied (Phase 1) | Company-wide unique reach exceeds team scope. |
| Self-only analytics scope | Denied (Phase 1) | Company-wide unique reach exceeds self scope. |
| Unauthorized role | Denied | Hidden or blocked per analytics-shell permission behavior. |

- Visibility is derived from the authenticated tenant context; no client-side `companyId` override is accepted in Phase 1 (parity with Visitor Analytics FR-004/FR-007).

---

## **11. Open Questions**

| ID | Question | Why It Matters | Blocking? | Recommended Default (needs PM sign-off) |
| ----- | ----- | ----- | ----- | ----- |
| OQ-01 | Is "inbound client" a unique **normalized contact** per channel per month, or a unique **conversation**? Which channels are in scope? | Changes the aggregation source and identity key entirely. | **Yes** | **Unique normalized contact** (not conversation); channels = WhatsApp Web, Widget, WhatsApp API, Instagram, Facebook Messenger, Telegram, Email. |
| OQ-04 | Should this live as a new Analytics section or extend Add-ons US-6 usage analytics? | Avoids duplicate surfaces and mis-scoped access. | No | **New Analytics section** (company-scoped reach metric; Add-ons US-6 remains per-channel operational usage within channel management). |
| OQ-Demand | Demand/priority level: L2 vs L3? | Affects scheduling. | No | **L3** — worth building; additive analytics, not a workflow blocker. |
| OQ-Widget | What is the deterministic identity key for anonymous Widget inbound (no phone)? | Widget may have no phone → cannot dedupe by phone. | Yes (for Widget) | Contact id when present; else non-PII session fingerprint. |
| OQ-Backfill | Backfill historical months or start from go-live? | Prevents misleading `0` for prior months. | No | Start from go-live; no historical backfill in Phase 1. |

---

## **12. Dependencies**

| Dependency | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Contact data (`normalized phone` unique id) via channel-service | Engineering | Identity key source; without it the metric cannot dedupe. | Reuse the shared normalization function; event-driven ingest. |
| Conversation data (`channel` + `firstCustomerMessageAt`) via conversation-service | Engineering | Channel attribution + month bucketing source. | Reuse the existing inbound event flow (already used for SLA). |
| `analytics-service` pre-aggregation pattern | Engineering | Distinct-count at scale without raw PII storage. | Follow `ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`; daily hashed keys → monthly rollup. |
| Existing Analytics shell + RBAC | Engineering / Product | Section placement and access parity with Visitor Analytics. | Reuse Visitor Analytics permission surface. |
| OQ-01 / OQ-Widget resolution | PM | Metric semantics cannot be frozen without it. | Flag `[DECISION NEEDED]`; do not silently assume. |

---

## **13. Risks**

| Risk | Likelihood | Severity | Mitigation |
| ----- | ----- | ----- | ----- |
| Metric mislabeled `MUV`/`Monthly Visitors` → confused with GA4 | High | Medium | Locked naming decision (§2.1) + FR-008/FR-009; glossary + tooltip. |
| PII leakage (raw phone persisted in analytics) | Medium | High | Hash identity key / HLL; FR-017/FR-019; verify no raw-phone column in analytics DB. |
| Normalization divergence from duplicate detection → over/under-count | Medium | High | FR-005 mandates the **same** normalization function; regression test on `+62` vs `08` formats. |
| Distinct-count cost grows with volume | Medium | Medium | Pre-aggregation per day (FR-021); HLL if approximate acceptable. |
| Month-boundary/timezone miscount | Medium | Medium | Company workspace timezone (FR-013); `>= start AND < end`; EC-001/EC-002. |
| Anonymous Widget over/under-count | Medium | Medium | Deterministic non-PII identity key (FR-011); OQ-Widget sign-off. |
| Cross-company leakage | Low | High | Strict `companyId` scoping (FR-015); no fallback data (US-003). |

---

## **14. Traceability Matrix**

| Req ID | Requirement | Source | QA / Test Intent |
| ----- | ----- | ----- | ----- |
| BR-01 (brief) | Per-channel unique inbound client count, no PII, company-scoped, monthly | Brief §1/§4.1 | FR-004, FR-015, FR-017 |
| FR-004 | Distinct inbound client per channel per month | Assessment F-01 (OQ-01) | Same contact, two messages, same channel → counted once |
| FR-005 | Normalized phone identity key (same as dedupe) | Assessment F-05 | `+62812…` and `0812…` → one client |
| FR-006 / FR-007 | Once per channel/month; once per channel contacted | Assessment F-01 | Same contact in two channels → once per channel |
| FR-008 / FR-009 | Label `Unique Inbound Clients`, never `MUV`/`Monthly Visitors` | Assessment F-02 | KPI label/tooltip contains no `MUV`; contrasts with `Monthly Visitors` |
| FR-010 / FR-011 | Channel enumeration + Widget identity key | Assessment F-03 | Widget counted via defined non-PII key |
| FR-013 / EC-001 / EC-002 | Month boundary in company workspace timezone | Assessment F-07 | Boundary-second inbound lands in correct month |
| FR-017 / FR-019 | No raw PII in analytics | Assessment F-04 | Analytics DB has no raw-phone column |
| FR-021 | Pre-aggregation for bounded query | Assessment F-06 | Load test within analytics SLO |
| FR-025 / FR-026 | Existing Analytics + Add-ons US-6 unchanged | Brief §4.3 | Regression: Visitor Analytics FR-033/FR-034 + US-6 output unchanged |
| FR-029 / EC-008 | No backfill (go-live onward) | Assessment F-08 | Pre-launch months show empty-state helper |

---

## **15. Change Log**

| Date | Change | Author |
| ----- | ----- | ----- |
| 2026-09-23 | Initial Standard-mode PRD created. Metric renamed to "Unique Inbound Clients"; OQ-01/OQ-04/demand flagged with recommended defaults. | Dany Christian (PM) |
