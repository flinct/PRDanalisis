# Global Memory

> Fungsi: ringkasan global/canonical context produk, dependency utama, summary implementasi penting. Analisa detail lintas-PRD di `Memory/conversation-prd-cross-analysis.md` dan `Memory/conversation-sla-rlt-frt-ttc-analysis.md`.
>
> **Source of Truth:** Conversation V2 (`PRD/Conversationv2/`). V1 (`PRD/Conversation/`) sudah deprecated.
> **Source of Truth:** Ticket V2 (`PRD/ticketv2/`). V1 (`PRD/Ticket/`) sudah deprecated.
> **Source of Truth:** WhatsApp Web V2 (`PRD/Whatsapp web v2/`). V1 (`PRD/Whatsapp web/`) sudah deprecated.

## Canonical Product Rules

### Domain

Customer service live chat platform with WhatsApp integration.

### Contact

- One global contact per customer.
- Phone number unique identifier.

### Room Chat

- Status flow:
  `open` / `closed` (V2 canonical). Legacy V1 wording `unassigned -> ongoing -> resolved` deprecated.
- Reopen toggles `closed` → `open` (V2 behavior).
- Closed room immutable.

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
- Reopen behavior: V2 defines reopen toggles `closed` → `open`. Reopen routing modal for closed legacy threads (Reassign Account Channel v1.4).
- Ticket SLA reopen creates new SLA cycle.
- Ownership decoupled from phone number: `conversation_id` sebagai key (Conversationv2 file 13).

### Open Questions

- Conversation SLA reopen behavior still undefined (ticket SLA already defines it).

### Chat List Rules

- **Sumber:** Conversation V2 (file 8 — Chat List v1.1).
- Status model: `open` / `closed` (bukan V1 `Ongoing`/`Resolved`).
- Navigation filter buttons: Your Inbox, Unassigned, All, Closed, Starred, Spam, Junk (V2 navigation model).
- SLA color thresholds (canonical baseline): Green (>50%), Yellow (≤50% & >10%), Red (≤10% or overdue). Configurable via Settings. Metric (FRT/TTC) determined by SLA Engine Contract.
- Hold: quick action indicator on chat card (who set + timestamp). Separate from Snooze (wake-up timer). If coexist, Hold indicator visible trumps Snooze hide state.
- Sorting (V2 implementation): Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical.
- Search & filter scope: scoped by active RBAC filter (Your Inbox, All, Channel, Team). Results must never exceed current visibility scope.
- "Assign to Me": alternate access path for Agent role (Unassigned tab hidden by RBAC). Options: notification inline, team-scoped Unassigned temporary view, quick action from open chat, queue UI.
- Quick assign ("Assign to Me") dan bulk actions (assign, pin, spam, read, star, junk, close, reopen) per V2 Chat List.

### Conversation Room Rules

- **Sumber:** Conversation V2 (file 9 — Room v1.1).
- Room canonical status: `open` / `closed` (V2). V1 wording `Ongoing` / `Resolved` deprecated.
- `Close` / `Resolve` in Room treated as transition to `closed`. UI-only close action must use different wording.
- Room assignment source `participants` (participants = assignee). Not separate root `assignedTo` field.
- Room search scope current conversation only. Chat List search scope remains active RBAC/filter scope.
- Room actions mutating list state must update Chat List via socket/event: Close, Hold/Resume, Reminder, Pin, Star/Priority, Tag, Spam/Junk, assignment changes.
- Room feature availability follows channel/account-channel capability matrix (presence, rich cards, disappearing messages, screenshot add-on, WA relogin, delivery/read indicators).
- Attachment max 100MB per V2 Room v1.1.
- Hold/Snooze/SLA behavior unresolved: Room v1.1 says Hold pauses SLA, Resume restores SLA. Snooze v1.0 (file 16) says "No SLA pause changes". RLT Adjusted tergantung policy final. **3-way conflict masih open.**

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

