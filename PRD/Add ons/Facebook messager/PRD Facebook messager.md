# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Facebook Messenger Channel

| Author | Yusril Ibnu |
| :---- | :---- |
| **Engineering Lead** | [Naftal Yunior](mailto:naftal.yunior@orderfaz.com)  |
| **Design Lead**  | [Resky Fernanda Witanto](mailto:resky.witanto@orderfaz.com)  |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.0 |
| **Last Updated** | 9 Januari 2026 |

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2026-01-09 | Yusril | Initial draft for Facebook Messenger channel requirements. |

---

## **2\. Overview**

Facebook Messenger channel enables Satuinbox to receive and reply to customer messages from a connected Facebook Page inside Conversations, with consistent channel setup, billing confirmation, and health monitoring. Facebook Messenger requires a Facebook Business Page and page admin permissions via Facebook sign-in.

| In Scope | Out of Scope |
| ----- | ----- |
| Connect one or more Facebook Pages as channels. | Comment management and public post  |
| Inbound message ingestion into Conversations. | Building a custom Meta app per customer. |
| Agent replies, attachments, and conversation threading. |  |
| Channel settings, enable, disable, reconnect, remove. |  |
| Billing confirmation and monthly charge per Page. |  |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Customers using Facebook Page Messenger cannot be served in Satuinbox Conversations. | Agents must switch tools, slower response, missing audit trail. |
| PS-002 | Adding a new channel is inconsistent across channel types. | Setup errors, support burden, lower add-on adoption. |
| PS-003 | Messenger reply policy windows can cause send failures if unmanaged. | Failed replies, poor customer experience, agent confusion. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enable Messenger as a first-class channel in Conversations. | At least 90% successful channel connections without support tickets within 30 days of release. |
| Reduce response-time friction for Messenger inquiries. | Median first response time improves by 20% for Messenger conversations within 60 days. |
| Make billing predictable for Messenger add-on. | 100% of connected Pages appear correctly as invoice line items next billing cycle. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to see Facebook Messenger as an available channel add-on so that I can decide to connect it. | 1\. Given I open channel marketplace, When I view available channels, Then I see "Facebook Messenger" with price per page per month and an action to add it. 2\. Given the Page is already connected, When I view the channel card, Then I see an "Active" indicator and the add action is disabled. 3\. Given I have no permission, When I open the page, Then I see an access blocked state "Akses ditolak.". |
| US-002 | P0 | As an Admin, I want to connect a Facebook Page so that messages appear in Conversations. | 1\. Given I start the setup wizard, When I sign in and select a Page, Then the system verifies connection and completes activation. 2\. Given sign-in is cancelled, When I return to Satuinbox, Then the channel remains not connected and no billing is created. 3\. Given the selected Page fails verification, When I continue, Then I see an error and can retry without duplicate charges. |
| US-003 | P0 | As an Admin, I want to confirm billing before activation so that I understand charges. | 1\. Given I reach billing step, When I review charges, Then I see prorated current period charge and monthly recurring charge. 2\. Given I do not confirm, When I click cancel, Then activation does not proceed and nothing is billed. 3\. Given activation succeeds, When I view invoices later, Then the Page appears as a line item. |
| US-004 | P0 | As an Agent, I want inbound Messenger messages to create or continue a conversation so that I can reply in one place. | 1\. Given a customer sends a message to the Page, When Satuinbox receives it, Then a conversation is created if none exists, else appended to the existing thread. 2\. Given an attachment is included, When the message arrives, Then the attachment is visible and downloadable if supported, else shown with a clear fallback message. 3\. Given delivery is delayed, When the agent opens the conversation, Then the conversation shows accurate ordering by timestamp. |
| US-005 | P0 | As an Agent, I want to reply to a Messenger conversation so that the customer receives my response. | 1\. Given I type and send a reply, When the policy window allows sending, Then the message is delivered and shown as sent. 2\. Given the policy window does not allow sending, When I try to send, Then the send is blocked with a clear reason and next step. 3\. Given a transient failure, When I retry, Then the message is not duplicated in the thread. |
| US-006 | P1 | As an Admin, I want to manage multiple Pages so that each brand or department has its own channel. | 1\. Given I have multiple Pages, When I connect them, Then each Page becomes a distinct channel with unique identifier and separate billing. 2\. Given I search channels, When I filter by type, Then I can find Messenger channels quickly. 3\. Given I rename a channel label, When I save, Then the new label appears in conversation lists and detail headers. |
| US-007 | P1 | As an Admin, I want to disable or reconnect a channel so that I can recover from outages without removing history. | 1\. Given a channel is connected, When I disable it, Then inbound ingestion stops and sending is blocked while preserving history. 2\. Given a channel is not connected, When I reconnect, Then the system runs sign-in again and returns to connected state. 3\. Given reconnection fails, When I retry, Then I see the last error and time. |
| US-008 | P1 | As an Admin, I want health and usage signals so that I can monitor reliability and ROI. | 1\. Given a channel is active, When I view channel detail, Then I see connection status, last successful message timestamp, and error rate indicator. 2\. Given usage exists, When I open analytics, Then I see messages received, messages sent, active conversations, and average response time for that channel. |
| US-009 | P2 | As an Admin, I want to remove a channel so that I stop billing and revoke access. | 1\. Given I remove a channel, When I confirm, Then the channel is removed from active channels and billing credit behavior follows billing rules. 2\. Given removal completes, When I view conversations, Then historic conversations remain viewable but sending is blocked. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Channel availability and pricing | 1\. FR-001: System MUST list Facebook Messenger as a channel add-on with price "Rp 100.000/bulan per halaman". 2\. FR-002: System MUST require a Facebook Business Page to connect Facebook Messenger. 3\. FR-003: System MUST allow multiple Messenger channels per workspace, each mapped to exactly one Page. |
| Setup wizard | 1\. FR-004: System MUST use a multi-step setup flow including selection, authentication, configuration, billing confirmation, and activation. 2\. FR-005: System MUST support saving setup progress as draft for up to 24 hours, then expire draft automatically. 3\. FR-006: System MUST complete sign-in and permissions validation within 5 minutes, else show timeout and allow retry. |
| Authentication and permissions | 1\. FR-007: System MUST support Facebook sign-in and require Page admin permissions for selected Page. 2\. FR-008: System MUST show a pre-check screen listing required access and selected Page name before final confirmation. 3\. FR-009: System MUST block connection if required permissions are missing, and show actionable UI error. |
| Page selection rules | 1\. FR-010: Admin MUST be able to select exactly one Page per connection flow. 2\. FR-011: System MUST prevent connecting the same Page twice in the same workspace. 3\. FR-012: System MUST prevent connecting a Page already connected to another workspace, unless the current user has explicit org-level override permission. 4\. FR-013: System MUST allow setting a channel label separate from the Page name. |
| Billing | 1\. FR-014: System MUST show prorated charge for current month and recurring monthly charge before activation. 2\. FR-015: System MUST require explicit billing confirmation before activation. 3\. FR-016: System MUST add the channel to billing only after activation succeeds. 4\. FR-017: System MUST apply channel removal billing behavior according to platform billing rules for prorated credit. |
| Activation and verification | 1\. FR-018: System MUST verify the connection and subscribe to required message events before marking channel as connected. 2\. FR-019: System MUST provide a "Send test message" action that validates outbound capability without creating a permanent conversation, unless customer responds. 3\. FR-020: System MUST record an audit entry for connect, reconnect, disable, enable, and remove actions. |
| Inbound messaging to Conversations | 1\. FR-021: System MUST ingest inbound user messages and create or append to a conversation thread. 2\. FR-022: System MUST store and display message timestamp, sender display name, and channel identifier. 3\. FR-023: System MUST support inbound attachments: image, video, file, and link previews when provided by the platform, else display a fallback attachment block. |
| Outbound replies from Agents | 1\. FR-024: Agent MUST be able to send text and supported attachments from the conversation composer. 2\. FR-025: System MUST enforce the Standard Messaging Window of 24 hours since last user message, and block or constrain sending outside the window. 3\. FR-026: System SHOULD support an extended manual reply allowance up to 7 days for agent responses when the connected Page has required approval, else show blocked state. 4\. FR-027: System MUST ensure idempotent send retries so a retry does not create duplicate outbound messages in the UI. |
| Channel management | 1\. FR-028: System MUST provide enable and disable without removing the channel. 2\. FR-029: System MUST allow rename or relabel of channel, and reassignment to team or department. 3\. FR-030: System MUST show connection history and provide force reconnection action. |
| Health monitoring and alerts | 1\. FR-031: System MUST show real-time connection status, last successful message timestamp, uptime indicator, and error rate. 2\. FR-032: System MUST attempt automated reconnection up to 3 times within 10 minutes when connection is lost, then stop and require manual reconnect. 3\. FR-033: System MUST alert Admin in-app when channel becomes disconnected for more than 5 minutes. |
| Usage analytics | 1\. FR-034: System MUST expose per-channel metrics: messages received, messages sent, active conversations, average response time, and resolution rate. 2\. FR-035: System MUST filter analytics by channel type and specific Page channel. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Auth cancelled | Do not create channel. Return to channel list with setup draft preserved for 24 hours. | "Masuk dibatalkan. Silakan coba lagi." |
| EH-002 | Missing permissions | Block setup. Provide retry entry point and show which permission is missing. | "Izin belum lengkap. Periksa akses Halaman dan coba lagi." |
| EH-003 | Page already connected | Block setup. Show where it is connected if same org, else generic message. | "Halaman sudah terhubung." |
| EH-004 | Verification failed | Do not mark connected. Allow retry up to 3 times, then suggest reconnect. | "Verifikasi gagal. Coba lagi." |
| EH-005 | Billing confirmation declined | Stop activation. Ensure no billing line item created. | "Aktivasi dibatalkan. Tidak ada biaya yang dikenakan." |
| EH-006 | Send blocked by policy window | Block send. Provide explanation and recommended next step. | "Tidak dapat mengirim pesan karena batas waktu balasan sudah lewat." |
| EH-007 | Transient send failure | Show retry. Retry once automatically within 3 seconds. If still fails, require manual retry. | "Gagal mengirim. Coba lagi." |
| EH-008 | Attachment unsupported | Accept message text. Replace attachment with placeholder block. | "Lampiran tidak didukung." |
| EH-009 | Channel disabled | Block inbound ingestion and outbound sending. Keep read-only access to history. | "Channel dinonaktifkan." |
| EH-010 | Rate limited by platform | Back off for 60 seconds for outbound. Queue message as failed with retry. | "Terlalu banyak permintaan. Coba lagi sebentar lagi." |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EC-001 | User blocks the Page | Outbound sends fail. Conversation remains visible. Show failure reason on message bubble. | "Pesan tidak terkirim karena pengguna memblokir Halaman." |
| EC-002 | Page name changed on Facebook | Update display name within 24 hours. Preserve channel label set in Satuinbox. | "Nama Halaman diperbarui." |
| EC-003 | Same customer messages multiple Pages | Create separate conversations per Page channel. No auto-merge across channels. | "Channel berbeda dibuat terpisah." |
| EC-004 | Customer sends multiple messages quickly | Maintain ordering by timestamp. De-duplicate only if identical payload received within 3 seconds. | "Pesan digabung otomatis." |
| EC-005 | Customer sends attachment only | Create message with attachment block even if no text. | "Lampiran" |
| EC-006 | Admin removes channel with active open conversations | Keep conversations read-only. Block sending. Mark channel as removed in header. | "Channel sudah dihapus. Riwayat tetap tersedia." |
| EC-007 | Reconnect after long downtime | Do not backfill missed history. Resume from reconnect time forward. | "Terhubung kembali." |
| EC-008 | Workspace role changes during setup | If user loses permission mid-wizard, stop and show forbidden state. | "Akses ditolak." |
| EC-009 | Multiple admins connect simultaneously | Ensure only one connection is created. Others get "already connected" result. | "Halaman sudah terhubung." |
| EC-010 | Conversation send attempt exactly at 24-hour boundary | Treat as blocked if more than 24 hours and 0 minutes since last inbound. | "Tidak dapat mengirim pesan karena batas waktu balasan sudah lewat." |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Add-ons marketplace card | Show channel icon, name, short description, price, and action. Show active badge if already connected. | 1\. User opens "Add-ons". 2\. User finds "Facebook Messenger". 3\. User clicks "Tambah channel". | US-001 |
| Setup wizard stepper | Steps: sign-in, select Page, configuration, billing confirmation, test, done. | 1\. User clicks "Tambah channel". 2\. User follows stepper until "Selesai". | US-002, US-003 |
| Sign-in screen | Explain required access and show "Masuk dengan Facebook". | 1\. User clicks "Masuk dengan Facebook". 2\. On return success continue. 3\. On cancel show EH-001. | US-002 |
| Page selection | List Pages user can administer. Single select. Show search input. | 1\. User selects one Page. 2\. User clicks "Lanjut". 3\. If Page not eligible show EH-003. | US-002 |
| Configuration form | Fields: channel label, assign team or department, optional business hours toggle, notification preferences. | 1\. User enters label. 2\. User selects team. 3\. User clicks "Lanjut". | US-006 |
| Billing confirmation step | Show prorated and recurring charges, require checkbox acknowledgment. | 1\. User reviews amounts. 2\. User checks "Saya setuju". 3\. User clicks "Konfirmasi dan aktifkan". | US-003 |
| Test connection step | Button to run a connectivity test and show result. | 1\. User clicks "Uji koneksi". 2\. Show loading state. 3\. Show success or EH-004. | US-002 |
| Channel list row or card | Show: channel label, Page name, status badge, monthly cost, last message timestamp, actions menu. | 1\. User opens "Channels". 2\. User searches "Messenger". 3\. User opens actions menu. | US-006, US-007, US-008 |
| Channel detail page | Tabs: Overview, Settings, Health, Usage. Show reconnect and disable actions. | 1\. User opens detail. 2\. User views health. 3\. User clicks "Hubungkan ulang" if needed. | US-007, US-008 |
| Conversation list indicators | Show Messenger icon and channel label on each conversation row. | 1\. Agent sees conversation list. 2\. Agent filters by channel. 3\. Agent opens conversation. | US-004 |
| Conversation header | Show Page channel and customer identity, plus messaging window status badge. | 1\. Agent opens conversation. 2\. Header shows "Batas balasan" badge state. | US-004, US-005 |
| Composer blocked state | Disable send button when outside allowed window, show tooltip and CTA to view policy help. | 1\. Agent types message. 2\. If blocked, send disabled and reason shown. | US-005 |
| Message bubble failure state | Outbound message shows failed status with "Coba lagi" action. | 1\. Send fails. 2\. Bubble shows retry. 3\. Retry uses idempotency. | US-005 |
| Remove channel modal | Confirmation modal with irreversible warning and billing impact statement. | 1\. Admin clicks "Hapus". 2\. Modal shows billing effects. 3\. Admin confirms. | US-009 |
| Global states | Loading skeletons, empty states, and error banners with retry. | 1\. Page loads. 2\. Show skeleton. 3\. On error show "Coba lagi". | US-001..US-009 |

