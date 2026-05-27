# PRD Writing Rules

Purpose:
Define the standard framework for writing Product Requirement Document (PRD) files in this repo. This rule is derived from the current source-of-truth PRDs in `PRD/Conversationv2/` and `PRD/ticketv2/`.

---

# When To Use

Use this rule when the user asks to:

- buat PRD
- tulis PRD
- draft PRD
- create PRD
- write PRD
- bikin requirement produk
- membuat PRD baru
- update PRD with a structured patch or addendum

Do not use this rule for PRD analysis output. For analysis, use `Rules/qa-analysis-rule.md`.

---

# Source Pattern

Canonical reference:

- Conversation V2: `PRD/Conversationv2/`
- Ticket V2: `PRD/ticketv2/`

Deprecated reference:

- Conversation V1: `PRD/Conversation/`
- Ticket V1: `PRD/Ticket/`

V1 files may be used only as historical context. New PRDs must follow the V2-style structure.

Observed V2 pattern:

- PRD is written as an implementation-ready product specification, not a narrative document.
- Requirements are grouped by behavior category.
- User stories use priority `P0`, `P1`, `P2`.
- Acceptance criteria use numbered Given/When/Then statements.
- Functional requirements use stable IDs such as `FR-001`.
- Error handling uses stable IDs such as `EH-001`.
- Edge cases use stable IDs such as `EC-001`.
- UI-facing copy is usually Bahasa Indonesia.
- Scope boundaries are explicit through In Scope and Out of Scope.
- Risks, dependencies, limitations, and future considerations are always documented.

---

# Core Principles

PRD must be:

- testable by QA
- implementable by Engineering
- reviewable by Product, Design, and Support
- explicit about scope and non-scope
- explicit about permissions, data, state, errors, and side effects
- clear about what changes and what must not change

Avoid:

- vague words without measurable criteria, such as "fast", "easy", "better", unless paired with a target
- unnumbered requirements
- duplicate section numbering
- mixing future roadmap into Phase 1 requirements
- hiding open questions as if they were decided
- changing canonical behavior from `Memory/global-memory.md` without flagging conflict

---

# Writing Workflow

Before writing a PRD:

1. Read `Memory/global-memory.md`.
2. Read relevant feature memory from `Memory/` when available.
3. Read existing V2 PRDs in the same domain.
4. Identify related domains that may be impacted, especially Conversation, Ticket, SLA, Contact, Analytics, Broadcast, WhatsApp Web, RBAC, and Reports.
5. Define Phase 1 scope before writing detailed requirements.
6. If information is missing, write it as an assumption or open question in Appendix. Do not silently invent critical business rules.

For Conversation or Ticket PRDs:

- Use `PRD/Conversationv2/` and `PRD/ticketv2/` as source of truth.
- Check `Memory/global-memory.md` for canonical lifecycle, status, SLA, RBAC, and source-of-truth notes.
- If the PRD touches SLA, assignment, reopen, grouping, linked conversation, linked ticket, export, or reports, explicitly document impact and limitations.

---

# Feature Complexity Classification

Classify the feature before choosing the PRD mode.

| Mode | Use When | Do Not Use When |
| ----- | ----- | ----- |
| Lite PRD | Small change with <= 3 FR, no DB change, no API change, no integration, no RBAC impact, no state transition, no migration, no report/export change. | Any behavior can affect stored data, permissions, lifecycle, SLA, API/event, or existing user flow. |
| Standard PRD | Normal product feature with multiple requirements, UI flow, validation, error handling, edge cases, and feature-local dependencies. | Feature affects multiple modules, persisted contracts, lifecycle, migration, or production rollout complexity. |
| Full PRD | Stateful, cross-module, data-heavy, enterprise, or high-risk feature. Required for Conversation, Ticket, SLA, merge, assignment, reopen, report/export, API/event, RBAC, migration, retention, or feature flag rollout. | Only use Lite or Standard if all Full triggers are absent. |
| Patch / Addendum | Existing PRD needs a scoped clarification or extension. | Patch changes more than 30 percent of the PRD or changes the core feature model. Rewrite instead. |

