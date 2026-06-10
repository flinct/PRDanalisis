# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Web Outbound Anti-Ban Guard  
**Product Lead**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: 

---

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author       | Changes                                                                                                                                                                           |
| ------- | ------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v0.1    | 2026-06-10          | Dany Christian | Initial PRD draft for outbound anti-ban protection covering duplicate prevention, manual copy-paste burst protection, operator/account risk guardrails, and support auditability. |

---

## **2. Overview**

| Item             | Description                                                                                                                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose          | Reduce WhatsApp restriction and banned risk caused by duplicate outbound delivery, simultaneous sends, and manual operator behavior that appears bot-like.                                                                                         |
| Background       | Existing WhatsApp Web anti-spam work already covers humanization, warming, account rotation, and outbound caps, but incident input from IT Support shows an additional need for duplicate-send prevention and manual operator behavior protection. |
| Scope            | Applies to WhatsApp Web outbound flows in Phase 1: broadcast delivery and manual outbound send from conversation room when using WhatsApp sender accounts.                                                                                         |
| Primary Users    | Admin, Supervisor, Operator / TLC User, and IT Support.                                                                                                                                                                                            |
| Key Capabilities | Recipient-level deduplication, idempotent retry, recipient send locking, operator risk scoring, cooldown/throttle policy, safe mode, and support-grade audit trail.                                                                                |
| Outcome          | Outbound delivery becomes safer, duplicate sends are prevented, risky manual send behavior is controlled, and IT Support can trace why a send was allowed, delayed, blocked, or suppressed.                                                        |
| Assumptions      | Existing outbound limit, sender eligibility, and account health signals remain the canonical source of truth and are reused rather than redefined by this feature.                                                                                 |

### **Scope Definition**

| In Scope                                                                                   | Out of Scope                                                         |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Duplicate prevention for outbound send attempts.                                           | AI-generated content rewriting or message humanization redesign.     |
| Idempotency key generation and retry-safe behavior.                                        | Replacement of existing WhatsApp warming system.                     |
| Recipient-level concurrency control and send locking.                                      | Billing model redesign.                                              |
| Manual operator anti-ban detection for rapid paste and burst-send behavior.                | External anti-fraud or machine-learning classifier service.          |
| Tenant-level anti-ban policy modes: monitor-only, warning, soft-block, strict.             | Full customer engagement optimization or campaign conversion tuning. |
| Sender account safe mode and integration with existing outbound limit / eligibility logic. | Non-WhatsApp channels such as Instagram, Email, or Messenger.        |
| Admin/Support audit logs, reason codes, and observability metrics.                         | Historical retroactive unban analysis beyond audit visibility.       |

---

## **3. Problem Statement**

| ID     | Problem                                                                                                                                                                     | Impact                                                                                             |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| PS-001 | Broadcast messages may be sent 1-2 times in near-simultaneous timing to the same recipient.                                                                                 | Creates spam signal, duplicate customer contact, and higher restriction risk.                      |
| PS-002 | Retry, repeated submit, or multi-worker dispatch may produce multiple outbound effects for one logical send.                                                                | Delivery integrity becomes ambiguous and IT Support cannot trust send history.                     |
| PS-003 | Some TLC users perform rapid copy-paste outbound activity with unnaturally fast cadence.                                                                                    | Manual operator behavior appears automated and increases anti-spam detection risk.                 |
| PS-004 | Current anti-spam effort focuses on humanization, warming, rotation, and outbound caps, but does not explicitly guard duplicate dispatch or manual operator burst behavior. | Existing protection is incomplete for real incident patterns reported by IT Support.               |
| PS-005 | Support and engineering do not yet have a structured reason-code audit trail for duplicate suppression, throttle, cooldown, reconciliation, or safe mode decisions.         | Root-cause investigation is slow and production decisions become reactive instead of preventative. |

---

## **4. Objectives and Key Results**

| Objective                                                 | Key Result                                                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Prevent duplicate outbound delivery.                      | 0 duplicate sends for the same logical outbound attempt within the configured dedupe window in normal operation.                  |
| Reduce risky operator behavior before restriction occurs. | 90% of configured rapid paste / burst-send violations are detected and handled before dispatch.                                   |
| Make retry behavior safe.                                 | 0 blind resend on attempts marked `RECONCILIATION_PENDING` until status resolution is completed.                                  |
| Improve support visibility.                               | 100% of delayed, blocked, throttled, suppressed, retried, and reconciled outbound attempts produce machine-readable reason codes. |
| Protect sender health.                                    | Restriction-triggered safe mode stops new sends from affected accounts within 5 seconds of state change.                          |

---

## **5. User Stories and Acceptance Criteria**

### **Admin / Supervisor**

