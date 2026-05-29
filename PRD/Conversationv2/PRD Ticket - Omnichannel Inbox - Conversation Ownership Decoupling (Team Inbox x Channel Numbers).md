# **Product Requirement Document (PRD)**

**Feature:** Omnichannel Inbox / Conversation Ownership Decoupling (Team Inbox x Channel Numbers)

| Author | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.4 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

# **1\. Revision History**

| Version | Date | Author | Change Description |
| ----- | ----- | ----- | ----- |
| 1.1 | 2025-09-29 | Yusril Ibnu Maulana | Initial draft: decouple team inbox from phone numbers. |
| 1.2 | 2025-10-17 | Yusril Ibnu Maulana | Removed number-as-key, lifetime ownership, cross-team history, manual move behavior. |
| 1.3 | 2025-10-17 | Yusril Ibnu Maulana | Added Sticky Conversation Binding, routing after number move, “Legacy-bound” badge, full-history move, cross-team move override, reopen vs new routing confirmation. |
| 1.4 | 2025-10-17 | Yusril Ibnu Maulana | Expanded user stories to cover bulk remap, escalation-only inboxes, sender picker default, audit visibility, and default choices on reopen. |

---

# **2\. Overview**

| Item | Description |
| ----- | ----- |
| Summary | Conversations are owned by a stable `conversation_id` (room id). Phone numbers influence **new** conversation routing only. When numbers are reassigned, any **open** conversations remain with their original team (sticky legacy binding) until explicitly moved or closed. Manual move preserves full history and displays a move banner. Team Inboxes may have **no inbound numbers** (escalation-only). |
| In Scope | Sticky legacy binding (team\_owner\_id \+ sender\_of\_record); routing rules for open vs new after number reassignment; manual move with history preserved; move allowed by Agent/Supervisor/Admin even without target-team access; cross-team history visibility; sender-agnostic replies with default sender logic; number groups/rotator apply to **new** routing only; bulk remap safety (no auto-move). |
| Out of Scope | Open API specifics, billing, detailed SLA policy beyond pause/stop on move. |
| Success Criteria | 0 unintended auto-moves after number swap; agents continue servicing open threads; complete auditability of moves and routing decisions. |
| Assumptions | WhatsApp acts as a forwarder; history stored in DB; Team Inbox can link multiple numbers and groups; number-to-team mapping affects **new** chats only; no TTL by default for legacy binding. |

---

# **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Reassigning numbers used to drag or orphan active conversations. | Lost context, SLA breaches, agent confusion. |
| PS-002 | Phone number previously treated as ownership key. | Forced data/permission churn during remaps. |
| PS-003 | Escalation-only Team Inboxes may not own inbound numbers. | Valid workflows blocked without decoupling. |
| PS-004 | Bulk number remaps can cause unintended mass moves. | Operational risk; audit gaps if implicit. |

---

# **4\. Objectives and Key Results**

| Objective | Key Result | Target |
| ----- | ----- | ----- |
| Preserve conversation continuity during number swaps | 100% of open conversations remain in original Team Inbox until manually moved or closed. | Launch |
| Make routing of new chats deterministic | 100% of new conversations follow the current number-to-team mapping. | Launch |
| Ensure manual moves are safe and auditable | 100% moves preserve history, reset assignee, stop SLA, are logged and bannered. | Launch |
| Prevent implicit moves on bulk remap | 0 conversations auto-moved by mapping changes. | Launch |

---

# **5\. User Stories and Acceptance Criteria**

