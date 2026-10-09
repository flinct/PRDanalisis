# Assessment Report — Review Internal Subscription SatuInbox

> **Artifact Type:** Assessment Report (Analyzer — internal review, konteks repo)
> **Scope:** Model bisnis subscription/billing SatuInbox (PRD Subscription + Feature List + brief terkait)
> **Version:** v1.0
> **Tanggal:** 2026-10-06 (Asia/Jakarta)
> **Author (per konvensi repo):** Dany Christian / Analyst
> **Sumber wajib dibaca:**
> - `PRD/Subscription/PRD Prepaid Billing and Subscription.md`
> - `PRD/Subscription/PRD Billing Voucher Engine.md`
> - `PRD/Subscription/PRD Billing - Referral Subscription Program.md`
> - `Feature List/satuinbox-feature-list.md` (bagian 22, 23, 25)
> - `Assessments/Analytics/gtm-marketing-dashboard/gtm-marketing-dashboard-change-intake-brief.md`
> - `Assessments/auth/superadmin-global-company-access/versions/superadmin-global-company-access-change-intake-brief-v1.4.md`
> - `Memory/global-memory.md` (konteks audit code-verified, baris 374)

---

## Executive Summary

- **System understanding:** SatuInbox memakai **model hybrid**: (a) recurring subscription bulanan (base plan + addon channel/agent/retensi) dengan billing cycle tetap 1 s/d akhir bulan dan prorata untuk upgrade mid-cycle, ditambah (b) **prepaid token wallet** (1 token = Rp 1) khusus broadcast. Core inbox tetap jalan walau token habis; hanya broadcast yang diblokir.
- **Main risks:** race check-saldo-vs-deduct pada broadcast token (revenue leakage / pelanggaran invariant saldo ≥ 0), tidak ada dunning/grace/suspension untuk invoice tak berbayar, kontrak lifecycle subscription (cancel/expire/auto-renewal) nyaris tak didefinisikan padahal dijadikan access determinant oleh brief superadmin, dan beberapa kontradiksi antar dokumen (arrears invoice vs voucher "current invoice", subscription tanpa end date vs "extension reward").
- **Finding counts:** 16 findings — Critical: 2, High: 6, Medium: 6, Low: 2. Kategori dominan: REQUIREMENT GAP (6), DEFECT/RISK (4), INCONSISTENCY (4), DESIGN FLAW (2).
- **Critical/High findings:** F-01 send-vs-deduct race, F-02 topup webhook double-credit (code-verified), F-03 dunning/grace/suspend absen, F-04 kontradiksi arrears-vs-current-invoice, F-05 kontradiksi model periode vs subscription end date, F-06 feature gate per paket tidak ada, F-07 lifecycle cancel/expire/auto-renewal tidak didefinisikan, F-08 timing downgrade superadmin vs FR-013.
- **Overall assessment:** Model bisnis secara konsep sudah koheren (hybrid prepaid-token + recurring plan), tapi kontrak lifecycle & failure-mode billing belum matang untuk go-live finansial. Banyak perilaku kritis digantung ke "finance policy" eksternal atau placeholder.
- **Decision: `REVISE_PRD`** — PRD Prepaid Billing perlu addendum/patch untuk lifecycle state, dunning, dan resolution race token sebelum implementasi billing diandalkan untuk revenue.

---

## System Model

### Actors
- **Admin/Owner tenant** — pilih paket/addon, top up token, redeem voucher, bayar invoice.
- **Finance user** — verifikasi bank transfer manual, lihat invoice (`PRD Prepaid Billing...md:160`).
- **Corporate Admin** — usage analytics & laporan penggunaan (`PRD Prepaid Billing...md:99-104`).
- **Agent** — konsumen broadcast-notice; inbox tetap berfungsi saat token habis (`PRD Prepaid Billing...md:113-117`).
- **SuperAdmin internal** — konfigurasi harga, ambang low-credit, reward referral (`PRD Prepaid Billing...md:149`, `PRD Billing - Referral...md:80`).
- **Sistem/payment-service** — generator invoice 00:00 WIB, email invoice 09:00 WIB, worker reward referral, webhook Apibayar.

### Components
- `payment-service`: Subscription, invoice, wallet, voucher, quota, auto-renewal (`Feature List/satuinbox-feature-list.md:517`).
- `apps/payment-service/src/app/schemas/subscription.schema.ts` — schema nyata: `companyId, packageId, status` (`Assessments/Analytics/gtm-marketing-dashboard/gtm-marketing-dashboard-change-intake-brief.md:79`).
- Apibayar + kanal bank (VA / Bank Transfer) (`PRD Prepaid Billing...md:281`).
- Meta pricing table (manual) untuk WhatsApp API (`PRD Prepaid Billing...md:282`, `:310`).

### Data & Source of Truth
| Entitas | Source of truth | Catatan |
|---|---|---|
| Subscription doc | payment-service (`subscription.schema.ts`) | Field nyata hanya `companyId, packageId, status` (gtm brief:79) — jauh lebih tipis dari kebutuhan PRD (addon, prorata, voucher state) |
| Token balance | payment-service wallet | Integer, 1 token = Rp 1, wajib tidak negatif (`PRD Prepaid Billing...md:138`) |
| Invoice | payment-service | Nomor `INV-YYYYMM-XXXXX`, status enum (`PRD Prepaid Billing...md:259-261`) |
| Voucher usage | billing logs + invoice line (`PRD Billing Voucher Engine.md:66`) |
| Reward ledger referral | payment-service, immutable preferred (`PRD Billing - Referral...md:288`) |

