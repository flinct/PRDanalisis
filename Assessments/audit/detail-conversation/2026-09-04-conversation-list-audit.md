# Assessment Report — Conversation List Audit

Tanggal: 2026-09-04  
Author: Analyst  
Scope: section **conversation-list** pada modul Conversation SatuInbox (FE `chat-lists/` + API/BE yang melayani list)

## Executive Summary

Conversation list sudah punya fondasi benar di beberapa area penting: list memakai **virtualized container**, role gate `PullButton` sudah pakai `role.code`, BE list sudah memangkas `latestMessage.htmlContent` untuk mencegah payload email meledak, dan agent ownership guard memang ada di repo-layer. Tapi masih ada beberapa gap lintas FE/BE yang material.

Temuan utama:
- **1 High**: FE melakukan re-sort lokal di seluruh hasil infinite-query berdasarkan `timestamp`, sementara BE punya sort sendiri + data bisa berubah realtime. Ini membuka risiko urutan tidak stabil antar page dan item bisa loncat/duplikat saat pagination + socket update.
- **3 Medium**: filter count tidak scoped ke current filter/nav seperti list; filter state hanya persist `sort`; invalidation logic untuk incoming message pada team-view non-admin lebih ketat dari rule backend sehingga list bisa stale.
- **3 Low**: prefetch page-1 tidak konsisten dengan query utama (`hideEmpty` hilang), pencarian/filter in-memory cek subset field dan bisa beda dengan server truth, belum terlihat rollback/explicit error state untuk beberapa mutasi list.

Decision: **PROCEED_WITH_CAUTION**

## System Model

### Actors
- Agent
- Supervisor
- Admin
- Non-admin role lain yang masih bisa membuka conversation list sesuai scope

### Components
- FE `ConversationChatLists.tsx`
- FE `ConversationChatListFilter.tsx`
- FE Zustand `conversationFilter.store.ts`
- FE data hooks `services/conversation/conversation.service.ts`
- FE socket/cache handlers `use-conversation-socket-event.ts`, `use-invalidate-conversation.ts`
- BE `conversation.service.ts#getConversations`
- BE `conversation.repository.ts#getPaginatedConversation` + filter/sort/search pipeline

### Main flow
1. FE bangun `filters` via `useConversationFilters()`.
2. `InfiniteVirtualContainer` panggil `useConversations(filter)`.
3. FE hit `getConversations(page, { ...filter, hideEmpty: true })`.
4. BE `getConversations` meneruskan ke `conversationRepository.getPaginatedConversation(request)`.
5. Repo bangun filter + sort + lookup latest/pinned message, lalu paginasi.
6. FE menerima pages, lalu `formatData()` re-filter unread dan re-sort lokal.
7. Socket event meng-update cache/invalidate sebagian query.

## Findings

### CL-01 — P1 High — INCONSISTENCY — FE re-sort lokal berpotensi merusak urutan paginasi server
**Status:** Confirmed  
**Location:** FE list formatting vs BE pagination/sort  
**Scenario:** user scroll infinite list beberapa page, lalu ada socket update/new message atau beda sort direction. FE menggabungkan items lintas page lalu mengurutkan ulang lokal berdasarkan `isPinned`, `pinnedAt`, `timestamp`, sementara BE sudah mengurutkan + memotong data per page sebelum dikirim.  
**Expected:** urutan list tunggal, stabil, dan konsisten antara page-1/page-2/server query/socket refresh.  
**Actual / Failure Mode:** FE melakukan second sort di `handleFormatConversationLists()` setelah pagination (`ConversationChatLists.tsx:74-110,203-205`). BE juga mengurutkan sebelum `$skip/$limit` (`conversation.repository.ts:252-278`). Jika item berubah timestamp/pin state di tengah pagination, hasil gabungan lintas page bisa loncat, duplikat visual, atau kehilangan posisi stabil.  
**Root Cause:** sorting dibagi dua layer: server menentukan page boundary, client menentukan final order lagi.  
**Evidence:**
- FE `ConversationChatLists.tsx:74-110` local `sort()` setelah flatten data.
- FE `ConversationChatLists.tsx:203-205` `formatData={(datas) => handleFormatConversationLists(...)}`.
- BE `conversation.repository.ts:252-278` apply `$skip` + `$limit` setelah pipeline/sort, artinya server order menentukan page boundary.
**Impact:** infinite scroll tidak deterministik, susah direproduksi, rawan mismatch saat realtime traffic tinggi.  
**Blast Radius:** semua user conversation list, paling terasa pada inbox aktif dan email/chat volume tinggi.  
**Recommendation:** pilih satu source of truth untuk sort final. Paling aman: server urutkan final, FE jangan sort ulang seluruh list; FE hanya lakukan view-only transforms yang tidak mengubah global order.  
**Suggested Test:** buka 3 page list, trigger incoming message pada item page-2 agar `timestamp` naik; verifikasi item tidak muncul ganda / lompat aneh setelah refetch/socket.

