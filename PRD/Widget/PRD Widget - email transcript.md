# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Live Chat Widget \- Email Transcript to Customer  
**Product Manager**: Aryo  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-02-06 | Yusril Ibnu | Add auto email transcript to customer triggered by inactivity timeout or resolved. Add branded email header using widget logo and theme color. Add secure public transcript link with expiry. |

---

## **2\. Overview**

Email a branded transcript copy of a Live Chat conversation to the customer, configured via widget settings.

| In Scope | Out of Scope |
| ----- | ----- |
| Setting toggle in widget Appearance tab to enable or disable transcript email. | Manual "End chat" button. |
| Auto send based on inactivity timeout and resolved fallback. | Manual "Send transcript" button. |
| Branded email using widget header logo and theme color. | Editable email templates per tenant. |
| Secure public transcript link with expiring token. | Two way email replies. |
| Truncation rules for long transcripts. | File attachments included in email. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Customers need a copy of their chat history. | More repeat questions and lower trust. |
| PS-002 | Conversation can be resolved days later. | Transcript delivery is delayed or irrelevant. |
| PS-003 | Long transcripts can exceed email limits. | Higher bounce risk and poor readability. |

---

## **4\. Objectives and Key Results**

| ID | Objective | Key Result |
| ----- | ----- | ----- |
| OKR-001 | Increase customer clarity after chat. | \>= 30% of Live Chat conversations send transcript when enabled. |
| OKR-002 | Reduce repeat inquiries. | \>= 15% reduction in "ask transcript again" requests within 60 days. |
| OKR-003 | Keep deliverability stable. | Transcript email send success \>= 98%. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to enable or disable transcript email so I can control customer notifications. | 1\. Given I open `settings/channels/widget?tab=appearance`, When I toggle "Kirim transkrip ke email pelanggan" to ON, Then the setting is saved and applied to all widget accounts. 2\. Given the toggle is OFF, When a Live Chat conversation ends, Then no transcript email is sent. 3\. Given I have no permission to manage channels, When I open the widget settings page, Then I see "Akses ditolak" and the toggle is not editable. |
| US-002 | P0 | As a Customer, I want to receive a transcript after the chat ends so I have a record of what was discussed. | 1\. Given transcript email is enabled and a valid customer email exists, When inactivity timeout is reached, Then the system sends exactly 1 transcript email for that conversation. 2\. Given inactivity timeout does not occur but the conversation becomes resolved, When resolved is set and no new messages arrive before the scheduled send time, Then the system sends exactly 1 transcript email for that conversation. 3\. Given the customer email is missing or invalid, When the conversation ends, Then the system does not send email and records a skipped reason. |
| US-003 | P0 | As a Customer, I want the transcript email to match the brand of the widget so it feels official. | 1\. Given a header logo is configured in widget settings, When the transcript email is sent, Then the email header shows the same logo. 2\. Given a theme color is configured in widget settings, When the transcript email is sent, Then the email uses the same theme color for header accent and primary button. 3\. Given header logo is not configured, When the transcript email is sent, Then the email header shows the tenant name as text. |
| US-004 | P0 | As a Customer, I want access to the full transcript even if the email is truncated. | 1\. Given the transcript exceeds truncation limits, When the email is sent, Then the email includes a "Transkrip dipotong" notice and a secure link "Lihat transkrip lengkap". 2\. Given the secure link token is expired, When I open the link, Then I see "Link transkrip tidak valid atau sudah kedaluwarsa". |
| US-005 | P0 | As a Customer, I want a button in the transcript email to go back to the same live chat thread. | 1\) Given “Lanjutkan Chat” enabled and `continue_chat_url` configured, When customer clicks the button, Then it opens the configured website URL and auto-opens the widget. 2\) Given resume token is valid, When widget loads, Then it shows the **same conversation thread** (history visible) and allows sending new message. 3\) Given resume token expired/invalid, When widget loads, Then customer sees a clear message and can start a new chat. |

