# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Conversation Custom Attributes (Single \+ Collections)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

**References**:  
[https://chatgpt.com/canvas/shared/6967636e52ec81918b70f6b680ab4adc](https://chatgpt.com/canvas/shared/6967636e52ec81918b70f6b680ab4adc)  

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-14 | Yusril Ibnu Maulana | Initial PRD for conversation custom attributes, collections, UI editability, and searchability. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a universal, omnichannel “Custom Attributes” system for a Conversation that supports both single fields and repeatable grouped entries (Collections) with role-based editing controls. |
| Scope | Enable agents and admins to add, edit, remove attributes on demand without forcing all fields to appear by default, while keeping sidebar UI compact and searchable from Team Inbox search. |

| In Scope | Out of Scope |
| ----- | ----- |
| Conversation-level custom attributes. | Ticket-type based field templates for conversation. |
| Field definitions created by Admin. | Prebuilt templates such as Shipping, Payment (future). |
| UI editability control via `ui_editable`. | Advanced formulas, computed fields, automation rules. |
| Collections with rename, delete, and multiple fields per collection. | Bulk import/export for definitions or values. |
| Search conversations by custom attribute values. | Cross-workspace search and global org-wide search. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Conversation metadata differs by channel and use case, but agents need one universal place to store it. | Agents lose context, repeat questions, and create inconsistent records. |
| PS-002 | Repeatable data exists in many industries (shipping has multiple AWB). | Current single-value attributes cannot represent real workflows. |
| PS-003 | Custom attributes are not searchable. | Slow triage and hard to locate conversations by operational identifiers. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enable universal conversation metadata | 90% of active inboxes create at least 3 field definitions within 30 days. |
| Support repeatable data | 80% of workspaces using attributes create at least 1 collection per conversation within 60 days. |
| Make metadata discoverable | 95% of searches by attribute value return correct conversation within 1 second at P95. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to add a field to a conversation only when needed so the sidebar stays compact. | 1\. Given I open a conversation sidebar, When I view Custom Attributes, Then not all fields appear by default and only added fields are shown. 2\. Given I need a new attribute, When I click “Field baru”, Then I can pick from existing field definitions and the field appears in the list. 3\. Given I cancel adding a field, When I click “Batal”, Then no field is added and no changes are saved. |
| US-002 | P0 | As an Agent, I want to edit values for UI-editable fields so I can keep information up to date. | 1\. Given a field has `ui_editable=true`, When I change its value, Then the value is saved and displayed immediately. 2\. Given a field has `ui_editable=false`, When I try to edit it, Then the input is disabled and cannot be changed. 3\. Given I have no permission to edit the conversation, When I open Custom Attributes, Then editing controls are hidden or disabled. |
| US-003 | P0 | As an Agent, I want to remove a field from a conversation so I can correct mistakes. | 1\. Given a field has `ui_editable=true`, When I hover the field label, Then a remove action appears. 2\. Given I click remove, When confirmation is shown, Then the field is removed only after I confirm. 3\. Given a field has `ui_editable=false`, When I hover it, Then remove action is not available. |
| US-004 | P0 | As an Agent, I want to create multiple collections to store repeatable grouped data for the same conversation. | 1\. Given I click “Koleksi”, When the collection is created, Then it is created empty with zero fields. 2\. Given I created multiple collections, When I view the list, Then each collection is shown as a compact row with a title and expand control. 3\. Given there is only 1 collection, When I view Custom Attributes, Then the UI becomes flat without a collection header. |
| US-005 | P0 | As an Agent, I want collection titles that remain meaningful without expanding details. | 1\. Given a collection has a name, When I view the collapsed row, Then the row title shows the collection name. 2\. Given a collection has no name, When I view the collapsed row, Then the row title falls back to the last two non-empty values in that collection, excluding image values. 3\. Given a collection has no name and no values, When I view it, Then the title is “Tanpa judul”. |
| US-006 | P0 | As an Agent, I want to rename and delete collections to keep data clean. | 1\. Given I hover a collection row, When actions appear, Then “Ubah nama” and “Hapus” are shown only on hover. 2\. Given I click rename, When inline editing starts, Then only “Simpan” and “Batal” controls appear and other actions are hidden. 3\. Given I click delete, When confirmation is shown, Then the collection is deleted only after I confirm. |
| US-007 | P0 | As an Admin, I want to create new field definitions from the field picker so teams can evolve metadata. | 1\. Given I am Admin, When I type a new label in field search, Then I see “Buat field” option if it does not exist. 2\. Given I am not Admin, When I type a label that does not exist, Then I cannot create it and only existing fields are selectable. 3\. Given I create a new field definition successfully, When I return to add-field flow, Then the new field is selectable immediately. |
| US-008 | P0 | As an Admin, I want dropdown fields to be usable immediately so agents can set values without additional setup steps. | 1\. Given I create a dropdown definition, When I save, Then at least 1 option is required. 2\. Given a dropdown has options, When an agent adds that field, Then the value selector is enabled and options are selectable. 3\. Given dropdown options are missing due to invalid configuration, When viewing the field, Then the value selector is disabled and a clear error is shown. |
| US-009 | P0 | As a Supervisor, I want to enforce UI read-only fields coming from integrations so agents cannot overwrite them in the dashboard. | 1\. Given a field definition has `ui_editable=false`, When an agent opens it, Then it is read-only and not removable. 2\. Given integration updates the value, When the sidebar refreshes, Then the new value is displayed without user edits. |
| US-010 | P0 | As an Agent, I want to search conversations by custom attribute values so I can quickly find the right thread. | 1\. Given I am in Team Inbox search, When I search by a text value stored in attributes, Then matching conversations appear in results. 2\. Given the value exists inside any collection, When I search the value, Then the conversation is still matched. 3\. Given I search by a dropdown label, When the stored value matches that option, Then results include the conversation. |
| US-011 | P1 | As an Agent, I want pagination or a compact “more” pattern so the sidebar does not become too long. | 1\. Given there are more than N collections, When I view the section, Then only the first N are shown and a “X lainnya” row appears. 2\. Given I click “X lainnya”, When the expanded view opens, Then I can browse all collections without leaving the conversation. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Data Model | 1\. FR-001: System MUST treat Conversation as the universal object for custom attributes across channels. 2\. FR-002: System MUST support two storage forms under Custom Attributes. 3\. FR-003: System MUST support single fields stored at conversation level. 4\. FR-004: System MUST support collections stored as an ordered array of entries where each entry contains fields. 5\. FR-005: System MUST allow collections to have an optional `name` string. |
| Field Definitions | 1\. FR-006: System MUST allow Admin to create field definitions with type text, dropdown, date, image. 2\. FR-007: System MUST store per definition a `ui_editable` boolean that controls dashboard editability and removability. 3\. FR-008: System MUST prevent non-Admin users from creating field definitions. 4\. FR-009: System MUST prevent duplicate field definition labels within the same workspace. |
| Adding Fields | 1\. FR-010: Users MUST be able to add a field into a collection by selecting from definitions. 2\. FR-011: System MUST prevent adding the same field definition twice within the same collection. 3\. FR-012: System MUST allow adding fields only when needed and MUST NOT auto-add all definitions to conversations. |
| Editing Values | 1\. FR-013: Users MUST be able to edit values for fields with `ui_editable=true`. 2\. FR-014: System MUST disable editing for fields with `ui_editable=false` in the dashboard. 3\. FR-015: System MUST allow integrations to update values even if `ui_editable=false` in the dashboard. |
| Removing Fields | 1\. FR-016: Users MUST be able to remove fields with `ui_editable=true` from a collection. 2\. FR-017: System MUST show a confirmation dialog before removing any field. 3\. FR-018: System MUST block removal for `ui_editable=false` fields. |
| Collections | 1\. FR-019: Users MUST be able to create a new collection that starts empty with zero fields. 2\. FR-020: Users MUST be able to rename a collection using inline edit controls. 3\. FR-021: Users MUST be able to delete a collection with confirmation. 4\. FR-022: If a conversation has only 1 collection, UI MUST render flat without a collection header row. |
| Collection Titles | 1\. FR-023: System MUST display collection title using `name` if present. 2\. FR-024: If `name` is missing, system MUST derive title from last two non-empty values in that collection, excluding image values. 3\. FR-025: If no suitable values exist, system MUST show “Tanpa judul”. |
| Searchability | 1\. FR-026: System MUST include custom attribute values in Team Inbox conversation search results. 2\. FR-027: System MUST search across single fields and all collections. 3\. FR-028: System MUST match searches against field label and field value. 4\. FR-029: System MUST match searches against collection name when present. 5\. FR-030: Search MUST be case-insensitive and support partial matching for text and option labels. |
| Permissions | 1\. FR-031: Admin, Supervisor, Agent MUST be able to edit values for `ui_editable=true` if they have conversation edit permission. 2\. FR-032: Only Admin MUST be able to create field definitions. 3\. FR-033: System MUST hide or disable UI actions when the user lacks permission. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block creating dropdown definition without options. | Show “Opsi dropdown wajib diisi”. |
| EH-002 | Validation | Block creating definition with duplicate label. | Show “Nama field sudah ada”. |
| EH-003 | Authorization | Block non-Admin from creating definitions. | Show “Hanya admin yang bisa membuat field baru”. |
| EH-004 | Conflict | Prevent duplicate field in same collection. | Show “Field sudah ada di koleksi ini”. |
| EH-005 | Save Failure | Retry save up to 3 times. If still fails, revert UI to last saved state. | Show “Gagal menyimpan. Coba lagi”. Provide “Coba lagi” action. |
| EH-006 | Search Index Delay | If indexing is delayed, still save values and mark searchable state as eventual. | Show no error. Do not block editing. |
| EH-007 | Missing Definition | If a stored field references missing definition, show as read-only unknown field. | Label becomes “Field tidak dikenal”. Value shown as text. |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Conversation has 0 collections and 0 fields. | Section shows empty state and primary CTA only. | Show “Belum ada atribut”. Show button “Field baru” and “Koleksi”. |
| EC-002 | Collection deleted while expanded. | Collapse and remove from list. Move focus to next collection if available. | No crash. |
| EC-003 | Only 1 collection remains after deletion. | UI switches to flat mode automatically. | Flat view without collection header. |
| EC-004 | Collection has many fields. | Show compact list with internal “Lihat semua” expansion. | Keep sidebar height controlled. |
| EC-005 | Image field value stored. | Search uses filename only. Title fallback excludes image values. | Display filename link text. |
| EC-006 | Date field search query. | Search matches ISO date and localized display form. | No special UI needed. |
| EC-007 | Dropdown option label renamed by Admin. | Existing stored values remain valid and display latest label. | Search matches both stored value and latest label. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Section Header | Title “Atribut kustom”. Actions “Koleksi” and “Field baru”. Collapse chevron for the section. | User opens sidebar, sees compact header actions. | US-001 US-004 |
| Empty State | Minimal empty state when no fields or collections exist. | Show text and CTAs only. | US-001 US-004 |
| Flat Mode | When only 1 collection exists, render fields as a simple two-column list without collection title row. | User sees direct values immediately. | US-004 US-005 |
| Collection List Rows | Compact rows with title, expand chevron. Hover actions appear on right. | User scans titles without expanding. | US-005 US-006 |
| Collection Rename Inline | Inline input replaces title. Only “Simpan” and “Batal” buttons visible. Hide delete and edit icons while editing. | User clicks “Ubah nama”, edits, saves. | US-006 |
| Delete Collection Confirm | Confirmation dialog with explicit impact. | User clicks delete then confirms. | US-006 |
| Fields Grid | Two-column: label and value editor. Remove icon appears on hover near label, not on the right. | User hovers label to remove. | US-003 |
| Read-only Field Styling | Disabled editor, no remove action. Optional lock indicator. | User understands it cannot be edited. | US-002 US-009 |
| Add Field Inline | Inline add UI with field picker and value editor. | User clicks “Field baru”, selects definition, sets value, saves. | US-001 |
| Field Picker Autocomplete | Searchable list of definitions. Admin can create new from typed text. Agent cannot. | Admin types then selects “Buat field”. | US-007 |
| Create Field Definition | Minimal inline panel: label, type, and options for dropdown. | Admin chooses type then sets required config. | US-007 US-008 |
| Pagination for Collections | Show at most N collections by default with “X lainnya”. | User clicks “X lainnya” to open full list. | US-011 |
| Search Support | No additional UI required beyond Team Inbox search behavior. | User types value in search and sees results. | US-010 |

**UI copy must be Bahasa Indonesia only.**

---

## **10\. Field & Validation**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| Field Definition Label | Text | 1\. Min 2 chars. 2\. Max 40 chars. 3\. Unique per workspace. 4\. Case-insensitive uniqueness. | Required |
| Field Definition Type | Enum | Allowed: text, dropdown, date, image. | Required |
| Field Definition `ui_editable` | Boolean | 1\. Controls dashboard editability and removability. 2\. Does not block integration overwrite. | Required |
| Dropdown Options | List | 1\. Required if type is dropdown. 2\. Min 1 option. 3\. Max 50 options. 4\. Option label max 30 chars. 5\. Option values must be unique per definition. | Conditional |
| Text Value | Text | 1\. Max 500 chars. 2\. Searchable by partial match. | Optional |
| Dropdown Value | Enum value | 1\. Must be one of allowed options. 2\. Searchable by option label and stored value. | Optional |
| Date Value | Date | 1\. Stored as ISO date. 2\. Searchable by ISO date and displayed date string. | Optional |
| Image Value | File reference | 1\. Store filename for display. 2\. Searchable by filename only. 3\. Title fallback excludes images. | Optional |
| Collection Name | Text | 1\. Max 60 chars. 2\. Searchable by partial match. 3\. Optional, fallback title if empty. | Optional |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | 1\. P95 sidebar load under 500 ms after conversation open. 2\. P95 save value under 700 ms. 3\. P95 Team Inbox search response under 1 second for attribute queries. |
| Reliability | 1\. Save operations must be idempotent per field update attempt. 2\. Retry policy for save failures: 3 attempts. |
| Security and Privacy | 1\. Tenant isolation for all attribute data. 2\. Attribute values must follow existing conversation visibility rules. |
| Accessibility | 1\. Keyboard navigable inputs and dialogs. 2\. Visible focus states for add, edit, confirm actions. |
| Observability | 1\. Track save success rate, validation failure rate, indexing delay rate. |

---

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Team Inbox search must include attribute index | Engineering | Core requirement blocked if missing | Add indexing for attributes and collections. Add regression tests for search matching. |
| Sidebar density risk with many collections | Product and Design | Poor usability | Enforce default visible limits and “X lainnya”. |
| Definition governance in multi-team orgs | Product | Definition sprawl | Admin-only creation and uniqueness enforcement. |
| Migration for existing single attributes | Engineering | Data inconsistency | Migrate to unified structure with backward compatibility. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Conversations with at least 1 custom field value | 40% of active conversations | 60 days | Product analytics |
| Search usage for attribute queries | 20% of all searches | 60 days | Search logs |
| Search success rate for attribute value queries | 95% | Ongoing | Search logs and sampling QA |
| Attribute save failure rate | Under 1% | Ongoing | Error logs |

---

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Templates for collections such as Shipping, Payment | Faster setup and consistency across teams. |
| Field-level permissions | Some attributes may be editable only by certain roles. |
| Bulk edit and bulk remove | Operational efficiency at scale. |
| Structured validators per field | Enforce formats such as AWB patterns. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No templates in Phase 1 | Users manually create definitions and collections. |
| Sidebar shows limited collections by default | Requires “X lainnya” to see full list. |
| Image search by filename only | Cannot search inside image content. |

---

## **16\. Appendix**

| Item | Notes |
| ----- | ----- |
| Open API minimal shape | `collections` is an array. Each item can include optional `name` and contains fields list with values. UI editability is controlled by field definition `ui_editable`. |
| UI Labels | “Atribut kustom”, “Koleksi”, “Field baru”, “Simpan”, “Batal”, “Ubah nama”, “Hapus”, “X lainnya”, “Tanpa judul”, “Belum ada atribut”, “Gagal menyimpan. Coba lagi”, “Hanya admin yang bisa membuat field baru”, “Nama field sudah ada”, “Opsi dropdown wajib diisi”. |

