# Comprehensive Undeveloped Features Analysis

> **Sumber FE:** `omnichannel-satuinbox-fe` (v2.5.0)
> **Sumber BE:** `omnichannel-satuinbox-be` (NestJS, gRPC, MongoDB, RabbitMQ)
> **Dibuat:** 2026-05-25

---

## Ringkasan

Setelah validasi dengan FE repo dan BE repo, berikut daftar fitur dari V2 yang **belum developed di FE maupun BE**.

| Domain | Total V2 Fitur | Developed | Undeveloped | % |
|--------|---------------|-----------|-------------|---|
| Conversation | ~20 | ~12 | **8** | 60% |
| Ticket | ~12 | ~11 | **1** | 92% |
| WhatsApp Web | ~13 | ~7 | **6** | 54% |

---

## 1. Conversation — 8 Fitur Undeveloped

### 1.1 Collaborator Role (V2 file 2)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Assignees & Collaborators v1.0 (file 2) |
| **FE Status** | ❌ Undeveloped. Participants sebagai assignee sudah ada, tapi konsep "collaborator" (view + internal notes only) tidak ada |
| **BE Status** | ❌ Undeveloped. Tidak ada `collaborator` field/role di `conversation.schema.ts`. Hanya `participants` array |
| **Impact Area** | Auth/RBAC, room composer (disable reply for collaborator), ticket room permission model, reporting attribution (collaborator excluded from SLA metrics), move policy |
| **QA Handling** | Medium-High risk. Privilege leak: collaborator bisa reply, close, resolve. Test blocked reply di submit time (not just UI). Pastikan user tidak muncul di `assigneeIds` dan `collaboratorIds` bersamaan. Pastikan reporting atribusi hanya ke assignee |

### 1.2 Snooze Conversation (V2 file 16)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Snooze v1.0 (file 16) |
| **FE Status** | ❌ Undeveloped. Ticket snooze sudah ada, conversation snooze tidak |
| **BE Status** | ❌ Undeveloped. Tidak ada `snooze` field di `conversation.schema.ts`. Hanya ticket yang punya `TicketSnooze` |
| **Impact Area** | Chat list (chip Snoozed, count, filter), room/detail (header label, edit/cancel), reminder precedence (snooze overrides reminder), inbound socket (auto-unsnooze), SLA visibility |
| **QA Handling** | Medium risk. Test: snooze hanya future time, hidden from Open/Closed lists, auto-unsnooze on inbound, wake returns to original list, closed+snooze returns to closed. Pastikan status tidak berubah. Test concurrency: edit by 2 users |

### 1.3 Related/Relational Conversations (V2 file 19)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Related Conversations v1.0 (file 19) |
| **FE Status** | ❌ Undeveloped. Group chat handling ada (`isGroup`), tapi relasi Primary+Child antar conversation tidak ada |
| **BE Status** | ❌ Undeveloped. Tidak ada `relatedConversationIds` atau `parentConversationId` di `conversation.schema.ts` |
| **Impact Area** | Chat list (parent/child row, unread aggregation, sort by latest child), room (grouped tabs), detail (linked drawer), custom attributes matching, ticket context overlap, create ticket ambiguity (child vs primary) |
| **QA Handling** | High risk. Parent row sort by latest child. Parent unread = aggregate children. Test: link/unlink, set primary, combine groups, customer notice. Test unlink → dissolve group when 1 remains. Test sorting integrity |

### 1.4 WhatsApp Group Mention (V2 file 15)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | WA Group Mention v1.0 (file 15) |
| **FE Status** | ❌ Undeveloped. Tidak ada @mention picker. Hanya macro `/shortcut` |
| **BE Status** | ❌ Undeveloped. Tidak ada mention validation logic di BE |
| **Impact Area** | WA group composer, participant metadata loading, mention token send path, timeline rendering (highlight + tooltip), sender identity in group context |
| **QA Handling** | Low risk. Scope sempit ke WA group authoring. Test: @ opens picker, filter by name/number, max 100 mentions, invalid mention dropped with warning, fallback plain text. No impact to ownership/routing/SLA |

