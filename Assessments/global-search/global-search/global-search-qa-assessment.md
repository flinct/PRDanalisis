# QA Assessment Report: Global Search — Unified Conversation & Ticket Search

> **Assessment Type:** Type 1 — Feature Development Analysis
> **Source PRD / Source Input:** `PRD/Conversationv2/PRD - Global Search (Conversation + Ticket).md`
> **Assessment Artifact Path:** `Assessments/global-search/global-search/global-search-qa-assessment.md`
> **Version:** `v1.2`
> **Previous Version:** `v1.0` (see `versions/global-search-qa-assessment-v1.0.md`)
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-15
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- **v1.0 (2026-06-15):** Initial version — analisa pertama untuk PRD Global Search v1.0. Decision: `PROCEED_WITH_CAUTION`.
- **v1.2 (2026-06-15):** Penambahan Section 4.5 — **UX Alternative: Popup/Drawer Global Search**:
  - Analisa perubahan dari full page (`/search`) ke popup/drawer overlay
  - Dua varian: Command Palette (small) vs Drawer Panel (large) — rekomendasi drawer
  - Dampak ke 8 functional requirements (FR-001, FR-008, FR-017, FR-025–FR-027, FR-041–FR-046, US-010)
  - 4 edge case baru spesifik popup (background scroll lock, click-outside dismiss, resize, mobile)
  - Revised state flow diagram
  - Trade-off matrix: full page vs popup vs drawer

---

## 1. Overview

**Feature / Issue:** Global Search — Unified Conversation & Ticket Search

**Objective:** Memberikan satu halaman pencarian terpadu (`/search`) dimana agent dan supervisor dapat mencari di seluruh Conversation dan Ticket dengan satu kata kunci, mengeliminasi kebutuhan untuk menebak domain mana yang menyimpan data.

**Business Context:**

- Saat ini agent harus menebak apakah data yang dicari ada di Conversation atau Ticket sebelum mencari
- Agent harus navigasi ke halaman yang berbeda jika tebakan salah
- Custom attributes dan custom fields hanya bisa dicari di halaman list masing-masing
- Full message content tidak searchable dari Chat List search saat ini

**Scope In:**

- Search di Conversation dan Ticket domain
- Search by: customer name, phone, alias, message content, Conversation ID, tags, custom attributes (single + collections)
- Search by: Ticket ID, title, client name, description, tags, custom fields (text, dropdown, date)
- Relevance ranking per domain (exact → prefix → partial)
- Unified pagination dengan section divider
- Keyword highlighting pada result cards
- RBAC-scoped results
- Click result → navigate ke Conversation Room atau Ticket Detail
- Empty state, error state, loading state
- Keyboard shortcut (Ctrl+K / Cmd+K)
- Sidebar navigation item "Cari"

**Scope Out:**

- Cross-workspace atau global org-wide search
- AI semantic / fuzzy search
- Search di deleted/archived tickets
- Search di Broadcast, Contact, atau domain lain
- Saved search presets
- Full message history search tanpa batas
- Export search results
- Search analytics dashboard
- Advanced filter panel (channel, status, date range)

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**

> PRD Global Search v1.0 sangat matang dan lengkap — semua functional requirement, edge case, error handling, dan NFR sudah terdefinisi dengan jelas. Feature dapat dilanjutkan ke development dengan catatan: (1) dua gRPC endpoint `SearchGlobal` di conversation-service dan ticket-service harus diimplementasi terlebih dahulu, (2) MongoDB text index harus dibuat dan di-benchmark sebelum production, (3) Custom Attributes data model harus dipastikan deployed paralel atau sebelumnya.

### 2.2 Required Actions Before Development

- [ ] **Define proto contract** untuk `SearchGlobal` di `conversation.proto` dan `ticket.proto` — action: Engineering Lead (Naftal Yunior)
- [ ] **Benchmark MongoDB text index** dengan production-volume data (100K conversation, 50K ticket) — action: BE Team
- [ ] **Konfirmasi status Custom Attributes BE** — apakah data model single + collections sudah deployed? — action: PM (Dany Christian) + BE Team
- [ ] **Resolve Open Question Q1** — apakah advanced filter panel masuk Phase 1 atau Phase 2? — action: PM (Dany Christian)
- [ ] **Resolve Open Question Q3** — "Muat lebih banyak" per domain independen atau simultan? — action: PM + Design
- [ ] **Desain review** — layout halaman search, card design, skeleton loading — action: Design Lead (TBD)

### 2.3 Key Blocking Reasons / Conditions

- **Blocker:** conversation-service `SearchGlobal` gRPC endpoint — tanpa ini, Conversation section tidak bisa menampilkan hasil
- **Blocker:** ticket-service `SearchGlobal` gRPC endpoint — tanpa ini, Ticket section tidak bisa menampilkan hasil
- **Conditional:** MongoDB text index harus dibuat sebelum launch; bisa di-migrate paralel dengan development
- **Conditional:** Custom Attributes data model harus siap agar search di custom attributes/fields berfungsi (PRD asumsi A1)

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Medium — feature baru tanpa mengubah existing flow; 2 gRPC endpoint baru + 1 API Gateway endpoint + 1 FE page baru
- **Risk Level:** Medium — dependency ke 2 backend service, text index performance, RBAC scope konsistensi
- **Primary Impact Areas:** Backend, API, UI, Database, RBAC, Performance

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule                                                                        | Source                          |
| ----- | ------------------------------------------------------------------------------------ | ------------------------------- |
| BR-01 | Search mencakup Conversation DAN Ticket domain pada setiap query                     | US-001, FR-010                  |
| BR-02 | Hasil dikelompokkan per domain: Percakapan di atas, Tiket di bawah                   | US-004, FR-013                  |
| BR-03 | Relevance ranking: exact > prefix > partial; tiebreak pakai `updatedAt`              | US-006, FR-032–FR-034           |
| BR-04 | RBAC scope Conversation ikuti aturan Chat List (Your Inbox, Team, Channel)           | US-008, FR-035–FR-038           |
| BR-05 | RBAC scope Ticket ikuti `TicketViewEnum` (8 views)                                   | US-008, FR-039–FR-040           |
| BR-06 | Message content search dibatasi ke N pesan terakhir per conversation (default 500)   | US-002, NFR scalability         |
| BR-07 | Keyword ≥ 2 karakter non-space setelah trim; max 200 karakter                        | FR-006, Field Validation        |
| BR-08 | Partial success: satu domain gagal → domain lain tetap tampil                        | US-009, EH-002, NFR reliability |
| BR-09 | Session persistence: kembali ke search page → keyword + hasil terakhir dipertahankan | US-005, FR-027                  |
| BR-10 | URL shareable: keyword disimpan di query param `?q=<keyword>`                        | FR-008, EC-010                  |

### 3.2 Acceptance Criteria

- 10 user stories (US-001 s.d. US-010) dengan acceptance criteria 3-tier each — **seluruhnya terdefinisi jelas dan testable**
- Setiap US memiliki Given-When-Then yang eksplisit
- US-001 s.d. US-009 adalah P0 (harus ada di MVP); US-010 adalah P1 (keyboard shortcut)

### 3.3 Assumptions

| #   | Assumption                                                                                             | Validasi                                                    |
| --- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| A1  | Custom Attributes data model (single + collections) deployed sebelum atau paralel dengan Global Search | ⚠️ Perlu konfirmasi — lihat OQ tambahan                     |
| A2  | MongoDB mendukung `$text` indexes dengan case-insensitive search                                       | ✅ MongoDB text indexes support case-insensitive by default |
| A3  | Message search window 500 pesan per conversation acceptable untuk MVP                                  | ✅ Reasonable untuk MVP; bisa di-tune                       |
| A4  | RBAC scope untuk search match dengan aturan Chat List dan Ticket List existing                         | ✅ Global memory sudah definisikan aturan ini               |
| A5  | API Gateway punya kapasitas cukup untuk parallel gRPC calls (read-only)                                | ✅ Read-only, tidak ada write overhead                      |

### 3.4 Clarifications Needed

| ID    | Item                                                                                                                             | Impact                                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| CL-01 | Apakah custom attributes BE sudah deployed di production? Jika belum, search di custom attributes tidak akan mengembalikan hasil | Search scope berkurang; agent tidak bisa mencari by AWB/order ID  |
| CL-02 | Apakah message content search perlu mencakup internal notes juga? PRD hanya menyebut message bodies                              | Scope pencarian — internal notes mungkin relevan untuk supervisor |
| CL-03 | Apakah "linked ticket" atau "linked conversation" cross-reference perlu ditampilkan di search result? (OQ Q4)                    | UX enhancement — menambah konteks hasil pencarian                 |

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

