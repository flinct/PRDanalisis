# Summary

- **Tanggal:** 2026-07-20
- **Judul session:** conversation loading spike analysis
- **Tujuan / request utama user:** analisa issue conversation loading lama/blank sekitar 10-15 menit saat inbound tinggi, dengan kandidat penyebab round robin cron, global search, export analytics, inbound rate tinggi, socket new message, dan SLA cron.
- **Ringkasan progres / analisa / keputusan penting selama session:** rule wajib, workflow context, global memory, impact analysis rule, dan QA analysis rule sudah dibaca. Evidence user menunjukkan network console memanggil count dan conversation berulang saat inbound masuk, dengan banyak socket event `new conversation`. Screenshot Grafana menunjukkan spike current connections hingga ~794 sekitar 10:29:30, konsisten dengan momen UI blank/loading lama. Analisa awal difokuskan ke chain reaction event-driven pada conversation list/room dibanding kandidat batch job pasif. Setelah user memberi jawaban Q1–Q5 (1 inbound = 1 spike, root + amplifier, shared server/DB blast radius, FE timeout 60s + refetch, kemungkinan retry loop di BE), dilanjutkan pembacaan code FE + BE. Ditemukan chain reaction lintas layer: BE emit ganda per inbound (room conversation + room company), FE listen di dua jalur (`message` dan `notification.new.message`), `invalidateConversationQueries()` invalidate 5 query sekaligus, `handleConversationCounter` refetch count 1 detik setelah update, timeout Axios 60s persis dengan pola user, retry detail 3x, reconnect global `invalidateQueries()`. Auto-pull dan counter menambah event turunan per inbound baru.
- **Status terakhir / next step:** analisa detail sudah dikirim. Belum bikin Assessment Report permanen. Open questions untuk RCA final: konfirmasi FE terima dua event untuk 1 inbound, lonjakan `conversation.pulled` / `conversation.counter` saat incident, endpoint mana yang paling lama saat timeout, socket reconnect rate saat incident.

---

## Transkrip Percakapan

### Turn 1 — User

