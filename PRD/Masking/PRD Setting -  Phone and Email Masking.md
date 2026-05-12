# **Product Requirement Document (PRD)**

**Feature:** Phone and Email Masking in Dashboard (v1.0)  
**Product Manager:** Yusril Ibnu Maulana  
**Engineering Lead:** Naftal  
**Design Lead:** Resky  
**Contributors:** Engineering Team, QA Team, Design Team

---

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 15 Jan 2026 | Yusril Ibnu Maulana | Initial PRD for role-based masking of phone and email in dashboard, including search, export, and server-side enforcement |

---

## **1 | Overview**

Dashboard needs simple privacy control for **phone** and **email** with **role-based visibility**. Masking must be enforced **server-side**, so raw values are not visible via browser DevTools Network, Inspect Element, or hidden JSON fields.

### **Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Phone and email masking across dashboard surfaces | Other PII types such as address, ID number, payment |
| Role visibility with 2 levels: Full or Masked | Audit logs for reveal who when why |
| Phone search by last4 digits for Masked roles | Tokenization, encryption vault, DLP pipelines |
| Exports follow role policy | Internal staff dashboard scope |
| Best-effort masking for phone and email when they appear inside message text rendering | Guaranteed detection of all formats inside free text |

---

## **2 | Goals**

| Goal | Success Indicator |
| ----- | ----- |
| Reduce exposure of full phone and email for operational roles | Agent sees masked phone and email by default |
| Prevent leakage via non-obvious surfaces | Masking applies in UI, search results, and exports |
| Enforce privacy beyond FE | For Masked roles, raw values are not returned by dashboard APIs |

---

## **3 | User Stories and Acceptance Criteria**

| ID | User Story | Priority | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | As an Owner, I can set whether each role sees Full or Masked values for phone and email | P0 | Given I update role visibility settings and click Save, when any dashboard surface loads data for that role, then phone and email follow the saved policy |
| US-002 | As an Admin, I can set whether each role sees Full or Masked values for phone and email | P0 | Same as US-001 |
| US-003 | As a Supervisor, I can view full phone and email for escalations | P0 | Given my role policy is Full, when I view contact, conversation, and ticket surfaces, then phone and email display unmasked |
| US-004 | As an Agent, I see phone and email masked so I can work without full identifiers | P0 | Given my role policy is Masked, when I view dashboard surfaces, then phone shows country code plus last4 digits and email shows first 3 local characters plus masked domain and visible TLD |
| US-005 | As an Agent, I can search by the last 4 digits of a phone number to find the correct contact or conversation | P0 | Given my role policy is Masked, when I search with exactly 4 digits, then matching results are returned and displayed masked, and when I search with anything else, then no full-phone matching occurs |
| US-006 | As an Agent, exports should not expose more than what I can see in the UI | P0 | Given my role policy is Masked, when I export data, then phone and email in the export are masked |
| US-007 | As any role with Masked policy, I cannot obtain raw phone and email from API responses | P0 | Given my role policy is Masked, when I inspect Network responses, then raw phone and email are not present anywhere in payload |

---

## **4 | Functional Requirements**

### **4.1 Role Policy**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-001 | Visibility levels are exactly 2: Full and Masked | P0 |
| FR-002 | Policy is configurable per role per field: Phone and Email | P0 |
| FR-003 | Default policy: Owner Full, Admin Full, Supervisor Full, Agent Masked | P0 |
| FR-004 | Policy is evaluated and enforced server-side for all dashboard endpoints | P0 |

### **4.2 Masking Format**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-010 | Phone Masked keeps country calling code when available and shows only last 4 digits | P0 |
| FR-011 | Phone Masked example: `+62 •••• •••• 7890` | P0 |
| FR-012 | Email Masked shows first 3 characters of local-part | P0 |
| FR-013 | Email Masked masks domain name and keeps TLD visible | P0 |
| FR-014 | Email Masked examples: `joh•••@•••.com`, `joh•••@•••.co.id` | P0 |

### **4.3 Coverage of Dashboard Surfaces**

| ID | Surface | Requirement | Priority |
| ----- | ----- | ----- | ----- |
| FR-020 | Contact list | Apply policy to phone and email | P0 |
| FR-021 | Contact detail | Apply policy to phone and email | P0 |
| FR-022 | Conversation list participant area | Apply policy to phone and email | P0 |
| FR-023 | Conversation list preview text | Best-effort mask phone and email occurrences in rendered text | P1 |
| FR-024 | Conversation detail header | Apply policy to phone and email | P0 |
| FR-025 | Conversation message rendering | Best-effort mask phone and email occurrences in rendered text | P1 |
| FR-026 | Ticket detail contact section | Apply policy to phone and email | P0 |
| FR-027 | Search results lists | Values displayed follow policy | P0 |
| FR-028 | Exports | Values in export follow policy | P0 |
| FR-029 | Tooltips, toasts, popovers showing contact info | Apply policy | P0 |
| FR-030 | URLs and query params | Must never include raw phone or email | P0 |

