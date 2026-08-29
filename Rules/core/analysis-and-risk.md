# Analysis and Risk Review

## Purpose
Determine whether the proposed change is understandable, safe enough to proceed,
and what controls or follow-up are required.

## Evaluate by applicability
Consider behavior, data, interfaces, user experience, authorization/privacy,
performance/reliability, integrations, reporting, compliance, operations, and
concurrency. Assess a dimension only when relevant; record material omissions
as Not Applicable with rationale.

## Evidence and output
Separate evidence, inference, decision, assumption, and open question. For
material decisions, produce: decision, rationale, impact, risks, mitigations,
regression scope, ownership, and next safe action. Use a project-defined decision
taxonomy if present; otherwise use Proceed, Proceed with conditions, Revise,
Split, or Hold.

A project profile MAY require that every decision-bearing analysis persist as a
formal assessment artifact with version metadata and change history. When it
does, that persistence is non-bypassable.

## Recovery
For changes with meaningful failure impact, state detection, containment,
recovery/rollback feasibility, and validation. Do not require feature flags,
migrations, or canaries when the architecture or risk does not justify them.
