# Table Change Recommendation --- Current / Next / Backlog

## 1. Objective

Membuat perbedaan visual dan semantic antara:

-   **Current Tasks** --- pekerjaan yang sedang aktif dan perlu
    dikerjakan sekarang.
-   **Next Up** --- pekerjaan yang sudah direncanakan untuk dikerjakan
    setelah current tasks.
-   **Backlog** --- pekerjaan yang belum memiliki komitmen/jadwal
    pengerjaan.

Tujuan utama adalah agar perbedaan ketiga state dapat dipahami hanya
dengan melihat tabel secara sekilas, tanpa harus membaca seluruh detail
task.

------------------------------------------------------------------------

## 2. Problem

Pada desain saat ini, section:

> **Current tasks --- start now**

dan:

> **Next & backlog**

memiliki treatment visual yang hampir sama.

Perbedaan hanya terlihat dari:

-   nama section;
-   badge `Now` vs `Next`;
-   posisi timeline.

Akibatnya, user masih dapat mempersepsikan task di kedua section sebagai
satu daftar prioritas yang sama.

Masalah tambahan: **Next** dan **Backlog** sebenarnya memiliki makna
yang berbeda, tetapi saat ini digabung menjadi satu section.

------------------------------------------------------------------------

# 3. Recommended Structure

Ubah struktur menjadi tiga state yang eksplisit:

``` text
CURRENT TASKS — START NOW
    ↓
    Active work

NEXT UP
    ↓
    Planned work

BACKLOG
    ↓
    Unscheduled / not yet committed
```

### Recommended naming

  Current                       Recommended
  ----------------------------- ---------------------------------
  Current tasks --- start now   **Current Tasks --- Start Now**
  Next & backlog                **Next Up**
  ---                           **Backlog**

Jangan menggunakan `Next & backlog` sebagai satu section karena kedua
state tersebut memiliki commitment level yang berbeda.

------------------------------------------------------------------------

# 4. Visual Hierarchy

Gunakan prinsip:

``` text
CURRENT
  ↓ strongest visual emphasis

NEXT
  ↓ medium emphasis

BACKLOG
  ↓ lowest emphasis
```

Visual hierarchy harus menunjukkan **execution state**, bukan membuat
backlog terlihat tidak penting.

## 4.1 Current Tasks

Current task merupakan pekerjaan aktif.

Treatment:

-   Row menggunakan contrast normal/tinggi.
-   Task name menggunakan text color utama.
-   Status menggunakan badge `NOW`.
-   Timeline bar solid dan paling saturated.
-   Section header menggunakan treatment paling kuat.
-   Tidak perlu mengurangi opacity.

Example:

``` text
┌─────────────────────────────────────────────────────┐
│ CURRENT TASKS — START NOW                            │
├─────────────────────────────────────────────────────┤
│ 6   Notification service improvement       [ NOW ]  │
│ 30  Email summary                           [ NOW ]  │
│ 17  UI conversation redesign                [ NOW ]  │
│ 9   Advance exporting                      [ NOW ]  │
└─────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------

# 5. Next Up

`Next Up` menunjukkan task yang sudah direncanakan, tetapi belum aktif.

Treatment:

-   Row tetap memiliki readability penuh.
-   Text sedikit lebih muted dibanding Current.
-   Status badge menggunakan `NEXT`.
-   Timeline bar sedikit lebih tipis.
-   Timeline bar dapat menggunakan saturation/opacity lebih rendah
    dibanding Current.
-   Section header tetap jelas, tetapi tidak sekuat Current.

Example:

``` text
┌─────────────────────────────────────────────────────┐
│ NEXT UP                                              │
│ Planned work                                        │
├─────────────────────────────────────────────────────┤
│ 4   WA Official adjustment                  [ NEXT ] │
│ 12  Customer segmentation                   [ NEXT ] │
└─────────────────────────────────────────────────────┘
```

### Semantic rule

`NEXT` berarti:

> Task sudah masuk urutan pengerjaan berikutnya dan memiliki planning
> yang cukup jelas.

------------------------------------------------------------------------

# 6. Backlog

Backlog merupakan task yang belum dijadwalkan atau belum masuk execution
sequence.

Treatment:

-   Row lebih muted daripada Current dan Next.
-   Task name tetap readable.
-   Status menggunakan `BACKLOG`.
-   Timeline tidak perlu menampilkan bar apabila belum memiliki
    schedule.
-   Jika timeline tetap membutuhkan placeholder, gunakan dashed/neutral
    treatment.
-   Hindari warna aktif yang sama dengan Current.

Example:

``` text
┌─────────────────────────────────────────────────────┐
│ BACKLOG                                              │
│ Not scheduled                                        │
├─────────────────────────────────────────────────────┤
│ 21  WhatsApp template management          [ BACKLOG ]│
│ 25  Advanced analytics                    [ BACKLOG ]│
└─────────────────────────────────────────────────────┘
```

### Semantic rule

`BACKLOG` berarti:

> Task masih merupakan candidate work dan belum memiliki commitment
> terhadap execution timeline.

------------------------------------------------------------------------

# 7. Status Badge

Gunakan tiga status yang konsisten:

``` text
[ NOW ]
[ NEXT ]
[ BACKLOG ]
```

## Recommended treatment

  Status      Meaning              Visual treatment
  ----------- -------------------- -------------------------------
  `NOW`       Active / executing   Strong accent + high contrast
  `NEXT`      Planned next         Outline / medium contrast
  `BACKLOG`   Unscheduled          Neutral / muted

Jangan hanya mengganti label `Now` menjadi `Next`.

Perbedaan visual badge harus membantu user mengenali state tanpa membaca
teks secara detail.

------------------------------------------------------------------------

# 8. Timeline Treatment

Timeline merupakan salah satu elemen visual terbesar pada tabel sehingga
dapat digunakan untuk memperjelas state.

## Current

Gunakan:

-   solid bar;
-   normal/high saturation;
-   normal height.

``` text
W1    W2    W3    W4

      ███   ███
