'use strict';
/**
 * Import script — reads all TSV files from Test/ and MD files from PRD/ BRD/ into SQLite.
 * Idempotent: uses UPSERT so re-running is safe.
 *
 * Usage:
 *   node scripts/import.js              # standalone
 *   require('./scripts/import').importAll(BASE, db)  # called by server POST /api/import
 */
const fs   = require('fs');
const path = require('path');

// ─── TSV PARSER ──────────────────────────────────────────────────────────────
// Parses the card-format TSV used by SatuInbox QA team.
// Each test case block starts with a "Test ID" row and is separated by blank lines.

function parseLine(line) {
  // Simple TSV split that handles quoted fields
  const cols = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === '\t' && !inQ) { cols.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  cols.push(cur.trim());
  return cols;
}

function parseCardBlocks(lines) {
  // Split into blocks by blank lines, keep only blocks that start with "Test ID"
  const blocks = [];
  let block = [];
  for (const line of lines) {
    const trimmed = line.replace(/\t+$/, '');
    if (trimmed === '') {
      if (block.length) { blocks.push(block); block = []; }
    } else {
      block.push(trimmed);
    }
  }
  if (block.length) blocks.push(block);

  const testCases = [];
  for (const blk of blocks) {
    const firstCols = parseLine(blk[0]);
    if (firstCols[0] !== 'Test ID') continue;

    const tc = {
      id:           firstCols[1] || '',
      status_dev:   normalizeStatus(firstCols[4]  || firstCols[firstCols.length-3] || ''),
      status_staging: normalizeStatus(firstCols[5]|| firstCols[firstCols.length-2] || ''),
      status_prod:  normalizeStatus(firstCols[6]  || firstCols[firstCols.length-1] || ''),
      scenario:     '',
      description:  '',
      url:          '',
      precondition: '',
      test_type:    '',
      created_at:   '',
      steps:        [],
      expected:     [],
    };

    if (!tc.id) continue;

    let inExpected = false;
    for (let i = 1; i < blk.length; i++) {
      const cols = parseLine(blk[i]);
      const c0   = cols[0] || '';
      const c2   = cols[2] || '';
      const c4   = cols[4] || '';
      const c5   = cols[5] || '';

      if (c0 === 'Create at') {
        tc.created_at = c2 || cols[1] || '';
      } else if (c0 === 'Scenario') {
        tc.scenario   = c2;
        tc.precondition = c5 || cols[5] || '';
      } else if (c0 === 'Url') {
        tc.url         = c2;
        tc.description = c5 || '';
      } else if (c0 === 'Steps' || c0 === '') {
        if (c4 === 'test type') {
          tc.test_type = c5;
          inExpected   = false;
        } else if (c4 === 'Status Response' || c5 === 'Expected Result') {
          inExpected = true;
        } else if (inExpected) {
          const exp = cols[5] || cols[4] || '';
          if (exp) tc.expected.push(exp);
        } else {
          const stepNum  = cols[1] || '';
          const stepText = cols[2] || '';
          if (stepText && stepNum && !isNaN(Number(stepNum))) {
            tc.steps.push(`${stepNum}. ${stepText}`);
          }
        }
      }
    }

    // Normalize status from Test ID row — try last 3 columns first
    const lastCols = firstCols.filter(Boolean);
    if (lastCols.length >= 3) {
      const l = lastCols.length;
      tc.status_dev     = normalizeStatus(lastCols[l-3]);
      tc.status_staging = normalizeStatus(lastCols[l-2]);
      tc.status_prod    = normalizeStatus(lastCols[l-1]);
    }

    testCases.push(tc);
  }
  return testCases;
}

function normalizeStatus(s) {
  if (!s) return 'Need to Test';
  const u = String(s).trim().toUpperCase();
  if (u.includes('PASS') || u === 'PASSED') return 'Passed';
  if (u.includes('FAIL') || u === 'FAILED') return 'Failed';
  if (u.includes('ON TEST') || u.includes('ON_TEST')) return 'On Test';
  if (u.includes('NEED') || u.includes('NTT'))  return 'Need to Test';
  return 'Need to Test';
}