If unsure, choose Standard PRD. If the feature touches Conversation, Ticket, SLA, RBAC, API/event, report/export, retention, or migration, choose Full PRD unless the change is explicitly cosmetic.

---

# Mandatory vs Conditional Sections

| Section | Lite | Standard | Full |
| ----- | ----- | ----- | ----- |
| Metadata and Revision History | Mandatory | Mandatory | Mandatory |
| Overview and Scope | Mandatory | Mandatory | Mandatory |
| Problem Statement | Optional | Mandatory | Mandatory |
| Objectives and Key Results | Optional | Mandatory | Mandatory |
| User Stories and Acceptance Criteria | Mandatory | Mandatory | Mandatory |
| Functional Requirements | Mandatory | Mandatory | Mandatory |
| Error Handling | Conditional | Mandatory | Mandatory |
| Edge Cases | Conditional | Mandatory | Mandatory |
| UI & UX Requirements | Conditional | Mandatory for UI changes | Mandatory for UI changes |
| Field & Validation | Conditional | Mandatory for data/input changes | Mandatory |
| Non-Functional Requirements | Optional | Mandatory | Mandatory |
| Dependencies & Risks | Optional | Mandatory | Mandatory |
| Success Metrics | Optional | Mandatory | Mandatory |
| Future Considerations | Optional | Mandatory | Mandatory |
| Limitations | Mandatory | Mandatory | Mandatory |
| Appendix | Conditional | Mandatory | Mandatory |
| State Transition Model | Not allowed | Conditional | Mandatory for stateful features |
| Permission Matrix | Not allowed | Conditional | Mandatory for RBAC/visibility changes |
| API / Event Contract | Not allowed | Conditional | Mandatory for API/event/webhook/socket/queue changes |
| Migration & Rollout Plan | Not allowed | Conditional | Mandatory for existing behavior or data changes |
| Data Lifecycle & Retention | Not allowed | Conditional | Mandatory for persisted data, PII, export, attachment, or audit log |
| Analytics & Observability Plan | Optional | Conditional | Mandatory for production-sensitive features |
| Concurrency, Rate Limit & Idempotency | Not allowed | Conditional | Mandatory for high-volume or retryable actions |

Conditional means include the section when the trigger exists. Do not add empty ceremonial sections.

---

# Lite PRD Template

Use Lite PRD only for small, low-risk changes.

```md
# **LITE PRODUCT REQUIREMENT DOCUMENT**

**Feature**: <Feature name>
**Owner**: <Name or TBD>
**Version**: v1.0

## **1. Summary**

| Item | Description |
| ----- | ----- |
| Purpose | <Why this small change exists.> |
| Scope | <What changes.> |
| Non-Scope | <What explicitly does not change.> |

## **2. Requirements**

| ID | Priority | Requirement | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| FR-001 | P0 | System MUST <testable behavior>. | 1. Given <context>, When <action>, Then <result>. |

## **3. UI / Copy / Validation**

| Area | Change | Expected Behavior |
| ----- | ----- | ----- |
| <Screen/component> | <Copy/UI/validation change.> | <Expected visible behavior.> |

## **4. Error, Edge, and Regression Notes**

| Type | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| Error | <If relevant.> | <Expected behavior.> |
| Edge | <If relevant.> | <Expected behavior.> |
| Regression | <Existing behavior that must not change.> | <Expected behavior.> |

## **5. Limitations / Assumptions**

| Item | Notes |
| ----- | ----- |
| Limitation | <Known limitation.> |
| Assumption | <Assumption if any.> |
```

Lite PRD rules:

- Maximum 3 functional requirements.
- No new stored field, database migration, API contract, event payload, RBAC rule, report/export column, state transition, or integration change.
- If any prohibited item appears while writing, stop using Lite PRD and convert to Standard or Full PRD.

---

# Standard PRD Template

Use this structure for new PRDs.