```
┌─────────────────────────────────────────────────────────────┐
│                     CURRENT STATE (v2.7.0)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │  Chat List Page   │          │  Ticket List Page │         │
│  │  /conversation/   │          │  /ticketing/      │         │
│  │  [your-inbox]     │          │                    │         │
│  ├──────────────────┤          ├──────────────────┤         │
│  │ Chat List Search  │          │ Ticket Search     │         │
│  │ • Customer name   │          │ • Ticket ID       │         │
│  │ • Phone           │          │ • Title           │         │
│  │ • Alias           │          │ • Client name     │         │
│  │ • Tags            │          │ • Description     │         │
│  │ ❌ No message     │          │ • Tags            │         │
│  │    content search │          │ • Custom fields   │         │
│  │ ❌ No custom      │          │ • Relevance rank  │         │
│  │    attributes     │          │ • Out-of-filter   │         │
│  └──────────────────┘          └──────────────────┘         │
│                                                              │
│  Agent harus:                                                │
│  1. Tebak domain (Conversation vs Ticket)                    │
│  2. Navigasi ke halaman yang tepat                          │
│  3. Cari di halaman itu                                     │
│  4. Jika tidak ketemu → navigasi ke halaman lain → cari lagi│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Proposed State (To-Be)

```
┌─────────────────────────────────────────────────────────────┐
│                    PROPOSED STATE (Global Search)             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  /search Page                         │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  🔍 Cari percakapan dan tiket...          [×]   │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌─── Percakapan (3) ────────────────────────────┐   │   │
│  │  │  ┌──────────────────────────────────────┐     │   │   │
│  │  │  │ 👤 John Doe  💬 "...mau **refund**..."│     │   │   │
│  │  │  │    WA · 10m ago  🟢 assigned          │     │   │   │
│  │  │  └──────────────────────────────────────┘     │   │   │
│  │  │  ... (2 more cards)                           │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  │                                                       │   │
│  │  ───────────── Section Divider ───────────────        │   │
│  │                                                       │   │
│  │  ┌─── Tiket (2) ─────────────────────────────────┐   │   │
│  │  │  ┌──────────────────────────────────────┐     │   │   │
│  │  │  │ #TK-8149  **Refund** request        │     │   │   │
│  │  │  │   John Doe · WA · Open · SLA 2h 15m │     │   │   │
│  │  │  └──────────────────────────────────────┘     │   │   │
│  │  │  ... (1 more card)                            │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Single entry point → parallel query → grouped results       │
│  Click result → navigate to Conversation Room / Ticket Detail│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 State Transition / Data Flow Notes

```
User types keyword (≥2 chars)
  │
  ├─ 300ms debounce
  │
  ▼
GET /api/search?q=<keyword>&conversationLimit=20&conversationOffset=0&ticketLimit=20&ticketOffset=0
  │
  ├────────────────────────────┬────────────────────────────┐
  ▼                            ▼                            │
API Gateway                    API Gateway                  │
  │                            │                            │
  ▼ gRPC                       ▼ gRPC                       │
conversation-service          ticket-service               │
SearchGlobal                  SearchGlobal                  │
  │                            │                            │
  ▼ MongoDB $text              ▼ MongoDB $text              │
conversations collection      tickets collection            │
  │                            │                            │
  ▼                            ▼                            │
API Gateway aggregates        API Gateway aggregates        │
  │                            │                            │
  └────────────┬───────────────┘                            │
               ▼                                            │
       Response to FE                                       │
       { conversations: [...], tickets: [...], meta: {...} }
               │                                            │
               ▼                                            │
       FE renders sections                                  │
       Conversation section first, Ticket section second    │
```

### 4.4 Search Pipeline Architecture — Cross-Collection Query Detail

> ⚠️ **Bagian ini mengisi gap di PRD:** PRD menyebut "query conversation-service dan ticket-service" tetapi tidak menjelaskan bagaimana setiap service menangani query lintas collection internal (conversations vs messages, tickets vs ticket messages, custom attributes vs custom fields).

#### 4.4.1 Problem: Collection Fragmentation

Untuk keyword seperti **"AWB-1234"**, data bisa berada di collection yang berbeda:

```
┌─────────────────────────────────────────────────────────────────┐
│              conversation-service DB (satuinbox_conversation)    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐    ┌──────────────────────────┐        │
│  │ conversations        │    │ messages                  │        │
│  │ collection           │    │ collection                │        │
│  ├─────────────────────┤    ├──────────────────────────┤        │
│  │ • customerName       │    │ • body (message content)  │        │
│  │ • customerPhone      │    │ • conversationId (FK)     │        │
│  │ • alias              │    │ • senderType              │        │
│  │ • conversationNumber │    │ • createdAt               │        │
│  │ • tags[]             │    │                            │        │
│  │ • customAttributes[] │    │  ⚠️ PER COLLECTION        │        │
│  │   ├── single fields  │    │    BERBEDA — butuh        │        │
│  │   └── collections[]  │    │    query terpisah!        │        │
│  │ • status             │    │                            │        │
│  │ • participants[]     │    │                            │        │
│  │ • team               │    │                            │        │
│  │ • companyId          │    │                            │        │
│  └─────────────────────┘    └──────────────────────────┘        │
│                                                                  │
│  Keyword "AWB-1234" bisa match di:                               │
│  → conversations.customAttributes[].value  (custom prop)         │
│  → messages.body                            (message content)    │
│  → conversations.customerName               (identity)           │
│  → conversations.tags[]                     (tags)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  ticket-service DB (satuinbox_ticket)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐    ┌──────────────────────────┐        │
│  │ tickets              │    │ ticket_messages           │        │
│  │ collection           │    │ collection (atau          │        │
│  ├─────────────────────┤    │  sub-document dalam       │        │
│  │ • ticketNumber       │    │  tickets)                 │        │
│  │ • title              │    ├──────────────────────────┤        │
│  │ • clientName         │    │ • body (reply content)    │        │
│  │ • description        │    │ • ticketId (FK)           │        │
│  │ • tags[]             │    │ • type (customer/internal)│        │
│  │ • customFields[]     │    │                            │        │
│  │   ├── text           │    │  ⚠️ SAMA — butuh query    │        │
│  │   ├── dropdown       │    │    terpisah!              │        │
│  │   └── date           │    │                            │        │
│  │ • status             │    │                            │        │
│  │ • assignees[]        │    │                            │        │
│  │ • teamInbox          │    │                            │        │
│  │ • companyId          │    │                            │        │
│  └─────────────────────┘    └──────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Kesimpulan:** Tidak bisa satu query `$text` sederhana. Masing-masing service butuh **multi-collection aggregation pipeline**.

#### 4.4.2 Conversation-Side Search Pipeline

```
Keyword "AWB-1234"
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  conversation-service :: SearchGlobal                        │
│                                                              │
│  ═══════════ STEP 1: MULTI-COLLECTION QUERY ═══════════     │
│                                                              │
│  Query 1: conversations collection                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ $text: { $search: "AWB-1234" }                         │  │
│  │ Fields indexed: customerName, customerPhone, alias,     │  │
│  │   conversationNumber, tags, customAttributes.value      │  │
│  │ + $match: { companyId, organizationId, RBAC scope }    │  │
│  │ + $project: { ..., _matchSource: "conversation" }      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Query 2: messages collection                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ $text: { $search: "AWB-1234" }                         │  │
│  │ Fields indexed: body                                    │  │
│  │ + $match: { companyId, organizationId }                │  │
│  │ + $limit: 500 messages per conversation (window)        │  │
│  │ + $lookup: conversation by conversationId               │  │
│  │   → ambil identity fields (name, phone, status, SLA)   │  │
│  │ + $project: { ..., _matchSource: "message" }           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ═══════════ STEP 2: DEDUPLICATE & MERGE ════════════      │
│                                                              │
│  Jika conversation muncul di kedua query:                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Conversation "conv_abc123" muncul dari:                 │  │
│  │   Query 1 → match di customAttributes[].value          │  │
│  │   Query 2 → match di messages[3].body                  │  │
│  │                                                        │  │
│  │ MERGE: 1 result dengan matchFields gabungan            │  │
│  │ {                                                      │  │
│  │   id: "conv_abc123",                                   │  │
│  │   matchFields: ["customAttributes", "messageBody"],    │  │
│  │   messageMatchSnippet: "...AWB-1234 telah dikirim..."  │  │
│  │ }                                                      │  │
│  │                                                        │  │
│  │ Prioritas relevance:                                    │  │
│  │   identity exact > customAttr > tag > message partial   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ═══════════ STEP 3: RELEVANCE RANK ═══════════════════    │
│                                                              │
│  Sort output:                                                │
│  1. Exact match on conversationNumber → rank 1              │
│  2. Exact match on customerName/alias/phone → rank 2        │
│  3. Exact match on customAttribute.value → rank 3           │
│  4. Prefix match (any field) → rank 4                       │
│  5. Partial/contains match → rank 5                         │
│  6. Message content match → rank 6                          │
│  7. Tiebreak: updatedAt DESC                                │
│                                                              │
│  ═══════════ STEP 4: OUTPUT ═══════════════════════════    │
│                                                              │
│  SearchGlobalResponse {                                      │
│    results: [{                                               │
│      id, customerName, customerPhone, channel,              │
│      lastMessageSnippet, lastMessageAt, slaStatus,          │
│      assignmentStatus, tags,                                │
│      matchFields: ["customAttributes", "messageBody"],  ← PEMBEDA │
│      messageMatchSnippet: "...AWB-1234 telah..."            │
│    }],                                                       │
│    total: 47,                                                │
│    hasMore: true                                             │
│  }                                                           │
└──────────────────────────────────────────────────────────────┘
```

#### 4.4.3 Ticket-Side Search Pipeline

```
Keyword "AWB-1234"
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  ticket-service :: SearchGlobal                              │
│                                                              │
│  ═══════════ STEP 1: MULTI-COLLECTION QUERY ═══════════     │
│                                                              │
│  Query 1: tickets collection                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ $text: { $search: "AWB-1234" }                         │  │
│  │ Fields indexed: ticketNumber, title, clientName,        │  │
│  │   description, tags, customFields.value                 │  │
│  │ + $match: { companyId, organizationId, TicketView RBAC }│  │
│  │ + $project: { ..., _matchSource: "ticket" }            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Query 2: ticket_messages collection                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ $text: { $search: "AWB-1234" }                         │  │
│  │ Fields indexed: body                                    │  │
│  │ + $match: { companyId, organizationId }                │  │
│  │ + $limit: N recent messages per ticket                  │  │
│  │ + $lookup: ticket by ticketId                           │  │
│  │   → ambil identity fields (title, client, SLA, status) │  │
│  │ + $project: { ..., _matchSource: "ticketMessage" }     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ═══════════ STEP 2: DEDUPLICATE & MERGE ════════════      │
│                                                              │
│  Sama seperti conversation: merge by ticket ID,             │
│  gabungkan matchFields, ambil messageMatchSnippet            │
│                                                              │
│  ═══════════ STEP 3: RELEVANCE RANK ═══════════════════    │
│                                                              │
│  1. Exact match on ticketNumber → rank 1 (TERTINGGI)        │
│  2. Normalized exact (TK-8149 ↔ TK8149) → rank 2            │
│  3. Exact match on title/clientName → rank 3                │
│  4. Exact match on customField.value → rank 4               │
│  5. Prefix match → rank 5                                   │
│  6. Partial/contains → rank 6                               │
│  7. Message content match → rank 7                          │
│  8. Tiebreak: lastActivityAt DESC                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 4.4.4 Bagaimana FE Menampilkan "Pembeda" Keyword Match

