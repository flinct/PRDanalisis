# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics Member Performance Presence and Last Active  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| :---- | :---- | :---- | :---- |
| v1.0 | 2026-01-23 | Yusril Ibnu Maulana | Initial PRD for adding Current presence and Last active to Analytics Member Performance table. |
| v1.1 | 2026-03-03 | Yusril Ibnu Maulana | Add Agent filter. Add presence based time metrics: Total Login Time, Agent Login, Agent Break, Agent Aux other. Clarify snapshot vs date range behavior. |
| v1.2 | 2026-03-05 | Yusril Ibnu Maulana | Add **CSAT Analytics page**: KPI overview, breakdown tabs (Channel, Team Inbox, Agent), CSAT responses table \+ search \+ export CSV, charts (trend \+ rating distribution), CSAT response rate, Good vs Bad breakdown in % and \#. Clarify attribution uses **assignee at event time** for “Last handled by”. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Add time availability context and presence based time metrics to Analytics Member Performance so supervisors can make staffing and coaching decisions faster. |
| Scope | Applies to the Analytics menu. Page: Member Performance. Adds columns, filters, and behaviors. Does not change existing definitions for existing performance metrics. |

| In Scope | Out of Scope |
| ----- | ----- |
| Show Current presence per member as real time snapshot. | Configure auto away rules or presence reason taxonomy from Analytics. |
| Show Last active per member as real time snapshot in relative format. | Historical presence timeline chart by date range. |
| Add metrics per member: Total Login Time, Agent Login count, Agent Break duration, Agent Aux other duration. | Export CSV or scheduled reports. |
| Add Agent filter to the page. | Member management actions from Analytics. |
| CSAT responses history table: Submitted time, Client, Channel, Entity, Last handled by, Rating, Comment. | Per reason breakdown table for all AUX reasons. |
| New Analytics page: **CSAT** with KPI cards, charts, breakdown tabs, responses table, export CSV. | Survey builder advanced, multi-question CSAT, sentiment analysis, text mining comment. |
| CSAT KPIs: **Avg CSAT**, **Good vs Bad** in % and \#, **Response rate CSAT**. | Scheduled reports, email digest, BI custom dashboard builder. |
| Breakdown by **Channel**, **Team Inbox**, **Agent** using tabs. | Changing survey trigger logic (tetap mengikuti PRD CSAT in-channel). |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| P-001 | Member Performance lacks real time context on who is available now. | Supervisors cannot act on insights because they do not know who is Online or Away right now. |
| P-002 | Presence utilization is not visible in the same view as performance. | Supervisors cannot distinguish slow performance caused by workload vs low availability. |
| P-003 | Offline status is not actionable without recency. | Supervisors cannot tell whether a member was recently active or inactive for a long time. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve staffing and escalation decisions | 70% of supervisors use Status and Aktif terakhir columns weekly within 30 days. |
| Improve visibility of agent availability and utilization | 80% of supervisors view Total Login Time and Break metrics weekly within 30 days. |
| Keep real time data reliable | Presence and last active updates within 2 seconds for 95% of updates within 30 days. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Supervisor, I want to filter Member Performance by date range, team, and agent so I can analyze performance for a specific scope. | 1\. Given I am on Analytics Member Performance, When I change "Rentang tanggal", Then all performance and time metrics refresh using the selected date range. 2\. Given I select "Tim", When the table loads, Then only members in the selected team scope are shown. 3\. Given I select one or more "Agen", When the table loads, Then only the selected agents are shown. 4\. Given the selected scope has no data, When the table renders, Then I see an empty state and filters remain usable. |
| US-002 | P0 | As a Supervisor, I want to see Current presence and Last active for each member so I can decide staffing actions immediately. | 1\. Given the table renders, When presence data exists, Then each row shows Status with labels "Online" or "Away" or "Offline". 2\. Given presence data is unavailable for a member, When the row renders, Then Status shows "Tidak diketahui". 3\. Given a member is currently Online, When the row renders, Then Aktif terakhir shows "Aktif sekarang". 4\. Given a member is Away or Offline, When last active exists, Then Aktif terakhir shows relative time such as "5 menit lalu". 5\. Given last active is unavailable, When the row renders, Then Aktif terakhir shows "-". |
| US-003 | P0 | As a Supervisor, I want to see Total Login Time, Agent Login, Agent Aux other so I can understand availability and utilization within the selected date range. | 1\. Given the table renders, When data exists, Then each member row shows "Total waktu login" and "Jumlah login" and "Durasi AUX A" and "Durasi AUX B". 2\. Given I change "Rentang tanggal", When the table refreshes, Then these values update using the new date range. 3\. Given there is no presence activity within the date range, When the table renders, Then the values show 0 and the page remains usable. |
| US-004 | P0 | As a Supervisor, I want real time updates for Status and Aktif terakhir so I can monitor changes without refreshing the page. | 1\. Given the page is open, When a member changes presence, Then Status updates within 2 seconds without page reload. 2\. Given the page is open, When a new activity is detected, Then Aktif terakhir updates within 2 seconds without page reload. 3\. Given real time updates fail, When the page is open, Then Status remains "Tidak diketahui" and Aktif terakhir remains "-" where applicable and the page still works. |
| US-005 | P0 | As a Supervisor, I want sorting for Status and Aktif terakhir so I can quickly scan availability. | 1\. Given the table is visible, When I sort by Status, Then rows sort by Online first then Away then Offline then Tidak diketahui. 2\. Given the table is visible, When I sort by Aktif terakhir, Then rows sort by most recent activity first and "-" appears last. 3\. Given real time updates happen while sorting is applied, When values change, Then the system updates cell values and keeps row order stable until I sort again. |
| US-006 | P0 | As an Admin, I want access control enforced so presence data is not exposed to unauthorized roles. | 1\. Given I am an Agent, When I try to access Analytics Member Performance, Then I see "Akses ditolak". 2\. Given I am a Supervisor, When I select a team outside my allowed scope, Then I see "Akses ditolak" and no data is shown. 3\. Given I am an Owner or Admin, When I access the page, Then I can view data for allowed teams per access rules. |
| US-007 | P0 | As an Owner/Admin/Supervisor, I want Member performance to include Avg CSAT per agent so that agent performance includes satisfaction outcome quality. | 1\. Given the Member performance page is opened, When data exists, Then the table includes Avg CSAT  per agent for the selected date range and team inbox. 2\. Given an agent has no CSAT or NPS responses, When the table renders, Then Avg CSAT shows “N/A”. |
| US-008 | P0 | As a Supervisor/Admin, I want to see duration per AUX status (all reasons) for each agent, so I can understand how time is spent across customizable AUX reasons within the selected date range. | 1\. Given the Member Performance table renders, When AUX activity exists in the selected date range, Then each agent row provides a way to view **all AUX reasons** and their **durations** for that agent, without fixed categories.  2\. Given an agent enters any AUX reason, When the system computes durations, Then the full time in that AUX reason is counted as **Away time**, without grouping or excluding any reason.  3\. Given AUX timeline events exist (enter AUX reason, change AUX reason, exit AUX), When durations are computed, Then each AUX reason duration equals the sum of all time segments where that reason was active within the selected date range.  4\. Given an agent is in AUX and the AUX reason changes while still Away, When the change happens at timestamp T, Then the previous AUX reason segment ends at T and the new AUX reason segment starts at T, and aggregated durations reflect the split correctly.  5\. Given a Supervisor/Admin edits an AUX reason for a past time window (retroactive correction), When the edit is saved, Then the system records an audit trail (editor, timestamp, before and after reason, affected time window) and recomputes AUX reason durations for that agent for any impacted date ranges, and the UI shows updated values on the next refresh.  6\. Given an AUX segment overlaps the selected date range boundaries, When durations are computed, Then the system clips the segment and counts only the portion within the selected range.  7\. Given an agent has zero AUX activity within the selected date range, When the row renders, Then AUX durations show 0 or an empty display state without breaking the page.  8\. Given Total Login Time is available for the same range, When the system computes totals, Then the sum of all AUX reason durations must not exceed Total Login Time, and if AUX data is incomplete or unavailable, Then show safe fallback values (0) with a “Data tidak tersedia” tooltip and keep the page usable. |
| US-009 | P0 | As an Owner/Admin/Supervisor, I want CSAT overview KPIs and charts so that I can quickly understand trends and distribution. | 1\. Given the CSAT page is opened, When data is available for the selected date range and team inbox, Then the page shows KPI cards, a CSAT trend chart, and a rating distribution chart.  2\. Given no responses exist for the selected filters, When the page loads, Then an empty state is shown for KPIs and charts. |
| US-010 | P0 | As an Owner/Admin/Supervisor, I want CSAT breakdown by channel, team inbox, and agent using tabs so that I can compare performance quickly. | 1\. Given the CSAT page is opened, When the user changes the breakdown tab, Then the breakdown table updates to the selected tab dataset.  2\. Given Supervisor role with restricted team inbox, When the user changes the team inbox filter, Then only allowed team inbox options are available. |
| US-011 | P0 | As an Owner/Admin/Supervisor, I want an CSAT responses table so that I can review rating and comment at row level. | 1\. Given the CSAT page is opened, When responses exist, Then a table shows Submitted time, Client, Channel, Entity, Last handled by, Rating, and Comment.  2\. Given the user searches in the responses table, When a keyword matches Client or Entity, Then only matching rows are shown. 3\. Given export is clicked, When export completes, Then a CSV file contains the same columns and applied filters. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Page Access and Scope | **FR-001:** The system MUST restrict Analytics Member Performance access to Owner, Admin, and Supervisor roles. **FR-002:** The system MUST deny access for the Agent role and show “Access denied”. **FR-003:** The system MUST scope Supervisor visibility to teams within their allowed access scope. **FR-004:** The system MUST not reveal any member presence data outside the selected team scope. |
| Filters and Defaults | **FR-005:** The system MUST provide filters for Date range, Team, and Agent. **FR-006:** The system MUST default Date range to the last 30 days. **FR-007:** The system MUST default Team to All. **FR-008:** The system MUST default Agent to All. **FR-009:** The system MUST support multi-select for Agent. **FR-010:** The system MUST preserve selected filters during sorting and real-time updates. |
| Column Set | **FR-011:** The system MUST preserve all existing Member Performance columns and definitions. **FR-012:** The system MUST add columns Presence Status and Last Active. **FR-013:** The system MUST add columns Total Login Time, Login Count, Break Duration, and Aux Other Duration. **FR-014:** The system MUST display these new columns for every member row, even when values are 0 or unknown. |
| Attribution Rules | **FR-015:** The system MUST attribute performance metrics to the selected agent using assignment state at event time when relevant. **FR-016:** The system MUST attribute Conversations Closed to the agent who is the assignee at the close event time. **FR-017:** The system MUST attribute presence time metrics to the member themselves (not to ticket or conversation assignment). |
| Current Presence Display | **FR-018:** The system MUST map Active presence state to the UI label “Online”. **FR-019:** The system MUST map Away presence state to the UI label “Away”. **FR-020:** The system MUST map Offline presence state to the UI label “Offline”. **FR-021:** The system MUST map missing presence data to the UI label “Unknown”. **FR-022:** The system MUST treat Online and Away as distinct labels and MUST NOT merge them. |
| Last Active Display | **FR-023:** The system MUST show “Active now” when Status is Online. **FR-024:** The system MUST show a relative time string when Status is Away or Offline and last active exists. **FR-025:** The system MUST show “-” when last active is unavailable. **FR-026:** The system MUST use the following thresholds: 1\) Under 60 seconds: “Just now”. 2\) 1 to 59 minutes: “{x} minutes ago”. 3\) 1 to 23 hours: “{x} hours ago”. 4\) 1 to 30 days: “{x} days ago”. 5\) Over 30 days: “More than 30 days ago”. |
| Presence Time Metrics Definitions | **FR-027:** The system MUST compute Total Login Time within the selected date range as the total time the member is logged in during the period. **FR-028:** The system MUST compute Login Count within the selected date range as the number of login events during the period. **FR-030:** The system MUST compute Aux Duration within the selected date range as total time in Away, including Prayer, Briefing, and Restroom. **FR-032:** The system MUST ensure Aux durations are never greater than Total Login Time. |
| Real-Time Snapshot Behavior | **FR-033:** The system MUST treat Presence Status and Last Active as real-time snapshot values and not tied to the selected date range. **FR-034:** The system MUST display a helper note explaining this difference. **FR-035:** The system MUST refresh Presence Status and Last Active snapshots when Team changes. |
| Member Performance Patch | **FR-036:** The system MUST add Avg CSAT and Avg NPS columns in the Member Performance table. **FR-037:** The system MUST attribute NPS and CSAT to Last handled by for agent aggregation in v1. **FR-038:** The system MUST show “N/A” for Avg CSAT or Avg NPS when the agent has zero responses in the selected range. |
| Real-Time Updates | **FR-039:** The system MUST update Presence Status within 2 seconds of a presence change while the page is open. **FR-040:** The system MUST update Last Active within 2 seconds when new activity is detected while the page is open. **FR-041:** The system MUST not require a full page reload to reflect snapshot updates. **FR-042:** The system MUST fail open by showing “Unknown” and “-” when real-time updates are unavailable. |
| Sorting and Stability | **FR-043:** The system MUST support sorting by Presence Status with order Online, Away, Offline, Unknown. **FR-044:** The system MUST support sorting by Last Active with most recent activity first and “-” last. **FR-045:** The system MUST keep row order stable during real-time updates until the user sorts again. |
| States | **FR-046:** The system MUST show a loading state for the table while data is fetched. **FR-047:** The system MUST show an empty state when no members match the selected scope. **FR-048:** The system MUST keep filters visible and editable in loading, empty, and error states. |

