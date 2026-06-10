# QA Tooling Context

> Dokumen ini mencatat state terkini dari QA Browser tool dan QA Agent infrastructure.
> Update setiap kali ada perubahan signifikan pada `testcase-browser.html` atau `server.js`.

---

## QA Browser (`Test/testcase-browser.html`)

Single-file browser tool untuk QA SatuInbox. Berjalan via VS Code Live Server (port 5500) di Chrome.

### Stack
- React 18 (production UMD, Babel standalone untuk JSX runtime)
- `marked@9` — markdown rendering
- `turndown@7` + `turndown-plugin-gfm@1` — HTML→markdown conversion (edit mode)
- IBM Plex Mono font
- File System Access API (Chrome-only) — read/write TSV, JSON, MD files
- IndexedDB — persist: last directory handle, last open file, theme preference

### Fitur Aktif

| Fitur | Status | Catatan |
|---|---|---|
| Sidebar file browser | ✅ | BRD / PRD / Test sections, folder tree, search |
| Theme picker | ✅ | 6 tema (Navy, Slate, Charcoal, Zinc, Night, SlateLight) |
| Markdown Viewer (PRD/BRD) | ✅ | Rendered, centered max-width 860px |
| Markdown Edit mode | ✅ | WYSIWYG contentEditable, Turndown save, scroll preserved |
| Test Case Editor (TSV) | ✅ | Card editor, pagination 30 TC/page, infinite scroll |
| Execution tracking | ✅ | JSON sidecar file, per-env status (DEV/Staging/Prod) |
| Auto-resize textarea | ✅ | Scenario, Pre-condition, Description, Steps, Expected, Actual |
| Live Server reload block | ✅ | WebSocket onmessage intercept + Location.prototype.reload override |
| AI Agent panel | ✅ | Slide-in panel kanan, butuh server.js running |

### File Output Structure
```
Test/
  *.tsv           — test case definitions (TSV format SatuInbox v2)
  *.exec.json     — execution results per version
Chat/             — chat history per session (JSON)
AgentNotes/       — analysis output dari QA Agent
```

---

## QA Agent Server (`server.js`)

Node.js Express server sebagai backend AI agent.

### Setup
```bash
# 1. Install dependencies (sekali saja)
cd PRDanalisis && npm install

# 2. Buat .env dari .env.example, isi API key
cp .env.example .env

# 3. Jalankan server
node server.js          # production
node --watch server.js  # dev mode (auto-restart)
```

### Environment Variables (`.env`)
| Key | Wajib | Keterangan |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `PORT` | ❌ | Default: 3001 |
| `AUTOMATION_ROOT` | ❌ | Path ke Playwright project. Kosong = automation disabled |

### Endpoints
| Endpoint | Method | Fungsi |
|---|---|---|
| `/health` | GET | Cek status server + API key |
| `/chat` | POST | SSE stream — agentic loop dengan tool use |
| `/sessions` | GET | List chat history sessions dari `Chat/` |

### Agent Tools
| Tool | Fungsi |
|---|---|
| `read_file` | Baca file dari workspace (PRD, BRD, TSV, JSON, MD) |
| `list_files` | List isi folder: BRD, PRD, Test, Rules, Memory, dst |
| `search_in_file` | Cari keyword di file, return matching lines + nomor baris |
| `write_note` | Simpan hasil analisa ke `AgentNotes/` folder |
| `run_automation` | Jalankan Playwright test — butuh `AUTOMATION_ROOT` di .env |

### SSE Event Format (dari `/chat`)
```
{ type: 'text',        content: '...' }           — streaming text
{ type: 'tool_call',   tool: '...', input: {...} } — agent memanggil tool
{ type: 'tool_result', tool: '...', preview: '...' } — hasil tool (preview 300 char)
{ type: 'error',       message: '...' }             — error
{ type: 'done' }                                    — selesai
```

### Context Injection
Setiap request ke `/chat` menyertakan `context` dari file aktif di browser:
- `filename`, `path`, `sectionId`, `type`
- `content`: 3000 char pertama (MD) atau 15 TC ID+scenario (TSV card)

---

## AgentPanel (UI Component di HTML)

- Toggle: tombol **◈ Agent** di header toolbar
- Width: 400px, fixed kanan, overlay main content
- Status indicator: `● online` / `● offline` (hit `/health` on mount)
- Context badge: menampilkan file yang sedang dibuka
- Tool call display: transparent — user bisa lihat agent baca file apa
- Quick prompt suggestions saat messages kosong
- Chat history: disimpan per sessionId ke `Chat/` via server

---

## Roadmap / Pending

- [ ] Wire `AUTOMATION_ROOT` ke Playwright project yang sudah ada
- [ ] Tambah tool: `update_test_status(tc_id, env, status, actual)` — update TSV/JSON langsung dari agent
- [ ] Tambah tool: `list_test_cases(file)` — structured TC list untuk agent
- [ ] Session history panel (load previous sessions)
- [ ] Keyboard shortcut untuk toggle agent panel (Cmd/Ctrl+.)
