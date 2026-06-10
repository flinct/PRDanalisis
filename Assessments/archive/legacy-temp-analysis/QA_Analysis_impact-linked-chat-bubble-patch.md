# QA Analysis — Ticketing Patch: Linked Chat Bubble

> **PRD Source:** `PRD/Ticket/PRD Ticket - linked chat bubble.md` (V1)
> **FE:** `apps/omnichannel` (v2.5.0)
> **BE:** `omnichannel-satuinbox-be` (conversation-service + ticket-service)
> **Dibuat:** 2026-05-25 | **Di-refactor:** 2026-05-26

---

## 1. Overview

Patch ini menambahkan 4 kemampuan baru ke fitur linked chat bubble:

- **Append** bubble ke existing active ticket (US-002)
- **Remove** linked bubble dari active ticket (US-004)
- **Clickable bubble** → conversation thread panel (US-005, US-006)
- **Reply-based inbound sync** (US-007, US-008)

Scope: active tickets saja, same-conversation only, customer bubbles only.

---

## 2. Requirement Summary

### Business Rules (final)

| ID    | Rule                                                                                                                                          |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-01 | Hanya customer/client message bubbles yang bisa di-link ke ticket. Agent bubbles, internal notes, system messages, deleted messages direject. |
| BR-02 | Satu bubble hanya boleh terikat ke satu ticket. Cross-ticket duplicate blocked.                                                               |
| BR-03 | Append & remove hanya untuk active tickets (bukan Done/Resolved).                                                                             |
| BR-04 | Max 50 linked bubbles per ticket. Jika limit reached, blocked.                                                                                |
| BR-05 | Latest linked customer bubble = default quote source untuk "Balas ke pelanggan".                                                              |
| BR-06 | Jika semua linked bubbles diremove, "Balas ke pelanggan" disabled sampai ada bubble baru di-link.                                             |
| BR-07 | Inbound sync hanya via reply reference (strict matching), bukan fuzzy/time-proximity. Hanya untuk channel yang support.                       |
| BR-08 | Ticket edit permission = append/remove. Ticket view permission = navigation.                                                                  |
| BR-09 | Append/remove/idempotent. Failed action → retry 3x → revert UI.                                                                               |

### Assumptions & Open Clarifications

| Item                                                                                         | Type          | Status             |
| -------------------------------------------------------------------------------------------- | ------------- | ------------------ |
| Remove bubble → apakah `hasTicket` flag di message conversation ikut di-reset? PRD ambiguous | Open Question | **Belum terjawab** |
| Panel mode switching adalah FE-only state (no new BE endpoint)                               | Confirmed     | ✅                 |
| Inbound sync tidak menggunakan fuzzy matching                                                | Confirmed     | ✅                 |

---

## 3. Flow Analysis — As-Is vs To-Be

### 3.1 Append to Existing Ticket (US-002)

**As-Is:** Bubble selection → hanya "Buat Tiket" (create new). Tidak ada opsi tambah ke ticket existing.
**To-Be:** Bubble selection → dua opsi: "Buat Tiket" (create new) **dan** "Tambahkan ke tiket" → picker modal berisi active tickets dari conversation yg sama → confirm → bubble di-append.

### 3.2 Remove Linked Bubble (US-004)

**As-Is:** MessageCard di ticket detail bersifat read-only. Tidak ada action remove.
**To-Be:** Setiap MessageCard punya icon remove + confirmation dialog. Jika remove latest linked bubble, quote source di-recalculate. Jika remove all, "Balas ke pelanggan" disabled.

### 3.3 Clickable Bubble → Thread Panel (US-005, US-006)

**As-Is:** Linked bubble card static. Klik tidak ada efek.
**To-Be:** Click → right panel switch dari ticket_detail ke conversation_thread. Auto-scroll + highlight source bubble. "Kembali ke detail tiket" restore panel. Bisa append dari thread panel.

### 3.4 Reply-Based Inbound Sync (US-007, US-008)

