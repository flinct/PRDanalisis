# **Product Requirement Document (PRD)**

**Feature:** Create Broadcast and Edit Draft Broadcast

| Launch Date | 9 June 2025 |
| :---- | :---- |
| **Author** | Resky, Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2025-10-09 | PRD Maker | Consolidated PRD focused on **Create Broadcast (primary)** with full support for **Edit Draft Broadcast**; aligned to latest designs (dual channel pickers, searchable sender/recipient selectors, template \+ variable samples, schedule, sticky action bar with Save as draft / Send broadcast). |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Allow Admin/Supervisor to compose and send a new broadcast (primary flow) and to reopen and finish any saved draft (secondary flow) using the same unified form. |
| Scope (MVP) | Single composer supporting: WhatsApp Web / WhatsApp API selection, sender pickers, recipients multi-select, template & variable samples, preview, schedule now/later, sticky action bar with **Save as draft** and **Send broadcast**, leave-page protection, open-from-draft with full restore. |
| Out of Scope | Collaboration locking, version history, attachments/media variables, multi-language templates, bulk imports. |
| Audience | Admin, Supervisor. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Users need a single, consistent place to create and send broadcasts. | Lower time-to-send; fewer mistakes. |
| PS-002 | Work is lost when navigating away mid-compose. | Rework; frustration. |
| PS-003 | Drafts reopen without clear guidance on what is missing to send. | Support load; failed sends. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Speed to send | p95 time from opening composer to successful **Send** (valid form) ≤ 15 s. |
| Work preservation | ≥ 99% draft save success; ≥ 90% of exits prompt users to save. |
| Smooth draft completion | ≤ 2% sends blocked by unresolved validation after draft reopen. |

---

## **5\. User Stories and Acceptance Criteria**

### **5.1 Create Broadcast (Primary)**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a user, I want to choose channel(s) and sender(s). | 1\. Composer shows tiles for **WhatsApp Web** and **WhatsApp API**; user may select one or both. 2\. Each selected channel requires a searchable **Choose account** dropdown (name \+ E.164). |
| US-002 | P0 | As a user, I want to add recipients quickly. | 1\. Recipients multi-select with search; chosen items render as removable chips; counter shows total selected. 2\. Duplicate numbers are auto-deduped. |
| US-003 | P0 | As a user, I want to use a template with variables. | 1\. Template dropdown; when a template with variables is chosen, a **Variable samples** grid appears and is required for send. 2\. Read-only **Preview template** renders the result. |
| US-004 | P0 | As a user, I want to send now or schedule. | 1\. Options: **Send immediately** or **Custom time** (date \+ time pickers; tenant timezone label). 2\. Past date/time is blocked with inline error. |
| US-005 | P0 | As a user, I want primary actions always visible. | 1\. **Save as draft** and **Send broadcast** stay visible in a sticky action bar while scrolling. 2\. **Send broadcast** is disabled until all send validations pass (see FR-006). |

### **5.2 Edit Draft Broadcast (Secondary)**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-006 | P0 | As a user, I want to reopen a draft and finish it. | 1\. Opening a draft pre-fills all saved fields (channels, senders, recipients, template, variables, schedule). 2\. Missing/invalid fields are highlighted; **Send broadcast** remains disabled until resolved. |
| US-007 | P0 | As a user, I want my latest changes saved. | 1\. Clicking **Save as draft** updates the existing draft (no duplication). 2\. Success toast: “Draft saved successfully.” |

### **5.3 Safety & Navigation**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-008 | P0 | As a user, I want protection from losing work. | 1\. On route change/back/close with unsaved changes, show modal: “Save as draft before leaving?” with **Save & exit / Leave without saving / Cancel**. 2\. Native beforeunload prompt is enabled on tab/window close. |

---

## **6\. Functional Requirements**

| ID | Requirement |
| ----- | ----- |
| FR-001 | Single composer supports both **Create** and **Edit Draft** modes (determined by presence of `draft_id` in URL). |
| FR-002 | Sticky action bar at top of viewport with **Save as draft** (secondary) and **Send broadcast** (primary). Buttons reflect loading/disabled states. |
| FR-003 | Channel selection: checkboxes for **WhatsApp Web** and **WhatsApp API**; each selected channel shows a searchable sender dropdown. At least one channel must be selected to send. |
| FR-004 | Recipients selection: searchable multi-select; show pill list with Remove; show total selected; auto-deduplicate. |
| FR-005 | Template & variables: choosing a template with variables renders a grid of required variable sample inputs; preview updates as the user types. |
| FR-006 | **Send** validation (per channel): at least one channel selected; sender chosen for each selected channel; ≥1 recipient; template chosen if channel requires it; all required variables have sample values; schedule is valid (now or future). |
| FR-007 | **Save as draft** accepts incomplete forms and persists entire form state (including invalid fields) as `status=draft`. |
| FR-008 | Leave-page protection: route guard \+ native beforeunload when the form is dirty and last save timestamp \< current state. |
| FR-009 | Draft lifecycle: create on first save; update on subsequent saves; transitions `draft → scheduled/ongoing` upon successful send. Draft is removed from Draft list after transition. |
| FR-010 | URL model: `/broadcast/create` (create mode), `/broadcast/drafts/{draft_id}/edit` (edit mode). Reload preserves context. |
| FR-011 | Accessibility: keyboard navigation for dropdowns and date/time pickers; focus moves to first invalid field upon failed send attempt. |

---

## **7\. Error Handling**

