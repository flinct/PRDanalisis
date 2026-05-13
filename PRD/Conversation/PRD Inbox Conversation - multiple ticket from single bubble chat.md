# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Multi-Ticket Drafts from Single Chat Bubble   
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2026-01-30 | Yusril | Initial PRD for creating multiple tickets from a single bubble with cookie-persisted drafts. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable agents to create multiple tickets from one chat bubble while preserving manual inputs if the modal is closed or the page refreshes. |
| Scope | Add a multi-draft ticket creation modal that appears only when a single bubble is selected. |

| In Scope | Out of Scope                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----- | ----- |
| Single bubble selection shows ticket creation modal with addable ticket drafts. | Auto-parsing AWB list from message content. |
| Each draft is a full ticket form and can be submitted together. | Bulk import via CSV. |
| Drafts are auto-saved and restored using browser cookies. | Server-side draft storage and cross-device draft sync. |
| Tickets created reference the same selected message as context. | Changing ticket state machine and SLA rules. |
| Multi-select behavior creates 1 ticket per selected bubble and does not allow multi-draft. | Creating 1 ticket that links multiple selected messages. |

## **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | One chat bubble can contain multiple actionable items that require separate tickets. | Agents waste time creating tickets one by one and risk missing items. |
| 2 | Ticket creation inputs can be lost due to accidental modal close or page refresh. | Rework increases handling time and reduces trust in the workflow. |
| 3 | Multi-select behavior must remain predictable and fast for daily operations. | Agents avoid using multi-select if outcomes are unclear. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Reduce time to create multiple tickets from one bubble. | Median time to create 5 tickets from 1 bubble is 90 seconds or less. |
| Prevent draft loss during ticket creation. | 99% of reopened modals restore drafts after refresh or accidental close. |
| Keep multi-select flow simple and scalable. | Creating 10 tickets from 10 selected bubbles completes with 95% success rate in one submit. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want to add multiple ticket drafts from a single selected bubble so that I can create multiple tickets that reference the same context. | 1\. Given I selected exactly 1 bubble, When I click **"Buat tiket"**, Then I see a modal with 1 ticket draft. 2\. Given the modal is open, When I click **"Tambah tiket"**, Then a new ticket draft is appended and numbered. 3\. Given I added multiple drafts, When I remove a draft, Then the remaining drafts reindex and at least 1 draft always remains. 4\. Given I submit, When all drafts are valid, Then the system creates 1 ticket per draft and links each ticket to the selected bubble. 5\. Given I submit, When any draft is invalid, Then submit is blocked and each invalid draft shows field errors and an error summary is shown. |
| US-002 | P0 | As an Agent, I want drafts to persist automatically so that I do not lose manual inputs if the modal closes or the page refreshes. | 1\. Given I edited any field in any draft, When I stop typing for 1 second, Then the system saves the draft state to cookies. 2\. Given I closed the modal or refreshed the page, When I open **"Buat tiket"** again on the same bubble, Then I see the restored drafts and a banner **"Draft dipulihkan"**. 3\. Given the restored drafts exist, When I click **"Buang draft"**, Then all drafts are cleared and the modal resets to 1 empty draft. 4\. Given I successfully created all tickets, When the success state appears, Then the draft cookies for that bubble are deleted. |
| US-003 | P0 | As an Agent, I want multi-select to create 1 ticket per selected bubble so that batch creation stays consistent and fast. | 1\. Given I selected 2 or more bubbles, When I click **"Buat tiket"**, Then the system prepares 1 ticket form per bubble and does not show **"Tambah tiket"**. 2\. Given multi-select mode, When I submit, Then the system creates N tickets for N bubbles and each ticket links only to its corresponding bubble. 3\. Given multi-select mode, When I deselect bubbles until 1 remains, Then the modal switches to single-bubble mode and shows **"Tambah tiket"**. |
| US-004 | P1 | As an Agent, I want to see which tickets were created from a bubble so that I can open the correct ticket quickly. | 1\. Given tickets were created from a bubble, When I view that bubble, Then I see a badge **"Tiket: X"**. 2\. Given I click **"Tiket: X"**, When the list opens, Then I see a list of linked ticket items and I can open each ticket. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Entry Points and Modes | 1\. FR-001: System MUST support ticket creation from chat context as an in-conversation action. 2\. FR-002: System MUST detect selection mode as single-bubble or multi-select before opening the ticket creation UI. 3\. FR-003: System MUST open Single-Bubble Multi-Draft Modal only when exactly 1 bubble is selected. 4\. FR-004: System MUST open Multi-Select Batch Create UI when 2 or more bubbles are selected and MUST hide the multi-draft controls. |
| Single-Bubble Multi-Draft Modal | 1\. FR-005: Users MUST be able to add a new draft via **"Tambah tiket"**. 2\. FR-006: Users MUST be able to remove a draft via **"Hapus"** and the system MUST keep at least 1 draft present. 3\. FR-007: System MUST label drafts with an index and show draft count in the modal header. 4\. FR-008: System MUST support editing all draft fields independently per draft. |
| Ticket Creation and Context Linking | 1\. FR-009: System MUST create 1 ticket per draft on submit in single-bubble mode. 2\. FR-010: System MUST link every created ticket to the selected conversation and selected message reference as linked context. 3\. FR-011: System MUST keep linked message references as an array and MUST allow array length of 1 for this feature. 4\. FR-012: System MUST show created ticket identifiers in the success state of the modal. |
| Validation and Submission Behavior | 1\. FR-013: System MUST validate each draft independently before submit. 2\. FR-014: System MUST block submit if any draft has invalid or missing required fields. 3\. FR-015: System MUST support partial failure handling by returning per-draft results and allowing retry for failed drafts only. 4\. FR-016: System MUST prevent duplicate submit by using an idempotency key per draft for 10 minutes. |
| Cookie Draft Persistence | 1\. FR-017: System MUST auto-save draft state to browser cookies after 1 second of inactivity per field change. |
| Visibility and Navigation | 1\. FR-022: System MUST show a bubble badge **"Tiket: X"** when one or more tickets are linked to that bubble. 2\. FR-023: Users MUST be able to open linked tickets from the badge list. 3\. FR-024: System MUST keep ticket header showing the linked conversation context.  |
| Compatibility with Existing Ticketing | 1\. FR-025: System MUST keep ticket creation from chat bubbles as a core capability. 2\. FR-026: System MUST not change the ticket SLA model and ticket state machine in this feature scope. 3\. FR-027: System MUST keep ticket timeline and audit trail behavior unchanged for created tickets.  |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block submit when any required field is missing in any draft. | Show inline field error and top summary **"Ada data tiket yang belum lengkap."** |
| EH-002 | Cookie write failure | Fail open for creation flow and warn that drafts may not persist. | Show banner **"Draft gagal disimpan otomatis. Periksa pengaturan browser."** with **"Tutup"**. |
| EH-003 | Network timeout | Keep drafts and allow retry without losing inputs. | Show **"Koneksi bermasalah. Coba lagi."** and button **"Coba lagi"**. |
| EH-004 | Partial create failure | Show per-draft status and enable retry for failed drafts only. | Show summary **"Sebagian tiket gagal dibuat."** and button **"Coba lagi untuk yang gagal"**. |
| EH-005 | Permission denied | Block access to open modal and creation. | Show toast **"Akses ditolak."** |
| EH-006 | Reference message unavailable | Block submit and require user to select another bubble. | Show **"Pesan referensi tidak tersedia."** and button **"Tutup"**. |
| EH-007 | Duplicate submit | Ignore duplicate requests within 10 minutes and surface latest result. | Show **"Permintaan sedang diproses."** |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User adds 20 drafts | Block adding beyond max and keep existing drafts intact. | Disable **"Tambah tiket"** and show **"Maksimal 20 tiket dalam sekali proses."** |
| EC-002 | User opens drafts for two different bubbles | Drafts must remain isolated per bubble. | No UI message required. |
| EC-003 | User edits drafts in two tabs | Last save wins and the latest state is restored on next open. | Show **"Draft diperbarui."** when restored state differs from last visible state. |
| EC-004 | Cookie size limit exceeded | Stop auto-save and warn, but do not clear current modal state. | Show **"Draft terlalu besar untuk disimpan otomatis."** |
| EC-005 | User switches from multi-select to single select | UI must switch mode instantly and show multi-draft controls only in single select. | Show **"Mode 1 pesan."** in header subtitle. |
| EC-006 | Ticket type changes and invalidates fields | Mark impacted fields invalid and block submit until fixed. | Show **"Ada field yang perlu diperbarui."** |
| EC-007 | Attachment fields in ticket template | Do not persist binary in cookies, require re-attach after restore. | Show **"Lampiran perlu diunggah ulang."** inside the draft. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Bubble Action Button | A contextual action for ticket creation on selected bubble(s). | 1\. User selects bubble(s). 2\. User clicks **"Buat tiket"**. 3\. System opens the correct modal by selection mode. | US-001, US-003 |
| Single-Bubble Multi-Draft Modal | Modal containing multiple ticket drafts, each a full form. | 1\. Modal opens with 1 draft. 2\. User clicks **"Tambah tiket"** to append drafts. 3\. User can expand or collapse each draft panel. 4\. User clicks **"Buat semua tiket"** to submit. | US-001 |
| Restore Banner | Banner displayed when a cookie draft exists. | 1\. User opens modal for same bubble. 2\. System restores drafts. 3\. Banner shows **"Draft dipulihkan"** | US-002 |
| Multi-Select Batch Create Modal | Modal that creates 1 ticket per selected bubble without multi-draft controls. | 1\. User selects 2 or more bubbles. 2\. System shows N ticket forms or a summarized list with per-bubble forms. 3\. Submit creates N tickets. | US-003 |
| Bubble Ticket Badge | Badge showing the number of tickets linked to the bubble. | 1\. Tickets are created. 2\. Bubble shows **"Tiket: X"**. 3\. Click shows linked ticket list. | US-004 |
| Empty and Loading States | Empty and progress indicators for draft lists and submit. | 1\. If no tickets exist, badge is hidden. 2\. During submit, show loading state and disable controls. 3\. On success, show summary and ticket links. | US-001, US-003, US-004 |