### 1.5 Auto-reply Templates (V2 file 1)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Availability Auto-Reply v1.0 (file 1) |
| **FE Status** | ❌ Undeveloped. Hanya Macros (`/shortcut`) yang ada |
| **BE Status** | ❌ Undeveloped. Tidak ada auto-reply engine, schedule, atau template di BE |
| **Impact Area** | Inbound pipeline (auto-reply before agent), office hours config, agent availability (Away/AUX/max capacity), ticket context resolution, SLA exclusion (bot reply ≠ FRT/ART), channel outbound capability, delay scheduler + cancel-on-agent-reply |
| **QA Handling** | High risk. Bot salah kirim ke customer = critical. Test: outside hours trigger, no-agent trigger, frequency limit, cancel-on-agent-reply, bot message distinct (non-editable), bot not counted as FRT/ART. Integration test with presence (Away = unavailable per V2 Auto-Reply) |

### 1.6 Room Reminder (V2 file 9)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Room v1.1 (file 9) |
| **FE Status** | ❌ Undeveloped. Tidak ada reminder button di Room Header |
| **BE Status** | ❌ Undeveloped. Tidak ada reminder scheduler/engine untuk conversation room |
| **Impact Area** | Room header (reminder button), Chat List (reminder sorting), notification system, snooze precedence |
| **QA Handling** | Low-Medium risk. Test: set one-time/recurring reminder, cancel, notification delivery. Test precedence: snooze defers reminder |

### 1.7 Hold/Resume di Room Header (V2 file 9)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Room v1.1 (file 9) |
| **FE Status** | ❌ Undeveloped. Hold/Resume button tidak ada di Room Header |
| **BE Status** | ❌ Undeveloped. Tidak ada Hold state management di conversation-service |
| **Impact Area** | Room header, Chat List hold indicator, SLA pause (V2 Room says Hold pauses SLA, but V2 Snooze says no pause — 3-way conflict unresolved) |
| **QA Handling** | Medium risk. Tergantung keputusan final Hold vs Snooze vs SLA pause policy. Test: Set Hold → SLA pause, Resume → SLA resume. Test overlap: Hold + Snooze coexist |

### 1.8 Collections (Repeatable Custom Attributes) (V2 file 11)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Custom Attributes v1.0 (file 11) |
| **FE Status** | ❌ Undeveloped. Single custom attributes sudah ada, Collections (repeatable grouped entries) tidak |
| **BE Status** | ❌ Undeveloped. Tidak ada collection/grouped attribute schema |
| **Impact Area** | Conversation detail (sidebar), search (attribute values included in search), relational matching source |
| **QA Handling** | Low-Medium risk. Test: add collection entries, edit, remove, flat mode for single collection, "X lainnya" overflow. Search includes collection values |

---

## 2. Ticket — 1 Fitur Undeveloped

### 2.1 Related Tickets & Merge (V2 file 5)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Related Tickets and Merge v1.0 (file 5) |
| **FE Status** | ❌ Undeveloped. Tidak ada related tickets drawer atau merge flow |
| **BE Status** | ❌ Undeveloped. Tidak ada `relatedTicketIds`, `mergedTicketId`, atau merge logic di `ticket.schema.ts` atau `ticket.service.ts` |
| **Impact Area** | Ticket list (parent/child row, expand), ticket detail (related section), merge (sub ticket read-only, redirect), customer notice after merge, SLA remains per-ticket corridor |
| **QA Handling** | High risk. Merge irreversible (Phase 1 no undo). Test: link/unlink related tickets, merge (main + sub), sub ticket becomes read-only with redirect, customer notice sent, SLA stays per-ticket. Test: unlink after merge → group dissolves |

---

## 3. WhatsApp Web — 6 Fitur Undeveloped

