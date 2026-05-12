# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics Broadcast Statistics Page  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Yusril

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-03-03 | Yusril Ibnu Maulana | Initial PRD for Analytics Broadcast Statistics page |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a fast summary of broadcast delivery outcomes to help supervisors detect delivery issues and manage broadcast operations. |
| Scope | Analytics menu. Page: Broadcast. Shows KPI cards and filter behavior for broadcast delivery statistics. |

| In Scope | Out of Scope |
| ----- | ----- |
| KPI cards for total and delivery outcome counts. | Campaign level analytics and conversion metrics. |
| Filters: Date range, Team, Agent, Channel, Account. | Drill down to recipient level list from KPI cards. |
| Consistent status mapping and empty states. | Export CSV, scheduling reports. |
| Support API created and UI created broadcasts in the same summary. | Advanced delivery rates breakdown (read rate, click rate). |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| P-001 | Managers cannot quickly see how many broadcasts succeeded, failed, or are pending. | Delayed detection of delivery issues and operational risk during campaigns. |
| P-002 | Broadcast performance cannot be compared across account, team, and agent scope. | Hard to enforce accountability and improve broadcast quality. |
| P-003 | Invalid recipient numbers are not visible as a top level metric. | Teams repeat mistakes and waste sending capacity. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve visibility of broadcast outcomes | 80% of supervisors view Broadcast Statistics weekly within 30 days of release. |
| Reduce broadcast failures and invalid recipients | 10% reduction of "Nomor tidak valid" within 60 days. |
| Enable faster detection of delivery incidents | Median time to identify broadcast delivery regression under 1 day within 60 days. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Supervisor, I want to filter broadcast statistics by date range, team, agent, channel, and account so that I can analyze outcomes in a specific scope. | 1\. Given I am on Broadcast Statistics, When I change "Rentang tanggal", Then all KPI cards refresh based on the selected date range. 2\. Given I select "Tim", When the page refreshes, Then all KPI cards include only broadcasts attributed to the selected team scope. 3\. Given I select one or more "Agen", When the page refreshes, Then all KPI cards include only broadcasts created by the selected agents. 4\. Given I select "Channel", When the page refreshes, Then all KPI cards include only broadcasts sent via the selected channel. 5\. Given I select "Akun", When the page refreshes, Then all KPI cards include only broadcasts using the selected sender account. 6\. Given no data exists for the selected filters, When the page renders, Then KPI cards show 0 and the page remains usable. |
| US-002 | P0 | As a Supervisor, I want to see a single summary of broadcast delivery outcomes so that I can quickly detect issues. | 1\. Given data exists, When the page renders, Then I see KPI cards for "Total siaran", "Siaran berhasil dikirim", "Siaran terjadwal", "Total tertunda", "Siaran gagal dikirim", and "Nomor tidak valid". 2\. Given I hover an info tooltip on each KPI, When I read the tooltip, Then I understand what is counted in the metric. 3\. Given the filter scope changes, When KPI cards refresh, Then totals remain consistent and do not exceed "Total siaran". |
| US-003 | P0 | As an Admin, I want access control enforced so that broadcast analytics is not exposed to unauthorized roles. | 1\. Given I am an Agent, When I try to access the page, Then I see "Akses ditolak". 2\. Given I am a Supervisor, When I select a team outside my allowed scope, Then I see "Akses ditolak" and no data is shown. 3\. Given I am an Owner or Admin, When I access the page, Then I can view data within my allowed scope. |
| US-004 | P1 | As a Supervisor, I want stable states for loading, empty, and error so that analytics remains reliable during incidents. | 1\. Given the page is fetching data, When the request is in progress, Then KPI cards show a loading state. 2\. Given the request fails, When the page renders, Then KPI cards show an error state with "Coba lagi". 3\. Given I click "Coba lagi", When the retry succeeds, Then KPI cards show the latest values. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Page Access and Scope | FR-001: System MUST restrict Broadcast Statistics access to Owner, Admin, and Supervisor roles. FR-002: System MUST deny access for Agent role and show "Akses ditolak". FR-003: System MUST scope Supervisor visibility to teams within their allowed access scope. |
| Filters | FR-004: System MUST provide filters for "Rentang tanggal", "Tim", "Agen", "Channel", and "Akun". FR-005: System MUST default "Rentang tanggal" to 30 days last period. FR-006: System MUST default "Tim" to "Semua". FR-007: System MUST default "Agen" to "Semua". FR-008: System MUST default "Channel" to "Semua". FR-009: System MUST default "Akun" to "Semua akun". FR-010: System MUST support multi select for "Agen" with maximum 50 agents selected. FR-011: System MUST keep filter selections when navigating away and back within the same session. |
| Attribution Rules | FR-012: System MUST attribute broadcast metrics to "Tim" based on the team scope selected at broadcast creation time. FR-013: System MUST attribute broadcast metrics to "Agen" based on the user who created the broadcast. FR-014: System MUST include API created broadcasts in "Semua" scope and exclude them when specific agents are selected. FR-015: System MUST attribute "Channel" based on the channel used for sending the broadcast. FR-016: System MUST attribute "Akun" based on the sender account used for the broadcast. |
| Counting Unit | FR-017: System MUST count all KPI cards in message level units where 1 recipient message equals 1 unit. FR-018: System MUST ensure all outcome KPIs sum up to "Total siaran" under the same filters and date range. |
| Date Range Inclusion Rule | FR-019: System MUST include a recipient message in the selected date range using "waktu proses". FR-020: System MUST define "waktu proses" as follows. 1\. For delivered messages, waktu proses is the time the message is marked delivered. 2\. For failed messages, waktu proses is the time the message is marked failed. 3\. For invalid recipient messages, waktu proses is the time the message is marked invalid. 4\. For scheduled messages, waktu proses is the scheduled time. 5\. For pending messages, waktu proses is the time the message enters pending state. |
| KPI Definitions | FR-021: System MUST show "Total siaran" as the total number of recipient messages in the selected scope and date range. FR-022: System MUST show "Siaran berhasil dikirim" as the count of recipient messages with outcome Delivered in the selected scope and date range. FR-023: System MUST show "Siaran terjadwal" as the count of recipient messages with status Scheduled in the selected scope and date range. FR-024: System MUST show "Total tertunda" as the count of recipient messages with status Pending or Sending in the selected scope and date range. FR-025: System MUST show "Siaran gagal dikirim" as the count of recipient messages with outcome Failed or Canceled in the selected scope and date range. FR-026: System MUST show "Nomor tidak valid" as the count of recipient messages with outcome Invalid Recipient in the selected scope and date range. |
| Formatting | FR-027: System MUST display KPI values as whole numbers. FR-028: System MUST format numbers using locale separators for readability. |
| States | FR-029: System MUST show loading state for KPI cards while fetching data. FR-030: System MUST show empty state when no data exists and render values as 0\. FR-031: System MUST show error state per component with retry action "Coba lagi". |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission denied | Block page access. | Show "Akses ditolak". |
| EH-002 | Scope denied | Block data load for the selected team. | Show "Akses ditolak". Clear KPI content. |
| EH-003 | Data load failure | Allow retry without leaving page. | Show "Gagal memuat data. Silakan coba lagi." and button "Coba lagi". |
| EH-004 | Partial data failure | Render available KPI cards. Failed cards show error state. | Error state per card with "Coba lagi". |
| EH-005 | Filter value no longer exists | Reset only the invalid filter to default. | Show "Filter tidak valid". Keep page usable. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | A broadcast is partially delivered and partially failed | Each recipient message is counted in its final outcome bucket. | Totals remain consistent. |
| EC-002 | A broadcast is canceled after scheduling | Recipient messages are counted under "Siaran gagal dikirim". | Tooltip clarifies cancellation included. |
| EC-003 | A broadcast is scheduled in the future beyond end date | It is excluded from the selected date range. | No special UI needed. |
| EC-004 | Multiple channels exist but the tenant only uses one | Channel filter remains visible with a single option plus "Semua". | No confusion in UI. |
| EC-005 | API created broadcast exists and agent filter selects specific agents | API created broadcasts are excluded. | Tooltip for agent filter explains behavior. |
| EC-006 | Sender account is deleted or disconnected after sending | Historical stats remain visible under "Semua akun". | Account filter shows a fallback label "Akun tidak tersedia". |
| EC-007 | Invalid recipient is due to formatting vs provider rejection | All invalid recipient outcomes are grouped into "Nomor tidak valid". | Tooltip clarifies grouping. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Page Entry | Analytics menu item label is "Siaran". Page title is "Siaran". | 1\. User opens Analytics. 2\. User clicks "Siaran". 3\. Page loads with default filters. | US-001 |
| Filter Bar | Filters in one row: "Rentang tanggal", "Tim", "Agen", "Channel", "Akun". | 1\. User changes one filter. 2\. Page refreshes automatically. 3\. All KPI cards update. | US-001 |
| KPI Cards | Six KPI cards visible at once. Each has title and value. Each has tooltip icon. | 1\. User scans totals. 2\. User hovers tooltip icon. 3\. Tooltip shows definition and inclusion rule. | US-002 |
| Loading State | Skeleton for KPI cards. | 1\. Page loads. 2\. Skeleton shows. 3\. Values appear when ready. | US-004 |
| Empty State | KPI cards show 0 when no data exists. | 1\. User applies filters with no data. 2\. KPI cards show 0\. | US-001 |
| Error State | Inline error state on KPI cards with retry. | 1\. Data fetch fails. 2\. Error message shows. 3\. User clicks "Coba lagi". | US-004 |
| Access Denied | Full page blocked for unauthorized roles. | 1\. Unauthorized user opens page. 2\. Access denied shows. | US-003 |

