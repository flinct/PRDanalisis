# Repository Structure Rules

**Purpose:** Define where files belong in this repository to keep it organized, predictable, and automation-friendly.

---

## Root Directory (`PRDanalisis/`)

Only permanent project-wide files live here:

| Item | Description |
|------|-------------|
| `PRD/` | Product Requirement Documents (organized by feature domain) |
| `Test/` | Test cases, test data, test scripts, automation outputs |
| `Rules/` | Agent workflow and methodology rules |
| `Memory/` | Agent persistent memory (global + feature-specific) |
| `Temp Analysis/` | Temporary analysis reports (see below) |
| `BRD/` | Business Requirement Documents |
| `Feature List/` | Feature inventory and roadmap |
| `Portfolio/` | Project portfolio documents |
| `Release notes/` | Release/changelog notes |

**Never** dump generated/analysis files directly in root.

---

## `Temp Analysis/` — Temporary Analysis Reports

All analysis documents, gap analyses, mapping reports go here:

- `Temp Analysis/*.md` — single analysis report
- `Temp Analysis/scripts/*.py` — any script written specifically for a one-time analysis or migration task
- `Temp Analysis/references/*` — reference data used during analysis

### Convention:
- **File naming:** lowercase, hyphens, no spaces: `analisis-prd-vs-testcase.md`
- **Script naming:** `Temp Analysis/scripts/<descriptive-name>.py`
- After analysis is complete and no longer needed, scripts may be deleted

---

## `Test/` — Test Artifacts

| Path | Contents |
|------|----------|
| `Test/<feature>/` | Test case files (TSV, CSV, etc.) organized by feature |
| `Test/<feature>/<filename>.tsv` | Main test case file |
| `Test/<feature>/<filename>.json` | Parsed/summary JSON auto-generated from TSV |
| `Test/<feature>/<filename>_supplement.tsv` | Supplementary/gap test cases |

### Convention:
- Every test TSV lives in `Test/<feature>/`, never in root
- JSON files derived from TSV live alongside their TSV source
- Gap/supplement files share the same folder as the main file
- Scripts that generate/modify test artifacts go in `Temp Analysis/scripts/`, **not** in `Test/`

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
- Scripts that read/parse these files go to `Temp Analysis/scripts/`
- The Conversation.tsv file uses format compatible with script parsing:
  - Tab-separated
  - Header rows 1-7 (summary + env status)
  - Each test block starts with `Test ID\t<id>`

---

## What NOT To Do

| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| Drop analysis `.md` in root | Put in `Temp Analysis/` |
| Drop scripts in root | Put in `Temp Analysis/scripts/` |
| Drop JSON near TSV but in wrong folder | Keep in `Test/<feature>/` alongside TSV |
| Create new top-level folders for one-off work | Use existing `Temp Analysis/` or `Test/` |
