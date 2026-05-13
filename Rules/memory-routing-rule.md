# Memory Routing Rules

Purpose:
Determine whether discovered knowledge belongs to global memory, feature memory, or should not be persisted.

---

# Global Memory Criteria

Store in global memory if the knowledge:

- is reusable across multiple features
- defines system-wide behavior
- defines shared lifecycle or state machine
- defines shared RBAC logic
- defines shared architectural constraints
- defines shared integration behavior
- defines core entity definitions
- defines canonical workflow rules
- documents organization-wide risk patterns
- is repeatedly referenced across feature memories

Examples: chat lifecycle, assignment flow, webhook behavior, RBAC inheritance, queue ownership model.

---

# Feature Memory Criteria

Store in feature memory if the knowledge:

- is feature-specific behavior
- documents local edge cases
- documents feature-only dependencies
- describes isolated UI behavior
- documents feature-local risks
- defines feature-specific business rules

Examples: broadcast recipient filtering, duplicate merge strategy, lead conversion flow.

---

# Do NOT Persist

Do NOT store:

- feature-local UI detail
- isolated validation logic
- temporary implementation details
- experimental workflows
- one-off business exceptions
- temporary assumptions
- verbose explanations
- raw PRD text
- generated test cases
- speculative reasoning

---

# Deduplication Rules

- Never duplicate canonical rules across feature memories.
- Feature memory should reference global behavior instead of redefining it.
- Global memory is the source of truth for shared rules.

---

# Conflict Rules

If feature memory contradicts global memory:

1. Flag inconsistency.
2. Do not overwrite automatically.
3. Require clarification or explicit confirmation.

---

# Update Priority

Priority order:

1. Global canonical memory.
2. Feature memory.
3. Runtime inference.
4. Temporary assumptions.
