# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticket Snooze  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

# **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 16 Mar 2026 | Yusril Ibnu Maulana | Initial PRD for Ticket Snooze feature |

---

# **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Allow agents to temporarily hide a ticket from active working queues and automatically return it at a selected time without changing the ticket status. |
| Scope | Introduce a snooze state for tickets, a Snoozed ticket view with count, wake-up behavior, and inbound triggered auto-unsnooze. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Snooze action on ticket. | Recurring snooze schedules. |
| Snooze until a specific time. | External notifications such as email or WhatsApp. |
| Dedicated Snoozed ticket view with count. | Bulk snooze operations. |
| Manual cancel and edit snooze time. | Snooze analytics dashboards. |
| Automatic wake when snooze time is reached. | Automation rules engine integration. |
| Auto unsnooze when inbound message arrives. | Changes to ticket lifecycle statuses. |

---

# **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Agents often need to temporarily hide tickets that require follow up later. | Active ticket queues become noisy and difficult to prioritize. |
| 2 | Existing ticket statuses do not support temporary parking of tickets. | Agents misuse statuses or keep tickets visible unnecessarily. |
| 3 | Without a dedicated container for hidden tickets, follow ups may be forgotten. | Customer response delays and operational inefficiency. |

---

# **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Reduce noise in active ticket queues | ≥30% reduction in tickets marked idle but still visible in active queue within 30 days. |
| Improve follow up reliability | ≥99% snoozed tickets wake successfully at scheduled time. |
| Prevent missed inbound replies | ≥99% inbound replies auto-unsnooze tickets within 2 seconds. |
| Preserve ticket lifecycle integrity | 0 incidents where snooze changes ticket status. |

---

# **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to snooze a ticket until a future time so it disappears from my active queue temporarily. | 1\. Given a ticket is visible in the active queue, When I select Snooze and set a future time, Then the ticket disappears from the active queue. 2\. Given the ticket is snoozed, When I open the Snoozed view, Then the ticket appears in the list with label “Snooze sampai {datetime}”. 3\. Given a snooze time in the past is selected, When I confirm, Then the system blocks the action and shows “Waktu snooze harus di masa depan”. |
| US-002 | P0 | As an Agent, I want snoozing a ticket to not change the ticket status. | 1\. Given a ticket is snoozed, When I open the ticket detail, Then the original ticket status remains unchanged. 2\. Given the snooze is cancelled, When the ticket returns to the active queue, Then the status remains the same as before snooze. |
| US-003 | P0 | As an Agent, I want the ticket to automatically reappear when the snooze time is reached. | 1\. Given a ticket is snoozed, When the snooze time is reached, Then the ticket returns to the active queue. 2\. Given the ticket wakes due to time reached, When the agent is logged in, Then an in app notification “Snooze selesai” appears. |
| US-004 | P0 | As an Agent, I want a customer reply to wake the ticket immediately. | 1\. Given a ticket is snoozed, When the customer sends a new inbound message, Then the ticket is immediately unsnoozed. 2\. Given inbound reply wakes the ticket, When the agent is viewing the Snoozed list, Then the ticket disappears from that list within 2 seconds. |
| US-005 | P1 | As a Supervisor, I want to see how many tickets are snoozed. | 1\. Given the supervisor opens ticket navigation, When the system loads the ticket views, Then a button labeled “Snoozed (count)” is visible. 2\. Given the supervisor opens the Snoozed view, When the list loads, Then all snoozed tickets within scope are displayed. |
| US-006 | P1 | As an Agent, I want to cancel or modify snooze time. | 1\. Given a ticket is snoozed, When I select “Batalkan snooze”, Then the ticket returns immediately to the active queue. 2\. Given a ticket is snoozed, When I select “Ubah snooze”, Then I can set a new snooze time. |

---

# **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Snooze State | FR-001: System MUST allow users to set snooze for a ticket with a future timestamp. FR-002: System MUST treat snooze as a state, not a ticket status. FR-003: System MUST keep the original ticket status unchanged during snooze. |
| Queue Visibility | FR-004: System MUST hide snoozed tickets from active ticket queues. FR-005: System MUST store snoozed tickets in a dedicated Snoozed ticket view. FR-006: System MUST display the count of active snoozed tickets in navigation. |
| Snooze Wake Behavior | FR-007: System MUST automatically unsnooze a ticket when snooze\_until time is reached. FR-008: System MUST return the ticket to the correct queue based on its current ticket status. FR-009: System MUST trigger an in app notification when snooze ends. |
| Inbound Trigger | FR-010: System MUST automatically unsnooze a ticket when a new inbound customer message is received. FR-011: System MUST move the ticket from Snoozed view to active queue within 2 seconds. |
| Snooze Management | FR-012: Users MUST be able to cancel snooze manually. FR-013: Users MUST be able to edit snooze time while the ticket is snoozed. FR-014: Cancelling snooze MUST return the ticket immediately to the active queue. |
| Sorting Rules | FR-015: Snoozed tickets MUST be sorted by nearest snooze\_until ascending. FR-016: Each row MUST display snooze timestamp using WIB timezone. |
| Permissions | FR-017: Agents MUST be able to snooze tickets assigned to themselves. FR-018: Supervisors and Admins MUST be able to snooze tickets within their scope. FR-019: System MUST block snooze attempts without permission. |
| Logging | FR-020: System MUST log snooze events including actor and timestamp. FR-021: System MUST log wake reason with values TIME\_REACHED, INBOUND\_MESSAGE, MANUAL\_CANCEL. |

