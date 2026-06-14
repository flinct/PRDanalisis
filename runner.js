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
// Zero dependencies (Node built-ins only).

const http  = require('http');
const path  = require('path');
const fs    = require('fs');
const { spawn } = require('child_process');

const PORT = process.env.RUNNER_PORT || 9876;
const ROOT = process.env.AUTOMATION_ROOT || process.cwd();

// Make spec_file forgiving: strip any repo prefix so it resolves under ROOT.
// Accepts "playwright/...", "..\\sixV2Automation\\playwright\\...", "C:\\...\\sixV2Automation\\playwright\\...", etc.
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

const server = http.createServer((req, res) => {
  cors(res);
  const url = (req.url || '').split('?')[0];

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, root: ROOT, exists: fs.existsSync(ROOT), port: Number(PORT) }));
  }

  if (req.method === 'POST' && url === '/run') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      let p = {}; try { p = JSON.parse(body || '{}'); } catch {}
      const specFile = p.spec_file, grep = p.grep_pattern, env = p.env || 'dev';

      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      const send = o => { try { res.write(`data: ${JSON.stringify(o)}\n\n`); } catch {} };

      if (!specFile) { send({ type: 'run_end', status: 'error', message: 'spec_file required' }); return res.end(); }

      const specPath = path.resolve(ROOT, normSpec(specFile));
      const project  = process.env.PW_PROJECT || 'chromium';
      const cli = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');

      const t0 = Date.now();
      let pw;
      if (fs.existsSync(cli)) {
        // Preferred: run the local Playwright CLI via node with an args array (shell:false)
        // → no shell quoting issues with spaces in paths/grep on Windows.
        const args = [cli, 'test', specPath, '--reporter=line', '--project=' + project];
        if (grep) args.push('--grep', grep);
        send({ type: 'run_start', cmd: `node cli.js test "${specPath}" --project=${project}` + (grep ? ` --grep "${grep}"` : '') });
        pw = spawn(process.execPath, args, { cwd: ROOT, env: { ...process.env, TEST_ENV: env }, shell: false });
      } else {
        // Fallback: npx via shell (repos without a local @playwright/test install)
        const q = s => '"' + String(s).replace(/"/g, '\\"') + '"';
        let cmd = `npx playwright test ${q(specPath)} --reporter=line --project=${project}`;
        if (grep) cmd += ` --grep ${q(grep)}`;
        send({ type: 'run_start', cmd });
        pw = spawn(cmd, { cwd: ROOT, env: { ...process.env, TEST_ENV: env }, shell: true });
      }

      pw.stdout.on('data', d => send({ type: 'output', text: d.toString() }));
      pw.stderr.on('data', d => send({ type: 'output', text: d.toString() }));
      pw.on('close', code => { send({ type: 'run_end', status: code === 0 ? 'pass' : 'fail', duration_ms: Date.now() - t0, exit_code: code }); res.end(); });
      pw.on('error', err => { send({ type: 'run_end', status: 'error', message: err.message }); res.end(); });
      req.on('close', () => { if (pw.exitCode === null) pw.kill(); });
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
