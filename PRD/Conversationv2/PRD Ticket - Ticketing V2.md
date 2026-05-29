# **Product Requirement Document (PRD)**

**Feature:** Ticketing V2  
 **Product:** SatuInbox

| Role | Name |
| ----- | ----- |
| **Product Manager** | [Dewangga Ardian Pratama](mailto:dewangga.pratama@orderfaz.com) [Yusril Ibnu Maulana](mailto:yusril.ibnu@orderfaz.com) |
| **Engineering Lead** | [Naftal Yunior](mailto:naftal.yunior@orderfaz.com) |
| **Design Lead** | [Resky Fernanda Witanto](mailto:resky.witanto@orderfaz.com) |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v2.0 |
| **Last Updated** | October 2025 |

---

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 23 Oct 2025 | [Dewangga Ardian Pratama](mailto:dewangga.pratama@orderfaz.com)[Yusril Ibnu Maulana](mailto:yusril.ibnu@orderfaz.com) | Initial draft based on Ticketing Improvement V1 |

---

## **1\. Overview**

| Item | Description |
| ----- | ----- |
| **Feature** | Ticketing |
| **Purpose** | To enable context-based ticket creation and management directly from chat conversations, ensuring better SLA tracking, workflow visibility, and multi-channel synchronization. |
| **Key Capabilities** | \- Create tickets from selected chat bubbles or full conversations (Conversation ID.\- Maintain ongoing communication inside the same conversation room, flagged as part of the ticket.\- Dual SLA tracking (Chat SLA & Ticket SLA).\- Real-time updates for state transitions and assignments.\- Full audit trail for every change. |
| **Outcome** | Reduced context-switching between chat and ticket management; improved SLA compliance and traceability across all customer support levels. |

---

## **2\. Problem Statement**

| \# | Problem | Impact |
| ----- | ----- | ----- |
| 1 | Agents must leave the conversation view to create a ticket. | Increases handling time and disrupts flow. |
| 2 | Ticket creation lacks contextual linkage to chat history. | Causes confusion and incomplete issue tracking. |
| 3 | No dual-SLA distinction between message response and ticket resolution. | Inaccurate SLA reports and misaligned performance data. |
| 4 | Templates for ticket forms are static and not synchronized with updates. | Requires manual updates, leading to inconsistent data fields. |
| 5 | No visible indicator that a chat belongs to a ticket. | Agents lose track of ongoing cases, especially across teams. |

---

## **3\. Objectives & Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Contextual ticket creation | 100% of tickets created directly from chat context |
| SLA differentiation | Separate SLA tracking for chat and ticket in all reports |
| Real-time ticket updates | ≤2s latency for any status, assignment, or field update |
| Improved compliance | ≥90% of tickets resolved within SLA |
| Seamless cross-module link | Ticket module integrates with Inbox, Tracking, and Template Settings APIs |

---

## **5\. User Stories & Acceptance Criteria**

### **5.1 User Stories**

| ID | As a | I want to | So that |
| ----- | ----- | ----- | ----- |
| US-01 | Agent | Create a ticket from one or more selected chat bubbles | I can capture context-specific issues efficiently |
| US-02 | Agent | Create a ticket from a conversation list item | I can escalate conversations to tickets quickly |
| US-03 | Admin | Assign or reassign tickets to agents / team inbox | I can ensure the right ownership for each issue |
| US-04 | Admin | Monitor SLA performance for each ticket | I can ensure timely responses and resolution |
| US-05 | Agent | View ticket indicator inside conversation | I can easily identify which chats belong to a ticket |
| US-06 | Parent Account | View all tickets and SLA data organization-wide | I can evaluate client and team performance objectively |
| US-07 | Admin | Receive alerts for SLA breaches | I can take proactive actions before SLA violations occur |
| US-08 | Agent | Update ticket status as progress changes through Ticket List page | I can reflect real-time progress to Admins and customers |
| US-09 | Agent | Chat Client via Ticket Room | I can follow up ticket matter |

---

### **5.2 Acceptance Criteria**

| ID | Feature / Function | Acceptance Criteria |
| ----- | ----- | ----- |
| AC-01 | Ticket Creation (Chat Bubble) | Selecting one or multiple chat bubbles → “Create Ticket” button opens a form with linked message references. |
| AC-02 | Ticket Creation (Conversation List) | Clicking “Create Ticket” from the list. \- auto-fetches the last 3–5 messages as context. (TBD) |
| AC-03 | Context Binding | All future chat messages after creation are flagged with `is_ticket_message=true`. |
| AC-04 | Ticket Header | Ticket header displays the linked conversation and latest state.\- Header from selected Ticket Type\- Ticket Number |
| AC-05 | SLA Management | SLA for chat (response) and ticket (resolution) are tracked independently. |
| AC-06 | Ticket State Machine | **Submitted → On Process → Waiting On Customer → Resolved.** |
| AC-07 | Reopen Action | Admin can reopen Closed tickets. |
| AC-08 | Notification | Admins and assigned agents receive notifications for new tickets, SLA warnings, or reassignment. |
| AC-09 | Audit Trail | All ticket updates (create, assign, edit, SLA, status) must appear in the ticket timeline. |

---

## **6\. Field-Level Details & Validation**

| Section | Field Name | Type | Validation | Req/Opt |
| ----- | ----- | ----- | ----- | ----- |
| Ticket Info | Ticket ID | Auto-ID | Unique, auto-generated | Required |
|  | Conversation ID | String | Must exist in conversation DB | Required |
|  | Linked Messages | Array | Must exist in chat DB | Required |
|  | Template ID | String | Pulled from Template Service | Required |
| Assignment | Assigned Agent | String | Must be active user | Optional |
| SLA | SLA Chat | Object | Generated from SLA engine | Auto |
|  | SLA Ticket | Object | Generated from SLA engine | Auto |
| Status | Ticket State | Enum | Must follow allowed transitions | Required |
| Metadata | Created By | String | Valid user ID | Required |
|  | Created At | Datetime | ISO format | Required |
|  | Updated At | Datetime | ISO format | Auto |
| Flags | is\_ticket\_message | Boolean | Auto-tag from message flow | Auto |

---

## **6.1 SLA Rules (Ticketing)**

| Ticket Status | Who Holds the Ball | SLA Timer | Description |
| ----- | ----- | ----- | ----- |
| **New / Assigned / Submitted** | Agent | ✅ Running | Waiting for agent’s first response. |
| **In Progress** | Agent | ✅ Running | Agent is working on the issue. |
| **Waiting on Customer** | Customer | ⏸ Paused | Waiting for customer’s reply or action. |
| **Resolved** | Agent | ⏹ Stopped | Ticket marked as solved. |
| **Reopened** | Agent | ✅ Restarted | SLA restarts to “In Progress“ when the ticket reopens after the customer continue to respond to the ticket. |

---

**Simple Rules:**

* SLA runs **only when Agent holds the ball** (`Submitted / In Progress`).  
* SLA pauses when ticket is `Waiting on Customer`.  
* SLA stops when ticket is `Resolved`.  
* Reopened tickets start a **new SLA countdown**.

---

## **7\. Functional Requirements**

| ID | Category | Functional Requirement | Notes |
| ----- | ----- | ----- | ----- |
| FR-01 | Ticket Creation | System must support ticket creation via Chat Bubble, Conversation List, Ticket List Page, and via Open API. | Mandatory |
| FR-02 | Context Binding | Messages after ticket creation are automatically linked to the ticket. | Real-time |
| FR-03 | State Machine | **Submitted → On Process → Waiting On Customer → Resolved.** | Aligned with Intercom pattern |
| FR-04 | SLA Management | Independent SLA tracking for chat and ticket. |  |
| FR-05 | Ticket Assignment | Admin can assign or reassign tickets to agents. | Role-based |
| FR-06 | Audit Logging | All actions recorded with timestamp and user ID. | For compliance |
| FR-07 | Notification System | Notify Admins/Agents for state changes and SLA breaches. | Real-time push |
| FR-08 | Integration – Template | Ticket attributes pulls structure from Ticket Type Service. | Required |
| FR-09 | Integration – Tracking | AWB and shipment data auto-populated when available. | Optional |
| FR-10 | Integration – Group Chat | Internal discussion about the ticket accessible via WA group. | Optional |
| FR-11 | Ticket List | All the Tickets created will be stored in the Ticket List page and assigned agent/team inbox can update all the assigned ticket statuses. | Required |
| FR-12 | Ticket Room | Agent can response client to follow up Ticket matter | Required |

---

## **8\. Error Handling (Extended)**

| Error Type | Scenario | Handling | User Message |
| ----- | ----- | ----- | ----- |
| Invalid Bubble | Chat bubble deleted before ticket creation | Disable “Create Ticket” button | “This message is no longer available.” |
| Duplicate Context | Trying to link ticket to existing ticketed conversation | Block action | “This conversation already has an active ticket.” |
| Template Fetch Failed | Template API down | Retry x3, fallback default form | “Template temporarily unavailable.” |
| SLA Engine Timeout | SLA computation delay | Queue retry and log | “SLA data syncing…” |
| Assignment Error | Invalid or inactive agent ID | Prevent save | “Invalid assignee.” |
| State Transition Invalid | Attempting illegal state (e.g., Closed → Open by Agent) | Block and alert | “Transition not allowed.” |

---

## **9\. Dependencies & Risks**

### **Dependencies**

| Type | Dependency | Description |
| ----- | ----- | ----- |
| Internal | Inbox Module | Provides conversation list and message reference IDs |
| Internal | Template Settings | Supplies form structure for tickets |
| Internal | SLA Engine | Calculates SLA for chat and ticket |
| Internal | Group Chat | Enables internal discussion for ticket handling |
| External | Tracking Service | Updates ticket with AWB and shipment data |
| External | Notification API | Pushes SLA and ticket updates in real time |
| External | Conversation Room | Chat in Ticket Room synchron with Conversation Room |

### **Risks**

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| SLA desynchronization between modules | Medium | High | Use centralized SLA Engine timestamps |
| Template version mismatch | Medium | Medium | Add template version ID snapshot to ticket |
| Overloaded message link | Low | Medium | Cap linked messages per ticket (max 50\) |
| API latency from Template Service | Medium | Low | Implement caching and async fetch |
| Duplicate tickets for same AWB | Low | High | Enforce unique AWB validation rule |

---

## **10\. Future Considerations**

| Feature | Priority | Notes |
| ----- | ----- | ----- |
| Multi-assignment support (two agents on one ticket) | P2 | For escalation handling |
| Ticket sub-tasks | P2 | Each ticket can include internal to-dos |
| SLA visualization bar | P1 | Visual indicator on ticket card |
| AI-based auto-prioritization | P2 | Based on sentiment or keywords |
| Merge & Split tickets | P3 | For duplicate case handling |
| Export tickets to CSV/PDF | P2 | For reporting & audits |

---

## **11\. Limitations**

| Limitation | Workaround | Priority |
| ----- | ----- | ----- |
| Template editing not in-scope (handled in Template Settings module) | Use existing template API | P1 |
| No bulk ticket reassignment yet | Manual reassignment | P2 |
| Max 50 linked messages per ticket | Use AWB or reference tag for additional context | P2 |
| SLA countdown visible to Admin only | Dashboard summary for agents | P3 |
| Ticket can’t be deleted (only closed) | Use archive or hide | P3 |

