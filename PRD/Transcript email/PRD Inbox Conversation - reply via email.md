# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Live Chat Transcript Reply via Email and Auto Linked Conversation  
 **Product Manager**: Yusril Ibnu Maulana  
 **Engineering Lead**: Naftal  
 **Design Lead**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-29 | Yusril Ibnu Maulana | Initial PRD for improving existing Live Chat transcript email with reply-to-email continuity, workspace default email sender, inbound email conversation creation, and auto-linked conversation grouping. |

## **2\. Overview**

This feature improves the existing Live Chat transcript email so customers can reply to the transcript email and continue the conversation through Email. The email reply creates a new open Email conversation, automatically links it to the original Live Chat conversation, and promotes Email as the Primary conversation after reply.

| In Scope | Out of Scope |
| ----- | ----- |
| Send transcript email when Live Chat is resolved. | Manual transcript resend from agent UI. |
| Send transcript email when Live Chat reaches inactivity timeout. | New transcript template builder. |
| Use workspace default connected email account as sender. | Agent-specific email sender. |
| Set Reply-To to the workspace default connected email account. | Multiple sender selection for transcript email. |
| Inbound email reply creates a new Email conversation. | Merging raw Live Chat and Email messages into one timeline. |
| Auto-link Email conversation to the original Live Chat conversation. | AI-based matching. |
| Promote Email conversation as Primary after customer replies. | Cross-workspace linking. |
| Add system update in original Live Chat conversation. | Email campaign or broadcast scope. |
| Audit transcript sent, reply received, auto-link, and primary change events. | Advanced analytics dashboard. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Existing Live Chat transcript email is a passive copy and does not support reply continuity. | Customers may reply to an email that is not connected to SatuInbox, causing lost follow-up context. |
| PS-002 | Transcript email sender can be different from the connected Email account. | Email replies may not be captured or linked back to SatuInbox. |
| PS-003 | Live Chat and Email follow-up can appear as separate conversations. | Agents lose context and duplicate handling increases. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enable reply continuity from Live Chat transcript email. | 95% of customer replies to transcript email create a new Email conversation within 30 seconds. |
| Preserve context across Live Chat and Email. | 95% of reply-created Email conversations are automatically linked to the correct Live Chat conversation. |
| Reduce agent confusion after customer replies by email. | 100% of linked reply flows promote Email as Primary and show a Live Chat system update. |
| Keep the implementation lean and safe. | 100% of transcript reply actions are audited with actor, timestamp, source conversation, and target conversation. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a customer, I want to receive a transcript email after my Live Chat is resolved so that I have a copy of the conversation. | 1\. Given a Live Chat conversation is marked resolved, When transcript sending is enabled, Then the system sends a transcript email to the customer email address. 2\. Given the customer email address is missing, When the Live Chat is resolved, Then the system does not send the transcript email and records a skipped audit event. 3\. Given the transcript email is sent, When the customer opens it, Then the email shows the transcript summary and transcript body. 4\. Given the transcript email is sent, When the customer replies, Then the reply is directed to the workspace default connected email account. |
| US-002 | P0 | As a customer, I want to receive a transcript email after Live Chat inactivity timeout so that I still receive the conversation summary when the session closes automatically. | 1\. Given a Live Chat conversation reaches inactivity timeout, When the system closes or resolves the conversation by timeout, Then the system sends a transcript email to the customer email address. 2\. Given both resolved and timeout triggers occur for the same conversation, When transcript email has already been sent, Then the system does not send a duplicate transcript email. 3\. Given timeout transcript sending fails, When retry is still available, Then the system retries sending up to 3 times. 4\. Given timeout transcript sending fails after retries, When the system gives up, Then the transcript status becomes failed and the audit event is recorded. |
| US-003 | P0 | As an Admin, I want transcript emails to use the workspace default email account so that email replies can be captured by SatuInbox. | 1\. Given a workspace default email account is connected and active, When transcript email is sent, Then the From and Reply-To use the workspace default email account. 2\. Given the workspace default email account is not connected, When transcript email should be sent, Then sending is blocked and the UI or audit shows "Email default workspace belum terhubung". 3\. Given the workspace default email account is inactive, When transcript email should be sent, Then sending is blocked and the audit event stores the inactive sender reason. 4\. Given the default email account changes later, When old transcript replies arrive, Then the system still resolves them using the transcript reference if the inbound email is received by any connected workspace email account. |
| US-004 | P0 | As a customer, I want to reply to the transcript email so that I can continue the case by Email without starting from zero. | 1\. Given a customer replies to a transcript email, When the inbound email is received, Then the system creates a new open Email conversation. 2\. Given the reply includes a valid transcript reference, When the Email conversation is created, Then it is automatically linked to the original Live Chat conversation. 3\. Given the same customer sends multiple replies in the same email thread, When an Email conversation already exists for that transcript reply thread, Then the system appends the message to the existing Email conversation. 4\. Given the inbound reply cannot be matched to a transcript reference, When sender email matches the Live Chat customer email, Then the system may show the Live Chat as a suggested linked conversation but must not auto-link without a valid reference. |
| US-005 | P0 | As an Agent, I want the Email reply conversation to become the Primary conversation so that follow-up handling continues in the active channel. | 1\. Given an Email reply creates a new conversation and links to the Live Chat conversation, When linking succeeds, Then the Email conversation becomes Primary. 2\. Given the Live Chat conversation was Primary before the reply, When Email becomes Primary, Then the Live Chat conversation becomes a Child conversation in the same linked group. 3\. Given the group already has other linked conversations, When the Email reply conversation is created, Then Email becomes Primary and all other conversations remain Child conversations. 4\. Given Primary promotion fails, When linking succeeds, Then the system keeps the group linked and shows "Gagal menjadikan email sebagai percakapan utama" to users with access. |
| US-006 | P0 | As an Agent, I want the original Live Chat room to show a system update after the customer replies by Email so that I know where to continue. | 1\. Given the customer replies to the transcript email, When the Email conversation is created and linked, Then the original Live Chat conversation shows a system message. 2\. Given the system message is shown, When an Agent reads the Live Chat room, Then the message says "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email.". 3\. Given the system message includes a link, When the Agent clicks it, Then the grouped room opens with the Email tab active. 4\. Given the Email conversation cannot be opened due to permission, When the Agent clicks the system message link, Then the system shows "Akses ditolak". |
| US-007 | P0 | As an Agent, I want linked Live Chat and Email conversations to appear in one grouped conversation view so that I can keep the context together. | 1\. Given a customer email reply is linked to a Live Chat conversation, When the Agent opens the grouped row, Then the Email tab appears first as Primary. 2\. Given the Live Chat conversation is linked as Child, When the Agent switches to the Live Chat tab, Then the original transcript and chat history are visible based on retention rules. 3\. Given the Email tab has unread messages, When the grouped row appears in the conversation list, Then the parent row unread count includes the Email unread count. 4\. Given the Live Chat tab has no active composer, When Email is Primary, Then the Agent replies from Email by default. |
| US-008 | P1 | As a Supervisor, I want transcript reply linking to be auditable so that follow-up ownership and customer continuity are traceable. | 1\. Given a transcript email is sent, When the send succeeds or fails, Then the system records an audit event. 2\. Given a customer reply is received, When the system creates an Email conversation, Then the system records the source transcript and target Email conversation ID. 3\. Given auto-linking succeeds, When the group is updated, Then the system records the original Live Chat ID, Email conversation ID, and Primary change. 4\. Given auto-linking fails, When the Email conversation is still created, Then the system records the failure reason and exposes the item for manual linking. |
| US-009 | P1 | As an Admin, I want safe fallback behavior when transcript reply continuity cannot be completed so that no customer reply is lost. | 1\. Given the inbound email reply is received but linking fails, When Email conversation creation succeeds, Then the Email conversation remains open and unlinked. 2\. Given the Email conversation is unlinked due to match failure, When the Agent opens Conversation Details, Then the system shows a suggested Live Chat link if a safe candidate exists. 3\. Given no safe candidate exists, When the Agent opens Conversation Details, Then no suggestion is shown. 4\. Given a retryable linking failure occurs, When the system retries, Then it retries up to 3 times without creating duplicate conversation groups. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Transcript Send Trigger | 1\. FR-001: System MUST send Live Chat transcript email when a Live Chat conversation is resolved. 2\. FR-002: System MUST send Live Chat transcript email when a Live Chat conversation reaches inactivity timeout and is closed by timeout. 3\. FR-003: System MUST prevent duplicate transcript email for the same conversation and trigger type combination. 4\. FR-004: System MUST store transcript send status as pending, sent, skipped, or failed. 5\. FR-005: System MUST retry failed transcript email sending up to 3 times for retryable failures. |
| Email Sender and Reply-To | 1\. FR-006: System MUST use the workspace default connected email account as the transcript email sender. 2\. FR-007: System MUST set Reply-To to the workspace default connected email account. 3\. FR-008: System MUST block transcript email sending if the workspace default email account is missing, disconnected, inactive, or not allowed to send. 4\. FR-009: System MUST record sender account ID and sender email address on each transcript email event. 5\. FR-010: System MUST not use a generic noreply sender for transcript emails that need reply continuity. |
| Transcript Email Content | 1\. FR-011: System MUST include conversation summary fields in the transcript email. 2\. FR-012: System MUST include the public transcript link if public transcript is enabled. 3\. FR-013: System MUST include the inline transcript body or a visible transcript section. 4\. FR-014: System MUST include customer guidance that replying to the email will continue the conversation by Email. 5\. FR-015: System MUST include a non-visible transcript reference for matching inbound replies. |
| Inbound Reply Matching | 1\. FR-016: System MUST identify customer replies using the transcript reference. 2\. FR-017: System MUST support matching by email thread reference when available. 3\. FR-018: System MUST support matching by transcript ID when email thread reference is unavailable. 4\. FR-019: System MUST not auto-link based only on customer name. 5\. FR-020: System MUST not auto-link based only on email subject if transcript reference is missing. 6\. FR-021: System MUST treat transcript reference as the highest priority match signal. |
| Email Conversation Creation | 1\. FR-022: System MUST create a new open Email conversation when a customer replies to a transcript email and no Email conversation exists for that reply thread. 2\. FR-023: System MUST append subsequent replies to the existing Email conversation for the same email thread. 3\. FR-024: System MUST set the Email conversation channel as Email. 4\. FR-025: System MUST assign the Email conversation to the same workspace and customer profile as the original Live Chat when a valid transcript reference exists. 5\. FR-026: System SHOULD inherit the original Live Chat assignee if the assignee is active and has access to Email conversations. 6\. FR-027: System MUST set the Email conversation as Unassigned if the original assignee is inactive, deleted, or lacks access. |
| Auto-Linking and Grouping | 1\. FR-028: System MUST automatically link the reply-created Email conversation to the original Live Chat conversation when a valid transcript reference exists. 2\. FR-029: System MUST keep raw Live Chat and Email message records separate. 3\. FR-030: System MUST use one flat linked conversation group with exactly one Primary conversation. 4\. FR-031: System MUST add the Live Chat conversation as a Child conversation after Email is promoted to Primary. 5\. FR-032: System MUST avoid creating duplicate linked groups for the same Live Chat and Email conversation pair. 6\. FR-033: System MUST allow manual linking if auto-linking fails and the user has permission. |
| Primary Conversation Rule | 1\. FR-034: System MUST promote the Email conversation as Primary after the customer replies to the transcript email. 2\. FR-035: System MUST demote the original Live Chat conversation to Child after the Email conversation becomes Primary. 3\. FR-036: System MUST open the grouped room on the Email tab by default after Email becomes Primary. 4\. FR-037: System MUST sort the grouped row by latest activity across Email and Live Chat conversations. |
| Live Chat System Update | 1\. FR-038: System MUST add a system message to the original Live Chat conversation after a customer reply is received through Email. 2\. FR-039: System MUST use this UI copy: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email.". 3\. FR-040: System MUST link the system message to the Email conversation tab when the user has access. 4\. FR-041: System MUST not reopen the original Live Chat conversation solely because the customer replied by Email. |
| Conversation State and SLA | 1\. FR-042: System MUST keep the original Live Chat conversation resolved after Email reply is received. 2\. FR-043: System MUST create the Email conversation as open. 3\. FR-044: System MUST start Email conversation SLA based on Email channel SLA rules. 4\. FR-045: System MUST not restart Live Chat SLA after Email reply is received. 5\. FR-046: System MUST attribute Email response events to the Email conversation and active Email assignee. |
| Permissions | 1\. FR-047: System MUST respect existing Inbox and Email channel RBAC for viewing and replying to Email conversations. 2\. FR-048: System MUST respect existing Live Chat permission for viewing the original Live Chat conversation. 3\. FR-049: System MUST hide or disable link actions when the user lacks linking permission. 4\. FR-050: System MUST prevent users without Email send permission from replying in the Email tab. |
| Audit and Observability | 1\. FR-051: System MUST audit transcript send trigger, sender account, recipient, status, and failure reason. 2\. FR-052: System MUST audit inbound email reply capture and matched transcript reference. 3\. FR-053: System MUST audit Email conversation creation. 4\. FR-054: System MUST audit auto-link success and failure. 5\. FR-055: System MUST audit Primary conversation change from Live Chat to Email. 6\. FR-056: System MUST audit Live Chat system update creation. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Missing default email account | Block transcript email sending. Store transcript status as skipped. | Show "Email default workspace belum terhubung". |
| EH-002 | Default email account disconnected | Block transcript email sending. Store reason in audit. | Show "Email default workspace tidak aktif". |
| EH-003 | Customer email missing | Do not send transcript email. Keep Live Chat resolved or timed out. | Show "Email pelanggan tidak tersedia" in audit or transcript status. |
| EH-004 | Transcript send failure | Retry up to 3 times for retryable failures. Mark failed after final failure. | Show "Gagal mengirim transkrip email". |
| EH-005 | Duplicate transcript trigger | Do not send duplicate email. Keep first transcript status. | No customer-facing UI. |
| EH-006 | Inbound reply received without valid transcript reference | Create normal Email conversation if inbound email is valid. Do not auto-link. | Show suggested link only if a safe candidate exists. |
| EH-007 | Auto-link failure | Keep Email conversation open. Retry linking up to 3 times if retryable. | Show "Gagal menautkan percakapan otomatis". |
| EH-008 | Primary promotion failure | Keep linked group. Keep current Primary if promotion fails. | Show "Gagal menjadikan email sebagai percakapan utama". |
| EH-009 | Live Chat system message creation failure | Keep Email conversation and link state. Retry system message creation. | No blocking UI. |
| EH-010 | User lacks Email access | Block opening or replying to Email conversation. | Show "Akses ditolak". |
| EH-011 | User lacks send permission | Disable Email composer. | Show "Anda tidak memiliki akses untuk membalas email". |
| EH-012 | Email thread conflict | Append to existing Email conversation if thread is already mapped. Avoid duplicate conversation. | No customer-facing UI. |
| EH-013 | Stale linked group state | Refresh latest group state before applying Primary promotion. | Show "Data berubah. Periksa kembali sebelum melanjutkan". |
| EH-014 | Public transcript link unavailable | Send email without public link if inline transcript is available. | Hide "Lihat transkrip lengkap". |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Live Chat resolved and timeout trigger fires later. | Send only one transcript email. | No duplicate email. |
| EC-002 | Customer replies multiple times in the same email thread. | Append messages to the same Email conversation. | Email tab unread count increases. |
| EC-003 | Customer changes email subject before replying. | Match still works if transcript reference is preserved. | No special UI. |
| EC-004 | Customer forwards the transcript email to another person and that person replies. | Create Email conversation from the sender who replied. Auto-link only if transcript reference is valid. | Show sender email in Email conversation. |
| EC-005 | Workspace default email account is changed after transcript sent. | Old replies are still matched if received by any connected workspace email account and transcript reference exists. | No special UI. |
| EC-006 | Original Live Chat assignee is inactive. | Email conversation becomes Unassigned. | Show "Belum ditugaskan". |
| EC-007 | Original Live Chat conversation is already in a linked group. | Add Email conversation to the existing flat group and promote Email as Primary. | Grouped room opens with Email tab active. |
| EC-008 | Email conversation already exists for the transcript thread. | Do not create a new Email conversation. Append inbound email to the existing Email conversation. | Existing Email tab becomes active on open. |
| EC-009 | Live Chat transcript public link expired or disabled. | Email reply continuity still works through email references. | Public link is hidden or unavailable. |
| EC-010 | Customer email is different from Live Chat form email. | Auto-link is allowed only if transcript reference is valid. | Show current sender in Email conversation. |
| EC-011 | Agent opens old Live Chat after Email reply. | Live Chat remains read-only or resolved based on existing rules and shows system update. | Message says "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email.". |
| EC-012 | Email channel SLA is not configured. | Apply workspace default Email SLA if available. Otherwise mark SLA as not configured. | Show "SLA belum diatur". |
| EC-013 | Linked Email conversation is deleted or inaccessible. | Keep Live Chat history and audit event. Link opens access error or unavailable state. | Show "Percakapan email tidak tersedia". |
| EC-014 | Same transcript reply arrives twice due to email delivery duplication. | Deduplicate by inbound email identity and thread reference. | No duplicate message. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Transcript Email Template | Existing transcript email with improved reply guidance and reply continuity metadata. | Customer receives transcript email. Customer reads transcript. Customer replies to continue by Email. | US-001, US-002, US-004 |
| Transcript Send Status | Internal status shown in audit, conversation timeline, or transcript event area. | System sends or skips transcript. Agent or Supervisor can inspect the result. | US-001, US-002, US-008 |
| Workspace Default Email Warning | Warning when transcript email cannot be sent because workspace default email is unavailable. | Admin checks settings or audit. System shows blocked reason. | US-003, US-009 |
| Email Conversation Tab | Grouped room tab for the new Email conversation. Email appears first after customer reply. | Agent opens grouped row. Email tab is active by default. Agent replies from Email composer. | US-005, US-007 |
| Live Chat Child Tab | Original Live Chat conversation becomes Child after Email reply. | Agent switches to Live Chat tab to review past context. Composer follows existing resolved Live Chat rules. | US-005, US-006, US-007 |
| Live Chat System Message | System update inside original Live Chat room. | Customer replies by Email. Agent opens Live Chat and sees where to continue. | US-006 |
| Linked Conversations Section | Shows Email as Primary and Live Chat as linked Child after reply. | Agent opens conversation details. Linked conversations show grouped state. | US-005, US-007 |
| Manual Link Suggestion | Suggested link state when auto-link fails but candidate is safe. | Agent opens unlinked Email conversation. Agent reviews suggested Live Chat and links manually. | US-009 |
| Loading State | Skeleton or spinner while transcript status, linked group, or Email tab loads. | Agent opens grouped conversation. System loads related records. | US-007 |
| Empty State | No linked conversation available. | Agent opens an Email conversation without safe link candidate. | US-009 |
| Error State | Retry or clear message when linked data fails to load. | Agent opens conversation details and linking data fails. | US-008, US-009 |

