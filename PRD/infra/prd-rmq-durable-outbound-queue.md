# PRODUCT REQUIREMENT DOCUMENT

**Feature:** RabbitMQ Durable Outbound Queue (Transactional Outbox)
**Domain:** Cross-domain / Infrastructure (Outbound Messaging Reliability)
**Product Manager:** Dany Christian
**Engineering Lead:** Naftal Yunior
**Status:** `DRAFT — DISCOVERY` (belum frozen; menunggu jawaban discovery BE)
**Source Brief:** `Assessments/cross-domain/rmq-durable-outbound-queue/rmq-durable-outbound-queue-change-intake-brief.md`
**Diagram:** `prototypes/rmq-outbox-flow.html`

---

## 1. Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| v0.1 | 2026-08-31 | Analyst | Draft awal + discovery embedded. Belum frozen. |
| v0.2 | 2026-08-31 | Analyst | + §6.0 lifecycle 6-status (pending→waiting→sent→delivered→read, cabang failed retryable/permanent); §6.7 webhook status listener; §7B RMQ traffic persist matrix (mana ke DB / recompute / reuse); DQ-17..19. |

---

## 2. Overview

RabbitMQ saat ini kehilangan seluruh isi antrian ketika broker restart. Pesan outbound (balasan agent ke pelanggan, primer WhatsApp) yang sedang mengantri untuk dikirim ikut hilang tanpa jejak dan tanpa retry.

PRD ini mendefinisikan durabilitas jalur pengiriman pesan outbound sehingga **DB menjadi source of truth** dan restart broker tidak menyebabkan message loss maupun double-send.

### Scope Definition

**In Scope:**
- Durabilitas antrian outbound (queue `durable`, message `persistent` / `deliveryMode=2`).
- Persist pesan outbound ke DB (outbox) sebagai source of truth.
- Urutan pengiriman aman: tulis `pending` → kirim → update `sent` → **manual ack RMQ terakhir**.
- Idempotency (cegah double-send) via `messageId` + atomic claim.
- Recovery job (sweeper) yang re-publish row `pending` yang nyangkut setelah restart.

**Out of Scope:**
- Instagram fix (sudah ada fix terpisah — dikonfirmasi user).
- Redesign topology exchange/broker.
- Jalur inbound (fokus outbound/pengiriman saja).
- Perubahan UX/FE.

---

## 3. Problem Statement

RMQ restart / deploy / crash → antrian outbound hilang → pesan pelanggan tidak terkirim, senyap, tanpa retry. Ini data loss di jalur komunikasi pelanggan. User menetapkan **zero-tolerance terhadap kehilangan pesan**.

Usulan journey awal user (`input → check db → update db → kirim → cek db → update db`) benar arah (persist + update), tetapi punya 3 celah bila urutan dan titik ack tidak dikunci — lihat §7.

---

## 4. Objectives and Key Results

| Objective | Key Result |
|-----------|-----------|
| Hilangkan message loss saat restart | 0 pesan `pending`/`sending` hilang setelah RMQ restart pada uji chaos |
| Cegah double-send | 0 duplicate delivery saat RMQ redeliver / sweeper re-publish (uji redeliver) |
| Recovery otomatis | Queue yang kosong akibat restart terisi ulang dari DB tanpa intervensi manual dalam < N detik |
| Zero perf regression | Latency jalur kirim normal tidak naik signifikan (batas ditetapkan setelah OQ-04) |

---

## 5. Discovery — Pertanyaan untuk Engineering Lead

> **Status:** OPEN. PRD ini **tidak boleh di-freeze / lanjut ke functional final** sebelum bagian ini terjawab. Owner jawaban: Naftal Yunior (BE / Tech Lead).

### 5.1 Konfigurasi RMQ Aktual (menentukan quick-win vs full outbox)

