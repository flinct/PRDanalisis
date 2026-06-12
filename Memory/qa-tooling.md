# QA Tooling Context

> Dokumen ini mencatat state terkini dari QA Browser tool dan QA Agent infrastructure.
> Update setiap kali ada perubahan signifikan pada `testcase-browser.html` atau `server.js`.
> **Last code review:** 2026-06-12 — full read of testcase-browser.html (2195 lines) + server.js (369 lines)

---

## QA Browser (`Test/testcase-browser.html`)

Single-file browser tool (2195 lines React 18 + Babel standalone) untuk QA SatuInbox. Berjalan via `server.js` (Express, port 3001).

### Stack
- React 18 (UMD production + Babel standalone untuk JSX)
- `marked@9` — markdown rendering
- `turndown@7` + `turndown-plugin-gfm@1` — WYSIWYG HTML→markdown (edit mode)
- IBM Plex Mono font
- 6 themes (Navy, Slate, Charcoal, Zinc, Night, SlateLight)
- IndexedDB (theme preference persistence)
- **API-driven** — semua file I/O via server.js REST API, bukan File System Access API langsung

### Mode Operasi

| Mode | Keterangan |
|---|---|
| **Server mode** (primary) | `server.js` serves HTML via `express.static('Test')`, semua file I/O via API endpoint |
| **Legacy File System Access** | Masih support `fileHandle` sebagai fallback (untuk development offline tanpa server) |

### Fitur Aktif

| Fitur | Status | Detail |
|---|---|---|
| Sidebar file tree | ✅ | 3 sections: BRD, PRD, Test. Server serves tree via `/api/files` |
| Theme picker | ✅ | 6 tema, persist ke IndexedDB |
| **Markdown Viewer** | ✅ | Rendered HTML, copy as rich text, max-width 860px |
| **Markdown Editor** | ✅ | contentEditable WYSIWYG, Turndown save via `/api/files/content` PUT |
| **Version Management** | ✅ | Multi-version (v1, v2, + custom). Stash unsaved work per version. Switch version tanpa lose data. |
| **Test Case Editor** | ✅ | Card layout, expand/collapse per TC, full field editing |
| **Execution Tracking** | ✅ | Per-env status (DEV/Staging/Prod) di level overall + per expected row, `.exec.json` sidecar file via API |
| **History Panel** | ✅ | Per-TC execution history: diff display (old→new), event type (update/reset), timestamp, reason |
| **Reset Modal** | ✅ | Reset Actual/Status/Notes dengan reason tracking, old state disimpan ke history |
| **Automation Mapping** | ✅ | Per TC: tc_type (manual/automation/special), spec_file, grep_pattern. Save via `/api/testcases/:id/map` |
| **Run Panel** | ✅ | Jalankan Playwright test dari browser via SSE `/api/run`, output streaming real-time, stop button |
| **Infinite Scroll** | ✅ | 30 TC/page, IntersectionObserver auto-load next batch |
| **Filter & Search** | ✅ | Search ID/scenario, filter by status (Passed/Failed/Need to Test/On Test), filter by env (DEV/Staging/Prod) |
| **Stats Bar** | ✅ | Passed/Failed/On Test/Need to Test counters per environment |
| **Import TSV/MD** | ✅ | `/api/import` — scan workspace & reindex semua TSV/MD ke SQLite |
| **TSV Copy** | ✅ | Copy full TSV ke clipboard untuk paste manual |
| **Resizable Sidebar** | ✅ | Drag handle, min 160px max 480px |
| **Sticky Folder Selectors** | ✅ | Saat satu section dibuka, header section aktif pin di atas, file list scroll di tengah, header section lain (non-aktif) sticky di bawah sidebar untuk switch folder cepat. Tanpa section aktif → semua header stack normal. (App sidebar render, ~line 2119) |
| **Google Docs Integration** | ✅ | **OAuth login** (akun user, bukan service account). Sidebar section "Google Docs ☁" (virtual, merge ke allSections) baca doc → read-only markdown. Tombol "⇪ Export to GDocs" di MarkdownViewer → buat Doc baru (basic styled). Backend: `scripts/google-auth.js` (OAuth2) + `scripts/gdocs.js` + endpoint `/api/google/*`, `/api/gdocs*`. Setup di `GDOCS-SETUP.md`. |
| **PRD Mirror → Google Docs** | ✅ | One-way: semua `PRD/*.md` di-push jadi Google Doc (basic styled: heading/bold/bullet/link). Auto-update via file watcher saat .md berubah/baru (debounce 1.2s, skip kalau belum login). Manual: `/api/mirror` (POST) / tombol di Settings. Engine: `scripts/mirror.js`, peta path→docId di `.gdocs-mirror.json`. |
| **Settings Page (⚙)** | ✅ | Top-bar gear → `view==='settings'`. 3 section: (1) Google login/logout + status + mirror-all, (2) Theme picker, (3) Manual import. Komponen `SettingsPage`. |
| **Live Server reload block** | ✅ | Block WebSocket livereload + override location.reload |