### Main Workflows
1. **Onboarding:** pilih paket → addon → top up token awal (min Rp 100.000) → bayar invoice pertama → tenant aktif (`PRD Prepaid Billing...md:65-69`).
2. **Billing cycle:** periode 1–akhir bulan; invoice periode N digenerate 00:00 WIB tgl 1 bulan N+1; email + PDF 09:00 WIB; jatuh tempo +14 hari (`PRD Prepaid Billing...md:131-133`, `:389-396`).
3. **Mid-cycle change:** upgrade addon/plan = efek segera + prorata `(hari tersisa / hari dalam bulan) × harga bulanan`; downgrade = dijadwalkan efektif tgl 1 bulan depan (`PRD Prepaid Billing...md:75-78`, `:390-392`).
4. **Broadcast costing:** estimasi biaya dicek saat send/schedule; token dipotong per pesan **berstatus sukses terkirim/delivered** (`PRD Prepaid Billing...md:86-87`).
5. **Voucher:** preview benefit → apply satu langkah ("Gunakan") → diskon invoice dan/atau kredit token (`PRD Billing Voucher Engine.md:53-54`, `:66-67`).
6. **Referral:** kode dipakai saat register/onboarding → case terikat approval company → reward free-subscription (referee) + extension (referrer) via payment-service (`PRD Billing - Referral...md:75-81`, `:238-244`).

### State Machines
- **Referral case:** `code_used → onboarding_in_progress → waiting_review → approved|rejected → reward_granted|reward_failed` (`PRD Billing - Referral...md:238-244`) — paling lengkap dari semua lifecycle di domain ini.
- **Invoice:** enum `Draft, Terbit, Lunas, Jatuh tempo, Overdue, Dibatalkan` (`PRD Prepaid Billing...md:259`) — transisi TIDAK didefinisikan.
- **Subscription:** lihat tabel di bawah — sebagian besar status/transisi **belum didefinisikan**.

---

## Lifecycle State Subscription (Status + Transisi)

Kolom "Sumber" = bukti definisi ada; status tanpa sumber = **gap** (disebut di feature list/brief tapi tidak punya definisi perilaku).

| Status | Definisi | Transisi masuk | Transisi keluar | Sumber | Catatan |
|---|---|---|---|---|---|
| `inactive` (pra-aktif) | Tenant baru belum boleh pakai inbox/broadcast | Registrasi/onboarding | → `active` setelah invoice pertama lunas penuh | `PRD Prepaid Billing...md:127` (FR-003), `:69` (US-005) | Payment gagal = config disimpan sebagai draft, tenant tetap inactive (`:166`, EH-001) |
| `active` | Semua fitur terkonfigurasi aktif, token dikredit | Pembayaran pertama confirmed | → downgrade-scheduled / (cancel? expire? — gap) | `PRD Prepaid Billing...md:69` | Tidak ada field masa berlaku/end date |
| `downgrade_scheduled` (state implisit) | Konfigurasi lama berlaku s/d akhir periode; level baru antri | Request downgrade plan/addon | → apply otomatis tgl 1 periode berikut | `PRD Prepaid Billing...md:76`, `:137` (FR-013), `:197` (EC-003) | Tidak ada nama status resmi; tidak didefinisikan apakah bisa dibatalkan |
| `cancelled` | — | Feature list menyebut "Subscription cancel" | — | `Feature List/satuinbox-feature-list.md:467` **tanpa definisi** | GAP: trigger, actor, efek kuota/token/invoice tidak didefinisikan |
| `expired` / `manual_expire` | — | Feature list menyebut "Manual expire subscription" | — | `Feature List/satuinbox-feature-list.md:468` **tanpa definisi** | GAP: siapa yang boleh, efek akses, retensi data |
| `auto_renewal` (mode?) | — | Feature list menyebut "Auto-renewal" | — | `Feature List/satuinbox-feature-list.md:469` **tanpa definisi** | GAP/INCONSISTENCY: bertabrakan dgn model invoice bulanan otomatis tanpa "renewal" eksplisit (`PRD Prepaid Billing...md:132`) |
| `grace` | — | Referral PRD merujuk "grace period rules" existing | — | `PRD Billing - Referral...md:99` (FR-030) | **INCONSISTENCY:** rules yang dirujuk TIDAK ADA di PRD Prepaid Billing |
| `suspended` / `reactivated` | — | Disebut sebagai bagian "semua aspek subscription" superAdmin | — | `Assessments/auth/superadmin-global-company-access/versions/...-v1.4.md:171` (OQ-03) | GAP: definisi & transisi belum ada; OQ masih blocking |
| Field `status` runtime | Ada di schema nyata | — | — | `Assessments/Analytics/gtm-marketing-dashboard/...-brief.md:79` | Nilai enum aktual = **Unknown** (tidak terekspos di dokumen manapun) |

**Lifecycle tambahan yang sudah jelas (bukan status subscription tapi mempengaruhinya):**
- Upgrade mid-cycle: efek segera + prorata (`PRD Prepaid Billing...md:136`).
- Onboarding approval gate terpisah: `onboarding → waiting_approval → approved/rejected` + manual admin approval (`Memory/global-memory.md:374`) — **dua gate** (approval KYC + pembayaran) untuk `active`, keduanya harus dipenuhi.
- Voucher eligibility void: pindah ke plan non-eligible membatalkan benefit subscription bulan-bulan berikutnya (`PRD Billing Voucher Engine.md:69` FR-045).

---

## Traceability (ringkas)

