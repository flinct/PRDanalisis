# Conversation Redesign v1.0

> **Product:** SatuInbox — Conversation / Omnichannel Inbox  
> **Artifact:** Conversation page redesign requirement  
> **Version:** 1.0  
> **Status:** Design / Prototype requirement  
> **Primary objective:** Redesign the Conversation page as a complete, role-aware, state-complete prototype — not only the conversation detail drawer.

---

## 1. Background

Prototype sebelumnya terlalu fokus pada **Conversation Detail Drawer**. Arah drawer sudah benar, tetapi redesign halaman Conversation harus mencakup keseluruhan experience:

1. Conversation navigation / sidenav
2. Conversation list
3. Conversation workspace / chat room
4. Conversation detail drawer
5. Filtering and search
6. Conversation actions
7. Bulk actions
8. Empty, loading, error and success states
9. Open / selected / unselected conversation states
10. Role-based experience untuk Agent, SPV dan Admin
11. Responsive behavior
12. Persistence dan interaction behavior

### Problem utama

Sidenav yang sebelumnya berisi:

- Your Inbox
- All
- Unassigned
- Junk
- Spam
- Channel list
- Team Inbox list

hilang dari prototype.

Hilangnya navigation tersebut mungkin masih acceptable dari Agent POV apabila fokus hanya pada inbox miliknya, tetapi **tidak acceptable sebagai default Conversation experience untuk SPV dan Admin**, karena role tersebut membutuhkan visibility dan navigasi lintas inbox, team dan channel.

Frontend reference juga menyatakan bahwa route Conversation memang mencakup:

`your-inbox`, `unassigned`, `all`, `starred`, `spam`, `junk`, `channel`, `team`, dan `group-chat`.

Karena itu redesign **tidak boleh menghapus navigation model tersebut**. Navigation harus dikembalikan dan dibuat role-aware melalui permission, bukan dengan menghilangkan fitur dari UI.

---

# 2. Source of Truth

Requirement ini menggunakan tiga sumber:

### 2.1 Existing Conversation Detail Drawer prototype

File:

`conversation-detail-drawer.html`

Prototype saat ini sudah memiliki:

- conversation list
- conversation workspace
- right-side detail drawer
- drawer open / close
- pin
- 1280 / 1440 viewport
- compact list behavior
- loaded state
- loading skeleton
- empty state
- SLA section
- assignment
- metadata
- destructive close conversation action

Drawer saat ini menggunakan struktur Customer → SLA → Assignment → Metadata → History / Notes / Log.

### 2.2 UI/UX Review

Review menyimpulkan arah non-modal right-side drawer tetap valid, tetapi terdapat gap yang harus diselesaikan:

- pixel budget
- state persistence
- information hierarchy
- motion
- loading / empty / error states
- accessibility
- action placement
- filter clarity

Untuk 1280×720, review merekomendasikan list otomatis menjadi compact saat drawer terbuka sehingga workspace bertambah dari 576px menjadi 736px.

### 2.3 CLAUDE-fe.md

Frontend reference menunjukkan Conversation saat ini memiliki:

- inbox/channel/team navigation
- chat list
- room CRUD
- detail panel
- SLA metrics
- assignment source
- advanced filters
- bulk actions
- relation labels
- global search
- reassign account channel
- realtime Socket.IO events

Requirement redesign harus mempertahankan capability yang sudah ada dan memvisualisasikan capability tersebut dalam prototype.

---

# 3. Redesign Goals

## 3.1 Primary Goals

Redesign harus menghasilkan prototype yang:

- lengkap secara end-to-end
- dapat digunakan untuk Agent, SPV dan Admin
- tidak kehilangan navigation penting
- memperlihatkan semua major interaction state
- memperlihatkan action flow
- memperlihatkan filtering flow
- memperlihatkan drawer behavior
- dapat menjadi reference langsung untuk implementation FE

## 3.2 Non-goals

Jangan melakukan perubahan backend/API contract hanya untuk kebutuhan prototype.

Jangan menciptakan business rule baru apabila belum didukung oleh existing FE/reference.

Jangan mengarang action baru hanya untuk membuat prototype terlihat lengkap.

