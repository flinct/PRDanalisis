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
| v1.1 | 2026-09-24 | Hermes (Analyzer+Reviewer) | Codebase-alignment patch. Verified 6 gaps against real FE/BE (`omnichannel-satuinbox-fe`/`-be`), reviewer PASS. FE surface = Statistic page `/statistic` (not "Analytics"); flag = env-var deploy gate (no PM toggle); "company workspace timezone" replaced with reporting-timezone DECISION (no such field exists); FR-018 corrected (Redash/cron, not event-driven); FR-016 deny = new logic via `PermissionsGuard`+`StatisticPermission`; removed all not-shipped Visitor Analytics FR cross-refs. |
| v1.2 | 2026-09-24 | Hermes (external review apply) | Applied external product-analyst review (20 findings). **4 factual data-model blockers corrected** (verified vs code): F-01 `firstCustomerMessageAt` not on `conversation.schema.ts` (only SLA collection) → 3-option DECISION; F-02 no shared `normalizePhone` (5 divergent impls, none in `libs/common`) → DECISION; F-04 Telegram catalog-only, no service → **excluded** from Phase-1 scope; F-12 "Add-ons US-6" unverifiable → restated self-contained. F-11 HLL not available → default exact hashed-key. F-18 channel encoding DECISION. Added **§10a NFR** + **§10b Success Metrics** (F-09). §API Contract already present (v1.1). |
| v1.3 | 2026-09-28 | Dany Christian (PM) | **Product decisions landed — 4 TRD-blocker OQ closed** (answered in OpenProject #3732 comment). **OQ-01** metric = unique **normalized contact**; channels = 6 (WA Web, WA API, Widget, IG, Messenger, Email), **Telegram excluded** (F-04). **OQ-02** access = ADMIN/SUPER_ADMIN (wildcard) + SUPERVISOR (`StatisticPermission.ALL`) only; SUPERVISOR_SALES/SALES excluded by design (reuse existing perm, no new one). **OQ-03** counting = **exact hashed-set** (not HLL); sizing ≈ ~18 GB @ 13-mo; store daily per-channel aggregate; HLL only if >50K distinct/channel/day. **OQ-04** month-bucket = `ConversationSLAMetrics.firstCustomerMessageAt ?? Conversation.createdAt` (closes GAP-01; regression test for no-SLA conversations). Backfill (none, D-12) + Widget over-count (Phase-2 fix) acknowledged. Remaining open DECISIONs are Engineering-owned (F-02 normalizer choice, F-18 channel-enum, FR-018 pattern a/b, FR-028 env-var name), not product blockers. **2026-09-28 codebase re-scan (FE data-cy / BE v2.7.0 WIP):** all 4 OQ code-facts re-verified still valid; NEW `jakarta-reporting-day.ts` (`Asia/Jakarta`) + scheduler cron `timeZone: 'Asia/Jakarta'` **close FR-013/EC-002/EC-009 timezone** (reuse util, no new field); `conversation-daily-metrics.schema.ts` per-day ObjectId arrays give FR-021 a concrete per-day-set precedent; `StatisticPermission.EXPORT` added (unassigned, OQ-02 unchanged); new `drill.controller` does not touch distinct-contact (MUV still net-new); FE StatisticNav gated by `StatisticPermission.EXPORT`, `VALID_SECTIONS` still 6 (MUV section still net-new). |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a company-scoped Analytics section that shows, per channel platform (WhatsApp Web, Widget, and other inbound channels), how many *unique* inbound clients the company received in the current calendar month — without exposing any PII. |
| Scope | Phase 1 covers one new **Statistic** section key under the existing **Statistic** page (FE route `/statistic`), per-channel monthly distinct-inbound-client aggregation, summary KPI cards, error/empty states, and backend computation inside `analytics-service` from Contact + Conversation data. (Backend REST routes are prefixed `analytics/*`; the FE product surface is branded **Statistic**.) |
| Key Capabilities | Distinct inbound client count per channel per month; normalized-phone identity key; company scoping; no PII; monthly summary period; deploy/env-var gated (no runtime feature-flag platform). |
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
| New **Statistic** section `Unique Inbound Clients` under the existing Statistic page (`/statistic`), added to `VALID_SECTIONS` (ManageStatisticPage) + the `menu` array (StatisticNav). | Website/GA4 visitor tracking (covered by Visitor Analytics). |
| Per-channel monthly distinct inbound client count, company-scoped, no PII. | Raw client list, per-user drill-down, PII export. |
| WhatsApp Web, Widget, and the other inbound Add-on channels (WhatsApp API, Instagram, Facebook Messenger, Telegram, Email) — subject to OQ-01 channel confirmation. | Arbitrary custom date ranges, cross-company comparison (Phase 1). |
| Server-side aggregation in `analytics-service` from Contact + Conversation data. | Changing existing Analytics section calculations or Add-ons US-6 usage stats. |
| Monthly summary period aligned to the reporting timezone selected in FR-013 (no canonical company timezone field exists today). | Changing billing, RBAC roles, or channel entitlement model. |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Product/ops cannot see, per channel, how many *unique* customers are inbound each month — only aggregate website traffic (GA4) and per-channel message-volume analytics exist. | Channel ROI/adoption by unique reach is not measurable; channel investment decisions rely on proxy metrics. |
| PS-002 | The six existing Statistic sections (`conversations`, `broadcast`, `ticket`, `responsiveness`, `member-performance`, `offline-report`) and Add-ons US-6 do not expose a distinct-inbound-client monthly count. (Visitor Analytics is a separate, not-yet-shipped PRD and is **not** an existing section in the current FE.) | No single surface answers "how many unique customers reached us via this channel this month." |
| PS-003 | The requested metric was originally named "MUV", which collides with Visitor Analytics' reserved "Monthly Visitors" label space. | An ambiguous label risks misleading analytics and violates Visitor Analytics naming discipline (FR-010). |
| PS-004 | The metric identity ("unique contact vs unique conversation") and channel enumeration were left open at intake. | Aggregation source and identity key cannot be locked without an explicit decision; wrong choice → rework and misleading ROI. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Make per-channel unique reach visible inside SatuInbox. | PM/ops can read the current-month distinct inbound client count per channel without leaving the Statistic page (`/statistic`). |
| Keep metric semantics unambiguous. | 100% of labels/tooltips use `Unique Inbound Clients`; the string `MUV` and `Monthly Visitors` never appear as this metric's label. |
| Preserve privacy and data boundaries. | 0 raw PII (phone/name/email/message body) persisted in analytics; 0 cross-company leakage. |
| Protect existing behavior. | 0 changes to the six existing Statistic sections and Add-ons US-6 calculations after release. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a company-level analytics user, I want a new `Unique Inbound Clients` section in the Statistic page (`/statistic`) so that I can access the per-channel unique-reach metric inside SatuInbox. | 1. Given I have company-level analytics access, When I open the Statistic page (`/statistic`), Then I see a menu item labeled `Unique Inbound Clients`. 2. Given the deploy/env gate is disabled, When I open Statistic, Then the menu item is hidden. `[DECISION NEEDED]` the FE has no flag-consumption path today (all existing flags are backend env vars the FE cannot read); FE visibility must be driven by either a gating endpoint, a build-time var, or a hard-coded rollout — pick one. |
| US-002 | P0 | As a company-level analytics user, I want to see the distinct inbound client count for each channel for the current month so that I can compare channel reach. | 1. Given my company has inbound data this month, When the section loads, Then each in-scope channel shows an integer distinct-client count. 2. Given a channel has no inbound this month, Then that channel shows `0` with an empty-state explanation. |
| US-003 | P0 | As a company-level analytics user, I want data scoped to my current company so that I never see another company's clients. | 1. Given I am authenticated under company A, When the section loads, Then all counts are derived only from company A's data. 2. Given a company has no data, Then the section shows an empty state instead of fallback data from another company. |
| US-004 | P0 | As a company-level analytics user, I want the metric labeled and explained distinctly from `Monthly Visitors` so that I do not confuse website visitors with channel clients. | 1. Given the section renders, Then the KPI label is `Unique Inbound Clients` (not `MUV`, not `Monthly Visitors`). 2. Given I hover the label, Then a tooltip explains the metric and contrasts it with Visitor Analytics' `Monthly Visitors`. |
| US-005 | P1 | As a company-level analytics user, I want clear loading/empty/error states so that I know whether the data is available and current. | 1. Given the fetch is in progress, Then a loading state renders. 2. Given the endpoint fails, Then an error state with a retry action renders. |

---

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Section & Navigation | FR-001 [P0]: System MUST add a new section key `unique-inbound-clients` to `VALID_SECTIONS` in `ManageStatisticPage.tsx` and a matching entry (icon + `t('statistic.side-nav.unique-inbound-clients')` label) to the `menu` array in `StatisticNav.tsx` — i.e. a 7th section inside the existing `/statistic` page. FR-002 [P0]: System MUST show a **Statistic left-nav** (`StatisticNav`) menu item labeled `Unique Inbound Clients` when the deploy/env gate is enabled (see FR-028). FR-003 [P0]: System MUST render the section inside the existing Statistic page (`/statistic`, `ManageStatisticPage`), not redirect externally and not create a new top-level route. |
| Metric Definition | FR-004 [P0]: System MUST define the metric as the count of **distinct inbound clients** per channel per calendar month, company-scoped. **`[RESOLVED v1.3 — OQ-01]`** A *client* is a **unique normalized contact** (NOT a unique conversation). FR-005 [P0]: System MUST use the **normalized phone number** as the identity key. **`[DECISION NEEDED — F-02]`** There is **no** shared normalization function and contact dedup does **not** use phone (it uses a compound unique index `{ channelId, referenceId }` on `client-contact.schema.ts:100`). Five divergent `normalizePhone` implementations exist (conversation-service `formatter.util.ts:139`, whatsapp `baileys.service.ts:442`, payment-service `formatter.util.ts:114`, broadcast-service ×2) and **none** lives in `libs/common`. Choose: (a) reuse one named implementation, or (b) create a new shared normalizer in `libs/common` with exact rules (E.164? strip formatting? country-code assumption?). Also: `ClientContact.phone` is **optional** (`client-contact.schema.ts:44`) — for non-Widget channels without a phone (Instagram DM, Facebook Messenger, Email), the no-phone identity rule of FR-011 MUST apply (see F-19). FR-006 [P0]: System MUST count a contact **at most once per channel per month**, regardless of how many conversations or messages that contact initiated. FR-007 [P0]: System MUST count a contact **once per channel it contacted** — a contact reaching via two channels in the same month counts once in each channel. FR-008 [P0]: The UI MUST use the label `Unique Inbound Clients` (ID: `Pelanggan Unik Bulanan`) and MUST NOT use `MUV` or `Monthly Visitors` as this metric's label. FR-009 [P0]: System MUST provide a tooltip and glossary entry distinguishing this metric from Visitor Analytics' GA4 `Monthly Visitors`/`Monthly Active Users`. FR-010 [P1]: System MUST enumerate the in-scope channels. **`[RESOLVED v1.3 — OQ-01]`** In-scope (6): WhatsApp Web, WhatsApp API, Widget, Instagram, Facebook Messenger, Email — the channels with an existing backend inbound pipeline. **Telegram is EXCLUDED from Phase 1 (F-04):** it is catalog-only (`satuinbox_channel.platforms.json`), with **no** `telegram` service in `backend/apps/`, no Telegram proto, and no inbound handler; including it requires a net-new service (own PRD/timeline). Channel key encoding is also undecided — `ChannelTypeEnum` (`libs/common/.../enums/index.ts:140-143`) only has `WIDGET` and `WHATSAPP`; the platform catalog uses string codes. **`[DECISION NEEDED — F-18]`** specify whether the metric's `channel` field is the catalog `code` string or a new enum. FR-011 [P0]: For Widget inbound with no phone, System MUST use a deterministic, non-PII identity key. **`[RESOLVED v1.3 — OQ-Widget]`** Identity key = contact id when present, else a non-PII session fingerprint. **Known limitation accepted:** the fingerprint falls back to a client-generated UUID, so one person across two browsers counts as two — real fix deferred to Phase 2. |
| Period Rules | FR-012 [P0]: System MUST use a monthly summary period. FR-013 [P0]: Month boundaries MUST use the single canonical reporting timezone **`Asia/Jakarta`**. **`[RESOLVED v1.3 — codebase]`** analytics-service now ships a canonical reporting-day utility `apps/analytics-service/src/app/utils/jakarta-reporting-day.ts` (`REPORTING_TIMEZONE = 'Asia/Jakarta'`) that produces Jakarta calendar-day labels and maps them to half-open UTC ranges; the aggregation scheduler already runs on `@Cron(EVERY_DAY_AT_1AM, { timeZone: 'Asia/Jakarta' })` and buckets SLA days via `buildCompletedJakartaDates`. MUV MUST **reuse this util** for daily/monthly bucketing — do NOT introduce a new timezone field or per-Shift resolution. (The older `buildDates` UTC-midnight path still exists for legacy metrics; MUV follows the Jakarta path.) FR-014 [P0]: Phase 1 MUST NOT expose arbitrary custom date-range filters. |
| Scope & Permissions | FR-015 [P0]: System MUST scope every count by the authenticated `companyId`; no company switcher or cross-company compare in Phase 1. FR-016 [P0]: Access MUST be restricted to roles/permission scopes allowed to view company-level analytics; team-only (`StatisticPermission.READ_TEAM`) and self-only (`StatisticPermission.READ_OWN`) scopes MUST be **denied** with a hard 403. **`[RESOLVED v1.3 — OQ-02]`** Access = `ADMIN`/`SUPER_ADMIN` (wildcard) + `SUPERVISOR` (`StatisticPermission.ALL`) only. `SUPERVISOR_SALES` (holds only `StatisticPermission.READ`) and `SALES` (no statistic permission) are **excluded by design** — the gate stays ALL-or-wildcard; do **NOT** widen to `READ` and do **NOT** create a new permission (reuse existing `StatisticPermission.ALL`). This is **new** deny logic: the existing read endpoints narrow rather than deny (`resolveAgentId`/`resolveTeamId`/`isSelfOnlyScope` in `analytics-scope.util.ts`; `resolveAgentIds` returns `string[] | 'all'` in `member-analytics.service.ts:317-327`). Implement by adding `@RequirePermissions([StatisticPermission.READ])` (or `ALL`) + `PermissionsGuard` to the new endpoint — the existing deny pattern, currently used only on `POST /analytics/backfill` (`backfill.controller.ts:45`). FR-017 [P0]: System MUST NOT return, display, or persist raw PII (phone, email, full name, message body) in the metric request, response, or storage. |
| Data Model & Aggregation | FR-018 [P0]: `analytics-service` MUST compute the metric server-side from Conversation data (`channel` + a month-bucket timestamp) and Contact data (normalized phone). **`[RESOLVED v1.3 — OQ-04]`** Month-bucket timestamp = **`ConversationSLAMetrics.firstCustomerMessageAt ?? Conversation.createdAt`** — use first-inbound time when the SLA sidecar record exists (`conversation-sla-metrics.schema.ts:81`, joined via indexed `conversationId`), else fall back to `Conversation.createdAt` (always present via Mongoose `timestamps`). This closes GAP-01: the SLA collection does **not** guarantee coverage of every conversation, so first-inbound alone would under-count. **Regression test required:** a conversation with no SLA record MUST still be bucketed via `createdAt`. The codebase pattern is **not** event-driven: metrics are served either (a) by a Redash warehouse query at read time (`redash.service.ts`), or (b) by a pre-aggregated collection populated by a 3-hourly cron that pulls source data over RMQ (`aggregation-scheduler.service.ts:94`). 'No cross-service reads at query time' is false in the current code — `member-analytics.service.ts:110-113,140-160` performs gRPC reads at query time. **`[DECISION NEEDED]`** pick pattern (a) or (b); do not write 'event-driven consumer' into the TRD. FR-019 [P0]: `analytics-service` MUST NOT persist raw phone numbers; distinct counting MUST use a **hashed identity key** (exact). **`[RESOLVED v1.3 — OQ-03]`** Counting method = **exact hashed-key set** (NOT HyperLogLog). HLL is net-new infra (0 usage, no Redis HLL, no library in `package.json`) and unnecessary at SatuInbox volume (realistic footprint ≈ ~18 GB @ 13-mo retention, not the card's ~150 GB over-estimate). Store the distinct keys as a **daily per-channel aggregate** so a future swap to HLL requires no schema migration. Escalate to HLL **only if** a tenant sustains >50K distinct/channel/day (see NF-4). Exact hashed-set counts cannot be union-rolled-up across days without storing all keys, so FR-021's daily→monthly rollup MUST store per-day key sets. FR-020 [P0]: KPI values MUST be non-negative integers. FR-021 [P0]: System MUST pre-aggregate per day per channel (hashed distinct keys) and roll up monthly to keep query cost bounded. **Precedent:** `conversation-daily-metrics.schema.ts` already stores per-day ObjectId arrays (`totalIds`/`openIds`/`closedIds`, L62-92) keyed per Jakarta reporting day — MUV mirrors this pattern with a per-day hashed-key array per channel (reuse `jakarta-reporting-day` for the day key). |
| API Contract | FR-022 [P0]: FE MUST fetch the metric from a SatuInbox internal analytics endpoint only. FR-023 [P0]: The summary response MUST include per-channel distinct-client counts plus `periodStart`/`periodEnd` (and `lastUpdatedAt` when available). FR-024 [P0]: The new route/contract MUST be additive and MUST NOT change existing analytics routes or payloads. |
| Non-Side Effects (Protected) | FR-025 [P0]: This feature MUST NOT change the calculations of existing Statistic sections (`conversations`, `broadcast`, `ticket`, `responsiveness`, `member-performance`, `offline-report`). FR-026 [P0]: This feature MUST NOT change the per-channel usage statistics shown in Settings > Channel Management (messages, active conversations, response time, CSAT). **`[F-12]`** "Add-ons US-6" is an external reference not verifiable in this code repo; the protected behavior is restated here in self-contained terms. |
| UI States | FR-027 [P0]: System MUST show loading, empty (zero-value with helper), and error (with retry) states. FR-028 [P0]: The section MUST be gated by an **environment-variable deploy flag** (the codebase's only flag mechanism — cf. `AGGREGATION_ENABLED` in `conversation.controller.ts:54-56` and `aggregation-scheduler.service.ts:96-99`). When the flag is disabled the menu item is hidden. There is **no runtime PM-facing feature-flag platform**; enabling/disabling is an Engineering env-var change + deploy/restart. **`[DECISION NEEDED]`** name the env var (e.g. `UNIQUE_INBOUND_CLIENTS_ENABLED`) and the owning service. |
| Rollout | FR-029 [P1]: System MUST define backfill behavior. **`[RESOLVED v1.3]`** No historical backfill in Phase 1 (D-12); metric counts from go-live only; pre-launch months show an empty-state helper. Stakeholder expectation (no prior-quarter comparison at launch) to be managed by Product. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block access to the section and do not fetch data. | `Akses ditolak` or hide the menu item per Statistic-page behavior. |
| EH-002 | Internal API failure | Return a safe error state without exposing backend internals. | `Gagal memuat data` + button `Coba lagi`. |
| EH-003 | Aggregation job failure / stale data | Return the last-known counts with `lastUpdatedAt` and a freshness indicator. | `Data mungkin belum terbarui` with timestamp. |
| EH-004 | Partial channel data unavailable | Return the available channels and hide/disable the unavailable channel(s) without breaking the section. | Disable card with `Belum tersedia`. |
| EH-005 | Missing channel identity data | Treat as zero-count for that channel, not an error. | `0` with empty-state helper. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Inbound lands exactly on a month boundary second. | Counted in the correct month using `>= start AND < end` in the reporting timezone selected in FR-013. | No special UI. |
| EC-002 | Reporting timezone vs UTC discrepancy. | Month bucketing uses `Asia/Jakarta` via the shipped `jakarta-reporting-day` util (FR-013). Legacy metrics still have a UTC-midnight path (`buildDates`), but MUV MUST use the Jakarta path so its month boundaries match the canonical reporting day. | No special UI. |
| EC-003 | Widget inbound has no phone (anonymous). | Counted via the deterministic non-PII identity key (FR-011); never persisted as PII. | No PII exposed. |
| EC-004 | Same contact messages twice in the same channel in the same month. | Counted once (FR-006). | No special UI. |
| EC-005 | Same contact reaches via two different channels in the same month. | Counted once per channel (FR-007). | No special UI. |
| EC-006 | A channel has zero inbound this month. | Shows `0` with empty-state helper, not an error. | `Belum ada data` helper. |
| EC-007 | Contact phone stored in different formats (`+62812…`, `0812…`, `62812…`). | Normalized to one identity key by the shared normalization function (FR-005) → one client. | No special UI. |
| EC-008 | A month before go-live is viewed (if historical nav exists). | Shows empty-state helper (no backfill), not misleading `0`. | Helper text for pre-launch months. |
| EC-009 | Reporting timezone config changes mid-month. | **`[RESOLVED v1.3]`** N/A — the reporting timezone is a fixed constant (`Asia/Jakarta`, `jakarta-reporting-day.ts`), not a per-company config; there is no mid-month change to handle. | No UI. |

---

## **9. Data Model**

### 9.1 Aggregation Storage (analytics-service, no PII)

| Field | Type | Example | Notes |
| ----- | ----- | ----- | ----- |
| `companyId` | string | `cmp_123` | Derived from authenticated tenant; not client-overridable. |
| `channel` | enum | `whatsapp_web` | In-scope channel key. |
| `periodMonth` | string | `2026-09` | Calendar month in the reporting timezone (FR-013). |
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
| Unauthorized role | Denied | Hidden or blocked per Statistic-page permission behavior. |

- Visibility is derived from the authenticated tenant context; no client-side `companyId` override is accepted.
- Denied = hard 403 via `PermissionsGuard` + `@RequirePermissions([StatisticPermission.READ])`, **not** via the scope-narrowing helpers (which would return a narrowed response, not a deny).

---

## **10a. Non-Functional Requirements**

| ID | Requirement | Default / `[DECISION NEEDED]` |
| ----- | ----- | ----- |
| NF-1 | **Data retention** for the pre-aggregated distinct-client collection. | `[DECISION NEEDED]` Recommend a TTL index (cf. `prd-sync-contact-third-party.md` 30-day precedent); retention ≥ 13 months to allow YoY. |
| NF-2 | **Query latency** for the summary endpoint. | `[DECISION NEEDED]` Default target `< 200ms` p95, matching the existing pre-aggregation plan. |
| NF-3 | **Cache TTL** for the summary response. | Default `ONE_HOUR = 3600` (existing `CacheTTLEnum`). |
| NF-4 | **Volume expectations** — companies × channels × distinct clients/month. | `[RESOLVED v1.3 — OQ-03]` Exact hashed-set chosen. Realistic sizing ≈ ~18 GB @ 13-mo retention (16-byte hash × ~1K distinct/channel/day × 6 ch × ~500 companies) — well within exact-set feasibility. HLL escalation trigger: any tenant sustaining **>50K distinct/channel/day**. Confirm against real per-tenant numbers before GA. |
| NF-5 | **Aggregation freshness / cadence.** | Default: follow the existing `AggregationSchedulerService` cadence (3-hourly cron). `lastUpdatedAt` surfaced per EH-003. |
| NF-6 | **No perf impact on existing services** (zero-tolerance). | Additive collection + additive route only (FR-024/FR-025/FR-026); no change to existing analytics queries, cron jobs, or schemas. |

---

## **10b. Success Metrics**

| Metric | Target | How Measured |
| ----- | ----- | ----- |
| Adoption | ≥ 1 view/company/month by an authorized user within 30 days of GA | Endpoint access logs, distinct `companyId` |
| Label correctness | 100% of labels/tooltips use `Unique Inbound Clients` / `Pelanggan Unik Bulanan`; 0 `MUV`/`Monthly Visitors` | Copy audit (FR-008/FR-009), automatable string search |
| Count integrity | Distinct-count matches an independent spot-check query within tolerance | QA cross-check vs raw Conversation/Contact query for a sample company/month |
| Zero regression | 0 changes to the six existing Statistic sections + Settings > Channel Management usage stats | Regression suite (FR-025/FR-026) |

---

## **11. Open Questions**

| ID | Question | Why It Matters | Blocking? | Recommended Default (needs PM sign-off) |
| ----- | ----- | ----- | ----- | ----- |
| OQ-01 | Is "inbound client" a unique **normalized contact** per channel per month, or a unique **conversation**? Which channels are in scope? | Changes the aggregation source and identity key entirely. | ~~Yes~~ **`[RESOLVED v1.3]`** | **CLOSED — unique normalized contact** (not conversation). Channels = WhatsApp Web, WhatsApp API, Widget, Instagram, Facebook Messenger, Email (6). **Telegram excluded** — catalog-only, no backend service (F-04), accepted for launch. |
| OQ-02 | Should `SUPERVISOR_SALES` see this metric? | Access gate boundary. | ~~Yes~~ **`[RESOLVED v1.3]`** | **CLOSED — No.** Access = `ADMIN`/`SUPER_ADMIN` (wildcard) + `SUPERVISOR` (`StatisticPermission.ALL`, `default-permission.constant.ts`). `SUPERVISOR_SALES` (holds only `StatisticPermission.READ`) and `SALES` (no statistic permission) are **excluded by design**. Gate stays ALL-or-wildcard — **do NOT widen to READ, do NOT create a new permission**; reuse existing `StatisticPermission.ALL`. |
| OQ-03 | What is the actual volume (companies × channels × distinct clients/month)? | Chooses exact-hash vs HLL and sizes storage. | ~~Yes~~ **`[RESOLVED v1.3]`** | **CLOSED — exact hashed-set.** Card's ~150 GB sizing is an over-estimate; realistic SatuInbox footprint ≈ ~18 GB @ 13-mo retention (16-byte hash × ~1K distinct/channel/day × 6 ch × ~500 companies). Store as **daily per-channel aggregate** so a future swap to HLL needs no schema migration. Escalate to HLL **only if** a tenant sustains >50K distinct/channel/day. No HLL in codebase today — do not add now. |
| OQ-04 | Which month does a client belong to — `Conversation.createdAt` or first inbound message time? | Bucketing semantics. | ~~Yes~~ **`[RESOLVED v1.3]`** | **CLOSED — both, with fallback:** `bucketTs = ConversationSLAMetrics.firstCustomerMessageAt ?? Conversation.createdAt`. First-inbound when present (accurate), fallback to `createdAt` (always present). Closes GAP-01 (sidecar SLA does not guarantee coverage). Join via `conversationId` (already indexed). **Regression test required:** a conversation with no SLA record MUST still be counted via `createdAt`. |
| OQ-Widget | What is the deterministic identity key for anonymous Widget inbound (no phone)? | Widget may have no phone → cannot dedupe by phone. | ~~Yes (for Widget)~~ **`[RESOLVED v1.3]`** | **CLOSED — contact id when present; else non-PII session fingerprint.** Known limitation accepted: UUID fallback cross-browser over-counts one person as 2×; real fix deferred to Phase 2. |
| OQ-Demand | Demand/priority level: L2 vs L3? | Affects scheduling. | No | **L3** — worth building; additive analytics, not a workflow blocker. |
| OQ-Backfill | Backfill historical months or start from go-live? | Prevents misleading `0` for prior months. | ~~No~~ **`[RESOLVED v1.3]`** | **CLOSED — start from go-live; no historical backfill in Phase 1** (D-12). Pre-launch months show an empty-state helper. Stakeholder expectation to be managed. |

---

## **12. Dependencies**

| Dependency | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Contact data (`normalized phone` unique id) via channel-service | Engineering | Identity key source; without it the metric cannot dedupe. | Reuse the shared normalization function; ingest via the chosen pattern from FR-018 (Redash query or cron pre-aggregation), not a new event consumer. |
| Conversation data (`channel` + month-bucket timestamp, see FR-018 F-01) via conversation-service | Engineering | Channel attribution + month bucketing source. | Reuse the existing aggregation path (`MessageQueuePatterns.ANALYTICS_AGGREGATE_CONVERSATION_BATCH` via RMQ, or a Redash query); there is no "inbound event flow" consumed by analytics. `firstCustomerMessageAt` is **not** on `conversation.schema.ts` — pick a real field per FR-018. |
| `analytics-service` pre-aggregation pattern | Engineering | Distinct-count at scale without raw PII storage. | Follow `ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`. Daily rows are keyed per **Jakarta reporting day** via `jakarta-reporting-day` util (`buildCompletedJakartaDates`, scheduler cron `timeZone: 'Asia/Jakarta'`) — align "daily keys → monthly rollup" to that Jakarta day, reusing the util (FR-013). The `conversation-daily-metrics.schema.ts` per-day ObjectId-array layout is the concrete precedent for MUV's per-day hashed-key sets. |
| Existing **Statistic** page + RBAC | Engineering / Product | Section placement and access. | Reuse the existing `StatisticPermission` enum + `analytics-scope.util.ts` (see G-10); do not cite "Visitor Analytics permission surface" (not shipped). |
| OQ-01 / OQ-Widget resolution | PM | Metric semantics cannot be frozen without it. | Flag `[DECISION NEEDED]`; do not silently assume. |

---

## **13. Risks**

| Risk | Likelihood | Severity | Mitigation |
| ----- | ----- | ----- | ----- |
| Metric mislabeled `MUV`/`Monthly Visitors` → confused with GA4 | High | Medium | Locked naming decision (§2.1) + FR-008/FR-009; glossary + tooltip. |
| PII leakage (raw phone persisted in analytics) | Medium | High | Hash identity key / HLL; FR-017/FR-019; verify no raw-phone column in analytics DB. |
| Normalization divergence (no shared function; 5 divergent impls) → over/under-count | High | High | FR-005 [DECISION NEEDED — F-02]: pick one named impl or create `libs/common` normalizer; regression test on `+62` vs `08` formats. |
| Distinct-count cost grows with volume | Medium | Medium | Pre-aggregation per day (FR-021); HLL if approximate acceptable. |
| Month-boundary/timezone miscount | Medium | Medium | Reporting timezone (FR-013); `>= start AND < end`; EC-001/EC-002. |
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
| FR-013 / EC-001 / EC-002 | Month boundary in the reporting timezone (FR-013) | Assessment F-07 / Codebase G-07 | Boundary-second inbound lands in correct month |
| FR-017 / FR-019 | No raw PII in analytics | Assessment F-04 | Analytics DB has no raw-phone column |
| FR-021 | Pre-aggregation for bounded query | Assessment F-06 | Load test within analytics SLO |
| FR-025 / FR-026 | Existing Statistic sections + Add-ons US-6 unchanged | Brief §4.3 / Codebase G-01 | Regression: the six Statistic sections + US-6 output unchanged |
| FR-029 / EC-008 | No backfill (go-live onward) | Assessment F-08 | Pre-launch months show empty-state helper |

---

## **15. Change Log**

| Date | Change | Author |
| ----- | ----- | ----- |
| 2026-09-23 | Initial Standard-mode PRD created. Metric renamed to "Unique Inbound Clients"; OQ-01/OQ-04/demand flagged with recommended defaults. | Dany Christian (PM) |
| 2026-09-24 | v1.1 codebase-alignment patch applied (G-01..G-10 verified file:line, reviewer PASS). New env-var flag, reporting-timezone, and analytics data-source decisions added as `[DECISION NEEDED]`. | Dany Christian (PM) |
| 2026-09-24 | v1.2: external product-analyst review (of v1.0) applied. **New in v1.2** (not already handled by v1.1): F-01 timestamp field corrected, F-02 normalizer DECISION, F-04 Telegram excluded, F-12 US-6 restated, F-11 HLL→exact default, F-18 channel-enum DECISION, §10a NFR + §10b Success Metrics added. Review's F-05/F-06/F-07/F-13/F-14 were **already resolved in v1.1** (Statistic naming, timezone, env-var flag, deny-logic, data-source) — not re-opened. Full open-DECISION list: see §11 Open Questions + inline `[DECISION NEEDED]` markers. | Dany Christian (PM) |
