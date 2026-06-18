# Dashboard Menu Structure — Rule / Agent / Workflow Agent

> **Purpose:** Struktur dashboard settings untuk mengelola setup multi-agent tanpa harus menyimpan OAuth/API key langsung di dashboard.  
> **Scope:** point 3 — struktur dashboard menu Rule / Agent / Workflow Agent.

---

## 1. Top-Level Navigation

```text
Settings Dashboard
├── Rule
├── Agent
└── Workflow Agent
```

> Optional later tabs:
> - Runtime Preview
> - Validation Log
> - Execution History
> - Integrations

---

## 2. Tab: Rule

### Tujuan
Menampilkan dan mengatur **policy operasional** yang boleh diubah, sambil menjaga core rule tetap readonly.

### Subsections
#### 2.1 Canonical References
- source of truth files
- template references
- current rule profile

#### 2.2 Artifact Rules
- logical artifact names
- persisted filename suffixes
- owner default per artifact
- artifact path conventions

#### 2.3 Reviewer Gates
- Gate A status list
- Gate B status list
- Gate C status list
- readonly badge kalau canonical

#### 2.4 Freeze Policy
- enabled / disabled
- trigger gate
- action on post-freeze requirement change

#### 2.5 QA Policy
- QA pre/post split
- companion artifact policy
- automation mapping requirement

### Write Target
- `rules-config.yaml`

### Validation
- tidak boleh menghapus Gate B jika workflow full lane aktif
- tidak boleh mematikan freeze kalau mode implementation lane membutuhkannya
- tidak boleh ubah policy readonly tanpa mode admin/patch rule resmi

---

## 3. Tab: Agent

### Tujuan
Mengatur roster agent, role metadata, ownership, dan capability labels.

### Layout
```text
Left pane: Agent list
Right pane: Agent detail editor
Bottom bar: Save / Duplicate / Disable / Validate
```

### List View
- agent label
- agent id
- role type
- status (active / disabled)
- owns artifact(s)

### Detail Editor Fields
- agent id
- display label
- role type
- purpose
- owns artifacts
- preferred capabilities
- can delegate
- can approve gate
- notes / handoff expectation

### Suggested Roles
- Orchestrator
- Analyst
- PRD Writer
- QA Agent
- Reviewer
- Coder Automation

### Write Target
- `agents.yaml`

### Validation
- `agent_id` harus unik
- hanya role reviewer yang boleh `can_approve_gate=true`
- artifact owner tidak boleh ambiguous untuk Assessment Report
- minimal harus ada orchestrator + reviewer + satu implementer/analyst path

---

## 4. Tab: Workflow Agent

### Tujuan
Mengatur orchestration flow antar agent, lane selection, gates, freeze point, dan task routing.

### Subsections
#### 4.1 Workflow Modes
- Full Lane
- Fast Lane
- active default selector

#### 4.2 Lane Builder
Untuk tiap mode:
- ordered step sequence
- gate insertion points
- freeze point
- required input roles

#### 4.3 Gate Mapping
- siapa reviewer-nya
- input roles per gate
- expected outputs sebelum gate

#### 4.4 Task Routing
- task type → workflow mode
- fallback mode
- fallback role jika agent hilang

#### 4.5 Freeze Behavior
- enabled
- starts after which step
- route on post-freeze change

#### 4.6 Runtime Preview
Preview human-readable flow sebelum di-compile ke `runtime.md`.

### Write Target
- `workflows.yaml`

### Validation
- full lane wajib punya Gate A, Gate B, Gate C
- full lane wajib punya freeze setelah Gate B
- role di step sequence harus ada di `agents.yaml`
- route target mode harus valid
- workflow tidak boleh punya step yatim (unknown role / unknown gate)

---

## 5. File Mapping per Menu

| Menu | Main Output File |
|------|------------------|
| Rule | `rules-config.yaml` |
| Agent | `agents.yaml` |
| Workflow Agent | `workflows.yaml` |
| Publish / Compile (future) | `runtime.md` |
| UI-only state | `ui-preferences.json` |

---

## 6. Recommended Action Buttons

### Global Actions
- `Validate Setup`
- `Save Draft`
- `Generate Runtime Preview`
- `Export Config`

### Future Actions
- `Publish runtime.md`
- `Run with Hermes`
- `Open validation report`

---

## 7. Suggested User Flow

```text
1. User buka Rule tab → cek policy aktif
2. User buka Agent tab → atur roster agent
3. User buka Workflow Agent tab → atur lane, gate, freeze, routing
4. Dashboard validate cross-file consistency
5. Dashboard generate runtime preview
6. (Future) Dashboard publish runtime.md untuk dibaca agent
```

---

## 8. Important Non-Goals

Dashboard ini **bukan** tempat utama untuk:
- menyimpan provider API key
- menyimpan OAuth token agent
- override canonical rule secara liar
- menjalankan agent tanpa validation layer

Dashboard ini adalah:
- config editor
- orchestration control panel
- setup publisher

---

## 9. Implementation Notes

- Gunakan YAML untuk file config utama agar mudah dibaca manusia
- Gunakan markdown (`runtime.md`) untuk file yang dibaca langsung agent
- Pisahkan config machine-readable vs summary human-readable
- Jangan campur preference UI ke file rule/agent/workflow
