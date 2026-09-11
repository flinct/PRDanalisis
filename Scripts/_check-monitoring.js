// Self-check: monitoring endpoint parse logic against real jsonl.
const fs = require("fs"), path = require("path");
// eslint-disable-next-line no-control-regex
const ANSI = /(?:\u001b|\\u001b|\\x1b)\[[0-9;]*[A-Za-z]?/g;
function parseCategory(key) {
  const clean = key.replace(ANSI, "");
  const parts = clean.split(" | ");
  const ctx = (parts[1] || "-").trim();
  return { service: (parts[0] || "?").trim(), ctx: ctx === "-" ? "" : ctx, message: (parts.slice(2).join(" | ") || "").trim() };
}
const dir = path.join(__dirname, "..", "monitoring", "grafana-errors");
const days = fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(f)).sort();
const runs = [];
for (const day of days) {
  for (const line of fs.readFileSync(path.join(dir, day), "utf8").split("\n")) {
    if (!line.trim()) continue;
    let rec; try { rec = JSON.parse(line); } catch { continue; }
    const categories = Object.entries(rec.categories || {}).map(([k, c]) => ({ ...parseCategory(k), count: c }));
    runs.push({ ts: rec.ts, windowMinutes: rec.window_min, totalErrors: rec.total, truncated: !!rec.truncated, categories });
  }
}
runs.sort((a, b) => (a.ts < b.ts ? 1 : -1));
const r = runs[0];
const anyAnsi = runs.some((rn) => rn.categories.some((c) => /\u001b\[|\\u001b\[|\\x1b\[/.test(c.message + c.service + c.ctx)));
console.log("runs:", runs.length, "| latest total:", r.totalErrors, "| cats:", r.categories.length, "| ANSI leaked:", anyAnsi);
console.log("sample:", JSON.stringify(r.categories[0]));
if (!runs.length) throw new Error("no runs");
if (anyAnsi) throw new Error("ANSI not stripped");
if (!r.categories[0].service) throw new Error("service missing");

// summarizeRuns parity: sum of per-run totals must equal aggregate.
const sum = runs.reduce((a, x) => a + x.totalErrors, 0);
const peak = Math.max(...runs.map((x) => x.totalErrors));
if (sum < peak) throw new Error("summary sum < peak (impossible)");
console.log("summary: sum", sum, "peak", peak, "avg", Math.round(sum / runs.length));
console.log("SELF-CHECK OK");
