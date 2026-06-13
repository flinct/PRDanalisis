'use strict';
// ─── Mirror local PRD .md files → Google Docs ────────────────────────────────
// One-way push. Maintains a map (relPath → docId + content hash) so unchanged
// files are skipped and edits overwrite the same Doc. Folder structure under the
// source dir is recreated in Drive under a single root folder.

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const gdocs  = require('./gdocs');

const SRC_DIR = process.env.MIRROR_SRC_DIR || 'PRD';

function mapPath(BASE) { return path.join(BASE, '.gdocs-mirror.json'); }
function loadMap(BASE) {
  try { return JSON.parse(fs.readFileSync(mapPath(BASE), 'utf8')); }
  catch { return { rootFolderId: null, folders: {}, docs: {} }; }
}
function saveMap(BASE, m) { fs.writeFileSync(mapPath(BASE), JSON.stringify(m, null, 2)); }
function hash(s) { return crypto.createHash('md5').update(s).digest('hex'); }

// All .md files under <BASE>/<SRC_DIR>, as '/'-separated paths relative to SRC_DIR.
function listMd(BASE) {
  const root = path.join(BASE, SRC_DIR);
  const out = [];
  (function walk(dir, rel) {
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.name.startsWith('.')) continue;
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) walk(path.join(dir, e.name), r);
      else if (/\.md$/i.test(e.name)) out.push(r);
    }
  })(root, '');
  return out;
}

async function ensureRoot(BASE, map) {
  if (process.env.GDRIVE_FOLDER_ID) { map.rootFolderId = process.env.GDRIVE_FOLDER_ID.trim(); return map.rootFolderId; }
  if (map.rootFolderId) return map.rootFolderId;
  const name = (process.env.GDRIVE_FOLDER_NAME || 'PRD').trim() || 'PRD';
  map.rootFolderId = await gdocs.findOrCreateFolder(BASE, name, null);
  return map.rootFolderId;
}

async function ensureDir(BASE, map, relDir) {
  if (!relDir || relDir === '.') return map.rootFolderId;
  if (map.folders[relDir]) return map.folders[relDir];
  const parts = relDir.split('/');
  let parent = map.rootFolderId, acc = '';
  for (const p of parts) {
    acc = acc ? acc + '/' + p : p;
    if (map.folders[acc]) { parent = map.folders[acc]; continue; }
    const id = await gdocs.findOrCreateFolder(BASE, p, parent);
    map.folders[acc] = id; parent = id;
  }
  return parent;
}

// ─── SERIALIZATION ──────────────────────────────────────────────────────────
// All mirror work runs through one queue so concurrent file-watcher events can
// NEVER create the same Drive folder twice (the root cause of duplicate folders).
let _queue = Promise.resolve();
function enqueue(fn) {
  const run = _queue.then(fn, fn);
  _queue = run.then(() => {}, () => {});
  return run;
}

// Mirror a single file (relPath relative to SRC_DIR, '/'-separated).
async function _mirrorFileInner(BASE, relPath) {
  relPath = String(relPath).replace(/\\/g, '/').replace(/^\/+/, '');
  const abs = path.join(BASE, SRC_DIR, relPath.split('/').join(path.sep));
  if (!fs.existsSync(abs)) return { relPath, skipped: 'missing' };

  const content = fs.readFileSync(abs, 'utf8');
  const h = hash(content);
  const map = loadMap(BASE);
  const rec = map.docs[relPath];
  if (rec && rec.hash === h && rec.docId) return { relPath, skipped: 'unchanged', docId: rec.docId };

  await ensureRoot(BASE, map);
  const relDir   = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
  const folderId = await ensureDir(BASE, map, relDir);
  const title    = relPath.split('/').pop().replace(/\.md$/i, '');

  let docId = rec && rec.docId, action = 'updated';
  if (docId) {
    try { await gdocs.overwriteStyledDoc(BASE, docId, content); }
    catch (e) {
      const code = e.code || (e.response && e.response.status);
      if (code === 404 || /not found|notFound/i.test(e.message || '')) docId = null; // recreate
      else throw e;
    }
  }
  if (!docId) { const r = await gdocs.createDoc(BASE, { title, content, folderId }); docId = r.id; action = 'created'; }

  map.docs[relPath] = { docId, hash: h, title, updatedAt: new Date().toISOString() };
  saveMap(BASE, map);
  return { relPath, docId, action };
}

// Mirror every .md under SRC_DIR (runs inside one queued task → no folder races).
async function _mirrorAllInner(BASE) {
  const files = listMd(BASE);
  let created = 0, updated = 0, skipped = 0, errors = [];
  for (const rel of files) {
    try {
      const r = await _mirrorFileInner(BASE, rel); // direct call (already serialized by caller)
      if (r.skipped) skipped++;
      else if (r.action === 'created') created++;
      else updated++;
    } catch (e) { errors.push({ file: rel, error: e.message }); }
  }
  return { total: files.length, created, updated, skipped, errors };
}

// Public, serialized entry points
function mirrorFile(BASE, relPath) { return enqueue(() => _mirrorFileInner(BASE, relPath)); }
function mirrorAll(BASE)           { return enqueue(() => _mirrorAllInner(BASE)); }

// True if a watcher path (relative to the PRD watch dir) is a markdown file we mirror.
function isMirrorable(filename) { return /\.md$/i.test(filename || ''); }

module.exports = { mirrorAll, mirrorFile, listMd, isMirrorable, SRC_DIR, mapPath };
