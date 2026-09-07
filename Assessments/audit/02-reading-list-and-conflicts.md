# SatuInbox — Audit Review + Prioritized Reading List

> Task t_daf34b91. Reviewed all audit outputs in `Assessments/audit/`, deduped, produced source-file reading list.
> Baseline: BE `prod-2.7.0`, FE `prod-2.7.0-11`. Owner: PM Dany Christian, Eng Lead Naftal Yunior.
> **Core files** (this file + register + code-verified evidence) now live at repo root `Assessments/audit/` dengan prefix nomor (00–03). Detail per-area di sub-folder `detail-*/`; arsip di `_source/`.

---

## 1 | What exists (deduped)

Five independent audit tracks + one knowledge-base track. Do not merge them — different sources, scopes, methods.

### Track A — Code + PRD audit (canonical)
- `01-audit-master-register.md` **v1.5** — SINGLE SOURCE OF TRUTH. 71 findings. Wins on any conflict.
- `2026-09-02-satuinbox-audit-3-synthesis.md` — evidence↔register cross-check. NO new findings; its patches (DI-06 add, V17 close) already applied to register (v1.2). Read only for traceability rationale.

Register breakdown (61):
| Bucket | Count | State |
|---|---|---|
| Confirmed — priority (code-verified bugs) | 8 (DI-01, SEC-02, DI-04, SEC-04, INT-03, SEC-01, F-07, ENV-01) | ticket-ready, gated by ENV-01 |
| Confirmed — positive controls | 10 | keep, don't touch |
| Confirmed — non-priority | 16 (C1–C16) | backlog |
| Needs-validation (PRD/memory inference) | 25 (V1–V26 minus closed V17) | verify code / decision meeting |
| Corrected | 1 (FS-05 → DLQ exists) | do not backlog |
| Closed dup | 1 (V17) | — |

Gate: **ENV-01** — branch target not locked (repo `prod-2.7.0` vs memory `v2.8.0`). All `confirmed` valid ONLY for prod-2.7.0. No ticketing until branch locked.
Decision-only (not tickets): V1/V2 (Catastrophe SLA conflicts) + V3–V6 (SLA modes) → PM+Eng meeting.

### Track B — UI/UX heuristic audit (FE-only, separate)
- `detail-uiux/uiux-audit-report-sabrina.md` — Sabrina, 5 Jun 2026, Nielsen 10-heuristic. 33 findings (30 numbered + 3 sidebar). Severity 0–4. Dominant: Consistency & Standards 8/33 = design-system-not-enforced, not missing features.
- `detail-uiux/uiux-impact-assessment.md` v1.0 (Draft) — analyst impact analysis of Track B on FE repo. Verdict `PROCEED_WITH_CAUTION`. Key: root cause = shared atoms in `packages/ui`, blast radius CRITICAL. Needs revision pass (a11y formal/WCAG, i18n, responsive breakpoints, RBAC visibility) before any Severity-3 commit.

Track A ∩ Track B overlaps (same defect, two sources — dedup when ticketing):
- Raw error leak: register **F-07** ≈ UI #11 (Broadcast draft tech error) + #29 (WA Web no recovery CTA).
- A11y: register **UX-05/UX-06** ≈ UI #4 (badge contrast) + keyboard nav.
- Error prevention auto-save: UI #17/#22 (Roles no Save/Cancel) — NOT in register; new FE finding.

### Track C — FDF knowledge base (NOT audit findings)
- `reference/{conversation,tiket,productdomainmap,fdf-development-roadmap}.md` — Feature Dependency Flow docs (module map, per-domain knowledge, 6-phase roadmap). Misfiled under `audit/`. No findings. Reference only; ignore for remediation.

### Track D — Conversation UX flow audit (Phase 2, FE code-verified, separate)
- `detail-conversation/_source/2026-09-02-conversation-first-time-user-flow-audit.md` — first-time user flow. 2 core gaps: empty state without CTA, assignment/ownership invisible (`participants: []`).
- `detail-conversation/_source/2026-09-02-satuinbox-audit-2-conversation-returning-user-flow.md` — returning/power-user flow. reminder = `console.log` stub, unread undercount when >20, filter/search state lost on view switch, no auto-refresh on socket reconnect.
- `detail-conversation/_source/2026-09-02-conversation-phase2-synthesis-report.md` — **synthesis** of the two flow audits + interconnection. 41 unique findings (from 44 raw), 5 themes. Severity: 2 CRITICAL, 11 HIGH, 20 MEDIUM, 8 LOW. Decision: `REVISE_PRD` (structural) + `PROCEED_WITH_CAUTION` (FE quick-win). Read this first for Track D.