| Requirement | Business Rule | Flow | Component | Bukti impl/test |
|---|---|---|---|---|
| FR-007/FR-008 (`PRD Prepaid...:131-132`) | Cycle 1–akhir bulan, invoice 00:00 WIB tgl 1 | Billing cycle | payment-service | Kontradiksi dgn Voucher EC-020 → F-04 |
| FR-014 (`:138`) | Saldo token ≥ 0 | Token ledger | wallet | Dilanggar oleh race F-01 saat deduct |
| FR-022/FR-023 (`:146-147`) | Blokir saat estimasi > saldo; deduct saat delivered | Broadcast costing | broadcast + payment | TOCTOU → F-01 |
| FR-012/FR-013 (`:136-137`) | Upgrade segera, downgrade tgl 1 | Plan lifecycle | payment-service | Kontradiksi timing dgn superadmin brief → F-08 |
| FR-034–FR-050 (Voucher) | Single voucher, idempotent, non-negative total | Voucher | payment-service | Konsisten internal; gap pajak → F-10 |
| FR-016–FR-021 (Referral) | Reward via payment-service + ledger | Reward grant | payment-service | Asumsi end date → F-05 |
| Test scenario | **Tidak ditemukan test billing/subscription di repo PRDanalisis** | — | — | Traceability ke test = GAP (profile SatuInbox: traceability non-bypassable) |

---

## Findings

### F-01 [Critical] [DEFECT/RISK] Race check-saldo-vs-deduct pada broadcast token (send-vs-deduct)
**Status:** Confirmed (dari spesifikasi; sequence eksak di bawah)
**Location:** Broadcast costing & token ledger (`PRD/Subscription/PRD Prepaid Billing and Subscription.md:86-87`, `:138`, `:146-147`)
**Scenario:** Saldo 200 token. Admin menjadwalkan 2 broadcast masing-masing estimasi 200 token pada detik yang sama. Keduanya lolos cek FR-023 (cek dilakukan "at the time of send" per broadcast), keduanya terkirim. Delivery callback lalu memicu deduct 200 + 200 = 400 > saldo 200.
**Expected:** FR-014 (`:138`) — token balance MUST NOT go below zero; FR-023 (`:147`) — blokir broadcast yang estimasinya melebihi saldo.
**Actual / Failure Mode:** Sistem terjepit dua pilihan: (a) deduct tetap jalan → saldo negatif (melanggar FR-014), atau (b) deduct gagal/parsial → pesan terkirim tanpa bayar = **revenue leakage**. PRD tidak mendefinisikan perilaku saat deduct on-delivery melebihi saldo. Tambahan: deduct hanya untuk status "sent/delivered" (`:146`) — delivery receipt yang telat/tidak datang membuat pesan terkirim tanpa deduct sama sekali.
**Root Cause:** Pengecekan saldo (pre-send, estimasi) dan pemotongan (post-delivery, aktual) tidak atomik; tidak ada hold/reservation saldo saat broadcast diizinkan kirim.
**Impact:** Kerugian finansial langsung dan/atau pelanggaran invariant saldo ≥ 0 (SM-002 target 0 insiden `:290`).
**Blast Radius:** Semua tenant aktif berkirim broadcast paralel; token ledger; invoice/usage report.
**Recommendation:** Introduksi saldo hold/reservation saat broadcast di-approve (reserve estimasi → deduct aktual saat delivery → release sisa hold), atau deduct berdasarkan estimasi saat send dengan rekonsiliasi on-delivery. Wajib atomic operation/idempotency key per pesan (serupa NFR-002 `:270`).
**Suggested Test:** 2 broadcast simultan dengan total estimasi > saldo; assert tidak pernah ada balance < 0 dan setiap pesan delivered tercatat exactly-once di token usage log.

### F-02 [Critical] [DEFECT] Topup webhook double-credit (money path) — code-verified
**Status:** Confirmed (hasil audit code-verified, bukan asumsi)
**Location:** `wallet.service.ts:459-498` (BE `omnichannel-satuinbox-be` v2.7.0) via `Memory/global-memory.md:374` (register audit `Assessments/audit/01-audit-master-register.md` Track K / AUTH-12)
**Scenario:** Webhook notifikasi top-up dari payment provider diproses dua kali (retry provider / replay).
**Expected:** NFR-002 (`PRD Prepaid Billing...md:270`) — top up processing MUST idempotent, tanpa double-charge/double-credit.
**Actual / Failure Mode:** Audit register mencatat **AUTH-12 topup webhook double-credit** pada jalur uang (`wallet.service.ts:459-498`) — tenant bisa menerima kredit token dua kali untuk satu pembayaran.
**Root Cause:** Tidak ada idempotency key / dedupe per event webhook di handler top-up (sebutan di `Memory/global-memory.md:374`).
**Impact:** Kerugian finansial langsung (token = Rp 1 per unit, `:138`).
**Blast Radius:** Wallet semua tenant; reconciliation finance; invoice/usage report.
**Recommendation:** Unique constraint idempotency key per event id webhook + verifikasi state sebelum credit (sudah dikredit = return sukses tanpa mutasi). Jalur prioritas P0 sebelum billing dipakai produksi penuh.
**Suggested Test:** Replay webhook top-up yang sama 2× → saldo naik tepat sekali (sesuai NFR-102 voucher `PRD Billing Voucher Engine.md:130` yang sudah menuntut pola ini).

