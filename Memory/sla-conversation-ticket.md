# Feature Context

- Cross-PRD analysis conversation SLA and ticket SLA.
- Focus: alignment risk when both SLA models coexist in one support workflow.

# Canonical Business Rules

- Conversation SLA channel-scoped.
- Ticket SLA ticket-type-scoped.
- Both domains use FRT and TTC.
- Ticket domain also adds stage SLA.
- Both domains snapshot SLA settings per new cycle. Do not retroactively update active cycles.
- Reminder and breach notifications target supervisors and current assignee at trigger time.

# Lifecycle Rules

- Conversation SLA starts on first assignment to agent.
- Ticket SLA starts when ticket created and enters non-resolved flow.
- Ticket SLA explicitly creates new cycle on reopen.
- Conversation reopen behavior not defined.
- Ticket Waiting on Customer pause applies to FRT, TTC, stage SLA when enabled.
- Conversation Waiting on Customer pause applies only to TTC.
- Conversation AUX policy can pause active metrics when AUX counting disabled.
- Ticket SLA has no AUX policy in current PRD.

# Visibility/RBAC Rules

- Only Admin can edit SLA settings.
- Supervisors read-only in settings.
- Notification recipient scope similar but not fully standardized between conversation and ticket.

# Critical Dependencies

- Canonical Waiting on Customer status mapping.
- Consistent reopen lifecycle handling.
- Shared recipient access resolution for supervisors.
- Shared duration/reminder normalization if one SLA engine or shared UI used.

# High Risk Areas

- SLA start-point mismatch between conversation and ticket.
- Pause-policy mismatch for Waiting on Customer.
- AUX policy exists only in conversation.
- Default policy mismatch for new configuration.
- Reminder model mismatch: conversation uses value+unit, ticket memory implies minute-based reminder fields.
- Ticket PRD lacks bootstrap strategy equivalent to conversation migration/default seeding.

# Edge Cases

- Unassigned conversation backlog can avoid SLA aging before first assignment.
- Conversation reopened after resolved/closed has undefined SLA cycle behavior.
- Same customer issue can show different SLA fairness between conversation and ticket during Waiting on Customer.
- Ticket type without configured FRT/TTC remains underspecified for existing data.

# Technical Constraints

- Any shared SLA engine should map both domains into generic states: running, paused, completed, breached.
- Reminder comparison should use normalized duration units.
- Snapshot behavior must remain cycle-based for both domains.

# Regression Sensitive Areas

- Assignment flow.
- Reopen flow.
- Waiting on Customer transitions.
- Assignee change before reminder/breach trigger.
- Supervisor visibility filtering.
- Reminder deduplication and breach deduplication.

# Resolved Decisions

- This analysis belongs in feature memory, not global memory. Findings cross-PRD but feature-scoped to SLA alignment.
- Memory location root `Memory/`, not inside PRD folder.

# Open Questions

- Should SLA start from `created_at`, `assigned_at`, or metric-specific event model shared across domains?
- Should Waiting on Customer pause FRT in both domains or only one domain?
- AUX global workforce rule or conversation-only rule?
- Should conversation reopen create new SLA cycle like ticket?
- Should ticket reminder configuration support value+unit like conversation?
- Fallback behavior for existing ticket types without FRT/TTC config?
