# 📊 Analisis PRD Conversation vs Test Case — SIX-Convo

> **Tanggal Analisis:** Juni 2026  
> **Sumber:** `PRD/conversation/` (19 file), `PRD/conversationv2/` (20 file), `Test/conversation/Conversation.tsv` (712 test cases)

---

## Ringkasan Eksekutif

| Metrik | Nilai |
|--------|-------|
| **Total Fitur PRD Unique** | **21** fitur (setelah deduplikasi) |
| **Total Test Cases** | **712** (SIX-Convo-001 s.d. 712) |
| **DEV: Passed** | 159 ✅ |
| **DEV: Failed** | 62 ❌ |
| **DEV: Need to Test** | 371 ⏳ |
| **DEV: No Status** | 29 |
| **PROD: Passed** | 123 ✅ |
| **PROD: Failed** | 37 ❌ |
| **PROD: Need to Test** | 385 ⏳ |
| **Fitur [UNDEVELOPED]** | **1 fitur:** Set Reminder (23 TC) |
| **Fitur Belum Ada Test Case** | **6 fitur** dari PRD (tidak ada TC sama sekali) |

---

## 🔴 FITUR BELUM DEVELOPED (UNDEVELOPED)

### 1. Set Reminder — [UNDEVELOPED]
| Info | Detail |
|------|--------|
| **Test Cases** | SIX-Convo-032 s.d. 054 (23 TC) |
| **PRD Source** | PRD Inbox Conversation - detail.md (fitur Reminder di Conversation Detail) |
| **Status DEV** | Semua NEED TO TEST (kecuali Convo-032: FAILED di PROD) |
| **Cakupan** | Quick reminder (1h, 2h, tomorrow, 2 days, week), Custom time picker, Repeat every (hours/days/weeks/months), Cancel, Input validation (alphabet, max digits) |
| **Catatan** | Meskipun marked [UNDEVELOPED], di PROD untuk Convo-032 ternyata FAILED — artinya ada percobaan implementasi partial |

---

## 🟡 FITUR SUDAH DEVELOPED — PER LUAS COVERAGE TEST

### Conversation Room & Messaging

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status | Keterangan |
|-------|----------|-----------|------------|-------------|------------|
| **Conversation List** | 001-005 | 5 | 2 Passed, 1 Failed, 2 Need | Mostly Need | Unassigned, move to inbox |
| **Initial/Photo Icon** | 006-013 | 8 | 5 Passed, 3 Failed | 5 Passed, 3 Failed | Icon validation: 1 name, 2 name, 3 name, photo profile |
| **Lifeness Indicator** | 014-018 | 5 | All Need to Test | All Need to Test | Online/offline status |
| **Customer Name** | 019-022 | 4 | 2 Passed, 1 Failed | 1 Passed | Display name from WA |
| **Screenshot** | 023-025 | 3 | All Need | 2 Passed, 1 Failed | Entire room & custom area |
| **Ellipsis Actions** | 026-031 | 6 | All Need | All Failed ❌ | Star/unstar, pin/unpin, spam/unspam |
| **Create Ticket Button** | 055 | 1 | Passed ✅ | Passed ✅ | ✅ Berfungsi baik |
| **Conversation Status** | 056-057 | 2 | 1 Passed, 1 Need | 1 Passed, 1 Failed | Close/reopen convo |
| **Message Input Display** | 058-059 | 2 | 1 Passed, 1 Failed | All Failed ❌ | Placeholder, highlight on focus |
| **Message Input Text** | 060-072 | 13 | 8 Passed, 4 Failed | 8 Passed, 4 Failed | Enter, shift+enter, spaces, max 10 lines, scroll |
| **Message Input Notes** | 073 | 1 | Need to Test | Need to Test | Message as notes |
| **Message Input Image** | 074-082 | 9 | 4 Passed, 5 Failed | 7 Passed, 1 Failed | JPG/PNG, size limits, aspect ratios |
| **Message Input Video** | 083-091 | 9 | All Failed ❌ | 7 Passed | MP4/MOV, thumbnails, size limits |
| **Message Input File** | 092-095 | 4 | 4 Failed ❌ | 2 Passed | PDF, DOCX, XLSX, size limits |
| **Multiple Media/File** | 096-108 | 13 | 8 Passed, 3 Failed | Partially tested | Max preview 25, drag & drop, duplicates |
| **Reply Message** | 109-152 | 44 | All Need to Test | 8 Passed, 20+ Failed ❌ | Reply: text, img, vid, file kombinasinya |
| **Emoji** | 153 | 1 | Passed ✅ | Passed ✅ | ✅ Berfungsi baik |

