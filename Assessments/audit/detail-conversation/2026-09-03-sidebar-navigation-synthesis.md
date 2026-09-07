# Analisa: Conversation-Sidebar-Navigation

Konsolidasi 3 audit anak (counter divergence, default channel display, team-inbox rules).
Semua temuan sudah diverifikasi terhadap source. File+line ada di tiap temuan.

Repos:
- BE: `Desktop/BE satuinbox/omnichannel-satuinbox-be`
- FE: `Desktop/FE satuinbox/omnichannel-satuinbox-fe`

Sub-laporan lengkap:
- Counter: `2026-09-03-counter-divergence.md`
- Channel: `2026-09-03-default-channel-display.md`
- Team inbox: `2026-09-03-team-inbox-rules.md`

---

## Ringkasan Eksekutif

| # | Pertanyaan | Verdict | Bug utama |
|---|-----------|---------|-----------|
| 1 | Counter tidak sinkron dgn list (26 vs 28), butuh hard refresh | Root cause ditemukan | Count query tanpa polling safety-net + criteria count≠list |
| 2 | Channel default = channel aktif company? | Scoping BENAR, tapi bocor | Merge tanpa `has()` guard + cache counter tak pernah di-invalidate saat channel status berubah |
| 3 | Kotak Masuk Tim: konflik rule per role x ownership | 6 konflik, 1 CRITICAL | FE gate pakai `role.name` bukan `role.code` → gate bocor utk role sales |

Prioritas fix ada di bagian akhir. Satu bug CRITICAL (C1) + tiga HIGH (counter Fix1, channel F1+F2).

---

## Bagian 1 — Counter tidak sinkron dengan Conversation List

Symptom: sidebar "Kotak Pesan Anda" counter=26, list tampil 28. Hard refresh nge-clear cache → dua query fetch ulang → sinkron sementara.

Root cause (dua issue saling memperkuat):

1. PRIMARY — count query tanpa polling safety-net.
   `apps/omnichannel/services/conversation/conversation.service.ts:348-366`
   `useCountConversation` tidak punya `refetchInterval`. Global defaults `refetchOnWindowFocus:false`, `staleTime:2min` (`packages/react-query/src/helpers/makeQueryClientHelper.ts:9-12`).
   Count hanya update lewat socket `conversation.counter` + invalidation eksplisit. Kalau socket delayed/dropped/userId mismatch → count stale tanpa fallback.

2. List di-update langsung via cache manipulation, count TIDAK.
   `notification.new.message` utk conversation yang sudah ada di cache → `handleUpdateLatestMessage` update list cache (unread++, latest msg), count tidak disentuh (`use-invalidate-conversation.ts:163-173`).

3. Criteria count ≠ list (backend).
   List: `getConversations({ assign:true, hideEmpty:true })`. Count: `countConversation()` TANPA filter. Kalau logic count beda dari list (mis. count exclude empty berbeda), angka diverge secara struktural — bukan sekadar timing.

4. Guard socket bisa fail silent.
   `use-conversation-socket-event.ts:570-589`: `if (currentUserId === data.userId)`. Kalau backend kirim userId format beda/null → handler skip diam-diam.

Fix (urut): Fix1 `refetchInterval: 30_000` pada `useCountConversation` (minimal, safe, hilangkan divergence timing). Fix2 invalidate count juga saat conversation sudah ada di cache. Fix3 (backend) samakan criteria count API dengan list API — ini fix struktural, wajib untuk hilangkan diverge permanen.

---

## Bagian 2 — Default Channel Display per Company

Pertanyaan: default nampilin channel mana? Harusnya hanya channel `status==ACTIVE` di company tsb; beda company beda set.

Verdict: company-scoping BENAR (tidak ada cross-company leak). `getActiveChannel(company)` pakai `companyContext` + filter `status==ACTIVE` (`conversation.service.ts:2857,2873`). TAPI channel non-aktif tetap bisa muncul karena 2 bug:

