# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticket Visibility RBAC & View Scope  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v3.0 | 2026-04-08 | Yusril | Init |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide structured ticket ownership and visibility using RBAC, manual claim flow, and role-based view switcher. |
| Scope | Role-based visibility, dropdown view switcher, queue system, KPI-by-view behavior, and configurable permissions in Roles Settings. |

### **Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Manual claim flow | Auto assignment |
| RBAC via Roles Settings | Per-user override |
| View switcher in filter bar | New top-level tabs for ticket scope |
| KPI behavior per selected view | SLA redesign |
| Assign and reassign permission control | AI routing |

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Same visibility for all roles | High noise |
| No structured intake | Ticket delay |
| Fixed permission model | Not flexible for ops |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve focus | \-70% visible noise |
| Improve pickup | ≥90% tickets claimed \< 5 min |
| Improve flexibility | 100% role-based config adoption |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to use a view switcher instead of extra tabs so that the ticket page stays clean and focused. | 1\. Given I open Tickets page, When the filter bar loads, Then I see a **View** dropdown instead of additional top-level tabs for ticket scope. 2\. Given my role is Agent, When I open the View dropdown, Then I only see “Tiket Saya” and “Antrean Tim” if queue access is enabled. 3\. Given queue access is disabled for Agent, When I open the View dropdown, Then “Antrean Tim” is hidden. |
| US-002 | P0 | As an Agent, I want to see only my tickets in “Tiket Saya” so that I stay focused. | 1\. Given “Tiket Saya” is selected, When the ticket list loads, Then only tickets assigned to me are shown. 2\. Given no assigned ticket exists, When the list loads, Then show “Belum ada tiket”. |
| US-003 | P0 | As an Agent, I want to claim tickets from “Antrean Tim” so that I can start working on new tickets. | 1\. Given “Antrean Tim” is visible and selected, When I click “Ambil Tiket”, Then the selected ticket is assigned to me. 2\. Given another user claimed the same ticket first, When I click “Ambil Tiket”, Then the claim is blocked and show “Tiket sudah diambil oleh agent lain”. |
| US-004 | P0 | As a Supervisor, I want multiple role-based views so that I can monitor my team and also inspect my own work. | 1\. Given my role is Supervisor, When I open the View dropdown, Then I see “Semua Tiket Tim”, “Antrean Belum Ditugaskan”, and “Tiket Saya”. 2\. Given “Semua Tiket Tim” is selected, When the list loads, Then all tickets within my allowed team scope are shown. 3\. Given “Antrean Belum Ditugaskan” is selected, When the list loads, Then only unassigned tickets in my allowed team scope are shown. |
| US-005 | P0 | As a Supervisor, I want to manage ticket assignment so that team workload is balanced. | 1\. Given a ticket is visible in my scope, When I assign or reassign it, Then ownership is updated immediately. 2\. Given I return a ticket to queue, When the action succeeds, Then the ticket becomes unassigned and appears in the queue view. |
| US-006 | P0 | As an Admin, I want full view options in one dropdown so that I can inspect all ticket states without adding more tabs. | 1\. Given my role is Admin, When I open the View dropdown, Then I see “Semua Tiket”, “Belum Ditugaskan”, and “Ditugaskan”. 2\. Given “Semua Tiket” is selected, When the list loads, Then all tickets in the workspace are shown. 3\. Given “Belum Ditugaskan” is selected, When the list loads, Then only unassigned tickets in the workspace are shown. 4\. Given “Ditugaskan” is selected, When the list loads, Then only assigned tickets in the workspace are shown. |
| US-007 | P0 | As an Admin, I want to configure ticket permissions in Roles Settings so that each role sees the correct view options. | 1\. Given Roles Settings is updated, When save succeeds, Then the allowed views and actions change immediately based on role permissions. 2\. Given an invalid permission combination exists, When I try to save, Then the system blocks save and highlights the invalid dependency. |
| US-008 | P0 | As a user, I want KPI cards to follow the selected view so that the summary always matches the visible data. | 1\. Given the selected view changes, When the page refreshes data, Then KPI cards update to match that view only. 2\. Given “Tiket Saya” is selected, When KPI cards load, Then labels and counts reflect only my assigned tickets. 3\. Given “Antrean Belum Ditugaskan” or “Belum Ditugaskan” is selected, When KPI cards load, Then labels and counts reflect only queue items. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| RBAC | FR-001: System MUST enforce RBAC via Roles Settings. FR-002: Ticket visibility MUST follow the role scope and selected view. FR-003: Ticket actions MUST be permission-based. |
| View Switcher | FR-004: System MUST provide a **View** dropdown in the filter bar. FR-005: System MUST NOT add a new top-level tab row for ticket scope selection. FR-006: View Switcher MUST control ticket list content and KPI cards. FR-007: View Switcher options MUST differ by role. |
| Role-Based View Options | FR-008: Agent MUST see “Tiket Saya”. FR-009: Agent MAY see “Antrean Tim” only if queue access is enabled. FR-010: Supervisor MUST see “Semua Tiket Tim”, “Antrean Belum Ditugaskan”, and “Tiket Saya”. FR-011: Admin MUST see “Semua Tiket”, “Belum Ditugaskan”, and “Ditugaskan”. |
| View Definitions | FR-012: “Tiket Saya” MUST show only tickets assigned to the current user. FR-013: “Antrean Tim” MUST show unassigned tickets within the current user’s allowed team scope. FR-014: “Semua Tiket Tim” MUST show all tickets within the current user’s allowed team scope. FR-015: “Antrean Belum Ditugaskan” MUST show only unassigned tickets within the current user’s allowed team scope. FR-016: “Semua Tiket” MUST show all tickets in the workspace. FR-017: “Belum Ditugaskan” MUST show only unassigned tickets in the workspace. FR-018: “Ditugaskan” MUST show only assigned tickets in the workspace. |
| Claim | FR-019: Users MUST be able to claim tickets only if permission is enabled and the selected view includes queue access. FR-020: Claim MUST assign the ticket instantly to the claiming user. FR-021: System MUST prevent double claim. |
| Assignment | FR-022: Assign MUST be permission-based. FR-023: Reassign MUST be permission-based. FR-024: Return to queue MUST be permission-based. FR-025: Agent MAY assign tickets to others only if enabled in Roles Settings. |
| Queue | FR-026: System MUST maintain unassigned queue per team and workspace scope. FR-027: Queue views MUST default sort by SLA breached first, then oldest first. FR-028: Queue-related views MUST be hidden if queue access is not granted. |
| Filter Bar Placement | FR-029: View Switcher MUST be placed in the filter bar area, not in the top-level tab row. FR-030: Ticket Type tabs MUST remain as the only top-level tab row in the ticket page. |
| KPI | FR-031: KPI cards MUST follow the active selected view. FR-032: KPI labels and counts MUST match the current visible scope only. FR-033: KPI MUST NOT include out-of-scope data from hidden views. |
| Settings | FR-034: System MUST provide Roles Settings page to configure role-based ticket visibility and actions. FR-035: Admin MUST configure permissions per role. FR-036: Role permission changes MUST apply immediately after save. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| ER-001 | Claim conflict | Reject request | "Tiket sudah diambil oleh agent lain" |
| ER-002 | Permission denied | Block action | "Akses ditolak" |
| ER-003 | Invalid role config | Prevent save | "Pengaturan tidak valid" |
| ER-004 | Server error | Retry 3 times | "Terjadi kesalahan, coba lagi" |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Ticket Type Tabs | Existing top-level tabs for ticket type such as “Semua”, “Komplain”, “Pembayaran”, and others. | User switches ticket category using top tab row. | US-001 |
| View Switcher | Dropdown selector placed in filter bar, not as a new tab row. | User opens dropdown and selects one role-allowed view. | US-001, US-004, US-006 |
| Filter Bar | Contains View dropdown, Search, Filter, Sort, View Settings, and Export. | User changes view and applies search or filters in the same row. | US-001, US-008 |
| KPI Cards | Dynamic summary cards that update according to selected view. | User changes view, then KPI cards refresh to reflect the same scope. | US-008 |
| Ticket Table | Main table below KPI cards. | User sees filtered rows based on ticket type, selected view, and filters. | US-002, US-004, US-006 |
| Claim Button | Row action in queue-based views. | User clicks “Ambil Tiket” to assign ticket to self. | US-003 |
| Assign Dropdown | Row or bulk action for assign and reassign. | User with permission assigns or reassigns tickets. | US-005 |
| Empty State | View-specific empty state. | User sees correct empty state based on selected view. | US-002, US-003, US-008 |

