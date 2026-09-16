# Advance Export Phase 2 — Configurable Export Activity

Two activities: (A) job creation validation in `analytics-service`
`ExportReportJobService.createReportJob`, and (B) configurable job processing in
the new analytics-owned generator. Both are Phase-2 scope; the legacy per-domain
RMQ fan-out path is untouched and runs in parallel (epic D5, PRD §20.7).

## A. Job creation — validation ladder

The order below is binding. Each gate returns before the next one runs, so a
caller never sees a masked-over failure.

```mermaid
flowchart TD
    A["POST /analytics/export-report"] --> B["api-gateway DTO validation<br/>per-domain params DTO, whitelist + forbidNonWhitelisted"]
    B -->|invalid| B1["400 with class-validator message"]
    B --> C["gRPC CreateReportJob to analytics-service"]
    C --> D{"channel in ExportReportChannelType?"}
    D -->|no| D1["INVALID_DOMAIN / EH-004"]
    D -->|yes| E{"columns array present and non-empty?"}
    E -->|absent| E1["Legacy template path<br/>unchanged fan-out to domain service"]
    E -->|empty array| E2["COLUMNS_REQUIRED / EH-001"]
    E -->|non-empty| F["Load registry snapshot for domain + granularity"]
    F -->|registry empty or unavailable| F1["REGISTRY_UNAVAILABLE / EH-013"]
    F --> G{"every fieldPath exists in registry?"}
    G -->|no| G1["COLUMN_INVALID fieldPath / EH-002"]
    G -->|yes| H{"every column isActive and isSelectable?"}
    H -->|no| H1["COLUMN_INACTIVE displayName / EH-003"]
    H -->|yes| I{"any column isPII?"}
    I -->|yes| J{"parameters.piiAcknowledged is true?"}
    J -->|no| J1["PII_ACK_REQUIRED / EH-006"]
    J -->|yes| K["Stamp piiAcknowledgedBy and piiAcknowledgedAt from userContext"]
    I -->|no| K
    K --> L["Validate date range<br/>start before end, span within MAX_DATE_RANGE_DAYS 31"]
    L -->|invalid| L1["DATE_RANGE_INVALID / EH-005"]
    L --> M["Resolve requester row scope from StatisticPermission"]
    M --> N{"requested assignedTo, inboxIds, teamIds within scope?"}
    N -->|no| N1["INVALID_SCOPE / EH-011"]
    N -->|yes| O["assertExportDataCoverage tenant, collection, range, now"]
    O -->|DATA_EXPIRED| O1["DATA_EXPIRED / EH-010"]
    O -->|DATA_NOT_READY| O2["DATA_NOT_READY / EH-009"]
    O -->|ready| P["checkActiveJobPerUser MAX_ACTIVE_JOBS_PER_CHANNEL = 1"]
    P -->|breached| P1["DUPLICATE_ACTIVE_JOB / EH-012"]
    P --> Q["checkRateLimitPerUser MAX_JOBS_PER_HOUR = 10"]
    Q -->|breached| Q1["RATE_LIMITED"]
    Q --> R["Persist job status QUEUED<br/>parameters.columnSnapshot, registryVersion,<br/>rowScope snapshot, piiAck fields"]
    R --> S["Emit EXPORT_REPORT_JOB_PROCESS to analytics configurable queue"]
    S --> T["Emit EXPORT_REPORT_JOB_EXPIRE delayed 7 days"]
```

Notes:

- The row-scope predicate is snapshotted at creation (EC-010): a mid-flight
  permission change does not alter an already-queued job.
- `assertExportDataCoverage` is the Phase-1 contract
  (`trd/trd-advance-export-phase-1-row-level-collections.md` §6.6). Its
  evaluation order — expiry before coverage, stale-live-day last — is
  authoritative and must not be reordered here.
- Legacy jobs (no `columns[]`) skip gates F..O entirely and keep their current
  behavior (epic D1 / TRD TD1).

## B. Job processing — configurable generator

```mermaid
flowchart TD
    A["Consume EXPORT_REPORT_JOB_PROCESS"] --> B["Load job by id, assert status QUEUED"]
    B --> C["Emit EXPORT_REPORT_JOB_PROGRESS, status PROCESSING"]
    C --> D["Re-validate columnSnapshot against live registry NFR-006"]
    D --> E{"any snapshot column now inactive?"}
    E -->|yes| F["Drop column, record it in skippedColumns, log warning EH-015"]
    E -->|no| G["Keep full column list"]
    F --> G
    G --> H{"zero columns remain?"}
    H -->|yes| H1["Fail job COLUMNS_REQUIRED"]
    H -->|no| I["Re-assert coverage for the range"]
    I -->|not ready| I1["Fail job DATA_NOT_READY"]
    I --> J["Build pipeline<br/>1 match tenant companyId + organizationId<br/>2 match row-scope snapshot<br/>3 match domain filters<br/>4 sort createdAt -1<br/>5 limit 20001<br/>6 project selected + internal fields"]
    J --> K["Open cursor batchSize 2000, maxTimeMS 30000"]
    K --> L{"row count over 20000?"}
    L -->|yes| L1["Fail job ROW_CAP_EXCEEDED / EH-007"]
    L -->|no| M["Resolve masking flags from job userContext permissions"]
    M --> N["Per row format by dataType,<br/>objectId to denormalised name FR-028a,<br/>object to JSON string EC-005,<br/>null to dash"]
    N --> O["Apply field-shape PII masking FR-061"]
    O --> P["Append row to SheetJS sheet"]
    P --> Q{"more rows?"}
    Q -->|yes| N
    Q -->|no| R["Write workbook, header row = snapshot displayName in request order"]
    R --> S["uploadExportFileToS3"]
    S --> T["Emit EXPORT_REPORT_JOB_RESULT ok true<br/>with fileResult, rowCount, columnCount, skippedColumns"]
    T --> U["analytics marks COMPLETED, expiresAt = now + 7 days"]
    K -->|cursor error or timeout| V["Retry once"]
    V -->|still failing| V1["Emit EXPORT_REPORT_JOB_RESULT ok false<br/>reason QUERY_TIMEOUT / EH-008"]
```

Notes:

- Zero rows is a success, not a failure: the workbook is written with the header
  row only and the job completes (EH-014, EC-007).
- `$limit 20001` is deliberate — it detects cap breach without materializing an
  unbounded result set (NFR-004, ASM-003, epic D3 / TRD TD10).
- Streaming XLSX is explicitly out of scope; the writer stays SheetJS in-memory.

---
_Diagram supporting **PRD-B v2.2** (Configurable Column Export). Verified vs PRD-B + BE 2026-09-16: no change (offlinereportjobs, uploadExportFileToS3, processor:79-81 all confirmed accurate)._
