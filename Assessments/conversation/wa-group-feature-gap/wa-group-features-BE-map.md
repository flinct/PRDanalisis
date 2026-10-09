# Assessment Report — WhatsApp Group Feature Gap (Backend SatuInbox)

Scope: Inventarisasi exhaustive fitur/action WhatsApp group + mapping status implementasi di **BE SatuInbox** (`omnichannel-satuinbox-be`, branch `v2.7.0`), code-verified.

Repo diperiksa:
- `apps/whatsapp/src` (WA service, Baileys driver)
- `apps/conversation-service/src` (inbound processing)
- `libs/common/src` (enums, event types)

## Executive Summary

- **Sistem SatuInbox memperlakukan grup WA sebagai _conversation_ masuk/keluar, BUKAN sebagai objek yang bisa di-manage.** WA service hanya meng-_consume_ grup (baca metadata, terima pesan, sinkron anggota) dan mengirim pesan. Tidak ada satupun RPC/endpoint untuk mengelola grup (create, add/remove member, promote/demote, ubah subjek/deskripsi/ikon, invite link, setting/announcement, ephemeral, membership approval).
- Daftar penuh RPC WA (`EventTypeEnum.WHATSAPP_*`) hanya: `INIT_INSTANCE`, `INSTANCE_INFO`, `LOGOUT_INSTANCE`, `QR`, `SEND_MESSAGE`, `STOP_INSTANCE`, `VALIDATE_NUMBER`, `BROADCAST_MESSAGE`, `EDIT_MESSAGE`, `DELETE_MESSAGE`, `MARK_READ`, `TERMINATE_QR_SESSION`, `REFRESH_GROUP_PARTICIPANTS` — tidak ada group admin action. Bukti: `libs/common/src/lib/enums/index.ts:346-358`.
- Baileys socket calls yang benar-benar dipakai aplikasi hanya: `groupMetadata` (read, `baileys.service.ts:425`) dan `logout`. Tidak ada `groupCreate/groupLeave/groupParticipantsUpdate/groupUpdateSubject/...` dipakai. Bukti negatif: grep seluruh `apps/whatsapp/src` → nihil.

### Finding counts
- BUILT: 10 fitur
- PARTIAL: 6 fitur
- ABSENT: 34 fitur

### Decision
**PROCEED_WITH_CAUTION** — Jika PRD menuntut "group management" (admin actions, settings, invite, membership approval), hampir seluruhnya ABSENT dan butuh development besar di WA service + RPC baru + conversation-service. Jika scope hanya "terima & balas pesan grup", mayoritas sudah BUILT.

---

## System Model (singkat)

- **Actors:** customer (anggota grup), account channel (nomor WA bisnis yang jadi anggota grup), conversation-service worker, baileys socket.
- **Alur grup yang ada:**
  1. Inbound: `messages.upsert` → `handleMessagesUpsert` → `isJidGroup` → `handleGroupMessage` → `buildGroupInboundPayload` → emit `INBOUND_GROUP_MESSAGE` ke conversation-service. (`baileys.service.ts:865-889, 1144-1199`)
  2. Membership sync: `group-participants.update` → `handleParticipantsUpdate` → `saveParticipants` → emit `CONVERSATION_UPDATE_MEMBER_CONTACT`. (`baileys.service.ts:283-291, 1574-1602`)
  3. Group info sync: `groups.update` → `handleGroupUpdate` → hanya update **subject + photo** contact grup. (`baileys.service.ts:288-291, 1639-1651`)
  4. Outbound: `WHATSAPP_SEND_MESSAGE` → `sendMessage` → `sock.sendMessage` (grup atau direct sama). (`app.controller.ts:253-257`, `baileys.service.ts:1799-1838`)

**Source of truth status grup** = WhatsApp (Baileys) untuk membership/metadata; SatuInbox hanya cache/cermin via contact + member-contact event.

---

## FINDINGS — Tabel Fitur × Status × Evidence

Legenda status: **BUILT** (dipakai kode app, ada bukti), **PARTIAL** (sebagian/efek samping saja), **ABSENT** (tidak ada di kode app; walau lib Baileys menyediakannya), **UNVERIFIED** (tak bisa dibuktikan).

