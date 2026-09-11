# Investigasi: Counter Sinkron dengan Conversation List

## Symptom
Sidebar "Kotak Pesan Anda" counter=26, tapi conversation list menampilkan 28 item. Hard refresh diperlukan untuk sync.

## Root Cause

**Dua issue yang saling memperkuat:**

### 1. Count query tidak punya polling safety net (PRIMARY)

**File:** `apps/omnichannel/services/conversation/conversation.service.ts:348-366`

```ts
export const useCountConversation = () => {
  return useQuery<ConversationStats, ErrorResponse>({
    enabled: isEnabled,
    queryFn: async () => { /* fetch countConversation() */ },
    queryKey: [CONVERSATION_QUERY_KEY.COUNT_CONVERSATIONS],
    // ← TIDAK ADA refetchInterval, staleTime override, atau refetchOnWindowFocus
  })
}
```

Count query mengandalkan 2 mekanisme update:
- **Socket push** `conversation.counter` event (line 612, handler line 570-589)
- **Explicit invalidation** dari socket event handlers (assigned/unassigned/pulled/new-conversation)

Global defaults (`packages/react-query/src/helpers/makeQueryClientHelper.ts:11-12`):
```ts
refetchOnWindowFocus: false,
staleTime: DURATION.TWO_MINUTES, // 2 menit
```

**Masalah:** Jika backend tidak push `conversation.counter` event (delayed, dropped, atau userId mismatch), count query tetap stale sampai ada invalidation explicit. Tidak ada fallback polling.

### 2. List query di-update langsung via cache manipulation, count TIDAK

**File:** `apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts`

Ketika `notification.new.message` arrives untuk conversation yang SUDAH ada di list cache:

```
handleNotificationNewMessage (line 685-701):
  → handleInvalidateConversationOnNoMatched({ message })
    → conversation IS in cache → NO invalidation (line 163: isMessageRelevant true, but isConversationExist true → skip)
  → handleNewOrUpdate(message)
    → conversationCache.handleUpdateLatestMessage() → updates list cache directly (unread++, latestMessage)
    → COUNT TIDAK DI-SENTUH
```

List cache di-update optimistic (unread count++, latest message), tapi count query tidak di-invalidate. Ini tidak masalah untuk jumlah item (conversation sudah ada), tapi menunjukkan pattern: **list lebih sering di-update daripada count**.

### 3. Backend count vs list API criteria mungkin berbeda

**List query** (`conversation.service.ts:78`):
```ts
queryFn: ({ pageParam = 1 }) => getConversations(page, { ...filter, hideEmpty: true })
```
Filter untuk "your-inbox": `{ assign: true, hideEmpty: true }`

**Count query** (`conversation.service.ts:356-362`):
```ts
queryFn: async () => countConversation() // tanpa filter parameter
```

Count endpoint dipanggil TANPA filter. Jika backend count logic berbeda dari list logic (misal: count exclude conversation tanpa message, atau count pakai criteria assignment yang berbeda), angka akan diverge.

### 4. `conversation.counter` socket event punya guard yang bisa fail silently

**File:** `use-conversation-socket-event.ts:570-589`

```ts
const handleConversationCounter = useCallback(
    (data: ConversationStats) => {
      if (currentUserId === data.userId) {  // ← guard: harus match userId
        queryClient.setQueryData([CONVERSATION_QUERY_KEY.COUNT_CONVERSATIONS], data)
        // ...
      }
    },
    [queryClient, currentUserId]
)
```

Jika backend mengirim `conversation.counter` dengan `userId` yang tidak match (format berbeda, null, undefined), handler diam-diam skip dan count tidak pernah update.

## Data Flow Diagram

```
[Backend]
  ├─ countConversation() API → ConversationStats { yourInboxCount: 26 }
  │   └─ useCountConversation() → React Query [COUNT_CONVERSATIONS]
  │       └─ InboxSection → CountBadge(count=26)
  │
  └─ getConversations(assign=true, hideEmpty=true) → 28 items
      └─ useConversations(filter) → React Query [CONVERSATIONS, {assign:true}]
          └─ ConversationList → 28 items rendered

[Socket Events]
  ├─ conversation.counter → handleConversationCounter → setQueryData(count) ← PRIMARY count update
  ├─ notification.new.message → handleInvalidateConversationOnNoMatched
  │   ├─ conversation NOT in cache → invalidate list + count ✓
  │   └─ conversation IN cache → update list only, count untouched ✗
  ├─ conversation.assigned → invalidateConversationQueries → invalidate all + count ✓
  ├─ conversation.unassigned → invalidateConversationQueries → invalidate all + count ✓
  └─ conversation.pulled → invalidateConversationQueries → invalidate all + count ✓
```