| ID     | Priority | User Story                                                                                                                                  | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                            |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-001 | P0       | As an Admin, I want duplicate outbound requests to be prevented so that one logical send does not contact the same recipient twice.         | 1. Given two identical outbound requests for the same sender, recipient, and content scope arrive within the dedupe window, When the second request is evaluated, Then the system suppresses it and keeps the first request as the source of truth. 2. Given a duplicate request is suppressed, When Admin or Support opens the audit trail, Then they can see the reason code and original attempt reference. |
| US-002 | P0       | As an Admin, I want retry behavior to be idempotent so that network uncertainty does not create duplicate sends.                            | 1. Given an outbound attempt times out after dispatch, When retry logic runs, Then the system reuses the same logical send identity. 2. Given delivery status is unknown, When the attempt enters reconciliation flow, Then the system MUST NOT blindly resend before resolution.                                                                                                                              |
| US-003 | P0       | As an Admin, I want risky manual operator behavior to be throttled or blocked based on policy so that sender accounts remain safer.         | 1. Given an operator pastes and sends similar messages in suspiciously fast cadence, When risk threshold is crossed, Then the system applies warning, delay, queueing, or block based on tenant enforcement mode. 2. Given enforcement mode is strict, When a hard threshold is crossed, Then the send is blocked and reason is shown in Bahasa Indonesia.                                                     |
| US-004 | P1       | As a Supervisor, I want read-only visibility into anti-ban decisions so that I can monitor operational risk without changing system policy. | 1. Given a Supervisor opens anti-ban logs, When data is shown, Then they can see attempt result, reason code, sender, recipient fingerprint, actor, and timestamp. 2. Given a Supervisor tries to edit policy, When the action is evaluated, Then the system denies it.                                                                                                                                        |
| US-005 | P1       | As an Admin, I want to configure anti-ban thresholds and enforcement mode per tenant so that the product can be rolled out safely.          | 1. Given anti-ban settings page is available, When Admin changes dedupe window, cooldown, or enforcement mode, Then the system validates and saves the configuration. 2. Given monitor-only mode is active, When risky behavior occurs, Then events are logged without blocking delivery.                                                                                                                      |

### **Operator / TLC User**

| ID     | Priority | User Story                                                                                                                                            | Acceptance Criteria                                                                                                                                                                                                                                                                                      |
| ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-006 | P0       | As an operator, I want clear feedback when my send is delayed or blocked so that I understand the action without seeing internal scoring details.     | 1. Given a send is delayed due to cooldown, When I click send, Then I see a clear Bahasa Indonesia message and cannot submit repeatedly to bypass the delay. 2. Given a send is blocked due to risk policy, When the action fails, Then the message explains that sending is too fast or too repetitive. |
| US-007 | P1       | As an operator, I want normal sending to remain smooth when my behavior is safe so that anti-ban protection does not slow regular work unnecessarily. | 1. Given my send behavior is within threshold, When I send a normal message, Then the system processes it without anti-ban warning. 2. Given enforcement mode is warning-only, When a low-risk signal occurs, Then the send may proceed with warning instead of block.                                   |

### **IT Support**

| ID     | Priority | User Story                                                                                                                                  | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                          |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-008 | P0       | As IT Support, I want a complete audit trail for anti-ban actions so that I can investigate banned or restricted account incidents quickly. | 1. Given a duplicate suppression, throttle, safe mode, or reconciliation event occurs, When IT Support reviews the log, Then each event includes actor, sender account, recipient fingerprint, action taken, and reason code. 2. Given an account enters safe mode, When IT Support opens the account history, Then the transition and linked outbound attempts are visible. |

---

## **6. Functional Requirements**

