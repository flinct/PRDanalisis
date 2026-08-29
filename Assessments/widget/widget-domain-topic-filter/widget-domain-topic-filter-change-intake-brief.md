# Change Intake Brief: Widget Domain-Based Topic Filter

> **Artifact Type:** Change Intake Brief
> **Source Request:** User brainstorm session 2026-08-03, refined 2026-08-12
> **Artifact Path:** `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md`
> **Version:** `v1.2`
> **Previous Version:** `Assessments/widget/widget-domain-topic-filter/versions/widget-domain-topic-filter-change-intake-brief-v1.0.md`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Assessments/widget/widget-domain-topic-filter/analysis-per-topic-domain-restriction.md`
> **Tanggal Intake:** 2026-08-03
> **Tanggal Update:** 2026-08-12
> **Status:** Ready for PRD
> **Author:** Dany Christian

---

## 0. Ringkasan Update Brief

- **v1.2 (2026-08-12):** All open questions resolved (OQ-04, OQ-07, OQ-08, OQ-09). Status → Ready for PRD.
- **v1.1.1 (2026-08-12):** OQ-07 resolved — max 10 domains per topic
- **v1.1 (2026-08-12):** Re-analysis dari brainstorm session baru + BE codebase verification
  - **Domain matching di-upgrade**: exact match → exact + `*.domain.com` prefix wildcard (string ops, no regex)
  - **Filter approach diklarifikasi**: filter di MongoDB aggregation pipeline (server-side), bukan post-cache di app layer
  - **Cache strategy ditambahkan**: cache full response seperti biasa, filtering di aggregation level — cache key tidak berubah
  - **www. stripping ditambahkan**: auto-strip `www.` prefix saat matching
  - **IP address handling ditambahkan**: exact match only untuk IP literal, wildcard tidak berlaku
  - **Security clarification**: ini display/tenant isolation feature, BUKAN security boundary
  - **BE codebase verified**: `WidgetTopicInfo`, `WidgetPropertyInfo`, `account-channel.service.ts` aggregation pipeline, `widget.open.controller.ts` — semua confirmed
  - **Open questions refined**: max domains per topic, fail-open vs fail-closed, wildcard depth
- Scope bertambah sedikit (wildcard support), tapi complexity tetap Low
- Routing tetap `ROUTE_PATCH_EXISTING_PRD`

---

## 1. Request Summary

**Request Summary:** Set widget topic visibility based on the website (origin domain) where the widget is embedded. One company can have multiple websites, each showing only relevant topics.

**Business Problem:** Currently all topics assigned to a widget account channel are shown regardless of which website loads the widget. Multi-brand / multi-site customers need topic routing per domain.

**Target User / Role / Stakeholder:**
- End user (widget visitor): sees only relevant topics for the website they're on
- Company admin: configures which topics appear on which domains during widget account creation/edit

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
- Adds optional `allowedDomains` field to existing `WidgetTopicInfo` sub-schema inside `WidgetPropertyInfo`
- Does not change core topic entity, lifecycle, or existing create/update/delete flows
- Backward compatible: empty/missing = all domains (current behavior preserved)
- Domain matching: exact hostname + `*.domain.com` prefix wildcard via string ops (no regex, no npm packages)

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
| BE | Shipped — topic CRUD + account channel widget topic assignment | `widget/src/app/services/topic.service.ts`, `channel-service/src/app/services/account-channel.service.ts` |
| Runtime / Current Behavior | Widget client calls `GET /account-channel/topics` (open API), gets ALL topics for company — no domain filter | `account-channel.open.controller.ts:45`, aggregation pipeline in `account-channel.service.ts` lines ~460-580 |

### 3.3 BE Codebase Verification (v1.1 addition)

**Confirmed data model:**

```typescript
// account-channel.schema.ts
class WidgetTopicInfo {        // sub-schema, _id: false
  topicId: Types.ObjectId;     // required, ref
  topicName: string;           // required
  subTopic?: string;           // optional
  lastSyncedAt: Date;          // default Date.now
  // allowedDomains: string[]  // ← YANG AKAN DITAMBAH
}

class WidgetPropertyInfo {     // sub-schema, _id: false
  widgetTopics: Array<WidgetTopicInfo>;
}