**As-Is:** Outbound dari ticket room dikirim normal tanpa quote. Inbound customer reply tetap di Inbox, tidak otomatis masuk ticket.
**To-Be:** Outbound dari ticket → quote latest linked customer bubble (untuk channel support reply reference). Inbound customer reply yang match reply reference → auto-link ke active ticket. Badge "Tersinkronisasi dari percakapan".

---

## 4. Impact Analysis

### 4.1 Database / Schema Impact

| Entity                 | Field                                | Change                                                                                                      | Impact                                   |
| ---------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Ticket                 | `linkedBubbleIds`                    | Existing (max 50). Append = push, Remove = pull                                                             | No schema change                         |
| Ticket                 | `latestLinkedCustomerBubbleId`       | Existing (derived). Recalculate after append/remove                                                         | No schema change                         |
| Message (conversation) | `linkedTicketIds[]` atau `hasTicket` | Mungkin perlu update jika remove juga reset flag                                                            | **Need clarification** — PRD tidak jelas |
| Outbound message       | `inboundReplyReferenceId`            | New field untuk reply-reference matching                                                                    | **New field** — perlu migration          |
| Audit log              | action type                          | New enum values: `bubble_appended`, `bubble_removed`, `reply_based_inbound_sync`, `linked_bubble_navigated` | No schema migration                      |

### 4.2 API Contract Impact

| Endpoint                                | Method | Status  | Notes                                                        |
| --------------------------------------- | ------ | ------- | ------------------------------------------------------------ |
| `/ticket/:id/linked-bubbles`            | POST   | **New** | Append messageIds ke existing ticket                         |
| `/ticket/:id/linked-bubbles/:messageId` | DELETE | **New** | Remove single linked bubble                                  |
| `ResolveReplyReference`                 | gRPC   | **New** | conversation-service → ticket-service. Latency budget <500ms |

No breaking changes to existing endpoints.

### 4.3 Frontend Impact per Komponen

| Komponen                               | Perubahan                                          | Level    |
| -------------------------------------- | -------------------------------------------------- | -------- |
| `CreateTicketDraftsModal`              | Tambah opsi "Tambahkan ke tiket"                   | MEDIUM   |
| `MessageCard.tsx`                      | Clickable + icon remove                            | MEDIUM   |
| `LinkedMessagesSection`                | Refresh count setelah append/remove                | LOW      |
| `TicketDetailsDrawer.tsx` (1711 lines) | **Panel mode switching** — refactor besar          | **HIGH** |
| `TicketChatRoom.tsx`                   | Quote source hint, disabled state                  | MEDIUM   |
| `TicketChatRoomInput.tsx`              | Disable "Balas ke pelanggan" jika no linked bubble | LOW      |
| `useTicketMessageActions.ts`           | Attach `inboundReplyReferenceId`                   | LOW      |
| `ConversationChatRoom` / thread panel  | Reuse untuk embedded thread panel                  | MEDIUM   |

### 4.4 Security / RBAC Impact

| Action                    | Permission Required      |
| ------------------------- | ------------------------ |
| Append bubble             | `ticket:edit`            |
| Remove bubble             | `ticket:edit`            |
| Navigate to thread panel  | `ticket:view`            |
| Create ticket from bubble | existing (already gated) |

No new roles. Tenant isolation respected via existing workspace scoping.

### 4.5 Performance Risks

| Skenario                  | Target     | Risiko                                             |
| ------------------------- | ---------- | -------------------------------------------------- |
| Thread panel open         | <1s P95    | No new BE call — purely FE rendering               |
| Append/remove             | <700ms P95 | New endpoint + audit write                         |
| Reply-based sync decision | <500ms P95 | **Risiko:** gRPC cross-service di hot path inbound |

**Mitigasi:** gRPC call timeout configurable, fallback ke no-sync jika timeout.

### 4.6 Concurrency Risks

