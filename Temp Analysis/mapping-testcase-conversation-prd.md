# Mapping Testcase Conversation ↔ PRD Conversation
> Sumber PRD Canonical: `PRD/Conversationv2/`
> Sumber Testcase yang relevan:
> - `Test/conversation/Conversation.tsv` (SIX-Convo-xxx)
> - `Test/conversation/Groupchat.tsv`
> - `Test/ticket/Ticket Room Conversation.tsv`
> - `Test/New folder (2)/Ticket Room Conversation.tsv`

---

## 1. PRD Conversation — Developed (urut sesuai folder)

| No | PRD Conversation V2 | Fitur utama | Tersedia Test Case yang terkait dari folder `Test/` | Catatan |
|---|---|---|---|---|
| 1 | PRD Ticket - Omnichannel Inbox - Chat List | Chat list, tabs, filter, sort, SLA card | Beberapa SIX-Convo-001 s/d SXX-Convo-XXX terlihat mencover tab unassigned/your-inbox/starred/spam/pinned. Namun sebagian besar mencakup aksi chat list seperti star/spam/pin. | Perlu ditrace lebih lanjut apakah slicing benar-benar lengkap. |
| 2 | PRD Ticket - Omnichannel Inbox - Conversation Room | Header, bubbles, typing, status message, attachments, quick actions | Banyak SIX-Convo-xxx yang masuk area room: screenshot, ellipsis actions, typing, online status. Sebagian terlihat di `Conversation.tsv`. Ada juga `Ticket Room Conversation.tsv` yang kemungkinan relevan. | Beberapa kasus вай berlabel Failed (e.g. star/spam sort, icon live refresh). |
| 3 | PRD Ticket - Omnichannel Inbox - Conversation Detail | Detail sidebar, attributes, linked tickets, SLA | Masih perlu dipetakan; belum jelas apakah ada test case bertarget detail. | Potential gap. |
| 4 | PRD Ticket - Omnichannel Inbox - Inbox Navigation | Your Inbox, Unassigned, All, Closed, Starred, Spam, Junk vs. V2 navigation model | Ada beberapa SIX-Convo-xxx tentang unassigned/your-inbox/open room. Namun yang spesifik filter All/Closed/Starred/Spam/Junk bisa jadi belum selesai. | potential gap. |
| 5 | PRD Ticket - Omnichannel Inbox - Team Inbox Navigation | Team selector, team inbox view | Belum ada indikasi test case spesifik ke Team Inbox Navigation dari nama `SIX-Convo-*` dan file `Team Inbox Member Drawer` berbeda ekstensi TSV. | potential gap. |
| 6 | PRD Ticket - Get New Conversation (Agent Pull Queue) | Pull queue, tab Unassigned | SIX-Convo-001 “unassigned conversation. empty state” menunjukkan coverage sudah mulai. | Diprategikan ke Next untuk ditarik ke test plan. |
| 7 | PRD Ticket - Conversation Ownership Decoupling | `team_owner_id`, participants = assignee, move policy | Sebagaimana analisis sebelumnya, tidak ada testcase yang eksplisit menyebutkan decoupling. | gap potensial besar. |
| 8 | PRD Ticket - Omnichannel Chat Sessions (Group Handling + Multi-number Send as) | Group chat handling, send-as | Satu file `Test/conversation/Groupchat.tsv` ada. Namun dari konten belum tentu menutup semua aspek V2 Chat Sessions. | perlu crosscheck. |
| 9 | PRD Ticket - Multi-Ticket Drafts from Single Chat Bubble | Create multiple tickets from one bubble | Likely tidak ada test case khusus di Conversation.tsv karena test scenario tangent `ticket`. | Perlu dicek apakah ada TC di folder `Test/ticket/`. |
| 10 | PRD Ticket - Conversation Custom Attributes (Single + Collections) | Custom fields | Beberapa TC bisa ada di Conversation Room dengan skenario custom attributes. Tapi belum terlihat eksplisit dari nama TC/deskripsi. | Gap potensial; perlu trace kata kunci attribut. |
| 11 | PRD Ticket - Conversation and Ticket Response Metrics Tracking | FRT/TTC/RLT/Wait Time, pause policy | Ada tetapi bukan coverage penuh metrics+cross-domain. Review manual. | Partial. |
| 12 | PRD Ticket - Team Inbox Member Drawer and Online Status HUD | Member drawer, online HUD | Ada SIX-Convo-014 s/d SIX-Convo-018 yang mencover online/offline + initial icon. Namun HUD yang mendetail per Team Inbox belum tentu tercakup. | Partial. |
| 13 | PRD Ticket - Assignees and Collaborators Permission Model | Assignee + collaborator permission | Saat ini hanya participants = assignee yang di FE. Collaborator belum jadi role terpisah (sesuai memory undeveloped). | Kolaborasi BLOCKED hingga feature belum diimplementasi. |
| 14 | PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation | Reply conversation via email, auto link | Perlu dicek filename email; bisa masih belum tertangkap di domain conversation. | potential gap. |

---

## 2. PRD Conversation — Undeveloped

