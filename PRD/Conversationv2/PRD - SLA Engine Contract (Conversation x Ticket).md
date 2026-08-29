# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: SLA Engine Contract — Unified SLA/Pause/Reopen Rules (Conversation × Ticket)
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: TBD

> **Nature of this PRD:** this is not a new feature — it is a **governance contract** that resolves 5 conflicting rule-sets spread across 11 existing V2 PRDs (see Appendix → References). It supersedes the conflicting clauses named below; it does not replace the PRDs themselves. Full PRD mode used because trigger = SLA + reopen + assignment + state model (`Rules/prd-writing-rule.md` §Feature Complexity Classification).

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-08-21 | Analyst (draft, pending PM sign-off) | Initial contract resolving L1/L2/L5/L7/L8 (SLA fragmentation, group chat TTC, relational/ticket overlap, snooze/hold pause conflict, reopen definition). |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Lock one definition each for: SLA start/stop/pause, FRT/TTC/RLT/Wait Time formulas, group chat SLA behavior, reopen behavior, and SLA color threshold — so every PRD/feature built after this stops re-deciding them. |
| Scope | Conversation SLA + linked Ticket SLA interaction. Does not redesign either SLA engine from scratch — it picks one already-implemented or already-specified rule per conflict and marks the losing PRD clauses superseded. |
| Key Capabilities | None new. This is a rule lock, not a shipped capability. |
| Outcome | Snooze, Hold/Resume, Collaborator, and any future SLA-aware feature (routing, reporting) build against one contract instead of guessing. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| FRT/TTC/RLT/Wait Time formula lock | Building Snooze or Hold/Resume UI (separate PRDs, blocked on this contract) |
| Pause policy for Hold vs Snooze vs AUX vs Waiting-on-Customer | RBAC/permission changes (none needed) |
| Reopen behavior (pick 1 of 3 competing definitions) | Ticket-side stage SLA redesign (already well-defined per `Memory/CLAUDE-be.md` §7, untouched) |
| Group chat SLA (FRT vs TTC treatment) | New API/event contracts (existing socket/queue infra reused as-is) |
| SLA color threshold formula (Chat List) | RLT SLA threshold/alerting (explicitly Phase 2+, stays out) |

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | 3 PRDs (Room, Snooze, RLT Adjusted) define 3 different Hold/Snooze SLA-pause behaviors. | Snooze/Hold cannot be built without guessing which pause rule ships. |
| PS-002 | 3 PRDs (Sessions, Room, Reassign) define 3 different reopen behaviors; FE already shipped one of them without formal sign-off. | QA cannot write one reopen test suite; future features refer to reopen inconsistently. |
| PS-003 | FE hides FRT entirely for group chat; only TTC should be hidden. | Lion Parcel / Farmacare (heavy WA Group clients) lose real FRT data — live bug. |
| PS-004 | Chat List SLA color uses absolute time; V2 spec requires percentage-of-budget. | Agents misjudge urgency — live bug, wrong color at wrong time. |
| PS-005 | RLT and FRT formulas could collapse to the same value depending on FRT's start point, silently producing duplicate metrics. | Reporting/analytics double-counts one thing as two KPIs. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| One SLA pause truth table | 0 PRDs after v1.0 define a competing Hold/Snooze/AUX pause rule |
| One reopen definition | 100% of reopen-related QA test cases reference this contract, not Session/Room/Reassign individually |
| Correct group chat SLA | FRT visible for 100% of group chats; TTC disabled for 100% of group chats |
| Correct SLA color | Chat List color matches % of SLA budget remaining, verified against `Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md` US-14 |

## **5. Resolved Rules (the contract itself)**

### **5.1 Metric Formulas — LOCKED (confirms existing FE, fixes PRD)**

| Metric | Formula | Status |
| ----- | ----- | ----- |
| **FRT** | `firstAgentReplyAt − firstCustomerMessageAt` (end-to-end from customer inbound, NOT from assignment) | **Confirms FE as shipped.** Supersedes `Conversation Detail v2.1` AC-02 ("FRT only visible when Unassigned") — that clause is wrong and is void. |
| **Wait Time in Queue** | `firstAgentAssignmentAt − firstCustomerMessageAt` | Unchanged, already correct in both PRD and FE. |
| **RLT** | `firstAgentReplyAt − firstAgentAssignmentAt` | Unchanged. Resolves Finding 1 (`conversation-sla-rlt-frt-ttc-analysis.md`): because FRT is anchored to inbound (not assignment), `FRT = Wait Time + RLT` holds and all three stay non-redundant. |
| **TTC** | `conversationClosedAt − firstCustomerMessageAt`, per-channel enable flag | Unchanged. |