| Skenario                           | Risiko                              | Mitigasi                              |
| ---------------------------------- | ----------------------------------- | ------------------------------------- |
| Two agents append same ticket      | Both succeed (different bubbles)    | Set-based append, no conflict         |
| A appends, B removes same bubble   | Remove succeeds. A sees stale data  | Socket event `ticket.bubbles.updated` |
| Append + close race                | Close wins. Append fails gracefully | Status check at processing time       |
| Inbound reply + status change race | State at processing time decides    | Atomic read-check-write               |

---

## 5. Dependency Analysis

### Dependency Matrix

| Fitur         | Depends On                                | Type        | Direction                     |
| ------------- | ----------------------------------------- | ----------- | ----------------------------- |
| Append/Remove | Ticket Service (new endpoint)             | API sync    | FE → BE                       |
| Append/Remove | Audit Service                             | API sync    | BE → BE                       |
| Thread Panel  | Conversation Service (GET messages)       | API sync    | FE → BE                       |
| Reply Sync    | Conversation Service (inbound processing) | Event/async | BE → BE                       |
| Reply Sync    | Ticket Service (ResolveReplyReference)    | gRPC sync   | conversation-svc → ticket-svc |
| Reply Sync    | RabbitMQ (possible new exchange)          | Event/async | BE → BE                       |

### Shared Resources

- `linkedBubbleIds` array on Ticket entity
- `latestLinkedCustomerBubbleId` derived field
- Audit service (shared across all actions)
- Socket events (`ticket.bubbles.updated`)

---

## 6. Risk Matrix

| ID     | Risk Scenario                                                                                    | Probability | Impact   | Severity | Mitigation                                                  |
| ------ | ------------------------------------------------------------------------------------------------ | ----------- | -------- | -------- | ----------------------------------------------------------- |
| RSK-01 | **Data inconsistency:** Remove bubble → `hasTicket` flag tidak di-reset → dead link badge        | Medium      | High     | HIGH     | Klarifikasi PM. Jika dead link → tampilkan fallback state   |
| RSK-02 | **Performance:** gRPC cross-service call di hot path inbound processing exceeds 500ms P95        | Medium      | High     | HIGH     | Timeout + fallback no-sync. Circuit breaker pattern         |
| RSK-03 | **Regression:** Panel mode switching breaks existing TicketDetailsDrawer (1711 lines monolithic) | High        | Critical | CRITICAL | Extract panel state. Feature flag. Regression test coverage |
| RSK-04 | **Race condition:** Append + ticket close at same time → bubble appended to closed ticket        | Low         | High     | HIGH     | Status validation at processing time, not request time      |
| RSK-05 | **Data integrity:** Satu bubble di-link ke multiple tickets                                      | Low         | Critical | CRITICAL | Unique constraint on bubble ID per ticket                   |
| RSK-06 | **UX confusion:** Agent creates duplicate ticket instead of append                               | Medium      | Medium   | MEDIUM   | Clear CTA: "Tambahkan ke tiket" vs "Buat Tiket"             |
| RSK-07 | **Socket event missed:** Conversation side doesn't update after append/remove                    | Low         | Medium   | MEDIUM   | Event-driven refresh + manual refresh fallback              |

---

## 7. Error Handler Mapping

| EH-ID  | Kondisi                             | FE Impact                                            | BE Impact                | Status                               |
| ------ | ----------------------------------- | ---------------------------------------------------- | ------------------------ | ------------------------------------ |
| EH-001 | Invalid bubble type                 | Block create/append                                  | Validasi di endpoint     | ✅ Sudah (perlu extend untuk append) |
| EH-002 | Already linked to another ticket    | Block + toast "Bubble sudah terhubung ke tiket lain" | Uniqueness validation    | ✅ Sudah untuk create                |
| EH-003 | Same ticket duplicate               | Skip + warning toast                                 | Ignore duplicate         | ❌ Baru untuk append                 |
| EH-004 | No active ticket                    | Disable append, "Belum ada tiket aktif"              | —                        | ❌ Baru                              |
| EH-005 | Closed ticket                       | Block append/remove                                  | Validasi status active   | ❌ Baru untuk remove                 |
| EH-006 | Limit reached (50)                  | Block append                                         | Validasi max 50          | ❌ Baru                              |
| EH-007 | Remove last source → reply disabled | Disable "Balas ke pelanggan"                         | Recalculate quote source | ❌ Baru                              |
| EH-008 | Source bubble missing               | Show fallback                                        | —                        | ❌ Baru                              |
| EH-009 | Unsupported reply reference         | No auto-sync badge                                   | No action                | ❌ Baru                              |
| EH-010 | Reference resolution failed         | Internal log only                                    | No action                | ❌ Baru                              |
| EH-011 | Permission denied                   | Disable actions                                      | RBAC check               | ✅ Sudah                             |
| EH-012 | Save failure                        | Retry 3x + revert UI                                 | Idempotent retry         | ❌ Baru                              |

