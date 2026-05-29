# **Product Requirement Document (PRD)**

**Feature:** Ticketing \- Ticket Detail 

| Author | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.0 |
| **TRD** |  |

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-08 | Yusril | Initial PRD for Ticket Detail based on latest minimum requirement from lincah and client. |

## **2\. Overview**

| In Scope |
| ----- |
| Ticket detail page layout: left conversation, right sidebar. |
| Header: title, Ticket ID, indicator badge, status dropdown, close or reopen. |
| Ticket description: read-only label, double-click to edit, pencil on hover. |
| Ticket tags in header. |
| Conversation thread: message list, attachments, internal note styling, newest at bottom. |
| Composer: tab switcher reply vs internal note, auto-grow input, attach, send. |
| Sidebar sections: Ticket Assignee, SLA (collapsed summary), Ticket attributes, Client data (with client tags), Linked conversation, Activity log (compact). |
| Inline edit: team inbox, assignees, ticket status, priority, ticket tags, custom fields (when editable). |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Agents need one place to view context, update routing, and respond. | Slower response time and inconsistent handling. |
| PS-002 | SLA risk is not visible enough during handling. | Missed SLA and higher operational cost. |
| PS-003 | Ticket metadata and customer context are fragmented. | More mistakes and longer investigation time. |

## **4\. Objectives and Key Results**

