# QA Test Specification — Auto-Pull / Round-Robin Conversation Assignment

## 1. Overview

| Item | Description |
|------|-------------|
| Feature | Auto-Pull / Round-Robin Conversation Assignment Improvement |
| Source PRD | `PRD/Conversationv2/PRD Ticket - Omnichannel Inbox - Get New Conversation (Agent Pull Queue).md` (v2.1) |
| Source Improvement Doc | `Assessments/Round Robbin/auto-pull-round-robin.md` |
| Source Assessment | `Assessments/conversation/auto-pull-round-robin-improvement/auto-pull-round-robin-improvement-qa-assessment.md` |
| Legacy Test Model | `Test/New folder/Round Robbin.tsv` (37 cases, 22 valid, 8 obsolete, 7 needs rewrite) |
| New Test File | `Test/New folder/Auto-Pull Round Robin v2.tsv` (38 new cases) |
| Scope | Auto-pull distribution logic: event triggers, burst formula, FIFO selection, rate cap, maxConversation cap, batch cap, atomic guard, Redis slot lock, cron safety net, self-pull, no-team exclusion |
| Non-Scope | Supervisor manual assign, multi-assign, timeout return-to-queue, FE UX (banner/toggle), WhatsApp integration, SLA behavior |
| Author | Dany Christian |
| Engineering Lead | Naftal Yunior |
| Date | 12/08/2026 |
| Status | Draft |

---

## 2. Requirement Coverage Matrix

| Req ID | Requirement Summary | Priority | Test Case IDs | Coverage Status |
|--------|---------------------|----------|---------------|-----------------|
| FR-AP-001 | Login burst formula: `min(maxConv−assigned, 10−rateUsed)` | P0 | AutoPull-001, 002, 003, 004 | Covered |
| FR-AP-002 | Close replacement: 1 auto-pull per close event | P0 | AutoPull-006, 007 | Covered |
| FR-AP-003 | FIFO selection: oldest createdAt first | P0 | AutoPull-008 | Covered |
| FR-AP-004 | Atomic assignment: `$size: 0` guard | P0 | AutoPull-009, 010 | Covered |
| FR-AP-005 | Rate cap: 10 assignments / 120s per agent | P0 | AutoPull-011, 012, 013 | Covered |
| FR-AP-006 | maxConversation cap (default 3, 0=unlimited) | P0 | AutoPull-014, 015, 016 | Covered |
| FR-AP-007 | Cron safety net: 15-min, Redis lock, team grouping | P1 | AutoPull-017 | Covered |
| FR-AP-008 | Cron least-loaded selection | P1 | AutoPull-018 | Covered |
| FR-AP-009 | Team batch cap: `min(50, eligibleCount×10)` | P1 | AutoPull-019, 026 | Covered |
| FR-AP-010 | No-team exclusion | P0 | AutoPull-022 | Covered |
| FR-AP-011 | Self-pull clamp (maxConv only, no rate cap) | P1 | AutoPull-023, 024 | Covered |
| FR-AP-012 | Close re-trigger chain | P0 | AutoPull-006, 007 | Covered |
| FR-AP-013 | Cron drain loop: until empty/full/cap | P1 | AutoPull-020 | Covered |
| FR-AP-014 | Cron cooldown skip-set: only failed conv | P2 | AutoPull-021 | Covered |
| EC-AP-001 | Race — same conversation | P0 | AutoPull-009, 010, 035 | Covered |
| EC-AP-002 | Race — same agent (Redis slot lock) | P0 | AutoPull-025, 036 | Covered |
| EC-AP-003 | Rate cap exhaustion | P0 | AutoPull-011, 012 | Covered |
| EC-AP-004 | Batch cap scaling | P1 | AutoPull-019, 026 | Covered |
| EC-AP-005 | Window/interval mismatch | P2 | AutoPull-027 | Covered |
| EC-AP-006 | Self-pull asymmetry | P1 | AutoPull-024 | Covered |
| EC-AP-007 | No-team conversation | P0 | AutoPull-022 | Covered |
| EC-AP-008 | Lone agent plateau | P1 | AutoPull-028 | Covered |
| EC-AP-009 | Lock fail-open | P2 | AutoPull-029 | Covered |
| EC-AP-010 | maxConversation=0 unlimited | P1 | AutoPull-016 | Covered |
| EC-AP-011 | Simultaneous login burst | P0 | AutoPull-005 | Covered |
| EC-AP-012 | Cron-only drain plateau | P1 | AutoPull-030 | Covered |
| EC-AP-013 | maxConversation skew | P1 | AutoPull-031 | Covered |

