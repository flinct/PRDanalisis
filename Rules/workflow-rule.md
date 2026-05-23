# Workflow Rules

Purpose:
Define execution order agent must follow processing any task.

---

# Execution Order

Always follow sequence:

1. READ applicable rule files from `Rules/`.
2. READ global memory from `Memory/global-memory.md`.
3. READ relevant feature memory files from `Memory/`.
4. EXECUTE task.

Skip no step.

---

# Before PRD Analysis

1. Read global memory for shared entity lifecycle, RBAC, architecture constraints.
2. Read existing feature memories affected.
3. Determine single-PRD analysis (analisa-prd-rule.md) or comparison (prd-comparison-rule.md) needed.

---

# Before Impact Analysis

1. Perform PRD analysis or comparison first.
2. Use analysis output as input for impact analysis (impact-analysis-rule.md).

---

# Before Writing Memory

1. Re-read relevant write or update rule.
2. Read existing global memory and feature memory.
3. Route knowledge using memory-routing-rule.md.
4. Write or update accordingly.

---

# Before Creating or Updating Test Cases

1. Read relevant PRD analysis and impact analysis.
2. Read existing test cases in affected scope.
3. Ensure test cases stay within feature boundary.
4. Include regression scenarios from impact analysis.

---

# Priority Reference

Canonical truth order:

1. Global memory
2. Feature memory
3. PRD content
4. Runtime inference
5. Temporary assumptions