FR-001 [P0]: System MUST compute FRT from `firstCustomerMessageAt`, never from `firstAgentAssignmentAt`.
FR-002 [P0]: System MUST enforce `FRT = Wait Time + RLT` as an invariant in reporting; any variance is a data-quality bug, not an acceptable metric.

### **5.2 Group Chat SLA — LOCKED**

| Metric | Group Chat Behavior | Status |
| ----- | ----- | ----- |
| FRT | **Visible and tracked**, same as 1:1 | **Fixes live bug.** FE currently returns `isGroup ? [] : slaItems`, hiding FRT too. Must change to hide TTC only. |
| TTC | **Disabled** (`slaSupported: false`), never shown, never breaches | Confirms `Omnichannel Inbox v1.1` "group chats cannot be resolved" — but that clause is scoped to TTC only, not FRT. |
| RLT / Wait Time | Visible and tracked, same as 1:1 | Unaffected — these never depended on resolve state. |

FR-003 [P0]: System MUST NOT suppress FRT, RLT, or Wait Time for `isGroup=true` conversations.
FR-004 [P0]: System MUST suppress TTC and TTC breach/reminder for `isGroup=true` conversations.

### **5.3 SLA Pause Policy — LOCKED (resolves 3-way conflict)**

| Trigger | FRT | TTC | RLT | Rationale |
| ----- | ----- | ----- | ----- | ----- |
| **Hold** (Room) | Pause | Pause | Pause | Hold = agent explicitly stops the clock; both PM-facing metrics and internal RLT freeze together. Confirms `Room v1.1`. |
| **Snooze** (Conversation) | No pause | No pause | No pause | Snooze = agent hides conversation from view, customer is NOT told to expect delay. SLA keeps running so a snoozed-too-long conversation still breaches visibly. Confirms `Snooze v1.0`, **voids** the "RLT Adjusted … tergantung Snooze" clause in `Response Metrics v1.0` file 3 — Snooze never pauses anything. |
| **Waiting on Customer** | No pause | Pause | No pause (already stopped, RLT ends at first reply) | Unchanged, existing canonical rule. |
| **AUX / Away** | Per-setting (`Hitung SLA saat agen dalam mode AUX` toggle) | Per-setting | Per-setting | Unchanged, existing canonical rule. |

FR-005 [P0]: System MUST pause FRT+TTC+RLT while a conversation is in `HOLD` state, and resume all three (using `pausedDurationMs` offset) on `RESUME`.
FR-006 [P0]: System MUST NOT pause any SLA metric while a conversation is `SNOOZED`. Snooze is purely a visibility state.
FR-007 [P1]: A conversation MUST NOT be in `HOLD` and `SNOOZED` simultaneously — Hold takes precedence; attempting Snooze while on Hold is rejected (see Edge Cases EC-002).

### **5.4 Reopen Behavior — LOCKED (picks 1 of 3, matches shipped FE)**

Three competing definitions existed: Sessions PRD ("always new session"), Room PRD ("reopen same conversation"), Reassign PRD ("reopen modal, ask user"). FE has already shipped Close/Reopen buttons acting on the **same conversation object** — no session-split UI exists. Migrating to Sessions' new-session model now would mean a data model change with zero current adoption benefit.

**Decision: Room-style reopen wins.** Reopening restores the same conversation record; no new session is spawned. `Chat Sessions v1.1` US-003 ("new session after resolved") is **superseded** for the base case; Sessions' session-tracking concept may still be used internally for analytics segmentation, but it MUST NOT change the conversation's identity or reset FRT/TTC history.

| Trigger | Conversation ID | Assignee | SLA (FRT/TTC) | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Reopen — same team | unchanged | unchanged | **New TTC cycle starts** (`ttcCycleId++`), FRT stays historical (already completed, not recomputed) | Matches Ticket-side "reopen = new cycle" precedent for consistency across domains. |
| Reopen — moved to different team (Reassign flow) | unchanged | reset to `Unassigned` | SLA **stops** on move, **new TTC cycle starts** once re-assigned in new team | Confirms `Reassign v1.4` FR-006/FR-015. |
| Inbound message on a `closed` conversation | unchanged | unchanged | Auto-reopen, same as manual reopen | No modal prompt needed for same-team case; Reassign's "reopen modal" applies only to the cross-team move path, not plain reopen. |

