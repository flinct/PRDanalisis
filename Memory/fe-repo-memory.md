# FE Repo Memory

> **Sumber:** `C:\Users\MyBook SAGA 12\Desktop\FE satuinbox\omnichannel-satuinbox-fe`
> **Aplikasi utama:** `apps/omnichannel`
> **Aplikasi kedua:** `apps/widget`
> **Dibuat:** 2026-05-25
> **Fungsi:** Canonical reference untuk arsitektur FE, routing, komponen, state management, dan implementation status.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| State Management | Zustand (`stores/`) |
| Server State | React Query / TanStack Query (`services/`) |
| Styling | Tailwind CSS |
| i18n | next-intl (`[locale]` route segment) |
| Forms | react-hook-form + Zod (`validations/`) |
| UI Components | Custom atoms/molecules (no major UI library) |
| WebSocket | Socket.IO client |
| Real-time | Zustand stores updated via socket events |
| Virtual Scrolling | Custom implementation in chat list |

---

## 2. Project Structure

```
apps/omnichannel/
├── app/[locale]/
│   ├── (auth)/                    # Login, register, onboarding, verification
│   ├── (main)/                    # Main app (requires auth)
│   │   ├── layout.tsx             # Dashboard layout (SideNav + NotificationSocket)
│   │   ├── conversation/          # Core conversation module
│   │   ├── ticketing/             # Ticketing module
│   │   ├── broadcast/             # Broadcast module
│   │   ├── settings/              # Settings module
│   │   ├── statistic/             # Analytics
│   │   ├── contacts/              # Contact management
│   │   └── leads/                 # Lead management
│   ├── csat/
│   └── layout.tsx                 # Root layout (Providers, Toast, fonts)
├── components/
│   ├── atoms/                     # Small reusable UI (Badge, Button)
│   ├── molecules/                 # Feature components
│   │   ├── conversations/         # Chat list, room, detail, nav
│   │   ├── ticketing/             # Ticket list, drawer, chat-room
│   │   ├── ticket/                # Ticket forms, SLA, filters
│   │   ├── settings/              # Settings pages (WA Web, WA API, etc.)
│   │   ├── broadcast/            # Broadcast features
│   │   ├── main-side-nav/        # App-level side navigation
│   │   └── table/                 # Generic table component
│   ├── pages/                     # Page-level orchestrators
│   │   ├── ManageConversationPage.tsx
│   │   ├── ManageTicketingPage.tsx
│   │   └── settings/
│   └── providers/                 # Socket providers, etc.
├── constants/
│   ├── navigations/               # Nav sections, inbox items, filter keys
│   ├── settings/                  # WhatsApp, platform, channel constants
│   └── pages.ts                   # Route paths
├── hooks/
│   ├── conversation/              # 28 hooks (socket, message, cache, filters)
│   ├── ticket/                    # 15+ hooks (API, room, actions, socket, cache)
│   ├── account-channel/           # WhatsApp account hooks
│   └── whatsapp-api/              # WhatsApp Cloud API OAuth hooks
├── services/                      # React Query hooks (API calls)
│   ├── conversation/              # 12 service files
│   ├── ticket/                    # 20+ service files
│   ├── conversation-sla-metrics/  # SLA metrics query
│   ├── sla-setting/               # SLA settings queries
│   ├── accountChannel.service.ts  # Account channel CRUD
│   └── channel/                   # Channel queries
├── stores/                        # Zustand stores
│   ├── conversation/              # 8 stores (nav, filter, bulk, layout, input, message)
│   ├── ticket/                    # 7 stores (list, message, input, resolve, tag, bulk-reply)
│   └── whatsappWeb.store.ts       # WhatsApp Web settings state
├── types/                         # TypeScript type definitions
│   ├── conversation/              # Conversation, message, SLA metrics, events
│   ├── ticket.ts                  # Ticket, SLA, stages, custom attributes
│   ├── ticket-view-settings.ts    # Column config types
│   └── setting/channel/           # WA Web, WA API, account group types
├── helpers/
├── schemas/                       # Zod validation schemas
├── validations/                   # Form validation
├── i18n/
├── mappers/
├── utils/
└── proxy.ts                       # Permission middleware
```

---

## 3. Routing & Navigation

### URL Structure (`/[locale]/(main)/`)

