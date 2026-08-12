# SatuInbox FE — `data-cy` Coverage & Gap Audit

> Verified against actual FE source 2026-08-05 (`omnichannel-satuinbox-fe` branch `data-cy`).
> Status key: **ADA** = ada di FE · **CONST** = didefinisikan di constant tapi 0 usage · **GAP** = belum ada di FE sama sekali.

---

## img1 — Root (main-side-nav)

| Element | `data-cy` | Status | Note |
|---|---|---|---|
| Logo | `Satuinbox-Logo` | ADA | `DATA_CYPRESS.SATUINBOX_LOGO` |
| Sidebar nav container | `Sidebar-Navigation` | ADA | `DATA_CYPRESS.SIDENAV` |
| Nav item list | `Sidebar-Navigation-List` | ADA | `DATA_CYPRESS.SIDENAV_LIST` |
| User menu (avatar popover) | `User-Menu` | ADA | `DATA_CYPRESS_AUTH.USER_MENU` |
| Logout button | `Logout-Button` | ADA | `DATA_CYPRESS_AUTH.LOGOUT_BUTTON` |
| Per-icon nav (Inbox/Ticket/Broadcast/Statistic/Contact/Billing) | — | **GAP** | keyed by `item.id` (1–6), no data-cy per item. Map claims `nav-link-Ticket` → 0 match in repo |
| Notification bell badge | — | **GAP** | no data-cy |
| Settings gear icon | — | **GAP** | no data-cy |

---

## img2 — Navigation (conversations/nav-lists)

| Element | `data-cy` | Status | Note |
|---|---|---|---|
| Conversation sidebar nav | `Conversation-Sidebar-Navigation` | ADA | `DATA_CYPRESS_CONVERSATION.CONVERSATION_SIDENAV` |
| Inbox item (your-inbox, unassigned, all, spam, starred, junk) | `inbox-nav-${item.id}` | ADA | dynamic, e.g. `inbox-nav-your-inbox` |
| Channel item | `channel-nav-${channel.id}` | ADA | e.g. `channel-nav-whatsapp_web` |
| Team item | `team-${index+1}` | ADA | 1-based |
| Section header toggle "Saluran" | — | **GAP** | chevron down, no data-cy |
| Section header toggle "Kotak Masuk Tim" | — | **GAP** | chevron down, no data-cy |
| Add team button (+ icon) | — | **GAP** | no data-cy |
| Count badge per nav item | — | **GAP** | CountBadge.tsx has no data-cy |

---

## img3 — Chat List (chat-lists) — PALING LENGKAP

| Element | `data-cy` | Status | Note |
|---|---|---|---|
| **Container & header** | | | |
| Chat list container | `conversation-list` | ADA | `DATA_CYPRESS_CONVERSATION.CONVERSATION_CHAT_LISTS_CONTAINER` |
| Chat list header | `Conversation-Chat-List-Header` | ADA | |
| Chat list title/section | `Conversation-Chat-List-Page-Section` | ADA | |
| Empty state | `conversation-empty-state` | ADA | |
| Loading skeleton | `conversation-list-skeleton` | ADA | |
| **Filter bar** | | | |
| Sidebar collapse toggle | `chatList-navPanelControlButton` | ADA | |
| Search toggle button | `chatList-searchButton` | ADA | |
| Status filter | `chatList-filter-status` | ADA | |
| Read filter | `chatList-filter-read` | ADA | |
| Sort filter | `chatList-filter-sort` | ADA | |
| Layout/visibility filter | `chatList-filter-visibility` | ADA | |
| Advanced filter | `chatList-filter-advance` | ADA | |
| Search input field | — | **GAP** | only toggle exists |
| Search clear button | — | **GAP** | |
| Filter option items inside popover | — | **GAP** | |
| **Chat list item sub-elements** (pattern: `chat-list-<n>-<key>`) | | | |
| Row base | `chat-list-<n>` | ADA | 1-based |
| Contact name | `-name` | ADA | `DATA_CYPRESS_CHAT_LIST_ITEM.NAME` |
| Latest message | `-latest-message` | ADA | |
| Email subject | `-email-subject` | ADA | |
| Channel icon | `-channel-icon` | ADA | |
| Avatar | `-avatar` | ADA | |
| Bulk checkbox | `-checkbox` | ADA | |
| Account-channel number | `-account-channel-number` | ADA | |
| Pinned icon | `-pinned-icon` | ADA | |
| Starred icon | `-starred-icon` | ADA | |
| Timestamp | `-timestamp` | ADA | |
| Unread count | `-unread-count` | ADA | |
| SLA badge | `-sla-badge` | ADA | |
| Quick-action trigger | `-quick-action` | ADA | |
| Tag container | `-tag-container` | ADA | |
| Tag item | `tag-<n>` | ADA | 1-based |
| Tag overflow | `-tag-overflow` | ADA | |
| Ticket badge | `-ticket-badge` | ADA | |
| Typing indicator | `-typing-indicator` | ADA | |
| **Quick-action menu items** (popover) | | | |
| Assign to | `quick-action-assign` | ADA | |
| Mark read/unread | `quick-action-mark-read` | ADA | |
| Set reminder | `quick-action-reminder` | ADA | |
| Pin/unpin | `quick-action-pin` | ADA | |
| Close | `quick-action-close` | ADA | |
| Reopen | `quick-action-reopen` | ADA | |
| Star/unstar | `quick-action-star` | ADA | |
| Spam/unspam | `quick-action-spam` | ADA | |
| Junk/unjunk | `quick-action-junk` | ADA | |
| **Modals (chat-lists)** | | | |
| Assign conversation modal | `Assign-Conversation-Modal` | ADA | |
| Bulk assign modal | `Bulk-Assign-Conversation-Modal` | ADA | |
| Assign modal cancel/submit | `Assign-Modal-Cancel-Button` / `-Submit-Button` | ADA | |
| Bulk validation modal | `Bulk-Validation-Modal` | ADA | |
| Bulk validation cancel/confirm | `Bulk-Validation-Cancel-Button` / `-Confirm-Button` | ADA | |
| Junk reason modal | `Junk-Modal` | ADA | |
| Junk reason select | `Junk-Modal-Reason-Select` | ADA | |
| Junk note input | `Junk-Modal-Note-Input` | ADA | |
| Junk cancel/confirm | `Junk-Modal-Cancel-Button` / `-Confirm-Button` | ADA | |

