# Cross-PRD Analysis: Conversation Folder (V2 — 20 PRDs)

> Fungsi file ini: analisa detail lintas-PRD, loophole, conflict, impact area, dan catatan QA mendalam untuk domain Conversation.
>
> **Source of Truth:** Conversation V2 (`PRD/Conversationv2/`). V1 (`PRD/Conversation/`) deprecated.
> Referensi V2 file number: lihat `Memory/conversation-v1-vs-v2-comparison.md`.

## Structure

1. Loophole Analysis
2. Priority Summary
3. Recommendations
4. Undeveloped Features QA View
5. Omnichannel Deep Analysis
6. Three-PRD Logical Intersection
7. Current Implemented Filtering Rules

## Loophole Analysis

### LOOPHOLE 1 — SLA Definition Terfragmentasi

5 PRD V2 berbeda mendefinisikan aturan SLA dengan cara berbeda:

| V2 File | Aturan SLA | Konflik |
|---------|-----------|---------|
| Chat Sessions (file 12, FR-007) | SLA carries over on reassign, NOT reset | ✔ |
| Detail v2.1 (file 10, AC-02) | First Response Due countdown hanya muncul saat **Unassigned** | ❌ Dengan Sessions: setelah assign, FRT hilang? |
| Snooze v1.0 (file 16) | "No SLA pause changes" | ❌ Dengan Room v1.1 yang define Hold pause SLA |
| Chat List v1.1 (file 8, US-14) | SLA countdown warna (green/yellow/red) | ❌ Tidak definisi SLA metric mana yang dipakai FRT/TTC |
| Auto-Reply v1.0 (file 1, FR-048) | Auto-reply tidak dihitung sebagai SLA response | ✔ Explisit |
| Room v1.1 (file 9) | Hold pauses SLA countdown, Resume restores | ❌ Konflik dengan Snooze (no pause) |

**Impact**: SLA metric tidak konsisten. Agent bisa lihat warna berbeda untuk arti yang sama. FRT hilang dari UI saat conversation di-assign (padahal SLA tetap running).

**FE v2.5.0 Update:**
- ✅ FRT sekarang visible meskipun conversation sudah assigned (tidak hanya saat Unassigned — V2 Detail AC-02 outdated vs implementasi)
- ✅ RLT dan Wait Time sudah diimplementasi sebagai tracked metric (live timer + resolved badge) — sesuai V2 Response Metrics (file 3)
- ✅ Data model punya `firstAgentAssignmentAt` terpisah, sehingga FRT = Wait Time + RLT bisa dihitung
- ❌ SLA color threshold masih mismatch (FE: absolute time, V2 Chat List: percentage)
- ❌ Hold vs Snooze pause policy belum final (3-way conflict: Room v1.1=Hold pause, Snooze v1.0=no pause, RLT Adjusted=tergantung)

---

### LOOPHOLE 2 — Group Chat Lifecycle Tidak Terdefinisi

| V2 File | Statement | Masalah |
|---------|----------|---------|
| Omnichannel v1.1 (file 4, US-5) | "Group chats cannot be resolved" | ❌ |
| Chat Sessions v1.1 (file 12, US-003) | "Always create new session after resolved" | ❌ Jika group chat never resolved, session lifecycle group tidak pernah jalan |
| Room v1.1 (file 9) | "Room history not available for group chats" | ❌ |
| Relational v1.0 (file 19, FR-045) | Tabs untuk grouped room (bisa termasuk group chat) | ❌ Tab grouping vs session lifecycle tidak aligned |

**Impact**: Group chat adalah first-class citizen di omnichannel tapi tidak punya lifecycle yang jelas. Agent tidak bisa resolve, tidak ada session history, tidak ada room history. Sementara Relational PRD memperlakukan group chat seperti conversation biasa.

**Hidden Chain**: V2 Conversation SLA bilang WA Web Group tidak support TTC → Group chat tidak bisa resolve → Session tidak pernah selesai → SLA TTC infinite. Tiga PRD V2 berbeda bicara tentang WA group tapi tidak ada yang menyambungkan.

---

### LOOPHOLE 3 — Navigation Model Overlap (3 Definisi Berbeda)

Tiga PRD V2 mendefinisikan navigasi Inbox secara independen:

| V2 File | Model Navigasi | Yang Didefinisikan |
|---------|---------------|-------------------|
| Agent Pull v2.1 (file 7) | "Your Inbox" + "Get Conversation" button | Agent punya inbox pribadi, pull dari queue |
| Team Inbox Nav v2.1 (file 6) | Sidebar daftar Team Inbox + drag & drop | Navigasi per team, reassign via drag |
| Omnichannel Nav v1.2 (file 5) | Menu: Your Inbox, All, Unassigned, Closed, Starred, Spam | Navigasi global dengan filter |

**Konflik**: Agent Pull mengasumsikan agent punya "Your Inbox" sendiri. Team Inbox Nav mengasumsikan agent bisa lihat semua Team Inbox di sidebar. Omnichannel Nav mendefinisikan keduanya + filter channel. Tiga model navigasi berbeda harus coexist tanpa definisi prioritas mana yang override.

**Impact**: Agent bingung karena punya 3 cara navigasi berbeda. Implementasi bisa saling timpa.

---

### LOOPHOLE 4 — Assignee & Collaborator vs Multi-Assignee Legacy

| V2 File | Statement | Masalah |
|---------|----------|---------|
| Assignee & Collaborators v1.0 (file 2, FR-001) | "Keep existing multi-assignee behavior" | ✔ Explicit |
| Detail v2.1 (file 10, AC-01) | "Multi-assignee chips with avatar + name" | ✔ |
| Room v1.1 (file 9) | "Show assigned to, opened by, closed by" | ❌ Tidak mention collaborator |
| Chat List v1.1 (file 8) | "Assign to Me" untuk Unassigned | ❌ Assign to Me = jadi Assignee, collaborator tidak di-cover |

**Hidden Conflict**: V2 Assignee (file 2) EC-010: "Object moved to another Team Inbox — keep Assignees and Collaborators only if they remain valid in target scope." Tapi V2 Reassign (file 13) FR-006: "Move resets assignee to Unassigned." Jika move reset assignee, collaborator ikut hilang? Dua PRD V2 punya rule berbeda.

**Impact**: Assignee hilang setelah move (Reassign PRD), collaborator harus manual di-add ulang (Collaborator PRD). Agent dan Supervisor frustrasi karena harus setup ulang tim.

---

### LOOPHOLE 5 — Relational Group vs Session vs Ticket

Tiga mekanisme "grouping" berbeda (semua V2):

| Mekanisme (V2 File) | Definisi | Konflik |
|---------------------|----------|---------|
| Relational v1.0 (file 19) | "Primary + Child" — grouped conversations | ❌ |
| Chat Sessions v1.1 (file 12) | "New session after resolve" — session lifecycle | ❌ Apa yang terjadi jika Primary di-resolve? Child ikut resolved? |
| Ticketing V2 (file 14) | "All future messages flagged is_ticket_message=true" | ❌ Jika conversation dalam relational group, ticket flag berlaku untuk semua child? |

