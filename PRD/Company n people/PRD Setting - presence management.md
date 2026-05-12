# Presence

## Introduction

| Aspect | Detail |
| ----- | ----- |
| **Feature Name** | Presence |
| **Objective** | Enable Agents to set their availability (Presence) so that teams can monitor real-time availability status. |
| **Target Audience** | Agents, Supervisors, Admins |
| **Scope** | \- Presence consists of two main states: **Active** and **Away**. \- Away includes a set of predefined **reasons**: *Away, On a break, On lunch, In a meeting, Out of office, Out sick*. \- **Auto-Away mode**: The system automatically switches an Agent’s status to Away if no activity is detected within a configured interval (default: 10 minutes, configurable in Assignment Settings). |

---

1. ## User Stories & Acceptance Criteria

| ID | Role | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-01 | Agent | As an Agent, I want to manually set my status to *Active* or *Away* so my team knows my availability. | \- Agents can toggle between *Active* and *Away* from the Presence menu.- Status updates reflect in ≤ 2 seconds across the system.- Supervisors and teammates see the updated status in Dashboard and Team Inbox. |
| US-02 | Agent | As an Agent, I want to select a reason when I set my status to *Away* so my Supervisor understands the context. | \- System provides predefined Away reasons (*Away, On a break, On lunch, In a meeting, Out of office, Out sick*).- Selected reason is displayed next to the Agent’s name in Supervisor Dashboard.- Away reason is stored in system logs. |
| US-03 | Supervisor | As a Supervisor, I want to view all Agents’ Presence so I can monitor workload distribution. | \- Dashboard shows current Presence (Active/Away \+ reason) for every Agent.- Presence list updates in real-time without page reload.- Supervisors can filter Agents by Presence status. |
| US-04 | Admin | As an Admin, I want to configure the default Auto-Away interval so the system behavior is consistent. | \- Admin can set Auto-Away interval (default \= 10 minutes).- Changes apply system-wide immediately.- Presence auto-switch triggers after configured inactivity duration. |

---

2. ## Presence Type

| Presence | Description | Behavior / Notes |
| ----- | ----- | ----- |
| **Active** | The Agent is available and ready to handle chats or tickets. | \- Default status when Agent logs in. \- Updated automatically if Agent resumes activity after being Away. \- Visible to Supervisor and other Agents. |
| **Away** | The Agent is not available for handling chats/tickets. Requires a reason. | \- Must select a reason when switching manually. \- Auto-Away applies default “Away” reason. \- Supervisor sees the Away reason in Dashboard. |

### **Away Reasons (Predefined Defaults)**

* **Away** → General unavailable state (default for Auto-Away).  
* **On a break** → Short personal break.  
* **On lunch** → Lunch or meal break.  
* **In a meeting** → Busy with an internal/external meeting.  
* **Out of office** → Not working (day off, outside working hours).  
* **Out sick** → Absent due to health reasons.

---

3. ## Functional Requirements

| ID | Requirement Category | Functional Requirement | Priority |
| ----- | ----- | ----- | ----- |
| FR-PR-01 | Presence Management | The system must provide manual controls to change Presence status. | High |
| FR-PR-02 | Away Reason | The system must provide a list of default Away Reasons, with potential future customization. | Medium |
| FR-PR-03 | Auto-Away Mode | The system must detect inactivity (default 10 min) and switch status to Away. | High |
| FR-PR-04 | Presence Visibility | The system must display Agents’ statuses in Supervisor Dashboard and assignment lists. | High |

---

4. ## Non-Functional Requirements

| ID | Category | Description |
| ----- | ----- | ----- |
| NFR-PR-01 | Performance | Presence updates must reflect in ≤ 2 seconds after manual or automatic changes. |
| NFR-PR-02 | Reliability | Presence status update success rate must be ≥ 99.5%. |
| NFR-PR-03 | Usability | Presence UI must be easily accessible (Inbox header/profile menu). |
| NFR-PR-04 | Logging | All Presence changes (Active ↔ Away) must be logged in the system. |

---

5. ## System Flow (Presence)

1. Agent logs into the system → default status \= **Active**.  
2. Agent manually switches to **Away** → selects a reason from the list.  
3. If Agent is inactive for ≥ configured interval → system auto-switches status to **Away**.  
4. Supervisor/Admin can view real-time Presence of all Agents in the Dashboard or Team Inbox.

---

