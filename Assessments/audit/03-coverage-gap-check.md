# Assessment Report — Conversation Feature Audit Coverage Gap-Check

| Field | Value |
|---|---|
| Type | Meta gap-check (aspect coverage, not re-audit) |
| Owner | Analyst |
| PM / Eng Lead | Dany Christian / Naftal Yunior |
| Date | 2026-09-03 |
| Artifact | `Assessments/audit/2026-09-03-conversation-audit-coverage-gap-check.md` |
| Under review | Track E consolidated (`conversation/2026-09-02-conversation-consolidated-shortcomings-report.md`, 64 findings) + its 4 source audits; Track D FE-flow (3 files) as adjacent coverage |
| Decision | **PROCEED_WITH_CAUTION** — Track E covers the message engine deeply but leaves whole layers unaudited |
| Verdict | **PARTIAL** |

---

## 1. Executive Summary

Track E's 4 parallel audits are **deep and code-verified on ONE slice** of the Conversation feature: the message send/receive engine and its immediate data/API/security/UX surface inside `conversation-service` + `api-gateway` + `libs/common`. Within that slice coverage is strong (state machine, threading, schema/index, DTO contract, authz/throttle/XSS, perf hot-paths, a11y baseline). Track D separately covers FE UX flow + Conversation↔Ticket↔Setting requirement gaps.

But "Conversation feature" per `PRD/Conversationv2/` (24 PRDs) + `global-memory.md` canonical rules is much wider than the message engine. Entire **layers and features were not audited at all**: inter-service gRPC contract versioning, RabbitMQ event ordering/ack/DLQ semantics (only Redis dedup touched), observability/logging/metrics/tracing, automated test coverage of the module, migration/rollback runbook for the P0 index+schema fixes, cron/scheduler correctness (auto-pull, SLA reminder cron), realtime socket reconnect/resubscribe correctness, multi-tenant isolation on READ paths (only the send path was checked), and the **SLA engine BE implementation vs the SLA Engine Contract** — the single highest-risk canonical area (3-way Hold/Snooze/SLA conflict + undefined conversation reopen). Sub-features (CSAT, transcript, screenshot, notes, global search, custom attributes/collections, pull-queue, related conversations) and mobile were untouched.

**Answer to the core question:** the kanban audit did NOT comprehensively audit the Conversation feature. It comprehensively audited the **message-processing core** of it. Roughly 55–60% of the aspect surface is covered full/partial; ~40% (mostly cross-cutting infra + SLA + undeveloped features + mobile + sub-features) is un-audited or only shallow.

Finding counts of source corpus: Track E 64 (P0×7/P1×15/P2×24/P3×18). Track D 41 (2 CRIT/11 HIGH/20 MED/8 LOW). This report adds no product findings — it enumerates **coverage gaps**.

---

## 2. What Each Audit Actually Covered (scope map)

| Audit (Track E) | Files/layers touched | Concerns covered |
|---|---|---|
| Functional & Business Logic (22) | `apps/conversation-service/` services/repos/processors | State machine OPEN/CLOSE, outbound+inbound flow, dedup (Redis TTL), TOCTOU find-or-create, threading (email/IG/reopen chains), empty-body, concurrent assign/unread races, counter |
| Data Model & API Contract (18) | `conversation-service` schemas/indexes/repos/aggregations, `api-gateway/.../conversation` DTOs, `libs/common` proto/pagination | Message/conversation indexes, soft-delete aggregation bypass, tenant scope on **send** resolve, pagination clamp, Atlas-Search hard-dep, metaData/embedded-array bloat, denormalized-snapshot sync (fire-and-forget), counter txn |
| Security & Performance (13) | api-gateway controllers (incl. `conversation.open.controller`), WS gateway, DTOs, auth guards, message.service | sendMessage authz gap, open-API throttle, content-length, XSS/sanitize, metaData validation, WS widget impersonation, batch-delete size+sequential, typing-broadcast fanout, regex search |
| UX & Accessibility (17, folded) | FE conversation components | Icon labels, landmarks/skip-nav, mention badge, focus mgmt, aria-live, role=alert banners, auto-scroll, empty states, i18n hardcoded string, contrast, reduced-motion |
| Track D (adjacent, FE-flow) | FE flow + Conversation↔Ticket↔Setting PRDs | First-time/returning UX, reminder stub, unread undercount, filter/search persistence, refetchOnReconnect, SLA precedence/dual-SLA/AUX/reopen requirement gaps, create-ticket conflict |

