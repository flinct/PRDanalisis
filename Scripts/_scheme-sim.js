'use strict';
// Compute expectations for candidate period schemes against REAL sheet data.
// Replicates the ui-tracker period math (periodRange/getPeriod/isPeriodOverlap/isOverride).
const fs = require('fs');
const path = require('path');
const rows = JSON.parse(fs.readFileSync(path.join(__dirname, '_tracker-dump.json'), 'utf8'));

const WEEK_OPTIONS = ['now', 'last'];
function normalizeDate(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{2}-\d{2}-\d{4}$/.test(text)) {
    const [day, month, year] = text.split('-');
    return `${year}-${month}-${day}`;
  }
  return text;
}
function parseDateMs(raw) {
  const text = normalizeDate(raw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return NaN;
  const [y, m, d] = text.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}
function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
function isPeriodOverlap(row, period) {
  const startMs = parseDateMs(row.startDate || row.date);
  if (!Number.isFinite(startMs)) return false;
  if (startMs > period.end) return false;
  const endMs = row.endDate ? parseDateMs(row.endDate) : NaN;
  if (Number.isFinite(endMs)) return endMs >= period.start;
  return true;
}
function isOverride(row, bucketType) {
  const w = String(row.week || '').trim().toLowerCase();
  if (!w) return false;
  if (w === 'now') return bucketType === 'now';
  if (w === 'last') return bucketType === 'last';
  return false;
}
function periodBuckets(row, mode, ref) {
  const lastPeriod = getPeriod(-1, mode, ref);
  const nowPeriod = getPeriod(0, mode, ref);
  return {
    last: isPeriodOverlap(row, lastPeriod) || isOverride(row, 'last'),
    now: isPeriodOverlap(row, nowPeriod) || isOverride(row, 'now'),
  };
}
function filterRowsByPeriod(rows, mode, pick, ref) {
  const match = b => pick === 'both' ? (b.now || b.last) : b[pick];
  const milestoneOk = new Map();
  rows.forEach(row => {
    if (row.type !== 'milestone') return;
    milestoneOk.set(row.id, match(periodBuckets(row, mode, ref)));
  });
  return rows.filter(row => {
    if (row.type === 'milestone') return milestoneOk.get(row.id);
    if (match(periodBuckets(row, mode, ref))) return true;
    return rows.some(r => r.type === 'milestone' && r.parentTaskId === row.id && milestoneOk.get(r.id));
  });
}
// parent ids are synthetic row-N from FE; real sheet uses titles. Approximate:
// core rows with same normalized task title in same sheet are the same core.
const cores = new Map();
rows.forEach(r => { if (r.type === 'core') cores.set(`${r.sourceSheet}|${r.task.trim().toLowerCase()}`, r); });
function parentId(r) {
  if (r.type !== 'milestone') return null;
  return cores.get(`${r.sourceSheet}|${String(r.parentTask || '').trim().toLowerCase()}`) || null;
}
const withParent = rows.map(r => ({ ...r, pid: parentId(r) }));
function filterTree(rows, mode, pick, ref) {
  const match = b => pick === 'both' ? (b.now || b.last) : b[pick];
  const msOk = new Map();
  rows.forEach(row => { if (row.type === 'milestone') msOk.set(row, match(periodBuckets(row, mode, ref))); });
  return rows.filter(row => {
    if (row.type === 'milestone') return msOk.get(row);
    if (match(periodBuckets(row, mode, ref))) return true;
    return rows.some(r => r.type === 'milestone' && r.pid === row && msOk.get(r));
  });
}
function summarize(rows) {
  const total = rows.length;
  const complete = rows.filter(r => r.status === 'complete').length;
  const prog = rows.reduce((s, r) => s + (Number(r.progress) || 0), 0);
  return { total, complete, avg: total ? Math.round((prog / total) * 10) / 10 : 0, byVer: {} };
}
function versionCounts(rows) {
  const m = {};
  rows.forEach(r => { const v = r.version || '(none)'; m[v] = (m[v] || 0) + 1; });
  return m;
}

const anchors = [new Date(2026, 6, 29), new Date(2026, 6, 30), new Date(2026, 7, 1)];
const schemes = [
  { name: 'A: rolling-7d', mode: 'week' },
  { name: 'B: rolling-28d', mode: 'month' },
];
console.log('=== REAL DATA × SCHEMES (258 rows: Dany 118 / Naftal 100 / Agung 40) ===\n');
for (const ref of anchors) {
  console.log(`── anchor ${iso(ref)} ──`);
  for (const s of schemes) {
    const now = filterTree(withParent, s.mode, 'now', ref);
    const last = filterTree(withParent, s.mode, 'last', ref);
    const both = filterTree(withParent, s.mode, 'both', ref);
    console.log(`${s.name}  now=${now.length} (${versionCounts(now)})  last=${last.length}  both=${both.length}  complete(now)=${summarize(now).complete}`);
  }
}
console.log('\n=== all rows by version (no filter) ===');
console.log(JSON.stringify(versionCounts(rows)));