**Coverage: 27/27 requirements covered (100%).**

---

## 3. Test Strategy

| Test Type | Scope | Priority | Environment | Notes |
|-----------|-------|----------|-------------|-------|
| Functional — Login Burst | FR-AP-001, EC-AP-011 | P0 | Staging | Trigger via agent READY transition |
| Functional — Close Replacement | FR-AP-002, FR-AP-012 | P0 | Staging | Trigger via conversation close |
| Functional — FIFO | FR-AP-003 | P0 | Staging | Verify oldest-first assignment order |
| Functional — Rate Cap | FR-AP-005, EC-AP-003 | P0 | Staging | Requires time control or wait 120s |
| Functional — maxConv | FR-AP-006, EC-AP-010 | P0/P1 | Staging | Default=3, 0=unlimited |
| Functional — No-Team | FR-AP-010, EC-AP-007 | P0 | Staging | Conversations without teamId |
| Functional — Self-Pull | FR-AP-011, EC-AP-006 | P1 | Staging | Verify rate cap bypass |
| Functional — Cron | FR-AP-007/008/009/013/014 | P1 | Staging | Wait for cron tick or force trigger |
| Concurrency — Atomic Guard | FR-AP-004, EC-AP-001 | P0 | Staging | Simulate concurrent triggers |
| Concurrency — Slot Lock | EC-AP-002 | P0 | Staging | Verify Redis lock serialization |
| Edge — Lock Fail-Open | EC-AP-009 | P2 | Staging | Simulate Redis outage |
| Edge — Lone Agent | EC-AP-008, EC-AP-012 | P1 | Staging | Single agent, no closes |
| Regression — Disposition Rewrites | Rewrite of 014,020,021,029-032 | P0/P1 | Staging | Old cases with corrected expectations |

---

## 4. Test Data & Environment

| Data / Environment | Value | Setup | Cleanup | Owner |
|--------------------|-------|-------|---------|-------|
| Agent accounts | A, B, C (varying maxConv: 3/6/10) | Create in staging, set maxConv values | Reset to default | QA |
| Team membership | Team X, Team Y | Assign agents to teams | Remove assignments | QA |
| Backlog conversations | 10-1000 unassigned, with teamId | Seed via API or DB insert | Delete test conversations | QA |
| No-team conversations | Unassigned, no teamId | Seed via API bypassing team check | Delete | QA |
| Redis | Staging Redis cluster | Running | N/A | DevOps |
| Rate window | 120s (`AUTO_PULL_RATE_WINDOW_SECONDS`) | Config default | Reset via wait | QA |
| Cron interval | 15min (`AUTO_PULL_CRON_INTERVAL`) | Config default | N/A | QA |
| `AUTO_PULL_TEAM_BATCH_LIMIT` | 50 | Config default | N/A | QA |
| `DEFAULT_MAX_CONVERSATION` | 3 | Config default | N/A | QA |

---

## 5. Test Suites

