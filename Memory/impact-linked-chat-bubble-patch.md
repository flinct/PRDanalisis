# Impact Analysis — Ticketing Patch: Linked Chat Bubble

> **PRD Source:** `PRD/Ticket/PRD Ticket - linked chat bubble.md` (V1 — tapi fitur ini tidak berubah di V2, masih relevan)
> **FE:** `apps/omnichannel` (v2.5.0)
> **BE:** `omnichannel-satuinbox-be` (conversation-service + ticket-service)
> **Dibuat:** 2026-05-25

---

## 1. Ringkasan

PRD patch ini menambahkan 4 kemampuan baru ke fitur linked chat bubble yang sudah ada:

| # | Kemampuan Baru | US | FE Saat Ini | BE Saat Ini |
|---|---------------|----|-------------|-------------|
| 1 | **Append** bubble ke existing active ticket | US-002 | ❌ Hanya "Buat Tiket" (create new) | ❌ `CreateTicketRequest.messageIds` hanya untuk create |
| 2 | **Remove** linked bubble dari active ticket | US-004 | ❌ `MessageCard` read-only, no remove | ❌ No remove endpoint |
| 3 | **Clickable bubble** → conversation thread panel | US-005, US-006 | ❌ Static card, no panel switch | ❌ No panel state management |
| 4 | **Reply-based inbound sync** | US-007, US-008 | ❌ No auto-quote or sync | ❌ No reply-reference matching |

---

## 2. Yang SUDAH Ada (Tidak Berubah)

| Komponen | Status | File |
|----------|--------|------|
| Create ticket from selected messages | ✅ | `CreateTicketDraftsModal`, `CreateTicketConversationModal` |
| Bubble linked-ticket badge ("Lihat Tiket") | ✅ | `Buble.tsx` → `TicketBadgeSection` |
| Duplicate bubble detection | ✅ | `hasMessagesWithTicket` check |
| Linked messages display in ticket detail | ✅ | `LinkedMessagesSection`, `MessageCard` |
| Linked conversation display in ticket detail | ✅ | `LinkedConversationSection` |
| Linked tickets display in conversation detail | ✅ | `ConversationLinkedTicketsContent`, `TicketCard` |
| Max 50 linked messages limit | ✅ | Ticket data model `linkedBubbleIds` |
| Ticket creation from conversation (messageIds) | ✅ | `CreateTicketRequest.messageIds` |
| Auditor: create ticket | ✅ | `useActionCreateTicket` |
| RBAC: ticket create/view/edit permissions | ✅ | `proxy.ts`, `useCanCloseTicket` |

---

## 3. Yang HARUS DIUPDATE — Impact Analysis

### 3.1 Append to Existing Active Ticket (US-002)

#### Perubahan di FE

| Area | File | Perubahan |
|------|------|-----------|
| Bubble selection action bar | `CreateTicketDraftsModal`? | Tambah opsi **"Tambahkan ke tiket"** di samping **"Buat Tiket"** saat ada eligible customer bubbles terpilih |
| Ticket selector | Baru | Picker modal yang hanya menampilkan active tickets dari conversation yang sama |
| Validation | `selectedMessages.some(msg => msg.hasTicket)` | Perlu diperluas: validasi juga untuk append (bubble not linked to DIFFERENT ticket, target ticket is active) |
| Toast/notification | Baru | Success toast "Bubble berhasil ditambahkan ke tiket", partial success summary |

#### Perubahan di BE

| Area | File/Endpoint | Perubahan |
|------|--------------|-----------|
| New endpoint | `POST /ticket/:id/linked-bubbles` | Append `messageIds` ke existing ticket |
| Validation | ticket-service | Validasi: ticket active, same conversation, max 50 limit, no duplicate, no cross-ticket |
| Audit | audit-service | Log `bubble_appended` dengan actor, time, ticket ID, message IDs |
| Idempotency | ticket-service | Duplicate append ignoring (skip if bubble already in target ticket) |

#### Impact Area

| Area | Dampak |
|------|--------|
| `ConversationLinkedTicketsContent` | Tidak berubah — tetap menampilkan semua tickets linked ke conversation |
| `LinkedMessagesSection` | Harus update jumlah linked messages setelah append |
| `MessageCard` | Tidak berubah |
| `ConversationChatDetails` | Tidak berubah |
| `TicketDetailsDrawer` | Harus refresh linked message count setelah append |