### **UI Layout Reference**

\+----------------------------------------------------------------------------------+  
| Tickets                                                       \[+ New Ticket\]     |  
\+----------------------------------------------------------------------------------+

| Ticket Type Tabs: \[Semua\] \[Komplain\] \[Pembayaran\] \[Pengiriman\] ...               |

\+----------------------------------------------------------------------------------+  
| View: \[Tiket Saya ▼\]                                                             |  
| Search \[.................\]   Filter   Sort   View Settings   Export              |  
\+----------------------------------------------------------------------------------+

| KPI cards update based on selected view                                          |  
| Semua Tiket Saya | Butuh Respon | Sedang Diproses | Lewat SLA | Selesai         |  
\+----------------------------------------------------------------------------------+

| TABLE                                                                            |

### **Role-Based View Labels**

| Role | View Options |
| ----- | ----- |
| Agent | “Tiket Saya”, “Antrean Tim” if enabled (Disabled if RBAC set to Assigned tickets only) |
| Supervisor | “Semua Tiket Tim”, “Antrean Belum Ditugaskan”, “Tiket Saya” |
| Admin | “Semua Tiket”, “Belum Ditugaskan”, “Ditugaskan” |

---

## **10\. Field & Validation**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| View Switcher | Dropdown | 1\. Must show only role-allowed views. 2\. Must always have one selected value. 3\. Must fallback to first valid option if selected option becomes invalid. | Yes |
| Ticket Type Tab | Tab | 1\. Existing ticket type filter. 2\. Works independently from View Switcher. | Yes |
| Search | Text input | 1\. Applies within selected ticket type and selected view. 2\. Must not search outside visible scope. | No |
| Filter | Filter control | 1\. Applies within selected view scope only. | No |
| Sort | Dropdown | 1\. Applies within selected view scope only. 2\. Queue views default to SLA breached first, then oldest first. | No |
| Queue Claim Action | Row action button | 1\. Visible only in queue-capable views. 2\. Visible only if claim permission is enabled. | Conditional |
| Assign Action | Row or bulk action | 1\. Visible only if assign permission is enabled. 2\. Must follow RBAC scope. | Conditional |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Load \< 2 seconds |
| Security | RBAC enforced backend |
| Reliability | 99.9% uptime |

