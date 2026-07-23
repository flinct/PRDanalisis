# Incident Report: RMQ Sync History Saturation — Blank Total (12:10)

- **Date:** 2026-07-20
- **Window:** ~11:18–12:10+ WIB (sync mulai → sistem blank), recovery setelah RMQ restart
- **Severity:** SEV-1 (full outage semua fitur, semua channel inbound stop terproses)
- **Impact:** SatuInbox blank seluruh fitur, tidak menerima inbound masuk dari channel manapun
- **Reporter:** user (RMQ queue + MongoDB count + RMQ restart recovery)
- **Status:** root cause diidentifikasi (shared queue + bulk sync tanpa fast-path). Recovery manual via RMQ restart. Belum di-patch. Belum ada reproduksi di staging.
- **Related:** [`2026-07-20-1000-conversation-event-storm.md`](./2026-07-20-1000-conversation-event-storm.md) — insiden 10:00 root cause menjadi amplifier di sini

---

## 1. Ringkasan Eksekutif

Company baru join, scan 6 nomor WA operasional sekaligus. SatuInbox trigger sync history dari 6 channel tersebut. Dalam window ~1 jam 42 menit (04:18–08:00 UTC = 11:18–15:00 WIB), sync menghasilkan **12886 conversation baru** dan **144k+ message baru** hanya untuk 1 companyId.

Karena **queue sync history dan queue inbound realtime berbagi 1 queue yang sama**, backlog sync membanjiri antrian. Consumer inbound-message.processor menjalankan **full realtime pipeline** untuk setiap message historis (auto-pull, counter, socket emit, ticket sync) → consumer stuck di backlog raksasa → **inbound realtime dari channel manapun (semua tenant, semua platform) menunggu di belakang backlog** → SatuInbox tampak blank total.

Recovery hanya berhasil setelah **RMQ direstart manual**. Ini bukan self-recovery — mengindikasikan tidak ada circuit breaker atau backpressure di consumer.

**Ini adalah insiden yang lebih parah dari 10:00**, dengan root cause tambahan (shared queue) dan blast radius total (semua channel inbound stop, bukan hanya conversation UI lambat).

---

## 2. Timeline

| Waktu (WIB) | Waktu (UTC) | Peristiwa | Sumber |
|---|---|---|---|
| 11:18 | 04:18:40.887 | Sync 6 channel WA mulai untuk `companyId 6a5d88602f6c6173b068c83e` | MongoDB `createdAt` filter |
| 11:18–12:10 | 04:18–05:10 | Backlog RMQ membesar, consumer inbound saturasi | Inferred |
| 12:10 | 05:10 | User laporan SatuInbox blank total, tidak terima inbound apapun | User report |
| 12:10+ | 05:10+ | RMQ direstart manual | User action |
| Post-restart | — | Sistem recover, inbound realtime kembali diproses | User report |
| (sync window ends) | 08:00 | Filter window MongoDB berakhir. 12886 conv + 144k+ msg tersimpan | MongoDB query |

**Backlog build-up:** ~52 menit (11:18 → 12:10) sebelum meledak. Pola gradual queue fill, bukan burst mendadak.

---

## 3. Gejala Terobservasi

- SatuInbox blank **seluruh fitur** (bukan hanya conversation panel — juga ticket, notification, dsb.)
- Tidak menerima inbound masuk dari channel manapun (WA, IG, FB, semua platform, semua tenant)
- Sistem tidak self-recover — butuh intervensi manual RMQ restart
- 12886 conversation baru + 144k+ message baru terkonfirmasi di MongoDB untuk 1 companyId dalam window sync

**MongoDB verification query:**
```javascript
db.conversation.find({
  companyId: ObjectId("6a5d88602f6c6173b068c83e"),
  createdAt: {
    $gte: ISODate("2026-07-20T04:18:40.887Z"),
    $lte: ISODate("2026-07-20T08:00:00.000Z")
  }
})
// → 12886 documents
// → 144k+ messages linked
```

---

## 4. Root Cause

**Compound cause. Root cause utama BARU (RC-A), amplifiers overlap dengan insiden 10:00.**

### 4.1 Chain

