# QA Test Writing Rules

Purpose:
Define how to write QA test plans, test cases, test steps, test data, execution support, and automation mapping from PRD analysis output. This rule extends the Test Specification Layer in `Rules/qa-analysis-rule.md`.

---

# When To Use

Use this rule when the user asks to:

- buat test case
- buat test scenario
- buat test steps
- buat QA test plan
- buat regression test
- buat UAT scenario
- tulis testing steps
- siapkan dokumen QA testing
- update existing test cases

This rule is for writing executable QA artifacts. For analyzing PRD risk, impact, and requirement gaps, use `Rules/qa-analysis-rule.md` first.

---

# Required Source Inputs

Before writing QA tests, load these inputs in order:

1. `Rules/qa-analysis-rule.md`.
2. Relevant PRD analysis output.
3. Impact analysis output if the feature changes existing behavior or cross-feature dependency.
4. Source PRD or patch/addendum.
5. `Memory/global-memory.md`.
6. Relevant feature memory from `Memory/`.
7. Existing test cases in the affected scope when updating tests.

If PRD analysis does not exist, create a minimal requirement extraction first using `qa-analysis-rule.md` before writing test cases. Do not write tests directly from vague PRD text when requirements are ambiguous.

---

# Relationship With QA Analysis Rule

`qa-analysis-rule.md` produces the reasoning layer. `test-case-rule.md` produces the execution layer.

| QA Analysis Output | QA Test Writing Output |
| ----- | ----- |
| Requirement Summary | Requirement coverage matrix |
| Flow Analysis | Happy path, alternate path, and interruption tests |
| State Transition Analysis | State transition test suite |
| Data Flow Analysis | Data persistence, export, audit, and integration tests |
| Impact Analysis | Regression test suite |
| Dependency Analysis | Integration and contract test suite |
| Risk Analysis | Negative, failure-mode, rollback, and monitoring tests |
| Test Strategy | Final test plan, suites, priorities, and execution runbook |
| Traceability Matrix | Requirement-to-test mapping and coverage status |

Every important finding from PRD analysis must either produce a test case, be marked as not testable with reason, or be logged as an open question/blocker.

---

# Scope Rules

- Test cases MUST stay within the PRD scope and approved analysis scope.
- Test cases MUST NOT validate out-of-scope behaviors as required behavior.
- Test cases MUST cover all acceptance criteria, functional requirements, error handling, edge cases, NFRs, and impact/regression areas identified by analysis.
- Test cases MUST link back to source requirement IDs such as `US-001`, `FR-001`, `EH-001`, `EC-001`, `NFR-001`, or analysis finding IDs.
- Undefined behavior must be written as an open question, not as an expected result.
- Existing passing tests must not be modified unless expected behavior changed.
- Obsolete tests must be marked `Deprecated`, not deleted without confirmation.

---

# Test Artifact Types

Use the appropriate artifact based on user request and feature complexity.

| Artifact | Use When | Required Content |
| ----- | ----- | ----- |
| Test Plan | QA needs scope, strategy, environment, and execution guidance. | Objective, scope, suite plan, environment, entry/exit criteria, risks. |
| Test Scenario List | Early QA planning or UAT alignment. | Scenario ID, user goal, requirement ID, priority, expected outcome. |
| Detailed Test Case Spec | QA needs executable manual or automation-ready cases. | TC format, test data, steps, expected result, postcondition. |
| Regression Suite | Existing behavior may be affected. | Impact area, existing behavior, regression cases, priority. |
| UAT Script | Business users execute validation. | Plain-language steps, data, expected business outcome. |
| API / Contract Test Spec | API/event/webhook/socket/queue/report contract changes. | Contract, payload, response, errors, backward compatibility cases. |
| Release Validation Runbook | Feature is close to deploy. | Smoke steps, canary checks, rollback checks, evidence checklist. |

---

# Required Output Structure

For a full QA test document, use this structure.

