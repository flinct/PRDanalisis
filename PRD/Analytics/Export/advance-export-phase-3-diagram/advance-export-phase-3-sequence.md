# Advance Export Phase 3 — Broadcast Export Sequence

Three sequences: (A) the redirect from Broadcast > Messages into the Offline Report modal
with URL-param prefill (FR-034..037 — all-new frontend work), (B) broadcast configurable
job submission with the granularity and filter contract, and (C) campaign-granularity
generation in analytics-service. HTTP surface is unchanged from Phase 2
(GET/POST /analytics/export-report,
apps/api-gateway/src/app/analytics/export-report-job.controller.ts:53,91,138,188,230);
Phase 3 adds no endpoint and edits no proto (TRD §11.4).

## A. Redirect from Broadcast > Messages

```mermaid
sequenceDiagram
    autonumber
    participant USER as Admin
    participant BP as BroadcastMessagesPage (ManageBroadcastMessagePage)
    participant STORE as useBroadcastMessageStore
    participant HOOK as use-export-broadcast.ts (new)
    participant SP as StatisticPage (OfflineReportSection)
    participant MOD as CreateReportModal (useCreateReportModal)
    participant REG as analytics registry API

    USER->>BP: click Export
    BP->>STORE: read status, startDate, endDate, teamId
    BP->>HOOK: handleExportBroadcast(filters)
    HOOK->>HOOK: buildBroadcastExportParams(filters): validate channels/status/source values, ISO-format dates
    HOOK->>SP: router.push('/statistic?section=offline-report&create=broadcast&filter.*=…')
    SP->>SP: section=offline-report validated against VALID_SECTIONS (ManageStatisticPage.tsx:31-35)
    SP->>SP: read create param VALUE (not just presence — FR-035)
    SP->>MOD: open modal with initialReportType = broadcast
    MOD->>MOD: useState(initialReportType ?? TAB_OPTIONS.TICKET): lazy init — no Ticket-tab flash
    MOD->>MOD: parse filter.* params via shared pure parser: invalid values silently dropped → droppedKeys[]
    MOD->>MOD: seed RHF defaults = BROADCAST_DEFAULT_VALUES ⊕ parsed params (FR-036)
    alt any value was dropped (EC-007)
        MOD->>USER: non-blocking banner: Beberapa filter tidak tersedia.
    end
    MOD->>REG: GET /analytics/export-report/columns?domainId=broadcast&granularity=recipient
    REG-->>MOD: registry grouped by category + registryVersion
    Note over MOD: user reviews/edits prefilled values (FR-037) - granularity switch refetches and clears selection (FR-009)
    USER->>MOD: submit → sequence B
    Note over MOD: on close: deleteSearchParams() strips 'create' AND 'filter.*'
```

## B. Broadcast configurable job submission

```mermaid
sequenceDiagram
    autonumber
    participant FE as omnichannel modal
    participant GW as api-gateway
    participant AS as analytics-service (ExportReportJobService)
    participant REG as exportcolumnregistry
    participant COV as exportdatacoverage
    participant JOB as offlinereportjobs
    participant MQ as RabbitMQ analytics queue

    Note over FE: user has Broadcast tab + granularity selected
    FE->>GW: POST /analytics/export-report — channel:broadcast, parameters:{columns[], granularity, channels[], source[], statuses[](display groups), creatorUserIds[], teamIds[], dateType, startDate, endDate, piiAcknowledged}
    GW->>GW: ValidateDynamicParametersConstraint → BroadcastReportParamsDto (extended, TRD §6.3.1): whitelist + forbidNonWhitelisted
    alt PII column selected
        FE->>FE: PII dialog shown BEFORE submit - piiAcknowledged set only on Lanjutkan
    end
    GW->>AS: gRPC CreateReportJob{channel, parameters: Struct, userContext} (contract unchanged — epic D1, no templateId)
    AS->>AS: broadcast gates (TRD §6.3.2 steps 3-10): granularity valid — campaign requires columns non-empty — columns exist at this granularity — status groups → BroadcastStatusEnum — channels/source/dateType enum checks
    AS->>REG: findByFieldPaths(broadcast, granularity, columns[])
    REG-->>AS: snapshot or COLUMN_INVALID
    AS->>AS: scope resolve: creatorUserIds/teamIds must be subset of requester scope, else INVALID_SCOPE (reject, never drop)
    AS->>AS: rowScope predicate snapshot (epic D4, Phase-2 TD5)
    AS->>COV: assertExportDataCoverage(broadcast, startDate, endDate)
    COV-->>AS: ready OR DATA_NOT_READY OR DATA_EXPIRED
    AS->>JOB: persist {channel, parameters:{columnSnapshot, registryVersion, granularity, rowScope, dateType, source, statuses, piiAcknowledgedBy/At}, status: QUEUED}
    AS->>MQ: emit EXPORT_REPORT_JOB_PROCESS
    AS-->>GW: created
    GW-->>FE: 201
    Note over FE: FE badge flips to Sedang Diproses (static, NFR-013b)
```