```md
# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: <Feature name>
**Product Manager**: <Name>
**Engineering Lead**: <Name or TBD>
**Design Lead**: <Name or TBD>

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | YYYY-MM-DD | <Author> | Initial PRD for <feature summary>. |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | <Why this feature exists.> |
| Scope | <Phase 1 scope summary.> |
| Key Capabilities | <Main capabilities delivered.> |
| Outcome | <Expected business or operational outcome.> |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| <Included behavior> | <Explicitly excluded behavior> |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | <Current pain or gap.> | <Business or user impact.> |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| <Objective> | <Measurable target.> |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a <role>, I want <capability> so that <outcome>. | 1. Given <context>, When <action>, Then <result>. 2. Given <context>, When <condition>, Then <result>. |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| <Behavior category> | FR-001 [P0]: System MUST <testable behavior>. FR-002 [P0]: System MUST NOT <explicit non-behavior>. |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | <System behavior on error.> | <User-facing state or copy.> |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | <Boundary or uncommon scenario.> | <Expected system behavior.> | <User-facing behavior.> |

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| <Component> | <What appears.> | <How user uses it.> | US-001 |

## **10. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| <field_name> | <Type> | <Example> | <Rule> | Yes/No/Conditional/Derived | <Default or empty> |

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | <Measurable performance requirement.> |
| Reliability | <Idempotency, retry, recovery, or consistency requirement.> |
| Security | <RBAC, tenant isolation, or permission requirement.> |
| Privacy | <Data exposure or masking requirement.> |
| Observability | <Logs, metrics, trace, audit event requirement.> |
| Accessibility | <Keyboard, focus, screen reader, or color requirement.> |
| Localization | <Language, timezone, or formatting requirement.> |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| <Dependency or risk> | Product/Engineering/Design/QA | <Impact if unresolved.> | <Mitigation or fallback.> |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| <Metric> | <Target> | <Window> | <Source> |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| <Future idea> | <Reason not included now.> |

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| <Known limitation> | <User, product, or engineering impact.> |

## **16. Appendix**

| Item | Notes |
| ----- | ----- |
| Glossary | <Term definitions.> |
| UI Labels | <All important user-facing copy.> |
| Assumptions | <Assumptions made due to missing input.> |
| Open Questions | <Unresolved decisions requiring PM/Engineering/Design input.> |
| References | <Related PRD, memory, ticket, design, or TRD link.> |
```

---

# Full PRD Conditional Sections

For Full PRD, insert these sections when triggered. Renumber the final document as needed.

```md
## **State Transition Model**

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| <Entity> | <state> | <action> | <state> | <roles> | <validation/condition> | <events/updates> | <audit event> |

## **Permission Matrix**

| Role | View | Create | Update | Delete / Archive | Export | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| <Role> | Allowed/Denied | Allowed/Denied | Allowed/Denied | Allowed/Denied | Allowed/Denied | <Scope notes> |

## **API / Event Contract**

| Contract | Method / Event | Producer | Consumer | Request / Payload | Response / Ack | Error Codes | Compatibility Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| <API/Event> | <method/path or event name> | <service> | <service/UI> | <schema summary> | <schema summary> | <codes> | <versioning/migration notes> |

## **Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
| ----- | ----- | ----- | ----- | ----- |
| Data | <Backfill/migration plan.> | Engineering | <How to verify.> | <Rollback behavior.> |
| Feature Flag | <Flag name and rollout stages.> | Product/Engineering | <Canary/smoke checks.> | <Disable flag behavior.> |

## **Data Lifecycle & Retention**

| Data | Owner | Created By | Retention | Archive/Delete Policy | Export Policy | Privacy Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| <Data/entity> | <Owner> | <Source> | <Retention period> | <Soft/hard delete/archive> | <Export behavior> | <PII/masking notes> |

## **Analytics & Observability Plan**

| Signal | Name | Trigger | Properties | Owner | Alert / Threshold |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Product Event | <event_name> | <user/system action> | <properties> | Product/Data | <if any> |
| Log / Metric / Trace | <signal_name> | <system event> | <trace_id/correlation_id> | Engineering | <threshold> |
| Audit Event | <audit_event_name> | <mutation> | <actor/entity/before/after> | Engineering | <if any> |

## **Concurrency, Rate Limit & Idempotency**

| Scenario | Risk | Required Behavior | Validation |
| ----- | ----- | ----- | ----- |
| <Concurrent/retry scenario> | <Risk> | <Lock/idempotency/rate limit behavior> | <How QA validates> |

## **Diagram References**

| Diagram | Location | Purpose |
| ----- | ----- | ----- |
| Sequence Diagram | <link/path> | <Flow covered> |
| State Diagram | <link/path> | <Lifecycle covered> |
```

