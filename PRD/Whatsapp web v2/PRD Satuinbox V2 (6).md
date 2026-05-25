# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Web Chat Import Modes with Queue Connect  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-02-04 | Yusril Ibnu | Initial PRD for connect-only Sales access with whitelisted chat import. |
| v2.0 | 2026-04-10 | Yusril Ibnu | Replace Sales-only scope with all-role access. Add Full Import, Whitelist Only, and Exclude Conversations modes. Add queue-based connect flow with previous, next, skip, progress, and success state. Add Import Mode visibility in account list. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a queue-based WhatsApp Web connect flow that allows any permitted user to connect one or many WhatsApp accounts and define how chats are imported into Inbox using Full Import, Whitelist Only, or Exclude Conversations mode. |
| Outcome | Users can connect accounts faster, control which chats enter Inbox more safely, and see each account's import behavior clearly from the account list and account detail. |

**Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| QR-based connect flow for one or many WhatsApp Web accounts. | Changing WhatsApp behavior on the user device. |
| Queue system with progress, previous, next, skip, and success state. | Broadcast rotation logic. |
| Per-account import mode: Full Import, Whitelist Only, Exclude Conversations. | Automatic CRM enrichment of whitelist or exclude targets. |
| Post-connect selection flow for Whitelist Only and Exclude Conversations. | Automatic deletion of already imported conversations when mode changes. |
| Import mode chip visible in account list and account detail. | Rewriting old historical account data outside this feature scope. |
| Audit logs for connect, skip, mode change, and target list change. | Blocking private chatting in the WhatsApp mobile app. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Current connect flow does not support flexible chat import policies per account. | Personal or irrelevant chats may enter Inbox and create noise. |
| PS-002 | Connecting many not connected accounts one by one is slow and fragmented. | Setup time is longer and users lose progress easily. |
| PS-003 | Account list does not clearly show how each account imports chats. | Teams cannot quickly audit risk or understand account behavior. |

---

## **4\. Objectives and Key Results**

