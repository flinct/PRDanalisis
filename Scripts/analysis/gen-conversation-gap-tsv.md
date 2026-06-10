# Analisis: gen_conversation_gap_tsv.py

## Isi File

Script Python yang generate **49 test case baru** (`SIX-Convo-Gap-01` s.d. `Gap-49`) untuk nge-cover **gap/kesenjangan fitur PRD** yang belum punya test case.

Output: `Test/conversation/Conversation_gap_supplement.tsv`

6 area fitur yang di-cover:

| Area | Jumlah TC Gap | Contoh |
|------|--------------|--------|
| **Chat List** (filters, sorting, persistence, bulk, indicators) | 12 | All Conversation tab, SLA colors, Presence, Hold, Bulk assign |
| **Conversation Room** (bubbles, typing, status, attachments, actions) | 12 | Private note, message status, Ctrl+V, drag-drop, quick reply |
| **Inbox Navigation** (CRUD teams, handover, search, shortcuts, retry) | 11 | Create Team, Rename, Delete, Drag-drop chat, Keyboard shortcuts |
| **Agent Pull Queue** (Get Conversation) | 7 | FIFO, batch size, conflict toast, max active, empty queue |
| **Group Chat** (handling) | 7 | Metadata, Send-as identity, multi-number, resolved sessions |

## Harus Di-Input ke Conversation.tsv?

### ✅ Perlu — TAPI hanya ~13 TC yang benar-benar baru

Dari 49 TC Gap, setelah di-cek ke `Conversation.tsv`:

| Status | Jumlah | Detail |
|--------|--------|--------|
| **✅ SUDAH ADA di Conversation.tsv** | **36 TC** | TC 664-712 di Conversation.tsv udah cover ini |
| **❌ BELUM ADA (baru)** | **13 TC** | Belum ada satupun di Conversation.tsv |

### 13 Test Case yang BENAR-BENAR BARU:

| ID Gap | Fitur | Status di Conversation.tsv |
|--------|-------|--------------------------|
| Gap-17 | Message status: sent → delivered → read | ❌ Belum ada |
| Gap-19 | Ctrl+V paste image | ❌ Belum ada |
| Gap-25 | Unread badge update real-time | ❌ Belum ada |
| Gap-27 | Tab switch completes in <1s | ❌ Belum ada |
| Gap-33 | Quick search sidebar filter | ❌ Belum ada |
| Gap-35 | Failure retry on load error | ❌ Belum ada |
| Gap-36 | Get Conversation FIFO | ❌ Belum ada |
| Gap-39 | Max active conversations warning | ❌ Belum ada |
| Gap-41 | Invalid batch resets | ❌ Belum ada |
| Gap-42 | Failed fetch retry | ❌ Belum ada |
| Gap-45 | Switch Send-as identity | ❌ Belum ada |
| Gap-46 | Quoted reply preview + deeplink | ❌ Belum ada |
| Gap-48 | Resolved chat → new session | ❌ Belum ada |

### 36 TC Gap yang SUDAH ADA di Conversation.tsv (jangan di-duplikat):

Semua dari area:
- Chat List (Gap-01 s.d. 12) → TC 664-675
- Conversation Room (Gap-13-16, 18, 20-24) → TC 676-687
- Inbox Navigation (Gap-25-26, 28-32, 34) → TC 688-698
- Agent Pull Queue (Gap-37-38, 40) → TC 699-705
- Group Chat (Gap-43-44, 47, 49) → TC 706-712

## Rekomendasi

**JANGAN merge semua 49 Gap ke Conversation.tsv** — 36 di antaranya duplikat.

Saran:
1. **13 TC baru** → tambahkan sebagai `SIX-Convo-713` s.d. `SIX-Convo-725` di **akhir** `Conversation.tsv`
2. **36 TC duplikat** → skip (sudah tercakup)
3. Atau jalankan script, biar output `Conversation_gap_supplement.tsv` sebagai file **referensi** terpisah