Do not add these sections as empty placeholders. Add them only when the feature trigger exists, then make them complete enough for Engineering and QA.

---

# Section Rules

## Metadata

- Title must be `# **PRODUCT REQUIREMENT DOCUMENT**`.
- Feature name must be specific, not generic.
- Owner fields may be `TBD` if unknown.
- Use one revision history table.
- Do not create duplicate objective sections.

## Overview

- Purpose must explain why the feature exists.
- Scope must identify Phase 1 behavior.
- In Scope and Out of Scope are mandatory for features with integration, migration, reports, SLA, permissions, or data changes.
- Out of Scope must include tempting but excluded behavior to prevent scope creep.

## Problem Statement

- Use `PS-001`, `PS-002`, etc.
- Each problem must have user, operational, revenue, compliance, or engineering impact.
- Do not write solution details in this section.

## Objectives and Key Results

- Objectives describe desired outcome.
- Key Results must be measurable or verifiable.
- Use percentages, counts, time windows, error rate, adoption rate, completion rate, or explicit zero-tolerance targets where possible.

## User Stories and Acceptance Criteria

- Use `US-001`, `US-002`, etc.
- Priority must be `P0`, `P1`, or `P2`.
- Each user story must follow: `As a <role>, I want <capability> so that <outcome>.`
- Acceptance criteria must be numbered.
- Acceptance criteria should use Given/When/Then.
- Include negative paths, permission paths, empty states, and stale data when relevant.

Priority definitions:

- `P0`: required for launch and core correctness.
- `P1`: important for usability, safety, scale, or operational completeness.
- `P2`: enhancement or non-blocking optimization.

## Functional Requirements