```
Company baru scan 6 nomor WA sekaligus (11:18 WIB)
  → channel-service publish sync history payload per message ke queue X
  → queue X = SATU queue untuk sync history DAN inbound realtime
  → RMQ backlog membengkak, 144k+ message antri
  → consumer inbound-message.processor tarik 1-per-1, jalankan full pipeline:
       - resolve/create conversation (DB read+write)
       - save message (DB write)
       - handleAutoPullAndRefresh untuk new conversation (12886 kali)
       - updateCounter(COUNTER_INBOUND) untuk isNewConversation (12886 kali)
       - emitPostProcessEvents → socket emit SOCKET_HANDLE_MESSAGE (144k kali)
       - api-gateway dual fanout → 288k socket event (amplifier insiden 10:00 aktif)
       - emitInboundMessageForTicketSync kalau ticket (144k kali potensi)
  → consumer throughput tidak mampu, prefetch stuck
  → inbound realtime dari WA/IG/FB channel lain semua tenant → menunggu di belakang backlog
  → FE storm karena 12886 conversation baru + 144k socket event
  → DB shared saturasi
  → agent inbox kebanjiran auto-pull assignment
  → sistem tampak "blank total tidak terima inbound"
  → tidak ada circuit breaker / backpressure → tidak self-recover
  → butuh RMQ restart manual untuk drop consumer state + backlog
```

### 4.2 Root causes utama (BARU, spesifik insiden 12:10)

| # | Lokasi | Deskripsi | Severity |
|---|---|---|---|
| RC-A | RMQ architecture | Shared queue untuk sync history dan inbound realtime | **P0 critical** |
| RC-B | `inbound-message.processor.ts:280-330` | Inbound processor tidak punya jalur bulk / fast-path untuk history sync | P0 |
| RC-C | channel-service sync publisher | Sync 6 channel paralel tanpa throttle per-channel/per-company | P0 |
| RC-D | `inbound-message.processor.ts:307-310` | `handleAutoPullAndRefresh` jalan untuk backfill message historis (tidak bedakan history vs live) | P0 |
| RC-E | `inbound-message.processor.ts:311-314` | `updateCounter(COUNTER_INBOUND)` per new-conv historis mengotori counter | P1 |
| RC-F | `inbound-message.processor.ts:452-467` | Socket emit per message historis (144k emit) | P1 |
| RC-G | RMQ consumer config | Prefetch/consumer count tidak scale dengan backlog, tidak self-recover | P1 |

### 4.3 Amplifier dari insiden 10:00 (aktif juga di 12:10)

| # | Lokasi | Efek di 12:10 |
|---|---|---|
| RC-1 (10:00) | BE dual socket fanout | 144k × 2 = 288k event ke socket gateway |
| RC-3 (10:00) | FE counter refetch 1s setelah setQueryData | `/count` di-hit tiap counter event dari 12886 new conversation |
| RC-5 (10:00) | FE reconnect global `invalidateQueries()` | Socket flap saat storm → burst refetch semua query FE |
| RC-6 (10:00) | FE `useConversationDetail` retry 3x | Menambah pressure ke BE yang sudah kewalahan |

---

## 5. Bukti Kode

**BE processor per-message flow (tidak ada fast-path untuk history):**

- `apps/conversation-service/src/app/processors/inbound-message.processor.ts:280-330` — main flow:
  - `:281-282` resolve/create conversation
  - `:285-294` save message
  - `:307-310` `handleAutoPullAndRefresh` untuk new conversation tanpa participant
  - `:311-314` `updateCounter(COUNTER_INBOUND)` untuk isNewConversation
  - `:317-322` `emitPostProcessEvents` (socket)
  - `:327` `emitInboundMessageForTicketSync`
- `apps/conversation-service/src/app/processors/inbound-message.processor.ts:452-467` — `emitPostProcessEvents` emit `SOCKET_HANDLE_MESSAGE`
- `apps/conversation-service/src/app/processors/inbound-message.processor.ts:879-892` — `handleAutoPullAndRefresh` chain: emit `CONVERSATION_AUTO_PULL` + `refreshConversation`

**Auto-pull fallback cron (tidak menyelamatkan skenario ini):**

- `apps/conversation-service/src/app/services/auto-pull-cron.service.ts:15-195` — batch 120, interval 2 menit
- 12886 conversation / 120 batch = **107 cycle × 2 menit = ~3.5 jam** untuk clear jika mengandalkan cron

**MongoDB filter (bukti volume):**
```javascript
{
  companyId: ObjectId("6a5d88602f6c6173b068c83e"),
  createdAt: {
    $gte: ISODate("2026-07-20T04:18:40.887Z"),
    $lte: ISODate("2026-07-20T08:00:00.000Z")
  }
}
// → 12886 conversation, 144k+ messages
```

**RMQ queue config:** belum di-verify, user statement: "proses queue sync dan queue inbound di 1 queue". Perlu audit queue definition di conversation-service module setup.

---

## 6. Dampak

**User-facing:**
- **Semua fitur SatuInbox tidak berfungsi** untuk semua tenant selama window insiden (durasi tepat belum dikonfirmasi, minimal dari 12:10 sampai RMQ restart)
- Inbound WA/IG/FB/channel apapun tidak diproses → customer message user luar tampak "hilang" atau delay ekstrem
- Agent tidak bisa terima pull assignment baru
- Ticket module ikut mati (share queue downstream)
- Company baru (tenant yang trigger) mengalami sync history yang "sukses" di DB tapi UI blank