Jika sebuah action sudah tersedia di FE tetapi detail label/behavior tidak terdokumentasi pada source, prototype harus menandai action tersebut sebagai **existing FE action — preserve current behavior** dan tidak membuat business rule baru.

---

# 4. Information Architecture

Conversation page harus menggunakan struktur berikut:

```text
Application Navigation
└── Conversation
    ├── Conversation Navigation / Sidenav
    │   ├── Your Inbox
    │   ├── All
    │   ├── Unassigned
    │   ├── Starred
    │   ├── Junk
    │   ├── Spam
    │   ├── Channels
    │   │   └── Channel items
    │   ├── Team Inboxes
    │   │   └── Team inbox items
    │   └── Group Chat
    │
    ├── Conversation List
    │   ├── Search
    │   ├── Status
    │   ├── Channel
    │   ├── Sort
    │   ├── Advanced Filter
    │   └── Conversation Items
    │
    ├── Conversation Workspace
    │   ├── Conversation Header
    │   ├── Message Thread
    │   ├── Composer
    │   └── Conversation Actions
    │
    └── Conversation Detail Drawer
        ├── Customer
        ├── SLA
        ├── Assignment
        ├── Metadata
        ├── History
        ├── Notes
        ├── Logs
        └── Destructive Action
```

---

# 5. Conversation Sidenav — MUST RESTORE

## 5.1 Requirement

Conversation sidenav harus kembali sebagai bagian dari Conversation page.

Jangan menghapus sidenav hanya karena prototype ditujukan untuk Agent.

Sidenav harus mendukung tiga perspective:

| Perspective | Requirement |
|---|---|
| Agent | Fokus pada inbox yang menjadi scope agent |
| SPV | Visibility terhadap inbox/team/channel yang menjadi scope supervisor |
| Admin | Visibility terhadap seluruh conversation scope yang diberikan permission |

Visibility harus mengikuti existing RBAC / permission system.

Frontend reference menyebut `useRolePermission` dan `RolesGuard` sebagai mekanisme RBAC. Gunakan mekanisme tersebut; jangan membuat role-check baru yang terpisah.

## 5.2 Sidenav structure

### Personal

- Your Inbox
- Starred

### Global

- All
- Unassigned

### Classification / quarantine

- Spam
- Junk

### Channels

Expandable section:

```text
Channels
  WhatsApp
  WhatsApp API
  Instagram
  Messenger
  ...
```

Tampilkan hanya channel yang tersedia dan diizinkan oleh permission/scope.

### Team Inboxes

Expandable section:

```text
Team Inboxes
  Support
  Sales
  Customer Success
  ...
```

Tampilkan hanya team inbox yang dapat diakses user.

### Group Chat

Jika tersedia pada current Conversation route, tampilkan sebagai navigation item.

## 5.3 Count badges

Navigation item dapat memiliki unread / pending count.

Rules:

- count harus konsisten dengan actual dataset
- jangan menampilkan badge `0` jika tidak diperlukan
- active item tetap terlihat walaupun count = 0
- badge harus memiliki semantic yang jelas
- jangan mengandalkan warna saja

## 5.4 Active state

Active navigation harus terlihat jelas melalui:

- background
- text/icon state
- optional accent indicator

Tidak boleh hanya menggunakan perubahan warna icon.

## 5.5 Collapse behavior

Sidenav dapat collapse jika diperlukan untuk pixel budget.

Collapsed state:

- icon
- tooltip
- badge
- active indicator

Expanded state:

- icon
- label
- count

Untuk 1280px, conversation sidenav tidak boleh menyebabkan workspace menjadi unusable.

---

# 6. Role-based Prototype

Prototype wajib menyediakan minimal tiga role simulation:

```text
[ Agent ] [ SPV ] [ Admin ]
```

Switch role hanya untuk prototype/demo.

## 6.1 Agent POV

Default experience:

- Your Inbox visible
- Starred visible
- Unassigned sesuai permission
- Channel sesuai scope
- Team Inbox hanya jika memiliki akses
- All hanya jika permission tersedia
- administrative navigation tidak ditampilkan