### 1. Group Lifecycle

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Create group | Buat grup baru dari BE | `sock.groupCreate` | **ABSENT** | Tidak dipakai; grep `apps/whatsapp/src` nihil. RPC list `enums/index.ts:346-358` tanpa group-create. |
| Read group metadata | Ambil subject/desc/participants/owner | `sock.groupMetadata` | **BUILT** | `baileys.service.ts:416-425` (`getGroupMetadata`), dipakai di `1167,1343,1579,1609,1991`. |
| Group subject change (inbound sync) | Deteksi subject berubah → update contact | `groups.update` | **PARTIAL** | `handleGroupUpdate` hanya proses `subject` + photo, bukan desc/settings. `baileys.service.ts:1639-1651`. |
| Group description | Baca/ubah deskripsi grup | `groupUpdateDescription` / `desc` di metadata | **ABSENT** | Tidak dibaca/ditulis; `handleGroupUpdate` tidak menyentuh `desc` (`baileys.service.ts:1640-1650`). |
| Edit subject (outbound) | Ubah nama grup dari BE | `sock.groupUpdateSubject` | **ABSENT** | Tidak dipakai; grep nihil. |
| Edit description (outbound) | Ubah deskripsi dari BE | `sock.groupUpdateDescription` | **ABSENT** | Tidak dipakai; grep nihil. |
| Group icon/photo (read) | Ambil foto grup | `sock.profilePictureUrl` | **BUILT** | `getContactProfilePicture` dipakai utk grup di `baileys.service.ts:1166,1645`. |
| Edit icon (outbound) | Set foto grup | `sock.updateProfilePicture(groupJid,...)` | **PARTIAL** | `updateProfilePicture` ada (`baileys.service.ts:986-993`) tapi dipakai untuk profil akun, bukan di-ekspos sebagai aksi set-foto-grup via RPC. |
| Delete/dismiss group | Bubarkan / tinggalkan grup | `sock.groupLeave` | **ABSENT** | Tidak dipakai; grep nihil. |

### 2. Membership

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Add participant | Tambah anggota | `groupParticipantsUpdate(jid, [..], 'add')` | **ABSENT** | Tidak dipakai; grep nihil. |
| Remove/kick participant | Keluarkan anggota | `groupParticipantsUpdate(..., 'remove')` | **ABSENT** | Tidak dipakai; grep nihil. |
| Promote admin | Jadikan admin | `groupParticipantsUpdate(..., 'promote')` | **ABSENT** | Tidak dipakai; grep nihil. |
| Demote admin | Cabut admin | `groupParticipantsUpdate(..., 'demote')` | **ABSENT** | Tidak dipakai; grep nihil. |
| Participants change (inbound sync) | Deteksi anggota join/leave/promote/demote → sinkron member contact + flag admin | `group-participants.update` | **BUILT** | `handleParticipantsUpdate` (`baileys.service.ts:1574-1602`); `saveParticipants` tandai admin via `isAdminParticipant` (`1349-1374`); emit `CONVERSATION_UPDATE_MEMBER_CONTACT`. |
| Refresh participants (manual) | Force re-sync anggota grup | `groupMetadata` | **BUILT** | RPC `WHATSAPP_REFRESH_GROUP_PARTICIPANTS` → `refreshGroupParticipants` (`app.controller.ts:350-351`, `baileys.service.ts:1607-1633`). |
| Member join via link | Terima/approve join via invite | `groupRequestParticipantsUpdate` | **ABSENT** | Tidak dipakai; grep nihil. |
| Membership approval (approve/reject pending) | Mode approval anggota baru | `groupRequestParticipantsList` / `groupRequestParticipantsUpdate` / `groupJoinApprovalMode` | **ABSENT** | Tidak dipakai; grep nihil. |

> Catatan: event membership (join/leave/promote/demote) **hanya** menghasilkan sinkron daftar member + flag admin. **Tidak** ada rendering sebagai system message / event timeline (lihat §6). Promote/demote tidak dibedakan secara granular — hanya snapshot `isAdmin[]` saat ini.

### 3. Permissions / Settings

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Announcement mode (admin-only send) | Set siapa boleh kirim | `groupSettingUpdate('announcement'/'not_announcement')` | **ABSENT** | Tidak dipakai; grep nihil. |
| Who can edit group info | Lock/unlock edit info | `groupSettingUpdate('locked'/'unlocked')` | **ABSENT** | Tidak dipakai; grep nihil. |
| Who can add members | Member add mode | `groupMemberAddMode` | **ABSENT** | Tidak dipakai; grep nihil. |
| Approve new members toggle | Aktif/nonaktif approval | `groupJoinApprovalMode` | **ABSENT** | Tidak dipakai; grep nihil. |
| Disappearing/ephemeral messages | Set durasi ephemeral | `sock.groupToggleEphemeral` / `toggleEphemeral` | **ABSENT** | Tidak dipakai; grep nihil (tidak ada `ephemeral` di `apps/whatsapp/src`). |

