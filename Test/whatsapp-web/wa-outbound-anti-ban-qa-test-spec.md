# QA Test Specification - WhatsApp Web Outbound Anti-Ban Guard

> **Artifact Type:** QA Test Specification  
> **Source PRD:** `PRD/Whatsapp web v2/PRD WA Web Outbound Anti-Ban Guard.md`  
> **Artifact Path:** `Test/whatsapp-web/wa-outbound-anti-ban-qa-test-spec.md`  
> **Companion Artifact:** `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md`  
> **Version:** `v1.3`  
> **Status:** Reviewed — synchronized to PRD v0.3 with permission-based log access and no tenant-facing anti-ban settings page

---
## 1. Overview

| Item | Description |
| ----- | ----- |
| Feature | WhatsApp Web Outbound Anti-Ban Guard |
| Source PRD | `PRD/Whatsapp web v2/PRD WA Web Outbound Anti-Ban Guard.md` |
| Source Analysis | Session analysis 2026-06-10 + incident input from IT Support |
| Scope | Duplicate prevention, recipient lock, retry/reconciliation, exact-text manual resend guard against active/recent system-managed broadcast, cooldown/queue/block policy, sender safe mode, duplicate broadcast traceability, audit logging, settings, permissions, and regression around existing outbound eligibility logic |
| Non-Scope | AI content rewriting, warming redesign, billing redesign, non-WhatsApp channels, fuzzy semantic similarity detection, non-text outbound handling, ML anti-fraud classifier |

---

## 2. Requirement Coverage Matrix

| Req ID | Requirement Summary | Analysis Finding / Risk | Test Case IDs | Coverage Status |
| ----- | ----- | ----- | ----- | ----- |
| FR-001 - FR-004 | Idempotency key, dedupe window, manual + broadcast scope, winner reference | Duplicate send is a primary ban trigger | TC-WA-ABG-001, TC-WA-ABG-002, TC-WA-ABG-003 | Covered |
| FR-005 - FR-007 | Recipient lock, collision handling, stale lock TTL | Multi-worker collision can create duplicate delivery | TC-WA-ABG-004, TC-WA-ABG-017 | Covered |
| FR-008 - FR-011 | Retry identity, reconciliation pending, confirm sent/failed linkage | Blind resend after timeout is critical risk | TC-WA-ABG-005, TC-WA-ABG-006, TC-WA-ABG-007 | Covered |
| FR-012 - FR-013 | UI submit disable and server duplicate protection | Double click / bypass risk | TC-WA-ABG-001, TC-WA-ABG-002 | Covered |
| FR-014 - FR-016 | Exact-text protected resend detection, text-only scope, related broadcast linkage | Users bypass SOP by manually resending broadcast text from conversation room | TC-WA-ABG-008, TC-WA-ABG-009, TC-WA-ABG-010 | Covered |
| FR-017 - FR-020 | Enforcement modes, action mapping, cooldown, resend-window policy | Policy rollout and false-positive control needed | TC-WA-ABG-008, TC-WA-ABG-009, TC-WA-ABG-010, TC-WA-ABG-015 | Covered |
| FR-021 - FR-023 | Safe mode, account eligibility integration, sender stickiness/failover | Sender health must stop unsafe outbound | TC-WA-ABG-012, TC-WA-ABG-013, TC-WA-ABG-019, TC-WA-ABG-020 | Covered |
| FR-024 - FR-025 | Correlation ID, dispatch source, attempt lineage, duplicate investigation traceability | Duplicate incidents must be traceable before root cause is assumed | TC-WA-ABG-016, TC-WA-ABG-022 | Covered |
| FR-026 - FR-028 | Reason codes and audit visibility | Support must trace root cause quickly | TC-WA-ABG-016, TC-WA-ABG-022 | Covered |
| FR-029 - FR-030 | Tenant settings and invalid-config fallback | Misconfiguration must fail safe | TC-WA-ABG-014 | Covered |
| FR-031 - FR-033 | No score leakage, no weakening existing protections, no silent drops | Security / operational trust risk | TC-WA-ABG-011, TC-WA-ABG-013, TC-WA-ABG-016 | Covered |
| EH-001 - EH-003 | Duplicate, lock conflict, reconciliation pending | Core duplicate prevention failure modes | TC-WA-ABG-001, TC-WA-ABG-004, TC-WA-ABG-005 | Covered |
| EH-004 - EH-005 | Protected resend handling and active resend cooldown | Manual resend while system broadcast still active | TC-WA-ABG-008, TC-WA-ABG-009, TC-WA-ABG-010 | Covered |
| EH-006 - EH-007 | Sender restricted / outbound limit ineligible | Sender health and quota protection | TC-WA-ABG-012, TC-WA-ABG-013 | Covered |
| EH-008 - EH-010 | Stale lock, invalid config, audit persistence degradation | Recovery and fail-safe behavior | TC-WA-ABG-014, TC-WA-ABG-017 | Covered |
| EC-001 - EC-003 | Double click, dual tabs, overlap audience | High-probability duplicate vectors | TC-WA-ABG-001, TC-WA-ABG-002, TC-WA-ABG-003 | Covered |
| EC-004 - EC-005 | Timeout after dispatch, normalized equivalent content | Duplicate ambiguity and normalization logic | TC-WA-ABG-005, TC-WA-ABG-006 | Covered |
| EC-006 - EC-007 | Exact same text while broadcast queued vs outside protection window | Queue/allow boundary must be deterministic | TC-WA-ABG-008, TC-WA-ABG-010, TC-WA-ABG-011 | Covered |
| EC-008 - EC-010 | Worker crash, failover need, monitor-only mode | Recovery and safe rollout | TC-WA-ABG-017, TC-WA-ABG-020, TC-WA-ABG-015 | Covered |
| EC-011 - EC-012 | Manual/broadcast collision, audit write failure after send success | Collision safety and observability gap | TC-WA-ABG-004, TC-WA-ABG-016, TC-WA-ABG-017 | Covered |
| NFR-Performance | Pre-send validation <= 100 ms p95 excluding WA dispatch latency | Added safety checks must not degrade UX excessively | TC-WA-ABG-021 | Covered |
| NFR-Reliability / Availability | Idempotent behavior and safe degradation | Must never amplify duplicate sends on failure | TC-WA-ABG-005, TC-WA-ABG-017, TC-WA-ABG-022 | Covered |
| NFR-Security / Privacy / Localization | Tenant isolation, masked identity, Bahasa messages | Support visibility and operator UX must stay safe | TC-WA-ABG-016, TC-WA-ABG-023, TC-WA-ABG-024 | Covered |