**Kunci: field `matchFields` di response API.**

```json
// Response dari API Gateway
{
  "conversations": [
    {
      "id": "conv_abc123",
      "customerName": "John Doe",
      "lastMessageSnippet": "Saya mau refund...",
      "matchFields": ["customAttributes", "messageBody"],
      //                    ↑ PEMBEDA 1              ↑ PEMBEDA 2
      "messageMatchSnippet": "...AWB-1234 telah dikirim via JNE..."
      //                       ↑ Kalau match di message, tampilkan snippet
    },
    {
      "id": "conv_def456",
      "customerName": "Jane Smith",
      "lastMessageSnippet": "Order sudah diterima",
      "matchFields": ["customerPhone"],
      //                    ↑ Hanya match di nomor telepon
      "messageMatchSnippet": null
      //                    ↑ Tidak ada message match → tidak ditampilkan
    }
  ]
}
```

**FE Rendering Logic per Card:**

```
┌──────────────────────────────────────────────────────────────┐
│  Conversation Result Card                                     │
│                                                               │
│  👤 John Doe                        🕐 10 menit lalu          │
│  💬 WhatsApp · 🟢 SLA                👤 Assigned              │
│                                                               │
│  ┌─ matchFields.includes("messageBody") ?                    │
│  │  📝 "...AWB-1234 telah dikirim via JNE..."                │
│  │     ↑ messageMatchSnippet dengan highlight "AWB-1234"     │
│  └──────────────────────────────────────────────────────────│
│                                                               │
│  ┌─ matchFields.includes("customAttributes") ?               │
│  │  🏷️ Custom Attribute: AWB-1234                            │
│  │     ↑ Tampilkan field label + value dengan highlight       │
│  └──────────────────────────────────────────────────────────│
│                                                               │
│  ┌─ matchFields.includes("customerName") ?                   │
│  │  Nama: John Doe  ← highlight tidak perlu karena           │
│  │  nama sudah selalu tampil di card header                  │
│  └──────────────────────────────────────────────────────────│
│                                                               │
│  ┌─ matchFields.includes("tags") ?                           │
│  │  Tags: [VIP] [AWB-1234]  ← highlight tag yang match       │
│  └──────────────────────────────────────────────────────────│
└──────────────────────────────────────────────────────────────┘
```

**Display Rules:**

| `matchFields` Value  | FE Display                                        | Highlight Target                    |
| -------------------- | ------------------------------------------------- | ----------------------------------- |
| `customerName`       | Nama customer (sudah di header)                   | Nama di-bold atau diberi background |
| `customerPhone`      | Nomor telepon di sub-header                       | Nomor di-highlight                  |
| `alias`              | Alias di sub-header                               | Alias di-highlight                  |
| `conversationNumber` | Conversation number                               | Number di-highlight                 |
| `tags`               | Tags row dengan highlight pada tag yang match     | Tag spesifik                        |
| `customAttributes`   | Tampilkan custom attribute value dengan label     | Value di-highlight, tampilkan label |
| `messageBody`        | `messageMatchSnippet` di bawah lastMessageSnippet | Keyword di-highlight di snippet     |
| `ticketNumber`       | Ticket ID (header)                                | ID di-highlight                     |
| `title`              | Judul ticket (header)                             | Judul di-highlight                  |
| `description`        | Description snippet                               | Keyword di-highlight                |
| `customFields`       | Custom field value dengan label                   | Value di-highlight                  |
| `ticketMessageBody`  | `messageMatchSnippet` dari ticket reply           | Keyword di-highlight                |

#### 4.4.5 MongoDB Text Index Strategy

**Per Collection:**

```javascript
// conversations collection — compound text index
db.conversations.createIndex(
  {
    customerName: "text",
    customerPhone: "text",
    alias: "text",
    conversationNumber: "text",
    tags: "text",
    "customAttributes.value": "text",
    "customAttributes.collections.value": "text",
  },
  {
    name: "global_search_text_idx",
    default_language: "none", // no stemming for ID/numbers
    caseLevel: true, // case-sensitive support
    weights: {
      conversationNumber: 10, // highest weight
      customerName: 8,
      customerPhone: 7,
      alias: 5,
      tags: 3,
      "customAttributes.value": 6,
      "customAttributes.collections.value": 6,
    },
  },
);

// messages collection — text index on body only
db.messages.createIndex(
  { body: "text" },
  {
    name: "global_search_msg_text_idx",
    default_language: "none",
    weights: { body: 1 }, // lower weight than identity fields
  },
);

// tickets collection
db.tickets.createIndex(
  {
    ticketNumber: "text",
    title: "text",
    clientName: "text",
    description: "text",
    tags: "text",
    "customFields.value": "text",
  },
  {
    name: "global_search_ticket_text_idx",
    default_language: "none",
    weights: {
      ticketNumber: 15, // HIGHEST — exact ID match is king
      title: 10,
      clientName: 8,
      "customFields.value": 6,
      description: 4,
      tags: 3,
    },
  },
);

// ticket_messages collection
db.ticket_messages.createIndex(
  { body: "text" },
  {
    name: "global_search_tmsg_text_idx",
    default_language: "none",
    weights: { body: 1 },
  },
);
```

**⚠️ Penting:** `default_language: "none"` kritis untuk search ID/nomor seperti "AWB-1234" — kalau pakai stemming (`"english"` atau `"indonesian"`), MongoDB akan memecah "AWB-1234" jadi token "awb" dan "1234" yang mengubah relevance.

#### 4.4.6 API Gateway Aggregation

