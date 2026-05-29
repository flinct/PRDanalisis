# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Create Ticket Consistency Patch  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead: Sabrina**

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-05-04 | Yusril Ibnu Maulana | Initial patch for consistent Create Ticket form from selected chat bubble and Ticket page. |

## **2\. Overview**

This patch standardizes the Create Ticket form for two entry points: one selected chat bubble and the Ticket page. The form supports Ticket Type based Additional Fields, optional Team Inbox assignment, optional Assignee assignment, scoped Assignee validation, direct tagging, title, priority, and description.

| In Scope | Out of Scope |
| ----- | ----- |
| Create ticket from exactly one selected chat bubble. | Create ticket from multiple selected chat bubbles. |
| Create ticket from Ticket page using the default form. | Create ticket from conversation list. |
| One selected bubble can create one ticket. | Multi-draft ticket creation. |
| Ticket Type controls Additional Fields. | Standalone versus linked ticket source mode. |
| Optional Team Inbox assignment. | Conversation selection from Ticket page. |
| Optional single Assignee assignment. | Open API create ticket alignment. |
| Team Inbox scoped Assignee validation. | Ticket Type configuration CRUD. |
| Add tags during ticket creation. | Ticket merge and split. |
| Core fields: Ticket Type, Team Inbox, Assignee, Tags, Title, Priority, Description, Additional Fields. | AI ticket classification. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Create Ticket form is inconsistent between chat bubble and Ticket page. | Agents face different behavior and QA needs separate validation paths. |
| PS-002 | Team Inbox assignment is missing or unclear in the chat bubble flow. | Tickets can be created without correct team queue ownership. |
| PS-003 | Team Inbox and Assignee can be misunderstood as mutually exclusive options. | Ticket assignment can be wrong, incomplete, or outside the intended team scope. |
| PS-004 | Additional Fields are not clearly tied to Ticket Type selection. | Required operational fields can be missed or rendered inconsistently. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Standardize Create Ticket behavior across in-scope entry points. | 100% of in-scope entry points use the same core form fields and validation rules. |
| Improve assignment accuracy. | 100% of created tickets store correct Team Inbox and Assignee assignment state. |
| Enforce scoped assignment. | 100% of submitted tickets with Team Inbox and Assignee pass Team Inbox membership validation. |
| Prevent unsupported bubble linking. | 0 tickets are created from more than one selected bubble in this patch. |
| Prevent duplicate creation from the same bubble. | 0 duplicate tickets are created from the same selected bubble. |
| Improve required field completion. | 95% of ticket creation attempts pass required field validation on first submit. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to create one ticket from one selected chat bubble so that the ticket has exact message context. | 1\. Given I select one chat bubble, When I click "Buat tiket", Then the Create Ticket modal opens with that selected bubble shown in the context preview. 2\. Given the selected bubble is valid, When I submit the form, Then exactly one ticket is created and linked to that one message. 3\. Given the selected bubble is deleted before submit, When I submit the form, Then the system blocks submit and shows "Pesan tidak tersedia". |
| US-002 | P0 | As an Agent, I should not be able to create one ticket from multiple chat bubbles in this patch so that scope stays simple. | 1\. Given I select more than one chat bubble, When I open the action menu, Then "Buat tiket" is disabled or hidden. 2\. Given I force the action with more than one selected bubble, When the system validates the request, Then creation is blocked. 3\. Given creation is blocked, When feedback appears, Then the system shows "Pilih satu pesan saja untuk membuat tiket". |
| US-003 | P0 | As an Agent, I want one selected bubble to create only one ticket so that message context is not duplicated. | 1\. Given a selected bubble is not linked to any ticket, When I submit a valid Create Ticket form, Then the selected bubble is linked to the created ticket. 2\. Given the selected bubble is already linked to a ticket, When I click "Buat tiket", Then the system blocks creation and shows "Pesan ini sudah terhubung ke tiket". 3\. Given double submit happens, When the system receives the second submit, Then only one ticket is created. |
| US-004 | P0 | As an Agent, I want to create a ticket from the Ticket page using the same core form so that manual ticket creation is consistent. | 1\. Given I click "Buat tiket" from the Ticket page, When the modal opens, Then the same core fields are shown without conversation preview. 2\. Given I submit a valid Ticket page form, When the ticket is created, Then the ticket has no linked message by default. 3\. Given I submit an invalid Ticket page form, When validation runs, Then the system blocks submit and highlights invalid fields. |
| US-005 | P0 | As an Agent, I want to select Ticket Type first so that Additional Fields follow the selected Ticket Type. | 1\. Given no Ticket Type is selected, When I view "Field Tambahan", Then the system shows "Pilih tipe tiket terlebih dahulu untuk menampilkan field tambahan". 2\. Given I select a Ticket Type, When the Ticket Type has additional fields, Then "Field Tambahan" renders fields based on that Ticket Type. 3\. Given the selected Ticket Type has no additional fields, When "Field Tambahan" loads, Then the system shows "Tidak ada field tambahan untuk tipe tiket ini". |
| US-006 | P0 | As an Agent, I want safe Ticket Type switching so that filled field values are not lost silently. | 1\. Given I already filled "Field Tambahan", When I change Ticket Type, Then the system shows "Mengganti tipe tiket akan menghapus field yang tidak sesuai. Lanjutkan?". 2\. Given I confirm the change, When the new Ticket Type loads, Then compatible fields keep their values and incompatible fields are cleared. 3\. Given I cancel the change, When the dialog closes, Then the previous Ticket Type and values stay unchanged. |
| US-007 | P0 | As an Agent, I want Team Inbox assignment to be optional so that I can create tickets with or without a team queue. | 1\. Given Team Inbox is empty and Assignee is empty, When I submit the form, Then the ticket is created as Unassigned without Team Inbox. 2\. Given Team Inbox is selected and Assignee is empty, When I submit the form, Then the ticket is created as Unassigned inside the selected Team Inbox. 3\. Given the selected Team Inbox becomes inactive before submit, When I submit the form, Then the system blocks submit and shows "Kotak masuk tim tidak tersedia". |
| US-008 | P0 | As an Agent, I want Assignee assignment to be optional so that I can assign a ticket to a specific member only when needed. | 1\. Given Team Inbox is empty, When I open the Assignee dropdown, Then all active eligible users within my assignment permission scope are shown. 2\. Given Team Inbox is empty and Assignee is selected, When I submit the form, Then the ticket is assigned to the selected Assignee without Team Inbox. 3\. Given the selected Assignee becomes inactive before submit, When I submit the form, Then the system blocks submit and shows "Anggota tidak tersedia". |
| US-009 | P0 | As an Agent, I want Team Inbox and Assignee to be additive optional fields so that I can fill either one, both, or neither. | 1\. Given I open the Create Ticket form, When I view Assignment, Then Team Inbox and Assignee are shown as separate optional fields and not radio choices. 2\. Given Team Inbox and Assignee are both selected, When the Assignee belongs to the selected Team Inbox, Then the ticket is created as assigned to that Assignee inside the selected Team Inbox. 3\. Given Team Inbox and Assignee are both empty, When I submit the form, Then the ticket is created as Unassigned. |
| US-010 | P0 | As an Agent, I want Assignee options to be filtered and validated by Team Inbox so that assignment stays inside the selected team scope. | 1\. Given a Team Inbox is selected, When I open the Assignee dropdown, Then only active members inside the selected Team Inbox are shown. 2\. Given I already selected an Assignee, When I change Team Inbox and that Assignee is not part of the new Team Inbox, Then the Assignee field is cleared. 3\. Given the Assignee field is cleared, When the system shows feedback, Then the message says "Anggota dipilih dihapus karena tidak termasuk kotak masuk tim". 4\. Given Team Inbox and Assignee are both selected, When the Assignee does not belong to the selected Team Inbox during submit, Then submit is blocked and the system shows "Anggota tidak termasuk kotak masuk tim yang dipilih". |
| US-011 | P0 | As an Agent, I want to add tags during ticket creation so that ticket classification is complete from the start. | 1\. Given I open Create Ticket, When I select existing tags, Then the tags are saved to the ticket after submit. 2\. Given I have tag creation permission, When I type a new tag name, Then I can create and select the new tag. 3\. Given I do not have tag creation permission, When I type an unknown tag, Then the create tag action is hidden. |
| US-012 | P0 | As an Agent, I want clear required fields so that I can submit without guessing. | 1\. Given required fields are empty, When I click "Buat tiket", Then submit is blocked and invalid fields are highlighted. 2\. Given the form has errors below the visible area, When submit is blocked, Then the footer shows the first error summary. 3\. Given I click the error summary, When the form scrolls, Then focus moves to the invalid field. |
| US-013 | P1 | As an Agent, I want dirty state protection so that filled form data is not lost accidentally. | 1\. Given I edit any field, When I close the modal, Then the system shows "Perubahan belum disimpan. Keluar dari halaman ini?". 2\. Given I choose "Tetap di halaman", When the confirmation closes, Then my form data remains. 3\. Given I choose "Keluar", When the modal closes, Then unsaved form data is discarded. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Entry Point | 1\. FR-001: System MUST support Create Ticket from exactly one selected chat bubble. 2\. FR-002: System MUST support Create Ticket from Ticket page using the same core form. 3\. FR-003: System MUST show conversation context preview only for single bubble entry point. 4\. FR-004: System MUST not show conversation preview for Ticket page create flow. |
| Single Bubble Rule | 1\. FR-005: System MUST allow only one selected bubble for one ticket creation. 2\. FR-006: System MUST block ticket creation when more than one bubble is selected. 3\. FR-007: System MUST enforce one selected bubble can be linked to one ticket only. 4\. FR-008: System MUST disable or hide "Buat tiket" when selected bubble count is not exactly 1\. 5\. FR-009: System MUST show "Pilih satu pesan saja untuk membuat tiket" if a multi-bubble creation is attempted. 6\. FR-010: System MUST block ticket creation when the selected bubble is already linked to a ticket. |
| Core Form | 1\. FR-011: System MUST show fields in this order: Ticket Type, Assignment, Tags, Title, Priority, Description, Additional Fields. 2\. FR-012: System MUST use the same field labels and validation behavior for chat bubble and Ticket page entry points. 3\. FR-013: System MUST show a sticky footer with ticket count, "Batal", and "Buat tiket". 4\. FR-014: System MUST keep user input after validation fails. |
| Ticket Type and Additional Fields | 1\. FR-015: System MUST require Ticket Type before submit. 2\. FR-016: System MUST render Additional Fields based on the selected Ticket Type. 3\. FR-017: System MUST use "Field Tambahan" as the UI label for Additional Fields. 4\. FR-018: System MUST show "Pilih tipe tiket terlebih dahulu untuk menampilkan field tambahan" before Ticket Type is selected. 5\. FR-019: System MUST validate required Additional Fields based on the selected Ticket Type. 6\. FR-020: System MUST ask for confirmation before clearing incompatible Additional Field values when Ticket Type changes. 7\. FR-021: System MUST block submit when the selected Ticket Type is inactive or unavailable. |
| Assignment Optionality | 1\. FR-022: System MUST support optional Team Inbox assignment. 2\. FR-023: System MUST support optional single Assignee assignment. 3\. FR-024: System MUST allow users to fill Team Inbox only, Assignee only, both Team Inbox and Assignee, or neither. 4\. FR-025: System MUST NOT treat Team Inbox and Assignee as mutually exclusive choices. 5\. FR-026: System MUST NOT use radio selection for Team Inbox and Assignee. |
| Assignment State Rules | 1\. FR-027: If Team Inbox and Assignee are both empty, system MUST create the ticket as Unassigned without Team Inbox. 2\. FR-028: If Team Inbox is selected and Assignee is empty, system MUST create the ticket as Unassigned inside the selected Team Inbox. 3\. FR-029: If Team Inbox is empty and Assignee is selected, system MUST create the ticket assigned to the selected Assignee without Team Inbox. 4\. FR-030: If Team Inbox and Assignee are both selected, system MUST create the ticket assigned to the selected Assignee inside the selected Team Inbox only when the Assignee belongs to that Team Inbox. |
| Assignee Scope Validation | 1\. FR-031: If Team Inbox is selected, system MUST filter Assignee options to active members inside the selected Team Inbox. 2\. FR-032: If Team Inbox is selected, system MUST validate on submit that selected Assignee belongs to the selected Team Inbox. 3\. FR-033: If Team Inbox is empty, system MUST show all active users who are eligible to receive ticket assignment based on the creator assignment permission scope. 4\. FR-034: If user changes Team Inbox after selecting an Assignee, system MUST clear the selected Assignee when the Assignee is outside the new Team Inbox scope. 5\. FR-035: If selected Assignee is outside the selected Team Inbox scope during submit, system MUST block submit and show validation error. |
| Tags | 1\. FR-036: Users MUST be able to add existing tags during ticket creation. 2\. FR-037: Users with tag creation permission MUST be able to create a new tag from the tag field. 3\. FR-038: System MUST hide new tag creation for users without tag creation permission. 4\. FR-039: System MUST enforce maximum 20 tags per ticket. |
| Required Fields | 1\. FR-040: System MUST require Title. 2\. FR-041: System MUST require Priority. 3\. FR-042: System MUST require Description. 4\. FR-043: System MUST block submit when any required field is invalid. 5\. FR-044: System MUST focus the first invalid field after failed submit. |
| Submit Behavior | 1\. FR-045: System MUST disable "Buat tiket" while submit is in progress. 2\. FR-046: System MUST prevent duplicate ticket creation caused by double submit. 3\. FR-047: System MUST keep draft data if ticket creation fails. 4\. FR-048: System MUST create ticket initial status using existing ticket lifecycle policy. |
| Audit and Notification | 1\. FR-049: System MUST record ticket creation in ticket timeline. 2\. FR-050: System MUST audit source entry point, selected bubble ID, Ticket Type, Team Inbox, Assignee, Tags, Title, Priority, Description, and Additional Field values. 3\. FR-051: System MUST notify selected Assignee when ticket is created with Assignee. 4\. FR-052: System MUST notify relevant Team Inbox users when ticket is created with Team Inbox and no Assignee. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | More than one bubble selected | Block ticket creation. Keep current selection unchanged. | "Pilih satu pesan saja untuk membuat tiket" |
| EH-002 | No bubble selected in bubble flow | Block create action. Ask user to select one message. | "Pilih satu pesan untuk membuat tiket" |
| EH-003 | Selected bubble already linked | Block ticket creation from the same bubble. | "Pesan ini sudah terhubung ke tiket" |
| EH-004 | Selected bubble deleted | Block submit. Ask user to select another message. | "Pesan tidak tersedia" |
| EH-005 | Missing required field | Block submit. Highlight field. Focus first invalid field. | "Field wajib diisi" |
| EH-006 | Ticket Type unavailable | Block submit. Ask user to select another Ticket Type. | "Tipe tiket tidak tersedia" |
| EH-007 | Additional Fields validation failed | Block submit. Highlight invalid dynamic field. | "Field wajib diisi atau format tidak valid" |
| EH-008 | Team Inbox unavailable | Block submit. Clear invalid Team Inbox. | "Kotak masuk tim tidak tersedia" |
| EH-009 | Assignee unavailable | Block submit. Clear invalid Assignee. | "Anggota tidak tersedia" |
| EH-010 | Assignee not in selected Team Inbox after Team Inbox change | Clear Assignee after Team Inbox change. Allow user to choose another member. | "Anggota dipilih dihapus karena tidak termasuk kotak masuk tim" |
| EH-011 | Assignee outside selected Team Inbox during submit | Block submit. Keep Team Inbox. Clear invalid Assignee. | "Anggota tidak termasuk kotak masuk tim yang dipilih" |
| EH-012 | Tag limit exceeded | Block adding more tags. Keep selected tags unchanged. | "Maksimal 20 tag" |
| EH-013 | Tag creation denied | Hide create action. Do not block selecting existing tags. | "Anda tidak memiliki akses untuk membuat tag" |
| EH-014 | Double submit detected | Return existing created ticket. Do not create another ticket. | "Tiket sudah dibuat" |
| EH-015 | Submit failed | Keep form data. Allow retry. | "Gagal membuat tiket. Coba lagi" |
| EH-016 | Dirty form close | Show confirmation dialog. | "Perubahan belum disimpan. Keluar dari halaman ini?" |
| EH-017 | Permission denied | Block action and keep state unchanged. | "Akses ditolak" |
| EH-018 | Team Inbox member list unavailable | Allow Team Inbox only. Disable Assignee until list loads or retry succeeds. | "Gagal memuat anggota. Coba lagi" |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User selects two bubbles and opens action menu. | "Buat tiket" is disabled or hidden. | No modal opens. |
| EC-002 | User force-submits two bubble IDs. | System rejects the request. | "Pilih satu pesan saja untuk membuat tiket" |
| EC-003 | User selects a bubble that is already linked to a ticket. | System blocks create action. | "Pesan ini sudah terhubung ke tiket" |
| EC-004 | Same conversation has other tickets from other bubbles. | System allows create from a new unlinked bubble. | No warning needed in this patch. |
| EC-005 | Ticket Type has no Additional Fields. | Section stays visible with empty state. | "Tidak ada field tambahan untuk tipe tiket ini" |
| EC-006 | Ticket Type changes after user fills Additional Fields. | Confirmation dialog appears before clearing incompatible values. | "Mengganti tipe tiket akan menghapus field yang tidak sesuai. Lanjutkan?" |
| EC-007 | Team Inbox has no active members. | Assignee dropdown shows empty state. Ticket can still be created as Unassigned in Team Inbox. | "Belum ada anggota aktif di kotak masuk ini" |
| EC-008 | No Team Inbox is selected and user opens Assignee dropdown. | Dropdown shows all active eligible users within assignment permission scope. | "Tanpa kotak masuk tim, anggota dari semua tim yang valid dapat dipilih" |
| EC-009 | Team Inbox is selected and user opens Assignee dropdown. | Dropdown shows only active members inside selected Team Inbox. | "Anggota difilter berdasarkan kotak masuk tim yang dipilih" |
| EC-010 | Selected Assignee loses permission before submit. | Submit is blocked and Assignee is cleared. | "Anggota tidak tersedia" |
| EC-011 | Selected Assignee is removed from Team Inbox before submit. | Submit is blocked and Assignee is cleared. | "Anggota tidak termasuk kotak masuk tim yang dipilih" |
| EC-012 | Ticket page create has no linked conversation. | Ticket is created without linked message context. | No context preview is shown. |
| EC-013 | User closes modal after editing fields. | Dirty state confirmation appears. | "Perubahan belum disimpan. Keluar dari halaman ini?" |
| EC-014 | User selects Team Inbox only. | Ticket is created as Unassigned inside selected Team Inbox. | Success toast appears. |
| EC-015 | User selects Assignee only. | Ticket is created as assigned to selected Assignee without Team Inbox. | Success toast appears. |
| EC-016 | User selects neither Team Inbox nor Assignee. | Ticket is created as Unassigned without Team Inbox. | Success toast appears. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Create Ticket Modal Header | Header shows modal title and close action. UI label: "Buat tiket baru". | User opens modal from one selected bubble or Ticket page. | US-001, US-004, US-013 |
| Bubble Context Preview | Shown only when create action comes from one selected bubble. | User reviews the selected bubble before submitting. | US-001 |
| Multi-Bubble Blocked State | Disable or hide create action when more than one bubble is selected. | User selects multiple bubbles and cannot proceed to Create Ticket. | US-002 |
| Linked Bubble Badge | Shows when a bubble already has a linked ticket. | User understands that the same bubble cannot create another ticket. | US-003 |
| Ticket Type Field | Required dropdown. UI label: "Tipe tiket". Placeholder: "Pilih tipe tiket". | User selects Ticket Type first. | US-005, US-006 |
| Assignment Section | Contains Team Inbox and Assignee as separate optional fields. UI label: "Assignment". | User may select Team Inbox, Assignee, both, or none. | US-007, US-008, US-009, US-010 |
| Team Inbox Field | Optional dropdown. UI label: "Kotak masuk tim". Placeholder: "Pilih kotak masuk tim". | User selects Team Inbox to route ticket into team queue. | US-007, US-009, US-010 |
| Assignee Field | Optional single select dropdown. UI label: "Anggota". Placeholder: "Pilih anggota". | User selects one member. Options are filtered by Team Inbox when selected. | US-008, US-009, US-010 |
| Assignment Helper | Helper text below assignment fields. | Shows "Jika tidak diisi, tiket akan dibuat sebagai Unassigned". Shows "Anggota difilter berdasarkan kotak masuk tim yang dipilih" when Team Inbox is selected. Shows "Tanpa kotak masuk tim, anggota dari semua tim yang valid dapat dipilih" when Team Inbox is empty. | US-007, US-008, US-009, US-010 |
| Tags Field | Optional multi-select. UI label: "Tag". Placeholder: "Pilih atau tambah tag". | User selects existing tags or creates a new tag if permitted. | US-011 |
| Title Field | Required text input. UI label: "Judul". Placeholder: "Masukkan judul tiket". | User enters ticket title. | US-012 |
| Priority Field | Required dropdown. UI label: "Prioritas". Placeholder: "Pilih prioritas". | User selects priority. | US-012 |
| Description Field | Required textarea. UI label: "Deskripsi". Placeholder: "Jelaskan detail tiket". | User enters ticket details. Character counter is shown. | US-012 |
| Additional Fields Section | Dynamic section based on selected Ticket Type. UI label: "Field Tambahan". | User fills Ticket Type specific fields. | US-005, US-006 |
| Sticky Footer | Footer remains visible. Shows ticket count and actions. | User submits or cancels from any scroll position. Labels: "Batal" and "Buat tiket". | US-012, US-013 |
| Loading State | Skeleton or spinner for Ticket Type fields and member list. | User waits while "Field Tambahan" or Assignee options load. | US-005, US-010 |
| Empty State | Shown when selected Ticket Type has no dynamic fields or Team Inbox has no members. | User sees "Tidak ada field tambahan untuk tipe tiket ini" or "Belum ada anggota aktif di kotak masuk ini". | US-005, US-010 |
| Error State | Field level error and footer summary. | User clicks footer error to focus invalid field. | US-012 |

