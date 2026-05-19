# Global Memory

> Fungsi file ini: ringkasan global/canonical context produk, dependency utama, dan summary implementasi penting. Analisa detail lintas-PRD disimpan terpisah di `Memory/conversation-prd-cross-analysis.md`.

## Canonical Product Rules

### Domain

Customer service live chat platform with WhatsApp integration.

### Contact

- One global contact per customer.
- Phone number is unique identifier.

### Room Chat

- Status flow:
  unassigned -> ongoing -> solved
- Reopen creates new ongoing room.
- Solved room is immutable.

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
- Ticket SLA reopen creates a new SLA cycle.

### Open Questions

- Conversation SLA reopen behavior still undefined (ticket SLA already defines it).

### Chat List Rules

- SLA color thresholds (canonical baseline): Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue). Configurable via Settings. Metric (FRT/TTC) determined by SLA Engine Contract.
- Hold: quick action indicator on chat card (who set + timestamp). Separate from Snooze (wake-up timer). If coexist, Hold indicator visible in chat list trumps Snooze hide state.
- Sorting (PRD baseline): Most Recent, Longest Waiting, Mentions, Reminder.
- Sorting (current implementation): Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical.
- Chat List PRD uses Unassigned/Ongoing/Resolved tab model. Current implementation uses button-based filter endpoints with Open/Closed status. PRD is outdated relative to implementation.
- Search & filter scope: must be scoped by active RBAC filter (Your Inbox, All, Channel, Team). Results must never exceed current visibility scope.
- "Assign to Me": must have alternate access path for Agent role (Unassigned tab hidden by RBAC). Options: notification inline, team-scoped Unassigned temporary view, quick action from open chat, queue UI.

### Conversation Room Rules

- Room canonical status must follow implementation: `open` / `closed`. PRD wording `Ongoing` / `Resolved` is legacy unless PM clarifies otherwise.
- `Close` / `Resolve` in Room must be treated as transition to `closed`; any UI-only close action must use different wording.
- Room assignment source is `participants` (participants = assignee), not a separate root `assignedTo` field.
- Room search scope is current conversation only. Chat List search scope remains active RBAC/filter scope.
- Room actions that mutate list state must update Chat List via socket/event: Close, Hold/Resume, Reminder, Pin, Star/Priority, Tag, Spam/Junk, assignment changes.
- Room feature availability must follow channel/account-channel capability matrix (presence, rich cards, disappearing messages, screenshot add-on, WA relogin, delivery/read indicators).
- Attachment max size is unresolved: Room PRD has conflicting limits (`100MB` in requirements vs `15MB` in limitations).
- Hold/Snooze/SLA behavior is unresolved: Room PRD says Hold pauses SLA and Resume restores SLA, while prior Snooze rules do not pause SLA.

### Conversation Detail Rules

- Detail `Assigned` / `Unassigned` is assignment state, not conversation status. Conversation status remains `open` / `closed`.
- Detail assignment state must be derived from `participants`: `participants.length === 0` means unassigned; otherwise assigned.
- Detail team source is the single mandatory `team` field on conversation.
- Detail SLA metric names are First Response Due (FRT) and Time to Close Due (TTC). SLA threshold/color baseline still comes from Chat List rules (50%/10%).
- SLA values are computed real-time/service-side, not stored directly in the conversation document.
- Detail reminder is user-specific unless PM clarifies shared/team reminder behavior; Room reminder history and Chat List reminder sorting must align with this rule.
- Detail mutations that affect list metadata must update Chat List via socket/event: assignee/participants, team, tags, reminder, pinned message, SLA state, status.
- Detail conversation history must define separate behavior for 1:1 vs group conversations; group room history is currently limited/unavailable per PRD.
- Attachment max size is unresolved across PRDs: Room says `100MB` and `15MB`, Detail says `25MB`.
- Custom Attributes ownership is unresolved: Detail separates read-only API attributes from editable custom fields (P2), while other PRDs imply editable/custom matching behavior.

## Current Implemented Conversation Rules

### Developed Status

