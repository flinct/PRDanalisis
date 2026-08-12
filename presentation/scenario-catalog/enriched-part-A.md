# Conversation Scenario Catalog — Part A: Core Inbox (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Source:** `PRD/Conversationv2/` (10 PRD files)
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv` (SIX-Convo-001..725)
> **Note:** SC-INBOX scenarios (30) already enriched in `enriched-SC-INBOX-demo.md`. This file covers the remaining **231 scenarios** across 9 surfaces.

---

## PRD Ticket — Omnichannel Inbox — Inbox Navigation

### SC-INBOXNAV-001 — Sidebar displays all main navigation items
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent logged in, conversation page loaded
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify `[data-cy="Conversation-Sidebar-Navigation"]` is visible
  3. Verify `[data-cy="inbox-nav-your-inbox"]` exists and is clickable
  4. Verify `[data-cy="inbox-nav-unassigned"]` exists
  5. Verify `[data-cy="inbox-nav-all"]` exists (or equivalent All Conversation nav)
  6. Verify `[data-cy="inbox-nav-starred"]` exists
  7. Verify `[data-cy="inbox-nav-spam"]` exists
  8. Verify `[data-cy="inbox-nav-junk"]` exists if applicable
- **Expected Result:** All main nav items (Your Inbox, Unassigned, Closed, All Conversation, Starred, Spam) visible in sidebar; each clickable and navigates to correct view
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-001..015 (partial — navigation items)

---

### SC-INBOXNAV-002 — Instant tab switching completes in <1s
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent on conversation page with multiple nav items
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Note timestamp before click
  3. Click `[data-cy="inbox-nav-unassigned"]`
  4. Verify unassigned conversations load within 1 second
  5. Click `[data-cy="inbox-nav-starred"]`
  6. Verify starred conversations load within 1 second
  7. Click `[data-cy="inbox-nav-your-inbox"]` — verify return within 1s
- **Expected Result:** Each tab switch completes in <1 second; no visible loading delay; content swaps instantly
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-003 — Starred items synced across team via DB
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Two agents logged in to same workspace; conversation exists
- **Steps:**
  1. Agent A: open a conversation, star it via `[data-cy="quick-action-star"]`
  2. Agent B: refresh or wait for socket update
  3. Agent B: verify starred conversation appears in `[data-cy="inbox-nav-starred"]`
  4. Agent A: unstar the conversation
  5. Agent B: verify conversation removed from starred view
- **Expected Result:** Starred items sync across team via database; changes propagate via socket within ≤2 seconds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-004 — Agent can filter inbox by channel
- **Type:** Positive | **Priority:** P0 | **Source:** US-02
- **Pre-condition:** Agent logged in with conversations from multiple channels
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Click `[data-cy="chatList-filter-status"]` or channel filter control
  3. Select WhatsApp channel only
  4. Verify only WhatsApp conversations appear in chat list
  5. Select Live Chat additionally (multi-select)
  6. Verify both WA and Live Chat conversations shown; IG hidden
- **Expected Result:** Multi-select channel filter narrows to selected channels; conversation count updates in real-time
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-004 (partial — starred/spam/pinned)

---

### SC-INBOXNAV-005 — Agent can add, edit, and remove tags; tags persist
- **Type:** Positive | **Priority:** P0 | **Source:** US-03
- **Pre-condition:** Agent on conversation page; tag management configured
- **Steps:**
  1. Open a conversation room (click `chat-list-1`)
  2. In detail panel, navigate to `[data-cy="Chat-Detail-Section-tags"]`
  3. Add tag "VIP" — verify tag chip appears
  4. Edit tag — change to "Priority"
  5. Remove tag — verify chip removed
  6. Refresh page — verify tag state persisted
- **Expected Result:** Tags add/edit/remove successfully; changes persist across page refreshes and sync across channels
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-006 — Agent can manage multiple WhatsApp numbers
- **Type:** Positive | **Priority:** P0 | **Source:** US-04
- **Pre-condition:** Workspace has 2+ WhatsApp numbers linked
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify session switcher / `[data-cy="Account-Channel-Selector"]` visible
  3. Switch from WhatsApp #1 to WhatsApp #2
  4. Verify conversations update to show #2 inbound chats
  5. Switch back to #1 — verify conversations restored
- **Expected Result:** Multi-session login supported; session switcher allows toggling between WhatsApp numbers; each shows its own conversations
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-45 (partial — send-as identity)

---

### SC-INBOXNAV-007 — Group conversations appear and can be managed
- **Type:** Positive | **Priority:** P0 | **Source:** US-05
- **Pre-condition:** Agent has access to a WhatsApp Group conversation
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Locate a WhatsApp Group conversation in chat list
  3. Verify group name and sender preview visible in `[data-cy="chat-list-1-name"]`
  4. Open group conversation — verify room loads
  5. Verify group participant list visible in detail panel `[data-cy="Chat-Detail-Section-group-member"]`
- **Expected Result:** Group conversations appear in inbox and can be managed like 1:1 chats; participant list visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-43..47 (partial — group metadata)

---

### SC-INBOXNAV-008 — Agent notified when WA session disconnected or unstable
- **Type:** Positive | **Priority:** P0 | **Source:** US-06
- **Pre-condition:** Agent online with active WhatsApp session
- **Steps:**
  1. Disconnect WhatsApp session (kill backend socket or disconnect device)
  2. Verify connection lost indicator appears within 10 seconds
  3. Verify indicator visible in sidebar or header area
  4. Verify "Retry" or reconnect option available
- **Expected Result:** Connection Lost indicator appears within 10s of disconnection; auto-retry with exponential backoff; retry button visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-009 — Data isolation between companies/environments
- **Type:** Permission | **Priority:** P0 | **Source:** US-07
- **Pre-condition:** Agent logged into Company A
- **Steps:**
  1. Login as Company A agent
  2. Verify only Company A conversations visible
  3. Attempt to access Company B data via direct URL
  4. Verify blocked with "Akses ditolak" or empty result
  5. Attempt API call with different company ID — verify 403
- **Expected Result:** Data from one company/environment not visible to other companies/environments; cross-tenant access blocked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-010 — Real-time notifications for new incoming messages
- **Type:** Positive | **Priority:** P0 | **Source:** US-08
- **Pre-condition:** Agent on conversation page; browser not muted
- **Steps:**
  1. Keep SatuInbox tab open
  2. Send message from customer phone
  3. Verify audio notification plays
  4. Verify browser tab title changes (e.g. "(1) SatuInbox")
  5. Verify red unread badge increments on nav item
  6. Switch back to tab — verify title resets
- **Expected Result:** Real-time notifications: audio plays, tab title changes, red unread badge increments; all via socket within ≤2s
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-25 (partial — unread badge)

---

### SC-INBOXNAV-011 — Sensitive fields masked for non-admin roles
- **Type:** Permission | **Priority:** P1 | **Source:** US-09
- **Pre-condition:** Agent logged in (non-admin role)
- **Steps:**
  1. Login as regular Agent (non-admin)
  2. Open conversation in chat list
  3. Verify phone number shows masked (e.g. 08xxxx1234)
  4. Verify email partially masked if applicable
  5. Login as Admin — verify same phone number shows full
- **Expected Result:** Non-admin sees masked phone (08xxxx1234); Admin/Super Admin sees full number; RBAC enforced
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-012 — Screenshot capture and SAP send with confirmation
- **Type:** Positive | **Priority:** P1 | **Source:** US-10
- **Pre-condition:** SAP screenshot add-on enabled for workspace
- **Steps:**
  1. Open conversation room
  2. Verify screenshot button visible in room header
  3. Click screenshot — verify `[data-cy="modal-screenshot-container"]` opens
  4. Verify preview area `[data-cy="popupArea-metadata-modal-screenshot"]` shows capture
  5. Click `[data-cy="send-ss-button"]` — verify sent to SAP
  6. Verify confirmation toast or log entry
- **Expected Result:** Screenshot button visible when add-on enabled; captures PNG; sends to SAP via API; confirmation logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-23 (partial — screenshot button)

---

### SC-INBOXNAV-013 — Presence status visible for team members
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Multiple agents online in workspace
- **Steps:**
  1. Navigate to conversation page
  2. Verify presence indicators on agent avatars (green = Active, yellow = Away)
  3. Change own status to Away — verify indicator updates
  4. Verify other agents see updated status in real-time via socket
- **Expected Result:** Presence status (Active, Away, On Break) visible for team members; status changes propagate within ≤3s
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-014..018 (partial — presence/initial icon)

---

### SC-INBOXNAV-014 — Auto-archive/delete based on retention policy
- **Type:** Positive | **Priority:** P2 | **Source:** US-12
- **Pre-condition:** Workspace with retention policy active; test data with known timestamps
- **Steps:**
  1. Verify conversations older than 6 months are archived (not in active inbox)
  2. Search for archived conversation — verify retrievable within 3s
  3. Verify conversations older than 12 months are deleted
  4. Verify audit log records archive/delete actions
- **Expected Result:** 6-month archive, 12-month delete enforced; archived retrievable within 3 seconds; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-015 — Convert conversation into ticket with auto-link
- **Type:** Positive | **Priority:** P2 | **Source:** US-13
- **Pre-condition:** Agent viewing active conversation
- **Steps:**
  1. Open conversation room
  2. Use action menu or `[data-cy="Create-Ticket-Modal"]` entry point
  3. Fill ticket form — click `[data-cy="Create-Ticket-Submit-Button"]`
  4. Verify ticket created with reference ID
  5. Verify conversation shows ticket badge/link
  6. Verify ticket in Ticket System references back to conversation
- **Expected Result:** Ticket created and auto-linked to conversation; bidirectional reference visible; reference ID in Ticket System
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-22 (partial — create ticket)

---

### SC-INBOXNAV-016 — Broadcast messages across multiple channels
- **Type:** Positive | **Priority:** P2 | **Source:** US-14
- **Pre-condition:** Broadcast feature enabled; multiple channels connected
- **Steps:**
  1. Navigate to broadcast section (if accessible from inbox)
  2. Create broadcast targeting multiple channels
  3. Send broadcast
  4. Verify recipients and results logged
- **Expected Result:** Broadcast UI available; supports multiple channels; auto-tag campaign enabled; recipients/results logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-017 — Team Inbox CRUD for Admin/Supervisor
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Admin/Supervisor logged in
- **Steps:**
  1. Click "+ Create Team Inbox" in sidebar
  2. Fill form: Name "Tim Test", assign agents
  3. Save — verify Team Inbox appears in sidebar instantly
  4. Rename Team Inbox to "Tim Test Updated"
  5. Edit agents/rules
  6. Duplicate Team Inbox — verify copy created
  7. Delete Team Inbox — verify confirmation dialog appears
  8. Reorder via drag & drop — verify new position saved
- **Expected Result:** Full CRUD: Create, Rename, Edit, Duplicate, Delete, Reorder; changes propagate live via socket; delete requires confirmation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-018 — Team Inbox delete requires confirmation dialog
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Admin viewing Team Inbox with active conversations
- **Steps:**
  1. Right-click or long-press Team Inbox in sidebar
  2. Select Delete option
  3. Verify confirmation dialog appears
  4. Cancel — verify Team Inbox not deleted
  5. Retry — Confirm delete — verify Team Inbox removed
- **Expected Result:** Delete requires explicit confirmation dialog; cancel preserves Team Inbox; confirm removes from sidebar
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-019 — Team Inbox changes propagate live via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Two Admins logged in to same workspace
- **Steps:**
  1. Admin A: create new Team Inbox "Test Socket"
  2. Admin B: verify new Team Inbox appears in sidebar within ≤2s without refresh
  3. Admin A: rename to "Test Socket v2"
  4. Admin B: verify name updated in real-time
  5. Admin A: delete Team Inbox
  6. Admin B: verify removal propagates
- **Expected Result:** All Team Inbox CRUD changes propagate live via socket to all connected users within ≤2s
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-020 — Drag & drop chat to Team Inbox with confirmation
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent has conversation in Your Inbox; Team Inbox exists
- **Steps:**
  1. Drag a conversation from chat list
  2. Drop onto Team Inbox in sidebar
  3. Verify confirmation prompt appears
  4. Confirm — verify conversation moved to Team Inbox
  5. Verify conversation removed from original location
- **Expected Result:** Drag & drop assigns chat to Team Inbox; confirmation prompt shown; chat moves on confirm
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-021 — Multi-select batch assign/handover via checkbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Multiple unassigned conversations exist
- **Steps:**
  1. Navigate to Unassigned tab
  2. Select multiple conversations via `[data-cy="chat-list-N-checkbox"]`
  3. Verify selected count displayed
  4. Click bulk assign/handover action
  5. Select target agent or Team Inbox
  6. Confirm — verify all selected conversations assigned
- **Expected Result:** Multi-select via checkboxes; batch assign/handover; selected count displayed; all selected conversations updated
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-022 — Rollback on failed assignment with log event
- **Type:** Negative | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Network unstable during assignment
- **Steps:**
  1. Initiate chat assignment to Team Inbox
  2. Simulate network failure during assignment
  3. Verify assignment rolled back to previous state
  4. Verify toast "Gagal assign/handover" shown
  5. Verify event logged in audit log
- **Expected Result:** Failed assignment rolls back to previous state; toast "Gagal assign/handover" shown; event logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOXNAV-023 — Unread/total counters update in real-time via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent on sidebar; conversation counters visible
- **Steps:**
  1. Note current unread counter on Your Inbox
  2. Send message from customer phone to create new unread
  3. Verify red badge increments within ≤2s without refresh
  4. Mark conversation as read
  5. Verify counter decrements
  6. Verify Total counter (normal font) updates alongside
- **Expected Result:** Unread counters (red badge) update in real-time via socket; Total counter (normal font) updates; latency ≤2s
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-25 (partial — unread badge)

---

### SC-INBOXNAV-024 — Scroll position and filters saved per inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent on conversation page
- **Steps:**
  1. Navigate to Your Inbox — scroll to middle of list
  2. Apply channel filter (WhatsApp only)
  3. Switch to Unassigned tab
  4. Switch back to Your Inbox
  5. Verify scroll position restored
  6. Verify WhatsApp filter still active
  7. Hard-refresh page (Ctrl+Shift+R)
  8. Verify filter state restored from cookies/localStorage
- **Expected Result:** Scroll position and filters saved per inbox in cookies/local storage; restored on tab revisit and page refresh
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-07 (partial — scroll and filter persist)

---
## PRD Ticket — Omnichannel Inbox — Team Inbox Navigation

### SC-TEAMNAV-001 — "+ Team Inbox" button opens inline creation modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Admin/Supervisor logged in, sidebar visible
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Locate "+ Team Inbox" button in sidebar under Team Inboxes section
  3. Click the button
  4. Verify creation modal/form opens inline with fields: Name, Tags, SLA, Supervisors, Members
- **Expected Result:** "+ Team Inbox" button in sidebar opens inline creation modal with all required fields
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-002 — Creation form has all required fields
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Creation modal is open
- **Steps:**
  1. Verify "Nama Team Inbox" field present (max 50 chars, alphanumeric/spaces)
  2. Verify "Tags" multi-select present (max 10)
  3. Verify "SLA (First Response)" composite field (days/hours/minutes)
  4. Verify "SLA (Resolution)" composite field
  5. Verify "Supervisors" multi-select dropdown (min 1 required)
  6. Verify "Members" multi-select dropdown (optional)
  7. Fill all fields and click Save
- **Expected Result:** Form has Name, Tags, SLA (FR + Resolution), Supervisors, Members; validation enforces rules per field
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-003 — Save adds Team Inbox to sidebar instantly
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Valid Team Inbox form filled
- **Steps:**
  1. Fill Name "Tim Penjualan"
  2. Set SLA: First Response 0d 2h 30m, Resolution 1d 0h 0m
  3. Add 1 Supervisor
  4. Click Save
  5. Verify Team Inbox appears in sidebar immediately
  6. Verify counters show 0 for all statuses
- **Expected Result:** Save adds Team Inbox to sidebar instantly; counters initialized; real-time via socket to other users
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-004 — Duplicate name shows "Nama sudah ada"
- **Type:** Negative | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Team Inbox named "Tim Penjualan" already exists
- **Steps:**
  1. Open creation modal
  2. Enter Name "Tim Penjualan" (already existing)
  3. Fill other required fields
  4. Click Save
  5. Verify validation error: "Nama sudah ada"
  6. Verify form not submitted
- **Expected Result:** Duplicate Team Inbox name prevented; validation error "Nama sudah ada" shown; save blocked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-005 — Supervisor can add/remove members; role-based visibility
- **Type:** Permission | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Supervisor logged in; Team Inbox exists with members
- **Steps:**
  1. Open Team Inbox member management
  2. Add a new member — verify success
  3. Verify Supervisors see all chats in Team Inbox
  4. Login as Member — verify only assigned chats visible
  5. Remove a member — verify success
- **Expected Result:** Supervisors see all chats; Members see assigned only; add/remove members works; real-time sync
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-006 — Role changes sync in real-time across users
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Two users online in same workspace
- **Steps:**
  1. Admin: change Agent A role from Member to Supervisor in Team Inbox
  2. Agent A: verify new role reflected without page refresh
  3. Agent A: verify access to all Team Inbox chats now
  4. Admin: demote back to Member
  5. Agent A: verify restricted view restored
- **Expected Result:** Role changes sync in real-time across users via socket; access updates within ≤2s
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-007 — Invalid user shows "Pengguna tidak ditemukan"
- **Type:** Negative | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Member management modal open
- **Steps:**
  1. Open member assignment for Team Inbox
  2. Search for non-existent user "xyz999notreal"
  3. Verify error "Pengguna tidak ditemukan" shown
  4. Verify no member added
- **Expected Result:** Invalid user in role assignment shows "Pengguna tidak ditemukan"; no changes made
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-008 — RBAC blocks unauthorized role changes
- **Type:** Permission | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Regular Agent (non-Supervisor) logged in
- **Steps:**
  1. Login as regular Agent
  2. Attempt to open Team Inbox member management
  3. Verify access blocked or management controls hidden
  4. Verify "Akses ditolak" if forced via direct action
- **Expected Result:** RBAC blocks unauthorized role changes; regular Agent cannot manage Team Inbox membership
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-009 — Chats filtered by membership; no membership shows empty
- **Type:** Negative | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Agent with no Team Inbox membership
- **Steps:**
  1. Login as Agent with no membership to any Team Inbox
  2. Navigate to Team Inbox view
  3. Verify empty view with "Tidak ada akses" shown
  4. Verify no conversations visible
- **Expected Result:** No membership shows empty view with "Tidak ada akses"; no conversations leak through
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-010 — Counters display Unread, Ongoing, Resolved per inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Team Inbox with conversations in various statuses
- **Steps:**
  1. Navigate to Team Inbox in sidebar
  2. Verify counter shows Unread count (red badge)
  3. Verify counter shows Ongoing count
  4. Verify counter shows Resolved count
  5. Mark a conversation as read — verify Unread decrements
  6. Resolve a conversation — verify Resolved increments
- **Expected Result:** Counters display Unread (red badge), Ongoing, Resolved per inbox; update in real-time via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-011 — Drag & drop between Team Inboxes resets to Unassigned
- **Type:** Positive | **Priority:** P1 | **Source:** US-4
- **Pre-condition:** Conversation assigned in Team Inbox A; Team Inbox B exists
- **Steps:**
  1. Drag conversation from Team Inbox A chat list
  2. Drop onto Team Inbox B in sidebar
  3. Verify conversation appears in Team Inbox B as Unassigned
  4. Verify assignment cleared (assignee set to null)
  5. Verify Team Inbox A no longer shows this conversation
- **Expected Result:** Drag & drop to new Team Inbox resets status to Unassigned; clears old assignment; moves conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-012 — Drag & drop completes in <2s
- **Type:** Positive | **Priority:** P1 | **Source:** US-4
- **Pre-condition:** Conversation ready to drag between Team Inboxes
- **Steps:**
  1. Drag conversation to different Team Inbox
  2. Drop and confirm
  3. Measure time from drop to conversation appearing in target inbox
  4. Verify completion within 2 seconds
- **Expected Result:** Drag & drop completes in <2s end-to-end including confirmation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-013 — Drop fail queues action and shows "Gagal pindah, coba lagi"
- **Type:** Negative | **Priority:** P1 | **Source:** US-4
- **Pre-condition:** Network unstable during drag & drop
- **Steps:**
  1. Drag conversation to different Team Inbox
  2. Simulate network failure during drop
  3. Verify toast "Gagal pindah, coba lagi" shown
  4. Verify conversation remains in original Team Inbox
  5. Verify retry option available
- **Expected Result:** Drop failure queues action; toast "Gagal pindah, coba lagi" shown; conversation stays in original Team Inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-014 — Tags shown as multi-chip with hover tooltip
- **Type:** Positive | **Priority:** P1 | **Source:** US-5
- **Pre-condition:** Team Inbox with multiple tags assigned
- **Steps:**
  1. View Team Inbox in sidebar
  2. Verify tags shown as chip elements
  3. Hover over a tag chip — verify tooltip shows full tag name
  4. Open Team Inbox detail — verify tags visible in detail panel
- **Expected Result:** Tags shown as multi-chip in sidebar/detail; hover tooltip displays full tag name
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-015 — Max 10 tags; exceed shows "Batas tag tercapai"
- **Type:** Negative | **Priority:** P1 | **Source:** US-5
- **Pre-condition:** Team Inbox with 10 tags already assigned
- **Steps:**
  1. Open Team Inbox tag management
  2. Verify 10 tags already present
  3. Attempt to add 11th tag
  4. Verify toast "Batas tag tercapai" shown
  5. Verify 11th tag not added
- **Expected Result:** Max 10 tags per Team Inbox enforced; exceeding shows "Batas tag tercapai"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-016 — SLA composite field with validation
- **Type:** Positive | **Priority:** P1 | **Source:** US-6
- **Pre-condition:** Team Inbox SLA configuration open
- **Steps:**
  1. Open SLA configuration for Team Inbox
  2. Set First Response: 0 days, 2 hours, 30 minutes
  3. Set Resolution: 1 day, 0 hours, 0 minutes
  4. Verify field accepts non-negative integers only
  5. Verify minimum is 1 minute
  6. Save — verify SLA applied
- **Expected Result:** SLA composite field (days/hours/minutes) accepts non-negative integers; minimum 1 minute; saves successfully
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-017 — SLA applies to new and ongoing; breach flagged red
- **Type:** Positive | **Priority:** P1 | **Source:** US-6
- **Pre-condition:** Team Inbox with SLA configured; conversations active
- **Steps:**
  1. Create new conversation in Team Inbox with SLA
  2. Verify SLA countdown starts
  3. Wait for SLA breach (or simulate by advancing time)
  4. Verify SLA breach flagged red in `[data-cy="chat-list-N-sla-badge"]`
  5. Verify existing ongoing conversations also show SLA indicator
- **Expected Result:** SLA applies to new and ongoing conversations; breach flagged red in chat list and detail panel
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-018 — Invalid SLA shows "Format SLA tidak valid"
- **Type:** Negative | **Priority:** P1 | **Source:** US-6
- **Pre-condition:** SLA configuration open
- **Steps:**
  1. Enter negative value in SLA field (e.g. -1 hours)
  2. Attempt to save
  3. Verify validation error "Format SLA tidak valid" shown
  4. Verify save blocked
  5. Enter 0 minutes (below minimum) — verify same error
- **Expected Result:** Invalid SLA format prevents save; "Format SLA tidak valid" shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-019 — Filters inside Team Inbox by tag, SLA, member
- **Type:** Positive | **Priority:** P1 | **Source:** US-7
- **Pre-condition:** Team Inbox with multiple conversations with different tags/SLA/members
- **Steps:**
  1. Open Team Inbox
  2. Apply tag filter — verify only matching conversations shown
  3. Apply SLA filter (Overdue) — verify only overdue conversations shown
  4. Apply member filter — verify only assigned-to-member conversations shown
  5. Click "Reset Filters" — verify all conversations restored
- **Expected Result:** Filters by tag, SLA, member work; "Reset Filters" button restores full list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-020 — No filter results shows "Tidak ada hasil"
- **Type:** Negative | **Priority:** P1 | **Source:** US-7
- **Pre-condition:** Team Inbox filter applied with no matching results
- **Steps:**
  1. Open Team Inbox
  2. Apply filter that yields no results
  3. Verify "Tidak ada hasil" message displayed
  4. Verify empty state is clear and not broken UI
- **Expected Result:** No filter results shows "Tidak ada hasil"; clean empty state
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-021 — "@TeamInboxName" mention notifies all members
- **Type:** Positive | **Priority:** P1 | **Source:** US-8
- **Pre-condition:** Team Inbox with active members; conversation room open
- **Steps:**
  1. Open conversation room
  2. In notes field, type "@Tim Penjualan" (matching Team Inbox name)
  3. Submit note
  4. Verify all Team Inbox members receive notification in real-time
  5. Verify mention renders as clickable link
- **Expected Result:** "@TeamInboxName" mention notifies all members in real-time via socket; renders as clickable link
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-022 — Invalid team mention shows "Tim tidak ditemukan"
- **Type:** Negative | **Priority:** P1 | **Source:** US-8
- **Pre-condition:** Conversation room open, note field active
- **Steps:**
  1. Type "@TimYangTidakAda" (non-existent team)
  2. Submit note
  3. Verify warning "Tim tidak ditemukan" shown
  4. Verify note still saved but without notification
- **Expected Result:** Invalid team mention shows "Tim tidak ditemukan"; note saved but no notification sent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-023 — Drag & drop reorder of Team Inboxes per user
- **Type:** Positive | **Priority:** P2 | **Source:** US-9
- **Pre-condition:** Multiple Team Inboxes in sidebar
- **Steps:**
  1. Drag Team Inbox #3 to position #1 in sidebar
  2. Verify new order applied immediately
  3. Refresh page — verify order persisted
  4. Login as different user — verify their order is independent
- **Expected Result:** Drag & drop reorder works; per-user order saved; persisted across refreshes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-024 — Multi-user reorder conflict syncs latest
- **Type:** Edge | **Priority:** P2 | **Source:** US-9
- **Pre-condition:** Two users reordering Team Inboxes simultaneously
- **Steps:**
  1. User A: drag Team Inbox #1 to position #3
  2. User B: simultaneously drag Team Inbox #1 to position #2
  3. Verify conflict resolved — latest change wins
  4. Both users: verify consistent order after sync
- **Expected Result:** Multi-user reorder conflict resolved by latest-wins; both users converge to same order
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-025 — Duplicate copies SLA/tags/members (not chats)
- **Type:** Positive | **Priority:** P2 | **Source:** US-10
- **Pre-condition:** Team Inbox with SLA, tags, members, and active chats
- **Steps:**
  1. Right-click Team Inbox — select Duplicate
  2. Verify new Team Inbox created with "Copy of" prefix
  3. Verify SLA settings copied
  4. Verify tags copied
  5. Verify members copied
  6. Verify active chats NOT copied (empty inbox)
- **Expected Result:** Duplicate copies SLA, tags, and members; does NOT copy active chats
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-026 — Delete Team Inbox shows confirmation dialog
- **Type:** Positive | **Priority:** P2 | **Source:** US-10
- **Pre-condition:** Team Inbox selected for deletion
- **Steps:**
  1. Right-click Team Inbox — select Delete
  2. Verify confirmation dialog appears
  3. Verify dialog explains consequences
  4. Click Cancel — verify Team Inbox preserved
  5. Retry — Confirm — verify Team Inbox deleted
- **Expected Result:** Delete requires confirmation dialog; cancel preserves; confirm deletes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-027 — Archive with active chats prompts migration confirmation
- **Type:** Edge | **Priority:** P2 | **Source:** US-10
- **Pre-condition:** Team Inbox with active conversations
- **Steps:**
  1. Attempt to archive Team Inbox with active conversations
  2. Verify migration confirmation prompt appears
  3. Cancel — verify no archive performed
  4. Confirm with migration — verify chats moved and Team Inbox archived
- **Expected Result:** Archive with active chats prompts migration confirmation; requires explicit confirmation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TEAMNAV-028 — Team Inbox name max 50 chars, alphanumeric/spaces, no duplicates
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Creation modal open
- **Steps:**
  1. Enter name with 51 characters — verify truncated or error
  2. Enter name with special characters — verify validation error
  3. Enter name with only spaces — verify validation error
  4. Enter valid name "CS Customer 1" — verify accepted
  5. Enter duplicate name — verify "Nama sudah ada" error
- **Expected Result:** Name validation: max 50 chars, alphanumeric/spaces only, no duplicates; clear error messages
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## PRD Ticket — Omnichannel Inbox — Chat List

### SC-CHATLIST-001 — Tabs for Unassigned/Ongoing/Resolved with counters; >99 shows 99+
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent on conversation page; conversations in all statuses
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify tab for Unassigned visible with count
  3. Verify tab for Ongoing visible with count
  4. Verify tab for Resolved visible with count
  5. Verify count >99 displays as "99+"
  6. Click each tab — verify correct conversations load
- **Expected Result:** Tabs for Unassigned, Ongoing, Resolved visible with counters; count >99 shows "99+"; tab switch <1s
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-001..003 (partial — tab navigation)

---

### SC-CHATLIST-002 — Counters update in real-time via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent on chat list; counters visible
- **Steps:**
  1. Note current Unassigned counter
  2. Send message from customer phone
  3. Verify Unassigned counter increments within ≤2s
  4. Assign conversation — verify Unassigned decrements and Ongoing increments
  5. Resolve conversation — verify Ongoing decrements and Resolved increments
- **Expected Result:** All counters update in real-time via socket within ≤2s; no page refresh needed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-003 — Tab switch completes in <1s
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent on chat list
- **Steps:**
  1. Click Unassigned tab — measure switch time
  2. Click Ongoing tab — verify <1s
  3. Click Resolved tab — verify <1s
  4. Click back to Unassigned — verify <1s
- **Expected Result:** Each tab switch completes in <1 second; no visible loading delay
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-004 — Scroll position saved per tab; restores on revisit
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Agent on chat list with multiple conversations
- **Steps:**
  1. Open Ongoing tab — scroll to middle of list
  2. Switch to Resolved tab
  3. Switch back to Ongoing tab
  4. Verify scroll position restored to previous position
  5. Refresh page — verify scroll position still restored
- **Expected Result:** Scroll position saved per tab in cookies/local storage; restores on tab revisit within session
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-07 (partial — scroll persist)

---

### SC-CHATLIST-005 — Selected chats persist until changed
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Agent on chat list
- **Steps:**
  1. Click on `chat-list-3` to select/open conversation
  2. Switch to different tab
  3. Switch back — verify same conversation still selected/active
- **Expected Result:** Selected chat persists across tab switches until explicitly changed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-006 — "Assign to Me" button visible in Unassigned chats
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Agent on Unassigned tab with available conversations
- **Steps:**
  1. Navigate to Unassigned tab
  2. Verify "Assign to Me" button visible on unassigned chat cards
  3. Click "Assign to Me" on first conversation
  4. Verify conversation moves to Ongoing and assigned to current agent
- **Expected Result:** "Assign to Me" button visible on Unassigned chats; click assigns to current agent instantly
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-007 — Assign action updates instantly (<1s)
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Unassigned conversation available
- **Steps:**
  1. Click "Assign to Me" on unassigned conversation
  2. Verify assignment completes within <1 second
  3. Verify conversation disappears from Unassigned tab
  4. Verify conversation appears in Your Inbox/Ongoing
- **Expected Result:** Assign action updates instantly (<1s); conversation moves between tabs immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-008 — Failed assign shows toast "Gagal assign/handover"
- **Type:** Negative | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Network unstable during assignment
- **Steps:**
  1. Simulate network failure
  2. Click "Assign to Me"
  3. Verify toast "Gagal assign/handover" shown
  4. Verify conversation remains in Unassigned (rollback)
  5. Verify retry option available
- **Expected Result:** Failed assign shows toast "Gagal assign/handover"; rollback; retry available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-009 — WhatsApp 1:1 identity display rules
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** WhatsApp 1:1 conversations in chat list
- **Steps:**
  1. View WA 1:1 conversation in chat list
  2. Verify `[data-cy="chat-list-1-name"]` shows contact name or phone
  3. As non-admin: verify phone masked (08xxxx1234)
  4. As Admin: verify full phone number visible
  5. Verify `[data-cy="chat-list-1-channel-icon"]` shows WhatsApp icon
- **Expected Result:** WA 1:1: Phone (masked for non-admins), alias if set, contact name+number if enabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-010 — WhatsApp Group identity: Group name + sender in preview
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** WhatsApp Group conversation in chat list
- **Steps:**
  1. View WA Group conversation in chat list
  2. Verify name shows group name
  3. Verify latest message preview shows sender name before message
  4. Verify `[data-cy="chat-list-1-channel-icon"]` shows WA icon
- **Expected Result:** WA Group: Group name displayed; preview shows sender name + message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-011 — Live Chat identity: Name or "Guest" + ID
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** Live Chat conversation in chat list
- **Steps:**
  1. View Live Chat conversation in chat list
  2. If visitor provided name: verify name shown
  3. If no name: verify "Guest" + visitor ID shown
  4. Verify `[data-cy="chat-list-1-channel-icon"]` shows Live Chat icon
- **Expected Result:** Live Chat: Name or "Guest" + ID; channel icon shows Live Chat badge
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-012 — Delivery/read indicators: sent, delivered, read
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Conversations with various message statuses
- **Steps:**
  1. View conversation with sent message — verify single checkmark in preview
  2. View conversation with delivered message — verify double checkmark grey
  3. View conversation with read message — verify double checkmark blue
  4. Verify indicators visible in chat list preview area
- **Expected Result:** Delivery/read indicators: check sent, double-check grey delivered, double-check blue read
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-013 — Agent last reply shows agent name; notes highlighted
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Conversation with agent reply and internal notes
- **Steps:**
  1. View conversation in chat list where last message is agent reply
  2. Verify agent name shown before preview text
  3. View conversation where last entry is internal note
  4. Verify note preview highlighted and shows agent name
- **Expected Result:** Agent last reply shows agent name prefix; notes highlighted with agent name
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-014 — Channel badge on each chat card
- **Type:** Positive | **Priority:** P0 | **Source:** US-7
- **Pre-condition:** Conversations from different channels in chat list
- **Steps:**
  1. View chat list with WA, Live Chat, IG conversations
  2. Verify each card shows `[data-cy="chat-list-N-channel-icon"]`
  3. Verify WhatsApp card has WA icon
  4. Verify Live Chat card has LC icon
- **Expected Result:** Channel badge on each chat card; consistent iconography across all cards
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-015 — Tags as chips; >3 shows +x; hover shows full list
- **Type:** Positive | **Priority:** P0 | **Source:** US-8
- **Pre-condition:** Conversation with multiple tags in chat list
- **Steps:**
  1. View conversation with 2 tags — verify 2 chips in `[data-cy="chat-list-1-tag-container"]`
  2. View conversation with 5 tags — verify 3 chips + "+2" via `[data-cy="chat-list-1-tag-overflow"]`
  3. Hover over "+x" — verify full tag list tooltip
  4. Verify max "+99" display
- **Expected Result:** Tags as chips; >3 tags shows "+x" (max +99); hover shows full tag list tooltip
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-016 — Last message preview truncated at 50 chars
- **Type:** Positive | **Priority:** P0 | **Source:** US-9
- **Pre-condition:** Conversation with long message in chat list
- **Steps:**
  1. View conversation with message >50 characters
  2. Verify `[data-cy="chat-list-1-latest-message"]` shows truncated preview
  3. Verify truncation at 50 characters with ellipsis
  4. View short message — verify full text shown
- **Expected Result:** Last message preview truncated at 50 characters with ellipsis; short messages shown in full
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-017 — Timestamp: Relative (<7 days) or full date
- **Type:** Positive | **Priority:** P0 | **Source:** US-9
- **Pre-condition:** Conversations with various timestamps
- **Steps:**
  1. View conversation from 3 hours ago — verify "3h ago" in `[data-cy="chat-list-1-timestamp"]`
  2. View conversation from 2 days ago — verify "2d ago"
  3. View conversation from 10 days ago — verify full date (e.g. "01/08/2026")
- **Expected Result:** Relative timestamp for <7 days; full date for >=7 days
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-018 — Context menu with role-restricted actions
- **Type:** Positive | **Priority:** P1 | **Source:** US-10
- **Pre-condition:** Agent on chat list; conversation available
- **Steps:**
  1. Right-click or click `[data-cy="chat-list-1-quick-action"]`
  2. Verify menu: Mark as read, Close, Set Reminder, Assign to, Star, Pin, Mark as Spam, Delete
  3. Verify Star toggles via `[data-cy="quick-action-star"]`
  4. Verify Pin toggles via `[data-cy="quick-action-pin"]`
  5. Verify Delete restricted by role
- **Expected Result:** Context menu shows all actions; role-restricted actions disabled/hidden for unauthorized users
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-019 — Delete action restricted by role (Admin/Owner only)
- **Type:** Permission | **Priority:** P1 | **Source:** US-10
- **Pre-condition:** Agent (non-Admin) on chat list
- **Steps:**
  1. Login as regular Agent
  2. Right-click conversation — verify Delete hidden or disabled
  3. Login as Admin — verify Delete visible and functional
  4. Delete conversation — verify removal with confirmation
- **Expected Result:** Delete restricted to Admin/Owner; Agent cannot delete; Admin can delete with confirmation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-020 — Hover on identity shows mini profile; loads <=1s
- **Type:** Positive | **Priority:** P1 | **Source:** US-5
- **Pre-condition:** Agent on chat list with conversations
- **Steps:**
  1. Hover over `[data-cy="chat-list-1-avatar"]` or `[data-cy="chat-list-1-name"]`
  2. Verify mini profile popup appears within ≤1 second
  3. Verify profile shows: sender info, last 3 tickets with status
  4. Verify tickets link to Ticket System
- **Expected Result:** Hover shows mini profile (sender info, last 3 tickets); loads ≤1s; tickets linkable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-021 — Search by name, number, alias, content with keyword highlighting
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Conversations with searchable content exist
- **Steps:**
  1. Click `[data-cy="chatList-searchButton"]` to open search
  2. Type customer name — verify matching conversations shown
  3. Type phone number — verify match found
  4. Type word from message content — verify match found
  5. Verify keywords highlighted in search results
- **Expected Result:** Search by name, number, alias, chat content; keywords highlighted in results
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-022 — Advanced filters with Reset Filters button
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Agent on chat list with various conversation types
- **Steps:**
  1. Click `[data-cy="chatList-filter-advance"]`
  2. Filter by Agent — verify only that agent conversations shown
  3. Filter by Tag — verify only tagged conversations shown
  4. Filter by Channel — verify channel filter
  5. Filter by SLA (Overdue, Near Due) — verify filtered correctly
  6. Click "Reset Filters" — verify all conversations restored
- **Expected Result:** Advanced filters: Agent, Tag, Channel, Status, SLA; Reset Filters restores full list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-023 — Multi-select via checkboxes with bulk actions
- **Type:** Positive | **Priority:** P1 | **Source:** US-12
- **Pre-condition:** Multiple conversations in chat list
- **Steps:**
  1. Click `[data-cy="chat-list-1-checkbox"]` on first conversation
  2. Click `[data-cy="chat-list-2-checkbox"]` on second conversation
  3. Verify selected count displayed (e.g. "2 selected")
  4. Verify bulk actions: Handover, Assign, Delete
  5. Click bulk Assign — verify batch assignment dialog
- **Expected Result:** Multi-select via checkboxes; bulk actions; selected count displayed; Delete role-restricted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-024 — Hold indicator icon with tooltip and filter
- **Type:** Positive | **Priority:** P0 | **Source:** US-13
- **Pre-condition:** Conversation on Hold status
- **Steps:**
  1. View conversation on Hold in chat list
  2. Verify Hold indicator icon visible on chat card
  3. Hover — verify tooltip shows who set Hold and timestamp
  4. Filter for "On Hold" — verify only Hold conversations shown
  5. Filter for "Not On Hold" — verify Hold conversations hidden
- **Expected Result:** Hold indicator on chat card; tooltip with who/when; filterable by Hold status
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-025 — SLA countdown with Green/Yellow/Red colors
- **Type:** Positive | **Priority:** P0 | **Source:** US-14
- **Pre-condition:** Conversations with various SLA states
- **Steps:**
  1. View conversation with >50% SLA remaining — verify green in `[data-cy="chat-list-N-sla-badge"]`
  2. View conversation with ≤50% and >10% — verify yellow
  3. View conversation with ≤10% or overdue — verify red
  4. Verify SLA countdown visible on each chat card
  5. Verify colors configurable via Settings
- **Expected Result:** SLA countdown: Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-026 — Sort by Most Recent, Longest Waiting, Mentions, Reminder
- **Type:** Positive | **Priority:** P1 | **Source:** US-15
- **Pre-condition:** Agent on chat list with varied conversations
- **Steps:**
  1. Click `[data-cy="chatList-filter-sort"]`
  2. Select "Most Recent" — verify newest first
  3. Select "Longest Waiting" — verify oldest unhandled first
  4. Select "Mentions" — verify mentioned first
  5. Select "Reminder" — verify reminder first
  6. Verify sort persists when switching tabs within session
- **Expected Result:** Sort by Most Recent, Longest Waiting, Mentions, Reminder; persists in session
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-027 — Presence indicator when >=2 agents view same chat
- **Type:** Positive | **Priority:** P1 | **Source:** US-16
- **Pre-condition:** Two agents viewing same conversation simultaneously
- **Steps:**
  1. Agent A and Agent B both open same conversation
  2. Verify presence indicator (avatar/icon) appears on chat card
  3. Verify real-time update via socket
  4. Hover — verify tooltip shows both agent names
  5. Agent B closes — verify indicator updates
- **Expected Result:** Presence indicator when >=2 agents view same chat; real-time via socket; tooltip with agent names
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-028 — SLA breach red warning; Resolved green check
- **Type:** Positive | **Priority:** P2 | **Source:** US-17
- **Pre-condition:** Conversations with breached SLA and resolved status
- **Steps:**
  1. View conversation with SLA breach — verify red warning icon
  2. View resolved conversation — verify green check icon
  3. Verify icons visible on all relevant chats in list
- **Expected Result:** SLA breach: Red warning icon; Resolved: Green check icon; visible on all relevant chats
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-029 — Loading spinner during pagination; sync indicator
- **Type:** Positive | **Priority:** P2 | **Source:** US-18
- **Pre-condition:** Chat list with many conversations; WhatsApp syncing
- **Steps:**
  1. Scroll to bottom to trigger pagination
  2. Verify `[data-cy="conversation-list-skeleton"]` loading indicator
  3. Verify next batch loads without blocking UI
  4. During WhatsApp sync — verify sync indicator visible
  5. Verify both non-blocking
- **Expected Result:** Loading spinner during pagination; sync indicator during WA sync; both non-blocking UX
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-CHATLIST-030 — Typing indicator (dots) in chat list; fades after 5s
- **Type:** Positive | **Priority:** P0 | **Source:** US-19
- **Pre-condition:** Customer typing in conversation; agent on chat list
- **Steps:**
  1. Customer starts typing on their device
  2. Verify `[data-cy="chat-list-N-typing-indicator"]` shows typing dots
  3. Verify indicator updates via socket in real-time
  4. Customer stops typing
  5. Verify indicator fades after 5 seconds of inactivity
- **Expected Result:** Typing indicator shows when customer/agent is active; updates via socket; fades after 5s inactivity
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## PRD Ticket — Omnichannel Inbox — Conversation Room

### SC-ROOM-001 — Header shows channel icon, avatar, identity per channel rules
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room open
- **Steps:**
  1. Open a conversation room by clicking `chat-list-1`
  2. Verify `[data-cy="Chat-Room-Header"]` is visible
  3. Verify `[data-cy="Chat-Room-Header-Contact-Avatar"]` shown (fallback to channel icon)
  4. Verify `[data-cy="Chat-Room-Header-Contact-Name"]` shows correct identity
  5. For WA 1:1: verify phone/alias/contact name shown
  6. For WA Group: verify group name shown
- **Expected Result:** Header shows channel icon, avatar (fallback to channel icon), and identity per channel rules
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-002 — Header controls: Screenshot, Close, More menu
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent assigned to ongoing conversation; room open
- **Steps:**
  1. Verify Screenshot button visible if SAP add-on active
  2. Verify `[data-cy="chatRoom-closeConversationButton"]` visible for ongoing assigned chats
  3. Verify More (⋮) menu accessible
  4. Open More menu — verify options: alias change, hold/resume, reminder
  5. Click Close — verify conversation resolved
- **Expected Result:** Header controls: Screenshot (if add-on), Close (ongoing assigned), More menu (alias, hold/resume, reminder); actions <1s
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-003 — Actions update instantly (<1s)
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room open with available actions
- **Steps:**
  1. Perform any action (close, hold, pin)
  2. Verify UI updates within <1 second
  3. Verify no loading spinner needed for instant actions
- **Expected Result:** All header and room actions complete and update UI within <1 second
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-004 — Presence indicator (green) shown if channel supports it
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room open; channel supports presence
- **Steps:**
  1. Open WhatsApp conversation — verify green presence indicator on customer avatar
  2. Open Live Chat conversation — verify presence indicator
  3. Open channel without presence support — verify indicator hidden
  4. Verify presence updates via socket
- **Expected Result:** Presence indicator (green) shown only if channel supports it; updates via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-014..018 (partial — presence)

---

### SC-ROOM-005 — Typing indicator shows agent names (max 5); >5 shows "and x more"
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Multiple agents in conversation room
- **Steps:**
  1. Have 3 agents start typing in same room
  2. Verify typing indicator shows all 3 agent names
  3. Have 6 agents start typing
  4. Verify indicator shows first 5 names + "and 1 more"
  5. Verify updates real-time via socket
- **Expected Result:** Typing indicator shows agent names (max 5); >5 shows "and x more"; real-time via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-006 — Agent vs client bubbles visually distinct; notes styled separately
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room with agent, client messages and private notes
- **Steps:**
  1. Verify agent bubbles aligned right with distinct color (blue)
  2. Verify client bubbles aligned left with distinct color (grey)
  3. Verify `[data-cy="Message-Bubble"]` elements visually distinguish sender
  4. Add private note — verify yellow background styling
  5. Verify notes visible only to agents (not client)
- **Expected Result:** Agent vs client bubbles visually distinct; private notes styled separately (yellow background); notes agent-only
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-020..030 (partial — bubbles, notes)

---

### SC-ROOM-007 — Timestamp: Relative or full date; inline reply-to shows reference
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room with messages of various ages and reply-to
- **Steps:**
  1. View message from today — verify relative timestamp (e.g. "3h ago")
  2. View message from 10 days ago — verify full date
  3. View message with reply-to — verify referenced message shown above
  4. Click referenced message — verify navigation to original
- **Expected Result:** Relative timestamp (<7 days) or full date; inline reply-to shows referenced message; click navigates
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-008 — Message status: Pending/Sent/Delivered/Read/Failed
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room with messages in various delivery states
- **Steps:**
  1. Send a message — verify Pending state (loading spinner)
  2. Verify transitions to Sent (checkmark) after server acknowledges
  3. Verify transitions to Delivered (double-check grey) when delivered
  4. Verify transitions to Read (double-check blue) when customer reads
  5. Simulate delivery failure — verify Failed state (red icon with retry)
- **Expected Result:** Message status: Pending (spinner) -> Sent -> Delivered (grey) -> Read (blue); Failed (red with retry)
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-030..040 (partial — delivery status)

---

### SC-ROOM-009 — Auto-retry failed messages every 5s (max 3 attempts)
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Message delivery failed
- **Steps:**
  1. Send message that fails delivery
  2. Verify Failed state shown with retry icon
  3. Wait 5 seconds — verify auto-retry attempt 1
  4. Wait 5 more seconds — verify attempt 2
  5. Wait 5 more seconds — verify attempt 3
  6. After 3 failures — verify permanent Failed state; manual retry available
- **Expected Result:** Auto-retry every 5s, max 3 attempts; after 3 failures stays Failed with manual retry
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-010 — Inactive channel prompts relogin popup
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** WhatsApp session expired during conversation
- **Steps:**
  1. Open conversation where WA session is inactive/expired
  2. Verify relogin popup/banner appears
  3. Verify `[data-cy="Chat-Room-Expired-Whatsapp-Banner"]` visible
  4. Verify send action disabled until relogin
  5. Verify CTA for relogin accessible
- **Expected Result:** Inactive channel prompts relogin popup; send disabled; WA expired banner shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-011 — [UNDEV] Reminder modal: One-time or recurring
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** [UNDEVELOPED — PRD defines intent but feature not built yet] Agent on conversation room
- **Steps:**
  1. [UNDEVELOPED] Open reminder modal from header More menu
  2. [UNDEVELOPED] Verify one-time option: date + time picker
  3. [UNDEVELOPED] Verify recurring option: hourly/daily/weekly/monthly
  4. [UNDEVELOPED] Set reminder and save
- **Expected Result:** [UNDEVELOPED] Reminder modal supports one-time (date+time) and recurring (hourly/daily/weekly/monthly)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-012 — [UNDEV] Reminder visible in Details; notifications sent
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Steps:**
  1. [UNDEVELOPED] Set reminder on conversation
  2. [UNDEVELOPED] Navigate to Conversation Details — verify reminder visible
  3. [UNDEVELOPED] Wait for scheduled time — verify notification sent
- **Expected Result:** [UNDEVELOPED] Reminder appears in Details; notification sent via browser/push at scheduled time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-013 — [UNDEV] Reminder set info and upcoming reminder in chat history
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Steps:**
  1. [UNDEVELOPED] Set reminder on conversation
  2. [UNDEVELOPED] View chat room history
  3. [UNDEVELOPED] Verify "Reminder set" info as system message
  4. [UNDEVELOPED] Verify upcoming reminder shown in history
- **Expected Result:** [UNDEVELOPED] Reminder set info and upcoming reminder visible as system messages in history
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-014 — Chat actions: Copy, Pin, Copy Link; multi-select for bulk
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room with messages
- **Steps:**
  1. Right-click on a message bubble
  2. Verify context menu: Copy, Pin Conversation, Copy Link to Message
  3. Click Copy — verify message content copied to clipboard
  4. Click Pin — verify message pinned
  5. Select multiple messages — verify bulk action available
  6. Verify actions logged
- **Expected Result:** Chat actions: Copy, Pin, Copy Link; multi-select for bulk; actions logged; failures show toast
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-015 — Actions logged; failures show toast
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** Chat action fails due to network or server error
- **Steps:**
  1. Perform a chat action (e.g. Pin)
  2. Simulate failure during action
  3. Verify toast error message shown
  4. Verify action logged in audit/event log
  5. Verify state rolled back on failure
- **Expected Result:** Failed actions show toast; all actions logged; state rolls back on failure
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-016 — [UNDEV] Hold/Resume from header; Snooze with optional note
- **Type:** State | **Priority:** P1 | **Source:** US
- **Pre-condition:** [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Steps:**
  1. [UNDEVELOPED] Click Hold button in header
  2. [UNDEVELOPED] Verify Snooze modal with optional note field
  3. [UNDEVELOPED] Set Hold — verify SLA timer pauses
  4. [UNDEVELOPED] Verify Hold status visible in Chat List and header
  5. [UNDEVELOPED] Click Resume — verify SLA timer resumes
- **Expected Result:** [UNDEVELOPED] Hold/Resume from header; Snooze with optional note; Resume restores SLA timer
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-017 — Ticket creation from single/multi-select messages; auto-linked
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open with messages
- **Steps:**
  1. Select a single message
  2. Click ticket creation action
  3. Verify `[data-cy="Create-Ticket-Modal"]` opens
  4. Fill ticket form — click `[data-cy="Create-Ticket-Submit-Button"]`
  5. Verify ticket created with reference ID
  6. Select multiple messages — verify batch ticket creation
- **Expected Result:** Ticket creation from single/multi-select messages; auto-linked to chat; reference ID in Ticket System
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-22 (partial — create ticket)

---

### SC-ROOM-018 — Thread search with highlight, navigation, date filter
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open with many messages
- **Steps:**
  1. Open thread search (Ctrl+F or search button)
  2. Type keyword — verify matching messages highlighted
  3. Click Next — verify navigation to next match
  4. Click Previous — verify navigation to previous match
  5. Verify result counter shown (e.g. "3 of 10")
  6. Apply date filter via calendar picker — verify results narrowed
- **Expected Result:** Thread search highlights keywords; Next/Previous navigation; result counter; date filter; results within ≤2s
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-019 — Support text/images/audio/video/docs; max 100MB; error on invalid
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open; input area active
- **Steps:**
  1. Click `[data-cy="Attach-File-Button"]`
  2. Select valid image (jpg/png <100MB) — verify upload succeeds
  3. Select valid document (pdf <100MB) — verify upload succeeds
  4. Select file >100MB — verify error toast "Gagal mengunggah file. Periksa ukuran/format."
  5. Select invalid format — verify same error toast
- **Expected Result:** Support text, images, audio, video, documents; max 100MB; invalid shows error toast
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-020 — Download attachment prompts confirmation
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation with file attachment
- **Steps:**
  1. Click on a file attachment in message
  2. Verify download confirmation prompt appears
  3. Confirm — verify file downloads
  4. Cancel — verify no download initiated
- **Expected Result:** Download attachment prompts confirmation dialog before downloading
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-021 — Ctrl+V pastes text/images; image converts to attachment
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open; text area focused
- **Steps:**
  1. Focus on `[data-cy="Message-Text-Input"]`
  2. Ctrl+V paste text — verify text inserted
  3. Ctrl+V paste image from clipboard — verify image converted to attachment (jpg/png)
  4. Paste image >100MB — verify error "Format tidak valid atau ukuran melebihi 100MB"
- **Expected Result:** Ctrl+V pastes text; images as attachment (≤100MB); invalid shows toast
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-022 — Drag & drop files into text area with preview
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open
- **Steps:**
  1. Drag a file into `[data-cy="Input-Area-Container"]`
  2. Verify preview shown before upload
  3. Verify max 100MB validated
  4. Confirm upload — verify file sent
  5. Drag unsupported format — verify toast "File tidak didukung atau melebihi 100MB"
- **Expected Result:** Drag & drop files; preview before upload; max 100MB; validates format; unsupported shows toast
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-023 — Invalid paste format/size shows toast "Format tidak valid atau ukuran melebihi 100MB"
- **Type:** Negative | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open; text area focused
- **Steps:**
  1. Paste an unsupported file type via Ctrl+V
  2. Verify toast "Format tidak valid atau ukuran melebihi 100MB" shown
  3. Verify file not attached
  4. Paste file >100MB — verify same toast
- **Expected Result:** Invalid paste shows toast; file rejected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-024 — Auto-expand text area (up to 5 lines); emoji picker
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open; input area visible
- **Steps:**
  1. Click `[data-cy="Message-Text-Input"]` and start typing
  2. Type enough to fill 1 line — verify text area expands
  3. Continue to 5 lines — verify max reached
  4. Click `[data-cy="Emoji-Button"]` — verify emoji picker opens
  5. Select emoji — verify inserted at cursor position
- **Expected Result:** Text area auto-expands up to 5 lines; emoji picker available; emoji inserts at cursor
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-025 — [UNDEV] Bot auto-reply outside working hours; welcome message
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Steps:**
  1. [UNDEVELOPED] Send message outside working hours
  2. [UNDEVELOPED] Verify bot auto-reply sent
  3. [UNDEVELOPED] Send message during working hours
  4. [UNDEVELOPED] Verify welcome message sent
- **Expected Result:** [UNDEVELOPED] Bot auto-reply outside working hours; welcome message during working hours
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-026 — Quick Reply (Macro) templates via dropdown
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation room open; Quick Reply templates configured
- **Steps:**
  1. Click `[data-cy="Macro-Button"]`
  2. Verify dropdown opens with templates
  3. Select template — verify text inserted into `[data-cy="Message-Text-Input"]`
  4. Edit template text before sending
  5. Verify templates editable by Admin/Supervisor
- **Expected Result:** Quick Reply templates selectable via dropdown; inserts template text; editable by Admin/Supervisor
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-027 — Text input max 2000 chars; Enter sends; Ctrl+Enter new line
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation room open; input area active
- **Steps:**
  1. Type 2000 characters in `[data-cy="Message-Text-Input"]`
  2. Verify character limit enforced (max 2000)
  3. Press Enter — verify message sent
  4. Type new message — press Ctrl+Enter — verify new line (not sent)
  5. Verify `[data-cy="Send-Button"]` disabled when empty
  6. Verify Send disabled when upload in progress
- **Expected Result:** Max 2000 chars; Enter sends; Ctrl+Enter new line; Send disabled if empty or upload in progress
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-028 — Assignment: Assigned to, Opened by, Closed by; status flow
- **Type:** State | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation in various assignment states
- **Steps:**
  1. Open unassigned conversation — verify "Unassigned" shown
  2. Assign to agent — verify "Assigned to [agent]" shown
  3. Verify "Opened by" info visible
  4. Resolve — verify "Closed by" info shown
  5. Verify status: Unassigned -> Ongoing -> Resolved
- **Expected Result:** Assignment shows Assigned to, Opened by, Closed by; status progresses Unassigned -> Ongoing -> Resolved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-029 — Resolved chats reopen on new message
- **Type:** State | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation resolved; customer sends new message
- **Steps:**
  1. Resolve a conversation
  2. Customer sends new message
  3. Verify conversation reopens to Unassigned status
  4. Verify prior resolved session preserved in Room History
  5. Verify new session linked to previous session
- **Expected Result:** Resolved chats reopen on new customer message; new Unassigned session; prior in Room History; linked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-030 — Rich cards in Live Chat only; carousel format; API-triggered
- **Type:** Positive | **Priority:** P2 | **Source:** US
- **Pre-condition:** Live Chat conversation open; rich card triggered via API
- **Steps:**
  1. Open Live Chat conversation
  2. Trigger rich card via API (image, title, description, 3 buttons)
  3. Verify rich card renders inline
  4. Verify carousel format for multiple cards
  5. Open WA conversation — verify rich cards NOT available
- **Expected Result:** Rich cards in Live Chat only; image, title, description, up to 3 buttons; API-triggered; not in WA
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-031 — Connection Lost shows banner "Koneksi terputus" + Retry
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** Network disconnected during active conversation
- **Steps:**
  1. Open conversation room
  2. Disconnect network
  3. Verify banner "Koneksi terputus" appears
  4. Verify Retry button visible
  5. Reconnect network — click Retry
  6. Verify connection restores and banner disappears
- **Expected Result:** Banner "Koneksi terputus" + Retry button; Retry reconnects; banner clears on restore
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ROOM-032 — WA Session Expired shows "Sesi WA perlu login ulang" + CTA
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** WhatsApp session token expired
- **Steps:**
  1. Open conversation with expired WA session
  2. Verify banner "Sesi WA perlu login ulang" shown
  3. Verify CTA Relogin button accessible
  4. Verify send action disabled until relogin
  5. Click Relogin — verify re-authentication flow starts
- **Expected Result:** "Sesi WA perlu login ulang" + CTA Relogin; send disabled until reauth
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## PRD Ticket — Omnichannel Inbox — Conversation Detail

### SC-DETAIL-001 — Team Inbox assignment: single, mandatory; Assignees: multi-select
- **Type:** Positive | **Priority:** P0 | **Source:** US-01, FR-01, FR-02
- **Pre-condition:** Conversation detail panel open
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-assignee"]`
  2. Verify Team Inbox dropdown is single-select and mandatory
  3. Verify Assignees field is multi-select with chips showing avatar+name
  4. Select Team Inbox from dropdown
  5. Add multiple assignees — verify chips appear
  6. Remove an assignee — verify chip removed
