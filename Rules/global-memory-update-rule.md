# Global Memory Update Rules

Purpose:
Safely evolve canonical system memory without breaking consistency.

---

# Update Principles

Never overwrite global memory blindly.

Always:

1. Compare existing global rules.
2. Detect conflicts.
3. Preserve canonical terminology.
4. Validate cross-feature consistency.
5. Merge incrementally.

---

# Allowed Updates

Update global memory only if:

- new rule appears across multiple features
- architecture understanding improves
- existing canonical rule confirmed outdated
- recurring pattern becomes stable

---

# Conflict Handling

If new PRD contradicts global memory:

1. Flag inconsistency.
2. Preserve existing canonical rule.
3. Require explicit confirmation before replacement.

If feature memory contradicts global memory:

1. Flag inconsistency.
2. Do not overwrite automatically.
3. Require clarification or explicit confirmation.

---

# Deduplication

Do NOT duplicate:

- feature-local rules
- isolated workflows
- temporary business exceptions

---

# Stability Rules

Prefer:

- stable business logic
- reusable architecture understanding
- long-term system behavior

Avoid:

- volatile implementation details
- sprint-level temporary logic
