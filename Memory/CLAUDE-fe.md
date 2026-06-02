# SatuInbox v2 Frontend — Technical Reference (CLAUDE.md)

> **Repo path:** `C:\Users\MyBook SAGA 12\Desktop\FE satuinbox\omnichannel-satuinbox-fe`
> **Product:** Omnichannel CRM — agent dashboard + embeddable live-chat widget.
> **Backend:** NestJS microservices via API Gateway at port `3000`.

---

## 1. Applications

| App | Port | Purpose |
|---|---|---|
| `apps/omnichannel` | `3002` | Main agent dashboard — conversation, ticketing, analytics, settings |
| `apps/widget` | `3001` | Embeddable live-chat widget for customer websites |

---

## 2. Tech Stack

| Concern | Technology | Version |
|---|---|---|
| Framework | Next.js | `^16.0.10` (App Router, RSC-first) |
| React | React | `^19.2.3` |
| Language | TypeScript | `5.9.2` strict |
| Styling | Tailwind CSS | `^4.1.5` |
| UI components | `@satuinbox/ui` (Shadcn-based) | workspace package |
| Client state | Zustand | `^5.0.8` |
| Server state | TanStack React Query | `^5.89.0` |
| Forms | React Hook Form + Zod | `^7.63.0` + `^4.1.11` |
| HTTP | Axios | `^1.12.2` (custom interceptors) |
| Realtime | Socket.IO client | `^4.8.1` |
| Auth | NextAuth | `^4.24.11` (CredentialsProvider + JWT) |
| i18n | next-intl | `^4.3.9` |
| Tables | TanStack Table | `^8.21.3` + React Virtual |
| Animation | Motion | `^12.23.24` |
| Build | Turbo | `^2.5.6` |
| Lint / format | ESLint 9, Prettier 3 | |
| Testing | Vitest | |

---

## 3. Monorepo Structure

```
satuinbox-v2-fe-review/
├── apps/
│   ├── omnichannel/          # Main Next.js 16 app (App Router)
│   └── widget/               # Embeddable chat widget (Next.js 16)
├── packages/
│   ├── configs/
│   │   ├── eslint-config     # @satuinbox/eslint-config
│   │   ├── tailwind-config   # @satuinbox/tailwind-config
│   │   └── typescript-config # @satuinbox/typescript-config
│   ├── constants/            # @satuinbox/constants
│   ├── helpers/              # @satuinbox/helpers
│   ├── i18n/                 # @satuinbox/i18n
│   ├── react-query/          # @satuinbox/react-query
│   ├── types/                # @satuinbox/types
│   └── ui/                   # @satuinbox/ui
├── turbo.json
└── package.json
```

### Shared Packages

| Package | Purpose |
|---|---|
| `@satuinbox/types` | User, company, conversation, ticket, message, channel types/enums |
| `@satuinbox/constants` | Error codes, enums, i18n namespace keys, query stale times |
| `@satuinbox/helpers` | Date, file, encryption, socket, axios helpers |
| `@satuinbox/i18n` | next-intl setup and locale detection |
| `@satuinbox/ui` | Shadcn-based UI component library |
| `@satuinbox/react-query` | QueryClient + session-aware hooks |

---

## 4. Frontend Rules

- **Default to Server Components.** Add `"use client"` only for hooks, browser APIs, event listeners, Zustand, React Query, or interactive state.
- **React Query owns server/remote state.** Use service hooks for API data, pagination, mutations, cache invalidation.
- **Zustand owns persistent client/UI state.** Filters, selections, input drafts, socket buffers, feature UI state.
- **URL params own shareable state.** Filters, pagination, sort, tabs, search go in URL query params.
- **All API calls go through the Axios/session flow.** Do not bypass token injection, refresh, or forced logout.
- **All user-visible text must use `next-intl`.** Never hardcode display strings.
- **Respect backend response envelope.** Map `success`, `data`, `error`, `meta` consistently.
- **Socket.IO for realtime only.** Isolate event handling in providers/hooks; update React Query / Zustand carefully.
- **Feature-based co-location.** Components, hooks, services, stores, types, validations, mappers stay close to their domain.
- **Monorepo boundaries.** Apps in `apps/`; shared code in `packages/`.

