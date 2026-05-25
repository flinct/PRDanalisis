# Ticket PRD V1 vs V2 vs FE Implementation Comparison

> **Sumber FE:** `C:\Users\MyBook SAGA 12\Desktop\FE satuinbox\omnichannel-satuinbox-fe\apps\omnichannel`
> **SLA Ticket:** `PRD/SLA conversation n ticket/PRD Ticket - SLA ticket.md`
> **Dibuat:** 2026-05-25

---

## Ringkasan

Ticket V2 terdiri dari 8 file dengan organisasi berbeda dari V1 (9 file). V2 mengklaim lebih update. Verifikasi terhadap FE:

---

## Feature Mapping: V1 → V2 → FE

| # | Feature | V1 File | V2 File | FE Status | Notes |
|---|---------|---------|---------|-----------|-------|
| 1 | **Ticket List** | `PRD Ticket list.md` | `PRD Inbox Satuinbox V2.md` (base) | ✅ Developed | Tabs per type, columns, KPI, filters, bulk actions all implemented |
| 2 | **Ticket Detail** | `PRD Ticket list - detail.md` | `PRD Inbox Satuinbox V2 (1).md` | ✅ Developed | Drawer with sidebar, SLA, attributes, linked conversation |
| 3 | **Ticket Room** | `PRD Ticket - room.md` | `PRD Inbox Satuinbox V2 (3).md` | ✅ Developed | Chat room with tabs, mention picker |
| 4 | **Bulk Reply** | `PRD Ticket - bulk reply ticket.md` | `PRD Inbox Satuinbox V2 (2).md` | ✅ Developed | XLSX upload, async job, result report |
| 5 | **Export** | `PRD Ticket - export.md` | `PRD Inbox Satuinbox V2 (4).md` | ✅ Developed | XLSX export with custom field columns |
| 6 | **Linked Chat Bubble** | `PRD Ticket - linked chat bubble.md` | — (absorbed into V2 file 1 Detail) | ✅ Developed | `linkedBubbleIds`, `LinkedMessagesSection` |
| 7 | **Snooze** | `PRD Ticket - snooze.md` | — (absorbed into V2 base + file 1 Detail) | ✅ Developed | `TicketSnooze` type, `useTicketSnoozeActions` |
| 8 | **Type Settings** | `PRD Ticket - type settings.md` | — (absorbed into V2 base + file 1 Detail) | ✅ Developed | Custom fields: text, list, date, image, gallery, files |
| 9 | **View Scope** | `PRD Ticket - view scope.md` | — (absorbed into V2 base) | ✅ Developed | `TicketViewEnum` with 8 role-based views |
| 10 | **Related Tickets & Merge** | ❌ Not in V1 | `PRD Inbox Satuinbox V2 (5).md` | ❌ **UNDEVELOPED** | New V2 feature |
| 11 | **Search Relevance** | ❌ Not in V1 | `PRD Inbox Satuinbox V2 (6).md` | ✅ Developed | `OutsideFilterGuidanceBanner` exists |
| 12 | **Create Ticket Consistency** | ❌ Not in V1 | `PRD Inbox Satuinbox V2 (7).md` | ✅ Developed | `CreateTicketForm`, `DynamicTicketForm` |

---

## Detail Comparison per Feature

### 1. Ticket List

| Aspek | V1 | V2 | FE | Pemenang |
|-------|----|----|----|----------|
| Type tabs | "Semua" + per-type | "Semua" + per-type | ✅ Ticket type tabs | **Sama** |
| Default columns | 12 fixed columns | 12 fixed columns | ✅ 21 columns configurable | **V2 = FE** |
| View settings | ❌ Not defined | Per-tab column toggle | ✅ `ViewSettingsSheet` | **V2 = FE** |
| KPI strip | Semua, Baru, Butuh respons, Proses, Lewat SLA, Selesai | Same + Snoozed | ✅ 7 cards (includes Snoozed) | **V2 = FE** |
| Bulk actions | Update status, tag, close, bulk reply | Same | ✅ All implemented | **Sama** |
| Sticky columns | ❌ Not defined | Checkbox + ID Tiket pinned | ✅ Implemented | **V2 = FE** |
| SLA column | Countdown/overdue/"—" | Same + live timer | ✅ `buildSlaColumn` with live timer | **Sama** |
| Agent assignment | ❌ Not in V1 list | Multi-select on "Agen" column | ✅ `AgentCell` with inline edit | **V2 = FE** |
| Search scope | ID Tiket, Judul, Klien, Deskripsi | Same + custom fields + relevance ranking | ✅ Search with field selector | **V2 = FE** |
| Out-of-filter guidance | ❌ | ✅ Banner when matches exist outside filter | ✅ `OutsideFilterGuidanceBanner` | **V2 = FE** |

