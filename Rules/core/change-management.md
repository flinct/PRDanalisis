# Change Management

## Purpose
Understand a proposed behavior change before committing to scope, specification,
or delivery.

## Required understanding
- problem, desired outcome, affected users or systems;
- current behavior and authoritative evidence;
- requested change, explicit non-goals, and protected behavior;
- dependencies, unknowns, and likely impact areas.

## Change classes
Use: NEW_CAPABILITY, ADDITIVE_CHANGE, BEHAVIOR_CHANGE, DEPRECATION_OR_REMOVAL,
REVIVAL, or COMPOSITE_CHANGE. Split composite work when objectives, owners,
risks, or delivery paths differ.

## Proportionality
Choose a lane using the project profile's risk criteria:
- Light: isolated and reversible; record scope and assumptions in the work item.
- Standard: local behavior/data/contract change; create a concise change brief.
- Governed: shared, irreversible, regulated, security-sensitive, or high-risk;
  create a versioned brief and obtain the approvals required by the project profile.

A project profile MAY set the lane to `governed` for all product-behavior changes.
When it does, the mandatory Phase-0 change intake, brief persistence + versioning,
and stage-transition confirmation remain in force and are non-bypassable.

Do not treat a document as proof of current behavior. Prefer observed behavior,
approved specification, and maintained technical evidence; record conflicts.

## Demand screen (before classification)
Before classifying a request as work, assess its demand level. This separates
"can be built" from "should be built":

| Level | Signal | Default action |
|---|---|---|
| L0 | founder anxiety / "competitor has it" / polite request, no evidence of need | hold; do not draft PRD yet |
| L1 | one user asked once | record, do not prioritize |
| L2 | asked repeatedly, no evidence of use | hold / small research |
| L3 | real workflow blocker (user cannot finish their work) | worth building |
| L4 | revenue / retention blocker | prioritize high |

L3/L4 proceed to classification and normal routing. L0/L1/L2 are recorded as an
open question / demand level in the change brief and must not trigger a full PRD
without confirmation. Likes, compliments, waitlists, and market-size figures are
not demand; real files, bookings, payments, repeated manual usage, or migration
from an alternative are.