## 6.2 SPV POV

SPV harus dapat melihat navigation yang dibutuhkan untuk monitoring dan operational management:

- Your Inbox
- All
- Unassigned
- Starred
- Spam
- Junk
- Channel list
- Team Inbox list

SPV harus dapat berpindah antar scope tanpa harus meninggalkan Conversation module.

## 6.3 Admin POV

Admin harus mendapatkan navigation paling lengkap berdasarkan permission:

- Your Inbox
- All
- Unassigned
- Starred
- Spam
- Junk
- seluruh permitted channels
- seluruh permitted team inboxes
- Group Chat jika tersedia

Jangan menyimpulkan bahwa Admin selalu memiliki semua data jika permission system dapat membatasi scope.

---

# 7. Conversation List

## 7.1 Header

Conversation list harus memiliki:

```text
Percakapan

[ Status ▼ ] [ Channel ▼ ]

[ Search................ ] [ Sort ▼ ] [ Filter (N) ]
```

Gunakan nomenclature yang jelas.

Hindari label `Semua` yang ambigu.

Gunakan:

- `Semua Saluran`
- `Filter`
- `Urutkan`

sesuai konteks.

## 7.2 Search

Prototype harus memiliki state:

1. Search idle
2. Search typing
3. Search result
4. Search no result
5. Search loading
6. Search error

Search harus tetap kompatibel dengan existing global search / conversation search capability.

## 7.3 Sort

Prototype minimal harus memperlihatkan dropdown sort.

Contoh existing conceptual states:

- Terbaru
- Terlama

Jangan menambah sorting rule lain jika tidak ada existing behavior.

## 7.4 Filter

Filter harus mempunyai:

### Basic filter

- Status
- Channel
- Assignment / inbox scope

### Advanced filter

Prototype harus menunjukkan UI advanced filter karena FE reference menyatakan advanced filters sudah built.

Jika exact filter fields tidak tersedia di source, tampilkan structure:

```text
Advanced Filters
  Filter group
  Field
  Operator
  Value

[Reset] [Apply]
```

Jangan mengarang field business-specific yang belum didukung.

## 7.5 Active filter indicator

Jika filter aktif:

```text
Filter (2)
```

Jika tidak:

```text
Filter
```

Jumlah harus merepresentasikan jumlah filter aktif.

## 7.6 Conversation item

Minimal:

```text
Avatar
Customer name
Last message
Timestamp
Unread count
SLA indicator
Channel indicator
```

SLA tidak boleh hanya menggunakan warna.

Gunakan text/tooltip/semantic state ketika diperlukan.

---

# 8. Conversation List States

Prototype WAJIB memiliki semua state berikut.

## 8.1 Loading

```text
Conversation
─────────────
████████████
████████
████████████
...
```

Gunakan skeleton.

Jangan menggunakan blank panel sebagai loading state.

## 8.2 Empty — no conversation

```text
No conversations

There are no conversations in this view.
```

Jika scope belum dipilih:

```text
Select a conversation
to view the conversation.
```

## 8.3 Empty — filtered

```text
No conversations match your filters.

[Clear filters]
```

## 8.4 Search no result

```text
No results found

Try another keyword.
```

## 8.5 Error

```text
Unable to load conversations.

[Retry]
```

## 8.6 Loaded

Normal populated list.

---

# 9. Open Conversation State

Ketika user memilih conversation:

```text
Conversation List
       +
Conversation Workspace
       +
Optional Detail Drawer
```

Selected item harus jelas.

Workspace header minimal menampilkan:

- avatar
- customer name
- contact identifier
- channel
- conversation status
- primary actions
- detail drawer toggle
- overflow action

Existing prototype menunjukkan action:

- Alihkan
- Transfer
- Selesaikan
- Detail Drawer toggle
- More

Pertahankan existing actions dan current behavior.

---

# 10. No Selected Conversation State

Saat tidak ada conversation yang dipilih:

Workspace harus memiliki empty state.

```text
┌─────────────────────────────────────┐
│                                     │
│          Select a conversation      │
│                                     │
│   Choose a conversation from the    │
│   list to start working.            │
│                                     │
└─────────────────────────────────────┘
```

