# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics \- Responsiveness Page  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-03-03 | Yusril | Initial PRD for Responsiveness analytics page. |
| v1.1 | 2026-03-05 | Yusril | Add Time To Close SLA widgets. Add Closed Rate widgets. Update scope, user stories, functional requirements, edge cases, UI layout. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a single analytics page to monitor responsiveness and SLA compliance across channels, teams, and agents. |
| Scope | Covers filtering, tab behavior, KPI summaries, SLA compliance widgets, CSAT breakdown, and time-series charts. |

| In Scope | Out of Scope |
| ----- | ----- |
| Filters: Date range, Team, Agent, Channel. | Export CSV, Excel, PDF. |
| Tabs: Semua, Percakapan, Tiket. | Custom dashboards and saved views. |
| KPIs: average response time, average first response time, average time to close. | Drill down list views from charts and widgets. |
| SLA compliance widgets: FRT SLA and ART SLA in number and percentage. | SLA trend charts by time for FRT, ART, Time To Close, Closed Rate. |
| SLA compliance widgets: Time To Close SLA and Closed Rate in number and percentage. | SLA configuration management from this page. |
| CSAT: Baik and Buruk in number and percentage. | NPS analytics and post survey analytics. |
| Comparison series: current range vs previous 29 days for charts. | Saved filters and scheduled reports. |

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Supervisors and managers lack a unified view of response speed and SLA compliance across teams, agents, and channels. | Slow detection of operational issues and higher SLA breach risk. |
| Current reporting does not clearly separate first response performance from ongoing response performance. | Misleading improvement efforts and inefficient staffing decisions. |
| Completion quality is not visible under the same scope as response speed. | Teams miss closure performance issues and cannot prioritize resolution bottlenecks. |
| CSAT outcomes are not visible alongside responsiveness signals. | Teams miss correlation between speed and customer satisfaction. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve visibility of responsiveness performance. | 80% of active supervisors view the page weekly within 30 days of release. |
| Make SLA compliance measurable and comparable. | FRT SLA, ART SLA, Time To Close SLA, and Closed Rate widgets show consistent values for any filter combination. |
| Connect operational speed with satisfaction. | CSAT Baik and CSAT Buruk visible under the same filters and time range. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Supervisor, I want to filter Responsiveness by date range, team, agent, and channel so that I can analyze performance for a specific scope. | 1\. Given I am on the Responsiveness page, When I change "Rentang tanggal", Then all widgets and charts refresh and reflect the selected dates. 2\. Given I select a "Tim", When I apply the filter, Then all widgets and charts only include data attributed to that team at event time. 3\. Given I select one or more "Agen", When I apply the filter, Then agent attributed metrics only include the selected agents. 4\. Given I select a "Channel", When I apply the filter, Then only events from that channel are included. 5\. Given there is no data for the selected filters, When the page loads, Then each widget shows an empty state with value 0 and the charts show an empty state. |
| US-002 | P0 | As a Manager, I want to switch tabs between All, Conversations, and Ticket so that I can compare responsiveness by work type. | 1\. Given I am on the Responsiveness page, When I click tab "Semua", Then the page shows combined results without double counting cases that have tickets. 2\. Given I am on the Responsiveness page, When I click tab "Percakapan", Then the page includes only conversation cases and excludes ticket cases. 3\. Given I am on the Responsiveness page, When I click tab "Tiket", Then the page includes only ticket cases and excludes conversation only cases. 4\. Given I switch tabs, When the data refreshes, Then selected filters remain unchanged and are re-applied to the new tab scope. |
| US-003 | P0 | As a Supervisor, I want to see average responsiveness KPIs so that I can quickly assess overall speed. | 1\. Given the page is loaded, When data is available, Then I see "Rata-rata waktu balasan", "Rata-rata waktu respons pertama", and "Rata-rata waktu sampai selesai" as time values. 2\. Given the KPIs are shown, When I hover the KPI tooltip, Then I see a short definition of each KPI in Bahasa Indonesia. 3\. Given the date range is changed, When the KPIs refresh, Then the KPI values match the new date range and tab scope. |
| US-004 | P0 | As a Supervisor, I want to see FRT SLA compliance in number and percentage so that I can detect first response issues. | 1\. Given the page is loaded, When data is available, Then I see "FRT dalam SLA" and "FRT melewati SLA" with number and percentage. 2\. Given I apply Team and Agent filters, When the widgets refresh, Then attribution uses assignee at event time for the first response event. 3\. Given there are no eligible first response cases, When the widgets render, Then both widgets show 0 and the percentage shows 0%. |
| US-005 | P0 | As a Supervisor, I want to see ART SLA compliance in number and percentage so that I can detect ongoing response issues. | 1\. Given the page is loaded, When data is available, Then I see "ART dalam SLA" and "ART melewati SLA" with number and percentage. 2\. Given ART is defined per response event, When multiple agent replies occur in the period, Then each eligible reply event is evaluated against ART SLA and counted once. 3\. Given I filter by a specific agent, When the widgets refresh, Then only reply events sent by that agent are included. |
| US-006 | P0 | As a Manager, I want to see CSAT Baik and CSAT Buruk in number and percentage so that I can monitor satisfaction under the same scope. | 1\. Given CSAT is enabled for the tenant, When CSAT responses exist in the date range, Then I see "CSAT Baik" and "CSAT Buruk" with number and percentage. 2\. Given I filter by Team and Agent, When the widgets refresh, Then CSAT attribution follows assignee at event time when the case is solved or closed. 3\. Given CSAT is not enabled or no CSAT responses exist, When the widgets render, Then the widgets show an empty state and value 0\. |
| US-007 | P1 | As a Supervisor, I want to compare responsiveness trends to the previous period so that I can validate improvements. | 1\. Given the page is loaded, When charts are shown, Then each chart shows two series labeled "Periode ini" and "29 hari sebelumnya". 2\. Given I change the date range, When charts refresh, Then the comparison series updates automatically using the previous 29 days relative to the selected range end date. |
| US-008 | P0 | As a Supervisor, I want to see Time To Close SLA compliance in number and percentage so that I can detect closure performance issues. | 1\. Given I am on the Responsiveness page, When data is available, Then I see "Time To Close dalam SLA" and "Time To Close melewati SLA" with number and percentage. 2\. Given a case is not closed in the selected period, When Time To Close SLA is calculated, Then the case is excluded from the denominator. 3\. Given I change Date, Team, Agent, or Channel filters, When the widgets refresh, Then values update consistently with the selected scope and tab. |
| US-009 | P0 | As a Supervisor, I want to see Closed Rate in number and percentage so that I can understand completion quality at a glance. | 1\. Given I am on the Responsiveness page, When cases are closed in the selected period, Then I see "Closed  Rate dalam SLA" and "Closed Rate melewati SLA" with number and percentage. 2\. Given there are no closed cases in the selected period, When the widgets render, Then both widgets show 0 and the percentage shows 0%. 3\. Given I change Date, Team, Agent, or Channel filters, When the widgets refresh, Then values update consistently with the selected scope and tab. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access and Roles | 1\. FR-001: System MUST allow access to the Responsiveness page for Admin and Supervisor roles. 2\. FR-002: System MUST allow read-only access for Manager role if the tenant enables analytics for managers. 3\. FR-003: System MUST deny access for unauthorized roles and show "Akses ditolak". |
| Global Filters | 1\. FR-004: System MUST provide filters for "Rentang tanggal", "Tim", "Agen", and "Channel". 2\. FR-005: System MUST keep filters consistent across all tabs on the page. 3\. FR-006: System MUST support single select and multi select for "Agen". 4\. FR-007: System MUST apply filters to all KPIs, widgets, and charts in the active tab scope. |
| Tab Scope and De-duplication | 1\. FR-008: System MUST provide tabs labeled "Semua", "Percakapan", and "Tiket". 2\. FR-009: System MUST define "Semua" as a combined view without double counting cases that have an associated ticket. 3\. FR-010: System MUST count a case with a ticket only under the ticket scope when tab "Semua" is selected. |
| Attribution Rules | 1\. FR-011: System MUST attribute team and agent using assignee at event time for all entity metrics and all SLA widgets. 2\. FR-012: System MUST attribute ART SLA per response event to the agent who sent the reply event. 3\. FR-013: System MUST attribute FRT SLA to the assignee at the first response event time. 4\. FR-014: System MUST attribute Time To Close SLA to the assignee at the close event time for the case. 5\. FR-015: System MUST attribute Closed Rate to the assignee at the close event time for the case. 6\. FR-016: System MUST attribute CSAT to the assignee at the solve or close event time for the related case. |
| KPI Definitions | 1\. FR-017: System MUST show "Rata-rata waktu balasan" as the average time from a customer inbound message to the next agent reply within the selected scope. 2\. FR-018: System MUST show "Rata-rata waktu respons pertama" as the average time from the first customer inbound message to the first agent reply for each eligible case within the selected scope. 3\. FR-019: System MUST show "Rata-rata waktu sampai selesai" as the average time from case start to case solved or closed for each eligible case within the selected scope. |
| SLA Compliance Widgets | 1\. FR-020: System MUST show FRT SLA compliance as two widgets "FRT dalam SLA" and "FRT melewati SLA". 2\. FR-021: System MUST show ART SLA compliance as two widgets "ART dalam SLA" and "ART melewati SLA". 3\. FR-022: System MUST show Time To Close SLA compliance as two widgets "Time To Close dalam SLA" and "Time To Close melewati SLA". 4\. FR-023: System MUST show Closed Rate as two widgets "Closed Rate dalam SLA" and "Closed Rate melewati SLA". 5\. FR-024: System MUST show each SLA widget with both number and percentage. 6\. FR-025: System MUST compute FRT SLA compliance using the configured FRT SLA target for the case team or default SLA when no team SLA exists. 7\. FR-026: System MUST compute ART SLA compliance using the configured ART SLA target for the case team or default SLA when no team SLA exists. 8\. FR-027: System MUST compute Time To Close SLA compliance using the configured Resolution SLA target for the case team or default SLA when no team SLA exists. 9\. FR-028: System MUST compute Closed Rate using the same Resolution SLA target as Time To Close SLA for the selected scope. 10\. FR-029: System MUST define the denominator for FRT SLA percentage as the total number of eligible cases with a first response event in the period for the selected scope. 11\. FR-030: System MUST define the denominator for ART SLA percentage as the total number of eligible response events in the period for the selected scope. 12\. FR-031: System MUST define the denominator for Time To Close SLA percentage as the total number of eligible cases that are closed in the period for the selected scope. 13\. FR-032: System MUST define the denominator for Closed Rate percentage as the total number of eligible cases that are closed in the period for the selected scope. 14\. FR-033: System MUST exclude cases without first response from FRT SLA denominator. 15\. FR-034: System MUST exclude cases that are not closed from Time To Close SLA and Closed Rate denominators. 16\. FR-035: System MUST show 0 and 0% when denominator is 0 for any SLA widget pair. |
| CSAT Widgets | 1\. FR-036: System MUST show CSAT breakdown as two widgets "CSAT Baik" and "CSAT Buruk". 2\. FR-037: System MUST classify "CSAT Baik" as scores 3, 4, and 5\. 3\. FR-038: System MUST classify "CSAT Buruk" as scores 1 and 2\. 4\. FR-039: System MUST show each CSAT widget with both number and percentage. 5\. FR-040: System MUST define the denominator for CSAT percentage as total CSAT responses within the period for the selected scope. |
| Time Series Charts | 1\. FR-041: System MUST show three charts labeled "Rata-rata waktu balasan berdasarkan waktu", "Rata-rata waktu respons pertama berdasarkan waktu", and "Rata-rata waktu sampai selesai berdasarkan waktu". 2\. FR-042: System MUST group chart data by day within the selected date range. 3\. FR-043: System MUST show two series on each chart labeled "Periode ini" and "29 hari sebelumnya". |
| Formatting and Units | 1\. FR-044: System MUST display time values using a compact format with days, hours, and minutes, for example "2j 10m". 2\. FR-045: System MUST display counts as whole numbers. 3\. FR-046: System MUST display percentages with up to 1 decimal place, for example "26.6%". |
| States | 1\. FR-047: System MUST show a loading state for each widget and chart while data is being fetched. 2\. FR-048: System MUST show an empty state when no eligible data exists and display 0 values instead of blank values. 3\. FR-049: System MUST preserve selected filters when switching tabs and during refresh. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Data fetch failure | Retry button is available for the page section that failed. | Show "Gagal memuat data. Coba lagi". |
| EH-002 | Partial data failure | Render available widgets and charts. Failed components show error state. | Error state per component with "Coba lagi". |
| EH-003 | Unauthorized access | Block page access. | Show "Akses ditolak". |
| EH-004 | Invalid filter combination | Keep the page usable and reset only the invalid filter. | Show "Filter tidak valid" and reset the affected filter to "Semua". |
| EH-005 | SLA configuration missing | Fail open by showing SLA widgets as 0 and mark as not configured. | Show tooltip "SLA belum dikonfigurasi". |
| EH-006 | CSAT disabled | Hide CSAT widgets or show empty state based on tenant configuration. | If shown, display "CSAT tidak aktif" in tooltip. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Conversation has no agent reply | Exclude from ART response event evaluation. Exclude from FRT eligibility if no first response exists. | Widgets remain accurate. No error shown. |
| EC-002 | Multiple inbound messages before first agent reply | Use the earliest inbound as the FRT start point for that case. | Tooltip explains definition in Bahasa Indonesia. |
| EC-003 | Agent replies when case is unassigned | Attribute to "Belum ditugaskan" team scope if team is unknown at event time. | Show team as "Belum ditugaskan" in filter option if needed. |
| EC-004 | Case reassigned between inbound and reply | Use assignee at the reply event time for attribution. | Tooltip note on attribution rule. |
| EC-005 | Case reassigned between reply events | ART attribution follows the agent who sent each reply event. | Tooltip note on ART per event. |
| EC-006 | Case is not closed in the selected period | Exclude from Time To Close SLA and Closed Rate denominators. | Widgets show 0 and 0% when no closed cases exist. |
| EC-007 | Case is closed and later reopened | For Time To Close SLA and Closed Rate, use the close event within the selected period. A reopen after close does not change past close evaluation for that period. | Tooltip note on how reopen affects counting. |
| EC-008 | Channel is changed or merged | Use the channel recorded at event time for filtering and reporting. | No special UI behavior needed. |
| EC-009 | Date range includes current day partial data | Show partial values based on available events. | Tooltip "Data hari ini dapat berubah". |
| EC-010 | CSAT response arrives after close date | Attribute CSAT by case solve or close event time and filter by CSAT response timestamp for inclusion. | Tooltip clarifies that CSAT counts are by response date. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Page entry | Sidebar menu item label is "Ketanggapan". Page title is "Ketanggapan". | 1\. User clicks "Ketanggapan". 2\. Page loads with default filters. | US-001 |
| Tabs | Tabs labeled "Semua", "Percakapan", "Tiket". | 1\. User selects a tab. 2\. Page refreshes metrics for that scope. | US-002 |
| Filter bar | Filters in one row: "Rentang tanggal", "Tim", "Agen", "Channel". Default values show "Semua" where applicable. | 1\. User changes filters. 2\. Data refreshes automatically. 3\. Filters persist across tab changes. | US-001, US-002 |
| KPI cards | Three KPI cards at top: "Rata-rata waktu balasan", "Rata-rata waktu respons pertama", "Rata-rata waktu sampai selesai". | 1\. User reads high level KPIs. 2\. Hover shows tooltip definitions. | US-003 |
| SLA widget group | Group header "Kepatuhan SLA". Eight widgets: "FRT dalam SLA", "FRT melewati SLA", "ART dalam SLA", "ART melewati SLA", "Time To Close dalam SLA", "Time To Close melewati SLA", "Closed  Rate dalam SLA", "Closed Rate melewati SLA". Each shows "% (Jumlah)". | 1\. User scans compliance quickly. 2\. Hover tooltip explains denominator and SLA source. | US-004, US-005, US-008, US-009 |
| CSAT widget group | Group header "Kepuasan Pelanggan". Two widgets: "CSAT Baik", "CSAT Buruk". Each shows "% (Jumlah)". | 1\. User compares satisfaction quickly. 2\. Hover tooltip shows score ranges for Baik and Buruk. | US-006 |
| Time-series charts | Three charts below widgets. Each chart shows two series with legend "Periode ini" and "29 hari sebelumnya". | 1\. User reviews trends. 2\. Hover tooltip shows date and both series values. | US-007 |
| Empty state | When no data exists, widgets show 0 and charts show empty state message. | 1\. User sees clear no data message. | US-001 |
| Loading state | Skeleton loaders for widgets and charts. | 1\. User sees loading state while data loads. | US-001 |

