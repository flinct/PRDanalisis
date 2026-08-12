# Conversation Scenario Catalog — A1: Inbox Navigation + Team Inbox Navigation + Chat List (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:** `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Inbox Navigation.md`, `PRD Ticket - Omnichannel Inbox - Team Inbox Navigation.md`, `PRD Ticket - Omnichannel Inbox - Chat List.md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv` (SIX-Convo-001..725)

---

## PRD Ticket — Omnichannel Inbox — Inbox Navigation (SC-INBOXNAV, 24 scenarios)

---

### SC-INBOXNAV-001 — Sidebar displays all main navigation items
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in, conversation page loaded
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify `[data-cy="Conversation-Sidebar-Navigation"]` is visible
  3. Verify `[data-cy="inbox-nav-your-inbox"]` is present and labeled "Your Inbox"
  4. Verify `[data-cy="inbox-nav-unassigned"]` is present and labeled "Unassigned"
  5. Verify `[data-cy="inbox-nav-all"]` is present and labeled "All Conversation"
  6. Verify `[data-cy="inbox-nav-starred"]` is present and labeled "Starred"
  7. Verify `[data-cy="inbox-nav-spam"]` is present and labeled "Spam"
  8. Verify Closed item is present in sidebar
- **Expected Result:** All 6 main navigation items (Your Inbox, Unassigned, Closed, All Conversation, Starred, Spam) are visible in the sidebar
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-002 — Instant tab switching completes in <1s
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in, on Your Inbox tab
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Note current chat list content under `[data-cy="conversation-list"]`
  3. Click `[data-cy="inbox-nav-unassigned"]`
  4. Measure time until `[data-cy="conversation-list"]` content updates
  5. Verify switch completes in <1 second
- **Expected Result:** Tab switch completes in <1s; chat list updates to show unassigned conversations without page reload
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-003 — Starred items synced across team via DB
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Two agents (Agent A, Agent B) logged in simultaneously
- **Steps:**
  1. Agent A: navigate to `/id/conversation/your-inbox`
  2. Agent A: star a conversation via `[data-cy="chat-list-1-starred-icon"]` or quick-action → Star
  3. Agent B: navigate to `[data-cy="inbox-nav-starred"]`
  4. Verify the starred conversation appears in Agent B's Starred tab
- **Expected Result:** Starred conversation by Agent A is visible in Agent B's Starred tab; sync via DB
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-004 — Agent can filter inbox by channel
- **Type:** Positive | **Priority:** P0 | **Source:** US-02
- **Pre-condition:** Agent logged in; workspace has WhatsApp, Live Chat, and IG conversations
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Click `[data-cy="chatList-filter-status"]` or channel filter
  3. Select "WhatsApp" channel
  4. Verify only WhatsApp conversations appear in `[data-cy="conversation-list"]`
  5. Verify each row shows `[data-cy="chat-list-N-channel-icon"]` with WhatsApp icon
- **Expected Result:** Only WhatsApp conversations displayed; channel filter applied correctly
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-005 — Agent can add, edit, and remove tags; tags persist across channels
- **Type:** Positive | **Priority:** P0 | **Source:** US-03
- **Pre-condition:** Agent logged in; conversation with no tags exists
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open a conversation in `[data-cy="conversation-list"]`
  3. In detail panel, locate `[data-cy="Chat-Detail-Section-tags"]`
  4. Add tag "VIP" — verify tag appears as chip
  5. Edit tag to "Priority" — verify tag text updates
  6. Remove tag — verify tag removed
  7. Navigate to same conversation on a different channel view — verify tag persists
- **Expected Result:** Tags add/edit/remove successfully; changes persist across channel views
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-006 — Agent can log in and manage multiple WhatsApp numbers
- **Type:** Positive | **Priority:** P0 | **Source:** US-04
- **Pre-condition:** Workspace has 2+ WhatsApp numbers linked
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify session switcher or `[data-cy="Account-Channel-Selector"]` visible
  3. Switch from WhatsApp #1 to WhatsApp #2
  4. Verify conversations list updates to #2's chats
  5. Switch back — verify list restores
- **Expected Result:** Multiple WhatsApp numbers manageable from same dashboard; switching updates conversation list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-007 — Group conversations appear in inbox and can be managed
- **Type:** Positive | **Priority:** P0 | **Source:** US-05
- **Pre-condition:** Agent has access to a WhatsApp Group conversation
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Locate a WhatsApp Group conversation in `[data-cy="conversation-list"]`
  3. Verify group name and sender shown in preview via `[data-cy="chat-list-N-name"]`
  4. Open conversation — verify participant list visible in `[data-cy="Chat-Detail-Section-group-member"]`
  5. Verify group messages display sender name via `[data-cy="Message-Sender-Info"]`
- **Expected Result:** Group conversations appear and are manageable like 1:1 chats; participant list and sender names visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-008 — Agent notified when WhatsApp session is disconnected or unstable
- **Type:** Positive | **Priority:** P0 | **Source:** US-06
- **Pre-condition:** Agent online with active WhatsApp session
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Disconnect WhatsApp session (kill backend socket or disconnect device)
  3. Verify disconnection banner or notification appears within 10 seconds
  4. Verify degraded network indicator shown for unstable connections (throttle to 50kbps)
  5. Verify indicator is distinct from full disconnection
