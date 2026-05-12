# **Product Requirement Document (PRD)**

**Feature:** Shift Schedule CRUD (Multi-Segment Support)  
**Version:** v1.2  
**Last Updated:** DateDateDate

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide CRUD interface for managing recurring weekly shift schedules with support for **multiple start–end segments per day** and holiday overrides. |
| **Key Capabilities** | Create, update, duplicate, add, and delete shifts; assign agents; configure multiple time segments per day; skip on holidays; view in list and calendar mode. |
| **Outcome** | Flexible and accurate workforce planning, reduced SLA breaches, clear weekly visibility. |

---

## **2 | Problem Statement**

| \# | Problem |
| ----- | ----- |
| 1 | Current model only supports single time range per day. |
| 2 | Admins must duplicate shifts manually to handle morning/afternoon splits. |
| 3 | No option to skip shifts automatically on public holidays. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result |
| ----- | ----- |
| Support multi-segment scheduling | ≥90% of teams model real shifts with fewer than 2 schedules. |
| Holiday compliance | 100% public holidays auto-skip when enabled. |
| Prevent conflicts | 0 overlapping segments for same agent. |

---

## **4 | Success Metrics**

| Category | Metric | Target |
| ----- | ----- | ----- |
| Usability | Avg. time to create weekly multi-segment shift | ≤3 min |
| Accuracy | % conflicting segments per agent | 0% |
| Engagement | % supervisors using weekly calendar | ≥80% |
| Performance | Schedule retrieval (≤1000 shifts) | ≤1s |

---

## **5 | User Stories & Acceptance Criteria**

| Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| P0 | As an Admin, I want to create a weekly shift with multiple segments per day. | – Form allows ≥1 shift (start–end) per selected day. – Each segment validated: end \> start. – Segments cannot overlap. – Saved schedule shows all segments in calendar. |
| P0 | As an Admin, I want to edit existing segments. | – Edit modal pre-filled. – Segments can be added, updated, removed. – Conflict validation applied again. |
| P0 | As an Admin, I want to skip shifts on public holidays. | – Checkbox “Skip on Public Holiday”. – If enabled, all segments on that date suppressed. – Holiday list from system settings. |
| P0 | As an Admin, I want to delete/archive schedules. | – Delete requires confirmation. – Archive hides but keeps history. |
| P1 | As a Supervisor, I want to see my team’s weekly calendar. | – Calendar view groups shifts by day. – Each segment visualized separately. |
| P1 | As an Agent, I want to see my personal weekly shifts. | – Self view shows segments assigned. – Holiday skips flagged. |
| P2 | As an Admin, I want audit history of changes. | – Create/Edit/Delete/Archive logged with actor \+ timestamp. |

---

## **6 | Field-Level Details & Validation**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| Shift Name | String | Required, ≤50 chars | “CS Morning/Afternoon” |
| Agent(s) | Array | ≥1 | \[USR-001, USR-002\] |
| Days of Week | Multi-enum | Required | \[Mon, Wed, Fri\] |
| Segments | Array of {start, end} | ≥1, no overlap | \[ {08:00–12:00}, {13:00–17:00} \] |
| Skip on Holiday | Boolean | Default \= false | true |
| Status | Enum | Active/Archived | Active |

---

## **7 | Status Mapping**

| Backend Status | UI Badge |
| ----- | ----- |
| active | Green “Aktif” |
| deleted | Hidden |

---

## **8 | Error Handling**

| Scenario | Behavior |
| ----- | ----- |
| Overlapping segments | Error: “Segmen shift bertabrakan.” |
| End ≤ Start | Error: “Jam selesai harus lebih besar dari jam mulai.” |
| No segments provided | Error: “Minimal satu segmen shift.” |
| Holiday config missing | Error: “Daftar libur belum dikonfigurasi.” |

---

## **9 | UX Flow**

1. Admin → **Shift Schedule**.  
2. Default weekly calendar (list toggle available).  
3. **\+ Create Shift** → Fill form: Name, Agents, Days, Segments (add rows), Skip Holidays.  
4. Save → Shifts displayed in weekly view with multiple segments.

5. Edit → Add/remove/update segments.

6. Agents → **My Shifts** → see personal segments.

---

## **10 | Future Considerations**

| Item | Description |
| ----- | ----- |
| Custom recurrence | e.g., bi-weekly, monthly patterns. |
| Shift templates | Standard presets (Morning: 08–12, Afternoon: 13–17). |
| Auto-fill | Suggest segments from historical staffing load. |
| Notifications | Reminders before shift start per segment. |