---

## 3. Test Strategy

| Test Type | Scope | Priority | Environment | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Smoke | One-send-one-delivery, protected manual resend handling, restricted sender stop, audit/trace event creation | P0 | Staging | Must pass before any canary rollout |
| Functional | Dedupe, lock, reconciliation, resend guard, cooldown/queue policy, settings, audit view, sender state transitions | P0 / P1 | Staging | Covers core Phase 1 behavior |
| Regression | Existing manual send, broadcast dispatch, sender eligibility, outbound limit, sender stickiness | P0 / P1 | Staging | Ensure anti-ban guard does not break normal outbound |
| Integration | FE submit -> validation API -> worker -> audit log; sender health event -> safe mode; reconciliation updates | P0 / P1 | Staging / Integration env | Use mocks where external WA uncertainty is needed |
| UAT | Admin policy configuration, operator warning UX, support incident investigation | P1 | UAT / Staging | Validate product wording and workflow acceptance |
| Performance | Validation latency, lock contention, audit write under resend-collision load | P1 | Staging perf env | Use synthetic load |
| Security / RBAC | Settings access, log access, score visibility restrictions | P1 | Staging | Server-side enforcement required |

---

## 4. Test Data & Environment

| Data / Environment | Value | Setup | Cleanup | Owner |
| ----- | ----- | ----- | ----- | ----- |
| Tenant A | `tenant_wa_abg_test` | Create dedicated staging tenant with anti-ban feature enabled | Keep for regression suite | QA / Engineering |
| Operator account | `op_tlc_01` | Role with outbound permission | Reset cooldown / resend window state after suite | QA |
| Authorized log viewer account | `log_viewer_01` | Internal user explicitly granted anti-ban log access permission | None | QA |
| Admin account | `admin_wa_01` | Full settings + audit log access | None | QA |
| Sender account S1 | Connected, eligible, normal state | Configure WA sender with sufficient outbound allowance | Reset counters if mutated | Engineering / QA |
| Sender account S2 | Connected, backup / alternate sender | Configure failover candidate | Reset safe mode state | Engineering / QA |
| Recipient R1 | `+628111000001` | Existing WhatsApp conversation/contact | Clear test messages if needed | QA |
| Recipient R2 | `+628111000002` | Existing WhatsApp conversation/contact | Clear test messages if needed | QA |
| Broadcast text A | `Halo Kak, ini pesan broadcast uji anti-ban.` | Prepare exact normalized text used by broadcast and manual resend cases | None | QA |
| Manual safe text B | `Halo Kak, saya follow up manual yang tidak terkait broadcast.` | Prepare non-colliding manual text for safe-path validation | None | QA |
| Broadcast reference BR-01 | `broadcast-job-20260611-001` | Prepare active or recent system-managed broadcast reference for resend guard cases | None | Engineering / QA |
| Cooldown config | 30 seconds | Set through internal config / feature flag / backend policy fixture | Restore default after suite | QA |
| Dedupe window | 120 seconds | Set through internal config / feature flag / backend policy fixture | Restore default after suite | QA |
| Monitor-only profile | `monitor_only` | Configurable per tenant | Restore prior mode | QA |
| Strict profile | `strict` | Configurable per tenant | Restore prior mode | QA |
| Log capture | API / DB / UI log access | Prepare audit query access and correlation-id tracing | Archive evidence | Engineering / QA |

---

## 5. Test Suites

