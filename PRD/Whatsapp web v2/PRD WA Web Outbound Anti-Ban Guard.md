# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Web Outbound Anti-Ban Guard  
**Product Lead**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**:test

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| --- | --- | --- | --- |
| v0.3 | 2026-06-11 | Hermes Agent | Rewrote PRD to make decisioning BE-driven, added classifier and FE behavioral context intake, removed tenant-facing settings page requirement, and added Detailed Backend Evaluation Flow + Decision Rules. |
| v0.2 | 2026-06-11 | Hermes Agent | Refocused PRD to text-only broadcast manual resend guard and duplicate broadcast traceability based on clarified incident scope, IT Support role, and SOP-violation handling intent. |
| v0.1 | 2026-06-10 | Dany Christian | Initial PRD draft for outbound anti-ban protection covering duplicate prevention, manual copy-paste burst protection, operator/account risk guardrails, and support auditability. |

---

## **2\. Overview**

| Item | Description |
| --- | --- |
| Purpose | Prevent unsafe manual resend of broadcast text from the conversation room while the system-managed broadcast flow is still handling the same outbound delivery, and improve traceability for duplicate broadcast incidents whose root cause is still unknown. |
| Background | SatuInbox already provides admin-managed broadcast delivery with queueing, timing, and retry/repeat handling. However, some users bypass SOP by copying the same broadcast text and sending it manually from the conversation room, creating duplicate outbound behavior and increasing sender suspension risk. In parallel, there are incident indications that some broadcast deliveries may be sent twice in succession from the existing system flow, but the real root cause has not yet been confirmed and requires detailed debugging and log review. |
| Scope | Applies to WhatsApp Web outbound flows in Phase 1 for **text-only** messages. Phase 1 focuses on: (1) detecting and handling manual resend of exact or broadcast-derived text from the conversation room when the related broadcast flow is still active or recently handled by the system, and (2) providing support-grade traceability for suspected duplicate broadcast dispatch. |
| Primary Users | Admin, Operator / TLC User, IT Support as internal SatuInbox dashboard users, and any internal user explicitly granted anti-ban log access permission. |
| Key Capabilities | Exact-text resend detection, optional FE behavioral context intake, request classifier, active broadcast collision awareness, backend-managed warning / queue / block policy, duplicate dispatch traceability, and support-grade audit logs for investigation. |
| Outcome | System-managed broadcast remains the source of truth for outbound delivery, unsafe manual resend behavior is reduced, and duplicate broadcast incidents become traceable enough for debugging and root-cause investigation. |
| Assumptions | Existing broadcast queue, timing, retry/repeat handling, sender eligibility, and account health signals remain the canonical source of truth and are reused rather than redefined by this feature. |

### **Scope Definition**

| In Scope | Out of Scope |
| --- | --- |
| Manual resend detection for **exact same text** broadcast content sent from conversation room. | Media, attachment, template, image, document, or other non-text outbound handling. |
| Broadcast-derived resend detection using optional FE behavioral context such as paste event, source message action, source message ID, source message origin, or copied-message send context. | AI-based text rewriting, humanization redesign, or semantic NLP enforcement for same-intent messages. |
| Guardrail when a user manually resends text that is still being handled or has just been handled by system-managed broadcast flow. | General-purpose operator scoring across all manual conversation activity unrelated to broadcast. |
| Warning, cooldown, queueing, or block action for protected resend based on backend-managed policy. | Tenant-facing dashboard page for configuring anti-ban thresholds or enforcement modes. |
| Duplicate dispatch observability for broadcast incidents, including correlation ID, attempt lineage, and detailed logs for debugging. | Final root-cause fix for duplicate broadcast incidents before debugging confirms the actual cause. |
| Audit visibility for Admin, Supervisor, and IT Support through SatuInbox dashboard surfaces. | Special backend-only control or override capability for IT Support outside product surfaces. |
| Phase 1 protection for WhatsApp Web **text-only** broadcast and conversation-room manual text send. | Non-WhatsApp channels such as Instagram, Email, or Messenger. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| --- | --- | --- |
| PS-001 | Some users bypass the broadcast SOP by copying broadcast text and sending it manually from the conversation room. | The same recipient may receive repeated outbound text while the system-managed broadcast flow is still active, increasing suspension risk. |
| PS-002 | The current product does not explicitly distinguish normal manual send from manual send that is actually a resend of protected broadcast content. | Admin-configured broadcast can be undermined by manual operator action, making outbound control inconsistent and unsafe. |
| PS-003 | BE-only payloads are insufficient to determine whether a manual send came from literal copy-paste, copied-message action, or an independently typed message unless FE sends behavioral context. | The system may miss strong evidence of SOP violation or over-rely on text matching alone. |
| PS-004 | Messages may differ slightly in wording while still carrying the same business intent as the copied broadcast. | Exact-match-only enforcement is safe but incomplete; same-intent resend may remain undetected unless observed separately. |
| PS-005 | There are incident indications that some broadcast messages may be sent twice in close succession by the existing system flow, but the real root cause is not yet known. | Engineering and IT Support cannot confidently distinguish between manual resend, retry behavior, worker duplication, or other dispatch anomalies. |
| PS-006 | Current logs and auditability are not yet strong enough to trace end-to-end outbound lineage for suspected duplicate broadcast incidents. | Debugging is slow, production investigation is reactive, and corrective action may be based on assumption instead of evidence. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| --- | --- |
| Prevent unsafe manual resend of broadcast text. | 100% of detected manual resend attempts for the **exact same text** to the same recipient while the related broadcast flow is still active produce a deterministic policy outcome (`warning`, `delay`, `queue`, or `block`). |
| Distinguish manual send from broadcast-derived resend more accurately. | When FE sends supported behavioral context, backend classification uses it and persists the evidence path for every protected resend decision. |
| Preserve system-managed broadcast as the source of truth. | 0 manual resend attempts may silently bypass configured backend guardrails when the related broadcast delivery is still in active system handling under enabled policy mode. |
| Improve duplicate broadcast investigation quality. | 100% of suspected duplicate broadcast incidents produce traceable correlation data including broadcast/job reference, recipient, sender, dispatch source, attempt lineage, and reason code. |
| Reduce sender suspension risk caused by SOP-violating resend behavior. | Manual resend collisions that match the protected Phase 1 scope are detected before dispatch in normal operation. |
| Improve support visibility through dashboard-accessible auditability. | Admin, Supervisor, and IT Support can review why a text send was allowed, warned, queued, blocked, or flagged as duplicate-suspected through product-supported logs. |

---

## **5\. User Stories and Acceptance Criteria**

### **Admin / Authorized Log Viewer**