---

## **10\. Field & Validation**

| Field | Constraints | Validation Behavior | UI Copy (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| Channel label | 1 to 50 characters. Unique per workspace per channel type. | Inline validate on blur. Block continue if duplicate. | "Nama channel sudah digunakan." |
| Selected Facebook Page | Exactly 1 Page. Must not be connected already. | Block continue if none selected. Block if already connected. | "Pilih satu Halaman." |
| Team or department assignment | Required. Must be a team the Admin can manage. | Block save if not selected. | "Pilih tim." |
| Billing acknowledgment checkbox | Required to activate. | Disable activation button until checked. | "Saya setuju dengan biaya berlangganan." |
| Status | Enum: Connected, Not connected, Disabled, Error. | Read-only field. Updated by system. | "Status" |
| Last successful message timestamp | Valid datetime. | Read-only. Show "-" if none. | "Terakhir berhasil" |
| Messaging window state | Enum: Allowed, Limited, Blocked. | Computed. Updates in real time when inbound arrives. | "Batas balasan" |
| Attachment | Max 25 MB per file. Allowed types: image, video, file. | Reject unsupported type. Allow send text only. | "Lampiran tidak didukung." |
| Remove confirmation | Must require typed confirmation of channel label if channel has at least 1 conversation. | Block confirm until matches exactly. | "Ketik nama channel untuk konfirmasi." |

---

## **11\. Non-Functional Requirements**

| Area | Target |
| ----- | ----- |
| Performance | Channel list loads in under 2 seconds for 100 channels. |
| Reliability | 99.5% monthly channel connection uptime target. |
| Observability | 100% of connect, disconnect, reconnect, disable, enable actions logged with actor and timestamp. |
| Security | Role-based access control for all channel admin actions. Secrets never shown in UI. |
| Privacy | Customer identifiers are masked in admin logs. Retention follows workspace policy defaults. |
| Accessibility | Full keyboard navigation in wizard and modals. Focus order is logical. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Meta policy limits on messaging windows | Product | Outbound messages can be blocked unexpectedly | Enforce 24-hour window in composer and show clear status. |
| Permission approval or review delays | Product | Some workspaces cannot connect | Provide clear prerequisite checklist and error messages. |
| Webhook or event delivery delays | Engineering | Late inbound messages | Display "last updated" timestamps and avoid duplicate ingestion. |
| Billing proration accuracy | Finance/Eng | Revenue leakage or disputes | Bill only after activation succeeds and audit every activation. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Successful connections | 90% of attempts succeed without support | 30 days | Channel events logs |
| Time to connect | Median setup completion under 5 minutes | 30 days | Wizard telemetry |
| Inbound ingestion reliability | 99% inbound messages appear in Conversations | 30 days | Event reconciliation |
| Send failure rate | Under 2% send failures excluding policy blocks | 30 days | Outbound delivery logs |
| Add-on revenue | Messenger add-on adoption by 20% of eligible accounts | 90 days | Billing system |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Marketing and recurring messages support | Monetization and proactive engagement, requires strict policy handling. |
| Inbox history backfill | Reduces migration friction for existing Page inboxes. |
| Advanced routing per Page | Better workload distribution across teams. |
| Unified identity across channels | Reduce duplicates when same user contacts on IG and Messenger. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No historical backfill on connect | Older Page inbox threads remain outside Satuinbox. |
| Sending constrained by platform windows | Some late replies may be blocked or limited. |
| One Page per channel connection | Multi-Page bundling requires multiple connections and billing lines. |

---

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Pricing reference | Check PRD Price list |
| Setup flow reference | Channel addition flow includes authentication, configuration, billing confirmation, and activation. |
| Policy reference | Standard Messaging Window is 24 hours. Extended manual reply allowances exist under specific platform policies |

