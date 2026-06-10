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
4. READ relevant feature memory files from `Memory/`.
5. EXECUTE task.

Skip no step. This sequence guarantees agent always has the correct methodology loaded before analyzing anything.

---

# Before PRD Analysis

1. Read `qa-analysis-rule.md` for full analysis methodology and QA Assessment Report requirements.
2. Read global memory for shared entity lifecycle, RBAC, architecture constraints.
3. Read existing feature memories affected.
4. If comparing multiple PRDs, also read `prd-comparison-rule.md`.
5. Save the final decision-bearing analysis as a permanent artifact in `Assessments/<domain>/<feature-slug>/` using the canonical template at `Assessments/templates/qa-assessment-report-template.md`.
6. If the analysis is a revision, move the prior approved/current version into `versions/` and summarize the analysis changes in the new report.

---

# Before PRD Writing

1. Read `prd-writing-rule.md` for PRD structure, section rules, and checklist.
2. Read global memory for canonical lifecycle, RBAC, SLA, and source-of-truth constraints.
3. Read existing V2 PRDs in the same domain, especially `PRD/Conversationv2/` and `PRD/ticketv2/` for Conversation/Ticket work.
4. Read relevant feature memory files from `Memory/`.
5. Classify feature complexity and choose Lite PRD, Standard PRD, Full PRD, or Patch/Addendum mode.
6. Define Phase 1 In Scope and Out of Scope before writing detailed requirements.
7. If the PRD touches existing entities, flows, reports, SLA, RBAC, API/event contracts, data retention, migration, or integrations, use `qa-analysis-rule.md` and `impact-analysis-rule.md` for completeness.

---

# Before Impact Analysis

1. Perform PRD analysis or comparison first.
2. Use the QA Assessment Report output as input for impact analysis (`impact-analysis-rule.md`).
3. For comprehensive assessment (feature dev, bug fix, or interconnection), use `qa-analysis-rule.md`.
4. If the impact analysis changes the final decision, update the permanent artifact in `Assessments/<domain>/<feature-slug>/` rather than leaving the decision only in a temporary note.

---

# Before Bug Fix Analysis

1. Read `qa-analysis-rule.md` for bug fix analysis methodology.
2. Read `impact-analysis-rule.md` for blast radius assessment.
3. Identify root cause, scope, regression risk, and production safety.
4. Document affected modules, data integrity risk, and a standardized final decision enum.
5. Save the final bug-fix assessment as a QA Assessment Report in `Assessments/<domain>/<feature-slug>/` when it is used as a persistent decision artifact.

---

# Before Interconnection Analysis

1. Read `qa-analysis-rule.md` for interconnection methodology.
2. Build dependency matrix and event mapping.
3. Identify shared resources and async consumers.
4. Assess chain-reaction risk across features.
5. Record the outcome in the standard QA Assessment Report format if it affects a real go / revise / hold decision.

---

# Before Writing Memory

1. Re-read relevant write or update rule.
2. Read existing global memory and feature memory.
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
3. PRD content
4. Runtime inference
5. Temporary assumptions
