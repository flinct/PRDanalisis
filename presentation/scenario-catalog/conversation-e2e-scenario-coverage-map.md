# Conversation E2E — Scenario & Coverage Map (pre-automation)

> **Author:** Dany Christian · **Created:** 2026-08-05 · **Lane:** TEST CASE (scenario-first, automation after)
> **Scope gate:** DEVELOPED conversation features only. 9 undeveloped features excluded (see §5).
> **Source of truth:** `PRD/Conversationv2/` · **Automation target:** `sixV2Automation/playwright/tests/e2e/conversation/`
> **Method:** PRD scenarios (child B) × real e2e coverage (grep audit) × `Conversation.tsv` (725 manual cases).

---

## 0. TL;DR — the real state

| Metric | Count | Note |
|---|---|---|
| PRD testable scenarios (developed) | **~95** | 5 surfaces + cross-surface, from developed PRDs |
| e2e spec files | 18 | `playwright/tests/e2e/conversation/` |
| **Actually-running `test()`** | **85** | the only automation that executes today |
| **`test.fixme` stubs** | **674** | scenario written, NOT automated (skipped at runtime) |
| Manual TSV cases (`SIX-Convo-NNN`) | 725 | traceability master |

**Headline:** the gap is NOT missing scenarios. Scenarios are largely already written as `test.fixme` stubs. The gap is **activation** (stub → running test) + **2 genuinely uncovered PRD areas** (Ownership Decoupling, RLT/Wait-Time compute).

> ⚠️ **Selector-readiness caveat (2026-08-06 live audit — §1.5):** "activation" assumes the stub's `data-cy` resolves against the build under test. On dev-v2 today it mostly does NOT — most Class B hooks are merge-pending (FE branch `data-cy`, not deployed) and the entire `convo-room` surface targets hooks that are absent from FE source. Class B activation is gated on FE deploy; `convo-room` needs FE hooks first. See §1.5.

---

## 1. Existing e2e coverage — REAL vs STUB per spec

| Spec | Real `test()` | `fixme` stub | Verdict |
|---|---:|---:|---|
| convo-nav.spec.js | 28 | 46 | core nav (your-inbox/unassigned/all/starred/spam) **runs**; channel/team/junk/trash sections **stubbed** |
| convo-list-overview.spec.js | 13 | 19 | list render + ellipsis + customer name **runs**; icon/lifeness **stubbed** |
| chat-list.spec.js | 10 | 0 | ✅ running |
| empty-state.spec.js | 10 | 0 | ✅ running |
| inbox.spec.js | 6 | 0 | ✅ running |
| agent-validation.spec.js | 4 | 0 | ✅ running |
| conversation-history.spec.js | 4 | 0 | ✅ running |
| inbound-outbound.spec.js | 3 | 0 | ✅ running |
| sla-metrics.spec.js | 3 | 0 | ⚠️ shallow — opens room, checks SLA badge + close btn. **Does NOT verify FRT/RLT/TTC/Wait values** despite title |
| **convo-room.spec.js** | **0** | **284** | 🔴 100% stub — entire room surface un-activated |
| **convo-detail-panel.spec.js** | **0** | **167** | 🔴 100% stub — all 16 accordions un-activated |
| **convo-list-features.spec.js** | **0** | **118** | 🔴 100% stub — filters/sort/combining un-activated |
| **convo-supplement.spec.js** | **0** | **39** | 🔴 100% stub — SIX-Convo-664–713 placeholders |
| loop/runner/endpoint/collect | 4 | 1 | infra plumbing |
| **TOTAL** | **84** | **674** | |

---

## 1.5 Selector readiness — live `data-cy` audit (2026-08-11, RE-VERIFIED)

> Method: logged into `https://dev-v2.satuinbox.com/id/conversation/your-inbox` (`cekerayam01`), opened rooms in Your Inbox + Unassigned, scraped every `[data-cy]` from the deployed DOM (148 unique). **2026-08-06 audit is STALE — FE `data-cy` branch has since deployed to dev-v2.** All previously "MERGE-PENDING" and "NO-SOURCE" hooks below are now confirmed LIVE.

**3-tier hook classification (evidence-based, re-verified 2026-08-11):**