### 2. Ticket Detail

| Aspek | V1 Detail | V2 File 1 | FE | Pemenang |
|-------|-----------|-----------|----|----------|
| Layout | Left: thread, Right: sidebar | Left: thread, Right: sidebar | ✅ Drawer with two columns | **Sama** |
| Header | Title, ID badge, status, close/reopen | Same + indicator badge | ✅ `TicketHeader` with badges | **Sama** |
| Indicator badge | ❌ Not defined | "Butuh balasan" / "Sedang ditangani" | ✅ `needResponse` boolean | **V2 = FE** |
| Tags | Chips with add/remove | Same | ✅ Tag section | **Sama** |
| Description | Read-only, double-click edit | Same | ✅ Inline description editor | **Sama** |
| Composer tabs | "Balas pelanggan" / "Catatan internal" | Same | ✅ `TicketChatRoomTabs` | **Sama** |
| Mention picker | @ in internal notes only | Same | ✅ Mention support | **Sama** |
| Sidebar sections | Assignee → SLA → Attributes → Client → Linked → Log | Same (ordered) | ✅ All sections present | **Sama** |
| SLA section | FRT + Resolve chips | Collapsible, stage breakdown | ✅ `TicketSLASection` with stage SLA | **V2 = FE** |
| Custom attributes | Text, select, date, file | Same + gallery, files, `readOnly` | ✅ `EditableAttribute` (text, list, date, image, gallery, files) | **V2 = FE** |
| Linked conversation | ✅ | ✅ | ✅ `LinkedConversationSection` | **Sama** |
| Activity log | ✅ latest 5 | ✅ | ✅ Event timeline | **Sama** |
| Media & files | ❌ Not in V1 detail | ✅ | ✅ `TicketMediaSection`, `TicketFileSection` | **V2 = FE** |

### 3. Ticket Room

| Aspek | V1 Room | V2 File 3 | FE | Pemenang |
|-------|---------|-----------|----|----------|
| Scope | Full messaging surface | Lighter version (thread + composer only) | ✅ `TicketChatRoom` (inside drawer) | **V2 = FE** |
| Composer tabs | "Balas pelanggan" / "Catatan internal" | Same | ✅ Tab switcher | **Sama** |
| Draft preservation | ✅ | Separate per tab | ✅ `ticket-chat-input.store.ts` | **Sama** |
| Mention picker | @ in internal notes | Same + assign prompt | ✅ Mention-to-assign flow | **V2 = FE** |
| Close/reopen | ✅ | ✅ | ✅ Close/reopen popover | **Sama** |
| Origin indicator | ❌ | "Dari tiket #<ID>" label | ✅ Origin tracking | **V2 = FE** |
| Access control | Team Inbox + assignee | Same | ✅ RBAC gated | **Sama** |

### 4. Bulk Reply

| Aspek | V1 | V2 File 2 | FE | Pemenang |
|-------|----|-----------|----|----------|
| XLSX upload | ✅ identifier + reply columns | Same | ✅ `useBulkReplyStore` | **Sama** |
| Identifier types | ticket_number / custom_field | Same | ✅ `useFetchIdentifierFields` | **Sama** |
| Visibility toggle | send_to_customer boolean | Same | ✅ public/internal toggle | **Sama** |
| Async job | queued→processing→completed→failed | Same | ✅ polling via `useFetchBulkReplyJob` | **Sama** |
| Result report | ✅ 30-day retention | Same | ✅ `useDownloadBulkReplyReport` | **Sama** |
| Open API | POST/GET endpoints | Same | ✅ API methods | **Sama** |
| Author attribution | actor.user_type, id, name | Same + organization field | ✅ Actor snapshot | **V2 = FE** |

### 5. Export

| Aspek | V1 | V2 File 4 | FE | Pemenang |
|-------|----|-----------|----|----------|
| Format | XLSX only | XLSX only | ✅ XLSX export | **Sama** |
| Default columns | 24 columns | 24 columns (same) | ✅ Matches | **Sama** |
| Custom field columns | On type-specific tabs | On single type context | ✅ Conditional append | **Sama** |
| Async job | ✅ | ✅ | ✅ `useGetExportTicket` | **Sama** |
| Max rows | 10,000 | 10,000 | ✅ Pagination | **Sama** |
| Retention | 7 days | 7 days | ✅ | **Sama** |

### 6. Linked Chat Bubble

