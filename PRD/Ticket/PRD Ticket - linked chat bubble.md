# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticketing Patch \- Linked Chat Bubble Append, Remove, Navigation, and Reply-Based Sync  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-22 | Yusril Ibnu | Initial PRD patch for append to existing ticket, remove linked bubble, clickable linked bubble navigation, and reply-based sync from conversation to ticket. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Extend Ticketing V2 so agents can manage ticket context directly from chat bubbles without losing source context. This patch adds append to existing ticket, remove linked bubble, clickable linked bubble navigation, and reply-based sync for supported channels. |
| Scope | This patch focuses on active tickets created or enriched from chat bubbles in the same conversation only. It does not change ticket type configuration, SLA engine design, or cross-conversation linking. |

| In Scope | Out of Scope |
| ----- | ----- |
| Create new ticket from selected customer chat bubbles. | Cross-conversation bubble linking. |
| Append selected customer chat bubbles to an existing active ticket. | Auto-sync all future messages without reply reference. |
| Remove linked customer chat bubbles from an active ticket. | Append to done or resolved tickets. |
| Click linked bubble from ticket detail and open source conversation thread in the right panel. | Linking one bubble to multiple tickets. |
| Highlight source bubble and support append from the conversation thread panel. | Fuzzy matching of replies on channels without reply reference support. |
| Ticket reply to customer quotes the latest linked customer bubble for supported channels. | Changes to ticket status model or ticket SLA rules. |
| Inbound customer reply sync to ticket by reply reference only for supported channels. | Support for agent bubbles or internal notes as linked ticket source bubbles in this phase. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Agents must move back and forth between Inbox and Ticket to find the source bubble again. | Ticket workflow feels inefficient, slows handling, and reduces ticket feature adoption. |
| PS-002 | Linked chat bubbles inside Ticket are not navigable and cannot be extended into the full source thread. | Agents lose context when reviewing the issue and spend extra time searching manually. |
| PS-003 | Current linkage flow supports create new ticket only and does not support append, remove, or reply-based inbound sync. | Ticket context becomes incomplete and the ticket room drifts away from the actual customer conversation. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Reduce context switching between Inbox and Ticket | At least 80% of bubble-linked ticket actions are completed without leaving the ticket page. |
| Make ticket context easier to maintain | At least 90% of agents can append or remove linked bubbles successfully on first attempt in usability testing. |
| Preserve conversation continuity inside ticket | 100% of supported reply-reference inbound replies to active tickets are linked to the correct ticket. |
| Improve ticket workflow adoption | Ticket creation or append from bubble selection increases by at least 30% within 60 days after release. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to create a new ticket from selected customer chat bubbles so I can capture the exact issue context. | 1\. Given I select one or more eligible customer bubbles in a conversation, When I click **"Buat Tiket"**, Then the system opens the create ticket flow with those bubble references attached. 2\. Given my selection contains a bubble already linked to another ticket, When I continue, Then the system blocks that bubble and shows **"Bubble sudah terhubung ke tiket lain"**. 3\. Given my selection contains non-customer bubbles or internal notes, When I continue, Then the system rejects those items and shows **"Hanya bubble pelanggan yang bisa dipilih"**. |
| US-002 | P0 | As an Agent, I want to append selected customer chat bubbles to an existing active ticket so I can enrich the ticket without creating a new one. | 1\. Given I select eligible customer bubbles from a conversation, When I choose **"Tambahkan ke tiket"**, Then I can select only active tickets from the same conversation. 2\. Given the target ticket is in status Done or Resolved, When I try to append, Then the ticket is not selectable and shows **"Hanya tiket aktif yang bisa ditambahkan bubble"**. 3\. Given a selected bubble is already linked to the same target ticket, When I confirm append, Then the system skips the duplicate and shows **"Beberapa bubble sudah ada di tiket ini"**. |
| US-003 | P0 | As an Agent, I want each linked customer bubble to belong to only one ticket so ticket traceability stays clear. | 1\. Given a customer bubble is already linked to any ticket, When I try to link it to another ticket, Then the system blocks the action and shows **"Satu bubble hanya boleh untuk satu tiket"**. 2\. Given a user tries bulk append with mixed eligible and ineligible bubbles, When validation runs, Then the system appends only valid bubbles and shows a summary of skipped items. 3\. Given the bubble is linked to a ticket, When I view it in Inbox or Ticket, Then a clear linked-ticket indicator is visible. |
| US-004 | P0 | As an Agent, I want to remove a linked bubble from an active ticket if it was added by mistake. | 1\. Given a ticket is active, When I remove a linked bubble and confirm, Then that bubble is detached from the ticket and the audit log is updated. 2\. Given the removed bubble is the current default quote source, When removal succeeds, Then the system recalculates the next latest linked customer bubble automatically. 3\. Given all linked customer bubbles have been removed, When the agent opens **"Balas ke pelanggan"**, Then the action is disabled and shows **"Tambahkan bubble pelanggan terlebih dahulu"**. |
| US-005 | P0 | As an Agent, I want linked bubbles in ticket detail to be clickable so I can open the exact source context. | 1\. Given I click a linked bubble in **"Tautan Tiket"**, When the right panel opens, Then the ticket detail panel is replaced by the conversation thread panel for the same conversation. 2\. Given the conversation thread panel opens, When loading finishes, Then the source bubble is auto-scrolled into view and highlighted. 3\. Given I want to return to the ticket detail panel, When I click **"Kembali ke detail tiket"**, Then the original ticket detail panel is restored without losing ticket room state. |
| US-006 | P0 | As an Agent, I want to append more customer bubbles from the conversation thread panel opened from Ticket so I can maintain ticket context in one place. | 1\. Given I am in the conversation thread panel from Ticket, When I select more eligible customer bubbles, Then I can append them to the current active ticket directly. 2\. Given the current ticket is no longer active, When I try to append from this panel, Then the action is blocked and shows **"Tiket ini sudah selesai dan tidak bisa ditambahkan bubble"**. 3\. Given I select a bubble already linked elsewhere, When I append, Then the system blocks that bubble and explains why. |
| US-007 | P0 | As an Agent, I want replies sent from Ticket to quote the latest linked customer bubble so the customer sees clear context. | 1\. Given an active ticket has at least one linked customer bubble, When I send **"Balas ke pelanggan"** from ticket room on a channel that supports reply reference, Then the outbound message is sent as a reply to the latest linked customer bubble. 2\. Given the channel does not support reply reference, When I send from ticket room, Then the message is sent normally without quote and the ticket still stores the outbound message. 3\. Given there is no linked customer bubble, When I try to reply to customer, Then send is blocked and the UI shows **"Tambahkan bubble pelanggan terlebih dahulu"**. |
| US-008 | P0 | As an Agent, I want inbound customer replies to ticket-sent messages to appear in the active ticket automatically so the issue stays in one thread. | 1\. Given an agent sent a message from ticket room and the channel supports reply reference, When the customer replies to that exact message, Then the inbound message is auto-linked into the same active ticket. 2\. Given the referenced ticket is already Done or Resolved, When the customer replies, Then the inbound message stays only in Inbox conversation and is not appended to the ticket. 3\. Given the channel does not support reply reference or the reference cannot be resolved, When inbound arrives, Then the system does not auto-link to ticket and no fuzzy matching is attempted. |
| US-009 | P1 | As a Supervisor or Admin, I want all append, remove, and reply-based sync actions audited so ticket history remains trustworthy. | 1\. Given any append or remove action happens, When the action succeeds, Then audit log stores actor, time, ticket ID, conversation ID, and bubble IDs affected. 2\. Given reply-based inbound sync happens, When the system links inbound to ticket, Then audit log stores trigger type as reply-reference sync. 3\. Given an action fails validation, When the user is blocked, Then the failed attempt is logged for traceability. |
| US-010 | P1 | As an Agent, I want the system to stay efficient when a ticket has many linked bubbles so it remains usable. | 1\. Given a ticket has many linked bubbles, When I open **"Tautan Tiket"**, Then linked items load in a stable order using the latest linked bubble first. 2\. Given linked bubble count exceeds the ticket limit, When I try to append more, Then the system blocks the action and shows **"Batas bubble tiket tercapai"**. 3\. Given the linked bubble list is long, When the section renders, Then it remains scrollable and does not break the ticket layout. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Linking Eligibility | 1\. FR-001: System MUST allow ticket bubble linking only from customer or client message bubbles. 2\. FR-002: System MUST reject agent bubbles, internal notes, system messages, and deleted messages for create or append. 3\. FR-003: System MUST support create new ticket and append to existing ticket from selected bubbles in the same conversation only. |
| Ticket Status Rules | 1\. FR-004: System MUST allow append and remove actions only for active tickets. 2\. FR-005: Active ticket means any ticket not in Done or Resolved state. 3\. FR-006: System MUST block append and remove for Done or Resolved tickets. |
| Bubble Uniqueness | 1\. FR-007: One bubble MUST belong to one ticket only. 2\. FR-008: If a bubble is already linked to another ticket, system MUST block linking it to a second ticket. 3\. FR-009: If a bubble is already linked to the same ticket, system SHOULD ignore duplicate append and surface a non-blocking warning. |
| Create and Append Flow | 1\. FR-010: From bubble selection, system MUST provide two actions when at least one eligible bubble is selected: **"Buat Tiket"** and **"Tambahkan ke tiket"**. 2\. FR-011: **"Tambahkan ke tiket"** MUST show only active tickets from the same conversation. 3\. FR-012: If no active ticket exists in the conversation, system MUST disable append and show **"Belum ada tiket aktif"**. 4\. FR-013: System MUST preserve linked message references when a ticket is created or appended from selected bubbles. |
| Remove Linked Bubble | 1\. FR-014: System MUST allow removing an individual linked bubble from an active ticket with confirmation. 2\. FR-015: Remove action MUST update linked bubble count, ticket metadata, and audit log immediately after success. 3\. FR-016: If removed bubble is the current default quote source, system MUST recalculate the latest linked customer bubble as the new quote source. 4\. FR-017: If no linked customer bubble remains, system MUST keep the ticket active but disable customer reply from ticket until at least one customer bubble is linked again. |
| Ticket Reply Behavior | 1\. FR-018: Ticket room MUST support **"Balas ke pelanggan"** using the original source conversation and channel. 2\. FR-019: For channels that support reply reference, outbound message from ticket MUST quote the latest linked customer bubble. 3\. FR-020: For channels that do not support reply reference, outbound message MUST be sent normally without quote. 4\. FR-021: Ticket room MUST still store outbound ticket messages even when the channel cannot quote. |
| Reply-Based Inbound Sync | 1\. FR-022: System MUST auto-link inbound customer reply to an active ticket only when reply reference points to an outbound message previously sent from that ticket room. 2\. FR-023: System MUST NOT auto-link inbound by keyword matching, time proximity, or sender guesswork. 3\. FR-024: If the ticket is Done or Resolved, inbound reply MUST remain only in the conversation and MUST NOT be appended to the ticket. 4\. FR-025: Auto-linked inbound ticket message MUST preserve original conversation message ID and ticket message relation. |
| Linked Bubble Navigation | 1\. FR-026: Linked bubbles shown in ticket detail MUST be clickable. 2\. FR-027: Clicking a linked bubble MUST replace the right-side ticket detail panel with a conversation thread panel for the same conversation. 3\. FR-028: Conversation thread panel MUST auto-scroll to the clicked source bubble and visually highlight it. 4\. FR-029: Conversation thread panel MUST provide a clear back action to restore ticket detail panel state. 5\. FR-030: From this thread panel, user MUST be able to select additional eligible customer bubbles and append them to the same active ticket. |
| Ordering and Limits | 1\. FR-031: Linked bubbles MUST be ordered by message timestamp descending in ticket detail, with the latest linked customer bubble used as default quote source. 2\. FR-032: System MUST keep the existing max linked message limit per ticket at 50\. 3\. FR-033: When limit is reached, create and append flows MUST block additional linked bubbles. |
| Permissions | 1\. FR-034: Users MUST have ticket edit permission to append or remove linked bubbles. 2\. FR-035: Users MUST have ticket view permission to open linked bubble navigation from ticket detail. 3\. FR-036: Users without permission MUST see disabled actions or no action at all. |
| Auditability | 1\. FR-037: System MUST record create, append, remove, panel-open navigation trigger, and reply-based sync in audit history. 2\. FR-038: Audit entries MUST include ticket ID, conversation ID, actor, timestamp, and affected bubble IDs. 3\. FR-039: System MUST record failed validation attempts for blocked append and remove actions. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Invalid Bubble Type | Block create or append if selected item is not a customer bubble. | Show **"Hanya bubble pelanggan yang bisa dipilih"**. |
| EH-002 | Already Linked Elsewhere | Block bubbles already linked to another ticket. | Show **"Bubble sudah terhubung ke tiket lain"**. |
| EH-003 | Same Ticket Duplicate | Skip bubbles already linked to the current ticket. | Show **"Beberapa bubble sudah ada di tiket ini"**. |
| EH-004 | No Active Ticket | Disable append flow if conversation has no active ticket. | Show **"Belum ada tiket aktif"**. |
| EH-005 | Closed Ticket | Block append or remove if ticket is Done or Resolved. | Show **"Hanya tiket aktif yang bisa diubah bubble-nya"**. |
| EH-006 | Limit Reached | Block append when linked bubble limit is reached. | Show **"Batas bubble tiket tercapai"**. |
| EH-007 | Remove Last Source Then Reply | Disable customer reply from ticket when no linked customer bubble remains. | Show **"Tambahkan bubble pelanggan terlebih dahulu"**. |
| EH-008 | Source Bubble Missing | If clicked linked bubble no longer exists in source thread, keep panel open with safe fallback. | Show **"Bubble sumber tidak ditemukan"** and keep thread panel open. |
| EH-009 | Unsupported Reply Reference | Do not auto-link inbound when channel lacks reply-reference support. | No blocking error. Show no ticket auto-sync badge. |
| EH-010 | Reference Resolution Failed | Do not append inbound reply if reference cannot be matched to a ticket outbound message. | Show internal log only. User sees normal conversation message. |
| EH-011 | Permission Denied | Block append, remove, or navigation if user lacks permission. | Show **"Akses ditolak"**. |
| EH-012 | Save Failure | Retry save up to 3 times for append or remove. If still fails, revert UI to last saved state. | Show **"Gagal menyimpan perubahan. Coba lagi"** with **"Coba lagi"** action. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Mixed valid and invalid bubble selection | System processes valid customer bubbles only and skips invalid ones. | Show summary warning with skipped count. |
| EC-002 | User removes the latest linked bubble | System recalculates the next latest linked customer bubble as default quote source. | No modal after success. |
| EC-003 | User removes all linked customer bubbles | Ticket remains valid but cannot send customer reply from ticket. | Show disabled **"Balas ke pelanggan"** state. |
| EC-004 | Linked bubble belongs to a deleted ticket record | System treats the bubble as linked and blocks reuse until data is repaired. | Show **"Bubble sudah terhubung ke tiket lain"**. |
| EC-005 | Ticket has multiple linked bubbles with identical timestamps | System uses latest created linkage record as tie-breaker. | No special UI. |
| EC-006 | Inbound reply references an older ticket outbound message | If ticket is still active, system appends inbound to that ticket even if newer linked bubbles exist. | Show message in ticket room in chronological order. |
| EC-007 | User opens linked bubble thread panel and ticket updates in real time | Thread panel remains open and append state stays valid unless ticket becomes inactive. | If ticket becomes inactive, disable append and show warning. |
| EC-008 | Source conversation is group chat | Same rules apply. Bubble linking and reply-based sync work only if the channel supports reply reference. | Show normal conversation thread panel. |
| EC-009 | User selects a bubble already linked to a ticket from a different page state | Server-side validation decides final result and client state is refreshed. | Show latest status toast after refresh. |
| EC-010 | Inbound reply arrives after ticket changed to Resolved seconds earlier | System follows current ticket state at processing time and does not append. | Message stays only in Inbox conversation. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Bubble Selection Action Bar | Shows contextual actions after eligible bubble selection. | User selects customer bubbles in conversation. Action bar shows **"Buat Tiket"** and **"Tambahkan ke tiket"** if applicable. | US-001, US-002 |
| Append to Ticket Selector | Ticket picker limited to active tickets from the same conversation. | User clicks **"Tambahkan ke tiket"**, chooses ticket, confirms append. | US-002, US-003 |
| Linked Bubble Chips or Cards in Ticket Detail | Displays linked customer bubbles in **"Tautan Tiket"** section with click support and remove action. | User opens ticket detail, sees linked bubble list, clicks one to navigate or removes one with confirmation. | US-004, US-005 |
| Remove Confirmation | Explicit confirmation before removing a linked bubble. | User clicks remove, sees confirmation, confirms or cancels. | US-004 |
| Ticket Detail Right Panel | Default panel mode showing ticket metadata and linked bubble section. | User stays in ticket mode until a linked bubble is clicked. | US-005 |
| Conversation Thread Panel from Ticket | Replaces ticket detail panel with the full source conversation bubble list for the same conversation. | User clicks linked bubble, panel switches, source bubble is highlighted, user can select more bubbles and append. | US-005, US-006 |
| Back to Ticket Detail Action | Returns from conversation thread panel to ticket detail. | User clicks **"Kembali ke detail tiket"**, ticket detail panel reappears without leaving the ticket page. | US-005 |
| Ticket Reply Composer | Keeps separate modes **"Catatan internal"** and **"Balas ke pelanggan"**. Customer reply requires linked customer bubble. | User switches to **"Balas ke pelanggan"**, sends outbound using latest linked customer bubble for supported channels. | US-007 |
| Reply Source Hint | Shows which linked customer bubble will be used as current quote source. | User opens customer reply composer and sees brief hint such as latest linked bubble timestamp or preview. | US-007 |
| Auto-Synced Reply Indicator | Indicates that inbound message was linked into ticket by reply reference. | Customer replies to a ticket-sent message and inbound appears in ticket room with subtle sync label. | US-008 |
| Empty and Disabled States | Prevents invalid action while guiding the user to the next valid step. | No active ticket, no linked customer bubble, closed ticket, or no permission all surface clear disabled states. | US-002, US-004, US-007 |