### **UI Strings (Bahasa Indonesia only)**

| Key | Value |
| ----- | ----- |
| Page title | Siaran |
| Filter label date range | Rentang tanggal |
| Filter label team | Tim |
| Filter label agent | Agen |
| Filter label channel | Channel |
| Filter label account | Akun |
| Default option all | Semua |
| Default option all accounts | Semua akun |
| KPI total | Total siaran |
| KPI delivered | Siaran berhasil dikirim |
| KPI scheduled | Siaran terjadwal |
| KPI pending | Total tertunda |
| KPI failed | Siaran gagal dikirim |
| KPI invalid | Nomor tidak valid |
| Load failure | Gagal memuat data. Silakan coba lagi. |
| Retry | Coba lagi |
| Access denied | Akses ditolak |
| Invalid filter | Filter tidak valid |
| Missing account label | Akun tidak tersedia |

## **10\. Field & Validation**

| Field | Type | Validation | Required |
| ----- | ----- | ----- | ----- |
| Rentang tanggal | Date range picker | Start date must be less than or equal to end date. Maximum range 365 days. | Yes |
| Tim | Single select dropdown | Must be within user scope. | No |
| Agen | Multi select dropdown | Must be within selected team scope when team is selected. Maximum 50 selected. | No |
| Channel | Single select dropdown | Must match enabled broadcast channels for the tenant. | No |
| Akun | Single select dropdown | Must match connected sender accounts. If none, show only "Semua akun". | No |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Initial load completes within 2 seconds for a 30 day range under normal conditions. |
| Responsiveness | Filter changes refresh KPI cards within 2 seconds under normal conditions. |
| Availability | Analytics page availability is 99.5% monthly. |
| Data Freshness | Metrics update at least every 5 minutes. |
| Security | Role based access enforced server side. |
| Privacy | Only aggregated metrics are shown. No recipient identifiers are shown on this page. |
| Accessibility | Keyboard navigation for filters. Visible focus state. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Inconsistent status mapping across channels | Engineering | Counts become misleading across filters. | Standardize status mapping to the KPI buckets. |
| Missing team attribution on broadcast creation | Engineering | Team filter becomes unreliable. | Require team attribution on broadcast creation for analytics. |
| API created broadcasts distort agent accountability | Product | Agent comparisons become biased. | Exclude API broadcasts when agent filter is specific. |
| Disconnected sender accounts break filtering | Engineering | Account filter becomes confusing. | Show fallback label "Akun tidak tersedia" for historical data. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Weekly active supervisors viewing Broadcast Statistics | 80% | 30 days | Product analytics events |
| Reduction in invalid recipient count | 10% | 60 days | Broadcast outcomes |
| Reduction in failed or canceled count | 10% | 60 days | Broadcast outcomes |
| Median time to detect delivery regression | Under 1 day | 60 days | Ops incident notes and page usage |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Outcome rate percentages | Helps compare accounts with different volumes. |
| Trend chart by day | Helps identify dates where delivery issues spike. |
| Drill down to broadcast list for each KPI | Enables operational actions from analytics. |
| Separate KPI for canceled | Improves clarity and avoids grouping cancellations into failures. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Message level counting only | Does not directly show campaign level outcomes. |
| No drill down from KPI cards | Users must use Broadcast list pages for investigation. |
| API broadcasts excluded when filtering by specific agents | Agent accountability view does not include system initiated campaigns. |

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| Recipient message unit | One recipient in a broadcast equals one counted unit. |
| Waktu proses | The timestamp used to include a broadcast outcome into the selected date range based on its status type. |
| Delivered | A recipient message is marked successfully delivered. |
| Scheduled | A recipient message is scheduled for future sending. |
| Pending | A recipient message is queued or in progress for sending. |
| Failed | A recipient message sending attempt failed. |
| Canceled | A recipient message was canceled before completion and is counted as failed for this page. |
| Invalid recipient | A recipient message cannot be sent due to invalid recipient number. |

