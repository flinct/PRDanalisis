> **FLAG: NEEDS-VALIDATION / DISCOVERY**  \n> Temuan performance/flow/UX banyak berbasis inference. Gunakan untuk discovery/load-test, bukan keputusan rilis langsung. FS-05 sudah dikoreksi di register.

# SatuInbox — Assessment Report Extension (Draft)

| Item | Detail |
|---|---|
| **Tanggal** | 2026-09-02 |
| **Analyst** | Dany Christian |
| **Sifat** | **Draft temuan TAMBAHAN** — melengkapi `2026-09-01-satuinbox-system-audit.md`, BUKAN menulis ulang |
| **Sumbu baru** | Performance (P), Flow Sistem (FS), Flow Aplikasi (FA), UX (UX) |
| **Basis** | PRD V2 (source of truth) + `Memory/global-memory.md` + `Memory/CLAUDE-be.md` + `Memory/CLAUDE-fe.md` + `PRD/Broadcast/*` + UI/UX Audit Sabrina (Jun 2026) |
| **Metode** | Desk analysis PRD + canonical memory + arsitektur. TIDAK cross-check repo FE/BE (per scope). Item bertanda ⚠️ = inference/butuh verifikasi kode. |

> **Batas kepercayaan.** Sebagian temuan ini **inference** dari pola arsitektur yang didokumentasikan di memory (bukan pembacaan kode live). Label ⚠️ menandai yang butuh cross-check repo sebelum masuk keputusan rilis. Temuan yang sudah tercakup di audit 2026-09-01 (F-01…F-06, §1.4–1.6, §2, §3, §4) TIDAK diulang di sini.

---

## Ringkasan Eksekutif

Empat sumbu baru mengungkap satu tema struktural yang belum tersentuh audit lama: **arsitektur async + DB-per-service memberi ketahanan skalabilitas, tapi menciptakan jendela inkonsistensi (lag event → snapshot → socket) di jalur terpanas (chat list & SLA), dan broadcast 10k-recipient adalah sumber backpressure/event-storm terbesar yang belum teruji volume**.

Temuan paling kritikal di sumbu baru:

| ID | Temuan | Severity |
|---|---|---|
| FS-03 | SLA event ordering: metric bergantung timestamp event async lintas service, constraint `FRT = Wait + RLT` bisa pecah | 🔴 Major |
| P-03 | Broadcast 10k fan-out: wall-clock delivery jam~hari vs NFR handoff ≤1.5s; tanpa DLQ/backpressure terukur | 🔴 Major |
| FS-02 | Propagasi update list hanya lewat socket, tanpa fallback reconcile → list stale setelah reconnect | 🔴 Major |
| P-01 | Chat list = irisan 4 dimensi (Inbox × Channel × Team × RBAC), cost intersection tanpa index compound | 🔴 Major |
| FS-01 | Denormalized snapshot + socket = dua jalur asinkron, urutan tak dijamin → lag edit | 🔴 Major |

---

## 1 | PERFORMANCE

### P-01 — Chat list: irisan 4 dimensi tanpa bukti index compound 🔴 Major

`global-memory.md` §Chat List Rules + §Omnichannel Filtering Baseline menyatakan chat list = **irisan filter Inbox × Channel × Team × RBAC**, dan "role login menentukan visibility sejak awal, bukan hanya hasil filter". Setiap navigasi filter (Your Inbox, Unassigned, All, Channel, Team, Spam, Junk, Starred) memicu re-query dengan scope gabungan. Filter fields yang dikonfirmasi ada di document (`isJunked`, `spams[]`, `favorites[]`, `tags[]`, `isPinned`, `team`) adalah **array + boolean + reference** — kombinasi yang rawan collection scan tanpa compound index. ⚠️

**Efek:** pada tenant besar (ribuan conversation), setiap ganti filter = query lambat; agent bolak-balik filter = load berulang. `CLAUDE-be.md` mencatat conversation-service mendapat Mongo pool terbesar (max 20), mengindikasikan ini jalur termahal — tapi pool besar tidak menggantikan index.

