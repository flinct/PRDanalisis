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

If the requested output must be written into a manual TSV file that follows `SatuInbox Test Case Scenario V2`, use the Manual TSV Output Mode section in this file. This file remains the canonical rule for analysis depth, coverage, step quality, execution discipline, and final TSV shape.

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

# Relationship With Manual TSV Output

When the user asks for a SatuInbox manual test case TSV, use this split:

- `Rules/qa-analysis-rule.md` for requirement extraction, risk, impact, and traceability
- `Rules/test-case-rule.md` for coverage rules, test data discipline, step writing quality, and execution support
- the Manual TSV Output Mode section in `Rules/test-case-rule.md` for the final TSV block structure and field naming

Do not force generic QA metadata into the TSV when the template does not provide a field for it. Keep the TSV structurally compatible with the existing files.

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

---

# Manual TSV Output Mode

Use this mode when the user asks to:

- create or update `.tsv` test case files
- follow `SatuInbox Test Case Scenario V2`
- fill manual test case templates per module
- produce environment-based execution tracking in existing TSV files

This mode is for manual TSV output only. It does not replace the general QA rigor in the rest of this file.

## TSV Output Principles

Every manual TSV test case must:

- follow the existing template structure exactly
- stay readable for testers and reviewers
- contain short, executable, repeatable steps
- contain observable expected results
- stay consistent with existing module files

## TSV Output vs Generic QA Fields

Map generic QA fields to TSV as follows:

| Generic QA Field | TSV Field |
| ----- | ----- |
| `TC-ID` | `Test ID` |
| `Precondition` | `Pre-Condition` |
| `Steps` | `Steps` |
| `Expected Result` | `Expected Result` |
| Environment / execution status | `ENV` and per-environment status columns |

The following generic QA metadata must not be forced into the TSV if the template does not provide an explicit field:

- `Req ID`
- `Level`
- `Priority`
- `Test Data`
- `Postcondition`
- `Automation Status`

If the user asks for traceability, priority, test data, or automation mapping, provide them in a supporting document or in another requested format, not by breaking the TSV structure.

## TSV File Structure

A manual TSV file contains two main parts:

1. Summary section at the top.
2. Repeated test case blocks.

### Summary Section Rules

Preserve the existing template layout.

- `total cases =` must contain the total number of test cases in the file.
- Environment labels must remain `DEV`, `STAGGING`, and `PROD` to stay compatible with the existing template.
- Each environment summary uses:
  - `Passed`
  - `Failed`
  - `Need to test`
  - `On test`
  - `No Status`
- Summary counts must match the actual case statuses in the file.

### Test Case Block Structure

Each test case block must keep this field order:

1. `Test ID`
2. `Create at`
3. `created by`
4. `Tester`
5. `Scenario`
6. `Pre-Condition`
7. `DATE`
8. `Url`
9. `Description`
10. `ENV`
11. `Steps`
12. `test type`
13. `Status Response`
14. `Expected Result`
15. `Actual Result`
16. `Status`

Do not change field order, labels, or block layout.

## TSV Field Writing Rules

### `Test ID`

- Must be unique within the file.
- Use a stable module prefix.
- Recommended format:

```text
SIX-<MODULE>-001
SIX-<MODULE>-002
SIX-<MODULE>-003
```

Examples:

- `SIX-AUTH-001`
- `SIX-TICKET-001`
- `SIX-SETTING-001`

If an existing file already uses another stable pattern such as `SIX-Test-001`, keep that pattern consistent within the file instead of mixing formats.

### `Create at`

- Fill with test case creation date.
- Use one consistent date format per file.
- Safe existing format: `DD/MM/YYYY`.

### `created by`

- Fill with the author name.
- Use one consistent author naming style.

### `Tester`

- Fill when a tester is assigned.
- May stay empty when no PIC is assigned yet.

### `Scenario`

- Write one short and specific validation target.
- One test case should validate one main objective.
- Do not combine multiple unrelated rules in one scenario.

Good patterns:

- `Register with valid fullname, email, username, phone, password`
- `Verify fullname validation`
- `Duplicate email`

### `Pre-Condition`

- Describe the required starting state.
- Keep it factual, not procedural.
- Leave empty if there is no special setup.

