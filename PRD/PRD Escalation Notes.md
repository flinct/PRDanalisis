# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Escalation Notes for Metadata Changes (Dropdown, Team Inbox, Assignee)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-23 | Yusril Ibnu Maulana | Init PRD for required notes on dropdown changes plus optional required notes on Team Inbox and Assignee changes for Ticket and Conversation. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Require short internal context notes when users change key routing metadata so handoffs are clear and auditable. |
| Scope | Add lean checkbox settings and enforce a mandatory note prompt on change actions in Ticket and Conversation. |

| In Scope | Out of Scope |
| ----- | ----- |
| Ticket Type per-dropdown checkbox: require note when changed. | Conditional rules by specific option value transitions. |
| Ticket Type global checkboxes: require note when changing Team Inbox and Assignee. | Bulk edit and mass update flows. |
| Conversation per-dropdown checkbox: require note when changed. | Attachments in notes. |
| Conversation Global Settings checkboxes: require note when changing Team Inbox and Assignee. | External notifications and escalations automation triggered by notes. |
| Timeline entry recorded for each gated change. | Customer-visible notes. |

---

## **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Routing and ownership changes often happen without rationale. | Handoffs slow down and require back-and-forth to clarify. |
| 2 | Metadata changes are hard to audit consistently. | Compliance and operational reviews become unreliable. |
| 3 | Dropdown custom fields used for escalation lack context. | Teams mis-handle escalations and increase rework. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve handoff clarity for routing changes. | \>= 90% of gated changes include a valid note within 30 days of release. |
| Improve auditability of lifecycle actions. | \>= 95% of gated changes appear in timeline within 5 seconds (p95). |
| Minimize admin setup complexity. | Admin can enable any toggle in \<= 10 seconds per setting. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want a checkbox in Ticket Type dropdown field settings to require a note when the dropdown value changes so that escalations have context. | 1\. Given a Ticket Type dropdown field settings page, When Admin enables **"Wajib isi catatan saat diubah"**, Then the setting is saved and persists after refresh. 2\. Given the checkbox is OFF, When a user changes that dropdown value, Then no note prompt is shown. 3\. Given the checkbox is ON, When a user changes that dropdown value, Then a required note prompt appears before save. |
| US-002 | P0 | As an Admin, I want global checkboxes in Ticket Type settings to require a note when changing Team Inbox or Assignee so that routing changes have rationale. | 1\. Given Ticket Type settings page, When Admin enables **"Wajib isi catatan saat ganti Team Inbox"**, Then the setting is saved and persists after refresh. 2\. Given Ticket Type settings page, When Admin enables **"Wajib isi catatan saat ganti Assignee"**, Then the setting is saved and persists after refresh. 3\. Given both are OFF, When a user changes Team Inbox or Assignee, Then no note prompt is shown. |
| US-003 | P0 | As an Admin, I want a checkbox in Conversation dropdown field settings to require a note when the dropdown value changes so that conversation escalations have context. | 1\. Given a Conversation dropdown field settings page, When Admin enables **"Wajib isi catatan saat diubah"**, Then the setting is saved and persists after refresh. 2\. Given the checkbox is ON, When a user changes that dropdown value, Then a required note prompt appears before save. |
| US-004 | P0 | As an Admin, I want global checkboxes in Conversation settings to require a note when changing Team Inbox or Assignee so that conversation routing changes have rationale. | 1\. Given Conversation Global Settings page, When Admin enables **"Wajib isi catatan saat ganti Team Inbox"**, Then the setting is saved and persists after refresh. 2\. Given Conversation Global Settings page, When Admin enables **"Wajib isi catatan saat ganti Assignee"**, Then the setting is saved and persists after refresh. |
| US-005 | P0 | As an Agent or Supervisor, I want the system to block my change until I provide a valid note when a relevant toggle is enabled so that context is always captured. | 1\. Given a gated change is attempted, When user submits an empty note, Then the system blocks save and shows **"Catatan wajib diisi."**. 2\. Given a gated change is attempted, When user cancels the note prompt, Then the system does not apply the change and keeps the previous value. 3\. Given a gated change is attempted, When user submits a valid note, Then the change is saved and the note is stored with the change record. |
| US-006 | P0 | As an Agent or Supervisor, I want the required note prompt to appear for Team Inbox change and Assignee change when enabled so that routing changes are documented. | 1\. Given Team Inbox note requirement is enabled, When user changes Team Inbox, Then the required note prompt appears before save. 2\. Given Assignee note requirement is enabled, When user changes Assignee, Then the required note prompt appears before save. |
| US-007 | P0 | As a Supervisor, I want to see each gated change and note in the timeline so that I can audit why the change happened. | 1\. Given a gated change was saved, When viewing the timeline, Then an entry shows field type, old value, new value, actor, timestamp, and note text. 2\. Given the timeline service is temporarily unavailable, When the change is saved, Then the system retries timeline recording without blocking the user and shows **"Riwayat sedang disinkronkan."**. |
| US-008 | P1 | As an Admin, I want consistent behavior across UI and API updates so that rules cannot be bypassed unintentionally. | 1\. Given a gated change is attempted via an API update, When note is missing, Then the system rejects the change and returns an error that can be surfaced as **"Catatan wajib diisi."**. 2\. Given a gated change is attempted via an API update, When note is present and valid, Then the change is saved and recorded in the timeline. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Configuration and Defaults | FR-001: System MUST provide a per-dropdown-field checkbox **"Wajib isi catatan saat diubah"** for Ticket Type dropdown custom fields. FR-002: System MUST provide a per-dropdown-field checkbox **"Wajib isi catatan saat diubah"** for Conversation dropdown custom fields. FR-003: System MUST provide Ticket Type global checkboxes **"Wajib isi catatan saat ganti Team Inbox"** and **"Wajib isi catatan saat ganti Assignee"**. FR-004: System MUST provide Conversation Global Settings checkboxes **"Wajib isi catatan saat ganti Team Inbox"** and **"Wajib isi catatan saat ganti Assignee"**. FR-005: All checkboxes MUST default to OFF for existing tenants and for newly created fields and ticket types. FR-006: Only Owner and Admin MUST be able to change these settings. |
| What Changes Are Gated | FR-007: System MUST treat a dropdown change as any update where new value is not equal to old value. FR-008: System MUST gate Team Inbox change when the relevant global checkbox is ON for the entity type and scope. FR-009: System MUST gate Assignee change when the relevant global checkbox is ON for the entity type and scope. FR-010: System MUST NOT require a note when setting initial values during entity creation, including initial Team Inbox and initial Assignee assignment during create flow. FR-011: System MUST gate post-create changes from empty to a value and from a value to empty if clearing is allowed. |
| Note Capture and Save Rules | FR-012: System MUST prompt for a note before applying the gated change. FR-013: System MUST allow the user to cancel the note prompt and MUST keep the old value unchanged. FR-014: System MUST block save if note is invalid for a gated change. FR-015: System MUST store the note as plain text and MUST trim leading and trailing whitespace before validation and storage. FR-016: System MUST store actor identity and timestamp with the note and change record. |
| Timeline Recording | FR-017: System MUST create a timeline entry for each successful gated change that includes change type, old value, new value, actor, timestamp, and note text. FR-018: System MUST ensure timeline entry remains readable even if the referenced user or option label changes later by storing display values at the time of change. FR-019: System MUST support timeline retry without blocking the primary change save when timeline write fails. FR-020: System MUST mark timeline entry source as one of: UI, API, Automation. |
| Permissions | FR-021: System MUST enforce existing permissions for who can change Team Inbox, Assignee, and custom fields. FR-022: System MUST not show the note prompt if the user cannot perform the change and MUST show a permission error instead. FR-023: System MUST re-check permission at save time to prevent TOCTOU issues. |
| API Behavior | FR-024: System MUST support an optional note field in update requests for Team Inbox, Assignee, and custom field updates. FR-025: If a gated change is requested via API and note is missing or invalid, System MUST reject the change with a validation error. FR-026: If a change is performed by Automation, System SHOULD bypass note requirement to avoid breaking existing flows and MUST record timeline with empty note and source Automation. |
| Localization | FR-027: All UI labels and user-facing messages defined in this PRD MUST be in Bahasa Indonesia only. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Missing note | Block save and keep old value. | Show inline error: **"Catatan wajib diisi."** |
| EH-002 | Note too long | Block save and keep old value. | Show inline error: **"Catatan terlalu panjang."** |
| EH-003 | Permission denied | Block change and do not open note prompt when permission is known. | Toast: **"Akses ditolak."** |
| EH-004 | Save failed | Do not apply change and allow retry. | Toast: **"Gagal menyimpan perubahan. Silakan coba lagi."** |
| EH-005 | Timeline write failed | Save the change and queue a retry for timeline entry. | Non-blocking info: **"Riwayat sedang disinkronkan."** |
| EH-006 | Concurrent update conflict | Reject save and refresh latest values. | Toast: **"Perubahan gagal karena data terbaru sudah berubah. Silakan coba lagi."** |
| EH-007 | Invalid dropdown option | Reject the change if option is not valid anymore. | Toast: **"Nilai tidak valid."** |
| EH-008 | API validation error | Reject the API request and return a validation error payload. | UI mapping must show: **"Catatan wajib diisi."** |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | User selects the same dropdown value | No prompt. No save. No timeline entry. |
| EC-002 | User opens note prompt then cancels | Old value remains. UI reverts selection. |
| EC-003 | Clearing a value | If clearing is allowed and rule is ON, require note and record timeline. |
| EC-004 | Change involves multiple assignees | Treat as a change if the assignee set differs and require one note per save action when rule is ON. |
| EC-005 | User changes Team Inbox and Assignee in one action | Require one note. Timeline MUST record both changes with the same note as separate entries. |
| EC-006 | User performs rapid consecutive changes | Each save requires its own note and creates its own timeline entry. |
| EC-007 | User loses network after submitting note | No change applied. UI shows save failed message and user can retry. |
| EC-008 | User permission removed while modal is open | Save fails with permission denied and no change is applied. |
| EC-009 | Dropdown option renamed after the change | Timeline shows the stored display values from the time of change. |
| EC-010 | Automation changes a gated field | Bypass note requirement and record timeline with empty note and source Automation. |
| EC-011 | API client does not send note | Request rejected if the change is gated. No partial updates applied. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Ticket Type dropdown field settings | Add checkbox below the dropdown field settings. Label: **"Wajib isi catatan saat diubah"**. Helper: **"Jika aktif, setiap perubahan nilai wajib disertai catatan."** | 1\. Admin opens Ticket Type settings. 2\. Admin opens a dropdown field settings. 3\. Admin toggles checkbox. 4\. Admin saves and sees persisted state on reload. | US-001 |
| Ticket Type escalation note global settings | Add a section "Escalation Notes" with 2 checkboxes. Labels: **"Wajib isi catatan saat ganti Team Inbox"** and **"Wajib isi catatan saat ganti Assignee"**. | 1\. Admin opens Ticket Type settings. 2\. Admin toggles one or both checkboxes. 3\. Admin saves and sees persisted state on reload. | US-002 |
| Conversation dropdown field settings | Add checkbox below the dropdown field settings. Label: **"Wajib isi catatan saat diubah"**. Helper: **"Jika aktif, setiap perubahan nilai wajib disertai catatan."** | 1\. Admin opens Conversation settings. 2\. Admin opens a dropdown field settings. 3\. Admin toggles checkbox. 4\. Admin saves and sees persisted state on reload. | US-003 |
| Conversation global settings | Add a section "Escalation Notes" with 2 checkboxes. Labels: **"Wajib isi catatan saat ganti Team Inbox"** and **"Wajib isi catatan saat ganti Assignee"**. | 1\. Admin opens Conversation Global Settings. 2\. Admin toggles one or both checkboxes. 3\. Admin saves and sees persisted state on reload. | US-004 |
| Note prompt modal | Modal title: **"Isi catatan perubahan"**. Textarea label: **"Catatan"**. Placeholder: **"Tulis alasan perubahan."** Buttons: **"Batal"** and **"Simpan"**. | 1\. User changes a gated value. 2\. Modal opens before change is applied. 3\. User enters note and clicks Simpan to proceed. 4\. User clicks Batal to cancel and revert UI state. | US-005, US-006 |
| Modal loading state | Disable **"Simpan"** while submitting. Keep **"Batal"** enabled until submission starts. | 1\. User clicks Simpan. 2\. Button shows loading state and is disabled until response. 3\. On failure, re-enable inputs and show error message. | US-005 |
| Timeline entry rendering | Timeline entry includes change type label, old value, new value, actor, timestamp, and note content. | 1\. User saves gated change with note. 2\. Timeline shows new entry within 5 seconds (p95). | US-007 |
| Timeline sync message | When timeline write is delayed, show non-blocking message. | 1\. Change is saved. 2\. System shows **"Riwayat sedang disinkronkan."** until timeline is recorded or timeout reached. | US-007 |

