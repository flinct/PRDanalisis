# Advance Export Phase 3 — Broadcast Export Use Cases

Actors are RBAC roles, not job titles: any role holding the named `StatisticPermission`
value (`libs/common/src/lib/constants/default-permission.constant.ts:129-134`) can perform
the use case. Phase 3 adds broadcast-specific UX over the Phase-2 configurable export
system, plus the FR-044 live PII fix that applies to both the configurable and the legacy
broadcast export path.

```mermaid
flowchart LR
    ADM([statistic:* holder])
    SUP([statistic:read_team holder])
    AGT([statistic:read_own holder])
    ANY([any offline-report user])
    ANA([analytics-service worker])
    OPS([Platform / data engineer])

    U1((Select Broadcast as Tipe Laporan))
    U2((Choose granularity:<br/>Per Penerima / Per Kampanye))
    U3((Pick broadcast columns<br/>from registry))
    U4((Acknowledge PII columns))
    U5((Apply broadcast filters:<br/>channel, source, status,<br/>creator, team, date type))
    U6((Submit broadcast export job))
    U7((Redirect from Broadcast page<br/>with prefilled filters))
    U8((Download completed XLSX))
    U9((Validate granularity,<br/>filters, scope, coverage))
    U10((Group rows by batchId<br/>and aggregate counts))
    U11((Mask recipient PII<br/>per composite OR rule))
    U12((Write XLSX and upload to S3))
    U13((Export via legacy<br/>Default Broadcast template))
    U14((Seed campaign registry<br/>entries / drift check))

    ADM --> U1
    ADM --> U2
    ADM --> U3
    ADM --> U5
    ADM --> U6
    ADM --> U7
    ADM --> U8
    ADM --> U13
    SUP --> U1
    SUP --> U2
    SUP --> U5
    SUP --> U6
    SUP --> U8
    AGT --> U6
    AGT --> U8
    ANY --> U8
    OPS --> U14
    ANA --> U9
    ANA --> U10
    ANA --> U11
    ANA --> U12

    U1 -.includes.-> U2
    U2 -.includes.-> U3
    U3 -.includes.-> U4
    U6 -.includes.-> U9
    U9 -.includes.-> U10
    U9 -.includes.-> U11
    U10 -.includes.-> U12
    U11 -.includes.-> U12
    U7 -.extends.-> U1
    U13 -.excludes.-> U2
```

Scope boundaries encoded above:

- `U4` extends `U6` only when a selected column carries `isPII: true` **and** the
  granularity is `recipient` — the campaign column set has no PII column (FR-041, FR-043,
  NFR-012), so the PII dialog never fires at campaign level.
- `U7` extends `U1`: the redirect preselects the Broadcast tab and seeds the form from URL
  params; every value stays editable before submit (FR-037).
- `U13` **excludes** `U2`: the legacy "Default Broadcast" template path is recipient-level
  only; a campaign-level request without `columns[]` is rejected
  (`GRANULARITY_REQUIRES_COLUMNS`), never downgraded (FR-038..040).
- `U11` applies to **both** `U6` (configurable) and `U13` (legacy): FR-044 patches the
  legacy row mapper (`broadcast-export.service.ts:294-326`) and the configurable path
  applies the same composite OR rule. `senderNumber` is masked in neither — it is the
  company-owned sender number, not recipient PII (epic D8).
- `U2`/`U5` are Admin-usable but Supervisor-reachable; a Supervisor's submitted filters and
  aggregates are scope-constrained by the Phase-2 row-scope predicate applied before the
  `$group` (US-009 AC1).

---
_Diagram supporting **PRD-C v2.1** (Broadcast Export). Reviewed vs PRD-C + BE 2026-09-16: fixed StatisticPermission line ref 131-137 → 129-134. SVG unaffected (change is in prose, not mermaid)._
