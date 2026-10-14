# Change Intake Brief: In-Chat Navigation (Search / Unread Anchor / Tag Trace / Reply-Private Jump)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** User chat request (2026-10-14) — 4 keluhan UX in-chat agent (grup & personal)
> **Artifact Path:** `Assessments/conversation/in-chat-navigation/in-chat-navigation-change-intake-brief.md`
> **Version:** `v1.1`
> **Previous Version:** `v1.0` (2026-10-14, same day)
>
> **⚠️ Koreksi v1.1:** re-audit (BE `master` + FE `data-cy`) menemukan #1 search **BUKAN greenfield**. Global-search stack sudah shipped (BE `conversation-search.*` + Atlas Search + message-body window 500; FE `global-search/` 13 komponen). Gap #1 = **in-room scope (`conversationId`) + jump-to-messageId**, bukan seluruh stack. Scroll-to-bubble infra (`handleScrollToElement`/`getBubleRefs`) sudah reusable untuk #1/#2/#3. Reply-click→scroll (#4 reply biasa) sudah shipped; gap #4 = edge-case reply-private.
> **Rules Applied:** `Rules/core/change-management.md`, `Rules/core/task-router.md`, `Rules/core/analysis-and-risk.md`
> **Supporting Context:** `Memory/global-memory.md` (group room history limited; WA Group Mention undeveloped), BE repo `omnichannel-satuinbox-be` `v2.7.0`
> **Tanggal Intake:** 2026-10-14
> **Status:** Scoped — SPLIT_REQUEST (Lane 1 sprint-ready, Lane 2 needs discovery)

---

## 0. Ringkasan Update Brief

- Initial version. Mengkaji 4 keluhan UX in-chat agent yang **terpisah** dari request History Sync (`Assessments/whatsapp-web/history-sync/`). History Sync = ingest/pipeline/RMQ; request ini = navigasi & pencarian di dalam room yang sudah ter-render. **Jangan digabung scope-nya.**
- Verifikasi BE: sebagian fitur **sudah punya data foundation** (mention, reply reference), sebagian **greenfield** (search in-conversation).
- Constraint utama: group room history masih **limited/unavailable** di V2 (`Memory/global-memory.md` baris 124, 353). Keempat keluhan user eksplisit soal **grup**.

---

## 1. Request Snapshot

**Request Summary — 4 masalah (Detail) + 4 ekspektasi (Expected Result):**

| # | Masalah (current) | Ekspektasi (expected) |
|---|---|---|
| 1 | Tidak ada tracking/search chat di dalam grup untuk cek history | Fitur **search chat** di dalam grup/personal untuk cek history |
| 2 | Buka chat belum terbaca → view langsung ke bubble terakhir, bukan ke bubble unread → agent scroll-scroll | Buka chat unread → view **menampilkan bubble unread pertama** (anchor) |
| 3 | Client tag nomor terhubung → tidak ada fitur cari bubble yang di-tag (seperti WhatsApp) → agent scroll-scroll | Fitur **cek/trace tag** untuk tahu bubble mana yang di-tag |
| 4 | Client reply privately di grup → klik reply tidak refer ke chat asal di grup | Reply-private **bisa diklik → refer ke chat asal di grup** untuk tahu history |

**Business Problem:** Agent kehilangan waktu scroll manual untuk menemukan konteks (history, unread, mention, reply source), terutama di grup. Beban operasional per percakapan, bukan blocker fitur.

**Target User / Role:** Agent (primary), Supervisor. Konteks dominan: **grup WhatsApp**.

**Expected Outcome:** Navigasi konteks in-chat instan (jump-to-message) tanpa scroll manual.