- **Sumber:** Conversation V2 (file 10 — Detail v2.1).
- Detail `Assigned` / `Unassigned` assignment state, not conversation status. Status remains `open` / `closed`.
- Detail assignment state derived from `participants`: `participants.length === 0` means unassigned; otherwise assigned.
- Detail team source single mandatory `team` field on conversation.
- Detail SLA metric names: First Response Due (FRT), Time to Close Due (TTC). SLA threshold/color baseline from Chat List rules (50%/10%).
- Detail displays Response Lead Time (RLT) and Wait Time in Queue as tracked metrics (non-SLA, no threshold/breach Phase 1).
- SLA values computed real-time/service-side. Not stored directly in conversation document. RLT & Wait Time persisted in `conversation_sla_metrics` collection.
- Detail reminder user-specific unless PM clarifies shared/team reminder. Room reminder history and Chat List reminder sorting must align.
- Detail mutations affecting list metadata must update Chat List via socket/event: assignee/participants, team, tags, reminder, pinned message, SLA state, status.
- Detail conversation history must define separate behavior for 1:1 vs group. Group room history currently limited/unavailable per V2.
- Attachment max 100MB per V2 Room v1.1.
- Custom Attributes ownership: V2 (file 11) defines `ui_editable` boolean + Collections (repeatable grouped entries). Detail v2.1 separates read-only API attributes from editable custom fields.

### Ticket Rules

- **Sumber:** Ticket V2 (`PRD/ticketv2/`). V1 (`PRD/Ticket/`) deprecated.
- **Core files:**
  - Ticket List: V2 unnumbered base (`PRD Inbox Satuinbox V2.md`)
  - Ticket Detail: V2 file 1
  - Bulk Reply: V2 file 2
  - Ticket Room: V2 file 3
  - Export: V2 file 4
  - Related Tickets & Merge: V2 file 5 (⚠️ **belum developed**)
  - Search Relevance: V2 file 6
  - Create Ticket Consistency: V2 file 7

#### Ticket Status Model

- Status: `open` / `close` (V2 canonical).
- Status independent from SLA lifecycle. SLA runs on non-resolved stages (Submitted, In Progress).
- Snooze is a **state**, not a status change. Snoozed tickets retain original status.

#### Ticket List Rules

- Ticket type tabs: "Semua" + per-type tabs.
- Default columns (12): ID Tiket, Judul, Klien, Kanal, Prioritas, Agen, Durasi, SLA, Status, Tim Inbox, Tag, Balasan terakhir.
- View settings: per-tab column toggle, custom field columns on type-specific tabs.
- KPI strip: Semua tiket, Tiket baru, Butuh respons, Dalam proses, Lewat SLA, Selesai, Snoozed.
- SLA column: live countdown to due; overdue negative; "—" when resolved.
- Bulk actions: update status, add/remove tag, close, bulk reply.
- Sticky columns: checkbox + ID Tiket pinned left; "•••" pinned right.
- Search scope: ID Tiket, Judul, Klien, Deskripsi + custom fields on type tabs.
- Relevance ranking: exact → normalized → prefix → partial → date.
- Out-of-filter guidance: banner when matches exist outside current filter.

#### Ticket Detail Rules

- Two-column layout: left = thread + composer, right = sidebar.
- Sidebar sections (ordered): Assignee → SLA → Attributes → Client Data → Linked Conversation → Activity Log.
- SLA section: FRT and Resolve chips (collapsible, per-stage breakdown).
- Indicator badges: "Butuh balasan" (needs reply) / "Sedang ditangani" (being handled).
- Custom attributes: text, list_option, date, image, gallery, files; `readOnly` per-field.
- Inline edits for: team inbox, assignees, status, priority, tags, custom fields.

#### Ticket Room Rules

