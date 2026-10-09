# Unique Inbound Clients per Channel — Sequence Diagrams

Companion diagram for [`trd/trd-analytics-unique-inbound-clients-per-channel.md`](../trd/trd-analytics-unique-inbound-clients-per-channel.md) (v1.2).

Two flows are specified: the **nightly write path** (cron → widened pre-filter → sidecar `$lookup` → bucketTs → hashed aggregation → daily rows → monthly rollup → cache invalidation) and the **dashboard read path** (FE → api-gateway → analytics-service → monthly collection).

> Revised in v1.2 for the OQ-04 rewrite: the conversation-service handler now widens the `createdAt` pre-filter by `UNIQUE_INBOUND_BUCKET_LOOKBACK_DAYS = 7`, runs a same-DB `$lookup` into `conversationslametrics` projecting only `firstCustomerMessageAt`, computes `bucketTs = firstCustomerMessageAt ?? createdAt` and re-matches on the exact WIB day before projecting identity fields. The HMAC output is truncated to **16 bytes and stored as BinData** (D-21) — the v1.1 diagram's 64-char hex digest is superseded. v1.1 changes retained: HMAC in conversation-service (D-17), monthly rollup (D-18), cache invalidation (D-20), audit emit (D-19), `enabled` field (F-12).

---

## 1. Nightly write path (01:00 WIB)

```mermaid
sequenceDiagram
    autonumber
    participant CRON as analytics-service<br/>AggregationSchedulerService
    participant RMQ as RabbitMQ
    participant CONV as conversation-service<br/>ConversationAggregationService
    participant CDB as MongoDB<br/>conversations +<br/>conversationslametrics
    participant ADB as MongoDB<br/>unique inbound collections
    participant REDIS as Redis Cache

    Note over CRON: Cron 01:00 WIB — aggregates yesterday AND today
    CRON->>CRON: Feature gate:<br/>UNIQUE_INBOUND_CLIENTS_ENABLED

    alt Gate disabled
        CRON-->>CRON: Skip — no aggregation, no writes
    else Gate enabled
        loop For each organization batch
            CRON->>RMQ: ANALYTICS_AGGREGATE_UNIQUE_INBOUND_BATCH<br/>(companyId, organizationId, utcDateString)
            RMQ->>CONV: Deliver message
            activate CONV

            Note over CONV: UTC date string is interpreted as a WIB day<br/>(F-10 contract — see TRD 4.3)
            CONV->>CONV: fromZonedTime(date, 'Asia/Jakarta')<br/>to WIB day boundaries

            CONV->>CDB: aggregate([$match widened createdAt window,<br/>$limit, $lookup conversationslametrics,<br/>$addFields bucketTs, $match exact WIB day,<br/>$project, $group])
            activate CDB
            Note over CDB: Widened window = dayStart - 7d (OQ-04)<br/>$lookup projects firstCustomerMessageAt ONLY<br/>bucketTs = fCMA ?? createdAt (D-02)<br/>$project narrows to identity fields<br/>BEFORE $group (F-03)
            CDB-->>CONV: [{channelCode, contacts[]}]
            deactivate CDB

            alt $limit cap reached
                CONV->>CONV: log.warn unique-inbound.batch.truncated<br/>(count is a floor — F-05)
            end

            CONV->>CONV: deriveIdentityKey() per contact<br/>(normalize phone / email / referenceId)
            CONV->>CONV: crypto.createHmac('sha256',<br/>ANALYTICS_HMAC_SECRET)<br/>.update(companyId + ':' + key)<br/>.digest().subarray(0, 16)<br/>(NOT CryptoService.generateHmac — D-21)

            Note over CONV,RMQ: Only 16-byte digests leave this service —<br/>no raw PII crosses RMQ (D-17)
            CONV-->>RMQ: IUniqueInboundBatchResult<br/>(identityHashes: Buffer[], 16 bytes each)
            deactivate CONV
            RMQ-->>CRON: Deliver reply

            CRON->>CRON: Buffer.from(item.data) per hash<br/>(reconstruct from JSON wire shape)
            CRON->>ADB: bulkUpsert daily rows<br/>($addToSet identityHashes as BinData)
            CRON->>ADB: rollupMonth — recompute $setUnion<br/>into monthly collection (D-18)
            ADB-->>CRON: ok

            CRON->>REDIS: DEL summary key for {companyId, orgId, month}
            Note over CRON,REDIS: D-20 — first read after the cron<br/>is fresh, not up to an hour stale
        end
        CRON->>CRON: log unique-inbound.monthly-rollup.completed
    end
```

---

## 2. Dashboard read path

```mermaid
sequenceDiagram
    autonumber
    participant FE as Frontend<br/>(UniqueInboundClientsSection)
    participant GW as api-gateway<br/>(UniqueInboundClientsController)
    participant ANA as analytics-service<br/>(UniqueInboundClientsService)
    participant REDIS as Redis Cache
    participant MDB as MongoDB<br/>uniqueinboundclientmonthlymetrics
    participant AUD as audit-service

    FE->>GW: GET /analytics/unique-inbound-clients/summary<br/>(Bearer token)
    activate GW

    GW->>GW: JwtAuthGuard — validate token
    GW->>GW: PermissionsGuard — require<br/>StatisticPermission.ALL or wildcard

    alt Permission denied (READ / READ_TEAM / READ_OWN / none)
        GW-->>FE: 403 Forbidden
        Note over GW,FE: SALES holds no StatisticPermission at all (F-06) —<br/>denial ratified by Product (OQ-02)
    else Permission granted
        GW->>GW: Tenant from @RequestContext()<br/>— never from the client
        GW->>ANA: gRPC GetSummary(companyContext)
        activate ANA

        alt Backend feature gate disabled
            ANA-->>GW: enabled=false, channels=[]
            GW-->>FE: 200 { enabled: false }
            Note over FE: Renders the distinct "unavailable" state —<br/>never zeros (F-12)
        else Gate enabled
            ANA->>ANA: Compute current month boundaries (WIB)
            ANA->>REDIS: GET analytics:unique-inbound-clients:<br/>summary:{companyId}:{orgId}:{month}

            alt Cache hit
                REDIS-->>ANA: Cached response
            else Cache miss
                REDIS-->>ANA: null
                ANA->>MDB: find({companyId, orgId, year, month})<br/>project {channelCode, distinctCount}
                activate MDB
                Note over MDB: Index-only scan, <= 6 docs.<br/>No $setUnion, no $size (D-18)
                MDB-->>ANA: [{channelCode, distinctCount}]
                deactivate MDB
                ANA->>ANA: Build channels[], periodStart,<br/>periodEnd, lastUpdatedAt
                ANA->>REDIS: SET key (TTL: ONE_HOUR)
            end

            ANA-->>GW: UniqueInboundClientsSummaryResponse<br/>(enabled=true)
        end
        deactivate ANA

        GW-)AUD: emit analytics.unique_inbound_clients.read<br/>(fire-and-forget, D-19)
        Note over GW,AUD: Not awaited — an audit outage<br/>never fails the request
        GW-->>FE: 200 JSON response
    end
    deactivate GW

    FE->>FE: Render KPI cards + donut chart
    FE->>FE: Show AnalyticsLastUpdated freshness
```