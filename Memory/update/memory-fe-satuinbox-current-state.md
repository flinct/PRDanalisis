> ⚠️ **SUPERSEDED / ARSIP — JANGAN DIPAKAI SEBAGAI SOURCE OF TRUTH.**
> Konten file ini sudah dipromosikan ke canonical `Memory/CLAUDE-fe.md` pada 2026-08-11.
> Semua pointer repo (Assessments, PRD, Rules, WORKFLOW_CONTEXT) menunjuk ke `Memory/CLAUDE-fe.md`, bukan file ini.
> Disimpan hanya sebagai snapshot arsip verifikasi v2.8.0 / prod-2.7.0.3.

# SatuInbox — Frontend Technical Reference (for Product Lead)

> **Purpose:** a self-contained picture of the frontend for someone who does **not** have repo access.
> **Repo:** `gitlab.com:lolipad.id/omnichannel-satuinbox-fe` · workspace `with-tailwind`
> **Product:** Omnichannel CRM — the agent dashboard plus an embeddable live-chat widget.
> **Backend:** NestJS microservices behind the API Gateway on port `3000` (WebSocket `3002`).
>
> **State captured:** working branch **`v2.8.0`** (unreleased). Latest **production tag is `prod-2.7.0.3`**.
> Verified directly against the working tree on **2026-08-11**.
>
> ⚠️ **Read this first:** `v2.8.0` is *in development*. Features in §15 exist in code but are **not yet in production**. Production today = `prod-2.7.0.3`.

---

## 1. Applications

| App | Port | Purpose |
| --- | --- | --- |
| `apps/omnichannel` | `3002` | Main agent dashboard — conversations, ticketing, broadcast, leads, contacts, analytics, settings |
| `apps/widget` | `3001` | Embeddable live-chat widget for customer websites |

The widget compiles its embed loader into a standalone IIFE bundle (`window.SatuinboxWidget`) with esbuild + terser **before** Next.js builds. That is why the widget build is a two-step process.

> **Note on `apps/system`:** a `system` folder exists on disk but contains only stale local build artifacts (`.next`, `.turbo`, `node_modules`) — there is **no tracked application** there on `v2.8.0`. Any "SuperAdmin console" work is not part of this codebase state.

---

## 2. Tech Stack

| Concern | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, RSC-first) | `^16.0.10` |
| React | React | `^19.2.3` |
| Language | TypeScript (strict) | `5.9.2` |
| Monorepo | Turborepo | `^2.5.6` |
| Package manager | npm | `11.5.1`, Node `>=18` |
| Styling | Tailwind CSS v4 (oklch design tokens) | `^4.1.5` |
| UI components | `@satuinbox/ui` (shadcn/Radix-based) | workspace package |
| Client state | Zustand | `^5.0.8` |
| Server state | TanStack React Query | `^5.89.0` |
| Tables | TanStack Table + React Virtual | `^8.21.3` / `^3.13.12` |
| Forms | React Hook Form + Zod | `^7.63.0` + `^4.1.11` |
| HTTP | Axios (custom interceptors) | `^1.12.2` |
| Realtime | Socket.IO client | `^4.8.1` |
| Auth | NextAuth (Credentials + JWT) | `^4.24.11` |
| i18n | next-intl | `^4.3.9` |
| Animation | Motion | `^12.23.24` |
| Media | `react-player`, `media-chrome`, `wavesurfer.js` | voice notes + media playback |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` | omnichannel only |
| Charts | ApexCharts (via `@satuinbox/ui`) | analytics |
| Lint / format | ESLint 9, Prettier 3 | `--max-warnings 0` |
| **Testing** | **None configured** — no Vitest/Jest dependency or config anywhere in the workspace | ⚠️ |

> ⚠️ **Quality-gate reality:** the frontend has **no automated tests**. The entire gate is `lint` + `check-types` (`tsc --noEmit`) + Prettier, enforced through Husky/lint-staged and GitLab CI. All functional verification is manual or via backend tests. This is the single largest quality risk on the frontend and should factor into release planning.

---

## 3. Monorepo Structure

```
omnichannel-satuinbox-fe/
├── apps/
│   ├── omnichannel/          # Main dashboard (Next.js 16)
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
| --- | --- |
| `@satuinbox/types` | Shared domain types — user, company, conversation, ticket, message, channel |
| `@satuinbox/constants` | Error codes, enums, query-key namespaces, storage keys, validation limits |
| `@satuinbox/helpers` | Axios setup, socket helpers, date/phone/format/encryption/S3/media helpers, `cn()` |
| `@satuinbox/i18n` | next-intl setup, routing, locale detection |
| `@satuinbox/ui` | Component library — **30 atoms**, **31 molecules**, a CSAT component set, and a toast provider |
| `@satuinbox/react-query` | QueryClient, `useQueryWithSession`, `useInfiniteQueryWithSession`, cache + error helpers |