- Messaging surface with two composer tabs: "Balas pelanggan" / "Catatan internal".
- Separate draft preservation per tab per ticket per session.
- Mention picker (`@`) in internal notes only; mention-to-assign flow for non-participants.
- Max 20 unique mentions per internal note.
- Origin indicator: "Dari tiket #<Ticket ID>" for room-originated messages.

#### Ticket SLA Rules

- **Sumber:** `PRD/SLA conversation n ticket/PRD Ticket - SLA ticket.md` + V2 files 1, 4, base.
- FRT start: ticket creation (or first agent response).
- TTC start: ticket creation + non-resolved status.
- SLA runs when: Submitted / In Progress.
- SLA pauses on: Waiting on Customer (if toggle enabled).
- SLA stops on: Resolved/Closed.
- Reopen: new SLA cycle (`slaState.cycleId`).
- Stage SLA: cumulative per stage, excluding paused intervals.
- Snapshot at cycle start: settings frozen for active cycle.
- Reminder: 1 per metric (FRT, TTC) + 1 per stage.
- **Key difference from Conversation SLA:** Ticket SLA pauses FRT+TTC+stage on WoC. Conversation SLA pauses TTC only.

#### Ticket View Scope (RBAC)

- **Sumber:** V2 base file (absorbed from V1 `view scope.md`).
- `TicketViewEnum` (8 views): `all_ticket`, `unassigned_ticket`, `assigned_ticket`, `all_ticket_team`, `my_ticket`, `queue_team`, `queue_unassigned`, `created_by_me`.
- Role-based access: Agent (my_ticket, queue_team), Supervisor (all_ticket_team, queue_unassigned), Admin (all_ticket, unassigned, assigned).
- Queue views sorted: SLA breached first → oldest first.
- Manual claim: "Ambil Tiket" with double-claim prevention.
- KPI cards scoped by active view.

### WhatsApp Web Rules

- **Sumber:** WhatsApp Web V2 (`PRD/Whatsapp web v2/`). V1 (`PRD/Whatsapp web/`) deprecated.
- **Core files:**
  - Add Account v2.2: V2 file 2
  - Bulk Scan QR: V2 file 3
  - Account Groups & Reserved Pool: V2 file 4
  - Edit Account: V2 file 5
  - Import Modes: V2 file 6
  - Anti Spam System: 5 files (broadcast humanization, warming, conversation engine, account pools, technical guide)

#### Account Management

- Multi-device per number: 2 slots (Main/Backup × Device 1/2). Auto-switch on failure.
- Multi-library connectors: Baileys (primary), WhatsAppWebJS (backup).
- Connection methods: QR code + Pairing Code. Auto-refresh every 30s.
- Public temporary links: HTTPS, single-use, 10-min TTL for remote scanning.
- Credential persistence: encrypted, auto-restore on reload.

#### Account Groups & Reserved Pool

- Two categories: **Grup Akun** (Account Groups) and **Akun Cadangan** (Reserved Pool).
- Each group has exactly one active ("Digunakan") number; others are standby ("Siaga").
- Quota warning: "Melebihi batas" when `sent_today > recommended_cap`.
- Replace from reserved pool: atomic swap (Tukar) or add-only (Tambah saja).
- Move between groups resets to Siaga; enforces one active per group.

#### Import Modes (BE-side)

- Three modes: **Full Import** (all chats), **Whitelist Only** (selected targets only), **Exclude Conversations** (all except exclusions).
- Post-connect target selection for restricted modes (max 5,000 targets).
- Mode change applies to future inbound only; old conversations not deleted.

#### Anti Spam System (BE-side)

- **Broadcast Humanization:** Auto-split wall-of-text into 1-4 bubbles, self-quote option, inter-bubble gaps (500-2500ms), typing/presence simulation per bubble.
- **Private Bot Farm Warming:** Internal conversations between tenant accounts (never visible in Inbox). Account levels 1-5 with daily caps. Auto-level-up.
- **Warming Conversation Engine:** Small-world topology (3-6 accounts/cluster), content variation (typos, slang, continuity references), randomized operating hours.
- **Account Pools & Rotation:** Three tiers (Akun Umum, Akun Grup, Akun Cadangan). Auto-use Backups toggle, Group Rotation toggle, configurable Outbound Limit.

