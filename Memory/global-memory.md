# Global Memory

> Fungsi: ringkasan global/canonical context produk, dependency utama, summary implementasi penting. Analisa detail lintas-PRD di `Memory/conversation-prd-cross-analysis.md` dan `Memory/conversation-sla-rlt-frt-ttc-analysis.md`.

## Canonical Product Rules

### Domain

Customer service live chat platform with WhatsApp integration.

### Contact

- One global contact per customer.
- Phone number unique identifier.

### Room Chat

- Status flow:
  unassigned -> ongoing -> solved
- Reopen creates new ongoing room.
- Solved room immutable.

### RBAC Rules

- Sales only sees Sales Area Context.
- Operational only sees Operational Area Context.
- Super Admin bypasses restrictions.

### Regression Sensitive

- Assignment flow
- Reopen flow
- Broadcast filtering
- Multi-handler synchronization

### Resolved Decisions

- Duplicate detection uses normalized phone number.
- Reopen creates new room instead of reopening old room.
- Ticket SLA reopen creates new SLA cycle.

### Open Questions

- Conversation SLA reopen behavior still undefined (ticket SLA already defines it).

### Chat List Rules

- SLA color thresholds (canonical baseline): Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue). Configurable via Settings. Metric (FRT/TTC) determined by SLA Engine Contract.
- Hold: quick action indicator on chat card (who set + timestamp). Separate from Snooze (wake-up timer). If coexist, Hold indicator visible trumps Snooze hide state.
- Sorting (PRD baseline): Most Recent, Longest Waiting, Mentions, Reminder.
- Sorting (current implementation): Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical.
- Chat List PRD uses Unassigned/Ongoing/Resolved tab model. Current implementation uses button-based filter endpoints with Open/Closed. PRD outdated relative to implementation.
- Search & filter scope: scoped by active RBAC filter (Your Inbox, All, Channel, Team). Results must never exceed current visibility scope.
- "Assign to Me": alternate access path for Agent role (Unassigned tab hidden by RBAC). Options: notification inline, team-scoped Unassigned temporary view, quick action from open chat, queue UI.

### Conversation Room Rules

- Room canonical status must follow implementation: `open` / `closed`. PRD wording `Ongoing` / `Resolved` legacy unless PM clarifies otherwise.
- `Close` / `Resolve` in Room treated as transition to `closed`. UI-only close action must use different wording.
- Room assignment source `participants` (participants = assignee). Not separate root `assignedTo` field.
- Room search scope current conversation only. Chat List search scope remains active RBAC/filter scope.
- Room actions mutating list state must update Chat List via socket/event: Close, Hold/Resume, Reminder, Pin, Star/Priority, Tag, Spam/Junk, assignment changes.
- Room feature availability follows channel/account-channel capability matrix (presence, rich cards, disappearing messages, screenshot add-on, WA relogin, delivery/read indicators).
- Attachment max size unresolved: Room PRD conflicting limits (`100MB` requirements vs `15MB` limitations).
- Hold/Snooze/SLA behavior unresolved: Room PRD says Hold pauses SLA, Resume restores SLA. Prior Snooze rules do not pause SLA.

### Conversation SLA — Canonical Metric Definitions

#### Event Timestamps

| Event | Field | Keterangan |
|---|---|---|
| T1 — First Customer Inbound | `firstCustomerMessageAt` | First customer message inbound |
| T2 — First Agent Assignment | `firstAgentAssignmentAt` | First time conversation assigned to agent |
| T3 — First Agent Reply | `firstAgentReplyAt` | First customer-facing agent reply |
| T4 — Conversation Close | `conversationClosedAt` | Conversation resolved/closed |

#### Metric Formulas

```
Wait Time = working_duration(T1, T2)     → wall-clock (no office hours)
RLT       = working_duration(T2, T3)     → office-hours-aware
FRT       = working_duration(T1, T3)     → wall-clock (no office hours)
TTC       = working_duration(T1, T4)     → office-hours-aware (depending on SLA mode)
```

**Constraint:** `FRT = Wait Time + RLT` — harus selalu terpenuhi.

#### Business Hours Behavior per Metric

| Metric | Office Hours | Pause Behavior |
|---|---|---|
| FRT | Wall-clock (no pause) | Hanya AUX pause jika policy enabled. Waiting on Customer tidak pause FRT. |
| TTC | Office-hours-aware | Waiting on Customer pause TTC. AUX pause jika policy enabled. |
| RLT | Office-hours-aware | AUX/Snooze/Hold pause tergantung policy final (belum di-lock). |
| Wait Time | Wall-clock (no pause) | Tidak pernah pause. |