```md
# QA Test Specification - <Feature Name>

## 1. Overview

| Item | Description |
| ----- | ----- |
| Feature | <Feature name> |
| Source PRD | <Path/link> |
| Source Analysis | <Path/link> |
| Scope | <What will be tested> |
| Non-Scope | <What will not be tested> |

## 2. Requirement Coverage Matrix

| Req ID | Requirement Summary | Analysis Finding / Risk | Test Case IDs | Coverage Status |
| ----- | ----- | ----- | ----- | ----- |
| FR-001 | <Requirement> | <Finding/risk> | TC-XXX-001 | Covered |

## 3. Test Strategy

| Test Type | Scope | Priority | Environment | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Smoke | <Critical launch path> | P0 | Staging | <Notes> |
| Functional | <Feature behavior> | P0/P1 | Staging | <Notes> |
| Regression | <Affected existing behavior> | P0/P1 | Staging | <Notes> |
| Integration | <Cross-service/API/event> | P0/P1 | Staging | <Notes> |
| UAT | <Business flow> | P1 | UAT/Staging | <Notes> |

## 4. Test Data & Environment

| Data / Environment | Value | Setup | Cleanup | Owner |
| ----- | ----- | ----- | ----- | ----- |
| <Data> | <Value> | <How to prepare> | <How to reset> | <Owner> |

## 5. Test Suites

| Suite ID | Suite Name | Purpose | Test Case IDs | Execution Trigger |
| ----- | ----- | ----- | ----- | ----- |
| TS-001 | Smoke | Release gate | TC-XXX-001 | Every RC / deploy |

## 6. Detailed Test Cases

| Field | Value |
| ----- | ----- |
| TC-ID | TC-<FEATURE>-001 |
| Feature | <Feature name> |
| Source Req ID | FR-001 |
| Analysis Finding ID | <Finding ID or N/A> |
| Level | Unit / Integration / API / UI / E2E / UAT / Performance / Security |
| Type | Positive / Negative / Edge / Regression / Contract / Migration / Rollback |
| Priority | P0 / P1 / P2 / P3 |
| Precondition | <System state before test> |
| Test Data | <Specific values> |
| Steps | 1. <Concrete action>. 2. <Concrete action>. |
| Expected Result | <Exact assertions> |
| Postcondition | <Cleanup or resulting state> |
| Automation Status | Automated / Ready / Manual Only / Pending / Blocked |
| Automation ID | <File/class/method or N/A> |

## 7. Regression Coverage

| Impact Area | Existing Behavior | Test Case IDs | Risk Level |
| ----- | ----- | ----- | ----- |
| <Module/flow> | <Behavior that must not regress> | TC-XXX-010 | HIGH/MEDIUM/LOW |

## 8. Execution Runbook

| Phase | Action | Owner | Evidence |
| ----- | ----- | ----- | ----- |
| Pre-test | <Setup action> | QA | <Screenshot/log/report> |
| Execution | <Run suite> | QA | <Result link> |
| Post-test | <Cleanup/sign-off> | QA | <Evidence> |

## 9. Defect Reporting Template

| Field | Value |
| ----- | ----- |
| Defect ID | BUG-<FEATURE>-001 |
| Related TC-ID | TC-<FEATURE>-001 |
| Related Req ID | FR-001 |
| Severity | Critical / High / Medium / Low |
| Priority | P0 / P1 / P2 / P3 |
| Environment | <Env> |
| Steps to Reproduce | <Exact steps> |
| Actual Result | <Observed behavior> |
| Expected Result | <Expected behavior> |
| Evidence | <Screenshot/log/trace/export> |
| Impact | <User/business/system impact> |
```

---

# Test Case Format Rules

Every detailed test case MUST include:

- `TC-ID`: `TC-{FEATURE}-{NNN}` with stable feature prefix.
- `Source Req ID`: requirement or analysis ID being covered.
- `Level`: Unit, Integration, API, UI, E2E, UAT, Performance, Security, Migration, or Rollback.
- `Type`: Positive, Negative, Edge, Regression, Contract, State, Permission, Migration, Rollback, or Observability.
- `Priority`: P0, P1, P2, or P3.
- `Precondition`: exact system state before execution.
- `Test Data`: exact data values, not generic placeholders.
- `Steps`: numbered and executable.
- `Expected Result`: exact assertions.
- `Postcondition`: cleanup or expected persisted state when relevant.
- `Automation Status`: Automated, Ready, Manual Only, Pending, Blocked, Deprecated, or Flaky.

Priority definitions:

- `P0`: release blocker, critical path, data integrity, security, access control, SLA, payment, message delivery, or severe regression risk.
- `P1`: core behavior and high-value regression.
- `P2`: edge cases, lower-frequency paths, resilience, and usability checks.
- `P3`: nice-to-have, exploratory, cosmetic, or low-risk checks.

---

# Step Writing Rules