**Layers/repos never opened by any Track E/D audit:** proto/versioning across the 23 contract files, RabbitMQ exchange/queue/ack/prefetch/DLQ config beyond conversation dedup, `audit-service` (RabbitMQ-only, no internal-action audit of conversation events), cron schedulers (`conversation-sla-reminder-cron`, auto-pull cron beyond one call-site mention), test suites, devops migration scripts, mobile app (`CLAUDE-mobile`).

---

## 3. Coverage Matrix

Legend: **full** = a dedicated audit dimension with findings; **partial** = touched incidentally or one facet only; **none** = not opened.

| # | Aspect / Dimension | Covered | Evidence (audit) | Gap note |
|---|---|---|---|---|
| **BE microservice layers** | | | | |
| 1 | Message send/receive flow (state machine, dedup, threading) | full | FUNC F-01..F-24 | Deep; message-status enum + reopen model flagged |
| 2 | Data model / Mongoose schema / indexes | full | DATA D1/D2/A5/A6/M6 | Message-collection index + soft-delete + embedded arrays |
| 3 | REST/gRPC DTO contract (gateway) | full | DATA A1/A2/M2/M3/M4/M5 | Pagination, boolean coercion, sort allowlist |
| 4 | Security: authz/throttle/injection/impersonation | full | SEC S1..S9, P2 | send authz, open-API throttle, XSS, WS impersonation |
| 5 | Performance hot-paths | partial | SEC P1..P4, DATA D1 | Batch-delete, typing fanout, regex, index. No load/soak, no connection-pool/backpressure profiling |
| 6 | UX / accessibility (FE) | full | UX C1..N6 | a11y baseline; also Track D FE flow |
| 7 | **gRPC inter-service contract versioning / back-compat** | none | — | 23 proto files, `int32 total` no approx flag noted (A2) but no versioning/breaking-change/back-compat audit across services |
| 8 | **RabbitMQ event ordering / idempotency / ack / DLQ** | partial | DATA A8, FUNC F-11 | Only fire-and-forget snapshot sync + inbound DLQ-no-replay. No ordering, poison-message, ack-timing, prefetch, redelivery, cross-service event contract typing (M5 minor only) |
| 9 | **Cron / scheduler correctness** | none | D3 mentions `conversation-sla-reminder-cron` in passing | Auto-pull rate-cap, SLA reminder cron, stale-cleanup timing (F-22) untested for concurrency/duplication/missed-run/timezone |
| 10 | **Multi-tenant isolation on READ paths** | partial | DATA D3 (send path only) | Only outbound send resolve checked. List/get/search/history/notes/counter READ paths not systematically checked for `companyId`/`organizationId` scoping |
| 11 | **Realtime socket reconnect / resubscribe correctness** | partial | SEC S6/S9/P3 (WS security+fanout); Track D E6 (refetchOnReconnect) | No audit of room re-subscription after reconnect, missed-event replay, at-least-once vs exactly-once emit, ordering of socket events vs DB writes |
| 11b | Widget/WS auth + CORS | full | SEC S6/S9 | Impersonation + CORS crash |
| **Cross-cutting concerns** | | | | |
| 12 | **Observability: logging / metrics / tracing / correlation IDs / alerts** | none | — | No audit of structured logs, PII-in-logs (SEC-01 is a Broadcast finding, not conversation), metrics, trace/correlation propagation gRPC↔RMQ↔socket, alerting on the P0 hot-read |
| 13 | **Automated test coverage of the module** | none | — | No inventory of unit/integration/e2e coverage for conversation-service; no assertion the P0 races/index fixes are/aren't test-guarded |
| 14 | **Migration / rollback runbook for P0 index+schema fixes** | partial | consolidated §6 notes dedup-before-index prerequisite | Names the prerequisite but no rollback/detection/validation plan; rolling index build blast radius, `deleted`→`isDeleted` data backfill, counter-gap migration undefined |
| 15 | Recovery / reconciliation | partial | DATA A8 (reconciliation job recommended), FUNC F-11 (DLQ replay) | Recommended not audited; no failover/degradation/backup-restore review |
| 16 | i18n / localization depth | partial | UX M1/M2, Track D D6 | Only 2 hardcoded strings spot-found; no systematic i18n coverage sweep (default locale `id`) |
| **PRD/Conversationv2 feature surface** | | | | |
| 17 | **SLA engine BE impl vs SLA Engine Contract** (FRT/RLT/TTC/Wait, office-hours, pause) | none | Track D A1..A9 are requirement gaps, not BE-impl audit | Highest-risk canonical area. No code audit that BE computes FRT=Wait+RLT invariant, office-hours snapshot, pause intervals per `conversation_sla_metrics` |
| 18 | **Hold / Snooze / SLA 3-way conflict** (open risk) | none | global-memory open risk; Track D A3/C6 flag at requirement level | Undeveloped; no impl audit. Canonical known-critical open risk |
| 19 | **Conversation SLA reopen behavior** (undefined) | partial | FUNC F-02/F-14 audit reopen *doc-forking*; Track D A5 flags handoff | Reopen SLA-cycle semantics vs ticket still undefined; not resolved |
| 20 | Assignment / ownership / participants model + RBAC enforcement | partial | FUNC F-19 (concurrent assign race); Track D B1..B5 | `participants` ownership + assignee-vs-team-inbox validation is Track D requirement gap; BE RBAC enforcement per canonical Sales/Operational/SuperAdmin not code-audited |
| 21 | Chat-list filtering (Inbox×Channel×Team×RBAC intersection) | partial | Track D E-series (FE) | Canonical scope-never-exceeds-visibility invariant not enforcement-audited on BE list/search |
| 22 | Global Search (Conversation+Ticket) | none | — | Dedicated PRD; only conversation-list Atlas/regex touched (A3/P4). Cross-domain search unaudited |
| 23 | Custom Attributes (single + Collections) | none | — | Schema `metaData` bloat touched (A4) but not the Custom Attributes / Collections feature semantics/`ui_editable`/readOnly |
| 24 | Get New Conversation / Agent Pull Queue | partial | Track D B2 (AGENT access path); BE auto-pull mentioned | Queue synchronization / double-pull prevention / round-robin BE not audited |
| 25 | Related Conversations Grouping (Primary+Child) | none | Track D C2 (requirement interaction only) | Undeveloped; grouping impl not audited |
| 26 | WhatsApp Group Mention in Conversation | none | — | Undeveloped feature; PRD exists, no audit |
| 27 | Team Inbox / Member Drawer / Online Status HUD | none | — | Not audited |
| 28 | Ownership Decoupling (Team Inbox × Channel Numbers) | none | — | `conversation_id`-as-key canonical rule; not code-audited |
| 29 | Availability Auto-Reply | none | Track D A7 (requirement contract only) | Undeveloped; bot-must-not-complete-FRT contract not enforced/audited |
| 30 | Room Reminder | partial | Track D E1 (reminder = `console.log` stub, FE) | BE reminder scheduler + shared/user-specific semantics not audited |
| 31 | CSAT / transcript / screenshot / conversation-note sub-modules | none | — | Owned by conversation-service per BE map; none audited |
| 32 | Channel-specific: Shopee add-on, Instagram comment, email transcript reply | partial | FUNC F-15/F-16 (email/IG threading only) | Shopee channel add-on unaudited; email/IG only at threading level |
| 33 | Response Metrics tracking (RLT/Wait Time events) | partial | global-memory data model; Track D A-series | Event accuracy/immediacy of `firstAgentAssignmentAt` etc. not code-audited for correctness/atomicity |
| **Client surfaces** | | | | |
| 34 | Mobile app conversation surface | none | — | `CLAUDE-mobile` exists; zero mobile audit |
| 35 | FE state mgmt / query cache / socket store correctness | partial | Track D E-series | Stale-cache, cross-view state, reconnect — FE-flow only, not exhaustive |