NOT yet folded into register (Track A) or reading list below — separate scope (Conversation FE UX). Dedup against Track A/B before ticketing.

### Track E — Conversation BE deep-dive (4 parallel code-verified audits + consolidated)
Backend code review, `Desktop/BE satuinbox/omnichannel-satuinbox-be` + FE. Separate from Track D (FE UX flow).
- `detail-conversation/_source/2026-09-02-conversation-consolidated-shortcomings-report.md` — **CONSOLIDATED, read first.** 64 distinct findings (70 raw, 6 overlaps merged) from the 4 audits below. P0×7, P1×15, P2×24, P3×18. 6 themes: multi-tenant isolation leak on hot send path, missing DB indexes + soft-delete gaps, no input validation at trust boundary, rate limit on 1/~30 endpoints, thin conversation state model, no a11y baseline.
- `detail-conversation/_source/conversation-functional-business-logic.md` — Functional & Business Logic (t_4fce10b4), 22 findings. State machine, threading, edge cases.
- `detail-conversation/_source/2026-09-02-conversation-data-model-api-contract-audit.md` — Data Model & API Contract (t_d2e41ce1), 18 findings (3 CRITICAL). Missing Message indexes, soft-delete aggregation bypass, tenant scope on send path.
- `detail-conversation/_source/2026-09-02-conversation-security-perf-audit.md` — Security & Performance (t_b2b7a6c0), 13 findings. `POST /conversations/send` no authz, Open API zero throttle.
- UX & Accessibility (t_ee1a7a9d), 17 findings — folded into consolidated report (no standalone file present).

Top P0 (from consolidated): P0-01 send endpoint no authz (`conversation.controller.ts:1408`), P0-02 soft-delete leak in aggregations (`message.repository.ts:88`), P0-03 Message collection zero indexes (`message.schema.ts:180`), P0-04 `findActiveConversationById` no tenant scope on send (`conversation.repository.ts:226`), P0-05 Open API zero throttle.

NOT yet folded into register (Track A). Overlaps Track A DB-index findings (V8/P-01) + Track D reminder/unread — dedup before ticketing.

### Track F — Conversation sidebar navigation (FE+BE cross-verified)
Dashboard kanban audit (2026-09-03), all 3 claims cross-checked against source (FE + `Desktop/BE satuinbox/omnichannel-satuinbox-be`). Confidence TINGGI (symbols match, line drift ≤20).
- `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` — **synthesis, read first.** + Verifikasi Cross-Check section (verdicts + file:line).
- `detail-conversation/2026-09-03-counter-divergence.md` — sub-report: counter divergence.
- `detail-conversation/2026-09-03-default-channel-display.md` — sub-report: default channel display (F1 channelMap key).
- `detail-conversation/2026-09-03-team-inbox-rules.md` — sub-report: team inbox rules (C2 shouldScopeByTeam).

Verified findings: C1 (CRITICAL, CONFIRMED) FE `ConversationNavItemDefault.tsx:142,294-295` gate pakai `role.name` vs `RoleTypeEnum` code → SALES agent lolos, SUPERVISOR SALES kehilangan create-team. C2 (MAJOR, CONFIRMED) `shouldScopeByTeam` (conversation.service.ts:6477) hanya AGENT/SUPERVISOR tapi `resolveTeams` scope semua non-ADMIN. F1 (HIGH, CONFIRMED w/ nuance) channelMap guard valid tapi efek = drop WA_WEB_GROUP/IG_COMMENT bucket (butuh keputusan produk). C3 downgrade MAJOR→MEDIUM (guard ADA di repo `buildAssignFilter`, bukan controller).
NOT yet folded into register (Track A). C1/C2 overlap Track D RBAC-visibility + Track B RBAC visibility gap — dedup before ticketing.

