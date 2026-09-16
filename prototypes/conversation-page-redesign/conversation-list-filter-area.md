# Conversation List Filter Area

> **Version:** Latest requirement
> **Scope:** Filter/control area pada Conversation List
> **Target area:** 400 × 110 px
> **Primary focus:** Search, Open/Close, Read/Unread/All, Sort

## 1. Objective

Redesign area filter Conversation List agar fungsi yang paling sering digunakan tetap cepat diakses dalam ruang 400 × 110 px.

Prioritas:
1. Search
2. Open / Close
3. All / Read / Unread
4. Sort

Advanced Filter dan Visibility Configuration adalah secondary controls dan tidak boleh mengambil ruang utama dari empat fungsi tersebut.

## 2. Latest Approved Layout

Gunakan Search pada row pertama, kemudian **Open/Close → All/Read/Unread → Sort dalam satu baris horizontal** pada row kedua.

```text
┌──────────────────────────────────────────┐
│ 🔍  Kotak Pesan Anda                  🔎 │
├──────────────────────────────────────────┤
│ [ 🚪 ▼ ]   [ 💬 ▼ ]   [ ⇵ ▼ ]            │
└──────────────────────────────────────────┘
```

Meaning:
- `[ 🚪 ▼ ]` = Open / Close
- `[ 💬 ▼ ]` = All / Read / Unread
- `[ ⇵ ▼ ]` = Sort

Jangan memasukkan Sorting ke row utama yang sama dengan Search apabila hal tersebut membuat Search terlalu sempit.

## 3. Search

### Placement
Search berada pada row pertama dan menggunakan sebagian besar lebar area.

```text
[ 🔍  Kotak Pesan Anda                         ]
```

### Icon
- Gunakan existing Search icon.
- Visual icon sekitar 16–18 px.
- Icon di sisi kiri input.
- Input full available width.
- Placeholder: `Kotak Pesan Anda`.

### States
Prototype wajib menyediakan:
- Empty
- Focus
- Typing
- Search result
- No result
- Loading
- Error

Search biasa tidak membuka modal.

## 4. Filter 1 — Open / Close

### Purpose
Filter berdasarkan status:
- Terbuka
- Tertutup

### Button
Gunakan icon-first / icon-only visual dengan chevron.

```text
[ Open icon ▼ ]
```

### Open icon
Gunakan Flaticon `open-enrollment_11284500` sebagai visual reference.

### Close icon
Buat counterpart dari Open icon dengan semantic closed state:
- Open = pintu/enrollment terbuka
- Close = pintu/enrollment tertutup

Close harus terlihat sebagai pasangan visual Open, bukan icon yang tidak berhubungan.

### Dropdown

```text
┌─────────────────────┐
│ 🚪 Terbuka      ✓   │
│ 🚪 Tertutup         │
└─────────────────────┘
```

Jika count tersedia:

```text
Terbuka      (29)
Tertutup     (164)
```

Count harus berasal dari data aktual.

### Selected state
- subtle active background
- accent icon/text
- checkmark di kanan
- tidak hanya mengandalkan warna

### Tooltip
Karena control icon-first/icon-only, hover/focus harus menampilkan:
`Open / Close`
atau selected state (`Terbuka` / `Tertutup`).

## 5. Filter 2 — All / Read / Unread

### Purpose
Filter read state:
- Semua
- Sudah dibaca
- Belum dibaca

### Icon mapping
- All: Flaticon `message_14224560`
- Read: Flaticon `message_6741194`
- Unread: Flaticon `chat_10322133`

Gunakan satu visual family.

### Button

```text
[ 💬 ▼ ]
```

Selected option boleh mengganti icon utama sesuai state.

### Dropdown

```text
┌──────────────────────────┐
│ 💬 Semua             ✓   │
│ ☑  Sudah dibaca          │
│ 💬• Belum dibaca         │
└──────────────────────────┘
```

Jika count tersedia:

```text
Semua
Belum dibaca       (6)
Sudah dibaca       (23)
```