| Category | Requirements |
| ----- | ----- |
| Settings | FR-001: System MUST add a boolean toggle labeled "Kirim transkrip ke email pelanggan" in widget Appearance tab at `settings/channels/widget?tab=appearance`. FR-002: System MUST persist the toggle state per tenant. FR-003: System MUST restrict access to authorized roles only. FR-004: System MUST add a boolean toggle labeled "Tampilkan tombol Lanjutkan Chat" under Email Transcript section (shown only when FR-001 is ON). FR-005: System MUST add a field "Continue chat URL" (string) shown only when FR-004 is ON. FR-006: System MUST validate "Continue chat URL" as `https://` URL and block save if invalid. |
| Recipient Resolution | FR-007: System MUST resolve the customer email using priority order. 1\. Pre-chat field "Email" if collected. 2\. Session data key `customer_email` if provided. FR-008: System MUST validate email format before sending. FR-009: If no valid email exists, System MUST skip sending and store a skipped reason. |
| Triggers and Timing | FR-010: System MUST support auto send via inactivity timeout trigger. FR-011: System MUST support resolved fallback trigger when inactivity timeout is not reached. FR-012: System MUST define inactivity timeout as 20 minutes with no new messages from either side. FR-013: When conversation becomes resolved, System MUST schedule send at the later time. 1\. Now. 2\. Last message timestamp plus 20 minutes. FR-014: If a new message arrives before scheduled send, System MUST cancel and reschedule according to FR-012 and FR-013. |
| Idempotency | FR-015: System MUST send at most 1 transcript email per conversation in MVP. FR-016: System MUST enforce idempotency using a stored flag `email_transcript_sent_at` per conversation. |
| Email Content | FR-017: System MUST generate an email with these elements. 1\. Subject in Bahasa Indonesia. 2\. Brand header using widget logo or tenant name. 3\. Metadata block including conversation id and timestamps. 4\. Transcript block in chronological order. 5\. CTA button "Lihat transkrip lengkap" (secure link). 6\. CTA button "Lanjutkan Chat" (only if FR-004 is ON and URL configured). FR-018: System MUST format each transcript line as `[HH:mm] {Sender}: {Message}`. FR-019: System MUST escape user generated content to prevent HTML injection. FR-020: "Lanjutkan Chat" URL MUST be generated as `continue_chat_url + (? or &) + si_chat_resume={resume_token}` and token MUST be URL-encoded. |
| Branding | FR-021: If widget header logo exists, System MUST use it in email header. FR-022: System MUST apply widget theme color to email header accent and CTA buttons (primary \+ secondary). FR-023: If widget whitelabel is enabled, System MUST not show Satuinbox branding in the email footer. |
| Truncation | FR-024: System MUST enforce transcript size limits. 1\. Max transcript characters in email body \= 120000\. 2\. Max transcript messages in email body \= 300\. FR-025: If limits are exceeded, System MUST include only the last 100 messages and show "Transkrip dipotong". FR-026: If truncation occurs, System MUST still include the secure transcript link. |
| Secure Transcript Link | FR-027: System MUST generate a signed share token per conversation send attempt. FR-028: System MUST set token expiry to 30 days from email sent time. FR-029: System MUST serve a public transcript view without login using the token. FR-030: Public transcript view MUST show only minimal content. 1\. Tenant brand header. 2\. Conversation metadata. 3\. Full transcript. FR-031: Public transcript view MUST not expose internal inbox UI. |
| Sending and Retries | FR-037: System MUST send email using Satuinbox outbound email system. FR-038: System MUST retry failed sends up to 3 times with exponential backoff. FR-039: System MUST record send status per conversation as sent, failed, or skipped. |
| Continue Chat (Guest and On Session Hybrid Mode) | FR-032: System MUST generate a signed resume token bound to `tenant_id`, `conversation_id`, and `widget_account_id` (if available). FR-033: System MUST support **two resume paths** for “Lanjutkan Chat”: (A) **Guest resume** using an expiring token (30 days) and (B) **Session resume** using `session-livechat.email` with no expiry while session identity matches. FR-034: Email “Lanjutkan Chat” link MUST include `si_open_livechat=1` and MAY include `si_guest_resume={guest_token}` when Guest resume is enabled. FR-035: When customer opens Continue chat URL with `si_open_livechat=1`, widget MUST auto-open after page load (client-side integration). FR-036: **Session resume (no expiry)**: If `session-livechat.email` is present and valid at resume time, widget MUST attempt to resume the latest conversation thread for that email within the same tenant and widget account. FR-037: Session resume selection rule MUST be deterministic: pick the most recent conversation for that email ordered by last activity timestamp (desc). FR-038: **Guest resume (30 days)**: If `session-livechat.email` is missing/invalid and `si_guest_resume` token is present and valid (TTL 30 days), widget MUST resume the conversation bound to that guest token within the same tenant and widget account. FR-039: If `session-livechat.email` is missing/invalid at resume time AND `si_guest_resume` is missing/invalid/expired, widget MUST open in “new chat” state and show message: "Untuk melanjutkan chat sebelumnya, silakan login atau isi email yang sama." FR-040: If the latest conversation cannot be loaded (deleted/retention/not found) for either path, widget MUST fallback to “new chat” state with message: "Riwayat chat tidak ditemukan. Silakan mulai chat baru." FR-041: Priority MUST be **Session resume first**, then Guest resume, then New chat. **Link examples:** With guest token: `{continue_chat_url}?si_open_livechat=1&si_guest_resume={guest_token}` Without guest token (session only): `{continue_chat_url}?si_open_livechat=1` |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX Message (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block enabling toggle save if settings payload is invalid. | "Gagal menyimpan. Silakan coba lagi." |
| EH-002 | Recipient | If email is missing or invalid, skip send and store skipped reason. | None. |
| EH-003 | Send Failure | Retry up to 3 times. Mark failed if still unsuccessful. | None. |
| EH-004 | Token Expired | Deny access to public transcript view. | "Link transkrip tidak valid atau sudah kedaluwarsa." |
| EH-005 | Branding Asset | If logo fetch fails, fallback to tenant name header and continue sending. | None. |

---

## **8\. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | Conversation resolved immediately after last message | Delay send until last message timestamp plus 20 minutes. |
| EC-002 | New message arrives after resolved but before scheduled send | Cancel scheduled send. Reschedule based on inactivity timeout. |
| EC-003 | Conversation reopens after transcript already sent | MVP sends only once. Do not resend. |
| EC-004 | Multiple customer emails exist across context | Use latest valid email at send time following FR-004 priority. |
| EC-005 | Transcript contains very long single message | Enforce FR-020 by character limit and truncate. |
| EC-006 | Customer forwards email to third party | Token link remains accessible until expiry. This is accepted in MVP. |
| EC-007 | Public transcript link is brute forced | Use signed token with high entropy and rate limiting on public view. |
| EC-008 | Continue chat URL not set but button enabled | Hide button, still send transcript \+ public transcript link. |
| EC-009 | Continue chat URL uses http or invalid | Block save with inline error. |
| EC-010 | Customer forwards email to third party | Third party can access until token expiry; accepted in MVP (documented risk). |
| EC-011 | Conversation already resolved/closed | Resume still opens same thread; sending a new message reactivates conversation state to ongoing (internal workflow rule). |
| EC-012 | Resume token replay / multiple devices | Allow multiple opens; enforce rate limit; conversation consistency must follow existing real-time rules. |

---

## **9\. UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Settings toggle | Add a toggle in Appearance tab labeled "Kirim transkrip ke email pelanggan". | 1\. Admin opens widget settings Appearance tab. 2\. Admin toggles ON. 3\. Admin clicks "Simpan & Aktifkan". | US-001 |
| Helper text | Show helper text under the toggle explaining timing rules. | 1\. Admin reads helper text. 2\. Admin understands email timing behavior. | US-001 |
| Helper text copy | Copy must be Bahasa Indonesia only. | Text: "Email transkrip dikirim otomatis setelah tidak ada pesan selama 20 menit atau setelah status resolved dengan jeda sesuai aturan." | US-001 |
| Public transcript view | Minimal public page for token access. | 1\. Customer clicks "Lihat transkrip lengkap". 2\. System shows transcript page or expiry message. | US-004 |
| Public transcript expired state | Display expired message and next step. | 1\. Customer opens expired link. 2\. System shows error message. | US-004 |

---

## **10\. Field and Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| email\_transcript\_enabled | boolean | true | Must be boolean. | Yes |
| inactivity\_timeout\_minutes | integer | 20 | Fixed constant in MVP. Must be 20\. | System |
| resolved\_fallback\_enabled | boolean | true | Always true in MVP. | System |
| max\_email\_transcript\_chars | integer | 120000 | Fixed constant in MVP. | System |
| max\_email\_transcript\_messages | integer | 300 | Fixed constant in MVP. | System |
| truncated\_messages\_count | integer | 100 | Fixed constant in MVP. | System |
| transcript\_share\_token\_ttl\_days | integer | 30 | Fixed constant in MVP. | System |
| customer\_email | string | user@domain.com | Must match email format. | Conditional |
| email\_transcript\_show\_continue\_chat | boolean | true | Must be boolean | No |
| continue\_chat\_url | string | `https://brand.com/?support=CV-123` | Must be valid `https://` URL | Conditional |
| resume\_token\_ttl\_days | integer | 30 | Fixed constant MVP | System |

---

## **11\. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | Email send job creation p95 \< 300 ms after trigger decision. |
| Availability | 99.9% for transcript link view endpoint. |
| Reliability | Email send success \>= 98% when recipient email is valid. |
| Security | Tenant scoping enforced. Tokens signed and unguessable. Input sanitized. |
| Privacy | Public transcript link expires in 30 days. No indexing by search engines. |
| Observability | Metrics for sent, failed, skipped, truncated, link opens, token expired opens. |
| Accessibility | Public transcript view supports keyboard navigation and readable contrast. |

---

## **12\. Dependencies and Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Internal | Satuinbox outbound email system | Rate limits or bounce spikes | Monitor send rates. Add backoff and queueing. |
| Internal | Conversation storage | Missing timestamps or ordering | Enforce canonical ordering by message created time. |
| Product | Resolved semantics | Resolved used as workflow state not end of chat | Use inactivity timeout as primary trigger. Use resolved only as fallback with delay. |
| Security | Public link sharing | Link forwarded to unintended recipient | Short TTL. High entropy token. Minimal page content. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Transcript email send success rate | \>= 98% | 30 days | Email send logs |
| Skipped rate due to missing email | Baseline tracked | 30 days | Send logs |
| Truncation rate | \< 10% | 30 days | Email generation logs |
| Public transcript link open rate | Baseline tracked | 30 days | Link view telemetry |

---

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Configurable timeout | Different businesses want different timeout thresholds. |
| Resend transcript | Customer may request resend after expiry. |
| Attachments support | Customers may need files shared in chat. |
| Localization per tenant | Email copy language per tenant preference. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| One email per conversation | No updates for reopened conversations. |
| No email attachments | Media and files are not included in email. |
| Fixed timeout and expiry | No per-tenant customization in MVP. |

---

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Public transcript link format | Use code format only: `https://app.satuinbox.com/t/{share_token}` |
| Sample email template (plain text) | See block below. |

`Subject: Transkrip Chat - {NamaBrand} - {YYYY-MM-DD}`

`Halo {NamaPelanggan},`

`Berikut salinan transkrip chat Anda.`

`Ringkasan Percakapan:`  
`- ID Percakapan: {conversation_id}`  
`- Mulai: {start_time_local}`  
`- Aktivitas Terakhir: {last_activity_time_local}`  
`- Agen: {agent_name_or_dash}`

`Aksi cepat:`  
`- Lanjutkan Chat: {continue_chat_url}?si_chat_resume={resume_token}`  
`- Lihat transkrip lengkap: {public_transcript_link}`

`Transkrip:`  
`[10:12] Pelanggan: Halo, saya mau tanya status pesanan.`  
`[10:13] Agen: Halo, boleh info nomor ordernya?`  
`[10:14] Pelanggan: INV-12345.`  
`[10:15] Agen: Terima kasih, saya cek dulu ya.`  
`[10:16] Agen: Pesanan Anda sedang diproses dan estimasi kirim besok.`

`Catatan:`  
`- Email ini adalah salinan otomatis. Mohon tidak membalas email ini.`  
`- Jika tombol “Lanjutkan Chat” tidak berfungsi, sesi mungkin sudah kedaluwarsa dan Anda perlu mulai chat baru.`