### 4. Invite

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Get invite link | Ambil kode undangan | `sock.groupInviteCode` | **ABSENT** | Tidak dipakai; grep nihil. |
| Revoke invite link | Reset kode undangan | `sock.groupRevokeInvite` | **ABSENT** | Tidak dipakai; grep nihil. |
| Join via invite code | Gabung grup via kode | `sock.groupAcceptInvite` | **ABSENT** | Tidak dipakai; grep nihil. |
| Get invite info | Preview grup dari kode | `sock.groupGetInviteInfo` | **ABSENT** | Tidak dipakai; grep nihil. |

### 5. Messaging in Group

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Inbound text | Terima teks grup | `messages.upsert` | **BUILT** | `handleGroupMessage` (`baileys.service.ts:1144-1148`). |
| Inbound media (image/video/doc/audio/sticker) | Terima media grup | `messages.upsert` + extract | **BUILT** | Tipe media didukung: `whatsapp-api-type.maps.ts:10-17`, enum `enums/index.ts:633-635,773-775`; extract di `structured-payload.util.ts`. |
| Inbound location | Terima lokasi | `locationMessage` | **BUILT** | `extractLocationPayload` (`structured-payload.util.ts:72,591`). |
| Inbound contact (vCard) | Terima kontak | `contactMessage` | **BUILT** | `extractContactPayload` (`structured-payload.util.ts:127,592`). |
| Inbound poll (create/vote) | Terima poll + update vote | `pollCreationMessage*` / `pollUpdateMessage` | **PARTIAL** | Parsing inbound ada (`structured-payload.util.ts:195-260,229-240`), tapi **tidak** ada pembuatan poll outbound atau voting dari BE. |
| Inbound reaction | Terima reaksi | `messages.reaction` / `reactionMessage` | **PARTIAL** | Parsing inbound reaction ada (`structured-payload.util.ts:458-465, extractReactionPayload`); namun event `messages.reaction` **tidak di-subscribe** (`setHandlers` tak daftarkan `MESSAGES_REACTION`, `baileys.service.ts:245-308`) — reaksi hanya terbaca bila datang sebagai message. Outbound reaction ABSENT. |
| Outbound send (text/media) | Kirim ke grup | `sock.sendMessage` | **BUILT** | `sendMessage` (`baileys.service.ts:1799-1838`); payload builder `whatsapp-message.service.ts:97-109,234+`. Grup & direct lewat jalur sama. |
| @mention participant | Mention anggota / @all | `contextInfo.mentionedJid` / `nonJidMentions` | **BUILT** | Mention + mentionAll dibangun di `baileys.service.ts:1279-1280,1868-1895,1917-1930`; util `baileys-mentions.util`. |
| Reply/quote | Balas pesan dengan kutipan | `contextInfo.quotedMessage` | **BUILT** | Reply info diproses di `whatsapp-message.service.ts:359-360` (replyInfo). |
| Edit message (outbound) | Edit pesan terkirim | `protocolMessage editedMessage` | **BUILT** | RPC `WHATSAPP_EDIT_MESSAGE` → `handleEditMessage` → `editMessage` (`app.controller.ts:482-514`). |
| Edit message (inbound) | Deteksi pesan di-edit lawan | `protocolMessage.editedMessage` | **BUILT** | `isEditedMessage`+`handleMessageEdit` (`baileys.service.ts:873-874,949-951,1063`). |
| Delete-for-everyone (outbound revoke) | Hapus untuk semua | `sock.sendMessage({delete})` | **BUILT** | RPC `WHATSAPP_DELETE_MESSAGE` → `handleDeleteMessage` → `deleteMessage` (`app.controller.ts:523-551`). |
| Delete/revoke (inbound) | Deteksi pesan dihapus lawan | `protocolMessage.type == REVOKE` | **BUILT** | `isDeletedMessage`+`handleMessageDelete` emit `MESSAGE_DELETED` (`baileys.service.ts:762-776,878-879,959-961`). |
| Forward message | Teruskan pesan | `sendMessage(forward)` | **ABSENT** | Tidak ada handling forward outbound; grep nihil. |
| Pin message (dalam chat WA) | Pin pesan di chat WA | `sock.sendMessage({pin})` | **ABSENT** | `IS_PINNED/PINNED_AT` di conversation-service (`base.constant.ts:28-31`) adalah pin **conversation di inbox SatuInbox**, bukan pin pesan WA. Tidak ada pin pesan WA. |
| Poll create (outbound) | Buat poll ke grup | `sendMessage({poll})` | **ABSENT** | Tidak dipakai; hanya parsing inbound. |
| Reaction (outbound) | Kirim reaksi ke pesan grup | `sock.sendMessage({react})` | **ABSENT** | Grep `react(` di `whatsapp-message.service.ts` nihil. |