### Bubble Chat

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status | Keterangan |
|-------|----------|-----------|------------|-------------|------------|
| **Bubble Chat Outbound/Inbound** | 154-163 | 10 | Mostly Passed ✅ | Mostly Passed ✅ | Posisi bubble, delivery |
| **Bubble Chat: Ticketed** | 164 | 1 | Passed ✅ | Failed ❌ | Pink highlight |
| **Bubble Chat: Text Long** | 165-167 | 3 | 1 Failed | 2 Passed | Read more, max width/height |
| **Bubble Chat: Image** | 168-176 | 9 | Mostly Failed ❌ | Mostly Passed | Aspect ratios (1:1, 1:5, 5:1), expired link |
| **Bubble Chat: GIF** | 177 | 1 | Need to Test | Need to Test | |
| **Bubble Chat: Video** | 178-186 | 9 | Mostly Failed ❌ | Mostly Passed | Thumbnail, aspect ratios |
| **Bubble Chat: File** | 187-190 | 4 | Need to Test | 2 Failed ❌ | PDF/XLSX send & receive |
| **Bubble Chat: Multiple** | 191-194 | 4 | Most Passed | Mostly Passed | Group messages |
| **Bubble Chat: Special** | 195-200 | 6 | Mostly Passed | Mostly Need | Voice, sticker, view once, reply |
| **Infinite Scroll** | 201 | 1 | Passed ✅ | Need to Test | Load 25 bubble chat |

### Open Media/File (Gallery Viewer)

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status | Keterangan |
|-------|----------|-----------|------------|-------------|------------|
| **Gallery Viewer: Image** | 202-203, 209-214 | 10 | All Failed ❌ | All Need to Test | Dari bubble chat & preview |
| **Gallery Viewer: Video** | 205-207, 215-220 | 10 | All Need | All Need | Play/pause, volume, progress |
| **Gallery Viewer: File** | 208, 221-223, 257 | 6 | All Need | All Need | PDF, DOCX, XLSX |
| **Gallery Viewer: Navigation** | 224-256 | 33 | All Need | All Need | Thumbnail bar, pin/unpin, save, zoom, expired media |

### Quick Action

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status |
|-------|----------|-----------|------------|-------------|
| **Copy Message** | 258-259 | 2 | Need to Test | Need to Test |
| **Pin Message** | 260 | 1 | Failed ❌ | Need to Test |
| **Select Message** | 261-267 | 7 | 2 Passed, 3 Failed | Need to Test |

### Timestamp & Delivery

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status |
|-------|----------|-----------|------------|-------------|
| **Timestamp** | 268-288 | 21 | 16 Passed, 4 Failed | Mostly Passed |
| **Delivery Status** | 289-302 | 15 | 10 Passed, 2 Failed | Mostly Passed |

### Typing Indicator

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status |
|-------|----------|-----------|------------|-------------|
| **Typing Indicator** | 303-315 | 13 | All Need to Test | All Need to Test |