#### RBAC

- Admin: full access.
- Supervisor: scoped to own Team Inbox.
- Agent: read-only/denied.

#### Implementation Status (FE + BE v2.5.0)

| Feature | FE | BE (whatsapp svc) | Notes |
|---------|----|-------------------|-------|
| Add Account | ✅ | ✅ | BE: `createAccountChannel`, `InitInstance` |
| QR Connect | ✅ | ✅ | BE: `GetQRCode`, `GetInstance`, 30s refresh |
| Account Groups | ✅ | ✅ | BE: `account-channel-group` endpoints |
| Reserved Pool | ✅ | ✅ | BE: grouped account management |
| Rename/Edit | ✅ | ✅ | BE: `renameAccountChannel` |
| Bulk Scan Popup | ⚠️ Partial | ⚠️ Partial | Single QR connect ada, bulk queue popup not in FE/BE |
| Import Modes | ❌ Not in FE | ❌ **Not in BE** | No import-mode code found in BE (`src/whatsapp/`) |
| Anti Spam Broadcast Humanization | ❌ | ❌ **Not in BE** | No bubble-split/self-quote in broadcast or whatsapp svc |
| Anti Spam Warming System | ❌ | ❌ **Not in BE** | No warming engine, topology, or transcript generation |
| Anti Spam Account Pools Rotation | ❌ | ❌ **Not in BE** | No auto-rotation or eligibility logic found |

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

### Three-PRD Logical Intersection (V2)

- Omnichannel Inbox v1.1 (V2 file 4), Omnichannel Navigation v1.2 (V2 file 5), Team Inbox Navigation v2.1 (V2 file 6) bersama mendefinisikan baseline filtering chat list.
- Tiga section utama mempengaruhi chat list: Inbox, Channel, Team.

### Current Implemented Filtering Rules

- Default landing saat masuk conversation: `Your Inbox`.
- `Your Inbox` current-user assignment scope.
- `Unassigned` and `All` restricted by role. May scope by team.
- `Spam` and `Starred` user-specific scopes.
- `Junk` company-wide scope.
- `Channel` and `Team` act as additional filters on accessible conversations.
- Open/Closed status (V2 canonical).
- Filter buttons (not tabs) UI pattern — each button endpoint for filtering by scope.

### V2 vs Implementation Delta

- Sorting (V2): Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical. Implementasi match.
- SLA color threshold: V2 pakai percentage (50%/10%), FE masih absolute time — **mismatch**.
- Group chat FRT disembunyikan FE: V2 expects FRT visible for all channels.

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
- WhatsApp Web bergantung pada Baileys library (`@whiskeysockets/baileys`), session management, QR/Pairing connection, credential persistence (encrypted).
- Broadcast bergantung pada WhatsApp Web account connection, humanization, outbound limit management.

### Open Risks

