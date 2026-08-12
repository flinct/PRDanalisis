# Conversation Scenario Catalog — ENRICHED (Full)

> **Author:** Dany Christian · **Created:** 2026-08-07
> **Scope:** All 30 SatuInbox Conversation PRDs (V2 + adjacent)
> **Total Scenarios:** 729 (344 DEVELOPED + 101 UNDEVELOPED + 50 PARTIAL + 234 ADJACENT/UNKNOWN)
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Test Env:** https://dev-v2.satuinbox.com

> **Status Legend:**
> - **DEVELOPED** = full steps + `(QA fills)` for actual result
> - **UNDEVELOPED** = `[UNDEV]` tag, steps = `[UNDEVELOPED — PRD defines intent but feature not built yet]`, actual = `(N/A — not built)`
> - **PARTIAL** = mix of developed/undeveloped per sub-feature
> - **UNKNOWN** = `Status: UNKNOWN — verify against FE/BE implementation`
> - **ADJACENT** = from neighboring domain (SLA, RLT, Analytics, API, etc.)

> **Known Risks:**
> - Hold/Snooze/SLA 3-way conflict: SC-SLA-006, SC-SLA-007, SC-SLA-022, SC-SLA-023
> - Wait-Time calculation gap when agent unassigned: SC-METRICS-002, SC-METRICS-022
> - Transcript email PRD overlap: PRD Inbox Conversation reply via email vs PRD Ticket Live Chat Transcript Reply via Email (near-duplicate)
> - 2 UNKNOWN-verify PRDs: Shared Attribute Search, Shopee Channel Add-On

---

---

## Part A: SC-INBOX (Omnichannel Inbox) — 30 scenarios

# Conversation Scenario Catalog — SC-INBOX: Omnichannel Inbox (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Source:** `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox.md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv` (SIX-Convo-001..725)

---

### SC-INBOX-001 — Unified Inbox shows all conversations with channel indicators
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent logged in, at least 2 conversations exist from different channels (e.g. WhatsApp + Live Chat)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify `[data-cy="Conversation-Section"]` is visible
  3. Verify `[data-cy="chat-list-1"]` through at least `chat-list-2` are populated
  4. Verify each row shows `[data-cy="chat-list-N-channel-icon"]` with correct channel icon (WA icon, Live Chat icon, etc.)
- **Expected Result:** All conversations from all connected channels appear in unified list; each row displays correct channel icon
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-001 (partial — unassigned only)

---

### SC-INBOX-002 — Conversations update in real-time via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Agent on conversation page; customer sends new message from external device
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Note current chat list top item timestamp
  3. Send a WhatsApp message from test phone to linked number
  4. Observe chat list — new/updated conversation should bubble to top within 3 seconds
  5. Verify no manual page refresh needed
- **Expected Result:** New inbound message triggers real-time socket update; conversation moves to top of list; unread badge increments
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-003 — Infinite scroll loads ≥1000 conversations in <1s
- **Type:** Positive | **Priority:** P0 | **Source:** US-1
- **Pre-condition:** Workspace with ≥1000 conversations
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify initial batch loads (first ~20 conversations visible)
  3. Scroll to bottom of chat list
  4. Verify next batch loads automatically (no "Load More" button needed)
  5. Repeat scroll until ≥1000 conversations loaded
  6. Measure total load time from first scroll to last batch rendered
- **Expected Result:** All ≥1000 conversations load via infinite scroll; total load time <1 second; no UI freeze
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-004 — Multi-select channel filter available
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Agent logged in; workspace has conversations from WhatsApp, Live Chat, IG
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Click channel filter `[data-cy="chatList-filter-status"]` or channel filter icon
  3. Select "WhatsApp" — verify only WA conversations shown
  4. Also select "Live Chat" (multi-select) — verify both WA and Live Chat shown
  5. Verify IG conversations hidden
- **Expected Result:** Multi-select filter narrows to selected channels only; conversation count updates
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-004 (partial — starred/spam/pinned)

---

### SC-INBOX-005 — Reset Filters button restores default state
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Agent has applied channel filter
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Apply channel filter (e.g. WhatsApp only)
  3. Verify filtered view is active
  4. Click "Reset Filters" button
  5. Verify all channels visible again
- **Expected Result:** Reset clears all active filters; full conversation list restored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-006 — Filter state persists per tab/session (cookies)
- **Type:** Positive | **Priority:** P0 | **Source:** US-2
- **Pre-condition:** Agent logged in
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Apply channel filter (e.g. WhatsApp only)
  3. Switch to a different tab (e.g. Starred)
  4. Switch back to Your Inbox
  5. Verify filter still active (WhatsApp only)
  6. Hard-refresh page (Ctrl+Shift+R)
  7. Verify filter still active from cookie
- **Expected Result:** Filter state persists across tab switches and page refreshes via cookie storage
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-07 (partial — scroll and filter persist)

---

### SC-INBOX-007 — Tags can be added and removed on conversations
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Agent on conversation page; tag management configured
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open a conversation room (click `chat-list-1`)
  3. In detail panel, find tag section
  4. Add tag "CS Pre-order" — verify tag appears
  5. Remove tag "CS Pre-order" — verify tag removed
- **Expected Result:** Tags add/remove successfully; changes reflect immediately in room and chat list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-008 — Tags visible as badges in chat list
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** Conversation has at least 1 tag assigned
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Locate the tagged conversation in chat list
  3. Verify tag badge visible on the chat list row
  4. Verify badge text matches assigned tag name
- **Expected Result:** Tag appears as colored badge on chat list row; badge shows tag name
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-009 — Tag 2-way sync with WhatsApp Business API
- **Type:** Positive | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** WhatsApp Business API connected; tag sync enabled
- **Steps:**
  1. Add tag "VIP" to conversation in SatuInbox
  2. Check WhatsApp Business Manager — verify tag appears on contact
  3. Add tag "Priority" in WhatsApp Business Manager
  4. Check SatuInbox conversation — verify tag appears
- **Expected Result:** Tags sync bidirectionally between SatuInbox and WhatsApp Business API within 5 seconds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-010 — Tag sync failure shows toast "Gagal sinkronisasi tag"
- **Type:** Negative | **Priority:** P0 | **Source:** US-3
- **Pre-condition:** WhatsApp Business API connection unstable or disconnected
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open a conversation
  3. Attempt to add tag while API is disconnected
  4. Verify toast appears with text "Gagal sinkronisasi tag"
  5. Verify tag is NOT added locally (or added with "pending sync" state)
- **Expected Result:** Toast "Gagal sinkronisasi tag" shown; tag state consistent (not partially synced)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-011 — Multi-session login supported for multiple WhatsApp numbers
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** Workspace has 2+ WhatsApp numbers linked
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Verify session switcher dropdown visible in header/sidebar
  3. Switch from WhatsApp #1 to WhatsApp #2
  4. Verify conversations update to show #2's inbound chats
  5. Switch back to #1 — verify conversations restored
- **Expected Result:** Session switcher allows toggling between WhatsApp numbers; each shows its own conversations
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-012 — Session switcher dropdown available for multi-session
- **Type:** Positive | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** 2+ sessions active
- **Steps:**
  1. Verify session switcher dropdown is visible when ≥2 sessions exist
  2. Click dropdown — verify all active sessions listed
  3. Select a session — verify list updates
  4. Verify dropdown shows current session name/number
- **Expected Result:** Dropdown lists all sessions; selecting one switches context; current session highlighted
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-45 (partial — send-as identity)

---

### SC-INBOX-013 — Expired token detected, error "Sesi WA perlu login ulang"
- **Type:** Negative | **Priority:** P0 | **Source:** US-4
- **Pre-condition:** WhatsApp session token has expired
- **Steps:**
  1. Simulate expired token (disconnect session or wait for expiry)
  2. Navigate to `/id/conversation/your-inbox`
  3. Verify error toast/banner: "Sesi WA perlu login ulang"
  4. Verify session is disabled (cannot send/receive)
  5. Verify re-login flow is accessible
- **Expected Result:** Error "Sesi WA perlu login ulang" shown; session locked until re-authenticated
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-014 — WhatsApp Group shows participant list and sender name
- **Type:** Positive | **Priority:** P0 | **Source:** US-5
- **Pre-condition:** Agent has access to a WhatsApp Group conversation
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open a WhatsApp Group conversation
  3. Verify group participant list visible in detail panel
  4. Verify each message bubble shows sender name above content
- **Expected Result:** Group conversations display participant list; each message shows sender name
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-43..47 (partial — group metadata, send-as)

---

### SC-INBOX-015 — Group chat linked to >1 number shows dropdown session switcher
- **Type:** Positive | **Priority:** P0 | **Source:** US-5
- **Pre-condition:** WA Group linked to 2+ WhatsApp numbers
- **Steps:**
  1. Open the group conversation
  2. Verify session switcher dropdown appears in composer
  3. Switch identity — verify outbound uses selected number
- **Expected Result:** Session switcher visible; switching changes outbound identity for this group
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-45 (send-as identity)

---

### SC-INBOX-016 — Group chat cannot be resolved (manual tracking)
- **Type:** Negative | **Priority:** P0 | **Source:** US-5
- **Pre-condition:** Agent viewing a WhatsApp Group conversation
- **Steps:**
  1. Open a WA Group conversation in room
  2. Verify "Resolve" button is NOT visible or is disabled
  3. Verify no auto-close behavior for group chats
- **Expected Result:** Group chats cannot be resolved; resolve action hidden/disabled; manual tracking required
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-017 — Connection Lost indicator shown when session disconnects
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Agent online with active WhatsApp session
- **Steps:**
  1. Disconnect internet on WhatsApp session device (or kill backend socket)
  2. Verify "Connection Lost" indicator appears in SatuInbox UI within 10 seconds
  3. Verify indicator is visible in sidebar/header area
- **Expected Result:** "Connection Lost" indicator appears within 10s of disconnection; clearly visible to agent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-018 — Degraded Network indicator for unstable connections
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Network quality degraded (high latency/packet loss)
- **Steps:**
  1. Simulate degraded network (throttle to 50kbps or add latency)
  2. Verify "Jaringan tidak stabil" or degraded network indicator appears
  3. Verify indicator is distinct from "Connection Lost"
- **Expected Result:** Degraded network indicator shown; distinct from full disconnection; real-time quality monitoring active
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-019 — Auto-retry with exponential backoff on connection issues
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Connection drops intermittently
- **Steps:**
  1. Simulate connection drop
  2. Verify system attempts auto-reconnect
  3. Verify retry intervals increase (1s, 2s, 4s, 8s...)
  4. Verify connection restores automatically when network returns
- **Expected Result:** Auto-retry with exponential backoff; reconnection succeeds within 5s of network restoration
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-020 — Retry button displayed for connection recovery
- **Type:** Positive | **Priority:** P0 | **Source:** US-6
- **Pre-condition:** Connection lost state active
- **Steps:**
  1. While connection is lost, verify "Retry" button visible
  2. Click "Retry" button
  3. Verify manual reconnection attempt triggers
  4. Verify connection restores if network is available
- **Expected Result:** Retry button visible during disconnection; clicking it attempts immediate reconnect; succeeds when network available
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-35 (partial — sidebar retry)

---

### SC-INBOX-021 — Dev vs Prod isolation enforced (tenant separation)
- **Type:** Permission | **Priority:** P0 | **Source:** US-7
- **Pre-condition:** Agent logged into Dev environment
- **Steps:**
  1. Login as Dev agent
  2. Verify only Dev conversations visible
  3. Attempt to access Prod URL directly (change subdomain/endpoint)
  4. Verify blocked with "Akses ditolak" or redirect
- **Expected Result:** Dev agent cannot access Prod data; cross-environment access blocked with error
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-022 — Multi-company data separation
- **Type:** Permission | **Priority:** P0 | **Source:** US-7
- **Pre-condition:** Agent belongs to Company A
- **Steps:**
  1. Login as Company A agent
  2. Verify only Company A conversations visible
  3. Attempt API call with Company B ID (if accessible)
  4. Verify 403 or empty result
- **Expected Result:** Company A agent sees only Company A data; cross-tenant access returns 403 or empty
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-023 — Browser tab title changes on new message
- **Type:** Positive | **Priority:** P1 | **Source:** US-8
- **Pre-condition:** Agent on inbox page; tab not focused
- **Steps:**
  1. Switch to another browser tab
  2. Send message from customer phone
  3. Verify browser tab title changes (e.g. "(1) SatuInbox" or notification badge)
  4. Switch back to SatuInbox tab — verify title resets
- **Expected Result:** Tab title shows unread count when new message arrives and tab is unfocused; resets on focus
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-024 — Audio notification plays on new message
- **Type:** Positive | **Priority:** P1 | **Source:** US-8
- **Pre-condition:** Agent on inbox page; browser audio not muted
- **Steps:**
  1. Keep SatuInbox tab open (can be focused or unfocused)
  2. Send message from customer phone
  3. Verify audio notification plays
  4. Verify audio is short notification tone (not continuous)
- **Expected Result:** Audio notification plays on new inbound message; short tone; does not repeat for same message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-025 — Red unread badge counter increments
- **Type:** Positive | **Priority:** P1 | **Source:** US-8
- **Pre-condition:** Agent has 0 unread messages
- **Steps:**
  1. Verify unread badge shows 0 or is hidden
  2. Send 3 messages from customer phone (3 separate conversations)
  3. Verify badge increments to 3
  4. Open one conversation — verify badge decrements to 2
- **Expected Result:** Red badge increments per unread; decrements when conversation opened; real-time via socket
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-25 (partial — unread badge real-time)

---

### SC-INBOX-026 — Phone numbers masked for non-admin roles
- **Type:** Permission | **Priority:** P1 | **Source:** US-9
- **Pre-condition:** Agent logged in (non-admin role); conversation with phone number visible
- **Steps:**
  1. Login as regular Agent (non-admin)
  2. Open conversation in chat list
  3. Verify phone number shows masked (e.g. 08xxxx1234)
  4. Login as Admin
  5. Verify same phone number shows full (081234567890)
- **Expected Result:** Non-admin sees masked phone (08xxxx1234); Admin sees full number
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-027 — Screenshot button if SAP add-on enabled
- **Type:** Positive | **Priority:** P1 | **Source:** US-10
- **Pre-condition:** SAP screenshot add-on enabled for workspace
- **Steps:**
  1. Open conversation room
  2. Verify screenshot button visible in room header
  3. Click screenshot — verify PNG captured
  4. Verify image sent to SAP API (check network tab or confirmation toast)
- **Expected Result:** Screenshot button visible when add-on enabled; captures PNG; sends to SAP; confirmation shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-23 (partial — screenshot button)

---

### SC-INBOX-028 — Active/Away presence indicator
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Multiple agents online
- **Steps:**
  1. Navigate to conversation page
  2. Verify presence indicators on agent avatars (green = Active, yellow = Away)
  3. Change own status to Away — verify indicator updates
  4. Verify other agents see updated status in real-time
- **Expected Result:** Presence indicators show Active/Away; status changes propagate via socket within 3 seconds
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-006..008 (partial — initial/photo icon)

---

### SC-INBOX-029 — Chat retention ≥6 months; auto-archive after 6; auto-delete after 12
- **Type:** Positive | **Priority:** P2 | **Source:** US-12
- **Pre-condition:** Workspace with retention policy active; test data with known timestamps
- **Steps:**
  1. Verify conversations older than 6 months are archived (not visible in active inbox)
  2. Verify archived chats retrievable within 3 seconds via search/filter
  3. Verify conversations older than 12 months are deleted
  4. Verify audit log records archive/delete actions
- **Expected Result:** 6-month archive, 12-month delete enforced; archived retrievable <3s; audit logged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-INBOX-030 — Create Ticket from conversation with auto-link
- **Type:** Positive | **Priority:** P2 | **Source:** US-13
- **Pre-condition:** Agent viewing active conversation
- **Steps:**
  1. Open conversation room
  2. Right-click or use action menu → "Create Ticket"
  3. Fill ticket form and submit
  4. Verify ticket created with reference ID
  5. Verify conversation shows ticket badge/link
  6. Verify ticket in Ticket System references back to conversation
- **Expected Result:** Ticket created and auto-linked to conversation; bidirectional reference visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** SIX-Convo-Gap-22 (partial — create ticket from message)


---

## Part A: SC-INBOXNAV + SC-TEAMNAV + SC-CHATLIST — 82 scenarios

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


---

## Part A: SC-ROOM + SC-DETAIL + SC-PULL — 71 scenarios

# Conversation Scenario Catalog — SC-ROOM · SC-DETAIL · SC-PULL (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:** `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Conversation Room.md`, `…Conversation Detail.md`, `…Get New Conversation (Agent Pull Queue).md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv` (SIX-Convo-001..725)

---

## PRD Ticket - Omnichannel Inbox - Conversation Room

### SC-ROOM-001 — Header shows channel icon, avatar (fallback to channel icon), identity per channel rules
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent logged in; conversation open with at least 1 message
- **Steps:**
  1. Open a WhatsApp 1:1 conversation room
  2. Verify `[data-cy="Chat-Room-Header"]` is visible
  3. Verify `[data-cy="Chat-Room-Header-Contact-Avatar"]` shows contact avatar or channel icon fallback
  4. Verify `[data-cy="Chat-Room-Header-Contact-Name"]` shows phone/alias/contact name per identity rules
  5. Open a WhatsApp Group conversation — verify group name shown
  6. Open a Live Chat conversation — verify name or "Guest" + ID shown
- **Expected Result:** Header displays channel icon, avatar (with channel icon fallback), and identity per channel rules (WA 1:1: phone/alias/contact; WA Group: group name; Live Chat: name/Guest+ID)
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-002 — Header controls: Screenshot (if add-on active), Close, More (⋮) menu
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent viewing an ongoing assigned conversation
- **Steps:**
  1. Open an ongoing conversation assigned to current agent
  2. Verify `[data-cy="Chat-Room-Header"]` shows Close button (`chatRoom-closeConversationButton`)
  3. Verify More (⋮) menu is visible (alias change, hold/resume, reminder)
  4. If SAP add-on active, verify screenshot button visible
  5. If SAP add-on inactive, verify screenshot button NOT visible
- **Expected Result:** Header controls visible based on context: Close button for ongoing assigned chats; More menu with alias/hold/resume/reminder; Screenshot only when add-on active
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-003 — Actions update instantly (<1s)
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent viewing conversation room with active controls
- **Steps:**
  1. Click Close on an ongoing conversation
  2. Verify status change reflects within <1s
  3. Click an action from the More (⋮) menu
  4. Verify UI update reflects within <1s
- **Expected Result:** All header actions (Close, More menu items) update conversation state within <1s
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-004 — Presence indicator (green) shown only if channel supports it; updates via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent viewing conversation; channel supports presence (WhatsApp, Live Chat)
- **Steps:**
  1. Open a WhatsApp conversation where contact is online
  2. Verify green presence indicator visible near avatar
  3. Simulate contact going offline — verify indicator changes/disappears within 3s via socket
  4. Open a conversation on a channel that does NOT support presence
  5. Verify no presence indicator shown
- **Expected Result:** Green presence indicator shown only for channels that support it; updates in real-time via socket; absent for unsupported channels
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-005 — Typing indicator shows agent names (max 5); >5 shows "and x more"; real-time via socket
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Multiple agents viewing same conversation
- **Steps:**
  1. Have 3 agents start typing in the same conversation
  2. Verify typing indicator shows all 3 agent names
  3. Have 2 more agents start typing (total 5) — verify all 5 names shown
  4. Have 6th agent start typing — verify shows 5 names + "and 1 more"
  5. Stop typing — verify indicator updates in real-time
- **Expected Result:** Typing indicator shows up to 5 agent names; overflow shows "and x more"; updates in real-time via socket
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-006 — Agent vs client bubbles visually distinct; private notes styled separately
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation with agent messages, client messages, and private notes
- **Steps:**
  1. Open a conversation with mixed message types
  2. Verify agent bubbles appear right-aligned with distinct color
  3. Verify client bubbles appear left-aligned with different color
  4. Verify private notes have yellow background and agent-only visibility
  5. Verify day separators (`[data-cy="Day-Separator"]`) shown between different days
- **Expected Result:** Agent (right, blue) and client (left, grey) bubbles visually distinct; private notes styled with yellow background; day separators shown between dates
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-007 — Timestamp: Relative (<7 days) or full date; inline reply-to shows referenced message above
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation with messages from various dates and reply-to chains
- **Steps:**
  1. Open a conversation with messages from today
  2. Verify timestamps show relative format (e.g., "3h ago")
  3. Open a conversation with messages older than 7 days
  4. Verify timestamps show full date format
  5. Find a reply-to message — verify referenced message shown above the reply bubble
  6. Click referenced message — verify scroll jumps to original
- **Expected Result:** Relative timestamps for <7 days, full date otherwise; inline reply-to shows referenced message with click-to-jump
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-008 — Message status: Pending (spinner), Sent (✓), Delivered (✓✓ grey), Read (✓✓ blue), Failed (red with retry)
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent sends a message in a WhatsApp conversation
- **Steps:**
  1. Type and send a message in a WhatsApp conversation
  2. Verify message shows Pending status (loading spinner)
  3. Verify status transitions to Sent (✓) within a few seconds
  4. Verify status transitions to Delivered (✓✓ grey) when recipient receives it
  5. Verify status transitions to Read (✓✓ blue) when recipient reads it
  6. Simulate send failure — verify red error icon with retry option shown
- **Expected Result:** Message status progresses through Pending → Sent → Delivered → Read with correct visual indicators; failure shows red icon with retry
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-009 — Auto-retry failed messages every 5s (max 3 attempts)
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Message send fails due to transient error
- **Steps:**
  1. Send a message that will fail (simulate network error)
  2. Verify red failed indicator appears
  3. Wait 5 seconds — verify auto-retry attempt 1
  4. Wait another 5 seconds — verify auto-retry attempt 2 (if still failing)
  5. Wait another 5 seconds — verify auto-retry attempt 3
  6. After 3 failed attempts, verify retry stops and manual retry option remains
- **Expected Result:** Failed messages auto-retry every 5s up to 3 attempts; after max retries, manual retry option remains visible
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-010 — Inactive channel prompts relogin popup
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** WhatsApp session is inactive or expired
- **Steps:**
  1. Open a conversation on an inactive/expired WhatsApp session
  2. Attempt to send a message
  3. Verify relogin popup appears (e.g., `[data-cy="Chat-Room-Expired-Whatsapp-Banner"]`)
  4. Verify popup offers relogin CTA
- **Expected Result:** Inactive channel triggers relogin popup; message sending blocked until session restored
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-011 — [UNDEV] Reminder modal: One-time (date+time) or recurring (hourly/daily/weekly/monthly)
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent on conversation room header
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Reminder modal supports one-time (date+time) and recurring (hourly/daily/weekly/monthly) options
- **Actual Result:** *(N/A — not built)*

---

### SC-ROOM-012 — [UNDEV] Reminder visible in Conversation Details; notifications sent via browser/push at scheduled time
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Reminder has been set on a conversation
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Reminder appears in Conversation Details panel; browser/push notification fires at scheduled time
- **Actual Result:** *(N/A — not built)*

---

### SC-ROOM-013 — [UNDEV] Reminder set info and upcoming reminder shown in chat room history
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Reminder set on an active conversation
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** System message showing reminder info appears in chat room history; upcoming reminder visible to agent
- **Actual Result:** *(N/A — not built)*

---

### SC-ROOM-014 — Chat actions: Copy, Pin Conversation, Copy Link to Message; multi-select for bulk
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent viewing conversation with messages
- **Steps:**
  1. Right-click or long-press on a message bubble
  2. Verify context menu appears with Copy, Pin Conversation, Copy Link to Message options
  3. Click Copy — verify message content copied to clipboard
  4. Click Pin Conversation — verify conversation pinned
  5. Select multiple messages (multi-select mode) — verify bulk actions available
- **Expected Result:** Context menu provides Copy, Pin, Copy Link actions; multi-select enables bulk actions; all functional
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-015 — Actions logged; failures show toast
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent performs actions in conversation room
- **Steps:**
  1. Perform a chat action (e.g., Copy, Pin)
  2. Verify action is logged in conversation events/timeline
  3. Simulate action failure (e.g., network error during pin)
  4. Verify toast notification appears with failure message
- **Expected Result:** All actions logged to conversation events; failures display toast notification
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-016 — [UNDEV] Hold/Resume from header; Snooze requires optional note; Resume restores SLA timer; Hold status visible in Chat List and header
- **Type:** State | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent on ongoing conversation with SLA active
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Hold/Snooze accessible from header; optional note on snooze; resume restores SLA timer; hold status shown in chat list and header
- **Actual Result:** *(N/A — not built)*

---

### SC-ROOM-017 — Ticket creation from single/multi-select messages; auto-linked to chat
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent viewing conversation with messages
- **Steps:**
  1. Select a single message bubble
  2. Click "Create Ticket" action
  3. Verify Create Ticket modal (`[data-cy="Create-Ticket-Modal"]`) opens
  4. Fill required fields and submit
  5. Verify ticket created with reference ID
  6. Verify conversation shows ticket link/badge
  7. Verify ticket in Ticket System references back to this conversation
- **Expected Result:** Ticket creation from single or multi-select messages; ticket auto-linked to conversation with bidirectional reference
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-018 — Thread search highlights keywords; Next/Previous navigation; result counter; filter by date
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent on conversation with 50+ messages
- **Steps:**
  1. Open thread search (search icon in room header area)
  2. Type a keyword present in multiple messages
  3. Verify matching keywords highlighted in message bubbles
  4. Verify result counter shows total matches (e.g., "3 of 7")
  5. Click Next — verify navigation to next match
  6. Click Previous — verify navigation to previous match
  7. Apply date filter via calendar picker — verify results filtered by date range
- **Expected Result:** Thread search highlights keywords, provides Next/Previous navigation with counter, and supports date filtering
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-019 — Support text, images, audio, video, documents, voice notes; max 100MB; invalid format/size shows error toast
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent on conversation room with input area active
- **Steps:**
  1. Send a text message — verify delivered
  2. Send an image (jpg/png) — verify delivered and viewable inline
  3. Send an audio file — verify delivered and playable
  4. Send a video — verify delivered
  5. Send a document (pdf, docx) — verify delivered
  6. Attempt to upload a file >100MB — verify error toast shown
  7. Attempt to upload an unsupported format — verify error toast shown
- **Expected Result:** All supported formats (text, images, audio, video, docs, voice notes) deliver correctly; invalid format/size blocked with error toast
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-020 — Download attachment prompts confirmation
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Conversation with received attachments
- **Steps:**
  1. Click on a received attachment to download
  2. Verify confirmation prompt appears
  3. Confirm download — verify file downloads successfully
- **Expected Result:** Clicking attachment triggers confirmation prompt before download
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-021 — Ctrl+V pastes text/images from clipboard; image converts to attachment
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent on conversation room; text area focused
- **Steps:**
  1. Copy text to clipboard, press Ctrl+V in text area
  2. Verify text inserted into text area
  3. Copy an image to clipboard (screenshot), press Ctrl+V
  4. Verify image converted to attachment preview (jpg/png, ≤100MB)
  5. Verify attachment shown before send
- **Expected Result:** Ctrl+V inserts text directly; images converted to attachment preview; both ≤100MB validated
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-022 — Drag & drop files into text area; shows preview before upload; max 100MB; validates format
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent on conversation room
- **Steps:**
  1. Drag a valid file (e.g., .jpg) into the text area
  2. Verify file preview shown before upload
  3. Verify file size validated (≤100MB)
  4. Verify format validated (jpg, png, mp3, mp4, pdf, docx)
  5. Click send to upload
- **Expected Result:** Drag & drop shows preview; validates size (≤100MB) and format; upload on send
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-023 — Invalid paste format/size shows toast "Format tidak valid atau ukuran melebihi 100MB"
- **Type:** Negative | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent attempts to paste invalid content
- **Steps:**
  1. Attempt to paste a file format not supported (e.g., .exe) via Ctrl+V
  2. Verify toast: "Format tidak valid atau ukuran melebihi 100MB"
  3. Attempt to paste an image >100MB
  4. Verify same toast appears
- **Expected Result:** Invalid format or oversized paste blocked with toast "Format tidak valid atau ukuran melebihi 100MB"
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-024 — Auto-expand text area on input (up to 5 lines); emoji picker available
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Agent on conversation room
- **Steps:**
  1. Click into text area (`[data-cy="Message-Text-Input"]`)
  2. Type text that spans multiple lines
  3. Verify text area auto-expands up to 5 lines
  4. Click emoji button (`[data-cy="Emoji-Button"]`)
  5. Verify emoji picker opens
  6. Select an emoji — verify inserted at cursor position
- **Expected Result:** Text area auto-expands on input up to 5 lines; emoji picker available and inserts at cursor
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-025 — [UNDEV] Bot auto-reply outside working hours; welcome message during working hours
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Bot auto-reply and welcome message configured
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Bot auto-replies outside working hours; welcome message sent during working hours
- **Actual Result:** *(N/A — not built)*

---

### SC-ROOM-026 — Quick Reply (Macro) templates selectable via dropdown; templates editable by Admin/Supervisor
- **Type:** Positive | **Priority:** P1 | **Source:** US
- **Pre-condition:** Quick Reply templates configured in workspace
- **Steps:**
  1. Click Macro button (`[data-cy="Macro-Button"]`) in text area
  2. Verify Quick Reply dropdown opens with configured templates
  3. Select a template — verify template text inserted into text area
  4. As Admin, navigate to Quick Reply settings — verify templates editable
  5. As Agent, verify templates are read-only
- **Expected Result:** Quick Reply dropdown shows templates; inserts on selection; Admin/Supervisor can edit; Agent can only select
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-027 — Text input max 2000 characters; Enter sends, Ctrl+Enter adds new line; disabled if empty or upload in progress
- **Type:** Positive | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent on conversation room
- **Steps:**
  1. Type a message in text area (`[data-cy="Message-Text-Input"]`)
  2. Press Enter — verify message sent
  3. Type text and press Ctrl+Enter — verify new line added (not sent)
  4. Type 2000 characters — verify character limit enforced
  5. Verify Send button (`[data-cy="Send-Button"]`) disabled when text area is empty
  6. Verify Send button disabled when file upload is in progress
- **Expected Result:** Max 2000 chars enforced; Enter sends, Ctrl+Enter new line; Send disabled when empty or upload in progress
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-028 — Assignment: Shows Assigned to, Opened by, Closed by; status Unassigned → Ongoing → Resolved
- **Type:** State | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation exists in unassigned queue
- **Steps:**
  1. Open an unassigned conversation — verify status is Unassigned
  2. Assign to agent — verify status changes to Ongoing; "Opened by" shown
  3. Verify "Assigned to" shows assigned agent(s)
  4. Resolve conversation — verify status changes to Resolved; "Closed by" shown
- **Expected Result:** Assignment flow: Unassigned → Ongoing (on assign, shows Opened by) → Resolved (shows Closed by); status transitions correct
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-029 — Resolved chats reopen on new message
- **Type:** State | **Priority:** P0 | **Source:** US
- **Pre-condition:** Conversation is in Resolved state
- **Steps:**
  1. Have a Resolved conversation
  2. Send a new customer message to that conversation
  3. Verify conversation reopens (status changes from Resolved)
  4. Verify conversation reappears in active inbox
- **Expected Result:** Resolved conversation automatically reopens when new customer message arrives
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-030 — Rich cards in Live Chat only: image, title, description, up to 3 buttons; carousel format; API-triggered
- **Type:** Positive | **Priority:** P2 | **Source:** US
- **Pre-condition:** Live Chat channel active; rich card API configured
- **Steps:**
  1. Trigger a rich card via API for a Live Chat conversation
  2. Verify rich card displays: image, title, description, up to 3 buttons
  3. If multiple cards triggered — verify carousel format with navigation
  4. Verify rich cards NOT available for WhatsApp conversations
- **Expected Result:** Rich cards render in Live Chat with image/title/description/buttons and carousel; not available for WhatsApp
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-031 — Connection Lost shows banner "Koneksi terputus" + Retry button
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** Agent online; connection drops
- **Steps:**
  1. Simulate connection loss (disconnect network or kill socket)
  2. Verify banner appears with text "Koneksi terputus"
  3. Verify Retry button visible on banner
  4. Click Retry — verify reconnection attempt triggered
  5. Restore connection — verify banner disappears
- **Expected Result:** Connection loss shows "Koneksi terputus" banner with Retry button; banner clears on reconnection
- **Actual Result:** *(QA fills)*

---

### SC-ROOM-032 — WA Session Expired shows "Sesi WA perlu login ulang" + CTA Relogin
- **Type:** Negative | **Priority:** P0 | **Source:** US
- **Pre-condition:** WhatsApp session token has expired
- **Steps:**
  1. Simulate WA session expiry
  2. Verify banner appears: "Sesi WA perlu login ulang"
  3. Verify CTA button for relogin is visible and functional
  4. Click relogin — verify reauthentication flow starts
- **Expected Result:** Expired WA session shows "Sesi WA perlu login ulang" banner with functional Relogin CTA
- **Actual Result:** *(QA fills)*

---

## PRD Ticket - Omnichannel Inbox - Conversation Detail

### SC-DETAIL-001 — Team Inbox assignment: single, mandatory; Assignees: multi-select chips with avatar+name
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Agent/Supervisor viewing conversation detail panel
- **Steps:**
  1. Open conversation detail panel (`[data-cy="Chat-Detail-Title"]` visible)
  2. Locate assignee section (`[data-cy="Chat-Detail-Section-assignee"]`)
  3. Verify Team Inbox field is single-select and mandatory
  4. Select a Team Inbox from dropdown
  5. Add multiple assignees — verify chips with avatar+name appear
  6. Remove an assignee chip — verify it updates immediately
- **Expected Result:** Team Inbox single-select mandatory; Assignees multi-select chips with avatar+name; changes persist immediately
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-002 — Unassigned state shows label "Unassigned" + button "Assign Now (Tetapkan Agent)"
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Conversation is in Unassigned state
- **Steps:**
  1. Open an unassigned conversation's detail panel
  2. Verify label "Unassigned" visible in assignee section
  3. Verify button "Assign Now (Tetapkan Agent)" visible
  4. Click button — verify assign modal or flow opens
