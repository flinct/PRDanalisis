# Feasibility & Brainstorm Analysis: Agent Statistic Dashboard Extensions

> **Artifact Type:** Feasibility / Brainstorm Analysis (pre-Change-Intake)
> **Feature:** Agent Statistic Access — proposed extensions (2 ide PM)
> **Author / Owner:** Dany Christian (PM)
> **Product:** SatuInbox
> **Domain:** Analytics + Conversation (drill-down)
> **Date:** 2026-08-12
> **Status:** Final — brainstorm verified codebase
> **Source Request:** PM Dany Christian — dua ide lanjutan di atas security-fix ver2.8.1
> **Related:**
> - Change Intake Brief v1.5 — `Assessments/cross-domain/agent-statistic-access/agent-statistic-access-change-intake-brief.md`
> - PRD Patch v1.0 — `PRD/Analytics/Statistic/PRD Analytics - agent statistic access.md`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/impact-analysis-rule.md`
> **Verification:** Codebase BE + FE verified (see Section 2.1 anchors)

---

## 0. Ringkasan Eksekutif

Dua ide lanjutan diajukan PM di atas security-fix "Agent Statistic Access" yang sedang jalan (ver2.8.1):

1. **Mini dashboard terpisah** dari halaman `/statistic` untuk agent.
2. **Interactive dashboard (drill-down):** KPI card (mis. "Percakapan sudah dibalas: 10") bisa diklik → menampilkan 10 conversation aktual, entah navigate ke halaman conversation dengan filter, atau modal baru.

**Temuan inti:**

- **Mini dashboard = SKIP (YAGNI).** Halaman `/statistic` yang sudah self-filtered secara efektif SUDAH menjadi "mini dashboard agent". Bangun halaman terpisah = duplikasi tanpa kebutuhan yang jelas.
- **Drill-down = layak, tapi ada 1 masalah keras:** KPI card diisi dari **endpoint count agregat** (tidak bawa conversation ID), dan **tidak semua metric bisa dipetakan** ke filter conversation-list yang ada. Card contoh PM ("percakapan sudah dibalas") justru paling sulit — tidak ada filter `replied` di conversation list.
- Kedua ide = **net-new scope**, BUKAN bagian security-fix ver2.8.1. Brief v1.5 secara eksplisit menaruh "dashboard/halaman/endpoint baru" sebagai OUT OF SCOPE.

---

## 1. Extension 1 — Mini Dashboard Terpisah

### 1.1 Feasibility

Secara teknis trivial (bikin route + section baru). Masalahnya bukan feasibility, tapi **justifikasi**.

Halaman statistic existing sudah:
- Self-filtered untuk agent via `useAnalyticsAccessMode.ts` (READ_OWN → `assigned_only` → `isSelfOnly=true`).
- Menyembunyikan filter agent/team saat self-only (`StatisticFilter.tsx`, `ResponsivenessFilterOptions.tsx`, `MemberPerformanceSection.tsx`).
- Menampilkan metric pribadi agent (FRT, RLT, CSAT, conversation counts).
- Menggunakan endpoint yang sama (total-metrics, reply-metrics, screenshot-metrics, responsiveness, CSAT).

Artinya `/statistic` **sudah** berperan sebagai dashboard personal agent begitu di-scope. Halaman "mini dashboard terpisah" akan menampilkan data yang sama dari endpoint yang sama.

### 1.2 Ladder / Rekomendasi

| Pertanyaan | Jawaban |
|---|---|
| Perlu ada sama sekali? | **Belum terbukti.** Speculative — "jika nanti mau". |
| Sudah ada yang mengcover? | Ya — `/statistic` self-filtered = de-facto agent dashboard. |

**Rekomendasi: DEFER (Future Consideration).** Jangan bangun halaman terpisah tanpa problem statement konkret. Kalau nanti muncul kebutuhan spesifik yang TIDAK bisa dijawab halaman statistic existing (mis. widget ringkas di home/landing, target harian, gamifikasi, KPI ringkasan 1 layar), baru buka Change Intake sendiri.

**Effort kalau tetap dibangun:** S–M (FE-only kalau reuse endpoint existing; jadi M kalau butuh layout/metric baru).

---

## 2. Extension 2 — Interactive Dashboard (Drill-Down)

### 2.1 Kondisi Codebase Saat Ini (Verified Anchors)

| Anchor (file:line) | Fakta Verified |
|---|---|
| `FE: components/molecules/StatisticCard.tsx:17-55` | `<div>` polos. **Tidak ada** `onClick`, `Link`, `cursor-pointer`. Props: `label, value, changes?, status?, className?, indicate?`. Presentational murni. |
| `FE: components/molecules/statistic/conversations/ConversationsSection.tsx:120` | Card diisi 3 hook: `useFetchConversationTotalMetrics` / `...ReplyMetrics` / `...ScreenshotMetrics`. Return type = count-only objects. |
| `FE: services/statistic/conversationsStatistic.service.ts:13-73` | 3 hook → 3 endpoint GET: `/analytics/conversation/total-metrics`, `/analytics/conversation/reply-metrics`, `/analytics/conversation/screenshot-metrics`. Return **number only** (`data.repliedConversations: number`, dst). **Tidak ada conversation ID / list.** |
| `FE: stores/conversation/conversationFilter.store.ts:1-62` | Zustand store expose **4 field saja**: `status, read, sort, search`. Persisted (localStorage) = `sort` saja. **Bukan URL-driven. Tidak ada date-range, agent, team, channel.** |
| `FE: stores/conversation/conversationAdvancedFilter.store.ts:1-86` | Advanced filter: `selectedAgents: string[]`, `selectedTags: string[]`. Toggle-based. **Tidak ada date-range, replied, screenshot.** |
| `FE: hooks/useAnalyticsAccessMode.ts:1-93` | RBAC → `AnalyticsAccessMode`: `all` / `team` / `assigned_only` / `all_except_team`. `isSelfOnly = (mode === 'assigned_only')`. `selfUserId` from session. |
| `FE: types/conversation` / BE proto `libs/proto-types/src/lib/conversation.ts:202-229` | `ConversationFilter` proto **sudah support**: `search, isFavorite, isSpam, status, statusRead, channel, platform, tags[], participants[], assign, isGroup, startDate?, endDate?, team?, accountChannel?, clientContact?, hideEmpty?, isJunked?, properties{}, assignmentStatus?`. **Tidak ada** `replied`, `screenshot`, `replyCount`. |
| `BE: conversation-service/.../conversation.repository.ts:2604-2810` | `buildConversationFilters()` memetakan proto filter → Mongo query. Support: status, statusRead, assign/unassign, date-range (createdAt), channel/platform, team, tags, participants, favorite, spam, junk, accountChannel, clientContact, properties. **Tidak ada** replied/screenshot/replyCount filter. |
| `BE: analytics-service/.../conversation-metrics.service.ts:42-86` | `getConversationTotalMetrics()` → aggregate `conversationdailymetrics` collection. `$sum` over `counts.total/closed/open/unassigned`. Return `{total, totalClosed, totalOpen, totalUnassigned}`. **Count-only, no IDs.** |
| `BE: analytics-service/.../conversation-metrics.service.ts:88+` | Reply metrics & screenshot metrics = pola sama: aggregate `conversationdailymetrics`, return counts. |
| `BE: api-gateway/.../analytics.controller.ts:1-100` | 6 endpoint GET: `total-metrics`, `by-platform`, `daily`, `reply-metrics`, `screenshot-metrics`, `reply-by-time`. Semua → gRPC `ConversationAnalyticsService`. Input: `FilterConversationMetricDto` (startDate, endDate, teamId, agentId). |
| `BE: api-gateway/.../analytics-scope.util.ts:1-65` | `isSelfOnlyScope()` + `resolveAgentId()` + `resolveTeamId()`. Guard scope enforcement. **Dependency untuk drill-down RBAC.** |
| `BE: conversation.controller.ts:191` | Conversation list di-guard `ConversationPermission.READ` (permission axis **berbeda** dari `statistic:read_own`). |

**Dua fakta yang menentukan desain:**

1. **Metric = agregat tanpa ID.** Klik card tidak bisa langsung "punya" 10 conversation itu. Harus ada query ulang yang **mereproduksi definisi metric** sebagai filter conversation-list, ATAU endpoint drill baru yang mengembalikan ID/list.
2. **Metric di-scope date-range; conversation store tidak.** Statistic filter membawa rentang tanggal (via `useStatisticFilter`). Conversation list default tidak punya date-range di store-nya. Jadi bahkan card yang "mudah" (open/closed) **tidak akan menghasilkan tepat N** kecuali drill-down ikut membawa jendela tanggal statistic ke query conversation.

### 2.2 Mismatch Per KPI Card (Masalah Keras)

Analisa per-card: mana yang bisa drill-down bersih, mana yang butuh BE baru.

| # | KPI Card | Definisi Metric | Filter conversation-list yang cocok | Bisa drill bersih? | Rute |
|---|---|---|---|---|---|
| 1 | **TOTAL_CONVERSATIONS** | Semua conversation dalam window tanggal | `startDate/endDate` | ⚠️ Butuh date-range dibawa ke store | Navigate (a) |
| 2 | **OPEN_CONVERSATIONS** | status=open dalam window | `status=open` + `startDate/endDate` | ⚠️ Sama — date-range | Navigate (a) |
| 3 | **CLOSED_CONVERSATIONS** | status=closed dalam window | `status=closed` + `startDate/endDate` | ⚠️ Sama — date-range | Navigate (a) |
| 4 | **UNASSIGNED_CONVERSATIONS** | belum di-assign | `assign=false` + `startDate/endDate` | ⚠️ Sama — date-range | Navigate (a) |
| 5 | **REPLIED_CONVERSATIONS** | conversation yang sudah dibalas agent dalam window | **TIDAK ADA** filter `replied` di list DTO/proto | ❌ Butuh filter BE baru / endpoint drill | Modal (b) |
| 6 | **TOTAL_REPLY_SENT** | jumlah pesan balasan (bukan conversation) | — (count message, bukan conversation) | ❌ **Bukan "list of conversations"** | Non-clickable |
| 7 | **TOTAL_SCREENSHOTS** | jumlah screenshot | — | ❌ Bukan conversation list | Non-clickable |
| 8 | **CLOSED_WITH_SCREENSHOT** | close + ada screenshot | **TIDAK ADA** filter `screenshot` di list DTO/proto | ❌ Butuh filter BE baru | Modal (b) |

**Card #5 (REPLIED_CONVERSATIONS) = contoh PM, justru paling sulit.** Tidak ada filter `replied`/`repliedBy`/`hasReply` di proto `ConversationFilter` maupun di `buildConversationFilters()`. Untuk mendrill tepat, butuh salah satu:
- **(A)** Tambah filter `replied=true` di `ConversationFilter` proto + `buildConversationFilters()` + FE store.
- **(B)** Endpoint drill statistic: input = filter statistic (date-range, self-scope, metric key), output = paginated conversationId/list. Reuse query agregat existing, ganti proyeksi `count()` → list.

**Card #6 & #7 bukan conversation list sama sekali** — `TOTAL_REPLY_SENT` = count message, `TOTAL_SCREENSHOTS` = count screenshot. Drill-down ke conversation semantik janggal. Kalau perlu drill, itu domain berbeda (message list / screenshot list). Jangan dipaksa.

**Konsistensi angka:**
- Opsi (A) berisiko **drift** — definisi `replied` di metric aggregate mungkin beda dari filter baru di conversation list.
- Opsi (B) menjamin **angka konsisten** — query drill = query count, hanya beda proyeksi (return IDs, bukan count()).

### 2.3 Detail Gap List: BE + FE Work

#### 2.3.1 BE Work

| ID | Gap | Scope | Dependency |
|---|---|---|---|
| B-1 | **Drill endpoint baru** per-metric family (conversation-level only) | New gRPC method di `analytics.proto` + handler di `analytics-service` + REST di `api-gateway`. Input: `FilterConversationMetricDto` + `metricKey` enum. Output: paginated conversationId list. | Guard fix v1.5 (GAP-1/2) landing first. |
| B-2 | **Scope enforcement** drill endpoint | Pakai `isSelfOnlyScope()` + `resolveAgentId()` (reuse `analytics-scope.util.ts`). Drill untuk agent READ_OWN = self-scoped only. | v1.5 guard fix. |
| B-3 | **`ConversationPermission.READ` alignment** | Conversation list di-guard `ConversationPermission.READ` (permission axis berbeda dari `statistic:read_own`). Drill endpoint yang return conversation ID → user bisa klik → conversation detail. Pastikan agent punya `conversation:read` (biasanya ya, tapi verify). | Verify existing. |
| B-4 | (Opsional) Filter `replied` di conversation query | Kalau pilih opsi (A) modal: tambah field `replied?: boolean` di `ConversationFilter` proto + mapping di `buildConversationFilters()` (query: message count > 0 atau `lastReplyAt` exists). | Standalone. |
| B-5 | (Opsional) Filter `hasScreenshot` | Sama seperti B-4 tapi untuk screenshot. `closedConversationsWithScreenshot` butuh cross-ref ke `screenshot` collection. | Standalone, lebih kompleks. |

#### 2.3.2 FE Work

| ID | Gap | Scope | Dependency |
|---|---|---|---|
| F-1 | **StatisticCard clickable** | Tambah `onClick?` prop, `cursor-pointer` + `hover:bg-slate-100` + `aria-label` saat interaktif. Jangan bikin semua card kelihatan bisa diklik — hanya yang punya drill. | Standalone. |
| F-2 | **Modal component** | Conversation list modal di statistic page. Bisa reuse row rendering conversation existing (`ConversationItem`). Pagination via `infinite scroll` atau `load more`. | B-1 (drill endpoint). |
| F-3 | **Date-range propagation ke conversation store** | Untuk card yang pakai navigate (a): extend `conversationFilter.store` dengan `startDate/endDate` field, ATAU hydrate via URL params. | Prasyarat untuk navigate path. |
| F-4 | **Metric key → drill routing** | Wiring per-card: card #5 → drill endpoint `replied`, card #8 → drill endpoint `closed-with-screenshot`, card #1-4 → navigate + filter. | F-1, B-1. |
| F-5 | **StatisticFilter → drill context** | Saat modal dibuka, drill context harus pakai filter yang sama dengan statistic page (date-range, self-scope). Bisa pass via props / context. | B-1. |

### 2.4 RBAC / Scope Interaction

#### 2.4.1 Scope Enforcement

Untuk agent (`READ_OWN`), drill-down **wajib self-scoped** — klik tidak boleh membocorkan conversation agent lain.

- **Drill endpoint (modal path):** wajib lewat `isSelfOnlyScope()` / `resolveAgentId()` yang sama (`analytics-scope.util.ts`). Sama dengan guard fix yang sedang di-scope di brief v1.5. **Dependency: drill-down TIDAK boleh dibangun sebelum GAP-1/GAP-2 dari brief v1.5 landing.**

- **Navigate path:** relatif aman — conversation list di-guard `ConversationPermission.READ` dan conversation domain sudah self-scope via `role.code + userId` (`buildGetConversationPayload`). Tapi ini **permission axis berbeda** dari `statistic:read_own`.

#### 2.4.2 Permission Axis Mismatch

| Permission | Axis | Covers |
|---|---|---|
| `statistic:read_own` | Analytics/statistic scope | Lihat statistic pribadi |
| `conversation:read` | Conversation domain | Lihat conversation list |

Kedua permission independen. Agent yang punya `statistic:read_own` belum tentu punya `conversation:read` (walaupun secara default seed biasanya ya). **Verify:** cek `default-permission.constant.ts` block AGENT — apakah include `conversation:read`?

**Implikasi:** Drill-down dari statistic → conversation list hanya works kalau agent punya kedua permission. Kalau navigate ke conversation list dan agent tidak punya `conversation:read` → 403 di conversation page, bukan leak tapi UX buruk ("klik 10, muncul 403").

**Mitigasi:** Drill endpoint modal path tidak perlu `conversation:read` karena return data langsung di modal. Navigate path perlu verify.

#### 2.4.3 Guard Fix Dependency Chain

```
ver2.8.1 guard fix (brief v1.5)
  ↓ GAP-1: PermissionsGuard di 5 controller
  ↓ GAP-2: isSelfOnlyScope() logic fix
  ↓ GAP-5: export gate READ→EXPORT
  ↓ backfill statistic:read_own
  ↓ LANDING
  ↓
