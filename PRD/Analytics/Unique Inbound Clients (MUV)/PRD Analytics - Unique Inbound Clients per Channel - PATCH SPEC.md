# PATCH SPECIFICATION — MUV PRD → Real SatuInbox Codebase

**Target PRD:** `PRD/Analytics/PRD Analytics - Unique Inbound Clients per Channel.md` (v1.0)
**Mode:** SPEC ONLY — do not edit the PRD; the orchestrator applies these replacements.
**Verification date:** 2026-09-24 (SE Asia Standard Time)

Repo roots used for evidence:
- FE: `omnichannel-satuinbox-fe`
- BE: `omnichannel-satuinbox-be`

Legend: `[CODEBASE-VERIFIED]` = unambiguous fact from source. `[DECISION NEEDED]` = code allows >1 valid choice, Product/Eng must pick.

---

## G-01 — FE surface is "Statistic" (`/statistic`), not "Analytics"

**Code evidence (all verified):**
- `FE apps/omnichannel/components/pages/ManageStatisticPage.tsx:14-21` — `const VALID_SECTIONS = ['conversations','broadcast','ticket','responsiveness','member-performance','offline-report'] as const`
- `FE apps/omnichannel/components/pages/ManageStatisticPage.tsx:32` — section is driven by `?section=` query param on the existing `/statistic` route
- `FE apps/omnichannel/components/molecules/statistic/StatisticNav.tsx:26-45` — `const menu = [ {key:'conversations'}, {key:'ticket'}, {key:'responsiveness'}, {key:'member-performance'}, {key:'broadcast'}, {key:'offline-report'} ]`, labels from `t('statistic.side-nav.*')`
- `FE apps/omnichannel/app/[locale]/(main)/statistic/page.tsx` — route renders `ManageStatisticPage`
- `BE apps/api-gateway/src/app/analytics/analytics.controller.ts:37` — `@Controller('analytics/conversation')` → "analytics" is correct **backend-side only**

**Rule:** replace every "Analytics page/shell" that refers to the FE product surface with "Statistic page" (`/statistic`). Backend REST routes stay `analytics/*`.

| # | PRD anchor (exact text) | Corrected text | Class |
|---|---|---|---|
| 1 | §2 Overview Scope: "Phase 1 covers one new analytics section key under the existing Analytics shell, per-channel monthly distinct-inbound-client aggregation…" | "Phase 1 covers one new **Statistic** section key under the existing **Statistic** page (FE route `/statistic`), per-channel monthly distinct-inbound-client aggregation, summary KPI cards, error/empty states, and backend computation inside `analytics-service`… (Backend REST routes are prefixed `analytics/*`; the FE product surface is branded **Statistic**.)" | CODEBASE-VERIFIED |
| 2 | §2.2 Scope row: "New analytics section `Unique Inbound Clients` under existing Analytics page." | "New **Statistic** section `Unique Inbound Clients` under the existing Statistic page (`/statistic`), added to `VALID_SECTIONS` (ManageStatisticPage) + the `menu` array (StatisticNav)." | CODEBASE-VERIFIED |
| 3 | §3 PS-002: "Existing Analytics sections (Conversation, Ticket, Responsiveness, Member Performance, Broadcast, Offline Report, Visitor Analytics) and Add-ons US-6 do not expose a distinct-inbound-client monthly count." | "The six existing Statistic sections (`conversations`, `broadcast`, `ticket`, `responsiveness`, `member-performance`, `offline-report`) and Add-ons US-6 do not expose a distinct-inbound-client monthly count. (Visitor Analytics is a separate, not-yet-shipped PRD and is **not** an existing section in the current FE.)" | CODEBASE-VERIFIED |
| 4 | §4 OKR row 1: "…read the current-month distinct inbound client count per channel without leaving the Analytics shell." | "…without leaving the Statistic page (`/statistic`)." | CODEBASE-VERIFIED |
| 5 | FR-001: "System MUST add a new analytics section key `unique-inbound-clients` to the existing analytics shell." | "System MUST add a new section key `unique-inbound-clients` to `VALID_SECTIONS` in `ManageStatisticPage.tsx` and a matching entry (icon + `t('statistic.side-nav.unique-inbound-clients')` label) to the `menu` array in `StatisticNav.tsx` — i.e. a 7th section inside the existing `/statistic` page." | CODEBASE-VERIFIED |
| 6 | FR-002: "System MUST show a sidebar menu item labeled `Unique Inbound Clients` when the feature is enabled." | "System MUST show a **Statistic left-nav** (`StatisticNav`) menu item labeled `Unique Inbound Clients` when the feature is enabled." | CODEBASE-VERIFIED |
| 7 | FR-003: "System MUST render the section inside the existing Analytics page, not redirect externally." | "System MUST render the section inside the existing Statistic page (`/statistic`, `ManageStatisticPage`), not redirect externally and not create a new top-level route." | CODEBASE-VERIFIED |
| 8 | US-001 AC1: "When I open the Analytics page, Then I see a menu item labeled `Unique Inbound Clients`." | "When I open the Statistic page (`/statistic`), Then I see a menu item labeled `Unique Inbound Clients`." | CODEBASE-VERIFIED |
| 9 | US-001 AC2: "Given the feature flag is disabled, When I open Analytics, Then the menu item is hidden." | "Given the gating flag is disabled, When I open Statistic, Then the menu item is hidden." (see G-03 for the flag mechanism) | CODEBASE-VERIFIED (surface) / DECISION NEEDED (flag) |
| 10 | FR-025: "…existing Analytics sections (Conversation, Ticket, Responsiveness, Member Performance, Broadcast, Offline Report, Visitor Analytics — incl. Visitor Analytics FR-033/FR-034)." | "…existing Statistic sections (`conversations`, `broadcast`, `ticket`, `responsiveness`, `member-performance`, `offline-report`). (Drop the Visitor Analytics references — that PRD is not shipped and has no `FR-033/FR-034` in this codebase.)" | CODEBASE-VERIFIED |
| 11 | §12 Dependencies row: "Existing Analytics shell + RBAC | … | Reuse Visitor Analytics permission surface." | "Existing **Statistic** page + RBAC | … | Reuse the existing `StatisticPermission` enum + `analytics-scope.util.ts` (see G-10); do not cite 'Visitor Analytics permission surface' (not shipped)." | CODEBASE-VERIFIED |
| 12 | EH-001: "…or hide the menu item per analytics-shell behavior." | "…or hide the menu item per Statistic-page behavior." | CODEBASE-VERIFIED |