- **Expected Result:** Unassigned state shows "Unassigned" label and "Assign Now (Tetapkan Agent)" button that opens assignment flow
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-003 — Assigned state shows assigned agents; allows add/remove
- **Type:** Positive | **Priority:** P0 | **Source:** US-01
- **Pre-condition:** Conversation is assigned to at least 1 agent
- **Steps:**
  1. Open an assigned conversation's detail panel
  2. Verify assigned agent(s) shown with avatar and name
  3. Click to add another assignee — verify add flow works
  4. Remove an assignee — verify removal updates immediately
- **Expected Result:** Assigned state shows assigned agents; add/remove assignees works and updates immediately
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-004 — First Response Due countdown appears only when Unassigned
- **Type:** State | **Priority:** P0 | **Source:** US-02
- **Pre-condition:** Conversation with SLA configured; in Unassigned state
- **Steps:**
  1. Open unassigned conversation detail panel
  2. Locate SLA section — verify `[data-cy="Chat-Detail-Sla-frt"]` shows First Response Due countdown
  3. Assign conversation to agent
  4. Verify First Response Due countdown disappears (only shown when Unassigned)
- **Expected Result:** First Response Due countdown visible only in Unassigned state; disappears after assignment
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-005 — Time to Close Due countdown until SLA resolution
- **Type:** Positive | **Priority:** P0 | **Source:** US-02
- **Pre-condition:** Conversation with SLA configured; in Ongoing state
- **Steps:**
  1. Open ongoing conversation detail panel
  2. Verify `[data-cy="Chat-Detail-Sla-ttc"]` shows Time to Close Due countdown
  3. Verify countdown decrements in real-time
  4. Resolve conversation — verify countdown stops
- **Expected Result:** Time to Close Due countdown visible and decrementing; stops on resolution
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-006 — Expired SLA shows red badge "SLA terlewati"
- **Type:** Negative | **Priority:** P0 | **Source:** US-02
- **Pre-condition:** Conversation where SLA has been breached
- **Steps:**
  1. Wait for or simulate SLA expiry on a conversation
  2. Open detail panel — verify SLA section shows red badge
  3. Verify badge text is "SLA terlewati"
- **Expected Result:** Expired SLA displays red badge "SLA terlewati" in detail panel SLA section
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-007 — Reminder appears only if feature activated and only for the user who activated it
- **Type:** Permission | **Priority:** P0 | **Source:** US-03
- **Pre-condition:** Reminder feature is available (not UNDEV per PRD v2.1)
- **Steps:**
  1. As Agent A, activate reminder on a conversation
  2. As Agent A, verify reminder visible in detail panel
  3. As Agent B, verify reminder is NOT visible in the same conversation detail
  4. Deactivate reminder — verify it disappears for Agent A
- **Expected Result:** Reminder visible only to the user who activated it; hidden for other users
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-008 — Conversation ID unique and auto-generated
- **Type:** Positive | **Priority:** P0 | **Source:** US-04
- **Pre-condition:** Conversation exists
- **Steps:**
  1. Open conversation detail panel
  2. Verify Conversation ID shown in attributes section
  3. Verify ID is unique (compare with other conversations)
  4. Click copy button (`[data-cy="Chat-Detail-Copy-Id-Button"]`) — verify ID copied to clipboard
- **Expected Result:** Conversation ID displayed, unique, auto-generated, and copyable
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-009 — Channel source displayed; WhatsApp Web shows WA number and name; other channels do not show Channel Name/Number
- **Type:** Positive | **Priority:** P0 | **Source:** US-04
- **Pre-condition:** Conversations from different channels available
- **Steps:**
  1. Open a WhatsApp Web conversation detail
  2. Verify channel icon and "WhatsApp Web" source shown
  3. Verify WA number and name displayed
  4. Open a Live Chat conversation detail
  5. Verify channel icon shown but Channel Name/Number NOT displayed
- **Expected Result:** WhatsApp Web shows channel name and number; other channels show channel icon only, no name/number
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-010 — Started At timestamp in ISO format
- **Type:** Positive | **Priority:** P0 | **Source:** US-04
- **Pre-condition:** Conversation exists
- **Steps:**
  1. Open conversation detail panel
  2. Locate Started At field in attributes section
  3. Verify timestamp displayed in readable format (derived from ISO)
- **Expected Result:** Started At timestamp displayed correctly in ISO-derived format
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-011 — Dynamic attributes (e.g., SAP AWB) visible and accurate
- **Type:** Positive | **Priority:** P0 | **Source:** US-04
- **Pre-condition:** Conversation with external API attributes (e.g., SAP integration)
- **Steps:**
  1. Open conversation detail for a chat with dynamic attributes
  2. Locate attributes section (`[data-cy="Chat-Detail-Section-attributes"]`)
  3. Verify dynamic attributes (e.g., SAP AWB) displayed with correct values
  4. Verify values match source API data
- **Expected Result:** Dynamic attributes from external APIs displayed accurately in attributes section
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-012 — Client data: Name, Phone (masked for Agent), Email, Location, OS, Browser
- **Type:** Positive | **Priority:** P0 | **Source:** US-05
- **Pre-condition:** Conversation with client data available
- **Steps:**
  1. Open conversation detail panel
  2. Locate client data section (`[data-cy="Chat-Detail-Section-client-data"]`)
  3. Verify Client Name displayed
  4. Verify Phone masked for Agent role (e.g., +628****7890)
  5. Verify Email displayed if available
  6. Verify Location displayed if allowed by client
  7. Verify OS and Browser auto-detected if available
- **Expected Result:** Client data section shows Name, masked Phone (for Agent), Email, Location (if allowed), OS and Browser (auto-detect)
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-013 — Missing optional client data does not break UI
- **Type:** Edge | **Priority:** P0 | **Source:** US-05
- **Pre-condition:** Conversation with incomplete client data (missing email, location, OS, browser)
- **Steps:**
  1. Open conversation detail for a chat with minimal client data
  2. Verify missing fields show placeholder or are hidden gracefully
  3. Verify no errors or broken layout
- **Expected Result:** Missing optional fields handled gracefully — placeholder or hidden; no UI breakage
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-014 — Tags can be added, edited, removed; changes persist immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-06
- **Pre-condition:** Conversation open; tag management available
- **Steps:**
  1. Open conversation detail panel
  2. Locate tags section (`[data-cy="Chat-Detail-Section-tags"]`)
  3. Add a new tag — verify it appears immediately
  4. Edit tag — verify change persists
  5. Remove tag — verify it disappears immediately
- **Expected Result:** Tags add, edit, remove with immediate persistence in detail panel
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-015 — All conversation events logged and visible in chronological order
- **Type:** Positive | **Priority:** P0 | **Source:** US-07
- **Pre-condition:** Conversation with multiple lifecycle events
- **Steps:**
  1. Open conversation detail panel
  2. Locate events section (`[data-cy="Chat-Detail-Section-events"]`)
  3. Verify events displayed in chronological order
  4. Verify assignment, SLA changes, status updates all logged
  5. Verify each event has timestamp and description
- **Expected Result:** All lifecycle events (assignment, SLA, status) logged chronologically with timestamps in events section
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-016 — All past conversations between agent and client displayed chronologically
- **Type:** Positive | **Priority:** P0 | **Source:** US-07
- **Pre-condition:** Client has multiple past conversations
- **Steps:**
  1. Open conversation detail for a returning client
  2. Locate history section (`[data-cy="Chat-Detail-Section-history"]`)
  3. Verify all past conversations listed chronologically
  4. Verify previous sessions' messages included
  5. Click a past conversation — verify navigable
- **Expected Result:** All past conversations with client shown chronologically including previous sessions; navigable
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-017 — Agents can add/edit internal notes; Supervisor/Admin can mention other Agents
- **Type:** Positive | **Priority:** P0 | **Source:** US-08
- **Pre-condition:** Agent/Supervisor on conversation detail
- **Steps:**
  1. Open notes section (`[data-cy="Chat-Detail-Section-notes"]`)
  2. As Agent, add a new internal note — verify saved
  3. Edit an existing note — verify change persists
  4. As Supervisor, type @AgentName in note — verify mention autocomplete appears
  5. Submit mention — verify mentioned agent receives notification
- **Expected Result:** Agents can add/edit internal notes; Supervisors can @mention agents with autocomplete and notification
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-018 — Pinned messages in dedicated section; clicking jumps to original message
- **Type:** Positive | **Priority:** P0 | **Source:** US-09
- **Pre-condition:** Conversation with pinned messages
- **Steps:**
  1. Open pinned section (`[data-cy="Chat-Detail-Section-pinned"]`)
  2. Verify pinned messages listed
  3. Click a pinned message — verify chat room scrolls to original message
- **Expected Result:** Pinned messages in dedicated section; click jumps to original message in chat room
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-019 — Media (images, videos, audio) viewable inline with download option
- **Type:** Positive | **Priority:** P0 | **Source:** US-10
- **Pre-condition:** Conversation with media attachments
- **Steps:**
  1. Open media section (`[data-cy="Chat-Detail-Section-media"]`)
  2. Verify images displayed as thumbnails/gallery
  3. Click an image — verify inline preview
  4. Verify video and audio files have play option
  5. Verify download option available for all media
- **Expected Result:** Media viewable inline with download; images as gallery, video/audio playable; unsupported formats show error
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-020 — Files downloadable and viewable; upload validates file type and size
- **Type:** Positive | **Priority:** P0 | **Source:** US-10
- **Pre-condition:** Conversation with file attachments
- **Steps:**
  1. Open files section (`[data-cy="Chat-Detail-Section-files"]`)
  2. Verify file list displayed (pdf, docx, xlsx, etc.)
  3. Click download on a file — verify downloads
  4. Attempt to upload invalid file type — verify validation error
  5. Attempt to upload file >25MB — verify size limit enforced
- **Expected Result:** Files downloadable; upload validates type and size (≤25MB); invalid files rejected
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-021 — Related conversations linked and navigable from current conversation
- **Type:** Positive | **Priority:** P1 | **Source:** US-11
- **Pre-condition:** Conversation linked to related conversations
- **Steps:**
  1. Open detail panel — locate related conversations section
  2. Verify linked conversations listed with IDs
  3. Click a related conversation — verify navigation to that conversation
- **Expected Result:** Related conversations listed and navigable from detail panel
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-022 — Broadcast history logged with timestamps and recipient info
- **Type:** Positive | **Priority:** P1 | **Source:** US-12
- **Pre-condition:** Conversation has broadcast history
- **Steps:**
  1. Open detail panel — locate broadcast history section
  2. Verify broadcasts listed chronologically
  3. Verify each entry has timestamp and recipient info
- **Expected Result:** Broadcast history accessible with timestamps and recipient details for auditing
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-023 — Custom attributes from external APIs appear correctly and update dynamically
- **Type:** Positive | **Priority:** P2 | **Source:** US-13
- **Pre-condition:** Custom attributes configured via external API
- **Steps:**
  1. Open detail panel — locate custom attributes section (`[data-cy="Chat-Detail-Section-custom-attributes"]`)
  2. Verify custom attributes displayed with correct values
  3. Update value in external API — verify detail panel reflects change
- **Expected Result:** Custom attributes from external APIs display correctly and update dynamically when source data changes
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-024 — Tags max 20 per conversation; pinned max 10; file max 25MB; exceeding blocks with toast
- **Type:** Negative | **Priority:** P0 | **Source:** US (EH)
- **Pre-condition:** Conversation near or at limit thresholds
- **Steps:**
  1. Add 20 tags to a conversation — verify all 20 accepted
  2. Attempt to add 21st tag — verify toast "Batas tercapai" blocks action
  3. Pin 10 messages — verify all 10 pinned
  4. Attempt to pin 11th — verify blocked with toast
  5. Attempt to upload file >25MB — verify blocked with toast
- **Expected Result:** Limits enforced: 20 tags, 10 pinned, 25MB file; exceeding shows toast "Batas tercapai"
- **Actual Result:** *(QA fills)*

---

### SC-DETAIL-025 — Conflict (edit lock) — another user edited same field simultaneously shows refresh prompt
- **Type:** Negative | **Priority:** P0 | **Source:** US (EH)
- **Pre-condition:** Two users editing same conversation detail field simultaneously
- **Steps:**
  1. Open detail panel as Agent A — start editing a field (e.g., note)
  2. As Agent B, edit the same field and save first
  3. As Agent A, attempt to save — verify conflict prompt appears
  4. Verify message: "Data diubah oleh pengguna lain. Silakan refresh."
- **Expected Result:** Simultaneous edit conflict shows "Data diubah oleh pengguna lain. Silakan refresh." prompt
- **Actual Result:** *(QA fills)*

---

## PRD Ticket - Omnichannel Inbox - Get New Conversation (Agent Pull Queue)

### SC-PULL-001 — Agent clicks "Get Conversation"; conversations assigned FIFO from queue
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent logged in; unassigned conversations available in queue
- **Steps:**
  1. Navigate to Your Inbox
  2. Verify "Get Conversation" button visible
  3. Click "Get Conversation"
  4. Verify conversations assigned in FIFO order (oldest first)
  5. Verify conversation status changes to "Assigned to Agent"
- **Expected Result:** "Get Conversation" assigns conversations FIFO from queue; status changes to Assigned immediately
- **Actual Result:** *(QA fills)*

---

### SC-PULL-002 — Default batch = total queue count; editable to smaller number; min = 1
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Unassigned queue has 10 conversations
- **Steps:**
  1. Navigate to Your Inbox
  2. Verify batch field next to "Get Conversation" shows default = total queue count (10)
  3. Edit batch to 3 — verify accepted
  4. Click "Get Conversation" — verify only 3 conversations pulled
  5. Edit batch to 1 — verify minimum accepted
  6. Edit batch to 0 — verify blocked (min = 1)
- **Expected Result:** Default batch = total queue count; editable with minimum 1; pulling uses edited batch size
- **Actual Result:** *(QA fills)*

---

### SC-PULL-003 — Conversation status changes to "Assigned to Agent" immediately upon pull
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent pulls conversation from queue
- **Steps:**
  1. Note status of first conversation in Unassigned queue
  2. Click "Get Conversation"
  3. Verify pulled conversation status changed to "Assigned to Agent" immediately
  4. Verify conversation no longer appears in Unassigned queue
- **Expected Result:** Pulled conversation status changes to "Assigned to Agent" immediately; removed from Unassigned queue
- **Actual Result:** *(QA fills)*

---

### SC-PULL-004 — Pulled conversation appears in "Your Inbox" tab
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent pulls conversation from queue
- **Steps:**
  1. Click "Get Conversation"
  2. Switch to "Your Inbox" tab
  3. Verify pulled conversation(s) visible in Your Inbox list
- **Expected Result:** Pulled conversations appear in agent's Your Inbox tab immediately after pull
- **Actual Result:** *(QA fills)*

---

### SC-PULL-005 — Editable numeric batch field shown next to "Get Conversation"; default = total queue count
- **Type:** Positive | **Priority:** P0 | **Source:** US (P0)
- **Pre-condition:** Agent on Your Inbox page
- **Steps:**
  1. Navigate to Your Inbox
  2. Verify editable numeric field visible next to "Get Conversation" button
  3. Verify default value = total queue count
  4. Change value — verify field accepts numeric input ≥1
- **Expected Result:** Batch field visible, numeric, editable, default = total queue count, min 1
- **Actual Result:** *(QA fills)*

---

### SC-PULL-006 — Supervisor/Admin can assign chats manually from Unassigned tab to self or other agents
- **Type:** Positive | **Priority:** P1 | **Source:** US (P1)
- **Pre-condition:** Supervisor/Admin logged in; unassigned conversations exist
- **Steps:**
  1. Login as Supervisor/Admin
  2. Navigate to Unassigned tab
  3. Select a conversation
  4. Use assign action to assign to self — verify success
  5. Use assign action to assign to another agent — verify success
  6. Verify assigned agent sees conversation in their Your Inbox
- **Expected Result:** Supervisor/Admin can manually assign unassigned conversations to self or other agents
- **Actual Result:** *(QA fills)*

---

### SC-PULL-007 — System shows warning "Maximum active conversations reached" when agent at limit
- **Type:** Negative | **Priority:** P1 | **Source:** US (P1)
- **Pre-condition:** Agent has reached max concurrent conversation limit
- **Steps:**
  1. Configure max concurrent conversations (e.g., 10)
  2. Assign 10 conversations to agent
  3. Attempt to pull one more conversation
  4. Verify toast: "Maximum active conversations reached"
- **Expected Result:** Pull blocked when at max concurrent limit; toast "Maximum active conversations reached" shown
- **Actual Result:** *(QA fills)*

---

### SC-PULL-008 — Max concurrent conversation limit configurable in settings by Supervisor/Admin
- **Type:** Positive | **Priority:** P1 | **Source:** US (P1)
- **Pre-condition:** Supervisor/Admin access to settings
- **Steps:**
  1. Login as Supervisor/Admin
  2. Navigate to Inbox > General Settings
  3. Locate max concurrent conversations setting
  4. Set limit to 10 — verify saved
  5. Verify limit enforced for agents
- **Expected Result:** Max concurrent conversation limit configurable by Supervisor/Admin in General Settings
- **Actual Result:** *(QA fills)*

---

### SC-PULL-009 — Timeout return to queue: setting toggle ON/OFF; if enabled, inactive chat returns after [X] minutes
- **Type:** Positive | **Priority:** P2 | **Source:** US (P2)
- **Pre-condition:** Admin access; timeout setting available
- **Steps:**
  1. Login as Admin
  2. Navigate to Inbox > General Settings
  3. Enable timeout return toggle ON
  4. Set timeout to 30 minutes
  5. Assign a conversation to agent and leave inactive for 30+ minutes
  6. Verify conversation returns to Unassigned queue after timeout
- **Expected Result:** Timeout return toggle works; inactive conversations return to queue after configured minutes
- **Actual Result:** *(QA fills)*

---

### SC-PULL-010 — Max conversation limit toggle ON/OFF in Inbox > General Settings; if enabled, configurable min 1
- **Type:** Positive | **Priority:** P2 | **Source:** US (P2)
- **Pre-condition:** Admin access; limit toggle available
- **Steps:**
  1. Login as Admin
  2. Navigate to Inbox > General Settings
  3. Enable max conversation limit toggle
  4. Set limit to 5 (minimum 1) — verify accepted
  5. Set limit to 0 — verify rejected (min 1)
  6. Verify limit enforced for agents
- **Expected Result:** Max conversation limit toggle works; configurable with minimum 1; enforced for agents
- **Actual Result:** *(QA fills)*

---

### SC-PULL-011 — Agents see only their closed chats in Closed tab; Supervisors/Admin see all team chats
- **Type:** Permission | **Priority:** P2 | **Source:** US (P2)
- **Pre-condition:** Multiple resolved conversations exist across agents
- **Steps:**
  1. Login as Agent — navigate to Closed tab
  2. Verify only own resolved conversations shown
  3. Login as Supervisor — navigate to Closed tab
  4. Verify all team's resolved conversations shown
- **Expected Result:** Agent sees only own closed chats; Supervisor/Admin sees all team closed chats
- **Actual Result:** *(QA fills)*

---

### SC-PULL-012 — Queue empty shows toast "No conversations available"
- **Type:** Negative | **Priority:** P0 | **Source:** US (EH)
- **Pre-condition:** Unassigned queue is empty
- **Steps:**
  1. Navigate to Your Inbox when queue is empty
  2. Click "Get Conversation"
  3. Verify toast: "No conversations available"
- **Expected Result:** Empty queue shows toast "No conversations available" on pull attempt
- **Actual Result:** *(QA fills)*

---

### SC-PULL-013 — API/socket failure shows toast "Failed to fetch conversation, please retry"
- **Type:** Negative | **Priority:** P0 | **Source:** US (EH)
- **Pre-condition:** API or socket connection is failing
- **Steps:**
  1. Simulate API/socket failure
  2. Click "Get Conversation"
  3. Verify toast: "Failed to fetch conversation, please retry"
- **Expected Result:** API/socket failure shows toast "Failed to fetch conversation, please retry"
- **Actual Result:** *(QA fills)*

---

### SC-PULL-014 — Invalid batch number resets to default queue count
- **Type:** Negative | **Priority:** P0 | **Source:** US (EH)
- **Pre-condition:** Agent on Your Inbox page with batch field
- **Steps:**
  1. Enter invalid batch number (e.g., -1, 0, or non-numeric)
  2. Verify field resets to default queue count
  3. Enter value greater than queue count
  4. Verify field resets to or caps at default queue count
- **Expected Result:** Invalid batch number (non-positive, non-numeric, or exceeding queue) resets to default queue count
- **Actual Result:** *(QA fills)*

---


---

## Part A: SC-SESSIONS — 30 scenarios

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


---

## Part A: SC-MULTITKT + SC-MEMBERHUD — 48 scenarios

# Conversation Scenario Catalog — SC-MULTITKT & SC-MEMBERHUD (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:** `PRD/Conversationv2/PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble.md`, `PRD/Conversationv2/PRD Ticket - Team Inbox Member Drawer and Online Status HUD.md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv`

---

## PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble

### SC-MULTITKT-001 — Selecting exactly 1 bubble and clicking "Buat tiket" opens modal with 1 ticket draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-002, FR-003
- **Pre-condition:** Agent logged in, conversation open in Chat Room (`[data-cy="Chat-Room-Container"]`), at least 1 message bubble visible (`[data-cy="Message-Bubble"]`)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox` and open a conversation
  2. Click on exactly 1 message bubble `[data-cy="Message-Bubble"]` to select it
  3. Click "Buat tiket" action button
  4. Verify `[data-cy="Create-Ticket-Modal"]` opens
  5. Verify modal contains exactly 1 draft form with Ticket Type, Title, Description fields
- **Expected Result:** Single-bubble multi-draft modal opens with 1 ticket draft; "Tambah tiket" button visible; draft count shows 1
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-002 — Clicking "Tambah tiket" appends a new numbered draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005
- **Pre-condition:** Single-bubble multi-draft modal open with 1 draft
- **Steps:**
  1. Open single-bubble multi-draft modal (per SC-MULTITKT-001)
  2. Click "Tambah tiket" button
  3. Verify a new numbered draft form is appended (e.g., "Tiket 2")
  4. Verify draft count in header updates to 2
  5. Click "Tambah tiket" again — verify 3rd draft appended with correct numbering
- **Expected Result:** Each click appends a new sequentially numbered draft; draft count increments; each draft is independently editable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-003 — Removing a draft reindexes remaining drafts; at least 1 draft always remains
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-006
- **Pre-condition:** Modal open with ≥2 drafts
- **Steps:**
  1. Open single-bubble modal and add 3 drafts (Tiket 1, Tiket 2, Tiket 3)
  2. Click "Hapus" on draft 2
  3. Verify remaining drafts reindex: "Tiket 1" and "Tiket 2" (former 3 becomes 2)
  4. Attempt to remove the last remaining draft
  5. Verify removal is blocked — at least 1 draft always present
- **Expected Result:** Removed draft disappears; remaining drafts reindex sequentially; last draft cannot be removed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-004 — Submitting all valid drafts creates 1 ticket per draft; each linked to selected bubble
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-009, FR-010
- **Pre-condition:** Modal open with 2 drafts, all required fields filled
- **Steps:**
  1. Fill Draft 1: Ticket Type = "Refund", Title = "Cek AWB 123" (min 5 chars), optional Description
  2. Fill Draft 2: Ticket Type = "Complaint", Title = "Keluhan pengiriman"
  3. Click "Buat semua tiket" submit button
  4. Verify success state shows 2 created ticket identifiers
  5. Verify each ticket has linked message reference to the selected bubble
- **Expected Result:** 2 tickets created; each linked to the same selected bubble message; success summary shows ticket IDs
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-005 — Submit blocked when any draft invalid; each invalid draft shows field errors + top summary
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-013, FR-014, EH-001
- **Pre-condition:** Modal open with 2 drafts; Draft 2 has empty Title
- **Steps:**
  1. Fill Draft 1 with all required fields
  2. Leave Draft 2 Title empty (required field)
  3. Click "Buat semua tiket"
  4. Verify submit is blocked
  5. Verify Draft 2 shows inline field error on Title
  6. Verify top summary "Ada data tiket yang belum lengkap" is displayed
- **Expected Result:** Submit blocked; inline errors on invalid fields; top error summary "Ada data tiket yang belum lengkap" shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-006 — Draft auto-saved to cookies after 1 second of inactivity per field change
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-017
- **Pre-condition:** Modal open with 1 draft
- **Steps:**
  1. Open single-bubble modal
  2. Type a title in Draft 1 Title field
  3. Stop typing and wait 1 second
  4. Verify cookie is written (check browser DevTools > Application > Cookies for draft key)
  5. Edit another field, wait 1 second, verify cookie updated
- **Expected Result:** Cookie auto-saved after 1s inactivity per field change; cookie key includes workspace, user, conversation, message context
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-007 — Closing modal or refreshing page; reopening "Buat tiket" on same bubble restores drafts with banner
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Drafts auto-saved to cookies (per SC-MULTITKT-006)
- **Steps:**
  1. Create 2 drafts with filled fields, wait for cookie save
  2. Close the modal (click `[data-cy="Create-Ticket-Cancel-Button"]`)
  3. Select the same bubble again and click "Buat tiket"
  4. Verify "Draft dipulihkan" banner is shown
  5. Verify both drafts restored with previously entered data
- **Expected Result:** Restored drafts show "Draft dipulihkan" banner; all previously entered field values intact
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-008 — Clicking "Buang draft" clears all drafts and resets modal to 1 empty draft
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Restored drafts visible with "Draft dipulihkan" banner
- **Steps:**
  1. Open modal with restored drafts (per SC-MULTITKT-007)
  2. Click "Buang draft" button
  3. Verify all drafts cleared
  4. Verify modal resets to 1 empty draft form
  5. Verify "Draft dipulihkan" banner disappears
- **Expected Result:** All drafts cleared; modal resets to single empty draft; cookie deleted for this bubble
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-009 — Draft cookies deleted after successful ticket creation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Drafts with filled data, cookie persisted
- **Steps:**
  1. Fill drafts and submit successfully (all valid)
  2. Verify success state shown
  3. Check browser cookies — verify draft cookie for this bubble is deleted
  4. Close modal, select same bubble, click "Buat tiket"
  5. Verify no "Draft dipulihkan" banner; modal opens with fresh empty draft
- **Expected Result:** Draft cookies deleted after successful creation; reopening modal shows no restored drafts
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-010 — Selecting 2+ bubbles and clicking "Buat tiket" opens batch UI with 1 form per bubble; "Tambah tiket" hidden
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-004
- **Pre-condition:** Conversation open with ≥2 message bubbles visible
- **Steps:**
  1. Multi-select 2 message bubbles (checkbox/shift-click)
  2. Click "Buat tiket"
  3. Verify batch create UI opens with exactly 2 forms (1 per bubble)
  4. Verify "Tambah tiket" button is NOT visible
  5. Verify each form is labeled/correlated to its source bubble
- **Expected Result:** Multi-select mode opens batch UI; 1 form per selected bubble; "Tambah tiket" hidden; no multi-draft controls
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-011 — Multi-select submit creates N tickets for N bubbles; each links only to its corresponding bubble
- **Type:** Positive | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Batch create modal open with 3 bubbles selected, all forms filled
- **Steps:**
  1. Fill all 3 forms with valid ticket data
  2. Click submit
  3. Verify 3 tickets created
  4. Verify Ticket 1 links to Bubble 1 only, Ticket 2 to Bubble 2, Ticket 3 to Bubble 3
  5. Verify success summary shows 3 ticket IDs
- **Expected Result:** N tickets created for N bubbles; each ticket linked only to its corresponding source bubble
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-012 — Deselecting bubbles until 1 remains switches modal to single-bubble mode and shows "Tambah tiket"
- **Type:** State | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Batch create modal open with 2+ bubbles selected
- **Steps:**
  1. Open batch modal with 3 bubbles selected
  2. Deselect bubbles until only 1 remains
  3. Verify modal switches to single-bubble mode
  4. Verify "Tambah tiket" button appears
  5. Verify header subtitle shows "Mode 1 pesan"
- **Expected Result:** Modal transitions to single-bubble multi-draft mode; "Tambah tiket" shown; multi-draft controls enabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-013 — Bubble shows badge "Tiket: X" when tickets linked
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-022
- **Pre-condition:** At least 1 ticket created from a bubble
- **Steps:**
  1. Create 2 tickets from a single bubble (per SC-MULTITKT-004)
  2. Return to conversation room
  3. Locate the source bubble
  4. Verify badge "Tiket: 2" is displayed on the bubble (`[data-cy="ticket-badge"]`)
- **Expected Result:** Bubble displays "Tiket: X" badge reflecting number of linked tickets
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-014 — Clicking "Tiket: X" shows list of linked tickets; each opens
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-023
- **Pre-condition:** Bubble with linked tickets badge visible
- **Steps:**
  1. Click the "Tiket: 2" badge on the bubble
  2. Verify a popover/list appears with 2 linked ticket items
  3. Click on first ticket item
  4. Verify ticket detail page opens
  5. Go back, click second ticket — verify it opens correctly
- **Expected Result:** Badge click shows linked ticket list; each ticket item navigates to its ticket detail
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-015 — Adding 20 drafts blocks "Tambah tiket" and shows max limit message
- **Type:** Negative | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Modal open with ability to add drafts
- **Steps:**
  1. Open single-bubble modal
  2. Click "Tambah tiket" repeatedly until 20 drafts exist
  3. Verify draft count shows 20
  4. Attempt to click "Tambah tiket" again
  5. Verify "Tambah tiket" is disabled
  6. Verify message "Maksimal 20 tiket dalam sekali proses" appears
- **Expected Result:** "Tambah tiket" disabled at 20 drafts; "Maksimal 20 tiket dalam sekali proses" shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-016 — Drafts isolated per bubble; opening drafts for two different bubbles does not mix
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002
- **Pre-condition:** Two different bubbles with drafts saved
- **Steps:**
  1. Open modal for Bubble A, add 2 drafts with specific titles, wait for cookie save
  2. Close modal
  3. Open modal for Bubble B, add 1 draft with different title, wait for cookie save
  4. Close modal
  5. Reopen modal for Bubble A — verify 2 drafts with Bubble A data restored
  6. Reopen modal for Bubble B — verify 1 draft with Bubble B data restored
- **Expected Result:** Each bubble's drafts are fully isolated; no cross-contamination of draft data
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-017 — Editing drafts in two tabs: last save wins; restored state may show "Draft diperbarui"
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** Same bubble, two browser tabs open
- **Steps:**
  1. Open modal for Bubble A in Tab 1, type "Title A"
  2. Open modal for Bubble A in Tab 2, type "Title B" (different value)
  3. Wait for cookie save in Tab 2 (last write)
  4. Close both tabs, reopen modal for Bubble A
  5. Verify restored state shows "Title B" (last save wins)
  6. Verify "Draft diperbarui" banner shown
- **Expected Result:** Last cookie write wins; "Draft diperbarui" shown when restored state differs from last visible state
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-018 — Cookie size limit exceeded stops auto-save and warns
- **Type:** Negative | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Modal with drafts approaching 3000-char cookie payload limit
- **Steps:**
  1. Open modal and add multiple drafts with very long descriptions (approaching 3000 char total)
  2. Continue editing until cookie payload exceeds 3000 characters
  3. Verify auto-save stops
  4. Verify warning "Draft terlalu besar untuk disimpan otomatis" appears
  5. Verify modal state is NOT cleared — drafts remain editable
- **Expected Result:** Auto-save stops; warning shown; modal state preserved; user can continue editing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-019 — Network timeout keeps drafts; shows error + retry button
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Modal open with valid drafts; network disconnected
- **Steps:**
  1. Fill 2 drafts with valid data
  2. Disconnect network (DevTools > Network > Offline)
  3. Click "Buat semua tiket"
  4. Verify error "Koneksi bermasalah. Coba lagi" shown
  5. Verify "Coba lagi" retry button visible
  6. Verify draft data is preserved (not cleared)
- **Expected Result:** Network timeout shows "Koneksi bermasalah. Coba lagi" with retry button; drafts preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-020 — Partial create failure shows per-draft status; retry button for failed drafts only
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004, FR-015
- **Pre-condition:** Modal with 3 drafts; backend configured to fail draft 2
- **Steps:**
  1. Fill all 3 drafts with valid data
  2. Submit
  3. Verify Drafts 1 and 3 show success status
  4. Verify Draft 2 shows failure status
  5. Verify summary "Sebagian tiket gagal dibuat" shown
  6. Verify "Coba lagi untuk yang gagal" retry button visible
- **Expected Result:** Per-draft success/failure status shown; retry available for failed drafts only; summary "Sebagian tiket gagal dibuat"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-021 — Duplicate submit within 10 minutes ignored via idempotency key
- **Type:** Negative | **Priority:** P0 | **Source:** EH-007, FR-016
- **Pre-condition:** Modal with valid drafts
- **Steps:**
  1. Fill drafts and click "Buat semua tiket"
  2. Immediately click submit again within 10 minutes
  3. Verify second click is ignored
  4. Verify "Permintaan sedang diproses" message shown
  5. Verify only 1 set of tickets created (no duplicates)
- **Expected Result:** Duplicate submit ignored; "Permintaan sedang diproses" shown; idempotency key prevents duplicate ticket creation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-022 — Reference message unavailable blocks submit; shows error
- **Type:** Negative | **Priority:** P0 | **Source:** EH-006
- **Pre-condition:** Modal open; source bubble message deleted by another user
- **Steps:**
  1. Open modal and fill drafts
  2. Delete the source bubble message from another session/user
  3. Click "Buat semua tiket"
  4. Verify submit blocked
  5. Verify "Pesan referensi tidak tersedia" shown
  6. Verify "Tutup" button visible
- **Expected Result:** Submit blocked when reference message unavailable; "Pesan referensi tidak tersedia" shown with close option
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-023 — Cookie write failure shows banner warning
- **Type:** Negative | **Priority:** P1 | **Source:** EH-002
- **Pre-condition:** Browser blocks cookies (3rd-party cookie blocked or cookie storage full)
- **Steps:**
  1. Block cookies for the site (browser settings)
  2. Open single-bubble modal and edit a field
  3. Wait 1 second for auto-save attempt
  4. Verify banner "Draft gagal disimpan otomatis. Periksa pengaturan browser" shown
  5. Verify "Tutup" dismiss button on banner
  6. Verify modal remains functional (can still create tickets manually)
- **Expected Result:** Cookie write failure shows warning banner; creation flow continues normally; drafts not persisted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MULTITKT-024 — Attachment fields not persisted in cookies; require re-attach after restore
- **Type:** Edge | **Priority:** P1 | **Source:** EC-007
- **Pre-condition:** Modal with draft that includes attachment
- **Steps:**
  1. Open modal, fill draft with text fields AND attach a file
  2. Wait for cookie save
  3. Close modal, reopen for same bubble
  4. Verify text fields restored
  5. Verify attachment NOT restored
  6. Verify message "Lampiran perlu diunggah ulang" shown in the draft
- **Expected Result:** Attachment not persisted in cookies; text fields restored; "Lampiran perlu diunggah ulang" message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Team Inbox Member Drawer and Online Status HUD

### SC-MEMBERHUD-001 — HUD shows `Anggota {n} • Online {m}` in Team Inbox header
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001
- **Pre-condition:** Agent logged in, Team Inbox selected with ≥3 members (2 online, 1 offline)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Select a Team Inbox from sidebar (e.g., `[data-cy="team-1"]`)
  3. Verify Team Inbox header renders
  4. Verify HUD displays `Anggota 3 • Online 2`
  5. Verify HUD is clickable
- **Expected Result:** HUD shows correct member count and online count in format `Anggota {n} • Online {m}`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-002 — Online count includes Active + Away; Active-to-Away transition does not change count
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-002
- **Pre-condition:** Team Inbox with 2 Active members
- **Steps:**
  1. Select Team Inbox, note HUD shows `Online 2`
  2. Change member 1 from Active to Away (e.g., idle timeout or manual status)
  3. Verify HUD still shows `Online 2` (Active 1 + Away 1 = 2)
  4. Verify count does not decrement
- **Expected Result:** Online count = Active + Away; transition Active→Away does not change count
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-003 — Presence unavailable: HUD shows `Online -`; Inbox remains usable
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-004
- **Pre-condition:** Presence service down or returning errors
- **Steps:**
  1. Simulate presence service unavailability (disconnect WebSocket or mock error)
  2. Select Team Inbox
  3. Verify HUD shows `Anggota {n} • Online -`
  4. Verify Inbox chat list still loads and is functional
  5. Verify no error toasts blocking usage
- **Expected Result:** HUD shows `Online -` as fallback; Inbox remains fully usable; no blocking errors
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-004 — Clicking HUD opens Member Drawer
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-005
- **Pre-condition:** HUD visible in Team Inbox header
- **Steps:**
  1. Select Team Inbox with members
  2. Click the HUD label (`Anggota {n} • Online {m}`)
  3. Verify Member Drawer opens (right-side drawer)
  4. Verify drawer title "Anggota tim" is shown
  5. Verify member list is loading or rendered
- **Expected Result:** Member Drawer opens showing member list with supervisors section, filters, search
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-005 — Presence updates in drawer refresh list and counts without page reload
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-013
- **Pre-condition:** Member Drawer open showing members
- **Steps:**
  1. Open Member Drawer for a Team Inbox with Active members
  2. Note a member's presence state (e.g., "Online")
  3. Change that member's status to Away (from another session/device)
  4. Verify drawer updates presence label to "Away" without page reload
  5. Verify HUD online count updates accordingly
- **Expected Result:** Real-time presence updates reflected in drawer list and HUD counts without page reload
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-006 — No Team Inbox access shows "Akses ditolak"; drawer does not open
- **Type:** Permission | **Priority:** P0 | **Source:** US-002, EH-001
- **Pre-condition:** User without access to specific Team Inbox
- **Steps:**
  1. Log in as user with no access to Team Inbox X
  2. Attempt to click HUD or open Member Drawer for Team Inbox X
  3. Verify "Akses ditolak" message shown
  4. Verify drawer does NOT open
  5. Verify user remains on Inbox page
- **Expected Result:** "Akses ditolak" shown; drawer blocked; user stays on Inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-007 — Supervisors section appears at top of drawer listing supervisors first
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-007, FR-014
- **Pre-condition:** Team Inbox with 2 supervisors and 5 members
- **Steps:**
  1. Open Member Drawer for Team Inbox
  2. Verify "Supervisor" section appears at the top of the drawer
  3. Verify 2 supervisors listed in this section
  4. Verify regular members appear below the supervisors section
  5. Verify supervisors have "Supervisor" role badge
- **Expected Result:** Supervisors section at top; supervisors listed first; role badge visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-008 — No supervisors shows "Belum ada supervisor"
- **Type:** Edge | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Team Inbox with 0 supervisors, ≥1 regular member
- **Steps:**
  1. Open Member Drawer for Team Inbox with no supervisors
  2. Verify "Supervisor" section renders
  3. Verify section shows "Belum ada supervisor"
  4. Verify regular members still listed below
- **Expected Result:** Supervisors section shows "Belum ada supervisor"; regular members unaffected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-009 — Search filters by name or email with 300ms debounce
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-012
- **Pre-condition:** Member Drawer open with ≥5 members
- **Steps:**
  1. Open Member Drawer
  2. Type a member name in search input (placeholder "Cari nama atau email")
  3. Verify results filter after 300ms debounce (not on every keystroke)
  4. Clear search, type partial email address
  5. Verify results filter by email match
  6. Verify search is case-insensitive
- **Expected Result:** Search filters by name or email; 300ms debounce; case-insensitive; max 100 chars
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-010 — Online filter shows only Active + Away members
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-010
- **Pre-condition:** Member Drawer with members in Active, Away, and Offline states
- **Steps:**
  1. Open Member Drawer
  2. Click "Online" filter tab
  3. Verify only Active and Away members shown
  4. Verify Offline members are hidden
  5. Verify supervisors section still shows supervisors who are Online
- **Expected Result:** Online filter shows only Active + Away members; Offline hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-011 — Offline filter shows only Offline members
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-011
- **Pre-condition:** Member Drawer with members in various presence states
- **Steps:**
  1. Open Member Drawer
  2. Click "Offline" filter tab
  3. Verify only Offline members shown
  4. Verify Active and Away members are hidden
  5. Verify supervisors section shows only Offline supervisors
- **Expected Result:** Offline filter shows only Offline members; Active and Away hidden
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-012 — No results shows "Tidak ada hasil" and keeps search term
- **Type:** Edge | **Priority:** P0 | **Source:** US-004
- **Pre-condition:** Member Drawer open
- **Steps:**
  1. Open Member Drawer
  2. Type a non-existent name in search (e.g., "zzzznonexistent")
  3. Wait for debounce
  4. Verify "Tidak ada hasil" empty state shown
  5. Verify search term "zzzznonexistent" is still in the input field
- **Expected Result:** "Tidak ada hasil" shown; search term preserved in input
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-013 — "Tambah anggota" opens Add Member modal for existing users; multi-select up to 50
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-025, FR-026
- **Pre-condition:** User with manage membership permission; Member Drawer open
- **Steps:**
  1. Open Member Drawer as authorized user
  2. Click "Tambah anggota" button
  3. Verify "Tambah anggota ke tim" modal opens
  4. Verify user picker shows existing workspace users (not just team members)
  5. Select 3 users via multi-select
  6. Verify confirm button labeled "Tambahkan" is active
- **Expected Result:** Add Member modal opens; multi-select existing users; up to 50 per submission; "Tambahkan" / "Batal" buttons
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-014 — Already-member in picker disabled with "Anggota sudah terdaftar"
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-004
- **Pre-condition:** Add Member modal open; picker includes users already in team
- **Steps:**
  1. Open Add Member modal
  2. Search for a user already in the Team Inbox
  3. Verify that user's row is disabled in the picker
  4. Verify "Anggota sudah terdaftar" label on disabled row
  5. Verify row cannot be selected
- **Expected Result:** Existing members shown as disabled with "Anggota sudah terdaftar"; cannot be selected
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-015 — No permission: "Tambah anggota" hidden or disabled
- **Type:** Permission | **Priority:** P0 | **Source:** US-005, FR-024
- **Pre-condition:** User without manage membership permission
- **Steps:**
  1. Log in as regular member (no manage membership permission)
  2. Open Member Drawer
  3. Verify "Tambah anggota" button is either hidden or disabled
  4. Verify no way to access Add Member modal
- **Expected Result:** "Tambah anggota" hidden or disabled for users without permission
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-016 — After successful add, drawer list and HUD counts update immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-028
- **Pre-condition:** Add Member modal with users selected
- **Steps:**
  1. Select 2 users in Add Member modal
  2. Click "Tambahkan"
  3. Verify modal closes
  4. Verify new members appear in drawer member list immediately
  5. Verify HUD "Anggota {n}" count increments by 2
  6. Verify "Online {m}" updates if new members are online
- **Expected Result:** Drawer list and HUD counts update immediately after successful add; no page reload needed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-017 — "Hapus dari tim" on member shows confirmation modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-031
- **Pre-condition:** Member Drawer open with authorized user
- **Steps:**
  1. Open Member Drawer as authorized user
  2. Click "Hapus dari tim" on a member row
  3. Verify confirmation modal "Hapus anggota?" opens
  4. Verify modal body: "User akan kehilangan akses ke Team Inbox ini."
  5. Verify "Hapus" and "Batal" buttons present
- **Expected Result:** Confirmation modal shows "Hapus anggota?" with warning text and Hapus/Batal buttons
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-018 — Confirming removal removes member and updates counts
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-033
- **Pre-condition:** Confirmation modal open for member removal
- **Steps:**
  1. In confirmation modal, click "Hapus"
  2. Verify modal closes
  3. Verify removed member disappears from drawer list
  4. Verify HUD "Anggota {n}" decrements by 1
  5. Verify "Online {m}" decrements if removed member was online
- **Expected Result:** Member removed; drawer list and HUD counts update immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-019 — Removing last supervisor blocked with "Minimal 1 supervisor harus tetap ada"
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-006, FR-035
- **Pre-condition:** Team Inbox with exactly 1 supervisor
- **Steps:**
  1. Open Member Drawer for Team Inbox with 1 supervisor
  2. Click "Hapus dari tim" on the sole supervisor
  3. Confirm removal in modal
  4. Verify removal is blocked
  5. Verify "Minimal 1 supervisor harus tetap ada" message shown
  6. Verify supervisor remains in the list
- **Expected Result:** Removal blocked; "Minimal 1 supervisor harus tetap ada" shown; supervisor not removed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-020 — Removed member who was assignee has conversations auto-unassigned; action logged
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-036, FR-037
- **Pre-condition:** Member assigned to ≥2 conversations in this Team Inbox
- **Steps:**
  1. Note conversations assigned to target member
  2. Open Member Drawer, remove that member (per SC-MEMBERHUD-017/018)
  3. Verify removed member's conversations now show "Unassigned"
  4. Verify audit log entry `team_inbox.auto_unassign` created with removed user, team, and affected count
  5. Verify toast "Assignee diperbarui" or "Perubahan assignee sedang diproses" shown
- **Expected Result:** Auto-unassign sets assignee to null for affected conversations; audit logged; notification toast shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-021 — Away/Offline member with last seen shows relative time
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-020
- **Pre-condition:** Member Drawer with Away and Offline members who have last seen data
- **Steps:**
  1. Open Member Drawer
  2. Locate an Away member — verify last seen shows relative time (e.g., "5 menit lalu")
  3. Locate an Offline member — verify last seen shows relative time (e.g., "2 jam lalu")
  4. Verify format: 0-59s = "Baru saja", 1-59m = "{x} menit lalu", 1-23h = "{x} jam lalu", 1-30d = "{x} hari lalu", >30d = "Lebih dari 30 hari lalu"
- **Expected Result:** Relative last seen in Bahasa Indonesia format; correct thresholds per spec
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-022 — Active member last seen shows "Aktif sekarang"
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-021
- **Pre-condition:** Member Drawer with Active members
- **Steps:**
  1. Open Member Drawer
  2. Locate an Active member
  3. Verify last seen column shows "Aktif sekarang"
  4. Verify presence label shows "Online"
- **Expected Result:** Active members display "Aktif sekarang" as last seen value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-023 — Last seen unavailable shows "-"
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, FR-022
- **Pre-condition:** Member with no last seen data (e.g., newly added, or data unavailable)
- **Steps:**
  1. Add a new member to Team Inbox (per SC-MEMBERHUD-013)
  2. Open Member Drawer
  3. Locate the newly added member
  4. Verify last seen shows "-"
  5. Verify no error or broken layout
- **Expected Result:** Last seen shows "-" when unavailable; no UI breakage; actions still functional
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-MEMBERHUD-024 — Team Inbox has 0 members: HUD shows "Anggota 0 • Online 0"; drawer shows "Belum ada anggota"
- **Type:** Edge | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Team Inbox with 0 members (newly created or all removed)
- **Steps:**
  1. Select Team Inbox with 0 members
  2. Verify HUD shows "Anggota 0 • Online 0"
  3. Click HUD to open Member Drawer
  4. Verify drawer shows empty state "Belum ada anggota"
  5. Verify "Supervisor" section shows "Belum ada supervisor"
- **Expected Result:** HUD shows 0/0; drawer empty states for both members and supervisors; no errors
- **Actual Result:** *(QA fills)*
- **Existing TC:** —


---

## Part B: Features & Permissions — 234 scenarios

# Conversation Scenario Catalog — Part B: Features & Permissions (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07
> **PRD Sources:** PRD/Conversationv2/ (9 PRD files)
> **Page Selectors:** Test/conversation/conversation-page-selectors.md
> **Test Env:** https://dev-v2.satuinbox.com
> **Status Legend:** DEVELOPED = full steps + (QA fills); UNDEVELOPED = [UNDEV] + (N/A — not built); PARTIAL = mix

---

## PRD Ticket - Conversation and Ticket Response Metrics Tracking
- **Status:** DEVELOPED

### SC-METRICS-001 — Wait Time calculated as T2 − T1 when conversation is assigned
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-013
- **Pre-condition:** Customer sends first message; agent is assigned (T1 and T2 exist)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open assigned conversation with known T1 and T2 timestamps
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` is visible
  4. Check value badge: Wait Time = T2 − T1
- **Expected Result:** Wait Time displayed as T2 − T1; status = Complete
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-002 — Wait Time empty and status Incomplete when conversation never assigned
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** New inbound conversation in Unassigned (T1 exists, no T2)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open unassigned conversation (no agent assigned)
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` label visible
  4. Verify value shows "Incomplete" or empty
- **Expected Result:** Wait Time empty; status = Incomplete (no T2 recorded)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-003 — Wait Time empty with quality flag when T1 is missing/invalid
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-001, EH-002
- **Pre-condition:** Conversation with corrupt/missing T1
- **Steps:**
  1. Navigate to conversation with missing T1 (test data setup)
  2. Open conversation detail
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` shows quality flag or empty
- **Expected Result:** Wait Time empty or quality-flagged; not exported as zero
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-004 — RLT calculated as T3 − T2 when first successful customer-facing reply sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-014
- **Pre-condition:** Agent assigned (T2 exists); agent sends first customer-facing reply
- **Steps:**
  1. Navigate to assigned conversation
  2. Type message in `[data-cy="Message-Text-Input"]`
  3. Click `[data-cy="Send-Button"]`
  4. Verify `[data-cy="Chat-Detail-Sla-rlt"]` updates with T3 − T2
- **Expected Result:** RLT = T3 − T2; timer stops and shows final duration
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-005 — RLT not completed when first reply is internal note
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Agent sends internal note (not customer reply)
- **Steps:**
  1. Navigate to assigned conversation (T2 exists)
  2. Send internal note instead of customer reply
  3. Verify `[data-cy="Chat-Detail-Sla-rlt"]` timer still running
- **Expected Result:** RLT not completed; internal note does not trigger T3
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-006 — RLT not completed when first reply fails to send
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, EH-005
- **Pre-condition:** Agent reply fails to send
- **Steps:**
  1. Navigate to assigned conversation (T2 exists)
  2. Simulate send failure (disconnect WA session)
  3. Verify RLT timer continues running
- **Expected Result:** RLT not completed; failed send does not set T3
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-007 — No SLA breach created for RLT or Wait Time regardless of value
- **Type:** Regression | **Priority:** P0 | **Source:** US-003, FR-004
- **Pre-condition:** Metrics computed; no SLA breach created
- **Steps:**
  1. Navigate to conversation with completed RLT/Wait Time
  2. Verify no SLA breach notification created
  3. Check `[data-cy="chat-list-1-sla-badge"]` — no breach indicator
- **Expected Result:** No SLA breach for RLT or Wait Time regardless of value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-008 — Existing FRT and TTC behavior unchanged with metrics enabled
- **Type:** Regression | **Priority:** P0 | **Source:** US-003, FR-005
- **Pre-condition:** Existing FRT/TTC behavior with metrics enabled
- **Steps:**
  1. Navigate to conversation with existing FRT
  2. Verify `[data-cy="Chat-Detail-Sla-frt"]` unchanged
  3. Verify `[data-cy="Chat-Detail-Sla-ttc"]` unchanged
- **Expected Result:** FRT and TTC behavior unchanged after metrics enablement
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-009 — Reassignment before first reply: primary RLT starts from first assignment
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-046
- **Pre-condition:** Reassigned before first reply; RLT starts from first assignment
- **Steps:**
  1. Navigate to conversation assigned to Agent A (T2a)
  2. Reassign to Agent B via `[data-cy="Assign-Member-Modal"]`
  3. Agent B sends first reply
  4. Verify RLT baseline = T2a (first assignment)
- **Expected Result:** RLT starts from first assignment (T2a); not reset on reassignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-010 — First responder = agent who replies (not first assignee) after reassignment
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-049, FR-056
- **Pre-condition:** First responder = replying agent after reassignment
- **Steps:**
  1. Conversation assigned to Agent A then Agent B
  2. Agent B sends first customer reply
  3. Verify first responder field = Agent B
- **Expected Result:** First responder = agent who replied, not first assignee
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-011 — Reassignment after first reply: FRT/RLT/Wait Time unchanged
- **Type:** Regression | **Priority:** P0 | **Source:** US-004, FR-047
- **Pre-condition:** Reassignment after first reply; metrics unchanged
- **Steps:**
  1. Conversation with completed FRT/RLT/Wait Time
  2. Reassign conversation to different agent
  3. Verify FRT, RLT, Wait Time values unchanged
- **Expected Result:** Reassignment after first reply does not change existing metrics
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-012 — Multi-assignees added simultaneously: T2 uses earliest assignment
- **Type:** Edge | **Priority:** P0 | **Source:** US-005, FR-054
- **Pre-condition:** Multi-assignees added simultaneously; T2 = earliest assignment
- **Steps:**
  1. Assign Agent A and Agent B simultaneously
  2. Verify T2 = timestamp of earliest assignment event
- **Expected Result:** T2 uses earliest assignment timestamp
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-013 — Multi-assignees: first responder is replying agent
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-056
- **Pre-condition:** Multi-assignees: first responder = replying agent
- **Steps:**
  1. Conversation with Agent A and Agent B assigned
  2. Agent B sends first customer reply
  3. Verify first responder = Agent B
- **Expected Result:** First responder is the agent who actually replied
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-014 — Multi-assignees none reply: RLT remains incomplete
- **Type:** Edge | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Multi-assignees none reply; RLT incomplete
- **Steps:**
  1. Conversation with multiple assignees, none reply
  2. Verify `[data-cy="Chat-Detail-Sla-rlt"]` remains incomplete
- **Expected Result:** RLT remains incomplete when no assignee replies
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-015 — AUX exclusion from adjusted RLT when all agents in AUX and policy excludes
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-068
- **Pre-condition:** Test setup for: aux exclusion from adjusted rlt when all agents in aux and policy excludes
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: AUX exclusion from adjusted RLT when all agents in AUX and policy excludes
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: AUX exclusion from adjusted RLT when all agents in AUX and policy excludes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-016 — AUX not paused when at least one assignee is available
- **Type:** Edge | **Priority:** P0 | **Source:** US-006, FR-069
- **Pre-condition:** Test setup for: aux not paused when at least one assignee is available
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: AUX not paused when at least one assignee is available
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: AUX not paused when at least one assignee is available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-017 — AUX included when workspace policy counts AUX time
- **Type:** Positive | **Priority:** P0 | **Source:** US-006
- **Pre-condition:** Test setup for: aux included when workspace policy counts aux time
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: AUX included when workspace policy counts AUX time
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: AUX included when workspace policy counts AUX time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-018 — Snooze before first reply: adjusted RLT excludes only if SLA pause policy allows
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, FR-073
- **Pre-condition:** Test setup for: snooze before first reply: adjusted rlt excludes only if sla pause policy allows
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Snooze before first reply: adjusted RLT excludes only if SLA pause policy allows
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Snooze before first reply: adjusted RLT excludes only if SLA pause policy allows
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-019 — Waiting on Customer before first reply: quality flag stored
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, FR-074, EC-013
- **Pre-condition:** Test setup for: waiting on customer before first reply: quality flag stored
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Waiting on Customer before first reply: quality flag stored
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Waiting on Customer before first reply: quality flag stored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-020 — Wait Time not paused by Snooze/AUX/Waiting on Customer
- **Type:** Regression | **Priority:** P0 | **Source:** US-007, FR-075
- **Pre-condition:** Test setup for: wait time not paused by snooze/aux/waiting on customer
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Wait Time not paused by Snooze/AUX/Waiting on Customer
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Wait Time not paused by Snooze/AUX/Waiting on Customer
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-021 — Linked ticket uses conversation response metrics
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-084, FR-085
- **Pre-condition:** Linked ticket uses conversation response metrics
- **Steps:**
  1. Open conversation with linked ticket
  2. Verify ticket detail shows same RLT and Wait Time
- **Expected Result:** Linked ticket inherits conversation response metrics
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-022 — Internal-only ticket shows Not Applicable
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-087
- **Pre-condition:** Internal-only ticket shows Not Applicable
- **Steps:**
  1. Open internal-only ticket (no customer conversation)
  2. Verify RLT and Wait Time show "Not Applicable"
- **Expected Result:** Internal-only ticket: metrics = Not Applicable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-023 — Ticket linked after first response inherits completed metrics, no duplicate cycle
- **Type:** Edge | **Priority:** P0 | **Source:** US-008, FR-085, EC-008
- **Pre-condition:** Test setup for: ticket linked after first response inherits completed metrics, no duplicate cycle
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Ticket linked after first response inherits completed metrics, no duplicate cycle
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Ticket linked after first response inherits completed metrics, no duplicate cycle
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-024 — Conversation Offline Report includes RLT and Wait Time columns
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-099
- **Pre-condition:** Conversation Offline Report includes RLT and Wait Time
- **Steps:**
  1. Export Conversation Offline Report
  2. Verify CSV/Excel includes RLT and Wait Time columns
- **Expected Result:** Offline Report contains RLT and Wait Time columns with values
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-025 — Ticket Offline Report includes RLT and Wait Time columns
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-100
- **Pre-condition:** Ticket Offline Report includes RLT and Wait Time
- **Steps:**
  1. Export Ticket Offline Report
  2. Verify CSV/Excel includes RLT and Wait Time columns
- **Expected Result:** Ticket Offline Report contains RLT and Wait Time columns
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-026 — Not Applicable/Incomplete metrics export as readable value not zero
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-104, FR-105, FR-106
- **Pre-condition:** N/A/Incomplete metrics export as readable value
- **Steps:**
  1. Export report with conversations having Incomplete metrics
  2. Verify Incomplete values are readable text (not zero or blank)