### Track G — Infra/DevOps audit (folded partial, register v1.5)
- `detail-infra/satuinbox-infra-audit.md` — 69 temuan infra: secrets, CORS, SPOF, alerting, test coverage, docs. **10 Critical sudah folded ke register** sebagai `INFRA-01..10` (confirmed). Sisa 59 (High/Med/Low) **belum di-fold** — baca file ini langsung untuk backlog infra.
- **INFRA-01** (committed secrets: DB password + API key di git) = **active risk**, kerjakan lebih dulu (rotate + `git rm --cached`, 30 menit).

### Arsip source (2026-09-04)
Source file 09-01/09-02 yang temuannya sudah terserap dipindah ke `_source/` (root) dan `detail-conversation/_source/` — history via `git mv`, baca hanya untuk file:line detail:
- `_source/` (root): 09-01 system-audit, extension-performance-flow-ux, rule-adherence, orchestrator-compliance, qa-compliance, comprehensive-master, meta-audit, audit-3-synthesis, register-review.
- `detail-conversation/_source/`: 6 source Track D/E + 2 synthesis lama. Gantinya: **`detail-conversation/2026-09-02-conversation-audit-merged.md`** (Track D+E digabung, 105 finding).

---

## 2 | Prioritized reading list (source files to read next)

Ordered by execution priority. Paths = SatuInbox repos (`backend-v2` / `omnichannel-satuinbox-fe`), not this analysis repo.

### GATE — read first, blocks everything
| # | File | Why |
|---|---|---|
| 0 | `Memory/global-memory.md` §SLA/Chat List + repo branch state | Resolve ENV-01: confirm `prod-2.7.0` vs `v2.8.0` target. All confirmed findings hinge on this. |

### P1 — Confirmed priority bugs (verify + fix)
| # | File | Finding | Why |
|---|---|---|---|
| 1 | `broadcast.proto:72-75` + `broadcast.service.ts` `createBroadcast()` | DI-01 | No `requestId`/dedup → double broadcast. Proto change build-breaking. |
| 2 | `client-contact.schema.ts:101` | SEC-02 | Phone index `sparse` non-unique; memory claims unique. |
| 3 | contact gateway `checkDuplicateContact` path | DI-04 | No atomic merge → race. Confirm absence before writing upsert. |
| 4 | `audit-service/src/main.ts` + `app.module.ts` | SEC-04 | Only 1 consumer (`OPEN_API_REQUEST_LOGGED`); no internal-action audit. |
| 5 | `broadcast-dlq.processor.ts:120` | INT-03 | Non-TLS fallback when cert missing (violates mTLS mandatory). |
| 6 | `whatsapp-api.controller.ts:144` | SEC-01 | `console.log(payload)` leaks tenant ID + WA number. Quick win. |
| 7 | `throw-service-error.ts` + 278 call sites (FE `apps/omnichannel`) | F-07 | Raw BE error leak, 0 error mapper. Phased; start 5 core negative-path flows. Dedup with UI #11/#29. |

### P2 — Confirmed non-priority (backlog, cheap verify)
| # | File | Finding |
|---|---|---|
| 8 | `makeQueryClientHelper.ts:11` | C1/PERF-01 — add `refetchOnReconnect:true` (1 line) |
| 9 | `broadcast.processor.ts:209` + retryTracker Map | C7/INT-06 + C16/DI-06 — in-thread sleep + in-memory retry state |
| 10 | `.env.example:77,91` | INT-01 — dup `GRPC_ANALYTICS_URL` config trap |
| 11 | `packages/constants/src/socket.ts` | C15/UX-07 — `SOCKER_ERROR_MESSAGE` typo |

### P3 — Needs-validation, code-verifiable (grep/index check)
| # | File | Finding |
|---|---|---|
| 12 | MongoDB `conversation` collection indexes | V8/P-01 — 4-dim filter, no compound index |
| 13 | `base.constant.ts:216` + `conversation.repository.ts:283` | V9/P-02 — Atlas search `ENABLED` flag maybe dead code |
| 14 | FE SLA color render path | V3/F-03 — absolute-time vs PRD percentage |
| 15 | FE group FRT visibility | V7/F-06 — group FRT hidden |

