#!/usr/bin/env python3
"""Validate the PRDanalisis reusable rules pack split.

Asserts three things that would otherwise silently regress:
  1. core/*.md is universal (no SatuInbox product/tracker/person/absolute-path tokens)
  2. profiles/satuinbox.yml encodes STRICT governance with the full non-bypassable set
  3. all three profiles parse and declare a valid, DIFFERENT governance mode
     (strict / light / governed) — proving the core is reusable across profiles.

Run:  python Rules/validate-rules-pack.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CORE = ROOT / "core"
PROFILES = ROOT / "profiles"

# Tokens that MUST NOT appear in universal core rules.
FORBIDDEN_CORE = [
    "satuinbox", "SatuInbox", "conversation", "ticket", "whatsapp",
    "broadcast", "contact", "OpenProject", "openproject", "sixV2Automation",
    "Dany", "Naftal", "gRPC", "RabbitMQ", "MongoDB", "Socket.IO", "Zustand",
    "Tailwind", "Next.js", "Turborepo", "SIX-", "dev-v2.satuinbox.com",
    r"C:\\Users", "prod-2.7.0", "ordo.co.id",
]

NON_BYPASSABLE_SATUINBOX = {
    "phase0_change_intake", "change_intake_brief", "stage_transition_confirmation",
    "protected_existing_behavior", "impact_analysis_shared",
    "assessment_report_decision", "reviewer_gates", "requirement_package_freeze",
    "decision_enum", "traceability", "no_invented_test_results",
    "no_production_pii", "version_and_changelog", "memory_conflict_flag",
    "summary_transcript_verbatim",
}


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


def load_profile_text(name):
    return (PROFILES / name).read_text(encoding="utf-8")


def test_core_is_universal():
    core_files = sorted(CORE.glob("*.md"))
    assert len(core_files) == 7, f"expected 7 core rules, got {len(core_files)}"
    for f in core_files:
        text = f.read_text(encoding="utf-8")
        for tok in FORBIDDEN_CORE:
            if tok.lower() in text.lower():
                fail(f"{f.name} leaks project token: {tok!r}")
    print(f"PASS core is universal ({len(core_files)} files, 0 project tokens)")


def test_satuinbox_strict():
    text = load_profile_text("satuinbox.yml")
    if "mode: strict" not in text:
        fail("satuinbox.yml governance.mode is not strict")
    if "summary_transcript_verbatim" not in text:
        fail("satuinbox.yml missing summary_transcript_verbatim non-bypassable control")
    if "transcript:\n    required: true" not in text:
        fail("satuinbox.yml summary.transcript.required is not true")
    block = text.split("non_bypassable:", 1)[1]
    block = block.split("change_management:", 1)[0]  # stop at next key
    declared = set(re.findall(r"-\s+(\w+)", block))
    missing = NON_BYPASSABLE_SATUINBOX - declared
    if missing:
        fail(f"satuinbox.yml missing non-bypassable controls: {sorted(missing)}")
    print(f"PASS satuinbox strict ({len(declared)} non-bypassable controls declared)")


def test_three_profiles_differ():
    modes = {}
    for name in ["satuinbox.yml",
                 "_examples/simple-greenfield.yml",
                 "_examples/high-compliance-regulated.yml"]:
        p = PROFILES / name
        if not p.exists():
            fail(f"missing profile {name}")
        text = p.read_text(encoding="utf-8")
        m = re.search(r"mode:\s*(\w+)", text)
        if not m:
            fail(f"{name} has no governance.mode")
        modes[name] = m.group(1)
    expected = {"satuinbox.yml": "strict",
                "_examples/simple-greenfield.yml": "light",
                "_examples/high-compliance-regulated.yml": "governed"}
    if modes != expected:
        fail(f"governance modes wrong: {modes}")
    print(f"PASS three profiles map to distinct modes: {modes}")


if __name__ == "__main__":
    test_core_is_universal()
    test_satuinbox_strict()
    test_three_profiles_differ()
    print("ALL CHECKS PASSED")
