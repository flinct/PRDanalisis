# Assessment Report: Auto-Pull / Round-Robin Conversation Assignment

> **Assessment Type:** Delta Analysis (improvement vs legacy test model)
> **Source PRD:** `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Get New Conversation (Agent Pull Queue).md` (v2.1)
> **Source Improvement Doc:** `Assessments/Round Robbin/auto-pull-round-robin.md`
> **Source Legacy Test Model:** `Test/New folder/Round Robbin.tsv` (37 cases, created 03/03/2026)
> **Duplicate Legacy:** `Test/New folder (2)/Round Robbin.tsv` (identical)
> **Assessment Artifact:** `Assessments/conversation/auto-pull-round-robin-improvement/auto-pull-round-robin-improvement-qa-assessment.md`
> **Version:** 1.0
> **Previous Version:** N/A (first analysis)
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `CLAUDE.md`
> **Analysis Date:** 2026-08-12
> **Status:** Draft
> **Product Manager:** Dany Christian
> **Engineering Lead:** Naftal Yunior
> **Analyst (Owner):** Workflow Analyzer

---

## 1 | Overview

### 1.1 Purpose

This assessment maps the behavioral delta between the **old round-robin test model** (37 manual test cases in `Round Robbin.tsv`, dated 03/03/2026) and the **new auto-pull improvement logic** documented in `auto-pull-round-robin.md` (verified against `conversation.service.ts` + `auto-pull-cron.service.ts`, ref ticket #2711).

The old TSV encodes a **classic pointer-based round-robin** distribution model. The improvement doc describes a materially different **event-driven auto-pull** algorithm with FIFO selection, rate caps, batch caps, and per-member locking. The value of this report is precisely mapping that delta so QA can rewrite the test suite correctly.

### 1.2 Source References

| Source | Path | Role |
|--------|------|------|
| Improvement doc | `Assessments/Round Robbin/auto-pull-round-robin.md` | **Primary source of truth** for new logic. Verified against BE source. |
| PRD (v2.1) | `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Get New Conversation (Agent Pull Queue).md` | Original PRD. Describes pull-based "Get Conversation", timeout return-to-queue, max active conversations, supervisor manual assign. |
| Old test model | `Test/New folder/Round Robbin.tsv` | 37 manual test cases. Classic round-robin assumptions. |
| Duplicate | `Test/New folder (2)/Round Robbin.tsv` | Identical copy. Ignore. |
| Product context | `Memory/global-memory.md`, `CLAUDE.md` | Conversation V2 is source of truth; V1 deprecated. |

### 1.3 Scope Boundaries

- **In scope:** Auto-pull distribution logic — event triggers, selection algorithm, rate/batch caps, locking, cron safety net, self-pull path.
- **Out of scope:** Supervisor manual assign, multi-assign, timeout return-to-queue, FE UX (banner/toggle), WhatsApp integration, SLA behavior. These are separate flows tested elsewhere.

---

## 2 | Delta Analysis

### 2.1 Algorithm Comparison Summary

| Dimension | OLD Model (TSV) | NEW Model (auto-pull-round-robin.md) |
|-----------|-----------------|--------------------------------------|
| **Distribution model** | Classic rotating pointer | Event-triggered auto-pull |
| **Selection order** | Round-robin pointer cycles A→B→C→A | Strictly FIFO (oldest `createdAt` first) |
| **Trigger** | Chat enters queue → immediate round-robin dispatch | 3 triggers: login burst, close→1 replacement, 15-min cron |
| **Per-round fairness** | Strictly 1 chat per agent per round | No "round" concept. Burst assigns up to `min(maxConversation − assigned, 10 − rateUsed)` per agent |
| **Skip behavior** | Skip offline/full agent, try next in pointer order | Ineligible agents excluded from eligible pool before selection; no pointer to skip over |
| **Max concurrent** | Implied per-case (varies by test) | `maxConversation` personal cap (default `3`, `0` = unlimited) |
| **Rate limiting** | None | Per-agent: 10 assignments / 120s window (`AUTO_PULL_MAX_ASSIGNMENTS_PER_WINDOW`) |
| **Batch limiting** | None (dispatch all in queue) | Per-team per-cycle: `min(AUTO_PULL_TEAM_BATCH_LIMIT=50, eligibleMemberCount × 10)` |
| **Selection target** | Rotating pointer picks next agent | Cron: least-loaded eligible agent (ties random). Login/close: that specific agent only |
| **Atomicity** | Not specified | `participants: { $size: 0 }` guard on MongoDB update |
| **Concurrency lock** | Not specified | Per-member Redis lock (10s TTL), fails open on Redis outage |
| **Self-pull path** | PRD describes "Get Conversation" with editable batch | Server-side clamp to remaining slots (`maxConversation` only, no rate cap) |
| **No-team handling** | TSV-005: "Agent masuk eligible list GLOBAL" | "Conversations with no team are permanently excluded" |
| **Cron safety net** | Not in test model | 15-min interval, Redis distributed lock (TTL 110s), drains backlog per team |

### 2.2 Detailed Behavioral Differences

#### 2.2.1 Distribution model replacement

The OLD TSV assumes a **synchronous, pointer-based round-robin** executed when each chat enters the queue. Cases 013-019 encode explicit round sequences:

- TSV-013: "Chat1→A, Chat2→B, Chat3→C, Chat4→A (kembali ke A)"
- TSV-016: "Putaran 1: A(1),B(1),C(1), Putaran 2: A(2),B(2),C skip"
- TSV-019: "tidak ada agent dapat 2x di putaran sama"

The NEW model has **no rotating pointer and no "round" concept**. Assignment is event-driven:
- Login event → burst for THAT agent only (formula: `min(maxConv − assigned, 10 − rateUsed)`)
- Close event → 1 replacement for THAT agent only
- Cron → drains backlog per team, picks least-loaded agent each time

**Impact:** Cases 013, 016, 017, 018, 019 encode round-robin sequences that cannot occur under the new logic.

#### 2.2.2 Burst vs 1-per-round

OLD: Strictly 1 chat per agent per round, regardless of capacity.

NEW: Login burst formula can assign **up to 10** conversations to a single agent in one event (if `maxConversation` permits). Example from doc: Agent with `maxConversation=10` logs in with 0 assigned → `min(10−0, 10−0) = 10` conversations pulled immediately.

**Impact:** TSV-016 ("Putaran 1: A(1),B(1),C(1)") is wrong. Under new logic, if A logs in first, A gets up to 10 immediately. B and C each get their burst on their own login events.

#### 2.2.3 FIFO vs pointer

OLD: Pointer cycles through agents in fixed order.

NEW: Selection is FIFO on conversation `createdAt`. When cron runs, it picks the **oldest unassigned conversation** and assigns to the **least-loaded eligible agent** (ties broken randomly). No agent ordering.

**Impact:** TSV-013's "Chat4 back to A" is impossible. Under new logic, the 4th oldest conversation goes to whichever agent has the fewest assigned at that instant (or to the sole remaining agent with capacity).

#### 2.2.4 Rate cap (NEW — not in old model)

Per-agent rate limit: **10 assignments per 120-second sliding window**. Window starts on first assignment within it. Independent per agent. Exists to prevent a single high-`maxConversation` agent from draining entire backlog (ticket #2711).

**Impact:** No old TSV case tests rate limiting. This is entirely new test surface area.

#### 2.2.5 maxConversation personal cap (NEW formalization)

Default `3`, configurable, `0` = unlimited. Agent hits ceiling → no more auto-assign until close.

**Impact:** TSV-016/017/018 use implicit "slot" concept but never specify `maxConversation` default (3). Old tests assume higher slots (e.g., A:2, B:2, C:1 in TSV-016). Under new default of 3, burst behavior differs.

#### 2.2.6 Per-team batch cap (NEW)

`teamBatchCap = min(AUTO_PULL_TEAM_BATCH_LIMIT=50, eligibleMemberCount × 10)`. Scales with team size.

**Impact:** No old TSV case covers cron batch limiting. Entirely new surface.

#### 2.2.7 No-team exclusion (CHANGED)

OLD (TSV-005): Agent without team → eligible for GLOBAL channel.

NEW: "Conversations with no team are permanently excluded (they'd fail the `NO_TEAM` guard anyway)."

**Impact:** TSV-005 expected result ("Agent E masuk eligible list GLOBAL") contradicts new logic. Conversations without a teamId are never auto-pulled.

#### 2.2.8 Atomic assignment guard (NEW)

`participants: { $size: 0 }` MongoDB update filter. Two triggers racing for same conversation → one wins, other no-ops.

**Impact:** TSV-029 ("kedua chat assign ke kedua agent") needs rewriting. The atomic guard prevents double-assign of the same conversation, but two different conversations CAN still go to two different agents.

#### 2.2.9 Per-member Redis slot lock (NEW)

10-second per-member Redis lock wraps "read remaining slots, then assign" sequence. Prevents concurrent triggers for same agent from both passing check. **Fails open** on Redis outage.

**Impact:** TSV-030 ("agent berubah status saat diproses") and TSV-031 ("kuota berubah saat diproses") need rewriting to use lock-based race condition tests.

#### 2.2.10 Self-pull asymmetry (NEW documentation)

Self-pull (`pullConversations`) clamps `limit` to remaining slots (`maxConversation` only) but does **NOT** check or consume the 10/120s rate budget. Deliberate design: user action ≠ automatic assignment.

**Impact:** No old TSV case covers self-pull. Entirely new surface. Key asymmetry: agent with `maxConversation=100`, 0 assigned, self-pulls `limit:100` → gets 100. Same agent via auto-pull → gets 10 (rate cap binds).

#### 2.2.11 Cron safety net (NEW)

15-minute interval, Redis distributed lock (TTL 110s). Groups by `(companyId, organizationId, teamId)`. Picks least-loaded eligible agent. Drains in loop until backlog empty, no room, or batch cap reached.

**Impact:** No old TSV case covers cron-triggered assignment. Entirely new surface.

### 2.3 Old TSV Case Disposition

| Case ID | Scenario | Category | Verdict | Reason |
|---------|----------|----------|---------|--------|
| RoundRobbin-001 | Agent A in Team X → eligible | Team Membership | **VALID** | Eligibility filter unchanged |
| RoundRobbin-002 | Agent C in Team X+Y → eligible Team X | Team Membership | **VALID** | Multi-team eligibility unchanged |
| RoundRobbin-003 | Agent B not in Team X → not eligible | Team Membership | **VALID** | Team membership guard unchanged |
| RoundRobbin-004 | Agent D left Team X → not eligible | Team Membership | **VALID** | Team membership guard unchanged |
| RoundRobbin-005 | Agent E no team → eligible GLOBAL | Team Membership | **OBSOLETE** | No-team conversations permanently excluded now |
| RoundRobbin-006 | Agent online → eligible | Online/Offline | **VALID** | Eligibility filter unchanged |
| RoundRobbin-007 | Agent offline → not eligible | Online/Offline | **VALID** | Eligibility filter unchanged |
| RoundRobbin-008 | Agent reconnect → eligible | Online/Offline | **VALID** | Reconnection eligibility unchanged |
| RoundRobbin-009 | Agent in shift → eligible | Office Hour | **VALID** | Office hour eligibility unchanged |
| RoundRobbin-010 | Agent out of shift, toggle OFF → not eligible | Office Hour | **VALID** | Office hour eligibility unchanged |
| RoundRobbin-011 | Agent out of shift, toggle ON → eligible | Office Hour | **VALID** | Toggle behavior unchanged |
| RoundRobbin-012 | Toggle ON then offline → not eligible | Office Hour | **VALID** | Offline override unchanged |
| RoundRobbin-013 | Chat1→A, Chat2→B, Chat3→C, Chat4→A | Basic Round Robin | **OBSOLETE** | No pointer. FIFO + event-driven burst. No "Chat4 back to A". |
| RoundRobbin-014 | Per-team routing | Basic Round Robin | **NEEDS REWRITE** | Routing concept valid but distribution mechanism wrong |
| RoundRobbin-015 | Global vs Team routing | Basic Round Robin | **OBSOLETE** | Global (no-team) conversations excluded now |
| RoundRobbin-016 | Putaran 1: A(1),B(1),C(1) Putaran 2: A(2),B(2),C skip | 1 Chat/Round | **OBSOLETE** | No round concept. Burst assigns multiple to one agent. |
| RoundRobbin-017 | Putaran 1: A(1),B(1), Putaran 2: A(2),B(2) | 1 Chat/Round | **OBSOLETE** | No round concept |
| RoundRobbin-018 | P1: A,B,C / P2: A,C / P3: A,C / P4: A (full) | 1 Chat/Round | **OBSOLETE** | No round concept |
| RoundRobbin-019 | No agent gets 2x in same round | 1 Chat/Round | **OBSOLETE** | Agent CAN get multiple in one burst |
| RoundRobbin-020 | Skip offline A, go to B | Skip Agent | **NEEDS REWRITE** | Skip concept valid but "round robin pilih" mechanism wrong |
| RoundRobbin-021 | Skip full C, go to next | Skip Agent | **NEEDS REWRITE** | Skip concept valid but selection mechanism wrong |
| RoundRobbin-022 | All full/offline → stays in queue | Skip Agent | **VALID** | Queue behavior unchanged |
| RoundRobbin-023 | Agent becomes eligible mid-round | Skip Agent | **OBSOLETE** | No "round" concept. Login event triggers burst. |
| RoundRobbin-024 | Multi-assign A→B | Manual Assign | **VALID** (out of scope) | Manual assign is separate flow |
| RoundRobbin-025 | Multi-assign to full B | Manual Assign | **VALID** (out of scope) | Manual assign is separate flow |
| RoundRobbin-026 | Supervisor manual assign | Manual Assign | **VALID** (out of scope) | Manual assign is separate flow |
| RoundRobbin-027 | Manual assign to offline | Manual Assign | **VALID** (out of scope) | Manual assign is separate flow |
| RoundRobbin-028 | Manual assign to away | Manual Assign | **VALID** (out of scope) | Manual assign is separate flow |
| RoundRobbin-029 | 2 chats simultaneous → both assigned | Race Condition | **NEEDS REWRITE** | Atomic guard prevents same-conversation double-assign |
| RoundRobbin-030 | Agent status change during commit | Race Condition | **NEEDS REWRITE** | Now uses Redis slot lock |
| RoundRobbin-031 | Quota changes during processing | Race Condition | **NEEDS REWRITE** | Now uses Redis slot lock + atomic guard |
| RoundRobbin-032 | 100 simultaneous chats | Race Condition | **NEEDS REWRITE** | Now governed by rate cap + batch cap + maxConversation |
| RoundRobbin-033 | Banner outside shift | Timeout/Toggle | **VALID** (out of scope) | FE UX test, not auto-pull logic |
| RoundRobbin-034 | Banner not in shift | Timeout/Toggle | **VALID** (out of scope) | FE UX test |
| RoundRobbin-035 | Toggle ON → eligible | Timeout/Toggle | **VALID** (out of scope) | FE UX test |
| RoundRobbin-036 | Toggle OFF → not eligible | Timeout/Toggle | **VALID** (out of scope) | FE UX test |
| RoundRobbin-037 | Toggle persists on shift change | Timeout/Toggle | **VALID** (out of scope) | FE UX test |

### 2.4 Disposition Summary

| Verdict | Count | Case IDs |
|---------|-------|----------|
| **VALID** (unchanged) | 17 | 001-004, 006-012, 022, 024-028, 033-037 |
| **OBSOLETE** (must deprecate) | 8 | 005, 013, 015, 016, 017, 018, 019, 023 |
| **NEEDS REWRITE** (concept valid, mechanism wrong) | 7 | 014, 020, 021, 029, 030, 031, 032 |
| **TOTAL** | 37 | |

Of 37 old cases: **8 are obsolete** (must be removed or replaced), **7 need significant rewrite** (the test intent is valid but the expected behavior/verification steps encode wrong assumptions), and **17 remain valid** (primarily eligibility filters and manual assign/UX flows that are orthogonal to auto-pull distribution logic).

The 12 cases covering manual assign (024-028) and timeout/toggle UX (033-037) are **valid but out of auto-pull scope** — they test separate flows that don't conflict with the new logic.

---

## 3 | Requirement Extraction

### 3.1 Functional Requirements (FR-AP)

| ID | Requirement | Source Section |
|----|-------------|----------------|
| FR-AP-001 | **Login burst formula:** `slotsToFill = min(maxConversation − currentlyAssignedOpenConversations, 10 − rateUsedInLast120s)`. Triggered when agent transitions to `READY`. | Burst formula |
| FR-AP-002 | **Close replacement:** 1 conversation auto-pulled per close event via `autoPullCloseConversation`. | Overview trigger table |
| FR-AP-003 | **FIFO selection:** Strictly oldest unassigned conversation first (`findUnassignedConversation`, sorted by `createdAt`). | Selection rules |
| FR-AP-004 | **Atomic assignment:** `participants: { $size: 0 }` guard on update. Loser of race no-ops. | Selection rules |
| FR-AP-005 | **Rate cap:** `AUTO_PULL_MAX_ASSIGNMENTS_PER_WINDOW = 10` per `AUTO_PULL_RATE_WINDOW_SECONDS = 120`s, per agent. Window starts on first assignment. | Burst formula |
| FR-AP-006 | **maxConversation cap:** Personal concurrent-conversation cap (default `3`, `DEFAULT_MAX_CONVERSATION`). `0` = unlimited. Once reached, only a close frees a slot. | Burst formula, Selection rules |
| FR-AP-007 | **Cron safety net:** Every 15 minutes. Redis distributed lock (`setNx`, TTL 110s). Groups by `(companyId, organizationId, teamId)`, up to 120 teams/cycle. | Cron section |
| FR-AP-008 | **Cron least-loaded selection:** `findAvailableMemberForAutoPick` selects eligible agent with fewest assigned conversations. Ties broken randomly. | Cron section |
| FR-AP-009 | **Team batch cap:** `teamBatchCap = min(AUTO_PULL_TEAM_BATCH_LIMIT=50, eligibleMemberCount × 10)`. `eligibleMemberCount` computed once per team per cycle. | Cron batch cap section |
| FR-AP-010 | **No-team exclusion:** Conversations with no `teamId` permanently excluded from auto-pull. | Cron section |
| FR-AP-011 | **Self-pull clamp:** `pullConversations` clamps `limit` server-side to caller's remaining slots (via `getAvailableSlot`). Does NOT check/consume rate budget. | Slot guard section |
| FR-AP-012 | **Close re-trigger:** Close event triggers `autoPullForAllParticipants` → `autoPullUnassignedConversationForUser` for the closing agent. | Overview trigger table |
| FR-AP-013 | **Cron drain loop:** For each team, `autoPullConversationsForTeam` drains backlog in loop — oldest-first, least-loaded agent — until backlog empty, no room, or batch cap reached. | Cron section |
| FR-AP-014 | **Cron cooldown skip-set:** Only the conversation a team actually failed on (no available/lockable member) goes into 30-min cooldown skip-set. Successful assignments are not added. | Cron section |

### 3.2 Edge Cases & Non-Functional (EC-AP)

| ID | Edge Case / Constraint | Source |
|----|------------------------|--------|
| EC-AP-001 | **Race — same conversation:** Two triggers race for same conversation → atomic `$size 0` guard ensures exactly one wins, other no-ops. | Selection rules |
| EC-AP-002 | **Race — same agent:** Two concurrent triggers for same agent → per-member Redis slot lock (10s TTL) prevents both from reading "1 slot free" before either commits. | Slot guard |
| EC-AP-003 | **Rate cap exhaustion:** Agent at 10/120s → `slotsToFill` clamps to 0 by rate budget even if `maxConversation` permits more. | Burst formula |
| EC-AP-004 | **Batch cap scaling:** Eligible members 1→cap=10, 3→cap=30, 5→cap=50 (ceiling binds), 10→cap=50 (ceiling binds, agents split thinner). | Batch cap table |
| EC-AP-005 | **Window/interval mismatch:** Rate window = 120s, cron interval = 900s. ~7 rate-window refills go unused between cron ticks. Cron gets one shot per 15 min at whatever rate budget exists at that instant. | Cron mismatch note |
| EC-AP-006 | **Self-pull asymmetry:** Self-pull checks `maxConversation` but NOT rate cap. Agent with `maxConversation=100`, 0 assigned, self-pulls `limit:100` → gets 100. Same via auto-pull → gets 10. Deliberate design. | Slot guard (self-pull) |
| EC-AP-007 | **No-team conversation:** Permanently excluded. Fails `NO_TEAM` guard. | Cron section |
| EC-AP-008 | **Lone agent plateau:** Agent hits `maxConversation` → `calculateAvailableSlots` returns 0 → cron fails on first attempt every cycle. Backlog stuck until close or second agent. | Case 3 example |
| EC-AP-009 | **Lock fail-open:** Redis outage → `withMemberAutoPullLock` fails open. Assignment still proceeds. Race window narrows back to pre-fix state. | Slot guard |
| EC-AP-010 | **maxConversation=0 (unlimited):** Rate cap becomes sole governor. Agent can receive 10 per 120s indefinitely. No personal ceiling. | Burst formula |
| EC-AP-011 | **Simultaneous login burst:** Multiple agents log in at same time. Each triggers independent burst based on own `maxConversation` and rate budget. No cross-agent fairness at login. | Case 1-2 examples |
| EC-AP-012 | **Cron-only backlog drain (no closes):** Lone agent with `maxConversation=100` → 10/cron tick → hits cap at tick 10 (~2h15m) → backlog permanently stuck at remaining. | Case 3 |
| EC-AP-013 | **Different maxConversation skew:** Agent A=3, B=6, C=10 → team capacity ceiling 19 (not 30). C absorbs 53% of login-time batch. Skew by design (reflects declared capacity). | Case 2, Takeaway |

---

## 4 | Impact & Regression Areas

### 4.1 Direct Behavior Changes

| Area | Change | Impact Level |
|------|--------|--------------|
| **Distribution algorithm** | Pointer-based RR → event-driven FIFO auto-pull | HIGH — complete model replacement |
| **Assignment trigger** | Queue arrival → immediate dispatch | Login event / close event / cron | HIGH — trigger mechanism completely different |
| **Per-agent fairness** | Strictly 1-per-round | Burst up to 10 per event | HIGH — changes agent workload distribution |
| **Rate limiting** | None | 10/120s per agent | MEDIUM — new constraint, may surprise high-volume agents |
| **maxConversation** | Implicit, varied per test | Formalized (default 3, 0=unlimited) | MEDIUM — default value affects burst behavior |
| **No-team handling** | GLOBAL channel fallback | Permanently excluded | MEDIUM — conversations without teamId silently dropped from auto-pull |
| **Cron safety net** | None | 15-min cycle, batch drain, least-loaded | LOW — additive, no regression to existing behavior |

### 4.2 Fairness & Skew Implications (from doc Takeaway)

- Rate cap (10/120s) protects against unbounded `maxConversation` draining backlog in one burst.
- Rate cap does **NOT** equalize agents with different `maxConversation` values — skew is by design, reflecting declared capacity.
- Once agents hit their ceiling, backlog drain depends on close speed or 15-min cron.
- Batch cap now scales with eligible member count (`min(50, eligibleMemberCount × 10)`) instead of flat cap, so recovery is faster and proportional.
- Lone eligible agent bound by own rate cap regardless of absolute ceiling (~10/cycle practical cron throughput).
- Well-staffed team (5+ eligible) bound by `AUTO_PULL_TEAM_BATCH_LIMIT=50` — more agents beyond that split same ceiling thinner.
- 15-min cron cadence means most 120s rate window refills go unused.

### 4.3 Modules Impacted

| Module | Impact | Notes |
|--------|--------|-------|
| `conversation.service.ts` | HIGH — primary change | `handleAgentBecameReady`, `autoPullConversationsForAgent`, `autoPullUnassignedConversationForUser`, `autoPullCloseConversation`, `pullConversations`, `pullConversationsUntilFull` |
| `auto-pull-cron.service.ts` | HIGH — primary change | `AutoPullCronService.processUnassignedConversations` |
| `conversation.repository` | MEDIUM | `findUnassignedConversation`, `assignMemberToConversation`, `pullConversation`, `bumpAutoPullRate` |
| Redis infrastructure | MEDIUM | `setNx` lock for cron, per-member slot lock (10s TTL) |
| MongoDB queries | LOW | `participants: { $size: 0 }` atomic guard already on update |
| FE (agent dashboard) | LOW | Self-pull button behavior unchanged from user perspective (server-side clamp transparent) |

---

## 5 | Risk Analysis & Open Questions

### 5.1 Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Window/interval mismatch wastes rate refills | **Certain** (by design) | MEDIUM — slower backlog drain than theoretical max | Documented. Accept or implement mid-interval cron sub-tick. |
| Skew from differing `maxConversation` | **Certain** (by design) | MEDIUM — C absorbs 53% in Case 2 | Documented as intentional (declared capacity). Monitor for customer complaints. |
| Self-pull unthrottled | **Certain** (by design) | LOW-MEDIUM — agent could self-pull 100+ in one call if `maxConversation=0` | Deliberate design (user action ≠ auto). Consider adding soft cap if abuse observed. |
| Redis outage → lock fails open | **Low** | MEDIUM — race window re-opens to pre-fix state | Documented. Cache failure never blocks real assignment. Accept or add DB-level optimistic lock as fallback. |
| No-team conversations silently excluded | **Certain** (changed behavior) | MEDIUM — conversations without teamId never auto-assigned | Ensure all inbound channels assign teamId. Add monitoring for unassigned no-team conversations. |
| Lone agent backlog plateau | **Certain** (edge case) | HIGH — 900+ conversations stuck if lone agent never closes and no second agent | Documented. Only recovery: close frees slot or another agent comes online. Monitor backlog age. |
| maxConversation default change (old tests assume varied, new default=3) | **Certain** | LOW — agent burst lower than old test assumptions | Ensure test data uses explicit `maxConversation` values. |
| PRD-vs-improvement-doc gap | **Certain** | MEDIUM — PRD v2.1 only describes manual pull-based flow; automated event-driven system documented only in improvement doc, not in PRD itself | Test suite must target the improvement doc logic. Consider aligning PRD or adding an explicit addendum (see OQ-005, OQ-006). |

### 5.2 Open Questions

| # | Question | Owner | Priority |
|---|----------|-------|----------|
| OQ-001 | `AUTO_PULL_TEAM_BATCH_LIMIT=50` comment says "placeholder pending real cron-tick-duration metrics". What's the timeline for tuning? | Engineering | P2 |
| OQ-002 | Is the `DEFAULT_MAX_CONVERSATION=3` value confirmed with Product? Old TSV uses varied implicit values. | Product Manager | P1 |
| OQ-003 | What monitoring exists for conversations stuck in no-team state? If no team is assigned by the inbound channel, are they visible to supervisors? | Engineering | P1 |
| OQ-004 | Does the 30-min cooldown skip-set have a configurable TTL, or is it hardcoded? | Engineering | P3 |
| OQ-005 | Is the self-pull rate cap exclusion documented in the PRD's user story, or only in the improvement doc? PRD v2.1 doesn't mention rate caps. | Product Manager | P2 |
| OQ-006 | Should the PRD be updated to reflect the new auto-pull algorithm, or is the PRD intentionally kept at the "pull-based Get Conversation" abstraction level? | Product Manager | P2 |

---

## 6 | Test Coverage Gaps

### 6.1 What the New Logic Needs That the Old 37-Case TSV Does NOT Cover

| Gap | Description | New Requirement IDs |
|-----|-------------|---------------------|
| **Rate cap behavior** | 10/120s per agent, window starts on first assignment, rate exhaustion blocks further auto-assign | FR-AP-005, EC-AP-003 |
| **Login burst formula** | `min(maxConv − assigned, 10 − rateUsed)` — burst can assign multiple to one agent | FR-AP-001, EC-AP-011 |
| **Close replacement** | 1 auto-pull on close, re-trigger chain | FR-AP-002, FR-AP-012 |
| **FIFO selection** | Oldest-first, no pointer | FR-AP-003 |
| **Atomic assignment guard** | `$size 0` on update, race loser no-ops | FR-AP-004, EC-AP-001 |
| **Per-member Redis slot lock** | 10s TTL, prevents concurrent check-then-act | EC-AP-002 |
| **Lock fail-open** | Redis outage → proceed, not block | EC-AP-009 |
| **Cron safety net** | 15-min cycle, Redis lock, team grouping, drain loop | FR-AP-007, FR-AP-013 |
| **Cron least-loaded selection** | Fewest assigned agent, ties random | FR-AP-008 |
| **Team batch cap scaling** | `min(50, eligibleCount × 10)` | FR-AP-009, EC-AP-004 |
| **Cron cooldown skip-set** | Only failed conversation added | FR-AP-014 |
| **Self-pull maxConversation clamp** | Server-side, no rate cap | FR-AP-011, EC-AP-006 |
| **Self-pull rate cap asymmetry** | Self-pull bypasses rate budget entirely | EC-AP-006 |
| **No-team exclusion** | Permanently excluded from auto-pull | FR-AP-010, EC-AP-007 |
| **maxConversation=0 (unlimited)** | Rate cap as sole governor | EC-AP-010 |
| **Lone agent plateau** | Hits maxConversation, backlog stuck | EC-AP-008, EC-AP-012 |
| **Window/interval mismatch** | 120s window vs 900s cron | EC-AP-005 |
| **Different maxConversation skew** | Capacity proportionality | EC-AP-013 |

### 6.2 Old Cases to Deprecate

| Case ID | Action | Replacement |
|---------|--------|-------------|
| RoundRobbin-005 | **DEPRECATE** | New case: no-team conversation stays in queue permanently, never auto-pulled |
| RoundRobbin-013 | **DEPRECATE** | New case: login burst assigns multiple, FIFO not pointer |
| RoundRobbin-015 | **DEPRECATE** | New case: no-team conversation excluded |
| RoundRobbin-016 | **DEPRECATE** | New case: burst formula per agent |
| RoundRobbin-017 | **DEPRECATE** | New case: burst + rate cap interaction |
| RoundRobbin-018 | **DEPRECATE** | New case: cron drain loop with batch cap |
| RoundRobbin-019 | **DEPRECATE** | New case: agent CAN get multiple in one burst |
| RoundRobbin-023 | **DEPRECATE** | New case: login event triggers burst, no mid-round concept |

### 6.3 Old Cases to Rewrite

| Case ID | Action | What Changes |
|---------|--------|-------------|
| RoundRobbin-014 | **REWRITE** | Keep team routing concept. Change expected behavior: conversations assigned to least-loaded eligible agent (or burst agent on login), not round-robin pointer. |
| RoundRobbin-020 | **REWRITE** | Keep skip concept. Change mechanism: offline agent excluded from eligible pool before selection. Verify by checking assignment went to eligible agent with fewest assigned. |
| RoundRobbin-021 | **REWRITE** | Keep skip concept. Change mechanism: full agent excluded from eligible pool. Verify maxConversation enforcement. |
| RoundRobbin-029 | **REWRITE** | Test atomic guard: 2 conversations → both assigned to eligible agents (not same conversation to same agent). Verify `$size 0` prevents double-assign. |
| RoundRobbin-030 | **REWRITE** | Test Redis slot lock: concurrent triggers for same agent → one succeeds, other sees lock and retries/fails cleanly. |
| RoundRobbin-031 | **REWRITE** | Test lock + atomic guard: concurrent close + cron for same agent → slot lock prevents both reading "1 free". |
| RoundRobbin-032 | **REWRITE** | Test rate cap + batch cap: 100 simultaneous chats with 3 agents → each agent gets min(maxConv, 10) in first burst, remainder drains via cron at batch cap rate. |

---

## 7 | Traceability Seed

> Ready for QA to convert into test cases. Each row maps a requirement/edge case to the coverage it needs.

| Req ID | Description | Test Coverage Needed | Priority | Old Case Ref |
|--------|-------------|---------------------|----------|--------------|
| FR-AP-001 | Login burst formula | Verify `slotsToFill = min(maxConv − assigned, 10 − rateUsed)` with: (a) both constraints binding, (b) only maxConv binds, (c) only rate binds. Test with maxConv=3 (default), maxConv=10, maxConv=0 (unlimited). | P0 | 016, 017, 018 (OBSOLETE) |
| FR-AP-002 | Close replacement | Verify 1 conversation auto-pulled on close. Verify re-trigger chain (`autoPullCloseConversation` → `autoPullForAllParticipants` → `autoPullUnassignedConversationForUser`). | P0 | NEW |
| FR-AP-003 | FIFO selection | Verify oldest `createdAt` conversation assigned first. Test with 5+ conversations at different timestamps. | P0 | 013 (OBSOLETE) |
| FR-AP-004 | Atomic assignment guard | Verify `$size 0` prevents double-assign. Simulate race on same conversation. Winner assigns, loser no-ops cleanly. | P0 | 029 (REWRITE) |
| FR-AP-005 | Rate cap (10/120s) | Verify agent blocked after 10 assignments in 120s. Verify window resets after 120s from first assignment. Verify independent per agent. | P0 | NEW |
| FR-AP-006 | maxConversation cap | Verify agent stops receiving at maxConv. Verify close frees slot. Verify default=3. Verify maxConv=0 means unlimited (rate cap only). | P0 | 021 (REWRITE) |
| FR-AP-007 | Cron safety net | Verify cron runs every 15 min. Verify Redis lock (TTL 110s). Verify groups by (companyId, orgId, teamId). Verify up to 120 teams/cycle. | P1 | NEW |
| FR-AP-008 | Cron least-loaded | Verify least-loaded agent selected. Verify random tie-breaking across multiple runs. | P1 | NEW |
| FR-AP-009 | Team batch cap | Verify `min(50, eligibleCount × 10)` with: 1 agent (cap=10), 3 agents (cap=30), 5 agents (cap=50), 10 agents (cap=50). | P1 | NEW |
| FR-AP-010 | No-team exclusion | Verify conversation without teamId never auto-pulled. Verify it remains in unassigned queue. | P0 | 005 (OBSOLETE) |
| FR-AP-011 | Self-pull clamp | Verify server-side clamp to remaining slots. Verify no rate cap consumed. Test agent with maxConv=100, 0 assigned, self-pulls limit:100 → gets 100. | P1 | NEW |
| FR-AP-012 | Close re-trigger | Verify close event fires auto-pull for closing agent. Verify 1 replacement pulled immediately. | P0 | NEW |
| FR-AP-013 | Cron drain loop | Verify loop continues until: (a) backlog empty, (b) no eligible agent has room, or (c) batch cap reached. | P1 | NEW |
| FR-AP-014 | Cron cooldown skip-set | Verify only the failed conversation (no available member) enters 30-min cooldown. Verify successful assignments NOT added. | P2 | NEW |
| EC-AP-001 | Race — same conversation | Two concurrent triggers for same conversation. Verify exactly one succeeds. | P0 | 029 (REWRITE) |
| EC-AP-002 | Race — same agent | Two concurrent triggers for same agent. Verify Redis slot lock serializes. | P0 | 030, 031 (REWRITE) |
| EC-AP-003 | Rate cap exhaustion | Agent at 10/120s → verify no further auto-assign until window resets. | P0 | NEW |
| EC-AP-004 | Batch cap scaling | Test with 1, 3, 5, 10 eligible agents. Verify effective cap matches formula. | P1 | NEW |
| EC-AP-005 | Window/interval mismatch | Verify cron gets fresh rate budget each tick (agents idle >120s). Verify ~7 refills per 15-min gap go unused. | P2 | NEW |
| EC-AP-006 | Self-pull asymmetry | Self-pull limit:100 with maxConv=100, rate budget=0 → still gets 100. Auto-pull with same state → gets 0 (rate exhausted). | P1 | NEW |
| EC-AP-007 | No-team conversation | Conversation with no teamId → permanently stays in unassigned. | P0 | 005 (OBSOLETE) |
| EC-AP-008 | Lone agent plateau | Agent hits maxConv via cron-only → backlog stuck. Verify recovery on: (a) close, (b) second agent online. | P1 | NEW |
| EC-AP-009 | Lock fail-open | Simulate Redis outage. Verify assignment still proceeds. Verify race window narrows to pre-fix state. | P2 | NEW |
| EC-AP-010 | maxConversation=0 | Agent with unlimited cap. Verify rate cap (10/120s) is sole governor. Verify no ceiling stops assignment. | P1 | NEW |
| EC-AP-011 | Simultaneous login | 3 agents log in same instant. Verify each gets independent burst based on own maxConv + rate budget. No cross-agent fairness check at login. | P0 | 013 (OBSOLETE) |
| EC-AP-012 | Cron-only drain | Lone agent, no closes. Verify +10 per cron tick until maxConv reached. Verify backlog plateaus. | P1 | NEW |
| EC-AP-013 | maxConversation skew | Agents with different maxConv (3/6/10). Verify team capacity = sum of individual caps. Verify higher-cap agent absorbs proportionally more. | P1 | NEW |

**Total traceability rows:** 14 FR + 13 EC = **27 requirements** needing test coverage.

---

## 8 | Recommendation

### Decision

| Field | Value |
|-------|-------|
| **Decision Enum** | `PROCEED_WITH_CAUTION` |
| **Decision Class** | `CONDITIONAL_GO` |
| **Decision Statement** | Auto-pull improvement logic is well-documented and verified against BE source. However, 15 of 37 old test cases (41%) are obsolete or need significant rewrite. QA must rewrite the test suite before using it as regression baseline. |
| **Required Actions Before Development** | 1. Deprecate 8 obsolete cases (005, 013, 015-019, 023). 2. Rewrite 7 cases (014, 020-021, 029-032). 3. Write ~27 new cases from traceability seed. 4. Confirm `DEFAULT_MAX_CONVERSATION=3` with Product Manager. 5. Verify no-team monitoring exists. |
| **Key Blocking Reasons** | Old TSV cannot serve as regression baseline for new logic. 41% of cases encode wrong algorithm assumptions. |
| **Suggested Next Step** | QA uses traceability seed (Section 7) to write new test suite. Prioritize P0 cases (FR-AP-001 through 006, 010, 012; EC-AP-001 through 003, 007, 011) for initial pass. |

---

*End of Assessment Report v1.0*
