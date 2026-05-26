# QA Analysis Rules

Purpose:
Define comprehensive analysis methodology for feature development, bug fixing, and interconnection scenarios. Ensures senior-level analytical depth beyond surface-level testing.

---

# Core Principles

QA analysis must evaluate not only feature correctness, but also:

- business objective alignment
- system impact and blast radius
- dependency and interconnection risk
- regression risk across modules
- data integrity and consistency
- operational stability and rollback safety
- production deployment risk

Senior QA mindset:

- Not: "does the feature work?"
- But: "what can break due to this change?"
- And: "is the system still stable after change?"

Always think:

- INPUT: where data comes from
- PROCESS: what logic changes
- OUTPUT: where result goes
- SIDE EFFECT: what else gets impacted
- FAILURE MODE: what happens on failure
- RECOVERY: how to rollback or retry

---

# Analysis Types

## Type 1: Feature Development Analysis

Execute when new feature is introduced.

### A. Business Understanding

Analyze:

- problem being solved
- target user persona
- expected outcome and success metric
- priority and urgency level
- business KPI (conversion, retention, efficiency)

### B. Requirement Analysis

Verify requirement is:

- clear and unambiguous
- testable with measurable criteria
- complete with all scenarios
- consistent across related features

Checklist:

- functional requirements: input, output, validation, business rules
- non-functional requirements: performance, security, concurrency, audit, logging
- clarification items: edge cases, boundary data, failure conditions, rollback behavior, dependency failure behavior

### C. PRD Extraction Rules

When source document is a PRD:

- Infer missing business logic if strongly implied by context
- Detect contradictions within and across PRDs
- Do NOT rewrite or paraphrase PRD verbatim
- Produce structured engineering understanding, not document summary
- Map every PRD statement to a testable condition or known gap

### D. State Transition Analysis

Map entity lifecycle from PRD:

- all possible statuses and states
- valid transitions between them
- trigger for each transition (user action, system event, cron, webhook)
- invalid transitions that must be prevented
- state-dependent behavior (what changes when status flips)

### E. Data Flow Analysis

Map data lineage for every changed entity:

- source: where data originates (user input, API, webhook, cron, queue, import, third-party)
- transformation: what logic alters the data (validation, calculation, enrichment, filtering, aggregation, masking)
- storage: where data is persisted (DB table, collection, cache, file, queue, event log)
- consumption: what reads the data (API response, report, dashboard, webhook, event consumer, export, analytics)
- deletion or archive: how data is removed or retired (soft delete, hard delete, TTL, archive job, retention policy)

For each hop in the flow, identify:
- format change (JSON, XML, protobuf, CSV, binary)
- protocol change (REST, gRPC, event, file transfer)
- sync vs async boundary
- failure mode per hop

## Type 2: Bug Fix Analysis

Execute when bug is reported.

### A. Root Cause Investigation

Identify root cause category:

- logic error
- missing validation
- race condition
- data inconsistency
- API contract mismatch
- state machine violation
- environment or configuration issue
- deployment regression

### B. Scope Identification

Determine bug scope:

- specific user role affected?
- specific environment affected?
- specific data condition triggers it?
- specific browser or device?
- specific timing or concurrency condition?

### C. Impact Assessment

Evaluate impact of fixing the bug:

- existing flow changes?
- data integrity risk (corruption, inconsistency)?
- API consumer affected (breaking change)?
- reporting or analytics affected?
- financial calculation changed?
- historical data affected?
- audit trail integrity?

### D. Regression Risk

Bug fix may introduce new issues in:

- adjacent module with shared logic
- module consuming same data
- same state machine transitions
- shared validation rules
- shared API responses

## Type 3: Interconnection Analysis

Execute when feature interacts with existing features.

### A. Dependency Mapping

Map all dependencies:

- direct dependency: feature A calls feature B API
- indirect dependency: feature A shares data with feature B
- async dependency: feature A publishes event consumed by feature B
- lifecycle dependency: feature A and B share entity state machine