---

## **6.1 Definitions**

| Term | Definition |
| ----- | ----- |
| CSAT score | 1–5 scale. |
| Good CSAT | Scores 3, 4, 5\. |
| Bad CSAT | Scores 1, 2\. |
| Avg CSAT | Average CSAT score from responses within the selected filter scope. |
| CSAT response rate | `#responses / #CSAT requests sent` within the selected filter scope. |
| Last handled by | The agent who was the **assignee at event time** when the conversation was solved/closed (when CSAT was triggered). |
| Entity | Primary: Conversation ID. Secondary (optional): Ticket ID if a ticket exists as a result of low CSAT. |

---

## **6.2 Page Access and Scope (CSAT Analytics)**

| ID | Requirement |
| ----- | ----- |
| FR-CSAT-001 | The system MUST restrict CSAT Analytics access to Owner, Admin, and Supervisor roles. |
| FR-CSAT-002 | The system MUST enforce Supervisor scoping to allowed Team Inbox options only. |

---

## **6.3 Filters and Tabs (CSAT Analytics)**

| ID | Requirement |
| ----- | ----- |
| FR-CSAT-003 | The system MUST provide filters: Date range and Team Inbox. |
| FR-CSAT-004 | The system MUST provide optional filters: Channel and Agent. |
| FR-CSAT-005 | The system MUST provide breakdown tabs: Channel, Team Inbox, and Agent. |
| FR-CSAT-006 | The system MUST apply selected filters consistently to KPI cards, charts, the breakdown table, and the responses table. |

