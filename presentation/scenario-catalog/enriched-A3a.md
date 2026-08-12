# Conversation Scenario Catalog — SC-SESSIONS: Chat Sessions (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Source:** `PRD/Conversationv2/PRD Ticket - Omnichannel Chat Sessions (Group Handling + Multi-number Send as).md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv` (SIX-Convo-001..725)

---

### SC-SESSIONS-001 — New message with no open session creates new session in Unassigned
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001
- **Pre-condition:** Customer has no open session; agent logged in
- **Steps:**
  1. Send a WhatsApp message from test phone to linked number (no prior open session)
  2. Navigate to `/id/conversation/your-inbox`
  3. Verify `[data-cy="inbox-nav-unassigned"]` shows incremented counter
  4. Click Unassigned tab; verify new conversation appears in `[data-cy="chat-list-1"]`
  5. Open conversation; verify `[data-cy="Chat-Room-Header"]` shows status "Unassigned"
- **Expected Result:** New session created in Unassigned; opener message bound to session; SLA countdown starts (PRD §5 US-001, §6 FR-001)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-002 — Burst arrivals within dedupe window create only one session
- **Type:** Edge | **Priority:** P0 | **Source:** US-001, FR-017
- **Pre-condition:** Customer has no open session; automation capable of sending rapid burst
- **Steps:**
  1. Send 5 WhatsApp messages within 2 seconds from test phone
  2. Navigate to `/id/conversation/your-inbox` → Unassigned
  3. Verify only ONE new conversation appears in `[data-cy="conversation-list"]`
  4. Open conversation; verify all 5 messages present in `[data-cy="Messages-Container"]`
- **Expected Result:** Dedupe window collapses burst into single session; no duplicate sessions (PRD §5 US-001 AC-2, §6 FR-017)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-003 — New session appears in team's Unassigned list
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Pull-system enabled; new inbound message triggers session creation
- **Steps:**
  1. Trigger new session (send message via test phone)
  2. Navigate to `/id/conversation/your-inbox` → click `[data-cy="inbox-nav-unassigned"]`
  3. Verify new session appears at top of `[data-cy="conversation-list"]`
  4. Verify status badge shows "Unassigned"