**Rekomendasi:** (1) audit & tambah compound index pada kombinasi `companyId + <filter> + lastActivityAt`; (2) ukur p95 list-query per dimensi filter di staging dengan volume sintetis; (3) pertimbangkan materialized pre-filter cache per (role × team) di Redis (kunci: `cache:` sudah ada).

```
GET /conversations?inbox=your-inbox&channel=wa&team=t1
        │
        ▼
  API Gateway ──gRPC──▶ conversation-service
        │
        ▼
  Inbox ∩ Channel ∩ Team ∩ RBAC   (4 dimensi irisan)
     │        │         │      │
     ▼        ▼         ▼      ▼
 [scope user][channel][team][visibility]
     │
     ▼
  ⚠️ 1 query compound  vs  4 query lalu intersect di app?
     Tanpa index compound → collection scan per dimensi
```

### P-02 — Global search "cepat" masih gelap di produksi; jalur regex aktif 🔴 Major

`CLAUDE-be.md` §9: `GLOBAL_SEARCH_ATLAS_ENABLED` default **false**; `GLOBAL_SEARCH_CANDIDATE_CACHE_ENABLED` false; window default 3 bulan. Produksi (`prod-2.7.0.3`) memakai **jalur regex/substring** untuk global search, sementara FE v2.8.0 sudah ship UI per-domain search. Relevance ranking (exact → normalized → prefix → partial → date, dari `global-memory.md` §Ticket List Rules) tanpa index Atlas = regex scan atas 3 bulan data × 2 domain.

**Efek:** fitur search yang dijual "cepat" belum benar di produksi; p95 search bisa menurun drastis saat volume conversation/ticket tumbuh. Ini **utang produk**, bukan bug — harus diakui eksplisit ke stakeholder (paralel dengan temuan anti-spam 4.2 di audit lama).

**Rekomendasi:** (1) jadwalkan enablement Atlas Search per-environment + pastikan index Atlas terprovisioning; (2) jangan klaim "search cepat" sebelum flag di-flip; (3) ukur fallback regex path sebagai baseline degradasi.

```
Production global search path (today):
   query ──▶ gateway ──▶ search service
                           │
                           ├─(flag OFF) regex/substring 3-month scan ⚠️ slow
                           └─(flag ON)  Atlas Search ──▶ but index may not exist
```

### P-03 — Broadcast 10k recipients: fan-out + delivery wall-clock jam~hari 🔴 Major

`PRD Broadcast.md` NFR: handle 10.000+ recipients, send handoff ≤1.5s, status query ≤600ms, at-least-once, durable queues, 1.000+ campaigns/day. `PRD Broadcast.md` US-7: per-message delay typing (5–6 char/s) + random 3–8s, **batch pause 180–240s per 50**. Perhitungan kasar: 10.000 / 50 batch × ~4 menit pause ≈ **13+ jam wall-clock** hanya dari batch pause, belum per-message delay. Ini sah untuk anti-ban, tapi bertentangan dengan persepsi "handoff ≤1.5s" (handoff ≠ delivery selesai).

**Efek:** (1) campaign 10k berjalan berjam-jam → RabbitMQ durable queue menahan ribuan job; (2) fan-out 10k job ke `whatsapp-service` (Baileys, prefetch 10) tanpa DLQ/backpressure terukur = risiko event storm + saturasi worker; (3) tenant lain berbagi worker pool → noisy-neighbor. ⚠️

**Rekomendasi:** (1) definisikan dan enapkan per-tenant rate limit + DLQ (dead-letter) untuk job delivery; (2) tetapkan SLA delivery ETA yang jujur (jam, bukan detik) di UI; (3) pisahkan queue broadcast dari queue conversation agar campaign besar tidak mencekik chat inbound; (4) load test 10k recipients sebelum volume produksi.