Detail drawer tidak boleh menampilkan detail customer yang stale.

---

# 11. Conversation Workspace States

Prototype wajib menyediakan:

1. No selected conversation
2. Loading conversation
3. Loaded conversation
4. Message loading
5. Sending message
6. Send success
7. Send error
8. Realtime incoming message
9. Realtime conversation update
10. Error / retry

Realtime behavior harus mempertahankan existing Socket.IO conversation events.

---

# 12. Message Thread

Prototype tidak perlu membuat seluruh fitur messaging baru.

Namun harus memperlihatkan:

- inbound message
- outbound message
- timestamp
- message grouping
- scroll state
- unread/new message state
- loading older messages jika applicable
- message action affordance jika existing FE memilikinya

## New message while reading

Ketika pesan baru masuk:

- conversation list unread state update
- workspace menerima message realtime
- jangan memaksa scroll jika user sedang membaca pesan lama
- tampilkan affordance `New messages` jika user tidak berada di bottom
- jika user berada di bottom, scroll mengikuti latest message

---

# 13. Composer States

Prototype minimal:

### Empty

```text
Ketik balasan...
[attachment] [Send]
```

### Typing

Input terisi.

### Sending

Send button disabled/loading.

### Success

Message muncul pada thread.

### Error

Message menunjukkan failed state dan retry affordance sesuai existing behavior.

### Offline

Gunakan behavior existing offline message buffer.

Jangan membuat offline business rule baru.

---

# 14. Conversation Action System

## 14.1 Prinsip

Semua action yang tersedia di Conversation harus mempunyai prototype interaction.

Jangan hanya membuat button statis.

Setiap action harus memiliki minimal:

```text
Default
→ Hover
→ Open / interaction
→ Confirmation jika diperlukan
→ Loading
→ Success
→ Error
```

## 14.2 Existing action inventory

Prototype harus mencakup action yang terlihat pada current artifact dan capability yang tercatat pada FE reference, termasuk:

- Alihkan
- Transfer
- Selesaikan / Tutup Percakapan
- Drawer open / close
- Pin drawer
- Reassign account channel
- Bulk actions
- Advanced filtering
- Relation label interaction
- Existing overflow actions

Exact labels dan business behavior harus mengikuti implementation saat ini.

## 14.3 More / Overflow menu

Overflow menu harus dibuat sebagai prototype nyata.

Struktur:

```text
More
──────
[existing conversation action]
[existing conversation action]
[existing conversation action]
────────────
[existing destructive action]
```

Jangan mengarang menu item baru.

Action yang belum dapat diverifikasi dari source harus diberi placeholder implementation requirement, bukan fake behavior.

---

# 15. Assignment Actions

Assignment-related interaction harus dapat diprototype.

Minimum interaction model:

```text
Current assignment
      ↓
Open assignment control
      ↓
Select target
      ↓
Confirm / Apply
      ↓
Loading
      ↓
Success
```

Harus mendukung konteks:

- agent
- team inbox
- assignment source

FE reference menyebut assignment source sudah tersedia:

- manual
- self-pull
- system
- bulk

Prototype detail assignment harus menyediakan tempat untuk informasi tersebut jika data tersedia.

---

# 16. Transfer / Alihkan

Prototype action:

```text
[Transfer]
      ↓
Transfer dialog/popover
      ↓
Select destination
      ↓
[Cancel] [Transfer]
      ↓
Loading
      ↓
Success / Error
```

Jangan membuat transfer menjadi destructive action.

Confirmation hanya digunakan jika current implementation membutuhkan confirmation.

---

# 17. Resolve / Close Conversation

Action ini bersifat destructive / state-changing.

Requirement:

- jangan ditempatkan berdekatan dengan drawer close `×`
- gunakan secondary/destructive styling sesuai current design system
- confirmation menggunakan existing `@satuinbox/ui` AlertDialog pattern
- tidak ada keyboard shortcut khusus untuk destructive action

Flow:

```text
[Selesaikan]
      ↓
Confirmation Dialog
      ↓
Cancel / Confirm
      ↓
Loading
      ↓
Success
      ↓
Conversation list updates
      ↓
Workspace updates / next conversation behavior
```

---

# 18. Bulk Actions

FE reference menyatakan bulk actions sudah built.

Karena itu prototype harus mempunyai:

## Selection state

```text
☐ Conversation
☐ Conversation
☐ Conversation
```

Saat selection > 0:

```text
3 selected

[existing bulk action]
[existing bulk action]
[existing bulk action]
```

## States

- no selection
- one selected
- multiple selected
- select all
- partially selected
- bulk action menu open
- confirmation
- processing
- partial success
- success
- error

Exact bulk action list harus mengikuti current implementation.

Jangan menciptakan bulk action yang tidak ada.

---

# 19. Relation Labels

FE reference menyatakan relation labels sudah tersedia pada Conversation.

Prototype harus menunjukkan interaction untuk:

- existing relation label display
- add/apply jika tersedia
- unlink/remove
- long label behavior
- loading
- success
- error

Untuk bulk relation-label interaction, gunakan behavior yang sudah tersedia di FE.

---

# 20. Conversation Detail Drawer

## 20.1 Drawer model

Gunakan **non-modal right-side drawer**.

Drawer:

- tidak menggunakan backdrop pada desktop
- tidak memblok workspace
- dapat dibuka/tutup
- memiliki Pin
- tetap berada di kanan
- content berubah ketika conversation berubah

## 20.2 Width

Target:

```text
Drawer: 360px
```

Acceptable range:

```text
320–380px
```

## 20.3 1280px

Saat drawer open pada 1280px:

```text
Nav         64px
Conversation list 120px compact
Workspace   736px
Drawer      360px
```

List harus auto-compact pada target 1280px.

## 20.4 1440px+

Pada 1440px:

- conversation list tetap full
- drawer 360px
- workspace mendapatkan ruang lebih besar
- tidak perlu compact list

## 20.5 1024–1279px

Gunakan drawer full-width overlay sesuai review.

## 20.6 <1024px

Bottom sheet dapat ditandai sebagai future/out-of-scope state.

---

# 21. Drawer Information Hierarchy

Gunakan urutan:

```text
DETAIL PERCAKAPAN

Conversation ID

CUSTOMER
  Name
  Contact
  Channel
  Status

SLA
  FRT
  TTC
  RLT
  Wait time jika tersedia

ASSIGNMENT
  Team Inbox
  Assignee
  Assignment source

METADATA
  Source
  Account
  Created

LAINNYA
  History
  Notes
  Logs
```

Customer + SLA harus berada di atas Assignment karena keduanya merupakan decision input untuk triage.

---

# 22. Drawer States

Prototype wajib memiliki:

1. Closed
2. Open + loaded
3. Open + loading
4. Open + empty
5. Open + error
6. Open + pinned
7. Open + unpinned
8. Open → switch conversation
9. Open → data refresh
10. Open → action in progress

## Loading

Gunakan skeleton.

Minimal section:

- Customer
- SLA
- Assignment

## Empty

Gunakan:

```text
Select a conversation
to view details.
```

## Error

```text
Unable to load conversation details.

[Retry]
```

---

# 23. Drawer Pin Behavior

Pin berarti:

> drawer tetap terbuka ketika user berpindah conversation.

Rules:

- pin state persist di client layout state
- pin bukan per-conversation
- pindah conversation → drawer tetap open
- content drawer berubah sesuai conversation baru
- unpin tidak langsung menutup drawer
- setelah unpin, conversation berikutnya mengikuti default open/close behavior

Persist:

```text
Zustand conversation/layout
+
localStorage persist
```

---

# 24. Drawer Open / Close Interaction

Trigger utama:

```text
Conversation Header → Panel Right button
```

Close:

- close button
- Escape jika tidak pinned
- click outside hanya pada responsive overlay mode jika diperlukan

Keyboard:

```text
Escape → close
Ctrl+Shift+D → toggle
```

Focus:

```text
Open → focus close button
Close → return focus to trigger
```

Reduced motion:

```text
prefers-reduced-motion
→ instant show/hide
```