| Category                      | Requirements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Outbound Identity and Dedupe  | FR-001 [P0]: System MUST generate an idempotency key for every outbound attempt using at minimum tenant, channel, sender account, recipient identity, normalized content fingerprint, outbound source, and logical scope reference. FR-002 [P0]: System MUST suppress duplicate outbound attempts that resolve to the same idempotency key within a configurable dedupe window. FR-003 [P0]: System MUST support dedupe scope for both manual send and broadcast send. FR-004 [P1]: System SHOULD preserve a reference from the suppressed attempt to the original winning attempt.           |
| Recipient Concurrency Control | FR-005 [P0]: System MUST enforce recipient-level in-flight locking so two workers cannot dispatch the same logical outbound context to the same recipient simultaneously. FR-006 [P0]: If lock acquisition fails due to active processing, System MUST back off or suppress based on duplicate evaluation result. FR-007 [P1]: Lock records MUST use TTL or recovery-safe expiration to avoid permanent stale locks after worker failure.                                                                                                                                                     |
| Retry and Reconciliation      | FR-008 [P0]: System MUST make retry behavior idempotent by reusing the original logical send identity. FR-009 [P0]: If delivery status becomes unknown after dispatch, System MUST move the attempt into `RECONCILIATION_PENDING` and MUST NOT resend blindly. FR-010 [P1]: System MUST support reconciliation result states `CONFIRMED_SENT`, `CONFIRMED_FAILED`, and `UNRESOLVED_TIMEOUT`. FR-011 [P1]: System MUST keep a clear linkage between original attempt, retry count, and final resolved status.                                                                                  |
| Client Submit Protection      | FR-012 [P0]: UI MUST disable repeated submit while a send request is pending. FR-013 [P0]: Server-side protection MUST still prevent duplicate send if client-side submit protection fails or is bypassed.                                                                                                                                                                                                                                                                                                                                                                                    |
| Operator Behavior Detection   | FR-014 [P0]: System MUST detect risky operator behavior using configurable signal inputs that may include paste event, compose-to-send duration, repeated identical or near-identical content, and rolling burst-send frequency. FR-015 [P0]: System MUST calculate rolling risk score per operator and per sender account. FR-016 [P1]: System SHOULD distinguish low-risk single paste behavior from repeated high-speed paste-heavy behavior.                                                                                                                                              |
| Enforcement Policy            | FR-017 [P0]: System MUST support tenant-level enforcement modes `monitor_only`, `warning_only`, `soft_block`, and `strict`. FR-018 [P0]: System MUST map risk thresholds to actions: allow, allow-with-delay, queue, soft-block, or hard-block. FR-019 [P0]: System MUST support a cooldown period when burst or paste-heavy threshold is crossed. FR-020 [P1]: System SHOULD support different thresholds for broadcast source and manual room source.                                                                                                                                       |
| Sender Account Safety         | FR-021 [P0]: System MUST stop or downgrade outbound behavior when a sender account becomes restricted, exceeds outbound eligibility policy, or enters anti-ban safe mode. FR-022 [P1]: System MUST integrate with existing WhatsApp outbound limit and account eligibility logic. FR-023 [P1]: System MUST preserve sender stickiness for an active conversation session unless the sender becomes ineligible and approved failover occurs.                                                                                                                                                   |
| Ordering and Partial Stop     | FR-024 [P1]: System MUST preserve order for multi-part logical sends and MUST NOT continue later parts after a non-recoverable failure that would create confusing duplicate or fragmented communication. FR-025 [P1]: System MUST surface partial-stop decisions in logs and support analytics.                                                                                                                                                                                                                                                                                              |
| Audit and Support Visibility  | FR-026 [P0]: System MUST log every delayed, throttled, blocked, suppressed, retried, reconciled, and safe-mode-triggered outbound attempt with machine-readable reason code. FR-027 [P0]: System MUST provide stable reason codes including at minimum `DUPLICATE_SUPPRESSED`, `LOCK_CONFLICT`, `RECONCILIATION_PENDING`, `PASTE_RISK`, `BURST_RISK`, `ACCOUNT_SAFE_MODE`, `ACCOUNT_INELIGIBLE`, and `COOLDOWN_ACTIVE`. FR-028 [P1]: System MUST expose Admin and Support audit views with sender, operator, recipient fingerprint, content fingerprint, source, action taken, and timestamp. |
| Tenant Configuration          | FR-029 [P1]: System MUST support tenant-level settings for dedupe window, risk thresholds, cooldown duration, enforcement mode, and monitor-only rollout. FR-030 [P1]: System MUST validate threshold configurations and fall back to a safe default profile if invalid values are loaded at runtime.                                                                                                                                                                                                                                                                                         |
| Non-Behavior Guarantees       | FR-031 [P0]: System MUST NOT reveal internal risk score formulas directly to operators. FR-032 [P1]: System MUST NOT weaken existing outbound limit, account rotation, or sender eligibility rules. FR-033 [P1]: System MUST NOT silently drop high-risk events without logging an auditable outcome.                                                                                                                                                                                                                                                                                         |

---

## **7. Error Handling**

| ID     | Type                                     | Handling                                                                                                                       | UI/UX                                                                |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| EH-001 | Duplicate request                        | Suppress the second request, retain the original request as source of truth, and return a deterministic duplicate-safe result. | “Pesan serupa sudah sedang diproses.”                                |
| EH-002 | Recipient lock conflict                  | Allow only one worker to continue; other worker backs off or resolves as duplicate.                                            | “Pengiriman sedang diproses. Silakan tunggu.”                        |
| EH-003 | Unknown post-dispatch status             | Mark attempt as `RECONCILIATION_PENDING` and block blind resend until resolution.                                              | “Status pengiriman sedang diverifikasi.”                             |
| EH-004 | Risk threshold exceeded                  | Apply configured policy action: warning, delay, queue, soft-block, or hard-block.                                              | “Aktivitas pengiriman terlalu cepat. Coba beberapa saat lagi.”       |
| EH-005 | Active cooldown                          | Reject new send from the same actor/account scope until cooldown expires.                                                      | “Pengiriman dibatasi sementara. Tunggu hingga cooldown selesai.”     |
| EH-006 | Sender account restricted / safe mode    | Stop new sends from that account and trigger fallback only if policy permits.                                                  | “Akun pengirim dibatasi. Pengiriman dihentikan sementara.”           |
| EH-007 | Account ineligible due to outbound limit | Prevent send from selected account and re-evaluate sender selection.                                                           | “Akun melewati batas outbound. Gunakan akun lain atau tunggu reset.” |
| EH-008 | Stale lock recovery                      | Expire lock using safe recovery rule, then re-evaluate request before any dispatch action.                                     | “Sistem memulihkan status pengiriman sebelumnya.”                    |
| EH-009 | Invalid anti-ban configuration           | Load safe default thresholds and raise admin/support observability alert.                                                      | “Pengaturan proteksi tidak valid. Sistem memakai pengaturan aman.”   |
| EH-010 | Audit persistence degradation            | Continue only if safety evaluation already succeeded; emit degraded observability alert and keep result status recoverable.    | “Riwayat pengiriman sedang mengalami gangguan pencatatan.”           |

---

## **8. Edge Cases**

