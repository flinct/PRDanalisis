# Conversation V2 - Undeveloped Features Analysis

> **Source of Truth:** Conversation V2 (`PRD/Conversationv2/`). V1 (`PRD/Conversation/`) deprecated.
> V2 memiliki ~20 fitur. Beberapa sudah develop di FE, beberapa masih undeveloped.
>
> **Cross-reference:** Untuk daftar lengkap undeveloped features semua domain (Conversation + Ticket + WhatsApp Web) dengan BE validation, lihat `Memory/comprehensive-undeveloped-features-analysis.md`.

## Scope

Fitur conversation V2 yang belum atau baru sebagian di-develop berdasarkan status FE v2.5.0:

### Belum Developed
1. **Auto-reply Templates** (V2 file 1) — ❌ Undeveloped
2. **Assignee & Collaborators — Collaborator role** (V2 file 2) — ⚠️ Partial (hanya multi-assignee, collaborator belum)
3. **WhatsApp Group Mention** (V2 file 15) — ❌ Undeveloped
4. **Snooze Conversation** (V2 file 16) — ❌ Undeveloped
5. **Relational/Related Conversations** (V2 file 19) — ❌ Undeveloped

### Udah Developed (tidak masuk scope undeveloped)
6. **Reassign Account Channel** (V2 file 13) — ✅ **DEVELOPED**
7. **Multiple Ticket from Single Bubble** (V2 file 18) — ✅ **DEVELOPED**
8. **Team Member Presence** (V2 file 17) — ✅ **DEVELOPED**
9. **RLT/Wait Time Response Metrics** (V2 file 3) — ✅ **DEVELOPED**

### Additional V2 Features Not Yet Developed
10. **Collections (repeatable custom attributes)** (V2 file 11) — ❌ Undeveloped
11. **Room Reminder** (V2 file 9) — ❌ Undeveloped
12. **Hold/Resume di Room Header** (V2 file 9) — ❌ Undeveloped

Catatan dependency penting:

- Conversation sangat bergantung ke Ticket, Auth/RBAC, Account Channel, People (member dan Team Inbox), SLA Conversation, chat distribution via socket, dan auto pull/round robin.
- Round robin belum punya PRD sendiri, sehingga setiap fitur yang menyentuh assignment/availability/routing punya risiko requirement gap tambahan.

## Impact Ranking (Highest to Lowest)

1. **Auto-reply Templates** (V2 file 1) — Availability & SLA exclusion belum bisa diuji
2. **Assignee & Collaborators** (V2 file 2) — Partial: collaborator role belum ada
3. **Relational Conversation** (V2 file 19) — Grouping integrity & SLA aggregate
4. **Snooze Conversation** (V2 file 16) — Precedence rule & SLA pause policy
5. **WhatsApp Group Mention** (V2 file 15) — Hanya untuk WA Web
6. **Collections** (V2 file 11) — Repeatable grouped custom attributes
7. **Room Reminder / Hold/Resume** (V2 file 9) — Room header features

### Why This Ranking

1. **Auto-reply Templates** (V2 file 1) — Menyentuh inbound processing, availability evaluation, ticket context resolution, SLA exclusion, timeline, dan channel capability. Risiko bot salah kirim ke customer tinggi.
2. **Assignee & Collaborators** (V2 file 2) — Mengubah permission model. Risiko privilege leak (collaborator bisa reply) paling besar.
3. **Relational Conversation** (V2 file 19) — Menyentuh chat list, room, detail, custom attributes, unread aggregation, sorting, dan ticket context overlap.
4. **Snooze Conversation** (V2 file 16) — Menyentuh list visibility, reminder precedence, SLA, notification, assignee transfer, dan inbound wake-up via socket.
5. **WhatsApp Group Mention** (V2 file 15) — Berdampak sempit ke WA group composer/rendering.
6. **Collections** (V2 file 11) — Repeatable grouped custom attributes, dampak ke relational matching.
7. **Room Reminder / Hold/Resume** (V2 file 9) — Room header features yang sudah didefinisikan di V2 tapi belum di FE.

