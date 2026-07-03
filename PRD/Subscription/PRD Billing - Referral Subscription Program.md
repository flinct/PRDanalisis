# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Billing - Referral Subscription Program  
**Product Manager**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: TBD

---

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-06-22 | Hermes | Initial PRD for referral code creation, onboarding-linked referral status, referee free subscription, referrer subscription reward, and superAdmin referral reward configuration. |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a referral growth system where an eligible tenant can share a referral code, a new company can use the code during signup/onboarding, the referred company receives a free subscription benefit, and the referrer receives subscription extension after the referral qualifies. |
| Scope | Phase 1 covers referral code ownership, code usage during registration/onboarding, referral status visibility for the referrer, onboarding approval-linked referral state transition, referee free subscription grant, referrer subscription extension grant, and superAdmin reward configuration. |
| Key Capabilities | Create or manage referral code, apply referral code in onboarding flow, view referral progress, track approved/rejected referral outcome, grant free subscription to referred company, grant bonus subscription period to referrer, and keep full billing/audit traceability. |
| Outcome | SatuInbox gains a measurable referral loop without bypassing existing billing, subscription, onboarding approval, or tenant audit controls. |

### **2.1 Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| One active referral code per eligible company in Phase 1. | Multi-code campaign management in Phase 1. |
| Referral code entry during registration/onboarding flow. | Referral code usage from inbox/conversation/ticket modules. |
| Referrer-facing referral status list. | Public affiliate portal or marketing landing page builder. |
| Statuses tied to onboarding approval result. | Cash payout, commission wallet, or external affiliate settlement. |
| Referred company free subscription grant. | Paid referral marketplace or reseller pricing model. |
| Referrer subscription extension reward. | Manual finance-side refund tooling. |
| SuperAdmin global configuration for referral reward duration. | Company-level self-service reward policy editing. |
| Full auditability and idempotent reward grant. | Advanced fraud scoring engine in Phase 1. |

### **2.2 Phase Structure**

| Phase | Scope |
| ----- | ----- |
| Phase 1 | Single active code, onboarding-linked status tracking, company approval-linked qualification, referee free subscription, referrer extension reward, superAdmin global reward config. |
| Phase 2 | Multiple codes per company, campaign labels, richer referral analytics, pending reward credit, enhanced anti-fraud rules. |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | SatuInbox does not have a native referral system that connects onboarding, company approval, and billing reward logic. | Growth opportunities depend on manual operations or external tooling. |
| PS-002 | Existing voucher flow can benefit the redeeming tenant but cannot model dual-sided reward for both referrer and referee. | Referral logic would become inconsistent or unsafe if forced into plain voucher behavior. |
| PS-003 | Referrer currently has no visibility into whether a referred company has only entered a code, completed onboarding, been approved, or been rejected. | Referral adoption and trust are low because users cannot track referral outcomes. |
| PS-004 | Free subscription and extension reward can alter entitlement, billing state, and invoice behavior if not tied to payment-service lifecycle. | High financial and operational risk. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Launch a referral program that is operationally compatible with SatuInbox onboarding and subscription lifecycle. | 100% of successful referral rewards are recorded through payment-service and auditable without manual DB edits. |
| Give referrers clear status visibility. | 95% of referred cases show an accurate status (`Menunggu review`, `Disetujui`, `Ditolak`, `Reward diberikan`) within 1 minute of state transition. |
| Prevent duplicate reward and billing inconsistency. | 0 duplicate reward grants per referral case after release. |
| Keep Phase 1 simple and shippable. | Phase 1 runs with one active code per company and no multi-campaign dependency. |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an eligible company billing owner, I want to have my own referral code so that I can invite other companies to SatuInbox. | 1. Given my company is eligible for referral, When I open the referral page, Then I see my active referral code. 2. Given I do not have a referral code yet, When the system provisions one, Then exactly one active code is created for my company in Phase 1. |
| US-002 | P0 | As a new company registrant, I want to enter a referral code during signup/onboarding so that I can receive the referred-company subscription benefit if my company is approved. | 1. Given I enter a valid referral code, When I continue registration/onboarding, Then the code is attached to my referral case. 2. Given the code is invalid, inactive, or not eligible, When I submit it, Then the system blocks the code and shows an inline error in Bahasa Indonesia. |
| US-003 | P0 | As a referrer, I want to see the status of my referrals after they submit onboarding so that I know whether the referral was approved or rejected. | 1. Given a referred company used my code and submitted onboarding, When I open referral history, Then I see the referred company row with status `Menunggu review`. 2. Given superAdmin approves the referred company, When approval is completed, Then the status changes to `Disetujui`. 3. Given superAdmin rejects the referred company, When rejection is completed, Then the status changes to `Ditolak`. |
| US-004 | P0 | As a referrer, I want my active subscription to be extended automatically when a referral qualifies so that I receive the promised reward without manual admin intervention. | 1. Given a referral reaches the configured qualification event, When reward processing succeeds, Then my subscription end date is extended based on configured reward duration. 2. Given the reward was already granted for that referral case, When retry or duplicate processing occurs, Then no second extension is applied. |
| US-005 | P0 | As a referred company, I want my company to receive the configured free subscription benefit after approval so that I can start using SatuInbox without manual finance intervention. | 1. Given my company is approved and the referral case is valid, When reward processing runs, Then a free subscription entitlement is created through payment-service lifecycle. 2. Given reward processing fails, When the system retries, Then the company does not receive duplicate benefits. |
| US-006 | P0 | As a superAdmin, I want to configure the referral reward duration globally so that referral benefits follow central business policy. | 1. Given I open referral program configuration, When I update reward duration, Then the new value is stored as the active global configuration. 2. Given the configuration changes, When new referrals qualify later, Then they use the latest effective policy version without mutating already-granted rewards. |
| US-007 | P1 | As a referrer, I want to see whether reward has already been granted so that I understand the final outcome of each referral. | 1. Given a referred company is approved and rewards are processed, When I open referral history, Then the row shows `Reward diberikan` or an equivalent granted state. 2. Given approval succeeded but reward processing is pending or failed, When I open referral history, Then the row shows an explicit intermediate or failed processing state. |