### 3.2 Remove Linked Bubble (US-004)

#### Perubahan di FE

| Area | File | Perubahan |
|------|------|-----------|
| MessageCard / LinkedMessagesSection | `MessageCard.tsx`, `LinkedMessagesSection` | Tambah icon remove (X) + confirmation dialog |
| Reply composer disable state | `TicketChatRoomInput.tsx` | Jika last bubble di-remove, disable "Balas ke pelanggan", show **"Tambahkan bubble pelanggan terlebih dahulu"** |
| Quote source recalculation | `TicketChatRoom.tsx` | Recomputed latest linked customer bubble sebagai new quote source |

#### Perubahan di BE

| Area | File/Endpoint | Perubahan |
|------|--------------|-----------|
| New endpoint | `DELETE /ticket/:id/linked-bubbles/:messageId` | Remove single linked bubble |
| Recalculate quote source | ticket-service | Auto-set `latestLinkedCustomerBubbleId` ke next latest |
| Audit | audit-service | Log `bubble_removed` |
| Validation | ticket-service | Ticket must be active. Bubble must belong to this ticket |

#### Impact Area

| Area | Dampak |
|------|--------|
| `TicketChatRoom` | Jika remove last bubble, "Balas ke pelanggan" disabled. Harus real-time update |
| `TicketDetailsDrawer` | LinkedMessagesSection refresh, quote source hint update |
| `ConversationChatRoom` | Jika bubble di-remove, `hasTicket` pada message di conversation tetap true (bubble tetap linked, hanya di-unlink dari ticket) — **perlu klarifikasi: apakah `hasTicket` ikut di-reset?** |

> **⚠️ Open Question:** Apakah remove dari ticket juga menghapus `hasTicket` flag dari message di conversation? PRD bilang "bubble is detached from the ticket" — tapi tidak jelas apakah visual badge "Lihat Tiket" di conversation juga hilang. Jika hanya unlink secara internal, badge tetap muncul tapi link-nya mati (dead link). Perlu keputusan.

### 3.3 Clickable Linked Bubble → Conversation Thread Panel (US-005, US-006)

#### Perubahan di FE

| Area | File | Perubahan |
|------|------|-----------|
| MessageCard | `MessageCard.tsx` | Ubah dari static card jadi clickable. Click → buka `conversation_thread` panel |
| Panel mode switching | `TicketDetailsDrawer.tsx` | Tambah state `panelMode: 'ticket_detail' | 'conversation_thread'`, `panelHighlightBubbleId` |
| Conversation thread panel | Baru (atau reuse `ConversationChatRoom`) | Render conversation thread untuk source conversation, auto-scroll ke source bubble, highlight |
| Back action | `TicketDetailsDrawer.tsx` | **"Kembali ke detail tiket"** — restore ticket detail panel tanpa lose state |
| Append from thread panel | Conversation thread panel | Tambah action **"Tambahkan ke tiket"** untuk eligible bubbles di thread panel |

#### Perubahan di BE

| Area | File/Endpoint | Perubahan |
|------|--------------|-----------|
| None new | — | Conversation thread data sudah ada via `GET /conversation/:id/messages`. Panel mode switching adalah state FE-side. |
| Audit (panel open) | audit-service | Log `linked_bubble_navigated` opsional |

#### Impact Area — SIGNIFICANT

| Area | Dampak |
|------|--------|
| `TicketDetailsDrawer.tsx` | **Perubahan besar.** Drawer harus support 2 mode: `ticket_detail` (existing) dan `conversation_thread` (baru). State management untuk: panel mode, highlight bubble ID, scroll position |
| `TicketChatRoom.tsx` / `TicketChatRoomContainer.tsx` | Jika panel switch ke `conversation_thread`, ticket chat room di kiri harus tetap visible. Hanya sidebar kanan yang berubah |
| `ConversationChatRoomContainer.tsx` | Bisa di-reuse untuk thread panel. Tapi perlu di-extract agar bisa dipakai di 2 konteks (inbox standalone vs embedded di ticket drawer) |
| `Message store` | Jika conversation thread panel dibuka dari ticket, message store harus di-scope per-usage (jangan overlap dengan inbox message store) |

> **⚠️ Risiko Tinggi:** Panel mode switching adalah perubahan arsitektural. `TicketDetailsDrawer` saat ini monolithic (1711 lines). Injecting panel switching + conversation thread rendering di dalamnya perlu refactor signifikan.