**Sistem:**
- RMQ consumer stuck, tidak self-recover
- MongoDB write pressure tinggi (12886 conv + 144k msg + attachment + counter update dalam ~1.5 jam)
- Socket gateway overload (144k+ event, dengan amplifier dual fanout = 288k+ event)
- Auto-pull service saturasi (12886 assignment attempt)
- FE storm untuk semua agent yang online di tenant company baru

**Data:**
- **12886 conversation + 144k+ message TERSIMPAN di MongoDB** (sync sukses secara data)
- **BUT**: participants assignment untuk 12886 conversation itu **belum diverifikasi lengkap** — kemungkinan banyak yang `participants.length === 0` (unassigned) karena `handleAutoPullAndRefresh` dijalankan tapi throughput consumer tidak sempat
- Counter accuracy: kemungkinan skewed karena `updateCounter(COUNTER_INBOUND)` dijalankan untuk historis, bukan hanya realtime
- Ticket sync (`emitInboundMessageForTicketSync`) mungkin ada gap untuk conversation yang punya ticket

**Recovery cost:**
- RMQ restart manual = intervensi DevOps
- Message historis di backlog RMQ yang belum diproses saat restart: **kemungkinan hilang** (jika queue non-persistent atau ack sudah lewat)

---

## 7. Hubungan dengan Insiden 10:00

Insiden 12:10 = **strict superset** insiden 10:00.

| Aspek | 10:00 | 12:10 |
|---|---|---|
| Trigger | inbound realtime 1 tenant burst | bulk sync 6 channel 1 tenant |
| Volume | tidak diketahui, peak conn 794 | 144k msg + 12886 conv terkonfirmasi |
| Bottleneck utama | FE invalidation + socket amplification | **RMQ queue saturation (baru)** |
| Blast radius | conversation UI semua tenant blank/loading | **semua fitur + semua channel inbound stop** |
| Recovery | menunggu spike reda (auto) | **RMQ restart manual (butuh intervensi)** |
| Root cause 10:00 (RC-1..RC-6) | menjadi root | **menjadi amplifier di atas RC-A** |

**Kalau RC-1..RC-6 sudah di-patch:**
Insiden 12:10 tetap terjadi, tapi hanya sebagai **"sync lambat"**, bukan **"seluruh sistem blank"**. RC-A yang bikin "blank total tidak terima inbound".

**Kalau hanya RC-A yang di-patch:**
Insiden 10:00 tetap terjadi, tapi 12:10 tidak lagi blocking channel lain — sync 1 tenant tidak menular ke tenant/channel lain.

**Keduanya harus dibereskan.** Prioritas: RC-A (12:10) dulu karena severity SEV-1 dan sudah menyebabkan outage total.

---

## 8. Mitigasi (Sementara & Struktural)

Belum di-deploy. Kandidat, urutkan diff kecil → besar:

### 8.1 Quick-win

1. **[BE, config change]** Pisahkan queue: `inbound.realtime.queue` dan `inbound.sync.queue`. Consumer terpisah, prefetch berbeda. Realtime prefetch kecil (10-50) prioritas tinggi. Sync prefetch besar (500-1000) prioritas rendah, consumer sendiri yang bisa di-scale independent. **Efek: fix RC-A langsung.**

2. **[BE, small]** Fast-path processor untuk history sync. Payload sync dari channel-service tambah flag `isHistorySync=true`. Consumer skip:
   - `handleAutoPullAndRefresh` (RC-D)
   - `updateCounter` per message (RC-E), ganti 1 kali `updateCounter(BULK, delta)` per batch
   - `emitPostProcessEvents` socket (RC-F), ganti 1 emit `HISTORY_SYNC_BATCH_COMPLETE` per channel
   - `emitInboundMessageForTicketSync` (tidak perlu untuk historis)

   **Efek: kurangi work per message historis 80%+.**

3. **[BE, small]** Rate limit publisher sync di channel-service. Max 100 msg/s per channel, atau max 500 msg/s per company. **Efek: fix RC-C, backlog build-up melambat.**

4. **[BE, small]** Circuit breaker consumer: jika DB p95 > threshold atau queue depth > threshold, consumer pause prefetch. **Efek: fix RC-G bagian self-recovery, tidak perlu RMQ restart manual.**

### 8.2 Struktural (bukan quick-win)

- Assignment kickoff terpisah setelah sync selesai. Jangan auto-pull per message historis. Setelah sync 1 channel selesai, jalankan 1 kali logic assignment batch untuk conversation yang benar-benar butuh agent (filter: last message dalam 24 jam terakhir, atau sesuai konfigurasi).
- Bulk endpoint di conversation-service untuk sync history: batch insert message + conversation, skip per-message hooks.
- RMQ observability: alert saat queue depth > threshold, alert saat consumer utilisation < 50% dengan backlog > threshold.
- Isolasi queue per tenant (long-term, jika volume tenant makin besar).