FR-008 [P0]: System MUST reopen a closed conversation by reactivating the same document, never by creating a new conversation/session record.
FR-009 [P0]: Reopen MUST start a new TTC cycle (`ttcCycleId` increments) but MUST NOT reset FRT (FRT already has a value from the original cycle and stays as historical record).
FR-010 [P1]: Cross-team move via Reassign flow follows FR-006/FR-015 of `Reassign v1.4` unchanged — this contract does not alter that path.

### **5.5 Chat List SLA Color Threshold — LOCKED (fixes live bug)**

Metric basis was previously undefined across all 3 conflicting PRDs. **Decision: color is based on TTC remaining %** (the metric agents act on to avoid a breach); FRT breach is surfaced separately via the existing FRT badge/reminder, not via list-row color.

| Color | Condition | Status |
| ----- | ----- | ----- |
| Green | `TTC remaining > 50%` of budget | **Change required** — FE currently uses absolute time (e.g. >10m = green), not %. |
| Yellow | `10% < TTC remaining ≤ 50%` | Change required, same reason. |
| Red | `TTC remaining ≤ 10%` or overdue | Change required, same reason. |
| N/A (no color) | Group chat (TTC disabled), or SLA not applicable | Confirms group chat exclusion from §5.2. |

FR-011 [P0]: Chat List row SLA color MUST be computed as `(ttcBudgetMs − ttcElapsedMs) / ttcBudgetMs`, not absolute remaining time.
FR-012 [P1]: `SLA Urgency` sort MUST use the same % basis as FR-011, not raw elapsed time.

## **6. State Transition Model**

| Entity | Current State | Action / Trigger | Next State | Allowed Roles | Guard Conditions | Side Effects | Audit Event |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Conversation SLA | `RUNNING` | Agent clicks Hold | `PAUSED` (all 3 metrics) | Agent, Supervisor | Conversation must be `open`/assigned | `pausedAt` recorded | `sla.paused` (reason=hold) |
| Conversation SLA | `PAUSED` (hold) | Agent clicks Resume | `RUNNING` | Agent, Supervisor | Must currently be Hold-paused | `pausedDurationMs` added to offset | `sla.resumed` |
| Conversation | `open` | Agent snoozes | `open` (SLA unaffected) + `snoozed=true` visibility flag | Agent | Not currently on Hold (FR-007) | none to SLA; visibility store updated | `conversation.snoozed` |
| Conversation | `closed` | Inbound message OR manual reopen (same team) | `open`, new `ttcCycleId` | System / Agent | — | FRT untouched, TTC cycle resets | `conversation.reopened` |
| Conversation | `open` (team A) | Move to team B | assignee → `Unassigned`, SLA stops | Supervisor, Admin | Target team must exist | SLA cycle ends, resumes on new assignment in team B | `conversation.moved` |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Conflict | Attempt to Snooze a Held conversation | Reject with toast "Tidak bisa snooze percakapan yang sedang di-hold." |
| EH-002 | Conflict | Attempt to Hold an already-Snoozed conversation | Allow — Hold takes precedence per FR-007, auto-clears snooze flag, toast "Percakapan di-hold, status snooze dibatalkan." |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Reopen happens twice in a row (rapid inbound after close, then closed again, then inbound again) | Each reopen increments `ttcCycleId` independently; FRT stays from the very first cycle only | No special UI, TTC badge reflects latest cycle |
| EC-002 | Snooze active, then agent clicks Hold | Hold wins; snooze auto-cleared (EH-002) | Toast per EH-002 |
| EC-003 | Group chat gets manually resolved via bulk action (bypassing normal "cannot resolve" UI gate) | TTC still MUST NOT be computed even if `closedAt` gets set — treat as data anomaly, exclude from TTC reporting | none (backend guard) |
| EC-004 | Conversation moved to another team while Held | Move stops SLA per FR-010; Hold state is also cleared (no orphaned pause across teams) | Move confirmation shows "Hold akan direset" |