---

## 8. Edge Case Mapping

| EC-ID  | Skenario                                 | FE Impact                                  | BE Impact                             | Status  |
| ------ | ---------------------------------------- | ------------------------------------------ | ------------------------------------- | ------- |
| EC-001 | Mixed valid+invalid bubbles              | Process valid, skip invalid, summary toast | Partial success response              | ❌ Baru |
| EC-002 | Remove latest linked bubble              | Recalculate quote source                   | Update `latestLinkedCustomerBubbleId` | ❌ Baru |
| EC-003 | Remove all linked bubbles                | Disable customer reply                     | Keep ticket active, no quote source   | ❌ Baru |
| EC-004 | Linked bubble belongs to deleted ticket  | Treat as linked, block reuse               | Server integrity check                | ❌ Baru |
| EC-005 | Multiple bubbles identical timestamp     | Use latest created linkage                 | Tie-breaker logic                     | ❌ Baru |
| EC-006 | Inbound reply references older outbound  | Append to same ticket, chronological       | Match by outbound message ID          | ❌ Baru |
| EC-007 | Ticket becomes inactive while panel open | Disable append                             | —                                     | ❌ Baru |
| EC-008 | Source conversation is group chat        | Same rules, depends on channel             | Group chat support                    | ❌ Baru |
| EC-009 | Bubble linked from different page state  | Server validation wins, toast + refresh    | Server decides final state            | ❌ Baru |
| EC-010 | Inbound arrives after ticket resolved    | Stay in Inbox only                         | Check ticket state at processing time | ❌ Baru |

---

## 9. Production Safety

### Rollback Strategy

| Layer               | Rollback Action                                       | Risk                                       |
| ------------------- | ----------------------------------------------------- | ------------------------------------------ |
| FE                  | Feature flag off (flag baru: `linkedChatBubblePatch`) | Zero risk                                  |
| BE (endpoints baru) | Remove route handler                                  | Jika ada client mencoba call → 404         |
| BE (gRPC baru)      | Remove method from proto                              | Jika ada caller timeout → fallback no-sync |
| Schema              | Tidak ada schema migration → no rollback needed       | Aman                                       |

### Feature Toggle Requirements

| Toggle Name             | Scope         | Default              | Purpose                                          |
| ----------------------- | ------------- | -------------------- | ------------------------------------------------ |
| `linkedChatBubblePatch` | Company-level | OFF (staged rollout) | Master toggle untuk semua 4 fitur                |
| `appendRemoveEnabled`   | Company-level | ON (if master ON)    | Sub-toggle untuk append + remove                 |
| `threadPanelEnabled`    | Company-level | ON (if master ON)    | Sub-toggle untuk clickable bubble → thread panel |
| `replySyncEnabled`      | Company-level | ON (if master ON)    | Sub-toggle untuk reply-based inbound sync        |

### Staged Rollout Recommendation

1. **Phase 1 (internal):** Enable `appendRemoveEnabled` — low risk, FE-only + 1 new endpoint
2. **Phase 2 (beta):** Enable `replySyncEnabled` — cross-service, perlu monitoring
3. **Phase 3 (GA):** Enable `threadPanelEnabled` — risiko arsitektural tertinggi
4. **Rollback plan:** Jika ada issue, disable master toggle → semua fitur mati, existing behavior restored