---

## img4 — Chat Room (chat-room) — GAP di header icons & 6 constant-only

| Element | `data-cy` | Status | Note |
|---|---|---|---|
| **Room container** | | | |
| Room container | `Chat-Room-Container` | CONST | defined `DATA_CYPRESS_CHAT_ROOM`, 0 usage in FE |
| **Header** | | | |
| Header | `Chat-Room-Header` | ADA | |
| Contact name | `Chat-Room-Header-Contact-Name` | ADA | |
| Contact avatar | `Chat-Room-Header-Contact-Avatar` | ADA | |
| Close conversation button | `chatRoom-closeConversationButton` | ADA | |
| Reopen conversation button | `chatRoom-reopenConversationButton` | ADA | |
| Screenshot trigger icon (camera-plus) | — | **GAP** | `toggleDetails` onClick, no data-cy |
| Detail toggle icon (panel/box) | — | **GAP** | `toggleDetails`, no data-cy |
| Create ticket icon | — | **GAP** | no data-cy |
| **Messages** | | | |
| Messages container | `Messages-Container` | ADA | |
| Message bubble (by id) | `Message-Bubble-${messageId}` | ADA | |
| Message bubble (generic) | `Message-Bubble` | ADA | |
| Message content text | `Message-Content` | CONST | defined, 0 usage |
| Message sender info | `Message-Sender-Info` | CONST | defined, 0 usage |
| **Separators** | | | |
| Day separator | `Day-Separator` | ADA | |
| Number-change separator | `Number-Change-Separator` | CONST | defined, 0 usage |
| Utility separator | `Utility-Separator` | CONST | defined, 0 usage |
| **Input area** | | | |
| Input area container | `Input-Area-Container` | ADA | |
| Input area disabled state | `Input-Area-Disabled` | CONST | defined, 0 usage |
| Message textarea | `Message-Text-Input` | ADA | |
| Send button | `Send-Button` | ADA | |
| Emoji button | `Emoji-Button` | ADA | |
| Macro button | `Macro-Button` | ADA | |
| Attach file button | `Attach-File-Button` | ADA | |
| **Account channel selector** | | | |
| Account channel selector | `Account-Channel-Selector` | ADA | |
| Account option (by id) | `Account-Channel-${channelId}` | ADA | |
| **Room banners** | | | |
| Expired WhatsApp banner | `Chat-Room-Expired-Whatsapp-Banner` | ADA | |
| Send template button | `Chat-Room-Send-Template-Button` | ADA | |
| Removed-from-conversation banner | `Chat-Room-Removed-Banner` | ADA | |
| No session banner | `Chat-Room-No-Session-Banner` | ADA | |
| Connect WA Web button | `Chat-Room-No-Session-Button` | ADA | |
| **Screenshot modal** | | | |
| Screenshot container | `modal-screenshot-container` | ADA | |
| Screenshot metadata area | `popupArea-metadata-modal-screenshot` | ADA | |
| Cancel screenshot | `cancel-ss-button` | ADA | |
| Send screenshot | `send-ss-button` | ADA | |
| **Create ticket modal** | | | |
| Create ticket modal | `Create-Ticket-Modal` | ADA | |
| Create ticket search | `Create-Ticket-Search-Input` | ADA | |
| Create ticket cancel/submit | `Create-Ticket-Cancel-Button` / `-Submit-Button` | ADA | |
| **Adjust account modal** | | | |
| Adjust account modal | `Adjust-Account-Modal` | ADA | |
| Adjust account select | `Adjust-Account-Select` | ADA | |
| Adjust account save | `Adjust-Account-Save-Button` | ADA | |

