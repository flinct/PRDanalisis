# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticket Room  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead: Sabrina**

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-19 | Yusril Ibnu Maulana | Refactor PRD Internal Ticket Cross-Send Indicator to Ticket Room. Make Ticket for not just internal ticket but support for client too. Add detail for Ticket Room, focused on thread, composer, internal mention, and access rules. |

---

## **2\. Overview**

Ticket Room provides a single place to read the ticket thread and send messages to the customer or internal notes to teammates. Ticket Room must make message visibility explicit and prevent internal content from leaking to the customer.

| In Scope | Out of Scope |
| ----- | ----- |
| Ticket Room layout for header, description, tags, thread, composer. | Ticket Detail sidebar content and layout. |
| Message visibility model for customer reply vs internal note. | SLA section. |
| Default send mode to customer. | Ticket attributes editor. |
| Internal note mention to specific agent. | Activity log UI. |
| Access rules for mention notifications and visibility. | Customer portal UI for clients. |
| Cross-view origin indicator in Conversation Inbox for messages originated from Ticket Room. | Advanced filtering and audit dashboards. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Agents cannot reliably tell whether a message is customer visible or internal only. | Internal information can be sent to customers by mistake. |
| PS-002 | Mentions in internal notes fail silently when the mentioned agent has no access to the ticket. | Missed handoffs and delayed resolution. |
| PS-003 | In Conversation Inbox, agents lose context that a message originated from a ticket. | Confusing replies, slower investigation, weaker audit trail. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result | Target |
| ----- | ----- | ----- |
| Make visibility explicit. | % agents can identify message visibility in under 2 seconds. | 90% within 4 weeks. |
| Improve internal handoff. | % mentions delivered as notification to intended recipient. | 95% within 4 weeks. |
| Reduce wrong sends. | \# incidents of internal note leaked to customer. | 0 ongoing. |
| Improve traceability. | % agents can open the source ticket from Conversation Inbox indicator. | 90% within 4 weeks. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an agent, I want to open Ticket Room so I can read the full ticket thread and context in one place. | 1\. Given I have access to the ticket, When I open Ticket Room, Then I see header, description, tags, thread, and composer. 2\. Given the ticket fails to load, When the page renders, Then I see an error state and a retry action with text "Gagal memuat tiket. Coba lagi.". |
| US-002 | P0 | As an agent, I want the default send mode to be customer reply so I can respond faster. | 1\. Given Ticket Room loads successfully, When I view the composer, Then the default selected tab is "Balas pelanggan". 2\. Given I refresh the page, When Ticket Room reloads, Then the default selected tab remains "Balas pelanggan". |
| US-003 | P0 | As an agent, I want to switch to internal note so I can collaborate without exposing content to customers. | 1\. Given I am in Ticket Room, When I select the tab "Catatan internal", Then any message I send is stored as internal only and never delivered to the customer. 2\. Given I am in Ticket Room, When I switch between tabs, Then the draft text for each tab remains preserved separately. |
| US-004 | P0 | As an agent, I want every message bubble to clearly show its visibility so I do not confuse internal and customer messages. | 1\. Given a message is customer visible, When it is rendered in the thread, Then it shows a label "Balas pelanggan". 2\. Given a message is internal only, When it is rendered in the thread, Then it shows a label "Catatan internal". 3\. Given the message is from the customer, When it is rendered, Then it shows label "Balas pelanggan" and never "Catatan internal". |
| US-005 | P0 | As an agent, I want to mention a specific agent inside an internal note so they get notified and can take action. | 1\. Given I am typing in "Catatan internal", When I type "@", Then I see a mention picker with agents who can access the ticket. 2\. Given I select an agent from the picker, When I send the internal note, Then the selected agent receives an in app notification and can open the ticket from the notification. 3\. Given I type "@" in "Balas pelanggan", When I interact with the composer, Then no mention picker appears and "@" is treated as normal text. |
| US-006 | P0 | As an agent, I want a safe flow to mention an agent who is not part of the ticket Team Inbox so they can be granted access and receive the mention. | 1\. Given I open the mention picker, When I search and select an agent without ticket access, Then I see a confirmation prompt offering to assign them with text "Agen ini belum punya akses. Jadikan sebagai assignee agar bisa melihat tiket dan menerima notifikasi mention.". 2\. Given I confirm "Jadikan assignee", When the assignment succeeds, Then the agent is added as assignee and the mention is inserted into the note. 3\. Given I click "Batal", When the prompt closes, Then the mention is not inserted and no notification will be sent. |
| US-007 | P0 | As a mentioned agent, I want to receive the mention notification only when I actually can access the ticket. | 1\. Given I am mentioned in an internal note and I have ticket access, When the note is sent, Then I receive a notification containing actor name and excerpt. 2\. Given I am mentioned but I do not have ticket access, When the note is sent, Then I do not receive a notification and I cannot view the ticket. |
| US-008 | P1 | As an agent, I want to see where a Conversation Inbox message originated from so I can keep context. | 1\. Given a message in Conversation Inbox originated from Ticket Room, When it is rendered, Then it shows an origin label "Dari tiket \#\<Ticket ID\>". 2\. Given I click the ticket ID, When I have access, Then it opens Ticket Room in a new tab. 3\. Given I do not have access, When I click, Then it does not open and the label is not clickable. |
| US-009 | P0 | As a user without ticket access, I must not be able to open Ticket Room. | 1\. Given I am not in the ticket Team Inbox and I am not an assignee, When I try to open Ticket Room, Then I see a blocked state with text "Anda tidak punya akses untuk membuka tiket ini.". 2\. Given I become an assignee, When I retry opening Ticket Room, Then I can open it successfully. |
| US-010 | P1 | As an agent, I want to close and reopen from Ticket Room so I can control ticket lifecycle while messaging. | 1\. Given the ticket is open, When I click "Tutup", Then the ticket becomes closed and composer is disabled with text "Tiket ditutup. Buka kembali untuk membalas.". 2\. Given the ticket is closed, When I click "Buka kembali", Then the ticket becomes open and composer becomes enabled. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| FR-001 Ticket Room load and access | 1\. FR-001: System MUST load Ticket Room by Ticket ID. 2\. FR-002: System MUST show a loading state until ticket header and thread are ready. 3\. FR-003: System MUST enforce access control before rendering any ticket data. 4\. FR-004: System MUST allow access if user is a Team Inbox member for the ticket Team Inbox. 5\. FR-005: System MUST allow access if user is an assignee of the ticket, even if not a Team Inbox member. 6\. FR-006: System MUST block access otherwise and show UI copy "Anda tidak punya akses untuk membuka tiket ini.". |
| FR-002 Header and summary | 1\. FR-007: System MUST show ticket title as the primary header text. 2\. FR-008: System MUST show Ticket ID as a compact badge. 3\. FR-009: System MUST show channel label as read only text. 4\. FR-010: System MUST show customer display name as read only text. 5\. FR-011: System MUST show close or reopen action based on canonical open or closed state. 6\. FR-012: System MUST show status as a dropdown if user has permission to update status. 7\. FR-013: System MUST disable status edit when ticket is closed. |
| FR-003 Description and tags | 1\. FR-014: System MUST show description as read only text by default. 2\. FR-015: Users MUST be able to enter description edit mode by double click if they have permission. 3\. FR-016: System MUST show ticket tags as chips and allow add or remove if permission allows. |
| FR-004 Thread rendering | 1\. FR-017: System MUST render messages ordered oldest at top and newest at bottom. 2\. FR-018: System MUST align current user messages to the right and other senders to the left. 3\. FR-019: System MUST render sender name and sender role label per message. 4\. FR-020: System MUST render message timestamp per message in tenant timezone. 5\. FR-021: System MUST render delivery state for customer visible outbound messages using check icon states when available. 6\. FR-022: System MUST render attachments as clickable chips or cards per message. |
| FR-005 Message visibility model | 1\. FR-023: System MUST classify every message as either customer visible or internal only. 2\. FR-024: Customer visible messages MUST display a label "Balas pelanggan". 3\. FR-025: Internal only messages MUST display a label "Catatan internal". 4\. FR-026: Customer inbound messages MUST be customer visible and MUST never be internal only. 5\. FR-027: Internal only messages MUST never be delivered to customer channels. |
| FR-006 Composer tabs and drafts | 1\. FR-028: System MUST provide a tab switcher with "Balas pelanggan" and "Catatan internal". 2\. FR-029: System MUST default selected tab to "Balas pelanggan" on every Ticket Room open. 3\. FR-030: System MUST keep separate drafts per tab per ticket per user session. 4\. FR-031: System MUST disable send actions when ticket is closed and show helper text "Tiket ditutup. Buka kembali untuk membalas.". 5\. FR-032: System MUST prevent duplicate send while the send request is pending. |
| FR-007 Internal mention authoring | 1\. FR-033: System MUST enable mention picker only on "Catatan internal". 2\. FR-034: System MUST open mention picker when user types "@". 3\. FR-035: System MUST support searching agents by display name in the picker. 4\. FR-036: System MUST insert a structured mention token that stores the mentioned user identity when a picker item is selected. 5\. FR-037: System MUST allow multiple mentions in a single internal note. 6\. FR-038: System MUST dedupe mention recipients in the same internal note so each recipient is notified at most once per note. 7\. FR-039: System MUST limit unique mention recipients to 20 per internal note. |
| FR-008 Mention eligibility and assign to grant access | 1\. FR-040: System MUST consider an agent eligible for mention if they can access the ticket based on FR-004 and FR-005. 2\. FR-041: System MUST allow searching workspace agents outside the ticket Team Inbox from the mention picker. 3\. FR-042: If selected agent has no access, system MUST show a confirm prompt with title "Jadikan assignee?" and body "Agen ini belum punya akses. Jadikan sebagai assignee agar bisa melihat tiket dan menerima notifikasi mention.". 4\. FR-043: If user confirms, system MUST add the agent as an assignee before inserting the mention token. 5\. FR-044: If adding assignee fails, system MUST not insert the mention token and MUST show error "Gagal menugaskan agen. Coba lagi.". 6\. FR-045: If user cancels, system MUST not insert the mention token and MUST not send any mention notification to that agent. 7\. FR-046: If user lacks permission to assign, system MUST disable the confirm action and show "Anda tidak punya akses untuk menugaskan agen ini.". |
| FR-009 Mention notifications | 1\. FR-047: System MUST send an in app notification to each mentioned agent when an internal note is successfully created. 2\. FR-048: System MUST validate recipient access before creating the notification. 3\. FR-049: If recipient does not have access, system MUST not create the notification. 4\. FR-050: Notification content MUST include actor name and an excerpt of the internal note content up to 140 characters. 5\. FR-051: System MUST avoid duplicate notifications for the same mention when requests are retried within 60 seconds. 6\. FR-052: Notification action link SHOULD open Ticket Room at the specific note anchor when available. |
| FR-010 Conversation Inbox origin indicator | 1\. FR-053: System MUST render an origin label "Dari tiket \#\<Ticket ID\>" for Conversation Inbox messages that originated from Ticket Room. 2\. FR-054: System MUST not render the origin label for messages created directly in Conversation Inbox. 3\. FR-055: If user has access to the ticket, the ticket ID MUST be clickable and open Ticket Room in a new tab. 4\. FR-056: If user does not have access, the ticket ID MUST be non clickable. |
| FR-011 Audit events | 1\. FR-057: System MUST record an audit event when a customer visible message is sent. 2\. FR-058: System MUST record an audit event when an internal note is created. 3\. FR-059: System MUST record an audit event when assignees are updated via mention flow. 4\. FR-060: Audit events MUST include actor, timestamp, and ticket ID. |

