# **Product Requirement Document (PRD)**

**Feature:** Broadcast History List

| Launch Date | 9 June 2025 |
| :---- | :---- |
| **Author** | Resky, Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.0 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| 1.0 | 2025-10-15 | Yusril Ibnu | Initial PRD aligned to latest list-and-detail designs (table list, right-side detail panel, API icon support, full filters/sorts). |
| 1.1 | 2026-02-04 | Yusril Ibnu | Add **Team Inbox filter behavior (optional mapping)**, **server-side session-based view permission**, add **Retry Attempt (attempt number)** shown in list \+ detail. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a fast, auditable, and consistent **Broadcast history** experience with a table list and a slide-in detail panel across channels (WhatsApp Web, WhatsApp API, Open API) **with secure access control** and **team inbox filtering**. |
| In Scope | List view (table), search, filters, sorting, pagination, status badges, API icon, detail panel with metadata/content/attributes, **Team Inbox filter**, **session-based view permission validation**, **retry attempt number display**. |
| Out of Scope | Creating/editing broadcasts, retry/cancel/export mechanics (covered by separate PRDs), Open API specs (separate PRD), permission management UI. |
| Primary Users | Admin, Supervisor (Agent read-only optional by permission). |
| Success Criteria | Users can find any broadcast in ≤ 10 seconds; list P95 load ≤ 2 s; 0 ambiguous statuses; 100% rows open a valid detail panel; **0 unauthorized broadcast rows accessible**. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-01 | Fragmented visibility across channels and creators. | Slow investigations; inconsistent reporting. |
| PS-02 | Limited list tooling (no robust sort/filter). | Hard to find the right broadcast quickly. |
| PS-03 | Detail scattered across pages. | Longer MTTR when auditing issues and answering customer questions. |
| PS-04 | Team Inbox context not filterable and mapping is optional. | Audit by team is slow; “missing data” confusion for unmapped numbers. |
| PS-05 | Permission risk: list/detail can leak message content if only UI-gated. | Sensitive data exposure (message content \+ recipient numbers). |
| PS-06 | Retry attempt sequence not visible. | User cannot tell “kiriman keberapa” for resend/batch attempts. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result | Target |
| ----- | ----- | ----- |
| O1: One list for all broadcasts | 100% broadcasts visible with channel \+ API origin | Launch \+ ongoing |
| O2: Find-anything-fast | Search/filter result in ≤ 500 ms server time (P95) | P95 ≤ 0.5 s |
| O3: Audit-ready details | 100% rows open a detail panel with complete metadata | 100% |
| O4: Reliable performance | List P95 load ≤ 2 s for 50k rows with pagination | P95 ≤ 2 s |
| O5: Secure visibility | 0 unauthorized list rows returned; 0 unauthorized detail accesses | 0 |
| O6: Team Inbox investigation | Filter works with optional mapping and preserves history | 100% |
| O7: Retry transparency | 100% resend/batch rows show attempt number | 100% |

---

## **5\. User Stories and Acceptance Criteria (Merged \+ Extended)**

**Catatan:** Stories lama **tidak dihapus**. Ditambah AC baru untuk Team Inbox optional mapping, permission validation, dan retry attempt.