### Monitoring & Alerting

| Metric                       | Alert Threshold | Why                             |
| ---------------------------- | --------------- | ------------------------------- |
| Append/remove latency P95    | >700ms          | Performance regression          |
| Reply sync decision P95      | >500ms          | Cross-service bottleneck        |
| Reply sync error rate        | >1%             | Reference resolution failure    |
| gRPC timeout rate            | >0.1%           | Network/load issue              |
| Append/remove error 4xx rate | >5%             | Client misuse or validation bug |

### Audit Log Gaps

| Action                               | Currently Logged? |
| ------------------------------------ | ----------------- |
| Create ticket from bubble            | ✅ Sudah          |
| Append bubble to ticket              | ❌ Baru           |
| Remove bubble from ticket            | ❌ Baru           |
| Linked bubble navigated (panel open) | ❌ Baru           |
| Reply-based inbound sync             | ❌ Baru           |
| Blocked append (validation fail)     | ❌ Baru           |

---

## 10. Cross-Feature Dependencies

| Dependency                                  | Impact                                                                      | Mitigation                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `TicketDetailsDrawer` (1711 lines)          | Panel mode switching butuh refactor                                         | Extract panel state. Pisahkan komponen ticket_detail dan conversation_thread |
| `ConversationChatRoom` thread rendering     | Reuse untuk embedded panel                                                  | Extract shared component. Store isolation                                    |
| `message.service.ts` (conversation-service) | Cross-service gRPC ke ticket-service                                        | New gRPC `ResolveReplyReference`. Latency budget <500ms P95                  |
| `ticket.service.ts`                         | New methods: AppendLinkedBubbles, RemoveLinkedBubble, ResolveReplyReference | —                                                                            |
| Socket real-time                            | Ticket append/remove → conversation side update                             | Socket event `ticket.bubbles.updated`                                        |
| `CreateTicketRequest.messageIds`            | Append needs different DTO                                                  | New DTO: `AppendBubblesRequest { ticketId, messageIds[] }`                   |

---

## 11. Development Sequence

| Phase       | Fitur                                                 | Complexity      | Risiko                                                  |
| ----------- | ----------------------------------------------------- | --------------- | ------------------------------------------------------- |
| **Phase 1** | Append (US-002) + Remove (US-004)                     | 🟡🟢 Medium-Low | Rendah. Backend endpoint baru + FE extend modal         |
| **Phase 2** | Error handlers (EH-001–012) + Edge cases (EC-001–010) | 🟡 Medium       | Sedang. Coverage untuk failure modes                    |
| **Phase 3** | Reply-based inbound sync (US-007, US-008)             | 🔴 High         | Cross-service gRPC + RabbitMQ. Performa <500ms          |
| **Phase 4** | Clickable bubble → thread panel (US-005, US-006)      | 🔴 High         | Arsitektural. Refactor TicketDetailsDrawer (1711 lines) |

---

## 12. Test Strategy

### Test Levels & Priorities

| Priority | Area                                     | Level             | Rationale                                       |
| -------- | ---------------------------------------- | ----------------- | ----------------------------------------------- |
| 🔴 P0    | Append to active ticket (US-002)         | E2E + Integration | Core new flow. Multiple validation paths        |
| 🔴 P0    | Remove linked bubble (US-004)            | E2E + Integration | Data integrity risk. Quote source recalculation |
| 🔴 P0    | Reply-based inbound sync (US-008)        | Integration + E2E | Cross-service. Real-time. Data loss risk        |
| 🟡 P1    | Clickable bubble → thread panel (US-005) | E2E + UI          | High UX impact. Panel state management          |
| 🟡 P1    | Append from thread panel (US-006)        | E2E               | Extension of US-002. Regression on panel state  |
| 🟡 P1    | Error handlers (EH-001 to EH-012)        | Integration + E2E | Coverage for all failure modes                  |
| 🟢 P2    | Edge cases (EC-001 to EC-010)            | E2E               | Corner cases, concurrency, race conditions      |
| 🟢 P2    | Non-functional (Performance, Security)   | Load + Security   | P95 targets, RBAC, tenant isolation             |
| 🟢 P2    | Audit logging (US-009)                   | Integration       | Verify all actions logged                       |
| 🟢 P2    | Limit handling (US-010)                  | E2E               | Max 50 linked bubbles, scroll behavior          |

