# 2026-09-09 — Chat–Kanban Configuration Prompt Analysis

**Objective:** Review the user's proposed Hermes prompt so Kanban Mode reuses Chat Mode configuration and preserves the configured document-output folders.

**Decision:** The prompt needs an explicit, verified filesystem/artifact contract. “Same configuration” alone is insufficient: a Kanban worker can inherit behavior yet write relative paths into its own worktree or default output directory.

**Evidence reviewed:**

- `Setup/runtime.md`, `Setup/rules-config.yaml`, `Setup/agents.yaml`, and `Setup/workflows.yaml` establish the reusable workspace workflow profile.
- `Rules/profiles/satuinbox.yml` declares canonical artifact folders, author/owner, versioning, and mandatory session-summary location.
- `AGENTS.md` documents Hermes delegation behavior and warns that worker model routing is global/flat rather than per-role.

**Recommended addition to the prompt:** Require discovery of the active profile before changes; require a single resolved canonical workspace root; require every artifact path to be validated against the profile mapping before write; prohibit writing permanent documents under Kanban-local worktrees, temporary folders, or attachment directories unless explicitly configured; and require a dry-run plus a real write-path verification.

**Changed artifacts:** This session summary only.

**Open item:** The prompt can demand an audit and implementation, but application-managed Chat-only system prompts, UI state, and unavailable credentials cannot be copied by Hermes. These must be reported with evidence and an explicit Kanban equivalent where one exists.

## Verbatim Transcript

### Turn 1 — User

analisa prompt ini, agar sama persis dengan session chat, pengaturan penulisan file document harus sama, jadi hermes tetap menulis ke folder yang sudah di tentukan

[User supplied a detailed prompt requesting an audit and migration of Chat Mode configuration to Kanban Mode, including ten audit/implementation/verification requirements and a seven-section report format.]

### Turn 1 — Assistant

Saya akan meninjau aturan workspace terlebih dahulu, lalu memetakan celah pada prompt—terutama agar konfigurasi penulisan artefak dan folder output Hermes ikut diwariskan ke Kanban.

### Turn 2 — Assistant

Saya memakai workflow analisis workspace karena permintaan ini menilai dan memperbaiki instruksi operasional Hermes. Saya akan menjaga perubahan pada level prompt/rekomendasi dulu—tanpa mengubah konfigurasi Hermes yang belum jelas ditargetkan.