## **9. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `ttcCycleId` | integer | `2` | Increments on each reopen, never decrements | Auto | `1` at creation |
| `pausedDurationMs` | integer (cumulative) | `340000` | Sum of all Hold pause windows in current TTC cycle | Auto | `0` |
| `slaColorBasis` | enum | `ttc_percent` | Fixed value per FR-011, not user-configurable in Phase 1 | Derived | `ttc_percent` |

## **10. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Reliability | Reopen and Hold/Resume must be idempotent — double-click must not double-increment `ttcCycleId` or double-count `pausedDurationMs`. |
| Observability | Emit `sla.paused` / `sla.resumed` / `conversation.reopened` as audit events (existing audit-service bus, no new infra). |
| Performance | Color threshold computation (FR-011) is arithmetic on already-fetched fields — no new query, no N+1 risk. |

## **11. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Snooze Conversation PRD (undeveloped) depends on §5.3 being locked first | Product/Engineering | Blocks Snooze build start | This contract unblocks it — no further action needed once approved |
| Hold/Resume UI (undeveloped) depends on §5.3 + §6 | Engineering | Blocks Hold build start | Same as above |
| FE group-chat SLA fix (§5.2) touches shared `slaItems` builder used by both Chat List and Detail | FE | Regression risk on both surfaces if not tested together | One PR, one regression pass covering both surfaces, not two separate patches |
| Chat List color fix (§5.5) changes a user-visible signal agents rely on daily | Product/Support | Agents may notice color changes overnight; needs a release note | Include in next release notes (`Release notes/` per existing convention) |

## **12. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Group chat FRT visibility | 100% of group chats show FRT | Immediately post-release | FE QA regression |
| SLA color accuracy | 0 mismatches between displayed color and % formula in QA sample | Post-release smoke test | Manual QA + automation |
| PRDs citing this contract instead of re-defining SLA | 100% of new Conversation/Ticket PRDs touching SLA | Ongoing | PRD review checklist |

## **13. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| RLT SLA threshold/alerting | Explicitly Phase 2+ per `Response Metrics v1.0` — not touched by this contract. |
| Relational Group aggregate SLA (Primary+Child) | Blocked on Relational Conversation (L5) being built; this contract's single-conversation rules become the base case it must extend, not replace. |

## **14. Limitations**

| Limitation | Impact |
| ----- | ----- |
| This contract does not resolve L3 (navigation overlap), L4 (Assignee/Collaborator), L6 (Custom Attributes), L9 (Agent availability), L10 (WA Mention scope) — those are independent of SLA and need their own resolution pass. | Scope intentionally narrow — SLA/reopen/pause only, per user request to fix flow not add modules. |
| Reopen decision (§5.4) assumes cross-team move keeps using Reassign's existing modal — this contract did not re-audit that modal's current UX. | Follow-up needed only if Reassign UX itself is flagged separately. |

## **15. Appendix**

| Item | Notes |
| ----- | ----- |
| Glossary | TTC Cycle = one resolve-to-reopen span of a conversation. Pause = SLA clock frozen, resumes from same elapsed value. |
| Assumptions | PM has not formally signed off on §5.3/§5.4 decisions yet — this draft picks the option that matches already-shipped FE behavior and existing Ticket-side precedent, to minimize migration cost (see Rationale columns). |
| Open Questions | OQ-1: Should Hold be visible/settable by Agent only, or also Supervisor-on-behalf-of-agent? (not resolved here — RBAC, out of scope). OQ-2: `Metric Quality Flags` / `Metric Status` enums referenced in RLT PRD (file 3) still have no defined value list — needs separate small addendum before RLT persistence ships. |
| References | Supersedes conflicting clauses in: `PRD Ticket - Omnichannel Inbox - Conversation Room.md` (file 9), `PRD Ticket - Conversation Snooze (Conversation List).md` (file 16), `PRD Ticket - Omnichannel Chat Sessions.md` (file 12), `PRD Ticket - Omnichannel Inbox - Conversation Ownership Decoupling.md` (file 13), `PRD Ticket - Omnichannel Inbox - Conversation Detail.md` (file 10), `PRD Ticket - Omnichannel Inbox - Chat List.md` (file 8), `PRD Ticket - Conversation and Ticket Response Metrics Tracking.md` (file 3), `PRD Ticket - Omnichannel Inbox.md` (file 4). Cross-analysis source: `Assessments/reference/conversation-prd-cross-analysis.md`, `Assessments/reference/conversation-sla-rlt-frt-ttc-analysis.md`. |