- **Expected Result:** Team Inbox: single-select, mandatory; Assignees: multi-select chips with avatar+name; changes update immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-002 — Unassigned state shows label + "Assign Now (Tetapkan Agent)"
- **Type:** Positive | **Priority:** P0 | **Source:** US-01, AC-01
- **Pre-condition:** Conversation is unassigned; detail panel open
- **Steps:**
  1. Open detail panel for unassigned conversation
  2. Verify "Unassigned" label visible in `[data-cy="Chat-Detail-Section-assignee"]`
  3. Verify "Assign Now (Tetapkan Agent)" button visible
  4. Click button — verify assignment modal opens
- **Expected Result:** Unassigned state shows "Unassigned" label + "Assign Now (Tetapkan Agent)" button
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-003 — Assigned state shows assigned agents; allows add/remove
- **Type:** Positive | **Priority:** P0 | **Source:** US-01, AC-01
- **Pre-condition:** Conversation assigned to agents; detail panel open
- **Steps:**
  1. Open detail panel for assigned conversation
  2. Verify assigned agents shown with avatar and name
  3. Click add assignee — verify `[data-cy="Assign-Member-Modal"]` opens
  4. Add new assignee — verify chip added
  5. Click remove on existing assignee — verify chip removed
- **Expected Result:** Assigned state shows agents with avatar+name; add via modal; remove via chip dismiss
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-004 — First Response Due countdown appears only when Unassigned
- **Type:** State | **Priority:** P0 | **Source:** US-02, AC-02, FR-03
- **Pre-condition:** Conversation unassigned; SLA configured
- **Steps:**
  1. Open detail panel for unassigned conversation
  2. Verify `[data-cy="Chat-Detail-Sla-frt"]` shows countdown timer
  3. Assign conversation to agent
  4. Verify First Response Due countdown disappears or changes state