| Tier | Meaning | Hooks | Evidence |
|---|---|---|---|
| 🟢 **LIVE** | deployed on dev-v2 now (148 unique) | shell: `Main-Container`, `Sidebar-Navigation`, `Satuinbox-Logo`, `Sidebar-Navigation-List`, `User-Menu`, `Main-Section`, `Conversation-Section`, `Conversation-Sidebar-Navigation` · nav: `inbox-nav-your-inbox/unassigned/all/spam/starred/junk` · list: `conversation-list`, `Conversation-Chat-List-Header`, `Conversation-Chat-List-Page-Section`, `chatList-navPanelControlButton`, `chatList-searchButton`, `chatList-filter-status/read/sort/visibility/advance` · items: `chat-list-N`, `chat-list-N-avatar/checkbox/channel-icon/name/timestamp/quick-action/latest-message/unread-count/ticket-badge/account-channel-number/tag-container/tag-M` · room: `Chat-Room-Header`, `Chat-Room-Header-Contact-Avatar`, `Chat-Room-Header-Contact-Name`, `chatRoom-closeConversationButton`, `Chat-Room-Expired-Whatsapp-Banner`, `Chat-Room-Send-Template-Button`, `Message-Bubble-<id>` (dynamic per message), `Day-Separator` · input: `Input-Area-Container`, `Message-Text-Input`, `Macro-Button`, `Attach-File-Button`, `Emoji-Button`, `Send-Button` · detail (13, via btn[3] toggle): `Chat-Detail-Title`, `Chat-Detail-Copy-Id-Button`, `Chat-Detail-Section-assignee`, `Chat-Detail-Sla-frt/ttc/rlt/wait-time`, `Chat-Detail-Section-attributes/session/client-data/notes/events/tags` | live DOM, 2026-08-11 + 2026-08-14 detail audit |
| 🟡 **UNCONFIRMED** | not seen in audit — may be conditional | `chatRoom-reopenConversationButton` (needs closed conversation) | absent; re-check with closed convo |
| ~~🔴 NO-SOURCE~~ | **RETIRED — was based on stale 2026-08-06 audit** | ~~`Chat-Room-Header`, `Message-Text-Input`, `Send-Button`, etc.~~ | **all confirmed LIVE 2026-08-11 — see above** |

**Per-spec readiness (overlay on §1, re-verified 2026-08-11):**

| Spec | Real/stub | Selector readiness | Corrected verdict |
|---|---|---|---|
| convo-nav | 74/0 (activated) | 🟢 ALL LIVE (was: core-only + MERGE-PENDING) | ✅ safe to activate fully — MERGE-PENDING tag was stale |
| convo-list-overview | 13/19 | 🟢 list render LIVE | running part is safe |
| chat-list / empty-state / inbox / agent-validation / conversation-history / inbound-outbound | all real | 🟢 LIVE | ✅ genuinely running |
| sla-metrics | 3/0 | 🟢 badge LIVE (values still unasserted) | shallow, but resolves |
| **convo-room** | 0/284 (pre-activation) | 🟢 **LIVE — reclassified from NO-SOURCE** | **UNBLOCKED — activate now, no FE dependency left** |
| **convo-detail-panel** | 174/0 (activated) | 🟢 **LIVE** — Chat-Detail-* confirmed 2026-08-14 (btn[3] toggle) | **✅ already activated** |
| **convo-list-features** | 118/0 (activated) | 🟢 LIVE (was: MERGE-PENDING) | ✅ already activated correctly |
| convo-supplement | 131/0 (activated) | 🟢 mostly LIVE | ✅ already activated |

**Note on message input:** `Message-Text-Input` + `Send-Button` are CONFIRMED LIVE as of 2026-08-11 (`<textarea data-cy="Message-Text-Input">` inside `Input-Area-Container`). The 2026-08-06 claim that only `autogrowing-textarea` existed was stale — page objects can use `Message-Text-Input` directly, no rewrite needed.

---

## 2. PRD scenario → coverage status (developed only)

Legend: ✅ real test · 🟡 stub exists (activate) · 🔴 no scenario + no stub (write new)

