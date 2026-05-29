# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Availability Auto-Reply with Conversation and Ticket Templates  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead: Sabrina**

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-28 | Yusril Ibnu Maulana | Initial PRD for Availability Auto-Reply, SatuInbox Bot sender, outside office hours trigger, no available agent trigger, and separate Conversation and Ticket templates. |

## **2\. Overview**

Availability Auto-Reply sends an automatic customer-facing message through SatuInbox Bot when a customer sends an inbound message outside office hours or when no eligible agent is available. The feature supports separate templates for Conversation and Ticket contexts to keep customer communication accurate and traceable.

| In Scope | Out of Scope |
| ----- | ----- |
| Auto-reply setting inside Settings \> Organization \> Office hours \> Auto-reply. | Full automation builder. |
| Trigger for Outside general office hours. | Per-customer segment rules. |
| Trigger for No agent is available. | Channel-specific template override. |
| SatuInbox Bot as visible sender in chat room and ticket room. | Separate template per trigger. |
| Separate Conversation auto-reply template and Ticket auto-reply template. | AI-generated reply content. |
| Auto-send Ticket template to customer when inbound message belongs to active ticket context. | Auto-create ticket from auto-reply. |
| Frequency limit to prevent repeated auto-replies. | Holiday override. |
| Optional cancel if an agent replies before delay ends. | Team Inbox office hour override. |
| Always record auto-reply event in Conversation timeline. | SLA response toggle. |
| Always record auto-reply event in linked Ticket timeline when ticket context exists. | Manual timeline logging toggle. |
| Auto-reply must not count as FRT, ART, Ticket SLA response, or agent performance reply. | Advanced analytics dashboard for auto-reply. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Customers do not receive a clear response when they message outside office hours or when no agent is available. | Customer uncertainty increases and follow-up volume may rise. |
| PS-002 | Conversation and Ticket contexts currently need different auto-reply wording, but one generic template creates unclear customer communication. | Customers may not know whether their ticket update was received. |
| PS-003 | Bot replies can create reporting noise if treated as agent responses. | FRT, ART, Ticket SLA, and agent performance metrics can become misleading. |

## **4\. Objectives and Key Results**