| Suite ID | Suite Name | Purpose | Test Case IDs | Execution Trigger |
|----------|-----------|---------|---------------|-------------------|
| TS-AP-01 | Smoke P0 | Release gate for core auto-pull logic | 001, 005, 006, 008, 009, 011, 014, 022 | Every staging deploy |
| TS-AP-02 | Functional P0 | Validate burst, FIFO, rate cap, maxConv, atomic guard | 001-004, 006-015, 035 | Every release candidate |
| TS-AP-03 | Functional P1 | Cron, self-pull, batch cap, lone agent, skew | 016-020, 023-028, 030-034, 038 | Every release candidate |
| TS-AP-04 | Concurrency P0 | Race conditions, slot lock, atomic guard | 009, 010, 025, 035, 036, 037 | Every release candidate |
| TS-AP-05 | Edge P2 | Lock fail-open, window mismatch, cooldown | 021, 027, 029 | Scheduled pre-release |
| TS-AP-06 | Regression Rewrites | Old 014/020/021/029-032 with new logic | 032-038 | Every release candidate |

---

## 6. Detailed Test Cases

### Login Burst

#### TC-AutoPull-001

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-001 |
| Feature | Auto-Pull Login Burst |
| Source Req ID | FR-AP-001 |
| Analysis Finding ID | N/A |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A maxConversation=3, 0 assigned, 0 rate used, backlog 10 |
| Test Data | Agent A: maxConv=3, assigned=0, rateUsed=0. Backlog: 10 conversations |
| Steps | 1. Agent A logs in (transitions to READY). 2. Verify autoPullConversationsForAgent runs. |
| Expected Result | slotsToFill = min(3-0, 10-0) = 3. Agent A receives 3 conversations. Backlog drops to 7. |
| Postcondition | Agent A at 3/3 maxConv. |
| Automation Status | Manual Only |
| Automation ID | N/A |

#### TC-AutoPull-002

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-002 |
| Feature | Auto-Pull Login Burst |
| Source Req ID | FR-AP-001 |
| Analysis Finding ID | N/A |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A maxConversation=10, 0 assigned, 0 rate used, backlog 15 |
| Test Data | Agent A: maxConv=10, assigned=0, rateUsed=0. Backlog: 15 conversations |
| Steps | 1. Agent A logs in. 2. Verify burst assignment count. |
| Expected Result | slotsToFill = min(10-0, 10-0) = 10. Agent A receives 10 conversations. Backlog drops to 5. |
| Postcondition | Agent A at 10/10 maxConv. |
| Automation Status | Manual Only |

#### TC-AutoPull-003

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-003 |
| Feature | Auto-Pull Login Burst |
| Source Req ID | FR-AP-001 |
| Analysis Finding ID | N/A |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A maxConversation=10, 0 assigned, rateUsed=8 (sisa 2), backlog 15 |
| Test Data | Agent A: maxConv=10, assigned=0, rateUsed=8 |
| Steps | 1. Agent A logs in. 2. Verify burst count limited by rate. |
| Expected Result | slotsToFill = min(10-0, 10-8) = 2. Agent A receives 2 conversations only. Rate cap binds. |
| Postcondition | Agent A at 2/10 maxConv, rate=10/10. |
| Automation Status | Manual Only |

#### TC-AutoPull-004

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-004 |
| Feature | Auto-Pull Login Burst |
| Source Req ID | FR-AP-001, EC-AP-010 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A maxConversation=0 (unlimited), 0 assigned, 0 rate used, backlog 50 |
| Test Data | Agent A: maxConv=0, assigned=0, rateUsed=0 |
| Steps | 1. Agent A logs in. 2. Verify burst limited only by rate cap. |
| Expected Result | slotsToFill = min(∞, 10-0) = 10. Agent A receives 10. No maxConv ceiling. Rate cap is sole governor. |
| Postcondition | Agent A at 10 assigned, rate=10/10. |
| Automation Status | Manual Only |

#### TC-AutoPull-005

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-005 |
| Feature | Simultaneous Login Burst |
| Source Req ID | EC-AP-011 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | A(maxConv=3), B(maxConv=6), C(maxConv=10). Backlog 100. |
| Test Data | All agents: assigned=0, rateUsed=0 |
| Steps | 1. All 3 agents login simultaneously. 2. Verify independent bursts. |
| Expected Result | A gets 3, B gets 6, C gets 10. Total=19. Backlog=81. No cross-agent fairness at login. |
| Postcondition | Each agent at own maxConv ceiling. |
| Automation Status | Manual Only |

