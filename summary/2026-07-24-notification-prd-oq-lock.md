# Summary — 2026-07-24: PRD Notification OQ Lock

## What
Closed all 8 open questions in `PRD/Notification/notification-recipient-channel-expansion-PRD-v0.md` following assessment recommendations.

## Decisions Locked
| # | Question | Decision |
|---|----------|----------|
| Q1 | Ticket teamInboxId strategy | **Opsi A** — derive from originating conversation |
| Q2 | Preference storage ownership | **notification-service** |
| Q3 | Multi-device phase 1 | **yes, from launch** |
| Q4 | Delivery log retention | **90 days** |
| Q5 | Feature flag granularity | **per-company** |
| Q6 | Backward-compat strategy | **single cutover behind flag** |
| Q7 | Supervisor fan-out placement | **notification-service resolver** |
| Q8 | Company-wide preference gate | **only conversation_ticket** |

## Files Changed
- `PRD/Notification/notification-recipient-channel-expansion-PRD-v0.md` — 15 patches:
  - Header status: Draft → *8 open questions closed; ready for review*
  - Revision history: added v0.2 entry
  - EC-004 (ticket teamInboxId): TBD → derived from conversation
  - EC-012 (company-wide preference gate): pending → confirmed
  - §11 Observability: removed `(pending §17 Q4)` 
  - §12.2 ticket transition state: unblocked
  - §14.2 preference API contracts: removed `(§17 Q2)` ownership markers
  - §14.4 event envelope backward-compat: resolved
  - §15 Delivery log + feature flag migration: removed pending refs
  - §16 data lifecycle: removed §17 Q2/Q4 references
  - §17: header + columns → CLOSED, column structure changed to Decision/Rationale
  - §18 risks: ticket teamInboxId risk → resolved; backward-compat → confirmed
  - §20 future considerations: Q8 ref → locked
  - §22 appendix checklist → locked decisions list
