# Ticket — Page Selector Map (data-cy)

> **Kontrak `data-cy` untuk diterapkan di FE (omnichannel-satuinbox-fe).**
> Semua elemen ticket diseleksi via `data-cy`. `testIdAttribute = 'data-cy'` → `getByTestId('X')` = `[data-cy="X"]`.
> Konvensi domain ticket: **kebab-case** (mengikuti yang sudah ada: `monitoring-ticket-*`, `ticket-list-*`).
> Status: `ADA` = sudah ada di FE; **`TAMBAH`** = perlu ditambahkan.

---

## 1. Ticketing list — `/ticketing`  (ticketing.page.js) — mayoritas ADA

| Elemen | `data-cy` | Status |
|---|---|---|
| Nav Ticketing | `nav-link-Ticket` | ADA |
| Judul/head | `monitoring-ticket-head-label` | ADA |
| Tombol more action | `monitoring-ticket-more-action` | ADA |
| Tombol create ticket | `monitoring-ticket-create-ticket` | ADA |
| Counter: New / All / Need Response / Being Handled / Over SLA / Solved | `monitoring-ticket-new-ticket` / `-all-ticket` / `-need-response` / `-being-handled` / `-over-sla` / `-solved` | ADA |
| Searchbar | `searchbar-at-ticket` | ADA |
| Filter courier / tanggal / list / kendala | `filter-by-courier` / `date-filter-ticket` / `filter-ticket-list` / `ticket-list-filter-kendala` | ADA |
| Header tabel (checkbox/AWB/Kendala/SLA/Manifest/Destinasi/Tracking) | `ticket-list-table-heading-checkbox`, `ticket-list-awb`, `ticket-list-kendala`, `ticket-list-sla`, `ticket-list-manifest-date`, `ticket-list-destinasi`, `ticket-list-tracking` | ADA |
| Item baris (checkbox, logo kurir, AWB, kendala, SLA, manifest, destinasi, last-tracking, seller name/phone, ticket id, priority, created at, agent handler) | `ticket-list-checkbox`, `ticket-list-kurir-logo`, `ticket-list-awb-number`, `ticket-list-deskripsi-kendala`, `ticket-list-sla-value`, `ticket-list-manifest-date-value`, `ticket-list-destinasi-value`, `ticket-list-last-tracking(-button)`, `ticket-list-seller-name`/`-seller-phone`, `ticket-list-ticket-id`, `ticket-list-priority`, `ticket-list-created-at`, `ticket-list-agent-handler` | ADA |
| Aksi baris: Tindak Lanjuti / View / Solve | `ticket-list-button-tindak-lanjuti` / `-button-view-ticket` / `-button-solve` | ADA |

## 2. Linked Chat Bubble & Ticket Detail  (ticket-linked-bubble.page.js) — mayoritas TAMBAH

### 2a. Chat bubble & seleksi pesan
| Elemen | `data-cy` | Status | Ganti selector lama |
|---|---|---|---|
| Container chatroom | `conversation-chatroom-container` | **TAMBAH** | `#conversation-chatroom-container` |
| Container bubble | `conversation-bubble-container` | **TAMBAH** | `#conversation-buble` |
| Satu bubble chat | `ticket-chat-bubble` | **TAMBAH** | `div.group` |
| Bubble terpilih (state) | `ticket-chat-bubble` + `data-selected="true"` | **TAMBAH** | `div.border-blue-600.border-2` |
| Bubble sudah punya ticket (state) | `ticket-chat-bubble` + `data-linked="true"` | **TAMBAH** | `div.bg-pink-100` |
| Link "lihat ticket" | `bubble-see-ticket-link` | **TAMBAH** | `a[href*="ticketing?ticketId="]` |
| Tombol menu (titik tiga) | `bubble-menu-button` | **TAMBAH** | `button[aria-haspopup="dialog"]` |
| Menu: pilih pesan | `bubble-menu-select-messages` | **TAMBAH** | `role=button` |
| Checkbox pilih bubble | `bubble-select-checkbox` | **TAMBAH** | `button[role="checkbox"]` |
| Bar seleksi: Create Ticket | `selection-create-ticket-button` | **TAMBAH** | `role=button` |
| Bar seleksi: Cancel | `selection-cancel-button` | **TAMBAH** | `role=button /cancel\|batal/` |

### 2b. Dialog create ticket
| Elemen | `data-cy` | Status | Ganti selector lama |
|---|---|---|---|
| Dialog create ticket | `create-ticket-dialog` | **TAMBAH** | `[role="dialog"]` |
| Search ticket type | `create-ticket-type-search` | **TAMBAH** | `input[placeholder*="ticket"]` |
| Opsi ticket type | `create-ticket-type-option` | **TAMBAH** | dropdown option |
| Opsi priority | `create-ticket-priority-option` | **TAMBAH** | dropdown option |
| Tombol konfirmasi create | `create-ticket-confirm-button` | **TAMBAH** | `role=button` |
| Dialog review ticket dibuat | `created-ticket-review-dialog` | **TAMBAH** | `[role="dialog"]` |
| Modal duplikat bubble | `duplicate-bubble-modal` | **TAMBAH** | `div.bg-orange-50` |
| Tutup modal duplikat | `duplicate-bubble-modal-close` | **TAMBAH** | `role=button` |

