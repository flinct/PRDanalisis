# Conversation Scenario Catalog — Master

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Lane:** TEST CASE (scenario collection)
> **Source of truth:** PRD/Conversationv2/ + adjacent conversation domains
> **Method:** PRD requirement extraction by orchestrator (3 parallel workers), merged into single catalog
> **Coverage:** 31 PRD files → 729 testable scenarios

---

## 0. Coverage Dashboard

| Dimension | Count | Details |
|---|---|---|
| Total PRDs scanned | 31 | 10 core + 9 features + 12 adjacent |
| Total scenarios | **729** | 261 (A) + 234 (B) + 234 (C) |
| DEVELOPED | **344** | 256 (A) + 88 (B: metrics, ownership, ticketingV2) |
| UNDEVELOPED | **101** | auto-reply(36) + snooze(18) + related convos(24) + wa mention(18) + room sub-features(5) |
| PARTIAL (dev+undev) | **50** | assignees/collaborators(28) + custom attrs(22) |
| ADJACENT / UNKNOWN | **234** | Part C: search, SLA, RLT, analytics, API, transcript, macro, shopee |
| Requirement IDs traced | All 31 PRDs | 2 use unnumbered US; Open API uses non-standard codes |

### Status-by-PRD Matrix

| # | PRD | Part | Status | Scenarios | Surface |
|---|---|---|---|---|---|
| 1 | Omnichannel Inbox | A | DEVELOPED | 30 | Global inbox overview |
| 2 | Inbox Navigation | A | DEVELOPED | 24 | Sidebar nav tabs |
| 3 | Team Inbox Navigation | A | DEVELOPED | 28 | Team inbox sidebar |
| 4 | Chat List | A | DEVELOPED | 30 | Chat list, filters, sort |
| 5 | Conversation Room | A | DEVELOPED (5 [UNDEV]) | 32 | Room header, bubbles, attachments |
| 6 | Conversation Detail | A | DEVELOPED | 25 | Detail sidebar panel |
| 7 | Agent Pull Queue | A | DEVELOPED | 14 | Pull-based queue |
| 8 | Chat Sessions | A | DEVELOPED | 30 | Session lifecycle, group, multi-number |
| 9 | Multi-Ticket Drafts | A | DEVELOPED | 24 | Multi-draft creation |
| 10 | Member Drawer & HUD | A | DEVELOPED | 24 | Presence, member drawer |
| 11 | Response Metrics | B | DEVELOPED | 42 | RLT/FRT/TTC/Wait-time |
| 12 | Ownership Decoupling | B | DEVELOPED | 24 | team_owner_id, move, reopen |
| 13 | Ticketing V2 | B | DEVELOPED | 22 | Ticket creation from chat |
| 14 | Assignees & Collaborators | B | PARTIAL | 28 | Multi-assignee dev, collaborator undev |
| 15 | Custom Attributes | B | PARTIAL | 22 | Single attrs dev, collections undev |
| 16 | Auto-Reply Templates | B | UNDEVELOPED | 36 | Availability auto-reply |
| 17 | Snooze Conversation | B | UNDEVELOPED | 18 | Snooze chip, wake, auto-unsnooze |
| 18 | Related Conversations | B | UNDEVELOPED | 24 | Parent/child grouping |
| 19 | WA Group Mention | B | UNDEVELOPED | 18 | @mention in WA groups |
| 20 | Global Search | C | DEVELOPED | 20 | Search popup + Ctrl+K |
| 21 | Shared Attribute Search | C | UNKNOWN | 18 | Bulk action + relation labels |
| 22 | Shopee Channel Add-On | C | UNKNOWN | 25 | Shopee integration |
| 23 | Transcript Reply (V2) | C | DEVELOPED | 24 | Email transcript + auto link |
| 24 | Reply via Email (V1) | C | ADJACENT | 24 | Near-duplicate of #23 |
| 25 | Widget Email Transcript | C | ADJACENT | 20 | Widget email settings |
| 26 | Conversation SLA | C | DEVELOPED | 24 | SLA settings, per-channel |
| 27 | Conversation RLT | C | DEVELOPED | 11 | RLT timers + export |
| 28 | Analytics Conversation | C | DEVELOPED | 18 | KPI cards + charts |
| 29 | Open API Conversation | C | DEVELOPED | 20 | REST endpoints |
| 30 | Public ID Prefix | C | DEVELOPED | 14 | Conv ID, search, exports |
| 31 | Conversation Macro | C | DEVELOPED | 16 | Template Pesan + composer |

### Known Issues

| Issue | Detail |
|---|---|
| Near-duplicate #23 vs #24 | Transcript Reply and reply via email are near-identical. De-dup at test-case level. |
| UNKNOWN-verify #21 | Shared Attribute Search — verify against FE/BE repos |
| UNKNOWN-verify #22 | Shopee Channel Add-On — verify against FE/BE repos |
| Zero req-ID: Inbox, Inbox Nav | Use unnumbered US (US-1..US-15 without FR-/EH- prefix) |
| Wait-Time gap (Metrics §15) | Phase 1 = raw, no queue pause policy yet |
| Hold/Snooze/SLA 3-way conflict | Open risk — Room says Hold pauses SLA, Snooze says no pause |

---

## Part A: Core Inbox — 261 scenarios

> **Status:** DEVELOPED · 5 sub-features in Conversation Room tagged `[UNDEV]` (Reminder ×3, Hold/Resume, Bot auto-reply)

## Summary Table

| PRD | Surface | Status | #Scenarios |
|-----|---------|--------|------------|
| PRD Ticket - Omnichannel Inbox | Global inbox overview, channels, sessions, tagging, retention, error handling | DEVELOPED | 30 |
| PRD Ticket - Omnichannel Inbox - Inbox Navigation | Sidebar nav (Your Inbox, All, Starred, Unassigned, Closed, Spam), team inbox CRUD, counters, state persistence | DEVELOPED | 24 |
| PRD Ticket - Omnichannel Inbox - Team Inbox Navigation | Team Inbox sidebar (inline create, drag-drop, tags, SLA, roles, counters, mentions) | DEVELOPED | 28 |
| PRD Ticket - Omnichannel Inbox - Chat List | Chat list with status tabs, identity, SLA indicators, search/filter, bulk actions, presence | DEVELOPED | 30 |
| PRD Ticket - Omnichannel Inbox - Conversation Room | Chat room header, bubbles, message status, attachments, notes, search, automation, reminders | DEVELOPED | 32 |
| PRD Ticket - Omnichannel Inbox - Conversation Detail | Detail panel: assignees, SLA, attributes, client data, tags, notes, media, files, timeline, history | DEVELOPED | 25 |
| PRD Ticket - Omnichannel Inbox - Get New Conversation (Agent Pull Queue) | Pull-based queue: FIFO, batch, timeout, max active | DEVELOPED | 14 |
| PRD Ticket - Omnichannel Chat Sessions | Session lifecycle, group handling, multi-number Send as, SLA carry-over, ownership decoupling | DEVELOPED | 30 |
| PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble | Multi-draft ticket creation, cookie persistence, single/multi-select modes | DEVELOPED | 24 |
| PRD Ticket - Team Inbox Member Drawer and Online Status HUD | Member drawer, HUD, add/remove members, presence, last seen | DEVELOPED | 24 |

**Grand Total: 261 scenarios**

---

## PRD Ticket - Omnichannel Inbox
- **Status:** DEVELOPED
- **Surface:** Global inbox overview — channel support, session management, presence, notifications, tagging, filtering, retention, error handling, integrations
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-INBOX-001 | Unified Inbox shows all conversations across channels with channel indicators | Positive | P0 | US-1 |
| SC-INBOX-002 | Conversations update in real-time via socket | Positive | P0 | US-1 |
| SC-INBOX-003 | Infinite scroll loads ≥1000 conversations in <1s | Positive | P0 | US-1 |
| SC-INBOX-004 | Multi-select channel filter available (WhatsApp, Live Chat, IG, Marketplace, etc.) | Positive | P0 | US-2 |
| SC-INBOX-005 | "Reset Filters" button restores default filter state | Positive | P0 | US-2 |
| SC-INBOX-006 | Filter state persists per tab/session (saved in cookies) | Positive | P0 | US-2 |
| SC-INBOX-007 | Tags can be added and removed on conversations | Positive | P0 | US-3 |
| SC-INBOX-008 | Tags visible as badges in chat list | Positive | P0 | US-3 |
| SC-INBOX-009 | Tag 2-way sync with WhatsApp Business API works | Positive | P0 | US-3 |
| SC-INBOX-010 | Tag sync failure shows toast "Gagal sinkronisasi tag" | Negative | P0 | US-3 |
| SC-INBOX-011 | Multi-session login supported for multiple WhatsApp numbers | Positive | P0 | US-4 |
| SC-INBOX-012 | Session switcher dropdown available for multi-session | Positive | P0 | US-4 |
| SC-INBOX-013 | Expired token detected and error "Sesi WA perlu login ulang" shown | Negative | P0 | US-4 |
| SC-INBOX-014 | WhatsApp Group shows participant list and sender name | Positive | P0 | US-5 |
| SC-INBOX-015 | Group chat linked to >1 number shows dropdown session switcher | Positive | P0 | US-5 |
| SC-INBOX-016 | Group chat cannot be resolved (manual tracking required) | Negative | P0 | US-5 |
| SC-INBOX-017 | Connection Lost indicator shown when session disconnects | Positive | P0 | US-6 |
| SC-INBOX-018 | Degraded Network indicator shown for unstable connections | Positive | P0 | US-6 |
| SC-INBOX-019 | Auto-retry with exponential backoff on connection issues | Positive | P0 | US-6 |
| SC-INBOX-020 | Retry button displayed for connection recovery | Positive | P0 | US-6 |
| SC-INBOX-021 | Dev vs Prod isolation enforced between environments | Permission | P0 | US-7 |
| SC-INBOX-022 | Multi-company separation enforced across tenants | Permission | P0 | US-7 |
| SC-INBOX-023 | Unique Group ID enforced across tenants | Permission | P0 | US-7 |
| SC-INBOX-024 | Browser tab title changes on new message notification | Positive | P1 | US-8 |
| SC-INBOX-025 | Audio notification plays on new message | Positive | P1 | US-8 |
| SC-INBOX-026 | Phone numbers masked (e.g., 08xxxx1234) for non-admin roles | Permission | P1 | US-9 |
| SC-INBOX-027 | Full phone number visible only for Admin/Super Admin | Permission | P1 | US-9 |
| SC-INBOX-028 | Screenshot button appears only if SAP add-on is enabled | Positive | P1 | US-10 |
| SC-INBOX-029 | Session takeover auto-disables old session and shows notification | State | P0 | FR |
| SC-INBOX-030 | Rate limit reached shows "Terlalu banyak request, coba beberapa saat lagi" | Negative | P0 | FR |

---

## PRD Ticket - Omnichannel Inbox - Inbox Navigation
- **Status:** DEVELOPED
- **Surface:** Sidebar navigation — main menus (Your Inbox, All, Starred, Unassigned, Closed, Spam), team inbox CRUD, drag-drop assignment, counters, state persistence, real-time updates
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-INBOXNAV-001 | Sidebar displays all main navigation items: Your Inbox, Unassigned, Closed, All Conversation, Starred, Spam | Positive | P0 | US-01 |
| SC-INBOXNAV-002 | Instant tab switching completes in <1s | Positive | P0 | US-01 |
| SC-INBOXNAV-003 | Starred items synced across team via DB | Positive | P0 | US-01 |
| SC-INBOXNAV-004 | Agent can filter inbox by channel; only selected channel conversations appear | Positive | P0 | US-02 |
| SC-INBOXNAV-005 | Agent can add, edit, and remove tags; tags persist across channels | Positive | P0 | US-03 |
| SC-INBOXNAV-006 | Agent can log in and manage multiple WhatsApp numbers in same dashboard | Positive | P0 | US-04 |
| SC-INBOXNAV-007 | Group conversations appear in inbox and can be managed like 1:1 chats | Positive | P0 | US-05 |
| SC-INBOXNAV-008 | Agent notified when WhatsApp session is disconnected or unstable | Positive | P0 | US-06 |
| SC-INBOXNAV-009 | Data from one company/environment not visible to other companies/environments | Permission | P0 | US-07 |
| SC-INBOXNAV-010 | Agent receives real-time notifications for new incoming messages | Positive | P0 | US-08 |
| SC-INBOXNAV-011 | Sensitive fields (phone, email) masked for non-admin roles | Permission | P1 | US-09 |
| SC-INBOXNAV-012 | Agent can capture chat screenshots and send to SAP with confirmation logged | Positive | P1 | US-10 |
| SC-INBOXNAV-013 | Presence status (Active, Away, On Break) visible for team members | Positive | P1 | US-11 |
| SC-INBOXNAV-014 | System auto-archives/deletes chats based on company retention policy | Positive | P2 | US-12 |
| SC-INBOXNAV-015 | Agent can convert conversation into ticket; ticket linked back to conversation | Positive | P2 | US-13 |
| SC-INBOXNAV-016 | Broadcast messages can be sent across multiple channels | Positive | P2 | US-14 |
| SC-INBOXNAV-017 | Team Inbox management (Create, Rename, Edit, Duplicate, Delete, Reorder) for Admin/Supervisor | Positive | P0 | US-01 |
| SC-INBOXNAV-018 | Team Inbox delete requires confirmation dialog | Positive | P0 | US-01 |
| SC-INBOXNAV-019 | Team Inbox changes propagate live via socket | Positive | P0 | US-01 |
| SC-INBOXNAV-020 | Drag & drop chat to Team Inbox with confirmation prompt | Positive | P0 | US-01 |
| SC-INBOXNAV-021 | Multi-select batch assign/handover via checkbox selection | Positive | P0 | US-01 |
| SC-INBOXNAV-022 | Rollback on failed assignment; log event | Negative | P0 | US-01 |
| SC-INBOXNAV-023 | Unread counters (red badge) update in real-time via socket; Total counter (normal font) | Positive | P0 | US-01 |
| SC-INBOXNAV-024 | Scroll position and filters saved per inbox in cookies/local storage; restored on revisit | Positive | P0 | US-01 |

---