### **4.4 Search Rules**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-040 | For Masked roles, phone search supports only last4 digits input | P0 |
| FR-041 | last4 input must be exactly 4 digits after trimming spaces | P0 |
| FR-042 | For Masked roles, system must not attempt full phone matching | P0 |
| FR-043 | For Full roles, search behavior remains as current implementation | P1 |
| FR-044 | For Masked roles, full email search is not supported | P1 |

### **4.5 Export Rules**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-050 | Export outputs follow the same role policy as UI | P0 |
| FR-051 | Masked roles export masked values for phone and email | P0 |
| FR-052 | Full roles export full values for phone and email | P0 |

### **4.6 Server-side Data Exposure Rules**

| ID | Requirement | Priority |
| ----- | ----- | ----- |
| FR-060 | For Masked roles, dashboard API responses must not include raw phone or raw email anywhere in payload | P0 |
| FR-061 | For Masked roles, API must not include raw values in alternate fields such as `raw_phone`, `normalized_phone`, `email_original`, or nested objects | P0 |
| FR-062 | Masking must be applied at serialization boundary for dashboard APIs and export generation | P0 |

---

## **5 | UI and UX Requirements**

### **5.1 Privacy Settings Screen**

| UI ID | Screen | Requirement | UI Strings | Story Ref |
| ----- | ----- | ----- | ----- | ----- |
| UI-001 | Pengaturan Privasi Data | Show roles table with Phone and Email visibility | Judul: `Privasi Data` | US-001, US-002 |
| UI-002 | Pengaturan Privasi Data | Each cell is a dropdown with 2 options | Opsi: `Full`, `Masking` | US-001, US-002 |
| UI-003 | Pengaturan Privasi Data | Save persists policy | Tombol: `Simpan` | US-001, US-002 |

---

## **6 | Error Handling and Edge Cases**

| ID | Type | Scenario | Handling | Notes |
| ----- | ----- | ----- | ----- | ----- |
| EH-001 | Negative | Masked role searches phone with non-4-digit input | Do not run full match, return no results or guidance state | Must not fallback to partial match |
| EH-002 | Negative | Masked role attempts email search with full email | Return no results or guidance | Prevent enumeration |
| EH-003 | Edge | Phone has fewer than 4 digits after normalization | Show only last 1 digit and mask the rest | Example: `+62 •••• •••• •` |
| EH-004 | Edge | Phone value has no country code | Mask all but last4 and omit country code | Display consistency over parsing |
| EH-005 | Edge | Email local-part shorter than 3 | Show available prefix then mask | Example: `ab•••@•••.com` |
| EH-006 | Negative | UI renders masked but API includes raw | Block at API serialization and add automated tests | This is a P0 defect |
| EH-007 | Edge | Conversation text contains multiple phones or emails | Mask all detected occurrences at render time | Best-effort, may miss uncommon formats |
| EH-008 | Edge | Policy changed while user session active | Apply policy on next fetch, no stale raw caching | Avoid storing raw in client storage |

---

## **7 | Non Functional Requirements**

| Category | Requirement | Target |
| ----- | ----- | ----- |
| Security | For Masked roles, raw phone and email never appear in dashboard API payloads | 0 occurrences in response sampling and automated tests |
| Consistency | UI, search results, and exports follow identical policy evaluation | 100 percent compliance in QA suite |
| Performance | Masking adds minimal overhead on list endpoints | No noticeable regression on typical payload sizes |
| Testability | Snapshot tests validate masking formats and API payload absence of raw values | Mandatory for P0 endpoints |

---

## **8 | Dependencies and Risks**

| Dependency or Risk | Impact | Mitigation |
| ----- | ----- | ----- |
| Role mapping differs per tenant | Wrong exposure level | Centralize policy evaluation per tenant |
| Export pipeline bypasses API serializer | Leakage via export | Apply same policy logic in export generator |
| Text masking may over-mask non-PII patterns | Reduced readability | Keep patterns narrow and accept best-effort limitation |
| Caching or client storage contains raw values | Leakage via browser | Do not store raw values for Masked roles |

---

## **9 | Success Metrics**

| Metric | Target | Time Window |
| ----- | ----- | ----- |
| Agent sees masked phone and email by default | 100 percent of Agent sessions | 2 weeks after release |
| No raw phone or email in Masked-role API payloads | 0 occurrences | Continuous |
| Export respects role policy | 100 percent in QA | 2 weeks after release |

---

## **10 | Future Considerations**

| Item | Why | Priority |
| ----- | ----- | ----- |
| Add Hidden level | Some tenants may want stronger privacy | P2 |
| Extend masking to more fields | Broader privacy coverage | P2 |
| Improve TLD handling for uncommon domains | Better email display accuracy | P2 |
| Per-surface policy overrides | Some screens may need stricter display | P3 |

---

## **11 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Masked values still identify a user partially | Use Hidden level later if needed | P2 |
| Text masking in messages is best-effort | Keep scope limited to common patterns | P2 |
| last4 search can return multiple matches | User refines via other filters | P2 |

