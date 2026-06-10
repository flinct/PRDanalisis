# Analysis — WhatsApp Special Message Types Display di SatuInbox

| Analyst | Claude (AI QA Analyst) |
| :---- | :---- |
| **Tipe Analisa** | Feature Development Analysis (Type 1) |
| **Domain** | Conversation Room — Inbound WhatsApp Messages |
| **Tanggal** | 2026-06-08 |
| **Source PRD** | Conversation Room v1.1 (Conversationv2) |
| **Status** | Draft — Menunggu konfirmasi PM |

---

## Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-06-08 | Claude (AI QA Analyst) | Initial analysis dari user story verbal |

---

## 1. Overview

| Item | Detail |
|---|---|
| **Objective** | SatuInbox harus menampilkan 4 tipe pesan WhatsApp yang saat ini belum ter-handle: Contact, Poll, Event, Shared Link — dengan tampilan setara WhatsApp Web |
| **Trigger** | User story: agen menerima chat dari WhatsApp berupa Contact, Poll, Event, atau Shared Link dan ingin melihatnya di SatuInbox seperti di WhatsApp Web |
| **Scope** | Inbound display only (read-only). Outbound dan interaktif (vote, RSVP, save contact) out of scope Phase 1 |
| **Existing Coverage** | SatuInbox sudah handle: image, video, audio, document, voice note |
| **Gap** | Contact, Poll, Event, Link Preview belum pernah didefinisikan di PRD manapun |

---

## 2. Gap Analysis — PRD vs Reality

PRD Room v1.1 mendefinisikan tipe yang didukung:

> *"Support: Text, images, audio, video, documents, voice notes. Max size: 100MB."*

Keempat tipe berikut **tidak ada di PRD manapun**:

| Message Type | Status di PRD | Status di FE | Status di BE (Baileys) |
|---|---|---|---|
| Contact Card | ❌ Tidak ada | ❌ Tidak ada | ✅ Tersedia (`contactMessage`) |
| Poll | ❌ Tidak ada | ❌ Tidak ada | ✅ Tersedia (`pollCreationMessage`, `pollUpdateMessage`) |
| Event | ❌ Tidak ada | ❌ Tidak ada | ✅ Tersedia (`eventMessage`) |
| Shared Link (Preview) | ❌ Tidak ada | ❌ Tidak ada | ✅ Tersedia (`extendedTextMessage` + OG metadata) |

**Kritis:** Baileys di BE sudah decode semua tipe ini dari WhatsApp, tapi kemungkinan besar data tidak di-forward ke FE dalam format terstruktur — sehingga tampil sebagai pesan kosong atau `[unsupported]`.

---

## 3. Requirement Analysis per Message Type

### 3A. Contact Card

**WhatsApp Web menampilkan:**
- Avatar/placeholder icon kontak
- Nama kontak (bold)
- Nomor telepon (satu atau lebih)
- Tombol "View contact"

**Functional Requirements:**

| Req ID | Requirement | Priority |
|---|---|---|
| FR-C1 | Tampilkan bubble tipe `contact_card` dengan nama kontak dan nomor telepon | P1 |
| FR-C2 | Tampilkan avatar placeholder jika tidak ada foto profil | P1 |
| FR-C3 | Jika nomor kontak yang dibagikan ada di database SatuInbox Contact, tampilkan link "Lihat kontak" | P2 |
| FR-C4 | Support multiple kontak dalam satu pesan (WhatsApp allow kirim multi-contact) | P2 |
| FR-C5 | Kontak harus **read-only** — agent tidak bisa edit atau save langsung ke WhatsApp | P0 |

**Data Model (dari Baileys `contactMessage`):**
```
displayName: string
vcard: string  // vCard format (RFC 6350) — parse untuk extract name + phone(s)
```

---

### 3B. Poll

**WhatsApp Web menampilkan:**
- Icon poll + label "Poll"
- Pertanyaan/judul poll (bold)
- Tiap opsi: nama opsi + jumlah suara + progress bar persentase
- Total votes count
- Jika belum vote: opsi clickable (tidak relevan di SatuInbox)
- Jika sudah vote: tampilan read-only dengan vote highlight

**Functional Requirements:**

| Req ID | Requirement | Priority |
|---|---|---|
| FR-P1 | Tampilkan bubble tipe `poll` dengan judul poll dan semua opsi | P1 |
| FR-P2 | Tampilkan jumlah suara per opsi dan total suara | P1 |
| FR-P3 | Tampilkan progress bar persentase per opsi | P2 |
| FR-P4 | Poll harus **read-only** — agent tidak bisa vote dari SatuInbox | P0 |
| FR-P5 | Ketika customer vote (`pollUpdateMessage` masuk via socket), update tampilan poll secara real-time | P1 |
| FR-P6 | Tampilkan label "Poll" dengan icon yang jelas | P1 |
| FR-P7 | Jika poll dibuat oleh customer, tampilkan informasi pembuat | P2 |