## **5.1 Sticky Conversation Binding**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want open conversations to stay with their original Team Inbox after number remaps so I can continue seamlessly. | 1\. Given a conversation created in Team CS with sender 085, When 085 is reassigned to Team UNDEL, Then the **open** conversation stays in Team CS and is replyable using 085\. 2\. Given legacy binding, When viewing the header, Then a badge shows **“Legacy-bound to 085”**. 3\. Given the conversation is **closed** (and if optional LEGACY\_TTL is enabled and exceeded), When the customer later messages 085, Then a **new** conversation opens in the current owner team (Team UNDEL). |
| US-002 | P0 | As an Admin, I want routing after a number move to honor open threads; otherwise create new threads per current mapping. | 1\. Given there is an **open** thread matching `customer_id/route_key + sender_of_record`, When a message arrives to that number, Then it appends to that legacy-bound thread in the **old** team. 2\. Given no **open** match exists, When a message arrives, Then create a **new** conversation in the team that currently owns the number. 3\. Given any routing decision, When processed, Then an audit entry records actor, team(s), number, decision. |
| US-003 | P0 | As an Admin, I need bulk number remaps to be safe and not move conversations implicitly. | 1\. Given multiple numbers are remapped between teams, When remap completes, Then **no existing conversation** changes ownership automatically. 2\. Given remap executes, When new messages arrive, Then only **new** conversations follow the new mappings. |
| US-104 | P0 | As an Admin, I want to create and operate a Team Inbox **without any inbound channel/number** so that it can be used purely for escalation workflows. | 1\. Given a Team Inbox with **no inbound number linked**, When an Agent/Supervisor/Admin **moves** a conversation into this Team Inbox, Then the conversation opens in this inbox with full history preserved and becomes fully operable (read/reply) using permitted senders. 2\. Given the Team Inbox has **no inbound number**, When a **new external message** arrives to any number, Then **no new conversation** is auto-created in this escalation-only inbox (new chats still follow current number mapping). 3\. Given an Agent wants to reply from the escalation-only inbox, When the default sender is unavailable, Then the system shows **Choose sender number** and the send proceeds after a valid sender is selected. 4\. Given the Team Inbox is escalation-only, When viewing its settings, Then a visible hint/badge clarifies: **“This mapping affects new chats only. Existing conversations will not move.”** and **“Escalation-only (no inbound number)”**. |

## **5.2 Manual Moves and Audit**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-004 | P0 | As an Agent/Supervisor/Admin, I can manually move a conversation to any Team Inbox, even without target-team access, and the system preserves history and updates state. | 1\. Given a conversation in Team A, When I select **Move to Team C** and confirm, Then the entire history (messages, files, tags, timestamps) is preserved in Team C. 2\. Given the move completes, When viewing in Team C, Then assignee is **Unassigned** and SLA is **stopped** immediately. 3\. Given completion, When opening the conversation header, Then a banner shows **“Moved from {Old Team} to {New Team} by {User} at {Time}”**. 4\. Given auditability, When the move occurs, Then an audit log captures who, when, from, to, and conversation\_id. |

## **5.3 New-Chat Routing and Escalation-Only Inboxes**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-005 | P0 | As an Admin, I need **new** chats to always follow the **current** number mapping while allowing Team Inboxes with no inbound numbers to handle escalations. | 1\. Given a number is mapped to Team X at message time, When a **new** customer first messages that number, Then the system creates a new conversation in Team X. 2\. Given a Team Inbox has **no inbound number**, When a conversation is manually moved into it, Then the conversation is fully operable (read/reply) using permitted senders despite the inbox owning no number. |

## **5.4 Reopen vs New Confirmation**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-006 | P0 | As an Agent, when a **closed** legacy thread receives new inbound after remapping, I want a clear choice to keep in the old team or move to the new owner. | 1\. Given a **closed** conversation in Team A with `sender_of_record = 085`, and 085 now maps to Team B, When new inbound arrives, Then show a modal: **“This number is now linked to ‘{New Team}’. Where should we continue?”** with **Keep in {Old Team}** (default) and **Move to {New Team}**. 2\. Given I choose **Keep in {Old Team}**, When proceeding, Then the conversation reopens in Team A and the decision is audited. 3\. Given I choose **Move to {New Team}**, When proceeding, Then the conversation is moved (history preserved), assignee resets to Unassigned, SLA stops, and the decision is audited. |

## **5.5 Sender Selection and Flexibility**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-007 | P1 | As an Agent, I want a sensible default sender and the ability to choose another if unavailable. | 1\. Given a conversation has a last successful sender, When I reply, Then the system uses that sender by default. 2\. Given that sender is unavailable, When I reply, Then the system shows **“Choose sender number”** with permitted alternatives; my final choice is written to audit logs. |

## **5.6 Cross-Team History Visibility**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-008 | P1 | As a Supervisor, I need cross-team history to remain visible regardless of current number mapping so that audits are complete. | 1\. Given a conversation moved across teams or legacy-bound, When I open the conversation detail, Then full history is visible. 2\. Given policies restrict list access, When auditing, Then authorized roles can view the conversation record and audit entries centrally. |

## **5.7 Default Behaviors and UI Signals**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-009 | P0 | As an Admin, I need clear defaults that prevent accidental data moves. | 1\. Given reopen modal appears, Then default selection is **Keep in {Old Team}**. 2\. Given number–team mapping settings, Then copy clarifies: **“Affects new chats only.”** 3\. Given legacy-bound thread, Then badge **“Legacy-bound to {number}”** is always visible in the header. |