| ID | Priority | User Story | Acceptance Criteria |
| --- | --- | --- | --- |
| US-001 | P0 | As an Admin, I want exact-text or broadcast-derived manual resend of broadcast content to be prevented or controlled so that one system-managed broadcast flow remains the source of truth. | 1\. Given a user manually sends the exact same broadcast text to the same recipient while the related broadcast is still active or recently handled by the system, When the request is evaluated, Then the system applies the configured backend policy outcome and records the reason. 2. Given FE sends behavioral context indicating the message came from copied broadcast content, When the request is evaluated, Then the system may classify it more strongly than text-only matching. |
| US-002 | P0 | As an Admin, I want duplicate broadcast incidents to be traceable so that engineering and IT Support can investigate unknown root causes without guessing. | 1\. Given a suspected duplicate broadcast incident occurs, When Admin or IT Support reviews the log, Then they can see correlation ID, broadcast/job reference, sender account, recipient fingerprint, dispatch source, classifier result, and attempt lineage. 2. Given delivery status is unknown, When the attempt enters reconciliation flow, Then the system MUST NOT blindly resend before resolution. |
| US-003 | P0 | As an Admin, I want protected resend of broadcast text to be warned, queued, or blocked based on backend policy so that sender accounts remain safer. | 1\. Given an operator copies and sends the exact same text as a system-managed broadcast from the conversation room, When the protected resend condition is met, Then the system applies warning, queue, or block based on backend policy. 2. Given FE context confirms copied-broadcast origin, When the request is evaluated, Then the decision uses that evidence and stores it in audit trace. |
| US-004 | P1 | As a user with anti-ban log access permission, I want read-only visibility into anti-ban decisions so that I can monitor operational risk without changing system policy. | 1\. Given a user has anti-ban log access permission and opens anti-ban logs, When data is shown, Then they can see attempt result, reason code, sender, recipient fingerprint, actor, and timestamp. 2. Given a user does not have anti-ban log access permission, When the action is evaluated, Then the system denies access server-side. |

### **Operator / TLC User**

| ID | Priority | User Story | Acceptance Criteria |
| --- | --- | --- | --- |
| US-006 | P0 | As an operator, I want clear feedback when my manual send is delayed or blocked because the same broadcast text is still being handled by the system so that I understand why I should not resend it manually. | 1\. Given a send is delayed due to active or recent system-managed broadcast handling, When I click send, Then I see a clear Bahasa Indonesia message and cannot submit repeatedly to bypass the delay. 2. Given a send is blocked due to protected manual resend policy, When the action fails, Then the message explains that the same message is still being handled by the broadcast system. |
| US-007 | P1 | As an operator, I want normal manual sending to remain smooth when my message is not colliding with protected broadcast handling so that the guardrail does not slow regular work unnecessarily. | 1\. Given my send is outside the protected resend condition, When I send a normal message, Then the system processes it without anti-ban warning. 2. Given my message is similar in intent but not exact match and no strong FE broadcast-derived evidence is present, When the action is evaluated, Then the system may log a suspicion but MUST NOT hard-block solely on semantic guess in Phase 1. |

### **IT Support**

