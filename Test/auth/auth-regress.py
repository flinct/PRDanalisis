#!/usr/bin/env python3
"""Auth regression: parse Playwright JSON result, diff vs baseline, write sidecar + report.

Usage:
    node ... playwright test ... --reporter=json > result.json
    python auth-regress.py result.json [--env DEV]

Diff is vs Test/auth/auth-automation-results.json (previous run). Skipped (test.fixme) ignored.
ponytail: keyed by "specfile::title" (auth specs have no [ID] tags); manual AUTH.exec.json left untouched.
"""
import json, os, re, sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # PRDanalisis root
SIDECAR = os.path.join(ROOT, "Test", "auth", "auth-automation-results.json")
REPORT  = os.path.join(ROOT, "Test", "auth", "auth-regression-report.md")

def parse(result_json):
    with open(result_json, encoding="utf-8") as f:
        data = json.load(f)
    rows = []
    def walk(suites):
        for s in suites:
            for spec in s.get("specs", []):
                fn = (s.get("file") or spec.get("file") or "").replace("\\","/").split("/")[-1]
                for t in spec.get("tests", []):
                    res = t.get("results", [])
                    r = res[-1]["status"] if res else "?"
                    err = ""
                    if res:
                        msg = (res[-1].get("error", {}) or {}).get("message", "") or ""
                        msg = re.sub(r"\x1b\[[0-9;]*m", "", msg).strip().splitlines()
                        err = msg[0][:160] if msg else ""
                    rows.append({"file": fn, "title": spec.get("title"), "result": r, "err": err})
            walk(s.get("suites", []))
    walk(data.get("suites", []))
    return data.get("stats", {}), rows

def diff(cur, prev):
    d = {"regressions": [], "fixed": [], "new_fail": [], "new_pass": [], "still_fail": []}
    for k, v in cur.items():
        p = prev.get(k)
        if p is None:
            d["new_fail" if v["status"] == "Failed" else "new_pass"].append(k)
        elif p["status"] == "Passed" and v["status"] == "Failed":
            d["regressions"].append(k)
        elif p["status"] == "Failed" and v["status"] == "Passed":
            d["fixed"].append(k)
        elif v["status"] == "Failed":
            d["still_fail"].append(k)
    return d

def main():
    if len(sys.argv) < 2:
        sys.exit("usage: auth-regress.py result.json [--env DEV]")
    result_json = sys.argv[1]
    env = sys.argv[sys.argv.index("--env")+1] if "--env" in sys.argv else "DEV"

    stats, rows = parse(result_json)
    cur = {}
    for r in rows:
        if r["result"] == "skipped":  # test.fixme
            continue
        cur[f'{r["file"]}::{r["title"]}'] = {
            "status": "Failed" if r["result"] in ("failed", "timedOut") else "Passed",
            "err": r["err"],
        }

    prev = {}
    if os.path.exists(SIDECAR):
        with open(SIDECAR, encoding="utf-8") as f:
            prev = json.load(f).get("results", {})

    d = diff(cur, prev)
    npass = sum(1 for v in cur.values() if v["status"] == "Passed")
    nfail = len(cur) - npass
    skipped = sum(1 for r in rows if r["result"] == "skipped")

    with open(SIDECAR, "w", encoding="utf-8") as f:
        json.dump({"ran_at": datetime.now().isoformat(), "env": env,
                   "stats": stats, "results": cur, "diff": d}, f, indent=2, ensure_ascii=False)

    write_report(env, stats, cur, d, npass, nfail, skipped)
    print(f"pass={npass} fail={nfail} skipped={skipped} | "
          f"REGRESSIONS={len(d['regressions'])} fixed={len(d['fixed'])} new_fail={len(d['new_fail'])}")
    # exit 2 on regression so CI/skill can gate
    sys.exit(2 if d["regressions"] else 0)

def write_report(env, stats, cur, d, npass, nfail, skipped):
    lines = [f"# Auth Regression Report",
             f"", f"> Env: **{env}** · Ran: {datetime.now().strftime('%Y-%m-%d %H:%M')} · "
             f"Duration: {round(stats.get('duration',0)/1000)}s",
             f"",
             f"| | Count |", f"|---|---|",
             f"| ✅ Passed | {npass} |", f"| ❌ Failed | {nfail} |",
             f"| ⊘ Skipped (fixme) | {skipped} |", f""]
    if d["regressions"]:
        lines += [f"## 🔴 REGRESSIONS ({len(d['regressions'])}) — was passing, now failing", ""]
        for k in d["regressions"]:
            lines.append(f"- `{k}` — {cur[k]['err']}")
        lines.append("")
    if d["fixed"]:
        lines += [f"## 🟢 Fixed ({len(d['fixed'])}) — was failing, now passing", ""]
        lines += [f"- `{k}`" for k in d["fixed"]] + [""]
    fails = [k for k, v in cur.items() if v["status"] == "Failed"]
    if fails:
        lines += [f"## Failing tests ({len(fails)})", ""]
        for k in fails:
            tag = " 🔴NEW-REGRESSION" if k in d["regressions"] else ""
            lines.append(f"- `{k}`{tag}\n  - {cur[k]['err']}")
        lines.append("")
    lines += [f"## Passing ({npass})", ""]
    lines += [f"- `{k}`" for k, v in cur.items() if v["status"] == "Passed"]
    with open(REPORT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

if __name__ == "__main__":
    main()