| ID     | Scenario                                                                               | Expected Behavior                                                                                       | UI/UX                                                        |
| ------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| EC-001 | User double-clicks send button for the same message.                                   | Only one logical send is processed; the second action is suppressed.                                    | Button remains disabled until result resolves.               |
| EC-002 | Two browser tabs submit the same manual outbound almost simultaneously.                | Server-side idempotency prevents duplicate dispatch.                                                    | One tab may show success, the other duplicate-safe status.   |
| EC-003 | Two broadcast workers resolve the same recipient in overlapping audience segments.     | Only one logical recipient send chain may proceed for the same campaign scope.                          | Not user-facing. Logged in audit trail.                      |
| EC-004 | Timeout occurs after WA dispatch but before local ack persistence.                     | Attempt becomes `RECONCILIATION_PENDING`; no blind resend occurs.                                       | Support sees verification state.                             |
| EC-005 | Content differs only by whitespace or capitalization.                                  | Normalized fingerprint treats configured equivalent forms as duplicate candidates.                      | Not user-facing.                                             |
| EC-006 | Operator types part of message manually, then pastes the rest.                         | Risk engine combines paste signal and send cadence rather than assuming all paste events are high risk. | Warning or no warning based on threshold.                    |
| EC-007 | Operator sends near-identical messages to many recipients with small token variation.  | Burst/cadence rules may still trigger throttle even if exact fingerprint differs.                       | “Pesan serupa terdeteksi dikirim terlalu cepat.”             |
| EC-008 | Worker crashes while holding recipient lock.                                           | Lock expires or is recovered safely without causing duplicate dispatch.                                 | Not user-facing.                                             |
| EC-009 | Sender failover becomes necessary during active conversation session.                  | Sender changes only if current sender is ineligible and approved failover is available.                 | Optional status note for support only.                       |
| EC-010 | Anti-ban mode is `monitor_only`.                                                       | Risk events are logged but no outbound is blocked.                                                      | Operator sees no blocking state.                             |
| EC-011 | Manual room send and broadcast send target the same recipient at nearly the same time. | Arbitration protects same-recipient collision by lock and logical send scope.                           | Support log shows collision outcome.                         |
| EC-012 | Audit log write fails after send success.                                              | Send result remains canonical; observability alert is emitted for missing audit persistence.            | Not shown to operator unless admin diagnostics page is open. |

---

## **9. UI & UX Requirements**

| Component                      | Description                                                                                                  | UX Flow                                                                                                            | Related User Story IDs |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| Conversation Room Send Button  | Disable repeat submit while pending.                                                                         | 1. Operator clicks send. 2. Button becomes loading/disabled. 3. Result returns success, warning, delay, or block.  | US-006, US-007         |
| Conversation Room Risk Warning | Inline warning or toast for delay/block due to anti-ban policy.                                              | 1. Operator performs risky action. 2. System evaluates policy. 3. Warning appears with safe explanation.           | US-006                 |
| Broadcast Send Validation      | Duplicate-safe and risk-aware pre-dispatch validation before campaign starts.                                | 1. User starts campaign. 2. System validates risk and duplicates. 3. Campaign runs, delays, or blocks accordingly. | US-001, US-002         |
| Admin Anti-Ban Settings        | Dedicated settings area for enforcement mode, dedupe window, cooldown, and thresholds.                       | 1. Admin opens settings. 2. Edits values. 3. System validates and saves.                                           | US-005                 |
| Audit Log Table                | Read-only table for Admin/Supervisor/Support showing actor, sender account, source, result, and reason code. | 1. User opens anti-ban logs. 2. Filters by account/actor/time. 3. Opens detail row.                                | US-004, US-008         |
| Account Detail / Sender Health | Shows anti-ban safe mode or restriction-related state for sender accounts.                                   | 1. Admin/Support opens account detail. 2. Sees current account state and recent anti-ban events.                   | US-008                 |

**UI copy (Bahasa Indonesia only):**

- “Pesan serupa sudah sedang diproses.”
- “Aktivitas pengiriman terlalu cepat. Coba beberapa saat lagi.”
- “Pengiriman dibatasi sementara. Tunggu hingga cooldown selesai.”
- “Akun pengirim dibatasi. Pengiriman dihentikan sementara.”
- “Status pengiriman sedang diverifikasi.”
- “Mode monitor saja”
- “Peringatan saja”
- “Blokir ringan”
- “Mode ketat”

---

## **10. Field & Validation**

