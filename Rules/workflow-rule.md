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

1. Read `qa-analysis-rule.md` for full analysis methodology.
2. Read global memory for shared entity lifecycle, RBAC, architecture constraints.
3. Read existing feature memories affected.
4. If comparing multiple PRDs, also read `prd-comparison-rule.md`.

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
2. Use analysis output as input for impact analysis (impact-analysis-rule.md).
3. For comprehensive assessment (feature dev, bug fix, or interconnection), use qa-analysis-rule.md.

---

# Before Bug Fix Analysis

1. Read qa-analysis-rule.md for bug fix analysis methodology.
2. Read impact-analysis-rule.md for blast radius assessment.
3. Identify root cause, scope, regression risk, and production safety.
4. Document affected modules and data integrity risk.

---

# Before Interconnection Analysis

1. Read qa-analysis-rule.md for interconnection methodology.
2. Build dependency matrix and event mapping.
3. Identify shared resources and async consumers.
4. Assess chain-reaction risk across features.

---

# Before Writing Memory

1. Re-read relevant write or update rule.
2. Read existing global memory and feature memory.
3. Route knowledge using memory-routing-rule.md.
4. Write or update accordingly.

---

# Before Creating or Updating Test Cases

1. Read `test-case-rule.md` for QA test writing, steps, coverage, and execution support.
2. Read `qa-analysis-rule.md`, especially Test Specification Layer and Traceability Matrix sections.
3. Read relevant PRD analysis and impact analysis.
4. Read the source PRD or patch/addendum.
5. Read existing test cases in affected scope.
6. Build requirement-to-test coverage before writing detailed steps.
7. Ensure test cases stay within feature boundary and do not test out-of-scope behavior as required behavior.
8. Include regression scenarios from impact analysis.
9. Include state, RBAC, API/event contract, data lifecycle, migration, rollout, rollback, and observability tests when triggered by PRD analysis.
10. Define test data, environment, execution entry/exit criteria, evidence, and automation readiness.

---

# Priority Reference

Canonical truth order:

1. Global memory
2. Feature memory
3. PRD content
4. Runtime inference
5. Temporary assumptions