#### SLA Mode — Agent-Centric vs Customer-Centric

- **Agent-Centric (pause/resume):** TTC pause setelah agent reply, resume saat customer reply berikutnya. TTC = akumulasi waktu tunggu customer.
- **Customer-Centric (continuous):** TTC continuous running T1 hingga T4 tanpa pause.

Mode belum final — perlu keputusan PM/Engineering.

### Conversation Detail Rules

- Detail `Assigned` / `Unassigned` assignment state, not conversation status. Status remains `open` / `closed`.
- Detail assignment state derived from `participants`: `participants.length === 0` means unassigned; otherwise assigned.
- Detail team source single mandatory `team` field on conversation.
- Detail SLA metric names: First Response Due (FRT), Time to Close Due (TTC). SLA threshold/color baseline from Chat List rules (50%/10%).
- Detail displays Response Lead Time (RLT) and Wait Time in Queue as tracked metrics (non-SLA, no threshold/breach Phase 1).
- SLA values computed real-time/service-side. Not stored directly in conversation document. RLT & Wait Time persisted in `conversation_sla_metrics` collection.
- Detail reminder user-specific unless PM clarifies shared/team reminder. Room reminder history and Chat List reminder sorting must align.
- Detail mutations affecting list metadata must update Chat List via socket/event: assignee/participants, team, tags, reminder, pinned message, SLA state, status.
- Detail conversation history must define separate behavior for 1:1 vs group. Group room history currently limited/unavailable per PRD.
- Attachment max size unresolved across PRDs: Room says `100MB` and `15MB`, Detail says `25MB`.
- Custom Attributes ownership unresolved: Detail separates read-only API attributes from editable custom fields (P2). Other PRDs imply editable/custom matching.

## Current Implemented Conversation Rules

### Developed Status

- Conversation domain mixed state: developed and undeveloped features.
- Per-feature development status maintained in feature/detail memory, not global memory.

### Confirmed Data Model (from production document + FE v2.5.0)

- `status`: `"open"` / `"closed"` — not Ongoing/Resolved as per PRD.
- `participants` = assignee. Currently `[]` (Assignee & Collaborator undeveloped).
- SLA: calculated real-time. NOT stored in conversation document. Stored in separate `conversation_sla_metrics` collection.
- `sessionDetails: []` — schema ready for session tracking (undeveloped).
- `expiresAt: null` — retention field exists but not yet active.
- `lastReEngagementAt` — re-engagement tracking exists (relevant for reopen logic).
- Topic classification: stored in `accountChannel[].widgetProperties.widgetTopics`. Confirmed working for Widget channel.
- Filter fields confirmed exist: `isJunked`, `spams[]`, `favorites[]`, `tags[]`, `isPinned`, `team`.

#### Confirmed SLA Metrics Fields (ConversationSLAMetrics — v2.5.0)

| Field | Type | Keterangan |
|---|---|---|
| `firstCustomerMessageAt` | string | T1 — first customer inbound |
| `frtCountingStartAt` | string | FRT start (seharusnya = firstCustomerMessageAt) |
| `firstAgentAssignmentAt` | string \| null | T2 — first agent assignment **(baru v2.5.0)** |
| `firstAgentReplyAt` | string \| null | T3 — first agent reply |
| `conversationClosedAt` | string \| null | T4 — close time |
| `frtMs` | number \| null | FRT duration |
| `ttcMs` | number \| null | TTC duration |
| `waitTimeInQueueMs` | number \| null | Wait Time duration **(baru v2.5.0)** |
| `rltMs` | number \| null | RLT duration **(baru v2.5.0)** |
| `firstAssigneeId` | string \| null | First assignee user ID **(baru v2.5.0)** |
| `firstResponderId` | string \| null | First responder user ID **(baru v2.5.0)** |
| `officeHoursSnapshot` | object \| null | Shift config at SLA calculation time |
| `isFrtPaused` / `isTtcPaused` | boolean | Pause state per metric |
| `pausedIntervals` | array | Pause history with reason |
| `totalPausedMs` / `totalFrtPausedMs` / `totalTtcPausedMs` | number | Accumulated pause time |

## Omnichannel Filtering Baseline

### Three-PRD Logical Intersection

- Omnichannel Inbox, Omnichannel Navigation, Team Inbox Navigation bersama mendefinisikan baseline filtering chat list.
- Tiga section utama mempengaruhi chat list: Inbox, Channel, Team.

