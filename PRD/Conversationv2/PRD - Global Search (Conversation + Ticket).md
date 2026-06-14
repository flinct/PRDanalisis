# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Global Search — Unified Conversation & Ticket Search  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: TBD  
**Contributors**: Engineering Team, QA Team, Design Team  
**Version**: v1.0  
**TRD**: —

---

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-06-14 | QA Analysis → PRD | Initial PRD based on Global Search requirement analysis. Cross-reference: Conversation V2, Ticket V2, Custom Attributes PRD. |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide a single, unified search page where agents and supervisors can search across Conversations and Tickets with one keyword, eliminating the need to navigate to separate pages and guess which domain holds the data. |
| **Scope** | One dedicated search page (`/search`). User inputs keyword, system queries conversation-service and ticket-service in parallel, and displays results grouped by domain (Conversation section first, Ticket section second). Search covers identity, metadata, message content, and custom attributes/fields. |
| **Key Capabilities** | Unified search bar, parallel backend queries across two domains, two-section results with unified pagination, keyword highlighting, relevance ranking, RBAC-scoped results per domain, click-through to Conversation Room or Ticket Detail. |
| **Outcome** | Agents locate any conversation or ticket from a single entry point. Median time to find target entity improves significantly. Eliminates "search in wrong page → navigate → search again" workflow. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Search across Conversation and Ticket domains. | Cross-workspace or global org-wide search. |
| Search by: customer name, phone, alias, message content, Conversation ID, tags, custom attributes (single + collections). | AI semantic / fuzzy search (future). |
| Search by: Ticket ID, title, client name, description, tags, custom fields (text, dropdown, date). | Search across deleted/archived tickets. |
| Relevance ranking per domain (exact → prefix → partial). | Search across Broadcast, Contact, or other domains. |
| Unified pagination — one scroll, section divider between Conversation and Ticket. | Saved search presets. |
| Keyword highlight on matched fields in result cards. | Search engine infrastructure rewrite. |
| RBAC-scoped results. | Full message history search without limits. |
| Click result → navigate to Conversation Room or Ticket Detail. | Export search results. |
| Empty state, error state, loading state. | Search analytics dashboard (future). |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Agents must guess whether the data they need is in Conversation or Ticket before searching, then navigate to the correct page. | Wasted time, increased clicks, slower response to customers. |
| PS-002 | No way to search across both domains simultaneously. | Agents may miss relevant results because they searched in the wrong domain. |
| PS-003 | Custom attributes and custom fields are searchable only within their respective list pages, not from a unified entry point. | Operational identifiers (AWB, order IDs) require knowing the domain first. |
| PS-004 | Even when the agent navigates to the correct page, existing search scopes are limited to that page's fields. | Full conversation message content is not searchable from the Chat List search. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Provide unified search across Conversation and Ticket. | 100% of searches query both domains and return grouped results. |
| Reduce time to locate any entity. | Median "find target" time from global search under 5 seconds. |
| Eliminate wrong-domain searches. | 0% of global searches require user to navigate to a different page and re-search. |
| Search result relevance. | Exact Ticket ID match appears as first result in 100% of cases within the Ticket domain section. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to search across Conversations and Tickets from one search bar so I don't have to guess which page holds the data. | 1. Given I am on the Global Search page, When I type a keyword (≥2 characters) and submit, Then results from both Conversation and Ticket appear in separate sections. 2. Given no matches exist in one domain, When search completes, Then that section shows "Tidak ada hasil" without blocking the other section. 3. Given no matches exist in either domain, When search completes, Then a unified empty state "Tidak ada hasil untuk pencarian ini" is shown. |
| US-002 | P0 | As an Agent, I want the search to cover message content so I can find conversations by what was discussed. | 1. Given a conversation contains a message with the word "refund", When I search "refund", Then that conversation appears in the Conversation section. 2. Given a ticket contains a reply with the word "invoice", When I search "invoice", Then that ticket appears in the Ticket section. 3. Given the match is in an older message beyond the search window, When I search, Then the conversation may not appear if outside the configured message scope. |
| US-003 | P0 | As an Agent, I want the search to cover custom attributes and custom fields so I can find entities by operational identifiers. | 1. Given a conversation has a custom attribute with value "AWB-12345", When I search "AWB-12345", Then that conversation appears in the Conversation section. 2. Given a ticket has a custom field matching the keyword, When I search, Then that ticket appears in the Ticket section. 3. Given the value is inside a Collection, When I search, Then the conversation is still matched. |
| US-004 | P0 | As an Agent, I want results separated by domain so I can quickly identify the source. | 1. Given results exist in both domains, When search completes, Then the Conversation section appears first with header "Percakapan (N)", followed by the Ticket section with header "Tiket (M)". 2. Given results exist in only one domain, When search completes, Then only that section is shown. 3. Given results span multiple pages, When I scroll, Then both sections scroll together and a divider separates Conversation results from Ticket results. |
| US-005 | P0 | As an Agent, I want to click a search result and go directly to the entity. | 1. Given a Conversation search result, When I click it, Then the Conversation Room opens. 2. Given a Ticket search result, When I click it, Then the Ticket Detail opens. 3. Given I navigate back, When I return to the search page, Then the last search keyword and results are preserved (session-scoped). |
| US-006 | P0 | As an Agent, I want the most relevant results to appear first within each domain section. | 1. Given I search a Ticket ID exactly, When results appear, Then that exact match is first in the Ticket section. 2. Given I search a partial keyword, When results appear, Then prefix matches rank above partial contains matches. 3. Given multiple results have the same relevance rank, When results appear, Then the most recently updated appears first. |
| US-007 | P0 | As an Agent, I want to see where my keyword matched in the result. | 1. Given a result where the keyword matched in the customer name, When I view the result card, Then the matched text is highlighted. 2. Given a result where the keyword matched in a message body, When I view the result card, Then a snippet of the matching message is shown with the keyword highlighted. |
| US-008 | P0 | As an Agent, I want results scoped to what I am allowed to see. | 1. Given I am an Agent with team-scoped access, When I search, Then I only see conversations and tickets within my team scope. 2. Given I am a Supervisor, When I search, Then I see conversations and tickets within my team scope. 3. Given I am an Admin, When I search, Then I see all conversations and tickets in the workspace. |
| US-009 | P0 | As an Agent, I want clear feedback while search is loading or if it fails. | 1. Given a search is in progress, When results are not yet ready, Then a loading state "Mencari..." is shown. 2. Given the search request fails, When an error occurs, Then an error state "Gagal memuat hasil pencarian. Coba lagi." with retry action is shown. 3. Given one domain fails but the other succeeds, When partial results are available, Then the successful domain shows results and the failed domain shows an inline error with retry. |
| US-010 | P1 | As an Agent, I want to access the Global Search page quickly from anywhere in the dashboard. | 1. Given I am on any page in the dashboard, When I click "Cari" in the sidebar navigation, Then I navigate to the Global Search page. 2. Given I press Ctrl+K, When the shortcut is triggered, Then I navigate to the Global Search page with the search input auto-focused. |

