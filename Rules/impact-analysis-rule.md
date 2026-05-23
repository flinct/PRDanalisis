# Impact Analysis Rules

Purpose:
Identify blast radius when feature created, updated, or removed.

---

# Focus Areas

Analyze each area:

- Direct impact: modules explicitly changed.
- Indirect impact: modules consuming or depending on changed modules.
- Hidden dependencies: shared entities, lifecycle, or state machines not obvious from PRD.
- Data consistency: schema changes, field deprecation, data migration integrity.
- Synchronization risks: race conditions, eventual consistency guarantees, event ordering.
- Backward compatibility: API contract, webhook payload, stored data format.
- Performance implications: query pattern changes, new indexes needed, N+1 risks.
- Operational flow disruption: agent workflow changes, queue behavior impact.
- Automation test impact: existing test cases requiring update or addition.
- Monitoring and logging implications: new metrics, alerts, audit log gaps.

---

# Impact Dimensions

Analyze each dimension:

- Feature behavior: existing features sharing same entity, status, or lifecycle.
- Data model: schema changes, new fields, deprecated fields.
- API: new or modified endpoints, request or response contract changes.
- UI/UX: component changes, layout shifts, permission-driven visibility.
- RBAC: new roles, changed permissions, visibility scope changes.
- State machine: new statuses, removed statuses, transition changes.
- Notification: new triggers, changed recipients, deduplication rules.
- Integration: webhook payload changes, event changes, sync behavior.
- Migration: backward compatibility, data backfill, rollback plan.

---

# Detection Method

1. Read PRD or change specification.
2. Compare against current global memory and feature memories.
3. For each focus area and dimension, list affected features explicitly.
4. Trace chain reactions beyond explicitly mentioned modules.
5. Mark impact level: LOW, MEDIUM, or HIGH.
6. For HIGH impacts, describe mitigation or required comparison analysis.

---

# When to Use

Impact analysis MUST run when:

- New PRD introduces new feature.
- Existing feature modified.
- Feature affects shared entities, lifecycle, or RBAC.
- Migration required.

Impact analysis MAY skip for:

- Pure UI copy changes.
- Bug fixes with no behavioral change.
- Performance optimization with no contract change.

---

# Output Format

## Directly Affected Modules

Modules explicitly changed.

## Indirectly Affected Modules

Modules depending on or consuming changed modules.

## Database Impact

Schema changes, new fields, deprecated fields, migration plan.

## API Contract Impact

New or modified endpoints, request/response changes, deprecation notes.

## Frontend Impact

Component changes, layout shifts, permission-driven visibility.

## Automation Testing Impact

Existing tests to update, new tests needed, regression scope.

## Security / RBAC Impact

New roles, changed permissions, visibility scope changes.

## Performance Risks

New query patterns, index requirements, N+1 risks, latency impact.

## Concurrency Risks

Race conditions, lock contention, eventual consistency gaps.

## Regression Scope

Features requiring full regression validation.

## Migration / Deployment Risks

Backward compatibility, rollback plan, feature flag strategy.

## Recommended Additional Validations

Specific edge cases or integration scenarios beyond standard test coverage.

---

# Impact Level

Mark every finding:

- LOW: isolated, no downstream effect.
- MEDIUM: affects one or two related modules.
- HIGH: affects multiple modules, requires migration, or changes shared behavior.

For HIGH impacts, always describe mitigation.
