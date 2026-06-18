# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Actionable Shared Attribute Search & System Relation Labels  
**Product Manager**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: TBD  
**Contributors**: Engineering Team, QA Team, Design Team  
**Version**: v1.0  
**TRD**: —

---

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-06-15 | QA Analysis → PRD | Initial PRD for actionable shared-attribute search, per-domain bulk selection, and system relation labels with explicit relation notes to Global Search, Related Tickets, Related Conversations, Auto Tag, and Tag Management. |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Extend shared-attribute discovery from passive search into an actionable workflow where users can open related records directly, multi-select results per domain, and apply system-generated relation labels based on shared identifiers such as AWB, Order ID, and Tracking Number. |
| **Scope** | This PRD covers: actionable result behavior in shared-attribute search, per-domain bulk selection, bulk apply of system relation labels, and lightweight relation-filter support. This PRD does **not** modify the existing Auto Tag System or Tag Management behavior. |
| **Key Capabilities** | Search result click-through to Room + Detail or Ticket Detail, per-domain checkbox selection, per-domain bulk action bar, system relation labels with readable naming, quick filter from relation labels, RBAC-safe execution, and explicit relation contracts with existing related-record features. |
| **Outcome** | Users can move from discovery to action faster while preserving domain boundaries, reducing duplicate handling friction, and making related business context more visible without polluting the manual tag taxonomy. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Action buttons on search results. | Merge, regroup, unlink, or relation graph editing. |
| Conversation result click opens Room + Detail. | Changing existing Auto Tag rule model. |
| Ticket result click opens Ticket Detail. | Changing existing Tag Management CRUD behavior. |
| Per-domain bulk selection (`Percakapan` and `Tiket` handled separately). | Mixed bulk selection across Conversation and Ticket in one shared action bucket. |
| Bulk apply of **system relation labels** derived from shared attributes. | Turning every shared identifier into a manual global tag in Tag Management. |
| Relation label quick filter / relation filter UX support. | Full redesign of all existing tag filters across the platform. |
| Readable user-facing relation label format. | AI semantic matching, fuzzy relation scoring, or automatic merge. |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Shared-attribute search currently helps users discover related records, but the result surface stops at view-only behavior. | Users still need extra steps to operationalize the discovery. |
| PS-002 | Users may want to act on multiple related results at once, but Conversation and Ticket have different action semantics and permission scopes. | A naive mixed-domain bulk model would create ambiguity and risk. |
| PS-003 | Related identifiers such as AWB or Order ID need to stay visible after search, but reusing the manual tag system directly can create taxonomy noise and tag explosion. | Tag quality degrades, filter usability worsens, and analytics become noisy. |
| PS-004 | Existing filter-by-tag behavior is built for manual tags, not high-volume system-generated relation labels. | Users may struggle to find or reuse relation context after labels are applied. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Reduce friction between discovery and action. | ≥50% of related search sessions with valid results lead to at least one direct open action or bulk action. |
| Keep action semantics safe and understandable. | 0 mixed-domain bulk execution ambiguity in QA sign-off scenarios. |
| Preserve tag governance while surfacing relation context. | 100% of relation labels are stored and displayed without polluting the manual tag registry. |
| Improve reuse of discovered relation context. | ≥30% of applied relation labels are reused through quick filters or follow-up navigation within 30 days. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to click a conversation search result and open the full handling context so that I can continue work immediately. | 1. Given a Conversation result is visible in search, When I click the row or primary action, Then the Conversation Room opens. 2. Given the room opens, When the page loads, Then the Detail panel is also visible by default. 3. Given the popup was open, When navigation completes, Then the popup closes automatically. |
| US-002 | P0 | As an Agent, I want to click a ticket search result and open Ticket Detail directly so that I can continue work without re-searching elsewhere. | 1. Given a Ticket result is visible, When I click it, Then Ticket Detail opens. 2. Given the popup was open, When navigation completes, Then the popup closes automatically. |
| US-003 | P0 | As an Agent, I want to select multiple conversation results or multiple ticket results so that I can apply one action to the selected set safely. | 1. Given multiple Conversation results are visible, When I select them, Then a Conversation bulk action bar appears. 2. Given multiple Ticket results are visible, When I select them, Then a Ticket bulk action bar appears. 3. Given I have selected Conversation results, When I select Ticket results too, Then the system keeps both selections separated by domain and does not merge them into one mixed action bucket. |
| US-004 | P0 | As an Agent, I want to apply a readable system relation label from selected results so that related records remain easy to recognize later. | 1. Given I selected results from one domain, When I trigger `Beri Tag Relasi Otomatis`, Then the system applies a system relation label based on the current shared attribute context. 2. Given the same relation label already exists on a selected record, When the action runs, Then no duplicate label is created. 3. Given the action succeeds, When I open the record later, Then the relation label is visible in the designated relation-label area. |
| US-005 | P0 | As an Agent, I want the generated label name to be readable so that I understand the business context without opening extra detail. | 1. Given the shared attribute is `awb` and value `JNE123456789`, When the label is shown, Then the user-facing text is `AWB • JNE123456789`. 2. Given the shared attribute is `order_id` and value `ORD-7788`, When the label is shown, Then the user-facing text is `Order ID • ORD-7788`. |
| US-006 | P1 | As an Agent, I want to reuse a relation label as a filter shortcut so that I can quickly narrow to the same related context. | 1. Given a relation label is visible in search or record UI, When I click the filter shortcut, Then the system narrows the current result/list surface to that relation value. 2. Given no matching records remain under my current scope, When the filter is applied, Then I see a clear empty state. |
| US-007 | P1 | As a Supervisor, I want the feature to preserve existing manual tag governance so that system-generated relation labels do not damage current tag usage. | 1. Given this feature is enabled, When manual tags are viewed in Tag Management, Then system relation labels do not appear as normal editable manual tags. 2. Given Auto Tag rules already exist, When this feature runs, Then no existing Auto Tag rule is changed. |