| Route | Module | Description |
|-------|--------|-------------|
| `/conversation/[convoSection]` | Conversation | Core inbox (dynamic section) |
| `/ticketing` | Ticketing | Ticket management |
| `/broadcast/{messages,draft,templates}` | Broadcast | Mass messaging |
| `/settings/channels/whatsapp-web` | WhatsApp Web | WA account management |
| `/settings/channels/whatsapp-api` | WhatsApp API | WA Cloud API settings |
| `/settings/channels/addon` | Add-ons | Instagram, Messenger, Email, Telegram |
| `/statistic` | Analytics | Reporting |
| `/contacts` | Contacts | Contact list |
| `/leads` | Leads | Lead management |
| `/notification` | Notifications | Notification center |

### Conversation Dynamic Sections
`[convoSection]` maps to: `your-inbox`, `unassigned`, `all`, `starred`, `spam`, `junk`, `channel`, `team`, `group-chat`

### Navigation Hierarchy (3 levels)
1. **SideNav** (64px) — App modules: Inbox, Ticketing, Broadcast, Statistic, Contacts, Leads
2. **ConversationNav** (260px) — Inbox items, Channels accordion, Team Inboxes accordion
3. **Settings SideNav** — Settings sub-navigation

---

## 4. Key Data Models

### Conversation (from `packages/types/src/conversation.ts`)
```typescript
interface Conversation {
  id, parentReOpenId?, conversationNumber?
  channel: DataSourceChannel
  accountChannel: AccountChannel[]
  contactInfo: ContactInfo
  memberContactInfo?: ContactInfo[]
  status: 'open' | 'close'
  priority?, tags?, isGroup?, isTicket?
  favorites[], spams[], isJunked?, isPinned?
  unread?, latestMessage?, pinnedMessage[]
  team?: TeamInfo
  participants?: ParticipantInfo[]
  sessionDetails?, lastReEngagementAt?
}
```

### Conversation SLA Metrics (from `types/conversation/conversation-sla-metrics.ts`)
```typescript
interface ConversationSLAMetrics {
  firstCustomerMessageAt, frtCountingStartAt
  firstAgentAssignmentAt?, firstAgentReplyAt?
  conversationCreatedAt, conversationClosedAt?
  frtMs, ttcMs, waitTimeInQueueMs?, rltMs?
  firstAssigneeId?, firstResponderId?
  officeHoursSnapshot?, isFrtPaused?, isTtcPaused?
  pausedIntervals[], totalPausedMs, totalFrtPausedMs, totalTtcPausedMs
}
```

### Ticket (from `types/ticket.ts` — 726 lines)
```typescript
interface Ticket {
  id, status: 'open' | 'close', ticketNumber
  priority: TicketPriorityEnum, needResponse: boolean
  title, description, currentStageId
  stages: StageTicket[]
  customAttributes: CustomAttribute[]
  ticketTypeId, team, participants?, conversationId?
  tags?, createdBy, updatedBy
  firstResponseDue?, timeToCloseDue?, resolveAt?
  firstResponseTimeMs?, shiftHoursFirstResponseTimeMs?
  timeToCloseMs?, shiftHoursTimeToCloseMs?
  firstResponseAt?, closedAt?
  slaState?: TicketSlaState  // cycleId, isPaused, totalPausedMs, pauseOnWaitingCustomer
  snooze: TicketSnooze
  reminder?: TicketReminder
}
```

### WhatsApp Web Account (from `types/setting/channel/whatsapp-web.ts`)
```typescript
interface WhatsappWebAccount {
  accountId, phoneNumber, accountName
  connectionStatus: 'connected' | 'disconnected' | 'inactive'
  accountStatus: 'used' | 'standby'
  totalOutbound?, broadcastLimit?
  teamInbox?, accountGroupId?
}
```

---

## 5. State Management (Zustand Stores)

### Conversation Stores (`stores/conversation/`)
| Store | Key State |
|-------|-----------|
| `conversationNav.store` | Active section, inbox tab, channel, team |
| `conversationFilter.store` | Filter state (persisted to localStorage) |
| `conversationBulkAction.store` | Bulk selection |
| `conversationAdvancedFilter.store` | Advanced filter conditions |
| `conversationLayout.store` | Column visibility |
| `conversation-input` | Chat input state |
| `message.store` | Active conversation, messages, modals |