```
Broadcast send (10k)
   │
   ▼
broadcast-service ──▶ RabbitMQ (tenant queue, durable)
   │  fan-out 10k recipient jobs
   ▼
whatsapp-service (Baileys)
   │  per-recipient: typing 5-6ch/s + 3-8s  +  batch pause 180-240s / 50
   ▼
10k × delay → wall-clock ≈ 13+ jam
   ⚠️ prefetch 10, worker pool shared, no DLQ → backpressure + noisy-neighbor
```

### P-04 — Socket event storm: mutasi room → fan-out ke semua agent 🔴 Major

`global-memory.md` §Room Rules: setiap mutasi list-state (Close, Hold/Resume, Pin, Star, Tag, Spam, assignment) **wajib update Chat List via socket**. `CLAUDE-be.md`: WebSocket hanya di gateway (`:3002`), 4 emitter (conversation, ticket, channel, notification). FE: socket client singleton, 5 reconnect attempts.

**Efek:** room mutasi = 1 event → broadcast ke **semua agent yang subscribe list tenant tsb** (N agent). Pada tenant besar (50 agent × ratusan mutasi/hari) = ribuan emission. Kasus terburuk: **broadcast campaign yang append ke room (10k recipient)** → 10k list-update event dalam rentang pendek = event storm di gateway WS. ⚠️

**Rekomendasi:** (1) debounce/batch socket emission per room (coalesce dalam window pendek); (2) batasi/aggregasi event broadcast-campaign append agar tidak per-recipient emit; (3) ukur throughput WS gateway pada simulasi broadcast 10k.

```
Room action (close/pin/star/tag/assign)
   │ emit conversation-updated
   ▼
Gateway WS :3002 ──fan-out──▶ semua agent subscribe list
   │
   ▼
N agent × M mutasi = N×M emission
   │
   ▼
⚠️ broadcast append 10k → 10k list-update event ≈ storm
```

### P-05 — SLA dihitung real-time service-side: cost per-row pada list 🟡 Medium

`global-memory.md` §Detail Rules: "SLA values computed real-time/service-side. Not stored directly in conversation document." Chat list menampilkan SLA color per row (FRT/TTC countdown). Untuk list 50–100 room, ini berarti **N kali komputasi SLA** (atau N gRPC call) saat render list — dengan `conversation_sla_metrics` terpisah. Belum ada indikasi SLA di-precompute/di-cache per list. ⚠️

**Efek:** render list chat = bottleneck SLA compute; makin banyak room makin lambat. Interaksi dengan P-01 (filter intersection) memperburuk latency.

**Rekomendasi:** (1) precompute denormalized `slaDueAt` + color state saat event timestamp berubah (bukan saat render); (2) cache list-level SLA summary di Redis; (3) pastikan komputasi SLA list memakai satu query batch, bukan N call.

### P-06 — Multi-tenant noisy-neighbor pada worker pool & queue 🟡 Medium