- Cross-division visibility leakage.
- Duplicate contact merge race condition.
- Queue synchronization inconsistency.
- Chat list = hasil irisan filter Inbox x Channel x Team x RBAC.
- Role login menentukan visibility sejak awal, bukan hanya hasil filter.
- **Hold vs Snooze vs SLA pause — 3-way conflict unresolved:** V2 Room v1.1 (file 9) bilang Hold pause SLA. V2 Snooze v1.0 (file 16) bilang "No SLA pause changes". RLT Adjusted tergantung policy final.
- **Reopen behavior — 3 definisi berbeda:** V2 Chat Sessions (file 12)=new session, V2 Room (file 9)=reopen, V2 Reassign (file 13)=modal. Dampak ke FRT/TTC/RLT/Wait Time belum ditentukan.
- **SLA color threshold mismatch:** FE implementasi pakai absolute time (10m/1hari). V2 Chat List (file 8) pakai percentage sisa budget (>50% / ≤50%&>10% / ≤10%). Perlu sinkronisasi.
- **Group chat FRT disembunyikan di FE:** V2 Omnichannel (file 4) bilang group chat tidak bisa resolve → TTC infinite. FRT disembunyikan untuk semua group chat di FE. FRT seharusnya tetap jalan.
- **RLT dan Wait Time Phase 1:** Hanya visible/reporting. Tidak trigger alert/breach/threshold. Pastikan tidak masuk SLA engine breach detection.
- **FRT formula final belum di-lock:** `frtCountingStartAt` — inbound atau assignment? Data model punya `firstAgentAssignmentAt` terpisah, mengindikasikan FRT start dari inbound. Perlu konfirmasi PM.
- **SLA mode belum final:** Agent-Centric (pause/resume TTC) vs Customer-Centric (continuous TTC). Dampak ke seluruh metric belum ditentukan.
- **Linked ticket metric inheritance:** RLT & Wait Time inherit ke ticket detail. V2 Multiple Ticket (file 18) dan V2 Relational (file 19) tidak definisikan attribution rule untuk multiple conversation → multiple tickets.
- **8 fitur Conversation V2 belum diimplementasi di FE:** Collaborator role, Snooze Conversation, Related Conversations, Multi-ticket draft from single bubble, WA Group Mention, Room Reminder, Hold/Resume di header, Collections (repeatable custom attributes). **BE juga belum** untuk fitur-fitur ini.
- **1 fitur Ticket V2 belum diimplementasi:** Related Tickets & Merge (V2 file 5). **BE juga belum** — tidak ditemukan di `ticket-service/`.
- **6 fitur WhatsApp Web V2 belum diimplementasi:** Import Modes (V2 file 6), Broadcast Humanization (Anti Spam file 1), Warming System (Anti Spam file 2-3), Account Pools Rotation (Anti Spam file 4), Bulk Scan Popup (V2 file 3). **BE juga belum** — tidak ditemukan di `whatsapp/` atau `broadcast-service/`.

### QA Interpretation

- Chat list = hasil irisan filter Inbox x Channel x Team x RBAC.
- Role login menentukan visibility sejak awal, bukan hanya hasil filter.


### File Positioning

- Summary global untuk domain conversation omnichannel, ticket, dan WhatsApp Web.
- Detail loophole, conflict, priority impact, QA analysis level-PRD tidak di file ini.
- **Metodologi analisa QA** (feature dev, bug fix, interconnection, impact, risk) ada di `Rules/qa-analysis-rule.md` — bukan di global memory. Wajib dibaca bersamaan dengan workflow-rule.md sebelum melakukan analisa mendalam.

### Referenced Rules

- `Rules/qa-analysis-rule.md` — framework analisa QA senior: 3 tipe analisa, 9 impact dimensions, risk matrix, output structure, bug fix methodology, interconnection analysis.
- `Rules/impact-analysis-rule.md` — blast radius detection for any change.
- ~~`Rules/analisa-prd-rule.md`~~ — **DEPRECATED.** Merged into `qa-analysis-rule.md`.
- `Rules/workflow-rule.md` — execution order: rule → global memory → feature memory → task.
- **Source of truth:** Conversation V2 (`PRD/Conversationv2/`). V1 (`PRD/Conversation/`) deprecated.
- **Source of truth:** Ticket V2 (`PRD/ticketv2/`). V1 (`PRD/Ticket/`) deprecated.
- **Source of truth:** WhatsApp Web V2 (`PRD/Whatsapp web v2/`). V1 (`PRD/Whatsapp web/`) deprecated.
- V1 vs V2 comparisons: `Memory/conversation-v1-vs-v2-comparison.md`, `Memory/ticket-v1-vs-v2-comparison.md`, `Memory/whatsapp-web-v1-vs-v2-comparison.md`.
- BE architecture & implementation: `Memory/be-repo-memory.md`.
