# Summary — 2026-07-21 — QA Browser workspace folders

## Request
Tambahkan folder workspace baru di QA Browser: Incident Report, Summary, Release Notes, dan UAT. Pastikan tampil berdasarkan file type dalam folder, tidak cuma BRD/PRD/Assessment/Testcase/Feature List/Google Docs.

## Changes
- Tambah section baru di `server.js` untuk scan folder:
  - `incident report`
  - `summary`
  - `Release notes`
  - `UAT`
- Tambah section baru di `Test/testcase-browser.html`:
  - `KNOWN_SECTIONS`
  - `WORKSPACE_SUB`
  - `sectionIdMap`
- Update empty-state text jadi dukung `Markdown, TSV, CSV, TXT, Google Docs`

## Verification
- `node --check server.js` ✅
- Python string assertion untuk cek section/folder mapping di `server.js` dan `Test/testcase-browser.html` ✅
- Mapping `openFile()` ke `workspaceNav` ditambah untuk `incident-report`, `summary`, `release-notes`, `uat` supaya folder tetap expand saat file diklik ✅
- Repo check menunjukkan folder target memang ada dan berisi file:
  - `incident report/*.md`
  - `summary/*.md`
  - `Release notes/*.md`
  - `UAT/*.csv`

## Notes
- Dukungan file type sudah ikut dari shared scanner `walkDir()` di `server.js`, yang memang membaca `.tsv`, `.csv`, `.md`, `.txt`.
- Tidak tambah file type baru lain karena belum diminta.
