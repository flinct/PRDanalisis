# Conversation Scenario Catalog — Part B: Features & Permissions (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07
> **PRD Sources:** PRD/Conversationv2/ (9 PRD files)
> **Page Selectors:** Test/conversation/conversation-page-selectors.md
> **Test Env:** https://dev-v2.satuinbox.com
> **Status Legend:** DEVELOPED = full steps + (QA fills); UNDEVELOPED = [UNDEV] + (N/A — not built); PARTIAL = mix

---

## PRD Ticket - Conversation and Ticket Response Metrics Tracking
- **Status:** DEVELOPED

### SC-METRICS-001 — Wait Time calculated as T2 − T1 when conversation is assigned
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-013
- **Pre-condition:** Customer sends first message; agent is assigned (T1 and T2 exist)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open assigned conversation with known T1 and T2 timestamps
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` is visible
  4. Check value badge: Wait Time = T2 − T1
- **Expected Result:** Wait Time displayed as T2 − T1; status = Complete
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-002 — Wait Time empty and status Incomplete when conversation never assigned
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-020
- **Pre-condition:** New inbound conversation in Unassigned (T1 exists, no T2)
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open unassigned conversation (no agent assigned)
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` label visible
  4. Verify value shows "Incomplete" or empty
- **Expected Result:** Wait Time empty; status = Incomplete (no T2 recorded)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-003 — Wait Time empty with quality flag when T1 is missing/invalid
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-001, EH-002
- **Pre-condition:** Conversation with corrupt/missing T1
- **Steps:**
  1. Navigate to conversation with missing T1 (test data setup)
  2. Open conversation detail
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` shows quality flag or empty
- **Expected Result:** Wait Time empty or quality-flagged; not exported as zero
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-004 — RLT calculated as T3 − T2 when first successful customer-facing reply sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-014
- **Pre-condition:** Agent assigned (T2 exists); agent sends first customer-facing reply
- **Steps:**
  1. Navigate to assigned conversation
  2. Type message in `[data-cy="Message-Text-Input"]`
  3. Click `[data-cy="Send-Button"]`
  4. Verify `[data-cy="Chat-Detail-Sla-rlt"]` updates with T3 − T2
- **Expected Result:** RLT = T3 − T2; timer stops and shows final duration
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-005 — RLT not completed when first reply is internal note
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Agent sends internal note (not customer reply)
- **Steps:**
  1. Navigate to assigned conversation (T2 exists)
  2. Send internal note instead of customer reply
  3. Verify `[data-cy="Chat-Detail-Sla-rlt"]` timer still running
- **Expected Result:** RLT not completed; internal note does not trigger T3
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-006 — RLT not completed when first reply fails to send
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, EH-005
- **Pre-condition:** Agent reply fails to send
- **Steps:**
  1. Navigate to assigned conversation (T2 exists)
  2. Simulate send failure (disconnect WA session)
  3. Verify RLT timer continues running
- **Expected Result:** RLT not completed; failed send does not set T3
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-007 — No SLA breach created for RLT or Wait Time regardless of value
- **Type:** Regression | **Priority:** P0 | **Source:** US-003, FR-004
- **Pre-condition:** Metrics computed; no SLA breach created
- **Steps:**
  1. Navigate to conversation with completed RLT/Wait Time
  2. Verify no SLA breach notification created
  3. Check `[data-cy="chat-list-1-sla-badge"]` — no breach indicator
- **Expected Result:** No SLA breach for RLT or Wait Time regardless of value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-008 — Existing FRT and TTC behavior unchanged with metrics enabled
- **Type:** Regression | **Priority:** P0 | **Source:** US-003, FR-005
- **Pre-condition:** Existing FRT/TTC behavior with metrics enabled
- **Steps:**
  1. Navigate to conversation with existing FRT
  2. Verify `[data-cy="Chat-Detail-Sla-frt"]` unchanged
  3. Verify `[data-cy="Chat-Detail-Sla-ttc"]` unchanged
- **Expected Result:** FRT and TTC behavior unchanged after metrics enablement
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-009 — Reassignment before first reply: primary RLT starts from first assignment
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-046
- **Pre-condition:** Reassigned before first reply; RLT starts from first assignment
- **Steps:**
  1. Navigate to conversation assigned to Agent A (T2a)
  2. Reassign to Agent B via `[data-cy="Assign-Member-Modal"]`
  3. Agent B sends first reply
  4. Verify RLT baseline = T2a (first assignment)
- **Expected Result:** RLT starts from first assignment (T2a); not reset on reassignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-010 — First responder = agent who replies (not first assignee) after reassignment
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-049, FR-056
- **Pre-condition:** First responder = replying agent after reassignment
- **Steps:**
  1. Conversation assigned to Agent A then Agent B
  2. Agent B sends first customer reply
  3. Verify first responder field = Agent B
- **Expected Result:** First responder = agent who replied, not first assignee
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-011 — Reassignment after first reply: FRT/RLT/Wait Time unchanged
- **Type:** Regression | **Priority:** P0 | **Source:** US-004, FR-047
- **Pre-condition:** Reassignment after first reply; metrics unchanged
- **Steps:**
  1. Conversation with completed FRT/RLT/Wait Time
  2. Reassign conversation to different agent
  3. Verify FRT, RLT, Wait Time values unchanged
- **Expected Result:** Reassignment after first reply does not change existing metrics
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-012 — Multi-assignees added simultaneously: T2 uses earliest assignment
- **Type:** Edge | **Priority:** P0 | **Source:** US-005, FR-054
- **Pre-condition:** Multi-assignees added simultaneously; T2 = earliest assignment
- **Steps:**
  1. Assign Agent A and Agent B simultaneously
  2. Verify T2 = timestamp of earliest assignment event
- **Expected Result:** T2 uses earliest assignment timestamp
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-013 — Multi-assignees: first responder is replying agent
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-056
- **Pre-condition:** Multi-assignees: first responder = replying agent
- **Steps:**
  1. Conversation with Agent A and Agent B assigned
  2. Agent B sends first customer reply
  3. Verify first responder = Agent B
- **Expected Result:** First responder is the agent who actually replied
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-014 — Multi-assignees none reply: RLT remains incomplete
- **Type:** Edge | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Multi-assignees none reply; RLT incomplete
- **Steps:**
  1. Conversation with multiple assignees, none reply
  2. Verify `[data-cy="Chat-Detail-Sla-rlt"]` remains incomplete
- **Expected Result:** RLT remains incomplete when no assignee replies
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-015 — AUX exclusion from adjusted RLT when all agents in AUX and policy excludes
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-068
- **Pre-condition:** Test setup for: aux exclusion from adjusted rlt when all agents in aux and policy excludes
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: AUX exclusion from adjusted RLT when all agents in AUX and policy excludes
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: AUX exclusion from adjusted RLT when all agents in AUX and policy excludes
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-016 — AUX not paused when at least one assignee is available
- **Type:** Edge | **Priority:** P0 | **Source:** US-006, FR-069
- **Pre-condition:** Test setup for: aux not paused when at least one assignee is available
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: AUX not paused when at least one assignee is available
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: AUX not paused when at least one assignee is available
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-017 — AUX included when workspace policy counts AUX time
- **Type:** Positive | **Priority:** P0 | **Source:** US-006
- **Pre-condition:** Test setup for: aux included when workspace policy counts aux time
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: AUX included when workspace policy counts AUX time
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: AUX included when workspace policy counts AUX time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-018 — Snooze before first reply: adjusted RLT excludes only if SLA pause policy allows
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, FR-073
- **Pre-condition:** Test setup for: snooze before first reply: adjusted rlt excludes only if sla pause policy allows
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Snooze before first reply: adjusted RLT excludes only if SLA pause policy allows
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Snooze before first reply: adjusted RLT excludes only if SLA pause policy allows
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-019 — Waiting on Customer before first reply: quality flag stored
- **Type:** Edge | **Priority:** P0 | **Source:** US-007, FR-074, EC-013
- **Pre-condition:** Test setup for: waiting on customer before first reply: quality flag stored
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Waiting on Customer before first reply: quality flag stored
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Waiting on Customer before first reply: quality flag stored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-020 — Wait Time not paused by Snooze/AUX/Waiting on Customer
- **Type:** Regression | **Priority:** P0 | **Source:** US-007, FR-075
- **Pre-condition:** Test setup for: wait time not paused by snooze/aux/waiting on customer
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Wait Time not paused by Snooze/AUX/Waiting on Customer
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Wait Time not paused by Snooze/AUX/Waiting on Customer
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-021 — Linked ticket uses conversation response metrics
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-084, FR-085
- **Pre-condition:** Linked ticket uses conversation response metrics
- **Steps:**
  1. Open conversation with linked ticket
  2. Verify ticket detail shows same RLT and Wait Time
- **Expected Result:** Linked ticket inherits conversation response metrics
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-022 — Internal-only ticket shows Not Applicable
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-087
- **Pre-condition:** Internal-only ticket shows Not Applicable
- **Steps:**
  1. Open internal-only ticket (no customer conversation)
  2. Verify RLT and Wait Time show "Not Applicable"
- **Expected Result:** Internal-only ticket: metrics = Not Applicable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-023 — Ticket linked after first response inherits completed metrics, no duplicate cycle
- **Type:** Edge | **Priority:** P0 | **Source:** US-008, FR-085, EC-008
- **Pre-condition:** Test setup for: ticket linked after first response inherits completed metrics, no duplicate cycle
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Ticket linked after first response inherits completed metrics, no duplicate cycle
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Ticket linked after first response inherits completed metrics, no duplicate cycle
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-024 — Conversation Offline Report includes RLT and Wait Time columns
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-099
- **Pre-condition:** Conversation Offline Report includes RLT and Wait Time
- **Steps:**
  1. Export Conversation Offline Report
  2. Verify CSV/Excel includes RLT and Wait Time columns
- **Expected Result:** Offline Report contains RLT and Wait Time columns with values
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-025 — Ticket Offline Report includes RLT and Wait Time columns
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-100
- **Pre-condition:** Ticket Offline Report includes RLT and Wait Time
- **Steps:**
  1. Export Ticket Offline Report
  2. Verify CSV/Excel includes RLT and Wait Time columns
- **Expected Result:** Ticket Offline Report contains RLT and Wait Time columns
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-026 — Not Applicable/Incomplete metrics export as readable value not zero
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-104, FR-105, FR-106
- **Pre-condition:** N/A/Incomplete metrics export as readable value
- **Steps:**
  1. Export report with conversations having Incomplete metrics
  2. Verify Incomplete values are readable text (not zero or blank)
- **Expected Result:** N/A or Incomplete exported as readable string, not zero
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-027 — Metric record stores T1, T2, T3, raw/adjusted duration, status, quality flags
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-092
- **Pre-condition:** Test setup for: metric record stores t1, t2, t3, raw/adjusted duration, status, quality flags
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Metric record stores T1, T2, T3, raw/adjusted duration, status, quality flags
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Metric record stores T1, T2, T3, raw/adjusted duration, status, quality flags
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-028 — Correction job recalculates and preserves previous calculation timestamp
- **Type:** Edge | **Priority:** P0 | **Source:** US-010
- **Pre-condition:** Test setup for: correction job recalculates and preserves previous calculation timestamp
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Correction job recalculates and preserves previous calculation timestamp
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Correction job recalculates and preserves previous calculation timestamp
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-029 — Invalid duration detected → status Invalid, not exported as zero
- **Type:** Negative | **Priority:** P0 | **Source:** US-010, FR-021
- **Pre-condition:** Test setup for: invalid duration detected → status invalid, not exported as zero
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Invalid duration detected → status Invalid, not exported as zero
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Invalid duration detected → status Invalid, not exported as zero
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-030 — Wait Time live timer running in Conversation Detail (T1 exists, no T2)
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-030
- **Pre-condition:** Wait Time live timer running (T1 exists, no T2)
- **Steps:**
  1. Open unassigned conversation with T1
  2. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` shows live running timer