Tally: full **6**, partial **13**, none **16** (of 35 aspects). Weighted by risk, the "none" bucket contains the two highest-risk canonical areas (SLA engine + Hold/Snooze/SLA conflict) and all infra cross-cutting concerns.

---

## 4. Un-Audited / Shallow Aspects — Prioritized by Risk

### P0 — audit next (highest risk, canonical or infra-critical)
1. **SLA engine BE implementation vs SLA Engine Contract** — verify code computes FRT=Wait+RLT, office-hours snapshot, per-metric pause intervals in `conversation_sla_metrics`; the canonical invariant and pause matrix (global-memory §SLA) are unverified against code. Ties to Track D A1/A2/A4.
2. **Hold / Snooze / SLA 3-way conflict + Conversation SLA reopen** — the two named canonical open risks; no impl audit exists. Even if undeveloped, audit must confirm current behavior doesn't silently mis-pause SLA.
3. **Multi-tenant isolation on ALL read paths** — Track E only checked the send resolve (D3). Systematically audit list/get/messages/history/search/notes/counter/CSAT for `companyId`/`organizationId` scoping (IDOR class).
4. **Migration / rollback runbook for P0-03 index + P0-07 `deleted`→`isDeleted` + counter-gap** — detection, rolling-build blast radius, dedup-before-unique-index data migration, rollback + validation. Consolidated names the prerequisite but not the plan; shipping P0s blind is the real production risk.

