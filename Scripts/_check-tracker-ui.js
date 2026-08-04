'use strict';
// Harness: load ui-tracker.js in node, make console.assert throw, run selfCheck.
const path = require('path');
global.window = {};
global.React = { createElement: () => null };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = { querySelector: () => null };
global.performance = { now: () => 0 };
let failures = 0;
console.assert = (cond, msg) => { if (!cond) { failures++; console.error('ASSERT FAIL:', msg); } };
require(path.join(__dirname, '..', 'Test', 'modules', 'ui-tracker.js'));
console.log(failures === 0 ? 'SELFCHECK ALL PASS' : `SELFCHECK FAILURES: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