### Ticket Stores (`stores/ticket/`)
| Store | Key State |
|-------|-----------|
| `ticket.store` | Selection, filters, search, view, modals |
| `message.store` | Active ticket room messages |
| `ticket-chat-input.store` | Input state, media files |
| `resolve.store` | Bulk resolve modal |
| `add-tag.store` | Bulk add tag modal |
| `remove-tag.store` | Bulk remove tag modal |
| `bulk-reply.store` | Bulk reply modal (persisted localStorage) |

### WhatsApp Web Store (`stores/whatsappWeb.store.ts`)
| Key State | Description |
|-----------|-------------|
| `selectedAccount` | Active account for connect modal |
| `connectModalOpen` | QR connect modal visibility |
| `isQrExpired` | QR expiration state |
| `selectedGroupData` | Active group for operations |
| Filter params | Search, status, date range, team, pagination |

---

## 6. Service Layer (React Query)

### Pattern
```
services/<domain>/          → React Query hooks (useFetch*, useAction*)
hooks/<domain>/             → Business logic hooks
hooks/<domain>/use-manage-*-api-request.ts  → Raw API calls
```

### Conversation Services (12 files)
| Service | Endpoint |
|---------|----------|
| `conversation.service.ts` | CRUD + bulk operations |
| `use-message.service.ts` | Messages |
| `userFetchConversations.service.ts` | List with infinite query |
| `action-conversation-note.service.ts` | Notes |
| `action-conversation-screenshot.service.ts` | Screenshots |
| `conversation-sla-metrics/` | SLA metrics query |
| `sla-setting/` | SLA settings (8 files) |

### Ticket Services (20+ files)
| Service | Endpoint |
|---------|----------|
| `ticket.service.ts` | List, KPI, messages, edit/delete |
| `use-action-create-ticket.service.ts` | Create |
| `use-action-update-ticket.service.ts` | Update (optimistic cache) |
| `use-action-update-ticket-status.service.ts` | Close/reopen |
| `use-action-update-ticket-stage.service.ts` | Stage transition |
| `use-action-assign-ticket-members.service.ts` | Assign (optimistic) |
| `use-action-snooze-ticket.service.ts` | Snooze/unsnooze (single + bulk) |
| `use-action-tag-ticket.service.ts` | Add/remove tag |
| `use-get-ticket-detail.service.ts` | Detail query |
| `use-get-ticket-views.service.ts` | Role-based views |
| `use-get-ticket-type.service.ts` | Ticket types |
| `use-get-view-settings.service.ts` | Column config |
| `bulk-reply.service.ts` | Bulk reply jobs |
| `use-get-export-ticket.service.ts` | Export |

### WhatsApp Account Services
| Service | Endpoint |
|---------|----------|
| `accountChannel.service.ts` | Account CRUD, QR, instance lifecycle |
| `channel.service.ts` | Channel queries |
| `useActionAccountGroup.ts` | Group CRUD, move, set main |

---

## 7. Component Architecture

### 3-Column Layout (Conversation)
```
ManageConversationPage
├── ConversationChatLists        (left 1/3 — virtualized list)
├── ConversationChatRoom         (center — messages + input)
└── ConversationChatDetails      (right — sidebar info)
```

### Drawer Layout (Ticket)
```
ManageTicketingPage
├── TicketFilter + TicketTypeTabs
├── TicketTable (paginated + virtual)
├── TicketDetailsDrawer           (slide-in drawer)
│   ├── Left: TicketHeader + TicketChatRoom
│   └── Right: TicketSLASection + Assignee + Attributes + Linked
└── TicketSelectionActionBar      (floating bottom bar)
```

### Settings Layout (WhatsApp Web)
```
ManageWhatsappWebSettingPage
├── Header (title + Add Account + Learn)
├── StatisticGrid (4 cards)
├── TabAccountGroup (accordion groups)
│   └── Account table per group
└── TabReservedAccount (standalone table)
```

---

## 8. Real-time (Socket.IO)

| Provider | Location | Purpose |
|----------|----------|---------|
| `SocketProvider` | Conversation layout | Conversation socket events |
| `SocketProvider` (subPath="ticket") | Ticketing layout | Ticket socket events |
| `ChannelSocketProvider` | Settings WA Web | Account connection status |
| `IncomingMessageNotificationProvider` | Main layout | Inbound notification |

### Socket Event Handlers
| Hook | Purpose |
|------|---------|
| `hooks/conversation/socket/` | Conversation inbound/outbound, status, typing |
| `hooks/ticket/socket/use-ticket-socket-event.ts` | Ticket inbound, status, notification |
| `hooks/ticket/socket/use-bulk-reply-socket-event.ts` | Bulk reply job progress |

