# Inventory Parameter Statistic — Conversation & Ticket

> **Artifact Type:** Parameter/Metric Inventory (grounding untuk drill-down & PRD statistic)
> **Author / Owner:** Dany Christian
> **Product:** SatuInbox
> **Domain:** Analytics (Conversation + Ticket + Responsiveness + CSAT)
> **Date:** 2026-08-12
> **Status:** Draft — hasil verifikasi codebase langsung
> **Sumber verified:**
> - `apps/analytics-service/src/app/schemas/conversation-daily-metrics.schema.ts`
> - `apps/analytics-service/src/app/schemas/ticket-daily-metrics.schema.ts`
> - `apps/conversation-service/src/app/schemas/conversation.schema.ts`, `conversation-sla-metrics.schema.ts`
> - `apps/ticket-service/src/app/schemas/ticket.schema.ts`
> - `libs/common/src/lib/database/schemas/base-csat.schema.ts`
> - `apps/api-gateway/src/app/analytics/*` (endpoint yang sudah ada)
> - FE `apps/omnichannel/types/statistic.ts` (yang sudah tampil di UI)

---

## 0. Cara Baca Dokumen Ini

Tiga status per parameter:
- ✅ **SUDAH** — sudah dihitung & sudah tampil di statistic UI hari ini.
- 🟡 **BISA (cheap)** — datanya sudah ada di schema pre-aggregated / source, tinggal expose. Effort kecil.
- 🔵 **BISA (butuh compute)** — field sumber ada tapi belum diagregasi; butuh pipeline/aggregation baru. Effort sedang.

Statistic SatuInbox punya **2 lapisan**:
1. **Pre-aggregated daily metrics** (`conversationdailymetrics`, `ticketdailymetrics`) — dimensi: `companyId × organizationId × teamId × agentId × date`. Ini yang bikin metric cepat & bisa di-scope per-agent (relevan ke RBAC `read_own`).
2. **On-demand compute** (SLA metrics, CSAT) — dihitung dari collection sumber saat query.

> **Poin penting untuk drill-down (nyambung analisa sebelumnya):** semua di lapisan 1 adalah **COUNT/SUM agregat, tanpa menyimpan ID dokumen sumber**. Jadi metric apa pun yang mau di-drill ke daftar conversation/ticket aktual butuh query balik ke collection sumber — bukan sekadar baca daily-metrics.

---

## 1. CONVERSATION

### 1.1 Sudah dihitung & tampil (✅)

Sumber: `conversation-daily-metrics.schema.ts` + FE `ConversationsSection.tsx` / `types/statistic.ts`.

| Parameter | Field | Tipe | Section UI |
|---|---|---|---|
| Total conversation | `counts.total` | count | Conversation scoreboard |
| Open conversation | `counts.open` | count | Conversation scoreboard |
| Closed conversation | `counts.closed` | count | Conversation scoreboard |
| Unassigned conversation | `counts.unassigned` | count | Conversation scoreboard |
| Replied conversation | `replies.repliedConversations` | count | Conversation scoreboard |
| Total reply terkirim | `replies.totalRepliesSent` | count (msg) | Conversation scoreboard |
| Total screenshot | `screenshots.totalScreenshots` | count | Conversation scoreboard |
| Conversation dg screenshot | `screenshots.conversationsWithScreenshots` | count | Conversation scoreboard |
| Breakdown per channel/platform | `byPlatform[]` (count, platformId, platformName) | grup count | Donut "by channel" |
| Breakdown per tag | `byTag[]` (count, tagId, tagName) | grup count | Bar "per tags used" |
| Conversation by time | agregasi date bucket | time series | Bar "by time" |
| Reply by time | agregasi date bucket | time series | Line "reply by time" |

### 1.2 Bisa ditambah — data sudah ada (🟡)

Field ada di `conversation.schema.ts`, tinggal masuk pipeline agregasi harian:

| Parameter kandidat | Sumber field | Catatan |
|---|---|---|
| Conversation per **priority** | `conversation.priority` | Dimensi baru mirip `byTag`/`byPlatform`. |
| Spam count | `conversation.isSpam` | Count boolean. |
| Junked count | `conversation.isJunked` | Count boolean. |
| Group vs non-group | `conversation.isGroup` | Split count. |
| Resolved conversation | `conversation.resolvedAt` | Beda dari `closed`; perlu definisi. |
| Reopened conversation | event `conversation-event.schema` | Butuh baca event log, bukan snapshot. |
| Assigned (bukan unassigned) | `participants[]` non-empty | Komplemen `unassigned`. |

### 1.3 Responsiveness Conversation — SLA metrics (✅ sebagian, 🔵 sisanya)

