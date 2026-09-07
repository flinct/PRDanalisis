# SatuInbox OpenProject Adapter (Tracker / Release Integration)

**Purpose:** SatuInbox-specific tracker conventions for release notes and UAT generation. Loaded only when the task pulls data from OpenProject or produces release notes/UAT.

> Tracker specifics live here. The universal rules (audience variants, never invent results, count verification, traceability) live in the release core rule.

---

## Tracker Identity

- Tracker: OpenProject, project id `7`, identifier `satuinbox`
- Work package URL: `https://project.ordo.co.id/wp/{id}`
- Access via `mcp__mcp_project__*` tools (see `openproject-mcp` skill for filter syntax)

## Shipped Criteria

- **Shipped** = status `Closed` or `Tested`.
- All other statuses (`New`, `In testing`, `Test failed`, `In progress`) = **not shipped**.

---

## Release Notes — Data Workflow

### Resolve Version

1. `list_versions(projectId='satuinbox', pageSize=100)`.
2. Match version name to user input (e.g. `v2.8.0` → `prod-2.8.0` → id `62`).
3. Version not found → stop and ask.

### Fetch Work Packages

1. `list_work_packages(projectId='satuinbox', filters='[{"version":{"operator":"=","values":["<version_id>"]}}]', pageSize=100, sortBy='[["id","asc"]]')`.
2. Paginate until all WPs fetched.
3. Per WP extract: `id`, `subject`, `type`, `status`, `priority`, `percentageDone`, `description` (one-line summary).
4. Empty description → `no description detail`.
5. **Do not dump raw description** into context — extract one line.
6. WP count > 50 → consider delegating extraction to a subagent.

### Classification

| Kategori | Rule | Masuk release notes? |
|---|---|---|
| Feature / User story | Fitur baru, improvement | ✅ |
| Bug | Bug fix | ✅ |
| Infra / Task (product-related) | Deployment, optimasi, research teknis berdampak sistem | ✅ (tech only) |
| Meeting / admin / checklist | Meeting, grooming, timesheet, presentation, future discussion | ❌ exclude |
| Not shipped | Status ≠ Closed/Tested | ⏳ section terpisah |

### Output Files (default 3, tanpa tanya)

1. `v<X.Y.Z>-tech.md` — teknis (markdown table)
2. `v<X.Y.Z>-user.md` — user-facing (Bahasa Indonesia awam)
3. `v<X.Y.Z>-gdoc.md` — format Google Docs (sama dengan tech, struktur beda)

Flat di `Release notes/`, tanpa subfolder per version. **Acuan format = `v2.8.0-*.md`** (bukan file `ver 2-x-0.md` lama — itu format legacy pre-standar).

### Tech Format (`-tech.md`) — struktur wajib

Header (semua varian):
1. `# Release Notes v<X.Y.Z> — Technical` (multi-version: `v2.7.0 (termasuk v2.7.0.2 & v2.7.0.3)`).
2. `**Product:** SatuInbox · **OpenProject version id(s):** ... · **Source:** ...`
3. `**Scope:**` — status yang masuk (`Closed`/`Tested`), sebut item not-shipped/meeting dikeluarkan.
4. Mermaid `pie title WP ... by type (shipped only)` — hitung Feature / Bug fix / Infra (shipped only).

**Varian A — single version** (acuan `v2.8.0-tech.md`): langsung section-per-kategori.
- `## Features` — table `WP | Judul | Detail teknis`.
- `## Bug Fixes` — table `WP | Judul | Root cause / fix`.
- `## Infra / Internal` — bullet (deployment, env var, research).
- `## Not shipped (excluded, status ≠ Closed/Tested)` — table `WP | Judul | Status`.
- `## Excluded from this doc (meetings/admin, no product content)` — daftar WP id inline.

