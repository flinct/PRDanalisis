# Assessment Report — Peta Implementasi Fitur WhatsApp Group di FRONTEND SatuInbox

**Scope:** FE repo `omnichannel-satuinbox-fe`, app `apps/omnichannel` (Next.js, `version 1.0.0`; monorepo turbo, shared `packages/types` & `packages/constants`).
**Metode:** code-verified (ripgrep + read file). Semua klaim BUILT/PARTIAL/ABSENT disertai `file:line`. Tanpa bukti kode = `UNVERIFIED`.
**Tanggal:** 2026-10-06.

---

## Executive Summary

- **Pemahaman sistem:** WA group diperlakukan sebagai `Conversation` biasa dengan flag `isGroup`/`isGroupComment`. Grup punya kontak-sebagai-entitas (nama/avatar group = `contactInfo`), daftar member mentah (`memberContactInfo: ContactInfo[]` dengan `isAdmin`,`lid`), dan dukungan penuh **@mention picker + @all** di composer. Mayoritas aksi pesan (reply, edit, delete, pin) generik dan ikut jalan di grup.
- **Risiko utama / gap besar:**
  1. **Tidak ada UI daftar participant / member drawer** — data member ada (`memberContactInfo`) tapi hanya dikonsumsi mention picker; tidak ada komponen yang menampilkan daftar member, role admin badge, atau member count ke user.
  2. **Tidak ada rendering WA group system event** (join/leave/add/remove/promote/demote/subject change/icon change/ephemeral). Enum event FE (`ConversationEventType`) hanya event aplikasi SatuInbox (assign agent, SLA, junk), bukan stub WA group.
  3. **Group settings UI absen** (announcement mode, ephemeral, invite link, membership approval, group info edit).
  4. **Reaction & delete-for-everyone semantics absen**; reaction jatuh ke fallback "unsupported".
  5. **Istilah `participants`/`memberIds`/`MEMBERS_ADDED` di FE ambigu** — mayoritas merujuk **agen assignee**, bukan participant WA group. Risiko salah-baca saat analisis lanjutan.
- **Finding counts:** DEFECT 0 · REQUIREMENT GAP 5 · DESIGN FLAW 1 · INCONSISTENCY 1 · (fitur: BUILT 10, PARTIAL 9, ABSENT 14).
- **Decision:** **PROCEED_WITH_CAUTION** — fondasi group chat (flag, member data, mention) solid, tetapi fitur "manajemen/visibility group" (participant drawer, event rendering, settings) belum ada dan perlu PRD terpisah.

---

## System Model (ringkas)

- **Actors:** Agent (user UI), socket server, WA (via Baileys di BE). FE hanya render + emit.
- **Komponen group-relevan:**
  - Type: `packages/types/src/conversation.ts` (`ContactInfo`, `ConversationContactInfo`, `memberContactInfo`), `packages/types/src/socket.ts` (`MentionTargetPayload`, `mentionAll`).
  - Composer mention: `hooks/conversation/use-mention-autocomplete.ts`, `hooks/conversation/use-group-participants.ts`, `components/molecules/conversations/chat-room/input/ChatRoomMentionSection.tsx`.
  - Header: `components/molecules/conversations/chat-room/ConversationChatRoomHeader.tsx`.
  - Message render dispatch: `components/molecules/conversations/chat-room/ConversationChatroomBuble.tsx:425` (`messageTypeRenderer`), renderers di `components/molecules/message-renderer/*`.
  - Event timeline (aplikasi): `types/conversation/conversation-event.ts`, `components/molecules/conversations/chat-detail/event/ConversationEventItem.tsx`.
- **Sumber kebenaran member group (FE):** `activeConversation.memberContactInfo` (diisi dari BE; di-refresh via `services/conversation/use-refresh-group-participants.service`).

> **Catatan penting (sumber kebingungan):** `participants` di `types/conversation/conversation.ts:88,120` + `ParticipantInfo`/`SocketMemberInfo` di `packages/types/src/socket.ts:113,135,148` = **assignee agen**, bukan member WA group. Member WA group = `memberContactInfo` (`ContactInfo[]`).

---

## FINDINGS — Tabel Fitur × Status × Evidence

Legenda status: **BUILT** (jelas ada di FE), **PARTIAL** (ada sebagian/cosmetic/tanpa UI penuh), **ABSENT** (tidak ada bukti kode), **UNVERIFIED** (tidak ditemukan bukti definitif).