| Field                             | Type    | Example                      | Validation                                                                                                   | Required | Default                      |
| --------------------------------- | ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------- |
| antiBanMode                       | Enum    | `monitor_only`               | Must be one of: `monitor_only`, `warning_only`, `soft_block`, `strict`.                                      | Yes      | `monitor_only`               |
| dedupeWindowSeconds               | Integer | `120`                        | Min 5, Max 3600.                                                                                             | Yes      | `120`                        |
| operatorCooldownSeconds           | Integer | `30`                         | Min 0, Max 3600.                                                                                             | Yes      | `30`                         |
| duplicateFingerprintMode          | Enum    | `normalized_text_plus_scope` | Must be one of approved internal modes.                                                                      | Yes      | `normalized_text_plus_scope` |
| manualBurstThresholdCount         | Integer | `5`                          | Min 1, Max 100.                                                                                              | Yes      | `5`                          |
| manualBurstThresholdWindowSeconds | Integer | `60`                         | Min 5, Max 3600.                                                                                             | Yes      | `60`                         |
| pasteRiskEnabled                  | Boolean | `true`                       | Required.                                                                                                    | Yes      | `true`                       |
| pasteFastSendThresholdMs          | Integer | `1200`                       | Min 0, Max 60000.                                                                                            | Yes      | `1200`                       |
| senderSafeModeEnabled             | Boolean | `true`                       | Required.                                                                                                    | Yes      | `true`                       |
| senderSafeModeDurationSeconds     | Integer | `300`                        | Min 30, Max 86400.                                                                                           | Yes      | `300`                        |
| riskScorePerActor                 | Integer | `72`                         | Derived rolling score from policy signals.                                                                   | Derived  | N/A                          |
| riskScorePerAccount               | Integer | `81`                         | Derived rolling score from account-level signal aggregation.                                                 | Derived  | N/A                          |
| antiBanReasonCode                 | Enum    | `DUPLICATE_SUPPRESSED`       | Must be one of stable reason code list.                                                                      | Derived  | N/A                          |
| recipientFingerprint              | String  | `wa:+62812****1234`          | Derived, masked in support/admin display where needed.                                                       | Derived  | N/A                          |
| contentFingerprint                | String  | `sha256:...`                 | Must be deterministic for the same normalized content.                                                       | Derived  | N/A                          |
| outboundSource                    | Enum    | `broadcast`                  | Must be one of `broadcast`, `conversation_manual`.                                                           | Yes      | N/A                          |
| reconciliationStatus              | Enum    | `RECONCILIATION_PENDING`     | Must be one of `NONE`, `RECONCILIATION_PENDING`, `CONFIRMED_SENT`, `CONFIRMED_FAILED`, `UNRESOLVED_TIMEOUT`. | Derived  | `NONE`                       |

---

## **11. State Transition Model**

| Entity           | Current State            | Action / Trigger                              | Next State               | Allowed Roles | Guard Conditions                               | Side Effects                    | Audit Event                                   |
| ---------------- | ------------------------ | --------------------------------------------- | ------------------------ | ------------- | ---------------------------------------------- | ------------------------------- | --------------------------------------------- |
| Outbound Attempt | `PENDING`                | Pre-send validation starts                    | `VALIDATING`             | System        | Request accepted                               | Risk evaluation begins          | `wa.outbound.validation.started`              |
| Outbound Attempt | `VALIDATING`             | Validation passes and lock acquired           | `LOCKED`                 | System        | No duplicate, no blocking policy, lock success | Lock row created                | `wa.outbound.lock.acquired`                   |
| Outbound Attempt | `VALIDATING`             | Duplicate detected                            | `SUPPRESSED_DUPLICATE`   | System        | Matching idempotency key within dedupe window  | Attempt linked to winner        | `wa.outbound.duplicate.suppressed`            |
| Outbound Attempt | `VALIDATING`             | Risk policy blocks send                       | `BLOCKED_RISK`           | System        | Threshold crossed under blocking mode          | Cooldown may start              | `wa.outbound.risk.blocked`                    |
| Outbound Attempt | `LOCKED`                 | Dispatch succeeds                             | `SENT`                   | System        | WA send acknowledged                           | Lock released, counters updated | `wa.outbound.sent`                            |
| Outbound Attempt | `LOCKED`                 | Dispatch result unknown                       | `RECONCILIATION_PENDING` | System        | Timeout / uncertain status                     | No blind resend allowed         | `wa.outbound.reconciliation.pending`          |
| Outbound Attempt | `RECONCILIATION_PENDING` | Reconciliation confirms success               | `SENT`                   | System        | External/local proof found                     | Retry path closed               | `wa.outbound.reconciliation.confirmed_sent`   |
| Outbound Attempt | `RECONCILIATION_PENDING` | Reconciliation confirms failure               | `FAILED_FINAL`           | System        | Failure proof found                            | Retry eligibility evaluated     | `wa.outbound.reconciliation.confirmed_failed` |
| Sender Account   | `NORMAL`                 | Risk threshold or restriction signal exceeded | `SAFE_MODE`              | System/Admin  | Safe-mode enabled                              | New sends blocked or downgraded | `wa.sender.safe_mode.entered`                 |
| Sender Account   | `SAFE_MODE`              | Duration expires and conditions healthy       | `NORMAL`                 | System/Admin  | No active restriction and cooldown passed      | Sending resumes                 | `wa.sender.safe_mode.exited`                  |
| Sender Account   | `NORMAL` / `SAFE_MODE`   | External restriction detected                 | `RESTRICTED`             | System/Admin  | Restriction signal present                     | New sends blocked               | `wa.sender.restricted`                        |

---

## **12. Permission Matrix**