### 3.1 Import Modes (V2 file 6)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Import Modes v2.0 (file 6) |
| **FE Status** | ❌ Undeveloped. Tidak ada mode selector atau target selection UI |
| **BE Status** | ❌ **Not in BE.** Tidak ada import-mode module/service/schema di `whatsapp/` service |
| **Impact Area** | Account connection flow (post-connect target selection), inbound chat filtering (Full/Whitelist/Exclude), account list (import mode chip), audit logging |
| **QA Handling** | Medium risk. BE-heavy: inbound filtering logic. Test: Full Import (all chats enter), Whitelist Only (only selected, max 5000 targets), Exclude (all except). Test mode change (applies to future inbound only). Test encrypted restricted targets |

### 3.2 Broadcast Humanization (Anti Spam file 1)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Anti Spam System file 1 |
| **FE Status** | ❌ Undeveloped. Tidak ada toggle/preview di composer |
| **BE Status** | ❌ **Not in BE.** Tidak ada di `broadcast-service/`. Tidak ada sentence-splitting, bubble grouping, atau self-quote logic |
| **Impact Area** | Broadcast delivery pipeline, message splitting (1-4 bubbles per recipient), typing/presence simulation per bubble, billing (counts as 1 broadcast) |
| **QA Handling** | Medium risk. BE-heavy. Test: wall-of-text split correctly (sentence boundaries), protected abbreviations (Bp., Jl., No., dr.), self-quote toggle, inter-bubble gaps (500-2500ms), max 5 bubble cap. Billing: 1 broadcast regardless of parts |

### 3.3 Warming System (Anti Spam files 2, 3)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Anti Spam System files 2, 3 |
| **FE Status** | ❌ Undeveloped. Tidak ada warming page, transcript viewer, atau settings |
| **BE Status** | ❌ **Not in BE.** Tidak ada warming engine, topology engine, atau transcript assignment |
| **Impact Area** | Account readiness (levels 1-5, daily caps), internal conversations (never visible in Inbox), network topology (small-world graph 3-6 accounts/cluster), content humanization (typos, slang, continuity) |
| **QA Handling** | High risk (if implemented). Complex: auto-pairing, level-up, content variation. Test: ghost mode (warming never leaks to Inbox), transcript queue, auto-level-up thresholds. Integration with future round robin |

### 3.4 Account Pools & Rotation (Anti Spam file 4)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Anti Spam System file 4 |
| **FE Status** | ❌ Undeveloped. Tidak ada auto-rotation UI atau 3-tab layout (Akun Umum, Grup, Cadangan) |
| **BE Status** | ❌ **Not in BE.** Tidak ada auto-rotation logic, eligibility check, atau outbound limit enforcement |
| **Impact Area** | Account group management (3 tiers: General, Group, Backup), auto-use Backups toggle, Group Rotation toggle, configurable Outbound Limit (global or per-account) |
| **QA Handling** | Medium risk. Extends existing Account Groups (V2 file 4). Test: auto-promote backup when active account ineligible, group rotation switches within group before using backup, outbound limit blocks send when exceeded. Move constraints |

### 3.5 Bulk Scan QR Popup (V2 file 3)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Bulk Scan QR v2.0 (file 3) |
| **FE Status** | ⚠️ Partial. Single QR connect ada, bulk queue popup tidak |
| **BE Status** | ⚠️ Partial. `GetQRCode` gRPC ada, tapi bulk queue session management tidak |
| **Impact Area** | Account activation workflow, popup UI (queue navigation, auto-advance), real-time status update, public link sharing |
| **QA Handling** | Low-Medium risk. Test: popup opens with inactive accounts only, QR/Pairing toggle, Next/Previous/Skip navigation, "Bulk Scan All" sequential auto-advance, progress tracking |

### 3.6 Pairing Code & Public Links (V2 files 2, 3)

| Aspek | Detail |
|-------|--------|
| **V2 Source** | Add Account v2.2 (file 2), Bulk Scan (file 3) |
| **FE Status** | ❌ Undeveloped. QR only, no Pairing Code or Public Link |
| **BE Status** | ❌ Undeveloped. BE hanya support QR (`GetQRCode`). Pairing Code endpoint tidak ditemukan |
| **Impact Area** | Connection method (alternative to QR), remote scanning (public link with 10-min TTL, single-use HTTPS) |
| **QA Handling** | Low risk. Test: Pairing Code generation + scan, Public Link generation + expiry (10 min, single-use). Security: HTTPS only, TTL enforcement |