- **Expected Result:** First Response Due countdown appears only when Unassigned; disappears upon assignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-005 — Time to Close Due countdown until SLA resolution
- **Type:** Positive | **Priority:** P0 | **Source:** US-02, AC-02, FR-03
- **Pre-condition:** Conversation with SLA; detail panel open
- **Steps:**
  1. Open detail panel
  2. Verify `[data-cy="Chat-Detail-Sla-ttc"]` shows countdown timer
  3. Verify countdown decreases in real-time
  4. Resolve conversation — verify countdown stops
- **Expected Result:** Time to Close Due countdown visible and decreases in real-time; stops on resolution
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-006 — Expired SLA shows red badge "SLA terlewati"
- **Type:** Negative | **Priority:** P0 | **Source:** US-02, AC-02
- **Pre-condition:** Conversation with expired SLA
- **Steps:**
  1. Open detail panel for conversation where SLA has expired
  2. Verify red badge "SLA terlewati" shown on SLA fields
  3. Verify badge prominent and clearly indicates breach
- **Expected Result:** Expired SLA shows red badge "SLA terlewati" on SLA fields; prominent visual indicator
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-007 — Reminder appears only if feature activated for that user
- **Type:** Permission | **Priority:** P0 | **Source:** US-03, AC-03, FR-04
- **Pre-condition:** Reminder feature conditionally activated
- **Steps:**
  1. User with Reminder activated: open detail panel — verify reminder control visible
  2. User without Reminder activated: open detail panel — verify reminder control hidden
  3. Verify reminder visible only to user who activated it
