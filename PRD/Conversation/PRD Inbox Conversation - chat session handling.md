# **Product Requirement Document (PRD)**

**Feature**: Omnichannel Chat Sessions (Group Handling \+ Multi-number “Send as”)  
**Product Manager**: Dewa  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

# **1\. Revision History**

| Version | Date  | Author | Changes |
| ----- | ----- | ----- | ----- |
| 1.0 | 2025-10-23 | Yusril | Initial omnichannel PRD with group handling and multi-number identity. |
| 1.1 | 2025-10-23 | Yusril | Synced with Team Inbox v2.1 and Ownership Decoupling v1.4, SLA alignment, English-only UI copy. |

---

# **2\. Overview**

| Field | Description |
| ----- | ----- |
| Purpose | Provide a single, consistent omnichannel chat session model across channels (Livechat, WhatsApp Official API, WhatsApp Web/Baileys). Sessions follow identical lifecycle and SLA rules as other channels; for group-capable channels, add deltas: group metadata events, quoted-reply preservation with deeplink, and multi-number “Send as” at send time. |
| In Scope | Session lifecycle parity (Unassigned, Assigned, Resolved); Unassigned-first intake (pull); claim/assign/unassign/resolve; SLA carry-over and stop/resume on move per team policy; Room History; quoted-reply preview+deeplink; group metadata system messages; multi-number session identity and “Send as”; auditability; optional Team Inbox workflows. |
| Out of Scope | Transport/SDK specifics; broadcast/campaign tooling; non-messaging channel features. |
| Users | Agent, Supervisor, Admin. |
| Success Criteria | Parity with general session model; zero identity ambiguity in groups; preserved reply context; measurable improvement in claim time and session outcome clarity. |

---

# **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Channel behaviors are inconsistent across the inbox. | Agent confusion, errors, slower handling. |
| PS-002 | Group-specific behaviors (metadata, quoted replies) lack clear rules. | Lost context, misrouted work. |
| PS-003 | Multiple connected numbers in the same group create outbound identity ambiguity. | Wrong “from” identity, compliance risk. |
| PS-004 | Ownership tied to numbers causes unintended moves during remaps. | SLA breaches, loss of continuity. |

---

# **4\. Objectives and Key Results**

| ID | Objective | Key Result |
| ----- | ----- | ----- |
| OKR-001 | Achieve omnichannel parity for the general chat session model. | 100% parity checklist pass at GA. |
| OKR-002 | Reduce time-to-claim Unassigned sessions. | Median claim \< 60s within 30 days. |
| OKR-003 | Preserve reply-to context across sessions. | ≥99% quoted replies show preview+deeplink. |
| OKR-004 | Eliminate identity ambiguity in groups. | 0 critical “wrong sender” incidents in 30 days. |

---