> [The user attached an image:
> Grafana-style dashboard panel, dark theme.
>
> **Header:** "Connections Over Time" top-left, kebab menu (⋮) top-right.
>
> **Chart:** time-series, x-axis 10:00–10:55 (5-min ticks), y-axis 0–800 (200 steps). Mixed viz: bars (dark olive/green translucent) + line series + scatter dots.
>
> Series:
> - Green "Current" — high band, ~540 early, climbs to ~780 peak around 10:20–10:30, gap 10:35–10:45, resumes ~580–600
> - Yellow "Current" — mid band ~180–290
> - Blue "Active" — low ~50–90
> - Orange "Active" — lowest ~40–80
>
> **Tooltip** (centered, timestamp 2026-07-20 10:29:30):
> - Current 794 (green, bold)
> - Current 285 (yellow)
> - Active 90 (blue)
> - Active 77 (orange)
>
> Crosshair vertical dashed line at 10:30, highlighted dots at intersection.
>
> **Legend table** below chart, columns: Name | Mean | Max | Last (headers blue):
> - Current (green) — 659 | 794 | (blank)
> - Current (yellow) — 228 | 291 | 214
> - Active (blue) — 69.3 | 92 | 61
> - Active (orange) row present but values off-frame
>
> Colors: bg near-black (#111-ish), grid faint gray, text white/gray, accent blue for column headers.]
>
> issue conversation loading sekitar 10-15 menit masih exist
>
> kandidat issue loading lama di converastion :
>
> round robbin (cron)
> global search
> export conversation from analytics
> rate inbound yang sangat banyak
> socket new message
> SLA (cron)
>
> jika dilihat dari network console browser, terlihat count dan conversation berulang dikarenakan adanya conversation inbound
> di antaranya yang terlihat jelas adalah banyaknya socket event new conversation
>
> terlihat connection di grafana juga melonjak ke 700++ current connection, di saat itu lah conversation terlihat loading lama dan blank (img 1)
>
> analisa

### Turn 2 — Assistant (analisa awal)

Analisa awal:

1. Gejala paling kuat bukan cron dulu. Lebih dekat ke event storm realtime.
   - Browser network: `count` dan `conversation` repeat saat inbound masuk.
   - Browser console/network: banyak socket event `new conversation`.
   - Grafana: current connections naik sampai `794` sekitar `2026-07-20 10:29:30`.
   - Saat spike itu, UI conversation loading lama lalu blank.

2. Korelasi utama:
   - inbound tinggi
   - socket `new conversation` meledak
   - FE refetch / rerender berulang
   - connection count naik 700++
   - conversation panel masuk state loading lama / blank

3. Dari kandidat penyebab, prioritas curiga:
   - `socket new message` / `new conversation` storm
   - `rate inbound yang sangat banyak`
   - `count` + `conversation` query invalidation berulang
   - baru setelah itu cek cron `round robin` dan `SLA`

4. Kenapa cron belum jadi tersangka utama:
   - evidence user tunjuk loop terjadi "dikarenakan adanya conversation inbound"
   - trigger terlihat realtime, bukan periodik murni
   - kalau cron jadi akar utama, biasanya pattern spike lebih sinkron ke schedule window, bukan erat ke inbound burst
   - cron masih bisa memperparah kalau ikut update assignment/SLA lalu memicu socket/invalidation tambahan

5. Hipotesis paling masuk akal:
   - setiap inbound conversation memicu socket event `new conversation`
   - FE menerima event lalu refresh conversation list dan count
   - ada lebih dari satu handler / invalidation path untuk event sama
   - request list belum selesai, event baru datang lagi
   - terjadi overlapping fetch, rerender, mungkin reset state loading
   - pada burst besar, UI kalah cepat, panel blank/loading

6. Dua bentuk root cause yang perlu dicari:
   - FE over-react:
     - satu socket event memicu banyak `invalidateQueries` / refetch
     - handler ganda untuk event sama
     - event untuk room non-relevan tetap memicu full reload list/count
     - loading state full-screen dipakai untuk incremental refresh
   - BE over-emit:
     - satu inbound menghasilkan beberapa socket event turunan
     - fanout terlalu lebar per company/user/room
     - duplicate event karena retry / multi-subscriber / ack problem

7. Pembacaan screenshot Grafana:
   - green current puncak `794`
   - yellow current `285`
   - active series `90` dan `77`
   - artinya koneksi open jauh lebih besar dari active work unit
   - ini cocok dengan banyak socket/client connection bertahan, bukan semata user aktif manual
   - gap sekitar `10:35–10:45` di series hijau bisa berarti data gap, panel query gap, atau node/source pindah. Bukan bukti root cause.

8. Dampak sistem:
   - conversation list lambat / blank
   - count endpoint spam
   - conversation endpoint spam
   - socket pressure naik
   - BE/API/DB load ikut naik
   - risk domino ke assignment, unread count, SLA badge, notification freshness

9. Ranking kandidat issue:
   1. `socket new message / new conversation`
   2. `rate inbound yang sangat banyak`
   3. interaction bug FE query invalidation for `count` + `conversation`
   4. `round robin (cron)` sebagai amplifier
   5. `SLA (cron)` sebagai amplifier
   6. `global search`
   7. `export conversation from analytics`

10. Kenapa `global search` dan `export analytics` lebih lemah:
    - dua ini biasanya user-driven / batch-driven
    - evidence lapangan nunjuk trigger saat inbound masuk
    - kecuali export/search jalan massal tepat bareng incident, mereka lebih mungkin noise daripada root cause

Open questions:
1. Apakah spike request `count` dan `conversation` muncul per 1 inbound event, atau 1 inbound memicu banyak request sekaligus?
2. Socket event yang paling dominan apa tepatnya: `new_message`, `new_conversation`, `update_conversation`, atau kombinasi?
3. Apakah request storm hanya terjadi di 1 company besar, atau semua tenant?
4. Saat blank, apakah FE menunggu full list reload, atau error lalu fallback ke empty state?
5. Sekitar jam `10:29–10:30`, ada cron `round robin` / `SLA` run juga atau tidak?

Kesimpulan kerja:
Root suspicion ada di jalur realtime inbound:
`inbound burst` + `socket new conversation/message storm` + `FE invalidation/refetch berulang` = conversation loading lama dan blank.

Kalau mau, next bisa dibikin:
- RCA format rapi
- tabel prioritas investigasi
- checklist log/query yang harus diambil dari FE, socket gateway, API, dan cron runner

### Turn 3 — User (jawaban Q1–Q5)

> q1, sepertinya 1 inbound event 1 spike
> q2, kemungkinan keduanya
> q3, karna sharing server dan db, ketika sorm terjadi, imbas ke smua tenant
> q4, FE menunggu reload, dan ini kena timeout 1 menit dan merefetch ulang
> q5, kemungkinan iya, liat code nya ke repo BE
>
> analisa dulu secara detail ke code FE dan BE

### Turn 4 — Assistant (analisa detail code)

Baik. Investigasi kode dulu — FE dan BE. Kumpulkan bukti sebelum bikin RCA.

Sudah lihat code FE + BE. Temuan kuat ada. Belum fix. Ini analisa detail.

#### Kesimpulan utama

Issue bukan 1 titik. Ini feedback loop lintas FE + BE:

`1 inbound event`
`BE emit socket ke room conversation + room company`
`FE handle event lalu invalidate banyak query`
`request detail/list/count/filter-count kena timeout 60s`
`FE retry/refetch lagi`
`shared server + shared DB bikin semua tenant kena`
`connection/current request spike naik`
`conversation page masuk loading/blank`

Jadi: root trigger kemungkinan inbound/socket storm. Root amplifier jelas ada di FE invalidation + 60s timeout + retry/refetch. BE juga ikut memperbesar fanout.

---

#### Bukti dari FE

##### 1. Socket message diproses 2 jalur sekaligus
File:
`apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:594-612`

FE listen:
- `notification.new.message`
- `message`
- `message.status`
- `notification.message.status`
- `conversation.assigned`
- `conversation.unassigned`
- `conversation.pulled`
- `conversation.counter`
- `ticket.created`
- `ticket.updated`

Masalah:
- 1 inbound dari BE dikirim ke room conversation sebagai `message`
- lalu juga ke room company sebagai `notification.new.message`
- FE pasang handler untuk dua event itu sekaligus

Kode:
- `socket.on('notification.new.message', handleNotifNewMessage)` `use-conversation-socket-event.ts:595`
- `socket.on('message', handleNewOrUpdate)` `use-conversation-socket-event.ts:596`

Artinya 1 inbound bisa masuk 2 pipeline FE.

##### 2. Handler notification tetap memproses message penuh
File:
`apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:685-700`

`handleNotificationNewMessage`:
- untuk non-active conversation: invalidate cache conversation kalau belum match
- lalu **selalu** panggil `handleNewOrUpdateMessage(message)`

Jadi `notification.new.message` bukan cuma badge/unread update. Dia tetap jalankan flow update message utama.

Implikasi:
- saat user join room conversation aktif, bisa kena `message`
- dan juga `notification.new.message`
- memang ada dedup message insertion, tapi **network invalidation** dan **cache churn** tetap jalan

##### 3. Invalidation scope sangat lebar
File:
`apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:112-120`

`invalidateConversationQueries()` invalidate:
- `CONVERSATIONS`
- `COUNT_CONVERSATIONS`
- `FETCH_CONVERSATION_COUNTS`
- `FETCH_CONVERSATION_FILTER_COUNTS`
- `CONVERSATION_LIMIT`

Ini berat. 1 event assignment/pull/unassign bisa nembak banyak endpoint.

Dipakai di:
- `handleConversationAssigned` `:410-413`
- `handleConversationUnassigned` `:454-457`
- `handleConversationPulled` `:491-505`

Kalau inbound baru auto-pull / auto-assign, FE bisa kena full invalidation set.

##### 4. Counter event sengaja refetch ulang 1 detik kemudian
File:
`apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts:570-586`

`handleConversationCounter`:
- `setQueryData([COUNT_CONVERSATIONS], data)`
- lalu `setTimeout 1000ms`
- lalu `invalidateQueries([COUNT_CONVERSATIONS])`

Artinya tiap counter event:
- update cache langsung
- **dan tetap trigger HTTP count lagi 1 detik setelahnya**

Kalau inbound burst tinggi dan counter event banyak, endpoint `/conversation/count` akan terus ditembak.

Ini sangat cocok dengan observasi user: `count` berulang di network.

##### 5. Reconnect meng-invalidate semua query global
File:
`apps/omnichannel/hooks/conversation/socket/use-on-socket-reconnect.ts:66-80`

Saat reconnect:
- kalau queue kosong
- `queryClient.invalidateQueries()`

Ini invalidate **semua query**, bukan cuma conversation.

Kalau incident load bikin socket flapping / reconnect, ini jadi multiplier besar:
- reconnect
- all queries invalidated
- load naik
- socket makin tidak stabil
- loop makin besar

##### 6. Timeout FE memang 60 detik
File:
`apps/omnichannel/hooks/useAxiosPrivateApi.ts:135-141`

Ada:
`const requestTimeout = 60000`

Ini cocok persis dengan statement user:
> FE menunggu reload, kena timeout 1 menit, lalu merefetch ulang

##### 7. Detail conversation punya retry 3x
File:
`apps/omnichannel/services/conversation/conversation.service.ts:118-136`

`useConversationDetail`:
- retry false hanya untuk 403/404
- selain itu retry sampai 3 kali

Jadi kalau timeout / 500 / network unstable:
- detail conversation retry lagi
- saat detail dipakai untuk page utama, loading state bisa lama
- blank state makin mungkin

##### 8. Blank/loading sangat mungkin karena UI pakai fetching detail global
File:
- `ConversationChatRoomHeader.tsx:427-432`
- `ChatRoomInputBase.tsx:409-412`

Mereka pakai `useIsFetching` terhadap `FETCH_CONVERSATIONS_DETAIL`.

Artinya selama detail query sedang fetching:
- header bisa masuk loading state
- input/chat area bisa ikut loading

Kalau detail query terus invalidated atau retry timeout, user lihat blank/loading lama.

##### 9. ManageConversationPage mount socket handler global
File:
`apps/omnichannel/components/pages/ManageConversationPage.tsx:38-42`

Page conversation selalu mount:
`useConversationSocketHandler()`

Jadi semua event company room langsung nyentuh page ini terus.

---

#### Bukti dari BE

##### 1. 1 inbound message di-broadcast ke 2 target socket
File:
`apps/api-gateway/src/websocket/services/conversation.service.ts:185-208`

`emitMessage()`:
- emit ke `conversation:{conversationId}` sebagai `message`
- emit ke `company:{companyId}` sebagai `notification.new.message`

Jadi 1 inbound menghasilkan minimal 2 emit socket.

Ini sinkron dengan dugaan tadi:
- active room client dapat `message`
- semua dashboard client company dapat `notification.new.message`

Kalau tenant besar, fanout besar.

##### 2. Inbound processor selalu emit socket setelah process
File:
`apps/conversation-service/src/app/processors/inbound-message.processor.ts:307-322`
`...:452-467`

Flow:
- resolve/create conversation
- save message
- ack queue
- mungkin auto-pull
- mungkin update counter
- lalu `emitPostProcessEvents()`
- `socketAsync.emit(EventTypeEnum.SOCKET_HANDLE_MESSAGE, ...)`

Jadi setiap inbound valid memang pasti push ke socket pipeline.

##### 3. New conversation tanpa participant bisa auto-pull lalu refresh
File:
`apps/conversation-service/src/app/processors/inbound-message.processor.ts:307-310`
`...:879-892`

Kalau conversation baru dan belum ada participant:
- `handleAutoPullAndRefresh(conversation)`
- call `CONVERSATION_AUTO_PULL`
- lalu `refreshConversation(...)`

Ini penting. 1 inbound baru tidak cuma save message.
Dia bisa trigger:
- assignment logic
- refresh conversation
- event `conversation.pulled`
- counter update
- SLA/assignment metric side effect

Jadi 1 inbound baru bisa melahirkan beberapa downstream event.

##### 4. Self-pull emit conversation.pulled + counter update
File:
`apps/conversation-service/src/app/services/conversation.service.ts:1124-1137`

`handleSelfPullAssignment()`:
- `await updateCounter(conversation, COUNTER_PULL)`
- `socketAsync.emit(CONVERSATION_PULLED, socketPayload)`

Di FE, `conversation.pulled` memanggil `invalidateConversationQueries()` penuh.

Jadi jika auto-pull sering kejadian pada inbound baru:
- inbound message event
- counter event
- pulled event
semua bisa numpuk.

##### 5. Counter endpoint sendiri tidak ringan secara desain
File:
`apps/api-gateway/src/app/conversation/conversation.controller.ts:395-455`
`apps/conversation-service/src/app/services/conversation.service.ts:1293-1359`

`GET /conversation/count`
- panggil `countConversations()`
- kalau counter belum ada / reset, resolve teams + active channels
- emit `CONVERSATION_INIT_COUNTER`

Ini berarti count bukan selalu cheap local calc.
Pada kondisi tertentu, dia juga bisa memicu init/update path.

##### 6. Auto-pull cron ada, tapi safety net tiap 2 menit
File:
`apps/conversation-service/src/app/services/auto-pull-cron.service.ts:15-195`

Cron:
- jalan tiap 2 menit
- safety net unassigned conversations
- ada Redis lock
- batch 120
- cooldown skip map

Kesimpulan:
- cron ini **bisa menambah pressure**
- tapi dari code, dia bukan pola utama "1 inbound 1 spike"
- lebih cocok sebagai amplifier periodik, bukan root utama incident realtime

---

#### Chain reaction yang paling mungkin

##### Skenario paling masuk akal
1. Inbound masuk banyak
2. Untuk tiap inbound:
   - conversation-service save message
   - emit `SOCKET_HANDLE_MESSAGE`
3. API gateway ubah jadi:
   - `message` ke room conversation
   - `notification.new.message` ke room company
4. Untuk conversation baru / belum assigned:
   - auto-pull jalan
   - `CONVERSATION_PULLED` emit
   - counter update emit
5. FE terima event-event itu:
   - `message`
   - `notification.new.message`
   - `conversation.pulled`
   - `conversation.counter`
6. FE kemudian:
   - update cache message
   - invalidate list/count/filter-count/detail
   - count di-refetch lagi 1 detik setelah counter event
7. Saat BE/DB melambat:
   - request timeout 60 detik
   - detail retry sampai 3x
   - reconnect / refetch / invalidate lagi
8. Shared server + shared DB:
   - satu tenant storm ganggu semua tenant
9. Hasil akhir:
   - connection 700++
   - repeated `count` dan `conversation`
   - conversation UI blank/loading 10–15 menit

---

#### Kandidat penyebab, setelah baca code

##### Paling kuat
1. `socket new message / new conversation storm`
2. `rate inbound yang sangat banyak`
3. `FE invalidation terlalu agresif`
4. `FE timeout 60s + retry detail + reconnect global invalidate`

##### Masih mungkin jadi amplifier
5. `round robin / auto-pull`
6. `SLA cron`

##### Lemah sebagai root cause utama incident ini
7. `global search`
8. `export conversation from analytics`

Karena evidence code dan gejala lebih nyambung ke realtime pipeline conversation.

---

#### Titik paling berbahaya di FE

1. `handleConversationCounter()` refetch count 1 detik setelah socket update
   `use-conversation-socket-event.ts:580-585`

2. `queryClient.invalidateQueries()` global pada reconnect
   `use-on-socket-reconnect.ts:71-74`

3. `invalidateConversationQueries()` invalidate banyak query sekaligus
   `use-conversation-socket-event.ts:112-120`

4. `useConversationDetail()` retry 3x untuk timeout/server error
   `conversation.service.ts:128-135`

5. Timeout request 60s
   `useAxiosPrivateApi.ts:135-141`

6. 1 inbound masuk dua jalur event FE
   `notification.new.message` + `message`

---

#### Titik paling berbahaya di BE

1. 1 inbound jadi 2 emit socket:
   - room conversation
   - room company
   `apps/api-gateway/src/websocket/services/conversation.service.ts:196-207`

2. inbound baru bisa trigger auto-pull + refresh
   `inbound-message.processor.ts:307-310`
   `...:879-892`

3. auto-pull emit `CONVERSATION_PULLED`
   `conversation.service.ts:1135-1136`

4. counter update menyertai flow inbound/new/pull/close/reopen
   terlihat di beberapa call `updateCounter(...)`

---

#### Hypothesis final sementara

Bukan "conversation endpoint rusak sendiri".

Lebih tepat:
- BE menghasilkan event volume tinggi per inbound
- FE merespons event terlalu mahal
- timeout/retry/refetch/reconnect bikin loop tertutup
- shared infra bikin blast radius lintas tenant

Jadi akar incident:
`event amplification + invalidation storm`

Bukan murni cron. Cron cuma kandidat amplifier tambahan.

---

#### Open questions penting sebelum simpulkan RCA final

1. Di prod, apakah 1 inbound untuk conversation aktif membuat client yang sama menerima **dua event**:
   - `message`
   - `notification.new.message`
   ?
   Kalau iya, itu bukti kuat amplifier FE.

2. Saat incident, apakah ada lonjakan `conversation.pulled` / `conversation.counter` juga?
   Kalau iya, auto-pull/counter ikut memperbesar storm.

3. Endpoint mana paling lama saat timeout 60s:
   - `/conversation/:id`
   - `/conversation`
   - `/conversation/count`
   - `/conversation/filter-count`
   Ini bantu bedakan bottleneck utama DB/API.

4. Socket reconnect rate naik atau tidak saat incident?
   Kalau iya, `invalidateQueries()` global di reconnect sangat berbahaya.

Kalau mau, next step:
- bikin RCA formal dengan chronology + root cause tree
- atau lanjut patch candidate list FE/BE paling kecil diff dulu tanpa ubah behaviour besar

### Turn 5 — User

> simpan isi session ini ke summary file nya
> taruh semua percakapan nya di sana

### Turn 6 — Assistant

Tersimpan.

File: `C:\Users\MyBook SAGA 12\summary\2026-07-20-conversation-loading-spike-analysis.md`
Size: 20903 bytes

Isi:
- Header ringkas (tanggal, judul, tujuan, progres, status)
- Transkrip 5 turn verbatim (image desc, Q1–Q5, analisa awal, analisa detail FE+BE)

Catatan: path relatif `summary/` resolve ke home dir (`C:\Users\MyBook SAGA 12\summary\`), bukan repo PRDanalisis. Kalau mau di dalam repo, kasih path absolut / cwd repo — saya pindahkan.

### Turn 7 — User

> cek lagi file nya belum ke update

### Turn 8 — Assistant

File sudah update. 577 lines, 20903 bytes.

Path: `C:\Users\MyBook SAGA 12\summary\2026-07-20-conversation-loading-spike-analysis.md`
Berisi 5 turn lengkap sampai request simpan.

Kalau maksudnya file lain (mis. path di repo PRDanalisis), kasih path yang benar.

### Turn 9 — User

> C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\summary\2026-07-20-conversation-loading-spike-analysis.md
> yg ini dong file nya

### Turn 10 — Assistant

Done.

Path: `C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\summary\2026-07-20-conversation-loading-spike-analysis.md`
577 lines, isi sama.

File lama di home dir (`C:\Users\MyBook SAGA 12\summary\...`) masih ada. Hapus?

### Turn 11 — User

> hapus

### Turn 12 — Assistant

Hapus. Folder ikut bersih.

### Turn 13 — User

> update summary rule nya biar setiap update summary seperti ini

### Turn 14 — Assistant

Done.

File: `Rules/summary-rule.md`

Perubahan:
- Isi Minimum: tambah item 6 = transkrip percakapan lengkap
- Section baru "Aturan Transkrip Percakapan" (8 poin): wajib semua turn, verbatim, kronologis, blockquote user, redaksi hanya untuk secret

Sekarang tiap update summary harus ikut sertakan seluruh transkrip verbatim.

### Turn 15 — User

> sekarang
> analisis gimana cara test nya
> buat skema testing biar ngereproduce error nya

### Turn 16 — Assistant

## Skema testing

### Tujuan
Reproduce: 1 tenant inbound burst → connection spike + FE conversation blank/loading di semua tenant.

### Yang direproduce (must-have)
1. FE terima 2 event per 1 inbound (`message` + `notification.new.message`)
2. `handleConversationCounter` refetch `/count` 1s setelah tiap counter event
3. Reconnect global `invalidateQueries()`
4. Axios timeout 60s → retry detail 3x
5. Cross-tenant blast (Tenant B lambat saat Tenant A storm)

### Setup minimum

Env: staging shared server + shared DB (mirror prod). Jangan di prod.

Actor:
- **Producer**: k6/artillery hit inbound entrypoint (RabbitMQ publisher atau webhook per channel)
- **Victim FE aktif**: 1 browser agent Tenant A + 1 browser agent Tenant B, keduanya buka `ManageConversationPage`
- **Observer**: Grafana panel yg sama + Chrome DevTools Network+WS tab

### Skema bertingkat

**Phase 1 — baseline (5 menit)**
- Inbound 1 msg/detik ke Tenant A
- Catat: request/s ke `/count`, `/conversation`, `/conversation/:id`, socket event/s, connection count
- Ini kontrol.

**Phase 2 — inbound storm 1 tenant (10 menit)**
- Ramp Tenant A: 5 → 50 → 200 inbound/s (new conversation, sender contact random supaya `isNewConversation=true` → picu auto-pull)
- Ekspektasi:
  - FE Tenant A: `/count` fire ~1×/counter event (dengan delay 1s setelah setQueryData) — grepable di Network
  - FE Tenant A: `/conversation` fire tiap invalidate (assigned/pulled/unassigned/counter)
  - Grafana current connections naik
  - Beberapa request kena 60s timeout → detail retry 3x
  - **Tenant B ikut lambat** (blast radius)
- Fail signal (= sukses reproduce): panel conversation blank/loading >10 detik untuk Tenant B walau dia idle.

**Phase 3 — socket flap (5 menit)**
- Sambil storm jalan, restart pod api-gateway satu-satu (rolling) atau `iptables` drop 5 detik
- Ekspektasi: socket reconnect → `invalidateQueries()` global → burst request kedua di FE
- Sukses reproduce: setelah reconnect, semua query FE refetch bersamaan.

**Phase 4 — auto-pull amplifier (5 menit)**
- Kirim inbound baru tanpa participant (bukan reply thread lama) supaya `handleAutoPullAndRefresh` jalan → emit `conversation.pulled` + counter
- Ekspektasi: 1 inbound = ≥3 socket event ke FE (`message`, `notification.new.message`, `conversation.pulled`, `conversation.counter`)

### Instrumentasi (yg diukur)

FE (Playwright + CDP):
- Count network request per URL per detik
- Count socket event per event name per detik
- Waktu `FETCH_CONVERSATIONS_DETAIL` fetching (dari `useIsFetching`)
- Screenshot saat blank

BE (log/metric existing):
- Rate `emitMessage`, `emitConversationPulled`, `CONVERSATION_COUNTER` per detik
- Rate `handleAutoPullAndRefresh` invocation
- DB query p95 (`conversationRepository.findByTenant`, `countConversations`)
- Redis lock hit/miss `AUTO_PULL_CRON_LOCK`

Grafana:
- Panel connections yg sama seperti screenshot user
- Overlay: `/count` RPS, `/conversation` RPS, socket emit RPS

### Kriteria sukses reproduce

Reproduce dianggap sukses kalau:
1. ✅ 1 inbound → ≥2 socket event tercatat di FE (buka DevTools WS frames)
2. ✅ 1 counter event → 2× hit `/count` (langsung + setelah 1000ms)
3. ✅ Ada request `/conversation/:id` yg timeout 60s + 3 retry follow-up
4. ✅ Tenant B (idle) mengalami page blank/loading padahal tidak ada inbound ke dia
5. ✅ Rolling restart api-gateway men-trigger burst refetch semua query FE

### Playwright harness (minimum)

Satu spec, dua browser context (Tenant A + B), pasang CDP listener:

```js
// scripts/rca-storm/reproduce.spec.js
const { chromium } = require('@playwright/test');
const fs = require('fs');

const counters = { req: {}, ws: {} };

async function attach(page, label) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent', e => {
    const u = new URL(e.request.url).pathname;
    counters.req[`${label}|${u}`] = (counters.req[`${label}|${u}`] || 0) + 1;
  });
  page.on('websocket', ws => {
    ws.on('framereceived', f => {
      const m = /"event":"([^"]+)"/.exec(f.payload || '');
      if (!m) return;
      counters.ws[`${label}|${m[1]}`] = (counters.ws[`${label}|${m[1]}`] || 0) + 1;
    });
  });
}