## **10\. Field & Validation**

| Field | Type | Validation | Default | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- | ----- |
| Rentang tanggal | Date range picker | Start date must be less than or equal to end date. Max range is 365 days. | 30 hari terakhir | "Rentang tanggal". |
| Tim | Single select dropdown | Must match a team the user has access to. | Semua | "Tim". Option "Semua". |
| Agen | Multi select dropdown | Must match agents within accessible teams. Max 50 agents selected. | Semua | "Agen". Option "Semua". |
| Channel | Single select dropdown | Must match enabled channels for the tenant. | Semua | "Channel". Option "Semua". |
| Tabs | Tab switch | Must be one of allowed values. | Semua | "Semua", "Percakapan", "Tiket". |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Page initial load completes within 3 seconds for a 30 day range under normal load. |
| Responsiveness | Filter changes refresh visible widgets and charts within 2 seconds under normal load. |
| Availability | Analytics page availability is 99.5% monthly. |
| Data freshness | Data updates at least every 5 minutes for non real-time analytics mode. |
| Security | Enforce role-based access to analytics. Do not expose data outside authorized teams. |
| Privacy | Do not display personal customer identifiers on this page. Only aggregated metrics are shown. |
| Accessibility | Keyboard navigation for tabs and filters. Visible focus state for interactive elements. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Team SLA configuration exists and is consistent. | Product, Ops | SLA widgets become misleading if missing. | Provide clear "SLA belum dikonfigurasi" tooltip and fail open with 0\. |
| Accurate event timestamps for inbound, reply, solve, close. | Engineering | Incorrect averages and SLA compliance. | Define event eligibility rules and validate with QA fixtures. |
| Assignee at event time is reliably recorded. | Engineering | Attribution becomes inconsistent across filters. | Require audit trail of assignment changes and event linkage. |
| Closed Rate overlaps with Time To Close SLA dataset | Product, Design | Users may perceive redundancy. | Use clear widget descriptions and tooltips to explain meaning and denominator. |
| CSAT module enablement varies by tenant. | Product | CSAT widgets may show 0 unexpectedly. | Show CSAT disabled messaging and keep widgets optional by config. |
| All tab de-duplication logic is misunderstood by users. | Product, Design | Perceived mismatch across tabs. | Add tooltip on "Semua" tab explaining rule in Bahasa Indonesia. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Weekly active viewers of Responsiveness page | 80% of supervisors | 30 days | Analytics page view events. |
| Reduction in FRT Over SLA | 10% relative reduction | 60 days | SLA compliance widgets. |
| Reduction in ART Over SLA | 10% relative reduction | 60 days | SLA compliance widgets. |
| Increase in Time To Close In SLA | 5 points increase | 90 days | Time To Close SLA widgets. |
| Increase in Closed Rate In SLA | 5 points increase | 90 days | Closed Rate widgets. |
| CSAT Baik rate improvement | 5 points | 90 days | CSAT responses. |
| Time to detect performance regression | Under 1 day | 60 days | Supervisor feedback and incident notes. |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| SLA trend charts by time for FRT, ART, Time To Close, Closed Rate | Helps pinpoint specific dates causing compliance drops. |
| Drill down from SLA widgets to case list | Enables operational action from analytics. |
| Scheduled reports and export | Supports periodic management reporting. |
| Segmentation by tag and inbox | Adds actionable grouping for coaching and staffing. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Closed Rate and Time To Close SLA use the same closed case denominator | Some overlap is expected and may require tooltip guidance. |
| ART SLA is computed per response event | Users may need guidance to interpret event-based denominators. |
| All tab uses de-duplication for cases with tickets | Totals between tabs may not sum cleanly. |
| No drill down list view | Users cannot jump from widget to the exact cases in this version. |

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| FRT | First Response Time. Time from first customer inbound message to first agent reply for a case. |
| ART | Average Response Time. Time from a customer inbound message to the next agent reply, evaluated per response event. |
| Time To Close | Time from case start to case solved or closed. |
| Closed Rate | Completion outcome under SLA for closed cases in the selected period, displayed as In SLA and Over SLA. |
| In SLA | Event or case meets the configured SLA target. |
| Over SLA | Event or case exceeds the configured SLA target. |
| CSAT Baik | CSAT score (Default: 3, 4, or 5\) configurable via CSAT Settings. |
| CSAT Buruk | CSAT score (Default: 1 or 2\) configurable via CSAT Settings. |
| Assignee at event time | Attribution rule where team and agent are taken from the assignment state when the measured event occurred. |
| Periode ini | The selected date range on the page. |