---

## **6. Functional Requirements**

### **Search Result Actions**

| Category | Requirements |
| ----- | ----- |
| Per-item Open | FR-001 [P0]: Clicking a Conversation result MUST open Conversation Room with Detail panel visible by default. FR-002 [P0]: Clicking a Ticket result MUST open Ticket Detail. FR-003 [P0]: Opening a result from the search popup MUST close the popup. FR-004 [P0]: Search state MUST be restorable within the same session after navigation. |

### **Selection Model**

| Category | Requirements |
| ----- | ----- |
| Per-domain Selection | FR-005 [P0]: Search results MUST support checkbox selection per result row. FR-006 [P0]: Conversation selection state MUST be separate from Ticket selection state. FR-007 [P0]: The system MUST NOT execute one mixed bulk action across Conversation and Ticket results in Phase 1. FR-008 [P0]: Each domain section MUST show its own selected count and own bulk action bar. FR-009 [P0]: Clearing search or changing keyword SHOULD clear selection state unless Product explicitly wants retention. |

### **Bulk Actions**

| Category | Requirements |
| ----- | ----- |
| Bulk Action Surface | FR-010 [P0]: Search MUST provide a bulk action bar for selected Conversation results. FR-011 [P0]: Search MUST provide a bulk action bar for selected Ticket results. FR-012 [P0]: Phase 1 bulk action set MUST support `Beri Tag Relasi Otomatis`. |
| Bulk Safety | FR-013 [P0]: Bulk action execution MUST validate user access for each selected record. FR-014 [P0]: Inaccessible records MUST be skipped or blocked according to final UX decision, but MUST NOT be mutated silently without audit. FR-015 [P0]: Bulk execution MUST be idempotent per target record and relation label key. |

### **System Relation Label Model**

| Category | Requirements |
| ----- | ----- |
| Label Type | FR-016 [P0]: System MUST store relation labels separately from manual tag registry behavior. FR-017 [P0]: Relation labels MUST be system-generated from a shared-attribute context and MUST carry provenance that they were created by this feature. FR-018 [P0]: Relation labels MUST support at minimum: attribute key, normalized value, display value, created source, and created timestamp. |
| Naming | FR-019 [P0]: User-facing relation labels MUST use readable format `<Readable Attribute Name> • <Display Value>`. FR-020 [P0]: Internal relation label keys SHOULD use machine-safe format `rel.<attribute_key>.<normalized_value>`. |
| Dedupe | FR-021 [P0]: Applying the same relation label twice to the same record MUST NOT create duplicates. |
| Visibility | FR-022 [P0]: Relation labels MUST be visible in a dedicated relation-label presentation area and MUST NOT be indistinguishable from manual tags in the UI. |

### **Filter / Reuse Support**

| Category | Requirements |
| ----- | ----- |
| Relation Filter Shortcut | FR-023 [P1]: Search or downstream surfaces SHOULD support quick filtering by system relation label value. FR-024 [P1]: If current modules already expose tag filters, system relation filters MUST be visually separated from manual tags. FR-025 [P1]: Exact-value search for relation labels SHOULD be supported for high-confidence identifiers like AWB and Order ID. |

