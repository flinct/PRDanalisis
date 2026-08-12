# Conversation Scenario Catalog — Part C: Adjacent Surfaces (ENRICHED)

> **Author:** Dany Christian · **Created:** 2026-08-07 · **Status:** DEVELOPED
> **PRD Sources:** SLA, RLT, Analytics, Open API, Public ID, Macro
> **Page Selectors:** `Test/conversation/conversation-page-selectors.md`
> **Surfaces Enriched:** SC-SLA (24), SC-RLT (11), SC-ANALYTICS (18), SC-OPENAPI (20), SC-PUBLICID (14), SC-MACRO (16)

---

## 7. PRD Conversation SLA

### SC-SLA-001 — Admin opens "SLA untuk Percakapan" → sees shared policy + per-channel cards
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-004
- **Pre-condition:** Admin logged in; at least one conversation channel connected
- **Steps:**
  1. Navigate to Settings → SLA → "SLA untuk Percakapan"
  2. Verify page title displays "SLA untuk Percakapan"
  3. Verify shared "Kebijakan" policy section is visible
  4. Verify one SLA card per supported channel (Widget, WhatsApp API, WA Web Group, WhatsApp Web, Instagram, Facebook Messenger, Telegram, Email)
  5. Verify each card shows FRT and TTC metric rows (TTC disabled for WA Web Group)
- **Expected Result:** Page loads within 800ms; shared policy section + 8 channel cards displayed; each card shows channel icon, name, and metric rows
- **Actual Result:** *(QA fills)*

---

### SC-SLA-002 — Admin edits FRT/TTC and saves → only future SLA cycles use new values
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-040, FR-042
- **Pre-condition:** Admin on SLA settings page; active conversation with running SLA cycle exists
- **Steps:**
  1. Note current SLA values for WhatsApp API channel
  2. Change FRT from 15 Menit to 20 Menit
  3. Click "Simpan perubahan"
  4. Confirm in modal "Terapkan perubahan SLA?"
  5. Verify toast "SLA berhasil diperbarui"
  6. Open the active conversation — verify its SLA cycle still uses old value (15 Menit)
  7. Create a new conversation on WhatsApp API — verify SLA cycle uses new value (20 Menit)
- **Expected Result:** Active cycle unchanged (snapshot rule); new cycle uses 20 Menit FRT
- **Actual Result:** *(QA fills)*

---

### SC-SLA-003 — Invalid value entered → inline validation blocks save
- **Type:** Negative | **Priority:** P0 | **Source:** US-001, EH-001–EH-002
- **Pre-condition:** Admin on SLA settings page
- **Steps:**
  1. Clear FRT duration value (empty)
  2. Click "Simpan perubahan"
  3. Verify inline error "Durasi wajib diisi"
  4. Enter FRT value = 0
  5. Click save
  6. Verify inline error "Nilai durasi harus 1 sampai 999"
  7. Enter FRT value = 1000
  8. Click save — verify same validation error
- **Expected Result:** Save blocked for empty, 0, and >999 values; appropriate Bahasa Indonesia inline error shown
- **Actual Result:** *(QA fills)*

---

### SC-SLA-004 — Reminder active with value ≥ SLA duration → save blocked
- **Type:** Negative | **Priority:** P0 | **Source:** US-002, FR-028, EH-004
- **Pre-condition:** Admin on SLA settings page; FRT set to 30 Menit
- **Steps:**
  1. Open FRT reminder popover for a channel
  2. Set reminder to "Aktif"
  3. Enter reminder value = 30 Menit (equal to SLA duration)
  4. Close popover and click "Simpan perubahan"
  5. Verify inline error "Pengingat harus lebih kecil dari durasi SLA"
  6. Change reminder to 31 Menit (greater than SLA) — verify same error
  7. Change reminder to 29 Menit — verify save succeeds
- **Expected Result:** Save blocked when normalized reminder ≥ normalized SLA duration; succeeds when reminder < SLA
- **Actual Result:** *(QA fills)*

---

### SC-SLA-005 — Reminder triggers when remaining time ≤ configured offset
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-044–FR-045
- **Pre-condition:** Channel SLA FRT set to 60 Menit; FRT reminder set to 10 Menit; conversation assigned to agent
- **Steps:**
  1. Create new conversation on the configured channel
  2. Assign to agent (starts SLA cycle)
  3. Wait until 50 minutes elapsed (remaining = 10 min ≤ 10 min offset)
  4. Check assignee notification — verify in-app notification received with customer name, channel, metric "FRT"
  5. Check supervisor notification — verify same
  6. Verify only ONE reminder sent per metric per cycle (wait past 10 min, no duplicate)
- **Expected Result:** One reminder notification at ≤10 min remaining; no duplicates; contains customer name, channel, metric
- **Actual Result:** *(QA fills)*

---

### SC-SLA-006 — TTC pause toggle enabled + conversation enters Waiting on Customer → TTC pauses
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-011–FR-012
- **Pre-condition:** Shared policy "Jeda SLA TTC saat menunggu balasan pelanggan" enabled; TTC configured for channel
- **Steps:**
  1. Create conversation on a TTC-supported channel
  2. Assign agent (starts SLA cycle with TTC)
  3. Send agent reply (starts TTC timer)
  4. Change conversation status to "Waiting on Customer"
  5. Verify TTC timer pauses (remaining time stops counting down)
  6. Customer replies → status moves from Waiting on Customer
  7. Verify TTC timer resumes from where it paused
- **Expected Result:** TTC pauses on Waiting on Customer entry; resumes on exit; elapsed time during pause not counted
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-007 — AUX counting disabled + agent enters AUX mode → SLA pauses
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-013–FR-014
- **Pre-condition:** Shared policy "Hitung SLA saat agen dalam mode AUX" disabled; active SLA cycle running
- **Steps:**
  1. Ensure policy toggle is disabled in Settings
  2. Create conversation, assign agent (SLA starts)
  3. Set assigned agent to AUX mode
  4. Verify running SLA metrics pause
  5. Set agent back to Active mode
  6. Verify SLA metrics resume from paused time
- **Expected Result:** SLA pauses when agent enters AUX; resumes on agent return to Active; AUX time excluded from SLA calculation
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-008 — Policy toggle change saved → only future cycles use new policy
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-040–FR-041
- **Pre-condition:** Admin on SLA settings page; policy toggle currently disabled
- **Steps:**
  1. Note current policy state (e.g. AUX counting disabled)
  2. Enable "Hitung SLA saat agen dalam mode AUX" toggle
  3. Click "Simpan perubahan" and confirm
  4. Verify toast "SLA berhasil diperbarui"
  5. Verify existing active SLA cycle behavior unchanged (still pauses on AUX)
  6. Create new conversation and verify new cycle continues counting during AUX
- **Expected Result:** Active cycle retains old policy snapshot; new cycle uses updated policy
- **Actual Result:** *(QA fills)*

---

### SC-SLA-009 — Legacy global SLA workspace → migration creates per-channel SLA records
- **Type:** Positive | **Priority:** P0 | **Source:** US-004, FR-059–FR-062
- **Pre-condition:** Workspace with legacy global conversation SLA (FRT=30m, TTC=8h); migration not yet run
- **Steps:**
  1. Trigger SLA migration for workspace
  2. Open "SLA untuk Percakapan" settings page
  3. Verify per-channel cards created for all supported channels
  4. Verify FRT=30m on all channels (including WA Web Group)
  5. Verify TTC=8h on TTC-supported channels (Widget, WA API, WhatsApp Web, IG, FB Messenger, Telegram, Email)
  6. Verify TTC disabled for WA Web Group
  7. Verify legacy reminder configs copied to matching metrics
- **Expected Result:** Per-channel records created with equivalent legacy values; WA Web Group has FRT only; policies copied
- **Actual Result:** *(QA fills)*

---

### SC-SLA-010 — WA Web Group during migration → FRT migrated, TTC stays disabled
- **Type:** Edge | **Priority:** P0 | **Source:** US-004, FR-062, EC-009
- **Pre-condition:** Legacy workspace with global TTC enabled; WA Web Group channel exists
- **Steps:**
  1. Run migration
  2. Open WA Web Group card in SLA settings
  3. Verify FRT row shows migrated value
  4. Verify TTC row is disabled with helper text "Belum didukung untuk kanal ini"
  5. Verify TTC config not created in database for WA Web Group