| Suite ID | Suite Name | Purpose | Test Case IDs | Execution Trigger |
| ----- | ----- | ----- | ----- | ----- |
| TS-001 | Duplicate Prevention Smoke | Validate no duplicate effect in common duplicate vectors | TC-WA-ABG-001, TC-WA-ABG-002, TC-WA-ABG-003 | Every RC / canary |
| TS-002 | Locking and Retry Safety | Validate concurrency, lock TTL, reconciliation, and retry behavior | TC-WA-ABG-004, TC-WA-ABG-005, TC-WA-ABG-006, TC-WA-ABG-007, TC-WA-ABG-017 | Every backend change |
| TS-003 | Manual Resend Guard | Validate protected manual resend detection and enforcement modes | TC-WA-ABG-008, TC-WA-ABG-009, TC-WA-ABG-010, TC-WA-ABG-011, TC-WA-ABG-015 | Every FE/Policy change |
| TS-004 | Sender Health Protection | Validate safe mode, ineligible sender, sender stickiness, failover boundaries | TC-WA-ABG-012, TC-WA-ABG-013, TC-WA-ABG-019, TC-WA-ABG-020 | Every sender/account logic change |
| TS-005 | Observability and Internal Config | Validate audit logs, internal policy config, privacy, localized UX, and tenant isolation | TC-WA-ABG-014, TC-WA-ABG-016, TC-WA-ABG-023, TC-WA-ABG-024 | Every config/logging change |
| TS-006 | Traceability and Performance | Validate duplicate-investigation state resolution, validation latency, and degraded observability behavior | TC-WA-ABG-018, TC-WA-ABG-021, TC-WA-ABG-022 | Pre-release non-functional check |

### 5A. Initial Test Scenario List

| Scenario ID | User Goal / Flow | Requirement ID | Priority | Expected Outcome |
| ----- | ----- | ----- | ----- | ----- |
| SCN-001 | Send one manual message with accidental double click | FR-001, FR-002, FR-012, EH-001 | P0 | Only one logical send succeeds |
| SCN-002 | Submit same manual message from two tabs | FR-002, FR-013, EC-002 | P0 | One winner, one duplicate-safe response |
| SCN-003 | Broadcast includes overlapping audience recipient | FR-002, FR-003, EC-003 | P0 | Recipient receives one send chain only |
| SCN-004 | Two workers target same recipient concurrently | FR-005, FR-006, EH-002 | P0 | One lock winner only |
| SCN-005 | Timeout occurs after dispatch | FR-008, FR-009, EH-003, EC-004 | P0 | Attempt enters reconciliation pending, no blind resend |
| SCN-006 | Reconciliation confirms original send succeeded | FR-010, FR-011 | P0 | Final state is sent, duplicate resend absent |
| SCN-007 | Operator manually resends exact same broadcast text while related broadcast is still active in warning-only mode | FR-014, FR-017, FR-018 | P0 | Warning/delay follows policy and related broadcast reference is preserved |
| SCN-008 | Cooldown active and operator retries protected resend repeatedly | FR-019, EH-005 | P0 | Sends remain blocked or queued until cooldown expires and re-evaluation occurs |
| SCN-009 | Sender account becomes restricted mid-run | FR-021, EH-006 | P0 | New sends stop immediately |
| SCN-010 | Sender becomes ineligible because outbound limit exceeded | FR-022, EH-007 | P1 | Account not used for new send |
| SCN-011 | Engineering enables monitor-only mode for protected resend cases | FR-017, FR-029 | P1 | Events logged, no blocks |
| SCN-012 | Support investigates duplicate-suspected or blocked protected resend event | FR-024, FR-025, FR-026, FR-027, FR-028 | P1 | Complete reason-code audit trail and dispatch lineage available |
| SCN-013 | Worker crash leaves stale lock | FR-007, EH-008, EC-008 | P1 | Lock recovers safely |
| SCN-014 | Duplicate-suspected incident is reviewed and resolved to confirmed system duplicate or confirmed manual resend | FR-024, FR-025 | P1 | Investigation status changes are traceable and linked to evidence |
| SCN-015 | Sender stickiness on healthy active conversation | FR-023 | P1 | Same sender remains used |
| SCN-016 | Failover needed because sender becomes ineligible | FR-021, FR-023, EC-009 | P1 | Sender changes only under allowed failover |
| SCN-017 | Unauthorized or foreign-tenant user attempts to read anti-ban logs | NFR-Security / Tenant Isolation | P1 | Cross-tenant access is blocked and no foreign data is exposed |

---

## 6. Detailed Test Cases

### TC-WA-ABG-001

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-001 |
| Feature | Manual Duplicate Submit Protection |
| Source Req ID | FR-001, FR-002, FR-012, FR-013, EH-001, EC-001 |
| Analysis Finding ID | Incident-01 Duplicate manual send |
| Level | E2E |
| Type | Positive / Regression |
| Priority | P0 |
| Precondition | Operator `op_tlc_01` is logged in. Sender account S1 is connected and eligible. Conversation with R1 is open. Dedupe window is active. |
| Test Data | Message text: `Halo Kak, ini pesan uji anti-ban.` |
| Steps | 1. Open conversation room for R1. 2. Paste the message into the composer. 3. Click Send twice within 500 ms. 4. Observe UI state of the send button. 5. Check conversation timeline. 6. Query outbound audit logs for the correlation window. |
| Expected Result | Send button becomes disabled/loading after the first click. Only one message is sent to R1. A second logical attempt is either not created or is stored as suppressed duplicate with reason code `DUPLICATE_SUPPRESSED`. |
| Postcondition | Clear test message if environment requires cleanup. |
| Automation Status | Ready |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js |

