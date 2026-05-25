# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticket Search Relevance and Out-of-Filter Result Guidance  
 **Product Manager**: Yusril Ibnu Maulana  
 **Engineering Lead**: Naftal  
 **Design Lead: Sabrina**

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-28 WIB | Yusril Ibnu Maulana | Initial PRD for improving ticket search relevance, exact ticket ID ranking, and out-of-filter result guidance. |

## **2\. Overview**

This feature improves Ticket List search behavior by prioritizing the most relevant ticket results when a search keyword is active. It also adds clear guidance when matching tickets exist outside the current filter range.

| In Scope | Out of Scope |
| ----- | ----- |
| Search relevance ranking for Ticket List. | New global search page. |
| Exact Ticket ID prioritization. | Full AI semantic search. |
| Out-of-filter result guidance. | Search across deleted tickets. |
| Partial filter clearing from guidance CTA. | Search engine infrastructure rewrite. |
| UI copy and empty states for search and filters. | Saved search presets. |
| Search behavior for ticket type tabs and all ticket tab. | Ticket detail redesign. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Search results are still primarily sorted by date, even when the user searches a specific ticket ID. | Exact matches are hidden below less relevant recent tickets, causing users to think the ticket is missing. |
| PS-002 | Active date filters can hide older tickets during search. | Users must manually edit the date range before finding valid historical tickets. |
| PS-003 | Partial matches such as `TK-81499` can appear above the exact match `TK-8149`. | Ticket lookup feels inaccurate and reduces user trust. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve ticket lookup accuracy. | Exact Ticket ID match appears as the first result in 100% of tested cases. |
| Reduce search confusion caused by active filters. | 100% of searches with hidden out-of-filter matches show clear guidance. |
| Improve find speed. | Median time to locate a known ticket ID is under 5 seconds. |
| Preserve user control over filters. | Filters are not auto-cleared without explicit user action. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want exact Ticket ID matches to appear first so I can quickly open the correct ticket. | 1\. Given I search `TK-8149` using scope "ID Tiket", When results are shown, Then ticket `TK-8149` appears before `TK-81499`, `TK-81497`, and other partial matches. 2\. Given an exact match exists outside the active date filter, When I search the Ticket ID, Then the system shows out-of-filter guidance instead of a misleading empty state. 3\. Given there is no exact match, When partial matches exist, Then partial matches are shown after exact match priority is checked. |
| US-002 | P0 | As an Agent, I want search results sorted by relevance when I search so the most likely ticket appears first. | 1\. Given no search keyword is entered, When I open Ticket List, Then the default sort remains date based. 2\. Given a search keyword is entered, When results are shown, Then the default sort changes to relevance based. 3\. Given I manually choose another sort after searching, When the list refreshes, Then my selected sort is applied for that session. |
| US-003 | P0 | As an Agent, I want to know when matching tickets exist outside my current filters so I do not assume the ticket is missing. | 1\. Given active filters hide matching tickets, When I submit search, Then the system shows "Ada {count} tiket yang cocok di luar filter saat ini." 2\. Given matching tickets exist outside the date filter, When guidance appears, Then the CTA "Tampilkan {count} tiket" is visible. 3\. Given I click "Tampilkan {count} tiket", When the result reloads, Then the blocking date filter is cleared and the search keyword remains active. |
| US-004 | P0 | As an Agent, I want filters to stay active unless I choose to clear them so my workflow is not disrupted. | 1\. Given I search while filters are active, When results are shown, Then the system keeps all active filters by default. 2\. Given I click "Tampilkan {count} tiket", When only date range blocks the match, Then only the date range filter is cleared. 3\. Given I click "Hapus semua filter", When results reload, Then all active filters are cleared and the search keyword remains active. |
| US-005 | P1 | As an Agent, I want search result counts to clearly separate current-filter results and out-of-filter results. | 1\. Given current filters return results, When hidden out-of-filter matches also exist, Then the system shows both the visible result count and the outside-filter count. 2\. Given there are no results anywhere, When search completes, Then the system shows "Tidak ada tiket yang cocok dengan pencarian ini." |
| US-006 | P1 | As a Supervisor, I want search behavior to work consistently across all ticket tabs so team members do not need different habits per tab. | 1\. Given I search from "Semua", When scope selector is opened, Then the available scopes are "ID Tiket", "Judul", "Klien", and "Deskripsi". 2\. Given I search from a ticket type tab, When scope selector is opened, Then ticket type custom fields are also available. 3\. Given I search in any tab, When keyword is active, Then relevance ranking applies consistently. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Search trigger | 1\. FR-001: System MUST apply search behavior when the user enters at least 1 non-space character and submits search. 2\. FR-002: System MUST trim leading and trailing spaces before processing search. 3\. FR-003: System MUST preserve the search keyword after result reload, filter change, sort change, and pagination. |
| Default sorting | 1\. FR-004: System MUST use date based sorting when no search keyword is active. 2\. FR-005: System MUST use relevance based sorting when a search keyword is active. 3\. FR-006: System MUST allow users to manually change sorting after search results are shown. 4\. FR-007: System MUST persist manual sort only within the current browser session or until the search keyword is cleared. |
| Ticket ID ranking | 1\. FR-008: System MUST rank exact Ticket ID match first for scope "ID Tiket". 2\. FR-009: System MUST treat case differences as equal for Ticket ID matching. 3\. FR-010: System MUST treat hyphen and space formatting variants as normalized matches for Ticket ID matching. 4\. FR-011: System MUST rank prefix matches after exact and normalized exact matches. 5\. FR-012: System MUST rank partial contains matches after prefix matches. 6\. FR-013: System MUST NOT place newer partial matches above an older exact Ticket ID match when search scope is "ID Tiket". |
| Relevance ranking order | 1\. FR-014: System MUST use this ranking order for Ticket ID search: exact match, normalized exact match, prefix match, partial contains match, then other supported matches. 2\. FR-015: System MUST use date as a tie breaker only when two results have the same relevance rank. 3\. FR-016: System MUST show matched keyword highlight where the matched field is visible in the table. |
| Filter interaction | 1\. FR-017: System MUST keep all active filters when user submits search. 2\. FR-018: System MUST check whether additional matching tickets exist outside active filters. 3\. FR-019: System MUST show out-of-filter guidance when outside-filter matches exist. 4\. FR-020: System MUST NOT auto-clear any filter without explicit user action. |
| Out-of-filter guidance | 1\. FR-021: System MUST show the number of matching tickets outside current filters. 2\. FR-022: System MUST identify the blocking filter when only one filter prevents the match. 3\. FR-023: System MUST clear only the blocking filter when user clicks "Tampilkan {count} tiket". 4\. FR-024: System MUST clear all filters when user clicks "Hapus semua filter". 5\. FR-025: System MUST keep the search keyword active after either CTA is clicked. |
| Date range behavior | 1\. FR-026: System MUST treat date range as a blocking filter when matching tickets exist outside the selected range. 2\. FR-027: System MUST prioritize date range as the first filter to clear when it is the only blocking filter. 3\. FR-028: System MUST display date filter chip before and after user action so the change is visible. |
| Result states | 1\. FR-029: System MUST show regular results when matches exist inside active filters. 2\. FR-030: System MUST show out-of-filter guidance when zero matches exist inside active filters but matches exist outside filters. 3\. FR-031: System MUST show true empty state only when no matches exist inside or outside active filters. |
| Multi-term search | 1\. FR-032: System SHOULD support multiple terms separated by comma if already supported in Ticket List. 2\. FR-033: System MUST rank exact Ticket ID matches above partial matches for each term. 3\. FR-034: System MUST show combined results without duplicate ticket rows. |
| Permission and visibility | 1\. FR-035: System MUST only show tickets the user is allowed to access. 2\. FR-036: System MUST NOT reveal outside-filter result counts for tickets outside the user permission scope. 3\. FR-037: System MUST apply the same permission rules before and after filters are cleared. |
| Pagination | 1\. FR-038: System MUST keep relevance order stable across pages. 2\. FR-039: System MUST reset pagination to page 1 when search keyword or filter state changes. 3\. FR-040: System MUST retain selected page only when sorting changes without changing the result set. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Search request failed | Keep previous results if available and allow retry. | Show "Gagal memuat hasil pencarian. Coba lagi." |
| EH-002 | Out-of-filter count failed | Show in-filter results only and do not block search. | No banner shown. Log the failure. |
| EH-003 | Clear blocking filter failed | Keep current filters and show retry action. | Show "Gagal menampilkan hasil di luar filter. Coba lagi." |
| EH-004 | Invalid search input | Trim spaces. If empty after trim, reset to normal list. | No error. |
| EH-005 | Permission denied after filter clear | Do not show restricted tickets. Keep accessible results only. | Show "Beberapa tiket tidak dapat ditampilkan karena akses terbatas." only when needed. |
| EH-006 | Query timeout | Stop loading state and keep filter state unchanged. | Show "Pencarian terlalu lama. Coba persempit kata kunci." |
| EH-007 | Manual sort conflict | Apply user-selected sort and keep search keyword active. | Show active sort chip. |
| EH-008 | Result count mismatch | Prioritize visible results. Refresh count on next reload. | Do not block user. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User searches `TK-8149` and exact match is 1 year old. | Exact match appears first if date filter allows it. If date filter blocks it, show out-of-filter guidance. | Show "Ada 1 tiket yang cocok di luar filter saat ini." |
| EC-002 | User searches `TK-8149` and only `TK-81499` exists. | Show partial result. Do not claim exact match exists. | Highlight `TK-8149` part in visible Ticket ID. |
| EC-003 | User searches lowercase `tk-8149`. | Match `TK-8149` as exact match. | Show standard result. |
| EC-004 | User searches `TK 8149` without hyphen. | Match `TK-8149` as normalized exact match. | Show standard result. |
| EC-005 | Active filters include date, status, team inbox, and agent. | Show out-of-filter guidance only if accessible matches exist outside one or more filters. | CTA "Tampilkan {count} tiket" opens or applies filter adjustment based on blocking filters. |
| EC-006 | More than one filter blocks the result. | Show guidance and offer "Hapus semua filter". If safe to identify filters, also show blocking filter names. | Show "Tiket cocok ditemukan di luar beberapa filter saat ini." |
| EC-007 | User clicks "Tampilkan {count} tiket" when multiple filters block the result. | Open a confirmation popover with filter options if available. Default action clears date range first if date is one blocker. | Show "Pilih filter yang ingin dihapus." |
| EC-008 | Search returns many partial matches. | Keep exact and stronger matches on top. Use pagination. | Result order remains stable. |
| EC-009 | Ticket ID contains legacy or imported format. | Apply exact string matching first, then normalized matching if supported. | No special UI. |
| EC-010 | User clears search keyword. | Return to normal list sorting and active filters remain. | Search input becomes empty. |
| EC-011 | User manually changes sort to date while search is active. | Apply date sort, but exact Ticket ID match SHOULD remain pinned above weaker matches for scope "ID Tiket". | Show sort chip "Urutkan: Tanggal". |
| EC-012 | Ticket is archived but still searchable by permission. | Include archived ticket only if current tab and permission allow it. | Follow existing archived or closed state behavior. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Search input | Existing search input with scope selector. UI labels include "ID Tiket", "Judul", "Klien", "Deskripsi". | User selects scope, enters keyword, and submits search. Results use relevance sorting by default. | US-001, US-002, US-006 |
| Search scope selector | Scope options depend on active tab. Ticket type tabs can include custom fields. | User opens selector and chooses the field to search. Search result updates after submit. | US-006 |
| Sort indicator | Shows active sort mode when search is active. UI label: "Urutkan: Relevansi". | User searches a keyword. System shows relevance sort. User may change sort manually. | US-002 |
| Filter chips | Active filters remain visible. Date range chip shows selected range. | User searches while filters are active. Chips remain visible unless user clears filters. | US-003, US-004 |
| Out-of-filter guidance banner | Banner appears above results or empty state when matches exist outside filters. | User searches. System detects hidden accessible matches. Banner shows count and CTAs. | US-003, US-004, US-005 |
| Guidance CTA primary | Button label: "Tampilkan {count} tiket". | User clicks CTA. System clears blocking filter and reloads results. | US-003, US-004 |
| Guidance CTA secondary | Button label: "Hapus semua filter". | User clicks CTA. System clears all filters and keeps search keyword. | US-004 |
| Empty state | True empty state when no matches exist anywhere accessible. UI copy: "Tidak ada tiket yang cocok dengan pencarian ini." | User searches. System finds no in-filter or out-of-filter matches. | US-005 |
| In-filter no result state | State when active filters hide results. UI copy: "Tidak ada tiket yang cocok dalam filter saat ini." | User searches with filters. System shows out-of-filter guidance if applicable. | US-003, US-005 |
| Keyword highlight | Highlight matched keyword in visible columns. | User searches. Matching visible field text is highlighted. | US-001, US-002 |
| Loading state | Skeleton or spinner during search. UI copy: "Mencari tiket..." | User submits search or clears filter. Loading appears until result returns. | US-001, US-003 |
| Error state | Search error with retry. UI copy: "Gagal memuat hasil pencarian. Coba lagi." | User clicks retry. System repeats last search request with same filters. | US-003 |