---

## 5. Omnichannel App Structure

```
apps/omnichannel/
├── app/[locale]/
│   ├── (auth)/                 # login, register, onboarding, reset-password,
│   │                           # set-new-password, verification, verification-member
│   ├── (main)/                 # Authenticated dashboard
│   │   ├── layout.tsx
│   │   ├── broadcast/          # messages, draft, templates
│   │   ├── contact/            # single contact
│   │   ├── contacts/           # contact list
│   │   ├── conversation/[convoSection]/
│   │   ├── forbidden/
│   │   ├── leads/
│   │   ├── notification/
│   │   ├── settings/
│   │   │   ├── channels/       # addon, whatsapp-api, whatsapp-web, widget
│   │   │   ├── developer/
│   │   │   ├── inbox/
│   │   │   ├── organization/
│   │   │   └── subscriptions/
│   │   ├── statistic/
│   │   └── ticketing/
│   ├── csat/
│   ├── t/                      # translation test route
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── pages/
│   └── providers/
├── constants/
├── hooks/
├── services/
├── stores/
├── types/
├── helpers/
├── schemas/
├── validations/
├── i18n/
├── mappers/
├── utils/
└── proxy.ts                    # Permission middleware
```

### Main Modules

| Module | Route | Description |
|---|---|---|
| Auth | `(auth)/` | Login, register, onboarding, password reset, verification |
| Conversations | `(main)/conversation/[convoSection]` | Multi-channel inbox, realtime messaging, bulk actions |
| Ticketing | `(main)/ticketing/` | Tickets, SLA, stages, assignments, reminders |
| Broadcast | `(main)/broadcast/{messages,draft,templates}` | Bulk campaigns, templates, scheduling |
| Leads | `(main)/leads/` | Sales pipeline |
| Contacts | `(main)/contacts/` | Customer contact database |
| Statistics | `(main)/statistic/` | Ticket/response analytics |
| Notifications | `(main)/notification/` | In-app notification center |
| Settings | `(main)/settings/` | Channels, billing, macros, tags, SLA, org config, widget |
| CSAT | `[locale]/csat/` | Customer satisfaction surveys |

`[convoSection]` maps to: `your-inbox`, `unassigned`, `all`, `starred`, `spam`, `junk`, `channel`, `team`, `group-chat`

### Internal API routes

| Route | Purpose |
|---|---|
| `/api/auth/[...nextauth]` | NextAuth handler |
| `/api/media/[token]` | S3 media proxy |
| `/api/transcript/[token]` | Conversation transcripts |
| `/api/csat/*` | CSAT endpoints |

---

## 6. Widget App

- Routes: `[locale]/livechat/` (home, conversation, form, messages)
- Customer-facing; embedded via `<script>` tag
- Exposes `window.SatuinboxWidget`

---

## 7. State Management

### Zustand Stores (`stores/`)

| Store / folder | Key state |
|---|---|
| `conversation/` | Filters (persisted), layout, input drafts, selected messages, bulk selection, nav (active section, channel, team) |
| `ticket/` | Selection, filters, search, view, modals, message drafts, bulk reply (persisted) |
| `broadcast/` | Draft messages, selected templates |
| `notification/` | Unread badge counts, incoming message queue |
| `setting/` | Macros, tags, widget config, SLA settings |
| `people/` | People/member state |
| `sales/` | Sales state |
| `statistic/` | Analytics filter state |
| `team-inbox/` | Team inbox state |
| `audio-playback.store.ts` | Audio playback state |
| `pending-socket-queue.store.ts` | Offline message buffer — replayed on reconnect |
| `conversation-create-ticket.store.ts` | Create-ticket from conversation state |
| `whatsappWeb.store.ts` | WA account selection, QR modal, filters |
| `table-store.ts` | Generic table state |

### React Query (`@satuinbox/react-query`)

- `useQueryWithSession` — standard query, only runs with active session
- `useInfiniteQueryWithSession` — infinite scroll, `getNextPageParam`
- Naming: `use<Action><Resource>.service.ts` (e.g. `useGetTickets.service.ts`, `useUpdateTicket.service.ts`)