---

## **7\. Error Handling**

| ID | Scenario | Handling | UI Copy (Bahasa Indonesia only) |
| ----- | ----- | ----- | ----- |
| EH-001 | Ticket fetch fails. | Block Ticket Room content and show retry. | "Gagal memuat tiket. Coba lagi." |
| EH-002 | Thread fetch fails. | Show header and description if available and show thread error with retry. | "Gagal memuat percakapan. Coba lagi." |
| EH-003 | Customer reply send fails. | Keep draft and show retry action on failed bubble state. | "Gagal mengirim ke pelanggan. Coba lagi." |
| EH-004 | Internal note send fails. | Keep draft and show retry action on failed bubble state. | "Gagal menyimpan catatan internal. Coba lagi." |
| EH-005 | Assign on mention fails. | Do not insert mention token and keep composer active. | "Gagal menugaskan agen. Coba lagi." |
| EH-006 | Permission denied for assign or status update. | Disable action and show inline hint. | "Anda tidak punya akses untuk mengubah ini." |
| EH-007 | Ticket access denied. | Block view with back navigation option. | "Anda tidak punya akses untuk membuka tiket ini." |
| EH-008 | Notification creation fails after note is saved. | Note stays saved and system retries silently, no user blocking. | "-" |

---

## **8\. Edge Cases**