| Objective | Key Result | Target |
| ----- | ----- | ----- |
| Make ticket handling faster. | Median time to send first reply after open. | \-20% within 4 weeks. |
| Reduce SLA breaches. | SLA breach rate for open tickets. | \-15% within 8 weeks. |
| Improve handling consistency. | % tickets updated with correct routing fields. | 95% within 8 weeks. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an agent, I want to open a ticket detail so I can see conversation and metadata in one view. | 1\. Given I open a ticket, When the page loads, Then I see header, description area, conversation, composer, and sidebar sections. 2\. Given the ticket data fails to load, When the page renders, Then I see an error state and a retry action. |
| US-002 | P0 | As an agent, I want to see the latest messages at the bottom so I can follow conversation naturally. | 1\. Given a ticket with messages, When it opens, Then the message list is ordered from oldest at top to newest at bottom. 2\. Given I send a message, When it succeeds, Then the new message appears at the bottom of the list. |
| US-003 | P0 | As an agent, I want to reply to customer or add internal note so I can handle work with correct visibility. | 1\. Given the composer is on tab **Balas pelanggan**, When I send, Then the message is visible to customer channel flow. 2\. Given the composer is on tab **Catatan internal**, When I send, Then the message is stored as internal and styled as internal in the thread. 3\. Given the ticket is closed, When I try to send, Then the send action is disabled and I see **Tiket ditutup. Buka kembali untuk membalas.** |
| US-004 | P0 | As an agent, I want to close or reopen a ticket so I can control ticket lifecycle. | 1\. Given the ticket is open, When I click **Tutup**, Then ticket becomes closed and composer becomes disabled. 2\. Given the ticket is closed, When I click **Buka kembali**, Then ticket becomes open and composer becomes enabled. |
| US-005 | P0 | As an agent, I want to change ticket status from a dropdown so I can track progress consistently. | 1\. Given the status dropdown is available, When I select another status, Then the status updates and an activity event is recorded. 2\. Given the update fails, When the save returns error, Then the dropdown returns to previous value and I see **Gagal memperbarui status. Coba lagi.** |
| US-006 | P0 | As an agent, I want to manage ticket tags in header so I can classify quickly. | 1\. Given I add a tag, When I confirm, Then the tag chip appears and an activity event is recorded. 2\. Given I remove a tag, When I confirm, Then the chip disappears and an activity event is recorded. |
| US-007 | P0 | As a supervisor, I want to update team inbox and assignees so routing is correct. | 1\. Given I change **Team inbox**, When I save, Then the value persists and shows in UI. 2\. Given I change **Assignee** multi-select, When I save, Then assignee list updates and an activity event is recorded. |
| US-008 | P0 | As an agent, I want to see SLA summary in sidebar so I can prioritize. | 1\. Given the SLA section is collapsed, When I view sidebar, Then I see summary chips for **FRT** and **Resolve** remaining time. 2\. Given SLA is overdue, When I view summary, Then remaining time shows negative and uses error emphasis. |
| US-009 | P1 | As an agent, I want to edit ticket description when needed so context stays accurate. | 1\. Given description exists, When I hover, Then I see a pencil affordance. 2\. Given description is read-only mode, When I double-click, Then it enters edit mode. 3\. Given I cancel edit, When I press Escape, Then content reverts to last saved value. |
| US-010 | P1 | As an agent, I want a compact activity log so I can audit changes quickly. | 1\. Given there are activity items, When I view the section, Then I see latest N items and **Lihat semua** if more exist. 2\. Given there are no items, When I view the section, Then I see **Belum ada aktivitas.** |
| US-011 | P2 | As an agent, I want to see pinned messages, media, and files sections so I can discover context faster. | 1\. Given pinned messages exist, When I view the section, Then I see a list preview and **Lihat semua**. 2\. Given media or files exist, When I view the section, Then I see preview items and **Lihat semua**. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| FR-001 Navigation and load | 1\. FR-001: System MUST load ticket detail by Ticket ID. 2\. FR-002: System MUST show loading state until ticket data is ready. 3\. FR-003: System MUST render left area for conversation and right area for sidebar. |
| FR-002 Header and summary row | 1\. FR-004: System MUST show Ticket title as primary header text. 2\. FR-005: System MUST show Ticket ID as a compact badge near title. 3\. FR-006: System MUST show exactly one indicator badge based on rules in FR-003. 4\. FR-007: System MUST show ticket tags as chips under description area, aligned left. 5\. FR-008: System MUST show channel label aligned right. 6\. FR-009: System MUST show submission date aligned right. 7\. FR-010: System MUST show last activity relative time aligned right. 8\. FR-011: System MUST place status dropdown near header actions. 9\. FR-012: System MUST place primary action button at far right. |
| FR-003 Indicator badge rules | 1\. FR-013: System MUST compute **Need reply** as true when ticket has pending customer reply requirement from backend flag. 2\. FR-014: System MUST compute **Being handled** as true when assignee count is greater than 0 and ticket is not closed. 3\. FR-015: System MUST show **Butuh balasan** when Need reply is true and ticket is not closed. 4\. FR-016: System MUST show **Sedang ditangani** when Need reply is false and Being handled is true and ticket is not closed. 5\. FR-017: System MUST hide indicator badge when ticket is closed. |
| FR-004 Description edit behavior | 1\. FR-018: System MUST show description as read-only text by default. 2\. FR-019: System MUST show pencil affordance on hover. 3\. FR-020: Users MUST enter edit mode by double-click on description area. 4\. FR-021: System MUST allow save via blur or explicit save action. 5\. FR-022: System MUST allow cancel via Escape key and revert value. 6\. FR-023: System MUST record activity event on successful save. |
| FR-005 Status dropdown | 1\. FR-024: Users MUST be able to change status from a dropdown. 2\. FR-025: System MUST support type specific status options per ticket type configuration. 3\. FR-026: System MUST persist status change to backend. 4\. FR-027: System MUST record activity event for status change. 5\. FR-028: System MUST disable status edit when ticket is closed. |
| FR-006 Close and reopen | 1\. FR-029: Users MUST be able to close an open ticket using **Tutup**. 2\. FR-030: Users MUST be able to reopen a closed ticket using **Buka kembali**. 3\. FR-031: System MUST disable composer when ticket is closed. 4\. FR-032: System MUST show disabled state helper text when ticket is closed. 5\. FR-033: System MUST record activity event for close and reopen. |
| FR-007 Conversation thread | 1\. FR-034: System MUST render messages ordered oldest at top and newest at bottom. 2\. FR-035: System MUST visually differentiate messages sent by current user with a distinct background. 3\. FR-036: System MUST show sender name and role badge for each message. 4\. FR-037: System MUST support role badges for AGENT, CLIENT, CUSTOM (API). 5\. FR-038: System MUST render internal notes with an **Internal** badge and internal styling. 6\. FR-039: System MUST show message timestamp per message. 7\. FR-040: System MUST render attachment items as chips or cards per message. |
| FR-008 Composer | 1\. FR-041: System MUST place composer fixed at bottom of conversation column. 2\. FR-042: System MUST provide tab switcher for **Balas pelanggan** and **Catatan internal**. 3\. FR-043: System MUST auto-grow input height from 2 lines up to 6 lines and then scroll. 4\. FR-044: System MUST place **Lampirkan** and **Kirim** actions at composer bottom area. 5\. FR-045: System MUST show sending state and prevent duplicate send while pending. 6\. FR-046: System MUST show error state on failed send with retry guidance. |
| FR-009 Sidebar layout and order | 1\. FR-047: System MUST render sidebar sections in this order. 2\. FR-048: System MUST show Ticket Assignee section above SLA section. 3\. FR-049: System MUST show SLA section above Ticket attributes section. 4\. FR-050: System MUST show Ticket attributes above Client data. 5\. FR-051: System MUST show Linked conversation below Client data when available. 6\. FR-052: System MUST show Activity log section at bottom with compact view. |
| FR-010 Ticket Assignee section | 1\. FR-053: System MUST show Team inbox as editable dropdown. 2\. FR-054: System MUST show Assignee as editable multi-select control. 3\. FR-055: System MUST allow empty assignee state and show **Belum ditugaskan**. 4\. FR-056: System MUST record activity event on successful update. |
| FR-011 SLA section | 1\. FR-057: System MUST show SLA as collapsible section. 2\. FR-058: System MUST show collapsed summary chips for FRT and Resolve remaining time. 3\. FR-059: System MUST show negative duration when overdue. 4\. FR-060: System MUST emphasize overdue values visually. 5\. FR-061: System MUST hide SLA countdown when ticket is closed and resolved SLA is not relevant. 6\. FR-062: System MAY show stage SLA breakdown when backend provides stage data. |
| FR-012 Ticket attributes section | 1\. FR-063: System MUST show Ticket type as read-only plain text. 2\. FR-064: System MUST render custom fields by ticket type configuration. 3\. FR-065: System MUST render field types for text, select, date, attachment link. 4\. FR-066: System MUST show read-only fields as plain text without input styling. 5\. FR-067: System MUST show editable fields with appropriate input control when editable is true. 6\. FR-068: System MUST record activity event on custom field edit. |
| FR-013 Client data section | 1\. FR-069: System MUST show Name, Email, Phone as read-only plain text. 2\. FR-070: System MUST show client tags within client data section. 3\. FR-071: Users MUST be able to add and remove client tags if permission allows. |
| FR-014 Ticket tags in header | 1\. FR-072: System MUST show ticket tags as chips near channel area per layout rules. 2\. FR-073: Users MUST be able to add and remove ticket tags if permission allows. 3\. FR-074: System MUST prevent duplicate tags by case-insensitive comparison. |
| FR-015 Linked conversation | 1\. FR-075: System MUST show linked conversation section only when linked conversation exists. 2\. FR-076: System MUST show conversation name, last message snippet, and relative time. 3\. FR-077: Users MUST be able to open linked conversation in a new view if permitted. |
| FR-016 Activity log | 1\. FR-078: System MUST show compact activity list with latest 5 items by default. 2\. FR-079: System MUST show **Lihat semua** when more than 5 items exist. 3\. FR-080: System MUST include event types for assignment change, status change, close or reopen, priority change, tag add or remove, custom field edit, description edit. |