# **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | Ownership key MUST be `conversation_id`. Phone numbers MUST NOT be used as ownership keys in any flow. |
| FR-002 | On conversation creation, system MUST persist `team_owner_id` (first owning Team Inbox) and `sender_of_record` (initial sender number used to open the conversation). |
| FR-003 | Sticky legacy binding: when a number is reassigned to a different Team Inbox, all **open** conversations whose `sender_of_record` equals that number MUST remain owned by their original `team_owner_id` and remain replyable. |
| FR-004 | New-chat routing: a **new** conversation MUST be created in the Team Inbox that **currently** owns the dialed number at the moment of first inbound. |
| FR-005 | Reopen rule: for a **closed** conversation whose `sender_of_record` now maps to a different Team Inbox, the system MUST show a confirmation modal with default **Keep in {Old Team}**; the final choice MUST be stored and audited. |
| FR-006 | Manual move: Agent, Supervisor, or Admin MAY move a conversation to any Team Inbox (override allowed even without target visibility). The move MUST preserve full history (messages, files, tags, timestamps), reset assignee to **Unassigned**, and **stop SLA** immediately. |
| FR-007 | After a successful move, a persistent banner MUST appear in the conversation: origin team, destination team, actor, timestamp. |
| FR-008 | Legacy badge: open conversations whose `sender_of_record` is currently owned by a different Team Inbox MUST display a header badge **Legacy-bound to {number}**. |
| FR-009 | Remapping numbers (including bulk remaps) MUST NOT auto-move any existing conversations. Only **new** chats follow the latest mapping at message time. |
| FR-010 | Team Inboxes MAY operate without any inbound number. Conversations moved into such “escalation-only” inboxes MUST remain fully operable (read/reply) using any permitted senders. |
| FR-011 | Sender selection: system SHOULD default to the last successful sender for the conversation; if unavailable, system MUST prompt a **Choose sender number** picker listing only permitted options. The final selection MUST be audited. |
| FR-012 | All routing decisions (append vs create-new), moves, reopen choices, and sender changes MUST be written to an audit log with actor, timestamps, from/to teams, number, and `conversation_id`. |
| FR-013 | Concurrency safety: move and reopen operations MUST be idempotent and atomic. The system MUST prevent double-moves and race conditions (e.g., last-write-wins with user feedback). |
| FR-014 | Visibility after move: the conversation MUST appear in the target Team Inbox and be removed from the source list according to role policies. Conversation detail MUST retain full cross-team history. |
| FR-015 | SLA behavior: on move, SLA MUST stop immediately. On reopen in the same team, SLA resumes per policy; on move-and-reopen, a new SLA timer MAY start per target-team policy. |
| FR-016 | Mapping settings UI MUST clearly state that number-to-team mapping **affects new chats only** and never moves existing conversations. |
| FR-017 | Failure handling: if a move or routing write fails, ownership MUST remain unchanged (all-or-nothing). The user MUST receive a retry option and the incident MUST be logged. |
| FR-018 | Safe default routing: if mapping is missing/invalid at message time, system MUST route to a configured **Default Team Inbox**, surface a non-blocking banner, and create an audit entry. |
| FR-019 | Optional `LEGACY_TTL`: if enabled, after conversation is closed and inactivity exceeds TTL, the next inbound MUST open a new conversation in the current owner team. **Default: disabled (no TTL).** |
| FR-020 | Search and filters in lists MUST use stable identifiers (e.g., `conversation_id`, `customer_id`, `team_owner_id`, legacy badge state) and MUST NOT rely on phone numbers as primary keys. |
| FR-021 | Bulk operations: the system MUST support bulk remaps of numbers without impacting existing conversations; audit MUST capture a single batch record plus per-number outcomes. |
| FR-022 | Telemetry: the system MUST emit metrics for legacy-bound counts, move attempts/success/failure, reopen choices, routing results, and mapping errors. |

---

# **7\. Error Handling**