| ID | Role | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | Admin/Supervisor | I need a **single table** listing all broadcasts across channels. | 1\. Given I open Broadcast \> Messages, When the page loads, Then I see a table with columns **Broadcast name, Created at, Recipients, Sender, Progress, Channel** and paginated rows. 2\. Given data exists, When I scroll pages, Then pagination updates and rows render consistently. |
| US-002 | Admin/Supervisor | I want to **search** by broadcast name or template. | 1\. Given the search box, When I type a keyword and press Enter, Then the list shows matching rows only. 2\. Given an empty query, When I clear the box, Then the list resets to default. |
| US-003 | Admin/Supervisor | I want to **filter** by progress status, channel, creator, date, and team inbox. | 1\. Given filter controls, When I select Status/Channel/Creator/Date/Team inbox, Then only matching rows are displayed. 2\. Given active filters, When I click **Reset filter**, Then all filters clear and the list resets. 3\. Given Team Inbox mapping is optional, When filter is **All**, Then rows with `teamInboxIdAtSendTime = null` are included (subject to permission). 4\. Given I select a specific Team Inbox, When results load, Then rows with `teamInboxIdAtSendTime = null` are excluded. |
| US-004 | Admin/Supervisor | I want to **sort** by any visible column. | 1\. Given column headers, When I click a header, Then sorting toggles asc/desc and the sort icon updates. 2\. Given multi-page results, When sorted, Then the order is stable across pages. |
| US-005 | Admin/Supervisor/Agent (read-only) | I want to open a row and see **Broadcast detail** in a side panel. | 1\. Given a row, When I click it, Then a right-side panel opens showing **Broadcast ID, Broadcast name, Created at, Recipient, Sender account, Template used, Status, Message content, Broadcast Attributes** as per design. 2\. Given long content, When shown, Then fields wrap and the panel scrolls vertically. |
| US-006 | Admin/Supervisor | I want to recognize broadcasts created via **Open API**. | 1\. Given a row from Open API, When rendered, Then an **API** icon chip appears in the Created at cell exactly as designed. 2\. Given a selected Open API row, When viewing detail, Then all fields are **read-only**. |
| US-007 | Admin | I want quick access to **New Broadcast** and **Open API Broadcast** entry points. | 1\. Given the list header, When I click **New Broadcast**, Then the create flow opens (separate PRD). 2\. Given the header, When I click **Open API Broadcast**, then I am routed to API docs/entry (view-only; separate PRD). |
| US-008 | Supervisor | I want **status badges** that match system states. | 1\. Given any row, When rendered, Then the **Progress** column shows status badges that match system state mapping. 2\. Given status changes, When data refreshes, Then badges update without full page reload. |
| US-009 | Admin/Supervisor | I want a clear **empty state** and **error state**. | 1\. Given no data, When the list loads, Then I see the empty state message and a brief instruction. 2\. Given a fetch failure, When loading fails, Then I see an error state with **Retry**. |
| US-010 | Admin/Supervisor | I want the Team Inbox filter to work even if some numbers have no mapping. | 1\. Given some broadcasts were sent from numbers without Team Inbox mapping, When filter is **All**, Then those rows can appear with Team Inbox shown as “—” (subject to permission). 2\. When user selects Team Inbox X, Then only rows where `teamInboxIdAtSendTime == X` are shown. |
| US-011 | Admin/Supervisor | I want broadcast visibility to be enforced by **User Access Session** so unauthorized users can’t access list/detail. | 1\. Given my session has allowed team inbox scope, When I fetch list, Then API returns only permitted rows. 2\. Given I try to open detail for a row outside my scope, Then API returns **403** (or **404**, pick one and keep consistent) and UI shows “Access denied”. 3\. Given Team Inbox is null (unassigned), Then by default only Admin/Supervisor can view. |
| US-012 | Admin/Supervisor | I want to know this broadcast is **attempt keberapa** (retry/batch attempt). | 1\. Given a row has attempt metadata, When list renders, Then UI shows “Attempt \#N” (or “Percobaan ke-N”) near Reason/Progress. 2\. Given detail panel opens, Then attempt number is visible in detail metadata. 3\. Given attempt metadata missing, Then attempt UI is hidden and row remains usable. |

---

## **6\. Functional Requirements** 

| ID | Requirement |
| ----- | ----- |
| FR-001 | System MUST render a **table list** with columns: Broadcast name, Created at (date \+ local time), Recipients (count), Sender (account name/number), Progress (badge), Channel (label), and **Reason** (as in current UI). |
| FR-002 | System MUST support **search** by broadcast name or template string. |
| FR-003 | System MUST support **filters**: Progress status, Channel (WA Web, WA API, Open API), Creator, Date range, **Team inbox**. |
| FR-004 | System MUST support **sorting** by every visible column; default sort is **Created at (desc)**. |
| FR-005 | System MUST implement **pagination** with page size controls and persistent state across filters/sorts. |
| FR-006 | System MUST display an **API** chip in the Created at cell for broadcasts created through Open API (`is_api_broadcast = true`). |
| FR-007 | System MUST open a **slide-in detail panel** on row click and show: Broadcast ID, Broadcast name, Created at, Recipient (name \+ number or summary), Sender account (account \+ number), Template used, Status, Message content (full), Broadcast Attributes (top 5 \+ “See all”). |
| FR-008 | System MUST ensure **Open API broadcasts are view-only** in both list and detail (no inline actions). |
| FR-009 | System MUST provide global actions in header: **New Broadcast** and **Open API Broadcast** (navigation only). |
| FR-010 | System MUST provide **empty**, **loading (skeleton)**, and **error** states for both list and detail. |
| FR-011 | System SHOULD refresh list/status periodically (e.g., every 60 s) without breaking sort/filter context. |
| FR-012 | System MUST persist user UI state (search, filters, sort, page) during navigation within the Broadcast module session. |

