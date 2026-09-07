# Incident Report: Recurring Pending Queue / Stuck Waiting Message + Missing Client Name

- **Date:** 2026-09-01
- **Severity:** SEV-2 (recurring degradation, intermittent stuck inbound; no confirmed data loss)
- **Impact:**
  - Pesan masuk tertahan di antrian (pending queue), user di surface conversation melihat "stuck waiting message" — pesan tidak muncul / tertunda lama.
  - Nama client tidak tampil di conversation list (missing client name).
- **Reporter:** user (keluhan client berulang + observasi conversation list)
- **Status:** root cause utama pending-queue sudah teridentifikasi dari insiden sebelumnya; remediasi diputuskan = **upgrade RMQ instance type**. Missing client name = bug FE/BE terpisah, fix in progress.
- **Related:**
  - [`2026-07-20-pk12-10-rmq-sync-history-saturation.md`](./2026-07-20-pk12-10-rmq-sync-history-saturation.md) — SEV-1 sync saturation, akar shared-queue + no backpressure.
  - [`2026-07-20-pk10-00-conversation-event-storm.md`](./2026-07-20-pk10-00-conversation-event-storm.md) — event amplification storm.
  - `summary/2026-08-31-rmq-durable-outbound-queue.md` — change intake outbox durability (jalur perbaikan struktural).

---

## 1. Ringkasan Eksekutif

Dua isu terpisah dilaporkan:

**A. Pending queue / stuck waiting message (berulang).**
Client berulang kali melaporkan pesan masuk tertahan di antrian dan tidak muncul di surface conversation ("stuck waiting message"). Pola ini adalah manifestasi berkelanjutan dari saturasi antrian yang sama dengan insiden 2026-07-20: consumer inbound tidak sanggup menyerap laju/lonjakan message, backlog RMQ menumpuk, pesan realtime menunggu di belakang antrian. Sebagai remediasi jangka pendek, diputuskan **menaikkan instance type RMQ** untuk memberi headroom throughput/memory sambil perbaikan struktural (split queue, backpressure, outbox) berjalan.

**B. Missing client name di conversation list.**
Sebagian conversation tampil tanpa nama client di list — hanya nomor / kosong / placeholder. Bug tampilan/resolusi kontak, terpisah dari isu antrian. Tidak memblokir inbound, tapi menurunkan usability agent.

Keduanya digabung dalam satu report karena dilaporkan bersamaan; akar masalah dan jalur perbaikannya berbeda.

---

## 2. Insiden A — Pending Queue / Stuck Waiting Message

### 2.1 Gejala Terobservasi
- Client lapor pesan masuk tidak muncul / tertunda lama di conversation surface.
- Berulang (bukan sekali outage), muncul saat laju inbound naik.
- Selaras dengan pola backlog RMQ pada insiden 2026-07-20.

### 2.2 Root Cause (dari insiden sebelumnya, masih berlaku)
1. **Consumer inbound saturasi saat lonjakan** — setiap message menjalankan full realtime pipeline (auto-pull, counter, socket emit, ticket sync). Tidak ada fast-path untuk load tinggi.
2. **Tidak ada backpressure / circuit breaker** — begitu backlog menumpuk, tidak ada mekanisme self-recovery; recovery insiden 07-20 hanya berhasil via restart RMQ manual.
3. **Antrian sync history & inbound realtime historis berbagi jalur** — burst di satu tenant menular ke semua (shared infra).
4. **Headroom RMQ instance terbatas** — instance saat ini tidak punya cukup margin CPU/memory/queue-depth untuk menyerap lonjakan sebelum saturasi.

> Butuh dikonfirmasi (BE): spec RMQ instance aktual (vCPU/RAM), high-water mark memory RMQ, dan queue depth saat gejala muncul. Isi sebelum RCA final.

### 2.3 Remediasi yang Diputuskan
**Upgrade RMQ instance type** — remediasi jangka pendek untuk menambah headroom throughput & memory, mengurangi frekuensi/tingkat keparahan stuck-waiting saat lonjakan.

- **Sifat:** mitigasi (menaikkan ceiling), **bukan** root-cause fix. Upgrade menunda saturasi, tidak menghilangkan sumbernya (full pipeline per message, no backpressure, shared queue).
- **Prasyarat sebelum eksekusi:**
  - Konfirmasi bottleneck aktual = resource RMQ (CPU/RAM/disk/queue-depth), bukan semata logika consumer. Kalau consumer yang throughput-bound, upgrade RMQ tidak menolong — yang perlu dinaikkan adalah consumer concurrency/prefetch.
  - Target instance type + estimasi headroom (mis. berapa x baseline peak connections/queue-depth insiden 07-20 yang harus tertampung).
  - Rencana rollback (instance type sebelumnya) + window maintenance.