| ID | Pertanyaan | Kenapa Penting | Blocking |
|----|-----------|----------------|----------|
| DQ-01 | Apakah queue outbound saat ini dideklarasikan `durable: true`? | Kalau `false`, restart pasti hapus queue — quick-win-nya set `durable`. | Yes |
| DQ-02 | Apakah message dipublish dengan `persistent: true` / `deliveryMode: 2`? | Queue durable tapi message non-persistent tetap hilang saat restart. | Yes |
| DQ-03 | Apakah queue memakai opsi `autoDelete` / `exclusive`? | `autoDelete`/`exclusive` bikin queue lenyap saat consumer disconnect — ini bisa jadi akar masalah sebenarnya, bukan sekadar restart. | Yes |
| DQ-04 | Apakah publisher pakai **publisher confirms**? | Tanpa confirm, publish bisa hilang di jaringan tanpa error → pesan tak pernah masuk queue. | Yes |
| DQ-05 | Apakah broker pakai quorum/mirrored queue atau single-node? | Menentukan apakah durabilitas per-node cukup atau butuh replikasi. | No |

### 5.2 Lokasi & Transaksi Outbox

| ID | Pertanyaan | Kenapa Penting | Blocking |
|----|-----------|----------------|----------|
| DQ-06 | DB / service mana yang menampung outbox? (`conversation-service` DB? collection baru?) | Menentukan lokasi source of truth + apakah write bisnis & write outbox bisa 1 transaksi. | Yes |
| DQ-07 | Apakah MongoDB deployment mendukung multi-document transaction (replica set)? | Menentukan apakah "tulis bisnis + tulis outbox" bisa atomic, atau perlu pola outbox terpisah. | Yes |
| DQ-08 | Apakah `conversation-service` per-channel outbound routing (existing) sudah punya titik tunggal semua pesan outbound lewat? | Idealnya outbox ditulis di satu choke point, bukan tersebar per channel. | Yes |
| DQ-17 | Apakah webhook status (delivered/read) dari Meta/WA masuk lewat RMQ? Queue mana? Sudah `durable`? | Menentukan apakah update status juga perlu durable + di titik mana listener update record pesan. | Yes |
| DQ-18 | Apakah scope track sampai `read`, atau cukup `sent`/`delivered`? | Makin jauh makin banyak webhook wiring per provider. Menentukan effort. | Yes |

### 5.3 Idempotency & Semantik Delivery

| ID | Pertanyaan | Kenapa Penting | Blocking |
|----|-----------|----------------|----------|
| DQ-09 | Apakah channel provider (WA/Baileys, dll) expose message ID / ack yang bisa dijadikan idempotency key? | Redeliver aman hanya jika ada kunci idempotensi yang stabil. | Yes |
| DQ-10 | Mana yang lebih parah secara bisnis: **double-send** atau **message-loss**? | Menentukan default at-least-once (boleh redeliver, cegah dup pakai idempotency) vs at-most-once. Default rekomendasi: at-least-once + idempotency. | Yes |
| DQ-11 | Berapa max retry sebelum pesan ditandai `failed` / masuk DLQ? Dan apa aksi setelah `failed`? | Menentukan lifecycle state + eskalasi ke agent. | No |

### 5.4 Skala & Kalibrasi

| ID | Pertanyaan | Kenapa Penting | Blocking |
|----|-----------|----------------|----------|
| DQ-12 | Volume outbound puncak (msg/detik) dan ukuran backlog terbesar yang pernah terjadi? | Kalibrasi ambang sweeper + validasi klaim zero-perf-impact. | No |
| DQ-13 | Berapa lama toleransi sebuah pesan boleh berstatus `pending` sebelum sweeper re-publish? | Ambang `now - X` sweeper. Terlalu kecil → double-send pesan yang masih `sending`; terlalu besar → recovery lambat. | No |

### 5.5 Interaksi dengan Behavior Existing (jangan sampai rusak)