---

## G-03 — No feature-flag platform; only env-var / per-config boolean gating

**Code evidence (all verified):**
- `BE apps/analytics-service/src/app/controllers/conversation.controller.ts:54-56` — `private get isPreAggregationEnabled(): boolean { return this.configService.get<string>('AGGREGATION_ENABLED', 'false') === 'true'; }`
- `BE apps/analytics-service/src/app/services/aggregation-scheduler.service.ts:96-99` — `const enabled = this.configService.get<string>('AGGREGATION_ENABLED', 'false'); if (enabled !== 'true') { return; }`
- `BE apps/company-service/src/app/schemas/csat-config.schema.ts:32-36` — `@Prop({ default: true, type: Boolean }) isEnabled: boolean;` (per-company config record, the only boolean-toggle precedent)
- **Absent:** no feature-flag collection/service exists. Searched `feature-flag` (files) → 0; `NotificationFeatureFlag` (content) → 0. The `NotificationFeatureFlagService` cited in the Visitor Analytics review is **not present in this repo** — do not cite it as a precedent.

**Rule:** "feature flag" in the PRD must be reworded to "deploy/env-var gate (Engineering change + restart)"; a PM-facing runtime toggle does not exist.

| # | PRD anchor (exact text) | Corrected text | Class |
|---|---|---|---|
| 1 | FR-028: "The section MUST be feature-flag gated and hidden when the flag is disabled." | "The section MUST be gated by an **environment-variable deploy flag** (the codebase's only flag mechanism — cf. `AGGREGATION_ENABLED` in `conversation.controller.ts:54-56` and `aggregation-scheduler.service.ts:96-99`). When the flag is disabled the menu item is hidden. There is **no runtime PM-facing feature-flag platform**; enabling/disabling is an Engineering env-var change + deploy/restart. `[DECISION NEEDED]` name the env var (e.g. `UNIQUE_INBOUND_CLIENTS_ENABLED`) and the owning service." | DECISION NEEDED (mechanism) |
| 2 | US-001 AC2: "Given the feature flag is disabled, When I open Analytics, Then the menu item is hidden." | "Given the deploy/env gate is disabled, When I open Statistic, Then the menu item is hidden. `[DECISION NEEDED]` the FE has no flag-consumption path today (all existing flags are backend env vars the FE cannot read); FE visibility must be driven by either a gating endpoint, a build-time var, or a hard-coded rollout — pick one." | DECISION NEEDED |
| 3 | §2 Key Capabilities: "…no PII; monthly summary period; feature-flag gated." | "…no PII; monthly summary period; deploy/env-var gated (no runtime feature-flag platform)." | CODEBASE-VERIFIED |
| 4 | FR-002: "…when the feature is enabled." | "…when the deploy/env gate is enabled (see FR-028)." | CODEBASE-VERIFIED |

