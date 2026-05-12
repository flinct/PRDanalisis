# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics \- Conversations Page  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-03-03 | Yusril Ibnu Maulana | Initial PRD for Analytics Conversations page. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a Conversations analytics page to monitor volume, workload, responsiveness proxies, unassigned backlog, and tagging usage across teams, agents, and channels. |
| Scope | Covers filters, KPI cards, charts, metric definitions, states, and access control for the Conversations analytics page only. |

### **Scope Table**

| In Scope | Out of Scope |
| ----- | ----- |
| Filters: Date range, Team, Agent (single or multi), Channel. | Ticket Summary page. |
| KPI cards for Conversations page metrics listed in this PRD. | Responsiveness page SLA metrics. |
| Charts listed in this PRD. | Member Performance page. |
| Empty, loading, and error states. | Broadcast Summary page. |
| Metric attribution rules using assignee at event time. | Export to CSV or XLSX. |
| Bahasa Indonesia UI labels and messages for this page. | Custom report builder. |

---

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Managers lack a single view of conversation volume and workload across channels and teams. | Slow operational decision making and delayed staffing adjustments. |
| Unassigned open conversations are not visible as a first class metric. | Missed customer messages and unmanaged backlog. |
| Tag usage is not visible by category. | Low quality categorization and weak insight into top issues. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve visibility of conversation workload. | At least 80% of weekly active admins and supervisors open the Conversations analytics page at least once per week within 30 days after release. |
| Reduce unassigned backlog visibility gap. | 100% of tenants can see “Total chat belum ter-assign” with correct count for selected period and can identify spikes via time series. |
| Provide actionable distribution insights. | Users can identify top channel contribution and daily volume peak for the selected period in under 60 seconds in usability testing. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin or Supervisor, I want to open the Conversations analytics page so that I can view KPI and trends for the selected period. | 1\. Given I have access to Analytics, When I open menu “Analitik” and select “Percakapan”, Then the page loads with KPI cards and charts. 2\. Given the page loads, When the default date range is applied, Then the date range equals “30 hari terakhir”. 3\. Given the page loads, When data exists, Then KPI values and charts match the selected filters. 4\. Given the page loads, When no data exists, Then I see empty states and all KPI values show 0\. |
| US-002 | P0 | As an Admin or Supervisor, I want to filter by Date range, Team, Agent, and Channel so that I can focus the analytics to a specific scope. | 1\. Given the page is loaded, When I change “Rentang tanggal”, Then all KPI and charts update to reflect the new range. 2\. Given the page is loaded, When I select a Team, Then all entity metrics use the Team at event time for attribution. 3\. Given the page is loaded, When I select one or more agents, Then message metrics reflect replies sent by those agents. 4\. Given the page is loaded, When I select a Channel, Then all KPI and charts reflect only the selected channel scope. |
| US-003 | P0 | As an Admin or Supervisor, I want to see unassigned open conversations so that I can detect and fix assignment issues quickly. | 1\. Given “Semua tim” is selected, When I view KPI cards, Then I can see “Total chat belum ter-assign”. 2\. Given “Total chat belum ter-assign” is greater than 0, When I switch to a narrower scope that logically cannot include unassigned, Then the UI follows the defined behavior for that metric under filters. 3\. Given I see a high unassigned count, When I adjust filters, Then I can isolate by channel and date range to identify spikes. |
| US-004 | P1 | As an Admin or Supervisor, I want to understand conversation volume trend and channel distribution so that I can plan staffing and operational focus. | 1\. Given data exists, When I view “Total percakapan \- berdasarkan waktu”, Then I can see daily volumes across the selected period. 2\. Given data exists, When I view “Total percakapan \- berdasarkan kanal”, Then I can see the share of each channel within the selected scope. 3\. Given I hover a chart point, When tooltip appears, Then it shows date or category and value in the same unit as KPI. |
| US-005 | P1 | As an Admin or Supervisor, I want to see reply volume and tag usage so that I can estimate agent workload and understand issue categories. | 1\. Given data exists, When I view “Total balasan \- berdasarkan waktu”, Then I can see daily reply volume in the selected scope. 2\. Given tags exist, When I view “Total tag \- berdasarkan kategori”, Then I can see counts per tag category for the selected scope. 3\. Given tags do not exist, When I view that chart, Then it shows an empty state message in Bahasa Indonesia. |
| US-006 | P0 | As an Admin, I want access control and safe states so that unauthorized users cannot see analytics and the page remains usable during errors. | 1\. Given I do not have analytics permission, When I open the page URL, Then I see “Akses ditolak”. 2\. Given the analytics service fails, When I reload, Then I see an error state with “Coba lagi”. 3\. Given filters cannot be loaded, When the page renders, Then filters show disabled state and a message “Gagal memuat filter”. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access Control | 1\. FR-001: System MUST restrict access to the Conversations analytics page to roles with analytics permission. 2\. FR-002: System MUST show “Akses ditolak” for unauthorized access attempts. |
| Page Defaults | 1\. FR-003: System MUST default “Rentang tanggal” to “30 hari terakhir”. 2\. FR-004: System MUST default “Tim” to “Semua tim”. 3\. FR-005: System MUST default “Agen” to “Semua agen”. 4\. FR-006: System MUST default “Kanal” to “Semua kanal”. |
| Global Filter Rules | 1\. FR-007: System MUST apply all active filters to KPI cards and charts consistently. 2\. FR-008: Entity metrics MUST use assignee at event time for attribution when Team or Agent filters are active and the metric depends on assignment. 3\. FR-009: Message metrics MUST use message sender for attribution when Agent filter is active. |
| Metric Definitions \- KPI Cards | 1\. FR-010: “Total percakapan” MUST represent the number of conversations started within the selected date range and within selected channel and team scope. 2\. FR-011: “Percakapan yang ditutup” MUST represent the number of conversations closed within the selected date range and within selected channel and team scope at close time. 3\. FR-012: “Percakapan yang terbuka” MUST represent the number of conversations that are open at the end of the selected date range and within selected channel and team scope at that snapshot time. 4\. FR-013: “Percakapan yang sudah dibalas” MUST represent the number of conversations that received at least one agent reply within the selected date range and within selected scope. 5\. FR-014: “Total balasan terkirim” MUST represent the total number of agent replies sent within the selected date range and within selected scope. 6\. FR-015: “Total tangkapan layar” MUST represent the total number of screenshot events within the selected date range and within selected scope. 7\. FR-016: “Percakapan ditutup dengan tangkapan layar” MUST represent the number of conversations closed within the selected date range that have at least one screenshot event within the selected date range and within scope. 8\. FR-017: “Total chat belum ter-assign” MUST represent the number of open conversations with no assignee at the end of the selected date range within selected channel scope. |
| Metric Behavior Under Filters | 1\. FR-018: When “Agen” filter is not “Semua agen”, “Total chat belum ter-assign” MUST follow one of these behaviors and the chosen behavior MUST be consistent across tenants. 2\. FR-019: Chosen behavior for this PRD is: hide “Total chat belum ter-assign” when “Agen” is not “Semua agen”. 3\. FR-020: When “Tim” filter is not “Semua tim”, “Total chat belum ter-assign” MUST be hidden to avoid misinterpretation. |
| Charts | 1\. FR-021: “Total percakapan \- berdasarkan waktu” MUST display daily counts of conversations started within the selected period. 2\. FR-022: “Total percakapan \- berdasarkan kanal” MUST display distribution of conversations started by channel within the selected period. 3\. FR-023: “Total balasan \- berdasarkan waktu” MUST display daily counts of agent replies sent within the selected period. 4\. FR-024: “Total tag \- berdasarkan kategori” MUST display counts of tag usage grouped by tag category within the selected period. |
| Chart Interaction | 1\. FR-025: Charts MUST show tooltip on hover with date or category and the numeric value. 2\. FR-026: Charts MUST show legends for multi-category visuals and allow basic hover highlight behavior. 3\. FR-027: When “Kanal” filter is a specific channel, “Total percakapan \- berdasarkan kanal” MUST be hidden and replaced with an informational empty state message for that component. |
| Data Freshness | 1\. FR-028: System MUST show “Terakhir diperbarui” timestamp for the page in Asia/Jakarta time. 2\. FR-029: System MUST update all KPI and charts within 5 seconds after filters change. |
| Localization | 1\. FR-030: All UI labels and messages on this page MUST be in Bahasa Indonesia. 2\. FR-031: Number formatting MUST follow Indonesian conventions for thousands separators. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission denied | Block page content. | Show “Akses ditolak”. |
| EH-002 | No data in range | Show 0 for KPI and empty charts. | Show “Belum ada data pada periode ini”. |
| EH-003 | Filter load failure | Disable filters and provide retry. | Show “Gagal memuat filter” and button “Coba lagi”. |
| EH-004 | Data query failure | Keep page shell, show error component and retry. | Show “Terjadi kesalahan. Coba lagi”. |
| EH-005 | Partial data available | Show available components and warn for missing ones. | Show “Sebagian data tidak tersedia” in the affected component. |
| EH-006 | Invalid date range | Prevent apply and keep last valid range. | Show “Rentang tanggal tidak valid”. |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Conversation started before range, closed within range | Included in “Percakapan yang ditutup”. Not included in “Total percakapan”. | Tooltip and definitions remain consistent. |
| EC-002 | Conversation started in range, still open after range | Included in “Total percakapan”. Included in “Percakapan yang terbuka” if open at end date. | No special UI needed. |
| EC-003 | Conversation reassigned between agents during period | Attribution uses assignee at event time per metric event. | Provide an info tooltip on Agent filter explaining attribution rule. |
| EC-004 | Conversation has replies from multiple agents | “Total balasan terkirim” counts all replies in scope. Agent filter counts replies by selected agents only. | Legend and tooltip remain consistent. |
| EC-005 | Conversation has no assignee but has replies | Allowed. Unassigned KPI counts it if open and unassigned at end date. Reply metrics include it normally. | No special UI needed. |
| EC-006 | Channel filter active | Channel distribution chart hidden. Other charts and KPI filtered by channel. | Show message “Bagan kanal tidak tersedia saat filter kanal aktif”. |
| EC-007 | Tags added and removed within period | Tag usage counts based on tag usage events within period. | No special UI needed. |
| EC-008 | Screenshot exists outside date range but conversation closed in range | Not counted in “Percakapan ditutup dengan tangkapan layar” because screenshot event must be within range for this PRD. | Keep definition stable and documented. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Left Navigation | Analytics menu with “Percakapan” selected state. | User clicks “Analitik” then “Percakapan”. | US-001 |
| Page Header | Title “Percakapan”. Updated timestamp “Terakhir diperbarui”. | User lands on page and sees context immediately. | US-001 |
| Filter Bar | Dropdowns and date picker: “Tim”, “Agen”, “Kanal”, “Rentang tanggal”. | User changes filters and sees refresh state. | US-002 |
| Loading State | Skeleton for KPI and charts during refresh. | User changes filter and sees loading. | US-001, US-002 |
| KPI Cards Grid | 8 KPI cards with labels in Bahasa Indonesia. | User scans top KPI for quick insight. | US-001, US-003 |
| KPI Card Labels | Use these labels exactly. 1\. “Total percakapan”. 2\. “Percakapan yang ditutup”. 3\. “Percakapan yang terbuka”. 4\. “Percakapan yang sudah dibalas”. 5\. “Total balasan terkirim”. 6\. “Total tangkapan layar”. 7\. “Percakapan ditutup dengan tangkapan layar”. 8\. “Total chat belum ter-assign”. | N/A | US-001 |
| Unassigned KPI Visibility | Hide “Total chat belum ter-assign” when “Tim” is not “Semua tim” or “Agen” is not “Semua agen”. | User narrows scope and avoids misinterpretation. | US-003 |
| Chart: Conversations by Time | Bar chart titled “Total percakapan \- berdasarkan waktu”. | Hover shows date and count. | US-004 |
| Chart: Conversations by Channel | Donut chart titled “Total percakapan \- berdasarkan kanal”. | Hover shows channel and count. | US-004 |
| Chart: Replies by Time | Chart titled “Total balasan \- berdasarkan waktu”. | Hover shows date and count. | US-005 |
| Chart: Tags by Category | Horizontal bar titled “Total tag \- berdasarkan kategori”. | Hover shows category and count. | US-005 |
| Empty State Message | Used per component when no data. | Show “Belum ada data pada periode ini”. | US-001 |
| Error State Message | Used per component when failed. | Show “Terjadi kesalahan. Coba lagi”. Button “Coba lagi”. | US-006 |