### F-03 [High] [REQUIREMENT GAP] Dunning, grace period, suspend, dan konsekuensi invoice tak berbayar tidak didefinisikan
**Status:** Confirmed (gap)
**Location:** `PRD Prepaid Billing...md:167` (EH-002), `:259` (status "Overdue"), `:151` (FR-027), `PRD Billing - Referral...md:99` (FR-030)
**Scenario:** Invoice bulanan jatuh tempo +14 hari (`:396`) tidak dibayar berbulan-bulan.
**Expected:** Ada aturan: reminder jatuh tempo → grace period → suspend fitur/company → terminasi. FR-030 Referral (`PRD Billing - Referral...md:99`) secara eksplisit merujuk "existing subscription expiry, grace period, invoice, dan entitlement rules".
**Actual / Failure Mode:** PRD Prepaid Billing hanya punya EH-002 (`:167`): invoice "Gagal"/"Pending", banner, "support diarahkan ke internal logs" — TIDAK ada eskalasi, dunning email, grace, suspend, atau terminasi. FR-027 (`:151`) menjamin inbox selama "subscription is active" tetapi subscription-active-vs-tak-berbayar tidak didefinisikan. Aturan "grace period" yang dirujuk FR-030 **tidak ada** di PRD manapun.
**Root Cause:** Lifecycle keuangan hanya dirancang sampai invoice diterbitkan; post-payment-failure tidak di-spec.
**Impact:** **Revenue leakage** — tenant bisa terus memakai langganan tanpa batas waktu tanpa membayar; referral reward bisa dibangun di atas aturan yang tidak eksis.
**Blast Radius:** Semua tenant, finance, referral reward grant, superAdmin access determinant (F-08).
**Recommendation:** Tambah addendum: status pembayaran → status subscription (mis. `active → past_due (+N hari) → suspended (+M hari) → terminated`), dunning email schedule, aturan grace period, dan efek suspend terhadap inbox/broadcast.
**Suggested Test:** Invoice overdue 1/15/31 hari → assert status subscription, notifikasi, dan level akses sesuai tabel baru.

### F-04 [High] [INCONSISTENCY] Voucher "current period invoice" bertabrakan dengan model invoice arrears
**Status:** Confirmed
**Location:** `PRD Prepaid Billing...md:132` (FR-008) vs `PRD Billing Voucher Engine.md:54` (US-022), `:67` (FR-037/038), `:100` (EC-020)
**Scenario:** Voucher diskon subscription di-apply tanggal 10 bulan berjalan.
**Expected:** FR-037/EC-020 (`PRD Billing Voucher Engine.md:67`, `:100`) mengasumsikan "invoice periode berjalan sudah ada tapi belum lunas" → invoice itu di-update dengan diskon.
**Actual / Failure Mode:** FR-008 (`PRD Prepaid Billing...md:132`) mendefinisikan invoice periode N baru digenerate **00:00 WIB tanggal 1 bulan N+1** (untuk periode SEBELUMNYA) — jadi pada tanggal 10, invoice periode berjalan **belum ada**. "Mulai periode berjalan jika belum lunas" (US-022 `:54`) tidak bisa dipetakan ke objek invoice manapun. Interpretasi "invoice yang belum lunas" = invoice periode lalu akan menghasilkan diskon untuk periode yang salah.
**Root Cause:** Voucher PRD (2026-02) ditulis dengan asumsi billing in-advance; PRD Prepaid (2025-12) menspec billing in-arrears.
**Impact:** Salah hitung diskon, invoice dispute, dukungan manual.
**Blast Radius:** Semua penebus voucher diskon subscription; invoice engine.
**Recommendation:** Kunci satu model: jika arrears tetap, FR-037/038 harus menyebut "draft/kalkulasi periode berjalan" (bukan invoice), dan EC-020 dihapus/diubah. Perjelas di addendum.
**Suggested Test:** Redeem voucher tanggal 10 → assert objek mana yang terdiskon dan periode mana yang terdampak.

### F-05 [High] [INCONSISTENCY] Referral reward "subscription end date extension" vs subscription tanpa end date
**Status:** Confirmed
**Location:** `PRD Billing - Referral...md:78` (US-004 AC1: "my subscription end date is extended") vs `PRD Prepaid Billing...md:131` (FR-007 cycle bulanan permanen, tanpa term/end date)
**Scenario:** Referral qualified → sistem harus memperpanjang "subscription end date" referrer.
**Expected:** Reward = perpanjangan durasi (bulan gratis) untuk referee ("free subscription" `:79`, `referrerRewardMonths`/`refereeRewardMonths` `:162-163`).
**Actual / Failure Mode:** Model Prepaid Billing tidak punya konsep end date atau "free month" bawaan — langganan abadi per bulan dengan invoice. Tidak didefinisikan bagaimana "1 bulan gratis" diekspresikan (kredit invoice? periode tanpa tagihan? perpanjangan field yang tidak ada?). Voucher free-months (`PRD Prepaid Billing...:416`) punya masalah serupa ("reduce or zero the base subscription ... for specific number of future months") tapi minimal punya FR-037/038.
**Root Cause:** Referral PRD memodelkan langganan berjangka; Prepaid PRD memodelkan langganan tanpa akhir.
**Impact:** Implementasi reward bisa menghasilkan entitlement yang tidak konsisten dgn invoice; risiko double-grant sulit dideteksi.
**Blast Radius:** Semua kasus referral; reward ledger; invoice.
**Recommendation:** Definisikan "free month" sebagai line-item kredit invoice ber-periode (reuse mekanisme voucher FR-037/038 setelah F-04 diperbaiki) — bukan manipulasi end date yang tidak eksis.
**Suggested Test:** Grant reward 1 bulan → assert invoice bulan target = Rp 0 untuk base plan (addon tetap), ledger tercatat, dan tidak ada duplikasi pada retry (EC-003 `:123`).