### Current Implemented Filtering Rules

- Default landing saat masuk conversation: `Your Inbox`.
- `Your Inbox` current-user assignment scope.
- `Unassigned` and `All` restricted by role. May scope by team.
- `Spam` and `Starred` user-specific scopes.
- `Junk` company-wide scope.
- `Channel` and `Team` act as additional filters on accessible conversations.
- Open/Closed status used instead of Ongoing/Resolved from Chat List PRD.
- Filter buttons (not tabs) UI pattern — each button endpoint for filtering by scope.

### PRD vs Implementation Delta

- Chat List PRD defines Unassigned/Ongoing/Resolved tabs. Implementation uses button-based endpoints with Open/Closed.
- Sorting (PRD): Most Recent, Longest Waiting, Mentions, Reminder. (impl): Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical.
- Chat List PRD refers to "tabs". Implementation uses filter buttons.

## Critical Dependencies & Open Risks

### Dependencies

- Broadcast depends on Contact visibility.
- KPI depends on room ownership.
- Queue depends on division assignment.
- Round Robin critical dependency — belum punya PRD sendiri.
- Chat list bergantung pada RBAC, team membership, active channel configuration, socket/event-driven updates.
- Conversation room bergantung pada socket/event-driven updates, channel capability matrix, Ticket System, attachment storage, audit logging.
- Conversation detail bergantung pada SLA configuration, reminder scheduler, tag sync service, audit log service, Open API attribute providers, Broadcast system, related conversation/relational logic.
- Response Metrics (RLT, Wait Time) bergantung event tracking: `firstCustomerMessageAt`, `firstAgentAssignmentAt`, `firstAgentReplyAt`. Event harus akurat dan segera dicatat system.

### Open Risks

- Cross-division visibility leakage.
- Duplicate contact merge race condition.
- Queue synchronization inconsistency.
- Chat list = hasil irisan filter Inbox x Channel x Team x RBAC.
- Role login menentukan visibility sejak awal, bukan hanya hasil filter.
- Room PRD masih pakai wording legacy `Unassigned/Ongoing/Resolved`. Implementation truth `open/closed`.
- Room Close/Resolve, attachment limit, Hold/Snooze/SLA relation, RBAC action matrix butuh klarifikasi PM/Engineering sebelum QA coverage tuntas.
- Detail PRD pakai `Assigned/Unassigned` — interpretasi assignment state dari `participants`, bukan status.
- Detail unresolved conflicts: FRT/TTC SLA source, reminder visibility, 3-value attachment limit, related conversations vs relational, broadcast history visibility, custom attributes ownership.
- **Hold vs Snooze vs SLA pause — 3-way conflict unresolved:** Room PRD bilang Hold pause SLA. Snooze PRD bilang "No SLA pause changes". RLT Adjusted tergantung policy final.
- **Reopen behavior — 3 definisi berbeda:** Session=new session, Room=reopen, Reassign=modal. Dampak ke FRT/TTC/RLT/Wait Time belum ditentukan.
- **SLA color threshold mismatch:** FE implementasi pakai absolute time (10m/1hari). PRD Chat List US-14 pakai percentage sisa budget (>50% / ≤50%&>10% / ≤10%). Perlu sinkronisasi.
- **Group chat FRT disembunyikan di FE:** WA Web Group TTC disabled (correct). Tapi FRT disembunyikan untuk semua group chat. FRT seharusnya tetap jalan.
- **RLT dan Wait Time Phase 1:** Hanya visible/reporting. Tidak trigger alert/breach/threshold. Pastikan tidak masuk SLA engine breach detection.
- **FRT formula final belum di-lock:** `frtCountingStartAt` — inbound atau assignment? Data model punya `firstAgentAssignmentAt` terpisah, mengindikasikan FRT start dari inbound. Perlu konfirmasi PM.
- **SLA mode belum final:** Agent-Centric (pause/resume TTC) vs Customer-Centric (continuous TTC). Dampak ke seluruh metric belum ditentukan.
- **Linked ticket metric inheritance:** RLT & Wait Time inherit ke ticket detail. Multiple Ticket PRD dan Relational PRD tidak definisikan attribution rule untuk multiple conversation → multiple tickets.

### QA Interpretation

- Chat list = hasil irisan filter Inbox x Channel x Team x RBAC.
- Role login menentukan visibility sejak awal, bukan hanya hasil filter.


### File Positioning

- Summary global untuk domain conversation omnichannel.
- Detail loophole, conflict, priority impact, QA analysis level-PRD tidak di file ini.