```
┌──────────────────────────────────────────────────────────────┐
│  API Gateway :: GET /api/search                               │
│                                                              │
│  async search(req) {                                         │
│    const [convResult, ticketResult] = await Promise.allSettled([│
│      conversationClient.SearchGlobal(req),                   │
│      ticketClient.SearchGlobal(req)                          │
│    ]);                                                       │
│                                                              │
│    return {                                                  │
│      conversations: convResult.status === 'fulfilled'        │
│        ? convResult.value.results                            │
│        : { error: true, results: [] },                       │
│      tickets: ticketResult.status === 'fulfilled'            │
│        ? ticketResult.value.results                          │
│        : { error: true, results: [] },                       │
│      meta: {                                                 │
│        conversationTotal, conversationHasMore,               │
│        ticketTotal, ticketHasMore,                           │
│        conversationError,   // null jika sukses               │
│        ticketError          // null jika sukses               │
│      }                                                       │
│    };                                                        │
│  }                                                           │
│                                                              │
│  ⚠️ Kedua gRPC call PARALEL via Promise.allSettled()         │
│  ⚠️ Satu gagal → yang lain tetap return hasil (partial)      │
│  ⚠️ Timeout: 5 detik per gRPC call                           │
└──────────────────────────────────────────────────────────────┘
```

#### 4.4.7 Performance Consideration

| Concern                                           | Strategy                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Dual query per service (conversations + messages) | Jalankan paralel di dalam service (`Promise.all`)                                                            |
| Message search window                             | Batasi ke 500 pesan terakhir per conversation via `$sort` + `$limit` sebelum `$lookup`                       |
| Text index write overhead                         | Benchmark insert latency; stagger index creation (identity fields first, message body later)                 |
| Relevance merging                                 | Query conversations & messages terpisah → deduplicate di application layer → merge matchFields               |
| "Muat lebih banyak"                               | Offset-based pagination; simpan cursor di session state; hindari `$skip` besar dengan range query pada `_id` |

### 4.5 UX Alternative: Popup/Drawer Global Search

> ⚠️ **Bagian ini mengisi gap UX di PRD.** PRD original mendefinisikan full dedicated page (`/search`). User feedback meminta alternatif: menu search di sidenav membuka **popup/drawer overlay** sehingga user tidak meninggalkan halaman yang sedang dikerjakan.

#### 4.5.1 Dua Varian: Command Palette vs Drawer