---

## 9. Open Questions

1. **RMQ config verification**: audit queue definition. Konfirmasi apakah benar 1 queue physical untuk sync + realtime, atau 1 exchange dengan routing overlap. Cek `apps/conversation-service` module setup + `channel-service` publisher config.
2. **Unassigned conversation count**: dari 12886 conversation itu, berapa yang `participants.length === 0`? Query MongoDB:
   ```javascript
   db.conversation.countDocuments({
     companyId: ObjectId("6a5d88602f6c6173b068c83e"),
     createdAt: {
       $gte: ISODate("2026-07-20T04:18:40.887Z"),
       $lte: ISODate("2026-07-20T08:00:00.000Z")
     },
     $or: [
       { participants: { $exists: false } },
       { participants: { $size: 0 } }
     ]
   })
   ```
3. **Message loss confirmation**: apakah ada message historis yang publisher-side ter-publish tapi tidak masuk MongoDB karena RMQ restart drop backlog? Cross-check dengan WA sync source-of-truth (jika tersedia).
4. **RMQ metrics saat 12:10**: `queue depth`, `unacked count`, `consumer utilisation`, `publish rate`. Kalau ada di monitoring, tempel di section ini.
5. **Agent report**: apakah ada agent tenant company baru yang report menerima ratusan conversation baru di inbox mereka? Konfirmasi RC-D (auto-pull jalan untuk historis).
6. **Exact recovery time**: durasi antara 12:10 (blank start) → RMQ restart → sistem lancar. Untuk kalkulasi MTTR.
7. **Sync history design intent**: apakah sync history dari channel scan memang di-desain masuk sebagai "inbound message baru" di sistem (yang trigger notification + assignment), atau seharusnya jalur "arsip / read-only import"? Jawaban ini menentukan apakah RC-D fix cukup dengan flag, atau butuh separate service.

---

## 10. Action Items

| # | Item | Owner | Prioritas | Status |
|---|---|---|---|---|
| B1 | Audit RMQ queue definition (confirm shared queue) | DevOps + BE | **P0** | Pending |
| B2 | Query MongoDB: unassigned conversation count untuk companyId di window | DBA / BE | P0 | Pending |
| B3 | Split queue: sync vs realtime, deploy config change | DevOps + BE | **P0** | Pending |
| B4 | Fast-path processor: implement `isHistorySync` flag + skip realtime hooks | BE | **P0** | Pending |
| B5 | Rate limit publisher sync per channel/company | BE (channel-service) | P0 | Pending |
| B6 | Circuit breaker consumer + auto-pause backpressure | BE | P1 | Pending |
| B7 | RMQ observability: queue depth alert + consumer utilisation alert | Observability | P1 | Pending |
| B8 | Reproduce di staging: sync 6 channel simultan pakai fixture 144k msg | QA + BE | P1 | Pending |
| B9 | Verify: apakah message historis di backlog saat restart hilang? | BE + QA | P1 | Pending |
| B10 | Design review: sync history flow — inbound-like vs arsip flow | Architecture + PM | P2 | Pending |
| — | Cross-reference: fix insiden 10:00 (RC-1..RC-6) juga dibutuhkan | FE + BE | — | Lihat 10:00 report |

---

## 11. Lessons

1. Queue architecture yang share antara realtime dan batch/sync adalah **single point of amplification** — sync besar bisa mematikan realtime path total. Pisahkan sejak awal.
2. Processor yang dirancang untuk 1 event realtime tidak boleh dipakai apa adanya untuk bulk sync. Fast-path atau bulk API harus disediakan sejak fitur sync history diperkenalkan.
3. Consumer tanpa backpressure / circuit breaker = incident recovery butuh manual intervention. MTTR akan buruk.
4. Onboarding company baru dengan volume tinggi (6 channel × 2000-3000 chat/hari + history) adalah **load test yang tidak direncanakan**. Harus ada rate limit + validation di ingest layer.
5. Insiden 12:10 membuktikan bahwa root cause insiden 10:00 (event amplification + FE invalidation) bukan hanya "berbahaya saat burst realtime" — mereka **catastrophic saat backlog dari sync history di-replay** melalui pipeline yang sama.
6. Auto-pull assignment untuk history sync message tidak masuk akal secara produk — history bukan "message baru yang butuh agent", tapi konteks. Design bug: proses history sebagai inbound realtime.

---

**Sign-off:** Analyst (Dany Christian, PM) + Engineering Lead (Naftal Yunior) — pending review.

**Attachment:** session summary `summary/2026-07-20-conversation-loading-spike-analysis.md`.