| ID | Priority | User Story | Acceptance Criteria |
| --- | --- | --- | --- |
| US-008 | P0 | As IT Support, I want dashboard-accessible audit logs and dispatch lineage for anti-ban actions so that I can monitor client broadcast usage and investigate technical incidents quickly using existing SatuInbox features. | 1\. Given a duplicate suppression, protected manual resend warning/block, safe mode, or reconciliation event occurs, When IT Support reviews the log, Then each event includes actor, sender account, recipient fingerprint, action taken, reason code, dispatch source, and classifier result where applicable. 2. Given a duplicate broadcast incident is suspected, When IT Support opens the log detail, Then the related broadcast/job reference, correlation ID, and linked outbound attempts are visible. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| --- | --- |
| Outbound Identity and Dedupe | FR-001 \[P0\]: System MUST generate an idempotency key for every outbound attempt using at minimum tenant, channel, sender account, recipient identity, normalized content fingerprint, outbound source, and logical scope reference. FR-002 \[P0\]: System MUST suppress duplicate outbound attempts that resolve to the same idempotency key within a configurable dedupe window. FR-003 \[P0\]: System MUST support dedupe scope for both manual send and broadcast send within the **text-only** Phase 1 scope. FR-004 \[P1\]: System SHOULD preserve a reference from the suppressed attempt to the original winning attempt. |
| Recipient Concurrency Control | FR-005 \[P0\]: System MUST enforce recipient-level in-flight locking so two workers cannot dispatch the same logical outbound context to the same recipient simultaneously. FR-006 \[P0\]: If lock acquisition fails due to active processing, System MUST back off or suppress based on duplicate evaluation result. FR-007 \[P1\]: Lock records MUST use TTL or recovery-safe expiration to avoid permanent stale locks after worker failure. |
| Retry and Reconciliation | FR-008 \[P0\]: System MUST make retry behavior idempotent by reusing the original logical send identity. FR-009 \[P0\]: If delivery status becomes unknown after dispatch, System MUST move the attempt into `RECONCILIATION_PENDING` and MUST NOT resend blindly. FR-010 \[P1\]: System MUST support reconciliation result states `CONFIRMED_SENT`, `CONFIRMED_FAILED`, and `UNRESOLVED_TIMEOUT`. FR-011 \[P1\]: System MUST keep a clear linkage between original attempt, retry count, and final resolved status. |
| Client Submit Protection | FR-012 \[P0\]: UI MUST disable repeated submit while a send request is pending. FR-013 \[P0\]: Server-side protection MUST still prevent duplicate send if client-side submit protection fails or is bypassed. |
| FE Behavioral Context Intake | FR-014 \[P0\]: Backend MUST accept optional FE behavioral context for manual room send evaluation, including `pasteDetected`, `sourceMessageAction`, `sourceMessageId`, `sourceMessageOrigin`, and `sendFromCopiedMessage` when FE is able to provide them. FR-015 \[P0\]: Backend MUST continue to evaluate requests safely when none or only part of the optional FE behavioral context is present. FR-016 \[P1\]: Backend SHOULD persist which decision path was used: FE-context-confirmed, content-match-confirmed, or suspicion-only. |
| Manual Broadcast Resend Classifier | FR-017 \[P0\]: System MUST classify a room-send request at minimum into `NORMAL_MANUAL_SEND`, `COPY_PASTE_BROADCAST_CONFIRMED`, `MANUAL_BROADCAST_RESEND_MATCHED`, `MANUAL_BROADCAST_RESEND_SUSPECTED`, or `SYSTEM_BROADCAST_SEND`. FR-018 \[P0\]: `COPY_PASTE_BROADCAST_CONFIRMED` MUST be available when FE context positively links the send to copied broadcast content. FR-019 \[P0\]: `MANUAL_BROADCAST_RESEND_MATCHED` MUST be available when exact or normalized-exact text matches protected broadcast context even if FE copy signal is absent. FR-020 \[P1\]: `MANUAL_BROADCAST_RESEND_SUSPECTED` MAY be produced when same-intent similarity heuristics suggest broadcast-derived resend, but this classification MUST NOT hard-block by itself in Phase 1. |
| Enforcement Policy | FR-021 \[P0\]: System MUST apply protected resend decisions in backend without requiring a tenant-facing dashboard settings page. FR-022 \[P0\]: System MUST map protected resend conditions to actions: allow, allow-with-warning, queue/delay, or block. FR-023 \[P0\]: System MUST support a cooldown period when protected manual resend is detected while system-managed broadcast handling is still active or recent. |
| Sender Account Safety | FR-024 \[P0\]: System MUST stop or downgrade outbound behavior when a sender account becomes restricted, exceeds outbound eligibility policy, or enters anti-ban safe mode. FR-025 \[P1\]: System MUST integrate with existing WhatsApp outbound limit and account eligibility logic. FR-026 \[P1\]: System MUST preserve sender stickiness for an active conversation session unless the sender becomes ineligible and approved failover occurs. |
| Duplicate Investigation Traceability | FR-027 \[P1\]: System MUST preserve correlation ID / trace ID, dispatch source, classifier result, and attempt lineage across validation, lock, dispatch, retry, reconciliation, and audit write paths for suspected duplicate broadcast incidents. FR-028 \[P1\]: System MUST allow engineering and support logs to distinguish at minimum between `system_broadcast`, `manual_room_send`, retry/reconciliation activity, and duplicate-suspected system dispatch. |
| Audit and Support Visibility | FR-029 \[P0\]: System MUST log every delayed, queued, blocked, suppressed, retried, reconciled, duplicate-suspected, and safe-mode-triggered outbound attempt with machine-readable reason code. FR-030 \[P0\]: System MUST provide stable reason codes including at minimum `DUPLICATE_SUPPRESSED`, `LOCK_CONFLICT`, `RECONCILIATION_PENDING`, `MANUAL_BROADCAST_RESEND_WARNING`, `MANUAL_BROADCAST_RESEND_BLOCKED`, `DUPLICATE_BROADCAST_SUSPECTED`, `ACCOUNT_SAFE_MODE`, `ACCOUNT_INELIGIBLE`, and `COOLDOWN_ACTIVE`. FR-031 \[P1\]: System MUST expose Admin, Supervisor, and IT Support audit views through existing SatuInbox dashboard surfaces with sender, operator, recipient fingerprint, content fingerprint, source, classifier result, action taken, timestamp, and related broadcast reference where applicable. |
| Internal Policy and Rollout | FR-032 \[P1\]: System MUST support backend-managed rollout policy for monitor / warning / strict behavior through internal configuration, feature flag, or code-managed policy rather than tenant-facing settings UI. FR-033 \[P1\]: System MUST validate internal policy configuration and fall back to a safe default profile if invalid values are loaded at runtime. |
| Non-Behavior Guarantees | FR-034 \[P0\]: System MUST NOT reveal internal decision formulas directly to operators beyond safe user-facing explanation. FR-035 \[P1\]: System MUST NOT weaken existing outbound limit, account rotation, or sender eligibility rules. FR-036 \[P1\]: System MUST NOT silently drop protected resend or duplicate-suspected events without logging an auditable outcome. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| --- | --- | --- | --- |
| EH-001 | Duplicate request | Suppress the second request, retain the original request as source of truth, and return a deterministic duplicate-safe result. | “Pesan serupa sudah sedang diproses.” |
| EH-002 | Recipient lock conflict | Allow only one worker to continue; other worker backs off or resolves as duplicate. | “Pengiriman sedang diproses. Silakan tunggu.” |
| EH-003 | Unknown post-dispatch status | Mark attempt as `RECONCILIATION_PENDING` and block blind resend until resolution. | “Status pengiriman sedang diverifikasi.” |
| EH-004 | Protected manual resend detected | Apply configured policy action when the same broadcast text is manually resent while the related broadcast handling is still active or recent. | “Pesan yang sama masih sedang ditangani oleh sistem broadcast.” |
| EH-005 | Active resend cooldown | Reject or hold new send from the same actor/account scope until cooldown expires. | “Pengiriman ulang manual dibatasi sementara. Tunggu hingga cooldown selesai.” |
| EH-006 | Sender account restricted / safe mode | Stop new sends from that account and trigger fallback only if policy permits. | “Akun pengirim dibatasi. Pengiriman dihentikan sementara.” |
| EH-007 | Account ineligible due to outbound limit | Prevent send from selected account and re-evaluate sender selection. | “Akun melewati batas outbound. Gunakan akun lain atau tunggu reset.” |
| EH-008 | Stale lock recovery | Expire lock using safe recovery rule, then re-evaluate request before any dispatch action. | “Sistem memulihkan status pengiriman sebelumnya.” |
| EH-009 | Invalid internal anti-ban configuration | Load safe default policy and raise admin/support observability alert. | Not user-facing unless surfaced through diagnostics. |
| EH-010 | Audit persistence degradation | Continue only if safety evaluation already succeeded; emit degraded observability alert and keep result status recoverable. | “Riwayat pengiriman sedang mengalami gangguan pencatatan.” |
| EH-011 | Duplicate broadcast suspected | Mark incident as duplicate-suspected, persist trace data, and avoid final root-cause classification until debugging evidence is available. | “Terdapat indikasi duplikasi pengiriman broadcast. Sistem sedang menandai data investigasi.” |
| EH-012 | FE behavioral context missing or partial | Fall back to content + broadcast-context evaluation instead of failing the request outright. | Not user-facing unless decision result requires feedback. |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| --- | --- | --- | --- |
| EC-001 | User double-clicks send button for the same message. | Only one logical send is processed; the second action is suppressed. | Button remains disabled until result resolves. |
| EC-002 | Two browser tabs submit the same manual outbound almost simultaneously. | Server-side idempotency prevents duplicate dispatch. | One tab may show success, the other duplicate-safe status. |
| EC-003 | Two broadcast workers resolve the same recipient in overlapping audience segments. | Only one logical recipient send chain may proceed for the same campaign scope. | Not user-facing. Logged in audit trail. |
| EC-004 | Timeout occurs after WA dispatch but before local ack persistence. | Attempt becomes `RECONCILIATION_PENDING`; no blind resend occurs. | Support sees verification state. |
| EC-005 | Content differs only by whitespace or capitalization. | Normalized fingerprint treats configured equivalent forms as duplicate candidates. | Not user-facing. |
| EC-006 | User manually resends the exact same broadcast text while the related broadcast job is still queued. | Protected resend policy applies based on configured backend mode and linked broadcast state. | Warning, queue, or block based on mode. |
| EC-007 | User manually resends a slightly edited message that has the same intent as the broadcast. | Phase 1 may classify as suspicion-only, but MUST NOT hard-block solely on semantic guess. | Optional warning or no warning based on backend policy; always traceable in logs if flagged. |
| EC-008 | FE sends `pasteDetected = true` but source message origin is unknown. | Backend treats FE signal as supporting evidence, not final proof by itself, unless other context confirms broadcast linkage. | User sees only final decision outcome, not classifier internals. |
| EC-009 | FE does not send any paste or source context. | Backend falls back to text fingerprint + related broadcast context evaluation. | Behavior remains deterministic where exact match exists. |
| EC-010 | Sender failover becomes necessary during active conversation session. | Sender changes only if current sender is ineligible and approved failover is available. | Optional status note for support only. |
| EC-011 | Manual room send and broadcast send target the same recipient at nearly the same time. | Arbitration protects same-recipient collision by lock and logical send scope. | Support log shows collision outcome. |
| EC-012 | Audit log write fails after send success. | Send result remains canonical; observability alert is emitted for missing audit persistence. | Not shown to operator unless diagnostics page is open. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| --- | --- | --- | --- |
| Conversation Room Send Button | Disable repeat submit while pending. | 1\. Operator clicks send. 2. Button becomes loading/disabled. 3. Result returns success, warning, queue, or block. | US-006, US-007 |
| Conversation Room Warning / Block Message | Inline warning or toast when the same broadcast text is still being handled by the system. | 1\. Operator sends manual text from conversation room. 2. System detects protected resend condition. 3. Warning or block explanation appears. | US-006 |
| Broadcast Send Validation | Duplicate-safe and trace-aware pre-dispatch validation before campaign starts. | 1\. User starts campaign. 2. System validates duplicates and prepares traceability metadata. 3. Campaign runs or is flagged for investigation as needed. | US-001, US-002 |
| Audit Log Table | Read-only table for users with anti-ban log access permission showing actor, sender account, source, classifier result, reason code, and result. | 1\. User with permission opens anti-ban logs. 2. Filters by account/actor/time. 3. Opens detail row. | US-004, US-008 |
| Account Detail / Sender Health | Shows anti-ban safe mode or restriction-related state for sender accounts. | 1\. Admin/Support opens account detail. 2. Sees current account state and recent anti-ban events. | US-008 |

