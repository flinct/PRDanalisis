# Analisis Arsitektur: Metric Storage di SatuInbox Analytics Service

> **Tanggal:** 2026-08-13
> **Scope:** Arsitektur penyimpanan metric analytics, data flow, collection structure, dan rekomendasi penambahan metric baru
> **Repo:** `omnichannel-satuinbox-be` (BE satuinbox)

---

## 1. Executive Summary

- **Metric data hidup di 5 collection pre-aggregated** (`conversationdailymetrics`, `ticketdailymetrics`, `responsivenessmetrics`, `agentperformancemetrics`, `broadcastdailymetrics`) di database analytics-service, **bukan** di database upstream service.
- **Cron job 3-hourly** (`AggregationSchedulerService`) mengorkestrasi aggregasi: mengirim RMQ batch request ke conversation-service/ticket-service/people-service/broadcast-service, lalu **menulis hasilnya** ke collection pre-aggregated milik analytics-service.
- **Dua code path** (feature flag `AGGREGATION_ENABLED`): pre-aggregated (baru) vs Redash (legacy). **CSAT dan SLA breakdown belum di-pre-aggregate** — masih hit upstream on-demand.
- **Risk burden upstream: LOW untuk query user** (karena baca dari collection sendiri), **MEDIUM saat cron** (setiap3jam,1-3RMQ call per active org-date, ada100ms delay antar batch).
- **Redis dipakai untuk:** distributed cron lock + gRPC response caching (10min-1hour TTL).
- **Untuk menambah metric baru (priority, spam, junked, group, channel, type):** perlu ubah schema collection, tambah field di aggregation pipeline upstream, dan perluas batch result interface. **Tidak perlu** buat collection baru — cukup extend yang sudah ada.

---

## 2. Arsitektur Saat Ini (Data Flow)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER QUERY PATH                              │
│                                                                      │
│  gRPC Client ──► Analytics Controller ──┬──► Pre-aggregated Service  │
│                 (@GrpcCacheable)        │    (baca collection sendiri)│
│                                         │                            │
│                                         └──► Redash Service (legacy) │
│                                              (query raw upstream DB) │
│                                                                      │
│  CSAT: ──► CsatMetricsService ──► RMQ ──► conversation-service       │
│                                         ──► ticket-service            │
│           (on-demand aggregation, NOT pre-aggregated)                │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    AGGREGATION PATH (setiap 3 jam)                   │
│                                                                      │
│  AggregationSchedulerService (@Cron EVERY_3_HOURS)                   │
│    │ Redis distributed lock (AGGREGATION_CRON_LOCK, 1h TTL)          │
│    │ buildAggregationDates() → [yesterday, today]                     │
│    │                                                                 │
│    ├──► RMQ → conversation-service                                    │
│    │    ANALYTICS_AGGREGATE_CONVERSATION_BATCH                        │
│    │    → runs $group on conversations collection                     │
│    │    → returns org/team/agent dimensions                           │
│    │    → ConversationDailyMetricsRepository.bulkUpsert()             │
│    │                                                                 │
│    ├──► RMQ → ticket-service                                          │
│    │    ANALYTICS_AGGREGATE_TICKET_BATCH                              │
│    │    → runs $group on tickets collection                           │
│    │    → returns org/team/agent + distributions                      │
│    │    → TicketDailyMetricsRepository.bulkUpsert()                   │
│    │    → ResponsivenessMetricsRepository.bulkUpsertTicket()          │
│    │                                                                 │
│    ├──► RMQ → people-service (x2) + conversation-service (x1)        │
│    │    ANALYTICS_AGGREGATE_RESPONSIVENESS_BATCH                      │
│    │    ANALYTICS_AGGREGATE_RESPONSIVENESS_PER_CONVERSATION           │
│    │    ANALYTICS_GET_CONVERSATION_METADATA_BATCH                     │
│    │    → application-level join (agent metrics + conv metadata)      │
│    │    → ResponsivenessMetricsRepository.bulkUpsertConversation()    │
│    │                                                                 │
│    ├──► RMQ → conversation-service                                    │
│    │    ANALYTICS_AGGREGATE_MEMBER_PERFORMANCE_BATCH                  │
│    │    → AgentPerformanceMetricsRepository.bulkUpsert()              │
│    │                                                                 │
│    └──► RMQ → broadcast-service                                       │
│         ANALYTICS_AGGREGATE_BROADCAST_BATCH                           │
│         → BroadcastDailyMetricsRepository.bulkUpsert()                │
│                                                                      │
│  Source: apps/analytics-service/src/app/services/                     │
│          aggregation-scheduler.service.ts (line 94: @Cron)            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Collection Inventory

