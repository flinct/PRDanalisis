# Summary — Agent Statistic Access: Dashboard Extensions Brainstorm (v2)

> **Date:** 2026-08-12
> **Owner:** Dany Christian (PM)
> **Mode:** Direct analysis (verified codebase anchors)

## Request
Dua ide lanjutan di atas security-fix ver2.8.1:
1. Mini dashboard terpisah dari halaman `/statistic`.
2. Interactive dashboard — KPI card clickable → drill ke conversation aktual (navigate+filter atau modal).

## Hasil
Artifact: `Assessments/cross-domain/agent-statistic-access/agent-statistic-dashboard-extensions-analysis.md`

### Extension 1 — Mini Dashboard
- **DEFER (YAGNI).** `/statistic` self-filtered (isSelfOnly via `useAnalyticsAccessMode.ts`) sudah de-facto agent dashboard. Duplikasi tanpa kebutuhan konkret.

### Extension 2 — Drill-Down Interactive
- **Layak, tapi ada masalah keras:** KPI card diisi endpoint count agregat (`/analytics/conversation/total-metrics` dll) → tidak bawa conversation ID.
- **8 card dianalisa:**
  - 4 bersih (total/open/closed/unassigned) → navigate + filter, BUT date-range gap (BE proto support, Zustand store tidak).
  - 2 butuh BE drill endpoint (replied conversations — TIDAK ada filter `replied` di proto; closed+ss — TIDAK ada filter `screenshot`).
  - 2 bukan conversation list (reply sent = message count, screenshot count) → non-clickable / defer.
- Card contoh PM ("percakapan sudah dibalas") = paling sulit (no filter `replied`).
- **RBAC:** drill wajib self-scoped via `isSelfOnlyScope()` + `resolveAgentId()` → DEPEND pada ver2.8.1 guard fix landing.
- **Recommendation:** per-card approach — navigate utk card bersih, modal+drill endpoint utk replied/closed+ss.
- **Effort:** M (Fase 1 navigate) + M (Fase 2 drill endpoint) + S-M (Fase 3 screenshot) = ~M-L total.

## Routing
| Extension | Routing | Reason |
|---|---|---|
| Mini dashboard | DEFER | YAGNI — `/statistic` self-filtered sudah cover |
| Drill-down | NEW_CHANGE_INTAKE_BRIEF terpisah | Net-new scope, depend v1.5 guard fix |

Keduanya dicatat di PRD v1.0 Section 17 (Future Considerations) TANPA menambah scope ver2.8.1.

## Next (PM decision)
Lihat 7 Open Questions di artifact. Kalau PM commit drill-down → buka Change Intake Brief baru, jangan campur brief v1.5.

## Addendum — Inventory + 3-Patch Decomposition (2026-08-12)

**Inventory:** `statistic-parameter-inventory-conversation-ticket.md` — parameter Conversation + Ticket yang bisa dihitung & tampil. Quick win 🟡: priority/spam/junked/group split (conv), channel breakdown (CSAT). Butuh compute 🔵: ticket priority/type, per-stage SLA, ticket channel breakdown.

**3-Patch Decomposition:** `statistic-3-patch-decomposition-analysis.md`
- P1: Agent Statistic Access — `ROUTE_PATCH_EXISTING_PRD`, artifact sudah ada (PRD patch v1.0 + brief v1.5), tinggal eksekusi. Target ver2.8.1.
- P2: Parameter Improvement — `ROUTE_PATCH_EXISTING_PRD` (addendum PRD Analytics). Filter fix + new metrics. Depend: paralel dengan P1. Target ver2.9/3.0.
- P3: Interactive Dashboard — `ROUTE_NEW_PRD`, drill-down clickable. Depend: P1 (guard) + P2 (filter+parameter). Target ver3.0+.
Reviewer: PASS setelah fix Patch 2 route + dependency text + OQ cleanup.

## Cross-Impact: Statistic × SAP Export (2026-08-12)
Artifact: `cross-impact-statistic-sap-export.md`
Intersection = 1 titik kritis: Export RBAC. Patch 1 `statistic:export` → gates SEMUA export (termasuk SAP Sub-PRD D yang pakai infrastruktur sama). Patch 2 & 3 = zero impact (berbeda data layer: aggregated vs row-level). SAP Sub-PRD A/B (new infra) harus REUSE `statistic:export`. Action: alignment saat SAP Sub-PRD D mulai PRD. Reviewer: PASS (20s, zero revisions).

## Change Intake Briefs Created (2026-08-12)
- **Patch 2:** `statistic-parameter-improvement-change-intake-brief.md` — filter fix + new metrics. Route: ROUTE_PATCH_EXISTING_PRD (addendum PRD Analytics). 5 OQ, semua open.
- **Patch 3:** `statistic-interactive-dashboard-change-intake-brief.md` — clickable drill-down. Route: ROUTE_NEW_PRD. 6 OQ, semua open. Phased (3a→3b→3c→3d). Depend P1+P2.

## PRDs Written (2026-08-12)
- **Patch 2:** `PRD/Analytics/Statistic/PRD Analytics - statistic parameter improvement.md` — 407 lines, 37.6KB. 10 FR, 9 US, 5 EH, 9 EC, 5 OQ open. Filter fix + conversation/ticket/CSAT parameters.
- **Patch 3:** `PRD/Analytics/Statistic/PRD Analytics - statistic interactive dashboard.md` — 478 lines, 44.5KB. 15 FR, 7 EH, 11 EC, 6 OQ open. StatisticCard clickable + drill endpoint + phased rollout. Draft status, semua OQ "Open — PM decision".