---

## **6. Functional Requirements**

### Access and Navigation

| Category | Requirements |
| ----- | ----- |
| Page Access | FR-001 [P0]: System MUST provide a Global Search page at route `/[locale]/(main)/search`. FR-002 [P0]: System MUST add a "Cari" navigation item in the main sidebar. FR-003 [P1]: System SHOULD support `Ctrl+K` / `Cmd+K` keyboard shortcut to navigate to the search page and auto-focus the input. |
| Roles | FR-004 [P0]: System MUST allow Agent, Supervisor, and Admin roles to access the Global Search page. FR-005 [P0]: System MUST apply workspace isolation (`companyId` + `organizationId`) to all search queries. |

### Search Input and Trigger

| Category | Requirements |
| ----- | ----- |
| Search Activation | FR-006 [P0]: System MUST activate search when the user enters at least 2 non-space characters and submits. FR-007 [P0]: System MUST trim leading and trailing spaces before processing. FR-008 [P0]: System MUST preserve the search keyword in the URL query param (`?q=<keyword>`) for shareability and back-navigation. FR-009 [P0]: System MUST debounce input by 300ms before firing the API request while the user is actively typing. |
| Search Scope | FR-010 [P0]: System MUST search across both Conversation and Ticket domains on every query. FR-011 [P0]: System MUST search Conversation domain in: customer name, phone number, alias, last message content, message bodies (up to configurable limit), tags, conversation ID, custom attribute field values (single and collections). FR-012 [P0]: System MUST search Ticket domain in: ticket ID, title, client name, description, tags, reply message bodies (up to configurable limit), custom field values (text, dropdown, date). |