**Data Model (dari Baileys):**
```
pollCreationMessage:
  name: string                    // Judul poll
  options: [{optionName: string}] // Daftar opsi
  selectableOptionsCount: number  // 1 = single vote, >1 = multi vote

pollUpdateMessage:
  pollCreationMessageKey: {id}               // Reference ke poll asli
  vote: {selectedOptions: [{name: string}]}  // Opsi yang dipilih voter
```

**⚠️ Complexity Note:** Poll vote tracking membutuhkan aggregasi di BE. Setiap `pollUpdateMessage` adalah delta vote dari satu user, bukan snapshot total. BE perlu meng-aggregate votes dan forward sebagai poll state ke FE — bukan raw event.

---

### 3C. Event

**WhatsApp Web menampilkan:**
- Icon kalender
- Nama event (bold)
- Tanggal dan waktu (formatted)
- Lokasi (jika ada)
- Deskripsi (jika ada)
- Tombol CTA "See Event" / "RSVP"

**Functional Requirements:**

| Req ID | Requirement | Priority |
|---|---|---|
| FR-E1 | Tampilkan bubble tipe `event` dengan nama event dan tanggal/waktu | P1 |
| FR-E2 | Tampilkan lokasi event jika tersedia | P2 |
| FR-E3 | Tampilkan deskripsi event jika tersedia | P2 |
| FR-E4 | Format tanggal/waktu mengikuti locale (Bahasa Indonesia) | P1 |
| FR-E5 | Event harus **read-only** — agent tidak bisa RSVP dari SatuInbox | P0 |
| FR-E6 | Jika event memiliki link eksternal, tampilkan sebagai link yang bisa dibuka di tab baru | P2 |

**Data Model (dari Baileys `eventMessage`):**
```
name: string
description?: string
location?: {name?: string}
startAt: timestamp
endAt?: timestamp
isCanceled: boolean
```

---

### 3D. Shared Link (Link Preview)

**WhatsApp Web menampilkan:**
- Thumbnail/OG image (jika tersedia)
- Domain/site name
- Judul halaman (bold)
- Deskripsi singkat
- URL yang bisa diklik

**Functional Requirements:**

| Req ID | Requirement | Priority |
|---|---|---|
| FR-L1 | Jika pesan text mengandung URL, tampilkan link preview card di bawah text | P1 |
| FR-L2 | Tampilkan thumbnail, judul, deskripsi, dan domain dari OG metadata | P1 |
| FR-L3 | URL harus clickable dan buka di tab baru | P1 |
| FR-L4 | Jika thumbnail gagal load, tampilkan icon placeholder | P1 |
| FR-L5 | Jika OG metadata tidak tersedia, tampilkan URL saja sebagai plain clickable link | P1 |
| FR-L6 | Tidak ada security proxy requirement di Phase 1 — URL dibuka langsung | P2 |

**Data Model (dari Baileys `extendedTextMessage`):**
```
text: string              // Pesan teks asli
matchedText: string       // URL yang terdeteksi
canonicalUrl: string      // URL final (setelah redirect)
title?: string            // OG title
description?: string      // OG description
jpegThumbnail?: bytes     // Thumbnail image (base64)
```

**Catatan:** Baileys fetch OG metadata saat pesan masuk — BE tinggal forward data ini ke FE. FE tidak perlu fetch OG metadata sendiri.

---

## 4. Impact Analysis

### 4.1 Module Impact

| Module | Impact | Level |
|---|---|---|
| Conversation Room (MessageBubble) | Tambah 4 komponen baru + 1 fallback | HIGH |
| Message Service (BE) | Parse dan forward 4 tipe baru ke message schema | HIGH |
| Socket Event (`/conversations`) | Tambah handling `pollUpdateMessage` untuk live vote update | MEDIUM |
| Message Schema (BE) | Tambah enum `type` baru + typed payload per type | HIGH |
| Baileys Inbound Handler | Map 4 Baileys message types ke internal schema | HIGH |
| FE Bubble Router | Route message type ke komponen yang tepat | MEDIUM |
| FE Fallback | Generic "Pesan tidak didukung" untuk tipe tidak dikenal | MEDIUM |

### 4.2 API / Data Contract Impact