---

## **10\. Field & Validation**

| Field | Type | Default | Validation Rules | Behavior |
| ----- | ----- | ----- | ----- | ----- |
| Rentang tanggal | Date range picker | 30 hari terakhir | Start date MUST be less than or equal to end date. Max range 365 days. | On change, refresh KPI and charts. |
| Tim | Dropdown single select | Semua tim | Options MUST only include teams user can access. | Applies to assignment based metrics using assignee at event time. |
| Agen | Dropdown multi select | Semua agen | Options MUST only include agents in selected team scope when Team is not “Semua tim”. | Message metrics attributed by sender. Entity metrics follow assignment at event time. |
| Kanal | Dropdown single select | Semua kanal | Options MUST include active channels: “Email”, “Instagram”, “WhatsApp API”, “WhatsApp Web”, “Widget”. | If a specific channel selected, hide channel distribution chart. |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Page initial load MUST complete within 3 seconds for tenants with up to 50,000 conversations in the selected date range. |
| Performance | Filter change refresh MUST complete within 5 seconds. |
| Availability | Analytics page MUST be available 99.5% per month. |
| Security | Access MUST follow role permissions. No data leakage across tenants. |
| Privacy | Metrics MUST not expose raw message content in analytics views. |
| Accessibility | All interactive elements MUST be keyboard navigable and have visible focus state. |
| Observability | System MUST log page load failures and filter refresh failures with tenant and timestamp. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Accurate assignment history for assignee at event time | Engineering | Incorrect Team and Agent attribution | Define a single source of truth for assignment timeline and validate with QA fixtures. |
| Tag category taxonomy completeness | Product | Tag chart becomes confusing | Enforce category required in tag management. Provide “Tanpa kategori” fallback bucket. |
| Screenshot event tracking consistency | Engineering | Incorrect screenshot metrics | Standardize screenshot event definition and ensure it is emitted consistently. |
| Large tenants with high volume | Engineering | Slow page performance | Enforce max range 365 days. Provide progressive loading for charts if needed. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Weekly active usage of Conversations analytics page | 80% of weekly active admins and supervisors | 30 days after release | Product analytics events. |
| KPI consistency rate in QA validation | 100% of defined fixtures pass | Before release | QA test suite. |
| Average filter refresh time | 5 seconds or less | First 30 days | Performance monitoring. |
| Reduction in unassigned backlog detection time | 50% reduction in time to identify spikes | 60 days after release | User interviews and operational logs. |

