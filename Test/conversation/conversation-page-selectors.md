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