- **Expected Result:** Wait Time shows live running timer until assignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-031 — RLT live timer running in Conversation Detail (T2 exists, no T3)
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-032
- **Pre-condition:** RLT live timer running (T2 exists, no T3)
- **Steps:**
  1. Open assigned conversation before first reply
  2. Verify `[data-cy="Chat-Detail-Sla-rlt"]` shows live running timer
- **Expected Result:** RLT shows live running timer until first reply
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-032 — Timer stops and shows final duration after T3
- **Type:** Positive | **Priority:** P0 | **Source:** US-011, FR-033, FR-034
- **Pre-condition:** Timer stops after T3
- **Steps:**
  1. Conversation where agent just sent first reply (T3 set)
  2. Verify timer stopped and shows final duration
- **Expected Result:** Timer stops; displays final duration value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-033 — No alert/breach/notification triggered by RLT or Wait Time
- **Type:** Regression | **Priority:** P0 | **Source:** US-011, FR-039
- **Pre-condition:** Test setup for: no alert/breach/notification triggered by rlt or wait time
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: No alert/breach/notification triggered by RLT or Wait Time
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: No alert/breach/notification triggered by RLT or Wait Time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-034 — Linked Ticket Detail shows same Wait Time and RLT from conversation
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-084
- **Pre-condition:** Linked Ticket Detail shows same metrics
- **Steps:**
  1. Open linked ticket detail
  2. Verify Wait Time and RLT match conversation metrics
- **Expected Result:** Ticket Detail shows identical Wait Time and RLT from conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-035 — Internal-only ticket Detail shows Not Applicable
- **Type:** Positive | **Priority:** P0 | **Source:** US-012, FR-087
- **Pre-condition:** Internal-only ticket Detail shows N/A
- **Steps:**
  1. Open internal-only ticket detail
  2. Verify metrics show "Not Applicable"
- **Expected Result:** Internal-only ticket Detail: Not Applicable for RLT and Wait Time
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-036 — Adjusted vs raw RLT distinguishable in tooltip/export
- **Type:** Positive | **Priority:** P1 | **Source:** US-013, FR-024, FR-027
- **Pre-condition:** Test setup for: adjusted vs raw rlt distinguishable in tooltip/export
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Adjusted vs raw RLT distinguishable in tooltip/export
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Adjusted vs raw RLT distinguishable in tooltip/export
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-037 — No pause interval: adjusted RLT equals raw RLT
- **Type:** Positive | **Priority:** P1 | **Source:** US-013
- **Pre-condition:** Test setup for: no pause interval: adjusted rlt equals raw rlt
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: No pause interval: adjusted RLT equals raw RLT
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: No pause interval: adjusted RLT equals raw RLT
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-038 — Incomplete pause data: raw RLT kept, quality flag stored
- **Type:** Edge | **Priority:** P1 | **Source:** US-013, EH-013
- **Pre-condition:** Test setup for: incomplete pause data: raw rlt kept, quality flag stored
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Incomplete pause data: raw RLT kept, quality flag stored
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Incomplete pause data: raw RLT kept, quality flag stored
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-039 — Team Inbox routing alone does not complete T2 (wait continues)
- **Type:** Negative | **Priority:** P0 | **Source:** FR-061, EC-006, EC-032
- **Pre-condition:** Team Inbox routing alone does not complete T2
- **Steps:**
  1. Conversation routes to Team Inbox (no individual agent assigned)
  2. Verify Wait Time continues; T2 not set by routing alone
