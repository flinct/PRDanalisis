#!/usr/bin/env python3
"""Step 6 activation: banner/stub/delete the 20 legacy Rules files.

- Fully-migrated files -> pure stub redirect (content already lives in new location).
- Methodology-heavy files -> prepend redirect banner, KEEP content (no data loss).
- analisa-prd-rule.md -> delete (already a deprecated stub).
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent

STUB = {}  # no "pure stub" files — every legacy file keeps full content + banner (no data loss)

BANNER = {
    "agent-instruction.md": "core/task-router.md (+ profiles/satuinbox.yml untuk bootstrap produk)",
    "workflow-rule.md": "core/task-router.md + core/change-management.md",
    "requirements-lifecycle-rule.md": "core/change-management.md (+ profiles/satuinbox.yml governance)",
    "structure-rule.md": "profiles/satuinbox.yml (project.repository)",
    "summary-rule.md": "core/artifact-governance.md",
    "qa-analysis-rule.md": "core/analysis-and-risk.md + core/test-design.md",
    "impact-analysis-rule.md": "core/analysis-and-risk.md",
    "prd-writing-rule.md": "core/requirements.md (+ profiles/satuinbox.yml untuk ID/bahasa/role)",
    "prd-comparison-rule.md": "core/analysis-and-risk.md",
    "test-case-rule.md": "core/test-design.md + formats/satuinbox-manual-tsv.md",
    "memory-routing-rule.md": "core/knowledge-management.md",
    "memory-write-rule.md": "core/knowledge-management.md",
    "memory-update-rule.md": "core/knowledge-management.md",
    "global-memory-write-rule.md": "core/knowledge-management.md",
    "global-memory-update-rule.md": "core/knowledge-management.md",
    "prototype-rule.md": "profiles/satuinbox.yml (project.repository.prototypes)",
    "automation-bridge-rule.md": "integrations/satuinbox-playwright-bridge.md",
    "release-notes-rule.md": "integrations/satuinbox-openproject-adapter.md",
    "uat-rule.md": "integrations/satuinbox-openproject-adapter.md",
}

DELETE = ["analisa-prd-rule.md"]


def banner_text(new_path):
    return (
        f"> ⚠️ **SUPERSEDED** — canonical rule sekarang di `{new_path}`.\n"
        "> File ini dipertahankan sebagai detail reference (metodologi/checklist lama) selama transisi;\n"
        "> jangan pakai sebagai entry point untuk pekerjaan baru. Peta lengkap: `Rules/MIGRATION.md`.\n"
        "> Isi di bawah TIDAK dihapus untuk menghindari silent degradation pada referensi lama.\n\n"
    )


def stub_text(new_path):
    return (
        f"> **MOVED** — isi rule ini sudah dipindah UTUH ke `{new_path}`.\n"
        "> File ini dipertahankan sebagai compatibility redirect; jangan pakai untuk pekerjaan baru.\n"
    )


def main():
    for fname, new_path in STUB.items():
        p = ROOT / fname
        p.write_text(stub_text(new_path), encoding="utf-8")
        print(f"STUB   {fname} -> {new_path}")

    for fname, new_path in BANNER.items():
        p = ROOT / fname
        old = p.read_text(encoding="utf-8")
        if old.startswith("> ⚠️ **SUPERSEDED**"):
            print(f"SKIP   {fname} (already bannered)")
            continue
        p.write_text(banner_text(new_path) + old, encoding="utf-8")
        print(f"BANNER {fname} -> {new_path}")

    for fname in DELETE:
        p = ROOT / fname
        if p.exists():
            p.unlink()
            print(f"DELETE {fname}")

    print("DONE")


if __name__ == "__main__":
    main()