drill-down feature (brief baru)
  ↓ B-2: reuse isSelfOnlyScope() + resolveAgentId()
  ↓ Guard fix HARUS sudah aman di prod sebelum drill endpoint di-deploy
  ↓ Bangun di atas fondasi yang belum aman = memperluas blast radius data leak
```

### 2.5 Navigate-with-Filter vs Modal: Trade-offs

| Aspek | (a) Navigate + filter conversation page | (b) Modal di statistic |
|---|---|---|
| **Reuse** | Reuse halaman + list + row rendering existing | Butuh list component baru di dalam modal |
| **Konsistensi angka** | ⚠️ Risiko drift (list scope ≠ metric scope, date-range gap) | ✅ Konsisten (drill endpoint = query metric) |
| **Store impact** | Butuh extend `conversationFilter.store` (tambah date-range) atau URL param hydration | Tidak menyentuh store conversation |
| **Agent context** | Keluar dari statistic, pindah konteks | Tetap di statistic, konteks utuh |
| **Effort** | M (store extend + URL hydration + mapping) | M–L (endpoint drill + modal + pagination) |
| **Risiko** | Angka tak match → bug report ("kok bukan 10?") | Lebih terkontrol |
| **Akses** | Butuh `conversation:read` permission (axis beda) | Hanya butuh `statistic:read_own` (sama axis) |
| **Deep-link** | ✅ Bisa share/bookmark URL conversation+filter | ❌ Modal tidak punya URL |

**Rekomendasi per-card:**

| Card | Rute | Alasan |
|---|---|---|
| #1-4 (total/open/closed/unassigned) | **(a) Navigate** | Filter sudah ada di conversation list (status, assign). Date-range = satu-satunya gap, solvable. |
| #5 (replied) | **(b) Modal** | Tidak ada filter `replied` di list. Navigate tanpa filter tepat = mismatch. |
| #8 (closed+ screenshot) | **(b) Modal** | Tidak ada filter `screenshot` di list. |
| #6-7 (reply sent / screenshot count) | **Non-clickable** | Bukan "list of conversations" — metric message/screenshot level. |

> **Catatan penting:** "tepat N" hanya terjamin kalau drill memakai **definisi + window yang sama** dengan metric. Navigate-with-filter yang cuma set `status` tanpa date-range akan menampilkan angka berbeda → bug report.

### 2.6 Effort Sizing & Phasing

| Fase | Isi | Sizing | Prasyarat |
|---|---|---|---|
| **Prasyarat** | Guard fix + isSelfOnlyScope fix + export fix + backfill (brief v1.5) landing di prod | Sudah di-scope ver2.8.1 | — |
| **Fase 1** | StatisticCard clickable (F-1) + extend conversationFilter.store date-range (F-3) + navigate-with-filter untuk 4 card bersih (#1-4) | **M** (1-2 sprint) | Prasyarat |
| **Fase 2** | Drill endpoint BE (B-1, B-2) + Modal component (F-2) + wiring card #5 REPLIED_CONVERSATIONS (F-4) | **M** (1-2 sprint) | Prasyarat |
| **Fase 3** | Drill card #8 CLOSED_WITH_SCREENSHOT (B-5, lebih kompleks — cross-ref screenshot collection) | **S–M** | Fase 2 |
| **Fase 4** (opsional/defer) | Metric message-level (#6 TOTAL_REPLY_SENT, #7 TOTAL_SCREENSHOTS) — beda domain, butuh drill ke message/screenshot list | **L** / defer | PM decision |

**Total effort:** M (Fase 1) + M (Fase 2) + S-M (Fase 3) = **~M-L total**. Fase 4 = terpisah / defer.

---

## 3. Interaksi dengan PRD Patch v1.0 (ver2.8.1)

### 3.1 Scope Boundary

PRD Patch v1.0 = **security-fix + backfill**:
- Guard 5 controller (4 analytics + broadcast)
- isSelfOnlyScope logic fix
- Export gate READ→EXPORT
- Backfill `statistic:read_own` ke role Agent existing

Scope Definition **eksplisit menaruh "Dashboard/halaman/endpoint baru" sebagai OUT OF SCOPE** (Brief v1.5 Section 4.2).

Kedua ide di sini = **additive improvement / net-new**, bukan bagian security-fix.

### 3.2 Routing Decision per Requirements-Lifecycle-Rule

Per `requirements-lifecycle-rule.md`: request yang **menambah behavior baru** → Phase 0 Change Intake **terpisah**, tidak boleh menumpang brief yang sedang di-freeze untuk rilis.

| Extension | Routing | Justifikasi |
|---|---|---|
| Mini dashboard | **DEFER** (Future Consideration) | YAGNI — `/statistic` self-filtered sudah cover. Tidak buka artifact baru sampai ada problem statement. |
| Drill-down | **NEW_CHANGE_INTAKE_BRIEF** terpisah (ROUTE_NEW_PRD) | Net-new scope (endpoint, modal, filter). Depend pada v1.5 guard fix landing. Jangan pollute brief security-fix. |

**Kedua ide dicatat di PRD v1.0 Section 17 (Future Considerations)** supaya jejaknya tidak hilang, TANPA menambah scope ver2.8.1.

### 3.3 Kenapa Tidak Fold ke Brief v1.5?

1. **Brief v1.5 = security-fix.** Scope sudah ditentukan (guard + logic + export + backfill). Tambah drill-down = scope creep.
2. **Timeline.** v1.5 target ver2.8.1 (17-28 Aug). Drill-down tidak bisa dimulai sebelum guard fix landing → dependency blocker.
3. **Per requirements-lifecycle-rule:** behavior baru = intake baru. Fold hanya kalau perubahan masih di dalam scope boundary yang sama — drill-down jelas tidak.

---

## 4. Open Questions untuk PM

| # | Question | Dampak Keputusan |
|---|---|---|
| Q-1 | Mini dashboard: problem konkret apa yang TIDAK terjawab halaman `/statistic` existing? Kalau tidak ada → drop. | YAGNI vs justified need |
| Q-2 | Drill-down: card mana yang WAJIB clickable? Rekomendasi mulai dari #1-4 (open/closed/unassigned/total) yang bersih. | Scope Fase 1 vs full |
| Q-3 | Card "replied" & "closed-with-screenshot": setuju butuh drill endpoint / filter BE baru? Prioritas? | Scope Fase 2-3 |
| Q-4 | Metric message-level (#6 reply sent, #7 screenshot count): perlu clickable? Kalau ya, drill ke apa (bukan conversation list)? | Fase 4 / defer |
| Q-5 | Navigate-with-filter vs modal: OK per-card (navigate utk yg bersih, modal utk yg butuh endpoint drill)? | Arsitektur |
| Q-6 | Timing: drill-down setelah ver2.8.1 guard fix landing (dependency), atau paralel (risk: guard belum aman)? | Dependency chain |
| Q-7 | Drill-down navigate path: pastikan agent punya `conversation:read` (verify default seed). Kalau tidak → modal-only approach. | Rute per-card |

---

## 5. Summary Block

```
[analyzer] summary:
- Mini dashboard = DEFER/YAGNI: halaman /statistic self-filtered (isSelfOnly) sudah jadi de-facto agent dashboard; bangun terpisah = duplikasi tanpa kebutuhan konkret.
- Drill-down layak TAPI KPI card diisi endpoint count agregat (tanpa ID) & tidak semua metric punya padanan filter conversation-list.
- Card contoh PM ("percakapan sudah dibalas") justru paling sulit: TIDAK ada filter `replied` di proto ConversationFilter maupun buildConversationFilters() → butuh drill endpoint atau filter BE baru.
- 4 card bersih (total/open/closed/unassigned) bisa drill via navigate+filter ASALKAN date-range dibawa (BE DTO support, Zustand store tidak expose saat ini); 2 card butuh drill endpoint (replied, closed+ss); 2 card bukan conversation list (reply sent, screenshot count).
- Drill-down DEPEND pada guard fix ver2.8.1 (isSelfOnlyScope/resolveAgentId) supaya agent tetap self-scoped — bangun sebelum guard landing = memperluas blast radius data leak.

