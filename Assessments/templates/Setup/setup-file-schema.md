# Setup File Schema Design

> **Purpose:** Desain logical file schema untuk dashboard setup yang mengatur Rule, Agent, dan Workflow Agent tanpa harus menyimpan OAuth/API key di dashboard.  
> **Scope:** point 1 — desain file schema `Setup/`  
> **Status:** Draft design, siap dipakai sebagai acuan implementasi dashboard.

---

## 1. Prinsip Desain

1. **Rule tetap source of truth metodologi**.
2. **Dashboard hanya mengedit config operasional**, bukan mengganti core rule seenaknya.
3. **Agent runner (Hermes / Claude Code)** membaca hasil setup dari file.
4. **OAuth / API key tidak wajib disimpan di dashboard**.
5. File setup harus cukup jelas untuk dibaca manusia **dan** di-compile ke runtime file untuk agent.

---

## 2. Logical Folder Schema

```text
Setup/
├── manifest.yaml
├── rules-config.yaml
├── agents.yaml
├── workflows.yaml
├── runtime.md
├── ui-preferences.json              # optional, UI-only
└── templates/                       # optional, preset/workflow snippets
    ├── full-lane.yaml
    ├── fast-lane.yaml
    └── default-agents.yaml
```

> **Catatan implementasi saat ini:** karena structure-rule repo belum membuka top-level folder `Setup/`, artefak desain dan contoh file disimpan dulu di `Assessments/templates/Setup/`. Jika nanti dashboard runtime benar-benar diaktifkan, lokasi `Setup/` bisa diformalisasi lewat perubahan rule terpisah.

---

## 3. File Responsibilities

| File | Function | Edited By | Read By |
|------|----------|-----------|---------|
| `manifest.yaml` | Registry file, versi schema, file aktif, mode aktif | Dashboard | Dashboard, Agent bootstrap |
| `rules-config.yaml` | Policy operasional yang diizinkan rule (artifact naming, freeze, gates, paths) | Dashboard Rule tab | Orchestrator / Agent bootstrap |
| `agents.yaml` | Definisi roster agent dan capability metadata | Dashboard Agent tab | Orchestrator / Agent bootstrap |
| `workflows.yaml` | Lane, urutan step, gate dependency, routing | Dashboard Workflow tab | Orchestrator |
| `runtime.md` | Human-readable compiled runtime summary untuk dibaca agent | Generated | Hermes / Claude Code |
| `ui-preferences.json` | State UI lokal (collapsed panel, selected tab, theme, draft filters) | Dashboard | Dashboard only |

---

## 4. Minimal Required Files

Untuk MVP dashboard setup, file minimum yang wajib ada:

```text
Setup/
├── manifest.yaml
├── rules-config.yaml
├── agents.yaml
├── workflows.yaml
└── runtime.md
```

`ui-preferences.json` dan `templates/` boleh ditambahkan belakangan.

---

## 5. Contract per File

### 5.1 `manifest.yaml`
Wajib menyimpan:
- schema version
- active workflow mode
- active file references
- updated timestamps
- optional validation status

### 5.2 `rules-config.yaml`
Wajib menyimpan:
- artifact logical names
- persisted path conventions
- reviewer gate schema references
- freeze policy
- allowed workflow modes
- template references

### 5.3 `agents.yaml`
Wajib menyimpan:
- agent id
- role name
- purpose
- artifact ownership
- preferred toolset / capability labels
- whether the role may spawn/delegate
- handoff expectations

### 5.4 `workflows.yaml`
Wajib menyimpan:
- lane definitions (`full_lane`, `fast_lane`)
- ordered role sequence
- gate points
- freeze insertion point
- task routing rules
- fallback behavior

### 5.5 `runtime.md`
Wajib menyimpan versi compile dari config aktif:
- active mode
- active roster
- gate schema
- freeze policy
- route summary
- execution notes untuk agent

---

## 6. Read Flow for Agent

```text
CLAUDE.md / Rules/agent-instruction.md
    ↓
Setup/runtime.md
    ↓
Setup/manifest.yaml
    ↓
Setup/rules-config.yaml + Setup/agents.yaml + Setup/workflows.yaml
    ↓
Agent executes according to active setup
```

---

## 7. Separation of Concerns

### Rule Layer
Menjawab:
- apa yang canonical
- apa yang wajib
- apa yang tidak boleh di-override dashboard

### Setup Layer
Menjawab:
- agent mana aktif
- workflow mana aktif
- urutan role untuk mode tertentu
- lane mana default

### Runtime Layer
Menjawab:
- pada saat eksekusi ini, agent harus mengikuti setup apa

---

## 8. Validation Rules for Dashboard

Dashboard sebaiknya menolak save jika:
- `full_lane` tidak punya reviewer gate B
- freeze policy dimatikan untuk flow yang butuh implementation gate
- ada role di workflow yang tidak ada di `agents.yaml`
- ada duplicate `agent_id`
- ada route yang mengarah ke mode yang tidak dideklarasikan
- ada attempt untuk override canonical rule yang seharusnya readonly

---

## 9. Recommended Evolution

### Phase 1
- simpan config files
- compile ke `runtime.md`
- agent baca file secara pasif

### Phase 2
- dashboard bisa trigger Hermes lokal
- dashboard bisa preview route execution

### Phase 3
- dashboard monitor run status / handoff / artifact links

---

## 10. Companion Example Files

Contoh file schema untuk desain ini tersedia di folder yang sama:
- `setup-manifest.example.yaml`
- `rules-config.example.yaml`
- `agents.example.yaml`
- `workflows.example.yaml`
- `runtime.example.md`