```
┌─────────────────────────────────────────────────────────────────┐
│            VARIAN A: Command Palette (Small)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Dashboard ──────────────────────────────────────────────┐   │
│  │  [sidebar]  │  Content Area                               │   │
│  │             │                                             │   │
│  │             │    ┌──────────────────────────┐             │   │
│  │             │    │ 🔍 Cari percakapan &     │             │   │
│  │   Cari ◄────│───►│    tiket...             │             │   │
│  │             │    │ ──────────────────────── │             │   │
│  │             │    │ Percakapan (3)           │             │   │
│  │             │    │ ├ John Doe — "...AWB..." │             │   │
│  │             │    │ ├ Jane Smith — "...ord.."│             │   │
│  │             │    │ └ Bob Lee — "...refund"  │             │   │
│  │             │    │ ──────────────────────── │             │   │
│  │             │    │ Tiket (2)                │             │   │
│  │             │    │ ├ TK-8149 — Refund req   │             │   │
│  │             │    │ └ TK-5023 — Invoice      │             │   │
│  │             │    │ ──────────────────────── │             │   │
│  │             │    │ Tekan Enter untuk lihat  │             │   │
│  │             │    │ semua hasil →            │             │   │
│  │             │    └──────────────────────────┘             │   │
│  │             │          ↑ overlay modal                    │   │
│  │             │          centered, width ~600px             │   │
│  │             │          max 5 results per section          │   │
│  └─────────────┴─────────────────────────────────────────────┘   │
│                                                                  │
│  ⚡ Kelebihan:                                                    │
│  • Ringan, fast — seperti Spotlight/Cmd+K                        │
│  • Tidak mengganggu workflow                                     │
│  • User tetap di halaman yang sama                               │
│  • Keyboard-native: ↑↓ pilih, Enter open, Esc close              │
│                                                                  │
│  ⚠️ Kekurangan:                                                   │
│  • Hasil terbatas — hanya 5 per section                          │
│  • Tidak bisa scroll dalam jumlah besar                          │
│  • "Muat lebih banyak" tidak praktis di popup kecil              │
│  • Snippet message terpotong                                     │
│  • Butuh fallback ke halaman penuh                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            VARIAN B: Drawer Panel (Large)  ◄── REKOMENDASI       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─ Dashboard ──────────────────────────────────────────────┐   │
│  │  Sidebar +   │  Content Area                              │   │
│  │  Drawer      │  (dimmed overlay)                           │   │
│  │              │                                             │   │
│  │ ┌──────────┐ │                                             │   │
│  │ │🔍 Cari   │ │                                             │   │
│  │ │perckpn & │ │                                             │   │
│  │ │tiket...  │ │                                             │   │
│  │ │─────────│ │                                             │   │
│  │ │Perckpn  │ │                                             │   │
│  │ │(47)     │ │                                             │   │
│  │ │┌───────┐│ │                                             │   │
│  │ ││👤 John ││ │                                             │   │
│  │ ││💬 "AWB││ │  ⚠️ Conversation Detail drawer              │   │
│  │ ││-1234" ││ │     TETAP di KANAN                          │   │
│  │ ││🕐10m🟢││ │                                             │   │
│  │ │├───────┤│ │  ┌──────────────────────────────┐           │   │
│  │ ││👤 Jane││ │  │ Conversation Detail          │           │   │
│  │ ││💬 "ord││ │  │ (drawer kanan existing)       │           │   │
│  │ ││er..." ││ │  │                              │           │   │
│  │ ││🕐1j🟡 ││ │  │ ✅ TIDAK tabrakan!            │           │   │
│  │ │├───────┤│ │  │ Search drawer kiri —          │           │   │
│  │ ││... scr││ │  │ Detail drawer kanan —         │           │   │
│  │ ││[Muat] ││ │  │ bisa coexist                  │           │   │
│  │ │└───────┘│ │  └──────────────────────────────┘           │   │
│  │ │─────────│ │                                             │   │
│  │ │Tiket(12)│ │                                             │   │
│  │ │┌───────┐│ │                                             │   │
│  │ ││#TK8149││ │                                             │   │
│  │ ││Refund ││ │                                             │   │
│  │ ││⏱2j15m ││ │                                             │   │
│  │ │└───────┘│ │                                             │   │
│  │ │... scrl │ │                                             │   │
│  │ │[Muat]   │ │                                             │   │
│  │ └──────────┘ │                                             │   │
│  │  ↑ drawer    │                                             │   │
│  │  slide KIRI, │                                             │   │
│  │  width 380px │                                             │   │
│  └──────────────┴─────────────────────────────────────────────┘   │
│                                                                  │
│  ⚡ Kelebihan:                                                    │
│  • ✅ TIDAK tabrakan dengan detail drawer (kanan)                 │
│  • ✅ TIDAK tabrakan dengan widget panel (kanan)                  │
│  • Hasil penuh — sama seperti full page                          │
│  • Scrollable + "Muat lebih banyak" berfungsi penuh              │
│  • Bisa coexist dengan Conversation Detail drawer di kanan        │
│  • Click-outside (ke area content kanan) atau Esc untuk dismiss  │
│  • Background dimmed → fokus di search                           │
│                                                                  │
│  ⚠️ Kekurangan:                                                   │
│  • Menggantikan sidebar saat terbuka (sidebar jadi drawer body)  │
│  • Lebih kompleks implementasi (drawer state, animation)          │
│  • Di mobile: drawer full-screen dari kiri                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.5.2 Rekomendasi: Drawer + Command Palette Hybrid

**Pattern: `Ctrl+K` → Command Palette (quick peek), Click "Cari" → Drawer (full search)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID APPROACH                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TRIGGER │ INTERACTION     │ RESULT                             │
│  ────────┼─────────────────┼───────────────────────────────────│
│  Ctrl+K  │ Keyboard cmd    │ Command Palette di tengah          │
│          │                 │ → 5 hasil per section              │
│          │                 │ → Enter = buka drawer / full page  │
│          │                 │ → Esc = dismiss                    │
│  ────────┼─────────────────┼───────────────────────────────────│
│  Click   │ Mouse click     │ Drawer dari kiri                   │
│  "Cari"  │ di sidenav      │ → 20 hasil per section             │
│          │                 │ → Scroll penuh                     │
│          │                 │ → "Muat lebih banyak"              │
│          │                 │ → Click result = navigasi          │
│          │                 │ → Click-outside / Esc / [×] = close│
│  ────────┼─────────────────┼───────────────────────────────────│
│  URL     │ Direct link      │ Tetap support halaman penuh       │
│  /search │ atau share       │ untuk deep linking & shareability │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Kenapa hybrid?**

- `Ctrl+K` untuk **quick peek** — agent yang sudah tahu apa yang dicari, cukup lihat 5 hasil, Enter → langsung ke entity. Pola ini mirip Spotlight di macOS atau Cmd+K di VS Code.
- Click sidenav untuk **deep search** — agent yang butuh eksplorasi hasil, scroll, baca snippet message, bandingkan beberapa card. Drawer memberi ruang cukup.
- Tetap ada `/search` full page untuk **shareability & deep linking** — kalau agent dapat shared link `?q=refund`, buka halaman penuh lebih nyaman. Juga jadi fallback kalau agent ingin full-screen focus.

#### 4.5.3 Dampak ke Functional Requirements PRD

| FR ID  | Original (Full Page)            | Revised (Drawer)                                                  | Status                     |
| ------ | ------------------------------- | ----------------------------------------------------------------- | -------------------------- |
| FR-001 | Route `/[locale]/(main)/search` | Tetap ada sebagai fallback + deep link target                     | **KEPT** — drawer optional |
| FR-002 | Sidebar nav item "Cari"         | Sidebar nav item → **buka drawer**, bukan navigasi halaman        | **REVISED**                |
| FR-003 | `Ctrl+K` shortcut               | `Ctrl+K` → **buka command palette** (quick peek)                  | **REVISED**                |
| FR-008 | URL `?q=` param                 | Tetap: command palette & drawer baca `?q=` jika ada di URL        | **KEPT**                   |
| FR-017 | Unified pagination              | Sama: scrollable di dalam drawer; "Muat lebih banyak" per section | **KEPT**                   |
| FR-025 | Click → Room                    | Click → navigasi ke Conversation Room, **drawer auto-close**      | **REVISED**                |
| FR-026 | Click → Ticket Detail           | Click → navigasi ke Ticket Detail, **drawer auto-close**          | **REVISED**                |
| FR-027 | Session persistence             | State disimpan di Zustand store; kembali buka drawer → restore    | **REVISED**                |
| FR-041 | Loading skeleton                | Sama: skeleton cards di dalam drawer / popup                      | **KEPT**                   |
| FR-043 | Empty state                     | Sama: empty state di dalam drawer / popup                         | **KEPT**                   |
| FR-045 | Error state + retry             | Sama: error dengan retry di dalam drawer / popup                  | **KEPT**                   |
| FR-046 | Partial error                   | Sama: inline error per section di dalam drawer / popup            | **KEPT**                   |
| US-010 | Keyboard shortcut               | Ctrl+K → command palette; Esc → close; ↑↓→ pilih; Enter → open    | **EXTENDED**               |

#### 4.5.4 Popup/Drawer-Specific Edge Cases

| ID         | Scenario                                                            | Expected Behavior                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EC-POP-001 | User scroll halaman di belakang popup                               | **Background scroll harus di-lock** (`overflow: hidden` di body) saat drawer/popup terbuka                                                                                                          |
| EC-POP-002 | User klik di luar drawer area                                       | Drawer **dismiss** (close). Jangan dismiss kalau klik adalah text selection                                                                                                                         |
| EC-POP-003 | User resize browser saat drawer terbuka                             | Drawer width responsif: 480px desktop → full-width mobile. Command palette tetap centered max-width 600px                                                                                           |
| EC-POP-004 | Mobile: drawer terbuka                                              | Full-screen drawer (width 100vw). Tidak ada background terlihat. Swipe right atau tombol [×] untuk close                                                                                            |
| EC-POP-005 | User buka drawer, pilih result, drawer close, lalu buka drawer lagi | **State restore**: keyword + hasil terakhir dari Zustand store. Jangan re-search kecuali user mengetik lagi                                                                                         |
| EC-POP-006 | User buka drawer saat ticket detail drawer sudah terbuka di kanan   | **Coexist.** Search drawer dari kiri, detail drawer dari kanan — dua-duanya bisa terbuka bersamaan. Tidak perlu tutup salah satu. Di mobile: hanya satu drawer bisa aktif (search full-screen kiri) |
| EC-POP-007 | User mengetik di command palette, tekan Enter tanpa memilih item    | **"Tekan Enter untuk lihat semua hasil"** — buka drawer dengan keyword yang sama                                                                                                                    |
| EC-POP-008 | User share link `/search?q=refund` ke agent lain                    | Buka full page `/search` (bukan drawer) karena deep link lebih baik full-screen                                                                                                                     |

#### 4.5.5 Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT TREE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MainLayout                                                     │
│  ├── Sidebar (tetap visible di belakang drawer)                 │
│  │   └── NavItem "Cari"  ← onClick → buka SearchDrawer         │
│  │                                                              │
│  ├── SearchCommandPalette    ← Ctrl+K trigger                   │
│  │   ├── SearchInput (auto-focused)                             │
│  │   ├── SearchResults (5 per section, compact card)            │
│  │   ├── SearchFooter ("Enter untuk lihat semua →")             │
│  │   └── KeyboardHandler (↑↓ Enter Esc)                         │
│  │                                                              │
│  ├── SearchDrawer             ← Sidebar click / Enter di palette│
│  │   │  (slide dari KIRI, width ~380px, di atas sidebar)       │
│  │   │  ✅ Coexist dengan ConversationDetailDrawer (KANAN)      │
│  │   ├── DrawerHeader                                         │
│  │   │   ├── SearchInput (pre-filled jika dari palette)        │
│  │   │   ├── CloseButton [×]                                  │
│  │   │   └── Back-to-menu button (opsional)                   │
│  │   ├── DrawerBody (scrollable)                               │
│  │   │   ├── ConversationSection                               │
│  │   │   │   ├── SectionHeader ("Percakapan (N)")              │
│  │   │   │   ├── ConversationCard[]  ← highlight matchFields  │
│  │   │   │   └── LoadMoreButton                                │
│  │   │   ├── SectionDivider                                    │
│  │   │   └── TicketSection                                     │
│  │   │       ├── SectionHeader ("Tiket (M)")                   │
│  │   │       ├── TicketCard[]  ← highlight matchFields         │
│  │   │       └── LoadMoreButton                                │
│  │   └── KeyboardHandler (Esc close, ↑↓ navigate)              │
│  │                                                              │
│  ├── ConversationDetailDrawer  ← EXISTING, di KANAN, tetap      │
│  │                                                              │
│  └── /search page (full page, tetap ada)                       │
│      └── SearchPageContent (sama persis komponennya,           │
│           hanya beda layout wrapper)                            │
│                                                                  │
│  ⚠️ CATATAN LAYOUT:                                             │
│  Search drawer (kiri) + Content area (tengah) +                 │
│  Conversation Detail drawer (kanan) — TIGA panel bisa           │
│  aktif bersamaan. Mobile: hanya satu panel dominan.             │
│                                                                  │
│  ⚠️ CARA SHARING KOMPONEN:                                      │
│  SearchResults, ConversationCard, TicketCard, SearchInput       │
│  adalah komponen yang SAMA dipakai di:                          │
│  - Command Palette                                              │
│  - Drawer (kiri)                                                │
│  - Full Page                                                    │
│  Hanya layout wrapper yang berbeda.                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.5.6 State Management (Zustand)

```typescript
// stores/search.store.ts
interface SearchStore {
  // State
  isCommandPaletteOpen: boolean;
  isDrawerOpen: boolean;
  keyword: string;
  conversationResults: ConversationSearchResult[];
  ticketResults: TicketSearchResult[];
  conversationTotal: number;
  ticketTotal: number;
  conversationOffset: number;
  ticketOffset: number;
  isLoading: boolean;
  conversationError: string | null;
  ticketError: string | null;

