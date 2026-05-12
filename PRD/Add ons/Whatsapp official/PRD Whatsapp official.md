# **Product Requirement Document (PRD)**

**Feature**: WhatsApp Official API Connect – CRUD, Listing, Profile, General  
**Author**: Yusril Ibnu Maulana  
**Product Manager**: Aryo  
**Engineering Lead**: Naftal  
**Design Lead**: Resky  
**Version**: v1.3

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.3 | 2025-10-09 | Yusril Ibnu | Refocused scope to CRUD for Official WhatsApp API connections, status list, Edit Profile, and General settings. Clarified Verified/Not verified/Restricted flows, delete behaviors, and message template as shortcut only. Mapped all screens from the latest design: metrics cards, Accounts list \+ filters, Empty state, Precheck modal, OAuth page, Success toast, General tab, Edit WhatsApp Profile modal. |

---

## **2\. Overview**

| Field | Description |
| ----- | ----- |
| Purpose | Enable admins to Create, Read (list), Update (reconnect/disconnect, Edit Profile, settings), and Delete WhatsApp Business API numbers, with clear statuses and minimal friction. |
| In Scope | CRUD for connections (Connect, Reconnect, Disconnect, Remove); Accounts list with search \+ connection status filter \+ counters; General settings (identify existing users rule); Edit WhatsApp Profile modal; Meta OAuth precheck and outcomes; page banner for Not verified; Restricted handling; success/error toasts. |
| Out of Scope | Building/authoring templates in-app (we provide an external shortcut only); billing management; analytics dashboards. |
| Principles | Simple, fast, auditable; English UI strings; predictable status mapping; idempotent callbacks. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Connecting and managing multiple API numbers is scattered and error-prone. | Slow onboarding; higher support load. |
| PS-002 | Lack of clear statuses and guardrails for unverified or restricted businesses. | Failed connections; confusion. |
| PS-003 | Editing a WhatsApp profile requires context switching. | Outdated public info; extra steps. |

---

## **4\. Objectives and Key Results**

| ID | Objective | Key Result | Target |
| ----- | ----- | ----- | ----- |
| OKR-001 | Ship reliable CRUD for API connections | ≥95% successful connects and reconnects initiated from UI | Q4 2025 |
| OKR-002 | Improve fleet visibility | List p95 load ≤1 s; 100% accurate status badges | Q4 2025 |
| OKR-003 | Reduce context switching | ≥80% of profile edits done in-app | Q1 2026 |

---

## **5\. User Stories and Acceptance Criteria**

### **5.1 Create (Connect new number)**

| ID | Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I connect a new WhatsApp Business number. | 1\. Given the Accounts page, When I click **New account**, Then a **Precheck** modal shows my verification state and trial limits if applicable. 2\. Given **Verified**, When I click **Connect WhatsApp business number**, Then I am redirected to Meta OAuth; on return, the number appears in the list with **Connected** and a success toast. 3\. Given **Not verified**, When I tick “I understand trial limits apply” and I’m under the 2-number cap, Then I may proceed; if cap is reached, I am blocked with “Trial allows up to 2 phone numbers. Request verification to add more.” 4\. Given **Restricted** (business/number), When detected in precheck or callback, Then connection is blocked, row (if any) is set **Restricted**, and a help link is shown. |

### **5.2 Read (List, search, filter, counters)**

| ID | Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-002 | P0 | As an Admin, I view all numbers and statuses with fast filtering. | 1\. Given the Accounts tab, When page loads, Then I see metrics cards (Total accounts, Connected account, Not connected account, Total outbound), a search box, a Connection status filter, and a table with columns **Display Name**, **Phone Number**, **Connection status**. 2\. Given I type in search or change the filter, Then the table updates within 1 s; badges render **Connected**, **Not connected**, or **Restricted**. |

### **5.3 Update (Reconnect, Disconnect, Edit Profile, General)**

| ID | Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-003 | P0 | As an Admin, I reconnect a Not connected number. | 1\. Given a row with **Not connected**, When I choose **Connect**, Then the precheck+OAuth flow runs; on success the row shows **Connected** and a toast appears. |
| US-004 | P0 | As an Admin, I disconnect a Connected number. | 1\. Given **Connected**, When I select **Disconnect** and confirm, Then session is revoked best-effort, the status changes to **Not connected**, and audit log records the action. |
| US-005 | P0 | As an Admin, I edit a number’s WhatsApp Profile in-app. | 1\. Given **Connected**, When I click **Edit WhatsApp Profile**, Then a modal opens with fields: Profile Picture, Name, Category, About, Description (0/512), Email, Address, Website. 2\. Given valid input, When I click **Save**, Then the profile updates and I see a success toast; invalid input blocks save with inline errors. |
| US-006 | P2 | As an Admin, I set tenant-level identification behavior. | 1\. Given **General** tab, When I choose **Identify existing users by their phone number** or **Always create a new lead**, Then the choice saves immediately and persists on reload. |
| US-007 | P1 | As an Admin, I navigate to template management. | 1\. Given **General** tab, When I click **Create and manage message templates**, Then it opens the provider page in a new tab (shortcut only). |