| Role                  | View                             | Create                | Update                           | Delete / Archive | Export                                       | Notes                                                                                     |
| --------------------- | -------------------------------- | --------------------- | -------------------------------- | ---------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Operator / TLC User   | Allowed (own send warnings only) | Allowed (send action) | Denied (policy/config)           | Denied           | Denied                                       | Can see user-facing warnings, cannot see internal score details.                          |
| Supervisor            | Allowed                          | Denied                | Denied                           | Denied           | Allowed (read-only logs if product approves) | Read-only visibility into anti-ban logs and account state.                                |
| Admin                 | Allowed                          | Allowed               | Allowed                          | Denied           | Allowed                                      | May configure anti-ban settings and inspect audit logs.                                   |
| Super Admin           | Allowed                          | Allowed               | Allowed                          | Denied           | Allowed                                      | Same as Admin with broader tenant/platform scope.                                         |
| IT Support (internal) | Allowed                          | Denied                | Denied or Limited Override (TBD) | Denied           | Allowed                                      | Internal support role may inspect detailed logs; override behavior remains open question. |

Server-side enforcement is mandatory. UI hiding alone is not sufficient.

---

## **13. API / Event Contract**

| Contract             | Method / Event                             | Producer                      | Consumer               | Request / Payload                                                                                            | Response / Ack                                               | Error Codes                                                                    | Compatibility Notes                                                                    |
| -------------------- | ------------------------------------------ | ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Pre-send Validation  | `POST /api/wa/outbound/validate`           | FE / Worker                   | Anti-Ban Service       | tenantId, outboundSource, senderAccountId, recipientId, contentFingerprint, actorId, optional paste metadata | allow / delay / queue / block + reasonCode + cooldownSeconds | `DUPLICATE_SUPPRESSED`, `RISK_BLOCKED`, `ACCOUNT_INELIGIBLE`, `CONFIG_INVALID` | New endpoint or internal service contract; backward-compatible if optional in rollout. |
| Audit Log Query      | `GET /api/wa/outbound/anti-ban/logs`       | FE                            | Anti-Ban Service       | filters: time range, actor, sender, result, reasonCode                                                       | paginated log rows                                           | `FORBIDDEN`, `INVALID_FILTER`                                                  | Admin/Supervisor/Support scopes only.                                                  |
| Settings Update      | `PATCH /api/wa/outbound/anti-ban/settings` | FE                            | Anti-Ban Service       | antiBanMode, dedupeWindowSeconds, cooldown, thresholds                                                       | saved config summary                                         | `FORBIDDEN`, `VALIDATION_ERROR`                                                | Tenant-scoped config.                                                                  |
| Send Attempt Event   | `wa.outbound.validation.result`            | Anti-Ban Service              | Worker / Logging       | attemptId, decision, reasonCode, cooldown, lockInfo                                                          | ack optional                                                 | N/A                                                                            | Internal event name stable for observability.                                          |
| Account State Event  | `wa.sender.safe_mode.changed`              | Anti-Ban Service / WA Service | FE / Logging / Support | senderAccountId, oldState, newState, reasonCode, expiresAt                                                   | ack optional                                                 | N/A                                                                            | Must remain additive to avoid breaking consumers.                                      |
| Reconciliation Event | `wa.outbound.reconciliation.updated`       | Worker / Anti-Ban Service     | Logging / Support      | attemptId, previousStatus, newStatus, evidenceType                                                           | ack optional                                                 | N/A                                                                            | Used for uncertain timeout recovery.                                                   |

Unknown fields in internal payloads SHOULD be ignored by consumers unless explicitly marked required.

---

## **14. Migration & Rollout Plan**

| Area               | Plan                                                                                        | Owner                           | Validation                                                                   | Rollback                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Feature Flag       | Introduce tenant-scoped anti-ban flag with modes starting from `monitor_only`.              | Product / Engineering           | Validate logs appear without delivery block in staging and canary tenants.   | Disable flag or revert mode to `monitor_only`.                                              |
| Existing Send Flow | Wrap manual and broadcast send flows with pre-send validation contract behind feature flag. | Engineering                     | Smoke test manual send, broadcast send, and retry flow.                      | Bypass validation wrapper via flag disable.                                                 |
| Audit Store        | Add audit persistence and reason-code schema before strict enforcement.                     | Engineering                     | Verify log completeness for monitor-only mode.                               | Keep read path optional; disable write if severe issue and fallback to degraded alert mode. |
| Threshold Rollout  | Stage thresholds: monitor-only → warning-only → soft-block → strict by selected tenants.    | Product / Engineering           | Compare duplicate suppression, operator complaints, and false positive rate. | Revert one stage back or disable blocking actions.                                          |
| Support Workflow   | Enable read-only audit view for Admin/Supervisor/Support after logs stabilize.              | Product / Engineering / Support | Support can trace known test incidents end-to-end.                           | Hide view temporarily while preserving backend logging.                                     |

---

## **15. Data Lifecycle & Retention**