- **Expected Result:** Team Inbox routing does not set T2; wait continues
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-040 — Client timer drift corrected on server timestamp sync
- **Type:** Edge | **Priority:** P1 | **Source:** FR-036, EH-018, EH-023
- **Pre-condition:** Test setup for: client timer drift corrected on server timestamp sync
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Client timer drift corrected on server timestamp sync
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Client timer drift corrected on server timestamp sync
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-041 — Duplicate event received: idempotent calculation, no duplicate rows
- **Type:** Regression | **Priority:** P0 | **Source:** FR-094, EH-024, EC-018
- **Pre-condition:** Test setup for: duplicate event received: idempotent calculation, no duplicate rows
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Duplicate event received: idempotent calculation, no duplicate rows
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Duplicate event received: idempotent calculation, no duplicate rows
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-METRICS-042 — Overlapping pause intervals merged before adjusted calculation
- **Type:** Edge | **Priority:** P1 | **Source:** FR-077, EH-014
- **Pre-condition:** Test setup for: overlapping pause intervals merged before adjusted calculation
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open relevant conversation with metric data
  3. Validate: Overlapping pause intervals merged before adjusted calculation
  4. Verify metric display in `[data-cy="Chat-Detail-Section-assignee"]`
- **Expected Result:** Per PRD: Overlapping pause intervals merged before adjusted calculation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Omnichannel Inbox - Conversation Ownership Decoupling (Team Inbox x Channel Numbers)
- **Status:** DEVELOPED

### SC-OWNERSHIP-001 — Open conversation stays in original team after number remap (sticky legacy binding)
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-003
- **Pre-condition:** Open conversation in Team A; number remapped to Team B
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Open conversation under Team A
  3. Admin remaps WA number Team A → Team B in Settings
  4. Verify conversation still in Team A (sticky legacy binding)
- **Expected Result:** Open conversation stays in original team after number remap
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-002 — Legacy-bound badge displayed in conversation header
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-008
- **Pre-condition:** Legacy-bound conversation exists
- **Steps:**
  1. Navigate to legacy-bound conversation
  2. Verify `[data-cy="Chat-Room-Header"]` shows legacy-bound badge
- **Expected Result:** Legacy-bound badge displayed in conversation header
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-003 — Closed conversation + LEGACY_TTL exceeded → new conversation in current owner team
- **Type:** Edge | **Priority:** P0 | **Source:** US-001, FR-019
- **Pre-condition:** Closed legacy conversation + LEGACY_TTL expired + new inbound
- **Steps:**
  1. Close legacy-bound conversation
  2. Wait for LEGACY_TTL to expire
  3. Customer sends new message to remapped number
  4. Verify new conversation in current owner team (Team B)
- **Expected Result:** New conversation created in current owner team after TTL expiry
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-004 — New inbound to open legacy thread: appends to old team conversation
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-003
- **Pre-condition:** Open legacy thread; new inbound appends
- **Steps:**
  1. Customer sends message to remapped number (legacy thread open)
  2. Verify message appends to old team conversation
- **Expected Result:** New inbound to open legacy thread appends to old team conversation
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-005 — No open match: new conversation created in current owner team
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-004
- **Pre-condition:** No open match; new conversation in current team
- **Steps:**
  1. No existing open conversation for contact
  2. Customer sends message
  3. Verify new conversation in current owner team
- **Expected Result:** New conversation created in current owner team
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-006 — Routing decision recorded in audit log
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-012
- **Pre-condition:** Routing decision recorded in audit log
- **Steps:**
  1. Trigger routing decision (new inbound)
  2. Check audit log for routing entry
- **Expected Result:** Routing decision recorded with source, destination, reason
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-007 — Bulk remap: no existing conversations auto-moved
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-009
- **Pre-condition:** Bulk remap: no auto-move of existing conversations
- **Steps:**
  1. Perform bulk channel remap in Settings
  2. Verify existing conversations NOT auto-moved
- **Expected Result:** Bulk remap does not auto-move existing conversations
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-008 — Escalation-only inbox: conversation moved in is fully operable
- **Type:** Positive | **Priority:** P0 | **Source:** US-104, FR-010
- **Pre-condition:** Move conversation to escalation-only inbox
- **Steps:**
  1. Move conversation to escalation-only inbox
  2. Verify conversation fully operable (reply, assign, etc.)
- **Expected Result:** Escalation-only inbox: moved conversation is fully operable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-009 — Escalation-only inbox: no new external conversations auto-created
- **Type:** Positive | **Priority:** P0 | **Source:** US-104
- **Pre-condition:** Escalation-only inbox: no auto-created external conversations
- **Steps:**
  1. Verify no new external conversations auto-created in escalation-only inbox
- **Expected Result:** No new external conversations auto-created in escalation-only inbox
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-010 — Escalation-only inbox: reply requires sender picker if default unavailable
- **Type:** Edge | **Priority:** P0 | **Source:** US-104
- **Pre-condition:** Escalation-only reply requires sender picker
- **Steps:**
  1. Open conversation in escalation-only inbox
  2. Attempt reply — verify sender picker shown if default unavailable
- **Expected Result:** Sender picker shown when default sender unavailable
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-011 — Manual move preserves full history (messages, files, tags, timestamps)
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-006
- **Pre-condition:** Manual move preserves full history
- **Steps:**
  1. Move conversation from Team A to Team B
  2. Verify messages, files, tags, timestamps all preserved
- **Expected Result:** Full history preserved after manual move
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-012 — Move resets assignee to Unassigned and stops SLA immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-006, FR-015
- **Pre-condition:** Move resets assignee and stops SLA
- **Steps:**
  1. Move assigned conversation to another team
  2. Verify assignee = Unassigned
  3. Verify SLA stopped immediately
- **Expected Result:** Move resets assignee to Unassigned; SLA stops immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-013 — Move banner shown: origin, destination, actor, timestamp
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-007
- **Pre-condition:** Move banner shown with details
- **Steps:**
  1. Complete a conversation move
  2. Verify banner shows origin, destination, actor, timestamp
- **Expected Result:** Move banner: origin team, destination team, actor name, timestamp
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-014 — Reopen modal shown for closed legacy thread with remapped number
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-005
- **Pre-condition:** Reopen modal for closed legacy thread with remapped number
- **Steps:**
  1. Reopen closed legacy-bound conversation
  2. Verify reopen modal appears
- **Expected Result:** Reopen modal shown for closed legacy thread with remapped number
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-015 — Reopen modal default = Keep in Old Team
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-005
- **Pre-condition:** Reopen modal default = Keep in Old Team
- **Steps:**
  1. View reopen modal
  2. Verify default selection = "Keep in Old Team"
- **Expected Result:** Default = Keep in Old Team
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-016 — Default sender logic: last successful sender used first
- **Type:** Positive | **Priority:** P1 | **Source:** US-007, FR-011
- **Pre-condition:** Test setup for: default sender logic: last successful sender used first
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Default sender logic: last successful sender used first
- **Expected Result:** Per PRD: Default sender logic: last successful sender used first
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-017 — Sender unavailable: picker shown with permitted alternatives
- **Type:** Edge | **Priority:** P1 | **Source:** US-007, EH-004
- **Pre-condition:** Test setup for: sender unavailable: picker shown with permitted alternatives
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Sender unavailable: picker shown with permitted alternatives
- **Expected Result:** Per PRD: Sender unavailable: picker shown with permitted alternatives
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-018 — Cross-team history visible after move or legacy binding
- **Type:** Positive | **Priority:** P1 | **Source:** US-008, FR-014
- **Pre-condition:** Test setup for: cross-team history visible after move or legacy binding
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Cross-team history visible after move or legacy binding
- **Expected Result:** Per PRD: Cross-team history visible after move or legacy binding
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-019 — Move failed: ownership unchanged, retry option shown
- **Type:** Negative | **Priority:** P0 | **Source:** EH-001, FR-017
- **Pre-condition:** Move failed; ownership unchanged
- **Steps:**
  1. Simulate move failure (e.g. network error)
  2. Verify ownership unchanged
  3. Verify retry option shown
- **Expected Result:** Move failed: ownership unchanged, retry option shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-020 — Double-move conflict: idempotent check, latest state shown
- **Type:** Negative | **Priority:** P0 | **Source:** EH-002, FR-013
- **Pre-condition:** Double-move conflict: idempotent
- **Steps:**
  1. Two agents attempt same move simultaneously
  2. Verify idempotent: latest state shown, no duplicate
