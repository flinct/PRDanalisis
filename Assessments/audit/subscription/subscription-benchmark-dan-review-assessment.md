# Assessment Report — Subscription Benchmark Platform Lain & Review Subscription SatuInbox

> **Artifact Type:** Assessment Report (decision-bearing, permanen)
> **Version:** v1.0
> **Status:** Final
> **Tanggal:** 2026-10-06 (Asia/Jakarta)
> **Author/Owner:** Dany Christian / Analyst
> **Scope:** (a) benchmark model subscription platform lain (omnichannel CS + CPaaS), (b) review internal subscription/billing SatuInbox.
> **Detail reports (source of detail, jangan duplikasi):**
> - `Assessments/audit/subscription/worker-eksternal-riset-platform-lain.md` (9 platform, semua klaim ber-URL)
> - `Assessments/audit/subscription/worker-internal-review-satuinbox.md` (16 findings F-01..F-16, semua cite file:baris)
> - `Assessments/audit/subscription/reviewer-catatan.md` (13 spot-check reviewer — PASS)
>
> **Change History**
> | Version | Date | Change |
> |---|---|---|
> | v1.0 | 2026-10-06 | Versi awal: synthesis benchmark eksternal + review internal, decision REVISE_PRD. Reviewer gate PASS (putaran 1). |

---

## Executive Summary

- **Model SatuInbox saat ini:** hybrid — recurring plan bulanan (cycle 1–akhir bulan, invoice **in-arrears** terbit tgl 1, prorata upgrade, downgrade efektif tgl 1) + prepaid token wallet (1 token = Rp 1) khusus broadcast. Core inbox tetap jalan saat token habis.
- **Posisi vs pasar:** arah hybrid per-agent + kuota + WA per-message **sejalan tren pasar 2025-2026** (Intercom/Zendesk/Wati semua hybrid). Tapi tiga deviasi: (1) **no free trial + manual approval** — semua 6 kompetitor CS punya trial; (2) **feature gate per paket tidak ada** — pasar menjual tier via feature matrix, SatuInbox hanya limit kuantitatif; (3) **proration formula sudah standar pasar tapi tidak dipublikasikan** sebagai kebijakan.
- **Risiko utama (jalur uang):** F-01 race send-vs-deduct token broadcast, F-02 topup webhook double-credit (code-verified) — keduanya Critical.
- **Gap lifecycle terbesar:** cancel/manual-expire/auto-renewal/dunning/grace/suspend disebut di feature list & brief tapi **tanpa definisi** (F-03, F-07) — padahal brief superadmin v1.4 menjadikan subscription access determinant.
- **Decision: `REVISE_PRD`** — PRD Prepaid Billing perlu addendum: lifecycle state table, dunning/grace, resolution race token, kontrak antar-PRD (arrears vs voucher "current invoice", "free month" referral).

---

## Posisi Model di Pasar (diagram)

```
                    ┌────────────────────────────────────────────────────────────┐
   Pricing axis     │  Pure seat        Hybrid seat+usage     Pure usage         │
                    │  ─────────────    ──────────────────    ─────────────      │
                    │  Zendesk*         Intercom  (seat+      Twilio             │
                    │  Freshdesk*       outcome AI)           360dialog (per nbr)│
                    │                   Wati (flat+bundle+    Gupshup            │
                    │                   quota+WA)                                │
                    │                   Qontak/Qiscus (suite+ ─────────────────  │
                    │                   agent+balance+WA)                         │
                    │                   ★ SATUINBOX (plan+quota+prepaid token)    │
                    └────────────────────────────────────────────────────────────┘
   * = tetap punya komponen usage (AI add-on / day pass)

   Lifecycle standar pasar (Intercom/Zendesk/Freshdesk konsisten):
   upgrade = langsung + prorata  │  downgrade/cancel = akhir periode + CREDIT (bukan refund)
   auto-renewal + notice 30 hari (kontrak)  │  trial universal (14 hari umum)

   SatuInbox vs standar:
   ✅ upgrade prorata, downgrade tgl 1 (= "efektif akhir periode") — COCOK
   ✅ quota broadcast reset bulanan + carry-over channel/agent — LANGKA (kebanyakan quota hangus)
   ⚠  no trial + manual approval — OUTLIER (tidak ada padanan di 9 kompetitor)
   ❌ dunning/grace/suspend/cancel/auto-renewal — TIDAK DIDEFINISIKAN (kompetitor semua punya)
   ❌ feature gate per tier — TIDAK ADA (kompetitor jual tier via feature matrix)
```

