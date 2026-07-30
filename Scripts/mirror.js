'use strict';
// ─── Mirror local docs .md files → Google Docs ───────────────────────────────
// One-way push. Maintains a map (relPath → docId + content hash) so unchanged
// files are skipped and edits overwrite the same Doc. Folder structure under the
// source dir is recreated in Drive under a single root folder.

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const gdocs  = require('./gdocs');

const SRC_DIR = process.env.MIRROR_SRC_DIR || 'PRD';
const EXTRA_SRC_DIRS = (process.env.MIRROR_EXTRA_SRC_DIRS || 'BRD,Assessments')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const SRC_DIRS = [SRC_DIR, ...EXTRA_SRC_DIRS];

function mapPath(BASE) { return path.join(BASE, '.gdocs-mirror.json'); }
function emptyMap() { return { rootFolderId: null, rootFolderName: null, rootFolderPath: null, folders: {}, docs: {} }; }
function loadMap(BASE) {
  try {
    const raw = JSON.parse(fs.readFileSync(mapPath(BASE), 'utf8'));
    return {
      ...emptyMap(),
      ...raw,
      folders: raw && raw.folders && typeof raw.folders === 'object' ? raw.folders : {},
      docs: raw && raw.docs && typeof raw.docs === 'object' ? raw.docs : {},
    };
  } catch {
    return emptyMap();
  }
}
function saveMap(BASE, m) {
  const next = {
    ...emptyMap(),
    ...m,
    folders: m && m.folders && typeof m.folders === 'object' ? m.folders : {},
    docs: m && m.docs && typeof m.docs === 'object' ? m.docs : {},
  };
  fs.writeFileSync(mapPath(BASE), JSON.stringify(next, null, 2));
}
function hash(s) { return crypto.createHash('md5').update(s).digest('hex'); }

// True for Drive "File not found" / 404 (stale id in the map after a delete in Drive)
function isNotFound(e) {
  const code = e && (e.code || (e.response && e.response.status));
  return code === 404 || /File not found|not ?found/i.test((e && e.message) || '');
}