### P4 — Decision meeting (read PRDs, NOT code — no tickets yet)
| # | File | Finding |
|---|---|---|
| 16 | `PRD/Conversationv2/` files 9, 12, 13, 16 | V1/F-01 (Hold vs Snooze vs SLA) + V2/F-02 (reopen 3 defs) — Catastrophe, REVISE_PRD |
| 17 | `global-memory.md` §SLA (FRT start, SLA mode) | V5/F-05 + V6/SLA-mode — PM+Eng decision |

### Track B — FE UI/UX (separate work, read after revision pass)
| # | File | Finding |
|---|---|---|
| 18 | `packages/ui/src/components/atoms/{badge,button,input,select,dropdown-menu,toggle,form}.tsx` | Root of Consistency findings #8/#13/#16/#26 + #4 contrast. Refactor atoms FIRST (CRITICAL blast radius), then per-page. |
| 19 | Roles/permission settings pages (auto-save) | UI #17/#22 — no Save/Cancel, error-prevention. Check RBAC v2 conflict before changing. |
| 20 | `packages/i18n/**` next-intl message files | UI #11 tech-error wording + hardcoded strings; fills AUD-REV-02. |

### Skip (not findings)
- `reference/*.md` (Track C, FDF docs) — reference only, no remediation.
- `2026-09-02-satuinbox-audit-3-synthesis.md` — traceability only; patches already in register.

---

## 3 | Rules for the requester
1. `audit-master-register.md` wins on every conflict. Track B/C do not override it.
2. Nothing becomes an engineering ticket until ENV-01 (branch lock) resolved.
3. V1–V6 = decision meeting, never code tickets.
4. When ticketing F-07, fold in UI #11/#29 (same defect class) to avoid duplicate work.

---

## 4 | Audit Conversation — Baca di Sini (index domain)

> Semua audit domain **Conversation** ada di `detail-conversation/`. Tiga track terpisah (D/E/F), beda sumber/scope/metode — **belum di-fold ke master register**. Gate: dedup lintas-track + ENV-01 branch-lock sebelum jadi ticket.

**Urutan baca (dari luas ke sempit):**

| # | Baca | Track | Scope | Temuan | Decision |
|---|---|---|---|---|---|
| 1 | `detail-conversation/2026-09-07-conversation-list-deep-audit.md` | H | Conversation-list deep audit (chat list panel saja; 10 aspek, CLX-01..23) | 23 (P1×3/P2×3/P3×11 + NV×2 + clean×4) | `PROCEED_WITH_CAUTION`, blocking: CLX-03/04/15 |
| 2 | `detail-conversation/_source/2026-09-02-conversation-consolidated-shortcomings-report.md` | E | BE deep-dive (data model, security, perf, functional) | 64 (P0×7/P1×15/P2×24/P3×18) | code-verified, backlog |
| 3 | `detail-conversation/_source/2026-09-02-conversation-phase2-synthesis-report.md` | D | FE UX flow (first-time + returning user) | 41 (2 CRIT/11 HIGH) | REVISE_PRD + PROCEED_WITH_CAUTION |
| 4 | `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` | F | Sidebar nav RBAC + counter (FE+BE cross-verified) | 3 confirmed (1 CRIT/2 MAJOR→1 MED) | belum ticket, butuh keputusan produk (F1) |

Sub-report per track (baca kalau butuh file:line detail):
- **Track E:** `conversation-functional-business-logic.md` (22), `2026-09-02-conversation-data-model-api-contract-audit.md` (18, 3 CRIT), `2026-09-02-conversation-security-perf-audit.md` (13). UX/a11y (17) folded ke consolidated.
- **Track D:** `2026-09-02-conversation-first-time-user-flow-audit.md`, `2026-09-02-satuinbox-audit-2-conversation-returning-user-flow.md`.
- **Track F:** `2026-09-03-counter-divergence.md`, `2026-09-03-default-channel-display.md`, `2026-09-03-team-inbox-rules.md`.

