# **Product Requirement Document (PRD)**

**Feature:** Omnichannel Inbox /  Get New Conversation (Agent Pull Queue)

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v2.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide agents with a pull-based mechanism to claim new conversations from the unassigned queue, ensuring fair distribution (FIFO) and flexibility in batch size. |
| **Key Capabilities** | Agents can pull one or more conversations from the queue. Conversations are auto-assigned upon retrieval. Optional timeout returns conversations to the queue. Supervisor/Admin can assign directly from the Unassigned page. |
| **Outcome** | Improved queue handling, reduced idle time for agents, better load balancing across the team, and simplified agent workflow without cherry-picking conversations. |

---

## **2 | Problem Statement**

* Currently, agents might cherry-pick conversations, leading to unfair distribution.  
* Supervisors need visibility and manual control, but agents should have a simplified "Get New Chat" action.  
* Some teams require configurable batch size (default \= all available), while others prefer controlled limits.  
* Without limits, agents might overwhelm themselves; without timeouts, conversations may get stuck.

---

## **3 | Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Ensure fair distribution of conversations | 100% of pulled conversations follow FIFO order. |
| Allow agent flexibility in batch pull | ≥80% of agents use the editable batch field instead of default. |
| Maintain SLA with optional timeout | 90% of conversations returned to queue if idle beyond timeout. |
| Simplify agent UX | \<2 clicks required for agent to start handling new chats. |

---

## **4 | Success Metrics**

| Category | Metric | Target |
| ----- | ----- | ----- |
| Efficiency | Avg. time from click "Get Conversation" to first message visible | ≤2s |
| Distribution | % of FIFO order accuracy | 100% |
| Usability | % of agents able to change batch number | ≥90% |
| Settings adoption | % of teams enabling max-conversation-per-agent limit | ≥50% |

---

## **5 | User Stories & Acceptance Criteria**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| P0 | As an agent, I want to click "Get Conversation" to receive chats automatically, so I don’t have to pick manually. | \- Agent clicks "Get Conversation" \- Conversations are assigned FIFO from queue \- Default batch \= all available, editable to smaller number |
| P0 | As an agent, I want to set how many conversations I pull, so I can control my workload. | \- Editable numeric field shown next to "Get Conversation" \- Default \= total queue count \- Min \= 1 |
| P0 | As an agent, I want conversations auto-assigned upon retrieval. | \- Status changes to "Assigned to Agent" immediately \- Conversation appears in "Your Inbox" |
| P1 | As a supervisor, I want to assign chats manually from Unassigned. | \- Unassigned tab visible only to Supervisor/Admin \- Assign to self or to other agents |
| P1 | As an agent, I want a warning if I reach the maximum concurrent conversation limit. | \- System shows message "Maximum active conversations reached" \- Configurable in settings by Supervisor/Admin |
| P2 | As an Admin, I want the option to enable timeout return to queue on **Inbox \> General Settings**. | \- Setting toggle ON/OFF \- If enabled, inactive chat returns to Unassigned after \[X\] minutes |
| P2 | As an Admin, I want the option to enable maximum limit get conversation queue on **Inbox \> General Settings**. | \- Setting toggle ON/OFF \- If enabled, set max limit, (minimum 1\) |
| P2 | As an agent, I want to view only my closed chats, while supervisors see all. | \- Agents: Closed tab shows only their resolved chats \- Supervisors/Admin: Closed tab shows all team chats |

---

## **6 | Field-Level Details & Validation**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| Batch Size | Integer | Default \= total queue count, editable ≥1 | `5` |
| Timeout | Boolean \+ Integer | Default OFF, if ON must set minutes (5–120) | `true, 30` |
| Max Active Conversations | Integer | Default unlimited, configurable ≥1 | `10` |

---

## **7 | Status Mapping**

| Status | Description |
| ----- | ----- |
| Unassigned | Conversation waiting in queue (visible only to Supervisor/Admin) |
| Assigned | Conversation taken via pull or manual assign |
| Resolved | Closed by agent; visible in Closed tab (agent sees own, supervisor sees all) |

---

## **8 | Error Handling**

| Scenario | Behavior |
| ----- | ----- |
| Agent tries to pull but reaches max active limit | Show toast: "Maximum active conversations reached" |
| Queue empty | Show toast: "No conversations available" |
| API/socket failure | Show toast: "Failed to fetch conversation, please retry" |
| Invalid batch number | Reset to default queue count |

---

## **9 | UX Flow**

1. Agent navigates to **Your Inbox**  
2. Agent sees **Get Conversation** button \+ editable batch field (default pre-filled with queue count)  
3. Agent clicks → conversations auto-assigned FIFO  
4. Conversations appear in **Your Inbox** tab  
5. If limit reached → warning toast  
6. Supervisor/Admin → use **Unassigned tab** for manual assignment

---

## **10 | Future Considerations**

* Auto-suggest batch size based on agent workload (AI-based).  
* SLA-aware prioritization (e.g., push nearing SLA to top of queue).  
* Real-time queue analytics for Supervisor dashboard.