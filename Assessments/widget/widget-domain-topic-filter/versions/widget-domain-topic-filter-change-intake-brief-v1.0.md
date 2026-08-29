# Change Intake Brief: Widget Domain-Based Topic Filter

> **Artifact Type:** Change Intake Brief
> **Source Request:** User brainstorm session 2026-08-03
> **Artifact Path:** `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`
> **Tanggal Intake:** 2026-08-03
> **Status:** Scoped
> **Author:** Dany Christian

---

## 0. Ringkasan Update Brief

- Initial version: brainstorm → breakdown → confirmed answers → brief
- Scope: add domain filter to widget topic resolution so different websites show different topics under the same company account
- Routing: `ROUTE_PATCH_EXISTING_PRD` — additive field on existing schema, no core model change

---

## 1. Request Summary

**Request Summary:** Set widget topic visibility based on the website (origin domain) where the widget is embedded. One company can have multiple websites, each showing only relevant topics.

**Business Problem:** Currently all topics assigned to a widget account channel are shown regardless of which website loads the widget. Multi-brand / multi-site customers need topic routing per domain.

**Target User / Role / Stakeholder:**
- End user (widget visitor): sees only relevant topics for the website they're on
- Company admin: configures which topics appear on which domains during widget account creation

**Expected Outcome:** Widget topics are filtered by `origin domain` — topics with `allowedDomains` set only appear on matching domains; topics without `allowedDomains` remain visible everywhere (backward compatible).

**Urgency / Why Now:** No specific urgency — feature request.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `ADDITIVE_IMPROVEMENT` |
| Primary Domain | Widget (crosses into Channel Service for account channel schema) |
| Request Shape | Add |
| Initial Complexity Signal | Low |
| Needs Split? | No |

### Classification Rationale
- Adds optional `allowedDomains` field to existing `WidgetTopicInfo` schema
- Does not change core topic entity, lifecycle, or existing create/update/delete flows
- Backward compatible: empty/missing = all domains (current behavior preserved)

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | Widget Topic PRD exists (CRUD only, no domain concept) |
| PRD status | Existing, no domain filtering |
| PRD treatment candidate | Patch/Addendum |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Shipped — widget account create/update modal has topic select | `ActionAccountWidgetModal.tsx`, `ActionWidgetAccountFormField.tsx` |
| BE | Shipped — topic CRUD + account channel widget topic assignment | `widget-service/topic.service.ts`, `channel-service/account-channel.service.ts` |
| Runtime / Current Behavior | Widget client calls `GET /account-channel/topics` (open API), gets ALL topics for company — no domain filter | `account-channel.open.controller.ts:45`, aggregation in `account-channel.service.ts:415` |

### 3.3 Related Sources
- `Memory/global-memory.md`: Widget topic is existing feature, no domain concept
- `Memory/CLAUDE-be.md`: Widget service at `:50063`, Channel service at `:50058`
- `Memory/reference-index.md`: N/A (no prior domain-topic analysis)

---

## 4. Scope Boundary

### 4.1 In Scope
- Add `allowedDomains: string[]` field to `WidgetTopicInfo` schema (channel-service)
- Add `allowedDomains` to proto message (channel.proto, widget.proto)
- Add `originDomain` query param to `GET /account-channel/topics` open API endpoint
- Filter topics in aggregation pipeline when `originDomain` is provided
- Add `allowedDomains` input field in FE widget account create/update modal (`ActionWidgetAccountFormField.tsx`)
- Update Zod schema for widget account form
- Pass `allowedDomains` in create/update payload to API
- Update widget embed script to pass `window.location.origin` as `domain` param

### 4.2 Out of Scope
- Pattern matching / wildcard domain support (exact match only)
- Per-topic domain analytics / reporting
- Domain validation (checking if domain actually exists / is registered)
- Widget settings cache invalidation changes (existing cache per company still works)
- Changes to widget topic CRUD endpoints (admin-facing, not affected)
- Conversation creation / routing logic (topic is already resolved before conversation starts)