**Coverage gap (jangan lupa):** `03-coverage-gap-check.md` — verdict PARTIAL, ~40% aspek Conversation belum di-audit. P0 gap: SLA engine vs contract, Hold/Snooze/SLA 3-way + reopen, multi-tenant READ-path isolation, migration/rollback runbook.

**Overlap yang harus di-dedup sebelum ticketing:**
- Track E DB-index ↔ register **V8/P-01** (compound index).
- Track E soft-delete/tenant-scope ↔ register **SEC-*** family (verifikasi bukan dobel).
- Track D reminder/unread ↔ Track E functional (reminder stub).
- Track F C1/C2 (RBAC visibility `role.name` vs `role.code`) ↔ Track B RBAC visibility gap ↔ Track D assignment-invisible.

**Kenapa belum di register:** register = 61 finding code-verified dgn severity+decision+acceptance-test. Track D/E/F = ratusan finding mentah, banyak overlap antar-track + dgn register. Fold tanpa dedup = double-count + backlog kembar. Fold hanya setelah: (a) ENV-01 branch di-lock, (b) dedup decision per overlap di atas.

---

## 5 | Register Konflik Antar-File (review 2026-09-03)

Hasil review seluruh corpus audit. Resolusi mengikuti precedence README (register menang).

| # | Konflik | File | Resolusi |
|---|---|---|---|
| K1 | **RBAC dua layer**: register P1 SEC-03 = RBAC BE gateway POSITIF; Track F C1 = RBAC FE sidebar RUSAK (`role.name` vs code). Pembaca bisa salah simpul "RBAC aman". | register ↔ `detail-conversation/2026-09-03-sidebar-navigation-synthesis.md` | Dua-duanya benar, layer beda. Warning ditambah di register §Cakupan. Saat fold, C1 = finding FE-RBAC baru, BUKAN kontradiksi SEC-03. |
| K2 | **DB-index triple-report beda severity**: Track E P0-03 (Message zero index, code-verified P0) vs register V8/P-01 (needs-validation P3) vs extension P-01 (Major). Defect sama. | `detail-conversation/_source/…-consolidated-shortcomings…` ↔ register ↔ extension | Track E code-verified outranks inference. Saat fold: promote V8 → confirmed P0, tutup duplikat. Sampai fold, register tetap patokan backlog. |
| K3 | **Reminder dua track**: Track D (FE `console.log` stub, HIGH) + Track E functional (BE state gap). Tema beda, defect sama. | `detail-conversation/_source/…-returning-user-flow…` ↔ `detail-conversation/_source/conversation-functional-business-logic.md` | Satu ticket gabungan saat fold (FE stub + BE state). |
| K4 | **F-07 vs Track B**: register F-07 (Major, 278 call sites) = defect sama dgn UI #11/#29 (skala Nielsen). | register ↔ `detail-uiux/uiux-audit-report-sabrina.md` | Register menang. Ticketing F-07 fold UI #11/#29 (sudah dicatat §3 rule 4). |
| K5 | **Register version drift**: reading-list dulu bilang v1.2; register-review bilang 60; meta-audit bilang 59. | 4 file | FIXED 2026-09-03: reading-list → v1.3/61; register-review dibanner HISTORICAL. Meta-audit 59 = snapshot, jangan update (point-in-time). |
| K6 | **Track G fold**: `detail-infra/satuinbox-infra-audit.md` 69 temuan infra (secrets/CORS/SPOF) — orphan sebelumnya. | orphan → register | **RESOLVED 2026-09-04 (register v1.5):** 10 Critical folded jadi INFRA-01..10 (confirmed) di register. Sisa 59 (High/Med/Low) TETAP di source `detail-infra/satuinbox-infra-audit.md` — belum di-fold, baca source langsung. INFRA-01 (committed secrets) = active risk, prioritas. |

**Stale metadata (fix bila disentuh, bukan prioritas):**
- `2026-09-02-satuinbox-audit-extension-performance-flow-ux.md` masih refer `Memory/CLAUDE-be.md`/`CLAUDE-fe.md` → sekarang `Codex-be.md`/`Codex-fe.md`.
- `detail-uiux/uiux-impact-assessment.md` masih refer `Rules/qa-analysis-rule.md` dkk → SUPERSEDED, sekarang `Rules/core/analysis-and-risk.md`.
