# SatuInbox — Full FE Prototype

Clone lengkap frontend SatuInbox ke single-directory prototype. Zero API, dummy data, localStorage-backed CRUD.

## Jalankan

**Double-click `index.html`.** Selesai. Tanpa server, tanpa terminal.

Share ke orang lain: kirim seluruh folder (zip), mereka double-click `index.html`.

> Halaman dimuat dari `pages/*.js` (bukan `fetch`), jadi jalan di `file://` langsung.
> Setelah edit `pages/*.html`, regen `.js`-nya: `python3 build.py`

## Login

| Field            | Default                         |
| ---------------- | ------------------------------- |
| Username / Email | `dany` atau `dany@satuinbox.id` |
| Password         | `password123`                   |

Akun lain: `naftal` / `sari` (password sama).

## Halaman

| Rail | Route                   | Fitur                                                                                                                                                                  |
| ---- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📥   | `#/conversation`        | Sidenav personal/group, list search+filter, thread (bubble/sender/mention), expired 24h banner, disconnected banner, composer, drawer (detail/biaya), CRUD kirim pesan |
| 🔍   | —                       | Global search modal (cari percakapan/kontak/tiket)                                                                                                                     |
| 🎫   | `#/ticketing`           | Table + status/priority filter + search, create/edit/delete modal                                                                                                      |
| 📢   | `#/broadcast/messages`  | Broadcast table + CRUD, sidenav (Pesan/Draft/Template)                                                                                                                 |
| 📝   | `#/broadcast/draft`     | Draft list + edit/delete                                                                                                                                               |
| 📋   | `#/broadcast/templates` | Template card grid + CRUD (approved/pending/rejected)                                                                                                                  |
| 📊   | `#/statistic`           | Summary cards, bar charts, agent performance table                                                                                                                     |
| 📇   | `#/contacts`            | Table + search/tag/channel filter, detail modal, CRUD                                                                                                                  |
| 💰   | `#/leads`               | Card grid + status filter, create/edit modal                                                                                                                           |
| 🔔   | `#/notification`        | List + unread filter, mark all read, click→navigate                                                                                                                    |
| ⚙    | `#/settings/*`          | 15 sub-halaman (lihat bawah)                                                                                                                                           |

### Settings

| Section     | Pages                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| Organisasi  | Umum, Anggota (max conversation modal), Role & Permission, Tag, Jadwal Kerja |
| Kotak Masuk | Auto-assignment, CSAT, Macros, SLA, Tim Kotak Masuk, Tiket                   |
| Channel     | WhatsApp API, WhatsApp Web, Widget (embed code)                              |
| Developer   | Webhook (CRUD + event checkboxes)                                            |

## Dummy Data

Data tersimpan di `localStorage` (key: `satui_proto_data`). CRUD apapun persist sampai browser clear.

Reset ke data awal: jalankan di console → `dbReset()`

## Struktur

```
satuinbox-prototype/
├── index.html              ← appshell + auth + search modal
├── shared/
│   ├── theme.css           ← CSS vars + base styles
│   ├── data.js             ← dummy data store + CRUD helpers
│   ├── router.js           ← hash router + page loader + search + settings nav
│   └── auth.js             ← login/register/forgot/onboarding flow
└── pages/
    ├── conversation.html
    ├── ticketing.html
    ├── contacts.html
    ├── leads.html
    ├── statistic.html
    ├── notification.html
    ├── broadcast-messages.html
    ├── broadcast-templates.html
    ├── broadcast-draft.html
    └── settings-*.html     ← 15 files
```

## Account

Setelah register → onboarding (nama organisasi + NIB/NPWP/KTP opsional) → masuk app.

Logout: klik avatar di rail footer → Keluar.

## Responsive

- **1440px**: full layout (64px rail + content)
- **≤1360px**: compact rail (48px) + narrower settings/broadcast sidenav
