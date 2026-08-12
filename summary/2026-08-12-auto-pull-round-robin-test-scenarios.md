# Summary — Auto-Pull / Round-Robin Improvement Analysis & Test Scenarios

**Date:** 2026-08-12
**Task Type:** ANALYSIS + TEST CASE
**Trigger:** Orchestrator mode

## What Was Done

1. **Delta Analysis (Assessment Report)** — Mapped behavioral delta between old classic round-robin test model (37 cases in `Round Robbin.tsv`) and new event-driven auto-pull logic (verified against BE source in `auto-pull-round-robin.md`). Core finding: the two models are fundamentally different distribution algorithms.

2. **Old TSV Disposition** — 37 cases classified: 22 VALID (eligibility + manual/UX), 8 OBSOLETE (round-robin-specific), 7 NEEDS REWRITE (concept valid, mechanism wrong).

3. **Requirement Extraction** — 27 testable rules (14 FR-AP + 13 EC-AP) with traceability seed for QA.

4. **Test Scenario Writing** — 38 new test cases (AutoPull-001–038) covering all 27 requirements. TSV + MD spec produced.

5. **Two reviewer gates passed** — Analysis reviewer caught 3 minor issues (fixed); QA test reviewer passed with no issues.

## Deliverables

| Artifact | Path |
|----------|------|
| Assessment Report | `Assessments/conversation/auto-pull-round-robin-improvement/auto-pull-round-robin-improvement-qa-assessment.md` |
| New Test TSV | `Test/New folder/Auto-Pull Round Robin v2.tsv` (38 cases) |
| QA Test Spec | `Test/New folder/Auto-Pull Round Robin v2-qa-test-spec.md` (760 lines) |
| Old TSV (reference) | `Test/New folder/Round Robbin.tsv` (37 cases, 22 still valid) |

## Key Findings

- **Model replacement:** Classic pointer round-robin → event-driven auto-pull (login burst / close→1 / 15-min cron)
- **New constraints:** Rate cap 10/120s per agent, maxConversation default=3, batch cap `min(50, eligibleCount×10)`, FIFO oldest-first, atomic `$size 0` guard, per-member Redis slot lock
- **Self-pull asymmetry:** User-triggered pull bypasses rate cap (by design)
- **PRD gap:** PRD v2.1 describes manual pull-only flow; improvement doc describes automated system not in PRD

## Open Questions (for Product/Engineering)

- OQ-001: `AUTO_PULL_TEAM_BATCH_LIMIT=50` tuning timeline (P2)
- OQ-002: `DEFAULT_MAX_CONVERSATION=3` confirmed? (P1)
- OQ-003: Monitoring for no-team conversations? (P1)
- OQ-005: Self-pull rate cap exclusion in PRD? (P2)
- OQ-006: PRD update needed? (P2)