### 3.1 `conversationdailymetrics`
| Aspect | Detail |
|--------|--------|
| **File** | `apps/analytics-service/src/app/schemas/conversation-daily-metrics.schema.ts` |
| **Collection** | `conversationdailymetrics` |
| **Dimension Key** | `{agentId, companyId, date, organizationId, teamId}` (unique compound index, line 133-136) |
| **Null = "all"** | `agentId=null` → all agents, `teamId=null` → all teams |
| **Fields** | `counts{total,open,closed,unassigned}`, `byPlatform[]`, `byTag[]`, `replies{repliedConversations,totalRepliesSent}`, `screenshots{conversationsWithScreenshots,totalScreenshots}` |
| **Writer** | `ConversationDailyMetricsRepository.bulkUpsert()` → `bulkWrite` ops |
| **Source** | conversation-service `ConversationAggregationService.aggregateBatchForDate()` |
| **RMQ Pattern** | `ANALYTICS_AGGREGATE_CONVERSATION_BATCH` |
| **Indexes** | Single: `companyId`, `date`, `organizationId`. Unique compound: `{agentId,companyId,date,organizationId,teamId}` |

### 3.2 `ticketdailymetrics`
| Aspect | Detail |
|--------|--------|
| **File** | `apps/analytics-service/src/app/schemas/ticket-daily-metrics.schema.ts` |
| **Collection** | `ticketdailymetrics` |
| **Dimension Key** | `{agentId, companyId, date, organizationId, teamId}` (unique compound index, line 191-194) |
| **Fields** | `counts{total,active,closed,unassigned,unresolved,reopened,overdueSla,slaMet}`, `performance{closedCount,oneTouchCount,totalReplies,...}`, `frtDistribution[]`, `waitTimeDistribution[]`, `frtDistributionShiftHours[]`, `waitTimeDistributionShiftHours[]`, `hourly{hourCounts}`, `weekly{dayCounts}`, `replyMetrics[]` |
| **Writer** | `TicketDailyMetricsRepository.bulkUpsert()` → `bulkWrite` ops |
| **Source** | ticket-service `TicketAggregationService.aggregateBatchForDate()` |
| **RMQ Pattern** | `ANALYTICS_AGGREGATE_TICKET_BATCH` |
| **Indexes** | Single: `companyId`, `date`, `organizationId`. Unique compound: `{agentId,companyId,date,organizationId,teamId}` |

### 3.3 `responsivenessmetrics`
| Aspect | Detail |
|--------|--------|
| **File** | `apps/analytics-service/src/app/schemas/responsiveness-metrics.schema.ts` |
| **Collection** | `responsivenessmetrics` |
| **Dimension Key** | `{agentId, companyId, date, metricType, organizationId, platformId, teamId}` (unique compound index, line 77-88) |
| **Model** | sum+count → weighted average. `avg = sum/count/1000` (ms → seconds) |
| **Metric Types** | `conversation_art`, `conversation_frt`, `conversation_ttc`, `ticket_art`, `ticket_frt`, `ticket_ttc` |
| **Null = "all"** | `agentId=null`, `teamId=null`, `platformId=null` = org-level aggregate |
| **Writers** | `ResponsivenessMetricsRepository.bulkUpsertConversation()` (from people-service data), `ResponsivenessMetricsRepository.bulkUpsertTicket()` (from ticket-service batch, piggyback on ticket aggregation) |
| **Sources** | people-service (`agentconversationmetrics` collection) + conversation-service (metadata) for conversations; ticket-service for tickets |

