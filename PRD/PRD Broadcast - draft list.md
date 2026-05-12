# **Product Requirement Document (PRD)**

**Feature:** Broadcast Draft list

| Launch Date | 9 June 2025 |
| :---- | :---- |
| **Author** | Resky, Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

## 

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.1 | 2025-10-09 | Yusril | Initial PRD using standard template; mapped to latest designs (search, filters, sortable table, side detail panel). |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a centralized, performant list of all **Broadcast drafts** so users can quickly find, review, and resume unfinished broadcasts. |
| Scope (MVP) | List view with search, filters (channel, sender), sort (Created at), right-side **Draft detail** panel, **Edit** action that opens the editor with prefilled data, empty state. |
| Out of Scope | Draft version history, deleting drafts, collaboration locking, bulk actions, export. |
| Audience | Admin, Supervisor. |
| Universal drafts | Drafts are **tenant-wide** (not personal). Any authorized user can see and open any draft in the same tenant. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | No consolidated, searchable list for all drafts. | Users recreate work; slower turnaround. |
| PS-002 | Key context (who created it, sender, channel) not visible at a glance. | Mis-picks, extra clicks. |
| PS-003 | Opening a draft can lose saved state. | Rework and errors in sending. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Discoverability | 100% drafts (status=draft) appear in ≤ 2 s p95. |
| Resume speed | ≥ 90% of **Edit** actions open the editor prefilled in ≤ 1.5 s p95. |
| Decision at a glance | ≥ 80% users confirm list has enough info to pick the right draft without opening details. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin/Supervisor, I want to see all tenant drafts in one place. | 1\. Given I open **Broadcast → Draft**, When data loads, Then the table lists all drafts in my tenant (status=draft). 2\. Pagination keeps current search/filter/sort. |
| US-002 | P0 | As a user, I want key info inline, including who created the draft. | 1\. Each row shows columns: **Broadcast name** (primary) with a **subtext “Created by {Full name}”**, **Created at** (local), **Recipients** (count), **Sender** (number \+ name), **Channel** (WA Web / WA API), **Action** (Edit). 2\. Names longer than one line truncate with ellipsis; tooltip shows full text. |
| US-003 | P0 | As a user, I want a detail panel for deeper context before editing. | 1\. Selecting a row opens **Draft detail** on the right showing: Draft ID, Name, Created at (local), Recipient sample, Sender account, Template used (if any), **Message content** (scrollable), and **Attributes** (top 5 \+ “See all”). |
| US-004 | P0 | As a user, I want to resume editing exactly where I left off. | 1\. Clicking **Edit** opens the Create Broadcast editor with all previously saved fields (recipients, content, attributes, sender, channel) prefilled. 2\. If the draft contains invalid fields (schema drift), the editor highlights them and prevents send until fixed. |
| US-005 | P1 | As a user, I want to quickly find drafts via search and filters. | 1\. Search matches **broadcast name** and **template name** (debounced 500 ms). 2\. Filters: **Channel** and **Sender**; changes apply in ≤ 2 s p95. 3\. Sorting: default by **Created at** (newest first); sortable by Name and Created at. |

---

## **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | Provide API to list drafts: `GET /broadcasts?status=draft` with pagination, search (name, template), filters (channel, sender), sort (created\_at desc default). |
| FR-002 | Table columns: **Broadcast name** (primary) \+ **Created by** (subtext), **Created at**, **Recipients**, **Sender** (E.164 \+ display name), **Channel**, **Action** (Edit). |
| FR-003 | Selecting a row populates the **Draft detail** panel with metadata, message preview (multiline, scrollable), and top 5 attributes with a **See all** link. |
| FR-004 | **Edit** loads the Create Broadcast editor with prefilled state. Draft status remains “draft” until scheduled/sent (outside scope). |
| FR-005 | Empty state appears when no drafts exist, with a CTA link “Create new broadcast”. |
| FR-006 | View state (search/filter/sort/page) persists via URL parameters so refresh/back retains context. |
| FR-007 | RBAC: Only tenant members with Admin/Supervisor roles can view/edit drafts; drafts are **universal** within tenant. |

---

## **7\. Error Handling**

| ID | Scenario | Handling | UI Copy (English) |
| ----- | ----- | ----- | ----- |
| EH-001 | List fetch fails | Keep skeleton rows; show retry banner/button. | “We could not load your drafts. Try again.” |
| EH-002 | Detail fetch fails | Keep table; show inline error in panel. | “Draft detail is unavailable.” |
| EH-003 | Editor load fails | Stay on list; toast with retry. | “Could not open the draft. Please try again.” |
| EH-004 | Permission denied | Block data; show message. | “Access denied.” |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Draft without a name | Show auto-name `Bc_Draft_YYYY_MM_DD_n`. |
| EC-002 | No recipients saved yet | Show Recipients as `—`; still editable. |
| EC-003 | Sender removed/inactive | Show Sender as masked number with badge “Unavailable”; editing requires choosing a new sender. |
| EC-004 | Extremely long message | Truncate in table; full preview in panel (scroll). |
| EC-005 | Mixed channels | Channel badges (WA Web / WA API); **All channel** filter defaults. |

