# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Shared Attribute Discovery — Related Ticket & Conversation Suggestions  
**Product Manager**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: TBD  
**Contributors**: Engineering Team, QA Team, Design Team  
**Version**: v2.1  
**TRD**: —

---

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-06-14 | QA Analysis → PRD | Initial PRD for generic Global Search across Conversation and Ticket. |
| v2.0 | 2026-06-15 | QA Analysis → PRD | Reframed feature into shared-attribute discovery roadmap. Phase 1 now focuses on related ticket/conversation suggestions based on shared business attributes such as AWB, Order ID, and Tracking Number. |
| v2.1 | 2026-06-15 | QA Analysis → PRD | Updated UX surface: search results now use a centered popup modal as the primary result surface instead of a drawer. |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide one discovery surface that helps agents find existing tickets and conversations sharing the same business attribute (e.g., AWB, Order ID, Tracking Number) before they create, relate, merge, or continue handling a new case. |
| **Scope** | **Phase 1 only**: attribute-centric global search suggestions across Ticket System and Conversation System. Search is optimized for shared business identifiers, not generic enterprise full-text search. |
| **Key Capabilities** | Centered popup modal for search results, command-palette quick access, cross-domain attribute matching, `Matched by` / `Matched value` explanation, RBAC-scoped results, click-through to Ticket Detail or Conversation Room, reusable matching logic for future tagging and grouping phases. |
| **Outcome** | Agents can quickly discover whether the same business case already exists in another ticket or conversation, reducing duplicate handling and improving traceability. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Search suggestions across Ticket and Conversation based on shared attributes such as AWB, Order ID, Tracking Number, and similar business identifiers. | Generic free-text search as the main feature goal. |
| Search by exact / normalized attribute value across ticket custom fields, conversation custom attributes, and approved searchable properties. | AI semantic or fuzzy matching. |
| Show `Matched by` and `Matched value` in result cards. | Automatic tagging in Phase 1. |
| Open results directly to Ticket Detail or Conversation Room. | Ticket merge logic definition in this PRD. |
| Popup modal via sidenav `Cari` and keyboard shortcut via `Ctrl+K` / `Cmd+K`. | Conversation grouping logic definition in this PRD. |
| Reusable matching logic for later ticket/conversation tagging. | Full message-body search as a primary requirement. |
| Full-page fallback `/search` for deep link and shareability. | Search across Broadcast, Contact, or other domains. |

### **Roadmap Alignment**