—-------

# **ART (Average Response Time)**

### **Definisi**

Rata-rata waktu agent membalas **setiap message customer setelah first reply**.

### **Formula**

ART \= total response delay / total responses

### **Type**

Duration

### **Example**

1m 12s  
---

# **FRT (First Response Time)**

### **Definisi**

Waktu dari **customer message pertama** sampai **agent reply pertama**.

### **Formula**

first\_agent\_reply \- first\_customer\_message

### **Type**

Duration

### **Example**

45s  
---

# **TTC (Time To Close)**

### **Definisi**

Waktu dari **conversation start** sampai **conversation closed**.

### **Formula**

close\_time \- conversation\_start

### **Type**

Duration

### **Example**

59m 44s  
---

# **ART In SLA**

### **Definisi**

Jumlah response agent yang **ART nya masih dalam SLA threshold**.

### **Type**

Count \+ %

### **Example**

227 (58%)

### **Explanation**

227 responses memenuhi SLA  
dari total 392 responses  
---

# **ART Over SLA**

### **Definisi**

Jumlah response agent yang **melewati SLA threshold**.

### **Type**

Count \+ %

Example:

42 (10%)  
---

# **FRT In SLA**

### **Definisi**

Jumlah conversation yang first response nya **tidak melewati SLA**.

### **Type**

Count \+ %

Example:

267 (68%)  
---

# **TTC In SLA**

### **Definisi**

Jumlah ticket/conversation yang **closed sebelum SLA deadline**.

### **Type**

Count \+ %

Example:

267 (68%)  
---

# **Solving Rate**

### **Definisi**

Persentase conversation yang berhasil diselesaikan.

### **Formula**

closed\_conversation / total\_conversation

### **Type**

Percentage

Example:

58%  
