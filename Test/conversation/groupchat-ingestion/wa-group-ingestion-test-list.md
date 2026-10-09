# Test List — WhatsApp Group Ingestion (SatuInbox WA Web)

**Tanggal:** 2026-10-05
**Scope:** menguji penerimaan & tampilnya **group chat** dari WhatsApp Web (Baileys) ke inbox SatuInbox. Diturunkan dari jalur kode `apps/whatsapp` branch `v2.7.0` (lihat `wa-group-not-visible-in-inbox-research.md` di folder yang sama).
**Owner:** Analyst (PM Dany Christian). **Tipe:** pre-implementation test design.
**SUT:** `whatsapp-service` (Baileys) → RabbitMQ `INBOUND_GROUP_MESSAGE[_BACKFILL]` → `conversation-service` → FE inbox.

> **Catatan status:** beberapa expected ditandai **[CURRENT]** (perilaku kode sekarang, termasuk bug) vs **[TARGET]** (perilaku setelah fix unwrap). Saat regression sebelum fix, pakai [CURRENT]; post-fix, pakai [TARGET]. Bug utama = wrapper (ephemeral/viewOnceV2) tidak di-unwrap → message di-drop.

---

## Legenda
- **Priority:** P0 (blocker), P1 (high), P2 (medium), P3 (low)
- **Type:** Happy / Negative / Boundary / State / Integration / Regression / Permission / Concurrency / Compat
- JID group = `<id>@g.us`; LID = `@lid`.

---

## A. Live inbound group message (jalur `messages.upsert` → `handleGroupMessage`)

| ID | Requirement | Priority | Type | Precondition | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WG-A01 | Group text message masuk inbox realtime | P0 | Happy | Akun WA connected & masih member group; group tidak ephemeral | Kirim text dari member lain ke group | Conversation group muncul di inbox realtime (socket), nama = subject group, isi = text, sender ter-resolve |
| WG-A02 | Group image/video/document masuk | P0 | Happy | Sama A01 | Kirim image (with caption), lalu video, lalu document | Tiap media jadi message di conversation group; caption terbaca; attachment ter-download & tampil |
| WG-A03 | Group audio / voice note masuk | P1 | Happy | Sama A01 | Kirim voice note | Message tipe audio muncul dengan attachment |
| WG-A04 | Group sticker masuk | P2 | Happy | Sama A01 | Kirim sticker | Message sticker muncul |
| WG-A05 | Group location masuk | P2 | Happy | Sama A01 | Kirim location | Message location muncul |
| WG-A06 | Group contact (vcard) masuk | P2 | Happy | Sama A01 | Kirim 1 kontak lalu multi-kontak | `contactMessage` & `contactsArrayMessage` keduanya muncul |
| WG-A07 | Group poll masuk | P2 | Happy | Sama A01 | Buat poll di group | `pollCreationMessage` (V1–V5) muncul sebagai message |
| WG-A08 | **Group DISAPPEARING (ephemeral) message** | **P0** | **Negative→Regression** | Akun member group; **disappearing messages ON** | Kirim text ke group | **[CURRENT]** message di-drop, conversation TIDAK muncul (bug). **[TARGET]** message muncul normal (wrapper di-unwrap) |
| WG-A09 | Group view-once (V2) message | P1 | Negative→Regression | Akun member; pengirim kirim view-once foto | Kirim view-once image | **[CURRENT]** `viewOnceMessageV2` ter-drop; **[TARGET]** muncul sebagai view-once |
| WG-A10 | Group reply / quoted message | P1 | Happy | Ada message sebelumnya di group | Reply salah satu message | Message baru tampil dengan referensi quoted yang benar |
| WG-A11 | Group edited message | P2 | State | Ada message terkirim di group | Pengirim edit message | Konten message di SatuInbox ter-update (bukan message baru) |
| WG-A12 | Group deleted (revoke) message | P2 | State | Ada message terkirim | Pengirim hapus-untuk-semua | Message ditandai deleted / hilang sesuai perilaku delete |
| WG-A13 | Group message dari diri sendiri (fromMe via LID) | P1 | State | Akun kirim dari device lain ke group | Kirim pesan sendiri ke group dari HP | Message tercatat `fromMe=true`, tidak dianggap inbound customer |
| WG-A14 | Group message pengirim ber-LID (belum resolve) | P1 | Negative | Pengirim pakai LID, mapping belum ada | Kirim text ke group | Jika participant tak ter-resolve → message bisa drop (B); verifikasi apakah ter-recover setelah mapping tersedia |
| WG-A15 | Mention @all di group | P2 | Happy | Akun member group | Kirim pesan dengan @all | `mentionAll` flag true, message tetap masuk |
| WG-A16 | Mention spesifik member | P2 | Happy | Sama | Kirim pesan mention 1 member | `mentions` berisi JID yang benar |

