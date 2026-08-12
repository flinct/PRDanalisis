# Conversation Scenario Catalog — Part C2: Transcript Email & Widget Email (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:**
> 1. `PRD/Conversationv2/PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation.md`
> 2. `PRD/Transcript email/PRD Inbox Conversation - reply via email.md`
> 3. `PRD/Transcript email/PRD Widget - email transcript.md`
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Existing TC Ref:** `Test/conversation/Conversation.tsv` (SIX-Convo-001..725)

---

## 1. SC-TRANSCRIPT — Live Chat Transcript Reply via Email and Auto Linked Conversation

> **PRD Source:** `PRD/Conversationv2/PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation.md`
> **Surface:** Transcript email (sent to customer) + inbound Email conversation creation + grouped room with Primary/Child tabs
> **Status:** DEVELOPED | **Scenarios:** 24

---

### SC-TRANSCRIPT-001 — Live Chat resolved → transcript email sent to customer from workspace default email account
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-006–FR-007
- **Pre-condition:** Live Chat conversation exists with valid customer email; workspace default email account connected and active; transcript sending enabled
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open an ongoing Live Chat conversation `[data-cy="chat-list-1"]`
  3. Resolve the conversation via `[data-cy="chatRoom-closeConversationButton"]`
  4. Verify transcript email send status in audit/event log
  5. Check customer inbox — email received from workspace default email account
  6. Verify Reply-To header matches workspace default email account
- **Expected Result:** Transcript email sent from workspace default email; Reply-To points to same account; email contains transcript summary and body
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-002 — Live Chat reaches inactivity timeout → transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Live Chat conversation active with valid customer email; no activity for configured inactivity period
- **Steps:**
  1. Open a Live Chat conversation in the inbox
  2. Wait for inactivity timeout (no messages from either side)
  3. Verify system auto-resolves/closes conversation by timeout
  4. Check audit event — transcript send triggered with trigger type `inactivity_timeout`
  5. Verify customer receives transcript email
- **Expected Result:** Transcript email sent after inactivity timeout; audit records trigger type as `inactivity_timeout`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-003 — Both resolved and timeout triggers for same conversation → only one transcript email sent (no duplicate)
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-003, EC-001
- **Pre-condition:** Live Chat conversation where resolved fires first, timeout fires later (or vice versa)
- **Steps:**
  1. Resolve a Live Chat conversation — verify transcript email sent
  2. Trigger inactivity timeout condition for same conversation
  3. Check email delivery logs for duplicate sends
  4. Verify transcript status remains `sent` (not duplicated)
- **Expected Result:** Exactly one transcript email sent; second trigger ignored; no duplicate email delivered
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-004 — Customer email missing → transcript not sent, skipped audit event recorded
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-003
- **Pre-condition:** Live Chat conversation with no customer email address collected
- **Steps:**
  1. Open a Live Chat conversation where customer email field is empty
  2. Resolve the conversation
  3. Verify transcript status = `skipped` in audit log
  4. Verify no email sent to any recipient
- **Expected Result:** Transcript not sent; audit records skipped reason: "Email pelanggan tidak tersedia"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-005 — Workspace default email account not connected → sending blocked, "Email default workspace belum terhubung"
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-001
- **Pre-condition:** Workspace has no default email account connected
- **Steps:**
  1. Ensure workspace default email account is disconnected
  2. Resolve a Live Chat conversation with valid customer email
  3. Verify transcript send blocked
  4. Check audit log for blocked reason
- **Expected Result:** Sending blocked; audit shows "Email default workspace belum terhubung"; transcript status `skipped`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-006 — Workspace default email account inactive → sending blocked, "Email default workspace tidak aktif"
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-002
- **Pre-condition:** Workspace default email account exists but is marked inactive
- **Steps:**
  1. Deactivate workspace default email account in settings
  2. Resolve a Live Chat conversation
  3. Verify transcript send blocked
  4. Check audit stores inactive sender reason
- **Expected Result:** Sending blocked; audit shows "Email default workspace tidak aktif"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-007 — Transcript send failure → retry up to 3 times, then status "failed" with audit
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-005, EH-004
- **Pre-condition:** Email send system returns retryable error
- **Steps:**
  1. Simulate email send failure (e.g. SMTP timeout)
  2. Resolve a Live Chat conversation
  3. Monitor retry attempts — verify up to 3 retries
  4. After final failure, verify transcript status = `failed`
  5. Check audit log records failure reason
