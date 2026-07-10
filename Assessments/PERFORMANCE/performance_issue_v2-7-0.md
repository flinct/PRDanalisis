perfromance issue 2.7.0

hasil log

storm-20260708-145153
storm.log: 14,597 lines, 1.5 MB
probe:
/conversation: ok=133 errors=45 (502=43, TIMEOUT=2)
avg 1966ms, p95 10651ms, max 30015ms
/conversation/count: ok=134 errors=44
pattern akhir:
banyak ping timeout
banyak reconnect-abort after ~62s–90s
banyak failed to prepare ... Login failed: HTTP 0 TIMEOUT/ECONNRESET/ENOBUFS/UND_ERR_SOCKET
ada 401 Unauthorized pada beberapa akun
storm-20260708-160301
storm.log: 16,576 lines, 1.7 MB
probe:
/conversation: ok=114 errors=51 (502=47, TIMEOUT=4)
avg 2411ms, p95 12468ms, max 30014ms
/conversation/count: ok=116 errors=49
pattern akhir:
reconnect-abort lebih seragam di ~63s–67s
login failure masih banyak
kualitas endpoint lebih buruk dari run 145153
Kesimpulan perbandingan
Run 160301 lebih jelek dari 145153:

error probe naik
avg latency naik
p95 naik
line log juga naik
reconnect storm tetap besar
login prepare tetap jadi bottleneck besar
Jadi bukan issue flood publisher dulu. Yang kelihatan dominan:

prepare/login path jebol di bawah load
conversation hotpath jebol (502, TIMEOUT)
socket session ikut collapse (ping timeout)
harness masih terlalu banyak mempertahankan subscriber yang sudah jelas unhealthy
Yang harus di-improve dari sisi development

1. Jangan terus build subscriber baru saat sistem sudah jelas meltdown
   Sekarang script tetap lanjut prepare banyak subscriber walau sinyal sistem sudah merah:

login timeout massal
ping timeout massal
probe 502/TIMEOUT naik
Itu bikin:

load tambahan ke auth/API/socket
log makin besar
hasil RCA makin noisy
Perlu:

circuit breaker ringan di harness
contoh rule:
kalau N login failure beruntun
atau probe error rate > X%
stop tambah subscriber baru
lanjut observasi subscriber yang sudah hidup
Ini paling worth it. Kode sedikit. Efek besar.

2. Prepare path perlu backoff kecil, bukan hammer terus
   Sekarang serial, tapi tetap hammer karena subscriber count besar sekali (1229 earlier, sekarang juga massal). Kalau login path sudah timeout, next login langsung dicoba lagi.

Perlu:

backoff kecil setelah failure burst
mis. sleep 1–3s tiap 5 failure beruntun
Bukan untuk “fix prod”. Untuk bikin harness lebih jujur: saat auth lane jebol, jangan tambah tekanan buta.

3. Reconnect-abort sudah membantu, tapi masih telat
   Sekarang STORM_FAIL_AFTER_60=true bagus, tapi log nunjukin banyak subscriber tetap hidup terlalu lama untuk kondisi full meltdown.

Perlu:

rule lebih tajam untuk prepare-stage vs steady-state
subscriber yang belum pernah recover dan langsung masuk ping timeout/connect_error berulang saat warmup bisa dipotong lebih cepat daripada 60s
Lazy fix:

keep 60s global
tambah fail-fast khusus prepare-before-ready jika socket tidak stabil setelah warmup window 4. Summary/harness perlu agregasi failure, bukan spam per user
Sekarang masih banyak line:

failed to prepare X#n: Login failed: HTTP 0 TIMEOUT
reconnect-abort ...
Perlu agregasi periodik:

Code
· text
[storm] prepare failures so far: TIMEOUT=120 ECONNRESET=8 ENOBUFS=3 401=4
[storm] reconnect aborts so far: ping timeout=87 transport close=12
Bukan hapus line individual total, tapi:

default cukup agregat
detail individual hanya sample / tail-N 5. 401 Unauthorized harus dipisah dari infra error
Ini bukan load symptom yang sama. 401 artinya:

credential invalid/stale
account disabled
auth contract beda
Harness sekarang campur 401 dengan TIMEOUT/ECONNRESET. Perlu:

pre-validate credentials list sekali sebelum storm
drop akun yang memang invalid
jangan buang slot storm untuk akun rusak
Ini dev improvement paling gampang dan paling bersih.

6. ENOBUFS / UND_ERR_SOCKET tanda host-side exhaustion
   Ini penting. Bukan cuma backend. Artinya local/client side juga bisa kehabisan resource:

socket buffer
ephemeral ports / FD pressure
undici socket churn
Perlu improvement harness:

batasi login churn saat host mulai ENOBUFS
treat ENOBUFS as host saturation signal
stop scale-up, bukan lanjut terus 7. FE hotpath problem nyata ada di /conversation dan /conversation/count
Probe dua run konsisten nunjuk ini endpoint paling kena:

502
TIMEOUT
p95 10–12s
max 30s
Dari sisi development FE/BE:

jangan biarkan reflex memicu full list/count terlalu sering untuk semua event
butuh dedupe/coalesce invalidation
satu subscriber sekarang bisa melempar banyak request hotpath saat event datang rapat
Ini akar terbesar product-side.

Apa yang perlu dicek di FE
Repo FE layak dicek di area:

invalidation/refetch untuk inbox conversation
socket event handler
React Query invalidation fanout
apakah notification.new.message memicu:
refetch list
refetch count
refetch filter-count
unread counts
tags/member/status
mungkin berulang untuk event yang sama
Yang dicari:

duplicate invalidation
no debounce / no coalescing
no “already fetching” guard
count/list dipanggil paralel terlalu sering
Kalau itu ada, beban di storm ini memang self-inflicted dari FE pattern.

Apa yang perlu dicek di BE
BE layak dicek di path:

auth/login endpoint
/conversation
/conversation/count
socket namespace stability / ping timeout cause
upstream gateway/nginx/cf 502 source
Yang dicari:

query mahal di list/count
lock/contention saat banyak session baru login
join/count path tidak pakai cache / summary table
socket ping timeout karena event loop / worker pressure
Prioritas improvement
Urutan paling masuk akal:

Harness circuit breaker saat prepare meltdown
Prefilter akun invalid (401) sebelum storm
Aggregate failure logs
Treat ENOBUFS as stop-scale signal
FE: coalesce invalidation/refetch conversation hotpath
BE: audit /conversation + /conversation/count under login storm
Inti diagnosis
Dua log ini bilang:

harness bukan cuma “terlalu banyak log”
dev issue utamanya load amplification
amplification datang dari:
prepare/login massal
FE hotpath refetch fanout
reconnect storm
no early-stop saat system already red

Temuan paling besar

1. Reconnect handler invalidasi semua query
   File: apps/omnichannel/hooks/conversation/socket/use-on-socket-reconnect.ts

Ada ini:

Code
· ts
if (currentQueue.length === 0) {
queryClient.invalidateQueries()
}
Ini paling bahaya.

Effect:

sekali socket reconnect
semua query React Query invalid
semua page/widget hook aktif bisa refetch
saat ratusan subscriber kena reconnect bareng, FE bikin self-DDOS
Ini bukan “mungkin”. Ini root-cause kelas A.

Fix yang harus dilakukan
Ganti global invalidate jadi targeted invalidate saja.

Minimal:

conversations list
conversation counts
filter counts
unread counts kalau memang perlu
active conversation detail kalau ada
Jangan:

Code
· ts
queryClient.invalidateQueries()
Harus jadi scoped keys.

2. notification.new.message invalidasi terlalu lebar
   File: apps/omnichannel/hooks/conversation/socket/use-conversation-socket-event.ts

Ada helper:

Code
· ts
const invalidateConversationQueries = useCallback(() => {
queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY.CONVERSATIONS] })
queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY.COUNT_CONVERSATIONS] })
queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY.FETCH_CONVERSATION_COUNTS] })
queryClient.invalidateQueries({
queryKey: [CONVERSATION_QUERY_KEY.FETCH_CONVERSATION_FILTER_COUNTS],
})
queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY.CONVERSATION_LIMIT] })
}, [queryClient])
Masalah:

satu event message bisa trigger 5 invalidation bucket
tiap bucket bisa punya banyak cached variants
kalau event rate tinggi, FE terus refetch endpoint panas:
/conversation
/conversation/count
/conversation/filter-count
dst
Ini cocok dengan symptom di probe:

/conversation
/conversation/count
error 502/TIMEOUT
p95 10–12s
Fix yang harus dilakukan
Jangan invalidate semua bucket tiap event.

Urutan lazy:

update cache lokal dulu untuk active/known conversation
throttle/coalesce invalidation list/count
invalidate count/filter hanya jika event memang ubah angka global
Contoh policy:

active conversation open: patch cache, skip list refetch immediate
burst message masuk 20x/5s: list/count cukup refetch 1x per window
assigned/unassigned baru invalidate list utama bila current user terdampak 3. Notification socket juga invalidasi broad
File: apps/omnichannel/hooks/notification/socket/use-notification-socket-event.ts

Ada:

Code
· ts
queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY.FETCH_NOTIFICATIONS] })
queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY.FETCH_UNREAD_COUNT] })
Ini lebih kecil dari issue #1, tapi tetap amplifier. Kalau notification.new tinggi, notif list + unread count ikut panas terus.

Fix
Coalesce per window. Tidak perlu refetch notif list per event real-time. Unread count bisa increment local store dulu. List notif bisa stale 2–5 detik, tidak masalah.

4. Socket reconnect logika FE sekarang terlalu “panic refresh”
   Reconnect ideal:

rejoin room
resend pending local message
refetch minimum critical queries
Current:

Code
· ts
queryClient.invalidateQueries()
Itu model “nuke cache from orbit”. Murah ditulis, mahal di prod.

Fix
Reconnect flow harus dibagi:

rejoin active room
requeue pending message
targeted refresh:
active conversation messages
conversation list visible query
count query
jangan sentuh unrelated query tree 5. FE kemungkinan invalidate prefix yang terlalu luas
Pattern ini:

Code
· ts
queryClient.invalidateQueries({ queryKey: [CONVERSATION_QUERY_KEY.CONVERSATIONS] })
Kalau banyak variant query di-cache:

sort berbeda
filter berbeda
page berbeda
route berbeda
maka satu invalidate prefix bisa nyapu semua variant. Itu multiplier besar.

Fix
Jangan prefix terlalu umum kalau yang aktif cuma 1 variant UI. Scope ke exact visible query key.

Kalau exact key sulit:

simpan last active filter key
invalidate active key only
count/filter-count coalesce terpisah 6. FE terlalu mengandalkan invalidate, bukan setQueryData
Komentar file sendiri sudah ngaku:

email conversation issue
setQueryData dulu tidak cukup reliabel
lalu cenderung fallback ke invalidate
Ini pattern umum: cache patch susah, invalidate gampang. Tapi di storm, invalidate jadi pembunuh.

Fix
Pakai hybrid:

setQueryData untuk hot path yang deterministik
invalidate cuma sebagai backstop periodik/debounced
Contoh:

unread count local increment/decrement
active conversation message append
latest message preview update
count/list refetch dibatch 1x
Yang paling harus difix dulu
Urutan ROI tertinggi:

Fix 1 — wajib
use-on-socket-reconnect.ts

Code
· ts
queryClient.invalidateQueries()
hapus. Ganti targeted invalidate.

Fix 2 — wajib
Debounce/coalesce invalidateConversationQueries().

Contoh target:

max 1 invalidation per subscriber per 1–2 detik
kalau ada 50 event, tetap 1 refetch wave
Fix 3 — penting
Pisah local cache patch vs server refetch:

active convo patch local
global list/count batched
Fix 4 — penting
Notification invalidation juga throttle.

Arah fix konkret
Bukan tambah infra dulu. Dari sisi development FE:

stop global reconnect invalidation
stop per-event broad invalidation
refetch visible query only
coalesce burst events into one refresh window
keep setQueryData for active convo / unread local state
Kenapa ini cocok dengan dua log storm
Dua log bilang:

reconnect storm besar
/conversation + /count paling panas
502/TIMEOUT makin tinggi saat load
subscriber banyak bareng
Kalau FE setiap reconnect invalidate semua query, lalu setiap event invalidate list/count/filter-count lagi, backend pasti tenggelam.

Jadi masukan utamanya bukan “optimasi minor”. Masukan utamanya: kurangi permintaan yang FE ciptakan sendiri.

Poin 1 klarifikasi
Persepsi kamu sebagian benar tapi belum lengkap. Aku jelasin ulang biar sinkron.

Yang kamu pikir
Reconnect handler invalidate semua query supaya:

message terbaru muncul di atas
list chat + counter kembali sinkron
Yang code sekarang lakukan
File use-on-socket-reconnect.ts:

Code
· ts
if (currentQueue.length === 0) {
queryClient.invalidateQueries()
}
Itu tidak spesifik ke list chat + counter. Itu artinya:

semua query di React Query cache dianggap stale
semua page/section aktif akan refetch, bukan hanya inbox
termasuk:
notifications
tags
member
broadcast list
ticket list
screenshot lists
dashboard
dsb
Jadi bukan cuma “list chat + counter refresh”. Ini “refresh semua yang cache-nya aktif”.

