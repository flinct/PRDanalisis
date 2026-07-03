'use strict';
// ─── Google Docs / Drive (OAuth user login) ─────────────────────────────────
// Auth comes from scripts/google-auth.js (OAuth2 + stored token). All calls act
// as the logged-in user, so docs live in the user's own Drive.

const path  = require('path');
const fs    = require('fs');
const gauth = require('./google-auth');

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DOC_MIME    = 'application/vnd.google-apps.document';
const DEFAULT_ROOT_FOLDER_NAME = 'PRD';

function mirrorStatePath(BASE) { return path.join(BASE, '.gdocs-mirror.json'); }
function folderConfigPath(BASE) { return path.join(BASE, 'google-drive-config.json'); }
function emptyMirrorState() {
  return { rootFolderId: null, rootFolderName: null, rootFolderPath: null, folders: {}, docs: {} };
}
function emptyFolderConfig() {
  return { rootFolderId: null, rootFolderName: null, rootFolderPath: null };
}
function loadMirrorState(BASE) {
  try {
    const raw = JSON.parse(fs.readFileSync(mirrorStatePath(BASE), 'utf8'));
    return {
      ...emptyMirrorState(),
      ...raw,
      folders: raw && raw.folders && typeof raw.folders === 'object' ? raw.folders : {},
      docs: raw && raw.docs && typeof raw.docs === 'object' ? raw.docs : {},
    };
  } catch {
    return emptyMirrorState();
  }
}
function saveMirrorState(BASE, state) {
  const next = {
    ...emptyMirrorState(),
    ...state,
    folders: state && state.folders && typeof state.folders === 'object' ? state.folders : {},
    docs: state && state.docs && typeof state.docs === 'object' ? state.docs : {},
  };
  fs.writeFileSync(mirrorStatePath(BASE), JSON.stringify(next, null, 2));
}
function loadFolderConfig(BASE) {
  try {
    const raw = JSON.parse(fs.readFileSync(folderConfigPath(BASE), 'utf8'));
    return {
      ...emptyFolderConfig(),
      ...raw,
    };
  } catch {
    const legacy = loadMirrorState(BASE);
    return {
      rootFolderId: legacy.rootFolderId || null,
      rootFolderName: legacy.rootFolderName || null,
      rootFolderPath: legacy.rootFolderPath || null,
    };
  }
}
function saveFolderConfig(BASE, state) {
  const next = {
    ...emptyFolderConfig(),
    ...state,
  };
  fs.writeFileSync(folderConfigPath(BASE), JSON.stringify(next, null, 2));
  const mirrorState = loadMirrorState(BASE);
  mirrorState.rootFolderId = next.rootFolderId;
  mirrorState.rootFolderName = next.rootFolderName;
  mirrorState.rootFolderPath = next.rootFolderPath;
  saveMirrorState(BASE, mirrorState);
}

function envFolderSetting() {
  const folderId = (process.env.GDRIVE_FOLDER_ID || '').trim() || null;
  const folderName = (process.env.GDRIVE_FOLDER_NAME || '').trim() || null;
  if (!folderId && !folderName) return null;
  return {
    folderId,
    folderName,
    folderPath: folderName || folderId,
    source: 'env',
    locked: true,
    isDefault: false,
  };
}

function currentFolderSetting(BASE) {
  const env = envFolderSetting();
  if (env) return env;
  const state = loadFolderConfig(BASE);
  if (state.rootFolderId || state.rootFolderName) {
    const fallbackName = state.rootFolderName || (state.rootFolderId ? DEFAULT_ROOT_FOLDER_NAME : null);
    return {
      folderId: state.rootFolderId || null,
      folderName: fallbackName,
      folderPath: state.rootFolderPath || fallbackName || state.rootFolderId || DEFAULT_ROOT_FOLDER_NAME,
      source: 'saved',
      locked: false,
      isDefault: false,
    };
  }
  return {
    folderId: null,
    folderName: DEFAULT_ROOT_FOLDER_NAME,
    folderPath: DEFAULT_ROOT_FOLDER_NAME,
    source: 'default',
    locked: false,
    isDefault: true,
  };
}

