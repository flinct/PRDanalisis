'use strict';
const fs = require('fs');
const rows = JSON.parse(fs.readFileSync('Scripts/_tracker-dump.json', 'utf8'));
const bySheet = {};
rows.forEach(r => {
  const s = bySheet[r.sourceSheet] || (bySheet[r.sourceSheet] = {});
  const v = r.version || '(none)';
  s[v] = (s[v] || 0) + 1;
});
for (const [sheet, m] of Object.entries(bySheet)) {
  console.log(sheet, JSON.stringify(m));
}
const d = rows.filter(r => r.sourceSheet === 'Dany');
console.log('Dany v2.8.0 complete:', d.filter(r => r.version === 'v2.8.0' && r.status === 'complete').length);
