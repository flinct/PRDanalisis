# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Conversation Snooze (Conversation List)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | January 23, 2026 | Yusril Ibnu Maulana | Initial PRD for Conversation Snooze aligned to Chat List behavior and quick actions. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable agents to temporarily hide a conversation and have it resurface automatically at a chosen time, without changing conversation status. |
| Scope | Add Snooze attribute, Snoozed chip on top bar, Snoozed option in filters, and wake-up behaviors that avoid conflict with existing reminders. |

| In Scope | Out of Scope |
| ----- | ----- |
| Snooze action on conversation. | Recurring reminders. |
| Snooze until time with presets and custom time. | Changing conversation status when snoozed. |
| Snoozed chip in top chips bar (alongside Open and Closed). | SLA pause policy changes. |
| Snoozed filter option in dropdown filter. | External notifications (email, WhatsApp, etc). |
| Auto-unsnooze on inbound customer message. | New automation rules engine. |
| Basic in-app notification when snooze ends. | Reporting dashboard for snooze analytics (future). |

## **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Agents need a way to park a conversation until a promised follow-up time without losing it in the list. | Missed follow-ups and duplicated effort checking parked chats. |
| 2 | Existing “Set Reminder” does not clearly define whether the conversation should be hidden or remain visible. | Confusion and inconsistent workflows across teams. |
| 3 | Adding Snooze risks collision with reminders and list counters if rules are not explicit. | Agents may miss wake-ups or see incorrect counts. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Reduce missed follow-ups | ≥30% reduction in overdue follow-up complaints within 30 days (support tags or internal QA sampling). |
| Improve agent efficiency | ≥20% reduction in time spent searching for parked conversations within 30 days (event logs). |
| Keep UX predictable | 0 critical bugs related to status changes or hidden conversations in first release (QA severity P0). |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to snooze a conversation until a time so it resurfaces when I need to follow up. | 1\. Given a conversation in Open, When I set snooze until a future time, Then the conversation is hidden from Open list and appears in Snoozed view. 2\. Given the snooze time is reached, When the system wakes the conversation, Then it reappears in Open list and I receive an in-app notification “Snooze selesai”. 3\. Given I attempt snooze with past time, When I confirm, Then the system blocks with message “Waktu snooze harus di masa depan”. |
| US-002 | P0 | As an Agent, I want Snoozed to not change the conversation status so reporting and workflows stay consistent. | 1\. Given a conversation is snoozed, When I open its details, Then the original status remains unchanged. 2\. Given a conversation is snoozed, When I unsnooze manually, Then it returns to its original list without any status transition. |
| US-003 | P0 | As an Agent, I want snoozed conversations to wake early if the customer replies so I do not miss inbound messages. | 1\. Given a conversation is snoozed, When a new inbound customer message arrives, Then the system immediately unsnoozes it and shows it in Open list. 2\. Given the conversation is unsnoozed due to inbound, When I am viewing Snoozed list, Then the item disappears from Snoozed list within 2 seconds. |
| US-004 | P1 | As a Supervisor, I want visibility into how many conversations are snoozed and be able to access them. | 1\. Given I am a Supervisor, When I view the top chips bar, Then I see chip “Snoozed” with a count. 2\. Given I open Snoozed view, When I click a conversation, Then I can open and optionally cancel snooze based on permission rules. |
| US-005 | P1 | As an Agent, I want Snooze to be distinct from “Set Reminder” to avoid duplicated alerts and conflicts. | 1\. Given a conversation has an existing reminder, When I set snooze, Then the system applies a precedence rule and shows an info note in the snooze modal. 2\. Given a conversation is snoozed, When a reminder time occurs during snooze window, Then the reminder does not trigger and is deferred or cancelled based on rule definition in Functional Requirements. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Snooze Core | FR-001: System MUST allow users to set “Snooze until” for a conversation with a future timestamp. FR-002: System MUST NOT change the conversation status when snoozed. FR-003: System MUST hide snoozed conversations from default Open and Closed lists. FR-004: System MUST provide a Snoozed view that lists all snoozed conversations accessible to the user. FR-005: System MUST wake a snoozed conversation at snooze\_until and return it to its original list (Open or Closed) without status change. FR-006: System MUST send an in-app notification to the assignee when snooze ends with message “Snooze selesai”. |
| Auto-unsnooze | FR-007: System MUST auto-unsnooze immediately when a new inbound customer message arrives. FR-008: System MUST record a wake reason for audit: “TIME\_REACHED” or “INBOUND\_MESSAGE” or “MANUAL\_CANCEL”. |
| Permissions | FR-009: Agent MUST be able to snooze conversations assigned to themselves. FR-010: Supervisor and Admin MUST be able to snooze any conversation within their Team Inbox scope. FR-011: Agent MUST NOT be able to snooze unassigned conversations. FR-012: System MUST block snooze actions without permission and show message “Akses ditolak”. |
| Chip and Filters | FR-013: System MUST add a top chip “Snoozed” alongside existing top chips (Open, Closed). FR-014: System MUST show a count badge on “Snoozed” chip. FR-015: System MUST add “Snoozed” as an option in the list filter dropdown (Status filter area). FR-016: System MUST ensure Snoozed count reflects conversations currently snoozed (not yet woken). |
| Sorting in Snoozed view | FR-017: System MUST sort Snoozed list by soonest snooze\_until first (ascending). FR-018: System MUST display “Snooze sampai {datetime}” on each snoozed item row. |
| Manual cancel and edit | FR-019: Users MUST be able to cancel snooze from the conversation row menu and from inside conversation header actions. FR-020: Users MUST be able to edit snooze\_until while the conversation is snoozed. FR-021: Cancel snooze MUST return the conversation immediately to its original list. |
| Relationship to “Set Reminder” | FR-022: System MUST treat Snooze as hide plus wake-up reminder at snooze\_until. FR-023: If a conversation has an existing reminder and user sets snooze, system MUST apply this precedence rule. 1\. Snooze becomes the active wake-up mechanism. 2\. Any reminder scheduled inside snooze window is deferred to snooze\_until. 3\. Any reminder scheduled after snooze\_until remains unchanged. FR-024: System MUST show an informational text in snooze modal when a reminder exists: “Reminder akan menyesuaikan dengan waktu snooze”. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block saving snooze if snooze\_until is in the past. | Show inline error “Waktu snooze harus di masa depan”. |
| EH-002 | Authorization | Block snooze if user lacks permission. | Toast “Akses ditolak”. |
| EH-003 | System failure | If wake job fails, retry with exponential backoff up to 5 attempts within 10 minutes. | No user-facing error until retries exhausted. Then show notification “Gagal membangunkan snooze. Coba batalkan dan snooze ulang”. |
| EH-004 | Concurrency | If two users edit snooze simultaneously, last write wins and system logs both attempts. | Show toast to overwritten user “Waktu snooze berubah karena pembaruan terbaru”. |
| EH-005 | List refresh | If list fails to refresh after snooze action, keep local optimistic hide and retry refresh 3 times within 10 seconds. | Toast “Gagal memuat ulang daftar. Mencoba lagi”. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Conversation is snoozed, then customer replies immediately. | Auto-unsnooze and move to Open list immediately. | Show badge on the conversation row “Baru” (existing behavior) and remove snooze label. |
| EC-002 | Conversation is snoozed, then reassigned to another agent before wake time. | Snooze ownership transfers to new assignee. Wake notification goes to new assignee. | Show snooze metadata updated. |
| EC-003 | Conversation is snoozed while agent is currently viewing it. | Conversation remains accessible in detail view. It is hidden only from list. | Show subtle label in header “Sedang snooze sampai {datetime}”. |
| EC-004 | Conversation is in Closed list and is snoozed. | Hidden from Closed list and appears in Snoozed view. On wake, returns to Closed list. | Snoozed row shows original category “Closed”. |
| EC-005 | Snooze\_until is within the next 10 seconds. | Allow it. Wake should trigger normally. | No special UI. |
| EC-006 | User cancels snooze exactly when time-based wake triggers. | Ensure idempotent wake. Final state is unsnoozed once. | Single notification at most. |
| EC-007 | User applies filters that include Snoozed while in Open view. | Open view remains non-snoozed only. Snoozed must be viewed via Snoozed chip or explicit Snoozed filter view. | If user selects Snoozed filter, auto-switch to Snoozed view. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Top Chips Bar | Add chip “Snoozed” next to “Open” and “Closed”, including count badge. | 1\. User clicks “Snoozed”. 2\. List switches to Snoozed view. 3\. List sorted by soonest snooze time. | US-001, US-004 |
| Row Action Menu | Add action “Snooze” and when snoozed, show “Batalkan snooze” and “Ubah snooze”. | 1\. User opens row menu. 2\. Selects “Snooze”. 3\. Modal opens to pick time. 4\. Confirm hides from list and updates Snoozed count. | US-001, US-002 |
| Snooze Modal | Modal title “Snooze percakapan”. Fields include presets and custom time picker. | 1\. User selects preset “2 jam”. 2\. System previews exact datetime in WIB. 3\. User clicks “Snooze”. 4\. Toast “Percakapan disnooze”. | US-001, US-005 |
| Snoozed List Row | Show label “Snooze sampai {datetime}” and optional sublabel “Akan muncul kembali otomatis”. | 1\. User clicks snoozed row. 2\. Conversation opens. 3\. User can cancel snooze from header action. | US-004 |
| Filter Dropdown | Add option “Snoozed” in status filter area. | 1\. User opens filter dropdown. 2\. Chooses “Snoozed”. 3\. System switches to Snoozed view and applies filters. | US-004 |
| Empty State | When no snoozed conversations exist. | Show empty state in Snoozed view. | US-004 |