**Hidden Gap**: V2 Relational (file 19) secara eksplisit bilang "No ticket scope in this PRD". V2 Ticketing (file 14) secara eksplisit bilang "Messages after creation linked to ticket". Tidak ada PRD V2 yang mendefinisikan interaksi antara grouped conversation + ticket.

**Impact**: Agent bisa create ticket dari child conversation, lalu reply di child ter-record sebagai ticket message, tapi Primary tidak tahu. Relational group jadi tidak konsisten dengan ticket context.

---

### LOOPHOLE 6 — Custom Attributes vs Conversation Detail vs Relational Matching

| V2 File | Fungsi Attribute | Masalah |
|---------|-----------------|---------|
| Custom Attributes v1.0 (file 11) | "Conversation-level editable fields & collections" | ✔ |
| Detail v2.1 (file 10, FR-20) | "Custom attributes from external APIs, read-only" | ❌ Detail bilang read-only, Custom Attributes bilang editable. V2 file 11 define `ui_editable` |
| Relational v1.0 (file 19, FR-001) | Matching berdasarkan Custom Attributes & Properties | ❌ Jika attribute di-edit setelah matching, apakah relasi putus? Tidak didefinisikan |

**Impact**: Admin edit custom attribute → relational match key value berubah → conversation yang tadinya related jadi tidak match lagi. Relasional grouping jadi stale.

---

### LOOPHOLE 7 — Snooze vs Set Reminder vs Auto-Reply

| V2 File | Mekanisme | Konflik |
|---------|----------|---------|
| Snooze v1.0 (file 16) | Hide + wake up otomatis. No SLA pause. | ❌ |
| Room v1.1 (file 9, Reminder) | Reminder modal: one-time / recurring | ❌ Snooze punya precedence rule: "Snooze overrides reminder" |
| Auto-Reply v1.0 (file 1) | Bot auto-reply ketika unavailable | ❌ Jika auto-reply terkirim saat snooze, apakah wake? Tidak didefinisikan |

**Impact**: Agent set snooze + reminder. Reminder di-defer oleh snooze. Tapi auto-reply dari bot terkirim karena "no agent available" (snooze = agent tidak handle). Customer reply setelah auto-reply → auto-unsnooze (Snooze FR-007) → agent kaget.

---

### LOOPHOLE 8 — Reopen vs New Session vs Legacy Routing

| V2 File | Reopen Behavior | Konflik |
|---------|----------------|---------|
| Chat Sessions v1.1 (file 12, US-003) | "New message after resolved = new Unassigned session" | ❌ |
| Reassign v1.4 (file 13, FR-005) | "Closed legacy thread + inbound = reopen modal (default Keep in old team)" | ❌ Ini conflict: Sessions selalu bikin baru, Reassign tanya dulu |
| Room v1.1 (file 9) | "Resolved chats reopen on new message" | ❌ Room bilang "reopen", Sessions bilang "new session" |

**Impact**: Tergantung PRD mana yang diimplementasi lebih dulu, perilaku reopen bisa berbeda total. QA harus tes ketiganya.

---

### LOOPHOLE 9 — Agent Availability vs Presence vs Max Capacity

| V2 File | Definisi "Available" | Konflik |
|---------|---------------------|---------|
| Auto-Reply v1.0 (file 1, FR-021) | Active, online, not Away/AUX, within shift, under max capacity | ✔ Defined |
| Team Member Presence v1.0 (file 17) | Online = Active + Away. Offline = Offline. | ❌ Auto-Reply exclude Away, Presence PRD count Away as "Online" |

**Impact**: Agent status "Away" dianggap Online di HUD (Presence PRD) tapi dianggap unavailable di Auto-Reply. Supervisor lihat 5 agent online, tapi auto-reply tetap terkirim karena 5 agent itu Away. Confusing.

---

### LOOPHOLE 10 — WA Web Group Mention vs Omnichannel Group Handling

| V2 File | Group Mention | Konflik |
|---------|--------------|---------|
| WA Group Mention v1.0 (file 15) | "@" picker, participant list, internal label | ✔ Defined untuk WA Web |
| Chat Sessions v1.1 (file 12) | Group metadata events, "Send as" selector | ❌ WA Mention bilang support 100 mentions, Sessions tidak define limit |
| Omnichannel v1.1 (file 4) | "Group chats cannot be resolved" | ❌ Mention hanya untuk WA Web, group handling general |

**Impact**: Fitur mention hanya untuk WA Web. Tapi group chat juga ada di channel lain (nanti). Ketika channel lain support group, mention tidak tersedia. Tidak ada roadmap alignment.

---

## Priority Summary

### RINGKASAN PRIORITAS IMPACT

| #   | Loophole                                     | Risk Level | FE Status | Most Impacted PRDs                                  |
| --- | -------------------------------------------- | ---------- | --------- | --------------------------------------------------- |
| L1  | SLA terfragmentasi (5 PRD beda definisi)     | 🔴 HIGH    | ⚠️ Partial solved | Session, Detail, Snooze, Chat List, RLT, Auto-Reply |
| L2  | Group chat lifecycle undefined               | 🔴 HIGH    | ❌ Open    | Omnichannel, Session, Room, Relational, SLA         |
| L3  | 3 navigation model overlap                   | 🟡 MEDIUM  | ⚠️ Partial | Agent Pull, Team Inbox Nav, Omnichannel Nav         |
| L4  | Assignee/Collaborator vs Move reset          | 🟡 MEDIUM  | ⚠️ Partial | Collaborator, Reassign, Detail, Room                |
| L5  | Relational Group vs Session vs Ticket        | 🔴 HIGH    | ❌ Open    | Relational, Session, Create Ticket, Multiple Ticket |
| L6  | Custom Attributes read-only vs editable      | 🟡 MEDIUM  | ❓ Not checked | Detail, Custom Attributes, Relational               |
| L7  | Snooze vs Reminder vs Auto-Reply interaction | 🟡 MEDIUM  | ❌ Open    | Snooze, Room, Auto-Reply                            |
| L8  | Reopen = new session vs reopen modal         | 🔴 HIGH    | ⚠️ FE ada Close/Reopen | Session, Reassign, Room                             |
| L9  | Agent availability definition mismatch       | 🟡 MEDIUM  | ⚠️ Partial | Auto-Reply, Presence                                |
| L10 | WA Mention scope vs future channel           | 🟢 LOW     | ❌ Open    | WA Mention, Session, Omnichannel                    |

## Recommendations

### REKOMENDASI

1. **Buat satu dokumen "SLA Engine Contract"** yang menyatukan aturan SLA dari Session PRD, Detail PRD, Chat List, Snooze, dan Conversation SLA PRD. Tentukan: (a) kapan SLA start/stop/pause, (b) metric mana yang dipakai UI, (c) bagaimana overlap dengan snooze dan auto-reply.

2. **Buat satu diagram state machine** yang menyatukan: Session lifecycle (unassigned → assigned → resolved), Relational group (primary + child), Reopen behavior (new session vs reopen modal vs reopen same team), dan Ticket lifecycle. Tentukan prioritas ketika overlap.