Animation:

```text
Open: 200ms
Close: 150ms
Easing: cubic-bezier(0.2, 0, 0, 1)
Transform: translateX(100%) → translateX(0)
```

---

# 25. Drawer Actions

Drawer header:

```text
Detail Percakapan                  [Pin] [×]
CV-XXXX                            [Copy]
```

Pin dan Close harus memiliki semantic separation.

Target:

- visual icon 16×16
- button visual 32×32
- hit area 44×44
- gap semantic minimal 16px

Destructive action tidak boleh berada dekat dengan drawer close.

---

# 26. SLA

SLA harus memperlihatkan semantic state.

Metrics yang tersedia:

- FRT
- TTC
- RLT
- wait time jika available

Setiap SLA state harus memiliki:

```text
Metric
Value
State label
```

Contoh:

```text
FRT   12m 40s   Approaching
TTC   2h 15m    On track
RLT   45m       On track
```

Jangan menggunakan warna sebagai satu-satunya indicator.

Tooltip harus menjelaskan:

- nama metric
- arti metric
- target SLA jika tersedia

---

# 27. Filtering UX

Filtering harus diprototype sebagai full interaction, bukan hanya button.

Flow:

```text
Click Filter
   ↓
Filter Popover / Panel
   ↓
Select filter
   ↓
Filter chip/value appears
   ↓
Apply
   ↓
Loading
   ↓
Updated list
```

States:

- no filter
- one filter
- multiple filters
- active filter count
- filter panel open
- reset
- apply loading
- no result
- error

Filter state yang shareable harus mengikuti frontend rule bahwa URL params digunakan untuk shareable state.

Client UI state dapat tetap berada di Zustand sesuai existing architecture.

---

# 28. Navigation + Filtering Interaction

Saat user berpindah:

```text
Your Inbox
→ All
→ Team Inbox
→ Channel
```

Filter behavior harus eksplisit.

Prototype harus menunjukkan apakah:

- filter tetap dipertahankan
- filter reset
- filter scoped ke navigation

Jangan membuat assumption baru.

Gunakan behavior current implementation sebagai source of truth.

Jika behavior belum dapat diverifikasi, beri state sebagai **design decision required** dan jangan hard-code behavior pada prototype.

---

# 29. URL / State Ownership

Ikuti frontend architecture:

### URL params

Gunakan untuk shareable state:

- filter
- pagination
- sort
- tabs
- search

### Zustand

Gunakan untuk client/UI state:

- selection
- drafts
- drawer layout
- local interaction state

### React Query

Gunakan untuk server state:

- conversation detail
- dynamic conversation data
- server mutations
- pagination/infinite query

### Socket.IO

Gunakan untuk realtime:

- message
- send-message
- typing
- read
- delivered
- conversation-updated

---

# 30. Responsive Requirements

## 1440+

```text
Nav | Sidenav | List | Workspace | Drawer
```

Full experience.

## 1280

```text
Nav | Compact List | Workspace | Drawer
```

Drawer open → list compact.

## 1024–1279

Drawer becomes full-width overlay.

Conversation workspace remains available behind drawer.

## <1024

Mobile bottom sheet can be marked:

`Future / Out of scope v1`

---

# 31. Accessibility

Required:

- keyboard navigable
- visible focus state
- Escape handling
- focus restoration
- semantic buttons
- tooltip for icon-only controls
- minimum 24×24 target
- recommended 44×44 hit area
- color must not be sole state indicator
- reduced motion support
- adequate contrast
- screen-reader accessible labels

Icon-only buttons must have accessible names.

---

# 32. Dark Mode

Prototype should use semantic design tokens.

Do not hard-code light-mode-only colors.

SLA states must remain distinguishable in dark mode.

---

# 33. Internationalisation

All user-facing text must be compatible with existing i18n.

Frontend reference states:

- locales: `en`, `id`
- user-facing strings must exist in both translation files
- hardcoded UI text is blocked by lint

Therefore prototype copy should use localization-ready keys/structure.

---

# 34. Prototype Control Panel

Untuk memudahkan review, prototype harus memiliki a design/testing control bar.