### Conversation Detail Panel

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status | Keterangan |
|-------|----------|-----------|------------|-------------|-------------|
| **Conversation Details (General)** | 316-321 | 6 | Mostly Need | Mostly Need | Display from WA, widget, group; drawer |
| **Assignee Accordion** | 322-355 | 34 | All Need to Test | All Need | Team inbox, member, FRT |
| **Attributes Accordion** | 356-361 | 6 | All Need | All Need | Channel source, topics |
| **Custom Attributes** | 362-369 | 8 | All Need | All Need | Pagination, see all |
| **Client Data** | 370-376 | 7 | All Need | All Need | Customer info, GPS |
| **Linked Tickets** | 377-386 | 10 | All Need | All Need | Counter, see all panel |
| **Client Tags** | 387-402 | 16 | All Need | All Need | Add/remove tags modal |
| **Notes Accordion** | 403-416 | 14 | All Need | All Need | Create, pin, delete, panel |
| **Pinned Message Accordion** | 417-427 | 11 | All Need | All Need | Display, see all, pin/unpin |
| **Conversation History Accordion** | 428-437 | 10 | All Need | All Need | History list, see all panel |
| **Media Accordion** | 438-450 | 13 | All Need | All Need | Display, click, see all panel |
| **Files Accordion** | 451-463 | 13 | All Need | All Need | File types, see all panel |
| **Conversation Events Accordion** | 464-471 | 8 | All Need | All Need | Timeline, see all panel |
| **Screenshot Accordion** | 472-482 | 11 | All Need | All Need | Display, click, see all panel |

### Navigation

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status | Keterangan |
|-------|----------|-----------|------------|-------------|-------------|
| **Your Inbox Nav** | 483-489 | 7 | All Passed ✅ | 5 Passed, 2 Failed | Default page, counter, exclusive to user |
| **Unassigned Nav** | 490-495 | 6 | All Passed ✅ | All Passed ✅ | ✅ Berfungsi baik |
| **All Conversation Nav** | 496-498 | 3 | All Passed ✅ | 2 Passed, 1 Failed | Counter mismatch |
| **Starred Nav** | 499-502 | 4 | 3 Passed, 1 Need | 1 Passed, 1 Failed | Add star/403 error |
| **Spam Nav** | 503-510 | 8 | All Passed ✅ | 6 Passed, 2 Failed | Mark/unmark, counter mismatch |
| **Group Chat Nav** | 511-512 | 2 | Mostly Passed | All Passed ✅ | ✅ Berfungsi baik |
| **Nav General Behavior** | 513-515 | 3 | All Passed ✅ | All Passed ✅ | ✅ Berfungsi baik |
| **Channel Navigation** | 516-524 | 9 | 7 Passed, 2 Failed | All Passed ✅ | Channel list, counter, agent access |
| **Team Navigation** | 525-538 | 14 | 9 Passed, 3 Failed | All Passed ✅ | Team visibility, counter, create team |
| **Junk Folder Nav** | 539-545 | 7 | All Need to Test | All Passed ✅ | ✅ Berfungsi baik |

### Conversation List Filters & Features

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status |
|-------|----------|-----------|------------|-------------|
| **Title & Search** | 546-555 | 10 | 7 Passed, 2 Failed | Mostly Passed |
| **Status Filter** | 556-559 | 4 | 3 Passed, 1 Failed | Mostly Passed |
| **Read/Unread Filter** | 560-566 | 7 | 4 Passed, 3 Failed | Mostly Passed |
| **Sort Filter** | 567-569 | 3 | All Passed ✅ | All Passed ✅ |
| **Advance Filter** | 570-571 | 2 | All Failed ❌ | Need to Test |
| **Layout Visibility** | 572-573 | 2 | All Passed ✅ | Need to Test |
| **Combining Filter** | 574-641 | 68 | 33 Passed, 9 Failed, 26 Need | Mostly Passed |
| **Chat List Items** | 600, 642-663 | 25 | Mostly Need | Mostly Passed |

### Additional Features (TC 664-712)

| Fitur | TC Range | Jumlah TC | DEV Status | PROD Status |
|-------|----------|-----------|------------|-------------|
| **Chat List Extended** | 664-675 | 12 | All Need to Test | All Need to Test |
| **Conversation Room Ext.** | 676-687 | 12 | All Need to Test | All Need to Test |
| **Inbox Navigation Ext.** | 688-698 | 11 | All Need to Test | All Need to Test |
| **Get New Conversation** | 699-705 | 7 | All Need to Test | All Need to Test |
| **Group Handling** | 706-712 | 7 | All Need to Test | All Need to Test |