### **New / Updated Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-013 | System MUST standardize status enum to: **SUCCESS, IN\_PROGRESS, SCHEDULED, FAILED, CANCELED, INVALID\_NUMBER**. |
| FR-014 | System MUST map status enum to UI badge labels consistently (see Appendix). |
| FR-015 | System MUST add **Team Inbox filter** as dropdown with search. Default \= **All** (no filter). |
| FR-016 | Team Inbox mapping is optional: broadcast from mapped sender number → `teamInboxIdAtSendTime` filled; unmapped → `teamInboxIdAtSendTime = null`. |
| FR-017 | When Team Inbox filter is selected (specific teamInboxId), system MUST return only rows where `teamInboxIdAtSendTime == selectedTeamInboxId`; rows with null MUST be excluded. |
| FR-018 | When Team Inbox filter is All, system MUST include both `teamInboxIdAtSendTime = null` and non-null rows (subject to permission). |
| FR-019 | System MUST store **teamInboxIdAtSendTime** (immutable historical value) at creation/sending time; changes to mapping later MUST NOT change historical rows. |
| FR-020 | List endpoint MUST support optional query param `teamInboxId`. |
| FR-021 | List response MUST include `teamInboxIdAtSendTime` (nullable) per row; SHOULD include `teamInboxNameAtSendTime` (nullable) for UI readability. |
| FR-022 | System MUST enforce **server-side permission** using **User Access Session** for both list and detail endpoints. |
| FR-023 | Default permission for unassigned broadcasts (`teamInboxIdAtSendTime = null`) MUST be **Admin/Supervisor only**. |
| FR-024 | System MAY allow unassigned broadcasts for other roles only with explicit session flag `canViewUnassignedBroadcasts = true`. |
| FR-025 | System MUST support **retry attempt number** for each broadcast row: `attemptNumber` (integer, optional). |
| FR-026 | If `attemptNumber` exists, UI MUST display attempt number in list and detail (“Attempt \#N” / “Percobaan ke-N”). If not exists, hide attempt UI. |

---

## **7\. Permission Model (User Access Session) — Minimum**

**Session object (evaluated server-side)**

* `role`: Admin | Supervisor | Agent  
* `allowedTeamInboxIds`: `["ti_1","ti_2",...]` or `"*"`  
* `canViewUnassignedBroadcasts`: boolean (default false; **true by default for Admin/Supervisor**)

**Rules**

1. **List** returns only rows within scope:  
   * If `allowedTeamInboxIds == "*"`, allow all team inbox IDs.  
   * Else allow only `teamInboxIdAtSendTime in allowedTeamInboxIds`.

2. **Unassigned rows (`teamInboxIdAtSendTime = null`)**:

   * Allowed only if role is Admin/Supervisor OR `canViewUnassignedBroadcasts == true`.

3. **Detail** must enforce the same logic:

   * Unauthorized → **403** (recommended) OR 404 (if you want anti-enumeration); choose one and keep consistent.

4. **Filter dropdown** should be scoped:

   * Only show team inbox options the user can access (unless `"*"`).

---

## **9\. Error Handling**

| ID | Type | Handling | UI Copy (English) |
| ----- | ----- | ----- | ----- |
| EH-001 | List fetch failed | Show error state with **Retry**; keep prior state if available. | Failed to load broadcasts. Retry. |
| EH-002 | Detail fetch failed | Keep panel frame; show inline error with **Retry** button. | Failed to load details. Retry. |
| EH-003 | Permission denied | Hide privileged buttons; show read-only list or 403 state based on role. | You do not have permission to access this page. |
| EH-004 | No results | Show empty state with hint to adjust filters/search. | No broadcasts found. Try changing filters or search. |
| EH-005 | Invalid teamInboxId param | Return empty results (or 400 if strict). UI shows empty state. | No broadcasts found. |
| EH-006 | Attempt number invalid | Ignore attempt UI, do not block rendering. | — |

---

## **10\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Extremely long broadcast names | Truncate in list with tooltip on hover; full in detail. |
| EC-002 | Very long message bodies (multi-kB) | List shows preview only; detail panel scrolls; performance retained. |
| EC-003 | Missing template name | Show dash (—) in detail; do not block. |
| EC-004 | Recipient without display name | Show number only, no placeholder error. |
| EC-005 | Very large result sets | Server-side pagination; sorting and filtering remain stable. |
| EC-006 | Rapid status flips | Periodic refresh updates badges without re-sorting unless user changes sort. |
| EC-007 | All filters combined to zero results | Show empty state, keep filters intact. |
| EC-008 | API-origin broadcasts | API chip shown; all actions hidden/disabled (view-only). |
| EC-009 | Team Inbox mapping changes later | Historical rows MUST remain unchanged via `teamInboxIdAtSendTime`. |
| EC-010 | teamInboxIdAtSendTime is null | Visible only to Admin/Supervisor (or explicit permission flag). |
| EC-011 | User tampers teamInboxId query param | API still enforces session scope; returns 0 rows or denies. |
| EC-012 | attemptNumber missing / null | No attempt UI; row remains usable. |
| EC-013 | attemptNumber \<= 0 | Treat as invalid; ignore attempt UI. |

---

## **11\. UI & UX Requirements**

| Component | Description | States (English labels) |
| ----- | ----- | ----- |
| List header | Search input, filter chips/dropdowns (Status, Channel, Creator, Date, **Team inbox**), buttons **Open API Broadcast**, **New Broadcast**. | Default, with active filters (show count), disabled buttons per role. |
| Team Inbox filter | Dropdown \+ search; default **All**; options scoped by session. | Default, Searching, No results. |
| Table list | Columns: **Broadcast name**, **Created at**, **Recipients**, **Sender**, **Progress**, **Reason**, **Channel**. Sortable by all. Pagination at bottom. | Loading skeleton, Empty, Error. |
| Status badges | Badge based on mapping table (Appendix). | Always visible; color-accessible. |
| Attempt indicator | If `attemptNumber` exists, show “Attempt \#N” near Reason (or line above Reason). | Shown / Hidden. |
| API chip | Appears in **Created at** cell when `is_api_broadcast = true`. Label: **API**. | Tooltip: Created via Open API. |
| Detail panel (right) | Sections: **Broadcast detail** (ID, name, created at, recipient summary, sender, template, status, **attempt \#**), **Message content**, **Broadcast Attributes** (top 5 \+ See all). | Loading, Error, Content; scrollable; close button (X). |
| Empty state | Center illustration \+ guidance. | Text: **No broadcasts created yet.** |
| Permission denied | If API denies detail, show blocked state. | Text: **Access denied.** |

---

## **12\. Field & Validation (Updated)**

| Field | Type | Rules | Example |
| ----- | ----- | ----- | ----- |
| status | Enum | SUCCESS, IN\_PROGRESS, SCHEDULED, FAILED, CANCELED, INVALID\_NUMBER | IN\_PROGRESS |
| teamInboxIdAtSendTime | String/Null | Nullable; immutable for history | null |
| teamInboxNameAtSendTime | String/Null | Nullable; display only | Sales Team |
| attemptNumber | Integer/Null | Optional; if present must be \>= 1 | 2 |

---

## **13\. Non-Functional Requirements**

| ID | Category | Requirement |
| ----- | ----- | ----- |
| NFR-01 | Performance | List API P95 ≤ 2 s; Detail API P95 ≤ 1.5 s; UI interaction ≤ 100 ms paint for sorts/filters. |
| NFR-02 | Scalability | Handle 50,000+ broadcasts with server pagination and indexed filters/sorts. |
| NFR-03 | Availability | 99.5% monthly uptime for list/detail endpoints. |
| NFR-04 | Security | Session-based server enforcement for list & detail; protect content from XSS (escape display). |
| NFR-05 | Observability | Structured logs for list/detail queries and panel opens (with trace IDs \+ permission outcome). |

---

## **14\. Success Metrics**

| Metric | Target |
| ----- | ----- |
| Find time (from load to first valid click) | ≤ 10 s median |
| List load performance | P95 ≤ 2 s |
| Detail open success | 99.9% without error |
| Status correctness | 100% mapping accuracy in QA suite |
| Unauthorized access | 0 successful unauthorized list/detail access |

---

## **15\. Appendix**

### **A) Status badge mapping**

| Backend Status | UI Label |
| ----- | ----- |
| SUCCESS | Delivered |
| IN\_PROGRESS | Sending |
| SCHEDULED | Scheduled |
| FAILED | Failed |
| CANCELED | Canceled |
| INVALID | Invalid Receipt Number/Address |

### **B) Team Inbox filter rules (minimum)**

* Default **All**: include null \+ non-null (subject to permission).  
* Specific Team Inbox selected: only exact match; exclude null.

### **C) Permission default**

* Unassigned (`teamInboxIdAtSendTime = null`) **Admin/Owner only** unless `canViewUnassignedBroadcasts=true`.

