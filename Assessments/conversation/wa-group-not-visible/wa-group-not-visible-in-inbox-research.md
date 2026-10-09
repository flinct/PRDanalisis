# Research — WhatsApp group tidak muncul di SatuInbox (padahal ada message di mobile)

**Tanggal:** 2026-10-05
**Scope:** root-cause research, Baileys WA Web ingestion. Repo `omnichannel-satuinbox-be` branch `v2.7.0` (tag `prod-2.7.0`, commit `3e2d9bc1`). **Code-verified**, bukan memory-sourced.
**Service:** `apps/whatsapp` (Baileys `7.0.0-rc13`).

> **Gejala yang dilaporkan:** group tersebut **ADA message-nya di device** (bukan group kosong/silent), tetapi tetap tidak masuk ke SatuInbox. Ini menggugurkan teori "silent group / tidak ada WAMessage" — message memang mengalir, tapi **di-drop** di pipeline ingestion.

---

## Jawaban singkat (temuan utama)

Message group **di-drop karena pembungkus (wrapper) pesannya tidak di-unwrap** sebelum pengecekan tipe. Paling mungkin: group itu memakai **disappearing messages (ephemeral)**. SatuInbox cuma menerima tipe pesan yang ada di whitelist `MESSAGE_TYPES`; pesan yang dibungkus `ephemeralMessage` / `viewOnceMessageV2` / `deviceSentMessage` / `editedMessage` punya key top-level = nama wrapper-nya (bukan `conversation`/`imageMessage`/dll), sehingga deteksi tipe mengembalikan string kosong → pesan dinyatakan invalid → **`return null`** → tidak pernah jadi conversation. Di device tetap tampil karena WhatsApp client otomatis meng-unwrap pembungkus itu; SatuInbox tidak.

---

## Rantai bukti (file:line) — temuan utama

### 1. Tipe pesan ditentukan dari KEY MENTAH, tanpa unwrap wrapper
`apps/whatsapp/src/app/services/whatsapp-message.service.ts:515-518`
```ts
private getMessageType(message) {
  if (!message) return '';
  return Object.keys(message).find((key) => MESSAGE_TYPES.includes(key)) ?? '';
}
```
Dipanggil langsung atas `msg.message` **mentah** (`extractMessageData:161-162`). Tidak ada `normalizeMessageContent()` / unwrap di mana pun (di-grep: nol hit `ephemeral`/`normalize`/`unwrap` di `whatsapp-message.service.ts` & `baileys.util.ts`).

### 2. Tipe kosong → message dinyatakan invalid → di-DROP
`whatsapp-message.service.ts:527-531` + `:162-166`
```ts
validateMessageFields(...) { ... return hasRequiredKeys && hasValidMessage && messageType !== ''; }
...
const isValid = this.validateMessageFields(msg, messageType) && (await validateMessage(msg, messageType));
if (!isValid || !message) return null;   // ← DROP di sini
```
Pesan `ephemeralMessage` → `getMessageType` = `''` → `messageType !== ''` false → `isValid` false → **`return null`**.

### 3. Payload group null → tidak di-emit → tidak ada conversation
`baileys.service.ts:1158-1160`
```ts
const data = await this.extractMessageData(msg);
if (!data?.remoteJid) return null;   // extractMessageData null → ikut null
```
`buildGroupInboundPayload` null → `handleGroupMessage:1144-1148` tidak `emit` ke `INBOUND_GROUP_MESSAGE` queue → conversation-service tidak pernah membuat conversation.

### 4. Whitelist `MESSAGE_TYPES` tidak memuat wrapper transparan
`instance.constant.ts:77-109`. Isinya tipe konten nyata saja. **TIDAK ada**: `ephemeralMessage`, `viewOnceMessageV2`, `viewOnceMessageV2Extension`, `deviceSentMessage`, `editedMessage`, `protocolMessage`, `pinInChatMessage`, `buttonsResponseMessage`, `listResponseMessage`, `templateButtonReplyMessage`.
Catatan: `viewOnceMessage` (format lama) ditangani terpisah lewat flag `msg.key.isViewOnce` (`extractMessageData:156`), tapi `viewOnceMessageV2` (format baru) tidak ketangkap.

