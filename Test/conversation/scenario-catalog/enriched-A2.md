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