---

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Program Eligibility | FR-001 [P0]: System MUST support a globally enabled or disabled referral program. FR-002 [P0]: System MUST allow only eligible tenant roles to view and use referral management functions. FR-003 [P0]: Phase 1 MUST support exactly one active referral code per company. |
| Referral Code Model | FR-004 [P0]: System MUST store referral code ownership by `companyId`, `organizationId`, and creator/owner identity. FR-005 [P0]: Referral code MUST be unique across the system. FR-006 [P0]: Referral code MUST support active and inactive states. |
| Code Usage Flow | FR-007 [P0]: System MUST allow referral code entry during registration/onboarding flow. FR-008 [P0]: System MUST validate that the code is active, not self-referred, and eligible for the current signup flow. FR-009 [P0]: System MUST create a referral case when a valid code is accepted. |
| Referral Status Tracking | FR-010 [P0]: System MUST provide a referrer-visible referral history list. FR-011 [P0]: Each referral case MUST include status values at minimum: `Kode digunakan`, `Onboarding berlangsung`, `Menunggu review`, `Disetujui`, `Ditolak`, `Reward diberikan`, `Reward gagal`. FR-012 [P0]: Status changes triggered by onboarding and approval events MUST update the referrer-visible list without manual refresh dependency beyond normal page reload or polling strategy. |
| Onboarding / Approval Integration | FR-013 [P0]: When a referred company submits onboarding, System MUST move the referral case into a waiting-review state. FR-014 [P0]: When company approval succeeds, System MUST update the referral case to approved. FR-015 [P0]: When company rejection succeeds, System MUST update the referral case to rejected and MUST NOT grant rewards. |
| Referee Benefit | FR-016 [P0]: When a valid referral case reaches the configured qualification event, System MUST create the referred-company free subscription benefit through payment-service. FR-017 [P0]: Referee benefit MUST use a versioned configuration snapshot so later config changes do not rewrite already-qualified cases. FR-018 [P0]: Referee benefit MUST remain tenant-scoped and auditable. |
| Referrer Benefit | FR-019 [P0]: When a valid referral case reaches the configured qualification event, System MUST grant subscription extension reward to the referrer company. FR-020 [P0]: Reward grant MUST update the referrer subscription through payment-service lifecycle, not through direct raw DB mutation only. FR-021 [P0]: System MUST record a reward ledger entry with before/after subscription dates and reward source reference. |
| Reward Configuration | FR-022 [P0]: SuperAdmin MUST be able to configure reward duration for referee and referrer globally. FR-023 [P0]: Configuration MUST support versioning or effective snapshot behavior for auditability. FR-024 [P1]: System SHOULD support future extension for different duration values between referee and referrer. |
| Anti-Abuse and Eligibility | FR-025 [P0]: System MUST block self-referral using the same company identity. FR-026 [P0]: System MUST restrict referred-company reward to one qualifying referral path per new company. FR-027 [P0]: System MUST prevent duplicate reward processing for the same referral case. |
| Visibility and History | FR-028 [P0]: Referrer history row MUST show at minimum referred company display name, created/used timestamp, onboarding status, approval status, and reward status. FR-029 [P1]: System MAY include rejection reason preview if policy allows and privacy review passes. |
| Non-Side Effects | FR-030 [P0]: Referral reward processing MUST NOT bypass existing subscription expiry, grace period, invoice, and entitlement rules. FR-031 [P0]: Rejected referral cases MUST NOT alter referee or referrer subscription. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Invalid code | Block referral code acceptance. | Show `Kode referral tidak valid`. |
| EH-002 | Inactive code | Block usage. | Show `Kode referral tidak aktif`. |
| EH-003 | Self-referral | Block usage. | Show `Kode referral tidak dapat digunakan untuk company ini`. |
| EH-004 | Duplicate referral qualification | Do not grant rewards twice. Return consistent prior outcome. | Show stable success/result state without duplicate side effects. |
| EH-005 | Approval event received for already rejected/finalized case | Ignore invalid transition and log anomaly. | No user-facing mutation; optional retry-safe info state. |
| EH-006 | Reward processing failure | Keep case auditable and retry-safe. | Show `Reward sedang diproses` or `Reward gagal diproses` depending on final state mapping. |
| EH-007 | Missing active subscription for referrer under chosen policy | Block or defer reward according to final business rule. | Show explicit admin/log state; referrer UI must not silently mark granted. |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Referred company uses code but never submits onboarding. | Case stays in onboarding-in-progress state and no reward is granted. | Referrer sees non-final pending state. |
| EC-002 | Referred company submits onboarding and is rejected. | Referral status becomes rejected; no rewards are granted. | Referrer sees `Ditolak`. |
| EC-003 | Company approval happens twice or duplicate event is replayed. | Reward grant remains idempotent and only one final reward ledger is created. | No duplicate granted state. |
| EC-004 | Referrer subscription is already expired when reward should be granted. | Follow configured rule: block, defer, or reactivate through approved policy only. | Must not silently grant without explicit policy. |
| EC-005 | Referred company onboarding approved but reward job fails after approval. | Referral case remains approved with reward-pending or reward-failed state until retry resolution. | Referrer sees final approval but non-final reward state. |
| EC-006 | Referrer code is deactivated after being used but before approval. | Existing referral case remains governed by snapshot policy at usage time unless product decides otherwise. | Existing case must not disappear from history. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Referral summary page | Company referral landing page with active code and basic stats. | Billing-authorized user opens referral page and sees current code and referral summary. | US-001 |
| Referral history table | Shows referral cases and statuses. | User opens referral history, filters or reviews each referral row. | US-003, US-007 |
| Referral status badge | Badge values in Bahasa Indonesia (`Menunggu review`, `Disetujui`, `Ditolak`, `Reward diberikan`). | User quickly understands current state of each referral. | US-003, US-007 |
| Registration/onboarding referral input | Input field for referral code in signup/onboarding path. | New company enters referral code, validation runs before continuation or submission milestone. | US-002 |
| SuperAdmin referral config page | Global configuration form for reward duration values. | SuperAdmin opens referral config, edits values, saves, and future cases use new snapshot. | US-006 |