- Use sequential IDs: `FR-001`, `FR-002`, etc.
- Add priority tag when useful: `FR-001 [P0]:`.
- Use `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, or `MAY`.
- One requirement must describe one testable behavior.
- Group requirements by behavior category, not only by screen.
- Include explicit side effects and non-side effects.

Functional requirement categories to consider:

- Access and RBAC
- State model and status transition
- Creation, update, delete, archive, or restore behavior
- Search, filter, sorting, ranking, and pagination
- Validation and duplicate detection
- Data persistence and audit trail
- Real-time event, socket, webhook, queue, cron, or async behavior
- Import, export, report, or analytics behavior
- Integration with Conversation, Ticket, Contact, SLA, Broadcast, WhatsApp Web, or Billing
- Error recovery, retry, idempotency, and concurrency
- Backward compatibility and migration behavior

## Error Handling

- Use `EH-001`, `EH-002`, etc.
- Include validation, runtime, conflict, permission, stale data, timeout, partial success, integration failure, and unavailable dependency when relevant.
- Define whether the operation blocks, partially succeeds, retries, or silently skips.
- Include UI copy when user-facing.

## Edge Cases

- Use `EC-001`, `EC-002`, etc.
- Include missing data, duplicate data, concurrent update, permission change, stale state, empty state, large data, unsupported channel, invalid transition, and already-processed entity when relevant.
- Edge case expected behavior must not contradict Functional Requirements.

## UI & UX Requirements

- Include component name, behavior, UX flow, related user stories, and important states.
- User-facing copy should be Bahasa Indonesia unless the existing product surface uses English.
- Include loading, empty, error, success, disabled, permission-blocked, and partial-success states when relevant.
- Mention if an action is hidden, disabled, or visible but blocked.

## Field & Validation

- Include every new or changed field visible in UI, stored in database, passed through API, exported, or used for logic.
- Mark fields as Required, Optional, Conditional, Derived, or Auto.
- Include type, example, validation rule, and default.
- Derived fields must state their source and formula.
- Duration and datetime fields must state timezone and source of truth when relevant.

## State Transition Model

- Required when the feature changes entity status, lifecycle, assignment, SLA, reopen, close, merge, snooze, hold, approval, or retry behavior.
- Every transition must define current state, trigger/action, next state, allowed roles, guard conditions, side effects, and audit event.
- Invalid transitions must be documented as error handling or edge cases.
- State model must align with `Memory/global-memory.md` canonical status rules.
- For Conversation and Ticket, never rely on UI labels alone. Define canonical backend state separately from display label.

## Permission Matrix

- Required when access, visibility, mutation, export, admin setting, team scope, or role behavior changes.
- Matrix must cover at least Agent, Supervisor, Admin, Super Admin, and any domain-specific role if relevant.
- Define whether denied actions are hidden, disabled, or visible but blocked.
- Define server-side enforcement. UI-only permission is not enough.

## API / Event Contract

- Required when API request/response, socket event, webhook payload, queue message, cron behavior, export schema, or report schema changes.
- Include producer, consumer, payload fields, success response, error codes, idempotency key if any, versioning, and backward compatibility notes.
- Contract must specify whether unknown fields are ignored, rejected, or preserved.
- Event names should be stable and written in a predictable taxonomy, for example `<domain>.<entity>.<action>`.
- Breaking contract changes must include migration and rollout plan.

## Migration & Rollout Plan

- Required when existing data, existing behavior, API contract, report/export columns, permissions, or customer-visible workflow changes.
- Include feature flag strategy, rollout stages, backfill plan, validation plan, rollback behavior, and production smoke checks.
- State whether rollback is code-only, data rollback, config rollback, or feature-flag disable.
- If rollback cannot safely undo data, state that explicitly and define mitigation.

## Data Lifecycle & Retention

- Required when feature creates, stores, exports, archives, deletes, masks, or audits data.
- Include data owner, retention period, archive policy, soft delete vs hard delete, export retention, audit log retention, and privacy/masking notes.
- Include PII handling for phone, email, name, attachment, transcript, message content, customer identity, and agent identity when relevant.
- If retention follows parent entity, state the parent entity and rule.

## Analytics & Observability Plan

- Required for production-sensitive features, funnels, reporting, background jobs, async flows, customer-visible messaging, or revenue/compliance-impacting changes.
- Separate product analytics events, engineering logs/metrics/traces, and audit events.
- Product analytics must define event name, trigger, required properties, and owner.
- Engineering observability must define log names, metric names, trace/correlation IDs, and alert thresholds.
- Audit events must include actor, entity, action, before/after values where safe, timestamp, workspace, and result.

## Concurrency, Rate Limit & Idempotency

- Required for high-volume actions, bulk actions, retries, imports, exports, merge/link/unlink, assignment, SLA recalculation, webhooks, queues, and background jobs.
- Define duplicate request behavior, double-click behavior, concurrent actor behavior, retry behavior, idempotency key, locking strategy, and rate limit outcome.
- Include user-facing behavior for partial success and delayed processing.

## Non-Functional Requirements

- Include measurable performance targets when possible.
- Include idempotency for actions that can be retried.
- Include tenant isolation and RBAC for multi-tenant features.
- Include observability for important product events and failure states.
- Include accessibility and localization for UI-facing features.
- Include availability, scalability, reliability, privacy, and auditability when feature is customer-facing or operationally critical.

## Dependencies & Risks

- Dependencies must name the owner.
- Risks must include impact and mitigation.
- If a dependency is unresolved, state whether Phase 1 is blocked or can degrade gracefully.

## Success Metrics

- Metrics must be measurable after release.
- Include data source.
- Avoid vanity metrics unless tied to the feature objective.

## Future Considerations

- Put non-Phase-1 ideas here, not in Functional Requirements.
- Future items must not be required for launch.

## Limitations

- Limitations must be explicit and honest.
- Include user impact, operational impact, or engineering impact.
- Limitations should align with Out of Scope.

## Appendix

- Include glossary for domain terms.
- Include UI labels and messages.
- Include formula summary for metrics or SLA PRDs.
- Include report/export column list for reporting PRDs.
- Include assumptions and open questions if any requirement is not fully decided.
- Include references to related PRDs, memory files, designs, tickets, or TRDs.

---

# Patch Or Addendum Template

Use a patch/addendum only when updating an existing PRD without rewriting the full document.

```md
# **Patch (vX.Y) - <Patch Title>**