- **Expected Result:** Session appears in Unassigned list with status "Unassigned" per pull-system (PRD §5 US-002, §6 FR-002)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-004 — Opening Unassigned session shows channel, status, group, SLA summary
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** At least one Unassigned session exists (group-capable channel preferred)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox` → Unassigned tab
  2. Click on an Unassigned session
  3. Verify `[data-cy="Chat-Detail-Title"]` shows conversation identity
  4. Verify `[data-cy="Chat-Detail-Section-session"]` shows channel, status "Unassigned"
  5. Verify `[data-cy="Chat-Detail-Section-group-member"]` visible if group
  6. Verify `[data-cy="Chat-Detail-Sla-frt"]` shows FRT countdown
- **Expected Result:** Detail panel shows channel, status, group info (if applicable), and SLA summary (PRD §5 US-002 AC-2)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-005 — New message after Resolved creates new Unassigned session
- **Type:** State | **Priority:** P0 | **Source:** US-003, FR-003
- **Pre-condition:** Conversation has a Resolved session
- **Steps:**
  1. Resolve an active session via `[data-cy="chatRoom-closeConversationButton"]`
  2. Send a new WhatsApp message from test phone to same conversation
  3. Navigate to Unassigned; verify NEW session appears in `[data-cy="conversation-list"]`
  4. Open new session; verify banner "New session created (related to #ID)" per UI-003
  5. Open Room History; verify prior Resolved session is present and read-only
- **Expected Result:** New Unassigned session created; prior session stays in Room History read-only (PRD §5 US-003, §6 FR-003, EC-001)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-006 — New session links to related previous session in Chat History
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-003
- **Pre-condition:** New session created after resolution (from SC-SESSIONS-005)
- **Steps:**
  1. Open new Unassigned session
  2. Verify `[data-cy="Chat-Detail-Section-history"]` shows linked previous session
  3. Click linked session; verify it opens Room History with prior messages
- **Expected Result:** New session has link to prior session; Chat History Room navigable (PRD §5 US-003 AC-2)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-007 — Agent pulling Unassigned session claims it; race condition handled
- **Type:** Edge | **Priority:** P0 | **Source:** US-004
- **Pre-condition:** One Unassigned session; two agents logged in simultaneously
- **Steps:**
  1. Agent A and Agent B both view Unassigned tab
  2. Both click "Assign to Me" / pull the same session simultaneously
  3. Verify exactly one agent succeeds; session moves to their inbox
  4. Verify other agent sees toast "This conversation was taken by another agent" (EH-001)
  5. Verify audit log records both attempt and success
- **Expected Result:** Exactly one claim succeeds; other gets conflict toast (PRD §5 US-004, §7 EH-001)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-008 — Assign/unassign/reassign updates ownership with SLA carry-over and audit
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-006
- **Pre-condition:** Active session assigned to Agent A
- **Steps:**
  1. Open conversation assigned to Agent A
  2. Via detail panel `[data-cy="Chat-Detail-Section-assignee"]`, reassign to Agent B
  3. Verify assignee changes to Agent B
  4. Verify `[data-cy="Chat-Detail-Sla-frt"]` and `[data-cy="Chat-Detail-Sla-ttc"]` continue counting (no reset)
  5. Verify `[data-cy="Chat-Detail-Section-events"]` shows reassignment audit entry
  6. Unassign; verify assignee shows "Unassigned" label
- **Expected Result:** Ownership updates; SLA carries over (no reset); audit logged (PRD §5 US-005, §6 FR-006, FR-007)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-009 — Assign/unassign/reassign UX consistent across channels
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-006
- **Pre-condition:** Conversations from WhatsApp, Live Chat, IG exist
- **Steps:**
  1. Open a WhatsApp conversation; perform assign → verify `[data-cy="Assign-Conversation-Modal"]` appears
  2. Repeat assign flow on Live Chat conversation; verify same modal and controls
  3. Repeat on IG conversation; verify same modal and controls
  4. Verify all three produce identical UX: same modal, same fields, same confirmation
- **Expected Result:** Identical assign/unassign/reassign UX across all channels (PRD §5 US-005 AC-2)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-010 — Resolving session changes to Resolved, moves to Room History
- **Type:** State | **Priority:** P0 | **Source:** US-006
- **Pre-condition:** Active assigned session exists
- **Steps:**
  1. Open assigned conversation
  2. Click `[data-cy="chatRoom-closeConversationButton"]`
  3. Verify status changes to "Resolved"
  4. Verify session moves to Room History with timestamp
  5. Verify `[data-cy="Chat-Detail-Section-events"]` shows resolve event with timestamp
- **Expected Result:** Session status → Resolved; moves to Room History; timestamp recorded (PRD §5 US-006)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-011 — Opening Resolved session shows it read-only
- **Type:** Positive | **Priority:** P0 | **Source:** US-006
- **Pre-condition:** A Resolved session exists in Room History
- **Steps:**
  1. Navigate to Room History and open a Resolved session
  2. Verify `[data-cy="Input-Area-Disabled"]` is visible (input disabled)
  3. Verify `[data-cy="Message-Text-Input"]` is not editable
  4. Verify `[data-cy="Send-Button"]` is disabled or hidden
- **Expected Result:** Resolved session is read-only; message input and send disabled (PRD §5 US-006 AC-2)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-012 — Quoted inbound context preserved across sessions with deeplink
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-004
- **Pre-condition:** Customer sends quoted reply to a previous message in group-capable channel
- **Steps:**
  1. Customer replies with quote to an earlier message
  2. Open new session; verify quoted preview card appears in `[data-cy="Messages-Container"]`
  3. Verify preview shows original message snippet
  4. Click deeplink; verify it navigates to historical anchor in Room History
- **Expected Result:** Quoted preview displayed with deeplink to historical message (PRD §5 US-007, §6 FR-004, UI-004)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-013 — Quoted reply to very old message shows stub preview
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, EC-002
- **Pre-condition:** Original quoted message is beyond retention period
- **Steps:**
  1. Customer replies with quote to a message older than retention policy
  2. Open session; verify quoted area shows stub preview text "Preview unavailable (beyond retention period)"
  3. Verify case link still present even though preview is unavailable
- **Expected Result:** Stub preview for expired content; case link preserved (PRD §8 EC-002, §7 EH-003)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-014 — Group metadata changes inject system message without changing state
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-005
- **Pre-condition:** Active session in WhatsApp group; admin changes group name/icon/participant
- **Steps:**
  1. In WhatsApp group, change the group subject name
  2. Open conversation room; verify system message appears in `[data-cy="Messages-Container"]` (e.g. "Group name updated")
  3. Verify `[data-cy="Utility-Separator"]` or system bubble rendered
  4. Verify session status, assignee, SLA remain unchanged
  5. Repeat for icon change and participant add/remove
- **Expected Result:** System messages injected; no state/routing/SLA change (PRD §5 US-008, §6 FR-005, UI-005)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-015 — Frequent group metadata changes collapse similar events
- **Type:** Edge | **Priority:** P0 | **Source:** US-008, EC-004
- **Pre-condition:** Group with rapid metadata changes (e.g. multiple member adds/removes within minutes)
- **Steps:**
  1. Trigger 10+ group metadata changes within 2 minutes
  2. Open conversation room
  3. Verify events are grouped/collapsed rather than shown individually
  4. Verify collapsed text reads "Grouped group changes" or similar
- **Expected Result:** Similar system events collapsed to reduce noise (PRD §8 EC-004)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-016 — Session identity defaults to number that received opener message
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-014
- **Pre-condition:** Multiple WhatsApp numbers connected; group has both numbers as participants
- **Steps:**
  1. Send message to group addressed to Number A
  2. Open new session
  3. Verify `[data-cy="Account-Channel-Selector"]` shows Number A as default
  4. Verify detail panel `[data-cy="Chat-Detail-Section-session"]` shows session identity = Number A
- **Expected Result:** Session identity = number that received opener; displayed in send area and detail (PRD §5 US-009, §6 FR-014)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-017 — Later inbound via different number appends to same session
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, EC-005
- **Pre-condition:** Active session with identity = Number A; Number B also in same group
- **Steps:**
  1. In existing session, send a message that arrives via Number B (different connected number)
  2. Verify message appends to existing session (no new session created)
  3. Verify `[data-cy="Number-Change-Separator"]` or info indicator appears
  4. Verify outbound still uses session identity (Number A) unless overridden
- **Expected Result:** Message appends to same session; outbound uses session identity unless overridden (PRD §8 EC-005)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-018 — "Send as" selector preselects session identity, lists eligible identities
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-015
- **Pre-condition:** Group session with multiple eligible connected numbers
- **Steps:**
  1. Open group conversation room
  2. Locate `[data-cy="Account-Channel-Selector"]` in send area
  3. Verify session identity is preselected
  4. Click dropdown; verify only eligible identities for this group are listed
  5. Verify label reads "Send as" per UI-006
- **Expected Result:** "Send as" selector shows session identity preselected; lists eligible identities only (PRD §5 US-010, §6 FR-015, UI-006)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-019 — Changing identity at send time uses chosen identity with audit
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-015
- **Pre-condition:** Group session open; "Send as" selector available
- **Steps:**
  1. Open group conversation; click `[data-cy="Account-Channel-Selector"]`
  2. Select a different identity (e.g. Number B instead of default Number A)
  3. Type message in `[data-cy="Message-Text-Input"]`; click `[data-cy="Send-Button"]`
  4. Verify confirmation badge "Sent as +62…" appears on sent message
  5. Verify `[data-cy="Chat-Detail-Section-events"]` shows identity switch audit entry
- **Expected Result:** Message sent from chosen identity; confirmation badge shown; audit logged (PRD §5 US-010 AC-2, §6 FR-015)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-020 — SLA does not reset on reassign/unassign; inherited timing visible
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-007
- **Pre-condition:** Active session with running SLA; already 5 minutes into SLA
- **Steps:**
  1. Note current SLA value from `[data-cy="Chat-Detail-Sla-frt"]`
  2. Reassign session to different agent
  3. Verify SLA continues from same value (no reset to zero)
  4. Verify `[data-cy="Chat-Detail-Section-events"]` records reassignment with SLA continuity
- **Expected Result:** SLA carries over; no reset on ownership change (PRD §5 US-011, §6 FR-007)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-021 — SLA breach attribution follows team responsible at breach time
- **Type:** Positive | **Priority:** P0 | **Source:** US-011
- **Pre-condition:** Session assigned to Team A; SLA about to breach
- **Steps:**
  1. Allow SLA to breach while session is with Team A
  2. Move session to Team B after breach
  3. Verify breach attribution in reports shows Team A (team responsible at breach time)
- **Expected Result:** SLA breach credited to team that held session when breach occurred (PRD §5 US-011 AC-2)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-022 — Open conversations remain with original team after number remap
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-010, FR-011
- **Pre-condition:** Open conversation with sender_of_record bound to Number A; Number A remapped to Team B
- **Steps:**
  1. Admin remaps Number A from Team A to Team B in settings
  2. Verify open conversation stays with Team A (legacy-bound)
  3. Open conversation; verify header shows legacy badge "Legacy-bound to {number}" per UI-001
  4. Verify agent can still reply normally
- **Expected Result:** Open conversations remain with original team; legacy badge shown; replies work (PRD §5 US-012, §6 FR-010, FR-011)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-023 — Closed thread after remap shows reopen routing modal and creates new session
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-012
- **Pre-condition:** Closed conversation with sender_of_record; number remapped since closure
- **Steps:**
  1. Customer sends new message to old closed thread after remap
  2. Verify reopen routing modal appears per UI-007
  3. Verify default selection is "Keep in {Old Team} (Recommended)"
  4. Select "Keep in old team"; confirm
  5. Verify new session created and conversation stays in old team
  6. Repeat with "Move to {New Team}"; verify new session created in new team
- **Expected Result:** Reopen routing modal shown; new session created regardless of choice (PRD §5 US-012, §6 FR-012, UI-007)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-024 — On move: assignee resets to Unassigned, SLA stops immediately
- **Type:** State | **Priority:** P0 | **Source:** FR-016
- **Pre-condition:** Active session assigned to Agent A with running SLA
- **Steps:**
  1. Note current assignee and SLA state
  2. Move conversation to different team via move dialog (UI-008)
  3. Verify assignee resets to "Unassigned" / null
  4. Verify SLA state changes to "stopped" immediately
  5. Verify move dialog confirmed: "Assignee will be reset to Unassigned and SLA will stop"
- **Expected Result:** Assignee → null; SLA stops on move (PRD §6 FR-016, UI-008)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-025 — On reopen in same team: SLA resumes per policy
- **Type:** State | **Priority:** P0 | **Source:** FR-016
- **Pre-condition:** Session moved (SLA stopped); now reopened in same team
- **Steps:**
  1. After move (SLA stopped), customer sends new message
  2. Verify SLA resumes counting per team policy
  3. Verify `[data-cy="Chat-Detail-Sla-frt"]` or `[data-cy="Chat-Detail-Sla-ttc"]` shows running state
- **Expected Result:** SLA resumes per policy on reopen in same team (PRD §6 FR-016)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-026 — Escalation-only inbox fully operable for moved-in conversations
- **Type:** Positive | **Priority:** P1 | **Source:** US-014, FR-013
- **Pre-condition:** Team Inbox with no inbound number (escalation-only)
- **Steps:**
  1. Move a conversation into escalation-only inbox
  2. Verify conversation is fully operable (messages visible, detail accessible)
  3. Attempt to reply; verify sender picker appears (no default sender)
  4. Select a valid sender; send message; verify sent successfully
  5. Verify no new conversations auto-create in this inbox from external inbound
- **Expected Result:** Escalation-only inbox operable; sender picker shown when no default; no auto-creation (PRD §5 US-014, §6 FR-013, EC-008)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-027 — Claim race conflict shows toast
- **Type:** Negative | **Priority:** P0 | **Source:** EH-001
- **Pre-condition:** Unassigned session; two agents attempt claim simultaneously
- **Steps:**
  1. Agent A and Agent B both open Unassigned tab viewing same session
  2. Both click "Assign to Me" within <1s of each other
  3. Verify losing agent sees toast: "This conversation was taken by another agent."
  4. Verify losing agent's session list refreshes (session removed from their Unassigned view)
  5. Verify audit records conflict attempt
- **Expected Result:** One agent succeeds; other gets conflict toast; audit logged (PRD §7 EH-001)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-028 — Unauthorized action blocked with permission toast
- **Type:** Negative | **Priority:** P0 | **Source:** EH-002
- **Pre-condition:** Agent role without permission for specific action (e.g. Agent trying to move to another team)
- **Steps:**
  1. Log in as Agent (limited permissions)
  2. Attempt an unauthorized action (e.g., move conversation to another team)
  3. Verify toast appears: "You do not have permission for this action."
  4. Verify session state unchanged (no ownership/status change)
  5. Verify audit log records unauthorized attempt
- **Expected Result:** Action blocked; state unchanged; toast shown; audit logged (PRD §7 EH-002)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-029 — Invalid state transition keeps current state with toast
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Session in a state where requested transition is invalid (e.g. resolving already Resolved session)
- **Steps:**
  1. Open a Resolved session
  2. Attempt to resolve it again (or perform invalid state transition)
  3. Verify toast: "Action is invalid in the current status."
  4. Verify session remains in current state
  5. Verify audit records invalid attempt
- **Expected Result:** Current state preserved; toast shown; audit logged (PRD §7 EH-004)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-030 — Default sender unavailable forces sender picker; blocks send
- **Type:** Negative | **Priority:** P0 | **Source:** EH-008
- **Pre-condition:** Session with default sender that has become unavailable (disconnected/removed)
- **Steps:**
  1. Open conversation where default sender identity is unavailable
  2. Verify send area shows sender picker automatically (not preselected identity)
  3. Attempt to send without selecting a sender; verify send is blocked
  4. Verify toast: "Default sender is unavailable. Please choose another sender."
  5. Select valid sender from `[data-cy="Account-Channel-Selector"]`; send; verify success
- **Expected Result:** Sender picker forced on; send blocked until valid sender selected (PRD §7 EH-008)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
