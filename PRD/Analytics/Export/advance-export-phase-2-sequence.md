# Advance Export Phase 2 — Configurable Export Sequence

Two sequences: (A) column-picker load + configurable job submission, and
(B) analytics-owned configurable job processing. HTTP surface is unchanged
(`GET/POST /analytics/export-report`,
`apps/api-gateway/src/app/analytics/export-report-job.controller.ts:53,91,138,188,230`);
the new work is a gRPC `GetColumnRegistry` RPC plus configurable-path branches.

## A. Picker load and job submission

```mermaid
sequenceDiagram
    autonumber
    participant FE as omnichannel picker UI
    participant GW as api-gateway
    participant AS as analytics-service
    participant REG as exportcolumnregistry
    participant CACHE as Redis 5-min TTL
    participant COV as exportdatacoverage
    participant JOB as offlinereportjobs
    participant MQ as RabbitMQ configurable queue

    Note over FE: user selects domain (Tipe Laporan)
    FE->>GW: GET /analytics/export-report/columns?domainId=ticket&granularity=recipient
    GW->>AS: gRPC GetColumnRegistry(domainId, granularity, userContext)
    AS->>CACHE: get registry key for domainId + granularity
    alt cache hit
        CACHE-->>AS: grouped columns
    else cache miss
        AS->>REG: find domainId + granularity + isActive true, sort category then sortWeight
        REG-->>AS: active column docs plus registryVersion
        AS->>CACHE: set registry key, ttl 300s
    end
    AS-->>GW: columns grouped by category plus registryVersion
    GW-->>FE: 200 registry payload
    Note over FE: FE loads Default preset or localStorage selection,<br/>auto-removes deactivated columns (US-013)

    Note over FE: user picks columns and filters, then submits
    alt any selected column isPII and not yet acknowledged
        FE->>FE: show PII confirmation dialog (FR-047)
        Note over FE: cancel keeps selection and blocks submit (EH-006)
    end
    FE->>GW: POST /analytics/export-report with channel and parameters columns, filters, piiAcknowledged
    GW->>GW: per-domain params DTO validate (whitelist, forbidNonWhitelisted)
    GW->>AS: gRPC CreateReportJob(channel, parameters Struct, userContext)
    AS->>REG: load snapshot for requested columns, validate exists and active
    alt invalid or inactive column
        AS-->>GW: Grpc error COLUMN_INVALID or COLUMN_INACTIVE
        GW-->>FE: 400 (EH-002 / EH-003)
    end
    AS->>AS: resolve row scope from StatisticPermission, reject INVALID_SCOPE (EH-011)
    AS->>COV: assertExportDataCoverage(tenant, collection, range, now)
    alt not ready or expired
        COV-->>AS: DATA_NOT_READY or DATA_EXPIRED
        AS-->>GW: Grpc error (EH-009 / EH-010)
        GW-->>FE: 400
    end
    COV-->>AS: ready
    AS->>JOB: insert job QUEUED with columnSnapshot, registryVersion, rowScope, piiAck
    AS->>MQ: emit EXPORT_REPORT_JOB_PROCESS with jobId
    AS->>MQ: emit EXPORT_REPORT_JOB_EXPIRE with jobId, delay 7d
    AS-->>GW: common.Success
    GW-->>FE: 201, FE invalidates the export-history query key
```

## B. Configurable job processing

```mermaid
sequenceDiagram
    autonumber
    participant MQ as RabbitMQ configurable queue
    participant GEN as analytics configurable generator
    participant JOB as offlinereportjobs
    participant REG as exportcolumnregistry
    participant COV as exportdatacoverage
    participant ROW as domain exportdata collection
    participant S3 as AWS S3
    participant AS as ExportReportJobService

    MQ->>GEN: EXPORT_REPORT_JOB_PROCESS with jobId
    GEN->>JOB: load job and assert status QUEUED
    GEN->>AS: EXPORT_REPORT_JOB_PROGRESS, status PROCESSING
    GEN->>REG: re-validate columnSnapshot against live registry (NFR-006)
    Note over GEN: inactive columns dropped into skippedColumns (EH-015)
    GEN->>COV: re-assert coverage for range
    GEN->>ROW: aggregate match tenant, match rowScope, match filters,<br/>sort createdAt -1, limit 20001, project selected plus internal
    ROW-->>GEN: cursor (batchSize 2000, maxTimeMS 30000)
    alt rowCount over 20000
        GEN->>AS: EXPORT_REPORT_JOB_RESULT ok false, reason ROW_CAP_EXCEEDED (EH-007)
        AS->>JOB: FAILED
    else within cap
        loop each row
            GEN->>GEN: format by dataType, objectId to name (FR-028a),<br/>object to JSON string, null to dash, mask PII by field shape (FR-061)
        end
        GEN->>GEN: write workbook, header = snapshot displayName in request order (FR-030)
        GEN->>S3: uploadExportFileToS3(buffer)
        S3-->>GEN: fileUrl
        GEN->>AS: EXPORT_REPORT_JOB_RESULT ok true with fileResult, rowCount, columnCount, skippedColumns
        AS->>JOB: COMPLETED, expiresAt = now + 7d
    end
```

Notes:

- The generator reads the Phase-1 analytics collections directly (epic D5, PRD
  §20.7). It never fans out to ticket/conversation/broadcast-service and never
  cross-reads a domain operational DB (backend-architecture rule).
- The sole cross-service call anywhere in the export path is Phase-1's
  people-service recipient-name enrichment during sync — not in Phase-2's read
  path.
- Masking is **field-shape and per-permission**: `privacy:view_full_phone` and
  `privacy:view_full_email` are evaluated independently (FR-061, TRD TD8), which
  supersedes the legacy composite OR-check in the shipped processors
  (`apps/ticket-service/src/app/processors/export-job.processor.ts:79-81`).
  Name/free-text PII columns are never run through `maskPhone()` — they are
  governed by the acknowledgment record instead. `senderNumber` is company-owned
  and never masked (PRD FR-004, v2.2).

---
_Diagram supporting **PRD-B v2.2** (Configurable Column Export). Verified vs PRD-B + BE 2026-09-16: no change (offlinereportjobs, uploadExportFileToS3, processor:79-81 all confirmed accurate)._