### Surface 1 — Inbox / Root Navigation
| PRD scenario | e2e status | Where |
|---|---|---|
| NAV-01 six menu items visible | ✅ | convo-nav (your-inbox/unassigned/all/starred/spam run) |
| NAV-02 tab switch <1s | 🟡 | Inbox Navigation stub block (11 fixme) |
| NAV-03 unread badge live socket | 🟡 | stub |
| NAV-04 counter "99+" | 🟡 | stub |
| NAV-05 starred synced across team | 🟡 | starred nav runs render; cross-agent sync = stub |
| NAV-06 scroll/filter persist per tab | 🟡 | stub |
| NAV-07 quick search sidebar | 🟡 | Channel/Team nav section stubs |
| NAV-08 real-time ≤2s | 🟡 | stub |
| NAV-09/10 assign fail + session-expired toast | 🟡 | error-path stubs |

### Surface 2 — Team Inbox + Member Drawer/HUD
| PRD scenario | e2e status | Where |
|---|---|---|
| TEAM-01..10 create/roles/counters/drag/tags/SLA/filter/mention | 🟡 | convo-nav "Team navigation section" (14 fixme) |
| TEAM-11..21 HUD counts, drawer, presence, add/remove member, last-supervisor guard | 🟡 partial | supplement + nav stubs mention supervisor; **HUD count + presence-label + last-supervisor-block are thin** |
| TEAM-22/23 reorder, duplicate | 🔴 | no stub found |

### Surface 3 — Conversation Room
| PRD scenario | e2e status | Where |
|---|---|---|
| ROOM-01..07 header/identity/presence/typing/bubbles/status | 🟡 | convo-room 284 stubs cover these |
| ROOM-09/10 reminder modal + log | ⛔ EXCLUDED | reminder = undeveloped (see §5) |
| ROOM-11..21 quick actions/create-ticket/thread-search/attachments/paste/DnD/macro/send | 🟡 | convo-room stubs |
| ROOM-22/23 assignment workflow, reopen-on-new-message | 🟡 | "verify conversation status" stubs |
| ROOM-25 rich cards (Live Chat) | 🟡 | 1 stub hit |
| ROOM-26..28 connection-lost/session-expired/server-error recovery | 🟡 | stub |

### Surface 4 — Conversation Detail
| PRD scenario | e2e status | Where |
|---|---|---|
| DETAIL-01..14 assignee/SLA/id/channel/client/tags/events/history/notes/pinned/media/files | 🟡 | convo-detail-panel 167 stubs (all 16 accordions present) |
| DETAIL-15..23 custom attributes (SINGLE) add/edit/lock/admin-only/dropdown-validation/dup | 🟡 | "custom attributes accordion" (8 stubs) — **thin vs 9 PRD scenarios**, needs expansion |
| DETAIL-24 tags>20 / pinned>10 / file>25MB limits | 🟡 | stub |
| DETAIL-25/26 edit-lock conflict, missing-data fallback | 🟡 | stub |

### Surface 5 / Cross — SLA metrics, Ownership, Group Handling, Send-As
| PRD scenario | e2e status | Where |
|---|---|---|
| X-01/02 Wait-Time (T2-T1), RLT (T3-T2) compute | 🔴 **GAP** | sla-metrics only checks badge; no value assertion, no stub |
| X-03/04 RLT/Wait informational, no breach | 🔴 **GAP** | no coverage |
| X-05/06 reassign no-reset, multi-assignee attribution | 🔴 **GAP** | no coverage |
| X-07/08 live tick 1s, missing-T2 "Belum tersedia" | 🔴 **GAP** | no coverage |
| X-09/10 internal-only "Tidak berlaku", export columns | 🟡 partial | export covered elsewhere; UI state = gap |
| X-11..17 Ownership decoupling (sticky-bind, remap, manual-move banner, reopen modal, escalation-only, sender picker) | 🔴 **GAP** | grep: no stub, no real test anywhere |
| X-18..21 Group Handling new-session/room-history/pull-conflict/SLA-carryover | 🟡 | convo-supplement "Group Handling" + "Get New Conversation" (14 stubs) |

---

## 3. The gap, ranked