### **Non-goals and Boundaries**

| Category | Requirements |
| ----- | ----- |
| Explicit Non-Changes | FR-026 [P0]: This PRD MUST NOT change existing Auto Tag rule creation, editing, deletion, or evaluation behavior. FR-027 [P0]: This PRD MUST NOT change existing Tag Management CRUD behavior. FR-028 [P0]: This PRD MUST NOT convert all shared identifiers into user-managed tags in the global tag registry. FR-029 [P0]: This PRD MUST NOT introduce mixed-domain bulk mutation in one action bucket. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | If one or more selected records are outside the user's allowed mutation scope, block or skip them according to the final batch policy. | Show clear partial-success or blocked state in Bahasa Indonesia. |
| EH-002 | Conflict | If a relation label already exists on a target, keep action idempotent. | Show success without duplicate chip creation. |
| EH-003 | Validation | If user attempts to execute bulk action with zero selected records, block action. | Disable bulk action button. |
| EH-004 | Validation | If user expects one mixed bulk action across Conversation and Ticket, the system must not allow it in Phase 1. | Show separate action bars per domain only. |
| EH-005 | Runtime | If bulk apply succeeds for some records and fails for others, keep successful mutations and report partial outcome. | Show `Sebagian label berhasil diterapkan.` |
| EH-006 | Data | If relation label display value cannot be safely shown, use masked or sanitized display value while preserving the internal normalized key. | Show safe display text only. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User selects 5 Conversation results and 3 Ticket results. | Two separate bulk bars appear; no mixed execution. | `Percakapan dipilih: 5`, `Tiket dipilih: 3`. |
| EC-002 | User applies relation label to records that already carry the same relation label. | No duplicates added. | Success remains idempotent. |
| EC-003 | Shared attribute display value is long (e.g. 50+ chars). | UI truncates display safely but keeps full value accessible on hover/detail. | Readable chip remains stable. |
| EC-004 | A selected record disappears from accessible scope before action runs. | System skips or blocks that record and reports outcome. | Partial-success state allowed. |
| EC-005 | User applies relation label from AWB search, then changes search keyword. | Previous selection resets unless retained by explicit product decision. | Prevent accidental stale-batch action. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| **Actionable Search Popup** | Existing popup search with row-level clickable results and per-section bulk controls. | User opens popup → searches shared attribute → sees results → clicks item or selects multiple. | US-001, US-002, US-003 |
| **Conversation Result Row** | Entire row or primary CTA opens Room + Detail. Checkbox available. | User can open immediately or select for bulk. | US-001, US-003 |
| **Ticket Result Row** | Entire row or primary CTA opens Ticket Detail. Checkbox available. | User can open immediately or select for bulk. | US-002, US-003 |
| **Per-domain Bulk Action Bar** | Sticky mini action bar under each section when selections exist. | User selects rows → sees domain-specific action bar → applies relation label. | US-003, US-004 |
| **System Relation Label Chip** | Visual chip using format `AWB • JNE123456789` or equivalent. Distinct style from manual tag chip. | User recognizes that this is a system-generated relation marker, not a manual taxonomy tag. | US-004, US-005 |
| **Relation Filter Shortcut** | Quick action to narrow current surface to the same relation label/value. | User clicks chip/filter shortcut → result/list surface narrows. | US-006 |

**All UI copy must be Bahasa Indonesia.**

---

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `domainSelectionType` | Enum | `conversation`, `ticket` | Must be one domain per action execution in Phase 1. | Derived | — |
| `selectedRecordIds` | Array | `["conv_1", "conv_2"]` | Min 1, max 50 per execution batch. | Required | — |
| `relationAttributeKey` | String | `awb` | Must be one approved shared-attribute key. | Required | — |
| `relationAttributeDisplayName` | String | `AWB` | Readable label source for chip rendering. | Derived | — |
| `relationAttributeValueNormalized` | String | `jne123456789` | Normalized exact-match value used for dedupe/keying. | Required | — |
| `relationAttributeValueDisplay` | String | `JNE123456789` | Display-safe value used for user-facing chip text. | Required | — |
| `relationLabelDisplay` | String | `AWB • JNE123456789` | Generated, readable, truncation-safe in UI. | Derived | — |
| `relationLabelKey` | String | `rel.awb.jne123456789` | Internal machine-safe key, unique per record. | Derived | — |
| `relationLabelSource` | Enum | `search_bulk_apply` | Must identify provenance of label creation. | Derived | `search_bulk_apply` |