### Result Display

| Category | Requirements |
| ----- | ----- |
| Section Grouping | FR-013 [P0]: System MUST display results grouped by domain: "Percakapan" section first, "Tiket" section second. FR-014 [P0]: System MUST show result count per section in the header: "Percakapan (N)" and "Tiket (M)". FR-015 [P0]: System MUST show a visual divider between the Conversation section and the Ticket section. FR-016 [P0]: System MUST hide a section entirely when that domain returns zero results. |
| Unified Pagination | FR-017 [P0]: System MUST use unified pagination — one scroll for the entire page, with both sections scrolling together. FR-018 [P0]: System MUST return a maximum of 20 results per domain per page. FR-019 [P0]: System MUST support "Muat lebih banyak" to load the next 20 results per domain when more results exist. |
| Conversation Result Card | FR-020 [P0]: Each Conversation result card MUST display: customer name, channel icon, last message snippet (truncated at 80 chars), relative timestamp, SLA indicator (color-coded dot), and assignment status. FR-021 [P0]: System MUST highlight the matched keyword in visible fields on the card. FR-022 [P0]: System MUST show a message content snippet with the keyword highlighted when the match is in a message body. |
| Ticket Result Card | FR-023 [P0]: Each Ticket result card MUST display: ticket ID, title, client name, channel icon, status badge, SLA countdown, and relative timestamp. FR-024 [P0]: System MUST highlight the matched keyword in visible fields on the card. |
| Click Behavior | FR-025 [P0]: Clicking a Conversation result MUST navigate to the Conversation Room for that conversation. FR-026 [P0]: Clicking a Ticket result MUST navigate to the Ticket Detail for that ticket. FR-027 [P0]: System MUST preserve the search keyword in session state so returning to the search page restores the last results. |

### Relevance Ranking

| Category | Requirements |
| ----- | ----- |
| Ticket ID Ranking | FR-028 [P0]: System MUST rank exact Ticket ID match first within the Ticket section. FR-029 [P0]: System MUST normalize case and hyphen/space formatting for Ticket ID matching. FR-030 [P0]: System MUST rank prefix matches after exact matches. FR-031 [P0]: System MUST rank partial contains matches after prefix matches. |
| General Relevance | FR-032 [P0]: System MUST rank results by match quality (exact > prefix > partial) within each domain section. FR-033 [P0]: System MUST use `updatedAt` as a tiebreaker when two results have the same relevance rank. FR-034 [P0]: System MUST NOT place newer partial matches above older exact matches. |

### RBAC and Permissions

| Category | Requirements |
| ----- | ----- |
| Conversation Scope | FR-035 [P0]: System MUST scope Conversation results by the user's role and team membership. FR-036 [P0]: Agent MUST only see conversations assigned to them or in their team queue. FR-037 [P0]: Supervisor MUST only see conversations in their team scope. FR-038 [P0]: Admin MUST see all conversations in the workspace. |
| Ticket Scope | FR-039 [P0]: System MUST scope Ticket results by the user's `TicketViewEnum`. FR-040 [P0]: System MUST NOT reveal result counts or existence of tickets outside the user's permission scope. |

### States