- **Expected Result:** 3 retry attempts; final status `failed`; audit records "Gagal mengirim transkrip email"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-008 — Customer replies to transcript email → new open Email conversation created
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Customer received transcript email; workspace email inbound processing active
- **Steps:**
  1. Open transcript email in customer inbox
  2. Reply to the email with any message
  3. In agent inbox, verify new Email conversation appears
  4. Verify Email conversation channel = Email
  5. Verify conversation status = open
- **Expected Result:** New open Email conversation created; channel set to Email; appears in agent inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-009 — Reply includes valid transcript reference → Email conversation auto-linked to original Live Chat
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-028
- **Pre-condition:** Customer replies to transcript email (reply preserves transcript reference in email headers)
- **Steps:**
  1. Customer replies to transcript email
  2. Verify new Email conversation created
  3. Open conversation detail — check `[data-cy="Chat-Detail-Section-linked-tickets"]` or linked conversations section
  4. Verify Email conversation is linked to original Live Chat
  5. Check audit log for auto-link success event
- **Expected Result:** Email conversation auto-linked to original Live Chat; audit records link with source Live Chat ID and target Email conversation ID
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-010 — Reply without valid transcript reference but sender matches customer email → no auto-link, suggested link only
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-019–FR-021, EH-006
- **Pre-condition:** Customer strips transcript reference from email reply; sender email matches original customer email
- **Steps:**
  1. Customer replies to transcript email with transcript reference stripped
  2. Verify Email conversation created (inbound email is valid)
  3. Verify NO auto-link to original Live Chat
  4. Open Email conversation detail — verify suggested link appears if safe candidate exists
- **Expected Result:** Email conversation created unlinked; suggested Live Chat link shown; no auto-link without valid reference
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-011 — Multiple replies in same email thread → messages appended to same Email conversation, no duplicate conversation
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-023, EC-002
- **Pre-condition:** Customer has already replied once to transcript email; Email conversation exists
- **Steps:**
  1. Customer sends second reply in same email thread
  2. Verify message appended to existing Email conversation (not new conversation created)
  3. Check inbox list — still shows one Email conversation for this thread
  4. Verify Email tab unread count increments
- **Expected Result:** Second reply appended to existing Email conversation; no duplicate conversation; unread count increases
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-012 — Email conversation linked → Email becomes Primary, Live Chat demoted to Child
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** Email conversation auto-linked to Live Chat conversation
- **Steps:**
  1. After auto-link succeeds, open the grouped conversation row
  2. Verify Email tab appears first (Primary position)
  3. Verify Live Chat tab is in Child position
  4. Verify grouped room opens on Email tab by default
- **Expected Result:** Email is Primary conversation (first tab); Live Chat demoted to Child (second tab)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-013 — Primary promotion fails → group kept linked, "Gagal menjadikan email sebagai percakapan utama" shown
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-008
- **Pre-condition:** Auto-link succeeds but Primary promotion fails (simulated)
- **Steps:**
  1. Simulate Primary promotion failure after auto-link
  2. Verify group remains linked (Email and Live Chat still connected)
  3. Verify error message shown: "Gagal menjadikan email sebagai percakapan utama"
  4. Verify current Primary unchanged
- **Expected Result:** Group stays linked; error message displayed; current Primary preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-014 — Original Live Chat room shows system message: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email."
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-038–FR-039
- **Pre-condition:** Customer replied to transcript email; Email conversation created and linked
- **Steps:**
  1. Open original Live Chat conversation in agent inbox
  2. Verify system message appears in message timeline: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email."
  3. Verify message includes link to Email conversation
- **Expected Result:** System message displayed in Live Chat room with correct copy and link to Email conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-015 — System message link clicked → grouped room opens with Email tab active
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-040
- **Pre-condition:** System message visible in Live Chat room
- **Steps:**
  1. Click the link in the system message
  2. Verify grouped room opens
  3. Verify Email tab is active by default
  4. Verify Email conversation messages visible
- **Expected Result:** Grouped room opens with Email tab active; Email conversation content visible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-016 — Grouped room: Email tab first as Primary, Live Chat tab as Child with history visible
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-030–FR-031
- **Pre-condition:** Email and Live Chat conversations linked in grouped room
- **Steps:**
  1. Open grouped conversation row from chat list
  2. Verify Email tab is first (leftmost) and active
  3. Switch to Live Chat tab
  4. Verify original transcript and chat history visible based on retention rules
