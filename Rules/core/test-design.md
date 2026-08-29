# Test Design

## Purpose
Design evidence that the approved behavior works and affected behavior remains safe.

## Rules
- Trace each material requirement, risk, or decision to one or more tests, an
  alternative verification method, or an explicit reason it cannot be tested.
- Test steps use observable actions, necessary preconditions, safe/deterministic
  data, and exact expected results.
- Cover positive, negative, boundary, permission, state, integration, regression,
  and non-functional cases only when applicable.
- Keep tests independent unless the suite declares an ordered setup.
- Use synthetic or approved masked data; never expose restricted production data.
- Mark automation readiness based on deterministic setup, assertion, isolation,
  cleanup, and stable execution conditions.

## Output selection
Choose a test plan, scenario list, detailed test case, contract spec, UAT script,
release runbook, or execution report according to the user need and project
profile. A file-specific TSV/XLSX/automation format is an optional adapter, not
part of this rule.