### Test Scenarios — Append (US-002)

| TC-ID  | Scenario                                       | Steps                                                                                        | Expected                                        |
| ------ | ---------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| APP-01 | Append single customer bubble to active ticket | 1. Select 1 customer bubble 2. Click "Tambahkan ke tiket" 3. Choose active ticket 4. Confirm | Bubble linked. Count incremented. Toast success |
| APP-02 | Append multiple customer bubbles               | Select 3 customer bubbles → append                                                           | All 3 linked. Count +3                          |
| APP-03 | Mixed valid + invalid                          | 2 customer + 1 agent + 1 already-linked                                                      | 2 succeed. Others skipped. Summary toast        |
| APP-04 | Append to closed/resolved ticket               | Select bubble → "Tambahkan ke tiket"                                                         | Closed ticket not selectable                    |
| APP-05 | No active ticket exists                        | Select bubble → "Tambahkan ke tiket"                                                         | Disabled. "Belum ada tiket aktif"               |
| APP-06 | Bubble already linked to DIFFERENT ticket      | Select bubble linked elsewhere                                                               | Blocked. "Bubble sudah terhubung ke tiket lain" |
| APP-07 | Bubble already linked to SAME ticket           | Select bubble already in this ticket                                                         | Skipped. Warning toast                          |
| APP-08 | Limit reached (50/50)                          | Select bubble → append                                                                       | Blocked. "Batas bubble tiket tercapai"          |
| APP-09 | Append from thread panel (opened from ticket)  | 1. Open thread panel 2. Select bubbles 3. Append                                             | Bubbles added. Panel stays open. Count updates  |
| APP-10 | Append from thread panel when ticket inactive  | 1. Open thread panel 2. Ticket closed by other agent 3. Try append                           | Blocked. "Tiket ini sudah selesai"              |
| APP-11 | Permission denied (no ticket edit)             | User without edit permission                                                                 | Action disabled/hidden                          |
| APP-12 | Save failure + retry                           | Simulate BE failure → retry 3x → still fail                                                  | UI reverts. Error toast                         |

### Test Scenarios — Remove (US-004)

| TC-ID  | Scenario                                   | Steps                                            | Expected                                         |
| ------ | ------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| REM-01 | Remove single linked bubble                | 1. Open ticket detail 2. Click remove 3. Confirm | Bubble detached. Count -1. Audit logged          |
| REM-02 | Remove latest linked bubble (quote source) | Remove most recent bubble                        | Next latest becomes quote source                 |
| REM-03 | Remove all linked bubbles                  | Remove all until 0                               | "Balas ke pelanggan" disabled. Helper text shown |
| REM-04 | Remove from closed ticket                  | Try remove on Done/Resolved ticket               | Blocked. Error message                           |
| REM-05 | Remove + cancel                            | Click remove → cancel                            | Bubble remains. No change                        |
| REM-06 | Permission denied                          | User without edit permission                     | Remove action hidden/disabled                    |
| REM-07 | Save failure + retry                       | Simulate BE failure → retry 3x → fail            | UI reverts. Error toast                          |

### Test Scenarios — Clickable Bubble Navigation (US-005, US-006)