---

## **10\. Field & Validation**

| Field Name | Type | Example Value | Validation | Required/Optional |
| ----- | ----- | ----- | ----- | ----- |
| require\_note\_on\_dropdown\_change | Boolean | true | Default false. Stored per dropdown field. | Optional |
| require\_note\_on\_team\_inbox\_change | Boolean | true | Default false. Stored per Ticket Type and per Conversation Global Settings. | Optional |
| require\_note\_on\_assignee\_change | Boolean | true | Default false. Stored per Ticket Type and per Conversation Global Settings. | Optional |
| change\_note | Text | "Customer minta refund karena paket rusak" | 1\. Trim whitespace. 2\. Minimum 1 character after trim. 3\. Maximum 1000 characters. 4\. Plain text only. | Conditional |
| change\_type | Enum | "team\_inbox" | Must be one of: dropdown\_field, team\_inbox, assignee. | System |
| old\_display\_value | Text | "Sales" | Store display value at time of change. Max 200 chars. | System |
| new\_display\_value | Text | "Finance" | Store display value at time of change. Max 200 chars. | System |
| actor\_id | ID | "usr\_123" | Must reference a valid user. | System |
| occurred\_at | Timestamp | "2026-01-23T10:00:00+07:00" | Must be stored in ISO 8601 with timezone. | System |
| source | Enum | "UI" | Must be one of: UI, API, Automation. | System |