## Feature-by-Feature Analysis

### 1. ~~Reassign Account Channel~~ ✅ DEVELOPED (V2 file 13)

> Fitur ini **sudah developed** di FE v2.5.0 berdasarkan V2 Ownership Decoupling v1.4.
> Analisis di bawah dipertahankan untuk referensi QA regression test.

#### Main Impact Areas

- Conversation ownership model (`conversation_id`, `team_owner_id`, `sender_of_record`)
- Account Channel mapping and inbound routing
- Team Inbox visibility and move policy
- Assignee reset and future collaborator validity
- SLA stop/resume behavior
- Conversation room header, list, audit panel, reopen modal
- Socket/inbound event race conditions
- Default Team fallback and escalation-only inbox behavior

#### Why QA Must Treat This as High Risk

- Ini fitur yang paling mudah memecahkan fungsi lama karena mengubah asumsi dasar bahwa nomor/channel menentukan ownership.
- Fitur developed yang paling rawan terdampak: omnichannel inbox, conversation room, chat sessions, team inbox navigation, agent pull, chat list, conversation detail.
- Konflik langsung dengan V2 Sessions (file 12) dan V2 Room (file 9) pada reopen/new session.
- Konflik langsung dengan V2 Assignee/Collaborators (file 2) pada move policy.

#### Expected Impact to Existing Developed Features

- Chat list dapat menampilkan conversation di team yang salah bila source list belum membaca `team_owner_id` baru.
- Room header bisa tidak sinkron antara legacy badge, sender picker, assignee, dan move banner.
- Agent pull dan round robin bisa mencoba mendistribusikan conversation yang seharusnya sticky ke old team.
- Session handling bisa membuat session baru padahal V2 ini ingin reopen modal.
- Create ticket from conversation dapat tetap menunjuk team lama/assignee lama jika move tidak mensinkronkan context.

#### QA Watchouts

- Bedakan 3 state: open legacy-bound, closed legacy-bound, new inbound after remap.
- Pastikan move atomic: history preserved, assignee reset, SLA stop, audit write.
- Pastikan behavior saat target team tidak punya inbound number tetap operable untuk reply.
- Pastikan fallback ke Default Team tidak membuat duplicate conversation.

#### Test Plan

1. Functional
- Verify open conversation remains in old team after channel/number remap.
- Verify new inbound without open match creates new conversation in current mapped team.
- Verify closed legacy-bound conversation triggers reopen modal, not silent reopen.
- Verify choosing `Keep in old team` reopens same conversation and audits the decision.
- Verify choosing `Move to new team` preserves full history, resets assignee, stops SLA, and audits the move.
- Verify escalation-only inbox can receive moved conversation and still send using permitted sender picker.

2. Regression
- Verify moved conversation disappears from source list and appears in target list immediately.
- Verify conversation detail, chat list, and room all show the same owner team state.
- Verify create ticket from moved conversation still links to the same conversation/message correctly.
- Verify agent pull cannot pull a legacy-bound conversation that remains owned by another team.

3. Concurrency
- Verify double move request is idempotent.
- Verify reopen choice race between two agents resolves to one final state with user feedback.
- Verify inbound burst during mapping flip appends to correct open thread only once.

4. Security and RBAC
- Verify only allowed roles can move conversation.
- Verify actor without target team visibility can still move if override is intended, but cannot browse unrelated data beyond action scope.
- Verify cross-tenant or invalid target team is hard blocked.

5. Data and Audit
- Verify audit logs exist for remap routing decision, move, reopen choice, sender change.
- Verify SLA state becomes `stopped` within expected time after move.
- Verify no unintended auto-move happens after bulk remap.

### 2. Auto-reply Templates (V2 file 1 — ❌ UNDEVELOPED)