---

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Bulk relation-label apply p95 under 1 second for up to 50 selected records in one domain. |
| Reliability | Relation-label application must be idempotent per target record and relation key. |
| Security | Mutation permissions must be enforced per selected record and per domain. |
| Observability | System must log bulk execution count, skipped count, failure count, and applied relation label key. |
| Accessibility | Checkbox selection, action bars, chips, and quick filters must support keyboard navigation and visible focus states. |

---

## **12. Permission Matrix**

| Role | Open Result | Select Result | Apply System Relation Label | Manage Manual Tags | Manage Auto Tag Rules | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Agent | Allowed within scope | Allowed within scope | Allowed only if record mutation permission exists | Existing behavior only | Denied | This PRD does not change Agent rights in Tag Management / Auto Tag settings |
| Supervisor | Allowed within scope | Allowed within scope | Allowed within scope | Existing behavior only | Existing behavior only | No new settings page implied |
| Admin | Allowed | Allowed | Allowed | Existing behavior only | Existing behavior only | Registry governance remains separate |
| Super Admin | Allowed | Allowed | Allowed | Existing behavior only | Existing behavior only | Cross-tenant still denied |

---

## **13. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Open Conversation Result | Existing navigation contract | FE search popup | Conversation module | conversation id + optional UI flags | open room + detail | forbidden, not_found | Reuse existing room/detail routing |
| Open Ticket Result | Existing navigation contract | FE search popup | Ticket module | ticket id | open ticket detail | forbidden, not_found | Reuse existing ticket detail routing |
| Apply Relation Label Bulk | `POST /api/search/relation-labels/apply` or equivalent | FE search popup | API Gateway + domain service | domain, selected ids[], relation key/value/display | success, skipped, failed counts | forbidden, partial_failure, invalid_scope | Domain execution must stay separated in Phase 1 |

---

## **14. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| System Relation Label | Search / relation-label service | User-triggered bulk action | Same lifecycle as target record unless future cleanup policy overrides | No automatic removal in v1 unless explicit future policy is defined | Out of scope in v1 | Display value may need masking if identifier is sensitive |
| Relation Label Audit Entry | Domain audit trail | System | Standard audit retention | Follow audit retention policy | Out of scope in v1 | Must record actor and source |

---

## **15. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Product Event | `actionable_search_result_opened` | User clicks a result | domain, matched_by | Product | — |
| Product Event | `actionable_search_bulk_apply_submitted` | User submits relation-label action | domain, selected_count, attribute_key | Product | — |
| Product Event | `actionable_search_relation_filter_used` | User reuses relation filter shortcut | domain, attribute_key | Product | — |
| Log / Metric | `relation_label_apply_latency_ms` | Bulk apply completes | domain, selected_count, success_count, failed_count | Engineering | warn > 1000ms p95 |
| Audit Event | `relation_label_applied` | Label applied to target | actor, target_id, domain, relation_label_key | Engineering | — |

---

## **16. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Shared attribute matching engine | Engineering | Wrong label if matching context is inconsistent. | Reuse same normalization and shared matcher as discovery surface. |
| Existing Auto Tag PRD is conceptually adjacent but different | Product | Confusion if teams assume this reuses Auto Tag rules. | Keep this feature explicitly separate. See Relation Notes. |
| Existing Tag Management is already implemented | Product, Engineering | Risk of polluting manual tag taxonomy if reused directly. | Do not register identifier-generated labels as normal manual tags in v1. |
| Bulk action semantics differ per domain | Product, Engineering | Mixed-domain execution could create ambiguous or unsafe mutation. | Keep per-domain only in v1. |
| Filter surfaces already use manual tags | Product, FE | Relation labels can overload current filters. | Separate manual tags and relation filters in the UI. |

---

## **17. Relation Notes**

### **17.1 Relation to Global Search / Shared Attribute Discovery**

| Item | Note |
| ----- | ----- |
| Relationship | This PRD extends the current shared-attribute search from **discovery-only** into **actionable search**. |
| What stays the same | Shared matcher, `Matched by`, `Matched value`, popup entry surface, and RBAC-safe result visibility. |
| What changes | Result rows gain direct open behavior and per-domain selection/action behavior. |
| Constraint | This PRD must not fork or redefine the shared matching logic already established by the current search direction. |

### **17.2 Relation to Related Tickets and Ticket Merge Suggestion**