3. **Harmonisasi Reopen**: Pilih satu definisi reopen untuk semua PRD. Rekomendasi: ticket PRD, session PRD, dan reassign PRD harus pakai definisi yang sama.

4. **Definisikan Group Chat SLA**: Chat session untuk group harus punya lifecycle. Jika "cannot be resolved" tetap dipertahankan, SLA TTC harus disabled untuk group (seperti WA Web Group di Conversation SLA).

5. **Satukan navigasi**: Tentukan apakah "Your Inbox" adalah dedicated agent view atau filter dari Team Inbox. Jangan sampai keduanya diimplementasi sebagai fitur terpisah.

6. **Clarify Attribute ownership**: Detail bilang read-only P2, Custom Attributes bilang editable P0. Keduanya harus alignment.

7. **Tentukan prioritas untuk conversation yang punya multiple "state"**: Misalnya: conversation yang di-snooze, punya ticket aktif, dan sedang dalam relational group. Mana yang dominant?

---

## Feature Development Status vs PRD (FE v2.5.0)

### STATUS IMPLEMENTASI PER FITUR (vs V2)

Setelah validasi dengan FE repo `apps/omnichannel/` (v2.5.0). Sumber: V2 (`PRD/Conversationv2/`).

| V2 File | Fitur | Status FE | Catatan |
|---------|-------|-----------|---------|
| (file 3, 8, 10) | **SLA Metrics (FRT/TTC/RLT/Wait Time)** | ✅ **DEVELOPED** | v2.5.0: `firstAgentAssignmentAt`, `rltMs`, `waitTimeInQueueMs`, live timer display |
| (file 19) | **Relational Conversation** | ❌ **UNDEVELOPED** | Group chat handling ada (isGroup), tapi relasi Primary+Child antar conversation tidak ada |
| (file 18) | **Multiple Ticket from Single Bubble** | ✅ **DEVELOPED** | `CreateTicketDraftsModal`, multi-select message, batch draft (max 20) |
| (file 17) | **Team Member Presence** | ✅ **DEVELOPED** | `member-status.store` (AWAY/READY), idle detection, away reasons CRUD, shift scheduler |
| (file 16) | **Snooze Conversation** | ❌ **UNDEVELOPED** | Ticket snooze saja yang ada. Conversation snooze tidak ada |
| (file 15) | **WhatsApp Group Mention** | ❌ **UNDEVELOPED** | Tidak ada @mention picker. Hanya macro `/shortcut` yang ada |
| (file 13) | **Reassign Account Channel** | ✅ **DEVELOPED** | `AdjustAccountModal`, `changeAccountChannel`, account group management |
| (file 2) | **Assignee & Collaborators** | ⚠️ **PARTIAL** | Participants sebagai assignee sudah develop. Konsep "collaborator" tidak ada |
| (file 1) | **Auto-reply Templates** | ❌ **UNDEVELOPED** | Tidak ada auto-reply, welcome message, bot reply. Hanya Macros (`/shortcut`) |
| (file 8) | **FRT/TTC Settings (SLA Config)** | ✅ **DEVELOPED** | `ConversationSLAForm`, per-channel SLA, policy toggles, reminder popover |
| (file 3) | **Offline Report** | ✅ **DEVELOPED** | Async export dengan RLT/Wait Time columns |

### IMPLIKASI UNTUK PRIORITAS

Daftar prioritas sebelumnya perlu direvisi karena beberapa fitur sudah develop:

| Prioritas Baru | Fitur | Status FE | Impact |
|---|---|---|---|
| 🔴 **HIGH** | Auto-reply Templates | ❌ Belum develop | Availability & SLA exclusion belum bisa diuji |
| 🔴 **HIGH** | Relational Conversation | ❌ Belum develop | Grouping integrity, SLA aggregate, ticket overlap |
| 🟡 **MEDIUM** | Snooze Conversation | ❌ Belum develop | Precedence rule, SLA pause policy belum bisa final |
| 🟡 **MEDIUM** | Assignee & Collaborators | ⚠️ Partial | Collaborator fitur belum ada, move policy belum clear |
| 🟢 **LOW** | WhatsApp Group Mention | ❌ Belum develop | Hanya untuk WA Web, channel lain belum support group |
| ✅ **DONE** | Multiple Ticket from Bubble | ✅ Developed | Perlu regression test, bukan prioritas implementasi |
| ✅ **DONE** | Team Member Presence | ✅ Developed | Perlu alignment test dengan auto-reply (saat auto-reply developed) |
| ✅ **DONE** | Reassign Account Channel | ✅ Developed | Perlu regression test untuk SLA stop/resume behavior |
| ✅ **DONE** | RLT/Wait Time (Phase 1) | ✅ Developed | Hanya reporting, alert/breach belum aktif |

### RINGKASAN QA FOCUS

- **Reassign Account Channel**: fokus ke ownership, routing, reopen rule, assignee reset, SLA stop, audit, dan sticky legacy binding.
- **Auto-reply Templates**: fokus ke inbound pipeline, availability calculation, ticket context resolution, SLA exclusion, scheduler, dan idempotency.
- **Assignee and Collaborators**: fokus ke RBAC, composer permissions, ticket parity, move policy, dan reporting attribution.
- **Relational Conversation**: fokus ke grouping integrity, unread/sort aggregation, room tabs, custom attribute dependency, dan overlap dengan ticket.
- **Snooze Conversation**: fokus ke visibility state, reminder precedence, inbound auto-unsnooze, reassignment, dan SLA leakage.
- **Team Member Presence**: fokus ke presence truth source, add/remove member side effect, auto-unassign, dan mismatch dengan availability logic.
- **Multiple Ticket from Single Bubble**: fokus ke linked message integrity, cookie persistence, single vs multi-select mode, partial failure retry.
- **WhatsApp Group Mention**: fokus ke metadata fallback, invalid mention drop, sender identity, dan timeline rendering.

### CATATAN KRITIS

- Conversation juga bersinggungan dengan Ticket, Auth, Account Channel, People, SLA Conversation, socket distribution, dan auto pull/round robin.
- Round robin belum punya PRD tersendiri, sehingga fitur yang memakai istilah `eligible agent`, `available agent`, atau `assignment rules` wajib diberi QA assumption note dan alignment lebih dulu sebelum release.
- Detail penuh analisis dan test plan disimpan di `Memory/conversation-undeveloped-features-analysis.md`.

---

## Omnichannel Deep Analysis (V2)

### OMNICHANNEL INBOX v1.1 (V2 file 4) — SENIOR QA LEAD PERSPECTIVE

### Risiko dan Gap Utama

1. **Multi-session management belum cukup eksplisit**
- V2 Omnichannel menargetkan zero session conflict, tetapi tidak mendefinisikan rule deteksi conflict secara rinci.
- QA harus menguji login ganda, token expiry, takeover, dan isolation antar environment.

2. **Retention policy belum granular**
- V2 menetapkan store 6 bulan, archive 6 bulan, delete 12 bulan.
- Tidak jelas acuan waktunya: created date, first message, atau last activity.