**UI Copy Notes (Bahasa Indonesia):**
- `Kode referral`
- `Riwayat referral`
- `Menunggu review`
- `Disetujui`
- `Ditolak`
- `Reward diberikan`
- `Reward gagal diproses`

---

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| referralCode | String | `DANY-SIX-7K2P` | Unique, uppercase-safe, trimmed, alphanumeric + hyphen only, max 32 chars | Yes | System-generated or policy-defined |
| referralCaseId | String | `ref_abc123` | Unique identifier | Derived | Generated |
| referrerCompanyId | String | `cmp_123` | Must be valid company owner of code | Yes | None |
| referredCompanyId | String | `cmp_987` | Must reference the new company once created | Conditional | None |
| onboardingStatus | Enum | `waiting_review` | Must follow allowed state machine | Yes | `onboarding_in_progress` |
| approvalStatus | Enum | `approved` | Must be `pending`, `approved`, or `rejected` | Yes | `pending` |
| rewardStatus | Enum | `pending_grant` | Must be `not_eligible`, `pending_grant`, `granted`, `failed` | Yes | `not_eligible` |
| referrerRewardMonths | Integer | `1` | Positive integer, global config-driven | Yes | Config value |
| refereeRewardMonths | Integer | `1` | Positive integer, global config-driven | Yes | Config value |

