> ⚠️ **SUPERSEDED** — canonical rule sekarang di `profiles/satuinbox.yml (project.repository)`.
> File ini dipertahankan sebagai detail reference (metodologi/checklist lama) selama transisi;
> jangan pakai sebagai entry point untuk pekerjaan baru. Peta lengkap: `Rules/MIGRATION.md`.
> Isi di bawah TIDAK dihapus untuk menghindari silent degradation pada referensi lama.

# Repository Structure Rules

**Purpose:** Define where files belong in this repository to keep it organized, predictable, and automation-friendly.

---

## Root Directory (`PRDanalisis/`)

Only permanent project-wide files live here:

| Item | Description |
|------|-------------|
| `PRD/` | Product Requirement Documents (organized by feature domain) |
| `Assessments/` | Permanent assessment reports, reusable reference analyses, version history, and templates |
| `Scripts/` | Reusable analysis, parsing, migration, and automation helper scripts |
| `Test/` | Test cases, test data, test scripts, automation outputs |
| `Rules/` | Agent workflow and methodology rules |
| `Memory/` | Agent persistent memory (global + feature-specific baseline + navigation index) |
| `BRD/` | Business Requirement Documents |
| `Feature List/` | Feature inventory and roadmap |
| `Portfolio/` | Project portfolio documents |
| `Release notes/` | Release/changelog notes |

**Never** dump generated/analysis files directly in root.

---

## `Assessments/` — Permanent QA Assessment Artifacts

All formal QA assessment outputs live here:

- `Assessments/templates/Setup/change-intake-brief-template.md` — canonical workflow template for Phase 0 Change Intake Brief
- `Assessments/templates/qa-assessment-report-template.md` — canonical template for new assessment reports
- `Assessments/reference/*.md` — reusable PRD analysis references (comparison, deep-dive, loophole map) that are not decision reports
- `Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md` — latest/current change-intake artifact for a feature
- `Assessments/<domain>/<feature-slug>/<feature-slug>-qa-assessment.md` — latest approved/current assessment artifact for a feature
- `Assessments/<domain>/<feature-slug>/versions/<feature-slug>-change-intake-brief-v1.0.md` — immutable historical change-intake versions
- `Assessments/<domain>/<feature-slug>/versions/<feature-slug>-qa-assessment-v1.0.md` — immutable historical versions
- `Assessments/templates/Setup/*.md` — reusable workflow templates for Assessment Report, QA pre/post validation, reviewer decision, and automation mapping
- `Assessments/archive/legacy-temp-analysis/` — migrated historical analysis documents from the removed `Temp Analysis/` folder

### Convention:
- **Use `Assessments/` for all persisted analysis documents**
- **Domain folders** should mirror the PRD source area when practical (`conversation/`, `ticket/`, `whatsapp-web/`, etc.)
- **Reference analyses** that are reusable across tasks belong in `Assessments/reference/`
- **Feature folders** should be lowercase, hyphenated, and stable over time
- **Change Intake Brief** and **Assessment Report** for the same feature should live in the same folder
- **Latest report path** should stay stable; revisions go into `versions/`
- **Later requirement changes** must update the feature's `*-change-intake-brief.md` first before downstream artifacts are patched
- Every updated Change Intake Brief must include a **version value**, **previous version reference**, and **ringkasan perubahan scope / routing**
- Every updated assessment must include a **version value**, **previous version reference**, and **ringkasan perubahan analisa**
- The logical artifact name is **Assessment Report**; persisted filenames may continue using `-qa-assessment.md` until repo-wide migration
- The report must follow the template in `Assessments/templates/qa-assessment-report-template.md`

---

## `Scripts/` — Analysis and Automation Helper Scripts

All reusable scripts for analysis, parsing, migration, and automation support live here:

- `Scripts/analysis/*.py` — active analysis/parsing/migration helpers
- `Scripts/analysis/legacy-temp-analysis/*.py` — scripts migrated from the removed `Temp Analysis/scripts/`

### Convention:
- **Script naming:** lowercase, hyphen-separated, descriptive
- Scripts should not be stored in root or mixed into assessment folders
- One-off logic should still prefer a reusable script if it may be needed again

---

## `Test/` — Test Artifacts

| Path | Contents |
|------|----------|
| `Test/<feature>/` | Test case files (TSV, CSV, etc.) organized by feature |
| `Test/<feature>/<filename>.tsv` | Main test case file |
| `Test/<feature>/<filename>.json` | Parsed/summary JSON auto-generated from TSV |
| `Test/<feature>/<filename>_supplement.tsv` | Supplementary/gap test cases |
| `Test/<feature>/<feature>-qa-test-spec.md` | Detailed QA test specification / companion doc |
| `Test/<feature>/<feature>-automation-mapping.md` | Requirement-to-automation mapping companion doc |
| `Test/<feature>/<feature>-qa-pre-implementation-review.md` | QA pre-implementation review companion doc |
| `Test/<feature>/<feature>-qa-post-implementation-validation.md` | QA post-implementation validation companion doc |

### Convention:
- Every test TSV lives in `Test/<feature>/`, never in root
- JSON files derived from TSV live alongside their TSV source
- Gap/supplement files share the same folder as the main file
- Supporting QA markdown docs also live in `Test/<feature>/` when they are execution-facing artifacts
- Scripts that generate/modify test artifacts go in `Scripts/analysis/`, **not** in `Test/`

---

## PRD Documents

| Path | Contents |
|------|----------|
| `PRD/<feature>/` | PRD files for a specific feature (organized by domain) |
| `PRD/<feature>v2/` | Version 2 PRDs (e.g., `Conversationv2/`, `ticketv2/`) |

- PRD files use descriptive names: `PRD Inbox Conversation - room.md`
- One feature per file, not monolithic documents
- Cross-feature dependencies should reference other PRD files

---

## Automation Readiness

When creating files for automation script consumption:
- TSV files go to `Test/<feature>/`
- Scripts that read/parse these files go to `Scripts/analysis/`
- The Conversation.tsv file uses format compatible with script parsing:
  - Tab-separated
  - Header rows 1-7 (summary + env status)
  - Each test block starts with `Test ID\t<id>`

---

## What NOT To Do

| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| Drop persisted analysis `.md` in root | Put it in `Assessments/<domain>/<feature-slug>/` |
| Keep ad-hoc analysis docs in a deprecated temp folder | Version the assessment in `Assessments/.../versions/` and summarize changes |
| Drop scripts in root | Put them in `Scripts/analysis/` |
| Drop JSON near TSV but in wrong folder | Keep in `Test/<feature>/` alongside TSV |
| Create new top-level folders for one-off work | Use existing `Assessments/`, `Scripts/`, or `Test/` |
