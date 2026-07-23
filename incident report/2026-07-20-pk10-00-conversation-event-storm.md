# Incident Report: Conversation Loading Spike (10:00)

- **Date:** 2026-07-20
- **Window:** 10:00–10:55 WIB (peak 10:29:30)
- **Severity:** SEV-2 (multi-tenant degradation, no data loss)
- **Impact:** conversation list blank/loading 10–15 menit, semua tenant
- **Reporter:** user (Grafana + browser network + console)
- **Status:** root cause diidentifikasi via code review, belum di-patch, belum di-reproduce di staging
- **Related:** [`2026-07-20-1210-rmq-sync-history-saturation.md`](./2026-07-20-1210-rmq-sync-history-saturation.md) — insiden 12:10 mengaktifkan amplifier yang sama + queue architecture bug baru

---

## 1. Ringkasan Eksekutif

Inbound message burst pada satu tenant memicu **event amplification storm** di socket pipeline BE dan **invalidation storm** di FE. Karena server dan DB dibagi lintas tenant, tekanan pada 1 tenant menular ke semua tenant. Timeout Axios FE 60 detik plus retry detail 3x plus reconnect global `invalidateQueries()` menutup loop menjadi feedback yang self-reinforcing selama ~55 menit.

Ini bukan bug endpoint tunggal. Ini interaksi 6 titik: 2 di BE, 4 di FE.

---

## 2. Timeline

| Waktu | Peristiwa | Sumber |
|---|---|---|
| 10:00 | Baseline connections ~540 | Grafana |
| 10:20 | Inbound rate mulai naik, connections mulai climb | Grafana + network browser |
| 10:29:30 | Peak connections **794** (green Current) | Grafana tooltip |
| 10:29:30 | Concurrent yellow Current 285, Active 90/77 | Grafana tooltip |
| 10:20–10:55 | User laporan panel conversation blank/loading | User observation |
| 10:35–10:45 | Data gap series hijau (tidak dikonfirmasi apakah source gap atau node switch) | Grafana |
| 10:55 | Grafana window screenshot berakhir, insiden masih berlangsung | Grafana |

Chronology deploy/restart/rollback belum dikonfirmasi user — perlu diisi sebelum RCA final.

---

## 3. Gejala Terobservasi

- Network browser: `GET /conversation/count` dan `GET /conversation` berulang saat inbound masuk
- Console browser: banyak socket event `new conversation`
- Grafana panel "Connections Over Time": current 700++
- UI: conversation panel loading lama lalu blank, durasi 10–15 menit
- Blast radius: seluruh tenant, bukan hanya tenant yang burst

---

## 4. Root Cause

**Compound cause. Bukan single fault.**

Chain:

```
1 inbound event ke Tenant A
  → BE inbound-message.processor emit SOCKET_HANDLE_MESSAGE
  → API gateway fanout:
       - room conversation:{id}       event: message
       - room company:{companyId}     event: notification.new.message
  → jika new conversation tanpa participant:
       - handleAutoPullAndRefresh
       - emit CONVERSATION_PULLED
       - updateCounter → emit CONVERSATION_COUNTER
  → FE handler:
       - handleNewOrUpdateMessage (dari `message`)
       - handleNotifNewMessage (dari `notification.new.message`) — juga panggil handleNewOrUpdateMessage
       - handleConversationPulled → invalidateConversationQueries (5 query)
       - handleConversationCounter → setQueryData + refetch /count 1s kemudian
  → Axios request timeout 60000ms
  → useConversationDetail retry 3x untuk non-403/404
  → socket flap saat load tinggi
  → useOnSocketReconnect → queryClient.invalidateQueries() (SEMUA query)
  → shared server + shared DB → blast ke Tenant B, C, D
  → connection count 700++
  → useIsFetching(FETCH_CONVERSATIONS_DETAIL) true → header+input+chat area masuk loading state → user lihat blank
```

**Root causes (yang harus di-fix untuk memutus loop):**