---

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Drill down from KPI to conversation list | Enables direct action from analytics to operations. |
| Saved filter presets | Reduces repetitive setup for managers. |
| Export summary to XLSX | Supports reporting workflows for enterprise tenants. |
| Additional channel breakdown by team | Helps routing optimization and staffing. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No export in this version | Users must manually screenshot or copy values. |
| No drill down to raw lists | Analytics is for summary only. |
| Channel distribution hidden when channel filter active | Users cannot see cross channel share in that filtered state. |

---

## **16\. Appendix**

### **Glossary**

| Term | Meaning |
| ----- | ----- |
| Conversation | A customer interaction thread across a single channel session that can be open or closed. |
| Assignee at event time | Attribution rule where the responsible agent and team are taken from the assignee recorded at the time the metric event occurred. |
| Reply | An outbound message sent by an agent. |
| Screenshot | A screenshot capture event associated to a conversation. |

### **Notes**

| Item | Status |
| ----- | ----- |
| Confirm whether “Total tag \- berdasarkan kategori” counts tag usage events or distinct tagged conversations. | Assumed as tag usage events for this PRD. |
| Confirm whether screenshot should count screenshots outside date range when conversation closed within range. | Defined as screenshots within date range only for consistency. |
| Confirm whether Team filter should include unassigned bucket selection. | Out of scope. Unassigned is shown via KPI only. |