- **Expected Result:** Reminder appears only if feature activated and only for the user who activated it
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-008 — Conversation ID unique and auto-generated
- **Type:** Positive | **Priority:** P0 | **Source:** US-04, AC-04, FR-05
- **Pre-condition:** New conversation created
- **Steps:**
  1. Open detail panel for new conversation
  2. Verify `[data-cy="Chat-Detail-Title"]` shows conversation ID
  3. Verify `[data-cy="Chat-Detail-Copy-Id-Button"]` available
  4. Click copy — verify ID copied to clipboard
  5. Create another conversation — verify different unique ID
- **Expected Result:** Conversation ID unique, auto-generated; copy button available; each has distinct ID
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-009 — Channel source displayed; WA Web shows number and name
- **Type:** Positive | **Priority:** P0 | **Source:** US-04, AC-04, FR-06
- **Pre-condition:** Detail panel open for various channel conversations
- **Steps:**
  1. Open WA Web conversation detail — verify channel icon, WA number, and name
  2. Open Live Chat conversation detail — verify channel icon; Channel Name/Number NOT shown
  3. Verify channel source in `[data-cy="Chat-Detail-Section-attributes"]`
- **Expected Result:** WA Web shows channel icon + number + name; other channels show icon only without number/name
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-010 — Started At timestamp in ISO format
- **Type:** Positive | **Priority:** P0 | **Source:** US-04, AC-04, FR-07
- **Pre-condition:** Conversation detail panel open
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-attributes"]`
  2. Verify "Started At" field shows timestamp
  3. Verify format is ISO or readable date with timezone