- **Expected Result:** FRT migrated; TTC not created for WA Web Group; disabled row with Bahasa Indonesia helper text
- **Actual Result:** *(QA fills)*

---

### SC-SLA-011 — Migration is idempotent → rerun does not duplicate config
- **Type:** Edge | **Priority:** P0 | **Source:** FR-065
- **Pre-condition:** Migration already completed once for workspace
- **Steps:**
  1. Record current per-channel SLA config values and record count
  2. Trigger migration again for the same workspace
  3. Verify no duplicate records created
  4. Verify values unchanged from first migration
  5. Check migration audit log — verify second run logged as idempotent skip
- **Expected Result:** No duplicate configs; values preserved; audit log records idempotent rerun
- **Actual Result:** *(QA fills)*

---

### SC-SLA-012 — New workspace with no prior SLA → standard defaults seeded
- **Type:** Positive | **Priority:** P0 | **Source:** US-005, FR-067–FR-068
- **Pre-condition:** New workspace created; no prior SLA settings
- **Steps:**
  1. Open "SLA untuk Percakapan" for new workspace
  2. Verify Widget: FRT 5 Menit, TTC 30 Menit, reminder FRT 3 Menit, reminder TTC 10 Menit
  3. Verify WhatsApp API: FRT 15 Menit, TTC 8 Jam, reminder FRT 10 Menit, reminder TTC 1 Jam
  4. Verify Email: FRT 60 Menit, TTC 24 Jam, reminder FRT 15 Menit, reminder TTC 4 Jam
  5. Verify WA Web Group: FRT 30 Menit, TTC disabled, reminder FRT 10 Menit
- **Expected Result:** All channels seeded with standard defaults per appendix matrix; WA Web Group TTC disabled
- **Actual Result:** *(QA fills)*

---

### SC-SLA-013 — WA Web Group TTC metric disabled with helper text
- **Type:** Positive | **Priority:** P0 | **Source:** US-008, FR-009–FR-010
- **Pre-condition:** Admin on SLA settings page
- **Steps:**
  1. Open WA Web Group channel card
  2. Verify TTC row is disabled (greyed out / read-only)
  3. Verify helper text "Belum didukung untuk kanal ini" shown
  4. Attempt to edit TTC value — verify field is non-editable
- **Expected Result:** TTC disabled for WA Web Group; helper text in Bahasa Indonesia; edit blocked
- **Actual Result:** *(QA fills)*

---

### SC-SLA-014 — Conversation starts → SLA cycle begins when first assigned to agent
- **Type:** Positive | **Priority:** P0 | **Source:** FR-035
- **Pre-condition:** SLA configured for channel; conversation exists unassigned
- **Steps:**
  1. Create new inbound conversation (unassigned)
  2. Verify no SLA cycle active (no SLA badge in chat list)
  3. Assign conversation to agent
  4. Verify SLA cycle starts (SLA badge appears `[data-cy="chat-list-N-sla-badge"]`)
  5. Verify FRT timer begins counting
- **Expected Result:** SLA cycle starts at first assignment; FRT timer visible in detail panel
- **Actual Result:** *(QA fills)*

---