### **Required UI Copy**

| Context | UI Copy |
| ----- | ----- |
| Transcript email reply guidance | "Balas email ini untuk melanjutkan percakapan melalui email." |
| Missing workspace default email | "Email default workspace belum terhubung" |
| Inactive workspace default email | "Email default workspace tidak aktif" |
| Missing customer email | "Email pelanggan tidak tersedia" |
| Transcript send failed | "Gagal mengirim transkrip email" |
| Auto-link failed | "Gagal menautkan percakapan otomatis" |
| Primary promotion failed | "Gagal menjadikan email sebagai percakapan utama" |
| Live Chat system message | "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email." |
| Email send permission denied | "Anda tidak memiliki akses untuk membalas email" |
| Email conversation unavailable | "Percakapan email tidak tersedia" |
| SLA not configured | "SLA belum diatur" |
| Unassigned state | "Belum ditugaskan" |
| Access denied | "Akses ditolak" |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| live\_chat\_conversation\_id | String | CV-000123 | Must reference an existing Live Chat conversation in the same workspace. | Yes |
| transcript\_id | String | TR-000456 | Must be unique per transcript email. | Yes |
| transcript\_trigger | Enum | resolved | Allowed values: resolved, inactivity\_timeout. | Yes |
| transcript\_status | Enum | sent | Allowed values: pending, sent, skipped, failed. | Yes |
| customer\_email | Email | customer@mail.com | Must be valid email format. Required for sending transcript email. | Conditional |
| workspace\_default\_email\_account\_id | String | EMAIL-ACC-001 | Must reference a connected active workspace default email account. | Yes |
| sender\_email | Email | support@brand.com | Must match the workspace default connected email account. | Yes |
| reply\_to\_email | Email | support@brand.com | Must match the workspace default connected email account. | Yes |
| public\_transcript\_link | URL | https://app.satuinbox.com/transcript/TR-000456 | Optional. Must be valid URL if present. | No |
| email\_thread\_reference | String | ref-abc123 | Used to map subsequent replies to the same Email conversation. | Conditional |
| inbound\_email\_message\_id | String | msg-abc123 | Must be unique per inbound email message to support deduplication. | Yes |
| email\_conversation\_id | String | CV-000789 | Created when customer replies and no mapped Email conversation exists. | Conditional |
| linked\_group\_id | String | GRP-000111 | Required after auto-link succeeds. | Conditional |
| primary\_conversation\_id | String | CV-000789 | Must reference the Email conversation after reply-created linking succeeds. | Conditional |
| live\_chat\_system\_message\_id | String | MSG-000999 | Created after Email reply is linked. | Conditional |
| auto\_link\_status | Enum | linked | Allowed values: not\_required, pending, linked, failed, manual\_required. | Yes |
| failure\_reason | Text | default\_email\_missing | Required when transcript\_status or auto\_link\_status is failed or skipped. | Conditional |
| audit\_event\_id | String | AUD-000888 | Must be recorded for send, reply, link, primary change, and system message events. | Yes |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | 95% of transcript emails must be queued within 5 seconds after resolved or timeout trigger. |
| Performance | 95% of inbound email replies must create or append to an Email conversation within 30 seconds after receipt. |
| Performance | 95% of auto-linking actions must complete within 5 seconds after Email conversation creation. |
| Reliability | Transcript send retry policy must support 3 attempts for retryable failures. |
| Reliability | Auto-linking must be idempotent and must not create duplicate groups. |
| Security | Email reply references must be tenant-scoped and must not allow cross-workspace linking. |
| Privacy | Transcript content must follow existing conversation visibility and retention rules. |
| Privacy | Email headers and audit logs must not expose unnecessary message body content. |
| Accessibility | Email and grouped room UI must support keyboard navigation and visible focus states. |
| Observability | System must track transcript sent, skipped, failed, email reply received, auto-link success, auto-link failure, and Primary promotion failure. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Workspace default Email account setting | Product and Engineering | Transcript reply continuity fails if not configured. | Block sending and show clear setup warning. |
| Email inbound processing | Engineering | Customer replies may not create conversations. | Add monitoring for inbound email capture and failure rate. |
| Existing transcript email system | Engineering | Existing transcript flow needs minimal patching. | Reuse current transcript generation and only add sender, reply, reference, and audit rules. |
| Linked Conversations grouping | Engineering | Auto-linking depends on stable group behavior. | Use flat group model and idempotent linking. |
| SLA per Email channel | Product and Engineering | Email follow-up SLA may be missing. | Fallback to workspace Email SLA or show "SLA belum diatur". |
| Misconfigured default sender | Admin | Transcript cannot be sent. | Add settings validation and blocked-send audit. |
| False auto-linking | Product and Engineering | Wrong customer context can be exposed. | Require valid transcript reference for auto-link. |
| Duplicate inbound emails | Engineering | Duplicate Email conversations or messages can appear. | Deduplicate by inbound email identity and thread reference. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Transcript email send success rate | 95% or higher | 30 days after release | Email send logs |
| Reply-created Email conversation rate | 95% or higher for valid replies | 30 days after release | Inbound email logs |
| Auto-link success rate | 95% or higher for replies with valid transcript reference | 30 days after release | Linking logs |
| Incorrect auto-link incident rate | Less than 0.1% | Ongoing | QA audit and support tickets |
| Primary promotion success rate | 99% or higher | Ongoing | Conversation group logs |
| Duplicate transcript email rate | Less than 0.5% | Ongoing | Transcript logs |
| Agent manual relink rate | Less than 5% of transcript replies | 60 days | Product analytics |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Manual resend transcript | Agents may need to resend transcript after customer requests another copy. |
| Team Inbox email sender | Some teams may need reply continuity through team-specific sender accounts. |
| Transcript template settings | Brands may need configurable copy, language, and layout. |
| Customer portal continuation | Customer may continue from transcript link instead of email reply. |
| Advanced matching fallback | More matching signals may reduce manual linking when references are stripped. |
| Analytics for channel switching | Teams may want to measure Live Chat to Email continuation rate. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Sender uses workspace default email account only. | Team-specific or agent-specific sender behavior is not supported in this phase. |
| Auto-link requires valid transcript reference. | Replies with stripped references may need manual linking. |
| Live Chat remains resolved after Email reply. | Agents must continue from Email, not reopen the Live Chat. |
| Raw messages are not merged into one timeline. | Agents use grouped tabs to review Live Chat and Email separately. |
| Transcript email is triggered only by resolved and inactivity timeout. | Manual send is not included in this phase. |
| Public transcript link is optional. | Reply continuity must not depend on the public transcript page. |