function rememberResolvedRoot(BASE, info) {
  if (!info || envFolderSetting()) return;
  const state = loadFolderConfig(BASE);
  const nextId   = info.id || null;
  const nextName = info.name || null;
  const nextPath = info.path || nextName || nextId || DEFAULT_ROOT_FOLDER_NAME;
  if (state.rootFolderId === nextId && state.rootFolderName === nextName && state.rootFolderPath === nextPath) return;
  state.rootFolderId = nextId;
  state.rootFolderName = nextName;
  state.rootFolderPath = nextPath;
  saveFolderConfig(BASE, state);
}

function clearSavedRoot(BASE) {
  if (envFolderSetting()) return;
  saveFolderConfig(BASE, emptyFolderConfig());
  const state = loadMirrorState(BASE);
  state.rootFolderId = null;
  state.rootFolderName = null;
  state.rootFolderPath = null;
  state.folders = {};
  state.docs = {};
  saveMirrorState(BASE, state);
}

function clients(BASE) {
  const { google } = require('googleapis');
  const auth = gauth.getAuthClient(BASE); // throws {status:401|503} if not ready
  return {
    docs:  google.docs({ version: 'v1', auth }),
    drive: google.drive({ version: 'v3', auth }),
  };
}

// status = auth status + which Drive folder we mirror/read
function status(BASE) {
  const auth = gauth.status(BASE);
  const folder = currentFolderSetting(BASE);
  return {
    ...auth,
    folderId: folder.folderId,
    folderName: folder.folderName,
    folderPath: folder.folderPath,
    folderSource: folder.source,
    folderLockedByEnv: folder.locked,
  };
}

function isNotFound(e) {
  const code = e && (e.code || (e.response && e.response.status));
  return code === 404 || /File not found|not ?found/i.test((e && e.message) || '');
}

// ─── DRIVE FOLDER HELPERS ──────────────────────────────────────────────────────
async function findFolderByName(drive, name, parentId) {
  let q = `mimeType='${FOLDER_MIME}' and name='${String(name).replace(/'/g, "\\'")}' and trashed=false`;
  q += parentId ? ` and '${parentId}' in parents` : ` and 'root' in parents`;
  const found = await drive.files.list({ q, fields: 'files(id,name)', pageSize: 5 });
  return found.data.files && found.data.files.length ? found.data.files[0] : null;
}

async function findOrCreateFolder(BASE, name, parentId) {
  const { drive } = clients(BASE);
  const found = await findFolderByName(drive, name, parentId);
  if (found) return found.id;
  const created = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: parentId ? [parentId] : undefined },
    fields: 'id',
  });
  return created.data.id;
}

async function findDocsByName(BASE, name, parentId) {
  const { drive } = clients(BASE);
  let q = `mimeType='${DOC_MIME}' and name='${String(name).replace(/'/g, "\\'")}' and trashed=false`;
  q += parentId ? ` and '${parentId}' in parents` : ` and 'root' in parents`;
  const found = await drive.files.list({
    q,
    fields: 'files(id,name,createdTime,modifiedTime,webViewLink)',
    orderBy: 'createdTime',
    pageSize: 20,
  });
  return found.data.files || [];
}

async function getFileMeta(BASE, fileId) {
  const { drive } = clients(BASE);
  const r = await drive.files.get({
    fileId,
    fields: 'id,name,mimeType,parents,trashed',
    supportsAllDrives: true,
  });
  return r.data;
}

async function fileExists(BASE, fileId) {
  try {
    const meta = await getFileMeta(BASE, fileId);
    return !!(meta && meta.id && !meta.trashed);
  } catch (e) {
    if (isNotFound(e)) return false;
    throw e;
  }
}