UI Strings (Bahasa Indonesia only):

1. Chip: “Snoozed”.  
2. Action: “Snooze”.  
3. Action: “Batalkan snooze”.  
4. Action: “Ubah snooze”.  
5. Modal title: “Snooze percakapan”.  
6. Presets: “15 menit”, “30 menit”, “1 jam”, “2 jam”, “Besok 09.00”.  
7. Primary button: “Snooze”.  
8. Secondary button: “Batal”.  
9. Toast success: “Percakapan disnooze”.  
10. Toast wake: “Snooze selesai”.  
11. Error: “Waktu snooze harus di masa depan”.  
12. Error: “Akses ditolak”.  
13. Info text when reminder exists: “Reminder akan menyesuaikan dengan waktu snooze”.  
14. Empty state title: “Tidak ada percakapan yang disnooze”.  
15. Empty state subtitle: “Gunakan Snooze untuk memunculkan lagi percakapan pada waktu tertentu”.

## **10\. Field & Validation**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| snooze\_until | Datetime | Required. Must be greater than now. Uses WIB display. | January 23, 2026 14:00 |
| snooze\_preset | Enum | Optional. One of preset values. Converts to snooze\_until. | “2 jam” |
| snooze\_note | Text | Optional. Max 200 chars. Plain text only. | “Menunggu alamat dari customer” |
| snooze\_set\_by | User reference | System set. | Agent A |
| snooze\_set\_at | Datetime | System set. | January 23, 2026 12:00 |
| snooze\_wake\_reason | Enum | System set on wake. | “TIME\_REACHED” |

