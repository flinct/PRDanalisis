# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticket List Page (Tabs, View Settings, Filters, Search, Bulk Actions, Bulk Reply)

| Author | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.0 |
| **TRD** |  |

---

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-08 | Yusril | Initial PRD based on Lincah needed and make it general. Includes priorities P0 to P2 and end to end requirements for ticket list. |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide a fast, scannable ticket list to find, triage, and update tickets with consistent data across channels and teams. |
| **Key Capabilities** | Ticket type tabs and per tab view settings. List with configurable columns. Filters and search with scope. Row actions. Tags and multi agent assignment. |
| **Outcome** | Reduce time to locate tickets. Improve triage speed. Reduce missed “need response” tickets. |
| **Scope** | Ticket list table and default columns. Ticket type tabs. View settings per ticket type tab. Filters panel including custom field filter placeholders. Search with scope selector. Row actions menu. KPI strip. Selection and bulk action bar. Bulk reply upload flow. Sticky pinned columns. Sort behavior. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Ticket list is hard to scan due to missing critical fields | Slower triage and higher SLA risk. |
| 2 | Filters and search do not support ticket type specific fields cleanly. | Users cannot find tickets by operational identifiers like AWB. |
| 3 | Bulk operations are limited. | High volume operations become manual and error prone. |

---

## **3 | Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Faster discovery and triage. | Median “find target ticket” time improves by 30%. |
| Reduce missed replies. | “Need response” tickets older than SLA reduces by 20%. |
| Improve operational consistency. | 95% of users keep a stable view configuration per ticket type tab. |

---

## **4 | Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve scanability of ticket list. | Increase ticket list usage sessions per day by 15%. |
| Reduce manual repetitive actions. | Reduce average clicks per ticket update by 20%. |

---