| Category | Requirements |
| ----- | ----- |
| Loading | FR-041 [P0]: System MUST show a loading state with skeleton cards while the search request is in flight. FR-042 [P0]: System MUST show "Mencari..." as the loading label. |
| Empty | FR-043 [P0]: System MUST show "Tidak ada hasil untuk pencarian ini." when no matches exist in either domain. FR-044 [P0]: System MUST show "Coba kata kunci lain atau periksa ejaan." as helper text below the empty state. |
| Error | FR-045 [P0]: System MUST show "Gagal memuat hasil pencarian. Coba lagi." with a retry button when the entire search request fails. FR-046 [P0]: System MUST show partial results with an inline error and retry per domain when one domain fails but the other succeeds. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Search request failed (both domains) | Keep previous results if available. Show retry action. | "Gagal memuat hasil pencarian. Coba lagi." |
| EH-002 | One domain failed, other succeeded | Show successful domain results. Show inline error on failed domain with retry for that domain only. | Section header shows "Gagal memuat" and retry link. |
| EH-003 | Search query too short (<2 chars after trim) | Do not fire search. Reset to initial state. | No error. Placeholder: "Cari percakapan dan tiket..." |
| EH-004 | Search query too long (>200 chars) | Truncate and fire search with first 200 chars. | No error. |
| EH-005 | Permission denied mid-search (session expired) | Redirect to login. Preserve search URL. | Standard session expiry flow. |
| EH-006 | Query timeout (either domain >5s) | Return partial results with warning. Allow retry. | "Pencarian terlalu lama. Hasil mungkin tidak lengkap." |
| EH-007 | No results in one domain | Hide that domain section. Show results for the other domain. | Only the domain with results is visible. |
| EH-008 | Result count mismatch between initial and "Muat lebih banyak" | Use latest server count. Refresh result list. | No user-facing error. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User searches a keyword that matches in both domains. | Both sections appear. Conversation section above Ticket section. | Sections ordered: Percakapan, Tiket. |
| EC-002 | Exact match is very old (outside default message search window). | Match on identity/metadata fields still works. Message content match may not appear. | Result card shows match in identity fields; message snippet may be absent. |
| EC-003 | Search keyword contains special characters (e.g., `+`, `@`, `#`). | Characters are escaped. Search behaves normally. | No special handling visible. |
| EC-004 | User searches with trailing/leading spaces. | Spaces are trimmed before processing. | "  TK-8149  " → treated as "TK-8149". |
| EC-005 | Ticket custom field value is empty for some tickets. | Empty values are not matched. Only tickets with populated values appear. | No special UI. |
| EC-006 | Conversation has no messages (brand new). | Can still match on identity fields (name, phone, alias). | Result card shows "Belum ada pesan" as snippet. |
| EC-007 | User rapidly changes keyword while results are loading. | Previous in-flight request is cancelled. Only latest keyword's results are shown. | No flicker. Smooth transition. |
| EC-008 | "Muat lebih banyak" returns duplicate results due to concurrent writes. | Deduplicate by ID on the client side. | No duplicate cards shown. |
| EC-009 | Search results include a conversation that was just closed by another agent. | Show the conversation with its current (updated) status. | Status badge updates on next render. |
| EC-010 | User navigates to search page with `?q=` URL param from a shared link. | Auto-trigger search on page load with the URL keyword. | Search input pre-filled, results load immediately. |
| EC-011 | Custom attribute field definition is deleted but values still exist. | Search still matches on stored values. | Values displayed as plain text without field label. |
| EC-012 | Search by Ticket ID with partial input (e.g., "8149" without "TK-"). | Match as partial contains. Exact match with full ID still ranks higher. | No special handling. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| **Search Page Layout** | Full-width page with centered search bar at top. Results area below with two sections. | User lands on page → types keyword → results appear in sections → scrolls unified → clicks result → navigates to detail. | US-001, US-004 |
| **Search Input** | Large input field, auto-focused on page load. Placeholder: "Cari percakapan dan tiket...". Clear button (×) appears when text is present. | User types → debounce 300ms → search triggers → loading state → results appear. | US-001 |
| **Loading State** | Skeleton cards (3 per section) with pulsing animation. Label "Mencari..." above skeleton area. | Visible between search trigger and first result render. | US-009 |
| **Section Header** | "Percakapan (N)" and "Tiket (M)" as sticky section headers with result count. Count updates on each search. | User scans sections. Count gives quick sense of volume. | US-004 |
| **Section Divider** | Horizontal rule or subtle separator between Conversation and Ticket sections. | Visually separates the two domains while keeping unified scroll. | US-004 |
| **Conversation Result Card** | Card with: customer name (bold), channel icon (left), last message snippet (truncated 80 chars), relative timestamp (right), SLA dot (green/yellow/red), assignment indicator. Keyword highlighted with background color. | Click card → navigate to Conversation Room. Hover → subtle elevation change. | US-005, US-007 |
| **Ticket Result Card** | Card with: ticket ID (mono), title (bold), client name, channel icon, status badge, SLA countdown (right), relative timestamp. Keyword highlighted with background color. | Click card → navigate to Ticket Detail. | US-005, US-007 |
| **Message Snippet** | When match is in a message body, show up to 120 chars of the message with keyword highlighted. Prefix with "…" if truncated from start, suffix with "…" if truncated from end. | Only shown when message content match contributes to the result. | US-007 |
| **Empty State** | Centered illustration or icon. Text: "Tidak ada hasil untuk pencarian ini." Subtext: "Coba kata kunci lain atau periksa ejaan." | Shown when both domains return zero results. | US-001 |
| **Error State** | Centered error icon. Text: "Gagal memuat hasil pencarian." Button: "Coba lagi". | Shown when search request fails entirely. | US-009 |
| **Partial Error** | Successful domain shows results. Failed domain section header shows "Gagal memuat — coba lagi" as a clickable link. | Only the failed domain can be retried. | US-009 |
| **"Muat lebih banyak"** | Button at the bottom of each section when more results exist beyond the initial 20. Label: "Muat lebih banyak" with remaining count if available. | Click → append next 20 results to the section. | US-004 |
| **Sidebar Navigation** | Navigation item labeled "Cari" with search icon (magnifying glass). Placed in the main navigation list, above or near Conversation/Ticket. | Click → navigate to `/search`. | US-010 |
| **Keyboard Shortcut** | `Ctrl+K` (Windows) / `Cmd+K` (Mac) → navigate to `/search` and auto-focus input. Hint shown in search input placeholder or as a small badge. | Available from any page in the dashboard. | US-010 |