- **Expected Result:** N/A or Incomplete exported as readable string, not zero
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-027 — Metric record stores T1, T2, T3, raw/adjusted duration, status, quality flags
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-092
- **Pre-condition:** Test setup for: metric record stores t1, t2, t3, raw/adjusted duration, status, quality flags
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Metric record stores T1, T2, T3, raw/adjusted duration, status, quality flags
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Metric record stores T1, T2, T3, raw/adjusted duration, status, quality flags
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-028 — Correction job recalculates and preserves previous calculation timestamp
- **Type:** Edge | **Priority:** P0 | **Source:** US-010
- **Pre-condition:** Test setup for: correction job recalculates and preserves previous calculation timestamp
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Correction job recalculates and preserves previous calculation timestamp
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Correction job recalculates and preserves previous calculation timestamp
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-029 — Invalid duration detected → status Invalid, not exported as zero
- **Type:** Negative | **Priority:** P0 | **Source:** US-010, FR-021
- **Pre-condition:** Test setup for: invalid duration detected → status invalid, not exported as zero
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Invalid duration detected → status Invalid, not exported as zero
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Invalid duration detected → status Invalid, not exported as zero
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-030 — Wait Time live timer running in Conversation Detail (T1 exists, no T2)
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-030
- **Pre-condition:** Wait Time live timer running (T1 exists, no T2)
- **Steps:**
  1. Open unassigned conversation with T1
  2. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` shows live running timer
- **Expected Result:** Wait Time shows live running timer until assignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-031 — RLT live timer running in Conversation Detail (T2 exists, no T3)
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-032
- **Pre-condition:** RLT live timer running (T2 exists, no T3)
- **Steps:**
  1. Open assigned conversation before first reply
  2. Verify `[data-cy="Chat-Detail-Sla-rlt"]` shows live running timer
- **Expected Result:** RLT shows live running timer until first reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-032 — Timer stops and shows final duration after T3
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-033, FR-034
- **Pre-condition:** Timer stops after T3
- **Steps:**
  1. Conversation where agent just sent first reply (T3 set)
  2. Verify timer stopped and shows final duration
- **Expected Result:** Timer stops; displays final duration value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-033 — No alert/breach/notification triggered by RLT or Wait Time
- **Type:** Regression | **Priority:** P0 | **Source:** US-011, FR-039
- **Pre-condition:** Test setup for: no alert/breach/notification triggered by rlt or wait time
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: No alert/breach/notification triggered by RLT or Wait Time
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: No alert/breach/notification triggered by RLT or Wait Time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-034 — Linked Ticket Detail shows same Wait Time and RLT from conversation
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-084
- **Pre-condition:** Linked Ticket Detail shows same metrics
- **Steps:**
  1. Open linked ticket detail
  2. Verify Wait Time and RLT match conversation metrics
- **Expected Result:** Ticket Detail shows identical Wait Time and RLT from conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-035 — Internal-only ticket Detail shows Not Applicable
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-087
- **Pre-condition:** Internal-only ticket Detail shows N/A
- **Steps:**
  1. Open internal-only ticket detail
  2. Verify metrics show "Not Applicable"
- **Expected Result:** Internal-only ticket Detail: Not Applicable for RLT and Wait Time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-036 — Adjusted vs raw RLT distinguishable in tooltip/export
- **Type:** Positive | **Priority:** P1 | **Source:** US-013, FR-024, FR-027
- **Pre-condition:** Test setup for: adjusted vs raw rlt distinguishable in tooltip/export
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Adjusted vs raw RLT distinguishable in tooltip/export
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Adjusted vs raw RLT distinguishable in tooltip/export
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-037 — No pause interval: adjusted RLT equals raw RLT
- **Type:** Positive | **Priority:** P1 | **Source:** US-013
- **Pre-condition:** Test setup for: no pause interval: adjusted rlt equals raw rlt
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: No pause interval: adjusted RLT equals raw RLT
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: No pause interval: adjusted RLT equals raw RLT
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-038 — Incomplete pause data: raw RLT kept, quality flag stored
- **Type:** Edge | **Priority:** P1 | **Source:** US-013, EH-013
- **Pre-condition:** Test setup for: incomplete pause data: raw rlt kept, quality flag stored
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Incomplete pause data: raw RLT kept, quality flag stored
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Incomplete pause data: raw RLT kept, quality flag stored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-039 — Team Inbox routing alone does not complete T2 (wait continues)
- **Type:** Negative | **Priority:** P0 | **Source:** FR-061, EC-006, EC-032
- **Pre-condition:** Team Inbox routing alone does not complete T2
- **Steps:**
  1. Conversation routes to Team Inbox (no individual agent assigned)
  2. Verify Wait Time continues; T2 not set by routing alone
- **Expected Result:** Team Inbox routing does not set T2; wait continues
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-040 — Client timer drift corrected on server timestamp sync
- **Type:** Edge | **Priority:** P1 | **Source:** FR-036, EH-018, EH-023
- **Pre-condition:** Test setup for: client timer drift corrected on server timestamp sync
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Client timer drift corrected on server timestamp sync
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Client timer drift corrected on server timestamp sync
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-041 — Duplicate event received: idempotent calculation, no duplicate rows
- **Type:** Regression | **Priority:** P0 | **Source:** FR-094, EH-024, EC-018
- **Pre-condition:** Test setup for: duplicate event received: idempotent calculation, no duplicate rows
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Duplicate event received: idempotent calculation, no duplicate rows
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Duplicate event received: idempotent calculation, no duplicate rows
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-042 — Overlapping pause intervals merged before adjusted calculation
- **Type:** Edge | **Priority:** P1 | **Source:** FR-077, EH-014
- **Pre-condition:** Test setup for: overlapping pause intervals merged before adjusted calculation
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Overlapping pause intervals merged before adjusted calculation
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Overlapping pause intervals merged before adjusted calculation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Omnichannel Inbox - Conversation Ownership Decoupling (Team Inbox x Channel Numbers)
- **Status:** DEVELOPED

### SC-OWNERSHIP-001 — Open conversation stays in original team after number remap (sticky legacy binding)
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-003
- **Pre-condition:** Open conversation in Team A; number remapped to Team B
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open conversation under Team A
  3. Admin remaps WA number Team A → Team B in Settings
  4. Verify conversation still in Team A (sticky legacy binding)
- **Expected Result:** Open conversation stays in original team after number remap
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-002 — Legacy-bound badge displayed in conversation header
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-008
- **Pre-condition:** Legacy-bound conversation exists
- **Steps:**
  1. Navigate to legacy-bound conversation
  2. Verify `[data-cy="Chat-Room-Header"]` shows legacy-bound badge
- **Expected Result:** Legacy-bound badge displayed in conversation header
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-003 — Closed conversation + LEGACY_TTL exceeded → new conversation in current owner team
- **Type:** Edge | **Priority:** P0 | **Source:** US-001, FR-019
- **Pre-condition:** Closed legacy conversation + LEGACY_TTL expired + new inbound
- **Steps:**
  1. Close legacy-bound conversation
  2. Wait for LEGACY_TTL to expire
  3. Customer sends new message to remapped number
  4. Verify new conversation in current owner team (Team B)
- **Expected Result:** New conversation created in current owner team after TTL expiry
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-004 — New inbound to open legacy thread: appends to old team conversation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-003
- **Pre-condition:** Open legacy thread; new inbound appends
- **Steps:**
  1. Customer sends message to remapped number (legacy thread open)
  2. Verify message appends to old team conversation
- **Expected Result:** New inbound to open legacy thread appends to old team conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-005 — No open match: new conversation created in current owner team
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-004
- **Pre-condition:** No open match; new conversation in current team
- **Steps:**
  1. No existing open conversation for contact
  2. Customer sends message
  3. Verify new conversation in current owner team
- **Expected Result:** New conversation created in current owner team
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-006 — Routing decision recorded in audit log
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-012
- **Pre-condition:** Routing decision recorded in audit log
- **Steps:**
  1. Trigger routing decision (new inbound)
  2. Check audit log for routing entry
- **Expected Result:** Routing decision recorded with source, destination, reason
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-007 — Bulk remap: no existing conversations auto-moved
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-009
- **Pre-condition:** Bulk remap: no auto-move of existing conversations
- **Steps:**
  1. Perform bulk channel remap in Settings
  2. Verify existing conversations NOT auto-moved
- **Expected Result:** Bulk remap does not auto-move existing conversations
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-008 — Escalation-only inbox: conversation moved in is fully operable
- **Type:** Positive | **Priority:** P0 | **Source:** US-104, FR-010
- **Pre-condition:** Move conversation to escalation-only inbox
- **Steps:**
  1. Move conversation to escalation-only inbox
  2. Verify conversation fully operable (reply, assign, etc.)
- **Expected Result:** Escalation-only inbox: moved conversation is fully operable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-009 — Escalation-only inbox: no new external conversations auto-created
- **Type:** Positive | **Priority:** P0 | **Source:** US-104
- **Pre-condition:** Inbox configured escalation-only; agent logged in with access
- **Steps:**
  1. Buka inbox yang di-set escalation-only via `/id/conversation/your-inbox`
  2. Kirim pesan inbound baru dari channel eksternal (WA/widget) ke nomor inbox tsb
  3. Cek daftar conversation di inbox escalation-only `[data-cy="conversation-list"]`
  4. Verifikasi tidak ada conversation baru muncul otomatis
- **Expected Result:** Pesan eksternal tidak membuat conversation baru di escalation-only inbox; hanya conversation hasil eskalasi internal yang tampil di list
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-010 — Escalation-only inbox: reply requires sender picker if default unavailable
- **Type:** Edge | **Priority:** P0 | **Source:** US-104
- **Pre-condition:** Escalation-only reply requires sender picker
- **Steps:**
  1. Open conversation in escalation-only inbox
  2. Attempt reply — verify sender picker shown if default unavailable
- **Expected Result:** Sender picker shown when default sender unavailable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-011 — Manual move preserves full history (messages, files, tags, timestamps)
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-006
- **Pre-condition:** Manual move preserves full history
- **Steps:**
  1. Move conversation from Team A to Team B
  2. Verify messages, files, tags, timestamps all preserved
- **Expected Result:** Full history preserved after manual move
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-012 — Move resets assignee to Unassigned and stops SLA immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-006, FR-015
- **Pre-condition:** Move resets assignee and stops SLA
- **Steps:**
  1. Move assigned conversation to another team
  2. Verify assignee = Unassigned
  3. Verify SLA stopped immediately
- **Expected Result:** Move resets assignee to Unassigned; SLA stops immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-013 — Move banner shown: origin, destination, actor, timestamp
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-007
- **Pre-condition:** Move banner shown with details
- **Steps:**
  1. Complete a conversation move
  2. Verify banner shows origin, destination, actor, timestamp
- **Expected Result:** Move banner: origin team, destination team, actor name, timestamp
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-014 — Reopen modal shown for closed legacy thread with remapped number
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-005
- **Pre-condition:** Reopen modal for closed legacy thread with remapped number
- **Steps:**
  1. Reopen closed legacy-bound conversation
  2. Verify reopen modal appears
- **Expected Result:** Reopen modal shown for closed legacy thread with remapped number
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-015 — Reopen modal default = Keep in Old Team
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-005
- **Pre-condition:** Reopen modal default = Keep in Old Team
- **Steps:**
  1. View reopen modal
  2. Verify default selection = "Keep in Old Team"
- **Expected Result:** Default = Keep in Old Team
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-016 — Default sender logic: last successful sender used first
- **Type:** Positive | **Priority:** P1 | **Source:** US-007, FR-011
- **Pre-condition:** Test setup for: default sender logic: last successful sender used first
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Default sender logic: last successful sender used first
- **Expected Result:** Per PRD: Default sender logic: last successful sender used first
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-017 — Sender unavailable: picker shown with permitted alternatives
- **Type:** Edge | **Priority:** P1 | **Source:** US-007, EH-004
- **Pre-condition:** Test setup for: sender unavailable: picker shown with permitted alternatives
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Sender unavailable: picker shown with permitted alternatives
- **Expected Result:** Per PRD: Sender unavailable: picker shown with permitted alternatives
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-018 — Cross-team history visible after move or legacy binding
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-014
- **Pre-condition:** Test setup for: cross-team history visible after move or legacy binding
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Cross-team history visible after move or legacy binding
- **Expected Result:** Per PRD: Cross-team history visible after move or legacy binding
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-019 — Move failed: ownership unchanged, retry option shown
- **Type:** Negative | **Priority:** P0 | **Source:** EH-001, FR-017
- **Pre-condition:** Move failed; ownership unchanged
- **Steps:**
  1. Simulate move failure (e.g. network error)
  2. Verify ownership unchanged
  3. Verify retry option shown
- **Expected Result:** Move failed: ownership unchanged, retry option shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-020 — Double-move conflict: idempotent check, latest state shown
- **Type:** Negative | **Priority:** P0 | **Source:** EH-002, FR-013
- **Pre-condition:** Double-move conflict: idempotent
- **Steps:**
  1. Two agents attempt same move simultaneously
  2. Verify idempotent: latest state shown, no duplicate
- **Expected Result:** Idempotent check; latest state displayed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-021 — Reopen choice race: last write wins, other agent notified
- **Type:** Edge | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Test setup for: reopen choice race: last write wins, other agent notified
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Reopen choice race: last write wins, other agent notified
- **Expected Result:** Per PRD: Reopen choice race: last write wins, other agent notified
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-022 — Mapping missing/invalid: route to Default Team Inbox with banner
- **Type:** Negative | **Priority:** P0 | **Source:** FR-018, EH-005
- **Pre-condition:** Mapping missing/invalid: route to Default Team
- **Steps:**
  1. Remove mapping configuration
  2. Customer sends message
  3. Verify routed to Default Team Inbox with banner
- **Expected Result:** Route to Default Team Inbox with warning banner
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-023 — Move to same team (no-op): blocked with toast
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006
- **Pre-condition:** Move to same team blocked
- **Steps:**
  1. Attempt to move conversation to its current team
  2. Verify blocked with toast message
- **Expected Result:** Move to same team blocked; toast shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-024 — Mapping settings UI states "affects new chats only"
- **Type:** Positive | **Priority:** P0 | **Source:** FR-016, UI-005
- **Pre-condition:** Mapping UI states "affects new chats only"
- **Steps:**
  1. Navigate to channel mapping Settings
  2. Verify UI shows "affects new chats only" disclaimer
- **Expected Result:** Settings UI displays "affects new chats only" warning
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Ticketing V2
- **Status:** DEVELOPED

### SC-TICKETV2-001 — Create ticket from selected chat bubbles with linked message references
- **Type:** Positive | **Priority:** P0 | **Source:** US-01, AC-01, FR-01
- **Pre-condition:** Active conversation with chat messages
- **Steps:**
  1. Navigate to conversation with messages
  2. Select chat bubbles via checkbox
  3. Click create ticket from selection
  4. Fill `[data-cy="Create-Ticket-Modal"]` fields
  5. Submit via `[data-cy="Create-Ticket-Submit-Button"]`
- **Expected Result:** Ticket created with linked message references from selected bubbles
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-002 — Create ticket from conversation list with auto-fetched context
- **Type:** Positive | **Priority:** P0 | **Source:** US-02, AC-02, FR-01
- **Pre-condition:** Active conversation exists
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Right-click conversation → Create Ticket
  3. Verify `[data-cy="Create-Ticket-Modal"]` opens with auto-fetched context
  4. Submit ticket
- **Expected Result:** Ticket created from conversation list with auto-fetched context
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-003 — Messages after ticket creation auto-tagged with is_ticket_message=true
- **Type:** Positive | **Priority:** P0 | **Source:** AC-03, FR-02
- **Pre-condition:** Ticket created from conversation
- **Steps:**
  1. After ticket creation, send new message in conversation
  2. Verify message tagged with is_ticket_message=true
- **Expected Result:** Post-creation messages auto-tagged with is_ticket_message=true
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-004 — Ticket header displays linked conversation, ticket type, ticket number
- **Type:** Positive | **Priority:** P0 | **Source:** AC-04
- **Pre-condition:** Ticket exists
- **Steps:**
  1. Open ticket detail
  2. Verify header shows linked conversation, ticket type, ticket number
- **Expected Result:** Ticket header displays linked conversation, type, and number
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-005 — Chat SLA and Ticket SLA tracked independently
- **Type:** Positive | **Priority:** P0 | **Source:** US-04, AC-05, FR-04
- **Pre-condition:** Chat and ticket both active
- **Steps:**
  1. Open conversation with linked ticket
  2. Verify Chat SLA tracked independently
  3. Verify Ticket SLA tracked independently
- **Expected Result:** Chat SLA and Ticket SLA tracked independently
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-006 — State machine: Submitted → On Process → Waiting On Customer → Resolved
- **Type:** Positive | **Priority:** P0 | **Source:** AC-06, FR-03
- **Pre-condition:** Ticket in Submitted status
- **Steps:**
  1. Open ticket
  2. Transition: Submitted → On Process → Waiting On Customer → Resolved
  3. Verify each state transition succeeds
- **Expected Result:** Valid state machine: Submitted → On Process → Waiting On Customer → Resolved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-007 — Admin can reopen Resolved ticket
- **Type:** Positive | **Priority:** P0 | **Source:** AC-07
- **Pre-condition:** Resolved ticket
- **Steps:**
  1. Open resolved ticket
  2. Admin clicks reopen
  3. Verify ticket returns to previous state
- **Expected Result:** Admin can reopen Resolved ticket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-008 — Notifications sent for new tickets, SLA warnings, reassignment
- **Type:** Positive | **Priority:** P0 | **Source:** AC-08, FR-07
- **Pre-condition:** New ticket or SLA warning or reassignment occurs
- **Steps:**
  1. Create new ticket
  2. Verify notification sent for new ticket
  3. Trigger SLA warning
  4. Verify SLA warning notification sent
- **Expected Result:** Notifications sent for new tickets, SLA warnings, reassignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-009 — All ticket actions logged in timeline (create, assign, edit, SLA, status)
- **Type:** Positive | **Priority:** P0 | **Source:** AC-09, FR-06
- **Pre-condition:** Ticket actions performed
- **Steps:**
  1. Create ticket, assign, edit, trigger SLA event, change status
  2. Verify all actions logged in timeline
- **Expected Result:** All ticket actions logged in timeline
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-010 — SLA runs when status is Submitted/In Progress (agent holds ball)
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Ticket status = Submitted or In Progress
- **Steps:**
  1. Open ticket in Submitted status
  2. Verify SLA timer running
  3. Move to In Progress
  4. Verify SLA continues running
- **Expected Result:** SLA runs when status is Submitted/In Progress
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-011 — SLA pauses when Waiting on Customer
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Ticket status = Waiting on Customer
- **Steps:**
  1. Move ticket to Waiting on Customer
  2. Verify SLA timer paused
- **Expected Result:** SLA pauses when Waiting on Customer
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-012 — SLA stops when Resolved
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Ticket status = Resolved
- **Steps:**
  1. Move ticket to Resolved
  2. Verify SLA timer stopped
- **Expected Result:** SLA stops when Resolved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-013 — SLA restarts on Reopen
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Resolved ticket reopened
- **Steps:**
  1. Reopen Resolved ticket
  2. Verify SLA restarts
- **Expected Result:** SLA restarts on Reopen
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-014 — Chat bubble deleted before ticket creation: button disabled
- **Type:** Negative | **Priority:** P0 | **Source:** EH - Invalid Bubble
- **Pre-condition:** Chat bubble deleted before ticket creation
- **Steps:**
  1. Delete chat bubble that was selected for ticket
  2. Verify create-ticket button disabled
- **Expected Result:** Button disabled when selected bubble deleted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-015 — Duplicate ticket on same conversation blocked
- **Type:** Negative | **Priority:** P0 | **Source:** EH - Duplicate Context
- **Pre-condition:** Duplicate ticket attempt on same conversation
- **Steps:**
  1. Create ticket from conversation
  2. Attempt to create second ticket from same conversation
  3. Verify blocked
- **Expected Result:** Duplicate ticket on same conversation blocked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-016 — Template API down: retry x3, fallback default form
- **Type:** Negative | **Priority:** P1 | **Source:** EH - Template Fetch Failed
- **Pre-condition:** Test setup for: template api down: retry x3, fallback default form
- **Steps:**
  1. Navigate to ticket or conversation
  2. Validate: Template API down: retry x3, fallback default form
- **Expected Result:** Per PRD: Template API down: retry x3, fallback default form
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-017 — Illegal state transition blocked (e.g. Resolved → Submitted)
- **Type:** Negative | **Priority:** P0 | **Source:** EH - State Transition Invalid
- **Pre-condition:** Illegal state transition attempted
- **Steps:**
  1. Open ticket in Resolved status
  2. Attempt direct transition to Submitted
  3. Verify transition blocked
- **Expected Result:** Illegal state transition blocked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-018 — Assign/reassign ticket to agents/team inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-03, FR-05
- **Pre-condition:** Ticket exists with assignee
- **Steps:**
  1. Open ticket
  2. Assign/reassign to agent or team inbox
  3. Verify assignment updates correctly
- **Expected Result:** Assign/reassign ticket to agents/team inbox succeeds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-019 — Ticket List page shows all tickets; assigned agents can update status
- **Type:** Positive | **Priority:** P0 | **Source:** FR-11, US-08
- **Pre-condition:** Ticket List page
- **Steps:**
  1. Navigate to Ticket List page
  2. Verify all tickets shown
  3. Assigned agent updates ticket status
  4. Verify status change reflected
- **Expected Result:** Ticket List shows all tickets; assigned agents can update status
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-020 — Agent can chat client via Ticket Room for follow-up
- **Type:** Positive | **Priority:** P0 | **Source:** FR-12, US-09
- **Pre-condition:** Ticket exists with linked conversation
- **Steps:**
  1. Open Ticket Room
  2. Send message via ticket room chat
  3. Verify client receives message
- **Expected Result:** Agent can chat client via Ticket Room for follow-up
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-021 — Invalid/inactive agent ID blocks assignment save
- **Type:** Negative | **Priority:** P1 | **Source:** EH - Assignment Error
- **Pre-condition:** Invalid/inactive agent ID in assignment
- **Steps:**
  1. Attempt to assign ticket to invalid agent ID
  2. Verify assignment save blocked
- **Expected Result:** Invalid/inactive agent ID blocks assignment save
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-022 — SLA engine timeout: queue retry, no blocking
- **Type:** Negative | **Priority:** P1 | **Source:** EH - SLA Engine Timeout
- **Pre-condition:** Test setup for: sla engine timeout: queue retry, no blocking
- **Steps:**
  1. Navigate to ticket or conversation
  2. Validate: SLA engine timeout: queue retry, no blocking
- **Expected Result:** Per PRD: SLA engine timeout: queue retry, no blocking
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Assignees and Collaborators Permission Model
- **Status:** PARTIAL

### SC-COLLAB-001 — Assignee can reply to customer (Balas pelanggan enabled)
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005
- **Pre-condition:** Agent is assigned (Assignee)
- **Steps:**
  1. Navigate to assigned conversation
  2. Verify `[data-cy="Message-Text-Input"]` is enabled
  3. Verify "Balas pelanggan" (customer reply) available
- **Expected Result:** Assignee can reply to customer; Balas pelanggan enabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-002 — Assignee can perform open/close/reopen/resolve based on RBAC
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-007
- **Pre-condition:** Agent is assigned; RBAC allows actions
- **Steps:**
  1. Navigate to assigned conversation
  2. Verify `[data-cy="chatRoom-closeConversationButton"]` available
  3. Verify reopen/resolve actions available based on RBAC
- **Expected Result:** Assignee can perform open/close/reopen/resolve per RBAC
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-003 — Non-assignee user blocked from customer reply
- **Type:** Negative | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** User is NOT assigned to conversation
- **Steps:**
  1. Navigate to conversation where user is not assignee
  2. Verify `[data-cy="Message-Text-Input"]` disabled or hidden
  3. Verify `[data-cy="Input-Area-Disabled"]` visible
- **Expected Result:** Non-assignee blocked from customer reply; input disabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-004 [UNDEV] — Collaborator can view conversation/ticket per Team Inbox visibility
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-009
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator can view conversation/ticket per Team Inbox visibility
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-005 [UNDEV] — Collaborator can add internal notes (Catatan internal)
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator can add internal notes (Catatan internal)
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-006 [UNDEV] — Collaborator blocked from customer reply (Balas pelanggan disabled)
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator blocked from customer reply (Balas pelanggan disabled)
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-007 [UNDEV] — Collaborator blocked from close/reopen/resolve actions
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-012
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator blocked from close/reopen/resolve actions
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-008 [UNDEV] — Add active user as Collaborator
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Add active user as Collaborator
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-009 [UNDEV] — Block adding inactive user as Collaborator
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-015, EH-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Block adding inactive user as Collaborator
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-010 [UNDEV] — Block adding existing Assignee as Collaborator
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-016, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Block adding existing Assignee as Collaborator
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-011 [UNDEV] — Promote Collaborator to Assignee: auto-removed from Collaborators
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promote Collaborator to Assignee: auto-removed from Collaborators
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-012 [UNDEV] — Promotion is atomic: rollback on failure keeps Collaborator state
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-020, FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promotion is atomic: rollback on failure keeps Collaborator state
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-013 [UNDEV] — Promotion logged in activity log
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-022
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promotion logged in activity log
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-014 [UNDEV] — Role labels: Assignee chip under "Assignee", Collaborator under "Kolaborator"
- **Type:** Positive | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Role labels: Assignee chip under "Assignee", Collaborator under "Kolaborator"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-015 [UNDEV] — Disabled reply tooltip: "Hanya assignee yang dapat membalas pelanggan"
- **Type:** Positive | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Disabled reply tooltip: "Hanya assignee yang dapat membalas pelanggan"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-016 [UNDEV] — Collaborator added/removed/promoted events logged
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-034, FR-035, FR-036
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator added/removed/promoted events logged
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-017 [UNDEV] — @mention Collaborator in internal note; notification sent
- **Type:** Positive | **Priority:** P1 | **Source:** US-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: @mention Collaborator in internal note; notification sent
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-018 [UNDEV] — Mentioned Collaborator removed before save: note saves, delivery skipped
- **Type:** Edge | **Priority:** P1 | **Source:** US-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Mentioned Collaborator removed before save: note saves, delivery skipped
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-019 — Removing Assignee does NOT auto-add as Collaborator
- **Type:** Positive | **Priority:** P0 | **Source:** FR-023
- **Pre-condition:** Conversation with assigned agent
- **Steps:**
  1. Navigate to conversation
  2. Remove agent from Assignee list via `[data-cy="Unassign-Member-Modal"]`
  3. Verify removed agent NOT added as Collaborator
- **Expected Result:** Removing Assignee does NOT auto-add as Collaborator
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-020 [UNDEV] — Bulk add Collaborators: skip invalid, show summary
- **Type:** Edge | **Priority:** P1 | **Source:** FR-018, EC-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Bulk add Collaborators: skip invalid, show summary
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-021 [UNDEV] — Same user in both lists via API: Assignee wins, overlap removed
- **Type:** Edge | **Priority:** P0 | **Source:** EC-012, FR-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Same user in both lists via API: Assignee wins, overlap removed
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-022 [UNDEV] — Collaborator opens closed ticket: view + internal notes allowed
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator opens closed ticket: view + internal notes allowed
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-023 [UNDEV] — Collaborator removed while typing note: save blocked if no permission
- **Type:** Edge | **Priority:** P1 | **Source:** EC-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator removed while typing note: save blocked if no permission
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-024 — Assignee removed while composing reply: send blocked, draft remains
- **Type:** Edge | **Priority:** P0 | **Source:** EC-006
- **Pre-condition:** Agent assigned; composing reply
- **Steps:**
  1. Navigate to assigned conversation
  2. Type in `[data-cy="Message-Text-Input"]`
  3. Remove agent from assignee in another session
  4. Click `[data-cy="Send-Button"]`
  5. Verify send blocked; draft remains
- **Expected Result:** Send blocked when assignee removed mid-compose; draft preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-025 [UNDEV] — Supervisor removes last Assignee: block if policy requires min 1
- **Type:** Negative | **Priority:** P0 | **Source:** EC-009
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Supervisor removes last Assignee: block if policy requires min 1
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-026 [UNDEV] — Object moved to another Team: invalid Collaborators removed per policy
- **Type:** Edge | **Priority:** P1 | **Source:** EC-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Object moved to another Team: invalid Collaborators removed per policy
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-027 [UNDEV] — Collaborator loses Team Inbox access: removed or inaccessible
- **Type:** Edge | **Priority:** P1 | **Source:** EC-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator loses Team Inbox access: removed or inaccessible
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-028 [UNDEV] — Ticket Collaborators follow same permission as Conversation Collaborators
- **Type:** Positive | **Priority:** P0 | **Source:** FR-030, FR-031, FR-032, FR-033
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket Collaborators follow same permission as Conversation Collaborators
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Conversation Custom Attributes (Single + Collections)
- **Status:** PARTIAL

### SC-ATTRS-001 — Not all fields shown by default; user adds field on demand
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-012
- **Pre-condition:** Agent viewing conversation detail sidebar
- **Steps:**
  1. Navigate to conversation → detail panel
  2. Open `[data-cy="Chat-Detail-Section-custom-attributes"]`
  3. Verify not all fields shown by default
  4. Click add field to add on demand
- **Expected Result:** Not all fields shown by default; user adds field on demand
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-002 — Cancel adding field: no changes saved
- **Type:** Positive | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** Add field picker open
- **Steps:**
  1. Open field picker in custom attributes
  2. Click Cancel
  3. Verify no changes saved
- **Expected Result:** Cancel adding field: no changes saved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-003 — ui_editable=true field value editable and saved immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-013
- **Pre-condition:** Custom attribute with ui_editable=true
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-custom-attributes"]`
  2. Edit ui_editable=true field value
  3. Verify auto-save on change
- **Expected Result:** Field value editable and saved immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-004 — ui_editable=false field input disabled, not editable
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-014
- **Pre-condition:** Custom attribute with ui_editable=false
- **Steps:**
  1. Open custom attributes section
  2. Verify ui_editable=false field input is disabled
- **Expected Result:** Field input disabled; not editable by agent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-005 — No permission user: editing controls hidden/disabled
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-033
- **Pre-condition:** User without permission
- **Steps:**
  1. Login as user without attribute edit permission
  2. Open custom attributes
  3. Verify editing controls hidden/disabled
- **Expected Result:** No permission user: editing controls hidden/disabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-006 — Remove action on ui_editable=true field with confirmation
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-016, FR-017
- **Pre-condition:** ui_editable=true field with remove action
- **Steps:**
  1. Open custom attributes
  2. Click remove on ui_editable=true field
  3. Confirm removal dialog
  4. Verify field removed
- **Expected Result:** Remove action on ui_editable=true field with confirmation succeeds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-007 — Remove blocked on ui_editable=false field
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-018
- **Pre-condition:** ui_editable=false field with remove attempt
- **Steps:**
  1. Open custom attributes
  2. Attempt remove on ui_editable=false field
  3. Verify remove blocked
- **Expected Result:** Remove blocked on ui_editable=false field
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-008 — Admin can create new field definition from picker
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-008
- **Pre-condition:** Admin user
- **Steps:**
  1. Login as Admin
  2. Open attribute picker
  3. Create new field definition
  4. Verify creation succeeds
- **Expected Result:** Admin can create new field definition from picker
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-009 — Non-Admin blocked from creating field definitions
- **Type:** Negative | **Priority:** P0 | **Source:** US-007, FR-008, EH-003
- **Pre-condition:** Non-Admin user
- **Steps:**
  1. Login as non-Admin
  2. Attempt to create field definition
  3. Verify blocked
- **Expected Result:** Non-Admin blocked from creating field definitions
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-010 — Dropdown definition requires at least 1 option
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, EH-001
- **Pre-condition:** Creating dropdown definition
- **Steps:**
  1. Create dropdown attribute with zero options
  2. Verify save blocked
- **Expected Result:** Dropdown definition requires at least 1 option
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-011 — Dropdown with options: value selector enabled for agent
- **Type:** Positive | **Priority:** P0 | **Source:** US-008
- **Pre-condition:** Dropdown with options defined
- **Steps:**
  1. Open conversation with dropdown attribute
  2. Verify value selector enabled for agent
- **Expected Result:** Dropdown value selector enabled for agent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-012 — Integration updates value on ui_editable=false field (allowed)
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-015
- **Pre-condition:** Integration updates ui_editable=false field
- **Steps:**
  1. Integration (API) updates value on ui_editable=false field
  2. Verify update succeeds (API edit allowed)
- **Expected Result:** Integration can update ui_editable=false field
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-013 — Search conversations by custom attribute text value
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-026
- **Pre-condition:** Custom attribute text value set
- **Steps:**
  1. Navigate to conversation list
  2. Search by custom attribute text value
  3. Verify matching conversations returned
- **Expected Result:** Search by custom attribute text value returns matches
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-014 — Search matches inside collection values
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-027
- **Pre-condition:** Collection with values
- **Steps:**
  1. Search by value inside collection
  2. Verify matching conversations returned
- **Expected Result:** Search matches inside collection values
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-015 — Search by dropdown label matches stored value
- **Type:** Positive | **Priority:** P0 | **Source:** US-010
- **Pre-condition:** Dropdown attribute with stored value
- **Steps:**
  1. Search by dropdown label text
  2. Verify matching conversations returned
- **Expected Result:** Search by dropdown label matches stored value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-016 [UNDEV] — Create collection: starts empty with zero fields
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Create collection: starts empty with zero fields
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-017 [UNDEV] — Multiple collections shown as compact rows with title + expand
- **Type:** Positive | **Priority:** P0 | **Source:** US-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Multiple collections shown as compact rows with title + expand
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-018 [UNDEV] — Single collection: flat mode without collection header
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Single collection: flat mode without collection header
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-019 [UNDEV] — Collection title uses name; fallback to last two non-empty values; "Tanpa judul" if none
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-023, FR-024, FR-025
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collection title uses name; fallback to last two non-empty values; "Tanpa judul" if none
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-020 [UNDEV] — Rename collection inline; delete with confirmation
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-020, FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Rename collection inline; delete with confirmation
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-021 — Duplicate field definition label blocked (case-insensitive)
- **Type:** Negative | **Priority:** P0 | **Source:** FR-009, EH-002
- **Pre-condition:** Creating attribute with duplicate label
- **Steps:**
  1. Create attribute with label that already exists (case-insensitive)
  2. Verify save blocked
- **Expected Result:** Duplicate field definition label blocked (case-insensitive)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-022 [UNDEV] — Pagination: "X lainnya" for many collections
- **Type:** Positive | **Priority:** P1 | **Source:** US-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Pagination: "X lainnya" for many collections
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates
- **Status:** UNDEVELOPED

### SC-AUTOREPLY-001 [UNDEV] — Admin enables Availability Auto-Reply; triggers and templates configured
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-004, FR-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Admin enables Availability Auto-Reply; triggers and templates configured
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-002 [UNDEV] — Auto-reply disabled: no auto-reply sent on inbound
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Auto-reply disabled: no auto-reply sent on inbound
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-003 [UNDEV] — Enabled with no trigger: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-006, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Enabled with no trigger: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-004 [UNDEV] — Outside office hours trigger: auto-reply sent when message outside General Office Hours
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-009, FR-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Outside office hours trigger: auto-reply sent when message outside General Office Hours
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-005 [UNDEV] — Outside office hours enabled but Office Hours not configured: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-018, EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Outside office hours enabled but Office Hours not configured: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-006 [UNDEV] — Inside office hours: no auto-reply sent for this trigger
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Inside office hours: no auto-reply sent for this trigger
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-007 [UNDEV] — No agent available trigger: auto-reply when zero eligible agents
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-010, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No agent available trigger: auto-reply when zero eligible agents
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-008 [UNDEV] — At least one eligible agent: no auto-reply for this trigger
- **Type:** Positive | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: At least one eligible agent: no auto-reply for this trigger
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-009 [UNDEV] — Availability check fails: no auto-reply from this trigger, failure logged
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-023, EH-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Availability check fails: no auto-reply from this trigger, failure logged
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-010 [UNDEV] — Both triggers match: one auto-reply sent, reason = Outside office hours
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-013, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Both triggers match: one auto-reply sent, reason = Outside office hours
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-011 [UNDEV] — Auto-reply sender shown as "SatuInbox Bot"
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-046
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Auto-reply sender shown as "SatuInbox Bot"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-012 [UNDEV] — Bot reply excluded from FRT/ART/Ticket SLA/agent performance
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-048
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Bot reply excluded from FRT/ART/Ticket SLA/agent performance
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-013 [UNDEV] — Separate Conversation and Ticket templates required
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-031, FR-034
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Separate Conversation and Ticket templates required
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-014 [UNDEV] — Conversation template empty: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Conversation template empty: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-015 [UNDEV] — Ticket template empty: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket template empty: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-016 [UNDEV] — Active ticket context: Ticket template used
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-025, FR-026
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Active ticket context: Ticket template used
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-017 [UNDEV] — No active ticket context: Conversation template used
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-027
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No active ticket context: Conversation template used
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-018 [UNDEV] — Both contexts: Ticket template takes priority
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-028
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Both contexts: Ticket template takes priority
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-019 [UNDEV] — Conversation auto-reply logged in Conversation timeline
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-060
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Conversation auto-reply logged in Conversation timeline
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-020 [UNDEV] — Ticket auto-reply logged in both Conversation and Ticket timeline
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-061, FR-070
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket auto-reply logged in both Conversation and Ticket timeline
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-021 [UNDEV] — Timeline log failure: retry without resending customer message
- **Type:** Edge | **Priority:** P0 | **Source:** US-008, FR-064
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Timeline log failure: retry without resending customer message
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-022 [UNDEV] — Frequency limit: only one auto-reply per conversation within window
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-055, FR-056
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Frequency limit: only one auto-reply per conversation within window
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-023 [UNDEV] — Frequency evaluated separately per ticket
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-057
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Frequency evaluated separately per ticket
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-024 [UNDEV] — Cancel if agent replies first: pending auto-reply canceled
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-049, FR-053
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel if agent replies first: pending auto-reply canceled
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-025 [UNDEV] — No agent reply before delay: auto-reply sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No agent reply before delay: auto-reply sent
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-026 [UNDEV] — Cancel disabled: auto-reply sent immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-051
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel disabled: auto-reply sent immediately
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-027 [UNDEV] — Cancel disabled: delay input hidden
- **Type:** Positive | **Priority:** P1 | **Source:** US-010, FR-050
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel disabled: delay input hidden
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-028 [UNDEV] — Template variable unsupported: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** FR-039, EH-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Template variable unsupported: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-029 [UNDEV] — Preview renders Conversation and Ticket templates with sample values
- **Type:** Positive | **Priority:** P1 | **Source:** US-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Preview renders Conversation and Ticket templates with sample values
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-030 [UNDEV] — Unsaved changes: warning dialog on page leave
- **Type:** Positive | **Priority:** P1 | **Source:** US-012, FR-077, FR-078
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Unsaved changes: warning dialog on page leave
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-031 [UNDEV] — Rapid messages in one conversation: frequency limit prevents duplicates
- **Type:** Edge | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Rapid messages in one conversation: frequency limit prevents duplicates
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-032 [UNDEV] — Agent replies after bot message already sent: bot remains, no issue
- **Type:** Edge | **Priority:** P1 | **Source:** EC-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent replies after bot message already sent: bot remains, no issue
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-033 [UNDEV] — Internal note added before delay: does NOT cancel pending auto-reply
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006, FR-054
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Internal note added before delay: does NOT cancel pending auto-reply
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-034 [UNDEV] — Ticket resolved before delay: re-evaluate context before sending
- **Type:** Edge | **Priority:** P1 | **Source:** EC-008, FR-073
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket resolved before delay: re-evaluate context before sending
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-035 [UNDEV] — Channel unsupported: skip auto-reply, log skipped event
- **Type:** Negative | **Priority:** P1 | **Source:** EH-012
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Channel unsupported: skip auto-reply, log skipped event
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-036 [UNDEV] — Duplicate inbound event: idempotent, no duplicate auto-reply
- **Type:** Regression | **Priority:** P0 | **Source:** FR-074, FR-076, EH-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Duplicate inbound event: idempotent, no duplicate auto-reply
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Conversation Snooze (Conversation List)
- **Status:** UNDEVELOPED

### SC-SNOOZE-001 [UNDEV] — Agent snoozes Open conversation to future time; hidden from Open list
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent snoozes Open conversation to future time; hidden from Open list
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-002 [UNDEV] — Snooze time reached: conversation returns to Open, in-app notification "Snooze selesai"
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005, FR-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze time reached: conversation returns to Open, in-app notification "Snooze selesai"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-003 [UNDEV] — Attempt snooze with past time: blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Attempt snooze with past time: blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-004 [UNDEV] — Snooze does NOT change conversation status
- **Type:** Regression | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze does NOT change conversation status
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-005 [UNDEV] — Manual unsnooze: returns to original list without status change
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Manual unsnooze: returns to original list without status change
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-006 [UNDEV] — New inbound customer message: auto-unsnooze immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: New inbound customer message: auto-unsnooze immediately
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-007 [UNDEV] — Snoozed count shown on Snoozed chip in top bar
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed count shown on Snoozed chip in top bar
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-008 [UNDEV] — Snoozed filter option in dropdown filter
- **Type:** Positive | **Priority:** P1 | **Source:** FR-015
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed filter option in dropdown filter
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-009 [UNDEV] — Snooze modal when reminder exists: info note "Reminder akan menyesuaikan..."
- **Type:** Edge | **Priority:** P1 | **Source:** US-005, FR-024
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze modal when reminder exists: info note "Reminder akan menyesuaikan..."
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-010 [UNDEV] — Reminder inside snooze window: deferred to snooze_until
- **Type:** Edge | **Priority:** P1 | **Source:** US-005, FR-023
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Reminder inside snooze window: deferred to snooze_until
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-011 [UNDEV] — Snoozed then customer replies immediately: auto-unsnooze, moves to Open
- **Type:** Edge | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed then customer replies immediately: auto-unsnooze, moves to Open
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-012 [UNDEV] — Snoozed then reassigned: wake notification goes to new assignee
- **Type:** Edge | **Priority:** P1 | **Source:** EC-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed then reassigned: wake notification goes to new assignee
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-013 [UNDEV] — Agent viewing snoozed conversation: detail accessible, hidden only from list
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent viewing snoozed conversation: detail accessible, hidden only from list
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-014 [UNDEV] — Snooze from Closed list: hidden from Closed, returns to Closed on wake
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze from Closed list: hidden from Closed, returns to Closed on wake
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-015 [UNDEV] — Cancel and time-based wake race: idempotent, single unsnooze
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel and time-based wake race: idempotent, single unsnooze
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-016 [UNDEV] — Agent snooze permission: only own assigned conversations
- **Type:** Permission | **Priority:** P0 | **Source:** FR-009, FR-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent snooze permission: only own assigned conversations
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-017 [UNDEV] — Supervisor/Admin snooze: any conversation in Team Inbox scope
- **Type:** Permission | **Priority:** P0 | **Source:** FR-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Supervisor/Admin snooze: any conversation in Team Inbox scope
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-018 [UNDEV] — Snooze unassigned conversation blocked for Agent
- **Type:** Negative | **Priority:** P0 | **Source:** FR-011, EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze unassigned conversation blocked for Agent
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Omnichannel Inbox - Related Conversations Grouping
- **Status:** UNDEVELOPED