### 6. Group Events / System Messages

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Join/leave/add/remove system msg | Render event anggota sebagai pesan sistem | `messageStubType` | **ABSENT** | Grep `messageStubType` di `apps/whatsapp` & `apps/conversation-service` → nihil. Membership hanya disinkron sebagai member-contact (§2), tidak jadi timeline event. |
| Promote/demote event | Event granular promote/demote | `group-participants.update action` | **PARTIAL** | `group-participants.update` di-handle tapi **tidak** baca field `action`; hanya re-snapshot `isAdmin[]` (`baileys.service.ts:1574-1601`). Tidak bedakan promote vs demote vs add/remove. |
| Subject change event | Event ganti subjek | `groups.update` | **PARTIAL** | Hanya update contact (subject+photo), tak dibuat event/sistem msg (`baileys.service.ts:1639-1651`). |
| Description/icon/settings/ephemeral change event | Event perubahan info/setting | `groups.update` | **ABSENT** | `handleGroupUpdate` abaikan `desc`/settings/ephemeral (`baileys.service.ts:1640-1650`). |

### 7. Presence / Typing / Read Receipts (grup)

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Presence/typing update (inbound) | Terima indikator mengetik | `presence.update` | **BUILT** | `handlePresenceUpdate` (`baileys.service.ts:293-296,1657-1693`). Berlaku utk JID termasuk grup. |
| Typing/presence (outbound) | Kirim composing/available | `sendPresenceUpdate` | **BUILT** | `whatsapp-message.service.ts:392-405`. |
| Read receipts | Tandai dibaca | `sock.readMessages` | **BUILT** | `readMessagesFromRedis`→`readMessages` (`baileys.service.ts:926-941`), RPC `WHATSAPP_MARK_READ` (`app.controller.ts:610-611`). Delivery/read status map: `handleMessageUpdate` (`baileys.service.ts:777-798`). |

### 8. Community / Announcement / Linked / Subgroups

| Fitur/Action | Deskripsi | Baileys API/event | Status | Evidence |
|---|---|---|---|---|
| Community / announcement group | Komunitas, linked groups, subgroups | `communityCreate`, `groupCreate(..., linkedParentJid)` | **ABSENT** | Tidak ada; grep `community`/linked nihil di app. |

### 9. Baileys-specific events/APIs

| Baileys symbol | Peran | Status di app | Evidence |
|---|---|---|---|
| `groupMetadata` | Read metadata | **BUILT** | `baileys.service.ts:425`. |
| `group-participants.update` (event) | Sync anggota | **BUILT** (tanpa `action`) | `baileys.service.ts:283-286,1574`. |
| `groups.update` (event) | Sync info grup | **PARTIAL** (subject+photo saja) | `baileys.service.ts:288-290,1639`. |
| `groups.upsert` (event) | Grup baru masuk | **ABSENT** (konstanta ada, tak di-subscribe) | Didefinisikan `baileys-events.constant.ts:13`, **tidak** di `setHandlers` (`baileys.service.ts:245-308`). |
| `messages.reaction` (event) | Reaksi | **ABSENT** (tak di-subscribe) | Tidak ada di `setHandlers`. |
| `groupFetchAllParticipating` | Fetch semua grup | **ABSENT** | Tidak dipakai; grep nihil. |
| `groupCreate` | Buat grup | **ABSENT** | grep nihil. |
| `groupLeave` | Keluar grup | **ABSENT** | grep nihil. |
| `groupUpdateSubject` | Ubah subjek | **ABSENT** | grep nihil. |
| `groupUpdateDescription` | Ubah deskripsi | **ABSENT** | grep nihil. |
| `groupParticipantsUpdate` (write) | add/remove/promote/demote | **ABSENT** | grep nihil. |
| `groupInviteCode` / `groupRevokeInvite` / `groupAcceptInvite` / `groupGetInviteInfo` | Invite link | **ABSENT** | grep nihil. |
| `groupSettingUpdate` (announcement/locked) | Setting grup | **ABSENT** | grep nihil. |
| `groupToggleEphemeral` | Ephemeral | **ABSENT** | grep nihil. |
| `groupMemberAddMode` | Member add mode | **ABSENT** | grep nihil. |
| `groupJoinApprovalMode` / `groupRequestParticipantsUpdate` | Membership approval | **ABSENT** | grep nihil. |

---