3. **Group chat lifecycle conflict**
- V2 Omnichannel menyebut group chat tidak bisa resolved.
- V2 Sessions dan V2 Room mendefinisikan lifecycle yang bertentangan terhadap resolved/reopen/new session.

4. **Presence/availability conflict**
- V2 Omnichannel ingin indicator Active/Away.
- V2 lainnya mendefinisikan agent eligibility secara berbeda untuk auto-reply/assignment.

5. **Audit, rate limit, dan integration fallback belum cukup detail**
- Belum ada batas rate limit yang tegas.
- Belum jelas coverage audit log untuk semua tindakan conversation.
- Belum jelas graceful degradation ketika ticketing/broadcast/SAP integration unavailable.

### QA Priority untuk Omnichannel Inbox

1. Group chat lifecycle
2. Session conflict and takeover
3. Retention enforcement
4. Presence vs eligibility consistency
5. Real-time socket update reliability

---

## Three-PRD Logical Intersection (V2)

### THREE-PRD LOGICAL INTERSECTION

PRD V2 yang dibandingkan:

1. Omnichannel Inbox v1.1 (V2 file 4)
2. Omnichannel Navigation v1.2 (V2 file 5)
3. Team Inbox Navigation v2.1 (V2 file 6)

### Kesimpulan Utama

Tiga PRD V2 ini bersama-sama mendefinisikan bagaimana inbox/conversation ditampilkan dan diolah. Masalah utamanya adalah belum ada satu definisi final tentang **logical intersection** antara:

1. **Inbox section**
2. **Channel section**
3. **Team section**

### Section yang Seharusnya Ada

1. **Inbox**
- Your Inbox
- Unassigned
- All Chat
- Closed
- Starred
- Spam
- Junk

2. **Channel**
- Semua channel aktif milik company

3. **Team**
- Semua Team Inbox yang dibuat dan accessible oleh user

### Gap dan Tumpang Tindih

1. **V2 Omnichannel Inbox (file 4)** mendefinisikan unified inbox dan channel-centric behavior.
2. **V2 Omnichannel Navigation (file 5)** mendefinisikan global navigation state seperti Your Inbox, All, Unassigned, Closed, Starred, Spam.
3. **V2 Team Inbox Navigation (file 6)** mendefinisikan team-centric sidebar dan ownership/team scope.

### Risiko Requirement Overlap

1. `Your Inbox` bisa dibaca sebagai personal assignment view atau sebagai hasil filter di dalam team context.
2. `All` dan `Unassigned` belum selalu jelas apakah global company scope atau scoped by team untuk role tertentu.
3. Team selection dan channel selection sama-sama mempengaruhi chat list, tetapi prioritas kombinasi filter belum tertulis eksplisit di PRD.

### Rekomendasi Logika

Chat List harus dipahami sebagai hasil irisan:

`ChatList = InboxFilter INTERSECT ChannelFilter INTERSECT TeamFilter INTERSECT RBACScope`

Dan RBACScope harus selalu dievaluasi dulu sebelum filter lain ditampilkan.

---

## Current Implemented Filtering Rules (V2-aligned)

### CURRENT IMPLEMENTATION LOGIC — DEVELOPED FILTERING RULES

Current implemented filtering rules sudah menjadi bagian dari canonical summary di `Memory/global-memory.md`.

Ringkasnya (aligned dengan V2):

1. Filtering chat list ditentukan oleh intersection `Inbox x Channel x Team x RBAC`.
2. Default landing adalah `Your Inbox`.
3. Visibility `Unassigned` dan `All` bergantung pada role dan team scope.
4. `Spam` dan `Starred` bersifat user-specific.
5. `Junk` bersifat company-wide.
6. `Channel` dan `Team` adalah filter tambahan di atas scope access user.

### Implikasi QA

1. Testing filter tidak cukup per-tab; harus diuji per kombinasi role + team + channel + inbox state.
2. Chat list response harus konsisten terhadap intersection tiga section: Inbox, Channel, Team.
3. Role restriction untuk Agent vs Supervisor vs Admin wajib di-cover di UI dan API level.
4. Socket update wajib dites agar perubahan assignment/spam/starred/team langsung memindahkan row ke list yang benar.

### Confirmed Against Production Data (V2-aligned)

Production document mengkonfirmasi bahwa semua filter field berikut sudah exist di collection:
- `status: "open"/"closed"` — V2 canonical
- `isJunked`, `spams[]`, `favorites[]`, `tags[]`, `isPinned` — all present
- `team: { teamId, name, icon, color }` — present
- `participants` = assignee field — present but empty (V2 Collaborator fitur belum developed)
- `sessionDetails: []` — schema ready, data pending
- SLA tidak tersimpan di dokumen — dihitung real-time di service layer

### Ringkasan Posisi File

- File ini menyimpan analisa detail, bukan ringkasan global.
- Untuk ringkasan global dan canonical rules, lihat `Memory/global-memory.md`.
- Untuk analisis detail SLA/RLT/FRT/TTC, lihat `Memory/conversation-sla-rlt-frt-ttc-analysis.md`.
- **Source of truth:** V2 (`PRD/Conversationv2/`). V1 deprecated.

---

## QA Analysis & Testing Guidance (FE v2.5.0 vs V2)

### Pendekatan: Setiap Loophole → FE Status → Impact → Testing

> **Catatan:** Analisis ini mengacu ke V2 (`PRD/Conversationv2/`). V1 deprecated.

---

### L1 — SLA Fragmentasi

| Aspek | Detail |
|---|---|
| **FE Status** | ⚠️ Partial: RLT/Wait Time sudah, FRT visible after assign ✅, color threshold mismatch ❌ |
| **Impact jika di-test** | Agent bisa lihat FRT countdown dengan benar. Tapi warna SLA di Chat List tidak sesuai PRD US-14. RLT & Wait Time muncul sebagai badge tanpa threshold. |
| **Testing Guidance** | 1. Verifikasi FRT countdown: mulai dari inbound, stop saat first agent reply. Cross-check dengan `frtMs` dari BE. 2. Verifikasi RLT live timer: office-hours-aware, pause di luar shift. 3. Verifikasi Wait Time: wall-clock, tidak pernah pause. 4. Verifikasi `FRT = Wait Time + RLT` constraint. 5. Catat bahwa SLA color threshold masih absolute time — tidak sesuai V2 Chat List US-14. Buat bug report jika diperlukan. |
| **Regression Risk** | Perubahan SLA engine bisa mempengaruhi RLT dan Wait Time karena share event source yang sama (`firstAgentReplyAt`, `firstAgentAssignmentAt`). |
| **Test Level** | Integration + E2E |

---

### L2 — Group Chat Lifecycle

