> ⚠️ **SUPERSEDED** — canonical rule sekarang di `integrations/satuinbox-openproject-adapter.md`.
> File ini dipertahankan sebagai detail reference (metodologi/checklist lama) selama transisi;
> jangan pakai sebagai entry point untuk pekerjaan baru. Peta lengkap: `Rules/MIGRATION.md`.
> Isi di bawah TIDAK dihapus untuk menghindari silent degradation pada referensi lama.

# Release Notes Rules

**Purpose:** Define how to generate release notes from OpenProject version data. Output selalu dua versi: technical (untuk dev/ops) dan user-facing (untuk PM/stakeholder).

---

## When To Use

Use this rule when the user asks to:

- buat release notes
- buat changelog
- tulis release notes
- generate release notes versi X
- buat summary rilis
- create release notes

---

## Required Source Inputs

Before writing release notes, load these inputs in order:

1. OpenProject SatuInbox project data (via `mcp__mcp_project__*` tools — lihat `openproject-mcp` skill untuk filter syntax yang benar)
2. `Memory/global-memory.md`
3. Existing release notes di `Release notes/` untuk referensi format sebelumnya (jika ada)

---

## Workflow

### Step 1 — Resolve Version

1. Jalankan `list_versions(projectId='satuinbox', pageSize=100)` untuk dapatkan version ID.
2. Match nama version dengan input user (e.g. "v2.8.0" → `prod-2.8.0` → id `62`).
3. Kalau version tidak ketemu, stop dan tanya user.

### Step 2 — Fetch Work Packages

1. Jalankan `list_work_packages(projectId='satuinbox', filters='[{"version":{"operator":"=","values":["<version_id>"]}}]', pageSize=100, sortBy='[["id","asc"]]')`.
2. Kalau `total > pageSize`, paginate sampai semua WP terambil.
3. Untuk setiap WP, ekstrak: `id`, `subject`, `type`, `status`, `priority`, `percentageDone`, `description` (one-line summary).
4. WP dengan deskripsi kosong → tulis "no description detail".
5. **Jangan dump raw deskripsi** ke context — deskripsi bisa ratusan KB per WP. Ekstrak summary satu baris saja.
6. Kalau WP count > 50, pertimbangkan delegate ke subagent untuk extract (lihat `openproject-mcp` skill pattern).

### Step 3 — Classify

Bagi WP menjadi kategori:

| Kategori | Rule | Masuk release notes? |
|---|---|---|
| Feature / User story | Fitur baru, improvement | ✅ |
| Bug | Bug fix | ✅ |
| Infra / Task (product-related) | Deployment, optimasi, research teknis yang berdampak ke sistem | ✅ (tech version only) |
| Meeting / admin / checklist | Product meeting, grooming, timesheet input, presentation, future discussion | ❌ exclude dari keduanya |
| Not shipped | Status ≠ Closed dan ≠ Tested (New, In testing, Test failed, In progress) | ⏳ section terpisah |

**Shipped** = status `Closed` atau `Tested`. Semua status lain = not shipped.

### Step 4 — Write Technical Version

File: `Release notes/v<X.Y.Z>-tech.md`

```markdown
# Release Notes v<X.Y.Z> — Technical

**Product:** SatuInbox · **OpenProject version id:** <id> · **Source:** OpenProject SatuInbox, version=prod-<X.Y.Z>
**Scope:** WP dengan status `Closed`/`Tested` di bawah version <X.Y.Z>. Item belum shipped dikeluarkan — lihat "Not shipped" di bawah.

```mermaid
pie title WP <X.Y.Z> by type (shipped only)
  "Bug fix" : <N>
  "Feature" : <N>
```

## Features

| WP | Judul | Detail teknis |
|---|---|---|
| #<id> | <subject> | <one-line technical summary> |

## Bug Fixes

| WP | Judul | Root cause / fix |
|---|---|---|
| #<id> | <subject> | <one-line root cause or fix description> |

## Infra / Internal (non user-facing, included for tech record)

- #<id> <subject> — <one-line summary>.

## Not shipped (excluded, status ≠ Closed/Tested)

| WP | Judul | Status |
|---|---|---|

## Excluded from this doc (meetings/admin, no product content)
#<id1>, #<id2>, ...
```

### Step 5 — Write User-Facing Version

File: `Release notes/v<X.Y.Z>-user.md`

```markdown
# Apa yang Baru di SatuInbox v<X.Y.Z>

## ✨ Fitur Baru

- **<Judul pendek>** — <Penjelasan manfaat dalam bahasa awam, tanpa jargon teknis, 1-2 kalimat>.

## 🐞 Perbaikan Bug

- <Penjelasan dampak fix dari sudut pandang user, 1 kalimat>.

## ⏳ Belum Rilis (masih dalam proses, tidak masuk versi ini)

- <Judul + status singkat> (jika ada not-shipped items yang relevan untuk user awareness)

---
*Untuk detail teknis per item, lihat `v<X.Y.Z>-tech.md` di folder yang sama.*
```

**Bahasa user-facing:**
- Bahasa Indonesia kasual.
- Fokus dampak/manfaat, bukan root cause teknis.
- Singkat — 1-2 baris per item.
- Gak perlu WP id.

### Step 6 — Cleanup

Hapus file temporary (raw JSON extract) jika ada.

---

## File Naming Convention

```
Release notes/
├── v<X.Y.Z>-tech.md    ← versi teknis
├── v<X.Y.Z>-user.md    ← versi user-facing
```

Jangan bikin subfolder per version. Flat di `Release notes/`.

---

## Classification Heuristics

| Subject mengandung | Kategori |
|---|---|
| "meeting", "grooming", "presentation", "timesheet", "checklist", "discussion future" | Meeting/admin → exclude |
| "Research", "Optimization" (tanpa implementasi) | Infra/internal |
| "Deployment", "env var" | Infra/internal |
| "merge data-cy", "merge data cy" | Infra/internal |
| "add widget", "integrate" | Feature |
| "improvement", "add", "create" + tipe=Feature | Feature |
| "fix", "error", "bug", "not appear", "can't", "unable", "not sync", "overflow" | Bug |
| "alert notification", "google chat" (infra) | Infra/internal |
| "Monitoring", "Release notes" | Admin → exclude |

Kalau ambigu, default ke Bug kalau ada kata "fix/error/bug", otherwise Feature.

---

## Quality Checks

Sebelum finalisasi:

1. **Count verification:** shipped features + bugs + infra + excluded + not-shipped = total WP fetched. Jika tidak match, cari WP yang terlewat.
2. **No duplikat:** satu WP cuma masuk satu kategori.
3. **Not-shipped completeness:** semua WP dengan status ≠ Closed/Tested masuk not-shipped section.
4. **User version punya semua item yang ada di tech version** (kecuali infra/internal — user version skip those).

---

## Cross-references

- `openproject-mcp` skill: filter syntax, version ID lookup, pagination, pitfalls.
- `structure-rule.md`: `Release notes/` location definition.
- `Memory/global-memory.md`: canonical product rules.