### TC-WA-ABG-002

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-002 |
| Feature | Cross-Tab Duplicate Prevention |
| Source Req ID | FR-002, FR-013, EC-002 |
| Analysis Finding ID | Incident-02 Same actor duplicate via parallel client |
| Level | E2E |
| Type | Edge / Regression |
| Priority | P0 |
| Precondition | Same operator account logged in from two browser tabs in the same tenant. Sender account S1 is healthy. |
| Test Data | Message text: `Halo Kak, ini pesan uji anti-ban.` |
| Steps | 1. Open the same conversation with R1 in Tab A and Tab B. 2. Enter the exact same message in both tabs. 3. Click Send in Tab A and Tab B within 1 second. 4. Refresh the conversation. 5. Check outbound logs. |
| Expected Result | Only one logical send reaches R1. The other request resolves as duplicate-safe result and does not create a second delivery. Audit trail links the losing attempt to the winning attempt where implemented. |
| Postcondition | None |
| Automation Status | Ready |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js |

### TC-WA-ABG-003

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-003 |
| Feature | Broadcast Recipient Overlap Dedupe |
| Source Req ID | FR-002, FR-003, EC-003 |
| Analysis Finding ID | Incident-03 Same recipient in overlapping audience |
| Level | Integration / E2E |
| Type | Edge |
| Priority | P0 |
| Precondition | Broadcast module can target audience segments with overlapping recipient membership. Recipient R1 exists in Segment A and Segment B. |
| Test Data | Campaign message `Promo test anti-ban overlap` |
| Steps | 1. Create a broadcast campaign containing Segment A and Segment B where R1 appears in both. 2. Start campaign with sender account S1. 3. Observe per-recipient dispatch records and final delivery count for R1. |
| Expected Result | R1 receives one logical broadcast chain only. Audit logs show one winner attempt for R1 within the campaign scope. |
| Postcondition | Cancel or complete campaign cleanup as needed. |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-broadcast.spec.js |

### TC-WA-ABG-004

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-004 |
| Feature | Recipient-Level Locking |
| Source Req ID | FR-005, FR-006, EH-002, EC-011 |
| Analysis Finding ID | Risk-01 Multi-worker same recipient collision |
| Level | Integration |
| Type | Concurrency |
| Priority | P0 |
| Precondition | Test harness can trigger two worker processes against the same recipient/context. |
| Test Data | Same sender S1, same recipient R1, same content fingerprint, same scope id |
| Steps | 1. Trigger Worker A and Worker B to process the same logical outbound attempt at nearly the same time. 2. Capture lock acquisition outcomes. 3. Check resulting dispatch actions and audit logs. |
| Expected Result | Exactly one worker acquires the recipient lock and continues dispatch. The other worker backs off or resolves as duplicate/lock conflict. Only one delivery occurs. |
| Postcondition | Release any synthetic lock state. |
| Automation Status | Manual Only |
| Automation ID | N/A - backend worker / integration harness |

### TC-WA-ABG-005

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-005 |
| Feature | Reconciliation Pending on Unknown Status |
| Source Req ID | FR-008, FR-009, EH-003, EC-004 |
| Analysis Finding ID | Risk-02 Blind resend after timeout |
| Level | Integration |
| Type | Negative / Recovery |
| Priority | P0 |
| Precondition | Worker test mode can simulate timeout after dispatch but before final local status persistence. |
| Test Data | One outbound send to R1 with induced post-dispatch timeout |
| Steps | 1. Start outbound send to R1. 2. Force timeout immediately after downstream dispatch is attempted. 3. Observe stored attempt status. 4. Trigger retry scheduler. |
| Expected Result | Attempt status becomes `RECONCILIATION_PENDING`. Retry scheduler does not send another message blindly while the attempt remains unresolved. |
| Postcondition | Resolve synthetic timeout flags. |
| Automation Status | Manual Only |
| Automation ID | N/A - backend reconciliation harness |

### TC-WA-ABG-006

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-006 |
| Feature | Reconciliation Confirms Sent |
| Source Req ID | FR-010, FR-011 |
| Analysis Finding ID | Risk-03 Unknown status resolved as already sent |
| Level | Integration |
| Type | Recovery |
| Priority | P0 |
| Precondition | Existing attempt is in `RECONCILIATION_PENDING`. Reconciliation evidence can confirm original send success. |
| Test Data | Pending attempt id `attempt_pending_sent_01` |
| Steps | 1. Load a pending attempt. 2. Run reconciliation using proof that downstream send succeeded. 3. Observe final status and retry linkage. |
| Expected Result | Final status becomes `SENT`. No duplicate resend occurs. Attempt history keeps original attempt and reconciliation confirmation linked. |
| Postcondition | None |
| Automation Status | Manual Only |
| Automation ID | N/A - backend reconciliation harness |

### TC-WA-ABG-007

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-007 |
| Feature | Reconciliation Confirms Failure |
| Source Req ID | FR-010, FR-011 |
| Analysis Finding ID | Risk-04 Unknown status resolved as failed |
| Level | Integration |
| Type | Recovery |
| Priority | P0 |
| Precondition | Existing attempt is in `RECONCILIATION_PENDING`. Reconciliation evidence can confirm no successful downstream delivery. |
| Test Data | Pending attempt id `attempt_pending_fail_01` |
| Steps | 1. Load a pending attempt. 2. Run reconciliation with failure evidence. 3. Observe final status and retry chain. |
| Expected Result | Attempt resolves to `CONFIRMED_FAILED` or mapped final failure state per implementation. Retry behavior remains linked to the original logical send identity without duplicate-effect ambiguity. |
| Postcondition | None |
| Automation Status | Manual Only |
| Automation ID | N/A - backend reconciliation harness |