### 1. Group room display

| Fitur | Status | Evidence (file:line) | Catatan |
|---|---|---|---|
| Nama/subject group | PARTIAL | `ConversationChatRoomHeader.tsx:402-405,434,443` (`resolveContactName` → `contactInfo.displayName`) | Nama group tampil lewat path kontak generik, bukan field group khusus. `subject` di `packages/types/src/conversation.ts` adalah subject EMAIL, bukan group subject. |
| Group icon / photo | PARTIAL | `chat-lists/chat-item/AvatarWithFallback.tsx` (`IconUsers`, `aria-label="Group"`; "If ticket or group, don't try to load avatar image - show icon directly"); nav `nav-lists/GroupChatSection.tsx`, `nav-lists/ConversationNavItemDefault.tsx` (`IconUsersGroup`) | Hanya ikon placeholder generik; **foto group asli tidak dimuat**. `ContactInfo.avatar` ada tapi sengaja di-skip untuk group. |
| Group description | ABSENT | — (grep `groupDescription`/`description` pada type conversation: tidak ada field group) | Tidak ada field maupun UI. |
| Member list / participant drawer | ABSENT | — tidak ada komponen member-list group; `memberContactInfo` hanya dikonsumsi `use-group-participants.ts:57` untuk mention picker | Data ada, UI drawer **tidak ada**. |
| Member count | ABSENT | — tidak ada field/compute count yang ditampilkan ke UI | Bisa diturunkan dari `memberContactInfo.length` tapi tidak dirender. |

### 2. Membership UI

| Fitur | Status | Evidence | Catatan |
|---|---|---|---|
| Lihat participant (member WA group) | PARTIAL | `use-group-participants.ts:48-75` (map `memberContactInfo` → participant) | Hanya terlihat dalam dropdown mention saat ketik `@`; tidak ada tampilan daftar member penuh. |
| Nama + nomor member | PARTIAL | `use-group-participants.ts:36,41` (`displayName`, `phone`); picker render di `ChatRoomMentionSection.tsx` | Tampil di konteks mention saja. |
| Role admin badge | PARTIAL | `packages/types/src/conversation.ts:52` (`ContactInfo.isAdmin`), `use-group-participants.ts:11,37` (`isAdmin` dibawa) | Field `isAdmin` ada & dibawa ke participant, **tapi tidak ada badge admin yang dirender** di UI apa pun (grep tidak menemukan render badge). PARTIAL = data ada, UI absen. |
| System message joined/left member | ABSENT | message type enum `packages/constants/src/message.ts:14-33` tidak punya tipe system/stub; `ConversationEventType` (`types/conversation/conversation-event.ts:15-44`) hanya event aplikasi | Tidak ada rendering WA group join/left. |
| add/remove/promote/demote reflected di UI | ABSENT | — tidak ada event/rendering WA group membership change; `MEMBERS_ADDED/REMOVED` (`conversation-event.ts:24-25`, `ConversationEventItem.tsx:34-48`) = **penambahan/penghapusan AGEN ke conversation**, bukan participant WA group | INCONSISTENCY penamaan, lihat finding F-INC-1. |

### 3. Composer group

