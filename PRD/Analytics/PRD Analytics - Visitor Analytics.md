# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Analytics - Visitor Analytics  
**Product Manager**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: TBD

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-06-19 | Hermes | Initial mini PRD for Visitor Analytics section, company-scoped GA4-backed monthly visitor summary. |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a simple internal analytics section inside SatuInbox so company stakeholders can see monthly visitor performance without opening GA4 directly. |
| Scope | Phase 1 covers a new analytics section named `Visitor Analytics`, company-scoped metric retrieval from GA4, summary KPI cards, error states, and backend integration through SatuInbox analytics APIs. |
| Key Capabilities | Show Monthly Visitors, optionally show Monthly Active Users, resolve company-to-GA source mapping, and render safe internal analytics cards from server-side GA4 data retrieval. |
| Outcome | Faster company-level visibility of visitor traffic in the existing SatuInbox analytics shell with consistent access control and without exposing GA credentials to the browser. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| New analytics section `Visitor Analytics` under existing Analytics page. | Building a full custom GA dashboard with many charts and dimensions in Phase 1. |
| Company-scoped Monthly Visitors KPI. | Cross-company comparison view. |
| Company-scoped Monthly Active Users KPI if feasible in the same release. | In-app GA property setup wizard or admin UI in Phase 1. |
| Server-side fetch from GA4 Data API through internal SatuInbox backend. | Direct browser calls to Google Analytics reporting APIs. |
| Config-missing, empty, loading, and fetch-error states. | Raw visitor list, user-level drill-down, or personally identifiable visitor data. |
| Optional previous-month comparison badge if data contract is ready. | Arbitrary custom date range, team filter, agent filter, or source/device breakdown in Phase 1. |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Company stakeholders must leave SatuInbox and open GA4 separately to understand visitor performance. | Analytics workflow becomes fragmented and slower. |
| PS-002 | Existing SatuInbox analytics pages focus on conversation, ticket, responsiveness, member performance, broadcast, and offline reporting, but do not show website/widget visitor metrics. | Product and operational teams lack one internal place to monitor traffic-level adoption signals. |
| PS-003 | A simple FE tag installation does not make visitor metrics available inside the SatuInbox analytics shell. | The feature can look implemented technically while remaining unusable from the product surface. |
| PS-004 | Company-scoped visitor reporting can leak or mislead if metric semantics, source mapping, and permissions are not explicit. | Wrong decisions, privacy risk, and cross-company data confusion. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Make company-level visitor performance visible inside SatuInbox. | 90% of target stakeholders can read Monthly Visitors for their company without opening GA4 directly within 30 days of release. |
| Keep metric semantics simple and non-ambiguous. | 100% of KPI labels and tooltips explicitly distinguish Visitors and Active Users without using ambiguous terms like "MUV" alone. |
| Protect credentials and company data boundaries. | 0 browser-exposed GA reporting credentials and 0 cross-company data leakage incidents after release. |
| Keep Phase 1 small and shippable. | Visitor Analytics launches with summary cards only and no blocking dependency on custom dashboard builder work. |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a company-level analytics user, I want to see a new `Visitor Analytics` section in Analytics so that I can access visitor KPIs inside SatuInbox. | 1. Given I have access to company-level analytics, When I open the Analytics page, Then I see a menu item labeled `Visitor Analytics`. 2. Given I click `Visitor Analytics`, When the section loads, Then I see the Visitor Analytics summary area without leaving SatuInbox. 3. Given the feature flag is disabled, When I open Analytics, Then the `Visitor Analytics` menu item is hidden. |
| US-002 | P0 | As a company-level analytics user, I want to see Monthly Visitors for my current company so that I can monitor unique visitor performance. | 1. Given my company has a valid GA mapping, When Visitor Analytics loads, Then I see a KPI card `Monthly Visitors`. 2. Given the current month has data, When the KPI renders, Then the value reflects the configured GA4 metric mapping for the authenticated company only. 3. Given no data exists for the current month, When the section loads, Then the KPI card shows `0` with a valid empty-state explanation. |
| US-003 | P1 | As a company-level analytics user, I want to see Monthly Active Users if available so that I can compare reach and engagement. | 1. Given the backend data contract includes Active Users, When Visitor Analytics loads, Then I see a KPI card `Monthly Active Users`. 2. Given Active Users is not enabled in the first release, When the section loads, Then the card is hidden or marked unavailable without breaking Monthly Visitors. |
| US-004 | P0 | As a company-level analytics user, I want data to be scoped to my current company so that I do not see another company's traffic. | 1. Given I am authenticated under company A, When Visitor Analytics loads, Then all KPI values are derived only from company A's configured GA mapping. 2. Given company A has no mapping configured, When the section loads, Then I see a non-destructive configuration-missing state instead of fallback data from another company. |
| US-005 | P0 | As a secure system, I want Visitor Analytics report reads to happen through backend services so that GA credentials are never exposed in FE. | 1. Given the browser loads Visitor Analytics, When the data request is made, Then the FE calls a SatuInbox internal analytics endpoint only. 2. Given the backend fetches GA data, When the request completes, Then no GA credential is returned to FE. |
| US-006 | P1 | As a company-level analytics user, I want a clear error or freshness state so that I know whether the data is available and current. | 1. Given GA data fetch fails, When the section loads, Then the section shows an error state with retry behavior. 2. Given data is returned from cache or recent fetch, When the section renders, Then optional `lastUpdatedAt` can be shown if available. |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Section and Navigation | FR-001 [P0]: System MUST add a new analytics section key `visitor-analytics` to the existing analytics shell. FR-002 [P0]: System MUST show a sidebar menu item labeled `Visitor Analytics` when the feature is enabled. FR-003 [P0]: System MUST render Visitor Analytics inside the existing Analytics page instead of redirecting users to an external GA page. |
| Access and Scope | FR-004 [P0]: System MUST scope Visitor Analytics by authenticated `companyId`. FR-005 [P0]: System MUST allow access only to roles or permission scopes that are allowed to view company-level analytics. FR-006 [P0]: Users with self-only or team-only analytics scope MUST NOT see company-wide Visitor Analytics in Phase 1. FR-007 [P0]: Phase 1 MUST NOT provide a company switcher or cross-company compare mode. |
| Metric Definitions | FR-008 [P0]: `Monthly Visitors` MUST map to GA4 Users / Total Users for the configured company source, not Sessions. FR-009 [P1]: `Monthly Active Users` SHOULD map to GA4 Active Users for the configured company source. FR-010 [P0]: The UI MUST use explicit KPI labels `Monthly Visitors` and `Monthly Active Users` and MUST NOT show `MUV` as the only visible label. |
| Period Rules | FR-011 [P0]: Phase 1 MUST use a monthly summary period. FR-012 [P0]: Default period MUST be the current calendar month in the company workspace timezone unless Product later changes the period rule. FR-013 [P1]: System MAY include previous-month comparison if the backend response provides it. FR-014 [P0]: Phase 1 MUST NOT expose arbitrary custom date range filters. |
| Company Source Mapping | FR-015 [P0]: System MUST resolve the authenticated company to a configured GA4 property or equivalent reporting source before fetching data. FR-016 [P0]: If no company mapping exists, System MUST return a configuration-missing response and MUST NOT substitute another company's data. FR-017 [P1]: A company MAY map to more than one tracked source only if the aggregation rule is explicitly configured server-side. |
| Backend Reporting Path | FR-018 [P0]: FE MUST fetch Visitor Analytics data from a SatuInbox internal analytics endpoint only. FR-019 [P0]: API Gateway MUST proxy the request to `analytics-service` through the standard internal analytics architecture. FR-020 [P0]: `analytics-service` MUST retrieve visitor metrics from GA4 through a server-side reporting integration. FR-021 [P0]: Browser clients MUST NOT call GA4 Data API directly. |
| KPI Response Contract | FR-022 [P0]: The Visitor Analytics summary response MUST include `monthlyVisitors`. FR-023 [P1]: The response SHOULD include `monthlyActiveUsers` when enabled. FR-024 [P1]: The response MAY include `periodStart`, `periodEnd`, `comparisonPreviousMonth`, and `lastUpdatedAt`. FR-025 [P0]: KPI values MUST be integers and MUST be company-scoped. |
| UI States | FR-026 [P0]: System MUST show loading state while Visitor Analytics data is being fetched. FR-027 [P0]: System MUST show empty state when the company has no data for the selected month. FR-028 [P0]: System MUST show an error state with retry action when the internal endpoint fails. FR-029 [P0]: System MUST show a configuration-missing state when no GA mapping exists for the company. |
| Tracking Collection Path | FR-030 [P0]: Phase 1 implementation MUST define the tracked surface set that contributes to company Visitor Analytics. FR-031 [P0]: The tracked surface set MUST be configured per company and MUST NOT silently include internal dashboard traffic unless explicitly approved. FR-032 [P0]: Events sent to GA4 for this feature MUST NOT include email, phone, full name, contact name, message body, token, or other PII. |
| Non-Side Effects | FR-033 [P0]: Visitor Analytics MUST NOT change existing Conversation, Ticket, Responsiveness, Member Performance, Broadcast, or Offline Report calculations. FR-034 [P0]: Visitor Analytics MUST NOT require users to edit GA configuration from the analytics page in Phase 1. |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block access to the section and do not fetch data. | Show `Akses ditolak` or hide the menu item according to analytics-shell behavior. |
| EH-002 | Configuration missing | Return explicit no-mapping state for the authenticated company. | Show `Belum dikonfigurasi` with helper copy that the company analytics source is not ready. |
| EH-003 | Internal API failure | Return safe error state without exposing backend or GA internals. | Show `Gagal memuat Visitor Analytics` and button `Coba lagi`. |
| EH-004 | GA upstream failure | Backend MUST translate GA failure into stable internal error response. | FE shows component-level error state, not raw GA error text. |
| EH-005 | Partial metric availability | Return Monthly Visitors even if Monthly Active Users is unavailable, when safe to do so. | Hide or disable the unavailable KPI card without breaking the section. |
| EH-006 | Invalid company mapping | Treat as configuration error and stop rendering data. | Show `Konfigurasi sumber analytics tidak valid`. |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Company has no configured GA source. | Section returns configuration-missing state. | Show clear setup-needed message. |
| EC-002 | Company has valid GA source but zero traffic in current month. | KPIs show 0 without error. | Show empty-state helper text. |
| EC-003 | Monthly Active Users metric is not enabled in release 1. | Monthly Visitors still renders successfully. | Active Users card hidden or marked `Belum tersedia`. |
| EC-004 | Company mapping changes mid-month. | New fetches use the latest valid mapping; no cross-company fallback is allowed. | Optional tooltip may note data source update if implemented later. |
| EC-005 | Current day data is partial. | Monthly KPIs show current available month-to-date values. | Optional note: `Data bulan berjalan dapat berubah`. |
| EC-006 | Company uses multiple tracked public surfaces. | Aggregation is allowed only when server-side mapping explicitly defines how the sources are combined. | No FE-specific change required. |
| EC-007 | Feature flag enabled but backend endpoint unavailable. | Section shows recoverable error state. | Retry button available. |

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Sidebar menu | New menu item labeled `Visitor Analytics`. | User opens Analytics and selects the new section. | US-001 |
| Section header | Header title `Visitor Analytics` with short description about company visitor performance. | User lands on section and immediately understands page purpose. | US-001 |
| KPI Card - Monthly Visitors | Primary KPI card. | User reads the main monthly visitor value first. | US-002 |
| KPI Card - Monthly Active Users | Secondary KPI card when enabled. | User compares engagement against total monthly visitors. | US-003 |
| Comparison badge (optional) | Previous-month delta or status chip when backend supports it. | User quickly sees change versus prior month. | US-006 |
| Loading state | Skeleton cards or loader placeholders. | Shown before data is available. | US-001, US-006 |
| Empty state | Zero-value cards and explanatory empty helper text. | Shown when data is valid but absent. | US-002 |
| Error state | Error message and retry action. | User retries failed fetch. | US-006 |
| Configuration-missing state | Non-destructive setup-needed state. | User learns the company source is not configured. | US-004 |