## **5 | User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I view a list of tickets with the default columns in a predictable order. | 1\. Given I open the ticket list, When the list loads, Then I see default columns in this order: “ID Tiket”, “Judul”, “Klien”, “Kanal”, “Prioritas”, “Agen”, “Durasi”, “SLA”, “Status”, “Tim Inbox”, “Tag”, “Balasan terakhir”. 2\. Given the list is loading, When data is not ready, Then I see a loading state and no broken table layout. 3\. Given data retrieval fails, When the list cannot load, Then I see an error state with retry action. |
| US-002 | P0 | As an Agent, I can open a ticket from the list. | 1\. Given the ticket list is visible, When I click a row, Then the ticket detail opens. 2\. Given I click a row action button, When I click the “•••” menu trigger, Then it does not open the ticket detail. |
| US-003 | P0 | As an Agent, I can switch between ticket type tabs to focus on a specific workflow. | 1\. Given there is more than one ticket type, When I open the list, Then I see tabs including “Semua” and each ticket type name. 2\. Given there is only one ticket type, When I open the list, Then tabs are not shown. 3\. Given I switch tabs, When the tab changes, Then the list shows tickets for that tab scope. |
| US-004 | P0 | As an Agent, I can customize visible columns per ticket type tab via view settings. | 1\. Given I am on a specific ticket type tab, When I open “Pengaturan tampilan”, Then I can toggle columns on or off for that tab only. 2\. Given I am on “Semua”, When I open “Pengaturan tampilan”, Then I can toggle base columns but cannot toggle custom field columns. 3\. Given “ID Tiket” is a required column, When I try to hide it, Then the system keeps it enabled. |
| US-005 | P0 | As an Agent, I can show ticket type custom fields as columns only when the ticket type tab is active. | 1\. Given I am on a ticket type tab, When I enable a custom field column, Then it appears as a column in the table for that tab. 2\. Given I return to “Semua”, When I view the table, Then those custom field columns are not shown. |
| US-006 | P0 | As an Agent, I can filter tickets using a consistent filter panel. | 1\. Given I open “Filter”, When I view filter controls, Then I can set: created date range, kanal, prioritas, agen, tag, tim inbox, status. 2\. Given I am on “Semua”, When I open “Filter”, Then custom field filters are not shown. 3\. Given I am on a ticket type tab, When I open “Filter”, Then ticket type custom field filters are shown. |
| US-007 | P0 | As an Agent, I can search tickets using a combined scope selector inside the search box. | 1\. Given I am on “Semua”, When I open the search scope selector, Then I only see: “ID Tiket”, “Judul”, “Klien”, “Deskripsi”. 2\. Given I am on a ticket type tab, When I open the search scope selector, Then I also see custom fields for that ticket type. 3\. Given I enter multiple terms separated by comma, When I submit search, Then each term is applied as part of the search query. |
| US-008 | P0 | As an Agent, I can manage tags from the list. | 1\. Given a ticket row has tags, When I click the remove icon on a tag, Then the tag is removed from the ticket. 2\. Given a ticket row, When I click the add tag control, Then I can add a tag to the ticket. 3\. Given I do not have permission to edit tags, When I attempt to add or remove, Then the UI blocks the action with an error message. |
| US-009 | P0 | As an Agent, I can update ticket status from the row actions menu. | 1\. Given a ticket row, When I open the “•••” menu, Then I see actions including status update and close. 2\. Given I change status, When the update succeeds, Then the “Status” column reflects the new value. 3\. Given the update fails, When the request returns an error, Then the UI shows an error and the row remains unchanged. |
| US-010 | P0 | As an Agent, I can assign one or more agents from the “Agen” column control. | 1\. Given a ticket row, When I open the “Agen” dropdown, Then I can select one or more agents. 2\. Given I unselect all agents, When I save, Then the ticket becomes unassigned. 3\. Given agent update fails, When the request returns an error, Then the UI shows an error and the assignment remains unchanged. |
| US-011 | P1 | As an Agent, I see KPI summary strip and can filter by KPI cards. | 1\. Given the list page is loaded, When I view the KPI strip, Then the default active card is “Semua tiket”. 2\. Given I click “Butuh respons”, When applied, Then only tickets flagged as need response appear. 3\. Given I click the active KPI card again, When toggled off, Then it returns to “Semua tiket”. |
| US-012 | P1 | As an Agent, I can select multiple tickets and use bulk actions from a bottom action bar. | 1\. Given I select at least one ticket, When selection is active, Then a bottom bulk action bar appears with actions: update status, add tag, remove tag, close, bulk reply, cancel. 2\. Given I clear selection, When no tickets are selected, Then the bulk action bar disappears. |
| US-013 | P1 | As an Agent, I can bulk reply by uploading an .xlsx and choosing visibility in the UI. | 1\. Given I have selected tickets, When I click “Balas massal”, Then a modal opens showing selected ticket count. 2\. Given I click “Unduh template”, When downloaded, Then the template includes exactly columns: identifier and reply. 3\. Given I uncheck “Kirim ke pelanggan”, When I submit, Then replies are created as internal notes. |
| US-014 | P1 | As an Agent, I can keep “ID Tiket” and “•••” action column visible while horizontally scrolling. | 1\. Given the table is horizontally scrolled, When I scroll, Then “ID Tiket” stays visible at the left and “•••” stays visible at the right. |
| US-015 | P2 | As an Agent, I can sort the list by common operational priorities. | 1\. Given I open “Urutkan”, When I choose an option, Then the list order updates accordingly. 2\. Given I do nothing, When the list loads, Then default sort is “Dibuat”. |

---

