# Summary — 2026-09-15 — Inbound Message Outbound Webhook (Salfok verification)

## Task
User minta analisa + PRD untuk flow webhook: partner e-com (Salfok) pakai nomor WA SatuInbox sebagai kanal verifikasi. User kirim kode (yang ditampilkan Salfok) via WA → SatuInbox terima inbound → push webhook `{nomor, content}` ke Salfok → Salfok validasi sendiri. Satu arah, tidak ada jalur balik.

## Analisa (2 putaran)
- Awal: dikira 2 mekanisme (webhook + API balik) + risiko ToS OTP via WA Web.
- Koreksi user: hanya 1 arah, kode digenerate partner & diforward user, SatuInbox cuma relay inbound. Risiko ToS gugur.
- Core gap tetap: SatuInbox **belum punya outbound webhook engine** (semua webhook existing = inbound Meta/WA). Ini NEW_CAPABILITY.

## Artefak dibuat
1. Phase 0 brief: `Assessments/cross-domain/inbound-message-outbound-webhook/inbound-message-outbound-webhook-change-intake-brief.md` (v1.0, Ready for PRD, 6 OQ default ASSUMED)
2. PRD: `PRD/Platform/PRD Platform - Inbound Message Outbound Webhook.md` (v1.0 Draft, full sections)
3. Summary ini.

## Keputusan default (ASSUMED, PM boleh koreksi)
- Trigger scope: `customer_inbound` only. Payload: `{phone, content, timestamp, messageId, accountChannelId, companyId, event}`. Retry: 10s timeout, 5x exp backoff, at-least-once + idempotency `messageId`. Suppress inbox opsional. Nomor ASSUMED dedicated.

## Grounding teknis
- Reuse pola `Assessments/cross-domain/rmq-durable-outbound-queue` (DB source-of-truth + sweeper + idempotency) untuk delivery guarantee.
- Emisi async fire-and-forget via RMQ — zero-perf constraint pada inbound hot path (NFR-001/002).
- Security: HMAC-SHA256 signature + timestamp anti-replay + anti-SSRF at-send.

## Blocking untuk PM
- OQ-05: nomor dedicated vs shared dengan CS? (jika shared → OQ-04 suppress jadi blocking + SLA T1 pollution).
- Konfirmasi Salfok: payload + endpoint + signature contract.

## Next
- Reviewer Gate (analysis-and-risk) belum dijalankan. QA pre-implementation review belum. PRD masih Draft — belum freeze.