| ID | Objective | Key Result | Timeline |
| ----- | ----- | ----- | ----- |
| OKR-001 | Improve safety of WhatsApp chat import | 100% connected accounts have one explicit import mode saved. | Q2 2026 |
| OKR-002 | Improve bulk connect efficiency | 80% of selected not connected accounts can be processed in one queue session. | Q2 2026 |
| OKR-003 | Improve clarity and governance | 100% connected accounts show import mode in account list and account detail. | Q2 2026 |
| OKR-004 | Preserve reliable import behavior | 95% of valid imported chats appear in Inbox within 60 seconds of connect or target save. | Q2 2026 |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a user, I want to connect WhatsApp accounts from a queue so I can process many not connected accounts in one flow. | 1\. Given I open the queue connect flow, When the popup loads, Then I see queue progress, current position, remaining count, and the list of accounts in the queue. 2\. Given I select a queue item, When it becomes active, Then the QR section, number selector, and form show that account's current data. 3\. Given an account is already connected by another user, When I open it from queue, Then I see "Akun sudah terhubung" and the queue item is no longer connectable.4\. Given I am viewing the queue list, When I search by account name or WhatsApp number, Then the queue list shows matching items only. |
| US-002 | P0 | As a user, I want to move through the queue with previous, next, and skip so I can control my workflow. | 1\. Given I am on a queue item, When I click "Sebelumnya", Then the previous queue item opens without losing saved data for the current item. 2\. Given I do not want to connect the current item now, When I click "Lewati", Then the item status becomes skipped and the next item opens. 3\. Given I am on the last available item, When I click "Berikutnya", Then the system opens the next pending item if any, else shows a completed queue state. |
| US-003 | P0 | As a user, I want to set Full Import so all chats are imported into Inbox after connection. | 1\. Given I choose Full Import before scanning, When the account is connected, Then chat history is imported and new inbound messages from any direct chat or group chat can enter Inbox. 2\. Given Full Import is active, When a new unknown contact sends a message, Then a conversation can be created in Inbox. 3\. Given Full Import is active, When the user views account detail or account list, Then the account shows mode label "Impor Penuh". |
| US-004 | P0 | As a user, I want to set Whitelist Only so only selected conversations can enter Inbox. | 1\. Given I choose Whitelist Only and connect successfully, When the post-connect selection screen opens, Then I can select one or more conversations to allow into Inbox. 2\. Given Whitelist Only is active, When a selected personal chat or selected group conversation sends a new inbound message, Then the conversation can appear in Inbox. 3\. Given Whitelist Only is active, When a non-selected contact or group sends a new inbound message, Then the system ignores it and does not create a conversation in Inbox.4\. Given Whitelist Only is active, When the selected conversation is a group chat, Then the group conversation can appear in Inbox. |
| US-005 | P0 | As a user, I want to set Exclude Conversations so all chats are imported except selected conversations. | 1\. Given I choose Exclude Conversations and connect successfully, When the post-connect selection screen opens, Then I can select one or more conversations to exclude from Inbox. 2\. Given Exclude Conversations is active, When an unselected direct chat or unselected group sends a new inbound message, Then the conversation can appear in Inbox. 3\. Given Exclude Conversations is active, When a selected excluded target sends a new inbound message, Then the system ignores it and does not create a conversation in Inbox.4\. Given Exclude Conversations is active, When the excluded conversation is a group chat, Then the group conversation must not appear in Inbox. |
| US-006 | P0 | As a user, I want a clear success state after connection so I know the account is ready and can continue to the next queue item. | 1\. Given the QR scan succeeds, When the system confirms pairing, Then I see a success state with "WhatsApp terhubung" and "Lanjut ke nomor berikutnya dalam antrean". 2\. Given the success state is shown, When I click "Berikutnya", Then the next queue item opens. 3\. Given the queue has no more pending items, When the final item succeeds, Then I see a completed queue state instead of a next action. |
| US-007 | P0 | As a user, I want to see each account's import mode in the account list so I can quickly audit behavior. | 1\. Given I open the WhatsApp Web account list, When rows are loaded, Then each row shows an Import Mode chip. 2\. Given an account uses Full Import, Whitelist Only, or Exclude Conversations, When the row renders, Then the chip text matches the saved mode. 3\. Given import mode is missing due to old data, When the row renders, Then the system shows a fallback chip "Belum diatur". |
| US-008 | P1 | As a user, I want to search and select conversations for Whitelist Only or Exclude Conversations so I can configure targets quickly. | 1\. Given I am on the post-connect selection screen, When I search by number, account name, conversation name, or conversation text, Then matching rows are filtered. 2\. Given multiple conversation rows belong to the same target, When I select one row, Then the stored target is normalized and duplicates are not saved twice. 3\. Given I click save with no selected target in restricted modes, When validation runs, Then I see "Pilih minimal 1 percakapan". |
| US-009 | P1 | As a user, I want to change import mode after connection so I can correct or update account behavior later. | 1\. Given an account is connected, When I click "Ubah mode", Then I can select another import mode from account detail. 2\. Given I change from Full Import to a restricted mode, When I confirm, Then the new mode applies for future inbound events only and old imported conversations remain unchanged. 3\. Given I change to Whitelist Only or Exclude Conversations, When the mode is saved, Then the selection screen opens immediately to configure targets. |
| US-010 | P0 | As a compliance owner, I want audit logs for queue actions and import settings so account changes are traceable. | 1\. Given a connect attempt succeeds, fails, or is skipped, When the action completes, Then an audit log is created with actor, time, account, and result. 2\. Given import mode or target selection changes, When the save succeeds, Then an audit log is created with mode, before and after counts, and masked target summary. 3\. Given a public link is generated, When the action succeeds, Then an audit log is created with actor, account, and expiry time. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access Control | FR-001: System MUST allow all roles with WhatsApp Web module access to open the queue connect flow, connect accounts, and configure import mode. FR-002: System MUST enforce server-side authorization for connect, mode update, target save, skip, and public link actions. FR-003: System MUST NOT use role-specific labels such as Sales-only in this feature. |
| Queue System | FR-004: System MUST support queue-based connect for multiple not connected accounts in one popup or side panel flow. FR-005: System MUST show queue position, remaining count, and a progress indicator for the active queue session. FR-006: System MUST show queue item states for pending, current, connected, skipped, and failed. FR-007: Users MUST be able to move with "Sebelumnya", "Berikutnya", and "Lewati". FR-008: System MUST persist saved data per queue item while the queue session remains open. FR-009: System MUST prevent the same queue item from being connected twice in the same tenant at the same time.FR-009A: System MUST provide a queue search input that filters queue items by WhatsApp number or account name. FR-009B: System MUST update the queue list results without resetting the active queue item unless the active item no longer matches the search filter. FR-009C: System MUST show an empty queue search state when no result matches. |
| Connect Flow | FR-010: System MUST support QR connection for the active queue item. FR-011: System MUST auto-refresh expired QR for the active queue item. FR-012: System MUST support a public share link action with limited lifetime. FR-013: System MUST update account status from not connected to connected after successful pairing. FR-014: System MUST show a success state after pairing instead of keeping the QR visible. |
| Account Identity | FR-015: System MUST allow the user to save or edit Account Name for the active account. FR-016: System MUST show WhatsApp Number as the active account identity in the header. FR-017: System MUST support Account Type as a configurable field for the account if enabled in the current workspace. |
| Import Mode Model | FR-018: System MUST support exactly three import modes per account: Full Import, Whitelist Only, and Exclude Conversations. FR-019: System MUST require one import mode to be selected before the account can be marked complete. FR-020: System MUST store import mode at account level, not at conversation level. FR-021: System MUST show the current mode as a chip in account detail and in account list. |
| Full Import Behavior | FR-022: System MUST import eligible chat history after connect when Full Import is selected. FR-023: System MUST allow new inbound messages from any supported direct chat or supported group chat to create or update Inbox conversations under Full Import. FR-024: System MUST NOT require a post-connect selection step for Full Import. |
| Whitelist Only Behavior | FR-025: System MUST open a post-connect target selection screen after successful connect when Whitelist Only is selected. FR-026: System MUST allow the user to select one or more targets from existing conversation history for the account. FR-027: System MUST import chat history and allow new inbound only for selected targets under Whitelist Only. FR-028: System MUST NOT create Inbox conversations for non-selected targets under Whitelist Only. FR-029: System MUST NOT store message content for ignored inbound from non-selected targets under Whitelist Only. FR-030: System MUST store an ignored inbound counter per account for observability under Whitelist Only. |
| Exclude Conversations Behavior | FR-031: System MUST open a post-connect conversation selection screen after successful connect when Exclude Conversations is selected. FR-032: System MUST allow the user to select one or more personal chats or group conversations to exclude from Inbox.FR-033: System MUST import chat history and allow new inbound for all non-excluded conversations under Exclude Conversations. FR-034: System MUST NOT create Inbox conversations for excluded conversations under Exclude Conversations. FR-035: System MUST NOT store message content for ignored inbound from excluded conversations under Exclude Conversations. FR-036: System MUST store an ignored inbound counter per account for observability under Exclude Conversations. |
| Target Selection and Normalization | FR-037: System MUST support both personal chats and group conversations as selectable targets in Whitelist Only and Exclude Conversations modes. FR-038: System MUST normalize personal chat targets by counterpart identifier and group chat targets by group identifier before save. FR-039: System MUST prevent duplicate stored conversation targets after normalization. FR-040: System MUST allow search by number, account name, conversation title, or visible conversation text in the target selector. FR-041: System MUST require at least 1 selected target before saving Whitelist Only or Exclude Conversations mode setup. FR-042: System MUST support up to 5,000 saved targets per account across either restricted mode. |
| Import Timing | FR-043: System MUST apply saved mode immediately for future inbound processing after connect or after mode update succeeds. FR-044: System MUST import valid history within 60 seconds P95 after connect or after saving restricted mode targets. FR-045: System MUST deduplicate replayed sync events by event id and account-scoped idempotency key. |
| Mode Change Behavior | FR-046: Users MUST be able to change import mode after connection from account detail. FR-047: System MUST show a confirmation step when changing from one mode to another. FR-048: System MUST apply the new mode only for future inbound events and MUST NOT automatically delete already imported conversations. FR-049: System MUST require a new target selection save when changing into Whitelist Only or Exclude Conversations. FR-050: System MUST clear old restricted target sets when mode changes between Whitelist Only and Exclude Conversations. |
| Success and Completion | FR-051: System MUST show success state text "WhatsApp terhubung" and "Lanjut ke nomor berikutnya dalam antrean" after a successful connection regardless of import mode. FR-052: System MUST allow the user to continue to the next queue item from the success state. FR-053: System MUST show a completed queue state when there are no pending items left in the queue session. |
| Account List Visibility | FR-054: System MUST show Import Mode as a dedicated column or chip in the WhatsApp Web account list. FR-055: System MUST show mode labels for "Impor Penuh", "Hanya Whitelist", "Kecualikan Percakapan", or "Belum diatur". FR-056: System SHOULD support filtering the account list by connection status and import mode in future iterations. |
| Audit and Privacy | FR-057: System MUST log connect success, connect failure, skip, public link generation, mode change, and target list save in audit logs. FR-058: System MUST mask stored target values in logs and exports where required. FR-059: System MUST encrypt saved restricted targets at rest. FR-060: System MUST retain only counters and minimal metadata for ignored inbound events and MUST NOT persist ignored message content. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Unauthorized access | Block action and return 403\. | Show "Akses ditolak". |
| EH-002 | QR expired | Refresh QR automatically. | Show "QR kedaluwarsa. Memuat ulang". |
| EH-003 | Public link expired | Reject old link and allow regeneration. | Show "Tautan publik kedaluwarsa. Buat ulang tautan". |
| EH-004 | Account already connected | Prevent duplicate connect. | Show "Akun sudah terhubung". |
| EH-005 | Missing account name | Prevent completion for the queue item until valid. | Show "Nama akun wajib diisi". |
| EH-006 | No import mode selected | Prevent completion for the queue item until valid. | Show "Pilih mode impor". |
| EH-007 | No target selected in restricted mode | Prevent save. | Show "Pilih minimal 1 percakapan". |
| EH-008 | Duplicate target after normalization | Keep one record only. | Show "Target sudah ada". |
| EH-009 | Restricted target save failed | Do not apply new mode setup. Allow retry. | Show "Gagal menyimpan target. Coba lagi". |
| EH-010 | Queue item skipped | Mark item as skipped and move on. | Show "Akun dilewati". |
| EH-011 | No more queue items | Keep queue state stable. | Show "Semua akun dalam antrean sudah diproses". |
| EH-012 | Search returns no result | Keep selection screen active. | Show "Tidak ada percakapan". |
| EH-013 | Sync or history import failed | Mark account as connected but import pending. Allow retry. | Show "Sinkronisasi gagal. Coba lagi". |
| EH-014 | Unsaved mode change | Warn before leaving the screen or moving queue item. | Show "Perubahan belum disimpan". |
| EH-15 | Queue search no result | Keep queue state stable and do not clear active saved data. | Show "Tidak ada akun yang cocok" |
| EH-16 | No conversation selected for Exclude Conversations | Prevent save. | Show "Pilih minimal 1 percakapan". |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Two conversation rows belong to the same direct chat target | Normalize and store only one target. |
| EC-002 | Two users try to connect the same queue item at the same time | First success wins. Later attempt gets "Akun sudah terhubung". |
| EC-003 | User changes mode from Full Import to Whitelist Only after many chats were already imported | New mode applies only for future inbound. Existing imported conversations stay unchanged. |
| EC-004 | User changes mode from Whitelist Only to Exclude Conversations | Old whitelist targets are cleared and new exclude targets must be saved. |
| EC-005 | User clicks "Lewati" then returns later in the same queue session | Queue item remains skipped until user manually reopens it. |
| EC-006 | Group chat is selected in restricted mode | Store and evaluate using group identifier instead of phone number. |
| EC-007 | A new unknown direct chat sends a message under Whitelist Only | Ignore inbound and increment ignored counter. |
| EC-008 | A new unknown direct chat sends a message under Exclude Conversations | Allow import unless the target is excluded. |
| EC-009 | Target phone number changes outside the system | Treated as a new target. User must select the new chat explicitly. |
| EC-010 | Queue popup is closed mid-session | Already saved queue items remain saved. Pending items remain unchanged. |
| EC-011 | Account list row has old data with no stored import mode | Show fallback chip "Belum diatur". |
| EC-012 | History sync replays old events after reconnect | Deduplicate by event id and account idempotency key. |