### Fitur yang SUDAH TIDAK ADA (removed/deprecated)

| Fitur | Status |
|---|---|
| AI Agent panel (slide-in kanan) | ❌ Removed — tidak ada di code 2026-06-12 |
| Claude-powered agent via SSE | ❌ Removed — tidak ada di code 2026-06-12 |
| AgentTools (read_file, list_files, search_in_file, write_note, run_automation) | ❌ Removed — tidak ada di code 2026-06-12 |

### Arsitektur Frontend (React Component Tree)

```
<App>
├── Top bar: "◈ QA Browser" + Import button + ThemeSwitcher
├── Body
│   ├── Sidebar (resizable, 256px default)
│   │   ├── Search input
│   │   └── SidebarSection × 3 (BRD / PRD / Test)
│   │       └── FileNode (recursive: dir + file nodes)
│   ├── Resize handle
│   └── Content area
│       ├── Breadcrumb
│       ├── CardEditor (TSV — test case cards)
│       │   ├── Toolbar (search, filter, env buttons, version picker)
│       │   ├── Stats bar (counters per status)
│       │   ├── Table header
│       │   ├── TC rows (30/page, expandable)
│       │   │   ├── Row header (ID, scenario, type badge, status select, updated, ▶ run button)
│       │   │   └── Expanded card:
│       │   │       ├── Definition section (fields, steps, expected results)
│       │   │       ├── Execution section (overall status, notes)
│       │   │       ├── AutomapRow (automation mapping)
│       │   │       ├── HistoryPanel (diff display, changelog)
│       │   │       └── Action buttons (Reset, Delete)
│       │   └── Load more sentinel (IntersectionObserver)
│       ├── MarkdownViewer (MD — PRD/BRD)
│       │   ├── Toolbar (Copy, Edit/Save/Cancel)
│       │   └── Body (contentEditable div, rendered markdown)
│       └── FlatViewer (CSV/TXT fallback)
└── RunPanel (overlay — Playwright output streaming)
```

### File Output Structure
```
Test/
├── testcase-browser.html      ← QA Browser (single-file app)
├── testcase-browser2.html      ← alternate version
├── testcase-manager.html       ← alternate version
├── .tcdata/                     ← execution data (auto-generated)
│   └── <domain>/<file>.execution.json
├── <domain>/<Feature>.tsv     ← test case definitions
├── <domain>/*.exec.json       ← execution results per version
├── <domain>/*-qa-test-spec.md
└── <domain>/*-automation-mapping.md
```

### File Parser Logic
- Card format detection: jika 1-30 baris pertama mengandung `Test ID` → parse as card blocks
- Flat format fallback: tab-separated rows with headers
- Supports: TSV (tab), CSV (comma)
- Execution merged from `.exec.json` sidecar file

### Version System
```
Schema: { schemaVersion, sourceFile, sourceFileName, createdAt, updatedAt, activeVersion, versions }
versions: { "v1": { createdAt, updatedAt, cases: { [tcId]: { testcaseId, current: {...}, history: [...] } } } }
```
- History entries: { eventId, action: "update"|"reset", at: ISO, reason?, snapshot: full TC state }
- Diff engine: compares all fields (testType, tester, scenario, steps, expected, notes, overallStatus, results)
- Version stash: unsaved work stored in-memory stashRef, auto-restored on version switch

---

## QA Server (`server.js`)

Node.js Express server (369 lines) sebagai backend QA Browser.

### Stack
- Express + cors
- `node:sqlite` (DatabaseSync) — SQLite WAL mode, 4 tables
- `node:child_process` (spawn) — Playwright execution
- `node:fs`, `node:path` — file serving