---

## 9. FE Implementation Status per Domain

### Conversation (V2)

| V2 Feature | FE Status | Key Files |
|-----------|-----------|-----------|
| Chat List with Open/Closed | ✅ | `ConversationChatLists`, `ChatItem` |
| Navigation (Inbox, Channel, Team) | ✅ | `ConversationNav`, `InboxSection`, `ChannelsSection` |
| Room with CRUD messages | ✅ | `ConversationChatRoom` |
| Detail panel | ✅ | `ConversationChatDetails` |
| SLA Metrics (FRT/TTC/RLT/Wait Time) | ✅ | `RealTimeSLABadge`, `buildRltItem` |
| Multiple Ticket from Bubble | ✅ | `CreateTicketDraftsModal` |
| Team Member Presence | ✅ | `member-status.store` |
| Reassign Account Channel | ✅ | `AdjustAccountModal` |
| Collaborator Role | ❌ | No collaborator UI |
| Snooze Conversation | ❌ | Ticket snooze only |
| Related Conversations | ❌ | No grouping |
| WA Group Mention | ❌ | No @mention picker |
| Auto-reply Templates | ❌ | Macros only |
| Room Reminder | ❌ | No reminder button |
| Hold/Resume | ❌ | No hold button |
| Collections (custom attr) | ❌ | Single attributes only |

### Ticket (V2)

| V2 Feature | FE Status | Key Files |
|-----------|-----------|-----------|
| Ticket List (tabs, columns, KPI) | ✅ | `TicketTableColumn`, `TicketKpiCards` |
| Ticket Detail (drawer, SLA) | ✅ | `TicketDetailsDrawer`, `TicketSLASection` |
| Ticket Room (chat, mention) | ✅ | `TicketChatRoom` |
| Bulk Reply (XLSX, async) | ✅ | `bulk-reply.store`, `BulkReplyService` |
| Export (XLSX) | ✅ | `useGetExportTicket` |
| Snooze (single + bulk) | ✅ | `useTicketSnoozeActions` |
| Type Settings (custom fields) | ✅ | `EditableAttribute`, `CreateTicketForm` |
| View Scope (RBAC, 8 views) | ✅ | `useGetTicketViews`, `TicketViewEnum` |
| Search Relevance + Out-of-filter | ✅ | `OutsideFilterGuidanceBanner` |
| Create Ticket Consistency | ✅ | `CreateTicketForm`, `DynamicTicketForm` |
| Related Tickets & Merge | ❌ | No merge UI |

### WhatsApp Web (V2)

| V2 Feature | FE Status | Key Files |
|-----------|-----------|-----------|
| Add Account | ✅ | `WhatsappWebAddModal` |
| Account Groups | ✅ | `TabAccountGroup` |
| Reserved Pool | ✅ | `TabReservedAccount` |
| Rename/Edit | ✅ | `RenameAccountModal` |
| QR Connect | ✅ | `WhatsappWebConnectModal`, `QRCode` |
| Statistic Cards | ✅ | `StatisticGrid` |
| Bulk Scan Popup | ⚠️ Partial | Single QR only, no bulk queue |
| Pairing Code | ❌ | QR only |
| Public Links | ❌ | No public link sharing |
| Account Name Dropdown | ❌ | Free-text input |
| Import Modes | ❌ | No import mode UI |
| Broadcast Humanization | ❌ | No bubble split |
| Warming System | ❌ | No warming page |
| Account Pools Rotation | ❌ | No auto-rotation |

---

## 10. FE + BE Alignment

| Aspek | FE | BE | Notes |
|-------|----|----|-------|
| Conversation SLA | ✅ | ✅ | Formula FRT = Wait Time + RLT konsisten |
| Ticket SLA per-stage | ✅ | ✅ | State machine, cycleId, pause on WoC |
| WhatsApp Web Baileys | N/A | ✅ | Connection managed by BE, FE consumes |
| Undeveloped features | 15 fitur | 15 fitur | **No asymmetry** — same set both sides |
| Data model match | ✅ | ✅ | `open/close`, `participants`, SLA fields |

**Kesimpulan:** FE dan BE fully aligned. Tidak ada fitur yang developed di satu sisi tapi tidak di sisi lain.
