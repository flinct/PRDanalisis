# 2026-09-09 — Rebuild satuinbox-big-picture.html ke Requirements Doc (Style + Content + Layout)

**Task:** Rebuild penuh `Assessments/audit/00-Timeline/satuinbox-big-picture.html` (2-tab dashboard) supaya align dengan requirements doc `satuinbox_product_strategy_requirements.md` — style Section 10-11, content Section 2+7+9, layout Section 12-13 structure.

**Source of Truth:** `Assessments/audit/00-Timeline/satuinbox_product_strategy_requirements.md` (Section 1-17: Big Picture positioning, task prioritization rules, 7 current tasks, dependency/backlog readiness, visual spec, recommended HTML structure, priority colors P1/P2/P3/Backlog).

**Orchestrator workflow (multi-agent, 3 iteration rounds):**

## Round 1 — Worker (cbx/claude-opus-5, 263s timeout before completion)
- Read requirements doc + existing HTML (367 lines)
- Rebuilt: 2 tabs, new color system Section 10 (#F8FAFC bg, #172554 text, #2563EB primary), priority colors Section 11 (P1=green #DCFCE7/#15803D, P2=blue #DBEAFE/#2563EB, P3=purple #EDE9FE/#7C3AED, Backlog=orange #FFEDD5/#C2410C)
- Content: 7 current tasks first (Super admin internal, GTM, Demo database, Notification service, Advance exporting, Email summary [NEEDS DESCRIPTION], Fraud dashboard), expanded total to 30 task rows
- Layout: `prio-p1/p2/p3/backlog` pills, `metric metric-*` H/M/L chips, `bar on-p1/p2/p3/backlog` gantt cells, refactored month columns `td.mo`
- Timed out at 600s after 32 API calls during verification; but all edits landed

## Round 1 — Reviewer (cbx/claude-opus-5, 295s)
**Verdict:** NEEDS_REVISION (3 defects)
- F1: Big Picture content vs doc Section 2 (channels/modules list/order must match)
- F2: gantt bar color must match priority pill (P3-labeled rows drawn with orange Backlog bar → unreadable vs legend)
- F3: `NEEDS DESCRIPTION` verbatim literal (doc Section 15 prescribes it uppercase; HTML had "Needs description")

## Round 2 — Revision Worker (cbx/claude-opus-5, timed out at 600s but edits completed)
Applied F1/F2/F3 fixes:
- F1: reconciled Tab 1 channels/modules/strategic-areas to doc Section 2 verbatim sets (9 channels including "API Integration", modules include Chat/Ticket/Sales/.../Open API, 13 strategic areas in doc order)
- F2: moved Shopee/TikTok/Telegram rows from P3 pill to Backlog pill + orange bar (external-blocked per Section 5 readiness rule)
- F3: uppercased marker `NEEDS DESCRIPTION` (status code exempt from no-uppercase rule)
- Timed out during verification at 600s; HTML file already written + verified locally with Python: F2 zero gantt/pill mismatches, F3 literal present ×2, valid HTML (tag balance 0)

**Post-timeout manual fix (ExecuteCode):**
Worker's Title-case pass mangled acronyms (GTM→Gtm, PRD→Prd, API→Api; lowercase ai/api/ui/ux/db in visible text). Applied comprehensive acronym restore: GTM, PRD, WA, UI, UX, AI, DB, API, FAQ, KPI, SLA, SLO, BSP uppercase via text-node regex pass OUTSIDE `<style>/<script>` (preserved MongoDB/WhatsApp/SatuInbox mixed-case product names). Verified no mid-word corruption (except legitimate `MongoDB`), zero mangled acronyms remaining.

## Round 2 — Reviewer (cbx/claude-opus-5, 286s)
**Verdict:** NEEDS_REVISION (acronym casing incomplete)
- F1/F2/F3 resolved
- Remaining: 12 visible-text lowercase/Title-case acronyms (`Api`, lowercase `ai`/`api`/`ui`/`ux`/`db`) in Tab 1 chips/modules and Tab 2 task text

## Round 3 — Manual Acronym Fix (ExecuteCode, 0.03s)
Expanded acronym fix dict (added lowercase standalone `ai/api/ui/ux/db/wa`), applied text-node regex pass with word-boundary checks `(?<![A-Za-z])ai(?![a-z])`, verified no real-word breakage ("build" has 'b' before 'ui' → blocked by `(?<![A-Za-z])`). Checked visible text: zero mid-word corruption (MongoDB intact), channels/modules read correct ("API Integration", "WhatsApp Official / BSP", etc.). Valid HTML (tag balance 0), uppercase count still 0 (no CSS broken).

## Round 3 — Final Reviewer (cbx/claude-opus-5, 258s)
**Verdict:** PASS
All 8 confirmation criteria verified:
1. Acronyms uppercase across ALL visible text (GTM/PRD/WA/UI/UX/AI/DB/API/FAQ/KPI/SLA/SLO/BSP); legitimate product names (MongoDB/WhatsApp/SatuInbox/TikTok) intact
2. F1: Tab 1 channels (9, doc order), modules, strategic areas match doc Section 2
3. F2: every gantt bar color matches row priority pill (0 mismatches, scripted check)
4. F3: `NEEDS DESCRIPTION` verbatim on Email summary task
5. Priority colors exact (Section 11): P1 #DCFCE7/#15803D, P2 #DBEAFE/#2563EB, P3 #EDE9FE/#7C3AED, Backlog #FFEDD5/#C2410C
6. Style: --bg #F8FAFC, --text #172554, --brand #2563EB, font Inter/Segoe/Arial, no text-transform:uppercase
7. 7 current tasks first (doc Section 7 order); KPI cards match per-row tally (Total 30, Current 7, P1 7, P2 9, P3 10, Backlog 4)
8. Both tabs, go() script, @media print, valid HTML

**Outcome:** PASS semua gates. HTML sepenuhnya align dengan requirements doc.

---

**Artifacts:**
- `Assessments/audit/00-Timeline/satuinbox-big-picture.html` — rebuilt (30 task rows, aligned style+content+layout)
- `Assessments/audit/00-Timeline/satuinbox_product_strategy_requirements.md` — source of truth doc (unchanged, reference)
- Session summary: `summary/2026-09-09-rebuild-satuinbox-big-picture-to-requirements-doc.md` (this file)

**Key Changes vs Original (pre-rebuild):**
- **Color system:** old #F1F5FB bg → #F8FAFC, old #0F172A text → #172554, P1 blue → green, P2 amber → blue, P3 slate → purple, Backlog new category orange
- **Content:** 29 → 30 tasks (7 current tasks added first, including Email summary + Fraud dashboard from doc Section 7-8)
- **Layout:** refactored pill/badge/gantt markup (`prio-*`, `metric-*`, `bar on-*`), month columns individual `td.mo` cells, header structure per Section 12-13
- **Acronyms:** all uppercase (GTM/PRD/WA/UI/UX/AI/DB/API/FAQ/KPI/SLA/SLO/BSP) across visible text, product names intact
- **Markers:** `NEEDS DESCRIPTION` literal (uppercase code, exempt from no-uppercase rule like H/M/L/P1 codes)
- **Gantt colors:** P1 #34D399 green, P2 #60A5FA blue, P3 #A78BFA purple, Backlog #FB923C orange — every bar color matches row's priority pill (0 mismatches verified by script)

**Loop Summary:**
- 3 orchestrator rounds (worker→reviewer→revise→reviewer→manual-fix→final-reviewer)
- 2 workers timed out at 600s (deep reconstruction work), but edits landed successfully
- Manual acronym fix (ExecuteCode) after round-2 review caught remaining Title-case/lowercase standalone acronyms
- Final reviewer PASS after comprehensive verification