#### Main Impact Areas

- Inbound message processing pipeline
- Office hours configuration and tenant timezone
- Agent availability calculation
- Ticket context resolution
- Conversation timeline and ticket timeline
- SLA/FRT/ART exclusion logic
- Channel outbound capability checks
- Delay scheduler, cancel-on-agent-reply logic, idempotency
- Socket and round robin assumptions for `no agent available`

#### Why QA Must Treat This as High Risk

- Fitur ini masuk ke jalur inbound utama, sehingga bug kecil bisa mengirim pesan bot yang salah ke customer.
- Mengandalkan definisi availability yang belum sinkron dengan V2 Team Member Presence (file 17) dan round robin yang belum punya PRD.
- Menyentuh Ticket dan Conversation sekaligus sesuai V2 Auto-Reply (file 1): dua template terpisah.

#### Expected Impact to Existing Developed Features

- Conversation room akan menampilkan bot message baru yang harus tidak dihitung sebagai human reply.
- Ticket timeline dan conversation timeline dapat double-log atau missing-log.
- Chat sessions dan create ticket from conversation bisa salah menentukan active ticket context.
- SLA conversation berisiko polluted jika bot reply ikut dianggap first response.

#### QA Watchouts

- Pisahkan trigger reason dari template context sesuai V2: `outside office hours` vs `ticket`.
- `No agent available` harus memakai rule distribusi yang sama dengan auto pull/round robin.
- Pending auto-reply harus dibatalkan hanya oleh customer-facing human reply.
- Snapshot settings harus dipakai untuk pending jobs.

#### Test Plan

1. Functional
- Verify auto-reply disabled sends nothing.
- Verify outside office hours trigger sends exactly one bot message.
- Verify no-agent-available trigger sends exactly one bot message.
- Verify ticket context uses ticket template and conversation context uses conversation template (V2: separate templates).
- Verify frequency limit suppresses repeated sends within configured window.
- Verify cancel-if-agent-replies-first cancels pending bot send.

2. Regression
- Verify bot message appears in conversation room but is visually distinct and non-editable.
- Verify bot message does not count as FRT, ART, ticket SLA response (V2 Auto-Reply FR-048).
- Verify unsupported/disconnected channels do not break inbound processing.

3. Integration
- Verify availability check treats Away/AUX/max capacity/outside shift as not eligible.
- Verify if ticket resolved before delay ends, context is re-evaluated before send.

4. Idempotency and Scheduler
- Verify duplicate inbound event processing does not create duplicate auto-reply.
- Verify settings change after pending schedule does not alter already-snapshotted job.

5. Security
- Verify only Admin/authorized Supervisor can change settings.

### 3. Assignee and Collaborators (V2 file 2 — ⚠️ PARTIAL)

#### Main Impact Areas

- Auth/RBAC for customer-facing reply vs internal note
- Conversation room composer and detail sidebar
- Ticket room permission model
- Team Inbox scoped user picker
- Activity log and reporting attribution
- Move/reassign policy when object changes team
- Existing multi-assignee behavior

#### Why QA Must Treat This as High Risk

- Ini bukan sekadar UI role label. Fitur ini mengubah siapa yang boleh membalas customer dan siapa yang hanya boleh menulis internal note.
- Risiko paling besar adalah privilege leak: collaborator bisa reply, close, resolve, atau muncul di metrik assignee.
- Konflik langsung dengan Reassign PRD karena move bisa menghapus pengguna yang tidak valid di team target.

#### Expected Impact to Existing Developed Features

- Conversation detail dan room composer perlu state baru untuk disabled reply.
- Create ticket from conversation dan ticket room harus mengikuti rule yang sama.
- Chat list quick assign dan assign-to-me tidak boleh mengacaukan collaborator membership.
- Team inbox navigation dan move flow harus validasi scope user setelah team change.

#### QA Watchouts

