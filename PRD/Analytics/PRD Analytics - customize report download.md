# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Dropdown Field Analytics (Custom Fields)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-23 | Yusril Ibnu Maulana | Initial PRD for dropdown custom field analytics with aggregate and trend modes. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide lean analytics for single-select dropdown custom fields so Admin and Supervisor can see option distribution and trends over time for both Ticket and Conversation. |
| Scope | See table. |

| In Scope | Out of Scope |
| ----- | ----- |
| Analytics page for dropdown fields only. | Text field analytics. |
| Ticket tab with Ticket Type filter. | Date field analytics. |
| Conversation tab without Ticket Type filter. | Image field analytics. |
| Render all reportable dropdown fields as cards. | Export CSV. |
| Bar aggregate by month. | Group by dimensions in-chart. |
| Line trend by date range. | Drilldown to list of tickets or conversations. |

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Dropdown values are structured but not measurable in analytics. | Admin and Supervisor cannot identify top categories and trends for operations. |
| Custom fields feel low value without reporting. | Lower adoption of custom fields and weaker decision making. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Make dropdown tagging measurable with minimal complexity. | Admin and Supervisor can view distribution and trend for all reportable dropdown fields within 2 clicks from Analytics. |
| Improve operational insight for Ticket and Conversation separately. | Ticket view supports Ticket Type filter. Conversation view does not show Ticket Type filter. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to see option distribution for each dropdown field so I can identify top categories quickly. | 1\. Given I open page **"Analitik Field Dropdown"**, When mode is **"Bar"**, Then each card shows a sorted horizontal bar distribution with **Jumlah** and **Persentase** per option. 2\. Given options exceed page size, When I click **"Sebelumnya"** or **"Berikutnya"**, Then bars paginate without changing sorting order. |
| US-002 | P0 | As a Supervisor, I want to filter analytics by Team Inbox so I can focus on my operational scope. | 1\. Given I have access to one or more Team Inbox, When I change filter **"Team Inbox"**, Then all cards update to only include events under that Team Inbox. 2\. Given I do not have access to a Team Inbox, When I try to select it, Then it is not selectable. |
| US-003 | P0 | As an Admin, I want to see trends over time for dropdown options so I can detect spikes and seasonality. | 1\. Given mode is **"Trend"**, When I set **"Rentang Tanggal"**, Then each card shows a multi-line timeline trend for top options for that date range. 2\. Given date range is invalid, When I apply the filter, Then system blocks and shows an error message in Bahasa Indonesia. |
| US-004 | P0 | As an Admin, I want Ticket analytics to support Ticket Type filtering so I can compare patterns per ticket type. | 1\. Given I am on tab **"Tiket"**, When I change **"Tipe Tiket"**, Then all Ticket field cards update accordingly. 2\. Given I am on tab **"Percakapan"**, When I view filters, Then **"Tipe Tiket"** is not displayed. |
| US-005 | P0 | As an Admin, I want only reportable dropdown fields to appear so the page stays relevant and lean. | 1\. Given a dropdown field is not reportable, When I open analytics, Then the field does not appear as a card. 2\. Given there are no reportable fields, When I open analytics, Then I see an empty state with guidance text in Bahasa Indonesia. |
| US-006 | P0 | As an Admin, I want counts to remain correct even if an option label changes or is deleted. | 1\. Given an option label changes, When I view analytics, Then counts remain tied to the option identity and the latest label is shown. 2\. Given an option is deleted, When I view analytics, Then the option can still appear with label **"(Opsi dihapus)"**. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access Control | 1\. FR-001: System MUST restrict access to roles Owner, Admin, Supervisor. 2\. FR-002: System MUST restrict Supervisor data to Team Inbox they are assigned to. |
| Navigation | 1\. FR-003: System MUST add a menu entry under Analytics for **"Analitik Field Dropdown"**. |
| Entity Separation | 1\. FR-004: System MUST provide two tabs: **"Percakapan"** and **"Tiket"**. 2\. FR-005: System MUST load Conversation additional fields in tab Percakapan. 3\. FR-006: System MUST load Ticket custom fields in tab Tiket. |
| Field Eligibility | 1\. FR-007: System MUST only include field type dropdown that is single-select. 2\. FR-008: System MUST only include fields flagged as reportable. 3\. FR-009: System MUST exclude fields that are disabled for the selected entity type. |
| Global Filters | 1\. FR-010: System MUST provide filter **"Team Inbox"** for both tabs. 2\. FR-011: System MUST provide filter **"Tipe Tiket"** only on tab Tiket. 3\. FR-012: System MUST provide a global mode toggle affecting all cards: **"Bar"** and **"Trend"**. |
| Time Filters | 1\. FR-013: When mode is Bar, system MUST show **"Bulan"** selector and MUST query data for that month only. 2\. FR-014: When mode is Trend, system MUST show **"Rentang Tanggal"** selector and MUST query data for that inclusive range only. 3\. FR-015: System MUST enforce max date range length of 90 days for Trend. |
| Card Rendering | 1\. FR-016: System MUST render one card per reportable dropdown field. 2\. FR-017: Each card MUST show a small metadata line: total selections for the current filter set. |
| Bar Chart Behavior | 1\. FR-018: Bar chart MUST be horizontal and sorted descending by count. 2\. FR-019: Each bar row MUST show option label, count, and share percent. 3\. FR-020: System MUST paginate bars when option count exceeds page size. 4\. FR-021: Default page size MUST be 8 options per page. 5\. FR-022: If options exceed 8, system MUST show navigation controls **"Sebelumnya"** and **"Berikutnya"** per card. |
| Trend Chart Behavior | 1\. FR-023: Trend chart MUST show timeline series over the selected date range. 2\. FR-024: Trend chart MUST display up to 6 top options by total count in the selected range. 3\. FR-025: If more than 6 options exist, system MUST add one aggregated series labeled **"Lainnya"**. 4\. FR-026: Each option series MUST have a distinct color that is consistent across reloads for the same option identity. |
| Counting Semantics | 1\. FR-027: System MUST count selection events when a user sets or changes the dropdown value. 2\. FR-028: System MUST treat multiple updates on the same entity as multiple events. 3\. FR-029: System MUST show a helper text in UI that counts are based on field updates. |
| Deleted and Renamed Options | 1\. FR-030: System MUST store option identity as stable ID and not rely on label for counting. 2\. FR-031: If option is deleted, system MUST display label **"(Opsi dihapus)"** and keep counts. |
| Empty Data | 1\. FR-032: If a field has zero events for the current filter set, system MUST show an empty chart state inside the card. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block apply when date range start is after end. | Show inline message: **"Rentang tanggal tidak valid."** |
| EH-002 | Validation | Block apply when date range exceeds 90 days. | Show inline message: **"Maksimal rentang tanggal 90 hari."** |
| EH-003 | Permission | Hide page for non-allowed roles. | Show page-level message: **"Akses ditolak."** |
| EH-004 | Data | Field list fetch fails. | Show message and retry button: **"Gagal memuat daftar field. Coba lagi."** |
| EH-005 | Data | Aggregation query fails for a card. | Show card-level message: **"Gagal memuat data."** and keep other cards visible. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | Notes |
| ----- | ----- | ----- | ----- |
| EC-001 | Option label renamed mid-month. | Counts stay correct and display latest label. | Count keyed by option ID. |
| EC-002 | Option deleted after having historical usage. | Option still appears as **"(Opsi dihapus)"** when it is in top set or within pagination. | Soft delete display. |
| EC-003 | Field becomes non-reportable after data exists. | Field card is hidden by default, but can be re-enabled by Admin to view again. | No historical loss. |
| EC-004 | No reportable fields exist for entity. | Page shows empty state guidance. | Keep lean. |
| EC-005 | Ticket Type filter set but field belongs to Conversation. | Ticket Type filter does not exist on Conversation tab. | Prevent confusion. |
| EC-006 | Very high option cardinality. | Pagination is used for Bar. Trend shows top 6 and Others only. | Avoid clutter. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Page Entry | Menu under Analytics. Label: **"Analitik Field Dropdown"**. | 1\. User opens Analytics. 2\. User clicks **"Analitik Field Dropdown"**. | US-001, US-002 |
| Tabs | Two tabs. Labels: **"Percakapan"**, **"Tiket"**. | 1\. User switches tab. 2\. Page refreshes cards and filters for that entity. | US-004 |
| Global Filters | Team Inbox filter label: **"Team Inbox"**. Ticket tab adds label: **"Tipe Tiket"**. | 1\. User changes Team Inbox. 2\. Data updates for all cards. | US-002, US-004 |
| Mode Toggle | Two modes. Labels: **"Bar"**, **"Trend"**. | 1\. User switches mode. 2\. Time filter component changes based on mode. | US-001, US-003 |
| Time Filters | Bar uses month selector label: **"Bulan"**. Trend uses range picker label: **"Rentang Tanggal"**. | 1\. User selects month or date range. 2\. User applies filters automatically on change. | US-001, US-003 |
| Helper Text | Show small helper text under filters. Text: **"Perhitungan berdasarkan pembaruan nilai field."** | 1\. User views page. 2\. User understands counting semantics. | US-006 |
| Field Cards | One card per reportable dropdown field. Card header shows field name. | 1\. User scrolls the page. 2\. User reviews each field distribution or trend. | US-001, US-005 |
| Bar Chart Card Content | Horizontal bars, sorted, with pagination controls. Labels: **"Sebelumnya"**, **"Berikutnya"**. | 1\. User sees top options. 2\. User paginates for more options. | US-001 |
| Trend Chart Card Content | Multi-line timeline. Legend shows option labels. No W1 W2 labels. | 1\. User selects date range. 2\. User sees trend lines per option. | US-003 |
| Empty States | Page empty state text: **"Belum ada field dropdown yang bisa dianalisis."** | 1\. System detects no reportable fields. 2\. User sees guidance. | US-005 |
| Loading States | Skeleton for cards and charts. | 1\. User changes filters. 2\. Skeleton shows until data arrives. | US-001, US-003 |
| Card No Data | Card-level empty text: **"Tidak ada data untuk filter ini."** | 1\. User selects filters with no events. 2\. User sees no-data state per card. | US-001 |