### Close Replacement

#### TC-AutoPull-006

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-006 |
| Feature | Close Replacement |
| Source Req ID | FR-AP-002, FR-AP-012 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A at 3/3 maxConv. Backlog 5. |
| Steps | 1. Agent A closes 1 conversation. 2. Verify autoPullCloseConversation triggers. |
| Expected Result | 1 conversation auto-pulled to Agent A. A back to 3/3. |
| Postcondition | Agent A at 3/3. Backlog 4. |
| Automation Status | Manual Only |

#### TC-AutoPull-007

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-007 |
| Feature | Close Re-Trigger Chain |
| Source Req ID | FR-AP-012 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A has conversations. Backlog 3. |
| Steps | 1. Agent A closes conversation. 2. Trace event chain. |
| Expected Result | autoPullCloseConversation → autoPullForAllParticipants → autoPullUnassignedConversationForUser. 1 oldest conversation assigned to A. |
| Automation Status | Manual Only |

### FIFO Selection

#### TC-AutoPull-008

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-008 |
| Feature | FIFO Selection |
| Source Req ID | FR-AP-003 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Backlog: Conv1(T1), Conv2(T2), Conv3(T3), Conv4(T4), Conv5(T5). Agent A eligible, maxConv=5. |
| Steps | 1. Agent A login, burst triggers. 2. Check assignment order. |
| Expected Result | Conv1 assigned first (oldest createdAt), then Conv2, Conv3, Conv4, Conv5. Order=T1→T2→T3→T4→T5. |
| Automation Status | Manual Only |

### Atomic Assignment Guard

#### TC-AutoPull-009

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-009 |
| Feature | Atomic Assignment Guard |
| Source Req ID | FR-AP-004, EC-AP-001 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | 1 unassigned conversation. 2 triggers race (login + cron). |
| Steps | 1. Agent A login + cron run simultaneously. 2. Check conversation participants. |
| Expected Result | Exactly 1 trigger wins. Loser no-ops (update matched 0 docs). No double-assign. participants array has exactly 1 entry. |
| Automation Status | Manual Only |

#### TC-AutoPull-010

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-010 |
| Feature | Atomic Assignment Guard |
| Source Req ID | FR-AP-004 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | 2 unassigned conversations. Login burst + cron race. |
| Steps | 1. Agent A login + cron run simultaneously. 2. Check both conversations. |
| Expected Result | Conv1 and Conv2 each have exactly 1 participant. No conversation has 2 participants. |
| Automation Status | Manual Only |

### Rate Cap

#### TC-AutoPull-011

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-011 |
| Feature | Rate Cap |
| Source Req ID | FR-AP-005, EC-AP-003 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A maxConv=100, 0 assigned. Backlog 50. |
| Steps | 1. Agent A login, burst triggers. 2. Count assignments. |
| Expected Result | Agent A receives 10 conversations (rate cap 10/120s). 40 remain in backlog despite maxConv=100. |
| Postcondition | Agent A rate=10/10, assigned=10. |
| Automation Status | Manual Only |

#### TC-AutoPull-012

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-012 |
| Feature | Rate Cap Window Reset |
| Source Req ID | FR-AP-005 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A at 10/10 rate assignments. Backlog 20. |
| Steps | 1. Wait 121 seconds since first assignment. 2. Trigger auto-pull (cron or close). |
| Expected Result | Agent A can receive assignments again. Rate budget resets to 10. New window starts. |
| Automation Status | Manual Only |

