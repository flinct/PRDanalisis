# Audit: Kotak Masuk Tim — Rule x Role x Ownership

> **Re-verifikasi 2026-09-04** (vs source aktual, read-only). R1–R6 + C1/C4/C6 CONFIRMED. C2/C3/C5 dikoreksi (lihat sel). Detail bukti: `2026-09-04-verify-team-inbox-rules.md`. Refactor `TeamInboxSection.tsx` presentasional → audit TIDAK stale, C1 masih open.

## Scope
Conversation-Sidebar-Navigation "Kotak Masuk Tim" (Team Inbox) section.
Audit: visibility rules per role, data ownership enforcement, conflicts/ambiguities.

## Roles (BE & FE enum)
AGENT, ADMIN, MANAGER, SUPER_ADMIN, SUPERVISOR, TEAM_LEAD, USER

---

## Rule Inventory

### R1. Team visibility in sidebar (which teams appear)
- **Source BE:** `conversation.service.ts:1332` `resolveTeams()`
- **ADMIN** → `getTeams(company)` — ALL teams for the company
- **All other roles** → `getTeamsByUserId(userContext)` — teams user belongs to (team service) + teams with conversations assigned to user (conversation repo)
- **Source FE:** `ConversationNavItemDefault.tsx:293` `useTeamPermissions()` — returns ALL `teamItems` unfiltered; relies entirely on BE

### R2. Create team button
- **Source FE:** `ConversationNavItemDefault.tsx:294-295`
- **SUPERVISOR or ADMIN** → button shown
- **All others** → hidden

### R3. Inbox items visibility (Kotak Pesan Anda, Unassigned, All, Spam, Starred, Junk)
- **Source FE:** `ConversationNavItemDefault.tsx:137-183` `useInboxItems()`
- **AGENT** → hides `unassigned` and `all`
- **All others** → all items visible

### R4. Counter scope (sidebar counts)
- **Source BE:** `conversation.service.ts:6477` `handleInitCounter()`
- **AGENT or SUPERVISOR** → counter query scoped by team IDs (`shouldScopeByTeam = true`)
- **All others** → counter NOT team-scoped (counts all conversations)

### R5. Conversation list ownership (what conversations appear when clicking a team)
- **Source BE:** `conversation.repository.ts:2742-2767` `buildAssignFilter()`
- **AGENT (always)** → `participants.userId = currentUser` — only conversations where user is participant
- **Others** → no participant filter — sees ALL conversations in the team

### R6. Counter cache
- **Source BE:** `conversation.service.ts:1299-1302` `countConversations()`
- Returns cached counter if exists; builds fresh with `resolveTeams` if not
- Cache invalidated on: assign, unassign, close, reopen, pull, inbound, team change

---

## Conflict/Ambiguity Table