| ID | Case | Handling | UI Copy (Bahasa Indonesia only) |
| ----- | ----- | ----- | ----- |
| EC-001 | User types "@" at beginning of internal note with slow network. | Open picker locally and load results with loading row. | "Memuat agen." |
| EC-002 | Mention the same agent multiple times in one note. | Dedupe recipients and notify once. | "-" |
| EC-003 | Mention search returns no results. | Show empty picker state. | "Agen tidak ditemukan." |
| EC-004 | Selected agent becomes deactivated before send. | Prevent assignment and prevent mention insertion. | "Agen sudah tidak aktif." |
| EC-005 | Ticket closed while user is typing. | Preserve drafts and disable send. | "Tiket ditutup. Buka kembali untuk membalas." |
| EC-006 | Customer message mistakenly marked internal by upstream data. | Force customer inbound messages to customer visible. | "-" |
| EC-007 | Very long note body. | Clamp bubble and keep scroll inside bubble if needed. | "-" |
| EC-008 | More than 20 unique mentions attempted. | Block extra mentions and show warning. | "Maksimal 20 mention dalam satu catatan." |
| EC-009 | User without assign permission selects agent without access. | Show prompt with disabled confirm action. | "Anda tidak punya akses untuk menugaskan agen ini." |
| EC-010 | Conversation Inbox message missing origin metadata. | Hide origin label gracefully. | "-" |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Ticket Room header | Title, Ticket ID badge, channel label, customer name, close or reopen, status dropdown. | 1\. User sees title and ID immediately. 2\. User updates status if permitted. 3\. User closes or reopens ticket. | US-001, US-010 |
| Description block | Read only by default, editable by double click if permitted. | 1\. Hover shows edit affordance. 2\. Double click to edit. 3\. Escape cancels. | US-001 |
| Tags row | Chips for ticket tags with add or remove if permitted. | 1\. User adds tag. 2\. Tag appears as chip. | US-001 |
| Message list | Oldest at top, newest at bottom, auto scroll to bottom on load. | 1\. On open, scroll to bottom. 2\. New message appears at bottom. | US-001 |
| Message bubble visibility pill | Small pill label per message: "Balas pelanggan" or "Catatan internal". | 1\. User reads pill to confirm visibility. 2\. Pill placement follows bubble alignment. | US-004 |
| Composer tabs | Tabs "Balas pelanggan" and "Catatan internal", default to "Balas pelanggan". | 1\. User selects tab. 2\. Draft preserved per tab. | US-002, US-003 |
| Mention picker | Typeahead list opened by "@" only in "Catatan internal". | 1\. User types "@". 2\. Picker shows eligible agents first. 3\. User selects agent. | US-005 |
| Assign confirm prompt for mention | Prompt shown when selected agent has no access. | 1\. System shows "Jadikan assignee?". 2\. User confirms or cancels. 3\. On confirm success, mention is inserted. | US-006 |
| Access denied view | Blocked page state. | 1\. Show message "Anda tidak punya akses untuk membuka tiket ini.". | US-009 |
| Conversation Inbox origin label | Label above bubble for ticket originated messages. | 1\. User sees "Dari tiket \#...". 2\. Click opens Ticket Room if permitted. | US-008 |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required | Editable | UI Behavior |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| ticketId | string | TK-0001025 | Non empty. Unique. | Yes | No | Display as badge. |
| title | string | Life Problem | Max 120 chars. Trim spaces. | No | No | Fallback "Tanpa judul". |
| channelLabel | string | WhatsApp API | Non empty. | Yes | No | Display in header row. |
| customerDisplayName | string | Jasper Hargrove | Max 120 chars. | No | No | Display in header row. |
| status | enum | Not started | Must match allowed statuses for ticket type. | Yes | Conditional | Disabled when ticket closed. |
| canonicalState | enum | Open | Open or Closed. | Yes | Yes | Drives "Tutup" and "Buka kembali". |
| description | string | Customer said hello... | Max 1000 chars. Trim spaces. | No | Conditional | Editable if permitted. |
| tags | string\[\] | shipping | Max 50\. Max 24 chars each. Case insensitive unique. | No | Conditional | Chips with add or remove. |
| message.id | string | msg\_123 | Non empty. Unique. | Yes | No | Internal. |
| message.visibility | enum | CLIENT or INTERNAL | Must be one of CLIENT or INTERNAL. | Yes | No | Drives pill label. |
| message.body | string | Hello | Max 4000 chars. Trim trailing spaces. | Yes | Yes | Composer text. |
| message.attachments | array | proof.jpg | Max 10 files. Max 25 MB per file. | No | Yes | Render as chips. |
| message.mentions | array | \[userId\] | Max 20 unique recipients. Must exist. | No | Yes | Only allowed for INTERNAL visibility. |
| mention.userId | string | user\_456 | Must be active user. | Yes | No | Stored from picker selection. |
| assignees | user\[\] | John Doe | Max 20\. Unique. | No | Conditional | Can be updated via mention flow if permitted. |
| originTicketId | string | TK-0001025 | Required when message originates from Ticket Room. | Conditional | No | Used to render "Dari tiket \#...". |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Ticket Room initial render P95 at or below 1.5s for header and first screen of thread. |
| Performance | Mention picker search result P95 at or below 300ms after typing stops. |
| Reliability | Send actions MUST be idempotent to prevent duplicate messages on retry. |
| Reliability | Mention notifications MUST not duplicate for retries within 60 seconds. |
| Security | Internal notes MUST never be exposed to customer channels or customer facing exports. |
| Security | Access checks MUST run before rendering data and before sending notifications. |
| Accessibility | Keyboard navigation for tabs, mention picker, send button, and prompt actions. |
| Observability | Log events for open Ticket Room, send reply, create internal note, add assignee via mention. |