| Objective | Measurable Result |
| ----- | ----- |
| Provide clear customer acknowledgement when the team is unavailable. | 95 percent of eligible inbound messages receive the correct auto-reply within 35 seconds when enabled. |
| Prevent duplicate or spammy auto-replies. | Less than 1 percent duplicate auto-replies per inbound message event. |
| Keep Conversation and Ticket communication context accurate. | 100 percent of active ticket inbound messages use the Ticket template. |
| Preserve SLA and agent performance accuracy. | 0 auto-reply messages are counted as FRT, ART, Ticket SLA response, or agent reply. |
| Maintain auditability. | 100 percent of sent or skipped auto-reply events are recorded in the relevant timeline or internal log. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to enable Availability Auto-Reply so customers receive a response when the team is unavailable. | 1\. Given I am an Admin or authorized Supervisor, When I open Office hours settings, Then I can see the "Auto-reply" tab. 2\. Given auto-reply is disabled, When a customer sends an inbound message, Then no auto-reply is sent. 3\. Given auto-reply is enabled and at least one trigger is selected, When a customer inbound message matches the trigger, Then the system sends one auto-reply message. 4\. Given auto-reply is enabled but no trigger is selected, When I save, Then save is blocked and the UI shows "Pilih minimal satu kondisi auto-reply.". |
| US-002 | P0 | As an Admin, I want auto-reply to trigger outside general office hours so customers understand the team is currently unavailable. | 1\. Given "Di luar jam operasional" is enabled, When a customer sends an inbound message outside General Office Hours, Then the system sends auto-reply. 2\. Given General Office Hours is not configured, When this trigger is enabled, Then save is blocked and the UI shows "Atur jam operasional terlebih dahulu.". 3\. Given the inbound message is inside General Office Hours, When only this trigger is enabled, Then no auto-reply is sent. |
| US-003 | P0 | As an Admin, I want auto-reply to trigger when no agent is available so customers know their message has been received. | 1\. Given "Tidak ada agent yang tersedia" is enabled, When a customer sends an inbound message and no eligible agent can receive the conversation, Then the system sends auto-reply. 2\. Given at least one eligible agent can receive the conversation, When a customer sends an inbound message, Then no auto-reply is sent. 3\. Given agent availability cannot be checked due to a temporary system issue, When the inbound message is processed, Then the system does not send auto-reply from this trigger and logs the check failure. |
| US-004 | P0 | As a Customer, I want to see the auto-reply sender clearly so I know it is an automatic system message. | 1\. Given an auto-reply is sent, When the customer views the message, Then the sender is shown as "SatuInbox Bot". 2\. Given an agent later replies, When the customer views the thread, Then the agent reply shows the human agent name and the bot reply remains attributed to SatuInbox Bot. |
| US-005 | P0 | As an Agent, I want bot messages to be separated from my replies so my performance metrics stay accurate. | 1\. Given SatuInbox Bot sends an auto-reply, When analytics calculate FRT, ART, Ticket SLA response, or agent replies, Then the bot message is excluded. 2\. Given I open the conversation room, When a bot message exists, Then it is visually identifiable as a bot message and not editable as an agent reply. |
| US-006 | P0 | As an Admin, I want separate templates for Conversation and Ticket contexts so the message wording matches the customer situation. | 1\. Given I open Auto-reply settings, When I view Message templates, Then I see "Template percakapan" and "Template tiket". 2\. Given the Conversation template is empty, When I save, Then save is blocked and the UI shows "Template percakapan wajib diisi.". 3\. Given the Ticket template is empty, When I save, Then save is blocked and the UI shows "Template tiket wajib diisi.". 4\. Given both templates are valid, When I save, Then both templates are stored successfully. |
| US-007 | P0 | As a Customer with an active ticket, I want ticket-related auto-reply to confirm my ticket update was received. | 1\. Given my inbound message belongs to an active ticket context, When auto-reply trigger matches, Then the system sends the Ticket template to me automatically. 2\. Given my inbound message does not belong to an active ticket context, When auto-reply trigger matches, Then the system sends the Conversation template to me automatically. 3\. Given both Conversation and Ticket context can be detected, When auto-reply trigger matches, Then Ticket context takes priority and only the Ticket template is sent. |
| US-008 | P0 | As a Supervisor, I want auto-reply activity to be traceable in Conversation and Ticket timelines. | 1\. Given a Conversation auto-reply is sent, When I open the conversation timeline, Then I see an event with sender, reason, timestamp, and context. 2\. Given a Ticket auto-reply is sent, When I open the ticket timeline, Then I see an event with sender, reason, linked conversation, timestamp, and context. 3\. Given a timeline log fails, When the customer message was already sent, Then the system retries timeline logging without sending another customer message. |
| US-009 | P0 | As an Admin, I want frequency control so customers are not spammed by repeated auto-replies. | 1\. Given frequency is set to once every 12 hours, When the same conversation receives repeated customer messages within 12 hours, Then only one Conversation auto-reply is sent. 2\. Given frequency is set to once every 12 hours, When the same active ticket receives repeated customer messages within 12 hours, Then only one Ticket auto-reply is sent. 3\. Given two different tickets receive inbound messages, When both match triggers, Then frequency is evaluated separately per ticket. |
| US-010 | P0 | As an Admin, I want to cancel auto-reply when an agent replies first so customers do not receive unnecessary bot messages. | 1\. Given "Batalkan jika agent membalas lebih dulu" is enabled, When an agent replies before the delay ends, Then the pending auto-reply is canceled. 2\. Given "Batalkan jika agent membalas lebih dulu" is enabled, When no agent replies before the delay ends, Then SatuInbox Bot sends the auto-reply. 3\. Given "Batalkan jika agent membalas lebih dulu" is disabled, When the trigger matches, Then auto-reply is sent immediately. 4\. Given the cancel setting is disabled, When the settings form renders, Then the delay input is hidden. |
| US-011 | P1 | As an Admin, I want a preview for Conversation and Ticket templates so I can verify customer-facing output before saving. | 1\. Given I select "Percakapan" in preview context, When variables are available, Then the preview renders the Conversation template using sample values. 2\. Given I select "Tiket" in preview context, When variables are available, Then the preview renders the Ticket template using sample values. 3\. Given a variable has no sample value, When preview is rendered, Then the preview uses fallback sample text and does not break the UI. |
| US-012 | P1 | As an authorized user, I want unsaved changes protection so settings are not lost accidentally. | 1\. Given I modify Auto-reply settings, When I try to leave the page without saving, Then the system shows "Perubahan belum disimpan.". 2\. Given I choose "Tetap di halaman", When the dialog closes, Then my unsaved changes remain visible. 3\. Given I choose "Keluar tanpa menyimpan", When the page changes, Then unsaved changes are discarded. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Feature Access | 1\. FR-001: System MUST provide an Auto-reply tab inside Settings \> Organization \> Office hours. 2\. FR-002: System MUST restrict Auto-reply settings access to Admin and authorized Supervisor roles. 3\. FR-003: System MUST hide Auto-reply settings from Agent roles unless explicit permission is granted. |
| Main Toggle | 1\. FR-004: System MUST provide one main toggle for Availability Auto-Reply. 2\. FR-005: System MUST not evaluate or send auto-reply when the main toggle is disabled. 3\. FR-006: System MUST require at least one trigger when the main toggle is enabled. |
| Trigger Evaluation | 1\. FR-007: System MUST evaluate auto-reply only when a customer inbound message is received. 2\. FR-008: System MUST NOT trigger auto-reply from internal notes, agent messages, system events, assignment changes, status changes, or ticket field updates. 3\. FR-009: System MUST support trigger "Outside general office hours". 4\. FR-010: System MUST support trigger "No agent is available". 5\. FR-011: System MUST apply trigger priority when multiple triggers match. 6\. FR-012: System MUST send only one auto-reply per inbound message event. |
| Trigger Priority | 1\. FR-013: System MUST evaluate Outside general office hours before No agent is available. 2\. FR-014: If both triggers match, System MUST send one auto-reply and record reason as "Outside general office hours". 3\. FR-015: If outside office hours does not match, System MUST evaluate No agent is available. |
| Outside Office Hours | 1\. FR-016: System MUST use the tenant General Office Hours as the source of truth for outside office hours. 2\. FR-017: System MUST use tenant timezone for office hour evaluation. 3\. FR-018: System MUST block saving if Outside general office hours is enabled but General Office Hours is not configured. |
| No Agent Available | 1\. FR-019: System MUST define No agent is available as zero eligible agents who can receive the conversation based on current routing and assignment rules. 2\. FR-020: System MUST evaluate only agents within the relevant Team Inbox or routing scope. 3\. FR-021: System MUST consider an agent eligible only when the agent is active, has Team Inbox access, has channel access, is online, is not Away or AUX, and is inside shift when shift enforcement is enabled. 4\. FR-022: If shift is not configured or shift enforcement is disabled, System MUST ignore shift in eligibility calculation. 5\. FR-023: If the availability check fails, System MUST fail closed for this trigger and log the issue without sending auto-reply from No agent available. |
| Context Resolution | 1\. FR-024: System MUST determine whether the inbound message belongs to Conversation context or Ticket context before rendering the template. 2\. FR-025: System MUST use Ticket context when the inbound message belongs to an active ticket thread. 3\. FR-026: System MUST use Ticket context when the inbound message arrives in a linked conversation with an active ticket. 4\. FR-027: System MUST use Conversation context when there is no active ticket context. 5\. FR-028: Ticket context MUST take priority when both contexts exist. 6\. FR-029: If multiple active tickets are linked to the same conversation, System MUST select the active ticket that owns the current customer-facing thread. 7\. FR-030: If no active ticket can be resolved, System MUST use Conversation context. |
| Template Management | 1\. FR-031: System MUST provide two editable templates. 2\. FR-032: The first template MUST be Conversation auto-reply template. 3\. FR-033: The second template MUST be Ticket auto-reply template. 4\. FR-034: System MUST require both templates when Availability Auto-Reply is enabled. 5\. FR-035: System MUST support the same template across all active channels in MVP. 6\. FR-036: System MUST NOT provide channel override in MVP. 7\. FR-037: System MUST NOT provide separate templates per trigger in MVP. |
| Template Variables | 1\. FR-038: System MUST support allowed variables: business\_name, office\_hours, next\_open\_time, conversation\_id, ticket\_id, ticket\_title. 2\. FR-039: System MUST block save when a template contains an unsupported variable. 3\. FR-040: System MUST render unavailable optional variable values as empty text or fallback text. 4\. FR-041: System MUST preserve line breaks in templates. |
| Sending Behavior | 1\. FR-042: System MUST send Conversation template when context is Conversation. 2\. FR-043: System MUST send Ticket template when context is Ticket. 3\. FR-044: Ticket auto-reply MUST be customer-facing and sent through the same customer-facing thread or linked conversation where the customer message arrived. 4\. FR-045: System MUST NOT create a separate ticket auto-reply engine outside the conversation event flow. 5\. FR-046: System MUST send the auto-reply as SatuInbox Bot. 6\. FR-047: System MUST NOT assign the auto-reply to any human agent. 7\. FR-048: System MUST NOT count auto-reply as FRT, ART, Ticket SLA response, or agent performance reply. |
| Delay and Cancellation | 1\. FR-049: System MUST provide "Cancel if agent replies first" setting. 2\. FR-050: System MUST show delay input only when cancel setting is enabled. 3\. FR-051: System MUST send auto-reply immediately when cancel setting is disabled. 4\. FR-052: System MUST schedule auto-reply after the configured delay when cancel setting is enabled. 5\. FR-053: System MUST cancel pending auto-reply if any human agent sends a customer-facing reply in the same context before delay ends. 6\. FR-054: System MUST not cancel pending auto-reply because of internal note, assignment change, ticket field update, or timeline event. |
| Frequency Limit | 1\. FR-055: System MUST apply frequency limit to prevent repeated auto-replies. 2\. FR-056: System MUST apply Conversation frequency per conversation\_id. 3\. FR-057: System MUST apply Ticket frequency per ticket\_id. 4\. FR-058: System MUST support frequency options: once every 1 hour, once every 6 hours, once every 12 hours, once every 24 hours. 5\. FR-059: Default frequency MUST be once every 12 hours. |
| Timeline and Audit | 1\. FR-060: System MUST always record sent auto-reply events in Conversation timeline. 2\. FR-061: System MUST always record sent Ticket auto-reply events in Ticket timeline. 3\. FR-062: System MUST record skipped events internally when sending is blocked due to unsupported channel, disconnected channel, invalid context, or frequency limit. 4\. FR-063: Timeline logs MUST include sender, context, reason, timestamp, and related object ID when available. 5\. FR-064: Timeline logging failures MUST be retried without resending customer messages. |
| Chat Room Display | 1\. FR-065: System MUST display auto-reply in chat room as an outbound bot message from SatuInbox Bot. 2\. FR-066: System MUST not allow users to edit bot messages as agent messages. 3\. FR-067: System MUST allow users to copy bot messages where message copy is allowed. 4\. FR-068: System MUST display delivery status if the channel supports delivery status. |
| Ticket Behavior | 1\. FR-069: System MUST send Ticket auto-reply to customer when inbound message belongs to active ticket context. 2\. FR-070: System MUST log Ticket auto-reply in both Conversation timeline and Ticket timeline. 3\. FR-071: System MUST skip external sending when a ticket has no valid customer-facing channel. 4\. FR-072: System MUST not trigger auto-reply from internal ticket notes. 5\. FR-073: If ticket is resolved before the pending delay ends, System MUST re-evaluate context before sending. |
| Idempotency | 1\. FR-074: System MUST use a stable inbound message event key to prevent duplicate auto-replies. 2\. FR-075: System MUST not send duplicate auto-reply when retrying failed timeline logging. 3\. FR-076: System MUST not send duplicate auto-reply when the same inbound event is processed more than once. |
| Dirty State | 1\. FR-077: System MUST detect unsaved changes in Auto-reply settings. 2\. FR-078: System MUST warn users before leaving the page with unsaved changes. 3\. FR-079: System MUST preserve unsaved input when the user chooses to stay on the page. |