### F-06 [High] [REQUIREMENT GAP] Gate fitur per paket tidak ada — hanya limit kuantitatif
**Status:** Confirmed
**Location:** `PRD Prepaid Billing...md:125` (FR-001), `:66` (US-002 "included features"), `:152` (FR-028); `Assessments/auth/superadmin-global-company-access/versions/...-v1.4.md:31`, `:171` (OQ-03)
**Scenario:** Tenant Paket Individual mencoba fitur kelas Enterprise (mis. laporan terjadwal/analytics lanjutan).
**Expected:** Ada matriks fitur per tier ("included features" per US-002 `:66`) yang di-gate saat runtime.
**Actual / Failure Mode:** FR-001/FR-028 hanya mendefinisikan limit **kuantitatif** (max agent, max akun channel, volume broadcast — boleh "Unlimited", `PRD Prepaid Billing...:378-381` yang saat ini semuanya Unlimited). Tidak ada daftar fitur yang di-gate per paket. Sementara brief superadmin v1.4 mengunci bahwa "subscription is the initial determinant of company access, including feature access and permission" (`...-v1.4.md:31`) — scope "semua aspek subscription" masih OQ-03 blocking (`:171`).
**Root Cause:** PRD Prepaid hanya menjual tier sebagai bundle limit; brief superadmin menuntut subscription sebagai feature-access resolver.
**Impact:** Enforcement akses fitur tidak bisa konsisten; gate hanya bisa dilakukan di FE (bukan enforcement boundary — melanggar prinsip audit workflow-analyzer).
**Blast Radius:** Semua tenant per tier; RBAC; superAdmin control surface.
**Recommendation:** Buat tabel `plan → features[]` eksplisit di PRD (setara pricing matrix Appendix A-001), definisikan resolver `subscription entitlement ∩ owner ceiling ∩ member role` (OQ-01 `:169`), tutup OQ-03.
**Suggested Test:** Tenant tier rendah memanggil API fitur tier tinggi langsung (bukan via UI) → 403 dari BE.

### F-07 [High] [REQUIREMENT GAP] Subscription cancel / manual expire / auto-renewal ada di feature list tapi tidak punya spesifikasi
**Status:** Confirmed
**Location:** `Feature List/satuinbox-feature-list.md:466-471` vs `PRD/Subscription/*` (tidak ada definisi)
**Scenario:** Admin membatalkan langganan; superAdmin manual-expire; bulan berganti dengan auto-renewal.
**Expected:** Setiap lifecycle action punya trigger, actor, guard, side effect, efek token/kuota/invoice (standar state machine audit).
**Actual / Failure Mode:** Feature list §22 mencantumkan "Subscription create / cancel / Manual expire subscription / Auto-renewal / Downgrade transition" (`:466-470`) — hanya create & downgrade transition yang punya spesifikasi di PRD (FR-002/FR-013). Cancel, manual expire, dan auto-renewal **nol definisi** (status enum, refund sisa token, efek retensi data, siapa actor-nya). "Auto-renewal" juga ambigu: model FR-008 (`:132`) sudah otomatis tiap bulan — apakah ini toggle? apakah terkait VA auto-debit?
**Root Cause:** Feature list dibuat dari surface API/codebase, PRD menyusul sebagian.
**Impact:** Implementasi bebas mengarang perilaku → kontradiksi masa depan; cancel tanpa aturan token refund = potensi dispute.
**Blast Radius:** payment-service, semua tenant.
**Recommendation:** Addendum PRD: tabel transisi subscription (lihat tabel lifecycle di laporan ini — baris `cancelled`, `expired`, `auto_renewal`), termasuk efek sisa saldo token dan kuota terpakai.
**Suggested Test:** Cancel mid-period → assert akses, invoice akhir, dan saldo token sesuai aturan baru.

### F-08 [High] [INCONSISTENCY] Timing penurunan subscription superAdmin (segera) vs aturan downgrade tenant (tgl 1)
**Status:** Suspected (brief tidak menyebut timing eksplisit; konflik potensial nyata)
**Location:** `Assessments/auth/superadmin-global-company-access/versions/...-v1.4.md:20` ("jika subscription turun/nonaktif, permission ikut dipotong") vs `PRD Prepaid Billing...md:137` (FR-013), `:197` (EC-003)
**Scenario:** SuperAdmin menurunkan paket tenant pada tanggal 15. Tenant bulan ini sudah bayar penuh.
**Expected:** FR-013 (`:137`) — downgrade berlaku mulai periode berikutnya, "MUST not reduce current charges or limits within the ongoing period".
**Actual / Failure Mode:** Brief v1.4 mengunci "subscription turun/nonaktif → permission ikut dipotong" dan model **persisted propagation** (rewrite role member di DB, `:19-23`) tanpa menyebut efektif nanti atau segera. Jika segera: tenant kehilangan akses untuk periode yang sudah dibayar (tanpa kredit — refund out of scope, `PRD Billing Voucher Engine.md:173`) = sengketa. Jika nanti: kontrak "resolver update feature access and permission dynamically" (`:4`) melemah.
**Root Cause:** Dua dokumen mendesain ulang entitas subscription dari sudut berbeda tanpa kontrak timing bersama.
**Impact:** Inkonsistensi entitlement vs invoice; potensi pelanggan dirugikan (paid-but-reduced).
**Blast Radius:** Semua tenant yang diintervensi superAdmin; permission member (persisted rewrite `:19`); billing.
**Recommendation:** Kunci aturan: intervensi superAdmin turun-tier = efektif segera HANYA dengan kredit prorata/void invoice (perlu jalur credit — lihat F-09), atau ikut FR-013 (tgl 1) dengan opsi "suspend" sebagai penanganan kasus abuse.
**Suggested Test:** SuperAdmin downgrade tanggal 15 → assert limit & permission, dan assert invoice bulan depan/periode berjalan tidak menagih penuh untuk layanan yang tidak diterima.