### SC-RELATED-001 [UNDEV] — Admin configures 1-4 Related Match Keys; row order = priority
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Admin configures 1-4 Related Match Keys; row order = priority
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-002 [UNDEV] — Delete all rows: save blocked "Minimal 1 key diperlukan"
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-008, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Delete all rows: save blocked "Minimal 1 key diperlukan"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-003 [UNDEV] — Duplicate Source + Field Name: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-009, EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Duplicate Source + Field Name: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-004 [UNDEV] — "Pulihkan default" restores contact_number, email, contact_name
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: "Pulihkan default" restores contact_number, email, contact_name
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-005 [UNDEV] — Add drawer: single unified result list with matched-first ranking
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-022, FR-023
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Add drawer: single unified result list with matched-first ranking
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-006 [UNDEV] — No exact match: keyword/Conversation ID search still available
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-029
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No exact match: keyword/Conversation ID search still available
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-007 [UNDEV] — Already linked conversation excluded from result list
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-028
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Already linked conversation excluded from result list
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-008 [UNDEV] — Matched result shows "Matched by" + "Matched value"
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-026
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Matched result shows "Matched by" + "Matched value"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-009 [UNDEV] — Multiple keys match: highest priority key shown
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Multiple keys match: highest priority key shown
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-010 [UNDEV] — Link two standalone conversations: one flat group (Primary + Child)
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-030, FR-031
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Link two standalone conversations: one flat group (Primary + Child)
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-011 [UNDEV] — Unlink child: becomes standalone again
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-034
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Unlink child: becomes standalone again
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-012 [UNDEV] — Promote child to Primary
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-035
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promote child to Primary
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-013 [UNDEV] — Child belongs to another group: requires move/combine confirmation
- **Type:** Negative | **Priority:** P0 | **Source:** US-004, EH-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Child belongs to another group: requires move/combine confirmation
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-014 [UNDEV] — Combine two groups: final Primary selection required
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-037, FR-038
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Combine two groups: final Primary selection required
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-015 [UNDEV] — Combine cancel: both original groups unchanged
- **Type:** Positive | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Combine cancel: both original groups unchanged
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-016 [UNDEV] — Grouped conversations: one parent row in list, children in expanded state
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-039, FR-040
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Grouped conversations: one parent row in list, children in expanded state
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-017 [UNDEV] — Parent row sorting uses latest activity across all children
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-041
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Parent row sorting uses latest activity across all children
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-018 [UNDEV] — Parent unread count aggregates all child unread
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-042
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Parent unread count aggregates all child unread
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-019 [UNDEV] — Grouped room opens on Primary tab by default
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-045, FR-050
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Grouped room opens on Primary tab by default
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-020 [UNDEV] — Child tabs after Primary; unread indicator on child tabs
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-049
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Child tabs after Primary; unread indicator on child tabs
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-021 [UNDEV] — Red dot on Add button when high-confidence matches exist
- **Type:** Positive | **Priority:** P1 | **Source:** US-008
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Red dot on Add button when high-confidence matches exist
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-022 [UNDEV] — Customer notice enabled by default; editable before send
- **Type:** Positive | **Priority:** P1 | **Source:** US-010, FR-052, FR-053
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Customer notice enabled by default; editable before send
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-023 [UNDEV] — Ineligible channels skipped for notice; grouping still succeeds
- **Type:** Edge | **Priority:** P1 | **Source:** US-010, FR-056, EH-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ineligible channels skipped for notice; grouping still succeeds
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-024 [UNDEV] — Group dissolves when only one conversation remains after unlink
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Group dissolves when only one conversation remains after unlink
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - WhatsApp Group Mention in Conversation (WhatsApp Web)
- **Status:** UNDEVELOPED

### SC-WAMENTION-001 [UNDEV] — Typing "@" in WA group opens participant picker
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Typing "@" in WA group opens participant picker
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-002 [UNDEV] — Picker filters by name and number on query
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Picker filters by name and number on query
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-003 [UNDEV] — Picker load fails: auto-retry once, then error state with "Coba lagi"
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-008, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Picker load fails: auto-retry once, then error state with "Coba lagi"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-004 [UNDEV] — Select participant: mention token inserted in message input
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Select participant: mention token inserted in message input
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-005 [UNDEV] — Send with valid mentions: delivered with working mentions in WA group
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-009
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Send with valid mentions: delivered with working mentions in WA group
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-006 [UNDEV] — Selected participant no longer valid: dropped on send, warning toast
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-011, EH-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Selected participant no longer valid: dropped on send, warning toast
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-007 [UNDEV] — Inbound/outbound mentions rendered with highlight styling
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Inbound/outbound mentions rendered with highlight styling
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-008 [UNDEV] — Hover mention: tooltip with display name and number
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-015
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Hover mention: tooltip with display name and number
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-009 [UNDEV] — Mention metadata missing: graceful fallback to plain text
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Mention metadata missing: graceful fallback to plain text
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-010 [UNDEV] — Participant picker fails entirely: message can still send as plain text
- **Type:** Negative | **Priority:** P0 | **Source:** US-004, FR-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Participant picker fails entirely: message can still send as plain text
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-011 [UNDEV] — Internal participant labeled "Internal" in picker
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-017, FR-018
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Internal participant labeled "Internal" in picker
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-012 [UNDEV] — Internal participant tooltip includes "Internal" label
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Internal participant tooltip includes "Internal" label
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-013 [UNDEV] — Two participants with same display name: number shown to disambiguate
- **Type:** Edge | **Priority:** P1 | **Source:** EC-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Two participants with same display name: number shown to disambiguate
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-014 [UNDEV] — Participant leaves group after picker opens: mention dropped on send
- **Type:** Edge | **Priority:** P1 | **Source:** EC-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Participant leaves group after picker opens: mention dropped on send
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-015 [UNDEV] — Max 100 mentions per message; above limit blocked
- **Type:** Edge | **Priority:** P1 | **Source:** EC-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Max 100 mentions per message; above limit blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-016 [UNDEV] — "@text" typed without selecting participant: sends as normal text
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: "@text" typed without selecting participant: sends as normal text
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-017 [UNDEV] — Agent without send permission: picker not shown
- **Type:** Permission | **Priority:** P0 | **Source:** FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent without send permission: picker not shown
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-018 [UNDEV] — WA session invalid: block mention and message send
- **Type:** Negative | **Priority:** P0 | **Source:** EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: WA session invalid: block mention and message send
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---


---

## Part C: SC-GSEARCH + SC-SHAREATTR + SC-SHOPEE — 63 scenarios

# Conversation Scenario Catalog — Part C: Adjacent Surfaces (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **PRD Sources:** Global Search, Shared Attribute Search, Shopee Channel Add-On
> **Scenarios:** 63 (SC-GSEARCH 20 + SC-SHAREATTR 18 + SC-SHOPEE 25)

---

# 1. SC-GSEARCH: Global Search (Conversation + Ticket)

> **Status:** DEVELOPED
> **PRD:** `PRD/Conversationv2/PRD - Global Search (Conversation + Ticket).md`
> **Surface:** Centered popup modal (Cari sidenav / Ctrl+K) + full-page `/search` fallback

---

### SC-GSEARCH-001 — Search by business identifier returns results from both domains
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-007–FR-010
- **Pre-condition:** Agent logged in; workspace has at least one Ticket and one Conversation both containing the same AWB value (e.g. "AWB-1234")
- **Steps:**
  1. Press `Ctrl+K` or click "Cari" in sidenav to open search popup
  2. Verify centered popup modal appears with input auto-focused
  3. Type `AWB-1234` in the search input
  4. Wait for results to load
  5. Verify "Tiket" section appears with matching Ticket result
  6. Verify "Percakapan" section appears with matching Conversation result
  7. Verify both sections display in one unified popup surface
- **Expected Result:** Search returns matching results from both Ticket and Conversation domains grouped in one surface; each section header labels the domain
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-GSEARCH-002 — Only Ticket section shown when only Ticket matches exist
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** Workspace has a Ticket with AWB "AWB-9999" but no Conversation contains that value
- **Steps:**
  1. Open search popup via `Ctrl+K`
  2. Type `AWB-9999` in search input
  3. Wait for results
  4. Verify "Tiket" section visible with at least one result
  5. Verify "Percakapan" section is NOT visible (hidden, not just empty)
- **Expected Result:** Only Ticket section rendered; Conversation section hidden entirely
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-003 — Only Conversation section shown when only Conversation matches exist
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** Workspace has a Conversation with Order ID "ORD-5555" but no Ticket contains that value
- **Steps:**
  1. Open search popup via `Ctrl+K`
  2. Type `ORD-5555` in search input
  3. Wait for results
  4. Verify "Percakapan" section visible with at least one result
  5. Verify "Tiket" section is NOT visible
- **Expected Result:** Only Conversation section rendered; Ticket section hidden entirely
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-004 — Each result displays `Matched by` with the attribute key
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-021–FR-023
- **Pre-condition:** At least one search result returned for a business identifier
- **Steps:**
  1. Open search popup and search for a known identifier (e.g. `AWB-1234`)
  2. For each result card in the popup, verify a "Matched by" label is present
  3. Verify the label shows the attribute key (e.g. "AWB", "Order ID", "Tracking Number")
- **Expected Result:** Every result card displays "Matched by" with the correct attribute key that caused the match
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-005 — Each result displays `Matched value` with normalized value
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-022
- **Pre-condition:** At least one search result returned
- **Steps:**
  1. Open search popup and search for a known identifier
  2. For each result card, verify a "Matched value" label is present
  3. Verify the value shown is the normalized or display-safe representation of the matched value
- **Expected Result:** "Matched value" displayed on every result card; value is normalized and safe for display
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-006 — Multiple qualifying fields → only highest-priority match reason displayed
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-023, EC-002
- **Pre-condition:** A record has multiple fields that match the search query (e.g. both AWB and Tracking Number contain the same value)
- **Steps:**
  1. Open search popup and search for the shared value
  2. Locate the result that matches on multiple fields
  3. Verify only ONE "Matched by" key is shown (the highest-priority one)
  4. Verify no duplicate or secondary match reason is displayed
- **Expected Result:** Only the highest-priority match reason displayed; lower-priority matches suppressed
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-007 — Clicking a Conversation result opens Conversation Room and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-027, FR-029
- **Pre-condition:** Search popup has at least one Conversation result
- **Steps:**
  1. Open search popup and search for a known identifier
  2. Click on a Conversation result row
  3. Verify popup closes
  4. Verify Conversation Room opens (`Chat-Room-Container` visible)
  5. Verify `[data-cy="Chat-Room-Header-Contact-Name"]` shows correct contact
- **Expected Result:** Clicking Conversation result navigates to Conversation Room; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-008 — Clicking a Ticket result opens Ticket Detail and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-028, FR-029
- **Pre-condition:** Search popup has at least one Ticket result
- **Steps:**
  1. Open search popup and search for a known identifier
  2. Click on a Ticket result row
  3. Verify popup closes
  4. Verify Ticket Detail page opens
- **Expected Result:** Clicking Ticket result navigates to Ticket Detail; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-009 — Reopening popup restores last keyword and results from session state
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-030
- **Pre-condition:** Agent has previously searched in this session
- **Steps:**
  1. Open search popup via `Ctrl+K`, search for `AWB-1234`, verify results shown
  2. Close popup (press `Esc` or click outside)
  3. Reopen popup via `Ctrl+K`
  4. Verify search input still contains `AWB-1234`
  5. Verify previous results are restored (no re-fetch needed)
- **Expected Result:** Session state preserved; last keyword and results restored on reopen
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-010 — Clicking Cari in sidenav opens centered popup modal
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-001–FR-002
- **Pre-condition:** Agent logged in, on any page
- **Steps:**
  1. Click "Cari" button in sidenav
  2. Verify centered popup modal appears above current page
  3. Verify popup has search input field
  4. Verify popup overlays current page (background dimmed or blurred)
- **Expected Result:** Popup modal opens centered above current page; input ready for typing
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-011 — Pressing Ctrl+K/Cmd+K opens popup with input auto-focused
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-003
- **Pre-condition:** Agent logged in, on any page
- **Steps:**
  1. Press `Ctrl+K` (Windows) or `Cmd+K` (Mac)
  2. Verify centered popup modal appears
  3. Verify search input is auto-focused (cursor blinking, can type immediately)
  4. Press `Esc` — verify popup closes
- **Expected Result:** Keyboard shortcut opens search popup with input auto-focused
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-012 — Agent with scoped access sees only allowed records
- **Type:** Permission | **Priority:** P0 | **Source:** US-005, FR-005–FR-006, EH-005
- **Pre-condition:** Agent has RBAC-scoped access (e.g. Team A only); Tickets and Conversations exist across multiple teams
- **Steps:**
  1. Login as scoped agent
  2. Open search popup and search for a known identifier
  3. Verify only results from accessible teams/domains are shown
  4. Verify out-of-scope records are silently excluded (no error, no placeholder)
- **Expected Result:** Scoped agent sees only permitted results; out-of-scope records silently excluded
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-013 — Search query is tenant-scoped; no cross-tenant leakage
- **Type:** Permission | **Priority:** P0 | **Source:** FR-006
- **Pre-condition:** Multi-tenant environment; Tenant A and Tenant B both have data
- **Steps:**
  1. Login as Tenant A agent
  2. Search for an identifier that exists only in Tenant B
  3. Verify no results returned (or only Tenant A matches)
  4. Verify network request includes correct `companyId` / `organizationId`
- **Expected Result:** Search scoped to current tenant; no cross-tenant data leakage
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-014 — Loading state shows "Mencari..." while request in flight
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-034
- **Pre-condition:** Agent opens search popup
- **Steps:**
  1. Open search popup via `Ctrl+K`
  2. Type a search keyword and press Enter or wait for debounce
  3. Verify "Mencari..." loading indicator appears while request is in flight
  4. Verify loading indicator disappears when results load
- **Expected Result:** "Mencari..." shown during search; replaced by results or empty state on completion
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-015 — Empty state shows "Tidak ada data terkait ditemukan."
- **Type:** State | **Priority:** P0 | **Source:** US-006, FR-035
- **Pre-condition:** Search keyword yields no matches in either domain
- **Steps:**
  1. Open search popup and type a non-existent identifier (e.g. `ZZZ-NONEXISTENT-999`)
  2. Wait for search to complete
  3. Verify empty state message: "Tidak ada data terkait ditemukan."
  4. Verify no section headers visible (no empty "Tiket" or "Percakapan" sections)
- **Expected Result:** Empty state message displayed; no stale or partial sections
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-016 — Ticket search fails but Conversation succeeds → partial retry
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, FR-036, FR-037, EH-002
- **Pre-condition:** Ticket search service is down or returns 5xx; Conversation service is healthy
- **Steps:**
  1. Simulate Ticket search failure (e.g. mock 500 or kill Ticket search service)
  2. Open search popup and search for a known identifier
  3. Verify Conversation results load normally
  4. Verify Ticket section shows retry button labeled "Coba lagi"
  5. Click "Coba lagi" — verify Ticket search retries
- **Expected Result:** Conversation results visible; Ticket section shows "Coba lagi" retry; no full-page error
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-017 — Both domains fail → full error with retry
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Both Ticket and Conversation search services are down
- **Steps:**
  1. Simulate both search services returning 5xx
  2. Open search popup and search
  3. Verify popup stays open (does not crash or close)
  4. Verify message: "Gagal memuat hasil pencarian. Coba lagi."
  5. Verify "Coba lagi" button is visible and functional
- **Expected Result:** Error message shown with retry option; popup remains stable
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-018 — Case and separator normalization treats values as same match
- **Type:** Edge | **Priority:** P0 | **Source:** FR-011–FR-013, EC-003
- **Pre-condition:** Record stored with AWB "AWB-1234"; another stored as "awb1234"
- **Steps:**
  1. Open search popup and search for `AWB-1234`
  2. Verify both records appear in results (one with stored value "AWB-1234", another with "awb1234")
  3. Search for `awb1234` — verify same two records appear
  4. Search for `AWB1234` — verify same two records appear
- **Expected Result:** Case and separator differences normalized; all variants match the same records
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-019 — Exact high-confidence matches rank above fallback results
- **Type:** Positive | **Priority:** P0 | **Source:** FR-031–FR-033
- **Pre-condition:** Search produces both exact matches and weaker/fallback matches
- **Steps:**
  1. Search for an identifier that has exact matches and partial matches
  2. Verify exact (normalized, high-confidence) matches appear first in each domain section
  3. Verify weaker/fallback results appear below exact matches
  4. For same-strength ties, verify sorting by most recently updated
- **Expected Result:** Results ranked by match confidence; ties broken by recency
- **Actual Result:** *(QA fills)*

---

### SC-GSEARCH-020 — Phase 1 search does NOT mutate data or auto-create tags
- **Type:** Regression | **Priority:** P0 | **Source:** FR-014–FR-016
- **Pre-condition:** Agent performs multiple searches
- **Steps:**
  1. Record current state of a known Ticket (fields, tags, status)
  2. Record current state of a known Conversation (fields, tags, attributes)
  3. Open search popup and search for identifiers matching both records
  4. Open and click through results
  5. Re-check both records — verify no fields modified, no tags auto-created, no status changes
- **Expected Result:** Zero data mutation from search; no auto-tags created; Phase 1 is read-only
- **Actual Result:** *(QA fills)*

---

# 2. SC-SHAREATTR: Actionable Shared Attribute Search & System Relation Labels

> **Status:** UNKNOWN — verify against FE/BE
> **PRD:** `PRD/Conversationv2/PRD - Actionable Shared Attribute Search and System Relation Labels.md`
> **Surface:** Search popup + per-domain checkbox selection + bulk action bar + relation label chips

---

### SC-SHAREATTR-001 — Clicking Conversation result opens Conversation Room with Detail panel
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-003
- **Pre-condition:** Search popup has at least one Conversation result
- **Steps:**
  1. Open search popup (`Ctrl+K`) and search for a known identifier
  2. Click on a Conversation result row
  3. Verify popup closes
  4. Verify Conversation Room opens (`Chat-Room-Container` visible)
  5. Verify Detail panel is visible (`Chat-Detail-Title` present)
- **Expected Result:** Conversation Room opens with Detail panel visible; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-002 — Clicking Ticket result opens Ticket Detail and closes popup
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002, FR-003
- **Pre-condition:** Search popup has at least one Ticket result
- **Steps:**
  1. Open search popup and search for a known identifier
  2. Click on a Ticket result row
  3. Verify popup closes
  4. Verify Ticket Detail page opens
- **Expected Result:** Ticket Detail page opens; popup dismissed
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-003 — Checkbox selection of multiple Conversation results shows Conversation bulk action bar
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005, FR-008, FR-010
- **Pre-condition:** Search popup has ≥2 Conversation results
- **Steps:**
  1. Open search popup and search for an identifier with multiple Conversation matches
  2. Click checkbox on first Conversation result
  3. Click checkbox on second Conversation result
  4. Verify Conversation bulk action bar appears at bottom/top of popup
  5. Verify action bar shows Conversation-specific actions (e.g. "Beri Tag Relasi Otomatis")
- **Expected Result:** Selecting ≥2 Conversation results shows Conversation bulk action bar with domain-specific actions
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-004 — Checkbox selection of multiple Ticket results shows Ticket bulk action bar
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005, FR-008, FR-011
- **Pre-condition:** Search popup has ≥2 Ticket results
- **Steps:**
  1. Open search popup and search for an identifier with multiple Ticket matches
  2. Select checkboxes on ≥2 Ticket results
  3. Verify Ticket bulk action bar appears separately from Conversation bar (if any)
  4. Verify action bar shows Ticket-specific actions
- **Expected Result:** Ticket bulk action bar appears with Ticket-specific actions; separate from Conversation bar
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-005 — Selecting both Conversation and Ticket results shows two separate action bars
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-006–FR-007, EH-004
- **Pre-condition:** Search popup has both Conversation and Ticket results
- **Steps:**
  1. Search for an identifier that returns both domains
  2. Select ≥1 Conversation result and ≥1 Ticket result
  3. Verify two separate domain-specific action bars are shown
  4. Verify NO mixed-domain bulk execution option exists
  5. Verify executing action on one domain does not affect the other domain's selection
- **Expected Result:** Two separate action bars; no cross-domain bulk execution; selections independent
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-006 — "Beri Tag Relasi Otomatis" applies system relation label to selected records
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-012
- **Pre-condition:** Conversation results selected with checkbox; shared attribute context available
- **Steps:**
  1. Select ≥1 Conversation results via checkbox
  2. Click "Beri Tag Relasi Otomatis" in the bulk action bar
  3. Verify action completes (success toast or indicator)
  4. Open one of the selected conversations
  5. Verify relation label chip appears in the conversation detail/tag area
- **Expected Result:** System relation label applied to all selected records based on shared attribute context
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-007 — Applying same relation label to record that already has it is idempotent
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-015, FR-021, EH-002
- **Pre-condition:** Conversation already has relation label "AWB • JNE123456789"
- **Steps:**
  1. Select the conversation that already has the relation label
  2. Click "Beri Tag Relasi Otomatis" again for the same attribute
  3. Verify no duplicate label created
  4. Verify label count remains 1 for that relation
- **Expected Result:** Idempotent — no duplicate relation label; existing label preserved
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-008 — Generated label displays readable format "AWB • JNE123456789"
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-019
- **Pre-condition:** Relation label applied to a conversation via shared attribute
- **Steps:**
  1. Apply relation label via "Beri Tag Relasi Otomatis"
  2. Locate the label chip in conversation detail
  3. Verify format is "{Attribute Key} • {Attribute Value}" (e.g. "AWB • JNE123456789")
  4. Verify label is human-readable (no raw IDs or encoded values)
- **Expected Result:** Label displays in readable format: "AWB • JNE123456789"
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-009 — Relation labels stored separately from manual tag registry
- **Type:** Positive | **Priority:** P0 | **Source:** FR-016, FR-022, US-007
- **Pre-condition:** Relation label applied to at least one conversation
- **Steps:**
  1. Navigate to Settings → Tag Management (or equivalent tag admin page)
  2. Search for the relation label value (e.g. "JNE123456789")
  3. Verify the relation label does NOT appear as an editable manual tag
  4. Verify relation labels are only visible in the conversation detail context, not in the global tag registry
- **Expected Result:** Relation labels isolated from manual tag registry; not editable in Tag Management
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-010 — Relation label chip has distinct visual style from manual tag chip
- **Type:** Positive | **Priority:** P0 | **Source:** FR-022
- **Pre-condition:** Conversation has both a manual tag and a relation label
- **Steps:**
  1. Open conversation with both a manual tag and a relation label
  2. Locate both chips in the detail/tag area
  3. Verify visual distinction (different color, icon, border style, or prefix)
  4. Verify relation label chip has identifiable "system" styling
- **Expected Result:** Relation label chip visually distinct from manual tag chip
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-011 — Clicking relation filter shortcut narrows results to that relation value
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-023
- **Pre-condition:** Relation label chip visible in search results or conversation detail
- **Steps:**
  1. Locate a relation label chip (e.g. "AWB • JNE123456789")
  2. Click on the chip to activate relation filter
  3. Verify current result list narrows to only records with that relation value
  4. Verify filter indicator is visible (e.g. "Filter: AWB • JNE123456789")
- **Expected Result:** Relation filter narrows view to matching records; filter indicator shown
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-012 — No matching records under relation filter shows clear empty state
- **Type:** State | **Priority:** P1 | **Source:** US-006
- **Pre-condition:** Relation filter activated for a value that has no other matching records
- **Steps:**
  1. Activate relation filter for a relation value
  2. Verify if no other records match, an empty state message is shown
  3. Verify empty state is clear and non-error (e.g. "Tidak ada data terkait")
- **Expected Result:** Clear empty state when no records match relation filter
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-013 — Bulk action with zero selected records: action button disabled
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Search results visible but no checkboxes selected
- **Steps:**
  1. Open search popup and get results
  2. Verify bulk action bar is NOT visible or action buttons are disabled
  3. Select one record — verify buttons become enabled
  4. Deselect — verify buttons disabled again
- **Expected Result:** Bulk action buttons disabled when zero records selected; enabled on selection
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-014 — Partial bulk apply: successful mutations kept, partial outcome shown
- **Type:** Negative | **Priority:** P0 | **Source:** EH-005, FR-013–FR-014
- **Pre-condition:** Selection includes records where some will fail (e.g. permission denied on one)
- **Steps:**
  1. Select ≥3 results including one inaccessible record
  2. Click "Beri Tag Relasi Otomatis"
  3. Verify partial success message: "Sebagian label berhasil diterapkan."
  4. Verify successful records have the label applied
  5. Verify failed record is NOT mutated
- **Expected Result:** Successful mutations kept; partial outcome message shown; failed records untouched
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-015 — Inaccessible records in selection are skipped/blocked with audit
- **Type:** Permission | **Priority:** P0 | **Source:** FR-013–FR-014, EH-001
- **Pre-condition:** Agent selects records including some outside their RBAC scope
- **Steps:**
  1. Select results including an out-of-scope record
  2. Execute bulk action
  3. Verify inaccessible record is skipped (not mutated silently)
  4. Verify audit log records the skip with reason
- **Expected Result:** Inaccessible records blocked, not mutated; audit trail records skip
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-016 — Changing search keyword clears previous selection state
- **Type:** Edge | **Priority:** P0 | **Source:** FR-009, EC-005
- **Pre-condition:** Agent has selected records in search popup
- **Steps:**
  1. Open search popup, search for "AWB-1234", select ≥1 results
  2. Change search keyword to "ORD-5555"
  3. Verify previous checkbox selections are cleared
  4. Verify bulk action bar disappears (no selection = no bar)
- **Expected Result:** New search clears previous selection state; fresh results with no pre-selection
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-017 — Existing Auto Tag rules NOT changed by this feature
- **Type:** Regression | **Priority:** P0 | **Source:** FR-026, US-007
- **Pre-condition:** Workspace has existing Auto Tag rules configured
- **Steps:**
  1. Record current Auto Tag rules (list, conditions, actions)
  2. Perform multiple shared-attribute searches and apply relation labels
  3. Re-check Auto Tag rules — verify no rules added, modified, or deleted
  4. Verify relation label operations do not trigger Auto Tag rule execution
- **Expected Result:** Auto Tag rules unchanged; no mutation from relation label feature
- **Actual Result:** *(QA fills)*

---

### SC-SHAREATTR-018 — Long display values (50+ chars) truncated safely in chip
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** A shared attribute value is 50+ characters long
- **Steps:**
  1. Apply relation label with a long attribute value (e.g. 60-char tracking number)
  2. Verify chip text is truncated (e.g. "AWB • ABCDEF1234567890..." with ellipsis)
  3. Hover over chip — verify full value accessible via tooltip
  4. Verify chip does not break layout (no overflow)
- **Expected Result:** Long values truncated with ellipsis in chip; full value on hover; no layout break
- **Actual Result:** *(QA fills)*

---

# 3. SC-SHOPEE: Omnichannel Inbox — Shopee Channel Add-On

> **Status:** UNKNOWN — verify against FE/BE
> **PRD:** `PRD/Conversationv2/PRD - Omnichannel Inbox - Shopee Channel Add-On.md`
> **Surface:** Settings → Add-On → Shopee + Inbox chat list + Conversation Room

---

### SC-SHOPEE-001 — Admin activates Shopee add-on and completes connect flow
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001–FR-004
- **Pre-condition:** Admin logged in; Shopee add-on available but not yet activated
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Click "Aktifkan" or equivalent activation button
  3. Complete Shopee OAuth/authorization flow (enter valid Shopee seller credentials)
  4. Verify redirect back to SatuInbox with success confirmation
  5. Verify account channel "Shopee" created in correct tenant scope
- **Expected Result:** Shopee add-on activated; account channel created under correct tenant
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-002 — Invalid credentials: no account channel created, safe failure reason
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-002
- **Pre-condition:** Admin on Shopee connect flow
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee → Connect
  2. Enter invalid Shopee credentials or deny authorization
  3. Verify no account channel is created
  4. Verify safe failure reason displayed (e.g. "Kredensial tidak valid" or Shopee error message)
  5. Verify Settings page does not show Shopee as connected
- **Expected Result:** Failed connection; no account channel created; clear failure message shown
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-003 — Settings page shows connected Shopee with "terhubung" status
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-009
- **Pre-condition:** Shopee successfully connected
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Verify connected Shopee account channel listed
  3. Verify status shows "terhubung" (connected)
  4. Verify account/shop name displayed
- **Expected Result:** Shopee account channel visible with "terhubung" status and shop name
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-004 — Valid inbound Shopee webhook creates/updates conversation in inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-015, FR-022–FR-024
- **Pre-condition:** Shopee connected; buyer sends message from Shopee chat
- **Steps:**
  1. Send a test message from Shopee buyer account to connected seller
  2. Wait for webhook processing (≤30s)
  3. Navigate to Inbox (`/id/conversation/your-inbox`)
  4. Verify new conversation appears in chat list
  5. Verify `[data-cy="chat-list-1-channel-icon"]` shows Shopee icon
  6. Open conversation — verify message content matches Shopee message
- **Expected Result:** Inbound Shopee message creates conversation in inbox; channel icon shows Shopee
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-005 — Same buyer continuation on same thread appended to existing conversation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-024
- **Pre-condition:** Existing Shopee conversation from a buyer
- **Steps:**
  1. Send a second message from the same Shopee buyer on the same thread
  2. Wait for webhook processing
  3. Navigate to the existing Shopee conversation
  4. Verify new message appended (not a new conversation created)
  5. Verify conversation count in inbox unchanged (no duplicate row)
- **Expected Result:** Continuation message appended to existing conversation; no duplicate
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-006 — Duplicate webhook retry: no duplicate conversation or message (idempotent)
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-056–FR-057, EC-001
- **Pre-condition:** Shopee connected; webhook can be replayed
- **Steps:**
  1. Record current conversation count and message count for a Shopee conversation
  2. Replay/duplicate the same webhook payload (same event/message ID)
  3. Verify no new conversation created
  4. Verify no duplicate message in timeline
  5. Verify message count unchanged
- **Expected Result:** Idempotent — duplicate webhook ignored; no duplicate data created
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-007 — Invalid/unverifiable webhook payload: rejected, security log recorded
- **Type:** Negative | **Priority:** P0 | **Source:** FR-012–FR-014, EH-003
- **Pre-condition:** Ability to send malformed webhook requests
- **Steps:**
  1. Send webhook with invalid signature (tampered payload)
  2. Verify request rejected (HTTP 400 or 401)
  3. Verify no conversation or message mutation
  4. Send webhook with missing required fields
  5. Verify rejected with appropriate error
  6. Check security/audit log for recorded event
- **Expected Result:** Invalid webhooks rejected; no data mutation; security event logged
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-008 — Agent sends outbound text reply to Shopee
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-032–FR-035
- **Pre-condition:** Agent has open Shopee conversation with send permission
- **Steps:**
  1. Open Shopee conversation in Conversation Room
  2. Verify composer is enabled (`Input-Area-Container` visible, not `Input-Area-Disabled`)
  3. Type message in `[data-cy="Message-Text-Input"]`
  4. Click `[data-cy="Send-Button"]`
  5. Verify message appears in timeline as sent
  6. Verify message delivered to Shopee (check Shopee buyer side or provider confirmation)
- **Expected Result:** Outbound text reply sent to Shopee; stored in timeline with sent status
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-009 — Outbound send fails with provider failure: message marked failed
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-009, FR-035
- **Pre-condition:** Shopee provider returns failure (e.g. rate limit or API error)
- **Steps:**
  1. Simulate Shopee provider failure (mock API error)
  2. Send message from composer
  3. Verify message marked as "failed" in timeline (red indicator or error icon)
  4. Verify agent sees error: "Pesan gagal dikirim ke Shopee"
  5. Verify retry option available if applicable
- **Expected Result:** Failed message clearly marked; agent sees "Pesan gagal dikirim ke Shopee"
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-010 — Agent without send permission: composer disabled/hidden
- **Type:** Permission | **Priority:** P0 | **Source:** US-003, FR-050–FR-051, EH-011
- **Pre-condition:** Agent without Shopee send permission
- **Steps:**
  1. Login as agent without Shopee send permission
  2. Open a Shopee conversation
  3. Verify `[data-cy="Input-Area-Disabled"]` is visible OR composer is hidden
  4. Verify no `Send-Button` accessible
  5. Verify server-side enforcement (attempting API call directly returns 403)
- **Expected Result:** Composer disabled or hidden for agents without send permission; server-side enforced
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-011 — Account channel disconnected at outbound time: composer blocked
- **Type:** Negative | **Priority:** P0 | **Source:** EH-007, FR-036
- **Pre-condition:** Shopee account channel was disconnected after conversation opened
- **Steps:**
  1. Open an existing Shopee conversation
  2. Disconnect Shopee account channel from Settings (or simulate disconnection)
  3. Attempt to send a message
  4. Verify composer blocked with message: "Akun Shopee tidak terhubung"
  5. Verify message NOT sent to provider
- **Expected Result:** Composer blocked; "Akun Shopee tidak terhubung" message shown; no outbound attempted
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-012 — Shopee conversations show "Shopee" channel label in inbox list
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-042
- **Pre-condition:** Shopee conversations exist in inbox
- **Steps:**
  1. Navigate to Inbox (`/id/conversation/your-inbox`)
  2. Locate a Shopee conversation in chat list
  3. Verify `[data-cy="chat-list-N-channel-icon"]` shows Shopee icon/channel label
  4. Verify label distinguishes Shopee from WhatsApp, Live Chat, etc.
- **Expected Result:** Shopee conversations display "Shopee" channel label/icon in inbox list
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-013 — Channel filter includes Shopee; selecting it shows only Shopee conversations
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-043–FR-044
- **Pre-condition:** Inbox has conversations from multiple channels including Shopee
- **Steps:**
  1. Navigate to Inbox
  2. Click channel filter `[data-cy="chatList-filter-status"]` or channel filter
  3. Verify "Shopee" is listed as a filter option
  4. Select "Shopee"
  5. Verify only Shopee conversations displayed
  6. Verify conversation count matches expected Shopee count
- **Expected Result:** Shopee available in channel filter; selecting it filters to Shopee-only conversations
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-014 — Shopee conversations included in platform-level analytics
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-054
- **Pre-condition:** Shopee conversations exist with resolved/closed status
- **Steps:**
  1. Navigate to Analytics → Percakapan
  2. Verify "Shopee" appears in channel distribution donut chart
  3. Verify Shopee conversation count is included in KPI totals
  4. Apply channel filter for "Shopee" — verify analytics reflect Shopee-only data