Urutan dan terminology mengikuti UI existing.

### Selected state
Gunakan:
- accent background
- selected icon
- checkmark
- readable label

Unread boleh memiliki small dot/badge pada icon, tetapi badge bukan satu-satunya penjelas fungsi.

### Tooltip
Icon-only/icon-first control wajib memiliki tooltip.

## 6. Filter 3 — Sort

### Purpose
Mengatur urutan conversation.

Required:
- Terbaru
- Terlama

### Icon mapping
- Terbaru: Flaticon `sort_10407118`
- Terlama: Flaticon `sort_10407117`

Gunakan dua visual direction yang konsisten.

### Button

```text
[ ⇵ ▼ ]
```

### Dropdown

```text
┌─────────────────────┐
│ ↓ Terbaru       ✓   │
│ ↑ Terlama           │
└─────────────────────┘
```

### Selected state
- accent background
- selected sort icon
- checkmark

### Tooltip
`Urutkan` atau selected value (`Terbaru` / `Terlama`).

## 7. Main Filter Bar

Final structure:

```text
ROW 1
┌──────────────────────────────────────────┐
│ 🔍  Kotak Pesan Anda                     │
└──────────────────────────────────────────┘

ROW 2
┌────────────┐  ┌────────────┐  ┌─────────┐
│ 🚪 Open ▼  │  │ 💬 All ▼   │  │ ⇵ Sort ▼│
└────────────┘  └────────────┘  └─────────┘
```

Filter utama wajib berada pada **satu baris horizontal**.

Urutan kiri → kanan wajib:
**Open/Close → All/Read/Unread → Sort**.

## 8. 400 × 110 px Constraint

Target:
- Width = 400 px
- Height = 110 px

Recommended vertical budget:
- Search row: ±40 px
- Gap: ±6–8 px
- Filter row: ±36–40 px
- Sisakan outer padding dan ruang untuk variasi environment.

Jangan membuat controls lebih tinggi dari kebutuhan.

## 9. Width Distribution

Recommended approximate distribution pada row filter:
- Open/Close: 30–35%
- All/Read/Unread: 35–40%
- Sort: 25–30%

Contoh:
- Open/Close ≈ 105 px
- All/Read/Unread ≈ 130 px
- Sort ≈ 95 px
- Gap ≈ 8 px

Jika ruang semakin terbatas, prioritaskan:
1. Icon
2. Active-state indicator
3. Chevron
4. Label hanya jika masih memungkinkan

## 10. Icon-only Strategy

Default presentation adalah **icon + chevron**, tanpa persistent text label.

Alasan:
- area sangat terbatas
- tiga fungsi sering digunakan
- lebih compact
- dropdown tetap menyediakan full label

Jika usability test menunjukkan icon tidak cukup recognizable, gunakan compact selected label:

```text
[ Terbuka ▼ ] [ Semua ▼ ] [ Terbaru ▼ ]
```

Jangan gunakan label panjang.

## 11. Discoverability

Icon-first UI harus memiliki:
- Tooltip pada hover/focus
- Full text label di dropdown
- Active background
- Checkmark

Tujuannya agar first-time user tidak harus menebak arti icon.

## 12. Advanced Filter

Advanced Filter tetap berada di luar tiga primary controls.

Existing advanced filters:
- Agent
- Tag
- Relasi

Trigger menggunakan filter icon / existing filter control.

Flow:

```text
[ Filter icon ]
      ↓
Filter Lanjutan

Agent
[ Filter berdasarkan Agen ]

Tag
[ Filter berdasarkan Tag ]

Relasi
[ Filter berdasarkan Relasi ]

[Reset] [Terapkan]
```

Advanced filter tidak boleh mengambil permanent space dari Open/Close, All/Read/Unread, dan Sort.

## 13. Visibility Configuration

Visibility configuration seperti:
- Tampilkan Lencana WhatsApp Web
- Tampilkan Tag

tetap berada pada configuration/settings interaction.

