# Final Gap Review - WhatsApp Web Outbound Anti-Ban Guard

## Overall Verdict

PRD and QA companion artifacts are now **materially tighter and more implementation-directed**, but there are still a few **real loopholes / unresolved backend decisions** that should be explicitly closed before implementation starts.

## Remaining Gaps

| Gap ID | Area | Current State | Impact | Recommendation | Severity |
| ----- | ----- | ----- | ----- | ----- | ----- |
| GAP-001 | Duplicate fingerprint normalization | PRD now locks Phase 1 to text-only, but exact normalization rules are still open. | Duplicate suppression and protected resend matching may be inconsistent across whitespace, punctuation, casing, newline handling, or template placeholder rendering. | Define canonical normalization inputs: trim, collapse spaces, newline policy, lowercase policy, punctuation handling, placeholder/spintax handling, and one shared implementation owner. | High |
| GAP-002 | Collision precedence between manual send and broadcast send | PRD acknowledges same-recipient collision, but precedence rules are not pinned to one deterministic winner model. | Team may implement different winning rules across services. | Decide whether winner is `first lock winner`, `broadcast already protected wins`, or another canonical rule, and document it in FR/API/flow sections. | High |
| GAP-003 | FE behavioral evidence precedence | PRD now accepts FE context (`pasteDetected`, `sourceMessageAction`, `sourceMessageOrigin`, `sendFromCopiedMessage`), but conflict handling between FE evidence and text-match evidence is still open. | Backend classifier may behave inconsistently when FE signals are partial, contradictory, or stale. | Define explicit precedence for: FE-confirmed broadcast origin, exact-match-only evidence, ambiguous FE signal, and no FE signal. | High |
| GAP-004 | In-flight behavior when safe mode activates | PRD clearly stops new sends, but treatment of already in-flight sends is still implicit. | Partial sends may continue inconsistently during restriction events. | Clarify whether in-flight sends complete, soft-abort, or enter verification flow only. | Medium |
| GAP-005 | Sender restriction signal source of truth | PRD assumes existing account-health signal exists, but event/field ownership is not fully pinned. | Safe mode may be delayed or inconsistent if signal source differs between services. | Identify exact producer/service for restriction and health-state events before implementation. | Medium |
| GAP-006 | Permission-scoping hardening for anti-ban logs | PRD now moves to permission-based log access, but the exact permission primitive, issuer, and enforcement layer are still not named. | Different services may gate access differently, causing accidental overexposure or inconsistent dashboard behavior. | Name the canonical permission or policy gate used by FE/API and ensure server-side enforcement is checked in the contract. | Medium |
| GAP-007 | Cross-tenant security coverage | Test spec includes `TC-WA-ABG-024`, but PRD still treats tenant isolation mostly at NFR/API note level. | Security bug risk if implementation under-specifies tenant boundary checks. | Keep `TC-WA-ABG-024` and consider one explicit FR or API contract note for tenant scoping if desired. | Medium |
| GAP-008 | Actual send-point coordination in `whatsapp` (Baileys) service | Current PRD and companion docs focus on business guardrail + traceability, but they do not yet lock the technical choke point that serializes outbound sends per sender at the final Baileys send path. Technical analysis shows UI outbound and broadcast outbound can still overlap within milliseconds because they pace independently before converging at the same socket. | Even with correct resend classification and auditability, the same sender can still emit burst traffic that looks spammy to WhatsApp if send-point serialization is not enforced. | Lock a sender-level outbound queue inside `whatsapp` / `BaileysService` (single-instance assumption), define UI-high vs broadcast-low priority, lock configurable 3–8s gap semantics, queue overflow behavior, retry semantics, and observability requirements before implementation starts. | High |

## Test Spec Review Notes

| Note ID | Observation | Action |
| ----- | ----- | ----- |
| TS-NOTE-001 | Test spec now reflects permission-based log access and no longer depends on a Supervisor-only framing. | Keep permission-centric wording across all remaining companion docs. |
| TS-NOTE-002 | Several cases are not suitable for sixV2Automation alone because they require worker-level injection, internal config control, or degraded dependency simulation. | Keep them in manual/integration/backend test lane. |
| TS-NOTE-003 | Manual TSV should remain a traceability/manual execution artifact, not the only source for automation readiness. | Use the automation mapping file as companion artifact. |
| TS-NOTE-004 | New Baileys technical analysis is directly relevant to backend integration risk because it identifies the actual sender-level burst point after both outbound paths converge. | Reflect this as backend integration coverage, not only business-rule coverage. |

## Recommended Final Actions Before Locking PRD

1. Lock **fingerprint normalization rules**.
2. Lock **manual vs broadcast collision precedence**.
3. Lock **FE evidence precedence and fallback order**.
4. Confirm **in-flight behavior when safe mode activates**.
5. Confirm **restriction signal producer** and event contract owner.
6. Name the exact **anti-ban log access permission gate**.
7. Lock **actual send-point serialization strategy in `whatsapp` service** including sender key, priority rule, gap semantics, overflow handling, and retry behavior.

## Final Assessment

- **PRD:** Strongly improved and close to implementation-final, but still needs a few backend-decision locks.
- **QA test spec:** Strong enough for planning and early QA execution, with wording now aligned to permission-based log access and backend-managed policy.
- **Automation mapping:** Good enough to start Playwright planning for the ready subset, while backend-heavy and internal-config cases stay outside pure UI automation.