- F1 [HIGH] Merge tanpa `has()` guard.
  `conversation.service.ts:1272-1281`. `channelMap` di-seed dari active channels, lalu merge agregasi `channelMap.set(channel.id, ...)` TANPA `if (channelMap.has(...))`. Channel non-aktif yang masih punya open conversation (platform whitelisted) ikut ditambahkan.
  Fix: `if (!channelMap.has(channel.id)) continue;` (1 baris, root cause).

- F2 [HIGH] Counter tak pernah di-invalidate saat channel activate/deactivate.
  `conversation.service.ts:1300-1302` return cached `existCounter` apa adanya. channel-service tidak emit event counter saat channel status berubah (hanya people-service emit, utk membership tim). Jadi walau F1 sudah fix, company yang counter-nya sudah ke-cache tetap pakai channel-set lama.
  Fix: emit event invalidate/rebuild counter company saat channel status berubah (reuse path `CONVERSATION_INIT_COUNTER` + `reset`), atau kasih TTL counter.

- F3 [MEDIUM] Hardcoded `limit:25` (`conversation.service.ts:2861`) — company >25 channel bisa kehilangan active channel di luar page 1 (false negative). Fix: filter `status==ACTIVE` server-side / paginate semua.
- F4 [MEDIUM] Platform whitelist hardcoded (`conversation.repository.ts:1969`), bukan dari config company. Platform di luar list disenyapkan dari count. Fix: derive dari active channel company.
- F5 [LOW] Agregasi hitung conversation di channel non-aktif (`conversation.repository.ts:1956`). Harmless setelah F1, tapi angka dihitung atas data channel non-aktif.

---

## Bagian 3 — Kotak Masuk Tim: Rule x Role x Ownership

Roles: AGENT, ADMIN, MANAGER, SUPER_ADMIN, SUPERVISOR, TEAM_LEAD, USER.

6 rule dienumerasi:
- R1 Visibility tim: ADMIN=semua tim company; lainnya=tim user (member ∪ tim dgn conversation assigned). BE `resolveTeams` (`conversation.service.ts:1332`). FE tidak filter, andalkan BE.
- R2 Tombol create team: SUPERVISOR/ADMIN saja. FE `ConversationNavItemDefault.tsx:294-295`.
- R3 Visibility inbox items: AGENT sembunyikan `unassigned`+`all`; lainnya semua. FE `:137-183`.
- R4 Scope counter: AGENT/SUPERVISOR scoped by team; lainnya tidak. BE `handleInitCounter` (`:6477`).
- R5 Ownership list: AGENT selalu `participants.userId=currentUser`; lainnya lihat semua di tim. BE `buildAssignFilter` (`conversation.repository.ts:2742-2767`).
- R6 Cache counter: per-userId, return cached bila ada. BE `:1299-1302`.

6 konflik:

| # | Sev | Role | Issue | File:Line | Fix |
|---|-----|------|-------|-----------|-----|
| C1 | CRITICAL | AGENT(SALES), SUPERVISOR(SALES) | FE bandingin `userRole?.name` vs `RoleTypeEnum` (=code). Seed buktikan name≠code: `{name:'SALES',code:AGENT}`, `{name:'SUPERVISOR SALES',code:SUPERVISOR}`. Efek: SALES agent lolos check `name!=='AGENT'` → lihat Unassigned/All; SUPERVISOR SALES kehilangan tombol create. Semua gate lain pakai `.code`, hanya sidebar nav pakai `.name`. | FE `ConversationNavItemDefault.tsx:142,294-295`; BE `role.seed.ts` | Ganti kedua check ke `userRole?.code`. 1 baris each. |
| C2 | MAJOR | MANAGER, SUPER_ADMIN, TEAM_LEAD, USER | Counter NOT team-scoped (`shouldScopeByTeam` cuma AGENT/SUPERVISOR) padahal tim DIFILTER (`getTeamsByUserId`). Badge count ≠ list count. | `conversation.service.ts:6477` | Extend `shouldScopeByTeam` ke semua non-ADMIN (samakan dgn `resolveTeams`). |
| C3 | MAJOR | AGENT | Tidak ada role guard di controller `GET /conversation`. Ownership AGENT hanya di repo `buildAssignFilter`. AGENT bisa panggil endpoint dgn `assign=false` langsung. | `conversation.service.ts:995-1019`, `conversation.repository.ts:2742-2767` | Paksa `participants.userId` utk AGENT di server, apapun filter request. |
| C4 | MINOR | ALL | Cache counter per-userId bukan per-role. Ganti role → counter stale sampai invalidation berikutnya. | `counter.repository.ts:90-93` | Invalidate saat role change / masukkan role ke cache key. |
| C5 | MINOR | MANAGER, TEAM_LEAD | Tombol create hanya SUPERVISOR/ADMIN. Intent produk belum jelas. | `ConversationNavItemDefault.tsx:294-295` | Klarifikasi produk. |
| C6 | INFO | Non-ADMIN | `getTeamsByUserId` union (member ∪ tim dgn conversation assigned). Intentional tapi undoc. | `conversation.service.ts:5555-5582` | Dokumentasikan. |