| Item | Note |
| ----- | ----- |
| Relationship | Ticket search results in this PRD can act as a feeder surface into future ticket relation workflows. |
| What stays the same | Existing Ticket relation/merge concept, Main Ticket/Sub Ticket model, merge rules, customer notice rules. |
| Impact if this PRD develops | Ticket detail may later choose to surface system relation labels as contextual hints before users enter Related Tickets flows. |
| How to handle | Do not change Related Tickets behavior in this PRD. Keep this feature at search/action layer only. Any deeper Ticket relation UX must be patched in the Ticket PRD separately. |

### **17.3 Relation to Related Conversations Grouping**

| Item | Note |
| ----- | ----- |
| Relationship | Conversation search results in this PRD can act as a feeder surface into future related-conversation grouping workflows. |
| What stays the same | Existing Primary/Child grouping model, grouped list rows, grouped room tabs, and customer notice flow. |
| Impact if this PRD develops | Conversation surfaces may later use relation labels to expose relation hints before full grouping actions are taken. |
| How to handle | Do not change grouping behavior here. Keep this PRD focused on search/actionability only. Any grouping mutation must remain governed by the dedicated Related Conversations PRD. |

### **17.4 Relation to Auto Tag System**

| Item | Note |
| ----- | ----- |
| Relationship | Conceptually adjacent only. Existing Auto Tag is **keyword/phrase message automation** configured in Settings. |
| What stays the same | Auto Tag rule screens, keyword matching model, scope settings, and evaluation triggers remain unchanged. |
| Impact if this PRD develops | Teams may assume relation labels are another Auto Tag type. That assumption is risky because this PRD uses **search-selected shared-attribute context**, not message keyword rules. |
| How to handle | Do **not** change Auto Tag behavior, UI, API, or data model in this PRD. If future harmonization is desired, create a separate harmonization PRD or addendum. |

### **17.5 Relation to Tag Management**

| Item | Note |
| ----- | ----- |
| Relationship | Tag Management is a dependency boundary only. It is already implemented and governs manual tag registry, color, visibility, and CRUD. |
| What stays the same | Manual tag CRUD, visibility model, and tag registry behavior remain unchanged. |
| Impact if this PRD develops | If identifier-generated relation labels are forced into the same manual registry, the platform risks tag explosion, noisy filters, and degraded taxonomy governance. |
| How to handle | Do **not** modify Tag Management in this PRD. Store or present system relation labels separately, or under a protected internal namespace that does not behave like normal user-managed tags. |

---

## **18. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Result-to-open conversion | ≥35% of actionable search sessions | 30 days | Product analytics |
| Relation-label apply success rate | ≥99% | Ongoing | Bulk action logs |
| Duplicate label creation rate | 0 duplicates per target for same relation key | Ongoing | Audit / integrity checks |
| Relation filter reuse rate | ≥20% of applied relation labels reused via filter shortcut | 30 days | Product analytics |

---

## **19. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Mixed-domain orchestration | Some users may later want coordinated multi-entity actions, but that requires a stronger permission and audit model. |
| Relation-label cleanup policy | If shared attribute values change frequently, labels may need removal or re-sync rules later. |
| Convergence with Auto Tag | Product may later want a unified automation taxonomy, but not before lifecycle and governance are stable. |
| Broader relation filter UX | Search, Conversation List, and Ticket List may later share one dedicated relation-filter language. |

---

## **20. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Bulk action is per-domain only in v1 | Users cannot execute one mixed action across Conversation and Ticket in one click. |
| No change to Auto Tag | Users cannot manage relation labels through the existing Auto Tag rule system. |
| No change to Tag Management | Users cannot CRUD these relation labels as normal tags in Tag Management. |
| No automatic relation cleanup in v1 | Labels may require future lifecycle rules if source identifiers change. |

---

## **21. Appendix**

| Item | Notes |
| ----- | ----- |
| Suggested user-facing names | `Tag Relasi Otomatis`, `Label Relasi`, `AWB • JNE123456789`, `Order ID • ORD-7788`, `Tracking • SPX9981` |
| Suggested internal keys | `rel.awb.jne123456789`, `rel.order_id.ord7788`, `rel.tracking.spx9981` |
| Related PRDs | `PRD - Global Search (Conversation + Ticket).md`, `PRD Ticket - Related Tickets and Ticket Merge Suggestion.md`, `PRD Ticket - Omnichannel Inbox - Related Conversations Grouping.md`, `PRD Setting - auto tag.md`, `PRD Setting - tag management.md` |
| Assessment Reference | `Assessments/global-search/global-search/global-search-qa-assessment.md` |