`| EC-013 | Queue search hides the active item | Keep the active item open until user changes selection or clears search.`  
`| EC-014 | Same group appears in multiple message rows in selector | Normalize | and save only one group conversation target.`  
`| EC-015 | Same direct chat and group have similar display names | Use conversation identifier, not display text, as the saved key.`  
`| EC-016 | User switches from Exclude Conversations to Whitelist Only | Old excluded conversation targets are cleared and a new whitelist save is required.`  
---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Queue Sidebar | Left panel showing queue title, current position, remaining count, progress bar, and item list with statuses. | 1\. User opens queue connect flow. 2\. Sidebar shows pending, current, connected, skipped, and failed items. 3\. Clicking an item opens that account in the main panel.4\. User types in "Cari nama atau nomor". 5\. Queue list filters matching items only.  | US-001, US-002, US-006 |
| Queue Header | Top bar in main panel showing page title, active number selector, and public link action. | 1\. Active queue item loads. 2\. Header shows number and "Salin tautan". 3\. User can copy public link for the current account. | US-001, US-010 |
| Connect Form | Form for Account Name and Account Type before or during the connect flow. | 1\. User fills "Nama". 2\. User selects "Tipe akun" if applicable. 3\. Form is validated before completion. | US-001, US-006 |
| Import Mode Selector | Three-option selector for Full Import, Whitelist Only, and Exclude Conversations. | 1\. User clicks a mode option. 2\. Helper description updates immediately. 3\. Chosen mode becomes the active chip after save. | US-003, US-004, US-005 |
| Mode Description Banner | Informational banner under mode selector describing the selected mode behavior. | 1\. User changes mode. 2\. Banner text updates accordingly. 3\. Banner remains visible until connect succeeds or mode changes. | US-003, US-004, US-005 |
| QR Connect Panel | Right-side or main panel showing QR, steps, and auto-refresh state. | 1\. User scans QR. 2\. If QR expires, it refreshes automatically. 3\. On success, QR panel is replaced by success state. | US-001, US-006 |
| Success State Panel | Green success panel shown after successful pairing for any mode. | 1\. Connection succeeds. 2\. Show "WhatsApp terhubung". 3\. Show "Lanjut ke nomor berikutnya dalam antrean". 4\. User clicks "Berikutnya" or closes queue when done. | US-006 |
| Whitelist Setup Screen | Post-connect configuration screen for Whitelist Only. | 1\. After successful connect, open list titled "Pilih percakapan untuk whitelist". 2\. User searches and selects targets. 3\. User clicks "Tambahkan ke whitelist". | US-004, US-008 |
| Exclude Setup Screen | Post-connect configuration screen for Exclude Conversations. | 1\. After successful connect, open list titled "Pilih percakapan untuk dikecualikan". 2\. User searches and selects targets. 3\. User clicks "Tambahkan ke pengecualian". | US-005, US-008 |
| Account Detail Mode Chip | Account detail header showing saved mode chip and action to change mode. | 1\. User opens account detail. 2\. Header shows mode chip. 3\. User can click "Ubah mode". | US-007, US-009 |
| Account List Import Mode Column | Account list table showing one import mode chip per row. | 1\. User opens WhatsApp Web account list. 2\. Table shows column "Mode impor". 3\. Each row displays one chip matching saved mode. | US-007 |
| Queue Footer Actions | Footer showing "Sebelumnya", "Berikutnya", "Lewati", and "Tutup". | 1\. User navigates the queue manually. 2\. Buttons update enabled state based on current item and queue status. | US-002, US-006 |
| Queue Search | Search field to filter queue items by account name or WhatsApp number. | 1\. User types in "Cari nama atau nomor". 2\. Queue list filters matching items. 3\. Empty state shows "Tidak ada akun yang cocok". | US-001 |
| Empty, Loading, and Error States | Shared states for queue, selector, and account list. | 1\. Loading shows "Memuat". 2\. Empty queue shows "Tidak ada akun dalam antrean". 3\. Empty selector shows "Tidak ada percakapan". 4\. Error state shows retry CTA. | US-001, US-008 |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| WhatsApp Number | Select / Read-only | \+6281234567890 | Must belong to the active queue item or selected account. | Yes |
| Account Name | Text | Tim CS Jakarta | 1 to 50 chars. Must not be empty at completion. | Yes |
| Account Type | Select | General Account | Must be one of enabled account types in workspace. | Yes |
| Import Mode | Enum | Whitelist Only | Allowed values: Full Import, Whitelist Only, Exclude Conversations. | Yes |
| Queue Position | Read-only number | 2 of 62 | System-generated from active queue state. | System |
| Remaining Count | Read-only number | 60 remaining | System-generated from queue state. | System |
| Public Link | Button / URL | https://... | Generated on demand. Expires after 10 minutes. | No |
| Whitelist Target Selection | Multi-select list | Carlos Newmann | Minimum 1 target. Maximum 5,000 targets per account after normalization. | Conditional |
| Exclude Target Selection | Multi-select list | Group WhatsApp 1 | Minimum 1 target. Maximum 5,000 targets per account after normalization. | Conditional |
| Search Input | Text | 08123 | 0 to 100 chars. Filters visible selector rows only. | No |
| Ignored Count | Read-only number | 128 | Must never display message content. | System |