### B. Dependency Matrix

Build matrix:

| Feature | Depends On | Dependency Type | Direction |
|---------|-----------|----------------|-----------|
| Checkout | Promo Service | API sync | A -> B |
| Checkout | Inventory | DB shared | A -> B |
| Checkout | Notification | Event async | A -> B |

### C. Event Mapping

For event-driven system:

| Event | Producer | Consumer(s) | Async Type |
|-------|----------|-------------|------------|
| Order Created | Checkout | Payment, Notification | Queue |
| Payment Success | Payment | Notification, Invoice | Queue |

### D. Shared Resource Impact

Identify shared resources:

- shared database tables or entities
- shared cache keys
- shared queue or message topic
- shared scheduler or cron job
- shared third-party integration

---

# Mandatory Impact Dimensions

For every analysis, evaluate ALL dimensions:

## 1. Module Impact

List all features and modules potentially affected.

## 2. Database Impact

- schema changes
- new fields or deprecated fields
- data migration requirements
- nullable vs mandatory field changes
- query performance impact (new indexes needed)
- historical data integrity

## 3. API Impact

- backward compatibility
- contract change (request/response)
- mandatory field changes
- versioning requirement
- consumer identification and impact

## 4. UI/UX Impact

- component changes
- responsive layout shifts
- accessibility compliance
- hidden or conditional UI flows
- validation behavior change
- permission-driven visibility

## 5. Security Impact

- authorization changes
- authentication requirement changes
- privilege escalation risk
- data exposure risk
- injection vulnerability
- rate limiting or throttle changes

## 6. Performance Impact

- query complexity increase
- added loops or iterations
- additional API calls
- latency increase
- cache effectiveness change
- memory or CPU usage change

## 7. Integration Impact

- third-party service dependency
- internal service dependency
- cron job or scheduled task impact
- queue or message broker impact
- webhook payload changes
- event-driven consumer impact

## 8. Reporting and Analytics Impact

- report data accuracy affected
- new fields needed in reports
- existing dashboard affected
- historical comparison broken
- export format changed

## 9. Financial and Compliance Impact

- calculation changes (tax, fee, discount)
- audit trail completeness
- regulatory compliance
- invoice or receipt changes
- reconciliation process affected

## 10. Concurrency Impact

- race condition: multiple operations writing or reading same data simultaneously
- deadlock: two or more processes waiting on each other's locks indefinitely
- lock contention: high-volume concurrent access degrading throughput
- stale data: read-after-write inconsistency without proper isolation level
- idempotency: repeated requests must produce same result without side effects
- retry storm: cascading retries from multiple clients amplifying load
- timeout: operation timeout threshold too low or too high under concurrency
- throttling: rate limit enforcement behavior when concurrent limit exceeded
- eventual consistency window: delay between write and read consistency
- distributed transaction: two-phase commit or saga failure scenarios

---

# Risk Analysis

Build risk matrix:

| Risk Scenario | Probability | Impact | Mitigation |
|--------------|------------|--------|------------|
| Double processing | High | Critical | Idempotency key |
| Data loss | Low | Critical | Backup, rollback |
| Timeout | Medium | High | Retry, timeout config |

Risk classification:

- CRITICAL: payment, auth, financial calculation, data loss
- HIGH: checkout, order, inventory, user data
- MEDIUM: dashboard, notification, reporting
- LOW: cosmetic UI, non-functional cosmetic

---

# Severity & Priority Classification

## Severity (User Impact)

| Level | Definition | Example |
|-------|-----------|---------|
| CRITICAL | Data loss, financial loss, security breach, core flow broken for ALL users | Cannot checkout, payment fails for all |
| HIGH | Major feature broken, limited workaround, significant user segment affected | Voucher not applied for specific promo |
| MEDIUM | Minor feature broken, acceptable workaround exists | Sorting order incorrect, data still accessible |
| LOW | Cosmetic, non-functional, no user-facing impact | Button alignment, log message typo |