- **Expected Result:** Started At timestamp in ISO format with timezone; always present
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-011 — Dynamic attributes (e.g. SAP AWB) visible and accurate
- **Type:** Positive | **Priority:** P0 | **Source:** US-04, AC-04
- **Pre-condition:** Conversation with dynamic attributes from Open API
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-attributes"]`
  2. Verify dynamic attributes (e.g. SAP AWB) listed
  3. Verify attribute values match API data
  4. Verify read-only status (not editable by agent)
- **Expected Result:** Dynamic attributes from Open API visible and accurate; read-only; values match source
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-012 — Client data: Name, Phone (masked), Email, Location, OS, Browser
- **Type:** Positive | **Priority:** P0 | **Source:** US-05, AC-05, FR-08, FR-09, FR-10
- **Pre-condition:** Detail panel open; client data available
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-client-data"]`
  2. Verify Client Name displayed
  3. Verify Client Phone masked for Agent (e.g. +62812...7890)
  4. Verify Client Email displayed if available
  5. Verify Location shown if allowed
  6. Verify OS and Browser auto-detected if available
- **Expected Result:** Client data: Name, Phone (masked), Email, Location (if allowed), OS, Browser (auto-detect)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-013 — Missing optional client data does not break UI
- **Type:** Edge | **Priority:** P0 | **Source:** AC-05
- **Pre-condition:** Conversation with minimal client data
- **Steps:**
  1. Open detail panel for conversation with no email, no location
  2. Verify UI renders without errors
  3. Verify missing fields show placeholder or hidden gracefully
  4. Verify no JS errors in console
- **Expected Result:** Missing optional client data handled gracefully; no UI breakage; placeholders for missing data
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-014 — Tags can be added, edited, removed; changes persist immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-06, AC-06, FR-11
- **Pre-condition:** Detail panel open; tag management available
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-tags"]`
  2. Add tag "VIP" — verify chip appears immediately
  3. Edit tag — verify change persists
  4. Remove tag — verify chip removed immediately
  5. Refresh page — verify tag changes persisted
- **Expected Result:** Tags add/edit/remove; changes persist immediately; synced with WhatsApp Business API for WA
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-015 — All conversation events logged and visible chronologically
- **Type:** Positive | **Priority:** P0 | **Source:** US-07, AC-07, FR-12
- **Pre-condition:** Conversation with multiple lifecycle events
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-events"]`
  2. Verify all events: assignment changes, SLA updates, status changes
  3. Verify chronological order
  4. Verify each event has timestamp and actor info
- **Expected Result:** All conversation events logged and visible in chronological order with timestamps
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-016 — All past conversations with client displayed chronologically
- **Type:** Positive | **Priority:** P0 | **Source:** US-07, AC-08, FR-13
- **Pre-condition:** Client has multiple conversation sessions
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-history"]`
  2. Verify all past conversations listed chronologically
  3. Verify previous sessions from different dates shown
  4. Click on a past conversation — verify navigable
- **Expected Result:** All past conversations displayed chronologically including previous sessions; navigable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-017 — Agents can add/edit internal notes; Supervisor can mention agents
- **Type:** Positive | **Priority:** P0 | **Source:** US-08, AC-09, FR-14
- **Pre-condition:** Detail panel open; notes section available
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-notes"]`
  2. Add internal note — verify note appears
  3. Edit note — verify changes saved
  4. As Supervisor: type "@AgentName" — verify mention autocomplete
  5. Submit — verify mentioned agent notified
- **Expected Result:** Agents add/edit notes; Supervisor/Admin can @mention agents; mentioned agents notified
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-018 — Pinned messages in dedicated section; click jumps to original
- **Type:** Positive | **Priority:** P0 | **Source:** US-09, AC-10, FR-15
- **Pre-condition:** Conversation with pinned messages
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-pinned"]`
  2. Verify pinned messages listed in dedicated section
  3. Click on a pinned message — verify jumps to original
  4. Verify max 10 pinned messages enforced
- **Expected Result:** Pinned messages in dedicated section; click jumps to original; max 10; exceeding shows "Batas tercapai"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-019 — Media viewable inline with download; unsupported shows error
- **Type:** Positive | **Priority:** P0 | **Source:** US-10, AC-11, FR-16
- **Pre-condition:** Conversation with media attachments
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-media"]`
  2. Verify images viewable inline (thumbnail/gallery)
  3. Verify video/audio playable inline
  4. Click download — verify file downloads
  5. Verify unsupported format shows error message
- **Expected Result:** Media viewable inline with download; unsupported formats show error message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-020 — Files downloadable and viewable; upload validates type/size
- **Type:** Positive | **Priority:** P0 | **Source:** US-10, AC-12, FR-17
- **Pre-condition:** Conversation with file attachments
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-files"]`
  2. Verify files listed with names and sizes
  3. Click download — verify file downloads
  4. Upload new file — verify type validation (pdf, docx, xlsx)
  5. Upload file >25MB — verify "Batas tercapai" error
- **Expected Result:** Files downloadable; upload validates type/size; >25MB blocked with "Batas tercapai"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-021 — Related conversations linked and navigable
- **Type:** Positive | **Priority:** P1 | **Source:** US-11, AC-13, FR-18
- **Pre-condition:** Conversation with related conversations
- **Steps:**
  1. Open detail panel
  2. Navigate to related conversations section
  3. Verify linked conversations listed
  4. Click on related conversation — verify navigation
- **Expected Result:** Related conversations linked and navigable from current conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-022 — Broadcast history logged with timestamps and recipient info
- **Type:** Positive | **Priority:** P1 | **Source:** US-12, AC-14, FR-19
- **Pre-condition:** Conversation with broadcast history
- **Steps:**
  1. Open detail panel
  2. Navigate to broadcast history section
  3. Verify broadcasts listed with timestamps
  4. Verify recipient info shown
- **Expected Result:** Broadcast history logged with timestamps and recipient info; accessible for auditing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-023 — Custom attributes from external APIs appear correctly
- **Type:** Positive | **Priority:** P2 | **Source:** US-13, AC-15, FR-20
- **Pre-condition:** Conversation with custom attributes from external API
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-custom-attributes"]`
  2. Verify custom attributes displayed with correct values
  3. Modify source data in external API
  4. Verify attributes update dynamically
