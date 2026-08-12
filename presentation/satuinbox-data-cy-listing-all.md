# SatuInbox — Semua Listing `data-cy` (yang sudah ada)

> Kumpulan listing `data-cy` yang sudah ada di repo, disalin apa adanya dari `Test/*-page-selectors.md` (mapping contract untuk automation).
> Sumber asli tetap di `Test/` — file ini copy untuk presentation.
> Untuk dump constant murni dari FE, lihat `satuinbox-fe-data-cy-constants.md`.

---


<!-- source: Test/auth/auth-page-selectors.md -->

# Auth — Page Selector Map (data-cy)

> **Kontrak `data-cy` untuk auth (omnichannel-satuinbox-fe).**
> Tujuan: SEMUA elemen auth diseleksi via `data-cy` (bukan `#id`, `role`, teks, atau class). `testIdAttribute = 'data-cy'` → `getByTestId('X')` = `[data-cy="X"]`.
> Konvensi: **`PascalCase-Hyphen`** (mengikuti `Keyword-Input`, `Login-Submit-Button`).
> Status: **`ADA`** = sudah ada di FE · **`DONE`** = ditambahkan pada perubahan ini · **`TAMBAH`** = masih perlu ditambahkan.
> Konstanta: `apps/omnichannel/constants/data-cypress.ts` → `DATA_CYPRESS_AUTH`.
> Terakhir diperbarui: 2026-06-15.

---

## 1. Login — `/login` (V2 `/id/login`)

| Elemen | `data-cy` | Status |
|---|---|---|
| Auth section root | `Auth-Section` | ADA |
| Logo | `Satuinbox-Logo` | ADA |
| Container login | `Login-Container` | ADA |
| Form login | `Login-Form` | ADA |
| Input username/email | `Keyword-Input` | ADA |
| Input password | `Password-Input` | ADA |
| Toggle show password | `Show-Password` | ADA |
| Remember me | `Remember-Me` | ADA |
| Tombol login | `Login-Submit-Button` | ADA |
| Link reset password | `Reset-Password-Link` | **DONE** |
| Link register | `Register-Link` | **DONE** |
| Error card login | `Auth-Error` | **DONE** *(unified error card; menggantikan rencana `Login-Error-Message`)* |
| Error username wajib | `Keyword-Required-Message` | TAMBAH *(pesan inline `<p>` di TextInputField)* |
| Error password wajib | `Password-Required-Message` | TAMBAH |

> Login sukses → redirect `/conversation/your-inbox`.

## 2. Register — `/register` (V2 `/id/register`)

| Elemen | `data-cy` | Status |
|---|---|---|
| Form register | `Register-Form` | **DONE** |
| Fullname | `Fullname-Input` | ADA |
| Username | `Username-Input` | ADA |
| Email | `Email-Input` | ADA |
| Phone | `Phone-Input` | ADA |
| Password | `Password-Input` | ADA |
| Konfirmasi password | `Re-Enter-Password-Input` | ADA |
| Tombol daftar | `Register-Submit-Button` | **DONE** |
| Link ke login | `Login-Link` | **DONE** |
| Error fullname/username/email/phone/password/konfirmasi | `*-Error-Message` | TAMBAH |
| Pesan sukses register | `Register-Success-Message` | TAMBAH |
| Tombol kirim ulang email | `Resend-Email-Button` | TAMBAH |

## 3. Reset Password — `/reset-password`

| Elemen | `data-cy` | Status |
|---|---|---|
| Form reset | `Reset-Password-Form` | **DONE** |
| Input email | `Email-Input` | **DONE** |
| Tombol kirim link | `Reset-Password-Submit-Button` | **DONE** |
| Link ke login | `Login-Link` | **DONE** |

## 4. Set New Password — `/set-new-password?token=…`

| Elemen | `data-cy` | Status |
|---|---|---|
| Form set password | `Set-New-Password-Form` | **DONE** |
| Input password | `Password-Input` | **DONE** |
| Tombol submit | `Set-New-Password-Submit-Button` | **DONE** |
| Error card | `Auth-Error` | **DONE** |

## 5. Verify Email — `/verification?token=…`