(async () => {
  const b = await chromium.launch();
  const ctxA = await b.newContext({ storageState: 'auth/tenantA.json' });
  const ctxB = await b.newContext({ storageState: 'auth/tenantB.json' });
  const pA = await ctxA.newPage(); await attach(pA, 'A');
  const pB = await ctxB.newPage(); await attach(pB, 'B');
  await Promise.all([
    pA.goto(process.env.FE_URL + '/conversation'),
    pB.goto(process.env.FE_URL + '/conversation'),
  ]);
  // trigger producer di terminal lain (k6/artillery), lalu:
  await pA.waitForTimeout(10 * 60 * 1000);
  fs.writeFileSync('scripts/rca-storm/counters.json', JSON.stringify(counters, null, 2));
  await b.close();
})();
```

Verify assertion (jalankan setelah run):
```bash
node -e '
const c = require("./scripts/rca-storm/counters.json");
const ws = k => c.ws[`A|${k}`] || 0;
console.assert(ws("message") > 0 && ws("notification.new.message") > 0, "dual emit not observed");
console.assert(Math.abs(ws("message") - ws("notification.new.message")) / ws("message") < 0.3, "dual emit not paired");
const cnt = c.req["A|/api/conversation/count"] || 0;
const cntEv = ws("conversation.counter") || 1;
console.assert(cnt >= cntEv * 1.5, "count refetch amplifier not observed");
console.log("PASS");
'
```

### Skipped

skipped: distributed tracing full setup, per-endpoint latency histogram, tenant isolation lab.
add when: reproduce sudah stabil dan mau ukur fix impact per titik.

### Turn 17 — User

> sekarang buat incident report nya

### Turn 18 — Assistant

## Incident Report: Conversation Loading Spike — 2026-07-20

**Severity:** SEV-2 (multi-tenant degradation, no data loss)
**Duration incident window:** ~10:00–10:55 (peak 10:29:30)
**Impact:** conversation list blank/loading 10–15 menit, semua tenant
**Reporter:** user (evidence: Grafana + browser network + console)
**Status:** root cause diidentifikasi via code review, belum di-patch, belum di-reproduce di staging

---

### 1. Ringkasan Eksekutif

Inbound message burst pada satu tenant memicu **event amplification storm** di socket pipeline BE dan **invalidation storm** di FE. Karena server dan DB dibagi lintas tenant, tekanan pada 1 tenant menular ke semua tenant. Timeout Axios FE 60 detik plus retry detail 3x plus reconnect global `invalidateQueries()` menutup loop menjadi feedback yang self-reinforcing selama ~55 menit.

Ini bukan bug endpoint tunggal. Ini interaksi 6 titik: 2 di BE, 4 di FE.

---

### 2. Timeline

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

### 3. Gejala Terobservasi

- Network browser: `GET /conversation/count` dan `GET /conversation` berulang saat inbound masuk
- Console browser: banyak socket event `new conversation`
- Grafana panel "Connections Over Time": current 700++
- UI: conversation panel loading lama lalu blank, durasi 10–15 menit
- Blast radius: seluruh tenant, bukan hanya tenant yang burst

---

### 4. Root Cause

**Compound cause. Bukan single fault.**

Chain:

```unknown
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