class AccountChannel extends Document {
  // ...
  widgetProperties?: WidgetPropertyInfo;  // line 164-165
  // ...
}
```

**Confirmed aggregation pipeline** (`account-channel.service.ts`):
- `buildTopicMatchStage` (~line 535): `$match` on `widgetProperties.widgetTopics` existence
- `$unwind` widgetTopics, then group/lookup for topic resolution
- Filter injection point: `$elemMatch` on `widgetProperties.widgetTopics` in the `$match` stage

**Confirmed cache** (`widget.open.controller.ts`):
- `GET /widget/settings` cached per company: `WIDGET_SETTINGS:company:{companyId}`, TTL 1 day
- Topic list served from **separate** aggregation endpoint, NOT from cached settings
- Therefore: topic filtering does NOT affect widget settings cache

### 3.4 Related Sources
- `Memory/global-memory.md`: Topic classification stored in `accountChannel[].widgetProperties.widgetTopics`. Confirmed working for Widget channel.
- `Memory/CLAUDE-be.md`: Widget service at `:50063`, Channel service at `:50058`
- `Memory/reference-index.md`: N/A (no prior domain-topic analysis)
- `Assessments/widget/widget-domain-topic-filter/analysis-per-topic-domain-restriction.md`: Full brainstorm analysis (2026-08-12)

---

## 4. Scope Boundary

### 4.1 In Scope
- Add `allowedDomains: string[]` field to `WidgetTopicInfo` sub-schema (channel-service)
- Add `allowedDomains` to gRPC proto message (`WidgetTopicInfo` in channel.proto / widget.proto)
- Add `originDomain` query param to `GET /account-channel/topics` open API endpoint
- Filter topics in aggregation pipeline when `originDomain` is provided
- Domain matching: exact hostname + `*.domain.com` prefix wildcard (string ops)
- Auto-strip `www.` prefix during matching
- IP address literal: exact match only (no wildcard applied)
- Add `allowedDomains` input field in FE widget account create/update modal
- Update Zod schema for widget account form
- Pass `allowedDomains` in create/update payload to API
- Update widget embed script to pass `window.location.origin` as `domain` param

### 4.2 Out of Scope
- Regex-based domain matching (overkill for ~50 entries)
- Per-topic domain analytics / reporting
- Domain validation (checking if domain actually exists / is registered via DNS)
- Widget settings cache restructuring (`GET /widget/settings` unaffected)
- Changes to widget topic CRUD endpoints (admin-facing, not affected by domain filter)
- Conversation creation / routing logic (topic is resolved before conversation starts)
- New microservice or npm dependencies

### 4.3 Protected Existing Behavior
- Topics without `allowedDomains` or with empty array MUST remain visible on ALL domains
- Existing widget accounts without domain config MUST work exactly as before
- Topic create/update/delete CRUD flow (admin) MUST not break
- `GET /widget/settings` (cached per company, 1 day TTL) MUST not be affected
- Widget conversation flow (inbound message → channel-service) MUST not be affected
- Topic usage check (`checkTopicUsage`) MUST not be affected
- Cascade delete flow MUST not be affected
- Widget settings cache key structure MUST not change

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | Adding optional field to existing sub-schema, not changing existing entities |
| RBAC / visibility / assignment | No | No permission changes. Domain filter is display-only, not access control |
| API / webhook / socket / queue / cron | **Yes** | New optional query param on `GET /account-channel/topics` open API |
| SLA / reporting / export | No | Topic filtering is display-only, not SLA-relevant |
| Migration / rollback / feature flag | No | Field is optional with default = empty array. No data migration needed |
| Existing regression scope | **Yes** | Widget topic list, widget account create/update |

### Early Blast-Radius Notes
- **API contract change**: `GET /account-channel/topics` gets new optional `domain` query param. Backward compatible (no param = all topics).
- **Schema change**: `WidgetTopicInfo` sub-schema in `account-channel.schema.ts` gets new optional field. No migration — existing docs treated as "all domains".
- **Cache**: Widget settings cache (`WIDGET_SETTINGS:company:{id}`) is NOT affected. Topic resolution is a separate aggregation endpoint.
- **gRPC proto**: Additive `repeated string allowed_domains` field. Proto3 backward compatible (empty = absent).
- **Domain filter is NOT a security boundary.** It's organizational/display feature. Origin header sent automatically by browser, hard to spoof from cross-origin but NOT impossible from non-browser clients.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_PATCH_EXISTING_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md` (Patch), `Rules/qa-analysis-rule.md`, `Rules/test-case-rule.md` |
| Recommended Next Artifact | Patch PRD + Test Cases |
| Can Proceed to PRD? | Yes — scope is clear, decisions confirmed, BE codebase verified |