### Database (SQLite — `qa.db`)

| Table | Columns | Purpose |
|---|---|---|
| `test_cases` | id (PK), file_path, module, scenario, description, url, precondition, test_type, steps (JSON), expected (JSON), status_dev/staging/prod, created_at, updated_at | Indexed test cases from TSV |
| `automation_map` | case_id (PK FK), tc_type, spec_file, grep_pattern, notes, updated_at | Automation mapping per TC |
| `test_runs` | id (PK auto), case_id (FK), env, status, output, duration_ms, run_by, ran_at | Run history per TC |
| `prd_files` | id (PK auto), path (UNIQUE), title, module, type, last_scanned | Indexed PRD documents |

### Endpoints

| Endpoint | Method | Function |
|---|---|---|
| `/` | GET | Serves `Test/testcase-browser.html` |
| `/api/files` | GET | Tree structure: `[{id, label, color, folderName, tree: [{kind, name, path, ext, children}]}]` |
| `/api/files/content?path=` | GET | Read file content (any type) |
| `/api/files/content?path=` | PUT | Write file content (body: `{content: "..."}`) |
| `/api/testcases?limit=` | GET | List indexed test cases with automation map |
| `/api/testcases/:id/map` | PUT | Upsert automation mapping for TC |
| `/api/import` | POST | Re-scan workspace & reindex all TSV/MD into SQLite |
| `/api/run` | POST | Spawn `npx playwright test` with SSE streaming output |
| `/api/google/status` | GET | `{oauthConfigured, connected, email, folderName}` |
| `/api/google/login` | GET | Redirect ke Google consent |
| `/oauth2callback` | GET | Tukar code → simpan `google-token.json` |
| `/api/google/logout` | POST | Hapus token |
| `/api/mirror` | POST | Mirror semua `PRD/*.md` → Docs |
| `/api/gdocs` | GET/POST | Tree dokumen / create doc `{title, content}` |
| `/api/gdocs/:id` | GET/PUT | Read doc → `{id,title,markdown}` / update `{content, mode}` |
| `/health` | GET | Simple health check |

> Google via **OAuth** (`scripts/google-auth.js` + `scripts/gdocs.js`, dep `googleapis`). Kredensial: `oauth-credentials.json` atau `GOOGLE_OAUTH_CLIENT_ID/SECRET`. Token: `google-token.json`. Mirror engine: `scripts/mirror.js`. Setup lengkap: `GDOCS-SETUP.md`.

### Walk Directory Logic
```
SKIP = ['node_modules', '.git', 'Chat', 'AgentNotes', 'Memory', 'Rules']
Sections = { BRD: 'BRD/', PRD: 'PRD/', Test: 'Test/' }
Supported extensions: .tsv, .csv, .md, .txt
```

### Run Endpoint (Playwright)
```
Body: { case_id, spec_file, grep_pattern }
Response: SSE stream
  event types: { output: text_chunks }, { run_end: { status: 'pass'|'fail', duration_ms } }
Workspace: AUTOMATION_ROOT env var (path to sixV2Automation)
Abort: SSE connection close trigger abort via AbortController
```

### Environment Variables (`.env`)
| Key | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ❌ (tidak dipakai di versi saat ini) | Claude API key |
| `PORT` | ❌ | Default: 3001 |
| `DB_PATH` | ❌ | Default: `qa.db` di root PRDanalisis |
| `AUTOMATION_ROOT` | ❌ | Path ke Playwright project. Kosong = `/api/run` return error |

### What server.js does NOT have (compared to old qa-tooling.md):
- ❌ Claude/Anthropic SDK integration
- ❌ `/chat` SSE agentic loop endpoint
- ❌ `/sessions` endpoint
- ❌ Agent tools (read_file, list_files, search_in_file, write_note)
- ❌ `Chat/` folder auto-save
- ❌ `AgentNotes/` folder auto-save

---

## Notes for Future
- `testcase-browser.html` sekarang pure QA manual tool + bridge ke Playwright. Tidak ada AI agent integration.
- Import TSV/MD ke SQLite sudah berfungsi — memungkinkan query test cases lintas file di masa depan.
- `AUTOMATION_ROOT` env var perlu di-set untuk enable run Playwright dari browser.
- notes.md berisi wishlist user: versioning, updateAt, reset all fields — sebagian besar sudah diimplementasi.