  // Actions
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openDrawer: (keyword?: string) => void;
  closeDrawer: () => void;
  setKeyword: (keyword: string) => void;
  search: () => Promise<void>;
  loadMore: (domain: "conversation" | "ticket") => Promise<void>;
  navigateToResult: (result: SearchResult) => void; // close + navigate
  reset: () => void;
}
```

#### 4.5.7 Transition Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSITION DIAGRAM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [Agent di halaman manapun]                                     │
│         │                                                        │
│         ├── Ctrl+K                                               │
│         │     │                                                  │
│         │     ▼                                                  │
│         │   Command Palette OPEN                                 │
│         │     │  (background dimmed)                             │
│         │     │  auto-focus input                                │
│         │     │                                                  │
│         │     ├── Mulai mengetik → debounce → search             │
│         │     │  → tampil 5 hasil per section                    │
│         │     │                                                  │
│         │     ├── ↑↓ pilih result → Enter                       │
│         │     │  → Close palette → navigasi ke entity            │
│         │     │                                                  │
│         │     ├── Enter (tanpa pilih)                            │
│         │     │  → Close palette → buka DRAWER                   │
│         │     │  (keyword carry-over)                            │
│         │     │                                                  │
│         │     └── Esc / click-outside → CLOSE                    │
│         │                                                        │
│         ├── Click "Cari" di sidenav                              │
│         │     │                                                  │
│         │     ▼                                                  │
│         │   Drawer OPEN (slide from KIRI)                        │
│         │     │  (background dimmed, scroll locked)              │
│         │     │  auto-focus input                                │
│         │     │  restore last keyword + results dari store       │
│         │     │  sidebar menu tetap accessible di drawer header  │
│         │     │                                                  │
│         │     ├── Mengetik → debounce → search full              │
│         │     │  → 20 hasil per section                          │
│         │     │  → scrollable + "Muat lebih banyak"              │
│         │     │                                                  │
│         │     ├── Click result → close drawer → navigasi         │
│         │     ├── Esc / [×] / click-outside (area kanan) → CLOSE │
│         │     │  (keyword + hasil tetap di Zustand)              │
│         │     ├── Coexist dengan Conversation Detail drawer      │
│         │     │  (search kiri + detail kanan — 2 drawer aktif)   │
│         │     └── Resize ke mobile → drawer full-screen dari kiri│
│         │                                                        │
│         └── Shared link `/search?q=refund`                       │
│               │                                                  │
│               ▼                                                  │
│             Full page (bukan drawer)                             │
│               Layout sama, hanya full-width                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.5.8 Trade-off Matrix: Full Page vs Popup vs Drawer

| Dimension                        | Full Page (Original PRD)              | Command Palette                   | Drawer (Rekomendasi)                        |
| -------------------------------- | ------------------------------------- | --------------------------------- | ------------------------------------------- |
| **Kecepatan akses**              | ⭐⭐ Perlu navigasi halaman           | ⭐⭐⭐ Instant (Ctrl+K)           | ⭐⭐ Click sidenav                          |
| **Kapasitas hasil**              | ⭐⭐⭐ 20/section + Muat lebih banyak | ⭐ 5/section, terbatas            | ⭐⭐⭐ 20/section + Muat lebih banyak       |
| **Tidak ganggu workflow**        | ⭐ Meninggalkan halaman               | ⭐⭐⭐ Overlay ringan             | ⭐⭐⭐ Overlay, background tetap terlihat   |
| **State persistence**            | ⭐⭐⭐ URL query param                | ⭐ Zustand (hilang kalau refresh) | ⭐⭐ Zustand (hilang kalau refresh)         |
| **Shareability**                 | ⭐⭐⭐ URL bisa dishare               | ❌ Tidak bisa                     | ❌ Tidak bisa (fallback ke full page)       |
| **Keyboard navigasi**            | ⭐⭐ Tab-based                        | ⭐⭐⭐ Arrow + Enter native       | ⭐⭐ Arrow + Enter                          |
| **Mobile UX**                    | ⭐⭐ Full page                        | ⭐⭐ Centered modal               | ⭐⭐⭐ Full-screen drawer                   |
| **Implementasi kompleksitas**    | ⭐⭐⭐ Sederhana                      | ⭐⭐ Sedang                       | ⭐ Kompleks (animation, scroll lock, state) |
| **Kompetisi dengan drawer lain** | ✅ Tidak                              | ✅ Tidak                          | ✅ Coexist — search KIRI, detail KANAN      |

#### 4.5.9 Rekomendasi Final

| Keputusan    | Detail                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Primer**   | Drawer dari **KIRI** — click "Cari" di sidenav. Coexist dengan Conversation Detail drawer (kanan) + Widget panel (kanan)        |
| **Sekunder** | Command Palette — `Ctrl+K` quick peek di tengah                                                                                 |
| **Fallback** | Full page `/search` — deep link & share                                                                                         |
| **Komponen** | Shared: SearchInput, ConversationCard, TicketCard, SectionHeader, LoadMoreButton dipakai di ketiga mode                         |
| **State**    | Zustand `search.store.ts` — persistent antar buka drawer                                                                        |
| **Mobile**   | Drawer → full-screen dari kiri; Command palette → centered modal max-width                                                      |
| **Conflict** | ✅ **Tidak ada.** Search drawer di kiri, Conversation Detail drawer di kanan, Widget panel di kanan — tiga-tiganya bisa coexist |

> ⚠️ **PRD perlu direvisi:** FR-001, FR-002, FR-003, FR-025–FR-027 perlu diperbarui untuk merefleksikan drawer-based UX. Rekomendasi: tambahkan sub-section "UX Mode" yang mendefinisikan ketiga mode (Drawer, Command Palette, Full Page) + prioritasnya.

---

## 5. Impact Analysis

| Dimension                   | What Changes                                                                                   | What Is Affected                                              | Impact Level | Mitigation / Notes                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Module**                  | 2 microservices baru terlibat: conversation-service + ticket-service; API Gateway routing baru | conversation-service, ticket-service, api-gateway             | **MEDIUM**   | gRPC endpoint baru tidak mengubah existing flow; isolated addition                                                  |
| **Database**                | MongoDB text index baru pada `conversations` dan `tickets` collections                         | Write performance insert/update; storage overhead             | **MEDIUM**   | Benchmark insert latency sebelum dan sesudah index; rollout index incremental; monitor write throughput             |
| **API**                     | `GET /api/search` endpoint baru; 2 gRPC `SearchGlobal` RPC baru                                | API Gateway, conversation-service proto, ticket-service proto | **MEDIUM**   | Define proto contract early; backward compatible (endpoint baru, tidak mengubah existing)                           |
| **UI/UX**                   | Halaman search baru (`/search`); sidebar nav item "Cari"; conversation + ticket result cards   | Main layout sidebar; routing; component tree                  | **MEDIUM**   | Halaman baru isolated; tidak mengubah existing conversation/ticket pages                                            |
| **Security / RBAC**         | Search results harus RBAC-scoped per aturan Chat List + Ticket List                            | conversation-service, ticket-service, auth middleware         | **HIGH**     | Gunakan RBAC middleware yang sama dengan Chat List dan Ticket List; server-side enforcement; JANGAN hanya UI hiding |
| **Performance**             | Dual gRPC calls paralel + MongoDB text index queries                                           | P95 latency target 1.5s; API Gateway capacity                 | **HIGH**     | Parallel gRPC calls dari API Gateway; text index untuk fast lookup; benchmark dengan 100K/50K data                  |
| **Integration**             | Tidak ada integrasi eksternal baru; internal gRPC only                                         | conversation-service ↔ ticket-service via API Gateway         | **LOW**      | API Gateway sebagai orchestrator; kedua service independen                                                          |
| **Reporting / Analytics**   | Search logs wajib anonymized (query hash, bukan full keyword PII)                              | Audit trail; analytics pipeline                               | **LOW**      | Log hanya query_hash + result count; privacy-compliant                                                              |
| **Financial / Operational** | Tidak ada dampak finansial langsung                                                            | N/A                                                           | **LOW**      | Operational: agent efficiency improvement                                                                           |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module                     | Depends On                               | Dependency Type | Direction                      | Notes                                                         |
| ------------------------------------ | ---------------------------------------- | --------------- | ------------------------------ | ------------------------------------------------------------- |
| Global Search FE                     | conversation-service `SearchGlobal` gRPC | API sync        | FE → conversation-service      | **BLOCKER** — tanpa ini, Conversation section tidak berfungsi |
| Global Search FE                     | ticket-service `SearchGlobal` gRPC       | API sync        | FE → ticket-service            | **BLOCKER** — tanpa ini, Ticket section tidak berfungsi       |
| Global Search FE                     | API Gateway `GET /api/search`            | API sync        | FE → API Gateway               | API Gateway orchestrates parallel gRPC calls                  |
| Conversation `SearchGlobal`          | MongoDB text index on `conversations`    | DB index        | conversation-service → MongoDB | Harus dibuat sebelum launch                                   |
| Ticket `SearchGlobal`                | MongoDB text index on `tickets`          | DB index        | ticket-service → MongoDB       | Harus dibuat sebelum launch                                   |
| Global Search (custom attributes)    | Custom Attributes BE data model          | Data dependency | conversation-service → BE      | Asumsi A1 — harus dikonfirmasi                                |
| Global Search (ticket custom fields) | Ticket custom fields data model          | Data dependency | ticket-service → BE            | Sudah ada di ticket type settings                             |
| Global Search FE                     | RBAC middleware (Chat List scope)        | Auth dependency | FE → people-service            | Gunakan aturan yang sama dengan Chat List                     |
| Global Search FE                     | RBAC middleware (Ticket View scope)      | Auth dependency | FE → people-service            | Gunakan aturan yang sama dengan Ticket List                   |

### 6.2 Shared Resources / Event Mapping

- **Tidak ada shared resource baru.** Search adalah operasi read-only yang tidak mengubah state.
- **Tidak ada event/RabbitMQ baru.** Search adalah sync gRPC, bukan async operation.
- **Tidak ada perubahan pada existing queue, cron, atau scheduler.**

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario                                                                    | Likelihood | Severity | Level      | Mitigation                                                                                                                                                   |
| ------- | --------------------------------------------------------------------------- | ---------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R-01    | MongoDB text index memperlambat insert/update message                       | Medium     | High     | **HIGH**   | Benchmark sebelum deploy; buat index paralel di staging dengan production-equivalent data; rollback index jika throughput turun >10%                         |
| R-02    | `SearchGlobal` gRPC timeout (>5s) dengan dataset besar                      | Medium     | High     | **HIGH**   | Batasi message search window ke N pesan (default 500); text index untuk fast lookup; timeout 5s per domain; partial result jika timeout                      |
| R-03    | RBAC scope inkonsistensi: hasil search menampilkan data di luar scope agent | Low        | Critical | **HIGH**   | Gunakan RBAC middleware yang sama persis dengan Chat List dan Ticket List; unit test + integration test untuk setiap role; server-side enforcement           |
| R-04    | Custom attributes belum deployed → search scope berkurang                   | Medium     | Medium   | **MEDIUM** | Fallback: search di available fields saja; info ke user bahwa custom attributes belum searchable; launch tanpa custom attributes jika perlu, tambahkan nanti |
| R-05    | Conversation service down → Ticket service masih up → partial result        | Low        | Medium   | **MEDIUM** | NFR reliability sudah mendefinisikan partial success; inline error di domain yang gagal; retry button per domain                                             |
| R-06    | Concurrent "Muat lebih banyak" + update data → duplicate results            | Medium     | Low      | **LOW**    | Client-side deduplication by ID (EC-008 sudah mendefinisikan); idempotent query                                                                              |
| R-07    | Search result menampilkan conversation/ticket yang di-close concurrent      | Low        | Low      | **LOW**    | Show current status (EC-009); tidak perlu real-time update pada search page                                                                                  |
| R-08    | Rapid keyword changes → race condition in-flight requests                   | Medium     | Low      | **LOW**    | AbortController / cancel in-flight request before firing new one (EC-007)                                                                                    |

### 7.2 Worst-Case Scenarios

1. **Text index crash production:** MongoDB write throughput drop drastis → inbound message processing lambat → SLA breach massal. **Mitigasi:** Benchmark di staging; rollout text index dengan feature toggle di jam sepi; rollback plan dengan drop index.
2. **RBAC scope leak:** Agent melihat conversation/ticket di luar team scope → compliance/regulatory issue. **Mitigasi:** Server-side enforcement sebagai primary gate; integration test untuk setiap kombinasi role × scope.
3. **Kedua service timeout:** Search tidak mengembalikan hasil sama sekali → user frustration. **Mitigasi:** Partial result; error state dengan retry; pastikan timeout 5s.

---

## 8. Test Strategy

### 8.1 Functional Scope

**Positive Scenarios:**

- Search keyword cocok di kedua domain → dua section muncul
- Search keyword cocok hanya di Conversation → hanya section Percakapan muncul, Tiket hidden
- Search keyword cocok hanya di Ticket → hanya section Tiket muncul, Percakapan hidden
- Exact Ticket ID match → rank #1 di section Tiket
- Prefix match → rank di atas partial match
- Search by customer name, phone, alias, conversation ID
- Search by ticket title, client name, description
- Search by tags (conversation + ticket)
- Search by custom attribute value (single + collections)
- Search by custom field value (text, dropdown, date)
- Search by message content (conversation + ticket)
- Click Conversation result → navigasi ke Conversation Room
- Click Ticket result → navigasi ke Ticket Detail
- RBAC scope: Agent hanya lihat assigned/team queue; Supervisor team scope; Admin all
- Keyword di URL `?q=` → auto-search on page load
- Session persistence: kembali ke search page → keyword + hasil tetap ada

**Negative Scenarios:**

- Keyword < 2 karakter → search tidak difire
- Keyword > 200 karakter → terpotong ke 200
- Keyword dengan special characters → di-escape
- Keyword dengan leading/trailing spaces → di-trim
- Tidak ada hasil di kedua domain → unified empty state
- Tidak ada hasil di satu domain → section hidden, domain lain tetap tampil
- Permission denied (session expired) → redirect login

**Edge Cases:**

- EC-001: Match di kedua domain
- EC-002: Exact match di luar message search window
- EC-003: Special characters
- EC-004: Leading/trailing spaces
- EC-005: Custom field empty values
- EC-006: Conversation tanpa messages
- EC-007: Rapid keyword changes
- EC-008: Duplicate results dari "Muat lebih banyak"
- EC-009: Concurrent close oleh agent lain
- EC-010: URL `?q=` param
- EC-011: Custom attribute field definition deleted
- EC-012: Partial Ticket ID tanpa prefix "TK-"

### 8.2 Regression Scope

- **Chat List search** — pastikan tidak terpengaruh oleh penambahan global search
- **Ticket List search** — pastikan tidak terpengaruh
- **Conversation Room** — navigasi dari global search ke room
- **Ticket Detail** — navigasi dari global search ke detail
- **Sidebar navigation** — penambahan item "Cari" tidak merusak layout existing
- **RBAC scope Chat List + Ticket List** — pastikan global search menggunakan aturan yang sama
- **Socket.IO events** — pastikan navigasi dari search tidak menyebabkan socket disconnect/reconnect issues

### 8.3 Integration Scope

- API Gateway → conversation-service `SearchGlobal` gRPC contract test
- API Gateway → ticket-service `SearchGlobal` gRPC contract test
- API Gateway → parallel gRPC calls + aggregation
- MongoDB text index query performance test
- RBAC middleware: search endpoint returns scoped results
- FE → API Gateway integration (Axios, auth token, response envelope)

### 8.4 UAT / Business Validation

- **Agent mencari customer by name** → hasil muncul di kedua domain → agent klik conversation → masuk room
- **Agent mencari by AWB/order ID** → conversation dengan custom attribute AWB muncul
- **Agent mencari ticket ID exact** → ticket muncul rank #1 → agent klik → masuk detail
- **Agent salah ketik domain** → Global Search tidak perlu tebak domain → hasil tetap muncul
- **Supervisor mencari lintas team** → hanya lihat team scope sendiri

### 8.5 Automation Candidates

| Scenario                                                       | Priority | Automation Readiness                  |
| -------------------------------------------------------------- | -------- | ------------------------------------- |
| Search dengan keyword valid → kedua domain return results      | P0       | Automated Ready                       |
| Search dengan keyword valid → hanya Conversation results       | P0       | Automated Ready                       |
| Search dengan keyword valid → hanya Ticket results             | P0       | Automated Ready                       |
| Search dengan empty results → unified empty state              | P0       | Automated Ready                       |
| RBAC: Agent scope → hanya lihat conversation/ticket dalam team | P0       | Automated Ready                       |
| RBAC: Admin scope → lihat semua                                | P0       | Automated Ready                       |
| Exact Ticket ID match → rank #1                                | P0       | Automated Ready                       |
| Click result → navigate to correct detail page                 | P1       | Automated Ready                       |
| URL `?q=` param → auto-search on load                          | P1       | Automated Ready                       |
| Partial success (satu domain gagal) → partial result + retry   | P1       | Needs mock/stub for failure injection |
| Rapid keyword changes → cancel in-flight request               | P2       | Automated Ready                       |
| "Muat lebih banyak" → append results                           | P1       | Automated Ready                       |

---

## 9. Production Safety

- **Rollback Strategy:**
  - FE: Hapus route `/search` dari sidebar nav; sembunyikan halaman. Tidak ada data mutation.
  - BE: Drop text index jika menyebabkan write throughput degradation; nonaktifkan `SearchGlobal` endpoint di API Gateway.
  - Rollback bersih — tidak ada data migration atau schema change.

- **Feature Toggle Requirement:**
  - **Direkomendasikan:** Feature flag `GLOBAL_SEARCH_ENABLED` untuk enable/disable halaman search via config.
  - Sidebar nav item "Cari" hanya muncul jika flag enabled.
  - Jika flag disabled, route `/search` redirect ke default page.
  - Memungkinkan canary rollout dan rollback instan.

- **Backward Compatibility Notes:**
  - Tidak ada breaking change. Semua endpoint existing tidak terpengaruh.
  - Chat List search dan Ticket List search tetap berfungsi normal.
  - Navigation existing tidak berubah.

- **Staged Rollout Recommendation:**
  1. **Phase 1 — Staging:** Deploy BE (gRPC + text index) → benchmark → QA test lengkap
  2. **Phase 2 — Production Canary:** Feature flag ON untuk 10% agent → monitor latency + error rate + empty result rate
  3. **Phase 3 — Production Full:** Feature flag ON untuk 100% → monitor selama 1 minggu
  4. Rollback gate: Jika p95 latency > 2s atau error rate > 1% → matikan feature flag

- **Monitoring / Alerting Needs:**
  - `search_request_count` — traffic ke `/api/search`
  - `search_latency_p50/p95/p99` — latency per domain dan combined
  - `search_empty_result_rate` — empty result percentage (target under 15%)
  - `search_partial_failure_rate` — one domain fails (target under 1%)
  - `search_error_rate` — complete failure rate
  - `search_conversation_count` / `search_ticket_count` — result count distribution
  - Alert: P95 latency > 2s → warning; P95 latency > 5s → critical
  - Alert: Error rate > 5% → critical

- **Logging / Audit Gaps:**
  - Log `trace_id`, `company_id`, `user_id`, `query_hash` (bukan full keyword), `conversation_result_count`, `ticket_result_count`, `latency_ms`, `partial_failure` flag
  - JANGAN log full keyword karena mengandung PII (customer name, phone)
  - Privacy compliance: query hash SHA-256 untuk deduplication analytics

---

## 10. Open Questions

| OQ ID          | Question                                                                                                          | Why It Matters                                                                                                             | Blocking?                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| OQ-01 (PRD Q1) | Should the search page have an "Advanced" toggle for filters (channel, status, date range) in Phase 1 or Phase 2? | Memengaruhi scope development. Jika Phase 1, perlu desain + implementasi filter panel.                                     | **Yes** — scope decision                       |
| OQ-02 (PRD Q2) | What is the exact message search window value (number of recent messages per conversation)? 500?                  | Engineering decision — memengaruhi index strategy dan performance.                                                         | No — use 500 as default, configurable          |
| OQ-03 (PRD Q3) | Should "Muat lebih banyak" load for both domains simultaneously or independently per domain?                      | UX decision — memengaruhi scroll behavior dan user expectation.                                                            | No — rekomendasi: independen per domain        |
| OQ-04 (PRD Q4) | Should search results include a "Linked ticket" or "Linked conversation" cross-reference when available?          | UX enhancement — tetapi Linked Conversations/Tickets belum diimplementasi.                                                 | No — out of scope Phase 1                      |
| OQ-05 (PRD Q5) | Should the search input support quoted exact phrases (e.g., `"refund request"`)?                                  | Engineering decision — text search dengan frasa butuh query parser beda.                                                   | No — nice to have, bukan blocker               |
| OQ-06          | Apakah message content search harus mencakup internal notes (ticket internal notes, conversation notes)?          | PRD hanya menyebut "message bodies" — internal notes mungkin valuable untuk supervisor.                                    | No — bisa added post-MVP                       |
| OQ-07          | Apakah search harus mendukung pencarian berdasarkan conversation number (`CONV-20260614-001`)?                    | PRD menyebut Conversation ID tapi tidak eksplisit soal conversation number. API contract punya field `conversationNumber`. | No — tambahkan ke scope search identity fields |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

PRD Global Search v1.0 adalah salah satu PRD paling matang di SatuInbox saat ini:

- 10 user stories dengan acceptance criteria Given-When-Then yang jelas
- 46 functional requirements dengan prioritas P0/P1
- 8 error handler + 12 edge cases + 9 NFR categories
- In Scope / Out of Scope tegas
- API contract + gRPC contract sudah di-outline

Feature ini tidak mengubah existing flow apapun — seluruhnya adalah **greenfield** (halaman baru, endpoint baru, gRPC baru). Risiko regression minimal.

Risiko utama adalah **belum adanya gRPC `SearchGlobal` di kedua service** dan **MongoDB text index performance**. Keduanya harus di-resolve sebelum development FE dimulai.

### 11.2 Operational Recommendation

| Item                            | Value                                                                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Final Decision Enum**         | `PROCEED_WITH_CAUTION`                                                                                                                                                                    |
| **Owner for Follow-up**         | PM (Dany Christian) + Engineering Lead (Naftal Yunior)                                                                                                                                    |
| **Required Revisions**          | Tidak ada revisi PRD diperlukan. PRD sudah sangat matang.                                                                                                                                 |
| **Suggested Delivery Strategy** | Phase 1: Full scope (10 US) dengan feature toggle. Jika satu service belum siap, bisa partial launch (Conversation-only atau Ticket-only).                                                |
| **Earliest Safe Next Step**     | 1. Define proto contract di `conversation.proto` dan `ticket.proto` (Engineering) 2. Resolve OQ-01 — filter panel scope decision (PM) 3. Konfirmasi status Custom Attributes BE (PM + BE) |

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement                                     | Finding                                        | Impact Area        | Test Case      | Status  |
| ------ | ----------------------------------------------- | ---------------------------------------------- | ------------------ | -------------- | ------- |
| FR-001 | Route `/search`                                 | Halaman baru, tidak mengubah existing route    | UI/UX              | TC-GS-001      | Pending |
| FR-006 | Search activation ≥2 chars                      | Validation frontend                            | UI/UX              | TC-GS-002      | Pending |
| FR-010 | Search both domains                             | Dual gRPC calls paralel                        | API, Backend       | TC-GS-003      | Pending |
| FR-011 | Conversation search scope (11 fields)           | Message content search window 500              | Backend, DB        | TC-GS-004      | Pending |
| FR-012 | Ticket search scope (7 fields)                  | Reply message bodies included                  | Backend, DB        | TC-GS-005      | Pending |
| FR-013 | Result grouping: Percakapan first, Tiket second | Section ordering deterministic                 | UI/UX              | TC-GS-006      | Pending |
| FR-017 | Unified pagination                              | Single scroll, independent "Muat lebih banyak" | UI/UX              | TC-GS-007      | Pending |
| FR-020 | Conversation result card fields                 | 6 fields + SLA indicator + assignment          | UI/UX              | TC-GS-008      | Pending |
| FR-023 | Ticket result card fields                       | 7 fields + SLA countdown                       | UI/UX              | TC-GS-009      | Pending |
| FR-025 | Click Conversation → Room                       | Navigation with session persistence            | UI/UX, Integration | TC-GS-010      | Pending |
| FR-028 | Exact Ticket ID rank first                      | Relevance ranking algorithm                    | Backend            | TC-GS-011      | Pending |
| FR-035 | Conversation RBAC scope                         | Server-side enforcement                        | Security, Backend  | TC-GS-012      | Pending |
| FR-039 | Ticket RBAC scope (`TicketViewEnum`)            | Server-side enforcement                        | Security, Backend  | TC-GS-013      | Pending |
| FR-041 | Loading state with skeleton                     | Skeleton cards (3 per section)                 | UI/UX              | TC-GS-014      | Pending |
| FR-043 | Unified empty state                             | "Tidak ada hasil untuk pencarian ini."         | UI/UX              | TC-GS-015      | Pending |
| FR-045 | Full error state + retry                        | "Gagal memuat hasil pencarian. Coba lagi."     | UI/UX              | TC-GS-016      | Pending |
| FR-046 | Partial error + inline retry                    | Per-domain retry                               | UI/UX              | TC-GS-017      | Pending |
| NFR-01 | P95 latency < 1.5s                              | Benchmark dengan 100K/50K data                 | Performance        | TC-GS-PERF-001 | Pending |
| NFR-02 | Server-side result enforcement                  | RBAC middleware reuse                          | Security           | TC-GS-SEC-001  | Pending |
| NFR-03 | Search log privacy (query hash only)            | No PII in logs                                 | Security           | TC-GS-SEC-002  | Pending |

---

## 13. Change Log

| Date       | Change                                                                  | Author      |
| ---------- | ----------------------------------------------------------------------- | ----------- |
| 2026-06-15 | Initial assessment created — Global Search v1.0 PRD analysis            | QA Analysis |
| 2026-06-15 | PM updated to Dany Christian; Engineering Lead updated to Naftal Yunior | QA Analysis |