| Elemen | `data-cy` | Status |
|---|---|---|
| Tombol verifikasi email | `Verify-Email-Button` | **DONE** |

> Verifikasi sukses → redirect `/login`.

## 6. Logout (in-app — main side nav footer)

| Elemen | `data-cy` | Status |
|---|---|---|
| User menu (avatar popover) | `User-Menu` | **DONE** |
| Tombol logout | `Logout-Button` | **DONE** |

> Flow: klik `User-Menu` → popover → `Logout-Button` → redirect `/login`.

---

## 7. Onboarding — (masih TAMBAH, belum diinstrumentasi)

| Elemen | `data-cy` | Status |
|---|---|---|
| Nama perusahaan | `Company-Input` | TAMBAH |
| NIB | `NIB-Input` | TAMBAH |
| NPWP | `NPWP-Input` | TAMBAH |
| ID number | `ID-Number-Input` | TAMBAH |
| Upload file | `Onboarding-File-Upload` | TAMBAH |
| Tombol verifikasi email | `Verify-Email-Button` | TAMBAH |
| Tombol submit | `Onboarding-Submit-Button` | TAMBAH |
| Tombol keluar | `Onboarding-Exit-Button` | TAMBAH |
| Pesan error validasi | `Onboarding-Error-Message` | TAMBAH |

## 8. Member Management — `/settings/organization/members` (masih TAMBAH)

| Elemen | `data-cy` | Status |
|---|---|---|
| Judul halaman | `Member-Page-Title` | TAMBAH |
| Tombol tambah anggota | `Add-Member` | ADA |
| Tab Member/Invited | `Member-Tab-Active` / `Member-Tab-Invited` | TAMBAH (ganti `Tabs-0/1` index-based) |
| Search anggota | `Member-Search-Input` | TAMBAH |
| Baris anggota | `Member-Row` | TAMBAH |
| Badge status | `Member-Status-Badge` | TAMBAH |
| Menu titik tiga | `Member-Row-Menu-Button` | TAMBAH |
| Menu item: Nonaktifkan/Aktifkan/Ganti Peran/Shift/Password/Max Conv/Hapus | `Member-Menu-*` | TAMBAH |
| Modal konfirmasi + tombol konfirmasi/batal | `Member-Confirm-Modal` / `-Confirm-Button` / `-Cancel-Button` | TAMBAH |
| Toast hasil | `Member-Toast` | TAMBAH |
| Invite email input + kirim | `Member-Invite-Email-Input` / `Send-Invitation` | TAMBAH / ADA |

---

## Ringkasan

- **Sudah diterapkan (DONE pada perubahan ini):** semua flow inti auth — login links + error card, register form/submit/link, reset password (form/email/submit/link), set new password (form/input/submit), verify email, logout (user menu + logout).
- **Sudah ADA sebelumnya:** login inputs/form/submit/remember-me/container, register inputs, auth section root, logo, show-password.
- **Masih TAMBAH:** pesan validasi/error level-field (login & register), register success + resend, seluruh **Onboarding**, seluruh **Member Management**.
- Setelah `data-cy` di-build, page object di sixV2Automation tinggal pakai `getByTestId(...)` — lihat `auth.page.js`.

---


<!-- source: Test/conversation/conversation-page-selectors.md -->

# Conversation Page — Element Selector Map (data-cy)

> **Domain:** Conversation (SatuInbox V2)
> **Synced to actual FE state:** 2026-06-15 (the FE team restructured selectors into constant groups; this map reflects the **current** names).
> **Constants:** `apps/omnichannel/constants/data-cypress.ts` — `DATA_CYPRESS_CONVERSATION`, `DATA_CYPRESS_CHAT_ROOM`, `DATA_CYPRESS_CHAT_LIST_ITEM`, `DATA_CYPRESS_CHAT_DETAIL`, `DATA_CYPRESS_QUICK_ACTION`.
> `testIdAttribute = 'data-cy'` → `getByTestId('X')` = `[data-cy="X"]`.

Conventions in use: PascalCase-Hyphen for grouped constants (`Chat-Room-Header`, `Chat-Detail-Section-…`), lowercase-kebab for chat-list-item sub-keys, camel-prefixed for chat-list controls (`chatList-…`, `chatRoom-…`), and `inbox-nav-…` / `channel-nav-…` / `team-…` for nav.