## **7\. Error Handling**

| ID | Scenario | Handling | UI Copy (Bahasa Indonesia only) |
| ----- | ----- | ----- | ----- |
| EH-001 | Ticket fetch fails. | Block page content. Show retry. | Gagal memuat tiket. Coba lagi. |
| EH-002 | Messages fetch fails. | Show ticket header and sidebar. Show message area error with retry. | Gagal memuat percakapan. Coba lagi. |
| EH-003 | Status update fails. | Revert to previous value. Keep dropdown usable. | Gagal memperbarui status. Coba lagi. |
| EH-004 | Close fails. | Keep ticket open. Show retry. | Gagal menutup tiket. Coba lagi. |
| EH-005 | Reopen fails. | Keep ticket closed. Show retry. | Gagal membuka kembali tiket. Coba lagi. |
| EH-006 | Send message fails. | Keep draft text. Allow retry send. | Gagal mengirim pesan. Coba lagi. |
| EH-007 | Attachment upload fails. | Keep composer active. Allow remove failed file. | Gagal mengunggah lampiran. Coba lagi. |
| EH-008 | Assignee update fails. | Revert selection. Keep control openable. | Gagal memperbarui penugasan. Coba lagi. |
| EH-009 | Team inbox update fails. | Revert selection. | Gagal memperbarui team inbox. Coba lagi. |
| EH-010 | Permission denied for edit actions. | Disable controls. Show inline hint. | Anda tidak punya akses untuk mengubah ini. |

