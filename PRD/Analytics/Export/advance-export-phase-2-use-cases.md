# Advance Export Phase 2 — Use Cases

Column Registry + Configurable Column Export. Actors are RBAC roles, not job
titles: any role holding the named `StatisticPermission` value can perform the
use case (`libs/common/src/lib/constants/default-permission.constant.ts:129-134`).

```mermaid
flowchart LR
    ADM([statistic:* holder])
    SUP([statistic:read_team holder])
    AGT([statistic:read_own holder])
    ANA([analytics-service job worker])
    OPS([Platform / data engineer])

    U1((Choose export domain))
    U2((Browse and search column registry))
    U3((Select columns / apply Default preset))
    U4((Acknowledge PII columns))
    U5((Apply filters: dates, status, channel, agent, tags, inbox/team))
    U6((Submit configurable export job))
    U7((Review job list column snapshot))
    U8((Download completed XLSX))
    U9((Preflight coverage and scope validation))
    U10((Build $match + $project pipeline))
    U11((Mask PII per privacy permissions))
    U12((Write XLSX and upload to S3))
    U13((Seed registry / run drift check))

    ADM --> U1
    ADM --> U2
    ADM --> U3
    ADM --> U5
    ADM --> U6
    ADM --> U7
    ADM --> U8
    SUP --> U1
    SUP --> U3
    SUP --> U6
    SUP --> U7
    AGT --> U3
    AGT --> U6
    OPS --> U13
    ANA --> U9
    ANA --> U10
    ANA --> U11
    ANA --> U12

    U3 -.includes.-> U2
    U6 -.includes.-> U9
    U6 -.extends.-> U4
    U9 -.includes.-> U10
    U10 -.includes.-> U11
    U11 -.includes.-> U12
    U8 -.includes.-> U12
```

Scope boundaries encoded above:

- `U4` extends `U6` only when at least one selected column carries
  `isPII: true` (FR-047, FR-048, EH-006).
- `U9` is the coverage + `INVALID_SCOPE` gate (FR-025a, FR-026b). It runs at
  **job creation**, before the job is queued, so an unready or out-of-scope
  request never reaches the worker.
- `U11` masks by **field shape**, evaluating `privacy:view_full_phone` and
  `privacy:view_full_email` **independently** (FR-061, TRD TD8). This deliberately
  supersedes the legacy composite OR-check shipped in the domain processors
  (`apps/ticket-service/src/app/processors/export-job.processor.ts:79-81`), which
  masks everything when either permission is missing and blanks name fields.
- `U13` is operational, not user-facing: the registry is seeded by script and
  guarded by the field-name-aware drift check (FR-064).
- Campaign-granularity aggregation (`$group`) is **not** in this diagram — it is
  the Phase-3 extension of `U10` (FR-029a).

---
_Diagram supporting **PRD-B v2.2** (Configurable Column Export). Reviewed vs PRD-B + BE 2026-09-16: fixed StatisticPermission line ref 131-137 → 129-134._