## PRD Ticket - Omnichannel Inbox - Team Inbox Navigation
- **Status:** DEVELOPED
- **Surface:** Team Inbox sidebar — inline creation, drag-drop reorder, tags, per-inbox SLA, role assignments (Supervisor/Member), counters (Unread/Ongoing/Resolved), mentions
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-TEAMNAV-001 | "+ Team Inbox" button in sidebar opens inline creation modal | Positive | P0 | US-1 |
| SC-TEAMNAV-002 | Creation form has fields: Name, Tags, SLA (First Response + Resolution), Supervisors, Members | Positive | P0 | US-1 |
| SC-TEAMNAV-003 | Save adds Team Inbox to sidebar instantly | Positive | P0 | US-1 |
| SC-TEAMNAV-004 | Duplicate Team Inbox name shows "Nama sudah ada" | Negative | P0 | US-1 |
| SC-TEAMNAV-005 | Supervisor can add/remove members; Supervisors see all chats, Members see assigned only | Permission | P0 | US-2 |
| SC-TEAMNAV-006 | Role changes sync in real-time across users | Positive | P0 | US-2 |
| SC-TEAMNAV-007 | Invalid user in role assignment shows "Pengguna tidak ditemukan" | Negative | P0 | US-2 |
| SC-TEAMNAV-008 | RBAC blocks unauthorized role changes | Permission | P0 | US-2 |
| SC-TEAMNAV-009 | Chats filtered by membership; no membership shows empty view with "Tidak ada akses" | Negative | P0 | US-3 |
| SC-TEAMNAV-010 | Counters display Unread, Ongoing, Resolved per inbox | Positive | P0 | US-3 |
| SC-TEAMNAV-011 | Drag & drop chat between Team Inboxes resets to Unassigned in new inbox, clears old assignment | Positive | P1 | US-4 |
| SC-TEAMNAV-012 | Drag & drop completes in <2s | Positive | P1 | US-4 |
| SC-TEAMNAV-013 | Drop fail (e.g., offline) queues action and shows "Gagal pindah, coba lagi" | Negative | P1 | US-4 |
| SC-TEAMNAV-014 | Tags shown as multi-chip in sidebar/detail with hover tooltip for full name | Positive | P1 | US-5 |
| SC-TEAMNAV-015 | Max 10 tags per Team Inbox; exceed shows "Batas tag tercapai" | Negative | P1 | US-5 |
| SC-TEAMNAV-016 | SLA composite field (days/hours/minutes) with non-negative integers, min 1 menit | Positive | P1 | US-6 |
| SC-TEAMNAV-017 | SLA applies to new and ongoing conversations; breach flagged red | Positive | P1 | US-6 |
| SC-TEAMNAV-018 | Invalid SLA format (e.g., negative value) prevents save with "Format SLA tidak valid" | Negative | P1 | US-6 |
| SC-TEAMNAV-019 | Filters inside Team Inbox by tag, SLA, member with "Reset Filters" button | Positive | P1 | US-7 |
| SC-TEAMNAV-020 | No filter results shows "Tidak ada hasil" | Negative | P1 | US-7 |
| SC-TEAMNAV-021 | "@TeamInboxName" mention notifies all members in real-time | Positive | P1 | US-8 |
| SC-TEAMNAV-022 | Invalid team mention shows "Tim tidak ditemukan" | Negative | P1 | US-8 |
| SC-TEAMNAV-023 | Drag & drop reorder of Team Inboxes in sidebar; per-user saved | Positive | P2 | US-9 |
| SC-TEAMNAV-024 | Multi-user reorder conflict syncs latest | Edge | P2 | US-9 |
| SC-TEAMNAV-025 | Duplicate copies SLA/tags/members (not chats) | Positive | P2 | US-10 |
| SC-TEAMNAV-026 | Delete Team Inbox shows confirmation dialog | Positive | P2 | US-10 |
| SC-TEAMNAV-027 | Archive with active chats prompts migration confirmation | Edge | P2 | US-10 |
| SC-TEAMNAV-028 | Team Inbox name max 50 chars, alphanumeric/spaces, no duplicates | Positive | P0 | US-1 |

---

## PRD Ticket - Omnichannel Inbox - Chat List
- **Status:** DEVELOPED
- **Surface:** Chat list — status tabs (Unassigned/Ongoing/Resolved), stateful scroll, quick assign, identity display, delivery/read indicators, channel icons, tags, SLA countdown, search/filter, bulk actions, sorting, presence, typing indicators
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-CHATLIST-001 | Tabs for Unassigned, Ongoing, Resolved with counters; count >99 shows "99+" | Positive | P0 | US-1 |
| SC-CHATLIST-002 | Counters update in real-time via socket | Positive | P0 | US-1 |
| SC-CHATLIST-003 | Tab switch completes in <1s | Positive | P0 | US-1 |
| SC-CHATLIST-004 | Scroll position saved per tab in cookies/local storage; restores on revisit within session | Positive | P0 | US-2 |
| SC-CHATLIST-005 | Selected chats persist until changed | Positive | P0 | US-2 |
| SC-CHATLIST-006 | "Assign to Me" button visible in Unassigned chats | Positive | P0 | US-3 |
| SC-CHATLIST-007 | Assign action updates instantly (<1s) | Positive | P0 | US-3 |
| SC-CHATLIST-008 | Failed assign shows toast "Gagal assign/handover" | Negative | P0 | US-3 |
| SC-CHATLIST-009 | WhatsApp 1:1: Phone (masked for non-admins), alias if set, contact name+number if enabled | Positive | P0 | US-4 |
| SC-CHATLIST-010 | WhatsApp Group: Group name + sender in preview | Positive | P0 | US-4 |
| SC-CHATLIST-011 | Live Chat: Name or "Guest" + ID | Positive | P0 | US-4 |
| SC-CHATLIST-012 | Delivery/read indicators: ✓ sent, ✓✓ grey delivered, ✓✓ blue read | Positive | P0 | US-6 |
| SC-CHATLIST-013 | Agent's last reply shows agent name; notes highlighted with agent name | Positive | P0 | US-6 |
| SC-CHATLIST-014 | Channel badge (WhatsApp, Live Chat, etc.) on each chat card | Positive | P0 | US-7 |
| SC-CHATLIST-015 | Tags shown as chips; >3 tags shows "+x" (max +99); hover displays full tag list | Positive | P0 | US-8 |
| SC-CHATLIST-016 | Last message preview truncated at 50 chars | Positive | P0 | US-9 |
| SC-CHATLIST-017 | Timestamp: Relative (e.g., "3h ago") for <7 days; full date otherwise | Positive | P0 | US-9 |
| SC-CHATLIST-018 | Context menu: Mark as read, Close, Set Reminder, Assign to, Star, Pin, Mark as Spam, Delete (role-restricted) | Positive | P1 | US-10 |
| SC-CHATLIST-019 | Delete action restricted by role (Admin/Owner only) | Permission | P1 | US-10 |
| SC-CHATLIST-020 | Hover on identity/avatar shows mini profile (sender info, last 3 tickets with status); loads ≤1s | Positive | P1 | US-5 |
| SC-CHATLIST-021 | Search by name, number, alias, chat content, custom properties with keyword highlighting | Positive | P1 | US-11 |
| SC-CHATLIST-022 | Advanced filters: Agent, Tag, Channel, Status, SLA (Overdue, Near Due); Reset Filters button | Positive | P1 | US-11 |
| SC-CHATLIST-023 | Multi-select via checkboxes with bulk actions: Handover, Assign, Delete (role-restricted); shows selected count | Positive | P1 | US-12 |
| SC-CHATLIST-024 | Hold indicator icon on chat card; tooltip shows who set Hold and timestamp; filter for "On Hold" | Positive | P0 | US-13 |
| SC-CHATLIST-025 | SLA countdown with colors: Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue); configurable in Settings | Positive | P0 | US-14 |
| SC-CHATLIST-026 | Sort by Most Recent, Longest Waiting, Mentions, Reminder; sorting persists in session | Positive | P1 | US-15 |
| SC-CHATLIST-027 | Presence indicator (avatar/icon) when ≥2 agents view same chat; real-time via socket; tooltip shows agent names | Positive | P1 | US-16 |
| SC-CHATLIST-028 | SLA breach: Red warning icon; Resolved: Green check icon visible on all relevant chats | Positive | P2 | US-17 |
| SC-CHATLIST-029 | Loading spinner during pagination; sync indicator during WhatsApp sync; non-blocking UX | Positive | P2 | US-18 |
| SC-CHATLIST-030 | Typing indicator (dots) when customer/agent is active; updates via socket; fades after 5s inactivity | Positive | P0 | US-19 |

---

## PRD Ticket - Omnichannel Inbox - Conversation Room
- **Status:** DEVELOPED
- **Surface:** Conversation room — header controls, presence, chat bubbles, message status, reminders, chat actions, ticket creation, thread search, attachments, chat UX (paste/drag-drop), automation, assignment, tagging, logging, rich cards
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-ROOM-001 | Header shows channel icon, avatar (fallback to channel icon), identity per channel rules | Positive | P0 | US |
| SC-ROOM-002 | Header controls: Screenshot (if add-on active), Close (ongoing assigned), More (⋮) menu (alias change, hold/resume, reminder) | Positive | P0 | US |
| SC-ROOM-003 | Actions update instantly (<1s) | Positive | P0 | US |
| SC-ROOM-004 | Presence indicator (green) shown only if channel supports it; updates via socket | Positive | P0 | US |
| SC-ROOM-005 | Typing indicator shows agent names (max 5); >5 shows "and x more"; real-time via socket | Positive | P0 | US |
| SC-ROOM-006 | Agent vs client bubbles visually distinct (color/alignment); private notes styled separately (yellow background) | Positive | P0 | US |
| SC-ROOM-007 | Timestamp: Relative (<7 days) or full date; inline reply-to shows referenced message above | Positive | P0 | US |
| SC-ROOM-008 | Message status: Pending (spinner), Sent (✓), Delivered (✓✓ grey), Read (✓✓ blue), Failed (red with retry) | Positive | P0 | US |
| SC-ROOM-009 | Auto-retry failed messages every 5s (max 3 attempts) | Positive | P0 | US |
| SC-ROOM-010 | Inactive channel prompts relogin popup | Negative | P0 | US |
| SC-ROOM-011 | [UNDEV] Reminder modal: One-time (date+time) or recurring (hourly/daily/weekly/monthly) | Positive | P0 | US |
| SC-ROOM-012 | [UNDEV] Reminder visible in Conversation Details; notifications sent via browser/push at scheduled time | Positive | P0 | US |
| SC-ROOM-013 | [UNDEV] Reminder set info and upcoming reminder shown in chat room history | Positive | P0 | US |
| SC-ROOM-014 | Chat actions: Copy, Pin Conversation, Copy Link to Message; multi-select for bulk | Positive | P0 | US |
| SC-ROOM-015 | Actions logged; failures show toast | Negative | P0 | US |
| SC-ROOM-016 | [UNDEV] Hold/Resume from header; Snooze requires optional note; Resume restores SLA timer; Hold status visible in Chat List and header | State | P1 | US |
| SC-ROOM-017 | Ticket creation from single/multi-select messages; auto-linked to chat; reference ID in Ticket System | Positive | P1 | US |
| SC-ROOM-018 | Thread search highlights keywords; Next/Previous navigation; result counter; filter by date (calendar picker) | Positive | P1 | US |
| SC-ROOM-019 | Support text, images, audio, video, documents, voice notes; max 100MB; invalid format/size shows error toast | Positive | P1 | US |
| SC-ROOM-020 | Download attachment prompts confirmation | Positive | P1 | US |
| SC-ROOM-021 | Ctrl+V pastes text/images from clipboard; image converts to attachment (jpg/png, ≤100MB) | Positive | P1 | US |
| SC-ROOM-022 | Drag & drop files into text area; shows preview before upload; max 100MB; validates format | Positive | P1 | US |
| SC-ROOM-023 | Invalid paste format/size shows toast "Format tidak valid atau ukuran melebihi 100MB" | Negative | P1 | US |
| SC-ROOM-024 | Auto-expand text area on input (up to 5 lines); emoji picker available | Positive | P1 | US |
| SC-ROOM-025 | [UNDEV] Bot auto-reply outside working hours; welcome message during working hours | Positive | P1 | US |
| SC-ROOM-026 | Quick Reply (Macro) templates selectable via dropdown; templates editable by Admin/Supervisor | Positive | P1 | US |
| SC-ROOM-027 | Text input max 2000 characters; Enter sends, Ctrl+Enter adds new line; disabled if empty or upload in progress | Positive | P0 | US |
| SC-ROOM-028 | Assignment: Shows Assigned to, Opened by, Closed by; status Unassigned → Ongoing → Resolved | State | P0 | US |
| SC-ROOM-029 | Resolved chats reopen on new message | State | P0 | US |
| SC-ROOM-030 | Rich cards in Live Chat only: image, title, description, up to 3 buttons; carousel format; API-triggered | Positive | P2 | US |
| SC-ROOM-031 | Connection Lost shows banner "Koneksi terputus" + Retry button | Negative | P0 | US |
| SC-ROOM-032 | WA Session Expired shows "Sesi WA perlu login ulang" + CTA Relogin | Negative | P0 | US |

---

## PRD Ticket - Omnichannel Inbox - Conversation Detail
- **Status:** DEVELOPED
- **Surface:** Conversation detail panel — assignees, SLA countdown, reminder button, conversation attributes, client data, tags, conversation events/timeline, conversation history, notes, pinned messages, media, files, related conversations, broadcast history, custom attributes
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-DETAIL-001 | Team Inbox assignment: single, mandatory; Assignees: multi-select chips with avatar+name | Positive | P0 | US-01, FR-01, FR-02 |
| SC-DETAIL-002 | Unassigned state shows label "Unassigned" + button "Assign Now (Tetapkan Agent)" | Positive | P0 | US-01, AC-01 |
| SC-DETAIL-003 | Assigned state shows assigned agents; allows add/remove | Positive | P0 | US-01, AC-01 |
| SC-DETAIL-004 | First Response Due countdown appears only when Unassigned | State | P0 | US-02, AC-02, FR-03 |
| SC-DETAIL-005 | Time to Close Due countdown until SLA resolution | Positive | P0 | US-02, AC-02, FR-03 |
| SC-DETAIL-006 | Expired SLA shows red badge "SLA terlewati" | Negative | P0 | US-02, AC-02 |
| SC-DETAIL-007 | Reminder appears only if feature activated and only for the user who activated it | Permission | P0 | US-03, AC-03, FR-04 |
| SC-DETAIL-008 | Conversation ID unique and auto-generated | Positive | P0 | US-04, AC-04, FR-05 |
| SC-DETAIL-009 | Channel source displayed; WhatsApp Web shows WA number and name; other channels do not show Channel Name/Number | Positive | P0 | US-04, AC-04, FR-06 |
| SC-DETAIL-010 | Started At timestamp in ISO format | Positive | P0 | US-04, AC-04, FR-07 |
| SC-DETAIL-011 | Dynamic attributes (e.g., SAP AWB) visible and accurate | Positive | P0 | US-04, AC-04 |
| SC-DETAIL-012 | Client data: Name, Phone (masked for Agent), Email, Location (if allowed), OS, Browser (auto-detect if available) | Positive | P0 | US-05, AC-05, FR-08, FR-09, FR-10 |
| SC-DETAIL-013 | Missing optional client data does not break UI | Edge | P0 | AC-05 |
| SC-DETAIL-014 | Tags can be added, edited, removed; changes persist immediately | Positive | P0 | US-06, AC-06, FR-11 |
| SC-DETAIL-015 | All conversation events (assignment, SLA changes, status updates) logged and visible in chronological order | Positive | P0 | US-07, AC-07, FR-12 |
| SC-DETAIL-016 | All past conversations between agent and client displayed chronologically including previous sessions | Positive | P0 | US-07, AC-08, FR-13 |
| SC-DETAIL-017 | Agents can add/edit internal notes; Supervisor/Admin can mention other Agents from notes | Positive | P0 | US-08, AC-09, FR-14 |
| SC-DETAIL-018 | Pinned messages in dedicated section; clicking jumps to original message | Positive | P0 | US-09, AC-10, FR-15 |
| SC-DETAIL-019 | Media (images, videos, audio) viewable inline with download option; unsupported formats show error message | Positive | P0 | US-10, AC-11, FR-16 |
| SC-DETAIL-020 | Files downloadable and viewable; upload validates file type and size | Positive | P0 | US-10, AC-12, FR-17 |
| SC-DETAIL-021 | Related conversations linked and navigable from current conversation | Positive | P1 | US-11, AC-13, FR-18 |
| SC-DETAIL-022 | Broadcast history logged with timestamps and recipient info; accessible for auditing | Positive | P1 | US-12, AC-14, FR-19 |
| SC-DETAIL-023 | Custom attributes from external APIs appear correctly and update dynamically | Positive | P2 | US-13, AC-15, FR-20 |
| SC-DETAIL-024 | Tags max 20 per conversation; pinned max 10; file max 25MB; exceeding blocks action with toast "Batas tercapai" | Negative | P0 | EH |
| SC-DETAIL-025 | Conflict (edit lock) — another user edited same field simultaneously shows "Data diubah oleh pengguna lain. Silakan refresh." | Negative | P0 | EH |

---

