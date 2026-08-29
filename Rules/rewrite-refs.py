#!/usr/bin/env python3
"""Step 6b: rewrite rule-name references in decision-bearing docs to new paths.

Targets: WORKFLOW_CONTEXT.md + operational templates + Setup/runtime.md.
Historical artifacts (Assessments/**/versions, summary/, port/, presentation/)
are LEFT AS-IS: they record what was applied at the time, and the stub redirects
already resolve old names. AGENTS.md / CLAUDE.md are protected agent-instruction
files and are updated separately (require user approval).
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # PRDanalisis/

MAP = {
    "qa-analysis-rule.md": "core/analysis-and-risk.md",
    "impact-analysis-rule.md": "core/analysis-and-risk.md",
    "workflow-rule.md": "core/task-router.md",
    "requirements-lifecycle-rule.md": "core/change-management.md",
    "prd-writing-rule.md": "core/requirements.md",
    "prd-comparison-rule.md": "core/analysis-and-risk.md",
    "test-case-rule.md": "core/test-design.md",
    "automation-bridge-rule.md": "integrations/satuinbox-playwright-bridge.md",
    "memory-routing-rule.md": "core/knowledge-management.md",
    "memory-write-rule.md": "core/knowledge-management.md",
    "memory-update-rule.md": "core/knowledge-management.md",
    "global-memory-write-rule.md": "core/knowledge-management.md",
    "global-memory-update-rule.md": "core/knowledge-management.md",
    "structure-rule.md": "profiles/satuinbox.yml",
    "summary-rule.md": "core/artifact-governance.md",
    "release-notes-rule.md": "integrations/satuinbox-openproject-adapter.md",
    "uat-rule.md": "integrations/satuinbox-openproject-adapter.md",
    "agent-instruction.md": "core/task-router.md",
    "prototype-rule.md": "profiles/satuinbox.yml",
    "analisa-prd-rule.md": "core/analysis-and-risk.md",
}

TARGETS = [
    "WORKFLOW_CONTEXT.md",
    "Setup/runtime.md",
    "Assessments/templates/qa-assessment-report-template.md",
    "Assessments/templates/Setup/change-intake-brief-template.md",
    "Assessments/templates/Setup/assessment-report-template.md",
    "Assessments/templates/Setup/qa-pre-implementation-review-template.md",
    "Assessments/templates/Setup/qa-post-implementation-validation-template.md",
    "Assessments/templates/Setup/automation-mapping-template.md",
    "Assessments/templates/Setup/reviewer-decision-template.md",
    "Assessments/templates/Setup/setup-file-schema.md",
]


def rewrite(text):
    for old, new in MAP.items():
        text = text.replace(old, new)
    # collapse duplicated adjacent "core/analysis-and-risk.md"
    text = text.replace("core/analysis-and-risk.md, core/analysis-and-risk.md",
                        "core/analysis-and-risk.md")
    text = text.replace("core/knowledge-management.md, core/knowledge-management.md",
                        "core/knowledge-management.md")
    return text


def main():
    for rel in TARGETS:
        p = ROOT / rel
        if not p.exists():
            print(f"MISS   {rel}")
            continue
        old = p.read_text(encoding="utf-8")
        new = rewrite(old)
        if new == old:
            print(f"CLEAN  {rel}")
            continue
        p.write_text(new, encoding="utf-8")
        print(f"UPDATED {rel}")


if __name__ == "__main__":
    main()
