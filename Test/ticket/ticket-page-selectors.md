# Ticket — Page Selector Map (data-cy)

> **Kontrak `data-cy` untuk FE (omnichannel-satuinbox-fe).** `testIdAttribute = 'data-cy'`.
> Konvensi: kebab-case (`monitoring-ticket-*`, `ticket-list-*`).
> Status: `DONE` = ditambahkan pada perubahan ini · `ADA` = sudah ada sebelumnya · `TAMBAH` = masih perlu.
> **Diperbarui & diverifikasi terhadap FE: 2026-06-15.**

> ⚠️ **Koreksi penting:** versi sebelumnya menandai seluruh §1 sebagai "ADA". Faktanya FE ticketing **tidak punya `data-cy` sama sekali** (0) sebelum perubahan ini. Tabel ticket FE sekarang adalah **TanStack table generic** (kolom standar + custom-attribute dinamis), bukan UI kurir. Status di bawah sudah dikoreksi.

---

## 1. Ticketing list — `/ticketing` (ticketing.page.js)

| Elemen | `data-cy` | Status |
|---|---|---|
| Nav Ticketing | `nav-link-Ticket` | ADA (side nav) |
| KPI: All / New / Need Response / Being Handled / Over SLA / Solved / Snoozed | `monitoring-ticket-all-ticket` / `-new-ticket` / `-need-response` / `-being-handled` / `-over-sla` / `-solved` / `-snoozed` | **DONE** |
| Tombol create ticket | `monitoring-ticket-create-ticket` | **DONE** |
| Searchbar | `searchbar-at-ticket` | **DONE** |
| Filter button | `filter-ticket-list` | **DONE** |
| Date range filter | `date-filter-ticket` | **DONE** |
| Sel: Ticket ID | `ticket-list-ticket-id` | **DONE** |
| Sel: Priority | `ticket-list-priority` | **DONE** |
| Sel: SLA | `ticket-list-sla` | **DONE** |
| Sel: Created at | `ticket-list-created-at` | **DONE** |
| Sel: Agent handler | `ticket-list-agent-handler` | **DONE** |
| Kolom custom-attribute apa pun | `ticket-list-<columnKey>` | **DONE** (auto, via `CustomAttributeCell`) |

### Kolom kurir = custom-attribute (auto-match)

`CustomAttributeCell` emit `ticket-list-<columnKey>` dengan `columnKey` = **title** custom attribute pada ticket type. Jadi bila tenant mengonfigurasi atribut berjudul `awb`, `destinasi`, `kendala`, `manifest-date`, `seller-name`, `seller-phone`, `kurir-logo`, `tracking` → otomatis jadi `ticket-list-awb`, `ticket-list-destinasi`, dst — **match automation**. (Match hanya jika title-nya persis slug tsb.)

### ⚠️ Diharapkan automation tapi TIDAK ada elemen di FE generic sekarang

| `data-cy` | Catatan |
|---|---|
| `ticket-list-button-solve` / `-tindak-lanjuti` / `-view-ticket` | Tidak ada tombol per-baris (FE: row-click → drawer + popover snooze) |
| `ticket-list-last-tracking` / `-last-tracking-button` | Kurir-specific, tak ada elemen |
| `ticket-list-awb-number` / `-destinasi-value` / `-manifest-date-value` / `-sla-value` | Sel sekarang satu elemen, bukan label+value terpisah |
| `ticket-list-checkbox` / `-table-heading-checkbox` | Dirender `molecules/table/Table.tsx` (generic, dipakai banyak domain) — perlu data-cy ber-scope ticket |
| `filter-by-courier` / `ticket-list-filter-kendala` | Field filter custom — ada hanya bila dikonfigurasi sebagai custom attribute |
| `monitoring-ticket-head-label` / `-more-action` | Tidak ada di header/KPI sekarang |

→ **Rekomendasi:** untuk baris di atas, perbarui `ticketing.page.js` (drop/ganti selector UI kurir lama) ATAU andalkan auto-match `ticket-list-<columnKey>` bila itu memang custom attribute.

---

## 2. Linked Chat Bubble & Ticket Detail (ticket-linked-bubble.page.js) — masih TAMBAH

(Belum diinstrumentasi — surface besar di ticket detail drawer / linked bubble. Dipertahankan sebagai kontrak untuk batch berikutnya.)

### 2a. Chat bubble & seleksi pesan
`conversation-chatroom-container`, `conversation-bubble-container`, `ticket-chat-bubble` (+ `data-selected` / `data-linked`), `bubble-see-ticket-link`, `bubble-menu-button`, `bubble-menu-select-messages`, `bubble-select-checkbox`, `selection-create-ticket-button`, `selection-cancel-button`.

### 2b. Dialog create ticket
`create-ticket-dialog`, `create-ticket-type-search`, `create-ticket-type-option`, `create-ticket-priority-option`, `create-ticket-confirm-button`, `created-ticket-review-dialog`, `duplicate-bubble-modal(-close)`.

### 2c. Ticket drawer & linked sections
`ticket-drawer`, `ticket-linked-messages-accordion`, `ticket-linked-conversation-accordion`, `conversation-linked-tickets-accordion`, `linked-ticket-item`, `ticket-sla-badge`, `ticket-close-button`, `ticket-reopen-button`.

### 2d. Append to ticket (picker)
`append-to-ticket-button`, `ticket-picker-modal`, `ticket-picker-search`, `ticket-picker-option`, `ticket-picker-confirm-button` / `-cancel-button`, `ticket-picker-empty`, `ticket-picker-already-linked-warning`, `linked-panel-add-to-ticket-button`.

### 2e. Remove linked bubble
`remove-linked-bubble-button`, `remove-bubble-confirm-dialog`, `remove-bubble-confirm-button` / `-cancel-button`.

### 2f. Linked Conversation panel & navigasi
`bubble-show-detail-chat-link`, `linked-conversation-panel`, `back-to-ticket-detail-button`, `linked-panel-message-checkbox`.

### 2g. Reply / Internal note & toast
`ticket-reply-customer-tab`, `ticket-internal-note-tab`, `ticket-reply-send-button`, `cross-send-confirm-button`, `ticket-toast`.

---

## 3. FE files instrumented (this change)

```
components/molecules/ticket/TicketKpiCards.tsx               → monitoring-ticket-* (KPI_DATA_CY map)
components/molecules/ticketing/TicketPageHeader.tsx          → monitoring-ticket-create-ticket
components/molecules/ticket/filter/TicketSearchWithField.tsx → searchbar-at-ticket
components/molecules/ticket/TicketingFilter.tsx              → filter-ticket-list
components/molecules/ticket/filter/TicketingDate.tsx         → date-filter-ticket
components/molecules/ticketing/table/TicketTableColumn.tsx   → ticket-list-ticket-id/priority/sla/created-at/agent-handler
components/molecules/ticketing/table/CustomAttributeCell.tsx → ticket-list-<columnKey>
```

## 4. Pemetaan ke test case (Test/ticket/)
- `Ticket lists.tsv` → §1 (ticketing smoke).
- `Ticket Detail.tsv`, `Ticket Room Conversation.tsv`, `CRUD Ticket.tsv` → §2 (linked bubble: APP/REM/NAV/REG).
- `Ticket - Bulk Reply + Open API.tsv` → §2g (reply) + Open API.