## Priority (Business Urgency)

| Level | Definition | Action |
|-------|-----------|--------|
| P0 | Blocker — blocks release or causes production outage | Fix immediately, hotfix |
| P1 | Critical — significant user/business impact, no workaround | Fix within current sprint |
| P2 | Moderate — impact exists, acceptable workaround | Fix within next sprint |
| P3 | Low — cosmetic or enhancement | Fix when possible, backlog |

## Decision Matrix

| Severity | P0 | P1 | P2 | P3 |
|-----------|----|----|----|----|
| CRITICAL | Required | Required | - | - |
| HIGH | Required | Recommended | Required | - |
| MEDIUM | - | Recommended | Recommended | Optional |
| LOW | - | - | Optional | Optional |

---

# Test Strategy Output

Define:

### Functional Test Scope

- positive scenarios
- negative scenarios
- validation scenarios
- edge cases and boundary conditions

### Regression Test Scope

- adjacent module regression
- shared component regression
- shared service regression
- shared entity regression
- reusable logic regression
- full feature regression for critical flows

### Integration Test Scope

- API contract tests
- event consumer tests
- async flow tests
- third-party integration tests

### UAT Scenario Scope

- end-to-end user flow
- role-based scenario
- business process validation

### Smoke Test Scope

- critical business flow only
- must-pass scenarios for release

### Automation Candidate

- high-value repeatable scenarios
- critical regression scenarios
- data-driven validation scenarios

### Environment Strategy

Define what to validate in each environment:

| Environment | Scope | Purpose |
|-------------|-------|---------|
| Dev / Local | Unit, component, integration | Fast feedback for developer |
| Staging | Full regression, integration, UAT | Gate before production |
| Staging (data migration) | Migration dry-run, rollback test | Verify schema and data changes |
| Production (canary) | Smoke test, monitored rollout | Validate with real traffic, feature flag controlled |
| Production (full) | Post-release monitoring, alert validation | Confirm stability after full rollout |
| Rollback drill | Rollback script execution | Verify rollback restores previous state without data loss |

---

# Test Specification Layer

Jembatan antara analysis output dan script generation. Setiap temuan analisa harus di-breakdown ke format yang langsung bisa diimplementasikan sebagai test script.

## 1. Test Case Format

Setiap test case WAJIB memiliki struktur berikut:

| Field | Wajib | Deskripsi |
|-------|-------|-----------|
| **TC-ID** | Yes | `TC-{FEATURE}-{NNN}`. Feature prefix unik per modul |
| **Feature** | Yes | Nama fitur dari analisa |
| **Req ID** | Yes | Req ID dari traceability matrix |
| **Level** | Yes | Unit / Integration / E2E / UI |
| **Priority** | Yes | P0 / P1 / P2 / P3 — mengacu decision matrix Severity & Priority |
| **Precondition** | Yes | State sistem yang harus terpenuhi sebelum test |
| **Test Data** | Yes | Data spesifik yang digunakan (value, kombinasi, kondisi) |
| **Steps** | Yes | Langkah konkret, numbered, tanpa ambigu |
| **Expected Result** | Yes | Assertion eksak — bukan "harus berhasil" tapi nilai pasti |
| **Postcondition** | No | Cleanup yang diperlukan (delete data, reset state) |
| **Automation ID** | No | File path + class + method jika sudah di-automate |

Contoh:

| Field | Value |
|-------|-------|
| TC-ID | TC-CHECKOUT-001 |
| Feature | Auto Apply Voucher |
| Req ID | FR-01 |
| Level | Integration |
| Priority | P0 |
| Precondition | User login, cart berisi 3 item total Rp150.000 |
| Test Data | Voucher PROMO50: min belanja Rp100.000, diskon 50% |
| Steps | 1. POST /api/v1/checkout dengan cart_id valid tanpa kirim voucher_code 2. Verifikasi response 200 3. Verifikasi discount = 75.000 4. Verifikasi final_amount = 75.000 |
| Expected Result | Voucher auto-applied, discount Rp75.000, final_amount Rp75.000 |
| Postcondition | Hapus order test, restore voucher quota |
| Automation ID | test_checkout.py::TestCheckout::test_auto_apply_voucher |

