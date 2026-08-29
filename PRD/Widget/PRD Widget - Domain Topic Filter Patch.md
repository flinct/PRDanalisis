# **PRD PATCH: Widget Domain-Based Topic Filter**

> **Type:** Patch / Addendum
> **Base PRD:** `PRD/Widget/PRD Widget.md` (v1.1)
> **Author:** Dany Christian
> **Date:** 2026-08-03
> **Updated:** 2026-08-12
> **Change Intake Brief:** `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md` (v1.2)

---

## **Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.3 | 2026-08-12 | Dany Christian | Align with brief v1.2: add `*.domain.com` wildcard support, hostname-only format (no protocol), www. auto-strip, IP literal exact-only, fail-open behavior, max 10 domains per topic, `matchDomain()` function spec, updated edge cases and test scenarios. |
| v1.2 | 2026-08-03 | Dany Christian | Patch: Add domain-based topic filter for widget accounts. Topics can now be restricted to specific website origins. |

---

## **1. Patch Summary**

| Item | Description |
|------|-------------|
| Purpose | Allow admin to restrict widget topics to specific website domains, so visitors on different websites see only relevant topics. |
| Scope | Add optional `allowedDomains` field to widget account topic config. Add `domain` param to widget topic fetch API. Add domain input to widget account create/edit form. Domain matching: exact hostname + `*.domain.com` prefix wildcard. |
| Non-Scope | Regex domain matching. Domain DNS validation. Per-page/per-path widget rules. Analytics on domain usage. Multi-level wildcard (`*.*.domain.com`). |

---

## **2. Problem Statement**

| ID | Problem | Impact |
|----|---------|--------|
| PS-PATCH-001 | Multi-brand / multi-site companies cannot restrict which topics appear on which website. All topics are shown on all sites. | Visitors see irrelevant topics, reducing chat entry quality and agent triage efficiency. |

---

## **3. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| US-PATCH-001 | P0 | As an Admin, I want to set allowed domains per topic in a widget account so visitors on specific websites see only relevant topics. | 1. Given I am creating a widget account, When I select a topic and enter domain "toko-a.com", Then the topic is only visible when the widget loads on toko-a.com or www.toko-a.com. 2. Given I leave the domain field empty, When the widget loads on any website, Then the topic is visible everywhere (backward compatible). 3. Given I enter "toko-a.com, toko-b.com", When the widget loads on toko-a.com, Then the topic appears. 4. Given I enter `*.toko-a.com`, When the widget loads on shop.toko-a.com, Then the topic appears. |
| US-PATCH-002 | P0 | As a Visitor, I want to see only topics relevant to the website I'm on so I don't get confused by unrelated topics. | 1. Given I open the widget on toko-a.com, When the topic list loads, Then I see only topics where toko-a.com matches allowed domains OR topics with no domain restriction. 2. Given no topics match my domain and no unrestricted topics exist, When the topic list loads, Then I see no topic selector (form skips topic selection). |

---

## **4. Functional Requirements**

| Category | Requirements |
|----------|-------------|
| Data Model | FR-PATCH-001 [P0]: System MUST add optional `allowedDomains: string[]` field to WidgetTopicInfo in AccountChannel schema. Default value MUST be empty array `[]`. FR-PATCH-002 [P0]: System MUST NOT require `allowedDomains` — existing topics without this field MUST be treated as visible on all domains. |
| API | FR-PATCH-003 [P0]: `GET /account-channel/topics` (open API) MUST accept optional `domain` query parameter (hostname only, no protocol). FR-PATCH-004 [P0]: When `domain` param is provided, system MUST filter topics using `matchDomain()` function: exact hostname match + `*.domain.com` prefix wildcard + auto-strip `www.` prefix. FR-PATCH-005 [P0]: When `domain` param is omitted or empty, system MUST return all topics (fail-open). FR-PATCH-006 [P0]: Domain matching MUST be case-insensitive, hostname-only (no protocol/port/path). IP address literals MUST use exact match only (wildcard not applied). |
| Domain Matching | FR-PATCH-013 [P0]: `matchDomain(domain, patterns)` function MUST implement: (1) auto-strip `www.` prefix from both input and patterns, (2) `*.domain.com` matches bare `domain.com` and any `*.domain.com` subdomain, (3) IP address literal blocks wildcard pattern, (4) empty/missing patterns = match all (fail-open). FR-PATCH-014 [P0]: `allowedDomains` entries MUST be validated on save: max 10 entries per topic, no URL path/port/query chars (`/`, `:`, `?`, `#`), trimmed and lowercased. |
| Admin UI | FR-PATCH-007 [P0]: Widget account create/edit form MUST include a "Domain yang Diizinkan" input field per topic. FR-PATCH-008 [P1]: Domain input MUST accept comma-separated hostname values (e.g., "toko-a.com, *.toko-b.com"). FR-PATCH-009 [P1]: Domain input MUST be optional. Empty = all domains. Hint: "Kosongkan untuk menampilkan di semua website." |
| Widget Client | FR-PATCH-010 [P0]: Widget embed script (`apps/widget/helpers/scripts/chat-widget-setup.ts`) MUST pass `window.location.origin` as `origin` query parameter to the widget iframe URL. FR-PATCH-011 [P0]: Widget Next.js app MUST read `origin` from URL and extract hostname, then pass as `domain` param to topic fetch API call. |
| Backward Compat | FR-PATCH-012 [P0]: All existing widget accounts and topics MUST work without any migration. No breaking change. `allowedDomains: []` or missing field = visible on all domains. |