---

## **11\. Non-Functional Requirements**

| Category | Target |
| ----- | ----- |
| Performance | QR load under 2 seconds P95. Valid chat import visible in Inbox within 60 seconds P95. Queue item switch under 1 second P95. |
| Reliability | Connect success state must persist after refresh for completed items. Deduplicated replay handling must succeed for 100% repeated sync events. |
| Availability | 99% monthly uptime for connect and import mode services. |
| Security | Saved restricted targets encrypted at rest. Server-side authorization enforced for all actions. |
| Privacy | No ignored message content is stored for restricted-mode blocked inbound. Only minimal metadata and counters are allowed. |
| Observability | Metrics per account: connect success, connect failure, skipped count, ignored count, target save latency, mode distribution. |
| Accessibility | Keyboard navigation for queue items, mode selector, selection list, and footer actions. Visible focus states required. |

---

## **12\. Dependencies & Risks**

| Type | Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- | ----- |
| Dependency | WhatsApp Web connector stability | Eng | QR failure blocks account connect | Auto-refresh, retry path, and monitoring alerts. |
| Dependency | Account list service | Eng | Import mode visibility may be stale | Read-after-write refresh after save and reconnect. |
| Dependency | Inbox import processor | Eng | Valid chats may not appear on time | Queue-based import jobs with observability and retries. |
| Risk | User selects wrong mode | PM | Too many chats or too few chats enter Inbox | Clear mode descriptions and confirmation on change. |
| Risk | Restricted target misconfiguration | PM | Expected chats are blocked or allowed wrongly | Minimum selection validation, search, and clear save feedback. |
| Risk | Users expect blocked chats to disappear from WhatsApp device | CS | Confusion and support load | Clear copy that filtering applies to Inbox import only. |