---

## **9\. UI & UX Requirements**

| ID | Component | Description | Copy |
| ----- | ----- | ----- | ----- |
| UI-001 | Top controls | Search input, **Channel** dropdown, **Sender from** dropdown. | Search placeholder: “Search broadcast name or template” |
| UI-002 | Table | Columns per FR-002. Under **Broadcast name**, render a gray subline: **“Created by {Full name}”**. Rightmost action button: **Edit**. | Column headers: “Broadcast name”, “Created at”, “Recipients”, “Sender”, “Channel”, “Action” |
| UI-003 | Detail panel | Sections: **Broadcast detail**, **Message content**, **Broadcast Attributes** (top 5\) with **See all** link. | Buttons: “Edit” (top-right of panel) |
| UI-004 | Empty state | Illustration \+ helper text \+ CTA. | “No saved drafts yet. Create a broadcast and save it as draft to see it here.” |
| UI-005 | Loading | 5–10 skeleton rows; panel skeleton on first selection. | — |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| id | String | bc25092612 | Non-empty, unique | Yes |
| name | String | Bc\_2025\_09\_26\_001 | Auto-generate if empty; 1–100 chars | Yes |
| created\_at | Timestamp | 2025-09-26T05:00:00Z | ISO 8601; show tenant timezone in UI | Yes |
| recipients\_count | Integer | 125 | ≥ 0 | Yes |
| sender\_number | E.164 | \+6281234567890 | Valid E.164 | Yes |
| sender\_name | String | WA Bandung | 1–100 chars | Yes |
| channel | Enum | wa\_web | One of: wa\_web, wa\_api | Yes |
| created\_by\_id | String | user\_123 | Must belong to tenant | Yes |
| created\_by\_name | String | Jane Cooper | 1–100 chars | Yes |
| message\_preview | String | “Hello …” | Truncate to 2,000 chars in panel | Optional |
| attributes\_top | Array\<{name,value}\> | \[{name: “AWB”, value: “AWB371…”}\] | Up to 5 in panel | Optional |

---

## **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | List load ≤ 2 s p95 (≤ 500 drafts); detail load ≤ 1 s p95. |
| Usability | Default sort by **Created at** desc; keyboard-focusable rows; tooltips for truncation. |
| Reliability | Drafts persist until converted (send/schedule) or deleted (future). |
| Security | Tenant isolation; least privilege; no PII in logs. |
| Observability | Metrics for list latency, error rate, editor-open latency; correlation IDs in logs. |

---

## **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Internal | Broadcast service (draft schema) | Field drift breaks prefill | Contract tests; migration guards |
| Internal | Identity/RBAC | Cross-tenant leak | Enforce at query \+ integration tests |
| External | Timezone | Confusing timestamps | Show tenant timezone label near date/time |

---

## **13\. Success Metrics**

| KPI | Target | Window |
| ----- | ----- | ----- |
| List load p95 | ≤ 2 s | Ongoing |
| Edit open p95 | ≤ 1.5 s | Ongoing |
| Reopen→send completion | ≥ 60% | 30 days |
| User satisfaction (findability) | ≥ 80% positive | Quarterly |

---

## **14\. Future Considerations**

| Idea | Rationale |
| ----- | ----- |
| Delete draft (single/multi) with audit | Hygiene and governance |
| Ownership & labels (teams/tags) | Collaboration clarity |
| Bulk actions (duplicate, export) | Ops efficiency |
| Saved views (filters \+ sorts) | Speed for power users |
| Version history with diff | Compliance & rollback |

---

## **15\. Limitations**

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| No delete in MVP | Draft clutter over time | Rely on search/filters |
| No locking | Potential overwrite when two users edit same draft | Last-write-wins; warning in editor (future) |
| Limited preview in table | Need panel for full context | Panel optimized for quick scan |

---

## **16\. Appendix**

| Reference | Note |
| ----- | ----- |
| Channel badges | Distinct styles for WhatsApp Web vs WhatsApp API. |
| Row design | Matches provided design: table with right-side detail panel and inline **Edit** actions. |
| Universal scope | Drafts are shared across the tenant; “Created by” always shown under Broadcast name. |