## PRD Ticket - Omnichannel Inbox - Get New Conversation (Agent Pull Queue)
- **Status:** DEVELOPED
- **Surface:** Pull-based queue — agent clicks "Get Conversation", FIFO ordering, editable batch size, auto-assign, timeout return, max active limit, supervisor manual assign
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-PULL-001 | Agent clicks "Get Conversation"; conversations assigned FIFO from queue | Positive | P0 | US (P0) |
| SC-PULL-002 | Default batch = total queue count; editable to smaller number; min = 1 | Positive | P0 | US (P0) |
| SC-PULL-003 | Conversation status changes to "Assigned to Agent" immediately upon pull | Positive | P0 | US (P0) |
| SC-PULL-004 | Pulled conversation appears in "Your Inbox" tab | Positive | P0 | US (P0) |
| SC-PULL-005 | Editable numeric batch field shown next to "Get Conversation"; default = total queue count | Positive | P0 | US (P0) |
| SC-PULL-006 | Supervisor/Admin can assign chats manually from Unassigned tab to self or other agents | Positive | P1 | US (P1) |
| SC-PULL-007 | System shows warning "Maximum active conversations reached" when agent at concurrent limit | Negative | P1 | US (P1) |
| SC-PULL-008 | Max concurrent conversation limit configurable in settings by Supervisor/Admin | Positive | P1 | US (P1) |
| SC-PULL-009 | Timeout return to queue: setting toggle ON/OFF in Inbox > General Settings; if enabled, inactive chat returns after [X] minutes | Positive | P2 | US (P2) |
| SC-PULL-010 | Max conversation limit toggle ON/OFF in Inbox > General Settings; if enabled, configurable min 1 | Positive | P2 | US (P2) |
| SC-PULL-011 | Agents see only their closed chats in Closed tab; Supervisors/Admin see all team chats | Permission | P2 | US (P2) |
| SC-PULL-012 | Queue empty shows toast "No conversations available" | Negative | P0 | EH |
| SC-PULL-013 | API/socket failure shows toast "Failed to fetch conversation, please retry" | Negative | P0 | EH |
| SC-PULL-014 | Invalid batch number resets to default queue count | Negative | P0 | EH |

---

## PRD Ticket - Omnichannel Chat Sessions (Group Handling + Multi-number Send as)
- **Status:** DEVELOPED
- **Surface:** Session lifecycle parity across channels, group handling (metadata, quoted replies), multi-number "Send as", SLA carry-over, ownership decoupling, room history
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-SESSIONS-001 | New message with no open session creates new session in Unassigned and binds opener message | Positive | P0 | US-001, FR-001 |
| SC-SESSIONS-002 | Burst arrivals within dedupe window create only one session per conversation context | Edge | P0 | US-001, FR-017 |
| SC-SESSIONS-003 | New session appears in team's Unassigned list with status "Unassigned" (pull system) | Positive | P0 | US-002, FR-002 |
| SC-SESSIONS-004 | Opening Unassigned session shows channel, status, group (if applicable), SLA summary | Positive | P0 | US-002 |
| SC-SESSIONS-005 | New message after Resolved creates new Unassigned session; prior stays in Room History | State | P0 | US-003, FR-003 |
| SC-SESSIONS-006 | New session links to related previous session in Chat History Room | Positive | P0 | US-003, FR-003 |
| SC-SESSIONS-007 | Agent pulling Unassigned session claims it; race condition: exactly one succeeds, other gets conflict toast | Edge | P0 | US-004 |
| SC-SESSIONS-008 | Assign/unassign/reassign updates ownership, carries SLA, and writes audit | Positive | P0 | US-005, FR-006 |
| SC-SESSIONS-009 | Assign/unassign/reassign UX behavior is consistent across channels | Positive | P0 | US-005, FR-006 |
| SC-SESSIONS-010 | Resolving session changes status to Resolved, moves to Room History with timestamp | State | P0 | US-006 |
| SC-SESSIONS-011 | Opening Resolved session shows it read-only | Positive | P0 | US-006 |
| SC-SESSIONS-012 | Quoted inbound context preserved across sessions: shows quoted preview + deeplink to historical anchor | Positive | P0 | US-007, FR-004 |
| SC-SESSIONS-013 | Quoted reply to very old message shows stub preview if beyond retention; keeps case link | Edge | P0 | US-007, EC-002 |
| SC-SESSIONS-014 | Group metadata changes (subject/icon/participants) inject system message without changing state or routing | Positive | P0 | US-008, FR-005 |
| SC-SESSIONS-015 | Frequent group metadata changes collapse/group similar events to reduce noise | Edge | P0 | US-008, EC-004 |
| SC-SESSIONS-016 | Session identity defaults to number that received opener message | Positive | P0 | US-009, FR-014 |
| SC-SESSIONS-017 | Later inbound via different connected number appends to same session; outbound uses session identity unless overridden | Positive | P0 | US-009, EC-005 |
| SC-SESSIONS-018 | "Send as" selector preselects session identity, lists eligible identities for that group | Positive | P0 | US-010, FR-015 |
| SC-SESSIONS-019 | Changing identity at send time uses chosen identity; shows confirmation badge; writes audit event | Positive | P0 | US-010, FR-015 |
| SC-SESSIONS-020 | SLA does not reset on reassign/unassign; inherited timing visible | Positive | P0 | US-011, FR-007 |
| SC-SESSIONS-021 | SLA breach attribution follows team responsible at breach time | Positive | P0 | US-011 |
| SC-SESSIONS-022 | Open conversations remain with original team after number remap (legacy-bound) | Positive | P0 | US-012, FR-010, FR-011 |
| SC-SESSIONS-023 | Closed thread receiving inbound after remap shows reopen routing modal (default Keep old team) and creates new session | Positive | P0 | US-012, FR-012 |
| SC-SESSIONS-024 | On move: assignee resets to Unassigned, SLA stops immediately | State | P0 | FR-016 |
| SC-SESSIONS-025 | On reopen in same team: SLA resumes per policy | State | P0 | FR-016 |
| SC-SESSIONS-026 | Escalation-only inbox (no inbound number) is fully operable for moved-in conversations; sender picker shown if needed | Positive | P1 | US-014, FR-013, EC-008 |
| SC-SESSIONS-027 | Claim race conflict shows toast "This conversation was taken by another agent" | Negative | P0 | EH-001 |
| SC-SESSIONS-028 | Unauthorized action blocked; state unchanged; shows "You do not have permission for this action" | Negative | P0 | EH-002 |
| SC-SESSIONS-029 | Invalid state transition keeps current state; shows toast "Action is invalid in the current status" | Negative | P0 | EH-004 |
| SC-SESSIONS-030 | Default sender unavailable forces sender picker; blocks send until valid | Negative | P0 | EH-008 |

---

## PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble
- **Status:** DEVELOPED
- **Surface:** Multi-draft ticket creation from single bubble, cookie-persisted drafts, single-bubble multi-draft modal vs multi-select batch create, bubble ticket badge
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-MULTITKT-001 | Selecting exactly 1 bubble and clicking "Buat tiket" opens modal with 1 ticket draft | Positive | P0 | US-001, FR-001, FR-002, FR-003 |
| SC-MULTITKT-002 | Clicking "Tambah tiket" appends a new numbered draft | Positive | P0 | US-001, FR-005 |
| SC-MULTITKT-003 | Removing a draft reindexes remaining drafts; at least 1 draft always remains | Positive | P0 | US-001, FR-006 |
| SC-MULTITKT-004 | Submitting all valid drafts creates 1 ticket per draft; each linked to selected bubble | Positive | P0 | US-001, FR-009, FR-010 |
| SC-MULTITKT-005 | Submit blocked when any draft invalid; each invalid draft shows field errors + top summary "Ada data tiket yang belum lengkap" | Negative | P0 | US-001, FR-013, FR-014, EH-001 |
| SC-MULTITKT-006 | Draft auto-saved to cookies after 1 second of inactivity per field change | Positive | P0 | US-002, FR-017 |
| SC-MULTITKT-007 | Closing modal or refreshing page; reopening "Buat tiket" on same bubble restores drafts with banner "Draft dipulihkan" | Positive | P0 | US-002 |
| SC-MULTITKT-008 | Clicking "Buang draft" clears all drafts and resets modal to 1 empty draft | Positive | P0 | US-002 |
| SC-MULTITKT-009 | Draft cookies deleted after successful ticket creation | Positive | P0 | US-002 |
| SC-MULTITKT-010 | Selecting 2+ bubbles and clicking "Buat tiket" opens batch UI with 1 form per bubble; "Tambah tiket" hidden | Positive | P0 | US-003, FR-004 |
| SC-MULTITKT-011 | Multi-select submit creates N tickets for N bubbles; each links only to its corresponding bubble | Positive | P0 | US-003 |
| SC-MULTITKT-012 | Deselecting bubbles until 1 remains switches modal to single-bubble mode and shows "Tambah tiket" | State | P0 | US-003 |
| SC-MULTITKT-013 | Bubble shows badge "Tiket: X" when tickets linked | Positive | P1 | US-004, FR-022 |
| SC-MULTITKT-014 | Clicking "Tiket: X" shows list of linked tickets; each opens | Positive | P1 | US-004, FR-023 |
| SC-MULTITKT-015 | Adding 20 drafts blocks "Tambah tiket" and shows "Maksimal 20 tiket dalam sekali proses" | Negative | P0 | EC-001 |
| SC-MULTITKT-016 | Drafts isolated per bubble; opening drafts for two different bubbles does not mix | Edge | P0 | EC-002 |
| SC-MULTITKT-017 | Editing drafts in two tabs: last save wins; restored state may show "Draft diperbarui" | Edge | P1 | EC-003 |
| SC-MULTITKT-018 | Cookie size limit exceeded stops auto-save and warns "Draft terlalu besar untuk disimpan otomatis" | Negative | P1 | EC-004 |
| SC-MULTITKT-019 | Network timeout keeps drafts; shows "Koneksi bermasalah. Coba lagi" + retry button | Negative | P0 | EH-003 |
| SC-MULTITKT-020 | Partial create failure shows per-draft status; retry button for failed drafts only | Negative | P0 | EH-004, FR-015 |
| SC-MULTITKT-021 | Duplicate submit within 10 minutes ignored via idempotency key; shows "Permintaan sedang diproses" | Negative | P0 | EH-007, FR-016 |
| SC-MULTITKT-022 | Reference message unavailable blocks submit; shows "Pesan referensi tidak tersedia" | Negative | P0 | EH-006 |
| SC-MULTITKT-023 | Cookie write failure shows banner "Draft gagal disimpan otomatis. Periksa pengaturan browser" | Negative | P1 | EH-002 |
| SC-MULTITKT-024 | Attachment fields not persisted in cookies; require re-attach after restore; shows "Lampiran perlu diunggah ulang" | Edge | P1 | EC-007 |

---

## PRD Ticket - Team Inbox Member Drawer and Online Status HUD
- **Status:** DEVELOPED
- **Surface:** Member drawer and header HUD — total/online counts, member list with presence and last seen, supervisor section, search/filter, add/remove existing users, auto-unassign on removal
- **Scenarios:**

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-MEMBERHUD-001 | HUD shows `Anggota {n} • Online {m}` in Team Inbox header | Positive | P0 | US-001, FR-001 |
| SC-MEMBERHUD-002 | Online count includes Active + Away; Active-to-Away transition does not change count | Positive | P0 | US-001, FR-002 |
| SC-MEMBERHUD-003 | Presence unavailable: HUD shows `Online -`; Inbox remains usable | Negative | P0 | US-001, FR-004 |
| SC-MEMBERHUD-004 | Clicking HUD opens Member Drawer | Positive | P0 | US-002, FR-005 |
| SC-MEMBERHUD-005 | Presence updates in drawer refresh list and counts without page reload | Positive | P0 | US-002, FR-013 |
| SC-MEMBERHUD-006 | No Team Inbox access shows "Akses ditolak"; drawer does not open | Permission | P0 | US-002, EH-001 |
| SC-MEMBERHUD-007 | Supervisors section appears at top of drawer listing supervisors first | Positive | P0 | US-003, FR-007, FR-014 |
| SC-MEMBERHUD-008 | No supervisors shows "Belum ada supervisor" | Edge | P0 | US-003 |
| SC-MEMBERHUD-009 | Search filters by name or email with 300ms debounce | Positive | P0 | US-004, FR-012 |
| SC-MEMBERHUD-010 | Online filter shows only Active + Away members | Positive | P0 | US-004, FR-010 |
| SC-MEMBERHUD-011 | Offline filter shows only Offline members | Positive | P0 | US-004, FR-011 |
| SC-MEMBERHUD-012 | No results shows "Tidak ada hasil" and keeps search term | Edge | P0 | US-004 |
| SC-MEMBERHUD-013 | "Tambah anggota" opens Add Member modal for existing users; multi-select up to 50 | Positive | P0 | US-005, FR-025, FR-026 |
| SC-MEMBERHUD-014 | Already-member in picker disabled with "Anggota sudah terdaftar" | Negative | P0 | US-005, EH-004 |
| SC-MEMBERHUD-015 | No permission: "Tambah anggota" hidden or disabled | Permission | P0 | US-005, FR-024 |
| SC-MEMBERHUD-016 | After successful add, drawer list and HUD counts update immediately | Positive | P0 | US-005, FR-028 |
| SC-MEMBERHUD-017 | "Hapus dari tim" on member shows confirmation modal | Positive | P0 | US-006, FR-031 |
| SC-MEMBERHUD-018 | Confirming removal removes member and updates counts | Positive | P0 | US-006, FR-033 |
| SC-MEMBERHUD-019 | Removing last supervisor blocked with "Minimal 1 supervisor harus tetap ada" | Negative | P0 | US-006, EH-006, FR-035 |
| SC-MEMBERHUD-020 | Removed member who was assignee has conversations auto-unassigned (assignee set to null); action logged | State | P0 | US-006, FR-036, FR-037 |
| SC-MEMBERHUD-021 | Away/Offline member with last seen shows relative time (e.g., "5 menit lalu") | Positive | P0 | US-007, FR-020 |
| SC-MEMBERHUD-022 | Active member last seen shows "Aktif sekarang" | Positive | P0 | US-007, FR-021 |
| SC-MEMBERHUD-023 | Last seen unavailable shows "-" | Edge | P0 | US-007, FR-022 |
| SC-MEMBERHUD-024 | Team Inbox has 0 members: HUD shows "Anggota 0 • Online 0"; drawer shows "Belum ada anggota" | Edge | P0 | EC-001 |

---

## Part B: Features & Permissions — 234 scenarios

> **Status mix:** DEVELOPED (88) + UNDEVELOPED (96) + PARTIAL (50) · `[UNDEV]` marks coverage-blocked rows

## Summary

| PRD | Surface | Status | #Scenarios |
|-----|---------|--------|------------|
| Conversation and Ticket Response Metrics Tracking | Conversation/Ticket Detail timers + Offline Report export | DEVELOPED | 42 |
| Omnichannel Inbox - Conversation Ownership Decoupling | Team Inbox ownership, move, reopen, sender | DEVELOPED | 24 |
| Ticketing V2 | Ticket creation from chat, SLA, state machine, ticket room | DEVELOPED | 22 |
| Assignees and Collaborators Permission Model | Multi-assignee + Collaborator role | PARTIAL (multi-assignee DEV, collaborator role UNDEV) | 28 |
| Conversation Custom Attributes (Single + Collections) | Sidebar custom fields + collections | PARTIAL (single attrs DEV, collections/repeatable UNDEV) | 22 |
| Availability Auto-Reply with Conversation and Ticket Templates | Auto-reply settings, triggers, templates | UNDEVELOPED | 36 |
| Conversation Snooze (Conversation List) | Snooze chip, auto-unsnooze, wake | UNDEVELOPED | 18 |
| Omnichannel Inbox - Related Conversations Grouping | Match keys, drawer, grouped list/room | UNDEVELOPED | 24 |
| WhatsApp Group Mention in Conversation (WhatsApp Web) | @mention picker, send, render, internal label | UNDEVELOPED | 18 |
| **TOTAL** | | | **234** |