**Urgency / Why Now:** Keluhan operasional nyata dari agent (efisiensi handling). Demand sisi efisiensi = **L3 kandidat** (workflow friction berulang), perlu konfirmasi frekuensi.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `COMPOSITE_CHANGE` — 4 fitur dengan foundation & delivery path berbeda |
| Primary Domain | Conversation Room (Conversation V2 file 9/10) — WhatsApp grup & personal |
| Request Shape | Add (4 navigasi baru) |
| Initial Complexity Signal | **Moderate** (bukan Critical — read-only navigasi, tidak sentuh ingest/counter/SLA) |
| Needs Split? | **Yes** — 2 lane (lihat §6) |

### Classification Rationale
- Semua 4 fitur = **read-only navigasi** di dalam data yang sudah ter-ingest. Tidak menulis ke pipeline inbound, tidak menyentuh counter/SLA/assignment. Blast radius jauh lebih kecil dari History Sync.
- Split karena foundation beda: #3/#4 punya data model siap; #1 greenfield BE; #2 butuh field baru.

### Demand Screen
| Level | Penilaian | Catatan |
|---|---|---|
| Demand | **L3 kandidat** (friction operasional berulang) | Belum ada metrik frekuensi/jumlah agent terdampak. Konfirmasi sebelum full PRD Lane 2. Lane 1 (#3/#4) low-cost → boleh jalan paralel dengan konfirmasi. |

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | Conversation V2 file 9 (Room v1.1), file 10 (Detail v2.1). Room search scope saat ini = "current conversation only" (`Memory/global-memory.md` baris 69). Tidak ada PRD khusus in-chat message search / unread anchor / mention trace / reply-private jump. |
| PRD status | Not found (sebagai fitur bernama) |

### 3.2 Implementation Status (BE verified — repo `v2.7.0`)
| Fitur | Foundation | Evidence |
|---|---|---|
| #1 Search chat in-conversation | ⚠️ **SEBAGIAN ADA** (koreksi v1.1) — global-search message-body stack sudah shipped; in-room scope + jump-to-messageId belum | BE `conversation-search.{controller,service,repository}.ts` (`searchGlobal`, TRD §6.1, `DEFAULT_MESSAGE_WINDOW=500`, `buildMessageMatchSnippet`) + Atlas Search index + FE `global-search/` (13 komponen). Scope = companyId global; return = conversation-level + snippet (bukan messageId). Gap = scope `conversationId` + return `messageId` + reuse `handleScrollToElement` |
| #2 Unread anchor | ⚠️ **PARTIAL** — `unread` count ada per-conversation; **first-unread message pointer belum ada** | `conversation.ts:702,762` (`unread: number`). Tidak ada field "firstUnreadMessageId" |
| #3 Tag/mention trace | ✅ **DATA ADA** — belum ada UI trace | `conversation.ts:580` `mentions: MessageMention[]`, `:585` `mentionAll`, `:734` `unreadMentionCount`; `mention-sentinel.constant.ts` (`MENTION_ALL_SENTINEL_JID`) |
| #4 Reply-private jump | ✅ **DATA ADA** — belum ada anchor/jump UI; reply-private flag belum dibedakan | `conversation.ts:572` `replyFromMessage?: MessageWithStringReplyMessage`, `:620` `replyFromMessage?: string`; `isJidGroup` ingest util ada (`baileys.util.ts`); **no `replyPrivately` handling** (grep 0 hits) |

### 3.3 Protected / Constraint Behavior
- **Group room history limited/unavailable di V2** (`Memory/global-memory.md` baris 124: "Group room history currently limited/unavailable per V2"; baris 353: "WA Group Mention belum diimplementasi FE+BE"). **Keempat fitur user eksplisit soal grup** → bergantung pada status dukungan group-room. **Blocking prasyarat Lane 1 untuk konteks grup.**
- Room search scope existing (current conversation only) tidak boleh berubah jadi cross-conversation tanpa review RBAC (`Memory` baris 69).

---

## 4. Scope Boundary

### 4.1 In Scope
- **#1 Message search in-conversation** (grup + personal): cari teks di dalam 1 room, hasil = daftar bubble match + **jump-to-message dengan context window** (ambil N pesan sekitar hasil).
- **#2 Unread anchor**: saat buka room unread, viewport anchor ke **bubble unread pertama** (bukan bubble terakhir), dengan divider "Pesan belum dibaca".
- **#3 Mention/tag trace**: panel/indicator yang me-list bubble di mana nomor terhubung di-mention (`@`), klik → jump ke bubble. Analog fitur mention WhatsApp.
- **#4 Reply-private jump**: bubble reply-private di grup menjadi clickable → jump/refer ke bubble asal di room grup tsb.

### 4.2 Out of Scope
- Cross-conversation / global message search (tetap scope per-room; global search = request terpisah, sentuh RBAC).
- History ingest / backfill pesan lama (itu domain History Sync — jangan dicampur).
- Mention **compose** (agent mengetik `@`) — ini tentang **trace mention masuk**, bukan menulis mention. (WA Group Mention compose = fitur terpisah yang belum developed.)
- Search media/attachment content (teks dulu).

### 4.3 Protected Existing Behavior (NON-NEGOTIABLE)
- **Counter / SLA / assignment TIDAK boleh terpengaruh.** Semua 4 fitur read-only navigasi; jangan trigger read-state write yang mencemari `unread`/counter kecuali diputuskan eksplisit (khususnya #2 anchor — menampilkan ≠ menandai sudah dibaca).
- **Room search scope tetap per-conversation** (baris 69) — jangan bocor ke RBAC scope lain.
- **Performa room render** tidak boleh degradasi (zero-tolerance perf) — search & jump-to-context harus paginated/indexed, bukan load-all-messages.

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle | Low | Read-only navigasi; tidak mutasi conversation state (kecuali #2 anchor harus hati-hati read-state) |
| RBAC / visibility | **Yes** | Search in-conversation harus tetap dalam room yang boleh diakses agent. #1 jika diperluas cross-room = RBAC risk |
| API / socket / queue | **Yes (#1 saja)** | #1 butuh endpoint baru (search + jump-to-context cursor). #2/#3/#4 mayoritas FE pakai data existing |
| SLA / counter | **Yes (guard)** | #2 unread anchor: menampilkan bubble unread ≠ mark-as-read. Pastikan tidak menulis read-state tak sengaja → cemari counter |
| Migration / feature flag | Low | #2 mungkin butuh 1 field (first-unread pointer) atau derive di FE dari `unread` + message list |
| Regression scope | Medium | Room render, scroll behavior, read-state, mention rendering, reply preview |

### Early Blast-Radius Notes
- **Bukan reproduksi outage.** Berbeda dari History Sync, fitur ini tidak menyentuh ingest/RMQ. Risk utama = **perf room render** (search/jump harus cursor-based) + **read-state correctness** (#2).
- **Group dependency nyata.** Jika group room belum fully-support (Memory limited), #3/#4 untuk grup terblokir pada fondasi tsb. Verifikasi dulu.
- **#1 jump-to-context** secara teknis mirip pagination cursor History Sync Mode B (fetch N around anchor) — pola bisa di-reuse, tapi sumbernya DB lokal, bukan Baileys.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | **`SPLIT_REQUEST`** → Lane 1 PROCEED (sprint-ready), Lane 2 `HOLD_NEEDS_DISCOVERY` |
| Recommended Next Rules | `Rules/core/requirements.md`, `Rules/core/test-design.md` |
| Recommended Next Artifact | PRD Lane 1 (#3 + #4) setelah group-room status dikonfirmasi; spike + PRD Lane 2 (#1 + #2) setelah OQ terkunci |
| Can Proceed to PRD? | **Lane 1: Yes** (pending group-room confirm). **Lane 2: No** (kunci OQ dulu) |

### Split Rationale
- **Lane 1 — Sprint-ready (P1): #4 Reply-private jump + #3 Tag/mention trace.** Data foundation sudah ada (`replyFromMessage`, `mentions`, `unreadMentionCount`). Mayoritas FE (anchor + scroll + panel). Blast radius kecil. Bisa masuk sprint sekarang (pending group-room confirm).
- **Lane 2 — Needs discovery (P2): #1 Search in-conversation + #2 Unread anchor.** #1 **bukan greenfield** (koreksi v1.1) — extend `searchGlobal` dengan scope `conversationId` + return `messageId`, reuse Atlas pipeline + `handleScrollToElement`. #2 butuh first-unread pointer + guard read-state. Spike kecil dulu (perf in-room query, jump-to-context load-more, read-state guard), sprint berikutnya.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking | Lane | Owner |
|----|----------------|----------------|----------|------|-------|
| OQ-01 | **Group-room support status**: apakah group room sudah fully-render history & mention di FE+BE saat ini? (Memory bilang limited/unavailable.) | Keempat fitur eksplisit soal grup. Jika grup belum stabil, Lane 1 untuk grup terblokir. | **Yes** | Both | PM + BE + FE |
| OQ-02 | **#2 anchor vs read-state**: menampilkan bubble unread pertama — apakah membuka room tetap mark-as-read seperti sekarang, atau anchor-only tanpa mark? | Salah handling → cemari `unread`/counter (protected behavior). | **Yes** | Lane 2 | PM + BE |
| OQ-03 | **#1 search semantics**: scope (teks saja? + sender/tanggal?), jump-to-context window size, cursor pagination design, index strategy (perf). | Greenfield BE; perf zero-tolerance; menentukan effort. | **Yes** | Lane 2 | BE + Architecture |
| OQ-04 | **#3 mention trace scope**: trace mention ke **nomor terhubung** saja, atau semua mention? Termasuk `@all`? Panel vs inline-indicator UX. | Menentukan filter data & UI. | No | Lane 1 | PM |
| OQ-05 | **#4 reply-private detection**: apakah ingest sudah membedakan reply-private vs reply biasa (BE belum ada `replyPrivately` handling)? Jika belum, perlu 1 field/flag di ingest. | Menentukan apakah #4 pure-FE atau butuh BE kecil. | **Yes** | Lane 1 | BE |
| OQ-06 | **Demand confirmation**: frekuensi/jumlah agent terdampak (L3 verify). | Prioritisasi sprint. | No | Both | PM |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status |
|--------|------------|--------|
| PM / Analyst (Dany Christian) | Scope lock + demand confirm | Pending |
| Engineering Lead (Naftal Yunior) | Group-room status, search index design, reply-private flag | Pending |
| FE Lead | Anchor/scroll/jump-to-message, mention panel, reply preview click | Pending |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | Reuse |
|---------------------|------|-------|
| Assessment Report | `Assessments/conversation/in-chat-navigation/in-chat-navigation-assessment.md` | scope, foundation verification, lane split, risk |
| PRD Lane 1 | `PRD/Conversationv2/In-Chat Navigation/` (TBD) | #3/#4 scope, data model, OQ-04/05 |
| PRD Lane 2 | `PRD/Conversationv2/In-Chat Navigation/` (TBD) | #1/#2 scope, OQ-02/03 |
| QA Pre-Implementation | `Assessments/conversation/in-chat-navigation/...` | regression: room render, read-state, scroll |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-10-14 | Initial brief. 4 keluhan UX in-chat dipisahkan dari History Sync. BE foundation diverifikasi (mention/reply ADA, search TIDAK ADA). Group-room limited = blocking constraint. Routed SPLIT_REQUEST: Lane 1 (#3+#4) sprint-ready, Lane 2 (#1+#2) needs discovery. | Dany Christian (PM) |
| 2026-10-14 (v1.1) | Koreksi material: #1 search BUKAN greenfield — global-search stack (Atlas + `searchGlobal` + window 500 + FE `global-search/`) sudah shipped; gap = in-room scope + jump-to-messageId. Scroll-to-bubble infra reusable. Reply-click→scroll sudah shipped (gap #4 = reply-private edge-case). §0/§3.2/§6.1 di-update; effort #1 diturunkan; keputusan SPLIT_REQUEST tetap. | Dany Christian (PM) |