| Phase | Focus | Delivery Note |
| ----- | ----- | ----- |
| **Phase 1** | Global Search Suggestions | Detailed in this PRD. Discovery-only, no data mutation. |
| **Phase 2** | Automatic Ticket Tagging + grouped / related ticket visibility | Must patch `PRD Ticket - Related Tickets and Ticket Merge Suggestion.md`. |
| **Phase 3** | Automatic Conversation Tagging + related conversation visibility | Must patch `PRD Ticket - Omnichannel Inbox - Related Conversations Grouping.md`. |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Business identifiers such as AWB or Order ID often appear in tickets and conversations, but agents have no single discovery flow to detect related records across both domains. | Agents create or handle duplicate cases without knowing related records already exist. |
| PS-002 | Existing search behavior is page-local or domain-local, while related-case discovery requires one shared view across Ticket and Conversation. | Important context is missed, slowing handling and increasing fragmentation. |
| PS-003 | Related Tickets and Related Conversations already have downstream product direction, but there is no shared discovery entry point to feed those workflows consistently. | Product behavior risks becoming inconsistent across modules. |
| PS-004 | Without match explanation, users cannot quickly trust why a ticket or conversation appears as a related suggestion. | Users ignore useful suggestions or make wrong grouping decisions. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Help agents discover existing related records before continuing or creating a case. | ≥70% of searches for shared business identifiers return at least one relevant ticket or conversation suggestion when such records exist. |
| Reduce duplicate handling caused by fragmented case context. | Duplicate handling incidents linked to the same business identifier decrease by 30% within 60 days after rollout. |
| Make relation reasoning visible and explainable. | 100% of related suggestions shown from shared-attribute logic display `Matched by` and `Matched value`. |
| Establish one reusable matching foundation for future phases. | Phase 2 and Phase 3 reuse the same matching rule source without introducing separate conflicting logic. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to search by a business identifier such as AWB or Order ID so that I can quickly discover related tickets and conversations before handling the current case. | 1. Given I open search and enter `AWB-1234`, When matching records exist in Ticket and/or Conversation, Then the system shows related suggestions from both domains in one result surface. 2. Given only Ticket results exist, When search completes, Then only the Ticket section is shown. 3. Given only Conversation results exist, When search completes, Then only the Conversation section is shown. |
| US-002 | P0 | As an Agent, I want each suggestion to explain why it matched so that I can trust the result quickly. | 1. Given a result matched through `awb`, When it is shown, Then it displays `Matched by: awb`. 2. Given a result matched through one concrete value, When it is shown, Then it displays `Matched value` with the exact normalized or display value. 3. Given a result matched through multiple eligible fields, When it is shown, Then only the highest-priority matched field is displayed as the visible reason. |
| US-003 | P0 | As an Agent, I want to open the suggested ticket or conversation directly so that I can continue handling without re-searching in another module. | 1. Given a Ticket suggestion, When I click it, Then Ticket Detail opens and the search popup closes. 2. Given a Conversation suggestion, When I click it, Then Conversation Room opens and the search popup closes. 3. Given I reopen the search popup afterwards, When the popup loads, Then the last keyword and results are restored from session state. |
| US-004 | P0 | As an Agent, I want to access the discovery surface without leaving my current workflow so that I do not lose context. | 1. Given I click `Cari` in the sidenav, When the action is triggered, Then a centered popup modal opens above the current page. 2. Given I press `Ctrl+K` / `Cmd+K`, When the shortcut is triggered, Then the same search popup opens with the input auto-focused. 3. Given I close the popup and reopen it in the same session, When the popup loads, Then the last keyword and results remain available. |
| US-005 | P0 | As an Agent, I want search suggestions to respect my permissions so that I only see records I am allowed to access. | 1. Given I am an Agent with scoped access, When I search, Then I only see allowed tickets and conversations. 2. Given I am a Supervisor, When I search, Then I see records within my scope only. 3. Given a matching record exists outside my access scope, When search completes, Then the system does not reveal its existence or count. |
| US-006 | P0 | As an Agent, I want clear loading, empty, and error states so that I know what happened during discovery. | 1. Given a search is running, When results are pending, Then loading state `Mencari...` is shown. 2. Given no related records are found, When search completes, Then empty state `Tidak ada data terkait ditemukan.` is shown. 3. Given one domain fails and the other succeeds, When search completes, Then the successful section remains visible and the failed section shows retry state. |
| US-007 | P1 | As a Supervisor, I want the same discovery logic to become the foundation for future related-ticket and related-conversation flows so that downstream grouping remains consistent. | 1. Given Phase 2 begins, When Ticket auto-tagging is implemented, Then the same shared-attribute matching source is reused. 2. Given Phase 3 begins, When Conversation auto-tagging is implemented, Then the same shared-attribute matching source is reused. |

---

## **6. Functional Requirements**

### **Access and Entry Mode**

| Category | Requirements |
| ----- | ----- |
| Entry Surface | FR-001 [P0]: System MUST provide a search entry surface accessible from the main sidenav item `Cari`. FR-002 [P0]: Clicking `Cari` MUST open a centered popup modal above the current page. FR-003 [P1]: System SHOULD support `Ctrl+K` / `Cmd+K` to open the same popup modal with the input auto-focused. FR-004 [P0]: System MUST provide a full-page fallback route `/[locale]/(main)/search` for deep links and shareability. |
| Roles | FR-005 [P0]: System MUST allow Agent, Supervisor, Admin, and Super Admin to access the discovery surface. FR-006 [P0]: All search queries MUST be tenant-scoped by `companyId` and `organizationId`. |

### **Search Scope and Matching**

| Category | Requirements |
| ----- | ----- |
| Attribute-Centric Search | FR-007 [P0]: System MUST prioritize shared business attributes as the main discovery mechanism. FR-008 [P0]: Phase 1 matching MUST support exact normalized matching only. FR-009 [P0]: System MUST support matching against approved searchable sources from Ticket custom fields, Conversation custom attributes, and approved searchable properties. FR-010 [P0]: System MUST support identifiers such as AWB, Order ID, Tracking Number, and similar workspace-approved business keys. |
| Normalization | FR-011 [P0]: System MUST normalize case before matching. FR-012 [P0]: System MUST normalize separator variants such as dash, space, and underscore when configured for the shared attribute. FR-013 [P0]: System MUST apply the same normalization logic across Ticket and Conversation domains. |
| Non-goals in Phase 1 | FR-014 [P0]: System MUST NOT mutate Ticket or Conversation data during Phase 1 search. FR-015 [P0]: System MUST NOT auto-create tags in Phase 1. FR-016 [P0]: System MUST NOT define merge, regroup, or unlink behavior in this PRD. FR-017 [P0]: Message-body search MAY exist as a secondary source only if it does not change the primary attribute-centric ranking model. |