| ID | Pertanyaan | Kenapa Penting | Blocking |
|----|-----------|----------------|----------|
| DQ-14 | Bagaimana bulk reply existing (`prefetch=1`, manual ack, FIFO) terpengaruh perubahan titik ack? | Bulk reply FIFO tidak boleh rusak. | Yes |
| DQ-15 | Apakah delayed queue (SLA breach / reminder) berbagi queue/exchange dengan jalur outbound ini? | Perubahan config outbound tidak boleh mengganggu delayed queue SLA. | Yes |
| DQ-16 | Apakah ada konsumer lain yang membaca queue outbound yang sama? | Menentukan blast radius perubahan ack/persistence. | Yes |
| DQ-19 | Apakah SLA breach / reminder menyimpan `dueAt` di DB, atau jadwal hanya hidup di dalam pesan RMQ delayed? | Kalau `dueAt` tidak di DB, restart = SLA check hilang permanen → delayed queue jadi butuh persist (bukan recompute). Menentukan §7B baris SLA. | Yes |

---

## 6. Functional Requirements (PROVISIONAL — dikunci setelah discovery)

> Ditandai provisional karena bentuk finalnya bergantung jawaban §5 (mis. DQ-01/02 bisa membuat sebagian requirement ini tidak perlu).

### 6.0 Message Status Lifecycle

Status pesan outbound (unified, lintas provider WA/IG/FB):

```
pending → waiting → sent → delivered → read
                      ↘ failed
   ↑___retry (retryable error)___↙
```

| Status | Arti | Sumber transisi |
|--------|------|-----------------|
| `pending` | Internal: outbox record dibuat, request sedang diantrikan ke RMQ | Sistem, saat request kirim diterima |
| `waiting` | Request sudah masuk & menunggu di antrian RMQ | Sistem, setelah publish ke RMQ |
| `sent` | Provider menerima pesan (response sukses / 2xx) | Response API provider saat kirim |
| `delivered` | Pesan sampai di device recipient | **Webhook / status callback provider** (datang belakangan) |
| `read` | Pesan sudah dibaca recipient | **Webhook / status callback provider** (datang belakangan) |
| `failed` | Gagal kirim ke provider (error permanent atau retry habis) | Response error provider / retry exhausted |

**Aturan penting:**

1. **`delivered` & `read` TIDAK diset dari response kirim.** Keduanya datang belakangan lewat **webhook/status callback** tiap provider (Meta Graph untuk IG/FB, WhatsApp Cloud API webhook untuk WA). Perlu listener webhook status yang meng-update record pesan by `messageId`.
2. **`failed` bukan hanya HTTP 400.** Klasifikasi error menentukan retry:
   - **Retryable** (`429`, `5xx`, timeout, koneksi putus) → kembali ke antrian, retry. Jangan langsung `failed`.
   - **Permanent** (`400`, `401`, `403` — payload/nomor invalid, token expired/diblokir) → langsung `failed`, retry percuma.
   - Bedakan via `errorCode` (§6.1). `ponytail:` retry hanya untuk kelas retryable; permanent langsung `failed`.
3. **Provider tidak punya `pending`/`waiting`** — itu status internal SatuInbox. Provider hanya kenal ekuivalen `sent`/`delivered`/`read`/`failed`.

### 6.1 Outbox Record
Setiap pesan outbound ditulis ke DB sebelum publish, dengan minimal:

| Field | Guna |
|-------|------|
| `messageId` | idempotency key, cegah double-send |
| `conversationId` / `channelId` | routing |
| `channel` | pilih adapter provider (wa/ig/fb) |
| `payload` | isi pesan |
| `status` | `pending` → `waiting` → `sent` → `delivered` → `read`; cabang `failed` (§6.0) |
| `attempts` | retry counter |
| `errorCode` | klasifikasi retryable vs permanent (§6.0 aturan 2) |
| `createdAt` / `sentAt` / `deliveredAt` / `readAt` | timeline + audit |
| `error` | pesan error mentah, debug bila gagal |

> `delivered`/`read` di-update ke **record pesan yang sama** oleh webhook listener — bukan store terpisah. `ponytail:` reuse outbox record, jangan bikin tabel status kedua.

### 6.2 Publish
- Publish ke RMQ membawa **`messageId` saja**, bukan full payload (payload di DB).
- Queue `durable`, message `persistent` (`deliveryMode=2`), publisher confirms aktif.