- Pastikan user tidak pernah muncul di `assigneeIds` dan `collaboratorIds` bersamaan.
- Pastikan blocked reply terjadi juga di submit time, bukan hanya disable UI.
- Pastikan reporting tetap mengatribusikan SLA/ownership hanya ke assignee.
- Pastikan move antar team memvalidasi assignee/collaborator berdasarkan target scope.

#### Test Plan

1. Functional
- Verify assignee can reply, add notes, and change status according to RBAC.
- Verify collaborator can view and add internal notes, but cannot reply or change status.
- Verify adding existing assignee as collaborator is blocked.
- Verify promoting collaborator to assignee removes collaborator role atomically.
- Verify removing assignee does not automatically create collaborator.

2. Regression
- Verify existing multi-assignee flow remains intact.
- Verify quick assign and assign-to-me still work with collaborator model present.
- Verify ticket collaborator rules match conversation collaborator rules.
- Verify closed object behavior still blocks customer reply for all non-reopened cases.

3. Integration
- Verify internal note mentions can target collaborators.
- Verify collaborator removed while typing note follows final permission check at submit time.
- Verify assignee removed while typing customer reply is blocked at submit and draft remains.
- Verify object moved to another Team Inbox removes invalid users per move policy.

4. Reporting and Audit
- Verify collaborator events are logged.
- Verify blocked collaborator reply attempt is logged.
- Verify collaborator never appears in assignee performance metrics.
- Verify SLA attribution remains based on assignee at event time.

5. Security
- Verify picker only shows valid active users in Team Inbox scope.
- Verify unauthorized users do not see collaborator management controls.

### 4. Relational Conversation (V2 file 19 — ❌ UNDEVELOPED)

#### Main Impact Areas

- Conversation detail linked section
- Custom Attributes and Properties matching source
- Chat list parent/child row aggregation
- Conversation room grouped tabs
- Unread count and latest activity sort
- Customer notice sending to multiple channels
- Create ticket and multiple-ticket context overlap

#### Why QA Must Treat This as High Risk

- Fitur ini mengubah struktur list dan room, bukan hanya menambah metadata.
- Satu bug di aggregation bisa membuat unread salah, sorting salah, atau agent membuka tab yang salah.
- Bergantung ke Custom Attributes yang sudah develop, jadi perubahan attribute existing bisa memutus grouping.

#### Expected Impact to Existing Developed Features

- Chat list row model berubah dari one-conversation-one-row menjadi parent-child container.
- Conversation detail perlu linked conversation drawer dan action set primary/unlink/combine.
- Room perlu tab handling untuk grouped conversations.
- Create ticket from conversation bisa ambigu ketika ticket dibuat dari child tetapi context customer reply datang dari primary.

#### QA Watchouts

- Parent row harus sort by latest activity across all children.
- Parent unread harus aggregate seluruh child tanpa double count.
- Group action tidak boleh merge raw timeline secara diam-diam.
- Customer notice hanya ke channel yang eligible, dan kegagalan parsial tidak boleh rollback group change.

#### Test Plan

1. Functional
- Verify admin can save 1-4 related match keys with duplicate validation.
- Verify drawer ranks exact matches first and excludes already linked conversations.
- Verify link creates one primary and one or more children without merging raw histories.
- Verify set primary changes default tab and parent identity.
- Verify unlink dissolves group when only one conversation remains.
- Verify combine group forces final primary selection.

2. Regression
- Verify chat list sorting uses latest child timestamp.
- Verify parent unread count includes child unread.
- Verify grouped room opens primary by default, and child direct-open lands on selected child tab.
- Verify detail panel and list stay in sync after link/unlink/set primary.

3. Integration
- Verify matching works with Custom Attributes and Properties already present in production.
- Verify changing custom attribute after grouping does not corrupt existing group state unexpectedly.
- Verify create ticket from child conversation does not break linked group navigation.
- Verify customer notice skips ineligible channels but grouping still succeeds.