Gunakan existing visibility/settings icon.

Jangan mencampurkan visibility settings dengan filter state.

## 14. Active Advanced Filter Indicator

Jika advanced filter aktif, filter trigger harus memiliki active indicator:

```text
[ Filter 🔵 ]
```

atau:

```text
[ Filter • ]
```

Jika summary digunakan:

```text
3 filter aktif  >
```

Summary tidak boleh menggantikan tiga primary filters.

## 15. Dropdown Behavior

Semua dropdown harus konsisten:

```text
Click
 ↓
Open
 ↓
Select
 ↓
Close
 ↓
List updates
```

Keyboard:
- Enter / Space → open
- Arrow Up / Down → navigate
- Enter → select
- Escape → close

Click outside → close.

Dropdown harus flip ke atas jika ruang bawah tidak mencukupi dan tidak boleh terpotong viewport/container.

## 16. Loading / Empty / Error / No Result

Filter bar tetap visible pada semua state.

### Loading
Search dan filter tetap terlihat; conversation list menggunakan skeleton.

### Empty
```text
[ Search ]
[ Open/Close ▼ ] [ All/Read/Unread ▼ ] [ Sort ▼ ]

No conversations
```

### No Result
```text
No conversations match your filters.
[Clear filters]
```

Filter aktif tetap terlihat.

### Error
```text
Unable to load conversations.
[Retry]
```

Jangan menghilangkan filter controls saat request gagal.

## 17. Interaction Priority

### P0
- Search
- Open/Close
- All/Read/Unread

### P1
- Sort
- Advanced Filter

### P2
- Visibility Configuration

P0 tidak boleh dikorbankan untuk P1/P2.

## 18. Accessibility

Icon-only controls wajib memiliki:
- accessible name
- tooltip
- keyboard focus
- visible focus state
- minimum 24 × 24 px target
- recommended 40–44 px hit area jika memungkinkan

Active state tidak boleh hanya dibedakan dengan warna.

Dropdown harus keyboard accessible.

## 19. Visual Consistency

Gunakan visual language Conversation page yang sudah ada:
- rounded controls
- subtle border
- compact height
- consistent icon stroke/weight
- consistent chevron
- consistent active background
- existing design tokens

Semua icon Open, Close, All, Read, Unread dan Sort harus terlihat sebagai satu icon family.

## 20. Icon Reference Mapping

| Function | Reference | Usage |
|---|---|---|
| Open | Flaticon `open-enrollment_11284500` | Open conversation |
| Close | Custom counterpart dari Open | Closed conversation |
| All | Flaticon `message_14224560` | All |
| Read | Flaticon `message_6741194` | Read |
| Unread | Flaticon `chat_10322133` | Unread |
| Sort Newest | Flaticon `sort_10407118` | Terbaru |
| Sort Oldest | Flaticon `sort_10407117` | Terlama |

References adalah visual direction; implementation harus tetap memperhatikan license/asset constraints.

## 21. Recommended Final Layout

```text
┌──────────────────────────────────────────┐
│ 🔍  Kotak Pesan Anda                  🔎 │
├──────────────────────────────────────────┤
│ [ 🚪 ▼ ]    [ 💬 ▼ ]    [ ⇵ ▼ ]          │
└──────────────────────────────────────────┘
```

Semantics:

```text
🚪 = Open / Close
💬 = All / Read / Unread
⇵  = Sort
```

Advanced filter dan visibility berada di secondary interaction.

## 22. Recommendation

**Rekomendasi final: icon-first, primary filters satu baris.**

Alasan:
1. Constraint hanya 400 × 110 px.
2. Search membutuhkan lebar terbesar.
3. Open/Close dan Read/Unread/All adalah fungsi paling sering digunakan.
4. Sort penting tetapi frekuensinya lebih rendah.
5. Icon-only menghemat ruang horizontal.
6. Dropdown tetap memberikan full label sehingga discoverability tidak hilang.
7. Advanced Filter tidak mengganggu workflow utama.
8. Visibility configuration tetap terpisah.
9. Layout tidak menambah permanent controls yang mengganggu tiga fungsi P0.