### SC-SLA-015 — FRT completed when first customer-visible agent message sent; internal notes ignored
- **Type:** Positive | **Priority:** P0 | **Source:** FR-036–FR-037
- **Pre-condition:** Conversation assigned; SLA running; FRT not yet completed
- **Steps:**
  1. Add an internal note to the conversation
  2. Verify FRT timer still running (internal note doesn't count)
  3. Send a customer-visible agent reply
  4. Verify FRT timer stops and final duration stored
  5. Check detail panel `[data-cy="Chat-Detail-Sla-frt"]` — verify shows completed time
- **Expected Result:** Internal notes ignored for FRT; first customer-visible message completes FRT
- **Actual Result:** *(QA fills)*

---

### SC-SLA-016 — TTC completed when conversation resolved/closed; TTC not created for WA Web Group
- **Type:** Positive | **Priority:** P0 | **Source:** FR-038–FR-039
- **Pre-condition:** Conversation on TTC-supported channel; SLA cycle active
- **Steps:**
  1. Resolve the conversation
  2. Verify TTC timer stops and final duration stored
  3. Check detail panel `[data-cy="Chat-Detail-Sla-ttc"]` — verify shows completed time
  4. Create conversation on WA Web Group; resolve it
  5. Verify no TTC metric shown or stored
- **Expected Result:** TTC completes on resolve/close for supported channels; no TTC for WA Web Group
- **Actual Result:** *(QA fills)*

---

### SC-SLA-017 — Supervisor receives reminder/breach notification with details + deep link
- **Type:** Positive | **Priority:** P0 | **Source:** US-006, FR-052
- **Pre-condition:** Supervisor assigned to team; conversation in team scope with active SLA
- **Steps:**
  1. Wait for SLA reminder/breach trigger
  2. Open in-app notification panel
  3. Verify notification shows customer name, channel name, metric name (FRT or TTC)
  4. Click notification
  5. Verify deep link opens conversation detail page
- **Expected Result:** Notification contains customer name, channel, metric; clicking opens conversation detail
- **Actual Result:** *(QA fills)*

---

### SC-SLA-018 — Assignee receives notification; if unassigned → only supervisors notified
- **Type:** Positive | **Priority:** P0 | **Source:** US-007, FR-053–FR-054
- **Pre-condition:** SLA reminder configured; conversation with agent assigned
- **Steps:**
  1. Trigger SLA reminder for assigned conversation
  2. Verify assignee receives in-app notification
  3. Verify supervisor also receives notification
  4. Unassign the conversation before next trigger
  5. Trigger breach
  6. Verify NO assignee notification sent
  7. Verify supervisor still receives breach notification
- **Expected Result:** Assignee gets notification when assigned; supervisors always get it; unassigned → supervisors only
- **Actual Result:** *(QA fills)*

---

### SC-SLA-019 — Assignee changes before trigger → only current assignee receives notification
- **Type:** Edge | **Priority:** P0 | **Source:** EC-004
- **Pre-condition:** Conversation assigned to Agent A; SLA reminder approaching
- **Steps:**
  1. Reassign conversation from Agent A to Agent B before reminder triggers
  2. Wait for reminder trigger
  3. Verify Agent B receives notification
  4. Verify Agent A does NOT receive notification
- **Expected Result:** Only current assignee (Agent B) at trigger time receives notification; previous assignee excluded
- **Actual Result:** *(QA fills)*

---

### SC-SLA-020 — Dashboard shows "SLA Hampir Terlewat" and "SLA Terlewat" summary cards
- **Type:** Positive | **Priority:** P1 | **Source:** US-009, FR-055–FR-056
- **Pre-condition:** Supervisor logged in; conversations with at-risk and breached SLA exist
- **Steps:**
  1. Open supervisor dashboard
  2. Verify "SLA Hampir Terlewat" card shows count of at-risk conversations
  3. Verify "SLA Terlewat" card shows count of breached conversations
  4. Click "SLA Hampir Terlewat" card
  5. Verify filtered list opens sorted by smallest remaining minutes first
  6. Click "SLA Terlewat" card
  7. Verify filtered list opens sorted by largest overdue minutes first
- **Expected Result:** Both summary cards visible with correct counts; clicking opens sorted filtered list
- **Actual Result:** *(QA fills)*

---

### SC-SLA-021 — Non-Admin blocked with "Akses ditolak" when saving SLA settings
- **Type:** Permission | **Priority:** P0 | **Source:** FR-001, FR-003, EH-006
- **Pre-condition:** Logged in as Supervisor (non-Admin) role
- **Steps:**
  1. Navigate to Settings → SLA → "SLA untuk Percakapan"
  2. Verify page loads in read-only mode (Supervisor can view per FR-002)
  3. Verify edit fields are disabled or hidden
  4. Attempt to modify FRT value and save
  5. Verify toast "Akses ditolak" shown
- **Expected Result:** Supervisor can view but not edit; save attempt blocked with "Akses ditolak" toast
- **Actual Result:** *(QA fills)*

---

### SC-SLA-022 — Reminder paused while metric paused → re-evaluated on resume
- **Type:** Edge | **Priority:** P0 | **Source:** FR-046–FR-048, EC-001
- **Pre-condition:** SLA cycle active; reminder configured; TTC pause policy enabled
- **Steps:**
  1. Create conversation with TTC reminder at 10 min before deadline
  2. Move conversation to Waiting on Customer at 12 min remaining (before reminder threshold)
  3. Verify reminder NOT sent while paused
  4. Customer replies → conversation exits Waiting on Customer at 8 min remaining
  5. Verify reminder IS sent on resume (8 min ≤ 10 min offset, still eligible)
- **Expected Result:** Reminder suppressed during pause; sent after resume if still ≤ offset and not yet sent
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-023 — Conversation resumes and TTC remaining already negative → breached immediately
- **Type:** Edge | **Priority:** P0 | **Source:** EC-002
- **Pre-condition:** TTC pause policy enabled; TTC deadline passes while conversation is paused
- **Steps:**
  1. Create conversation with 30-min TTC
  2. Move to Waiting on Customer at 10 min remaining
  3. Wait 20+ minutes (TTC deadline now passed)
  4. Customer replies → conversation resumes
  5. Verify TTC immediately marked as breached
  6. Verify one breach notification sent
  7. Verify conversation appears in "SLA Terlewat" list
- **Expected Result:** TTC breached immediately on resume; breach notification sent; appears in breached list
- **Actual Result:** *(QA fills)*
- *(Known Risk: Hold/Snooze/SLA 3-way conflict — see PRD for open questions)*

---

### SC-SLA-024 — Admin saves new values while active cycles exist → active cycles unchanged (snapshot rule)
- **Type:** Edge | **Priority:** P0 | **Source:** EC-007, FR-040–FR-042
- **Pre-condition:** Multiple active SLA cycles running; Admin on SLA settings
- **Steps:**
  1. Note current SLA values for 2 active conversations
  2. Change WhatsApp API FRT from 15 to 30 Menit
  3. Save and confirm
  4. Open active conversation 1 — verify SLA still shows 15 Menit deadline
  5. Open active conversation 2 — verify same
  6. Create new conversation — verify uses 30 Menit
- **Expected Result:** All active cycles preserve original snapshot; only new cycles use updated values
- **Actual Result:** *(QA fills)*

---

## 8. PRD Conversation RLT

### SC-RLT-001 — First customer message received, no agent assigned → Waktu Antre timer runs from T1
- **Type:** Positive | **Priority:** P0 | **Source:** AC-01
- **Pre-condition:** New inbound conversation; no agent assigned
- **Steps:**
  1. Customer sends first message to create a new conversation
  2. Open Conversation Detail
  3. Verify `[data-cy="Chat-Detail-Sla-wait-time"]` shows running timer
  4. Verify timer increments in real-time
- **Expected Result:** Wait Time (Waktu Antre) timer starts at T1 (first customer message); visible and running
- **Actual Result:** *(QA fills)*

---

### SC-RLT-002 — Agent assigned → Waktu Antre stops, final duration stored
- **Type:** Positive | **Priority:** P0 | **Source:** AC-02
- **Pre-condition:** Conversation with running Wait Time timer; no agent assigned
- **Steps:**
  1. Note current Wait Time timer value
  2. Assign agent to conversation
  3. Verify Wait Time timer stops and shows final duration
  4. Verify stored duration = T2 - T1 (assignment time - first message time)
- **Expected Result:** Wait Time stops at assignment; final duration persisted; timer shows static value
- **Actual Result:** *(QA fills)*

---

### SC-RLT-003 — Agent assigned but no reply yet → Waktu Kerja Staf (RLT) timer runs from T2
- **Type:** Positive | **Priority:** P0 | **Source:** AC-03
- **Pre-condition:** Conversation assigned to agent; agent has not replied
- **Steps:**
  1. Open Conversation Detail
  2. Verify `[data-cy="Chat-Detail-Sla-rlt"]` shows running timer
  3. Verify Wait Time timer stopped
  4. Verify RLT timer increments in real-time
- **Expected Result:** RLT timer starts at T2 (assignment time); running and visible
- **Actual Result:** *(QA fills)*

---

### SC-RLT-004 — First successful customer-facing reply sent → RLT timer stops, final duration stored
- **Type:** Positive | **Priority:** P0 | **Source:** AC-04
- **Pre-condition:** RLT timer running; agent has not replied yet
- **Steps:**
  1. Agent sends customer-facing reply
  2. Verify RLT timer stops and shows final duration
  3. Verify stored duration = T3 - T2 (first reply - assignment time)
  4. Verify first responder agent recorded
- **Expected Result:** RLT completes on first customer-facing reply; duration and first responder stored
- **Actual Result:** *(QA fills)*

---

### SC-RLT-005 — Internal notes, failed replies, drafts, system messages → do NOT count as T3
- **Type:** Edge | **Priority:** P0 | **Source:** AC-05
- **Pre-condition:** RLT timer running; agent assigned
- **Steps:**
  1. Agent adds internal note to conversation
  2. Verify RLT timer still running (not stopped)
  3. Agent creates draft message (not sent)
  4. Verify RLT timer still running
  5. System message appears (e.g. assignment change)
  6. Verify RLT timer still running
  7. Agent sends actual customer-facing reply
  8. Verify RLT timer stops
- **Expected Result:** Only successful customer-facing reply stops RLT; notes, drafts, failed, system messages ignored
- **Actual Result:** *(QA fills)*

---

### SC-RLT-006 — Reassignment before first reply → primary RLT does NOT reset
- **Type:** Edge | **Priority:** P0 | **Source:** AC-06
- **Pre-condition:** Conversation assigned to Agent A; RLT running from T2
- **Steps:**
  1. Note current RLT timer value and T2 timestamp
  2. Reassign conversation from Agent A to Agent B
  3. Verify RLT timer continues from original T2 (not reset)
  4. Verify timer does not restart from reassignment time
  5. Agent B sends reply → RLT stops using original T2
- **Expected Result:** RLT uses first assignment time; reassignment does not reset timer
- **Actual Result:** *(QA fills)*

---

### SC-RLT-007 — Multi-assignee conversation → first assignment used as T2, first replying agent stored
- **Type:** Edge | **Priority:** P0 | **Source:** AC-07
- **Pre-condition:** Conversation with multiple assignees
- **Steps:**
  1. Assign Agent A to conversation at time T2a
  2. Assign Agent B at time T2b (> T2a)
  3. Agent B sends first reply
  4. Verify RLT uses T2a (first assignment) as start
  5. Verify first responder stored as Agent B (who sent first reply)
- **Expected Result:** RLT start = earliest assignment; first responder = agent who sent first customer-facing reply
- **Actual Result:** *(QA fills)*

---

### SC-RLT-008 — Linked ticket shows inherited RLT and Wait Time metrics
- **Type:** Positive | **Priority:** P0 | **Source:** AC-08
- **Pre-condition:** Conversation with completed RLT and Wait Time; ticket linked to conversation
- **Steps:**
  1. Open linked Ticket Detail
  2. Verify RLT and Wait Time values match those from linked conversation
  3. Verify metrics show as inherited (not independently tracked)
  4. Verify values update if conversation metrics change
- **Expected Result:** Linked ticket inherits RLT and Wait Time from conversation; values match source
- **Actual Result:** *(QA fills)*

---

### SC-RLT-009 — Internal-only ticket (no linked customer conversation) → shows "Tidak berlaku"
- **Type:** Edge | **Priority:** P0 | **Source:** AC-09
- **Pre-condition:** Ticket created internally (not linked to any customer conversation)
- **Steps:**
  1. Open internal-only ticket detail
  2. Verify RLT metric shows "Tidak berlaku"
  3. Verify Wait Time metric shows "Tidak berlaku"
  4. Verify no timer runs for this ticket
- **Expected Result:** "Tidak berlaku" displayed for both RLT and Wait Time on internal-only tickets
- **Actual Result:** *(QA fills)*

---

### SC-RLT-010 — Offline Report Download includes RLT and Wait Time columns
- **Type:** Positive | **Priority:** P0 | **Source:** AC-10
- **Pre-condition:** Conversation and Ticket data with RLT/Wait Time metrics exist
- **Steps:**
  1. Navigate to report download section
  2. Export Conversation report (XLSX)
  3. Verify columns: First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, First Assignee, First Responder, Metric Status, Metric Quality Flags
  4. Export Ticket report (XLSX)
  5. Verify columns: Linked Conversation ID, Response Metric Source, First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, Metric Status, Metric Quality Flags
  6. Verify values match what's shown in detail panel
- **Expected Result:** Both exports include RLT and Wait Time columns with matching values from detail panel
- **Actual Result:** *(QA fills)*

---

### SC-RLT-011 — No alert/reminder/breach/notification/escalation for RLT or Wait Time in Phase 1
- **Type:** Regression | **Priority:** P0 | **Source:** AC-11
- **Pre-condition:** RLT and Wait Time metrics active; no thresholds configured
- **Steps:**
  1. Create conversation with long RLT (e.g. 2 hours without agent reply)
  2. Verify no reminder notification sent for RLT
  3. Verify no breach badge shown for RLT
  4. Create conversation with long Wait Time (e.g. 1 hour unassigned)
  5. Verify no reminder notification sent for Wait Time
  6. Verify no breach badge shown for Wait Time
  7. Verify no escalation triggered
- **Expected Result:** Phase 1 is tracking only; no alerts, reminders, breaches, badges, notifications, or escalations for RLT/Wait Time
- **Actual Result:** *(QA fills)*

---

## 9. PRD Analytics - Conversation

### SC-ANALYTICS-001 — Admin/Supervisor opens Analitik → Percakapan → 8 KPI cards + 4 charts load
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-010–FR-017
- **Pre-condition:** Admin/Supervisor logged in; analytics permission granted
- **Steps:**
  1. Click "Analitik" in left nav
  2. Click "Percakapan"
  3. Verify page title "Percakapan" displayed
  4. Verify 8 KPI cards visible: "Total percakapan", "Percakapan yang ditutup", "Percakapan yang terbuka", "Percakapan yang sudah dibalas", "Total balasan terkirim", "Total tangkapan layar", "Percakapan ditutup dengan tangkapan layar", "Total chat belum ter-assign"
  5. Verify 4 charts visible: by time, by channel, replies by time, tags by category
- **Expected Result:** Page loads within 3s; 8 KPI cards and 4 charts rendered
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-002 — Default date range "30 hari terakhir"; changing range refreshes all
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, US-002, FR-003, FR-007
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Verify date range defaults to "30 hari terakhir"
  2. Note current KPI values
  3. Change date range to "7 hari terakhir"
  4. Verify all KPI cards update (loading skeleton → new values)
  5. Verify all charts update
  6. Verify "Terakhir diperbarui" timestamp changes
- **Expected Result:** Default 30 days; changing range triggers full refresh; all KPI and charts update within 5s
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-003 — No data in selected range → KPI shows 0, charts show empty state
- **Type:** State | **Priority:** P0 | **Source:** US-001, EH-002
- **Pre-condition:** Analytics page loaded; date range with no data available
- **Steps:**
  1. Set date range to a period with no conversations (e.g. far future or pre-launch date)
  2. Verify all KPI card values show 0
  3. Verify charts show empty state message "Belum ada data pada periode ini"
  4. Verify no errors or crashes
- **Expected Result:** KPI = 0; charts show Bahasa Indonesia empty state; page remains functional
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-004 — Team/Agent/Channel filters applied → all KPI and charts reflect scope
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-007
- **Pre-condition:** Analytics page loaded with data from multiple teams, agents, channels
- **Steps:**
  1. Select Team = "Team A"
  2. Verify all KPI cards update to Team A scope
  3. Select Agent = "Agent 1"
  4. Verify KPI and charts update to Agent 1 scope
  5. Select Channel = "WhatsApp"
  6. Verify KPI and charts filtered to WhatsApp + Agent 1 + Team A
  7. Reset to "Semua tim" / "Semua agen" / "Semua kanal"
  8. Verify full data restored
- **Expected Result:** All filters consistently applied; KPI and charts always reflect selected scope
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-005 — Entity metrics use assignee at event time for attribution
- **Type:** Positive | **Priority:** P0 | **Source:** FR-008, EC-003
- **Pre-condition:** Conversation reassigned between agents during period
- **Steps:**
  1. Create conversation assigned to Agent A at time T1
  2. Reassign to Agent B at time T2
  3. Filter by Agent A
  4. Verify entity metrics count events attributed to Agent A (at event time)
  5. Filter by Agent B
  6. Verify entity metrics count events attributed to Agent B
- **Expected Result:** Attribution uses assignee at event time, not current assignee; filter reflects this
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-006 — "Total chat belum ter-assign" visible when "Semua tim" + "Semua agen"
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-017
- **Pre-condition:** Analytics page with default filters (Semua tim, Semua agen)
- **Steps:**
  1. Verify "Total chat belum ter-assign" KPI card is visible
  2. Verify count shows number of open conversations with no assignee at end of period
  3. Verify count matches direct database query
- **Expected Result:** Unassigned KPI visible and accurate when full scope selected
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-007 — "Total chat belum ter-assign" hidden when Agent ≠ "Semua agen"
- **Type:** Edge | **Priority:** P0 | **Source:** FR-019
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Select Agent = "Agent 1" (not "Semua agen")
  2. Verify "Total chat belum ter-assign" KPI card is hidden
  3. Reset Agent to "Semua agen"
  4. Verify KPI card reappears
- **Expected Result:** Unassigned KPI hidden when specific agent selected to avoid misinterpretation
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-008 — "Total chat belum ter-assign" hidden when Team ≠ "Semua tim"
- **Type:** Edge | **Priority:** P0 | **Source:** FR-020
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Select Team = "Team A" (not "Semua tim")
  2. Verify "Total chat belum ter-assign" KPI card is hidden
  3. Reset Team to "Semua tim"
  4. Verify KPI card reappears
- **Expected Result:** Unassigned KPI hidden when specific team selected to avoid misinterpretation
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-009 — "Total percakapan - berdasarkan waktu" bar chart shows daily counts
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-021
- **Pre-condition:** Analytics page loaded with data
- **Steps:**
  1. Locate "Total percakapan - berdasarkan waktu" bar chart
  2. Verify bars represent daily conversation counts for selected period
  3. Hover a bar — verify tooltip shows date and count
  4. Verify total matches "Total percakapan" KPI
- **Expected Result:** Bar chart shows daily volumes; tooltips with date+count; sum matches KPI
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-010 — "Total percakapan - berdasarkan kanal" donut chart shows distribution
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-022
- **Pre-condition:** Analytics page loaded; "Semua kanal" selected; multi-channel data exists
- **Steps:**
  1. Locate "Total percakapan - berdasarkan kanal" donut chart
  2. Verify each channel segment displayed with distinct color
  3. Hover a segment — verify tooltip shows channel name and count
  4. Verify legend displayed with all channels
  5. Verify sum of segments matches "Total percakapan" KPI
- **Expected Result:** Donut chart shows channel distribution; tooltips with channel+count; legend present
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-011 — Channel filter active → channel distribution chart hidden with message
- **Type:** Edge | **Priority:** P0 | **Source:** FR-027, EC-006
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Select Channel = "WhatsApp" (not "Semua kanal")
  2. Verify "Total percakapan - berdasarkan kanal" chart is hidden
  3. Verify informational message "Bagan kanal tidak tersedia saat filter kanal aktif" shown
  4. Reset Channel to "Semua kanal"
  5. Verify chart reappears
- **Expected Result:** Channel distribution chart hidden when channel filter active; informational message shown
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-012 — "Total balasan - berdasarkan waktu" shows daily reply counts
- **Type:** Positive | **Priority:** P1 | **Source:** US-005, FR-023
- **Pre-condition:** Analytics page loaded with reply data
- **Steps:**
  1. Locate "Total balasan - berdasarkan waktu" chart
  2. Verify daily reply counts displayed
  3. Hover a data point — verify tooltip shows date and count
  4. Select specific Agent filter
  5. Verify chart counts only replies by selected agent
- **Expected Result:** Reply chart shows daily counts; agent filter scopes to selected agent's replies only
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-013 — "Total tag - berdasarkan kategori" shows tag counts; empty when no tags
- **Type:** Positive | **Priority:** P1 | **Source:** US-005, FR-024
- **Pre-condition:** Analytics page loaded; tag data exists
- **Steps:**
  1. Locate "Total tag - berdasarkan kategori" horizontal bar chart
  2. Verify tag categories displayed with counts
  3. Hover a bar — verify tooltip shows category and count
  4. Switch to workspace with no tags
  5. Verify empty state message shown in Bahasa Indonesia
- **Expected Result:** Tag chart shows per-category counts; empty state when no tags
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-014 — Charts show tooltip on hover with date/category and numeric value
- **Type:** Positive | **Priority:** P1 | **Source:** FR-025
- **Pre-condition:** Analytics page loaded with data
- **Steps:**
  1. Hover over a bar in "Total percakapan - berdasarkan waktu"
  2. Verify tooltip shows date and count
  3. Hover over a donut segment in channel chart
  4. Verify tooltip shows channel name and count
  5. Hover over a bar in reply chart and tag chart
  6. Verify consistent tooltip format
- **Expected Result:** All charts show tooltip on hover; format: category/date + numeric value
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-015 — Unauthorized user → "Akses ditolak"; page content blocked
- **Type:** Permission | **Priority:** P0 | **Source:** US-006, FR-001–FR-002, EH-001
- **Pre-condition:** Logged in as Agent without analytics permission
- **Steps:**
  1. Navigate directly to analytics page URL
  2. Verify "Akses ditolak" message displayed
  3. Verify no KPI cards, charts, or data visible
  4. Verify no data leakage in page source/network tab
- **Expected Result:** Unauthorized user blocked; "Akses ditolak" shown; no data exposure
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-016 — Analytics service failure → error state with "Coba lagi"
- **Type:** Negative | **Priority:** P0 | **Source:** US-006, EH-004
- **Pre-condition:** Analytics backend returning errors (simulate 500)
- **Steps:**
  1. Load analytics page
  2. Verify error state shown: "Terjadi kesalahan. Coba lagi"
  3. Verify "Coba lagi" button visible
  4. Fix backend issue
  5. Click "Coba lagi"
  6. Verify page loads successfully
- **Expected Result:** Error state with retry button; retry succeeds when backend recovers
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-017 — Filter load failure → filters disabled with "Gagal memuat filter"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-003
- **Pre-condition:** Filter API returning errors
- **Steps:**
  1. Load analytics page
  2. Verify filters show disabled state
  3. Verify message "Gagal memuat filter" with "Coba lagi" button
  4. Verify KPI and charts still load with default filter values
  5. Click "Coba lagi" — verify filters load
- **Expected Result:** Filters disabled on failure; retry available; KPI/charts use defaults
- **Actual Result:** *(QA fills)*

---

### SC-ANALYTICS-018 — "Terakhir diperbarui" timestamp shown in Asia/Jakarta time
- **Type:** Positive | **Priority:** P0 | **Source:** FR-028
- **Pre-condition:** Analytics page loaded
- **Steps:**
  1. Locate "Terakhir diperbarui" timestamp on page header
  2. Verify timestamp format includes date and time
  3. Verify timezone is Asia/Jakarta (WIB, UTC+7)
  4. Change a filter — verify timestamp updates after refresh
- **Expected Result:** Timestamp always displayed in Asia/Jakarta time; updates on filter change
- **Actual Result:** *(QA fills)*

---

## 10. PRD OPEN API - conversation n ticket

### SC-OPENAPI-001 — `GET /v1/inbox?properties[awb]=12345` returns matching results with pagination
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: search
- **Pre-condition:** API key/OAuth2 token valid; inbox items with `awb` property exist
- **Steps:**
  1. Send request:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?properties[awb]=12345&page=1&limit=20" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json"
     ```
  2. Verify HTTP 200 response
  3. Verify response schema: `{ "data": [...], "pagination": { "page": 1, "limit": 20, "total": N } }`
  4. Verify each item in `data` has `properties.awb` matching "12345"
- **Expected Result:** HTTP 200; response contains matching items with pagination metadata
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-002 — Search supports AND/OR filters by status, date range, team, agent
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: search
- **Pre-condition:** Diverse inbox data across statuses, teams, agents
- **Steps:**
  1. Search with AND filter:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?status=ongoing&team=team-a&page=1&limit=20" \
       -H "Authorization: Bearer <token>"
     ```
  2. Verify only `ongoing` items from `team-a` returned
  3. Search with date range:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?date_from=2026-01-01&date_to=2026-01-31&page=1&limit=20" \
       -H "Authorization: Bearer <token>"
     ```
  4. Verify all results within date range
- **Expected Result:** AND filters narrow results correctly; date range filters work
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-003 — `PATCH /inbox/{id}` with valid status transition succeeds with audit log
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: update
- **Pre-condition:** Inbox item exists with status `unassigned`
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "ongoing" }'
     ```
  2. Verify HTTP 200 response
  3. Verify response schema: `{ "id": "conv-12345", "status": "ongoing", ... }`
  4. Verify audit log entry with `source=api`, actor, timestamp
  5. PATCH again to `resolved`:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "resolved" }'
     ```
  6. Verify HTTP 200; status updated to `resolved`
- **Expected Result:** Valid transitions succeed; audit logged with `source=api`; status updates correctly
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-004 — `PATCH /inbox/{id}` with invalid status transition → 400-INV-STATUS
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 400-INV-STATUS
- **Pre-condition:** Inbox item exists with status `resolved`
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "unassigned" }'
     ```
  2. Verify HTTP 400 response
  3. Verify response schema: `{ "error": "Invalid status transition" }`
  4. Verify item status unchanged
