# Runtime Setup Summary

> Generated from dashboard-managed setup files at 2026-07-03T09:26:35.351Z.
> This file is intended to be read by Hermes / Claude Code at task start.

---

## Active Mode
- **Workflow mode:** `full_lane`
- **Workflow id:** `standard-multi-agent-v2`
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
- analyst owns Assessment Report
- Phase 0 artifact: **Change Intake Brief** (owner: analyst, suffix: `-change-intake-brief.md`)
- Reviewer gates active: A / B / C
- Requirement Package Freeze active after gate_b
- QA is split into pre-implementation and post-implementation phases

## Gate Schema
### GATE A
`APPROVE_WITH_NOTES | REVISE_ASSESSMENT | REVISE_PRD_DRAFT | HOLD`

### GATE B
`APPROVED | APPROVED_WITH_CAUTION | REVISE_PRD | HOLD`

### GATE C
`FINAL_APPROVE | REVISE_CODER | REVISE_QA | REOPEN_REQUIREMENT`

## Active Rules (must be read by agent)
- Rules/agent-instruction.md
- Rules/workflow-rule.md
- Rules/structure-rule.md
- Rules/requirements-lifecycle-rule.md
- Rules/qa-analysis-rule.md
- Rules/impact-analysis-rule.md
- Rules/prd-writing-rule.md
- Rules/prd-comparison-rule.md
- Rules/test-case-rule.md
- Rules/automation-bridge-rule.md
- Rules/memory-routing-rule.md
- Rules/memory-write-rule.md
- Rules/memory-update-rule.md
- Rules/global-memory-write-rule.md
- Rules/global-memory-update-rule.md

## Active Memory (must be loaded by agent)
- Memory/README.md
- Memory/global-memory.md
- Memory/reference-index.md
- Memory/CLAUDE-fe.md
- Memory/CLAUDE-be.md
- Memory/qa-tooling.md
- Memory/comprehensive-undeveloped-features-analysis.md
- Memory/conversation-undeveloped-features-analysis.md

## Active Reference Analysis (load when relevant)
- Assessments/reference/conversation-prd-cross-analysis.md
- Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md
- Assessments/reference/conversation-v1-vs-v2-comparison.md
- Assessments/reference/ticket-v1-vs-v2-comparison.md
- Assessments/reference/whatsapp-web-v1-vs-v2-comparison.md
- Assessments/reference/sla-conversation-ticket.md
- Assessments/reference/contact-context-visibility.md

## Execution Notes
- For requests touching product behavior, run Phase 0 (Change Intake) before drafting PRD.
- Do not continue coding if requirement changes after Gate B.
- Route post-freeze requirement change back to requirement lane.
- Use QA Pre-Implementation Review before coding in full lane.
- Use QA Post-Implementation Validation after implementation.