---

## 4. Frontend Rules

- **Default to Server Components.** `"use client"` only for hooks, browser APIs, event handlers, Zustand, React Query, or interactive state.
- **React Query owns server state.** No raw `useEffect` data fetching.
- **Zustand owns client/UI state** — filters, selections, drafts, socket buffers.
- **URL params own shareable state** — filters, pagination, sort, tabs, search.
- **All API calls go through the Axios/session flow.** Never bypass token injection, refresh, or forced logout.
- **All user-visible text goes through next-intl.** The shared ESLint config **fails the build** on hardcoded user-facing strings — this is enforced, not advisory.
- **Feature co-location.** Components, hooks, services, stores, types, validations, and mappers stay near their domain.

---

## 5. Omnichannel App — Route Map

All routes live under `app/[locale]/`. Locales are **`en` and `id`**, default **`id`**.

### `(auth)` — unauthenticated
`login` · `register` (+ `verify-email`) · `onboarding` · `reset-password` (+ `verify-email`) · `set-new-password` · `verification` · `verification-member`

### `(main)` — authenticated dashboard

| Module | Route | Description |
| --- | --- | --- |
| Conversations | `conversation/[convoSection]` | Multi-channel inbox, realtime messaging, bulk actions |
| Ticketing | `ticketing` | Ticket list, SLA, stages, assignment, bulk reply |
| Broadcast | `broadcast/messages` (+ `create`), `broadcast/draft/[id]/edit`, `broadcast/templates` (+ `create`, `[id]/edit`) | Campaigns, drafts, WhatsApp templates |
| Leads | `leads`, `leads/[id]` | Sales pipeline |
| Contacts | `contacts`, `contact` | Customer contact database |
| Statistics | `statistic` | Analytics dashboards |
| Notifications | `notification` | In-app notification centre |
| Forbidden | `forbidden` | Permission-denied landing |

**`[convoSection]`** resolves to: `your-inbox`, `unassigned`, `all`, `starred`, `spam`, `junk`, `channel`, `team`, `group-chat`.

### `(main)/settings`

| Group | Pages |
| --- | --- |
| **Channels** | `whatsapp-web`, `whatsapp-api`, `widget` (+ `widget/topic`), `addon` |
| **Inbox** | `assignments`, `sla`, `macros`, `csat`, `tickets` (+ `create`), `team-inbox` (+ `create`, `[id]`) |
| **Organization** | `general`, `members`, `roles` (+ `privacy-settings`), `shift-hours` (+ `create`, `[id]`), `tags`, `change-password` |
| **Developer** | `webhook`, `shipping-credentials`, **`sync-contact`** *(new in v2.8.0)* |
| **Subscriptions** | `billing`, `manage-package`, `payment-details` |

### Other route groups

| Route | Purpose |
| --- | --- |
| `(sync)/sync` | **Full-screen workspace sync screen** — shown while third-party contact sync runs (new in v2.8.0) |
| `csat/[token]` | Public CSAT survey (no login) |
| `t/[token]` | Public transcript view |

### Internal API routes (Next.js server-side)