### **Result Composition**

| Category | Requirements |
| ----- | ----- |
| Result Grouping | FR-018 [P0]: System MUST display results grouped by domain: `Percakapan` and `Tiket`. FR-019 [P0]: Each domain section MUST show its result count. FR-020 [P0]: A domain section MUST be hidden when that domain returns zero accessible results. |
| Match Explanation | FR-021 [P0]: Each related suggestion returned from shared-attribute matching MUST display `Matched by`. FR-022 [P0]: Each related suggestion returned from shared-attribute matching MUST display `Matched value`. FR-023 [P0]: If multiple fields qualify as a match, only the highest-priority match reason MUST be shown visibly. |
| Result Card Fields | FR-024 [P0]: Conversation result cards MUST show customer name, channel, relative time, and enough context to identify the record. FR-025 [P0]: Ticket result cards MUST show ticket ID, title, status, and enough context to identify the record. FR-026 [P0]: Result cards SHOULD visually highlight the matched value where it is displayed. |
| Navigation | FR-027 [P0]: Clicking a Conversation result MUST open the Conversation Room. FR-028 [P0]: Clicking a Ticket result MUST open Ticket Detail. FR-029 [P0]: Opening a result from the popup MUST close the popup. FR-030 [P0]: Search keyword and results MUST be preserved in session state so the popup can be reopened without losing context. |

### **Ranking and Prioritization**

| Category | Requirements |
| ----- | ----- |
| Ranking | FR-031 [P0]: Exact normalized matches on high-confidence business identifiers MUST rank above weaker or fallback results. FR-032 [P0]: If two results have the same match strength, the most recently updated record MUST rank first within the same domain. FR-033 [P0]: Records found only through secondary helper criteria MUST rank below records found through primary shared-attribute matching. |

### **State Handling**

| Category | Requirements |
| ----- | ----- |
| Loading / Empty / Error | FR-034 [P0]: System MUST show loading state `Mencari...` while a request is in flight. FR-035 [P0]: System MUST show empty state `Tidak ada data terkait ditemukan.` when no related records are found in either domain. FR-036 [P0]: System MUST support partial success when one domain fails and the other succeeds. FR-037 [P0]: System MUST provide retry action for failed domain fetches. |

### **Roadmap Compatibility**

| Category | Requirements |
| ----- | ----- |
| Reusable Matching Logic | FR-038 [P0]: Phase 1 matching logic MUST be designed for reuse by future Ticket auto-tagging and Conversation auto-tagging. FR-039 [P0]: Phase 2 and Phase 3 MUST NOT introduce a conflicting second matching engine. FR-040 [P1]: Search responses SHOULD expose enough structured metadata (`matchedBy`, `matchedValue`, `matchSource`) for future downstream consumers. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | If keyword is empty or below minimum meaningful length, do not fire search. | Keep initial idle state. |
| EH-002 | Runtime | If Ticket search fails but Conversation succeeds, keep Conversation results and show retry for Ticket only. | Show inline section error with `Coba lagi`. |
| EH-003 | Runtime | If Conversation search fails but Ticket succeeds, keep Ticket results and show retry for Conversation only. | Show inline section error with `Coba lagi`. |
| EH-004 | Runtime | If both domains fail, keep the popup open and allow retry. | Show `Gagal memuat hasil pencarian. Coba lagi.` |
| EH-005 | Permission | If a matching record exists outside the user's access scope, exclude it silently. | No visible hint about hidden records. |
| EH-006 | Data | If `Matched by` field metadata is missing but the record qualified from a lower layer, degrade gracefully and show the result without explanation only if fallback mode is explicitly allowed. | Prefer hiding ambiguous match reason rather than showing wrong reason. |
| EH-007 | Timeout | If one domain times out, return partial results from the other domain. | Show `Sebagian hasil tidak berhasil dimuat.` |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Same shared attribute matches multiple tickets and multiple conversations. | Show all accessible results, grouped by domain. | Each card shows `Matched by` and `Matched value`. |
| EC-002 | One record has multiple matching attributes (e.g., AWB and Order ID). | Use highest-priority attribute as visible reason. | Show one visible reason only. |
| EC-003 | Attribute format differs only by separators or case (`AWB1234` vs `AWB-1234`). | Normalize and treat as the same exact match when allowed by the shared rule. | No special UI needed. |
| EC-004 | Search popup is opened while Conversation Detail drawer is already open on the right. | Search popup opens centered above the current page and does not compete with the right-side detail drawer or widget panel. | No overlap or forced close. |
| EC-005 | User opens search via keyboard shortcut while another overlay is already open. | Search popup takes focus and traps keyboard interaction until closed. | Seamless overlay takeover with clear focus state. |
| EC-006 | No `Matched value` can be safely displayed because source value is masked or protected. | Keep the result but omit unsafe raw value. | Show sanitized or masked explanation. |
| EC-007 | A record qualifies only through a source not approved for Phase 1 business identifiers. | Do not show it as a primary related suggestion. | Prevent noisy false positives. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| **Search Popup Modal** | Centered popup modal above the current page. Primary surface for browsing suggestions without leaving context. | User clicks `Cari` or presses `Ctrl+K` / `Cmd+K` → popup opens → types keyword → sees grouped results → opens a record. | US-001, US-003, US-004 |
| **Popup Overlay** | Dimmed backdrop with focus trap and dismiss actions (`Esc`, close button, optional click-outside). | User understands search is active while the current page remains visible behind the modal. | US-004 |
| **Section Header** | `Percakapan (N)` and `Tiket (M)` with per-domain count. | User scans volume quickly by domain. | US-001 |
| **Conversation Suggestion Card** | Shows customer name, channel, relative time, `Matched by`, and `Matched value`. | User identifies related conversation quickly before opening it. | US-001, US-002 |
| **Ticket Suggestion Card** | Shows ticket ID, title, status, `Matched by`, and `Matched value`. | User identifies related ticket quickly before opening it. | US-001, US-002 |
| **Partial Error State** | Inline error inside only the failed section. | User can retry one domain without losing successful results from the other domain. | US-006 |
| **Empty State** | Empty related-discovery state. | User understands no related records were found for the shared attribute. | US-006 |