- **Expected Result:** Shopee conversations included in all platform-level analytics and KPIs
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-015 — Authorization expiry/revoke: account marked disconnected, outbound blocked, audit logged
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-011, EH-002
- **Pre-condition:** Shopee account connected; authorization can be revoked
- **Steps:**
  1. Revoke Shopee authorization (via Shopee Seller Center or simulate token expiry)
  2. Navigate to Settings → Add-On → Shopee
  3. Verify account channel marked as "disconnected" or "kedaluwarsa"
  4. Open a Shopee conversation — verify composer blocked
  5. Check audit log for event "shopee_account_invalidated" with actor, tenant, timestamp
- **Expected Result:** Account marked disconnected; outbound blocked; "shopee_account_invalidated" audit event recorded
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-016 — Reconnect action succeeds: account returns to "connected", outbound restored
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-010
- **Pre-condition:** Shopee account previously disconnected or expired
- **Steps:**
  1. Navigate to Settings → Add-On → Shopee
  2. Click "Hubungkan kembali" or reconnect action
  3. Complete Shopee authorization flow
  4. Verify account channel returns to "terhubung" status
  5. Open a Shopee conversation — verify composer enabled
  6. Send a test message — verify sent successfully
- **Expected Result:** Reconnect restores "terhubung" status; outbound messaging restored
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-017 — Buyer identity resolved via channel-scoped external identity
- **Type:** Positive | **Priority:** P0 | **Source:** FR-018–FR-021, EH-005
- **Pre-condition:** Shopee buyer sends message; buyer has Shopee username
- **Steps:**
  1. Receive inbound Shopee message from a buyer
  2. Open the conversation in inbox
  3. Verify buyer identity shown is the Shopee-scoped external identity (not display name derived from message text)
  4. Verify same buyer sending from different thread still resolves to same contact
- **Expected Result:** Buyer identity resolved via channel-scoped external identity; consistent across threads
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-018 — Inbound for closed thread: follows canonical reopen/create policy
- **Type:** Edge | **Priority:** P0 | **Source:** EC-004, FR-026
- **Pre-condition:** Shopee conversation previously closed/resolved
- **Steps:**
  1. Close/resolve an existing Shopee conversation
  2. Buyer sends new message on the same Shopee thread
  3. Verify system follows canonical reopen/create policy (same as other channels)
  4. Verify no Shopee-specific status taxonomy introduced
- **Expected Result:** Canonical reopen/create behavior applied; no Shopee-specific status handling
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-019 — Unsupported non-text inbound: does not break text pipeline; logged
- **Type:** Edge | **Priority:** P0 | **Source:** FR-029–FR-031, EH-012, EC-009
- **Pre-condition:** Shopee sends a non-text message type (image, sticker, etc. — unsupported in Phase 1)
- **Steps:**
  1. Trigger non-text inbound from Shopee (e.g. image or sticker)
  2. Verify text pipeline continues to work (next text message still processed)
  3. Verify unsupported message logged for observability (not silently dropped)
  4. Verify no crash or error in conversation timeline
- **Expected Result:** Non-text messages do not break text pipeline; logged for observability; no crash
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-020 — Double-click outbound send: idempotency guard prevents double-send
- **Type:** Edge | **Priority:** P0 | **Source:** EC-006
- **Pre-condition:** Agent on Shopee conversation with message ready
- **Steps:**
  1. Type a message in composer
  2. Double-click (or rapidly click twice) the `[data-cy="Send-Button"]`
  3. Verify only ONE message sent to Shopee provider
  4. Verify only ONE message bubble appears in timeline
  5. Verify no duplicate message on Shopee buyer side
- **Expected Result:** Idempotency guard prevents double-send; exactly one message sent
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-021 — Status callbacks arrive out of order: reconciled deterministically
- **Type:** Edge | **Priority:** P0 | **Source:** FR-041, EC-005
- **Pre-condition:** Ability to simulate out-of-order status callbacks from Shopee
- **Steps:**
  1. Send a message to Shopee
  2. Simulate status callback "delivered" arriving before "sent" (out of order)
  3. Verify final message status is "delivered" (or the correct terminal state)
  4. Verify no terminal state regression (status never goes backward from delivered to sent)
- **Expected Result:** Out-of-order callbacks reconciled deterministically; no terminal state regression
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-022 — Tenant connects multiple Shopee shops: each becomes separate account channel
- **Type:** Positive | **Priority:** P1 | **Source:** FR-008, EC-002
- **Pre-condition:** Tenant has access to multiple Shopee seller accounts
- **Steps:**
  1. Connect first Shopee shop — verify account channel "Shopee - Shop A" created
  2. Connect second Shopee shop — verify account channel "Shopee - Shop B" created
  3. Verify both listed in Settings → Add-On → Shopee
  4. Send message to each shop's buyer — verify routed to correct account channel
  5. Verify Inbox shows conversations from both shops with correct account-channel identifier
- **Expected Result:** Multiple Shopee shops each become separate account channels within same tenant
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-023 — Connect/disconnect/inbound/outbound/failure events all have audit trail
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-052–FR-053
- **Pre-condition:** Shopee integration active; audit logging enabled
- **Steps:**
  1. Connect Shopee account — verify audit event with actor, tenant, account channel, timestamp
  2. Receive inbound message — verify audit event
  3. Send outbound reply — verify audit event
  4. Disconnect account — verify audit event
  5. Simulate failure (e.g. send with disconnected account) — verify audit event
  6. Verify all events include actor, tenant, account channel, and timestamp
- **Expected Result:** All lifecycle events audited with actor, tenant, account channel, timestamp
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-024 — Shopee uses existing Platform → Channel → AccountChannel model
- **Type:** Contract | **Priority:** P0 | **Source:** US-007, FR-003, FR-048
- **Pre-condition:** Shopee add-on activated
- **Steps:**
  1. Inspect API response for account channels (GET account-channels or equivalent)
  2. Verify Shopee follows existing Platform → Channel → AccountChannel hierarchy
  3. Verify no new entity model introduced (no "ShopeeShop" or custom model)
  4. Verify Shopee account channel has same fields as other channels (id, platform, channelType, status, tenantId)
- **Expected Result:** Shopee uses existing model; no new entity types; consistent with other channels
- **Actual Result:** *(QA fills)*

---

### SC-SHOPEE-025 — Existing channels continue working without regression during Shopee pilot
- **Type:** Regression | **Priority:** P0 | **Source:** FR-056–FR-057 (cross-channel)
- **Pre-condition:** Shopee add-on active; other channels (WhatsApp API, Instagram, Live Chat, Email) also active
- **Steps:**
  1. Send and receive messages on WhatsApp API channel — verify works normally
  2. Send and receive messages on Instagram channel — verify works normally
  3. Send and receive messages on Live Chat — verify works normally
  4. Send and receive messages on Email — verify works normally
  5. Verify channel filters still work for all non-Shopee channels
  6. Verify analytics include all channels without data loss
- **Expected Result:** Zero regression on existing channels during Shopee pilot rollout
- **Actual Result:** *(QA fills)*


---

## Part C: SC-TRANSCRIPT + SC-EMAILREPLY + SC-WIDGETEMAIL — 68 scenarios

# Conversation Scenario Catalog — Part C2: Transcript Email & Widget Email (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:**
> 1. `PRD/Conversationv2/PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation.md`
> 2. `PRD/Transcript email/PRD Inbox Conversation - reply via email.md`
> 3. `PRD/Transcript email/PRD Widget - email transcript.md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv` (SIX-Convo-001..725)

---

## 1. SC-TRANSCRIPT — Live Chat Transcript Reply via Email and Auto Linked Conversation

> **PRD Source:** `PRD/Conversationv2/PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation.md`
> **Surface:** Transcript email (sent to customer) + inbound Email conversation creation + grouped room with Primary/Child tabs
> **Status:** DEVELOPED | **Scenarios:** 24

---

### SC-TRANSCRIPT-001 — Live Chat resolved → transcript email sent to customer from workspace default email account
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-006–FR-007
- **Pre-condition:** Live Chat conversation exists with valid customer email; workspace default email account connected and active; transcript sending enabled
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open an ongoing Live Chat conversation `[data-cy="chat-list-1"]`
  3. Resolve the conversation via `[data-cy="chatRoom-closeConversationButton"]`
  4. Verify transcript email send status in audit/event log
  5. Check customer inbox — email received from workspace default email account
  6. Verify Reply-To header matches workspace default email account
- **Expected Result:** Transcript email sent from workspace default email; Reply-To points to same account; email contains transcript summary and body
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-002 — Live Chat reaches inactivity timeout → transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Live Chat conversation active with valid customer email; no activity for configured inactivity period
- **Steps:**
  1. Open a Live Chat conversation in the inbox
  2. Wait for inactivity timeout (no messages from either side)
  3. Verify system auto-resolves/closes conversation by timeout
  4. Check audit event — transcript send triggered with trigger type `inactivity_timeout`
  5. Verify customer receives transcript email
- **Expected Result:** Transcript email sent after inactivity timeout; audit records trigger type as `inactivity_timeout`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-003 — Both resolved and timeout triggers for same conversation → only one transcript email sent (no duplicate)
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-003, EC-001
- **Pre-condition:** Live Chat conversation where resolved fires first, timeout fires later (or vice versa)
- **Steps:**
  1. Resolve a Live Chat conversation — verify transcript email sent
  2. Trigger inactivity timeout condition for same conversation
  3. Check email delivery logs for duplicate sends
  4. Verify transcript status remains `sent` (not duplicated)
- **Expected Result:** Exactly one transcript email sent; second trigger ignored; no duplicate email delivered
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-004 — Customer email missing → transcript not sent, skipped audit event recorded
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-003
- **Pre-condition:** Live Chat conversation with no customer email address collected
- **Steps:**
  1. Open a Live Chat conversation where customer email field is empty
  2. Resolve the conversation
  3. Verify transcript status = `skipped` in audit log
  4. Verify no email sent to any recipient
- **Expected Result:** Transcript not sent; audit records skipped reason: "Email pelanggan tidak tersedia"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-005 — Workspace default email account not connected → sending blocked, "Email default workspace belum terhubung"
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-001
- **Pre-condition:** Workspace has no default email account connected
- **Steps:**
  1. Ensure workspace default email account is disconnected
  2. Resolve a Live Chat conversation with valid customer email
  3. Verify transcript send blocked
  4. Check audit log for blocked reason
- **Expected Result:** Sending blocked; audit shows "Email default workspace belum terhubung"; transcript status `skipped`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-006 — Workspace default email account inactive → sending blocked, "Email default workspace tidak aktif"
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-002
- **Pre-condition:** Workspace default email account exists but is marked inactive
- **Steps:**
  1. Deactivate workspace default email account in settings
  2. Resolve a Live Chat conversation
  3. Verify transcript send blocked
  4. Check audit stores inactive sender reason
- **Expected Result:** Sending blocked; audit shows "Email default workspace tidak aktif"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-007 — Transcript send failure → retry up to 3 times, then status "failed" with audit
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-005, EH-004
- **Pre-condition:** Email send system returns retryable error
- **Steps:**
  1. Simulate email send failure (e.g. SMTP timeout)
  2. Resolve a Live Chat conversation
  3. Monitor retry attempts — verify up to 3 retries
  4. After final failure, verify transcript status = `failed`
  5. Check audit log records failure reason
- **Expected Result:** 3 retry attempts; final status `failed`; audit records "Gagal mengirim transkrip email"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-008 — Customer replies to transcript email → new open Email conversation created
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Customer received transcript email; workspace email inbound processing active
- **Steps:**
  1. Open transcript email in customer inbox
  2. Reply to the email with any message
  3. In agent inbox, verify new Email conversation appears
  4. Verify Email conversation channel = Email
  5. Verify conversation status = open
- **Expected Result:** New open Email conversation created; channel set to Email; appears in agent inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-009 — Reply includes valid transcript reference → Email conversation auto-linked to original Live Chat
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-028
- **Pre-condition:** Customer replies to transcript email (reply preserves transcript reference in email headers)
- **Steps:**
  1. Customer replies to transcript email
  2. Verify new Email conversation created
  3. Open conversation detail — check `[data-cy="Chat-Detail-Section-linked-tickets"]` or linked conversations section
  4. Verify Email conversation is linked to original Live Chat
  5. Check audit log for auto-link success event
- **Expected Result:** Email conversation auto-linked to original Live Chat; audit records link with source Live Chat ID and target Email conversation ID
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-010 — Reply without valid transcript reference but sender matches customer email → no auto-link, suggested link only
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-019–FR-021, EH-006
- **Pre-condition:** Customer strips transcript reference from email reply; sender email matches original customer email
- **Steps:**
  1. Customer replies to transcript email with transcript reference stripped
  2. Verify Email conversation created (inbound email is valid)
  3. Verify NO auto-link to original Live Chat
  4. Open Email conversation detail — verify suggested link appears if safe candidate exists
- **Expected Result:** Email conversation created unlinked; suggested Live Chat link shown; no auto-link without valid reference
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-011 — Multiple replies in same email thread → messages appended to same Email conversation, no duplicate conversation
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-023, EC-002
- **Pre-condition:** Customer has already replied once to transcript email; Email conversation exists
- **Steps:**
  1. Customer sends second reply in same email thread
  2. Verify message appended to existing Email conversation (not new conversation created)
  3. Check inbox list — still shows one Email conversation for this thread
  4. Verify Email tab unread count increments
- **Expected Result:** Second reply appended to existing Email conversation; no duplicate conversation; unread count increases
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-012 — Email conversation linked → Email becomes Primary, Live Chat demoted to Child
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** Email conversation auto-linked to Live Chat conversation
- **Steps:**
  1. After auto-link succeeds, open the grouped conversation row
  2. Verify Email tab appears first (Primary position)
  3. Verify Live Chat tab is in Child position
  4. Verify grouped room opens on Email tab by default
- **Expected Result:** Email is Primary conversation (first tab); Live Chat demoted to Child (second tab)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-013 — Primary promotion fails → group kept linked, "Gagal menjadikan email sebagai percakapan utama" shown
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-008
- **Pre-condition:** Auto-link succeeds but Primary promotion fails (simulated)
- **Steps:**
  1. Simulate Primary promotion failure after auto-link
  2. Verify group remains linked (Email and Live Chat still connected)
  3. Verify error message shown: "Gagal menjadikan email sebagai percakapan utama"
  4. Verify current Primary unchanged
- **Expected Result:** Group stays linked; error message displayed; current Primary preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-014 — Original Live Chat room shows system message: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email."
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-038–FR-039
- **Pre-condition:** Customer replied to transcript email; Email conversation created and linked
- **Steps:**
  1. Open original Live Chat conversation in agent inbox
  2. Verify system message appears in message timeline: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email."
  3. Verify message includes link to Email conversation
- **Expected Result:** System message displayed in Live Chat room with correct copy and link to Email conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-015 — System message link clicked → grouped room opens with Email tab active
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-040
- **Pre-condition:** System message visible in Live Chat room
- **Steps:**
  1. Click the link in the system message
  2. Verify grouped room opens
  3. Verify Email tab is active by default
  4. Verify Email conversation messages visible
- **Expected Result:** Grouped room opens with Email tab active; Email conversation content visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-016 — Grouped room: Email tab first as Primary, Live Chat tab as Child with history visible
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-030–FR-031
- **Pre-condition:** Email and Live Chat conversations linked in grouped room
- **Steps:**
  1. Open grouped conversation row from chat list
  2. Verify Email tab is first (leftmost) and active
  3. Switch to Live Chat tab
  4. Verify original transcript and chat history visible based on retention rules
- **Expected Result:** Email tab first as Primary; Live Chat tab as Child with full history preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-017 — Email tab unread count included in parent row unread count
- **Type:** Positive | **Priority:** P0 | **Source:** US-007
- **Pre-condition:** Email conversation has unread messages; grouped row in chat list
- **Steps:**
  1. Customer sends reply to transcript email
  2. Check grouped row in chat list `[data-cy="chat-list-N-unread-count"]`
  3. Verify unread count includes Email tab unread messages
- **Expected Result:** Parent row unread badge reflects Email unread count
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-018 — Live Chat conversation stays resolved after Email reply; NOT reopened by Email reply
- **Type:** Positive | **Priority:** P0 | **Source:** FR-041–FR-042
- **Pre-condition:** Live Chat resolved; customer replies to transcript email
- **Steps:**
  1. Verify Live Chat status before email reply = resolved
  2. Customer sends email reply
  3. Verify Live Chat status remains `resolved` (not reopened)
  4. Verify Email conversation is created as `open` separately
- **Expected Result:** Live Chat stays resolved; Email conversation is open; no state change on Live Chat from Email reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-019 — Email conversation SLA started based on Email channel SLA rules; Live Chat SLA NOT restarted
- **Type:** Positive | **Priority:** P0 | **Source:** FR-043–FR-045
- **Pre-condition:** Email conversation created from transcript reply; Email channel SLA configured
- **Steps:**
  1. Verify Email conversation SLA cycle starts when Email conversation is created
  2. Check Live Chat conversation SLA — verify NOT restarted
  3. Open detail panel — check SLA metrics `[data-cy="Chat-Detail-Sla-frt"]`, `[data-cy="Chat-Detail-Sla-ttc"]`
- **Expected Result:** Email SLA started per Email channel rules; Live Chat SLA unchanged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-020 — User without Email send permission → composer disabled, "Anda tidak memiliki akses untuk membalas email"
- **Type:** Permission | **Priority:** P0 | **Source:** FR-050, EH-011
- **Pre-condition:** Agent role lacks Email send permission
- **Steps:**
  1. Log in as agent without Email send permission
  2. Open grouped room with Email conversation
  3. Verify Email tab composer is disabled or hidden
  4. Verify message: "Anda tidak memiliki akses untuk membalas email"
- **Expected Result:** Composer disabled; permission denial message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-021 — User without linking permission → link actions hidden/disabled
- **Type:** Permission | **Priority:** P0 | **Source:** FR-049
- **Pre-condition:** Agent role lacks linking permission
- **Steps:**
  1. Log in as agent without linking permission
  2. Open Email conversation detail
  3. Verify manual link actions are hidden or disabled
- **Expected Result:** Link actions not visible or disabled for users without linking permission
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-022 — Transcript send, reply, link, Primary change, system message events all audited
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-051–FR-056
- **Pre-condition:** Full transcript reply lifecycle completed
- **Steps:**
  1. Complete full flow: resolve Live Chat → send transcript → customer reply → auto-link → Primary change → system message
  2. Check audit log for each event:
     - Transcript send (trigger, sender, recipient, status)
     - Inbound reply (source transcript, target Email conversation ID)
     - Auto-link (Live Chat ID, Email conversation ID, Primary change)
     - System message creation
  3. Verify all events have actor, timestamp, source, target
- **Expected Result:** All 5 lifecycle events audited with complete metadata
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-023 — Workspace default email account changed after transcript sent → old replies still matched via transcript reference
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, EC-005
- **Pre-condition:** Transcript sent with workspace email A; workspace default changed to email B
- **Steps:**
  1. Send transcript email using workspace email A
  2. Change workspace default email to email B
  3. Customer replies to original transcript email
  4. Verify reply received and matched via transcript reference (regardless of sender change)
- **Expected Result:** Old reply matched correctly; Email conversation created and linked despite default email change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-024 — Customer forwards transcript to another person → that person's reply creates Email conversation, auto-link only if transcript reference valid
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Customer received transcript email; forwards to third party
- **Steps:**
  1. Customer forwards transcript email to another email address
  2. Third party replies to the forwarded email
  3. Verify Email conversation created from third party's email
  4. Verify auto-link to original Live Chat only if transcript reference is preserved and valid
  5. If reference stripped — verify no auto-link
- **Expected Result:** Email conversation created from forwarding party; auto-link depends on transcript reference validity
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## 2. SC-EMAILREPLY — Inbox Conversation - reply via email

> **Note:** This PRD overlaps with Live Chat Transcript Reply via Email. Scenarios enriched from both sources.

