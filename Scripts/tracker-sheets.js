'use strict';
// Read / write tracker rows from Google Sheets. Reuses google-auth + gdocs
// folder scope so we work under whatever Drive folder the user already picked
// in Settings → Google Connection.

const path = require('path');
const fs   = require('fs');
const gauth = require('./google-auth');
const gdocs = require('./gdocs');

const SHEET_MIME = 'application/vnd.google-apps.spreadsheet';
const HEADER = ['Name', 'Type', 'Parent Task', 'Task Title', 'Description', 'Status', 'Difficulty', 'Priority', 'Progress', 'Week', 'ver', 'start', 'end'];
const REQUIRED_HEADERS = HEADER.map(x => x.toLowerCase());
const DEFAULT_SHEET_TITLE = 'Sheet1';

function configPath(BASE) { return path.join(BASE, 'tracker-sheet-config.json'); }
function loadConfig(BASE) {
  try { return { ...emptyConfig(), ...JSON.parse(fs.readFileSync(configPath(BASE), 'utf8')) }; }
  catch { return emptyConfig(); }
}
function emptyConfig() {
  return { folderId: null, folderName: null, folderPath: null, spreadsheetId: null, spreadsheetName: null, tabs: [] };
}
function saveConfig(BASE, next) {
  fs.writeFileSync(configPath(BASE), JSON.stringify({ ...emptyConfig(), ...next }, null, 2));
  return loadConfig(BASE);
}

function spreadsheetIdFromUrl(raw) {
  const value = String(raw || '').trim();
  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : value;
}

function envSpreadsheetId() {
  return spreadsheetIdFromUrl(process.env.TRACKER_GOOGLE_SHEETS_ID || process.env.TRACKER_GOOGLE_SHEET_ID || '');
}

function activeSpreadsheetId(BASE) {
  const env = envSpreadsheetId();
  if (env) return { id: env, source: 'env', tabs: [] };
  const cfg = loadConfig(BASE);
  if (cfg.spreadsheetId) return { id: cfg.spreadsheetId, source: 'user', tabs: cfg.tabs || [] };
  return { id: null, source: 'none', tabs: [] };
}

function selectedFolder(BASE) {
  const cfg = loadConfig(BASE);
  return cfg.folderId
    ? { id: cfg.folderId, name: cfg.folderName || null, path: cfg.folderPath || cfg.folderName || cfg.folderId }
    : null;
}

function clients(BASE) {
  const { google } = require('googleapis');
  const auth = gauth.getAuthClient(BASE);
  return {
    sheets: google.sheets({ version: 'v4', auth }),
    drive:  google.drive({ version: 'v3', auth }),
  };
}

function normalizeHeader(value) { return String(value || '').trim().toLowerCase(); }

function normalizeProgress(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.min(100, Math.max(0, Math.round(value)));
  const text = String(value || '').trim();
  if (!text) return 0;
  const numeric = Number(text.replace(/%/g, '').replace(',', '.'));
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric <= 1 && !text.includes('%') ? numeric * 100 : numeric)));
}

function normalizeRow(raw = {}) {
  return {
    owner: String(raw.owner || raw.name || '').trim(),
    type: String(raw.type || '').trim().toLowerCase() === 'milestone' ? 'milestone' : 'core',
    parentTask: String(raw.parentTask || raw.parentTaskId || '').trim(),
    task: String(raw.task || '').trim(),
    description: String(raw.description || '').trim(),
    status: String(raw.status || '').trim().toLowerCase() || 'new',
    difficulty: String(raw.difficulty || '').trim().toLowerCase(),
    priority: String(raw.priority || '').trim().toLowerCase(),
    progress: normalizeProgress(raw.progress),
    week: String(raw.week || '').trim().toLowerCase(),
    version: String(raw.version || '').trim(),
    startDate: String(raw.startDate || raw.start || '').trim(),
    endDate: String(raw.endDate || raw.end || '').trim(),
  };
}

function encodeCell(value) { return value == null ? '' : String(value); }

function decodeRows(values, sheetTitle) {
  if (!Array.isArray(values) || !values.length) return [];
  const [headerRow, ...body] = values;
  const headers = Array.isArray(headerRow) ? headerRow.map(normalizeHeader) : [];
  const indexByHeader = new Map(headers.map((name, idx) => [name, idx]));
  if (!REQUIRED_HEADERS.every(name => indexByHeader.has(name))) return [];
  return body.map((cells, rowIndex) => {
    const pick = name => Array.isArray(cells) ? (cells[indexByHeader.get(name)] || '') : '';
    const row = normalizeRow({
      owner: pick('name'),
      type: pick('type'),
      parentTask: pick('parent task'),
      task: pick('task title'),
      description: pick('description'),
      status: pick('status'),
      difficulty: pick('difficulty'),
      priority: pick('priority'),
      progress: pick('progress'),
      week: pick('week'),
      version: pick('ver'),
      startDate: pick('start'),
      endDate: pick('end'),
    });
    if (!row.owner && !row.task && !row.description && !row.parentTask) return null;
    return { ...row, sourceSheet: sheetTitle, sourceRowNumber: rowIndex + 2 };
  }).filter(Boolean);
}