| Aspek | V1 | V2 | FE | Pemenang |
|-------|----|----|----|----------|
| Create from bubbles | ✅ | Absorbed into Detail | ✅ `linkedBubbleIds` | **Sama** |
| Append to existing | ✅ Active tickets only | Same | ✅ Message selection | **Sama** |
| Remove linked | ✅ | Same | ✅ Remove supported | **Sama** |
| Max 50 per ticket | ✅ | ✅ | ✅ Enforced | **Sama** |
| Reply from ticket | ✅ quotes latest bubble | Same | ✅ Quote in composer | **Sama** |
| Inbound auto-sync | ✅ reply reference | Same | ✅ Socket handler | **Sama** |

### 7. Snooze

| Aspek | V1 | V2 | FE | Pemenang |
|-------|----|----|----|----------|
| Snooze state | Not status change | Same | ✅ `snooze: TicketSnooze` | **Sama** |
| Snoozed view | ✅ Dedicated filter | Same | ✅ KPI card "Snoozed" | **Sama** |
| Auto-wake | ✅ TIME_REACHED | Same | ✅ Scheduler | **Sama** |
| Auto-unsnooze inbound | ✅ within 2s | Same | ✅ Inbound handler | **Sama** |
| Bulk snooze | ❌ | ✅ | ✅ `useActionSetBulkSnoozeTicket` | **V2 = FE** |
| RBAC | Agent own, Supervisor scope | Same | ✅ `useCanCloseTicket` | **Sama** |

### 8. Type Settings

| Aspek | V1 | V2 | FE | Pemenang |
|-------|----|----|----|----------|
| Field types | text, list, date, image, gallery, files | Same | ✅ All 6 types in `CustomAttributeType` | **Sama** |
| Read-only fields | ✅ Patch v1.2 | ✅ | ✅ `isReadOnly` in `CustomAttribute` | **Sama** |
| State builder | Submitted, In Progress, WoC, Resolved | Same | ✅ `StageTicket`, `TicketStageType` | **Sama** |
| Title autofill | ✅ | ✅ | ✅ | **Sama** |
| Version control | ✅ `template_version_id` | ✅ | ✅ | **Sama** |

### 9. View Scope (RBAC)

| Aspek | V1 | V2 | FE | Pemenang |
|-------|----|----|----|----------|
| Agent views | "Tiket Saya", optionally "Antrean Tim" | Same | ✅ `my_ticket`, `queue_team` | **Sama** |
| Supervisor views | "Semua Tiket Tim", "Antrean Belum Ditugaskan" | Same | ✅ `all_ticket_team`, `queue_unassigned` | **Sama** |
| Admin views | "Semua Tiket", "Belum Ditugaskan", "Ditugaskan" | Same | ✅ `all_ticket`, `unassigned_ticket`, `assigned_ticket` | **Sama** |
| "Dibuat oleh saya" | ❌ V1 later addendum | ✅ | ✅ `created_by_me` | **V2 = FE** |
| Manual claim | ✅ "Ambil Tiket" | Same | ✅ Claim flow | **Sama** |
| KPI scope | Scoped by view | Same | ✅ KPI cards respect view | **Sama** |
| Sort by SLA | SLA breached first, oldest first | Same | ✅ SLA urgency sort | **Sama** |

### 10. NEW in V2: Related Tickets & Merge

| Aspek | V2 File 5 | FE | Status |
|-------|-----------|----|--------|
| Related Ticket Group | Main + Sub tickets | ❌ Not implemented | ❌ |
| Merge with redirect | Main ticket selected, Sub becomes read-only | ❌ Not implemented | ❌ |
| Customer notice on merge | ✅ default-on, editable | ❌ | ❌ |
| SLA stays per-ticket corridor | ✅ No shared SLA | ❌ | ❌ |

### 11. NEW in V2: Search Relevance

| Aspek | V2 File 6 | FE | Status |
|-------|-----------|----|--------|
| Exact ID match first | ✅ | ✅ `searchType: 'ID Tiket'` | ✅ |
| Relevance ranking | exact → normalized → prefix → partial → date | ✅ Sort by relevance | ✅ |
| Out-of-filter banner | "Ada {count} tiket di luar filter" | ✅ `OutsideFilterGuidanceBanner` | ✅ |
| Blocking filter ID | Date range identified as blocker | ✅ `blockingFilters` in API response | ✅ |
| Keyword highlighting | ✅ | ✅ In matched columns | ✅ |

### 12. NEW in V2: Create Ticket Consistency

| Aspek | V2 File 7 | FE | Status |
|-------|-----------|----|--------|
| Two entry points | Bubble + Ticket page | ✅ Both paths exist | ✅ |
| Form field order | Type → Assignment → Tags → Title → Priority → Description → Additional | ✅ `CreateTicketForm` matches | ✅ |
| Type switching clears fields | ✅ Confirmation dialog | ✅ Dynamic form | ✅ |
| Assignee scoped by team | ✅ Filtered by team inbox | ✅ `useTicketAssignForm` | ✅ |
| Assignment states | 4 states (unassigned/team-only/assignee-only/both) | ✅ Implemented | ✅ |
| Double-submit prevention | ✅ Idempotent | ✅ Optimistic updates | ✅ |