---

## G-07 — No canonical "company workspace timezone" field

**Code evidence (all verified):**
- `BE apps/company-service/src/app/schemas/company.schema.ts` (196 lines) — fields are `businessLicenseNumber, name, taxNumber, identificationNumber, businessLicenseUrl, identificationUrl, owner, isVerified, approvedAt, approvedBy, rejectedAt, rejectedBy, rejectedReason, phone, email, createdBy, webhooks`. **No timezone field.**
- `BE apps/company-service/src/app/schemas/shift.schema.ts:56-61` — `@Prop({ required: true, type: String }) timezone: string;` doc: "IANA timezone identifier for correct SLA calculations" (per-**Shift**, not per-company; a company can have many Shifts)
- `BE apps/analytics-service/src/app/services/aggregation-scheduler.service.ts:341-347` — `buildAggregationDates()` buckets by **UTC midnight** (`today.setUTCHours(0, 0, 0, 0)`), i.e. the current scheduler does **not** use any company timezone.

**Rule:** FR-013/EC-001/EC-002/EC-009 and §2.2/§9.1/§13 must drop "company workspace timezone" and instead reference a to-be-chosen "reporting timezone".

| # | PRD anchor (exact text) | Corrected text | Class |
|---|---|---|---|
| 1 | FR-013: "Month boundaries MUST be computed in the **company workspace timezone**, aligned with Visitor Analytics FR-012." | "Month boundaries MUST use a single defined **reporting timezone**. `[DECISION NEEDED]` there is **no** canonical company timezone field (`Company`/`Organization` schemas have none; the only per-entity IANA field is per-`Shift`, `shift.schema.ts:61`). Choose: (a) hardcode `Asia/Jakarta` for all companies (consistent with existing analytics-service cron/query behavior), or (b) a resolution rule (e.g. default Shift's timezone) with an explicit fallback when no Shift exists. Remove 'aligned with Visitor Analytics FR-012' — that PRD is not shipped." | DECISION NEEDED |
| 2 | EC-001: "Counted in the correct month using `>= start AND < end` in the company workspace timezone." | "Counted in the correct month using `>= start AND < end` in the reporting timezone selected in FR-013." | DECISION NEEDED (depends on FR-013) |
| 3 | EC-002: "Company workspace timezone vs UTC/WIB discrepancy. \| Month bucketing uses company workspace timezone (FR-013), not UTC or hard-coded WIB." | "Reporting timezone vs UTC discrepancy. \| Month bucketing uses the reporting timezone selected in FR-013. Note: the existing aggregation scheduler buckets by **UTC midnight** (`aggregation-scheduler.service.ts:341-347`); if FR-013 chooses `Asia/Jakarta`, the scheduler/query must be changed to match, otherwise month boundaries diverge." | CODEBASE-VERIFIED (divergence risk) / DECISION NEEDED (choice) |
| 4 | EC-009: "Company mapping/timezone config changes mid-month. \| New fetches use the latest config; counts are computed against the config in effect for that month's aggregation window." | "Only meaningful if FR-013 option (b) is chosen (there is no company timezone config field today). `[DECISION NEEDED]` if (b): define the 'config in effect' rule; if (a) hardcode `Asia/Jakarta`, delete this edge case." | DECISION NEEDED |
| 5 | §2.2 Scope row: "Monthly summary period aligned to company workspace timezone." | "Monthly summary period aligned to the reporting timezone selected in FR-013 (no canonical company timezone field exists today)." | CODEBASE-VERIFIED |
| 6 | §9.1 field `periodMonth`: "Calendar month (company workspace timezone)." | "Calendar month in the reporting timezone (FR-013)." | CODEBASE-VERIFIED |
| 7 | §13 Risks row: "…Company workspace timezone (FR-013); `>= start AND < end`…" | "…Reporting timezone (FR-013); `>= start AND < end`…" | CODEBASE-VERIFIED |

---

## G-09 — analytics-service is cron pre-aggregation + Redash, NOT event-driven