| Aspek | Detail |
|---|---|
| **FE Status** | ❌ Open: FE sembunyikan semua SLA items untuk group chat (`isGroup ? [] : slaItems`). FRT & TTC tidak muncul sama sekali. |
| **Impact jika di-test** | Agent tidak bisa melihat SLA metrics untuk group chat sama sekali. WA Web Group TTC disabled (correct). Tapi FRT juga hilang (should be visible). |
| **Testing Guidance** | 1. Verifikasi bahwa group chat WA Web Group tidak menampilkan TTC (correct). 2. Verifikasi bahwa FRT untuk group chat tetap muncul (currently broken). 3. Verifikasi behavior saat group chat di-close: TTC tidak boleh infinite. TTC harus disabled secara sistem. 4. Buat bug: group chat FRT disembunyikan, padahal FRT harus tetap jalan. |
| **Regression Risk** | Jika lifecycle group chat diubah nanti (misalnya: group chat bisa di-resolve), dampak ke SLA TTC dan room history sangat besar. |
| **Test Level** | E2E (per channel type) |

---

### L3 — Navigation Model Overlap

| Aspek | Detail |
|---|---|
| **FE Status** | ⚠️ Implementasi hybrid: Your Inbox/All/Unassigned/Closed/Starred/Spam filter buttons + Channel/Team sidebar. Agent Pull "Get Conversation" button ada di Your Inbox. Team Inbox sidebar ada. |
| **Impact jika di-test** | Tiga model navigasi coexist. Agent bisa bingung karena punya "Your Inbox", "Team Inbox sidebar", dan "Get Conversation" sebagai 3 cara berbeda untuk mulai kerja. |
| **Testing Guidance** | 1. Test bahwa "Your Inbox" hanya menampilkan conversation yang di-assign ke current user. 2. Test bahwa "Get Conversation" menarik dari queue Unassigned dan auto-assign. 3. Test bahwa Team Inbox sidebar men-scope chat list berdasarkan team. 4. Test bahwa kombinasi filter (Inbox + Channel + Team + RBAC) menghasilkan irisan yang benar. 5. Test bahwa Agent tidak melihat "Unassigned" tab (RBAC restriction). 6. Test "Assign to Me" alternate access path (notification, quick action). |
| **Regression Risk** | Perubahan di navigation PRD bisa mengubah default landing atau visibility scope untuk Agent vs Supervisor. |
| **Test Level** | E2E + RBAC matrix |

---

### L4 — Assignee & Collaborator

| Aspek | Detail |
|---|---|
| **FE Status** | ⚠️ Partial: Multi-assignee via participants ✅. Konsep "collaborator" tidak ada ❌. Move reset assignee tidak terlihat di FE. |
| **Impact jika di-test** | Agent bisa assign/unassign multiple participants. Tapi tidak ada perbedaan antara "Assignee" dan "Collaborator". Semua participant diperlakukan sama. |
| **Testing Guidance** | 1. Test multi-assignee: assign 2+ agent ke satu conversation, verifikasi semua muncul di chips. 2. Test unassign: hapus satu participant, verifikasi yang lain tetap. 3. Test unassign semua → status "Unassigned". 4. Test move conversation: apakah assignee di-reset? (butuh akses ke Reassign Account Channel). 5. Catat: collaborator fitur tidak ada — tidak bisa di-test. |
| **Regression Risk** | Perubahan di participants logic akan berdampak ke Conversation Detail, Room header, Chat List, Ticket participants. |
| **Test Level** | Integration + E2E |

---

### L5 — Relational Group vs Session vs Ticket

| Aspek | Detail |
|---|---|
| **FE Status** | ❌ Open: Relational Conversation tidak diimplementasi. Group chat handling ada (isGroup, PrimaryMessageSelector) tapi untuk konteks ticket creation, bukan relasi Parent-Child. |
| **Impact jika di-test** | Fitur ini belum bisa di-test secara E2E karena belum ada UI. |
| **Testing Guidance** | 1. Belum bisa di-test (undeveloped). 2. Siapkan test scenario untuk nanti: grouping integrity, SLA aggregate untuk Primary+Child, ticket flagging untuk child conversation. |
| **Regression Risk** | Ketika diimplementasi, relational grouping akan berdampak ke: Chat List sorting/aggregation, SLA metrics (individual vs aggregate), ticket creation, room tabs, custom attributes matching. |
| **Test Level** | N/A (undeveloped) |

---

### L6 — Custom Attributes

| Aspek | Detail |
|---|---|
| **FE Status** | ❓ Belum dive dalam. Yang terlihat: `ConversationAttributesContent` ada, `custom-attribute/` folder ada (read-only fields, select, date, text inputs). Ada konflik read-only vs editable. |
| **Impact jika di-test** | Agent bisa melihat attributes. Tapi tidak jelas mana yang editable oleh Agent vs Admin vs API. |
| **Testing Guidance** | 1. Test read-only attributes dari Open API: muncul, tidak bisa diedit. 2. Test custom fields: apakah bisa diedit oleh Agent? Atau hanya Admin? 3. Jika attribute berubah, apakah relational matching terpengaruh? (butuh Relational PRD). |
| **Regression Risk** | Perubahan attribute ownership akan berdampak ke Relational Conversation matching. |
| **Test Level** | E2E + RBAC |

---

### L7 — Snooze vs Reminder vs Auto-Reply

| Aspek | Detail |
|---|---|
| **FE Status** | ❌ Open: Snooze Conversation tidak ada. Auto-reply Templates tidak ada. Room Reminder tidak ada di header. Ticket Snooze ada (tapi berbeda konteks). |
| **Impact jika di-test** | Fitur ini belum bisa di-test secara E2E. Yang bisa di-test: ticket snooze behavior, macro templates. |
| **Testing Guidance** | 1. Untuk sekarang, test ticket snooze behavior (ada di FE). 2. Test macro `/shortcut` sebagai pengganti quick reply (bukan auto-reply). 3. Catat: conversation snooze, auto-reply, dan room reminder belum bisa di-test. |
| **Regression Risk** | Ketika diimplementasi, interaction antara snooze, reminder, dan auto-reply bisa kompleks: precedence rule, SLA pause, notification deduplication. |
| **Test Level** | N/A (undeveloped, kecuali ticket snooze) |

---

### L8 — Reopen vs New Session

| Aspek | Detail |
|---|---|
| **FE Status** | ⚠️ FE punya Close dan Reopen buttons di Room Header. Tapi behavior reopen di backend tidak terlihat dari FE. Apakah reopen = new session (Session PRD), reopen same conversation (Room PRD), atau modal (Reassign PRD)? |
| **Impact jika di-test** | Agent klik "Reopen" → conversation jadi open lagi. Tapi apa yang terjadi dengan SLA? New cycle? Resume? FRT reset? Tergantung implementasi backend. |
| **Testing Guidance** | 1. Test Close → conversation status jadi `closed`. 2. Test Reopen → conversation status jadi `open`. 3. Test inbound message after close → apakah auto-reopen atau new session? 4. Verifikasi SLA behavior after reopen: FRT new cycle? TTC resume? RLT reset? 5. Catat: perlu konfirmasi PM/Engineering untuk reopen behavior yang benar. |
| **Regression Risk** | Tergantung PRD mana yang diikuti (Session, Room, atau Reassign). Validasi harus satu arah. |
| **Test Level** | E2E + Backend integration |

---

### L9 — Agent Availability