# **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a system, I create a new session when a new message arrives and no session is open, across all channels. | 1\. Given a conversation has no open session, When a new message arrives, Then create a new session in Unassigned and bind the opener message. 2\. Given burst arrivals, When messages arrive within a short dedupe window, Then only one new session is created for that conversation context. |
| US-002 | P0 | As a supervisor, I want Unassigned-first intake across channels. | 1\. Given org policy uses pull, When a session is created, Then it appears in the team’s Unassigned list with status “Unassigned”. 2\. Given a session in Unassigned, When opened, Then chat detail shows channel, status, group (if applicable), and SLA summary. |
| US-003 | P0 | As a system, I always start a new session after a session is resolved (parity). | 1\. Given a session is Resolved, **When any new message arrives, Then create a new Unassigned session** and keep the prior one in Room History. 2\. Given the new session, When shown, Chat History Room for related previous session chat room”. |
| US-004 | P0 | As an agent, I claim Unassigned sessions to start working. | 1\. Given a session is Unassigned, When I pull a new conversation, Then the session becomes Assigned to me. 2\. Given two agents click simultaneously, When race occurs, Then exactly one succeeds; the other sees a conflict toast. |
| US-005 | P0 | As a user, I can assign/unassign/reassign across channels. | 1\. Given scope allows, When I assign/unassign/reassign, Then ownership updates, SLA carries over, and audit records the action. 2\. Given parity, When performing these actions, then UX behavior is consistent across channels. |
| US-006 | P0 | As an agent, I can mark a session Resolved | 1\. Given a session is Assigned, When I resolve, Then status changes to Resolved and moves to Room History with timestamp. 2\. Given history access, When opening the Resolved session, Then it is read-only. |
| US-007 | P0 | As a user, I want reply-to context preserved across sessions for group-capable channels. | 1\. Given inbound includes quoted context, When a new session is created, Then show a quoted preview \+ deeplink if i click and open related room history in a sidebar. |
| US-008 | P0 | As a user, I want non-blocking visibility of group metadata changes. | 1\. Given subject/icon/participants change, When rendered, Then inject a system message without changing state or routing. 2\. Given frequent changes, When many events occur, then group or collapse similar events to reduce noise. |
| US-009 | P0 | As a system, I bind a default sender identity to the session for group-capable channels. | 1\. Given multiple connected numbers are in the same group, When a session is created, Then default the session identity to the number that received the opener message. Default session set to inbound channel on team inbox if unavailable set to by the first number connected. 2\. Given later inbound arrives via another connected number, When appended, Then remains in the same session; outbound continues using session identity unless overridden. |
| US-010 | P0 | As an agent, I can choose which number to “Send as” at send time. | 1\. Given multiple eligible identities, When composing a reply, Then the Send area exposes a “Send as” selector with the session identity preselected. 2\. Given I change identity, When sending, Then use the chosen identity; show a confirmation badge and write an audit event. |
| US-011 | P0 | As an admin, I need SLA to carry over across assignment changes. | 1\. Given reassign/unassign occurs, When viewing SLA, Then SLA does not reset and inherited timing is visible. 2\. Given a breach occurs, When reporting, Then breach attribution follows the team responsible at breach time. |
| US-012 | P0 | As an admin, I need ownership decoupled from phone numbers and safe during remaps. | 1\. Given open conversations with a sender\_of\_record, When numbers are remapped, Then open conversations remain with the original team (legacy-bound). 2\. Given closed conversations, When inbound arrives after remap, Then show a reopen routing decision per the decoupling rules (defaults keep old team) while still creating a new session. |
| US-013 | P1 | As a supervisor, I want omnichannel metrics. | 1\. Given case-based history across channels, When generating reports, Then sessions aggregate by team, agent, status, channel, and group (if applicable). 2\. Given linked sessions, When included, Then metrics clearly denote inclusion flags. |
| US-014 | P1 | As an admin, I can operate Team Inboxes optionally (including escalation-only inboxes). | 1\. Given a Team Inbox has no inbound number, When a conversation is moved in, Then it is fully operable and replies require a valid sender selection if no default is available. 2\. Given no inbound number, When external messages arrive, Then no new conversations auto-create in that inbox; routing follows current mapping to other inboxes. |

---

# **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | System MUST create a new session for any inbound message with no open session across all channels. |
| FR-002 | System MUST default to Unassigned-first (pull system) until claimed or assigned across channels. |
| FR-003 | System MUST always create a new session for any message arriving after a session is Resolved; prior session remains in Room History. |
| FR-004 | System MUST preserve quoted-reply context with preview \+ deeplink across sessions for group-capable channels, respecting retention. |
| FR-005 | System MUST render group metadata updates as system messages without altering session state/ownership/SLA. |
| FR-006 | Users (Admin/Supervisor/Agent) MUST be able to claim/assign/unassign/reassign/resolve/move/merge-link within team scope across channels. |
| FR-007 | System MUST carry over SLA across ownership changes and MUST NOT reset timers on reassign/unassign. |
| FR-008 | System MUST provide Room History (read-only) for Resolved sessions with linkages to related cases. |
| FR-009 | System MUST record audits for claim, assign, unassign, resolve, move, merge/link, identity switch, and new-session-after-resolution. |
| FR-010 | Ownership key MUST be conversation\_id; phone numbers MUST NOT be used as ownership keys in any flow (decoupling parity). |
| FR-011 | Sticky legacy binding: open conversations remain with their original team after number remaps; replies still possible (decoupling parity). |
| FR-012 | Closed legacy threads receiving inbound MUST prompt reopen routing per decoupling (default Keep in old team), while still creating a new session. |
| FR-013 | Team Inboxes MUST be optional; escalation-only inboxes (no inbound number) MUST support full operation for moved-in conversations. |
| FR-014 | For group-capable channels, System MUST bind a session identity (default \= number that received the opener) and MUST allow “Send as” override in the send area. |
| FR-015 | The “Send as” selector MUST preselect session identity, list only eligible identities for that group, show a confirmation badge after send, and write an audit event. |
| FR-016 | On move, assignee MUST reset to Unassigned and SLA MUST stop immediately; on reopen in same team, SLA resumes per policy; on move-and-reopen, a new SLA MAY start per target-team policy (Team Inbox v2.1 parity). |
| FR-017 | System SHOULD dedupe session creation per conversation context within a short time window. |
| FR-018 | System SHOULD expose omnichannel reporting dimensions: team, agent, status, channel, group, linked sessions. |