## **6 | Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access and Roles | FR-001 \[P0\]: System MUST allow Agents and Supervisors to access the ticket list page. FR-002 \[P0\]: System MUST apply workspace isolation for all list data and actions. |
| Ticket Type Tabs | FR-003 \[P0\]: System MUST show tab “Semua” and each ticket type name only when there are 2 or more ticket types. FR-004 \[P0\]: System MUST hide tabs when there is only 1 ticket type. FR-005 \[P0\]: System MUST scope list data by active tab. |
| Table Columns and Defaults | FR-006 \[P0\]: System MUST render default columns in this order: ticket id, title, client, channel, priority, agent, lifetime, sla, status, team inbox, tags, last reply. FR-007 \[P0\]: System MUST always show “ID Tiket” and it cannot be disabled in view settings. FR-008 \[P0\]: System MUST support optional columns: description, created date, closed date, custom fields. FR-009 \[P0\]: System MUST show client as 2 lines: name and contact. |
| Need Response Indicator | FR-010 \[P0\]: System MUST show “Butuh respons” indicator under “ID Tiket” when need response is true. FR-011 \[P0\]: System MUST hide the indicator when need response is false. |
| Lifetime | FR-012 \[P0\]: System MUST compute lifetime as now minus created time for non resolved tickets. FR-013 \[P0\]: System MUST compute lifetime as resolved time minus created time for resolved tickets. FR-014 \[P0\]: System MUST display lifetime as a compact duration string. |
| SLA | FR-015 \[P0\]: System MUST show SLA as a countdown remaining time to the due time. FR-016 \[P0\]: System MUST show overdue SLA when remaining time is negative. FR-017 \[P0\]: System MUST show “-” SLA when ticket is resolved or due time is empty. |
| Last Reply | FR-018 \[P0\]: System MUST show last reply as one column containing last reply text and last reply date. FR-019 \[P0\]: System MUST show “-” when last reply is empty. |
| Channel Display | FR-020 \[P0\]: System MUST show channel as icon plus short text value. FR-021 \[P0\]: System MUST support at least WA, IG, Email as channel values. |
| Agent Assignment | FR-022 \[P0\]: System MUST allow selecting 0 to N agents per ticket from the “Agen” column control. FR-023 \[P0\]: System MUST persist the selected agent list on save. FR-024 \[P0\]: System MUST support “unassigned” state when agent list is empty. |
| Team Inbox | FR-025 \[P0\]: System MUST allow selecting a team inbox from the “Tim Inbox” dropdown in each row. FR-026 \[P0\]: System MUST store team inbox as a single value per ticket. |
| Tags | FR-027 \[P0\]: System MUST allow adding tags from the row “Tag” column control. FR-028 \[P0\]: System MUST allow removing tags from the “Tag” column via per tag remove action. FR-029 \[P0\]: System MUST also allow add tag and remove tag from the row “•••” menu. |
| Row Actions Menu | FR-030 \[P0\]: System MUST provide row actions menu with update status, add tag, remove tag, close ticket. FR-031 \[P0\]: System MUST require confirmation for close ticket action. |
| View Settings Per Tab | FR-032 \[P0\]: System MUST store view settings per ticket type tab, including visible columns and column order. FR-033 \[P0\]: System MUST allow enabling custom field columns only when a specific ticket type tab is active. FR-034 \[P1\]: System SHOULD provide drag and drop UI to change column order in view settings. |
| Filters | FR-035 \[P0\]: System MUST provide filter inputs for created date range, channel, priority, agent, tags, status, team inbox. FR-036 \[P0\]: System MUST show custom field filters only on specific ticket type tabs. FR-037 \[P0\]: System MUST map custom field filter UI by field type: text, select, date range, has file boolean. |
| Search | FR-038 \[P0\]: System MUST provide a search input with an embedded scope selector. FR-039 \[P0\]: System MUST support comma separated terms for search input. FR-040 \[P0\]: System MUST hide custom field search scopes on tab “Semua”. |
| KPI Strip | FR-041 \[P1\]: System SHOULD show a KPI strip with counts and quick filters. FR-042 \[P1\]: System SHOULD support at least these KPI cards: all tickets, new tickets, need response, in progress, over SLA, solved. |
| Selection and Bulk Actions | FR-043 \[P1\]: System SHOULD allow selecting multiple tickets via checkbox column. FR-044 \[P1\]: System SHOULD show a bottom bulk action bar when selection count is greater than 0\. FR-045 \[P1\]: System SHOULD support bulk actions: update status, add tag, remove tag, close, bulk reply. |
| Bulk Reply | FR-046 \[P1\]: System SHOULD allow downloading a bulk reply template for selected tickets. FR-047 \[P1\]: System SHOULD support uploading .xlsx with columns identifier and reply only. FR-048 \[P1\]: System SHOULD support selecting identifier type as ticket number or a selected custom field key. FR-049 \[P1\]: System SHOULD support a UI toggle for visibility with values customer reply or internal note. |
| Sticky Columns | FR-050 \[P1\]: System SHOULD keep selection checkbox column visible while horizontally scrolling. FR-051 \[P1\]: System SHOULD pin “ID Tiket” column to the left while horizontally scrolling. FR-052 \[P1\]: System SHOULD pin “•••” actions column to the right while horizontally scrolling. |
| Sort | FR-053 \[P2\]: System MAY support sort options: created, SLA due, longest lifetime, last activity, priority high first. FR-054 \[P2\]: System MAY default sort to created. |