| # | Rule | Role(s) | Issue | Severity | File:Line | Resolution |
|---|------|---------|-------|----------|-----------|------------|
| C1 | R3, R2 | AGENT(SALES), SUPERVISOR(SALES) | **CONFIRMED BUG — MASIH OPEN (verifikasi 2026-09-04).** FE compares `userRole?.name` against `RoleTypeEnum` values, but role seed proves name ≠ code: `{ code: AGENT, name: 'SALES' }` (`role.seed.ts:62-67`) and `{ code: SUPERVISOR, name: 'SUPERVISOR SALES' }` (`:51-60`). Effect: SALES agent (code=AGENT, name='SALES') passes the `name === AGENT` check → **sees Unassigned/All** in sidebar. **SUPERVISOR SALES fails the create-button check → cannot create team.** All other FE gates use `role.code` (e.g. `ConversationChatLists.tsx:134`), only sidebar nav uses `.name`. Gate tetap di induk meski `TeamInboxSection.tsx` di-ekstrak (presentasional). | CRITICAL | FE `ConversationNavItemDefault.tsx:142,295`; BE `role.seed.ts:51-67` | Change both checks to `userRole?.code`. One-line fix each. |
| C2 | R4, R5 | MANAGER, SUPER_ADMIN, TEAM_LEAD, USER | **PARTIAL (koreksi 2026-09-04) — severity ↓ MINOR/MEDIUM.** Mismatch scope nyata: non-ADMIN dapat team list terfilter, tapi `shouldScopeByTeam` hanya cek AGENT/SUPERVISOR. Namun arah efek di klaim asli terbalik: `buildCountResponse` (`:1233-1287`) men-SEED `teamInboxes` dari team terfilter (Map keyed by teamId) → badge per-team tetap dibatasi team user, **bukan** "sidebar menunjukkan count team di luar team user". Angka per-team bisa termasuk konvo shared, tapi daftar & badge tetap terbatas. | MINOR | `conversation.service.ts:6477`, `buildCountResponse:1233` | Extend `shouldScopeByTeam` ke semua non-ADMIN, ATAU tambah team/participant scope di `buildExcludeAndTeamFilter` untuk non-ADMIN. |
| C3 | R3 | AGENT | **PARTIAL (koreksi 2026-09-04) — klaim "tanpa guard BE" SALAH.** Guard AGENT ADA di repo layer, di 2 jalur: `buildAssignFilter:2746-2754` (paksa participant filter) + `buildExcludeAndTeamFilter:3663-3677` (dipakai `countConversations:1785`) + `shouldApplyOrCondition:2584` (true hanya AGENT). SALES (code=AGENT) ikut terlindungi karena guard cek `permission.role === AGENT`. Jadi AGENT TIDAK bisa bypass via `assign=false` di jalur repo. Sisa gap: controller belum punya role-check filter eksplisit (guard tersebar di repo) — perlu konfirmasi apakah semua entry point lewat repo ini. | MINOR | `conversation.repository.ts:2746,3663,2584` | Konfirmasi semua entry point conversation list lewat repo guard ini; jika ada jalur lain, tambah role check di controller. |
| C4 | R6 | ALL | Counter cache is per-userId but not per-role. If user role changes (e.g. AGENT→SUPERVISOR), cached counter retains old scope until next invalidation event. Stale window: until next conversation event triggers `handleCounterUpdate`. | MINOR | `counter.repository.ts:90-93` | Invalidate counter on role change event, or include role in cache key. |
| C5 | R2 | MANAGER, TEAM_LEAD | **PARTIAL (koreksi 2026-09-04) — gap capability, bukan defect.** Create-team button hanya SUPERVISOR/ADMIN (`ConversationNavItemDefault.tsx:295`). MANAGER/TEAM_LEAD tak bisa create team dari sidebar — ini keputusan product-intent yang perlu diklarifikasi, bukan bug. | MINOR (capability gap) | `ConversationNavItemDefault.tsx:295` | Klarifikasi intent produk: apakah MANAGER/TEAM_LEAD boleh create team? Jika ya, perluas role check. |
| C6 | R1 | Non-ADMIN | `getTeamsByUserId` merges team-service teams with conversation-repo teams. An AGENT can see teams they're not a member of if they have assigned conversations from those teams. This is intentional (line 5570-5576) but undocumented — could confuse team-scoped counter logic. | INFO | `conversation.service.ts:5555-5582` | Document this behavior. Consider whether counter scope should match (currently it does via `resolveTeams`). |

---

## Data Flow Summary

```
User clicks team inbox
  → FE sends GET /conversation?team=<teamId> (no assign filter)
  → BE buildAssignFilter:
      AGENT → { participants.userId: currentUser }
      Others → {} (no filter)
  → BE buildTeamFilter:
      { team.teamId: { $in: [teamId] } }
  → Combined: AGENT sees own conversations in team; others see ALL in team

Sidebar counts
  → FE calls GET /conversation/count
  → BE resolveTeams:
      ADMIN → all company teams
      Others → user's teams + teams with assigned convos
  → BE handleInitCounter:
      AGENT/SUPERVISOR → counter scoped by team IDs
      Others → counter NOT team-scoped
  → Counter cached per userId, pushed via socket
```

---

## Top 3 Actions

> Diperbarui 2026-09-04 setelah re-verifikasi.

1. **[CRITICAL] Fix C1 sekarang** — ganti `userRole?.name` → `userRole?.code` di `ConversationNavItemDefault.tsx:142` & `:295` (2 baris). Dikonfirmasi masih pakai `.name`; role.seed membuktikan name≠code untuk SALES/SUPERVISOR SALES. Dampak: SALES agent bocor lihat Unassigned/All + SUPERVISOR SALES tak bisa create team.

2. **[MINOR, turun dari MAJOR] Scope counter non-ADMIN (C2)** — `conversation.service.ts:6477`: perluas `shouldScopeByTeam` dari `AGENT || SUPERVISOR` ke `role !== ADMIN`, ATAU tambah scope di `buildExcludeAndTeamFilter` untuk non-ADMIN. Catatan: badge per-team sudah dibatasi team terfilter via `buildCountResponse`, jadi ini konsistensi angka, bukan kebocoran.

3. **[MINOR] Konfirmasi guard controller (C3)** — guard AGENT SUDAH ada di repo (`buildAssignFilter:2746`, `buildExcludeAndTeamFilter:3663`, `shouldApplyOrCondition:2584`); AGENT tak bisa bypass via `assign=false` di jalur repo. Sisa: pastikan semua entry point conversation list lewat repo tsb; jika ada jalur lain, tambah role check di controller.