function encodeRows(rows) {
  return rows.map(row => {
    const n = normalizeRow(row);
    return [n.owner, n.type, n.parentTask, n.task, n.description, n.status, n.difficulty, n.priority, n.progress, n.week, n.version, n.startDate, n.endDate].map(encodeCell);
  });
}

function quoteTitle(title) { return `'${String(title).replace(/'/g, "''")}'`; }

// ── Drive: list Sheets files under the currently configured Drive folder ──
async function collectFolderIds(drive, rootId) {
  const ids = [rootId];
  const stack = [rootId];
  const seen = new Set([rootId]);
  const depthCap = 8;
  const depthOf = new Map([[rootId, 0]]);
  while (stack.length) {
    const cur = stack.pop();
    const curDepth = depthOf.get(cur) || 0;
    if (curDepth >= depthCap) continue;
    let pageToken;
    do {
      const r = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and '${cur}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id,name)',
        pageSize: 1000,
        pageToken,
      });
      for (const f of r.data.files || []) {
        if (!f || !f.id || seen.has(f.id)) continue;
        seen.add(f.id);
        ids.push(f.id);
        depthOf.set(f.id, curDepth + 1);
        stack.push(f.id);
      }
      pageToken = r.data.nextPageToken;
    } while (pageToken);
  }
  return ids;
}