### 3.4 Reply-Based Inbound Sync (US-007, US-008)

#### Perubahan di FE

| Area | File | Perubahan |
|------|------|-----------|
| Ticket reply composer | `TicketChatRoom.tsx` | Quote source hint: show which bubble will be quoted. **"Membalas ke bubble dari {timestamp}"** |
| Outbound message send | `useTicketMessageActions.ts` | Untuk channel support reply reference, attach `inboundReplyReferenceId` = latest linked customer bubble ID |
| Auto-sync indicator | `TicketChatRoomBubble.tsx` | Badge "Tersinkronisasi dari percakapan" untuk inbound messages yang auto-linked |
| Empty bubble state | `TicketChatRoomInput.tsx` | Jika no linked customer bubble → disable "Balas ke pelanggan", show helper text |

#### Perubahan di BE

| Area | File/Endpoint | Perubahan |
|------|--------------|-----------|
| Inbound message handling | `message.service.ts` (conversation-service) | Deteksi reply reference → cari ticket outbound message → jika ketemu dan ticket active → auto-link inbound ke ticket |
| New logic | `conversation-service` or `ticket-service` | **Cross-service coordination.** Inbound datang di conversation-service, perlu cek ke ticket-service apakah ada ticket yang match |
| RabbitMQ pattern baru? | — | Mungkin perlu event `message.inbound.reply_reference` yang di-consumer oleh ticket-service |
| Audit | audit-service | Log `reply_based_inbound_sync` |

#### Impact Area — COMPLEX

| Area | Dampak |
|------|--------|
| `useTicketMessageActions.ts` | Harus attach `inboundReplyReferenceId` ke outbound message. Perubahan di send flow |
| `TicketChatRoomBubble.tsx` | New visual indicator untuk auto-synced inbound messages |
| `message.service.ts` (conversation-service) | **Cross-service:** Inbound message processing perlu query ticket-service via gRPC untuk cek reply reference match |
| `ticket.service.ts` (ticket-service) | New method: `resolveReplyReference(conversationId, replyToMessageId) → ticketId?` |
| RabbitMQ | Mungkin perlu new exchange/queue untuk cross-service sync |

> **⚠️ Risiko Tinggi:** Reply-based sync adalah **cross-service concern** (conversation-service → ticket-service). Ini kompleks karena butuh gRPC call di hot path inbound message processing. Performa: decision harus <500ms P95.

---

## 4. Error Handler Mapping

| EH-ID | Kondisi | FE Impact | BE Impact | Current Status |
|-------|---------|-----------|-----------|----------------|
| EH-001 | Invalid bubble type (not customer) | Block create/append | Validasi di create/append endpoint | ✅ Already done for create. Need for append |
| EH-002 | Already linked to another ticket | Block + toast | Validasi uniqueness | ✅ Already done for create |
| EH-003 | Same ticket duplicate | Skip + warning toast | Ignore duplicate | ❌ New for append |
| EH-004 | No active ticket | Disable append flow | — | ❌ New |
| EH-005 | Closed ticket | Block append/remove | Validasi status active | ❌ New for remove |
| EH-006 | Limit reached (50) | Block append | Validasi max 50 | ❌ New for append |
| EH-007 | Remove last source → reply disabled | Disable "Balas ke pelanggan" | Recalculate quote source | ❌ New |
| EH-008 | Source bubble missing (deleted) | Show fallback message | — | ❌ New |
| EH-009 | Unsupported reply reference | No auto-sync badge | No action | ❌ New |
| EH-010 | Reference resolution failed | Internal log only | No action | ❌ New |
| EH-011 | Permission denied | Disable actions | RBAC check di endpoint | ✅ Already done for create |
| EH-012 | Save failure | Retry 3x + revert UI | Idempotent retry | ❌ New |

---

## 5. Edge Case Mapping