- Conversation domain currently has a mixed state of developed and undeveloped features.
- Detailed per-feature development status is maintained in feature/detail memory, not in global memory.

### Confirmed Data Model (from production document)

- `status`: `"open"` / `"closed"` — not Ongoing/Resolved as per PRD.
- `participants` = assignee. Currently `[]` (Assignee & Collaborator undeveloped).
- SLA: calculated real-time, NOT stored in document.
- `sessionDetails: []` — schema ready for session tracking (undeveloped).
- `expiresAt: null` — retention field exists but not yet active.
- `lastReEngagementAt` — re-engagement tracking exists (relevant for reopen logic).
- Topic classification: stored in `accountChannel[].widgetProperties.widgetTopics`, confirmed working for Widget channel.
- Filter fields confirmed exist: `isJunked`, `spams[]`, `favorites[]`, `tags[]`, `isPinned`, `team`.

## Omnichannel Filtering Baseline

### Three-PRD Logical Intersection

- Omnichannel Inbox, Omnichannel Navigation, dan Team Inbox Navigation bersama-sama mendefinisikan baseline filtering untuk chat list.
- Tiga section utama yang mempengaruhi chat list adalah Inbox, Channel, dan Team.

### Current Implemented Filtering Rules

- Default landing saat masuk conversation adalah `Your Inbox`.
- `Your Inbox` is current-user assignment scope.
- `Unassigned` and `All` are restricted by role and may be scoped by team.
- `Spam` and `Starred` are user-specific scopes.
- `Junk` is company-wide scope.
- `Channel` and `Team` act as additional filters on accessible conversations.
- Open/Closed status is used instead of Ongoing/Resolved from Chat List PRD.
- Filter buttons (not tabs) are the UI pattern — each button is an endpoint for filtering by scope.

### PRD vs Implementation Delta

- Chat List PRD defines Unassigned/Ongoing/Resolved tabs; implementation uses button-based endpoints with Open/Closed.
- Sorting (PRD): Most Recent, Longest Waiting, Mentions, Reminder; (impl): Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical.
- Chat List PRD refers to "tabs"; implementation uses filter buttons.

## Critical Dependencies & Open Risks

### Dependencies

- Broadcast depends on Contact visibility.
- KPI depends on room ownership.
- Queue depends on division assignment.
- Round Robin masih critical dependency yang belum punya PRD sendiri.
- Chat list sangat bergantung pada RBAC, team membership, active channel configuration, dan socket/event-driven updates.
- Conversation room sangat bergantung pada socket/event-driven updates, channel capability matrix, Ticket System, attachment storage, and audit logging.
- Conversation detail sangat bergantung pada SLA configuration, reminder scheduler, tag sync service, audit log service, Open API attribute providers, Broadcast system, and related conversation/relational logic.

### Open Risks

- Cross-division visibility leakage.
- Duplicate contact merge race condition.
- Queue synchronization inconsistency.
- Chat list harus diperlakukan sebagai hasil irisan filter Inbox x Channel x Team x RBAC.
- Role login menentukan visibility sejak awal, bukan hanya hasil filter.
- Room PRD masih memakai wording legacy `Unassigned/Ongoing/Resolved`; implementation truth is `open/closed`.
- Room Close/Resolve behavior, attachment size limit, Hold/Snooze/SLA relation, and RBAC action matrix require PM/Engineering clarification before complete QA coverage.
- Detail PRD uses `Assigned/Unassigned` wording that must be interpreted as assignment state from `participants`, not status.
- Detail introduces unresolved conflicts around FRT/TTC SLA source, reminder visibility, 3-value attachment limit, related conversations vs relational conversation, broadcast history visibility, and custom attributes ownership.

### QA Interpretation

- Chat list harus diperlakukan sebagai hasil irisan filter Inbox x Channel x Team x RBAC.
- Role login menentukan visibility sejak awal, bukan hanya hasil filter.


### File Positioning

- Bagian di atas adalah summary global untuk domain conversation omnichannel.
- Detail loophole, conflict, priority impact, dan QA analysis level-PRD tidak disimpan di file ini.