- **Expected Result:** Idempotent check; latest state displayed
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-021 — Reopen choice race: last write wins, other agent notified
- **Type:** Edge | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Test setup for: reopen choice race: last write wins, other agent notified
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Navigate to relevant Team Inbox
  3. Validate: Reopen choice race: last write wins, other agent notified
- **Expected Result:** Per PRD: Reopen choice race: last write wins, other agent notified
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-022 — Mapping missing/invalid: route to Default Team Inbox with banner
- **Type:** Negative | **Priority:** P0 | **Source:** FR-018, EH-005
- **Pre-condition:** Mapping missing/invalid: route to Default Team
- **Steps:**
  1. Remove mapping configuration
  2. Customer sends message
  3. Verify routed to Default Team Inbox with banner
- **Expected Result:** Route to Default Team Inbox with warning banner
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-023 — Move to same team (no-op): blocked with toast
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006
- **Pre-condition:** Move to same team blocked
- **Steps:**
  1. Attempt to move conversation to its current team
  2. Verify blocked with toast message
- **Expected Result:** Move to same team blocked; toast shown
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-OWNERSHIP-024 — Mapping settings UI states "affects new chats only"
- **Type:** Positive | **Priority:** P0 | **Source:** FR-016, UI-005
- **Pre-condition:** Mapping UI states "affects new chats only"
- **Steps:**
  1. Navigate to channel mapping Settings
  2. Verify UI shows "affects new chats only" disclaimer
- **Expected Result:** Settings UI displays "affects new chats only" warning
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Ticketing V2
- **Status:** DEVELOPED

### SC-TICKETV2-001 — Create ticket from selected chat bubbles with linked message references
- **Type:** Positive | **Priority:** P0 | **Source:** US-01, AC-01, FR-01
- **Pre-condition:** Active conversation with chat messages
- **Steps:**
  1. Navigate to conversation with messages
  2. Select chat bubbles via checkbox
  3. Click create ticket from selection
  4. Fill `[data-cy="Create-Ticket-Modal"]` fields
  5. Submit via `[data-cy="Create-Ticket-Submit-Button"]`
- **Expected Result:** Ticket created with linked message references from selected bubbles
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-002 — Create ticket from conversation list with auto-fetched context
- **Type:** Positive | **Priority:** P0 | **Source:** US-02, AC-02, FR-01
- **Pre-condition:** Active conversation exists
- **Steps:**
  1. Navigate to `/id/conversation/your-inbox`
  2. Right-click conversation → Create Ticket
  3. Verify `[data-cy="Create-Ticket-Modal"]` opens with auto-fetched context
  4. Submit ticket
- **Expected Result:** Ticket created from conversation list with auto-fetched context
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-003 — Messages after ticket creation auto-tagged with is_ticket_message=true
- **Type:** Positive | **Priority:** P0 | **Source:** AC-03, FR-02
- **Pre-condition:** Ticket created from conversation
- **Steps:**
  1. After ticket creation, send new message in conversation
  2. Verify message tagged with is_ticket_message=true
- **Expected Result:** Post-creation messages auto-tagged with is_ticket_message=true
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-004 — Ticket header displays linked conversation, ticket type, ticket number
- **Type:** Positive | **Priority:** P0 | **Source:** AC-04
- **Pre-condition:** Ticket exists
- **Steps:**
  1. Open ticket detail
  2. Verify header shows linked conversation, ticket type, ticket number
- **Expected Result:** Ticket header displays linked conversation, type, and number
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-005 — Chat SLA and Ticket SLA tracked independently
- **Type:** Positive | **Priority:** P0 | **Source:** US-04, AC-05, FR-04
- **Pre-condition:** Chat and ticket both active
- **Steps:**
  1. Open conversation with linked ticket
  2. Verify Chat SLA tracked independently
  3. Verify Ticket SLA tracked independently
- **Expected Result:** Chat SLA and Ticket SLA tracked independently
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-006 — State machine: Submitted → On Process → Waiting On Customer → Resolved
- **Type:** Positive | **Priority:** P0 | **Source:** AC-06, FR-03
- **Pre-condition:** Ticket in Submitted status
- **Steps:**
  1. Open ticket
  2. Transition: Submitted → On Process → Waiting On Customer → Resolved
  3. Verify each state transition succeeds
- **Expected Result:** Valid state machine: Submitted → On Process → Waiting On Customer → Resolved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-007 — Admin can reopen Resolved ticket
- **Type:** Positive | **Priority:** P0 | **Source:** AC-07
- **Pre-condition:** Resolved ticket
- **Steps:**
  1. Open resolved ticket
  2. Admin clicks reopen
  3. Verify ticket returns to previous state
- **Expected Result:** Admin can reopen Resolved ticket
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-008 — Notifications sent for new tickets, SLA warnings, reassignment
- **Type:** Positive | **Priority:** P0 | **Source:** AC-08, FR-07
- **Pre-condition:** New ticket or SLA warning or reassignment occurs
- **Steps:**
  1. Create new ticket
  2. Verify notification sent for new ticket
  3. Trigger SLA warning
  4. Verify SLA warning notification sent
- **Expected Result:** Notifications sent for new tickets, SLA warnings, reassignment
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-009 — All ticket actions logged in timeline (create, assign, edit, SLA, status)
- **Type:** Positive | **Priority:** P0 | **Source:** AC-09, FR-06
- **Pre-condition:** Ticket actions performed
- **Steps:**
  1. Create ticket, assign, edit, trigger SLA event, change status
  2. Verify all actions logged in timeline
- **Expected Result:** All ticket actions logged in timeline
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-010 — SLA runs when status is Submitted/In Progress (agent holds ball)
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Ticket status = Submitted or In Progress
- **Steps:**
  1. Open ticket in Submitted status
  2. Verify SLA timer running
  3. Move to In Progress
  4. Verify SLA continues running
- **Expected Result:** SLA runs when status is Submitted/In Progress
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-011 — SLA pauses when Waiting on Customer
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Ticket status = Waiting on Customer
- **Steps:**
  1. Move ticket to Waiting on Customer
  2. Verify SLA timer paused
- **Expected Result:** SLA pauses when Waiting on Customer
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-012 — SLA stops when Resolved
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Ticket status = Resolved
- **Steps:**
  1. Move ticket to Resolved
  2. Verify SLA timer stopped
- **Expected Result:** SLA stops when Resolved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-013 — SLA restarts on Reopen
- **Type:** Positive | **Priority:** P0 | **Source:** FR-04, §6.1
- **Pre-condition:** Resolved ticket reopened
- **Steps:**
  1. Reopen Resolved ticket
  2. Verify SLA restarts
- **Expected Result:** SLA restarts on Reopen
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-014 — Chat bubble deleted before ticket creation: button disabled
- **Type:** Negative | **Priority:** P0 | **Source:** EH - Invalid Bubble
- **Pre-condition:** Chat bubble deleted before ticket creation
- **Steps:**
  1. Delete chat bubble that was selected for ticket
  2. Verify create-ticket button disabled
- **Expected Result:** Button disabled when selected bubble deleted
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-015 — Duplicate ticket on same conversation blocked
- **Type:** Negative | **Priority:** P0 | **Source:** EH - Duplicate Context
- **Pre-condition:** Duplicate ticket attempt on same conversation
- **Steps:**
  1. Create ticket from conversation
  2. Attempt to create second ticket from same conversation
  3. Verify blocked
- **Expected Result:** Duplicate ticket on same conversation blocked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-016 — Template API down: retry x3, fallback default form
- **Type:** Negative | **Priority:** P1 | **Source:** EH - Template Fetch Failed
- **Pre-condition:** Test setup for: template api down: retry x3, fallback default form
- **Steps:**
  1. Navigate to ticket or conversation
  2. Validate: Template API down: retry x3, fallback default form
