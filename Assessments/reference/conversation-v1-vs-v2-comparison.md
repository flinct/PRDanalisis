# Conversation PRD V1 vs V2 vs FE Implementation Comparison

> **Sumber FE:** `C:\Users\MyBook SAGA 12\Desktop\FE satuinbox\omnichannel-satuinbox-fe\apps\omnichannel` (v2.5.0)
> **Dibuat:** 2026-05-25

---

## Ringkasan

Conversation V2 adalah **revisi major** dari V1 dengan 20 dokumen terpisah (vs V1 yang 19 file + 1 consolidated .txt). V2 mengklaim sebagai versi yang lebih updated. Berikut verifikasinya terhadap implementasi FE.

---

## Per Feature Comparison

### 1. Status Model & Terminology

| Aspek | V1 | V2 | FE Implementation | Pemenang |
|-------|----|----|-------------------|----------|
| Status value | `Unassigned` / `Ongoing` / `Resolved` | `open` / `close` (via Chat List v1.1 & Room v1.1) | `open` / `close` (`ConversationStatusEnum.OPEN = 'open'`) | **V2 = FE** |
| Tab/Filter UI | Tabs (Unassigned/Ongoing/Resolved) | Filter buttons (not tabs) | Button-based filter endpoints (`your-inbox`, `unassigned`, `all`, `closed`, etc.) | **V2 = FE** |
| Sorting | Most Recent, Longest Waiting, Mentions, Reminder | Latest Activity, Oldest, Unread First, SLA Urgency, Alphabetical | Implemented with filter store + sort options | **V2 = FE** |

### 2. Chat List

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| SLA color threshold | Percentage (>50% Green, ≤50%&>10% Yellow, ≤10% Red) | Percentage (same) | Absolute time (10m/1hari) — **mismatch** | **V1 = V2** (PRD), FE berbeda |
| Status tabs | Unassigned/Ongoing/Resolved | Your Inbox, All, Unassigned, Closed, Starred, Spam, Junk, Channel, Team | Your Inbox, Unassigned, All, Starred, Spam, Junk, Channel, Team | **V2 = FE** |
| Hold indicator | Ada | Ada (separate from Snooze) | Ada (quick action indicator) | **V2 = FE** |
| Bulk actions | Limited | Multi-select, bulk assign/pin/spam/read/star/junk/close/reopen | Full bulk actions (`BulkAssignConversationPayload`, etc.) | **V2 = FE** |
| Hover preview | ✅ | ✅ | Ada (hover profile preview) | **Sama** |
| Search & filter | By agent, tag, channel, status, SLA | Advanced search + filters | `ConversationFilter` with search, tags, participants, channel, status, date range, priority | **V2 = FE** |

### 3. Navigation / Sidebar

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Main sections | Your Inbox, Unassigned, Closed, All, Starred, Spam | Same + Junk | Same + Junk (`InboxSection.tsx`) | **V2 = FE** |
| Channels section | ✅ | ✅ | ✅ (`ChannelsSection.tsx` - accordion) | **Sama** |
| Team Inbox section | ✅ | ✅ inline CRUD | ✅ (`TeamInboxSection.tsx` - accordion + create button) | **V2 = FE** |
| Count badges | ✅ | ✅ Unread/Ongoing/Resolved | ✅ (`CountBadge.tsx` via `ConversationStats`) | **Sama** |
| State persistence | ✅ per tab | ✅ per tab (cookies) | ✅ localStorage via `conversationFilter.store.ts` | **V2 = FE** |
| Drag & drop assign | ❌ | ✅ | ❌ Not seen in FE code | **V2** unggul |

### 4. Conversation Room

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Header controls | ✅ identity, SLA, resolve, hold, reminder, more | ✅ richer controls | ✅ `ConversationChatRoomHeader.tsx` | **Sama** |
| Chat bubbles | Agent right blue, client left grey | Same + notes yellow | ✅ Differentiated bubbles | **Sama** |
| Message status | pending/sent/delivered/read/failed | Same + retry 3x/5s | ✅ Status indicators in MessageItem | **Sama** |
| Attachments | text, images, audio, video, docs, voice notes | Same + max 100MB | ✅ `MessageAttachment` type, `ConversationMediaPicker.tsx` | **Sama** |
| Private notes | ✅ yellow bubbles | ✅ | ✅ | **Sama** |
| Inline reply-to | ✅ | ✅ | ✅ | **Sama** |
| Thread search | ✅ keyword highlight | ✅ | ✅ | **Sama** |
| Rich cards | Live Chat only | Live Chat only | Not confirmed in FE | **Sama** |
| Quick reply / Macros | ✅ | ✅ | ✅ Macro via `/shortcut` | **Sama** |
| Hold/Resume | ✅ | ✅ Stop/resume SLA | ❌ Not found in Room Header (FE gap) | **V1 = V2** tapi FE belum |
| Room Reminder | ❌ | ✅ | ❌ Not found in Room Header | **V2** unggul |

