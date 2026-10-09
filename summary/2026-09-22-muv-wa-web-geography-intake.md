# Session Summary — MUV + WA Web Geography Change Intake

> Date: 2026-09-22
> Author: Dany Christian (PM)
> Mode: Orchestrator (planner → analyzer → reviewer)

---

## What Happened

Two new feature requests received via orchestrator mode:
1. **MUV per Channel Platform** — count unique inbound clients per channel per month
2. **WA Web Geography-Based Exclusion** — exclude WA Web from packages by default, include only for Indonesian registrants

## Artifacts Produced

| Artifact | Path | Status |
|----------|------|--------|
| Change Intake Brief | `Assessments/change-intake/2026-09-22-muv-wa-web-geography-brief.md` | v1.0 ✓ |
| Assessment Report | `Assessments/change-intake/2026-09-22-muv-wa-web-geography-assessment.md` | v1.0 ✓ |

## Key Decisions

- **SPLIT_FEATURE** — two separate PRDs (different domains, owners, risks)
- **Request 1 (MUV):** NEW_CAPABILITY, Analytics domain, demand L2
- **Request 2 (WA Web):** NEW_CAPABILITY, cross-domain (Auth+WA Web+Subscription), demand L3/L4
- **Mechanism: NOT RBAC** — use country detection (+62 phone prefix → IP geo → declared) + tenant-level entitlement gate (existing add-on model)

## Reviewer Gate A Verdict

**`ask_user`** — artifacts are sound but blocking questions need PM decision before PRD drafting.

## Findings Summary

20 findings: P0:0, P1:3, P2:11, P3:6

Top risks:
- Country spoofing via +62 VPN/proxy
- UI-only enforcement bypass (must be server-side)
- Missing tenant country data model
- "subscription-service" misnamed (lives in company-service + payment-service)

## Blocking Questions (need PM input)

| ID | Question |
|----|----------|
| OQ-01 | "Inbound client" = unique contact (normalized phone) per channel per month, or unique conversation? Which channels in scope? |
| OQ-02 | Confirm mechanism = tenant entitlement (B+D), not RBAC. Lock country source priority. Confirm fail-closed on ambiguity. |
| OQ-03 | Legal/regulatory (→L4) or product/market strategy (→L3)? |
| OQ-04 | MUV as new Analytics section vs extend Add-ons US-6? |
| OQ-05 | Existing non-Indonesian tenants: grandfather or retro-exclude? |
| Demand | Request 1 demand level: L2 (hold) vs L3 (worth building)? |

## PRDs Produced (2026-09-23, user directive to proceed)

| PRD | Path | Reqs | Gate A |
|-----|------|------|--------|
| MUV / Unique Inbound Clients | `PRD/Analytics/PRD Analytics - Unique Inbound Clients per Channel.md` | FR-29/EH-5/EC-9/US-5 (48) | ✓ PASS |
| WA Web Geography Exclusion | `PRD/Whatsapp web v2/PRD WA Web - Geography-Based Entitlement Exclusion.md` | FR-24/EH-8/EC-8/US-6 (46) + 13 TC-WAGEO | ✓ PASS |

Blocking OQs (OQ-01/02/05) tetap terbuka di dalam PRD sebagai [DECISION NEEDED] — perlu PM/Eng sign-off sebelum Requirement Package Freeze (Gate B).

### PRD Key Decisions
- **MUV**: label bukan "MUV"/"Monthly Visitors" (collision Visitor Analytics FR-010) → "Unique Inbound Clients" / "Pelanggan Unik Bulanan". No-PII (hashed key/HLL, no raw phone), company-scoped, event-driven.
- **WA Web**: entitlement gate NOT RBAC. Server-side enforcement di createAccountChannel/InitInstance (403-WAGEO-EXCLUDED). Country field di company-service + audit. Fail-closed default-deny. Service names dikoreksi (company-service/payment-service, bukan "subscription-service").

## Next Steps

1. PM answers OQ-01 (MUV dedupe + channel scope), OQ-02 (WA mechanism + country source), OQ-05 (existing non-ID tenants)
2. Extend MUV traceability matrix to all 48 reqs (reviewer minor note)
3. Fix WA Web Option-letter inconsistency (B+C vs B+D+C, cosmetic)
4. QA pre-implementation review → Gate B freeze

## 2026-09-24 — MUV PRD codebase-alignment patch (orchestrator)

Compared MUV PRD vs Visitor Analytics review. MUV inherited 6 unverified codebase assumptions.
- analyzer (deleg_d9dc5287) verified 6 gaps vs real FE/BE → patch spec (file:line cited)
- reviewer (deleg_cbb5cd0f) VERDICT: PASS — 21 code citations confirmed, all anchors match, no overreach
- Applied ~30 replacements to `PRD/Analytics/PRD Analytics - Unique Inbound Clients per Channel.md` → v1.1

Gaps fixed:
- G-01 FE surface = Statistic page `/statistic` (VALID_SECTIONS+StatisticNav), NOT "Analytics"
- G-03 flag = env-var deploy gate (AGGREGATION_ENABLED pattern), no PM runtime toggle
- G-07 no company timezone field → reporting-timezone [DECISION NEEDED] (a: hardcode Asia/Jakarta, b: default Shift tz)
- G-09 FR-018 corrected: Redash query OR 3-hourly cron, NOT event-driven; gRPC reads happen at query time
- G-10 FR-016 deny = NEW logic via PermissionsGuard+@RequirePermissions(StatisticPermission), not narrowing helpers
- Removed all not-shipped Visitor Analytics FR cross-refs