### F-09 [Medium] [REQUIREMENT GAP] Tidak ada refund/rollback/credit — padahal kasus overpayment & mis-charge sudah ada jalannya
**Status:** Confirmed
**Location:** `PRD Billing Voucher Engine.md:25` (out of scope: "Refund, rollback, revocation tools"), `:173` (Limitation); `PRD Prepaid Billing...md:210` (EC-016), `:283` (DR-003)
**Scenario:** Overpayment bank transfer (EC-016 `:210` → status "Perlu penyesuaian"); kesalahan prorata (DR-003 risiko billing error `:283`); voucher salah-apply (Limitation `:173`: "Mistaken applications require engineering intervention").
**Expected:** Ada jalur kredit/refund yang ter-audit untuk penyelesaian finansial.
**Actual / Failure Mode:** Semua jalur keluar mengarah ke "manual review"/"engineering intervention" tanpa tooling. EC-016 menyebut "no automatic settlement unless configured" tapi konfigurasi itu tidak didefinisikan.
**Impact:** Beban operasional finansial; koreksi manual = risiko kesalahan baru (dilarang mengarang hasil — tapi jalurnya jelas tidak ada).
**Blast Radius:** Finance, voucher, semua invoice.
**Recommendation:** Minimal: definisikan invoice credit-note (negative line item dengan guard non-negative per FR-041 `PRD Billing Voucher Engine.md:68` — konsisten karena guard hanya untuk diskon voucher) untuk kasus koreksi.
**Suggested Test:** Simulasi mis-charge → credit note terbit, grand total kumulatif akurat, ter-audit.

### F-10 [Medium] [REQUIREMENT GAP] Pajak belum tuntas: PPN 11% pada "taxable subtotal" tanpa definisi item kena pajak; token top-up tidak dibahas
**Status:** Confirmed
**Location:** `PRD Prepaid Billing...md:132` (FR-008), `:272` (NFR-004), `:426` (Notes 3); `PRD Billing Voucher Engine.md:174` (tax out of scope)
**Scenario:** Finance menerbitkan invoice berisi base plan, addon, top up token, prorata, diskon voucher.
**Expected:** Definisi eksplisit item mana yang "taxable": apakah top up token (nilai uang 1:1, `:138`) kena PPN? Bagaimana PPN dengan diskon voucher (brutto/netto)?
**Actual / Failure Mode:** FR-008 hanya "apply PPN 11% on taxable subtotal" — taxable-ness per line item tidak didefinisikan. Voucher PRD mengecualikan pajak sepenuhnya (`:174`). NFR-004 menggantung ke "Satinbox finance policy" eksternal (`:272`). Notes 3 (`:426`) mengakui perubahan regulasi ditangani via config — tapi baseline-nya sendiri belum lengkap.
**Impact:** Risiko compliance pajak Indonesia (e-faktur), salah hitung invoice.
**Blast Radius:** Semua invoice; finance.
**Recommendation:** Tambah tabel `line item → kena PPN Y/N` di Appendix A-003 (`:385-396`) dan aturan PPN × diskon voucher.
**Suggested Test:** Invoice dengan semua kombinasi line item → assert subtotal pajak sesuai tabel.

### F-11 [Medium] [DESIGN FLAW] Quota reset & perubahan kuota saat ganti paket tidak didefinisikan di PRD
**Status:** Confirmed (definisi hanya ada di memori audit, bukan PRD)
**Location:** `Feature List/satuinbox-feature-list.md:476-477` ("Quota usage monitoring", "Monthly broadcast quota reset"); `PRD Prepaid Billing...md:152` (FR-028), `:187` (EH-022), `:207` (EC-013); `Memory/global-memory.md:374`
**Scenario:** Tenant upgrade limit broadcast tanggal 20; bulan berganti 00:00 tgl 1; tenant dengan kuota broadcast "Unlimited" vs terbatas.
**Expected:** Aturan: kapan reset (00:00 WIB tgl 1? per tanggal aktivasi?), apakah limit baru mid-cycle prorata atau utuh, apa yang terjadi pada pemakaian yang sudah lewat limit.
**Actual / Failure Mode:** FR-028/EH-022/EC-013 hanya bicara blokir saat limit tercapai — **tidak ada aturan reset sama sekali di PRD**. Satu-satunya referensi: `Memory/global-memory.md:374` (audit code-verified) yang mencatat "quota CHANNEL/AGENT carry-over, BROADCAST reset bulanan" — perilaku aktual, bukan spesifikasi. Voucher punya aturan "reset"-nya sendiri saat ganti paket (FR-045 void benefit jika pindah plan non-eligible, `PRD Billing Voucher Engine.md:69`) — analogi untuk kuota tidak ada.
**Impact:** Ambiguitas limit enforcement; tenant bisa kehilangan/mendapat kuota tak adil di boundary bulan (edge audit: midnight/month boundary).
**Blast Radius:** Broadcast module semua tenant.
**Recommendation:** Tulis aturan resmi (jadikan PRD sumber, bukan memori): BROADCAST reset 00:00 WIB tgl 1; CHANNEL/AGENT carry-over; limit baru efektif mengikuti FR-012/FR-013.
**Suggested Test:** Broadcast jam 23:59 vs 00:01 boundary → counter bulanan sesuai aturan.