---

## **7 | Error Handling**

| Error Code | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| ERR-001 | Ticket list fetch fails | Show error state and “Coba lagi”. Do not render partial broken rows. |
| ERR-002 | Filter query invalid | Return 400\. UI resets invalid filter and shows “Filter tidak valid”. |
| ERR-003 | Search query too long | Return 422\. UI shows “Pencarian terlalu panjang”. |
| ERR-004 | Update agent assignment fails | Do not change displayed agents. Show “Gagal memperbarui agen”. |
| ERR-005 | Update team inbox fails | Do not change displayed value. Show “Gagal memperbarui tim inbox”. |
| ERR-006 | Add tag fails | Do not add tag chip. Show “Gagal menambah tag”. |
| ERR-007 | Remove tag fails | Do not remove tag chip. Show “Gagal menghapus tag”. |
| ERR-008 | Status update fails | Do not update status badge. Show “Gagal memperbarui status”. |
| ERR-009 | Close ticket fails | Do not change status. Show “Gagal menutup tiket”. |
| ERR-010 | Bulk reply upload has missing columns | Reject upload with 422\. Show “Format file tidak sesuai”. |
| ERR-011 | Bulk reply identifier does not match any selected ticket | Reject that row. Return a row level error and continue other valid rows if partial mode is enabled. If partial mode is not enabled, reject entire upload. |
| ERR-012 | Bulk reply ambiguous identifier | Reject with 422\. Provide the conflicting identifiers and affected ticket count. |

---

## **8 | Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Ticket has no last reply | Show “-” for text and date in “Balasan terakhir”. |
| EC-002 | Ticket is resolved but due time exists | SLA shows “-”. Lifetime stops increasing. |
| EC-003 | Ticket has many tags | Wrap tags in the cell. Keep row height within 3 lines then truncate with tooltip. |
| EC-004 | Concurrent updates to the same ticket from different users | Last write wins. UI refresh shows the latest server state. |
| EC-005 | User switches tabs with active custom field search scope | System resets search scope to a valid non custom scope if the new tab is “Semua”. |
| EC-006 | Custom field is enabled as a column but value is missing for a ticket | Show “-” in the cell. |
| EC-007 | Bulk reply uses custom field identifier but some selected tickets miss that field | Template download includes empty identifier cells for missing values. Upload rejects those rows unless user fills a valid identifier. |
| EC-008 | Bulk reply file contains duplicate identifiers | Reject with 422 and list duplicates. |
| EC-009 | Large dataset | Use pagination and avoid rendering more than one page at a time. |
| EC-010 | Need response flag changes while user is on the page | KPI counts and badge update after refresh or polling. |

---

## **9 | UI & UX Requirements**