### P1 — high
5. **RabbitMQ event semantics** — ordering, at-least-once redelivery, poison-message/DLQ replay (F-11), ack timing, prefetch=10 backpressure, cross-service event-contract typing (M5). Snapshot-sync (A8) is one facet only.
6. **Realtime socket reconnect/resubscribe correctness** — room re-subscription after reconnect, missed-event replay, socket-emit vs DB-write ordering, exactly-once emit. Track D E6 only fixes FE refetch.
7. **Observability** — structured logging, PII-in-logs on conversation paths, metrics on the hottest read (P0-03), trace/correlation-ID propagation across gRPC↔RMQ↔socket, alerting.
8. **Automated test coverage inventory** — are the audited P0 races/indexes test-guarded? Regression risk of the fixes is unknown without this.
9. **Cron/scheduler correctness** — SLA reminder cron + auto-pull rate-cap + stale-cleanup: concurrency, duplicate fire, missed run, timezone/office-hours edge.
10. **gRPC contract versioning / back-compat** — 23 proto files; breaking-change discipline across services (the `int32 total` A2 is a symptom).

### P2 — medium
11. Global Search (Conversation+Ticket) cross-domain impl.
12. Assignment/ownership/participants BE RBAC enforcement (canonical Sales/Operational/SuperAdmin) + assignee-vs-team-inbox validation.
13. Chat-list filtering intersection invariant enforcement on BE (scope-never-exceeds-visibility).
14. Pull-queue synchronization / double-pull / round-robin BE.
15. CSAT / transcript / screenshot / conversation-note sub-modules.
16. Custom Attributes (single + Collections) semantics; Shopee channel add-on.
17. i18n systematic sweep (default locale `id`).