## **10\. Field & Validation**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| searchKeyword | Text | 1\. Minimum 1 non-space character to activate search. 2\. Trim leading and trailing spaces. 3\. Maximum 100 characters. 4\. Case-insensitive matching. | Optional |
| searchScope | Enum | 1\. Allowed base values: ticket\_id, title, client, description. 2\. Ticket type tab may add custom field scope. 3\. Default value: ticket\_id when user starts typing an ID-like pattern. | Required when search is active |
| sortMode | Enum | 1\. Allowed values: relevance, created\_date\_desc, created\_date\_asc, updated\_date\_desc, updated\_date\_asc. 2\. Default with search: relevance. 3\. Default without search: updated\_date\_desc or existing default date sort. | Required |
| ticketId | String | 1\. Example: TK-8149. 2\. Exact match must outrank partial match. 3\. Case-insensitive. 4\. Hyphen and space variants should be normalized for matching. | Required for ticket rows |
| dateRangeFilter | Date range | 1\. Optional active filter. 2\. Can block older matching tickets. 3\. Can be cleared by out-of-filter guidance CTA. | Optional |
| activeFilters | Object | 1\. May include date range, status, team inbox, agent, channel, priority, tag, SLA, and custom fields. 2\. Must remain active during search unless user clears them. | Optional |
| outsideFilterMatchCount | Integer | 1\. Count only accessible tickets. 2\. Must be 0 or greater. 3\. Must not include tickets outside permission scope. | Derived |
| blockingFilters | Array | 1\. Contains filter keys that hide matching tickets. 2\. Date range should be identified when it is the only blocking filter. 3\. Multiple blocking filters may be shown as summary only. | Derived |
| resultCount | Integer | 1\. Count visible results after filters are applied. 2\. Must update after search, filter change, and clear action. | Derived |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Search result response p95 must be under 2 seconds for 50,000 tickets per tenant. |
| Performance | Out-of-filter count response p95 must be under 2.5 seconds. |
| Scalability | Search, sorting, and filtering must remain stable with server-side pagination. |
| Reliability | Exact Ticket ID ranking must pass 100% QA cases. |
| Security | Result count and result rows must respect role and team inbox access. |
| Privacy | Search logs must not store full message content by default. |
| Accessibility | Search input, scope selector, filter CTAs, and result table must be keyboard navigable. |
| Accessibility | Banner and error states must support screen readers. |
| Observability | Track search keyword type, scope, sort mode, filter state, result count, outside-filter count, and CTA clicks. |

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ticket List API search and sort support | Engineering | Required for relevance ranking and stable pagination. | Add regression tests for exact, prefix, and partial match order. |
| Permission model | Engineering | Incorrect counts may leak existence of restricted tickets. | Apply access scope before counting outside-filter matches. |
| Existing filter behavior | Product and Engineering | Auto-clearing filters may disrupt user workflows. | Require explicit user action for any filter clearing. |
| Date range defaults | Product | Old tickets may remain hidden if default date range is too short. | Add out-of-filter guidance before considering default date changes. |
| Custom field search | Engineering | Ticket type tabs may have inconsistent behavior. | Use same relevance and permission rules across all scopes. |
| Large dataset performance | Engineering | Out-of-filter count may be expensive. | Allow count approximation only if clearly labeled, otherwise hide guidance if count fails. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Exact Ticket ID first result accuracy | 100% | Ongoing | QA regression suite |
| Median time to locate known Ticket ID | Under 5 seconds | 30 days after release | Product analytics |
| Searches with out-of-filter guidance CTA click | Baseline then monitor | 30 days after release | Product analytics |
| Search empty state false negative reports | Reduce by 80% | 30 days after release | Support tickets |
| Search result p95 response time | Under 2 seconds | Ongoing | Application monitoring |
| Out-of-filter count p95 response time | Under 2.5 seconds | Ongoing | Application monitoring |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Saved search presets | Helps users reuse frequent operational filters. |
| Advanced fuzzy search | Helps with typo-heavy searches. |
| Search across linked conversations | Helps users find tickets using related conversation content. |
| Smart suggestions | Suggests likely tickets when query is incomplete. |
| Search analytics dashboard | Helps product team detect failed search patterns. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| This PRD does not redesign the full Ticket List table. | Only search, sort, and filter guidance behavior changes. |
| This PRD does not guarantee semantic matching. | Results depend on supported field matching rules. |
| Out-of-filter count may be unavailable during system degradation. | Search still works, but guidance may be hidden. |
| Exact match priority is strongest for scope "ID Tiket". | Other scopes use general relevance ranking. |
| User permission still limits visible results. | Some tickets may not appear even if they match the query. |