## **10\. Field & Validation**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| ticket\_id | String | Must exist and belong to the same workspace. | Required |
| source\_conversation\_id | String | Must match the conversation where selected bubbles originate. | Required |
| linked\_bubble\_ids | Array of String | 1\. Min 1 bubble for create or append. 2\. Max 50 total linked bubbles per ticket. 3\. Every bubble must belong to the same conversation. 4\. Every bubble must be a customer bubble. 5\. Bubble must not already belong to another ticket. | Required |
| append\_target\_ticket\_id | String | 1\. Must be active. 2\. Must belong to the same conversation. 3\. Must be visible to the user. | Conditional |
| remove\_bubble\_id | String | Must already be linked to the current active ticket. | Conditional |
| latest\_linked\_customer\_bubble\_id | String | Derived field. Used as default quote source for supported channels. Must recalculate after append or remove. | Derived |
| outbound\_ticket\_message\_id | String | Stored for reply-reference matching from inbound messages. | Auto |
| inbound\_reply\_reference\_id | String | Used only when channel supports reply reference. Must map to a ticket outbound message to auto-link inbound. | Conditional |
| panel\_mode | Enum | Allowed values: `ticket_detail`, `conversation_thread`. | Required |
| panel\_highlight\_bubble\_id | String | If provided, must exist in source conversation. | Optional |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | 1\. Open linked bubble thread panel in under 1 second at P95. 2\. Append or remove linked bubble in under 700 ms at P95. 3\. Reply-reference inbound sync decision in under 500 ms at P95. |
| Reliability | 1\. Append and remove actions must be idempotent. 2\. Reply-based inbound sync accuracy for supported channels must be at least 99%. |
| Security | 1\. Enforce tenant isolation for ticket and conversation linkage. 2\. Respect existing ticket and conversation permissions. |
| Observability | 1\. Track append attempts, remove attempts, blocked duplicate links, and reply-based sync events. 2\. Track how often users open the conversation thread panel from ticket detail. |
| Accessibility | 1\. Linked bubble items must be keyboard accessible. 2\. Highlighted source bubble must have visible focus and contrast-compliant state. |

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Conversation message reference consistency | Engineering | Core reply-based sync depends on stable message IDs and reply references. | Validate source IDs and add server-side integrity checks. |
| Channel-specific reply-reference support | Product and Engineering | Behavior differs by channel. Unsupported channels cannot auto-sync by reply. | Use strict capability flag per channel and fail safe to normal conversation-only behavior. |
| Ticket room and conversation room consistency | Engineering | Duplicate or missing message display may confuse agents. | Use one source of truth for message linkage and event audit. |
| Long linked bubble history in ticket | Design and Engineering | Ticket detail may become dense and harder to use. | Keep list scrollable and preserve max 50 linked bubble limit. |
| User confusion between create new and append existing | Product and Design | Wrong action may create unnecessary tickets. | Use clear CTA wording and active-ticket-only selector for append. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Bubble-to-ticket append success rate | At least 95% | 30 days | Product analytics |
| Remove linked bubble success rate | At least 95% | 30 days | Product analytics |
| Ticket replies sent with valid quote source on supported channels | 100% | Ongoing | Message audit logs |
| Reply-based inbound sync accuracy | At least 99% | Ongoing | Sync logs and QA sampling |
| Ticket detail to conversation thread panel usage | At least 50% of bubble-linked tickets | 60 days | Product analytics |
| Ticket workflow adoption uplift from bubble actions | At least 30% increase | 60 days | Ticket creation and append logs |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Agent bubble linking support | Some teams may want richer full-thread case documentation. |
| Cross-conversation append | Useful for merged customer journeys, but too risky for MVP. |
| Manual quote source override before sending | Helpful for complex tickets with many linked customer bubbles. |
| Bulk remove linked bubbles | Useful for cleanup at scale after agents build confidence with single remove flow. |
| Visual compare between ticket-linked bubbles and non-linked bubbles | Could improve review speed in long conversation threads. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Only customer bubbles can be linked in this phase | Agent and internal context must still live in ticket notes or ticket room. |
| Same-conversation only | Agents cannot append context from another conversation yet. |
| No fuzzy auto-sync | Unsupported channels or unmatched references will not auto-link inbound to ticket. |
| Done and Resolved tickets cannot receive new linked bubbles | Agents must use another active ticket or create a new one if needed. |
| One bubble can belong to one ticket only | Prevents ambiguity but may feel strict for edge cases. |

## **16\. Appendix**

| Item | Notes |
| ----- | ----- |
| Clarification 1 | Append is not allowed for Done or Resolved tickets. |
| Clarification 2 | One bubble can belong to one ticket only. |
| Clarification 3 | Same-conversation only in this phase. |
| Clarification 4 | Auto-sync uses reply reference only when the channel supports it. |
| Clarification 5 | Default quote source is the latest linked customer bubble. |
| Clarification 6 | Clicking linked bubble opens the source conversation thread in the right panel and replaces ticket detail until user clicks **"Kembali ke detail tiket"**. |