**Code evidence (all verified):**
- Controllers are gRPC controllers, not event consumers: `BE apps/analytics-service/src/app/controllers/` = `conversation.controller.ts, ticket-analytics.controller.ts, member-analytics.controller.ts, responsiveness-analytics.controller.ts, broadcast-analytics.controller.ts, backfill.controller.ts (RMQ handler), analytics-metadata.controller.ts, export-report-job.controller.ts`
- Read-time data source #1 = **Redash warehouse query**: `BE apps/analytics-service/src/app/services/redash.service.ts:42-62` — `executeQuery()` POSTs to `${redashUrl}/api/queries/${queryId}/results`
- Read-time data source #2 = **pre-aggregated Mongo collections**, populated by a **3-hourly cron**: `BE apps/analytics-service/src/app/services/aggregation-scheduler.service.ts:94` — `@Cron(CronExpression.EVERY_3_HOURS)` (not a consumer; it **pulls** from source services via RMQ request-response, e.g. `MessageQueuePatterns.ANALYTICS_AGGREGATE_CONVERSATION_BATCH`)
- Cross-service reads **do** happen at query time in the current code: `BE apps/analytics-service/src/app/services/member-analytics.service.ts:110-113` (`teamService/memberService/csatService` gRPC clients) and `:140-160` (`fetchMemberInfoMap`, `fetchAvgCsatMap`, `fetchAuxSummaryMap` gRPC calls inside `getMemberPerformance`)

**Rule:** FR-018's "event-driven aggregation — no cross-service reads at query time" is false on both counts. Correct to match one of the two real patterns.

| # | PRD anchor (exact text) | Corrected text | Class |
|---|---|---|---|
| 1 | FR-018: "`analytics-service` MUST compute the metric from Conversation data (`channel` + `firstCustomerMessageAt`) and Contact data (normalized phone), via event-driven aggregation — **no cross-service reads at query time** (DB-per-service)." | "`analytics-service` MUST compute the metric server-side from Conversation data (`channel` + `firstCustomerMessageAt`) and Contact data (normalized phone). The codebase pattern is **not** event-driven: metrics are served either (a) by a Redash warehouse query at read time (`redash.service.ts`), or (b) by a pre-aggregated collection populated by a 3-hourly cron that pulls source data over RMQ (`aggregation-scheduler.service.ts:94`). 'No cross-service reads at query time' is false in the current code — `member-analytics.service.ts:110-113,140-160` performs gRPC reads to people-service/ticket-service at query time. `[DECISION NEEDED]` pick (a) or (b); do not write 'event-driven consumer' into the TRD." | CODEBASE-VERIFIED (current behavior) / DECISION NEEDED (which pattern) |
| 2 | §12 Dependency (Contact data): "…Reuse the shared normalization function; event-driven ingest." | "…Reuse the shared normalization function; ingest via the chosen pattern from FR-018 (Redash query or cron pre-aggregation), not a new event consumer." | CODEBASE-VERIFIED |
| 3 | §12 Dependency (Conversation data): "…Reuse the existing inbound event flow (already used for SLA)." | "…Reuse the existing aggregation path (`MessageQueuePatterns.ANALYTICS_AGGREGATE_CONVERSATION_BATCH` via RMQ, or a Redash query); there is no 'inbound event flow' consumed by analytics." | CODEBASE-VERIFIED |
| 4 | §12 Dependency (pre-aggregation): "…Follow `ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`; daily hashed keys → monthly rollup." | "…Follow `ANALYTICS_PREAGGREGATION_IMPLEMENTATION_PLAN.md`. Note the real cadence is a 3-hourly cron (`CronExpression.EVERY_3_HOURS`), and daily rows are keyed at UTC midnight (`aggregation-scheduler.service.ts:341-347`) — align 'daily keys → monthly rollup' to that, and reconcile the UTC bucketing with FR-013's timezone." | CODEBASE-VERIFIED |

---

## G-10 — Permission scope narrows, it does not deny (read endpoints)

**Code evidence (all verified):**
- `BE libs/common/src/lib/constants/default-permission.constant.ts:129-135` — `StatisticPermission = { ALL, BACKFILL, READ, READ_OWN, READ_TEAM }` (no dedicated "company-wide" value)
- `BE apps/api-gateway/src/app/analytics/analytics-scope.util.ts:15-22` — `isSelfOnlyScope()` returns a boolean; `:36-44` `resolveAgentId()`, `:57-65` `resolveTeamId()` **narrow** scope to the user's own agent/team — **no deny/throw path**
- `BE apps/analytics-service/src/app/services/member-analytics.service.ts:317-327` — `resolveAgentIds(): Promise<string[] | 'all'>` returns `[agentId]`, team members, or `'all'` — **narrowing, never a deny**
- Deny **precedent exists but only on backfill**: `BE apps/api-gateway/src/guards/permission.guard.ts:44` — `if (!allowed) throw new ForbiddenException(ERROR.INSUFFICIENT_PERMISSION);` applied via `@RequirePermissions([StatisticPermission.BACKFILL])` at `apps/api-gateway/src/app/analytics/backfill.controller.ts:45` (POST endpoint). The read GET endpoints (`analytics.controller.ts`, `member-analytics.controller.ts`) use only `JwtAuthGuard` + scope narrowing.
- Default role mapping: AGENT gets `StatisticPermission.READ_OWN` (`default-permission.constant.ts:230`); SUPERVISOR gets `ALL` (`:282`); SUPERVISOR_SALES gets `READ` (`:312`).

