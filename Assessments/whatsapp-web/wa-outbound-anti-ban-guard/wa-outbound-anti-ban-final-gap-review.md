# Final Gap Review - WhatsApp Web Outbound Anti-Ban Guard

## Overall Verdict

PRD and QA test spec are **almost ready for finalization**, but there are still a few **real loopholes / unresolved decisions** that should be explicitly closed before implementation starts.

## Remaining Gaps

| Gap ID | Area | Current State | Impact | Recommendation | Severity |
| ----- | ----- | ----- | ----- | ----- | ----- |
| GAP-001 | Scope boundary for non-text outbound | PRD still assumes Phase 1 covers broadcast + manual outbound, but does not lock whether media, attachment, or template sends are included. | Engineering may implement only text paths while stakeholders expect all outbound types. | Finalize Phase 1 as either `text only` or explicitly include attachment/template behavior. | High |
| GAP-002 | Duplicate fingerprint normalization | PRD mentions normalized content fingerprint, but exact normalization rules are still open. | Duplicate suppression may be inconsistent across whitespace, punctuation, template placeholders, or case changes. | Define canonical normalization inputs: trim, collapse spaces, lowercase policy, punctuation handling, spintax/template handling, attachment hash policy. | High |
| GAP-003 | Collision precedence between manual send and broadcast send | PRD acknowledges same-recipient collision, but precedence rules are not pinned. | Team may implement different winning rules across services. | Decide whether winner is `first lock winner`, `manual always wins`, or `broadcast already queued wins`, and document it. | High |
| GAP-004 | In-flight behavior when safe mode activates | PRD clearly stops new sends, but treatment of already in-flight sends is still implicit. | Partial sends may continue inconsistently during restriction events. | Clarify whether in-flight sends complete, soft-abort, or enter verification flow only. | Medium |
| GAP-005 | IT Support override capability | PRD leaves override as open question. | Access model may block urgent support action or create unsafe override paths later. | Decide whether support is strictly read-only or has limited temporary override under audit. | Medium |
| GAP-006 | Sender restriction signal source of truth | PRD assumes existing account-health signal exists, but event/field ownership is not fully pinned. | Safe mode may be delayed or inconsistent if signal source differs between services. | Identify exact producer/service for restriction and health-state events before implementation. | Medium |
| GAP-007 | Cross-tenant security coverage | Originally implicit only; now test spec includes TC-WA-ABG-024, but PRD still treats tenant isolation at NFR level. | Security bug risk if implementation under-specifies tenant boundary checks. | Keep TC-WA-ABG-024 and consider one explicit FR or API contract note for tenant scoping if desired. | Medium |

## Test Spec Review Notes

| Note ID | Observation | Action |
| ----- | ----- | ----- |
| TS-NOTE-001 | Test spec now covers 24 cases and closes the earlier missing explicit tenant-isolation case via `TC-WA-ABG-024`. | Keep this case in final test pack. |
| TS-NOTE-002 | Several cases are not suitable for sixV2Automation alone because they require worker-level injection or degraded dependency simulation. | Keep them in manual/integration/backend test lane. |
| TS-NOTE-003 | Manual TSV should remain a traceability/manual execution artifact, not the only source for automation readiness. | Use the automation mapping file as companion artifact. |

## Recommended Final Actions Before Locking PRD

1. Lock **text-only vs all outbound types** for Phase 1.
2. Lock **fingerprint normalization rules**.
3. Lock **manual vs broadcast collision precedence**.
4. Decide **support override model**.
5. Confirm **restriction signal producer** and event contract owner.

## Final Assessment

- **PRD:** Ready for stakeholder review, not yet fully implementation-final.
- **QA test spec:** Strong enough for planning and early QA execution.
- **Automation mapping:** Good enough to start Playwright planning for the ready subset.