Sumber: `conversation-sla-metrics.schema.ts`. Ini **timing metrics** per conversation, dihitung on-demand.

| Parameter | Field sumber | Status |
|---|---|---|
| FRT (First Response Time) | `frtMs` | ✅ tampil (AFRT di responsiveness summary) |
| RLT (Reply Latency Time) | `rltMs` | ✅ ada di schema, dipakai responsiveness |
| Wait time in queue | `waitTimeInQueueMs` | ✅ dipakai (wait time distribution) |
| TTC (Time To Close) | `ttcMs` | ✅ tampil (ATTC) |
| ART (Avg Response Time) | agregasi `rltMs` | ✅ responsiveness summary |
| SLA FRT success rate | `slaFrtSuccess` (boolean) | ✅ SLA breakdown (in/over SLA) |
| SLA TTC success rate | `ttcSnapshot*` + closed | ✅ SLA breakdown |
| Closed rate SLA | derived | ✅ SLA breakdown |
| FRT/TTC config vs actual gap | `frtSnapshotConfiguredMs`, `ttcSnapshotConfiguredMs` | 🔵 belum ditampilkan, bisa jadi "SLA target vs actual" |
| Pause/hold impact | `PausedInterval[]` (frt/ttc) | 🔵 belum diekspos; bisa "waktu SLA ter-pause" |
| Shift-hours variant semua di atas | `*ShiftHoursMs` field | 🔵 versi "jam kerja saja" — sudah ada di ticket, conversation bisa ikut |

FE display hari ini (`ResponsivenessSummaryData`): `avgResponseTime`, `avgFirstResponseTime`, `avgTimeToClose` + change % masing-masing. SLA breakdown (`SLAMetric`): `inSlaCount/Percent`, `overSlaCount/Percent` untuk FRT, TTC, closed-rate.

---

## 2. TICKET

### 2.1 Sudah dihitung & tampil (✅)

Sumber: `ticket-daily-metrics.schema.ts` + FE `TicketSummaryData`.

**Counts (`counts.*`):**

| Parameter | Field | UI |
|---|---|---|
| Total ticket | `counts.total` → `totalTicketing` | Ticket summary |
| Active / in-progress | `counts.active` → `totalTicketingInProgress` | Ticket summary |
| Closed / resolved | `counts.closed` → `totalTicketingResolved` | Ticket summary |
| Reopened | `counts.reopened` → `totalTicketingReOpen` | Ticket summary |
| Unresolved | `counts.unresolved` | tersedia |
| Unassigned | `counts.unassigned` → `totalUnassigned` | Ticket summary |
| Overdue SLA | `counts.overdueSla` → `totalTicketingOverDue` | Ticket summary |
| SLA met | `counts.slaMet` → `totalTicketingSlaAchieved` | Ticket summary |
| SLA achievement rate | derived (`slaMet/total`) → `totalTicketingSlaAchievementRate` | Ticket summary |
| One-touch resolution | `performance.oneTouchCount` → `totalTicketingOneTouch` | Ticket summary |

**Performance (`performance.*`) — raw untuk dihitung avg:**

| Parameter | Field raw | Derived |
|---|---|---|
| Avg First Response Time | `totalResponseTimeMs / totalTicketsWithFirstResponse` | AFRT ticket |
| Avg Time To Close | `totalTimeToCloseMs / closedCount` | ATTC ticket |
| Avg reply per ticket | `totalReplies / totalTicketsWithReplies` | avg reply |
| Reply/solve ratio harian | `replyMetrics[]` (date, ratio, replyCount, solvedCount) | Average reply chart |
| Versi shift-hours (jam kerja) | `*ShiftHoursMs`, `totalTicketsWithFirstResponseShiftHours` | FRT/TTC "jam kerja saja" |

**Distribusi & time bucket:**

| Parameter | Field | UI |
|---|---|---|
| FRT distribution | `frtDistribution[]` (bucket) | Ticket FRT distribution |
| FRT distribution (shift hours) | `frtDistributionShiftHours[]` | tersedia |
| Wait time distribution | `waitTimeDistribution[]` | Ticket wait-time distribution |
| Wait time (shift hours) | `waitTimeDistributionShiftHours[]` | tersedia |
| Ticket per jam | `hourly.hourCounts` (Map) | Ticket per-hour |
| Ticket per hari/minggu | `weekly.dayCounts` (Map) | Ticket per-week |

### 2.2 Bisa ditambah — field ada di source (🟡/🔵)

Sumber: `ticket.schema.ts`. Belum diagregasi ke daily-metrics.