| Aspek | Detail |
|---|---|
| **FE Status** | ⚠️ Partial: Team Member Presence ✅ (AWAY/READY, idle detection, away reasons CRUD, shift scheduler). Auto-reply Templates ❌. |
| **Impact jika di-test** | Agent bisa set status AWAY. Tapi auto-reply belum ada — jadi ketika agent AWAY, tidak ada bot auto-reply yang terkirim. Status indicator di sidebar berfungsi. |
| **Testing Guidance** | 1. Test AWAY/READY toggle: status berubah di sidebar. 2. Test idle detection: after X minutes idle → auto-AWAY. 3. Test away reasons CRUD: create, edit, delete. 4. Test bahwa saat AWAY, action buttons di Room header disabled (reopen, dll). 5. Test shift scheduling: outside hours → auto-AWAY? 6. Catat: auto-reply tidak ada — tidak bisa di-test. |
| **Regression Risk** | Auto-reply (saat diimplementasi) harus align dengan definisi "available" dari Presence PRD. Saat ini ada mismatch: Presence PRD anggap "Away = Online", tapi Auto-Reply PRD anggap "Away = Unavailable". |
| **Test Level** | E2E + Integration |

---

### L10 — WA Web Group Mention

| Aspek | Detail |
|---|---|
| **FE Status** | ❌ Open: Tidak ada @mention picker di chat input. Hanya macro `/shortcut` yang ada sebagai shortcut tool. |
| **Impact jika di-test** | Fitur ini belum bisa di-test. |
| **Testing Guidance** | 1. Belum bisa di-test (undeveloped). 2. Siapkan test scenario untuk nanti: @mention picker UI, participant list, 100 mentions limit, invalid mention drop. |
| **Regression Risk** | Ketika diimplementasi, mention akan mempengaruhi chat input component, group chat rendering, notification system. |
| **Test Level** | N/A (undeveloped) |

---

### Prioritas Testing Berdasarkan FE Readiness

| Prioritas | Area | Siap di-test? | Test Level |
|---|---|---|---|
| 🔴 **P0** | FRT/TTC/RLT/Wait Time display & live timer | ✅ **SIAP** | E2E + Integration |
| 🔴 **P0** | SLA color threshold (Chat List) | ⚠️ **MISMATCH** (FE vs PRD) | E2E + UI |
| 🔴 **P0** | Group chat SLA (FRT hilang) | ⚠️ **BUG DITEMUKAN** | E2E |
| 🟡 **P1** | Chat List filter (Your Inbox, All, Unassigned, dll) | ✅ **SIAP** | E2E + RBAC |
| 🟡 **P1** | Assignee/participants (assign, unassign, multi) | ✅ **SIAP** | E2E |
| 🟡 **P1** | Close/Reopen behavior | ⚠️ **BACKEND TERGANTUNG** | E2E + Integration |
| 🟡 **P1** | Agent Presence (AWAY/READY, idle) | ✅ **SIAP** | E2E |
| 🟡 **P1** | Multiple Ticket from Bubble | ✅ **SIAP** | E2E |
| 🟡 **P1** | Reassign Account Channel | ✅ **SIAP** | E2E |
| 🟢 **P2** | Navigation model (Your Inbox vs Team Inbox) | ✅ **SIAP** | E2E + RBAC |
| 🟢 **P2** | Offline Report (RLT/Wait Time columns) | ✅ **SIAP** | Integration |
| ⏳ **Future** | Relational Conversation | ❌ **UNDEVELOPED** | — |
| ⏳ **Future** | Snooze Conversation | ❌ **UNDEVELOPED** | — |
| ⏳ **Future** | Auto-reply Templates | ❌ **UNDEVELOPED** | — |
| ⏳ **Future** | WhatsApp Group Mention | ❌ **UNDEVELOPED** | — |
| ⏳ **Future** | Collaborator (Assignee & Collaborators) | ❌ **UNDEVELOPED** | — |

---

## Chat List Cross-PRD Analysis (V2-aligned)

### Status V2 vs Implementasi

V2 Chat List v1.1 (file 8) mendefinisikan filter buttons dengan status `Open` / `Closed`, bukan tabs `Unassigned/Ongoing/Resolved` seperti V1.  
**Implementasi FE sudah sesuai V2.**

### 7 Critical Gaps (V2 vs FE)

| # | Gap | Detail | V2 Source |
| - | --- | ------ | --------- |
| 1 | **SLA color threshold mismatch** | V2 pakai percentage (50%/10%), FE masih absolute time | Chat List v1.1 (file 8, US-14) |
| 2 | **"Assign to Me" inaccessible for Agent** | US-3 letakkan tombol di Unassigned, tapi RBAC sembunyikan Unassigned dari Agent. Agent tidak punya akses ke fitur ini | Chat List v1.1 (file 8), Omnichannel (file 4) |
| 3 | **SLA threshold hanya di Chat List V2** | Green/Yellow/Red threshold >50%, ≤50%&>10%, ≤10% hanya didefinisikan di Chat List V2 | Chat List V2 (file 8) |
| 4 | **Hold vs Snooze ambiguity** | V2 Hold indicator terpisah dari Snooze (undeveloped). Tidak jelas apakah coexist atau replace | Chat List V2 (file 8), Snooze V2 (file 16) |
| 5 | **Sorting** | V2: Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical — **FE sudah match** | Chat List V2 (file 8) |
| 6 | **Hover preview (US-5) depends on Ticket System** | Mini profile (sender info + last 3 tickets) link ke Ticket System | Chat List V2 (file 8) |
| 7 | **Search scope** | Search scoped by active RBAC filter (Your Inbox, All, Channel, Team) | V2 Navigation (file 5, 6) |

### 3-PRD Integration Mapping (V2)

Chat List harus dipahami sebagai irisan:

`ChatList = InboxFilter INTERSECT ChannelFilter INTERSECT TeamFilter INTERSECT RBACScope`

#### Per Section:

| Section | Chat List Impact | V2 Status |
| ------- | ---------------- | --------- |
| **Inbox** (Your Inbox, All, Unassigned, Closed, Starred, Spam, Junk) | V2 filter buttons sudah match dengan FE implementation | ✅ Aligned |
| **Channel** (WhatsApp, Live Chat, etc.) | Channel filter sebagai parent set. FE menampilkan badge + icon per item | ✅ Aligned |
| **Team** (Team Inbox scope) | Team filter membatasi visible conversations | ✅ Aligned |
| **RBAC** (Agent vs Supervisor vs Admin) | Agent tidak bisa akses Unassigned tab → "Assign to Me" tidak bisa diakses | ⚠️ Need alternate path |

### Implikasi QA

1. **SLA color**: QA harus tes transisi green→yellow→red dengan timing yang tepat. Konfigurasi threshold via Settings
2. **Agent "Assign to Me"**: WAJIB tes alternate access path (notification/waiting list/temp team-scoped Unassigned)
3. **Hold vs Snooze**: Tes overlap state — chat yang di-hold lalu di-snooze — priority mana yang nampak di chat list
4. **Sort order persistence**: Sorting harus persist per session — tes bahwa sorting tidak reset saat pindah filter/role
5. **Hover preview error**: Tes behavior hover saat Ticket System down — harus graceful
6. **Search scope**: Tes search dari Your Inbox vs All vs team-scoped — pastikan hasil sesuai scope