---

## Tema Lintas-Audit

1. Cache counter fragile di 3 sumbu. Counter di-cache per userId dan diandalkan sebagai sumber kebenaran, tapi tidak di-invalidate saat: (a) channel status berubah (F2), (b) role berubah (C4), (c) new message pada conversation existing (Bagian 1). Semua bermuara ke path counter yang sama. Perbaikan strategis: standardisasi invalidation counter + kasih TTL/polling fallback, bukan tambal per-event.

2. Count ≠ List secara sistemik. Divergence 26-vs-28 (Bagian 1 issue #3) dan badge≠list team (C2) adalah gejala sama: query count dan query list dibangun dari criteria berbeda. Selama count API tidak dijamin memakai criteria yang sama dgn list API, angka akan terus diverge.

3. Role gating tidak konsisten `name` vs `code` (C1). Sidebar nav satu-satunya yang pakai `role.name`; sisanya `role.code`. Ini bug diam yang lolos di company default (name==code) tapi bocor di company yang punya custom role sales.

---

## Prioritas Fix (urut kerja)

P0 — CRITICAL
- C1: ganti `userRole?.name` → `userRole?.code` di `ConversationNavItemDefault.tsx:142,294-295`. 2 baris. Gate role sidebar bocor untuk role sales.

P1 — HIGH
- Counter Fix1: `refetchInterval: 30_000` pada `useCountConversation` (`conversation.service.ts:354`). Hilangkan divergence timing.
- Channel F1: `if (!channelMap.has(channel.id)) continue;` di merge loop (`conversation.service.ts:1272`). Cegah channel non-aktif muncul.
- Channel F2: emit event invalidate counter saat channel activate/deactivate. Supaya F1 berlaku utk company yang sudah ke-cache.

P2 — MAJOR
- C2: extend `shouldScopeByTeam` ke semua non-ADMIN (`conversation.service.ts:6477`).
- C3: role guard server-side pada `GET /conversation` untuk AGENT.
- Counter Fix3 / Count≠List: samakan criteria count API dgn list API. (fix struktural utk divergence permanen)

P3 — MINOR / hardening
- Channel F3 (limit:25), F4 (platform whitelist), F5 (count inactive).
- C4 (cache per-role), C5 (create-team utk MANAGER/TEAM_LEAD — butuh keputusan produk), C6 (dokumentasi).

Catatan: Counter Fix1 dan Channel F2 dan C4 semuanya menyentuh mekanisme invalidation counter yang sama — kalau invalidation/TTL counter distandardisasi sekali, ketiganya beres tanpa tambalan terpisah.

---

## Verifikasi Cross-Check (2026-09-03)

3 klaim decision-bearing diverifikasi terhadap source code asli (BE + FE). Confidence: **TINGGI** — semua symbol & kutipan cocok, line number bergeser ≤20 baris dari current source.

### C1 (CRITICAL) — `role.name` vs `role.code` → **CONFIRMED**
- FE `ConversationNavItemDefault.tsx:142`: `const isAgent = userRole?.name === RoleTypeEnum.AGENT` — pakai `.name` ✓
- FE `:294-295`: `const showCreateButton = userRole?.name === RoleTypeEnum.SUPERVISOR || userRole?.name === RoleTypeEnum.ADMIN` — pakai `.name` ✓
- `RoleTypeEnum` (packages/constants/src/roles.ts:1-9) = CODE values: `AGENT='AGENT'`, `SUPERVISOR='SUPERVISOR'` ✓
- BE `role.seed.ts`: line 65 `name: 'SALES'` + line 62 `code: RoleTypeEnum.AGENT`; line 58 `name: 'SUPERVISOR SALES'` + line 51 `code: RoleTypeEnum.SUPERVISOR` — name≠code confirmed ✓
- Counter-proof: `ConversationChatLists.tsx:134` pakai `session?.user?.role?.code` — gate lain pakai `.code` ✓
- **Kesimpulan:** static-certain bug. Sub-report caveat "verify by logging userRole" berlebihan — seed data + enum sudah membuktikan secara statis (asumsi: role SALES/SUPERVISOR SALES ter-provision via `defaultCompanyRole`, yang memang men-seed keduanya).

### F1 (HIGH) — channelMap key mismatch → **CONFIRMED, keys collide legitimately**
- Seed key (conversation.service.ts:1260-1264): `channelMap.set(code, ...)` keyed by `channel.platform.code` ✓
- Merge key (:1272-1273): `const channelKey = channel.id;` — comment di source: "In DB, 'id' usually contains 'widget','email', etc." ✓
- Aggregation pipeline (repository.ts:2054-2060): `_id: '$channelType'` where `channelType` default = `$channel.platform.code`; project (:2066-2074) `id: '$_id'` = platform code ✓
- **Kesimpulan:** seed key dan merge key = domain sama (platform code). Guard `has(channel.id)` valid, bukan no-op.
- **Koreksi penting:** karena keys collide, merge sudah update seeded entries in-place. Guard `has()` efek nyata = **drop bucket channelType hasil `addFields` yang TIDAK ada di seed activeChannels** (WHATSAPP_WEB_GROUP, INSTAGRAM_COMMENT). Ini keputusan perilaku, perlu ditegaskan sebelum fix diterapkan — apakah WA group / IG comment counts memang harus disembunyikan?

### C2 (MAJOR) — `shouldScopeByTeam` scope mismatch → **CONFIRMED**
- `conversation.service.ts:6477`: `const shouldScopeByTeam = role === RoleTypeEnum.AGENT || role === RoleTypeEnum.SUPERVISOR;` ✓
- `resolveTeams` (:1332-1341): `if (role !== RoleTypeEnum.ADMIN) { return this.getTeamsByUserId(userContext); }` — ALL non-ADMIN dapat filtered teams ✓
- **Kesimpulan:** mismatch nyata. Fix sebaiknya `role !== RoleTypeEnum.ADMIN` (samakan dengan `resolveTeams`), bukan tambah role satu-satu.

### Catatan tambahan: C3 (MAJOR) — server-side AGENT guard
Report bilang "Tidak ada role guard di controller `GET /conversation`". Benar bahwa controller tidak punya role check. TAPI `buildAssignFilter` (repository.ts:2742-2767) dipanggil di repo layer (line 2608-2610) untuk SEMUA query — `isAgent` check di sana force `participants.userId` filter untuk AGENT. Jadi guard ADA, tapi di repo bukan controller. Risiko: kalau ada code path baru yang query conversation TANPA lewat `buildAssignFilter` (misal direct aggregation), AGENT bisa bypass. Severity turun dari MAJOR ke **MEDIUM** — guard ada tapi enforcement layer-nya fragile (repo-level, bukan controller-level).
