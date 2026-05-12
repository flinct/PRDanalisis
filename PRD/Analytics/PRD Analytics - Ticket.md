# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics Page \- Ticket  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-03-03 | \[TBA\] | Initial PRD for Analytics page "Tiket" including filters, metrics definitions, charts, SLA rules, and edge cases. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a clear ticket performance snapshot for managers using KPI cards and charts, with consistent filters and attribution rules. |
| Scope | This PRD covers the Analytics menu page "Tiket" only, including filters, KPI cards, charts, empty states, and metric definitions. |

| In Scope | Out of Scope |
| ----- | ----- |
| Page "Tiket" under menu "Analitik". | Pages "Percakapan", "Ketanggapan", "Performa Anggota", "Siaran". |
| Filters: "Rentang tanggal", "Tim", "Agen". | Export report to file. |
| KPI cards listed in the requirement. | Editing tickets from analytics. |
| Charts listed in the requirement. | Solving Rate SLA metrics. |
| SLA cards based on FRT SLA only. | ART SLA cards on this page. |
| Attribution rule: assignee at event time where applicable. | Custom dashboard builder. |

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Managers cannot quickly understand ticket volume, current open load, and operational responsiveness from one view. | Slow decision making and delayed operational actions such as staffing changes. |
| SLA visibility is unclear without a consistent definition and breakdown by compliance states. | Teams cannot identify SLA risk and breaches early. |
| Attribution becomes misleading when tickets are reassigned during the period. | Incorrect evaluation of team and agent performance. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Provide a single source of truth for ticket volume and status in a selected period. | 95% of stakeholders report that "Tiket" page answers volume and open load questions without manual exports within 2 weeks of release. |
| Make SLA compliance observable and actionable. | SLA cards and charts match audit samples with 99% accuracy across 100 sampled tickets. |
| Enable drill filtering without confusing attribution. | Agent filtering produces consistent results aligned with "assignee at event time" rules for all event based metrics. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Supervisor or Admin, I want to view the "Tiket" analytics summary so that I can understand ticket volume and workload. | 1\. Given I have access to "Analitik", When I open menu "Tiket", Then I see KPI cards and charts populated for the default "Rentang tanggal". 2\. Given the page is loading, When data is still being fetched, Then I see a loading state for KPI cards and charts. 3\. Given the data is empty, When there are no tickets in the selected range, Then KPI cards show 0 and charts show an empty state message in Bahasa Indonesia. |
| US-002 | P0 | As a Supervisor or Admin, I want to filter by "Tim" and "Rentang tanggal" so that I can focus the analytics to a specific scope. | 1\. Given I select a "Tim", When the selection changes, Then all KPI cards and charts update to reflect the selected team scope. 2\. Given I change "Rentang tanggal", When I apply the new range, Then all KPI cards and charts update to reflect the selected date range. 3\. Given I select an invalid range, When the end date is before the start date, Then the system blocks apply and shows a validation message in Bahasa Indonesia. |
| US-003 | P0 | As a Supervisor or Admin, I want to filter by "Agen" so that I can review performance for one or multiple agents. | 1\. Given I select one or more agents in filter "Agen", When the filter is applied, Then ticket metrics that are agent attributable update based on the defined attribution rules. 2\. Given I clear the "Agen" filter, When it returns to "Semua", Then the page returns to aggregated team level metrics. 3\. Given I select an agent with no tickets in the period, When the filter is applied, Then KPI cards show 0 and charts show empty states without errors. |
| US-004 | P0 | As a Supervisor or Admin, I want to understand SLA compliance on tickets so that I can detect risk and breach quickly. | 1\. Given tickets exist in the selected scope, When I view SLA KPI cards, Then I see counts and percentages for compliance states that are consistent with the defined SLA rules. 2\. Given a ticket is still open, When it is within SLA window, Then it contributes to "Tiket aktif dalam batas SLA". 3\. Given a ticket first response breaches SLA, When the first agent response occurs after the SLA limit, Then it contributes to "Melebihi batas waktu SLA". |
| US-005 | P1 | As a Supervisor or Admin, I want to see ticket creation patterns by hour and day so that I can plan staffing. | 1\. Given I view chart "Tiket dibuat per jam", When I hover a bar, Then I see the hour bucket and the number of tickets created in that hour. 2\. Given I view chart "Rata-rata tiket dibuat per hari dalam seminggu", When I hover a bar, Then I see the day name and the number of tickets created for that day. |
| US-006 | P1 | As a Supervisor or Admin, I want to see distributions of "Waktu respon pertama agen" and "Waktu tunggu pemohon" so that I can identify delays. | 1\. Given I view chart "Waktu tunggu pemohon", When I hover a bucket, Then I see the bucket label and the number of tickets in that bucket. 2\. Given I view chart "Waktu respon pertama agen", When I hover a bucket, Then I see the bucket label and the number of tickets in that bucket. 3\. Given the distributions cannot be computed due to missing timestamps, When the page loads, Then the chart shows an error state message in Bahasa Indonesia and does not break other components. |
| US-007 | P1 | As a Supervisor or Admin, I want to view replies per ticket and completion trend so that I can detect workload and resolution throughput. | 1\. Given I view "Rata-rata balasan per tiket", When I view the legend, Then I see "Tiket terselesaikan" and "Jumlah balasan agen" as separate series labels in Bahasa Indonesia. 2\. Given I hover a data point, When the tooltip appears, Then I see the date and both series values for that date. |
| US-008 | P0 | As a Supervisor or Admin, I want to view “Ticker belum terassign” as KPI  | 1\. Given user membuka halaman Ticket Summary/Statistics, When KPI cards render, Then terdapat card baru “Ticket belum ter-assign”. 2\. Given user memilih date range, When range berubah, Then nilai “Ticket belum ter-assign” ikut berubah sesuai range. 3\. Given end date snapshot, When ticket berstatus Open dan assignee kosong, Then ticket dihitung dalam “Ticket belum ter-assign”. 4\. Given ticket sudah assigned, Then ticket tidak dihitung dalam “Ticket belum ter-assign”. 5\. Given tidak ada data, Then value \= 0 dan layout tidak rusak. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access Control | FR-001: System MUST allow access to page "Tiket" for roles "Admin" and "Supervisor". FR-002: System MUST restrict access for unauthorized roles and show "Akses ditolak". |
| Global Filters | FR-003: System MUST provide filter "Rentang tanggal". FR-004: System MUST provide filter "Tim". FR-005: System MUST provide filter "Agen" with single select and multi select support. FR-006: System MUST apply filters consistently across all KPI cards and charts on this page. |
| Attribution Rules | FR-007: System MUST attribute event based ticket metrics using assignee at event time. FR-008: System MUST attribute message based metrics using the sending agent for each reply event. FR-009: System MUST define snapshot metrics at the end of the selected date range for "Ticket Open" and "Tiket aktif dalam batas SLA". |
| KPI Cards | FR-010: System MUST display KPI card "Total tiket". FR-011: System MUST display KPI card "Total tiket terselesaikan". FR-012: System MUST display KPI card "Ticket Open". FR-013: System MUST display KPI card "Tiket dibuka kembali". FR-014: System MUST display KPI card "Tiket dengan satu tanggapan". FR-015: System MUST display SLA KPI cards "Persentase pencapaian SLA", "Melebihi batas waktu SLA", "Sesuai batas waktu SLA", "Tiket aktif dalam batas SLA". |
| KPI Definitions | FR-016: "Total tiket" MUST count tickets created within the selected date range. FR-017: "Total tiket terselesaikan" MUST count tickets that transition to "Resolved" within the selected date range. FR-018 (KPI Cards): System MUST display KPI card “Ticket belum ter-assign”. FR-019 (KPI Definition): “Ticket belum ter-assign” MUST count tickets in status “Open” at end of selected date range with assignee empty/unassigned. FR-020: "Ticket Open" MUST count tickets in status "Open" at the end of the selected date range. FR-021: "Tiket dibuka kembali" MUST count unique tickets that transition from "Resolved" to "Open" within the selected date range. FR-022: "Tiket dengan satu tanggapan" MUST be computed as percentage and count based on tickets created within the selected date range that have exactly one agent reply within the selected date range. FR-023: SLA KPI cards on this page MUST represent FRT SLA only. FR-024: "Persentase pencapaian SLA" MUST be computed as "Sesuai batas waktu SLA" divided by "Sesuai batas waktu SLA plus Melebihi batas waktu SLA" and shown as a percentage with one decimal. FR-025: "Tiket aktif dalam batas SLA" MUST count tickets that are open at end of range and still within FRT SLA window after considering SLA pause rules. |
| SLA Rules | FR-024: SLA MUST run only when ticket state indicates agent holds the ball, including "Submitted" and "In Progress". FR-025: SLA MUST pause when ticket is in "Waiting on Customer". FR-026: SLA MUST stop when ticket is "Resolved". FR-027: Reopened tickets MUST start a new SLA countdown for FRT SLA measurement. |
| Charts | FR-028: System MUST show chart "Tiket dibuat per jam" as a bar chart grouped by hour 00 to 23\. FR-029: System MUST show chart "Rata-rata tiket dibuat per hari dalam seminggu" as a bar chart grouped by "Sen" through "Min". FR-030: System MUST show chart "Waktu respon pertama agen" as a distribution chart using fixed buckets defined in Section 10\. FR-031: System MUST show chart "Waktu tunggu pemohon" as a distribution chart using fixed buckets defined in Section 10\. FR-032: System MUST show chart "Rata-rata balasan per tiket" as a combo chart with series labels "Tiket terselesaikan" and "Jumlah balasan agen". |
| Chart Behavior | FR-033: Charts MUST support hover tooltip showing label and value in Bahasa Indonesia. FR-034: Charts MUST display an empty state when there is no data, without showing broken axes or errors. FR-035: Charts MUST update within 3 seconds after filter changes for a 30 day range under typical load. |
| Localization | FR-036: All visible UI labels, tooltips, empty states, and error messages MUST be in Bahasa Indonesia. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block page content and stop loading further data. | Title: "Akses ditolak". Description: "Anda tidak memiliki izin untuk mengakses halaman ini.". |
| EH-002 | Data load failure | Show error state per component and allow retry without leaving page. | "Gagal memuat data". Button: "Coba lagi". |
| EH-003 | Partial data failure | Render components with available data and isolate failed components. | Component message: "Sebagian data tidak tersedia". |
| EH-004 | Invalid date range | Prevent apply and keep previous valid state. | "Rentang tanggal tidak valid". |
| EH-005 | Too large date range | Block apply and suggest smaller range. | "Rentang tanggal terlalu panjang". "Pilih maksimal 12 bulan.". |
| EH-006 | Missing timestamps for SLA | Set SLA metrics to "Tidak tersedia" and keep other metrics working. | "Data SLA tidak tersedia untuk rentang ini". |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Ticket created before the range but resolved within the range. | Included in "Total tiket terselesaikan" and excluded from "Total tiket". |
| EC-002 | Ticket created within the range but resolved after the range. | Included in "Total tiket" and excluded from "Total tiket terselesaikan". |
| EC-003 | Ticket reopened multiple times within the range. | Counted once in "Tiket dibuka kembali" as unique ticket. |
| EC-004 | Ticket reassigned between agents within the range. | Event based metrics attributed using assignee at event time. |
| EC-005 | Ticket has replies from multiple agents. | "Jumlah balasan agen" reflects the sending agent when agent filter is applied. |
| EC-006 | Ticket is unassigned for part of its lifecycle. | Ticket remains included in team scope, and agent scope includes it only when assigned at event time. |
| EC-007 | SLA pause state overlaps the range boundary. | SLA active or paused status is evaluated correctly for "Tiket aktif dalam batas SLA" at end of range. |
| EC-008 | Timezone boundary at midnight. | All buckets use workspace timezone consistently for hours and days. |
| EC-009 | Deleted or deactivated agent still appears in historical data. | Agent remains selectable for historical filters and shown as inactive label in dropdown. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Page Header | Title "Ticket Summary" or localized page title "Ringkasan Tiket". | User opens menu "Analitik" then clicks "Tiket". | US-001 |
| Filter Bar | Filters: "Tim", "Agen", "Rentang tanggal". Default values visible. | User changes filters then page updates results. | US-002, US-003 |
| KPI Section | Cards for all required ticket and SLA metrics. | User scans top KPIs to assess volume and SLA status. | US-001, US-004 |
| Chart: Tickets by Hour | Bar chart with tooltip. | User identifies peak hours for new tickets. | US-005 |
| Chart: Tickets by Day of Week | Bar chart with tooltip. | User identifies weekday patterns for staffing. | US-005 |
| Chart: First Agent Response Time | Distribution chart with fixed buckets. | User identifies slow first response clusters. | US-006 |
| Chart: Customer Wait Time | Horizontal distribution chart with fixed buckets. | User identifies customer wait pain points. | US-006 |
| Chart: Replies per Ticket and Completion | Combo chart with legend and tooltip. | User correlates throughput and response volume. | US-007 |
| Loading State | Skeleton or spinner per section. | Shown on initial load and after filter change. | US-001 |
| Empty State | Empty chart and card values show 0 when valid but no data. | Shown when scope returns no results. | US-001, US-003 |
| Error State | Component level error with retry action. | User clicks "Coba lagi" to reload failed component. | US-001, US-006 |