**All UI copy must be Bahasa Indonesia.**

---

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `searchKeyword` | String | `AWB-1234` | Min 2 meaningful characters after trim. Max 200 chars. | Required | — |
| `matchedBy` | String | `awb` | Must reference one approved shared attribute key. | Derived | — |
| `matchedValue` | String | `AWB-1234` | Must represent the normalized or display-safe matched value. | Derived | — |
| `matchSource` | Enum | `ticket_custom_field`, `conversation_custom_attribute`, `property` | Must reflect the domain source of the matched value. | Derived | — |
| `conversationResultLimit` | Integer | 20 | Min 1, max 50. | Required | 20 |
| `ticketResultLimit` | Integer | 20 | Min 1, max 50. | Required | 20 |
| `surfaceMode` | Enum | `popup_modal`, `full_page` | Must support current active search surface. | Derived | `popup_modal` |

---

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | P95 related-suggestion response under 1.5 seconds for combined Ticket + Conversation queries using indexed shared-attribute fields. |
| Reliability | If one domain fails, the other domain's results must still be returned. |
| Security | All results must respect tenant scope and role-based access restrictions. |
| Privacy | Search logs MUST NOT store raw PII-heavy search payloads when avoidable; log masked or hashed keyword where appropriate. |
| Observability | System MUST log query source, matched attribute key, domain result counts, and partial-failure status. |
| Accessibility | Popup modal, result cards, and retry actions must be keyboard navigable with visible focus states. Popup MUST trap focus while open. |
| Consistency | Shared-attribute normalization logic must be identical across Ticket and Conversation consumers. |

---

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Shared attribute registry / approved match keys | Product + Engineering | Phase 1 cannot be accurate without one agreed set of business identifiers. | Reuse or define one workspace-level configuration source. |
| Conversation custom attribute searchability | Engineering | Related conversation suggestions fail if attribute values are not searchable. | Ensure searchable storage/index coverage for approved fields. |
| Ticket custom field searchability | Engineering | Related ticket suggestions fail if approved identifier fields are not searchable. | Ensure searchable storage/index coverage for approved fields. |
| Existing Related Tickets PRD overlap | Product | Phase 2 could diverge from existing ticket relation model. | Patch existing ticket PRD rather than duplicating behavior here. |
| Existing Related Conversations PRD overlap | Product | Phase 3 could diverge from existing conversation grouping model. | Patch existing conversation PRD rather than duplicating behavior here. |
| Collections readiness gap | Engineering | Some conversation identifiers may not be discoverable if collections are still undeveloped. | Support approved single-field sources first; add collections when ready. |
| Auto-tag lifecycle ambiguity | Product + Engineering | Future Phase 2/3 can create inconsistent tags and audit drift. | Define lifecycle before tagging rollout. |

---