## **7\. Error Handling**

| ID | Type | Handling | UI and UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Missing trigger | Block save when auto-reply is enabled with no trigger selected. | Show "Pilih minimal satu kondisi auto-reply.". |
| EH-002 | Missing General Office Hours | Block save when "Di luar jam operasional" is enabled but General Office Hours is not configured. | Show "Atur jam operasional terlebih dahulu.". |
| EH-003 | Conversation template empty | Block save. | Show "Template percakapan wajib diisi.". |
| EH-004 | Ticket template empty | Block save. | Show "Template tiket wajib diisi.". |
| EH-005 | Unsupported variable | Block save and highlight the variable. | Show "Variabel tidak valid.". |
| EH-006 | Invalid delay | Block save when delay is outside 1 to 300 seconds. | Show "Delay harus antara 1 sampai 300 detik.". |
| EH-007 | Invalid frequency | Reset to default once every 12 hours and show validation. | Show "Frekuensi tidak valid.". |
| EH-008 | Save failed | Keep unsaved state and allow retry. | Show "Gagal menyimpan pengaturan auto-reply. Coba lagi.". |
| EH-009 | Preview render failed | Keep editor usable and show preview fallback. | Show "Preview gagal dimuat.". |
| EH-010 | Availability check failed | Do not send No agent available auto-reply and log internally. | No customer-facing message. |
| EH-011 | Auto-reply send failed | Log failed send event and avoid aggressive retry. | Timeline or internal log shows "Auto-reply gagal dikirim.". |
| EH-012 | Channel unsupported | Skip customer-facing auto-reply and log skipped event. | Internal log shows "Channel tidak mendukung auto-reply.". |
| EH-013 | Channel disconnected | Skip or fail send based on channel capability and log failure. | Internal log shows "Channel tidak tersedia.". |
| EH-014 | Ticket outbound channel unavailable | Skip customer send and log skipped event. | Internal log shows "Channel tiket tidak tersedia untuk auto-reply.". |
| EH-015 | Timeline log failed | Retry timeline logging without resending customer message. | Show internal status "Log auto-reply sedang disinkronkan.". |
| EH-016 | Duplicate inbound event processing | Do not send another auto-reply. Return existing result. | No additional UI. |
| EH-017 | Permission denied | Hide settings from unauthorized roles or block forced access. | Show "Akses ditolak.". |
| EH-018 | Unsaved changes | Show browser or in-app confirmation before leaving. | Show "Perubahan belum disimpan.". |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI and UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Customer sends several messages rapidly in one conversation. | Send only one Conversation auto-reply based on frequency limit. | No repeated bot messages. |
| EC-002 | Customer sends several messages rapidly in one active ticket. | Send only one Ticket auto-reply based on frequency limit. | No repeated bot messages. |
| EC-003 | Outside office hours and no agent available both match. | Send one auto-reply only and record reason as Outside general office hours. | Timeline shows one event. |
| EC-004 | Agent replies before delay ends. | Cancel pending auto-reply. | No bot message is sent. |
| EC-005 | Agent replies after bot message is sent. | Keep bot message and continue normal conversation. | Bot message remains attributed to SatuInbox Bot. |
| EC-006 | Internal note is added before delay ends. | Do not cancel pending auto-reply. | No customer-facing change. |
| EC-007 | Assignment changes before delay ends. | Do not cancel pending auto-reply unless a human agent sends a customer-facing reply. | No customer-facing change. |
| EC-008 | Ticket is resolved before delay ends. | Re-evaluate context before sending. Use Conversation template if no active ticket context remains. | Timeline records final context. |
| EC-009 | Ticket is reopened before delay ends. | Use Ticket template if active ticket context is restored. | Timeline records Ticket context. |
| EC-010 | Conversation has active ticket and normal conversation context also exists. | Ticket template takes priority. | Only one bot message is sent. |
| EC-011 | Multiple active tickets are linked to one conversation. | Use the active ticket that owns the current customer-facing thread. If unclear, fallback to Conversation template and log ambiguity. | Internal log records context ambiguity. |
| EC-012 | Ticket has no linked conversation or customer-facing channel. | Do not send external auto-reply. Log skipped event. | No customer-facing message. |
| EC-013 | Email ticket thread receives inbound outside office hours. | Send Ticket template as email reply in the same thread if outbound is supported. | Ticket timeline records event. |
| EC-014 | WhatsApp linked ticket receives inbound outside office hours. | Send Ticket template in the same linked WhatsApp conversation. | Conversation and ticket timelines record event. |
| EC-015 | Template variable ticket\_id is used in Conversation template. | Allow only if variable is supported. Render empty or fallback if no ticket exists. | Preview shows fallback sample. |
| EC-016 | Unsupported channel receives inbound. | Skip auto-reply and log skipped reason. | No bot message. |
| EC-017 | Tenant timezone changes after settings are saved. | Use current tenant timezone at trigger evaluation time. | No settings migration required. |
| EC-018 | Shift is not configured. | Ignore shift in agent eligibility check. | No UI warning required. |
| EC-019 | Agent is online but AUX or Away. | Treat as not eligible for new conversation. | No customer-facing detail. |
| EC-020 | Agent is online but at max capacity. | Treat as not eligible. | No customer-facing detail. |
| EC-021 | Agent is outside shift while shift enforcement is enabled. | Treat as not eligible for new conversation. | No customer-facing detail. |
| EC-022 | Agent is outside shift but manually opens and replies. | Allow manual reply if permission allows. Cancel pending auto-reply if the reply is customer-facing and within delay. | Normal agent reply behavior. |
| EC-023 | Auto-reply setting is changed while an auto-reply is pending. | Use setting snapshot from the inbound event time. | No duplicate send. |
| EC-024 | Frequency limit is changed while old records exist. | Apply new frequency to future inbound messages only. | No migration message. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Settings entry point | Add Auto-reply tab inside Office Hours settings. UI label: "Auto-reply". | 1\. User opens "Pengaturan". 2\. User opens "Jam operasional". 3\. User selects "Auto-reply". | US-001 |
| Main toggle | Toggle to enable or disable Availability Auto-Reply. UI label: "Auto-reply ketersediaan". Helper: "Kirim pesan otomatis saat customer menghubungi di luar jam operasional atau saat tidak ada agent yang tersedia.". | 1\. User turns toggle on. 2\. Trigger section becomes editable. 3\. User turns toggle off. 4\. All fields remain visible but inactive. | US-001 |
| Trigger section | Checkboxes for trigger conditions. UI title: "Kirim auto-reply ketika". Options: "Di luar jam operasional", "Tidak ada agent yang tersedia". | 1\. User selects one or both triggers. 2\. Save is allowed only if at least one trigger is selected while toggle is on. | US-002, US-003 |
| No agent helper | Short explanation only. UI copy: "Tidak ada agent yang tersedia berarti tidak ada agent yang bisa menerima percakapan berdasarkan aturan assignment saat ini.". | 1\. User reads helper text. 2\. Detailed eligibility rules are not shown in UI. | US-003 |
| Sending rule section | Frequency and cancel behavior. UI title: "Aturan pengiriman". | 1\. User selects frequency. 2\. User enables or disables cancel if agent replies first. | US-009, US-010 |
| Frequency dropdown | UI label: "Frekuensi pengiriman". Options: "Sekali setiap 1 jam", "Sekali setiap 6 jam", "Sekali setiap 12 jam", "Sekali setiap 24 jam". | 1\. User selects frequency. 2\. System applies selected frequency after save. | US-009 |
| Cancel setting | UI label: "Batalkan jika agent membalas lebih dulu". | 1\. User checks the option. 2\. Delay field appears. 3\. User unchecks the option. 4\. Delay field is hidden. | US-010 |
| Delay field | UI label: "Delay sebelum dikirim". Suffix: "detik". Visible only if cancel setting is on. | 1\. User enters value from 1 to 300\. 2\. Invalid value blocks save. | US-010 |
| SLA note | Informational text. UI copy: "Auto-reply tidak dihitung sebagai respons SLA.". | 1\. User reads note. 2\. No setting is shown to change this behavior. | US-005 |
| Message templates section | Two template editors. UI title: "Template pesan". Labels: "Template percakapan" and "Template tiket". | 1\. User edits Conversation template. 2\. User edits Ticket template. 3\. System validates both on save. | US-006, US-007 |
| Variable helper | Shows allowed variables. UI label: "Variabel yang tersedia". Variables shown: business\_name, office\_hours, next\_open\_time, conversation\_id, ticket\_id, ticket\_title. | 1\. User copies variable. 2\. User inserts variable into template. 3\. Unsupported variables are rejected on save. | US-006, US-011 |
| Preview context dropdown | UI label: "Konteks preview". Options: "Percakapan", "Tiket". | 1\. User selects context. 2\. Preview updates using selected template. | US-011 |
| Preview panel | UI title: "Preview". Shows customer sample and SatuInbox Bot response. | 1\. User edits template. 2\. Preview updates. 3\. If preview fails, fallback state appears. | US-011 |
| Save and cancel actions | Buttons: "Batal" and "Simpan perubahan". | 1\. User clicks Save. 2\. System validates all fields. 3\. Success toast appears. 4\. User clicks Cancel. 5\. Changes are discarded after confirmation if dirty. | US-001, US-012 |
| Dirty state dialog | Dialog for unsaved changes. UI title: "Perubahan belum disimpan". Buttons: "Keluar tanpa menyimpan" and "Tetap di halaman". | 1\. User attempts to leave with unsaved changes. 2\. Dialog appears. 3\. User chooses action. | US-012 |
| Chat room bot bubble | Bot message shown as SatuInbox Bot. UI sender: "SatuInbox Bot". | 1\. Customer inbound message triggers auto-reply. 2\. Bot bubble appears in outbound side. 3\. Agent messages remain separate. | US-004, US-005 |
| Ticket timeline event | Timeline entry for ticket context. UI text: "SatuInbox Bot mengirim auto-reply tiket ke customer". | 1\. Ticket auto-reply is sent. 2\. Ticket timeline records event. | US-008 |
| Conversation timeline event | Timeline entry for all sent auto-replies. UI text: "SatuInbox Bot mengirim auto-reply ketersediaan". | 1\. Auto-reply is sent. 2\. Conversation timeline records event. | US-008 |
| Loading state | Settings loading skeleton. UI text: "Memuat pengaturan auto-reply...". | 1\. User opens tab. 2\. Skeleton appears until data loads. | US-001 |
| Empty state | Used when Office Hours is missing. UI text: "Jam operasional belum diatur.". CTA: "Atur jam operasional". | 1\. User enables outside hours trigger without Office Hours. 2\. Empty state or warning appears. | US-002 |
| Error state | Load failure state. UI text: "Gagal memuat pengaturan auto-reply.". CTA: "Coba lagi". | 1\. Settings load fails. 2\. User can retry. | US-001 |