---

## 🟢 FITUR PRD — TANPA TEST CASE (BELUM ADA COVERAGE)

Fitur-fitur berikut **terdefinisi di PRD** tapi **tidak memiliki test case** di file `Conversation.tsv`:

| No | Fitur | PRD Source | Prioritas PRD |
|----|-------|-----------|---------------|
| 1 | **Macro Templates (Quick Replies)** | `PRD Conversation - macro.md` | P0 |
| 2 | **Availability Auto-Reply** | `PRD Inbox Conversation - autoreply templates.md` | P0-P1 |
| 3 | **Assignees & Collaborators Permission Model** | `PRD Inbox Conversation - assignee n collaborators.md` | P1 |
| 4 | **Conversation Ownership Decoupling (Reassign Account Channel)** | `PRD Inbox Conversation - reassign account channel.md` | P1 |
| 5 | **Live Chat Transcript Reply via Email** | `PRD Ticket - Live Chat Transcript Reply via Email and Auto Linked Conversation.md` | P1 |
| 6 | **Conversation & Ticket Response Metrics Tracking** | `PRD Ticket - Conversation and Ticket Response Metrics Tracking.md` | P1-P2 |
| 7 | **Related Conversations Grouping** | `PRD Inbox Conversation - relational conversation.md` | P2 |
| 8 | **WhatsApp Group Mention** | `PRD Inbox Conversation - whatsapp group mention.md` | P2 |

> **Catatan:** Beberapa fitur di atas mungkin sebagian di-cover oleh test case yang ada (misal: assignee accordion sudah ada TC-nya), tetapi fitur spesifik permission model, ownership decoupling, dll belum ada TC khusus.

---

## 🗺️ MAPPING FITUR PRD → TEST CASE

| No | Fitur PRD | PRD Folder | Test Case Coverage | Status |
|----|-----------|------------|-------------------|--------|
| 1 | **Omnichannel Inbox (Global)** | Both | TC 316-321 (detail display from channels) | ⚠️ Sebagian |
| 2 | **Inbox Navigation** | Both | TC 483-545 ✅ | ✅ Covered |
| 3 | **Chat List** | Both | TC 546-675 ✅ | ✅ Covered |
| 4 | **Conversation Room** | Both | TC 055-200 ✅ | ✅ Covered |
| 5 | **Conversation Detail** | Both | TC 316-482 ✅ | ✅ Covered |
| 6 | **Team Inbox Navigation** | Both | TC 525-538 ✅ | ✅ Covered |
| 7 | **Agent Pull Queue** | Both | **TC 699-705** | ⚠️ Belum di-test |
| 8 | **Team Inbox Member Drawer & HUD** | Both | TC 322-355 (assignee) | ⚠️ Sebagian |
| 9 | **Conversation Snooze** | Both | ❌ Belum ada TC | ❌ |
| 10 | **Related Conversations Grouping** | Both | ❌ Belum ada TC | ❌ |
| 11 | **WhatsApp Group Mention** | Both | ❌ Belum ada TC | ❌ |
| 12 | **Multi-Ticket Drafts** | Both | TC 055 (create ticket button) | ⚠️ Minimal |
| 13 | **Conversation Ownership Decoupling** | Both | ❌ Belum ada TC | ❌ |
| 14 | **Omnichannel Chat Sessions** | Both | TC 056-057 (close/reopen), 154-163 (bubble) | ⚠️ Sebagian |
| 15 | **Conversation Custom Attributes** | Both | TC 362-369 ✅ | ✅ Covered |
| 16 | **Assignees & Collaborators Permission Model** | Both | ❌ Belum ada TC | ❌ |
| 17 | **Availability Auto-Reply** | Both | ❌ Belum ada TC | ❌ |
| 18 | **Macro Templates (Quick Replies)** | Conversation | ❌ Belum ada TC | ❌ |
| 19 | **Live Chat Transcript Reply via Email** | Conversationv2 | ❌ Belum ada TC | ❌ |
| 20 | **Ticketing V2** | Conversationv2 | TC 055, 377-386 (linked tickets) | ⚠️ Minimal |
| 21 | **Conversation & Ticket Response Metrics** | Conversationv2 | ❌ Belum ada TC | ❌ |