Test steps must be executable by QA without needing hidden context.

- Use numbered steps.
- Write one action per step.
- Use visible UI labels, API endpoint names, event names, or data values from the PRD/analysis.
- Include navigation path when UI context matters.
- Include role/account used when permission matters.
- Include exact input values.
- Include wait/retry conditions only when the product behavior is async.
- Expected result must include exact UI state, API status, payload value, DB-visible state, event emitted, audit log, export value, or error message where relevant.
- Do not use vague assertions such as "works", "success", "normal", or "correct" without defining the observable result.
- Do not include implementation internals unless the PRD or analysis explicitly requires backend validation, API contract, DB persistence, queue event, or audit verification.

Good expected result examples:

- UI shows `Akses ditolak` and the save button remains disabled.
- API returns `409` with error code `TICKET_ALREADY_MERGED`.
- Export column `RLT` shows `-` for incomplete metric and does not show `0`.
- Audit event `ticket.merge.completed` stores actor ID, main ticket ID, sub ticket ID, workspace ID, and timestamp.

---

# Coverage Requirements

Minimum coverage for every feature:

| Source | Required Coverage |
| ----- | ----- |
| User Stories | At least 1 test per acceptance criterion. |
| Functional Requirements | 100 percent covered or explicitly marked not testable with reason. |
| Error Handling | 1 negative test per user-facing or contract-level error. |
| Edge Cases | 1 test per edge case unless impossible; document reason. |
| Field & Validation | Boundary and equivalence tests for every input field. |
| State Transition | Valid and invalid transition tests for every stateful entity. |
| Permission Matrix | Allowed and denied tests for each impacted role/scope. |
| API / Event Contract | Success, validation error, permission error, conflict, backward compatibility, and idempotency cases. |
| Data Lifecycle | Create, update, archive/delete, retention/export, and audit checks where relevant. |
| Migration / Rollout | Backfill, feature flag, backward compatibility, rollback, and production smoke checks where relevant. |
| NFR | Performance, reliability, security, privacy, accessibility, observability, and localization tests where relevant. |
| Impact Analysis | Regression tests for every HIGH/MEDIUM affected area. |

---

# Test Suite Organization

Group tests by execution purpose.

| Suite | Purpose | Trigger |
| ----- | ----- | ----- |
| Smoke P0 | Fast release gate for critical path. | Every staging deploy and production canary. |
| Functional P0/P1 | Validate feature requirements. | Every release candidate. |
| Regression P0/P1 | Validate impacted existing behavior. | Every release candidate and hotfix. |
| Integration / Contract | Validate API, event, webhook, socket, queue, report/export contracts. | Every contract change and release candidate. |
| State / RBAC | Validate lifecycle and permission safety. | Every release candidate. |
| Data / Migration | Validate migration, backfill, rollback, and retention. | Migration dry-run and release candidate. |
| NFR | Validate performance, reliability, security, accessibility, observability. | Scheduled or pre-release based on risk. |
| UAT | Validate business workflow with user-language steps. | Before business sign-off. |

---

# Test Data Rules

- Use synthetic or masked data only. Do not use real customer PII unless explicitly approved.
- Include exact identifiers, role, workspace, team, status, timestamp, and channel values when relevant.
- For numeric fields, include min, max, below min, above max, zero/null/empty where relevant.
- For enum fields, include every valid enum and at least one invalid enum.
- For text fields, include empty, min length, max length, over max, special characters, and duplicate value where relevant.
- For date/time fields, include timezone, boundary day, past, future, DST/timezone-sensitive cases where relevant.
- For file/export tests, include supported format, unsupported format, max size, empty file, malformed file, and partial-valid rows where relevant.
- Define cleanup for created tickets, conversations, tags, users, exports, jobs, webhooks, and test files.

---

# Environment And Execution Rules

| Environment | Use For | Required Notes |
| ----- | ----- | ----- |
| Dev / Local | Unit, component, low-level API checks. | Fast feedback, not final sign-off. |
| Staging | Full QA, regression, integration, UAT rehearsal. | Must mirror production config as much as possible. |
| Staging Migration | Backfill, rollback, data validation. | Use copied/masked data shape when possible. |
| Production Canary | Smoke and monitoring only. | Feature flag controlled; no destructive tests. |
| Production Full | Post-release monitoring. | Validate telemetry, error rate, audit, and support signals. |
| Rollback Drill | Rollback validation. | Verify previous behavior and data safety. |

