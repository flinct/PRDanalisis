# Verifikasi Ulang Audit Team Inbox (2026-09-03) vs Source Code Aktual

Tanggal verifikasi: 2026-09-04 · Metode: grep simbol + baca konteks, read-only, BE & FE path aktual.
Referensi: `Assessments/audit/detail-conversation/2026-09-03-team-inbox-rules.md`

## Ringkasan Verdict

| Item | Verdict |
|---|---|
| R1 | **CONFIRMED** |
| R2 | **CONFIRMED** (line bergeser) |
| R3 | **CONFIRMED** |
| R4 | **CONFIRMED** |
| R5 | **CONFIRMED** (nuansa, lihat C3) |
| R6 | **CONFIRMED** |
| C1 | **CONFIRMED** — CRITICAL masih open |
| C2 | **PARTIAL** — arah terbalik, lihat catatan |
| C3 | **PARTIAL** — lihat catatan |
| C4 | **CONFIRMED** (nuansa kecil) |
| C5 | **PARTIAL** — bukan bug, gap capability |
| C6 | **CONFIRMED** |
| Top-3 Action 1 | **CONFIRMED** (bug nyata, belum difix) |
| Top-3 Action 2 | **CONFIRMED** (sesuai kode) |
| Top-3 Action 3 | **CONFIRMED** |

## Rule Inventory (R1–R6)

**R1 — CONFIRMED.** `conversation.service.ts:1332-1341` `resolveTeams()`: `role !== ADMIN` → `getTeamsByUserId`, ADMIN → `getTeams(company)`. FE `ConversationNavItemDefault.tsx:293-297` `useTeamPermissions` mengembalikan semua `teamItems` tanpa filter.

**R2 — CONFIRMED** (line 294-295). Create-team button hanya untuk `SUPERVISOR || ADMIN` (via `userRole?.name`).

**R3 — CONFIRMED.** `useInboxItems` `ConversationNavItemDefault.tsx:137-183`, line 142 `userRole?.name === RoleTypeEnum.AGENT`, lines 158/161 `show: !isAgent` untuk unassigned & all. Benar: AGENT menyembunyikan keduanya, lainnya tampil.

**R4 — CONFIRMED.** `handleInitCounter` `conversation.service.ts:6477`: `shouldScopeByTeam = role === AGENT || role === SUPERVISOR`. Line 6484: hanya saat true + ada teams, filter `team` dipakai. True untuk perbandingan AGENT/SUPERVISOR vs lainnya.

**R5 — CONFIRMED** (nuansa, lihat C3). `conversation.repository.ts:2742-2767` `buildAssignFilter`, line 2746 `isAgent`, line 2748 `if ((filter?.assign === true && userId) || isAgent)` → participant filter `participants.userId = userId`. Tanpa `assign` filter & non-AGENT → `[]` → lihat semua.

**R6 — CONFIRMED.** `countConversations` `conversation.service.ts:1293-1325`: jika counter exist → return (line 1302); jika tidak → `resolveTeams` + emit init. Invalidation events sesuai komentar `handleCounterUpdate` line 6525-6527 (assign/unassign/close/reopen/pull/change team) + dedicated fire-and-forget untuk spam/starred/junk (line 6529-6531).

## Conflict Table (C1–C6)

**C1 — CONFIRMED (CRITICAL, masih open).** FE masih pakai `userRole?.name` di kedua gate:
- `ConversationNavItemDefault.tsx:142` `const isAgent = userRole?.name === RoleTypeEnum.AGENT`
- `ConversationNavItemDefault.tsx:295` `userRole?.name === RoleTypeEnum.SUPERVISOR || userRole?.name === RoleTypeEnum.ADMIN`

Role seed (`auth-service/.../role.seed.ts`) membuktikan name ≠ code:
- Line 62-67: `{ code: AGENT, name: 'SALES' }`
- Line 51-60: `{ code: SUPERVISOR, name: 'SUPERVISOR SALES' }`

Efek nyata: SALES agent (code=AGENT, name='SALES') LOLOS cek AGENT → lihat Unassigned/All (bug); SUPERVISOR SALES (name='SUPERVISOR SALES') GAGAL cek create-button → tidak bisa create team. Kontrasnya benar: `ConversationChatLists.tsx:134` pakai `session?.user?.role?.code === RoleTypeEnum.AGENT`. Fix 2 baris (`userRole?.code`) belum diterapkan.

**C2 — PARTIAL.** Mismatch counter vs teams **real** (non-ADMIN dapat team list terfilter, tapi counter tanpa scoping team) — tapi **arah efek di laporan terbalik**. Catatan kode: (1) `buildCountResponse` (line 1233-1287) men-SEED `teamInboxes` dari team list yang sudah difilter (line 1242-1250), jadi badge COUNT bukan angka besar dari semua team — angka hanya mengikuti team yang sudah tampil. (2) `countTeamInboxPipeline` (`conversation.repository.ts:2339-2384`) saat `shouldScopeByTeam=false` **menghitung SEMUA team** perusahaan, tapi `buildCountResponse` membuang yang bukan team user (Map keyed by teamId). Artinya team count bisa termasuk konvo di luar team (bila team membagikan konvo), tapi per-team badge tetap tampil. Sebagai mismatch "scope counter" → **valid**; sebagai klaim "sidebar menunjukkan count team di luar team user" → **tidak tepat persis** — daftar & badge tetap dibatasi team yang difilter. Severity MAJOR bisa diturunkan ke MINOR/MEDIUM.