`PRD Broadcast.md` NFR: "tenant queues" + horizontal workers. `CLAUDE-be.md` default: prefetch 10, exchange `satuinbox-exchange` tunggal. Satu tenant menjalankan campaign 10k (P-03) menyita worker/prefetch bersama → tenant lain mengalami latensi chat/inbound. Auto-pull sudah di-rate-cap (#2711) — bukti bahwa rate-limit adalah pola yang mulai diterapkan, tapi belum menyeluruh. ⚠️

**Efek:** konsumen besar (tenant broadcast) mendegradasi tenant kecil; tanpa per-tenant fair-share, SLA tenant kecil terpengaruh oleh aktivitas tenant lain.

**Rekomendasi:** (1) per-tenant concurrency limit + queue sharding untuk workload berat (broadcast, bulk reply); (2) monitor per-tenant p95 queue latency; (3) terapkan rate-limit inbound/outbound per tenant seperti auto-pull cap.

---

## 2 | FLOW SISTEM

### FS-01 — Dua jalur asinkron (snapshot event vs socket) — urutan tak dijamin 🔴 Major

`CLAUDE-be.md` §2 & §12: hot-path cross-service data = **denormalized snapshot refreshed by events** ("this is why some fields lag briefly after an edit"). `global-memory.md` §Room Rules: mutasi list wajib update via socket. Jadi satu mutasi room punya **dua jalur propagasi paralel**: (a) RabbitMQ event → refresh snapshot list, (b) Socket emit → update FE langsung.

**Efek:** dua jalur asinkron tanpa total-order → FE bisa menerima socket update **sebelum** snapshot event diproses, atau sebaliknya → list menunjukkan state stale sesaat. Multi-handler synchronization tercatat sebagai **regression sensitive** di `global-memory.md`. ⚠️

**Rekomendasi:** (1) satu sumber kebenaran untuk update list: jadikan socket event sebagai sinyal untuk **invalidate & refetch** dari snapshot (bukan sumber data langsung); (2) version/`updatedAt` pada conversation untuk conflict detection di FE; (3) uji race close→reopen antar 2 agent.

```
Agent close room (conversation-service)
   │ write open→closed (own DB)
   ├──▶ RabbitMQ event ──▶ refresh denormalized snapshot (chat list)
   │                        └─ lag window ⚠️
   └──▶ Socket emit conversation-updated ──▶ FE update list langsung
   ⚠️ dua jalur asinkron, urutan tak dijamin → list bisa stale/berkedip
```

### FS-02 — Propagasi list hanya lewat socket, tanpa fallback reconcile 🔴 Major

`CLAUDE-fe.md` §10: socket client `autoConnect: false`, 5 reconnect attempts; `pending-socket-queue.store.ts` hanya buffer **outbound** (pesan), bukan inbound list state. Jika socket putus saat event list terlewat, FE **tidak punya mekanisme reconcile** untuk mutasi yang hilang — list tetap stale sampai user manual refresh. React Query `useInfiniteQuery` (list) tidak otomatis re-sync terhadap event yang terlewat. ⚠️

**Efek:** agent melihat unread counter / status room yang salah setelah koneksi terputus-reconnect; ini memperparah temuan UX audit "unread counter tidak konsisten" (2.1 audit lama) dari sisi akar teknis.

**Rekomendasi:** (1) pada reconnect, trigger `refetchOnReconnect`/invalidate list & unread count; (2) pertimbangkan socket event berisi `lastEventId` untuk deteksi gap; (3) fallback polling ringan untuk list saat socket unhealthy.

### FS-03 — SLA metric bergantung timestamp event async lintas service 🔴 Major

`global-memory.md` §SLA + §Dependencies: RLT & Wait Time bergantung event `firstCustomerMessageAt` (T1), `firstAgentAssignmentAt` (T2), `firstAgentReplyAt` (T3); constraint `FRT = Wait Time + RLT` **harus selalu terpenuhi**. T1 bisa datang dari `whatsapp-service` (inbound) sementara T2/T3 dari `conversation-service` (assignment/reply) — dua service, event via RabbitMQ, **tanpa jaminan urutan global**. ⚠️

**Efek:** kalau event T3 diproses sebelum T2 (out-of-order), RLT/Wait Time salah dan constraint pecah; metrik tersimpan di `conversation_sla_metrics` → data historis cacat. Ini menular ke reporting (Phase 1 RLT/Wait Time reporting only, tapi angka harus benar).

**Rekomendasi:** (1) enforce idempotency + sequence/`occurredAt`-ordering pada event SLA; (2) recompute SLA secara event-sourced (idempotent, monotonic) saat event datang, bukan increment; (3) tambah assertion/alert bila `FRT ≠ Wait + RLT` melampaui toleransi; (4) uji skenario event reorder.

```
T1 inbound ──▶ T2 assignment ──▶ T3 reply
   │ (whatsapp)     │ (conversation)    │
   ▼                ▼                   ▼
events via RabbitMQ (async, NO total order)
   │
   ▼
SLA compute service-side
   FRT=T1→T3 · Wait=T1→T2 · RLT=T2→T3
   ⚠️ constraint FRT = Wait + RLT pecah jika event out-of-order
```

### FS-04 — gRPC sinkron tanpa circuit breaker: cascade failure + config trap 🟡 Medium

`CLAUDE-be.md` §2: gRPC untuk synchronous work, mTLS mandatory. Cross-domain feature (mis. "tampilkan data ticket di dalam conversation") = rantai gRPC conversation→ticket. Tidak ada indikasi circuit breaker/timeout terstandar di layer gRPC. Plus **config trap**: `GRPC_ANALYTICS_URL` didefinisikan dua kali (`:50053` vs `:50069`), runtime `:50069` — salah set = analytics call gagal. ⚠️

**Efek:** satu downstream lambat/dead memblok request gateway (timeout menumpuk); perubahan lintas domain (proto-first) = risiko regresi kontrak saat satu service tidak di-deploy sinkron.

**Rekomendasi:** (1) terapkan deadline + circuit breaker pada client gRPC; (2) bersihkan config trap `GRPC_ANALYTICS_URL` jadi satu source; (3) kontrak proto wajib versi/deploy atomic lintas service (sudah jadi working practice — tegakkan di CI).

### FS-05 — Durable queue tanpa DLQ + audit-service fire-and-forget 🟡 Medium

`PRD Broadcast.md` NFR: at-least-once, durable queues, idempotent keys. `CLAUDE-be.md`: message lifecycle `pending→processing→sent→delivered→read` + `failed`/`retry`; bulk reply `prefetch=1` manual ack FIFO. Tapi **tidak ada DLQ (dead-letter queue)** yang disebut; retry loop tanpa batas → duplikat/poison message. `audit-service` adalah **RabbitMQ-only listener, tanpa gRPC** — tidak ada yang bisa query audit secara sinkron; bila event bus drop, trail compliance hilang diam-diam. ⚠️

**Efek:** message gagal permanent bisa di-retry tak terbatas (nyangkut), sementara audit gap tak terdeteksi. Broadcast NFR "audit all events" belum terjamin end-to-end.

**Rekomendasi:** (1) tambah DLQ + max-retry + alert untuk poison message; (2) verifikasi at-least-once + idempotent key enforcement benar-benar diimplementasi (bukan hanya di PRD); (3) beri jalan baca untuk audit (event replay / gRPC query) atau monitor event-bus drop.

---

## 3 | FLOW APLIKASI

### FA-01 — Login → Inbox: rantai gate berlapis + dead-end untuk Agent 🟡 Medium

`CLAUDE-fe.md` §9: login → onboarding (jika incomplete) → **workspace sync screen** (jika contact sync pending, `WorkspaceSyncGuard`) → dashboard, default landing `Your Inbox`. `global-memory.md` §Chat List: `Unassigned` hidden by RBAC untuk Agent role; "Assign to Me" = alternate access path (notification inline / temporary view / queue UI).

**Efek:** Agent dengan inbox kosong + `Unassigned` tersembunyi = **dead-end**: tidak ada kerja terlihat, path "Assign to Me" tidak discoverable dari empty state. Rantai gate (onboarding → sync → dashboard) memperpanjang time-to-first-value, dan sync screen memblok seluruh workspace. ⚠️

**Rekomendasi:** (1) empty state `Your Inbox` harus menampilkan CTA "Assign to Me" / queue bila role punya akses; (2) pastikan `Unassigned` yang team-scoped tersedia sebagai temporary view (sudah jadi opsi di memory — aktualkan); (3) kurangi blocking sync screen (allow background sync dengan banner, bukan full-screen guard) untuk tenant besar.

```
Login → session
   │
   ▼ onboarding incomplete? ──▶ onboarding
   ▼ contact sync pending? ──▶ full-screen sync (WorkspaceSyncGuard)
   ▼ dashboard → default Your Inbox
   ▼
Agent: Unassigned hidden by RBAC → empty inbox = dead-end
   ⚠️ "Assign to Me" tidak discoverable dari empty state
```

### FA-02 — Create ticket dari conversation: race multi-handler + link-back 🟡 Medium

`CLAUDE-fe.md` §7: `conversation-create-ticket.store.ts` ada; Ticket V2 file 7 (Create Ticket Consistency) + linked-ticket bubble sync (sudah production). Flow: pilih bubble → create ticket → ticket ter-link kembali ke conversation.

**Efek:** dua agent membuka conversation yang sama → dua-duanya create ticket dari bubble yang sama → duplikat ticket / link tidak konsisten. Tidak ada indikasi lock/claim pada bubble saat create-ticket in-flight. ⚠️

**Rekomendasi:** (1) disable/claim bubble saat create-ticket dipicu (optimistic lock); (2) idempotency key pada create-ticket (draft/request) agar double-click tidak membuat 2 ticket; (3) uji 2-agent concurrent create dari bubble sama.

### FA-03 — Close/reopen: optimistic update vs socket, last-write-wins tanpa versioning 🔴 Major

`global-memory.md` §Regression Sensitive: Reopen flow + Multi-handler synchronization. FE `React Query` mutation invalidate + socket `conversation-updated`. Close/reopen adalah mutasi list-state yang wajib update list via socket (FS-01/FS-02). ⚠️

**Efek:** agent A close, agent B (hampir bersamaan) reopen → optimistic UI keduanya, hasil akhir ditentukan **last-write-wins tanpa versioning**; status akhir tak tentu, dan reopen punya 3 definisi (F-02 audit lama) memperburuk ambiguitas state di FE.

**Rekomendasi:** (1) optimistic update harus dicek ulang terhadap server state (rollback bila konflik `updatedAt`); (2) jadikan `updatedAt`/version syarat write (optimistic concurrency); (3) setelah F-02 di-lock, samakan state machine reopen di FE dengan definisi kanonik.

### FA-04 — Broadcast create → send: reload hilang tanpa autosave, validasi baru ketahuan di akhir 🟡 Medium

`PRD Broadcast - Create.md` §15: **no autosave MVP** (hanya leave-guard). FR-010 reload preserves context **hanya** di edit-draft mode; create mode reload = kehilangan seluruh form. EH-004 sender unavailable baru muncul saat send. Form terpanjang di produk (channel + sender + ribuan recipient + template + variabel + schedule).

**Efek:** kerja panjang hilang saat refresh/navigasi tak sengaja; sender disconnect tidak disadari hingga tombol Send ditekan (lihat UX-04). ⚠️

**Rekomendasi:** (1) naikkan autosave dari Future Considerations ke backlog aktif (sudah direkomendasikan audit lama §2.5 — pertahankan); (2) validasi sender availability live (via channel socket) di composer, bukan saat send; (3) persist draft ke local storage sebagai fallback sebelum autosave server ada.

```
Broadcast composer (sticky bar: Save as draft / Send broadcast)
   │
   ├─ create mode: reload ──▶ ⚠️ work lost (no autosave, leave-guard only)
   │
   ▼ Send
   validasi lengkap baru dijalankan ──▶ EH-004 sender unavailable di akhir
   │
   ▼
   EC-004 idempotency draft_id/request_id (double-click guard) — wajib enforced BE
```

### FA-05 — Realtime: dua sumber kebenaran message, order bisa jitter 🟢 Low

`CLAUDE-be.md` §7 + `CLAUDE-fe.md` §15: outbound pakai `tempMessageId` untuk reconcile optimistic bubble vs persisted message (#2455 fix duplikat). Sumber message: optimistic bubble (Zustand), socket event, React Query refetch.

**Efek:** message yang datang via socket sebelum REST response bisa menampilkan urutan jitter singkat; reconcile by `tempMessageId` sudah mengurangi duplikat, tapi urutan antar-source belum dijamin. 🟢 (minor, sudah banyak difix di #2455).

**Rekomendasi:** (1) satukan antrian message per room (sort by `occurredAt`/`seq`); (2) jaga `tempMessageId` reconcile tetap idempotent; (3) uji inbox tidak terbaca → reconnect → urutan pesan tetap benar.

---

## 4 | UX (di luar UI/UX Audit Sabrina)

> Fokus friksi **flow inti** Conv/Ticket/Broadcast. Temuan visual/heuristik umum (konsistensi ukuran field, kontras, breadcrumb) sudah tercakup audit Sabrina — TIDAK diulang.

### UX-01 — SLA countdown tanpa penjelasan: merah kenapa? 🟡 Medium

`global-memory.md` §Ticket List Rules: SLA column = "live countdown to due; overdue negative; '—' when resolved". Chat list SLA color = percentage sisa budget (50%/10%). FE saat ini absolute-time (F-03, sudah major di audit lama). Sisi UX: **tidak ada tooltip/legend** yang menjelaskan arti angka/merah — apakah "2:31" sisa waktu atau sudah lewat. Overdue negatif (`-00:12`) tidak intuitif. ⚠️

**Efek:** agent tidak bisa cepat menilai urgensi tanpa interpretasi manual; sinyal SLA kehilangan nilai prioritisasinya (memperparah dampak F-03).

**Rekomendasi:** (1) tooltip/legend inline pada chip SLA (jenis metric, definisi threshold, "lewat X menit"); (2) visual overdue negatif yang jelas (ikon + label "Lewat", bukan hanya minus); (3) samakan dengan warna persentase setelah F-03 diperbaiki.

```
SLA chip: live countdown "2:31" (merah)
   │
   ▼
agent: "merah kenapa? sisa 2:31 apa sudah lewat?"
   ⚠️ no tooltip/legend: percentage vs absolute, overdue = "-00:12" tak intuitif
```

### UX-02 — Empty Your Inbox: tidak ada next action yang discoverable 🟡 Medium

Terkait FA-01, dari sudut UX. `global-memory.md`: "Assign to Me" = alternate access path untuk Agent (Unassigned hidden). Empty state default tidak menuntun ke aksi berikutnya. ⚠️

**Efek:** agent baru/sedikit kerja bingung "sekarang ngapain?" — friksi masuk kerja pertama.

**Rekomendasi:** empty state `Your Inbox` memuat CTA kontekstual per role: "Assign to Me" / "Buka Queue" (Agent), "Lihat Unassigned" (Supervisor/Admin). Tanpa itu agent berasumsi sistem kosong.

### UX-03 — Broadcast recipient collapse: audience tersembunyi sebelum kirim massal 🟡 Medium

`PRD Broadcast - Create.md` EC-002: pill list collapse "+N more" untuk ≥1k; FR-004 auto-dedupe. Untuk campaign ribuan penerima, ringkasan chip menyembunyikan **siapa** yang masuk; salah audience = kirim massal ke orang salah (dampak reputasi tinggi). ⚠️

**Efek:** error-prone send; tidak ada preview audience agregat (per-channel, per-segmen) sebelum konfirmasi final.

**Rekomendasi:** (1) sebelum Send final, tampilkan summary audience (total, breakdown, sample) di dialog konfirmasi; (2) izinkan export/preview daftar penerima penuh; (3) konfirmasi "Kirim ke N penerima?" sebagai gate terakhir (mirip error-prevention Nielsen #5).

### UX-04 — Sender disconnect tidak disurfaced di composer, hanya saat send gagal 🟡 Medium

`CLAUDE-fe.md` §10: `ChannelSocketProvider` memantau status koneksi WA Web (pairing/connection). Tapi composer broadcast tidak menampilkan status sender yang sedang dipilih. EH-004 ("Sender account is unavailable") baru muncul saat send — setelah seluruh form diisi. ⚠️

**Efek:** user menyusun campaign panjang, baru sadar akun pengirim mati di langkah terakhir → rework + frustrasi (bertentangan dengan OKR "time-to-send ≤15s" di PRD Create).

**Rekomendasi:** tampilkan indikator status live pada dropdown sender (online/offline/connecting) dari ChannelSocketProvider; blokir/disarankan ganti sender sejak awal bila offline.

```
Composer: sender = WA Web account X (connected saat dipilih)
   │
   ▼ mid-compose: account disconnect (channel socket tahu, composer TIDAK)
   ▼
send → EH-004 "Sender unavailable" (baru ketahuan di akhir, form terlanjur penuh)
   ⚠️ no proactive status banner di composer
```

---

## Master Severity Matrix (sumbu baru)

| ID | Temuan | Sumbu | Severity | Verifikasi |
|---|---|---|---|---|
| P-01 | Filter intersection 4 dimensi, index gap | Performance | 🔴 Major | ⚠️ |
| P-02 | Global search Atlas dark (regex aktif) | Performance | 🔴 Major | ✅ (verified di memory) |
| P-03 | Broadcast 10k fan-out + delivery wall-clock | Performance | 🔴 Major | ⚠️ |
| P-04 | Socket event storm (mutasi × N agent × broadcast) | Performance | 🔴 Major | ⚠️ |
| P-05 | SLA real-time compute per-row di list | Performance | 🟡 Medium | ⚠️ |
| P-06 | Noisy-neighbor worker/queue multi-tenant | Performance | 🟡 Medium | ⚠️ |
| FS-01 | Dual async path (snapshot vs socket) order | Flow sistem | 🔴 Major | ⚠️ |
| FS-02 | Socket-only propagation, no fallback reconcile | Flow sistem | 🔴 Major | ✅ |
| FS-03 | SLA event ordering lintas service | Flow sistem | 🔴 Major | ⚠️ |
| FS-04 | gRPC cascade + config trap | Flow sistem | 🟡 Medium | ✅ (config trap verified) |
| FS-05 | No DLQ + audit fire-and-forget | Flow sistem | 🟡 Medium | ⚠️ |
| FA-01 | Gate login berlapis + dead-end Agent | Flow aplikasi | 🟡 Medium | ✅ |
| FA-02 | Create ticket race multi-handler | Flow aplikasi | 🟡 Medium | ⚠️ |
| FA-03 | Close/reopen last-write-wins race | Flow aplikasi | 🔴 Major | ⚠️ |
| FA-04 | Broadcast reload loss + validasi akhir | Flow aplikasi | 🟡 Medium | ✅ |
| FA-05 | Message order jitter dua sumber | Flow aplikasi | 🟢 Low | ✅ |
| UX-01 | SLA countdown tanpa penjelasan | UX | 🟡 Medium | ⚠️ |
| UX-02 | Empty inbox tanpa next action | UX | 🟡 Medium | ⚠️ |
| UX-03 | Recipient collapse sembunyikan audience | UX | 🟡 Medium | ✅ |
| UX-04 | Sender disconnect tidak disurfaced | UX | 🟡 Medium | ⚠️ |

---

## Rekomendasi Prioritas (urutan eksekusi — melengkapi audit lama §7)

1. **Lock FS-03 (event ordering SLA)** + FS-01 (dual path) — akar kebenaran metrik & list; tanpa ini angka yang dijual salah dan utang data bertambah (sejajar audit lama item 1–2).
2. **Verifikasi P-03 & P-04 sebelum broadcast volume produksi** — load test 10k + DLQ + rate-limit, bersamaan dengan audit lama item 5 (idempotency).
3. **FS-02 fallback reconcile + P-01 index** — perbaikan stabilitas list yang murah dampaknya tinggi, menutup akar teknis temuan unread-counter UX audit lama.
4. **P-02 akui Atlas dark + P-05 precompute SLA** — utang produk yang harus dikomunikasikan, bukan diam.
5. **FA/UX quick win**: empty-state CTA (UX-02), sender status di composer (UX-04), tooltip SLA (UX-01) — non-blocking, backlog normal.

## Open Questions untuk Reviewer

- Apakah sudah ada DLQ / max-retry di RabbitMQ? (FS-05) — butuh verifikasi repo.
- Apakah index compound filter chat list sudah ada? (P-01) — butuh verifikasi repo.
- Bagaimana SLA event dijamin urutan/idempotent di produksi? (FS-03) — butuh konfirmasi engineering.
- Apakah socket emission sudah di-batch/debounce? (P-04) — butuh verifikasi repo.