## **10\. Field & Validation**

| Field | Type | UI Label (Bahasa Indonesia) | Validation Rules | Default |
| ----- | ----- | ----- | ----- | ----- |
| Team filter | Single select dropdown | "Tim" | Required. Includes "Semua Tim". | "Semua Tim" |
| Agent filter | Multi select dropdown | "Agen" | Optional. Supports single and multi selection. Max selected agents: 20\. | "Semua" |
| Date range | Date range picker | "Rentang tanggal" | Required. End date cannot be before start date. Max range: 12 months. Timezone: workspace. | Last 30 days |
| KPI percentage format | Display format | N/A | Percentages shown with 1 decimal. Counts shown as integer. | N/A |
| Time bucket for "Tiket dibuat per jam" | Buckets | N/A | 24 buckets from 00 to 23 using workspace timezone. | N/A |
| Day of week labels | Fixed labels | "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min" | Always shown even if value is 0\. | N/A |
| Customer wait buckets | Fixed buckets | "0 \- 1 jam", "1 \- 24 jam", "1 \- 3 hari", "3 \- 7 hari", "\> 7 hari" | Ticket assigned to exactly one bucket based on customer wait definition. | N/A |
| First response time buckets | Fixed buckets | "0 \- 10 menit", "10 \- 30 menit", "30 \- 60 menit", "1 \- 3 jam", "3 \- 24 jam", "\> 24 jam" | Ticket assigned to exactly one bucket based on FRT definition. | N/A |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Page initial load for a 30 day range MUST complete within 5 seconds under typical load. Filter changes MUST update KPIs and charts within 3 seconds under typical load. |
| Availability | Analytics page MUST be available 99.5% monthly. |
| Security | Access MUST follow role based permissions. Analytics MUST not expose ticket content body on this page. |
| Privacy | Only aggregated analytics values displayed. Agent filter lists MUST show only agents within the selected team scope. |
| Observability | System MUST log page load failures and component fetch failures for monitoring. |
| Accessibility | All interactive controls MUST support keyboard navigation and visible focus state. Charts MUST have tooltip accessible via keyboard focus. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| SLA configuration per team is inconsistent or missing. | Product and Ops | SLA metrics become misleading. | Provide required SLA settings validation and show "Tidak tersedia" when missing. |
| Ticket status taxonomy differs across channels. | Product | Incorrect open and resolved counts. | Define canonical statuses and map consistently for analytics. |
| Agent reassignment history is incomplete. | Engineering and Data | Wrong attribution under agent filter. | Require event history for assignment changes and apply "assignee at event time". |
| High data volume causes slow charts. | Engineering | Poor user experience. | Limit default range to 30 days and enforce max 12 months. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Page adoption | 60% of Supervisors view "Tiket" analytics weekly. | 30 days after launch | Product analytics events |
| Data correctness | 99% match on sampled ticket counts and SLA classifications. | First 2 weeks | QA audit checklist |
| Load time | P95 initial load under 5 seconds for 30 day range. | First 30 days | Monitoring dashboard |
| Filter usage | 40% of sessions use "Agen" filter at least once. | 30 days after launch | Product analytics events |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Add ART SLA cards and ART SLA trend chart. | Complements FRT SLA and supports response quality monitoring. |
| Add Channel filter for ticket analytics. | Enables channel specific staffing decisions. |
| Add drilldown from KPI to ticket list view. | Enables action directly from insight to execution. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| SLA cards represent FRT SLA only. | Users must use "Ketanggapan" page for ART SLA views. |
| Agent filter max selection is limited. | Prevents overly complex comparisons in one view. |
| No export on this page. | Users cannot download raw data from analytics. |

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Glossary | "Ticket Open" means tickets in status open at end of selected range. "FRT" means first agent response time from ticket start to first agent reply. "Customer wait" means the time a requester waits for agent action based on configured definition. |