---

## **5. Domain Matching Specification**

### 5.1 `matchDomain()` Function

```typescript
/**
 * Match origin domain against allowedDomains patterns.
 * ponytail: string ops only, no regex for matching logic.
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

### 5.2 Match Examples

| Pattern | Domain | Match? | Reason |
|---------|--------|--------|--------|
| `toko-a.com` | `toko-a.com` | ✅ | Exact match |
| `toko-a.com` | `www.toko-a.com` | ✅ | www. auto-stripped |
| `toko-a.com` | `api.toko-a.com` | ❌ | Exact, no wildcard prefix |
| `*.toko-a.com` | `api.toko-a.com` | ✅ | Wildcard subdomain match |
| `*.toko-a.com` | `toko-a.com` | ✅ | Wildcard includes bare domain |
| `*.toko-a.com` | `shop.id.toko-a.com` | ✅ | Ends-with match (1 level covers nested) |
| `192.168.1.1` | `192.168.1.1` | ✅ | IP exact match |
| `*.192.168.1.1` | `10.192.168.1.1` | ❌ | IP literal blocks wildcard |
| `localhost` | `localhost` | ✅ | Exact match |

### 5.3 Input Validation Rules

| Rule | Check | Error Message |
|------|-------|---------------|
| Max entries | `domains.length > 10` | "Maksimal 10 domain per topik" |
| No URL chars | contains `/`, `:`, `?`, `#` | "Domain tidak valid: hostname saja, tanpa protokol/port/path" |
| Trim + lowercase | auto on save | — |
| Empty string entries | skip/strip | — |

---

## **6. Edge Cases**

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-PATCH-001 | Widget loads on localhost (development) | Topic visible if "localhost" is in `allowedDomains`. Developer must add it explicitly. |
| EC-PATCH-002 | Widget loads on IP address | Exact match only. "192.168.1.1" matches ["192.168.1.1"]. Wildcard pattern on IP blocked. |
| EC-PATCH-003 | Admin enters domain with protocol "https://toko-a.com" | Validation rejects — `:` triggers URL char error. Hint guides to hostname-only format. |
| EC-PATCH-004 | All topics have domain restrictions, none match current domain | Widget shows no topic selector. Visitor can still start chat without topic (if conversation form allows). |
| EC-PATCH-005 | Topic A: `["toko-a.com"]`, Topic B: `[]` (all domains) | Both Topic A and Topic B appear on toko-a.com. Only Topic B appears on other domains. |
| EC-PATCH-006 | Admin edits topic domains while widget is already loaded | Changes apply on next widget page load (existing config caching behavior). |
| EC-PATCH-007 | `www.toko-a.com` in allowedDomains, visitor on `toko-a.com` | Match — www. auto-stripped on both sides. |
| EC-PATCH-008 | `*.toko-a.com` in allowedDomains, visitor on `toko-a.com` | Match — wildcard includes bare domain. |
| EC-PATCH-009 | No Origin/referer header (non-browser client, curl) | Fail-open — all topics returned. Domain filter ignored. This is display feature, not security. |
| EC-PATCH-010 | Admin enters 11 domains | Validation error: "Maksimal 10 domain per topik" |

---

