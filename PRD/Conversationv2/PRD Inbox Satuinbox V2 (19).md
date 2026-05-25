# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Omnichannel Inbox / Related Conversations Grouping  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead: Sabrina**

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-23 | Yusril Ibnu Maulana | Initial PRD for Related Match Keys, Add Linked Conversations, grouped conversation list, grouped room tabs, and customer notice flow for omnichannel conversations. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable users to detect and group related conversations across channels using simple exact match rules based on configurable field names from Custom Attributes and Properties. |
| Scope | Add configurable Related Match Keys, a simple Add Linked Conversations drawer, flat conversation grouping with one Primary and multiple Child conversations, grouped list behavior, grouped room tabs, and optional customer notice after grouping actions. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Related Match Keys settings. | Fuzzy matching. |
| Source selector for Custom Attributes and Properties. | AI scoring or similarity ranking. |
| Exact normalized matching only. | Workflow builder for relation rules. |
| Add Linked Conversations drawer with single unified result list. | Separate suggestion page. |
| Grouping conversations into one flat group. | Raw message merge into one shared timeline. |
| Group combine flow with final Primary selection. | Nested conversation groups. |
| Grouped Conversation List row. | Bulk linking actions. |
| Grouped room tabs. | Ticket merge and ticket PRD scope. |
| Customer notice after grouping actions. | Ticket-specific customer notice rules. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | The same case can appear in multiple channels with no clear, simple grouping flow. | Agents work on duplicate threads and lose context. |
| PS-002 | Matching keys vary by workspace and by channel, but current conversation handling has no simple configurable matching setup. | Teams cannot adapt relation detection to their operational identifiers. |
| PS-003 | Related conversations appear as separate rows and separate rooms, which makes list scanning and handling noisy. | Inbox becomes harder to use at scale and duplicate handling increases. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Make cross-channel conversation grouping configurable and understandable. | 90% of workspaces using the feature keep 1 to 4 valid Related Match Keys without support intervention after setup. |
| Reduce duplicate handling effort in Inbox. | 60% of linked conversation groups are opened through grouped list rows within 60 days. |
| Keep room navigation clean after linking. | 95% of grouped room openings land on the correct Primary tab by default. |
| Keep the feature simple and safe. | 100% of grouped conversations preserve separate raw records and complete audit history. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to configure Related Match Keys with simple rows so that the workspace can decide which values define related conversations. | 1\. Given I open `Related Match Keys`, When I add a row, Then I must select `Custom Attributes` or `Properties` and enter one flat field key. 2\. Given I save 1 to 4 valid rows, When the save succeeds, Then the row order becomes the active priority order. 3\. Given I delete all rows, When I try to save, Then save is blocked and I see `Minimal 1 key diperlukan`. 4\. Given I add duplicate `Source + Field Name` rows, When I try to save, Then save is blocked and I see `Nama field sudah digunakan`. 5\. Given I click `Pulihkan default`, When the action completes, Then the rows become `Properties / contact_number`, `Properties / email`, and `Properties / contact_name`. |
| US-002 | P0 | As an Agent, I want one simple Add drawer for linked conversations so that I do not need a separate suggestion flow. | 1\. Given I open a conversation detail, When I click `Tambah` in `Linked Conversations`, Then one drawer opens with a single unified result list. 2\. Given high-confidence exact matches exist, When the drawer loads, Then those results appear first in the same list. 3\. Given lower-confidence exact matches also exist, When the drawer loads, Then they appear below stronger matches in the same list without a separate section. 4\. Given no exact match exists, When the drawer loads, Then I can still search by keyword or Conversation ID and see normal search results. 5\. Given a conversation is already linked in the current group, When the drawer loads, Then that conversation does not appear in the result list. |
| US-003 | P0 | As an Agent, I want each linked conversation result to explain why it matched so that I can decide quickly. | 1\. Given a result matched by one configured key, When it is shown, Then it displays `Matched by` and `Matched value` for that matched key. 2\. Given a result matched by multiple configured keys, When it is shown, Then only the highest priority matched key is displayed. 3\. Given a result matched through a collection value, When it is shown, Then only one matching value is shown as `Matched value`. 4\. Given a result appears only from search and not from matching, When it is shown, Then `Matched by` and `Matched value` are hidden. |
| US-004 | P0 | As an Agent, I want to link conversations into one flat group so that related threads stay together without merging raw histories. | 1\. Given two standalone conversations, When I confirm linking, Then they form one flat group with exactly one Primary and one Child conversation. 2\. Given a flat group already exists, When I add another conversation, Then it becomes a Child conversation under the same Primary group. 3\. Given a Child conversation is no longer related, When I click `Lepas`, Then the child leaves the group and becomes a standalone row again. 4\. Given I want another conversation to become the main handling room, When I click `Jadikan utama`, Then the selected conversation becomes Primary and the group remains flat. 5\. Given a conversation already belongs to another group, When I try to link it into my current group, Then the system requires an explicit move or group combine confirmation. |
| US-005 | P0 | As an Agent, I want to combine two existing conversation groups into one flat group so that fragmented handling becomes one grouped case. | 1\. Given two separate groups exist, When I choose to combine them, Then the system shows a combine confirmation summary. 2\. Given the combine confirmation opens, When I proceed, Then I must select exactly one final Primary conversation. 3\. Given the combine succeeds, When the group is saved, Then all conversations from both groups become one flat group with one Primary and all others as Child. 4\. Given one group has the intended Primary already, When I confirm that Primary, Then all other conversations move under it without nested levels. 5\. Given I cancel the combine flow, When I exit, Then both original groups remain unchanged. |
| US-006 | P0 | As an Agent, I want grouped conversations to appear as one grouped row in Conversation List so that the Inbox stays clean. | 1\. Given a conversation group exists, When I view Conversation List, Then I see one parent row representing the Primary conversation. 2\. Given the parent row is collapsed, When it is rendered, Then child details stay hidden and the row remains visually clean. 3\. Given I expand the grouped row, When it opens, Then child conversations appear below the parent inside the same group container. 4\. Given a child room has the latest activity, When the list sorts by latest activity, Then the parent row uses that latest child timestamp for ordering. 5\. Given unread exists in one or more child rooms, When I view the parent row, Then the parent unread count includes unread from all child rooms. |
| US-007 | P0 | As an Agent, I want grouped conversation rooms to use tabs so that I can switch channels quickly without losing structure. | 1\. Given I open a grouped parent row, When the room loads, Then the Primary conversation tab appears first and becomes the default active tab. 2\. Given child conversations exist, When the tab strip renders, Then each child appears as a tab after the Primary tab. 3\. Given a child room has unread, When tabs are shown, Then that child tab shows an unread indicator. 4\. Given I click a child tab, When the action completes, Then that child room opens in the same grouped room container. 5\. Given only one conversation exists in the group, When the room opens, Then tabs still support the Primary conversation but no extra grouped controls are needed. |
| US-008 | P1 | As an Agent, I want the Add button to show a small signal when exact matches exist so that I know there may be related conversations. | 1\. Given at least one high-confidence exact match exists, When I view `Linked Conversations`, Then the `Tambah` button shows a red dot. 2\. Given count support is available, When exact matches exist, Then the red dot may be replaced by a numeric badge. 3\. Given no high-confidence exact match exists, When I view the section, Then the `Tambah` button shows no signal. 4\. Given only lower-confidence matches exist, When I view the section, Then the button signal does not have to appear. |
| US-009 | P1 | As an Agent, I want a compact compare summary before linking or combining groups so that I reduce accidental actions. | 1\. Given I choose to link a conversation, When the confirmation opens, Then I see a compact summary with ID, channel, matched by, matched value, and latest activity. 2\. Given I choose to combine groups, When the confirmation opens, Then I see a compact summary of both groups and the final Primary selector. 3\. Given the compared data changed before confirmation, When I continue, Then the system refreshes the latest state and asks me to confirm again. |
| US-010 | P1 | As an Agent, I want customer notice to be on by default after grouping actions so that customers are guided to the conversation we will focus on. | 1\. Given I confirm a link or group-combine action, When the confirmation modal opens, Then `Kirim pemberitahuan ke pelanggan` is enabled by default. 2\. Given the notice remains enabled, When I review the message, Then I can edit the draft before send. 3\. Given multiple linked channels are still eligible to send outbound, When I confirm the action, Then the notice is sent to all eligible linked channels. 4\. Given one or more linked channels are not eligible, When send is attempted, Then those channels are skipped and eligible channels continue. 5\. Given no linked channel is eligible, When I confirm the grouping action, Then the grouping still succeeds and I see `Tidak ada channel yang bisa dikirimi pesan saat ini`. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Related Match Keys Settings | 1\. FR-001: System MUST provide a `Related Match Keys` settings section for Admin only. 2\. FR-002: System MUST support 1 to 4 rows only. 3\. FR-003: Each row MUST contain `Sumber` and `Nama field`. 4\. FR-004: `Sumber` MUST allow only `Custom Attributes` or `Properties`. 5\. FR-005: `Nama field` MUST support flat direct key only. 6\. FR-006: Dot notation MUST NOT be supported in Phase 1\. 7\. FR-007: Rows MUST be deletable. 8\. FR-008: Save MUST be blocked if zero rows remain. 9\. FR-009: Save MUST be blocked if duplicate `Sumber + Nama field` rows exist. 10\. FR-010: `Pulihkan default` MUST restore `Properties / contact_number`, `Properties / email`, and `Properties / contact_name`. |
| Matching Logic | 1\. FR-011: System MUST use exact normalized matching only. 2\. FR-012: System MUST evaluate rows by priority order from top to bottom. 3\. FR-013: System MUST read match candidates only from `Custom Attributes` and `Properties`. 4\. FR-014: System MUST support scalar values and collection values from Custom Attributes. 5\. FR-015: One exact collection value MUST be enough to qualify as a match. 6\. FR-016: System MUST display only the highest priority matched key as the visible explanation for a result item. 7\. FR-017: Missing fields MUST be skipped silently. 8\. FR-018: Empty values MUST be skipped silently. 9\. FR-019: High-confidence exact matches MUST rank above lower-confidence exact matches and normal search-only results. 10\. FR-020: `contact_number`, `email`, and custom operational identifiers such as `awb` or `order_id` SHOULD be treated as high-confidence when they match exactly. 11\. FR-021: `contact_name` exact matches MAY rank below stronger identifiers and do not need explicit low-confidence labeling in the UI. |
| Add Linked Conversations Drawer | 1\. FR-022: Users MUST be able to open the Add drawer from `Linked Conversations` using `Tambah`. 2\. FR-023: The drawer MUST show a single unified result list only. 3\. FR-024: The drawer MUST support keyword search and Conversation ID search. 4\. FR-025: The drawer MUST return a maximum of 10 matched-first ranked results before relying on further search refinement. 5\. FR-026: Each matched result MUST show `Matched by` and `Matched value`. 6\. FR-027: Each result item MUST support only `Buka` and `Tautkan` actions. 7\. FR-028: Already linked conversations MUST be excluded from the result list. 8\. FR-029: The drawer MUST still show normal search-only results when no configured match exists. |
| Linked Conversation Group Model | 1\. FR-030: System MUST represent grouped conversations as flat groups only. 2\. FR-031: Each group MUST have exactly 1 Primary conversation. 3\. FR-032: Each group MAY have zero or more Child conversations. 4\. FR-033: A conversation MUST belong to only 1 group at a time. 5\. FR-034: Users MUST be able to unlink a Child conversation. 6\. FR-035: Users MUST be able to promote a Child conversation to Primary. 7\. FR-036: Users MUST be able to move a Child conversation between groups with explicit confirmation. 8\. FR-037: Users MUST be able to combine two groups into one flat final group. 9\. FR-038: Group combine MUST require explicit final Primary selection. |
| Conversation List Behavior | 1\. FR-039: Grouped conversations MUST appear as one parent row representing the Primary conversation. 2\. FR-040: Child conversations MUST appear only in expanded state below the parent row. 3\. FR-041: Parent row sorting MUST use latest activity across the Primary and all Child conversations. 4\. FR-042: Parent row unread count MUST aggregate unread across the Primary and all Child conversations. 5\. FR-043: Clicking the parent row MUST open the grouped room on the Primary tab. 6\. FR-044: Parent row MUST remain visually clean and use one main Primary indicator only. |
| Grouped Room Tabs | 1\. FR-045: Grouped conversation rooms MUST use tabs. 2\. FR-046: The Primary tab MUST always appear first and left-most. 3\. FR-047: Child tabs MUST appear after the Primary tab. 4\. FR-048: Tabs MUST indicate channel identity clearly. 5\. FR-049: Child tabs MUST show unread indicator when unread exists. 6\. FR-050: Opening a grouped row MUST land on the Primary tab by default. 7\. FR-051: No extra in-room `new child message` chip is required in Phase 1\. |
| Customer Notice | 1\. FR-052: Customer notice MUST be enabled by default during link and group-combine confirmations. 2\. FR-053: Users MUST be able to edit the notice before final send. 3\. FR-054: Notice MUST target all linked channels that are still eligible to send outbound. 4\. FR-055: Channel eligibility MUST respect channel-specific sending rules. 5\. FR-056: Ineligible channels MUST be skipped without blocking the grouping action. 6\. FR-057: If no linked channel is eligible, grouping MUST still succeed and the UI MUST show an informational state. 7\. FR-058: The notice message SHOULD reference the channel that the team will focus on after grouping. |
| Compare Summary and Audit | 1\. FR-059: Before linking or group combining, the system SHOULD show a compact compare summary. 2\. FR-060: The compare summary MUST include record ID, channel, matched by, matched value, and latest activity where applicable. 3\. FR-061: System MUST log settings changes for `Related Match Keys`. 4\. FR-062: System MUST log conversation link and unlink actions. 5\. FR-063: System MUST log Primary conversation changes. 6\. FR-064: System MUST log Child move actions between groups. 7\. FR-065: System MUST log group combine actions, final Primary selection, and customer notice outcomes. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block save when all match key rows are deleted. | Show `Minimal 1 key diperlukan`. |
| EH-002 | Validation | Block save when duplicate `Sumber + Nama field` rows exist. | Show `Nama field sudah digunakan`. |
| EH-003 | Validation | Block save when `Sumber` or `Nama field` is empty. | Highlight the row and show `Sumber dan nama field wajib diisi`. |
| EH-004 | Runtime | Skip missing configured field silently. | No blocking UI. |
| EH-005 | Runtime | Skip empty configured value silently. | No blocking UI. |
| EH-006 | Conflict | If a target conversation already belongs to another group, require explicit move or combine flow. | Show `Percakapan sudah ada di grup lain`. |
| EH-007 | Conflict | If the user combines groups, require final Primary selection before save. | Show `Pilih percakapan utama`. |
| EH-008 | Search | If drawer fetch fails, keep drawer open and provide retry. | Show `Gagal memuat hasil` and `Coba lagi`. |
| EH-009 | Notice Send | If one or more channels fail notice sending, keep grouping successful and show partial-send state. | Show `Pengelompokan berhasil, tetapi sebagian pesan gagal dikirim`. |
| EH-010 | Notice Send | If no linked channel is eligible, keep grouping successful and show informational state. | Show `Tidak ada channel yang bisa dikirimi pesan saat ini`. |
| EH-011 | Permission | If non-admin tries to change settings, block mutation. | Show `Akses ditolak`. |
| EH-012 | Stale Data | If compare summary data changed before confirmation, refresh latest state and require re-confirmation. | Show `Data berubah. Periksa kembali sebelum melanjutkan`. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Only 1 valid match key row remains. | Allowed. | Save succeeds. |
| EC-002 | A configured field exists in multiple collection entries. | One exact matched value is enough. | Show one `Matched value` only. |
| EC-003 | A result matches multiple configured keys. | Use highest priority key as visible reason. | Show one `Matched by` only. |
| EC-004 | A Child conversation is moved from one group to another. | Child leaves old group before joining new group. | Require explicit confirmation. |
| EC-005 | Two groups are combined. | Final group stays flat with one Primary and all others as Child. | Force final Primary selection. |
| EC-006 | A group ends with only one conversation after unlink. | Group dissolves and the remaining conversation becomes standalone. | Group-specific controls disappear. |
| EC-007 | Parent row has no unread but a child tab has unread. | Parent unread count includes child unread. | Child tab shows unread indicator. |
| EC-008 | User opens a child item directly from a search result. | Grouped room opens with the matched child tab active while Primary remains first in tab order. | Tab state reflects the selected child. |
| EC-009 | A configured key is valid in some channels but absent in others. | Matching skips absent values without blocking drawer results. | No error shown. |
| EC-010 | Parent row becomes too crowded due to many children. | Parent row stays minimal and detail moves into expanded state and tabs. | Avoid extra badges on parent row. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Related Match Keys Settings | Settings table with up to 4 rows. Each row has `Sumber`, `Nama field`, and delete action. Header contains `Tambah key` and `Pulihkan default`. | Admin opens settings, adds or deletes rows, arranges priority by row order, and saves. Empty, error, and validation states are inline. | US-001 |
| Linked Conversations Section | Conversation detail section named `Linked Conversations` with `Tambah` action and optional red dot or count on the button. | User opens conversation detail, sees current Primary and Child relationships, then clicks `Tambah` to open the drawer. Empty state shows `Belum ada percakapan tertaut`. | US-002, US-008 |
| Add Linked Conversations Drawer | One drawer with search bar and one unified result list. Matched results rank first. Items show `Matched by` and `Matched value` when applicable. | User clicks `Tambah`, sees ranked results, refines by keyword or Conversation ID, opens or links a result, and closes the drawer. Loading, empty, and retry states are required. | US-002, US-003 |
| Link Confirmation Modal | Compact confirmation modal with compare summary and optional customer notice. | User clicks `Tautkan`, reviews compact compare data, optionally edits the notice, and confirms the action. | US-004, US-009, US-010 |
| Group Combine Confirmation | Compact combine modal showing both groups, final Primary selector, and optional customer notice. | User initiates combine, reviews summary, chooses final Primary, edits notice if needed, and confirms combine. | US-005, US-009, US-010 |
| Grouped Conversation List Row | One clean parent row for the Primary conversation. Expanded state shows child entries. Parent carries only the main Primary indicator. | User scans list, opens the grouped row, expands if needed, and enters the grouped room from the parent row. | US-006 |
| Grouped Conversation Room Tabs | Tabs with Primary first and Child tabs after it. Child tabs show unread indicators when needed. | User opens grouped room, lands on Primary tab, and switches tabs to continue handling related channels in one room container. | US-007 |
| Post Action Notice Summary | Lightweight summary after linking or combining that shows which channels were sent, skipped, or failed for notice. | User completes the action and sees per-channel outcome. Grouping itself is already successful. | US-010 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| Sumber | Enum | `Properties` | Allowed values: `Custom Attributes`, `Properties`. | Yes |
| Nama field | Text | `contact_number` | 1 to 50 chars. Flat direct key only. No dot notation. Duplicate check is case-insensitive within the same `Sumber`. | Yes |
| Drawer Search Query | Text | `CV-000221` | 0 to 100 chars. Supports keyword and Conversation ID search. | No |
| Compare Summary Matched By | Read-only text | `Matched by: awb` | Auto-filled from highest priority matched key. | Auto |
| Compare Summary Matched Value | Read-only text | `SPX123456789` | Auto-filled from one matched exact value. | Auto |
| Final Primary Selector | Single select | `CV-000123` | Must reference one valid conversation among affected groups. | Conditional |
| Customer Notice Toggle | Boolean | `true` | Default \= true. User may disable before confirm. | Yes |
| Customer Notice Message | Textarea | `Untuk menghindari duplikasi...` | 1 to 1000 chars if notice toggle is enabled. | Conditional |
| Notice Target Channels | Read-only list | `WhatsApp`, `Email` | Auto-generated from eligible linked channels only. | Auto |
| Primary Indicator | Read-only icon | `star` | Auto shown on parent row and Primary tab context. | Auto |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Drawer initial matched-first results must load within 1 second at P95 for standard workspace size. |
| Performance | Grouped room tab switch must complete within 500 ms at P95 excluding network fetch. |
| Reliability | Link, unlink, set Primary, move Child, and combine group actions must be idempotent. |
| Availability | Core grouping flows should meet 99.5% monthly availability. |
| Security | All grouping actions must be tenant-scoped and role-aware. |
| Privacy | Customer notice sending must respect channel eligibility and existing conversation state. |
| Accessibility | Settings rows, drawers, tabs, and confirmation modals must support keyboard navigation and visible focus states. |
| Observability | System must record counts for suggestions shown, links created, children moved, groups combined, notices sent, notices skipped, and notice failures. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Conversation Custom Attributes collections and searchability | Engineering | Core matching depends on searchable attribute values. | Reuse existing exact-match collection indexing and search behavior. |
| Conversation detail surface availability | Product and Design | This feature depends on a stable detail surface. | Keep one simple `Tambah` entry point and compact grouped section. |
| Channel notice eligibility logic | Engineering | Notice behavior can become inconsistent across channels. | Centralize eligibility checks and return per-channel outcome. |
| Group combine complexity | Product and Engineering | Can introduce ambiguous ownership if nested structures are allowed. | Enforce flat final structure and final Primary selection only. |
| Parent row visual overload | Design | Grouped rows can become noisy. | Keep one Primary marker on the parent row and move detail into expanded state and tabs. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Workspaces with configured Related Match Keys | \>= 50% of eligible workspaces | 60 days | Settings analytics |
| Linked conversation groups created | \>= 30% of workspaces using the feature create at least 1 group | 60 days | Product analytics |
| Grouped room openings landing on correct Primary tab | 95% | Ongoing | Room open telemetry |
| Child move and group combine success rate | \>= 99% | Ongoing | Audit logs |
| Customer notice success rate on eligible channels | \>= 95% | Ongoing | Notice send logs |
| Duplicate-link conflict rate | \< 1% of link attempts | Ongoing | Error logs |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Match confidence controls beyond exact match | Teams may later want stronger ranking control without changing the basic UI model. |
| Saved match-key presets | Different industries may want reusable presets such as shipping or finance. |
| Bulk grouping actions | Large operations teams may later want batch tools once the single-record model is stable. |
| Group analytics | Supervisors may later want reporting on duplicate reduction and grouped case efficiency. |
| Smarter notice templating | Teams may later want different default notice templates by channel. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Flat direct key only | Nested key paths are not supported in Phase 1\. |
| Exact match only | Similar but not exact values will not be suggested. |
| No raw cross-channel timeline merge | Users still work through grouped tabs rather than one merged message stream. |
| No nested groups | Every group must stay flat with one Primary conversation. |
| No ticket scope in this PRD | Related ticket behavior must be defined in a separate ticket PRD. |

## **16\. Appendix**

| Item | Notes |
| ----- | ----- |
| Glossary | Primary Conversation \= the main conversation in a grouped linked conversation set. Child Conversation \= a secondary conversation in the same flat group. |
| Default Match Keys | `Properties / contact_number`, `Properties / email`, `Properties / contact_name`. |
| UI Labels | `Related Match Keys`, `Sumber`, `Nama field`, `Tambah key`, `Pulihkan default`, `Linked Conversations`, `Tambah`, `Tautkan`, `Jadikan utama`, `Lepas`, `Belum ada percakapan tertaut`, `Kirim pemberitahuan ke pelanggan`, `Buka`, `Coba lagi`. |
| Matching Summary | Matching uses exact normalized values from `Custom Attributes` and `Properties` only. One collection match is enough. The highest priority matched key becomes the visible reason. |
| Notice Summary | Customer notice is default-on, editable, and sent only to linked channels that are still eligible to send outbound. Ineligible channels are skipped without blocking grouping. |