#### TC-AutoPull-013

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-013 |
| Feature | Rate Cap Independence |
| Source Req ID | FR-AP-005 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A at 10/10 rate. Agent B at 0/10 rate. Backlog 20. |
| Steps | 1. Trigger auto-pull (cron). 2. Check assignments per agent. |
| Expected Result | Agent A blocked (rate exhausted). Agent B receives up to 10. Rate cap is per-agent, not global. |
| Automation Status | Manual Only |

### maxConversation Cap

#### TC-AutoPull-014

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-014 |
| Feature | maxConversation Cap |
| Source Req ID | FR-AP-006 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A maxConversation=3 (default). Backlog 10. |
| Steps | 1. Agent A login. 2. Count assignments. |
| Expected Result | Agent A receives exactly 3 conversations. Backlog drops to 7. |
| Postcondition | Agent A at 3/3. |
| Automation Status | Manual Only |

#### TC-AutoPull-015

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-015 |
| Feature | maxConversation Slot Free |
| Source Req ID | FR-AP-006 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A at 3/3 maxConv. Backlog 5. |
| Steps | 1. Agent A closes 1 conversation (slot → 2/3). 2. Verify auto-pull triggers. |
| Expected Result | 1 new conversation auto-pulled. Agent A back to 3/3. |
| Automation Status | Manual Only |

#### TC-AutoPull-016

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-016 |
| Feature | maxConversation Unlimited |
| Source Req ID | FR-AP-006, EC-AP-010 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Agent A maxConversation=0 (unlimited). Backlog 50. |
| Steps | 1. Agent A login. 2. Verify rate cap is sole governor. |
| Expected Result | Agent A receives 10 (rate cap). No maxConv ceiling. Can receive more after rate window reset. |
| Automation Status | Manual Only |

### Cron Safety Net

#### TC-AutoPull-017

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-017 |
| Feature | Cron Safety Net |
| Source Req ID | FR-AP-007 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Backlog 20. Agent A eligible. |
| Steps | 1. Wait for cron tick (15 min). 2. Verify Redis lock acquired. |
| Expected Result | Cron runs. Acquires Redis distributed lock (setNx, TTL 110s). Groups by (companyId, orgId, teamId). |
| Automation Status | Manual Only |

#### TC-AutoPull-018

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-018 |
| Feature | Cron Least-Loaded Selection |
| Source Req ID | FR-AP-008 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Team X: A(2 assigned), B(1 assigned), C(1 assigned). Backlog 5. |
| Steps | 1. Cron tick runs for Team X. 2. Check which agent gets next conversation. |
| Expected Result | First conversation → B or C (random tiebreak, both at 1). Next → the other. A last. Least-loaded first. |
| Automation Status | Manual Only |

#### TC-AutoPull-019

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-019 |
| Feature | Cron Team Batch Cap |
| Source Req ID | FR-AP-009, EC-AP-004 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Team X: 3 eligible agents. Backlog 100. |
| Steps | 1. Cron tick runs. 2. Count assignments this cycle. |
| Expected Result | teamBatchCap = min(50, 3×10) = 30. Cron drains max 30 this tick. Backlog drops to 70. |
| Automation Status | Manual Only |

#### TC-AutoPull-020

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-020 |
| Feature | Cron Drain Loop |
| Source Req ID | FR-AP-013 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Team X: 2 eligible agents (maxConv=10 each, 0 assigned). Backlog 5. |
| Steps | 1. Cron tick runs. 2. Monitor drain loop. |
| Expected Result | 5 conversations assigned (backlog empty). Loop stops because backlog empty, not cap or no room. |
| Automation Status | Manual Only |

#### TC-AutoPull-021

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-021 |
| Feature | Cron Cooldown Skip-Set |
| Source Req ID | FR-AP-014 |
| Level | Integration |
| Type | Positive |
| Priority | P2 |
| Precondition | Team X: 1 agent at 3/3 (full). Backlog 2. |
| Steps | 1. Cron tick runs. 2. Check skip-set. |
| Expected Result | Conversation that failed (no available member) enters 30-min cooldown skip-set. Successful assignments NOT added. |
| Automation Status | Manual Only |