**All UI copy in Bahasa Indonesia.**

---

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `searchKeyword` | String | "refund AWB-12345" | Min 2 non-space chars after trim. Max 200 chars. Case-insensitive for matching. | Required | — |
| `conversationResultLimit` | Integer | 20 | Min 1. Max 50. | Required | 20 |
| `ticketResultLimit` | Integer | 20 | Min 1. Max 50. | Required | 20 |
| `conversationOffset` | Integer | 0 | Min 0. Incremented by limit per "Muat lebih banyak". | Required | 0 |
| `ticketOffset` | Integer | 0 | Min 0. Incremented by limit per "Muat lebih banyak". | Required | 0 |
| `conversationTotal` | Integer | 47 | Derived from backend count query. Must be ≥ 0. | Derived | 0 |
| `ticketTotal` | Integer | 12 | Derived from backend count query. Must be ≥ 0. | Derived | 0 |
| `messageSearchWindow` | Integer | 500 | Max number of recent messages per conversation to include in search. Configurable server-side. | Server config | 500 |

---

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Search result response p95 under 1.5 seconds for combined Conversation + Ticket. |
| Performance | Page load (initial render, no search) under 500ms. |
| Performance | "Muat lebih banyak" response p95 under 1 second per domain. |
| Scalability | Search must remain stable with up to 100,000 conversations and 50,000 tickets per tenant. |
| Scalability | Message content search limited to last N messages per conversation (configurable, default 500). |
| Reliability | If one domain's gRPC call fails, the other domain's results must still be returned (partial success). |
| Reliability | Search results must be idempotent for the same keyword and offset within a short time window. |
| Security | All results must be scoped by `companyId`, `organizationId`, and user RBAC role. |
| Security | Server-side enforcement of result visibility. UI hiding is not sufficient. |
| Privacy | Search logs must not store the full search keyword with PII. Log only anonymized query hash and result count. |
| Observability | Track: search request count, p50/p95/p99 latency, empty result rate, partial failure rate, per-domain result count distribution. |
| Observability | Log: trace_id, company_id, user_id, query_hash, conversation_result_count, ticket_result_count, latency_ms, partial_failure flag. |
| Accessibility | Search input, result cards, and "Muat lebih banyak" must be keyboard navigable (Tab, Enter, Arrow keys). |
| Accessibility | Focus states visible on all interactive elements. |
| Accessibility | Color is not the only differentiator for SLA status (dot + text). |
| Localization | All UI labels and messages in Bahasa Indonesia. |

