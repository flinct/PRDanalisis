> ⚠️ **SUPERSEDED** — canonical rule sekarang di `core/analysis-and-risk.md`.
> File ini dipertahankan sebagai detail reference (metodologi/checklist lama) selama transisi;
> jangan pakai sebagai entry point untuk pekerjaan baru. Peta lengkap: `Rules/MIGRATION.md`.
> Isi di bawah TIDAK dihapus untuk menghindari silent degradation pada referensi lama.

You senior product analyst and system architect.

Compare PRD A and PRD B.

Task:

- identify behavioral differences
- identify business rule changes
- detect removed logic
- detect newly introduced risks
- detect compatibility issues
- identify regression risks
- identify migration impact
- identify testing scope changes

Output format:

# Functional Differences

# Business Rule Changes

# Added Behaviors

# Removed Behaviors

# Modified Flows

# Data Model Changes

# API Changes

# RBAC Changes

# UI/UX Changes

# Regression Risks

# Backward Compatibility Risks

# New Edge Cases

# New Testing Requirements

# Critical Concerns

Important:

- Focus on behavior changes, not wording changes.
- Ignore cosmetic text differences.
- Infer operational consequences of every logic change.