| ID | Type | Handling | UI Copy (English) |
| ----- | ----- | ----- | ----- |
| EH-001 | Move failed (network/server) | Do not change ownership; log error; present retry. | “Failed to move conversation. Please try again.” |
| EH-002 | Concurrent move (double-submit) | Idempotency check; return final state; show info to the later submitter. | “This conversation has already been moved. Loading latest status…” |
| EH-003 | Reopen choice race (two agents decide) | Last write wins; notify the other agent; audit both attempts. | “Your choice was overridden by another user. Showing the latest state.” |
| EH-004 | Default sender unavailable | Force sender picker; block send until a valid sender is selected. | “Default sender is unavailable. Please choose another sender.” |
| EH-005 | Mapping missing/invalid on inbound | Route to Default Team Inbox; show non-blocking banner; audit incident. | “Temporarily routed to Default Team due to mapping issue.” |
| EH-006 | Audit write failure | Queue and retry audit in background; do not block user action; raise alert if backlog grows. | “Action recorded. Audit log is syncing.” |
| EH-007 | SLA stop failure on move | Retry with backoff; keep user informed with non-blocking warning; audit. | “SLA sync pending. The system will retry automatically.” |
| EH-008 | Permission mismatch after move | Show success to actor; remove item from source list; ensure target visibility per policy. | “Conversation moved successfully.” |
| EH-009 | Legacy badge compute error | Hide badge; keep conversation operable; log for repair. | “Updating status…” |
| EH-010 | Default Team Inbox unavailable | Queue inbound briefly; alert admin; banner on detail; audit. | “Default Team is unavailable. Please contact an administrator.” |
| EH-011 | Invalid target team (deleted/archived) | Block move; explain and keep state unchanged. | “Selected team is invalid. Please choose another team.” |
| EH-012 | Reopen modal timed out (no choice) | Apply default **Keep in {Old Team}**; audit auto-selection; toast user. | “Default option applied due to timeout.” |

---

# **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Bulk remap: many numbers shuffled across teams | No existing conversations are moved; only **new** chats follow new mapping; affected open threads display legacy badges where applicable. |
| EC-002 | Canonical flip-flop: Team A 085 → 081; Team B 083 → 085; later Team A → 085 again | Resky’s open thread stays with Team A throughout; new chats always follow mapping at arrival time; Team B conversations created during interim remain with Team B. |
| EC-003 | Move to an escalation-only inbox (no inbound number) | Conversation remains fully operable; replies allowed with permitted senders; mapping note clarifies “affects new chats only.” |
| EC-004 | Number removed from workspace | Open legacy-bound threads remain operable; if the original sender is gone, prompt sender picker before reply. |
| EC-005 | Closed legacy thread receives inbound while two agents act | The first confirmed choice applies; subsequent actor sees override toast and latest state. |
| EC-006 | Move to same team (no-op) | Block with friendly toast; no changes applied. |
| EC-007 | Mapping flips during a burst of inbound messages | Each inbound routes by the mapping at its arrival timestamp; legacy-bound open thread keeps appending correctly. |
| EC-008 | Temporary audit store degradation | User flows proceed; audit events buffered and retried; admin alerted if queue grows. |
| EC-009 | Sender pool changes mid-reply (revoked permission) | Send is blocked until a new permitted sender is chosen; selection audited. |
| EC-010 | Cross-tenant target selected by mistake | Hard block with explicit error; nothing changes; audit the attempt. |

---

# **9\. UI & UX Requirements**

*All UI labels/copy MUST be in English.*

| ID | Component | Description | States & Copy (English) | Linked US/FR |
| ----- | ----- | ----- | ----- | ----- |
| UI-001 | Conversation Header | Show ownership, legacy status, and move banner. | Legacy badge: **“Legacy-bound to {number}”**. Move banner (persistent): **“Moved from {Old Team} to {New Team} by {User} at {Time}.”** | FR-007, FR-008 |
| UI-002 | Reopen Modal | Shown when a **closed** legacy thread receives inbound but the number now maps to another team. Default \= Keep in old team. | Title: **“Number mapping changed”** Body: **“This number is now linked to ‘{New Team}’. Where should we continue?”** Primary (default): **“Keep in {Old Team} (Recommended)”** Secondary: **“Move to {New Team}”** Timeout toast: **“Default option applied due to timeout.”** | FR-005, EH-012 |
| UI-003 | Move Dialog | Confirms the effects of manual move and requires explicit consent. | Title: **“Move conversation”** Body: **“Moving will preserve full history (messages, files, tags, timestamps). Assignee will be reset to Unassigned and SLA will stop.”** Buttons: **“Move”**, **“Cancel”** Success toast: **“Conversation moved successfully.”** | FR-006, FR-007, EH-001 |
| UI-004 | Sender Picker | Appears when default sender is unavailable or when agent clicks “change sender”. | Label: **“Choose sender number”** Helper: **“Sender is independent from Team Inbox.”** Validation: **“Please select one sender.”** | FR-011, EH-004 |
| UI-005 | Mapping Settings Hint | Copy in number→team mapping settings clarifying effect scope. | Helper text: **“This mapping affects new chats only. Existing conversations will not move.”** | FR-016 |
| UI-006 | Audit Panel (Conversation Detail) | Read-only feed of routing/move/reopen/sender events for the current conversation. | Columns: **Time**, **Actor**, **Action**, **From/To**, **Number**, **Notes** Empty: **“No activity yet.”** Error: **“Failed to load audit. Try again.”** | FR-012 |
| UI-007 | Default Routing Banner | Non-blocking banner when conversation was routed to the Default Team due to mapping issues. | **“Temporarily routed to Default Team due to mapping issue.”** | FR-018, EH-005, EH-010 |
| UI-008 | Conflict Toasts | Feedback for concurrency/conflict situations. | **“This conversation has already been moved. Loading latest status…” “Your choice was overridden by another user. Showing the latest state.”** | FR-013, EH-002, EH-003 |
| UI-009 | Empty / Loading / Error States | Robust states for conversation list/detail. | Empty list: **“No conversations found.”** Loading: skeletons/spinners. Error: **“Could not load conversations. Please refresh.”** | Global |
| UI-010 | Escalation-Only Badge (optional) | Optional badge to mark team inboxes without inbound numbers when viewing settings. |  |  |