**C3 — PARTIAL.** Guard AGENT **ada di 2 jalur**, bukan "FE-only":
1. `buildAssignFilter` (`conversation.repository.ts:2746-2754`) — isAgent → paksa participant filter (agentic).
2. `buildExcludeAndTeamFilter` (`conversation.repository.ts:3663-3677`) — dipakai `countConversations` (line 1785), juga paksa participant filter untuk AGENT.
3. `shouldApplyOrCondition` (line 2584-2585) — true hanya untuk AGENT, jadi `$or` (line 2619) membuat AGENT **selalu** dapat participant branch.

Catatan kunci: isAgent **hanya memeriksa `permission.role === RoleTypeEnum.AGENT`** — SALES role (code=AGENT) LULUS karena code=AGENT, jadi data-owner benar untuk SALES. Klaim audit "AGENT dapat bypass via assign=false/no filter" → **SALAH** untuk jalur repositori; klaim "controller tanpa role check" → perlu konfirmasi. Jadi: gap keamanan FE-hide **belum tentu exploit** di BE — tapi juga tidak ada guard eksplisit berbasis filter di controller. Verdict: PARTIAL.

**C4 — CONFIRMED** (nuansa kecil). `counter.repository.ts:90-93` `findCounter` query hanya `{ userId }`; `createOrUpdateCounter` (line 43-83) menyimpan `scopeType: role` (line 61) tapi **tidak dipakai** sebagai kunci lookup. Cache = per-userId, bukan per-role. Pada role change AGENT→SUPERVISOR, counter lama bertahan sampai event counter berikutnya. Tapi nuansa: `handleCounterUpdate` (line 6504-6518) memanggil `handleInitCounter` yang melakukan `createOrUpdateCounter` (overwrite) sehingga window-nya pendek. MINOR tetap valid.

**C5 — PARTIAL.** Bukan bug teknis — benar MANAGER/TEAM_LEAD tidak dapat create team via sidebar (`ConversationNavItemDefault.tsx:295` hanya SUPERVISOR/ADMIN). Ini **gap capability/product-intent**, bukan defect. Severity MINOR + resolusi "klarfikasi intent produk" → tepat.

**C6 — CONFIRMED.** `getTeamsByUserId` `conversation.service.ts:5555-5582` menggabungkan team-service teams + conversation-repo teams (line 5579 `mergeTeams`). AGENT dapat melihat team di luar keanggotaan bila ada konvo yang di-assign. Didokumentasikan sebagai intentional namun tanpa eksplisit dokumentasi perilaku di sekitar counter.

## Temuan Baru (dalam scope team inbox)

1. **Refactor TeamInboxSection.tsx — BUKAN staleness.** File baru `nav-lists/TeamInboxSection.tsx` (75 baris) murni **presentasional**: menerima `showCreateButton` + `visibleTeams` sebagai props (line 19-35). Gate masih dihitung di `ConversationNavItemDefault.tsx:330` (`useTeamPermissions`) dan di-render ke section (line 374-383). **Audit lama TIDAK stale** — logika asli masih hidup; refactor hanya ekstraksi JSX. Wajib catat: file baru ini TIDAK menyentuh C1; `.name` bug tetap di induk.
2. **C1 effect diperluas:** karena gate create-button di line 295 juga pakai `.name`, **SUPERVISOR SALES tidak bisa create team dari sidebar** — bukan hanya SALES agent melihat Unassigned/All.
3. **BE `countConversations` menambahkan `excludeFilter`** untuk AGENT: `buildExcludeAndTeamFilter` (line 1784-1786) dipakai `countConversations` sehingga counter AGENT di-scope team + participant secara konsisten — satu-satunya jalur yang benar-benar menegakkan per-role scope di level aggregation. Fix C2 sebaiknya menambahkan role-check serupa di `buildExcludeAndTeamFilter` untuk non-ADMIN.
4. **Referensi "ConversationChatLists.tsx:134" di laporan akurat** — memakai `role.code` (`session?.user?.role?.code === RoleTypeEnum.AGENT`).

## Rekomendasi Perbaikan (satu kalimat)

1. Fix C1: ganti `userRole?.name` → `userRole?.code` di `ConversationNavItemDefault.tsx:142` & `:295` (2 baris).
2. Fix C2: perluas `shouldScopeByTeam` ke semua non-ADMIN, atau tambahkan team/participant scope di `buildExcludeAndTeamFilter` untuk non-ADMIN.
3. C3: tambahkan guard server-side eksplisit berbasis filter di controller (jika belum ada), karena guard saat ini tersebar di repo-layer.
4. C4: sertakan `scopeType` (role) dalam kunci cache counter.

**Verdict: NEEDS_REVISION: C1 (bug CRITICAL masih open), C2 (arah/tulisan perlu koreksi), C3 (klaim bypass perlu koreksi), C5 (re-frame ke capability gap).**