4. Data Integrity
- Verify one conversation can belong to only one group.
- Verify move child between groups removes it from old group first.
- Verify all group mutations are idempotent and audited.

### 5. Snooze Conversation (V2 file 16 — ❌ UNDEVELOPED)

#### Main Impact Areas

- Chat list chips, filters, row actions
- Conversation visibility state separate from status state
- Reminder precedence in room
- Inbound socket wake-up flow
- Assignee transfer and wake notification
- SLA visibility and potential SLA leakage

#### Why QA Must Treat This as Medium-High Risk

- Fitur ini terlihat sederhana, tetapi menyentuh list visibility, inbound real-time event, reminder, dan SLA.
- Karena status tidak berubah, sangat mudah terjadi mismatch antara list state dan detail state.
- Konflik utama dengan reminder dan auto-reply.

#### Expected Impact to Existing Developed Features

- Chat list perlu chip `Snoozed`, count, filter, row labels.
- Room/detail perlu header label dan edit/cancel snooze action.
- Existing reminder flow di room harus defer/cancel sesuai rule.
- Inbound socket processing harus auto-unsnooze conversation dalam waktu cepat.

#### QA Watchouts

- Snooze tidak mengubah open/closed status; hanya mengubah visibility bucket.
- Pastikan closed + snooze kembali ke closed setelah wake, bukan ke open.
- Pastikan inbound auto-unsnooze tidak bentrok dengan scheduled wake.
- Karena PRD bilang no SLA pause changes, QA harus cek apakah UI tetap menampilkan SLA secara konsisten atau justru menyesatkan.

#### Test Plan

1. Functional
- Verify snooze only accepts future time.
- Verify snoozed conversation hidden from Open and Closed default lists.
- Verify Snoozed chip count and filter show active snoozed conversations only.
- Verify snooze wake at `snooze_until` returns item to original list.
- Verify manual cancel returns item immediately to original list.
- Verify inbound customer message auto-unsnoozes immediately.

2. Regression
- Verify original status in detail remains unchanged while snoozed.
- Verify closed conversation snoozed from Closed returns to Closed on wake.
- Verify list and detail remain consistent if user keeps room open while snoozed.
- Verify reminder inside snooze window is deferred to snooze end.

3. Concurrency
- Verify edit snooze by two users follows last-write-wins with user feedback.
- Verify manual cancel at the same moment as scheduled wake results in one final unsnoozed state only.

4. Integration
- Verify reassignment during snooze transfers wake notification to new assignee.
- Verify auto-reply and snooze interaction is defined and tested before release.
- Verify socket-delayed inbound still results in unsnooze once, not duplicate wake.

### 6. ~~Team Member Presence~~ ✅ DEVELOPED (V2 file 17)

> Fitur ini **sudah developed** di FE v2.5.0.
> Analisis dipertahankan untuk referensi QA regression dan alignment test dengan auto-reply.

#### Main Impact Areas

- Team Inbox header HUD
- Member drawer listing, filter, search
- Presence source of truth and last seen formatting
- Membership add/remove flow
- Auto-unassign side effect on removed member
- Future dependency with round robin and no-agent-available logic

#### Why QA Must Treat This as Medium Risk

- Fitur ini tampak administratif, tetapi definisi `online` di PRD bertentangan dengan auto-reply eligibility.
- Removal side effect menyentuh assignee and room list data.
- Presence freshness dan flapping bisa membuat supervisor mengambil keputusan salah.

#### Expected Impact to Existing Developed Features

- Team inbox navigation header berubah menampilkan HUD.
- Detail/list assignment bisa berubah otomatis ketika member dihapus.
- Agent pull/round robin dan auto-reply kemungkinan akan menggunakan presence ini sebagai input, walau definisi eligible belum sama.

#### QA Watchouts