Final hierarchy:

```text
SEARCH
  ↓
OPEN / CLOSE
  ↓
ALL / READ / UNREAD
  ↓
SORT
  ↓
ADVANCED FILTER
  ↓
VISIBILITY CONFIGURATION
```

UX principle:

> Frequently used = always visible.
> Less frequently used = one click away.
> Configuration = outside the primary filter workflow.

## 23. Prototype Acceptance Criteria

- [ ] Search berada di row pertama.
- [ ] Open/Close, All/Read/Unread, Sort berada pada **1 row**.
- [ ] Urutan wajib: Open/Close → All/Read/Unread → Sort.
- [ ] Open/Close menggunakan icon-first/icon-only + chevron.
- [ ] All/Read/Unread menggunakan icon-first/icon-only + chevron.
- [ ] Sort menggunakan icon-first/icon-only + chevron.
- [ ] Dropdown Open/Close: Terbuka, Tertutup.
- [ ] Dropdown Read state: Semua, Sudah dibaca, Belum dibaca.
- [ ] Dropdown Sort: Terbaru, Terlama.
- [ ] Selected state menggunakan accent + checkmark.
- [ ] Tooltip tersedia untuk icon-only controls.
- [ ] Advanced Filter tidak mengambil permanent space dari primary filters.
- [ ] Visibility configuration tetap terpisah.
- [ ] Layout bekerja pada constraint 400 × 110 px.
- [ ] Loading state mempertahankan filter bar.
- [ ] Empty state mempertahankan filter bar.
- [ ] Error state mempertahankan filter bar.
- [ ] No-result state mempertahankan filter bar.
- [ ] Keyboard navigation tersedia.
- [ ] Icon family konsisten.
- [ ] Tidak ada primary filter tambahan yang menggeser Open/Close → Read state → Sort.


# 30. Responsive Filter Presentation — Icon Version vs Expanded Version

Filter area memiliki **dua presentation mode** berdasarkan viewport.

```text
Viewport < 1280px
        ↓
Existing compact behavior / responsive adaptation

Viewport ≥ 1280px
        ↓
ICON VERSION

Viewport ≥ 1440px
        ↓
EXPANDED VERSION
```

> **Important:** `1440px` menggunakan Expanded Version, bukan Icon Version.  
> `1280px–1439px` menggunakan Icon Version.

Tujuan responsive behavior adalah memanfaatkan ruang tambahan secara progressive tanpa mengubah hierarchy/filter logic.

---

## 30.1 Presentation Matrix

| Viewport | Presentation | Primary UI |
|---|---|---|
| `< 1280px` | Compact / responsive | Follow existing compact behavior |
| `1280–1439px` | **Icon Version** | Search + icon controls |
| `≥ 1440px` | **Expanded Version** | Search + labeled controls |

Filter logic tetap sama pada kedua mode:

```text
Open / Close
        ↓
All / Read / Unread
        ↓
Sort
        ↓
Advanced Filter
        ↓
Visibility
```

Yang berubah hanya **presentation dan information density**.

---

# 31. Icon Version — Minimum 1280px

## 31.1 Purpose

Icon Version digunakan ketika viewport sudah cukup besar untuk memberikan ruang horizontal yang lebih baik dibanding compact mode, tetapi belum cukup besar untuk expanded labels.

Target:

```text
1280px ≤ viewport < 1440px
```

## 31.2 Layout

```text
┌──────────────────────────────────────────┐
│ 🔍  Kotak Pesan Anda                     │
├──────────────────────────────────────────┤
│ [ 🚪 ▼ ]   [ 💬 ▼ ]   [ ⇵ ▼ ]            │
└──────────────────────────────────────────┘
```

### Order

Wajib:

```text
Open / Close
→ All / Read / Unread
→ Sort
```

Search tetap berada pada row pertama.

## 31.3 Icon Controls