**UI Copy Notes (Bahasa Indonesia):**
- Section title: `Visitor Analytics`
- Primary KPI label: `Monthly Visitors`
- Secondary KPI label: `Monthly Active Users`
- Error CTA: `Coba lagi`
- Config missing title: `Belum dikonfigurasi`
- Empty helper: `Belum ada data visitor untuk bulan ini`

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| companyId | Derived string | `cmp_123` | Derived from authenticated tenant context. Must not be client-overridden in Phase 1. | Derived | Current authenticated company |
| section key | Enum | `visitor-analytics` | Must match allowed analytics section key list. | Yes | None |
| monthlyVisitors | Integer | `15432` | Non-negative integer. Derived from GA4 Users / Total Users. | Yes | `0` |
| monthlyActiveUsers | Integer | `8291` | Non-negative integer. Derived from GA4 Active Users when enabled. | No | Hidden or `0` depending on response contract |
| periodStart | Date string | `2026-06-01` | Must represent the first date of the monthly summary period. | Conditional | Current month start |
| periodEnd | Date string | `2026-06-30` | Must represent the last date of the summary period or current date for month-to-date. | Conditional | Current date or month end |
| comparisonPreviousMonth | Object | `{ delta: 1200, percent: 8.4 }` | Optional. Must be derived from previous full month or defined comparison period. | No | Omitted |
| lastUpdatedAt | ISO8601 string | `2026-06-19T10:05:00+07:00` | Optional. Must come from backend fetch or cache metadata. | No | Omitted |
| company GA mapping | Backend config | `companyId -> gaPropertyId` | Must exist and be valid before data fetch. Not editable from FE in Phase 1. | Yes | None |

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Visitor Analytics summary SHOULD load within 3 seconds under normal conditions when the company mapping is valid and the response is served from cache or a standard upstream fetch path. |
| Reliability | Backend SHOULD support retry-safe GA fetch behavior and MUST fail safely without leaking credentials. |
| Security | GA reporting credentials MUST remain server-side only. Company scoping MUST use authenticated tenant context. |
| Privacy | No PII may be sent to GA4 or displayed in Visitor Analytics. Only aggregated company-level metrics are shown. |
| Observability | System MUST log fetch success/failure, mapping resolution outcome, and upstream latency for Visitor Analytics requests. |
| Availability | Visitor Analytics read path SHOULD meet the same baseline availability target as other analytics read endpoints when the upstream GA service is healthy. |
| Localization | User-facing helper text and error states SHOULD use Bahasa Indonesia consistent with the analytics shell. |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Valid company-to-GA source mapping | Product / Engineering / Ops | No mapping means no data for the company. | Introduce explicit configuration state and release checklist. |
| Server-side access to GA4 Data API | Engineering | Section cannot read GA metrics. | Build backend-only connector and verify credentials pre-release. |
| Tracked public surface implementation | Engineering / Product | KPI values can be misleading if wrong surfaces are included. | Lock tracked surface definition before implementation. |
| Metric semantics drift | Product | Visitors may be confused with Sessions. | Lock KPI glossary in PRD and tooltip copy. |
| Upstream GA quota or latency | Engineering / Ops | Slow or failing Visitor Analytics responses. | Add caching, timeout policy, and fallback UI. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Visitor Analytics usage | 60% of eligible company-level analytics users open Visitor Analytics at least once per week. | 30 days after release | Product analytics event `visitor_analytics_viewed` |
| Data correctness | 99% match between sampled SatuInbox Visitor Analytics summaries and sampled GA4 source reports for the same company and month. | First 2 weeks | QA validation and audit sample |
| Error rate | Less than 2% failed Visitor Analytics summary fetches for mapped companies. | First 30 days | Backend monitoring |
| Stakeholder self-service | 80% of target users report they no longer need to open GA4 for monthly visitor checks. | 30 days | PM interview / ops feedback |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Trend chart by day within month | Helps users understand which dates drive changes in monthly visitor totals. |
| Previous-month comparison card set | Improves quick month-over-month interpretation. |
| Source or domain breakdown | Useful when one company has multiple tracked domains or surfaces. |
| Date range filter | Enables historical exploration after the Phase 1 summary view proves useful. |
| Admin mapping UI | Reduces manual Engineering/Ops dependency for company GA source setup. |

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Phase 1 is summary-only. | Users cannot drill down into visitor trends or segments yet. |
| No cross-company comparison. | Multi-company operators cannot compare companies from this section in Phase 1. |
| Monthly Active Users is optional in the first implementation pass. | Some releases may ship with Monthly Visitors only. |
| No in-app mapping UI in Phase 1. | Company setup depends on backend/config workflow. |