async function listSpreadsheetsInScope(BASE) {
  const { drive } = clients(BASE);
  const root = selectedFolder(BASE);
  if (!root || !root.id) return { rootFolder: null, files: [] };
  const folderIds = await collectFolderIds(drive, root.id);
  const seen = new Set();
  const out = [];
  for (const folderId of folderIds) {
    let pageToken;
    do {
      const r = await drive.files.list({
        q: `mimeType='${SHEET_MIME}' and '${folderId}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id,name,modifiedTime,webViewLink)',
        orderBy: 'modifiedTime desc',
        pageSize: 200,
        pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      for (const file of r.data.files || []) {
        if (!file || !file.id || seen.has(file.id)) continue;
        seen.add(file.id);
        out.push(file);
      }
      pageToken = r.data.nextPageToken;
    } while (pageToken);
  }
  out.sort((a, b) => String(b.modifiedTime || '').localeCompare(String(a.modifiedTime || '')));
  return {
    rootFolder: { id: root.id, name: root.name, path: root.path },
    files: out,
  };
}

async function listTrackerFolders(BASE) {
  return gdocs.listFolders(BASE);
}

function saveTrackerFolder(BASE, { folderId = null, folderName = null, folderPath = null } = {}) {
  const nextId = folderId ? String(folderId).trim() : null;
  const cfg = loadConfig(BASE);
  const next = nextId
    ? {
        ...cfg,
        folderId: nextId,
        folderName: folderName ? String(folderName).trim() : null,
        folderPath: folderPath ? String(folderPath).trim() : (folderName ? String(folderName).trim() : nextId),
      }
    : {
        ...cfg,
        folderId: null,
        folderName: null,
        folderPath: null,
        spreadsheetId: null,
        spreadsheetName: null,
        tabs: [],
      };
  saveConfig(BASE, next);
  return trackerFolderStatus(BASE);
}

function trackerFolderStatus(BASE) {
  const folder = selectedFolder(BASE);
  return {
    folderId: folder?.id || null,
    folderName: folder?.name || null,
    folderPath: folder?.path || null,
  };
}

async function listSheetTabs(BASE, spreadsheetId) {
  const { sheets } = clients(BASE);
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'properties(title),sheets.properties(sheetId,title,index)',
  });
  return {
    title: meta.data.properties?.title || '',
    tabs: (meta.data.sheets || [])
      .map(entry => entry && entry.properties)
      .filter(Boolean)
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map(p => ({ sheetId: p.sheetId, title: p.title, index: p.index })),
  };
}

async function pickSpreadsheet(BASE, { spreadsheetId, spreadsheetName, tabs } = {}) {
  if (envSpreadsheetId()) {
    const e = new Error('Tracker spreadsheet is locked by TRACKER_GOOGLE_SHEETS_ID env var.');
    e.status = 409;
    throw e;
  }
  const nextSpreadsheetId = spreadsheetIdFromUrl(spreadsheetId || '');
  if (!nextSpreadsheetId) {
    saveConfig(BASE, emptyConfig());
    return status(BASE);
  }
  const tabList = Array.isArray(tabs) ? tabs.map(t => String(t || '').trim()).filter(Boolean) : [];
  const cfg = loadConfig(BASE);
  saveConfig(BASE, {
    ...cfg,
    spreadsheetId: nextSpreadsheetId,
    spreadsheetName: spreadsheetName ? String(spreadsheetName).trim() : null,
    tabs: tabList,
  });
  return status(BASE);
}

// ── Load / save rows ──────────────────────────────────────────────────────
async function ensureDefaultSheet(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties(sheetId,title,index)' });
  const list = (meta.data.sheets || [])
    .map(entry => entry && entry.properties)
    .filter(Boolean)
    .sort((a, b) => (a.index || 0) - (b.index || 0));
  if (list.length) return list;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: DEFAULT_SHEET_TITLE } } }] },
  });
  const retry = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties(sheetId,title,index)' });
  return (retry.data.sheets || [])
    .map(entry => entry && entry.properties)
    .filter(Boolean)
    .sort((a, b) => (a.index || 0) - (b.index || 0));
}

function selectActiveTabs(allTabs, savedTitles) {
  if (!Array.isArray(savedTitles) || !savedTitles.length) return allTabs;
  const set = new Set(savedTitles);
  const picked = allTabs.filter(tab => set.has(tab.title));
  return picked.length ? picked : allTabs;
}

async function readTracker(BASE) {
  const active = activeSpreadsheetId(BASE);
  if (!active.id) return { enabled: false, reason: 'no_spreadsheet_selected' };
  const { sheets } = clients(BASE);
  const allTabs = await ensureDefaultSheet(sheets, active.id);
  const tabs = selectActiveTabs(allTabs, active.tabs);
  const ranges = tabs.map(tab => `${quoteTitle(tab.title)}!A:M`);
  const batch = await sheets.spreadsheets.values.batchGet({ spreadsheetId: active.id, ranges, majorDimension: 'ROWS' });
  const valueRanges = batch.data.valueRanges || [];
  const tabRows = tabs.map((tab, idx) => ({
    title: tab.title,
    rows: decodeRows(valueRanges[idx] && valueRanges[idx].values, tab.title),
  }));
  return {
    enabled: true,
    spreadsheetId: active.id,
    tabs: tabRows,
    rows: tabRows.flatMap(tab => tab.rows),
  };
}

async function saveTracker(BASE, rows) {
  const active = activeSpreadsheetId(BASE);
  if (!active.id) return { enabled: false, reason: 'no_spreadsheet_selected' };
  const { sheets } = clients(BASE);
  const allTabs = await ensureDefaultSheet(sheets, active.id);
  const tabs = selectActiveTabs(allTabs, active.tabs);
  const grouped = new Map();
  const fallbackTitle = tabs[0]?.title || DEFAULT_SHEET_TITLE;
  for (const row of rows || []) {
    const raw = String(row && row.sourceSheet || '').trim();
    const title = tabs.some(t => t.title === raw) ? raw : fallbackTitle;
    if (!grouped.has(title)) grouped.set(title, []);
    grouped.get(title).push(row);
  }
  for (const tab of tabs) {
    const nextRows = grouped.get(tab.title) || [];
    const values = [HEADER].concat(encodeRows(nextRows));
    // ponytail: overwrite exactly A1:M(rows+1). Clear whole A:M first so trailing
    // deleted rows disappear. Upgrade path: incremental diff by sourceRowNumber
    // if this ever gets slow for very large trackers.
    await sheets.spreadsheets.values.clear({ spreadsheetId: active.id, range: `${quoteTitle(tab.title)}!A:M` });
    if (values.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: active.id,
        range: `${quoteTitle(tab.title)}!A1:M${values.length}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
    }
  }
  return readTracker(BASE);
}

async function status(BASE) {
  const active = activeSpreadsheetId(BASE);
  const cfg = loadConfig(BASE);
  const folder = selectedFolder(BASE);
  return {
    enabled: !!active.id,
    source: active.source,
    spreadsheetId: active.id,
    spreadsheetName: cfg.spreadsheetName,
    tabs: active.tabs,
    lockedByEnv: active.source === 'env',
    folderId: folder?.id || null,
    folderName: folder?.name || null,
    folderPath: folder?.path || null,
  };
}

module.exports = {
  HEADER,
  spreadsheetIdFromUrl,
  status,
  listSpreadsheetsInScope,
  listTrackerFolders,
  saveTrackerFolder,
  trackerFolderStatus,
  listSheetTabs,
  pickSpreadsheet,
  readTracker,
  saveTracker,
};