| Data                  | Owner                 | Created By                      | Retention                | Archive/Delete Policy                                                                              | Export Policy                                | Privacy Notes                                          |
| --------------------- | --------------------- | ------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Anti-ban audit log    | Engineering / Support | Anti-Ban Service                | 12 months minimum        | Archive or rotate per tenant-safe policy; no silent drop before retention                          | Export allowed for Admin/Support if approved | Mask recipient phone in UI exports where needed.       |
| Recipient fingerprint | Engineering           | Derived at validation time      | Same as audit log        | Stored as masked/hashed fingerprint                                                                | Export only in masked form                   | Do not expose raw customer number unnecessarily.       |
| Content fingerprint   | Engineering           | Derived from normalized content | Same as audit log        | Keep fingerprint only; avoid storing raw message unless already stored elsewhere by parent feature | Export allowed                               | No raw plain-text logging required for anti-ban logic. |
| Risk score snapshots  | Engineering           | Anti-Ban Service                | 90 days recommended      | Rotate by windowed retention                                                                       | Export optional                              | Internal operational data; not user-facing.            |
| Cooldown / lock state | Engineering           | Runtime state                   | TTL-based short-lived    | Auto-expire                                                                                        | Not exported                                 | Operational only.                                      |
| Reconciliation result | Engineering / Support | Worker / Anti-Ban Service       | Same as parent audit log | Persist final status and evidence type                                                             | Export allowed for support review            | Avoid leaking sensitive message content.               |

---

## **16. Analytics & Observability Plan**

| Signal               | Name                                       | Trigger                           | Properties                                                                 | Owner                 | Alert / Threshold                            |
| -------------------- | ------------------------------------------ | --------------------------------- | -------------------------------------------------------------------------- | --------------------- | -------------------------------------------- |
| Product Event        | `wa_anti_ban_warning_shown`                | Operator receives warning         | tenantId, outboundSource, reasonCode, actorRole                            | Product               | Monitor rising warning rate                  |
| Product Event        | `wa_anti_ban_send_blocked`                 | Send blocked by policy            | tenantId, outboundSource, reasonCode, actorRole                            | Product               | Alert if block rate spikes abnormally        |
| Log / Metric / Trace | `wa.outbound.duplicate.suppressed.count`   | Duplicate suppression occurs      | tenantId, senderAccountId, outboundSource                                  | Engineering           | Alert if sudden spike vs baseline            |
| Log / Metric / Trace | `wa.outbound.reconciliation.pending.count` | Unknown delivery state entered    | tenantId, outboundSource                                                   | Engineering           | Alert if pending count exceeds threshold     |
| Log / Metric / Trace | `wa.sender.safe_mode.entered.count`        | Sender account enters safe mode   | tenantId, senderAccountId, reasonCode                                      | Engineering           | Alert on repeated safe mode for same sender  |
| Log / Metric / Trace | `wa.operator.burst_risk.count`             | Burst risk threshold crossed      | tenantId, actorId, outboundSource                                          | Engineering           | Alert on sustained growth                    |
| Audit Event          | `wa.outbound.duplicate.suppressed`         | Duplicate attempt blocked         | actorId, senderAccountId, recipientFingerprint, attemptId, winnerAttemptId | Engineering / Support | No separate alert required                   |
| Audit Event          | `wa.outbound.risk.blocked`                 | Send blocked due to policy        | actorId, senderAccountId, recipientFingerprint, reasonCode, mode           | Engineering / Support | Investigate if high false positive suspected |
| Audit Event          | `wa.sender.safe_mode.entered`              | Sender state changes to safe mode | actorId/system, senderAccountId, reasonCode, expiresAt                     | Engineering / Support | Immediate support visibility                 |

Correlation ID / trace ID MUST be preserved across validation, lock, dispatch, retry, reconciliation, and audit write paths.

---

## **17. Concurrency, Rate Limit & Idempotency**

| Scenario                                     | Risk                                           | Required Behavior                                                          | Validation                                                        |
| -------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Double click on send button                  | Duplicate customer contact                     | UI disables repeated submit and server idempotency blocks duplicate effect | QA simulates two rapid clicks and verifies one send only          |
| Two browser tabs submit same message         | Parallel duplicate dispatch                    | Server-side idempotency detects equivalent request scope                   | QA submits from two tabs near-simultaneously                      |
| Two workers process same broadcast recipient | Race condition and duplicate delivery          | Recipient-level lock ensures one winner path                               | QA concurrency test with overlapping workers                      |
| Timeout after send dispatch                  | Blind resend of possibly successful message    | Move to `RECONCILIATION_PENDING` before any retry                          | QA injects post-dispatch timeout and verifies no duplicate resend |
| Burst operator manual sends                  | Restriction risk                               | Cooldown/throttle/queue based on mode                                      | QA triggers configured burst threshold                            |
| Sender account becomes restricted mid-run    | Unsafe continued sending                       | Stop new sends immediately; fallback only if allowed                       | QA simulates account restriction event during queue execution     |
| Stale lock after worker crash                | Permanent blocked recipient or unsafe recovery | TTL and recovery-safe re-evaluation before dispatch                        | QA crashes worker after lock acquisition                          |

---

## **18. Non-Functional Requirements**

| Category      | Requirement                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Performance   | Pre-send validation should complete in <= 100 ms p95 for normal outbound attempts excluding downstream WA dispatch latency. |
| Reliability   | Duplicate prevention and retry behavior MUST be idempotent for retryable outbound actions.                                  |
| Security      | Tenant isolation and server-side permission enforcement are mandatory for settings and log access.                          |
| Privacy       | Anti-ban logging SHOULD prefer masked recipient identity and content fingerprint instead of full raw content.               |
| Observability | Every critical anti-ban decision path MUST produce logs, metrics, and audit events with correlation ID.                     |
| Availability  | Anti-ban guard failure MUST degrade safely and MUST NOT create duplicate send amplification.                                |
| Accessibility | Operator warnings and admin settings must remain readable and keyboard-accessible where surfaced in UI.                     |
| Localization  | User-facing warning, delay, block, and state messages must use Bahasa Indonesia.                                            |