### Routing Rationale
- Pure additive field on existing sub-schema, no behavior change to existing topic model
- Small blast radius — touches 1 sub-schema, 1 aggregation pipeline, 1 API endpoint, 1 FE form, 1 embed script line
- Most open questions resolved (domain matching approach, filter location, cache strategy, backward compat)
- 1 blocking question remains: widget embed script repo location (OQ-04)

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| ~~OQ-01~~ | ~~Domain matching: exact or pattern?~~ | ~~Affects filter logic complexity~~ | Resolved: **Exact + `*.domain.com` prefix wildcard** (v1.1 upgrade) | PM |
| ~~OQ-02~~ | ~~Admin UI location for domain input~~ | ~~Affects FE scope~~ | Resolved: **Widget account create/update modal** (`/settings/channels/widget?tab=widget-account`) | PM |
| ~~OQ-03~~ | ~~Existing topics behavior~~ | ~~Backward compat~~ | Resolved: **Default visible everywhere, only filter when domain field is set** | PM |
| ~~OQ-05~~ | ~~Filter location~~ | ~~Cache vs aggregation~~ | Resolved: **MongoDB aggregation pipeline** (not post-cache) | BE |
| ~~OQ-06~~ | ~~Cache strategy~~ | ~~Cache key change?~~ | Resolved: **No cache key change.** Topic list is separate from `/widget/settings` cache | BE |
| ~~OQ-04~~ | ~~Widget embed script location~~ | ~~Affects where embed script change lives~~ | Resolved: **FE monorepo** (`apps/widget/helpers/scripts/chat-widget-setup.ts`, compiled → `apps/widget/public/scripts/widget.min.js`) | BE/FE Dev |
| ~~OQ-07~~ | ~~Max allowed domains per topic?~~ | ~~Validation limit~~ | Resolved: **Max 10 per topic** | PM |
| ~~OQ-08~~ | ~~Fail-open vs fail-closed when Origin/referer header missing?~~ | ~~Security vs usability~~ | Resolved: **Fail-open** — show all topics when no domain param. Display feature, bukan security boundary. Browser selalu kirim Origin otomatis. Non-browser clients (curl, SSR, testing) tidak perlu diblokir. | PM |
| ~~OQ-09~~ | ~~Wildcard depth~~ | ~~Matching logic complexity~~ | Resolved: **1 level wildcard only** (`*.domain.com`). Covers 99% use case. Nested subdomain (`*.shop.domain.com`) bisa listing spesifik. Max 10 domain per topic masih muat. | PM |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM (Dany Christian) | Scope lock | **Aligned** | Q1-Q3 answered from v1.0; Q5-Q6 resolved from v1.1 BE verification |
| FE / BE / Tech Lead | Technical direction sanity check | Pending | Review brief before implementation |

---

## 9. Detailed Implementation Touchpoints

### 9.1 Backend (omnichannel-satuinbox-be)

| # | File | Change | Layer |
|---|------|--------|-------|
| B1 | `apps/channel-service/src/app/schemas/account-channel.schema.ts` | Add `@Prop({ default: [], type: [String] }) allowedDomains?: string[]` to `WidgetTopicInfo` class (line ~52-71) | Schema |
| B2 | `proto/` (channel.proto or widget.proto) | Add `repeated string allowed_domains` to `WidgetTopicInfo` message | Proto |
| B3 | `proto/` (channel.proto or widget.proto) | Add `string origin_domain` to `GetAccountChannelsTopicsRequest` | Proto |
| B4 | `apps/channel-service/src/app/services/account-channel.service.ts` | Pass `originDomain` to aggregation, add `$elemMatch` filter in `buildTopicMatchStage` (~line 535) | Service |
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