- **Expected Result:** HTTP 400; error message "Invalid status transition"; no mutation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-005 — `PATCH /inbox/{id}` with invalid property format → 400-INV-PROP
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 400-INV-PROP
- **Pre-condition:** Inbox item exists
- **Steps:**
  1. Send request with malformed properties:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "properties": { "key_exceeding_64_chars_abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop": "value" } }'
     ```
  2. Verify HTTP 400 response
  3. Verify response schema: `{ "error": "Invalid property format" }`
- **Expected Result:** HTTP 400; error message "Invalid property format"; no mutation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-006 — `PATCH /inbox/{id}` with non-existent ID → 404-NOT-FOUND
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 404-NOT-FOUND
- **Pre-condition:** API token valid
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/nonexistent-id" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "resolved" }'
     ```
  2. Verify HTTP 404 response
  3. Verify response schema: `{ "error": "Inbox item not found" }`
- **Expected Result:** HTTP 404; error message "Inbox item not found"
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-007 — External system (SAPX) auto-resolves ticket via API; audit includes event ID
- **Type:** Contract (success) | **Priority:** P0 | **Source:** User Story: auto-resolve
- **Pre-condition:** Inbox item for SAPX-originated ticket with status `ongoing`
- **Steps:**
  1. Send request:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "status": "resolved", "properties": { "awb": "123456789", "resolved_by": "SAPX" } }'
     ```
  2. Verify HTTP 200 response
  3. Verify item status = `resolved`
  4. Verify audit log includes `actor`, `source=api`, `timestamp`, external event ID
- **Expected Result:** Auto-resolve via API succeeds; audit trail includes external system identifier
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-008 — `PUT /contacts/{id}` with transactions[] accepted; visible in sidebar UI
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: enrich
- **Pre-condition:** Contact exists; API token with write scope
- **Steps:**
  1. Send request:
     ```bash
     curl -X PUT "https://api.satuinbox.com/v1/contacts/cust-1001" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{
         "phone": "+628****7890",
         "transactions": [
           {
             "ref_id": "ORD-9912",
             "status": "delivered",
             "date": "2025-08-29T12:00:00Z",
             "amount": 250000,
             "currency": "IDR",
             "metadata": { "awb": "123456789", "courier": "JNE" }
           }
         ]
       }'
     ```
  2. Verify HTTP 200 response
  3. Open contact sidebar UI in SatuInbox
  4. Verify transaction ORD-9912 appears with amount 250,000 IDR
- **Expected Result:** Transactions accepted via API; visible in contact sidebar UI
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-009 — `PUT /contacts/{id}` with invalid data → 400 error
- **Type:** Contract (validation-error) | **Priority:** P1 | **Source:** User Story: enrich
- **Pre-condition:** Contact exists; API token valid
- **Steps:**
  1. Send request with invalid transaction data:
     ```bash
     curl -X PUT "https://api.satuinbox.com/v1/contacts/cust-1001" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{
         "phone": "not-a-valid-phone",
         "transactions": [
           { "ref_id": "", "status": "", "date": "invalid-date", "amount": -100, "currency": "INVALID" }
         ]
       }'
     ```
  2. Verify HTTP 400 response
  3. Verify error message describes validation failures
- **Expected Result:** HTTP 400 with validation error details; no data stored
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-010 — `POST /inbox/{id}/links` attaches external ticket; visible in Linked Tickets
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: link
- **Pre-condition:** Inbox item exists; API token with write scope
- **Steps:**
  1. Send request:
     ```bash
     curl -X POST "https://api.satuinbox.com/v1/inbox/conv-12345/links" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "external_ticket_id": "SAPX-777", "source": "SAPX", "url": "https://sapx.com/ticket/777" }'
     ```
  2. Verify HTTP 201 response
  3. Open conversation detail in UI
  4. Verify "Linked Tickets" section shows SAPX-777 with link
- **Expected Result:** External ticket linked; visible in Linked Tickets section
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-011 — `POST /inbox/{id}/links` with duplicate link → 409-DUP-LINK
- **Type:** Contract (conflict) | **Priority:** P1 | **Source:** Error: 409-DUP-LINK
- **Pre-condition:** Inbox item with existing link to SAPX-777
- **Steps:**
  1. Send duplicate link request:
     ```bash
     curl -X POST "https://api.satuinbox.com/v1/inbox/conv-12345/links" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "external_ticket_id": "SAPX-777", "source": "SAPX", "url": "https://sapx.com/ticket/777" }'
     ```
  2. Verify HTTP 409 response
  3. Verify response schema: `{ "error": "Already linked" }`
- **Expected Result:** HTTP 409; error "Already linked"; no duplicate created
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-012 — `PATCH /inbox/bulk` accepts up to 1000 IDs per request
- **Type:** Contract (success) | **Priority:** P1 | **Source:** User Story: bulk
- **Pre-condition:** 1000+ inbox items exist; API token with write scope
- **Steps:**
  1. Send bulk request with 1000 IDs:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/bulk" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "ids": ["conv-1", "conv-2", ...], "properties": { "batch_id": "batch-001" } }'
     ```
  2. Verify HTTP 200 response
  3. Verify response includes job ID or success summary
  4. Verify all 1000 items updated