- PRD ini menghitung Away sebagai Online; auto-reply PRD menganggap Away tidak eligible. Ini harus diuji sebagai known inconsistency.
- Auto-unassign setelah remove member bisa menyebabkan conversation hilang dari personal queue.
- Team switch saat drawer terbuka harus ganti context tanpa stale data.

#### Test Plan

1. Functional
- Verify HUD shows total members and online count.
- Verify online count includes Active and Away only.
- Verify drawer lists supervisors first, then members by presence group and alphabetically.
- Verify add existing users updates drawer and HUD.
- Verify remove member updates drawer and HUD.
- Verify last seen formatting follows thresholds.

2. Regression
- Verify inbox remains usable when presence unavailable.
- Verify removing member auto-unassigns affected conversations and updates assignee in developed room/detail/list.
- Verify switching Team Inbox while drawer open changes member context correctly.

3. Integration
- Verify presence unavailable falls back to `Unknown`/`Online -` without breaking member management.
- Verify removing last supervisor follows policy if enabled.
- Verify add member while presence service down still succeeds with unknown presence.

4. Forward Compatibility
- Verify assumptions for round robin and auto-reply are documented because `online` in HUD does not equal `eligible for assignment`.

### 7. ~~Multiple Ticket from Single Bubble Chat~~ ✅ DEVELOPED (V2 file 18)

> Fitur ini **sudah developed** di FE v2.5.0.
> Analisis dipertahankan untuk referensi QA regression test.

#### Main Impact Areas

- Conversation bubble action and selection mode
- Ticket creation modal state
- Linked message reference array
- Ticket badge on bubble
- Cookie-based draft persistence
- Active ticket context ambiguity for future auto-reply and ticket priority logic

#### Why QA Must Treat This as Medium Risk

- Core risk ada di context integrity: beberapa ticket berasal dari satu bubble/message.
- Bisa memicu ambiguity pada fitur lain yang mengandalkan satu message -> satu ticket relation.
- Namun tidak banyak menyentuh routing/state conversation inti.

#### Expected Impact to Existing Developed Features

- Create ticket from conversation flow perlu mendukung many tickets from one message.
- Conversation detail/room bubble UI perlu badge ticket count.
- Ticket context resolution untuk future auto-reply bisa ambigu saat ada banyak active tickets linked to same conversation/message zone.

#### QA Watchouts

- Single select dan multi-select harus punya behavior yang benar-benar berbeda.
- Cookie restore tidak boleh bocor antar bubble, user, workspace, atau tab secara salah.
- Partial failure per draft harus bisa retry tanpa duplicate ticket.

#### Test Plan

1. Functional
- Verify one selected bubble opens multi-draft modal with one draft by default.
- Verify `Tambah tiket` adds draft until max 20.
- Verify removing draft reindexes and keeps minimum one draft.
- Verify submit creates one ticket per valid draft, all linked to same selected bubble/message.
- Verify multi-select mode creates one ticket per selected bubble and hides multi-draft controls.

2. Regression
- Verify existing create-ticket-from-conversation still works for single ticket path.
- Verify created tickets show correct linked message references.
- Verify bubble badge `Tiket: X` count updates correctly after creation.

3. Persistence and Idempotency
- Verify draft auto-save after 1 second inactivity.
- Verify draft restore after refresh or accidental close on the same bubble.
- Verify draft deletion after successful create.
- Verify duplicate submit prevention via idempotency key.
- Verify partial failure retry only creates missing tickets.

4. Integration
- Verify attachment fields are not restored from cookie and require re-upload.
- Verify multiple tickets from one bubble do not break conversation-level active ticket detection assumptions.

### 8. WhatsApp Group Mention (V2 file 15 — ❌ UNDEVELOPED)

#### Main Impact Areas

- WA group composer
- Participant metadata loading
- Structured mention token send path
- Timeline rendering and tooltip
- Sender identity selection in group context

#### Why QA Must Treat This as Lower Risk