| Area | Requirements | Linked Stories |
| ----- | ----- | ----- |
| Page Header | Show title “Tiket”. Show button “Buat tiket” on the right. Button can be disabled based on permission. | US-001 |
| Tabs | First tab label is “Semua”. Other tabs show ticket type names. Hide tabs if only one type exists. | US-003 |
| KPI Strip (P1) | KPI cards include labels in Bahasa: “Semua tiket”, “Tiket baru”, “Butuh respons”, “Dalam proses”, “Lewat SLA”, “Selesai”. Default active is “Semua tiket”. | US-011 |
| Top Controls | Search bar includes embedded scope selector. Scope labels: “ID Tiket”, “Judul”, “Klien”, “Deskripsi”. Custom field scopes only appear on non “Semua” tabs. | US-007 |
| Filters | Button label “Filter”. Filters appear in a panel. Created date range is a single control labeled “Rentang tanggal dibuat”. | US-006 |
| View Settings | Button label “Pengaturan tampilan”. Settings are stored per tab. Show custom field columns section only when a specific ticket type tab is active. | US-004, US-005 |
| Table Headers | Column header labels in Bahasa: “ID Tiket”, “Judul”, “Klien”, “Kanal”, “Prioritas”, “Agen”, “Durasi”, “SLA”, “Status”, “Tim Inbox”, “Tag”, “Balasan terakhir”. | US-001 |
| Ticket ID Cell | Ticket ID is first line. Second line shows indicator “Butuh respons” with soft styling when true. | US-010 |
| Client Cell | Show name on first line. Show contact on second line. No extra caption. | US-001 |
| Channel Cell | Show icon plus short text. | US-001 |
| Agent Cell | Use a dropdown multi select. Show “Belum ditugaskan” when empty. | US-010 |
| Tags Cell | Show tag chips with remove icon. Show add control. | US-008 |
| Row Actions | Rightmost column is “•••”. Menu items: “Perbarui status”, “Tambah tag”, “Hapus tag”, “Tutup”. | US-009 |
| Bulk Action Bar (P1) | Appears at bottom when selection count is greater than 0\. Show action buttons and “Batal”. | US-012 |
| Bulk Reply Modal (P1) | Title “Balas massal”. Show selected count label like “23 tiket dipilih”. Button “Unduh template”. Upload input label “Unggah Balasan”. Toggle label “Kirim ke pelanggan”. | US-013 |
| Sticky Columns (P1) | Pin selection checkbox, “ID Tiket”, and “•••” while horizontally scrolling. | US-014 |
| States | Empty state text “Tidak ada tiket”. Error state includes “Coba lagi”. | US-001 |

---

## **10 | Field & Validation**

| Field | Type | Used In | Description | Validation Rules |
| ----- | ----- | ----- | ----- | ----- |
| ticket\_id | String | List column “ID Tiket” | Human readable ticket number shown in list. | Required. 1 to 64 chars. Unique within workspace. |
| title | String | Column “Judul” | Ticket title. | Required. 1 to 200 chars. |
| description | String | Optional column “Deskripsi” | Ticket description. Default hidden in view settings. | Optional. 0 to 2000 chars. |
| client\_name | String | Column “Klien” | Client display name. | Required. 1 to 120 chars. |
| client\_contact | String | Column “Klien” | Client contact string. | Optional. 0 to 120 chars. |
| channel | Enum | Column “Kanal” | Ticket source channel. | Required. Allowed: WA, IG, Email. |
| priority | Enum | Column “Prioritas” | Ticket priority. | Required. Allowed: Low, Medium, High, Urgent. |
| agent\_ids | Array of String | Column “Agen” | Assigned agents. | Optional. Max 20 per ticket. Each must be a valid agent id. |
| lifetime | Derived duration | Column “Durasi” | Time since created, stops at resolved. | Derived only. Must never be negative. |
| sla\_due\_at | DateTime ISO 8601 | Column “SLA” | Due time for SLA countdown. | Optional. If empty show “-”. |
| status | Enum | Column “Status” | Ticket status. | Required. Allowed: Unassigned, Ongoing, Resolved. |
| team\_inbox | String | Column “Tim Inbox” | Team inbox owner of ticket. | Required. Single value only. |
| tags | Array of String | Column “Tag” | Tag list. | Optional. Max 50\. Each tag 1 to 32 chars. Allowed chars: letters, numbers, underscore, dash. |
| last\_reply\_text | String | Column “Balasan terakhir” | Last reply snippet. | Optional. 0 to 240 chars shown. Store full separately. |
| last\_reply\_at | DateTime ISO 8601 | Column “Balasan terakhir” | Last reply time. | Optional. |
| created\_at | DateTime ISO 8601 | Optional column “Dibuat” | Ticket created time. | Required for all tickets. |
| closed\_at | DateTime ISO 8601 | Optional column “Ditutup” | Ticket resolved time. | Optional. Only set when status becomes resolved. |
| search\_scope | Enum | Search bar | Selected search scope. | Must be one of allowed scopes for the active tab. |
| search\_terms | String | Search bar | Raw search input. | Max 500 chars. Comma separated terms. Max 20 terms. Each term trimmed. |
| filter\_created\_range | Preset or String | Filters | Created date range filter. | Preset is one of: all, today, last7, last30, custom. Custom requires “YYYY-MM-DD to YYYY-MM-DD”. |
| filter\_custom\_fields | Mixed | Filters | Type based custom filters. | Text max 200 chars. Select must match option. Date range format required. Has file is boolean. |
| bulk\_reply\_file | .xlsx | Bulk reply | Upload file for bulk replies. | Required for submit. Max size 10 MB. Max 2000 rows. |
| bulk\_reply\_identifier | String | Bulk reply template | Ticket identifier per row. | Required per row. Must match selected identifier type. |
| bulk\_reply\_text | String | Bulk reply template | Reply content per row. | Required per row. 1 to 5000 chars. |
| bulk\_reply\_visibility | Boolean | Bulk reply UI | Customer reply vs internal note. | Controlled by UI toggle “Kirim ke pelanggan”. |