**UI copy (Bahasa Indonesia only):**

*   “Pesan serupa sudah sedang diproses.”
*   “Pesan yang sama masih sedang ditangani oleh sistem broadcast.”
*   “Pengiriman ulang manual dibatasi sementara. Tunggu hingga cooldown selesai.”
*   “Akun pengirim dibatasi. Pengiriman dihentikan sementara.”
*   “Status pengiriman sedang diverifikasi.”
*   “Terdapat indikasi duplikasi pengiriman broadcast. Sistem sedang menandai data investigasi.”

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| --- | --- | --- | --- | --- | --- |
| dedupeWindowSeconds | Integer | `120` | Min 5, Max 3600. Internal backend policy. | Yes | `120` |
| operatorCooldownSeconds | Integer | `30` | Min 0, Max 3600. Internal backend policy. | Yes | `30` |
| duplicateFingerprintMode | Enum | `normalized_text_plus_scope` | Must be one of approved internal modes for **text-only** outbound. | Yes | `normalized_text_plus_scope` |
| manualBroadcastResendWindowSeconds | Integer | `300` | Min 0, Max 3600. Internal backend policy for recent broadcast protection. | Yes | `300` |
| policyEnforcementMode | Enum | `warning_only` | Internal mode: `monitor_only`, `warning_only`, `queue_only`, `strict`. Not tenant-facing in Phase 1. | Yes | `monitor_only` |
| senderSafeModeEnabled | Boolean | `true` | Required. | Yes | `true` |
| senderSafeModeDurationSeconds | Integer | `300` | Min 30, Max 86400. | Yes | `300` |
| antiBanReasonCode | Enum | `MANUAL_BROADCAST_RESEND_BLOCKED` | Must be one of stable reason code list. | Derived | N/A |
| recipientFingerprint | String | `wa:+62812****1234` | Derived, masked in support/admin display where needed. | Derived | N/A |
| contentFingerprint | String | `sha256:...` | Must be deterministic for the same normalized **text** content. | Derived | N/A |
| outboundSource | Enum | `broadcast` | Must be one of `broadcast`, `conversation_manual`. | Yes | N/A |
| dispatchSource | Enum | `system_broadcast` | Must be one of `system_broadcast`, `manual_room_send`. | Derived | N/A |
| relatedBroadcastReference | String | `broadcast-job-20260611-001` | Optional for manual sends; required when linked protected resend condition is detected. | Conditional | N/A |
| pasteDetected | Boolean | `true` | Optional FE behavioral context. | Optional | `false` |
| sourceMessageAction | Enum | `copy_message` | Optional FE behavioral context. Must be one of `copy_message`, `quote_message`, `forward_message`, `none`, `unknown`. | Optional | `unknown` |
| sourceMessageId | String | `msg_789` | Optional FE behavioral context. | Optional | N/A |
| sourceMessageOrigin | Enum | `broadcast` | Optional FE behavioral context. Must be one of `broadcast`, `manual`, `inbound`, `system`, `unknown`. | Optional | `unknown` |
| sendFromCopiedMessage | Boolean | `true` | Optional FE behavioral context. | Optional | `false` |
| classifierResult | Enum | `COPY_PASTE_BROADCAST_CONFIRMED` | Must be one of `NORMAL_MANUAL_SEND`, `COPY_PASTE_BROADCAST_CONFIRMED`, `MANUAL_BROADCAST_RESEND_MATCHED`, `MANUAL_BROADCAST_RESEND_SUSPECTED`, `SYSTEM_BROADCAST_SEND`. | Derived | N/A |
| dispatchCorrelationId | String | `corr_01JXYZ...` | Must be stable across validation, lock, dispatch, retry, reconciliation, and audit write paths. | Derived | N/A |
| duplicateInvestigationStatus | Enum | `DUPLICATE_BROADCAST_SUSPECTED` | Must be one of `NONE`, `DUPLICATE_BROADCAST_SUSPECTED`, `CONFIRMED_SYSTEM_DUPLICATE`, `CONFIRMED_MANUAL_RESEND`. | Derived | `NONE` |
| reconciliationStatus | Enum | `RECONCILIATION_PENDING` | Must be one of `NONE`, `RECONCILIATION_PENDING`, `CONFIRMED_SENT`, `CONFIRMED_FAILED`, `UNRESOLVED_TIMEOUT`. | Derived | `NONE` |

---