| TC-ID  | Scenario                                | Steps                                            | Expected                                                       |
| ------ | --------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| NAV-01 | Click linked bubble → open thread panel | Click linked bubble card in ticket detail        | Panel switches to conversation thread. Auto-scroll + highlight |
| NAV-02 | Back to ticket detail                   | Click "Kembali ke detail tiket"                  | Ticket detail restored. Chat room state preserved              |
| NAV-03 | Click bubble from long list             | Click bubble #45 of 50                           | Thread panel opens. Correct bubble highlighted                 |
| NAV-04 | Source bubble missing (deleted)         | Click bubble that was deleted                    | Panel opens. "Bubble sumber tidak ditemukan"                   |
| NAV-05 | Append from thread panel (happy path)   | 1. Open thread panel 2. Select bubbles 3. Append | Bubbles added. Panel stays open                                |
| NAV-06 | Thread panel with group chat            | Click bubble from group chat                     | Normal thread panel                                            |
| NAV-07 | Keyboard accessibility                  | Tab to linked bubble → Enter                     | Opens thread panel. Focus on highlighted bubble                |

### Test Scenarios — Reply-Based Inbound Sync (US-007, US-008)

| TC-ID   | Scenario                                       | Steps                                                                              | Expected                                      |
| ------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| SYNC-01 | Send reply from ticket with linked bubble      | Active ticket with linked bubbles → send "Balas ke pelanggan" on supported channel | Outbound quotes latest linked customer bubble |
| SYNC-02 | Send reply WITHOUT linked bubble               | Active ticket, no linked bubbles → try reply                                       | "Balas ke pelanggan" disabled                 |
| SYNC-03 | Send reply on unsupported channel              | Channel without reply reference → send reply                                       | Sent normally. No quote                       |
| SYNC-04 | Inbound reply → auto-linked to active ticket   | 1. Agent sent from ticket 2. Customer replies to that message                      | Inbound appears in ticket. Sync badge visible |
| SYNC-05 | Inbound reply when ticket is resolved          | Ticket Done/Resolved → customer replies                                            | Stays in Inbox only. No ticket sync           |
| SYNC-06 | Inbound reply on unsupported channel           | Channel without reply reference                                                    | No auto-link. Normal message                  |
| SYNC-07 | Reference resolution failed                    | Reply reference cannot be matched                                                  | Internal log. No auto-link                    |
| SYNC-08 | Multiple outbound → customer replies to oldest | Reply ref matches older message → ticket active                                    | Appended to correct ticket. Chronological     |
| SYNC-09 | Quote source hint visible                      | Open "Balas ke pelanggan" composer                                                 | Hint shows timestamp/preview of quoted bubble |

### Concurrency & Race Conditions

| TC-ID  | Scenario                           | Steps                                         | Expected                                             |
| ------ | ---------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| CON-01 | Two agents append simultaneously   | Both click append at same time                | Both succeed (different bubbles). Total = sum        |
| CON-02 | A appends, B removes same bubble   | A appends, B removes bubble just added by A   | Remove succeeds. A sees removed on next load         |
| CON-03 | Append while ticket being closed   | Append API + Close API race                   | Close wins. Append fails "Tiket sudah selesai"       |
| CON-04 | Inbound reply during status change | Reply processing + status change at same time | State at processing time decides                     |
| CON-05 | Bulk append with concurrent edits  | Append + stage change + tag edit              | Last-write-wins per field. Linked bubbles unaffected |

### Regression — Existing Flows (Must NOT Break)

| TC-ID  | Existing Flow                                  | Verification                                                    |
| ------ | ---------------------------------------------- | --------------------------------------------------------------- |
| REG-01 | Create ticket from selected bubbles (existing) | "Buat Tiket" still works                                        |
| REG-02 | Duplicate bubble detection for create          | `hasMessagesWithTicket` still blocks re-creation                |
| REG-03 | Ticket detail panel (existing)                 | LinkedMessagesSection, LinkedConversationSection still render   |
| REG-04 | Ticket room send message (existing)            | Normal send works. Internal notes work                          |
| REG-05 | Conversation chat room bubble badge            | "Lihat Tiket" badge still appears for linked bubbles            |
| REG-06 | Max 50 limit for create                        | Create still blocks at 50                                       |
| REG-07 | Ticket close/reopen                            | Close works. Reopen creates new SLA cycle                       |
| REG-08 | Conversation-linked tickets display            | ConversationLinkedTicketsContent still shows all linked tickets |

### Data Integrity