## **8\. Edge Cases**

| ID | Case | Handling | UI Copy (Bahasa Indonesia only) |
| ----- | ----- | ----- | ----- |
| EC-001 | Ticket has no title. | Show fallback title. | Tanpa judul |
| EC-002 | Ticket has no description. | Show empty placeholder label. | Tambahkan deskripsi |
| EC-003 | Ticket has no tags. | Show add affordance only. | Tambah tag |
| EC-004 | Ticket has no assignee. | Show **Belum ditugaskan**. | Belum ditugaskan |
| EC-005 | Customer contact not available for channel. | Hide missing fields in client data. | \- |
| EC-006 | SLA due timestamp missing. | Show dash and no countdown. | \- |
| EC-007 | SLA overdue. | Show negative duration and error emphasis. | \- |
| EC-008 | Very long message body. | Clamp within bubble and allow internal scroll for bubble if needed. | \- |
| EC-009 | Many attachments in one message. | Wrap chips and cap visible items with view more in P2. | Lihat semua |
| EC-010 | Activity list very long. | Show first 5 and view more. | Lihat semua |
| EC-011 | Linked conversation removed. | Hide section and show not available state. | Percakapan terkait tidak tersedia. |
| EC-012 | Ticket closed while user is typing. | Preserve draft. Disable send. | Tiket ditutup. Buka kembali untuk membalas. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Header title row | Title text, badge Ticket ID, single indicator badge, status dropdown, primary action button. | 1\. User sees title and Ticket ID immediately. 2\. User changes status via dropdown. 3\. User closes or reopens via button at far right. | US-001, US-004, US-005 |
| Indicator badge | Show only one badge: **Butuh balasan** or **Sedang ditangani** based on rules. | 1\. User sees badge near title area. 2\. Badge disappears when ticket closed. | US-001 |
| Description block | Full width within conversation column, read-only text style, pencil on hover, double-click to edit. | 1\. Hover shows pencil affordance. 2\. Double-click enters edit mode. 3\. Blur saves or Escape cancels. | US-009 |
| Ticket tags row | Chips aligned left. Add and remove interactions. | 1\. User removes a tag by clicking x. 2\. User adds a tag via plus action and confirms. | US-006 |
| Meta row aligned right | Channel label, submission date, last activity relative time, aligned right side of header area. | 1\. User sees channel and dates without scrolling. 2\. Hover on time shows exact timestamp tooltip. | US-001 |
| Message list | Oldest at top, newest at bottom. Sender info and role badge per message. Own messages have distinct background. Internal notes have internal styling and badge. | 1\. Open ticket scrolls to bottom by default. 2\. Read messages upward. 3\. Own messages visually distinct. | US-002 |
| Attachment chips | Show attachments as chips inside message bubble. | 1\. Click chip opens attachment viewer in new surface. | US-002 |
| Composer container | Fixed at bottom. Tab switcher for **Balas pelanggan** and **Catatan internal**. Auto-grow input. Buttons **Lampirkan** and **Kirim** bottom right. | 1\. User selects tab. 2\. User types message. 3\. User attaches file optional. 4\. User sends and sees sending state. | US-003 |
| Sidebar section order | Right sidebar sections: Ticket Assignee, SLA, Ticket attributes, Client data, Linked conversation, Activity log. | 1\. User scans routing first. 2\. User checks SLA next. 3\. User edits attributes. 4\. User reviews customer info. | US-007, US-008 |
| Ticket Assignee section | Editable Team inbox dropdown and Assignee multi-select. Read-only labels for rest. | 1\. User changes Team inbox. 2\. User changes assignee list. 3\. Save feedback appears. | US-007 |
| SLA section | Collapsed by default with summary chips for FRT and Resolve. Expanded shows stage breakdown when available. | 1\. Collapsed shows remaining time. 2\. Overdue shows negative and error emphasis. 3\. Expand reveals stage list if provided. | US-008 |
| Ticket attributes section | Ticket type read-only. Custom fields with consistent row height. Read-only fields are plain text. Editable fields use inputs. Attachment field uses action label **Tampilkan gambar**. | 1\. User sees ticket type. 2\. User edits allowed fields. 3\. Read-only fields remain plain text. | US-001, US-007 |
| Client data section | Only Name, Email, Phone, Tags. Client tags are inside this section. | 1\. User views contact quickly. 2\. User manages client tags if allowed. | US-001 |
| Linked conversation | Shows conversation name, last snippet, relative time. Hidden when none. | 1\. User opens linked conversation if needed. | US-015 |
| Activity log | Compact list with **Lihat semua** when more items exist. | 1\. User scans last changes. 2\. User clicks view more for full list. | US-010 |
| P2 sections visible | UI may include **Pesan dipin**, **Media**, **File** sections in sidebar. | 1\. User sees preview lists. 2\. User clicks **Lihat semua** to expand in future scope. | US-011 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required | Editable | UI Behavior |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| ticketId | string | TK-6749104949 | Non-empty. Unique. | Yes | No | Shown as badge near title. |
| title | string | Life Problem | Max 120 chars. Trim spaces. | No | No | Show fallback **Tanpa judul** when empty. |
| description | string | Customer said hello... | Max 1000 chars. Trim spaces. | No | Yes | Double-click to edit. Pencil on hover. |
| channel | enum | WA | One of allowed channels. | Yes | No | Shown aligned right with icon optional. |
| submissionDate | datetime | 2025-09-05 09:15 WIB | Valid timestamp. Tenant timezone. | Yes | No | Shown aligned right. Tooltip exact time. |
| lastActivityAt | datetime | 5m | Valid timestamp. | Yes | No | Show relative. Hover exact. |
| ticketTags | string\[\] | shipping | 50 tags max. Each tag 1 to 24 chars. No duplicates case-insensitive. | No | Yes | Chips under header area. |
| status | enum | Not started | Must match ticket type config list. | Yes | Yes | Dropdown. Disabled when closed. |
| canonicalState | enum | Open | Open or Closed. | Yes | Yes | Drives **Tutup** and **Buka kembali**. |
| teamInbox | enum | Lincah | Must be valid inbox for tenant. | Yes | Yes | Dropdown in Ticket Assignee. |
| assignees | user\[\] | John Doe | Max 20 selected. | No | Yes | Multi-select. Empty shows **Belum ditugaskan**. |
| needsReply | boolean | true | Boolean. | Yes | No | Drives indicator badge **Butuh balasan**. |
| frtDueAt | datetime | 1h 21m | Valid timestamp. | No | No | Used for SLA countdown and overdue. |
| resolveDueAt | datetime | 5h 17m | Valid timestamp. | No | No | Used for SLA countdown and overdue. |
| stageSla\[\] | array | Active | Each item needs stage, dueAt, status. | No | No | Shown only if provided. Collapsed by default. |
| ticketType | string | Mystery Ticket | Non-empty. | Yes | No | Shown in Ticket attributes. |
| customFields\[\] | array | Custom Attribute 1 | Each field has key, label, type, value, editable. | No | Conditional | Render control by type. |
| client.name | string | Brian Wakwaw | Max 120 chars. | No | No | Plain text. |
| client.email | string | bapakmana@mail.com | Email format when present. | No | No | Plain text. |
| client.phone | string | \+62 812... | Phone format when present. | No | No | Plain text. |
| client.tags | string\[\] | chat | Same tag rules as ticket tags. | No | Yes | Chips inside client data section. |
| linkedConversation | object | Jasper Hargrove | Must include id and display fields. | No | No | Hidden if null. |
| messages\[\] | array | messageId | Must include id, createdAt, senderLabel, sourceType, body. | Yes | No | Render in thread. Newest at bottom. |
| message.body | string | Lorem ipsum | Max 4000 chars. | Yes | Yes | Composer input. |
| message.attachments\[\] | array | proof.jpg | Max 10 files per send. Max 25 MB per file. | No | Yes | Shown as chips. |
| activity\[\] | array | assignment change | Must include createdAt, actor, eventType, payload. | No | No | Compact list with view more. |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Ticket detail load P95 \<= 1.5s. |
| Performance | Send message UI acknowledgement \<= 300ms after success response. |
| Reliability | Optimistic UI for inline edits with rollback on error. |
| Accessibility | Keyboard reachable controls for status, tabs, send, and sidebar inputs. |
| Accessibility | Color contrast for badges meets WCAG AA. |
| Localization | All UI labels and messages in Bahasa Indonesia. |
| Observability | Log events for open ticket, send message, close or reopen, and field edits. |

