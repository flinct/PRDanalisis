# Timeline 4 Weeks — Requirement

## Scope

Perubahan ini **hanya untuk komponen Timeline/Roadmap**.

### Current

```text
| Sep | Oct | Nov | Dec | Backlog |
```

### Target

```text
|           Sep           |           Oct           |           Nov           |           Dec           | Backlog |
| W1 | W2 | W3 | W4 | W1 | W2 | W3 | W4 | W1 | W2 | W3 | W4 | W1 | W2 | W3 | W4 |         |
```

## Core Requirement

Setiap bulan dibagi menjadi tepat **4 minggu: W1, W2, W3, W4**.

**Penting:** total lebar satu bulan hanya boleh menjadi **2× lebar bulan pada desain sebelumnya**, bukan 4×.

Jika sebelumnya:

```text
1 month = 1X
```

maka:

```text
1 month = 2X
1 week  = 0.5X
```

Sehingga:

```text
4 × 0.5X = 2X
```

Contoh:

```css
:root {
  --timeline-month-width: 144px;
  --timeline-week-width: 36px;
  --timeline-backlog-width: 100px;
}
```

Relationship wajib:

```css
--timeline-month-width:
  calc(var(--timeline-week-width) * 4);
```

Nilai pixel boleh disesuaikan responsive layout, tetapi rasio **4 minggu = 2× month width lama** harus dipertahankan.

---

## HTML Structure

```html
<div class="timeline">

  <section class="timeline-month" data-month="2026-09">
    <header class="timeline-month-header">Sep</header>

    <div class="timeline-weeks">
      <div class="timeline-week">W1</div>
      <div class="timeline-week">W2</div>
      <div class="timeline-week">W3</div>
      <div class="timeline-week">W4</div>
    </div>
  </section>

  <section class="timeline-month" data-month="2026-10">
    <header class="timeline-month-header">Oct</header>

    <div class="timeline-weeks">
      <div class="timeline-week">W1</div>
      <div class="timeline-week">W2</div>
      <div class="timeline-week">W3</div>
      <div class="timeline-week">W4</div>
    </div>
  </section>

  <section class="timeline-month" data-month="2026-11">
    <header class="timeline-month-header">Nov</header>

    <div class="timeline-weeks">
      <div class="timeline-week">W1</div>
      <div class="timeline-week">W2</div>
      <div class="timeline-week">W3</div>
      <div class="timeline-week">W4</div>
    </div>
  </section>

  <section class="timeline-month" data-month="2026-12">
    <header class="timeline-month-header">Dec</header>

    <div class="timeline-weeks">
      <div class="timeline-week">W1</div>
      <div class="timeline-week">W2</div>
      <div class="timeline-week">W3</div>
      <div class="timeline-week">W4</div>
    </div>
  </section>

  <section class="timeline-backlog">
    <header class="timeline-month-header">Backlog</header>
  </section>

</div>
```

---

## CSS Grid

Header dan task row harus memakai **grid yang sama** supaya timeline bar selalu aligned.

```css
.timeline-grid {
  display: grid;

  grid-template-columns:
    repeat(16, var(--timeline-week-width))
    var(--timeline-backlog-width);
}
```

Karena:

```text
4 months × 4 weeks = 16 weekly columns
+ 1 backlog column
```

Month wrapper:

```css
.timeline-month {
  width: var(--timeline-month-width);
}

.timeline-weeks {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
```

Jangan membuat setiap bulan sebagai 4 column independen yang memakai width month lama. Itu akan menghasilkan timeline **4× terlalu lebar**.

---

## Visual Hierarchy

Struktur visual harus:

```text
             September
┌────────────────────────────────┐
│               Sep              │
├────────┬────────┬────────┬─────┤
│   W1   │   W2   │   W3   │ W4  │
└────────┴────────┴────────┴─────┘
```

Hierarchy:

- Month header = primary.
- Week label = secondary.
- Month boundary = lebih kuat.
- Week boundary = subtle.

Recommended:

```css
.timeline-month {
  border-right: 1px solid var(--border-1);
}

.timeline-week {
  border-left: 1px solid var(--border-3);
}
```

Week label:

```css
.timeline-week {
  font-size: 9px;
  font-weight: 500;
  color: var(--text-5);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## Task Timeline Grid

Task rows wajib memakai weekly grid yang identik:

```css
.task-timeline {
  display: grid;

  grid-template-columns:
    repeat(16, var(--timeline-week-width))
    var(--timeline-backlog-width);
}
```

Jangan menggunakan `position: absolute` berdasarkan pixel untuk menentukan posisi task bar.

Gunakan CSS Grid agar alignment tetap presisi saat width berubah.

---

## Weekly Schedule Data

Schedule task berubah dari monthly granularity menjadi weekly granularity.

```ts
interface TaskSchedule {
  startMonth: string;
  startWeek: 1 | 2 | 3 | 4;

  endMonth: string;
  endWeek: 1 | 2 | 3 | 4;

  backlog?: boolean;
}
```

Contoh:

```js
{
  startMonth: "2026-09",
  startWeek: 4,
  endMonth: "2026-10",
  endWeek: 2
}
```

Berarti:

```text
Sep W4 → Oct W2
```

---

## Weekly Index

Gunakan absolute weekly index.

```text
Sep W1 = 0
Sep W2 = 1
Sep W3 = 2
Sep W4 = 3

Oct W1 = 4
Oct W2 = 5
Oct W3 = 6
Oct W4 = 7

Nov W1 = 8
Nov W2 = 9
Nov W3 = 10
Nov W4 = 11

Dec W1 = 12
Dec W2 = 13
Dec W3 = 14
Dec W4 = 15
```

Formula:

```js
absoluteWeekIndex =
  monthIndex * 4 + (week - 1);
```

Task:

```text
Sep W3 → Oct W2
```

menjadi:

```text
start = 2
end   = 5
span  = 4
```

CSS Grid:

```css
.timeline-bar {
  grid-column: 3 / span 4;
}
```

---

## Schedule Examples

### Single week

```text
Sep W3 → Sep W3

W1 | W2 | W3 | W4
        ███
```

```css
grid-column: 3 / span 1;
```

### Same month

```text
Sep W2 → Sep W4

W1 | W2 | W3 | W4
     ███████████
```

```css
grid-column: 2 / span 3;
```

### Cross month

```text
Sep                         Oct
W1 W2 W3 W4                 W1 W2 W3 W4
         █████████████████████
```

Example:

```text
Sep W3 → Oct W2
```

Task harus tetap terlihat sebagai **satu continuous bar**, bukan empat bar terpisah.

---

## Timeline Bar

```css
.timeline-bar {
  height: 18px;
  min-width: 8px;
  border-radius: 5px;
  align-self: center;
}
```

Priority colors tetap menggunakan existing semantic tokens:

```css
.timeline-bar--p1 {
  background: var(--priority-p1);
}

.timeline-bar--p2 {
  background: var(--priority-p2);
}

.timeline-bar--p3 {
  background: var(--priority-p3);
}

.timeline-bar--backlog {
  background: var(--backlog);
}
```

Jangan mengubah warna priority sebagai bagian dari requirement ini.

---

## Backlog

Backlog **bukan bagian dari 4-week system**.

Struktur:

```text
Sep                    Oct                    Nov                    Dec                 Backlog
W1 W2 W3 W4            W1 W2 W3 W4            W1 W2 W3 W4            W1 W2 W3 W4
```

Backlog selalu menjadi kolom terakhir.

```css
.timeline-backlog {
  width: var(--timeline-backlog-width);
}
```

Task backlog:

```js
{
  backlog: true
}
```

ditempatkan pada backlog column dan **tidak memiliki W1–W4**.

---

## Data Configuration

Timeline harus data-driven.

```js
const timelineMonths = [
  {
    id: "2026-09",
    label: "Sep",
    code: "S"
  },
  {
    id: "2026-10",
    label: "Oct",
    code: "O"
  },
  {
    id: "2026-11",
    label: "Nov",
    code: "N"
  },
  {
    id: "2026-12",
    label: "Dec",
    code: "D"
  }
];
```

Weeks dapat di-generate:

```js
const weeks = [1, 2, 3, 4];
```

Tidak perlu membuat konfigurasi manual W1–W4 untuk setiap bulan.

---

## Responsive

Jika viewport/container tidak cukup:

```css
.roadmap-scroll {
  overflow-x: auto;
}
```

Jangan mengecilkan weekly column sampai tidak usable.

Recommended minimum:

```css
--timeline-week-width: 28px;
```

Dengan demikian:

```text
minimum month width = 4 × 28px = 112px
```

Jika menggunakan `clamp()`:

```css
--timeline-week-width: clamp(28px, 2.5vw, 40px);