### 3.4 `agentperformancemetrics`
| Aspect | Detail |
|--------|--------|
| **File** | `apps/analytics-service/src/app/schemas/agent-performance-metrics.schema.ts` |
| **Collection** | `agentperformancemetrics` |
| **Dimension Key** | `{agentId, companyId, date, organizationId}` (unique compound index, line 111-114) |
| **Note** | Inherently per-agent — TIDAK ada "all" dimension (tidak seperti collection lain) |
| **Fields** | `conversations{avgReplyTime,avgTimeToClose,closedConversations,totalConversations,totalResponses}`, `tickets{avgReplyTime,avgTimeToClose,closedTickets,totalResponses,totalTickets}` |
| **Writer** | `AgentPerformanceMetricsRepository.bulkUpsert()` |
| **Source** | conversation-service `ConversationAggregationService.aggregateMemberPerformanceBatch()` |

### 3.5 `broadcastdailymetrics`
| Aspect | Detail |
|--------|--------|
| **File** | `apps/analytics-service/src/app/schemas/broadcast-daily-metrics.schema.ts` |
| **Collection** | `broadcastdailymetrics` |
| **Dimension Key** | `{accountChannelId, companyId, date, organizationId}` (unique compound index, line 66-69) |
| **Null = "all"** | `accountChannelId=null` → org-level aggregate |
| **Fields** | `counts{totalBroadcast,totalBroadcastCanceled,...}` (7 status counts) |
| **Writer** | `BroadcastDailyMetricsRepository.bulkUpsert()` |
| **Source** | broadcast-service |

---

## 4. Data Flow Detail: Dari Source ke Statistic Page

### 4.1 Pre-aggregated Path (Preferred — `AGGREGATION_ENABLED=true`)

```
User opens statistic page
  → gRPC call to analytics-service
    → @GrpcCacheable decorator checks Redis cache
      → Cache HIT: return cached response (TTL: 10min-1hr)
      → Cache MISS:
          → Controller checks isPreAggregationEnabled flag
            → TRUE: Calls *MetricsService (e.g., TicketMetricsService)
              → Reads from own pre-aggregated collection
              → Runs $match + $group aggregation on ~few hundred rows per org-date range
              → Returns result (fast: indexed pre-aggregated data)
            → FALSE: Calls legacy *AnalyticsService
              → Executes Redash queries against upstream raw collections
              → Returns result (slow: queries raw millions of rows)
```

### 4.2 Which Service Uses Which Path

| Metric Domain | Pre-aggregated Service | Legacy (Redash) Service | Live RMQ |
|---|---|---|---|
| **Conversation counts/platform/tags/replies** | `ConversationMetricsService` | `ConversationService` | — |
| **Ticket counts/performance/distributions** | `TicketMetricsService` | `TicketAnalyticsService` | — |
| **Responsiveness ART/FRT/TTC** | `ResponsivenessMetricsService` | `ResponsivenessAnalyticsService` (Redash fallback) | — |
| **Responsiveness SLA Breakdown** | ❌ **Tidak ada** | `ResponsivenessAnalyticsService.getResponsivenessSLABreakdown()` (selalu Redash, line 521-600) | — |
| **Member Performance** | `MemberMetricsService` (partly) | — | CSAT → ticket-service gRPC, AUX → people-service gRPC |
| **CSAT Stats** | ❌ **Tidak ada** | — | `CsatMetricsService` → RMQ ke conversation-service + ticket-service |
| **Broadcast** | `BroadcastMetricsService` | — | — |

### 4.3 Key Observation: Responsiveness Analytics Dual-Path

File: `apps/analytics-service/src/app/services/responsiveness-analytics.service.ts`

**PENTING:** Ada DUA service untuk responsiveness:
1. `ResponsivenessAnalyticsService` (line 91) — **LEGACY**, masih pakai Redash, digunakan oleh controller lama. Untuk `platformId` filter, coba direct RMQ dulu, fallback ke Redash.
2. `ResponsivenessMetricsService` (`services/metrics/responsiveness-metrics.service.ts`) — **BARU**, baca dari `responsivenessmetrics` collection.