### No-Team Exclusion

#### TC-AutoPull-022

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-022 |
| Feature | No-Team Exclusion |
| Source Req ID | FR-AP-010, EC-AP-007 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Conversation without teamId in backlog. Agent A eligible in Team X. |
| Steps | 1. Agent A login, burst triggers. 2. Check if no-team conversation was assigned. |
| Expected Result | Conversation without teamId is NEVER auto-pulled. Remains in queue. Fails NO_TEAM guard. |
| Automation Status | Manual Only |

### Self-Pull Asymmetry

#### TC-AutoPull-023

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-023 |
| Feature | Self-Pull Clamp |
| Source Req ID | FR-AP-011 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Agent A maxConv=5, already 3 assigned. Backlog 10. |
| Steps | 1. Agent A self-pulls with limit=10. 2. Check actual count returned. |
| Expected Result | Server-side clamps limit to getAvailableSlot = 5-3 = 2. Agent receives 2, not 10. |
| Postcondition | Agent A at 5/5. |
| Automation Status | Manual Only |

#### TC-AutoPull-024

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-024 |
| Feature | Self-Pull Rate Asymmetry |
| Source Req ID | FR-AP-011, EC-AP-006 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Agent A maxConv=100, 0 assigned, rateUsed=10 (exhausted). Backlog 50. |
| Steps | 1. Agent A self-pulls with limit=100. 2. Compare with auto-pull (which would get 0). |
| Expected Result | Self-pull: Agent A receives 100. Rate cap does NOT apply to self-pull (user action ≠ auto). Auto-pull would give 0. |
| Automation Status | Manual Only |

### Edge Cases & Races

#### TC-AutoPull-025

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-025 |
| Feature | Race Same Agent |
| Source Req ID | EC-AP-002 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A sisa 1 slot. Close event + cron race for same agent. |
| Steps | 1. Close event + cron trigger simultaneously for Agent A. 2. Check slot usage. |
| Expected Result | Redis slot lock (withMemberAutoPullLock, TTL 10s) serializes. 1 trigger succeeds, other sees lock and fails/retries. No over-assign past maxConv. |
| Automation Status | Manual Only |

#### TC-AutoPull-026

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-026 |
| Feature | Batch Cap Scaling |
| Source Req ID | FR-AP-009, EC-AP-004 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Team X backlog 100. Test with varying eligible agent counts. |
| Steps | 1. Cron with 1 eligible → cap=min(50,1×10)=10. 2. With 3 → cap=30. 3. With 5 → cap=50. 4. With 10 → cap=50. |
| Expected Result | Formula min(50, eligibleCount×10) verified at each count. Ceiling binds at 5+ agents. |
| Automation Status | Manual Only |

#### TC-AutoPull-027

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-027 |
| Feature | Window/Interval Mismatch |
| Source Req ID | EC-AP-005 |
| Level | Integration |
| Type | Positive |
| Priority | P2 |
| Precondition | Rate window=120s, cron interval=900s. Agent A idle >120s. |
| Steps | 1. Wait for cron tick after 15 min idle. 2. Check agent rate budget. |
| Expected Result | Cron gets fresh rate budget (10). ~7 refill cycles in 15min gap go unused. No mid-interval check exists. |
| Automation Status | Manual Only |

#### TC-AutoPull-028

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-028 |
| Feature | Lone Agent Plateau |
| Source Req ID | EC-AP-008 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | 1 agent (maxConv=3), 1 eligible. Backlog 10. |
| Steps | 1. Cron tick: agent gets 3. 2. Next tick: agent at 3/3. |
| Expected Result | Backlog stuck at 7. calculateAvailableSlots=0. Recovery: close frees slot or 2nd agent comes online. |
| Automation Status | Manual Only |

