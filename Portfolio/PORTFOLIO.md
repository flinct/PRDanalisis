# Case Study: PRD Analysis System for QA Strategy

## Overview

This repository demonstrates a structured system for analyzing PRD and BRD documents, maintaining reusable product knowledge, finding cross-feature risks, and turning product understanding into QA-ready validation scope.

## Problem

Product requirements were spread across multiple domains and document versions. Without a structured analysis system, QA and product reviewers could easily miss conflicts, deprecated behavior, hidden dependencies, and regression risks.

## Goal

Create a repeatable workflow that helps QA and product stakeholders answer:

- What is the current source of truth?
- Which rules are deprecated, changed, or still unresolved?
- Which features are already developed and which are still gaps?
- What areas need regression testing when a requirement changes?
- Which findings should become reusable product memory?

## My Role

- Structured PRD and BRD documents into reviewable product knowledge.
- Defined analysis rules for PRD review, impact analysis, memory routing, PRD writing, and test case creation.
- Built a reusable memory layer for canonical product behavior and feature-level analysis.
- Mapped ambiguity, conflict, implementation gaps, and regression-sensitive areas.

## Solution

The repository is organized as a lightweight product analysis knowledge system.

```text
PRD / BRD
  -> Rules
  -> Memory
  -> Analysis
  -> Impact / Regression Scope
  -> Test Coverage
```

## How I Break Down PRDs for QA

I do not treat a PRD as only a list of acceptance criteria. I break it down into QA-relevant parts:

| Breakdown Area | QA Purpose |
|---|---|
| Feature objective | Understand the business outcome that must be protected. |
| User roles and permissions | Identify RBAC scope, visibility rules, and access risks. |
| User journey | Convert flows into happy path, alternate path, and failure path scenarios. |
| Business rules | Extract testable rules, constraints, validations, and state transitions. |
| Data impact | Identify created, updated, derived, persisted, or read-only fields. |
| API and integration impact | Find dependencies between frontend, backend, external services, sockets, and background jobs. |
| UI behavior | Define what needs to be visible, editable, disabled, hidden, or synchronized. |
| Edge cases | Capture boundary cases, race conditions, missing states, and invalid actions. |
| Open questions | Separate unclear requirements from confirmed behavior so QA does not test assumptions as truth. |
| Regression scope | Decide which existing features must be retested because of the change. |

The output is not a PRD rewrite. The output is a QA-ready understanding: business rules, risks, scenarios, regression areas, and test coverage direction.

## How I Analyze PRDs Against Existing Product

Every PRD is analyzed against the current product baseline, not in isolation.

The comparison flow is:

```text
New PRD
  -> compare with global product memory
  -> compare with feature memory
  -> compare with V1/V2 source-of-truth status
  -> compare with known FE/BE implementation status
  -> identify delta, conflict, gap, and regression risk
```

I classify findings into:

| Finding Type | Meaning |
|---|---|
| New behavior | Requirement introduces behavior not currently in the product. |
| Changed behavior | Requirement changes existing product behavior and needs regression attention. |
| Deprecated behavior | Old PRD or legacy behavior should no longer be used as test truth. |
| Implementation gap | PRD expects behavior that FE/BE has not implemented yet. |
| Product conflict | PRD contradicts existing canonical rule or another PRD. |
| Open decision | Requirement cannot be tested safely until PM/Engineering confirms the rule. |

This approach keeps QA aligned with the real product. For example, if a PRD uses old status wording but the product already uses `open` / `closed`, the analysis records the mismatch and prevents test cases from being written against deprecated behavior.

## Key Design Decisions

- Separate raw requirements from analyzed product understanding.
- Keep system-wide truth in `Memory/global-memory.md`.
- Keep detailed feature reasoning in feature-specific memory files.
- Treat V2 documents as source of truth when V1 behavior is deprecated.
- Route only stable, reusable insight into memory.
- Avoid turning assumptions or temporary findings into canonical rules.

## Representative Work

| Work | Description |
|---|---|
| Global Product Memory | Canonical rules for conversation, ticketing, WhatsApp Web, SLA metrics, RBAC, and major open risks. |
| Conversation SLA Analysis | Deep analysis of FRT, TTC, RLT, Wait Time, pause rules, and unresolved policy conflicts. |
| V1 vs V2 Comparisons | Separation between deprecated behavior and current source of truth. |
| Undeveloped Feature Mapping | Identification of features not yet implemented and their QA/release implications. |
| Contact Visibility Testing | Example of converting RBAC and visibility rules into validation scope. |

## Impact

- Clearer source-of-truth hierarchy for product analysis.
- Better visibility into cross-feature dependencies and regression risk.
- Faster onboarding for QA/product reviewers because context is stored in memory.
- Reduced risk of testing against deprecated requirements.
- More consistent PRD analysis and test planning outputs.

## Reviewer Guide

For a quick portfolio review, read these in order:

1. [`presentasi.md`](../presentasi.md)
2. [`Memory/README.md`](../Memory/README.md)
3. [`Memory/global-memory.md`](../Memory/global-memory.md)
4. [`Rules/qa-analysis-rule.md`](../Rules/qa-analysis-rule.md)
5. [`Memory/comprehensive-undeveloped-features-analysis.md`](../Memory/comprehensive-undeveloped-features-analysis.md)

## Next Improvements

- Add sanitized public samples for sensitive PRD/BRD files.
- Add a traceability matrix from requirement to risk to test case.
- Add a GitHub Pages landing page for easier portfolio presentation.
- Add short visual diagrams for workflow, memory routing, and source-of-truth hierarchy.

## Public Sharing Checklist

- Remove or anonymize private company/client names if needed.
- Remove credentials, internal URLs, screenshots, and private business metrics.
- Keep representative samples that show analysis quality without exposing sensitive details.
- Add personal contact links after sanitization.