# **10\. Field & Validation**

| Field | Type | Rules | Validation & Constraints | Required |
| ----- | ----- | ----- | ----- | ----- |
| conversation\_id | String (UUID) | Immutable ownership key | Must be unique and non-empty | Yes |
| team\_owner\_id | String (UUID) | Set at creation; changes only via explicit move | Not null at creation; write-once except via move action | Yes |
| sender\_of\_record | String (E.164 or channel sender ID) | Number/ID used when conversation was opened | Not null; archived values allowed; used for legacy match | Yes |
| legacy\_bound | Boolean | Derived flag | `true` iff conversation is OPEN and `sender_of_record` currently mapped to a different team | Derived |
| status | Enum | `open`, `pending`, `closed`, `snoozed` | Must be a valid state; transitions audited | Yes |
| assignee\_id | String (UUID) / null | Current agent | Settable; resets to null on move; validated to existing user | No |
| sla\_state | Enum | `running`, `paused`, `stopped` | Stops on move; resumes on reopen in same team per policy | Yes |
| last\_success\_sender | String | Sender last used to successfully deliver | If missing/unavailable, trigger sender picker on reply | No |
| audit\_log\_ref | String | Read-only pointer to audit stream | Must exist; append-only | Yes |
| mapping\_version\_at\_open | String/Int | Snapshot of mapping when opened | For debugging; read-only | No |
| move\_banner | Object | {from\_team, to\_team, moved\_by, moved\_at} | Populated after move; immutable once written | On move |
| reopen\_decision | Enum / null | `keep_old_team`, `move_to_new_team` | Set by reopen modal; audited; can be null if not triggered | Conditional |
| default\_team\_route | Boolean | True if routed via Default Team | Derived on EH-005/EH-010 scenarios | Derived |

---

# **11\. Non-Functional Requirements**

| Attribute | Target / Rule |
| ----- | ----- |
| Performance | Conversation detail and list P95 ≤ 2 s; modal open ≤ 200 ms; move operation end-to-end ≤ 1.5 s P95 (excluding audit retry). |
| Reliability | Move success rate ≥ 99.8%; reopen decision persistence ≥ 99.9%; audit write success (eventual) ≥ 99.9%. |
| Availability | Core routes 99.5% monthly; reopen/move flows graceful-degradation with retries. |
| Security | RBAC on view/reply/move; move override allowed for Agent/Supervisor/Admin only; all actions scoped to tenant. |
| Integrity | All-or-nothing semantics on move and routing writes; idempotent handlers. |
| Observability | Metrics for legacy-bound counts, mapping errors, move attempts/success/failure, reopen decisions; trace IDs on user flows. |
| Privacy | No PII in logs beyond hashed identifiers where applicable; audit stores actor IDs and timestamps. |
| Accessibility | UI adheres to WCAG 2.1 AA for contrast and keyboard navigation. |
| Localization | UI copy is English for this PRD; support future localization without changing logic. |

---