#### TC-AutoPull-029

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-029 |
| Feature | Lock Fail-Open |
| Source Req ID | EC-AP-009 |
| Level | Integration |
| Type | Positive |
| Priority | P2 |
| Precondition | Redis down/outage. Auto-pull trigger fires. |
| Steps | 1. Simulate Redis outage. 2. Trigger auto-pull (login/cron). |
| Expected Result | Assignment still proceeds. Lock fails open (cache failure never blocks real assignment). Race window narrows back to pre-fix state. |
| Automation Status | Manual Only |

#### TC-AutoPull-030

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-030 |
| Feature | Cron-Only Drain |
| Source Req ID | EC-AP-012 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | 1 agent (maxConv=100), 0 assigned. Backlog 1000. No closes. |
| Steps | 1. Tick 1: +10 (total=10). Tick 2: +10=20. ... Tick 10: 100. 2. Tick 11+: check state. |
| Expected Result | Backlog permanently plateaus at 900. maxConv=100 is hard backstop. Only recovery: close or new agent. |
| Automation Status | Manual Only |

#### TC-AutoPull-031

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-031 |
| Feature | maxConversation Skew |
| Source Req ID | EC-AP-013 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | A(maxConv=3), B(maxConv=6), C(maxConv=10). Backlog 100. |
| Steps | 1. All 3 login simultaneously. 2. Check distribution. |
| Expected Result | A=3, B=6, C=10. Total=19. C absorbs 53% (10/19). Team capacity=19. Skew by declared capacity. |
| Automation Status | Manual Only |

### Disposition Rewrites

#### TC-AutoPull-032

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-032 |
| Feature | Per-Team Auto-Pull Routing |
| Source Req ID | FR-AP-003 |
| Analysis Finding ID | REWRITE of RoundRobbin-014 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Agent A in Team X, Agent B in Team Y. Backlog with Conv Team X and Team Y. |
| Steps | 1. Cron tick runs. 2. Check routing. |
| Expected Result | Conv Team X → Agent A. Conv Team Y → Agent B. Routing per-team, not round-robin pointer. |
| Automation Status | Manual Only |

#### TC-AutoPull-033

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-033 |
| Feature | Skip Offline Agent |
| Source Req ID | EC-AP-002 |
| Analysis Finding ID | REWRITE of RoundRobbin-020 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Agent A offline, Agent B online+eligible. Backlog 3. |
| Steps | 1. Cron tick or close event. 2. Check eligible pool. |
| Expected Result | Agent A excluded from eligible pool. All 3 conversations to Agent B. |
| Automation Status | Manual Only |

#### TC-AutoPull-034

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-034 |
| Feature | Skip Full Agent |
| Source Req ID | FR-AP-006 |
| Analysis Finding ID | REWRITE of RoundRobbin-021 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | Agent A at 3/3 (full), Agent B at 1/3. Backlog 3. |
| Steps | 1. Cron tick runs. 2. Check eligible pool. |
| Expected Result | Agent A excluded from eligible pool (at maxConv). Conversations to Agent B. B can get 2 more. |
| Automation Status | Manual Only |

#### TC-AutoPull-035

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-035 |
| Feature | Atomic Guard Race |
| Source Req ID | FR-AP-004, EC-AP-001 |
| Analysis Finding ID | REWRITE of RoundRobbin-029 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | 2 unassigned conversations. 2 triggers race. |
| Steps | 1. Login burst + cron trigger simultaneously. 2. Check conversations. |
| Expected Result | Both conv assigned to eligible agents. Each has exactly 1 participant. Atomic $size:0 guard prevents double-assign. |
| Automation Status | Manual Only |

#### TC-AutoPull-036

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-036 |
| Feature | Slot Lock Concurrent Trigger |
| Source Req ID | EC-AP-002 |
| Analysis Finding ID | REWRITE of RoundRobbin-030 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent A sisa 1 slot. Close event + cron race. |
| Steps | 1. Close event + cron trigger simultaneously. 2. Check slot usage. |
| Expected Result | Redis slot lock serializes. 1 trigger succeeds (A → 3/3). Other sees lock, fails. No over-assign. |
| Automation Status | Manual Only |