- **Expected Result:** Agent receives notification within 10s when session disconnects or becomes unstable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-009 — Data from one company/environment not visible to other companies/environments
- **Type:** Permission | **Priority:** P0 | **Source:** US-07
- **Pre-condition:** Agent logged into Company A Dev environment
- **Steps:**
  1. Login as Company A agent
  2. Navigate to `/id/conversation/your-inbox`
  3. Verify only Company A conversations visible
  4. Attempt to access Company B data via direct URL manipulation
  5. Verify access blocked — "Akses ditolak" or redirect
- **Expected Result:** Cross-company/environment access blocked; only own company data visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-010 — Agent receives real-time notifications for new incoming messages
- **Type:** Positive | **Priority:** P0 | **Source:** US-08
- **Pre-condition:** Agent on conversation page; browser not muted
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Send message from customer phone to linked number
  3. Verify new conversation bubbles to top of `[data-cy="conversation-list"]` within 3s
  4. Verify browser tab title changes (e.g., "(1) SatuInbox")
  5. Verify audio notification plays
  6. Verify unread badge increments
- **Expected Result:** Real-time notification via socket: list update, tab title, audio, and badge increment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-011 — Sensitive fields masked for non-admin roles
- **Type:** Permission | **Priority:** P1 | **Source:** US-09
- **Pre-condition:** Agent logged in (non-admin); conversation with phone number exists
- **Steps:**
  1. Login as regular Agent (non-admin)
  2. Navigate to `/id/conversation/your-inbox`
  3. Open a conversation — verify phone shows masked (e.g., 08xxxx1234) in `[data-cy="chat-list-N-account-channel-number"]`
  4. Login as Admin — verify same phone shows full number
- **Expected Result:** Non-admin sees masked phone (08xxxx1234); Admin sees full number
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-012 — Agent can capture chat screenshots and send to SAP
- **Type:** Positive | **Priority:** P1 | **Source:** US-10
- **Pre-condition:** SAP screenshot add-on enabled for workspace
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open a conversation
  3. Verify screenshot button visible in room header
  4. Click screenshot — verify `[data-cy="modal-screenshot-container"]` appears
  5. Confirm send — verify SAP confirmation toast
- **Expected Result:** Screenshot captured and sent to SAP; confirmation logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-013 — Presence status visible for team members
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Multiple agents online
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify presence indicators on agent avatars (green = Active, yellow = Away)
  3. Change own status to Away — verify indicator updates
  4. Verify other agents see updated status within 3s
- **Expected Result:** Presence status (Active, Away, On Break) visible and synced in real-time via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-014 — System auto-archives/deletes chats based on retention policy
- **Type:** Positive | **Priority:** P2 | **Source:** US-12
- **Pre-condition:** Workspace with retention policy active (6-month archive, 12-month delete)
- **Steps:**
  1. Verify conversations older than 6 months are archived (not in active inbox)
  2. Search for archived conversation — verify retrievable within 3s
  3. Verify conversations older than 12 months are deleted
  4. Verify audit log records archive/delete actions
- **Expected Result:** 6-month auto-archive, 12-month auto-delete enforced; archived retrievable; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-015 — Agent can convert conversation into ticket; ticket linked back
- **Type:** Positive | **Priority:** P2 | **Source:** US-13
- **Pre-condition:** Agent viewing active conversation
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open a conversation
  3. Right-click or use action menu → "Create Ticket"
  4. Fill ticket form in `[data-cy="Create-Ticket-Modal"]` and submit
  5. Verify ticket created with reference ID
  6. Verify conversation shows ticket badge via `[data-cy="chat-list-N-ticket-badge"]`
- **Expected Result:** Ticket created and auto-linked to conversation; bidirectional reference visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-016 — Broadcast messages can be sent across multiple channels
- **Type:** Positive | **Priority:** P2 | **Source:** US-14
- **Pre-condition:** Agent with broadcast permission; multiple channels connected
- **Steps:**
  1. Navigate to broadcast feature
  2. Select multiple channels (WhatsApp, Live Chat)
  3. Compose and send broadcast message
  4. Verify delivery log shows recipients and results per channel
- **Expected Result:** Broadcast sent across channels; recipients and results logged per channel
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-017 — Team Inbox management (CRUD + Reorder) for Admin/Supervisor
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Admin/Supervisor logged in
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Click "+ Create Team Inbox" in sidebar
  3. Fill Name "Tim Test", assign agents, save
  4. Verify new Team Inbox appears in sidebar as `[data-cy="team-N"]`
  5. Right-click team inbox → Rename → "Tim Test 2" — verify update
  6. Right-click → Duplicate — verify copy created with SLA/tags/members
  7. Right-click → Delete — confirm — verify removal
  8. Drag to reorder — verify new position saved
- **Expected Result:** Full CRUD + Reorder works for Admin/Supervisor; changes propagate live via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-018 — Team Inbox delete requires confirmation dialog
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Admin logged in; Team Inbox exists
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Right-click on a Team Inbox in sidebar
  3. Select "Delete"
  4. Verify confirmation dialog appears
  5. Click "Cancel" — verify Team Inbox NOT deleted
  6. Repeat → Click "Confirm" — verify Team Inbox deleted
- **Expected Result:** Delete requires confirmation; cancel aborts; confirm deletes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-019 — Team Inbox changes propagate live via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Two agents (Admin + Agent) logged in simultaneously
- **Steps:**
  1. Admin: create new Team Inbox "Live Test"
  2. Agent: verify new Team Inbox appears in sidebar without page refresh within 3s
  3. Admin: rename to "Live Test 2"
  4. Agent: verify name updates in sidebar without refresh