## **10\. Field & Validation**

| Field | Type | Required | Validation |
| ----- | ----- | ----- | ----- |
| Source Entry Point | Enum | Yes | Allowed values: single\_bubble, ticket\_page. |
| Selected Bubble ID | String | Conditional | Required only for single\_bubble. Must exist. Must not already be linked to a ticket. |
| Conversation ID | String | Conditional | Required only for single\_bubble. Must exist and be accessible by user. |
| Ticket Type | Dropdown | Yes | Must be active. Must be accessible to user. Controls Additional Fields. |
| Team Inbox | Dropdown | No | Optional. Must be active and within user access scope if selected. |
| Assignee | Single select | No | Optional. Must be active and eligible for ticket assignment. |
| Assignee with Team Inbox | Single select | Conditional | If Team Inbox is selected, Assignee must be an active member of the selected Team Inbox. |
| Assignee without Team Inbox | Single select | Conditional | If Team Inbox is empty, Assignee may be any active eligible user within creator assignment permission scope. |
| Tags | Multi-select | No | Max 20 tags. Existing tags must be active. New tag creation requires permission. |
| Title | Text | Yes | Min 3 chars. Max 120 chars. Trim leading and trailing spaces. |
| Priority | Dropdown | Yes | Must be one of configured priority values. |
| Description | Textarea | Yes | Min 5 chars. Max 1000 chars. Trim leading and trailing spaces. |
| Additional Fields | Dynamic fields | Conditional | Required and validation rules follow selected Ticket Type. UI label is "Field Tambahan". |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Create Ticket modal opens under 1 second at P95. |
| Performance | Additional Fields load under 1.5 seconds at P95 after Ticket Type is selected. |
| Performance | Assignee options load under 1 second at P95 after Team Inbox is selected. |
| Performance | Submit completes under 2 seconds at P95 for one ticket. |
| Reliability | One selected bubble can create one ticket only. |
| Reliability | Double submit must not create duplicate tickets. |
| Security | User must only see allowed Team Inboxes and eligible Assignees. |
| Security | Assignee scope validation must run again on submit. |
| Privacy | Bubble preview must follow existing conversation visibility rules. |
| Accessibility | Modal must support keyboard navigation from header to footer. |
| Accessibility | All fields must have visible label, focus state, and error state. |
| Observability | Track modal open, submit success, submit failure, validation failure, Ticket Type change, blocked multi-bubble attempt, and Assignee scope validation failure. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ticket Type service availability | Engineering | Additional Fields cannot render. | Show loading and retry state. Block submit until schema loads. |
| Team Inbox membership accuracy | Engineering | Assignee filtering may be wrong. | Validate Team Inbox and Assignee again on submit. |
| Assignment permission scope | Engineering | Assignee list may expose invalid users. | Filter by permission on load and validate again on submit. |
| Tag permission model | Product and Engineering | Unauthorized tag creation may occur. | Hide create action and validate permission on submit. |
| Existing ticket lifecycle policy | Product | Initial ticket state may conflict with current behavior. | Reuse existing lifecycle policy. |
| Existing bubble selection behavior | Design and Engineering | Multi-select UI may still expose Create Ticket. | Disable or hide Create Ticket when selected count is not 1\. |
| Form length from Additional Fields | Design | Modal can become too long. | Use sticky footer and section spacing. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Single bubble rule pass rate | 100% | Release QA | QA checklist |
| Ticket creation success rate | 98% or higher | 30 days after release | Product analytics |
| Duplicate ticket from same bubble | 0 | 30 days after release | Audit logs |
| Team Inbox scoped Assignee validation pass rate | 100% | Release QA | QA checklist |
| Assignment validation failure rate | Under 2% | 30 days after release | Error logs |
| Additional Fields validation pass rate | 95% or higher | 30 days after release | Validation logs |
| Median Create Ticket completion time from bubble | Under 30 seconds | 30 days after release | Product analytics |
| Tag usage during ticket creation | 30% or higher | 60 days after release | Product analytics |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Create ticket from multiple selected bubbles | Useful when an issue needs several message references. |
| Create ticket from conversation list | Useful for fast escalation without opening room. |
| Conversation selection from Ticket page | Useful when manual ticket needs existing customer context. |
| Open API create ticket alignment | Needed when external systems create tickets. |
| Multi-draft ticket creation | Useful when one conversation contains multiple issues. |
| Multi-assignee ticket ownership | Useful for escalation cases with multiple responsible agents. |
| AI suggested Ticket Type | Reduce manual selection effort. |
| AI suggested tags | Improve classification consistency. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Only one bubble can be linked to one ticket. | Agents cannot attach multiple message references in this patch. |
| Ticket page create has no linked message context by default. | Manual tickets do not show conversation preview. |
| Assignee is limited to one user. | Multi-owner workflow is not supported. |
| Additional Fields depend on Ticket Type availability. | Submit is blocked if selected Ticket Type schema cannot load. |
| Conversation list create ticket is not included. | Agents must open the room or use Ticket page. |
| Conversation selection from Ticket page is not included. | Ticket page creates tickets without linked message context by default. |

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Default field order | 1\. Tipe tiket. 2\. Assignment. 3\. Tag. 4\. Judul. 5\. Prioritas. 6\. Deskripsi. 7\. Field Tambahan. |
| Assignment state rules | 1\. No Team Inbox and no Assignee creates Unassigned ticket. 2\. Team Inbox only creates Unassigned ticket inside Team Inbox. 3\. Assignee only creates Assigned ticket without Team Inbox. 4\. Team Inbox and Assignee creates Assigned ticket inside Team Inbox only if Assignee belongs to selected Team Inbox. 5\. Team Inbox and invalid Assignee blocks submit. |
| Single bubble rule | 1\. Selected bubble count must equal 1\. 2\. Selected bubble must not already be linked to a ticket. 3\. One selected bubble creates exactly one ticket. |
| UI copy | "Buat tiket baru", "Tipe tiket", "Pilih tipe tiket", "Assignment", "Kotak masuk tim", "Pilih kotak masuk tim", "Anggota", "Pilih anggota", "Jika tidak diisi, tiket akan dibuat sebagai Unassigned", "Anggota difilter berdasarkan kotak masuk tim yang dipilih", "Tanpa kotak masuk tim, anggota dari semua tim yang valid dapat dipilih", "Anggota dipilih dihapus karena tidak termasuk kotak masuk tim", "Anggota tidak termasuk kotak masuk tim yang dipilih", "Tag", "Pilih atau tambah tag", "Judul", "Masukkan judul tiket", "Prioritas", "Pilih prioritas", "Deskripsi", "Jelaskan detail tiket", "Field Tambahan", "Pilih tipe tiket terlebih dahulu untuk menampilkan field tambahan", "Tidak ada field tambahan untuk tipe tiket ini", "Batal", "Buat tiket", "Pilih satu pesan saja untuk membuat tiket", "Pesan ini sudah terhubung ke tiket". |