---

## 4. Impact Matrix — Semua Undeveloped Features

| # | Fitur | Domain | Risk | FE | BE | Impact Area Utama |
|---|-------|--------|------|----|----|-------------------|
| 1 | Auto-reply Templates | Conv | 🔴 HIGH | ❌ | ❌ | Inbound pipeline, SLA exclusion, availability |
| 2 | Collaborator Role | Conv | 🔴 HIGH | ❌ | ❌ | Auth/RBAC, composer, reporting attribution |
| 3 | Related/Relational Conversations | Conv | 🔴 HIGH | ❌ | ❌ | Chat list structure, room tabs, unread aggregation |
| 4 | Snooze Conversation | Conv | 🟡 MED | ❌ | ❌ | List visibility, reminder precedence, SLA |
| 5 | WA Group Mention | Conv | 🟢 LOW | ❌ | ❌ | WA group composer, rendering |
| 6 | Room Reminder | Conv | 🟢 LOW | ❌ | ❌ | Room header, notification |
| 7 | Hold/Resume di Header | Conv | 🟡 MED | ❌ | ❌ | Room header, SLA pause policy |
| 8 | Collections | Conv | 🟢 LOW | ❌ | ❌ | Detail sidebar, search |
| 9 | Related Tickets & Merge | Ticket | 🔴 HIGH | ❌ | ❌ | Ticket list, detail, merge integrity |
| 10 | Import Modes | WA Web | 🟡 MED | ❌ | ❌ | Account connection, inbound filtering |
| 11 | Broadcast Humanization | WA Web | 🟡 MED | ❌ | ❌ | Broadcast pipeline, billing |
| 12 | Warming System | WA Web | 🔴 HIGH | ❌ | ❌ | Account readiness, ghost mode |
| 13 | Account Pools Rotation | WA Web | 🟡 MED | ❌ | ❌ | Account groups, outbound limits |
| 14 | Bulk Scan Popup | WA Web | 🟢 LOW | ⚠️ | ⚠️ | Account activation workflow |
| 15 | Pairing Code & Public Links | WA Web | 🟢 LOW | ❌ | ❌ | Connection method |

---

## 5. Cross-Feature Integration Test Suites

### Suite A — SLA & Availability
- Auto-reply (Conv) × Presence (Conv V2 file 17) × SLA Conversation
- Auto-reply × Ticket context (Ticket V2 file 7) × Round Robin (no PRD)
- Snooze (Conv) × Auto-reply × Inbound socket wake-up

### Suite B — Permissions & Collaboration
- Collaborator (Conv) × Room Composer × Reporting Attribution
- Collaborator × Move Policy (Conv V2 file 13) × Team Inbox scope

### Suite C — Grouping & Structure
- Relational Conversations (Conv) × Chat List × Room Tabs
- Relational Conversations × Custom Attributes × Ticket Context
- Related Tickets (Ticket) × Ticket List × Customer Notice

### Suite D — WhatsApp Web Pipeline
- Import Modes × Account Connection × Inbound Filtering
- Broadcast Humanization × Delivery × Billing
- Warming System × Ghost Mode × Account Readiness
- Account Pools Rotation × Groups × Outbound Limits

---

## 6. Release Gate Recommendations

1. **Do not release Auto-reply** without signed-off availability definition (Presence PRD mismatch: Away=Online vs Away=Unavailable).
2. **Do not release Collaborator** without submit-time permission checks and reporting validation.
3. **Do not release Related/Relational Conversations** without unread/sort aggregation regression tests.
4. **Do not release Related Tickets & Merge** without merge integrity and customer notice tests.
5. **Do not release Warming System** without ghost mode validation (warming must never leak to Inbox).
6. **Import Modes, Broadcast Humanization, Warming, Rotation — need PM timeline.** All are 0% developed (FE + BE).
7. **Bulk Scan Popup, Pairing Code, Public Links — low effort.** Single QR connect already exists. Extension to bulk queue + Pairing Code is incremental.
