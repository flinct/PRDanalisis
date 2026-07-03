# Workflow Rules

Purpose:
Define execution order agent must follow processing any task.

---

# Execution Order

Always follow sequence:

0. READ `Rules/agent-instruction.md` — **ENTRY POINT.** Detects task type and tells you exactly which rules to load.
1. READ this `workflow-rule.md` — execution order and priority reference.
2. Load rules as instructed by `agent-instruction.md` based on detected task type.
3. READ global memory from `Memory/global-memory.md`.
4. READ `Memory/reference-index.md` to discover reusable PRD analysis references in `Assessments/reference/`.
5. READ relevant feature memory files from `Memory/` and/or relevant reference analysis from `Assessments/reference/`.
6. EXECUTE task.

Skip no step. This sequence guarantees agent always has the correct methodology loaded before analyzing anything.

---

# Before Requirement Lifecycle / Change Intake

1. If the request **adds, changes, removes, deprecates, or revives** product behavior, read `requirements-lifecycle-rule.md` first.
2. Complete **Phase 0 — Change Intake & Classification** before drafting PRD v0, patching PRD, or writing Assessment Report.
3. Verify current state against `Memory/global-memory.md`, relevant PRDs, relevant reference analysis, undeveloped-feature memory, and FE/BE references when needed.
4. Persist a **Change Intake Brief** at `Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md` using `Assessments/templates/Setup/change-intake-brief-template.md`.
5. The brief must contain change class, current-state verification, in-scope / out-of-scope, protected existing behavior, impact flags, blocking questions, and routing decision.
6. If the route is `SPLIT_REQUEST` or `HOLD_NEEDS_DISCOVERY`, do **not** continue as if scope were already settled.
7. If the same feature receives later scope changes, actor clarifications, integration details, fallback rules, glossary fixes, routing clarifications, or any other refinement for the same request, update the latest/current Change Intake Brief first, version the previous one, then patch downstream artifacts.
8. Every substantive update to the active brief or any downstream permanent artifact MUST also update its version metadata and its change-summary/history section.
9. Treat input that clarifies a previous user story or previous use case for the same feature as the same-request refinement by default, not as an automatic new lane.
10. If the agent cannot confidently determine whether a new input is (a) clarification of the previous user story/use case, or (b) a genuinely new request / sub-request / scope change, the agent MUST ask the user before changing route or stage.
11. After updating the Change Intake Brief for the same request, STOP and run the final stage-transition confirmation layer before moving to BRD, PRD, Assessment Report, or any later-stage artifact — even when the agent believes the requirement is already mature enough to continue.
12. The final stage-transition confirmation layer MUST always include: (a) readiness validation, (b) what is already locked, (c) what is still open, (d) risks of moving now, and (e) explicit user confirmation.
13. If the user explicitly asks to move to the next stage, the same final confirmation layer still applies in full. No bypass.

---

# Before PRD Analysis

1. If the request adds / changes / removes / revives behavior, complete Phase 0 from `requirements-lifecycle-rule.md` first.
2. Read `qa-analysis-rule.md` for full analysis methodology and Assessment Report requirements.
3. Read global memory for shared entity lifecycle, RBAC, architecture constraints.
4. Read existing feature memory and reference analysis affected.
5. If comparing multiple PRDs, also read `prd-comparison-rule.md`.
6. Save the final decision-bearing analysis as a permanent artifact in `Assessments/<domain>/<feature-slug>/` using the canonical template at `Assessments/templates/qa-assessment-report-template.md`.
7. If the analysis is a revision, move the prior approved/current version into `versions/` and summarize the analysis changes in the new report.

---

# Before PRD Writing

1. If the request adds / changes / removes / revives behavior, complete Phase 0 from `requirements-lifecycle-rule.md` first.
2. Read `prd-writing-rule.md` for PRD structure, section rules, and checklist.
3. Read global memory for canonical lifecycle, RBAC, SLA, and source-of-truth constraints.
4. Read existing V2 PRDs in the same domain, especially `PRD/Conversationv2/` and `PRD/ticketv2/` for Conversation/Ticket work.
5. Read relevant feature memory from `Memory/` and relevant reference analysis from `Assessments/reference/` when needed.
6. Classify feature complexity and choose Lite PRD, Standard PRD, Full PRD, or Patch/Addendum mode.
7. Define Phase 1 In Scope and Out of Scope before writing detailed requirements.
8. If the PRD touches existing entities, flows, reports, SLA, RBAC, API/event contracts, data retention, migration, or integrations, use `qa-analysis-rule.md` and `impact-analysis-rule.md` for completeness.

---

# Before Impact Analysis

