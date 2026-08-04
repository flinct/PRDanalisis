'use strict';
// Count: verStartDate/verEndDate coverage — how many rows have version date range.
const fs = require('fs');
const rows = JSON.parse(fs.readFileSync('Scripts/_tracker-dump.json', 'utf8'));
let withVStart = 0, withVEnd = 0, withEither = 0;
const samples = [];
rows.forEach(r => {
  if (r.verStartDate) withVStart++;
  if (r.verEndDate) withVEnd++;
  if (r.verStartDate || r.verEndDate) {
    withEither++;
    if (samples.length < 15) samples.push({ sheet: r.sourceSheet, task: r.task.slice(0, 35), vStart: r.verStartDate, vEnd: r.verEndDate, version: r.version });
  }
});
console.log(`rows=${rows.length} verStart=${withVStart} verEnd=${withVEnd} either=${withEither}`);
console.log(JSON.stringify(samples, null, 1));