- **Expected Result:** Email tab first as Primary; Live Chat tab as Child with full history preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-017 — Email tab unread count included in parent row unread count
- **Type:** Positive | **Priority:** P0 | **Source:** US-007
- **Pre-condition:** Email conversation has unread messages; grouped row in chat list
- **Steps:**
  1. Customer sends reply to transcript email
  2. Check grouped row in chat list `[data-cy="chat-list-N-unread-count"]`
  3. Verify unread count includes Email tab unread messages
- **Expected Result:** Parent row unread badge reflects Email unread count
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-018 — Live Chat conversation stays resolved after Email reply; NOT reopened by Email reply
- **Type:** Positive | **Priority:** P0 | **Source:** FR-041–FR-042
- **Pre-condition:** Live Chat resolved; customer replies to transcript email
- **Steps:**
  1. Verify Live Chat status before email reply = resolved
  2. Customer sends email reply
  3. Verify Live Chat status remains `resolved` (not reopened)
  4. Verify Email conversation is created as `open` separately
- **Expected Result:** Live Chat stays resolved; Email conversation is open; no state change on Live Chat from Email reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-019 — Email conversation SLA started based on Email channel SLA rules; Live Chat SLA NOT restarted
- **Type:** Positive | **Priority:** P0 | **Source:** FR-043–FR-045
- **Pre-condition:** Email conversation created from transcript reply; Email channel SLA configured
- **Steps:**
  1. Verify Email conversation SLA cycle starts when Email conversation is created
  2. Check Live Chat conversation SLA — verify NOT restarted
  3. Open detail panel — check SLA metrics `[data-cy="Chat-Detail-Sla-frt"]`, `[data-cy="Chat-Detail-Sla-ttc"]`
- **Expected Result:** Email SLA started per Email channel rules; Live Chat SLA unchanged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-020 — User without Email send permission → composer disabled, "Anda tidak memiliki akses untuk membalas email"
- **Type:** Permission | **Priority:** P0 | **Source:** FR-050, EH-011
- **Pre-condition:** Agent role lacks Email send permission
- **Steps:**
  1. Log in as agent without Email send permission
  2. Open grouped room with Email conversation
  3. Verify Email tab composer is disabled or hidden
  4. Verify message: "Anda tidak memiliki akses untuk membalas email"
- **Expected Result:** Composer disabled; permission denial message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-021 — User without linking permission → link actions hidden/disabled
- **Type:** Permission | **Priority:** P0 | **Source:** FR-049
- **Pre-condition:** Agent role lacks linking permission
- **Steps:**
  1. Log in as agent without linking permission
  2. Open Email conversation detail
  3. Verify manual link actions are hidden or disabled
- **Expected Result:** Link actions not visible or disabled for users without linking permission
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-022 — Transcript send, reply, link, Primary change, system message events all audited
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-051–FR-056
- **Pre-condition:** Full transcript reply lifecycle completed
- **Steps:**
  1. Complete full flow: resolve Live Chat → send transcript → customer reply → auto-link → Primary change → system message
  2. Check audit log for each event:
     - Transcript send (trigger, sender, recipient, status)
     - Inbound reply (source transcript, target Email conversation ID)
     - Auto-link (Live Chat ID, Email conversation ID, Primary change)
     - System message creation
  3. Verify all events have actor, timestamp, source, target
- **Expected Result:** All 5 lifecycle events audited with complete metadata
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-023 — Workspace default email account changed after transcript sent → old replies still matched via transcript reference
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, EC-005
- **Pre-condition:** Transcript sent with workspace email A; workspace default changed to email B
- **Steps:**
  1. Send transcript email using workspace email A
  2. Change workspace default email to email B
  3. Customer replies to original transcript email
  4. Verify reply received and matched via transcript reference (regardless of sender change)
- **Expected Result:** Old reply matched correctly; Email conversation created and linked despite default email change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TRANSCRIPT-024 — Customer forwards transcript to another person → that person's reply creates Email conversation, auto-link only if transcript reference valid
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Customer received transcript email; forwards to third party
- **Steps:**
  1. Customer forwards transcript email to another email address
  2. Third party replies to the forwarded email
  3. Verify Email conversation created from third party's email
  4. Verify auto-link to original Live Chat only if transcript reference is preserved and valid
  5. If reference stripped — verify no auto-link