- Scope feature sempit ke WhatsApp group authoring dan rendering.
- Tidak mengubah ownership, routing, SLA, atau permission model conversation secara besar.
- Risiko terbesar ada di metadata staleness dan invalid mention send.

#### Expected Impact to Existing Developed Features

- Conversation room composer untuk WA group perlu picker dan token behavior.
- Chat session/group handling perlu memastikan sender identity yang benar saat group send.
- Timeline rendering perlu highlight mention tanpa merusak message layout lama.

#### QA Watchouts

- Fallback plain text harus selalu tersedia ketika metadata gagal.
- Invalid participant harus di-drop tanpa menggagalkan whole message.
- Group with large member count harus tetap usable.

#### Test Plan

1. Functional
- Verify typing `@` opens participant picker in WA group conversation only.
- Verify picker filters by name and number.
- Verify selecting participant inserts mention token.
- Verify sending message with valid mentions succeeds.
- Verify internal workspace-connected participant shows `Internal` label.

2. Regression
- Verify normal plain text send still works when mention picker fails.
- Verify timeline renders mention highlights and degrades to plain text when metadata missing.
- Verify duplicate participant mention is deduped.

3. Edge Cases
- Verify same display name remains distinguishable by number.
- Verify participant leaves group after picker opens, mention gets dropped with warning.
- Verify max 100 mentions is enforced.
- Verify emoji/special characters do not break highlight offsets.

4. Integration
- Verify session invalid or sender unavailable blocks send with correct error.
- Verify mention feature respects active sender identity in group chat.

## Cross-Feature Test Suite Recommendation

QA sebaiknya tidak hanya membuat test case per fitur, tetapi juga 1 suite integrasi lintas fitur:

### Suite A - Ownership and Routing

- Reassign Account Channel (V2 file 13) x Chat Sessions (V2 file 12) x Room (V2 file 9) x Team Inbox Nav (V2 file 6)
- Reassign Account Channel x Agent Pull (V2 file 7) x socket distribution
- Reassign Account Channel x Assignee/Collaborators (V2 file 2) x Auth scope

### Suite B - Availability and Response Automation

- Team Member Presence (V2 file 17) x Auto-reply (V2 file 1) x SLA Conversation
- Auto-reply x Ticket context (Ticket V2 file 7) x Create Ticket from Conversation (Ticket V2 file 7)
- Snooze (V2 file 16) x Auto-reply (V2 file 1) x inbound socket wake-up

### Suite C - Conversation Structure and Context

- Relational Conversation (V2 file 19) x Chat List (V2 file 8) x Room Tabs (V2 file 9)
- Relational Conversation x Custom Attributes (V2 file 11)
- Relational Conversation (V2 file 19) x Ticket Creation (Ticket V2 file 7) x Multiple Ticket (V2 file 18)

### Suite D - Permissions and Collaboration

- Assignee/Collaborators (V2 file 2) x Conversation Detail (V2 file 10) x Room Composer (V2 file 9)
- Assignee/Collaborators x Ticket Room (V2 file 14)
- Team Member Presence (V2 file 17) remove-member x auto-unassign x list/detail sync

## Release Gate Recommendations (V2)

1. ~~Reassign Account Channel (V2 file 13)~~ ✅ **SUDAH DEVELOPED.** Need regression test for reopen rule alignment.
2. Do not release Auto-reply `No agent available` trigger (V2 file 1) before round robin/assignment eligibility is formally documented.
3. Do not release Assignee and Collaborators (V2 file 2) without submit-time permission checks and reporting validation.
4. Do not release Relational Conversation (V2 file 19) without unread/sort aggregation regression tests on chat list and room tabs.
5. Do not release Snooze (V2 file 16) without explicit QA signoff for reminder precedence and inbound auto-unsnooze behavior.
6. **V2 yang belum developed (8 fitur) perlu timeline klarifikasi PM.**