- **Follow-up struktural (tetap wajib, jangan berhenti di upgrade):**
  - Pisahkan queue sync-history dari inbound realtime (hilangkan blast radius shared queue).
  - Backpressure / circuit breaker di consumer inbound.
  - Fast-path untuk message historis (skip full realtime pipeline saat bulk sync).
  - Durable outbound queue / outbox (lihat `summary/2026-08-31-rmq-durable-outbound-queue.md`).

### 2.4 Verifikasi Pasca-Upgrade
- Monitor queue depth & consumer lag di Grafana saat inbound burst berikutnya.
- Konfirmasi tidak ada laporan stuck-waiting baru pada laju yang sebelumnya memicu.
- Ukur waktu drain backlog vs sebelum upgrade.

---

## 3. Insiden B — Missing Client Name di Conversation List

### 3.1 Gejala Terobservasi
- Conversation di list tampil tanpa nama client (nomor telanjang / kosong / placeholder).
- Terjadi pada sebagian conversation, tidak semua.

### 3.2 Kandidat Root Cause (perlu dikonfirmasi)
1. Kontak belum ter-resolve saat conversation dibuat (nama belum ter-populate dari contact-service saat first inbound).
2. Field nama tidak ter-map / null dari payload channel (WA push name kosong, contact belum tersimpan).
3. FE fallback tidak render nama walau data ada (bug binding conversation list item).
4. Race: conversation muncul via socket sebelum data contact ter-hydrate.

> Perlu 1 sampel conversationId yang reproduksi + cek: apakah nama null di DB (BE/data) atau ada di API tapi tidak tampil (FE render). Ini yang membedakan fix BE vs FE.

### 3.3 Remediasi
- **Jika data null di sumber:** populate/backfill nama saat conversation create; fallback ke push name / nomor terformat.
- **Jika data ada tapi tidak tampil:** perbaiki binding/fallback di conversation list item (FE).
- **Fallback UX minimal:** jika nama benar-benar tidak ada, tampilkan nomor terformat, jangan kosong.

### 3.4 Verifikasi
- Sampel conversation yang tadinya kosong kini menampilkan nama atau fallback nomor.
- Tidak ada regresi pada conversation yang namanya sudah benar.

---

## 4. Dampak & Prioritas

| Isu | Severity | Blast radius | Prioritas fix |
|---|---|---|---|
| A — Pending queue / stuck waiting | SEV-2 (berulang, bisa eskalasi ke SEV-1 seperti 07-20) | Lintas tenant saat lonjakan | Upgrade RMQ **sekarang** (mitigasi) + follow-up struktural |
| B — Missing client name | SEV-3 (usability, no outage) | Sebagian conversation | Fix setelah root cause dikonfirmasi (BE vs FE) |

---

## 5. Action Items

| # | Action | Owner | Status |
|---|---|---|---|
| 1 | Konfirmasi bottleneck RMQ = resource (bukan consumer throughput) + spec instance aktual | BE / Naftal Yunior | open |
| 2 | Tentukan target RMQ instance type + headroom vs peak 07-20, siapkan rollback + window | BE | open |
| 3 | Eksekusi upgrade RMQ instance | BE / Infra | open |
| 4 | Monitor queue depth/consumer lag pasca-upgrade saat burst berikutnya | BE / QA | open |
| 5 | Follow-up struktural: split queue, backpressure, fast-path bulk sync, outbox | BE | open (tracked) |
| 6 | Ambil sampel conversationId missing-name, tentukan null-di-DB vs tampil-di-API | BE / FE | open |
| 7 | Fix missing client name sesuai lokasi root cause + fallback nomor | FE / BE | in progress |
| 8 | Verifikasi kedua fix, tidak ada regresi | QA | open |

---

## 6. Catatan

- Upgrade RMQ instance = **mitigasi**, bukan penutup insiden. Insiden A baru boleh ditutup setelah follow-up struktural (§2.3) menghilangkan pola saturasi, terkonfirmasi via monitoring.
- Field bertanda "perlu dikonfirmasi" (spec RMQ, queue depth saat gejala, sampel conversationId) harus diisi sebelum RCA final.