### 5. Reproduksi perilaku (self-check)
Simulasi `getMessageType` + `validateMessageFields` atas pesan group yang isinya identik, satu polos satu dibungkus ephemeral:
```
normal    -> True  | type: conversation
ephemeral -> False | type: ''      ← di-drop meski isi & pengirim sama
```
Pesan group dengan disappearing messages ter-drop murni karena wrapper tidak di-unwrap. (Script assert lulus.)

---

## Diagram alur (temuan utama)

```
Group di device (disappearing/ephemeral ON)
   │  msg.message = { ephemeralMessage: { message: { conversation: "halo" } } }
   ▼
messages.upsert :888 ──► handleGroupMessage :1144
                              │
                              ▼  buildGroupInboundPayload :1158
                         extractMessageData :161
                              │
                getMessageType(msg.message)  ──►  key top-level = "ephemeralMessage"
                              │                    (tidak di MESSAGE_TYPES)
                              ▼
                     messageType = ''  ──►  isValid=false  ──►  return null :166
                              │
                              ▼
                     payload null :1160 ──► TIDAK di-emit ──► tidak ada conversation

Device: WhatsApp unwrap ephemeral otomatis → pesan tetap tampil.
SatuInbox: tidak unwrap → pesan hilang.
```

---

## Perbaikan (root cause)

Unwrap pembungkus sebelum deteksi tipe. Baileys sudah sediakan helpernya — satu baris:

```ts
import { normalizeMessageContent } from 'baileys'
// extractMessageData (whatsapp-message.service.ts:161), ganti:
const message = msg.message
// menjadi:
const message = normalizeMessageContent(msg.message)
```
`normalizeMessageContent` meng-unwrap `ephemeralMessage`, `viewOnceMessage(V2/Extension)`, `deviceSentMessage`, `documentWithCaptionMessage`, `editedMessage` → key jadi `conversation`/`imageMessage`/dll → lolos whitelist. Satu titik, kena semua caller (live `:888` + history `buildHistorySyncPayload:1124`). Direct chat disappearing juga ikut kebener.

> Catatan: unwrap jangan sampai menghilangkan jalur view-once lama (`msg.key.isViewOnce` di `:156`) — itu dicek sebelum ambil `msg.message`, jadi aman. Verifikasi `getAttachment`/`extractMessageContent` tetap jalan atas `message` yang sudah di-unwrap saat implementasi.

---

## Konfirmasi yang perlu divalidasi ke pelapor

1. **Group itu pakai disappearing messages (timer ON)?** Kalau ya → ini persis penyebabnya (confidence tinggi).
2. Kalau timer OFF → cek kandidat sekunder B di bawah (akun di-kick / LID belum resolve).

---

## Kondisi LAIN yang bisa menyembunyikan group (sekunder)

Berlaku juga walau message ADA. Code-verified.

### B. Build payload group GAGAL → pesan di-drop diam-diam (`return null`)
`buildGroupInboundPayload` (`baileys.service.ts:1158-1199`) return `null` kalau SALAH SATU gagal:
- `getGroupMetadata` null — `sock.groupMetadata()` gagal/timeout, atau akun **sudah dikeluarkan dari group** (`:1167,1170`, def `:416-430`). Hasil dicache 1 hari → kegagalan transient lengket 24 jam.
- `getParticipant` null — pengirim pakai LID, mapping LID→nomor belum tersedia (`:1162-1163`, `getParticipant:1411-1421`).
- `saveParticipants` / `resolveContact` grup null — upsert contact grup gagal (`:1185-1190`).