## **11\. State Transition Model**

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Outbound Attempt | `PENDING` | Pre-send validation starts | `VALIDATING` | System | Request accepted | Validation, dedupe, classifier, resend-guard, and trace evaluation begin | `wa.outbound.validation.started` |
| Outbound Attempt | `VALIDATING` | Duplicate detected | `SUPPRESSED_DUPLICATE` | System | Matching idempotency key within dedupe window | Attempt linked to winner | `wa.outbound.duplicate.suppressed` |
| Outbound Attempt | `VALIDATING` | Protected resend condition detected in warning mode | `WARNED_RESEND` | System | Classifier result indicates protected resend and mode = warning\_only | Warning prepared; no internal formula exposed | `wa.outbound.resend.warning` |
| Outbound Attempt | `WARNED_RESEND` | Operator continues send under warning policy | `LOCKED` | System | Warning-only mode still allows continuation after decision | Lock row created; related broadcast reference preserved | `wa.outbound.lock.acquired` |
| Outbound Attempt | `VALIDATING` | Protected resend condition detected in queue mode | `QUEUED_RESEND` | System | Classifier result indicates protected resend and mode = queue\_only | Cooldown/queue timer started; send not dispatched immediately | `wa.outbound.resend.queued` |
| Outbound Attempt | `QUEUED_RESEND` | Cooldown expires or queued turn is reached | `VALIDATING` | System | Resend remains eligible for re-evaluation | Request is re-evaluated before any lock or dispatch | `wa.outbound.validation.restarted` |
| Outbound Attempt | `VALIDATING` | Protected resend policy blocks send | `BLOCKED_MANUAL_RESEND` | System | Classifier result indicates protected resend and mode = strict | No dispatch occurs; cooldown may start; reason code persisted | `wa.outbound.risk.blocked` |
| Outbound Attempt | `VALIDATING` | Validation passes and lock acquired | `LOCKED` | System | No duplicate, no blocking policy, lock success | Lock row created | `wa.outbound.lock.acquired` |
| Outbound Attempt | `LOCKED` | Dispatch succeeds | `SENT` | System | WA send acknowledged | Lock released, counters updated, trace finalized | `wa.outbound.sent` |
| Outbound Attempt | `LOCKED` | Dispatch result unknown | `RECONCILIATION_PENDING` | System | Timeout / uncertain status | No blind resend allowed | `wa.outbound.reconciliation.pending` |
| Outbound Attempt | `RECONCILIATION_PENDING` | Reconciliation confirms success | `SENT` | System | External/local proof found | Retry path closed | `wa.outbound.reconciliation.confirmed_sent` |
| Outbound Attempt | `RECONCILIATION_PENDING` | Reconciliation confirms failure | `FAILED_FINAL` | System | Failure proof found | Retry eligibility evaluated | `wa.outbound.reconciliation.confirmed_failed` |
| Duplicate Investigation | `NONE` | Duplicate broadcast signal is detected | `DUPLICATE_BROADCAST_SUSPECTED` | System | Trace or audit pattern indicates repeated broadcast dispatch without confirmed cause | Correlation ID, dispatch source, classifier path, attempt lineage, and evidence are persisted | `wa.broadcast.duplicate.suspected` |
| Duplicate Investigation | `DUPLICATE_BROADCAST_SUSPECTED` | Trace review confirms system-origin duplicate | `CONFIRMED_SYSTEM_DUPLICATE` | System | Evidence shows duplicate originated from system-managed broadcast path | Investigation result linked to related attempts and visible in dashboard logs | `wa.broadcast.duplicate.confirmed_system` |
| Duplicate Investigation | `DUPLICATE_BROADCAST_SUSPECTED` | Trace review confirms manual resend | `CONFIRMED_MANUAL_RESEND` | System | Evidence shows duplicate originated from manual room send path | Investigation result linked to related attempts and visible in dashboard logs | `wa.broadcast.duplicate.confirmed_manual` |
| Sender Account | `NORMAL` | Risk threshold or restriction signal exceeded | `SAFE_MODE` | System/Admin | Safe-mode enabled | New sends blocked or downgraded | `wa.sender.safe_mode.entered` |
| Sender Account | `SAFE_MODE` | Duration expires and conditions healthy | `NORMAL` | System/Admin | No active restriction and cooldown passed | Sending resumes | `wa.sender.safe_mode.exited` |
| Sender Account | `NORMAL` / `SAFE_MODE` | External restriction detected | `RESTRICTED` | System/Admin | Restriction signal present | New sends blocked | `wa.sender.restricted` |

---

## **12\. Permission Matrix**

| Role / Permission Scope | View | Create | Update | Delete / Archive | Export | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Operator / TLC User | Allowed (own send warnings only) | Allowed (send action) | Denied | Denied | Denied | Can see user-facing warnings, cannot see internal classifier formulas or support logs. |
| User with anti-ban log access permission | Allowed | Denied | Denied | Denied | Allowed (read-only only if granted) | Read-only visibility into anti-ban logs and account state. Access is permission-based, not tied to a feature-specific Supervisor definition. |
| Admin | Allowed | Allowed | Denied | Denied | Allowed | May inspect audit logs and sender account state. No tenant-facing anti-ban settings page in Phase 1. |
| Super Admin | Allowed | Allowed | Denied | Denied | Allowed | Same as Admin with broader tenant/platform scope. |
| IT Support (internal) | Allowed | Denied | Denied | Denied | Allowed | Internal dashboard user for monitoring and technical assistance only; no special override authority outside developed product surfaces. |

Server-side enforcement is mandatory. UI hiding alone is not sufficient.

---

## **13\. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pre-send Validation | `POST /api/wa/outbound/validate` | FE / Worker | Anti-Ban Service | `tenantId`, `outboundSource`, `senderAccountId`, `recipientId`, `conversationId`, `contentFingerprint`, `actorId`, `dispatchSource`, optional `relatedBroadcastReference`, optional `behaviorContext { pasteDetected, sourceMessageAction, sourceMessageId, sourceMessageOrigin, sendFromCopiedMessage }` | allow / warning / queue / block + `reasonCode` + `cooldownSeconds` + `classifierResult` + optional `relatedBroadcastReference` | `DUPLICATE_SUPPRESSED`, `MANUAL_BROADCAST_RESEND_BLOCKED`, `ACCOUNT_INELIGIBLE`, `CONFIG_INVALID` | Additive contract. FE may send no behavior context and backend still functions. |
| Audit Log Query | `GET /api/wa/outbound/anti-ban/logs` | FE | Anti-Ban Service | filters: time range, actor, sender, result, reasonCode | paginated log rows | `FORBIDDEN`, `INVALID_FILTER` | Only users explicitly granted anti-ban log access permission may read these logs. |
| Send Attempt Event | `wa.outbound.validation.result` | Anti-Ban Service | Worker / Logging | `attemptId`, `decision`, `reasonCode`, `cooldown`, `lockInfo`, `classifierResult`, `dispatchCorrelationId`, `relatedBroadcastReference` | ack optional | N/A | Internal event name stable for observability. |
| Dispatch Trace Event | `wa.broadcast.dispatch.trace.recorded` | Worker / Anti-Ban Service | Logging / Support | `attemptId`, `dispatchCorrelationId`, `relatedBroadcastReference`, `dispatchSource`, `classifierResult`, `workerId`, `attemptNumber`, `reasonCode` | ack optional | N/A | Observability-first event; does not imply confirmed root cause by itself. |
| Broadcast Protection Context Event | `wa.broadcast.protection_context.updated` | Broadcast Worker / Anti-Ban Service | Validation / Logging | `broadcastJobId`, `recipientFingerprint`, `conversationId`, `contentFingerprint`, `broadcastState`, `recentProtectionUntil`, `dispatchCorrelationId` | ack optional | N/A | Used to maintain active/recent protected broadcast context for validation. |
| Account State Event | `wa.sender.safe_mode.changed` | Anti-Ban Service / WA Service | FE / Logging / Support | `senderAccountId`, `oldState`, `newState`, `reasonCode`, `expiresAt` | ack optional | N/A | Must remain additive to avoid breaking consumers. |
| Reconciliation Event | `wa.outbound.reconciliation.updated` | Worker / Anti-Ban Service | Logging / Support | `attemptId`, `previousStatus`, `newStatus`, `evidenceType` | ack optional | N/A | Used for uncertain timeout recovery. |