**Rule:** FR-016's hard "deny" for team-only/self-only is **new** logic on a read endpoint (not reuse of `resolveAgentId`/`resolveTeamId`), but it is implementable with the existing `PermissionsGuard` + `@RequirePermissions` pattern.

| # | PRD anchor (exact text) | Corrected text | Class |
|---|---|---|---|
| 1 | FR-016: "Access MUST be restricted to roles/permission scopes allowed to view company-level analytics; team-only and self-only scopes MUST be denied (parity with Visitor Analytics FR-005/FR-006)." | "Access MUST be restricted to roles/permission scopes allowed to view company-level analytics; team-only (`StatisticPermission.READ_TEAM`) and self-only (`StatisticPermission.READ_OWN`) scopes MUST be **denied** with a hard 403. This is **new** deny logic: the existing read endpoints narrow rather than deny (`resolveAgentId`/`resolveTeamId`/`isSelfOnlyScope` in `analytics-scope.util.ts`; `resolveAgentIds` returns `string[] \| 'all'` in `member-analytics.service.ts:317-327`). Implement by adding `@RequirePermissions([StatisticPermission.READ])` (or `ALL`) + `PermissionsGuard` to the new endpoint — the existing deny pattern, currently used only on `POST /analytics/backfill` (`backfill.controller.ts:45`). Remove 'parity with Visitor Analytics FR-005/FR-006' (not shipped)." | CODEBASE-VERIFIED |
| 2 | §10 table rows "Team-only analytics scope \| Denied (Phase 1)" and "Self-only analytics scope \| Denied (Phase 1)" | Keep as-is (desired behavior is correct), but append to the §10 note: "Denied = hard 403 via `PermissionsGuard` + `@RequirePermissions([StatisticPermission.READ])`, **not** via the scope-narrowing helpers (which would return a narrowed response, not a deny)." | CODEBASE-VERIFIED |
| 3 | §10 note "Visibility is derived from the authenticated tenant context; no client-side `companyId` override… (parity with Visitor Analytics FR-004/FR-007)." | "Visibility is derived from the authenticated tenant context; no client-side `companyId` override is accepted. (Drop the 'parity with Visitor Analytics FR-004/FR-007' reference — not shipped.)" | CODEBASE-VERIFIED |

---

## Residual open questions (for Product/Eng, not resolvable from code)

1. **G-03 (blocking):** How does the FE learn the flag state to hide the nav item? No FE flag-consumption path exists today — pick a gating endpoint, a build-time var, or a fixed rollout.
2. **G-07 (blocking):** Which reporting timezone — hardcode `Asia/Jakarta`, or a per-company resolution via the default `Shift` timezone (with fallback)? The existing scheduler buckets UTC midnight, so this choice also forces a scheduler/query change if not UTC.
3. **G-09 (blocking):** Which data-source pattern for the metric — Redash warehouse query (existing default) or 3-hourly cron pre-aggregation (new collection)? Also: the metric needs Contact (normalized phone) data, which the current pre-aggregation path (conversation/ticket/broadcast/responsiveness/member) does **not** touch — a new source-service aggregation pipeline is implied.
4. **G-10 (minor):** Which exact permission gates the read endpoint — `StatisticPermission.READ` or `ALL`? This determines whether SUPERVISOR_SALES (has `READ`) can view it.
5. **G-01 (minor):** Confirm Design accepts the label "Unique Inbound Clients" inside a page whose URL/nav is branded "Statistic".

---

## Unconfirmed items (leave PRD text as flagged assumptions)

- The `NotificationFeatureFlagService` cited in the Visitor Analytics review does **not exist in this repo** (0 search hits). Do not copy that reference into the MUV PRD; the only flag mechanism is the `AGGREGATION_ENABLED` env var (G-03).
- "Visitor Analytics FR-012/FR-005/FR-006/FR-033/FR-034/FR-004/FR-007" are cross-references to a PRD that is **not shipped** and whose FR numbers are not present in this codebase — all such references are flagged for removal, not verified.
