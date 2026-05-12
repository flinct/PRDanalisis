# **Product Requirement Document (PRD)**

**Feature:** Create Broadcast Template

| Launch Date | 9 June 2025 |
| :---- | :---- |
| **Author** | Aryo, Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.2 | 2025-10-09 | Yusril | Added Create Template flow (Web/API), variable uniqueness rule (each variable can appear only once), acceptance criteria, validations, error handling, and UI copy in English. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a simple form to create WhatsApp Broadcast templates (WhatsApp Web and/or WhatsApp API). Templates define name, channel(s), category (API only), content (header, body, footer for API; body for Web), and variable samples. |
| Scope (MVP) | Create new template, validate inputs, preview variables, submit for review (API) or save (Web). |
| Out of Scope | Versioning,, media headers, footer, button / interactive components |
| Outcomes | Operators can author compliant templates quickly; API templates can be submitted for review; Web templates are available immediately. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Inconsistent template rules cause send-time failures. | Slower execution, retries. |
| PS-002 | Re-using the same variable multiple times makes validation and preview error-prone. | Undetected mistakes, broken personalization. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Reliable creation | ≥ 98% first-time save/submit success for valid forms. |
| Clear validation | ≤ 2% user-reported confusion about variable and naming rules. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I create a new template choosing channel(s). | 1\. Given Create Template page, When I select **WhatsApp Web** and/or **WhatsApp API**, Then required fields for each channel appear. 2\. At least one channel must be selected to save/submit. |
| US-002 | P0 | As an Admin, I define a compliant template name. | 1\. Name accepts lowercase letters, numbers, underscores; no spaces; 3–60 chars. 2\. Invalid characters block save with inline message. |
| US-003 | P0 | As an Admin, I add body text with variables. | 1\. Variables follow `{{variable_name}}`. 2\. Each variable key may appear **only once** across header/body/footer (API) or body (Web). Duplicates are blocked with inline error. 3\. Preview shows variable placeholders. |
| US-004 | P0 | As an Admin, I provide variable samples. | 1\. System auto-detects variables and generates one input per unique variable key. 2\. All variable sample inputs are required to save/submit. |
| US-005 | P0 | As an Admin, I submit API template for review. | 1\. When API channel is selected, I must choose **Category** (Marketing/Utility/Authentication). 2\. Clicking **Submit for review** creates the template with status “Submitted”. |
| US-006 | P0 | As an Admin, I save Web template. | 1\. When only Web channel is selected, clicking **Save template** persists it and status is “Active”. |
| US-007 | P1 | As an Admin, I see helpful errors and guardrails. | 1\. Invalid schedule or fields show inline errors; submit/save disabled until resolved. 2\. Leaving page with unsaved changes prompts confirmation. |

---

## **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | Page: Broadcast \> Templates \> **Create new template** with unified form supporting WhatsApp Web and WhatsApp API. |
| FR-002 | Name field: pattern `^[a-z0-9_]{3,60}$`; server re-validates; uniqueness per tenant required. |
| FR-003 | Channel selection: checkboxes for **WhatsApp Web** and **WhatsApp API** (at least one required). |
| FR-004 | API category (required if API selected): enum {Marketing, Utility, Authentication}. |
| FR-005 | Content: \- Web: Body (plain text). \- API: Header (optional plain text), Body (required plain text), Footer (optional plain text). |
| FR-006 | Variable syntax: `{{key}}` where key pattern `^[a-z0-9_]{1,40}$`. The system MUST extract variables from all text areas of selected channels. |
| FR-007 | **Variable uniqueness rule**: each `key` MAY appear **only once** across the entire template scope per channel selection (Web: body only; API: header+body+footer). Duplicate keys MUST block save/submit with field-level indication and a global error. |
| FR-008 | Variable samples panel auto-renders one input per detected **unique** variable key; all required to save/submit. |
| FR-009 | Preview area displays the combined content with placeholder tokens (no rendering of samples at save time). |
| FR-010 | Actions: \- **Save template** (Web only). \- **Submit for review** (API selected). Buttons stay enabled only when validations pass. |
| FR-011 | Dirty-state guard: on route change or close with unsaved changes, show confirm modal: “You have unsaved changes. Leave without saving?” with Leave/Stay. |
| FR-012 | Persistence: create record with fields in Section 10; status: Web=`ACTIVE`, API=`SUBMITTED`. |
| FR-013 | Audit: record created\_by, created\_at. |
| FR-014 | Accessibility: form is keyboard navigable; screen-reader labels for all fields. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI Copy (English) |
| ----- | ----- | ----- | ----- |
| EH-001 | Name validation fail | Block save/submit; highlight field. | “Use lowercase letters, numbers, and underscores (3–60 chars, no spaces).” |
| EH-002 | No channel selected | Block submit; toast \+ inline note. | “Select at least one channel.” |
| EH-003 | API without category | Block submit; highlight category. | “Choose a category for WhatsApp API.” |
| EH-004 | Variable duplicate | Block save/submit; show duplicates list and highlight locations. | “Each variable can only be used once: {{username}} appears multiple times.” |
| EH-005 | Variable samples missing | Block save/submit; focus first empty input. | “Provide a sample for all variables.” |
| EH-006 | Server save error | Keep form; show retry toast. | “Failed to create template. Please try again.” |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Same key in header and body (API) | Disallowed (variable uniqueness); show EH-004. |
| EC-002 | Same key with different casing | Normalized to lowercase; treated as duplicate. |
| EC-003 | Hidden whitespace in keys (copy-paste) | Trim keys; collapse whitespace; validate again. |
| EC-004 | No variables present | Samples panel hidden; save/submit allowed. |
| EC-005 | Switching channel selection | Re-parse variables for current channels; refresh samples; re-validate. |