---

## **11 | Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | P95 list page initial render with data is less than 2 seconds for 25 rows. |
| Pagination | Default page size is 25\. Supported options are 25, 50, 100\. |
| Accessibility | All controls have keyboard navigation and accessible labels. |
| Localization | All static UI text is Bahasa Indonesia only. |
| Security | Enforce RBAC on edit actions. Hide actions when permission is missing. |
| Observability | Log failures for list fetch and edit actions with trace id. |

---

## **12 | Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Internal | Ticket type and custom field metadata | Wrong mapping breaks filters and columns | Contract tests between ticket type settings and list. |
| Internal | Assignment model supports multi agent | UI implies multi agent but backend is single | Confirm data model supports list of agents. If not, restrict to one agent. |
| Internal | SLA computation rules | SLA shown but rule differs per ticket type | Use a single due time field for MVP. Expand later. |
| UX | Many columns cause horizontal scroll | Poor usability without pinned columns | Deliver pinned columns in P1. |

---

## **13 | Success Metrics**

| KPI | Definition | Target |
| ----- | ----- | ----- |
| Find time | Median time to locate and open a target ticket | 30% faster |
| Need response backlog | Tickets flagged “need response” over SLA | 20% reduction |
| List reliability | List fetch success rate | 99% or higher |
| Bulk usage (P1) | Share of users using selection and bulk actions weekly | 25% or higher |

---

## **14 | Future Considerations**

| Idea | Benefit |
| ----- | ----- |
| Saved views per user | Faster repeat workflows. |
| Advanced sorting and multi sort | Better queue management. |
| Bulk update agent | Faster reassignment during shift changes. |
| Inline quick actions on hover | Fewer clicks for frequent edits. |

---

## **15 | Limitations**

| Area | Limitation |
| ----- | ----- |
| Sort | Not delivered until P2. |
| Sticky columns | Not delivered until P1. |
| Bulk reply | Not delivered until P1. |
| KPI strip | Not delivered until P1. |

---

## **16 | Appendix**

| Item | Content |
| ----- | ----- |
| Default Column Order | “ID Tiket”, “Judul”, “Klien”, “Kanal”, “Prioritas”, “Agen”, “Durasi”, “SLA”, “Status”, “Tim Inbox”, “Tag”, “Balasan terakhir”. |
| Row Menu Items | “Perbarui status”, “Tambah tag”, “Hapus tag”, “Tutup”. |
| Bulk Reply Template Columns | identifier, reply. |

References: [ChatGPT \- Ticket List Prototype (ticketing V2)](https://chatgpt.com/canvas/shared/695f3d8aeb24819194ea2c796ec15ac1)