Unknown fields in internal payloads SHOULD be ignored by consumers unless explicitly marked required.

---

## **14\. Detailed Backend Evaluation Flow**

### **14.1 Broadcast Protection Context Creation**

When a system-managed broadcast creates or processes a recipient-level delivery attempt, backend creates or updates a **broadcast protection context** containing at minimum:

*   tenantId
*   channel
*   recipientFingerprint
*   optional conversationId
*   senderAccountId
*   broadcastJobId / broadcast reference
*   contentFingerprint / normalized text fingerprint
*   broadcast state (`QUEUED`, `PROCESSING`, `RETRYING`, `RECONCILIATION_PENDING`, `SENT_RECENT`, `FAILED_FINAL`)
*   recentProtectionUntil
*   dispatchCorrelationId
*   timestamps

This context is the lookup source for later manual room-send evaluation.

### **14.2 Manual Room Send Intake**

When FE submits a manual room send, backend receives:

*   core send payload (tenant, recipient, conversation, sender, text)
*   `dispatchSource = manual_room_send`
*   optional FE behavioral context when available:
    *   `pasteDetected`
    *   `sourceMessageAction`
    *   `sourceMessageId`
    *   `sourceMessageOrigin`
    *   `sendFromCopiedMessage`

### **14.3 Normalization and Fingerprint**

Backend normalizes text using canonical text normalization rules and produces a deterministic fingerprint.

Normalization policy must be centrally shared across all validating services and workers.

### **14.4 Related Broadcast Lookup**

Before dispatch, backend searches for a related broadcast protection context using priority:

1.  same `conversationId` when available
2.  otherwise same `recipientFingerprint`
3.  constrained by same `tenantId` and same `channel`
4.  optional stronger filter by `senderAccountId` where applicable
5.  broadcast state still active or recent inside protection window

### **14.5 Evidence Evaluation**

Backend evaluates evidence in this order:

1.  **Strong FE-origin evidence**
    *   `sourceMessageOrigin = broadcast`
    *   or `sendFromCopiedMessage = true`
    *   or `sourceMessageAction = copy_message` with broadcast-linked source
2.  **Exact / normalized exact text match** against protected broadcast context
3.  **Similarity suspicion only** for same-intent but non-exact message, if enabled as observe-only logic

### **14.6 Classifier Result**

Backend assigns one classifier result:

*   `SYSTEM_BROADCAST_SEND`
*   `NORMAL_MANUAL_SEND`
*   `COPY_PASTE_BROADCAST_CONFIRMED`
*   `MANUAL_BROADCAST_RESEND_MATCHED`
*   `MANUAL_BROADCAST_RESEND_SUSPECTED`

### **14.7 Decisioning**

Backend maps classifier + broadcast state + rollout mode to action:

*   allow
*   allow with warning
*   queue / delay
*   block

### **14.8 Trace Persistence**

Every evaluated request persists:

*   classifier result
*   decision
*   reason code
*   related broadcast reference if any
*   correlation ID
*   dispatch source
*   FE behavior context presence / absence
*   evidence path used for decision

### **14.9 Existing-Code Adaptation Constraint**

Implementation SHOULD be inserted into the existing send pipeline as a pre-dispatch evaluation layer, not as a separate end-user workflow. Existing FE send flow, worker dispatch flow, and audit logging flow should be reused wherever possible.

---

## **15\. Decision Rules**

### **15.1 Classifier Rules**

| Rule ID | Condition | Classifier Result |
| --- | --- | --- |
| DR-001 | `dispatchSource = system_broadcast` | `SYSTEM_BROADCAST_SEND` |
| DR-002 | Manual room send + FE strongly confirms copied broadcast origin | `COPY_PASTE_BROADCAST_CONFIRMED` |
| DR-003 | Manual room send + related protected broadcast exists + exact/normalized exact text match | `MANUAL_BROADCAST_RESEND_MATCHED` |
| DR-004 | Manual room send + related protected broadcast exists + same-intent heuristic only | `MANUAL_BROADCAST_RESEND_SUSPECTED` |
| DR-005 | Manual room send + no related protected broadcast evidence | `NORMAL_MANUAL_SEND` |

### **15.2 Action Rules**

| Rule ID | Classifier Result | Broadcast State | Action | Notes |
| --- | --- | --- | --- | --- |
| AR-001 | `NORMAL_MANUAL_SEND` | any | allow | Normal path |
| AR-002 | `COPY_PASTE_BROADCAST_CONFIRMED` | `QUEUED`, `PROCESSING`, `RETRYING`, `RECONCILIATION_PENDING` | block or queue | Backend-managed policy decides exact action |
| AR-003 | `COPY_PASTE_BROADCAST_CONFIRMED` | `SENT_RECENT` | warning, queue, or short block | Protects against immediate resend after recent send |
| AR-004 | `MANUAL_BROADCAST_RESEND_MATCHED` | active/recent protected state | warning, queue, or block | Exact text match without explicit FE copy proof |
| AR-005 | `MANUAL_BROADCAST_RESEND_SUSPECTED` | any | log only or low-severity warning | MUST NOT hard-block solely on similarity guess in Phase 1 |
| AR-006 | any protected resend classifier | policy mode = `monitor_only` | allow + log | No block in monitor-only mode |

### **15.3 Similar-Intent Rule**

Phase 1 enforcement MUST remain limited to exact or normalized exact text comparison plus FE-origin copied-message evidence. Same-intent detection with non-exact wording may be observed and logged, but MUST NOT become the sole reason for hard blocking in Phase 1.

