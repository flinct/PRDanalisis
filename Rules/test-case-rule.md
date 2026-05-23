# Test Case Rules

Purpose:
Define how agents create and update test cases ensuring proper coverage without scope creep.

---

# Scope Rules

- Test cases MUST scope to feature boundary defined in PRD.
- Test cases MUST NOT test out-of-scope behaviors.
- Test cases MUST cover all acceptance criteria in PRD.
- Test cases MUST cover all edge cases identified during PRD analysis.

---

# Impact Coverage

When feature updated or changed:

- Identify all affected existing features from impact analysis.
- Add regression test cases for each affected area.
- Do NOT modify existing passing test cases unless their expected behavior changed.
- Flag test cases becoming obsolete due to removed behavior.

---

# Test Case Structure

Each test case MUST include:

- ID (feature prefix + sequential number)
- Scenario description
- Prerequisites or test data
- Steps
- Expected result

---

# Update Rules

When updating existing test cases:

- Preserve existing test IDs unless behavior fundamentally changed.
- Mark removed test cases as deprecated, do not delete without confirmation.
- Link updated test cases to source requirement ID.

---

# Forbidden

Do NOT:

- Generate duplicate test cases.
- Include implementation details in test steps.
- Write test cases for speculative or undefined behaviors.
- Expand scope beyond what PRD defines.