---

## B. Group metadata & contact resolution

| ID | Requirement | Priority | Type | Precondition | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WG-B01 | Nama group = subject | P1 | Happy | Group punya subject | Terima message group pertama | Contact group bernama subject group |
| WG-B02 | Group tanpa subject → fallback name | P2 | Boundary | Group tanpa subject (jarang) | Terima message | Nama fallback `Group <ownerPn>` |
| WG-B03 | Group photo profile ter-ambil | P2 | Happy | Group punya foto | Terima message | Avatar group tampil |
| WG-B04 | Participant list tersimpan | P1 | Integration | Group dgn N member | Terima message | `saveParticipants` simpan semua participant; admin flag benar |
| WG-B05 | **Akun sudah di-KICK dari group** | **P0** | **Negative** | Akun tidak lagi member; ada message historis group | Pairing / terima backfill | `groupMetadata()` gagal → `buildGroupInboundPayload` null → group TIDAK muncul. Dokumentasikan sebagai expected-gap atau bug sesuai keputusan |
| WG-B06 | Group metadata cache (TTL 1 hari) | P2 | State | Terima ≥2 message berturut dari group sama | Kirim 2 message | Message ke-2 pakai metadata cache (tidak hit WA lagi); verifikasi via log/latency |
| WG-B07 | Group metadata transient-fail lengket 24 jam | P1 | Negative | `groupMetadata()` gagal transient saat first fetch | Trigger kegagalan lalu normal | Confirm: kegagalan ter-cache → group hilang s/d TTL habis (risiko) |
| WG-B08 | Sender participant jadi contact | P1 | Integration | Member baru pertama kali kirim | Kirim message | `senderContactId` ter-resolve jadi client contact terpisah dari group contact |

---

## C. History sync & backfill (jalur `messaging-history.set` → drain)

| ID | Requirement | Priority | Type | Precondition | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WG-C01 | Group dgn pesan < 30 hari muncul setelah pairing | P0 | Happy | Group ada pesan dalam 30 hari terakhir | Scan QR / pairing baru | Setelah backfill drain, group muncul di inbox (mungkin perlu refresh — lihat C05) |
| WG-C02 | **Group pesan terakhir > 30 hari** | **P1** | **Boundary** | Pesan terakhir group 31+ hari lalu | Pairing baru | **[CURRENT]** group TIDAK muncul (age cutoff 30d). Ubah `WHATSAPP_HISTORY_SYNC_MAX_AGE_DAYS=0` → harus muncul |
| WG-C03 | Age cutoff boundary tepat 30 hari | P2 | Boundary | Pesan tepat di batas (29d / 30d / 31d) | Pairing | 29d muncul, 31d tidak; konfirmasi perilaku tepat di 30d |
| WG-C04 | Per-chat cap 50 message | P2 | Boundary | Group dgn >50 message historis | Pairing | Maks 50 message/chat ter-persist; conversation tetap muncul |
| WG-C05 | **Backfill group TIDAK realtime (perlu refresh)** | **P1** | **State** | Group historis lolos filter | Pairing, amati inbox tanpa refresh | **[CURRENT]** group baru nongol setelah refresh/ganti folder (backfill tidak emit socket). Dokumentasikan sebagai UX gap |
| WG-C06 | Backfill queue dimatikan | P2 | Negative | `WHATSAPP_HISTORY_SYNC_BACKFILL_QUEUE_ENABLED=false` | Pairing | Group historis TIDAK terkirim ke conversation-service (expected saat flag off) |
| WG-C07 | `isLatest` menutup history sync | P2 | State | Multi-batch history | Pairing | Setelah batch `isLatest=true`, `historySyncComplete=true`, outbound tidak lagi diblok |
| WG-C08 | History ephemeral group | P1 | Negative→Regression | Group historis ephemeral | Pairing | **[CURRENT]** pesan ephemeral historis ter-drop (wrapper); **[TARGET]** muncul |

---

## D. Message type whitelist (akar bug utama)