Minimum controls:

```text
Role:
[Agent] [SPV] [Admin]

Navigation:
[Your Inbox]
[All]
[Unassigned]
[Channel]
[Team]

Conversation:
[No Selection]
[Loading]
[Loaded]
[Error]

Drawer:
[Closed]
[Open]
[Pinned]

List:
[Loaded]
[Loading]
[Empty]
[No Result]
[Error]

Viewport:
[1280]
[1440]

Filter:
[None]
[Active]
[No Result]

Action:
[Default]
[Menu Open]
[Confirm]
[Loading]
[Success]
[Error]
```

Control panel hanya untuk prototype/demo dan tidak boleh menjadi bagian dari production UI.

---

# 35. Required Prototype Screens / States

Prototype dianggap belum lengkap jika state berikut belum tersedia.

## Navigation

- [ ] Agent navigation
- [ ] SPV navigation
- [ ] Admin navigation
- [ ] Expanded sidenav
- [ ] Collapsed sidenav
- [ ] Active navigation
- [ ] Badge count
- [ ] Channel list expanded
- [ ] Team inbox list expanded

## Conversation List

- [ ] Loaded
- [ ] Loading
- [ ] Empty
- [ ] Empty due to filter
- [ ] Search
- [ ] Search loading
- [ ] Search no result
- [ ] Search error
- [ ] Filter closed
- [ ] Filter open
- [ ] Filter active
- [ ] Sort menu open
- [ ] Single selection
- [ ] Multi selection
- [ ] Bulk action menu

## Workspace

- [ ] No selected conversation
- [ ] Loading
- [ ] Loaded
- [ ] Incoming message
- [ ] New message while scrolled up
- [ ] Composer typing
- [ ] Sending
- [ ] Send error
- [ ] Offline
- [ ] Conversation action menu

## Drawer

- [ ] Closed
- [ ] Open
- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Pinned
- [ ] Unpinned
- [ ] Switching conversation
- [ ] Action loading
- [ ] Action success
- [ ] Action error

## Actions

- [ ] Alihkan
- [ ] Transfer
- [ ] Selesaikan
- [ ] More / overflow
- [ ] Assignment interaction
- [ ] Existing bulk actions
- [ ] Existing relation-label actions
- [ ] Existing account-channel reassignment

Exact action behavior must match current FE implementation.

---

# 36. Acceptance Criteria

## AC-01 — Navigation

Given user opens Conversation page,  
when user has sufficient permission,  
then Conversation sidenav must be visible.

The sidenav must not disappear merely because the current prototype is optimized for Agent.

## AC-02 — Role-aware navigation

Given Agent / SPV / Admin role,  
when role changes,  
then navigation visibility follows permission/scope.

## AC-03 — SPV/Admin usability

Given SPV or Admin,  
when they open Conversation,  
then they can navigate between permitted:

- inbox
- all
- unassigned
- channel
- team inbox

without leaving Conversation.

## AC-04 — Complete states

Every major component must have:

- loading
- empty
- error
- loaded

where applicable.

## AC-05 — Open conversation

Given conversation selected,  
then workspace displays conversation content and actions.

## AC-06 — Drawer

Given conversation selected,  
when drawer toggle is clicked,  
then drawer opens without modal backdrop on desktop.

## AC-07 — Drawer responsive

At 1280px:

```text
list = 120px compact
drawer = 360px
workspace = 736px
```

At 1440px:

```text
list = full
drawer = 360px
```

## AC-08 — Drawer persistence

Given drawer is pinned,  
when user switches conversation,  
then drawer remains open and updates its content.

## AC-09 — Filtering

Given user opens Filter,  
then filter interaction can be completed through:

```text
open → select → apply → loading → result
```

## AC-10 — Actions

Every visible major action must have a corresponding prototype state.

A static button is not considered a completed prototype.

## AC-11 — Destructive action

Resolve/Close must use confirmation and must not be placed next to drawer close.

## AC-12 — Realtime

Incoming message / conversation update must be represented in the prototype.

## AC-13 — Accessibility

Keyboard and focus behavior must be represented for drawer and major interactive controls.