### 4.3 Protected Existing Behavior
- Topics without `allowedDomains` or with empty array MUST remain visible on ALL domains
- Existing widget accounts without domain config MUST work exactly as before
- Topic create/update/delete CRUD flow (admin) MUST not break
- `GET /widget/settings` (cached per company) MUST not be affected
- Widget conversation flow (inbound message → channel-service) MUST not be affected
- Topic usage check (`checkTopicUsage`) MUST not be affected
- Cascade delete flow MUST not be affected

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | Adding optional field, not changing existing entities |
| RBAC / visibility / assignment | No | No permission changes |
| API / webhook / socket / queue / cron | **Yes** | New optional query param on `GET /account-channel/topics` open API |
| SLA / reporting / export | No | Topic filtering is display-only |
| Migration / rollback / feature flag | **No** (but recommended) | Field is optional with default = empty array, no migration needed |
| Existing regression scope | **Yes** | Widget topic list, widget account create/update |

### Early Blast-Radius Notes
- **API contract change**: `GET /account-channel/topics` gets new optional `domain` query param. Backward compatible (no param = all topics).
- **Schema change**: `WidgetTopicInfo` in `account-channel.schema.ts` gets new optional field. No migration needed — existing docs treated as "all domains".
- **Cache**: Widget settings cache (`CacheKeyPrefixEnum.WIDGET_SETTINGS`) is NOT affected since topic resolution is a separate endpoint.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md` (Patch), `Rules/qa-analysis-rule.md`, `Rules/test-case-rule.md` |
| Recommended Next Artifact | Patch PRD + Test Cases |
| Can Proceed to PRD? | Yes — scope is clear, decisions confirmed |

### Routing Rationale
- Pure additive field, no behavior change to existing topic model
- Small blast radius — touches 1 schema, 1 aggregation pipeline, 1 API endpoint, 1 FE form, 1 embed script
- All open questions answered (exact match, admin UI location, backward compat)

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| ~~OQ-01~~ | ~~Domain matching: exact or pattern?~~ | ~~Affects filter logic complexity~~ | Resolved: **Exact match** | PM |
| ~~OQ-02~~ | ~~Admin UI location for domain input~~ | ~~Affects FE scope~~ | Resolved: **Widget account create/update modal** (`/settings/channels/widget?tab=widget-account`) | PM |
| ~~OQ-03~~ | ~~Existing topics behavior~~ | ~~Backward compat~~ | Resolved: **Default visible everywhere, only filter when domain field is set** | PM |
| OQ-04 | Widget embed script: is it in a separate repo or inside the FE monorepo? | Affects where embed script change lives | **Yes** | BE/FE Dev |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM (Dany Christian) | Scope lock | **Aligned** | Q1-Q3 answered |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Review brief before implementation |

---

## 9. Detailed Implementation Touchpoints

### 9.1 Backend (omnichannel-satuinbox-be)

| # | File | Change | Layer |
|---|------|--------|-------|
| B1 | `apps/channel-service/src/app/schemas/account-channel.schema.ts` | Add `@Prop({ default: [], type: [String] }) allowedDomains?: string[]` to `WidgetTopicInfo` class | Schema |
| B2 | `proto/channel.proto` | Add `repeated string allowed_domains` to `WidgetTopicInfo` message | Proto |
| B3 | `proto/channel.proto` | Add `string origin_domain` to `GetAccountChannelsTopicsRequest` | Proto |
| B4 | `apps/channel-service/src/app/services/account-channel.service.ts` | Pass `originDomain` to `buildTopicPipeline`, add `$elemMatch` filter in `buildTopicMatchStage` (~line 535) | Service |
| B5 | `apps/api-gateway/src/app/account-channel/account-channel.open.controller.ts` | Add `@Query('domain') domain?: string` param, pass as `originDomain` to gRPC call | Controller |
| B6 | `apps/api-gateway/src/app/account-channel/dto/create-account-channel.dto.ts` | Add `allowedDomains?: string[]` to `WidgetTopicDto` | DTO |
| B7 | `apps/api-gateway/src/app/account-channel/types/index.ts` | Add `allowedDomains?: string[]` to `AccountChannelWidgetTopics` | Type |
| B8 | `apps/api-gateway/src/app/account-channel/account-channel.controller.ts` | Pass `allowedDomains` through in create/update payload mapping (~line 912-913) | Controller |

### 9.2 Frontend (omnichannel-satuinbox-fe)

| # | File | Change | Layer |
|---|------|--------|-------|
| F1 | `apps/omnichannel/schemas/settings/channels/widget/CreateWidgetAccountSchema.ts` | Add `allowedDomains: z.array(z.string()).optional()` to topic schema | Schema |
| F2 | `apps/omnichannel/components/molecules/settings/widget/tabs-widget-account/modal/action-widget-account/ActionWidgetAccountFormField.tsx` | Add domain input field (comma-separated or tag input) after topic select | Component |
| F3 | `apps/omnichannel/hooks/widget/widget-account/useWidgetAccountAction.ts` | Pass `allowedDomains` in create/update payload (~line 77, 103) | Hook |
| F4 | `ActionAccountWidgetModal.tsx` | Reset `allowedDomains` in form cleanup (~line 212) | Component |
| F5 | Widget embed script (location TBD — see OQ-04) | Add `?domain=${encodeURIComponent(window.location.origin)}` to topics fetch call | Embed |

### 9.3 Channel Service Aggregation Pipeline Detail

**Current** `buildTopicMatchStage` (line 535):
```ts
{
  $match: {
    channel: { $in: channelIds },
    connectionStatus: 'ACTIVE',
    isDeleted: false,
    'widgetProperties.widgetTopics': { $exists: true, $ne: [] },
  },
}
```

**Proposed** (when `originDomain` is provided):
```ts
{
  $match: {
    channel: { $in: channelIds },
    connectionStatus: 'ACTIVE',
    isDeleted: false,
    'widgetProperties.widgetTopics': {
      $elemMatch: {
        $or: [
          { allowedDomains: { $size: 0 } },
          { allowedDomains: { $exists: false } },
          { allowedDomains: originDomain },
        ],
      },
    },
  },
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

| ID | Test | File | Assertion |
|----|------|------|-----------|
| UT-01 | `buildTopicMatchStage` with domain filter | `account-channel.service.spec.ts` | When `originDomain="toko-a.com"` → $elemMatch includes only topics where `allowedDomains` is empty, missing, or contains `"toko-a.com"` |
| UT-02 | `buildTopicMatchStage` without domain filter | same | When `originDomain` is undefined → original match (no $elemMatch) |
| UT-03 | Zod schema validation with `allowedDomains` | FE spec | `allowedDomains: ["toko-a.com"]` passes; `allowedDomains: []` passes; field omitted passes |
| UT-04 | API Gateway topic param forwarding | `account-channel.open.controller.spec.ts` | `?domain=toko-a.com` → gRPC called with `originDomain: "toko-a.com"` |

### 10.2 Integration Tests

| ID | Test | Scenario | Expected |
|----|------|----------|----------|
| IT-01 | Topic visible when domain matches | Account channel has topic with `allowedDomains: ["toko-a.com"]`, request from `toko-a.com` | Topic appears in response |
| IT-02 | Topic hidden when domain doesn't match | Same topic, request from `toko-b.com` | Topic does NOT appear |
| IT-03 | Topic visible on all domains when `allowedDomains` empty | Topic has `allowedDomains: []`, request from any domain | Topic appears |
| IT-04 | Topic visible when no `allowedDomains` field (legacy) | Existing topic without field, request from any domain | Topic appears |
| IT-05 | Multiple topics mixed | Topic A: `["toko-a.com"]`, Topic B: `[]`, request from `toko-b.com` | Only Topic B appears |
| IT-06 | Multiple topics mixed (match) | Same setup, request from `toko-a.com` | Both Topic A and Topic B appear |
| IT-07 | Create account channel with `allowedDomains` | POST with `widgetTopics: [{topicId, allowedDomains: ["x.com"]}]` | Saved correctly |
| IT-08 | Update account channel `allowedDomains` | PATCH with new domains | Updated correctly |

### 10.3 E2E / Manual Test Cases

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| E2E-01 | Admin creates widget account with domain | 1. Open `/settings/channels/widget?tab=widget-account` → Create → Fill display name → Select topic → Add domain "toko-a.com" → Save | Account created, topic has domain |
| E2E-02 | Admin creates widget account without domain | Same flow, leave domain empty | Account created, topic visible on all domains |
| E2E-03 | Widget on `toko-a.com` | 1. Open widget on toko-a.com | Shows only topics with empty `allowedDomains` or containing "toko-a.com" |
| E2E-04 | Widget on `toko-b.com` | 1. Open widget on toko-b.com | Shows only topics with empty `allowedDomains` or containing "toko-b.com" |
| E2E-05 | Admin edits domain | 1. Edit widget account → Change domain → Save | Widget on updated domain shows correct topics |

### 10.4 Regression Scope

| Area | Risk | Test |
|------|------|------|
| Existing widget accounts without domain config | LOW — backward compatible, empty array default | Verify existing accounts still show all topics on all domains |
| Widget account create/update CRUD | MEDIUM — new field in DTO | Verify create, update, delete still work with and without domain |
| Topic list in admin panel | LOW — topic CRUD endpoints not changed | Verify topic management page unaffected |
| Widget conversation flow | LOW — topic filtering is display-only | Verify conversation starts correctly with filtered topic |
| Widget settings cache | LOW — different endpoint | Verify `/widget/settings` still cached correctly |

---

## 11. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| Patch PRD | `PRD/Widget/` | Source scope, implementation touchpoints |
| QA Pre-Implementation Review | `Assessments/widget/widget-domain-topic-filter/` | Impact flags, protected behavior, test strategy |
| Test Cases | `Test/Widget/` | Test matrix from section 10 |
| Automation Mapping | `Assessments/widget/widget-domain-topic-filter/` | E2E candidates for Playwright |

---

## 12. Widget Package Impact

### Embed Script (`widget.min.js`)

| Metric | Value |
|--------|-------|
| Current size | 19.6 KB |
| After change | ~19.6 KB (+40 bytes) |
| Budget | 60 KB |
| Headroom | ~40 KB |

**Change:** 1 line in `chat-widget-setup.ts` `_createIframe()` — append `?origin=${window.location.origin}` to iframe URL.

```ts
// chat-widget-setup.ts ~line 245
const livechatUrl = new URL(`${this._config.allowedOrigin}/livechat/home`)
livechatUrl.searchParams.set('license', this._config.licenseKey)
livechatUrl.searchParams.set('origin', window.location.origin)  // NEW
```

### Widget Next.js App (iframe bundle, separate)

| Metric | Value |
|--------|-------|
| Topic fetch change | Read `origin` from URL param, pass as `?domain=` to API |
| Files | `use-livechat-widget-api-request.ts` (1 file, ~3 lines) |
| Bundle impact | Negligible (URLSearchParams read, no new deps) |

### Architecture Note

Topic filtering happens **server-side** in MongoDB aggregation pipeline. Widget embed script and Next.js app only pass the domain through — no filtering logic in client bundles.

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-03 | Initial brief created — brainstorm to confirmed scope | Dany Christian |
| 2026-08-03 | Added widget package impact analysis (Section 12), renumbered downstream sections | Dany Christian |