#### TC-AutoPull-037

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-037 |
| Feature | Close + Cron Race with Lock |
| Source Req ID | EC-AP-002 |
| Analysis Finding ID | REWRITE of RoundRobbin-031 |
| Level | Integration |
| Type | Positive |
| Priority | P0 |
| Precondition | Agent B at 2/3. Close event + cron race. |
| Steps | 1. Agent B close 1 conversation (→ 1/3) + cron tick simultaneously. 2. Check slot. |
| Expected Result | Lock prevents both reading "1 free" before either commits. Result: 1 succeeds, 1 fails. Consistent. |
| Automation Status | Manual Only |

#### TC-AutoPull-038

| Field | Value |
|-------|-------|
| TC-ID | AutoPull-038 |
| Feature | 100 Chats Load |
| Source Req ID | FR-AP-005, FR-AP-006, FR-AP-009 |
| Analysis Finding ID | REWRITE of RoundRobbin-032 |
| Level | Integration |
| Type | Positive |
| Priority | P1 |
| Precondition | 3 agents (maxConv=10 each). Backlog 100. |
| Steps | 1. All 3 agents login simultaneously. 2. Verify rate+batch+maxConv govern distribution. |
| Expected Result | Burst: each gets 10 (min(10,10)=10). Total 30. Remaining 70 drain via cron: batchCap=min(50,3×10)=30/tick. ~3 ticks to empty. No errors. |
| Automation Status | Manual Only |

---

## 7. Regression Coverage

| Impact Area | Existing Behavior | Test Case IDs | Risk Level |
|-------------|-------------------|---------------|------------|
| Distribution algorithm | Pointer-based RR replaced by event-driven FIFO auto-pull | 001-008 | HIGH |
| Agent fairness | 1-per-round replaced by burst up to 10 | 001-005, 031 | HIGH |
| No-team handling | GLOBAL fallback replaced by permanent exclusion | 022 | MEDIUM |
| Rate limiting | None → 10/120s per agent | 011-013, 024 | MEDIUM |
| maxConversation | Implicit → formalized default 3 | 014-016 | MEDIUM |
| Race conditions | Unspecified → atomic guard + Redis slot lock | 009, 010, 025, 035-037 | MEDIUM |
| Cron safety net | None → 15-min drain | 017-021, 030 | LOW |

---

## 8. Execution Runbook

| Phase | Action | Owner | Evidence |
|-------|--------|-------|----------|
| Pre-test | Verify staging environment mirrors production config (AUTO_PULL_MAX_ASSIGNMENTS_PER_WINDOW=10, AUTO_PULL_RATE_WINDOW_SECONDS=120, DEFAULT_MAX_CONVERSATION=3, AUTO_PULL_TEAM_BATCH_LIMIT=50) | QA | Config screenshot |
| Pre-test | Seed test agents: A(maxConv=3), B(maxConv=6), C(maxConv=10). Assign to Team X/Y as needed. | QA | Agent list |
| Pre-test | Seed backlog conversations with known createdAt timestamps and teamIds | QA | Conversation count |
| Pre-test | Seed at least 1 conversation without teamId | QA | Conversation ID |
| Execution | Run TS-AP-01 (Smoke P0) first | QA | Result log |
| Execution | Run TS-AP-02 (Functional P0) | QA | Result log |
| Execution | Run TS-AP-04 (Concurrency P0) — requires coordination for simultaneous triggers | QA | Result log |
| Execution | Run TS-AP-03 (Functional P1) + TS-AP-06 (Regression Rewrites) | QA | Result log |
| Execution | Run TS-AP-05 (Edge P2) | QA | Result log |
| Post-test | Verify no conversations left in inconsistent state (double-assigned or orphaned) | QA | DB query |
| Post-test | Cleanup test data | QA | Cleanup confirmation |

---

*End of QA Test Specification v1.0*
