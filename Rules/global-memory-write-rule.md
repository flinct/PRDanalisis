# Global Memory Write Rules

Purpose:
Create and maintain stable, reusable, system-wide engineering memory.

---

# Writing Principles

Global memory must:

- represent canonical system truth
- be reusable across features
- remain stable over time
- avoid feature-local implementation detail
- use concise declarative rules
- preserve architectural consistency

---

# Allowed Content

- shared entity behavior
- global lifecycle or state flow
- shared RBAC logic
- shared integration flow
- architecture constraints
- cross-feature dependencies
- reusable operational rules
- recurring system risks

---

# Forbidden Content

Do NOT store:

- feature-local UI detail
- temporary workaround
- speculative assumptions
- implementation noise
- raw PRD explanation
- verbose reasoning
- generated test cases

---

# Writing Style

Prefer:

- bullet points
- short declarative rules
- canonical wording
- stable terminology

Avoid:

- narrative paragraphs
- duplicated logic
- feature-specific wording

---

# Canonical Priority

Global memory:

- primary reasoning source
- reusable system context
- conflict reference point

---

# Incremental Learning

Global memory MUST evolve incrementally.
Do NOT regenerate global memory from scratch unless explicitly requested.