```

## Next

Gunakan:

-   solid bar;
-   slightly lower saturation;
-   slightly thinner height.

``` text
W1    W2    W3    W4

      ▬▬▬   ▬▬▬
```

## Backlog

Jika belum memiliki schedule:

``` text
W1    W2    W3    W4

      — no schedule —
```

Atau tidak menampilkan timeline bar sama sekali.

**Do not invent a timeline for backlog items.**

------------------------------------------------------------------------

# 9. Section Divider

Berikan separation yang lebih kuat antara state.

Recommended:

``` text
CURRENT TASKS — START NOW
────────────────────────────────────────
[active rows]
[active rows]
[active rows]

════════════════════════════════════════
NEXT UP
Planned work
════════════════════════════════════════

[planned rows]
[planned rows]

════════════════════════════════════════
BACKLOG
Not scheduled
════════════════════════════════════════

[backlog rows]
[backlog rows]
```

Gunakan:

-   vertical spacing lebih besar sebelum section baru;
-   divider/header yang jelas;
-   subtitle singkat jika dibutuhkan.

Tujuannya adalah membuat mata user mengenali **perubahan execution
state**.

------------------------------------------------------------------------

# 10. Row Styling

Recommended hierarchy:

``` text
Current row
████████████████████  strongest

Next row
██████████████████    medium

Backlog row
██████████████        muted
```

Perbedaan tidak harus ekstrem.

Hindari:

-   membuat backlog terlalu transparan;
-   membuat text sulit dibaca;
-   menggunakan warna berbeda secara berlebihan;
-   menggunakan warna merah untuk backlog;
-   menggunakan warna hijau untuk semua task aktif jika warna tersebut
    sudah memiliki semantic lain di sistem.

------------------------------------------------------------------------

# 11. Recommended Information Architecture

Final structure:

``` text
CURRENT TASKS — START NOW
│
├── Active Task
├── Active Task
├── Active Task
└── Active Task
│
├────────────────────────────────
│
NEXT UP
│
├── Planned Task
├── Planned Task
└── Planned Task
│
├────────────────────────────────
│
BACKLOG
│
├── Unscheduled Task
├── Unscheduled Task
└── Unscheduled Task
```

Dengan semantic:

``` text
NOW
↓
Currently executing

NEXT
↓
Planned after current work

BACKLOG
↓
Candidate work / not scheduled
```

------------------------------------------------------------------------

# 12. Acceptance Criteria

### Section

-   [ ] `Current Tasks`, `Next Up`, dan `Backlog` dapat dibedakan secara
    visual tanpa membaca task detail.
-   [ ] `Next Up` dan `Backlog` tidak digabung dalam satu section.
-   [ ] Section transition memiliki visual separation yang jelas.
-   [ ] Section naming konsisten dengan execution state.

### Status

-   [ ] Current task menggunakan `NOW`.
-   [ ] Next task menggunakan `NEXT`.
-   [ ] Backlog task menggunakan `BACKLOG`.
-   [ ] Ketiga badge memiliki visual hierarchy yang berbeda.

### Timeline

-   [ ] Current timeline menggunakan treatment paling prominent.
-   [ ] Next timeline menggunakan treatment yang lebih muted.
-   [ ] Backlog tidak menampilkan schedule yang belum ada.
-   [ ] Timeline treatment tidak menyebabkan backlog terlihat seperti
    task aktif.

### Readability

-   [ ] Backlog tetap readable.
-   [ ] Muted styling tidak menurunkan accessibility secara signifikan.
-   [ ] Perbedaan state tidak hanya bergantung pada warna.
-   [ ] State tetap dapat dikenali melalui label dan struktur section.

------------------------------------------------------------------------

# 13. Recommended Priority of Changes

Implementasikan perubahan dengan urutan berikut:

### P0 --- Separate Next and Backlog

Ubah:

``` text
Next & backlog
```

menjadi:

``` text
Next Up
Backlog
```

Ini merupakan perubahan paling penting secara information architecture.

### P0 --- Strengthen State Hierarchy

Terapkan:

``` text
Current > Next > Backlog
```

pada row, status badge, dan timeline.

### P1 --- Improve Timeline Semantics

Terapkan:

``` text
Current = solid / prominent
Next    = muted / thinner
Backlog = no schedule / placeholder
```

### P1 --- Strengthen Section Divider

Tambahkan spacing dan divider yang membuat perpindahan state lebih
terasa.

### P2 --- Add Section Subtitle

Optional:

``` text
CURRENT TASKS
Start now

NEXT UP
Planned work

BACKLOG
Not scheduled
```

Subtitle hanya digunakan jika dibutuhkan karena section title sebaiknya
tetap compact.

------------------------------------------------------------------------

# 14. Final Recommendation

Desain akhir sebaiknya tidak sekadar membedakan warna `Now` dan `Next`.

Perbedaan harus dibangun pada **tiga level**:

``` text
1. INFORMATION ARCHITECTURE
   Current → Next → Backlog

2. VISUAL HIERARCHY
   Strong → Medium → Muted

3. TIMELINE SEMANTICS
   Active → Planned → Unscheduled
```

Dengan pendekatan ini, user dapat memahami status roadmap secara cepat:

> **Current = kerjakan sekarang**\
> **Next = berikutnya**\
> **Backlog = belum dijadwalkan**

tanpa perlu membaca detail setiap task.