## **16\. Appendix**

| Item | Definition |
| ----- | ----- |
| Exact match | Search keyword matches the Ticket ID exactly after trim and case normalization. |
| Normalized exact match | Search keyword matches after allowed formatting normalization such as hyphen or space difference. |
| Prefix match | Ticket ID begins with the search keyword, such as `TK-81490` for query `TK-8149`. |
| Partial contains match | Ticket ID contains the search keyword but does not start with it. |
| Relevance sort | Search result order based on match quality first and date second. |
| Blocking filter | Active filter that prevents an otherwise matching ticket from appearing. |
| Out-of-filter result | Matching accessible ticket that is hidden because of active filters. |

| UI Copy | Usage |
| ----- | ----- |
| "Urutkan: Relevansi" | Sort indicator when search keyword is active. |
| "Tidak ada tiket yang cocok dalam filter saat ini." | In-filter empty state. |
| "Ada {count} tiket yang cocok di luar filter saat ini." | Out-of-filter guidance. |
| "Tampilkan {count} tiket" | CTA to show hidden matches. |
| "Hapus semua filter" | CTA to clear all active filters. |
| "Tidak ada tiket yang cocok dengan pencarian ini." | True empty state. |
| "Mencari tiket..." | Loading state. |
| "Gagal memuat hasil pencarian. Coba lagi." | Search error state. |
| "Beberapa tiket tidak dapat ditampilkan karena akses terbatas." | Permission-limited result notice. |