| Fitur | Status | Evidence | Catatan |
|---|---|---|---|
| Kirim text/media/doc ke group | BUILT | `packages/types/src/socket.ts:44-64` (`OutboundMessagePayload` + `attachments`); dispatch render media/doc `ConversationChatroomBuble.tsx:426-436`; composer `chat-room/input/ChatRoomInputBase.tsx` | Generik, berlaku untuk group (composer tidak di-disable untuk group). |
| @mention picker (ketik @ → daftar participant) | BUILT | `use-mention-autocomplete.ts:50-281` (regex `@`, filter, navigasi keyboard, limit 100); `use-group-participants.ts`; UI `ChatRoomMentionSection.tsx` | Implementasi lengkap termasuk LID-based group handling. |
| @all mention | BUILT | `use-mention-autocomplete.ts:14-28,179-205` (`MENTION_ALL_JID`, `MENTION_ALL_TOKEN`, `selectAllParticipants`); payload `packages/types/src/socket.ts:58-63` (`mentionAll`) | Sentinel → BE expand ke `nonJidMentions=1` (Baileys). |
| Reply / quote | BUILT | `socket.ts:50` (`replyMessageId`); render quote `ConversationChatroomBuble.tsx:627`; `message-renderer/ReplyMessage.tsx:25-44` (`replyFromMessage`); `setReplyMessageData` (`use-conversation-room-detail.ts:62,69`) | Generik; berlaku di group. |
| Edit message | BUILT | `hooks/conversation/use-messages-api.ts` (`editMessage`, `EditMessageRequest`); `hooks/conversation/use-conversation-room-action.ts` (`useEditMessageActions`, `useMutationEditMessage`); `constants/query-key.ts` (`MUTATION_EDIT_MESSAGE`); `ConversationChatroomBuble.tsx` (`useEditMessageActions`) | Generik message action. |
| Delete message | BUILT | `ConversationChatroomBuble.tsx` (`useDeleteMessageHandler`, `onDeleteMessage`/`isDeletable`); `constants/query-key.ts` (`MUTATION_DELETE_MESSAGE`, `MUTATION_BATCH_DELETE_MESSAGE`) | Ada delete + batch delete. |
| Delete-for-everyone (semantics) | UNVERIFIED | — grep `forEveryone`/`deleteType`/`everyone`: tidak ada flag mode delete | Delete ada, tapi tidak terbukti ada opsi "for everyone" vs "for me". Perlu cek BE/API contract. |
| Reaction (kirim) | ABSENT | `message-renderer/UtilityMessage.tsx:57-58` (reaction → `BubbleUnavailableContent` "unsupported"); comment `packages/constants/src/message.ts:28` ("reaction ... unknown future types"); grep `sendReaction`/`onReact`: nihil | Reaction masuk UTILITY lalu ditandai unsupported. |
| Poll | BUILT (render) / PARTIAL (interaksi) | `message-renderer/PollMessage.tsx`; `UtilityMessage.tsx:15-51` (route `pollCreationMessage` v1–v5 → PollMessage; `pollUpdateMessage` disuppress `:29,44-47`) | Poll **dirender**; vote update (`pollUpdateMessage`) disuppress (tidak re-render hasil). Mengirim/membuat poll dari FE: tidak terbukti → interaksi PARTIAL. |
| Pin message | BUILT | `use-messages-api.ts` (`pinMessage`, `getPinnedMessages`, `PinMessageRequest`); `constants/query-key.ts` (`MUTATION_PIN_MESSAGE`,`FETCH_PINNED_MESSAGES`); `hooks/conversation/message-handler/use-scroll-to-pinned-message.ts`; `ConversationChatroomBuble.tsx` (`handlePinMessage`); `chat-detail/content/ConversationPinnedMessagesContent.tsx` | Pin + daftar pinned + scroll-to-pinned. |

### 4. Group events rendering (WA stub)

| Event | Status | Evidence | Catatan |
|---|---|---|---|
| join / leave | ABSENT | message type enum `packages/constants/src/message.ts:14-33` tanpa SYSTEM/stub; dispatcher `ConversationChatroomBuble.tsx:425-437` tanpa handler event group | — |
| add / remove participant | ABSENT | idem; `ConversationEventType` (`conversation-event.ts`) bukan WA group | `MEMBERS_ADDED/REMOVED` = agen. |
| promote / demote | ABSENT | — tidak ada tipe/render | — |
| subject change | ABSENT | — | — |
| icon change | ABSENT | — | — |
| ephemeral/disappearing change | ABSENT | — grep `ephemeral`/`disappearing`: nihil di scope conversation | — |
| WA calendar/event message (bukan stub membership) | BUILT | `message-renderer/EventMessage.tsx:11-16` (`message.metaData.whatsapp.event`); dispatch `ConversationChatroomBuble.tsx:437` (`MessageTypeEnum.EVENT`); `packages/ui/src/components/molecules/buble-contents/EventContent.tsx` | Ini WA **event/meeting invite**, bukan group membership system message. |

### 5. Group settings UI

| Fitur | Status | Evidence | Catatan |
|---|---|---|---|
| Announcement mode indicator | ABSENT | — grep `announcement`/`announce mode` di scope conversation: hanya onboarding/broadcast (tidak relevan) | — |
| Ephemeral indicator | ABSENT | — | — |
| Invite link | ABSENT | — grep `inviteLink`/`invite link`: tidak ada di conversation/group | — |
| Membership approval | ABSENT | — grep `membershipApproval`/`approval`: hanya broadcast/onboarding | — |
| Group info edit | ABSENT | — tidak ada form/edit group info | — |