---

## **6.4 KPI Cards (Overview) (CSAT Analytics)**

| ID | Requirement |
| ----- | ----- |
| FR-CSAT-007 | The system MUST show an Avg CSAT KPI card for the selected filters. |
| FR-CSAT-008 | The system MUST show Good CSAT in both percentage and number. |
| FR-CSAT-009 | The system MUST show Bad CSAT in both percentage and number. |
| FR-CSAT-010 | The system MUST show CSAT response rate in both percentage and number (responses vs requests sent). |

---

## **6.5 Charts (CSAT Analytics)**

| ID | Requirement |
| ----- | ----- |
| FR-CSAT-011 | The system MUST show a CSAT Trend chart for the selected date range (time series). |
| FR-CSAT-012 | The system MUST show a CSAT Rating Distribution chart (count per rating 1–5). |
| FR-CSAT-013 | The trend chart MUST support tooltips showing date and value. |
| FR-CSAT-014 | The distribution chart MUST support tooltips showing rating and count. |

---

## **6.7 CSAT Responses History Table (CSAT Analytics)**

| ID | Requirement |
| ----- | ----- |
| FR-CSAT-018 | The system MUST show response table columns: Submitted time, Client, Channel, Entity (Conversation ID, Ticket ID) Assignee,, Last handled by, Rating, Comment, Channel, Source, Timestamp |
| FR-CSAT-019 | The system MUST support search by keyword matching Client or Entity. |
| FR-CSAT-020 | The system MUST support pagination. |
| FR-CSAT-021 | The system MUST allow CSV export with the same columns and applied filters. |

