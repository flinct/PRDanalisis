# Advance Export Phase 4 — SAP Template Preset Sequence

Three sequences: (A) SAP job submission with the new entitlement + PII gates,
(B) multi-sheet generation and direct-to-S3 upload, (C) download and expiry.

HTTP surface is unchanged — `POST/GET /analytics/export-report`
(`backend/apps/api-gateway/src/app/analytics/export-report-job.controller.ts:53,91,138,188,230`).
The new work is a `sap` value on `ExportReportChannelType`, a `SapReportParamsDto`,
a new `sap` branch in `dispatchExportJob` emitting to a **dedicated SAP RabbitMQ
queue** consumed by a new in-service processor, a new people-service
`GetAuxIntervals` RPC, and a direct S3 client in analytics-service.

Companion TRD: [`trd/trd-advance-export-phase-4-sap-template-preset.md`](../trd/trd-advance-export-phase-4-sap-template-preset.md)

## A. Submission and validation

```mermaid
sequenceDiagram
    autonumber
    participant FE as omnichannel SAP tab
    participant GW as api-gateway
    participant AS as analytics-service (ExportReportJobService)
    participant REPO as offlinereportjobs
    participant MQD as export-report-delayed exchange
    participant MQ as RabbitMQ sap queue

    Note over FE: tab rendered only when session carries features.sapExportEnabled
    FE->>GW: POST /analytics/export-report<br/>channel=sap, parameters=SapReportParamsDto
    GW->>GW: JwtAuthGuard + PermissionsGuard (statistic:read)
    GW->>GW: Throttle DEFAULT_RATE_LIMIT_MAX = 100 per 60s
    GW->>AS: gRPC CreateReportJob(channel, parameters, userContext)

    AS->>AS: validateUserContext -> companyId, organizationId, userId, role
    AS->>AS: validateSapParams (sheets >= 1, known sheet names)
    AS->>AS: validateDateRange (MAX_DATE_RANGE_DAYS = 31)

    AS->>AS: assertSapEntitlement(userContext)
    alt features.sapExportEnabled false OR missing statistic:export_sap
        AS-->>GW: GrpcForbiddenException (EH-005)
        GW-->>FE: 403 "SAP Report tidak tersedia untuk akun Anda"
    end

    AS->>AS: assertPiiPermissions(userContext)
    alt missing privacy:view_full_email OR privacy:view_full_phone
        AS-->>GW: GrpcForbiddenException (EH-004)
        GW-->>FE: 403 "Anda tidak memiliki izin untuk mengekspor data PII"
    end

    AS->>REPO: findActiveSapDuplicateJob(channel, userId, companyId, start, end, sheets)
    alt duplicate found
        AS-->>GW: GrpcBadRequestException (EH-008)
        GW-->>FE: 400 "Permintaan yang sama masih diproses"
    end

    AS->>REPO: countActiveJobsByUser(channel=sap)
    AS->>REPO: countJobsCreatedInLastHour(userId, companyId)
    alt active >= 1 (MAX_ACTIVE_JOBS_PER_CHANNEL) or hourly >= 10 (MAX_JOBS_PER_HOUR)
        AS-->>GW: GrpcBadRequestException (EH-009)
        GW-->>FE: 400 "Terlalu banyak permintaan ekspor aktif"
    end

    AS->>REPO: countDocuments per selected sheet (bounded to 200001)
    alt any sheet > 200000 rows
        AS-->>GW: GrpcBadRequestException (EH-003)
        GW-->>FE: 400 "Data terlalu besar. Perkecil rentang tanggal"
    end

    AS->>REPO: createWithTenant(channel=sap, parameters, status=QUEUED)
    REPO-->>AS: job._id
    AS->>MQD: emitWithDelay(EXPORT_REPORT_JOB_EXPIRE, jobId, 604800000)
    AS->>MQ: emit(EXPORT_REPORT_JOB_PROCESS, {channel, jobId, parameters, userContext})
    AS-->>GW: common.Success
    GW-->>FE: 201 Created
    FE->>FE: invalidate FETCH_EXPORT_HISTORY query key
```

## B. Multi-sheet generation and direct-to-S3