| Parameter kandidat | Sumber field | Status |
|---|---|---|
| Breakdown per **priority** | `ticket.priority` (`TicketPriorityEnum`), `priorityWeight` | 🔵 belum ada dimensi priority di daily-metrics |
| Breakdown per **ticket type / category** | `ticket-type.schema.ts` | 🔵 butuh dimensi baru |
| Per-stage SLA (multi-stage) | `ticket.stages[].sla` (`StageSlaRuntime`: state RUNNING/PAUSED/MISSED) | 🔵 metrik per-stage belum ada di statistic |
| SLA paused/hold time | `TicketSlaState.paused`, `StageSlaRuntime` pause fields | 🔵 belum diekspos |
| Status-change velocity | `statusChangedAt`, `statusReason` (`StatusReasonEnum`) | 🔵 butuh event compute |
| Reopen reason breakdown | `reopenedAt`, `reopenedBy`, `statusReason` | 🔵 |
| First response due vs actual (breach detail) | `firstResponseDue`, `firstResponseAt`, `firstResponseTimeMs` | 🟡 sebagian sudah via SLA met/overdue |
| Breakdown per channel/platform | `ticket.platform`/`channelId` | 🔵 conversation sudah punya `byPlatform`, ticket belum |

---

## 3. CSAT (lintas Conversation & Ticket)

Sumber: `base-csat.schema.ts` + FE `CsatStatisticData`.

| Parameter | Field | Status |
|---|---|---|
| Avg CSAT | `rating` avg → `avgCsat` | ✅ |
| Good / bad count | derived → `goodCount`, `badCount` | ✅ |
| Total responses | `totalResponses` | ✅ |
| Total sent | `totalSent` | ✅ |
| Response rate | `totalResponses / totalSent` | ✅ (derived) |
| Trend over time | `trend[]` | ✅ |
| Distribution per rating | `distribution[]` | ✅ |
| Source split (conversation vs ticket) | `source` field, filter `CsatSource` | ✅ |
| Per channel/platform | `channelPlatformCode`, `channelId` | 🟡 field ada, breakdown belum tentu tampil |
| Per agent (assignees) | `assignees[]`, `lastHandledBy` | ✅ dipakai member performance & self-scope |
| Feedback text | `feedback` | ✅ (CSAT responses table) |

---

## 4. Member Performance (agregasi per agent — relevan ke agent statistic)

Sumber: FE `MemberPerformanceMetric`. Ini gabungan lintas domain per agent.

| Parameter | Field | Domain sumber |
|---|---|---|
| Avg CSAT per agent | `avgCsat` | CSAT |
| Avg reply time per agent | `avgReplyTime` | Conversation/Ticket SLA |
| Avg time-to-close per agent | `avgTimeToClose` | SLA |
| Closed conversation per agent | `closedConversations` | Conversation |
| Status online/offline/away | `status` | Presence |
| AUX / away breakdown | `auxSummaries[]`, `totalAwayMs`, `totalLoginMs` | Presence/AUX |

> Ini dimensi `agentId` di daily-metrics + presence. Inilah yang bikin "agent lihat statistik dirinya" mungkin — `read_own` tinggal filter `agentId = self`.

---

## 5. Ringkasan untuk Keputusan

**Yang sudah kaya & tampil:** conversation counts + reply + screenshot + channel/tag breakdown; ticket counts + SLA + performance + FRT/wait distribution + per-hour/week; responsiveness ART/FRT/TTC + SLA breakdown; CSAT lengkap; member performance per agent.

**Quick win kalau mau nambah (🟡, data sudah ada):**
- Conversation: priority / spam / junked / group split.
- CSAT: breakdown per channel.
- Ticket: expose `unresolved` (sudah dihitung, belum tentu tampil).

**Butuh compute baru (🔵, field sumber ada tapi belum diagregasi):**
- Dimensi **priority** & **ticket type/category** untuk ticket (paling sering diminta, tapi belum ada di daily-metrics).
- Per-stage SLA & pause/hold time (ticket multi-stage).
- Ticket breakdown per channel/platform (conversation sudah, ticket belum).
- Shift-hours variant untuk conversation (ticket sudah punya).

**Catatan drill-down (nyambung ke analisa extensions):** SEMUA angka di lapisan daily-metrics adalah agregat tanpa ID. Card mana pun yang mau di-klik → daftar aktual butuh query balik ke `conversation-service` / `ticket-service` dengan definisi + window yang sama. Metric turunan rasio (SLA rate, one-touch %, response rate) **tidak punya "daftar" natural** — jangan dibuat clickable.

---

## 6. Open Questions

- Mau inventory ini jadi basis **PRD statistic expansion** (nambah priority/type/channel breakdown), atau cuma referensi untuk drill-down?
- Priority breakdown ticket = kandidat paling diminta — prioritaskan?
- Shift-hours (jam kerja) untuk conversation: perlu, atau ticket saja cukup?