---

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Referral history page SHOULD load within 3 seconds for normal company volume. |
| Reliability | Reward grant MUST be idempotent and retry-safe. |
| Security | Only authorized billing/admin roles can manage or view tenant referral details. |
| Privacy | Referrer visibility MUST not expose unnecessary referred-company private documents or internal approval notes beyond approved UI scope. |
| Observability | Every referral case transition and reward attempt MUST emit structured logs with correlation IDs. |
| Auditability | Reward configuration changes and reward grants MUST be auditable end-to-end. |

---

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Company approval lifecycle events | Engineering | Referral statuses cannot stay accurate without approval integration. | Define explicit integration contract with company-service. |
| Subscription extension lifecycle correctness | Engineering | Incorrect reward can break entitlement or invoice timing. | Route all changes through payment-service and reward ledger. |
| Abuse or fake company referrals | Product / Engineering | Free entitlements may be exploited. | Restrict to new company, self-referral block, one qualifying case per company. |
| Missing referrer active subscription policy | Product | Reward outcome becomes ambiguous. | Lock policy before release. |

---

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Referral status accuracy | >= 99% referral approval states match company approval outcome | First 30 days | Referral audit logs vs company approval logs |
| Duplicate reward incidents | 0 | Ongoing | Reward ledger / incident log |
| Referral usage conversion | Track baseline after launch | 30-60 days | Referral event analytics |
| Reward grant completion rate | >= 98% for approved qualified cases | 30 days | Payment-service logs |

---

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Multiple codes per company | Enables campaigns and channel-based tracking. |
| Referral analytics dashboard | Gives conversion and performance visibility. |
| Pending reward credit model | Supports referrer reward even when active subscription edge cases exist. |
| Anti-fraud risk engine | Protects growth economics at scale. |

---

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Phase 1 supports one active code per company only. | No campaign segmentation yet. |
| Reward policy is globally configured by superAdmin. | Company-level customization is not available in Phase 1. |
| Phase 1 depends on onboarding/company approval integration. | Referral case cannot finalize without company approval signal. |

---

## **16. Appendix**

| Item | Notes |
| ----- | ----- |
| Glossary | `Referrer` = company that owns referral code. `Referee` = new company using the code. `Qualified referral` = referral case that reaches approved qualification event under policy. |
| Assumptions | Reward grant in Phase 1 is driven by onboarding/company approval-linked qualification with payment-service execution. |
| Open Questions | Whether referrer reward is granted immediately at approval or at a stricter subscription milestone if finance requires it. |
| References | `Assessments/cross-domain/referral-subscription-and-superadmin-global-access/referral-subscription-and-superadmin-global-access-qa-assessment.md`, `PRD/Subscription/PRD Prepaid Billing and Subscription.md`, `PRD/Subscription/PRD Billing Voucher Engine.md` |

---

## **17. State Transition Model**

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Referral Case | none | Valid referral code accepted in onboarding flow | `code_used` | Public onboarding user / system | Code valid and not self-referral | Create referral case | `referral_case_created` |
| Referral Case | `code_used` | Onboarding still being filled | `onboarding_in_progress` | System | Case exists | None beyond status update | `referral_case_updated` |
| Referral Case | `onboarding_in_progress` | Onboarding submitted | `waiting_review` | System | Company onboarding submitted | Referrer can see waiting-review state | `referral_waiting_review` |
| Referral Case | `waiting_review` | Company approved | `approved` | SuperAdmin / system | Company approval succeeded | Eligible for reward processing | `referral_approved` |
| Referral Case | `waiting_review` | Company rejected | `rejected` | SuperAdmin / system | Company rejection succeeded | Reward blocked | `referral_rejected` |
| Referral Case | `approved` | Reward processing success | `reward_granted` | System | Not yet granted | Create referee entitlement + referrer extension ledger | `referral_reward_granted` |
| Referral Case | `approved` | Reward processing failed | `reward_failed` | System | Processing failed after retry path or final failure | Retry / ops review path | `referral_reward_failed` |