| No | Fitur Undeveloped | PRD Source | Status Implementasi | Diharapkan Output Testcase | Label |
|---|---|---|---|---|---|
| 1 | Collaborator Role (V2 file 2) | Assignees and Collaborators Permission Model | FE & BE ❌ Belum | Test permission collaborator read-only + blocked submit + tidak muncul di assignee | LABEL: coverage blocked |
| 2 | Snooze Conversation (V2 file 16) | Conversation Snooze (Conversation List) | ❌ Belum | Test snooze future-only, list visibility, reminder precedence, inbound wake-up | LABEL: UNDEVELOPED |
| 3 | Related/Relational Conversations (V2 file 19) | Related Conversations Grouping | ❌ Belum | Test parent/child aggregation, room tabs, sort by latest child, unread aggregate | LABEL: UNDEVELOPED |
| 4 | WhatsApp Group Mention in Conversation (V2 file 15) | WA Group Mention | ❌ Belum | Test @ picker WA group composer, valid mention, invalid mention warning | LABEL: UNDEVELOPED |
| 5 | Auto-reply Templates (V2 file 1) | Availability Auto-Reply | ❌ Belum | Test outside hours trigger, cancel-on-agent-reply, bot msg distinct, SLA exclusion | LABEL: UNDEVELOPED |
| 6 | Room Reminder (V2 file 9) | Conversation Room | ❌ Belum | Test set/cancel reminder, notification delivery precedence vs snooze | LABEL: UNDEVELOPED |
| 7 | Hold/Resume di Room Header (V2 file 9) | Conversation Room | ❌ Belum | Test Hold → SLA pause, Resume → resume, overlap with Snooze precedence | LABEL: UNDEVELOPED |
| 8 | Collections (Repeatable Custom Attributes) (V2 file 11) | Conversation Custom Attributes | ❌ Belum | Test add/edit/remove collection, flat mode, overflow, search indexed | LABEL: UNDEVELOPED |

> Catatan: untuk fitur undeveloped, tidak ada test case yang bisa dijalankan sampai fitur tersedia. Tetap buat testcase dengan label `UNDEVELOPED` agar tidak lupa.

---

## 3. Testcase yang sudah ada — Mapping ke PRD

Berikut pola mapping yang disarankan untuk PRD一目了然:

| Test Case ID | PRD File | Fitur yang Dicover | Status |
|---|---|---|---|
| `SIX-Convo-001` | Chat List | Unassigned empty state | Need to Test |
| `SIX-Convo-002` | Chat List | Open conversation | Passed (DEV) |
| `SIX-Convo-003` | Inbox Navigation | Unassigned → Your Inbox (read) | Need to Test |
| `SIX-Convo-004` | Chat List Quick Actions | Star / Spam / Pin | Failed (staging), masih perlu perhatian |
| `SIX-Convo-005` | Chat List Quick Actions | Unstar / Unspam / Unpin | Failed |
| `SIX-Convo-014` sampai `SIX-Convo-018` | Team Inbox Member Drawer and Online Status HUD | Online/offline, initial icon | Mix Passed/Failed/Need to Test |

> Tabel ini bisa dilanjutkan dengan melacak `Conversation.tsv` baris per baris menuju nomor PRD yang relevan. Jika perlu, bisa saya lanjutkan secara batch dengan bantuan script untuk mengekstrak kata kunci dari TC terhadap daftar nama file PRD.

---

## 4. Gap Analysis Summary

| Area | PRD Defines Requirements | Test Case Coverage | Gap | Actions |
|---|---|---|---|---|
| Chat List (tabs, sort) | ✅ | ⚠️ Partial | Star/spam sort failed; All/Closed/Starred/Spam/Junk filter mungkin belum lengkap | Tambahkan testcase khusus filter + sort; rerun failed TC. |
| Room (message bubble, typing, status) | ✅ | ⚠️ Partial | Beberapa TC Failed (sort star/spam, initial icon update) | Perbaiki bug FE lalu re-test. |
| Inbox Navigation | ✅ | ⚠️ Partial | Test scenario unassigned move ada; filter All/Closed belum terlihat | Buat testcase `All`, `Closed`, `Starred`, `Spam`, `Junk`. |
| Team Inbox Navigation | ✅ | ⚠️ Missing | Belum ada TC spesifik ke team selector + team inbox | Buat TC baru dengan prefix `SIX-Convo-Team-`. |
| Agent Pull Queue | ✅ | ⚠️ Partial | Empty state + open room ada. Waiting queue, conflict claim belum jelas | Buat TC `pull empty`, `pull vs other agent`, `double claim`. |
| Ownership Decoupling | ✅ | ❌ Gap | Belum ada TC eksplisit | Buat testcase untuk `move`, `legacy reopen`, `source team list`, `target team reply` |
| Related Conversations | ❌ Undeveloped | ❌ Undeveloped | PRD belum bisa di-test | Buat TC UNDEVELOPED. |
| Snooze Conversation | ❌ Undeveloped | ❌ Undeveloped | PRD belum bisa di-test | Buat TC UNDEVELOPED. |
| Auto-reply | ❌ Undeveloped | ❌ Undeveloped | PRD belum bisa di-test | Buat TC UNDEVELOPED. |
| Custom Attributes UI | ✅ | ⚠️ Partial | Ada namun belum eksplisit. Beberapa TC mungkin memang custom fields tapi dari histogram belum keliatan jelas. | Tambahkan TC spesifik `edit custom field`, `search by custom field`. |

---

## 5. Rekomendasi Langkah Berikutnya
1. Ekspansi tabel Section 3 untuk menutup semua 663 TC (bisa via scripts, bukan manual), tapi cukup sampai level `PRD File + Fitur + Status`.
2. Buat file `conversation-testcase-regression.md` yang melisting failed TC stale untuk ditelusuri lebih dulu (star/spam sort, initial icon, live update).
3. Buat TC baru untuk setiap item Gap didahulukan oleh `Ownership Decoupling`, `Inbox Navigation (All/Closed)`, `Team Inbox Navigation`.
4. Untuk fitur Undeveloped, buat TC UNDEVELOPED dengan format yang sama namun menandai expected result sebagai “Fitur belum tersedia”.