---

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| **Dependency**: conversation-service gRPC `SearchGlobal` implementation | Engineering | Feature blocked without search endpoint on conversation side. | Define proto contract early. conversation-service team delivers first. |
| **Dependency**: ticket-service gRPC `SearchGlobal` implementation | Engineering | Ticket section blocked. Conversation section can still work. | Allow partial launch — Conversation-only search as fallback. |
| **Dependency**: MongoDB text indexes on conversation and ticket collections | Engineering | Search performance degraded without indexes. | Create indexes in migration before feature launch. Benchmark with production-volume data. |
| **Dependency**: Custom Attributes BE implementation | Engineering | Custom attribute values not searchable if the data model is not yet in place. | Search only available fields. Custom attributes become searchable as soon as BE data model is live. |
| **Dependency**: Custom Fields (Ticket) BE implementation | Engineering | Ticket custom field values not searchable if not yet populated. | Search only available fields. |
| **Risk**: Message content search performance on large collections | Engineering | Slow search, timeout. | Limit message search to last N messages per conversation. Use text indexes. Monitor query performance. |
| **Risk**: MongoDB text index write overhead | Engineering | Slower message insert and conversation/ticket updates. | Benchmark insert latency before and after index creation. Roll out indexes incrementally. |
| **Risk**: RBAC scope inconsistency between search and detail views | Product/Engineering | User clicks a result they cannot actually open. | Use same RBAC middleware for search and detail endpoint. |
| **Risk**: Cross-domain result format inconsistency | Engineering | Uneven UX between Conversation and Ticket cards. | Standardize response contract in API Gateway. |

---

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Global Search page usage | ≥30% of active agents use at least once per day | 30 days after release | Product analytics |
| Median time to locate target entity | Under 5 seconds | 30 days after release | Product analytics |
| Search empty result rate | Under 15% of all searches | 30 days after release | Search logs |
| Search result p95 latency | Under 1.5 seconds | Ongoing | Application monitoring |
| Partial failure rate (one domain down) | Under 1% | Ongoing | Application monitoring |
| "Muat lebih banyak" usage | Baseline then monitor | 30 days after release | Product analytics |
| Wrong-domain navigation after search | Under 5% of search sessions | 30 days after release | Navigation tracking |

---

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Fuzzy search / typo tolerance | Helps with typo-heavy searches (e.g., "refnd" → "refund"). |
| AI semantic search | Match by meaning, not just keyword (e.g., "uang kembali" → matches "refund"). |
| Saved search presets | Frequent operational searches can be saved and reused. |
| Search across Broadcast and Contact domains | True unified search across all SatuInbox domains. |
| Search analytics dashboard | Product team detects failed search patterns and improves relevance. |
| Advanced filter panel on search page | Channel, status, date range, team inbox filters. |
| Search result export | Export search results as XLSX for reporting. |
| Cross-domain related results | "This conversation is linked to Ticket TK-123" shown in search results. |

---

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Message content search limited to last N messages per conversation (default 500). | Very old message content may not be searchable. Identity and attribute search is not affected. |
| No fuzzy or semantic matching in Phase 1. | Typos and synonyms will not match. Users must use exact or partial keywords. |
| Custom attributes searchable only after BE data model is deployed. | If custom attributes are not yet in production, those fields are empty and will not contribute to search results. |
| Search does not cover deleted or archived tickets. | Archived data requires separate retrieval flow. |
| No search filter panel in Phase 1 (channel, status, date range). | Users must refine search by adjusting keywords. |
| Conversation group chat history limited/unavailable per V2. | Group chat message content may not be searchable. Identity fields still work. |

---

## **16. Appendix**

### Glossary

| Term | Definition |
| ----- | ----- |
| Global Search | Unified search across Conversation and Ticket domains from a single search page. |
| Relevance ranking | Result ordering by match quality (exact > normalized exact > prefix > partial contains > date tiebreaker). |
| Message search window | Maximum number of recent messages per conversation scanned during search. |
| Unified pagination | Both domain sections scroll together on one page. "Muat lebih banyak" loads next 20 per domain independently. |
| Keyword highlighting | Matched text rendered with background highlight color in result cards. |

### UI Labels (Bahasa Indonesia)

| Label | Usage |
| ----- | ----- |
| "Cari percakapan dan tiket..." | Search input placeholder |
| "Mencari..." | Loading state |
| "Percakapan (N)" | Conversation section header |
| "Tiket (M)" | Ticket section header |
| "Tidak ada hasil untuk pencarian ini." | Unified empty state |
| "Coba kata kunci lain atau periksa ejaan." | Empty state helper text |
| "Gagal memuat hasil pencarian. Coba lagi." | Error state |
| "Gagal memuat — coba lagi" | Per-domain partial error |
| "Muat lebih banyak" | Load more button |
| "Cari" | Sidebar navigation item |
| "Belum ada pesan" | Conversation card snippet when no messages exist |
| "Pencarian terlalu lama. Hasil mungkin tidak lengkap." | Timeout warning |

