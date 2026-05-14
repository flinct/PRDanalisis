# Cross-PRD Analysis: Conversation Folder (20 PRDs)

## LOOPHOLE 1 — SLA Definition Terfragmentasi

5 PRD berbeda mendefinisikan aturan SLA dengan cara berbeda:

| PRD | Aturan SLA | Konflik |
|-----|-----------|---------|
| Chat Session Handling (FR-007) | SLA carries over on reassign, NOT reset | ✔ |
| Conversation Detail (AC-02) | First Response Due countdown hanya muncul saat **Unassigned** | ❌ Dengan Session: setelah assign, FRT hilang? |
| Snooze (Limitation) | "No SLA pause changes" | ❌ Dengan Conversation SLA PRD yang define pause |
| Chat List (US-14) | SLA countdown warna (green/yellow/red) | ❌ Tidak definisi SLA metric mana yang dipakai FRT/TTC |
| Auto-Reply (FR-048) | Auto-reply tidak dihitung sebagai SLA response | ✔ Explisit |

**Impact**: SLA metric tidak konsisten. Agent bisa lihat warna berbeda untuk arti yang sama. FRT hilang dari UI saat conversation di-assign (padahal SLA tetap running).

---

## LOOPHOLE 2 — Group Chat Lifecycle Tidak Terdefinisi

| PRD | Statement | Masalah |
|-----|-----------|---------|
| Omnichannel (US-5) | "Group chats cannot be resolved" | ❌ |
| Chat Session Handling (US-003) | "Always create new session after resolved" | ❌ Jika group chat never resolved, session lifecycle group tidak pernah jalan |
| Room (Limitation) | "Room history not available for group chats" | ❌ |
| Relational Conversation (FR-045) | Tabs untuk grouped room (bisa termasuk group chat) | ❌ Tab grouping vs session lifecycle tidak aligned |

**Impact**: Group chat adalah first-class citizen di omnichannel tapi tidak punya lifecycle yang jelas. Agent tidak bisa resolve, tidak ada session history, tidak ada room history. Sementara Relational PRD memperlakukan group chat seperti conversation biasa.

**Hidden Chain**: WA Web Group (dari Conversation SLA) tidak support TTC → Group chat tidak bisa resolve → Session tidak pernah selesai → SLA TTC infinite. Tiga PRD berbeda bicara tentang WA group tapi tidak ada yang menyambungkan.

---

## LOOPHOLE 3 — Navigation Model Overlap (3 Definisi Berbeda)

Tiga PRD mendefinisikan navigasi Inbox secara independen:

| PRD | Model Navigasi | Yang Didefinisikan |
|-----|---------------|-------------------|
| Agent Pull Conversation | "Your Inbox" + "Get Conversation" button | Agent punya inbox pribadi, pull dari queue |
| Team Inbox Navigation | Sidebar daftar Team Inbox + drag & drop | Navigasi per team, reassign via drag |
| Omnichannel Navigation | Menu: Your Inbox, All, Unassigned, Closed, Starred, Spam | Navigasi global dengan filter |

**Konflik**: Agent Pull Conversation mengasumsikan agent punya "Your Inbox" sendiri. Team Inbox Navigation mengasumsikan agent bisa lihat semua Team Inbox di sidebar. Omnichannel Navigation mendefinisikan keduanya + filter channel. Tiga model navigasi berbeda harus coexist tanpa definisi prioritas mana yang override.

**Impact**: Agent bingung karena punya 3 cara navigasi berbeda. Implementasi bisa saling timpa.

---

## LOOPHOLE 4 — Assignee & Collaborator vs Multi-Assignee Legacy

| PRD | Statement | Masalah |
|-----|-----------|---------|
| Assignee & Collaborators (FR-001) | "Keep existing multi-assignee behavior" | ✔ Explicit |
| Conversation Detail (AC-01) | "Multi-assignee chips with avatar + name" | ✔ |
| Room (Assignment Workflows) | "Show assigned to, opened by, closed by" | ❌ Tidak mention collaborator |
| Chat List (Quick Assign) | "Assign to Me" untuk Unassigned | ❌ Assign to Me = jadi Assignee, collaborator tidak di-cover |