Kenapa ini bahaya di storm
reconnect sering
tiap reconnect = full cache invalidation
tiap user = burst request ke banyak endpoint bareng
1000 user reconnect bareng = burst request massal
BE + gateway kena spike besar
Ini bukan bug fungsional. Message terbaru memang akan tampil. Tapi caranya over-broad.

Cara benar untuk tujuan yang kamu mau
Kalau tujuannya:

message terbaru muncul di atas
list chat refresh
counter refresh
Cukup refresh kunci yang relevan saja:

CONVERSATION_QUERY_KEY.CONVERSATIONS
CONVERSATION_QUERY_KEY.COUNT_CONVERSATIONS
CONVERSATION_QUERY_KEY.FETCH_CONVERSATION_COUNTS
CONVERSATION_QUERY_KEY.FETCH_CONVERSATION_FILTER_COUNTS
CONVERSATION_QUERY_KEY.CONVERSATION_LIMIT
optional: active conversation detail + messages jika current user sedang di room itu
Itu sudah cukup untuk:

inbox list update
counter update
current chat tetap sinkron
Yang tidak perlu:

refetch semua notification list
refetch semua ticket
refetch semua broadcast
refetch semua unrelated query
Impact bisnis fitur kamu
Tetap:

message terbaru masuk paling atas: ya
list chat refresh: ya
counter refresh: ya
Yang hilang:

refetch page/tab yang tidak sedang dilihat user
refetch fitur yang tidak related sama sekali dengan reconnect
Tidak ada impact fungsional negatif untuk fitur inbox. Yang berkurang: beban BE + client bandwidth.

Jadi ringkas
Persepsi kamu benar untuk niatnya. Tapi implementasinya sekarang jauh lebih luas dari niatnya. Fix: pindahkan invalidasi ke kumpulan key inbox saja, bukan invalidateQueries() tanpa argumen.

Poin 2 klarifikasi
Benar. 3 endpoint itu memang untuk list chat + counter:

/conversation
/conversation/count
/conversation/filter-count
Di code, itu dipetakan ke:

CONVERSATIONS
COUNT_CONVERSATIONS
FETCH_CONVERSATION_COUNTS
FETCH_CONVERSATION_FILTER_COUNTS
CONVERSATION_LIMIT
Yang benar
Ya, ini pasangan yang “memperbarui list chat dan counter”.

Yang salah paham potensial
Sekarang setiap notification.new.message memanggil invalidateConversationQueries() (5 key sekaligus), lalu setiap key bisa memicu refetch pada banyak variant cache (sort/filter/page). Jadi 1 event bisa memicu banyak refetch nyata di jaringan.

Related ke poin 1? Ya.

Poin 1 = full invalidate saat reconnect
Poin 2 = fanout invalidate saat event message masuk
Dua-duanya menciptakan tekanan ke set endpoint yang sama:

Code
/conversation, /conversation/count, /conversation/filter-count
Cara benar untuk tujuan poin 2
Tetap update list + counter, tapi:

coalesce burst event dalam 1 window kecil (mis. 500–1000ms)
1 refetch wave per window, bukan 1 refetch per event
kalau memungkinkan, update counter secara optimistic dari payload event, list refetch tetap tapi terbatas ratenya
gunakan setQueryData untuk kasus straightforward, invalidate hanya sebagai safety net
Impact bisnis
list chat + counter tetap update
delay perceived UI sangat kecil (500ms window tak terasa untuk user)
beban BE turun signifikan saat storm
Poin 4, 5, 6 detail
Poin 4 — Notification socket juga invalidasi broad
File: apps/omnichannel/hooks/notification/socket/use-notification-socket-event.ts

Code:

Code
· ts
socket.on('notification.new', handleNotificationNew)
// di dalam handler:
queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY.FETCH_NOTIFICATIONS] })
queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY.FETCH_UNREAD_COUNT] })
Apa yang terjadi

setiap event notification.new (bukan cuma message baru, banyak jenis: assigned, unassigned, ticket, sla, reminder, dsb)
FE selalu invalidate:
list notifikasi
unread count
kalau event notification rate tinggi (misal storm inbound bikin banyak ticket/assigned event), 2 endpoint ini panas terus
Kenapa ini masalah

notification bell tidak butuh accuracy real-time per event
unread count bisa di-increment lokal dari payload
list bisa refresh lazy: buka bell dropdown, baru refresh full
tidak perlu FE ping BE untuk full list tiap event notif
Fix approach