SLA Breakdown (`getResponsivenessSLABreakdown`, line 521) **selalu** pakai Redash (queries 27/30). **Belum ada pre-aggregated equivalent.**

---

## 5. Load Analysis: Beban ke Upstream Services

### 5.1 Saat Cron Aggregation (setiap 3 jam)

| Upstream Service | RMQ Calls per Org-Date | Pipeline yang Dijalankan |
|---|---|---|
| **conversation-service** | 2 (conversation batch + member performance) | `$group` on `conversations` + `agentconversationmetrics` |
| **ticket-service** | 1 (ticket batch — termasuk ticket responsiveness) | `$group` on `tickets` |
| **people-service** | 2 (responsiveness batch + per-conversation) | `$group` on `agentconversationmetrics` |
| **broadcast-service** | 1 (broadcast batch) | `$group` on broadcasts |
| **conversation-service** (metadata) | 1 (for responsiveness join) | Query `conversations` for platformId/teamId |

**Total per org-date: ~7 RMQ calls**, masing-masing menjalankan MongoDB aggregation pipeline.

**Mitigasi yang ada:**
- `AGGREGATION_BATCH_DELAY_MS = 100ms` antar batch (line 47, 188-196)
- Date range pre-check: skip org-date yang di luar activity range (line 607-619)
- Hanya proses yesterday + today (line 341-347)
- Redis distributed lock prevents concurrent runs across pods (line 101-117)

### 5.2 Saat User Query

| Scenario | Upstream Load |
|---|---|
| **Pre-agg path** (conversation/ticket/responsiveness/broadcast) | **ZERO** — baca collection sendiri |
| **CSAT stats** | **Tinggi** — setiap query hit conversation-service + ticket-service via RMQ, mereka run aggregation on `csats` |
| **Member performance** | **Sedang** — baca pre-agg untuk performance, tapi CSAT + AUX live dari ticket/people service |
| **Responsiveness SLA** | **Sedang** — selalu Redash queries (27/30) |
| **Any gRPC with cache** | **Ditahan** oleh `@GrpcCacheable` (10min-1hr TTL) |

### 5.3 Risk Assessment

| Risk | Level | Alasan |
|---|---|---|
| User queries membebani conversation/ticket service | **LOW** | Pre-aggregated path reads own collections. Only CSAT hits upstream. |
| Cron aggregation membebani upstream | **MEDIUM** | 7 RMQ calls per org-date × N organizations × 2 dates = significant volume. Mitigated by delays and range checks. |
| CSAT queries membebani upstream | **HIGH** | No pre-aggregation. Every CSAT query runs aggregation pipelines on raw `csats` collections. |
| Adding new metrics to aggregation | **LOW** | Existing batch pattern is extensible — just add fields to batch result interface and schema. |

---

## 6. Indexing & Caching

### 6.1 Indexes

Semua collection punya:
1. **Compound unique index** pada dimension key (lihat Section3 di atas)
2. **Single field indexes** pada `companyId`, `date`, `organizationId`, `metricType` (where applicable)

Query pattern yang terpakai: `$match` pada `{companyId, organizationId, date range, teamId?, agentId?}` → compound unique index langsung cover.

### 6.2 Redis Caching

**Dua layer caching:**

1. **Aggregation Lock** (prevent double-run):
   - Key: `CacheKeyPrefixEnum.AGGREGATION_CRON_LOCK`
   - TTL: 1 hour
   - Type: `setNx` (distributed lock)
   - File: `aggregation-scheduler.service.ts`, line 102-110

2. **gRPC Response Cache**:
   - Decorator: `@GrpcCacheable` → metadata → `GrpcCacheInterceptor` → Redis
   - Key: prefix + dynamic keyFrom function (org+date+filters)
   - TTL by endpoint:
     - Ticket metrics: `CacheTTLEnum.ONE_HOUR` (ticket-analytics.controller.ts:75)
     - Responsiveness: `CacheTTLEnum.TEN_MINUTES`
     - Conversation: likely similar
   - Implementation: `libs/cache/src/lib/decorators/grpc-cacheable.decorator.ts`
   - Interceptor: `libs/cache/src/lib/interceptors/grpc-cache.interceptor.ts`

