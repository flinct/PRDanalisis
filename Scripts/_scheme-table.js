'use strict';
// Per-sheet bucket breakdown for test schemes (anchor 2026-07-29).
const fs = require('fs');
const path = require('path');
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, '_tracker-dump.json'), 'utf8'));
const cores = new Map();
rows.forEach(r => { if (r.type === 'core') cores.set(`${r.sourceSheet}|${r.task.trim().toLowerCase()}`, r); });
function parentId(r) {
  if (r.type !== 'milestone') return null;
  return cores.get(`${r.sourceSheet}|${String(r.parentTask || '').trim().toLowerCase()}`) || null;
}
const withParent = rows.map(r => ({ ...r, pid: parentId(r) }));
function parseDateMs(raw) {
  const text = String(raw || '').trim();
  let m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) m = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return NaN;
  const [y, d, mo] = m[1].length === 4 ? [m[1], m[3], m[2]] : [m[3], m[1], m[2]];
  return new Date(Number(y), Number(mo) - 1, Number(d)).getTime();
}
function periodRange(offset, mode, now) {
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const span = mode === 'month' ? 28 : 7;
  const end = new Date(base);
  end.setDate(base.getDate() + 1 + offset * span);
  const start = new Date(end);
  start.setDate(end.getDate() - span);
  return [start.getTime(), end.getTime()];
}
function getPeriod(offset, mode, ref) {
  const [s, endEx] = periodRange(offset, mode, ref);
  return { start: s, end: endEx - 86400000 };
}
function overlap(row, period) {
  const startMs = parseDateMs(row.startDate || row.date);
  if (!Number.isFinite(startMs)) return false;
  if (startMs > period.end) return false;
  const endMs = row.endDate ? parseDateMs(row.endDate) : NaN;
  if (Number.isFinite(endMs)) return endMs >= period.start;
  return true;
}
function buckets(row, mode, ref) {
  const lastP = getPeriod(-1, mode, ref);
  const nowP = getPeriod(0, mode, ref);
  return { last: overlap(row, lastP), now: overlap(row, nowP) };
}
function filterTree(rows, mode, pick, ref) {
  const match = b => pick === 'both' ? (b.now || b.last) : b[pick];
  const msOk = new Map();
  rows.forEach(row => { if (row.type === 'milestone') msOk.set(row, match(buckets(row, mode, ref))); });
  return rows.filter(row => {
    if (row.type === 'milestone') return msOk.get(row);
    if (match(buckets(row, mode, ref))) return true;
    return rows.some(r => r.type === 'milestone' && r.pid === row && msOk.get(r));
  });
}
const ref = new Date(2026, 6, 29);
for (const mode of ['week', 'month']) {
  console.log(`\n=== ${mode} (anchor 2026-07-29) ===`);
  const global = { all: rows, Dany: [], Naftal: [], Agung: [] };
  rows.forEach(r => global[r.sourceSheet].push(r));
  for (const [name, set] of Object.entries(global)) {
    const now = filterTree(set, mode, 'now', ref);
    const last = filterTree(set, mode, 'last', ref);
    const both = filterTree(set, mode, 'both', ref);
    const nowIds = new Set(now);
    const lastIds = new Set(last);
    const nowOnly = both.filter(r => nowIds.has(r) && !lastIds.has(r)).length;
    const lastOnly = both.filter(r => !nowIds.has(r) && lastIds.has(r)).length;
    const bothWays = both.filter(r => nowIds.has(r) && lastIds.has(r)).length;
    const noDate = set.filter(r => !parseDateMs(r.startDate || r.date)).length;
    console.log(`${name.padEnd(6)} total=${String(set.length).padStart(3)} now=${String(now.length).padStart(3)} last=${String(last.length).padStart(3)} both=${String(both.length).padStart(3)} (nowOnly=${nowOnly} lastOnly=${lastOnly} bothWays=${bothWays}) noDate=${noDate}`);
  }
}