// ─── MAIN IMPORT ─────────────────────────────────────────────────────────────
function importAll(BASE, db) {
  const testDir = path.join(BASE, 'Test');
  let tcCount = 0, prdCount = 0, skipped = 0;

  // Prepare statements
  const upsertTC = db.prepare(`
    INSERT INTO test_cases (id, file_path, module, scenario, description, url, precondition, test_type, steps, expected, status_dev, status_staging, status_prod, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      file_path=excluded.file_path,
      module=excluded.module,
      scenario=excluded.scenario,
      description=excluded.description,
      url=excluded.url,
      precondition=excluded.precondition,
      test_type=excluded.test_type,
      steps=excluded.steps,
      expected=excluded.expected,
      status_dev=excluded.status_dev,
      status_staging=excluded.status_staging,
      status_prod=excluded.status_prod,
      updated_at=excluded.updated_at
  `);

  const upsertPRD = db.prepare(`
    INSERT INTO prd_files (path, title, module, type, last_scanned)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(path) DO UPDATE SET title=excluded.title, module=excluded.module, last_scanned=excluded.last_scanned
  `);

  // node:sqlite doesn't have db.transaction() — use manual BEGIN/COMMIT
  db.exec('BEGIN');
  try {
    if (fs.existsSync(testDir)) {
      walkFiles(testDir, '', file => {
        if (!/\.tsv$/i.test(file.name)) return;
        const rel    = path.relative(BASE, file.full).replace(/\\/g, '/');
        const module = extractModule(rel);
        let text;
        try { text = fs.readFileSync(file.full, 'utf8'); } catch { skipped++; return; }
        const lines = text.split(/\r?\n/);
        const cases = parseCardBlocks(lines);
        for (const tc of cases) {
          if (!tc.id) { skipped++; continue; }
          upsertTC.run(
            tc.id, rel, module,
            tc.scenario, tc.description, tc.url, tc.precondition, tc.test_type,
            JSON.stringify(tc.steps), JSON.stringify(tc.expected),
            tc.status_dev, tc.status_staging, tc.status_prod,
            tc.created_at || null,
          );
          tcCount++;
        }
      });
    }
    for (const dir of ['PRD', 'BRD']) {
      const d = path.join(BASE, dir);
      if (!fs.existsSync(d)) continue;
      walkFiles(d, '', file => {
        if (!/\.md$/i.test(file.name)) return;
        const rel    = path.relative(BASE, file.full).replace(/\\/g, '/');
        const module = extractModule(rel);
        const title  = file.name.replace(/\.md$/i, '');
        upsertPRD.run(rel, title, module, dir);
        prdCount++;
      });
    }
    db.exec('COMMIT');
  } catch(e) {
    db.exec('ROLLBACK');
    throw e;
  }

  return { test_cases: tcCount, prd_files: prdCount, skipped };
}

function walkFiles(dir, base, cb) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  const SKIP = new Set(['node_modules', '.git']);
  for (const e of entries) {
    if (SKIP.has(e.name) || e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    const rel  = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) walkFiles(full, rel, cb);
    else cb({ name: e.name, full, rel });
  }
}

function extractModule(relPath) {
  // "Test/conversation/Conversation.tsv" → "conversation"
  // "PRD/Broadcast/PRD Broadcast.md"    → "Broadcast"
  const parts = relPath.replace(/\\/g, '/').split('/');
  return parts.length >= 2 ? parts[1] : parts[0];
}

// ─── STANDALONE ──────────────────────────────────────────────────────────────
if (require.main === module) {
  const { DatabaseSync } = require('node:sqlite');
  const BASE_DIR = path.resolve(__dirname, '..');
  const DB_FILE  = process.env.DB_PATH || path.join(BASE_DIR, 'qa.db');

  // Bootstrap minimal schema (same as server.js) then import
  const db = new DatabaseSync(DB_FILE);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  // Inline the schema so standalone import works without starting server
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY, file_path TEXT NOT NULL, module TEXT,
      scenario TEXT, description TEXT, url TEXT, precondition TEXT, test_type TEXT,
      steps TEXT DEFAULT '[]', expected TEXT DEFAULT '[]',
      status_dev TEXT DEFAULT 'Need to Test', status_staging TEXT DEFAULT 'Need to Test',
      status_prod TEXT DEFAULT 'Need to Test', created_at TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS automation_map (
      case_id TEXT PRIMARY KEY, tc_type TEXT DEFAULT 'manual',
      spec_file TEXT DEFAULT '', grep_pattern TEXT DEFAULT '', notes TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS prd_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT UNIQUE NOT NULL,
      title TEXT, module TEXT, type TEXT DEFAULT 'PRD',
      last_scanned TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('Importing…');
  const counts = importAll(BASE_DIR, db);
  console.log(`Done. test_cases=${counts.test_cases}, prd_files=${counts.prd_files}, skipped=${counts.skipped}`);
}

module.exports = { importAll, parseCardBlocks };