## **13. Permission Matrix**

| Role | View Search Surface | Open Result | Configure Shared Attributes | See Out-of-Scope Records | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Agent | Allowed | Allowed within scope | Denied | Denied | Results must follow domain scope |
| Supervisor | Allowed | Allowed within scope | Denied unless explicitly granted | Denied | Team-scoped visibility remains enforced |
| Admin | Allowed | Allowed | Allowed if configuration UI is added in future phase | Denied cross-tenant | Can access all workspace records |
| Super Admin | Allowed | Allowed | Allowed | Denied cross-tenant | Workspace boundary still applies |

---

## **14. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Search API | `GET /api/search?q=<keyword>` | API Gateway | FE search surfaces | keyword, per-domain limit, per-domain offset | grouped domain results + `matchedBy` + `matchedValue` + meta counts | timeout, partial_failure, forbidden | Must remain backward compatible with popup modal and full page fallback |
| Conversation Search RPC | `SearchRelatedByAttribute` or equivalent | conversation-service | API Gateway | normalized keyword + tenant + user scope | conversation results + match metadata | timeout, forbidden | Use same normalization rules as ticket side |
| Ticket Search RPC | `SearchRelatedByAttribute` or equivalent | ticket-service | API Gateway | normalized keyword + tenant + user scope | ticket results + match metadata | timeout, forbidden | Use same normalization rules as conversation side |

---

## **15. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Product Event | `shared_attribute_search_opened` | Popup/full page opened | source surface, role | Product | — |
| Product Event | `shared_attribute_search_submitted` | User submits keyword | hashed_keyword, source surface | Product | — |
| Product Event | `shared_attribute_result_opened` | User clicks a result | domain, matched_by, source surface | Product | — |
| Log / Metric | `shared_attribute_search_latency_ms` | Search request completes | domain counts, partial failure flag | Engineering | warn > 1500ms p95 |
| Log / Metric | `shared_attribute_partial_failure_rate` | One domain fails | failed domain, trace_id | Engineering | critical > 5% |
| Audit Event | `shared_attribute_config_changed` | Future config mutation | actor, before, after | Engineering | — |

---

## **16. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Related suggestion open rate | ≥25% of searches with results lead to at least one result open | 60 days | Product analytics |
| Suggestion relevance confidence | ≥80% positive validation from QA / sampled support review for high-confidence identifiers | 60 days | QA sampling + support feedback |
| Duplicate handling reduction | 30% decrease in duplicate handling incidents for tracked identifiers | 60 days | Ops review / support analytics |
| Partial failure rate | <1% | Ongoing | Monitoring |
| P95 latency | <1.5 seconds | Ongoing | Monitoring |

---

## **17. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Automatic Ticket Tagging | Needed for Phase 2 related-ticket visibility and grouping enhancement. |
| Automatic Conversation Tagging | Needed for Phase 3 related-conversation visibility and navigation. |
| Shared attribute settings UI | Some workspaces may need configurable match keys similar to related-conversation settings. |
| Backfill for historical records | Needed if system tags or historical grouping must be generated from old data. |
| Generic full-text search | Can be revisited later as a separate objective, not mixed into this shared-attribute PRD. |

---

## **18. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Phase 1 is discovery-only | No automatic tags, merges, or grouping mutations happen from this PRD. |
| Exact normalized matching only | Similar but non-exact values may not be suggested. |
| Collections readiness may vary | Some conversation-side identifiers may not be discoverable until collections are implemented and indexed. |
| Existing related-record UX remains separate | Ticket merge/grouping and conversation grouping continue to depend on their own PRDs. |

---

## **19. Appendix**

| Item | Notes |
| ----- | ----- |
| Shared Attribute Examples | `awb`, `order_id`, `tracking_number`, `resi`, and other approved business identifiers. |
| UI Labels | `Cari`, `Matched by`, `Matched value`, `Tidak ada data terkait ditemukan.`, `Coba lagi`, `Percakapan`, `Tiket`. |
| Roadmap Rule | Phase 2 MUST patch `PRD Ticket - Related Tickets and Ticket Merge Suggestion.md`. Phase 3 MUST patch `PRD Ticket - Omnichannel Inbox - Related Conversations Grouping.md`. |
| Related PRDs | `PRD Ticket - Related Tickets and Ticket Merge Suggestion.md`, `PRD Ticket - Omnichannel Inbox - Related Conversations Grouping.md`, `PRD Ticket - Conversation Custom Attributes (Single + Collections).md` |
| QA Analysis | `Assessments/global-search/global-search/global-search-qa-assessment.md` |
