# Team inbox settings

**Product Manager:** Aryo Utomo Yunanto  
**Engineering Lead:** Naftal Yunior  
**Contributors:** Resky Fernanda  
**Version:** v1.5  
**Last Updated:** Tue, 23 Sep

---

## Introduction

| Item | Description |
| ----- | ----- |
| **Feature** | Team Inbox settings |
| **Purpose** | Provide a centralized Team Inbox Settings page to manage all team inboxes: view, search/filter, and edit a selected team inbox (Supervisors, Members, SLA, Team Tags for analytics, archive, duplicate). |
| **Key Capabilities** | \- Team Inbox list (table \+ search \+ filter \+ bulk actions). \- Per-team editor (tabs: General, Supervisors & Members, SLA, Team Tags (Analytics)). \- Role differentiation (Supervisor vs Member). \- Archive & duplicate inbox. \- SLA configuration (days/hours/minutes) with option to use Default SLA or Custom SLA. \- SLA carry over behavior across team transfers. \- Role-based permissions, optimistic updates, and audit logging. |
| **Outcome** | Faster administration of team inboxes, clear role differentiation, consistent SLA enforcement, analytics-ready tagging, reduced errors, and SLA consistency across reassignments. |

---

1. ## Definitions & Scope Notes

- **Team Tags (Analytics):** Tags attached to a Team Inbox entity for filtering & grouping in analytics/reporting.  
- **SLA per Team Inbox:** Each team inbox can inherit Default SLA or define its own Custom SLA.  
- **SLA Carry Over:** Once applied, an SLA continues unchanged even if the conversation is reassigned to another team inbox or unassigned. Deadline and timers remain consistent.  
- **Multi-Membership:** A user can belong to multiple Team Inboxes.  
- **Team Inbox Roles:**  
  1. Supervisor: Can view all chats in the team inbox.  
  2. Member (Agent): Can only view chats assigned to themselves.  
- **Team Inbox Status:** Active, Archived. Archived inboxes retain history but are hidden from sidebar.

---

2. ## Field-Level Details & Validation

| Field | Type | Validation Rules |
| :---- | :---- | :---- |
| Name | String | Required, unique per tenant, max 50 chars |
| Status | Enum | Active / Archived |
| Supervisors | Array of User IDs | ≥1 supervisor; no duplicates |
| Agents | Array of User IDs | Optional; no duplicates |
| SLA Type | Enum | Default / Custom |
| First Response SLA (Custom) | Object {days,hours,minutes} | ≥1 \> 0; max total 365 days |
| Resolution SLA (Custom) | Object {days,hours,minutes} | ≥1 \> 0; max total 365 days |
| SLA Apply to Ongoing | Boolean | Default \= false |
| SLA Carry Over | Boolean | Default \= true (cannot be disabled at v1) |
| Team Tags | Array of Tag IDs | Optional; max 20 tags |
| Color/Emoji | String | Optional; predefined set |

---

3. ## UX Flow

1. **Open List Page** → Admin/Supervisor navigates to Team Inbox Settings.  
2. **Create Inbox** → Fill Name, SLA type (Default/Custom), Supervisors, Members, Tags → Save.  
3. **Edit Inbox** → Tabs: General, Supervisors & Members, SLA, Team Tags.  
   \- SLA tab includes toggle for Apply to Ongoing and SLA preview.  
   \- SLA Carry Over is always active (informational note shown to user).  
4. **Archive/Duplicate Inbox** with confirmation.  
5. **Realtime Sync** → Changes reflect across Inbox Navigation, Chat List, Analytics.

---

4. ## User stories & Acceptance criteria

| Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| P0 | As an Admin, I need a **Team Inbox list** to find and manage teams quickly. | \- List shows main columns & pagination/infinite scroll.- Search by name/tag; Filter by Status/Tags.- Clicking an item opens the Editor without reload (SPA). |
| P0 | As an Admin, I want to create/edit a Team Inbox. | \- Field validation as per rules.- Save shows toast **“Saved successfully”**; errors show specific messages. |
| P0 | As a Supervisor, I want to manage **Supervisors and Members** in a Team Inbox. | \- Add/remove users with Supervisor or Member role.- Supervisors see all chats; Members see only their assigned chats.- Changes apply **real-time**. |
| P0 | As an Admin, I want to set **SLA** per team as Default or Custom. | \- SLA form allows choosing between Default SLA or Custom SLA.- If Custom: set both First Response and Resolution SLA.- At least one value \>0 per SLA; max total ≤365 days.- Option **apply to ongoing chats** with confirmation.- SLA breaches flagged in Chat List/Room. |
| P0 | As a Supervisor, I want to assign **Team Tags (Analytics)** to a team inbox. | \- Can select **multiple tags**.- Tags shown as chips.- Used in analytics/reporting. |
| P1 | As an Admin, I want to **archive** a Team Inbox. | \- Archive action available.- Inbox removed from sidebar, status set to Archived.- History still accessible. |
| P1 | As an Admin, I want to **duplicate** a Team Inbox. | \- Duplicate copies Supervisors, Members, SLA, Tags.- Name auto-suffix `-copy`.- Save success shows toast. |
| P1 | As an Admin, I want an **audit log** of changes. | \- Captures who/what/when (change set), visible in Audit panel. |
| P2 | As an Agent (Member), I want **read-only** access to my team configuration. | \- Member can view but not edit configuration. |
| P0 | As a Supervisor, I want custom auto-close per Team Inbox. | \- Option to inherit global or override auto-close duration. \- Overrides logged in audit. \- Auto-close applies only to that team’s conversations. |

