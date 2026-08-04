'use strict';
// Dump rows as JSON for the test-scheme compute script.
const path = require('path');
const tracker = require('./tracker-sheets');
const BASE = path.join(__dirname, '..');
const fs = require('fs');
tracker.readTracker(BASE).then(data => {
  fs.writeFileSync(path.join(__dirname, '_tracker-dump.json'), JSON.stringify(data.rows, null, 1));
  const perTab = {};
  for (const t of data.tabs) perTab[t.title] = t.rows.length;
  console.log('tabs:', JSON.stringify(perTab), 'total:', data.rows.length);
}).catch(e => { console.error('DUMP FAILED:', e.message); process.exit(1); });