### TC-WA-ABG-008

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-008 |
| Feature | Protected Manual Resend Warning Mode |
| Source Req ID | FR-014, FR-015, FR-017, FR-018, EH-004, EC-006 |
| Analysis Finding ID | Incident-04 User bypasses SOP with manual resend while broadcast still active |
| Level | UI / E2E |
| Type | Negative |
| Priority | P0 |
| Precondition | Anti-ban mode is `warning_only`. Broadcast reference BR-01 is active or recent for recipient R1. |
| Test Data | System broadcast text `Halo Kak, ini pesan broadcast uji anti-ban.` linked to BR-01 |
| Steps | 1. Set tenant anti-ban mode to warning-only. 2. Ensure broadcast BR-01 is active or recent for R1 with the exact text above. 3. Open conversation room for R1. 4. Paste and send the exact same text manually. 5. Observe operator-facing warning and audit logs. |
| Expected Result | System detects protected manual resend, shows warning, and records `MANUAL_BROADCAST_RESEND_WARNING` with related broadcast reference BR-01. No internal formula is shown to operator. |
| Postcondition | Reset cooldown / resend window state if needed. |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js |

### TC-WA-ABG-009

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-009 |
| Feature | Protected Manual Resend Block in Strict Mode |
| Source Req ID | FR-014, FR-015, FR-017, FR-018, EH-004, EC-006 |
| Analysis Finding ID | Incident-05 Strict policy block for exact same broadcast text |
| Level | UI / E2E |
| Type | Negative |
| Priority | P0 |
| Precondition | Anti-ban mode is `strict`. Broadcast reference BR-01 is active or recent for recipient R1. |
| Test Data | System broadcast text `Halo Kak, ini pesan broadcast uji anti-ban.` linked to BR-01 |
| Steps | 1. Set tenant anti-ban mode to strict. 2. Ensure broadcast BR-01 is active or recent for R1 with the exact text above. 3. Attempt to send the exact same text manually from conversation room. 4. Check logs. |
| Expected Result | Manual resend is blocked or queued according to strict policy. User sees Bahasa Indonesia protected-resend block message. Audit log stores `MANUAL_BROADCAST_RESEND_BLOCKED` with related broadcast reference BR-01. |
| Postcondition | Reset anti-ban mode after test. |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js |

### TC-WA-ABG-010

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-010 |
| Feature | Protected Resend Cooldown and Re-Evaluation |
| Source Req ID | FR-018, FR-019, FR-020, EH-005, EC-007 |
| Analysis Finding ID | Risk-05 Operator retries while protected resend cooldown is active |
| Level | E2E |
| Type | Negative |
| Priority | P0 |
| Precondition | Operator has already triggered protected resend cooldown through a prior manual resend against active broadcast BR-01. |
| Test Data | Cooldown duration = 30 seconds |
| Steps | 1. Trigger protected resend condition until cooldown activates. 2. Immediately attempt the same manual resend again. 3. Attempt again before cooldown expires. 4. Allow cooldown to expire or queued turn to be reached. 5. Re-evaluate the same manual resend after the related broadcast is no longer active or recent. |
| Expected Result | Sends attempted during cooldown are blocked or held with cooldown message. After cooldown expiry, the request is re-evaluated before dispatch. If the related broadcast is no longer within the protection window, the send may proceed as a normal manual send. |
| Postcondition | Wait for cooldown to expire or reset state. |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js |

### TC-WA-ABG-011

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-011 |
| Feature | Safe Normal Manual Send Outside Protected Resend Condition |
| Source Req ID | FR-015, FR-016, FR-031, FR-033, EC-007 |
| Analysis Finding ID | Risk-06 False positive block outside protected scope |
| Level | E2E |
| Type | Positive / Regression |
| Priority | P1 |
| Precondition | There is no active or recent protected broadcast for the selected recipient/text combination. |
| Test Data | Manual safe text B sent once to R1 |
| Steps | 1. Open conversation room for R1. 2. Enter manual safe text B. 3. Send once. 4. Observe UI. 5. Review audit result if any. |
| Expected Result | Message is sent with no unnecessary protected-resend warning or block. Operator does not see internal numeric formula or sensitive implementation detail. |
| Postcondition | None |
| Automation Status | Ready |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js |

### TC-WA-ABG-012

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-012 |
| Feature | Sender Safe Mode on Restriction |
| Source Req ID | FR-021, EH-006 |
| Analysis Finding ID | Risk-07 Restricted sender continues sending |
| Level | Integration / E2E |
| Type | Negative / Regression |
| Priority | P0 |
| Precondition | Queue is actively sending through sender account S1. Restriction signal can be simulated. |
| Test Data | Sender account state change to restricted or safe mode |
| Steps | 1. Start a small outbound queue using S1. 2. During queue execution, emit sender restriction/safe-mode signal. 3. Observe queue handling and new send attempts. |
| Expected Result | New sends from S1 stop within expected reaction window. Audit logs capture `ACCOUNT_SAFE_MODE` or restriction event. |
| Postcondition | Restore sender state to normal after test. |
| Automation Status | Manual Only |
| Automation ID | N/A - sender-state event / backend harness |

