'use strict';
// Version-scoped window: filter = current version (±) vs previous version, per sheet.
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

function versionKey(v) {
  const m = String(v || '').match(/v?(\d+)\.(\d+)(?:\.(\d+))?/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3] || 0)] : null;
}
// max version per sheet
const sheetMax = {};
withParent.forEach(r => {
  const k = versionKey(r.version);
  if (!k) return;
  const arr = sheetMax[r.sourceSheet] || (sheetMax[r.sourceSheet] = [0, 0, 0]);
  if (k[0] > arr[0] || (k[0] === arr[0] && k[1] > arr[1]) || (k[0] === arr[0] && k[1] === arr[1] && k[2] > arr[2])) { arr[0] = k[0]; arr[1] = k[1]; arr[2] = k[2]; }
});
console.log('max version per sheet:', JSON.stringify(sheetMax));
function inVersion(row, target, delta) {
  const k = versionKey(row.version);
  const t = versionKey(target);
  if (!k || !t) return false;
  const sameMajor = k[0] === t[0];
  const sameMinor = k[1] === t[1] && k[2] <= t[2];
  const prevMinor = k[1] === t[1] - 1;
  return delta === 0 ? (sameMajor && sameMinor) : (sameMajor && prevMinor);
}
function bucketRows(rows, sheet, target, pick) {
  const set = new Set();
  const cur = rows.filter(r => r.sourceSheet === sheet && inVersion(r, target, 0));
  const prev = rows.filter(r => r.sourceSheet === sheet && inVersion(r, target, -1));
  if (pick === 'now' || pick === 'both') cur.forEach(r => set.add(r));
  if (pick === 'last' || pick === 'both') prev.forEach(r => set.add(r));
  const list = Array.from(set);
  // include orphan children whose parent is in the set
  return list.filter(r => r.type === 'core' || list.some(c => c.type === 'core' && c === r.pid));
}
const bySheet = {};
for (const sheet of Object.keys(sheetMax)) {
  const target = sheetMax[sheet];
  const ver = `v${target[0]}.${target[1]}.${target[2]}`;
  const cur = bucketRows(withParent, sheet, target, 'now');
  const prev = bucketRows(withParent, sheet, target, 'last');
  const both = bucketRows(withParent, sheet, target, 'both');
  const mk = v => `${v[0]}.${v[1]}`;
  bySheet[sheet] = {
    target: ver,
    curCount: cur.length,
    prevCount: prev.length,
    bothCount: both.length,
    curComplete: cur.filter(r => r.status === 'complete').length,
    prevComplete: prev.filter(r => r.status === 'complete').length,
  };
}
console.log(JSON.stringify(bySheet, null, 1));