### F-12 [Medium] [DEFECT] Payment webhook memakai static-secret, bukan HMAC signature
**Status:** Confirmed (code-verified via audit register)
**Location:** `Memory/global-memory.md:374` (audit AUTH, P1: "payment webhook static-secret bukan HMAC"); kontraktor kebutuhan: NFR-003 `PRD Prepaid Billing...md:271`
**Scenario:** Attacker yang membocorkan/menebak static secret dapat mengirim webhook top-up/pembayaran palsu.
**Expected:** NFR-003 — billing data dan proses aman; praktik standar webhook payment = signature HMAC per-payload.
**Actual / Failure Mode:** Audit mencatat payment webhook memvalidasi static-secret saja.
**Root Cause:** Integrasi Apibayar (`:281`) memakai verifikasi shared-secret polos.
**Impact:** Pemalsuan webhook → kredit token/tagihan salah (memperparah F-02).
**Blast Radius:** Semua pembayaran masuk.
**Recommendation:** Migrasi ke HMAC signature + timestamp/replay protection; rotasi secret.
**Suggested Test:** Webhook dengan signature salah/replay → ditolak, tidak ada mutasi wallet.

### F-13 [Medium] [RISK] Referral reward edge cases belum dikunci: referrer expired / tanpa subscription aktif
**Status:** Confirmed (open policy)
**Location:** `PRD Billing - Referral...md:124` (EC-004), `:113` (EH-007), `:229` (Open Questions), `:187` (risk "Missing referrer active subscription policy")
**Scenario:** Referral qualified tapi subscription referrer sudah expired.
**Expected:** Kebijakan final: block, defer, atau reactivate.
**Actual / Failure Mode:** EC-004/EH-007 sengaja dibiarkan "according to final business rule"; Open Questions (`:229`) juga menggantung timing reward (saat approval vs milestone subscription). PRD mengakui sendiri sebagai risk (`:187`).
**Impact:** Reward grant bisa menghasilkan entitlement hantu (extension pada subscription mati — mengacu ke end date yang tidak ada, F-05).
**Blast Radius:** Reward ledger; referrer/referee.
**Recommendation:** Kunci policy sebelum release (PRD menyarankan sendiri: "Lock policy before release" `:187`) — rekomendasi: defer + queue hingga referrer berstatus `active`, dengan batas kadaluarsa.
**Suggested Test:** Referral qualified dengan referrer expired → assert state `reward_failed`/deferred sesuai policy, tidak ada mutasi diam-diam (US-007 `:81` melarang "silently mark granted").

### F-14 [Medium] [RISK] Konflik Hold/Snooze/SLA pause (3-way) berdampak ke akurasi usage analytics & laporan yang menopang transparansi billing
**Status:** Confirmed (konflik terbuka); dampak billing = tidak langsung
**Location:** `Memory/global-memory.md:73`, `:345` (3-way conflict Hold pause SLA vs "No SLA pause changes"); `PRD Prepaid Billing...md:103`, `:156-157` (usage analytics/reports sebagai produk transparansi billing, SM-003 `:291`)
**Scenario:** Hold/Snooze diterapkan pada conversation; policy SLA pause belum final (RLT Adjusted menggantung).
**Expected:** Definisi metric usage yang stabil untuk "Laporan penggunaan" dan "Usage analytics".
**Actual / Failure Mode:** Karena SLA pause policy belum di-lock, derived metrics (agent active days, usage per agent — Appendix A-004 `:404`) berpotensi berubah makna setelah policy final → laporan historis tidak konsisten. Ini bukan defect billing langsung (kuota/token tidak terpengaruh), tapi menggerus tujuan transparansi billing (SM-003, PS-003 `:45`).
**Impact:** Rework laporan; ketidakpercayaan invoice jika tenant memakai laporan usage untuk verifikasi.
**Blast Radius:** Analytics-service, usage reports, CSAT billing.
**Recommendation:** Tandai RLT/Wait sebagai "non-SLA, non-billing" eksplisit di laporan usage (sesuai `Memory/global-memory.md:349` Phase 1) sampai policy final; jangan pakai metric yang terpengaruh Hold/Snooze untuk dimensi billing.
**Suggested Test:** Konversi angka laporan usage sebelum vs sesudah policy change → dimensi billing tidak berubah.

### F-15 [Low] [REQUIREMENT GAP] Definisi "delivered" untuk deduct token ambigu antar provider
**Status:** Confirmed (ambiguity)
**Location:** `PRD Prepaid Billing...md:146` (FR-022: "final status indicating successfully sent **or** delivered, according to each channel provider")
**Scenario:** WhatsApp Web (Baileys) vs WhatsApp API vs Email punya status callback berbeda (sent, delivered, read, bounced).
**Expected:** Satu aturan per channel: status mana yang memicu deduct.
**Actual / Failure Mode:** "sent or delivered" dibiarkan per provider tanpa tabel mapping → dua implementasi bisa berbeda (sent saja sudah deduct? tunggu delivered?). Rounding Meta-price pun diserahkan ke "finance policy" (`:424`, `:364`) — placeholder.
**Impact:** Selisih kecil antar tenant dalam costing; sulit direkonsiliasi (SM-001 menuntut 100% akurat `:289`).
**Blast Radius:** Token usage log.
**Recommendation:** Tabel `channel → terminal status yang deduct` di Appendix A-003.
**Suggested Test:** Per channel: kirim pesan yang stuck di "sent" tanpa delivery receipt → perilaku deduct sesuai tabel.