- **Expected Result:** Per PRD: Template API down: retry x3, fallback default form
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-017 — Illegal state transition blocked (e.g. Resolved → Submitted)
- **Type:** Negative | **Priority:** P0 | **Source:** EH - State Transition Invalid
- **Pre-condition:** Illegal state transition attempted
- **Steps:**
  1. Open ticket in Resolved status
  2. Attempt direct transition to Submitted
  3. Verify transition blocked
- **Expected Result:** Illegal state transition blocked
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-018 — Assign/reassign ticket to agents/team inbox
- **Type:** Positive | **Priority:** P0 | **Source:** US-03, FR-05
- **Pre-condition:** Ticket exists with assignee
- **Steps:**
  1. Open ticket
  2. Assign/reassign to agent or team inbox
  3. Verify assignment updates correctly
- **Expected Result:** Assign/reassign ticket to agents/team inbox succeeds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-019 — Ticket List page shows all tickets; assigned agents can update status
- **Type:** Positive | **Priority:** P0 | **Source:** FR-11, US-08
- **Pre-condition:** Ticket List page
- **Steps:**
  1. Navigate to Ticket List page
  2. Verify all tickets shown
  3. Assigned agent updates ticket status
  4. Verify status change reflected
- **Expected Result:** Ticket List shows all tickets; assigned agents can update status
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-020 — Agent can chat client via Ticket Room for follow-up
- **Type:** Positive | **Priority:** P0 | **Source:** FR-12, US-09
- **Pre-condition:** Ticket exists with linked conversation
- **Steps:**
  1. Open Ticket Room
  2. Send message via ticket room chat
  3. Verify client receives message
- **Expected Result:** Agent can chat client via Ticket Room for follow-up
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-021 — Invalid/inactive agent ID blocks assignment save
- **Type:** Negative | **Priority:** P1 | **Source:** EH - Assignment Error
- **Pre-condition:** Invalid/inactive agent ID in assignment
- **Steps:**
  1. Attempt to assign ticket to invalid agent ID
  2. Verify assignment save blocked
- **Expected Result:** Invalid/inactive agent ID blocks assignment save
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-TICKETV2-022 — SLA engine timeout: queue retry, no blocking
- **Type:** Negative | **Priority:** P1 | **Source:** EH - SLA Engine Timeout
- **Pre-condition:** Test setup for: sla engine timeout: queue retry, no blocking
- **Steps:**
  1. Navigate to ticket or conversation
  2. Validate: SLA engine timeout: queue retry, no blocking
- **Expected Result:** Per PRD: SLA engine timeout: queue retry, no blocking
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

## PRD Ticket - Assignees and Collaborators Permission Model
- **Status:** PARTIAL

### SC-COLLAB-001 — Assignee can reply to customer (Balas pelanggan enabled)
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005
- **Pre-condition:** Agent is assigned (Assignee)
- **Steps:**
  1. Navigate to assigned conversation
  2. Verify `[data-cy="Message-Text-Input"]` is enabled
  3. Verify "Balas pelanggan" (customer reply) available
- **Expected Result:** Assignee can reply to customer; Balas pelanggan enabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-002 — Assignee can perform open/close/reopen/resolve based on RBAC
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-007
- **Pre-condition:** Agent is assigned; RBAC allows actions
- **Steps:**
  1. Navigate to assigned conversation
  2. Verify `[data-cy="chatRoom-closeConversationButton"]` available
  3. Verify reopen/resolve actions available based on RBAC
- **Expected Result:** Assignee can perform open/close/reopen/resolve per RBAC
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-003 — Non-assignee user blocked from customer reply
- **Type:** Negative | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** User is NOT assigned to conversation
- **Steps:**
  1. Navigate to conversation where user is not assignee
  2. Verify `[data-cy="Message-Text-Input"]` disabled or hidden
  3. Verify `[data-cy="Input-Area-Disabled"]` visible
- **Expected Result:** Non-assignee blocked from customer reply; input disabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-004 [UNDEV] — Collaborator can view conversation/ticket per Team Inbox visibility
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-009
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator can view conversation/ticket per Team Inbox visibility
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-005 [UNDEV] — Collaborator can add internal notes (Catatan internal)
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator can add internal notes (Catatan internal)
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-006 [UNDEV] — Collaborator blocked from customer reply (Balas pelanggan disabled)
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator blocked from customer reply (Balas pelanggan disabled)
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-007 [UNDEV] — Collaborator blocked from close/reopen/resolve actions
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-012
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator blocked from close/reopen/resolve actions
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-008 [UNDEV] — Add active user as Collaborator
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Add active user as Collaborator
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-009 [UNDEV] — Block adding inactive user as Collaborator
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-015, EH-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Block adding inactive user as Collaborator
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-010 [UNDEV] — Block adding existing Assignee as Collaborator
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-016, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Block adding existing Assignee as Collaborator
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-011 [UNDEV] — Promote Collaborator to Assignee: auto-removed from Collaborators
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promote Collaborator to Assignee: auto-removed from Collaborators
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-012 [UNDEV] — Promotion is atomic: rollback on failure keeps Collaborator state
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-020, FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promotion is atomic: rollback on failure keeps Collaborator state
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-013 [UNDEV] — Promotion logged in activity log
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-022
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promotion logged in activity log
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-014 [UNDEV] — Role labels: Assignee chip under "Assignee", Collaborator under "Kolaborator"
- **Type:** Positive | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Role labels: Assignee chip under "Assignee", Collaborator under "Kolaborator"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-015 [UNDEV] — Disabled reply tooltip: "Hanya assignee yang dapat membalas pelanggan"
- **Type:** Positive | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Disabled reply tooltip: "Hanya assignee yang dapat membalas pelanggan"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-016 [UNDEV] — Collaborator added/removed/promoted events logged
- **Type:** Positive | **Priority:** P1 | **Source:** US-006, FR-034, FR-035, FR-036
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator added/removed/promoted events logged
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-017 [UNDEV] — @mention Collaborator in internal note; notification sent
- **Type:** Positive | **Priority:** P1 | **Source:** US-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: @mention Collaborator in internal note; notification sent
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-018 [UNDEV] — Mentioned Collaborator removed before save: note saves, delivery skipped
- **Type:** Edge | **Priority:** P1 | **Source:** US-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Mentioned Collaborator removed before save: note saves, delivery skipped
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-019 — Removing Assignee does NOT auto-add as Collaborator
- **Type:** Positive | **Priority:** P0 | **Source:** FR-023
- **Pre-condition:** Conversation with assigned agent
- **Steps:**
  1. Navigate to conversation
  2. Remove agent from Assignee list via `[data-cy="Unassign-Member-Modal"]`
  3. Verify removed agent NOT added as Collaborator
- **Expected Result:** Removing Assignee does NOT auto-add as Collaborator
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-020 [UNDEV] — Bulk add Collaborators: skip invalid, show summary
- **Type:** Edge | **Priority:** P1 | **Source:** FR-018, EC-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Bulk add Collaborators: skip invalid, show summary
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-021 [UNDEV] — Same user in both lists via API: Assignee wins, overlap removed
- **Type:** Edge | **Priority:** P0 | **Source:** EC-012, FR-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Same user in both lists via API: Assignee wins, overlap removed
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-022 [UNDEV] — Collaborator opens closed ticket: view + internal notes allowed
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator opens closed ticket: view + internal notes allowed
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-023 [UNDEV] — Collaborator removed while typing note: save blocked if no permission
- **Type:** Edge | **Priority:** P1 | **Source:** EC-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator removed while typing note: save blocked if no permission
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-024 — Assignee removed while composing reply: send blocked, draft remains
- **Type:** Edge | **Priority:** P0 | **Source:** EC-006
- **Pre-condition:** Agent assigned; composing reply
- **Steps:**
  1. Navigate to assigned conversation
  2. Type in `[data-cy="Message-Text-Input"]`
  3. Remove agent from assignee in another session
  4. Click `[data-cy="Send-Button"]`
  5. Verify send blocked; draft remains