---

## **12\. Dependencies & Risks**

| Dependency / Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| RBAC misconfig | Product | High | Safe defaults |
| Claim race | Engineering | High | Locking |
| Over-permission agent | Ops | Medium | Audit logs |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Claim speed | \< 5 min | 30 days | Logs |
| SLA improvement | \+20% | 60 days | Reports |
| Permission usage | 100% roles configured | 30 days | Settings logs |

---

## **14\. Future Considerations**

| Topic | Why it matters |
| ----- | ----- |
| Auto assignment | Scaling |
| AI prioritization | SLA |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Manual claim only | Requires active agent |
| Role-based only | Limited granularity |

---

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| Claim Ticket | Assign ticket to self from queue. |
| Queue | Unassigned tickets. |
| View Switcher | Dropdown selector used to switch ticket visibility scope in the filter bar. |
| RBAC | Role-based control. |

### **RBAC Default Matrix**

| Capability | Admin | Supervisor | Agent |
| ----- | ----- | ----- | ----- |
| View Switcher in filter bar | Yes | Yes | Yes |
| View All Tickets | Yes | No | No |
| View Team Tickets | Yes | Yes | Configurable |
| View Assigned Tickets | Yes | Yes | Yes |
| View Queue | Yes | Yes | Configurable |
| Claim Ticket | Yes | Yes | Configurable |
| Assign Ticket | Yes | Yes | Configurable |
| Return to Queue | Yes | Yes | Configurable |

---

# **ADDENDUM: Team-Created Ticket Inclusion in View Scope**

## **17\. Addendum Overview**

| Item | Description |
| ----- | ----- |
| Addendum Name | Team-Created Ticket Inclusion in View Scope |
| Related Feature | Ticket Visibility RBAC & View Scope |
| Purpose | Clarify that team ticket visibility must include tickets created by members of the same team, not only tickets assigned to team members. |
| Trigger Context | Some workspaces do not rely on ticket assignment. They expect "Semua Tiket Tim" to include tickets created by their own team. |
| Scope Impact | View Switcher, RBAC visibility, KPI cards, search, filters, and empty states. |
| Out of Scope | Auto assignment, ticket ownership migration, new top-level tabs, new ticket state machine. |