### 6.3 Consume & Atomic Claim
- Consumer terima `messageId` → **atomic claim**: `update outbox set status=sending where messageId=? and status=waiting`.
- `sending` = flag transient internal (lock antar-consumer), bukan status user-facing (§6.0 hanya expose `pending/waiting/sent/delivered/read/failed`).
- Bila 0 row terpengaruh → pesan sudah diklaim/diproses instance lain → **skip** (bukan error).

### 6.4 Send & Update
- Kirim ke provider.
- Sukses (2xx) → `status=sent`, `sentAt=now`.
- Gagal retryable (`429`/`5xx`/timeout) → `status=waiting`, `attempts++`, requeue (§6.0 aturan 2).
- Gagal permanent (`400`/`401`/`403`) atau retry habis → `status=failed`, `errorCode` diisi (+ DLQ / eskalasi per DQ-11).
- `delivered`/`read` **tidak** diset di sini — datang lewat webhook (§6.7).

### 6.5 Ack Ordering (KRITIS)
- **Manual ack ke RMQ dilakukan PALING AKHIR, setelah update DB sukses.**
- Crash antara kirim & update DB → pesan belum di-ack → RMQ redeliver → atomic claim (§6.3) + `messageId` cegah double-send.

### 6.6 Recovery Sweeper
- Cron (reuse `@nestjs/schedule` yang sudah ada) menyapu 2 kondisi nyangkut:
  - `status='waiting' AND updatedAt < now - X` → re-publish `messageId` ke RMQ (queue hilang akibat restart).
  - `status='sending' AND updatedAt < now - Y` → **reclaim** balik ke `waiting` (consumer mati saat memproses; tanpa ini nyangkut `sending` selamanya).
- Ambang `X`, `Y` dikalibrasi dari DQ-13. `ponytail:` mulai konservatif, tuning dari throughput riil.

### 6.7 Webhook Status Listener (delivered / read)
- Listener terpisah menerima status callback provider (Meta Graph IG/FB, WhatsApp Cloud API webhook) → update record pesan **by `messageId`**: `delivered` / `read` + `deliveredAt` / `readAt`.
- Update monoton: `read` tidak boleh mundur ke `delivered`; `delivered` tidak mundur ke `sent`.
- Queue webhook status juga perlu `durable` + `persistent` — kalau hilang saat restart, status pesan nyangkut di `sent` padahal sudah `delivered`/`read` (§7B).

---

## 7. Analisa Journey User vs Usulan (Referensi Keputusan)

| Aspek | Journey user | Requirement PRD |
|-------|-------------|-----------------|
| Urutan tandai `sent` | bisa sebelum kirim → loss senyap | selalu setelah provider konfirmasi (§6.4) |
| Cegah double-send | "cek db" = read biasa → race | atomic claim `update where pending` (§6.3) |
| Titik ack RMQ | tidak eksplisit | paling akhir, setelah DB update (§6.5) |
| Recovery restart | tidak ada | sweeper re-publish dari DB (§6.6) |

Diagram: `prototypes/rmq-outbox-flow.html`.

---

## 7B. RMQ Traffic — Apa yang Persist ke DB, Apa yang Tidak

> RMQ SatuInbox bukan hanya antrian message outbound — ia adalah **event bus + async job bus** seluruh platform. Restart menghapus SEMUA queue, bukan cuma outbound. Tapi tidak semua traffic perlu outbox DB. Prinsip: **persist kalau kehilangannya = data loss yang bisnis peduli DAN tidak bisa di-recompute.**