## Kenapa Hard Refresh Fix

Hard refresh meng-clear semua React Query cache. Kedua query (count + list) di-fetch ulang dari backend. Jika backend saat itu mengembalikan angka yang konsisten, sinkron. Tapi ini temporary fix — diverge bisa terjadi lagi.

## Proposed Fix

### Fix 1: Tambahkan refetchInterval pada count query (minimal, safe)

**File:** `apps/omnichannel/services/conversation/conversation.service.ts:354`

```ts
return useQuery<ConversationStats, ErrorResponse>({
    enabled: isEnabled,
    queryFn: async () => { ... },
    queryKey: [CONVERSATION_QUERY_KEY.COUNT_CONVERSATIONS],
    refetchInterval: 30_000, // ponytail: 30s polling, upgrade to socket-only when counter event reliability is proven
})
```

Ini memastikan count query di-refetch setiap 30 detik sebagai safety net, bahkan jika socket event tidak datang. Cost: 1 extra API call per 30 detik per user.

### Fix 2: Invalidate count pada setiap notification.new.message (bukan hanya new conversation)

**File:** `apps/omnichannel/hooks/conversation/cache-handler/use-invalidate-conversation.ts:163-173`

Saat ini hanya invalidate count jika conversation TIDAN ada di cache. Tambahkan invalidation untuk kasus conversation SUDAH ada:

```ts
if (isMessageRelevant) {
    if (!isConversationExist) {
      if (conversation?.participants?.some((p) => p.userId === currentUserId) || currentUserRole === RoleTypeEnum.ADMIN) {
        queryClient.invalidateQueries({ queryKey })
        queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY.COUNT_CONVERSATIONS] })
      }
    } else {
      // ponytail: invalidate count even for existing conversations to keep counter in sync
      queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY.COUNT_CONVERSATIONS] })
    }
}
```

### Fix 3: Backend — pastikan count API dan list API pakai criteria yang sama

Ini fix paling penting tapi butuh akses ke backend. Pastikan `countConversation()` endpoint menggunakan query logic yang sama dengan `getConversations({ assign: true })`.

## Verification

Untuk verify root cause:
1. Buka DevTools → Network tab
2. Filter `count` dan `conversation` requests
3. Trigger scenario: buka "Kotak Pesan Anda", tunggu beberapa menit tanpa hard refresh
4. Perhatikan apakah `countConversation` API dipanggil ulang (seharusnya TIDAK, kecuali ada socket event atau invalidation)
5. Bandingkan response `countConversation.yourInboxCount` dengan jumlah item di `getConversations` response

## Files Referenced

| File | Line | Relevance |
|------|------|-----------|
| `services/conversation/conversation.service.ts` | 348-366 | Count query definition (no refetchInterval) |
| `hooks/conversation/socket/use-conversation-socket-event.ts` | 570-589 | `conversation.counter` socket handler (userId guard) |
| `hooks/conversation/socket/use-conversation-socket-event.ts` | 112-120 | `invalidateConversationQueries` (invalidates count) |
| `hooks/conversation/cache-handler/use-invalidate-conversation.ts` | 136-174 | `handleIncomingMessage` (conditional count invalidation) |
| `hooks/conversation/cache-handler/use-update-latest-message.ts` | 73-101 | Direct list cache update (no count update) |
| `packages/react-query/src/helpers/makeQueryClientHelper.ts` | 9-12 | Global defaults (refetchOnWindowFocus: false, staleTime: 2min) |
| `components/molecules/conversations/nav-lists/ConversationNavItemDefault.tsx` | 318 | `useConversationData()` → `useCountConversation()` |
| `components/molecules/conversations/nav-lists/CountBadge.tsx` | 23-43 | Badge renderer |