### TC-WA-ABG-013

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-013 |
| Feature | Sender Ineligibility by Outbound Limit |
| Source Req ID | FR-021, FR-022, EH-007 |
| Analysis Finding ID | Risk-08 Ineligible sender still selected |
| Level | Integration |
| Type | Negative / Regression |
| Priority | P1 |
| Precondition | Sender account S1 has outbound count at or above configured eligibility policy. |
| Test Data | S1 marked over outbound threshold |
| Steps | 1. Set S1 outbound usage above allowed threshold. 2. Attempt manual send and broadcast send that would normally pick S1. 3. Observe selection and result. |
| Expected Result | S1 is not used for new outbound attempts. Send either fails with ineligible message or falls back according to existing sender-selection policy. Existing outbound-limit protections remain intact. |
| Postcondition | Restore outbound counters. |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-account-guard.spec.js |

### TC-WA-ABG-014

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-014 |
| Feature | Internal Config Validation and Safe Fallback |
| Source Req ID | FR-029, FR-030 |
| Analysis Finding ID | Risk-09 Invalid policy config |
| Level | API / Integration |
| Type | Negative / Config |
| Priority | P1 |
| Precondition | Internal config / feature-flag update path is available. |
| Test Data | Invalid config examples: `dedupeWindowSeconds = 0`, `antiBanMode = unsupported_value` |
| Steps | 1. Prepare invalid internal anti-ban config through backend fixture, internal config path, or feature-flag payload. 2. Load the config into the runtime path or validation service. 3. Observe validation outcome and fallback behavior. 4. Check observability alert or diagnostic log. |
| Expected Result | Invalid internal config is rejected or safely normalized by backend. If invalid config is loaded at runtime, system falls back to safe default profile and raises observability alert. |
| Postcondition | Restore valid backend policy configuration. |
| Automation Status | Ready |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-settings.spec.js |

### TC-WA-ABG-015

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-015 |
| Feature | Monitor-Only Mode |
| Source Req ID | FR-017, FR-029, EC-010 |
| Analysis Finding ID | Rollout-01 Safe staged rollout |
| Level | Integration / E2E |
| Type | Config / Regression |
| Priority | P1 |
| Precondition | Backend anti-ban policy mode is `monitor_only`. |
| Test Data | Protected manual resend sequence that would normally trigger warning/block in stricter modes |
| Steps | 1. Set backend anti-ban policy mode to monitor-only. 2. Ensure an active or recent broadcast exists for R1. 3. Attempt exact same manual resend from conversation room. 4. Observe send outcome. 5. Check audit logs and metrics. |
| Expected Result | Send is not blocked solely because of monitor-only mode. Protected resend event is still logged with reason code and related broadcast reference. |
| Postcondition | Restore previous anti-ban mode. |
| Automation Status | Ready |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-settings.spec.js |

### TC-WA-ABG-016

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-016 |
| Feature | Audit Log Visibility, Dispatch Lineage, and Privacy |
| Source Req ID | FR-024, FR-025, FR-026, FR-027, FR-028, EH-011, NFR-Security / Privacy / Localization |
| Analysis Finding ID | Support-01 Need support-grade reason codes and traceability |
| Level | UI / API |
| Type | Observability / Security |
| Priority | P1 |
| Precondition | Duplicate suppression and block events already exist in the log. Admin, authorized log viewer, IT Support, and Operator accounts are available. |
| Test Data | Events with reason codes `DUPLICATE_SUPPRESSED`, `MANUAL_BROADCAST_RESEND_BLOCKED`, `DUPLICATE_BROADCAST_SUSPECTED`, `ACCOUNT_SAFE_MODE` |
| Steps | 1. Open audit log as Admin and verify visible fields. 2. Open audit log as authorized log viewer and verify read-only access. 3. Open audit log as IT Support and inspect detail view. 4. Attempt to open log as Operator. 5. Review masked recipient, content fingerprint, dispatch source, correlation ID, and related broadcast reference display. 6. Verify Bahasa Indonesia wording in user-facing states. |
| Expected Result | Admin, authorized log viewer, and IT Support can view permitted log fields through supported dashboard surfaces. Operator cannot access internal audit log. Recipient identity is masked where applicable. Reason codes, dispatch source, correlation ID, and related broadcast reference are visible to permitted log viewers where applicable. Internal numeric formula is never exposed to operator. |
| Postcondition | None |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/rbac/wa-outbound-anti-ban-rbac.spec.js |

### TC-WA-ABG-017

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-017 |
| Feature | Stale Lock Recovery |
| Source Req ID | FR-007, EH-008, EC-008 |
| Analysis Finding ID | Risk-10 Worker crash leaves lock |
| Level | Integration |
| Type | Recovery / Edge |
| Priority | P1 |
| Precondition | Worker test harness can crash after lock acquisition and before dispatch completion. |
| Test Data | Synthetic lock with TTL enabled |
| Steps | 1. Acquire recipient lock for an outbound attempt. 2. Crash the worker before normal completion. 3. Wait for lock TTL or invoke recovery job. 4. Re-submit the same logical outbound attempt. |
| Expected Result | Lock is recovered safely. Subsequent evaluation does not create duplicate send amplification. Attempt either resumes safely or restarts through normal validation path. |
| Postcondition | Clear recovered lock artifacts. |
| Automation Status | Manual Only |
| Automation ID | N/A - worker crash / TTL recovery harness |

