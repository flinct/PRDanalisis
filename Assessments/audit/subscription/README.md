# Subscription — Benchmark & Review (2026-10-06)

> **Class:** decision-bearing Assessment Report + findings track **belum folded** (jangan ticket sebelum dedup + keputusan PM).
> **Decision:** `REVISE_PRD` — PRD Prepaid Billing perlu Patch_Addendum (lifecycle, dunning, race token, kontrak antar-PRD).

## Indexed files (baca urut)

| # | File | Isi |
|---|---|---|
| 1 | `subscription-benchmark-dan-review-assessment.md` | **Mulai dari sini.** Assessment Report final v1.0: synthesis benchmark eksternal vs review internal, mapping gap, decision + next action. |
| 2 | `worker-eksternal-riset-platform-lain.md` | Deep research 9 platform (Qontak, Qiscus, Wati, Intercom, Zendesk, Freshdesk, Twilio, 360dialog, Gupshup) — tabel perbandingan, pola, tren, semua klaim ber-URL. |
| 3 | `worker-internal-review-satuinbox.md` | Review internal subscription SatuInbox — 16 findings `F-01..F-16` (2 Critical/6 High/6 Medium/2 Low), semua cite `file:baris`, lifecycle state table. |
| 4 | `reviewer-catatan.md` | 13 spot-check reviewer (PASS putaran 1). |

## Top risks

- **F-01 [Critical]** race send-vs-deduct token broadcast → revenue leakage / saldo negatif.
- **F-02 [Critical]** topup webhook double-credit (code-verified, = `AUTH-12` di register).
- **F-03 [High]** dunning/grace/suspend tidak didefinisikan → tenant bisa pakai tanpa bayar.
- **F-06/F-07 [High]** feature gate per paket & lifecycle cancel/expire/auto-renewal nol spesifikasi.

## Overlap dengan register (dedup sebelum fold/ticket)

- `F-02` ≈ register `AUTH-12` (temuan sama, code-verified).
- `F-12` (webhook static-secret) ≈ Track K `AUTH` webhook finding.
- No-trial outlier ≈ Track K shadow-domain note (`AUTH-01`).
- Findings `F-01..F-16` **belum** punya ID register — fold = tugas terpisah, butuh keputusan PM (per rule: jangan fold unprompted).