| Route | Purpose |
| --- | --- |
| `/api/auth/[...nextauth]` | NextAuth handler |
| `/api/media/[token]` | S3 media proxy |
| `/api/transcript/[token]` | Conversation transcript proxy |
| `/api/csat/settings`, `/api/csat/submit` | CSAT survey endpoints |

---

## 6. Widget App — Route Map

| Route | Purpose |
| --- | --- |
| `[locale]/livechat/home` | Widget landing |
| `[locale]/livechat/conversation` · `conversation-form` | Start / continue a chat |
| `[locale]/livechat/message/[conversationId]` | Message thread |
| `[locale]/livechat/ticket` | Ticket view inside the widget |
| `[locale]/no-access` | Blocked / unauthorised state |
| `/api/widget/[...path]`, `/api/csat/*` | Server-side proxies |

Customer-facing, embedded via a `<script>` tag, exposes `window.SatuinboxWidget`.

---

## 7. State Management

### Zustand stores (`apps/omnichannel/stores/`)

| Store group | Key state |
| --- | --- |
| `conversation/` | Filters (persisted), advanced filters, bulk actions, layout, nav, input drafts, message store, refresh notifications |
| `ticket/` | Ticket list, filters, chat input, message drafts, bulk reply (persisted), add/remove tag, resolve |
| `broadcast/` | Draft, message, and template state |
| `search/` | Global search state + selection state *(new in v2.8.0)* |
| `notification/` | Unread counts, incoming-message queue |
| `setting/` | Macros, tags, organization, shift hours, SLA, ticket types, widget, addons |
| `people/` | Contacts, add-contact modal |
| `sales/` | Leads |
| `statistic/` | Analytics filters |
| `team-inbox/` | Team inbox filters |
| `pending-socket-queue.store.ts` | **Offline message buffer** — replayed on reconnect |
| `audio-playback.store.ts` | Voice-note playback |
| `conversation-create-ticket.store.ts` | Create-ticket-from-conversation flow |
| `whatsappWeb.store.ts` | WA account selection, QR modal, filters |
| `table-store.ts`, `store-reset.ts` | Generic table state; global reset on logout |

### React Query

- `useQueryWithSession` — standard query, only fires with an active session
- `useInfiniteQueryWithSession` — infinite scroll with `getNextPageParam`
- Naming: `use<Action><Resource>.service.ts` (e.g. `useGetTickets.service.ts`)
- Query keys always come from `*_QUERY_KEY` constants; mutations invalidate affected keys and toast on both success and error

---

## 8. API Integration

### Axios / session flow

- `useAxiosPrivateApi()` builds the authenticated instance (60s timeout).
- **Request interceptor** injects `Authorization: Bearer <accessToken>` from the NextAuth session.
- **Response interceptor:**
  - `401` → call `/auth/refresh-token` → NextAuth `update()` → retry the original request
  - `SESSION_INVALIDATED` → force sign-out and redirect to `/login`
- Public/partner calls use `axiosPublicAPI` with the `x-signature-key` header.

### Response envelope

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

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Backend API base URL (used by NextAuth login) |
| `API_URL` | Server-side API base URL |
| `NEXT_PUBLIC_OPEN_API_BASE_URL` | Partner/public API base (widget) |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket endpoint |
| `NEXT_PUBLIC_FE_BASE_URL`, `NEXT_PUBLIC_FE_WIDGET_BASE_URL`, `NEXT_PUBLIC_SITE_ENV` | Environment wiring |
| `NEXT_PUBLIC_SECRET`, `SECRET`, `NEXT_PUBLIC_CRYPTOJS_KEY` | NextAuth + client-side encryption |
| `NEXT_PUBLIC_ICONIFY_API`, `NEXT_PUBLIC_SUPERADMIN_WIDGET_KEY`, `NEXT_PUBLIC_API_BAYAR_WIDGET_JS`, `NEXT_PUBLIC_API_BAYAR_STAGE` | Third-party integrations |

There is a **single root `.env`** — no per-app env files.

---

## 9. Authentication & RBAC