| EC-ID | Skenario | FE Impact | BE Impact | Status |
|-------|----------|-----------|-----------|--------|
| EC-001 | Mixed valid+invalid bubbles | Process valid, skip invalid, show summary | Partial success response | ❌ New |
| EC-002 | Remove latest linked bubble | Recalculate quote source | Update `latestLinkedCustomerBubbleId` | ❌ New |
| EC-003 | Remove all linked bubbles | Disable customer reply | Keep ticket active, no quote source | ❌ New |
| EC-004 | Linked bubble belongs to deleted ticket | Treat as linked, block reuse | Server-side integrity check | ❌ New |
| EC-005 | Multiple bubbles identical timestamp | Use latest created linkage | Tie-breaker logic | ❌ New |
| EC-006 | Inbound reply references older outbound | Append to same ticket, chronological order | Match by outbound message ID | ❌ New |
| EC-007 | Real-time ticket update while panel open | Disable append if ticket becomes inactive | — | ❌ New |
| EC-008 | Source conversation is group chat | Same rules, reply-based sync depends on channel | Group chat support | ❌ New |
| EC-009 | Bubble linked from different page state | Server-side validation wins, toast + refresh | Server decides final state | ❌ New |
| EC-010 | Inbound arrives after ticket resolved | Stay in Inbox only | Check ticket state at processing time | ❌ New |

---

## 6. QA Test Strategy

### 6.1 Test Levels & Prioritas

| Prioritas | Area | Test Level | Rationale |
|-----------|------|------------|-----------|
| 🔴 P0 | **Append to active ticket** (US-002) | E2E + Integration | Core new flow. High visibility. Multiple validation paths |
| 🔴 P0 | **Remove linked bubble** (US-004) | E2E + Integration | Data integrity risk. Quote source recalculation |
| 🔴 P0 | **Reply-based inbound sync** (US-008) | Integration + E2E | Cross-service. Real-time. Data loss risk |
| 🟡 P1 | **Clickable bubble → thread panel** (US-005) | E2E + UI | High UX impact. Panel state management |
| 🟡 P1 | **Append from thread panel** (US-006) | E2E | Extension of US-002. Regression on panel state |
| 🟡 P1 | **Error handlers** (EH-001 to EH-012) | Integration + E2E | Coverage for all failure modes |
| 🟢 P2 | **Edge cases** (EC-001 to EC-010) | E2E | Corner cases, concurrency, race conditions |
| 🟢 P2 | **Non-functional** (Performance, Security) | Load + Security | P95 targets, RBAC, tenant isolation |
| 🟢 P2 | **Audit logging** (US-009) | Integration | Verify all actions logged |
| 🟢 P2 | **Limit handling** (US-010) | E2E | Max 50 linked bubbles, scroll behavior |

### 6.2 Test Scenarios — Append (US-002)

| TC-ID | Scenario | Steps | Expected |
|-------|----------|-------|----------|
| APP-01 | Append single customer bubble to active ticket | 1. Select 1 customer bubble 2. Click "Tambahkan ke tiket" 3. Choose active ticket 4. Confirm | Bubble linked to ticket. Count incremented. Toast success |
| APP-02 | Append multiple customer bubbles | Select 3 customer bubbles → append to ticket | All 3 linked. Count +3 |
| APP-03 | Append with mixed valid + invalid | Select 2 customer bubbles + 1 agent message + 1 already-linked bubble | 2 customer bubbles linked. Others skipped. Summary: "2 berhasil, 2 dilewati" |
| APP-04 | Append to closed/resolved ticket | Select bubble → "Tambahkan ke tiket" → only active tickets shown | Closed ticket not selectable |
| APP-05 | Append when no active ticket exists | Select bubble → "Tambahkan ke tiket" | Disabled. Show "Belum ada tiket aktif" |
| APP-06 | Append bubble already linked to DIFFERENT ticket | Select bubble linked to other ticket → append | Blocked. "Bubble sudah terhubung ke tiket lain" |
| APP-07 | Append bubble already linked to SAME ticket | Select bubble already in this ticket → append | Skipped. Warning "Beberapa bubble sudah ada di tiket ini" |
| APP-08 | Append when limit reached (50/50) | Select bubble → append | Blocked. "Batas bubble tiket tercapai" |
| APP-09 | Append from conversation thread panel (opened from ticket) | 1. Open thread panel from ticket 2. Select bubbles 3. Append to same ticket | Bubbles added. Thread panel stays open. Linked count updates |
| APP-10 | Append from conversation thread panel when ticket becomes inactive | 1. Open thread panel 2. Another agent closes ticket 3. Try append | Blocked. "Tiket ini sudah selesai" |
| APP-11 | Permission denied (no ticket edit) | User without edit permission tries append | Action disabled/hidden. "Akses ditolak" |
| APP-12 | Save failure + retry | Simulate BE failure → retry 3x → still fail | UI reverts. "Gagal menyimpan perubahan. Coba lagi" |