- **Expected Result:** Send blocked when assignee removed mid-compose; draft preserved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-COLLAB-025 [UNDEV] — Supervisor removes last Assignee: block if policy requires min 1
- **Type:** Negative | **Priority:** P0 | **Source:** EC-009
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Supervisor removes last Assignee: block if policy requires min 1
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-026 [UNDEV] — Object moved to another Team: invalid Collaborators removed per policy
- **Type:** Edge | **Priority:** P1 | **Source:** EC-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Object moved to another Team: invalid Collaborators removed per policy
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-027 [UNDEV] — Collaborator loses Team Inbox access: removed or inaccessible
- **Type:** Edge | **Priority:** P1 | **Source:** EC-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collaborator loses Team Inbox access: removed or inaccessible
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-COLLAB-028 [UNDEV] — Ticket Collaborators follow same permission as Conversation Collaborators
- **Type:** Positive | **Priority:** P0 | **Source:** FR-030, FR-031, FR-032, FR-033
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket Collaborators follow same permission as Conversation Collaborators
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Conversation Custom Attributes (Single + Collections)
- **Status:** PARTIAL

### SC-ATTRS-001 — Not all fields shown by default; user adds field on demand
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-012
- **Pre-condition:** Agent viewing conversation detail sidebar
- **Steps:**
  1. Navigate to conversation → detail panel
  2. Open `[data-cy="Chat-Detail-Section-custom-attributes"]`
  3. Verify not all fields shown by default
  4. Click add field to add on demand
- **Expected Result:** Not all fields shown by default; user adds field on demand
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-002 — Cancel adding field: no changes saved
- **Type:** Positive | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** Add field picker open
- **Steps:**
  1. Open field picker in custom attributes
  2. Click Cancel
  3. Verify no changes saved
- **Expected Result:** Cancel adding field: no changes saved
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-003 — ui_editable=true field value editable and saved immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-013
- **Pre-condition:** Custom attribute with ui_editable=true
- **Steps:**
  1. Open `[data-cy="Chat-Detail-Section-custom-attributes"]`
  2. Edit ui_editable=true field value
  3. Verify auto-save on change
- **Expected Result:** Field value editable and saved immediately
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-004 — ui_editable=false field input disabled, not editable
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-014
- **Pre-condition:** Custom attribute with ui_editable=false
- **Steps:**
  1. Open custom attributes section
  2. Verify ui_editable=false field input is disabled
- **Expected Result:** Field input disabled; not editable by agent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-005 — No permission user: editing controls hidden/disabled
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-033
- **Pre-condition:** User without permission
- **Steps:**
  1. Login as user without attribute edit permission
  2. Open custom attributes
  3. Verify editing controls hidden/disabled
- **Expected Result:** No permission user: editing controls hidden/disabled
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-006 — Remove action on ui_editable=true field with confirmation
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-016, FR-017
- **Pre-condition:** ui_editable=true field with remove action
- **Steps:**
  1. Open custom attributes
  2. Click remove on ui_editable=true field
  3. Confirm removal dialog
  4. Verify field removed
- **Expected Result:** Remove action on ui_editable=true field with confirmation succeeds
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-007 — Remove blocked on ui_editable=false field
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-018
- **Pre-condition:** ui_editable=false field with remove attempt
- **Steps:**
  1. Open custom attributes
  2. Attempt remove on ui_editable=false field
  3. Verify remove blocked
- **Expected Result:** Remove blocked on ui_editable=false field
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-008 — Admin can create new field definition from picker
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-008
- **Pre-condition:** Admin user
- **Steps:**
  1. Login as Admin
  2. Open attribute picker
  3. Create new field definition
  4. Verify creation succeeds
- **Expected Result:** Admin can create new field definition from picker
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-009 — Non-Admin blocked from creating field definitions
- **Type:** Negative | **Priority:** P0 | **Source:** US-007, FR-008, EH-003
- **Pre-condition:** Non-Admin user
- **Steps:**
  1. Login as non-Admin
  2. Attempt to create field definition
  3. Verify blocked
- **Expected Result:** Non-Admin blocked from creating field definitions
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-010 — Dropdown definition requires at least 1 option
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, EH-001
- **Pre-condition:** Creating dropdown definition
- **Steps:**
  1. Create dropdown attribute with zero options
  2. Verify save blocked
- **Expected Result:** Dropdown definition requires at least 1 option
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-011 — Dropdown with options: value selector enabled for agent
- **Type:** Positive | **Priority:** P0 | **Source:** US-008
- **Pre-condition:** Dropdown with options defined
- **Steps:**
  1. Open conversation with dropdown attribute
  2. Verify value selector enabled for agent
- **Expected Result:** Dropdown value selector enabled for agent
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-012 — Integration updates value on ui_editable=false field (allowed)
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-015
- **Pre-condition:** Integration updates ui_editable=false field
- **Steps:**
  1. Integration (API) updates value on ui_editable=false field
  2. Verify update succeeds (API edit allowed)
- **Expected Result:** Integration can update ui_editable=false field
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-013 — Search conversations by custom attribute text value
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-026
- **Pre-condition:** Custom attribute text value set
- **Steps:**
  1. Navigate to conversation list
  2. Search by custom attribute text value
  3. Verify matching conversations returned
- **Expected Result:** Search by custom attribute text value returns matches
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-014 — Search matches inside collection values
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-027
- **Pre-condition:** Collection with values
- **Steps:**
  1. Search by value inside collection
  2. Verify matching conversations returned
- **Expected Result:** Search matches inside collection values
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-015 — Search by dropdown label matches stored value
- **Type:** Positive | **Priority:** P0 | **Source:** US-010
- **Pre-condition:** Dropdown attribute with stored value
- **Steps:**
  1. Search by dropdown label text
  2. Verify matching conversations returned
- **Expected Result:** Search by dropdown label matches stored value
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-016 [UNDEV] — Create collection: starts empty with zero fields
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Create collection: starts empty with zero fields
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-017 [UNDEV] — Multiple collections shown as compact rows with title + expand
- **Type:** Positive | **Priority:** P0 | **Source:** US-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Multiple collections shown as compact rows with title + expand
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-018 [UNDEV] — Single collection: flat mode without collection header
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-022
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Single collection: flat mode without collection header
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-019 [UNDEV] — Collection title uses name; fallback to last two non-empty values; "Tanpa judul" if none
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-023, FR-024, FR-025
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Collection title uses name; fallback to last two non-empty values; "Tanpa judul" if none
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-020 [UNDEV] — Rename collection inline; delete with confirmation
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-020, FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Rename collection inline; delete with confirmation
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-ATTRS-021 — Duplicate field definition label blocked (case-insensitive)
- **Type:** Negative | **Priority:** P0 | **Source:** FR-009, EH-002
- **Pre-condition:** Creating attribute with duplicate label
- **Steps:**
  1. Create attribute with label that already exists (case-insensitive)
  2. Verify save blocked
- **Expected Result:** Duplicate field definition label blocked (case-insensitive)
- **Actual Result:** *(QA fills)*
- **Existing TC:** —

---

### SC-ATTRS-022 [UNDEV] — Pagination: "X lainnya" for many collections
- **Type:** Positive | **Priority:** P1 | **Source:** US-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Pagination: "X lainnya" for many collections
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Availability Auto-Reply with Conversation and Ticket Templates
- **Status:** UNDEVELOPED