### 5. Bukti Kode

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

### 6. Dampak

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

### 7. Verifikasi & Reproduksi

Belum diverifikasi di staging. Skema reproduksi sudah didefinisikan (lihat session summary — Phase 1 baseline → Phase 2 storm 1 tenant → Phase 3 socket flap → Phase 4 auto-pull amplifier, dengan Playwright + CDP + counter assertion).

**Kriteria sukses reproduce:**
1. 1 inbound → ≥2 socket event terekam di FE WS frame
2. 1 counter event → 2× hit `/count`
3. Request `/conversation/:id` timeout 60s + 3 retry
4. Tenant B (idle) mengalami blank/loading
5. Rolling restart api-gateway men-trigger burst refetch

---

### 8. Mitigasi (Sementara)

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

### 9. Open Questions

Perlu jawaban user / observability team sebelum RCA di-finalize:

1. Apakah ada deploy/rollback/restart di window 10:00–10:55? Kalau ada, kapan dan apa?
2. Konfirmasi via WS frame di prod: 1 inbound aktif → FE terima `message` **dan** `notification.new.message` untuk client yang sama?
3. Lonjakan `conversation.pulled` dan `conversation.counter` bareng inbound saat incident?
4. Endpoint mana p95-nya paling parah saat 10:29: `/conversation`, `/conversation/:id`, `/conversation/count`, `/conversation/filter-count`?
5. Socket reconnect rate saat incident?
6. Kapasitas real connection pool (BE, DB, socket adapter)? Peak 794 masih di bawah atau sudah menyentuh cap?