---

## PRD Ticket - Conversation and Ticket Response Metrics Tracking
- **Status:** DEVELOPED
- **Surface:** Conversation Detail and Ticket Detail live metric timers (RLT/Wait Time), Offline Report export columns, metric persistence
- **Note:** Metrics compute developed. Wait-Time adjusted = raw in Phase 1 (no queue pause policy yet) — this is a known gap per PRD §15 Limitations.

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-METRICS-001 | Wait Time calculated as T2 − T1 when conversation is assigned | Positive | P0 | US-001, FR-013 |
| SC-METRICS-002 | Wait Time empty and status Incomplete when conversation never assigned | Negative | P0 | US-001, FR-020 |
| SC-METRICS-003 | Wait Time empty with quality flag when T1 is missing/invalid | Negative | P0 | US-001, EH-001, EH-002 |
| SC-METRICS-004 | RLT calculated as T3 − T2 when first successful customer-facing reply sent | Positive | P0 | US-002, FR-014 |
| SC-METRICS-005 | RLT not completed when first reply is internal note | Negative | P0 | US-002, FR-011 |
| SC-METRICS-006 | RLT not completed when first reply fails to send | Negative | P0 | US-002, EH-005 |
| SC-METRICS-007 | No SLA breach created for RLT or Wait Time regardless of value | Regression | P0 | US-003, FR-004 |
| SC-METRICS-008 | Existing FRT and TTC behavior unchanged with metrics enabled | Regression | P0 | US-003, FR-005 |
| SC-METRICS-009 | Reassignment before first reply: primary RLT starts from first assignment | Edge | P0 | US-004, FR-046 |
| SC-METRICS-010 | First responder = agent who replies (not first assignee) after reassignment | Positive | P0 | US-004, FR-049, FR-056 |
| SC-METRICS-011 | Reassignment after first reply: FRT/RLT/Wait Time unchanged | Regression | P0 | US-004, FR-047 |
| SC-METRICS-012 | Multi-assignees added simultaneously: T2 uses earliest assignment | Edge | P0 | US-005, FR-054 |
| SC-METRICS-013 | Multi-assignees: first responder is replying agent | Positive | P0 | US-005, FR-056 |
| SC-METRICS-014 | Multi-assignees none reply: RLT remains incomplete | Edge | P0 | US-005 |
| SC-METRICS-015 | AUX exclusion from adjusted RLT when all agents in AUX and policy excludes | Positive | P0 | US-006, FR-068 |
| SC-METRICS-016 | AUX not paused when at least one assignee is available | Edge | P0 | US-006, FR-069 |
| SC-METRICS-017 | AUX included when workspace policy counts AUX time | Positive | P0 | US-006 |
| SC-METRICS-018 | Snooze before first reply: adjusted RLT excludes only if SLA pause policy allows | Edge | P0 | US-007, FR-073 |
| SC-METRICS-019 | Waiting on Customer before first reply: quality flag stored | Edge | P0 | US-007, FR-074, EC-013 |
| SC-METRICS-020 | Wait Time not paused by Snooze/AUX/Waiting on Customer | Regression | P0 | US-007, FR-075 |
| SC-METRICS-021 | Linked ticket uses conversation response metrics | Positive | P0 | US-008, FR-084, FR-085 |
| SC-METRICS-022 | Internal-only ticket shows Not Applicable | Positive | P0 | US-008, FR-087 |
| SC-METRICS-023 | Ticket linked after first response inherits completed metrics, no duplicate cycle | Edge | P0 | US-008, FR-085, EC-008 |
| SC-METRICS-024 | Conversation Offline Report includes RLT and Wait Time columns | Positive | P0 | US-009, FR-099 |
| SC-METRICS-025 | Ticket Offline Report includes RLT and Wait Time columns | Positive | P0 | US-009, FR-100 |
| SC-METRICS-026 | Not Applicable/Incomplete metrics export as readable value not zero | Positive | P0 | US-009, FR-104, FR-105, FR-106 |
| SC-METRICS-027 | Metric record stores T1, T2, T3, raw/adjusted duration, status, quality flags | Positive | P0 | US-010, FR-092 |
| SC-METRICS-028 | Correction job recalculates and preserves previous calculation timestamp | Edge | P0 | US-010 |
| SC-METRICS-029 | Invalid duration detected → status Invalid, not exported as zero | Negative | P0 | US-010, FR-021 |
| SC-METRICS-030 | Wait Time live timer running in Conversation Detail (T1 exists, no T2) | Positive | P0 | US-011, FR-030 |
| SC-METRICS-031 | RLT live timer running in Conversation Detail (T2 exists, no T3) | Positive | P0 | US-011, FR-032 |
| SC-METRICS-032 | Timer stops and shows final duration after T3 | Positive | P0 | US-011, FR-033, FR-034 |
| SC-METRICS-033 | No alert/breach/notification triggered by RLT or Wait Time | Regression | P0 | US-011, FR-039 |
| SC-METRICS-034 | Linked Ticket Detail shows same Wait Time and RLT from conversation | Positive | P0 | US-012, FR-084 |
| SC-METRICS-035 | Internal-only ticket Detail shows Not Applicable | Positive | P0 | US-012, FR-087 |
| SC-METRICS-036 | Adjusted vs raw RLT distinguishable in tooltip/export | Positive | P1 | US-013, FR-024, FR-027 |
| SC-METRICS-037 | No pause interval: adjusted RLT equals raw RLT | Positive | P1 | US-013 |
| SC-METRICS-038 | Incomplete pause data: raw RLT kept, quality flag stored | Edge | P1 | US-013, EH-013 |
| SC-METRICS-039 | Team Inbox routing alone does not complete T2 (wait continues) | Negative | P0 | FR-061, EC-006, EC-032 |
| SC-METRICS-040 | Client timer drift corrected on server timestamp sync | Edge | P1 | FR-036, EH-018, EH-023 |
| SC-METRICS-041 | Duplicate event received: idempotent calculation, no duplicate rows | Regression | P0 | FR-094, EH-024, EC-018 |
| SC-METRICS-042 | Overlapping pause intervals merged before adjusted calculation | Edge | P1 | FR-077, EH-014 |

---

## PRD Ticket - Omnichannel Inbox - Conversation Ownership Decoupling (Team Inbox x Channel Numbers)
- **Status:** DEVELOPED
- **Surface:** Team Inbox conversation ownership, sticky legacy binding, manual move, reopen modal, sender picker, escalation-only inboxes

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-OWNERSHIP-001 | Open conversation stays in original team after number remap (sticky legacy binding) | Positive | P0 | US-001, FR-003 |
| SC-OWNERSHIP-002 | Legacy-bound badge displayed in conversation header | Positive | P0 | US-001, FR-008 |
| SC-OWNERSHIP-003 | Closed conversation + LEGACY_TTL exceeded → new conversation in current owner team | Edge | P0 | US-001, FR-019 |
| SC-OWNERSHIP-004 | New inbound to open legacy thread: appends to old team conversation | Positive | P0 | US-002, FR-003 |
| SC-OWNERSHIP-005 | No open match: new conversation created in current owner team | Positive | P0 | US-002, FR-004 |
| SC-OWNERSHIP-006 | Routing decision recorded in audit log | Positive | P0 | US-002, FR-012 |
| SC-OWNERSHIP-007 | Bulk remap: no existing conversations auto-moved | Positive | P0 | US-003, FR-009 |
| SC-OWNERSHIP-008 | Escalation-only inbox: conversation moved in is fully operable | Positive | P0 | US-104, FR-010 |
| SC-OWNERSHIP-009 | Escalation-only inbox: no new external conversations auto-created | Positive | P0 | US-104 |
| SC-OWNERSHIP-010 | Escalation-only inbox: reply requires sender picker if default unavailable | Edge | P0 | US-104 |
| SC-OWNERSHIP-011 | Manual move preserves full history (messages, files, tags, timestamps) | Positive | P0 | US-004, FR-006 |
| SC-OWNERSHIP-012 | Move resets assignee to Unassigned and stops SLA immediately | Positive | P0 | US-004, FR-006, FR-015 |
| SC-OWNERSHIP-013 | Move banner shown: origin, destination, actor, timestamp | Positive | P0 | US-004, FR-007 |
| SC-OWNERSHIP-014 | Reopen modal shown for closed legacy thread with remapped number | Positive | P0 | US-006, FR-005 |
| SC-OWNERSHIP-015 | Reopen modal default = Keep in Old Team | Positive | P0 | US-009, FR-005 |
| SC-OWNERSHIP-016 | Default sender logic: last successful sender used first | Positive | P1 | US-007, FR-011 |
| SC-OWNERSHIP-017 | Sender unavailable: picker shown with permitted alternatives | Edge | P1 | US-007, EH-004 |
| SC-OWNERSHIP-018 | Cross-team history visible after move or legacy binding | Positive | P1 | US-008, FR-014 |
| SC-OWNERSHIP-019 | Move failed: ownership unchanged, retry option shown | Negative | P0 | EH-001, FR-017 |
| SC-OWNERSHIP-020 | Double-move conflict: idempotent check, latest state shown | Negative | P0 | EH-002, FR-013 |
| SC-OWNERSHIP-021 | Reopen choice race: last write wins, other agent notified | Edge | P0 | EH-003 |
| SC-OWNERSHIP-022 | Mapping missing/invalid: route to Default Team Inbox with banner | Negative | P0 | FR-018, EH-005 |
| SC-OWNERSHIP-023 | Move to same team (no-op): blocked with toast | Edge | P1 | EC-006 |
| SC-OWNERSHIP-024 | Mapping settings UI states "affects new chats only" | Positive | P0 | FR-016, UI-005 |

---

## PRD Ticket - Ticketing V2
- **Status:** DEVELOPED
- **Surface:** Ticket creation from chat bubbles/list, state machine, dual SLA tracking, ticket room

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-TICKETV2-001 | Create ticket from selected chat bubbles with linked message references | Positive | P0 | US-01, AC-01, FR-01 |
| SC-TICKETV2-002 | Create ticket from conversation list with auto-fetched context | Positive | P0 | US-02, AC-02, FR-01 |
| SC-TICKETV2-003 | Messages after ticket creation auto-tagged with is_ticket_message=true | Positive | P0 | AC-03, FR-02 |
| SC-TICKETV2-004 | Ticket header displays linked conversation, ticket type, ticket number | Positive | P0 | AC-04 |
| SC-TICKETV2-005 | Chat SLA and Ticket SLA tracked independently | Positive | P0 | US-04, AC-05, FR-04 |
| SC-TICKETV2-006 | State machine: Submitted → On Process → Waiting On Customer → Resolved | Positive | P0 | AC-06, FR-03 |
| SC-TICKETV2-007 | Admin can reopen Resolved ticket | Positive | P0 | AC-07 |
| SC-TICKETV2-008 | Notifications sent for new tickets, SLA warnings, reassignment | Positive | P0 | AC-08, FR-07 |
| SC-TICKETV2-009 | All ticket actions logged in timeline (create, assign, edit, SLA, status) | Positive | P0 | AC-09, FR-06 |
| SC-TICKETV2-010 | SLA runs when status is Submitted/In Progress (agent holds ball) | Positive | P0 | FR-04, §6.1 |
| SC-TICKETV2-011 | SLA pauses when Waiting on Customer | Positive | P0 | FR-04, §6.1 |
| SC-TICKETV2-012 | SLA stops when Resolved | Positive | P0 | FR-04, §6.1 |
| SC-TICKETV2-013 | SLA restarts on Reopen | Positive | P0 | FR-04, §6.1 |
| SC-TICKETV2-014 | Chat bubble deleted before ticket creation: button disabled | Negative | P0 | EH - Invalid Bubble |
| SC-TICKETV2-015 | Duplicate ticket on same conversation blocked | Negative | P0 | EH - Duplicate Context |
| SC-TICKETV2-016 | Template API down: retry x3, fallback default form | Negative | P1 | EH - Template Fetch Failed |
| SC-TICKETV2-017 | Illegal state transition blocked (e.g. Resolved → Submitted) | Negative | P0 | EH - State Transition Invalid |
| SC-TICKETV2-018 | Assign/reassign ticket to agents/team inbox | Positive | P0 | US-03, FR-05 |
| SC-TICKETV2-019 | Ticket List page shows all tickets; assigned agents can update status | Positive | P0 | FR-11, US-08 |
| SC-TICKETV2-020 | Agent can chat client via Ticket Room for follow-up | Positive | P0 | FR-12, US-09 |
| SC-TICKETV2-021 | Invalid/inactive agent ID blocks assignment save | Negative | P1 | EH - Assignment Error |
| SC-TICKETV2-022 | SLA engine timeout: queue retry, no blocking | Negative | P1 | EH - SLA Engine Timeout |

---

## PRD Ticket - Assignees and Collaborators Permission Model
- **Status:** PARTIAL (multi-assignee DEVELOPED; collaborator role UNDEVELOPED)
- **Surface:** Multi-assignee list, Collaborator role, permission separation, promotion, activity log

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-COLLAB-001 | Assignee can reply to customer (Balas pelanggan enabled) | Positive | P0 | US-001, FR-005 |
| SC-COLLAB-002 | Assignee can perform open/close/reopen/resolve based on RBAC | Positive | P0 | US-001, FR-007 |
| SC-COLLAB-003 | Non-assignee user blocked from customer reply | Negative | P0 | US-001 |
| SC-COLLAB-004 | [UNDEV] Collaborator can view conversation/ticket per Team Inbox visibility | Positive | P0 | US-002, FR-009 |
| SC-COLLAB-005 | [UNDEV] Collaborator can add internal notes (Catatan internal) | Positive | P0 | US-002, FR-010 |
| SC-COLLAB-006 | [UNDEV] Collaborator blocked from customer reply (Balas pelanggan disabled) | Negative | P0 | US-002, FR-011 |
| SC-COLLAB-007 | [UNDEV] Collaborator blocked from close/reopen/resolve actions | Negative | P0 | US-002, FR-012 |
| SC-COLLAB-008 | [UNDEV] Add active user as Collaborator | Positive | P0 | US-003, FR-014 |
| SC-COLLAB-009 | [UNDEV] Block adding inactive user as Collaborator | Negative | P0 | US-003, FR-015, EH-003 |
| SC-COLLAB-010 | [UNDEV] Block adding existing Assignee as Collaborator | Negative | P0 | US-003, FR-016, EH-001 |
| SC-COLLAB-011 | [UNDEV] Promote Collaborator to Assignee: auto-removed from Collaborators | Positive | P0 | US-004, FR-019 |
| SC-COLLAB-012 | [UNDEV] Promotion is atomic: rollback on failure keeps Collaborator state | Edge | P0 | US-004, FR-020, FR-021 |
| SC-COLLAB-013 | [UNDEV] Promotion logged in activity log | Positive | P1 | US-006, FR-022 |
| SC-COLLAB-014 | [UNDEV] Role labels: Assignee chip under "Assignee", Collaborator under "Kolaborator" | Positive | P0 | US-005 |
| SC-COLLAB-015 | [UNDEV] Disabled reply tooltip: "Hanya assignee yang dapat membalas pelanggan" | Positive | P0 | US-005 |
| SC-COLLAB-016 | [UNDEV] Collaborator added/removed/promoted events logged | Positive | P1 | US-006, FR-034, FR-035, FR-036 |
| SC-COLLAB-017 | [UNDEV] @mention Collaborator in internal note; notification sent | Positive | P1 | US-007 |
| SC-COLLAB-018 | [UNDEV] Mentioned Collaborator removed before save: note saves, delivery skipped | Edge | P1 | US-007 |
| SC-COLLAB-019 | Removing Assignee does NOT auto-add as Collaborator | Positive | P0 | FR-023 |
| SC-COLLAB-020 | [UNDEV] Bulk add Collaborators: skip invalid, show summary | Edge | P1 | FR-018, EC-007 |
| SC-COLLAB-021 | [UNDEV] Same user in both lists via API: Assignee wins, overlap removed | Edge | P0 | EC-012, FR-004 |
| SC-COLLAB-022 | [UNDEV] Collaborator opens closed ticket: view + internal notes allowed | Edge | P1 | EC-004 |
| SC-COLLAB-023 | [UNDEV] Collaborator removed while typing note: save blocked if no permission | Edge | P1 | EC-005 |
| SC-COLLAB-024 | Assignee removed while composing reply: send blocked, draft remains | Edge | P0 | EC-006 |
| SC-COLLAB-025 | [UNDEV] Supervisor removes last Assignee: block if policy requires min 1 | Negative | P0 | EC-009 |
| SC-COLLAB-026 | [UNDEV] Object moved to another Team: invalid Collaborators removed per policy | Edge | P1 | EC-010 |
| SC-COLLAB-027 | [UNDEV] Collaborator loses Team Inbox access: removed or inaccessible | Edge | P1 | EC-011 |
| SC-COLLAB-028 | [UNDEV] Ticket Collaborators follow same permission as Conversation Collaborators | Positive | P0 | FR-030, FR-031, FR-032, FR-033 |

