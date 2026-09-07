# 2026-09-01 — Incident Report: RMQ Pending Queue Upgrade + Missing Client Name

## Konteks
User minta incident report untuk dua isu: (A) recurring pending queue / stuck-waiting message → remediasi = upgrade RMQ instance type, (B) fix missing client name di conversation list.

## Yang dikerjakan
- Baca format incident report existing di `incident report/` (3 file July 2026) + konteks RMQ dari `summary/2026-08-31-rmq-durable-outbound-queue.md` dan assessment amplification/sync saturation.
- Tulis 1 report gabungan: `incident report/2026-09-01-rmq-pending-queue-upgrade-and-missing-client-name.md`.

## Isi report
- Insiden A: pending queue = manifestasi lanjutan saturasi 2026-07-20 (shared queue, no backpressure, full pipeline per message). Upgrade RMQ instance = MITIGASI (naikkan ceiling), bukan root-cause fix. Prasyarat: konfirmasi bottleneck = resource RMQ bukan consumer throughput. Follow-up struktural tetap wajib (split queue, backpressure, fast-path bulk sync, outbox).
- Insiden B: missing client name = bug terpisah. Kandidat: kontak belum resolve / field null / FE render / race. Perlu sampel conversationId untuk tentukan null-di-DB vs tampil-di-API (fix BE vs FE).
- Action items 8 item, tabel prioritas.

## Catatan / open
- Field "perlu dikonfirmasi": spec RMQ instance aktual, queue depth saat gejala, sampel conversationId missing-name. Harus diisi sebelum RCA final.
- Clarify (report type / 1-vs-2 file / tanggal) timeout — default: remediation report, 1 file gabungan, tanggal hari ini.