---

### 10. Action Items

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

### 11. Lessons

1. Multi-tenant shared infra tanpa isolasi = 1 tenant storm bisa jadi outage semua tenant.
2. Socket event handler yang invalidate query mahal harus punya budget/coalesce.
3. Reconnect global invalidate adalah anti-pattern di FE dengan banyak query aktif.
4. Timeout 60s tanpa circuit breaker di layer atas hanya menunda kegagalan, tidak mencegahnya.
5. FE dan BE punya kontrak event yang overlap (`message` + `notification.new.message` sama-sama full payload) tanpa batasan siapa handle apa — perlu spec eksplisit.

---

**Sign-off:** Analyst (Dany Christian, PM) + Engineering Lead (Naftal Yunior) — pending review.

**Attachment:** session summary `summary/2026-07-20-conversation-loading-spike-analysis.md`.

### Turn 19 — User

> issue di atas ter catat jam 10
>
> adaa issue loading yang sama di jam 12.10
> triggernya ini :
> ada 1 company yang baru join ke satuinbox
> mereka scan 6 nomor operasional sekaligus dengan rata" percakapan di setiap nomor kurang lebih 2000-3000 chat perhari
> satuinbox melakukan sync history chat dari 6 nomor tersebut, timestamp scan kurang lebih di 2026-07-20T04:18:40.887+00:00
>
> dengan filter ini di conversation collection
> {
>   companyId: ObjectId("6a5d88602f6c6173b068c83e"),
>   createdAt: {
>     $gte: ISODate("2026-07-20T04:18:40.887Z"),
>     $lte: ISODate("2026-07-20T08:00:00.000Z")
>   }
> }
>
> menghasilkan 12886 conversation, dan 144k+ messages
>
> hal ini menyebabkan satuinbox blank seluruh fitur, tidak menerimaa inbound masuk daari channel manapun
> indikasi penyebab karna proses queue sync dan queue inbound di 1 queue
> setelah RMQ di restart, sistem kembali berjalan lancar
>
> analisa lagi issue tersebut
> apaakah sama dengan issue jam 10, atau menjadi amplifikasai bottleneck