### P3 — low / when-developed
18. Undeveloped features (Related Conversations, WA Group Mention, Auto-Reply, Room Reminder, Collaborator, Hold-state, Snooze) — audit at build time; only requirement gaps exist now.
19. Mobile app conversation surface.
20. Team Inbox / Member Drawer / Online Status HUD; Ownership Decoupling.

---

## 5. Verdict

**PARTIAL.** The kanban/multi-agent audit did NOT comprehensively audit the Conversation feature; it comprehensively audited the **message send/receive engine and its immediate data/API/security/UX surface** — and did that well, with real code evidence (file:line) and sound P0/P1 prioritization. But "the Conversation feature" as defined by `PRD/Conversationv2/` + `global-memory.md` is far wider. Whole layers went untouched — SLA-engine-vs-contract, RabbitMQ event semantics, observability, test coverage, migration/rollback, cron correctness, multi-tenant READ-path isolation, gRPC versioning — and the two highest-risk **canonical** open items (Hold/Snooze/SLA 3-way conflict, Conversation SLA reopen) plus every undeveloped V2 feature and the mobile surface were out of scope. The audit is a strong vertical slice, not comprehensive breadth.

---

## 6. Assumptions
- Branch target operasional sekarang `prod-2.8.1`; memory FE/BE menjadi patokan utama. Coverage claims here remain branch-agnostic (aspect-level).
- UX & Accessibility source audit (t_ee1a7a9d) has no standalone file; its 17 findings taken from the consolidated report as authoritative.
- "none" = not opened by any Track E/D file read; not a claim the code is defective, only that the aspect is un-audited.
- Track D treated as adjacent coverage (FE UX + interconnection), not part of the Track E kanban being gap-checked, but credited where it covers an aspect.

## 7. Risks
- Shipping the 7 P0s (esp. index rebuild + `deleted`→`isDeleted` + tenant-scope send) without the missing **migration/rollback** aspect (gap #4) is itself a production risk.
- The **SLA engine** gap (#1) is the most consequential un-audited area: canonical invariant `FRT=Wait+RLT` and the pause matrix are load-bearing for reporting/billing and remain code-unverified.
- Multi-tenant READ-path gap (#3): Track E proved one isolation break on send (D3) — sibling read paths are statistically likely to share the pattern and are unaudited (IDOR blast radius).

## 8. Follow-up Tasks
1. Spawn a new SLA audit track: **SLA engine BE vs SLA Engine Contract** + Hold/Snooze/SLA 3-way + reopen (P0 #1/#2).
2. Spawn **multi-tenant READ-path isolation sweep** across all conversation read endpoints (P0 #3).
3. Author **migration/rollback runbook** for the 7 P0s before ticketing them (P0 #4) — non-bypassable per profile impact_analysis(migration).
4. Spawn **infra-concerns audit**: RabbitMQ semantics + socket reconnect + observability + cron + gRPC versioning (P1 #5–#10) as one track.
5. Inventory **automated test coverage** of conversation-service; map to the confirmed P0/P1 fixes (regression guard).
6. Fold this gap-check into `core/audit-master-register.md` as coverage metadata; dedup Track E/D against register before ticketing (per reading-list rule).

---

[analyzer] verdict: partial — reason: Track E deeply and code-verifiably audited the Conversation message engine (state machine, data/index, API/DTO, security, perf, a11y) but left ~40% of the feature's aspect surface un-audited: SLA-engine-vs-contract + Hold/Snooze/SLA 3-way + reopen (highest-risk canonical), multi-tenant READ-path isolation, RabbitMQ event semantics, socket reconnect correctness, observability, test coverage, migration/rollback for the P0 fixes, cron correctness, gRPC versioning, plus all undeveloped V2 features and mobile. Comprehensive on breadth of ONE slice, not on the feature.
