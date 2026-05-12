# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics Reporting for Post Survey  
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: Resky Fernanda Witanto

Prototype: [https://chatgpt.com/canvas/shared/69a903b6371c819190b8ac6f449486f6](https://chatgpt.com/canvas/shared/69a903b6371c819190b8ac6f449486f6)   
---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-15 | Yusril Ibnu | Initial PRD for Analytics pages: NPS, Post Survey, and Member Performance patch for satisfaction metrics. |

---

## **2\. Overview**

| Field | Description |
| ----- | ----- |
| Purpose | Provide simple, consistent analytics pages for Post Survey results with breakdown tabs and response tables.  |
| Scope | See scope table. |

### **Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Analytics sidebar submenus: Post survey, Member performance. | Advanced BI builder. |
| Post survey page: survey selector, KPI overview, question insights, all responses table with dynamic columns. | Conditions like tags, priority, complex workflow rules. |
| Export CSV for Post survey tables. | Per-agent drilldown page. |
| Role access: Owner, Admin, Supervisor only. | Agent access to analytics. |
|  | Real-time streaming updates. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Managers cannot review service loyalty and post-resolution sentiment in one consistent reporting experience. | Slow diagnosis of service issues and missed retention actions. |
| PS-002 | No standardized breakdown across channel, team inbox, and agent. | Hard to prioritize training and staffing improvements. |
| PS-003 | Member performance lacks satisfaction signals per agent. | Performance review misses outcome quality. |

---

## **4\. Objectives and Key Results**

| ID | Objective | Key Result |
| ----- | ----- | ----- |
| OKR-001 | Make Post Survey reporting usable for non-technical users. | 80% of supervisors can find responses within 30 seconds in usability test. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Owner/Admin/Supervisor, I want to access Post survey analytics so that I can monitor satisfaction outcomes. | 1\. Given the user role is Owner/Admin/Supervisor, When the user opens Analytics, Then the sidebar shows menus “Post survey”, 2\. Given the user role is Agent, When the user attempts to open these pages, Then access is blocked and an error state is shown. |
| US-005 | P0 | As an Owner/Admin/Supervisor, I want to select a Post survey by name so that I can view metrics for that specific survey. | 1\. Given the Post survey page is opened, When the user selects a survey name, Then KPI overview, question insights, and responses table update to that survey. 2\. Given the survey has no responses in the selected date range, When the page loads, Then an empty state is shown for that survey. |
| US-006 | P0 | As an Owner/Admin/Supervisor, I want Post survey question insights so that I can understand distribution without reading all answers. | 1\. Given a rating question exists, When the insights render, Then it shows average score and a horizontal distribution chart. 2\. Given a yes/no question exists, When the insights render, Then it shows a horizontal distribution chart with the same UI style as rating. 3\. Given a free-text question exists, When the insights render, Then it shows a paginated list of answers. |
| US-007 | P0 | As an Owner/Admin/Supervisor, I want Post survey all responses with all question columns so that I can export and review full answers. | 1\. Given a survey is selected, When the responses table renders, Then it includes one column per question label, up to 10 questions. 2\. Given a response has a long free-text answer, When shown in the table, Then the cell truncates and full value is available via hover tooltip or row expansion behavior. 3\. Given export is clicked, When export completes, Then CSV includes all columns visible in the table. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Navigation and Access Control | FR-001: System MUST show analytics submenus  “Post survey” for Owner, Admin, and Supervisor roles only. FR-002: System MUST deny access for Agent role and show a permission error UI. FR-003: System MUST restrict Supervisor data scope to assigned team inbox only. |
| Global Filters | FR-004: System MUST provide a Team inbox filter and a Date range filter on each page. FR-005: System MUST apply filters consistently across KPIs, charts, breakdown tables, and responses tables. FR-006: System MUST use tenant timezone for date bucketing and display. If tenant timezone is missing, default to Asia/Jakarta. |
| Post Survey Selector | FR-022: System MUST list post surveys by “Survey name” configured in the automation module. FR-023: System MUST map Survey name to an internal immutable survey identifier for reporting consistency, without exposing the identifier in UI. |
| Post Survey KPIs | FR-024: System MUST compute Completions as count of accepted submissions for the selected survey. FR-025: System MUST compute Response rate when invite tracking exists. If invites are missing, Response rate MUST display “N/A”. FR-026: System MUST compute Primary metric only if the survey defines a primary scoring question. If not defined, Primary metric MUST display “N/A”. |
| Post Survey Question Insights | FR-027: System MUST render rating questions as average plus horizontal distribution chart. FR-028: System MUST render yes/no questions using the same horizontal distribution chart component style as rating. FR-029: System MUST render free-text questions as a paginated list with default page size 10 items. |
| Post Survey All Responses Table | FR-030: System MUST render one table column per question label for the selected survey, up to 10 questions. FR-031: System MUST include base columns: Submitted at, Client, Channel, Entity, Last handled by. FR-032: System MUST preserve historical question labels per response using a response snapshot. If a question label changes, the table MUST display the label from the current survey version and the exported CSV MUST include the current label as header. FR-033: System MUST truncate long answers in table cells and provide a way to view full text via tooltip or row expansion. FR-034: System MUST support pagination with a default page size of 25 rows. FR-035: System MUST support CSV export including all visible question columns. |
| Data Completeness | FR-039: System MUST store and expose the following metadata for each response row: client name, client phone or email when available, agents involved list, last handled by, entity id, entity created at, entity resolved at. FR-040: System MUST store channel name used for survey delivery or submission for breakdown by channel and for history consistency. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission denied | Block page load and return 403 style error state. | "Anda tidak memiliki akses ke halaman ini." |
| EH-002 | Data fetch failed | Show error state with retry action. Show last updated timestamp if cached data exists. | "Gagal memuat data. Silakan coba lagi." |
| EH-003 | Partial data missing | Render available components. Show “N/A” for missing metrics or fields. | "Sebagian data tidak tersedia." |
| EH-004 | Export failed | Do not block browsing. Show toast with retry. | "Gagal mengekspor data. Silakan coba lagi." |
| EH-005 | Invalid survey selection | Reset selection to default survey if available. If none, show empty state. | "Survei tidak ditemukan." |

---

## **8\. Edge Cases**

| ID | Edge Case | Expected Behavior |
| :---- | :---- | :---- |
| EC-001 | Supervisor has access to only one team inbox | Team inbox filter shows only one option and stays selected. |
| EC-002 | Date range has no data | Show empty states for KPIs, charts, and tables. Export yields empty CSV with headers only. |
| EC-003 | Response has no comment | Show empty cell. Export includes empty string. |
| EC-004 | Response has missing last handled agent | Show “Tidak diketahui” in UI. Exclude from “Agent” breakdown aggregation but keep in responses table. |
| EC-005 | Survey name is renamed | UI displays latest name. Reporting links to immutable survey id so historical data remains under the same survey. |
| EC-006 | Survey questions changed over time | Responses table shows up to 10 current questions as columns. Answers for removed questions are available only via row expansion or tooltip if implemented. |
| EC-007 | More than 10 post survey questions exist | Only first 10 questions are shown in table and export. Remaining questions are not displayed in v1. |
| EC-008 | Extremely long free-text answers | Table cell truncates. Full text accessible via tooltip or expansion. CSV contains full text. |
| EC-009 | Invite tracking missing for older data | Response rate displays “N/A” and no division is attempted. |
| EC-010 | Large response volume | Pagination remains functional. Trend chart auto-aggregates by week when date range exceeds 90 days. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Sidebar menus | Add menus:Post survey | User opens Analytics. User selects a submenu. | US-001 |
| Page layout | No “Analytics” title in main content. Use large content card layout aligned to reference screen. | User navigates. Page shows content immediately with filters on top right. | US-001 |
| Top-right filters | Two controls: Team inbox and Date range. | User changes filters. All widgets refresh. | US-002, US-003, US-005 |
| Post survey selector | Dropdown by Survey name. | User selects survey. Overview and table update. | US-005 |
| Post survey overview | KPI cards plus question insights cards. | User reviews insights. | US-006 |
| Yes/No chart style | Yes/No uses same horizontal bar chart style as rating. | User compares question cards consistently. | US-006 |
| Free-text pagination | Paginated list for free text insights and table pagination for responses. | User navigates pages. | US-006, US-007 |
| Post survey all responses | Table shows base columns plus one column per question label. | User scrolls horizontally if needed. User exports. | US-007 |
| Empty states | Consistent empty state for charts and tables when no data. | User sees guidance. | US-002, US-005 |
| Loading states | Skeleton for KPI cards and tables. Chart shows placeholder skeleton. | User waits briefly without layout shift. | US-002, US-005 |
| Error states | Retry button and show cached timestamp if available. | User retries loading. | US-001, US-002, US-005 |

### **UI Copy (Bahasa Indonesia)**

| Context | Copy |
| ----- | ----- |
| Menu Post survey | "Post survey" |
| Breakdown tab Channel | "Channel" |
| Breakdown tab Team inbox | "Team inbox" |
| Breakdown tab Agent | "Agent" |
| Responses section title | "Respon" |
| Search placeholder | "Cari klien atau ID" |
| Export button | "Ekspor CSV" |
| Empty state title | "Belum ada data" |
| Empty state body | "Coba ubah rentang tanggal atau team inbox." |
| Error state | "Gagal memuat data. Silakan coba lagi." |
| No access | "Anda tidak memiliki akses ke halaman ini." |
| Post survey selector label | "Survei" |
| Post survey all responses | "Semua respon" |

---

## **10\. Field & Validation**

| Field | Type | Validation Rules | Required |
| ----- | ----- | ----- | ----- |
| role | Enum | Owner, Admin, Supervisor, Agent | Yes |
| team\_inbox\_id | String | Must be within role access scope | Yes |
| date\_from | Date | Must be valid date | Yes |
| date\_to | Date | Must be valid date and not before date\_from | Yes |
| entity\_id | String | Ticket ID or Conversation ID | Yes |
| entity\_type | Enum | Ticket, Conversation | Yes |
| channel | Enum | Must match supported channels in tenant | Yes |
| client\_name | String | Max 120 chars | Yes |
| client\_phone | String | E.164 format when present | Conditional |
| client\_email | String | Valid email format when present | Conditional |
| agents\_involved | Array | Array of agent identifiers, may be empty | Yes |
| last\_handled\_by | String | Agent identifier, may be null | Conditional |
| entity\_created\_at | Datetime | ISO datetime | Yes |
| entity\_resolved\_at | Datetime | ISO datetime | Yes |
| post\_survey\_id | String | Immutable internal id | If post survey response |
| post\_survey\_name | String | Max 120 chars | If post survey response |
| answers | Object | Up to 10 questions per response snapshot | If post survey response |
| answer\_text | String | Max 5000 chars | If free text question |
| invite\_sent\_count | Integer | Non-negative | No |
| response\_rate | Float | 0.0 to 1.0 or N/A | No |

---

## **11\. Non-Functional Requirements**

| Area | Requirement |
| ----- | ----- |
| Performance | Page initial load under 2 seconds for 10,000 responses in selected range with pagination. |
| Availability | 99.9% monthly for analytics read endpoints. |
| Security | Tenant isolation for all analytics queries and exports. |
| Privacy | Export and table must not expose fields not allowed by role scope. |
| Observability | Log export events with user id, time, filters, and row count. |
| Accessibility | Keyboard navigable filters and tabs. Visible focus indicator on interactive elements. |

---

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Invite tracking availability | Product, Engineering | Response rate can be N/A without it | Display N/A clearly and prioritize invite tracking in upstream modules. |
| Survey name rename | Product | Confusing historical grouping if only name is used | Use immutable internal id for grouping while showing name in UI. |
| Large dynamic columns for post survey | Engineering, Design | Table becomes hard to scan | Cap questions to 10 and allow horizontal scroll. |
| Missing metadata from upstream links | Engineering | Breakdown accuracy loss | Enforce metadata snapshot on submission and show “Tidak diketahui” where missing. |
| Supervisor scope enforcement | Engineering | Data leakage risk | Validate scope at query layer, not only UI. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Post survey page weekly active usage | 60% of supervisors | 30 days | Analytics page view logs |
| Export usage success rate | 95% | 30 days | Export job logs |
| Time to find an post survey response row | Under 30 seconds median | Usability test | Session recording |

---

## **14\. Future Considerations**

| Topic | Reason |
| ----- | ----- |
| Segment filters for promoters, passives, detractors | Faster triage without extra pages. |
| Drilldown drawer for response detail | Better readability for long answers. |
| Channel filter | Helpful for focused investigations. |
| Saved views | Reduce repeated filtering for supervisors. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Post survey question cap 10 | Surveys with more questions will not be fully visible in table and export in v1. |
| No per-agent drilldown page | Users rely on table search and sorting only. |
| Response rate depends on invite tracking | Older datasets may show N/A for response rate. |

---

## **16\. Appendix**

| Item | Details |
| :---: | :---: |

 