- **Expected Result:** Custom attributes from external APIs appear correctly and update dynamically
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-024 — Tags max 20; pinned max 10; file max 25MB; exceeding shows toast
- **Type:** Negative | **Priority:** P0 | **Source:** EH
- **Pre-condition:** Detail panel; limits reached
- **Steps:**
  1. Add 20 tags — verify 21st blocked with toast "Batas tercapai"
  2. Pin 10 messages — verify 11th blocked with toast "Batas tercapai"
  3. Upload file >25MB — verify blocked with toast "Batas tercapai"
- **Expected Result:** Tags max 20; pinned max 10; file max 25MB; exceeding blocks with toast "Batas tercapai"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-DETAIL-025 — Edit lock conflict shows "Data diubah oleh pengguna lain. Silakan refresh."
- **Type:** Negative | **Priority:** P0 | **Source:** EH
- **Pre-condition:** Two users editing same conversation detail field simultaneously
- **Steps:**
  1. User A: start editing tags in detail panel
  2. User B: simultaneously edit same tags and save
  3. User A: attempt to save — verify conflict toast
  4. Verify refresh suggestion to reload latest data
- **Expected Result:** Conflict detected; toast "Data diubah oleh pengguna lain. Silakan refresh." shown; prompt to refresh
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## PRD Ticket — Omnichannel Inbox — Get New Conversation (Agent Pull Queue)

### SC-PULL-001 — Agent clicks "Get Conversation"; FIFO assignment
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent on Your Inbox; unassigned conversations available in queue
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify "Get Conversation" button visible
  3. Verify batch field shows default count = total queue
  4. Click "Get Conversation"
  5. Verify conversations assigned FIFO (oldest first)
  6. Verify conversations appear in Your Inbox
- **Expected Result:** "Get Conversation" assigns conversations FIFO; default batch = total queue; appear in Your Inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-002 — Default batch = total queue; editable; min = 1
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent on Your Inbox; queue has 10 conversations
- **Steps:**
  1. Verify batch field shows "10" (queue count)
  2. Change batch to 5 — verify accepted
  3. Set batch to 0 — verify rejected (min = 1)
  4. Set batch to 1 — verify accepted
  5. Click "Get Conversation" with batch 5 — verify exactly 5 assigned
- **Expected Result:** Default batch = total queue; editable numeric field; minimum 1; pulling assigns exactly batch-size
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-003 — Status changes to "Assigned to Agent" immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Unassigned conversation in queue
- **Steps:**
  1. Click "Get Conversation"
  2. Verify status changes to "Assigned to Agent" immediately
  3. Verify conversation no longer in Unassigned list
  4. Verify appears in agent's Your Inbox
- **Expected Result:** Status changes to "Assigned to Agent" immediately; removed from Unassigned; in Your Inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-004 — Pulled conversation appears in "Your Inbox" tab
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent pulled conversation via Get Conversation
- **Steps:**
  1. Pull conversation via "Get Conversation"
  2. Switch to Your Inbox tab
  3. Verify pulled conversation visible in list
  4. Verify conversation shows correct metadata
- **Expected Result:** Pulled conversation immediately visible in Your Inbox with correct metadata
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-005 — Editable numeric batch field with default
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent on Your Inbox with Get Conversation visible
- **Steps:**
  1. Verify editable numeric batch field next to "Get Conversation"
  2. Verify default value = total queue count
  3. Edit value — verify numeric input accepted
  4. Enter negative number — verify rejected
- **Expected Result:** Editable batch field; default = total queue; accepts positive integers only; min 1
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-006 — Supervisor/Admin can assign chats manually from Unassigned
- **Type:** Positive | **Priority:** P1 | **Source:** US (P1)
- **Pre-condition:** Supervisor/Admin logged in; Unassigned tab visible
- **Steps:**
  1. Login as Supervisor
  2. Navigate to Unassigned tab
  3. Select a conversation
  4. Assign to self or another agent via `[data-cy="Assign-Conversation-Modal"]`
  5. Verify assignment successful
- **Expected Result:** Supervisor/Admin can assign manually from Unassigned to self or other agents
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-007 — Max active conversations reached shows warning
- **Type:** Negative | **Priority:** P1 | **Source:** US (P1)
- **Pre-condition:** Agent at concurrent conversation limit
- **Steps:**
  1. Agent with max active conversations reached
  2. Click "Get Conversation"
  3. Verify toast "Maximum active conversations reached"
  4. Verify no new conversation assigned
- **Expected Result:** Warning "Maximum active conversations reached"; no new assignments
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-008 — Max concurrent limit configurable by Supervisor/Admin
- **Type:** Positive | **Priority:** P1 | **Source:** US (P1)
- **Pre-condition:** Admin in Inbox > General Settings
- **Steps:**
  1. Navigate to Inbox > General Settings
  2. Find max concurrent conversations setting
  3. Toggle ON — set limit to 10
  4. Save — verify setting applied
  5. Verify agents cannot pull beyond limit
- **Expected Result:** Max concurrent limit configurable; toggle ON/OFF; minimum 1 when enabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-009 — Timeout return to queue; setting toggle ON/OFF
- **Type:** Positive | **Priority:** P2 | **Source:** US (P2)
- **Pre-condition:** Admin in settings; timeout feature
- **Steps:**
  1. Navigate to Inbox > General Settings
  2. Toggle timeout return ON — set 30 minutes
  3. Save
  4. Agent pulls conversation — wait 30 minutes inactive
  5. Verify conversation returns to Unassigned queue
- **Expected Result:** Timeout return: toggle ON/OFF; inactive chat returns to Unassigned after [X] minutes (5-120)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-010 — Max conversation limit toggle; configurable min 1
- **Type:** Positive | **Priority:** P2 | **Source:** US (P2)
- **Pre-condition:** Admin in settings
- **Steps:**
  1. Toggle max conversation limit ON
  2. Set max to 5
  3. Save — verify applied
  4. Verify agents limited to 5 active
  5. Toggle OFF — verify unlimited
- **Expected Result:** Max conversation limit toggle ON/OFF; when ON configurable min 1
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-011 — Agents see own closed chats; Supervisors see all
- **Type:** Permission | **Priority:** P2 | **Source:** US (P2)
- **Pre-condition:** Both Agent and Supervisor accounts available
- **Steps:**
  1. Login as Agent — navigate to Closed tab
  2. Verify only own resolved chats visible
  3. Login as Supervisor — navigate to Closed tab
  4. Verify all team resolved chats visible
- **Expected Result:** Agents: Closed tab shows own chats only; Supervisors: shows all team chats
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-012 — Queue empty shows toast "No conversations available"
- **Type:** Negative | **Priority:** P0 | **Source:** EH
- **Pre-condition:** Unassigned queue is empty
- **Steps:**
  1. Navigate to Your Inbox with empty queue
  2. Click "Get Conversation"
  3. Verify toast "No conversations available"
  4. Verify no error or crash
- **Expected Result:** Queue empty: toast "No conversations available"; no error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-013 — API/socket failure shows toast "Failed to fetch conversation, please retry"
- **Type:** Negative | **Priority:** P0 | **Source:** EH
- **Pre-condition:** Network or server error during pull
- **Steps:**
  1. Simulate API/socket failure
  2. Click "Get Conversation"
  3. Verify toast "Failed to fetch conversation, please retry"
  4. Verify no partial assignment
  5. Restore connection — retry — verify success
- **Expected Result:** API/socket failure: toast shown; no partial assignment; retry succeeds on restore
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-PULL-014 — Invalid batch number resets to default queue count
- **Type:** Negative | **Priority:** P0 | **Source:** EH
- **Pre-condition:** Agent enters invalid batch number
- **Steps:**
  1. Enter 0 in batch field — verify resets to 1 or default
  2. Enter -5 — verify resets
  3. Enter "abc" — verify rejected
  4. Enter 99999 (above queue count) — verify resets to queue count
- **Expected Result:** Invalid batch number resets to default queue count or minimum 1
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## PRD Ticket — Omnichannel Chat Sessions (Group Handling + Multi-number Send as)

### SC-SESSIONS-001 — New message with no open session creates new Unassigned session
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001
- **Pre-condition:** Customer sends first message; no prior open session
- **Steps:**
  1. Customer sends WhatsApp message to linked number
  2. Verify new session created in Unassigned status
  3. Verify opener message bound to session
  4. Verify session appears in team Unassigned list
- **Expected Result:** New message with no open session creates new Unassigned session; opener message bound
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-002 — Burst arrivals within dedupe window create only one session
- **Type:** Edge | **Priority:** P0 | **Source:** US-001, FR-017
- **Pre-condition:** Customer sends multiple messages rapidly
- **Steps:**
  1. Customer sends 5 messages within 2 seconds (burst)
  2. Verify only ONE new session created
  3. Verify all messages appear in same session
  4. Verify no duplicate sessions in Unassigned
- **Expected Result:** Burst arrivals within dedupe window create only one session per conversation context
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-003 — New session appears in team Unassigned with status Unassigned
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** New session created via pull system
- **Steps:**
  1. New inbound creates session
  2. Navigate to team Unassigned list
  3. Verify new session visible with status "Unassigned"
  4. Verify correct channel icon and customer identity
- **Expected Result:** New session in team Unassigned list with status "Unassigned"; pull system active
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-004 — Opening Unassigned session shows channel, status, group, SLA
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Unassigned session in queue
- **Steps:**
  1. Open an Unassigned session
  2. Verify channel information displayed
  3. Verify status shows "Unassigned"
  4. If group: verify group info shown
  5. Verify SLA summary visible
- **Expected Result:** Opening Unassigned shows channel, status, group (if applicable), SLA summary
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-005 — New message after Resolved creates new Unassigned session
- **Type:** State | **Priority:** P0 | **Source:** US-003, FR-003
- **Pre-condition:** Conversation resolved; customer sends new message
- **Steps:**
  1. Resolve a conversation
  2. Customer sends new message
  3. Verify NEW Unassigned session created
  4. Verify prior session moved to Room History (read-only)
  5. Verify new session linked to prior session
- **Expected Result:** New message after Resolved creates new Unassigned session; prior in Room History; linked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-006 — New session links to related previous session
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-003
- **Pre-condition:** New session created after resolution
- **Steps:**
  1. Open new session created after previous resolution
  2. Verify "New session created (related to #ID)" banner shown
  3. Click link to previous session
  4. Verify navigation to Room History with prior conversation
- **Expected Result:** New session links to previous; banner shows relation; clickable link to Room History
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-007 — Race condition: one agent succeeds, other gets conflict toast
- **Type:** Edge | **Priority:** P0 | **Source:** US-004
- **Pre-condition:** Two agents try to pull same Unassigned session simultaneously
- **Steps:**
  1. Agent A: click pull on Unassigned session
  2. Agent B: simultaneously click pull on same session
  3. Verify exactly one agent succeeds
  4. Verify other gets toast "This conversation was taken by another agent"
  5. Verify no duplicate assignment
- **Expected Result:** Race condition: one succeeds; other sees conflict toast; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-008 — Assign/unassign/reassign updates ownership, carries SLA, writes audit
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-006
- **Pre-condition:** Assigned conversation exists
- **Steps:**
  1. Reassign conversation from Agent A to Agent B
  2. Verify ownership updated to Agent B
  3. Verify SLA timer carries over (no reset)
  4. Verify audit log entry for reassignment
  5. Unassign — verify assignee cleared; SLA still carries
- **Expected Result:** Assign/unassign/reassign: ownership updates; SLA carries over (no reset); audit recorded
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-009 — Assign/unassign/reassign UX consistent across channels
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-006
- **Pre-condition:** Conversations from different channels
- **Steps:**
  1. Assign WA conversation — verify standard behavior
  2. Assign Live Chat conversation — verify same behavior
  3. Unassign from both — verify consistent UX
  4. Verify same modals, confirmations, toasts across channels
- **Expected Result:** Assign/unassign/reassign UX consistent across all channels
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-010 — Resolving session changes to Resolved; moves to Room History
- **Type:** State | **Priority:** P0 | **Source:** US-006
- **Pre-condition:** Assigned conversation ready to resolve
- **Steps:**
  1. Click resolve on assigned conversation
  2. Verify status changes to "Resolved"
  3. Verify conversation moves to Room History with timestamp
  4. Verify resolved session read-only
- **Expected Result:** Resolving: status -> Resolved; moves to Room History with timestamp; read-only
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-011 — Opening Resolved session shows it read-only
- **Type:** Positive | **Priority:** P0 | **Source:** US-006
- **Pre-condition:** Resolved session in Room History
- **Steps:**
  1. Navigate to Room History
  2. Open a Resolved session
  3. Verify input area disabled or hidden
  4. Verify no send action available
- **Expected Result:** Resolved session: read-only mode; input disabled; no send action
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-012 — Quoted inbound context preserved across sessions
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-004
- **Pre-condition:** Customer sends message with quoted reply to prior conversation
- **Steps:**
  1. Customer sends quoted reply referencing older message
  2. Verify quoted preview shown inline in new session
  3. Click quoted preview deeplink
  4. Verify navigation to historical anchor in Room History sidebar
- **Expected Result:** Quoted context preserved: preview + deeplink to historical anchor in Room History
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-013 — Quoted reply to very old message shows stub preview
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, EC-002
- **Pre-condition:** Customer quotes message beyond retention period
- **Steps:**
  1. Customer quotes message older than retention
  2. Verify stub preview: "Preview unavailable (beyond retention period)"
  3. Verify related case link still present
  4. Click link — verify navigable even if content gone
- **Expected Result:** Stub preview for quotes beyond retention; case link preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-014 — Group metadata changes inject system message without state change
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-005
- **Pre-condition:** WhatsApp Group with active session
- **Steps:**
  1. Group admin changes group subject
  2. Verify system message injected: "Group name updated"
  3. Verify session state unchanged
  4. Group changes icon — verify system message
  5. Group adds participant — verify system message
- **Expected Result:** Group metadata changes inject system message; no state or routing change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-015 — Frequent group metadata changes collapse/group events
- **Type:** Edge | **Priority:** P0 | **Source:** US-008, EC-004
- **Pre-condition:** WhatsApp Group with rapid metadata changes
- **Steps:**
  1. Group admin changes subject 5 times in 30 seconds
  2. Verify system messages collapsed/grouped
  3. Verify no state changes
