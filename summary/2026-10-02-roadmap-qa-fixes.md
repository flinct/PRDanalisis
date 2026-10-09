# 2026-10-02 — Roadmap QA Browser: 5 temuan review (orchestrator mode)

Status: **SELESAI** — orchestrator loop 1 putaran: worker PASS review (verdict `PASS`, exit-code diverifikasi ulang oleh reviewer).

## 5 temuan user (dari screenshot roadmap)

1. Bulan yang sudah select version OP tidak bisa re-select.
2. Seharusnya bisa select multiple version per bulan.
3. Scroll: header bulan yang sudah select version ikut scroll — harusnya sticky.
4. Task dari OP, edit dari roadmap — sudah bisa sync ke OP belum?
5. Priority selector beda antara roadmap & OP — user pilih **auto-translate**: p0=urgent, p1=high, p2=med, p3=low.

## Root cause (hasil investigasi orchestrator, sudah diverifikasi ke source)

| # | Root cause | Lokasi |
|---|---|---|
| 1 | Gate render dropdown `!hasVer` → dropdown tidak muncul kalau bulan sudah punya versi | `Test/testcase-browser.html` ~L7330 |
| 2 | Option click selalu `verMap[m]=[v.id]` (single) + tutup DD; **`verDDRef` tidak pernah di-attach** ke div DD (outside-click close mati) | ~L7335-7339, ref L6474/L6614 |
| 3 | Inline `position:relative` di `<th>` active month menimpa CSS `position:sticky` | ~L7323 vs ~L5886 |
| 4 | Tidak ada write path ke OP: `updateTask` hanya tulis IndexedDB; `openProjectRequest` hardcoded GET; tidak ada route PATCH di server.js | HTML L6621, server.js L140 |
| 5 | Import OP menulis nama priority mentah (`"Urgent"`) ke `priority`, tidak ada di `RM_PRIOS` → selector/KPI/scheduler rusak untuk task OP | HTML ~L6566 vs L5632 |

Catatan pendukung:
- Multi-version **sudah didukung** di data layer: effect kirim `versionIds=<comma>` (L6556), server split comma (`buildOpenProjectWpFilters`, server.js ~L208).
- `desc` task OP = teks display "assignee · status" (L6565) → **jangan pernah** di-push ke OP (bisa korupsi deskripsi OP).
- Meta endpoint sudah mengembalikan `priorities:[{id,name,color}]` (server.js ~L774) tapi client membuangnya (HTML ~L6541) → perlu disimpan untuk lookup id priority saat write-back.

## Rencana eksekusi (orchestrator loop, maks 3 putaran)

1. Worker (`delegate_as coding` → `cbx/claude/claude-opus-5`, effort medium, skill `workflow-coder` + `qa-browser-setup-dashboard`) → patch HTML + server.js.
2. Reviewer (`delegate_as review` → `cbx/openai/gpt-5.5`, effort high, skill `workflow-reviewer`) → verdict `PASS` / `NEEDS_REVISION`.
3. Loop ≤3 putaran; setelah PASS: restore `hermes config set delegation.model ''`.

## Verifikasi

- Re-read semua blok yang disentuh (file inline Babel rawan patch-drift).
- Syntax check: esbuild JSX transform (devDependency tersedia) untuk blok script + `node --check server.js`.
- Source-assert untuk 5 perubahan kunci.
- **TIDAK** curl localhost:3001 (pernah consent-block), **TIDAK** live-write ke OpenProject asli → probe smoke-test dihandoff ke user.

## Hasil akhir

Orchestrator loop 1 putaran → reviewer verdict **`PASS`** (verifier jalankan ulang sendiri: esbuild JSX parse exit 0, `node --check server.js` exit 0, 7 assertion hijau).

1. **Re-select versi** — gate `!hasVer` dihapus dari render dropdown (`testcase-browser.html:7372`); title jadi "Double-click to add/remove versions".
2. **Multi-version** — option click toggle membership (buka-bulan tetap terbuka), `ref={verDDRef}` kini ter-attach (outside-click close akhirnya hidup), class `.rm-ver-opt.sel` ✓, label header `name +N`, month-tab "Linked to N OP version(s)". Data layer sudah kompatibel (`versionIds=a,b` → filter `=` OR).
3. **Sticky header bulan** — inline `position:'relative'` dihapus dari `<th>` bulan aktif (`:7365`); CSS `position:sticky` (L5895) menang lagi, dropdown tetap ter-anchor.
4. **Sync ke OP** — sebelumnya **tidak ada**; kini: `openProjectRequest(apiPath, opts)` (method/body, semua caller GET lama utuh), route `PATCH /api/dashboard/openproject/work-package/:id` (fresh `lockVersion` sebelum tulis, whitelist `subject` + `_links.priority.href`, 409 → refetch-retry), client `pushToOp()` hanya 2 titik (edit nama task, ganti priority) + hanya saat `task.opId`. `desc`/status/schedule **tidak** di-push (desc OP = teks display "assignee · status").
5. **Priority auto-translate** — `rmPrioFromOp()`: Urgent→P1, High→P2, Normal→P3, Low→Backlog (case-insensitive, unknown→P3); dipakai di import OP + migrasi `normalize()` untuk data lama; reverse map untuk write-back id priority via `opMeta.priorities`. `RM_PRIOS`/KPI/scheduler/CSS tak disentuh.

Advisory reviewer (belum dikerjakan, keputusan user):
- `server.js:884` — PATCH route tanpa auth, server bind semua interface → siapa pun di LAN bisa ubah WP produksi OP. Ada `setupMutationGuard` (L1286) yang cocok, tapi aktifkan itu juga memblokir tester non-host.
- `server.js:905` — 422 (property violation) digabung ke pesan "refetch and retry" (e.message tetap disertakan).
- Deselect versi **tidak** menghapus task OP yang sudah ter-merge (pre-existing, kini lebih sering kejadian dengan multi-select).

Smoke-test live OP (belum dilakukan, by design): edit nama/priority 1 task OP dari roadmap → cek activity di OpenProject. Payload shape tinggal satu fungsi kecil di server.js kalau perlu disesuaikan versi OP.