## **12\. Dependencies & Risks**

| Type | Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| Dependency | Backend provides needsReply flag. | Backend | Indicator badge incorrect. | Define contract and test fixtures. |
| Dependency | SLA timestamps for FRT and Resolve. | Backend | SLA section misleading. | Allow empty SLA state. |
| Dependency | Ticket type config for status options and custom fields. | Backend | Status dropdown inconsistent. | Central config and validation. |
| Risk | Confusion between status vs closed state. | Product | Wrong usage by agents. | UI labels and disable rules. |
| Risk | Message send fails frequently on channel. | Backend | Agent frustration. | Clear retry UX and error copy. |
| Risk | Permission mismatches on editable fields. | Platform | Unauthorized edits. | Gate controls and show access hint. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Ticket detail open success rate | 99.9% | 30 days | App events |
| Median time to first reply after open | \-20% | 4 weeks | App events |
| SLA breach rate | \-15% | 8 weeks | Ticket analytics |
| % tickets with correct routing fields set | 95% | 8 weeks | Ticket data |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Pinned messages | Faster context retrieval for long threads. |
| Media gallery | Faster evidence review. |
| Files list | Faster access to invoices and documents. |
| Advanced activity filters | Faster audits for large teams. |
| Real time updates | Reduce manual refresh and conflicts. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Pinned messages, media, files are UI-only in MVP. | Users cannot fully manage or browse these yet. |
| No escalation action. | Some workflows remain manual. |
| No copy Ticket ID action. | Users must select text manually if needed. |

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| UI Copy glossary | **Tutup**, **Buka kembali**, **Balas pelanggan**, **Catatan internal**, **Lampirkan**, **Kirim**, **Butuh balasan**, **Sedang ditangani**, **Belum ditugaskan**, **Lihat semua**, **Gagal memuat tiket. Coba lagi.** |
| Status model | Closed state is separate from status dropdown. Closed disables composer and status edits. |
| Activity event list | assignment change, team inbox change, status change, close, reopen, tag add, tag remove, client tag add, client tag remove, custom field edit, description edit, message sent. |
| Data contract hints | Ticket, Messages, Activity, SLA, Linked conversation fields as defined in Section 10\. |

Ref: [https://chatgpt.com/canvas/shared/695f57fc15108191bbfdd8adfcf94cd9](https://chatgpt.com/canvas/shared/695f57fc15108191bbfdd8adfcf94cd9) 