## 2. Test Data Specification

Untuk setiap input dan kondisi boundary, tentukan data spesifik:

### Boundary Value Analysis — Wajib per field numerik

| Field | Class | Value | Expected |
|-------|-------|-------|----------|
| `voucher.min_purchase` | Valid min | 100.000 | Voucher applied |
| `voucher.min_purchase` | Valid typical | 500.000 | Voucher applied |
| `voucher.min_purchase` | Invalid below min | 99.999 | Voucher rejected |
| `voucher.discount` | Valid min | 1% | Applied |
| `voucher.discount` | Valid max | 100% | Applied |
| `voucher.discount` | Invalid | 0% | Rejected |
| `voucher.discount` | Invalid | 101% | Rejected |
| `cart.item_count` | Valid max | 99 | Applied |
| `cart.item_count` | Invalid | 100 | Rejected |

### Equivalence Partitioning — Wajib per field enum/kategori

| Partition | Valid Values | Invalid Values |
|-----------|-------------|----------------|
| Voucher status | ACTIVE | EXPIRED, USED, REVOKED, DELETED |
| Payment method | BANK_TRANSFER, E_WALLET, COD | EMPTY, INVALID |
| User tier | REGULAR, LOYALTY, PREMIUM | null, DELETED |
| Cart state | HAS_ITEMS, MIN_MET | EMPTY, MIN_NOT_MET, MAX_EXCEEDED |

### State Requirements

Entity state yang harus ada sebelum test dijalankan:

| Entity | State | Test Case | Data Setup |
|--------|-------|-----------|------------|
| Voucher | ACTIVE | TC-CHECKOUT-001 | Create voucher with future expiry |
| Voucher | EXPIRED | TC-CHECKOUT-002 | Create voucher with past expiry |
| Voucher | USED | TC-CHECKOUT-003 | Create voucher, use once |
| Cart | HAS_ITEMS | TC-CHECKOUT-001 | Add 3 products to cart |
| Cart | EMPTY | TC-CHECKOUT-004 | No items in cart |
| User | LOGGED_IN | TC-CHECKOUT-001 | Auth token valid |
| User | GUEST | TC-CHECKOUT-005 | No auth token |

## 3. API / Contract Specification

Untuk setiap endpoint terdampak, dokumentasikan:

### Endpoint Template

```
{METHOD} {path}
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/json

Request Body:
{
  "field": "<type: format, constraint>"
}

Response 200:
{
  "field": "<type>"
}

Error Responses:
- 400: {"code": "<ERROR_CODE>", "message": "<string>"}
- 401: {"code": "UNAUTHORIZED"}
- 403: {"code": "FORBIDDEN"}
- 409: {"code": "<CONFLICT_CODE>"}
```

Contoh konkret:

**POST /api/v1/checkout**

```
Request:
{
  "cart_id": "string (uuid)",
  "payment_method": "string (enum: BANK_TRANSFER, E_WALLET, COD)",
  "voucher_code": "string (nullable, jika auto-apply = null)"
}

Response 200:
{
  "order_id": "uuid",
  "total": "number",
  "discount": "number",
  "final_amount": "number"
}

Error 400:
- {"code": "VOUCHER_EXPIRED", "message": "Voucher sudah tidak berlaku"}
- {"code": "MIN_PURCHASE_NOT_MET", "message": "Minimal belanja Rp100.000"}
- {"code": "CART_EMPTY", "message": "Cart kosong"}

Error 401:
- {"code": "UNAUTHORIZED"}
```