**Current** `buildTopicMatchStage` (~line 535):
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
// ponytail: no regex, no npm package, exact + wildcard string ops in $elemMatch
{
  $match: {
    channel: { $in: channelIds },
    connectionStatus: 'ACTIVE',
    isDeleted: false,
    'widgetProperties.widgetTopics': {
      $elemMatch: {
        $or: [
          { allowedDomains: { $size: 0 } },       // empty = all domains
          { allowedDomains: { $exists: false } },  // legacy (no field)
          { allowedDomains: normalizedDomain },     // exact match
          { allowedDomains: `*.${baseDomain}` },    // wildcard match
        ],
      },
    },
  },
}
```

### 9.4 Domain Matching Function (v1.1 addition)

```typescript
/**
 * Match origin domain against allowedDomains patterns.
 * ponytail: string ops only, no regex, no npm package.
 * Upgrade to regex if pattern complexity grows beyond *.prefix.
 */
function matchDomain(domain: string, patterns: string[]): boolean {
  if (!patterns || patterns.length === 0) return true; // no restriction = all domains
  
  const d = domain.toLowerCase().replace(/^www\./, '');
  
  return patterns.some(p => {
    const pattern = p.toLowerCase().replace(/^www\./, '');
    
    // IP address literal: exact match only
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(d) || /^\d{1,3}(\.\d{1,3}){3}$/.test(pattern)) {
      return d === pattern;
    }
    
    // Wildcard prefix: *.domain.com
    if (pattern.startsWith('*.')) {
      const base = pattern.slice(2);
      return d === base || d.endsWith('.' + base);
    }
    
    // Exact match
    return d === pattern;
  });
}
```

**Match examples:**

| Pattern | Domain | Match? |
|---------|--------|--------|
| `tokopedia.com` | `tokopedia.com` | ✅ |
| `tokopedia.com` | `www.tokopedia.com` | ✅ (www. stripped) |
| `tokopedia.com` | `api.tokopedia.com` | ❌ (exact, no wildcard) |
| `*.tokopedia.com` | `api.tokopedia.com` | ✅ |
| `*.tokopedia.com` | `tokopedia.com` | ✅ |
| `192.168.1.1` | `192.168.1.1` | ✅ |
| `*.192.168.1.1` | `10.192.168.1.1` | ❌ (IP literal blocks wildcard) |
| `localhost` | `localhost` | ✅ |

### 9.5 Input Validation (v1.1 addition)

```typescript
// Validate allowedDomains entries before save
function validateDomains(domains: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const MAX_DOMAINS = 10; // ponytail: PM locked at 10 per topic
  
  if (domains.length > MAX_DOMAINS) {
    errors.push(`Maximum ${MAX_DOMAINS} domains per topic`);
  }
  
  for (const d of domains) {
    const trimmed = d.trim().toLowerCase();
    if (!trimmed) continue;
    if (trimmed.includes('/') || trimmed.includes(':') || trimmed.includes('?') || trimmed.includes('#')) {
      errors.push(`Invalid hostname: "${d}" (contains URL path/port/query chars)`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

---

## 10. Testing Strategy

### 10.1 Unit Tests

| ID | Test | File | Assertion |
|----|------|------|-----------|
| UT-01 | `matchDomain` exact match | NEW or `account-channel.service.spec.ts` | `"toko-a.com"` matches `["toko-a.com"]` |
| UT-02 | `matchDomain` www. stripping | same | `"www.toko-a.com"` matches `["toko-a.com"]` |
| UT-03 | `matchDomain` wildcard | same | `"api.toko-a.com"` matches `["*.toko-a.com"]` |
| UT-04 | `matchDomain` wildcard bare domain | same | `"toko-a.com"` matches `["*.toko-a.com"]` |
| UT-05 | `matchDomain` no match | same | `"toko-b.com"` does NOT match `["toko-a.com"]` |
| UT-06 | `matchDomain` empty patterns | same | `"anything"` matches `[]` (fail-open) |
| UT-07 | `matchDomain` IP literal exact | same | `"192.168.1.1"` matches `["192.168.1.1"]` |
| UT-08 | `matchDomain` IP wildcard blocked | same | `"10.192.168.1.1"` does NOT match `["*.192.168.1.1"]` |
| UT-09 | `buildTopicMatchStage` with domain | `account-channel.service.spec.ts` | Aggregation includes `$elemMatch` filter when `originDomain` provided |
| UT-10 | `buildTopicMatchStage` without domain | same | Original match (no `$elemMatch`) when `originDomain` undefined |
| UT-11 | `validateDomains` max limit | spec | 11 domains → error |
| UT-12 | `validateDomains` invalid chars | spec | `"foo/bar.com"` → error |
| UT-13 | Zod schema validation | FE spec | `allowedDomains: ["toko-a.com"]` passes; `[]` passes; omitted passes |
| UT-14 | API Gateway param forwarding | `account-channel.open.controller.spec.ts` | `?domain=toko-a.com` → gRPC called with `originDomain: "toko-a.com"` |

### 10.2 Integration Tests

| ID | Test | Scenario | Expected |
|----|------|----------|----------|
| IT-01 | Topic visible when domain matches | Topic with `allowedDomains: ["toko-a.com"]`, request from `toko-a.com` | Topic appears |
| IT-02 | Topic hidden when domain doesn't match | Same topic, request from `toko-b.com` | Topic hidden |
| IT-03 | Topic visible on all domains when empty | Topic with `allowedDomains: []`, any domain | Topic appears |
| IT-04 | Topic visible when field missing (legacy) | Existing topic without field, any domain | Topic appears |
| IT-05 | Wildcard match | Topic with `allowedDomains: ["*.toko-a.com"]`, request from `api.toko-a.com` | Topic appears |
| IT-06 | Wildcard bare domain | Same topic, request from `toko-a.com` | Topic appears |
| IT-07 | Multiple topics mixed | Topic A: `["toko-a.com"]`, Topic B: `[]`, from `toko-b.com` | Only B appears |
| IT-08 | Multiple topics mixed (match) | Same, from `toko-a.com` | Both appear |
| IT-09 | www. stripping | Topic `["toko-a.com"]`, request from `www.toko-a.com` | Topic appears |
| IT-10 | Create with allowedDomains | POST with `widgetTopics: [{topicId, allowedDomains: ["x.com"]}]` | Saved correctly |
| IT-11 | Update allowedDomains | PATCH with new domains | Updated correctly |

### 10.3 E2E / Manual Test Cases

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| E2E-01 | Admin creates widget account with domain | Create → topic → domain "toko-a.com" → Save | Account created, topic has domain |
| E2E-02 | Admin creates without domain | Same, leave empty | Topic visible everywhere |
| E2E-03 | Widget on matching domain | Open widget on toko-a.com | Shows matching topics only |
| E2E-04 | Widget on non-matching domain | Open widget on toko-b.com | Shows only unrestricted topics |
| E2E-05 | Admin edits domain | Edit → change domain → Save | Updated filtering |
| E2E-06 | Widget with wildcard domain | Topic `*.toko-a.com`, widget on `shop.toko-a.com` | Topic visible |

### 10.4 Regression Scope

| Area | Risk | Test |
|------|------|------|
| Existing widget accounts without domain config | LOW — empty array default | Verify existing accounts show all topics |
| Widget account create/update CRUD | MEDIUM — new field in DTO | Verify CRUD with and without domain |
| Topic list in admin panel | LOW — CRUD endpoints unchanged | Verify topic management unaffected |
| Widget conversation flow | LOW — display-only filtering | Verify conversation start with filtered topic |
| Widget settings cache | LOW — separate endpoint | Verify `/widget/settings` cache unaffected |

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

Topic filtering happens **server-side** in MongoDB aggregation pipeline (`$elemMatch`). Widget embed script and Next.js app only pass the domain through — zero filtering logic in client bundles.

---

## 13. Change Log
| 2026-08-12 | v1.2: OQ-04 resolved (FE monorepo), OQ-08 resolved (fail-open), OQ-09 resolved (1 level wildcard). All OQs closed. Status → Ready for PRD. | Dany Christian |
| 2026-08-12 | v1.1.1: OQ-07 resolved — max 10 domains per topic (was 50 suggested). Updated validation + test. | Dany Christian |

| Date | Change | Author |
|------|--------|--------|
| 2026-08-03 | Initial brief created — brainstorm to confirmed scope | Dany Christian |
| 2026-08-03 | Added widget package impact analysis (Section 12), renumbered downstream sections | Dany Christian |
| 2026-08-12 | v1.1: Re-analysis from new brainstorm + BE codebase verification. Domain matching upgraded to exact + wildcard. Filter location clarified (aggregation pipeline). Cache strategy documented. Added matchDomain function, input validation, IP handling. Test cases expanded for wildcard/www./IP scenarios. New OQs added (OQ-07 to OQ-09). | Dany Christian |
