# QA Assessment Report: WhatsApp Web Outbound Anti-Ban Guard

> **Assessment Type:** Type 1 — Feature Development Analysis
> **Source PRD / Source Input:** `PRD/Whatsapp web v2/PRD WA Web Outbound Anti-Ban Guard.md`
> **Assessment Artifact Path:** `Assessments/whatsapp-web/wa-outbound-anti-ban-guard/wa-outbound-anti-ban-guard-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, companion docs in `Assessments/whatsapp-web/wa-outbound-anti-ban-guard/` and `Test/whatsapp-web/`
> **Tanggal Analisa:** 2026-06-10
> **Status:** Reviewed

---

## 0. Ringkasan Perubahan Analisa

- Initial promoted assessment created from the promoted gap-review artifact.
- Active assessment now has a stable path under `Assessments/whatsapp-web/wa-outbound-anti-ban-guard/`.
- Companion artifacts are now separated clearly:
  - assessment review in `Assessments/...`
  - QA test spec in `Test/whatsapp-web/wa-outbound-anti-ban-qa-test-spec.md`
  - automation mapping in `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md`

---

## 1. Overview

**Feature / Issue:** WhatsApp Web Outbound Anti-Ban Guard

**Objective:** Reduce WhatsApp restriction / ban risk caused by duplicate outbound sends, simultaneous dispatch collisions, unsafe operator send behavior, and poor observability of outbound protection decisions.

**Business Context:** The PRD already defines core anti-ban behavior across duplicate suppression, lock handling, reconciliation, operator risk controls, sender safe mode, and auditability. However, several high-impact implementation decisions remain open and could produce inconsistent cross-service behavior if development starts without clarifying them.

**Scope In:**
- duplicate prevention for manual and broadcast outbound
- recipient-level locking
- retry and reconciliation behavior
- operator paste / burst protection
- cooldown / enforcement modes
- sender safe mode and account eligibility integration
- audit log visibility and reason codes
- tenant-level settings and safe fallback behavior

**Scope Out:**
- AI content rewriting / humanization redesign
- non-WhatsApp channels
- broad billing redesign
- ML anti-fraud classifier work

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `REVISE_PRD`

**Decision Class:** `NO_GO`

**Decision Statement:**
> Fitur ini sudah cukup matang untuk stakeholder review, QA planning, dan automation planning awal, tetapi belum aman untuk langsung masuk implementasi final. Beberapa keputusan desain inti masih terbuka dan harus dikunci di PRD agar FE/BE/worker tidak mengimplementasikan aturan yang berbeda.

### 2.2 Required Actions Before Development

- [ ] Lock scope Phase 1: text only vs attachment / template / non-text outbound
- [ ] Lock canonical fingerprint normalization rules for duplicate suppression
- [ ] Lock collision precedence between manual send and broadcast send
- [ ] Lock in-flight behavior when safe mode activates
- [ ] Lock IT Support override model and exact permission boundary
- [ ] Confirm source of truth for sender restriction / account health signals
- [ ] Decide whether tenant isolation needs an explicit FR / API contract note instead of remaining only an NFR implication

### 2.3 Key Blocking Reasons / Conditions

- Core duplicate behavior can diverge if normalization is not pinned.
- Cross-service conflict resolution is still ambiguous for manual vs broadcast collision.
- Sender safe-mode reaction path depends on an exact producer / event owner that is not yet explicit.
- Security / tenant boundary is covered by QA but still under-specified at PRD contract level.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** Backend, API, Worker/Queue, RBAC, Auditability, Automation, Tenant Security

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | One logical outbound send must not produce duplicate delivery effects within the dedupe window. | PRD FR-001 to FR-004 |
| BR-02 | Retry and unknown post-dispatch states must not trigger blind resend. | PRD FR-008 to FR-011 |
| BR-03 | Risky manual operator behavior may be warned, delayed, queued, soft-blocked, or hard-blocked depending on tenant policy. | PRD FR-014 to FR-020 |
| BR-04 | Sender restriction / ineligibility must stop or downgrade unsafe outbound behavior quickly. | PRD FR-021 to FR-023 |
| BR-05 | Every important anti-ban decision must be auditable with machine-readable reason codes. | PRD FR-026 to FR-028 |

### 3.2 Acceptance Criteria

- Duplicate suppression is deterministic for manual and broadcast outbound.
- Reconciliation pending never causes blind resend.
- Cooldown / policy enforcement is visible and operator-safe.
- Admin / Support audit trail is complete enough for incident review.
- Existing sender eligibility logic remains authoritative.

### 3.3 Assumptions

- Existing outbound limit and sender eligibility logic remain the canonical authority.
- Existing account-health or restriction signal already exists or will be supplied by a clearly owned producer.
- sixV2Automation is only one test lane; not all critical cases should be forced into Playwright.

### 3.4 Clarifications Needed

- What exactly is included in Phase 1 beyond text outbound?
- How is fingerprint normalization defined across whitespace, punctuation, placeholders, and attachments?
- Which flow wins when manual and broadcast target the same recipient at the same time?
- What should happen to already in-flight sends when safe mode activates?
- Is IT Support read-only or allowed limited audited override?
- Which service owns restriction / health-state truth?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- Anti-spam effort already exists for warming, outbound caps, and account rotation.
- The new PRD adds missing protection for duplicate send and risky operator manual behavior.
- QA planning is already relatively mature, but some implementation-defining decisions are still implicit.

### 4.2 Proposed State (To-Be)

- PRD becomes implementation-ready by locking the unresolved rules listed above.
- QA test coverage remains as the execution blueprint for validation.
- Automation scope is limited to deterministic UI/E2E candidates, while backend-heavy resilience/concurrency cases remain in integration or harness lanes.

### 4.3 State Transition / Data Flow Notes

- Manual send and broadcast send must converge on a single dedupe / lock truth path.
- Unknown delivery state must transition into `RECONCILIATION_PENDING` rather than resend.
- Sender health events must flow into safe mode fast enough to stop unsafe new sends.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | New anti-ban guard spans send path, validation, audit, and sender-health behavior | FE, API, worker, audit, support workflows | HIGH | Lock rules centrally in PRD before implementation |
| Database | Audit / state persistence for duplicate, cooldown, reconciliation, safe mode outcomes | observability and support investigation | MEDIUM | Ensure reason-code schema is explicit |
| API | Settings, validation, and audit endpoints / contracts likely needed | FE settings page, support tools, automation | HIGH | Add explicit contract notes for unresolved boundaries |
| UI/UX | Operator warnings, cooldown messages, Admin/Support audit visibility | operator behavior, support investigation | MEDIUM | Keep Bahasa UX and role masking aligned |
| Security / RBAC | Admin / Support visibility, operator restriction, tenant isolation | log access, settings access, data masking | HIGH | Add explicit tenant-boundary and permission notes |
| Performance | Added validation and risk checks before dispatch | send latency and UX trust | MEDIUM | Validate with non-functional tests, not only E2E |
| Integration | Manual send, broadcast, sender state, reconciliation, audit dependencies | cross-service correctness | HIGH | Define winning precedence and signal ownership |
| Reporting / Analytics | Reason-code visibility and support investigation quality | incident response | MEDIUM | Keep machine-readable reason codes stable |
| Financial / Operational | False positives or duplicate sends create customer-impact and support load | outbound operations, trust, ban risk | HIGH | Prefer `REVISE_PRD` before implementation final |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Manual outbound anti-ban | conversation room send flow | sync UI/API | UI -> BE | duplicate prevention + cooldown feedback |
| Broadcast anti-ban | broadcast dispatch flow | async worker | BE -> worker | overlap / collision handling must match manual path |
| Sender safe mode | account health / restriction signal | event / status feed | producer -> anti-ban guard | source of truth still needs explicit owner |
| Audit visibility | support/admin log views | API/UI | BE -> UI | reason-code schema must be stable |
| Automation readiness | sixV2Automation fixtures and UI surfaces | test dependency | QA -> automation | not all cases belong in Playwright |

### 6.2 Shared Resources / Event Mapping

- recipient-level lock / dedupe identity is shared by manual and broadcast paths
- restriction / safe-mode events influence sender eligibility and active send behavior
- audit log persistence is shared across support and post-incident investigation

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Duplicate fingerprint normalization differs across services | High | High | Critical | Lock canonical normalization in PRD |
| R-02 | Manual vs broadcast collision precedence differs by implementation path | Medium | High | High | Define winning rule explicitly |
| R-03 | Safe-mode event source is inconsistent or delayed | Medium | High | High | Confirm producer and contract owner before build |
| R-04 | Cross-tenant security remains implicit only | Medium | High | High | Add explicit tenant-scoping requirement / contract note |
| R-05 | QA / automation over-focus on Playwright and miss backend-heavy risks | Medium | Medium | Medium | Keep separate backend / integration lane |

### 7.2 Worst-Case Scenarios

- Same recipient gets duplicate messages from two valid but differently implemented send paths.
- Safe mode activates too late and unsafe outbound continues.
- Support cannot determine why a send was suppressed or blocked.
- Tenant B can inspect or infer anti-ban data belonging to Tenant A.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Use `Test/whatsapp-web/wa-outbound-anti-ban-qa-test-spec.md` as the current detailed test blueprint.
- Preserve the 24-case pack as the main manual / QA planning reference.

### 8.2 Regression Scope
- Manual room send normal path
- duplicate protection
- broadcast overlap
- sender eligibility
- sender stickiness / failover boundaries
- settings rollout behavior

### 8.3 Integration Scope
- recipient-level lock behavior
- reconciliation pending / sent / failed resolution
- sender safe mode event handling
- audit persistence degradation

### 8.4 UAT / Business Validation
- admin policy configuration
- operator warning / cooldown comprehension
- support-grade incident investigation flow

### 8.5 Automation Candidates
- Use `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md` as the active automation companion.
- Ready-now Playwright candidates remain the deterministic UI subset only.

---

## 9. Production Safety

- **Rollback Strategy:** Feature should be policy-driven / configurable so rollout can be softened or monitored without full removal.
- **Feature Toggle Requirement:** Strongly recommended through mode-based rollout (`monitor_only`, `warning_only`, `soft_block`, `strict`).
- **Backward Compatibility Notes:** Must not weaken existing outbound eligibility, limit, or sender selection safeguards.
- **Staged Rollout Recommendation:** Start with monitor-only or limited rollout, then promote after high-risk rules are locked and validated.
- **Monitoring / Alerting Needs:** reason-code distribution, duplicate suppression counts, reconciliation backlog, account safe-mode triggers, tenant-level block rates.
- **Logging / Audit Gaps:** explicit winner reference, signal owner, and tenant boundary notes should be made clearer.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Is Phase 1 text-only or does it include attachment/template outbound? | Scope ambiguity affects implementation surface and QA scope | Yes |
| OQ-02 | What is the canonical fingerprint normalization rule? | Duplicate suppression consistency depends on it | Yes |
| OQ-03 | What wins in manual vs broadcast same-recipient collision? | Cross-service behavior must be deterministic | Yes |
| OQ-04 | What happens to in-flight sends after safe mode activates? | Prevents partial or inconsistent behavior | Yes |
| OQ-05 | Can IT Support override anti-ban controls? | Affects RBAC and audit design | Yes |
| OQ-06 | Which service owns restriction / health-state truth? | Needed for fast and correct safe-mode enforcement | Yes |
| OQ-07 | Should tenant isolation be elevated from NFR implication to explicit FR/API note? | Security clarity and implementation certainty | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- The PRD is already useful and substantial.
- QA planning is strong: the promoted test spec covers 24 cases and closes the tenant-isolation gap in test coverage.
- Automation planning is also usable now, but only for the deterministic subset.
- The remaining blockers are not cosmetic; they define core system behavior.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `REVISE_PRD` |
| Decision Class | `NO_GO` |
| Owner for Follow-up | PM + QA + BE lead |
| Required Revisions / Conditions | Lock 7 unresolved design decisions before implementation-final approval |
| Suggested Delivery Strategy | Resolve design gaps first, then proceed with monitor-only / staged rollout |
| Earliest Safe Next Step | PRD revision workshop with PM / QA / Engineering |

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-001 to FR-004 | Idempotency and duplicate suppression | Normalization rule still open | Backend / Worker | TC-WA-ABG-001, 002, 003 | Conditional |
| FR-005 to FR-007 | Recipient locking | Collision precedence still not fully pinned | Worker / Broadcast / Manual send | TC-WA-ABG-004, 017 | Conditional |
| FR-008 to FR-011 | Retry / reconciliation | Strong QA coverage exists | Reliability | TC-WA-ABG-005, 006, 007 | Covered |
| FR-014 to FR-020 | Operator behavior and policy enforcement | Safe path clear, thresholds need stable rollout decisions | UI / Policy / Automation | TC-WA-ABG-008 to 011, 015 | Covered with rollout caution |
| FR-021 to FR-023 | Sender safe mode and eligibility | Signal owner not yet explicit | Sender health / Integration | TC-WA-ABG-012, 013, 019, 020 | Conditional |
| FR-026 to FR-028 | Audit and support visibility | Good support direction, log/UI maturity still needed | RBAC / Audit | TC-WA-ABG-016, 023, 024 | Covered with design clarification |
| FR-029 to FR-030 | Tenant settings / safe fallback | Usable but needs explicit config ownership and safe fallback handling | Settings / API | TC-WA-ABG-014, 015 | Covered |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-10 | Initial promoted QA assessment created from final gap review | Hermes Agent |