| TC-ID  | Check                                               | Method                                                          |
| ------ | --------------------------------------------------- | --------------------------------------------------------------- |
| INT-01 | One bubble = one ticket only                        | Create bubble in ticket A, try link to ticket B → blocked       |
| INT-02 | Remove doesn't affect other ticket's linked bubbles | Remove from ticket A → verify ticket B unchanged                |
| INT-03 | Append preserves existing linked bubbles            | Append 2 new → verify existing 3 still there. Total = 5         |
| INT-04 | Quote source correctly recalculated                 | Remove bubble #5 (latest) → verify quote source = bubble #4     |
| INT-05 | Inbound sync preserves original message ID          | Verify inbound in ticket has correct conversationId + messageId |

---

## 13. Traceability Matrix

| Req ID     | Requirement                                 | Finding                                  | Impact Area                                 | Test Cases                | Status               |
| ---------- | ------------------------------------------- | ---------------------------------------- | ------------------------------------------- | ------------------------- | -------------------- |
| FR-001–003 | Linking eligibility (customer bubbles only) | Existing logic perlu extend untuk append | CreateTicketDraftsModal, BE validation      | APP-03, APP-06            | Perlu update         |
| FR-004–006 | Ticket status rules (active only)           | Status check at endpoint + FE filter     | Ticket selector, BE endpoint                | APP-04, APP-05, REM-04    | Baru                 |
| FR-007–009 | Bubble uniqueness (one bubble, one ticket)  | Unique constraint + skip duplicate       | BE validation, FE feedback                  | APP-06, APP-07, INT-01    | Baru untuk append    |
| FR-010–013 | Create & append flow                        | Two actions from bubble selection        | FE action bar, ticket picker modal          | APP-01–12                 | Baru                 |
| FR-014–017 | Remove linked bubble                        | Confirmation + recalculate quote source  | MessageCard, BE logic                       | REM-01–07, INT-04         | Baru                 |
| FR-018–021 | Ticket reply behavior                       | Quote latest linked bubble               | TicketChatRoom, useTicketMessageActions     | SYNC-01, SYNC-02, SYNC-03 | Baru                 |
| FR-022–025 | Reply-based inbound sync                    | Strict reply-reference matching          | message.service, gRPC ResolveReplyReference | SYNC-04–08, CON-04        | Baru                 |
| FR-026–030 | Linked bubble navigation                    | Panel mode switching                     | TicketDetailsDrawer (refactor)              | NAV-01–07                 | Baru                 |
| FR-031–033 | Ordering and limits                         | Max 50, descending order                 | FE rendering, BE validation                 | APP-08, REG-06            | Baru                 |
| FR-034–036 | Permissions                                 | Edit permission for append/remove        | RBAC check, FE disabled state               | APP-11, REM-06            | Sudah                |
| FR-037–039 | Auditability                                | All actions logged                       | Audit service                               | —                         | Baru (3 event types) |

---

## 14. Recommendation

| Kriteria              | Assessment                                                                              |
| --------------------- | --------------------------------------------------------------------------------------- |
| Business alignment    | ✅ Strong. Memecahkan PS-001, PS-002, PS-003 secara langsung                            |
| Technical feasibility | ✅ Feasible. Risiko terbesar di Phase 3 (reply sync) dan Phase 4 (panel mode switching) |
| Data integrity risk   | ⚠️ Moderate. Kunci di unique constraint + idempotency + socket event                    |
| Regression risk       | ⚠️ Moderate. TicketDetailsDrawer refactor (1711 lines) adalah area paling rawan         |
| Production safety     | ✅ Feature toggle strategy memungkinkan staged rollout dan rollback tanpa downtime      |

**Go Decision: Conditional GO**

- **Condition 1:** Klarifikasi PM untuk open question `hasTicket` flag behavior setelah remove
- **Condition 2:** Phase 4 (thread panel) harus punya feature flag independen — jangan digabung dengan Phase 1–3
- **Condition 3:** Performance benchmark untuk gRPC cross-service call sebelum Phase 3 deploy ke production
