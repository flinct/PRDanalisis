# Feature Context

- Cross-PRD analysis of conversation SLA and ticket SLA.
- Focus: alignment risk when both SLA models coexist in one support workflow.

# Canonical Business Rules

- Conversation SLA is channel-scoped.
- Ticket SLA is ticket-type-scoped.
- Both domains use FRT and TTC.
- Ticket domain also adds stage SLA.
- Both domains snapshot SLA settings per new cycle and do not retroactively update active cycles.
- Reminder and breach notifications target supervisors and current assignee at trigger time.

# Lifecycle Rules

- Conversation SLA starts on first assignment to an agent.
- Ticket SLA starts when ticket is created and enters non-resolved flow.
- Ticket SLA explicitly creates a new cycle on reopen.
- Conversation reopen behavior is not defined.
- Ticket Waiting on Customer pause applies to FRT, TTC, and stage SLA when enabled.
- Conversation Waiting on Customer pause applies only to TTC.
- Conversation AUX policy can pause active metrics when AUX counting is disabled.
- Ticket SLA has no AUX policy in current PRD.

# Visibility/RBAC Rules

- Only Admin can edit SLA settings.
- Supervisors are read-only in settings.
- Notification recipient scope is similar but not fully standardized between conversation and ticket.

# Critical Dependencies

- Canonical Waiting on Customer status mapping.
- Consistent reopen lifecycle handling.
- Shared recipient access resolution for supervisors.
- Shared duration/reminder normalization if one SLA engine or shared UI is used.

# High Risk Areas

- SLA start-point mismatch between conversation and ticket.
- Pause-policy mismatch for Waiting on Customer.
- AUX policy exists only in conversation.
- Default policy mismatch for new configuration.
- Reminder model mismatch: conversation uses value+unit, ticket memory currently implies minute-based reminder fields.
- Ticket PRD lacks bootstrap strategy equivalent to conversation migration/default seeding.

# Edge Cases

- Unassigned conversation backlog can avoid SLA aging before first assignment.
- Conversation reopened after resolved/closed has undefined SLA cycle behavior.
- Same customer issue can show different SLA fairness between conversation and ticket during Waiting on Customer.
- Ticket type without configured FRT/TTC remains underspecified for existing data.

# Technical Constraints

- Any shared SLA engine should map both domains into generic states such as running, paused, completed, and breached.
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

- This analysis belongs in feature memory, not global memory, because the findings are cross-PRD but still feature-scoped to SLA alignment.
- Memory location should be under root `Memory/`, not inside the PRD folder.

# Open Questions

- Should SLA start from `created_at`, `assigned_at`, or a metric-specific event model shared across domains?
- Should Waiting on Customer pause FRT in both domains or only one domain?
- Is AUX a global workforce rule or a conversation-only rule?
- Should conversation reopen create a new SLA cycle like ticket?
- Should ticket reminder configuration support value+unit like conversation?
- What is the fallback behavior for existing ticket types without FRT/TTC config?
