# Gap Analysis: Web vs Mobile Conversation — SatuInbox

> Tujuan: Identifikasi fitur yang belum ada di mobile agar bisa mencapai parity dengan versi web. Web = baseline lengkap; mobile = target yang perlu ditutup gap-nya.

---

## 1. Feature Gap Matrix

| # | Fitur | Web Status | Mobile Status | Gap Type | Prioritas | Catatan UI/UX Adaptasi Mobile |
|---|-------|-----------|--------------|----------|-----------|-------------------------------|
| 1 | **Offline Message Buffer** | ✅ `pending-socket-queue.store.ts` | ❌ Tidak ada | Missing | **P0** | Lebih krusial di mobile (jaringan tidak stabil). Implementasi queue di Zustand store + flush saat reconnect. Pattern: optimistic send sudah ada, tinggal tambah persist queue ke AsyncStorage. |
| 2 | **Conversation SLA Metrics (FRT/TTC/RLT/Wait Time)** | ✅ Full display + color thresholds | ❌ Tidak ada | Missing | **P0** | Badge/chip di chat header (warna = threshold). Tap chip → bottom sheet breakdown detail. Jangan tabel, gunakan visual indicator ringkas. |
| 3 | **Global Search** | ✅ Per-domain (conversations, tickets, contacts) | ❌ Tidak ada | Missing | **P0** | Search bar di top → results FlatList. Pattern: WhatsApp/Telegram universal search. Tab per kategori (Conversations, Contacts, Tickets). |
| 4 | **Voice Note Playback** | ✅ wavesurfer.js | ❌ Tidak ada | Missing | **P0** | Gunakan `expo-av` atau `react-native-track-player`. Waveform bisa pakai `react-native-audio-waveform`. Inline play button di bubble, progress bar horizontal. |
| 5 | **Advanced Filters** | ✅ Multi-criteria filter | ⚠️ FilterSheet ada tapi terbatas | Partial | **P1** | Sudah ada pattern FilterSheet → extend dengan opsi tambahan (date range picker, SLA status, assignment source). Bottom sheet sudah jadi pattern. |
| 6 | **Relation Labels** | ✅ Label/kategori pada conversation | ❌ Tidak ada | Missing | **P1** | Chip/tag horizontal di chat item row. Warna berbeda per label. Long-press chat → manage labels via bottom sheet. |
| 7 | **Screenshot Capture** | ✅ SnippingOverlay | ❌ Tidak ada | Missing | **P1** | **Ini lebih mudah di mobile** — gunakan VisionCamera (sudah ada) + `capture()` → attach ke composer sebagai image. Atau gunakan native screenshot API + share extension. |
| 8 | **Macros** | ❌ Tidak ada di web juga | ❌ Tidak ada | N/A | **P1** | Karena web juga belum punya, ini fitur baru bersama. Tapi kalau mau duluan di mobile: trigger via "/" command di composer atau button di toolbar. |
| 9 | **CSAT** | ❌ Tidak ada di web juga | ❌ Tidak ada | N/A | **P1** | Sama — jika di-build, pattern: rating sheet muncul setelah conversation di-close. 1-5 stars + optional text. |
| 10 | **Assignment Source Display** | ✅ (manual/self-pull/system/bulk) | ❌ Tidak ada | Missing | **P2** | Small label/icon di chat info. "Auto-assigned" / "Manual" badge. Ringan — cukup text label di detail header. |
| 11 | **Team Member Presence** | ✅ Online/offline/away indicators | ❌ Tidak ada | Missing | **P2** | Dot indicator (🟢/🟡/⚪) di avatar. Sudah ada avatar pattern di mobile, tinggal tambah presence badge. Perlu socket event: `/notifications` namespace belum ada di mobile. |
| 12 | **Bulk Actions — Extended** | ✅ (assign, pin, spam, read, star, junk, close, reopen) | ⚠️ (close, reopen, pin, star, junk, spam, assign — sudah ada) | Partial | **P2** | Sudah hampir parity. Cek apakah "mark read" dan "bulk assign" sudah masuk selection mode. Pattern sudah ada. |
| 13 | **Inbound Notification Sound** | ✅ IncomingMessageNotificationProvider + sound | ⚠️ Local notification ada, sound unclear | Partial | **P1** | Tambah custom sound file + play via `expo-av` saat socket event masuk (bukan hanya local notification). Perlu audio focus handling. |
| 14 | **Multiple Tickets from Message Bubble** | ✅ Create/view tickets dari message | ❌ Tidak ada | Missing | **P2** | Long-press message → "Create Ticket" di context sheet. Ticket link badge di bubble. |
| 15 | **Reassign Account Channel** | ✅ Di detail sidebar | ❌ Tidak ada | Missing | **P2** | Opsi di conversation info screen. Dropdown picker di bottom sheet. |
| 16 | **Room CRUD** | ✅ Create/rename/archive room | ❌ Tidak ada | Missing | **P2** | FAB di chat list → create room. Swipe atau long-press → archive/rename. Pattern standar. |
| 17 | **Spam/Junk Sections** | ✅ Dedicated sections di sidebar nav | ⚠️ Filter ada, section terpisah unclear | Partial | **P2** | Sudah ada filter chip. Mungkin cukup — tapi jika mau section terpisah: tab/filter di chat list header. |
| 18 | **Starred Conversations Section** | ✅ Dedicated section | ⚠️ Filter ada | Partial | **P2** | Sama seperti spam — filter chip sudah ada, dedicated section opsional. |