---

## **17.1 Problem Clarification**

| Problem | Impact |
| ----- | ----- |
| Current "Semua Tiket Tim" definition may be interpreted as assigned-team tickets only. | Tickets created by team members may feel missing when assignment is not used. |
| Some clients use created-by-team workflow instead of assigned workflow. | Team supervisors cannot monitor all team-created tickets from one view. |
| KPI cards may not match team operational expectation. | Team metrics look lower or incorrect because created-by-team tickets are excluded. |

---

## **17.2 Revised View Definition**

| View | Existing Meaning | Revised Meaning |
| ----- | ----- | ----- |
| **Tiket Saya** | Tickets assigned to current user. | Tickets assigned to current user. If non-assignment visibility is enabled or no assignee exists, tickets created by current user MAY also be shown through "Dibuat oleh saya". |
| **Semua Tiket Tim** | All tickets within allowed team scope. | All tickets within allowed team scope, including assigned tickets, unassigned tickets in team scope, and tickets created by members of the same team. |
| **Antrean Belum Ditugaskan** | Unassigned tickets within allowed team scope. | Unassigned tickets within allowed team scope. This includes unassigned tickets created by team members if the ticket has no assignee. |
| **Dibuat oleh saya** | Tickets created by current user. | Tickets created by current user, regardless of assignee, as long as the current user still has access permission. |
| **Semua Tiket** | All tickets in workspace. | No change. Admin-only workspace-level visibility. |
| **Ditugaskan** | Assigned tickets in workspace. | No change. Admin-only assigned ticket visibility. |

---

## **17.3 View Scope Resolution Rule**

A ticket MUST be included in **"Semua Tiket Tim"** when at least one of these conditions is true:

| Rule ID | Inclusion Condition |
| ----- | ----- |
| TSR-001 | `ticket.teamInboxId` is within the current user's allowed Team Inbox scope. |
| TSR-002 | `ticket.assigneeId` belongs to a user within the current user's allowed team scope. |
| TSR-003 | `ticket.createdByUserId` belongs to a user within the current user's allowed team scope. |
| TSR-004 | `ticket.createdByTeamId` matches the current user's allowed team scope, if this field exists. |
| TSR-005 | Ticket is unassigned, but its creator team is within the current user's allowed team scope. |

---

## **17.4 Exclusion Rule**

A ticket MUST be excluded from **"Semua Tiket Tim"** when one of these conditions is true:

| Rule ID | Exclusion Condition |
| ----- | ----- |
| EXR-001 | Ticket belongs to another Team Inbox and has no creator relationship with the current user's team. |
| EXR-002 | Ticket is assigned to another team and the current user does not have cross-team visibility. |
| EXR-003 | Ticket has no Team Inbox, no assignee team, and no creator team relation to the current user. |
| EXR-004 | Current user does not have permission to view team tickets. |
| EXR-005 | Ticket is filtered out by active ticket type, status, date range, search, or custom filter. |

---

## **17.5 Functional Requirements Addendum**

| Category | Requirements |
| ----- | ----- |
| Team Scope Visibility | FR-037: System MUST include tickets created by members of the current user's allowed team scope in "Semua Tiket Tim". FR-038: System MUST NOT rely only on assignee to determine "Semua Tiket Tim" visibility. FR-039: System MUST resolve team ticket visibility using Team Inbox, assignee team, creator team, or createdByTeamId when available. |
| Non-Assignment Workflow Support | FR-040: System MUST support workspaces where ticket assignment is optional or not actively used. FR-041: In non-assignment workflows, "Semua Tiket Tim" MUST still show tickets created by members of the same team. FR-042: System MUST allow team supervisors to monitor team-created tickets even when no assignee exists. |
| KPI Behavior | FR-043: KPI cards MUST include team-created tickets when "Semua Tiket Tim" is selected. FR-044: KPI cards MUST apply the same view scope resolution as the ticket list. FR-045: KPI cards MUST NOT include tickets from another team scope unless the user has permission. |
| Search and Filters | FR-046: Search MUST run only after selected view scope is resolved. FR-047: Filters MUST not expose out-of-scope tickets through search result expansion. FR-048: Date range, ticket type, status, and advanced filters MUST apply after RBAC and view scope are resolved. |
| Audit and Stability | FR-049: System SHOULD persist `createdByTeamId` at ticket creation time for stable audit and visibility. FR-050: If a creator moves to another team later, historical ticket visibility SHOULD use `createdByTeamId` at creation time, not the creator's current team. FR-051: System MUST log visibility-impacting changes such as team transfer, ticket reassignment, and Team Inbox update. |