**Tidak ada application-level cache di service layer** — semua caching di controller level via decorator.

---

## 7. Problem Areas

### 7.1 Hybrid Architecture (Dual Code Path)
- Controller punya `isPreAggregationEnabled` flag check (e.g., `ticket-analytics.controller.ts:44-46`)
- Dua service: legacy (Redash-based) dan baru (pre-agg based)
- Meningkatkan complexity dan maintenance burden
- **File:** Semua controller di `apps/analytics-service/src/app/controllers/`

### 7.2 CSAT Tidak Pernah Di-Pre-Aggregate
- `CsatMetricsService` (`services/metrics/csat-metrics.service.ts`) selalu hit upstream via RMQ
- Setiap query CSAT →2 RMQ calls ke conversation-service + ticket-service
- Mereka run aggregation on raw `csats` collections on-the-fly
- **Tidak ada cron job yang pre-aggregate CSAT**

### 7.3 Responsiveness SLA Breakdown Selalu Redash
- `ResponsivenessAnalyticsService.getResponsivenessSLABreakdown()` (line 521-600)
- Selalu execute Redash queries 27 (conversation FRT SLA) dan 30 (ticket FRT SLA)
- **Tidak ada pre-aggregated equivalent** untuk SLA breakdown

### 7.4 Metric Dimension Tidak Lengkap untuk Kebutuhan Baru
**Conversation metrics saat ini track:**
- Counts: total, open, closed, unassigned
- Breakdown: byPlatform, byTag
- Reply metrics, screenshot metrics

**TIDAK ADA:** priority, spam, junked, group breakdown

**Ticket metrics saat ini track:**
- Counts: total, active, closed, unassigned, unresolved, reopened, overdueSla, slaMet
- Performance: response time, time to close, one-touch, FRT distribution
- Time: hourly, weekly

**TIDAK ADA:** priority, type (task/bug/etc), channel breakdown

---

## 8. Rekomendasi untuk Patch 2: Menambah Metric Baru

### 8.1 Strategi: Extend Bukan Baru

**JANGAN buat collection baru.** Extend collection yang sudah ada.

Alasan:
- Pattern dimension `{agentId, companyId, date, organizationId, teamId}` sudah proven
- Repository, schema, dan query service sudah ada — tinggal tambah field
- Backfill controller sudah support semua metric types
- Aggregation scheduler sudah punya pattern batch → extend batch interface

### 8.2 Conversation: Tambah priority, spam, junked, group

**Perubahan yang diperlukan:**

1. **Schema** (`conversation-daily-metrics.schema.ts`):
   ```typescript
   // Tambah embedded subdocument
   @Schema({ _id: false })
   export class ConversationBreakdown {
     @Prop({ default: 0, type: Number })
     count: number;
     
     @Prop({ required: true, type: String })
     value: string; // e.g., "high", "spam", "junked"
   }
   
   // Di ConversationDailyMetrics class, tambah:
   @Prop({ default: [], type: [ConversationBreakdownSchema] })
   byPriority: ConversationBreakdown[];
   
   @Prop({ default: 0, type: Number })
   spamCount: number;
   
   @Prop({ default: 0, type: Number })
   junkedCount: number;
   
   @Prop({ default: [], type: [ConversationBreakdownSchema] })
   byGroup: ConversationBreakdown[];
   ```

2. **Interface** (`interfaces/aggregation-scheduler.interface.ts`):
   - Tambah field di `IDimensionMetrics`, `IBatchResult`, `IAggregationResult`

3. **Upstream** (`conversation-service`):
   - `ConversationAggregationService.aggregateBatchForDate()` — extend pipeline untuk `$group` by priority, count spam/junked, group by group
   - Return field baru di batch result

4. **Repository** (`conversation-daily-metrics.repository.ts`):
   - `buildUpsertOp()` — tambah `$set` field baru