## **7. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
|-------|------|---------|------------|----------|---------|
| allowedDomains | string[] | `["toko-a.com", "*.toko-b.com"]` | Hostname only. Max 10. No `/`, `:`, `?`, `#`. Trimmed, lowercased on save. | No | `[]` |
| domain (query param) | string | `toko-a.com` | Hostname extracted from `window.location.origin`. URL-decoded. | No | undefined (fail-open: returns all topics) |

---

## **8. API / Event Contract**

| Contract | Method | Producer | Consumer | Request / Payload | Response / Ack | Compatibility Notes |
|----------|--------|----------|----------|-------------------|----------------|---------------------|
| GET /account-channel/topics | HTTP GET (open API) | API Gateway (`account-channel.open.controller.ts`) | Widget client (iframe) | `?domain=toko-a.com` (new optional param, hostname only) | `{ topics: [...], subtopics: [...] }` — filtered by domain via MongoDB `$elemMatch` | Backward compatible. No param = all topics. |
| gRPC: GetAccountChannelTopics | gRPC | API Gateway | Channel Service | `origin_domain: string` (new optional field in proto) | Filtered topic list | Proto3 backward compatible (empty = absent). |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
|-----------|-------------|---------|------------------------|
| Widget Account Modal — Domain Input | New "Domain yang Diizinkan" chip/tag input below each topic select in create/edit widget account modal. | 1. User selects topic. 2. User optionally enters comma-separated hostnames. 3. User saves. | US-PATCH-001 |
| Domain Input Hint | Helper text: "Kosongkan untuk menampilkan di semua website. Gunakan *.domain.com untuk semua subdomain. Contoh: toko-a.com, *.toko-b.com" | — | US-PATCH-001 |
| Domain Input Validation Error | Inline error when >10 domains or invalid characters | — | US-PATCH-001 |
| Widget Topic Section — Empty State | When no topics match current domain, hide topic selector entirely. | — | US-PATCH-002 |

---

## **10. Non-Functional Requirements**

| Attribute | Target |
|-----------|--------|
| Performance | Topic filter MUST NOT add measurable latency. MongoDB `$elemMatch` on ~10-50 topics = <1ms. |
| Security | Domain param is display/tenant isolation, NOT a security boundary. Tenant scope remains enforced via `companyId` from API key auth. |
| Widget Package Size | Embed script change: +40 bytes (1 line). Total: ~19.6KB. Budget: 60KB. |
| Cache | `/widget/settings` cache (1 day TTL, per company) NOT affected. Topic list is separate aggregation endpoint. |

---

## **11. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
|------|------|------|------------|
| Internal | Widget embed script change (FE monorepo: `apps/widget/helpers/scripts/chat-widget-setup.ts`) | Low risk — 1 line addition | Standard build + manual E2E verify |
| Internal | Aggregation pipeline change | Medium risk — wrong filter logic could hide all topics | Integration tests for all filter scenarios (11 test cases) |
| Internal | gRPC proto change | Low risk — additive field only | Proto3 backward compatible |
| Product | Admin UX — domain format confusion | Users may enter wrong format | UI hint with examples. Validation rejects URL-format input with clear error. |
| Product | Fail-open bypass concern | Non-browser clients can see all topics by not sending domain | Accepted — this is display feature, not security boundary. Document in limitations. |

---

## **12. Limitations**

| Limitation | Impact | Workaround |
|------------|--------|------------|
| 1-level wildcard only (`*.domain.com`) | `*.shop.domain.com` not supported as single pattern | List specific subdomains as separate entries (max 10 per topic) |
| No domain DNS validation | Admin can enter non-existent domains | UI hint, no backend enforcement |
| Fail-open when no domain | Domain restriction bypassable by non-browser clients | Accepted — display feature, not security boundary |
| Max 10 domains per topic | Large multi-brand companies may hit limit | Use wildcard patterns to reduce entries |
| Domain filter only on topic list fetch | Topics embedded in conversation config at account channel level | Already scoped correctly — topic is resolved at conversation start |

---

## **13. Appendix**

| Item | Notes |
|------|-------|
| References | Base PRD: `PRD/Widget/PRD Widget.md` v1.1, Brief: `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md` (v1.2) |
| Related Future Consideration | PRD v1.1 Section 14 mentions "Per page widget rules: Show different widget account by URL path." This patch is a scoped subset — per-domain topic filtering. Path-level rules remain future. |
| Open Questions | None (all resolved in Change Intake Brief v1.2) |
| Embed Script Location | FE monorepo: `apps/widget/helpers/scripts/chat-widget-setup.ts` → compiled to `apps/widget/public/scripts/widget.min.js` |