1. Credentials → `POST {NEXT_PUBLIC_BASE_URL}/auth/login` → `{ accessToken, refreshToken, user }`
2. NextAuth CredentialsProvider stores tokens in an encrypted JWT session cookie
3. Session exposes: `accessToken`, `refreshToken`, user identity, `role`, `permissions`, `contactScope`, `company`, `organization`, `teams`, `onboardingStatus`
4. `useSession()` gates all data fetching; server components use `getServerSession`
5. Access tokens live `15m`, refresh tokens `24h`; silent refresh happens in the Axios interceptor

**RBAC in the UI:** `useRolePermission` + a `RolesGuard` component conditionally render and guard routes from `role.permissions`. There is also a `usePrivacyMasking` hook and a privacy-settings surface for masking contact data by role.

**Post-login routing:** login → onboarding (if incomplete) → workspace sync screen (if a contact sync is pending) → dashboard, gated by a `WorkspaceSyncGuard`.

---

## 10. Realtime (Socket.IO)

Backend WebSocket on port `3002`.

| Namespace | Events |
| --- | --- |
| `/conversations` | message, send-message, typing, read, delivered, conversation-updated |
| `/tickets` | ticket-updated, stage and assignment changes |
| `/notifications` | user notifications, mentions, system alerts |
| channel events | account connection status (WhatsApp Web pairing) |

Auth is a bearer token in the socket handshake; the client is a singleton with `autoConnect: false`, websocket-only transport, and 5 reconnect attempts.

| Provider / hook | Purpose |
| --- | --- |
| `SocketProvider` (conversation layout) | Conversation socket events |
| `SocketProvider` (`subPath="ticket"`) | Ticket socket events |
| `ChannelSocketProvider` | WA Web account connection status |
| `IncomingMessageNotificationProvider` | Inbound message notification + sound |
| `hooks/socket/*`, `hooks/conversation/socket/*` | Inbound/outbound/status/typing handling |
| `hooks/ticket/socket/*` | Ticket events + bulk-reply job progress |

**Offline resilience:** `pending-socket-queue.store.ts` buffers outbound messages while disconnected and replays them on reconnect.

---

## 11. Service Layer (`apps/omnichannel/services/`)

41 service areas, mirroring the backend domains:

`accountChannel` · `account-group` · `auth` · `away-reasons` · `billing` · `broadcast` · `channel` · `conversation` · `conversation-sla-metrics` · `csat` · `email` · `instagram` · `macros` · `media` · `member` · `messenger` · `notification` · `organization` · `payment` · `people` · `privacy` · **`relation-label`** · `role` · `sales` · `settings` · `shift-hours` · `shipping` · `sla-setting` · `statistic` · `tag` · `team` · `ticket` · `ticket-type` · `transcript` · `wallet` · `webhook` · `whatsapp-api` · `widget`

Matching hook folders exist per domain, plus cross-cutting hooks: `search/` (global search + relation labels), **`sync/`** (workspace contact sync), `socket/`, `general/`, and standalone utilities (`useAxiosPrivateApi`, `useRolePermission`, `usePrivacyMasking`, `useFileUpload`, `useHeicFetchFn`, `use-screenshot-message`, `useAnalyticsAccessMode`, …).

---

## 12. Component Architecture

Layering: `atoms/` → `molecules/` → `pages/` (each page is a `Manage<Feature>Page.tsx` wrapper). Shared primitives live in `@satuinbox/ui`, never re-installed per app.

### Conversation — 3-column layout
```
ManageConversationPage
├── ConversationChatLists        # left, virtualized list
├── ConversationChatRoom         # centre, messages + composer
└── ConversationChatDetails      # right, contact/context sidebar
```

### Ticketing — drawer layout
```
ManageTicketingPage
├── TicketFilter + TicketTypeTabs
├── TicketTable                  # paginated + virtualized
├── TicketDetailsDrawer
│   ├── TicketHeader + TicketChatRoom
│   └── TicketSLASection + Assignee + Attributes + Linked items
└── TicketSelectionActionBar     # floating bulk-action bar
```