## **10\. Field & Validation**

| Field | Type | Default | Validation Rules | Required |
| ----- | ----- | ----- | ----- | ----- |
| availability\_auto\_reply\_enabled | Boolean | false | Must be true or false. | Yes |
| trigger\_outside\_office\_hours | Boolean | true | At least one trigger must be true when main toggle is enabled. | Yes |
| trigger\_no\_agent\_available | Boolean | true | At least one trigger must be true when main toggle is enabled. | Yes |
| send\_frequency | Enum | once\_12\_hours | Allowed values: once\_1\_hour, once\_6\_hours, once\_12\_hours, once\_24\_hours. | Yes |
| cancel\_if\_agent\_replies\_first | Boolean | true | Must be true or false. | Yes |
| delay\_seconds | Integer | 30 | Required only if cancel\_if\_agent\_replies\_first is true. Minimum 1\. Maximum 300\. | Conditional |
| conversation\_template | Textarea | See Appendix | Minimum 1 character. Maximum 1000 characters. Supported variables only. | Yes |
| ticket\_template | Textarea | See Appendix | Minimum 1 character. Maximum 1000 characters. Supported variables only. | Yes |
| preview\_context | Enum | conversation | Allowed values: conversation, ticket. UI-only field. | Yes |
| allowed\_variables | List | Static | business\_name, office\_hours, next\_open\_time, conversation\_id, ticket\_id, ticket\_title. | System |
| bot\_sender\_name | String | SatuInbox Bot | Fixed value for MVP. Not editable. | System |
| timeline\_logging\_enabled | Boolean | true | Always true. Not editable. | System |
| count\_as\_sla\_response | Boolean | false | Always false. Not editable. | System |
| created\_at | Datetime | Auto | ISO timestamp. | System |
| updated\_at | Datetime | Auto | ISO timestamp. | System |
| updated\_by | User ID | Auto | Must be active Admin or authorized Supervisor. | System |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Auto-reply eligibility evaluation must complete under 500 ms at P95. |
| Performance | Auto-reply message must be queued or sent under 1 second after trigger evaluation at P95, excluding configured delay. |
| Performance | Settings page must load under 1 second at P95. |
| Reliability | Auto-reply duplicate prevention must have 99.9 percent success rate. |
| Reliability | Timeline logging must retry up to 3 times without resending customer message. |
| Security | Only Admin and authorized Supervisor roles can edit settings. |
| Security | Template rendering must not expose data outside the current tenant. |
| Privacy | Timeline and internal logs must avoid exposing unnecessary customer personal data. |
| Availability | Auto-reply setting and sending flow must follow existing messaging availability target. |
| Observability | System must track sent, skipped, failed, canceled, and duplicate-blocked auto-reply events. |
| Accessibility | Settings form must support keyboard navigation, visible focus state, and readable error messages. |
| Compatibility | Auto-reply must support all active customer-facing channels that support outbound messages. Unsupported channels must be skipped safely. |

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| General Office Hours configuration | Product and Engineering | Outside office hours trigger cannot work without valid schedule. | Block save when trigger is enabled without Office Hours. |
| Agent presence and availability state | Engineering | No agent available trigger may send incorrectly if presence is stale. | Reuse assignment eligibility logic and record availability check failures. |
| Team Inbox routing scope | Engineering | Wrong scope can cause false no-agent detection. | Evaluate only the relevant Team Inbox or routing pool. |
| Ticket context resolution | Engineering | Wrong template may be sent if active ticket detection is incorrect. | Ticket context takes priority only when active ticket ownership is clear. |
| Channel outbound capability | Engineering | Auto-reply can fail on unsupported or disconnected channels. | Capability check before send and log skipped events. |
| Timeline logging | Engineering | Missing audit trail can reduce traceability. | Retry timeline log without resending customer message. |
| SLA analytics | Product and Data | Bot messages could pollute response metrics. | Force auto-reply exclusion from FRT, ART, Ticket SLA, and agent performance. |
| Duplicate inbound processing | Engineering | Customer may receive duplicate bot messages. | Use stable inbound event idempotency key. |
| Overly generic template | Product | Ticket customers may not get clear case context. | Require separate Ticket template and support ticket variables. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Auto-reply send success rate | 95 percent or higher | 30 days after launch | Message logs |
| Duplicate auto-reply rate | Under 1 percent | 30 days after launch | Idempotency logs |
| Correct Ticket template usage | 100 percent of active ticket inbound messages | Ongoing | Context resolution logs |
| SLA pollution from bot replies | 0 counted bot replies | Ongoing | Analytics QA |
| Timeline log coverage | 100 percent for sent auto-replies | Ongoing | Timeline audit logs |
| Settings save failure rate | Under 1 percent | 30 days after launch | Product analytics |
| Auto-reply cancellation accuracy | 99 percent of pending replies canceled when agent replies first | 30 days after launch | Scheduler logs |
| Admin adoption | 50 percent of active tenants enable the feature | 60 days after launch | Product analytics |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Team Inbox office hour override | Some teams may have different operating hours. |
| Holiday calendar override | Public holidays need different availability rules. |
| Channel-specific template override | Email, WhatsApp, and Widget may need different wording later. |
| Separate template per trigger | Outside office hours and no agent available may need different wording later. |
| Send test message | Admins may need safer validation before launch. |
| Auto-reply analytics dashboard | Supervisors may need visibility into unavailable time and missed coverage. |
| Escalation when no agent is available too long | Operations may need alerting if queue is unattended. |
| Customer segment rules | VIP or enterprise customers may need different replies. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| One template per context only. | Admin cannot define different messages for each trigger. |
| Same template is used across all channels. | Channel tone cannot be customized in MVP. |
| No Team Inbox override. | All teams follow tenant General Office Hours in MVP. |
| No holiday override. | Admin must adjust General Office Hours manually during holidays. |
| No SLA response toggle. | Auto-reply is always excluded from SLA response by design. |
| No auto-create ticket. | Auto-reply only acknowledges customer messages and does not create work items. |
| No advanced automation branching. | Complex business rules are out of scope for MVP. |
| No customer segment targeting. | All customers receive the same context-based template. |

