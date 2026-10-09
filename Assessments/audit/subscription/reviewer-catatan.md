# Reviewer Catatan — Review Dua Laporan Subscription (eksternal + internal)

> Reviewer independen, 2026-10-06. Task: deep research subscription platform lain + review subscription SatuInbox.

## Spot-check akurasi (13 klaim, semua lulus)

### Internal (file:baris diverifikasi)
1. F-01: `PRD Prepaid Billing...md:86-87` (US-012 deduct saat delivered, US-013 blokir saat estimasi > saldo), `:138` (FR-014 saldo ≥ 0), `:146-147` (FR-022/023) — cocok, race check-vs-deduct memang nyata di spek.
2. F-04: `:132` (FR-008 invoice arrears, generate 00:00 WIB tgl 1 utk periode SEBELUMNYA) vs `PRD Billing Voucher Engine.md:54` (US-022), `:67` (FR-037/038), `:100` (EC-020 "invoice already exists for current period") — kontradiksi arrears-vs-current-invoice terkonfirmasi.
3. F-05: `PRD Billing - Referral...md:78` (US-004 "my subscription end date is extended") vs model prepaid tanpa end date (`:131` FR-007) — terkonfirmasi. `:162-163` (referrerRewardMonths/refereeRewardMonths) cocok.
4. F-07: `Feature List/satuinbox-feature-list.md:466-470` (create/cancel/manual expire/auto-renewal/downgrade) tanpa definisi di PRD manapun — terkonfirmasi.
5. F-02/F-12: `Memory/global-memory.md:374` persis mencatat AUTH-12 topup double-credit `wallet.service.ts:459-498`, webhook static-secret bukan HMAC, quota carry-over/reset, no free trial — terkonfirmasi.
6. F-06/F-08: brief superadmin v1.4 `:31` (subscription = determinant feature access), `:171` (OQ-03 blocking), `:11` (Status: Hold), `:19-23` (persisted propagation) — terkonfirmasi.
7. F-03: `PRD Billing - Referral...md:99` (FR-030 merujuk "grace period rules" yang tidak ada di PRD Prepaid) — terkonfirmasi. `gtm brief:79` (subscription.schema.ts `companyId, packageId, status`) cocok.

### Eksternal (sumber resmi diverifikasi via web_extract/search)
8. Freshdesk (freshworks.com/freshdesk/pricing): $19/$55/$89 annual, 500 session gratis sekali/akun, $49/100 session, day pass $2/$7/$12, Copilot $29/agent, connector $80/5k, MCP $15/1k, window 72 jam, "trial 14 hari full Enterprise, akun disuspend" (FAQ halaman) — semua cocok.
9. Gupshup (gupshup.io/pricing): $0.001/msg, Marketing 0.0118 / Utility 0.0014 / Auth 0.0014 (Intl 0.0304) / Service 0.0014 (1.000 pertama bebas), CTWA 7 hari $0, markup $0,000708, media >64KB free, PMP live Juli 2025 + Service mulai ditagih 1 Okt 2026 — semua cocok.
10. Intercom: monthly $39/$99/$139, annual $29/$85/$132, Fin $0,99/outcome — cocok (intercom.com + learning-center + 3 tracker pihak ketiga konsisten).
11. 360dialog (docs.360dialog.com): Regular €49 ($59)/nomor/bulan, Meta at actuals, EUR/USD/INR — cocok. Catatan: docs kini juga punya Premium €99 & Higher Throughput €249 (laporan menandai tier "tidak diverifikasi" — jujur, bukan salah).
12. Wati (wati.io/pricing page asli): Growth $59 (annual)/$69 monthly, 1 channel, 3 user tanpa tambahan; Pro $119, 5 user + $39/user/bln; Business $279, 5 user + $89/user/bln — cocok. (3rd-party Chatarmin/Chatmitra menyebut $24/$69 utk user tambahan — usang; angka laporan = halaman resmi.)
13. Zendesk/Intercom lifecycle claims (upgrade prorated, downgrade akhir periode, Intercom notice 30 hari) — konsisten dgn kutipan help-center yang dicantumkan; tidak semua dibuka ulang, tapi tidak ada tanda karangan.

## Kriteria lain
- (b) Data karangan: nihil. Laporan eksternal konsisten menandai "tidak diverifikasi"/[snippet]/[3rd-party]; Qontak (kontradiksi Rp2jt vs Rp600rb) ditandai eksplisit. Laporan internal tidak memuat angka harga/test hasil karangan.
- (c) Coverage: eksternal punya tabel per-platform (9 platform), tabel cross-platform, pola (§3-5), insight (§10 poin). Internal punya lifecycle state table, 16 findings berseverity (2C/6H/6M/2L — konsisten dgn exec summary), placeholder table, OQ, rekomendasi berprioritas.
- (d) REVISE_PRD: justified (F-01/F-02 jalur uang, F-03 dunning gap, F-04/05 kontrak antar-PRD) dan memakai taxonomy yang benar; opsi SPLIT_FEATURE/HOLD_FEATURE tidak cocok untuk kasus gap lifecycle ini.
- (e) Konsistensi antar laporan: "no free trial = outlier" (eksternal) selaras dgn "deviasi penuh dari kompetitor" (internal/memory); insight #7 eksternal merujuk AUTH-12 topup double-credit yang jadi F-02 internal; formula prorata eksternal = formula PRD. Tidak ada kontradiksi.

## Catatan kecil (tidak blocking)
- Situs qontak.com/pricing & 360dialog.com/pricing sulit diekstrak otomatis (403 keyless) — sama dgn kendala riset yang didokumentasikan di Limitasi; status verifikasi yang ditulis worker tetap akurat.
- Minor: kutipan internal `Feature List:466-471` seharusnya `:466-470` (baris 471 = "Billing cycle dan upcoming bill") — trivial.

**Verdict: PASS**
