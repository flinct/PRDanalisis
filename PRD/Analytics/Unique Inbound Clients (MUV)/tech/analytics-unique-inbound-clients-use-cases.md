# Unique Inbound Clients per Channel — Use Cases

Companion diagram for [`trd/trd-analytics-unique-inbound-clients-per-channel.md`](../trd/trd-analytics-unique-inbound-clients-per-channel.md) (v1.2).

Actors are RBAC scopes, not job titles: any role holding `StatisticPermission.ALL` or wildcard `*` can perform the use case. Phase 1 is **company-scoped, read-only, monthly summary** — the diagram reflects that scope.

> Revised in v1.2: the daily aggregation use case now includes the OQ-04 bucketing rule (`bucketTs = firstCustomerMessageAt ?? createdAt` via a same-DB `$lookup` into `conversationslametrics`, widened 7-day pre-filter), and the hash width is stated as 16-byte binary (D-21). The denial of `SUPERVISOR_SALES` and `SALES` is now a ratified product decision (OQ-02), not an open question. v1.1 changes retained: SALES removed from permitted actors (F-06), and the operator-facing use cases for monthly rollup, cache invalidation, audit logging and HMAC secret management (D-15/D-18/D-19/D-20).

```mermaid
flowchart LR
    ADM(["StatisticPermission.ALL or * holder<br/>(Admin / Super Admin / Supervisor)"])
    TEAM(["StatisticPermission.READ_TEAM holder"])
    SELF(["StatisticPermission.READ_OWN holder<br/>(Agent)"])
    SUPSALES(["StatisticPermission.READ holder<br/>(Supervisor Sales)"])
    SALESROLE(["SALES role<br/>(no StatisticPermission at all)"])
    OPS(["Platform / Ops engineer"])
    AUDITOR(["Compliance / Auditor"])
    GW(["api-gateway<br/>UniqueInboundClients controller"])
    ANA(["analytics-service<br/>UniqueInboundClients service"])
    CONV(["conversation-service<br/>aggregation handler"])
    AUD(["audit-service<br/>analytics access log"])

    U1(("Open Statistic page"))
    U2(("See Unique Inbound Clients nav entry"))
    U3(("View per-channel distinct client counts"))
    U4(("View donut chart distribution"))
    U5(("See last-updated freshness"))
    U6(("See empty state for zero channel"))
    U7(("Retry after fetch error"))
    U8(("Deny access for non-ALL scopes"))
    U9(("Daily cron aggregation"))
    U10(("RMQ batch pull from conversation-service"))
    U11(("Write daily hashed key sets"))
    U12(("Enable/disable via env var"))
    U13(("See 'feature unavailable' state"))
    U14(("Hash identities at the source"))
    U15(("Roll up month into monthly collection"))
    U16(("Invalidate summary cache after cron"))
    U17(("Record who read the summary"))
    U18(("Provision / rotate ANALYTICS_HMAC_SECRET"))
    U19(("Bucket by firstCustomerMessageAt<br/>via sidecar lookup (OQ-04)"))

    ADM --> U1
    ADM --> U2
    ADM --> U3
    ADM --> U4
    ADM --> U5
    ADM --> U6
    ADM --> U7
    ADM --> U13

    TEAM -.->|"denied 403"| U8
    SELF -.->|"denied 403"| U8
    SUPSALES -.->|"denied 403 (ratified OQ-02)"| U8
    SALESROLE -.->|"denied 403 (ratified OQ-02)"| U8

    U1 --> GW
    U2 --> GW
    U3 --> GW
    GW -->|"gRPC GetSummary"| ANA
    ANA -->|"Redis cache"| ANA
    ANA -->|"read monthly docs"| ANA
    GW -.->|"fire-and-forget"| U17
    U17 --> AUD
    AUDITOR --> U17

    OPS --> U12
    OPS --> U9
    OPS --> U18
    U12 --> U13
    U18 --> CONV
    U9 --> U10
    U10 --> CONV
    CONV --> U19
    U19 --> U14
    U14 -->|"return 16-byte hashed keys only"| ANA
    U10 --> U11
    U11 --> U15
    U15 --> U16
```