**Hidden Conflict**: EC-010 dari Assignee PRD: "Object moved to another Team Inbox — keep Assignees and Collaborators only if they remain valid in target scope." Tapi Reassign Account Channel (FR-006): "Move resets assignee to Unassigned." Jika move reset assignee, collaborator ikut hilang? Dua PRD punya rule berbeda.

**Impact**: Assignee hilang setelah move (Reassign PRD), collaborator harus manual di-add ulang (Collaborator PRD). Agent dan Supervisor frustrasi karena harus setup ulang tim.

---

## LOOPHOLE 5 — Relational Group vs Session vs Ticket

Tiga mekanisme "grouping" berbeda:

| Mekanisme | Definisi | Konflik |
|-----------|----------|---------|
| Relational Conversation | "Primary + Child" — grouped conversations | ❌ |
| Chat Session Handling | "New session after resolve" — session lifecycle | ❌ Apa yang terjadi jika Primary di-resolve? Child ikut resolved? |
| Create Ticket from Conversation | "All future messages flagged is_ticket_message=true" | ❌ Jika conversation dalam relational group, ticket flag berlaku untuk semua child? |

**Hidden Gap**: Relational PRD secara eksplisit bilang "No ticket scope in this PRD". Create Ticket PRD secara eksplisit bilang "Messages after creation linked to ticket". Tidak ada PRD yang mendefinisikan interaksi antara grouped conversation + ticket.

**Impact**: Agent bisa create ticket dari child conversation, lalu reply di child ter-record sebagai ticket message, tapi Primary tidak tahu. Relational group jadi tidak konsisten dengan ticket context.

---

## LOOPHOLE 6 — Custom Attributes vs Conversation Detail vs Relational Matching

| PRD | Fungsi Attribute | Masalah |
|-----|-----------------|---------|
| Custom Attributes | "Conversation-level editable fields & collections" | ✔ |
| Conversation Detail (FR-20) | "Custom attributes from external APIs, read-only" | ❌ Detail bilang read-only, Custom Attributes bilang editable. Konflik P0 vs P2 |
| Relational Conversation (FR-001) | Matching berdasarkan Custom Attributes & Properties | ❌ Jika attribute di-edit setelah matching, apakah relasi putus? Tidak didefinisikan |

**Impact**: Admin edit custom attribute → relational match key value berubah → conversation yang tadinya related jadi tidak match lagi. Relasional grouping jadi stale.

---

## LOOPHOLE 7 — Snooze vs Set Reminder vs Auto-Reply

| PRD | Mekanisme | Konflik |
|-----|-----------|---------|
| Snooze | Hide + wake up otomatis. No SLA pause. | ❌ |
| Room (Reminder) | Reminder modal: one-time / recurring | ❌ Snooze punya precedence rule: "Snooze overrides reminder" |
| Auto-Reply | Bot auto-reply ketika unavailable | ❌ Jika auto-reply terkirim saat snooze, apakah wake? Tidak didefinisikan |

**Impact**: Agent set snooze + reminder. Reminder di-defer oleh snooze. Tapi auto-reply dari bot terkirim karena "no agent available" (snooze = agent tidak handle). Customer reply setelah auto-reply → auto-unsnooze (Snooze FR-007) → agent kaget.

---

## LOOPHOLE 8 — Reopen vs New Session vs Legacy Routing

| PRD | Reopen Behavior | Konflik |
|-----|----------------|---------|
| Chat Session Handling (US-003) | "New message after resolved = new Unassigned session" | ❌ |
| Reassign Account Channel (FR-005) | "Closed legacy thread + inbound = reopen modal (default Keep in old team)" | ❌ Ini conflict: Session Handling selalu bikin baru, Reassign tanya dulu |
| Room (Assignment) | "Resolved chats reopen on new message" | ❌ Room bilang "reopen", Session bilang "new session" |

**Impact**: Tergantung PRD mana yang diimplementasi lebih dulu, perilaku reopen bisa berbeda total. QA harus tes ketiganya.

---

## LOOPHOLE 9 — Agent Availability vs Presence vs Max Capacity

| PRD | Definisi "Available" | Konflik |
|-----|---------------------|---------|
| Auto-Reply (FR-021) | Active, online, not Away/AUX, within shift, under max capacity | ✔ Defined |
| Team Member Presence | Online = Active + Away. Offline = Offline. | ❌ Auto-Reply exclude Away, Presence PRD count Away as "Online" |