### **1. Summary**

| Item | Description |
| ----- | ----- |
| Purpose | <Why this patch exists.> |
| Scope | <What changes.> |
| Non-Scope | <What does not change.> |

### **2. User Stories & Acceptance Criteria (Patch)**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-P001 | P0 | As a <role>, I want <capability> so that <outcome>. | 1. Given <context>, When <action>, Then <result>. |

### **3. Functional Requirements (Patch)**

| Category | Requirements |
| ----- | ----- |
| <Category> | FR-P001 [P0]: System MUST <behavior>. |

### **4. Data Model / Contract Patch**

| Field or Contract | Change | Compatibility Notes |
| ----- | ----- | ----- |
| <Field/API/Event> | <Added/changed/removed behavior.> | <Backward compatibility or migration note.> |

### **4.1 Migration / Rollout Patch**

| Area | Change | Rollout | Rollback |
| ----- | ----- | ----- | ----- |
| <Data/API/UI/Flag> | <Change summary.> | <How it will be enabled.> | <How to revert or disable.> |

### **5. Error Handling (Patch)**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-P001 | <Type> | <Handling.> | <UI behavior.> |

### **6. Edge Cases (Patch)**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-P001 | <Scenario> | <Expected behavior.> | <UI behavior.> |

### **7. UX Notes**

| Component | Behavior |
| ----- | ----- |
| <Component> | <UX rule.> |

### **8. Impacted Existing Requirements**

| Existing Requirement | Impact | Resolution |
| ----- | ----- | ----- |
| FR-XXX | <Changed/extended/deprecated.> | <How to interpret after patch.> |
```

Patch rules:

- Patch IDs must not collide with existing IDs.
- State whether the patch supersedes, extends, or clarifies existing requirements.
- Include compatibility and migration notes when data, API, reports, or persisted behavior changes.
- Include rollout and rollback notes when the patch changes shipped behavior.
- If patch changes more than 30 percent of the PRD, rewrite the PRD instead of adding a patch.

---

# Quality Gate Checklist

Before finalizing a PRD, verify:

- [ ] Source-of-truth domain is identified.
- [ ] Phase 1 scope is explicit.
- [ ] In Scope and Out of Scope are present.
- [ ] No duplicate section numbering exists.
- [ ] Every user story has priority and acceptance criteria.
- [ ] Acceptance criteria are testable.
- [ ] Functional requirements use stable IDs and modal verbs.
- [ ] Error handling covers validation, permission, conflict, stale data, and dependency failure where relevant.
- [ ] Edge cases cover concurrency, missing data, duplicate data, and invalid state where relevant.
- [ ] UI/UX section includes loading, empty, error, and permission states where relevant.
- [ ] Field & Validation includes every new/changed field, derived field, export field, and API-relevant field.
- [ ] State Transition Model is present for stateful features.
- [ ] Permission Matrix is present for RBAC or visibility changes.
- [ ] API / Event Contract is present for API, socket, webhook, queue, report, or export contract changes.
- [ ] Migration & Rollout Plan is present for existing behavior, data, API, report, or customer-visible changes.
- [ ] Data Lifecycle & Retention is present for persisted data, PII, attachments, export, or audit logs.
- [ ] Analytics & Observability Plan defines product events, engineering signals, audit events, and thresholds where relevant.
- [ ] Concurrency, Rate Limit & Idempotency is present for bulk, retryable, async, or high-volume flows.
- [ ] Non-functional requirements include performance, reliability, security, observability, accessibility, and localization where relevant.
- [ ] Dependencies and risks include owner, impact, and mitigation.
- [ ] Success metrics have target, time window, and data source.
- [ ] Future considerations are not mixed into Phase 1 requirements.
- [ ] Limitations align with Out of Scope.
- [ ] Assumptions and open questions are documented instead of hidden.
- [ ] UI-facing copy is Bahasa Indonesia unless the product surface requires otherwise.
- [ ] PRD does not contradict `Memory/global-memory.md`; any conflict is flagged explicitly.
