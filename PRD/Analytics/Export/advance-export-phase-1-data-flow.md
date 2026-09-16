# Advance Export Phase 1 — Data Flow

```mermaid
flowchart LR
    subgraph Sources[Domain source-of-truth databases]
      C[(conversation DB)]
      T[(ticket DB)]
      B[(broadcast DB)]
    end
    subgraph Domain[Domain services]
      CH[Conversation row handler]
      TH[Ticket row handler]
      BH[Broadcast row handler]
    end
    RMQ[(RabbitMQ request/reply)]
    PS[people-service\nGetClientContactByPhone per unique phone]
    S[analytics-service\nrow sync + backfill coordinator]
    DLQ[(analytics row-sync DLQ\n7-day TTL)]
    subgraph Analytics[satuinbox_analytics]
      CE[(conversationexportdata)]
      TE[(ticketexportdata)]
      BE[(broadcastexportdata)]
      CV[(exportdatacoverage)]
      CP[(sync checkpoint store\nTRD-level; not in PRD schema)]
    end
    Q[Phase 2 query builder]

    C-->CH-->RMQ
    T-->TH-->RMQ
    B-->BH-->RMQ
    S<-->RMQ
    S-. FR-013a only .->PS
    S-- conditional idempotent upsert -->CE
    S-- conditional idempotent upsert -->TE
    S-- conditional idempotent upsert -->BE
    S-- daily state/count/watermark -->CV
    S-- resumable cursor -->CP
    S-- after 3 failures -->DLQ
    Q-- coverage preflight -->CV
    Q-- tenant-scoped reads -->CE
    Q-- tenant-scoped reads -->TE
    Q-- tenant-scoped reads -->BE
```

Trust boundaries:
- Domain services alone read their operational databases.
- Analytics receives materialized rows over RabbitMQ; it never cross-reads a domain database.
- Every request, checkpoint, coverage document, and row carries `companyId` and `organizationId`.

---
_Diagram for PRD-A (Foundation) v2.3. Updated 2026-09-15: MessagePattern name → `ANALYTICS_AGGREGATE_*` (FR-013), people-service enrichment → per-phone `GetClientContactByPhone` (FR-013a, BE-verified). See PRD Revision History._