BE harus extend message payload:

```typescript
// Existing
type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'voice_note'

// NEW — tambahkan:
type MessageType = ... | 'contact_card' | 'poll' | 'event' | 'link_preview'

interface ContactCardPayload {
  displayName: string;
  phones: string[];
  vcard: string;  // raw vCard string
}

interface PollPayload {
  pollId: string;
  question: string;
  options: { name: string; voteCount: number }[];
  totalVotes: number;
  selectableCount: number;
}

interface EventPayload {
  name: string;
  startAt: string;      // ISO timestamp
  endAt?: string;
  location?: string;
  description?: string;
  isCanceled: boolean;
}

interface LinkPreviewPayload {
  text: string;
  url: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}
```

### 4.3 Frontend Component Architecture

```
ConversationChatRoom
└── MessageBubble (router by messageType)
    ├── TextBubble          (existing)
    ├── ImageBubble         (existing)
    ├── VideoBubble         (existing)
    ├── AudioBubble         (existing)
    ├── DocumentBubble      (existing)
    ├── ContactCardBubble   (NEW) ← vCard display
    ├── PollBubble          (NEW) ← read-only + live vote count
    ├── EventBubble         (NEW) ← event info card
    ├── LinkPreviewBubble   (NEW) ← OG preview card
    └── UnsupportedBubble   (NEW) ← fallback "Pesan tidak didukung"
```

### 4.4 UI/UX Requirements

| Principle | Detail |
|---|---|
| Read-only | Semua 4 tipe ini read-only — agent hanya melihat, tidak interact ke WhatsApp |
| Visual consistency | Card-style bubble menyerupai WhatsApp Web: rounded corners, icon per type, clear hierarchy |
| Graceful degradation | Field kosong/null → hide field tersebut, jangan tampilkan empty label |
| Fallback | Tipe tidak dikenal → "Pesan tidak didukung" + icon info. Jangan blank, jangan crash |
| No ambiguity | Tidak ada vote button, RSVP button, atau save contact button yang mengarah ke WhatsApp |

### 4.5 Backend (Baileys) Impact

| Area | Change |
|---|---|
| Inbound message handler | Parse dan map 4 Baileys tipe baru ke internal message schema |
| Poll vote aggregation | Track votes per `pollId` per voter — perlu storage (Redis/MongoDB) |
| Socket broadcast | Broadcast `pollUpdateMessage` sebagai update poll state ke FE (new event type) |
| Message schema | Extend `messageType` enum + typed payload — breaking change jika consumer hardcode enum lama |

### 4.6 Performance Impact

| Concern | Risk | Mitigation |
|---|---|---|
| Link preview thumbnail | LOW — Baileys sudah fetch, tidak ada extra HTTP call dari FE | — |
| Poll vote aggregation | MEDIUM — Redis atomic increment per `pollId` + option | Redis counter |
| vCard parsing | LOW — tiny payload, parse di FE | — |

---

## 5. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Poll vote aggregation race condition | Medium | High | Atomic increment di Redis per `pollId` + option |
| `pollUpdateMessage` missed (socket disconnect) | Medium | Medium | Re-fetch poll state via REST saat reconnect atau open room |
| Baileys API change untuk `eventMessage` | Low | Medium | Abstract parsing di BE adapter layer — jangan hardcode Baileys schema di service |
| Link thumbnail dari external server diblok/timeout | Medium | Low | Fallback ke icon placeholder, timeout 3s |
| vCard format variation (multiple phone types) | High | Low | Parse hanya `TEL` field, skip type metadata |
| Agent confused karena tidak bisa interact | Medium | Medium | UI label "Read-only" atau tooltip yang jelas di setiap tipe |

---

## 6. Open Questions — Wajib Dijawab PM/Engineering

| # | Pertanyaan | Impact jika tidak dijawab |
|---|---|---|
| OQ-1 | Apakah agent bisa **save contact** (Contact Card) ke database SatuInbox langsung dari bubble? Atau hanya view? | Ada/tidaknya CTA di bubble, scope FE dan BE berbeda |
| OQ-2 | Poll vote: apakah perlu tampilkan **nama voter** (seperti "who voted" di WA)? Atau cukup count saja? | Complexity aggregation berbeda drastis — count vs voter list |
| OQ-3 | Jika poll update masuk saat agent tidak buka room, apakah vote count diupdate saat **next open**? | Socket-only atau REST fallback pada load |
| OQ-4 | Event **RSVP status** dari customer — apakah perlu ditampilkan di SatuInbox? | Tambah complexity parsing RSVP event dari Baileys |
| OQ-5 | Link preview: apakah perlu **security proxy** (buka via proxy/iframe sandbox)? | Keamanan jika link malicious |
| OQ-6 | Apakah **outbound** (agent kirim) tipe-tipe ini masuk Phase 1 atau out of scope? | Scope creep risk jika tidak dikunci |
| OQ-7 | Bagaimana behaviour jika pesan ini diterima di **channel selain WhatsApp Web** (WA Official API, Widget)? | Schema harus channel-agnostic atau WA-specific? |
| OQ-8 | Jika event sudah lewat tanggalnya, apakah tampilkan badge **"Event berakhir"**? | UX clarification |