> **PRD Source:** `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (near-exact duplicate of PRD #4 — same feature, same date, Design Lead differs: Sabrina vs Resky)
> **Surface:** Transcript email + Email conversation + grouped room
> **Status:** ADJACENT | **Scenarios:** 24

---

### SC-EMAILREPLY-001 — Live Chat resolved → transcript email sent from workspace default email
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-006–FR-007
- **Pre-condition:** Live Chat conversation with valid customer email; workspace default email connected and active
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open and resolve a Live Chat conversation via `[data-cy="chatRoom-closeConversationButton"]`
  3. Verify transcript email sent from workspace default email account
  4. Check From and Reply-To headers match workspace default email
- **Expected Result:** Transcript email sent; From and Reply-To = workspace default email account
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-002 — Live Chat inactivity timeout → transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Live Chat conversation with no activity for configured timeout period
- **Steps:**
  1. Leave Live Chat conversation idle beyond inactivity timeout
  2. Verify system closes/resolves conversation by timeout
  3. Verify transcript email sent to customer
  4. Check audit trigger type = `inactivity_timeout`
- **Expected Result:** Transcript email sent after timeout; audit records `inactivity_timeout` trigger
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-003 — Resolved + timeout both fire → only one transcript email sent
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-003, EC-001
- **Pre-condition:** Conversation where both resolved and timeout triggers could fire
- **Steps:**
  1. Resolve Live Chat — verify transcript sent
  2. Trigger timeout condition for same conversation
  3. Verify no duplicate email sent
  4. Check transcript status remains `sent` (single send)
- **Expected Result:** Only one transcript email sent; duplicate trigger ignored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-004 — Customer email missing → no send, skipped audit
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-003
- **Pre-condition:** Live Chat conversation without customer email
- **Steps:**
  1. Resolve Live Chat where customer email is empty
  2. Verify no transcript email sent
  3. Check audit log — status = `skipped`, reason = "Email pelanggan tidak tersedia"
- **Expected Result:** No email sent; audit records skipped reason
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-005 — Workspace default email not connected → blocked, "Email default workspace belum terhubung"
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-001
- **Pre-condition:** No workspace default email account connected
- **Steps:**
  1. Disconnect workspace default email account
  2. Resolve a Live Chat conversation
  3. Verify send blocked
  4. Check audit/message: "Email default workspace belum terhubung"
- **Expected Result:** Send blocked; transcript status `skipped`; correct error message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-006 — Workspace default email inactive → blocked, audit reason stored
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-002
- **Pre-condition:** Workspace default email account inactive
- **Steps:**
  1. Set workspace default email to inactive
  2. Resolve Live Chat conversation
  3. Verify send blocked
  4. Check audit stores inactive reason
- **Expected Result:** Send blocked; audit records "Email default workspace tidak aktif"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-007 — Transcript send failure → retry up to 3x, then "failed"
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-005, EH-004
- **Pre-condition:** Email delivery system returns retryable error
- **Steps:**
  1. Simulate email send failure
  2. Resolve Live Chat conversation
  3. Monitor retries — verify up to 3 attempts
  4. After final failure — transcript status = `failed`
  5. Check audit: "Gagal mengirim transkrip email"
- **Expected Result:** 3 retries; final status `failed`; audit records failure
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-008 — Customer replies → new Email conversation created
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Customer received transcript email
- **Steps:**
  1. Customer replies to transcript email
  2. Verify new Email conversation appears in agent inbox
  3. Verify channel = Email; status = open
- **Expected Result:** New open Email conversation created in agent inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-009 — Valid transcript reference → auto-linked to original Live Chat
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-028
- **Pre-condition:** Customer reply preserves transcript reference
- **Steps:**
  1. Customer replies to transcript email (reference preserved)
  2. Verify Email conversation auto-linked to original Live Chat
  3. Check linked conversations section in detail panel
  4. Verify audit records auto-link success
- **Expected Result:** Auto-link succeeds; Email linked to original Live Chat
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-010 — No valid transcript reference → no auto-link, suggestion only if safe candidate
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-019–FR-021, EH-006
- **Pre-condition:** Customer reply has no transcript reference
- **Steps:**
  1. Customer replies with transcript reference stripped
  2. Verify Email conversation created but NOT auto-linked
  3. Open Email conversation detail — verify suggested link if safe candidate exists
- **Expected Result:** No auto-link; suggested Live Chat link shown only if safe candidate exists
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-011 — Multiple replies in same thread → appended to existing Email conversation
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-023, EC-002
- **Pre-condition:** Email conversation already exists from first reply
- **Steps:**
  1. Customer sends second reply in same email thread
  2. Verify message appended to existing Email conversation
  3. Verify no duplicate conversation created
- **Expected Result:** Messages appended; single Email conversation per thread; unread count increments
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-012 — Linking succeeds → Email becomes Primary, Live Chat becomes Child
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** Auto-link completed
- **Steps:**
  1. Open grouped conversation row
  2. Verify Email tab first (Primary)
  3. Verify Live Chat tab second (Child)
- **Expected Result:** Email = Primary (first tab); Live Chat = Child (second tab)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-013 — Primary promotion fails → group stays linked, error message shown
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-008
- **Pre-condition:** Auto-link succeeds; Primary promotion fails
- **Steps:**
  1. Simulate Primary promotion failure
  2. Verify group remains linked
  3. Verify error: "Gagal menjadikan email sebagai percakapan utama"
- **Expected Result:** Group stays linked; error displayed; current Primary preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-014 — Live Chat shows system message directing agent to Email
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-038–FR-039
- **Pre-condition:** Email reply received and linked
- **Steps:**
  1. Open original Live Chat room
  2. Verify system message: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email."
  3. Verify message includes clickable link
- **Expected Result:** System message visible in Live Chat with correct copy and link
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-015 — Grouped room opens with Email tab active by default
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-030–FR-036
- **Pre-condition:** Grouped room exists with Email and Live Chat tabs
- **Steps:**
  1. Open grouped conversation from inbox
  2. Verify Email tab is active by default
  3. Verify Email conversation messages loaded
- **Expected Result:** Grouped room opens with Email tab active
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-016 — Email unread count reflected in parent row
- **Type:** Positive | **Priority:** P0 | **Source:** US-007
- **Pre-condition:** Email conversation has unread messages
- **Steps:**
  1. Customer sends email reply
  2. Check parent row unread badge `[data-cy="chat-list-N-unread-count"]`
  3. Verify includes Email unread count
- **Expected Result:** Parent row unread badge reflects Email unread count
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-017 — Live Chat remains resolved after Email reply (not reopened)
- **Type:** Positive | **Priority:** P0 | **Source:** FR-041–FR-042
- **Pre-condition:** Live Chat resolved; email reply received
- **Steps:**
  1. Verify Live Chat = resolved before email reply
  2. Customer sends email reply
  3. Verify Live Chat status = resolved (unchanged)
- **Expected Result:** Live Chat stays resolved after Email reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-018 — Email SLA starts per Email channel rules; Live Chat SLA not restarted
- **Type:** Positive | **Priority:** P0 | **Source:** FR-043–FR-045
- **Pre-condition:** Email SLA configured; Email conversation created
- **Steps:**
  1. Verify Email SLA cycle started
  2. Verify Live Chat SLA NOT restarted
  3. Check SLA metrics in detail panel
- **Expected Result:** Email SLA active per Email rules; Live Chat SLA unchanged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-019 — No Email send permission → composer disabled
- **Type:** Permission | **Priority:** P0 | **Source:** FR-050, EH-011
- **Pre-condition:** Agent without Email send permission
- **Steps:**
  1. Log in as agent without Email send permission
  2. Open grouped room with Email tab
  3. Verify composer disabled
  4. Verify message: "Anda tidak memiliki akses untuk membalas email"
- **Expected Result:** Composer disabled; permission message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-020 — No linking permission → link actions hidden
- **Type:** Permission | **Priority:** P0 | **Source:** FR-049
- **Pre-condition:** Agent without linking permission
- **Steps:**
  1. Log in as agent without linking permission
  2. Open Email conversation detail
  3. Verify link actions hidden or disabled
- **Expected Result:** Link actions not available to agents without linking permission
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-021 — All transcript-reply lifecycle events audited
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-051–FR-056
- **Pre-condition:** Full lifecycle completed (send → reply → link → Primary change → system message)
- **Steps:**
  1. Complete full transcript reply flow end-to-end
  2. Check audit log for: transcript send, inbound reply, auto-link, Primary change, system message
  3. Verify each event has actor, timestamp, source, target
- **Expected Result:** All lifecycle events audited with complete metadata
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-022 — Default email account changed after send → old replies still matched
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, EC-005
- **Pre-condition:** Transcript sent from email A; default changed to email B
- **Steps:**
  1. Send transcript from workspace email A
  2. Change default to email B
  3. Customer replies to original transcript
  4. Verify reply matched via transcript reference
- **Expected Result:** Reply matched regardless of default email change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-023 — Auto-link failure → Email conversation stays open, unlinked; retry up to 3x
- **Type:** Negative | **Priority:** P0 | **Source:** US-009, EH-007
- **Pre-condition:** Auto-link fails (e.g. reference invalid, system error)
- **Steps:**
  1. Simulate auto-link failure
  2. Verify Email conversation remains open and unlinked
  3. Verify system retries linking up to 3 times
  4. After final failure — verify "Gagal menautkan percakapan otomatis" shown
  5. Verify manual linking available if agent has permission
- **Expected Result:** Email stays open unlinked; 3 retries; manual linking available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-024 — Duplicate inbound email delivery → deduplicated by email identity and thread reference
- **Type:** Edge | **Priority:** P0 | **Source:** EC-014
- **Pre-condition:** Email delivery system sends duplicate of same inbound email
- **Steps:**
  1. Receive duplicate inbound email (same message ID/thread reference)
  2. Verify only one message appended to Email conversation
  3. Verify no duplicate Email conversation created
- **Expected Result:** Duplicate deduplicated; single message in conversation; no duplicate conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## 3. SC-WIDGETEMAIL — Widget - email transcript

> **PRD Source:** `PRD/Transcript email/PRD Widget - email transcript.md`
> **Surface:** Widget settings → Appearance tab toggle + branded transcript email + public transcript page + continue-chat link
> **Status:** ADJACENT | **Scenarios:** 20

---

### SC-WIDGETEMAIL-001 — Admin toggles "Kirim transkrip ke email pelanggan" ON in widget Appearance tab; setting saved per tenant
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001–FR-002
- **Pre-condition:** Admin logged in with channel manage permission; widget settings accessible
- **Steps:**
  1. Navigate to `settings/channels/widget?tab=appearance`
  2. Find "Kirim transkrip ke email pelanggan" toggle
  3. Toggle ON
  4. Click "Simpan & Aktifkan"
  5. Refresh page — verify toggle state persisted = ON
  6. Verify setting saved at tenant level (not per widget account)
- **Expected Result:** Toggle saved as ON per tenant; persists across page refreshes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-002 — Toggle OFF → no transcript email sent when Live Chat ends
- **Type:** Positive | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** Transcript email toggle is OFF
- **Steps:**
  1. Ensure toggle "Kirim transkrip ke email pelanggan" is OFF in widget settings
  2. Conduct a Live Chat conversation
  3. Resolve or wait for timeout
  4. Verify no transcript email sent to customer
- **Expected Result:** No transcript email sent when toggle is OFF
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-003 — Admin without channel manage permission → "Akses ditolak", toggle not editable
- **Type:** Permission | **Priority:** P0 | **Source:** US-001, FR-003
- **Pre-condition:** Admin role without channel manage permission
- **Steps:**
  1. Log in as user without channel manage permission
  2. Navigate to widget settings Appearance tab
  3. Verify "Akses ditolak" message shown
  4. Verify toggle is not editable
- **Expected Result:** Access denied; toggle not editable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-004 — Inactivity timeout (20 min) reached with valid customer email → exactly 1 transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-010, FR-012, FR-015
- **Pre-condition:** Transcript enabled; customer email valid; no activity for 20 minutes
- **Steps:**
  1. Conduct Live Chat conversation with customer email collected
  2. Stop all activity for 20 minutes (inactivity timeout)
  3. Verify system triggers transcript email send
  4. Verify exactly 1 email sent (idempotency: `email_transcript_sent_at` flag set)
  5. Verify email contains transcript in chronological order with `[HH:mm] Sender: Message` format
- **Expected Result:** Exactly 1 transcript email sent after 20 min inactivity; transcript formatted correctly
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-005 — Conversation resolved without timeout → transcript sent as fallback
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Transcript enabled; conversation resolved manually before timeout
- **Steps:**
  1. Conduct Live Chat with customer email
  2. Resolve conversation manually (before 20 min timeout)
  3. Verify transcript email sent as resolved fallback
  4. Verify send scheduled at `max(now, last_message + 20min)` per FR-013
- **Expected Result:** Transcript sent after resolved with appropriate delay; exactly 1 email
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-006 — Customer email missing/invalid → no send, skipped reason stored
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, EH-002, FR-009
- **Pre-condition:** No valid customer email collected during conversation
- **Steps:**
  1. Conduct Live Chat without collecting customer email
  2. Resolve or wait for timeout
  3. Verify no transcript email sent
  4. Check send status = `skipped` with reason stored
- **Expected Result:** No email sent; skipped reason recorded
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-007 — Email header shows widget logo when configured; falls back to tenant name if logo missing
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-021
- **Pre-condition:** Transcript email sent; widget logo configured (or not)
- **Steps:**
  1. Configure widget header logo in settings
  2. Trigger transcript email
  3. Verify email header shows widget logo
  4. Remove widget logo; trigger new transcript
  5. Verify email header falls back to tenant name text
- **Expected Result:** Logo shown when configured; tenant name as text fallback when logo missing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-008 — Email uses widget theme color for header accent and CTA buttons
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-022
- **Pre-condition:** Widget theme color configured
- **Steps:**
  1. Set widget theme color (e.g. blue #2563EB)
  2. Trigger transcript email
  3. Verify email header accent color matches widget theme color
  4. Verify CTA buttons use same theme color
- **Expected Result:** Email header accent and CTA buttons use widget theme color
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-009 — Transcript exceeds 120,000 chars or 300 messages → truncated to last 100 messages, "Transkrip dipotong" notice shown, secure link still included
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-024–FR-026
- **Pre-condition:** Long conversation exceeding truncation limits
- **Steps:**
  1. Conduct very long Live Chat (>300 messages or >120K chars)
  2. Trigger transcript email
  3. Verify email contains only last 100 messages
  4. Verify "Transkrip dipotong" notice shown in email
  5. Verify "Lihat transkrip lengkap" secure link still present
- **Expected Result:** Truncated to 100 messages; notice shown; secure link included
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-010 — Secure transcript link expires after 30 days → "Link transkrip tidak valid atau sudah kedaluwarsa"
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-028, EH-004
- **Pre-condition:** Transcript email sent with secure link; 30+ days pass
- **Steps:**
  1. Wait 30 days after transcript email sent (or manipulate token TTL)
  2. Click secure transcript link
  3. Verify page shows "Link transkrip tidak valid atau sudah kedaluwarsa"
- **Expected Result:** Expired token denies access; expiry message displayed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-011 — Public transcript page shows tenant brand, conversation metadata, full transcript; no internal inbox UI exposed
- **Type:** Positive | **Priority:** P0 | **Source:** FR-029–FR-031
- **Pre-condition:** Valid secure transcript link available
- **Steps:**
  1. Open public transcript link
  2. Verify page shows tenant brand header
  3. Verify conversation metadata (ID, timestamps, agent name)
  4. Verify full transcript in chronological order
  5. Verify NO internal inbox UI elements visible (no sidebar, no composer, no admin controls)
- **Expected Result:** Public page shows brand, metadata, full transcript only; no internal UI exposed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-012 — "Lanjutkan Chat" button enabled → clicks open continue_chat_url with resume token; widget auto-opens
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** "Lanjutkan Chat" toggle ON; `continue_chat_url` configured
- **Steps:**
  1. Open transcript email
  2. Click "Lanjutkan Chat" button
  3. Verify opens configured URL with `si_open_livechat=1` and `si_guest_resume={token}` parameters
  4. Verify widget auto-opens after page load
- **Expected Result:** Continue chat opens correct URL; widget auto-opens; resume token included
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-013 — Resume token valid → same conversation thread shown (history visible)
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-036
- **Pre-condition:** Valid resume token; customer opens continue chat link
- **Steps:**
  1. Click "Lanjutkan Chat" with valid resume token
  2. Widget opens and loads conversation thread
  3. Verify conversation history visible (past messages)
  4. Verify new message can be sent
- **Expected Result:** Same conversation thread loaded; history visible; new messages possible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-014 — Resume token expired/invalid → widget shows clear message, opens in "new chat" state
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, FR-039
- **Pre-condition:** Resume token expired or invalid
- **Steps:**
  1. Click "Lanjutkan Chat" with expired/invalid token
  2. Widget opens
  3. Verify message: "Untuk melanjutkan chat sebelumnya, silakan login atau isi email yang sama."
  4. Verify widget in "new chat" state (no prior history)
- **Expected Result:** Clear message shown; widget in new chat state
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-015 — Session resume (session-livechat.email valid) takes priority over guest resume
- **Type:** Edge | **Priority:** P0 | **Source:** FR-041, FR-036
- **Pre-condition:** Customer has active session with `session-livechat.email` AND guest resume token in URL
- **Steps:**
  1. Open continue chat link with both session identity and guest token
  2. Verify widget uses session resume path (not guest resume)
  3. Verify loads latest conversation for session email (FR-037 deterministic ordering)
- **Expected Result:** Session resume takes priority; guest resume ignored when session available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-016 — Conversation reopens after transcript already sent → no resend (MVP: one email per conversation)
- **Type:** Edge | **Priority:** P0 | **Source:** EC-003, FR-015
- **Pre-condition:** Transcript already sent for conversation; conversation reopens
- **Steps:**
  1. Verify transcript sent for resolved conversation
  2. Customer sends new message — conversation reopens
  3. Resolve conversation again
  4. Verify no second transcript email sent
  5. Check `email_transcript_sent_at` flag unchanged
- **Expected Result:** No duplicate transcript; one email per conversation enforced
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-017 — New message arrives after resolved but before scheduled send → cancel send, reschedule per inactivity timeout
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002, FR-014
- **Pre-condition:** Conversation resolved; transcript send scheduled; new message arrives before send
- **Steps:**
  1. Resolve conversation — send scheduled at `last_message + 20min`
  2. Customer sends new message before scheduled send
  3. Verify scheduled send cancelled
  4. Verify new send scheduled per inactivity timeout rules (20 min from new message)
- **Expected Result:** Send cancelled on new message; rescheduled per inactivity timeout
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-018 — Continue chat URL not set but button toggle enabled → button hidden, transcript + public link still sent
- **Type:** Edge | **Priority:** P1 | **Source:** EC-008, FR-005
- **Pre-condition:** "Lanjutkan Chat" toggle ON but `continue_chat_url` empty
- **Steps:**
  1. Enable "Tampilkan tombol Lanjutkan Chat" toggle
  2. Leave "Continue chat URL" field empty
  3. Trigger transcript email
  4. Verify email sent without "Lanjutkan Chat" button
  5. Verify transcript body and "Lihat transkrip lengkap" link still present
- **Expected Result:** Continue chat button hidden; transcript + public link still included
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-019 — Send failure → retry up to 3x with exponential backoff, then "failed"
- **Type:** Negative | **Priority:** P0 | **Source:** FR-038, EH-003
- **Pre-condition:** Email send returns retryable error
- **Steps:**
  1. Simulate email send failure
  2. Trigger transcript send (resolve or timeout)
  3. Monitor retries — verify up to 3 attempts with exponential backoff
  4. After final failure — verify status = `failed`
- **Expected Result:** 3 retries with exponential backoff; final status `failed`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-020 — Whitelabel enabled → no SatuInbox branding in email footer
- **Type:** Positive | **Priority:** P1 | **Source:** FR-023
- **Pre-condition:** Widget whitelabel enabled in settings
- **Steps:**
  1. Enable whitelabel in widget settings
  2. Trigger transcript email
  3. Verify email footer has NO SatuInbox branding
  4. Disable whitelabel; verify SatuInbox branding restored
- **Expected Result:** No SatuInbox branding when whitelabel ON; branding restored when OFF
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

> **Total Enriched Scenarios: 68** (SC-TRANSCRIPT: 24 · SC-EMAILREPLY: 24 · SC-WIDGETEMAIL: 20)


---

## Part C: SC-SLA + SC-RLT + SC-ANALYTICS + SC-OPENAPI + SC-PUBLICID + SC-MACRO — 103 scenarios

# Conversation Scenario Catalog — Part C: Adjacent Surfaces (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:** SLA, RLT, Analytics, Open API, Public ID, Macro
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Surfaces Enriched:** SC-SLA (24), SC-RLT (11), SC-ANALYTICS (18), SC-OPENAPI (20), SC-PUBLICID (14), SC-MACRO (16)

---

## 7. PRD Conversation SLA

### SC-SLA-001 — Admin opens "SLA untuk Percakapan" → sees shared policy + per-channel cards
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-004
- **Pre-condition:** Admin logged in; at least one conversation channel connected
- **Steps:**
  1. Navigate to Settings → SLA → "SLA untuk Percakapan"
  2. Verify page title displays "SLA untuk Percakapan"
  3. Verify shared "Kebijakan" policy section is visible
  4. Verify one SLA card per supported channel (Widget, WhatsApp API, WA Web Group, WhatsApp Web, Instagram, Facebook Messenger, Telegram, Email)
  5. Verify each card shows FRT and TTC metric rows (TTC disabled for WA Web Group)
- **Expected Result:** Page loads within 800ms; shared policy section + 8 channel cards displayed; each card shows channel icon, name, and metric rows
- **Actual Result:** *(QA fills)*

---

### SC-SLA-002 — Admin edits FRT/TTC and saves → only future SLA cycles use new values
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-040, FR-042
- **Pre-condition:** Admin on SLA settings page; active conversation with running SLA cycle exists
- **Steps:**
  1. Note current SLA values for WhatsApp API channel
  2. Change FRT from 15 Menit to 20 Menit
  3. Click "Simpan perubahan"
  4. Confirm in modal "Terapkan perubahan SLA?"
  5. Verify toast "SLA berhasil diperbarui"
  6. Open the active conversation — verify its SLA cycle still uses old value (15 Menit)
  7. Create a new conversation on WhatsApp API — verify SLA cycle uses new value (20 Menit)
- **Expected Result:** Active cycle unchanged (snapshot rule); new cycle uses 20 Menit FRT
- **Actual Result:** *(QA fills)*

---

### SC-SLA-003 — Invalid value entered → inline validation blocks save
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-001–EH-002
- **Pre-condition:** Admin on SLA settings page
- **Steps:**
  1. Clear FRT duration value (empty)
  2. Click "Simpan perubahan"
  3. Verify inline error "Durasi wajib diisi"
  4. Enter FRT value = 0
  5. Click save
  6. Verify inline error "Nilai durasi harus 1 sampai 999"
  7. Enter FRT value = 1000
  8. Click save — verify same validation error
- **Expected Result:** Save blocked for empty, 0, and >999 values; appropriate Bahasa Indonesia inline error shown
- **Actual Result:** *(QA fills)*

---

### SC-SLA-004 — Reminder active with value ≥ SLA duration → save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-028, EH-004
- **Pre-condition:** Admin on SLA settings page; FRT set to 30 Menit
- **Steps:**
  1. Open FRT reminder popover for a channel
  2. Set reminder to "Aktif"
  3. Enter reminder value = 30 Menit (equal to SLA duration)
  4. Close popover and click "Simpan perubahan"
  5. Verify inline error "Pengingat harus lebih kecil dari durasi SLA"
  6. Change reminder to 31 Menit (greater than SLA) — verify same error
  7. Change reminder to 29 Menit — verify save succeeds
- **Expected Result:** Save blocked when normalized reminder ≥ normalized SLA duration; succeeds when reminder < SLA
- **Actual Result:** *(QA fills)*

---

### SC-SLA-005 — Reminder triggers when remaining time ≤ configured offset
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-044–FR-045
- **Pre-condition:** Channel SLA FRT set to 60 Menit; FRT reminder set to 10 Menit; conversation assigned to agent
- **Steps:**
  1. Create new conversation on the configured channel
  2. Assign to agent (starts SLA cycle)
  3. Wait until 50 minutes elapsed (remaining = 10 min ≤ 10 min offset)
  4. Check assignee notification — verify in-app notification received with customer name, channel, metric "FRT"
  5. Check supervisor notification — verify same
  6. Verify only ONE reminder sent per metric per cycle (wait past 10 min, no duplicate)
- **Expected Result:** One reminder notification at ≤10 min remaining; no duplicates; contains customer name, channel, metric
- **Actual Result:** *(QA fills)*

---

### SC-SLA-006 — TTC pause toggle enabled + conversation enters Waiting on Customer → TTC pauses
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-011–FR-012
- **Pre-condition:** Shared policy "Jeda SLA TTC saat menunggu balasan pelanggan" enabled; TTC configured for channel
- **Steps:**
  1. Create conversation on a TTC-supported channel
  2. Assign agent (starts SLA cycle with TTC)
  3. Send agent reply (starts TTC timer)
  4. Change conversation status to "Waiting on Customer"
  5. Verify TTC timer pauses (remaining time stops counting down)
  6. Customer replies → status moves from Waiting on Customer
  7. Verify TTC timer resumes from where it paused
- **Expected Result:** TTC pauses on Waiting on Customer entry; resumes on exit; elapsed time during pause not counted
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-007 — AUX counting disabled + agent enters AUX mode → SLA pauses
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-013–FR-014
- **Pre-condition:** Shared policy "Hitung SLA saat agen dalam mode AUX" disabled; active SLA cycle running
- **Steps:**
  1. Ensure policy toggle is disabled in Settings
  2. Create conversation, assign agent (SLA starts)
  3. Set assigned agent to AUX mode
  4. Verify running SLA metrics pause
  5. Set agent back to Active mode
  6. Verify SLA metrics resume from paused time
- **Expected Result:** SLA pauses when agent enters AUX; resumes on agent return to Active; AUX time excluded from SLA calculation
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-008 — Policy toggle change saved → only future cycles use new policy
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-040–FR-041
- **Pre-condition:** Admin on SLA settings page; policy toggle currently disabled
- **Steps:**
  1. Note current policy state (e.g. AUX counting disabled)
  2. Enable "Hitung SLA saat agen dalam mode AUX" toggle
  3. Click "Simpan perubahan" and confirm
  4. Verify toast "SLA berhasil diperbarui"
  5. Verify existing active SLA cycle behavior unchanged (still pauses on AUX)
  6. Create new conversation and verify new cycle continues counting during AUX
- **Expected Result:** Active cycle retains old policy snapshot; new cycle uses updated policy
- **Actual Result:** *(QA fills)*

---

### SC-SLA-009 — Legacy global SLA workspace → migration creates per-channel SLA records
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-059–FR-062
- **Pre-condition:** Workspace with legacy global conversation SLA (FRT=30m, TTC=8h); migration not yet run
- **Steps:**
  1. Trigger SLA migration for workspace
  2. Open "SLA untuk Percakapan" settings page
  3. Verify per-channel cards created for all supported channels
  4. Verify FRT=30m on all channels (including WA Web Group)
  5. Verify TTC=8h on TTC-supported channels (Widget, WA API, WhatsApp Web, IG, FB Messenger, Telegram, Email)
  6. Verify TTC disabled for WA Web Group
  7. Verify legacy reminder configs copied to matching metrics
- **Expected Result:** Per-channel records created with equivalent legacy values; WA Web Group has FRT only; policies copied
- **Actual Result:** *(QA fills)*

---

### SC-SLA-010 — WA Web Group during migration → FRT migrated, TTC stays disabled
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-062, EC-009
- **Pre-condition:** Legacy workspace with global TTC enabled; WA Web Group channel exists
- **Steps:**
  1. Run migration
  2. Open WA Web Group card in SLA settings
  3. Verify FRT row shows migrated value
  4. Verify TTC row is disabled with helper text "Belum didukung untuk kanal ini"
  5. Verify TTC config not created in database for WA Web Group
- **Expected Result:** FRT migrated; TTC not created for WA Web Group; disabled row with Bahasa Indonesia helper text
- **Actual Result:** *(QA fills)*

---

### SC-SLA-011 — Migration is idempotent → rerun does not duplicate config
- **Type:** Edge | **Priority:** P0 | **Source:** FR-065
- **Pre-condition:** Migration already completed once for workspace
- **Steps:**
  1. Record current per-channel SLA config values and record count
  2. Trigger migration again for the same workspace
  3. Verify no duplicate records created
  4. Verify values unchanged from first migration
  5. Check migration audit log — verify second run logged as idempotent skip
- **Expected Result:** No duplicate configs; values preserved; audit log records idempotent rerun
- **Actual Result:** *(QA fills)*

---

### SC-SLA-012 — New workspace with no prior SLA → standard defaults seeded
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-067–FR-068
- **Pre-condition:** New workspace created; no prior SLA settings
- **Steps:**
  1. Open "SLA untuk Percakapan" for new workspace
  2. Verify Widget: FRT 5 Menit, TTC 30 Menit, reminder FRT 3 Menit, reminder TTC 10 Menit
  3. Verify WhatsApp API: FRT 15 Menit, TTC 8 Jam, reminder FRT 10 Menit, reminder TTC 1 Jam
  4. Verify Email: FRT 60 Menit, TTC 24 Jam, reminder FRT 15 Menit, reminder TTC 4 Jam
  5. Verify WA Web Group: FRT 30 Menit, TTC disabled, reminder FRT 10 Menit
- **Expected Result:** All channels seeded with standard defaults per appendix matrix; WA Web Group TTC disabled
- **Actual Result:** *(QA fills)*

---

### SC-SLA-013 — WA Web Group TTC metric disabled with helper text
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-009–FR-010
- **Pre-condition:** Admin on SLA settings page
- **Steps:**
  1. Open WA Web Group channel card
  2. Verify TTC row is disabled (greyed out / read-only)
  3. Verify helper text "Belum didukung untuk kanal ini" shown
  4. Attempt to edit TTC value — verify field is non-editable
- **Expected Result:** TTC disabled for WA Web Group; helper text in Bahasa Indonesia; edit blocked
- **Actual Result:** *(QA fills)*

---

### SC-SLA-014 — Conversation starts → SLA cycle begins when first assigned to agent
- **Type:** Positive | **Priority:** P0 | **Source:** FR-035
- **Pre-condition:** SLA configured for channel; conversation exists unassigned
- **Steps:**
  1. Create new inbound conversation (unassigned)
  2. Verify no SLA cycle active (no SLA badge in chat list)
  3. Assign conversation to agent
  4. Verify SLA cycle starts (SLA badge appears `[data-cy="chat-list-N-sla-badge"]`)
  5. Verify FRT timer begins counting
- **Expected Result:** SLA cycle starts at first assignment; FRT timer visible in detail panel
- **Actual Result:** *(QA fills)*

---

### SC-SLA-015 — FRT completed when first customer-visible agent message sent; internal notes ignored
- **Type:** Positive | **Priority:** P0 | **Source:** FR-036–FR-037
- **Pre-condition:** Conversation assigned; SLA running; FRT not yet completed
- **Steps:**
  1. Add an internal note to the conversation
  2. Verify FRT timer still running (internal note doesn't count)
  3. Send a customer-visible agent reply
  4. Verify FRT timer stops and final duration stored
  5. Check detail panel `[data-cy="Chat-Detail-Sla-frt"]` — verify shows completed time
- **Expected Result:** Internal notes ignored for FRT; first customer-visible message completes FRT
- **Actual Result:** *(QA fills)*

---

### SC-SLA-016 — TTC completed when conversation resolved/closed; TTC not created for WA Web Group
- **Type:** Positive | **Priority:** P0 | **Source:** FR-038–FR-039
- **Pre-condition:** Conversation on TTC-supported channel; SLA cycle active
- **Steps:**
  1. Resolve the conversation
  2. Verify TTC timer stops and final duration stored
  3. Check detail panel `[data-cy="Chat-Detail-Sla-ttc"]` — verify shows completed time
  4. Create conversation on WA Web Group; resolve it
  5. Verify no TTC metric shown or stored
- **Expected Result:** TTC completes on resolve/close for supported channels; no TTC for WA Web Group
- **Actual Result:** *(QA fills)*

---

### SC-SLA-017 — Supervisor receives reminder/breach notification with details + deep link
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-052
- **Pre-condition:** Supervisor assigned to team; conversation in team scope with active SLA
- **Steps:**
  1. Wait for SLA reminder/breach trigger
  2. Open in-app notification panel
  3. Verify notification shows customer name, channel name, metric name (FRT or TTC)
  4. Click notification
  5. Verify deep link opens conversation detail page
- **Expected Result:** Notification contains customer name, channel, metric; clicking opens conversation detail
- **Actual Result:** *(QA fills)*

---

### SC-SLA-018 — Assignee receives notification; if unassigned → only supervisors notified
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-053–FR-054
- **Pre-condition:** SLA reminder configured; conversation with agent assigned
- **Steps:**
  1. Trigger SLA reminder for assigned conversation
  2. Verify assignee receives in-app notification
  3. Verify supervisor also receives notification
  4. Unassign the conversation before next trigger
  5. Trigger breach
  6. Verify NO assignee notification sent
  7. Verify supervisor still receives breach notification
- **Expected Result:** Assignee gets notification when assigned; supervisors always get it; unassigned → supervisors only
- **Actual Result:** *(QA fills)*

---

### SC-SLA-019 — Assignee changes before trigger → only current assignee receives notification
- **Type:** Edge | **Priority:** P0 | **Source:** EC-004
- **Pre-condition:** Conversation assigned to Agent A; SLA reminder approaching
- **Steps:**
  1. Reassign conversation from Agent A to Agent B before reminder triggers
  2. Wait for reminder trigger
  3. Verify Agent B receives notification
  4. Verify Agent A does NOT receive notification
- **Expected Result:** Only current assignee (Agent B) at trigger time receives notification; previous assignee excluded
- **Actual Result:** *(QA fills)*

---

### SC-SLA-020 — Dashboard shows "SLA Hampir Terlewat" and "SLA Terlewat" summary cards
- **Type:** Positive | **Priority:** P1 | **Source:** US-009, FR-055–FR-056
- **Pre-condition:** Supervisor logged in; conversations with at-risk and breached SLA exist
- **Steps:**
  1. Open supervisor dashboard
  2. Verify "SLA Hampir Terlewat" card shows count of at-risk conversations
  3. Verify "SLA Terlewat" card shows count of breached conversations
  4. Click "SLA Hampir Terlewat" card
  5. Verify filtered list opens sorted by smallest remaining minutes first
  6. Click "SLA Terlewat" card
  7. Verify filtered list opens sorted by largest overdue minutes first
- **Expected Result:** Both summary cards visible with correct counts; clicking opens sorted filtered list
- **Actual Result:** *(QA fills)*

---

### SC-SLA-021 — Non-Admin blocked with "Akses ditolak" when saving SLA settings
- **Type:** Permission | **Priority:** P0 | **Source:** FR-001, FR-003, EH-006
- **Pre-condition:** Logged in as Supervisor (non-Admin) role
- **Steps:**
  1. Navigate to Settings → SLA → "SLA untuk Percakapan"
  2. Verify page loads in read-only mode (Supervisor can view per FR-002)
  3. Verify edit fields are disabled or hidden
  4. Attempt to modify FRT value and save
  5. Verify toast "Akses ditolak" shown
- **Expected Result:** Supervisor can view but not edit; save attempt blocked with "Akses ditolak" toast
- **Actual Result:** *(QA fills)*

---

### SC-SLA-022 — Reminder paused while metric paused → re-evaluated on resume
- **Type:** Edge | **Priority:** P0 | **Source:** FR-046–FR-048, EC-001
- **Pre-condition:** SLA cycle active; reminder configured; TTC pause policy enabled
- **Steps:**
  1. Create conversation with TTC reminder at 10 min before deadline
  2. Move conversation to Waiting on Customer at 12 min remaining (before reminder threshold)
  3. Verify reminder NOT sent while paused
  4. Customer replies → conversation exits Waiting on Customer at 8 min remaining
  5. Verify reminder IS sent on resume (8 min ≤ 10 min offset, still eligible)
- **Expected Result:** Reminder suppressed during pause; sent after resume if still ≤ offset and not yet sent
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-023 — Conversation resumes and TTC remaining already negative → breached immediately
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002
- **Pre-condition:** TTC pause policy enabled; TTC deadline passes while conversation is paused
- **Steps:**
  1. Create conversation with 30-min TTC
  2. Move to Waiting on Customer at 10 min remaining
  3. Wait 20+ minutes (TTC deadline now passed)
  4. Customer replies → conversation resumes
  5. Verify TTC immediately marked as breached
  6. Verify one breach notification sent
  7. Verify conversation appears in "SLA Terlewat" list
- **Expected Result:** TTC breached immediately on resume; breach notification sent; appears in breached list
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-024 — Admin saves new values while active cycles exist → active cycles unchanged (snapshot rule)
- **Type:** Edge | **Priority:** P0 | **Source:** EC-007, FR-040–FR-042
- **Pre-condition:** Multiple active SLA cycles running; Admin on SLA settings
- **Steps:**
  1. Note current SLA values for 2 active conversations
  2. Change WhatsApp API FRT from 15 to 30 Menit
  3. Save and confirm
  4. Open active conversation 1 — verify SLA still shows 15 Menit deadline
  5. Open active conversation 2 — verify same
  6. Create new conversation — verify uses 30 Menit
- **Expected Result:** All active cycles preserve original snapshot; only new cycles use updated values
- **Actual Result:** *(QA fills)*

---

## 8. PRD Conversation RLT

### SC-RLT-001 — First customer message received, no agent assigned → Waktu Antre timer runs from T1
- **Type:** Positive | **Priority:** P0 | **Source:** AC-01
- **Pre-condition:** New inbound conversation; no agent assigned
- **Steps:**
  1. Customer sends first message to create a new conversation
  2. Open Conversation Detail
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` shows running timer
  4. Verify timer increments in real-time
- **Expected Result:** Wait Time (Waktu Antre) timer starts at T1 (first customer message); visible and running
- **Actual Result:** *(QA fills)*

---

### SC-RLT-002 — Agent assigned → Waktu Antre stops, final duration stored
- **Type:** Positive | **Priority:** P0 | **Source:** AC-02
- **Pre-condition:** Conversation with running Wait Time timer; no agent assigned
- **Steps:**
  1. Note current Wait Time timer value
  2. Assign agent to conversation
  3. Verify Wait Time timer stops and shows final duration
  4. Verify stored duration = T2 - T1 (assignment time - first message time)
- **Expected Result:** Wait Time stops at assignment; final duration persisted; timer shows static value
- **Actual Result:** *(QA fills)*

---

### SC-RLT-003 — Agent assigned but no reply yet → Waktu Kerja Staf (RLT) timer runs from T2
- **Type:** Positive | **Priority:** P0 | **Source:** AC-03
- **Pre-condition:** Conversation assigned to agent; agent has not replied
- **Steps:**
  1. Open Conversation Detail
  2. Verify `[data-cy="Chat-Detail-Sla-rlt"]` shows running timer
  3. Verify Wait Time timer stopped
  4. Verify RLT timer increments in real-time
- **Expected Result:** RLT timer starts at T2 (assignment time); running and visible
- **Actual Result:** *(QA fills)*

---

### SC-RLT-004 — First successful customer-facing reply sent → RLT timer stops, final duration stored
- **Type:** Positive | **Priority:** P0 | **Source:** AC-04
- **Pre-condition:** RLT timer running; agent has not replied yet
- **Steps:**
  1. Agent sends customer-facing reply
  2. Verify RLT timer stops and shows final duration
  3. Verify stored duration = T3 - T2 (first reply - assignment time)
  4. Verify first responder agent recorded
- **Expected Result:** RLT completes on first customer-facing reply; duration and first responder stored
- **Actual Result:** *(QA fills)*

---

### SC-RLT-005 — Internal notes, failed replies, drafts, system messages → do NOT count as T3
- **Type:** Edge | **Priority:** P0 | **Source:** AC-05
- **Pre-condition:** RLT timer running; agent assigned
- **Steps:**
  1. Agent adds internal note to conversation
  2. Verify RLT timer still running (not stopped)
  3. Agent creates draft message (not sent)
  4. Verify RLT timer still running
  5. System message appears (e.g. assignment change)
  6. Verify RLT timer still running
  7. Agent sends actual customer-facing reply
  8. Verify RLT timer stops
- **Expected Result:** Only successful customer-facing reply stops RLT; notes, drafts, failed, system messages ignored
- **Actual Result:** *(QA fills)*

---

### SC-RLT-006 — Reassignment before first reply → primary RLT does NOT reset
- **Type:** Edge | **Priority:** P0 | **Source:** AC-06
- **Pre-condition:** Conversation assigned to Agent A; RLT running from T2
- **Steps:**
  1. Note current RLT timer value and T2 timestamp
  2. Reassign conversation from Agent A to Agent B
  3. Verify RLT timer continues from original T2 (not reset)
  4. Verify timer does not restart from reassignment time
  5. Agent B sends reply → RLT stops using original T2
- **Expected Result:** RLT uses first assignment time; reassignment does not reset timer
- **Actual Result:** *(QA fills)*

---

### SC-RLT-007 — Multi-assignee conversation → first assignment used as T2, first replying agent stored
- **Type:** Edge | **Priority:** P0 | **Source:** AC-07
- **Pre-condition:** Conversation with multiple assignees
- **Steps:**
  1. Assign Agent A to conversation at time T2a
  2. Assign Agent B at time T2b (> T2a)
  3. Agent B sends first reply
  4. Verify RLT uses T2a (first assignment) as start
  5. Verify first responder stored as Agent B (who sent first reply)
- **Expected Result:** RLT start = earliest assignment; first responder = agent who sent first customer-facing reply
- **Actual Result:** *(QA fills)*

---

### SC-RLT-008 — Linked ticket shows inherited RLT and Wait Time metrics
- **Type:** Positive | **Priority:** P0 | **Source:** AC-08
- **Pre-condition:** Conversation with completed RLT and Wait Time; ticket linked to conversation
- **Steps:**
  1. Open linked Ticket Detail
  2. Verify RLT and Wait Time values match those from linked conversation
  3. Verify metrics show as inherited (not independently tracked)
  4. Verify values update if conversation metrics change
- **Expected Result:** Linked ticket inherits RLT and Wait Time from conversation; values match source
- **Actual Result:** *(QA fills)*

---

### SC-RLT-009 — Internal-only ticket (no linked customer conversation) → shows "Tidak berlaku"
- **Type:** Edge | **Priority:** P0 | **Source:** AC-09
- **Pre-condition:** Ticket created internally (not linked to any customer conversation)
- **Steps:**
  1. Open internal-only ticket detail
  2. Verify RLT metric shows "Tidak berlaku"
  3. Verify Wait Time metric shows "Tidak berlaku"
  4. Verify no timer runs for this ticket
- **Expected Result:** "Tidak berlaku" displayed for both RLT and Wait Time on internal-only tickets
- **Actual Result:** *(QA fills)*

---

### SC-RLT-010 — Offline Report Download includes RLT and Wait Time columns
- **Type:** Positive | **Priority:** P0 | **Source:** AC-10
- **Pre-condition:** Conversation and Ticket data with RLT/Wait Time metrics exist
- **Steps:**
  1. Navigate to report download section
  2. Export Conversation report (XLSX)
  3. Verify columns: First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, First Assignee, First Responder, Metric Status, Metric Quality Flags
  4. Export Ticket report (XLSX)
  5. Verify columns: Linked Conversation ID, Response Metric Source, First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, Metric Status, Metric Quality Flags
  6. Verify values match what's shown in detail panel
- **Expected Result:** Both exports include RLT and Wait Time columns with matching values from detail panel
- **Actual Result:** *(QA fills)*

---

### SC-RLT-011 — No alert/reminder/breach/notification/escalation for RLT or Wait Time in Phase 1
- **Type:** Regression | **Priority:** P0 | **Source:** AC-11
- **Pre-condition:** RLT and Wait Time metrics active; no thresholds configured
- **Steps:**
  1. Create conversation with long RLT (e.g. 2 hours without agent reply)
  2. Verify no reminder notification sent for RLT
  3. Verify no breach badge shown for RLT
  4. Create conversation with long Wait Time (e.g. 1 hour unassigned)
  5. Verify no reminder notification sent for Wait Time
  6. Verify no breach badge shown for Wait Time
  7. Verify no escalation triggered
- **Expected Result:** Phase 1 is tracking only; no alerts, reminders, breaches, badges, notifications, or escalations for RLT/Wait Time
- **Actual Result:** *(QA fills)*

---

## 9. PRD Analytics - Conversation

### SC-ANALYTICS-001 — Admin/Supervisor opens Analitik → Percakapan → 8 KPI cards + 4 charts load
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-010–FR-017
- **Pre-condition:** Admin/Supervisor logged in; analytics permission granted
- **Steps:**
  1. Click "Analitik" in left nav
  2. Click "Percakapan"
  3. Verify page title "Percakapan" displayed
  4. Verify 8 KPI cards visible: "Total percakapan", "Percakapan yang ditutup", "Percakapan yang terbuka", "Percakapan yang sudah dibalas", "Total balasan terkirim", "Total tangkapan layar", "Percakapan ditutup dengan tangkapan layar", "Total chat belum ter-assign"
  5. Verify 4 charts visible: by time, by channel, replies by time, tags by category
- **Expected Result:** Page loads within 3s; 8 KPI cards and 4 charts rendered
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-002 — Default date range "30 hari terakhir"; changing range refreshes all
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, US-002, FR-003, FR-007
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Verify date range defaults to "30 hari terakhir"
  2. Note current KPI values
  3. Change date range to "7 hari terakhir"
  4. Verify all KPI cards update (loading skeleton → new values)
  5. Verify all charts update
  6. Verify "Terakhir diperbarui" timestamp changes
- **Expected Result:** Default 30 days; changing range triggers full refresh; all KPI and charts update within 5s
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-003 — No data in selected range → KPI shows 0, charts show empty state
- **Type:** State | **Priority:** P0 | **Source:** US-001, EH-002
- **Pre-condition:** Analytics page loaded; date range with no data available
- **Steps:**
  1. Set date range to a period with no conversations (e.g. far future or pre-launch date)
  2. Verify all KPI card values show 0
  3. Verify charts show empty state message "Belum ada data pada periode ini"
  4. Verify no errors or crashes
- **Expected Result:** KPI = 0; charts show Bahasa Indonesia empty state; page remains functional
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-004 — Team/Agent/Channel filters applied → all KPI and charts reflect scope
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-007
- **Pre-condition:** Analytics page loaded with data from multiple teams, agents, channels
- **Steps:**
  1. Select Team = "Team A"
  2. Verify all KPI cards update to Team A scope
  3. Select Agent = "Agent 1"
  4. Verify KPI and charts update to Agent 1 scope
  5. Select Channel = "WhatsApp"
  6. Verify KPI and charts filtered to WhatsApp + Agent 1 + Team A
  7. Reset to "Semua tim" / "Semua agen" / "Semua kanal"
  8. Verify full data restored
- **Expected Result:** All filters consistently applied; KPI and charts always reflect selected scope
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-005 — Entity metrics use assignee at event time for attribution
- **Type:** Positive | **Priority:** P0 | **Source:** FR-008, EC-003
- **Pre-condition:** Conversation reassigned between agents during period
- **Steps:**
  1. Create conversation assigned to Agent A at time T1
  2. Reassign to Agent B at time T2
  3. Filter by Agent A
  4. Verify entity metrics count events attributed to Agent A (at event time)
  5. Filter by Agent B
  6. Verify entity metrics count events attributed to Agent B
- **Expected Result:** Attribution uses assignee at event time, not current assignee; filter reflects this
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-006 — "Total chat belum ter-assign" visible when "Semua tim" + "Semua agen"
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-017
- **Pre-condition:** Analytics page with default filters (Semua tim, Semua agen)
- **Steps:**
  1. Verify "Total chat belum ter-assign" KPI card is visible
  2. Verify count shows number of open conversations with no assignee at end of period
  3. Verify count matches direct database query