**Class A — genuinely uncovered (write NEW scenarios + automate):**
1. **Ownership Decoupling** (X-11..17, 7 scenarios) — sticky-bind, bulk-remap-no-move, manual-move banner + SLA-stop, closed-legacy-reopen modal, escalation-only inbox, sender picker. Zero coverage. P0.
2. **RLT / Wait-Time computation** (X-01..08, 8 scenarios) — actual timer values, T2/T3 boundaries, reassign non-reset, missing-T2 state. sla-metrics.spec is a badge check only. P0.

**Class B — scenario exists as stub, needs ACTIVATION (674 stubs):**
- convo-room (284), convo-detail-panel (167), convo-list-features (118) are 100% fixme.
- ⚠️ **Re-sequenced by §1.5 selector readiness — activation order is NOT by stub count:**
  1. 🟡 **MERGE-PENDING first, after FE branch `data-cy` deploys to dev-v2** → `convo-detail-panel` (167) + `convo-list-features` (118) + convo-nav channel/team. These are genuine "just flip fixme→test" once deployed.
  2. 🔴 **`convo-room` (284) is NOT quick-activation** → reclassify to **blocked-FE**. Its target hooks (`Chat-Room-Header`, `Send-Button`, `Message-Text-Input`, `Messages-Container`, …) are absent from FE source. Blocked until FE adds the hooks, OR the room send-path selectors are rewritten to `autogrowing-textarea` + `getByRole`. Do not schedule as P0 on stub-count alone.

**Class C — thin stub, needs EXPANSION:**
- Custom Attributes SINGLE: 8 stubs vs 9 PRD scenarios (admin-only create, dropdown-requires-option, dup-label, ui_editable=false lock).
- Member Drawer HUD: presence-label matrix + last-supervisor-removal guard + removed-assignee→unassigned.

---

## 4. Next step (automation)

Per `automation-bridge-rule.md`: scenarios land in `Conversation.tsv` → bucket into real specs (no meta-spec). Recommended order:
0. ⚠️ **GATE (from §1.5): FE branch `data-cy` must merge + deploy to dev-v2 before ANY Class B activation.** Until then, MERGE-PENDING stubs fail on selector resolution and `convo-room` is blocked-FE regardless. Verify by re-running the live `data-cy` scrape after deploy.
1. **Class A** → new stubs in `convo-supplement.spec.js` (continues SIX-Convo-714+) + activate `sla-metrics.spec.js` for RLT/Wait.
2. **Class B** → flip `test.fixme`→`test` per describe block, in §1.5 readiness order: MERGE-PENDING (`convo-detail-panel`, `convo-list-features`, nav channel/team) first after deploy; `convo-room` only after FE hooks land or selectors are rewritten.
3. Update `sixV2Automation/AGENTS.md` test counts after each batch.

---

## 5. Excluded (undeveloped — FE+BE 0%, per `Memory/comprehensive-undeveloped-features-analysis.md`)

Collaborator Role · Snooze Conversation · Related Conversations Grouping · Multi-Ticket Drafts from Single Bubble · WA Group Mention · Availability Auto-Reply · Room Reminder (ROOM-09/10) · Hold/Resume in Room Header · Collections (repeatable custom attrs).

> `convo-room.spec.js` already tags reminder stubs `[UNDEVELOPED]` (23 fixme) — leave labeled, do not activate. Assignee (not Collaborator) and SINGLE custom attrs (not Collections) remain in scope.

---

## 6. Ambiguous — confirm before automating

- **SLA policy not locked** (global-memory open risks): FRT start (inbound vs assignment), Agent-Centric vs Customer-Centric TTC pause, reopen behavior (3 defs), SLA color absolute-vs-percentage. RLT/Wait scenarios depend on these — **lock policy before writing value assertions**.
- **Get New Conversation / Agent Pull Queue** (X-18..21): stubs exist but dev-status of FIFO pull needs FE/BE confirm.
- **Global Search, Shared-Attribute Search, Shopee Add-On**: dev-status unverified — not scoped as scenarios here.
- **Reminder quick-action** in Chat List: `quick-action-reminder` data-cy EXISTS in FE but Room reminder is undeveloped — clarify whether list-level reminder is live.