| Kategori RMQ | Persist ke DB? | Alasan / Perlakuan |
|--------------|----------------|--------------------|
| **Message outbound** (kirim WA/IG/FB) | **YA — outbox baru** | Inti masalah. Hilang = pesan pelanggan raib, tak bisa recompute. Scope PRD ini. |
| **Webhook status masuk** (delivered/read/failed) | **YA — kolom di record pesan yang sama** | Update status pesan. Hilang = status nyangkut `sent`. Bukan store terpisah (§6.7). |
| **Audit / compliance event** | **YA (sudah)** | Persisted by design di `audit-service`. Bukan scope baru. |
| **Account channel event log** | **YA (sudah)** | Immutable log, idempotency key + TTL. Bukan scope baru. |
| **Bulk reply job** | **Setengah** | Payload sudah di `ticket/bulk-reply` record. Cukup durable queue + status di record existing, **tanpa outbox baru**. |
| **Broadcast campaign** | **Setengah** | Campaign sudah di DB. Trigger boleh hilang & di-resume dari campaign record. |
| **SLA breach / reminder (delayed)** | **TIDAK (recompute)** — *asal `dueAt` di DB (DQ-17)* | Bisa dihitung ulang dari `dueAt`/`slaMetrics`. Restart → re-schedule dari data existing. |
| **Notification fan-out** (push/in-app) | **TIDAK** | Ephemeral. Notif telat/hilang bukan data loss kritis. |
| **Denormalized snapshot sync** | **TIDAK (recompute)** | Source of truth di service asal. Restart → re-sync dari source. |

**Ringkas 3 golongan:**
1. **Outbox/persist baru (scope PRD ini):** message outbound + webhook status (via kolom di record pesan yang sama, bukan tabel kedua).
2. **Reuse record existing + durable queue:** bulk reply, broadcast — tidak bikin outbox.
3. **Recompute / ephemeral:** delayed SLA, notif fan-out, snapshot sync — cukup durable queue atau re-derive dari DB existing.

**Batas perubahan durable/persistent:** hanya **queue outbound + queue webhook-status**. Jangan ubah config global semua queue — bulk reply FIFO (`prefetch=1`) dan delayed queue punya semantik beda, bisa rusak kalau kena perubahan sapu rata (§5.5).

---

## 8. Non-Functional Requirements

- **Zero perf regression** pada service existing (batas user). Outbox write & sweeper tidak menaikkan latency jalur kirim normal secara signifikan (angka pasti setelah DQ-12).
- **mTLS wajib** untuk semua transport RMQ — tidak boleh dilonggarkan.
- **Idempotency** default at-least-once + dedup (pending konfirmasi DQ-10).

---

## 9. Dependencies & Risks

| Item | Tipe | Catatan |
|------|------|---------|
| Konfigurasi durable/persistent aktual | Dependency | Blocking; DQ-01..04 |
| MongoDB transaction support | Dependency | DQ-07 menentukan pola outbox |
| Provider message ID | Dependency | DQ-09; tanpa ini idempotency lemah |
| Double-send saat redeliver/sweeper | Risk | Mitigasi: atomic claim + idempotency; ambang sweeper konservatif |
| Bulk reply FIFO rusak | Risk | Regresi wajib; DQ-14 |
| Delayed queue SLA terganggu | Risk | DQ-15 |

---

## 10. Success Metrics

- 0 message loss pada uji chaos (kill broker saat backlog terisi).
- 0 duplicate delivery pada uji redeliver.
- Recovery time queue < target (setelah DQ-13).
- Latency jalur kirim normal dalam batas (setelah DQ-12).

---

## 11. Limitations / Open

- PRD **belum frozen** — §5 discovery masih open, sebagian §6 provisional.
- Kemungkinan **Split A cukup**: jika DQ-01..04 mengungkap queue belum durable / message non-persistent, quick-win (set durable + persistent + confirms) bisa menutup mayoritas kasus tanpa outbox penuh (§6.1–6.6). Full outbox hanya bila masih ada celah crash antara publish & penerimaan, atau butuh audit trail per pesan.

---

## 12. Appendix

### Glossary
- **Outbox pattern:** persist pesan ke DB dulu, broker jadi trigger, DB source of truth.
- **Atomic claim:** `update ... where status=pending` sebagai guard anti-double-process.
- **Sweeper:** job periodik yang re-publish row `pending` yang nyangkut.
- **deliveryMode=2 / persistent:** message ditulis ke disk broker, selamat dari restart (asal queue juga durable).
- **Publisher confirms:** broker ACK ke publisher bahwa message sudah diterima & (untuk persistent) di-persist.
