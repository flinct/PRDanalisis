# Impact Analysis Rules

Purpose:
Identify the blast radius when a feature is created, updated, or removed.

---

# Focus Areas

Analyze each area:

- Direct impact: modules explicitly changed.
- Indirect impact: modules that consume or depend on changed modules.
- Hidden dependencies: shared entities, lifecycle, or state machines not obvious from the PRD.
- Data consistency: schema changes, field deprecation, data migration integrity.
- Synchronization risks: race conditions, eventual consistency guarantees, event ordering.
- Backward compatibility: API contract, webhook payload, stored data format.
- Performance implications: query pattern changes, new indexes needed, N+1 risks.
- Operational flow disruption: agent workflow changes, queue behavior impact.
- Automation test impact: existing test cases that must be updated or added.
- Monitoring and logging implications: new metrics, alerts, audit log gaps.

---

# Impact Dimensions

Analyze each dimension:

- Feature behavior: which existing features share the same entity, status, or lifecycle.
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

1. Read the PRD or change specification.
2. Compare against current global memory and feature memories.
3. For each focus area and dimension, list affected features explicitly.
4. Trace chain reactions beyond explicitly mentioned modules.
5. Mark impact level as LOW, MEDIUM, or HIGH.
6. For HIGH impacts, describe mitigation or required comparison analysis.

---

# When to Use

Impact analysis MUST be performed when:

- A new PRD introduces a new feature.
- An existing feature is modified.
- A feature affects shared entities, lifecycle, or RBAC.
- A migration is required.

Impact analysis MAY be skipped for:

- Pure UI copy changes.
- Bug fixes with no behavioral change.
- Performance optimization with no contract change.

---

# Output Format

## Directly Affected Modules

Modules explicitly changed by this feature.

## Indirectly Affected Modules

Modules that depend on or consume changed modules.

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

Specific edge cases or integration scenarios to verify beyond standard test coverage.

---

# Impact Level

Every finding MUST be marked as:

- LOW: isolated, no downstream effect.
- MEDIUM: affects one or two related modules.
- HIGH: affects multiple modules, requires migration, or changes shared behavior.

For HIGH impacts, always describe mitigation.
