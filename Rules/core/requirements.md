# Requirements Writing

## Principles
Write only decisions that are necessary for delivery. Requirements must be
unambiguous, testable, internally consistent, and traceable to an objective or
decision. Mark unknowns as open questions; never silently invent material rules.

## Minimum specification
Include purpose, in-scope/out-of-scope behavior, user or system outcomes,
acceptance criteria, assumptions/open questions, dependencies, and risks.

## Conditional sections
Add only when triggered: data model and validation; permissions; lifecycle/state;
interface/event contract; migration/compatibility; operational rollout/recovery;
privacy/security; accessibility/localization; observability; performance or
reliability; agent execution contract. A section marked Not Applicable must
state why when its omission could otherwise be surprising.

## Agent execution contract
Add only when an agent, worker, contractor, or any executor implements the spec
without the authoring context (e.g. an orchestrator delegates a worker and a
reviewer gates the result). The executor cannot infer what the author already
knows. Declare: which sources are authoritative and which wins on conflict; what
must not be touched and why; how each requirement is verified and by whom; and
the conditions under which the executor must stop and escalate rather than
decide. A requirement with no verification method is not ready to hand off,
because nothing distinguishes "done" from "the executor believes it is done".

## Form
Use stable identifiers only where traceability requires them. The ID format,
language, role names, document template, and revision convention come from the
project profile. Use measurable targets when a target is required; do not invent
targets merely to fill a template.