| ID | Requirement | Priority | Type | Precondition | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WG-D01 | Tipe konten whitelisted lolos | P0 | Happy | — | Kirim tiap tipe di `MESSAGE_TYPES` (text, media, poll, event, buttons, list, interactive) | Semua masuk sebagai message |
| WG-D02 | **`ephemeralMessage` wrapper** | **P0** | **Negative** | — | Kirim text dalam group ephemeral | **[CURRENT]** drop; **[TARGET]** unwrap → masuk |
| WG-D03 | `viewOnceMessageV2` / `...Extension` | P1 | Negative | — | Kirim view-once V2 | **[CURRENT]** drop; **[TARGET]** unwrap |
| WG-D04 | `deviceSentMessage` wrapper | P1 | Negative | — | Kirim dari device lain yang jadi deviceSent | **[CURRENT]** drop; **[TARGET]** unwrap |
| WG-D05 | `editedMessage` wrapper (jalur non-edit) | P2 | Negative | — | — | Konsisten dengan WG-A11 setelah unwrap |
| WG-D06 | Group-system message (member add / subject change / group created) | P2 | Negative | — | Tambah member / ganti subject | Tidak dianggap message konten → tidak bikin conversation (expected). Group dgn HANYA aktivitas sistem tidak muncul |
| WG-D07 | Regression: unwrap tidak merusak view-once lama | P0 | Regression | Post-fix | Kirim view-once (V1, `key.isViewOnce`) | Tetap jalan via jalur `extractViewOnceMessageData` — tidak double-handle |
| WG-D08 | Regression: unwrap tidak merusak `documentWithCaptionMessage` | P1 | Regression | Post-fix | Kirim document with caption | Caption & attachment tetap benar |

---

## E. Downstream conversation-service

| ID | Requirement | Priority | Type | Precondition | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WG-E01 | Conversation group dibuat sekali (idempoten id) | P1 | Integration | — | Terima message group pertama | 1 conversation baru dibuat; counter inbound naik |
| WG-E02 | Dedup message-id | P1 | Negative | Replay message-id sama | Kirim ulang id yang sama (replay) | Message duplikat di-ack & di-skip, tidak dobel |
| WG-E03 | Group TIDAK dapat auto-pull/SLA | P1 | State | — | Terima group message | Auto-pull & SLA tidak berlaku untuk group (`isGroup` branch) — sesuai FE yang hide SLA |
| WG-E04 | Backfill tidak emit socket, live emit | P1 | State | — | Bandingkan path live vs backfill | Live emit socket; backfill tidak (konsisten C05) |
| WG-E05 | Ticket sync untuk group | P2 | Integration | Group conversation jadi ticket | Jadikan ticket | Inbound group message ikut ter-sync ke ticket room |

---

## F. FE inbox rendering

| ID | Requirement | Priority | Type | Precondition | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WG-F01 | Group tampil di list conversation | P0 | Happy | Ada group conversation | Buka inbox | Group tampil di daftar; avatar group; badge group |
| WG-F02 | SLA & screenshot disembunyikan untuk group | P2 | Compat | Group conversation dibuka | Buka detail | Panel SLA & screenshot tidak muncul (kosmetik `isGroup`) |
| WG-F03 | Bulk action dibatasi untuk group | P2 | Permission | — | Pilih group di list | Opsi open/close bulk disesuaikan branch `isGroup` |
| WG-F04 | Group tidak difilter keluar dari list | P1 | Regression | Ada group + direct | Buka inbox default | Group tetap muncul berdampingan dengan direct (tidak ada filter yang hide group) |

---

## G. Negative / konektivitas / edge

| ID | Requirement | Priority | Type | Precondition | Steps | Expected Result |
|---|---|---|---|---|---|---|
| WG-G01 | Message tanpa `remoteJid` / `id` | P2 | Negative | — | Inject message cacat | Di-skip aman tanpa crash (`validateMessageFields`) |
| WG-G02 | Socket belum siap saat message | P2 | Negative | `sock`/`lidMappingStore` null | Trigger message saat reconnect | `extractMessageData` return null, tidak crash, message tidak hilang permanen (verifikasi re-delivery) |
| WG-G03 | Reconnect saat history sync | P1 | Concurrency | Disconnect di tengah history | Putus koneksi saat sync | History sync resume / timeout auto-unblock; tidak stuck |
| WG-G04 | Group JID tidak di-ignore | P1 | Negative | — | Terima message dari `@g.us` | `shouldIgnoreJid` false → tidak di-skip (hanya broadcast/status/newsletter yang di-ignore) |
| WG-G05 | Unread message cap per group | P3 | Boundary | >500 unread di group | Banjiri unread | List Redis di-trim ke 500 terakhir, TTL 1 hari |
| WG-G06 | Group besar (ratusan participant) | P2 | Boundary | Group ~500 member | Terima message | `saveParticipants` selesai tanpa timeout; message tetap masuk |

---

## Prioritas eksekusi (smoke → full)
1. **Smoke P0:** WG-A01, A02, A08, D02, B05, C01, F01.
2. **Regression bug utama:** seluruh seksi D + A08/A09 + C08 (before/after fix unwrap).
3. **Boundary history:** C02–C06.
4. Sisanya per prioritas.

→ skipped: automation script (Playwright) — ini test list manual-first; mapping ke page object `sixV2Automation` dibuat saat masuk fase automation. Add when fix di-merge & masuk QA post-implementation.