---

## SLA Ticket Cross-Reference

### SLA Ticket PRD vs V2 vs FE

| Aspek | PRD Ticket - SLA ticket.md | V2 | FE (v2.5.0) | Status |
|-------|---------------------------|---|-------------|--------|
| FRT start | Ticket creation (or first agent response) | Absorbed into Detail | `firstResponseDue`, `firstResponseTimeMs` | ✅ |
| TTC start | Ticket creation + non-resolved | Absorbed into Detail | `timeToCloseDue`, `timeToCloseMs` | ✅ |
| SLA runs when | Submitted / In Progress | Absorbed | Stage-based: `StageTicket.sla.state` | ✅ |
| SLA pauses on | Waiting on Customer (toggle) | Absorbed | `slaState.isPaused`, `pauseOnWaitingCustomer` | ✅ |
| SLA stops on | Resolved | Absorbed | `status: 'close'` | ✅ |
| Reopen new cycle | ✅ New SLA cycle | Absorbed | `slaState.cycleId` | ✅ |
| Stage SLA | ✅ Cumulative per stage | Absorbed | Per-stage `Sla` type with history | ✅ |
| Reminder | 1 per metric + stage | Absorbed | `reminderMs`, `reminderSent` | ✅ |
| Snapshot at cycle start | ✅ | ✅ | `officeHoursSnapshot` | ✅ |

### Key SLA Differences: Ticket vs Conversation

| Aspek | Conversation SLA (V2 files 3,8,9,10) | Ticket SLA (SLA ticket.md) |
|-------|--------------------------------------|---------------------------|
| Lifecycle start | First customer inbound → FRT | Ticket creation → FRT |
| FRT formula | `inbound → first_reply` (Wait Time + RLT) | `creation → first_response` |
| Stage SLA | Tidak ada | ✅ Ada (per stage tracking) |
| Pause scope | TTC only (FRT tidak pause) | FRT + TTC + stage (all pause) |
| Reopen behavior | Belum final (3-way conflict) | ✅ New SLA cycle |
| SLA config per | Channel | Ticket Type |

---

## Quantitative Summary

| Metric | V1 | V2 | FE (v2.5.0) |
|--------|----|----|-------------|
| Jumlah file | 9 | 8 | — |
| Fitur match dengan FE | ~90% | ~95% | — |
| Fitur baru di V2 | 0 | 3 (Related Tickets, Search Relevance, Create Consistency) | 2/3 developed |
| Fitur V1 tidak di V2 | 0 (semua absorbed) | — | — |
| V2 fitur belum di FE | — | 1 (Related Tickets & Merge) | ❌ |

---

## Kesimpulan

1. **V2 supersedes V1** — semua fitur V1 ada di V2 (beberapa di-merge ke file lebih besar). Tidak ada fitur V1 yang hilang.

2. **FE implementation ~95% cocok dengan V2**, dengan detail:
   - Ticket List: ✅ Full match (tabs, columns, KPI, filters, bulk, SLA live timer)
   - Ticket Detail: ✅ Full match (drawer, sidebar sections, SLA, custom attributes)
   - Ticket Room: ✅ Full match (chat, mention, tabs, close/reopen)
   - Bulk Reply: ✅ Full match (XLSX, async job, API)
   - Export: ✅ Full match
   - Snooze: ✅ Full match (single + bulk)
   - View Scope: ✅ Full match (8 role-based views)
   - Type Settings: ✅ Full match (6 field types, state builder, read-only)
   - Linked Chat Bubble: ✅ Absorbed into Detail
   - Search Relevance: ✅ New V2 feature, fully implemented
   - Create Consistency: ✅ New V2 feature, fully implemented
   - **Related Tickets & Merge**: ❌ Satu-satunya fitur V2 yang belum di FE

3. **SLA Ticket** (PRD Ticket - SLA ticket.md) sudah fully implemented di FE:
   - `firstResponseDue`/`timeToCloseDue` for per-ticket FRT/TTC
   - `StageTicket.sla` for per-stage tracking
   - `slaState.isPaused` for Waiting on Customer pause
   - `slaState.cycleId` for reopen new cycle
   - `officeHoursSnapshot` for snapshot at cycle start

4. **Rekomendasi:**
   - **Gunakan V2 sebagai source of truth** untuk semua analisis Ticket ke depan
   - SLA Ticket PRD tetap relevan sebagai referensi definisi lifecycle ticket SLA
   - Satu gap: Related Tickets & Merge (V2 file 5) — perlu timeline dari PM