### F-16 [Low] [INCONSISTENCY] Voucher stacking vs benefit referral/free-month: apakah referral dihitung "1 voucher aktif"?
**Status:** Possible
**Location:** `PRD Billing Voucher Engine.md:66` (FR-035E: "Only 1 active voucher per tenant"), `PRD Billing - Referral...md:54` (PS-002: "Referral logic would become inconsistent or unsafe if forced into plain voucher behavior")
**Scenario:** Tenant penebus voucher diskon lalu mendapat reward free-month dari referral (atau sebaliknya).
**Expected:** Aturan eksplisit: referral bukan voucher (PS-002 `:54` mengatakan jangan dipaksa ke voucher) sehingga bisa koeksistensi, atau ikut aturan stacking.
**Actual / Failure Mode:** FR-035E hanya mengatur antar-voucher; hubungan voucher × referral reward × voucher free-months (FR-034A `:65`) tidak dirumuskan. Precedent: EC-005 (`PRD Billing Voucher Engine.md:94`) mengatur voucher × proration tapi bukan voucher × referral.
**Impact:** Edge case diskon bertumpuk tak terduga (guard non-negative FR-041 `:68` menyelamatkan total, tapi margin bisa tergerus).
**Blast Radius:** Invoice dengan kombinasi promo.
**Recommendation:** Satu kalimat aturan di addendum: "referral reward bukan voucher; dapat berjalan berdampingan dengan 1 voucher aktif" (atau sebaliknya).
**Suggested Test:** Tenant dengan voucher aktif + referral qualified → assert line item invoice sesuai aturan.

---

## Placeholder yang belum diimplementasi (terkonfirmasi dari dokumen)

| Placeholder | Sumber | Severity implikasi |
|---|---|---|
| "Payment details subscription masih placeholder" (FE) | `Feature List/satuinbox-feature-list.md:532` | High — surface utama billing belum nyata |
| Harga base subscription `[Configurable]` | `PRD Prepaid Billing...md:325-326` | Medium — belum bisa go-live tanpa isi harga |
| Aturan pembulatan Rupiah→token Meta "to be defined by Finance" | `PRD Prepaid Billing...md:424`, `:364` | Medium — estimasi vs deduct bisa selisih |
| Ambang low-credit per-tenant ("future") | `PRD Prepaid Billing...md:88`, `:250` | Low |
| Voucher management UI internal out of scope | `PRD Billing Voucher Engine.md:25`, `:163` | Low — operasi manual |
| Rute referral validate "or equivalent" | `PRD Billing - Referral...md:265` | Low |
| Design Lead referral "TBD" | `PRD Billing - Referral...md:6` | Info |

---

## Open Questions

1. **OQ-1 (blocking):** Saat deduct on-delivery melebihi saldo (F-01), sistem memilih saldo negatif, memblokir, atau meng-kredit utang? ([PRD Prepaid Billing...md:138] melarang opsi pertama.)
2. **OQ-2 (blocking):** "Current period invoice" pada voucher (F-04) merujuk objek apa dalam model arrears?
3. **OQ-3 (blocking):** Bentuk "free month"/extension reward (F-05) — kredit invoice, skip tagihan, atau field baru?
4. **OQ-4 (blocking):** SuperAdmin OQ-03 di brief v1.4 (`...-v1.4.md:171`): "semua aspek subscription" = plan, addon, active/inactive, suspend/reactivate, expiry, grace, quota, voucher/override?
5. **OQ-5:** Auto-renewal di feature list (`:469`) = toggle VA auto-debit, atau sekadar sinonim invoice otomatis FR-008?
6. **OQ-6:** Status enum nilai `status` pada `subscription.schema.ts` runtime (gtm brief:79) apa saja?
7. **OQ-7:** Token sisa saat subscription cancel/expire (F-07): hangus, dapat refund, atau tetap bisa dipakai?
8. **OQ-8:** Apakah top up token kena PPN (F-10)?

---

## Recommendation / Next Action

1. **Sebelum implementasi billing lanjut (P0):** perbaiki F-01 (reservation/hold saldo broadcast) dan F-02 (idempotency top-up webhook) — keduanya jalur uang langsung.
2. **Addendum PRD Prepaid Billing (P1):** lifecycle subscription state machine lengkap (F-03, F-07 — pakai tabel di laporan ini sebagai draft), dunning/grace/suspend, dan resolution F-04/F-05 (kontrak antar-PRD).
3. **Addendum plan matrix (P1):** feature gate per tier + resolver entitlement (F-06) — wajib untuk brief superadmin v1.4 yang saat ini `Status: Hold` (`...-v1.4.md:11`).
4. **Definisi pendukung (P2):** mapping status deduct per channel + aturan pembulatan (F-15), tabel PPN (F-10), aturan kuota reset resmi (F-11), credit-note untuk koreksi (F-09).
5. **Traceability:** karena ini domain shadow (audit 2026-10-01: "0 PRD, 0 memory canonical, 0 test" — `Memory/global-memory.md:374`), setiap addendum wajib datang dengan test scenario (profile SatuInbox: traceability non-bypassable).
6. **Jangan mengubah PRD sumber** dari laporan ini — semua poin di atas kembali ke lane requirement/change-intake sesuai `Rules/core/change-management.md`.

**Decision: `REVISE_PRD`**

---

## Reviewer Handoff Notes

- Klaim code-verified (F-02, F-12, sebagian F-11) berasal dari audit register `Memory/global-memory.md:374` yang mengutip BE `omnichannel-satuinbox-be` v2.7.0 commit `3e2d9bc1` (repo di `Desktop/BE satuinbox/`) — kalau reviewer ingin bukti level baris, verifikasi langsung ke `wallet.service.ts:459-498`.
- Klaim spesifikasi semua memakai `file:baris` pada dokumen sumber; tidak ada klaim hasil eksekusi/test yang dikarang (non-bypassable `no_invented_test_results`).
- F-08 sengaja berstatus **Suspected** — brief v1.4 tidak menyebut timing eksplisit; butuh konfirmasi PM/User.
- Konflik memory flag: tidak ada konflik dengan `Memory/global-memory.md` yang ditemukan; temuan laporan ini konsisten dengan baris 374 (audit shadow-domain subscription).