### 2c. Ticket drawer & linked sections
| Elemen | `data-cy` | Status | Ganti selector lama |
|---|---|---|---|
| Ticket drawer | `ticket-drawer` | **TAMBAH** | `[role="dialog"]` |
| Accordion: Linked Messages | `ticket-linked-messages-accordion` | **TAMBAH** | `role=button` |
| Accordion: Linked Conversation | `ticket-linked-conversation-accordion` | **TAMBAH** | `role=button` |
| Accordion: Linked Tickets (di conversation) | `conversation-linked-tickets-accordion` | **TAMBAH** | `getByText` |
| Item linked ticket | `linked-ticket-item` | **TAMBAH** | `button[aria-label^="View ticket:"]` |
| Badge SLA | `ticket-sla-badge` | **TAMBAH** | `[aria-label="sla duration"]` |
| Tombol Close ticket | `ticket-close-button` | **TAMBAH** | `role=button /tutup\|close/` |
| Tombol Reopen ticket | `ticket-reopen-button` | **TAMBAH** | `role=button /buka\|reopen/` |

### 2d. Append to ticket (ticket picker)
| Elemen | `data-cy` | Status | Ganti selector lama |
|---|---|---|---|
| Tombol Append to Ticket | `append-to-ticket-button` | **TAMBAH** | `role=button` |
| Modal picker ticket | `ticket-picker-modal` | **TAMBAH** | `[role="dialog"]` |
| Search di picker | `ticket-picker-search` | **TAMBAH** | `input` |
| Opsi ticket di picker | `ticket-picker-option` | **TAMBAH** | `button` |
| Konfirmasi / Batal picker | `ticket-picker-confirm-button` / `ticket-picker-cancel-button` | **TAMBAH** | `role=button` |
| State kosong picker | `ticket-picker-empty` | **TAMBAH** | `getByText` |
| Warning sudah ter-link | `ticket-picker-already-linked-warning` | **TAMBAH** | `getByText` |
| Add dari panel LinkedConversation | `linked-panel-add-to-ticket-button` | **TAMBAH** | `role=button /add to ticket/` |

### 2e. Remove linked bubble
| Elemen | `data-cy` | Status | Ganti selector lama |
|---|---|---|---|
| Tombol remove bubble | `remove-linked-bubble-button` | **TAMBAH** | `role=button /remove bubble/` |
| Dialog konfirmasi remove | `remove-bubble-confirm-dialog` | **TAMBAH** | `[role="dialog"]` |
| Konfirmasi / Batal remove | `remove-bubble-confirm-button` / `remove-bubble-cancel-button` | **TAMBAH** | `role=button` |

### 2f. Linked Conversation panel & navigasi
| Elemen | `data-cy` | Status | Ganti selector lama |
|---|---|---|---|
| Link "show detail chat" | `bubble-show-detail-chat-link` | **TAMBAH** | `role=link` |
| Panel Linked Conversation | `linked-conversation-panel` | **TAMBAH** | `#scrollableLinkedConversationPanel` |
| Tombol back ke ticket detail | `back-to-ticket-detail-button` | **TAMBAH** | `role=button` |
| Checkbox pesan di panel | `linked-panel-message-checkbox` | **TAMBAH** | `button[role="checkbox"]` |

### 2g. Reply / Internal note & toast
| Elemen | `data-cy` | Status | Ganti selector lama |
|---|---|---|---|
| Tab Reply to Customer | `ticket-reply-customer-tab` | **TAMBAH** | `role=button` |
| Tab Internal Note | `ticket-internal-note-tab` | **TAMBAH** | `role=button` |
| Tombol kirim reply | `ticket-reply-send-button` | **TAMBAH** | `role=button` |
| Konfirmasi cross-send | `cross-send-confirm-button` | **TAMBAH** | `[role="dialog"] button /confirm\|kirim/` |
| Toast (success/error) | `ticket-toast` | **TAMBAH** | `.Toastify__toast, [role="alert"]` |

---

## Ringkasan untuk FE

- **ADA (langsung pakai):** seluruh **§1 Ticketing list** (`nav-link-Ticket`, `monitoring-ticket-*`, `searchbar-at-ticket`, `filter-*`, `ticket-list-*`).
- **TAMBAH di FE:** hampir seluruh **§2 Linked Chat Bubble & Ticket Detail** — saat ini pakai class (`div.group`, `bg-pink-100`, `border-blue-600`), `role`, teks, atau id (`#conversation-buble`). Ini yang paling rawan gagal di automation; prioritaskan penambahan `data-cy`-nya.
- Untuk **state** (terpilih / sudah ber-ticket), gunakan atribut tambahan `data-selected` / `data-linked` pada `ticket-chat-bubble` daripada mengandalkan warna/class.
- Setelah `data-cy` ditanam, update `ticket-linked-bubble.page.js` agar semua locator pakai `getByTestId(...)`.

## Pemetaan ke test case (Test/ticket/)
- `Ticket lists.tsv` → §1 (`ticketing.spec.js` — Ticketing Smoke).
- `Ticket Detail.tsv`, `Ticket Room Conversation.tsv`, `CRUD Ticket.tsv` → §2 (`linked-bubble.spec.js` — grup APP/REM/NAV/REG).
- `Ticket - Bulk Reply + Open API.tsv` → §2g (reply) + Open API.
