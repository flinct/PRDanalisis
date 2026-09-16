# **PRODUCT REQUIREMENT DOCUMENT**

**Feature:** Email Summary — SatuInbox Send Mode (Transcript Email Delivery via Tenant Mailbox)
**Domain:** Conversation (Live Chat transcript) × Email
**Product Manager:** Dany Christian
**Engineering Lead:** Naftal Yunior
**Related PRD:** `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (reply-via-email continuity — this PRD's **Phase 2**)
**Source Brief:** `Assessments/cross-domain/email-summary-customer/email-summary-customer-change-intake-brief.md` (v1.4)

---

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2026-08-31 | Dany Christian | Initial PRD. Phase 1 = SatuInbox sends transcript/summary email directly via tenant connected mailbox, controlled by per-tenant send-mode flag, coexisting with the existing webhook delivery. Phase 2 references the existing reply-via-email PRD. |
| v0.2 | 2026-09-15 | Dany Christian | Impact-analysis follow-up. Added: multi-mailbox default sender selection (FR-021/022, EC-004 hardened), Phase 2 activation flag (FR-023), retry-exhaustion notification (FR-024, EH-008), `both`-mode ordering rule (FR-025), rollback plan (§17). Resolves EC-004 build-blocker. |

---

## **2. Overview**

Today the Live Chat transcript is delivered as a **webhook** (`LIVECHAT_TRANSCRIPT`): on widget conversation close, SatuInbox POSTs a ready-to-use payload (`email.{subject,html,text}`) to the tenant's webhook URL, and **the tenant sends the email to the customer themselves**. Some tenants (e.g. SAP) do not want to operate a webhook consumer and want SatuInbox to send the summary email directly.

This feature adds a **SatuInbox-send mode**: SatuInbox sends the transcript/summary email to the customer directly, using the tenant's **connected Email channel account** as sender (via the existing `EMAIL_SEND_MESSAGE` SMTP path). Delivery method is chosen **per tenant** through a send-mode flag, so tenants still relying on the webhook are not affected.

Reply continuity (customer replies → new Email conversation, auto-link, primary promotion) is **Phase 2** and is fully specified in the related PRD; it is only enabled once the customer can reply to a real tenant mailbox — which Phase 1 provides.

| In Scope (Phase 1) | Out of Scope |
| ----- | ----- |
| Per-tenant send-mode flag `TRANSCRIPT_EMAIL_SEND_MODE` (`webhook` \| `email` \| `both`). | Replacing / removing the existing webhook delivery. |
| SatuInbox sends transcript email directly via tenant connected Email channel account (SMTP). | Generic SatuInbox/SES pooled sender not owned by the tenant. |
| Sender + Reply-To = tenant connected Email channel account. | Team-specific or agent-specific sender selection. |
| Mailbox precondition: mode `email`/`both` requires a connected active Email channel account. | Automatic mailbox onboarding (tenant connects mailbox themselves). |
| Reuse existing transcript trigger (widget close, scheduled), content, dedup, retry. | New transcript template builder / configurable copy. |
| Audit send attempts, sender account, delivery mode, status. | Advanced deliverability dashboard. |
| **Phase 2 (reference only):** reply → Email conversation + auto-link + primary. | Re-specifying Phase 2 here (owned by the related PRD). |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Transcript delivery is webhook-only; the tenant must operate a webhook consumer to send the email. | Tenants without webhook infra (SAP) cannot deliver transcript/summary emails to their customers. |
| PS-002 | There is no SatuInbox-side send path for transcript email. | Customers of such tenants receive nothing on close; the summary requirement is unmet. |
| PS-003 | Reply continuity (Phase 2 / related PRD) is impossible while the email is sent by an external tenant system with no controlled Reply-To. | Reply-via-email cannot be built until SatuInbox controls the sender/Reply-To. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Let tenants deliver transcript/summary email without operating a webhook. | 100% of tenants set to mode `email` deliver transcript email directly through SatuInbox without a webhook consumer. |
| Do not disrupt tenants on the existing webhook. | 0 change in delivery behavior for tenants left on mode `webhook` (default). |
| Send from a tenant-owned, replyable address. | 100% of mode `email`/`both` transcript emails use the tenant connected Email channel account as From and Reply-To. |
| Prepare the ground for reply continuity (Phase 2). | 100% of mode `email` sends set a Reply-To resolvable back to the tenant workspace. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to choose how transcript email is delivered (webhook or SatuInbox-send) so that I can pick what fits my setup. | 1. Given the send-mode setting, When I open transcript settings, Then I can select `webhook`, `email`, or `both`. 2. Given I have not changed the setting, When a widget conversation closes, Then delivery uses `webhook` (default) unchanged. 3. Given I select `email` or `both`, When no active Email channel account is connected, Then the system blocks the selection and shows the mailbox precondition message. |
| US-002 | P0 | As a customer, I want to receive the transcript/summary email from the business, so that I have a copy after the chat closes. | 1. Given mode is `email` or `both` and a connected mailbox exists, When the widget conversation closes, Then SatuInbox sends the transcript email to the customer email. 2. Given the customer email is missing, When the conversation closes, Then no email is sent and a skipped audit event is recorded. 3. Given mode is `webhook`, When the conversation closes, Then SatuInbox posts the webhook only and sends no email itself. 4. Given mode is `both`, When the conversation closes, Then SatuInbox posts the webhook AND sends the email. |
| US-003 | P0 | As an Admin, I want the transcript email sent from my connected mailbox, so that replies land in my domain and can be handled later. | 1. Given mode `email`/`both`, When the email is sent, Then From and Reply-To use the tenant connected Email channel account. 2. Given the mailbox becomes disconnected/inactive, When an email should be sent, Then sending is blocked and the reason is audited. 3. Given the send fails for a retryable reason, When retry is available, Then the system retries up to 3 times. 4. Given the send fails after retries, When the system gives up, Then transcript status is `failed` and the failure is audited. |
| US-004 | P1 | As a Supervisor, I want transcript send in mode `email`/`both` audited, so that delivery is traceable. | 1. Given an email send attempt, When it succeeds or fails, Then an audit event records tenant, delivery mode, sender account, recipient, status, and failure reason. 2. Given mode `both`, When both channels fire, Then webhook and email outcomes are audited independently. |
| US-005 | P1 (Phase 2) | As a customer, I want to reply to the email and continue by Email. | Specified in `PRD Inbox Conversation - reply via email.md` (US-004..US-009). Enabled only when send mode is `email`/`both`. Not re-specified here. |

---

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Send Mode Flag | 1. FR-001: System MUST provide a per-tenant setting `TRANSCRIPT_EMAIL_SEND_MODE` with values `webhook`, `email`, `both`. 2. FR-002: System MUST default `TRANSCRIPT_EMAIL_SEND_MODE` to `webhook` for all existing and new tenants. 3. FR-003: System MUST evaluate the send mode at transcript delivery time (on widget close, in the existing scheduled `LIVECHAT_TRANSCRIPT_SEND` flow). 4. FR-004: System MUST NOT change existing webhook delivery behavior when mode is `webhook`. |
| Mailbox Precondition | 5. FR-005: System MUST require a connected, active Email channel account for the tenant before mode `email` or `both` can be selected. 6. FR-006: System MUST block enabling mode `email`/`both` and show the precondition message when no active Email channel account exists. 7. FR-007: System MUST re-check mailbox availability at send time; if the mailbox is missing/disconnected/inactive at send time, System MUST block that send and audit the reason. |
| SatuInbox Send Path | 8. FR-008: When mode is `email` or `both`, System MUST send the transcript email via the existing email-service send path (`EMAIL_SEND_MESSAGE`) using the tenant connected Email channel account. 9. FR-009: System MUST set From and Reply-To to the tenant connected Email channel account address. 10. FR-010: System MUST NOT send transcript email from a generic SatuInbox sender for mode `email`/`both`. 11. FR-011: When mode is `both`, System MUST post the existing webhook AND send the email; the two paths MUST be independent (one failing MUST NOT block the other). |
| Content Reuse | 12. FR-012: System MUST reuse the existing transcript email content (subject, html, text, summary fields, transcript body, links) already produced for the webhook payload. 13. FR-013: System MUST include reply guidance copy only when Phase 2 (reply continuity) is enabled for the tenant; otherwise content matches the current transcript. |
| Trigger & Dedup Reuse | 14. FR-014: System MUST reuse the existing trigger (widget conversation close, scheduled) — no new trigger. 15. FR-015: System MUST reuse existing dedup so at most one delivery per conversation per trigger occurs, independently per channel (webhook vs email) under mode `both`. 16. FR-016: System MUST reuse the existing retry policy (up to 3 attempts for retryable failures) for the email send path. |
| Status & Audit | 17. FR-017: System MUST record delivery mode and per-channel status on the transcript delivery record. 18. FR-018: System MUST audit email send attempts with tenant, mode, sender account ID, sender address, recipient, status, and failure reason. |
| Multi-Mailbox Sender Selection | 21. FR-021: When a tenant has more than one connected Email channel account, System MUST require the tenant to designate exactly one account as the transcript sender before mode `email`/`both` can be enabled. 22. FR-022: System MUST block enabling mode `email`/`both` (with a "select sender" prompt) when multiple Email accounts are connected and no transcript sender is designated, and MUST re-check the designated sender is still connected/active at send time (FR-007). |
| Both-Mode Ordering | 25. FR-025: When mode is `both`, System MUST enqueue the email send and post the webhook independently with no guaranteed ordering between them; neither path MAY depend on the other having completed. This is a documented limitation, not a bug. |
| Retry-Exhaustion Notification | 24. FR-024: When email transcript send is marked `failed` after retries exhaust (EH-004), System MUST raise a workspace notification (existing notification system) to Admin/Supervisor with access, in addition to the audit event. System MUST NOT auto-fall-back to webhook when mode is `email`. |
| Phase 2 Activation | 23. FR-023: Reply continuity (Phase 2) MUST be gated by a separate per-tenant flag (default OFF) AND require send mode `email`/`both`. Enabling send mode alone MUST NOT activate Phase 2. |
| Phase 2 Handoff | 19. FR-019: When mode is `email`/`both`, System MUST set a Reply-To resolvable to the tenant workspace so Phase 2 reply matching can attach. 20. FR-020: Reply continuity (inbound reply → Email conversation, auto-link, primary promotion) is governed by `PRD Inbox Conversation - reply via email.md` and MUST only be active when send mode is `email`/`both` and the Phase 2 flag (FR-023) is ON. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Mode `email`/`both` selected without connected mailbox | Block the setting change. | Show "Hubungkan akun email workspace dulu untuk mengaktifkan pengiriman email oleh SatuInbox". |
| EH-002 | Mailbox disconnected/inactive at send time | Block that email send, mark status `skipped` with reason. | Audit only; no customer-facing UI. |
| EH-003 | Customer email missing | Do not send email. | Skipped audit event. |
| EH-004 | Email send failure (retryable) | Retry up to 3 times, then mark `failed`. | Show "Gagal mengirim email transkrip" in transcript status. |
| EH-005 | Mode `both`, webhook succeeds but email fails | Keep webhook success. Independently audit email failure + retry. | No customer-facing UI. |
| EH-006 | Mode `both`, email succeeds but webhook fails | Keep email success. Independently audit webhook failure per existing webhook behavior. | No customer-facing UI. |
| EH-007 | Send mode misconfigured / unknown value | Fall back to `webhook` (safe default) and audit the anomaly. | No customer-facing UI. |
| EH-008 | Email send `failed` after retry exhaustion | Raise workspace notification to Admin/Supervisor (FR-024) plus audit. No auto-fallback to webhook in mode `email`. | Show "Gagal mengirim email transkrip — cek koneksi mailbox" to users with access. |
| EH-009 | Multiple mailboxes connected, no transcript sender designated | Block enabling mode `email`/`both`. | Show "Pilih akun email pengirim transkrip". |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Tenant switches `email` → `webhook` after some sends. | New closes deliver via webhook only. In-flight scheduled sends keep the mode captured at schedule time. | No special UI. |
| EC-002 | Tenant on `both` for the same conversation. | Webhook + email fire once each; per-channel dedup prevents duplicates within a channel. | Customer receives one email; tenant webhook consumer may also send — tenant responsibility. |
| EC-003 | Mailbox deleted between selection and send. | Send-time re-check (FR-007) blocks the email; status `skipped`. | Audit reason. |
| EC-004 | Multiple Email channel accounts connected. | Tenant MUST designate one account as transcript sender (FR-021). If none designated, mode `email`/`both` is blocked (EH-009). | Show "Pilih akun email pengirim transkrip" in settings. |
| EC-005 | Mode `email` but Phase 2 not yet enabled. | Email is sent as a copy; replies land in the tenant mailbox but are not auto-linked until Phase 2 ships. | Reply guidance copy omitted (FR-013). |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Transcript Delivery Mode Setting | Setting to select `webhook` / `email` / `both`, near the existing webhook + widget transcript settings. | Admin opens transcript settings, picks a mode. Mode `email`/`both` requires connected mailbox. | US-001, US-003 |
| Mailbox Precondition Notice | Inline block + message when `email`/`both` chosen without a connected mailbox. | Admin selects `email` with no mailbox → blocked with guidance. | US-001, US-003 |
| Transcript Send Status | Per-channel delivery status (webhook / email) in audit or transcript event area. | Supervisor inspects delivery outcome per channel. | US-002, US-004 |

### **Required UI Copy**

| Context | UI Copy |
| ----- | ----- |
| Mailbox precondition (mode email/both blocked) | "Hubungkan akun email workspace dulu untuk mengaktifkan pengiriman email oleh SatuInbox" |
| Multiple mailboxes, no sender designated | "Pilih akun email pengirim transkrip" |
| Email transcript send failed | "Gagal mengirim email transkrip" |
| Email transcript send failed (retry exhausted, notification) | "Gagal mengirim email transkrip — cek koneksi mailbox" |
| Delivery mode label | "Metode pengiriman transkrip: Webhook / Email / Keduanya" |

---

## **10. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| transcript_email_send_mode | Enum | email | Allowed: `webhook`, `email`, `both`. Default `webhook`. | Yes |
| transcript_sender_account_id | String | EMAIL-ACC-001 | The designated transcript sender when >1 Email account is connected. Required to enable mode `email`/`both` if multiple accounts exist. | Conditional |
| phase2_reply_continuity_enabled | Boolean | false | Separate Phase 2 gate (FR-023). Default `false`. Only effective when send mode is `email`/`both`. | Yes |
| email_channel_account_id | String | EMAIL-ACC-001 | Must reference a connected active Email channel account when mode is `email`/`both`. | Conditional |
| sender_email | Email | support@brand.com | Must match the connected Email channel account address. | Conditional |
| reply_to_email | Email | support@brand.com | Must match the connected Email channel account address. | Conditional |
| delivery_channel | Enum | email | Per-attempt: `webhook` or `email`. | Yes |
| delivery_status | Enum | sent | Allowed: `pending`, `sent`, `skipped`, `failed`. | Yes |
| failure_reason | Text | mailbox_inactive | Required when delivery_status is `skipped`/`failed`. | Conditional |
| audit_event_id | String | AUD-000888 | Recorded for each send attempt (per channel). | Yes |

---

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Send-mode evaluation MUST add no measurable latency to the existing close path (mode read at schedule/send time, not on the synchronous close). |
| Performance | 95% of transcript emails (mode `email`/`both`) MUST be queued within 5 seconds after the scheduled transcript trigger fires. |
| Reliability | Email send MUST reuse the existing 3-attempt retry; webhook and email paths under `both` MUST be independent and idempotent. |
| Deliverability | Sending via the tenant mailbox depends on the tenant domain reputation. System documentation MUST instruct tenants to configure SPF/DKIM on their connected mailbox to reduce spam-folder placement. |
| Security | Sender/Reply-To MUST be tenant-scoped; a tenant MUST NOT send via another tenant's mailbox. |
| Backward Compatibility | Tenants on default `webhook` mode MUST observe zero behavior change. |
| Observability | System MUST track per-channel delivery outcomes (webhook, email) and mode distribution across tenants. |

---

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Existing webhook transcript flow (`LIVECHAT_TRANSCRIPT_SEND`) | Engineering | Reused as-is; must not regress. | Coexist behind mode flag; default `webhook`. |
| Email-service send path (`EMAIL_SEND_MESSAGE`, SMTP per connected account) | Engineering | Email cannot be sent if this path or the mailbox is unavailable. | Send-time mailbox re-check + retry + audit. |
| Tenant connected Email channel account | Product / Tenant | Feature unusable without it. | Hard precondition (FR-005/006); tenant self-service connect. |
| Domain deliverability (SPF/DKIM of tenant domain) | Tenant | Emails may land in spam. | Setup guidance during mailbox connect; not blocking. |
| Phase 2 reply continuity (related PRD) | Product / Engineering | Replies not auto-linked until Phase 2 ships. | Ship Phase 1 first; Reply-To already resolvable (FR-019). |
| Mode `both` double delivery | Product | Tenant webhook consumer + SatuInbox email could both email the customer. | Tenant responsibility; document `both` semantics clearly. |

---

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Email transcript send success rate (mode `email`/`both`) | 95% or higher | 30 days after release | Email send logs |
| Webhook regression incidents (mode `webhook`) | 0 | Ongoing | Webhook delivery logs |
| Mailbox precondition block accuracy | 100% (no send attempted without valid mailbox) | Ongoing | Audit logs |
| Tenants adopting `email`/`both` | Tracked (adoption) | 60 days | Settings analytics |

---

## **14. Phasing**

| Phase | Scope | Status | Owner |
| ----- | ----- | ----- | ----- |
| **Phase 1** | This PRD: send-mode flag, SatuInbox-send via tenant mailbox, mailbox precondition, coexist with webhook, audit. | New — to build | Conversation + Email service |
| **Phase 2** | Reply continuity: inbound reply → Email conversation, auto-link, primary promotion, grouped room. Governed by `PRD Inbox Conversation - reply via email.md` (FR-016..FR-056). Active only when send mode is `email`/`both`. | Spec exists (related PRD) — to build after Phase 1 | Conversation + Email service |

---

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Sender uses the tenant connected Email channel account only. | Agent/team-specific senders not supported this phase. |
| Mode `both` may cause double customer emails if the tenant's webhook consumer also sends. | Documented as tenant responsibility. |
| Mode `both` has no ordering guarantee between webhook and email (FR-025). | A tenant webhook that assumes the email already sent will race; not supported. |
| Reply continuity not available until Phase 2 ships. | Replies in mode `email` land in the tenant mailbox unlinked until then. |
| Trigger unchanged (widget close, scheduled). | Manual resend and non-widget channels not covered. |

---

## **16. Rollback Plan**

| Aspect | Plan |
| ----- | ----- |
| Trigger | Regression on webhook-only tenant, SMTP volume/deliverability incident, or email-service `EMAIL_SEND_MESSAGE` failure spike. |
| Action | Flip affected tenants back to `transcript_email_send_mode = webhook` via config — **no code deploy required**. Default fallback (EH-007) already routes unknown/misconfigured values to `webhook`. |
| Scope | Per-tenant (single tenant) or global (all tenants) — config-driven, no schema change to revert. |
| Data | Additive schema (send mode, sender account, delivery mode/status fields) stays; no destructive migration to undo. Audit retains the mode captured per delivery for replay/inspection. |
| In-flight sends | Sends already scheduled keep the mode captured at schedule time (EC-001); rollback affects new closes only. |
| Phase 2 | Independent flag (FR-023, default OFF) — rolling back send mode does not touch Phase 2 state. |

---

## **17. Appendix**

| Item | Definition |
| ----- | ----- |
| Webhook mode | Existing delivery: SatuInbox POSTs transcript payload to tenant webhook URL; tenant sends the email. |
| Email mode | New delivery: SatuInbox sends the transcript email directly via the tenant connected mailbox. |
| Both mode | SatuInbox posts the webhook AND sends the email; paths independent. |
| Connected Email channel account | Tenant's mailbox connected to SatuInbox (IMAP/SMTP) used as sender via `EMAIL_SEND_MESSAGE`. |
| `TRANSCRIPT_EMAIL_SEND_MODE` | Per-tenant flag controlling delivery method. Default `webhook`. |

| Flow | Expected Result |
| ----- | ----- |
| Tenant default (`webhook`), widget close | Webhook posted; SatuInbox sends no email (unchanged). |
| Tenant `email`, mailbox connected, customer email exists | SatuInbox sends transcript email from tenant mailbox; no webhook. |
| Tenant `both`, mailbox connected | Webhook posted AND email sent, independently. |
| Tenant `email`, no mailbox connected | Setting blocked; precondition message shown. |
| Customer replies (Phase 2, mode email/both) | Handled per related reply-via-email PRD. |