### Open / Close

Button menampilkan icon Open/Close + chevron.

```text
[ 🚪 ▼ ]
```

Dropdown:

```text
┌─────────────────────┐
│ 🚪 Terbuka      ✓   │
│ 🚪 Tertutup         │
└─────────────────────┘
```

### All / Read / Unread

```text
[ 💬 ▼ ]
```

Dropdown:

```text
┌──────────────────────────┐
│ 💬 Semua             ✓   │
│ ☑  Sudah dibaca          │
│ 💬• Belum dibaca         │
└──────────────────────────┘
```

### Sort

```text
[ ⇵ ▼ ]
```

Dropdown:

```text
┌─────────────────────┐
│ ↓ Terbaru       ✓   │
│ ↑ Terlama           │
└─────────────────────┘
```

## 31.4 Icon Reference

| Function | Icon |
|---|---|
| Open | `open-enrollment_11284500` visual reference |
| Close | Custom counterpart of Open |
| All | `message_14224560` |
| Read | `message_6741194` |
| Unread | `chat_10322133` |
| Sort Newest | `sort_10407118` |
| Sort Oldest | `sort_10407117` |

## 31.5 Icon Version Interaction

Icon button wajib memiliki:

- tooltip
- accessible name
- chevron
- selected state
- focus state

Tooltip:

```text
Open / Close
All / Read / Unread
Urutkan
```

Full labels tetap muncul ketika dropdown dibuka.

## 31.6 Advanced Filter and Visibility

Icon Version tetap dapat menyediakan secondary controls.

Preferred placement:

```text
Primary:
[ 🚪 ▼ ] [ 💬 ▼ ] [ ⇵ ▼ ]

Secondary:
[ Filter ] [ Visibility ]
```

Namun secondary controls tidak boleh menggeser atau menghilangkan tiga primary filters.

Jika pixel budget tidak memungkinkan secondary controls selalu terlihat, gunakan existing filter/settings affordance yang tersedia pada Conversation UI.

---

# 32. Expanded Version — Minimum 1440px

## 32.1 Purpose

Expanded Version digunakan ketika viewport menyediakan ruang horizontal yang cukup.

Target:

```text
viewport ≥ 1440px
```

Expanded Version memberikan **label yang selalu terlihat**, sehingga lebih mudah dipahami terutama oleh user yang belum terbiasa dengan icon-only controls.

## 32.2 Layout

Struktur expanded:

```text
┌──────────────────────────────────────────┐
│ 🔍  Kotak Pesan Anda                     │
├──────────────────────────────────────────┤
│            STATUS PERCAKAPAN             │
│     [ 🚪 Terbuka ] [ 🚪 Tertutup ]       │
│                                          │
│ STATUS BACA             URUTKAN          │
│ [ 💬 Semua ▼ ]          [ ⇵ Terbaru ▼ ]  │
│                                          │
│ [ ⚱ Filter Lanjutan ] [ ⚙ Visibilitas ] │
└──────────────────────────────────────────┘
```

Expanded presentation mengikuti grouping:

```text
Row 1
Search

Row 2
Open / Close

Row 3
All / Read / Unread + Sort

Row 4
Advanced Filter + Visibility
```

## 32.3 Search

Search tetap berada paling atas.

```text
[ 🔍  Kotak Pesan Anda                         ]
```

Search menggunakan full available width.

## 32.4 Open / Close

Pada Expanded Version, Open/Close berubah dari icon-only dropdown menjadi **segmented control dengan label**.

Recommended:

```text
Status Percakapan

┌───────────────────────────────────────────┐
│ 🚪 Terbuka             🚪 Tertutup        │
└───────────────────────────────────────────┘
```

Selected:

```text
┌───────────────────────┬───────────────────┐
│ 🚪  Terbuka ✓         │ 🚪  Tertutup      │
└───────────────────────┴───────────────────┘
```

### Rationale

Open/Close adalah filter yang paling sering digunakan.