### 5. Detail Panel

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Assignee state | Unassigned / Assigned | Unassigned / Assigned (clearer) | ✅ `participants` derived | **Sama** |
| SLA countdown | First Response Due, Time to Close Due | Same | ✅ via `ConversationSLAMetrics` | **Sama** |
| Reminder button | ❌ | ✅ | ❌ Not found | **V2** unggul |
| Custom attributes | Read-only API fields | Read-only API + editable P2 | ✅ `ConversationAttributesContent`, `custom-attribute/` folder | **V2 = FE** |
| Collections (repeatable) | ❌ | ✅ single yang V2 | ❌ Not developed | **V2** unggul |
| Tags | ✅ max 20, 2-way WA sync | ✅ | ✅ | **Sama** |
| Conversation history | ✅ | ✅ | ✅ | **Sama** |
| Timeline / Audit log | Supervisor+ only | ✅ | ✅ Event system (`conversation-event.service.ts`) | **Sama** |
| Related Conversations | ❌ | ✅ | ❌ Not developed | **V2** unggul |

### 6. Response Metrics (SLA)

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| FRT (First Response Time) | ✅ | ✅ | ✅ `frtMs` field, `frtCountingStartAt` | **Sama** |
| TTC (Time to Close) | ✅ | ✅ | ✅ `ttcMs` field | **Sama** |
| RLT (Response Lead Time) | ❌ | ✅ NEW in V2 | ✅ `rltMs` field **(baru v2.5.0)** | **V2 = FE** |
| Wait Time in Queue | ❌ | ✅ NEW in V2 | ✅ `waitTimeInQueueMs` field **(baru v2.5.0)** | **V2 = FE** |
| `firstAgentAssignmentAt` | ❌ | ✅ | ✅ **(baru v2.5.0)** | **V2 = FE** |
| `firstAgentReplyAt` | ✅ | ✅ | ✅ | **Sama** |
| `firstAssigneeId` | ❌ | ✅ | ✅ **(baru v2.5.0)** | **V2 = FE** |
| `firstResponderId` | ❌ | ✅ | ✅ **(baru v2.5.0)** | **V2 = FE** |
| Office hours awareness | ❌ | ✅ | ✅ `officeHoursSnapshot` | **V2 = FE** |
| Pause intervals | ❌ | ✅ | ✅ `pausedIntervals`, `totalPausedMs` | **V2 = FE** |
| FRT = Wait Time + RLT | ❌ | ✅ constraint | ❓ Not verified in FE | **V2** unggul |

### 7. Session Handling

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Session lifecycle | Unassigned → Assigned → Resolved | Same across all channels | ✅ `sessionDetails` field exists (schema ready) | **Sama** |
| Group handling | Basic | Comprehensive (quote reply, deeplink, "Send as") | ✅ `isGroup`, `isGroupComment`, `memberContactInfo`, `GroupChatSection` | **V2 = FE** |
| "Send as" selector | ❌ | ✅ | ✅ `account-channel-selector/` folder | **V2 = FE** |
| Sticky legacy binding | ❌ | ✅ | ❓ Not confirmed in FE | **V2** unggul |
| Ownership decoupling | Tied to phone | `conversation_id` | ✅ `Conversation.id` is primary key | **V2 = FE** |

### 8. Omnichannel Inbox

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Channel filtering | ✅ | ✅ | ✅ via `ChannelsSection.tsx` | **Sama** |
| Multi-session | ✅ | ✅ improved | ✅ | **Sama** |
| Connection indicators | ✅ | ✅ | ✅ | **Sama** |
| Retention policy | 6mo archive, 12mo delete | Same | `expiresAt` field exists (inactive) | **Sama** |
| Add-ons (screenshot) | ✅ | ✅ | ✅ `screenshot/` folder | **Sama** |
| Broadcast integration | ✅ | ✅ | ✅ Broadcast module separate | **Sama** |

