# **Product Requirement Document (PRD)**

**Feature:** Add New WhatsApp Account (v2.2)  
**Product Manager:** Yusril Ibnu  
**Engineering Lead:** Naftal  
**Design Lead:** Resky  
**Contributors:** Engineering Team, QA Team, Design Team  
**Version:** v2.4

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v2.5 | 2025-10-09 | PRD Maker | Converted all content and UI strings to English. Switched **Account Name** to a searchable **dropdown** with inline **Add new**. Kept only this revision entry. Added comprehensive negative cases and safeguards (conflicts, duplicates, expired/used links, QR refresh failures, partial-batch errors, RBAC, throttling). |

---

## **2\. Overview**

| Field | Description |
| ----- | ----- |
| Purpose | Provide a guided multi-step flow for **bulk adding WhatsApp accounts** with automation for routing, backups, and broadcast rotation, supporting parallel multi-device login and credential persistence. |
| Key Capabilities | Bulk input (up to 100 rows), **Account Name dropdown with inline "Add new"**, Auto Move, Backup Numbers, Broadcast Rotator, Main/Backup Connect slots, QR & Pairing Code (auto-refresh), credential persistence, public temporary links, RBAC. |
| Outcome | Faster onboarding, consistent naming, fewer rescans, and resilient sessions via prepared backups. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Free text Account Names create duplicates/variants. | Routing confusion, messy reports. |
| PS-002 | No inline create during bulk entry. | Context switching, slower onboarding. |
| PS-003 | Limited failover during connect. | Downtime, manual rescans. |

---

## **4\. Objectives and Key Results**

| ID | Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- | ----- |
| OKR-001 | Enforce consistent naming | 100% Account Names selected from dropdown or created inline | Q4 2025 |
| OKR-002 | Reduce onboarding time | Complete 10+ rows in \< 5 minutes (P50) | Q4 2025 |
| OKR-003 | Improve resilience | ≥95% auto-recovery via backup sessions (no rescan) | Q4 2025 |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I select **Account Name** from a dropdown or create a new one inline to keep names consistent. | 1\. Given bulk form, When I type in Account Name, Then a tenant-scoped searchable dropdown appears. 2\. Given no matches, When I click "Add new account name", Then an inline input validates and creates a unique name (case-insensitive, trimmed) and auto-selects it. 3\. Given a duplicate name (existing or within batch), When I attempt to save, Then I get a clear error and cannot proceed. |
| US-002 | P0 | As an Admin, I bulk add up to 100 accounts efficiently. | 1\. Given up to 100 rows, When I fill Account Name \+ WhatsApp Number (E.164), Then invalid rows are flagged inline and cannot be submitted. 2\. Given mixed valid/invalid rows, When I submit, Then only valid rows proceed; invalid rows remain with errors and no data loss. |
| US-003 | P0 | As an Admin, I configure Auto Move, Backup Numbers, and Broadcast Rotator during add. | 1\. Given Auto Move checked, When I submit without selecting a Team Inbox, Then submission is blocked with an error. 2\. Given Backup Numbers, When I select conflicts (self or overlapping with Auto Move pool), Then the UI blocks and explains the conflict. 3\. Given Rotator settings beyond tier limits, When I save, Then I see a warning and can adjust or proceed based on policy (Low Prio) |
| US-004 | P0 | As an Admin, I connect sessions (Main/Backup) via QR or Pairing with minimal friction. | 1\. Given a slot, When I open QR/Pairing, Then the code auto-refreshes every 30s while the tab is active. 2\. Given successful scan, When the slot connects, Then status changes to "Connected" and focus advances to the next slot. 3\. Given code expired/used, When a scan fails, Then the UI shows "Link expired" and regenerates a new code automatically. |
| US-005 | P1 | As an Admin/Supervisor, I can share a temporary public QR/Pairing link for remote scanning. | 1\. Given I click "Share Public Link", When I copy and open it, Then the page shows the code until TTL expires (default 10 minutes). 2\. Given the link is expired or already used, When accessed, Then it shows a clear message and a "Request new link" flow. |
| US-006 | P0 | As an Admin, I want credentials to persist automatically without rescan. | 1\. Given creds.update events, When they occur, Then credentials are stored encrypted and sessions restore automatically after reload. 2\. Given a network failure during save, When it recovers, Then the system retries idempotently and ensures no duplicate records. |
| US-007 | P1 | As a Supervisor, I can only add accounts for Team Inboxes I own. | 1\. Given RBAC, When I open Team Inbox dropdown, Then only my scoped inboxes are listed; others are hidden/disabled. |
| US-008 | P2 | As an Agent, I must not access add functionality. | 1\. Given my role is Agent, When I view the page, Then "+ Add Account" is hidden; deep links show "Access denied". |

---