### C. Group muncul tapi TIDAK realtime (hanya setelah reload)
Pesan group dari history-sync backfill **tidak emit socket** (`inbound-message.processor.ts:356-358`). Baru nongol setelah agent refresh. Gejala: "tadi nggak ada, pas di-refresh muncul".

### D. Backfill drain bisa dimatikan ops
`history-sync-drain.service.ts:41` — env `WHATSAPP_HISTORY_SYNC_BACKFILL_QUEUE_ENABLED` (default `true`). Kalau `false`, pesan history yang sudah di-persist tidak pernah dikirim ke conversation-service.

### E. Dedup message-id
`inbound-message.processor.ts:310-316` — `messageId` duplikat → di-ack & `return` tanpa bikin conversation. Relevan saat migrasi/replay.

---

## Kondisi "silent group" (teori awal — diturunkan jadi pelengkap, BUKAN penyebab kasus ini)

Kasus yang dilaporkan punya message, jadi jalur ini TIDAK berlaku untuknya. Disimpan karena tetap valid untuk gejala berbeda ("group kosong / lama sepi tidak muncul"):

- **History sync buang `data.chats`** (`baileys.service.ts:1484`): hanya `data.messages` dipakai; `chats.upsert`/`chats.set` tidak di-subscribe (`:251-305`). → conversation hanya lahir dari WAMessage, bukan dari daftar chat.
- **Age cutoff 30 hari + `syncFullHistory:false`** (`history-sync-filter.util.ts:55`, `instance.constant.ts:63-64`, `whatsapp-connection.service.ts:112`): group yang pesan terakhirnya > 30 hari / di luar window tidak terbawa saat pairing.
- **Group-system message bukan konten** ("member ditambahkan", "group dibuat") tidak di whitelist → group yang aktivitasnya cuma event sistem tidak muncul.

---

## Yang SUDAH dipastikan BUKAN penyebab
- **Bukan diblok JID**: `shouldIgnoreJid` (`baileys.util.ts:82-90`) hanya broadcast/status/newsletter. Group `@g.us` diloloskan.
- **Bukan setting on/off**: tidak ada config `allowGroup`/`groupEnabled`/`ignoreGroup` di seluruh BE. Group tidak bisa dimatikan per akun.
- **Bukan filter FE**: daftar conversation FE tidak menyaring group (`isGroup` di FE kosmetik — sembunyikan SLA/screenshot, bukan sembunyikan dari list). `ConversationCard.tsx`, `ConversationChatDetailsContent.tsx`.

---

## Ringkas — per kondisi group

| Kondisi group di device | Muncul di SatuInbox? | Penyebab |
|---|---|---|
| Ada message normal (text/media), live | ya (realtime) | jalur normal `:888` |
| **Ada message, disappearing/ephemeral ON** | **tidak** | **wrapper tidak di-unwrap → type '' → drop (temuan utama)** |
| Ada message view-once V2 | tidak | wrapper V2 tidak ketangkap (temuan utama #4) |
| Ada message, akun sudah di-kick | tidak | groupMetadata null → return null (B) |
| Ada message, pengirim LID belum resolve | pesan itu drop | getParticipant null (B) |
| Group kosong / lama sepi > 30 hari | tidak | silent-group path (pelengkap) |
| Backfill queue dimatikan ops | historis tidak | env flag (D) |

---

## Catatan governance

Ini research/root-cause, **belum** request perubahan behavior. Temuan utama (unwrap wrapper) adalah **bug fix** satu baris, bukan fitur baru — blast radius kecil (ingestion message), tapi tetap jalankan Phase 0 Change Intake (`Rules/core/change-management.md`) sebelum patch karena menyentuh jalur message yang dibagi semua channel WA. Opsi silent-group (ingest chat tanpa message) adalah fitur baru terpisah dengan blast radius lebih besar (contact + conversation + billing count) — jangan dicampur ke fix ini.