## **16. Appendix**

| Item | Notes |
| ----- | ----- |
| Glossary | `Monthly Visitors` = company-scoped monthly unique visitors/users from GA4 Users / Total Users. `Monthly Active Users` = company-scoped monthly engaged users from GA4 Active Users. |
| Assumptions | Company-level reporting is more important than team-level reporting for this feature. Phase 1 uses monthly summary scope only. |
| Open Questions | Which tracked surfaces count for Visitor Analytics? Is previous-month comparison in scope for v1.0? Should Active Users ship in the same release or follow immediately after? Can one company intentionally aggregate multiple GA sources in Phase 1? |
| References | `Assessments/cross-domain/ga4-monthly-user-visit/ga4-monthly-user-visit-qa-assessment.md`, `PRD/Analytics/PRD Analytics - Ticket.md`, `PRD/Analytics/PRD Analytics - member responsive.md` |

## **17. Permission Matrix**

| Role / Permission Scope | View | Notes |
| ----- | ----- | ----- |
| Company-wide analytics access | Allowed | Can view Visitor Analytics for the authenticated company. |
| Team-only analytics scope | Denied in Phase 1 | Company-wide visitor totals exceed team scope. |
| Self-only analytics scope | Denied in Phase 1 | Company-wide visitor totals exceed self scope. |
| Unauthorized role | Denied | Hidden or blocked according to analytics shell permission behavior. |