## **10\. Field & Validation**

| Field Group | Field Name | Type | Example | Validation Rules | Required |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Draft Metadata | Draft Name | Text | "Tiket 1" | Max 30 chars. | Auto |
| Ticket Core | Ticket Type | Single select | "Refund" | Must be selectable by user role. | Yes |
| Ticket Core | Title | Text | "Cek AWB 123" | Min 5 chars. Max 120 chars. | Yes |
| Ticket Core | Description | Textarea | "Pelanggan kirim 5 AWB." | Max 2000 chars. | Optional |
| Assignment | Team Inbox | Single select | "Team Inbox CS" | Must be accessible by user role. | Conditional |
| Assignment | Assignee | Single select | "Agent A" | Must be active user. | Optional |
| Custom Fields | Template Fields | Mixed | Depends on template | Validate per template definition. Single-select must match allowed options. Date must be valid date. | Conditional |
| Context Link | Conversation Reference | String | "CV-000123" | Must exist. | Yes |
| Context Link | Linked Message Reference | Array | \["msg\_1"\] | Each message reference must exist in the conversation. | Yes |

| Cookie Persistence Rule | Value |
| ----- | ----- |
| Storage type | Browser cookies. |
| Draft isolation key | Workspace, user, conversation, message. |
| TTL | 7 days since last edit. |
| Save debounce | 1 second since last input change. |
| Max drafts per bubble | 20\. |
| Max cookie payload per bubble | 3000 characters. |
| Overflow behavior | Stop auto-save, show warning, keep modal state. |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Modal open time is 300 ms or less for 1 draft and 800 ms or less for 20 drafts. |
| Reliability | Bulk creation returns per-draft result within 10 seconds for 20 drafts under normal load. |
| Security | Cookies must not store sensitive customer content beyond what is necessary for draft restore. |
| Privacy | Draft cookies must expire automatically and must be deleted after successful creation. |
| Observability | Track events for modal open, add draft, remove draft, cookie save fail, submit success, submit fail. |
| Accessibility | All controls must be keyboard navigable and have clear focus order. |