5. **Query Service** (`conversation-metrics.service.ts`):
   - Tambah method baru: `getConversationByPriority()`, `getConversationSpamJunked()`, `getConversationByGroup()`

6. **Controller** (`conversation.controller.ts`):
   - Tambah gRPC endpoint baru

7. **Proto** (`proto-types/analytics`):
   - Extend proto definition dengan request/response baru

8. **Backfill**: Reuse existing `backfill.controller.ts` — `BackfillMetricType.CONVERSATION` sudah cover

### 8.3 Ticket: Tambah priority, type, channel

**Perubahan yang diperlukan (sama pattern):**

1. **Schema** (`ticket-daily-metrics.schema.ts`):
   ```typescript
   @Prop({ default: [], type: [TicketBreakdownSchema] })
   byPriority: TicketBreakdown[];
   
   @Prop({ default: [], type: [TicketBreakdownSchema] })
   byType: TicketBreakdown[];
   
   @Prop({ default: [], type: [TicketBreakdownSchema] })
   byChannel: TicketBreakdown[];
   ```

2. **Interface** (`interfaces/ticket-aggregation.interface.ts`):
   - Tambah di `ITicketDimensionMetrics`, `ITicketBatchResult`

3. **Upstream** (`ticket-service`):
   - `TicketAggregationService.aggregateBatchForDate()` — extend pipeline

4. **Repository** (`ticket-daily-metrics.repository.ts`):
   - `buildUpsertOp()` — tambah field

5. **Query Service** (`ticket-metrics.service.ts`):
   - Tambah method: `getTicketByPriority()`, `getTicketByType()`, `getTicketByChannel()`

6. **Controller** (`ticket-analytics.controller.ts`):
   - Tambah gRPC endpoint

7. **Proto**: Extend definitions

### 8.4 Cost-Benefit Analysis per Metric Addition

| Komponen | Effort | File Count |
|---|---|---|
| Schema (embedded subdoc + field) | Low | 1 |
| Interface (batch result + upsert params) | Low | 1-2 |
| Upstream aggregation pipeline | Medium | 1 per upstream service |
| Repository (buildUpsertOp) | Low | 1 |
| Query service (new methods) | Low-Medium | 1 |
| Controller (new gRPC endpoint) | Low | 1 |
| Proto definition | Low | 1-2 |
| Backfill | **ZERO** (reuse existing) | 0 |
| Cache key | Low (add to controller decorator) | 1 |

**Total per metric dimension: ~6-8 files, mostly low-effort changes.**

### 8.5 Pattern yang Harus Diikuti

Untuk setiap metric baru, ikuti pattern yang sudah ada:

1. **Dimension key unchanged** — jangan ubah unique compound index. Tambah field sebagai embedded data.
2. **Backward compatible** — gunakan `default` values di schema supaya document lama tidak break.
3. **Batch aggregation** — selalu gunakan batch pattern (1 RMQ call per org-date), jangan single-dimension.
4. **Date range pre-check** — reuse `filterDatesByRange()` yang sudah ada.
5. **Feature flag** — baru metric diakses via controller yang sama, isPreAggregationEnabled check yang sama.
6. **@GrpcCacheable** — tambah caching di endpoint baru.

---

## 9. Rekomendasi untuk Optimal Metric Collection Structure

### 9.1 Struktur Saat Ini: GOOD

```
conversationdailymetrics  ← {agentId, companyId, date, organizationId, teamId}
ticketdailymetrics        ← {agentId, companyId, date, organizationId, teamId}
responsivenessmetrics     ← {agentId, companyId, date, metricType, organizationId, platformId, teamId}
agentperformancemetrics   ← {agentId, companyId, date, organizationId}
broadcastdailymetrics     ← {accountChannelId, companyId, date, organizationId}
```

**Struktur ini sudah optimal karena:**
- Daily granularity — cukup untuk trend analysis, tidak terlalu fine-grained
- Dimension key memungkinkan drill-down (org → team → agent)
- Embedded subdocuments menghindari lookup
- Unique compound index mencegah duplicate
- `$set` + `$inc:version` pattern memungkinkan idempotent re-aggregation