---

## **6.8 Attribution Rule (CSAT Analytics)**

| ID | Requirement |
| ----- | ----- |
| FR-CSAT-022 | The system MUST attribute Last handled by using **assignee at event time** when the conversation was solved/closed and CSAT was triggered. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission denied | Block access to page. | Show "Akses ditolak". Provide a back action. |
| EH-002 | Scope denied | Block data load for the selected team. | Show "Akses ditolak". Clear table content. |
| EH-003 | Presence unavailable | Continue showing performance and time metrics. | Show "Tidak diketahui" in Status. Show "-" in Aktif terakhir. |
| EH-004 | Presence time metrics unavailable | Continue showing performance metrics. | Show 0 for presence time metrics and show tooltip "Data tidak tersedia". |
| EH-005 | Partial member mapping | Continue showing rows even if some snapshot fields are missing. | Apply fallback per row only. |
| EH-006 | Data load failure | Allow retry without leaving the page. | Show "Gagal memuat data. Silakan coba lagi." with action "Coba lagi". |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Member has performance data in date range but is not in the team today | Keep the row in table for the period. Snapshot fields are unknown. | Show "Tidak diketahui" and "-". |
| EC-002 | Member never had any activity | Snapshot may be Offline or Unknown. Last active missing. | Show "Offline" or "Tidak diketahui". Show "-". |
| EC-003 | Time skew produces future last active timestamp | Clamp to most recent valid boundary. | Show "Baru saja". |
| EC-004 | Large team with more than 500 members | Page remains responsive with controlled rendering. | Show table skeleton. Allow scrolling. |
| EC-005 | Rapid presence flapping | UI remains readable. | Update cell values. Do not reorder rows automatically. |
| EC-006 | Date range includes partial current day | Performance and time metrics show partial values. | Show tooltip "Data hari ini dapat berubah". |
| EC-007 | Agent filter selects members outside selected team | Filter result is empty. | Show empty state. Keep filters editable. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Page Entry | Analytics menu item label is "Performa Anggota". Page title is "Performa Anggota". | 1\. User clicks "Performa Anggota". 2\. Page loads with default filters. | US-001 |
| Filter Bar | Filters in one row: "Rentang tanggal", "Tim", "Agen". Default values show "Semua" where applicable. | 1\. User changes filters. 2\. Table refreshes automatically. | US-001 |
| Helper Note | Note near table header clarifies snapshot behavior for Status and Aktif terakhir. | 1\. User sees note near table header. 2\. User understands it is real time snapshot. | US-002 |
| Member Performance Table | Table shows existing columns plus new columns for Status, Aktif terakhir, Total waktu login, Jumlah login, Durasi break, Durasi AUX lainnya. | 1\. Table renders rows. 2\. User scans values per member. | US-002 US-003 |
| Tooltips | Info icon on column headers shows definitions and examples. | 1\. User hovers info icon. 2\. Tooltip shows short definition in Bahasa Indonesia. | US-002 US-003 |
| Sorting Controls | Sorting enabled on Status and Aktif terakhir columns. | 1\. User clicks column header to sort. 2\. Table order updates. 3\. Real time updates do not reorder rows until user sorts again. | US-005 |
| Loading State | Skeleton rows while table loads. | 1\. Page loads. 2\. Skeleton shows. 3\. Rows appear when ready. | US-001 |
| Empty State | Empty state when no members match filters. | 1\. User applies filters. 2\. No results. 3\. Empty state shows and filters remain available. | US-001 |
| Error State | Inline error state with retry action. | 1\. Data load fails. 2\. Error message shows. 3\. User clicks "Coba lagi". | US-001 |