### SC-AUTOREPLY-001 [UNDEV] — Admin enables Availability Auto-Reply; triggers and templates configured
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-004, FR-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Admin enables Availability Auto-Reply; triggers and templates configured
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-002 [UNDEV] — Auto-reply disabled: no auto-reply sent on inbound
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Auto-reply disabled: no auto-reply sent on inbound
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-003 [UNDEV] — Enabled with no trigger: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-006, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Enabled with no trigger: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-004 [UNDEV] — Outside office hours trigger: auto-reply sent when message outside General Office Hours
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-009, FR-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Outside office hours trigger: auto-reply sent when message outside General Office Hours
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-005 [UNDEV] — Outside office hours enabled but Office Hours not configured: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-018, EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Outside office hours enabled but Office Hours not configured: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-006 [UNDEV] — Inside office hours: no auto-reply sent for this trigger
- **Type:** Positive | **Priority:** P0 | **Source:** US-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Inside office hours: no auto-reply sent for this trigger
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-007 [UNDEV] — No agent available trigger: auto-reply when zero eligible agents
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-010, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No agent available trigger: auto-reply when zero eligible agents
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-008 [UNDEV] — At least one eligible agent: no auto-reply for this trigger
- **Type:** Positive | **Priority:** P0 | **Source:** US-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: At least one eligible agent: no auto-reply for this trigger
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-009 [UNDEV] — Availability check fails: no auto-reply from this trigger, failure logged
- **Type:** Negative | **Priority:** P0 | **Source:** US-003, FR-023, EH-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Availability check fails: no auto-reply from this trigger, failure logged
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-010 [UNDEV] — Both triggers match: one auto-reply sent, reason = Outside office hours
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-013, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Both triggers match: one auto-reply sent, reason = Outside office hours
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-011 [UNDEV] — Auto-reply sender shown as "SatuInbox Bot"
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-046
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Auto-reply sender shown as "SatuInbox Bot"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-012 [UNDEV] — Bot reply excluded from FRT/ART/Ticket SLA/agent performance
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-048
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Bot reply excluded from FRT/ART/Ticket SLA/agent performance
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-013 [UNDEV] — Separate Conversation and Ticket templates required
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-031, FR-034
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Separate Conversation and Ticket templates required
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-014 [UNDEV] — Conversation template empty: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Conversation template empty: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-015 [UNDEV] — Ticket template empty: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket template empty: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-016 [UNDEV] — Active ticket context: Ticket template used
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-025, FR-026
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Active ticket context: Ticket template used
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-017 [UNDEV] — No active ticket context: Conversation template used
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-027
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No active ticket context: Conversation template used
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-018 [UNDEV] — Both contexts: Ticket template takes priority
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-028
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Both contexts: Ticket template takes priority
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-019 [UNDEV] — Conversation auto-reply logged in Conversation timeline
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-060
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Conversation auto-reply logged in Conversation timeline
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-020 [UNDEV] — Ticket auto-reply logged in both Conversation and Ticket timeline
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-061, FR-070
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket auto-reply logged in both Conversation and Ticket timeline
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-021 [UNDEV] — Timeline log failure: retry without resending customer message
- **Type:** Edge | **Priority:** P0 | **Source:** US-008, FR-064
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Timeline log failure: retry without resending customer message
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-022 [UNDEV] — Frequency limit: only one auto-reply per conversation within window
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-055, FR-056
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Frequency limit: only one auto-reply per conversation within window
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-023 [UNDEV] — Frequency evaluated separately per ticket
- **Type:** Positive | **Priority:** P0 | **Source:** US-009, FR-057
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Frequency evaluated separately per ticket
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-024 [UNDEV] — Cancel if agent replies first: pending auto-reply canceled
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-049, FR-053
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel if agent replies first: pending auto-reply canceled
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-025 [UNDEV] — No agent reply before delay: auto-reply sent
- **Type:** Positive | **Priority:** P0 | **Source:** US-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No agent reply before delay: auto-reply sent
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-026 [UNDEV] — Cancel disabled: auto-reply sent immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-010, FR-051
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel disabled: auto-reply sent immediately
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-027 [UNDEV] — Cancel disabled: delay input hidden
- **Type:** Positive | **Priority:** P1 | **Source:** US-010, FR-050
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel disabled: delay input hidden
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-028 [UNDEV] — Template variable unsupported: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** FR-039, EH-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Template variable unsupported: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-029 [UNDEV] — Preview renders Conversation and Ticket templates with sample values
- **Type:** Positive | **Priority:** P1 | **Source:** US-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Preview renders Conversation and Ticket templates with sample values
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-030 [UNDEV] — Unsaved changes: warning dialog on page leave
- **Type:** Positive | **Priority:** P1 | **Source:** US-012, FR-077, FR-078
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Unsaved changes: warning dialog on page leave
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-031 [UNDEV] — Rapid messages in one conversation: frequency limit prevents duplicates
- **Type:** Edge | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Rapid messages in one conversation: frequency limit prevents duplicates
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-032 [UNDEV] — Agent replies after bot message already sent: bot remains, no issue
- **Type:** Edge | **Priority:** P1 | **Source:** EC-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent replies after bot message already sent: bot remains, no issue
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-033 [UNDEV] — Internal note added before delay: does NOT cancel pending auto-reply
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006, FR-054
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Internal note added before delay: does NOT cancel pending auto-reply
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-034 [UNDEV] — Ticket resolved before delay: re-evaluate context before sending
- **Type:** Edge | **Priority:** P1 | **Source:** EC-008, FR-073
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ticket resolved before delay: re-evaluate context before sending
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-035 [UNDEV] — Channel unsupported: skip auto-reply, log skipped event
- **Type:** Negative | **Priority:** P1 | **Source:** EH-012
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Channel unsupported: skip auto-reply, log skipped event
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-AUTOREPLY-036 [UNDEV] — Duplicate inbound event: idempotent, no duplicate auto-reply
- **Type:** Regression | **Priority:** P0 | **Source:** FR-074, FR-076, EH-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Duplicate inbound event: idempotent, no duplicate auto-reply
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Conversation Snooze (Conversation List)
- **Status:** UNDEVELOPED

### SC-SNOOZE-001 [UNDEV] — Agent snoozes Open conversation to future time; hidden from Open list
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent snoozes Open conversation to future time; hidden from Open list
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-002 [UNDEV] — Snooze time reached: conversation returns to Open, in-app notification "Snooze selesai"
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-005, FR-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze time reached: conversation returns to Open, in-app notification "Snooze selesai"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-003 [UNDEV] — Attempt snooze with past time: blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Attempt snooze with past time: blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-004 [UNDEV] — Snooze does NOT change conversation status
- **Type:** Regression | **Priority:** P0 | **Source:** US-002, FR-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze does NOT change conversation status
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-005 [UNDEV] — Manual unsnooze: returns to original list without status change
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Manual unsnooze: returns to original list without status change
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-006 [UNDEV] — New inbound customer message: auto-unsnooze immediately
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-007
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: New inbound customer message: auto-unsnooze immediately
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-007 [UNDEV] — Snoozed count shown on Snoozed chip in top bar
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed count shown on Snoozed chip in top bar
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-008 [UNDEV] — Snoozed filter option in dropdown filter
- **Type:** Positive | **Priority:** P1 | **Source:** FR-015
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed filter option in dropdown filter
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-009 [UNDEV] — Snooze modal when reminder exists: info note "Reminder akan menyesuaikan..."
- **Type:** Edge | **Priority:** P1 | **Source:** US-005, FR-024
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze modal when reminder exists: info note "Reminder akan menyesuaikan..."
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-010 [UNDEV] — Reminder inside snooze window: deferred to snooze_until
- **Type:** Edge | **Priority:** P1 | **Source:** US-005, FR-023
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Reminder inside snooze window: deferred to snooze_until
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-011 [UNDEV] — Snoozed then customer replies immediately: auto-unsnooze, moves to Open
- **Type:** Edge | **Priority:** P0 | **Source:** EC-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed then customer replies immediately: auto-unsnooze, moves to Open
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-012 [UNDEV] — Snoozed then reassigned: wake notification goes to new assignee
- **Type:** Edge | **Priority:** P1 | **Source:** EC-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snoozed then reassigned: wake notification goes to new assignee
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-013 [UNDEV] — Agent viewing snoozed conversation: detail accessible, hidden only from list
- **Type:** Edge | **Priority:** P1 | **Source:** EC-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent viewing snoozed conversation: detail accessible, hidden only from list
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-014 [UNDEV] — Snooze from Closed list: hidden from Closed, returns to Closed on wake
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze from Closed list: hidden from Closed, returns to Closed on wake
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-015 [UNDEV] — Cancel and time-based wake race: idempotent, single unsnooze
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Cancel and time-based wake race: idempotent, single unsnooze
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-016 [UNDEV] — Agent snooze permission: only own assigned conversations
- **Type:** Permission | **Priority:** P0 | **Source:** FR-009, FR-011
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent snooze permission: only own assigned conversations
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-017 [UNDEV] — Supervisor/Admin snooze: any conversation in Team Inbox scope
- **Type:** Permission | **Priority:** P0 | **Source:** FR-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Supervisor/Admin snooze: any conversation in Team Inbox scope
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-SNOOZE-018 [UNDEV] — Snooze unassigned conversation blocked for Agent
- **Type:** Negative | **Priority:** P0 | **Source:** FR-011, EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Snooze unassigned conversation blocked for Agent
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - Omnichannel Inbox - Related Conversations Grouping
- **Status:** UNDEVELOPED