### TC-WA-ABG-018

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-018 |
| Feature | Duplicate Investigation Resolution States |
| Source Req ID | FR-024, FR-025 |
| Analysis Finding ID | Risk-11 Duplicate-suspected incident must be resolved with evidence |
| Level | Integration |
| Type | Observability / State |
| Priority | P1 |
| Precondition | A duplicate-suspected broadcast incident exists with correlation ID, dispatch source, and linked attempt lineage in the audit/trace store. |
| Test Data | One incident later proven as system duplicate and one incident later proven as manual resend |
| Steps | 1. Load a duplicate-suspected incident in the investigation view or backend harness. 2. Attach evidence confirming system-managed duplicate for Incident A. 3. Observe updated investigation status and linked attempts. 4. Repeat with evidence confirming manual resend for Incident B. |
| Expected Result | Incident A moves from `DUPLICATE_BROADCAST_SUSPECTED` to `CONFIRMED_SYSTEM_DUPLICATE`. Incident B moves from `DUPLICATE_BROADCAST_SUSPECTED` to `CONFIRMED_MANUAL_RESEND`. Both outcomes preserve correlation ID, dispatch source, related broadcast reference, and linked evidence. |
| Postcondition | Clear synthetic investigation records if environment requires cleanup. |
| Automation Status | Manual Only |
| Automation ID | N/A - backend investigation / trace review harness |

### TC-WA-ABG-019

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-019 |
| Feature | Sender Stickiness in Healthy Session |
| Source Req ID | FR-023 |
| Analysis Finding ID | Regression-01 Sender should stay stable |
| Level | E2E |
| Type | Regression |
| Priority | P1 |
| Precondition | Active conversation session with R1 already established using sender S1. S1 remains healthy and eligible. |
| Test Data | 3 sequential outbound replies in same session |
| Steps | 1. Send first message using S1. 2. Send two follow-up replies in the same active session. 3. Inspect sender attribution for each reply. |
| Expected Result | All replies continue using S1 while S1 remains eligible. Anti-ban guard does not force unnecessary sender change. |
| Postcondition | None |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-account-guard.spec.js |

### TC-WA-ABG-020

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-020 |
| Feature | Sender Failover Only on Ineligibility |
| Source Req ID | FR-021, FR-023, EC-009 |
| Analysis Finding ID | Regression-02 Failover boundary |
| Level | Integration / E2E |
| Type | Edge / Regression |
| Priority | P1 |
| Precondition | Active conversation session exists. S1 starts healthy. Alternate sender S2 is available if failover is allowed by existing policy. |
| Test Data | Simulated ineligibility of S1 during active session |
| Steps | 1. Begin session using S1. 2. Mark S1 ineligible or restricted. 3. Attempt next outbound reply. 4. Inspect sender selection and audit log. |
| Expected Result | Sender changes only after S1 becomes ineligible and only according to approved failover logic. Audit log records the reason for sender change. |
| Postcondition | Restore sender states. |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/conversation/wa-outbound-anti-ban-account-guard.spec.js |

### TC-WA-ABG-021

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-021 |
| Feature | Pre-Send Validation Performance |
| Source Req ID | NFR-Performance |
| Analysis Finding ID | NFR-01 Added safety checks must stay fast |
| Level | Performance |
| Type | Non-Functional |
| Priority | P1 |
| Precondition | Perf test environment with representative config and dataset is available. |
| Test Data | 500 - 1000 validation requests with mixed safe, duplicate, and protected-resend inputs |
| Steps | 1. Execute validation API load test with representative request mix. 2. Record p50, p95, and p99 latency excluding downstream WA dispatch. |
| Expected Result | Pre-send validation meets <= 100 ms p95 target or a documented, reviewable exception is raised. |
| Postcondition | Archive performance report. |
| Automation Status | Pending |
| Automation ID | N/A - API / performance automation lane |

### TC-WA-ABG-022

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-022 |
| Feature | Safe Degradation Under Audit Persistence Failure |
| Source Req ID | FR-024, FR-025, NFR-Reliability / Availability, EH-010, EH-011, EC-012 |
| Analysis Finding ID | Risk-12 Audit failure must not amplify duplicates |
| Level | Integration |
| Type | Negative / Resilience |
| Priority | P1 |
| Precondition | Audit persistence dependency can be temporarily failed. Safety evaluation path still functions. |
| Test Data | One safe send during synthetic audit store degradation |
| Steps | 1. Disable or fail the audit persistence dependency. 2. Trigger a safe outbound send. 3. Observe send behavior, result persistence, and alerts. |
| Expected Result | System degrades safely without creating duplicate send amplification. Canonical send result remains traceable through fallback/degraded alert path, and duplicate investigation evidence is not silently lost. |
| Postcondition | Restore audit persistence dependency. |
| Automation Status | Manual Only |
| Automation ID | N/A - degraded dependency / backend harness |

