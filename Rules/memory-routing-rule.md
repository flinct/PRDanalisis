# Memory Routing Rules

Purpose:
Determine whether discovered knowledge belongs to global memory, feature memory, reference analysis, or not persisted.

---

# Global Memory Criteria

Store in global memory if knowledge:
- reusable across multiple features
- defines system-wide behavior
- defines shared lifecycle or state machine
- defines shared RBAC logic
- defines shared architectural constraints
- defines shared integration behavior
- defines core entity definitions
- defines canonical workflow rules
- documents organization-wide risk patterns
- repeatedly referenced across feature memories or reference analyses

Examples: chat lifecycle, assignment flow, webhook behavior, RBAC inheritance, queue ownership model.

---

# Feature Memory Criteria

Store in feature memory if knowledge:
- remains a stable baseline that should be loaded quickly before many tasks
- summarizes implementation status or feature-local product context reused often
- captures feature-local canonical notes that are not broad enough for global memory
- serves as architecture / tooling / status context rather than one-off PRD reasoning

Examples: undeveloped feature summary, QA tooling reference, focused patch impact baseline reused across tasks.

---

# Reference Analysis Criteria

Store in `Assessments/reference/` if knowledge:
- is reusable PRD analysis
- is a comparison baseline (V1 vs V2, FE vs BE, old vs new)
- documents loophole / conflict / ambiguity mapping
- captures cross-PRD reasoning or deep-dive analysis
- supports future Assessment Reports, PRD rewrites, impact analysis, or QA design
- is too analytical / narrative to be canonical memory, but too valuable to discard

Examples: SLA deep dive, V1 vs V2 comparison, contact visibility cross-analysis, conversation cross-PRD loophole map.

---

# Do NOT Persist

Do NOT store:
- feature-local UI detail
- isolated validation logic
- temporary implementation details
- experimental workflows
- one-off business exceptions
- temporary assumptions
- verbose explanations with no reuse value
- raw PRD text
- generated test cases
- speculative reasoning with no stable outcome

---

# Deduplication Rules

- Never duplicate canonical rules across feature memories or reference analyses.
- Feature memory and reference analysis should point back to global behavior, not redefine it blindly.
- Global memory remains the source of truth for shared rules.

---

# Conflict Rules

If feature memory or reference analysis contradicts global memory:
1. Flag inconsistency.
2. Do not overwrite automatically.
3. Require clarification or explicit confirmation.

---

# Update Priority

Priority order:
1. Global canonical memory.
2. Feature memory.
3. Reference analysis.
4. Runtime inference.
5. Temporary assumptions.
