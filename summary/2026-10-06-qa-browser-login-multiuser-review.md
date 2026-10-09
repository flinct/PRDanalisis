# 2026-10-06 — Review skema login QA Browser vs kebutuhan multi-user

## Scope
Review skema auth QA Browser (`server.js` + `Test/testcase-browser.html`) untuk kelayakan multi-user. Read-only, tidak ada perubahan kode.

## Temuan (evidence-based)
- `POST /api/login` (server.js:341-365): plaintext compare ke `Setup/users.yaml` (4 user: 2 admin, 2 viewer). Response = identitas saja, **tanpa token/sesi/cookie**.
- `Setup/users.yaml` password plaintext 7-9 char dan **tracked di git** (tidak ada di .gitignore) → password bocor permanen di history.
- Client simpan sesi di `localStorage.qa_user` (testcase-browser.html:5384), restore tanpa expiry/re-validate (8054-8060). Logout = removeItem (9884).
- `canAdminEdit = user?.role === 'admin'` (8103) hanya dipakai untuk warna label role (9876) + sembunyikan menu Settings (9902). Gate UI saja.
- **Server tidak mengenali pemanggil sama sekali**: semua mutation (`PUT /api/files/content`, `POST /api/files/mkdir`, `PUT /api/tracker`, `PUT /api/new-request`, `PUT /api/tracker/source*`, `PATCH .../work-package/:id`, `PUT /api/gdocs/:id`, `POST /api/mirror`) tanpa cek auth/role. `updatedBy` = string bebas dari body (spoofable).
- Pengecualian: `/api/setup/*` mutation pakai `setupMutationGuard` (loopback-only, 1286-1297) dan `/api/hermes` loopback-only (950-951).
- Server listen semua interface + print LAN IP (1811-1818) → mutation terbuka ke siapa pun di LAN tanpa login.
- Concurrent edit: tracker & new-request = 1 key `app_state` full-replacement, last-write-wins tanpa optimistic lock (updatedAt dikirim balik tapi tidak dipakai cek).

## Verdict
- Multi-user saling percaya (LAN trusted, 4 org): **layak terbatas** — login hanya gerbang UX/label.
- Multi-user dengan pemisahan hak viewer-vs-admin yang nyata: **TIDAK layak** — enforcement nol di server, viewer bisa langsung mutate via curl.
- Multi-user butuh audit trail / edit bersamaan: **TIDAK layak** — `updatedBy` spoofable, file write tanpa atribusi, last-write-wins.

## Jalur minimum menuju layak multi-user (belum dieksekusi)
1. Server-side session token (random + store di SQLite; bisa revoke) + middleware `requireAuth`/`requireAdmin` di semua mutation.
2. Hash password (crypto.scrypt, stdlib) + `Setup/users.yaml` keluar dari git, ganti semua password (yang lama sudah di history).
3. `updatedBy` dari sesi server, bukan body.
4. Optimistic lock: client kirim `updatedAt`, server tolak (409) kalau beda.
5. Login rate-limit/lockout per akun.

## Status
Review only — tidak ada perubahan kode. Keputusan implementasi di user.