- **Expected Result:** Unassigned KPI visible and accurate when full scope selected
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-007 — "Total chat belum ter-assign" hidden when Agent ≠ "Semua agen"
- **Type:** Edge | **Priority:** P0 | **Source:** FR-019
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Select Agent = "Agent 1" (not "Semua agen")
  2. Verify "Total chat belum ter-assign" KPI card is hidden
  3. Reset Agent to "Semua agen"
  4. Verify KPI card reappears
- **Expected Result:** Unassigned KPI hidden when specific agent selected to avoid misinterpretation
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-008 — "Total chat belum ter-assign" hidden when Team ≠ "Semua tim"
- **Type:** Edge | **Priority:** P0 | **Source:** FR-020
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Select Team = "Team A" (not "Semua tim")
  2. Verify "Total chat belum ter-assign" KPI card is hidden
  3. Reset Team to "Semua tim"
  4. Verify KPI card reappears
- **Expected Result:** Unassigned KPI hidden when specific team selected to avoid misinterpretation
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-009 — "Total percakapan - berdasarkan waktu" bar chart shows daily counts
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-021
- **Pre-condition:** Analytics page loaded with data
- **Steps:**
  1. Locate "Total percakapan - berdasarkan waktu" bar chart
  2. Verify bars represent daily conversation counts for selected period
  3. Hover a bar — verify tooltip shows date and count
  4. Verify total matches "Total percakapan" KPI
- **Expected Result:** Bar chart shows daily volumes; tooltips with date+count; sum matches KPI
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-010 — "Total percakapan - berdasarkan kanal" donut chart shows distribution
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-022
- **Pre-condition:** Analytics page loaded; "Semua kanal" selected; multi-channel data exists
- **Steps:**
  1. Locate "Total percakapan - berdasarkan kanal" donut chart
  2. Verify each channel segment displayed with distinct color
  3. Hover a segment — verify tooltip shows channel name and count
  4. Verify legend displayed with all channels
  5. Verify sum of segments matches "Total percakapan" KPI
- **Expected Result:** Donut chart shows channel distribution; tooltips with channel+count; legend present
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-011 — Channel filter active → channel distribution chart hidden with message
- **Type:** Edge | **Priority:** P0 | **Source:** FR-027, EC-006
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Select Channel = "WhatsApp" (not "Semua kanal")
  2. Verify "Total percakapan - berdasarkan kanal" chart is hidden
  3. Verify informational message "Bagan kanal tidak tersedia saat filter kanal aktif" shown
  4. Reset Channel to "Semua kanal"
  5. Verify chart reappears
- **Expected Result:** Channel distribution chart hidden when channel filter active; informational message shown
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-012 — "Total balasan - berdasarkan waktu" shows daily reply counts
- **Type:** Positive | **Priority:** P1 | **Source:** US-005, FR-023
- **Pre-condition:** Analytics page loaded with reply data
- **Steps:**
  1. Locate "Total balasan - berdasarkan waktu" chart
  2. Verify daily reply counts displayed
  3. Hover a data point — verify tooltip shows date and count
  4. Select specific Agent filter
  5. Verify chart counts only replies by selected agent
- **Expected Result:** Reply chart shows daily counts; agent filter scopes to selected agent's replies only
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-013 — "Total tag - berdasarkan kategori" shows tag counts; empty when no tags
- **Type:** Positive | **Priority:** P1 | **Source:** US-005, FR-024
- **Pre-condition:** Analytics page loaded; tag data exists
- **Steps:**
  1. Locate "Total tag - berdasarkan kategori" horizontal bar chart
  2. Verify tag categories displayed with counts
  3. Hover a bar — verify tooltip shows category and count
  4. Switch to workspace with no tags
  5. Verify empty state message shown in Bahasa Indonesia
- **Expected Result:** Tag chart shows per-category counts; empty state when no tags
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-014 — Charts show tooltip on hover with date/category and numeric value
- **Type:** Positive | **Priority:** P1 | **Source:** FR-025
- **Pre-condition:** Analytics page loaded with data
- **Steps:**
  1. Hover over a bar in "Total percakapan - berdasarkan waktu"
  2. Verify tooltip shows date and count
  3. Hover over a donut segment in channel chart
  4. Verify tooltip shows channel name and count
  5. Hover over a bar in reply chart and tag chart
  6. Verify consistent tooltip format
- **Expected Result:** All charts show tooltip on hover; format: category/date + numeric value
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-015 — Unauthorized user → "Akses ditolak"; page content blocked
- **Type:** Permission | **Priority:** P0 | **Source:** US-006, FR-001–FR-002, EH-001
- **Pre-condition:** Logged in as Agent without analytics permission
- **Steps:**
  1. Navigate directly to analytics page URL
  2. Verify "Akses ditolak" message displayed
  3. Verify no KPI cards, charts, or data visible
  4. Verify no data leakage in page source/network tab
- **Expected Result:** Unauthorized user blocked; "Akses ditolak" shown; no data exposure
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-016 — Analytics service failure → error state with "Coba lagi"
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-004
- **Pre-condition:** Analytics backend returning errors (simulate 500)
- **Steps:**
  1. Load analytics page
  2. Verify error state shown: "Terjadi kesalahan. Coba lagi"
  3. Verify "Coba lagi" button visible
  4. Fix backend issue
  5. Click "Coba lagi"
  6. Verify page loads successfully
- **Expected Result:** Error state with retry button; retry succeeds when backend recovers
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-017 — Filter load failure → filters disabled with "Gagal memuat filter"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Filter API returning errors
- **Steps:**
  1. Load analytics page
  2. Verify filters show disabled state
  3. Verify message "Gagal memuat filter" with "Coba lagi" button
  4. Verify KPI and charts still load with default filter values
  5. Click "Coba lagi" — verify filters load
- **Expected Result:** Filters disabled on failure; retry available; KPI/charts use defaults
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-018 — "Terakhir diperbarui" timestamp shown in Asia/Jakarta time
- **Type:** Positive | **Priority:** P0 | **Source:** FR-028
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Locate "Terakhir diperbarui" timestamp on page header
  2. Verify timestamp format includes date and time
  3. Verify timezone is Asia/Jakarta (WIB, UTC+7)
  4. Change a filter — verify timestamp updates after refresh
- **Expected Result:** Timestamp always displayed in Asia/Jakarta time; updates on filter change
- **Actual Result:** *(QA fills)*

---

## 10. PRD OPEN API - conversation n ticket

### SC-OPENAPI-001 — `GET /v1/inbox?properties[awb]=12345` returns matching results with pagination
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: search
- **Pre-condition:** API key/OAuth2 token valid; inbox items with `awb` property exist
- **Steps:**
  1. Send request:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?properties[awb]=12345&page=1&limit=20" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json"
     ```
  2. Verify HTTP 200 response
  3. Verify response schema: `{ "data": [...], "pagination": { "page": 1, "limit": 20, "total": N } }`
  4. Verify each item in `data` has `properties.awb` matching "12345"
- **Expected Result:** HTTP 200; response contains matching items with pagination metadata
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-002 — Search supports AND/OR filters by status, date range, team, agent
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: search
- **Pre-condition:** Diverse inbox data across statuses, teams, agents
- **Steps:**
  1. Search with AND filter:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?status=ongoing&team=team-a&page=1&limit=20" \
       -H "Authorization: Bearer <token>"
     ```
  2. Verify only `ongoing` items from `team-a` returned
  3. Search with date range:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?date_from=2026-01-01&date_to=2026-01-31&page=1&limit=20" \
       -H "Authorization: Bearer <token>"
     ```
  4. Verify all results within date range
- **Expected Result:** AND filters narrow results correctly; date range filters work
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-003 — `PATCH /inbox/{id}` with valid status transition succeeds with audit log
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: update
- **Pre-condition:** Inbox item exists with status `unassigned`
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "ongoing" }'
     ```
  2. Verify HTTP 200 response
  3. Verify response schema: `{ "id": "conv-12345", "status": "ongoing", ... }`
  4. Verify audit log entry with `source=api`, actor, timestamp
  5. PATCH again to `resolved`:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "resolved" }'
     ```
  6. Verify HTTP 200; status updated to `resolved`
- **Expected Result:** Valid transitions succeed; audit logged with `source=api`; status updates correctly
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-004 — `PATCH /inbox/{id}` with invalid status transition → 400-INV-STATUS
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 400-INV-STATUS
- **Pre-condition:** Inbox item exists with status `resolved`
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "unassigned" }'
     ```
  2. Verify HTTP 400 response
  3. Verify response schema: `{ "error": "Invalid status transition" }`
  4. Verify item status unchanged
- **Expected Result:** HTTP 400; error message "Invalid status transition"; no mutation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-005 — `PATCH /inbox/{id}` with invalid property format → 400-INV-PROP
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 400-INV-PROP
- **Pre-condition:** Inbox item exists
- **Steps:**
  1. Send request with malformed properties:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "properties": { "key_exceeding_64_chars_abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop": "value" } }'
     ```
  2. Verify HTTP 400 response
  3. Verify response schema: `{ "error": "Invalid property format" }`
- **Expected Result:** HTTP 400; error message "Invalid property format"; no mutation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-006 — `PATCH /inbox/{id}` with non-existent ID → 404-NOT-FOUND
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 404-NOT-FOUND
- **Pre-condition:** API token valid
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/nonexistent-id" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "resolved" }'
     ```
  2. Verify HTTP 404 response
  3. Verify response schema: `{ "error": "Inbox item not found" }`
- **Expected Result:** HTTP 404; error message "Inbox item not found"
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-007 — External system (SAPX) auto-resolves ticket via API; audit includes event ID
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: auto-resolve
- **Pre-condition:** Inbox item for SAPX-originated ticket with status `ongoing`
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "resolved", "properties": { "awb": "123456789", "resolved_by": "SAPX" } }'
     ```
  2. Verify HTTP 200 response
  3. Verify item status = `resolved`
  4. Verify audit log includes `actor`, `source=api`, `timestamp`, external event ID
- **Expected Result:** Auto-resolve via API succeeds; audit trail includes external system identifier
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-008 — `PUT /contacts/{id}` with transactions[] accepted; visible in sidebar UI
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: enrich
- **Pre-condition:** Contact exists; API token with write scope
- **Steps:**
  1. Send request:
     ```bash
     curl -X PUT "https://api.satuinbox.com/v1/contacts/cust-1001" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{
         "phone": "+628****7890",
         "transactions": [
           {
             "ref_id": "ORD-9912",
             "status": "delivered",
             "date": "2025-08-29T12:00:00Z",
             "amount": 250000,
             "currency": "IDR",
             "metadata": { "awb": "123456789", "courier": "JNE" }
           }
         ]
       }'
     ```
  2. Verify HTTP 200 response
  3. Open contact sidebar UI in SatuInbox
  4. Verify transaction ORD-9912 appears with amount 250,000 IDR
- **Expected Result:** Transactions accepted via API; visible in contact sidebar UI
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-009 — `PUT /contacts/{id}` with invalid data → 400 error
- **Type:** Contract (validation-error) | **Priority:** P1 | **Source:** User Story: enrich
- **Pre-condition:** Contact exists; API token valid
- **Steps:**
  1. Send request with invalid transaction data:
     ```bash
     curl -X PUT "https://api.satuinbox.com/v1/contacts/cust-1001" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{
         "phone": "not-a-valid-phone",
         "transactions": [
           { "ref_id": "", "status": "", "date": "invalid-date", "amount": -100, "currency": "INVALID" }
         ]
       }'
     ```
  2. Verify HTTP 400 response
  3. Verify error message describes validation failures
- **Expected Result:** HTTP 400 with validation error details; no data stored
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-010 — `POST /inbox/{id}/links` attaches external ticket; visible in Linked Tickets
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: link
- **Pre-condition:** Inbox item exists; API token with write scope
- **Steps:**
  1. Send request:
     ```bash
     curl -X POST "https://api.satuinbox.com/v1/inbox/conv-12345/links" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "external_ticket_id": "SAPX-777", "source": "SAPX", "url": "https://sapx.com/ticket/777" }'
     ```
  2. Verify HTTP 201 response
  3. Open conversation detail in UI
  4. Verify "Linked Tickets" section shows SAPX-777 with link
- **Expected Result:** External ticket linked; visible in Linked Tickets section
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-011 — `POST /inbox/{id}/links` with duplicate link → 409-DUP-LINK
- **Type:** Contract (conflict) | **Priority:** P1 | **Source:** Error: 409-DUP-LINK
- **Pre-condition:** Inbox item with existing link to SAPX-777
- **Steps:**
  1. Send duplicate link request:
     ```bash
     curl -X POST "https://api.satuinbox.com/v1/inbox/conv-12345/links" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "external_ticket_id": "SAPX-777", "source": "SAPX", "url": "https://sapx.com/ticket/777" }'
     ```
  2. Verify HTTP 409 response
  3. Verify response schema: `{ "error": "Already linked" }`
- **Expected Result:** HTTP 409; error "Already linked"; no duplicate created
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-012 — `PATCH /inbox/bulk` accepts up to 1000 IDs per request
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: bulk
- **Pre-condition:** 1000+ inbox items exist; API token with write scope
- **Steps:**
  1. Send bulk request with 1000 IDs:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/bulk" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "ids": ["conv-1", "conv-2", ...], "properties": { "batch_id": "batch-001" } }'
     ```
  2. Verify HTTP 200 response
  3. Verify response includes job ID or success summary
  4. Verify all 1000 items updated
- **Expected Result:** Bulk update accepted; all items processed; response includes summary
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-013 — Rate limit exceeded (100 req/sec/tenant) → 429-RATE-LIMIT
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** Error: 429-RATE-LIMIT
- **Pre-condition:** API token valid
- **Steps:**
  1. Send >100 requests within 1 second to any endpoint:
     ```bash
     for i in $(seq 1 110); do
       curl -s -o /dev/null -w "%{http_code}" \
         "https://api.satuinbox.com/v1/inbox?page=$i&limit=1" \
         -H "Authorization: Bearer <token>"
     done
     ```
  2. Verify at least one response returns HTTP 429
  3. Verify response includes `{ "error": "Too many requests", "retry_after": 5 }`
  4. Wait `retry_after` seconds and retry — verify success
- **Expected Result:** HTTP 429 after exceeding rate limit; `retry_after` header present; succeeds after wait
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-014 — Server error → 500-SRV-ERR
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 500-SRV-ERR
- **Pre-condition:** Backend in error state (simulate internal failure)
- **Steps:**
  1. Send valid request during server error state:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=10" \
       -H "Authorization: Bearer <token>"
     ```
  2. Verify HTTP 500 response
  3. Verify response schema: `{ "error": "Internal server error" }`
  4. Verify no sensitive internal details exposed in response
- **Expected Result:** HTTP 500; generic error message; no internal details leaked
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-015 — API auth required; unauthenticated → 401
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** NFR: Authentication
- **Pre-condition:** No auth token or expired token
- **Steps:**
  1. Send request without Authorization header:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=10"
     ```
  2. Verify HTTP 401 response
  3. Send with expired token:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=10" \
       -H "Authorization: Bearer <expired-token>"
     ```
  4. Verify HTTP 401 response
- **Expected Result:** HTTP 401 for missing or expired auth; no data access without valid token
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-016 — PII masking: phone/email masked unless caller has `admin` scope
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** NFR: PII Masking
- **Pre-condition:** Two API tokens: one with `read` scope, one with `admin` scope
- **Steps:**
  1. Search inbox with `read` scope token:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=1" \
       -H "Authorization: Bearer <read-scope-token>"
     ```
  2. Verify phone shows masked (e.g. `+628****7890`) and email masked
  3. Search with `admin` scope token:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=1" \
       -H "Authorization: Bearer <admin-scope-token>"
     ```
  4. Verify phone and email show full values
- **Expected Result:** PII masked for non-admin; full values for admin scope
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-017 — `Idempotency-Key` header for PATCH/POST → idempotent response
- **Type:** Contract (idempotency) | **Priority:** P0 | **Source:** NFR: Idempotency
- **Pre-condition:** Inbox item exists; API token valid
- **Steps:**
  1. Send PATCH with Idempotency-Key:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Idempotency-Key: abc-123" \
       -H "Content-Type: application/json" \
       -d '{ "properties": { "test": "value" } }'
     ```
  2. Verify HTTP 200
  3. Send exact same request again with same Idempotency-Key
  4. Verify HTTP 200 with same response (idempotent)
  5. Verify no duplicate mutation (properties not doubled)
- **Expected Result:** Same Idempotency-Key returns same response; no duplicate mutation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-018 — All endpoints prefixed with `/v1/`; response schema backward compatible
- **Type:** Contract (backward-compat) | **Priority:** P0 | **Source:** NFR: Versioning
- **Pre-condition:** API token valid
- **Steps:**
  1. Call search: `GET /v1/inbox` — verify works
  2. Call update: `PATCH /v1/inbox/{id}` — verify works
  3. Call contacts: `PUT /v1/contacts/{id}` — verify works
  4. Call links: `POST /v1/inbox/{id}/links` — verify works
  5. Call bulk: `PATCH /v1/inbox/bulk` — verify works
  6. Verify all responses follow documented schema (no undocumented fields, no missing required fields)
- **Expected Result:** All endpoints under `/v1/` prefix; response schemas match documentation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-019 — Every API action logged with actor, source=api, timestamp in audit
- **Type:** Contract (success) | **Priority:** P0 | **Source:** NFR: Audit Trail
- **Pre-condition:** API token valid; audit log accessible
- **Steps:**
  1. Perform PATCH via API to update an inbox item
  2. Check audit log for that item
  3. Verify entry contains: `actor` (API client ID), `source=api`, `timestamp`
  4. Perform POST link via API
  5. Verify audit entry for link action
- **Expected Result:** All API mutations produce audit entries with actor, source=api, timestamp
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-020 — Transactions limit 200/contact; Properties ≤ 8KB → 400 if exceeded
- **Type:** Contract (validation-error) | **Priority:** P1 | **Source:** Limitations
- **Pre-condition:** Contact and inbox item exist; API token valid
- **Steps:**
  1. Send PUT with 201 transactions:
     ```bash
     curl -X PUT "https://api.satuinbox.com/v1/contacts/cust-1001" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "transactions": [ /* 201 items */ ] }'
     ```
  2. Verify HTTP 400 with error about transaction limit
  3. Send PATCH with properties JSON > 8KB:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "properties": { "large_key": "<8KB+ string>" } }'
     ```
  4. Verify HTTP 400 with error about property size limit
- **Expected Result:** HTTP 400 when transactions > 200 or properties JSON > 8KB
- **Actual Result:** *(QA fills)*

---

## 11. PRD Public ID Prefix and Sequential Numbering

### SC-PUBLICID-001 — First conversation in new tenant → public ID is CV-0
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005
- **Pre-condition:** New tenant with zero conversations
- **Steps:**
  1. Create first conversation in new tenant
  2. Open conversation detail
  3. Verify public ID displayed is `CV-0`
  4. Verify format matches regex `^CV-[0-9]+$`
- **Expected Result:** First conversation gets public ID `CV-0`; format correct
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-002 — Sequential increment: CV-9 → CV-10; TK-99 → TK-100
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-006–FR-007
- **Pre-condition:** Tenant with CV-9 already existing
- **Steps:**
  1. Create new conversation
  2. Verify public ID is `CV-10` (not CV-10, CV-A, etc.)
  3. Create tickets until TK-99 exists
  4. Create next ticket
  5. Verify public ID is `TK-100`
  6. Verify digit length grows naturally (no padding to fixed width)
- **Expected Result:** Sequential increment without padding; natural digit growth
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-003 — Conversation detail shows CV-{n} with copy button
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-011
- **Pre-condition:** Conversation with public ID assigned
- **Steps:**
  1. Open conversation detail page
  2. Verify `CV-{n}` displayed in header area
  3. Verify copy button visible `[data-cy="Chat-Detail-Copy-Id-Button"]`
  4. Click copy button
  5. Verify clipboard contains `CV-{n}`
- **Expected Result:** Public ID visible in header; copy button copies to clipboard
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-004 — Ticket detail shows TK-{n} with copy button
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Ticket with public ID assigned
- **Steps:**
  1. Open ticket detail page
  2. Verify `TK-{n}` displayed in header area
  3. Verify copy button visible
  4. Click copy button
  5. Verify clipboard contains `TK-{n}`
- **Expected Result:** Public ID visible in header; copy button works
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-005 — Global search by exact CV-10 or TK-10 finds matching entity
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-013
- **Pre-condition:** Conversation CV-10 and Ticket TK-10 exist
- **Steps:**
  1. Open global search (Ctrl+K or Cari sidenav)
  2. Type "CV-10" and submit
  3. Verify matching conversation found
  4. Clear and type "TK-10"
  5. Verify matching ticket found
- **Expected Result:** Exact public ID search returns correct entity
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-006 — Search for non-existing public ID → empty state, no wrong result
- **Type:** Negative | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** No conversation with CV-99999 exists
- **Steps:**
  1. Open global search
  2. Type "CV-99999" and submit
  3. Verify empty state shown
  4. Verify no incorrect results returned
- **Expected Result:** Empty state; no false matches
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-007 — Public ID immutable once assigned; never changes
- **Type:** Positive | **Priority:** P0 | **Source:** FR-003
- **Pre-condition:** Conversation with public ID CV-42
- **Steps:**
  1. Note current public ID (CV-42)
  2. Update conversation properties, status, tags, assignee
  3. Verify public ID still CV-42
  4. Verify no API or UI path can change the public ID
- **Expected Result:** Public ID remains CV-42 regardless of other changes; immutable
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-008 — Deleted item's public ID is never reused
- **Type:** Edge | **Priority:** P0 | **Source:** FR-008
- **Pre-condition:** Conversations CV-0 through CV-5 exist; CV-3 to be deleted
- **Steps:**
  1. Delete conversation CV-3
  2. Create new conversation
  3. Verify new conversation gets CV-6 (not CV-3)
  4. Verify CV-3 is not reused
- **Expected Result:** Deleted ID (CV-3) skipped; next available sequence number assigned
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-009 — Concurrent creation → both get unique public IDs (atomic uniqueness)
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-009
- **Pre-condition:** Tenant with CV-50 as latest
- **Steps:**
  1. Create two conversations simultaneously (e.g. parallel API calls)
  2. Verify one gets CV-51 and the other gets CV-52
  3. Verify no duplicates
  4. Verify both stored correctly in database
- **Expected Result:** Atomic uniqueness guaranteed; both conversations get unique sequential IDs
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-010 — Unique constraint violation → auto-retry; "Gagal membuat ID. Coba lagi." on final failure
- **Type:** Negative | **Priority:** P0 | **Source:** FR-010, EH-001–EH-002
- **Pre-condition:** Simulate unique constraint violation (mock DB failure)
- **Steps:**
  1. Trigger concurrent ID generation that causes unique constraint violation
  2. Verify system retries up to 3 times automatically
  3. If all retries fail, verify toast "Gagal membuat ID. Coba lagi."
  4. Verify conversation creation fails gracefully (not partial)
- **Expected Result:** Up to 3 retries; final failure shows Bahasa Indonesia error toast; no partial state
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-011 — Backfill assigns public IDs to existing records; idempotent
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-014–FR-016
- **Pre-condition:** Existing conversations without public IDs; some with IDs already assigned
- **Steps:**
  1. Run backfill job
  2. Verify all existing conversations now have public IDs
  3. Verify already-assigned IDs unchanged (idempotent)
  4. Verify IDs assigned from next available counter (no gaps in assigned range)
  5. Run backfill again — verify no changes (idempotent rerun)
- **Expected Result:** Backfill assigns missing IDs; preserves existing; idempotent on rerun
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-012 — Backfill partial failure → "ID belum tersedia"; error logged
- **Type:** Negative | **Priority:** P1 | **Source:** US-004, EH-003
- **Pre-condition:** Backfill job running; simulate failure for specific records
- **Steps:**
  1. Run backfill with some records that will fail (e.g. corrupted data)
  2. Verify successful records get public IDs
  3. Open failed record in UI
  4. Verify "ID belum tersedia" label shown
  5. Verify error logged for retry
- **Expected Result:** Partial success; failed items show fallback label; error logged for retry
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-013 — Search input not matching CV-[0-9]+ or TK-[0-9]+ → "Format ID tidak valid"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Global search accessible
- **Steps:**
  1. Open global search
  2. Type "cv-abc" and submit
  3. Verify inline error "Format ID tidak valid"
  4. Type "TK-" (no number) and submit
  5. Verify same error
  6. Type "CV-123" (valid) — verify no format error
- **Expected Result:** Invalid format rejected with Bahasa Indonesia error; valid format accepted
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-014 — Cloned/duplicated item → receives new public ID from next sequence
- **Type:** Edge | **Priority:** P1 | **Source:** EC-002
- **Pre-condition:** Conversation CV-100 exists; clone/duplicate feature available
- **Steps:**
  1. Clone conversation CV-100
  2. Verify cloned conversation gets new public ID (e.g. CV-101)
  3. Verify original CV-100 unchanged
  4. Verify no public ID collision
- **Expected Result:** Clone gets new sequential ID; original preserved; no collision
- **Actual Result:** *(QA fills)*

---

## 12. PRD Conversation - Macro

### SC-MACRO-001 — Admin views template list showing Shortcut and Message columns; search ≤1s
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: list/search
- **Pre-condition:** Admin logged in; templates exist in system
- **Steps:**
  1. Navigate to Settings → Template Pesan
  2. Verify list displays Shortcut and Message columns
  3. Type a search term in search bar
  4. Verify results filter within ≤1 second
  5. Verify list sorted alphabetically or by last updated
- **Expected Result:** Template list with Shortcut/Message columns; search responds ≤1s
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-002 — Admin creates template with shortcut + message → appears in list
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: create
- **Pre-condition:** Admin on Template Pesan page
- **Steps:**
  1. Click "Template Baru"
  2. Enter Shortcut = `/thankyou`
  3. Enter Message = multiline text ≤2000 chars
  4. Optionally select category and visibility
  5. Click Save
  6. Verify template appears in list with correct shortcut and message
- **Expected Result:** Template created; appears in list; shortcut starts with `/`
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-003 — Shortcut blank or not starting with / → validation error
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM01
- **Pre-condition:** Admin on create/edit template modal
- **Steps:**
  1. Leave Shortcut blank; fill Message
  2. Click Save
  3. Verify error "Shortcut harus diisi dan dimulai dengan '/'."
  4. Enter Shortcut = `hello` (no leading /)
  5. Click Save — verify same error
  6. Enter Shortcut = `/hello` — verify valid
- **Expected Result:** Validation rejects blank and non-slash-prefixed shortcuts
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-004 — Duplicate shortcut → "Shortcut sudah digunakan. Gunakan nama lain."
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM02
- **Pre-condition:** Template with shortcut `/thankyou` already exists
- **Steps:**
  1. Create new template with shortcut `/thankyou`
  2. Click Save
  3. Verify error "Shortcut sudah digunakan. Gunakan nama lain."
  4. Change to `/thankyou2` — verify save succeeds
- **Expected Result:** Duplicate shortcut rejected; unique shortcut accepted
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-005 — Message blank → "Pesan template tidak boleh kosong."
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM03
- **Pre-condition:** Admin on create/edit template modal
- **Steps:**
  1. Enter valid Shortcut = `/test`
  2. Leave Message blank
  3. Click Save
  4. Verify error "Pesan template tidak boleh kosong."
  5. Enter message text — verify save succeeds
- **Expected Result:** Empty message rejected with validation error
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-006 — Admin edits template → modal pre-fills; shortcut uniqueness validated
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: edit
- **Pre-condition:** Template exists in list
- **Steps:**
  1. Click pencil icon on template row
  2. Verify modal pre-fills current Shortcut and Message
  3. Edit message text
  4. Change shortcut to existing one from another template
  5. Click Save — verify uniqueness error
  6. Revert shortcut — save successfully
  7. Verify list updates immediately
- **Expected Result:** Edit modal pre-fills; uniqueness enforced; list updates after save
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-007 — Admin deletes template → confirmation → removed from list
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: delete
- **Pre-condition:** Template exists in list
- **Steps:**
  1. Click three-dot menu on template row
  2. Select "Delete"
  3. Verify confirmation modal appears (Yes/No)
  4. Click "No" — verify template still in list
  5. Repeat delete flow, click "Yes"
  6. Verify template removed from list
- **Expected Result:** Confirmation required; cancel preserves; confirm removes template
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-008 — Agent types / in chat input → auto-complete list appears
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: insert
- **Pre-condition:** Agent in chat room; templates exist
- **Steps:**
  1. Open a conversation chat room
  2. Click in message textarea `[data-cy="Message-Text-Input"]`
  3. Type `/`
  4. Verify auto-complete list appears with matching templates
  5. Verify list shows shortcut names
  6. Type `/thank` to filter — verify list narrows
- **Expected Result:** Typing `/` triggers auto-complete; templates filtered by typed text
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-009 — Agent selects template → message inserted with variables replaced
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: insert + variables
- **Pre-condition:** Template with `{customer_name}` variable exists; conversation has customer name
- **Steps:**
  1. In chat input, type `/` and select template containing `{customer_name}`
  2. Verify message inserted into textarea
  3. Verify `{customer_name}` replaced with actual customer name
  4. If customer name missing, verify fallback text displayed (e.g. "customer")
  5. Verify agent can edit before sending
- **Expected Result:** Template inserted with variables resolved; fallback for missing data
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-010 — Invalid variable token → "Variabel tidak dikenal: {variable}."
- **Type:** Negative | **Priority:** P1 | **Source:** Error: 400-TM04
- **Pre-condition:** Admin editing template message
- **Steps:**
  1. In template message, insert `{nonexistent_variable}`
  2. Save template
  3. Verify error "Variabel tidak dikenal: {nonexistent_variable}."
  4. Fix variable to known one — verify save succeeds
- **Expected Result:** Unknown variable token rejected with specific error message
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-011 — Agent without permission → "Anda tidak memiliki izin untuk mengubah template ini."
- **Type:** Permission | **Priority:** P0 | **Source:** Error: 403-TM05
- **Pre-condition:** Logged in as Agent (no template edit permission)
- **Steps:**
  1. Navigate to Settings → Template Pesan
  2. Attempt to create new template
  3. Verify permission error "Anda tidak memiliki izin untuk mengubah template ini."
  4. Attempt to edit existing template — verify same error
  5. Attempt to delete — verify same error
- **Expected Result:** Unauthorized agents blocked; Bahasa Indonesia permission error shown
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-012 — Templates assigned to category/folder; category filter available
- **Type:** Positive | **Priority:** P1 | **Source:** User Story: categorize
- **Pre-condition:** Templates with categories assigned
- **Steps:**
  1. Navigate to Settings → Template Pesan
  2. Create template with category "Greetings"
  3. Create another with category "Shipping"
  4. Use category filter dropdown
  5. Select "Greetings" — verify only Greetings templates shown
  6. Select "Shipping" — verify only Shipping templates shown
  7. Select All — verify all shown
- **Expected Result:** Category filter narrows template list; categories display correctly
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-013 — Visibility: Global, Channel-specific, or Team-specific; agents see scoped templates only
- **Type:** Positive | **Priority:** P1 | **Source:** User Story: visibility
- **Pre-condition:** Templates with different visibility scopes
- **Steps:**
  1. Create template with visibility "Global (all teams)"
  2. Create template with visibility "Channel: WhatsApp"
  3. Create template with visibility "Team: Team A"
  4. Login as agent on Team B, WhatsApp channel
  5. Type `/` in chat — verify only Global template visible
  6. Login as agent on Team A, WhatsApp channel
  7. Type `/` — verify Global + Team A + WhatsApp templates visible
- **Expected Result:** Agents see only templates matching their team/channel scope + Global
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-014 — Shortcut ≤30 chars, alphanumeric + underscores, unique within visibility scope
- **Type:** Positive | **Priority:** P0 | **Source:** Field: Shortcut
- **Pre-condition:** Admin on create/edit template modal
- **Steps:**
  1. Enter shortcut with 31 characters — verify validation error
  2. Enter shortcut with special characters (e.g. `/hello world!`) — verify validation error
  3. Enter valid shortcut `/thank_you_123` (30 chars, alphanumeric + _) — verify accepted
  4. Enter same shortcut in same visibility scope — verify uniqueness error
  5. Enter same shortcut in different visibility scope — verify accepted
- **Expected Result:** Length ≤30, alphanumeric + underscore only; unique per scope
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-015 — Server error saving template → "Gagal menyimpan template. Coba lagi nanti."
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 500-TM06
- **Pre-condition:** Backend returning 500 errors
- **Steps:**
  1. Create template with valid data
  2. Click Save
  3. Verify error "Gagal menyimpan template. Coba lagi nanti."
  4. Verify modal remains open with data intact (not lost)
  5. Fix backend; click Save again — verify success
- **Expected Result:** Server error shows Bahasa Indonesia message; form data preserved; retry works
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-016 — Changes propagate across all agent views within 5 seconds (real-time)
- **Type:** Positive | **Priority:** P1 | **Source:** NFR: Real-time
- **Pre-condition:** Two agent sessions open; both viewing chat
- **Steps:**
  1. Admin creates new template `/greeting`
  2. In Agent A session, type `/` within 5 seconds
  3. Verify `/greeting` appears in auto-complete list
  4. Admin deletes template `/greeting`
  5. In Agent B session, type `/` within 5 seconds
  6. Verify `/greeting` no longer appears
- **Expected Result:** Template changes propagate to all agent views within 5 seconds
- **Actual Result:** *(QA fills)*

---

> **Total Scenarios:** 103 (SC-SLA: 24, SC-RLT: 11, SC-ANALYTICS: 18, SC-OPENAPI: 20, SC-PUBLICID: 14, SC-MACRO: 16)
> **SLA Hold/Snooze/SLA 3-way conflict markers:** 4 (SC-SLA-006, SC-SLA-007, SC-SLA-022, SC-SLA-023)