# **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Dependency | RBAC/Permissions service | Over/under-permissive move override | Dedicated “Move conversation” capability; unit tests; audit all moves |
| Dependency | Number–Team Mapping service | Misconfig causes misrouting | “New chats only” disclaimer; default-team fallback; admin alerts |
| Dependency | Audit pipeline/queue | Backlog or write failures | Durable queue; background retries; red dashboards/alerts |
| Dependency | SLA engine | SLA stop/resume drift | Idempotent stop; compensating jobs; health checks |
| Risk | Operator confusion on legacy-bound | Wrong assumptions about routing | Header badge \+ tooltips; reopen modal default to “Keep in {Old Team}” |
| Risk | Concurrency conflicts (double move/reopen) | Inconsistent ownership | Idempotency keys; last-write-wins; conflict toasts |
| Risk | Sender pool changes mid-reply | Failed send | Force sender picker; block send until valid; audit choice |

---

# **13\. Success Metrics**

| KPI | Definition | Target | Source |
| ----- | ----- | ----- | ----- |
| Zero unintended auto-moves | Conversations auto-moved due to mapping changes | 0 | Audit analyzer |
| Correct new-chat routing | % of new chats following current mapping | 100% | Routing metrics |
| Move success rate | Completed moves / attempted moves | ≥ 99.8% | Move service metrics |
| Reopen decision latency | Time from inbound to decision applied | P95 ≤ 10 s | UI \+ backend traces |
| Agent confusion signals | Reopen modal “help” clicks per 100 events | ↓ over time | UX telemetry |
| Legacy-bound visibility | % legacy-bound opens that show badge | 100% | UI instrumentation |
| SLA consistency | % moves with SLA stopped within 2 s | ≥ 99.5% | SLA metrics |

---

# **14\. Future Considerations**

| Item | Rationale |
| ----- | ----- |
| Bulk “resolve & rehome” wizard | Streamline large reorganizations with preview and batch audit |
| Auto-suggest move | Suggest moving when team has zero active members or prolonged divergence |
| Per-team LEGACY\_TTL | Hygiene for long-closed threads; policy-driven |
| Cross-team analytics | Visualize workload where team and numbers diverge |
| Automated mapping drift alerts | Notify admins when many threads become legacy-bound simultaneously |

---

# **15\. Limitations**

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| Legacy modules that use phone number as key | Incompatible with decoupled ownership | Migrate to `conversation_id` before enabling |
| Default Team dependency for mapping failures | Temporary concentration of load | Alerting \+ rapid admin remediation |
| Sender availability at reply-time | May require manual selection | Sender picker; training and helper text |

---

# **16\. Appendix**

## **16.1 Routing Matrix (Open vs Closed vs New)**

| State at Arrival | Number Mapping Now | Match Key Available | Result | Audit Note |
| ----- | ----- | ----- | ----- | ----- |
| OPEN | Same team as at open | `customer_id + sender_of_record` | Append to existing in Old Team | `route=append_legacy_ok` |
| OPEN | Different team than at open | `customer_id + sender_of_record` | Append to existing in Old Team; show legacy badge | `route=append_legacy_bound` |
| CLOSED | Different team than at open | `customer_id + sender_of_record` | Show Reopen Modal (default Keep in Old Team) | `route=reopen_choice_required` |
| CLOSED | Same team as at open | `customer_id + sender_of_record` | Reopen silently in Old Team | `route=reopen_same_owner` |
| NONE (New) | Any | N/A | Create new in current owner team | `route=create_new_by_mapping` |
| Any | Mapping invalid/missing | N/A | Route to Default Team | `route=default_fallback` |

## **16.2 State Transitions (SLA/Assignee)**

| Trigger | Assignee | SLA |
| ----- | ----- | ----- |
| Move conversation | Reset to Unassigned | Stop immediately |
| Reopen (keep old team) | Preserve or per policy | Resume per policy |
| Reopen (move to new team) | Unassigned | Stop then start per target policy (if configured) |

## **16.3 UI Strings (English)**

| Context | Copy |
| ----- | ----- |
| Legacy badge | “Legacy-bound to {number}” |
| Move dialog title | “Move conversation” |
| Move dialog body | “Moving will preserve full history (messages, files, tags, timestamps). Assignee will be reset to Unassigned and SLA will stop.” |
| Reopen modal title | “Number mapping changed” |
| Reopen modal body | “This number is now linked to ‘{New Team}’. Where should we continue?” |
| Default routing banner | “Temporarily routed to Default Team due to mapping issue.” |
| Conflict toast (move) | “This conversation has already been moved. Loading latest status…” |
| Conflict toast (reopen) | “Your choice was overridden by another user. Showing the latest state.” |