async function resolveRootFolder(BASE, drive = null, { createIfMissing = true } = {}) {
  drive = drive || clients(BASE).drive;
  const folder = currentFolderSetting(BASE);

  if (folder.folderId) {
    const info = {
      id: folder.folderId,
      name: folder.folderName || null,
      path: folder.folderPath || folder.folderName || folder.folderId,
      source: folder.source,
      locked: folder.locked,
      isDefault: folder.isDefault,
    };
    rememberResolvedRoot(BASE, info);
    return info;
  }

  if (!folder.folderName) return null;

  let found = await findFolderByName(drive, folder.folderName, null);
  let id = found && found.id;
  if (!id && createIfMissing) {
    const created = await drive.files.create({
      requestBody: { name: folder.folderName, mimeType: FOLDER_MIME },
      fields: 'id',
    });
    id = created.data.id;
  }
  if (!id) return null;

  const info = {
    id,
    name: folder.folderName,
    path: folder.folderPath || folder.folderName,
    source: folder.source,
    locked: folder.locked,
    isDefault: folder.isDefault,
  };
  rememberResolvedRoot(BASE, info);
  return info;
}

async function listChildFolders(drive, folderId) {
  const out = [];
  let pageToken;
  do {
    const r = await drive.files.list({
      q: `mimeType='${FOLDER_MIME}' and '${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id,name)',
      orderBy: 'name',
      pageSize: 1000,
      pageToken,
    });
    out.push(...(r.data.files || []));
    pageToken = r.data.nextPageToken;
  } while (pageToken);
  return out;
}

async function walkFolderChoices(drive, folderId, parentPath = '', depth = 0, out = []) {
  if (depth > 8) return out;
  const children = await listChildFolders(drive, folderId);
  for (const f of children) {
    const curPath = parentPath ? `${parentPath}/${f.name}` : f.name;
    out.push({ id: f.id, name: f.name, path: curPath });
    await walkFolderChoices(drive, f.id, curPath, depth + 1, out);
  }
  return out;
}

async function listFolders(BASE) {
  const { drive } = clients(BASE);
  return walkFolderChoices(drive, 'root');
}

async function setSelectedFolder(BASE, { folderId = null, folderName = null, folderPath = null } = {}) {
  if (envFolderSetting()) {
    const e = new Error('Folder Google Drive sedang dikunci oleh GDRIVE_FOLDER_ID / GDRIVE_FOLDER_NAME di environment.');
    e.status = 409;
    throw e;
  }
  const nextId = folderId ? String(folderId).trim() : null;
  const nextName = nextId ? (folderName ? String(folderName).trim() : null) : null;
  const nextPath = nextId ? (folderPath ? String(folderPath).trim() : (nextName || nextId)) : null;

  const state = loadMirrorState(BASE);
  const changed = state.rootFolderId !== nextId || state.rootFolderName !== nextName || state.rootFolderPath !== nextPath;
  saveFolderConfig(BASE, {
    rootFolderId: nextId,
    rootFolderName: nextName,
    rootFolderPath: nextPath,
  });
  state.rootFolderId = nextId;
  state.rootFolderName = nextName;
  state.rootFolderPath = nextPath;
  if (changed) {
    state.folders = {};
    state.docs = {};
  }
  saveMirrorState(BASE, state);
  return status(BASE);
}

// ─── LIST / TREE (read side) ─────────────────────────────────────────────────────
async function listChildren(drive, folderId) {
  const out = []; let pageToken;
  do {
    const r = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id,name,mimeType,modifiedTime)',
      orderBy: 'folder,name', pageSize: 1000, pageToken,
    });
    out.push(...(r.data.files || []));
    pageToken = r.data.nextPageToken;
  } while (pageToken);
  return out;
}

async function walkFolder(drive, folderId, depth = 0) {
  if (depth > 8) return [];
  const children = await listChildren(drive, folderId);
  const nodes = [];
  for (const f of children) {
    if (f.mimeType === FOLDER_MIME) {
      nodes.push({ kind: 'dir', name: f.name, path: 'gdir:' + f.id, children: await walkFolder(drive, f.id, depth + 1) });
    } else if (f.mimeType === DOC_MIME) {
      nodes.push({ kind: 'file', name: f.name, path: 'gdoc:' + f.id, ext: 'gdoc', gdocId: f.id });
    }
  }
  return nodes;
}

async function listTree(BASE) {
  const { drive } = clients(BASE);
  let root = await resolveRootFolder(BASE, drive, { createIfMissing: true });
  if (!root || !root.id) return [];
  try {
    return await walkFolder(drive, root.id, 0);
  } catch (e) {
    if (isNotFound(e) && !envFolderSetting()) {
      clearSavedRoot(BASE);
      root = await resolveRootFolder(BASE, drive, { createIfMissing: true });
      if (!root || !root.id) return [];
      return walkFolder(drive, root.id, 0);
    }
    throw e;
  }
}

// ─── READ (Doc → markdown) ─────────────────────────────────────────────────────
const HEADING_PREFIX = {
  TITLE: '# ', SUBTITLE: '## ',
  HEADING_1: '# ', HEADING_2: '## ', HEADING_3: '### ',
  HEADING_4: '#### ', HEADING_5: '##### ', HEADING_6: '###### ',
};

function paragraphToMd(p) {
  const text = (p.elements || []).map(e => {
    if (!e.textRun) return '';
    let t = (e.textRun.content || '').replace(/\n$/, '');
    if (!t) return '';
    const ts = e.textRun.textStyle || {};
    if (ts.link && ts.link.url) return `[${t}](${ts.link.url})`;
    if (ts.bold)   t = `**${t}**`;
    if (ts.italic) t = `*${t}*`;
    return t;
  }).join('');
  const style  = (p.paragraphStyle && p.paragraphStyle.namedStyleType) || '';
  const prefix = HEADING_PREFIX[style] || '';
  const bullet = p.bullet ? '- ' : '';
  return prefix + bullet + text;
}

function tableToMd(table) {
  const rows = table.tableRows || [];
  const lines = [];
  rows.forEach((row, ri) => {
    const cells = (row.tableCells || []).map(c =>
      (c.content || []).map(el => el.paragraph ? paragraphToMd(el.paragraph) : '').join(' ').trim());
    lines.push('| ' + cells.join(' | ') + ' |');
    if (ri === 0) lines.push('| ' + cells.map(() => '---').join(' | ') + ' |');
  });
  return lines.join('\n');
}

function docToMarkdown(doc) {
  const body = (doc.body && doc.body.content) || [];
  const out = [];
  for (const el of body) {
    if (el.paragraph)  out.push(paragraphToMd(el.paragraph));
    else if (el.table) out.push(tableToMd(el.table));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

async function readDoc(BASE, docId) {
  const { docs } = clients(BASE);
  const r = await docs.documents.get({ documentId: docId });
  return { id: docId, title: r.data.title, markdown: docToMarkdown(r.data) };
}

// ─── MARKDOWN → DOCS (basic styled) ──────────────────────────────────────────
// Builds a batchUpdate request list that inserts `md` at `baseIndex` and applies
// headings (#..######), **bold**, and "- "/"* " bullets, plus [text](url) links.
function buildStyledRequests(md, baseIndex = 1) {
  const lines = String(md == null ? '' : md).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let text = '';
  const paraReqs = [], bulletReqs = [], styleReqs = [];
  let idx = baseIndex;

  for (const raw of lines) {
    let line = raw, heading = 0, bullet = false;
    const hm = line.match(/^(#{1,6})\s+(.*)$/);
    if (hm) { heading = hm[1].length; line = hm[2]; }
    else { const bm = line.match(/^\s*[-*]\s+(.*)$/); if (bm) { bullet = true; line = bm[1]; } }

    const lineStart = idx;
    let out = '';
    let i = 0;
    while (i < line.length) {
      if (line[i] === '*' && line[i + 1] === '*') {
        const close = line.indexOf('**', i + 2);
        if (close !== -1) {
          const s = lineStart + out.length;
          out += line.slice(i + 2, close);
          const e = lineStart + out.length;
          if (e > s) styleReqs.push({ updateTextStyle: { range: { startIndex: s, endIndex: e }, textStyle: { bold: true }, fields: 'bold' } });
          i = close + 2; continue;
        }
      }
      if (line[i] === '[') {
        const m = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(line.slice(i));
        if (m) {
          const s = lineStart + out.length;
          out += m[1];
          const e = lineStart + out.length;
          if (e > s) styleReqs.push({ updateTextStyle: { range: { startIndex: s, endIndex: e }, textStyle: { link: { url: m[2] } }, fields: 'link' } });
          i += m[0].length; continue;
        }
      }
      out += line[i]; i++;
    }

    text += out + '\n';
    idx = lineStart + out.length + 1; // include the newline
    if (heading) paraReqs.push({ updateParagraphStyle: { range: { startIndex: lineStart, endIndex: idx }, paragraphStyle: { namedStyleType: 'HEADING_' + Math.min(heading, 6) }, fields: 'namedStyleType' } });
    if (bullet)  bulletReqs.push({ createParagraphBullets: { range: { startIndex: lineStart, endIndex: idx }, bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE' } });
  }

  // Order matters: insert text, then paragraph styles, bullets, then inline text styles.
  const requests = [{ insertText: { location: { index: baseIndex }, text } }, ...paraReqs, ...bulletReqs, ...styleReqs];
  return { text, requests };
}

async function applyStyled(BASE, docId, md) {
  const { docs } = clients(BASE);
  const { requests } = buildStyledRequests(md, 1);
  if (requests.length) await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests } });
}

// Replace entire doc body with styled markdown
async function overwriteStyledDoc(BASE, docId, md) {
  const { docs } = clients(BASE);
  const cur = await docs.documents.get({ documentId: docId });
  const body = (cur.data.body && cur.data.body.content) || [];
  const endIndex = body.length ? body[body.length - 1].endIndex : 1;
  const { requests } = buildStyledRequests(md, 1);
  const all = [];
  if (endIndex > 2) all.push({ deleteContentRange: { range: { startIndex: 1, endIndex: endIndex - 1 } } });
  all.push(...requests);
  await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests: all } });
  return { id: docId };
}

// ─── CREATE / UPDATE ─────────────────────────────────────────────────────────
async function createDoc(BASE, { title, content = '', folderId } = {}) {
  const { drive } = clients(BASE);
  const name   = title || 'Untitled (QA Browser)';
  const root   = folderId ? null : await resolveRootFolder(BASE, drive, { createIfMissing: true });
  const target = folderId || (root && root.id) || undefined;
  // Create the Doc directly inside the target folder (avoids a stray copy in My Drive root).
  const file = await drive.files.create({
    requestBody: { name, mimeType: DOC_MIME, parents: target ? [target] : undefined },
    fields: 'id',
  });
  const docId = file.data.id;
  if (content) await applyStyled(BASE, docId, content);
  return webLink(docId, name);
}

async function updateDoc(BASE, docId, { content = '', mode = 'overwrite' } = {}) {
  if (mode === 'append') {
    const { docs } = clients(BASE);
    const cur = await docs.documents.get({ documentId: docId });
    const body = (cur.data.body && cur.data.body.content) || [];
    const endIndex = body.length ? body[body.length - 1].endIndex : 1;
    const at = Math.max(1, endIndex - 1);
    const { requests } = buildStyledRequests((endIndex > 2 ? '\n' : '') + content, at);
    await docs.documents.batchUpdate({ documentId: docId, requestBody: { requests } });
    return webLink(docId);
  }
  await overwriteStyledDoc(BASE, docId, content);
  return webLink(docId);
}

function webLink(docId, title) {
  return { id: docId, title, webViewLink: `https://docs.google.com/document/d/${docId}/edit` };
}

module.exports = {
  status, listTree, listFolders, setSelectedFolder, readDoc, createDoc, updateDoc,
  // primitives used by the mirror engine:
  clients, findOrCreateFolder, findDocsByName, getFileMeta, fileExists, resolveRootFolder, buildStyledRequests,
  applyStyled, overwriteStyledDoc, webLink, DOC_MIME, FOLDER_MIME,
};