---

## 1. Layout & root

| Element | `data-cy` |
|---|---|
| Conversation page root | `Conversation-Section` |
| Left nav sidebar | `Conversation-Sidebar-Navigation` |
| Chat list container | `conversation-list` |
| Chat list header | `Conversation-Chat-List-Header` |
| Chat list title | `Conversation-Chat-List-Page-Section` |

## 2. Navigation (left sidebar)

| Element | `data-cy` |
|---|---|
| Inbox item | `inbox-nav-<id>` → `inbox-nav-your-inbox`, `inbox-nav-unassigned`, `inbox-nav-all`, `inbox-nav-spam`, `inbox-nav-starred`, `inbox-nav-junk` |
| Channel item | `channel-nav-<channelId>` (e.g. `channel-nav-whatsapp_web`) |
| Team item (1-based) | `team-1`, `team-2`, … |

## 3. Chat list — header, search, filters

| Element | `data-cy` |
|---|---|
| Sidebar collapse toggle | `chatList-navPanelControlButton` |
| Search toggle | `chatList-searchButton` |
| Loading skeleton | `conversation-list-skeleton` |
| Empty state | `conversation-empty-state` |
| Status filter | `chatList-filter-status` |
| Read filter | `chatList-filter-read` |
| Sort filter | `chatList-filter-sort` |
| Layout/visibility | `chatList-filter-visibility` |
| Advanced filter | `chatList-filter-advance` |

## 4. Chat list item

Row base: **`chat-list-<n>`** (1-based, e.g. `chat-list-1`). Sub-elements: **`chat-list-<n>-<key>`** (via `getChatListItemDataCy(base, key)`).

| Sub-element | key (`chat-list-<n>-<key>`) |
|---|---|
| Contact name | `name` |
| Latest message | `latest-message` |
| Email subject | `email-subject` |
| Channel icon | `channel-icon` |
| Avatar | `avatar` |
| Bulk checkbox | `checkbox` |
| Account-channel number | `account-channel-number` |
| Pinned icon | `pinned-icon` |
| Starred icon | `starred-icon` |
| Timestamp | `timestamp` |
| Unread count | `unread-count` |
| SLA badge | `sla-badge` |
| Quick-action trigger | `quick-action` |
| Tag container | `tag-container` |
| Tag item (1-based) | `tag-1`, `tag-2`, … |
| Tag overflow | `tag-overflow` |
| Ticket badge | `ticket-badge` |
| Typing indicator | `typing-indicator` |

### Quick-action menu items (popover opened by `…-quick-action`)

| Item | `data-cy` |
|---|---|
| Assign to | `quick-action-assign` |
| Mark read/unread | `quick-action-mark-read` |
| Set reminder | `quick-action-reminder` |
| Pin/unpin | `quick-action-pin` |
| Close | `quick-action-close` |
| Reopen | `quick-action-reopen` |
| Star/unstar | `quick-action-star` |
| Spam/unspam | `quick-action-spam` |
| Junk/unjunk | `quick-action-junk` |

## 5. Chat room (`DATA_CYPRESS_CHAT_ROOM`)

| Element | `data-cy` |
|---|---|
| Room container | `Chat-Room-Container` |
| Header | `Chat-Room-Header` |
| Contact name | `Chat-Room-Header-Contact-Name` |
| Contact avatar | `Chat-Room-Header-Contact-Avatar` |
| Close conversation | `chatRoom-closeConversationButton` |
| Reopen conversation | `chatRoom-reopenConversationButton` |
| Messages container | `Messages-Container` |
| Bubble (by message id) | `Message-Bubble-<messageId>` |
| Bubble (generic) | `Message-Bubble` |
| Message content | `Message-Content` |
| Message sender info | `Message-Sender-Info` |
| Day separator | `Day-Separator` |
| Number-change separator | `Number-Change-Separator` |
| Utility separator | `Utility-Separator` |
| Input area container | `Input-Area-Container` |
| Input disabled state | `Input-Area-Disabled` |
| Message textarea | `Message-Text-Input` |
| Send | `Send-Button` |
| Emoji | `Emoji-Button` |
| Macro | `Macro-Button` |
| Attach file | `Attach-File-Button` |
| Account/number selector | `Account-Channel-Selector` |
| Account option (by id) | `Account-Channel-<channelId>` |