Pada expanded viewport, label dapat selalu terlihat sehingga user tidak perlu membuka dropdown untuk mengetahui state.

## 32.5 All / Read / Unread

Expanded Version menggunakan labeled dropdown atau compact segmented control.

Recommended:

```text
Status Baca

[ 💬 Semua ▼ ]
```

Dropdown:

```text
┌──────────────────────────┐
│ 💬 Semua             ✓   │
│ ☑  Sudah dibaca          │
│ 💬• Belum dibaca         │
└──────────────────────────┘
```

Jika design system mendukung segmented control dengan cukup space:

```text
[ 💬 Semua ] [ ☑ Sudah dibaca ] [ 💬• Belum dibaca ]
```

Namun default requirement adalah **dropdown** agar area tetap scalable.

## 32.6 Sort

Sort tetap secondary terhadap Open/Close dan Read state.

```text
Urutkan

[ ⇵ Terbaru ▼ ]
```

Dropdown:

```text
┌─────────────────────┐
│ ↓ Terbaru       ✓   │
│ ↑ Terlama           │
└─────────────────────┘
```

## 32.7 Advanced Filter

Expanded Version menampilkan label langsung:

```text
[ ⚱ Filter Lanjutan ]
```

Klik membuka:

```text
Filter Lanjutan

Agen
[ Filter berdasarkan Agen ]

Tag
[ Filter berdasarkan Tag ]

Relasi
[ Filter berdasarkan Relasi ]

[Reset] [Terapkan]
```

Jika active:

```text
[ ⚱ Filter Lanjutan • ]
```

atau:

```text
[ Filter Lanjutan (3) ]
```

Jumlah harus merepresentasikan filter aktif.

## 32.8 Visibility

Expanded Version menampilkan:

```text
[ ⚙ Visibilitas ]
```

Klik membuka visibility configuration.

Existing visibility settings:

- Tampilkan Lencana WhatsApp Web
- Tampilkan Tag

Tetap merupakan configuration, bukan conversation filter.

---

# 33. Expanded Version — Recommended Visual Structure

Gunakan struktur dua-column untuk row yang memiliki dua function:

```text
┌──────────────────────────────────────────┐
│ Search                                   │
├──────────────────────────────────────────┤
│          Status Percakapan               │
│ ┌──────────────────────────────────────┐ │
│ │ 🚪 Terbuka          │ 🚪 Tertutup    │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ Status Baca             Urutkan          │
│ [ 💬 Semua ▼ ]          [ ⇵ Terbaru ▼ ]  │
│                                          │
│ [ ⚱ Filter Lanjutan ] [ ⚙ Visibilitas ] │
└──────────────────────────────────────────┘
```

This is the **reference expanded layout**.

---

# 34. Why Expanded Uses Different Interaction

Icon Version:

```text
Icon
  ↓
Tooltip / click
  ↓
Dropdown
  ↓
Label
```

Expanded Version:

```text
Label
  ↓
Immediate recognition
  ↓
Click
```

Expanded version should not simply scale up the Icon Version.

It should use the additional viewport space to improve **recognition and scanability**.

---

# 35. Responsive Transition

At exactly:

```text
1280px
```

use Icon Version.

At:

```text
1439px
```

still use Icon Version.

At:

```text
1440px
```

switch to Expanded Version.

Requirement:

```css
@media (min-width: 1280px) {
  /* icon version */
}

@media (min-width: 1440px) {
  /* expanded version */
}
```

Do not switch mode based on browser zoom or container height.

If the Conversation List is implemented as a resizable container rather than a viewport-bound layout, the implementation may additionally use container queries, but the product breakpoint remains 1280 / 1440.

---

# 36. State Consistency Between Modes

Switching viewport must not reset filter state.

Example:

```text
1280px

[ 🚪 ▼ ] [ 💬• ▼ ] [ ⇵ ▼ ]
             ↓
        Belum dibaca
```

Resize to 1440px:

```text
Status Percakapan
[ 🚪 Terbuka ] [ 🚪 Tertutup ]

Status Baca
[ 💬 Belum dibaca ▼ ]

Urutkan
[ ⇵ Terbaru ▼ ]
```

The underlying state remains:

```text
conversationStatus = open
readStatus = unread
sort = newest
```

Only presentation changes.

---

# 37. Active State Consistency

Both modes must use the same semantic active state.

Icon Version:

```text
[ 💬• ▼ ]
```

Expanded Version:

```text
[ 💬 Belum dibaca ▼ ]
```

Both represent exactly the same filter.

Do not create separate state models for Icon and Expanded presentation.

---

# 38. Loading / Empty / Error

Responsive mode must not affect state handling.

All states preserve the appropriate filter controls.

### Loading

```text
Search
Filters
   ↓
Skeleton conversation list
```

### Empty

```text
Filters remain visible

No conversations
```

### No result

```text
No conversations match your filters.
[Clear filters]
```

### Error

```text
Unable to load conversations.
[Retry]
```

---

# 39. Advanced Filter State Across Breakpoints

Advanced filters must persist when switching between Icon and Expanded versions.

Example:

```text
Icon Version:
[ Filter • ]

resize to 1440px

Expanded:
[ Filter Lanjutan (2) ]
```

The underlying filter selection remains unchanged.

---

# 40. Visibility State Across Breakpoints

Visibility settings are not affected by breakpoint.

Icon Version:

```text
[ ⚙ ]
```

Expanded Version:

```text
[ ⚙ Visibilitas ]
```

Both open the same configuration surface.

---

# 41. Responsive Acceptance Criteria

### AC-R01

Given viewport `1280px`,  
then Icon Version must be displayed.

### AC-R02

Given viewport `1439px`,  
then Icon Version must remain displayed.

### AC-R03

Given viewport `1440px`,  
then Expanded Version must be displayed.

### AC-R04

Given viewport changes from 1280px to 1440px,  
then filter values must not reset.

### AC-R05

Given viewport changes from 1440px to 1280px,  
then filter values must not reset.

### AC-R06

Open/Close order remains first.

### AC-R07

All/Read/Unread remains second.

### AC-R08

Sort remains third.

### AC-R09

Advanced Filter remains secondary.

### AC-R10

Visibility remains configuration, not primary filter.

### AC-R11

Icon Version must provide tooltip/full dropdown labels.

### AC-R12

Expanded Version must provide persistent labels for primary controls.

### AC-R13

Both modes must use the same underlying filter state.

### AC-R14

Both modes must use the same filter result behavior.

### AC-R15

No breakpoint may hide Search.

---

# 42. Final Recommendation

Use **two presentation modes**, not one layout stretched across all desktop widths.

## 1280–1439px

### Icon Version

```text
┌──────────────────────────────────────────┐
│ 🔍 Kotak Pesan Anda                      │
├──────────────────────────────────────────┤
│ [ 🚪 ▼ ] [ 💬 ▼ ] [ ⇵ ▼ ]                │
└──────────────────────────────────────────┘
```

Best for:
- limited horizontal/vertical space
- experienced users
- fast repetitive operation

## ≥1440px

### Expanded Version

```text
┌──────────────────────────────────────────┐
│ 🔍 Kotak Pesan Anda                      │
├──────────────────────────────────────────┤
│           Status Percakapan              │
│     [ 🚪 Terbuka ] [ 🚪 Tertutup ]       │
│                                          │
│ Status Baca             Urutkan          │
│ [ 💬 Semua ▼ ]          [ ⇵ Terbaru ▼ ]  │
│                                          │
│ [ ⚱ Filter Lanjutan ] [ ⚙ Visibilitas ] │
└──────────────────────────────────────────┘
```

Best for:
- SPV/Admin
- first-time users
- discoverability
- advanced workflow
- larger viewport

### Final rule

> **1280px = Icon Version for efficiency.**  
> **1440px+ = Expanded Version for clarity.**

The functionality does not change. Only the presentation changes according to available space.