--timeline-month-width:
  calc(var(--timeline-week-width) * 4);
```

---

## Existing UI Compatibility

Perubahan ini **hanya mengubah timeline granularity**.

Jangan mengubah:

- Task column.
- Strategic Area.
- Impact.
- Effort.
- Testing.
- Dependency.
- Priority badge.
- Task row height.
- Existing dark themes.
- Existing priority colors.
- Sticky task columns.
- Overall roadmap hierarchy.

Yang berubah:

1. Month width menjadi 2× width sebelumnya.
2. Setiap month memiliki 4 weeks.
3. Task schedule menggunakan start/end week.
4. Task bar mengikuti weekly grid.

---

## Dark Theme

Tetap gunakan QA Browser theme tokens:

```css
var(--app-bg)
var(--elevated-bg)

var(--text-1)
var(--text-3)
var(--text-5)

var(--border-1)
var(--border-2)
var(--border-3)
```

Week separator:

```css
border-color: var(--border-3);
```

Month separator:

```css
border-color: var(--border-1);
```

Tidak boleh menambahkan hard-coded background khusus untuk timeline.

---

## Future Interaction Preparation

Setiap week harus menjadi independent hit area agar nantinya dapat digunakan untuk drag/drop atau resize.

```html
<button
  class="timeline-week"
  data-month="2026-09"
  data-week="4"
  aria-label="September week 4"
>
  W4
</button>
```

Future interaction yang harus dapat didukung:

```text
Start: Sep W4
        ↓
End:   Oct W2
```

Task kemudian menjadi:

```text
Sep W4 → Oct W2
```

Untuk initial implementation, drag/resize tidak wajib; **weekly grid dan data model harus sudah siap**.

---

## Acceptance Criteria

### Width

- [ ] Satu bulan memiliki 4 weekly segments.
- [ ] 4 weekly segments memiliki width sama.
- [ ] Total width satu bulan = 2× width bulan pada desain sebelumnya.
- [ ] Tidak terjadi 4× expansion.
- [ ] Backlog tetap berada di paling kanan.

### Grid

- [ ] Header dan task rows memakai grid weekly yang sama.
- [ ] Total weekly columns = 16 untuk Sep–Dec 2026.
- [ ] Backlog = 1 column tambahan.
- [ ] Month separator lebih kuat daripada week separator.

### Scheduling

- [ ] Task dapat dimulai pada W1/W2/W3/W4.
- [ ] Task dapat berakhir pada W1/W2/W3/W4.
- [ ] Task dapat span beberapa minggu.
- [ ] Task dapat span beberapa bulan.
- [ ] Cross-month task tetap menjadi continuous bar.
- [ ] Backlog tidak memakai weekly schedule.

### Responsive

- [ ] Timeline usable pada 1280×720.
- [ ] Horizontal scrolling tersedia jika diperlukan.
- [ ] Weekly column tidak menjadi terlalu kecil.
- [ ] Sticky task columns tetap aligned.

### Compatibility

- [ ] Tidak mengubah priority colors.
- [ ] Tidak mengubah task metadata.
- [ ] Tidak mengubah dark theme architecture.
- [ ] Tidak mengubah tinggi task row kecuali diperlukan untuk header W1–W4.
- [ ] Tidak mengubah struktur roadmap di luar timeline.

---

## Definition of Done

Timeline berhasil diubah dari:

```text
Sep | Oct | Nov | Dec | Backlog
```

menjadi:

```text
Sep                    Oct                    Nov                    Dec                 Backlog
W1 | W2 | W3 | W4      W1 | W2 | W3 | W4      W1 | W2 | W3 | W4      W1 | W2 | W3 | W4
```

dengan rule utama:

> **4 minggu per bulan, tetapi total lebar setiap bulan hanya 2× lebar bulan sebelumnya.**

Contoh schedule:

```text
Sep W4 → Oct W2
```

harus dapat ditampilkan secara akurat pada weekly grid tanpa alignment drift.