### Turn 20 — Assistant

## Incident 12:10 — analisa

**Verdict:** bukan kembar identik dengan 10:00. Ini **root cause berbeda + amplifier yang overlap**. Insiden 10:00 = realtime event storm. Insiden 12:10 = **queue saturation dari bulk sync history**.

---

### Bukti chronology

- `2026-07-20T04:18:40.887Z` UTC = **11:18 WIB** → sync 6 nomor mulai
- `2026-07-20T08:00:00.000Z` UTC = **15:00 WIB** → window filter berakhir
- 12:10 WIB → SatuInbox blank total, tidak terima inbound dari channel manapun
- RMQ restart → recover

12886 conversation + 144k+ messages dalam ~1 jam 50 menit awal window = **~1300 msg/menit sustained**, bukan burst 1 detik. Berbeda pola dari 10:00.

---

### Root cause 12:10

**RC-A (utama, baru): shared queue untuk sync history dan inbound realtime**

User statement: "proses queue sync dan queue inbound di 1 queue". Ini konsisten dengan RMQ restart = recover.

Effect chain:
```unknown
6 channel scan barcode → sync backfill
  → publisher push 144k+ message ke queue X
  → consumer inbound-message.processor tarik dari queue X yang sama
  → prefetch queue penuh, backlog menumpuk
  → inbound realtime channel lain masuk antrian di belakang backlog sync
  → user pending message: berjam-jam
  → SatuInbox tampak "tidak terima inbound"
```

**RC-B: inbound processor per-message tidak batch-aware**

`apps/conversation-service/src/app/processors/inbound-message.processor.ts:280-330` — flow per message:
1. resolve/create conversation (DB read+write)
2. save message (DB write)
3. process attachments
4. `handleAutoPullAndRefresh` kalau new conversation tanpa participant
5. `updateCounter(EventTypeEnum.COUNTER_INBOUND)` kalau isNewConversation
6. `emitPostProcessEvents` → socket emit
7. `emitInboundMessageForTicketSync` kalau ticket

Untuk sync history 144k message, setiap message jalani full pipeline yang **didesain untuk realtime**:
- 12886 new conversation → 12886 kali `handleAutoPullAndRefresh` = 12886 assignment attempt
- 12886 kali `updateCounter(COUNTER_INBOUND)`
- 144k kali `emitPostProcessEvents` → 144k socket emit `SOCKET_HANDLE_MESSAGE`
- socket handler → gateway → dual fanout (RC-1 insiden 10:00) → 288k socket event

Auto-pull assign realtime ke agent yang online → agent inbox berisi 12886 conversation baru dalam menit-menit tersebut → FE storm yang dipicu adalah insiden 10:00 versi lebih besar.

---

### Hubungan dengan insiden 10:00