### URL State

Filters, pagination, sort, active tabs, search → URL query params for deep-linkable views.

---

## 8. API Integration

### Axios / Session Flow

- `useAxiosPrivateApi` configures the Axios instance.
- **Request interceptor:** injects `Authorization: Bearer {accessToken}` from NextAuth session.
- **Response interceptor:**
  - `401` → calls `/auth/refresh-token` → `NextAuth update()` → retry original request
  - `SESSION_INVALIDATED` → force logout, redirect to `/login`

### Response Envelope

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  message?: string;
  details?: Record<string, unknown>;
  meta?: { total: number; page: number; limit: number };
};
```

### Service Hook Flow

```
Component → useService() hook → useQueryWithSession() → Axios (with auth)
  → interceptors (refresh / logout) → error → ServiceError / toast
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Backend API base URL |
| `API_URL` | Server-side API URL |
| `NEXTAUTH_SECRET` | NextAuth JWT secret |
| `NEXTAUTH_URL` | NextAuth base URL |

---

## 9. Authentication & RBAC

1. Credentials → `POST /api/auth/login` → `{ accessToken, refreshToken, user }`
2. NextAuth CredentialsProvider stores tokens in encrypted JWT session cookie
3. Session exposes: `accessToken`, `refreshToken`, `id`, `email`, `fullName`, `role`, `organization`, `onboardingStatus`
4. `useSession()` gates all data fetching
5. Access tokens: `15m`; refresh tokens: `24h`; silent refresh via Axios interceptor

RBAC: use `role.permissions` to conditionally render UI and guard routes.

---

## 10. Realtime (Socket.IO)

Backend WS on port `3002`:

| Namespace | Events |
|---|---|
| `/conversations` | message, send-message, typing, read, delivered, conversation-updated |
| `/tickets` | ticket-updated, stage/assignment changes |
| `/notifications` | user notifications, mentions, system alerts |

Auth: bearer token or API key in socket handshake.

### Providers & Hooks

| Provider / hook | Location | Purpose |
|---|---|---|
| `SocketProvider` | Conversation layout | Conversation socket events |
| `SocketProvider` (subPath="ticket") | Ticketing layout | Ticket socket events |
| `ChannelSocketProvider` | Settings WA Web | Account connection status |
| `IncomingMessageNotificationProvider` | Main layout | Inbound notification |
| `hooks/conversation/socket/` | | Conversation inbound/outbound/status/typing |
| `hooks/ticket/socket/use-ticket-socket-event.ts` | | Ticket inbound/status/notification |
| `hooks/ticket/socket/use-bulk-reply-socket-event.ts` | | Bulk reply job progress |

---

## 11. Service Layer (`services/`)

Known service areas:

| Area | Notes |
|---|---|
| `conversation/` | CRUD, bulk, notes, screenshots, messages, infinite list |
| `conversation-sla-metrics/` | SLA metrics query |
| `sla-setting/` | SLA settings queries/mutations |
| `ticket/` | List, KPI, messages, create/update, status, stage, assign, snooze, tag, detail, views, types, export |
| `account-group/` | Group CRUD, move, set main |
| `accountChannel.service.ts` | Account CRUD, QR, instance lifecycle |
| `channel/` | Channel queries |
| `broadcast/` | Broadcast campaigns/templates |
| `member/` | Member queries |
| `notification/` | Notification queries |
| `organization/` | Org settings |
| `statistic/` | Analytics/reporting queries |
| `billing/`, `wallet/`, `payment/` | Billing, wallet, payment |
| `email/`, `instagram/`, `messenger/`, `whatsapp-api/` | Channel-specific services |
| `macros/`, `tag/`, `shift-hours/`, `shipping/` | Settings-related services |
| `transcript/`, `webhook/`, `widget/` | Other services |

### Backend API Paths (via API Gateway `:3000`)