- **Expected Result:** Bulk update accepted; all items processed; response includes summary
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-013 — Rate limit exceeded (100 req/sec/tenant) → 429-RATE-LIMIT
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** Error: 429-RATE-LIMIT
- **Pre-condition:** API token valid
- **Steps:**
  1. Send >100 requests within 1 second to any endpoint:
     ```bash
     for i in $(seq 1 110); do
       curl -s -o /dev/null -w "%{http_code}" \
         "https://api.satuinbox.com/v1/inbox?page=$i&limit=1" \
         -H "Authorization: Bearer <token>"
     done
     ```
  2. Verify at least one response returns HTTP 429
  3. Verify response includes `{ "error": "Too many requests", "retry_after": 5 }`
  4. Wait `retry_after` seconds and retry — verify success
- **Expected Result:** HTTP 429 after exceeding rate limit; `retry_after` header present; succeeds after wait
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-014 — Server error → 500-SRV-ERR
- **Type:** Contract (validation-error) | **Priority:** P0 | **Source:** Error: 500-SRV-ERR
- **Pre-condition:** Backend in error state (simulate internal failure)
- **Steps:**
  1. Send valid request during server error state:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=10" \
       -H "Authorization: Bearer <token>"
     ```
  2. Verify HTTP 500 response
  3. Verify response schema: `{ "error": "Internal server error" }`
  4. Verify no sensitive internal details exposed in response
- **Expected Result:** HTTP 500; generic error message; no internal details leaked
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-015 — API auth required; unauthenticated → 401
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** NFR: Authentication
- **Pre-condition:** No auth token or expired token
- **Steps:**
  1. Send request without Authorization header:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=10"
     ```
  2. Verify HTTP 401 response
  3. Send with expired token:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=10" \
       -H "Authorization: Bearer <expired-token>"
     ```
  4. Verify HTTP 401 response
- **Expected Result:** HTTP 401 for missing or expired auth; no data access without valid token
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-016 — PII masking: phone/email masked unless caller has `admin` scope
- **Type:** Contract (permission) | **Priority:** P0 | **Source:** NFR: PII Masking
- **Pre-condition:** Two API tokens: one with `read` scope, one with `admin` scope
- **Steps:**
  1. Search inbox with `read` scope token:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=1" \
       -H "Authorization: Bearer <read-scope-token>"
     ```
  2. Verify phone shows masked (e.g. `+628****7890`) and email masked
  3. Search with `admin` scope token:
     ```bash
     curl -X GET "https://api.satuinbox.com/v1/inbox?page=1&limit=1" \
       -H "Authorization: Bearer <admin-scope-token>"
     ```
  4. Verify phone and email show full values