---

# **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Prevent snooze save if time is in the past. | Show error “Waktu snooze harus di masa depan”. |
| EH-002 | Authorization | Block snooze if user lacks permission. | Show toast “Akses ditolak”. |
| EH-003 | System Failure | Retry wake job up to 5 times within 10 minutes. | Show notification if retries fail. |
| EH-004 | Concurrency | Last write wins when multiple users edit snooze. | Show message “Waktu snooze berubah karena pembaruan terbaru”. |
| EH-005 | Refresh Failure | Retry list refresh up to 3 times within 10 seconds. | Show message “Gagal memuat ulang daftar”. |

---

# **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Customer replies immediately after snooze. | Ticket auto unsnoozes instantly. | Ticket reappears in active queue with new message badge. |
| EC-002 | Ticket reassigned while snoozed. | Snooze ownership transfers to new assignee. | Notification sent to new assignee. |
| EC-003 | User viewing ticket detail while snoozed. | Ticket remains accessible in detail view. | Header shows label “Sedang snooze sampai {datetime}”. |
| EC-004 | Snooze time reached while user offline. | Ticket wakes normally. | Notification shown next login. |
| EC-005 | Snooze time within 10 seconds. | System allows snooze and triggers wake normally. | No special UI behavior. |
| EC-006 | Cancel snooze at exact wake time. | Wake process remains idempotent. | Only one notification shown. |

---

# **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Navigation Button | Add button “Snoozed (count)” in ticket navigation. | 1\. User clicks “Snoozed”. 2\. System opens Snoozed ticket view. 3\. List sorted by snooze time. | US-005 |
| Ticket Row Action | Add action “Snooze” in ticket row menu. | 1\. User opens row menu. 2\. User selects “Snooze”. 3\. Snooze modal opens. | US-001 |
| Snooze Modal | Modal to choose snooze time. | 1\. User selects preset or custom time. 2\. User confirms snooze. 3\. Ticket disappears from active queue. | US-001 |
| Snoozed Ticket Row | Row label showing snooze time. | 1\. User opens Snoozed view. 2\. Row displays “Snooze sampai {datetime}”. | US-001 |
| Header Action | Action buttons in ticket header. | 1\. User clicks “Batalkan snooze”. 2\. Ticket returns to active queue. | US-006 |
| Empty State | Display when no snoozed tickets exist. | Show title “Tidak ada tiket yang disnooze”. | US-005 |

---

# **10\. Field & Validation**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| snooze\_until | Datetime | Required. Must be greater than current time. | 2026-03-16 15:00 |
| snooze\_set\_by | User reference | System generated. | Agent A |
| snooze\_set\_at | Datetime | System generated. | 2026-03-16 12:00 |
| snooze\_wake\_reason | Enum | TIME\_REACHED, INBOUND\_MESSAGE, MANUAL\_CANCEL | TIME\_REACHED |
| snooze\_note | Text | Optional. Max 200 characters. | “Menunggu jawaban customer” |

---

# **11\. Non Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | Snooze actions reflected in UI within 2 seconds. |
| Reliability | Wake jobs must be idempotent and retryable. |
| Security | RBAC enforced for snooze permissions. |
| Observability | Log events for snooze\_set, snooze\_edit, snooze\_cancel, snooze\_wake. |
| Accessibility | Modal supports keyboard navigation and focus trapping. |

---

# **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ticket and conversation linkage | Engineering | Wrong inbound trigger detection | Define inbound event mapping clearly. |
| Cache delays in ticket counts | Engineering | Incorrect Snoozed count | Use server source of truth. |
| Wake job failure | Engineering | Tickets remain hidden | Implement retry and monitoring alerts. |

---

# **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Snooze adoption | ≥30% of agents use snooze at least once | 30 days | Event logs |
| Wake success rate | ≥99% | 30 days | System logs |
| Auto unsnooze success | ≥99% within 2 seconds | 30 days | Event logs |
| Queue noise reduction | ≥20% fewer idle tickets in active queue | 30 days | Analytics |

---

# **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Bulk snooze | Useful for incident handling and mass follow ups. |
| Snooze analytics | Provides insight into workload patterns. |
| Snooze templates | Faster snooze presets for teams. |

---

# **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No recurring snooze | Users must manually snooze again after wake. |
| In app notification only | Users outside the app may miss wake alerts. |

---

# **16\. Appendix**

| Reference | Notes |
| ----- | ----- |
| Ticket lifecycle model | Snooze does not modify ticket status. |
| Ticket queue navigation | Snoozed tickets exist in a separate view with count indicator. |