---

## **11\. Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | Note modal open time \<= 200 ms after user action (p95). Timeline entry visible \<= 5 seconds after save (p95). |
| Reliability | Change save MUST be idempotent on retry. Timeline write retry policy: 3 retries with exponential backoff. |
| Security | Settings edits restricted to Owner and Admin. Change actions respect existing permissions. |
| Privacy | Notes are internal-only. Notes are visible only to users with access to the entity. |
| Observability | Track events: note\_prompt\_shown, note\_save\_succeeded, note\_save\_blocked, timeline\_write\_failed, timeline\_write\_succeeded. |
| Accessibility | Modal supports keyboard navigation, focus trap, and visible focus order. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Timeline system must store lifecycle entries consistently. | Engineering | High | Use existing timeline patterns and add a new event type for gated changes. |
| Confusion about scope of toggles across Ticket Types. | Product | Medium | Place toggles at Ticket Type level and show helper text clarifying the scope. |
| API clients break due to new validation. | Engineering | High | Keep toggles OFF by default. Provide clear error message mapping. |
| Automation bypass reduces compliance. | Product | Medium | Record timeline with source Automation and empty note to preserve audit trail. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Adoption of require-note toggles | 20% of active tenants enable at least one toggle | 60 days | Settings telemetry |
| Note coverage on gated changes | \>= 90% | 30 days | Timeline logs |
| Timeline latency for gated entries | \<= 5 seconds (p95) | 30 days | Observability metrics |
| Reduction in internal handoff clarification messages | 20% reduction | 60 days | Internal notes and ticket room analysis |

---

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Require note only for specific transitions | Reduces friction by gating only sensitive changes. |
| Bulk edit support | Admin operations need efficiency without losing auditability. |
| Note templates | Helps agents write consistent reasons faster. |
| Reporting and export | Compliance teams may need exports of change notes. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No bulk edit flow | Users must apply changes one-by-one for gated fields. |
| No per-option transition logic | One toggle gates all changes of that field type or scope. |
| No attachments | Notes are text-only. |

---

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Glossary | Escalation Note: internal text captured when changing a gated field. Dropdown field: single-select custom field with predefined options. Team Inbox: routing target for ownership and workflow handling. Assignee: user or set of users assigned to handle an entity. |