**Varian B — multi-version gabungan** (acuan `v2.7.0-tech.md`): section-per-version.
- Setelah pie kombinasi, satu `## v<X.Y.Z>` per version (`## v2.7.0`, `## v2.7.0.2 — Hotfix Performance`, …).
- Tiap version berisi sub-section `### Features` / `### Bug Fixes` / `### Infra` seperlunya (table sama).
- `## Not shipped` dan `## Excluded from this doc` sekali di akhir untuk seluruh gabungan.
- Pakai varian ini kalau menggabung ≥2 version dalam satu file.

### User Format (`-user.md`) — struktur wajib

1. `## ✨ Fitur Baru` — bullet awam per fitur shipped.
2. `## 🐞 Perbaikan Bug` — bullet awam per bug shipped.
3. `## ⏳ Belum Rilis (masih dalam proses, tidak masuk versi ini)` — bullet not-shipped.
4. Footer: pointer ke `-tech.md`.

### Google Docs Format (`-gdoc.md`)

Template ref: `1YxEANfHOf66w4YUsJFwqJmf-_mjgjIclzH5LnvGcSNU`.

Struktur:
1. Header (Version, Date, Server Environment, Release Tag)
2. Highlights (paragraf ringkas)
3. New Features (`[#WPID]` + deskripsi 2-3 kalimat)
4. User Stories / Improvements (jika ada)
5. Bug Fixes (per domain, `[#WPID]` + deskripsi)
6. Rollback Plan
7. Additional Notes (env vars, infra, deployment)

Multi-version: gabung satu file, hotfix dipisah section sendiri, bug fixes per domain dengan tag version `(v2.7.0.2)`.

### Classification Heuristics

| Subject mengandung | Kategori |
|---|---|
| "meeting", "grooming", "presentation", "timesheet", "checklist", "discussion future" | Admin → exclude |
| "Research", "Optimization" (tanpa implementasi) | Infra/internal |
| "Deployment", "env var" | Infra/internal |
| "merge data-cy", "merge data cy" | Infra/internal |
| "add widget", "integrate" | Feature |
| "improvement", "add", "create" + type=Feature | Feature |
| "fix", "error", "bug", "not appear", "can't", "unable", "not sync", "overflow" | Bug |
| "alert notification", "google chat" (infra) | Infra/internal |
| "Monitoring", "Release notes" | Admin → exclude |

Ambigu → default Bug jika ada "fix/error/bug", selain itu Feature.

---

## UAT — Template & Owner Metadata

### Owner metadata

- PM: `Dany Christian`
- QA: `Dany Christian`
- TechLead: `Naftal Yunior`

### Source priority

1. Template UAT resmi tim yang dilampirkan user
2. OpenProject version scope
3. Penjelasan user untuk mapping kolom
4. Rule QA/test case existing

Konflik format → ikuti template UAT resmi tim.

### Template structure (5 kolom, urutan persis)

1. `Feature` — subject work package
2. `Description` — ringkasan deskripsi ticket (paragraph pertama / fallback `<Type>: <Subject>`)
3. `Enhancement` — ringkasan perubahan (bukan Yes/No)
4. `Evidence` — link penuh `https://project.ordo.co.id/wp/{id}`
5. `Test Results` — kosong saat authoring, diisi saat eksekusi

Jangan tambah kolom lain kecuali user minta.

### Scope selection

- Include: `Feature`, `Bug`, `User story`
- Exclude: `Task` koordinasi internal, deploy/release operational, audit, meeting, monitoring/support-only

### Output

- Template `.xlsx` → output utama `.xlsx`, CSV sebagai export tambahan.
- Simpan per version: `Assessments/openproject/prod-<version>/`
- Nama: `prod-<version>-uat.xlsx` / `prod-<version>-uat.csv`

### Non-negotiable

- Jangan invent hasil test execution.
- Jangan isi `Pass/Fail` jika UAT belum dijalankan.
- Jangan hilangkan traceability ke work package OpenProject.
- Jangan ubah header tabel tanpa instruksi user.
