# Session Summary — Export PRD-C / PRD-D v2 Re-Review + Cross-Phase senderNumber Fix

**Date**: 2026-09-15 (Asia/Jakarta)
**Owner**: Dany Christian (PM) · Analyst
**Scope**: Second-cycle tech-review resolution for the SAP / Advanced Offline Export PRD package (Phase C + D), plus a cross-phase PII-classification correction that propagated to Phase A + B.

## Task
Process the two attached re-reviews:
- `review-advance-export-phase-3-v2.md` → PRD-C (Broadcast Export)
- `review-advance-export-phase-4-v2.md` → PRD-D (SAP Template Preset)

Workflow: verify every reviewer claim against BE (`omnichannel-satuinbox-be`) → apply in-place → bump version via in-file Revision History → sync OpenProject. Versioning strategy = **in-place** (user override 2026-09-14; no separate `v2.x.md` files).

## Outcome — versions after this cycle
| PRD | File | Version | Ticket |
|---|---|---|---|
| A Foundation | `PRD Analytics - Export Row-Level Collections (Foundation).md` | **v2.3** | #3189 (comment #23421) |
| B Configurable Column | `PRD Analytics - Configurable Column Export.md` | **v2.2** | #3190 (comment #23422) |
| C Broadcast Export | `PRD Analytics - Broadcast Export.md` | **v2.1** | #3191 (comment #23419) |
| D SAP Template Preset | `PRD Analytics - SAP Template Preset.md` | **v2.1** | #3192 (comment #23420) |

## PRD-C (v2.1) — READY WITH MINOR EDITS → resolved
- **NI-01** (B-01 count-column gap): added `processingCount` (Sedang Diproses) = `status IN (raw, text_processing, text_processed, retry)`. All 12 `BroadcastStatusEnum` values now covered by 7 count columns; `totalRecipients` = exact sum (partition verified, no overlap/gap). Touched FR-022, FR-031 (22→23), §10.2, Appendix A Stage 2, Appendix B.
- **NI-02** (FR-044 masking ambiguity): clarified the composite gate is `||` (OR) over `privacy:view_full_email`/`privacy:view_full_phone` (`export-job.processor.ts:72-74`) — mask ALL PII if EITHER permission absent; `recipientName` governed by same check, no dedicated name permission.

## PRD-D (v2.1) — NEEDS REVISION → resolved
- **NI-01** (direct-to-S3 path): analytics-service takes `@aws-sdk/client-s3` (0 refs today, grep-verified), inits from media config namespace (`AWS_S3_*`, `media-config.ts:30-36`), S3 key `{companyId}/export_reports/{mediaName}` matches media pattern (`app.service.ts:301-314`) so `getMedia()` presigned path works with no media-service change. §12, §17.
- **NI-02** (NFR-004 20K supersession): SAP generator reads PRD-A collections directly, never invokes domain export services → bypasses their 20K guards; `*_EXPORT_LIMIT` stays 20,000 for the three domain channels; no shared cross-channel utility to regress.
- **OQ status correction**: D7/D9/D10/D13 PROPOSED→**DECIDED** (values already committed throughout body: analytics-service generator + 256Mi→1Gi, 200K cap, direct-to-S3, `company.features.sapExportEnabled` + `statistic:export_sap`). D12 split → DECIDED technical gate + residual Legal/DPO confirmation (**OQ-D12r**, non-blocking for TRD).

## Cross-phase fix — `senderNumber` de-flagged (triggered by PRD-C review)
`senderNumber` was flagged PII inconsistently across 3 PRDs; PRD-C was the correct side. It is the company-owned WA sender account number (`doc.sender ?? accountChannel.phoneNumber`, `broadcast-export.service.ts:302`), not recipient PII. Propagated:
- PRD-A v2.3: §10.3 row note (raw, no masking) + §10.4 PII scrub table → COMPANY_OWNED / No masking.
- PRD-B v2.2: FR-004 (removed from PII list), FR-061 (removed from phone-mask set), Appendix B.1 (moved to non-PII default row 22), Appendix C.3 (`isPII` true→false).

## Still OPEN (routed, cannot resolve here)
- **OQ-D15** — SAP reference workbook `SatuInbox_SAP_Report_31_07_2026.xlsx` not committed to any durable repo path. 8 unnamed columns (4 ticket + 4 conversation) unmappable until committed. **Action: Product/SAP.**
- **OQ-D1b** — Effective Hour (Sheet 3) blocked: no attendance/clock-in source.
- **OQ-D12r** — Legal/DPO confirmation on PII export policy (non-blocking for TRD).
- **PRD-A OQ-17** — audit payload aggregation-handler ownership (Engineering) → TRD.

## BE evidence (verified 2026-09-14/15)
- `apps/analytics-service/src/` → 0 `@aws-sdk/client-s3` / `S3Client` refs.
- `libs/common/src/lib/config/configurations/media-config.ts:30-36` → `AWS_S3_*` env namespace.
- `apps/media-service/src/app/app.service.ts:301-314` → key `{company}/{resourceName}/{mediaResourceKey}/{mediaName}`.
- `proto/people.proto:69` → `GetAuxSummary` exists; `GetAuxIntervals` does not yet.
- `BroadcastStatusEnum` 12 values (`libs/common/src/lib/enums/index.ts:1228`).

## Artifacts
- Reviews archived: `PRD/Analytics/Export/review tech/review-advance-export-phase-{3,4}-v2.md`.
- All 4 PRDs edited in-place; each has an in-file Revision History row for this cycle.

## Note for next consolidator / freeze gate
- Re-review cycle for the whole export package is now complete (A/B/C/D all at v2.x with second-cycle reviews resolved). Remaining blockers to Requirement Package Freeze are the OPEN OQs above (D15, D1b, D12r, A-OQ17) — all routed to owners, none silently closed.
- OpenProject markdown renderer breaks a table row containing a literal `||`; keep `||` out of OP table cells (the PRD file itself is unaffected).