---

## Chat List Recommendations (V2)

### 1. Harmonisasi Model

FE sudah aligned dengan V2 (button-based filters, Open/Closed). Tidak perlu perubahan model navigasi. Fokus ke penyelesaian gap SLA color threshold.

### 2. Sinkronkan SLA Threshold

Default SLA threshold dari V2 Chat List (50%/10%) harus menjadi **baseline tunggal**:

| Warna | Threshold | Arti |
| ----- | --------- | ---- |
| Hijau | >50% sisa waktu | Aman |
| Kuning | ≤50% & >10% sisa waktu | Mendekati deadline |
| Merah | ≤10% atau overdue | Kritis / terlambat |

Threshold harus **configurable via Settings** (per V2 US-14). SLA metric (FRT/TTC) ditentukan oleh SLA Engine Contract.

### 3. Definisikan Relasi Hold ↔ Snooze

| Konsep | Mekanisme | Scope |
| ------ | --------- | ----- |
| **Hold** | Quick action icon di chat card + tooltip (siapa + kapan). Filterable. | Chat List UI |
| **Snooze** | Hide from active list + wake-up timer. Auto-unsnooze on inbound message. | Full feature (undeveloped) |

Keputusan yang perlu diambil:
- Apakah Hold dan Snooze **coexist** atau **saling replace**?
- Jika coexist: saat chat di-hold lalu di-snooze, indicator mana yang muncul di chat list? (Rekomendasi: Hold indicator tetap visible, Snooze hanya hide dari active view)
- Jika replace: Hold adalah versi ringan dari Snooze. Saat Snooze developed, Hold di-deprecate.

### 4. Pastikan "Assign to Me" Accessible untuk Agent

Meski tab/filter Unassigned disembunyikan untuk role Agent, Agent harus tetap bisa **claim chat dari jalur lain**:

- Notification system (incoming chat notification → inline Assign to Me)
- Team-scoped Unassigned view (temporary, hanya menampilkan Unassigned dalam team Agent)
- Quick action dari chat card yang sedang diakses
- Waiting list / queue UI

Tanpa alternate access path ini, US-3 (Assign to Me) hanya bisa dipakai oleh Supervisor dan Admin — setengah user base kehilangan akses.

### 5. Search & Filter Harus Scoped oleh RBAC

Search bar dan advanced filters harus dibatasi oleh RBAC scope yang sedang aktif:

- Search dari `Your Inbox` → hanya mencari dalam assignment Agent sendiri
- Search dari `All` (jika visible) → company-wide, terbatas role
- Search dari `Channel` view → hanya dalam channel yang dipilih
- Search dari `Team` view → hanya dalam team scope

Tidak boleh ada search result yang melebihi visibility filter yang sedang aktif.

---

## Room Cross-PRD Analysis (V2-aligned)

### Status V2 vs Implementasi

V2 Room v1.1 (file 9) sudah menggunakan status model `open` / `closed` dan assignment via `participants`.  
**Implementasi FE sudah aligned dengan V2.** V1 legacy wording tidak relevan.

### Cross-PRD Impact Mapping (V2)

| Area | Room Impact | V2 Source |
| ---- | ----------- | --------- |
| Chat List | Room actions mengubah state row: Close, Hold, Reminder, Pin, Star/Priority, Tag, assignment | Chat List v1.1 (file 8) |
| Team Navigation | Room visibility dan action permission harus mengikuti team scope user | Team Inbox Nav v2.1 (file 6) |
| Channel Navigation | Room feature availability tergantung selected channel/accountChannel capability | Channel (V2 file 12) |
| Omnichannel Navigation | Room adalah detail view dari conversation list hasil filter | Omnichannel Nav v1.2 (file 5) |
| Omnichannel Inbox | Socket, delivery status, channel identity, assignment, reopen, message lifecycle | Omnichannel v1.1 (file 4) |
| Ticket System | Room create/link ticket | Ticketing V2 (file 14) |

### 14 Critical Findings (vs V2)

| # | Finding | Detail | V2 Source |
| - | ------- | ------ | --------- |
| 1 | **Status model** | V2 Room uses `open/closed`, FE implementasi match | ✅ Aligned |
| 2 | **Close button** | V2 defines Close = transition to `closed` | ✅ Clear |
| 3 | **Assignment source** | V2 confirms `participants` = assignee, no root `assignedTo` | ✅ Aligned |
| 4 | **Hold/Snooze/SLA conflict** | V2 Room says Hold pauses SLA. V2 Snooze says no pause. 3-way conflict unresolved | ❌ Open |
| 5 | **Reopen behavior conflict** | V2 Room says reopen. V2 Sessions says new session. V2 Reassign says modal | ❌ Open |
| 6 | **Room actions mutate Chat List** | Close, Hold, Reminder, Pin, Star/Priority, Tag, assignment must update Chat List via socket | ⚠️ Need socket validation |
| 7 | **Room search vs Chat List search** | Room search thread-local; Chat List search RBAC-scoped | ⚠️ Scope validation |
| 8 | **Attachment size** | V2 Room v1.1 says max 100MB | ✅ Clear |
| 9 | **Reminder delivery** | V2 Room v1.1 defines reminder modal; notification behavior unspecified | ⚠️ Need clarification |
| 10 | **Typing indicator** | V2 defines agent/customer typing visibility | ✅ Defined |
| 11 | **Multi-select message limit** | V2 Ticketing defines max linked messages | ✅ 50 per V2 |
| 12 | **Quick Reply template** | V2 Room defines text area max 2000 chars | ✅ Clear |
| 13 | **Inline reply-to** | V2 Room defines reply-to behavior | ✅ Defined |
| 14 | **Channel capability matrix** | V2 Omnichannel defines channel-dependent features | ⚠️ Need mapping |

### Room-Specific QA Clarification List

1. Confirm canonical status wording: `open/closed` vs `ongoing/resolved`.
2. Confirm whether Room `Close` equals conversation transition to `closed`.
3. Confirm source of `Opened by` and `Closed by`: conversation doc, activity log, message event, or audit collection.
4. Confirm Hold/Snooze/SLA behavior: does Hold pause SLA, and does Snooze pause or only hide?
5. Confirm closed inbound behavior: reopen same conversation, create new session, or show reopen modal.
6. Confirm attachment size limit: `15MB` or `100MB`.
7. Confirm full RBAC action matrix for Resolve/Close, Hold, alias change, delete, pin, tag, ticket create, screenshot.
8. Confirm channel capability matrix for Room actions and indicators.
9. Confirm reminder delivery channels and offline/blocked-notification behavior.
10. Confirm Room thread search implementation: client-side or server-side for 10K+ messages.
11. Confirm max selected messages for bulk copy and ticket creation.
12. Confirm Quick Reply template max character and truncation/error behavior.
13. Confirm inline reply-to fallback for deleted/hidden/expired referenced messages.
14. Confirm timezone source for relative/full timestamps.
15. Confirm pin conversation limit and sort order in Chat List.
16. Confirm final keyboard shortcut list for WCAG testing.
17. Confirm feature flag/add-on toggle mechanism for screenshot and channel-specific capabilities in staging.