### 6. Indikator

| Fitur | Status | Evidence | Catatan |
|---|---|---|---|
| isGroup flag | BUILT | `packages/types/src/conversation.ts` (`isGroup?`,`isGroupComment?`); omnichannel `types/conversation/conversation.ts:91-92`; filter & banyak konsumen | Flag ada & dipakai luas. |
| Group vs direct distinction | PARTIAL | `ConversationChatRoomHeader.tsx:185-190,313,317` (hide camera/ticket/close untuk group); `AvatarWithFallback.tsx` (ikon group); `chat-lists/chat-item/QuickAction.tsx` (`isIndividualChat`); `chat-lists/ConversationChatListBulkAction.tsx` (`hasGroupConversation`); nav `GroupChatSection.tsx` | Mayoritas efek = **sembunyikan aksi direct-only** + ikon, bukan UI group-aware kaya. Cosmetic/behavioral guard. |
| Typing indicator multi-agent | PARTIAL | `hooks/conversation/socket/use-listen-is-typing.ts`; `socket/use-conversation-socket-event.ts`; payload `socket.ts:11-13` (`TypingIndicatorPayload`) | Typing ada di level conversation; **tidak terbukti** menampilkan siapa (multi) yang mengetik dalam group. |
| Read receipts | PARTIAL | `helpers/message-status.ts:7-18` (`SENT/DELIVERED/READ` ranking, `isFinalDeliveredState`); enum `packages/constants/src/message.ts:35-43` | Status tick per-pesan ada (generik). **Tidak ada per-participant read receipt** untuk group (WA group = read-by list); hanya status agregat. |

### 7. Room state

| Fitur | Status | Evidence | Catatan |
|---|---|---|---|
| Group archived / inactive | ABSENT (group-specific) | — grep `archived`/`isArchived` hanya ticketing/filter, bukan group room state | Tidak ada state arsip khusus group. |
| Room reminder | ABSENT (group-specific) | — `reminder` hits = SLA/ticket, bukan group | — |
| Hold | ABSENT (group-specific) | — `hold`/`onHold` hits = ticket/SLA konteks | — |
| Removed-from-conversation (agen) | BUILT (tapi bukan WA remove) | `use-conversation-room-detail.ts:39,42,128,146` (`isRemovedFromConversation`) | Ini agen di-unassign dari conversation, **bukan** di-remove dari WA group. Catat agar tidak tertukar. |

---

## Findings (detail klasifikasi)

### F-GAP-1 · P1 · REQUIREMENT GAP · Tidak ada UI daftar participant / member drawer
**Status:** Confirmed. **Location:** FE conversation detail/sidebar.
**Evidence:** `memberContactInfo: ContactInfo[]` tersedia (`packages/types/src/conversation.ts`), tetapi satu-satunya konsumen adalah mention picker (`use-group-participants.ts:57`). Tidak ada komponen member-list group.
**Impact:** Agen tidak bisa melihat anggota group, admin, atau jumlah member dari UI. **Recommendation:** Buat drawer "Group members" dari `memberContactInfo` (nama, nomor, admin badge, count). **Suggested test:** Buka group → verifikasi daftar member + badge admin + count tampil.

### F-GAP-2 · P1 · REQUIREMENT GAP · Tidak ada rendering WA group system event
**Status:** Confirmed. **Location:** message dispatcher + event timeline.
**Evidence:** `MessageTypeEnum` (`packages/constants/src/message.ts:14-33`) tanpa tipe system/stub; `ConversationEventType` (`conversation-event.ts:15-44`) hanya event aplikasi; dispatcher `ConversationChatroomBuble.tsx:425-449` tanpa handler membership event.
**Impact:** join/leave/add/remove/promote/demote/subject/icon/ephemeral tidak terlihat → agen kehilangan konteks perubahan group. **Recommendation:** Tambah tipe system-message group + renderer. **Suggested test:** Trigger member promote di WA → verifikasi system message muncul di timeline.

