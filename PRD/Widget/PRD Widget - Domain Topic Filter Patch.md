# **PRD PATCH: Widget Domain-Based Topic Filter**

> **Type:** Patch / Addendum
> **Base PRD:** `PRD/Widget/PRD Widget.md` (v1.1)
> **Author:** Dany Christian
> **Date:** 2026-08-03
> **Change Intake Brief:** `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md`

---

## **Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.2 | 2026-08-03 | Dany Christian | Patch: Add domain-based topic filter for widget accounts. Topics can now be restricted to specific website origins. |

---

## **1. Patch Summary**

| Item | Description |
|------|-------------|
| Purpose | Allow admin to restrict widget topics to specific website domains, so visitors on different websites see only relevant topics. |
| Scope | Add optional `allowedDomains` field to widget account topic config. Add `domain` param to widget topic fetch API. Add domain input to widget account create/edit form. |
| Non-Scope | Wildcard/pattern domain matching. Domain validation. Per-page widget rules. Analytics on domain usage. |

---

## **2. Problem Statement**

| ID | Problem | Impact |
|----|---------|--------|
| PS-PATCH-001 | Multi-brand / multi-site companies cannot restrict which topics appear on which website. All topics are shown on all sites. | Visitors see irrelevant topics, reducing chat entry quality and agent triage efficiency. |

---

## **3. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|---------------------|
| US-PATCH-001 | P0 | As an Admin, I want to set allowed domains per topic in a widget account so visitors on specific websites see only relevant topics. | 1. Given I am creating a widget account, When I select a topic and enter domain "toko-a.com", Then the topic is only visible when the widget loads on toko-a.com. 2. Given I leave the domain field empty, When the widget loads on any website, Then the topic is visible everywhere (backward compatible). 3. Given I enter multiple domains "toko-a.com, toko-b.com", When the widget loads on toko-a.com, Then the topic appears. |
| US-PATCH-002 | P0 | As a Visitor, I want to see only topics relevant to the website I'm on so I don't get confused by unrelated topics. | 1. Given I open the widget on toko-a.com, When the topic list loads, Then I see only topics where toko-a.com is in the allowed domains OR topics with no domain restriction. 2. Given no topics match my domain and no unrestricted topics exist, When the topic list loads, Then I see no topic selector (form skips topic selection). |

---

## **4. Functional Requirements**

| Category | Requirements |
|----------|-------------|
| Data Model | FR-PATCH-001 [P0]: System MUST add optional `allowedDomains: string[]` field to WidgetTopicInfo in AccountChannel schema. Default value MUST be empty array `[]`. FR-PATCH-002 [P0]: System MUST NOT require `allowedDomains` — existing topics without this field MUST be treated as visible on all domains. |
| API | FR-PATCH-003 [P0]: `GET /account-channel/topics` (open API) MUST accept optional `domain` query parameter. FR-PATCH-004 [P0]: When `domain` param is provided, system MUST filter topics to return only those where `allowedDomains` is empty, missing, or contains the exact domain string. FR-PATCH-005 [P0]: When `domain` param is omitted, system MUST return all topics (current behavior). FR-PATCH-006 [P0]: Domain matching MUST be exact string match (case-sensitive, no wildcards). |
| Admin UI | FR-PATCH-007 [P0]: Widget account create/edit form MUST include a "Allowed Domains" input field per topic. FR-PATCH-008 [P1]: Domain input MUST accept comma-separated domain values (e.g., "toko-a.com, toko-b.com"). FR-PATCH-009 [P1]: Domain input MUST be optional. Empty = all domains. |
| Widget Client | FR-PATCH-010 [P0]: Widget embed script MUST pass `window.location.origin` as `origin` query parameter to the widget iframe URL. FR-PATCH-011 [P0]: Widget Next.js app MUST read `origin` from URL and pass as `domain` param to topic fetch API call. |
| Backward Compat | FR-PATCH-012 [P0]: All existing widget accounts and topics MUST work without any migration. No breaking change. |

---

## **5. Edge Cases**