### 6.3 Test Scenarios — Remove (US-004)

| TC-ID | Scenario | Steps | Expected |
|-------|----------|-------|----------|
| REM-01 | Remove single linked bubble | 1. Open ticket detail 2. Click remove on a bubble 3. Confirm | Bubble detached. Count -1. Audit log updated |
| REM-02 | Remove latest linked bubble (quote source) | Remove the most recent bubble | Next latest bubble becomes quote source. No modal |
| REM-03 | Remove all linked bubbles | Remove every linked bubble until 0 | "Balas ke pelanggan" disabled. "Tambahkan bubble pelanggan terlebih dahulu" |
| REM-04 | Remove from closed ticket | Try remove on Done/Resolved ticket | Blocked. "Hanya tiket aktif yang bisa diubah bubble-nya" |
| REM-05 | Remove + cancel confirmation | Click remove → cancel | Bubble remains. No change |
| REM-06 | Permission denied (no ticket edit) | User without edit permission | Remove action hidden/disabled |
| REM-07 | Save failure + retry | Simulate BE failure → retry 3x → still fail | UI reverts. Error toast |

### 6.4 Test Scenarios — Clickable Bubble Navigation (US-005, US-006)

| TC-ID | Scenario | Steps | Expected |
|-------|----------|-------|----------|
| NAV-01 | Click linked bubble → open thread panel | 1. Click linked bubble card in ticket detail | Right panel switches to conversation thread. Source bubble auto-scrolled + highlighted |
| NAV-02 | Back to ticket detail | Click "Kembali ke detail tiket" | Ticket detail panel restored. Chat room state preserved |
| NAV-03 | Click bubble from long list | Click bubble #45 of 50 | Thread panel opens. Correct bubble highlighted |
| NAV-04 | Source bubble missing (deleted) | Click bubble that was deleted from conversation | Panel opens but shows "Bubble sumber tidak ditemukan" |
| NAV-05 | Append from thread panel (happy path) | 1. Open thread panel 2. Select more bubbles 3. Append to ticket | Bubbles added. Panel stays open |
| NAV-06 | Thread panel with group chat conversation | Click bubble from group chat | Normal thread panel. Works if channel supports reply reference |
| NAV-07 | Keyboard accessibility | Tab to linked bubble → Enter | Opens thread panel. Focus on highlighted bubble |

### 6.5 Test Scenarios — Reply-Based Inbound Sync (US-007, US-008)

| TC-ID | Scenario | Steps | Expected |
|-------|----------|-------|----------|
| SYNC-01 | Send reply from ticket with linked bubble | 1. Active ticket with linked bubbles 2. Send "Balas ke pelanggan" 3. Channel supports reply reference | Outbound message quotes latest linked customer bubble |
| SYNC-02 | Send reply from ticket WITHOUT linked bubble | Active ticket, no linked bubbles → try reply | "Balas ke pelanggan" disabled. "Tambahkan bubble pelanggan terlebih dahulu" |
| SYNC-03 | Send reply on unsupported channel | Channel without reply reference → send reply | Message sent normally. No quote. No error |
| SYNC-04 | Inbound customer reply → auto-linked to active ticket | 1. Agent sent from ticket 2. Customer replies to that message 3. Reply reference match | Inbound appears in ticket room. Badge "Tersinkronisasi dari percakapan" |
| SYNC-05 | Inbound reply when ticket is resolved | Ticket Done/Resolved → customer replies | Message stays in Inbox only. No ticket sync |
| SYNC-06 | Inbound reply on unsupported channel | Channel without reply reference → customer replies | No auto-link. Normal conversation message. No sync badge |
| SYNC-07 | Reference resolution failed | Reply reference cannot be matched to any ticket outbound | Internal log. No auto-link. Normal conversation message |
| SYNC-08 | Multiple outbound from same ticket → customer replies to oldest | Reply ref matches older message → ticket still active | Appended to correct ticket. Chronological order |
| SYNC-09 | Quote source hint visible | Open "Balas ke pelanggan" composer | Brief hint: timestamp or preview of bubble being quoted |

### 6.6 Concurrency & Race Conditions

