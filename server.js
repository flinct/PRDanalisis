"use strict";
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { DatabaseSync } = require("node:sqlite");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3001;
const BASE = __dirname;
const DB_PATH = process.env.DB_PATH || path.join(BASE, "qa.db");
const OPENPROJECT_BASE_URL =
  process.env.OPENPROJECT_BASE_URL || "https://project.ordo.co.id";
const OPENPROJECT_API_KEY =
  process.env.OPENPROJECT_API_KEY ||
  "1917e7f65565dbf5024e31013af1843e2932fd4e4c9a95dac5955bea5a6c5ade";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve the QA dashboard HTML
app.use(
  express.static(path.join(BASE, "Test"), { index: "testcase-browser.html" }),
);
app.use("/tmp", express.static(path.join(BASE, "tmp")));

// Always serve the latest runner agent so tester PCs can self-update:
//   curl http://<host>:3001/runner.js -o runner.js   (then: node runner.js)
app.get("/runner.js", (_req, res) =>
  res.sendFile(path.join(BASE, "runner.js")),
);

// ─── DATABASE SETUP ──────────────────────────────────────────────────────────
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");
db.exec("PRAGMA busy_timeout = 5000");

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

  CREATE TABLE IF NOT EXISTS app_state (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_by  TEXT DEFAULT 'system',
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_tc_module    ON test_cases(module);
  CREATE INDEX IF NOT EXISTS idx_tc_type      ON test_cases(test_type);
  CREATE INDEX IF NOT EXISTS idx_runs_case    ON test_runs(case_id);
  CREATE INDEX IF NOT EXISTS idx_runs_status  ON test_runs(status);
`);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function safePath(rel) {
  const r = path.resolve(BASE, String(rel).replace(/\.\./g, ""));
  if (!r.startsWith(BASE)) throw new Error("Path outside workspace");
  return r;
}

function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function decodeHtml(text) {
  return String(text || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function pickHref(obj, rel) {
  return obj && obj._links && obj._links[rel] && obj._links[rel].href
    ? obj._links[rel].href
    : "";
}

function parseIdFromHref(href) {
  const m = String(href || "").match(/\/(\d+)(?:\?.*)?$/);
  return m ? Number(m[1]) : null;
}

function openProjectRequest(apiPath) {
  return new Promise((resolve, reject) => {
    if (!OPENPROJECT_API_KEY)
      return reject(new Error("OPENPROJECT_API_KEY missing"));
    const url = new URL(apiPath, OPENPROJECT_BASE_URL);
    const req = https.request(
      url,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`apikey:${OPENPROJECT_API_KEY}`).toString("base64"),
          Accept: "application/json",
        },
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(
              new Error(`OpenProject ${res.statusCode}: ${body.slice(0, 300)}`),
            );
          }
          try {
            resolve(JSON.parse(body || "{}"));
          } catch (e) {
            reject(new Error("OpenProject invalid JSON: " + e.message));
          }
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function fetchOpenProjectCollection(apiPath, collectionKey) {
  const data = await openProjectRequest(apiPath);
  if (Array.isArray(data[collectionKey])) return data[collectionKey];
  if (data._embedded && Array.isArray(data._embedded.elements))
    return data._embedded.elements;
  return [];
}

async function fetchAllOpenProjectWorkPackages(filters, sort) {
  const pageSize = 200;
  let offset = 0;
  let total = null;
  const rows = [];
  while (total == null || offset < total) {
    const apiPath = `/api/v3/work_packages?offset=${offset}&pageSize=${pageSize}&filters=${encodeURIComponent(JSON.stringify(filters))}&sortBy=${encodeURIComponent(buildOpenProjectSort(sort))}`;
    const data = await openProjectRequest(apiPath);
    const batch = Array.isArray(data._embedded?.elements) ? data._embedded.elements : [];
    rows.push(...batch.map(normalizeWorkPackage));
    total = Number(data.total) || rows.length;
    if (!batch.length) break;
    offset += pageSize;
  }
  return { total: total || rows.length, rows };
}

function buildOpenProjectWpFilters(qs) {
  const filters = [];
  const projectId = toIntOrNull(qs.projectId) || 7;
  const versionIds = String(qs.versionIds || qs.versionId || "")
    .split(",")
    .map((v) => toIntOrNull(v))
    .filter((v) => Number.isFinite(v) && v > 0)
    .map(String);
  if (!versionIds.length) throw new Error("versionId required");
  filters.push({ project: { operator: "=", values: [String(projectId)] } });
  filters.push({ version: { operator: "=", values: versionIds } });
  const map = [
    ["statusId", "status_id"],
    ["typeId", "type_id"],
    ["priorityId", "priority_id"],
    ["assigneeId", "assigned_to_id"],
  ];
  for (const [param, key] of map) {
    const v = Number(qs[param]);
    if (Number.isFinite(v) && v > 0)
      filters.push({ [key]: { operator: "=", values: [String(v)] } });
  }
  if (qs.keyword)
    filters.push({ subject: { operator: "~", values: [String(qs.keyword)] } });
  return filters;
}

function buildOpenProjectSort(sort) {
  const key = String(sort || "updatedAt:desc");
  const [fieldRaw, dirRaw] = key.split(":");
  const fieldMap = {
    updatedAt: "updatedAt",
    createdAt: "createdAt",
    subject: "subject",
    priority: "priority",
    manualSort: "manualSort",
  };
  const field = fieldMap[fieldRaw] || "updatedAt";
  const dir = String(dirRaw || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  return JSON.stringify([[field, dir]]);
}

function normalizeWorkPackage(wp) {
  const statusHref = pickHref(wp, "status");
  const typeHref = pickHref(wp, "type");
  const priorityHref = pickHref(wp, "priority");
  const assigneeHref = pickHref(wp, "assignee");
  const versionHref = pickHref(wp, "version");
  return {
    id: wp.id,
    subject: decodeHtml(wp.subject || ""),
    description: decodeHtml(
      (wp.description &&
        (wp.description.raw || wp.description.html || wp.description)) ||
        "",
    ),
    statusId: parseIdFromHref(statusHref),
    statusName: wp._links?.status?.title || "",
    typeId: parseIdFromHref(typeHref),
    typeName: wp._links?.type?.title || "",
    priorityId: parseIdFromHref(priorityHref),
    priorityName: wp._links?.priority?.title || "",
    assigneeId: parseIdFromHref(assigneeHref),
    assigneeName: wp._links?.assignee?.title || "",
    versionId: parseIdFromHref(versionHref),
    versionName: wp._links?.version?.title || "",
    percentageDone: wp.percentageDone || 0,
    startDate: wp.startDate || null,
    dueDate: wp.dueDate || null,
    updatedAt: wp.updatedAt || null,
    createdAt: wp.createdAt || null,
  };
}

// Ensure a minimal test_cases row exists so automation_map / test_runs FKs hold
// even when the TSV hasn't been imported into the DB yet.
function ensureCase(id, filePath) {
  if (!id) return;
  db.prepare(
    "INSERT OR IGNORE INTO test_cases (id, file_path, created_at) VALUES (?, ?, datetime('now'))",
  ).run(String(id), filePath ? String(filePath) : "");
}

function walkDir(dir, base = "") {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  const SKIP = new Set([
    "node_modules",
    ".git",
    "Chat",
    "AgentNotes",
    "Memory",
    "Rules",
  ]);
  for (const e of entries) {
    if (SKIP.has(e.name) || e.name.startsWith(".")) continue;
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push({
        kind: "dir",
        name: e.name,
        path: rel,
        children: walkDir(full, rel),
      });
    } else if (/\.(tsv|csv|md|txt)$/i.test(e.name)) {
      results.push({
        kind: "file",
        name: e.name,
        path: rel,
        ext: path.extname(e.name).slice(1).toLowerCase(),
      });
    }
  }
  return results;
}

// ─── API: AUTH ────────────────────────────────────────────────────────────────
const YAML = require("js-yaml");
const USERS_PATH = path.join(BASE, "Setup", "users.yaml");
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res
      .status(400)
      .json({ ok: false, error: "Username & password required" });
  try {
    const doc = YAML.load(fs.readFileSync(USERS_PATH, "utf8"));
    const user = (doc.users || []).find(
      (u) => u.username === username && u.password === password,
    );
    if (!user)
      return res
        .status(401)
        .json({ ok: false, error: "Invalid username or password" });
    res.json({
      ok: true,
      username: user.username,
      role: user.role,
      name: user.name || user.username,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Failed to read users.yaml" });
  }
});

app.get("/api/new-request", (_req, res) => {
  try {
    const row = db
      .prepare(
        "SELECT value, updated_at, updated_by FROM app_state WHERE key = ?",
      )
      .get("new_request_blocks");
    const blocks = row
      ? JSON.parse(row.value)
      : [
          {
            id: "req-1",
            type: "text",
            text: "Klik text ini untuk edit request baru.",
          },
          { id: "req-2", type: "todo", text: "Checklist item", checked: false },
        ];
    res.json({
      ok: true,
      blocks,
      updatedAt: row?.updated_at || null,
      updatedBy: row?.updated_by || null,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.put("/api/new-request", (req, res) => {
  const { blocks, updatedBy } = req.body || {};
  if (!Array.isArray(blocks))
    return res.status(400).json({ ok: false, error: "blocks must be array" });
  try {
    db.prepare(
      `INSERT INTO app_state (key, value, updated_by, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_by=excluded.updated_by, updated_at=datetime('now')`,
    ).run(
      "new_request_blocks",
      JSON.stringify(blocks),
      String(updatedBy || "user"),
    );
    const row = db
      .prepare("SELECT updated_at, updated_by FROM app_state WHERE key = ?")
      .get("new_request_blocks");
    res.json({
      ok: true,
      updatedAt: row?.updated_at || null,
      updatedBy: row?.updated_by || null,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── API: FILES ──────────────────────────────────────────────────────────────
app.get("/api/files", (_req, res) => {
  const SECTIONS = [
    { id: "test", folderName: "Test", label: "Test Cases", color: "#60a5fa" },
    { id: "prd", folderName: "PRD", label: "PRD", color: "#a78bfa" },
    { id: "brd", folderName: "BRD", label: "BRD", color: "#f9a8d4" },
    {
      id: "assessments",
      folderName: "Assessments",
      label: "Assessments",
      color: "#34d399",
    },
    {
      id: "feature",
      folderName: "Feature List",
      label: "Feature List",
      color: "#fbbf24",
    },
  ];
  const result = SECTIONS.map((s) => {
    const dir = path.join(BASE, s.folderName);
    return { ...s, tree: fs.existsSync(dir) ? walkDir(dir, s.folderName) : [] };
  });
  res.json(result);
});

app.get("/api/files/content", (req, res) => {
  try {
    const fp = safePath(req.query.path || "");
    if (!fs.existsSync(fp)) return res.status(404).json({ error: "Not found" });
    res.type("text/plain").send(fs.readFileSync(fp, "utf8"));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/files/content", (req, res) => {
  try {
    const fp = safePath(req.query.path || "");
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, req.body.content || "", "utf8");
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Create a folder (collection) from the dashboard
app.post("/api/files/mkdir", (req, res) => {
  try {
    const dir = safePath((req.body && req.body.path) || "");
    fs.mkdirSync(dir, { recursive: true });
    broadcastTreeChange();
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ─── Sidebar tree live updates (SSE) ─────────────────────────────────────────
const treeClients = new Set();
function broadcastTreeChange() {
  for (const r of treeClients) {
    try {
      r.write("data: change\n\n");
    } catch {}
  }
}
app.get("/api/files/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  res.write("retry: 3000\n\n");
  treeClients.add(res);
  req.on("close", () => treeClients.delete(res));
});

// ─── API: OPENPROJECT DASHBOARD ─────────────────────────────────────────────
app.get("/api/dashboard/openproject/meta", async (req, res) => {
  try {
    const projectId = toIntOrNull(req.query.projectId) || 7;
    const [versions, statuses, types, priorities] = await Promise.all([
      fetchOpenProjectCollection(
        `/api/v3/projects/${projectId}/versions?pageSize=100`,
        "versions",
      ),
      fetchOpenProjectCollection("/api/v3/statuses?pageSize=200", "statuses"),
      fetchOpenProjectCollection("/api/v3/types?pageSize=100", "types"),
      fetchOpenProjectCollection(
        "/api/v3/priorities?pageSize=100",
        "priorities",
      ),
    ]);
    res.json({
      ok: true,
      projectId,
      versions: versions.map((v) => ({
        id: v.id,
        name: v.name,
        status: v.status || "",
        startDate: v.startDate || null,
        endDate: v.endDate || null,
      })),
      statuses: statuses.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color || "",
        isClosed: !!s.isClosed,
      })),
      types: types.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color || "",
        isMilestone: !!t.isMilestone,
      })),
      priorities: priorities.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color || "",
      })),
      assignees: [],
      assigneeNote:
        "OpenProject users endpoint unauthorized for current token; assignee filter stays free-text ID for now.",
      sortOptions: [
        { value: "updatedAt:desc", label: "Updated terbaru" },
        { value: "updatedAt:asc", label: "Updated terlama" },
        { value: "createdAt:desc", label: "Created terbaru" },
        { value: "subject:asc", label: "Subject A-Z" },
        { value: "priority:desc", label: "Priority tinggi" },
        { value: "manualSort:asc", label: "Manual order" },
      ],
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/api/dashboard/openproject/work-packages", async (req, res) => {
  try {
    const pageSize = Math.min(
      Math.max(Number(req.query.pageSize) || 50, 1),
      200,
    );
    const page = Math.max(Number(req.query.page) || 1, 1);
    const offset = (page - 1) * pageSize;
    const filters = buildOpenProjectWpFilters(req.query);
    const apiPath = `/api/v3/work_packages?offset=${offset}&pageSize=${pageSize}&filters=${encodeURIComponent(JSON.stringify(filters))}&sortBy=${encodeURIComponent(buildOpenProjectSort(req.query.sort))}`;
    const [pageData, aggregate] = await Promise.all([
      openProjectRequest(apiPath),
      fetchAllOpenProjectWorkPackages(filters, req.query.sort),
    ]);
    const rows = Array.isArray(pageData._embedded?.elements)
      ? pageData._embedded.elements.map(normalizeWorkPackage)
      : [];
    const summaryRows = aggregate.rows;
    const summary = {
      total: aggregate.total,
      byStatus: Object.values(
        summaryRows.reduce((acc, row) => {
          const key = row.statusName || "Unknown";
          acc[key] = acc[key] || { key, count: 0 };
          acc[key].count += 1;
          return acc;
        }, {}),
      ),
      byType: Object.values(
        summaryRows.reduce((acc, row) => {
          const key = row.typeName || "Unknown";
          acc[key] = acc[key] || { key, count: 0 };
          acc[key].count += 1;
          return acc;
        }, {}),
      ),
      byPriority: Object.values(
        summaryRows.reduce((acc, row) => {
          const key = row.priorityName || "Unknown";
          acc[key] = acc[key] || { key, count: 0 };
          acc[key].count += 1;
          return acc;
        }, {}),
      ),
    };
    res.json({
      ok: true,
      projectId: toIntOrNull(req.query.projectId) || 7,
      versionIds: String(req.query.versionIds || req.query.versionId || "")
        .split(",")
        .map((v) => toIntOrNull(v))
        .filter((v) => Number.isFinite(v) && v > 0),
      page,
      pageSize,
      total: aggregate.total,
      count: rows.length,
      workPackages: rows,
      allWorkPackages: aggregate.rows,
      summary,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── API: GOOGLE (OAuth login) + DOCS + MIRROR ───────────────────────────────
const gdocs = require("./scripts/gdocs.js");
const gauth = require("./scripts/google-auth.js");
const mirror = require("./scripts/mirror.js");

// OAuth: status / login / callback / logout
app.get("/api/google/status", (_req, res) => res.json(gdocs.status(BASE)));

app.get("/api/google/folders", async (_req, res) => {
  try {
    res.json(await gdocs.listFolders(BASE));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.put("/api/google/folder", async (req, res) => {
  try {
    res.json(await gdocs.setSelectedFolder(BASE, req.body || {}));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/google/login", (_req, res) => {
  try {
    res.redirect(gauth.getAuthUrl(BASE));
  } catch (e) {
    res.status(e.status || 500).send("OAuth not configured: " + e.message);
  }
});

app.get("/oauth2callback", async (req, res) => {
  try {
    if (req.query.error) throw new Error(String(req.query.error));
    await gauth.handleCallback(BASE, req.query.code);
    res.send(
      '<html><body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:40px">' +
        "<h3>✓ Connected to Google</h3><p>You can close this tab and return to QA Browser.</p>" +
        '<script>setTimeout(function(){location.href="/"},1200)</script></body></html>',
    );
  } catch (e) {
    res.status(500).send("Login failed: " + e.message);
  }
});

app.post("/api/google/logout", (_req, res) => res.json(gauth.logout(BASE)));

// Mirror: push local PRD .md → Google Docs (manual trigger)
app.post("/api/mirror", async (_req, res) => {
  try {
    const startedAt = Date.now();
    console.log("  ⇪ mirror-all start");
    const result = await mirror.mirrorAll(BASE, {
      onStart: ({ total }) => console.log(`    total files : ${total}`),
      onProgress: ({ index, total, relPath, result, error, counters }) => {
        const prefix = String(index).padStart(String(total).length, " ");
        if (error) {
          console.log(
            `    [${prefix}/${total}] ERROR   ${relPath}  → ${error.error}`,
          );
          return;
        }
        const label =
          result && result.skipped
            ? `SKIP:${result.skipped}`
            : result && result.action
              ? result.action.toUpperCase()
              : "DONE";
        console.log(
          `    [${prefix}/${total}] ${label.padEnd(12)} ${relPath}  (c:${counters.created} u:${counters.updated} s:${counters.skipped} e:${counters.errors})`,
        );
      },
      onFinish: (summary) =>
        console.log(
          `  ⇪ mirror-all done  → created ${summary.created}, updated ${summary.updated}, skipped ${summary.skipped}, errors ${summary.errors.length}, ${Date.now() - startedAt}ms`,
        ),
    });
    res.json(result);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// NOTE: /status must be declared before /:id so it isn't captured as an id.
app.get("/api/gdocs/status", (_req, res) => res.json(gdocs.status(BASE)));

app.get("/api/gdocs", async (_req, res) => {
  try {
    res.json(await gdocs.listTree(BASE));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.post("/api/gdocs", async (req, res) => {
  try {
    res.json(await gdocs.createDoc(BASE, req.body || {}));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/gdocs/:id", async (req, res) => {
  try {
    res.json(await gdocs.readDoc(BASE, req.params.id));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.put("/api/gdocs/:id", async (req, res) => {
  try {
    res.json(await gdocs.updateDoc(BASE, req.params.id, req.body || {}));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ─── API: TEST CASES ─────────────────────────────────────────────────────────
app.get("/api/testcases", (req, res) => {
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
  if (module) {
    sql += " AND tc.module = ?";
    params.push(module);
  }
  if (tc_type) {
    sql += ' AND COALESCE(am.tc_type,"manual") = ?';
    params.push(tc_type);
  }
  if (search) {
    sql += " AND (tc.id LIKE ? OR tc.scenario LIKE ? OR tc.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  sql += " ORDER BY tc.id LIMIT ? OFFSET ?";
  params.push(Number(limit), Number(offset));

  const rows = db.prepare(sql).all(...params);
  // parse JSON columns
  const parsed = rows.map((r) => ({
    ...r,
    steps: tryJSON(r.steps, []),
    expected: tryJSON(r.expected, []),
    tc_type: r.tc_type || "manual",
  }));
  res.json(parsed);
});

app.get("/api/testcases/stats", (_req, res) => {
  const total = db.prepare("SELECT COUNT(*) as n FROM test_cases").get().n;
  const byMod = db
    .prepare(
      "SELECT module, COUNT(*) as n FROM test_cases GROUP BY module ORDER BY n DESC",
    )
    .all();
  const byType = db
    .prepare(
      `SELECT COALESCE(am.tc_type,'manual') as tc_type, COUNT(*) as n
                               FROM test_cases tc LEFT JOIN automation_map am ON am.case_id=tc.id
                               GROUP BY tc_type`,
    )
    .all();
  const byRunSt = db
    .prepare(
      `SELECT status, COUNT(*) as n FROM test_runs
                               WHERE ran_at = (SELECT MAX(ran_at) FROM test_runs r2 WHERE r2.case_id = test_runs.case_id)
                               GROUP BY status`,
    )
    .all();
  res.json({ total, byModule: byMod, byType, byLastRunStatus: byRunSt });
});

app.get("/api/testcases/:id", (req, res) => {
  const row = db
    .prepare(
      `
    SELECT tc.*, am.tc_type, am.spec_file, am.grep_pattern, am.notes
    FROM test_cases tc LEFT JOIN automation_map am ON am.case_id = tc.id
    WHERE tc.id = ?
  `,
    )
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({
    ...row,
    steps: tryJSON(row.steps, []),
    expected: tryJSON(row.expected, []),
    tc_type: row.tc_type || "manual",
  });
});

// ─── API: AUTOMATION MAPPING ─────────────────────────────────────────────────
app.put("/api/testcases/:id/map", (req, res) => {
  try {
    const {
      tc_type = "manual",
      spec_file = "",
      grep_pattern = "",
      notes = "",
    } = req.body;
    ensureCase(req.params.id);
    db.prepare(
      `
      INSERT INTO automation_map (case_id, tc_type, spec_file, grep_pattern, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(case_id) DO UPDATE SET
        tc_type=excluded.tc_type, spec_file=excluded.spec_file,
        grep_pattern=excluded.grep_pattern, notes=excluded.notes,
        updated_at=excluded.updated_at
    `,
    ).run(req.params.id, tc_type, spec_file, grep_pattern, notes);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Bulk update tc_type for multiple cases
app.put("/api/testcases/map/bulk", (req, res) => {
  const { updates } = req.body; // [{ case_id, tc_type, spec_file, grep_pattern }]
  if (!Array.isArray(updates))
    return res.status(400).json({ error: "updates must be array" });
  const stmt = db.prepare(`
    INSERT INTO automation_map (case_id, tc_type, spec_file, grep_pattern, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(case_id) DO UPDATE SET
      tc_type=excluded.tc_type, spec_file=excluded.spec_file,
      grep_pattern=excluded.grep_pattern, updated_at=excluded.updated_at
  `);
  db.exec("BEGIN");
  try {
    for (const it of updates) {
      ensureCase(it.case_id);
      stmt.run(
        it.case_id,
        it.tc_type || "manual",
        it.spec_file || "",
        it.grep_pattern || "",
      );
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    return res.status(500).json({ error: e.message });
  }
  res.json({ ok: true, count: updates.length });
});

// ─── API: TEST RUNS ──────────────────────────────────────────────────────────
app.get("/api/testcases/:id/runs", (req, res) => {
  const runs = db
    .prepare(
      "SELECT * FROM test_runs WHERE case_id = ? ORDER BY ran_at DESC LIMIT 20",
    )
    .all(req.params.id);
  res.json(runs);
});

app.get("/api/runs/recent", (req, res) => {
  const limit = Number(req.query.limit) || 50;
  const runs = db
    .prepare(
      "SELECT tr.*, tc.scenario, tc.module FROM test_runs tr JOIN test_cases tc ON tc.id = tr.case_id ORDER BY tr.ran_at DESC LIMIT ?",
    )
    .all(limit);
  res.json(runs);
});

// ─── API: AUTOMATION CONFIG + AUTO-MAP ───────────────────────────────────────
const automation = require("./scripts/automation.js");
const setupCfg = require("./scripts/setup-config.js");

// Localhost-only guard for any setup MUTATION (PUT /api/setup/*).
// GET endpoints stay open so non-localhost testers can still view the dashboard.
function isLoopback(ip) {
  if (!ip) return false;
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("127.")
  );
}
function setupMutationGuard(req, res, next) {
  const ip = (req.ip || req.connection?.remoteAddress || "").replace(
    "::ffff:",
    "",
  );
  if (!isLoopback(ip)) {
    return res
      .status(403)
      .json({ error: "edit Setup hanya dari localhost (host machine)", ip });
  }
  next();
}

// ─── API: SETUP (Phase 2.0 — orchestration read + init + validate + preview) ─
app.get("/api/setup/config", (_req, res) => {
  try {
    const s = setupCfg.readSetup(BASE);
    res.json({
      exists: s.exists,
      hash: s.hash,
      parsed: s.parsed,
      raw: s.raw, // useful for textarea editor later
      runtime: s.runtime,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/setup/init", setupMutationGuard, (_req, res) => {
  try {
    res.json(setupCfg.initSetup(BASE));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/setup/validate", (req, res) => {
  try {
    res.json(setupCfg.validateSetup(req.body || {}));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/setup/runtime-preview", (req, res) => {
  try {
    res.json({ runtime: setupCfg.compileRuntime(req.body || {}) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Phase 2.3 — atomic save orchestration bundle (5 yaml + runtime.md)
app.put("/api/setup/config", setupMutationGuard, (req, res) => {
  try {
    const { bundle, expectedHash } = req.body || {};
    const r = setupCfg.saveSetupAtomic(BASE, bundle || {}, expectedHash || "");
    res.json(r);
  } catch (e) {
    res.status(e.status || 500).json({
      error: e.message,
      serverHash: e.serverHash,
      validation: e.validation,
    });
  }
});

// ─── API: SETUP — Rules/Memory browser (Phase 2.1: list + read) ──────────────
app.get("/api/setup/rules", (_req, res) => {
  try {
    res.json(setupCfg.listRules(BASE));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/setup/rules/file", (req, res) => {
  try {
    res.json(setupCfg.readManaged(BASE, "rules", String(req.query.path || "")));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/setup/memory", (_req, res) => {
  try {
    res.json(setupCfg.listMemory(BASE));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/setup/memory/file", (req, res) => {
  try {
    res.json(
      setupCfg.readManaged(BASE, "memory", String(req.query.path || "")),
    );
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// Phase 2.2 — edit + save Rules/Memory file
app.put("/api/setup/rules/file", setupMutationGuard, (req, res) => {
  try {
    const { content, expectedHash } = req.body || {};
    res.json(
      setupCfg.writeManaged(
        BASE,
        "rules",
        String(req.query.path || ""),
        content,
        expectedHash || "",
      ),
    );
  } catch (e) {
    res
      .status(e.status || 500)
      .json({ error: e.message, serverHash: e.serverHash });
  }
});
app.put("/api/setup/memory/file", setupMutationGuard, (req, res) => {
  try {
    const { content, expectedHash } = req.body || {};
    res.json(
      setupCfg.writeManaged(
        BASE,
        "memory",
        String(req.query.path || ""),
        content,
        expectedHash || "",
      ),
    );
  } catch (e) {
    res
      .status(e.status || 500)
      .json({ error: e.message, serverHash: e.serverHash });
  }
});

// Phase 2.2 — list + read backup versions
app.get("/api/setup/backups", (req, res) => {
  try {
    const kind = String(req.query.kind || "");
    if (!["rules", "memory", "setup"].includes(kind))
      return res.status(400).json({ error: "kind must be rules|memory|setup" });
    res.json(setupCfg.listBackups(BASE, kind, String(req.query.path || "")));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});
app.get("/api/setup/backups/content", (req, res) => {
  try {
    const kind = String(req.query.kind || "");
    if (!["rules", "memory", "setup"].includes(kind))
      return res.status(400).json({ error: "kind must be rules|memory|setup" });
    const content = setupCfg.readBackup(
      BASE,
      kind,
      String(req.query.path || ""),
      String(req.query.ts || ""),
    );
    res.json({ content });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

app.get("/api/automation/config", (_req, res) =>
  res.json(automation.getConfig(BASE)),
);
app.put("/api/automation/config", (req, res) => {
  try {
    res.json(automation.setConfig(BASE, req.body || {}));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Auto-map a set of test cases from the generated manifest(s) in AUTOMATION_ROOT
app.post("/api/automation/automap", (req, res) => {
  try {
    const caseIds = (req.body && req.body.case_ids) || [];
    const root = automation.getConfig(BASE).resolved;
    const idx = automation.buildSpecIndex(root); // exact spec file per [ID]-tagged test
    const man = automation.buildManifestMap(root); // fallback: domain dir + scenario
    const stmt = db.prepare(`
      INSERT INTO automation_map (case_id, tc_type, spec_file, grep_pattern, updated_at)
      VALUES (?, 'automation', ?, ?, datetime('now'))
      ON CONFLICT(case_id) DO UPDATE SET
        tc_type='automation', spec_file=excluded.spec_file,
        grep_pattern=excluded.grep_pattern, updated_at=excluded.updated_at
    `);
    let mapped = 0;
    const unmapped = [];
    db.exec("BEGIN");
    for (const id of caseIds) {
      let spec_file = "",
        grep = "";
      if (idx[id]) {
        spec_file = idx[id];
        grep = id;
      } // precise: exact file + grep by id
      else if (man[id] && man[id].spec_file) {
        spec_file = man[id].spec_file;
        grep = man[id].grep || "";
      } // fallback
      if (spec_file) {
        ensureCase(id);
        stmt.run(id, spec_file, grep);
        mapped++;
      } else unmapped.push(id);
    }
    db.exec("COMMIT");
    res.json({
      ok: true,
      mapped,
      unmapped,
      total: caseIds.length,
      indexSize: Object.keys(idx).length,
      manifestSize: Object.keys(man).length,
    });
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {}
    res.status(500).json({ error: e.message });
  }
});

// Launch Playwright UI mode on the HOST desktop (interactive). Fire-and-forget.
app.post("/api/ui", (req, res) => {
  try {
    const runRoot = automation.getConfig(BASE).resolved || BASE;
    const norm = (s) => {
      s = String(s || "").replace(/\\/g, "/");
      const i = s.toLowerCase().indexOf("playwright/");
      if (i >= 0) s = s.slice(i);
      return s.replace(/^\/+/, "");
    };
    const { spec_file, grep_pattern } = req.body || {};
    const cli = path.join(
      runRoot,
      "node_modules",
      "@playwright",
      "test",
      "cli.js",
    );
    const args = ["test", "--ui"];
    if (spec_file) args.push(norm(spec_file));
    if (grep_pattern) args.push("--grep", grep_pattern);
    let child, cmd;
    if (fs.existsSync(cli)) {
      cmd = "node cli.js " + args.join(" ");
      child = spawn(process.execPath, [cli, ...args], {
        cwd: runRoot,
        env: process.env,
        detached: true,
        stdio: "ignore",
      });
    } else {
      const q = (s) => '"' + String(s).replace(/"/g, '\\"') + '"';
      cmd =
        "npx playwright test --ui" +
        (spec_file ? " " + q(norm(spec_file)) : "") +
        (grep_pattern ? " --grep " + q(grep_pattern) : "");
      child = spawn(cmd, {
        cwd: runRoot,
        env: process.env,
        detached: true,
        stdio: "ignore",
        shell: true,
      });
    }
    child.unref();
    res.json({ ok: true, cmd });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── API: RUN TEST (Playwright) ──────────────────────────────────────────────
app.post("/api/run", (req, res) => {
  const {
    case_id,
    spec_file,
    grep_pattern,
    env = "dev",
    run_by = "user",
  } = req.body;
  if (!case_id) return res.status(400).json({ error: "case_id required" });
  if (!spec_file)
    return res
      .status(400)
      .json({ error: "spec_file required — set automation mapping first" });

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (obj) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  // Insert run record with status=running (ensure the case exists for the FK first)
  ensureCase(case_id);
  const runId = db
    .prepare(
      `INSERT INTO test_runs (case_id, env, status, output, run_by) VALUES (?, ?, 'running', '', ?) RETURNING id`,
    )
    .get(case_id, env, run_by).id;

  send({ type: "run_start", run_id: runId, case_id });

  const startMs = Date.now();
  let output = "";

  // Run inside the automation repo (AUTOMATION_ROOT); spec_file is relative to it.
  // spec_file may be a single .spec file (one feature) or a directory (whole TSV/domain).
  const runRoot = automation.getConfig(BASE).resolved || BASE;
  // Forgiving spec path: strip any repo prefix so it resolves under runRoot.
  const normSpec = (s) => {
    s = String(s || "").replace(/\\/g, "/");
    const i = s.toLowerCase().indexOf("playwright/");
    if (i >= 0) s = s.slice(i);
    return s.replace(/^\/+/, "");
  };
  // RELATIVE spec arg: Playwright's positional arg is a file-path filter (regex);
  // an absolute Windows path never matches → "No tests found". cwd is runRoot.
  const specArg = normSpec(spec_file);
  const project = process.env.PW_PROJECT || "chromium";
  const cli = path.join(
    runRoot,
    "node_modules",
    "@playwright",
    "test",
    "cli.js",
  );

  let pw;
  if (fs.existsSync(cli)) {
    // Preferred: local Playwright CLI via node + args array (shell:false) → no Windows
    // shell-quoting issues with spaces in paths/grep.
    const args = [
      cli,
      "test",
      specArg,
      "--reporter=line",
      "--project=" + project,
    ];
    if (grep_pattern) args.push("--grep", grep_pattern);
    pw = spawn(process.execPath, args, {
      cwd: runRoot,
      env: { ...process.env, TEST_ENV: env },
      shell: false,
    });
  } else {
    // Fallback: npx via shell (no local @playwright/test install)
    const q = (s) => '"' + String(s).replace(/"/g, '\\"') + '"';
    let cmd = `npx playwright test ${q(specArg)} --reporter=line --project=${project}`;
    if (grep_pattern) cmd += ` --grep ${q(grep_pattern)}`;
    pw = spawn(cmd, {
      cwd: runRoot,
      env: { ...process.env, TEST_ENV: env },
      shell: true,
    });
  }

  pw.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    output += text;
    send({ type: "output", text });
  });

  pw.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    output += text;
    send({ type: "output", text });
  });

  pw.on("close", (code) => {
    const duration = Date.now() - startMs;
    const status = code === 0 ? "pass" : "fail";
    db.prepare(
      "UPDATE test_runs SET status=?, output=?, duration_ms=? WHERE id=?",
    ).run(status, output.slice(0, 50000), duration, runId);
    send({ type: "run_end", status, duration_ms: duration, exit_code: code });
    res.end();
  });

  pw.on("error", (err) => {
    db.prepare("UPDATE test_runs SET status=?, output=? WHERE id=?").run(
      "error",
      err.message,
      runId,
    );
    send({ type: "run_end", status: "error", message: err.message });
    res.end();
  });

  req.on("close", () => {
    if (pw.exitCode === null) pw.kill();
  });
});

// ─── API: IMPORT (trigger re-scan) ───────────────────────────────────────────
app.post("/api/import", (_req, res) => {
  try {
    const { importAll } = require("./scripts/import.js");
    const counts = importAll(BASE, db);
    res.json({ ok: true, ...counts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── API: HEALTH ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  const tcCount = db.prepare("SELECT COUNT(*) as n FROM test_cases").get().n;
  res.json({ status: "ok", test_cases: tcCount, db: DB_PATH });
});

// ─── UTILS ───────────────────────────────────────────────────────────────────
function tryJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// ─── FILE WATCHER — auto re-import on TSV/MD change ─────────────────────────
function startWatcher() {
  const WATCH_DIRS = ["Test", "PRD", "BRD"]
    .map((d) => path.join(BASE, d))
    .filter(fs.existsSync);
  if (!WATCH_DIRS.length) return;

  // Debounce: collect rapid saves (e.g. editor writes) into one import call
  const pendingImports = new Set();
  let importTimer = null;

  function runAutoImport(triggerFiles) {
    try {
      const { importAll } = require("./scripts/import.js");
      const counts = importAll(BASE, db);
      const files = Array.from(triggerFiles || [])
        .map((f) => path.relative(BASE, f).replace(/\\/g, "/"))
        .sort();
      const preview =
        files.length <= 3
          ? files.join(", ")
          : `${files.slice(0, 3).join(", ")} +${files.length - 3} more`;
      console.log(
        `  ↺ auto-import  ${preview || "(batch)"}  → ${counts.test_cases} cases`,
      );
    } catch (e) {
      console.error(`  ⚠ auto-import error: ${e.message}`);
    }
  }

  function scheduleImport(filePath) {
    pendingImports.add(filePath);
    if (importTimer) clearTimeout(importTimer);
    importTimer = setTimeout(() => {
      const batch = new Set(pendingImports);
      pendingImports.clear();
      importTimer = null;
      runAutoImport(batch);
    }, 800); // wait 800ms after last write before importing
  }

  // Auto-mirror PRD .md → Google Docs (only if logged in; skip quietly otherwise)
  const PRD_DIR = path.join(BASE, mirror.SRC_DIR);
  const mirrorPend = new Map(); // relPath → timer
  function scheduleMirror(relPath) {
    if (mirrorPend.has(relPath)) clearTimeout(mirrorPend.get(relPath));
    mirrorPend.set(
      relPath,
      setTimeout(async () => {
        mirrorPend.delete(relPath);
        try {
          const r = await mirror.mirrorFile(BASE, relPath);
          if (r && !r.skipped)
            console.log(
              `  ☁ mirror  ${relPath}  → gdoc ${r.action || ""} ${r.docId || ""}`,
            );
        } catch (e) {
          if (e.status === 401) {
            /* not connected — skip */
          } else console.error(`  ⚠ mirror error (${relPath}): ${e.message}`);
        }
      }, 1200),
    );
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
      if (/\.(tsv|md)$/i.test(filename))
        scheduleImport(path.join(dir, filename));
      // mirror only markdown files living under the PRD source dir
      if (dir === PRD_DIR && mirror.isMirrorable(filename))
        scheduleMirror(String(filename).replace(/\\/g, "/"));
    });
  }

  console.log(
    `  Watching     : ${WATCH_DIRS.map((d) => path.relative(BASE, d)).join(", ")}\n`,
  );
}

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const tc = db.prepare("SELECT COUNT(*) as n FROM test_cases").get().n;
  console.log(`\n◈ QA Dashboard  →  http://localhost:${PORT}`);
  console.log(`  DB           : ${DB_PATH}`);
  console.log(`  Test cases   : ${tc}`);
  startWatcher();
});