Execution entry criteria:

- PRD or patch is available.
- PRD analysis is available or minimal extraction is completed.
- Open questions affecting expected result are resolved or marked blocked.
- Environment, test data, roles, and feature flag state are available.
- Build/deployment version is known.

Execution exit criteria:

- P0 tests passed.
- P1 tests passed or accepted with documented risk.
- No unresolved Critical or High defects.
- Requirement coverage matrix has no untested launch-blocking requirement.
- Regression suite for impacted areas is complete.
- Evidence is attached for critical flows.
- Rollback or feature-flag disable path is validated when relevant.

---

# Contract, State, And Permission Test Rules

## API / Event / Webhook / Socket / Queue

- Validate request schema, response schema, error schema, required headers, auth, tenant isolation, idempotency, duplicate event handling, retry behavior, ordering, and backward compatibility.
- Validate event producer and consumer behavior when payload is missing optional fields, contains unknown fields, or arrives more than once.
- Validate report/export contracts do not reorder existing columns unless PRD explicitly requires it.

## State Transition

- Validate every allowed transition.
- Validate every forbidden transition.
- Validate concurrent transition attempts from two users or processes.
- Validate audit trail for mutation.
- Validate UI refresh/socket/polling after state changes.

## Permission Matrix

- Validate allowed actions for every impacted role.
- Validate denied actions are hidden, disabled, or blocked as specified.
- Validate server-side rejection for unauthorized mutation.
- Validate scope boundaries such as workspace, team, division, assigned user, and created-by-me where relevant.

---

# Defect Reporting Rules

Every defect must include:

- related TC-ID
- related requirement ID
- environment and build/version
- role/account used
- exact test data
- steps to reproduce
- actual result
- expected result
- evidence link or attachment reference
- severity and priority
- impact area
- suspected regression area if known

Severity definitions:

- `Critical`: data loss, security/privacy breach, production blocker, payment/message delivery/SLA critical failure.
- `High`: core flow broken, major regression, incorrect permission, incorrect status/data, no safe workaround.
- `Medium`: important path degraded, workaround exists, limited scope.
- `Low`: cosmetic, copy, minor usability issue with low risk.

---

# Automation Readiness Rules

Mark a test `Automation Ready` only when:

- precondition can be created through API, fixture, seed, or stable setup
- test data is deterministic
- expected result can be asserted automatically
- test is independent and can run in any order
- cleanup can be automated
- environment is stable enough for repeat execution
- no manual OTP, CAPTCHA, external approval, or human wait is required

Automation mapping format:

| TC-ID | Automation File | Test Class / Suite | Test Method | Framework | Status | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| TC-XXX-001 | <path> | <suite> | <method> | <framework> | Ready/Pending/Automated | <notes> |

---

# Forbidden

Do NOT:

- generate duplicate test cases for the same requirement and same condition
- invent expected behavior not defined by PRD, analysis, memory, or approved clarification
- test out-of-scope behavior as if it is required
- write vague steps or vague expected results
- rely on another test case execution order unless explicitly documented as a suite setup
- use production real PII as test data without approval
- delete existing tests silently
- change expected results for existing tests without linking the changed requirement
- mark tests automated-ready when data setup or assertions are not deterministic

---

# Quality Gate Checklist

Before finalizing QA tests, verify:

- [ ] PRD analysis source is referenced.
- [ ] Impact analysis source is referenced when regression is required.
- [ ] Requirement coverage matrix has no orphan requirement.
- [ ] Test cases have no orphan TC without source requirement or analysis finding.
- [ ] Every acceptance criterion has coverage.
- [ ] Every P0/P1 functional requirement has coverage.
- [ ] Error handling and edge cases have negative tests.
- [ ] State transition tests exist for stateful features.
- [ ] Permission tests exist for RBAC or visibility changes.
- [ ] API/event/contract tests exist for contract changes.
- [ ] Migration, rollout, rollback, and feature flag tests exist when relevant.
- [ ] Data lifecycle, retention, export, and audit tests exist when relevant.
- [ ] Regression tests cover HIGH/MEDIUM impact areas.
- [ ] Test data is specific and safe.
- [ ] Steps are executable and numbered.
- [ ] Expected results are exact and observable.
- [ ] Automation readiness is correctly marked.
- [ ] Execution entry and exit criteria are documented for release validation.