| # | Lokasi | Kode | Efek |
|---|---|---|---|
| RC-1 | BE api-gateway | `emitMessage()` fanout 2 target per 1 inbound | Doubling event rate |
| RC-2 | FE socket handler | Listen `message` **dan** `notification.new.message` bersamaan | Doubling handler work |
| RC-3 | FE socket handler | `handleConversationCounter` setTimeout 1000ms → `invalidateQueries([COUNT])` setelah `setQueryData` | Force refetch `/count` yang seharusnya sudah update via socket payload |
| RC-4 | FE socket handler | `invalidateConversationQueries()` invalidate 5 query sekaligus per event pull/assigned/unassigned | Multiplier |
| RC-5 | FE reconnect | `queryClient.invalidateQueries()` global tanpa key filter | Setiap reconnect = full app refetch |
| RC-6 | FE axios | Timeout 60s + retry 3x pada `useConversationDetail` | Menambah request pressure ke BE yang sudah kewalahan |

**Contributing (bukan root, tapi memperparah):**

| # | Lokasi | Efek |
|---|---|---|
| CC-1 | BE `handleAutoPullAndRefresh` jalan per inbound baru | Multiplies downstream events per inbound |
| CC-2 | BE `GET /conversation/count` bukan cheap calc — emit `CONVERSATION_INIT_COUNTER` saat init | Memicu event tambahan saat count meledak |
| CC-3 | BE `AutoPullCronService` @Interval 2 menit | Amplifier periodik saat sudah storm |
| CC-4 | Shared server + shared DB, tanpa isolasi tenant | Blast radius arsitektural |

---

## 5. Bukti Kode

**BE**

- `apps/api-gateway/src/websocket/services/conversation.service.ts:185-208` — dual fanout
- `apps/api-gateway/src/websocket/services/conversation.service.ts:262-292` — `emitConversationAssigned/Unassigned/Pulled` semua ke room company
- `apps/conversation-service/src/app/processors/inbound-message.processor.ts:307-322` — inbound → auto-pull → refresh → counter → emit
- `apps/conversation-service/src/app/processors/inbound-message.processor.ts:879-892` — `handleAutoPullAndRefresh` chain
- `apps/conversation-service/src/app/services/conversation.service.ts:1124-1137` — `handleSelfPullAssignment` emit counter + pulled
- `apps/conversation-service/src/app/services/conversation.service.ts:1293-1359` — `countConversations` bisa emit `CONVERSATION_INIT_COUNTER`
- `apps/conversation-service/src/app/services/auto-pull-cron.service.ts:15-195` — cron 2 menit

**FE**

- `apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:594-612` — subscribe dua event
- `apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:685-700` — `notification.new.message` tetap panggil full flow
- `apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:112-120` — `invalidateConversationQueries` 5 query
- `apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:570-586` — counter refetch after 1000ms
- `apps/omnichannel/hooks/conversation/socket/use-on-socket-reconnect.ts:66-80` — global invalidate on reconnect
- `apps/omnichannel/hooks/useAxiosPrivateApi.ts:135-141` — `requestTimeout = 60000`
- `apps/omnichannel/services/conversation/conversation.service.ts:118-136` — retry 3x
- `apps/omnichannel/components/ConversationChatRoomHeader.tsx:427-432` + `ChatRoomInputBase.tsx:409-412` — `useIsFetching` menyebabkan blank state
- `apps/omnichannel/components/pages/ManageConversationPage.tsx:38-42` — global socket handler mount

---

## 6. Dampak

**User-facing:**
- Semua agent tenant tidak bisa akses conversation panel selama ~10–15 menit
- Kemungkinan SLA breach untuk agent assignment
- Kemungkinan customer double-message karena inbox tidak responsif
- Risk: notification/unread count tidak akurat selama window insiden

**Sistem:**
- Connection count 794 (near-peak, kapasitas real belum dikonfirmasi)
- Endpoint spam: `/conversation/count`, `/conversation`, `/conversation/:id`
- Socket pressure naik
- DB pressure naik (shared, semua tenant)

**Data:**
- Tidak ada data loss terkonfirmasi
- Message inbound tetap tersimpan (BE processor ack setelah save)
- Retry logic BE (`MAX_RETRIES` di `inbound-message.processor.ts:497-514`) masih intact

---

## 7. Verifikasi & Reproduksi

Belum diverifikasi di staging. Skema reproduksi sudah didefinisikan (lihat session summary — Phase 1 baseline → Phase 2 storm 1 tenant → Phase 3 socket flap → Phase 4 auto-pull amplifier, dengan Playwright + CDP + counter assertion).