### WhatsApp Web settings
```
ManageWhatsappWebSettingPage
├── Header + StatisticGrid (4 cards)
├── TabAccountGroup (accordion → account table per group)
└── TabReservedAccount
```

### Notable page components
`ManageConversationPage` · `ManageStatisticPage` · `ManageOnboardingPage` · **`ManageSyncPage`** · **`ManageSyncContactPage`** · `ManageWhatsappWebSettingPage` · `ManageWhatsappApiSettingPage` · `ManageBroadcastTemplatePage` / `CreateBroadcastTemplatePage` / `EditBroadcastTemplatePage` · `ManageWebhookPage` · `ManageShippingCredentialPage` · `ManageBillingPage` · `ManagePackagePage`

Shared cross-cutting molecules include `global-search/`, `main-side-nav/`, `WorkspaceSyncGuard`, `RolesGuard`, `RouteProgress`, `SnippingOverlay` (screenshot capture), `message-renderer/`, and `bulk-reply/`.

---

## 13. Internationalisation

- Locales: **`en`** and **`id`**, default `id`.
- **36 translation namespaces**: `billing`, `broadcast`, `contact`, `conversation`, `credentials`, `date`, `days`, `dropdown-item`, `file`, `general`, `home`, `input`, `login`, `media`, `members`, `message`, `metadata`, `notification`, `onboarding`, `register`, `reset-password`, `search`, `set-new-password`, `settings`, `statistic`, **`sync`**, `team`, `ticket`, `ticket-type`, `times`, `transcript`, `typing-indicator`, `verify-email`, `widget`, `widget-settings`, `widget-topics`.
- Every new user-facing string must land in **both** `en.json` and `id.json` — the lint rule blocks hardcoded copy.

---

## 14. Naming Conventions

| Entity | Convention | Example |
| --- | --- | --- |
| Components | PascalCase | `ConversationList.tsx` |
| Service hooks | `use<Action><Resource>.service.ts` | `useGetTickets.service.ts` |
| Newer hooks | kebab-case | `use-global-search.ts` |
| Zustand stores | `<feature>.store.ts` | `conversationFilter.store.ts` |
| Constants | `UPPER_SNAKE_CASE` | `AWAY_REASONS_QUERY_KEY.FETCH_LIST` |
| Types / interfaces | PascalCase | `ConversationMessage`, `PriorityBadgeProps` |
| i18n namespaces | dot-separated lowercase | `'broadcast.createBroadcast.toast'` |

**Data-fetching preference:** Server Components for static/initial data → React Query for dynamic data, pagination, mutations → Socket.IO for realtime streaming.

---

## 15. v2.8.0 — What's New (branch `v2.8.0`, not yet in production)

Delta over the `prod-2.7.0.3` production tag. 13 commits.

| Area | Change | Ref |
| --- | --- | --- |
| **Relation labels** | New cross-object labelling feature — filter by label, apply from global search, surface in the conversation section | base |
| **Relation labels** | **Unlink** a relation label, single-item and bulk | #2836 |
| **Relation labels** | Long label names no longer overflow in unlink modals and chips | #2981 |
| **Relation labels / search** | Rendering, cache-invalidation, and global-search sync bugs fixed | #2905 #2906 #2915 |
| **Global search** | Search domains fetched **independently** so one slow domain no longer blocks the rest | #2410 |
| **Global search** | Cursor behaviour fixed; duplicate relation-label toast removed | #2665 |
| **Global search** | Selection, relation-label, and dropdown bugs fixed | #2622 #2607 #2660 #2665 |
| **Contacts** | **Third-party contact sync** — new `Settings → Developer → Sync Contact` configuration page, a full-screen `/sync` workspace sync screen, and a `WorkspaceSyncGuard` that gates the dashboard while a sync runs | #2739 |
| **Broadcast** | **WhatsApp template builder** — header / footer / buttons composition with live preview and pricing display | — |
| **Instagram** | Reconnect button wired up for disconnected Instagram channels | #2360 |
| **Messaging reliability** | Pending messages reconciled by `tempMessageId` instead of `id` — fixes duplicate bubbles | #2455 |
| **Conversation** | Room paste handler no longer swallows paste in modal input fields | #2916 |
| **QA** | `data-cy` test selectors rebased onto `v2.8.0` | — |