## **11\. Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | Snooze action updates list within 2 seconds. Snoozed count updates within 2 seconds. |
| Reliability | Wake mechanism retries up to 5 times within 10 minutes. Wake is idempotent. |
| Observability | Log events: snooze\_set, snooze\_edit, snooze\_cancel, snooze\_wake with actor, timestamps, reason. |
| Security | Enforce RBAC for snooze and edit. Prevent access outside Team Inbox scope. |
| Accessibility | Keyboard navigable modal. Focus trap in modal. Buttons have ARIA labels. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Confusion with existing “Set Reminder” quick action | PM, Design | Users may not understand difference and miss follow-ups. | Clear copy in modal and precedence rules. Consider tooltip in action menu. |
| Incorrect counts due to caching or socket delays | Engineering | Users see wrong Snoozed count and lose trust. | Single source of truth for counts and forced refresh on snooze events. |
| Hidden conversation causes missed inbound if auto-unsnooze fails | Engineering | SLA and customer experience risk. | Auto-unsnooze on inbound as P0. Add monitoring on inbound while snoozed. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Snooze adoption | ≥30% of active agents use Snooze at least once | 30 days after release | Event logs |
| Wake success rate | ≥99% snoozes wake successfully | 30 days after release | Event logs |
| Auto-unsnooze on inbound success | ≥99% inbound messages unsnooze within 2 seconds | 30 days after release | Event logs |
| Reduced manual searching | ≥20% reduction in list search actions per agent | 30 days after release | Analytics events |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Snooze analytics breakdown by team and reason | Helps optimize workflows and staffing. |
| Bulk snooze actions | Useful for incident handling and mass follow-up scheduling. |
| Snooze templates | Faster, consistent notes and preset sets per team. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No recurring reminders | Users needing repeated pings must re-snooze manually. |
| No SLA pause changes | Snoozed conversations may still be considered in SLA calculations depending on existing SLA policy. |
| In-app notification only | Users outside the app will not be alerted when snooze ends. |

## **16\. Appendix**

| Reference | Notes |
| ----- | ----- |
| Chat List supports status tabs and fast navigation | Used to align Snoozed view placement with existing list paradigms. PRD |
| Chat List quick actions include “Set Reminder” | Used to define Snooze versus Reminder precedence to avoid collisions. PRD |
| Chat List UI/UX includes status tabs, filters, and indicators | Used to align Snoozed chip and filter addition with existing filter patterns |