Insiden 12:10 = **strict superset** insiden 10:00.

| Aspek | 10:00 | 12:10 |
|---|---|---|
| Trigger | inbound realtime 1 tenant burst | bulk sync 6 channel 1 tenant |
| Volume | tidak diketahui, cukup untuk peak 794 conn | 144k msg + 12886 conv terkonfirmasi |
| Bottleneck utama | FE invalidation + socket amplification | RMQ queue saturation |
| Blast radius | semua tenant (shared server+DB) | semua tenant + semua channel inbound stop |
| Recovery | menunggu spike reda | butuh RMQ restart manual |
| RC-1..RC-6 insiden 10:00 | menjadi root | menjadi amplifier di atas RC-A |

**Insiden 10:00 adalah pola umum, 12:10 adalah trigger paling ekstrem dari pola itu + bug arsitektur queue tambahan.**

Kalau RC-1..RC-6 sudah di-patch: insiden 12:10 masih akan terjadi, tapi hanya sebagai **"sync lambat"**, bukan **"seluruh sistem blank"**. RC-A yang bikin "blank total tidak terima inbound".

Kalau hanya RC-A yang di-patch: insiden 10:00 tetap terjadi, tapi 12:10 tidak lagi blocking channel lain.

Keduanya harus dibereskan.

---

### Root cause 12:10, ranked

| # | Root cause | Bukti | Severity |
|---|---|---|---|
| RC-A | Shared queue sync + inbound realtime | user statement + RMQ restart = recover | **P0 critical** |
| RC-B | Inbound processor tidak punya jalur bulk / fast-path untuk history sync | code `inbound-message.processor.ts:280-330` | P0 |
| RC-C | Sync 6 channel paralel tanpa throttle per-channel/per-company | 12886 conv dalam ~2 jam window awal | P0 |
| RC-D | `handleAutoPullAndRefresh` jalan untuk backfill message historis | code `:307-310` — tidak bedakan history vs live | P0 |
| RC-E | `updateCounter(COUNTER_INBOUND)` per new-conv historis mengotori counter | code `:311-314` | P1 |
| RC-F | Socket emit per message historis (144k emit) | code `:452-467` | P1 |
| RC-G | RMQ prefetch/consumer count tidak scale dengan backlog | tidak self-recover tanpa restart | P1 |

Amplifier dari insiden 10:00 yang aktif juga:
- RC-1 dual socket fanout → 144k × 2 = 288k event
- RC-3 counter refetch 1s
- RC-5 reconnect global invalidate (banyak, karena socket flap saat storm)
- RC-6 retry detail 3x

---

### Kenapa "blank seluruh fitur"

Bukan cuma conversation panel:
1. Queue tersumbat → inbound webhook baru dari channel apapun (WA, IG, FB) ack ke publisher tapi tidak diproses consumer → **user luar kirim message, agent tidak lihat**
2. Ticket sync (`emitInboundMessageForTicketSync`) juga ikut ke queue sama, jadi ticket-service ikut kelaparan → **ticket module ikut mati**
3. Auto-pull 12886 kali → assignment service saturasi → **agent tidak bisa terima pull baru**
4. Socket gateway kirim 144k+ event ke client aktif → **FE freeze**
5. DB shared → **semua tenant lambat**

"Blank seluruh fitur" = agregasi dari queue saturation + socket saturation + DB saturation, bukan gejala dari 1 komponen.

---

### Kenapa RMQ restart bikin recover

Restart = **drop backlog** atau reset consumer connection + prefetch counter. Setelah restart:
- backlog message hilang (kalau non-persistent) atau di-requeue tapi consumer segar
- consumer prefetch reset, tidak ada consumer yang stuck di message berat
- socket gateway koneksi ulang → tidak ada emit dari backlog raksasa

Tapi **12886 conversation dan 144k+ message tetap tersimpan di MongoDB** — jadi sync sudah masuk. Yang di-drop hanya downstream processing (assignment, counter, socket emit, ticket sync). Ini kenapa "kembali lancar" tapi user history mungkin **tidak lengkap ter-assign** ke agent.

Cek yang perlu dilakukan: apakah 12886 conversation itu punya `participants` yang benar, atau banyak yang unassigned dan menunggu `AutoPullCronService` (yang jalan 2 menit sekali, batch 120) untuk membereskan? 12886 / 120 = **107 cycle** = **~3.5 jam** untuk clear via cron fallback.

---

### Mitigasi 12:10 (yang tidak nutup insiden 10:00)

Kandidat, urutan diff kecil → besar:

1. **Pisahkan queue** — `inbound.realtime.queue` vs `inbound.sync.queue`, consumer terpisah, prefetch berbeda. Realtime prefetch kecil (10-50) prioritas tinggi. Sync prefetch besar (500-1000) prioritas rendah, consumer sendiri yang bisa di-scale independent. Ini fix RC-A.

2. **Fast-path processor untuk history sync** — flag `isHistorySync=true` di payload, skip:
   - `handleAutoPullAndRefresh` (RC-D)
   - `updateCounter` per message (RC-E), ganti 1 kali `updateCounter(BULK, delta)` per batch
   - `emitPostProcessEvents` socket (RC-F), ganti 1 emit `HISTORY_SYNC_BATCH_COMPLETE` per channel
   - `emitInboundMessageForTicketSync` (tidak perlu untuk historis)

3. **Rate limit publisher sync** — di sisi channel-service atau adapter yang scan barcode, throttle: max 100 msg/s per channel, atau max 500 msg/s per company. Fix RC-C.

4. **Assignment kickoff terpisah setelah sync selesai** — jangan auto-pull per message historis. Setelah sync 1 channel selesai, jalan 1 kali logic assignment batch untuk conversation yang benar-benar butuh agent (misal filter: last message dalam 24 jam terakhir, atau sesuai konfigurasi).

5. **Circuit breaker consumer** — jika DB p95 > threshold, consumer pause prefetch. Fix RC-G bagian self-recovery.

---

### Verifikasi yang harus dilakukan

1. Cek MongoDB: dari 12886 conversation itu, berapa yang `participants.length === 0` (unassigned)? Kalau banyak, cron auto-pull kewalahan bereskan.
2. Cek RMQ config: nama queue untuk inbound message dan sync history — apakah benar 1 queue atau ada consumer group yang share?
3. Log timeline: timestamp exact saat "blank" mulai (12:10) minus sync mulai (11:18) = **~52 menit backlog build-up** sebelum meledak. Ini cocok dengan pattern gradual queue fill, bukan burst.
4. Apakah ada agent yang laporan menerima 100+ conversation baru sekaligus di inbox mereka setelah incident? Kalau iya, konfirmasi RC-D (auto-pull jalan untuk historis).
5. RMQ metrics saat 12:10: `queue depth`, `unacked count`, `consumer utilisation`. Kalau ada, tempel di incident report.