**Impact**: Agent status "Away" dianggap Online di HUD (Presence PRD) tapi dianggap unavailable di Auto-Reply. Supervisor lihat 5 agent online, tapi auto-reply tetap terkirim karena 5 agent itu Away. Confusing.

---

## LOOPHOLE 10 — WA Web Group Mention vs Omnichannel Group Handling

| PRD | Group Mention | Konflik |
|-----|--------------|---------|
| WA Web Group Mention | "@" picker, participant list, internal label | ✔ Defined untuk WA Web |
| Chat Session Handling | Group metadata events, "Send as" selector | ❌ WA Web Mention bilang support 100 mentions, Session Handling tidak define limit |
| Omnichannel | "Group chats cannot be resolved" | ❌ Mention hanya untuk WA Web, group handling general |

**Impact**: Fitur mention hanya untuk WA Web. Tapi group chat juga ada di channel lain (nanti). Ketika channel lain support group, mention tidak tersedia. Tidak ada roadmap alignment.

---

## RINGKASAN PRIORITAS IMPACT

| # | Loophole | Risk Level | Most Impacted PRDs |
|---|----------|-----------|-------------------|
| L1 | SLA terfragmentasi (5 PRD beda definisi) | 🔴 HIGH | Session, Detail, Snooze, Chat List, Auto-Reply |
| L2 | Group chat lifecycle undefined | 🔴 HIGH | Omnichannel, Session, Room, Relational, SLA |
| L3 | 3 navigation model overlap | 🟡 MEDIUM | Agent Pull, Team Inbox Nav, Omnichannel Nav |
| L4 | Assignee/Collaborator vs Move reset | 🟡 MEDIUM | Collaborator, Reassign, Detail, Room |
| L5 | Relational Group vs Session vs Ticket | 🔴 HIGH | Relational, Session, Create Ticket, Multiple Ticket |
| L6 | Custom Attributes read-only vs editable | 🟡 MEDIUM | Detail, Custom Attributes, Relational |
| L7 | Snooze vs Reminder vs Auto-Reply interaction | 🟡 MEDIUM | Snooze, Room, Auto-Reply |
| L8 | Reopen = new session vs reopen modal | 🔴 HIGH | Session, Reassign, Room |
| L9 | Agent availability definition mismatch | 🟡 MEDIUM | Auto-Reply, Presence |
| L10 | WA Mention scope vs future channel | 🟢 LOW | WA Mention, Session, Omnichannel |

## REKOMENDASI

1. **Buat satu dokumen "SLA Engine Contract"** yang menyatukan aturan SLA dari Session PRD, Detail PRD, Chat List, Snooze, dan Conversation SLA PRD. Tentukan: (a) kapan SLA start/stop/pause, (b) metric mana yang dipakai UI, (c) bagaimana overlap dengan snooze dan auto-reply.

2. **Buat satu diagram state machine** yang menyatukan: Session lifecycle (unassigned → assigned → resolved), Relational group (primary + child), Reopen behavior (new session vs reopen modal vs reopen same team), dan Ticket lifecycle. Tentukan prioritas ketika overlap.

3. **Harmonisasi Reopen**: Pilih satu definisi reopen untuk semua PRD. Rekomendasi: ticket PRD, session PRD, dan reassign PRD harus pakai definisi yang sama.

4. **Definisikan Group Chat SLA**: Chat session untuk group harus punya lifecycle. Jika "cannot be resolved" tetap dipertahankan, SLA TTC harus disabled untuk group (seperti WA Web Group di Conversation SLA).

5. **Satukan navigasi**: Tentukan apakah "Your Inbox" adalah dedicated agent view atau filter dari Team Inbox. Jangan sampai keduanya diimplementasi sebagai fitur terpisah.

6. **Clarify Attribute ownership**: Detail bilang read-only P2, Custom Attributes bilang editable P0. Keduanya harus alignment.

7. **Tentukan prioritas untuk conversation yang punya multiple "state"**: Misalnya: conversation yang di-snooze, punya ticket aktif, dan sedang dalam relational group. Mana yang dominant?