---

## **16\. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| --- | --- | --- | --- | --- |
| Feature Flag | Introduce backend-scoped anti-ban rollout control starting from `monitor_only`. | Product / Engineering | Validate logs appear without delivery block in staging and canary lanes. | Disable flag or revert mode to `monitor_only`. |
| Existing Send Flow | Wrap manual and broadcast send flows with pre-send validation contract behind feature flag. | Engineering | Smoke test manual send, broadcast send, and retry flow. | Bypass validation wrapper via flag disable. |
| FE Behavioral Context | Allow FE to send behavioral context additively without making it mandatory for first release. | Engineering / FE | Validate backend safely handles full, partial, and absent context payloads. | Ignore behavioral context fields if rollout causes instability. |
| Audit Store | Add audit persistence, dispatch trace schema, classifier metadata, and correlation metadata before strict enforcement. | Engineering | Verify trace completeness in monitor-only mode. | Keep read path optional; disable write if severe issue and fallback to degraded alert mode. |
| Threshold Rollout | Stage policy: monitor-only → warning-only → queue-only / strict by selected tenants or internal rollout groups. | Product / Engineering | Compare manual resend collisions, duplicate suppression, operator complaints, and false positive rate. | Revert one stage back or disable blocking actions. |
| Support Workflow | Enable read-only audit view for Admin/Supervisor/Support after logs stabilize. | Product / Engineering / Support | Support can trace known test incidents end-to-end. | Hide view temporarily while preserving backend logging. |

---

## **17\. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Anti-ban audit log | Engineering / Support | Anti-Ban Service | 12 months minimum | Archive or rotate per tenant-safe policy; no silent drop before retention | Export allowed for Admin/Support if approved | Mask recipient phone in UI exports where needed. |
| Recipient fingerprint | Engineering | Derived at validation time | Same as audit log | Stored as masked/hashed fingerprint | Export only in masked form | Do not expose raw customer number unnecessarily. |
| Content fingerprint | Engineering | Derived from normalized content | Same as audit log | Keep fingerprint only; avoid storing raw message unless already stored elsewhere by parent feature | Export allowed | No raw plain-text logging required for anti-ban logic. |
| FE behavioral context snapshot | Engineering | FE -> Anti-Ban Service | Same as audit log | Persist only fields needed for evidence and debugging | Not exported by default | Avoid storing unnecessary clipboard-like sensitive metadata beyond declared fields. |
| Dispatch trace record | Engineering / Support | Worker / Anti-Ban Service | 12 months minimum | Archive or rotate per tenant-safe policy; no silent drop before retention | Export allowed for support review | Contains correlation metadata, not full raw text. |
| Cooldown / lock state | Engineering | Runtime state | TTL-based short-lived | Auto-expire | Not exported | Operational only. |
| Reconciliation result | Engineering / Support | Worker / Anti-Ban Service | Same as parent audit log | Persist final status and evidence type | Export allowed for support review | Avoid leaking sensitive message content. |

---

## **18\. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| --- | --- | --- | --- | --- | --- |
| Product Event | `wa_manual_broadcast_resend_warning_shown` | Operator receives warning for protected resend | tenantId, outboundSource, reasonCode, actorRole, relatedBroadcastReference | Product | Monitor rising warning rate |
| Product Event | `wa_manual_broadcast_resend_blocked` | Send blocked by protected resend policy | tenantId, outboundSource, reasonCode, actorRole, relatedBroadcastReference | Product | Alert if block rate spikes abnormally |
| Log / Metric / Trace | `wa.outbound.classifier.copy_paste_confirmed.count` | FE-confirmed copied broadcast resend is detected | tenantId, senderAccountId, relatedBroadcastReference | Engineering | Alert on unexpected sustained growth |
| Log / Metric / Trace | `wa.outbound.classifier.match_only.count` | Match-based protected resend is detected without FE copy proof | tenantId, senderAccountId, relatedBroadcastReference | Engineering | Monitor for false positive investigation |
| Log / Metric / Trace | `wa.outbound.reconciliation.pending.count` | Unknown delivery state entered | tenantId, outboundSource | Engineering | Alert if pending count exceeds threshold |
| Log / Metric / Trace | `wa.broadcast.duplicate.suspected.count` | Duplicate broadcast incident marked suspected | tenantId, relatedBroadcastReference, senderAccountId | Engineering | Alert on sustained growth |
| Audit Event | `wa.outbound.duplicate.suppressed` | Duplicate attempt blocked | actorId, senderAccountId, recipientFingerprint, attemptId, winnerAttemptId | Engineering / Support | No separate alert required |
| Audit Event | `wa.outbound.risk.blocked` | Send blocked due to policy | actorId, senderAccountId, recipientFingerprint, reasonCode, mode, relatedBroadcastReference | Engineering / Support | Investigate if high false positive suspected |
| Audit Event | `wa.broadcast.duplicate.suspected` | Duplicate broadcast incident flagged | actorId/system, senderAccountId, recipientFingerprint, dispatchCorrelationId, relatedBroadcastReference | Engineering / Support | Investigate root cause with trace review |
| Audit Event | `wa.sender.safe_mode.entered` | Sender state changes to safe mode | actorId/system, senderAccountId, reasonCode, expiresAt | Engineering / Support | Immediate support visibility |

Correlation ID / trace ID MUST be preserved across validation, lock, dispatch, retry, reconciliation, and audit write paths.

---

## **19\. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| --- | --- | --- | --- |
| Double click on send button | Duplicate customer contact | UI disables repeated submit and server idempotency blocks duplicate effect | QA simulates two rapid clicks and verifies one send only |
| Two browser tabs submit same message | Parallel duplicate dispatch | Server-side idempotency detects equivalent request scope | QA submits from two tabs near-simultaneously |
| Two workers process same broadcast recipient | Race condition and duplicate delivery | Recipient-level lock ensures one winner path | QA concurrency test with overlapping workers |
| Timeout after send dispatch | Blind resend of possibly successful message | Move to `RECONCILIATION_PENDING` before any retry | QA injects post-dispatch timeout and verifies no duplicate resend |
| Manual resend while system broadcast still active | Duplicate customer contact and suspension risk | Warning/queue/block based on classifier + policy mode | QA triggers protected resend condition against active broadcast |
| FE behavioral context missing | Loss of strong evidence path | Fallback to content + related broadcast evaluation without hard failure | QA submits request with and without behaviorContext |
| FE behavioral context contradicts content match | Misclassification risk | Backend applies deterministic precedence rule and logs evidence path used | QA injects mixed-evidence requests |
| Sender account becomes restricted mid-run | Unsafe continued sending | Stop new sends immediately; fallback only if allowed | QA simulates account restriction event during queue execution |
| Stale lock after worker crash | Permanent blocked recipient or unsafe recovery | TTL and recovery-safe re-evaluation before dispatch | QA crashes worker after lock acquisition |