---

## img5 — Chat Detail (chat-detail) — GAP di header controls & rows

| Element | `data-cy` | Status | Note |
|---|---|---|---|
| **Header** | | | |
| Detail title | `Chat-Detail-Title` | ADA | |
| Copy ID button | `Chat-Detail-Copy-Id-Button` | ADA | |
| Back button | `Chat-Detail-Back-Button` | CONST | defined, 0 usage |
| Header container | `Chat-Detail-Header` | CONST | defined, 0 usage |
| Toggle button (collapse panel) | `Chat-Detail-Toggle-Button` | CONST | defined, 0 usage |
| **Accordion sections** (all) | | | |
| assignee | `Chat-Detail-Section-assignee` | ADA | hardcoded, NOT via constant |
| attributes | `Chat-Detail-Section-attributes` | ADA | hardcoded |
| custom-attributes | `Chat-Detail-Section-custom-attributes` | ADA | hardcoded |
| session | `Chat-Detail-Section-session` | ADA | hardcoded |
| client-data | `Chat-Detail-Section-client-data` | ADA | hardcoded |
| linked-tickets | `Chat-Detail-Section-linked-tickets` | ADA | hardcoded |
| group-member | `Chat-Detail-Section-group-member` | ADA | hardcoded |
| screenshot | `Chat-Detail-Section-screenshot` | ADA | hardcoded |
| pinned | `Chat-Detail-Section-pinned` | ADA | hardcoded |
| history | `Chat-Detail-Section-history` | ADA | hardcoded |
| media | `Chat-Detail-Section-media` | ADA | hardcoded |
| files | `Chat-Detail-Section-files` | ADA | hardcoded |
| notes | `Chat-Detail-Section-notes` | ADA | hardcoded |
| events | `Chat-Detail-Section-events` | ADA | hardcoded |
| tags | `Chat-Detail-Section-tags` | ADA | hardcoded |
| **SLA metrics** (inside assignee section) | | | |
| FRT label | `Chat-Detail-Sla-frt` | ADA | hardcoded string |
| TTC label | `Chat-Detail-Sla-ttc` | ADA | hardcoded |
| RLT / Handling Time label | `Chat-Detail-Sla-rlt` | ADA | hardcoded |
| Wait Time / Queue Time label | `Chat-Detail-Sla-wait-time` | ADA | hardcoded |
| SLA value badge (per metric) | — | **GAP** | sibling of label, no data-cy |
| **Rows** | | | |
| Assignee row | `Chat-Detail-Assignee-Row` | CONST | defined, 0 usage |
| Team inbox row | `Chat-Detail-Team-Inbox-Row` | CONST | defined, 0 usage |
| **Modals (chat-detail)** | | | |
| Assign member modal | `Assign-Member-Modal` | ADA | |
| Assign member search/cancel/submit | `Assign-Member-Search-Input` / `-Cancel-Button` / `-Submit-Button` | ADA | |
| Assign team modal | `Assign-Team-Modal` | ADA | |
| Assign team search/cancel/submit | `Assign-Team-Search-Input` / `-Cancel-Button` / `-Submit-Button` | ADA | |
| Unassign member modal | `Unassign-Member-Modal` | ADA | |
| Unassign cancel/remove | `Unassign-Member-Cancel-Button` / `-Remove-Button` | ADA | |
| **Other (img5 visible)** | | | |
| Note input (Tambah catatan) | — | **GAP** | no data-cy |
| Media section badge/count | — | **GAP** | no data-cy |
| "+ Koleksi" button | — | **GAP** | no data-cy |
| "+ Tambah Lagi" (assignee add) | — | **GAP** | no data-cy |
| "Lihat semua >" link | — | **GAP** | no data-cy |

---

## Ringkasan

| Section | ADA | CONST-only | GAP | Coverage |
|---|---|---|---|---|
| img1 — Root/SideNav | 5 | 0 | 3 (nav icons, notif, settings) | 63% |
| img2 — Nav lists | 4 | 0 | 4 (section toggle, add team, badge) | 50% |
| img3 — Chat list | 44 | 0 | 3 (search input/clear, filter items) | 94% |
| img4 — Chat room | 28 | 6 | 5 (header icons, SLA value, content/sender) | 81% |
| img5 — Chat detail | 22 | 5 | 8 (back/header/toggle, rows, SLA value, note/media/add) | 69% |

**Critical:** `DATA_CYPRESS_CHAT_DETAIL` (Back/Header/Toggle/AssigneeRow/TeamRow) & `DATA_CYPRESS_CHAT_ROOM` (Container/Content/Sender/Disabled/NumberSep/UtilitySep) — **11 key defined di constant, 0 dipakai di FE**. Either belum di-wire (perlu ubah hardcoded → constant reference) atau dead code.

**All chat-detail `Chat-Detail-Section-*`** dipakai tapi **hardcoded string**, bukan via `DATA_CYPRESS_CHAT_DETAIL.SECTION(slug)`. Same pattern for SLA labels.