### API Contracts (Summary)

#### `GET /api/search`

**Request:**
```
GET /api/search?q=refund+AWB&conversationLimit=20&conversationOffset=0&ticketLimit=20&ticketOffset=0
Authorization: Bearer <JWT>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_abc123",
        "conversationNumber": "CONV-20260614-001",
        "customerName": "John Doe",
        "customerPhone": "+62812****7890",
        "channel": "whatsapp_web",
        "lastMessageSnippet": "Saya mau refund untuk pesanan...",
        "lastMessageAt": "2026-06-14T10:30:00Z",
        "slaStatus": "green",
        "assignmentStatus": "assigned",
        "tags": ["VIP", "Refund"],
        "matchFields": ["customerName", "lastMessageSnippet"],
        "messageMatchSnippet": "...mau refund untuk pesanan #12345..."
      }
    ],
    "tickets": [
      {
        "id": "ticket_def456",
        "ticketNumber": "TK-8149",
        "title": "Refund request for order #12345",
        "clientName": "John Doe",
        "channel": "whatsapp_web",
        "status": "open",
        "slaDueAt": "2026-06-14T15:00:00Z",
        "lastActivityAt": "2026-06-14T10:25:00Z",
        "tags": ["Refund"],
        "matchFields": ["ticketNumber", "title"],
        "messageMatchSnippet": null
      }
    ]
  },
  "meta": {
    "conversationTotal": 1,
    "conversationHasMore": false,
    "ticketTotal": 1,
    "ticketHasMore": false
  }
}
```

#### gRPC Contracts (New)

| Proto | Service | RPC | Request | Response |
| ----- | ----- | ----- | ----- | ----- |
| `conversation.proto` | `ConversationSearchService` | `SearchGlobal` | `SearchGlobalRequest { query, companyId, organizationId, userId, role, teamIds[], limit, offset }` | `SearchGlobalResponse { results[], total, hasMore }` |
| `ticket.proto` | `TicketSearchService` | `SearchGlobal` | `SearchGlobalRequest { query, companyId, organizationId, userId, role, teamIds[], limit, offset }` | `SearchGlobalResponse { results[], total, hasMore }` |

### Assumptions

| # | Assumption |
| ----- | ----- |
| A1 | Custom Attributes data model (single + collections) is deployed before or in parallel with Global Search. |
| A2 | MongoDB version supports `$text` indexes with case-insensitive search. |
| A3 | Message search window of 500 messages per conversation is acceptable for MVP. |
| A4 | RBAC scope for search matches the existing Chat List and Ticket List scope rules. |
| A5 | API Gateway has sufficient capacity to handle parallel gRPC calls for search (read-only, no write overhead). |

### Open Questions

| # | Question | Owner |
| ----- | ----- | ----- |
| Q1 | Should the search page have an "Advanced" toggle for filters (channel, status, date range) in Phase 1 or Phase 2? | Product |
| Q2 | What is the exact message search window value (number of recent messages per conversation)? 500? | Engineering |
| Q3 | Should "Muat lebih banyak" load for both domains simultaneously or independently per domain? | Product/Design |
| Q4 | Should search results include a "Linked ticket" or "Linked conversation" cross-reference when available? | Product |
| Q5 | Should the search input support quoted exact phrases (e.g., `"refund request"`)? | Product/Engineering |

### References

| Item | Link / Path |
| ----- | ----- |
| Conversation Chat List PRD | `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Chat List.md` |
| Conversation Custom Attributes PRD | `PRD/Conversationv2/PRD Ticket - Conversation Custom Attributes (Single + Collections).md` |
| Ticket List PRD | `PRD/ticketv2/PRD Ticket - Ticket List Page (Tabs, View Settings, Filters, Search, Bulk Actions, Bulk Reply).md` |
| Ticket Search Relevance PRD | `PRD/ticketv2/PRD Ticket - Ticket Search Relevance and Out-of-Filter Result Guidance.md` |
| Ticket Detail PRD | `PRD/ticketv2/PRD Ticket - Ticket Detail.md` |
| Global Memory | `Memory/global-memory.md` |
| BE Architecture | `Memory/CLAUDE-be.md` |
| FE Architecture | `Memory/CLAUDE-fe.md` |
| QA Analysis (this feature) | `Assessments/global-search/global-search-qa-assessment.md` (TBD) |
