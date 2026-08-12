# Auto-Pull / Round-Robin Conversation Assignment

> How `conversation-service` distributes unassigned conversations to agents. Verified against `conversation.service.ts` and `auto-pull-cron.service.ts`. Related: ticket #2711 (fairness rate cap).

## Overview

Auto-pull is **event-triggered, not a continuous poller**. Assignment only happens on three triggers:

| Trigger                                   | Scope                                                                                                                 | Where                                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Agent transitions to `READY` (e.g. login) | Pulls a **burst** for that agent only                                                                                 | `handleAgentBecameReady` → `autoPullConversationsForAgent` → `autoPullUnassignedConversationForUser` |
| Agent closes a conversation               | Pulls **1** replacement for that agent                                                                                | `autoPullCloseConversation` → `autoPullForAllParticipants` → `autoPullUnassignedConversationForUser` |
| Cron, every **15 minutes**                | Drains each team's backlog (up to `min(AUTO_PULL_TEAM_BATCH_LIMIT, eligibleMemberCount × 10)` per team), cluster-wide | `AutoPullCronService.processUnassignedConversations`                                                 |

### Burst formula (login / close triggers)

```
slotsToFill = min(maxConversation − currentlyAssignedOpenConversations, 10 − rateUsedInLast120s)
```

- `maxConversation` — the agent's personal concurrent-conversation cap (default `3`, `DEFAULT_MAX_CONVERSATION`). `0` means unlimited.
- Rate cap — `AUTO_PULL_MAX_ASSIGNMENTS_PER_WINDOW = 10` assignments per `AUTO_PULL_RATE_WINDOW_SECONDS = 120`s, **per agent**. Exists to stop one agent (especially one with a high/unlimited `maxConversation`) from draining the entire backlog in a single burst before teammates get a share (ticket #2711).
- The window starts on the agent's **first** assignment within it and is independent per agent.

### Selection rules

- Strictly **FIFO** — oldest unassigned conversation first (`findUnassignedConversation`, sorted by `createdAt`).
- Assignment is **atomic** (`participants: { $size: 0 }` guard on the update) — safe even if two triggers race for the same conversation; the loser just no-ops.
- Once an agent reaches `maxConversation`, further assignment for them requires a **close** (which frees a slot and immediately re-triggers a pull) — nothing else tops them back up automatically.

### The 15-minute cron (safety net)

- Takes a Redis distributed lock (`setNx`, TTL 110s) so only one pod in the cluster runs it per cycle.
- Groups unassigned conversations by `(companyId, organizationId, teamId)`, up to 120 teams/cycle.
- For each team, `autoPullConversationsForTeam` **drains that team's backlog in a loop** — oldest-first, assigning to whichever eligible agent is currently least-loaded (ties broken randomly) — until either the backlog is empty, no member has room, or the team's batch cap (see below) has been reached in that cycle. This replaced the old one-conversation-per-team-per-cycle behavior, which took ~25 hours to drain a 100-conversation backlog behind 3 idle agents.
- Conversations with no team are permanently excluded (they'd fail the `NO_TEAM` guard anyway).
- Only the **one conversation a team actually failed on** (no available/lockable member) goes into the 30-minute cooldown skip-set — successful assignments don't need an entry since they've already gained a participant and naturally disappear from next cycle's query.
- Still a safety net, not a primary distribution mechanism — it exists to catch things the event-driven path missed (e.g. office hours opening with no login event).

#### The per-team batch cap scales with eligible member count

```
teamBatchCap = min(AUTO_PULL_TEAM_BATCH_LIMIT, eligibleMemberCount × AUTO_PULL_MAX_ASSIGNMENTS_PER_WINDOW)
```

`eligibleMemberCount` is computed **once per team per cycle** (`getAvailableMembersForAutoPull`, before the drain loop starts) — the count of members currently READY and within office hours (or opted to accept outside them), regardless of how much slot room each individually has. `AUTO_PULL_TEAM_BATCH_LIMIT = 50` is an absolute worst-case ceiling, not the everyday value — it only binds once a team has 5+ eligible members (5 × 10 = 50). Below that, the real constraint is `eligibleMemberCount × 10`:

| Eligible members | Effective cap this cycle | Binding constraint                                       |
| ---------------- | ------------------------ | -------------------------------------------------------- |
| 1                | 10                       | that member's own rate cap                               |
| 3                | 30                       | still `eligibleMemberCount × 10`                         |
| 5                | 50                       | exactly at the absolute ceiling                          |
| 10               | 50                       | `AUTO_PULL_TEAM_BATCH_LIMIT` now binds, not the rate cap |

This replaced an earlier flat `AUTO_PULL_TEAM_BATCH_LIMIT = 20` that throttled _any_ team with 2+ eligible members well below what those members could naturally absorb (a 10-agent team could supply up to 100 but was capped at 20 regardless). The absolute ceiling is still a placeholder pending real cron-tick-duration metrics — see the constant's comment in `base.constant.ts` for the tuning tradeoff (raise it and well-staffed teams drain faster per cycle, but a single team's worst-case wall-clock time inside the shared 120-team/110s-lock cron run also grows).

With a **single** eligible agent on a team, that agent's own rate cap (`AUTO_PULL_MAX_ASSIGNMENTS_PER_WINDOW = 10` per 120s) binds first regardless of the absolute ceiling — the loop keeps assigning to that one agent, but `findAvailableMemberForAutoPull` returns nothing once their rate budget hits 0, so the loop exits at **10**, and marks the next backlog conversation as the cycle's `failedConversationId`.

There's also a **window/interval mismatch worth knowing**: the rate window is 120 seconds, but the cron only runs every 900 seconds (15 minutes). Nothing re-checks a member's rate budget between cron ticks — no login/close event is firing — so the ~7 rate-window refills that _could_ happen in that 15-minute gap go unused. The cron gets exactly **one shot per 15 minutes**, capped at whatever the team's eligible members' rate budgets happen to be _at that instant_ (fresh, since they've been idle far longer than 120s) — never more, and never able to "catch up" on missed windows.

**End state if a lone agent never closes anything**: each cron tick adds ~10 to their `assignedCount` (bounded below by however much backlog remains). After roughly `maxConversation / 10` cycles, `assignedCount` reaches `maxConversation` itself — at that point `calculateAvailableSlots` returns 0 because of the **cap**, not the rate limit, and the cron fails on the very first attempt for that team every cycle after that. The remaining backlog is stuck until a close frees a real slot or another agent becomes eligible — cron alone cannot push any agent past their own `maxConversation`.

### Slot guard (per-member lock)

Three gaps existed in the slot-checking logic, all closed the same way: a short-lived (10s) per-member Redis lock (`withMemberAutoPullLock`) wraps the "read remaining slots, then assign" sequence so two concurrent triggers for the same agent can't both pass the check before either commits. Fails open on a Redis outage — a cache failure never blocks a real assignment, it only narrows the race window back to what existed before this guard.

- **Self-pull** (`pullConversations`) previously honored a client-supplied `limit` verbatim with no `maxConversation` check at all. It now clamps `limit` server-side to the caller's actual remaining slots (via `getAvailableSlot`) inside the lock. **This clamp is `maxConversation`-only — self-pull does not check or consume the 10/120s rate budget at all** (it assigns via `conversationRepository.pullConversation`, a different write path than `assignMemberToConversation`, which is the one that calls `bumpAutoPullRate`). So an agent with 0 assigned and `maxConversation = 100` who explicitly self-pulls with `limit: 100` really does get up to 100 back in one call — unlike every automatic path below, which is always rate-capped to 10/120s regardless of how high `maxConversation` is. This asymmetry is pre-existing (a deliberate user action isn't throttled the same way as an automatic one) and unchanged by this fix.
- **Login/close bursts** (`autoPullUnassignedConversationForUser` → `pullConversationsUntilFull`) and the **single-conversation auto-pull path** (`autoPullConversation` / cron) now re-verify the member's slot budget immediately before the write, under the same lock — closing the check-then-act race where a close event and the cron (or two close events) could both read "1 slot free" before either commits.

---

## Example: 100 unassigned conversations, 3 agents log in simultaneously

### Case 1 — all agents `maxConversation = 10`

Login pull per agent: `min(10 − 0, 10 − 0) = 10` — `maxConversation` and the rate cap happen to coincide.

| Time                   | Agent A                                                                                   | Agent B | Agent C | Held concurrently | Backlog left                    |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------- | ------- | ----------------- | ------------------------------- |
| t = 0s (login burst)   | 10                                                                                        | 10      | 10      | 30                | 70                              |
| t > 0s                 | at personal ceiling (10/10) — no more pulls until a close                                 | 10      | 10      | 30                | 70                              |
| ongoing (steady state) | close → 1 replacement each time (rate resets every 120s, never binds again at human pace) | ~10     | ~10     | **steady at 30**  | drains 1-for-1 as closes happen |

**Team capacity ceiling: 3 × 10 = 30 held concurrently.** The remaining 70 wait in queue regardless of elapsed time — only closes (or the 15-min cron, which for these 3 eligible agents can now drain up to `min(50, 3×10) = 30` per team per cycle instead of 1) rotate them in.

### Case 2 — agents with different `maxConversation` (3 / 6 / 10)

_(Exact values not specified — using A=3, B=6, C=10 to span the "3 to 10" range. Swap in real values to recompute.)_

Each agent pulls independently based on **their own** cap — there is no cross-agent fairness comparison at login, only the per-agent rate cap:

| Agent | maxConversation | Login pull = `min(max − 0, 10 − 0)`    |
| ----- | --------------- | -------------------------------------- |
| A     | 3               | 3                                      |
| B     | 6               | 6                                      |
| C     | 10              | 10 (hits the rate cap, same as Case 1) |

| Time                   | Agent A                      | Agent B | Agent C | Held concurrently | Backlog left                    |
| ---------------------- | ---------------------------- | ------- | ------- | ----------------- | ------------------------------- |
| t = 0s (login burst)   | 3                            | 6       | 10      | **19**            | **81**                          |
| t > 0s                 | each at their own ceiling    | 6       | 10      | 19                | 81                              |
| ongoing (steady state) | 1-for-1 replacement on close | ~6      | ~10     | **steady at 19**  | drains 1-for-1 as closes happen |

**Team capacity ceiling: 3 + 6 + 10 = 19** — noticeably lower than Case 1's 30, and skewed: Agent C alone absorbs **53%** of every login-time batch (10 of 19), purely because their personal cap is highest.

### Case 3 — 1000 unassigned, `maxConversation = 100`, one agent, cron-only (no closes)

Unlike Case 1, `maxConversation` (100) is far above the rate cap (10) — so the rate cap, not the personal ceiling, governs almost the entire drain.

| Cron tick                | Trigger                                | Agent's `assignedCount` after | Backlog left     | Why                                                                                                           |
| ------------------------ | -------------------------------------- | ----------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| t=0 (tick 1)             | agent logs in or first tick finds them | 10                            | 990              | `min(100−0, 10−0) = 10`                                                                                       |
| t=15min (tick 2)         | cron only — no close, no self-pull     | 20                            | 980              | rate window reset long ago (15min ≫ 120s); fresh budget of 10 again                                           |
| t=30min (tick 3)         | cron only                              | 30                            | 970              | same — +10 per tick                                                                                           |
| …                        | …                                      | …                             | …                | 7 unused rate-window refills happen _inside_ each 15-min gap, but nothing polls during them                   |
| t≈2h15m (tick 10)        | cron only                              | 100                           | 900              | agent now **at `maxConversation`**                                                                            |
| t≈2h30m (tick 11) onward | cron only                              | **stuck at 100**              | **stuck at 900** | `calculateAvailableSlots` returns 0 — capped by `maxConversation`, not the rate limit; no other member exists |

**With no closes and no other agent, the backlog permanently plateaus at 900 unassigned** once the lone agent hits their cap — the cron cannot exceed `maxConversation` no matter how many more cycles run. The only way past 900 is a close (frees a real slot, re-triggers `pullConversationsUntilFull`) or a second agent coming online (giving the cron someone else to select via `findAvailableMemberForAutoPull`).

### Case 4 — 1000 unassigned, `maxConversation = 100`, 10 agents, cron-only, all far below their cap

Same setup as Case 3, but with 10 eligible agents instead of 1 (say each already holds 10, so 90 headroom each — nowhere near `maxConversation`). `eligibleMemberCount = 10`, so `teamBatchCap = min(50, 10×10) = 50` — the absolute ceiling now binds, not any individual agent's rate cap (each agent only contributes 5 of the 50, well under their own 10 budget).

|                                 | Old flat cap (20)       | New scaled cap (50)     |
| ------------------------------- | ----------------------- | ----------------------- |
| Assigned per cron tick          | 20 (2 per agent)        | 50 (5 per agent)        |
| Backlog 1000 → 0 via cron alone | ~12.5 hours (50 cycles) | **5 hours (20 cycles)** |

The lesson from Case 3 still holds in reverse here: **adding agents beyond what's needed to hit the absolute ceiling doesn't help further** — an 11th or 50th idle agent wouldn't push this cycle's total past 50, they'd just make the split thinner. The ceiling, not agent count, is what governs a well-staffed team's cron throughput.

### Takeaway

The rate cap (10/120s) protects against an _unbounded_ `maxConversation` draining the backlog in one burst. It does **not** equalize agents whose `maxConversation` values are simply configured differently — that skew is by design, reflecting each agent's declared capacity. In both cases, once agents hit their ceiling, further backlog drain depends entirely on how fast they close conversations or, failing that, the 15-minute cron — which now scales its per-team cap with eligible member count (`min(AUTO_PULL_TEAM_BATCH_LIMIT, eligibleMemberCount × 10)`) instead of a flat number, so recovery from a missed event is both faster than before _and_ scales with how many agents are actually online.

A lone eligible agent is still bound by their own 10/120s rate cap regardless of the absolute ceiling (Case 3), so the practical cron throughput for a single-agent team is ~10/cycle. A well-staffed team (5+ eligible members) is instead bound by `AUTO_PULL_TEAM_BATCH_LIMIT` itself (Case 4) — more agents beyond that point don't add cron throughput, they just split the same ceiling thinner. And the 15-minute cron cadence means most of the underlying 120s rate window's refill cycles go unused simply because nothing checks in between ticks. `maxConversation` is a hard backstop everywhere _except_ self-pull, which checks `maxConversation` but not the rate cap — the only path where a single explicit action can hand back more than 10 at once.