### Additional Architecture Gaps

| # | Gap | Web | Mobile | Prioritas | Catatan |
|---|-----|-----|--------|-----------|---------|
| A1 | **Socket Namespace Coverage** | `/conversations`, `/tickets`, `/notifications`, channel events | `/conversations` saja | **P0** | SLA updates, presence, ticket events butuh namespace tambahan. Blocker untuk fitur SLA dan presence. |
| A2 | **Server State Management** | React Query (cache, invalidation, refetch) | Zustand only | **P1** | Tidak blocker tapi bikin cache management lebih sulit. Consider `@tanstack/query-react-native` untuk API fetching yang proper. |
| A3 | **Internationalization (i18n)** | ✅ en/id, ESLint enforced | ❌ Hardcoded English | **P1** | Pasar Indonesia = prioritas. Perlu setup `i18next` + `react-i18next` di mobile. |
| A4 | **Offline Resilience (general)** | pending-socket-queue | Tidak ada | **P0** | Cover di offline message buffer (item #1). Tapi juga perlu: retry failed API calls, stale-while-revalidate pattern. |

---

## 2. Grup Berdasarkan Prioritas

### P0 — Critical Parity (Harus segera ditutup)

| Fitur | Gap | Effort Est. | Blocker? |
|-------|-----|-------------|----------|
| Offline Message Buffer | Missing | Medium (3-5d) | — |
| SLA Metrics | Missing | Medium (3-5d) | Perlu namespace `/notifications` di socket |
| Global Search | Missing | Large (5-8d) | Perlu API endpoint search terpadu (atau reuse web punya) |
| Voice Note Playback | Missing | Small (2-3d) | — |
| Socket Namespace `/tickets`, `/notifications` | Missing | Medium (3-5d) | Blocker untuk SLA, presence, ticket events |

**Total P0 estimate: ~3-4 sprint weeks**

### P1 — High Value (Tingkatkan produktivitas agen mobile)

| Fitur | Gap | Effort Est. |
|-------|-----|-------------|
| Advanced Filters (extend FilterSheet) | Partial | Small (2-3d) |
| Relation Labels | Missing | Small (2-3d) |
| Screenshot Capture (VisionCamera) | Missing | Small (1-2d) |
| Inbound Notification Sound | Partial | Small (1-2d) |
| i18n (en/id) | Missing | Medium (3-5d) |
| React Query adoption (optional) | Different | Medium (3-5d) |

**Total P1 estimate: ~2-3 sprint weeks**

### P2 — Nice to Have

| Fitur | Gap | Effort Est. |
|-------|-----|-------------|
| Assignment Source Display | Missing | XS (0.5-1d) |
| Team Member Presence | Missing | Small (2-3d) |
| Bulk Actions parity (mark read) | Partial | XS (0.5-1d) |
| Multiple Tickets from Message | Missing | Small (2-3d) |
| Reassign Account Channel | Missing | Small (1-2d) |
| Room CRUD | Missing | Small (2-3d) |
| Spam/Junk dedicated sections | Partial | XS (1d) |

**Total P2 estimate: ~2 sprint weeks**

---

## 3. Rekomendasi UI/UX Adaptasi Mobile

### Pola Dasar: Web 3-Column → Mobile Stack Navigation

Web menggunakan layout 3 kolom (list → room → detail sidebar). Mobile sudah benar pakai stack navigation (list → detail → info). **Jangan coba replicates 3-column di mobile.** Sebagai ganti:

| Web Pattern | Mobile Adaptation |
|-------------|-------------------|
| Right sidebar (detail/contact) | `ConversationInfoScreen` — halaman terpisah, diakses via header button |
| Left sidebar (navigation sections) | Filter chips di top chat list + drawer/menu untuk sections |
| Inline SLA di room header | SLA chips/badge di `ChatHeader`, tap → bottom sheet detail |
| Bulk actions toolbar | Selection mode dengan bottom action bar (sudah ada pattern) |
| Global search in sidebar | Universal search screen, push dari chat list header search icon |

### Per-Fitur Adaptasi

#### SLA Metrics (P0)
```
ChatHeader:
┌─────────────────────────────────┐
│ ←  Customer Name    🔴 FRT 2m   │
│    WhatsApp          🟡 RLT 1h  │
└─────────────────────────────────┘
         ↓ tap badge
┌─────────────────────────────────┐
│ SLA Details          (half sheet)│
│                                 │
│ First Response Time   2m 15s    │
│ ████░░░░░░  Target: 5m  ✅      │
│                                 │
│ Total Conversation    1h 30m    │
│ ██████░░░░  Target: 4h  ✅      │
│                                 │
│ Resolution Last Touch  15m     │
│ ██░░░░░░░░  Target: 1h  ✅      │
└─────────────────────────────────┘
```
- Warna: hijau = on track, kuning = approaching, merah = breached
- Chip kecil, bukan tabel. Tap expand ke bottom sheet.

#### Global Search (P0)
```
SearchScreen (full screen push):
┌─────────────────────────────────┐
│ 🔍 Search conversations...    ✕ │
├─────────────────────────────────┤
│ [Conversations] [Contacts] [..] │ ← tab filter
├─────────────────────────────────┤
│ Results:                        │
│ ┌─ John Doe ─────────────────┐  │
│ │ WhatsApp · 2m ago          │  │
│ │ "...pesan terakhir..."     │  │
│ └────────────────────────────┘  │
│ ┌─ Jane Smith ───────────────┐  │
│ │ Telegram · 1h ago          │  │
│ └────────────────────────────┘  │
└─────────────────────────────────┘
```
- Real-time search (debounce 300ms)
- Reuse existing `ChatItem` component untuk result rows
- Deep link: tap result → push ke `ChatDetail`

#### Offline Message Buffer (P0)
```
InputChatArea status bar:
┌─────────────────────────────────┐
│ ⚠️ 3 pesan menunggu koneksi...  │ ← strip kecil di atas input
│    [Retry Now]                  │
└─────────────────────────────────┘
```
- Queue di Zustand + persist ke AsyncStorage (key: `pending_messages`)
- Auto-flush saat socket reconnect
- TempMessageId correlation sudah ada → extend ke queue

#### Voice Note Playback (P0)
```
MessageBubble (voice):
┌─────────────────────────────────┐
│ ▶ ▓▓▓▓▓▓░░░░░░  0:12 / 0:45  │
│                   🔊           │
└─────────────────────────────────┘
```
- `expo-av` untuk playback (sudah di Expo ecosystem)
- `react-native-audio-waveform` untuk waveform visual (opsional, bisa pakai simple progress bar dulu)
- Lock screen controls via `expo-av` Audio mode

#### Screenshot Capture (P1)
- **Ini lebih natural di mobile daripada web.** VisionCamera sudah ada.
- Flow: Camera icon di composer → take photo/screen → preview → send as attachment
- Alternative: tap-hold conversation → "Screenshot" → capture screen → annotate (opsional) → attach

#### Relation Labels (P1)
```
ChatItem row:
┌─────────────────────────────────┐
│ 👤 John Doe          2m ago    │
│ Last message preview...        │
│ [VIP] [Urgent] ← label chips   │
└─────────────────────────────────┘
```
- Horizontal ScrollView chips, max 2-3 visible + "+N" overflow
- Manage: long-press chat → "Labels" → bottom sheet dengan checklist

#### Advanced Filters (P1)
```
FilterSheet (extend existing):
┌─────────────────────────────────┐
│ Filter Conversations            │
│                                 │
│ Status:  ○ Open  ○ Closed  ○ All│
│ SLA:     ○ On Track             │
│          ○ At Risk              │
│          ○ Breached             │
│ Source:  ○ Manual ○ System      │
│          ○ Self-Pull ○ Bulk     │
│ Date:    [From] — [To]          │
│                                 │
│ [Reset]              [Apply]    │
└─────────────────────────────────┘
```
- Extend `FilterSheet` yang sudah ada
- Tambah section: SLA status, assignment source, date range picker

---

## 4. Technical Blockers

### Blocker 1: Socket Namespace Coverage (P0)
**Impact:** SLA metrics, team presence, ticket events, notification sounds
**Current:** Mobile hanya connect ke `/conversations`
**Need:** Tambah `/notifications` dan `/tickets` namespaces
**Fix:** Extend `socketService` untuk multi-namespace connection. Pattern sudah ada di web (`SocketProvider` per namespace).

### Blocker 2: API Endpoints
**Impact:** Global search, SLA data, relation labels
**Check:** Pastikan endpoint yang dipakai web tersedia untuk mobile:
- `GET /conversations/search` (global search)
- `GET /conversations/:id/sla` (SLA metrics)
- `GET /labels` + `POST /conversations/:id/labels`
- `GET /tickets?conversationId=` (multiple tickets)

### Blocker 3: No React Query
**Impact:** Cache consistency, background refetch, optimistic updates yang lebih robust
**Current:** Zustand only = manual cache management
**Severity:** Tidak blocker tapi bikin semua fitur baru lebih susah
**Recommendation:** Adopt `@tanstack/react-query` untuk server state. Zustand tetap untuk UI state. Incremental adoption — mulai dari fitur baru, migrate lama nanti.

### Blocker 4: i18n Infrastructure
**Impact:** Semua string perlu bilingual (id/en) untuk pasar Indonesia
**Current:** Hardcoded English
**Fix:** Setup `i18next` + `react-i18next` + extraction pipeline. Blocker untuk release production Indonesia.

---

## 5. Rekomendasi Urutan Implementasi (Dependency-Aware)

### Phase 1: Foundation (Sprint 1-2)
```
1. Socket namespace expansion (/notifications, /tickets)
   └─ Blocker untuk SLA, presence, notification sound
2. Offline message buffer (Zustand queue + AsyncStorage persist)
   └─ Highest user impact di mobile (jaringan lapangan)
3. Voice note playback (expo-av)
   └─ Standalone, no dependencies, quick win
```

### Phase 2: Core Parity (Sprint 3-4)
```
4. SLA metrics display (chips + bottom sheet)
   └─ Depends on: socket namespace (#1)
5. Global search (search screen + API integration)
   └─ Standalone, high effort
6. Inbound notification sound
   └─ Depends on: socket namespace (#1)
7. i18n setup + initial translation
   └─ Foundation untuk semua UI strings
```

### Phase 3: Productivity (Sprint 5-6)
```
8. Advanced filters (extend FilterSheet)
   └─ Standalone
9. Relation labels (chips + management sheet)
   └─ Standalone
10. Screenshot capture (VisionCamera integration)
    └─ Standalone, low effort
11. React Query adoption (incremental, new features first)
    └─ Optional but recommended
```

### Phase 4: Polish (Sprint 7-8)
```
12. Assignment source display
13. Team member presence (depends on socket #1)
14. Multiple tickets from message bubble
15. Reassign account channel
16. Room CRUD
17. Bulk action parity (mark read)
18. Spam/Junk dedicated sections
```

### Dependency Graph (simplified)
```
Socket Namespace Expansion (#1)
  ├── SLA Metrics (#4)
  ├── Notification Sound (#6)
  └── Team Presence (#13)

All other features: independent, can parallelize
```

---

## Summary

| Kategori | Count | Total Effort |
|----------|-------|-------------|
| P0 — Critical | 5 items | ~3-4 sprint weeks |
| P1 — High Value | 6 items | ~2-3 sprint weeks |
| P2 — Nice to Have | 7 items | ~2 sprint weeks |
| **Total** | **18 items** | **~7-9 sprint weeks** |

**Quick wins (< 1 day each):** Assignment source display, bulk action parity, spam/junk sections.

**Biggest blocker:** Socket namespace expansion — memblokir 3 fitur P0/P2.

**Biggest effort:** Global search (5-8 days, perlu search screen + API + tabs + result rendering).

**Mobile advantage:** Screenshot capture lebih natural di mobile daripada web. Voice note recording juga lebih natural (built-in mic access).