## **18. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| FE summary fetch | `GET /analytics/visitor/summary` | FE Analytics Page | API Gateway | Authenticated request, no client company override in Phase 1 | `monthlyVisitors`, optional `monthlyActiveUsers`, optional `periodStart`, `periodEnd`, `comparisonPreviousMonth`, `lastUpdatedAt` | `visitor_analytics_forbidden`, `visitor_analytics_not_configured`, `visitor_analytics_unavailable` | New route only. Must not change existing analytics routes. |
| Internal analytics RPC | `GetVisitorAnalyticsSummary` | API Gateway | analytics-service | `companyContext`, period metadata | Normalized company summary payload | internal mapped errors | New gRPC contract or service extension required. |
| Optional product event | `visitor_analytics_viewed` | FE Analytics Page | Product analytics pipeline | `companyId`, `sectionKey`, timestamp | best-effort | n/a | Optional observability/product event only. |

## **19. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| Company mapping | Prepare backend config for target companies before enabling feature flag. | Engineering / Ops | Verify every enabled company resolves to valid GA source. | Remove mapping or disable feature flag. |
| Feature flag | Release behind a dedicated Visitor Analytics flag. | Product / Engineering | Enable for internal test tenants first. | Disable flag and hide section. |
| Tracking layer | Add GA4 collection path only for approved surfaces. | Engineering | Validate events in GA DebugView / equivalent. | Disable tracking config for the surface. |
| Read layer | Enable backend summary endpoint after mapping and credential validation pass. | Engineering | Compare sampled output against GA4 source for enabled companies. | Return feature unavailable state and disable FE entry. |