## **16\. Appendix**

### **16.1 Default Templates**

| Template | Default Copy |
| ----- | ----- |
| Conversation auto-reply | Thank you for contacting {business\_name}. Our team is currently unavailable or outside of business hours. Your message has been received and will be replied to as soon as possible. |
| Ticket auto-reply | Thank you for your message regarding ticket {ticket\_id}. Our team is currently unavailable or outside of business hours. Your update has been received and will be followed up as soon as possible. |

### **16.2 Timeline Copy**

| Context | UI Copy |
| ----- | ----- |
| Conversation timeline | SatuInbox Bot mengirim auto-reply ketersediaan. |
| Ticket timeline | SatuInbox Bot mengirim auto-reply tiket ke customer. |
| Failed send internal log | Auto-reply gagal dikirim. |
| Skipped unsupported channel | Channel tidak mendukung auto-reply. |
| Skipped unavailable channel | Channel tidak tersedia. |

### **16.3 Bot Display Rules**

| Item | Rule |
| ----- | ----- |
| Sender name | SatuInbox Bot |
| Sender type | Bot |
| Message type | Auto-reply |
| Agent attribution | None |
| SLA attribution | None |
| Editable by agent | No |
| Copy allowed | Yes, if normal message copy is allowed |
| Delivery status | Show only if supported by channel |

### **16.4 Trigger Logic Summary**

| Step | Logic |
| ----- | ----- |
| 1 | Customer sends inbound message. |
| 2 | System checks whether Availability Auto-Reply is enabled. |
| 3 | System checks trigger priority. |
| 4 | Outside general office hours is evaluated first. |
| 5 | No agent available is evaluated second. |
| 6 | System determines Conversation or Ticket context. |
| 7 | Ticket context takes priority when active ticket context exists. |
| 8 | System checks frequency limit. |
| 9 | System sends immediately or schedules delay based on cancel setting. |
| 10 | If agent replies before delay ends, pending auto-reply is canceled. |
| 11 | SatuInbox Bot sends the selected template. |
| 12 | Timeline logs are recorded. |
| 13 | Bot reply is excluded from all SLA and agent performance metrics. |