---

## Gap SatuInbox vs Standar Pasar (mapping temuan internal ke benchmark)

| # | Temuan internal | Severity | Standar pasar (dari riset eksternal) | Rekomendasi |
|---|---|---|---|---|
| 1 | F-01 race send-vs-deduct token broadcast | Critical | Prepaid wallet (Qontak balance, Wati credits) memotong saat konsumsi dengan idempotent ledger | Reserve estimasi saat approve → deduct aktual on-delivery → release sisa; idempotency key per pesan |
| 2 | F-02 topup webhook double-credit | Critical | Standar webhook payment = HMAC + idempotent credit | P0: idempotency key per event id; sekalian migrasi HMAC (F-12) |
| 3 | F-03 dunning/grace/suspend absen | High | Intercom notice 30 hari; Freshdesk suspend akhir trial; semua vendor punya jalur suspend | Addendum: `active → past_due(+N) → suspended(+M) → terminated` + dunning schedule |
| 4 | F-04 arrears invoice vs voucher "current invoice" | High | — (kontrak internal) | Kunci model arrears; voucher terapkan ke kalkulasi periode berjalan |
| 5 | F-05 "free month" referral vs tanpa end date | High | Market = credit ke invoice berikutnya (Intercom downgrade credit) | Free month = line-item kredit invoice ber-periode |
| 6 | F-06 feature gate per paket tidak ada | High | Semua kompetitor gate fitur per tier (Zendesk/Freshdesk/Intercom matrix) | Tabel `plan → features[]` + resolver `entitlement ∩ owner ceiling ∩ role` |
| 7 | F-07 cancel/expire/auto-renewal tanpa spesifikasi | High | Cancel akhir periode self-service (Intercom/Freshdesk); auto-renewal + notice (Intercom) | Tabel transisi lifecycle; cancel = akhir periode + kebijakan sisa token |
| 8 | F-08 timing downgrade superAdmin vs FR-013 | High | — (kontrak internal) | Segera + credit prorata, ATAU tgl 1 + suspend untuk abuse |
| 9 | Trial tidak ada | (audit Track K) | Universal 14 hari full-feature (Freshdesk Enterprise) | Minimal trial 14 hari; pertimbangkan day-pass pattern (Freshdesk $2-12) untuk agent musiman |
| 10 | F-10 PPN taxable items tidak didefinisikan | Medium | — (lokal, compliance ID) | Tabel line item → PPN Y/N; aturan PPN × voucher |

---

## Decision

| Field | Value |
|---|---|
| Decision | **REVISE_PRD** |
| Rationale | 2 Critical di jalur uang (F-01, F-02) + lifecycle contract tidak matang (F-03, F-07) + kontrak antar-PRD rusak (F-04, F-05) |
| Impact | Billing belum layak diandalkan untuk revenue penuh; enforcement fitur per tier mustahil konsisten |
| Risks | Revenue leakage, invariant saldo ≥ 0 rusak, dispute invoice, entitlement inkonsisten |
| Mitigations | P0: F-01/F-02/F-12 (jalur uang + webhook); P1: addendum lifecycle + dunning + F-04/F-05; P2: feature gate matrix + trial + pajak |
| Regression scope | payment-service (subscription, invoice, wallet, voucher), broadcast costing, superAdmin access resolver |
| Ownership | PM (Dany Christian) untuk keputusan PRD; Engineering Lead (Naftal Yunior) untuk F-01/F-02/F-12 |
| Next safe action | Addendum PRD Prepaid Billing (Patch_Addendum mode) — Phase 0 change intake brief dulu |

## Open Questions (dibawa ke addendum)
1. Kebijakan sisa token saat cancel/expire: hangus, refund, atau credit?
2. Apakah "auto-renewal" = VA auto-debit toggle atau sekadar penyebutan lain invoice otomatis?
3. Durasi & batasan trial (usulan: 14 hari full-feature, tanpa kartu).
4. Taxable-ness top-up token untuk PPN.