## 4. Scenario-to-Automation Mapping

Setiap test case WAJIB di-map ke file automation:

| TC-ID | Automation File | Test Class | Test Method | Framework | Status |
|-------|----------------|------------|-------------|-----------|--------|
| TC-CHECKOUT-001 | test_checkout.py | TestCheckout | test_auto_apply_valid_voucher | pytest | Automated |
| TC-CHECKOUT-002 | test_checkout.py | TestCheckout | test_auto_apply_expired_voucher | pytest | Automated |
| TC-CHECKOUT-003 | test_checkout.py | TestCheckout | test_auto_apply_used_voucher | pytest | Pending |
| TC-CHECKOUT-004 | api_test.go | CheckoutSuite | TestAutoApplyEmptyCart | go test | Not Started |

Status values: `Automated`, `Pending`, `Not Started`, `Blocked`, `Flaky`

## 5. Test Suite Organization

Test case WAJIB dikelompokkan dalam suite terstruktur:

```
Feature: {Feature Name}
├── P0 — Smoke (critical path, gate)
│   ├── TC-{FEATURE}-001
│   ├── TC-{FEATURE}-003
│   └── TC-{FEATURE}-005
├── P1 — Regression (core behavior)
│   ├── TC-{FEATURE}-002
│   ├── TC-{FEATURE}-004
│   ├── TC-{FEATURE}-006
│   └── TC-{FEATURE}-010
├── P2 — Edge Cases (boundary, concurrency)
│   ├── TC-{FEATURE}-011
│   └── TC-{FEATURE}-020
└── P3 — Negative & Error Handling
│   ├── TC-{FEATURE}-021
│   └── TC-{FEATURE}-030
```

Setiap suite memiliki execution trigger:
- **Smoke (P0):** Dijalankan otomatis di setiap commit / merge ke staging
- **Regression (P1):** Dijalankan otomatis setiap release candidate
- **Edge + Negative (P2, P3):** Dijalankan scheduled ( nightly / weekly )

## 6. Automation Readiness Checklist

Sebelum test case dianggap siap automate, verifikasi:

- [ ] Precondition dapat disiapkan via API atau seed data (tidak perlu manual)
- [ ] Test data dapat diprogram (hardcoded atau fixture)
- [ ] Expected result dapat di-assert secara deterministic
- [ ] Tidak ada dependency ke test case lain (independent)
- [ ] Tidak membutuhkan input manusia di tengah eksekusi
- [ ] Environment untuk eksekusi tersedia (staging / sandbox)
- [ ] Test data cleanup otomatis (teardown)

Jika semua checklist terpenuhi → status `Automated Ready`.
Jika ada satu saja tidak terpenuhi → `Manual Only` — dokumentasikan blocking reason.

---

# Output Document Structure

Every QA analysis MUST produce structured output:

## 1. Overview

Feature name, objective, scope, business context.

## 2. Requirement Summary

Business rules, acceptance criteria, assumptions, open clarifications.

## 3. Flow Analysis

Current flow (as-is) vs proposed flow (to-be). Include diagrams when possible: flowchart, sequence diagram, state transition.

## 4. Impact Analysis

For each impact dimension (Module, DB, API, UI, Security, Performance, Integration, Reporting, Financial), list:

- what changes
- what is affected
- impact level (LOW / MEDIUM / HIGH)
- mitigation if HIGH

## 5. Dependency Analysis

- dependency matrix
- event mapping
- shared resource identification

## 6. Risk Analysis

- risk matrix
- worst-case scenarios
- mitigation plan

## 7. Test Strategy

- functional test scope
- regression test scope
- integration test scope
- UAT scenarios
- smoke test scope
- automation candidates

## 8. Production Safety

- rollback strategy
- feature toggle requirement
- backward compatibility notes
- staged rollout recommendation
- monitoring and alerting needs
- logging and audit gaps

## 9. Open Questions

List all ambiguities, assumptions, and clarifications needed.