### Room Implementation Alignment Rules (V2)

1. Treat `open/closed` as V2 canonical (V1 `Ongoing/Resolved` deprecated).
2. Treat `participants` as assignee source for Room header and assignment workflow.
3. Treat Room search and Chat List search as separate features with separate scope rules.
4. Treat any Room action that changes conversation metadata as requiring Chat List socket refresh.
5. Treat channel-dependent Room features as disabled/hidden unless account-channel capability confirms support.
6. Treat Ticket System failure as a required fallback path because Room and Chat List both depend on ticket data.

---

## Detail Cross-PRD Analysis (V2-aligned)

### Status V2 vs Implementasi

V2 Detail v2.1 (file 10) defines metadata, assignee, SLA, reminder, attributes, tags, notes, pinned messages, history, related conversations, broadcast history, and audit log panel.  
Uses `Assigned` / `Unassigned` as **assignment state**, while `status: open/closed`.  
**Implementasi FE sudah aligned dengan V2.**

### Cross-PRD Impact Mapping (V2)

| Area | Detail Impact | V2 Source |
| ---- | ------------- | --------- |
| Chat List | Tags, assignee, team, reminder, pinned messages, SLA state, and status must reflect in list row | Chat List v1.1 (file 8) |
| Chat Room | Shares same metadata: participants, notes, pinned messages, media/files, reminder, SLA, assignment | Room v1.1 (file 9) |
| Team Navigation | Team Inbox is single mandatory scope and controls visible conversations/actions | Team Inbox Nav v2.1 (file 6) |
| Channel Navigation | Attributes and client fields depend on selected channel/accountChannel | Sessions v1.1 (file 12) |
| Omnichannel Navigation | Detail panel is opened from filtered conversation list and must respect active RBAC scope | Omnichannel Nav v1.2 (file 5) |
| Omnichannel Inbox | Socket updates, assignment, audit, channel identity, SLA, history, lifecycle events | Omnichannel v1.1 (file 4) |
| Ticket / Broadcast / Attributes | Detail adds dependencies beyond base conversation: broadcast history, related conversations, external attributes | Ticketing V2 (file 14), Custom Attributes v1.0 (file 11) |

### 12 Critical Findings (vs V2)

| # | Finding | Detail | V2 Source | Status |
| - | ------- | ------ | --------- | ------ |
| 1 | **Assignment state vs status** | V2 Detail uses `Assigned/Unassigned` as assignment state; `status: open/closed` | Detail v2.1 (file 10) | ✅ Aligned |
| 2 | **Participants source** | V2 Detail supports multi-assignee via `participants` | Detail v2.1 (file 10) | ✅ Aligned |
| 3 | **Team Inbox mandatory single** | V2 Detail requires one Team Inbox; FE has single `team` object | Detail v2.1 (file 10) | ✅ Aligned |
| 4 | **SLA metric fragmented** | V2 Detail defines FRT/TTC; V2 Chat List defines 50%/10% threshold; V2 Room defines Hold pause | Need SLA Engine Contract | ❌ Open |
| 5 | **FRT visibility** | V2 Detail v2.1: FRT countdown muncul saat Unassigned. FE menampilkan FRT meskipun assigned — **FE lebih maju** | Detail v2.1 (file 10) | ⚠️ V2 outdated |
| 6 | **Reminder visibility** | V2 Detail says reminder only visible to creator. V2 Room implies shared event | Detail v2.1 (file 10) | ❌ Unresolved |
| 7 | **Tag mutation → Chat List** | V2 Detail allows add/edit/remove tags and WA sync ≤5s | Detail v2.1 (file 10) | ✅ Aligned |
| 8 | **Custom attributes ownership** | V2 Detail: API attributes read-only. V2 Custom Attributes (file 11): `ui_editable` + Collections | Detail v2.1 (file 10), Custom Attributes v1.0 (file 11) | ⚠️ Partial |
| 9 | **Conversation history** | V2 Detail wants all past conversations; group room history unavailable | Detail v2.1 (file 10) | ⚠️ Group TBD |
| 10 | **Related Conversations vs Relational** | V2 Detail supports linked related conversations; V2 Relational (file 19) supports automatic grouping | Detail v2.1 (file 10), Relational v1.0 (file 19) | ❌ Open |
| 11 | **Broadcast History RBAC** | V2 Detail exposes broadcast history in conversation panel | Detail v2.1 (file 10) | ⚠️ Need RBAC validation |
| 12 | **Attachment max size** | V2 Room v1.1 (file 9): 100MB. V2 Detail v2.1 (file 10): 25MB — **conflict** | Room v1.1 (file 9), Detail v2.1 (file 10) | ❌ Unresolved |

### Detail-Specific QA Clarification List

1. Confirm canonical separation: `status = open/closed`, `assignmentState = assigned/unassigned` (V2 aligned).
2. Confirm `participants` as the only assignee source for Detail chips and assignment updates.
3. Confirm `Opened by` / `Closed by` source: conversation doc, audit log, or lifecycle event collection.
4. Confirm FRT/TTC source and whether values are computed only or cached/persisted elsewhere.
5. Confirm whether FRT disappears after assignment or remains visible (V2 says disappears, FE says visible).
6. Confirm SLA color threshold reuse from V2 Chat List (50%/10%) in Detail.
7. Confirm Hold/Snooze effect on Detail SLA countdown.
8. Confirm reminder visibility: creator-only, assigned participants, team-wide, or supervisor-visible.
9. Confirm tag sync source of truth and conflict behavior if WA sync fails or is delayed >5s.
10. Confirm custom attribute ownership: Open API read-only, admin-configured editable (`ui_editable`), agent-editable P2.
11. Confirm history grouping key: contact referenceId, phone number, email, sessionDetails, or related conversation graph.
12. Confirm group chat history behavior (V2 limitation: room history unavailable for group chats).
13. Confirm Related Conversations vs Relational Conversation: manual link, automatic match, or both.
14. Confirm Broadcast History RBAC and whether agents can see broadcast recipient metadata.
15. Confirm attachment max size: 100MB (V2 Room v1.1) vs 25MB (V2 Detail v2.1).
16. Confirm permission matrix for assign, tags, notes, pins, related conversations, broadcast history, audit logs, and custom fields.

### Detail Implementation Alignment Rules

1. Treat `Assigned/Unassigned` as assignment state derived from `participants`, not as conversation status (V2 canonical).
2. Treat `team` as the single Team Inbox source for Detail and navigation scope.
3. Treat Detail FRT/TTC as SLA metric labels; color threshold comes from V2 Chat List unless SLA Engine Contract overrides.
4. Treat Detail reminder as creator-specific until PM clarifies shared/team visibility.
5. Treat tag, assignee, reminder, pinned, and team mutations as Chat List socket refresh triggers.
6. Treat Detail history, related conversations, and broadcast history as RBAC-sensitive panels requiring server-side access enforcement.