function mirrorKey(srcDir, relPath) {
  const src = String(srcDir || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const rel = String(relPath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  return src === SRC_DIR ? rel : `${src}/${rel}`;
}

function resolveMirrorKey(BASE, key) {
  key = String(key || '').replace(/\\/g, '/').replace(/^\/+/, '');
  for (const src of SRC_DIRS) {
    const prefix = `${src}/`;
    const rel = key.startsWith(prefix) ? key.slice(prefix.length) : (src === SRC_DIR ? key : null);
    if (!rel) continue;
    const abs = path.join(BASE, src, rel.split('/').join(path.sep));
    if (fs.existsSync(abs)) return { key: mirrorKey(src, rel), abs };
  }
  return { key, abs: path.join(BASE, SRC_DIR, key.split('/').join(path.sep)) };
}

// All .md files under mirror roots. PRD keeps legacy keys; BRD/Assessments are prefixed.
function listMd(BASE) {
  const out = [];
  for (const src of SRC_DIRS) {
    const root = path.join(BASE, src);
    (function walk(dir, rel) {
      let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of ents) {
        if (e.name.startsWith('.')) continue;
        const r = rel ? rel + '/' + e.name : e.name;
        if (e.isDirectory()) walk(path.join(dir, e.name), r);
        else if (/\.md$/i.test(e.name)) out.push(mirrorKey(src, r));
      }
    })(root, '');
  }
  return out;
}

async function ensureRoot(BASE, map) {
  const root = await gdocs.resolveRootFolder(BASE, null, { createIfMissing: true });
  if (!root || !root.id) {
    const e = new Error('Folder mirror Google Drive tidak ditemukan.');
    e.status = 400;
    throw e;
  }
  const rootChanged = !!(map.rootFolderId && map.rootFolderId !== root.id);
  map.rootFolderId = root.id;
  map.rootFolderName = root.name || map.rootFolderName || null;
  map.rootFolderPath = root.path || map.rootFolderPath || map.rootFolderName || map.rootFolderId;
  if (rootChanged) {
    map.folders = {};
    map.docs = {};
  }
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

async function assertMirrorReady(BASE) {
  const root = await gdocs.resolveRootFolder(BASE, null, { createIfMissing: true });
  if (!root || !root.id) {
    const e = new Error('Folder mirror Google Drive tidak ditemukan.');
    e.status = 400;
    throw e;
  }
  return root;
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

// Mirror a single file. PRD accepts legacy relPath; BRD/Assessments use prefixed keys.
async function _mirrorFileInner(BASE, relPath, _healed = false) {
  const resolved = resolveMirrorKey(BASE, relPath);
  relPath = resolved.key;
  const abs = resolved.abs;
  if (!fs.existsSync(abs)) return { relPath, skipped: 'missing' };

  const content = fs.readFileSync(abs, 'utf8');
  const h = hash(content);
  const map = loadMap(BASE);
  const rec = map.docs[relPath];
  if (rec && rec.hash === h && rec.docId && !_healed) {
    const exists = await gdocs.fileExists(BASE, rec.docId);
    if (exists) return { relPath, skipped: 'unchanged', docId: rec.docId };
    delete map.docs[relPath];
    saveMap(BASE, map);
  }

  const relDir = relPath.includes('/') ? relPath.slice(0, relPath.lastIndexOf('/')) : '';
  const title  = relPath.split('/').pop().replace(/\.md$/i, '');

  try {
    await ensureRoot(BASE, map);
    const folderId = await ensureDir(BASE, map, relDir);

    let docId = rec && rec.docId, action = 'updated';
    let duplicateCount = 0;
    if (docId) {
      try { await gdocs.overwriteStyledDoc(BASE, docId, content); }
      catch (e) { if (isNotFound(e)) docId = null; else throw e; } // doc deleted → recreate
    }
    if (!docId) {
      const sameNameDocs = await gdocs.findDocsByName(BASE, title, folderId);
      duplicateCount = sameNameDocs.length;
      if (sameNameDocs.length) {
        docId = sameNameDocs[0].id;
        await gdocs.overwriteStyledDoc(BASE, docId, content);
        action = 'reused-existing';
      } else {
        const r = await gdocs.createDoc(BASE, { title, content, folderId });
        docId = r.id;
        action = 'created';
      }
    }

    map.docs[relPath] = { docId, hash: h, title, updatedAt: new Date().toISOString() };
    saveMap(BASE, map);
    return { relPath, docId, action, duplicateCount };
  } catch (e) {
    // Stale folder/root id (deleted in Drive) → purge folder cache + retry once
    if (isNotFound(e) && !_healed) {
      const m = loadMap(BASE);
      const badId = (/File not found:?\s*([A-Za-z0-9_\-]+)/.exec(e.message || '') || [])[1];
      if (badId && m.rootFolderId === badId) {
        m.rootFolderId = null;
        m.rootFolderName = null;
        m.rootFolderPath = null;
      }
      m.folders = {};            // rebuild the whole folder tree from Drive
      delete m.docs[relPath];    // force recreate this doc
      saveMap(BASE, m);
      return _mirrorFileInner(BASE, relPath, true);
    }
    throw e;
  }
}

// Mirror every .md under SRC_DIR (runs inside one queued task → no folder races).
async function _mirrorAllInner(BASE, opts = {}) {
  const onStart = typeof opts.onStart === 'function' ? opts.onStart : null;
  const onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
  const onFinish = typeof opts.onFinish === 'function' ? opts.onFinish : null;
  await assertMirrorReady(BASE); // fail fast on auth/scope/folder issues
  const files = listMd(BASE);
  let created = 0, updated = 0, skipped = 0, errors = [];
  if (onStart) onStart({ total: files.length });
  for (let i = 0; i < files.length; i++) {
    const rel = files[i];
    try {
      const r = await _mirrorFileInner(BASE, rel); // direct call (already serialized by caller)
      if (r.skipped) skipped++;
      else if (r.action === 'created') created++;
      else updated++;
      if (onProgress) onProgress({ index: i + 1, total: files.length, relPath: rel, result: r, counters: { created, updated, skipped, errors: errors.length } });
    } catch (e) {
      const err = { file: rel, error: e.message };
      errors.push(err);
      if (onProgress) onProgress({ index: i + 1, total: files.length, relPath: rel, error: err, counters: { created, updated, skipped, errors: errors.length } });
    }
  }
  const summary = { total: files.length, created, updated, skipped, errors };
  if (onFinish) onFinish(summary);
  return summary;
}

// Public, serialized entry points
function mirrorFile(BASE, relPath) { return enqueue(() => _mirrorFileInner(BASE, relPath)); }
function mirrorAll(BASE, opts)     { return enqueue(() => _mirrorAllInner(BASE, opts)); }

// True if a watcher path is a markdown file we mirror.
function isMirrorable(filename) { return /\.md$/i.test(filename || ''); }

function keyForWatchDir(BASE, dir, filename) {
  const src = path.relative(BASE, dir).replace(/\\/g, '/');
  return mirrorKey(src, filename);
}

module.exports = { mirrorAll, mirrorFile, listMd, isMirrorable, keyForWatchDir, SRC_DIR, SRC_DIRS, mapPath };

if (require.main === module) {
  const assert = require('assert');
  assert.strictEqual(mirrorKey('PRD', 'Conversation/a.md'), 'Conversation/a.md');
  assert.strictEqual(mirrorKey('BRD', 'x.md'), 'BRD/x.md');
  assert.strictEqual(mirrorKey('Assessments', 'a/b.md'), 'Assessments/a/b.md');
  assert.deepStrictEqual(SRC_DIRS, ['PRD', 'BRD', 'Assessments']);
  console.log('mirror self-check OK');
}