---

## **9\. UI & UX Requirements**

| ID | Component | Description | Copy (English) |
| ----- | ----- | ----- | ----- |
| UI-001 | Header | Page title and actions. | Title: “Create new template”; Buttons: “Back”, “Save template”, “Submit for review”. |
| UI-002 | Template name | Single-line input with helper text. | Placeholder: `template_example_name`; Helper: “Use lowercase letters, numbers, and underscores (\_)”. |
| UI-003 | Channel selector | Two checkboxes with short descriptions. | “WhatsApp Web”, “WhatsApp API”. |
| UI-004 | API category | Segmented control shown only if API selected. | Options: “Marketing”, “Utility”, “Authentication”. |
| UI-005 | Content editors | Textareas for Header (API optional), Body (required), Footer (API optional). | Placeholders: “Add a short header…”, “Fill in your WhatsApp message here…”, “Add a short footer…”. |
| UI-006 | Add variable helper | Quick insert of `{{variable_name}}` at cursor. | Button: “Add variable”. |
| UI-007 | Variable samples | Generated inputs for each unique key. | Label: “Variable samples”; Helper: “Include samples for all variables to help review.” |
| UI-008 | Preview | Read-only preview block. | Label: “Preview”. |
| UI-009 | Validation surfacing | Inline field errors \+ global banner for duplicates. | Banner: “Resolve the errors below to continue.” |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| template\_id | String (UUID) | `tpl_01HX...` | Server-assigned | — |
| template\_name | String | `promo_launch_sept` | `^[a-z0-9_]{3,60}$`, unique per tenant | Yes |
| channel\_web | Boolean | true | At least one of channel\_web/channel\_api must be true | Yes\* |
| channel\_api | Boolean | true | — | Yes\* |
| api\_category | Enum | `Marketing` | Required if channel\_api=true | Conditional |
| header\_text (API) | String | `Hello` | 0–60 chars | Optional |
| body\_text | String | `Hi {{first_name}}, …` | 1–1024 chars; variable parse | Yes |
| footer\_text (API) | String | `Thank you` | 0–60 chars | Optional |
| variables\[\] | Array\<String\> | `["first_name"]` | Extracted unique keys; each appears once | Auto |
| variable\_samples | Map | `{ "first_name": "Alex" }` | Required for all keys; 1–256 chars each | Yes if variables exist |
| status | Enum | `ACTIVE` (Web) / `SUBMITTED` (API) | Derived from channel selection | Server |
| created\_by | UserId | `usr_123` | Audit only | Server |
| created\_at | Timestamp | ISO8601 | Audit only | Server |

---

## **11\. Non-Functional Requirements**

| Category | Target |
| ----- | ----- |
| Performance | p95 save/submit ≤ 2 s; variable parse ≤ 100 ms for up to 3k chars. |
| Usability | All validation errors are specific and actionable; first invalid field receives focus. |
| Security | Tenant isolation; input sanitization; logs exclude content text by default (store hashes for audit). |
| Accessibility | WCAG AA forms; ARIA labels for editors and toggles. |
| Observability | Metrics: save success rate, duplicate-variable error rate, average time to create. |

---

## **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| External | Meta review (API templates) | Review delays or rejections | Clear categories; provide samples; expose status later (out of scope). |
| Internal | Template store service | Schema drift | Contract tests; versioned API. |

---

## **13\. Success Metrics**

| KPI | Target | Window |
| ----- | ----- | ----- |
| First-try save/submit success | ≥ 98% | 30 days |
| Duplicate-variable errors | ≤ 2% of attempts | 30 days |
| Time to create (median) | ≤ 60 s | 30 days |

---

## **14\. Future Considerations**

| Idea | Why |
| ----- | ----- |
| Media headers and buttons | Richer templates. |
| Multi-language variants | Regionalization. |
| Template status tracker (API) | Surface Meta review outcomes. |
| Import/export templates | Portability and backups. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No edit/delete in this PRD | Manage changes externally for now. |
| No media/interactive support | Text-only templates. |

---

## **16\. Appendix**

| Item | Example |
| ----- | ----- |
| Variable extraction rule | Regex for tokens: `/\{\{([a-z0-9_]{1,40})\}\}/g` (lowercase enforced). |
| Duplicate detection | Compare set size vs occurrences across all active content fields for selected channels; block when any `count(key) > 1`. |
| Example duplicate error banner | “Duplicate variables are not allowed. Remove repeated keys: {{order\_id}}.” |