---

## **12\. Dependencies & Risks**

| Type | Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| Dependency | In app notifications system supports mention notifications with access checks. | Platform | Mentions not delivered. | Use the existing notification rules for mention and access validation. |
| Dependency | Ticket access model supports assignee based access. | Platform | Mention to non inbox agent cannot work safely. | Gate the feature behind explicit assign confirmation. |
| Dependency | Conversation Inbox message metadata includes origin ticket ID. | Backend | Origin label missing. | Add additive metadata and fallback to hide label. |
| Risk | Agents assume "@" works in customer reply. | Product | Confusion and wasted time. | Hide picker in customer reply and show helper text on internal tab only. |
| Risk | Access leakage by assigning outside inbox. | Security | Unauthorized viewing. | Limit assignee access to ticket level only and enforce audits. |
| Risk | Notification noise. | Product | Users ignore mentions. | Dedupe mentions per note and suppress duplicates on retry. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Ticket Room open success rate | 99.9% | 30 days | App events |
| Mention delivery success rate | 95% | 30 days | Notification logs |
| Wrong send incidents | 0 | 30 days | Support incidents |
| Origin label click through rate | 30% | 30 days | App events |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Mention groups or roles | Faster escalation patterns. |
| Watchers separate from assignees | Better collaboration without changing routing. |
| Message search inside Ticket Room | Faster retrieval for long threads. |
| Advanced origin trace | Show multiple linked conversations or channels per ticket. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Mentions only supported in "Catatan internal". | Cannot notify teammates from customer replies. |
| Assignee based access is ticket level only. | Users may still not see other tickets in that Team Inbox. |
| Origin label is hidden if metadata missing. | Traceability not guaranteed for legacy messages. |

---

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Glossary | Ticket Room is the messaging surface for a ticket including header, thread, and composer. |
| UI Copy Glossary | "Balas pelanggan", "Catatan internal", "Tutup", "Buka kembali", "Kirim", "Lampirkan", "Gagal memuat tiket. Coba lagi.", "Anda tidak punya akses untuk membuka tiket ini.", "Jadikan assignee?", "Gagal menugaskan agen. Coba lagi." |
| Open Questions | 1\. Should Ticket Room remember last selected tab per user, or always default to "Balas pelanggan". 2\. Should assignee based access be limited by role, for example Supervisor only, or allowed for Agent when permitted. 3\. Should the origin label text be "Dari tiket" or "Dari Tiket" to match product capitalization rules. |