- **Expected Result:** Email conversation created from forwarding party; auto-link depends on transcript reference validity
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## 2. SC-EMAILREPLY — Inbox Conversation - reply via email

> **Note:** This PRD overlaps with Live Chat Transcript Reply via Email. Scenarios enriched from both sources.

> **PRD Source:** `PRD/Transcript email/PRD Inbox Conversation - reply via email.md` (near-exact duplicate of PRD #4 — same feature, same date, Design Lead differs: Sabrina vs Resky)
> **Surface:** Transcript email + Email conversation + grouped room
> **Status:** ADJACENT | **Scenarios:** 24

---

### SC-EMAILREPLY-001 — Live Chat resolved → transcript email sent from workspace default email
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-006–FR-007
- **Pre-condition:** Live Chat conversation with valid customer email; workspace default email connected and active
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open and resolve a Live Chat conversation via `[data-cy="chatRoom-closeConversationButton"]`
  3. Verify transcript email sent from workspace default email account
  4. Check From and Reply-To headers match workspace default email
- **Expected Result:** Transcript email sent; From and Reply-To = workspace default email account
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-002 — Live Chat inactivity timeout → transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Live Chat conversation with no activity for configured timeout period
- **Steps:**
  1. Leave Live Chat conversation idle beyond inactivity timeout
  2. Verify system closes/resolves conversation by timeout
  3. Verify transcript email sent to customer
  4. Check audit trigger type = `inactivity_timeout`
- **Expected Result:** Transcript email sent after timeout; audit records `inactivity_timeout` trigger
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-003 — Resolved + timeout both fire → only one transcript email sent
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-003, EC-001
- **Pre-condition:** Conversation where both resolved and timeout triggers could fire
- **Steps:**
  1. Resolve Live Chat — verify transcript sent
  2. Trigger timeout condition for same conversation
  3. Verify no duplicate email sent
  4. Check transcript status remains `sent` (single send)
- **Expected Result:** Only one transcript email sent; duplicate trigger ignored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-004 — Customer email missing → no send, skipped audit
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-003
- **Pre-condition:** Live Chat conversation without customer email
- **Steps:**
  1. Resolve Live Chat where customer email is empty
  2. Verify no transcript email sent
  3. Check audit log — status = `skipped`, reason = "Email pelanggan tidak tersedia"
- **Expected Result:** No email sent; audit records skipped reason
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-005 — Workspace default email not connected → blocked, "Email default workspace belum terhubung"
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-001
- **Pre-condition:** No workspace default email account connected
- **Steps:**
  1. Disconnect workspace default email account
  2. Resolve a Live Chat conversation
  3. Verify send blocked
  4. Check audit/message: "Email default workspace belum terhubung"
- **Expected Result:** Send blocked; transcript status `skipped`; correct error message
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-006 — Workspace default email inactive → blocked, audit reason stored
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, EH-002
- **Pre-condition:** Workspace default email account inactive
- **Steps:**
  1. Set workspace default email to inactive
  2. Resolve Live Chat conversation
  3. Verify send blocked
  4. Check audit stores inactive reason
- **Expected Result:** Send blocked; audit records "Email default workspace tidak aktif"
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-007 — Transcript send failure → retry up to 3x, then "failed"
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-005, EH-004
- **Pre-condition:** Email delivery system returns retryable error
- **Steps:**
  1. Simulate email send failure
  2. Resolve Live Chat conversation
  3. Monitor retries — verify up to 3 attempts
  4. After final failure — transcript status = `failed`
  5. Check audit: "Gagal mengirim transkrip email"
- **Expected Result:** 3 retries; final status `failed`; audit records failure
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-008 — Customer replies → new Email conversation created
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Customer received transcript email
- **Steps:**
  1. Customer replies to transcript email
  2. Verify new Email conversation appears in agent inbox
  3. Verify channel = Email; status = open
- **Expected Result:** New open Email conversation created in agent inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-009 — Valid transcript reference → auto-linked to original Live Chat
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-028
- **Pre-condition:** Customer reply preserves transcript reference
- **Steps:**
  1. Customer replies to transcript email (reference preserved)
  2. Verify Email conversation auto-linked to original Live Chat
  3. Check linked conversations section in detail panel
  4. Verify audit records auto-link success
- **Expected Result:** Auto-link succeeds; Email linked to original Live Chat
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-010 — No valid transcript reference → no auto-link, suggestion only if safe candidate
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-019–FR-021, EH-006
- **Pre-condition:** Customer reply has no transcript reference
- **Steps:**
  1. Customer replies with transcript reference stripped
  2. Verify Email conversation created but NOT auto-linked
  3. Open Email conversation detail — verify suggested link if safe candidate exists
- **Expected Result:** No auto-link; suggested Live Chat link shown only if safe candidate exists
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-011 — Multiple replies in same thread → appended to existing Email conversation
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-023, EC-002
- **Pre-condition:** Email conversation already exists from first reply
- **Steps:**
  1. Customer sends second reply in same email thread
  2. Verify message appended to existing Email conversation
  3. Verify no duplicate conversation created
- **Expected Result:** Messages appended; single Email conversation per thread; unread count increments
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-012 — Linking succeeds → Email becomes Primary, Live Chat becomes Child
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** Auto-link completed
- **Steps:**
  1. Open grouped conversation row
  2. Verify Email tab first (Primary)
  3. Verify Live Chat tab second (Child)
- **Expected Result:** Email = Primary (first tab); Live Chat = Child (second tab)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-013 — Primary promotion fails → group stays linked, error message shown
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, EH-008
- **Pre-condition:** Auto-link succeeds; Primary promotion fails
- **Steps:**
  1. Simulate Primary promotion failure
  2. Verify group remains linked
  3. Verify error: "Gagal menjadikan email sebagai percakapan utama"
- **Expected Result:** Group stays linked; error displayed; current Primary preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-014 — Live Chat shows system message directing agent to Email
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-038–FR-039
- **Pre-condition:** Email reply received and linked
- **Steps:**
  1. Open original Live Chat room
  2. Verify system message: "Pelanggan melanjutkan percakapan melalui email. Silakan balas di Email."
  3. Verify message includes clickable link
- **Expected Result:** System message visible in Live Chat with correct copy and link
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-015 — Grouped room opens with Email tab active by default
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-030–FR-036
- **Pre-condition:** Grouped room exists with Email and Live Chat tabs
- **Steps:**
  1. Open grouped conversation from inbox
  2. Verify Email tab is active by default
  3. Verify Email conversation messages loaded
- **Expected Result:** Grouped room opens with Email tab active
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-016 — Email unread count reflected in parent row
- **Type:** Positive | **Priority:** P0 | **Source:** US-007
- **Pre-condition:** Email conversation has unread messages
- **Steps:**
  1. Customer sends email reply
  2. Check parent row unread badge `[data-cy="chat-list-N-unread-count"]`
  3. Verify includes Email unread count
- **Expected Result:** Parent row unread badge reflects Email unread count
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-017 — Live Chat remains resolved after Email reply (not reopened)
- **Type:** Positive | **Priority:** P0 | **Source:** FR-041–FR-042
- **Pre-condition:** Live Chat resolved; email reply received
- **Steps:**
  1. Verify Live Chat = resolved before email reply
  2. Customer sends email reply
  3. Verify Live Chat status = resolved (unchanged)
- **Expected Result:** Live Chat stays resolved after Email reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-018 — Email SLA starts per Email channel rules; Live Chat SLA not restarted
- **Type:** Positive | **Priority:** P0 | **Source:** FR-043–FR-045
- **Pre-condition:** Email SLA configured; Email conversation created
- **Steps:**
  1. Verify Email SLA cycle started
  2. Verify Live Chat SLA NOT restarted
  3. Check SLA metrics in detail panel
- **Expected Result:** Email SLA active per Email rules; Live Chat SLA unchanged
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-019 — No Email send permission → composer disabled
- **Type:** Permission | **Priority:** P0 | **Source:** FR-050, EH-011
- **Pre-condition:** Agent without Email send permission
- **Steps:**
  1. Log in as agent without Email send permission
  2. Open grouped room with Email tab
  3. Verify composer disabled
  4. Verify message: "Anda tidak memiliki akses untuk membalas email"
- **Expected Result:** Composer disabled; permission message shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-020 — No linking permission → link actions hidden
- **Type:** Permission | **Priority:** P0 | **Source:** FR-049
- **Pre-condition:** Agent without linking permission
- **Steps:**
  1. Log in as agent without linking permission
  2. Open Email conversation detail
  3. Verify link actions hidden or disabled
- **Expected Result:** Link actions not available to agents without linking permission
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-021 — All transcript-reply lifecycle events audited
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-051–FR-056
- **Pre-condition:** Full lifecycle completed (send → reply → link → Primary change → system message)
- **Steps:**
  1. Complete full transcript reply flow end-to-end
  2. Check audit log for: transcript send, inbound reply, auto-link, Primary change, system message
  3. Verify each event has actor, timestamp, source, target
- **Expected Result:** All lifecycle events audited with complete metadata
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-022 — Default email account changed after send → old replies still matched
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, EC-005
- **Pre-condition:** Transcript sent from email A; default changed to email B
- **Steps:**
  1. Send transcript from workspace email A
  2. Change default to email B
  3. Customer replies to original transcript
  4. Verify reply matched via transcript reference
- **Expected Result:** Reply matched regardless of default email change
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-023 — Auto-link failure → Email conversation stays open, unlinked; retry up to 3x
- **Type:** Negative | **Priority:** P0 | **Source:** US-009, EH-007
- **Pre-condition:** Auto-link fails (e.g. reference invalid, system error)
- **Steps:**
  1. Simulate auto-link failure
  2. Verify Email conversation remains open and unlinked
  3. Verify system retries linking up to 3 times
  4. After final failure — verify "Gagal menautkan percakapan otomatis" shown
  5. Verify manual linking available if agent has permission
- **Expected Result:** Email stays open unlinked; 3 retries; manual linking available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-EMAILREPLY-024 — Duplicate inbound email delivery → deduplicated by email identity and thread reference
- **Type:** Edge | **Priority:** P0 | **Source:** EC-014
- **Pre-condition:** Email delivery system sends duplicate of same inbound email
- **Steps:**
  1. Receive duplicate inbound email (same message ID/thread reference)
  2. Verify only one message appended to Email conversation
  3. Verify no duplicate Email conversation created
- **Expected Result:** Duplicate deduplicated; single message in conversation; no duplicate conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## 3. SC-WIDGETEMAIL — Widget - email transcript

> **PRD Source:** `PRD/Transcript email/PRD Widget - email transcript.md`
> **Surface:** Widget settings → Appearance tab toggle + branded transcript email + public transcript page + continue-chat link
> **Status:** ADJACENT | **Scenarios:** 20

---

### SC-WIDGETEMAIL-001 — Admin toggles "Kirim transkrip ke email pelanggan" ON in widget Appearance tab; setting saved per tenant
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001–FR-002
- **Pre-condition:** Admin logged in with channel manage permission; widget settings accessible
- **Steps:**
  1. Navigate to `settings/channels/widget?tab=appearance`
  2. Find "Kirim transkrip ke email pelanggan" toggle
  3. Toggle ON
  4. Click "Simpan & Aktifkan"
  5. Refresh page — verify toggle state persisted = ON
  6. Verify setting saved at tenant level (not per widget account)
- **Expected Result:** Toggle saved as ON per tenant; persists across page refreshes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-002 — Toggle OFF → no transcript email sent when Live Chat ends
- **Type:** Positive | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** Transcript email toggle is OFF
- **Steps:**
  1. Ensure toggle "Kirim transkrip ke email pelanggan" is OFF in widget settings
  2. Conduct a Live Chat conversation
  3. Resolve or wait for timeout
  4. Verify no transcript email sent to customer
- **Expected Result:** No transcript email sent when toggle is OFF
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-003 — Admin without channel manage permission → "Akses ditolak", toggle not editable
- **Type:** Permission | **Priority:** P0 | **Source:** US-001, FR-003
- **Pre-condition:** Admin role without channel manage permission
- **Steps:**
  1. Log in as user without channel manage permission
  2. Navigate to widget settings Appearance tab
  3. Verify "Akses ditolak" message shown
  4. Verify toggle is not editable
- **Expected Result:** Access denied; toggle not editable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-004 — Inactivity timeout (20 min) reached with valid customer email → exactly 1 transcript email sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-010, FR-012, FR-015
- **Pre-condition:** Transcript enabled; customer email valid; no activity for 20 minutes
- **Steps:**
  1. Conduct Live Chat conversation with customer email collected
  2. Stop all activity for 20 minutes (inactivity timeout)
  3. Verify system triggers transcript email send
  4. Verify exactly 1 email sent (idempotency: `email_transcript_sent_at` flag set)
  5. Verify email contains transcript in chronological order with `[HH:mm] Sender: Message` format
- **Expected Result:** Exactly 1 transcript email sent after 20 min inactivity; transcript formatted correctly
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-005 — Conversation resolved without timeout → transcript sent as fallback
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Transcript enabled; conversation resolved manually before timeout
- **Steps:**
  1. Conduct Live Chat with customer email
  2. Resolve conversation manually (before 20 min timeout)
  3. Verify transcript email sent as resolved fallback
  4. Verify send scheduled at `max(now, last_message + 20min)` per FR-013
- **Expected Result:** Transcript sent after resolved with appropriate delay; exactly 1 email
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-006 — Customer email missing/invalid → no send, skipped reason stored
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, EH-002, FR-009
- **Pre-condition:** No valid customer email collected during conversation
- **Steps:**
  1. Conduct Live Chat without collecting customer email
  2. Resolve or wait for timeout
  3. Verify no transcript email sent
  4. Check send status = `skipped` with reason stored
- **Expected Result:** No email sent; skipped reason recorded
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-007 — Email header shows widget logo when configured; falls back to tenant name if logo missing
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-021
- **Pre-condition:** Transcript email sent; widget logo configured (or not)
- **Steps:**
  1. Configure widget header logo in settings
  2. Trigger transcript email
  3. Verify email header shows widget logo
  4. Remove widget logo; trigger new transcript
  5. Verify email header falls back to tenant name text
- **Expected Result:** Logo shown when configured; tenant name as text fallback when logo missing
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-008 — Email uses widget theme color for header accent and CTA buttons
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-022
- **Pre-condition:** Widget theme color configured
- **Steps:**
  1. Set widget theme color (e.g. blue #2563EB)
  2. Trigger transcript email
  3. Verify email header accent color matches widget theme color
  4. Verify CTA buttons use same theme color
- **Expected Result:** Email header accent and CTA buttons use widget theme color
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-009 — Transcript exceeds 120,000 chars or 300 messages → truncated to last 100 messages, "Transkrip dipotong" notice shown, secure link still included
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-024–FR-026
- **Pre-condition:** Long conversation exceeding truncation limits
- **Steps:**
  1. Conduct very long Live Chat (>300 messages or >120K chars)
  2. Trigger transcript email
  3. Verify email contains only last 100 messages
  4. Verify "Transkrip dipotong" notice shown in email
  5. Verify "Lihat transkrip lengkap" secure link still present
- **Expected Result:** Truncated to 100 messages; notice shown; secure link included
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-010 — Secure transcript link expires after 30 days → "Link transkrip tidak valid atau sudah kedaluwarsa"
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-028, EH-004
- **Pre-condition:** Transcript email sent with secure link; 30+ days pass
- **Steps:**
  1. Wait 30 days after transcript email sent (or manipulate token TTL)
  2. Click secure transcript link
  3. Verify page shows "Link transkrip tidak valid atau sudah kedaluwarsa"
- **Expected Result:** Expired token denies access; expiry message displayed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-011 — Public transcript page shows tenant brand, conversation metadata, full transcript; no internal inbox UI exposed
- **Type:** Positive | **Priority:** P0 | **Source:** FR-029–FR-031
- **Pre-condition:** Valid secure transcript link available
- **Steps:**
  1. Open public transcript link
  2. Verify page shows tenant brand header
  3. Verify conversation metadata (ID, timestamps, agent name)
  4. Verify full transcript in chronological order
  5. Verify NO internal inbox UI elements visible (no sidebar, no composer, no admin controls)
- **Expected Result:** Public page shows brand, metadata, full transcript only; no internal UI exposed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-012 — "Lanjutkan Chat" button enabled → clicks open continue_chat_url with resume token; widget auto-opens
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-034–FR-035
- **Pre-condition:** "Lanjutkan Chat" toggle ON; `continue_chat_url` configured
- **Steps:**
  1. Open transcript email
  2. Click "Lanjutkan Chat" button
  3. Verify opens configured URL with `si_open_livechat=1` and `si_guest_resume={token}` parameters
  4. Verify widget auto-opens after page load
- **Expected Result:** Continue chat opens correct URL; widget auto-opens; resume token included
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-013 — Resume token valid → same conversation thread shown (history visible)
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-036
- **Pre-condition:** Valid resume token; customer opens continue chat link
- **Steps:**
  1. Click "Lanjutkan Chat" with valid resume token
  2. Widget opens and loads conversation thread
  3. Verify conversation history visible (past messages)
  4. Verify new message can be sent
- **Expected Result:** Same conversation thread loaded; history visible; new messages possible
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-014 — Resume token expired/invalid → widget shows clear message, opens in "new chat" state
- **Type:** Negative | **Priority:** P0 | **Source:** US-005, FR-039
- **Pre-condition:** Resume token expired or invalid
- **Steps:**
  1. Click "Lanjutkan Chat" with expired/invalid token
  2. Widget opens
  3. Verify message: "Untuk melanjutkan chat sebelumnya, silakan login atau isi email yang sama."
  4. Verify widget in "new chat" state (no prior history)
- **Expected Result:** Clear message shown; widget in new chat state
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-015 — Session resume (session-livechat.email valid) takes priority over guest resume
- **Type:** Edge | **Priority:** P0 | **Source:** FR-041, FR-036
- **Pre-condition:** Customer has active session with `session-livechat.email` AND guest resume token in URL
- **Steps:**
  1. Open continue chat link with both session identity and guest token
  2. Verify widget uses session resume path (not guest resume)
  3. Verify loads latest conversation for session email (FR-037 deterministic ordering)
- **Expected Result:** Session resume takes priority; guest resume ignored when session available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-016 — Conversation reopens after transcript already sent → no resend (MVP: one email per conversation)
- **Type:** Edge | **Priority:** P0 | **Source:** EC-003, FR-015
- **Pre-condition:** Transcript already sent for conversation; conversation reopens
- **Steps:**
  1. Verify transcript sent for resolved conversation
  2. Customer sends new message — conversation reopens
  3. Resolve conversation again
  4. Verify no second transcript email sent
  5. Check `email_transcript_sent_at` flag unchanged
- **Expected Result:** No duplicate transcript; one email per conversation enforced
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-017 — New message arrives after resolved but before scheduled send → cancel send, reschedule per inactivity timeout
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002, FR-014
- **Pre-condition:** Conversation resolved; transcript send scheduled; new message arrives before send
- **Steps:**
  1. Resolve conversation — send scheduled at `last_message + 20min`
  2. Customer sends new message before scheduled send
  3. Verify scheduled send cancelled
  4. Verify new send scheduled per inactivity timeout rules (20 min from new message)
- **Expected Result:** Send cancelled on new message; rescheduled per inactivity timeout
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-018 — Continue chat URL not set but button toggle enabled → button hidden, transcript + public link still sent
- **Type:** Edge | **Priority:** P1 | **Source:** EC-008, FR-005
- **Pre-condition:** "Lanjutkan Chat" toggle ON but `continue_chat_url` empty
- **Steps:**
  1. Enable "Tampilkan tombol Lanjutkan Chat" toggle
  2. Leave "Continue chat URL" field empty
  3. Trigger transcript email
  4. Verify email sent without "Lanjutkan Chat" button
  5. Verify transcript body and "Lihat transkrip lengkap" link still present
- **Expected Result:** Continue chat button hidden; transcript + public link still included
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-019 — Send failure → retry up to 3x with exponential backoff, then "failed"
- **Type:** Negative | **Priority:** P0 | **Source:** FR-038, EH-003
- **Pre-condition:** Email send returns retryable error
- **Steps:**
  1. Simulate email send failure
  2. Trigger transcript send (resolve or timeout)
  3. Monitor retries — verify up to 3 attempts with exponential backoff
  4. After final failure — verify status = `failed`
- **Expected Result:** 3 retries with exponential backoff; final status `failed`
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-WIDGETEMAIL-020 — Whitelabel enabled → no SatuInbox branding in email footer
- **Type:** Positive | **Priority:** P1 | **Source:** FR-023
- **Pre-condition:** Widget whitelabel enabled in settings
- **Steps:**
  1. Enable whitelabel in widget settings
  2. Trigger transcript email
  3. Verify email footer has NO SatuInbox branding
  4. Disable whitelabel; verify SatuInbox branding restored
- **Expected Result:** No SatuInbox branding when whitelabel ON; branding restored when OFF
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

> **Total Enriched Scenarios: 68** (SC-TRANSCRIPT: 24 · SC-EMAILREPLY: 24 · SC-WIDGETEMAIL: 20)