5. ## User Stories & Acceptance Criteria

| Priority | User Story | Acceptance Criteria |
| :---- | :---- | :---- |
| P0 | As an Admin, I want to configure SLA per Team Inbox. | SLA form allows Default or Custom SLA. SLA deadlines must be valid. |
| P0 | As an Admin, I want SLA to carry over when a conversation moves between teams. | SLA deadlines remain unchanged across reassignments. Audit log records transfer event with inherited SLA. |
| P0 | As a Supervisor, I want to see inherited SLA clearly in chat detail. | SLA timer shows original deadline and indicates *Inherited SLA*. |
| P1 | As an Admin, I want to archive or duplicate inboxes. | Archive removes from sidebar but retains history. Duplicate copies all settings. |

6. ## SLAs Carry over behavior

**Principles:**

* SLA once started **does not reset** when a conversation is reassigned or unassigned.  
* New team inherits the existing SLA deadline.  
* If the SLA is breached, violation is recorded against the conversation regardless of team changes.

**Rules:**

1. **Initial SLA Start** → Triggered at first assignment based on team SLA (or default).  
2. **Reassignment** → SLA continues unchanged. UI marks as *“Inherited SLA”*.  
3. **Unassigned** → SLA countdown continues. No pause.  
4. **Audit Logs** → All reassignments recorded with context (e.g., *Moved from Team A to Team B. SLA Deadline unchanged: 12:00 PM*).  
5. **Reporting** → SLA performance attributed to the team where the conversation was **when SLA breached**.

**Example:**

* SLA: First Response 30m, Resolution 2h.  
* Assigned to Team A at 10:00 → Deadline \= 12:00.  
* Reassigned to Team B at 11:00 → SLA still 12:00.  
* Breach occurs at 12:05 → SLA violation logged, attributed to Team B.

---

7. ## Permissions

| Role | View | Create | Edit | Archive | Duplicate |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Admin | ✓ | ✓ | ✓ (all tabs) | ✓ | ✓ |
| Supervisor | ✓ | ✓ (tenant policy) | ✓ (Supervisors & Members, SLA, Tags) | ✓ | ✓ |
| Member (Agent) | ✓  | ✗ | ✗ | ✗ | ✗ |

---

8. ## Non-Functional Requirements

* **Performance**:  
  * List search/filter response ≤ **500ms** for ≤ 1,000 team inboxes.  
  * Editor load ≤ **800ms** (including members & tags).

* **Real-time**: Changes to Supervisors/Members/SLA/Tags pushed via socket to **Inbox Navigation**, **Chat List**, and **Analytics**.

* **Reliability**: Optimistic update \+ rollback on error. Retry with exponential backoff.

* **Security**: RBAC; immutable audit log; sensitive changes (SLA apply to ongoing) marked as **“high-risk change”** (require confirmation).

---

9. ## Error Handling

| Code | Scenario | UI Message |
| ----- | ----- | ----- |
| 400-TIS01 | Duplicate/invalid name | "Team Inbox name invalid/duplicate" |
| 400-TIS02 | Invalid SLA payload | "Invalid SLA format" |
| 400-TIS03 | Invalid/unpermitted tag | "Invalid tag" |
| 400-TIS04 | SLA duration \= 0 | "SLA must be greater than 0" |
| 400-TIS05 | SLA duration \>365 days | "SLA cannot exceed 365 days" |
| 403-TIS06 | Permission denied | "Access denied" |
| 409-TIS07 | Conflict (data changed elsewhere) | "Data has changed, please reload" |
| 500-TIS08 | Server error | "An error occurred. Please try again" |

---

10. ## Future Considerations

| \# | Consideration |
| ----- | ----- |
| 1 | Automatic routing via rules (based on channel, team tags, customer attributes). |
| 2 | Supervisor dashboard (workload heatmap, SLA near-breach list). |
| 3 | Assignment methods (Round Robin, Least Active, Load Balancing). |
| 4 | Global keyboard shortcuts (Ctrl/⌘+K) to open Team Inbox Settings. |
| 5 | Template SLA Profiles (reusable per team). |
| 6 | Team Inbox grouping (cluster by division/department). |

---

11. ## Limitations

| Limitation | Work-around |
| ----- | ----- |
| Team Tags only for analytics (not affecting routing). | Use routing rules (future) if needed. |
| Bulk SLA changes may trigger heavy re-calculation. | Limit batch, run as background job. |
| Members (Agents) can only see their own assigned chats. | Supervisors have full visibility. |