### CL-02 — P2 Medium — INCONSISTENCY — Filter count bar tidak mengikuti scope filter list saat ini
**Status:** Confirmed  
**Location:** FE filter controls  
**Scenario:** user ganti nav/channel/team lalu membaca chip count Open/Closed/Read/Unread di header filter.  
**Expected:** angka pada filter controls merepresentasikan scope list aktif, atau jelas diberi label global-scope.  
**Actual / Failure Mode:** `ConversationChatListFilter` memakai `useConversationFilterCount()` tanpa parameter current filter/nav (`ConversationChatListFilter.tsx:86-96`). Sementara list query memakai `useConversationFilters()` + `getConversations(page, { ...filter, hideEmpty: true })` (`conversation.service.ts:65-79`). Ini berisiko menampilkan count yang tidak sama dengan scope list aktif.  
**Root Cause:** count query dan list query tidak share filter object yang sama di titik pemanggilan FE.  
**Evidence:**
- FE `ConversationChatListFilter.tsx:88-90` ambil store status/read/sort + `useConversationFilterCount()`.
- FE `conversation.service.ts:65-79` list query keyed by `filter` dan request pakai merged filter.
**Impact:** user bisa salah baca distribusi status/read pada scope saat ini.  
**Blast Radius:** semua user yang mengandalkan chip count filter untuk navigasi cepat.  
**Recommendation:** scope-kan count query dengan filter/nav aktif, atau labeli tegas kalau angka memang global pada inbox scope tertentu.  
**Suggested Test:** bandingkan count status/read saat pindah dari all channel ke satu team/channel sempit.

### CL-03 — P2 Medium — DESIGN FLAW — Filter state tidak persist penuh, perilaku list berubah antar revisit
**Status:** Confirmed  
**Location:** Zustand store conversation filter  
**Scenario:** user mengatur status/read/search/sort, pindah route atau reload lalu kembali ke conversation list.  
**Expected:** perilaku persistence konsisten: semua filter penting persist, atau semua reset by design dengan alasan jelas.  
**Actual / Failure Mode:** store memakai `persist`, tapi `partialize` hanya menyimpan `sort` (`conversationFilter.store.ts:33-49`). `status`, `read`, dan `search` reset ke initial tiap reload, sementara `sort` tetap. Ini perilaku campuran yang sulit ditebak user dan sulit diaudit.  
**Root Cause:** persistence hanya partial tanpa penjelasan product rule.  
**Evidence:** `conversationFilter.store.ts:45-49` hanya return `{ sort: state.sort }`.  
**Impact:** pengalaman list inkonsisten; bug report "filter saya hilang tapi sort masih nyangkut" sulit dibedakan dari intended behavior.  
**Blast Radius:** seluruh FE conversation list.  
**Recommendation:** putuskan policy tunggal: persist semua filter yang user-set, atau reset semua saat revisit. Jika search sengaja tidak persist, dokumentasikan dan implementasikan eksplisit.  
**Suggested Test:** set open/unread/search custom, reload page, cek mana yang bertahan.

### CL-04 — P2 Medium — DATA INTEGRITY ISSUE — Invalidation incoming-message di team view non-admin lebih sempit dari rule backend
**Status:** Confirmed  
**Location:** FE cache invalidation  
**Scenario:** non-admin membuka team view tanpa `assign`, lalu ada incoming message untuk conversation relevan yang belum ada di cache list itu.  
**Expected:** jika backend menganggap conversation itu visible dalam current scope, FE invalidate list agar item masuk.  
**Actual / Failure Mode:** `checkTeamBasedViewForNonAdmins()` mewajibkan conversation team-view non-admin dengan participant>0 harus punya current user sebagai participant (`use-invalidate-conversation.ts:75-93`). Rule ini lebih ketat dari audit backend team-view sebelumnya yang memperbolehkan non-agent/non-admin tertentu melihat semua conversation dalam team tergantung jalur/filter. Jika mismatch, FE bisa skip invalidation untuk item yang sebenarnya valid menurut server.  
**Root Cause:** FE menebak ulang authorization/visibility logic dengan rule lokal sendiri.  
**Evidence:**
- FE `use-invalidate-conversation.ts:75-93` team-based non-admin check.
- FE `use-invalidate-conversation.ts:163-173` invalidasi hanya bila `isMessageRelevant` true.
- Backend visibility tidak berasal dari helper FE ini; source of truth ada di repo/service.  
**Impact:** list bisa stale sampai refresh/manual invalidation.  
**Blast Radius:** role non-admin pada team-based view.  
**Recommendation:** jangan mirror rule visibility kompleks di FE. Lebih aman invalidate pada current list key ketika team/platform basic match, lalu biarkan server truth memutuskan inclusion.  
**Suggested Test:** login role non-admin team view, kirim message ke conversation team yang belum ada di cache namun seharusnya visible; cek apakah list auto-muncul.