## C. Campaign-granularity generation (analytics-service, epic D5)

```mermaid
sequenceDiagram
    autonumber
    participant MQ as analytics configurable queue
    participant PROC as ConfigurableExportProcessor (Phase-2 artifact)
    participant BLD as BroadcastCampaignPipelineBuilder (new)
    participant REPO as broadcast-export-data.repository (Phase-1 artifact)
    participant BED as broadcastexportdata (satuinbox_analytics, TTL 180d)
    participant MASK as masking layer
    participant XLSX as SheetJS in-memory writer
    participant S3 as media-service / S3
    participant RES as EXPORT_REPORT_JOB_RESULT

    MQ->>PROC: EXPORT_REPORT_JOB_PROCESS {jobId, parameters, userContext}
    PROC->>RES: emit EXPORT_REPORT_JOB_PROGRESS (one-shot QUEUED→PROCESSING)
    PROC->>PROC: domainId=broadcast AND granularity=campaign → select builder (TRD §6.4.1)
    PROC->>BLD: build(job)
    BLD->>BLD: stages: $match{tenant, rowScope, dateType range, filters} → $group{_id:{companyId,organizationId,batchId}, $first metadata, 7 counts + total + nonTerminalCount} → $addFields{successRate, campaignStatus} → $sort → $limit 20001 → $project from columns[]
    PROC->>REPO: aggregate(stages).option({maxTimeMS: 30000})
    REPO->>BED: run pipeline
    alt MaxTimeMSExpired (TD7 guard, NFR-013a)
        BED-->>REPO: MongoServerError codeName=MaxTimeMSExpired
        PROC->>RES: FAILED, AGGREGATION_TIMEOUT / EH-007, no retry
    else more than 20,000 campaign rows
        PROC->>RES: FAILED, ROW_CAP_EXCEEDED / EC-004 (campaign-cap-exceeded copy, epic D3)
    else ok
        BED-->>REPO: at most 20,000 aggregated campaign docs
        REPO-->>PROC: rows + groupCount
        PROC->>MASK: format rows (null→'-', dates Asia/Jakarta, campaignStatus token→localised copy). campaign rows carry no recipient PII (FR-043)
        MASK-->>PROC: formatted rows
        PROC->>XLSX: write header = snapshot displayName in columns[] order
        XLSX-->>PROC: buffer
        PROC->>S3: uploadExportFileToS3 (shared common util)
        S3-->>PROC: presigned URL (15 min)
        PROC->>RES: COMPLETED {fileResult, totalRows, aggregation_duration_ms, generation_duration_ms, group_count, file_size_bytes} (NFR-018, structured log too)
        RES->>PROC: job COMPLETED, expiresAt = now + 7d
    end
```

Legacy-path note: a job without columns[] never reaches this sequence — it is
dispatched to broadcast-service's ExportJobProcessor
(apps/analytics-service/src/app/services/export-report-job.service.ts:379-386) and
generated inline by BroadcastExportService (no worker thread,
broadcast-export.service.ts:328-346), with the FR-044 mapper patch applied there
(TRD §6.7.1). Both paths mask recipient PII with the same composite OR rule; senderNumber
is raw on both (epic D8).

---
_Diagram supporting **PRD-C v2.1** (Broadcast Export). Verified vs PRD-C + BE 2026-09-16: no change (processor:72-74 OR-mask, service:299 _maskPii, FIXED_HEADERS=20, dispatch:379-386, enums 705/1218 all confirmed accurate; totalRecipients 7-count partition matches PRD Appendix A)._
