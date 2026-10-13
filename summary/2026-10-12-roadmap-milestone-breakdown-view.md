# Roadmap Milestone & Breakdown View — HTML presentation (2026-10-12)

**Jenis tugas:** Analisis + prototype HTML (QA Browser roadmap data → milestone presentation)
**Kategori:** Data analysis + standalone HTML deliverable (bukan product-behavior change SatuInbox)
**Files changed:** `presentation/roadmap-milestone-breakdown.html` (baru, ~945 KB self-contained)
**Data sources:** `Assessments/audit/00-Timeline/.roadmap-seed.json` (roadmap QA Browser, 95 task) + OpenProject project 7 SatuInbox versi `prod-2.8.3` (59 WP)
**Author:** Dany Christian
**Date:** 2026-10-12

---

## Objective

Mengambil semua task dari roadmap QA Browser dan OpenProject, menurunkan kandidat
milestone, memetakan task mana yang merupakan breakdown dari tiap milestone, lalu
menyajikannya sebagai view HTML presentation-ready: milestone-first, klik milestone →
breakdown muncul, dengan title/description/metric/status/assignee/prio visible serta
progress + statistik dari task yang terlihat.

## Deliverables

| Deliverable | Status | Lokasi |
|---|---|---|
| Milestone & breakdown view (HTML interaktif) | ✅ | `presentation/roadmap-milestone-breakdown.html` |
| Assessment kandidat milestone (tertanam di view, panel Metodologi) | ✅ | idem, `<details class="method">` |
| Verdict 9 task OP bertipe "Milestone" | ✅ | idem, tabel verdict |

## Hasil analisis ringkas

- Merge: 95 task roadmap + 59 WP OP v2.8.3 → **95 baris unik** (59 task roadmap ter-link ke WP v2.8.3 via `opId`; 36 task roadmap belum punya WP di versi ini).
- **17 bucket milestone** aktif (SAP/Lincah = 0 task di v2.8.3 → dihide): 14 primer + 3 supporting. Milestone totals table di paling atas menunjukkan per-milestone aggregate.
- Sinyal penurunan: seri fase eksplisit, dependency hub roadmap (t01/t04/t07/t13/t16/t18/t23/t28), siklus rilis OP (v2.2.1/v2.2.2/v2.3.0/v2.8.x), klaster keyword + fallback per tipe (Bug → Stabilization).
- 9 WP OP bertipe "Milestone" dinilai ulang: hanya rilis (v2.2.1/2.2.2/2.3.0) + "Security Proven" yang layak milestone; MUV, daily task, research, demo = salah tipe → masuk bucket temanya.

## Verification

- Smoke test via browser (Playwright Chromium + CDP 9222): render 18 kartu milestone, 6 stats tile, 9 verdict, 10 dependency chain, 399 baris visible default (tanpa closed).
- Interaksi terverifikasi: klik milestone → breakdown terfilter (17 task Open API, status=all → 40), search "webhook" → 7 baris, reset → 1.539 baris / 18 group, expand deskripsi, sort kolom progress.

## Catatan / follow-up

- Pengelompokan non-roadmap bersifat heuristik keyword + fallback; badge `asal pengelompokan` ada di tooltip tiap baris untuk audit.
- Integrasi ke `Test/testcase-browser.html` (RoadmapPage) belum dilakukan — file ini standalone presentation view.
