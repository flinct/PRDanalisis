"""Sync conversation testcases from PRDanalisis into sixV2Automation.

Reads:
- PRDanalisis/Test/conversation/Conversation.tsv

Writes:
- PRDanalisis/Test/conversation/conversation_tests_parsed.json
- PRDanalisis/Test/conversation/conversation_tests_summary.json
- sixV2Automation/playwright/support/config/conversation-testcases.generated.json
- sixV2Automation/playwright/support/config/conversation-testcases.generated.js

This is a bridge script only. It does not create runnable Playwright specs.
It produces machine-readable test inventory that the automation repo can consume.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

BASE_PRD = Path(r"C:/Users/MyBook SAGA 12/Desktop/PRDanalisis")
BASE_AUTO = Path(r"C:/Users/MyBook SAGA 12/Desktop/sixV2Automation")
TSV_PATH = BASE_PRD / "Test/conversation/Conversation.tsv"
PARSED_JSON_PATH = BASE_PRD / "Test/conversation/conversation_tests_parsed.json"
SUMMARY_JSON_PATH = BASE_PRD / "Test/conversation/conversation_tests_summary.json"
AUTO_JSON_PATH = BASE_AUTO / "playwright/support/config/conversation-testcases.generated.json"
AUTO_JS_PATH = BASE_AUTO / "playwright/support/config/conversation-testcases.generated.js"


def split_cells(line: str) -> list[str]:
    return [cell.strip() for cell in line.rstrip("\n").split("\t")]


def parse_header(lines: list[str]) -> dict:
    header = {
        "total_cases": 0,
        "dev": {"passed": 0, "failed": 0, "need_to_test": 0, "on_test": 0, "no_status": 0},
        "stagging": {"passed": 0, "failed": 0, "need_to_test": 0, "on_test": 0, "no_status": 0},
        "prod": {"passed": 0, "failed": 0, "need_to_test": 0, "on_test": 0, "no_status": 0},
    }

    if not lines:
        return header

    # Line 1: total cases = ...
    m = re.search(r"total cases\s*=\s*\t*\s*(\d+)", lines[0], re.I)
    if m:
        header["total_cases"] = int(m.group(1))

    # Helper: extract counts from lines 3-7 by cell matching
    def get_count(line: str, keyword: str) -> int:
        cells = split_cells(line)
        for idx, cell in enumerate(cells):
            if cell.lower() == keyword.lower():
                # count is usually next non-empty numeric cell
                for nxt in cells[idx + 1 :]:
                    if nxt.isdigit():
                        return int(nxt)
        return 0

    # Existing file layout keeps counts in line 3-7, but we only need the first numeric hit per label.
    try:
        header["dev"]["passed"] = get_count(lines[2], "Passed")
        header["dev"]["failed"] = get_count(lines[3], "Failed")
        header["dev"]["need_to_test"] = get_count(lines[4], "Need to test")
        header["dev"]["on_test"] = get_count(lines[5], "On test")
        header["dev"]["no_status"] = get_count(lines[6], "No Status")

        # staging/prod are embedded in same lines; parse by order of first/second/third occurrence
        def counts_from_line(line: str):
            nums = [int(x) for x in re.findall(r"\b\d+\b", line)]
            return nums

        pass_nums = counts_from_line(lines[2])
        fail_nums = counts_from_line(lines[3])
        need_nums = counts_from_line(lines[4])
        on_nums = counts_from_line(lines[5])
        no_nums = counts_from_line(lines[6])

        # format: [dev, staging, prod]
        if len(pass_nums) >= 3:
            header["dev"]["passed"], header["stagging"]["passed"], header["prod"]["passed"] = pass_nums[:3]
        if len(fail_nums) >= 3:
            header["dev"]["failed"], header["stagging"]["failed"], header["prod"]["failed"] = fail_nums[:3]
        if len(need_nums) >= 3:
            header["dev"]["need_to_test"], header["stagging"]["need_to_test"], header["prod"]["need_to_test"] = need_nums[:3]
        if len(on_nums) >= 3:
            header["dev"]["on_test"], header["stagging"]["on_test"], header["prod"]["on_test"] = on_nums[:3]
        if len(no_nums) >= 3:
            header["dev"]["no_status"], header["stagging"]["no_status"], header["prod"]["no_status"] = no_nums[:3]
    except Exception:
        pass

    return header


def parse_tsv(path: Path) -> tuple[list[dict], dict]:
    lines = path.read_text(encoding="utf-8").splitlines()
    header = parse_header(lines[:7])

    blocks: list[list[str]] = []
    current: list[str] = []
    for line in lines[7:]:
        if line.startswith("Test ID\t") and current:
            blocks.append(current)
            current = [line]
        else:
            if line.strip() == "" and not current:
                continue
            current.append(line)
    if current:
        blocks.append(current)

    tests: list[dict] = []
    for block in blocks:
        rec = {
            "test_id": "",
            "test_id_number": None,
            "scenario": "",
            "description": "",
            "precondition": "",
            "created_at": "",
            "created_by": "",
            "tester": "",
            "date": "",
            "env_status": {"dev": "", "stagging": "", "prod": ""},
            "steps": [],
            "expected_results": [],
            "feature_group": "",
            "developed": True,
            "undeveloped_label": False,
            "raw_block": block,
        }

        for line in block:
            cells = split_cells(line)
            if not cells:
                continue
            key = cells[0]

            if key == "Test ID" and len(cells) > 1:
                rec["test_id"] = cells[1]
                m = re.search(r"(\d+)$", rec["test_id"])
                if m:
                    rec["test_id_number"] = int(m.group(1))
            elif key == "Create at":
                if len(cells) > 3:
                    rec["created_at"] = cells[3]
                if len(cells) > 6:
                    rec["created_by"] = cells[6]
                if len(cells) > 7:
                    rec["tester"] = cells[7]
            elif key == "Scenario":
                if len(cells) > 3:
                    rec["scenario"] = cells[3]
                if len(cells) > 6:
                    rec["precondition"] = cells[6]
                if len(cells) > 8:
                    rec["env_status"]["dev"] = cells[8]
                if len(cells) > 9:
                    rec["env_status"]["stagging"] = cells[9]
                if len(cells) > 10:
                    rec["env_status"]["prod"] = cells[10]
            elif key == "Url":
                if len(cells) > 6:
                    rec["description"] = cells[6]
            elif key == "Steps":
                # Example: Steps | | 1 | open... | | test type | POSITIVE
                step_text = cells[3] if len(cells) > 3 else ""
                if step_text:
                    rec["steps"].append(step_text)
            elif key == "":
                # status response / expected-result lines often start blank in column 1
                # Keep only non-empty expected result text from the standard layout.
                if len(cells) > 6 and cells[5] == "Status Response":
                    # status row, ignore
                    continue
                if len(cells) > 6 and cells[6]:
                    # The expected result text is typically at index 6
                    rec["expected_results"].append(cells[6])

        text_blob = f"{rec['scenario']} {rec['description']}"
        rec["undeveloped_label"] = "[UNDEVELOPED]" in text_blob.upper()
        rec["developed"] = not rec["undeveloped_label"]

        # Feature grouping: prefer scenario, fallback to description.
        feature_group = rec["scenario"] or rec["description"] or "Uncategorized"
        feature_group = feature_group.replace("[UNDEVELOPED]", "").strip()
        rec["feature_group"] = feature_group

        tests.append(rec)

    return tests, header


def build_summary(tests: list[dict], header: dict) -> dict:
    feature_counts = Counter(t["feature_group"] for t in tests)
    developed = sum(1 for t in tests if t["developed"])
    undeveloped = len(tests) - developed

    summary = {
        "count": len(tests),
        "developed_count": developed,
        "undeveloped_count": undeveloped,
        "header": header,
        "feature_groups": dict(sorted(feature_counts.items(), key=lambda kv: (-kv[1], kv[0]))),
        "tests": [
            {
                "test_id": t["test_id"],
                "scenario": t["scenario"],
                "description": t["description"],
                "feature_group": t["feature_group"],
                "developed": t["developed"],
                "undeveloped_label": t["undeveloped_label"],
            }
            for t in tests
        ],
    }
    return summary


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def write_js_module(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = "module.exports = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
    path.write_text(content, encoding="utf-8")


def main() -> None:
    tests, header = parse_tsv(TSV_PATH)
    summary = build_summary(tests, header)

    # Write PRDanalisis artifacts
    write_json(PARSED_JSON_PATH, tests)
    write_json(SUMMARY_JSON_PATH, summary)

    # Write automation repo artifacts
    auto_manifest = [
        {
            "test_id": t["test_id"],
            "test_id_number": t["test_id_number"],
            "scenario": t["scenario"],
            "description": t["description"],
            "feature_group": t["feature_group"],
            "developed": t["developed"],
            "undeveloped_label": t["undeveloped_label"],
            "created_at": t["created_at"],
            "created_by": t["created_by"],
            "tester": t["tester"],
            "date": t["date"],
            "env_status": t["env_status"],
            "steps": t["steps"],
        }
        for t in tests
    ]
    write_json(AUTO_JSON_PATH, auto_manifest)
    write_js_module(AUTO_JS_PATH, auto_manifest)

    # Print a concise report for humans and cron/logging.
    print(json.dumps({
        "source": str(TSV_PATH),
        "parsed_json": str(PARSED_JSON_PATH),
        "summary_json": str(SUMMARY_JSON_PATH),
        "automation_json": str(AUTO_JSON_PATH),
        "automation_js": str(AUTO_JS_PATH),
        "total_cases": len(tests),
        "developed": summary["developed_count"],
        "undeveloped": summary["undeveloped_count"],
        "top_feature_groups": list(summary["feature_groups"].items())[:10],
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
