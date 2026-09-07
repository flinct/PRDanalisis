# 2026-08-31 — RMQ Durable Outbound Queue (Change Intake)

## Konteks
User lapor: RMQ restart hapus semua antrian → pesan outbound belum terkirim hilang. Usul user: persist ke DB pesan yang diantri, update DB setelah sukses kirim. Instagram fix diabaikan (sudah ada fix terpisah).

## Yang dikerjakan
- Analisa journey user (`input→check db→update db→kirim→cek db→update db`) vs pola **Transactional Outbox**. Temuan celah: (a) urutan tandai `sent` bisa sebelum kirim → message loss senyap, (b) "cek db" cuma read → race + double-send, (c) tidak ada recovery restart.
- Diagram flow: `prototypes/rmq-outbox-flow.html` (journey user vs outbox + sweeper recovery). Fix kontras (hardcode palet gelap, drop var tema).
- Change Intake Brief (Phase 0): `Assessments/cross-domain/rmq-durable-outbound-queue/rmq-durable-outbound-queue-change-intake-brief.md`.

## Klasifikasi
- Change class: BEHAVIOR_CHANGE, cross-domain (infra RMQ).
- Routing: SPLIT_REQUEST + HOLD_NEEDS_DISCOVERY.
  - Split A quick-win: queue `durable` + message `persistent` (deliveryMode=2) + publisher confirms.
  - Split B full: outbox collection + atomic claim + ack-terakhir + sweeper.
- Belum bisa ke PRD — perlu verifikasi config RMQ aktual (OQ-01..05 di brief).

- PRD (draft, discovery embedded): `PRD/infra/prd-rmq-durable-outbound-queue.md`. Status DRAFT—DISCOVERY (belum frozen). §5 = 16 discovery question (DQ-01..16) untuk Naftal Yunior, dikelompokkan: config RMQ aktual, lokasi/transaksi outbox, idempotency/semantik, skala/kalibrasi, interaksi behavior existing.

## Next
- BE jawab §5 DQ-01..16. Blocking utama: DQ-01/02 (durable? deliveryMode=2?), DQ-03 (autoDelete/exclusive?), DQ-10 (double-send vs loss?).
- Setelah discovery → freeze §6 functional (mungkin cukup Split A quick-win), lanjut QA pre-impl review.
