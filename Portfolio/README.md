# Product Analysis & QA Strategy Portfolio

Portfolio repository for demonstrating structured PRD analysis, product risk mapping, QA strategy, and knowledge management for an omnichannel customer support platform.

## Portfolio Snapshot

| Area | Detail |
|---|---|
| Role demonstrated | Product Analyst / QA Analyst / Requirements Analyst |
| Domain | Omnichannel inbox, ticketing, WhatsApp Web integration, SLA metrics, RBAC |
| Main output | PRD analysis system, cross-feature memory, impact analysis, test strategy |
| Core skill | Turning scattered requirements into clear product rules, risks, and validation scope |

## What This Repository Shows

- Ability to read and structure complex PRD documents across multiple product domains.
- Ability to detect requirement gaps, ambiguity, conflict, hidden dependency, and regression risk.
- Ability to convert product understanding into QA-ready analysis and test coverage.
- Ability to break down PRDs into QA-relevant business rules, user flows, edge cases, regression scope, and test direction.
- Ability to analyze new PRDs against the existing product baseline, implementation status, and canonical product memory.
- Ability to maintain reusable product memory so future analysis does not restart from zero.
- Ability to compare V1 vs V2 product behavior and separate deprecated rules from current source of truth.

## Repository Structure

| Path | Purpose |
|---|---|
| `PRD/` | Source product requirements grouped by feature/domain. |
| `BRD/` | Business requirement inputs and working documents. |
| `Rules/` | Analysis frameworks, workflow rules, memory routing, PRD writing, QA analysis, and test case rules. |
| `Assessments/` | Canonical assessment artifacts with version history and templates. |
| `Scripts/` | Analysis, parsing, and migration helper scripts. |
| `Test/` | QA validation documents and test-related outputs. |
| [`presentasi.md`](../presentasi.md) | Presentation explaining how this PRD analysis repo works for QA. |
| [`Portfolio/PORTFOLIO.md`](PORTFOLIO.md) | Case study version of this repository for portfolio review. |

## Recommended Review Path

1. Start with [`PORTFOLIO.md`](PORTFOLIO.md) for the portfolio case study.
2. Read [`presentasi.md`](../presentasi.md) to understand the operating model.
3. Read [`Memory/README.md`](../Memory/README.md) to understand the knowledge architecture.
4. Review [`Memory/global-memory.md`](../Memory/global-memory.md) for canonical product rules.
5. Check selected deep dives in `Memory/` and `Assessments/` for analysis quality.

## Highlight Artifacts

| Artifact | Why It Matters |
|---|---|
| [`Rules/qa-analysis-rule.md`](../Rules/qa-analysis-rule.md) | Defines the senior QA analysis method used across PRD, feature, bug fix, interconnection, impact, and risk scenarios. |
| [`Rules/workflow-rule.md`](../Rules/workflow-rule.md) | Defines the required analysis order so every task starts from rules and memory before reading feature-level detail. |
| [`Memory/global-memory.md`](../Memory/global-memory.md) | Stores canonical product rules and cross-domain risks for conversation, ticketing, WhatsApp Web, SLA, and RBAC. |
| [`Memory/conversation-sla-rlt-frt-ttc-analysis.md`](../Memory/conversation-sla-rlt-frt-ttc-analysis.md) | Deep analysis of SLA metric definitions, conflicts, formulas, and unresolved policy decisions. |
| [`Memory/comprehensive-undeveloped-features-analysis.md`](../Memory/comprehensive-undeveloped-features-analysis.md) | Maps undeveloped features across Conversation, Ticket, and WhatsApp Web domains with QA and release implications. |
| [`Test/test-contact-context-visibility.md`](../Test/test-contact-context-visibility.md) | Example of turning product/RBAC analysis into validation scope. |

## Methodology

```text
PRD / BRD input
  -> apply analysis rules
  -> read global and feature memory
  -> identify business rules, gaps, risks, and dependencies
  -> produce impact analysis and regression scope
  -> route stable findings back into memory
  -> generate QA-ready validation artifacts
```

## Skills Demonstrated

- Requirements analysis
- Product documentation architecture
- Cross-PRD comparison
- QA strategy and regression planning
- Risk and impact analysis
- RBAC and SLA behavior analysis
- Knowledge management for product teams
- Clear technical writing for QA, product, and engineering stakeholders

## Publishing Note

Before making this repository public, review all PRD/BRD files for private company, client, credential, or internal business information. For a public-facing portfolio, consider keeping only sanitized samples and the analysis framework.