Routing recommendation:
- Mini dashboard → DEFER (Future Consideration, tanpa artifact baru).
- Drill-down → NEW_CHANGE_INTAKE_BRIEF terpisah (ROUTE_NEW_PRD), depend pada v1.5 guard fix landing.
- Keduanya dicatat di PRD v1.0 Section 17 (Future Considerations) TANPA menambah scope ver2.8.1.
- Reason: keduanya net-new additive; PRD v1.0 eksplisit OUT OF SCOPE untuk "dashboard/halaman/endpoint baru"; per requirements-lifecycle-rule additive → Phase 0 terpisah.

Open questions for PM:
- Q-1: Problem konkret apa yang TIDAK terjawab /statistic existing? (kalau tidak ada → drop mini dashboard)
- Q-2: Card mana yang WAJIB clickable? (rekomendasi: mulai #1-4 yang bersih)
- Q-3: "Replied" & "closed-with-screenshot" — setuju butuh BE drill endpoint? Prioritas?
- Q-4: Metric message-level (reply sent, screenshot) — perlu clickable? drill ke apa?
- Q-5: Per-card approach OK? (navigate utk bersih, modal utk butuh endpoint drill)
- Q-6: Timing drill-down — setelah ver2.8.1 landing, atau paralel?
- Q-7: Verify agent punya conversation:read — kalau tidak, navigate path broken → modal-only.
```
