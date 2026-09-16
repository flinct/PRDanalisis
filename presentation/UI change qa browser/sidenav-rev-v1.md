# Sidenav Revision v1

## Scope

Redesign Conversation Sidenav berdasarkan frekuensi penggunaan user. Personal Chat dan Group Chat menjadi primary navigation; Karantina, Saluran, dan Kotak Masuk Tim menjadi secondary navigation yang collapsed secara default.

## Final Information Architecture

```text
INBOX

PERSONAL CHAT
├── Kotak Pesan Anda
├── Belum Ditugaskan
├── Semua
└── Berbintang

GROUP CHAT
├── WhatsApp Web Grup
└── WhatsApp API Grup

KARANTINA

SALURAN

KOTAK MASUK TIM
```

Default state:

```text
Inbox

PERSONAL CHAT                       ˄
  Kotak Pesan Anda
  Belum Ditugaskan
  Semua
  Berbintang

GROUP CHAT                          ˄
  WhatsApp Web Grup
  WhatsApp API Grup

KARANTINA                           ˅
SALURAN                             ˅
KOTAK MASUK TIM                     ˅
```

## 1. Navigation Priority

### Primary — default expanded

- Personal Chat
- Group Chat

### Secondary — default collapsed

- Karantina
- Saluran
- Kotak Masuk Tim

User dapat expand/collapse setiap section secara independent. Jangan menggunakan accordion yang memaksa hanya satu section terbuka.

## 2. Personal Chat

Label:

`PERSONAL CHAT`

Default: **expanded**.

Items:

- Kotak Pesan Anda
- Belum Ditugaskan
- Semua
- Berbintang

`Semua` di dalam Personal Chat berarti **Semua Personal Chat**, bukan seluruh conversation lintas type.

Personal Chat dapat di-collapse manual, tetapi initial/default state tetap expanded.

## 3. Group Chat

Label:

`GROUP CHAT`

Default: **expanded**.

Final child naming:

```text
WhatsApp Web Grup
WhatsApp API Grup
```

Jangan gunakan:

```text
WhatsApp Web Group
WhatsApp API Group
```

karena UI menggunakan terminology Bahasa Indonesia.

Jangan gunakan hanya:

```text
WhatsApp Web
WhatsApp API
```

di bawah Group Chat karena akan ambigu dengan section Saluran.

### Semantics

```text
WhatsApp Web Grup
= Group conversation yang berasal dari WhatsApp Web

WhatsApp API Grup
= Group conversation yang berasal dari WhatsApp API
```

Jika count tersedia:

```text
WhatsApp Web Grup                32
WhatsApp API Grup                 4
```

Count berasal dari data aktual. Jangan menampilkan zero badge jika convention UI existing menghilangkan count 0.

Struktur harus scalable untuk source group baru, tetapi v1 hanya menampilkan source yang benar-benar tersedia.

## 4. Karantina

Recommended label:

`KARANTINA`

Default: **collapsed**.

Ketika expanded:

```text
KARANTINA                         ˄
  Spam
  Junk
```

Tetap gunakan child label:

- Spam
- Junk

Jangan mengubahnya menjadi `Karantina Spam` atau `Karantina Junk`, karena parent sudah menjelaskan konteks.

Karantina diperlakukan sebagai secondary workflow karena Spam/Junk bukan workflow utama mayoritas user.

## 5. Saluran

Label:

`SALURAN`

Default: **collapsed**.

Ketika expanded, tampilkan channel yang tersedia dan sesuai permission, misalnya:

```text
SALURAN                           ˄
  Email
  Facebook Messenger
  Instagram
  IG Comment
  Telegram
  WhatsApp API
  WhatsApp Web
  Widget
```

Jangan memasukkan Group Chat ke dalam Saluran.

Contoh yang forbidden:

```text
SALURAN
├── WhatsApp Web
├── WhatsApp Web Grup
├── WhatsApp API
└── WhatsApp API Grup
```

Correct:

```text
GROUP CHAT
├── WhatsApp Web Grup
└── WhatsApp API Grup

SALURAN
├── WhatsApp Web
└── WhatsApp API
```

Perbedaannya:

- Group Chat = conversation type
- Saluran = communication source/channel

`WhatsApp Web` di Saluran dapat mencakup personal dan group conversation; `WhatsApp Web Grup` hanya group conversation.

## 6. Kotak Masuk Tim

Label:

`KOTAK MASUK TIM`

Default: **collapsed**.

Gunakan existing `+` untuk action add/create jika capability tersebut tersedia dan chevron untuk expand/collapse.

Expanded example:

```text
KOTAK MASUK TIM                    ˄
  Support
  Sales
  Customer Success
```

Team list mengikuti permission/scope user.

## 7. Collapse / Expand

Setiap section mempunyai state:

```text
Expanded  ˄
Collapsed ˅
```

Behavior:

- Click header → toggle
- Collapse tidak mengubah selected navigation
- Expand tidak mengubah selected navigation
- Multiple sections boleh expanded bersamaan
- Active child tetap dipertahankan

Jika section collapsed tetapi child-nya active, parent harus memiliki subtle active indicator.

Contoh:

```text
SALURAN                    • ˅
```

Saat parent dibuka:

```text
SALURAN                    ˄
  Email
  WhatsApp Web             ← active
```

## 8. Counts

Jika count tersedia, letakkan di sisi kanan child item:

```text
Kotak Pesan Anda                 26
Belum Ditugaskan                282
Semua                           492
WhatsApp Web Grup                32
WhatsApp API Grup                 4
Spam                              0
Junk                              11
```

Count harus berasal dari data aktual.

Active item tetap terlihat walaupun count = 0.

## 9. Visual Hierarchy