### **5.4 Delete (Remove connection)**

| ID | Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-008 | P0 | As an Admin, I remove a number I no longer use. | 1\. Given any row, When I select **Remove** and confirm, Then the number is deleted from our platform (no active channel), tokens/secrets are purged, and the list refreshes; restricted numbers are removable as well. |

---

## **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | Provide two tabs: **Accounts** (default) and **General**. |
| FR-002 | Accounts list with columns **Display Name**, **Phone Number** (E.164), **Connection status**; search by name/number; filter by **Connection status**. |
| FR-003 | Metrics cards: **Total accounts**, **Connected account**, **Not connected account**, **Total outbound** (read-only). |
| FR-004 | Empty state with CTA **Connect WhatsApp business number** when no rows exist. |
| FR-005 | **Precheck modal** shows verification state: VERIFIED / NOT\_VERIFIED / RESTRICTED; trial limits text for NOT\_VERIFIED and acknowledgement checkbox; cap enforcement (≤2 connected numbers while NOT\_VERIFIED). |
| FR-006 | OAuth callback mapping: CONNECTED, NOT\_CONNECTED, RESTRICTED; idempotent writes; audit every decision (no secrets). |
| FR-007 | Row actions by status: **Connected** → Edit WhatsApp Profile, Disconnect, Remove; **Not connected** → Connect, Remove; **Restricted** → Learn more (link), Remove. |
| FR-008 | **Edit WhatsApp Profile** modal fields and rules: Profile Picture (JPG/PNG ≤2 MB, square ≥192 px), Name (1–100), Category (enum), About (≤139), Description (≤512 \+ counter), Email (RFC), Address (≤256), Website (valid URL). |
| FR-009 | **General** tab: radio rule for identification (IDENTIFY\_BY\_PHONE / ALWAYS\_CREATE\_NEW\_LEAD) with immediate save; **Create and manage message templates** opens external page in new tab (no authoring UI here). |
| FR-010 | Disconnect removes live webhook/subscription if applicable and sets status **Not connected**; Remove purges stored tokens/IDs and deletes the row. |
| FR-011 | Page banner for NOT\_VERIFIED appears across tabs with copy from design and a **Request Verification** link; dismissible until reload. |
| FR-012 | Performance: first list render p95 ≤1 s for ≤500 rows; search/filter ≤1 s; virtualization for long lists. |
| FR-013 | Security: CSRF/PKCE for OAuth; AES-256 at rest for secrets; RBAC on actions; no secrets in logs. |

---

## **7\. Error Handling**

| ID | Scenario | Handling | UI Message (English) |
| ----- | ----- | ----- | ----- |
| EH-001 | OAuth canceled | No row created/changed; show neutral toast; keep Retry connect CTA. | “Connection was canceled. You can try again.” |
| EH-002 | Code exchange failure | Retry once; if fail, show error and audit. | “We could not complete the connection. Try again.” |
| EH-003 | Not verified \+ cap reached | Hard block in precheck. | “Trial allows up to 2 phone numbers. Request verification to add more.” |
| EH-004 | Not verified \+ no acknowledgement | Disable Continue; helper text. | “Please acknowledge trial limits to continue.” |
| EH-005 | Restricted (business/number) | Block connect; set row to **Restricted** (if number known). | “This WhatsApp Business is restricted by Meta. Resolve the issue before connecting.” |
| EH-006 | List fetch failure | Keep skeleton \+ inline retry. | “We could not load your accounts. Retry.” |
| EH-007 | Profile validation error | Block save; keep modal open. | “Please fix the highlighted fields.” |
| EH-008 | Profile picture invalid | Reject upload. | “Invalid file. Use JPG/PNG up to 2 MB.” |
| EH-009 | Remove/disconnect error | No state change; show toast; log. | “We could not complete the action. Please retry.” |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Provisioning delay after OAuth | Show “Provisioning…” for up to 60 s, then finalize to Connected/Not connected/Restricted. |
| EC-002 | Double-click New account | One active connect session token at a time; idempotent callback. |
| EC-003 | Popup blocked on template shortcut | Provide secondary “Copy link” action. |
| EC-004 | Switching tabs while precheck open | Modal state preserved; actions disabled until decision. |
| EC-005 | Remove while Restricted | Allowed; row deleted; secrets purged. |
| EC-006 | Rapid filter+search typing | Debounce to keep ≤1 s updates. |

---

## **9\. UI & UX Requirements**