### CL-05 — P3 Low — INCONSISTENCY — Prefetch conversations tidak sama dengan query utama
**Status:** Confirmed  
**Location:** FE prefetch hook  
**Scenario:** route transition/hover prefetch dipakai untuk warm cache conversation list.  
**Expected:** prefetch menghasilkan cache shape dan dataset yang sama dengan query utama.  
**Actual / Failure Mode:** query utama selalu pakai `hideEmpty: true` (`conversation.service.ts:74-77`), tapi `usePrefetchConversations` memanggil `getConversations(pageParam, filter)` tanpa merge `hideEmpty` (`conversation.service.ts:90-97`).  
**Root Cause:** duplicate request builder logic.  
**Evidence:** `useConversations()` vs `usePrefetchConversations()` di file yang sama.  
**Impact:** prefetch bisa warm cache dengan dataset berbeda dari tampilan nyata.  
**Blast Radius:** path yang memanfaatkan prefetch.  
**Recommendation:** reuse satu helper request builder untuk semua query list/prefetch.  
**Suggested Test:** prefetch lalu buka list dengan dataset yang punya empty conversations; cek cache/result beda atau tidak.

### CL-06 — P3 Low — PERFORMANCE ISSUE — FE invalidation mengecek keberadaan conversation dengan flatten seluruh pages
**Status:** Confirmed  
**Location:** FE incoming-message cache handler  
**Scenario:** cache list panjang multi-page menerima banyak socket events.  
**Expected:** relevance/invalidation check murah dan bounded.  
**Actual / Failure Mode:** handler melakukan `cached?.pages.flatMap((page) => page.items).some(...)` untuk setiap incoming message (`use-invalidate-conversation.ts:147-155`). Pada list panjang dan traffic tinggi, ini jadi scan linear per event.  
**Root Cause:** tidak ada indexed lookup/id-set untuk current cache.  
**Evidence:** `use-invalidate-conversation.ts:147-155`.  
**Impact:** CPU FE bertambah saat traffic ramai; masih low karena list sudah virtualized, tapi event-side scan tetap ada.  
**Blast Radius:** agent dengan inbox ramai.  
**Recommendation:** simpan `Set` id saat flatten, atau delegasikan lebih banyak ke invalidate kasar bila event rate rendah tapi correctness penting.  
**Suggested Test:** simulate banyak `notification.new.message` saat cache >200 item dan ukur scripting time.

### CL-07 — P3 Low — OPERABILITY ISSUE — Empty/skeleton ada, tapi error-state list tidak terlihat eksplisit di container ini
**Status:** Confirmed  
**Location:** FE list shell  
**Scenario:** API list gagal / auth transient / server error.  
**Expected:** user mendapat error state yang jelas dan recoverable, bukan hanya empty-like state atau silent fail dari generic container.  
**Actual / Failure Mode:** `ConversationChatLists.tsx` hanya memasok `noDataError` dan `dataLoader` ke `InfiniteVirtualContainer` (`:194-210`). Dari komponen ini sendiri tidak terlihat explicit error rendering khusus conversation list.  
**Root Cause:** error behavior disembunyikan di shared container sehingga audit lokal sulit memastikan UX-nya benar.  
**Evidence:** `ConversationChatLists.tsx:194-210`.  
**Impact:** observability UX lemah; debugging laporan user lebih susah.  
**Blast Radius:** semua error path list.  
**Recommendation:** pastikan shared container punya explicit error slot/state, atau kirim error renderer spesifik dari conversation list.  
**Suggested Test:** paksa API 500 lalu cek apakah list menampilkan error yang actionable.

## Open Questions
- Apakah product memang ingin hanya `sort` yang persist, sedangkan status/read/search reset? Jika ya, perlu didokumentasikan.
- Apakah `useConversationFilterCount()` memang global pada inbox scope tertentu, atau seharusnya ikut current `useConversationFilters()`?
- Untuk team view non-admin, visibility final yang canonical apa: semua convo dalam team, atau hanya convo yang user ikut jika ada participant?

## Recommendation / Next Action
1. Fix CL-01 dulu: hapus global re-sort FE atau jadikan server satu-satunya source of truth order.
2. Samakan source filter object untuk list + filter-count.
3. Sederhanakan invalidation FE: jangan duplicate rule visibility kompleks yang sudah hidup di backend.
4. Setelah fix, tambah satu audit lanjutan khusus bulk-action/item rendering bila user ingin pecah per sub-area.