---

## **18. Permission Matrix**

| Role | View Referral Summary | View Referral History | Create / Manage Code | Configure Reward Policy | Manual Reprocess Reward | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Billing-authorized company role | Allowed | Allowed | Allowed | Denied | Denied | Phase 1 recommended creator role |
| Regular agent / non-billing member | Denied | Denied | Denied | Denied | Denied | No referral management access |
| Admin (tenant) | Conditional | Conditional | Conditional | Denied | Denied | Follows billing access policy |
| Super Admin | Allowed | Allowed | Read-only by default | Allowed | Allowed (if internal tool exists) | Global oversight |

---

## **19. API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Referral code fetch | `GET /payments/referral/code` | FE referral page | API Gateway / payment-service | Authenticated tenant request | Active code + summary | `forbidden`, `not_enabled` | New route |
| Referral history fetch | `GET /payments/referral/history` | FE referral page | API Gateway / payment-service | Authenticated tenant request | Paginated referral cases | `forbidden` | New route |
| Referral code validate on onboarding | `POST /auth/register/referral/validate` or equivalent | FE onboarding | API Gateway / payment-service | `referralCode`, signup context | Validation result + preview | `invalid_code`, `inactive_code`, `self_referral` | Final route can vary by gateway ownership |
| Company approval event | `company.approved` / `company.rejected` or sync integration | company-service | payment-service referral module | companyId + approval outcome | Ack / processed | integration failure mapped internally | Required dependency |
| Reward grant event / job | internal async reward grant | payment-service | payment-service workers / audit / notification | referralCaseId + config snapshot | grant result | `duplicate_reward`, `grant_failed` | Must be idempotent |

---

## **20. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| Referral data model | Create referral collections/tables in payment domain | Engineering | Schema checks + integration tests | Disable feature flag, keep data read-only |
| Onboarding integration | Connect referral state with company approval flow | Engineering | Approval/rejection test matrix | Disable approval-linked reward processing |
| Feature flag | Launch behind referral flag | Product / Engineering | Internal pilot first | Disable flag |
| Reward grant | Turn on auto-grant after status pipeline verified | Engineering | Compare referral cases vs reward ledger | Pause auto-grant worker |

---

## **21. Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Referral code | payment-service | Tenant billing-authorized user / system | Active until disabled + historical retention | Soft disable preferred | Not public export in Phase 1 | No sensitive onboarding docs stored here |
| Referral case | payment-service | System on code usage | Long-term audit retention | Do not hard delete casually | Internal export only if needed | Avoid exposing sensitive company document data |
| Reward ledger | payment-service | System | Financial/audit retention policy | Immutable preferred | Internal audit export only | Must support reconciliation |
| Reward config snapshot | payment-service | SuperAdmin | Long-term config audit retention | Immutable version history | Internal only | Required for traceability |

---

## **22. Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Product Event | `referral_code_viewed` | Referrer opens referral page | `companyId`, `userId` | Product / FE | Optional |
| Product Event | `referral_code_used` | Valid code accepted | `referrerCompanyId`, `referredCompanyId` | Product / BE | Monitor conversion |
| Backend Metric | `referral_reward_grant_success_total` | Reward success | `rewardType`, `configVersion` | Engineering | Alert on drop |
| Backend Metric | `referral_reward_grant_failure_total` | Reward failure | `failureType` | Engineering | Alert if > 2% |
| Audit Event | `referral_program_config_changed` | SuperAdmin updates config | `actorId`, `before`, `after` | Engineering / Security | Required |
| Audit Event | `referral_case_state_changed` | Referral status transition | `caseId`, `from`, `to` | Engineering / Security | Required |

---

## **23. Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| Duplicate approval event replay | Duplicate reward | Reward grant MUST stay idempotent per referral case | Replay event test |
| User refreshes onboarding after valid code accepted | Multiple referral cases | System MUST reuse or collapse to single referral case under same signup/company flow | Signup retry test |
| Reward job retried after partial failure | Duplicate extension / duplicate free subscription | Reward operations MUST check prior ledger/grant state before mutation | Worker retry test |
| Simultaneous config change and reward processing | Wrong reward duration applied | Reward processing MUST use config snapshot resolved at qualification time or explicit business checkpoint | Config snapshot test |