---

## PRD Ticket - Conversation Custom Attributes (Single + Collections)
- **Status:** PARTIAL (single custom attributes DEVELOPED; Collections/repeatable UNDEVELOPED)
- **Surface:** Sidebar custom attributes, field definitions, collection CRUD, search by attributes

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-ATTRS-001 | Not all fields shown by default; user adds field on demand | Positive | P0 | US-001, FR-012 |
| SC-ATTRS-002 | Cancel adding field: no changes saved | Positive | P0 | US-001 |
| SC-ATTRS-003 | ui_editable=true field value editable and saved immediately | Positive | P0 | US-002, FR-013 |
| SC-ATTRS-004 | ui_editable=false field input disabled, not editable | Negative | P0 | US-002, FR-014 |
| SC-ATTRS-005 | No permission user: editing controls hidden/disabled | Negative | P0 | US-002, FR-033 |
| SC-ATTRS-006 | Remove action on ui_editable=true field with confirmation | Positive | P0 | US-003, FR-016, FR-017 |
| SC-ATTRS-007 | Remove blocked on ui_editable=false field | Negative | P0 | US-003, FR-018 |
| SC-ATTRS-008 | Admin can create new field definition from picker | Positive | P0 | US-007, FR-008 |
| SC-ATTRS-009 | Non-Admin blocked from creating field definitions | Negative | P0 | US-007, FR-008, EH-003 |
| SC-ATTRS-010 | Dropdown definition requires at least 1 option | Positive | P0 | US-008, EH-001 |
| SC-ATTRS-011 | Dropdown with options: value selector enabled for agent | Positive | P0 | US-008 |
| SC-ATTRS-012 | Integration updates value on ui_editable=false field (allowed) | Positive | P0 | US-009, FR-015 |
| SC-ATTRS-013 | Search conversations by custom attribute text value | Positive | P0 | US-010, FR-026 |
| SC-ATTRS-014 | Search matches inside collection values | Positive | P0 | US-010, FR-027 |
| SC-ATTRS-015 | Search by dropdown label matches stored value | Positive | P0 | US-010 |
| SC-ATTRS-016 | [UNDEV] Create collection: starts empty with zero fields | Positive | P0 | US-004, FR-019 |
| SC-ATTRS-017 | [UNDEV] Multiple collections shown as compact rows with title + expand | Positive | P0 | US-004 |
| SC-ATTRS-018 | [UNDEV] Single collection: flat mode without collection header | Positive | P0 | US-004, FR-022 |
| SC-ATTRS-019 | [UNDEV] Collection title uses name; fallback to last two non-empty values; "Tanpa judul" if none | Positive | P0 | US-005, FR-023, FR-024, FR-025 |
| SC-ATTRS-020 | [UNDEV] Rename collection inline; delete with confirmation | Positive | P0 | US-006, FR-020, FR-021 |
| SC-ATTRS-021 | Duplicate field definition label blocked (case-insensitive) | Negative | P0 | FR-009, EH-002 |
| SC-ATTRS-022 | [UNDEV] Pagination: "X lainnya" for many collections | Positive | P1 | US-011 |

---

## PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates
- **Status:** UNDEVELOPED
- **Surface:** Auto-reply settings (triggers, templates, frequency, delay/cancel), SatuInbox Bot sender, timeline logging

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-AUTOREPLY-001 | Admin enables Availability Auto-Reply; triggers and templates configured | Positive | P0 | US-001, FR-004, FR-005 |
| SC-AUTOREPLY-002 | Auto-reply disabled: no auto-reply sent on inbound | Positive | P0 | US-001, FR-005 |
| SC-AUTOREPLY-003 | Enabled with no trigger: save blocked | Negative | P0 | US-001, FR-006, EH-001 |
| SC-AUTOREPLY-004 | Outside office hours trigger: auto-reply sent when message outside General Office Hours | Positive | P0 | US-002, FR-009, FR-016 |
| SC-AUTOREPLY-005 | Outside office hours enabled but Office Hours not configured: save blocked | Negative | P0 | US-002, FR-018, EH-002 |
| SC-AUTOREPLY-006 | Inside office hours: no auto-reply sent for this trigger | Positive | P0 | US-002 |
| SC-AUTOREPLY-007 | No agent available trigger: auto-reply when zero eligible agents | Positive | P0 | US-003, FR-010, FR-019 |
| SC-AUTOREPLY-008 | At least one eligible agent: no auto-reply for this trigger | Positive | P0 | US-003 |
| SC-AUTOREPLY-009 | Availability check fails: no auto-reply from this trigger, failure logged | Negative | P0 | US-003, FR-023, EH-010 |
| SC-AUTOREPLY-010 | Both triggers match: one auto-reply sent, reason = Outside office hours | Edge | P0 | US-003, FR-013, FR-014 |
| SC-AUTOREPLY-011 | Auto-reply sender shown as "SatuInbox Bot" | Positive | P0 | US-004, FR-046 |
| SC-AUTOREPLY-012 | Bot reply excluded from FRT/ART/Ticket SLA/agent performance | Positive | P0 | US-005, FR-048 |
| SC-AUTOREPLY-013 | Separate Conversation and Ticket templates required | Positive | P0 | US-006, FR-031, FR-034 |
| SC-AUTOREPLY-014 | Conversation template empty: save blocked | Negative | P0 | US-006, EH-003 |
| SC-AUTOREPLY-015 | Ticket template empty: save blocked | Negative | P0 | US-006, EH-004 |
| SC-AUTOREPLY-016 | Active ticket context: Ticket template used | Positive | P0 | US-007, FR-025, FR-026 |
| SC-AUTOREPLY-017 | No active ticket context: Conversation template used | Positive | P0 | US-007, FR-027 |
| SC-AUTOREPLY-018 | Both contexts: Ticket template takes priority | Positive | P0 | US-007, FR-028 |
| SC-AUTOREPLY-019 | Conversation auto-reply logged in Conversation timeline | Positive | P0 | US-008, FR-060 |
| SC-AUTOREPLY-020 | Ticket auto-reply logged in both Conversation and Ticket timeline | Positive | P0 | US-008, FR-061, FR-070 |
| SC-AUTOREPLY-021 | Timeline log failure: retry without resending customer message | Edge | P0 | US-008, FR-064 |
| SC-AUTOREPLY-022 | Frequency limit: only one auto-reply per conversation within window | Positive | P0 | US-009, FR-055, FR-056 |
| SC-AUTOREPLY-023 | Frequency evaluated separately per ticket | Positive | P0 | US-009, FR-057 |
| SC-AUTOREPLY-024 | Cancel if agent replies first: pending auto-reply canceled | Positive | P0 | US-010, FR-049, FR-053 |
| SC-AUTOREPLY-025 | No agent reply before delay: auto-reply sent | Positive | P0 | US-010 |
| SC-AUTOREPLY-026 | Cancel disabled: auto-reply sent immediately | Positive | P0 | US-010, FR-051 |
| SC-AUTOREPLY-027 | Cancel disabled: delay input hidden | Positive | P1 | US-010, FR-050 |
| SC-AUTOREPLY-028 | Template variable unsupported: save blocked | Negative | P0 | FR-039, EH-005 |
| SC-AUTOREPLY-029 | Preview renders Conversation and Ticket templates with sample values | Positive | P1 | US-011 |
| SC-AUTOREPLY-030 | Unsaved changes: warning dialog on page leave | Positive | P1 | US-012, FR-077, FR-078 |
| SC-AUTOREPLY-031 | Rapid messages in one conversation: frequency limit prevents duplicates | Edge | P0 | EC-001 |
| SC-AUTOREPLY-032 | Agent replies after bot message already sent: bot remains, no issue | Edge | P1 | EC-005 |
| SC-AUTOREPLY-033 | Internal note added before delay: does NOT cancel pending auto-reply | Edge | P1 | EC-006, FR-054 |
| SC-AUTOREPLY-034 | Ticket resolved before delay: re-evaluate context before sending | Edge | P1 | EC-008, FR-073 |
| SC-AUTOREPLY-035 | Channel unsupported: skip auto-reply, log skipped event | Negative | P1 | EH-012 |
| SC-AUTOREPLY-036 | Duplicate inbound event: idempotent, no duplicate auto-reply | Regression | P0 | FR-074, FR-076, EH-016 |

---

## PRD Ticket - Conversation Snooze (Conversation List)
- **Status:** UNDEVELOPED
- **Surface:** Snooze action, Snoozed chip/filter, auto-unsnooze on inbound, wake notification

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-SNOOZE-001 | Agent snoozes Open conversation to future time; hidden from Open list | Positive | P0 | US-001, FR-001, FR-003 |
| SC-SNOOZE-002 | Snooze time reached: conversation returns to Open, in-app notification "Snooze selesai" | Positive | P0 | US-001, FR-005, FR-006 |
| SC-SNOOZE-003 | Attempt snooze with past time: blocked | Negative | P0 | US-001, EH-001 |
| SC-SNOOZE-004 | Snooze does NOT change conversation status | Regression | P0 | US-002, FR-002 |
| SC-SNOOZE-005 | Manual unsnooze: returns to original list without status change | Positive | P0 | US-002, FR-021 |
| SC-SNOOZE-006 | New inbound customer message: auto-unsnooze immediately | Positive | P0 | US-003, FR-007 |
| SC-SNOOZE-007 | Snoozed count shown on Snoozed chip in top bar | Positive | P1 | US-004, FR-014 |
| SC-SNOOZE-008 | Snoozed filter option in dropdown filter | Positive | P1 | FR-015 |
| SC-SNOOZE-009 | Snooze modal when reminder exists: info note "Reminder akan menyesuaikan..." | Edge | P1 | US-005, FR-024 |
| SC-SNOOZE-010 | Reminder inside snooze window: deferred to snooze_until | Edge | P1 | US-005, FR-023 |
| SC-SNOOZE-011 | Snoozed then customer replies immediately: auto-unsnooze, moves to Open | Edge | P0 | EC-001 |
| SC-SNOOZE-012 | Snoozed then reassigned: wake notification goes to new assignee | Edge | P1 | EC-002 |
| SC-SNOOZE-013 | Agent viewing snoozed conversation: detail accessible, hidden only from list | Edge | P1 | EC-003 |
| SC-SNOOZE-014 | Snooze from Closed list: hidden from Closed, returns to Closed on wake | Edge | P1 | EC-004 |
| SC-SNOOZE-015 | Cancel and time-based wake race: idempotent, single unsnooze | Edge | P1 | EC-006 |
| SC-SNOOZE-016 | Agent snooze permission: only own assigned conversations | Permission | P0 | FR-009, FR-011 |
| SC-SNOOZE-017 | Supervisor/Admin snooze: any conversation in Team Inbox scope | Permission | P0 | FR-010 |
| SC-SNOOZE-018 | Snooze unassigned conversation blocked for Agent | Negative | P0 | FR-011, EH-002 |

---

## PRD Ticket - Omnichannel Inbox - Related Conversations Grouping
- **Status:** UNDEVELOPED
- **Surface:** Related Match Keys settings, Add Linked Conversations drawer, grouped list/room, customer notice

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-RELATED-001 | Admin configures 1-4 Related Match Keys; row order = priority | Positive | P0 | US-001, FR-001, FR-002 |
| SC-RELATED-002 | Delete all rows: save blocked "Minimal 1 key diperlukan" | Negative | P0 | US-001, FR-008, EH-001 |
| SC-RELATED-003 | Duplicate Source + Field Name: save blocked | Negative | P0 | US-001, FR-009, EH-002 |
| SC-RELATED-004 | "Pulihkan default" restores contact_number, email, contact_name | Positive | P0 | US-001, FR-010 |
| SC-RELATED-005 | Add drawer: single unified result list with matched-first ranking | Positive | P0 | US-002, FR-022, FR-023 |
| SC-RELATED-006 | No exact match: keyword/Conversation ID search still available | Positive | P0 | US-002, FR-029 |
| SC-RELATED-007 | Already linked conversation excluded from result list | Positive | P0 | US-002, FR-028 |
| SC-RELATED-008 | Matched result shows "Matched by" + "Matched value" | Positive | P0 | US-003, FR-026 |
| SC-RELATED-009 | Multiple keys match: highest priority key shown | Edge | P0 | US-003, FR-016 |
| SC-RELATED-010 | Link two standalone conversations: one flat group (Primary + Child) | Positive | P0 | US-004, FR-030, FR-031 |
| SC-RELATED-011 | Unlink child: becomes standalone again | Positive | P0 | US-004, FR-034 |
| SC-RELATED-012 | Promote child to Primary | Positive | P0 | US-004, FR-035 |
| SC-RELATED-013 | Child belongs to another group: requires move/combine confirmation | Negative | P0 | US-004, EH-006 |
| SC-RELATED-014 | Combine two groups: final Primary selection required | Positive | P0 | US-005, FR-037, FR-038 |
| SC-RELATED-015 | Combine cancel: both original groups unchanged | Positive | P0 | US-005 |
| SC-RELATED-016 | Grouped conversations: one parent row in list, children in expanded state | Positive | P0 | US-006, FR-039, FR-040 |
| SC-RELATED-017 | Parent row sorting uses latest activity across all children | Positive | P0 | US-006, FR-041 |
| SC-RELATED-018 | Parent unread count aggregates all child unread | Positive | P0 | US-006, FR-042 |
| SC-RELATED-019 | Grouped room opens on Primary tab by default | Positive | P0 | US-007, FR-045, FR-050 |
| SC-RELATED-020 | Child tabs after Primary; unread indicator on child tabs | Positive | P0 | US-007, FR-049 |
| SC-RELATED-021 | Red dot on Add button when high-confidence matches exist | Positive | P1 | US-008 |
| SC-RELATED-022 | Customer notice enabled by default; editable before send | Positive | P1 | US-010, FR-052, FR-053 |
| SC-RELATED-023 | Ineligible channels skipped for notice; grouping still succeeds | Edge | P1 | US-010, FR-056, EH-010 |
| SC-RELATED-024 | Group dissolves when only one conversation remains after unlink | Edge | P1 | EC-006 |

---