---

## 7. Scope Proposal

### Phase 1 — In Scope (MVP)

| Tipe | Requirement |
|---|---|
| **Contact Card** | Tampilkan nama + nomor telepon, read-only, avatar placeholder. Parse vCard. |
| **Poll** | Tampilkan question + opsi + vote count per opsi (static snapshot saat load). Read-only. |
| **Event** | Tampilkan nama + tanggal/waktu + lokasi (jika ada). Read-only. |
| **Link Preview** | Tampilkan thumbnail + title + description + URL clickable. Fallback ke plain URL. |
| **Fallback** | Tipe tidak dikenal: tampilkan "Pesan tidak didukung" — jangan crash atau blank. |

### Phase 1 — Out of Scope (defer ke Phase 2)

- Agent vote pada poll
- Agent RSVP pada event
- Save contact dari bubble ke SatuInbox Contact DB (OQ-1)
- Real-time poll vote update via socket (simplify: static load saja di Phase 1)
- Security proxy untuk link preview
- Tampilkan nama voter (OQ-2)
- Outbound pengiriman Contact / Poll / Event dari agent

---

## 8. Traceability Matrix

| Req ID | Requirement | Impact Area | Priority | Status |
|---|---|---|---|---|
| FR-C1 | Contact card bubble: nama + nomor | FE Component, BE Schema | P1 | 🔴 Belum ada |
| FR-C2 | Contact avatar placeholder | FE Component | P1 | 🔴 Belum ada |
| FR-C5 | Contact read-only | FE UX | P0 | 🔴 Belum ada |
| FR-P1 | Poll bubble: question + opsi + count | FE Component, BE Schema | P1 | 🔴 Belum ada |
| FR-P2 | Poll vote count + total | FE Component | P1 | 🔴 Belum ada |
| FR-P4 | Poll read-only | FE UX | P0 | 🔴 Belum ada |
| FR-P5 | Poll live update via socket | BE Socket, FE | P1 | 🔴 Belum ada |
| FR-E1 | Event bubble: nama + tanggal | FE Component, BE Schema | P1 | 🔴 Belum ada |
| FR-E4 | Format tanggal locale ID | FE UX | P1 | 🔴 Belum ada |
| FR-E5 | Event read-only | FE UX | P0 | 🔴 Belum ada |
| FR-L1 | Link preview card | FE Component, BE Schema | P1 | 🔴 Belum ada |
| FR-L3 | URL clickable, buka tab baru | FE UX | P1 | 🔴 Belum ada |
| FR-L5 | Fallback ke plain URL jika OG gagal | FE UX | P1 | 🔴 Belum ada |

---

## 9. Recommendation

**Verdict: Conditional Go**

**Kondisi sebelum development:**

1. **BE harus konfirmasi** apakah data 4 tipe ini sudah masuk ke message schema yang dikirim ke FE — jika belum, BE harus dikerjakan lebih dulu
2. **PM harus jawab OQ-1 dan OQ-2** — keduanya mengubah scope secara signifikan
3. **Poll vote aggregation** harus didesain dengan hati-hati di BE (Redis counter per `pollId`) sebelum FE implement
4. **Fallback "Pesan tidak didukung"** wajib ada di Day 1 — tipe yang belum dihandle tidak boleh tampil blank atau crash

**Prioritas pengerjaan yang disarankan:**

| Urutan | Feature | Alasan |
|---|---|---|
| 1 | Link Preview | Paling sederhana, high frequency, Baileys sudah provide semua data |
| 2 | Contact Card | Sederhana, penting untuk konteks CRM |
| 3 | Poll | Medium complexity — koordinasi BE untuk vote aggregation |
| 4 | Event | Least common — dapat defer ke sprint berikutnya |

**Severity keseluruhan: HIGH**
Agent tidak bisa memahami konteks percakapan jika pesan-pesan ini tampil sebagai blank atau unsupported. Ini langsung berdampak ke kualitas customer service.