- **Expected Result:** Frequent group metadata changes collapse/group similar events; no state change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-016 — Session identity defaults to number that received opener
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-014
- **Pre-condition:** Multiple WhatsApp numbers connected; new session created
- **Steps:**
  1. Customer sends message to WhatsApp #2
  2. Verify new session identity defaults to #2
  3. Verify outbound uses #2 identity
  4. Verify `[data-cy="Account-Channel-Selector"]` shows #2 preselected
- **Expected Result:** Session identity = number that received opener; outbound uses session identity
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-017 — Later inbound via different number appends to same session
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, EC-005
- **Pre-condition:** Active session via WA #1; customer sends via WA #2
- **Steps:**
  1. Session active with identity WA #1
  2. Customer sends message arriving via WA #2
  3. Verify message appends to SAME session (not new)
  4. Verify outbound still uses session identity (#1) unless overridden
- **Expected Result:** Later inbound via different number appends to same session; outbound uses session identity
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-018 — "Send as" selector preselects session identity
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-015
- **Pre-condition:** Group session with multiple connected numbers; composing reply
- **Steps:**
  1. Open group session with 2+ connected numbers
  2. Verify `[data-cy="Account-Channel-Selector"]` visible in send area
  3. Verify session identity preselected
  4. Verify dropdown lists eligible identities
  5. Select different identity — verify selection changes
- **Expected Result:** "Send as" selector preselects session identity; lists eligible identities; switchable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-019 — Changing identity at send time shows confirmation badge + audit
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-015
- **Pre-condition:** Agent composing reply with different Send as identity
- **Steps:**
  1. Change Send as from session default to WA #2
  2. Send message
  3. Verify sent using chosen identity (#2)
  4. Verify confirmation badge "Sent as +62..." shown
  5. Verify audit event logged for identity switch
- **Expected Result:** Changing identity uses chosen; confirmation badge shown; audit event recorded
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-020 — SLA does not reset on reassign/unassign; inherited timing visible
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-007
- **Pre-condition:** Conversation with active SLA being reassigned
- **Steps:**
  1. Note current SLA countdown
  2. Reassign to different agent
  3. Verify SLA continues from same point (no reset)
  4. Verify inherited timing visible in detail panel
- **Expected Result:** SLA does not reset on reassign/unassign; inherited timing continues
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-021 — SLA breach attribution follows team at breach time
- **Type:** Positive | **Priority:** P0 | **Source:** US-011
- **Pre-condition:** Conversation approaching SLA breach
- **Steps:**
  1. Conversation with Team A when SLA breaches
  2. Verify breach attributed to Team A
  3. Move to Team B after breach
  4. Verify breach record still shows Team A
- **Expected Result:** SLA breach attribution follows team at breach time; does not change when moved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-022 — Open conversations remain with original team after number remap
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-010, FR-011
- **Pre-condition:** Number remap occurs; open conversations exist
- **Steps:**
  1. Admin remaps WhatsApp number from Team A to Team B
  2. Verify open conversations remain with Team A (legacy-bound)
  3. Verify replies still possible
  4. Verify legacy badge "Legacy-bound to {number}" shown
- **Expected Result:** Open conversations remain with original team after remap; legacy-bound; replies possible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-023 — Closed thread after remap shows reopen routing modal + new session
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-012
- **Pre-condition:** Closed conversation receives new message after number remap
- **Steps:**
  1. Closed conversation from Team A; number remapped to Team B
  2. Customer sends new message
  3. Verify reopen routing modal appears
  4. Verify default: "Keep in {Old Team} (Recommended)"
  5. Verify secondary: "Move to {New Team}"
  6. Select default — verify new session in Team A
- **Expected Result:** Reopen routing modal for closed legacy thread; default "Keep in old team"; creates new session
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-024 — On move: assignee resets to Unassigned, SLA stops immediately
- **Type:** State | **Priority:** P0 | **Source:** FR-016
- **Pre-condition:** Assigned conversation being moved between teams
- **Steps:**
  1. Move conversation from Team A to Team B
  2. Verify assignee reset to null/Unassigned
  3. Verify SLA stops immediately
  4. Verify move dialog warns effects
- **Expected Result:** On move: assignee resets to Unassigned; SLA stops immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-025 — On reopen in same team: SLA resumes per policy
- **Type:** State | **Priority:** P0 | **Source:** FR-016
- **Pre-condition:** Moved conversation reopened in same team
- **Steps:**
  1. Conversation moved (SLA stopped)
  2. Reopen in same team
  3. Verify SLA resumes per team policy
  4. Verify SLA timer continues from stop point
- **Expected Result:** On reopen in same team: SLA resumes per policy; timer continues from stop point
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-026 — Escalation-only inbox fully operable for moved-in conversations
- **Type:** Positive | **Priority:** P1 | **Source:** US-014, FR-013, EC-008
- **Pre-condition:** Team Inbox with no inbound number; conversation moved in
- **Steps:**
  1. Move conversation to escalation-only Team Inbox
  2. Verify conversation fully operable
  3. Verify sender picker shown if no default
  4. Verify no auto-create in this inbox
- **Expected Result:** Escalation-only inbox fully operable for moved-in; sender picker if needed; no auto-create
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-027 — Claim race conflict shows conflict toast
- **Type:** Negative | **Priority:** P0 | **Source:** EH-001
- **Pre-condition:** Two agents claim same conversation simultaneously
- **Steps:**
  1. Agent A and Agent B both pull same Unassigned session
  2. Verify one succeeds
  3. Verify other gets toast "This conversation was taken by another agent"
  4. Verify conflict audited
- **Expected Result:** Race conflict: one succeeds; other sees conflict toast; audited
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-028 — Unauthorized action shows "You do not have permission"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-002
- **Pre-condition:** Agent without permission attempts restricted action
- **Steps:**
  1. Attempt restricted action (e.g. reassign to other team)
  2. Verify toast "You do not have permission for this action"
  3. Verify state unchanged
  4. Verify attempt audited
- **Expected Result:** Unauthorized: blocked; state unchanged; toast shown; attempt audited
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-029 — Invalid state transition shows "Action is invalid"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Agent attempts action invalid for current status
- **Steps:**
  1. Attempt to resolve an already Resolved conversation
  2. Verify toast "Action is invalid in the current status"
  3. Verify current state unchanged
  4. Verify attempt audited
- **Expected Result:** Invalid state transition keeps state; toast shown; audited
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-SESSIONS-030 — Default sender unavailable forces sender picker; blocks send
- **Type:** Negative | **Priority:** P0 | **Source:** EH-008
- **Pre-condition:** Group session with no available default sender
- **Steps:**
  1. Open group session where default sender unavailable
  2. Verify sender picker forced open
  3. Attempt send without selecting — verify blocked
  4. Select valid sender — verify send succeeds
- **Expected Result:** Default sender unavailable forces picker; blocks send until valid sender selected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
## PRD Ticket — Multi-Ticket Drafts from Single Chat Bubble

### SC-MULTITKT-001 — Selecting 1 bubble and "Buat tiket" opens modal with 1 draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-002, FR-003
- **Pre-condition:** Conversation room open; at least 1 message bubble present
- **Steps:**
  1. Select exactly 1 message bubble (click to select)
  2. Click "Buat tiket" action
  3. Verify modal opens with 1 ticket draft form
  4. Verify fields: Ticket Type, Title, Description, Team Inbox, Assignee
  5. Verify "Tambah tiket" button visible
- **Expected Result:** Selecting 1 bubble + "Buat tiket" opens modal with 1 draft; "Tambah tiket" visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-002 — Clicking "Tambah tiket" appends new numbered draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005
- **Pre-condition:** Multi-draft modal open with 1 draft
- **Steps:**
  1. Click "Tambah tiket"
  2. Verify new draft appended (numbered "Tiket 2")
  3. Verify modal header shows draft count (e.g. "2 tiket")
  4. Click again — verify "Tiket 3" appended
  5. Verify each draft independently editable
- **Expected Result:** "Tambah tiket" appends numbered draft; modal header shows count; each independently editable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-003 — Removing draft reindexes; at least 1 always remains
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-006
- **Pre-condition:** Modal with 3 drafts
- **Steps:**
  1. Click "Hapus" on draft #2
  2. Verify draft #2 removed
  3. Verify remaining reindexed (1 and 3 become 1 and 2)
  4. Attempt to remove last — verify blocked or button hidden
- **Expected Result:** Removing draft reindexes; at least 1 draft always remains
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-004 — Submitting all valid drafts creates 1 ticket per draft; linked to bubble
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-009, FR-010
- **Pre-condition:** Modal with 3 valid drafts
- **Steps:**
  1. Fill all 3 drafts with valid data
  2. Click "Buat semua tiket"
  3. Verify 3 tickets created
  4. Verify each linked to selected bubble
  5. Verify success shows ticket identifiers
- **Expected Result:** Valid submit creates 1 ticket per draft; each linked to bubble; success shows IDs
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-005 — Submit blocked when invalid; "Ada data tiket yang belum lengkap"
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-013, FR-014, EH-001
- **Pre-condition:** Modal with some invalid drafts
- **Steps:**
  1. Leave Title empty in draft #2
  2. Click "Buat semua tiket"
  3. Verify submit blocked
  4. Verify field errors on draft #2
  5. Verify summary: "Ada data tiket yang belum lengkap"
  6. Fix error — verify submit succeeds
- **Expected Result:** Submit blocked; inline field errors; top summary "Ada data tiket yang belum lengkap"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-006 — Draft auto-saved to cookies after 1s inactivity
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-017
- **Pre-condition:** Multi-draft modal open
- **Steps:**
  1. Type in Title field of draft #1
  2. Stop typing for 1 second
  3. Verify draft auto-saved to cookies (check via DevTools > Application > Cookies)
  4. Modify another field — wait 1s — verify save
- **Expected Result:** Auto-save to cookies after 1s inactivity per field change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-007 — Close/reopen same bubble restores drafts with "Draft dipulihkan"
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Drafts saved in cookies; modal closed
- **Steps:**
  1. Close the modal
  2. Reopen "Buat tiket" on SAME bubble
  3. Verify drafts restored with previous values
  4. Verify banner "Draft dipulihkan" shown
  5. Verify draft count matches previous session
- **Expected Result:** Reopening on same bubble restores drafts; banner "Draft dipulihkan"; values preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-008 — "Buang draft" clears all and resets to 1 empty draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Modal with restored drafts
- **Steps:**
  1. Click "Buang draft"
  2. Verify all drafts cleared
  3. Verify modal resets to 1 empty draft
  4. Verify cookie deleted
  5. Reopen — verify no restored drafts
- **Expected Result:** "Buang draft" clears all; resets to 1 empty; cookies deleted; no restore on reopen
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-009 — Draft cookies deleted after successful ticket creation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Drafts created; ready to submit
- **Steps:**
  1. Submit all drafts successfully
  2. Verify success state shown
  3. Check cookies — verify draft cookies deleted
  4. Reopen "Buat tiket" on same bubble — verify no restore
- **Expected Result:** After success, draft cookies deleted; no restore on next open
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-010 — Selecting 2+ bubbles opens batch UI; "Tambah tiket" hidden
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-004
- **Pre-condition:** Multiple bubbles available
- **Steps:**
  1. Select 2+ message bubbles (multi-select)
  2. Click "Buat tiket"
  3. Verify batch UI with 1 form per bubble
  4. Verify "Tambah tiket" HIDDEN
  5. Verify each form pre-linked to its bubble
- **Expected Result:** Multi-select: batch UI with 1 form per bubble; "Tambah tiket" hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-011 — Multi-select submit creates N tickets for N bubbles
- **Type:** Positive | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Batch UI with 5 bubbles
- **Steps:**
  1. Fill all 5 forms with valid data
  2. Submit
  3. Verify 5 tickets created
  4. Verify each linked ONLY to its corresponding bubble
- **Expected Result:** N tickets for N bubbles; each links only to its corresponding bubble
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-012 — Deselecting to 1 bubble switches to single mode; shows "Tambah tiket"
- **Type:** State | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Batch UI with 3 bubbles selected
- **Steps:**
  1. Deselect 2 bubbles (keep 1)
  2. Verify modal switches to single-bubble mode
  3. Verify "Tambah tiket" button appears
- **Expected Result:** Deselecting to 1 switches to single mode; "Tambah tiket" reappears
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-013 — Bubble shows badge "Tiket: X" when tickets linked
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-022
- **Pre-condition:** Bubble with linked tickets
- **Steps:**
  1. Create 2 tickets from a bubble
  2. View that bubble in conversation room
  3. Verify badge "Tiket: 2" visible
- **Expected Result:** Bubble shows badge "Tiket: X" when tickets linked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-014 — Clicking "Tiket: X" shows list; each opens
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-023
- **Pre-condition:** Badge visible on bubble
- **Steps:**
  1. Click "Tiket: 2" badge
  2. Verify list of 2 linked tickets shown
  3. Click first — verify opens in ticket system
  4. Click second — verify opens
- **Expected Result:** Clicking "Tiket: X" shows list; each clickable and opens in Ticket System
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-015 — 20 drafts max; "Maksimal 20 tiket dalam sekali proses"
- **Type:** Negative | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Modal with 19 drafts
- **Steps:**
  1. Add 20th draft — verify success
  2. Attempt 21st
  3. Verify "Tambah tiket" disabled
  4. Verify toast "Maksimal 20 tiket dalam sekali proses"
- **Expected Result:** Max 20 drafts; 21st blocked; toast "Maksimal 20 tiket dalam sekali proses"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-016 — Drafts isolated per bubble; no mixing
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002
- **Pre-condition:** Two different bubbles with drafts
- **Steps:**
  1. Open "Buat tiket" on Bubble A — add 2 drafts
  2. Close modal
  3. Open on Bubble B — add 1 draft
  4. Close
  5. Reopen on A — verify 2 drafts (not 1 from B)
  6. Reopen on B — verify 1 draft (not 2 from A)
- **Expected Result:** Drafts isolated per bubble; independent cookie key; no cross-contamination
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-017 — Two-tab editing: last save wins; may show "Draft diperbarui"
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** Same bubble opened in two browser tabs
- **Steps:**
  1. Tab A: edit Title to "V1"
  2. Tab B: edit Title to "V2"
  3. Tab B: close/reopen — verify "V2" (last save wins)
  4. Tab A: close/reopen — verify "V2" restored
  5. Verify "Draft diperbarui" banner if state differs
- **Expected Result:** Last save wins; may show "Draft diperbarui"; no data corruption
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-018 — Cookie size limit: "Draft terlalu besar untuk disimpan otomatis"
- **Type:** Negative | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Draft with very large descriptions (exceeding 3000 char limit)
- **Steps:**
  1. Fill draft with very large description
  2. Wait for auto-save
  3. Verify warning "Draft terlalu besar untuk disimpan otomatis"
  4. Verify modal state NOT cleared
  5. Verify auto-save stopped
- **Expected Result:** Cookie exceeded: warning shown; auto-save stops; modal state preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-019 — Network timeout keeps drafts; "Koneksi bermasalah. Coba lagi"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Network failure during submission
- **Steps:**
  1. Submit with network disconnected
  2. Verify toast "Koneksi bermasalah. Coba lagi"
  3. Verify "Coba lagi" button visible
  4. Verify drafts NOT lost
  5. Reconnect — retry — verify success
- **Expected Result:** Network timeout: drafts preserved; toast + retry button; retry succeeds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-020 — Partial failure: per-draft status; retry for failed only
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004, FR-015
- **Pre-condition:** Ticket creation partially fails
- **Steps:**
  1. Submit 5 drafts; simulate failure for 2 and 4
  2. Verify "Sebagian tiket gagal dibuat"
  3. Verify per-draft status: 1=ok, 2=fail, 3=ok, 4=fail, 5=ok
  4. Click "Coba lagi untuk yang gagal"
  5. Verify retry only for 2 and 4
- **Expected Result:** Partial failure: per-draft status; retry for failed drafts only
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-021 — Duplicate submit within 10 min ignored; "Permintaan sedang diproses"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-007, FR-016
- **Pre-condition:** Agent double-clicks submit
- **Steps:**
  1. Click "Buat semua tiket"
  2. Immediately click again
  3. Verify second request ignored
  4. Verify toast "Permintaan sedang diproses"
  5. Verify only 1 set of tickets created
- **Expected Result:** Duplicate submit within 10 min ignored; "Permintaan sedang diproses"; single creation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-022 — Reference message unavailable blocks submit; "Pesan referensi tidak tersedia"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-006
- **Pre-condition:** Original bubble deleted or unavailable
- **Steps:**
  1. Open "Buat tiket" on bubble
  2. Simulate bubble becoming unavailable
  3. Attempt submit
  4. Verify "Pesan referensi tidak tersedia"
  5. Verify submit blocked
- **Expected Result:** Reference unavailable: blocks submit; "Pesan referensi tidak tersedia"; "Tutup" to close
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-023 — Cookie write failure: "Draft gagal disimpan otomatis. Periksa pengaturan browser"
- **Type:** Negative | **Priority:** P1 | **Source:** EH-002
- **Pre-condition:** Browser blocks cookies
- **Steps:**
  1. Open browser with cookies blocked
  2. Edit draft
  3. Wait for auto-save
  4. Verify banner "Draft gagal disimpan otomatis. Periksa pengaturan browser"
  5. Verify modal still functional (draft in memory)
- **Expected Result:** Cookie failure: banner shown; modal remains functional; "Tutup" available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-024 — Attachments not persisted; "Lampiran perlu diunggah ulang"
- **Type:** Edge | **Priority:** P1 | **Source:** EC-007
- **Pre-condition:** Draft with attachment fields; modal closed and reopened
- **Steps:**
  1. Create draft with attachment uploaded
  2. Close modal
  3. Reopen on same bubble
  4. Verify attachment fields empty
  5. Verify "Lampiran perlu diunggah ulang" inside draft
  6. Verify text fields restored correctly
- **Expected Result:** Attachments not persisted in cookies; require re-attach; message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket — Team Inbox Member Drawer and Online Status HUD

### SC-MEMBERHUD-001 — HUD shows "Anggota {n} • Online {m}" in header
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001
- **Pre-condition:** Team Inbox selected with 5 members (3 online, 2 offline)
- **Steps:**
  1. Select Team Inbox in sidebar
  2. Verify HUD shows "Anggota 5 • Online 3"
  3. Verify HUD is clickable
  4. Verify counts update when members go online/offline
- **Expected Result:** HUD shows "Anggota {n} • Online {m}"; clickable; counts update in real-time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-002 — Online count includes Active + Away; transition doesn't change count
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-002
- **Pre-condition:** Team Inbox with Active and Away members
- **Steps:**
  1. Note current Online count (Active + Away)
  2. Member goes Active to Away — verify count same
  3. Member goes Away to Offline — verify count decrements
- **Expected Result:** Online = Active + Away; Active-to-Away no change; Away-to-Offline decrements
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-003 — Presence unavailable: HUD shows "Online -"; Inbox usable
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-004
- **Pre-condition:** Presence service down
- **Steps:**
  1. Simulate presence unavailability
  2. Verify HUD shows "Online -"
  3. Verify Team Inbox fully usable
  4. Verify member list accessible (with Unknown presence)
- **Expected Result:** Presence unavailable: "Online -"; Inbox usable; members show "Tidak diketahui"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-004 — Clicking HUD opens Member Drawer
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-005
- **Pre-condition:** HUD visible in Team Inbox header
- **Steps:**
  1. Click on HUD "Anggota 5 • Online 3"
  2. Verify Member Drawer opens (right-side)
  3. Verify member list shown
  4. Verify supervisors section at top
  5. Verify close button available
- **Expected Result:** Clicking HUD opens Member Drawer with member list; supervisors section at top
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-005 — Presence updates refresh list and counts without reload
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-013
- **Pre-condition:** Member Drawer open; member changes presence
- **Steps:**
  1. Open Member Drawer
  2. Member goes Active to Away — verify list updates
  3. Member goes Away to Offline — verify list updates
  4. Verify HUD counts update simultaneously
  5. Verify no reload needed
- **Expected Result:** Presence updates refresh drawer list and HUD counts without reload; real-time via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-006 — No access shows "Akses ditolak"; drawer does not open
- **Type:** Permission | **Priority:** P0 | **Source:** US-002, EH-001
- **Pre-condition:** User without Team Inbox access
- **Steps:**
  1. Login as user without access
  2. Attempt to click HUD
  3. Verify "Akses ditolak" shown
  4. Verify drawer does NOT open
- **Expected Result:** No access: "Akses ditolak"; drawer does not open
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-007 — Supervisors section at top listing supervisors first
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-007, FR-014
- **Pre-condition:** Team Inbox with supervisors and members; drawer open
- **Steps:**
  1. Open Member Drawer
  2. Verify "Supervisor" section at top
  3. Verify supervisors listed first with badge
  4. Verify members listed below
- **Expected Result:** Supervisors section at top; supervisors first with "Supervisor" badge; members below
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-008 — No supervisors shows "Belum ada supervisor"
- **Type:** Edge | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Team Inbox with no supervisors
- **Steps:**
  1. Open Member Drawer for Team Inbox with 0 supervisors
  2. Verify "Belum ada supervisor" shown
  3. Verify members section renders normally
- **Expected Result:** No supervisors: "Belum ada supervisor"; members unaffected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-009 — Search by name or email with 300ms debounce
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-012
- **Pre-condition:** Member Drawer open with multiple members
- **Steps:**
  1. Type in search "Cari nama atau email"
  2. Type member name — verify filter after 300ms debounce
  3. Type member email — verify match
  4. Verify case-insensitive
  5. Clear — verify full list restored
- **Expected Result:** Search by name/email; 300ms debounce; case-insensitive; clearing restores list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-010 — Online filter shows only Active + Away members
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-010
- **Pre-condition:** Member Drawer with mixed presence
- **Steps:**
  1. Click "Online" filter
  2. Verify only Active and Away shown
  3. Verify Offline hidden
  4. Verify counts updated
- **Expected Result:** Online filter: Active + Away only; Offline hidden; counts update
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-011 — Offline filter shows only Offline members
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-011
- **Pre-condition:** Member Drawer with mixed presence
- **Steps:**
  1. Click "Offline" filter
  2. Verify only Offline shown
  3. Verify Active/Away hidden
- **Expected Result:** Offline filter: Offline only; Active/Away hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-012 — No results shows "Tidak ada hasil" and keeps search term
- **Type:** Edge | **Priority:** P0 | **Source:** US-004
- **Pre-condition:** Search yields no matches
- **Steps:**
  1. Type "xyznonexistent" in search
  2. Verify "Tidak ada hasil" shown
  3. Verify search term preserved in input
  4. Clear — verify full list restored
- **Expected Result:** No results: "Tidak ada hasil"; search term kept; clearing restores list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-013 — "Tambah anggota" opens modal; multi-select up to 50
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-025, FR-026
- **Pre-condition:** Member Drawer open; user has permission
- **Steps:**
  1. Click "Tambah anggota"
  2. Verify Add Member modal opens
  3. Verify search and list of existing users
  4. Multi-select 3 users
  5. Verify max 50 per submission
  6. Click "Tambahkan"
- **Expected Result:** "Tambah anggota" opens modal with picker; multi-select up to 50; confirm adds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-014 — Already-member disabled with "Anggota sudah terdaftar"
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-004
- **Pre-condition:** Add Member modal open; user already in team
- **Steps:**
  1. Open Add Member modal
  2. Search for user already in team
  3. Verify row disabled (greyed out)
  4. Verify "Anggota sudah terdaftar" label
- **Expected Result:** Already-member: row disabled; "Anggota sudah terdaftar"; cannot select
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-015 — No permission: "Tambah anggota" hidden or disabled
- **Type:** Permission | **Priority:** P0 | **Source:** US-005, FR-024
- **Pre-condition:** User without manage membership permission
- **Steps:**
  1. Login as user without permission
  2. Open Member Drawer
  3. Verify "Tambah anggota" hidden or disabled
- **Expected Result:** No permission: "Tambah anggota" hidden or disabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-016 — After add, drawer list and HUD counts update immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-028
- **Pre-condition:** Members just added to Team Inbox
- **Steps:**
  1. Add 2 new members via modal
  2. Confirm
  3. Verify new members appear in drawer immediately
  4. Verify HUD count increased by 2
  5. Verify Online count updated if new members online
- **Expected Result:** After add: drawer list and HUD counts update immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-017 — "Hapus dari tim" shows confirmation modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-031
- **Pre-condition:** Member Drawer open; user has permission
- **Steps:**
  1. Click "Hapus dari tim" on member row
  2. Verify confirmation modal: "Hapus anggota?"
  3. Verify body: "User akan kehilangan akses ke Team Inbox ini."
  4. Verify "Hapus" and "Batal" buttons
  5. Click "Batal" — verify member NOT removed
- **Expected Result:** "Hapus dari tim" shows confirmation modal; "Batal" preserves; "Hapus" removes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-018 — Confirming removal removes member and updates counts
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-033
- **Pre-condition:** Confirmation modal shown
- **Steps:**
  1. Click "Hapus"
  2. Verify member removed from drawer
  3. Verify HUD count decremented
  4. Verify audit log entry
- **Expected Result:** Confirming: member removed; counts decremented; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-019 — Removing last supervisor blocked: "Minimal 1 supervisor harus tetap ada"
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-006, FR-035
- **Pre-condition:** Team Inbox with exactly 1 supervisor
- **Steps:**
  1. Click "Hapus dari tim" on the only supervisor
  2. Confirm removal
  3. Verify removal blocked
  4. Verify "Minimal 1 supervisor harus tetap ada"
  5. Verify supervisor NOT removed
- **Expected Result:** Removing last supervisor blocked; "Minimal 1 supervisor harus tetap ada"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-020 — Removed member who was assignee: auto-unassign; logged
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-036, FR-037
- **Pre-condition:** Member assigned to conversations; being removed
- **Steps:**
  1. Note conversations assigned to member being removed
  2. Remove member
  3. Verify conversations become Unassigned (assignee = null)
  4. Verify toast "Assignee diperbarui" or "Perubahan assignee sedang diproses"
  5. Verify audit: auto-unassign with impacted count
- **Expected Result:** Removed member's conversations auto-unassigned; audit logged with impacted count
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-021 — Away/Offline last seen shows relative time
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-020
- **Pre-condition:** Member Drawer open; Away/Offline members present
- **Steps:**
  1. Open Member Drawer
  2. Verify Away member shows "Away" + relative last seen (e.g. "5 menit lalu")
  3. Verify Offline member shows "Offline" + relative last seen
  4. Verify format: minutes (1-59 menit), hours (1-23 jam), days (1-30 hari)
  5. Verify >30 days shows "Lebih dari 30 hari lalu"
- **Expected Result:** Relative last seen: {x} menit lalu / jam lalu / hari lalu; >30 = "Lebih dari 30 hari lalu"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-022 — Active member shows "Aktif sekarang"
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-021
- **Pre-condition:** Member Drawer open; Active members present
- **Steps:**
  1. Open Member Drawer
  2. Verify Active member shows "Online" label
  3. Verify last seen "Aktif sekarang"
- **Expected Result:** Active member: presence "Online"; last seen "Aktif sekarang"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-023 — Last seen unavailable shows "-"
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, FR-022
- **Pre-condition:** Member with no last seen data
- **Steps:**
  1. Open Member Drawer
  2. Find member with unavailable last seen
  3. Verify last seen "-"
  4. Verify row still usable
  5. If presence also unavailable: verify "Tidak diketahui"
- **Expected Result:** Last seen unavailable: "-"; row usable; "Tidak diketahui" if presence also unavailable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-024 — 0 members: HUD "Anggota 0 • Online 0"; drawer "Belum ada anggota"
- **Type:** Edge | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Team Inbox with 0 members
- **Steps:**
  1. Open Team Inbox with 0 members
  2. Verify HUD "Anggota 0 • Online 0"
  3. Click HUD to open drawer
  4. Verify "Belum ada anggota" empty state
  5. Verify drawer not broken; close works
- **Expected Result:** 0 members: HUD "Anggota 0 • Online 0"; drawer "Belum ada anggota"; UI intact
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---