---

## **19. Dependencies & Risks**

| Dependency or Risk                                           | Owner                | Impact                                                         | Mitigation                                                                                     |
| ------------------------------------------------------------ | -------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Existing WhatsApp account eligibility / outbound limit logic | Engineering          | Anti-ban decisions may conflict if state models differ         | Reuse canonical account eligibility source and do not duplicate business logic inconsistently. |
| Retry semantics in worker implementation                     | Engineering          | Blind resend may still occur if worker bypasses reconciliation | Route all retry paths through anti-ban identity layer.                                         |
| FE ability to detect paste or compose timing                 | Engineering / Design | Operator behavior scoring may be too weak or too noisy         | Start with combined heuristics and keep monitor-only rollout first.                            |
| False positive blocks on legitimate high-volume operators    | Product / QA         | Operational friction and user complaints                       | Staged rollout, warning-only mode, threshold tuning, support review.                           |
| Missing audit persistence under failure                      | Engineering          | Support loses investigation trail                              | Add degraded-mode alert and canonical result persistence fallback.                             |
| Support role definition for internal users                   | Product / Support    | Access model may remain ambiguous                              | Treat as open question and enforce minimal read-only scope first.                              |

---

## **20. Success Metrics**

| KPI                               | Target                                                                       | Time Window | Data Source                          |
| --------------------------------- | ---------------------------------------------------------------------------- | ----------- | ------------------------------------ |
| Duplicate suppression correctness | 0 known duplicate deliveries from same logical send scope after full rollout | Weekly      | Support incident review + audit logs |
| Risk action coverage              | 100% of blocked/delayed/suppressed attempts have stable reason code          | Weekly      | Audit logs                           |
| Reconciliation safety             | 0 blind resend while `RECONCILIATION_PENDING`                                | Weekly      | Retry / reconciliation logs          |
| Sender safe mode reaction time    | <= 5 seconds from restriction signal to send-stop state                      | Weekly      | Account state events                 |
| False positive complaint rate     | < 5% of anti-ban warnings or blocks require support override                 | Monthly     | Support tickets + admin feedback     |

---

## **21. Future Considerations**

| Topic                          | Why It Matters Later                                                           |
| ------------------------------ | ------------------------------------------------------------------------------ |
| Separate TLC policy profile    | Some operator groups may need custom thresholds without affecting all tenants. |
| ML-assisted risk scoring       | May reduce false positives once labeled operational data is sufficient.        |
| Per-template anti-ban profiles | Different outbound use cases may require different dedupe or burst thresholds. |
| Cross-account fleet risk score | Useful if one tenant’s whole sender pool begins showing unhealthy patterns.    |

---

## **22. Limitations**

| Limitation                                                                                                                    | Impact                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| This PRD relies on heuristic risk signals, not perfect certainty.                                                             | Some false positives or false negatives may still occur and must be monitored.      |
| Exact TLC role mapping is not yet formally defined in this draft.                                                             | Final RBAC and policy scope may need adjustment before implementation.              |
| Restriction/banned detection source is assumed to be available from existing sender/account health signals.                   | If signal quality is weak, safe-mode behavior may need additional engineering work. |
| This feature protects outbound behavior but does not replace existing warming, humanization, or account rotation initiatives. | Overall anti-spam posture still depends on related WhatsApp Web capabilities.       |

---

## **23. Appendix**

| Item           | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Glossary       | **Idempotency key**: stable identity for one logical send attempt. **Dedupe window**: time range where equivalent requests are treated as duplicates. **Reconciliation**: verification flow for unknown post-dispatch status. **Safe mode**: sender state that blocks or downgrades new sends after risk or restriction signals.                                                                                                                                                     |
| UI Labels      | “Pesan serupa sudah sedang diproses.”, “Aktivitas pengiriman terlalu cepat. Coba beberapa saat lagi.”, “Pengiriman dibatasi sementara. Tunggu hingga cooldown selesai.”, “Akun pengirim dibatasi. Pengiriman dihentikan sementara.”, “Status pengiriman sedang diverifikasi.”                                                                                                                                                                                                        |
| Assumptions    | Phase 1 covers both broadcast and manual WhatsApp outbound. TLC users are high-volume operators whose behavior may need protection policy. Existing outbound limit and account eligibility are treated as canonical dependencies.                                                                                                                                                                                                                                                    |
| Open Questions | Whether IT Support may receive limited override capability; final dedupe normalization policy; final threshold defaults for paste-heavy and burst behavior; whether partial safe-mode fallback can automatically switch sender in all manual room cases; whether Phase 1 applies to text-only outbound or also media / attachment / template sends; and what precedence rule applies when manual room send and broadcast send collide on the same recipient at nearly the same time. |
| References     | `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (1).md`, `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (2).md`, `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (3).md`, `PRD/Whatsapp web v2/PRD WA Web Anti Spam System (4).md`, `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`                                                                                                                                                                      |