## **10\. Field & Validation**

| Field | Type | Validation | Required | Applies To |
| ----- | ----- | ----- | ----- | ----- |
| Team Inbox | Dropdown | Must be within user accessible Team Inbox. | Yes | Ticket and Conversation |
| Tipe Tiket | Dropdown | Must be valid Ticket Type in tenant. | No | Ticket only |
| Mode | Toggle | Must be one of Bar or Trend. | Yes | Ticket and Conversation |
| Bulan | Month picker | Must be a valid month. | Required when Mode is Bar | Ticket and Conversation |
| Rentang Tanggal | Date range picker | Start date must be on or before end date. | Required when Mode is Trend | Ticket and Conversation |
| Rentang Tanggal max length | System rule | Must be 90 days or less. | Enforced | Ticket and Conversation |
| Page navigation | Buttons | Disabled at first and last page. | N/A | Bar only |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | P95 page load under 2 seconds for 20 cards with cached aggregates. |
| Availability | Analytics queries must degrade per-card and not block entire page. |
| Security | Enforce RBAC on page access and query scope. |
| Privacy | Do not expose entity identifiers in UI. Only show aggregated counts. |
| Observability | Log filter usage and query latency by entity type and mode. |
| Accessibility | Keyboard navigable filters and buttons. Visible focus states. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Reportable flag on custom field definitions | Product | Without it, page can be noisy and unusable. | Default reportable OFF and require Admin enable. |
| High event volume | Engineering | Real time queries can be slow. | Use daily aggregate table for queries. |
| Option identity mismatch | Engineering | Counts become wrong if label used. | Store stable option ID in events and aggregates. |
| Supervisor scope leakage | Engineering | Data exposure across teams. | Enforce Team Inbox scoping at query level. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Adoption of reportable dropdown fields | 30% of active tenants enable at least 1 reportable dropdown field | 30 days | Admin settings logs |
| Weekly active usage of analytics page | 20% of Admin and Supervisor users view page weekly | 30 days | Page view analytics |
| Query performance | P95 under 2 seconds | 30 days | Server metrics |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Export CSV | Common request for sharing and offline analysis. |
| Drilldown to entity list | Helps operational follow up from a spike. |
| Additional dimensions | Channel, assignee, and tag intersections. |
| Multi-select dropdown | If introduced later, needs different counting semantics. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Dropdown only, single-select only | Other field types remain not analyzable. |
| Trend limited to top 6 options plus Others | Not all options are visible in trend lines. |
| No export and no drilldown | Insights remain high level only. |

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Query Semantics | Counts represent field update events, not current state snapshots. |
| Data Model Summary | Store events with stable option identity and aggregate by day to serve Bar and Trend efficiently. |

**Ref**: [https://chatgpt.com/canvas/shared/697342fd27ec81919d9041cc6d9a79c9](https://chatgpt.com/canvas/shared/697342fd27ec81919d9041cc6d9a79c9) 