| ID | Component | Description | Copy (English) |
| ----- | ----- | ----- | ----- |
| UI-001 | Metrics cards | Cards above list. | “Total accounts”, “Connected account”, “Not connected account”, “Total outbound” |
| UI-002 | Accounts table | List \+ search \+ filter. | Search placeholder: “Search account name or number”; Filter: “Connection status” |
| UI-003 | Empty state | First-time connect. | Title: “Connect your WhatsApp account”; CTA: “Connect WhatsApp business number” |
| UI-004 | Precheck modal – Verified | Minimal checklist then proceed. | Primary: “Connect WhatsApp business number”; Secondary: “Cancel” |
| UI-005 | Precheck modal – Not verified | Trial copy \+ acknowledgement \+ cap logic. | Checkbox: “I understand trial limits apply.” |
| UI-006 | Precheck modal – Restricted | Block with guidance. | Title: “Account restricted by Meta”; Link: “Learn how to restore access” |
| UI-007 | Toasts | Outcomes. | Success: “New WhatsApp number added.”; Neutral: “Connection was canceled.”; Error: “We could not complete the connection.” |
| UI-008 | Row actions | Context menus. | “Connect”, “Edit WhatsApp Profile”, “Disconnect”, “Remove”, “Learn more” |
| UI-009 | General tab | Settings \+ shortcut. | Radios: “Identify existing users by their phone number”, “Always create a new lead”; Button: “Create and manage message templates” |
| UI-010 | Edit WhatsApp Profile modal | Profile fields with counters. | Buttons: “Save”, “Cancel”; Counters like “0/512” |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| display\_name | String | “Alex Johnson” | 1–100 chars | Yes |
| phone\_number | E.164 | \+6281234567891 | Valid E.164 | Yes |
| connection\_status | Enum | CONNECTED | CONNECTED / NOT\_CONNECTED / RESTRICTED | Yes |
| verification\_status | Enum | NOT\_VERIFIED | VERIFIED / NOT\_VERIFIED / RESTRICTED | Yes |
| identify\_existing\_users | Enum | IDENTIFY\_BY\_PHONE | IDENTIFY\_BY\_PHONE / ALWAYS\_CREATE\_NEW\_LEAD | Yes |
| profile\_picture | File | profile.jpg | JPG/PNG ≤2 MB; square ≥192 px | Optional |
| profile\_name | String | Alex Johnson | 1–100 chars | Yes |
| profile\_category | Enum | Professional Service | Provider enum | Yes |
| profile\_about | String | Support | ≤139 chars | Optional |
| profile\_description | String | We provide… | ≤512 chars | Optional |
| profile\_email | String | support@example.com | RFC email | Optional |
| profile\_address | String | Address | ≤256 chars | Optional |
| profile\_website | URL | [https://example.com](https://example.com) | Valid URL | Optional |

---

## **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | List FCP ≤1 s; search/filter ≤1 s; modal open ≤200 ms. |
| Availability | 99.9% for settings endpoints. |
| Security | OAuth state/PKCE; encrypted secrets; RBAC; audit logs. |
| Observability | Metrics for connect/disconnect/reconnect, profile edits, setting saves; correlation IDs. |

---

## **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| External | Meta OAuth/Graph | API/version change, outage | Version pinning, graceful errors |
| External | Verification/Restriction signals | Inconsistent or delayed | Re-check on callback; conservative blocking |
| Internal | List service | Slow queries on large tenants | Indexes, pagination, caching |

---

## **13\. Success Metrics**

| KPI | Target | Window |
| ----- | ----- | ----- |
| Connect+Reconnect success rate | ≥95% | First 30 days |
| List load p95 | ≤1 s | Ongoing |
| Profile edit success | ≥98% | Ongoing |
| Setting save reliability | ≥99.5% | Ongoing |

---

## **14\. Future Considerations**

| Idea | Rationale |
| ----- | ----- |
| Bulk actions (remove, reconnect) | Ops efficiency |
| CSV import/export | Admin productivity |
| Per-number role scoping | Large-org security |

---

## **15\. Limitations**

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| Template authoring is external | Context switch | Provide deep link \+ copy link |
| Trial cap while Not verified (max 2 numbers) | Blocks scaling pre-verification | Surface Request Verification prominently |

---

## **16\. Appendix**

### **16.1 Status-to-Action Matrix**

| Status | Allowed Actions |
| ----- | ----- |
| Connected | Edit WhatsApp Profile, Disconnect, Remove |
| Not connected | Connect, Remove |
| Restricted | Learn more, Remove |

### **16.2 Precheck State Matrix**

| Verification state | Continue? | Additional UI |
| ----- | ----- | ----- |
| Verified | Yes | None |
| Not verified, connected \< 2 | Yes | Trial banner \+ acknowledgement |
| Not verified, connected ≥ 2 | No | Hard block \+ “Request Verification” |
| Restricted (business or number) | No | Restriction modal \+ help link |