- **Expected Result:** PII masked for non-admin; full values for admin scope
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-017 — `Idempotency-Key` header for PATCH/POST → idempotent response
- **Type:** Contract (idempotency) | **Priority:** P0 | **Source:** NFR: Idempotency
- **Pre-condition:** Inbox item exists; API token valid
- **Steps:**
  1. Send PATCH with Idempotency-Key:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Idempotency-Key: abc-123" \
       -H "Content-Type: application/json" \
       -d '{ "properties": { "test": "value" } }'
     ```
  2. Verify HTTP 200
  3. Send exact same request again with same Idempotency-Key
  4. Verify HTTP 200 with same response (idempotent)
  5. Verify no duplicate mutation (properties not doubled)
- **Expected Result:** Same Idempotency-Key returns same response; no duplicate mutation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-018 — All endpoints prefixed with `/v1/`; response schema backward compatible
- **Type:** Contract (backward-compat) | **Priority:** P0 | **Source:** NFR: Versioning
- **Pre-condition:** API token valid
- **Steps:**
  1. Call search: `GET /v1/inbox` — verify works
  2. Call update: `PATCH /v1/inbox/{id}` — verify works
  3. Call contacts: `PUT /v1/contacts/{id}` — verify works
  4. Call links: `POST /v1/inbox/{id}/links` — verify works
  5. Call bulk: `PATCH /v1/inbox/bulk` — verify works
  6. Verify all responses follow documented schema (no undocumented fields, no missing required fields)
- **Expected Result:** All endpoints under `/v1/` prefix; response schemas match documentation
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-019 — Every API action logged with actor, source=api, timestamp in audit
- **Type:** Contract (success) | **Priority:** P0 | **Source:** NFR: Audit Trail
- **Pre-condition:** API token valid; audit log accessible
- **Steps:**
  1. Perform PATCH via API to update an inbox item
  2. Check audit log for that item
  3. Verify entry contains: `actor` (API client ID), `source=api`, `timestamp`
  4. Perform POST link via API
  5. Verify audit entry for link action
- **Expected Result:** All API mutations produce audit entries with actor, source=api, timestamp
- **Actual Result:** *(QA fills)*

---

### SC-OPENAPI-020 — Transactions limit 200/contact; Properties ≤ 8KB → 400 if exceeded
- **Type:** Contract (validation-error) | **Priority:** P1 | **Source:** Limitations
- **Pre-condition:** Contact and inbox item exist; API token valid
- **Steps:**
  1. Send PUT with 201 transactions:
     ```bash
     curl -X PUT "https://api.satuinbox.com/v1/contacts/cust-1001" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "transactions": [ /* 201 items */ ] }'
     ```
  2. Verify HTTP 400 with error about transaction limit
  3. Send PATCH with properties JSON > 8KB:
     ```bash
     curl -X PATCH "https://api.satuinbox.com/v1/inbox/conv-12345" \
       -H "Authorization: Bearer <token>" \
       -H "Content-Type: application/json" \
       -d '{ "properties": { "large_key": "<8KB+ string>" } }'
     ```
  4. Verify HTTP 400 with error about property size limit
- **Expected Result:** HTTP 400 when transactions > 200 or properties JSON > 8KB
- **Actual Result:** *(QA fills)*

---

## 11. PRD Public ID Prefix and Sequential Numbering

### SC-PUBLICID-001 — First conversation in new tenant → public ID is CV-0
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-005
- **Pre-condition:** New tenant with zero conversations
- **Steps:**
  1. Create first conversation in new tenant
  2. Open conversation detail
  3. Verify public ID displayed is `CV-0`
  4. Verify format matches regex `^CV-[0-9]+$`
- **Expected Result:** First conversation gets public ID `CV-0`; format correct
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-002 — Sequential increment: CV-9 → CV-10; TK-99 → TK-100
- **Type:** Positive | **Priority:** P0 | **Source:** US-003, FR-006–FR-007
- **Pre-condition:** Tenant with CV-9 already existing
- **Steps:**
  1. Create new conversation
  2. Verify public ID is `CV-10` (not CV-10, CV-A, etc.)
  3. Create tickets until TK-99 exists
  4. Create next ticket
  5. Verify public ID is `TK-100`
  6. Verify digit length grows naturally (no padding to fixed width)
- **Expected Result:** Sequential increment without padding; natural digit growth
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-003 — Conversation detail shows CV-{n} with copy button
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-011
- **Pre-condition:** Conversation with public ID assigned
- **Steps:**
  1. Open conversation detail page
  2. Verify `CV-{n}` displayed in header area
  3. Verify copy button visible `[data-cy="Chat-Detail-Copy-Id-Button"]`
  4. Click copy button
  5. Verify clipboard contains `CV-{n}`
- **Expected Result:** Public ID visible in header; copy button copies to clipboard
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-004 — Ticket detail shows TK-{n} with copy button
- **Type:** Positive | **Priority:** P0 | **Source:** US-002, FR-011
- **Pre-condition:** Ticket with public ID assigned
- **Steps:**
  1. Open ticket detail page
  2. Verify `TK-{n}` displayed in header area
  3. Verify copy button visible
  4. Click copy button
  5. Verify clipboard contains `TK-{n}`
- **Expected Result:** Public ID visible in header; copy button works
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-005 — Global search by exact CV-10 or TK-10 finds matching entity
- **Type:** Positive | **Priority:** P0 | **Source:** US-001, FR-013
- **Pre-condition:** Conversation CV-10 and Ticket TK-10 exist
- **Steps:**
  1. Open global search (Ctrl+K or Cari sidenav)
  2. Type "CV-10" and submit
  3. Verify matching conversation found
  4. Clear and type "TK-10"
  5. Verify matching ticket found
- **Expected Result:** Exact public ID search returns correct entity
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-006 — Search for non-existing public ID → empty state, no wrong result
- **Type:** Negative | **Priority:** P0 | **Source:** US-001
- **Pre-condition:** No conversation with CV-99999 exists
- **Steps:**
  1. Open global search
  2. Type "CV-99999" and submit
  3. Verify empty state shown
  4. Verify no incorrect results returned
- **Expected Result:** Empty state; no false matches
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-007 — Public ID immutable once assigned; never changes
- **Type:** Positive | **Priority:** P0 | **Source:** FR-003
- **Pre-condition:** Conversation with public ID CV-42
- **Steps:**
  1. Note current public ID (CV-42)
  2. Update conversation properties, status, tags, assignee
  3. Verify public ID still CV-42
  4. Verify no API or UI path can change the public ID
- **Expected Result:** Public ID remains CV-42 regardless of other changes; immutable
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-008 — Deleted item's public ID is never reused
- **Type:** Edge | **Priority:** P0 | **Source:** FR-008
- **Pre-condition:** Conversations CV-0 through CV-5 exist; CV-3 to be deleted
- **Steps:**
  1. Delete conversation CV-3
  2. Create new conversation
  3. Verify new conversation gets CV-6 (not CV-3)
  4. Verify CV-3 is not reused
- **Expected Result:** Deleted ID (CV-3) skipped; next available sequence number assigned
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-009 — Concurrent creation → both get unique public IDs (atomic uniqueness)
- **Type:** Edge | **Priority:** P0 | **Source:** US-002, FR-009
- **Pre-condition:** Tenant with CV-50 as latest
- **Steps:**
  1. Create two conversations simultaneously (e.g. parallel API calls)
  2. Verify one gets CV-51 and the other gets CV-52
  3. Verify no duplicates
  4. Verify both stored correctly in database
- **Expected Result:** Atomic uniqueness guaranteed; both conversations get unique sequential IDs
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-010 — Unique constraint violation → auto-retry; "Gagal membuat ID. Coba lagi." on final failure
- **Type:** Negative | **Priority:** P0 | **Source:** FR-010, EH-001–EH-002
- **Pre-condition:** Simulate unique constraint violation (mock DB failure)
- **Steps:**
  1. Trigger concurrent ID generation that causes unique constraint violation
  2. Verify system retries up to 3 times automatically
  3. If all retries fail, verify toast "Gagal membuat ID. Coba lagi."
  4. Verify conversation creation fails gracefully (not partial)
- **Expected Result:** Up to 3 retries; final failure shows Bahasa Indonesia error toast; no partial state
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-011 — Backfill assigns public IDs to existing records; idempotent
- **Type:** Positive | **Priority:** P1 | **Source:** US-004, FR-014–FR-016
- **Pre-condition:** Existing conversations without public IDs; some with IDs already assigned
- **Steps:**
  1. Run backfill job
  2. Verify all existing conversations now have public IDs
  3. Verify already-assigned IDs unchanged (idempotent)
  4. Verify IDs assigned from next available counter (no gaps in assigned range)
  5. Run backfill again — verify no changes (idempotent rerun)
- **Expected Result:** Backfill assigns missing IDs; preserves existing; idempotent on rerun
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-012 — Backfill partial failure → "ID belum tersedia"; error logged
- **Type:** Negative | **Priority:** P1 | **Source:** US-004, EH-003
- **Pre-condition:** Backfill job running; simulate failure for specific records
- **Steps:**
  1. Run backfill with some records that will fail (e.g. corrupted data)
  2. Verify successful records get public IDs
  3. Open failed record in UI
  4. Verify "ID belum tersedia" label shown
  5. Verify error logged for retry
- **Expected Result:** Partial success; failed items show fallback label; error logged for retry
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-013 — Search input not matching CV-[0-9]+ or TK-[0-9]+ → "Format ID tidak valid"
- **Type:** Negative | **Priority:** P0 | **Source:** EH-004
- **Pre-condition:** Global search accessible
- **Steps:**
  1. Open global search
  2. Type "cv-abc" and submit
  3. Verify inline error "Format ID tidak valid"
  4. Type "TK-" (no number) and submit
  5. Verify same error
  6. Type "CV-123" (valid) — verify no format error
- **Expected Result:** Invalid format rejected with Bahasa Indonesia error; valid format accepted
- **Actual Result:** *(QA fills)*

---

### SC-PUBLICID-014 — Cloned/duplicated item → receives new public ID from next sequence
- **Type:** Edge | **Priority:** P1 | **Source:** EC-002
- **Pre-condition:** Conversation CV-100 exists; clone/duplicate feature available
- **Steps:**
  1. Clone conversation CV-100
  2. Verify cloned conversation gets new public ID (e.g. CV-101)
  3. Verify original CV-100 unchanged
  4. Verify no public ID collision
- **Expected Result:** Clone gets new sequential ID; original preserved; no collision
- **Actual Result:** *(QA fills)*

---

## 12. PRD Conversation - Macro

### SC-MACRO-001 — Admin views template list showing Shortcut and Message columns; search ≤1s
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: list/search
- **Pre-condition:** Admin logged in; templates exist in system
- **Steps:**
  1. Navigate to Settings → Template Pesan
  2. Verify list displays Shortcut and Message columns
  3. Type a search term in search bar
  4. Verify results filter within ≤1 second
  5. Verify list sorted alphabetically or by last updated
- **Expected Result:** Template list with Shortcut/Message columns; search responds ≤1s
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-002 — Admin creates template with shortcut + message → appears in list
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: create
- **Pre-condition:** Admin on Template Pesan page
- **Steps:**
  1. Click "Template Baru"
  2. Enter Shortcut = `/thankyou`
  3. Enter Message = multiline text ≤2000 chars
  4. Optionally select category and visibility
  5. Click Save
  6. Verify template appears in list with correct shortcut and message
- **Expected Result:** Template created; appears in list; shortcut starts with `/`
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-003 — Shortcut blank or not starting with / → validation error
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM01
- **Pre-condition:** Admin on create/edit template modal
- **Steps:**
  1. Leave Shortcut blank; fill Message
  2. Click Save
  3. Verify error "Shortcut harus diisi dan dimulai dengan '/'."
  4. Enter Shortcut = `hello` (no leading /)
  5. Click Save — verify same error
  6. Enter Shortcut = `/hello` — verify valid
- **Expected Result:** Validation rejects blank and non-slash-prefixed shortcuts
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-004 — Duplicate shortcut → "Shortcut sudah digunakan. Gunakan nama lain."
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM02
- **Pre-condition:** Template with shortcut `/thankyou` already exists
- **Steps:**
  1. Create new template with shortcut `/thankyou`
  2. Click Save
  3. Verify error "Shortcut sudah digunakan. Gunakan nama lain."
  4. Change to `/thankyou2` — verify save succeeds
- **Expected Result:** Duplicate shortcut rejected; unique shortcut accepted
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-005 — Message blank → "Pesan template tidak boleh kosong."
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 400-TM03
- **Pre-condition:** Admin on create/edit template modal
- **Steps:**
  1. Enter valid Shortcut = `/test`
  2. Leave Message blank
  3. Click Save
  4. Verify error "Pesan template tidak boleh kosong."
  5. Enter message text — verify save succeeds
- **Expected Result:** Empty message rejected with validation error
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-006 — Admin edits template → modal pre-fills; shortcut uniqueness validated
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: edit
- **Pre-condition:** Template exists in list
- **Steps:**
  1. Click pencil icon on template row
  2. Verify modal pre-fills current Shortcut and Message
  3. Edit message text
  4. Change shortcut to existing one from another template
  5. Click Save — verify uniqueness error
  6. Revert shortcut — save successfully
  7. Verify list updates immediately
- **Expected Result:** Edit modal pre-fills; uniqueness enforced; list updates after save
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-007 — Admin deletes template → confirmation → removed from list
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: delete
- **Pre-condition:** Template exists in list
- **Steps:**
  1. Click three-dot menu on template row
  2. Select "Delete"
  3. Verify confirmation modal appears (Yes/No)
  4. Click "No" — verify template still in list
  5. Repeat delete flow, click "Yes"
  6. Verify template removed from list
- **Expected Result:** Confirmation required; cancel preserves; confirm removes template
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-008 — Agent types / in chat input → auto-complete list appears
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: insert
- **Pre-condition:** Agent in chat room; templates exist
- **Steps:**
  1. Open a conversation chat room
  2. Click in message textarea `[data-cy="Message-Text-Input"]`
  3. Type `/`
  4. Verify auto-complete list appears with matching templates
  5. Verify list shows shortcut names
  6. Type `/thank` to filter — verify list narrows
- **Expected Result:** Typing `/` triggers auto-complete; templates filtered by typed text
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-009 — Agent selects template → message inserted with variables replaced
- **Type:** Positive | **Priority:** P0 | **Source:** User Story: insert + variables
- **Pre-condition:** Template with `{customer_name}` variable exists; conversation has customer name
- **Steps:**
  1. In chat input, type `/` and select template containing `{customer_name}`
  2. Verify message inserted into textarea
  3. Verify `{customer_name}` replaced with actual customer name
  4. If customer name missing, verify fallback text displayed (e.g. "customer")
  5. Verify agent can edit before sending
- **Expected Result:** Template inserted with variables resolved; fallback for missing data
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-010 — Invalid variable token → "Variabel tidak dikenal: {variable}."
- **Type:** Negative | **Priority:** P1 | **Source:** Error: 400-TM04
- **Pre-condition:** Admin editing template message
- **Steps:**
  1. In template message, insert `{nonexistent_variable}`
  2. Save template
  3. Verify error "Variabel tidak dikenal: {nonexistent_variable}."
  4. Fix variable to known one — verify save succeeds
- **Expected Result:** Unknown variable token rejected with specific error message
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-011 — Agent without permission → "Anda tidak memiliki izin untuk mengubah template ini."
- **Type:** Permission | **Priority:** P0 | **Source:** Error: 403-TM05
- **Pre-condition:** Logged in as Agent (no template edit permission)
- **Steps:**
  1. Navigate to Settings → Template Pesan
  2. Attempt to create new template
  3. Verify permission error "Anda tidak memiliki izin untuk mengubah template ini."
  4. Attempt to edit existing template — verify same error
  5. Attempt to delete — verify same error
- **Expected Result:** Unauthorized agents blocked; Bahasa Indonesia permission error shown
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-012 — Templates assigned to category/folder; category filter available
- **Type:** Positive | **Priority:** P1 | **Source:** User Story: categorize
- **Pre-condition:** Templates with categories assigned
- **Steps:**
  1. Navigate to Settings → Template Pesan
  2. Create template with category "Greetings"
  3. Create another with category "Shipping"
  4. Use category filter dropdown
  5. Select "Greetings" — verify only Greetings templates shown
  6. Select "Shipping" — verify only Shipping templates shown
  7. Select All — verify all shown
- **Expected Result:** Category filter narrows template list; categories display correctly
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-013 — Visibility: Global, Channel-specific, or Team-specific; agents see scoped templates only
- **Type:** Positive | **Priority:** P1 | **Source:** User Story: visibility
- **Pre-condition:** Templates with different visibility scopes
- **Steps:**
  1. Create template with visibility "Global (all teams)"
  2. Create template with visibility "Channel: WhatsApp"
  3. Create template with visibility "Team: Team A"
  4. Login as agent on Team B, WhatsApp channel
  5. Type `/` in chat — verify only Global template visible
  6. Login as agent on Team A, WhatsApp channel
  7. Type `/` — verify Global + Team A + WhatsApp templates visible
- **Expected Result:** Agents see only templates matching their team/channel scope + Global
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-014 — Shortcut ≤30 chars, alphanumeric + underscores, unique within visibility scope
- **Type:** Positive | **Priority:** P0 | **Source:** Field: Shortcut
- **Pre-condition:** Admin on create/edit template modal
- **Steps:**
  1. Enter shortcut with 31 characters — verify validation error
  2. Enter shortcut with special characters (e.g. `/hello world!`) — verify validation error
  3. Enter valid shortcut `/thank_you_123` (30 chars, alphanumeric + _) — verify accepted
  4. Enter same shortcut in same visibility scope — verify uniqueness error
  5. Enter same shortcut in different visibility scope — verify accepted
- **Expected Result:** Length ≤30, alphanumeric + underscore only; unique per scope
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-015 — Server error saving template → "Gagal menyimpan template. Coba lagi nanti."
- **Type:** Negative | **Priority:** P0 | **Source:** Error: 500-TM06
- **Pre-condition:** Backend returning 500 errors
- **Steps:**
  1. Create template with valid data
  2. Click Save
  3. Verify error "Gagal menyimpan template. Coba lagi nanti."
  4. Verify modal remains open with data intact (not lost)
  5. Fix backend; click Save again — verify success
- **Expected Result:** Server error shows Bahasa Indonesia message; form data preserved; retry works
- **Actual Result:** *(QA fills)*

---

### SC-MACRO-016 — Changes propagate across all agent views within 5 seconds (real-time)
- **Type:** Positive | **Priority:** P1 | **Source:** NFR: Real-time
- **Pre-condition:** Two agent sessions open; both viewing chat
- **Steps:**
  1. Admin creates new template `/greeting`
  2. In Agent A session, type `/` within 5 seconds
  3. Verify `/greeting` appears in auto-complete list
  4. Admin deletes template `/greeting`
  5. In Agent B session, type `/` within 5 seconds
  6. Verify `/greeting` no longer appears
- **Expected Result:** Template changes propagate to all agent views within 5 seconds
- **Actual Result:** *(QA fills)*

---

> **Total Scenarios:** 103 (SC-SLA: 24, SC-RLT: 11, SC-ANALYTICS: 18, SC-OPENAPI: 20, SC-PUBLICID: 14, SC-MACRO: 16)
> **SLA Hold/Snooze/SLA 3-way conflict markers:** 4 (SC-SLA-006, SC-SLA-007, SC-SLA-022, SC-SLA-023)