### Already in production (from the `2.7.x` line)

Conversation RLT + wait time in queue metrics · inbound notification sound · assignment source surfaced (manual / self-pull / system / bulk) · linked-ticket bubble sync · channel name on the ticket table · broadcast offline report fix · member active/inactive handling · HEIC/HEIF upload · analytics filter by logged-in user and role · minimalist workspace UI (#2469) · reduced first-login load (#2611) · email subject truncation with tooltip (#2719) · ticket-vs-conversation dropdown (#2718) · channel/team query-param preservation (#2717)

---

## 16. Implementation Status by Module

### Conversation
**Built:** chat list (open/closed), inbox/channel/team navigation, room CRUD, detail panel, SLA metrics (FRT/TTC/RLT/wait time), multiple tickets from a message bubble, team member presence, reassign account channel, inbound notification sound, assignment source display, advanced filters, bulk actions, offline message buffer, screenshot capture, voice-note playback, **relation labels**, **global search**.

**Not built:** collaborator role UI · snooze conversation · related conversations · WhatsApp group mention picker · auto-reply templates · room reminder · hold/resume · extended custom attributes.

### Ticket
**Built:** ticket list (tabs, columns, KPI, channel name), detail drawer with SLA, chat room + mentions, linked-ticket bubble sync, bulk reply (XLSX + async with live progress), XLSX export, snooze (single + bulk), ticket type settings with custom fields, RBAC view scopes, search relevance with out-of-filter guidance, dynamic create-ticket form.

**Not built:** related tickets + merge UI.

### WhatsApp Web
**Built:** add account, account groups, reserved pool, rename/edit, QR connect, statistic cards.
**Partial:** bulk scan popup — single QR only, no bulk queue.
**Not built:** pairing code · public link sharing · account name dropdown · import modes · broadcast humanization · warming system · account pool rotation.

### Broadcast
**Built:** campaigns, drafts, template list/create/edit, **WhatsApp template builder with header/footer/buttons, preview, and pricing**, offline report.

### Frontend ↔ Backend alignment

| Aspect | Status |
| --- | --- |
| Conversation SLA (FRT / TTC / RLT / wait time) | ✅ Aligned both sides |
| Ticket per-stage SLA (state machine, cycleId, pause on waiting customer) | ✅ Aligned both sides |
| Relation labels | ✅ Aligned both sides (v2.8.0) |
| Third-party contact sync | ✅ Aligned both sides (v2.8.0) |
| Global search | ⚠️ FE ships the per-domain UI; the **backend Atlas Search path is behind an env flag that defaults to OFF** — the fast search is dark until ops enables it per environment |
| Undeveloped feature set | Same list on both sides — no FE/BE asymmetry |

---

## 17. Build, Dev & CI

```bash
npm install

npm run dev            # turbo run dev — omnichannel:3002, widget:3001
npm run build          # turbo run build
npm run lint           # eslint --max-warnings 0
npm run check-types    # tsc --noEmit   (NOTE: the task is check-types, NOT type-check)
npm run format         # prettier

# single app
cd apps/omnichannel && npm run dev
cd apps/widget && npm run dev    # rebuilds the IIFE embed bundle first
```

- **No `test` script exists** — see the warning in §2.
- CI/CD: GitLab CI (`.gitlab-ci.yml`), SonarQube, Husky + commitlint + lint-staged.
- Both Next.js apps use `output: 'standalone'`, the next-intl plugin, and load the root `.env` via dotenv. `typescript.ignoreBuildErrors` is `false` — type errors block the build.

---

## 18. Release History (tags)

`prod-2.4.3.2` → `prod-2.5.0` → `prod-2.6.0` → `prod-2.6.1` → `prod-2.7.0` → `prod-2.7.0.1` → `prod-2.7.0.2` → **`prod-2.7.0.3` (current production)** → `v2.8.0` (in development)