## **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | **Account Name** MUST be a tenant-scoped searchable dropdown. |
| FR-002 | Dropdown MUST include **"Add new account name"**; new names MUST pass uniqueness (case-insensitive, trimmed) and allowed characters (letters, numbers, spaces, hyphen, underscore; length 1–50). |
| FR-003 | Bulk input MUST support up to 100 rows with per-row validations: Account Name selected/created; WhatsApp Number in E.164 and not duplicated (in DB or current batch). |
| FR-004 | Auto Move (checkbox \+ Team Inbox select) MUST require a Team Inbox when enabled; dropdown must be RBAC-filtered. |
| FR-005 | Backup Numbers multi-select MUST block self-selection and overlap with Auto Move pools; maximum 5 selections. |
| FR-006 | Broadcast Rotator MUST support mode by message count or by schedule (daily/weekly) with tier-limit warnings. |
| FR-007 | Main/Backup Connect MUST have 2 slots each; each slot supports QR or Pairing; codes auto-refresh every 30s while visible. |
| FR-008 | **Public links** MUST be HTTPS-only, unique per slot, single-use (or limited-use) with TTL (default 10 minutes); attempts after TTL/usage MUST show an explicit expired/used state. |
| FR-009 | Credentials MUST persist on creds.update events; storage MUST be encrypted; system MUST restore sessions on reload without rescan when credentials are valid. |
| FR-010 | All actions MUST be RBAC-gated (Admin full, Supervisor scoped, Agent denied). |
| FR-011 | Summary/Confirmation MUST show normalized Account Names exactly as stored; failed rows must remain editable with errors preserved. |
| FR-012 | System SHOULD throttle submissions to prevent abuse and show friendly errors when rate limits are hit. |
| FR-013 | System SHOULD provide per-row retry for failed operations in partial-batch outcomes (e.g., 60 succeeded, 3 failed). |

---

## **7\. Error Handling**

| Code | Scenario | Handling | User Message (English) |
| ----- | ----- | ----- | ----- |
| 400-ANA01 | Duplicate Account Name (existing DB or in-batch) | Block save; highlight offending rows; suggest selecting existing name. | "Account name already exists." |
| 400-ANA02 | Invalid Account Name format | Block save; show format rules. | "Invalid account name." |
| 400-ANA03 | Missing Account Name | Prevent submit; focus field. | "Please select or create an account name." |
| 400-ANA04 | Duplicate WhatsApp Number | Block row; cross-check DB and batch. | "WhatsApp number is already registered." |
| 400-ANA05 | Invalid WhatsApp Number (E.164) | Inline validation; mask example. | "Enter a valid E.164 number (e.g., \+6281234567890)." |
| 400-ANA06 | Auto Move checked without Team Inbox | Block submit. | "Select a Team Inbox to use Auto Move." |
| 400-ANA07 | Backup conflict (self/overlap with Auto Move) | Block selection; explain conflict. | "Backup numbers cannot include the active/Auto Move numbers." |
| 401-ANA08 | Unauthorized (RBAC) | Deny action; audit log. | "Access denied." |
| 409-ANA09 | Rate limit / throttling | Backoff and retry hint. | "Too many requests. Please try again shortly." |
| 410-ANA10 | Public link expired | Offer "Generate new link". | "This link has expired." |
| 410-ANA11 | Public link already used | Offer "Generate new link". | "This link has already been used." |
| 422-ANA12 | QR/Pairing refresh failure | Auto-retry with fallback; allow manual refresh. | "Unable to refresh code. Retrying…" |
| 424-ANA13 | Number existence check failed (dependency) | Soft-fail with warning; allow continue or re-check. | "Number check unavailable. You may retry or continue." |
| 500-ANA14 | Server error on batch save | Keep rows intact; enable per-row retry; log incident. | "We could not save your changes. Please retry." |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Mixed success in a batch (partial commit) | Commit successful rows; keep failed rows editable with specific errors; provide "Retry failed rows". |
| EC-002 | Network flap during creds.update | Queue retry with backoff; ensure idempotency; show non-blocking toast. |
| EC-003 | User navigates away mid-scan | Persist progress; on return, restore the last visible step and codes. |
| EC-004 | Device incompatible with Pairing | Show fallback to QR with guide. |
| EC-005 | Rotator exceeds provider tier | Warn and let user adjust or proceed if policy allows |
| EC-006 | Large batches near limit (100 rows) | Show counter; disable "Add row" when at limit; tooltip explains cap. |
| EC-007 | Long-running scans | Keep codes auto-refreshing; indicate "Active for mm:ss"; pause refresh when tab hidden to save resources. |

---

## **9\. UI & UX Requirements**