## **16\. Appendix**

| Item | Definition |
| ----- | ----- |
| Live Chat conversation | The original widget-based conversation where the customer first contacted the business. |
| Transcript email | Email sent after Live Chat resolved or inactivity timeout that contains conversation summary and transcript. |
| Workspace default email account | The connected Email account configured as the default sender for workspace-level emails. |
| Email conversation | New open conversation created when a customer replies to the transcript email. |
| Linked conversation group | Flat group that connects related conversations while keeping raw records separate. |
| Primary conversation | Main conversation shown first in grouped room and used as default handling context. |
| Child conversation | Linked conversation shown after the Primary conversation in the grouped room. |
| Transcript reference | Hidden or structured reference used to match inbound email replies to the original transcript and Live Chat conversation. |
| Inactivity timeout | System-defined condition where Live Chat is closed or resolved after no activity for the configured period. |

| Flow | Expected Result |
| ----- | ----- |
| Live Chat resolved, customer email exists, workspace default email connected | Transcript email sent from workspace default email. |
| Live Chat timeout, customer email exists, workspace default email connected | Transcript email sent from workspace default email. |
| Customer replies to transcript email | New Email conversation created and linked to Live Chat. |
| Email conversation linked successfully | Email becomes Primary and Live Chat becomes Child. |
| Agent opens old Live Chat after reply | System message directs Agent to reply in Email. |
| Auto-link fails | Email conversation stays open and manual linking is available if permission allows. |