### SC-RELATED-001 [UNDEV] — Admin configures 1-4 Related Match Keys; row order = priority
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001, FR-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Admin configures 1-4 Related Match Keys; row order = priority
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-002 [UNDEV] — Delete all rows: save blocked "Minimal 1 key diperlukan"
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-008, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Delete all rows: save blocked "Minimal 1 key diperlukan"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-003 [UNDEV] — Duplicate Source + Field Name: save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-009, EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Duplicate Source + Field Name: save blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-004 [UNDEV] — "Pulihkan default" restores contact_number, email, contact_name
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: "Pulihkan default" restores contact_number, email, contact_name
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-005 [UNDEV] — Add drawer: single unified result list with matched-first ranking
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-022, FR-023
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Add drawer: single unified result list with matched-first ranking
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-006 [UNDEV] — No exact match: keyword/Conversation ID search still available
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-029
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: No exact match: keyword/Conversation ID search still available
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-007 [UNDEV] — Already linked conversation excluded from result list
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-028
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Already linked conversation excluded from result list
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-008 [UNDEV] — Matched result shows "Matched by" + "Matched value"
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-026
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Matched result shows "Matched by" + "Matched value"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-009 [UNDEV] — Multiple keys match: highest priority key shown
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Multiple keys match: highest priority key shown
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-010 [UNDEV] — Link two standalone conversations: one flat group (Primary + Child)
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-030, FR-031
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Link two standalone conversations: one flat group (Primary + Child)
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-011 [UNDEV] — Unlink child: becomes standalone again
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-034
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Unlink child: becomes standalone again
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-012 [UNDEV] — Promote child to Primary
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-035
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Promote child to Primary
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-013 [UNDEV] — Child belongs to another group: requires move/combine confirmation
- **Type:** Negative | **Priority:** P0 | **Source:** US-004, EH-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Child belongs to another group: requires move/combine confirmation
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-014 [UNDEV] — Combine two groups: final Primary selection required
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-037, FR-038
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Combine two groups: final Primary selection required
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-015 [UNDEV] — Combine cancel: both original groups unchanged
- **Type:** Positive | **Priority:** P0 | **Source:** US-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Combine cancel: both original groups unchanged
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-016 [UNDEV] — Grouped conversations: one parent row in list, children in expanded state
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-039, FR-040
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Grouped conversations: one parent row in list, children in expanded state
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-017 [UNDEV] — Parent row sorting uses latest activity across all children
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-041
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Parent row sorting uses latest activity across all children
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-018 [UNDEV] — Parent unread count aggregates all child unread
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-042
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Parent unread count aggregates all child unread
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-019 [UNDEV] — Grouped room opens on Primary tab by default
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-045, FR-050
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Grouped room opens on Primary tab by default
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-020 [UNDEV] — Child tabs after Primary; unread indicator on child tabs
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-049
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Child tabs after Primary; unread indicator on child tabs
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-021 [UNDEV] — Red dot on Add button when high-confidence matches exist
- **Type:** Positive | **Priority:** P1 | **Source:** US-008
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Red dot on Add button when high-confidence matches exist
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-022 [UNDEV] — Customer notice enabled by default; editable before send
- **Type:** Positive | **Priority:** P1 | **Source:** US-010, FR-052, FR-053
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Customer notice enabled by default; editable before send
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-023 [UNDEV] — Ineligible channels skipped for notice; grouping still succeeds
- **Type:** Edge | **Priority:** P1 | **Source:** US-010, FR-056, EH-010
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Ineligible channels skipped for notice; grouping still succeeds
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-RELATED-024 [UNDEV] — Group dissolves when only one conversation remains after unlink
- **Type:** Edge | **Priority:** P1 | **Source:** EC-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Group dissolves when only one conversation remains after unlink
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

## PRD Ticket - WhatsApp Group Mention in Conversation (WhatsApp Web)
- **Status:** UNDEVELOPED

### SC-WAMENTION-001 [UNDEV] — Typing "@" in WA group opens participant picker
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Typing "@" in WA group opens participant picker
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-002 [UNDEV] — Picker filters by name and number on query
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-006
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Picker filters by name and number on query
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-003 [UNDEV] — Picker load fails: auto-retry once, then error state with "Coba lagi"
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, FR-008, EH-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Picker load fails: auto-retry once, then error state with "Coba lagi"
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-004 [UNDEV] — Select participant: mention token inserted in message input
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-003
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Select participant: mention token inserted in message input
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-005 [UNDEV] — Send with valid mentions: delivered with working mentions in WA group
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-009
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Send with valid mentions: delivered with working mentions in WA group
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-006 [UNDEV] — Selected participant no longer valid: dropped on send, warning toast
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-011, EH-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Selected participant no longer valid: dropped on send, warning toast
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-007 [UNDEV] — Inbound/outbound mentions rendered with highlight styling
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-014
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Inbound/outbound mentions rendered with highlight styling
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-008 [UNDEV] — Hover mention: tooltip with display name and number
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-015
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Hover mention: tooltip with display name and number
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-009 [UNDEV] — Mention metadata missing: graceful fallback to plain text
- **Type:** Edge | **Priority:** P0 | **Source:** US-003, FR-016
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Mention metadata missing: graceful fallback to plain text
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-010 [UNDEV] — Participant picker fails entirely: message can still send as plain text
- **Type:** Negative | **Priority:** P0 | **Source:** US-004, FR-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Participant picker fails entirely: message can still send as plain text
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-011 [UNDEV] — Internal participant labeled "Internal" in picker
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-017, FR-018
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Internal participant labeled "Internal" in picker
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-012 [UNDEV] — Internal participant tooltip includes "Internal" label
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-019
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Internal participant tooltip includes "Internal" label
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-013 [UNDEV] — Two participants with same display name: number shown to disambiguate
- **Type:** Edge | **Priority:** P1 | **Source:** EC-001
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Two participants with same display name: number shown to disambiguate
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-014 [UNDEV] — Participant leaves group after picker opens: mention dropped on send
- **Type:** Edge | **Priority:** P1 | **Source:** EC-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Participant leaves group after picker opens: mention dropped on send
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-015 [UNDEV] — Max 100 mentions per message; above limit blocked
- **Type:** Edge | **Priority:** P1 | **Source:** EC-005
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Max 100 mentions per message; above limit blocked
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-016 [UNDEV] — "@text" typed without selecting participant: sends as normal text
- **Type:** Edge | **Priority:** P1 | **Source:** EC-004
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: "@text" typed without selecting participant: sends as normal text
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-017 [UNDEV] — Agent without send permission: picker not shown
- **Type:** Permission | **Priority:** P0 | **Source:** FR-021
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: Agent without send permission: picker not shown
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---

### SC-WAMENTION-018 [UNDEV] — WA session invalid: block mention and message send
- **Type:** Negative | **Priority:** P0 | **Source:** EH-002
- **Pre-condition:** Feature not built yet
- **Steps:**
  [UNDEVELOPED — PRD defines intent but feature not built yet]
- **Expected Result:** Per PRD: WA session invalid: block mention and message send
- **Actual Result:** *(N/A — not built)*
- **Existing TC:** —

---