## **10\. Field & Validation**

| Field | Type | Validation | Required |
| ----- | ----- | ----- | ----- |
| Tim | Single select dropdown | Must be within user scope. | No |
| Agen | Multi select dropdown | Must be within selected team scope when team is selected. Max 50 selected. | No |
| Rentang tanggal | Date range picker | Start date must be less than or equal to end date. Maximum range 365 days. | Yes |
| Search member | Text input | Max 100 characters. Trims leading and trailing spaces. | No |
| Sorting Status | Sort control | Allowed order Online, Away, Offline, Tidak diketahui. | No |
| Sorting Aktif terakhir | Sort control | Missing values sort last. | No |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Initial table render completes within 2 seconds for up to 200 rows under normal conditions. |
| Scalability | Page remains usable for 500 plus members with controlled rendering. |
| Real time latency | Status and Aktif terakhir updates appear within 2 seconds for 95% of updates. |
| Data freshness | Performance and presence time metrics update at least every 5 minutes. |
| Timezone | All timestamps and relative times use workspace timezone for new data. |
| Security | Enforce role based access and team scoping server side. |
| Privacy | Only member data is shown. Do not show customer identifiers on this page. |
| Accessibility | Keyboard navigation for filters and sortable headers. Visible focus state. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Presence states and reasons are inconsistent across channels | Engineering | Break and AUX grouping becomes misleading. | Standardize reason category mapping for analytics display. |
| Missing assignee at event time data for close events | Engineering | "Percakapan yang ditutup" attribution becomes inconsistent. | Ensure assignment change audit trail exists for relevant events. |
| Presence snapshot reliability issues | Engineering | Users lose trust in Status and Aktif terakhir. | Fail open with Unknown and dash. Track availability rate. |
| Large teams cause slow rendering | Engineering | Page becomes hard to use. | Use controlled rendering and skeleton loading. |
| Permission model drift | Product, Engineering | Data leakage risk. | Automated permission tests per role and team scope. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Weekly active viewers | 70% of supervisors weekly | 30 days | Product analytics |
| Usage of new columns | 70% of supervisors scroll or sort Status or Aktif terakhir | 30 days | UI events |
| Presence snapshot availability | 95% sessions show presence for at least 80% rows | 30 days | Monitoring |
| Update latency | 95% updates within 2 seconds | 30 days | Monitoring |
| Coaching actions | Increase in supervisors using Agent filter | 30 days | UI events |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Show Away reason label on hover | Improves staffing decisions without cluttering table. |
| Drill down member detail view | Allows investigation of time breakdown and performance history per member. |
| Export table | Supports management reporting. |
| Add stacked bar utilization chart | Quick view of login time vs break vs AUX other. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Status and Aktif terakhir are real time snapshot values | Users cannot infer historical availability for the selected date range. |
| Break and AUX other rely on correct reason tagging | Wrong tagging reduces metric trust. |
| No action controls on this page | Users must change staffing and membership elsewhere. |

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| Status | Current presence state of the member at the time of viewing. |
| Aktif terakhir | Relative time since last detected activity. |
| Total waktu login | Total time the member is logged in within selected date range. |
| Jumlah login | Count of login events within selected date range. |
| Durasi break | Total time in Away with reason category Break within selected date range. |
| Durasi AUX lainnya | Total time in Away with reasons excluding Break, including Sholat, Briefing, and Toilet. |
| Tidak diketahui | Fallback state when data is unavailable. |