## 10. Recommendation

Summary of key findings, critical risks, and go/no-go assessment.

## 11. Traceability Matrix

Maintain end-to-end traceability chain:

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | Auto-apply voucher on checkout | Logic: check eligible vouchers first | Cart, Promo | TC-CART-001 | Pass |
| NFR-01 | Response < 500ms | New DB query may exceed threshold | Performance | TC-PERF-001 | Pending |

This ensures:
- every requirement is testable and tested
- no orphan requirement (coded but not analyzed)
- no orphan test case (tested but no requirement)
- coverage gaps are visible immediately

---

# Bug Fix Analysis Output

Separate but structured output for bug scenarios:

## Root Cause

Category and specific cause identified.

## Affected Modules

Directly and indirectly affected features.

## Data Integrity Risk

Any data corruption or inconsistency risk.

## Regression Scope

Areas requiring regression validation after fix.

## Backward Compatibility

Contract or behavior change risk.

## Production Risk

Deployment risk, rollback complexity, monitoring needs.

## Validation Strategy

How to validate fix safely (staging, canary, feature flag).

## Rollback Test Scope

What must be verified if rollback occurs:

- [ ] rollback script executes without error
- [ ] schema revert completes (no orphan columns, no data type mismatch)
- [ ] data integrity: no orphaned records, no inconsistent state post-rollback
- [ ] API backward compatibility: clients can still call pre-change endpoints
- [ ] queue or cron: no duplicate or missed processing after rollback
- [ ] feature flag off: previously released features still function correctly
- [ ] monitoring: rollback detected and alerted correctly
- [ ] business continuity: no financial or data loss during rollback window

---

# Framework Thinking Checklist

Before finalizing any analysis, verify:

- [ ] Business objective understood
- [ ] All requirements analyzed (functional + non-functional)
- [ ] Current vs proposed flow compared
- [ ] All impact dimensions evaluated
- [ ] Dependencies mapped (direct, indirect, async, shared)
- [ ] Risk matrix completed
- [ ] Regression scope identified
- [ ] Production safety assessed
- [ ] Edge cases documented
- [ ] Open questions captured
- [ ] Recommendation stated

---

# Entry & Exit Criteria

## Entry Criteria (Analysis Ready)

Before starting analysis, confirm:

- [ ] PRD, feature spec, or bug report is available and reviewed
- [ ] acceptance criteria or expected behavior defined
- [ ] related PRDs, features, or dependencies identified
- [ ] stakeholders and SMEs identified
- [ ] environment or test data access confirmed (if needed)

If any criterion is unmet, document as assumption or open question and proceed with best available information.

## Exit Criteria (Analysis Complete)

Analysis is complete only when:

- [ ] all applicable impact dimensions evaluated
- [ ] risk matrix completed with mitigation plan
- [ ] regression scope explicitly identified
- [ ] dependencies mapped (direct, indirect, async, shared)
- [ ] edge cases and failure scenarios documented
- [ ] all open questions captured
- [ ] recommendation stated (go / conditional go / no-go)
- [ ] traceability matrix populated (at minimum: req → finding → test case)
- [ ] production safety assessed (rollback, feature toggle, monitoring)

---

# Prohibited Patterns

Do NOT:

- analyze features in isolation without dependency check
- skip regression analysis for any code change
- assume backward compatibility without verification
- produce test cases without impact analysis
- ignore non-functional requirements (performance, security)
- skip rollback or recovery analysis for critical changes
- leave assumptions undocumented

---

# When to Execute

This rule MUST execute when:

- new PRD or feature specification introduced
- existing feature behavior modified
- bug fix with potential side effects
- feature interacts with shared entities, lifecycle, or RBAC
- migration, deprecation, or removal of existing behavior

This rule MAY skip for:

- pure UI copy or cosmetic changes
- bug fix with zero behavioral change (e.g. log level adjustment)
- internal refactor with no contract change
