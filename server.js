'use strict';
const express      = require('express');
const cors         = require('cors');
const fs           = require('fs');
const path         = require('path');
const { spawn }    = require('child_process');
const { DatabaseSync } = require('node:sqlite');

const app   = express();
const PORT  = process.env.PORT || 3001;
const BASE  = __dirname;
const DB_PATH = process.env.DB_PATH || path.join(BASE, 'qa.db');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve the QA dashboard HTML
app.use(express.static(path.join(BASE, 'Test'), { index: 'testcase-browser.html' }));

// ─── DATABASE SETUP ──────────────────────────────────────────────────────────
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS test_cases (
    id            TEXT PRIMARY KEY,
    file_path     TEXT NOT NULL,
    module        TEXT,
    scenario      TEXT,
    description   TEXT,
    url           TEXT,
    precondition  TEXT,
    test_type     TEXT,
    steps         TEXT DEFAULT '[]',
    expected      TEXT DEFAULT '[]',
    status_dev    TEXT DEFAULT 'Need to Test',
    status_staging TEXT DEFAULT 'Need to Test',
    status_prod   TEXT DEFAULT 'Need to Test',
    created_at    TEXT,
    updated_at    TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS automation_map (
    case_id       TEXT PRIMARY KEY,
    tc_type       TEXT DEFAULT 'manual',
    spec_file     TEXT DEFAULT '',
    grep_pattern  TEXT DEFAULT '',
    notes         TEXT DEFAULT '',
    updated_at    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (case_id) REFERENCES test_cases(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS test_runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id     TEXT NOT NULL,
    env         TEXT DEFAULT 'dev',
    status      TEXT,
    output      TEXT DEFAULT '',
    duration_ms INTEGER,
    run_by      TEXT DEFAULT 'user',
    ran_at      TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (case_id) REFERENCES test_cases(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS prd_files (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    path          TEXT UNIQUE NOT NULL,
    title         TEXT,
    module        TEXT,
    type          TEXT DEFAULT 'PRD',
    last_scanned  TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_tc_module    ON test_cases(module);
  CREATE INDEX IF NOT EXISTS idx_tc_type      ON test_cases(test_type);
  CREATE INDEX IF NOT EXISTS idx_runs_case    ON test_runs(case_id);
  CREATE INDEX IF NOT EXISTS idx_runs_status  ON test_runs(status);
`);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function safePath(rel) {
  const r = path.resolve(BASE, String(rel).replace(/\.\./g, ''));
  if (!r.startsWith(BASE)) throw new Error('Path outside workspace');
  return r;
}

// Ensure a minimal test_cases row exists so automation_map / test_runs FKs hold
// even when the TSV hasn't been imported into the DB yet.
function ensureCase(id, filePath) {
  if (!id) return;
  db.prepare("INSERT OR IGNORE INTO test_cases (id, file_path, created_at) VALUES (?, ?, datetime('now'))")
    .run(String(id), filePath ? String(filePath) : '');
}

function walkDir(dir, base = '') {
  const results = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return results; }
  const SKIP = new Set(['node_modules', '.git', 'Chat', 'AgentNotes', 'Memory', 'Rules']);
  for (const e of entries) {
    if (SKIP.has(e.name) || e.name.startsWith('.')) continue;
    const rel  = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push({ kind: 'dir', name: e.name, path: rel, children: walkDir(full, rel) });
    } else if (/\.(tsv|csv|md|txt)$/i.test(e.name)) {
      results.push({ kind: 'file', name: e.name, path: rel, ext: path.extname(e.name).slice(1).toLowerCase() });
    }
  }
  return results;
}

// ─── API: FILES ──────────────────────────────────────────────────────────────
app.get('/api/files', (_req, res) => {
  const SECTIONS = [
    { id: 'test',        folderName: 'Test',        label: 'Test Cases',  color: '#60a5fa' },
    { id: 'prd',         folderName: 'PRD',         label: 'PRD',         color: '#a78bfa' },
    { id: 'brd',         folderName: 'BRD',         label: 'BRD',         color: '#f9a8d4' },
    { id: 'assessments', folderName: 'Assessments', label: 'Assessments', color: '#34d399' },
    { id: 'feature',     folderName: 'Feature List',label: 'Feature List',color: '#fbbf24' },
  ];
  const result = SECTIONS.map(s => {
    const dir = path.join(BASE, s.folderName);
    return { ...s, tree: fs.existsSync(dir) ? walkDir(dir, s.folderName) : [] };
  });
  res.json(result);
});

app.get('/api/files/content', (req, res) => {
  try {
    const fp = safePath(req.query.path || '');
    if (!fs.existsSync(fp)) return res.status(404).json({ error: 'Not found' });
    res.type('text/plain').send(fs.readFileSync(fp, 'utf8'));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.put('/api/files/content', (req, res) => {
  try {
    const fp = safePath(req.query.path || '');
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, req.body.content || '', 'utf8');
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Create a folder (collection) from the dashboard
app.post('/api/files/mkdir', (req, res) => {
  try {
    const dir = safePath(req.body && req.body.path || '');
    fs.mkdirSync(dir, { recursive: true });
    broadcastTreeChange();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── Sidebar tree live updates (SSE) ─────────────────────────────────────────
const treeClients = new Set();
function broadcastTreeChange() {
  for (const r of treeClients) { try { r.write('data: change\n\n'); } catch {} }
}
app.get('/api/files/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
  res.write('retry: 3000\n\n');
  treeClients.add(res);
  req.on('close', () => treeClients.delete(res));
});

// ─── API: GOOGLE (OAuth login) + DOCS + MIRROR ───────────────────────────────
const gdocs  = require('./scripts/gdocs.js');
const gauth  = require('./scripts/google-auth.js');
const mirror = require('./scripts/mirror.js');

// OAuth: status / login / callback / logout
app.get('/api/google/status', (_req, res) => res.json(gdocs.status(BASE)));

app.get('/api/google/login', (_req, res) => {
  try { res.redirect(gauth.getAuthUrl(BASE)); }
  catch (e) { res.status(e.status || 500).send('OAuth not configured: ' + e.message); }
});

app.get('/oauth2callback', async (req, res) => {
  try {
    if (req.query.error) throw new Error(String(req.query.error));
    await gauth.handleCallback(BASE, req.query.code);
    res.send('<html><body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px">'
      + '<h3>✓ Connected to Google</h3><p>You can close this tab and return to QA Browser.</p>'
      + '<script>setTimeout(function(){location.href="/"},1200)</script></body></html>');
  } catch (e) { res.status(500).send('Login failed: ' + e.message); }
});

app.post('/api/google/logout', (_req, res) => res.json(gauth.logout(BASE)));

// Mirror: push local PRD .md → Google Docs (manual trigger)
app.post('/api/mirror', async (_req, res) => {
  try { res.json(await mirror.mirrorAll(BASE)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

// NOTE: /status must be declared before /:id so it isn't captured as an id.
app.get('/api/gdocs/status', (_req, res) => res.json(gdocs.status(BASE)));

app.get('/api/gdocs', async (_req, res) => {
  try { res.json(await gdocs.listTree(BASE)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

app.post('/api/gdocs', async (req, res) => {
  try { res.json(await gdocs.createDoc(BASE, req.body || {})); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

app.get('/api/gdocs/:id', async (req, res) => {
  try { res.json(await gdocs.readDoc(BASE, req.params.id)); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

app.put('/api/gdocs/:id', async (req, res) => {
  try { res.json(await gdocs.updateDoc(BASE, req.params.id, req.body || {})); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
});

// ─── API: TEST CASES ─────────────────────────────────────────────────────────
app.get('/api/testcases', (req, res) => {
  const { module, tc_type, search, limit = 500, offset = 0 } = req.query;
  let sql = `
    SELECT tc.*, am.tc_type, am.spec_file, am.grep_pattern, am.notes,
           (SELECT status FROM test_runs WHERE case_id = tc.id ORDER BY ran_at DESC LIMIT 1) AS last_run_status,
           (SELECT ran_at  FROM test_runs WHERE case_id = tc.id ORDER BY ran_at DESC LIMIT 1) AS last_run_at
    FROM test_cases tc
    LEFT JOIN automation_map am ON am.case_id = tc.id
    WHERE 1=1
  `;
  const params = [];
  if (module)  { sql += ' AND tc.module = ?';           params.push(module); }
  if (tc_type) { sql += ' AND COALESCE(am.tc_type,"manual") = ?'; params.push(tc_type); }
  if (search)  { sql += ' AND (tc.id LIKE ? OR tc.scenario LIKE ? OR tc.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY tc.id LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const rows = db.prepare(sql).all(...params);
  // parse JSON columns
  const parsed = rows.map(r => ({
    ...r,
    steps:    tryJSON(r.steps,    []),
    expected: tryJSON(r.expected, []),
    tc_type:  r.tc_type || 'manual',
  }));
  res.json(parsed);
});

app.get('/api/testcases/stats', (_req, res) => {
  const total   = db.prepare('SELECT COUNT(*) as n FROM test_cases').get().n;
  const byMod   = db.prepare('SELECT module, COUNT(*) as n FROM test_cases GROUP BY module ORDER BY n DESC').all();
  const byType  = db.prepare(`SELECT COALESCE(am.tc_type,'manual') as tc_type, COUNT(*) as n
                               FROM test_cases tc LEFT JOIN automation_map am ON am.case_id=tc.id
                               GROUP BY tc_type`).all();
  const byRunSt = db.prepare(`SELECT status, COUNT(*) as n FROM test_runs
                               WHERE ran_at = (SELECT MAX(ran_at) FROM test_runs r2 WHERE r2.case_id = test_runs.case_id)
                               GROUP BY status`).all();
  res.json({ total, byModule: byMod, byType, byLastRunStatus: byRunSt });
});

app.get('/api/testcases/:id', (req, res) => {
  const row = db.prepare(`
    SELECT tc.*, am.tc_type, am.spec_file, am.grep_pattern, am.notes
    FROM test_cases tc LEFT JOIN automation_map am ON am.case_id = tc.id
    WHERE tc.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ ...row, steps: tryJSON(row.steps, []), expected: tryJSON(row.expected, []), tc_type: row.tc_type || 'manual' });
});

// ─── API: AUTOMATION MAPPING ─────────────────────────────────────────────────
app.put('/api/testcases/:id/map', (req, res) => {
  try {
    const { tc_type = 'manual', spec_file = '', grep_pattern = '', notes = '' } = req.body;
    ensureCase(req.params.id);
    db.prepare(`
      INSERT INTO automation_map (case_id, tc_type, spec_file, grep_pattern, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(case_id) DO UPDATE SET
        tc_type=excluded.tc_type, spec_file=excluded.spec_file,
        grep_pattern=excluded.grep_pattern, notes=excluded.notes,
        updated_at=excluded.updated_at
    `).run(req.params.id, tc_type, spec_file, grep_pattern, notes);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Bulk update tc_type for multiple cases
app.put('/api/testcases/map/bulk', (req, res) => {
  const { updates } = req.body; // [{ case_id, tc_type, spec_file, grep_pattern }]
  if (!Array.isArray(updates)) return res.status(400).json({ error: 'updates must be array' });
  const stmt = db.prepare(`
    INSERT INTO automation_map (case_id, tc_type, spec_file, grep_pattern, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(case_id) DO UPDATE SET
      tc_type=excluded.tc_type, spec_file=excluded.spec_file,
      grep_pattern=excluded.grep_pattern, updated_at=excluded.updated_at
  `);
  db.exec('BEGIN');
  try {
    for (const it of updates) { ensureCase(it.case_id); stmt.run(it.case_id, it.tc_type || 'manual', it.spec_file || '', it.grep_pattern || ''); }
    db.exec('COMMIT');
  } catch(e) { db.exec('ROLLBACK'); return res.status(500).json({ error: e.message }); }
  res.json({ ok: true, count: updates.length });
});

// ─── API: TEST RUNS ──────────────────────────────────────────────────────────
app.get('/api/testcases/:id/runs', (req, res) => {
  const runs = db.prepare(
    'SELECT * FROM test_runs WHERE case_id = ? ORDER BY ran_at DESC LIMIT 20'
  ).all(req.params.id);
  res.json(runs);
});

app.get('/api/runs/recent', (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const runs  = db.prepare(
    'SELECT tr.*, tc.scenario, tc.module FROM test_runs tr JOIN test_cases tc ON tc.id = tr.case_id ORDER BY tr.ran_at DESC LIMIT ?'
  ).all(limit);
  res.json(runs);
});

// ─── API: AUTOMATION CONFIG + AUTO-MAP ───────────────────────────────────────
const automation = require('./scripts/automation.js');

app.get('/api/automation/config', (_req, res) => res.json(automation.getConfig(BASE)));
app.put('/api/automation/config', (req, res) => {
  try { res.json(automation.setConfig(BASE, req.body || {})); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

// Auto-map a set of test cases from the generated manifest(s) in AUTOMATION_ROOT
app.post('/api/automation/automap', (req, res) => {
  try {
    const caseIds = (req.body && req.body.case_ids) || [];
    const man = automation.buildManifestMap(automation.getConfig(BASE).resolved);
    const stmt = db.prepare(`
      INSERT INTO automation_map (case_id, tc_type, spec_file, grep_pattern, updated_at)
      VALUES (?, 'automation', ?, ?, datetime('now'))
      ON CONFLICT(case_id) DO UPDATE SET
        tc_type='automation', spec_file=excluded.spec_file,
        grep_pattern=excluded.grep_pattern, updated_at=excluded.updated_at
    `);
    let mapped = 0; const unmapped = [];
    db.exec('BEGIN');
    for (const id of caseIds) {
      const m = man[id];
      if (m && m.spec_file) { ensureCase(id); stmt.run(id, m.spec_file, m.grep || ''); mapped++; }
      else unmapped.push(id);
    }
    db.exec('COMMIT');
    res.json({ ok: true, mapped, unmapped, total: caseIds.length, manifestSize: Object.keys(man).length });
  } catch (e) { try { db.exec('ROLLBACK'); } catch {} res.status(500).json({ error: e.message }); }
});

// ─── API: RUN TEST (Playwright) ──────────────────────────────────────────────
app.post('/api/run', (req, res) => {
  const { case_id, spec_file, grep_pattern, env = 'dev', run_by = 'user' } = req.body;
  if (!case_id)   return res.status(400).json({ error: 'case_id required' });
  if (!spec_file) return res.status(400).json({ error: 'spec_file required — set automation mapping first' });

  // SSE headers
  res.setHeader('Content-Type',      'text/event-stream');
  res.setHeader('Cache-Control',     'no-cache');
  res.setHeader('Connection',        'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = obj => { if (!res.writableEnded) res.write(`data: ${JSON.stringify(obj)}\n\n`); };

  // Insert run record with status=running (ensure the case exists for the FK first)
  ensureCase(case_id);
  const runId = db.prepare(
    `INSERT INTO test_runs (case_id, env, status, output, run_by) VALUES (?, ?, 'running', '', ?) RETURNING id`
  ).get(case_id, env, run_by).id;

  send({ type: 'run_start', run_id: runId, case_id });

  const startMs = Date.now();
  let   output  = '';

  // Run inside the automation repo (AUTOMATION_ROOT); spec_file is relative to it.
  // spec_file may be a single .spec file (one feature) or a directory (whole TSV/domain).
  const runRoot  = automation.getConfig(BASE).resolved || BASE;
  const specPath = path.resolve(runRoot, spec_file);
  // Build a single quoted command string so paths/grep with SPACES survive the shell
  // (passing an args array with shell:true concatenates unquoted → breaks on spaces).
  const q = s => '"' + String(s).replace(/"/g, '\\"') + '"'; // keep Windows backslashes intact
  let cmd = `npx playwright test ${q(specPath)} --reporter=line`;
  if (grep_pattern) cmd += ` --grep ${q(grep_pattern)}`; // omit grep → run the whole spec/dir

  const pw = spawn(cmd, {
    cwd: runRoot,
    env: { ...process.env, TEST_ENV: env },
    shell: true,
  });

  pw.stdout.on('data', chunk => {
    const text = chunk.toString();
    output += text;
    send({ type: 'output', text });
  });

  pw.stderr.on('data', chunk => {
    const text = chunk.toString();
    output += text;
    send({ type: 'output', text });
  });

  pw.on('close', code => {
    const duration = Date.now() - startMs;
    const status   = code === 0 ? 'pass' : 'fail';
    db.prepare(
      'UPDATE test_runs SET status=?, output=?, duration_ms=? WHERE id=?'
    ).run(status, output.slice(0, 50000), duration, runId);
    send({ type: 'run_end', status, duration_ms: duration, exit_code: code });
    res.end();
  });

  pw.on('error', err => {
    db.prepare('UPDATE test_runs SET status=?, output=? WHERE id=?').run('error', err.message, runId);
    send({ type: 'run_end', status: 'error', message: err.message });
    res.end();
  });

  req.on('close', () => { if (pw.exitCode === null) pw.kill(); });
});

// ─── API: IMPORT (trigger re-scan) ───────────────────────────────────────────
app.post('/api/import', (_req, res) => {
  try {
    const { importAll } = require('./scripts/import.js');
    const counts = importAll(BASE, db);
    res.json({ ok: true, ...counts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── API: HEALTH ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const tcCount = db.prepare('SELECT COUNT(*) as n FROM test_cases').get().n;
  res.json({ status: 'ok', test_cases: tcCount, db: DB_PATH });
});

// ─── UTILS ───────────────────────────────────────────────────────────────────
function tryJSON(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

// ─── FILE WATCHER — auto re-import on TSV/MD change ─────────────────────────
function startWatcher() {
  const WATCH_DIRS = ['Test', 'PRD', 'BRD'].map(d => path.join(BASE, d)).filter(fs.existsSync);
  if (!WATCH_DIRS.length) return;

  // Debounce: collect rapid saves (e.g. editor writes) into one import call
  const pending = new Map(); // filePath → timer

  function scheduleImport(filePath) {
    if (pending.has(filePath)) clearTimeout(pending.get(filePath));
    pending.set(filePath, setTimeout(() => {
      pending.delete(filePath);
      try {
        const { importAll } = require('./scripts/import.js');
        const counts = importAll(BASE, db);
        console.log(`  ↺ auto-import  ${path.relative(BASE, filePath).replace(/\\/g,'/')}  → ${counts.test_cases} cases`);
      } catch(e) {
        console.error(`  ⚠ auto-import error: ${e.message}`);
      }
    }, 800)); // wait 800ms after last write before importing
  }

  // Auto-mirror PRD .md → Google Docs (only if logged in; skip quietly otherwise)
  const PRD_DIR     = path.join(BASE, mirror.SRC_DIR);
  const mirrorPend  = new Map(); // relPath → timer
  function scheduleMirror(relPath) {
    if (mirrorPend.has(relPath)) clearTimeout(mirrorPend.get(relPath));
    mirrorPend.set(relPath, setTimeout(async () => {
      mirrorPend.delete(relPath);
      try {
        const r = await mirror.mirrorFile(BASE, relPath);
        if (r && !r.skipped) console.log(`  ☁ mirror  ${relPath}  → gdoc ${r.action || ''} ${r.docId || ''}`);
      } catch (e) {
        if (e.status === 401) { /* not connected — skip */ }
        else console.error(`  ⚠ mirror error (${relPath}): ${e.message}`);
      }
    }, 1200));
  }

  // Debounced "tree changed" ping to SSE clients (any add/remove/rename)
  let treeTimer = null;
  function scheduleTreeBroadcast() {
    if (treeTimer) clearTimeout(treeTimer);
    treeTimer = setTimeout(broadcastTreeChange, 500);
  }

  for (const dir of WATCH_DIRS) {
    fs.watch(dir, { recursive: true }, (event, filename) => {
      if (!filename) return;
      scheduleTreeBroadcast(); // refresh sidebar tree on any change
      if (/\.(tsv|md)$/i.test(filename)) scheduleImport(path.join(dir, filename));
      // mirror only markdown files living under the PRD source dir
      if (dir === PRD_DIR && mirror.isMirrorable(filename)) scheduleMirror(String(filename).replace(/\\/g, '/'));
    });
  }

  console.log(`  Watching     : ${WATCH_DIRS.map(d => path.relative(BASE, d)).join(', ')}\n`);
}

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const tc = db.prepare('SELECT COUNT(*) as n FROM test_cases').get().n;
  console.log(`\n◈ QA Dashboard  →  http://localhost:${PORT}`);
  console.log(`  DB           : ${DB_PATH}`);
  console.log(`  Test cases   : ${tc}`);
  startWatcher();
});
