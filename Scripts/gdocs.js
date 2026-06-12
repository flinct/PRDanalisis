'use strict';
// ─── Google Docs / Drive (OAuth user login) ─────────────────────────────────
// Auth comes from scripts/google-auth.js (OAuth2 + stored token). All calls act
// as the logged-in user, so docs live in the user's own Drive.

const gauth = require('./google-auth');

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const DOC_MIME    = 'application/vnd.google-apps.document';

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
  return {
    ...gauth.status(BASE),
    folderId:   process.env.GDRIVE_FOLDER_ID   || null,
    folderName: process.env.GDRIVE_FOLDER_NAME || null,
  };
}

// ─── DRIVE FOLDER HELPERS ──────────────────────────────────────────────────────
async function findOrCreateFolder(BASE, name, parentId) {
  const { drive } = clients(BASE);
  let q = `mimeType='${FOLDER_MIME}' and name='${String(name).replace(/'/g, "\\'")}' and trashed=false`;
  q += parentId ? ` and '${parentId}' in parents` : ` and 'root' in parents`;
  const found = await drive.files.list({ q, fields: 'files(id,name)', pageSize: 5 });
  if (found.data.files && found.data.files.length) return found.data.files[0].id;
  const created = await drive.files.create({
    requestBody: { name, mimeType: FOLDER_MIME, parents: parentId ? [parentId] : undefined },
    fields: 'id',
  });
  return created.data.id;
}

async function resolveRootFolderId(drive) {
  const id = process.env.GDRIVE_FOLDER_ID && process.env.GDRIVE_FOLDER_ID.trim();
  if (id) return id;
  const name = process.env.GDRIVE_FOLDER_NAME && process.env.GDRIVE_FOLDER_NAME.trim();
  if (name) {
    const r = await drive.files.list({
      q: `mimeType='${FOLDER_MIME}' and name='${name.replace(/'/g, "\\'")}' and trashed=false`,
      fields: 'files(id,name)', pageSize: 5,
    });
    if (r.data.files && r.data.files.length) return r.data.files[0].id;
  }
  return null;
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
  const rootId = await resolveRootFolderId(drive);
  if (rootId) return walkFolder(drive, rootId, 0);
  const r = await drive.files.list({
    q: `mimeType='${DOC_MIME}' and trashed=false`,
    fields: 'files(id,name,modifiedTime)', orderBy: 'modifiedTime desc', pageSize: 1000,
  });
  return (r.data.files || []).map(f => ({ kind: 'file', name: f.name, path: 'gdoc:' + f.id, ext: 'gdoc', gdocId: f.id }));
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
  const { docs, drive } = clients(BASE);
  const created = await docs.documents.create({ requestBody: { title: title || 'Untitled (QA Browser)' } });
  const docId = created.data.documentId;
  if (content) await applyStyled(BASE, docId, content);
  try {
    const target = folderId || await resolveRootFolderId(drive);
    if (target) await drive.files.update({ fileId: docId, addParents: target, fields: 'id' });
  } catch {}
  return webLink(docId, created.data.title);
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
  status, listTree, readDoc, createDoc, updateDoc,
  // primitives used by the mirror engine:
  clients, findOrCreateFolder, resolveRootFolderId, buildStyledRequests,
  applyStyled, overwriteStyledDoc, webLink, DOC_MIME, FOLDER_MIME,
};