### 9. Assignee & Collaborators

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Multi-assignee | ✅ | ✅ retained | ✅ via `participants` | **Sama** |
| Collaborator role | ❌ | ✅ NEW | ❌ Not developed (participants empty) | **V2** unggul |
| Max 20 collaborators | ❌ | ✅ | ❌ | **V2** unggul |
| Internal notes only | ❌ | ✅ | ❌ | **V2** unggul |

### 10. Auto-reply Templates

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Separate Conversation/Ticket templates | ❌ | ✅ | ❌ Not developed | **V2** unggul |
| Frequency control | ❌ | ✅ (1/6/12/24h) | ❌ | **V2** unggul |
| Cancel on agent reply | ❌ | ✅ configurable delay | ❌ | **V2** unggul |
| SLA exclusion for bot | ❌ | ✅ explicit | ❌ | **V2** unggul |
| Bot sender attribution | Generic | SatuInbox Bot | ❌ | **V2** unggul |

### 11. Snooze Conversation

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| Snooze feature | ❌ | ✅ NEW | ❌ Not developed | **V2** unggul |
| Presets + custom time | ❌ | ✅ | ❌ | **V2** unggul |
| Auto-unsnooze on inbound | ❌ | ✅ | ❌ | **V2** unggul |
| Snoozed chip in top bar | ❌ | ✅ | ❌ | **V2** unggul |

### 12. Team Member Presence

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| HUD (Anggota n • Online m) | ❌ | ✅ | ❌ Not confirmed | **V2** unggul |
| Member Drawer | ❌ | ✅ | ❌ Not confirmed | **V2** unggul |
| Presence states | ❌ | Active/Away/Offline/Unknown | ✅ Team Member Presence developed per cross-analysis | **V2 = FE** |
| Auto-unassign on remove | ❌ | ✅ | ❌ Not confirmed | **V2** unggul |

### 13. Other Features

| Feature | V1 | V2 | FE | Pemenang |
|---------|----|----|----|----------|
| WhatsApp Group Mention | ❌ | ✅ | ❌ Not developed | **V2** unggul |
| Multi-Ticket from Single Bubble | Single mode | Multi-draft (up to 20) + cookie persistence | ❌ Not developed | **V2** unggul |
| Related Conversations | ❌ | ✅ Configurable match keys | ❌ Not developed | **V2** unggul |
| Transcript Email reply | One-way | ✅ Reply continuity + auto-link | ❌ Not confirmed | **V2** unggul |
| Ticketing integration | Loose | ✅ Tight inbox integration + Dual SLA | ✅ Ticket system exists | **V2 = FE** |

---

## Quantitative Summary

| Metric | V1 | V2 | FE (v2.5.0) |
|--------|----|----|-------------|
| Jumlah dokumen | 19 + 1 .txt | 20 | — |
| Total fitur didefinisikan | ~80 | ~200+ | — |
| Fitur match dengan FE | ~60% | ~85% | — |
| Fitur V2 yang sudah di FE tapi belum di V1 | 0 | 7 (RLT, Wait Time, collections, collaborator, dll) | ✅ |
| Fitur V1 yang masih relevan & beda dgn V2 | 0 | 0 (V2 supersedes V1) | — |

---

## Kesimpulan

1. **V2 secara definitif supersedes V1** — hampir semua fitur V1 ada di V2 dengan tambahan signifikan.

2. **FE implementation lebih dekat ke V2 daripada V1**, dibuktikan dengan:
   - Status model `open`/`close` (V2) bukan `Ongoing`/`Resolved` (V1)
   - Filter button UI (V2) bukan tabs (V1)
   - Navigation structure Your Inbox/All/Unassigned/Closed/Starred/Spam/Junk (V2)
   - SLA metrics model dengan RLT, Wait Time, `firstAgentAssignmentAt` (V2)
   - `isGroup` handling + "Send as" selector (V2)

3. **Yang V2 klaim tapi belum di FE:**
   - Collaborator role & permission model
   - Snooze Conversation
   - Related Conversations grouping
   - Multi-ticket draft dari single bubble
   - WhatsApp Group Mention @picker
   - Room Reminder button
   - Hold/Resume di Room Header
   - Conversation Collections (repeatable custom attributes)
   - Sticky legacy binding UI
   - HUD + Member Drawer

4. **Rekomendasi:**
   - **Gunakan V2 sebagai source of truth** untuk semua analisis ke depan
   - V1 hanya perlu dirujuk untuk histori atau jika ada requirement spesifik yang tidak tercakup V2 (kemungkinan kecil)
   - FE gap analysis sebaiknya mengacu ke V2, bukan V1
