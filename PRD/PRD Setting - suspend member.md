# **us Product Requirement Document (PRD)**

**Feature:** Soft Suspend and Hard Suspend  
**Product Owner:** Aryo  
**Author**: Yusril Ibnu  
**Engineering Lead:** Naftal  
**Design Lead:** Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 06 Dec 2025 | Yusril Ibnu | Initial draft |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Define suspension behavior based on the isSuspend field so that unpaid tenants are warned first and then blocked from using Satuinbox. |
| Scope | Apply suspension rules to all authenticated web app pages and business APIs using a single tenant level suspension state from the database. |

### **2.1 Scope Details**

| In Scope | Out of Scope |
| ----- | ----- |
| Reading and enforcing isSuspend values per tenant. | Full billing system design and payment gateway integration. |
| Soft Suspend behavior, including warning banner and no feature restriction. | Customer facing emails or SMS reminders about billing. |
| Hard Suspend behavior, including dashboard lock and Billing and Invoice only access. | Any UI to change isSuspend status; Hard Suspend override is database only. |
| Role specific access for Admin, Supervisor, and Agent in suspended states. | Changes to existing role definitions and permission matrix outside suspension behavior. |
| Automatic Soft Suspend when subscription ends. | Complex billing grace period rules beyond a single subscription expired signal. |
| Notifications to internal Finance and Business teams via Google Chat when Soft Suspended. | Detailed configuration UI for notification channels and routing rules. |
| Standard error and edge case coverage for suspension state changes and enforcement. | Historical reporting and analytics dashboards for suspension events. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Tenants can continue to use Satuinbox after subscription expiry without any enforcement. | Revenue leakage and inconsistent enforcement of billing policies. |
| PS-002 | There is no clear and consistent user facing state when an account should be restricted. | Confusion for Admins and Agents, increased support tickets, and unclear responsibilities. |
| PS-003 | Internal Finance and Business teams are not notified when a tenant enters a risk state. | Delayed follow up on overdue payments and slower resolution of billing issues. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enforce billing compliance for all tenants. | One hundred percent of tenants with Hard Suspend cannot access any feature beyond Billing and Invoice. |
| Provide clear early warning before blocking access. | One hundred percent of tenants in Soft Suspend see a persistent warning banner on main pages. |
| Improve coordination between product and business. | One hundred percent of Soft Suspend events trigger a Google Chat notification to Finance and Business. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a System, I want to automatically move a tenant to Soft Suspend when the subscription ends so that there is a clear early warning step. | 1\. Given a tenant subscription has expired and there is no active renewal, When the billing system sends an expiry signal, Then the system sets isSuspend to 1 and marks the tenant as Soft Suspended. 2\. Given a tenant is already in Soft Suspend, When another expiry signal is received, Then the system does not create duplicate events and preserves the existing Soft Suspend state. 3\. Given a tenant subscription is still active, When no expiry signal is present, Then the system keeps isSuspend at 0 and the tenant remains Active. |
| US-002 | P0 | As an Admin, I want to keep using Satuinbox while seeing a clear billing warning in Soft Suspend so that I can act before the account is locked. | 1\. Given a tenant has isSuspend equal to 1 and the user is an Admin, When the Admin logs in, Then all main pages load as usual and a Soft Suspend banner is visible at the top of the layout. 2\. Given a tenant has isSuspend equal to 1, When the Admin navigates between dashboard, inbox, ticket, and settings pages, Then the banner remains visible without needing manual refresh. 3\. Given a tenant has isSuspend equal to 0, When the Admin logs in, Then no Soft Suspend banner is shown on any page. |
| US-003 | P0 | As an Internal Finance, Mas Aryo and internal member, I want to receive a Google Chat notification when a tenant enters Soft Suspend so that I can follow up on payment. | 1\. Given a tenant is in Active state with isSuspend equal to 0, When the system changes isSuspend from 0 to 1, Then a notification message is sent to the configured Finance Google Chat room. 2\. Given a tenant is already in Soft Suspend with isSuspend equal to 1, When the system receives a duplicate 0 to 1 transition request, Then no duplicate Google Chat notification is sent for the same transition. 3\. Given the Google Chat configuration is missing or invalid, When a Soft Suspend transition occurs, Then the system logs the failure and marks the notification as failed without blocking the suspension. |
| US-005 | P0 | As an Admin in Hard Suspend, I want to only access the Billing and Invoice page so that I can resolve payment but not use other features. | 1\. Given a tenant has isSuspend equal to 2 and the user is an Admin, When the Admin logs in, Then the system redirects the Admin to the Billing and Invoice page as the only accessible feature. 2\. Given a tenant has isSuspend equal to 2 and the user is an Admin, When the Admin tries to navigate to any non Billing and Invoice page, Then the system redirects back to the Billing and Invoice page and does not show underlying content. 3\. Given a tenant has isSuspend equal to 0 or 1 and the user is an Admin, When the Admin opens Billing and Invoice, Then the page behaves normally without forced redirection. |
| US-006 | P0 | As an Agent in Hard Suspend, I want to see a clear message telling me to contact the Admin so that I know why I cannot work. | 1\. Given a tenant has isSuspend equal to 2 and the user is an Agent, When the Agent logs in, Then a full screen message is shown stating "Akun perusahaan Anda sedang ditangguhkan. Silakan hubungi Admin untuk menyelesaikan pembayaran." and no other content is visible. 2\. Given a tenant has isSuspend equal to 2 and the user is an Agent, When the Agent attempts to access any page via direct URL, Then the same full screen message is shown and access to all features is blocked. 3\. Given a tenant has isSuspend equal to 0 or 1 and the user is an Agent, When the Agent logs in, Then no Hard Suspend message is displayed and normal navigation is allowed. |
| US-007 | P0 | As a Supervisor in Hard Suspend, I want to see the same blocking message as Agents so that my experience is consistent. | 1\. Given a tenant has isSuspend equal to 2 and the user is a Supervisor, When the Supervisor logs in, Then the same full screen message as Agents is shown and no access to features is allowed. 2\. Given a tenant has isSuspend equal to 2, When the Supervisor tries to open Billing and Invoice directly, Then the system blocks access and shows the same Hard Suspend message because only Admins can access Billing and Invoice. 3\. Given a tenant has isSuspend equal to 0 or 1 and the user is a Supervisor, When the Supervisor logs in, Then normal access rules apply without Hard Suspend restrictions. |
| US-008 | P0 | As a System, I want to enforce all API and page access based on isSuspend so that suspension rules are consistent and central. | 1\. Given an authenticated request is made for a protected resource, When the system loads the tenant isSuspend value, Then it applies the correct state rules for Active, Soft Suspend, or Hard Suspend before returning content. 2\. Given a tenant has isSuspend equal to 2 and the request is for a business API, When the request is processed, Then the system returns a 403 style error and does not process any business logic. 3\. Given a tenant has an invalid isSuspend value, When any request is made, Then the system treats it as an error, logs the issue, and denies access with a generic error message. |
| US-009 | P1 | As an Internal Operations user, I want Hard Suspend to be overridden only through direct database change so that it is tightly controlled. | 1\. Given a tenant is in Hard Suspend with isSuspend equal to 2, When an internal operator uses a database tool to change isSuspend to 0 or 1, Then the system honors the new value on the next request and removes Hard Suspend behavior accordingly. 2\. Given a tenant is in Hard Suspend, When a user tries to change suspension status through the product UI, Then there is no visible control to change isSuspend and the status remains unchanged. 3\. Given a tenant is not in Hard Suspend, When a database change sets isSuspend to 2, Then Hard Suspend rules start applying from the next request. |
| US-010 | P1 | As an Admin, I want suspension to clear automatically when payment is confirmed so that I can resume work without manual intervention. | 1\. Given a tenant is in Soft Suspend or Hard Suspend, When the billing system sends a payment confirmed signal that the subscription is now active, Then the system sets isSuspend to 0 and returns the tenant to Active status. 2\. Given a tenant is already Active with isSuspend equal to 0, When a payment confirmed signal is received, Then the system keeps isSuspend at 0 and only logs the event. 3\. Given the billing system sends conflicting signals, When the subscription status cannot be resolved, Then the system keeps the current isSuspend value, logs the conflict, and does not flip states until a valid signal is available. |