---

## **20\. Non-Functional Requirements**

| Category | Requirement |
| --- | --- |
| Performance | Pre-send validation should complete in <= 100 ms p95 for normal outbound attempts excluding downstream WA dispatch latency. |
| Reliability | Duplicate prevention and retry behavior MUST be idempotent for retryable outbound actions. |
| Security | Tenant isolation and server-side permission enforcement are mandatory for log access and all backend decisions. |
| Privacy | Anti-ban logging SHOULD prefer masked recipient identity and content fingerprint instead of full raw content. FE behavioral context persisted MUST be minimized to declared fields only. |
| Observability | Every critical anti-ban decision path MUST produce logs, metrics, and audit events with correlation ID. |
| Availability | Anti-ban guard failure MUST degrade safely and MUST NOT create duplicate send amplification. |
| Accessibility | Operator warnings must remain readable and keyboard-accessible where surfaced in UI. |
| Localization | User-facing warning, queue, block, and verification messages must use Bahasa Indonesia. |
| Backward Compatibility | Existing FE send flow MUST remain functional even if behaviorContext fields are absent. |

---

## **21\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| --- | --- | --- | --- |
| Existing WhatsApp account eligibility / outbound limit logic | Engineering | Anti-ban decisions may conflict if state models differ | Reuse canonical account eligibility source and do not duplicate business logic inconsistently. |
| Retry semantics in worker implementation | Engineering | Blind resend may still occur if worker bypasses reconciliation | Route all retry paths through anti-ban identity layer. |
| Broadcast state visibility between worker and room validation | Engineering | Manual resend guard may misclassify if active broadcast state is stale | Reuse canonical broadcast queue/attempt state and preserve correlation metadata. |
| FE ability to send behavioral context consistently | FE / Engineering | Strong evidence path may be incomplete in some clients | Make FE context additive and keep safe backend fallback path. |
| Similar-intent messages that are not exact match | Product / QA | False positives if over-enforced too early | Keep same-intent logic observe-only in Phase 1. |
| Missing audit persistence under failure | Engineering | Support loses investigation trail | Add degraded-mode alert and canonical result persistence fallback. |
| Duplicate broadcast root cause still unknown | Engineering / Support | Preventive fix may be incomplete if debugging evidence remains weak | Prioritize trace completeness and log review before assuming final cause. |

---

## **22\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| --- | --- | --- | --- |
| Duplicate suppression correctness | 0 known duplicate deliveries from the same logical send scope after full rollout | Weekly | Support incident review + audit logs |
| Protected resend guard coverage | 100% of blocked/warned/queued protected resend attempts have stable reason code and related broadcast reference | Weekly | Audit logs |
| FE evidence ingestion coverage | When FE supports behavioral context, 100% of such requests persist the evidence path used for final decision | Weekly | Validation / audit logs |
| Reconciliation safety | 0 blind resend while `RECONCILIATION_PENDING` | Weekly | Retry / reconciliation logs |
| Sender safe mode reaction time | <= 5 seconds from restriction signal to send-stop state | Weekly | Account state events |
| Duplicate incident trace completeness | 100% of duplicate-suspected broadcast incidents include correlation ID, dispatch source, and attempt lineage | Monthly | Support tickets + audit/log review |

---

## **23\. Future Considerations**

| Topic | Why It Matters Later |
| --- | --- |
| Same-intent similarity observe-only model | Useful to study edited broadcast resend patterns without hard-blocking them yet. |
| Stronger broadcast lineage model | Better than semantic guessing if future UX can link room-send actions directly to copied broadcast source. |
| Attachment / media / template protection | Future outbound types may need different fingerprinting and resend rules. |
| Separate TLC policy profile | Some operator groups may need different internal policy without affecting all tenants. |
| ML-assisted risk scoring | May reduce false negatives once labeled operational data is sufficient. |

---

## **24\. Limitations**

| Limitation | Impact |
| --- | --- |
| Phase 1 is limited to exact-match **text-only** outbound protection. | Manual resend for attachments, templates, media, or fuzzy text similarity is not covered in this version. |
| FE behavioral context is optional and may be absent in some clients. | Backend must fall back to content/context-only evaluation, which is weaker than FE-confirmed evidence. |
| Same-intent but non-exact messages are not hard-blocked in Phase 1. | Some edited broadcast resend attempts may still pass if they avoid exact-match guardrails. |
| Restriction/banned detection source is assumed to be available from existing sender/account health signals. | If signal quality is weak, safe-mode behavior may need additional engineering work. |
| Duplicate broadcast system incidents may still require debugging after this guardrail is released. | This feature improves traceability and prevention for protected resend cases but does not guarantee root-cause elimination for every existing duplicate incident. |
| This feature protects outbound behavior but does not replace existing warming, humanization, or account rotation initiatives. | Overall anti-spam posture still depends on related WhatsApp Web capabilities. |

---

## **25\. Appendix**

| Item | Notes |
| --- | --- |
| Glossary | **Idempotency key**: stable identity for one logical send attempt. **Dedupe window**: time range where equivalent requests are treated as duplicates. **Reconciliation**: verification flow for unknown post-dispatch status. **Safe mode**: sender state that blocks or downgrades new sends after risk or restriction signals. **Classifier Result**: backend outcome that explains whether a manual room send is normal, broadcast-derived, or duplicate-suspected. |
| UI Labels | “Pesan serupa sudah sedang diproses.”, “Pesan yang sama masih sedang ditangani oleh sistem broadcast.”, “Pengiriman ulang manual dibatasi sementara. Tunggu hingga cooldown selesai.”, “Akun pengirim dibatasi. Pengiriman dihentikan sementara.”, “Status pengiriman sedang diverifikasi.”, “Terdapat indikasi duplikasi pengiriman broadcast. Sistem sedang menandai data investigasi.” |
| Assumptions | Phase 1 covers both broadcast and manual WhatsApp outbound for **text-only** messages. Broadcast queue, timing, retry/repeat handling, outbound limit, and account eligibility remain canonical dependencies. IT Support uses only existing SatuInbox dashboard and developed product surfaces for monitoring and investigation. FE behavioral context is additive, not mandatory. |
| Open Questions | Final dedupe normalization policy for exact text comparison; final protection window after the latest system-managed broadcast attempt; precedence rule when FE evidence conflicts with content-match-only evidence; in-flight behavior when sender safe mode activates; and whether tenant isolation needs one more explicit FR beyond the current security framing. |
| References | `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (1).md`, `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (2).md`, `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (3).md`, `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (4).md`, `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`, `Test/whatsapp-web/wa-outbound-anti-ban-qa-test-spec.md`, `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md`, `Test/whatsapp-web/WhatsApp Web Outbound Anti-Ban Guard.tsv` |