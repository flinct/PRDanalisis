# Runtime Setup Summary (Example)

> Generated from dashboard-managed setup files.  
> This is the file intended to be read by Hermes / Claude Code at task start.

---

## Active Mode
- **Workflow mode:** `full_lane`
- **Workflow id:** `standard-multi-agent-v1`
- **Rule profile:** `default`
- **Roster profile:** `default`

## Active Roster
- Orchestrator
- Analyst
- PRD Writer
- QA Agent
- Reviewer
- Coder Automation

## Canonical Policies
- Logical analysis artifact name = **Assessment Report**
- Persisted filename suffix may remain `-qa-assessment.md`
- Analyst owns Assessment Report
- Reviewer gates active: A / B / C
- Requirement Package Freeze active after Gate B
- QA is split into pre-implementation and post-implementation phases

## Gate Schema
### Gate A
`APPROVE_WITH_NOTES | REVISE_ASSESSMENT | REVISE_PRD_DRAFT | HOLD`

### Gate B
`APPROVED | APPROVED_WITH_CAUTION | REVISE_PRD | HOLD`

### Gate C
`FINAL_APPROVE | REVISE_CODER | REVISE_QA | REOPEN_REQUIREMENT`

## Execution Notes
- Do not continue coding if requirement changes after Gate B.
- Route post-freeze requirement change back to requirement lane.
- Use QA Pre-Implementation Review before coding in full lane.
- Use QA Post-Implementation Validation after implementation.
