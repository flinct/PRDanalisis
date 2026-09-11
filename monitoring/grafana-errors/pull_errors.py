#!/usr/bin/env python3
"""Pull errors from SatuInbox Loki every run, group by category, append JSONL + rewrite summary.
Creds: ~/.grafana_env. Output: this dir/YYYY-MM-DD.jsonl + latest-summary.md
"""
import base64, datetime, json, os, re, ssl, sys, urllib.parse, urllib.request
from collections import Counter
from pathlib import Path

OUT_DIR = Path(os.environ.get("GRAFANA_ERROR_OUT_DIR", Path(__file__).parent))
WINDOW_MIN = 5
LIMIT = 5000  # ponytail: loki maxLines cap; server max_entries_limit_per_query must be >= this, else paginate
INFRA = r"promtail|prometheus|loki|grafana|node-exporter|kube-state-metrics|ebs-csi-.*|vpa-.*|cluster-autoscaler|aws-node-termination-handler|cainjector|yace|mongodb-backup"
SELECTOR = f'{{namespace=~".+"}} | app !~ `{INFRA}` |~ `(?i)(error|exception|fatal)`'

def load_env():
    env = {}
    for line in (Path.home() / ".grafana_env").read_text().splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env

def fetch(env):
    end = int(datetime.datetime.now().timestamp())
    start = end - WINDOW_MIN * 60
    qs = urllib.parse.urlencode({
        "query": SELECTOR, "start": start * 10**9, "end": end * 10**9, "limit": LIMIT,
    })
    url = f'{env["GRAFANA_URL"]}/api/datasources/proxy/uid/loki-ds/loki/api/v1/query_range?{qs}'
    req = urllib.request.Request(url)
    tok = base64.b64encode(env["GRAFANA_AUTH"].encode()).decode()
    req.add_header("Authorization", f"Basic {tok}")
    # ponytail: unverified ctx mirrors curl --ssl-no-revoke (schannel revocation offline on this host)
    ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
        return json.load(r)

NEST = re.compile(r"ERROR \[(\w+)\]\s*(.*)")
def normalize(msg):
    msg = re.sub(r"https?://\S+", "<url>", msg)
    msg = re.sub(r"\b[0-9a-fA-F]{16,}\b", "<hex>", msg)
    msg = re.sub(r"\b[0-9a-fA-F-]{24,}\b", "<id>", msg)
    msg = re.sub(r"\b\d{6,}\b", "<n>", msg)
    return msg.strip()[:150]

def categorize(app, line):
    m = NEST.search(line)
    if m:
        return f"{app} | {m.group(1)} | {normalize(m.group(2)) or '(no message)'}"
    return f"{app} | - | {normalize(line)}"

def main():
    env = load_env()
    data = fetch(env)
    cats = Counter()
    total = 0
    for stream in data["data"]["result"]:
        app = stream["stream"].get("app", "?")
        for _ts, line in stream["values"]:
            total += 1
            cats[categorize(app, line)] += 1

    now = datetime.datetime.now()
    rec = {"ts": now.isoformat(timespec="seconds"), "window_min": WINDOW_MIN,
           "total": total, "truncated": total >= LIMIT,
           "categories": dict(cats.most_common())}
    day_file = OUT_DIR / f"{now:%Y-%m-%d}.jsonl"
    with day_file.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    lines = [f"# Grafana Error Pull — last run {rec['ts']}",
             f"Window: {WINDOW_MIN}m | total errors: {total}"
             + (" (TRUNCATED at limit)" if rec["truncated"] else ""), ""]
    if cats:
        lines += ["| n | kategori |", "|---|---|"]
        lines += [f"| {n} | {c} |" for c, n in cats.most_common(30)]
    else:
        lines.append("(no errors in window)")
    (OUT_DIR / "latest-summary.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    # stdout = delivered message (no_agent cron). Empty stdout on 0 errors = no delivery (watchdog).
    if total:
        top = "\n".join(f"{n}x  {c}" for c, n in cats.most_common(5))
        print(f"Grafana errors ({WINDOW_MIN}m): {total} total, {len(cats)} kategori"
              + (" [TRUNCATED]" if rec["truncated"] else "") + f"\nTop:\n{top}")

if __name__ == "__main__":
    if "--test" in sys.argv:  # self-check on categorize/normalize
        c = categorize("whatsapp", "[Nest] 7 - ERROR [WhatsAppMessageService] Error: Failed to fetch stream from https://mmg.whatsapp.net/v/abc?x=1")
        assert c == "whatsapp | WhatsAppMessageService | Error: Failed to fetch stream from <url>", c
        c2 = categorize("whatsapp", "[Nest] 7 - ERROR [WhatsAppMessageService] Error: error:1C800064:Provider routines::bad decrypt")
        assert "bad decrypt" in c2 and "<hex>" not in c2, c2
        assert categorize("api-gateway", "  error: 'Gone',") == "api-gateway | - | error: 'Gone',"
        print("self-check OK"); sys.exit(0)
    main()