1. Use Phase 0 output from `requirements-lifecycle-rule.md` when the request changes product behavior.
2. Perform PRD analysis or comparison first.
3. Use the Assessment Report output as input for impact analysis (`impact-analysis-rule.md`).
4. For comprehensive assessment (feature dev, bug fix, or interconnection), use `qa-analysis-rule.md`.
5. If the impact analysis changes the final decision, update the permanent artifact in `Assessments/<domain>/<feature-slug>/` rather than leaving the decision only in a temporary note.

---

# Before Bug Fix Analysis

1. Read `qa-analysis-rule.md` for bug fix analysis methodology.
2. Read `impact-analysis-rule.md` for blast radius assessment.
3. Identify root cause, scope, regression risk, and production safety.
4. Document affected modules, data integrity risk, and a standardized final decision enum.
5. Save the final bug-fix assessment as an Assessment Report in `Assessments/<domain>/<feature-slug>/` when it is used as a persistent decision artifact.

---

# Before Interconnection Analysis

1. Read `qa-analysis-rule.md` for interconnection methodology.
2. Build dependency matrix and event mapping.
3. Identify shared resources and async consumers.
4. Assess chain-reaction risk across features.
5. Record the outcome in the standard Assessment Report format if it affects a real go / revise / hold decision.

---

# Reviewer Gates and Requirement Package Freeze

Use the following workflow gates when the task follows the multi-agent requirement lane.

## Gate A — Early Review

Reviewer validates the Change Intake Brief plus the initial Assessment Report and PRD v0 / PRD skeleton.

**Readiness note before Gate A artifacts are created:**
- If the team is still refining the same user story / request and the Change Intake Brief is still absorbing new actor definitions, end-to-end flow clarifications, fallback behavior, routing details, or visibility rules, stay in Phase 0.
- Do not force an initial Assessment Report or PRD v0 only because there is enough material to speculate.
- Before any move to Gate A artifact creation, run the final stage-transition confirmation layer: validate readiness, explain locked items, explain open items, explain risks of moving now, and ask for explicit user confirmation.

Allowed statuses:
- `APPROVE_WITH_NOTES`
- `REVISE_ASSESSMENT`
- `REVISE_PRD_DRAFT`
- `HOLD`

## Gate B — Requirement Package Approval

Reviewer validates the requirement-ready package before implementation starts.

Minimum package:
- Change Intake Brief
- PRD requirement-ready
- Assessment Report
- QA pre-implementation review
- coverage / testcase strategy
- automation scope or automation candidate mapping

Allowed statuses:
- `APPROVED`
- `APPROVED_WITH_CAUTION`
- `REVISE_PRD`
- `HOLD`

### Requirement Package Freeze

After Gate B is `APPROVED` or `APPROVED_WITH_CAUTION`, treat the requirement package as **frozen input for implementation**.

If any requirement changes after freeze:
- do **not** continue coding silently
- return to the requirement lane
- re-review and re-approve the delta before implementation continues

## Gate C — Final Review

Reviewer validates implementation output against the frozen package and QA post-implementation validation.

Allowed statuses:
- `FINAL_APPROVE`
- `REVISE_CODER`
- `REVISE_QA`
- `REOPEN_REQUIREMENT`

---

# Before Writing Memory

1. Re-read relevant write or update rule.
2. Read existing global memory, feature memory, and `Memory/reference-index.md` if the task may need reusable PRD analysis context.
3. Route knowledge using memory-routing-rule.md.
4. Write or update accordingly.

---

# Before Creating or Updating Test Cases

1. Read `test-case-rule.md` for QA test writing, steps, coverage, and execution support.
2. If the requested output is a manual TSV file or must follow `SatuInbox Test Case Scenario V2`, use the Manual TSV Output Mode section inside `test-case-rule.md`.
3. Read `qa-analysis-rule.md`, especially Test Specification Layer and Traceability Matrix sections.
4. Read relevant PRD analysis and impact analysis.
5. Read the source PRD or patch/addendum.
6. Read existing test cases in affected scope.
7. Build requirement-to-test coverage before writing detailed steps.
8. Ensure test cases stay within feature boundary and do not test out-of-scope behavior as required behavior.
9. Include regression scenarios from impact analysis.
10. Include state, RBAC, API/event contract, data lifecycle, migration, rollout, rollback, and observability tests when triggered by PRD analysis.
11. Define test data, environment, execution entry/exit criteria, evidence, and automation readiness.

---

# Priority Reference

Canonical truth order:

1. Global memory
2. Feature memory
3. Reference analysis
4. PRD content
5. Runtime inference
6. Temporary assumptions
