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
