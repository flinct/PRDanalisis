'use strict';
// ─── QA Runner Agent (per-device Playwright executor) ────────────────────────
// Run this on EACH tester PC so runs execute locally on that machine, using that
// machine's own automation repo — instead of burdening the central QA Browser host.
//
// Usage (on the tester's machine):
//   1. Put this file inside the automation repo (sixV2Automation), OR anywhere
//      and set AUTOMATION_ROOT to the repo path.
//   2. node runner.js
//   3. In QA Browser → ⚙ Settings → Execution → "Run on this device",
//      runner URL = http://localhost:9876
//
// Architecture: POST /run starts the test in the BACKGROUND and returns a runId.
// Output is buffered; the dashboard POLLS GET /run/:id?since=N. The test process is
// NOT tied to the HTTP connection (so a dropped cross-origin stream can't kill it).
//
// Zero dependencies (Node built-ins only).

const http  = require('http');
const path  = require('path');
const fs    = require('fs');
const { spawn } = require('child_process');

const PORT = process.env.RUNNER_PORT || 9876;
const ROOT = process.env.AUTOMATION_ROOT || process.cwd();

const runs = new Map(); // runId → { status, output, code, message, t0 }

// Make spec_file forgiving: strip any repo prefix so it resolves under ROOT.
function normSpec(spec) {
  let s = String(spec || '').replace(/\\/g, '/');
  const i = s.toLowerCase().indexOf('playwright/');
  if (i >= 0) s = s.slice(i);
  return s.replace(/^\/+/, '');
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true'); // Chrome LAN→localhost
}

function startRun(p) {
  const runId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  // Pass spec RELATIVE to the repo root: Playwright's positional arg is a file-path
  // FILTER (regex). An absolute Windows path (backslashes, "C:") never matches → "No tests found".
  const specArg = normSpec(p.spec_file);
  const project  = process.env.PW_PROJECT || 'chromium';
  const grep     = p.grep_pattern;
  const env      = p.env || 'dev';
  const cli = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');

  let pw, cmd;
  if (fs.existsSync(cli)) {
    const args = [cli, 'test', specArg, '--reporter=line', '--project=' + project];
    if (grep) args.push('--grep', grep);
    cmd = `node cli.js test "${specArg}" --project=${project}` + (grep ? ` --grep "${grep}"` : '');
    pw = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, TEST_ENV: env }, shell: false });
  } else {
    const q = s => '"' + String(s).replace(/"/g, '\\"') + '"';
    cmd = `npx playwright test ${q(specArg)} --reporter=line --project=${project}` + (grep ? ` --grep ${q(grep)}` : '');
    pw = spawn(cmd, { cwd: ROOT, env: { ...process.env, TEST_ENV: env }, shell: true });
  }

  const run = { status: 'running', output: '$ ' + cmd + '\n\n', code: null, message: '', t0: Date.now() };
  runs.set(runId, run);
  console.log(`\n  ▶ RUN ${runId}  ${cmd}`);

  pw.stdout.on('data', d => { run.output += d.toString(); process.stdout.write(d); });
  pw.stderr.on('data', d => { run.output += d.toString(); process.stderr.write(d); });
  pw.on('close', code => { run.status = code === 0 ? 'pass' : 'fail'; run.code = code; run.durationMs = Date.now() - run.t0; console.log(`  ■ ${runId} done — exit ${code} (${run.durationMs}ms)`); });
  pw.on('error', err => { run.status = 'error'; run.message = err.message; console.error(`  ⚠ ${runId} spawn error:`, err.message); });

  // NOTE: deliberately NOT killed on client disconnect — the run finishes regardless.
  // Drop old runs after 10 min to avoid unbounded memory.
  setTimeout(() => runs.delete(runId), 10 * 60 * 1000);
  return { runId, cmd };
}

const server = http.createServer((req, res) => {
  cors(res);
  const url = (req.url || '').split('?')[0];
  const qs  = new URLSearchParams((req.url || '').split('?')[1] || '');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, root: ROOT, exists: fs.existsSync(ROOT), port: Number(PORT) }));
  }

  // Poll run output/status
  if (req.method === 'GET' && url.startsWith('/run/')) {
    const id = url.slice('/run/'.length);
    const run = runs.get(id);
    res.writeHead(run ? 200 : 404, { 'Content-Type': 'application/json' });
    if (!run) return res.end(JSON.stringify({ error: 'unknown runId' }));
    const since = Number(qs.get('since')) || 0;
    return res.end(JSON.stringify({
      status: run.status, output: run.output.slice(since), total: run.output.length,
      exitCode: run.code, message: run.message, durationMs: run.durationMs || (Date.now() - run.t0),
    }));
  }

  // Start a run (background) → returns { runId, cmd }
  if (req.method === 'POST' && url === '/run') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      let p = {}; try { p = JSON.parse(body || '{}'); } catch {}
      if (!p.spec_file) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'spec_file required' })); }
      try {
        const r = startRun(p);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(r));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Launch Playwright UI mode (interactive GUI on THIS machine). Fire-and-forget.
  if (req.method === 'POST' && url === '/ui') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      let p = {}; try { p = JSON.parse(body || '{}'); } catch {}
      try {
        const cli  = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');
        const args = ['test', '--ui'];
        if (p.spec_file)    args.push(normSpec(p.spec_file));
        if (p.grep_pattern) args.push('--grep', p.grep_pattern);
        let child, cmd;
        if (fs.existsSync(cli)) {
          cmd = 'node cli.js ' + args.join(' ');
          child = spawn(process.execPath, [cli, ...args], { cwd: ROOT, env: process.env, detached: true, stdio: 'ignore' });
        } else {
          const q = s => '"' + String(s).replace(/"/g, '\\"') + '"';
          cmd = 'npx playwright test --ui' + (p.spec_file ? ' ' + q(normSpec(p.spec_file)) : '') + (p.grep_pattern ? ' --grep ' + q(p.grep_pattern) : '');
          child = spawn(cmd, { cwd: ROOT, env: process.env, detached: true, stdio: 'ignore', shell: true });
        }
        child.unref();
        console.log('  🖥  Playwright UI launched:', cmd);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, cmd }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`\n▶ QA Runner Agent  →  http://localhost:${PORT}`);
  console.log(`  Automation root : ${ROOT}  ${fs.existsSync(ROOT) ? '✓' : '⚠ not found'}`);
  console.log(`  Set in QA Browser → Settings → Execution → "Run on this device"\n`);
});