Good examples:

- `Existing email in DB`
- `existing username in DB`
- `User already logged in as Admin`

Bad examples:

- `Open register page`
- `Click submit`

### `DATE`

- Fill with execution date when the test has been run.
- May stay empty if not executed yet.
- Use the same date format as `Create at`.

### `Url`

- Fill with the main page, domain, or endpoint under test.
- Keep it short and relevant.

Examples:

- `dev-v2.satuinbox.com`
- `/auth/register`
- `/settings/team-member`

For UI testing, use the relevant domain or page.
For API testing, use the relevant endpoint.

### `Description`

- Explain the objective in one sentence.
- Focus on the behavior being verified.
- Prefer patterns such as `Verify ...` or `Try ...`.

Examples:

- `Verify user can register successfully with valid input`
- `Try input fullname with <3 characters`
- `Verify system rejects duplicate email`

`Description` must stay consistent with `Scenario`, `test type`, and the expected results.

### `ENV`

- Keep the environment columns as `DEV`, `Staging`, and `Prod`.
- Fill status in the corresponding environment status cells.

### `Steps`

- Steps must be ordered and repeatable.
- Start each step with an action verb.
- Write one main action per step.
- Include exact input values when relevant.
- Add DB validation as a separate step only when needed.

Good examples:

1. `Open register page`
2. `Input fullname "John Doe"`
3. `Click Register`

Bad examples:

1. `Testing registration`
2. `Do the process`

If one scenario needs too many steps because it covers several different validations, split it into multiple test cases.

### `test type`

- Must be `POSITIVE` or `NEGATIVE`.
- Use `POSITIVE` for accepted or success behavior.
- Use `NEGATIVE` for invalid input, permission denial, duplicates, limits, and error handling.

### `Status Response` / `Expected Result`

Use this area as the list of observable checkpoints.

- Each row should represent one verification point.
- Write outcome statements, not instructions.
- Keep each expected result singular when possible.
- Expected results must align with `Description` and `Steps`.

Good examples:

- `Register Failed`
- `System will display Error: "invalid email format"`
- `System must not sent verification email`

Bad examples:

- `Check error`
- `Make sure it works`

Use observable outcomes such as:

- UI state change
- API response
- error message
- data change
- relevant event or side effect

### `Actual Result`

- Fill with the factual execution result.
- Leave empty if not tested yet.
- Keep it short and specific.

Examples:

- `no email services`
- `system returning error Nama pengguna hanya boleh berisi huruf kecil dan angka`
- `redirected to dashboard`

### `Status`

Use one consistent status vocabulary.

Existing values in current files:

- `Passed`
- `Failed`
- `Need to Test`
- `On Test`
- `No Status`

Usage:

- `Passed`: actual result matches expected result
- `Failed`: actual result does not match expected result
- `Need to Test`: not started
- `On Test`: in progress or not finalized yet
- `No Status`: only when the template or process still needs it

For per-case header summary values, keep uppercase if the existing file already uses it, for example:

- `PASSED`
- `FAILED`
- `NEED TO TEST`
- `ON TEST`

## TSV Granularity Rules

Split into separate test cases when:

- the validation rule is different
- the main expected result is different
- the precondition is materially different
- the test type changes between positive and negative

Good split examples:

- fullname below minimum length = one test case
- fullname above maximum length = one test case
- fullname contains numbers = one test case

Do not merge all such validations into one test case.

## TSV Language Rules

- Use one primary language within the file.
- Existing examples mostly use simple English for steps and descriptions.
- System terms and error messages may follow the actual product language.
- Avoid unnecessary mixed-language sentences.
- Keep sentences short and direct.

## TSV Quality Checklist

Every manual TSV test case should satisfy this checklist:

- clear objective
- specific input or condition
- repeatable steps
- observable expected result
- unambiguous per-environment status

Avoid:

- overly generic scenarios
- jumpy or incomplete steps
- unverifiable expected results
- one test case covering many objectives
- inconsistent status naming

## TSV Consistency Notes

- Keep the template structure intact.
- Keep step numbering sequential.
- Keep status naming consistent across the file.
- Update `total cases` and the top summary after adding or changing test cases.
- Prefer one module-specific `Test ID` prefix per file.