## PRD Ticket - WhatsApp Group Mention in Conversation (WhatsApp Web)
- **Status:** UNDEVELOPED
- **Surface:** @mention picker in WA group, send with mentions, inbound/outbound rendering, Internal label

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-WAMENTION-001 | Typing "@" in WA group opens participant picker | Positive | P0 | US-001, FR-001 |
| SC-WAMENTION-002 | Picker filters by name and number on query | Positive | P0 | US-001, FR-006 |
| SC-WAMENTION-003 | Picker load fails: auto-retry once, then error state with "Coba lagi" | Negative | P0 | US-001, FR-008, EH-001 |
| SC-WAMENTION-004 | Select participant: mention token inserted in message input | Positive | P0 | US-002, FR-003 |
| SC-WAMENTION-005 | Send with valid mentions: delivered with working mentions in WA group | Positive | P0 | US-002, FR-009 |
| SC-WAMENTION-006 | Selected participant no longer valid: dropped on send, warning toast | Edge | P0 | US-002, FR-011, EH-005 |
| SC-WAMENTION-007 | Inbound/outbound mentions rendered with highlight styling | Positive | P0 | US-003, FR-014 |
| SC-WAMENTION-008 | Hover mention: tooltip with display name and number | Positive | P0 | US-003, FR-015 |
| SC-WAMENTION-009 | Mention metadata missing: graceful fallback to plain text | Edge | P0 | US-003, FR-016 |
| SC-WAMENTION-010 | Participant picker fails entirely: message can still send as plain text | Negative | P0 | US-004, FR-004 |
| SC-WAMENTION-011 | Internal participant labeled "Internal" in picker | Positive | P0 | US-005, FR-017, FR-018 |
| SC-WAMENTION-012 | Internal participant tooltip includes "Internal" label | Positive | P0 | US-005, FR-019 |
| SC-WAMENTION-013 | Two participants with same display name: number shown to disambiguate | Edge | P1 | EC-001 |
| SC-WAMENTION-014 | Participant leaves group after picker opens: mention dropped on send | Edge | P1 | EC-002 |
| SC-WAMENTION-015 | Max 100 mentions per message; above limit blocked | Edge | P1 | EC-005 |
| SC-WAMENTION-016 | "@text" typed without selecting participant: sends as normal text | Edge | P1 | EC-004 |
| SC-WAMENTION-017 | Agent without send permission: picker not shown | Permission | P0 | FR-021 |
| SC-WAMENTION-018 | WA session invalid: block mention and message send | Negative | P0 | EH-002 |

---

## Requirement ID Coverage Notes

All PRDs have functional requirement IDs (FR-xxx) and/or user story IDs (US-xxx). Zero PRDs have zero requirement IDs.

---

## Part C: Adjacent & Integration — 234 scenarios

> **Status mix:** DEVELOPED (147) + UNKNOWN (43) + ADJACENT (44) · PRD #23 vs #24 near-duplicate flagged

## Summary

| # | PRD | Surface | Status | #Scenarios |
|---|-----|---------|--------|------------|
| 1 | PRD - Global Search (Conversation + Ticket) | Search popup modal + /search page | DEVELOPED | 20 |
| 2 | PRD - Actionable Shared Attribute Search and System Relation Labels | Search popup + bulk action bar + relation label chips | UNKNOWN — verify | 18 |
| 3 | PRD - Omnichannel Inbox - Shopee Channel Add-On | Settings add-on + Inbox + Conversation Room | UNKNOWN — verify | 25 |
| 4 | PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation | Transcript email + Email conversation + grouped room | DEVELOPED | 24 |
| 5 | PRD Inbox Conversation - reply via email | Transcript email + Email conversation + grouped room | ADJACENT | 24 |
| 6 | PRD Widget - email transcript | Widget settings + branded email + public transcript + continue chat | ADJACENT | 20 |
| 7 | PRD Conversation SLA | Settings page + per-channel SLA cards + reminders + dashboard | DEVELOPED | 24 |
| 8 | PRD Conversation RLT | Conversation Detail + Ticket Detail live timers + export | DEVELOPED | 11 |
| 9 | PRD Analytics - Conversation | Analytics page KPI cards + charts | DEVELOPED | 18 |
| 10 | PRD OPEN API - conversation n ticket | REST API endpoints | DEVELOPED | 20 |
| 11 | PRD Public ID Prefix and Sequential Numbering for Conversation | Detail headers + search + exports | DEVELOPED | 14 |
| 12 | PRD Conversation - macro | Settings → Template Pesan + chat composer | DEVELOPED | 16 |
| | | | **Grand Total** | **234** |

---

## 1. PRD - Global Search (Conversation + Ticket)
- **Status:** DEVELOPED
- **Surface:** Centered popup modal (Cari sidenav / Ctrl+K) + full-page /search fallback
- **Relation to Conversation:** Discovery-only search across Conversation and Ticket domains using shared business attributes (AWB, Order ID, Tracking Number)
- **Requirement IDs:** US-001–US-007, FR-001–FR-040, EH-001–EH-007, EC-001–EC-007

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-GSEARCH-001 | Search by business identifier (e.g. AWB-1234) returns matching results from both Ticket and Conversation domains grouped in one surface | Positive | P0 | US-001, FR-007–FR-010 |
| SC-GSEARCH-002 | Search returns only Ticket section when only Ticket matches exist; Conversation section hidden | Positive | P0 | US-001, FR-020 |
| SC-GSEARCH-003 | Search returns only Conversation section when only Conversation matches exist; Ticket section hidden | Positive | P0 | US-001, FR-020 |
| SC-GSEARCH-004 | Each result displays `Matched by` with the attribute key that caused the match | Positive | P0 | US-002, FR-021–FR-023 |
| SC-GSEARCH-005 | Each result displays `Matched value` with the exact normalized or display-safe value | Positive | P0 | US-002, FR-022 |
| SC-GSEARCH-006 | When multiple fields qualify as a match, only the highest-priority match reason is displayed | Positive | P0 | US-002, FR-023, EC-002 |
| SC-GSEARCH-007 | Clicking a Conversation result opens Conversation Room and closes the popup | Positive | P0 | US-003, FR-027, FR-029 |
| SC-GSEARCH-008 | Clicking a Ticket result opens Ticket Detail and closes the popup | Positive | P0 | US-003, FR-028, FR-029 |
| SC-GSEARCH-009 | Reopening the popup restores last keyword and results from session state | Positive | P0 | US-003, FR-030 |
| SC-GSEARCH-010 | Clicking Cari in sidenav opens centered popup modal above the current page | Positive | P0 | US-004, FR-001–FR-002 |
| SC-GSEARCH-011 | Pressing Ctrl+K/Cmd+K opens the same popup with input auto-focused | Positive | P1 | US-004, FR-003 |
| SC-GSEARCH-012 | Agent with scoped access sees only allowed tickets and conversations; out-of-scope records excluded silently | Permission | P0 | US-005, FR-005–FR-006, EH-005 |
| SC-GSEARCH-013 | Search query is tenant-scoped by companyId and organizationId; no cross-tenant leakage | Permission | P0 | FR-006 |
| SC-GSEARCH-014 | Loading state shows "Mencari..." while request is in flight | State | P0 | US-006, FR-034 |
| SC-GSEARCH-015 | Empty state shows "Tidak ada data terkait ditemukan." when no records found | State | P0 | US-006, FR-035 |
| SC-GSEARCH-016 | When Ticket search fails but Conversation succeeds, Conversation results remain visible; Ticket section shows retry "Coba lagi" | Negative | P0 | US-006, FR-036, FR-037, EH-002 |
| SC-GSEARCH-017 | When both domains fail, popup stays open showing "Gagal memuat hasil pencarian. Coba lagi." | Negative | P0 | EH-004 |
| SC-GSEARCH-018 | Case and separator normalization (AWB1234 vs AWB-1234) treats values as the same match | Edge | P0 | FR-011–FR-013, EC-003 |
| SC-GSEARCH-019 | Exact normalized high-confidence matches rank above weaker/fallback results; same-strength ties sorted by most recently updated | Positive | P0 | FR-031–FR-033 |
| SC-GSEARCH-020 | Phase 1 search does NOT mutate Ticket or Conversation data, does NOT auto-create tags | Regression | P0 | FR-014–FR-016 |

---

## 2. PRD - Actionable Shared Attribute Search and System Relation Labels
- **Status:** UNKNOWN — verify
- **Surface:** Search popup + per-domain checkbox selection + bulk action bar + relation label chips
- **Relation to Conversation:** Extends shared-attribute discovery into actionable bulk labeling and click-through navigation
- **Requirement IDs:** US-001–US-007, FR-001–FR-029, EH-001–EH-006, EC-001–EC-005

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-SHAREATTR-001 | Clicking a Conversation result row opens Conversation Room with Detail panel visible and closes popup | Positive | P0 | US-001, FR-001, FR-003 |
| SC-SHAREATTR-002 | Clicking a Ticket result row opens Ticket Detail and closes popup | Positive | P0 | US-002, FR-002, FR-003 |
| SC-SHAREATTR-003 | Checkbox selection of multiple Conversation results shows Conversation bulk action bar | Positive | P0 | US-003, FR-005, FR-008, FR-010 |
| SC-SHAREATTR-004 | Checkbox selection of multiple Ticket results shows Ticket bulk action bar separately | Positive | P0 | US-003, FR-005, FR-008, FR-011 |
| SC-SHAREATTR-005 | Selecting both Conversation and Ticket results shows two separate domain-specific action bars; no mixed-domain bulk execution | Edge | P0 | US-003, FR-006–FR-007, EH-004 |
| SC-SHAREATTR-006 | "Beri Tag Relasi Otomatis" applies system relation label based on shared attribute context to selected records | Positive | P0 | US-004, FR-012 |
| SC-SHAREATTR-007 | Applying same relation label to a record that already has it does not create a duplicate (idempotent) | Edge | P0 | US-004, FR-015, FR-021, EH-002 |
| SC-SHAREATTR-008 | Generated label displays readable format: "AWB • JNE123456789" | Positive | P0 | US-005, FR-019 |
| SC-SHAREATTR-009 | Relation labels stored separately from manual tag registry; do not appear in Tag Management as editable manual tags | Positive | P0 | FR-016, FR-022, US-007 |
| SC-SHAREATTR-010 | Relation label chip has distinct visual style from manual tag chip | Positive | P0 | FR-022 |
| SC-SHAREATTR-011 | Clicking relation filter shortcut narrows current result/list to that relation value | Positive | P1 | US-006, FR-023 |
| SC-SHAREATTR-012 | No matching records under relation filter shows clear empty state | State | P1 | US-006 |
| SC-SHAREATTR-013 | Bulk action with zero selected records: action button disabled | Negative | P0 | EH-003 |
| SC-SHAREATTR-014 | Bulk apply fails for some records, succeeds for others: successful mutations kept, partial outcome shown "Sebagian label berhasil diterapkan." | Negative | P0 | EH-005, FR-013–FR-014 |
| SC-SHAREATTR-015 | Inaccessible records in selection are skipped/blocked with audit; never mutated silently | Permission | P0 | FR-013–FR-014, EH-001 |
| SC-SHAREATTR-016 | Changing search keyword clears previous selection state | Edge | P0 | FR-009, EC-005 |
| SC-SHAREATTR-017 | Existing Auto Tag rules are NOT changed by this feature; no mutation of Auto Tag rule creation/editing/deletion | Regression | P0 | FR-026, US-007 |
| SC-SHAREATTR-018 | Long display values (50+ chars) truncated safely in chip with full value accessible on hover/detail | Edge | P1 | EC-003 |

---

## 3. PRD - Omnichannel Inbox - Shopee Channel Add-On
- **Status:** UNKNOWN — verify
- **Surface:** Settings → Add-On → Shopee + Inbox chat list + Conversation Room
- **Relation to Conversation:** Adds Shopee as a new channel producing conversations in the unified inbox, following existing conversation lifecycle
- **Requirement IDs:** US-001–US-007, FR-001–FR-057, EH-001–EH-014, EC-001–EC-010

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-SHOPEE-001 | Admin activates Shopee add-on and completes connect flow; system creates account channel Shopee in correct tenant scope | Positive | P0 | US-001, FR-001–FR-004 |
| SC-SHOPEE-002 | Invalid credentials or authorization failure: no active account channel created, safe failure reason displayed | Negative | P0 | US-001, EH-002 |
| SC-SHOPEE-003 | Settings page shows connected Shopee account channel with status "terhubung" after successful connection | Positive | P0 | US-001, FR-009 |
| SC-SHOPEE-004 | Valid inbound Shopee webhook creates or updates correct conversation in inbox tenant | Positive | P0 | US-002, FR-015, FR-022–FR-024 |
| SC-SHOPEE-005 | Same buyer sending continuation on same thread: message appended to existing Shopee conversation | Positive | P0 | US-002, FR-024 |
| SC-SHOPEE-006 | Duplicate webhook retry (same event/message): no duplicate conversation or message created (idempotent) | Edge | P0 | US-002, FR-056–FR-057, EC-001 |
| SC-SHOPEE-007 | Invalid/unverifiable webhook payload: rejected, no conversation/message mutation, security log recorded | Negative | P0 | FR-012–FR-014, EH-003 |
| SC-SHOPEE-008 | Agent sends outbound text reply to Shopee; message sent to provider and stored in timeline | Positive | P0 | US-003, FR-032–FR-035 |
| SC-SHOPEE-009 | Outbound send fails with provider failure: message marked failed, agent sees "Pesan gagal dikirim ke Shopee" | Negative | P0 | US-003, EH-009, FR-035 |
| SC-SHOPEE-010 | Agent without send permission opens Shopee room: composer disabled/hidden, server-side enforced | Permission | P0 | US-003, FR-050–FR-051, EH-011 |
| SC-SHOPEE-011 | Account channel disconnected at outbound time: composer blocked, "Akun Shopee tidak terhubung" | Negative | P0 | EH-007, FR-036 |
| SC-SHOPEE-012 | Shopee conversations show "Shopee" channel label in inbox list | Positive | P0 | US-004, FR-042 |
| SC-SHOPEE-013 | Channel filter includes Shopee; selecting "Shopee" shows only Shopee conversations | Positive | P0 | US-004, FR-043–FR-044 |
| SC-SHOPEE-014 | Shopee conversations included in platform-level conversation analytics | Positive | P0 | US-004, FR-054 |
| SC-SHOPEE-015 | Authorization expiry/revoke: account channel marked disconnected, outbound blocked, audit event "shopee_account_invalidated" logged | Positive | P0 | US-005, FR-011, EH-002 |
| SC-SHOPEE-016 | Reconnect action succeeds: account channel returns to "connected", outbound restored | Positive | P0 | US-005, FR-010 |
| SC-SHOPEE-017 | Buyer identity resolved via channel-scoped external identity, NOT from display name | Positive | P0 | FR-018–FR-021, EH-005 |
| SC-SHOPEE-018 | Inbound for closed thread: system follows canonical reopen/create policy, no Shopee-specific status taxonomy | Edge | P0 | EC-004, FR-026 |
| SC-SHOPEE-019 | Unsupported non-text inbound message: does not break text pipeline; logged for observability | Edge | P0 | FR-029–FR-031, EH-012, EC-009 |
| SC-SHOPEE-020 | Double-click outbound send: idempotency guard prevents double-send to provider | Edge | P0 | EC-006 |
| SC-SHOPEE-021 | Status callbacks arrive out of order: reconciled deterministically, no terminal state regression | Edge | P0 | FR-041, EC-005 |
| SC-SHOPEE-022 | Tenant connects multiple Shopee shops: each becomes separate account channel within same tenant | Positive | P1 | FR-008, EC-002 |
| SC-SHOPEE-023 | Connect/disconnect/inbound/outbound/failure events all have audit trail with actor, tenant, account channel, timestamp | Positive | P1 | US-006, FR-052–FR-053 |
| SC-SHOPEE-024 | Shopee add-on uses existing Platform → Channel → AccountChannel model; no new entity model introduced | Contract | P0 | US-007, FR-003, FR-048 |
| SC-SHOPEE-025 | Existing non-Shopee channels (WhatsApp API, Instagram, etc.) continue working without regression during Shopee pilot rollout | Regression | P0 | FR-056–FR-057 (cross-channel) |