## AC-14 — Implementation alignment

The prototype must not invent backend capability or business behavior that is absent from the current FE/reference.

---

# 37. Design QA Checklist

Before handing the prototype to implementation, verify:

### Layout

- [ ] Sidenav exists
- [ ] Sidenav works for Agent
- [ ] Sidenav works for SPV
- [ ] Sidenav works for Admin
- [ ] 1280px pixel budget works
- [ ] 1440px layout works
- [ ] Drawer does not make workspace unusable

### Navigation

- [ ] Your Inbox
- [ ] All
- [ ] Unassigned
- [ ] Starred
- [ ] Junk
- [ ] Spam
- [ ] Channel list
- [ ] Team inbox list
- [ ] Group Chat where applicable

### List

- [ ] Search
- [ ] Sort
- [ ] Filter
- [ ] Active filter count
- [ ] Loading
- [ ] Empty
- [ ] No result
- [ ] Error

### Workspace

- [ ] Empty
- [ ] Loading
- [ ] Loaded
- [ ] Realtime
- [ ] Composer
- [ ] Action menu
- [ ] Bulk selection

### Drawer

- [ ] Open
- [ ] Close
- [ ] Pin
- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Customer
- [ ] SLA
- [ ] Assignment
- [ ] Metadata
- [ ] History
- [ ] Notes
- [ ] Logs

### Actions

- [ ] Alihkan
- [ ] Transfer
- [ ] Selesaikan
- [ ] Overflow
- [ ] Assignment
- [ ] Bulk
- [ ] Relation labels
- [ ] Account/channel reassignment

### Accessibility

- [ ] Keyboard
- [ ] Focus
- [ ] Escape
- [ ] Reduced motion
- [ ] Target size
- [ ] Semantic labels
- [ ] Color-independent status

---

# 38. Technical Alignment Notes

Implementation should remain aligned with the current frontend architecture.

Do not introduce a parallel state architecture.

Expected alignment:

```text
Conversation page
├── Existing conversation components
├── Existing conversation stores
├── Existing React Query services
├── Existing Socket.IO providers
├── Existing @satuinbox/ui components
├── Existing RBAC / RolesGuard
└── Existing i18n
```

The FE reference specifies:

- Server Components by default
- React Query for server state
- Zustand for client/UI state
- URL params for shareable state
- Axios/session flow for API calls
- next-intl for user-visible strings
- feature co-location
- Motion already installed

Do not install a new UI/animation library for this redesign.

---

# 39. Performance Requirements

Drawer layout state should remain isolated from conversation data state.

Recommended:

```text
conversation/layout
  ├── drawerOpen
  ├── drawerPinned
  └── listLayout
```

Conversation detail data should remain server state.

Expected query concept:

```text
conversation + conversationId + detail
```

Do not put server data into Zustand merely to control drawer rendering.

Conversation list should retain virtualization behavior.

---

# 40. Prototype Deliverable

The final prototype must be a **functional interactive prototype**, not a static visual mockup.

Minimum interaction expectation:

```text
Role switch
    ↓
Navigation switch
    ↓
Conversation list changes
    ↓
Select conversation
    ↓
Workspace opens
    ↓
Actions can be opened
    ↓
Filter can be opened/applied
    ↓
Drawer can open/close/pin
    ↓
Conversation can be switched
    ↓
Loading / empty / error states can be demonstrated
```

The prototype should allow a reviewer to understand the complete Conversation journey without needing to imagine missing states.

---

# 41. Final Design Principle

The redesign is **not a drawer redesign only**.

The target is:

> **A complete role-aware Conversation workspace where navigation, list, workspace, drawer, filtering, actions and system states work as one coherent user journey.**

The right-side drawer remains an important part of the redesign, but it must not remove or visually replace the Conversation navigation required by SPV and Admin users.

The prototype must prioritize:

1. **Navigation clarity**
2. **Role-aware visibility**
3. **Conversation triage**
4. **Fast agent workflow**
5. **Complete interaction states**
6. **Action discoverability**
7. **Responsive pixel budget**
8. **Accessibility**
9. **Implementation alignment**
10. **No invented business behavior**