## Traceability (ringkas)

- Inbound group message → `messages.upsert` (`baileys.service.ts:865`) → `isJidGroup` gate (`:888`) → `buildGroupInboundPayload` (`:1158`) → RabbitMQ `INBOUND_GROUP_MESSAGE` → `conversation-service inbound-message.processor.ts:136-170` (group flag).
- Member sync → `group-participants.update` (`:284`) → `handleParticipantsUpdate` (`:1574`) → `saveParticipants` (`:1336`) → `CONVERSATION_UPDATE_MEMBER_CONTACT` (`:1601`).
- Outbound group send → RPC `WHATSAPP_SEND_MESSAGE` → `sendMessage` (`:1799`) → `sock.sendMessage`.

---

## Open Questions / Assumptions

- **ASSUMPTION:** Nama method Baileys untuk aksi grup (groupCreate, groupParticipantsUpdate, groupInviteCode, groupSettingUpdate, groupToggleEphemeral, groupJoinApprovalMode, groupMemberAddMode, groupRequestParticipantsUpdate) diambil dari pengetahuan API Baileys/@whiskeysockets. Verifikasi web gagal (search backend 403) dan `node_modules` lib tidak dibuktikan — namun sesuai instruksi task, fokus = kode app; fitur yang tidak dipakai kode app = ABSENT di SatuInbox terlepas dari ketersediaan lib. Nama symbol lib ditandai ASSUMPTION; status BUILT/ABSENT **berbasis bukti kode app** (grep), bukan asumsi lib.
- Reaction & poll: inbound parser ada, tapi apakah conversation-service benar menampilkannya untuk grup = di luar scope WA service (butuh cek FE/conversation render) — ditandai PARTIAL.
- `updateProfilePicture` ada tapi tidak ter-ekspos sebagai aksi "set group icon" → PARTIAL (kapabilitas ada, wiring aksi grup tidak).

## Risks

- **P1 — Gap besar group management:** Bila PRD menuntut admin/management grup (add/remove/promote/demote/invite/settings/approval), hampir semua ABSENT → butuh RPC baru + handler Baileys write + model data member role granular + conversation UI. Estimasi besar.
- **P2 — Promote/demote tidak granular:** `handleParticipantsUpdate` abaikan field `action`, re-snapshot penuh tiap event → boros (full `groupMetadata` fetch per event, `:1579`) dan tidak bisa audit "siapa mempromosi siapa". Scale risk pada grup besar / event burst.
- **P2 — `groups.upsert` & `messages.reaction` tak di-subscribe:** grup baru yang di-join mungkin tak ter-register sampai ada pesan masuk; reaksi grup bisa hilang. Bukti: `setHandlers` (`baileys.service.ts:245-308`) tak daftarkan dua event tersebut.
- **P3 — System event tidak ter-render:** join/leave/subject-change tidak muncul sebagai timeline di percakapan grup (no `messageStubType` handling) → agent kehilangan konteks perubahan grup.

## Recommendation / Next Action

1. Konfirmasi scope PRD: "group messaging" (sebagian besar BUILT) vs "group management" (mayoritas ABSENT).
2. Jika management diperlukan: rancang RPC baru `WHATSAPP_GROUP_*` (create/add/remove/promote/demote/invite/setting/ephemeral/approval) + handler Baileys write + event granular (baca `action` di `group-participants.update`) + subscribe `groups.upsert` & `messages.reaction`.
3. Jika hanya messaging: tutup gap kecil — subscribe `messages.reaction`, render system events, outbound reaction/poll bila diminta.

---

### Evidence anchor (file:line kunci)
- RPC WA list: `libs/common/src/lib/enums/index.ts:346-358`
- Event subscriptions: `apps/whatsapp/src/app/services/baileys.service.ts:245-308`
- Group participants handler: `baileys.service.ts:1574-1602`
- Group update (info) handler: `baileys.service.ts:1639-1651`
- Group inbound message: `baileys.service.ts:865-889, 1144-1199`
- Edit/Delete (in/out): `baileys.service.ts:762-776, 873-961, 1063`; `app.controller.ts:482-551`
- Mentions: `baileys.service.ts:1279-1280, 1868-1930`
- Structured payload extractors: `apps/whatsapp/src/app/utils/structured-payload.util.ts:72,127,229,458,587-592`
- Presence/read: `baileys.service.ts:926-941, 1657-1693`; `whatsapp-message.service.ts:392-405`
- Baileys only groupMetadata+logout used (bukti negatif grup write): grep `apps/whatsapp/src` → hanya `groupMetadata` (`:425`) + `logout`.