## **12\. Dependencies & Risks**

| Item | Impact | Mitigation |
| ----- | ----- | ----- |
| Dependency: Ticket creation from chat context | Feature cannot work without bubble selection entry point. | Reuse existing capability for ticket creation from chat. |
| Dependency: Linked message references stored on ticket | Context link may be broken without linked references. | Ensure linked message reference is required and validated. |
| Risk: Existing PRD describes multi-bubble selection as linking multiple messages into one ticket | Potential behavior mismatch with current requirement of 1 bubble 1 ticket in multi-select. | Define multi-select as 1 ticket per bubble for this scope and document as enforced behavior. |
| Risk: Cookie limits cause lost persistence | Draft restore may fail for large drafts. | Hard limits for drafts and field sizes with clear warnings. |
| Risk: Ambiguity with conversation context binding flags | Multiple tickets from one bubble may cause unclear follow-up behavior in conversation room. | Keep this feature limited to creation and linking only and require opening the ticket to follow up. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Time to create 5 tickets from 1 bubble | 90 seconds or less median | 30 days after release | Product analytics events |
| Draft restore success rate | 99% or more | 30 days after release | Modal open and restore events |
| Submit success rate for 20 drafts | 95% or more | 30 days after release | Ticket creation results |
| Reduction in repeated manual re-entry | 30% reduction | 30 days after release | Draft recovery and abandonment analysis |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Paste multiline helper for AWB | Faster draft creation for common logistics workflows. |
| Server-side draft persistence | Cross-device continuity and reduced cookie constraints. |
| Auto-extract identifiers from message | Reduce manual entry errors and time. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Cookie-based persistence is device and browser specific | Drafts are not available across devices. |
| Payload limits for cookies | Very large descriptions or many custom fields may not persist. |
| No auto-parsing of list items | Agents must input ticket details manually. |

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Alignment to existing Ticketing PRD | Ticketing supports creating tickets from selected bubbles and uses linked message references on ticket records. |
| Reference behavior to keep unchanged | Ticket state machine, SLA tracking, and audit trail remain unchanged in this feature scope. |
| Open Questions | 1\. Should Team Inbox be mandatory in the draft form for all roles or only when the selected Ticket Type requires it. 2\. Should duplicate title or duplicate custom field values across drafts be warned or blocked. 3\. Should the badge list show ticket status and assignee in the bubble popover. |
| Definition of done | 1\. All P0 user stories pass QA with documented test cases. 2\. Cookie restore works on refresh and accidental close for 7 days. 3\. Multi-select cannot access multi-draft controls. 4\. Created tickets show correct linked message references. |

