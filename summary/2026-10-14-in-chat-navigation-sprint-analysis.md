# Summary 2026-10-14 — In-Chat Navigation Sprint Analysis

## Konteks
User minta analisa apakah 4 keluhan UX in-chat agent bisa masuk sprint. Melampirkan 2 file History Sync (`Assessments/whatsapp-web/history-sync/`) — tapi request baru **BUKAN** history-sync.

## 4 Keluhan (grup & personal)
1. Search chat in-conversation untuk cek history
2. Unread anchor — buka chat unread harus ke bubble unread, bukan terakhir
3. Tag/mention trace — cari bubble yang di-tag (seperti WhatsApp)
4. Reply-private jump — klik reply privately di grup → refer ke chat asal

## Temuan kunci (code-verified — BE `master` + FE `data-cy`)
- **#3 mention:** BE `MessageMentionInfo` schema + `unreadMentionCount`; FE render mention chips (`MentionContent`) sudah ada. Data+render ADA → gap = navigator jump. FE-only.
- **#4 reply:** `replyFromMessage` ADA; **reply-click→scroll shipped penuh** (`ReplyMessage`→`useScrollToReplyMessage`→`handleScrollToElement`+load-more+highlight). `replyPrivately` 0 hits → gap = edge-case reply-private saja.
- **#2 unread:** `unread` count ADA; FE `ConversationChatRoomContainer:72` selalu `scrollTop=scrollHeight` (konfirmasi keluhan). First-unread pointer tidak ada; scroll infra reusable.
- **#1 search:** **KOREKSI v1.0.** Global-search stack SUDAH ADA — BE `conversation-search.*` + Atlas Search + `searchGlobal` + message-body window 500 + `buildMessageMatchSnippet`; FE `global-search/` 13 komponen. Scope=companyId global, return conversation-level+snippet. Gap = in-room scope (conversationId) + return messageId. BUKAN greenfield.
- **Blocking:** `Memory` 124/353 — group room history limited/unavailable, WA Group Mention undeveloped FE+BE. Keempat fitur dominan grup.
- **Fondasi besar:** `handleScrollToElement`+`getBubleRefs` reusable untuk jump #1/#2/#3 (dipakai reply/pinned/ticket-linked).

## Decision: SPLIT_REQUEST (tetap, v1.1)
- **Lane 1 (P1, sprint-ready):** #4 reply jump + #3 tag trace. Foundation siap, FE-heavy, read-only. Syarat: OQ-01 (group-room) + OQ-05 (reply-private flag). Jika grup belum stabil → personal dulu.
- **Lane 2 (P2, needs discovery):** #1 search (extend `searchGlobal`, bukan greenfield — effort turun) + #2 unread anchor (read-state guard). Spike kecil dulu.
- **Jangan gabung ke History Sync** — beda domain, read-only vs ingest catastrophic.

## Artifacts (v1.1, 2026-10-14)
- `Assessments/conversation/in-chat-navigation/in-chat-navigation-change-intake-brief.md` (v1.1 — koreksi search)
- `Assessments/conversation/in-chat-navigation/in-chat-navigation-assessment.md` (v1.1 — koreksi search)

## Next
Lock OQ-01 + OQ-05 (gate Lane 1) → PRD Lane 1 di `PRD/Conversationv2/In-Chat Navigation/`. Lane 2 spike extend searchGlobal + unread guard.