---

# **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Claim race conflict | Allow one success; others get toast; audit conflict. | “This conversation was taken by another agent.” |
| EH-002 | Unauthorized action | Block; keep state unchanged; audit attempt. | “You do not have permission for this action.” |
| EH-003 | History deeplink missing/expired | Show stub preview; keep related case link. | “Preview unavailable (beyond retention period).” |
| EH-004 | Invalid state transition | Keep current state; toast; audit. | “Action is invalid in the current status.” |
| EH-005 | Identity switch unavailable | Hide switcher or blocking toast. | “Sender identity not available for this conversation.” |
| EH-006 | Dedupe collision | Create one session; info toast. | “A similar session was created recently.” |
| EH-007 | Move failure (network/server) | Do not change ownership; present retry; audit error. | “Failed to move conversation. Please try again.” |
| EH-008 | Default sender unavailable | Force sender picker; block send until valid. | “Default sender is unavailable. Please choose another sender.” |

---

# **8\. Edge Cases**

| ID | Case | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | New message after resolution | Always new session; link previous case. | Banner: “New session created (related to \#ID).” |
| EC-002 | Quoted reply to very old message | Stub preview if beyond retention; keep case link. | “Preview unavailable (beyond retention period).” |
| EC-003 | Simultaneous bursts | Dedupe per conversation context; one session. | N/A |
| EC-004 | Group metadata storm | Collapse similar system events; no state change. | “Grouped group changes.” |
| EC-005 | Multi-number inbound via different number | Append to same session; outbound uses session identity unless overridden. | Info: “Using session identity: \+62…” |
| EC-006 | Identity override mid-session | Outbound uses chosen identity; audit; next new session resets default to opener receiver. | “Sender identity changed.” |
| EC-007 | Mapping flips during bursts | Route each inbound by mapping at arrival time; legacy-bound open threads append correctly. | N/A |
| EC-008 | Move to escalation-only inbox | Fully operable; sender picker shown if needed. | “Choose sender number.” |

---

# **9\. UI & UX Requirements**

| ID | Component | Description | UX Flow | UI Copy (English) | Linked US/FR |
| ----- | ----- | ----- | ----- | ----- | ----- |
| UI-001 | Conversation Header | Show channel, status, SLA, group name (if group), legacy badge, and move banner. | Open session \-\> inspect header \-\> act. | Legacy badge: “Legacy-bound to {number}”; Move banner: “Moved from {Old Team} to {New Team} by {User} at {Time}.” | FR-010, FR-011, FR-016 |
| UI-002 | Unassigned Queue | Team list of new sessions across channels. | List \-\> select \-\> claim/assign. | Empty: “No conversations yet”; Loading: “Loading...” ; Error: “Failed to load queue.” | FR-001, FR-002 |
| UI-003 | Decision Banner | New-session-after-resolution banner linking previous case. | After inbound post-Resolved. | “New session created (related to \#ID).” | FR-003 |
| UI-004 | Quoted Preview Card | Inline quoted preview with deeplink (group-capable). | Click preview \-\> open historical anchor. | “Replying to previous message” ; Link: “Open history” | FR-004 |
| UI-005 | Group System Messages | Non-blocking metadata events (group-capable). | Auto-injected; collapsible. | “Group name/icon/members updated.” | FR-005 |
| UI-006 | Send Area with “Send as” | Identity selection at send time (group-capable). | Compose \-\> choose identity \-\> Send. | Label: “Send as”; Confirmation badge: “Sent as \+62…”. | FR-014, FR-015 |
| UI-007 | Reopen Routing Modal | For closed legacy thread receiving inbound after remap. | Prompt choice \-\> apply \-\> audit. | Title: “Number mapping changed”; Primary (default): “Keep in {Old Team} (Recommended)”; Secondary: “Move to {New Team}”. | FR-012 |
| UI-008 | Move Dialog | Confirm effects and consent. | Open \-\> confirm \-\> move. | Title: “Move conversation”; Body: “Moving will preserve full history. Assignee will be reset to Unassigned and SLA will stop.” | FR-016 |

---

# **10\. Field & Validation**

| Field | Type | Rules | Validation & Constraints | Required |
| ----- | ----- | ----- | ----- | ----- |
| conversation\_id | String (UUID) | Immutable ownership key | Unique, non-empty | Yes |
| team\_owner\_id | String (UUID) | Set at creation; changes via move | Not null at creation; write-once except via move | Yes |
| sender\_of\_record | String (E.164 or channel sender ID) | Number/ID used when session was opened | Not null; archived allowed | Yes |
| legacy\_bound | Boolean (derived) | True iff session is OPEN and sender\_of\_record maps to another team now | Derived only | Derived |
| status | Enum | Unassigned, Assigned, Resolved | Valid transitions only; audited | Yes |
| assignee\_id | String (UUID) / null | Current agent | Resets to null on move; must be valid user | No |
| sla\_state | Enum | running, paused, stopped | Stop on move; resume on reopen in same team per policy | Yes |
| last\_success\_sender | String | Sender last used to send | If missing/unavailable, force sender picker | No |
| mapping\_version\_at\_open | String/Int | Snapshot for debugging | Read-only | No |

---

# **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Availability | 99.5% monthly for session workflows. |
| Performance | Unassigned list \< 2s p95; open session \< 2s p95; move end-to-end ≤ 1.5s p95 (excluding audit retry). |
| Reliability | No duplicate session creation per context within dedupe window; move success ≥ 99.8%. |
| Security | RBAC per tenant; all actions audited (who/when/from/to/number/conversation\_id). |
| Observability | Parity dashboards, identity-switch usage, legacy-bound counts, SLA stop/resume health. |
| Accessibility | WCAG 2.1 AA for contrast/keyboard. |

---

# **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Dependency | Team Inbox (optional) | Role/scope inconsistencies | Align actions to team scope; audit all. |
| Dependency | SLA engine | Stop/resume drift on move | Idempotent stop; compensating jobs; health checks. |
| Dependency | Number–Team Mapping | Misrouting during remaps | “New chats only” rule; default-team fallback; admin alerts. |
| Risk | Parity drift across channels | Inconsistent UX | Parity checklist gating and QA suite. |
| Risk | Identity ambiguity | Wrong “from” identity | Session-bound identity \+ “Send as”; confirmation badge \+ audit. |

---

# **13\. Success Metrics**

| KPI | Target | Window |
| ----- | ----- | ----- |
| Parity checklist pass rate | 100% | GA |
| Median claim time | \< 60s | 30 days |
| Valid quoted preview rate | ≥ 99% | 30 days |
| Identity ambiguity incidents | 0 critical | 30 days |
| SLA stop on move within 2s | ≥ 99.5% | 30 days |

---

# **14\. Future Considerations**

| Item | Rationale |
| ----- | ----- |
| Optional agent limits/timeouts | Progressive controls without changing defaults. |
| Auto-triage rules | Faster routing and prioritization. |
| Cross-channel linked cases | Deeper analytics and case consolidation. |

---

# **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Retention may hide historical previews | Stub preview only. |
| Group deltas apply only to group-capable channels | Parity limited on channels without group semantics. |

---

# **16\. Appendix**

| Subsection | Content |
| ----- | ----- |
| 16.1 State Machine | Unassigned \-\> Assigned \-\> Resolved; Resolved \-\> New inbound \=\> New Unassigned session; Move resets assignee to Unassigned and stops SLA; Reopen routing for closed legacy threads per decoupling (modal) while still creating a new session. |
| 16.2 Routing Matrix (Open vs Closed vs New) | Open \+ same mapping: append; Open \+ different mapping: append (legacy-bound); Closed \+ different mapping: show reopen routing modal (default keep old team) and create a new session; None: create new in current owner team; Mapping invalid: route to Default Team. |
| 16.3 Reporting Dimensions | Team, agent, status, channel, group, linked sessions, legacy-bound flags. |