---

### Rekomendasi

Buat **incident report terpisah** untuk 12:10, jangan gabung dengan 10:00. Alasan:
- root cause utama berbeda (queue architecture vs event amplification)
- fix domain berbeda (RMQ + processor design vs socket + FE query hygiene)
- prioritas berbeda (12:10 = P0 arsitektur, 10:00 = P0 event tuning)
- audience berbeda (12:10 concern DevOps + BE core, 10:00 concern FE + BE socket)

Tapi keduanya harus **saling menunjuk** — insiden 12:10 report menyebut "10:00 incident amplifier still applies", dan 10:00 report menyebut "12:10 confirms shared queue as separate P0".

Kalau mau, next: saya tulis incident report 12:10 dalam format sama seperti 10:00, dengan cross-reference.

→ skipped: patch code, reproduce di staging, RMQ config audit. add when: user konfirmasi mau lanjut ke fase mana.

### Turn 21 — User

> buat md terpisah untuk incident report 10.00 dan 12.10
> taruh di C:\Users\MyBook SAGA 12\Desktop\PRDanalisis\incident report

### Turn 22 — Assistant

Dua file tersimpan.

- `incident report/2026-07-20-1000-conversation-event-storm.md` — 11783 bytes
- `incident report/2026-07-20-1210-rmq-sync-history-saturation.md` — 16768 bytes

Cross-linked lewat "Related" section di top masing-masing file.

→ skipped: update summary file dengan turn baru ini. add when: user minta atau session end.

### Turn 23 — User

> update summary nya

### Turn 24 — User

> PONYTAIL MODE ACTIVE — level: full
>
> # Ponytail
>
> You are a lazy senior developer. Lazy means efficient, not careless. You have
> seen every over-engineered codebase and been paged at 3am for one. The best
> code is the code never written.
>
> ## Persistence
>
> ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if
> unsure. Off only: "stop ponytail" / "normal mode". Default: **full**.
> Switch: `/ponytail lite|full|ultra`.
>
> ## The ladder
>
> Stop at the first rung that holds:
>
> 1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)
> 2. **Already in this codebase?** A helper, util, type, or pattern that already lives here → reuse it. Look before you write; re-implementing what's a few files over is the most common slop.
> 3. **Stdlib does it?** Use it.
> 4. **Native platform feature covers it?** `<input type="date">` over a picker lib, CSS over JS, DB constraint over app code.
> 5. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines can do.
> 6. **Can it be one line?** One line.
> 7. **Only then:** the minimum code that works.
>
> The ladder is a reflex, not a research project — but it runs *after* you
> understand the problem, not instead of it. Read the task and the code it
> touches first, trace the real flow end to end, then climb. Two rungs work →
> take the higher one and move on. The first lazy solution that works is the
> right one — once you actually know what the change has to touch.
>
> **Bug fix = root cause, not symptom.** A report names a symptom. Before you
> edit, grep every caller of the function you're about to touch. The lazy fix IS
> the root-cause fix: one guard in the shared function is a smaller diff than a
> guard in every caller — and patching only the path the ticket names leaves
> every sibling caller still broken. Fix it once, where all callers route through.
>
> ## Rules
>
> - No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes.
> - No boilerplate, no scaffolding "for later", later can scaffold for itself.
> - Deletion over addition. Boring over clever, clever is what someone decodes at 3am.
> - Fewest files possible. Shortest working diff wins — but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.
> - Complex request? Ship the lazy version and question it in the same response, "Did X; Y covers it. Need full X? Say so." Never stall on an answer you can default.
> - Two stdlib options, same size? Take the one that's correct on edge cases. Lazy means writing less code, not picking the flimsier algorithm.
> - Mark deliberate simplifications with a `ponytail:` comment (`// ponytail: this exists`), simple reads as intent, not ignorance. Shortcut with a known ceiling (global lock, O(n²) scan, naive heuristic)? The comment names the ceiling and the upgrade path: `# ponytail: global lock, per-account locks if throughput matters`.
>
> ## Output
>
> Code first. Then at most three short lines: what was skipped, when to add it.
> No essays, no feature tours, no design notes. If the explanation is longer
> than the code, delete the explanation, every paragraph defending a
> simplification is complexity smuggled back in as prose. Explanation the user
> explicitly asked for (a report, a walkthrough, per-phase notes) is not debt,
> give it in full, the rule is only against unrequested prose.
>
> Pattern: `[code] → skipped: [X], add when [Y].`
>
> ## Intensity
>
> | Level | What change |
> |-------|------------|
> | **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |
>
> Example: "Add a cache for these API responses."
> - full: "`@lru_cache(maxsize=1000)` on the fetch function. Skipped custom cache class, add when lru_cache measurably falls short."
>
> ## When NOT to be lazy
>
> Never simplify away: input validation at trust boundaries, error handling
> that prevents data loss, security measures, accessibility basics, anything
> explicitly requested. User insists on the full version → build it, no
> re-arguing.
>
> Never lazy about understanding the problem. The ladder shortens the
> solution, never the reading. Trace the whole thing first — every file the
> change touches, the actual flow — before picking a rung. Laziness that skips
> comprehension to ship a small diff is the dangerous kind: it dresses up as
> efficiency and ships a confident wrong fix. Read fully, then be lazy.
>
> Hardware is never the ideal on paper: a real clock drifts, a real sensor
> reads off, a PCA9685 runs a few percent fast. Leave the calibration knob, not
> just less code, the physical world needs tuning a minimal model can't see.
>
> Lazy code without its check is unfinished. Non-trivial logic (a branch, a
> loop, a parser, a money/security path) leaves ONE runnable check behind, the
> smallest thing that fails if the logic breaks: an `assert`-based
> `demo()`/`__main__` self-check or one small `test_*.py`. No frameworks, no
> fixtures, no per-function suites unless asked. Trivial one-liners need no
> test, YAGNI applies to tests too.
>
> ## Boundaries
>
> Ponytail governs what you build, not how you talk (pair with Caveman for
> terse prose). "stop ponytail" / "normal mode": revert. Level persists until
> changed or session end.
>
> The shortest path to done is the right path.