---

## 4. PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation
- **Status:** DEVELOPED
- **Surface:** Transcript email (sent to customer) + inbound Email conversation creation + grouped room with Primary/Child tabs
- **Relation to Conversation:** Enables Live Chat → Email channel continuity; Email reply creates new conversation linked to original Live Chat
- **Requirement IDs:** US-001–US-009, FR-001–FR-056, EH-001–EH-014, EC-001–EC-014

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-TRANSCRIPT-001 | Live Chat resolved → transcript email sent to customer from workspace default email account | Positive | P0 | US-001, FR-001, FR-006–FR-007 |
| SC-TRANSCRIPT-002 | Live Chat reaches inactivity timeout → transcript email sent | Positive | P0 | US-002, FR-002 |
| SC-TRANSCRIPT-003 | Both resolved and timeout triggers for same conversation → only one transcript email sent (no duplicate) | Edge | P0 | US-002, FR-003, EC-001 |
| SC-TRANSCRIPT-004 | Customer email missing → transcript not sent, skipped audit event recorded | Negative | P0 | US-001, EH-003 |
| SC-TRANSCRIPT-005 | Workspace default email account not connected → sending blocked, "Email default workspace belum terhubung" | Negative | P0 | US-003, EH-001 |
| SC-TRANSCRIPT-006 | Workspace default email account inactive → sending blocked, "Email default workspace tidak aktif" | Negative | P0 | US-003, EH-002 |
| SC-TRANSCRIPT-007 | Transcript send failure → retry up to 3 times, then status "failed" with audit | Negative | P0 | US-002, FR-005, EH-004 |
| SC-TRANSCRIPT-008 | Customer replies to transcript email → new open Email conversation created | Positive | P0 | US-004, FR-022 |
| SC-TRANSCRIPT-009 | Reply includes valid transcript reference → Email conversation auto-linked to original Live Chat | Positive | P0 | US-004, FR-028 |
| SC-TRANSCRIPT-010 | Reply without valid transcript reference but sender matches customer email → no auto-link, suggested link only | Edge | P0 | US-004, FR-019–FR-021, EH-006 |
| SC-TRANSCRIPT-011 | Multiple replies in same email thread → messages appended to same Email conversation, no duplicate conversation | Edge | P0 | US-004, FR-023, EC-002 |
| SC-TRANSCRIPT-012 | Email conversation linked → Email becomes Primary, Live Chat demoted to Child | Positive | P0 | US-005, FR-034–FR-035 |
| SC-TRANSCRIPT-013 | Primary promotion fails → group kept linked, "Gagal menjadikan email sebagai percakapan utama" shown | Negative | P0 | US-005, EH-008 |
| SC-TRANSCRIPT-014 | Original Live Chat room shows system message: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email." | Positive | P0 | US-006, FR-038–FR-039 |
| SC-TRANSCRIPT-015 | System message link clicked → grouped room opens with Email tab active | Positive | P0 | US-006, FR-040 |
| SC-TRANSCRIPT-016 | Grouped room: Email tab first as Primary, Live Chat tab as Child with history visible | Positive | P0 | US-007, FR-030–FR-031 |
| SC-TRANSCRIPT-017 | Email tab unread count included in parent row unread count | Positive | P0 | US-007 |
| SC-TRANSCRIPT-018 | Live Chat conversation stays resolved after Email reply; NOT reopened by Email reply | Positive | P0 | FR-041–FR-042 |
| SC-TRANSCRIPT-019 | Email conversation SLA started based on Email channel SLA rules; Live Chat SLA NOT restarted | Positive | P0 | FR-043–FR-045 |
| SC-TRANSCRIPT-020 | User without Email send permission → composer disabled, "Anda tidak memiliki akses untuk membalas email" | Permission | P0 | FR-050, EH-011 |
| SC-TRANSCRIPT-021 | User without linking permission → link actions hidden/disabled | Permission | P0 | FR-049 |
| SC-TRANSCRIPT-022 | Transcript send, reply, link, Primary change, system message events all audited | Positive | P1 | US-008, FR-051–FR-056 |
| SC-TRANSCRIPT-023 | Workspace default email account changed after transcript sent → old replies still matched via transcript reference | Edge | P0 | US-003, EC-005 |
| SC-TRANSCRIPT-024 | Customer forwards transcript to another person → that person's reply creates Email conversation, auto-link only if transcript reference valid | Edge | P1 | EC-004 |

---

## 5. PRD Inbox Conversation - reply via email
- **Status:** ADJACENT
- **Surface:** Transcript email + Email conversation + grouped room
- **Relation to Conversation:** Enables Live Chat → Email reply continuity with auto-linked grouped conversation
- **Requirement IDs:** US-001–US-009, FR-001–FR-056, EH-001–EH-014, EC-001–EC-014

> **Overlap note:** This PRD is a near-exact duplicate of PRD #4 (same feature name, same v1.0 date 2026-04-29, same FR/US/EH/EC content). Only difference: Design Lead is "Sabrina" in #5 vs "Resky" in #4. Scenarios cataloged identically for completeness; de-dup at test-case level recommended.

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-EMAILREPLY-001 | Live Chat resolved → transcript email sent from workspace default email | Positive | P0 | US-001, FR-001, FR-006–FR-007 |
| SC-EMAILREPLY-002 | Live Chat inactivity timeout → transcript email sent | Positive | P0 | US-002, FR-002 |
| SC-EMAILREPLY-003 | Resolved + timeout both fire → only one transcript email sent | Edge | P0 | US-002, FR-003, EC-001 |
| SC-EMAILREPLY-004 | Customer email missing → no send, skipped audit | Negative | P0 | US-001, EH-003 |
| SC-EMAILREPLY-005 | Workspace default email not connected → blocked, "Email default workspace belum terhubung" | Negative | P0 | US-003, EH-001 |
| SC-EMAILREPLY-006 | Workspace default email inactive → blocked, audit reason stored | Negative | P0 | US-003, EH-002 |
| SC-EMAILREPLY-007 | Transcript send failure → retry up to 3x, then "failed" | Negative | P0 | US-002, FR-005, EH-004 |
| SC-EMAILREPLY-008 | Customer replies → new Email conversation created | Positive | P0 | US-004, FR-022 |
| SC-EMAILREPLY-009 | Valid transcript reference → auto-linked to original Live Chat | Positive | P0 | US-004, FR-028 |
| SC-EMAILREPLY-010 | No valid transcript reference → no auto-link, suggestion only if safe candidate | Edge | P0 | US-004, FR-019–FR-021, EH-006 |
| SC-EMAILREPLY-011 | Multiple replies in same thread → appended to existing Email conversation | Edge | P0 | US-004, FR-023, EC-002 |
| SC-EMAILREPLY-012 | Linking succeeds → Email becomes Primary, Live Chat becomes Child | Positive | P0 | US-005, FR-034–FR-035 |
| SC-EMAILREPLY-013 | Primary promotion fails → group stays linked, error message shown | Negative | P0 | US-005, EH-008 |
| SC-EMAILREPLY-014 | Live Chat shows system message directing agent to Email | Positive | P0 | US-006, FR-038–FR-039 |
| SC-EMAILREPLY-015 | Grouped room opens with Email tab active by default | Positive | P0 | US-007, FR-030–FR-036 |
| SC-EMAILREPLY-016 | Email unread count reflected in parent row | Positive | P0 | US-007 |
| SC-EMAILREPLY-017 | Live Chat remains resolved after Email reply (not reopened) | Positive | P0 | FR-041–FR-042 |
| SC-EMAILREPLY-018 | Email SLA starts per Email channel rules; Live Chat SLA not restarted | Positive | P0 | FR-043–FR-045 |
| SC-EMAILREPLY-019 | No Email send permission → composer disabled | Permission | P0 | FR-050, EH-011 |
| SC-EMAILREPLY-020 | No linking permission → link actions hidden | Permission | P0 | FR-049 |
| SC-EMAILREPLY-021 | All transcript-reply lifecycle events audited (send, reply, link, Primary change, system message) | Positive | P1 | US-008, FR-051–FR-056 |
| SC-EMAILREPLY-022 | Default email account changed after send → old replies still matched | Edge | P0 | US-003, EC-005 |
| SC-EMAILREPLY-023 | Auto-link failure → Email conversation stays open, unlinked; retry up to 3x | Negative | P0 | US-009, EH-007 |
| SC-EMAILREPLY-024 | Duplicate inbound email delivery → deduplicated by email identity and thread reference | Edge | P0 | EC-014 |

---

## 6. PRD Widget - email transcript
- **Status:** ADJACENT
- **Surface:** Widget settings → Appearance tab toggle + branded transcript email + public transcript page + continue-chat link
- **Relation to Conversation:** Sends transcript email copy of Live Chat conversation to customer; provides public transcript link and continue-chat resume
- **Requirement IDs:** US-001–US-005, FR-001–FR-041, EH-001–EH-005, EC-001–EC-012

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-WIDGETEMAIL-001 | Admin toggles "Kirim transkrip ke email pelanggan" ON in widget Appearance tab; setting saved per tenant | Positive | P0 | US-001, FR-001–FR-002 |
| SC-WIDGETEMAIL-002 | Toggle OFF → no transcript email sent when Live Chat ends | Positive | P0 | US-001 |
| SC-WIDGETEMAIL-003 | Admin without channel manage permission → "Akses ditolak", toggle not editable | Permission | P0 | US-001, FR-003 |
| SC-WIDGETEMAIL-004 | Inactivity timeout (20 min) reached with valid customer email → exactly 1 transcript email sent | Positive | P0 | US-002, FR-010, FR-012, FR-015 |
| SC-WIDGETEMAIL-005 | Conversation resolved without timeout → transcript sent as fallback | Positive | P0 | US-002, FR-011 |
| SC-WIDGETEMAIL-006 | Customer email missing/invalid → no send, skipped reason stored | Negative | P0 | US-002, EH-002, FR-009 |
| SC-WIDGETEMAIL-007 | Email header shows widget logo when configured; falls back to tenant name if logo missing | Positive | P0 | US-003, FR-021 |
| SC-WIDGETEMAIL-008 | Email uses widget theme color for header accent and CTA buttons | Positive | P0 | US-003, FR-022 |
| SC-WIDGETEMAIL-009 | Transcript exceeds 120,000 chars or 300 messages → truncated to last 100 messages, "Transkrip dipotong" notice shown, secure link still included | Edge | P0 | US-004, FR-024–FR-026 |
| SC-WIDGETEMAIL-010 | Secure transcript link expires after 30 days → "Link transkrip tidak valid atau sudah kedaluwarsa" | Edge | P0 | US-004, FR-028, EH-004 |
| SC-WIDGETEMAIL-011 | Public transcript page shows tenant brand, conversation metadata, full transcript; no internal inbox UI exposed | Positive | P0 | FR-029–FR-031 |
| SC-WIDGETEMAIL-012 | "Lanjutkan Chat" button enabled → clicks open continue_chat_url with resume token; widget auto-opens | Positive | P0 | US-005, FR-034–FR-035 |
| SC-WIDGETEMAIL-013 | Resume token valid → same conversation thread shown (history visible) | Positive | P0 | US-005, FR-036 |
| SC-WIDGETEMAIL-014 | Resume token expired/invalid → widget shows clear message, opens in "new chat" state | Negative | P0 | US-005, FR-039 |
| SC-WIDGETEMAIL-015 | Session resume (session-livechat.email valid) takes priority over guest resume | Edge | P0 | FR-041, FR-036 |
| SC-WIDGETEMAIL-016 | Conversation reopens after transcript already sent → no resend (MVP: one email per conversation) | Edge | P0 | EC-003, FR-015 |
| SC-WIDGETEMAIL-017 | New message arrives after resolved but before scheduled send → cancel send, reschedule per inactivity timeout | Edge | P0 | EC-002, FR-014 |
| SC-WIDGETEMAIL-018 | Continue chat URL not set but button toggle enabled → button hidden, transcript + public link still sent | Edge | P1 | EC-008, FR-005 |
| SC-WIDGETEMAIL-019 | Send failure → retry up to 3x with exponential backoff, then "failed" | Negative | P0 | FR-038, EH-003 |
| SC-WIDGETEMAIL-020 | Whitelabel enabled → no SatuInbox branding in email footer | Positive | P1 | FR-023 |

---

## 7. PRD Conversation SLA
- **Status:** DEVELOPED
- **Surface:** Settings → SLA untuk Percakapan (per-channel SLA cards + shared policy) + in-app notifications + dashboard summaries
- **Relation to Conversation:** Defines per-channel SLA metrics (FRT, TTC) with reminders, breach triggers, and dashboard for conversation-level SLA monitoring
- **Requirement IDs:** US-001–US-009, FR-001–FR-072, EH-001–EH-012, EC-001–EC-014

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-SLA-001 | Admin opens "SLA untuk Percakapan" → sees one shared policy section and one SLA card per supported channel | Positive | P0 | US-001, FR-004 |
| SC-SLA-002 | Admin edits FRT or TTC in a channel card and saves → only future SLA cycles use new values; active cycles unchanged | Positive | P0 | US-001, FR-040, FR-042 |
| SC-SLA-003 | Invalid value entered → inline validation blocks save in Bahasa Indonesia | Negative | P0 | US-001, EH-001–EH-002 |
| SC-SLA-004 | Reminder active with value ≥ SLA duration → save blocked, "Pengingat harus lebih kecil dari durasi SLA" | Negative | P0 | US-002, FR-028, EH-004 |
| SC-SLA-005 | Reminder triggers when remaining time ≤ configured offset → one in-app notification per metric per cycle | Positive | P0 | US-002, FR-044–FR-045 |
| SC-SLA-006 | TTC pause toggle enabled + conversation enters Waiting on Customer → TTC pauses for supported channels | Positive | P0 | US-003, FR-011–FR-012 |
| SC-SLA-007 | AUX counting disabled + assigned agent enters AUX mode → running SLA pauses | Positive | P0 | US-003, FR-013–FR-014 |
| SC-SLA-008 | Policy toggle change saved → only future cycles use new policy; active cycles unchanged | Positive | P0 | US-003, FR-040–FR-041 |
| SC-SLA-009 | Legacy global conversation SLA workspace → migration creates per-channel SLA records with equivalent values | Positive | P0 | US-004, FR-059–FR-062 |
| SC-SLA-010 | WA Web Group during migration → FRT migrated, TTC stays disabled | Edge | P0 | US-004, FR-062, EC-009 |
| SC-SLA-011 | Migration is idempotent → rerun does not duplicate config | Edge | P0 | FR-065 |
| SC-SLA-012 | New workspace with no prior SLA → standard per-channel defaults seeded automatically | Positive | P0 | US-005, FR-067–FR-068 |
| SC-SLA-013 | WA Web Group TTC metric disabled with helper text "Belum didukung untuk kanal ini" | Positive | P0 | US-008, FR-009–FR-010 |
| SC-SLA-014 | Conversation starts → SLA cycle begins when first assigned to agent | Positive | P0 | FR-035 |
| SC-SLA-015 | FRT completed when first customer-visible agent message sent; internal notes ignored | Positive | P0 | FR-036–FR-037 |
| SC-SLA-016 | TTC completed when conversation resolved/closed; TTC not created for WA Web Group | Positive | P0 | FR-038–FR-039 |
| SC-SLA-017 | Supervisor receives reminder/breach notification with customer name, channel, metric; deep links to conversation | Positive | P0 | US-006, FR-052 |
| SC-SLA-018 | Assignee receives notification; if conversation unassigned → only supervisors notified | Positive | P0 | US-007, FR-053–FR-054 |
| SC-SLA-019 | Assignee changes before trigger → only current assignee receives notification at trigger time | Edge | P0 | EC-004 |
| SC-SLA-020 | Dashboard shows "SLA Hampir Terlewat" and "SLA Terlewat" summary cards for supervisors | Positive | P1 | US-009, FR-055–FR-056 |
| SC-SLA-021 | Admin only allowed to save SLA settings; non-Admin blocked with "Akses ditolak" | Permission | P0 | FR-001, FR-003, EH-006 |
| SC-SLA-022 | Reminder paused while metric paused → re-evaluated on resume; sent if still eligible | Edge | P0 | FR-046–FR-048, EC-001 |
| SC-SLA-023 | Conversation resumes and TTC remaining already negative → breached immediately | Edge | P0 | EC-002 |
| SC-SLA-024 | Admin saves new values while active cycles exist → active cycles remain unchanged (snapshot rule) | Edge | P0 | EC-007, FR-040–FR-042 |