### F-GAP-3 · P2 · REQUIREMENT GAP · Group settings UI absen
**Status:** Confirmed. **Evidence:** grep announcement/ephemeral/inviteLink/approval/group-info-edit = nihil di scope conversation.
**Impact:** Tidak ada visibilitas/kontrol announcement mode, ephemeral, invite link, approval, edit info group. **Recommendation:** Prioritaskan read-only indicator dulu (announcement/ephemeral) sebelum edit. **Suggested test:** Group announcement-only → indikator tampil; composer sesuaikan bila agen non-admin.

### F-GAP-4 · P2 · REQUIREMENT GAP · Reaction & delete-for-everyone
**Status:** Confirmed (reaction). **Evidence:** reaction → `UtilityMessage.tsx:57-58` fallback unsupported; delete-for-everyone mode `UNVERIFIED`.
**Impact:** Reaction group tidak dirender/dikirim; mode delete ambigu. **Recommendation:** Render reaction (minimal read-only) + klarifikasi kontrak delete. **Suggested test:** Pesan dengan reaction dari WA → bubble reaction tampil (bukan "unsupported").

### F-DF-1 · P3 · DESIGN FLAW · Group photo tidak dimuat (ikon placeholder)
**Status:** Confirmed. **Evidence:** `AvatarWithFallback.tsx` sengaja skip image untuk group → `IconUsers`.
**Impact:** Tidak bisa membedakan group secara visual by photo. **Recommendation:** Muat `ContactInfo.avatar` bila tersedia untuk group. **Suggested test:** Group dengan foto → foto tampil, bukan ikon.

### F-INC-1 · P2 · INCONSISTENCY · Istilah `participants`/`members` ambigu (agen vs WA member)
**Status:** Confirmed. **Evidence:** `participants` (`types/conversation/conversation.ts:88,120`), `ParticipantInfo`/`SocketMemberInfo` (`packages/types/src/socket.ts:113-151`), `MEMBERS_ADDED/REMOVED` (`conversation-event.ts:24-25`) semua = **agen assignee**; member WA group = `memberContactInfo`.
**Impact:** Risiko salah analisis & salah map fitur pada tahap berikut (planner/coder mengira sudah ada member group). **Recommendation:** Dokumentasikan pembedaan; pertimbangkan rename (`assignees` vs `groupMembers`). **Suggested test:** Review istilah di PRD lanjutan.

---

## ASSUMPTIONS

- `memberContactInfo` diisi BE dengan anggota WA group riil (bukti: struktur `isAdmin`,`lid`, refresh service). BE contract tidak diverifikasi di tugas ini (FE-only).
- Composer tidak di-disable untuk group → reply/edit/delete/pin generik ikut berlaku di group (dispatcher sama; tidak ada guard group yang mematikannya ditemukan).
- "subject" pada type = EMAIL subject (komentar kode eksplisit), bukan group subject.

## RISKS

- **Analisis lanjutan salah-baca** karena istilah participant/member ambigu (F-INC-1).
- **Poll vote tidak akurat**: `pollUpdateMessage` disuppress (`UtilityMessage.tsx:44-47`) → hasil vote terbaru mungkin tidak tercermin di UI.
- **Admin-only actions**: tidak ada guard UI berbasis `isAdmin` participant (mis. announcement group non-admin tak bisa kirim) — potensi kirim gagal silent. Tidak terbukti ada handling.
- **Delete-for-everyone** tak terverifikasi → kemungkinan hanya delete-for-me, atau sebaliknya tanpa konfirmasi mode.

## OUTPUT

- File ditulis: `C:/Users/MyBook SAGA 12/Desktop/PRDanalisis/Assessments/conversation/wa-group-feature-gap/wa-group-features-FE-map.md`

## FOLLOW-UP TASKS

1. **BE/API parity check**: verifikasi sumber `memberContactInfo`, event WA group (ada/tidak di payload BE), kontrak delete-for-everyone & reaction. (FE-only task ini tidak mencakup BE.)
2. **PRD baru: Group members drawer** (konsumsi `memberContactInfo`: list, admin badge, count) — gap F-GAP-1.
3. **PRD baru: WA group system-message rendering** (join/leave/add/remove/promote/demote/subject/icon/ephemeral) — gap F-GAP-2.
4. **PRD: Group settings read-only indicators** (announcement, ephemeral) + invite link/approval — gap F-GAP-3.
5. **Reaction rendering + poll vote update** — gap F-GAP-4 / risk poll.
6. **Terminologi**: pisahkan `assignees` (agen) vs `groupMembers` (WA) di type & docs — F-INC-1.