---

## **6\. Functional Requirements**

| ID | Category | Requirement |
| ----- | ----- | ----- |
| FR-001 | Suspension State Model | System MUST store a per tenant suspension state using an integer field named isSuspend with allowed values 0, 1, and 2 where 0 means Active, 1 means Soft Suspend, and 2 means Hard Suspend. |
| FR-002 | State Evaluation | System MUST evaluate the tenant isSuspend value before serving any authenticated page or business API response. |
| FR-003 | Active Behavior | System MUST treat isSuspend equal to 0 as fully Active and MUST NOT show any suspension related banners or lock screens. |
| FR-004 | Auto Soft Suspend Trigger | System MUST set isSuspend from 0 to 1 when it receives a valid subscription expired event from the billing source for that tenant and no active subscription is detected. |
| FR-005 | Auto Reactivate Trigger | System MUST set isSuspend to 0 when it receives a valid payment confirmed or subscription activated event from the billing source for that tenant. |
| FR-006 | Duplicate Transition Handling | System MUST ignore duplicate state changes that request a transition from 1 to 1 or from 2 to 2 and MUST still log that the request was received. |
| FR-007 | Soft Suspend Access | System MUST allow all existing features, pages, and APIs to remain accessible for tenants with isSuspend equal to 1, subject to existing role permissions, without additional functional restrictions. |
| FR-008 | Soft Suspend Banner | System MUST display a persistent banner at the top of the authenticated layout for all roles when isSuspend equals 1 with the message "Tagihan Anda telah jatuh tempo. Silakan selesaikan pembayaran agar layanan Satuinbox tetap aktif." in Bahasa Indonesia. |
| FR-009 | Banner Scope | System MUST show the Soft Suspend banner on all core pages including dashboard, inbox, tickets, and settings for all roles whenever isSuspend equals 1\. |
| FR-010 | Banner Dismissal | System MUST NOT allow the Soft Suspend banner to be permanently dismissed by any user; closing or hiding it should be temporary for that view at most and MUST reappear on future navigation while isSuspend equals 1\. |
| FR-011 | Finance Notification | System MUST send a structured notification message to the configured Finance Google Chat target when isSuspend changes from 0 to 1 for any tenant. |
| FR-012 | Business Notification | System MUST send a structured notification message to the configured Business Google Chat target when isSuspend changes from 0 to 1 for any tenant. |
| FR-013 | Notification Payload | System MUST include at minimum the tenant name, tenant identifier, previous isSuspend value, new isSuspend value, and timestamp in each Google Chat notification payload. |
| FR-014 | Notification Failure Handling | System MUST log any notification failure including target, payload, and error and MUST retry a configurable number of times before giving up. |
| FR-015 | Hard Suspend Access Model | System MUST treat isSuspend equal to 2 as Hard Suspend and MUST prevent access to all application features except the Billing and Invoice page for Admins. |
| FR-016 | Hard Suspend Admin Routing | System MUST redirect Admin users in Hard Suspend to the Billing and Invoice page whenever they attempt to access any other authenticated page. |
| FR-017 | Hard Suspend Admin Billing | System MUST allow Admin users in Hard Suspend to view and interact with the Billing and Invoice page so that payment can be completed. |
| FR-018 | Hard Suspend Agent Block | System MUST block Agent users in Hard Suspend from all pages and MUST show a full screen message "Akun perusahaan Anda sedang ditangguhkan. Silakan hubungi Admin untuk menyelesaikan pembayaran." in Bahasa Indonesia. |
| FR-019 | Hard Suspend Supervisor Block | System MUST block Supervisor users in Hard Suspend from all pages and MUST show the same full screen message as Agents. |
| FR-020 | Hard Suspend Billing Access | System MUST prevent Agent and Supervisor users from accessing Billing and Invoice pages in all states including Hard Suspend. |
| FR-021 | Login Behavior | System MUST allow login for all roles in all states and apply suspension rules after authentication during routing and page access. |
| FR-022 | API Restriction | System MUST deny all business API calls for tenants in Hard Suspend by returning an appropriate 403 style error response that clearly indicates the account is suspended. |
| FR-023 | API Allow Billing | System MUST allow necessary billing related API calls for Admin users in Hard Suspend when those calls are required to display and process Billing and Invoice actions. |
| FR-024 | Invalid isSuspend Handling | System MUST treat any isSuspend value outside 0, 1, or 2 as an invalid configuration, deny protected requests with a safe error, and log the event for investigation. |
| FR-025 | DB Only Hard Override | System MUST NOT expose any user interface, settings page, or API endpoint that changes isSuspend to or from 2; Hard Suspend overrides MUST only occur as direct database updates by internal operations. |
| FR-026 | State Read Freshness | System MUST read the latest isSuspend value for each tenant in a way that avoids stale caching so that state changes take effect on the next user interaction. |
| FR-027 | Audit Logging | System MUST log every change to isSuspend including old value, new value, source of change, and timestamp in an auditable log store. |
| FR-028 | Multi Session Consistency | System MUST ensure that changes to isSuspend apply consistently across multiple sessions and browser tabs by checking the current value for each sensitive request. |
| FR-029 | Role Awareness | System MUST use the existing role classification of Admin, Supervisor, and Agent when applying suspension behavior and MUST treat unknown roles as least privileged for safety. |
| FR-030 | Error Messages | System MUST display all user facing suspension related messages in Bahasa Indonesia and all internal descriptions in English. |
| FR-031 | Subscription Event Source | System MUST accept subscription expiry and activation signals from a single defined billing source to avoid conflicting inputs.  |
| FR-032 | Configurability | System SHOULD allow configuration of Google Chat targets and Billing and Invoice URL through environment or admin level configuration rather than code changes. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI or UX Message (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Hard Suspend API call | System returns a 403 style response and logs the blocked operation with tenant and user identifiers. | "Akun Anda sedang ditangguhkan. Silakan hubungi Admin untuk menyelesaikan pembayaran." |
| EH-002 | Invalid isSuspend value | System denies access to protected resources, falls back to a safe generic error, and logs the invalid state for internal follow up. | "Terjadi kesalahan pada status akun. Silakan hubungi tim dukungan." |
| EH-003 | Missing Billing and Invoice page | System logs the routing error and shows a blocking page to Admin explaining that billing cannot be loaded and that support should be contacted. | "Halaman Billing dan Invoice tidak dapat dimuat. Silakan hubungi tim dukungan." |
| EH-004 | Google Chat notification failure | System retries sending a limited number of times. If all retries fail, it logs the failure and continues the Soft Suspend transition without blocking the user experience. | No user facing message; behavior is internal only. |
| EH-005 | Billing signal conflict | System keeps the current isSuspend value, logs all conflicting signals, and marks the tenant for manual review instead of flipping between states. | No immediate user facing message; standard state behavior continues. |
| EH-006 | Unauthorized role or missing role | System treats the user as a least privileged agent and applies the strictest Hard Suspend behavior, blocking access and showing the standard suspension message. | "Akun perusahaan Anda sedang ditangguhkan. Silakan hubungi Admin untuk menyelesaikan pembayaran." |
| EH-007 | Suspension state read failure | System shows a generic error page when it cannot read isSuspend and logs the failure, instructing the user to retry later. | "Kami tidak dapat memuat data akun Anda. Silakan coba beberapa saat lagi." |
| EH-008 | Session timeout during suspended state | System redirects the user to the login page with a standard session timeout message and reapplies suspension rules after re authentication. | "Sesi Anda telah berakhir. Silakan masuk kembali." |
| EH-009 | Attempt to modify isSuspend via UI | System blocks any attempt to change isSuspend through product UI or public API and logs the attempt as denied. | "Perubahan status akun tidak diizinkan melalui halaman ini." |
| EH-010 | Multiple concurrent requests during change | System handles requests sequentially or idempotently, ensuring that only valid latest state is applied and any failed request shows a safe generic error without partial state. | "Terjadi gangguan sementara. Silakan coba kembali." |

---

## **8\. Edge Cases**

| ID | Scenario | Handling |
| ----- | ----- | ----- |
| EC-001 | Tenant state changes while user is actively using the app | System applies the new isSuspend value on the next page load or API call and redirects or shows banners according to the new state without requiring explicit re login. |
| EC-002 | User opens multiple tabs with different pages while Soft Suspend starts | System shows the Soft Suspend banner on any tab that makes a request after the state change and ensures that no tab can hide the global state for that tenant. |
| EC-003 | User opens multiple tabs while Hard Suspend starts | System redirects or blocks each tab as soon as it performs a new request and ensures there is no tab that can still operate as Active. |
| EC-004 | Role changes for a user while tenant is suspended | System applies the current isSuspend rules based on the latest role at the time of request so that a new Admin or Agent sees the correct experience. |
| EC-005 | Billing and Invoice page fails to load third party payment components | System shows Billing and Invoice page shell with an inline error inside payment area and does not allow navigation to other app pages while in Hard Suspend. |
| EC-006 | Google Chat webhooks are temporarily down | System retries sending notifications on a schedule while logging each failure and does not block any tenant state changes due to notification outages. |
| EC-007 | isSuspend is updated to an unexpected value by mistake | System treats this as invalid configuration, denies access as described for invalid states, and requires internal correction in the database. |
| EC-008 | Tenant frequently flips between Soft and Hard Suspend | System always uses the latest isSuspend value and ensures user experience updates in line with each change while keeping an accurate audit trail. |
| EC-009 | Admin bookmarks a non Billing page URL during Hard Suspend and revisits the bookmarked URL | System still redirects to Billing and Invoice page and does not render the bookmarked content until the tenant is back to Active or Soft Suspend. |
| EC-010 | Tenant with Soft Suspend where billing data is delayed but user has already paid | System keeps state in Soft Suspend until a payment confirmed event arrives, but Admin can use all features while seeing the Soft banner, minimizing disruption. |

---

## **9\. UI and UX Requirements**

| ID | Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- | ----- |
| UI-001 | Soft Suspend Banner | A persistent warning banner shown at the top of the authenticated layout for tenants with isSuspend equal to 1\. | 1\. User logs in as Admin, Supervisor, or Agent while tenant is in Soft Suspend. 2\. System loads the main layout, then checks isSuspend. 3\. System renders a banner with text "Tagihan Anda telah jatuh tempo. Silakan selesaikan pembayaran agar layanan Satuinbox tetap aktif." and an optional informational icon. 4\. User continues to use the app with the banner visible on each main page. | US-002, US-008 |
| UI-002 | Hard Suspend Full Screen Block | A full screen blocking view for Agents and Supervisors in Hard Suspend showing a clear message and no navigation options. | 1\. Agent or Supervisor logs in while tenant is in Hard Suspend. 2\. System checks isSuspend equal to 2 and role not equal to Admin. 3\. System renders a full screen message "Akun perusahaan Anda sedang ditangguhkan. Silakan hubungi Admin untuk menyelesaikan pembayaran." with no primary action buttons. 4\. User cannot navigate to any other page. | US-006, US-007, US-008 |
| UI-003 | Hard Suspend Admin Billing Gateway | A restricted experience for Admins in Hard Suspend where only Billing and Invoice is accessible. | 1\. Admin logs in while tenant is in Hard Suspend. 2\. System checks isSuspend equal to 2 and role equal to Admin. 3\. System routes the Admin to Billing and Invoice page automatically. 4\. When Admin attempts to use navigation menu to open other areas, system routes back to Billing and Invoice page. 5\. Admin can see invoices and payment instructions only. | US-005, US-008 |
| UI-004 | 403 Style Error Page | A generic error page for invalid or blocked access due to invalid isSuspend or other safety reasons. | 1\. User calls a protected endpoint that results in an invalid state or unauthorized access. 2\. System returns an error response. 3\. Client renders an error page or toast with message in Bahasa such as "Akses tidak diizinkan." or the more specific suspension message. 4\. User can navigate back to a safe page or login screen. | US-008, EH-002 |
| UI-005 | Notification Payload Content | The structured text that appears inside internal Google Chat messages for Soft Suspend transitions. | 1\. Billing system triggers a change to Soft Suspend. 2\. System composes a message including tenant name, tenant identifier, previous and new suspension states, and timestamp in a concise text format. 3\. Message is sent to Finance and Business Google Chat channels using integration settings. 4\. Teams can click the tenant identifier reference to locate the account internally. | US-003, US-004 |
| UI-006 | Loading State During State Check | A minimal loading state for first page load while the system is checking isSuspend and role before deciding which layout or screen to show. | 1\. User opens Satuinbox and submits login credentials. 2\. System authenticates and starts to load tenant state. 3\. A brief loading indicator appears while suspension state and role are read. 4\. Once values are ready, system redirects to the correct page or lock screen and hides the loading indicator. | US-002, US-005, US-006 |
| UI-007 | Empty State For Billing Restricted | A simple message when a non Admin user attempts to access Billing and Invoice or when Billing is unavailable. | 1\. Agent or Supervisor manually enters Billing URL or follows an outdated link. 2\. System checks role and tenant state. 3\. System shows a blocking message stating that Billing is not available for the role and suggests contacting an Admin. 4\. No billing details are exposed. | US-006, US-007 |

---

## **10\. Field and Validation**

| Field Name | Location | Description | Allowed Values or Format | Validation Rules | Required |
| ----- | ----- | ----- | ----- | ----- | ----- |
| isSuspend | Tenant record | Suspension state for the tenant. | Integer 0, 1, or 2 | MUST be present for every tenant. MUST only store 0, 1, or 2\. Values outside this range MUST be treated as invalid state and must not be used as a normal state. | Yes |
| subscriptionStatusSignal | Billing integration | Incoming label that indicates whether the subscription is expired or active. | Enum such as EXPIRED or ACTIVE | MUST be mapped consistently to isSuspend transitions. \[NEEDS CLARIFICATION: exact enumeration and lifecycle rules from billing system.\] | Yes |
| billingAndInvoiceUrl | Configuration | URL of the Billing and Invoice page used for routing Admins in Hard Suspend. | Valid internal path or absolute URL | MUST be a valid reachable route. MUST be secured behind authentication and scoped to the tenant. | Yes |
| GogoleChatTarget | Configuration | Identifier or webhook URL for Finance Google Chat notification target. | Valid URL or channel identifier | MUST be a valid endpoint when feature is enabled. Invalid or missing values MUST be logged and SHOULD fail closed only for the notification, not for suspension. | Yes |
| suspensionChangedAt | Tenant record | Timestamp of the last time isSuspend was changed. | ISO 8601 timestamp | SHOULD be updated whenever isSuspend changes and used for auditing and troubleshooting. | No |
| userRole | User record | Role classification for a user such as Admin, Supervisor, or Agent. | Enum ADMIN, SUPERVISOR, AGENT | MUST be present and consistent for all authenticated users. Unknown roles MUST be treated as least privileged for suspension rules. | Yes |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Suspension state evaluation MUST add less than 100 milliseconds to request processing time under normal load. |
| Availability | Suspension checks MUST function during normal and degraded states so that no tenant bypasses restrictions while core services are operational. |
| Security | Suspension logic MUST be enforced on the server side and MUST NOT rely on client side checks for access control. |
| Reliability | Suspension state changes MUST be idempotent and safe to retry so that duplicated events do not cause inconsistent states. |
| Observability | All suspension state changes and blocked requests MUST be logged with enough context to reconstruct timelines for audits. |
| Privacy | Logs and internal notifications MUST not expose sensitive personal data beyond what is required to identify the tenant and state change. |

---

## **12\. Dependencies and Risks**

| ID | Dependency or Risk | Type | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| DR-001 | Billing subscription events | Dependency | Incorrect or delayed signals can lead to wrong suspension states. | Define a clear contract with billing source and monitor mismatches between billing status and isSuspend. |
| DR-002 | Google Chat integration | Dependency | Notification failures can cause Finance and Business teams to miss Soft Suspend events. | Implement retries and error monitoring, and provide a manual report for missed notifications. |
| DR-003 | Role management system | Dependency | Incorrect roles can cause wrong experience for Admins and Agents under suspension. | Align role data with a single source of truth and add automated tests that verify suspension behavior for each role. |
| DR-004 | Direct database access for Hard override | Risk | Misuse or mistakes in database edits can cause incorrect suspension states across tenants. | Limit database write access to a small internal operations group and ensure all changes are logged with user and reason. |
| DR-005 | Caching or replication delays | Risk | Users may see outdated suspension state for a short period after a change. | Minimize caching for isSuspend and ensure read after write consistency for suspension related fields. |

---

## **13\. Success Metrics**

| Metric | Target | Measurement Method |
| ----- | ----- | ----- |
| Percentage of Hard Suspended tenants correctly blocked | 100 percent | Compare logs of Hard Suspended tenants to access logs. |
| Percentage of Soft Suspended tenants seeing the banner | 100 percent | Frontend telemetry that tracks banner rendered events. |
| Percentage of Soft Suspend transitions with notifications | 100 percent | Count billing driven state changes versus sent notifications. |
| Time from subscription expiry to Soft Suspend state applied | Less than 5 minutes | Measure difference between billing event time and isSuspend change time. |

---

## **14\. Future Considerations**

| Idea | Description | Priority |
| ----- | ----- | ----- |
| Grace period configuration | Allow a configurable grace period between expiry and Soft Suspend. | P1 |
| Email reminders to tenant Admins | Send email reminders in addition to on product banners. | P1 |
| Self service suspension history view | Provide Admins with a timeline of suspension and payment events. | P2 |
| Granular module level suspension | Allow blocking only specific modules instead of the whole product in some scenarios. | P2 |

---

## **15\. Limitations**

| Limitation | Impact | Mitigation or Note |
| ----- | ----- | ----- |
| Single integer state for suspension | Cannot express more subtle states such as grace periods or partial restrictions. | Use Soft Suspend for warning and Hard Suspend for full block and consider more states in the future. |
| Hard override through database only | Requires technical operators and increases risk if used incorrectly. | Keep strong process and auditing for all database level overrides. |
| Dependence on external billing signals | Problems in billing integration can delay or mis align suspension. | Monitoring and manual reconciliation are required for critical tenants. |

---

## **16\. Appendix**

| Item | Description |
| ----- | ----- |
| Suspension State Map | 0 means Active, 1 means Soft Suspend with warning banner, 2 means Hard Suspend with access restrictions applied. |
| Role Behavior | Admin can access Billing and Invoice in Hard Suspend, Supervisor and Agent cannot access any feature in Hard. |
| Sample Flow 1 | Tenant subscription expires, billing sends expiry signal, system sets isSuspend to 1, banner appears, Google Chat notifications sent. |
| Sample Flow 2 | Tenant remains unpaid, internal ops set isSuspend to 2 in database, Admin is routed only to Billing and Invoice, Agents and Supervisors see Hard Suspend message. |
| Sample Flow 3 | Payment is completed, billing sends activation signal, system sets isSuspend to 0, all users return to normal behavior and banners disappear. |