**Kriteria sukses reproduce:**
1. 1 inbound → ≥2 socket event terekam di FE WS frame
2. 1 counter event → 2× hit `/count`
3. Request `/conversation/:id` timeout 60s + 3 retry
4. Tenant B (idle) mengalami blank/loading
5. Rolling restart api-gateway men-trigger burst refetch

---

## 8. Mitigasi (Sementara)

Belum di-deploy. Kandidat quick-win, urutkan berdasarkan diff kecil vs efek besar:

1. **[FE, 1 line]** Hapus `setTimeout invalidate` di `handleConversationCounter` — `setQueryData` sudah cukup karena payload berisi data counter penuh. **Efek: matikan `/count` amplifier langsung.**
2. **[FE, small]** Batasi `useOnSocketReconnect` hanya invalidate query key relevan (conversation, count), jangan global. **Efek: matikan reconnect storm.**
3. **[FE, small]** `notification.new.message` jangan panggil `handleNewOrUpdateMessage` — cukup update unread/badge dan invalidate ringan. Full message handling biar cuma jalur `message`. **Efek: kurangi handler work 50%.**
4. **[FE, 1 line]** `useConversationDetail` retry 3 → 0 atau 1 untuk timeout. **Efek: kurangi retry pressure saat BE lambat.**
5. **[BE, small]** `emitMessage` — pertimbangkan pakai `notification.new.message` sebagai lightweight notice (id + preview) dan hanya emit full payload ke room conversation. FE harus fetch sendiri kalau butuh full. **Efek: kurangi payload size × RPS.**
6. **[BE, config]** Rate limit / debounce `updateCounter` per company per detik. **Efek: cap counter event rate.**

**Struktural (bukan quick-win):**
- Isolasi DB per tenant atau read replica per tenant
- Circuit breaker di BE saat DB p95 melewati threshold — reject socket emit sementara
- Backpressure ke socket saat event queue tinggi

---

## 9. Open Questions

Perlu jawaban user / observability team sebelum RCA di-finalize:

1. Apakah ada deploy/rollback/restart di window 10:00–10:55? Kalau ada, kapan dan apa?
2. Konfirmasi via WS frame di prod: 1 inbound aktif → FE terima `message` **dan** `notification.new.message` untuk client yang sama?
3. Lonjakan `conversation.pulled` dan `conversation.counter` bareng inbound saat incident?
4. Endpoint mana p95-nya paling parah saat 10:29: `/conversation`, `/conversation/:id`, `/conversation/count`, `/conversation/filter-count`?
5. Socket reconnect rate saat incident?
6. Kapasitas real connection pool (BE, DB, socket adapter)? Peak 794 masih di bawah atau sudah menyentuh cap?

---

## 10. Action Items

| # | Item | Owner | Prioritas | Status |
|---|---|---|---|---|
| A1 | Reproduce di staging pakai skema Phase 1–4 | Engineering + QA | P0 | Pending |
| A2 | Konfirmasi timeline deploy/restart 10:00–10:55 | DevOps | P0 | Pending |
| A3 | Patch RC-3 (hapus counter setTimeout refetch) | FE | P0 | Pending |
| A4 | Patch RC-5 (scope reconnect invalidate) | FE | P0 | Pending |
| A5 | Patch RC-2 (notification handler slim down) | FE | P1 | Pending |
| A6 | Patch RC-6 (retry policy detail) | FE | P1 | Pending |
| A7 | Patch RC-1 (BE dual fanout strategy) | BE | P1 | Pending |
| A8 | Monitoring: socket event rate per company panel | Observability | P1 | Pending |
| A9 | Long-term: tenant DB isolation study | Architecture | P2 | Pending |

---

## 11. Lessons

1. Multi-tenant shared infra tanpa isolasi = 1 tenant storm bisa jadi outage semua tenant.
2. Socket event handler yang invalidate query mahal harus punya budget/coalesce.
3. Reconnect global invalidate adalah anti-pattern di FE dengan banyak query aktif.
4. Timeout 60s tanpa circuit breaker di layer atas hanya menunda kegagalan, tidak mencegahnya.
5. FE dan BE punya kontrak event yang overlap (`message` + `notification.new.message` sama-sama full payload) tanpa batasan siapa handle apa — perlu spec eksplisit.

---

**Sign-off:** Analyst (Dany Christian, PM) + Engineering Lead (Naftal Yunior) — pending review.

**Attachment:** session summary `summary/2026-07-20-conversation-loading-spike-analysis.md`.