### TC-WA-ABG-023

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-023 |
| Feature | RBAC, Masking, and Bahasa UX |
| Source Req ID | FR-031, NFR-Security / Privacy / Localization |
| Analysis Finding ID | Security-01 Internal formulas and raw identity must stay protected |
| Level | UI / API |
| Type | Security / Localization |
| Priority | P1 |
| Precondition | Admin, authorized log viewer, IT Support, and Operator roles are available. Audit events exist. |
| Test Data | Existing blocked event with recipient fingerprint and reason code |
| Steps | 1. Verify Admin, authorized log viewer, and IT Support UI for logs. 2. Verify Operator cannot access internal logs or formulas. 3. Inspect recipient identity presentation and check masking. 4. Trigger one user-facing block/warning and verify copy language. |
| Expected Result | Server-side RBAC is enforced. Sensitive fields remain masked in allowed views. User-facing warnings remain in Bahasa Indonesia. Internal formulas are not exposed. |
| Postcondition | None |
| Automation Status | Ready |
| Automation ID | playwright/tests/e2e/rbac/wa-outbound-anti-ban-rbac.spec.js |

### TC-WA-ABG-024

| Field | Value |
| ----- | ----- |
| TC-ID | TC-WA-ABG-024 |
| Feature | Cross-Tenant Isolation for Logs |
| Source Req ID | NFR-Security / Privacy / Localization |
| Analysis Finding ID | Security-02 Tenant boundary must block foreign anti-ban data access |
| Level | API / UI |
| Type | Security / Permission |
| Priority | P1 |
| Precondition | Tenant A and Tenant B exist. A Tenant B user with anti-ban log access permission is available. Anti-ban logs exist for Tenant A. |
| Test Data | Tenant A anti-ban event |
| Steps | 1. Log in as Tenant B user with comparable anti-ban log access permission. 2. Attempt to query Tenant A anti-ban logs through UI or API. 3. Inspect response and returned payload. |
| Expected Result | Cross-tenant requests are denied or scoped to Tenant B only. No Tenant A anti-ban event, sender data, or log metadata is exposed to Tenant B user. |
| Postcondition | None |
| Automation Status | Pending |
| Automation ID | playwright/tests/e2e/rbac/wa-outbound-anti-ban-rbac.spec.js |

---

## 7. Regression Coverage

| Impact Area | Existing Behavior | Test Case IDs | Risk Level |
| ----- | ----- | ----- | ----- |
| Manual room send | Normal single outbound send should still work with no false block outside protected resend scope | TC-WA-ABG-011 | HIGH |
| Broadcast dispatch | One recipient should not receive duplicates even with overlapping audience or worker race, and duplicate-suspected incidents remain traceable | TC-WA-ABG-003, TC-WA-ABG-004, TC-WA-ABG-016 | HIGH |
| Sender eligibility / outbound limit | Existing sender ineligibility rules remain authoritative | TC-WA-ABG-013 | HIGH |
| Sender stickiness | Active session keeps same sender unless real ineligibility occurs | TC-WA-ABG-019, TC-WA-ABG-020 | HIGH |
| Retry flow | Timeout recovery must not create duplicate delivery | TC-WA-ABG-005, TC-WA-ABG-006, TC-WA-ABG-007 | HIGH |
| Logging and support visibility | Support can still trace incidents and duplicate lineage even under degraded conditions | TC-WA-ABG-016, TC-WA-ABG-022 | MEDIUM |
| Settings and rollout | Monitor-only rollout and invalid-config fallback must not break send flow | TC-WA-ABG-014, TC-WA-ABG-015 | MEDIUM |

---

## 8. Execution Runbook

| Phase | Action | Owner | Evidence |
| ----- | ----- | ----- | ----- |
| Pre-test | Prepare tenant config, sender accounts, recipient data, and audit access | QA / Engineering | Config screenshot, account state export |
| Pre-test | Reset anti-ban mode, cooldown, resend window state, and related broadcast fixtures to baseline | QA | Settings snapshot |
| Execution | Run smoke suite TS-001 + TS-002 first | QA | Test results, correlation IDs |
| Execution | Run manual resend guard suite TS-003 with manual evidence capture for warnings, block states, and broadcast references | QA | Screen recording, logs |
| Execution | Run sender health suite TS-004 and observability suite TS-005 | QA / Engineering | Event logs, account state history |
| Execution | Run non-functional and resilience suite TS-006 | QA / Engineering | Perf report, degraded mode logs |
| Post-test | Restore tenant anti-ban mode and sender counters | QA | Reset confirmation |
| Post-test | Archive logs, screenshots, and failed-attempt IDs for support reference | QA | Evidence bundle |

---

## 9. Defect Reporting Template

| Field | Value |
| ----- | ----- |
| Defect ID | BUG-WA-ABG-001 |
| Related TC-ID | TC-WA-ABG-001 |
| Related Req ID | FR-001 |
| Severity | Critical / High / Medium / Low |
| Priority | P0 / P1 / P2 / P3 |
| Environment | Staging / UAT / Perf |
| Steps to Reproduce | Exact reproducible steps with actor, sender, recipient, and timing |
| Actual Result | Observed send result, duplicate count, log state, UI copy |
| Expected Result | Expected dedupe / throttle / audit / sender-health behavior |
| Evidence | Screenshot, video, API trace, log extract, correlation ID |
| Impact | Duplicate delivery, restriction risk, operational block, missing audit trail, false positive block |