| Resource | Base path |
|---|---|
| Auth | `/api/auth/` |
| Conversations | `/api/conversations/` |
| Messages | `/api/messages/` |
| Tickets | `/api/tickets/` |
| Contacts | `/api/contacts/` |
| Members | `/api/members/` |
| Teams | `/api/teams/` |
| Channels | `/api/channels/` |
| Broadcasts | `/api/broadcasts/` |
| Templates | `/api/templates/` |
| Media | `/api/media/` |
| Widgets | `/api/widgets/` |
| Analytics | `/api/analytics/` |
| SLA Settings | `/api/sla-settings/` |
| Roles | `/api/roles/` |
| Payments | `/api/payments/` |
| Organizations | `/api/organizations/` |

Swagger at `http://localhost:3000/docs`

---

## 12. Component Architecture

### Conversation (3-column layout)
```
ManageConversationPage
├── ConversationChatLists        # left, virtualized list
├── ConversationChatRoom         # center, messages + input
└── ConversationChatDetails      # right, sidebar info
```

### Ticketing (drawer layout)
```
ManageTicketingPage
├── TicketFilter + TicketTypeTabs
├── TicketTable                  # paginated + virtual
├── TicketDetailsDrawer
│   ├── TicketHeader + TicketChatRoom
│   └── TicketSLASection + Assignee + Attributes + Linked
└── TicketSelectionActionBar     # floating bottom bar
```

### WhatsApp Web Settings
```
ManageWhatsappWebSettingPage
├── Header
├── StatisticGrid (4 cards)
├── TabAccountGroup (accordion)
│   └── Account table per group
└── TabReservedAccount
```

---

## 13. Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Components | PascalCase | `ConversationList.tsx` |
| Service hooks | `use<Action><Resource>.service.ts` | `useGetTickets.service.ts` |
| Zustand stores | `<feature>.store.ts` | `conversation-input.ts` |
| Custom hooks | `use<Feature>` | `useConversationFilter` |
| Constants | `UPPER_SNAKE_CASE` | `QUERY_STALE_TIME` |
| Types / interfaces | PascalCase | `ConversationMessage` |

### Feature Folder Convention
```
feature/
├── components/
├── hooks/
├── services/
├── stores/
├── types/
├── validations/
└── mappers/
```

### Data Fetching Preference
1. Server Components with `fetch()` for static/initial data
2. React Query for dynamic data, pagination, mutations
3. Socket.IO for realtime streaming updates

---

## 14. Build & Dev

```bash
npm install
npm run dev                                    # all apps via Turborepo
npx turbo run dev --filter=omnichannel
npx turbo run dev --filter=widget
npm run build                                  # production build
```

CI/CD: GitLab CI (`.gitlab-ci.yml`), SonarQube, Husky, commitlint, lint-staged.

---

## 15. V2 Implementation Status

### Conversation

**Implemented:** chat list (open/closed), nav (inbox/channel/team), room CRUD, detail panel, SLA metrics (FRT/TTC/RLT/wait time), multiple ticket from bubble, team member presence, reassign account channel.

**Not implemented:** collaborator role UI, snooze conversation, related conversations, WA group mention picker, auto-reply templates, room reminder, hold/resume, collections (custom attributes beyond current single).

### Ticket

**Implemented:** ticket list (tabs/columns/KPI), detail drawer + SLA, room/chat/mention, bulk reply (XLSX + async), export XLSX, snooze (single + bulk), ticket type settings + custom fields, RBAC view scope (8 views), search relevance + out-of-filter guidance, create ticket dynamic form.

**Not implemented:** related tickets + merge UI.

### WhatsApp Web

**Implemented:** add account, account groups, reserved pool, rename/edit, QR connect, statistic cards.

**Partial:** bulk scan popup (single QR only, no bulk queue).

**Not implemented:** pairing code, public link sharing, account name dropdown, import modes, broadcast humanization, warming system, account pools rotation.

### FE + BE Alignment

| Aspect | Status |
|---|---|
| Conversation SLA | ✅ FRT/TTC/RLT/wait time aligned |
| Ticket SLA per-stage | ✅ State machine, cycleId, pause on waiting customer |
| Basic conversation + ticket features | ✅ Both sides |
| V2 undeveloped features | Same set on both sides — no asymmetry |