---

## 📋 REKOMENDASI PRIORITAS

### 🔴 High Priority (Segera)

1. **Set Reminder** — 23 TC sudah dibuat, tinggal di-develop dan di-test; cukup komprehensif
2. **Advance Filter (Agent/Tag)** — TC 570-571 FAILED di DEV, perlu fix
3. **Ellipsis Actions (Star, Pin, Spam)** — TC 026-031: semua FAILED di PROD
4. **Reply Message** — 44 TC, sebagian besar FAILED di PROD, perlu fix
5. **Open Media/File (Gallery Viewer)** — 56 TC, banyak FAILED/NEED, coverage kurang

### 🟡 Medium Priority

6. **Bubble Chat File (Send & Receive)** — TC 187-190, nama file korup
7. **Read/Unread Filter Counter** — TC 564-566, counter tidak update
8. **Sort + Agent Filter Combination** — TC 588-590, FAILED di DEV
9. **Search Special Characters** — TC 596, error 500
10. **Multiple Media Upload >20mb** — TC 101-102, error handling

### 🟢 Low Priority (Fitur Baru)

11. Buat **test case baru** untuk 8 fitur PRD yang belum punya coverage
12. **Macro Templates**, **Auto-Reply**, **Snooze** — prioritas karena P0/P1

---

## 📊 SUMMARY VISUAL

```
BERDASARKAN FUNGSIONALITAS FITUR:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Fully Tested (DEV & PROD Passed)      : ~15% fitur
⚠️ Partially Tested (Some Failed)        : ~50% fitur  
⏳ Not Yet Tested (Need to Test)          : ~20% fitur
❌ Undeveloped / No TC                    : ~15% fitur

BERDASARKAN STATUS TESTING DEV:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Passed       : 159 TC (22.3%)  ████████░░░░░░░░
Failed       :  62 TC (8.7%)   ███░░░░░░░░░░░░░
Need to Test : 371 TC (52.1%)  ████████████████░
No Status    :  29 TC (4.1%)   █░░░░░░░░░░░░░░░
[UNDEVELOPED]:  23 TC (3.2%)   █░░░░░░░░░░░░░░░
(Note: 68 TC overlap in PASSED+FAILED counts per-step)

BERDASARKAN STATUS TESTING PROD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Passed       : 123 TC (17.3%)
Failed       :  37 TC (5.2%)
Need to Test : 385 TC (54.1%)
No Status    :  76 TC (10.7%)

FITUR PALING STABIL (PASSED di DEV & PROD):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Navigation (Your Inbox, Unassigned, Nav Behavior) ✅
2. Conversation Status (Close/Reopen) ✅
3. Message Input Text (most scenarios) ✅
4. Bubble Chat Basic (outbound/inbound) ✅
5. Spam Nav (most scenarios) ✅
6. Channel Navigation ✅
7. Team Navigation ✅
8. Combining Filters (most combinations) ✅

FITUR PALING BERMASALAH (FAILED di DEV atau PROD):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Set Reminder [UNDEVELOPED] ❌
2. Ellipsis Actions: Star, Pin, Spam (PROD: all Failed)
3. Message Input Video Preview (DEV: all Failed)
4. Message Input File Preview (DEV: all Failed)
5. Gallery Viewer Image (DEV: all Failed)
6. Advance Filter (DEV: all Failed)
7. Starred Nav - Add Star (PROD: 403 error)
8. Reply Message (PROD: many Failed)
9. File Send/Receive - name corruption (PROD)
```