## **20. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Company GA mapping config | Engineering / Ops | Internal config workflow | Until changed or decommissioned | Replace on config update; keep audit trail if available | Not user-exportable in Phase 1 | Contains source identifiers, not visitor PII |
| Visitor Analytics summary cache | analytics-service | Backend fetch process | Short-lived cache window per infra policy | Safe to refresh/expire automatically | Not directly user-exportable | Aggregated metrics only |
| Visitor Analytics UI payload | FE session | Internal analytics API | Session-lifetime UI state | Re-fetched on demand | Not exportable in Phase 1 | Aggregated metrics only |

## **21. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Product Event | `visitor_analytics_viewed` | User opens Visitor Analytics section | `companyId`, `viewerRoleScope`, `featureVersion` | Product / FE | Optional |
| Backend Metric | `visitor_analytics_fetch_success_total` | Successful summary fetch | `companyId`, `sourceType` | Engineering | Monitor trend |
| Backend Metric | `visitor_analytics_fetch_failure_total` | Failed summary fetch | `companyId`, `errorType` | Engineering | Alert if error rate > 2% |
| Backend Metric | `visitor_analytics_upstream_latency_ms` | GA upstream request completes | `companyId`, `sourceType` | Engineering | Alert on sustained high latency |
| Audit / Ops Signal | `visitor_analytics_mapping_resolved` | Company mapping resolution succeeds/fails | `companyId`, `mappingStatus` | Engineering / Ops | Investigate repeated failures |
