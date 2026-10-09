# Advance Export Phase 4 — Use Cases (SAP Template Preset)

Actors are RBAC permission holders, not job titles. SAP job creation requires
**all four** of: `statistic:export_sap` (new), `privacy:view_full_email`,
`privacy:view_full_phone` (`backend/libs/common/src/lib/enums/index.ts:96-97`),
and `company.features.sapExportEnabled = true` (new sub-document). The privacy
pair is a **hard gate** — the job is rejected, not masked (PRD FR-044 / EH-004).

Companion TRD: [`trd/trd-advance-export-phase-4-sap-template-preset.md`](../trd/trd-advance-export-phase-4-sap-template-preset.md)

```mermaid
flowchart LR
    SAPU(["statistic:export_sap holder with both privacy perms"])
    PARTIAL(["Holder missing one privacy permission"])
    OPS(["Ops / CS - SAP-PKS onboarding"])
    GEN(["analytics-service SAP generator"])
    PEOPLE(["people-service GetAuxIntervals"])
    DEV(["Engineering / DevOps"])

    U1(("See SAP Report tab"))
    U2(("Select sheets - Ticket, Conversation, Raw AUX"))
    U3(("Apply filters - max 31d, status, channel, assignee"))
    U4(("Submit SAP job - channel sap"))
    U5(("Review job list - SAP Report + sheet list"))
    U6(("Download multi-sheet XLSX via presigned URL"))
    U7(("Attempt submit - rejected 403 EH-004"))
    U8(("Enable company.features.sapExportEnabled"))
    U9(("Grant statistic:export_sap to a role"))
    U10(("Read ticketexportdata and conversationexportdata"))
    U11(("Fetch per-interval AUX rows"))
    U12(("Stream workbook with exceljs WorkbookWriter"))
    U13(("Multipart upload to S3 export_reports key"))
    U14(("Raise analytics-service memory 256Mi to 1Gi"))

    SAPU --> U1
    SAPU --> U2
    SAPU --> U3
    SAPU --> U4
    SAPU --> U5
    SAPU --> U6
    PARTIAL --> U7
    OPS --> U8
    OPS --> U9
    DEV --> U14

    U4 --> U10
    U4 --> U11
    GEN --> U10
    GEN --> U12
    GEN --> U13
    PEOPLE --> U11

    U1 -.gated by.-> U8
    U4 -.gated by.-> U9
    U12 -.requires.-> U14
    U6 -.reuses media-service getMedia unchanged.-> U13
```

## Out of scope in this phase

```mermaid
flowchart LR
    X1(("Report Effective Hour - Sheet 3"))
    X2(("Supervisor row scoping below tenant"))
    X3(("8 unnamed SAP columns - 4 ticket, 4 conversation"))
    X4(("Column customization of the SAP preset"))
    X5(("Scheduled or emailed SAP delivery"))

    B1["No attendance or clock-in source - OQ-D1b"]
    B2["PRD section 14 - Future Consideration"]
    B3["Reference workbook not committed - OQ-D15"]
    B4["Phase 3+ integrated mode via Phase-2 registry"]
    B5["PRD section 14 - Future Consideration"]

    X1 -.blocked by.-> B1
    X2 -.demoted by.-> B2
    X3 -.blocked by.-> B3
    X4 -.deferred to.-> B4
    X5 -.deferred to.-> B5
```

---
_Diagram supporting **PRD-D v2.1** (SAP Template Preset). Verified vs PRD-D + BE 2026-09-16: no change (privacy perms enums:96-97, four-way gate statistic:export_sap + both privacy + features.sapExportEnabled, OQ-D1b/D15 out-of-scope blockers all match PRD)._