---

## **13\. Success Metrics**

| KPI | Target | Window | Data Source |
| ----- | ----- | ----- | ----- |
| Accounts with explicit import mode | 100% of newly connected accounts | 30 days | Account config logs |
| Queue completion rate | \> 80% of selected queue items processed in one session | 30 days | Queue session events |
| Restricted mode save success | \> 95% | 30 days | Save action logs |
| Import mode column visibility accuracy | 100% | Ongoing | UI validation and data audit |
| Ignored content persistence incidents | 0 | Ongoing | Data audit |
| Time to connect next account in queue | \< 15 seconds median after previous success | 30 days | Queue telemetry |

---

## **14\. Future Considerations**

| Topic | Why it matters |
| ----- | ----- |
| Bulk apply the same mode to many queue items | Faster onboarding for large fleets. |
| Import mode filter in account list | Faster audit and operations review. |
| Optional cleanup tool for mode changes | Lets users remove already imported non-matching conversations explicitly. |
| Suggested targets for Whitelist Only or Exclude Conversations | Reduces manual selection effort. |
| Auto-next after success | Speeds up queue processing for power users. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Filtering applies only to Inbox import, not to WhatsApp mobile app content | Personal chats remain visible on the device. |
| Changing mode does not auto-delete previously imported conversations | Historical data remains unless handled by a separate cleanup feature. |
| Restricted modes depend on available conversation history to pick initial targets | New unseen contacts cannot be preselected before they appear in history. |
| Public link expires after 10 minutes | User must regenerate the link if it expires. |

---

## **16\. Appendix**

### **Glossary**

| Term | Definition |
| ----- | ----- |
| Queue Session | A temporary connect workflow that processes multiple not connected accounts in one flow. |
| Full Import | Account mode where all supported chats are imported into Inbox. |
| Whitelist Only | Account mode where only selected targets are imported into Inbox. |
| Exclude Conversations | Account mode where all supported chats are imported except selected targets. |
| Target | A normalized direct chat counterpart or group chat identifier stored for restricted modes. |
| Ignored Event | An inbound event that is counted but does not create a conversation in Inbox because the current mode blocks it. |

### **Audit Log Event Types**

| Event | Description |
| ----- | ----- |
| ACCOUNT\_CONNECTED | Account pairing succeeded. |
| ACCOUNT\_CONNECT\_FAILED | Account pairing failed. |
| ACCOUNT\_SKIPPED | Queue item was skipped. |
| PUBLIC\_LINK\_GENERATED | Public QR link was generated. |
| IMPORT\_MODE\_UPDATED | Import mode changed. |
| WHITELIST\_SAVED | Whitelist targets saved. |
| EXCLUDE\_SAVED | Exclude targets saved. |
| QUEUE\_COMPLETED | All queue items in the session were processed. |