| ID | Scenario | Handling | UI Copy |
| ----- | ----- | ----- | ----- |
| EH-001 | Draft save fails | Keep form; show toast; enable retry. | “Failed to save draft. Please try again.” |
| EH-002 | Send validation fails | Block send; focus first invalid field; show inline messages. | “Please fix the highlighted fields.” |
| EH-003 | Past schedule time | Prevent send; mark date/time fields. | “Choose a future date and time.” |
| EH-004 | Sender unavailable (deleted/disabled) | Mark field invalid; require a new selection. | “Sender account is unavailable.” |
| EH-005 | Network offline | Disable send; saving shows offline error. | “You are offline. Check your connection and try again.” |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Switch channels mid-compose | Preserve per-channel sender selections; validations re-run automatically. |
| EC-002 | Large recipient lists (≥ 1k) | Virtualized dropdown; pill list collapses with “+N more”. |
| EC-003 | Duplicate recipients across imports | Auto-deduplicate; toast shows how many were removed. |
| EC-004 | Double-click Send | Idempotent by draft\_id/request\_id; button shows loading state. |
| EC-005 | Template changed after draft creation | Re-validate variables; clear/require new samples as needed. |

---

## **9\. UI & UX Requirements**

| ID | Component | Description | Copy (English) |
| ----- | ----- | ----- | ----- |
| UI-001 | Sticky Action Bar | Top-fixed actions visible at all times. | Buttons: “Save as draft”, “Send broadcast” |
| UI-002 | Channel Tiles | Two selectable tiles with helper text; each reveals sender dropdown. | Helper: “Send through your connected WhatsApp session / official WhatsApp API.” |
| UI-003 | Sender Dropdown | Searchable; shows Display name \+ (E.164). | Placeholder: “Choose WhatsApp Web account” / “Choose WhatsApp API account” |
| UI-004 | Recipients Selector | Searchable multi-select with removable chips and counter. | Placeholder: “Search client name” |
| UI-005 | Template & Variables | Dropdown \+ variable samples grid; preview area (read-only). | Labels: “Choose template”, “Variable samples”, “Preview template” |
| UI-006 | Schedule | Radio: **Send immediately** / **Custom time**; date \+ time pickers; tenant timezone label under inputs. | TZ Copy: “All times in {Tenant Timezone}.” |
| UI-007 | Navigation Guard | Modal on leave with unsaved changes. | Title: “Save as draft before leaving?” |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required for Send |
| ----- | ----- | ----- | ----- | ----- |
| name | String | Promo Sept Week 2 | 1–100 chars | No |
| channel\_web | Boolean | true | At least one of channel\_web/channel\_api must be true | Yes\* |
| channel\_api | Boolean | false | — | Yes\* |
| sender\_web\_id | String | waweb\_123 | Required if channel\_web=true | Conditional |
| sender\_api\_id | String | waapi\_456 | Required if channel\_api=true | Conditional |
| recipients\[\] | Array\<E.164\> | \[+62812…\] | ≥1; unique | Yes |
| template\_id | String | tmpl\_789 | Required if channel requires template | Conditional |
| variables | Map | {"username":"John"} | All required vars must be present | Conditional |
| schedule\_type | Enum | immediate | immediate | custom |
| schedule\_at | Timestamp | 2025-11-27T08:00:00+07:00 | Future time if custom | Conditional |
| draft\_id | String | draft\_20250926\_001 | Present only in edit mode | — |
| last\_saved\_at | Timestamp | 2025-09-26T15:45:00Z | Updated on each save | — |

---

## **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | Save ≤ 2 s p95; send initiation ≤ 2 s p95; search select responsive ≤ 150 ms input-to-suggestion. |
| Reliability | Draft updates are idempotent; send calls retriable with request IDs. |
| Security | Tenant isolation; PII minimization in logs; HTTPS only. |
| Accessibility | WCAG AA for forms and controls; strong focus states; ARIA labels. |
| Observability | Metrics for save latency, send attempts, validation failure rate; trace IDs across draft→send. |

---

## **12\. Dependencies & Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Internal | Broadcast service (draft \+ send APIs) | Schema drift breaks restore | Contract tests; versioned payloads |
| Internal | Contacts service | Slow queries degrade UX | Indexing; server-side pagination |
| External | Timezone handling | Mis-scheduled messages | Central TZ utility \+ visible TZ label |

---

## **13\. Success Metrics**

| KPI | Target | Window |
| ----- | ----- | ----- |
| Draft save success rate | ≥ 99% | Ongoing |
| Exit-with-save coverage | ≥ 90% of attempted exits | Ongoing |
| Send initiation success (valid forms) | ≥ 98% | Ongoing |
| User satisfaction (composer) | ≥ 80% positive | Quarterly survey |

---

## **14\. Future Considerations**

| Idea | Rationale |
| ----- | ----- |
| Autosave every N seconds | Reduce reliance on manual saves/prompts. |
| Collaborative editing \+ locking | Prevent overwrites and lost updates. |
| Attachments/media variables | Richer broadcast content. |
| Per-channel template catalogs | Faster selection, fewer errors. |

---

## **15\. Limitations**

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| No autosave in MVP | Users must click Save or accept prompt | Educate via helper text in sticky bar |
| No version history | Hard to compare iterations | Audit events (future) |
| Single-editor assumption | Last save wins | Warning if remote change detected (future) |

---

## **16\. Appendix**

| Reference | Note |
| ----- | ----- |
| Designs | Matches provided screens: dual channel pickers, searchable sender & recipient selectors, variable samples grid, preview area, schedule pickers, sticky **Save as draft** and **Send broadcast** actions. |
| Modes | Create mode `/broadcast/create`; Edit Draft mode `/broadcast/drafts/{id}/edit`. Same form, different data source. |

