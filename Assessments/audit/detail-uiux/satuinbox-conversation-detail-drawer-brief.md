# UI/UX Brief — Conversation Detail Drawer

## Context
SatuInbox memiliki workspace Inbox dengan Global Navigation, Conversation List, Conversation Workspace, dan Conversation Detail.

Pada viewport **1280×720**, panel Detail Percakapan yang selalu tampil di kanan mengurangi ruang kerja conversation. Rekomendasi: ubah Detail Percakapan menjadi **right-side drawer yang dapat dibuka/tutup sesuai kebutuhan user**.

## Objective
- Memaksimalkan area conversation ketika detail tidak diperlukan.
- Memungkinkan agent melihat assignment, SLA, metadata, dan customer information tanpa pindah halaman.
- Memberikan kontrol visibility detail kepada user.
- Mempertahankan context conversation.

## Recommended Direction
Gunakan **non-modal right-side drawer**.

### Drawer Closed
- Conversation menjadi primary workspace.
- Detail tidak mengambil permanent screen space.

### Drawer Open
- Detail muncul dari kanan.
- Tidak menggunakan backdrop/dimming.
- Workspace di belakang tetap dapat digunakan selama tidak tertutup drawer.

### Drawer Width
Target **320–380 px**. Hindari drawer terlalu lebar karena sebagian besar informasi berupa label/value.

## Critical UX Rules

### Non-modal
**Jangan:**
- Membuat background gelap.
- Men-disable seluruh workspace.
- Memaksa user menutup drawer sebelum aktivitas lain.

**Harus:**
- Drawer bersifat contextual.
- User tetap dapat membaca/berinteraksi dengan conversation pada area yang tidak tertutup.

### Close Control
Header wajib memiliki tombol `×`.

```text
Detail Percakapan                         ×
CV-1730   [copy]
```

### Optional Pin
Pertimbangkan fitur **Pin**:
- Unpinned: contextual drawer.
- Pinned: persistent detail panel.

```text
Detail Percakapan             [Pin] [×]
```

## Responsive Behavior — 1280×720

### Closed
```text
┌────┬──────────────┬──────────────────────────────────┐
│ Nav│ Conversation  │          Conversation            │
│    │ List          │                                  │
└────┴──────────────┴──────────────────────────────────┘
```

### Open
```text
┌────┬────────────┬──────────────────────┬──────────────┐
│ Nav│ Conversation│     Conversation     │    Detail    │
│    │ List        │                      │    Drawer    │
└────┴────────────┴──────────────────────┴──────────────┘
```

Jika ruang terlalu sempit, **Conversation List dapat masuk compact/collapsed mode** agar Conversation Workspace tetap usable.

Target praktis:
- Drawer: 320–380 px.
- Conversation Workspace sebaiknya sekitar **≥400 px** bila memungkinkan.
- Hindari semua panel memiliki lebar fixed jika membuat conversation terlalu sempit.

## Information Hierarchy Drawer

Prioritaskan kebutuhan agent:

```text
DETAIL PERCAKAPAN
CV-1730

ASSIGNMENT
- Kotak Masuk Tim
- Penerima Tugas

SLA / PERFORMANCE
- FRT
- TTC
- RLT
- Wait Time

CUSTOMER
- Nama
- Nomor Telepon

CONVERSATION
- ID Percakapan
- Sumber Saluran
- Akun Terhubung
- Dibuat Pada

SESSION
- Detail Session
- Koleksi

HISTORY
- Histori Percakapan

NOTES
- Catatan

LOGS / RELATIONS
- Log Percakapan
- Penanda Klien
- Relasi
```

## SLA & Status
SLA harus memiliki semantic yang jelas. Jangan memakai merah hanya karena timer sedang berjalan.

Jika merah berarti breach, tampilkan status eksplisit:

```text
FRT
12m 40s
⚠ Approaching SLA
```

atau:

```text
FRT
12m 40s
✕ SLA Breached
```

Jika timer hanya elapsed time, gunakan visual netral.

FRT/TTC/RLT sebaiknya memiliki tooltip/help text.

## Conversation Header
Header sebaiknya menyediakan context penting:

```text
YD  yosep danny
    +62 896 5505 7778
    WhatsApp · Open
```

Minimal:
- Customer name
- Phone number
- Channel
- Conversation status

Assignment dapat tetap berada di drawer.

## Conversation List
Pertimbangkan informasi:
- Customer
- Last message preview
- Last activity
- Channel
- Unread state
- Assignment
- Conversation status
- SLA/priority indicator bila relevan

Filter yang lebih jelas:

```text
[ Terbuka (4) ▼ ] [ Semua ▼ ]

Urutkan: [ Terbaru ▼ ] [ Filter ]
```

## Accessibility & Visual
- Body text sekitar 13–14 px.
- Secondary text sekitar 12–13 px.
- Tingkatkan contrast secondary text yang terlalu pucat.
- Tooltip untuk icon-only action.
- Kurangi divider/border yang tidak diperlukan.
- Gunakan spacing dan typography untuk grouping.
- Warna harus memiliki semantic yang konsisten.
- Jangan menggunakan warna sebagai satu-satunya indikator status.

## Terminology
- Gunakan `Tutup Percakapan` atau `Selesaikan` jika action memang mengubah status.
- Gunakan `Terbuka (4)` daripada `4 Terbuka`.
- Gunakan `Status Agent` untuk presence.
- Tooltip untuk FRT/TTC/RLT.

## Priority

### P0 — Must Have
1. Detail menjadi right-side drawer.
2. Drawer dapat open/close.
3. Drawer bersifat **non-modal**.
4. Tidak ada backdrop/dimming.
5. Conversation tetap primary workspace.
6. Drawer width 320–380 px.
7. Close button pada header.
8. Status, assignment, dan SLA jelas.

### P1 — Should Have
1. Adaptive layout untuk 1280×720.
2. Conversation List dapat compact/collapse saat drawer terbuka.
3. Tooltip FRT/TTC/RLT.
4. Tooltip icon-only action.
5. Typography dan contrast diperbaiki.
6. Information hierarchy drawer diperbaiki.
7. Pin drawer.

### P2 — Nice to Have
1. Keyboard shortcuts.
2. Canned response/template.
3. Operational status pada conversation list.
4. Customer context lebih prominent.
5. Responsive behavior untuk viewport lebih kecil.

## Success Criteria
- Agent dapat bekerja pada conversation tanpa permanent detail panel.
- Agent dapat membuka detail tanpa pindah halaman.
- Membuka detail tidak men-disable seluruh workspace.
- Conversation tetap nyaman dibaca pada 1280×720.
- User dapat mengontrol visibility detail.
- Assignment, SLA, customer data, dan metadata mudah ditemukan.
- Warna/status tidak menimbulkan interpretasi salah.
- Layout scalable untuk penambahan metadata.

## Design Principle
> **Conversation is the primary workspace. Conversation Detail is contextual information.**

Detail harus membantu agent mengambil keputusan, bukan mengambil alih workspace.

**Recommended final direction: Version 2 — Non-modal Conversation Detail Drawer.**