---

## **17.6 User Stories and Acceptance Criteria Addendum**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| AUS-001 | P0 | As a Supervisor, I want "Semua Tiket Tim" to include tickets created by my team so that I can monitor team work even without assignment. | 1\. Given a ticket is created by a member of my team, When I open "Semua Tiket Tim", Then the ticket is shown. 2\. Given the ticket has no assignee, When I open "Semua Tiket Tim", Then the ticket is still shown if the creator belongs to my team. 3\. Given the ticket was created by another team, When I open "Semua Tiket Tim", Then the ticket is not shown unless I have cross-team permission. |
| AUS-002 | P0 | As a Supervisor, I want KPI cards to include team-created tickets so that summary metrics match the visible list. | 1\. Given "Semua Tiket Tim" is selected, When KPI cards load, Then counts include assigned, unassigned, and team-created tickets within scope. 2\. Given a ticket is created by my team but not assigned, When KPI cards load, Then it is counted in the relevant KPI status. 3\. Given a ticket is outside my team scope, When KPI cards load, Then it is excluded. |
| AUS-003 | P0 | As an Agent, I want "Dibuat oleh saya" to show tickets I created so that I can track my own work without relying on assignment. | 1\. Given I created a ticket, When I select "Dibuat oleh saya", Then the ticket is shown. 2\. Given the ticket is assigned to another agent, When I select "Dibuat oleh saya", Then the ticket is still shown if I have access permission. 3\. Given I no longer have access to the ticket scope, When I select "Dibuat oleh saya", Then the ticket is hidden. |
| AUS-004 | P1 | As an Admin, I want team-created visibility to use creation-time team data so that visibility remains stable after team membership changes. | 1\. Given a user creates a ticket while belonging to Team A, When the user later moves to Team B, Then the ticket remains associated with Team A through `createdByTeamId`. 2\. Given `createdByTeamId` is missing, When visibility is resolved, Then system may fallback to current creator membership but should mark it as fallback logic internally. 3\. Given fallback cannot resolve team scope, When list loads, Then the ticket is hidden from team views and remains visible only to Admin-level views. |

---

## **17.7 UI and UX Requirements Addendum**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| View Dropdown | Keep existing dropdown. No new tab is required. | User selects "Semua tiket tim" and sees all tickets in team scope, including team-created tickets. | AUS-001 |
| "Semua Tiket Tim" Tooltip | Add helper text to clarify inclusion logic. | User hovers or opens helper info and sees explanation. | AUS-001 |
| KPI Cards | KPI cards follow revised view scope. | User changes view. KPI cards refresh using the same scope as ticket list. | AUS-002 |
| Empty State | Empty state should not appear if team-created tickets exist. | If no assigned tickets exist but team-created tickets exist, show the list instead of empty state. | AUS-001, AUS-002 |
| "Dibuat oleh saya" View | Existing or new view option if already supported in dropdown. | User selects "Dibuat oleh saya" to see self-created tickets. | AUS-003 |

### **UI Copy**

| Context | UI Copy |
| ----- | ----- |
| Tooltip for "Semua tiket tim" | "Menampilkan tiket yang ditugaskan ke tim Anda, belum ditugaskan di tim Anda, atau dibuat oleh anggota tim Anda." |
| Empty state for "Semua tiket tim" | "Belum ada tiket di tim Anda." |
| Empty state for "Dibuat oleh saya" | "Belum ada tiket yang Anda buat." |
| Permission blocked | "Akses ditolak." |

---

## **17.8 Field and Validation Addendum**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| `createdByUserId` | User ID | Must reference the user who created the ticket. Must not change after creation. | Yes |
| `createdByTeamId` | Team ID | Should capture the creator's team at ticket creation time. Should remain stable even if creator moves team. | Recommended |
| `teamInboxId` | Team Inbox ID | Used as primary team scope when present. | Conditional |
| `assigneeId` | User ID | Optional. Must not be required for team visibility. | No |
| `visibilityScope` | Derived | Derived from Team Inbox, assignee team, creator team, and user RBAC. | Derived |

---

