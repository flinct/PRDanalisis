'use strict';
// Throwaway probe: dump real tracker rows via the project's own auth stack.
const path = require('path');
const tracker = require('./tracker-sheets');
const BASE = path.join(__dirname, '..');
tracker.readTracker(BASE).then(data => {
  if (!data.enabled) { console.log('NOT ENABLED:', data.reason); return; }
  for (const tab of data.tabs) {
    console.log(`\n=== TAB ${tab.title} (${tab.rows.length} rows) ===`);
    for (const r of tab.rows) {
      console.log(JSON.stringify({
        owner: r.owner, type: r.type, parent: r.parentTask, task: r.task.slice(0, 40),
        status: r.status, progress: r.progress, week: r.week, version: r.version,
        date: r.date, start: r.startDate, end: r.endDate,
        row: r.sourceRowNumber,
      }));
    }
  }
}).catch(e => { console.error('DUMP FAILED:', e.message); process.exit(1); });