---

## 8. PRD Conversation RLT
- **Status:** DEVELOPED
- **Surface:** Conversation Detail + Ticket Detail live timers + offline report export (XLSX)
- **Relation to Conversation:** Adds Response Lead Time (RLT) and Wait Time in Queue metrics as tracked timers for conversations and linked tickets
- **Requirement IDs:** AC-01–AC-11

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-RLT-001 | First customer message received, no agent assigned → Waktu Antre timer runs from T1 | Positive | P0 | AC-01 |
| SC-RLT-002 | Agent assigned → Waktu Antre stops, final duration stored | Positive | P0 | AC-02 |
| SC-RLT-003 | Agent assigned but no reply yet → Waktu Kerja Staf (RLT) timer runs from T2 | Positive | P0 | AC-03 |
| SC-RLT-004 | First successful customer-facing reply sent → RLT timer stops, final duration stored | Positive | P0 | AC-04 |
| SC-RLT-005 | Internal notes, failed replies, drafts, system messages → do NOT count as T3 (RLT not stopped) | Edge | P0 | AC-05 |
| SC-RLT-006 | Reassignment before first reply → primary RLT does NOT reset from new assignment | Edge | P0 | AC-06 |
| SC-RLT-007 | Multi-assignee conversation → first assignment used as T2, first replying agent stored as first responder | Edge | P0 | AC-07 |
| SC-RLT-008 | Linked ticket shows inherited RLT and Wait Time metrics from linked conversation | Positive | P0 | AC-08 |
| SC-RLT-009 | Internal-only ticket (no linked customer conversation) → shows "Tidak berlaku" | Edge | P0 | AC-09 |
| SC-RLT-010 | Offline Report Download (Conversation + Ticket XLSX) includes RLT and Wait Time columns | Positive | P0 | AC-10 |
| SC-RLT-011 | No alert, reminder, breach badge, notification, or escalation triggered by RLT or Wait Time in Phase 1 | Regression | P0 | AC-11 |

---

## 9. PRD Analytics - Conversation
- **Status:** DEVELOPED
- **Surface:** Analytics → Percakapan page with KPI cards, charts, filter bar
- **Relation to Conversation:** Provides conversation analytics: volume, workload, responsiveness proxies, unassigned backlog, tagging usage
- **Requirement IDs:** US-001–US-006, FR-001–FR-031, EH-001–EH-006, EC-001–EC-008

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-ANALYTICS-001 | Admin/Supervisor opens Analitik → Percakapan → page loads with 8 KPI cards and 4 charts | Positive | P0 | US-001, FR-010–FR-017 |
| SC-ANALYTICS-002 | Default date range is "30 hari terakhir"; changing range refreshes all KPI and charts | Positive | P0 | US-001, US-002, FR-003, FR-007 |
| SC-ANALYTICS-003 | No data in selected range → KPI values show 0, charts show empty state "Belum ada data pada periode ini" | State | P0 | US-001, EH-002 |
| SC-ANALYTICS-004 | Team/Agent/Channel filters applied → all KPI and charts reflect selected scope consistently | Positive | P0 | US-002, FR-007 |
| SC-ANALYTICS-005 | Entity metrics use assignee at event time for attribution when Team/Agent filters active | Positive | P0 | FR-008, EC-003 |
| SC-ANALYTICS-006 | "Total chat belum ter-assign" visible when "Semua tim" and "Semua agen" selected | Positive | P0 | US-003, FR-017 |
| SC-ANALYTICS-007 | "Total chat belum ter-assign" hidden when Agent is not "Semua agen" | Edge | P0 | FR-019 |
| SC-ANALYTICS-008 | "Total chat belum ter-assign" hidden when Team is not "Semua tim" | Edge | P0 | FR-020 |
| SC-ANALYTICS-009 | "Total percakapan - berdasarkan waktu" bar chart shows daily conversation counts | Positive | P1 | US-004, FR-021 |
| SC-ANALYTICS-010 | "Total percakapan - berdasarkan kanal" donut chart shows channel distribution | Positive | P1 | US-004, FR-022 |
| SC-ANALYTICS-011 | Channel filter active → channel distribution chart hidden, replaced with informational message | Edge | P0 | FR-027, EC-006 |
| SC-ANALYTICS-012 | "Total balasan - berdasarkan waktu" shows daily reply counts; Agent filter counts replies by selected agents only | Positive | P1 | US-005, FR-023 |
| SC-ANALYTICS-013 | "Total tag - berdasarkan kategori" shows tag counts per category; empty state when no tags | Positive | P1 | US-005, FR-024 |
| SC-ANALYTICS-014 | Charts show tooltip on hover with date/category and numeric value | Positive | P1 | FR-025 |
| SC-ANALYTICS-015 | Unauthorized user → "Akses ditolak"; page content blocked | Permission | P0 | US-006, FR-001–FR-002, EH-001 |
| SC-ANALYTICS-016 | Analytics service failure → error state with "Coba lagi" button | Negative | P0 | US-006, EH-004 |
| SC-ANALYTICS-017 | Filter load failure → filters disabled, "Gagal memuat filter" with retry | Negative | P0 | EH-003 |
| SC-ANALYTICS-018 | "Terakhir diperbarui" timestamp shown in Asia/Jakarta time | Positive | P0 | FR-028 |

---

## 10. PRD OPEN API - conversation n ticket
- **Status:** DEVELOPED
- **Surface:** REST API endpoints (GET /inbox, PATCH /inbox/{id}, PUT /contacts/{id}, POST /inbox/{id}/links, PATCH /inbox/bulk, webhooks)
- **Relation to Conversation:** Programmatic search, update, and enrichment of conversations and tickets via Open API
- **Requirement IDs:** User stories (search, update, auto-resolve, enrich, link, bulk, webhook), error codes (400-INV-PROP, 400-INV-STATUS, 404-NOT-FOUND, 409-DUP-LINK, 429-RATE-LIMIT, 500-SRV-ERR)

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-OPENAPI-001 | `GET /inbox?properties[awb]=12345` returns matching results with pagination | Contract (success) | P0 | User Story: search |
| SC-OPENAPI-002 | Search supports AND/OR filters by status, date range, team, agent | Contract (success) | P0 | User Story: search |
| SC-OPENAPI-003 | `PATCH /inbox/{id}` with valid status transition (unassigned → ongoing → resolved) succeeds with audit log `source=api` | Contract (success) | P0 | User Story: update |
| SC-OPENAPI-004 | `PATCH /inbox/{id}` with invalid status transition → 400-INV-STATUS | Contract (validation-error) | P0 | Error: 400-INV-STATUS |
| SC-OPENAPI-005 | `PATCH /inbox/{id}` with invalid property format → 400-INV-PROP | Contract (validation-error) | P0 | Error: 400-INV-PROP |
| SC-OPENAPI-006 | `PATCH /inbox/{id}` with non-existent ID → 404-NOT-FOUND | Contract (validation-error) | P0 | Error: 404-NOT-FOUND |
| SC-OPENAPI-007 | External system (e.g. SAPX) auto-resolves ticket via `PATCH /inbox/{id}` with `status=resolved`; audit includes external event ID | Contract (success) | P0 | User Story: auto-resolve |
| SC-OPENAPI-008 | `PUT /contacts/{id}` with transactions[] array accepted; transactions appear in sidebar UI | Contract (success) | P1 | User Story: enrich |
| SC-OPENAPI-009 | `PUT /contacts/{id}` with invalid data → 400 error | Contract (validation-error) | P1 | User Story: enrich |
| SC-OPENAPI-010 | `POST /inbox/{id}/links` attaches external ticket; visible in Linked Tickets section | Contract (success) | P1 | User Story: link |
| SC-OPENAPI-011 | `POST /inbox/{id}/links` with duplicate link → 409-DUP-LINK | Contract (conflict) | P1 | Error: 409-DUP-LINK |
| SC-OPENAPI-012 | `PATCH /inbox/bulk` accepts up to 1000 IDs per request | Contract (success) | P1 | User Story: bulk |
| SC-OPENAPI-013 | Rate limit exceeded (100 req/sec/tenant) → 429-RATE-LIMIT with `retry_after` | Contract (permission) | P0 | Error: 429-RATE-LIMIT |
| SC-OPENAPI-014 | Server error → 500-SRV-ERR | Contract (validation-error) | P0 | Error: 500-SRV-ERR |
| SC-OPENAPI-015 | API auth: OAuth2.0 Client Credentials or API Key per tenant required; unauthenticated → 401 | Contract (permission) | P0 | NFR: Authentication |
| SC-OPENAPI-016 | PII masking: phone/email masked in responses unless caller has `admin` scope | Contract (permission) | P0 | NFR: PII Masking |
| SC-OPENAPI-017 | `Idempotency-Key` header supported for PATCH/POST; same key → idempotent response | Contract (idempotency) | P0 | NFR: Idempotency |
| SC-OPENAPI-018 | All endpoints prefixed with `/v1/`; response schema remains backward compatible | Contract (backward-compat) | P0 | NFR: Versioning |
| SC-OPENAPI-019 | Every API action logged with `actor`, `source=api`, `timestamp` in audit | Contract (success) | P0 | NFR: Audit Trail |
| SC-OPENAPI-020 | Transactions array limit 200 per contact; Properties JSON ≤ 8KB per inbox item → 400 if exceeded | Contract (validation-error) | P1 | Limitations |

---

## 11. PRD Public ID Prefix and Sequential Numbering for Conversation
- **Status:** DEVELOPED
- **Surface:** Conversation detail header + Ticket detail header + global search + exports
- **Relation to Conversation:** Provides human-readable public IDs (CV-{n}, TK-{n}) for conversations and tickets
- **Requirement IDs:** US-001–US-004, FR-001–FR-016, EH-001–EH-004, EC-001–EC-005

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-PUBLICID-001 | First conversation in new tenant → public ID is `CV-0` | Positive | P0 | US-003, FR-005 |
| SC-PUBLICID-002 | CV-9 exists → next conversation is CV-10; TK-99 exists → next ticket is TK-100 | Positive | P0 | US-003, FR-006–FR-007 |
| SC-PUBLICID-003 | Conversation detail shows `CV-{n}` in header with copy button | Positive | P0 | US-001, FR-011 |
| SC-PUBLICID-004 | Ticket detail shows `TK-{n}` in header with copy button | Positive | P0 | US-002, FR-011 |
| SC-PUBLICID-005 | Global search by exact `CV-10` or `TK-10` finds matching entity | Positive | P0 | US-001, FR-013 |
| SC-PUBLICID-006 | Search for non-existing public ID → empty state, no wrong result returned | Negative | P0 | US-001 |
| SC-PUBLICID-007 | Public ID immutable once assigned; never changes | Positive | P0 | FR-003 |
| SC-PUBLICID-008 | Deleted item's public ID is never reused | Edge | P0 | FR-008 |
| SC-PUBLICID-009 | Concurrent creation of two conversations → both get unique public IDs (atomic uniqueness) | Edge | P0 | US-002, FR-009 |
| SC-PUBLICID-010 | Unique constraint violation → auto-retry up to 3 times; "Gagal membuat ID. Coba lagi." on final failure | Negative | P0 | FR-010, EH-001–EH-002 |
| SC-PUBLICID-011 | Backfill assigns public IDs to existing records missing them; idempotent, does not change already-assigned IDs | Positive | P1 | US-004, FR-014–FR-016 |
| SC-PUBLICID-012 | Backfill partial failure → affected item shows "ID belum tersedia"; error logged for retry | Negative | P1 | US-004, EH-003 |
| SC-PUBLICID-013 | Search input not matching `CV-[0-9]+` or `TK-[0-9]+` → "Format ID tidak valid" | Negative | P0 | EH-004 |
| SC-PUBLICID-014 | Cloned/duplicated item → receives new public ID from next sequence number | Edge | P1 | EC-002 |

---

## 12. PRD Conversation - macro
- **Status:** DEVELOPED (V1 folder but still used)
- **Surface:** Settings → Template Pesan (template list CRUD) + chat composer auto-complete
- **Relation to Conversation:** Provides reusable message templates (macros) that agents insert into conversations via shortcut
- **Requirement IDs:** User stories (list/search, create, edit, delete, insert, variables, categorize, visibility, version history, bulk import/export), error codes (400-TM01–TM04, 403-TM05, 500-TM06)

| Scenario ID | Scenario | Type | Priority | Source Req IDs |
|-------------|----------|------|----------|----------------|
| SC-MACRO-001 | Admin views template list showing Shortcut and Message columns; search updates results in ≤1s | Positive | P0 | User Story: list/search |
| SC-MACRO-002 | Admin creates template: shortcut required (starts with /), message required (multiline, ≤2000 chars); on save appears in list | Positive | P0 | User Story: create |
| SC-MACRO-003 | Shortcut blank or not starting with / → "Shortcut harus diisi dan dimulai dengan '/'." | Negative | P0 | Error: 400-TM01 |
| SC-MACRO-004 | Duplicate shortcut → "Shortcut sudah digunakan. Gunakan nama lain." | Negative | P0 | Error: 400-TM02 |
| SC-MACRO-005 | Message blank → "Pesan template tidak boleh kosong." | Negative | P0 | Error: 400-TM03 |
| SC-MACRO-006 | Admin edits template: modal pre-fills shortcut and message; shortcut uniqueness validated on save | Positive | P0 | User Story: edit |
| SC-MACRO-007 | Admin deletes template via row menu → confirmation modal → confirm → template removed | Positive | P0 | User Story: delete |
| SC-MACRO-008 | Agent types / in chat input → auto-complete list of templates appears | Positive | P0 | User Story: insert |
| SC-MACRO-009 | Agent selects template → message inserted with dynamic variables replaced (e.g. customer name); missing data shows fallback text | Positive | P0 | User Story: insert + variables |
| SC-MACRO-010 | Invalid variable token in template → "Variabel tidak dikenal: {variable}." | Negative | P1 | Error: 400-TM04 |
| SC-MACRO-011 | Agent without permission to modify template → "Anda tidak memiliki izin untuk mengubah template ini." | Permission | P0 | Error: 403-TM05 |
| SC-MACRO-012 | Templates can be assigned to category/folder; category filter available in list | Positive | P1 | User Story: categorize |
| SC-MACRO-013 | Visibility: Global (all teams), Channel-specific, or Team-specific; agents only see templates matching their scope | Positive | P1 | User Story: visibility |
| SC-MACRO-014 | Shortcut ≤30 chars, alphanumeric + underscores, unique within visibility scope | Positive | P0 | Field: Shortcut |
| SC-MACRO-015 | Server error saving template → "Gagal menyimpan template. Coba lagi nanti." | Negative | P0 | Error: 500-TM06 |
| SC-MACRO-016 | Changes propagate across all agent views within 5 seconds (real-time) | Positive | P1 | NFR: Real-time |