## **17.9 Error Handling Addendum**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| AER-001 | Missing creator team | Fallback to `teamInboxId` or creator current team if safe. | No user-facing error. |
| AER-002 | Creator deleted or inactive | Use stored `createdByTeamId` if available. | No user-facing error. |
| AER-003 | Scope cannot be resolved | Hide from team-scoped views. Keep visible in Admin-level views. | No user-facing error. |
| AER-004 | KPI and list mismatch | Recompute KPI using the same query scope as ticket list. | Show loading state, then refresh counts. |
| AER-005 | Permission denied | Block access and keep ticket hidden. | "Akses ditolak." |

---

## **17.10 Edge Cases Addendum**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| AEC-001 | Ticket created by Team A member and not assigned. | Ticket appears in "Semua Tiket Tim" for Team A and "Antrean Belum Ditugaskan" if no assignee exists. |
| AEC-002 | Ticket created by Team A member and assigned to Team A agent. | Ticket appears in "Semua Tiket Tim" for Team A. |
| AEC-003 | Ticket created by Team A member and assigned to Team B agent. | Ticket appears in Team B active ownership scope. Creator can still see it in "Dibuat oleh saya" if permitted. Team A visibility depends on policy. Recommended MVP: do not show in Team A "Semua Tiket Tim" after active ownership moves to Team B. |
| AEC-004 | Ticket created without Team Inbox but creator has team membership. | Use `createdByTeamId` or creator team as fallback visibility. |
| AEC-005 | Creator moves from Team A to Team B. | Use `createdByTeamId` at creation time. Ticket remains in Team A historical scope. |
| AEC-006 | Creator belongs to multiple teams. | Prefer selected `teamInboxId`. If missing, use primary team at creation time. |
| AEC-007 | User has Supervisor access to multiple teams. | "Semua Tiket Tim" includes tickets from all allowed team scopes. |
| AEC-008 | Search query matches ticket outside team scope. | Do not show the ticket. RBAC scope wins over search relevance. |
| AEC-009 | Date filter excludes a team-created ticket. | Do not show the ticket. Active filters still apply after scope resolution. |
| AEC-010 | Assignment workflow is disabled operationally. | "Semua Tiket Tim" remains useful because it includes team-created and unassigned tickets. |

---

## **17.11 Recommended Query Priority**

For **"Semua Tiket Tim"**, system should resolve scope in this order:

| Priority | Scope Source | Notes |
| ----- | ----- | ----- |
| 1 | `teamInboxId` | Most explicit ownership. |
| 2 | `createdByTeamId` | Stable team-created ownership. |
| 3 | `assigneeId` team membership | Active working ownership. |
| 4 | `createdByUserId` current team | Fallback only if `createdByTeamId` is missing. |

---

## **17.12 Success Metrics Addendum**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Team-created ticket visibility accuracy | 100% pass in QA cases | Before release | QA regression |
| KPI and list count consistency | 100% match | Before release | Product analytics and API test |
| Ticket missing complaints from non-assignment clients | Reduced by 80% | 30 days after release | Support tickets |
| Supervisor usage of "Semua Tiket Tim" | Increased by 30% | 60 days after release | Usage analytics |

---

## **17.13 Implementation Note**

| Decision | Recommendation |
| ----- | ----- |
| Add workspace setting? | Not needed for MVP. |
| Change label? | Not needed. Keep "Semua tiket tim". |
| Add tooltip? | Required. This avoids user confusion. |
| Store `createdByTeamId`? | Strongly recommended. This prevents visibility bugs after team changes. |
| Default view for non-assignment client | Use "Semua Tiket Tim" for Supervisor. Use "Dibuat oleh saya" or "Tiket Saya" for Agent depending RBAC. |

---

## **17.14 Final Expected Behavior**

| Role | View | Expected Scope |
| ----- | ----- | ----- |
| Agent | Tiket Saya | Assigned to me. |
| Agent | Dibuat oleh saya | Created by me. |
| Supervisor | Semua Tiket Tim | Assigned to team, unassigned in team, or created by team members. |
| Supervisor | Antrean Belum Ditugaskan | Unassigned tickets in team scope, including team-created unassigned tickets. |
| Admin | Semua Tiket | All tickets in workspace. |
| Admin | Ditugaskan | Assigned tickets in workspace. |
| Admin | Belum Ditugaskan | Unassigned tickets in workspace. |