### 9.2 Yang Perlu Diperhatikan Saat Extend

1. **Jangan pecah collection per dimension.** Semua dimension (org/team/agent) dalam satu document per dimensi-key sudah benar.
2. **Embedded arrays vs scalar**: Gunakan embedded array untuk breakdown yang bisa punya N values (priority, platform, tag). Gunakan scalar untuk boolean-ish counts (spam, junked).
3. **Responsiveness metrics: sum+count model** — ini lebih fleksibel daripada storing pre-computed averages. Pertahankan pattern ini untuk metric baru.
4. **Version field** — `$inc:version` di setiap upsert memungkinkan debugging dan conflict detection.

### 9.3 Kapan Perlu Collection Baru

Buat collection baru HANYA jika:
- Granularity berbeda (bukan daily — misal hourly atau per-event)
- Dimension key berbeda secara fundamental
- Data source berbeda yang tidak bisa di-batch dengan yang existing

Untuk kasus penambahan breakdown dimension (priority, type, channel), **extend yang ada** — jangan buat baru.

---

## 10. Appendix: File Reference

| Komponen | Path (relative to `apps/analytics-service/src/app/`) |
|---|---|
| Schema: conversation | `schemas/conversation-daily-metrics.schema.ts` |
| Schema: ticket | `schemas/ticket-daily-metrics.schema.ts` |
| Schema: responsiveness | `schemas/responsiveness-metrics.schema.ts` |
| Schema: agent performance | `schemas/agent-performance-metrics.schema.ts` |
| Schema: broadcast | `schemas/broadcast-daily-metrics.schema.ts` |
| Service: conversation query | `services/metrics/conversation-metrics.service.ts` |
| Service: ticket query | `services/metrics/ticket-metrics.service.ts` |
| Service: responsiveness query | `services/metrics/responsiveness-metrics.service.ts` |
| Service: member query | `services/metrics/member-metrics.service.ts` |
| Service: CSAT query (live) | `services/metrics/csat-metrics.service.ts` |
| Service: broadcast query | `services/metrics/broadcast-metrics.service.ts` |
| Service: aggregation scheduler | `services/aggregation-scheduler.service.ts` |
| Service: responsiveness (legacy/Redash) | `services/responsiveness-analytics.service.ts` |
| Service: ticket (legacy/Redash) | `services/ticket-analytics.service.ts` |
| Controller: conversation | `controllers/conversation.controller.ts` |
| Controller: ticket | `controllers/ticket-analytics.controller.ts` |
| Controller: responsiveness | `controllers/responsiveness-analytics.controller.ts` |
| Controller: member | `controllers/member-analytics.controller.ts` |
| Controller: broadcast | `controllers/broadcast-analytics.controller.ts` |
| Controller: backfill | `controllers/backfill.controller.ts` |
| Repository: conversation | `repositories/conversation-daily-metrics.repository.ts` |
| Repository: ticket | `repositories/ticket-daily-metrics.repository.ts` |
| Repository: responsiveness | `repositories/responsiveness-metrics.repository.ts` |
| Repository: agent performance | `repositories/agent-performance-metrics.repository.ts` |
| Repository: broadcast | `repositories/broadcast-daily-metrics.repository.ts` |
| Interface: aggregation | `interfaces/aggregation-scheduler.interface.ts` |
| Interface: ticket aggregation | `interfaces/ticket-aggregation.interface.ts` |
| Interface: member performance | `interfaces/member-performance-aggregation.interface.ts` |
| Cache decorator | `libs/cache/src/lib/decorators/grpc-cacheable.decorator.ts` |
| Cache interceptor | `libs/cache/src/lib/interceptors/grpc-cache.interceptor.ts` |

**Upstream aggregation handlers:**
| Service | Path |
|---|---|
| Conversation aggregation | `apps/conversation-service/src/app/controllers/conversation-aggregation.controller.ts` |
| Ticket aggregation | `apps/ticket-service/src/app/controllers/ticket-aggregation.controller.ts` |