| ID | Component | Description | Copy (English) | Linked US |
| ----- | ----- | ----- | ----- | ----- |
| UI-001 | Account Name Field | Searchable dropdown with inline **"Add new account name"**. Validates uniqueness and format. | Placeholder: "Select account name…" Action: "+ Add new account name" Errors: "Account name already exists.", "Invalid account name." | US-001 |
| UI-002 | Bulk Input Rows | Rows for Account Name \+ WhatsApp Number; optional Status/Bio, Profile Photo, Welcome Message; Auto Move, Backups, Rotator. | Buttons: "Add to Summary", "Remove row" | US-002/003 |
| UI-003 | Confirmation Screen | Summary table of normalized names & configs; confirm or cancel. | Buttons: "Confirm & Save", "Cancel" | US-002 |
| UI-004 | Session Scan | Sections: Main Connect, Backup Connect; 2 slots each; QR/Pairing toggle; auto-refresh; share link. | Buttons: "Share Public Link", Badge: "Connected" | US-004/005 |
| UI-005 | Notifications & Errors | Toasts and inline errors. | "Saved successfully.", "Please fix the highlighted fields." | All |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| Account Name | Dropdown \+ inline add | "Main Store Support" | Unique per tenant; 1–50 chars; \[A-Za-z0-9 \_-\] and spaces | Yes |
| WhatsApp Number | String (E.164) | \+6281234567890 | Must start with "+"; E.164; not duplicated (DB or batch) | Yes |
| Status/Bio | String | "Customer Care 24/7" | Max 139 chars | Optional |
| Profile Photo | File (jpg/png) | profile.jpg | \<= 2 MB; square recommended (\>=192x192) | Optional |
| Welcome Message | String | "Hi, how can we help?" | Max 500 chars; only if Business | Optional |
| Auto Move to Team Inbox | Checkbox \+ Select | true \+ "Sales Inbox" | Required if checked; RBAC-filtered | Optional |
| Backup Numbers | Multi-select | \[+6289876543210\] | No self; no overlap with Auto Move; max 5 | Optional |
| Broadcast Rotator | Number \+ Mode | 100 \+ "Daily" | Integer 1–1000; modes: By Count/Daily/Weekly | Optional |

---

## **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | Validate 100 rows end-to-end \< 10 s; QR refresh latency \< 1 s. |
| Scalability | 1,000+ accounts per tenant; horizontal workers for scans. |
| Reliability | 99% credential persistence success; idempotent saves/retries. |
| Security | Encrypted credentials at rest; HTTPS-only public links; strict RBAC. |
| Observability | Metrics: add success, time-to-complete, link usage; structured logs. |

---

## **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Internal | Account Registry | Legacy duplicates on first use | Normalize on write; suggest closest matches |
| Internal | Team Inbox / Logs | Mis-scoped RBAC | Server-side filtering \+ audits |
| Internal | Broadcast System | Tier limit mismatch | Pre-check \+ user warnings |
| External | WA libraries (QR/Pairing) | API changes | Compatibility tests; fallback library |
| External | Link shortener/host | TTL or security regressions | Unique signed URLs; short TTL; revoke on demand |

---

## **13\. Success Metrics**

| KPI | Target | Window |
| ----- | ----- | ----- |
| % rows using dropdown/inline create | 100% | Ongoing |
| Time to add 10+ entries (P50) | \< 5 minutes | First 30 days |
| Add success rate | ≥ 95% | Ongoing |
| Credential persistence (no rescan) | 100% | Ongoing |

---

## **14\. Future Considerations**

| Idea | Benefit |
| ----- | ----- |
| CSV/Excel bulk import using Account Registry | Faster enterprise onboarding |
| Name aliasing/normalization tools | Cleaner analytics |
| CRM-powered name suggestions | Reduce duplicates and typing |

---

## **15\. Limitations**

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| Tenant-scoped names only | Same name may exist in other tenants | Accept by design |
| Bulk cap of 100 rows | Multiple batches needed for very large imports | Sequential batches; future CSV import |

---

## **16\. Appendix**

### **16.1 Sample Flow (Inline Create)**

1. Admin types "Main Store Support" in Account Name.  
2. Dropdown shows "No results" \+ **Add new account name**.  
3. Admin clicks Add, passes validation; name is created and auto-selected.  
4. Admin fills WhatsApp Number and options, clicks **Add to Summary**.  
5. Admin clicks **Confirm & Save**, proceeds to **Session Scan**, connects slots.

### **16.2 Negative Case Coverage Checklist**

* Duplicate/invalid Account Names (format, existing DB, in-batch).  
* Duplicate/invalid phone numbers; E.164 enforcement.  
* Auto Move without Team Inbox; Backup conflicts (self/overlap).  
* Rotator beyond tier limits (warn/confirm).  
* RBAC violations (Supervisor scope, Agent denied).  
* Public link expired/already used; regenerate path.  
* QR/Pairing refresh failures; auto-retry/manual refresh.  
* Partial-batch failures with per-row retry; no data loss.  
* Throttling/rate limit errors with backoff hints.  
* Dependency failures (number check) with soft-fail and retry.