| ID | Scenario | Expected Behavior |
|----|----------|-------------------|
| EC-PATCH-001 | Widget loads on localhost (development) | Topic filtering applies based on exact "http://localhost:3000" match if configured. |
| EC-PATCH-002 | Widget loads on IP address instead of domain | Topic filtering applies based on exact "http://192.168.1.1" match if configured. |
| EC-PATCH-003 | Admin sets domain with protocol "https://toko-a.com" vs without "toko-a.com" | `window.location.origin` includes protocol. Admin should enter full origin including protocol. UI hint required. |
| EC-PATCH-004 | All topics have domain restrictions, none match current domain | Widget shows no topic selector. Visitor can still start chat without topic (if conversation form allows). |
| EC-PATCH-005 | Topic A: `["toko-a.com"]`, Topic B: `[]` (all domains) | Both Topic A and Topic B appear on toko-a.com. Only Topic B appears on other domains. |
| EC-PATCH-006 | Admin edits topic domains while widget is already loaded | Changes apply on next widget page load (consistent with existing config caching behavior). |

---

## **6. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
|-------|------|---------|------------|----------|---------|
| allowed_domains | string[] | `["https://toko-a.com", "https://toko-b.com"]` | Each entry must be a valid URL origin (protocol + hostname). Max 10 entries per topic. | No | `[]` |
| domain (query param) | string | `https://toko-a.com` | URL-encoded string. | No | undefined (returns all topics) |

---

## **7. API / Event Contract**

| Contract | Method | Producer | Consumer | Request / Payload | Response / Ack | Compatibility Notes |
|----------|--------|----------|----------|-------------------|----------------|---------------------|
| GET /account-channel/topics | HTTP GET (open API) | API Gateway | Widget client (iframe) | `?domain=https://toko-a.com` (new optional param) | `{ topics: [...], subtopics: [...] }` — filtered by domain | Backward compatible. No param = all topics. |

---

## **8. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
|-----------|-------------|---------|------------------------|
| Widget Account Modal — Domain Input | New "Allowed Domains" input below each topic select in create/edit widget account modal. | 1. User selects topic. 2. User optionally enters comma-separated domains. 3. User saves. | US-PATCH-001 |
| Domain Input Hint | Helper text: "Kosongkan untuk menampilkan di semua website. Masukkan origin lengkap (contoh: https://toko-a.com)" | — | US-PATCH-001 |
| Widget Topic Section — Empty State | When no topics match current domain, hide topic selector entirely. | — | US-PATCH-002 |

---

## **9. Non-Functional Requirements**

| Attribute | Target |
|-----------|--------|
| Performance | Topic filter MUST NOT add measurable latency. Aggregation pipeline change is a simple `$elemMatch` filter. |
| Security | Domain param MUST NOT be used for tenant bypass. Tenant scope remains enforced via `companyId` from API key auth. |
| Widget Package Size | Embed script change: +40 bytes (1 line). Total: ~19.6KB. Budget: 60KB. |

---

## **10. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
|------|------|------|------------|
| Internal | Widget embed script changes | Low risk — 1 line addition | Standard build + manual E2E verify |
| Internal | Aggregation pipeline change | Medium risk — wrong filter logic could hide all topics | Integration tests for all filter scenarios |
| Product | Admin UX — domain format confusion | Users may enter wrong format (e.g., "toko-a.com" without protocol) | UI hint with example. Accept both with and without protocol by normalizing. |

---

## **11. Limitations**

| Limitation | Impact | Workaround |
|------------|--------|------------|
| Exact match only (no wildcards) | Admin must enter each subdomain separately | Future: pattern matching support |
| No domain validation | Admin can enter non-existent domains | UI hint, no backend enforcement |
| Domain filter only on topic list fetch | Topics embedded in conversation config at account channel level | Already scoped correctly — topic is resolved at conversation start |

---

## **12. Appendix**

| Item | Notes |
|------|-------|
| References | Base PRD: `PRD/Widget/PRD Widget.md` v1.1, Brief: `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md` |
| Related Future Consideration | PRD v1.1 Section 14 mentions "Per page widget rules: Show different widget account by URL path." This patch is a scoped subset — per-domain topic filtering. Path-level rules remain future. |
| Open Questions | None (all resolved in Change Intake Brief) |