| TC-ID | Scenario | Steps | Expected |
|-------|----------|-------|----------|
| CON-01 | Two agents append to same ticket simultaneously | Both click append at same time | Both succeed (different bubbles). Total count = sum. No duplicates |
| CON-02 | Agent A appends, Agent B removes same bubble | A appends, B removes bubble just added by A | Server resolves: remove succeeds (bubble exists). A sees bubble removed on next load |
| CON-03 | Agent appends while ticket is being closed by another agent | Append API + Close API race | Close wins. Append fails "Tiket sudah selesai" |
| CON-04 | Inbound reply arrives during ticket status change | Reply processing + status change at same time | Ticket state at processing time decides. If resolved → no sync |
| CON-05 | Bulk append with concurrent edits | Append + stage change + tag edit | Last-write-wins per field. Linked bubbles not affected by other edits |

### 6.7 Regression — Existing Flows (Must NOT Break)

| TC-ID | Existing Flow | Verification |
|-------|---------------|-------------|
| REG-01 | Create ticket from selected bubbles (existing) | "Buat Tiket" still works. Selected messages still linked |
| REG-02 | Duplicate bubble detection for create | `hasMessagesWithTicket` still blocks re-creation |
| REG-03 | Ticket detail panel (existing) | `LinkedMessagesSection`, `LinkedConversationSection` still render correctly |
| REG-04 | Ticket room send message (existing) | Normal send still works. Internal notes still work |
| REG-05 | Conversation chat room bubble badge | "Lihat Tiket" badge still appears for linked bubbles |
| REG-06 | Max 50 limit for create | Create still blocks at 50 |
| REG-07 | Ticket close/reopen | Close still works. Reopen still creates new SLA cycle |
| REG-08 | Conversation-linked tickets display | `ConversationLinkedTicketsContent` still shows all linked tickets |

### 6.8 Data Integrity

| TC-ID | Check | Method |
|-------|-------|--------|
| INT-01 | One bubble = one ticket only | Automation: create bubble in ticket A, try to link to ticket B → blocked |
| INT-02 | Remove does not affect other ticket's linked bubbles | Remove bubble from ticket A → verify ticket B's linked bubbles unchanged |
| INT-03 | Append preserves existing linked bubbles | Append 2 new bubbles → verify existing 3 bubbles still there. Total = 5 |
| INT-04 | Quote source correctly recalculated after remove | Remove bubble #5 (latest) → verify quote source = bubble #4 |
| INT-05 | Inbound sync preserves original message ID | Verify inbound message in ticket has correct `conversationId` and `messageId` |

---

## 7. Cross-Feature Dependencies

| Dependency | Impact | Mitigation |
|------------|--------|------------|
| `TicketDetailsDrawer` (1711 lines) | Panel mode switching membutuhkan refactor | Extract panel state management. Separate `ticket_detail` dan `conversation_thread` sebagai komponen independen |
| `ConversationChatRoom` thread rendering | Reuse untuk embedded thread panel | Extract ke shared component. Pastikan store isolation (jangan overlap dengan inbox message store) |
| `message.service.ts` (conversation-service) | Cross-service gRPC call ke ticket-service untuk reply reference | New gRPC method `ResolveReplyReference` di `ticket.proto`. Latency budget <500ms P95 |
| `ticket.service.ts` | New method + audit events | Tambah `AppendLinkedBubbles`, `RemoveLinkedBubble`, `ResolveReplyReference` |
| `CreateTicketRequest.messageIds` | Append perlu format request berbeda | New DTO: `AppendBubblesRequest { ticketId, messageIds[] }` |
| Socket real-time | Jika ticket appended/removed, conversation side harus update | Socket event `ticket.bubbles.updated` ketika linked bubbles berubah |

---

## 8. Recommended Development Sequence

| Phase | Fitur | Estimated Complexity | Notes |
|-------|-------|---------------------|-------|
| **Phase 1** | Append to existing ticket (US-002) | 🟡 Medium | Backend: new endpoint + validation. FE: extend existing modal |
| **Phase 1** | Remove linked bubble (US-004) | 🟢 Low | Backend: simple delete. FE: confirmation dialog |
| **Phase 2** | Error handlers + Edge cases | 🟡 Medium | EH-001 to EH-012, EC-001 to EC-010 |
| **Phase 3** | Reply-based inbound sync (US-007, US-008) | 🔴 High | Cross-service gRPC. RabbitMQ event. Quote source logic |
| **Phase 4** | Clickable bubble → thread panel (US-005, US-006) | 🔴 High | Arsitektural: panel mode switching, thread panel embedding, state isolation |