- **Expected Result:** Team Inbox CRUD changes propagate to all connected agents via socket in real-time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-020 — Drag & drop chat to Team Inbox with confirmation prompt
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in; chat in Your Inbox; Team Inbox exists
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Drag a conversation from `[data-cy="chat-list-1"]`
  3. Drop onto a Team Inbox `[data-cy="team-1"]` in sidebar
  4. Verify confirmation prompt appears
  5. Confirm — verify chat moved to Team Inbox
- **Expected Result:** Drag & drop moves chat to Team Inbox after confirmation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-021 — Multi-select batch assign/handover via checkbox selection
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in; multiple unassigned chats exist
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox` → Unassigned
  2. Select multiple chats via `[data-cy="chat-list-N-checkbox"]` (check 3 chats)
  3. Verify bulk action toolbar appears with selected count "3 selected"
  4. Click "Assign" → select agent → submit via `[data-cy="Assign-Modal-Submit-Button"]`
  5. Verify all 3 chats assigned
- **Expected Result:** Multi-select allows batch assign; all selected chats assigned successfully
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-022 — Rollback on failed assignment; log event
- **Type:** Negative | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in; simulate API failure (network disconnect)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Attempt to assign a chat to Team Inbox
  3. Simulate network failure during assignment
  4. Verify toast "Gagal assign/handover." appears
  5. Verify chat remains in original location (rollback)
  6. Verify failure event logged
- **Expected Result:** Failed assignment rolls back; toast "Gagal assign/handover." shown; event logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-023 — Unread counters (red badge) update in real-time; Total counter normal
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in; Your Inbox selected
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Note current unread badge count on sidebar items
  3. Send message from customer phone
  4. Verify unread red badge increments on relevant sidebar item within 2s
  5. Verify total counter updates in normal font
  6. Hover counter — verify tooltip shows breakdown (Unassigned, Ongoing, Resolved)
- **Expected Result:** Unread red badge increments via socket in ≤2s; total counter updates; tooltip shows breakdown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-024 — Scroll position and filters saved per inbox in cookies/local storage
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Scroll down to mid-list position
  3. Apply channel filter (e.g., WhatsApp only)
  4. Switch to Starred tab
  5. Switch back to Your Inbox
  6. Verify scroll position restored to mid-list
  7. Verify WhatsApp filter still active
  8. Hard-refresh (Ctrl+Shift+R) — verify both restored from cookies/local storage
- **Expected Result:** Scroll position and filter state saved per inbox; restored on revisit and hard-refresh
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket — Omnichannel Inbox — Team Inbox Navigation (SC-TEAMNAV, 28 scenarios)

---

### SC-TEAMNAV-001 — "+ Team Inbox" button in sidebar opens inline creation modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Admin/Supervisor logged in
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Scroll to Team Inboxes section in sidebar
  3. Verify "+ Team Inbox" button visible (Admin/Supervisor only)
  4. Click "+ Team Inbox"
  5. Verify inline creation modal appears with fields: Name, Tags, SLA, Supervisors, Members
- **Expected Result:** "+ Team Inbox" button visible for Admin/Supervisor; clicking opens creation modal with all required fields
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-002 — Creation form has all required fields
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Creation modal open (from SC-TEAMNAV-001)
- **Steps:**
  1. Verify "Nama Team Inbox" field (max 50 chars, alphanumeric/spaces)
  2. Verify "Tags" multi-select field (optional, max 10)
  3. Verify "SLA First Response" composite field (days/hours/minutes)
  4. Verify "SLA Resolution" composite field (days/hours/minutes)
  5. Verify "Supervisors" multi-select dropdown (required, min 1)
  6. Verify "Members" multi-select dropdown (optional)
- **Expected Result:** All 6 fields present with correct types and constraints
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-003 — Save adds Team Inbox to sidebar instantly
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Creation modal open with valid data filled
- **Steps:**
  1. Fill Name: "Tim Penjualan"
  2. Add 1 Supervisor, 1 Member
  3. Click Save/Submit
  4. Verify modal closes
  5. Verify "Tim Penjualan" appears in sidebar as `[data-cy="team-N"]` instantly
- **Expected Result:** Team Inbox saved and visible in sidebar immediately; modal closes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-004 — Duplicate Team Inbox name shows "Nama sudah ada"
- **Type:** Negative | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Team Inbox "Tim Penjualan" already exists
- **Steps:**
  1. Open "+ Team Inbox" creation modal
  2. Fill Name: "Tim Penjualan" (duplicate)
  3. Fill valid Supervisor
  4. Click Save
  5. Verify error message "Nama sudah ada" appears on Name field
  6. Verify save blocked
- **Expected Result:** Duplicate name blocked; error "Nama sudah ada" shown; form not submitted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-005 — Supervisor can add/remove members; role-based chat visibility
- **Type:** Permission | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Team Inbox with Supervisor and Member assigned
- **Steps:**
  1. Login as Supervisor
  2. Open Team Inbox → verify all chats visible (assigned + unassigned)
  3. Login as Member
  4. Open same Team Inbox — verify only assigned chats visible
  5. As Supervisor: add new Member to Team Inbox — verify member added
  6. Remove Member — verify removed
- **Expected Result:** Supervisor sees all chats; Member sees assigned only; add/remove members works
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-006 — Role changes sync in real-time across users
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Supervisor and Member both online
- **Steps:**
  1. Supervisor: add Agent C as Member to Team Inbox
  2. Member: verify Agent C appears in member list without refresh
  3. Supervisor: remove Agent C
  4. Member: verify Agent C removed from list without refresh
- **Expected Result:** Role changes propagate via socket to all connected users in real-time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-007 — Invalid user in role assignment shows "Pengguna tidak ditemukan"
- **Type:** Negative | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Team Inbox edit modal open
- **Steps:**
  1. Open Team Inbox edit → Members section
  2. Search for non-existent user "xyznonexistent999"
  3. Verify error message "Pengguna tidak ditemukan" shown
  4. Verify save blocked until valid user selected
- **Expected Result:** Invalid user search shows "Pengguna tidak ditemukan"; assignment blocked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-008 — RBAC blocks unauthorized role changes
- **Type:** Permission | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Regular Agent logged in (non-Admin, non-Supervisor)
- **Steps:**
  1. Login as regular Agent
  2. Navigate to Team Inbox in sidebar
  3. Verify no "Edit" or "Manage Members" option visible
  4. Attempt direct API call to change role
  5. Verify 403 or "Akses ditolak" response
- **Expected Result:** Regular Agent cannot manage roles; UI hides controls; API blocks with 403
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-009 — No membership shows empty view with "Tidak ada akses"
- **Type:** Negative | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Agent not assigned to any Team Inbox
- **Steps:**
  1. Login as Agent with no Team Inbox membership
  2. Navigate to a Team Inbox (if accessible via direct URL)
  3. Verify empty view with message "Tidak ada akses"
  4. Verify no chats displayed
- **Expected Result:** Agent without membership sees empty view with "Tidak ada akses"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-010 — Counters display Unread, Ongoing, Resolved per inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Team Inbox with conversations in different statuses
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Locate Team Inbox in sidebar
  3. Verify counters show Unread count (red badge), Ongoing, and Resolved
  4. Send new message to Team Inbox conversation
  5. Verify Unread counter increments in real-time
- **Expected Result:** Per-inbox counters show Unread/Ongoing/Resolved; update via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-011 — Drag & drop chat between Team Inboxes resets assignment
- **Type:** Positive | **Priority:** P1 | **Source:** US-4
- **Pre-condition:** Chat assigned in Team Inbox A; Team Inbox B exists
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open Team Inbox A — verify assigned chat visible
  3. Drag chat from Team Inbox A to Team Inbox B in sidebar
  4. Verify confirmation prompt
  5. Confirm — verify chat appears in Team Inbox B as "Unassigned"
  6. Verify chat removed from Team Inbox A
- **Expected Result:** Chat moved to Team Inbox B; status reset to Unassigned; old assignment cleared
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-012 — Drag & drop completes in <2s
- **Type:** Positive | **Priority:** P1 | **Source:** US-4
- **Pre-condition:** Chat in Team Inbox A; Team Inbox B in sidebar
- **Steps:**
  1. Drag chat from Team Inbox A
  2. Drop on Team Inbox B in sidebar
  3. Confirm move
  4. Measure time from drop to chat appearing in Team Inbox B
  5. Verify completion in <2 seconds
- **Expected Result:** Drag & drop operation completes in <2s
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-013 — Drop fail (e.g., offline) shows "Gagal pindah, coba lagi"
- **Type:** Negative | **Priority:** P1 | **Source:** US-4
- **Pre-condition:** Agent logged in; network will be disconnected during drag
- **Steps:**
  1. Start dragging a chat to another Team Inbox
  2. Disconnect network before drop completes
  3. Drop chat on target Team Inbox
  4. Verify toast "Gagal pindah, coba lagi" shown
  5. Verify chat remains in original Team Inbox
  6. Verify queued action syncs when network restores
- **Expected Result:** Failed drag shows "Gagal pindah, coba lagi"; chat stays in original location; action queued for retry
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-014 — Tags shown as multi-chip in sidebar/detail with hover tooltip
- **Type:** Positive | **Priority:** P1 | **Source:** US-5
- **Pre-condition:** Team Inbox with multiple tags assigned
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Locate Team Inbox with tags in sidebar
  3. Verify tags shown as colored chips
  4. Hover over a tag chip — verify tooltip shows full tag name
  5. Open Team Inbox → verify tags visible in detail panel
- **Expected Result:** Tags displayed as chips with hover tooltip showing full name
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-015 — Max 10 tags per Team Inbox; exceed shows "Batas tag tercapai"
- **Type:** Negative | **Priority:** P1 | **Source:** US-5
- **Pre-condition:** Team Inbox with 10 tags already assigned
- **Steps:**
  1. Open Team Inbox edit modal
  2. Verify 10 tags present
  3. Attempt to add 11th tag
  4. Verify error "Batas tag tercapai" shown
  5. Verify tag not added
- **Expected Result:** Max 10 tags enforced; exceeding shows "Batas tag tercapai"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-016 — SLA composite field with non-negative integers, min 1 menit
- **Type:** Positive | **Priority:** P1 | **Source:** US-6
- **Pre-condition:** Team Inbox creation/edit modal open
- **Steps:**
  1. Locate SLA (First Response) field
  2. Enter "0 hari, 2 jam, 30 menit" — verify accepted
  3. Locate SLA (Resolution) field
  4. Enter "1 hari, 0 jam, 0 menit" — verify accepted
  5. Try negative value "-1" — verify rejected
  6. Try "0 hari, 0 jam, 0 menit" — verify rejected (min 1 menit)
- **Expected Result:** Non-negative integers accepted; min 1 menit enforced; negative/zero rejected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-017 — SLA applies to new and ongoing conversations; breach flagged red
- **Type:** Positive | **Priority:** P1 | **Source:** US-6
- **Pre-condition:** Team Inbox with SLA configured (e.g., 2h First Response)
- **Steps:**
  1. Send new message to Team Inbox — verify SLA countdown starts
  2. Wait past SLA threshold — verify SLA breach flagged red on chat card
  3. Verify existing ongoing conversations also show SLA countdown
- **Expected Result:** SLA applies to both new and ongoing; breach flagged red on card
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-018 — Invalid SLA format shows "Format SLA tidak valid"
- **Type:** Negative | **Priority:** P1 | **Source:** US-6
- **Pre-condition:** Team Inbox edit modal open
- **Steps:**
  1. Open Team Inbox edit → SLA section
  2. Enter negative value in Resolution SLA (e.g., "-1 hari")
  3. Attempt to save
  4. Verify error "Format SLA tidak valid" shown
  5. Verify save blocked
- **Expected Result:** Invalid SLA format blocked; "Format SLA tidak valid" shown; save prevented
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-019 — Filters inside Team Inbox by tag, SLA, member with Reset button
- **Type:** Positive | **Priority:** P1 | **Source:** US-7
- **Pre-condition:** Team Inbox open with conversations
- **Steps:**
  1. Open Team Inbox in chat list
  2. Apply tag filter — verify list filters
  3. Apply SLA filter (Overdue) — verify only overdue chats shown
  4. Apply member filter — verify only assigned chats shown
  5. Click "Reset Filters" — verify all chats visible again
- **Expected Result:** Filters by tag/SLA/member work; Reset clears all filters
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-020 — No filter results shows "Tidak ada hasil"
- **Type:** Negative | **Priority:** P1 | **Source:** US-7
- **Pre-condition:** Team Inbox open
- **Steps:**
  1. Open Team Inbox
  2. Apply a filter combination that yields no results (e.g., tag "NonexistentTag")
  3. Verify empty state message "Tidak ada hasil" displayed
  4. Verify filters remain active (not cleared)
- **Expected Result:** "Tidak ada hasil" shown when no chats match filters; filters preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-021 — "@TeamInboxName" mention notifies all members in real-time
- **Type:** Positive | **Priority:** P1 | **Source:** US-8
- **Pre-condition:** Team Inbox "Tim Sales" with members online
- **Steps:**
  1. In a conversation note or message, type "@Tim Sales"
  2. Send the message
  3. Verify all members of "Tim Sales" receive notification
  4. Verify notification delivered via socket within 2s
- **Expected Result:** "@TeamInboxName" mention triggers real-time notification to all team members
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-022 — Invalid team mention shows "Tim tidak ditemukan"
- **Type:** Negative | **Priority:** P1 | **Source:** US-8
- **Pre-condition:** Agent composing a note/message
- **Steps:**
  1. Type "@NonexistentTeam123" in note
  2. Send the message
  3. Verify error or inline warning "Tim tidak ditemukan"
  4. Verify mention not sent as notification
- **Expected Result:** Invalid team mention shows "Tim tidak ditemukan"; no notification sent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-023 — Drag & drop reorder of Team Inboxes in sidebar; per-user saved
- **Type:** Positive | **Priority:** P2 | **Source:** US-9
- **Pre-condition:** Admin with 3+ Team Inboxes in sidebar
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Note current Team Inbox order in sidebar (team-1, team-2, team-3)
  3. Drag team-3 above team-1
  4. Verify new order (team-3, team-1, team-2)
  5. Refresh page — verify order persisted
- **Expected Result:** Drag & drop reorder persists per user; saved in user preferences
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-024 — Multi-user reorder conflict syncs latest
- **Type:** Edge | **Priority:** P2 | **Source:** US-9
- **Pre-condition:** Two supervisors reordering simultaneously
- **Steps:**
  1. Supervisor A: reorder Team Inboxes (A→B→C to C→A→B)
  2. Supervisor B: simultaneously reorder (A→B→C to B→C→A)
  3. Verify both see consistent order after sync
  4. Verify latest change wins (last write)
- **Expected Result:** Multi-user reorder conflict resolves; latest change synced to all users
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-025 — Duplicate copies SLA/tags/members (not chats)
- **Type:** Positive | **Priority:** P2 | **Source:** US-10
- **Pre-condition:** Team Inbox "Tim Sales" with SLA, 3 tags, 5 members, 10 chats
- **Steps:**
  1. Right-click "Tim Sales" → "Duplicate"
  2. Verify new "Tim Sales (Copy)" created
  3. Verify SLA settings copied
  4. Verify tags copied (3 tags)
  5. Verify members copied (5 members)
  6. Verify chats NOT copied (0 chats in duplicate)
- **Expected Result:** Duplicate copies SLA, tags, and members; chats are NOT copied
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-026 — Delete Team Inbox shows confirmation dialog
- **Type:** Positive | **Priority:** P2 | **Source:** US-10
- **Pre-condition:** Admin logged in; Team Inbox exists
- **Steps:**
  1. Right-click Team Inbox in sidebar
  2. Select "Delete"
  3. Verify confirmation dialog appears with team name
  4. Click "Cancel" — verify Team Inbox preserved
  5. Repeat → click "Confirm" — verify Team Inbox removed from sidebar
- **Expected Result:** Delete requires confirmation; cancel preserves; confirm removes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-027 — Archive with active chats prompts migration confirmation
- **Type:** Edge | **Priority:** P2 | **Source:** US-10
- **Pre-condition:** Team Inbox with 5 active (ongoing) chats
- **Steps:**
  1. Right-click Team Inbox → "Archive"
  2. Verify migration confirmation prompt appears (warns about active chats)
  3. Confirm migration — verify active chats moved to target inbox
  4. Verify Team Inbox archived and hidden from sidebar
- **Expected Result:** Archiving with active chats prompts migration; chats moved before archive
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-028 — Team Inbox name max 50 chars, alphanumeric/spaces, no duplicates
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Team Inbox creation modal open
- **Steps:**
  1. Enter valid name "Tim Penjualan Jakarta" (22 chars) — verify accepted
  2. Enter name with 51 chars — verify blocked with validation error
  3. Enter name with special chars "Tim@#$!" — verify blocked
  4. Enter duplicate name "Tim Penjualan Jakarta" (if exists) — verify "Nama sudah ada" error
- **Expected Result:** Max 50 chars enforced; alphanumeric/spaces only; duplicates rejected with "Nama sudah ada"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket — Omnichannel Inbox — Chat List (SC-CHATLIST, 30 scenarios)

---

### SC-CHATLIST-001 — Tabs for Unassigned, Ongoing, Resolved with counters; count >99 shows "99+"
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent logged in; conversations exist in all 3 statuses
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify `[data-cy="Conversation-Chat-List-Header"]` shows 3 tabs: Unassigned, Ongoing, Resolved
  3. Verify each tab shows counter badge
  4. If counter >99, verify display shows "99+"
  5. Click each tab — verify `[data-cy="conversation-list"]` filters accordingly
- **Expected Result:** 3 status tabs with counters; ">99" displayed as "99+"; clicking switches view
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-002 — Counters update in real-time via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent on conversation page
- **Steps:**
  1. Note current Unassigned counter value
  2. Send new message from customer phone (creates new unassigned)
  3. Verify Unassigned counter increments within 2s
  4. Assign the chat — verify Unassigned decrements, Ongoing increments
- **Expected Result:** Counters update via socket within ≤2s for all status changes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-003 — Tab switch completes in <1s
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent on Unassigned tab
- **Steps:**
  1. Click "Ongoing" tab
  2. Measure time until `[data-cy="conversation-list"]` content updates
  3. Verify switch completes in <1 second
  4. Click "Resolved" tab — verify same performance
- **Expected Result:** Tab switch completes in <1s for all tabs
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-004 — Scroll position saved per tab in cookies/local storage
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Agent logged in
- **Steps:**
  1. Navigate to Unassigned tab
  2. Scroll to mid-list
  3. Switch to Ongoing tab
  4. Switch back to Unassigned
  5. Verify scroll position restored to mid-list
  6. Refresh page — verify scroll restored from cookies/local storage
- **Expected Result:** Scroll position saved per tab; restored on revisit within session and on refresh
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-005 — Selected chats persist until changed
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Agent on chat list
- **Steps:**
  1. Click on `[data-cy="chat-list-2"]` to select/open it
  2. Verify chat room opens for chat-list-2
  3. Switch tabs and come back
  4. Verify chat-list-2 still selected (highlighted)
- **Expected Result:** Selected chat persists across tab switches until explicitly changed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-006 — "Assign to Me" button visible in Unassigned chats
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Agent logged in; unassigned chats exist
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Switch to Unassigned tab
  3. Verify "Assign to Me" button visible on each unassigned chat card
  4. Verify button NOT visible on Ongoing/Resolved tabs
- **Expected Result:** "Assign to Me" visible only on Unassigned chats
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-007 — Assign action updates instantly (<1s)
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Unassigned chat available
- **Steps:**
  1. Navigate to Unassigned tab
  2. Click "Assign to Me" on `[data-cy="chat-list-1"]`
  3. Measure time until chat moves from Unassigned to Ongoing
  4. Verify chat appears in Your Inbox / Ongoing tab
- **Expected Result:** Assignment completes in <1s; chat moves to Ongoing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-008 — Failed assign shows toast "Gagal assign/handover"
- **Type:** Negative | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Simulate API failure during assignment
- **Steps:**
  1. Navigate to Unassigned tab
  2. Click "Assign to Me" on a chat
  3. Simulate network/API failure
  4. Verify toast "Gagal assign/handover." appears
  5. Verify chat remains in Unassigned (rollback)
- **Expected Result:** Toast "Gagal assign/handover." shown; chat remains unassigned; rollback complete
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-009 — WhatsApp 1:1 identity display: phone, alias, contact name
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** WhatsApp 1:1 conversations exist with various identity configs
- **Steps:**
  1. Navigate to chat list
  2. Locate a WhatsApp 1:1 chat — verify `[data-cy="chat-list-N-name"]` shows contact name
  3. Verify `[data-cy="chat-list-N-account-channel-number"]` shows phone (masked for non-admin: 08xxxx1234)
  4. Login as Admin — verify full phone shown (081234567890)
  5. If alias set — verify alias displayed instead of phone
- **Expected Result:** Identity displays: phone (masked for non-admin), alias if set, contact name+number if enabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-010 — WhatsApp Group: Group name + sender in preview
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** WhatsApp Group conversation exists with messages
- **Steps:**
  1. Navigate to chat list
  2. Locate WhatsApp Group chat
  3. Verify `[data-cy="chat-list-N-name"]` shows group name
  4. Verify `[data-cy="chat-list-N-latest-message"]` preview shows "SenderName: message..."
- **Expected Result:** Group name displayed as identity; preview shows sender name prefix
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-011 — Live Chat: Name or "Guest" + ID
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** Live Chat conversation exists (one with name, one without)
- **Steps:**
  1. Navigate to chat list
  2. Locate Live Chat with name provided — verify `[data-cy="chat-list-N-name"]` shows name
  3. Locate Live Chat without name — verify shows "Guest" + ID
- **Expected Result:** Live Chat shows name if provided; otherwise "Guest" + session ID
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-012 — Delivery/read indicators: ✓ sent, ✓✓ grey delivered, ✓✓ blue read
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Conversations with different message statuses exist
- **Steps:**
  1. Navigate to chat list
  2. Locate chat with sent message — verify single ✓ icon in `[data-cy="chat-list-N-latest-message"]` area
  3. Locate chat with delivered message — verify ✓✓ grey
  4. Locate chat with read message — verify ✓✓ blue
- **Expected Result:** ✓ = sent, ✓✓ grey = delivered, ✓✓ blue = read; correct per message status
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-013 — Agent's last reply shows agent name; notes highlighted
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Chat with agent reply and internal note
- **Steps:**
  1. Navigate to chat list
  2. Locate chat where last reply was by agent "Budi"
  3. Verify preview shows "Budi: [message preview]"
  4. Locate chat with last action as internal note
  5. Verify note preview highlighted with agent name
- **Expected Result:** Agent name shown for last reply; notes visually highlighted with agent name
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-014 — Channel badge on each chat card
- **Type:** Positive | **Priority:** P0 | **Source:** US-7
- **Pre-condition:** Conversations from multiple channels in list
- **Steps:**
  1. Navigate to chat list
  2. Verify each chat card shows `[data-cy="chat-list-N-channel-icon"]`
  3. WhatsApp chat — verify WhatsApp icon
  4. Live Chat — verify Live Chat icon
  5. Verify icons are consistent and recognizable
- **Expected Result:** Channel badge visible on every chat card with correct channel icon
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-015 — Tags shown as chips; >3 tags shows "+x"; hover displays full list
- **Type:** Positive | **Priority:** P0 | **Source:** US-8
- **Pre-condition:** Conversation with 5 tags assigned
- **Steps:**
  1. Navigate to chat list
  2. Locate chat with 5 tags
  3. Verify `[data-cy="chat-list-N-tag-container"]` shows 3 tag chips + "+2" indicator
  4. Hover over "+2" via `[data-cy="chat-list-N-tag-overflow"]`
  5. Verify tooltip shows all 5 tag names
- **Expected Result:** Max 3 tags shown as chips; overflow shows "+x"; hover tooltip displays full tag list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-016 — Last message preview truncated at 50 chars
- **Type:** Positive | **Priority:** P0 | **Source:** US-9
- **Pre-condition:** Conversation with message >50 characters
- **Steps:**
  1. Navigate to chat list
  2. Locate chat with long message
  3. Verify `[data-cy="chat-list-N-latest-message"]` text truncated at 50 characters
  4. Verify truncation shown with "..." or ellipsis
- **Expected Result:** Last message preview truncated at 50 characters with ellipsis
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-017 — Timestamp: Relative (<7 days) or full date otherwise
- **Type:** Positive | **Priority:** P0 | **Source:** US-9
- **Pre-condition:** Conversations with messages from today and from 2 weeks ago
- **Steps:**
  1. Navigate to chat list
  2. Locate chat with message from 3 hours ago — verify `[data-cy="chat-list-N-timestamp"]` shows "3h ago" (relative)
  3. Locate chat with message from 2 weeks ago — verify shows full date (e.g., "25 Jul 2026")
- **Expected Result:** Relative timestamp for <7 days; full date for older messages
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-018 — Context menu with quick actions (role-restricted)
- **Type:** Positive | **Priority:** P1 | **Source:** US-10
- **Pre-condition:** Agent logged in
- **Steps:**
  1. Navigate to chat list
  2. Right-click on `[data-cy="chat-list-1"]` or click `[data-cy="chat-list-1-quick-action"]`
  3. Verify context menu appears with options: Mark as read, Close, Set Reminder, Assign to, Star, Pin, Mark as Spam, Delete
  4. Verify Delete only visible for Admin/Owner role
  5. Verify each action executes correctly
- **Expected Result:** Context menu shows all applicable actions; Delete restricted by role
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-019 — Delete action restricted by role (Admin/Owner only)
- **Type:** Permission | **Priority:** P1 | **Source:** US-10
- **Pre-condition:** Regular Agent logged in (non-Admin)
- **Steps:**
  1. Navigate to chat list as regular Agent
  2. Right-click on a chat or click quick-action
  3. Verify "Delete" option is NOT visible in context menu
  4. Login as Admin — verify "Delete" IS visible
- **Expected Result:** Delete hidden for non-Admin; visible for Admin/Owner
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-020 — Hover on identity/avatar shows mini profile; loads ≤1s
- **Type:** Positive | **Priority:** P1 | **Source:** US-5
- **Pre-condition:** Conversation with ticket history exists
- **Steps:**
  1. Navigate to chat list
  2. Hover over `[data-cy="chat-list-1-avatar"]` or `[data-cy="chat-list-1-name"]`
  3. Verify mini profile popup appears with: sender info, last 3 tickets with status
  4. Measure load time — verify ≤1s
  5. Verify tickets link to Ticket System
- **Expected Result:** Hover shows mini profile with sender info + last 3 tickets; loads in ≤1s
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-021 — Search by name, number, alias, chat content, custom properties with keyword highlighting
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Diverse conversations exist
- **Steps:**
  1. Navigate to chat list
  2. Click `[data-cy="chatList-searchButton"]`
  3. Search by contact name — verify results shown
  4. Search by phone number — verify results
  5. Search by chat content keyword — verify results with keyword highlighted
  6. Search by custom property — verify results
- **Expected Result:** Search works across name, number, alias, content, custom properties; keywords highlighted in results
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-022 — Advanced filters with Reset Filters button
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Conversations with various attributes exist
- **Steps:**
  1. Navigate to chat list
  2. Click `[data-cy="chatList-filter-advance"]`
  3. Filter by Agent — verify results
  4. Filter by Tag — verify combined filter
  5. Filter by Channel — verify combined filter
  6. Filter by SLA (Overdue) — verify only overdue shown
  7. Click "Reset Filters" — verify all filters cleared
- **Expected Result:** Advanced filters (Agent, Tag, Channel, Status, SLA) work; Reset clears all
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-023 — Multi-select via checkboxes with bulk actions; shows selected count
- **Type:** Positive | **Priority:** P1 | **Source:** US-12
- **Pre-condition:** Multiple chats in list
- **Steps:**
  1. Navigate to chat list
  2. Select 3 chats via `[data-cy="chat-list-N-checkbox"]`
  3. Verify bulk action toolbar appears with "3 selected"
  4. Click "Assign" bulk action — verify assign modal
  5. Click "Handover" bulk action — verify handover modal
  6. Verify Delete bulk action is role-restricted (Admin/Owner only)
- **Expected Result:** Multi-select works; bulk actions: Handover, Assign, Delete (role-restricted); selected count shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-024 — Hold indicator icon on chat card with tooltip and filter
- **Type:** Positive | **Priority:** P0 | **Source:** US-13
- **Pre-condition:** Conversation placed on Hold
- **Steps:**
  1. Navigate to chat list
  2. Locate chat on Hold — verify hold indicator icon visible on card
  3. Hover over icon — verify tooltip shows who set Hold and timestamp
  4. Apply "On Hold" filter — verify only held chats shown
  5. Apply "Not On Hold" filter — verify held chats hidden
- **Expected Result:** Hold icon on card; tooltip with who/when; filter for Hold status works
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-025 — SLA countdown with color coding: Green/Yellow/Red
- **Type:** Positive | **Priority:** P0 | **Source:** US-14
- **Pre-condition:** Conversations with various SLA states
- **Steps:**
  1. Navigate to chat list
  2. Locate chat with SLA >50% remaining — verify `[data-cy="chat-list-N-sla-badge"]` shows GREEN
  3. Locate chat with SLA ≤50% and >10% — verify YELLOW
  4. Locate chat with SLA ≤10% or overdue — verify RED
  5. Verify SLA colors configurable via Settings
- **Expected Result:** SLA badge: Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue); configurable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-026 — Sort by Most Recent, Longest Waiting, Mentions, Reminder; persists in session
- **Type:** Positive | **Priority:** P1 | **Source:** US-15
- **Pre-condition:** Multiple conversations with different timestamps and states
- **Steps:**
  1. Navigate to chat list
  2. Click `[data-cy="chatList-filter-sort"]`
  3. Select "Most Recent" — verify list sorted by latest message
  4. Select "Longest Waiting" — verify list sorted by oldest unresponded
  5. Select "Mentions" — verify mentioned chats appear first
  6. Switch tabs and return — verify sorting persisted in session
- **Expected Result:** Sort options work correctly; sorting persists in session
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-027 — Presence indicator when ≥2 agents view same chat; real-time via socket
- **Type:** Positive | **Priority:** P1 | **Source:** US-16
- **Pre-condition:** Two agents online; both viewing same conversation
- **Steps:**
  1. Agent A: open conversation X
  2. Agent B: open same conversation X
  3. Agent A: check chat list — verify presence indicator (avatar/icon) appears on conversation X card
  4. Hover over indicator — verify tooltip shows "Agent B" name
  5. Agent B: close conversation — verify indicator disappears within 3s
- **Expected Result:** Presence indicator shows when ≥2 agents view same chat; tooltip with names; real-time via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-028 — SLA breach red warning icon; Resolved green check icon
- **Type:** Positive | **Priority:** P2 | **Source:** US-17
- **Pre-condition:** Conversations with SLA breach and resolved states
- **Steps:**
  1. Navigate to chat list
  2. Locate SLA-breached conversation — verify red warning icon on card
  3. Locate resolved conversation — verify green check icon on card
  4. Verify icons visible on all relevant chats regardless of current tab
- **Expected Result:** SLA breach = red warning icon; Resolved = green check icon; visible across tabs
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-029 — Loading spinner during pagination; sync indicator for WhatsApp sync
- **Type:** Positive | **Priority:** P2 | **Source:** US-18
- **Pre-condition:** Chat list with many conversations; WhatsApp sync active
- **Steps:**
  1. Navigate to chat list
  2. Scroll to bottom — verify `[data-cy="conversation-list-skeleton"]` loading spinner appears during pagination
  3. Verify new conversations load without blocking UI (non-blocking)
  4. During WhatsApp sync — verify sync indicator visible (non-blocking animation)
- **Expected Result:** Loading spinner for pagination; sync indicator for WhatsApp; non-blocking UX
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-030 — Typing indicator (dots) when customer/agent is active; fades after 5s
- **Type:** Positive | **Priority:** P0 | **Source:** US-19
- **Pre-condition:** Conversation open; customer typing
- **Steps:**
  1. Navigate to chat list
  2. Customer starts typing in WhatsApp conversation
  3. Verify `[data-cy="chat-list-N-typing-indicator"]` shows typing dots on chat card
  4. Verify indicator updates via socket (real-time)
  5. Customer stops typing — verify indicator fades after 5 seconds of inactivity
- **Expected Result:** Typing dots shown when customer/agent active; updates via socket; fades after 5s inactivity
- **Actual Result:** *(QA fills)*
- **Existing TC:** —