Primary sections harus terasa lebih penting daripada secondary sections.

Recommended:

```text
PERSONAL CHAT                    ˄
  items...

GROUP CHAT                       ˄
  items...

──────────────────────────────

KARANTINA                        ˅
SALURAN                          ˅
KOTAK MASUK TIM                  ˅
```

Jangan membuat secondary section mengambil vertical space pada initial load.

## 10. Role-aware Visibility

Gunakan existing RBAC/permission system. Jangan membuat IA berbeda untuk setiap role.

### Agent

Default:

```text
Personal Chat       expanded
Group Chat          expanded
Karantina           collapsed
Saluran             collapsed
Kotak Masuk Tim     collapsed
```

Items yang tidak memiliki permission tidak ditampilkan.

### SPV

SPV dapat melihat navigation sesuai permission:

- Personal Chat
- Group Chat
- Karantina
- Saluran
- Kotak Masuk Tim

Secondary sections tetap collapsed pada initial load.

### Admin

Admin mendapatkan navigation sesuai permission. Permission lebih tinggi tidak berarti secondary section harus otomatis expanded.

## 11. Accessibility

Section header wajib:

- keyboard accessible
- semantic button
- accessible label
- visible focus state
- expanded/collapsed state

Gunakan semantic state seperti:

```text
aria-expanded="true"
aria-expanded="false"
```

Child navigation menggunakan semantic link/button sesuai implementation.

## 12. Responsive / Compact Sidenav

Ketika application sidenav masuk collapsed mode, jangan menghapus capability.

Representasikan section dengan icon dan tooltip:

```text
Personal Chat → icon
Group Chat    → icon
Karantina     → icon
Saluran       → icon
Team Inbox    → icon
```

Tooltip harus menjelaskan label.

## 13. Do Not Duplicate Conversation Type

Forbidden:

```text
SALURAN
├── WhatsApp Web
├── WhatsApp Web Grup
├── WhatsApp API
└── WhatsApp API Grup
```

Required:

```text
GROUP CHAT
├── WhatsApp Web Grup
└── WhatsApp API Grup

SALURAN
├── WhatsApp Web
└── WhatsApp API
```

## 14. Recommended Final State

```text
Inbox

PERSONAL CHAT                    ˄
  Kotak Pesan Anda          26
  Belum Ditugaskan         282
  Semua                    492
  Berbintang                 0

GROUP CHAT                       ˄
  WhatsApp Web Grup         32
  WhatsApp API Grup          4

KARANTINA                       ˅

SALURAN                         ˅

KOTAK MASUK TIM                 ˅
```

## 15. Design Principles

1. **Usage first** — navigation order mengikuti frekuensi penggunaan, bukan struktur backend.
2. **Separate semantics** — Personal/Group = conversation type; Channel = communication source; Karantina = excluded/problematic conversations; Team Inbox = ownership/work distribution.
3. **Primary always visible** — Personal Chat dan Group Chat expanded by default.
4. **Secondary one click away** — Karantina, Saluran, dan Kotak Masuk Tim collapsed by default.
5. **Avoid duplication** — WhatsApp Web/API dapat muncul pada Group Chat dan Saluran karena context berbeda.
6. **Preserve role visibility** — RBAC menentukan item yang dapat dilihat; role tidak membuat IA paralel.

## 16. Acceptance Criteria

- [ ] Personal Chat menjadi section.
- [ ] Personal Chat default expanded.
- [ ] Personal Chat berisi Kotak Pesan Anda, Belum Ditugaskan, Semua, Berbintang.
- [ ] `Semua` berarti Semua Personal Chat.
- [ ] Group Chat menjadi sibling Personal Chat.
- [ ] Group Chat default expanded.
- [ ] Group Chat menggunakan label `WhatsApp Web Grup`.
- [ ] Group Chat menggunakan label `WhatsApp API Grup`.
- [ ] Tidak menggunakan `WhatsApp Web Group` / `WhatsApp API Group`.
- [ ] Karantina menjadi sibling section.
- [ ] Karantina default collapsed.
- [ ] Karantina berisi Spam dan Junk.
- [ ] Saluran default collapsed.
- [ ] Saluran berisi channel yang tersedia sesuai permission.
- [ ] Group Chat tidak dimasukkan ke Saluran.
- [ ] Kotak Masuk Tim default collapsed.
- [ ] Team list mengikuti permission.
- [ ] Section dapat expand/collapse independent.
- [ ] Collapse tidak mengubah active navigation.
- [ ] Active child pada collapsed section memiliki parent indicator.
- [ ] Role visibility mengikuti existing RBAC.
- [ ] Compact sidenav tidak menghapus navigation capability.
- [ ] Icon dan label section memiliki semantic berbeda.
- [ ] Accessibility state expanded/collapsed tersedia.
- [ ] Structure scalable untuk channel/group source baru.

## 17. Final Decision

```text
PERSONAL CHAT                  expanded
├── Kotak Pesan Anda
├── Belum Ditugaskan
├── Semua
└── Berbintang

GROUP CHAT                     expanded
├── WhatsApp Web Grup
└── WhatsApp API Grup

KARANTINA                      collapsed
├── Spam
└── Junk

SALURAN                        collapsed
├── Email
├── Facebook Messenger
├── Instagram
├── IG Comment
├── Telegram
├── WhatsApp API
├── WhatsApp Web
└── ...

KOTAK MASUK TIM                collapsed
├── ...
└── ...
```

> **Core UX rule:** Personal Chat dan Group Chat adalah primary working areas dan selalu terlihat pada initial state. Karantina, Saluran, dan Kotak Masuk Tim tetap tersedia untuk SPV/Admin tetapi collapsed secara default agar tidak mengambil vertical space dari workflow utama.