unread count: increment via store yang sudah ada incrementUnreadCountByGroup(group) (sudah ada)
list notifikasi: refetch hanya saat user buka panel notif atau setelah timer minimum
invalidate boleh ada, tapi via debounce/coalesce, bukan per event
pertahankan behavior: bell badge naik seketika saat event masuk (dari store), list detail lazy
Impact bisnis

badge tetap update instan
list notif tetap benar saat user buka panel
hilang: refetch list tiap event ketika user bahkan tidak membuka bell
Poin 5 — Invalidate prefix terlalu luas
Masalah di React Query

key seperti [CONVERSATION_QUERY_KEY.CONVERSATIONS] akan match semua query yang dimulai dengan prefix itu
di app, CONVERSATIONS biasanya di-cache dengan variant filter/sort/route, misalnya:
[CONVERSATIONS, { route: 'your-inbox', sort: 'timestamp:desc' }]
[CONVERSATIONS, { route: 'all', sort: 'isPinned:desc' }]
[CONVERSATIONS, { filter: { status: 'open' } }]
invalidate prefix = semua variant dianggap stale
setiap active hook variant akan refetch masing-masing ke BE
Kenapa amplify parah

1 user bisa punya banyak variant cached hasil navigasi
backend disuruh serve N request untuk sekali event
kalau user aktif di 1 view saja, N-1 variant lain sebenarnya tidak perlu segera fresh
Fix approach

gunakan queryClient.invalidateQueries({ queryKey, exact: true }) untuk key visible/active
atau simpan currentActiveQueryKey di store dan invalidate tepat itu
variant lain biarkan stale sampai user pindah ke view itu; React Query akan refetch otomatis saat mount ulang
alternatif: refetchType: 'active' (React Query v5) untuk membatasi hanya query yang currently mounted
Impact bisnis

view yang sedang dilihat user tetap fresh
view yang tidak dilihat: refresh saat dibuka
tidak ada perubahan visible ke user, backend turun drastis
Poin 6 — Terlalu mengandalkan invalidate, kurang setQueryData
Konteks

di file use-conversation-socket-event.ts sudah ada pattern hybrid untuk message dalam room aktif (Zustand + cache patch)
tapi untuk list/counter/notif, pola dominan tetap: invalidate lalu refetch
ini mahal karena refetch = round-trip BE + parse + rerender
Kapan lebih baik pakai setQueryData

payload event sudah membawa data yang cukup untuk update local cache tanpa refetch
misal notification.new.message biasanya bawa: conversationId, latestMessage, timestamp, unread delta
data itu cukup untuk update:
latestMessage preview di baris conversation
move conversation ke top
increment unread count
tanpa harus refetch list full
Kapan invalidate tetap perlu

payload event tidak lengkap (ada field yang harus dari BE)
setelah operasi bulk atau pull dari queue
setelah reconnect sebagai backstop (targeted)
Contoh policy untuk notification.new.message

update cache list secara optimistic: pindahkan conversation itu ke atas, patch latestMessage
increment counter cache di client
setelah N event terkumpul dalam window kecil, boleh invalidate 1x untuk safety net (drift correction)
tanpa itu, list tetap benar untuk kasus normal
Impact bisnis

list chat tetap re-order saat message baru masuk
counter tetap naik
refetch BE jauh berkurang
risiko drift kecil (di-cover safety net periodik)
Kesimpulan singkat
Poin 1: niat kamu benar. Implementasi sekarang jauh lebih luas dari niat. Cukup targeted invalidate.
Poin 2: fitur update list + counter tetap. Perlu coalesce burst dan optionally optimistic update.
Poin 4: notif broad invalidate = beban tak perlu. Store local + lazy panel refresh.
Poin 5: prefix invalidate menyapu semua variant cache. Fix ke exact key visible / active-only.
Poin 6: pindahkan hot path ke optimistic patch. Invalidate hanya jadi safety net terkoordinasi.
Semua fix ini tidak menghilangkan behavior fitur. Cuma menghilangkan traffic redundant yang FE ciptakan sendiri.

Open questions
Setuju kalau reconnect invalidate diganti jadi list inbox + counter targeted, tanpa sentuh tree query lain?
Untuk poin 2, mau ambil coalesce (misal 500ms) dulu, atau langsung optimistic update + safety net?
Untuk notif (poin 4), setuju kalau list notif refetch hanya saat user buka panel bell?
Untuk poin 5, aman kalau kita adopt refetchType: 'active' di React Query invalidations relevan?
Untuk poin 6, mau mulai dari kasus paling aman (unread counter local increment), lalu naik ke list re-order optimistic?
