# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticketing / Related Tickets and Ticket Merge Suggestion  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead: Sabrina**

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-23 | Yusril Ibnu Maulana | Initial PRD for related ticket suggestions, ticket relation, ticket merge, grouped Ticket List behavior, and customer notice flow. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable users to detect, relate, and merge same-case tickets using exact match rules based on shared workspace match keys while keeping Ticket List clean under one Main Ticket hierarchy. |
| Scope | This feature covers related ticket suggestion, manual relation, ticket merge, grouped Ticket List behavior, simple compare modal, and customer notice after merge. It does not introduce ticket detail tabs or deep field-level record merging in Phase 1\. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Reuse shared Related Match Keys configuration. | Separate ticket-specific match key settings screen. |
| Add Related Tickets drawer. | Fuzzy matching. |
| Exact normalized matching only. | AI scoring or semantic matching. |
| Manual related ticket creation. | Automatic merge. |
| Ticket merge into one Main Ticket with one or more Sub Tickets. | Undo merge. |
| Grouped Ticket List under Main Ticket. | Ticket detail multi-tab UI. |
| Customer notice after merge. | Complex field merge rules across tickets. |
| Redirect from Sub Ticket to Main Ticket. | Attachment, follower, or custom field migration. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | The same issue can create multiple tickets from different channels or different handling paths. | Teams split work across duplicate tickets and lose one clear source of truth. |
| PS-002 | Ticket relation and merge are not presented in one simple, discoverable flow. | Agents spend more time triaging duplicates and less time resolving issues. |
| PS-003 | Ticket List becomes noisy when related or merged tickets appear as separate independent rows. | Supervisors and agents cannot scan workload cleanly. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Reduce duplicate ticket handling effort. | 50% of merged tickets are initiated from the Related Tickets flow within 60 days. |
| Keep Ticket List cleaner after merge. | 90% of merged ticket groups appear as one grouped parent row with correct child expansion behavior. |
| Keep merge safe and explainable. | 100% of merged tickets preserve Main Ticket redirect and audit history. |
| Avoid over-engineering in Phase 1\. | 0 requirements to merge assignee, tags, SLA counters, attachments, or custom fields into the Main Ticket record. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want one simple Add drawer for related tickets so that I can quickly find possible duplicates without leaving the current ticket context. | 1\. Given I open a ticket detail, When I click `Tambah` in `Related Tickets`, Then one drawer opens with a single unified result list. 2\. Given high-confidence exact matches exist, When the drawer loads, Then those results appear first in the same list. 3\. Given weaker exact matches or search-only results exist, When the drawer loads, Then they appear below stronger matches in the same list. 4\. Given no exact match exists, When the drawer loads, Then I can still search by keyword or Ticket ID and see normal results. 5\. Given a ticket is already related to the current ticket group, When the drawer loads, Then that ticket is excluded from the result list. |
| US-002 | P0 | As an Agent, I want each related ticket result to explain why it matched so that I can make a fast decision. | 1\. Given a result matched by one configured key, When it is shown, Then it displays `Matched by` and `Matched value`. 2\. Given a result matched by multiple configured keys, When it is shown, Then only the highest priority matched key is displayed. 3\. Given a result appears from search only, When it is shown, Then `Matched by` and `Matched value` are hidden. 4\. Given a configured key matched through a collection value, When the result is shown, Then one exact matched value is displayed as `Matched value`. |
| US-003 | P0 | As an Agent, I want to add related tickets without merging immediately so that I can keep relationships visible before deciding to merge. | 1\. Given I choose `Tambah relasi`, When the action succeeds, Then the selected ticket appears inside `Related Tickets` of the current ticket. 2\. Given two tickets are related but not merged, When I view Ticket List, Then they still appear under one grouped parent only after a Main Ticket relation exists. 3\. Given I remove the relation before merge, When the action succeeds, Then the ticket leaves the relation group and becomes standalone again. 4\. Given the related ticket already belongs to another ticket group, When I try to relate it to the current group, Then the system asks me to move it or combine groups first. |
| US-004 | P0 | As an Agent, I want to merge tickets into one Main Ticket so that duplicate tickets do not stay active separately. | 1\. Given I click `Gabungkan`, When the merge modal opens, Then I must explicitly choose which ticket becomes the Main Ticket. 2\. Given I confirm merge, When the action succeeds, Then the non-main ticket becomes a read-only Sub Ticket with status `Merged`. 3\. Given the merge succeeds, When I open the Sub Ticket later, Then I am redirected or deep-linked to the Main Ticket while the Sub Ticket still exists for history and audit. 4\. Given the target ticket has already been merged by another user, When I try to merge again, Then the system blocks duplicate merge and refreshes the latest state. 5\. Given I merge tickets, When the action completes, Then the merge is final and cannot be undone in Phase 1\. |
| US-005 | P0 | As an Agent, I want Ticket List to group Main Ticket and Sub Tickets so that the list stays clean. | 1\. Given a Main Ticket has one or more related or merged tickets, When I view Ticket List, Then I see one parent row representing the Main Ticket. 2\. Given the grouped row is collapsed, When rendered, Then child details stay hidden and the parent row remains visually clean. 3\. Given I expand the grouped row, When it opens, Then Sub Tickets appear below the parent row. 4\. Given one child ticket has the latest update, When the list sorts by latest update, Then the parent row uses that latest child timestamp for ordering. 5\. Given the parent row is clicked, When the action completes, Then Main Ticket detail opens by default. |
| US-006 | P0 | As an Agent, I want Main Ticket and Sub Ticket behavior to stay simple so that merge does not unexpectedly alter unrelated ticket data. | 1\. Given two tickets are merged, When merge succeeds, Then assignee values remain in each ticket's own corridor and are not copied into Main Ticket automatically. 2\. Given two tickets are merged, When merge succeeds, Then tags remain in each ticket's own corridor and are not copied automatically. 3\. Given two tickets are merged, When merge succeeds, Then SLA counters remain in each ticket's own corridor and are not recalculated into one shared SLA record in Phase 1\. 4\. Given the Main Ticket is closed, When close propagation runs, Then merged Sub Tickets also follow parent close state. 5\. Given users inspect Main Ticket detail, When they view `Related Tickets`, Then they can still open the Sub Ticket record for history. |
| US-007 | P1 | As an Agent, I want a compact compare summary before merge so that I reduce accidental merges. | 1\. Given I initiate merge, When the modal opens, Then I see a compact compare summary with Ticket ID, title, matched by, matched value, assignee, status, and latest update. 2\. Given the compared data changed before final confirmation, When I continue, Then the system refreshes the latest state and asks me to review again. 3\. Given I select Main Ticket, When the selection changes, Then the result summary updates immediately. |
| US-008 | P1 | As an Agent, I want customer notice to be on by default after merge so that customers are guided to the ticket channel we will focus on. | 1\. Given I open the merge modal, When it loads, Then `Kirim pemberitahuan ke pelanggan` is enabled by default. 2\. Given the option stays enabled, When I review the message, Then I can edit it before send. 3\. Given linked conversations exist and at least one channel is eligible to send, When the merge completes, Then the notice is sent to all eligible linked channels. 4\. Given one linked channel is not eligible, When send is attempted, Then that channel is skipped and eligible channels continue. 5\. Given no linked channel is eligible, When I complete the merge, Then merge still succeeds and I see `Tidak ada channel yang bisa dikirimi pesan saat ini`. |
| US-009 | P1 | As a Supervisor, I want grouped Ticket List behavior to remain readable at scale so that parent rows do not become noisy. | 1\. Given a Main Ticket has many Sub Tickets, When the parent row is rendered, Then the parent row shows one main indicator and not many badges. 2\. Given I expand the parent row, When it opens, Then child rows show enough information to identify each Sub Ticket clearly. 3\. Given search finds a Sub Ticket directly, When the result is opened from Ticket List, Then the grouped row resolves to the parent context while still allowing direct access to the child record. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Shared Match Key Dependency | 1\. FR-001: Ticket relation and merge MUST reuse the same workspace-level `Related Match Keys` configuration defined in the Omnichannel Conversation PRD. 2\. FR-002: The ticket feature MUST read only `Custom Attributes` and `Properties` as configured sources. 3\. FR-003: `Field Name` MUST support flat direct key only. 4\. FR-004: Dot notation MUST NOT be supported in Phase 1\. |
| Matching Logic | 1\. FR-005: System MUST use exact normalized matching only. 2\. FR-006: System MUST evaluate configured keys by priority order. 3\. FR-007: System MUST support scalar and collection value matching for ticket-side searchable data. 4\. FR-008: One exact matched value from a collection MUST be enough to qualify as a match. 5\. FR-009: The visible match reason MUST use only the highest priority matched key. 6\. FR-010: Missing fields MUST be skipped silently. 7\. FR-011: Empty values MUST be skipped silently. 8\. FR-012: High-confidence exact matches MUST rank above weaker matches and normal search-only results. |
| Add Related Tickets Drawer | 1\. FR-013: Users MUST be able to open the Add drawer from `Related Tickets` using `Tambah`. 2\. FR-014: The drawer MUST show one unified result list only. 3\. FR-015: The drawer MUST support keyword search and Ticket ID search. 4\. FR-016: The drawer MUST return a maximum of 10 matched-first ranked results before relying on further search refinement. 5\. FR-017: Each matched result MUST show `Matched by` and `Matched value`. 6\. FR-018: Each result item MUST show only `Buka`, `Tambah relasi`, and `Gabungkan` actions. 7\. FR-019: Already related tickets MUST be excluded from the result list. 8\. FR-020: The `Tambah` button SHOULD show red dot when at least 1 high-confidence exact match exists. 9\. FR-021: The `Tambah` button MAY show numeric badge instead of dot when count support is available. |
| Related Ticket Group Model | 1\. FR-022: System MUST support one `Main Ticket` and zero or more `Sub Ticket` records in one flat related ticket group. 2\. FR-023: A ticket MUST belong to only 1 related ticket group at a time. 3\. FR-024: Users MUST be able to add relation without merging immediately. 4\. FR-025: Users MUST be able to remove non-merged ticket relations. 5\. FR-026: If a target ticket already belongs to another group, system MUST require explicit move or group combine confirmation before reassigning it to the current group. 6\. FR-027: Group combine for tickets MUST result in one final `Main Ticket` and all others under the same flat structure. |
| Ticket Merge | 1\. FR-028: Users MUST be able to merge from the Add drawer or from the `Related Tickets` section. 2\. FR-029: Merge MUST require explicit `Main Ticket` selection. 3\. FR-030: The non-main ticket MUST become `Merged` and read-only. 4\. FR-031: The `Merged` ticket MUST remain stored as a historical record. 5\. FR-032: Opening a `Merged` Sub Ticket MUST redirect or deep-link to the Main Ticket while preserving audit visibility. 6\. FR-033: Merge MUST NOT support undo in Phase 1\. 7\. FR-034: Merge MUST be idempotent and must block duplicate second merge attempts on the same ticket. |
| Ticket Merge Side Effects | 1\. FR-035: Assignee data MUST remain in each ticket's own corridor and MUST NOT be auto-copied into Main Ticket. 2\. FR-036: Tags MUST remain in each ticket's own corridor and MUST NOT be auto-copied into Main Ticket. 3\. FR-037: SLA data MUST remain in each ticket's own corridor and MUST NOT be recalculated into one shared SLA record in Phase 1\. 4\. FR-038: Attachments, followers, custom fields, notes, and automation states MUST NOT be merged into Main Ticket in Phase 1\. 5\. FR-039: Closing the Main Ticket MUST close merged Sub Tickets under the same group. 6\. FR-040: Closing a Sub Ticket directly after merge MUST follow parent-controlled close rules and SHOULD NOT create inconsistent state against the Main Ticket. |
| Ticket List Grouping | 1\. FR-041: Ticket List MUST render one parent row representing the `Main Ticket`. 2\. FR-042: Child tickets MUST appear only in expanded state under the parent row. 3\. FR-043: Parent row sorting MUST use the latest update across Main Ticket and all Sub Tickets. 4\. FR-044: Clicking the parent row MUST open Main Ticket detail by default. 5\. FR-045: Child rows MUST remain visually secondary to the parent row. 6\. FR-046: Parent row MUST remain visually clean and avoid many status badges. |
| Customer Notice | 1\. FR-047: Customer notice MUST be enabled by default during ticket merge confirmation. 2\. FR-048: Users MUST be able to edit the notice before final send. 3\. FR-049: Notice MUST target all linked conversations and channels that are still eligible to send outbound. 4\. FR-050: Channel eligibility MUST respect channel-specific sending rules. 5\. FR-051: Ineligible channels MUST be skipped without blocking the merge. 6\. FR-052: If no linked channel is eligible, merge MUST still succeed and the UI MUST show informational state. 7\. FR-053: Notice message SHOULD reference the channel that the team will focus on after merge when that context is available. |
| Compare Summary and Audit | 1\. FR-054: Before merge, the system MUST show a compact compare summary. 2\. FR-055: The compare summary MUST include Ticket ID, title, matched by, matched value, assignee, status, and latest update. 3\. FR-056: System MUST log related ticket additions and removals. 4\. FR-057: System MUST log ticket group move and combine actions where applicable. 5\. FR-058: System MUST log ticket merge actions with Main Ticket and Sub Ticket IDs. 6\. FR-059: System MUST log customer notice send attempts, skips, failures, and final outcomes. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Runtime | Skip missing configured field silently. | No blocking UI. |
| EH-002 | Runtime | Skip empty configured value silently. | No blocking UI. |
| EH-003 | Search | If Add drawer fetch fails, keep drawer open and allow retry. | Show `Gagal memuat hasil` and `Coba lagi`. |
| EH-004 | Conflict | If target ticket already belongs to another group, require explicit move or group-combine flow. | Show `Tiket sudah ada di grup lain`. |
| EH-005 | Conflict | If merge target was already merged by another user, refresh latest state and block duplicate merge. | Show `Tiket sudah digabungkan`. |
| EH-006 | Validation | If no Main Ticket is selected in merge modal, block confirmation. | Show `Pilih tiket utama`. |
| EH-007 | Stale Data | If compare summary became stale before confirm, refresh latest state and require re-confirmation. | Show `Data berubah. Periksa kembali sebelum melanjutkan`. |
| EH-008 | Notice Send | If some channels fail customer notice sending, keep merge successful and report partial failure. | Show `Penggabungan berhasil, tetapi sebagian pesan gagal dikirim`. |
| EH-009 | Notice Send | If no linked channel is eligible, keep merge successful and show informational state. | Show `Tidak ada channel yang bisa dikirimi pesan saat ini`. |
| EH-010 | Permission | If a user lacks merge permission in a future RBAC change, block merge. | Show `Akses ditolak`. |
| EH-011 | Redirect | If a user opens a Sub Ticket that points to a Main Ticket no longer accessible in the current view scope, show controlled redirect failure state. | Show `Tiket utama tidak dapat dibuka saat ini`. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | A matched result qualifies on multiple configured keys. | Show only the highest priority matched key as visible reason. | Show one `Matched by` only. |
| EC-002 | A target ticket exists only through Ticket ID search and has no matched key. | Still allow relation or merge if user explicitly chooses it. | Hide `Matched by` and `Matched value`. |
| EC-003 | A ticket already belongs to another relation group. | Require explicit move or group-combine flow. | Confirm before moving it. |
| EC-004 | A relation group ends with only one ticket after removal. | Group dissolves and remaining ticket becomes standalone. | Group-specific UI disappears. |
| EC-005 | Main Ticket has no linked conversations. | Merge is still allowed. | Customer notice may have no eligible target. |
| EC-006 | Parent row has no recent update but a Sub Ticket does. | Parent row sort uses latest Sub Ticket update. | Parent row ordering reflects latest child activity. |
| EC-007 | Search result opens a Sub Ticket directly. | Ticket List resolves to the grouped parent context while detail can still open the child history. | Parent row remains the primary list anchor. |
| EC-008 | Parent row becomes visually crowded due to many Sub Tickets. | Keep parent row minimal and push detail into expanded state. | Avoid extra noisy badges. |
| EC-009 | Main Ticket is closed. | Sub Tickets under merged state follow parent close state. | Child status updates reflect parent-controlled closure. |
| EC-010 | User removes relation on a merged Sub Ticket. | Not allowed in Phase 1\. | Show `Tiket yang sudah digabungkan tidak dapat dilepas`. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Related Tickets Section | Ticket detail section named `Related Tickets` with `Tambah` action and optional red dot or count on the button. | User opens ticket detail, sees current Main Ticket and Sub Ticket relations, then clicks `Tambah` to open the drawer. Empty state shows `Belum ada tiket terkait`. | US-001, US-003 |
| Add Related Tickets Drawer | One drawer with search bar and one unified result list. Matched results rank first. Items show `Matched by` and `Matched value` when applicable. | User clicks `Tambah`, sees ranked results, refines by keyword or Ticket ID, opens, relates, or merges a result, and closes the drawer. Loading, empty, and retry states are required. | US-001, US-002 |
| Related Ticket Add Confirmation | Lightweight confirmation for `Tambah relasi` when needed. | User chooses `Tambah relasi`, reviews compact summary, and confirms relation. | US-003, US-007 |
| Merge Ticket Modal | Compact compare modal with Main Ticket selector, notice toggle, editable notice, and final confirmation. | User clicks `Gabungkan`, reviews compact compare data, selects Main Ticket, optionally edits notice, and confirms merge. Stale-state and error handling stay inline. | US-004, US-007, US-008 |
| Grouped Ticket List Row | One clean parent row for the Main Ticket. Expanded state shows Sub Tickets below. Parent carries only the main visual marker. | User scans Ticket List, expands grouped row if needed, and opens Main Ticket from parent row. Child rows remain secondary. | US-005, US-009 |
| Post Merge Notice Summary | Lightweight summary after merge that shows which channels were sent, skipped, or failed for customer notice. | User completes merge and sees per-channel outcome. Merge itself is already successful. | US-008 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| Drawer Search Query | Text | `TK-000201` | 0 to 100 chars. Supports keyword and Ticket ID search. | No |
| Compare Summary Matched By | Read-only text | `Matched by: awb` | Auto-filled from highest priority matched key. | Auto |
| Compare Summary Matched Value | Read-only text | `SPX123456789` | Auto-filled from one exact matched value. | Auto |
| Main Ticket Selector | Single select | `TK-000245` | Must reference one valid ticket in the current merge scope. | Yes for merge |
| Customer Notice Toggle | Boolean | `true` | Default \= true. User may disable before confirm. | Yes |
| Customer Notice Message | Textarea | `Untuk menghindari duplikasi...` | 1 to 1000 chars if notice toggle is enabled. | Conditional |
| Notice Target Channels | Read-only list | `WhatsApp`, `Email` | Auto-generated from eligible linked conversations and channels only. | Auto |
| Main Ticket Indicator | Read-only icon | `star` | Auto shown on parent row and Main Ticket context. | Auto |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Add drawer initial matched-first results must load within 1 second at P95 for standard workspace size. |
| Performance | Ticket List grouped row expansion must complete within 500 ms at P95 excluding network fetch. |
| Reliability | Add relation, remove relation, move ticket between groups, and merge actions must be idempotent. |
| Availability | Core ticket relation and merge flows should meet 99.5% monthly availability. |
| Security | All ticket relation and merge actions must be tenant-scoped and role-aware. |
| Privacy | Customer notice sending must respect channel eligibility and current conversation state. |
| Accessibility | Drawers, grouped list rows, and merge modal must support keyboard navigation and visible focus states. |
| Observability | System must record counts for suggestions shown, relations created, merges completed, notices sent, notices skipped, and merge failures. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Shared Related Match Keys configuration | Product and Engineering | Ticket suggestions depend on the shared configuration being stable. | Reuse one shared workspace configuration and avoid duplicate settings screens. |
| Linked conversation availability | Engineering | Customer notice after merge depends on linked conversation and channel data. | Degrade gracefully when linked channels do not exist or are ineligible. |
| Ticket merge scope growth | Product | Risk of uncontrolled expansion into full record merge. | Explicitly keep assignee, tags, SLA, attachments, and custom fields in their own corridor in Phase 1\. |
| Parent row visual overload | Design | Grouped Ticket List can become noisy. | Keep one parent indicator and push detail into expanded state. |
| Redirect consistency from Sub Ticket to Main Ticket | Engineering | Broken redirect would make merged history hard to use. | Store stable Main Ticket reference and test redirect paths thoroughly. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Related ticket groups created | \>= 25% of workspaces using the feature create at least 1 ticket group | 60 days | Product analytics |
| Merges initiated from Related Tickets flow | \>= 50% of all merges | 60 days | Merge event logs |
| Ticket List grouped parent rendering success | 99% | Ongoing | UI telemetry |
| Merge completion success rate | \>= 99% | Ongoing | Audit logs |
| Customer notice success rate on eligible channels | \>= 95% | Ongoing | Notice send logs |
| Duplicate merge attempt rate | \< 1% of merge attempts | Ongoing | Error logs |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Bulk merge actions | Large operations teams may later want batch duplicate handling. |
| Selected field copy rules into Main Ticket | Some teams may later want controlled copying of certain child fields only. |
| Ticket detail secondary navigation | Users may later want faster navigation across many Sub Tickets if usage becomes high. |
| Analytics on duplicate reduction | Supervisors may want reporting on duplicate ticket prevention and merge outcomes. |
| Channel-specific default notice templates | Teams may later want different message templates per outbound channel. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Reuses shared Related Match Keys only | Ticket PRD does not define its own settings screen. |
| Exact match only | Similar but not exact values will not be suggested. |
| No ticket detail tabs | Users navigate child history through related section and list hierarchy, not tabs. |
| No undo merge | Merge must be treated as final in Phase 1\. |
| No complex ticket field merge | Assignee, tags, SLA, attachments, and custom fields remain in each ticket's own corridor. |

## **16\. Appendix**

| Item | Notes |
| ----- | ----- |
| Glossary | Main Ticket \= the parent ticket in a related or merged ticket group. Sub Ticket \= the secondary ticket under the Main Ticket. |
| Shared Match Key Dependency | This PRD consumes the shared workspace-level `Related Match Keys` configuration defined for Omnichannel Conversation. |
| UI Labels | `Related Tickets`, `Tambah`, `Tambah relasi`, `Gabungkan`, `Belum ada tiket terkait`, `Kirim pemberitahuan ke pelanggan`, `Buka`, `Coba lagi`, `Pilih tiket utama`. |
| Matching Summary | Matching uses exact normalized values from `Custom Attributes` and `Properties` only. One collection match is enough. The highest priority matched key becomes the visible reason. |
| Merge Summary | Ticket merge creates one Main Ticket and one or more read-only Sub Tickets. Assignee, tags, SLA, attachments, and custom fields are not merged into the Main Ticket in Phase 1\. |