```mermaid
sequenceDiagram
    autonumber
    participant MQ as RabbitMQ sap queue
    participant GEN as SapExportProcessor (analytics-service)
    participant SVC as SapExportService
    participant TDATA as ticketexportdata
    participant CDATA as conversationexportdata
    participant PS as people-service MemberService
    participant XL as exceljs WorkbookWriter
    participant S3 as AWS S3
    participant MS as media-service
    participant PROC as ExportReportJobProcessor
    participant REPO as offlinereportjobs

    MQ->>GEN: EXPORT_REPORT_JOB_PROCESS (channel=sap)
    GEN->>PROC: emit EXPORT_REPORT_JOB_PROGRESS(jobId)
    PROC->>REPO: updateJobOnProgress -> status PROCESSING

    GEN->>SVC: generateSapWorkbook(sheets, filters, userContext)
    SVC->>XL: new WorkbookWriter({filename: tmpPath, useStyles:false})

    opt "Report Ticket" selected
        SVC->>XL: addWorksheet("Report Ticket"), write header row
        loop streamed cursor batches
            SVC->>TDATA: find({companyId, organizationId, ...filters}).cursor()
            TDATA-->>SVC: batch of ticket rows
            SVC->>SVC: mapTicketRowToSapColumns (HH:MM:SS + WIB formatting)
            SVC->>XL: row.commit() per row
        end
        SVC->>XL: worksheet.commit()
    end

    opt "Report Conversation" selected
        SVC->>XL: addWorksheet("Report Conversation"), write header row
        loop streamed cursor batches
            SVC->>CDATA: find({companyId, organizationId, ...filters}).cursor()
            CDATA-->>SVC: batch of conversation rows
            SVC->>XL: row.commit() per row
        end
        SVC->>XL: worksheet.commit()
    end

    opt "Raw AUX" selected
        SVC->>PS: gRPC GetAuxIntervals(memberIds, startDate, endDate, companyContext)
        PS-->>SVC: {items:[{memberId, memberName, reasonId, reasonText, startAt, endAt, totalAwayMs}], totalCount}
        Note over SVC,PS: memberName is resolved inside people-service by the<br/>$lookup into members - no second GetMembersByIds round trip (TRD 6.5)
        SVC->>XL: addWorksheet("Raw AUX"), header + rows, commit
    end

    SVC->>XL: workbook.commit() -> temp file flushed
    SVC->>S3: Upload (aws-sdk lib-storage multipart) key {companyId}/export_reports/{uuid}_SatuInbox_SAP_Report_DD_MM_YYYY.xlsx
    S3-->>SVC: ETag
    SVC->>MS: gRPC getMedia(mediaName, EXPORT_REPORTS) -> presigned downloadUrl
    MS-->>SVC: preview URL (15 min TTL)
    SVC-->>GEN: {fileName, mediaName, downloadUrl, fileSize, rowCounts}

    alt success
        GEN->>PROC: emit EXPORT_REPORT_JOB_RESULT(COMPLETED, fileResult, totalRows)
        PROC->>REPO: updateJobCompleted(completedAt, expiresAt=now+7d, fileResult)
    else any sheet fails
        GEN->>PROC: emit EXPORT_REPORT_JOB_RESULT(FAILED, failureReason, retryable)
        PROC->>REPO: updateJobFailed(jobId, failureReason, retryable)
        Note over GEN,REPO: no partial workbook is uploaded (NFR-007). Temp file unlinked.
    end
```

## C. Download and expiry

```mermaid
sequenceDiagram
    autonumber
    participant FE as omnichannel job list
    participant GW as api-gateway
    participant CACHE as Redis
    participant AS as analytics-service
    participant MS as media-service
    participant S3 as AWS S3
    participant MQD as export-report-delayed exchange

    FE->>GW: GET /analytics/export-report/:id
    GW->>CACHE: getOrSet(EXPORT_REPORT_JOB_STATUS:company:user:id)
    CACHE->>AS: gRPC GetReportJobById (on miss)
    AS->>AS: findByIdScoped(id, companyId, userId, role)
    AS-->>GW: ReportJobItem(status, fileResult)
    GW-->>FE: job with fileResult.downloadUrl

    Note over FE,S3: fileResult.downloadUrl is a presigned GET valid 15 min<br/>(PRESIGNED_URL_EXPIRE_MINUTES = 15)
    FE->>S3: GET presigned URL
    S3-->>FE: SatuInbox_SAP_Report_DD_MM_YYYY.xlsx

    Note over MQD: 7 days after creation (EXPIRATION_DELAY_MS = 604800000)
    MQD->>AS: EXPORT_REPORT_JOB_EXPIRE(jobId)
    AS->>MS: gRPC deleteMedia(name, EXPORT_REPORTS_MEDIA_RESOURCE)
    MS->>S3: DeleteObjects
    AS->>AS: updateJobExpired -> status EXPIRED, fileResult cleared
```

> The expiry path reuses the shipped `expireJob` unchanged
> (`export-report-job.service.ts:245-275`) — which is why §B must write the S3
> object under the **same** `{companyId}/{resource}/{mediaName}` key shape
> media-service builds (`apps/media-service/src/app/app.service.ts:301-314`).
> A different key layout would silently break both download and deletion.

---
_Diagram supporting **PRD-D v2.1** (SAP Template Preset). Reviewed vs PRD-D + BE 2026-09-16: gate order now matches activity (entitlement→PII→duplicate→rate→precount). BE-verified: media key shape, privacy perms enums:96-97, expireJob reuse requires same key layout._
