# Advance Export Phase 1 — Pull Sync Sequence

```mermaid
sequenceDiagram
    autonumber
    participant C as Analytics row-sync cron
    participant R as RabbitMQ request/reply
    participant D as Domain row projection handler
    participant P as people-service gRPC
    participant A as Analytics projection service
    participant M as satuinbox_analytics
    participant Q as Row-sync DLQ

    C->>R: ANALYTICS_AGGREGATE_{DOMAIN} row-grain payload (request, pageToken, limit=500)
    R->>D: MessagePattern request
    D->>D: Repository query scoped by companyId + organizationId; updatedAt/id cursor
    D-->>R: rows[], nextPageToken, hasMore, snapshotHighWatermark
    R-->>C: row page
    alt broadcast recipient enrichment (FR-013a)
        C->>C: deduplicate recipientNumber values
        loop each unique phone (Promise.allSettled, parallel)
            C->>P: GetClientContactByPhone(tenant, phone)
            P-->>C: contact or not-found (unresolved -> null)
        end
    end
    loop each validated row
        C->>A: project(row, sourceUpdatedAt)
        A->>M: conditional upsert by tenant natural key where stored sourceUpdatedAt <= incoming
        M-->>A: inserted / updated / stale-no-op
    end
    A->>M: upsert exportdatacoverage day counters + lastSyncedAt
    alt transient page/projection failure
        C->>C: retry 1..3 with exponential backoff + jitter
        alt third attempt fails
            C->>Q: dead-letter request/page identity + redacted diagnostics
        end
    end
    C->>C: persist checkpoint only after page writes + coverage commit
```

Notes:
- Conversation, ticket, and broadcast use separate MessagePatterns and checkpoints.
- RabbitMQ is the row-sync transport. The only gRPC calls are the PRD FR-013a people-service broadcast-recipient enrichment exemption — one `GetClientContactByPhone` per unique phone (there is no batch-by-phones RPC; `broadcast-export.service.ts:262-289` de-dupes then fans out with `Promise.allSettled`).
- Cursor shape (`(sourceUpdatedAt, sourceId)` exclusive) and `snapshotHighWatermark` are illustrative TRD-level detail; the PRD mandates only a resumable per-domain checkpoint (FR-024) and last-writer-wins by `sourceUpdatedAt` (FR-017).

---
_Diagram for PRD-A (Foundation) v2.3. Updated 2026-09-15: MessagePattern name → `ANALYTICS_AGGREGATE_*` (FR-013), people-service enrichment → per-phone `GetClientContactByPhone` (FR-013a, BE-verified). See PRD Revision History._