PRD now has 9 [DECISION NEEDED] + 6 file:line code citations. Patch spec archived at PRD/Analytics/...-PATCH SPEC.md.

---

## Update 2026-09-28 — MUV TRD-blocker OQ closed → PRD v1.3

**4 product OQ dijawab (user/PM) + di-post ke OpenProject #3732** (activity #24256):
- OQ-01: metric = unique **normalized contact**; channels = 6 (WA Web, WA API, Widget, IG, Messenger, Email); **Telegram excluded** (F-04, no service).
- OQ-02: access = ADMIN/SUPER_ADMIN (wildcard) + SUPERVISOR (`StatisticPermission.ALL`) only; SUPERVISOR_SALES (READ) & SALES (none) excluded by design; **reuse existing perm, no new one** (verified `default-permission.constant.ts`).
- OQ-03: **exact hashed-set** (not HLL); ~18 GB @ 13-mo (card's 150 GB = over-estimate); store daily per-channel aggregate → swap-to-HLL without migration; escalate HLL only if >50K distinct/channel/day.
- OQ-04: month-bucket = `ConversationSLAMetrics.firstCustomerMessageAt ?? Conversation.createdAt` (verified: field 0 hits on conversation.schema, sidecar coverage not guaranteed = GAP-01). Regression test required for no-SLA conversations.
- Backfill (none, D-12) + Widget over-count (Phase-2) acknowledged.

**PRD reissued v1.3** (`Unique Inbound Clients (MUV)/...- v1.3.md`, 262 lines): 11 `[RESOLVED v1.3]` markers close OQ-01/02/03/04/Widget/Backfill + FR-004/005-part/010/011/016/018/019/029 + NF-4. v1.2 → `...-v1.2-superseded.md`.

**Remaining 13 `[DECISION NEEDED]` = Engineering-owned** (NOT product blockers): US-001 FE-flag path, F-02 normalizer choice, F-18 channel-enum, FR-013/EC-009 timezone, FR-018 pattern a/b, FR-028 env-var name, NF-1 retention TTL, NF-2 latency. TRD now free to leave Draft; orchestrator re-stamps assumptions + cuts BE/FE cards.

---

## Update 2026-09-28 (b) — FE/BE repo re-scan vs MUV OQ answers

Repos have large uncommitted WIP: **FE branch `data-cy` (236 dirty)**, **BE branch `v2.7.0` (474 dirty)**, heavy churn in `analytics-service`.

**Re-verified 4 MUV OQ code-facts vs current (uncommitted) code:**
| OQ | Prior fact | Current | Verdict |
|----|-----------|---------|---------|
| OQ-01 | Telegram no service | `apps/` still no telegram app | **holds** |
| OQ-02 | SUPERVISOR=ALL, SUPERVISOR_SALES=READ, SALES=none | `default-permission.constant.ts` modified: only ADD `StatisticPermission.EXPORT`; roles unchanged (SUPERVISOR@285=ALL, SUPERVISOR_SALES@297=READ@315) | **holds** (gate still denies SUPERVISOR_SALES) |
| OQ-03 | No HLL | still 0 HLL in analytics-service | **holds** (exact hashed-set OK) |
| OQ-04 | firstCustomerMessageAt only on sla-metrics.schema | still 0 on conversation.schema, only `conversation-sla-metrics.schema.ts` | **holds** (fallback pattern valid) |

**NEW code that touches MUV DECISION-NEEDED items:**
- **`apps/analytics-service/src/app/utils/jakarta-reporting-day.ts`** (new) hardcodes `REPORTING_TIMEZONE='Asia/Jakarta'`, builds completed-Jakarta-day UTC ranges for daily bucketing → **CLOSES FR-013/EC-009 timezone DECISION** (codebase picked option-a: hardcode Asia/Jakarta). MUV v1.3 should flip FR-013 from `[DECISION NEEDED]` to resolved (reuse `jakarta-reporting-day` util).
- **`apps/api-gateway/src/app/analytics/drill.controller.ts` + `drill-metric-mapper.util.ts`** (new) — metric drill-down feature (pending subagent detail).
- `StatisticPermission.EXPORT` new — statistic now has export capability.

**Impact on MUV v1.3:** OQ answers all still valid. One improvement available — FR-013 timezone no longer a decision (Jakarta util shipped). Pending full scan (deleg_3b4f6fcb) for drill feature + FE StatisticNav/VALID_SECTIONS current state.

---

## Update 2026-09-28 (c) — v1.3 patched with codebase-drift resolutions

Re-reviewed 4 product OQ vs current WIP code — **all 4 answers still valid, no reversal**. Patched v1.3 for codebase drift (7 edits):
- **FR-013 + EC-002 + EC-009 timezone → RESOLVED** (was DECISION NEEDED). `jakarta-reporting-day.ts` shipped (`Asia/Jakarta`) + scheduler cron `timeZone:'Asia/Jakarta'`. MUV reuses util, no new tz field. EC-009 → N/A (fixed constant).
- **FR-021 + dependency row**: per-day set now has concrete precedent (`conversation-daily-metrics.schema.ts` totalIds/openIds/closedIds L62-92). Bucket by Jakarta day, not UTC-midnight (old claim removed).
- **Revision history v1.3 row**: appended 2026-09-28 re-scan note.

Counts now: **13 `[RESOLVED v1.3]` / 11 `[DECISION NEEDED]`** — all 11 remaining are Engineering-owned (US-001 FE-flag, F-02 normalizer, F-18 channel-enum, FR-018 pattern a/b, FR-028 env-var, NF-1 retention, NF-2 latency). Zero product OQ open. Timezone fully removed from decision list.