### Room banners

| Element | `data-cy` |
|---|---|
| Expired WhatsApp banner | `Chat-Room-Expired-Whatsapp-Banner` |
| → Send template button | `Chat-Room-Send-Template-Button` |
| Removed-from-conversation banner | `Chat-Room-Removed-Banner` |
| No connected session banner | `Chat-Room-No-Session-Banner` |
| → Connect WA Web button | `Chat-Room-No-Session-Button` |

### Screenshot (existing)

`modal-screenshot-container`, `popupArea-metadata-modal-screenshot`, `cancel-ss-button`, `send-ss-button`.

## 6. Detail panel (`DATA_CYPRESS_CHAT_DETAIL`)

| Element | `data-cy` |
|---|---|
| Detail title | `Chat-Detail-Title` |
| Copy conversation ID | `Chat-Detail-Copy-Id-Button` |
| Accordion section | `Chat-Detail-Section-<slug>` |

Section slugs: `assignee`, `attributes`, `custom-attributes`, `session`, `client-data`, `linked-tickets`, `group-member`, `screenshot`, `pinned`, `history`, `media`, `files`, `notes`, `events`, `tags`.

### SLA metric labels (inside `Chat-Detail-Section-assignee`)

| Metric | `data-cy` |
|---|---|
| FRT | `Chat-Detail-Sla-frt` |
| TTC | `Chat-Detail-Sla-ttc` |
| RLT (and Handling Time pending state) | `Chat-Detail-Sla-rlt` |
| Wait Time (and Queue Time pending state) | `Chat-Detail-Sla-wait-time` |

> Value badge is the sibling of the label inside the row.

## 7. Modals

| Modal | Container | Key controls |
|---|---|---|
| Assign (single, quick action) | `Assign-Conversation-Modal` | `Assign-Modal-Cancel-Button`, `Assign-Modal-Submit-Button` |
| Bulk assign | `Bulk-Assign-Conversation-Modal` | (shared footer) `Assign-Modal-Cancel-Button`, `Assign-Modal-Submit-Button` |
| Assign member (detail) | `Assign-Member-Modal` | `Assign-Member-Search-Input`, `Assign-Member-Cancel-Button`, `Assign-Member-Submit-Button` |
| Assign team (detail) | `Assign-Team-Modal` | `Assign-Team-Search-Input`, `Assign-Team-Cancel-Button`, `Assign-Team-Submit-Button` |
| Unassign member | `Unassign-Member-Modal` | `Unassign-Member-Cancel-Button`, `Unassign-Member-Remove-Button` |
| Create ticket | `Create-Ticket-Modal` | `Create-Ticket-Search-Input`, `Create-Ticket-Cancel-Button`, `Create-Ticket-Submit-Button` |
| Junk reason | `Junk-Modal` | `Junk-Modal-Reason-Select`, `Junk-Modal-Note-Input`, `Junk-Modal-Cancel-Button`, `Junk-Modal-Confirm-Button` |
| Bulk validation | `Bulk-Validation-Modal` | `Bulk-Validation-Cancel-Button`, `Bulk-Validation-Confirm-Button` |
| Adjust account | `Adjust-Account-Modal` | `Adjust-Account-Select`, `Adjust-Account-Save-Button` |

## 8. ⚠️ Still uninstrumented (mapped, no data-cy yet)

- Chat-list **search input** & **clear** button (only the toggle `chatList-searchButton` exists).
- Filter **option items** inside each `chatList-filter-*` popover.
- Room header **screenshot / create-ticket / toggle-detail** icon buttons.
- **Macro autocomplete list** items, **reply preview**, **media preview** (shared UI components).
- Detail **Team Inbox / Assignee rows** (only the SLA labels + section are tagged).

These can be added next using the same convention.

---


<!-- source: Test/ticket/ticket-page-selectors.md -->

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

---
