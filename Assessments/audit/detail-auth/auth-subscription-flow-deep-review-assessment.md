# Assessment Report — Deep Review: Auth & Subscription Flow

> **Logical name:** Assessment Report | **File role:** decision-bearing
> **Version:** `v1.0` | **Date:** 2026-10-02
> **Owner:** Analyst | **PM:** Dany Christian | **Eng Lead:** Naftal Yunior
> **Evidence:** BE `omnichannel-satuinbox-be` `v2.7.0`/`3e2d9bc1`, FE `omnichannel-satuinbox-fe` `data-cy`/`7632dd92` — **code-verified**
> **Scope:** session lifecycle (login, token invalidation, refresh rotation, inactive-user revocation) + subscription flow (gating, proration, quota, wallet topup). **Analisa, bukan patch kode.**
> **Related:** `reference/session-lifecycle-review-asbuilt.md` (detail auth + lampiran research bersitasi), `auth-register-onboard-subscription-audit.md` (Track K 12 findings), `auth-flow-redesign-change-intake.md`.

---

## 0. Ringkasan Eksekutif

Session lifecycle **jauh lebih matang dari dugaan awal** — gateway `jwt.strategy` **sudah cek session di cache per-request** (bukan JWT-only), rotation + lockout + force-logout + event-propagation lintas service semua ada. Tapi ada **lubang nyata**: (1) rotation **tanpa reuse-detection**, (2) FE **tak re-validate sesi saat bootstrap** (user nonaktif bisa masuk shell sebelum request API pertama), (3) wallet topup **double-credit** saat webhook retry (money bug), (4) **tak ada request-time subscription gating** (hanya cron/job), (5) **tak ada mutex** pada perubahan subscription/wallet (race).

**Verdict:** flow **layak**, tapi butuh hardening sebelum jadi production-grade. 3 HIGH keamanan + 1 HIGH money. Tidak ada yang butuh rewrite — semua diff kecil-sedang.

---

## 1. Yang SUDAH BENAR (jangan diutak-atik)

| Area | Bukti | Catatan |
|---|---|---|
| Session **stateful** per-request | `jwt.strategy.ts:64-76` cek `SESSION:{sessionId}` di cache; hilang → `checkSessionInvalidation` → 401 + reason | Revoke **efektif sebelum access-token expiry** di semua endpoint gateway. Ini mematikan sebagian besar kekhawatiran F-6. |
| Force-logout + reason | `checkSessionInvalidation` → `SESSION_INVALIDATED` + `SESSION_INVALIDATION_MESSAGES` | one-time flag, FE dapat toast |
| Refresh rotation | `app.controller.ts:195,909` regenerate pair, timpa lama | rotation ada (tapi lihat F-4) |
| Lockout | 5 attempts / 15 menit | `base.constant.ts:13-15` |
| Inactive-user revocation | `deactivateUser` → `isActive=false` + `deleteAllSessionsByUserId` + event `USER_DEACTIVATED` → people-service LOGOUT | propagasi lintas service OK |
| Proration | `calculateProration` + line-item prorata charge/credit | `payment.controller.ts:211`, `subscription.constant.ts:162-170` — **AUTH-08 lama sudah tertangani** |
| Quota | `QuotaUsageService` + monthly `broadcast-reset.processor` | `quota-usage.controller.ts`, reset job ada — **AUTH-09 lama sudah tertangani** |
| Access TTL pendek | 15m access / 7d refresh | `jwt-token.service.ts:47-48` |

---

## 2. Daftar Perbaikan (prioritas)

### 🔴 HIGH

| ID | Masalah | Bukti | Fix (lazy) | Jenis |
|---|---|---|---|---|
| **A-1** | **Rotation tanpa reuse-detection.** `refresh.strategy.validate()` cuma cek `session.isActive`, tak compare token kirim vs `session.refreshToken`. Token dicuri → tetap bisa menukar selama sesi aktif. | `refresh.strategy.ts:88-108` | Di `validate()`: `if (token !== session.refreshToken) { deleteAllSessionsByUserId(sub); throw reuse }`. Revoke seluruh family. | Bug-fix (root-cause) |
| **A-2** | **Wallet topup DOUBLE-CREDIT.** `handleTopupWebhook` saat `Paid` → `updateToken($inc)` **tanpa cek transaksi sudah Paid**. Webhook retry (normal) = kredit dobel. | `wallet.service.ts:488-496` + `wallet.repository.ts:88 $inc` | Guard idempotensi: `if (topupTransaction.status === Paid) return;` SEBELUM `$inc`. Atau unique-constraint pada (referenceId, Paid-applied). | Bug-fix (money) |
| **A-3** | **FE tak re-validate sesi saat bootstrap.** NextAuth JWT-strategy; gate masuk murni `useSession()` cookie → user nonaktif masuk shell, loading di-skip. Usir hanya reaktif saat request API gagal. | FE `authOption.ts:32-112` (no server round-trip), no `middleware.ts`, `useAxiosPrivateApi.ts:72-110` (reaktif) | Panggil **`GET /me` saat app mount**, gate loading pada hasil. `/me` lewat `JwtAuthGuard` yang **sudah cek session cache** → sesi mati = 401 + `SESSION_INVALIDATED` → signOut. **Endpoint sudah ada** (`auth.controller.ts:264`), reuse. | Bug-fix (FE) |

### 🟠 MEDIUM

| ID | Masalah | Bukti | Fix | Jenis |
|---|---|---|---|---|
| **A-4** | **Tak ada request-time subscription gating.** Enforcement subscription cuma di cron/processor (expiry, renewal, reset). Aksi saat subscription expired tak dicegah di request-time (eventual, bukan immediate). | guards: tak ada `SubscriptionGuard`; gating di `*-expiry.processor.ts` | Sesuai preferensi **zero-perf → JWT claim**: masukkan `subscriptionStatus`/`plan` ke JWT access token (sudah ada `session.role` di payload), FE/guard baca claim — bukan DB hit per-request. Expiry → invalidate session (sudah ada `SUBSCRIPTION_EXPIRED` reason) agar claim refresh. | Change Intake (behavior) |
| **A-5** | **Tak ada mutex** pada subscription/wallet change → race (double upgrade, saldo salah saat concurrent). | grep lock kosong di payment-service | Redis distributed lock (redlock) per `companyId` di path mutasi wallet/subscription. `// ponytail: lock per-company; per-wallet kalau throughput jadi masalah`. **AUTH-04 lama masih open.** | Bug-fix |
| **A-6** | **Refresh perpendek sesi 7d→1d.** `handleSessionUpdate` set `expiresAt = now + ONE_DAY` (komentar salah `// One Week`); login set `ONE_WEEK`. | `app.controller.ts:814` vs `:923` | `ONE_DAY` → `ONE_WEEK` (atau definisikan sliding + absolute cap eksplisit). 1-line. | Bug-fix |
| **A-7** | **Refresh token plaintext di DB.** `session.schema.ts:45 refreshToken: string`, tanpa hash. Dump DB = account takeover. | `session.schema.ts:45` | Simpan hash (SHA-256), lookup via indeks. | Hardening |

### 🟡 LOW / HARDENING

| ID | Masalah | Fix | Jenis |
|---|---|---|---|
| **A-8** | `deactivateUser` hapus sesi tapi **tak set reason** → FE tak tahu kenapa ter-logout | Tambah `USER_DEACTIVATED` ke `SessionInvalidationReasonEnum` + pesan; set reason sebelum hapus sesi | Bug-fix |
| **A-9** | **Logout hapus SEMUA sesi** (bukan current device) | Keputusan produk: "logout this device" = current sessionId; sediakan "logout all" + daftar sesi aktif + remote-terminate | Change Intake |
| **A-10** | **Idle/absolute timeout** belum tegas (`lastActivity` tak dipakai enforce) | Definisikan idle 15–30m + absolute 4–8 jam (OWASP), enforce server-side | Change Intake |
| **A-11** | **Account enumeration** — perlu verifikasi pesan error login generik (user-salah vs tak-ada vs terkunci) | Audit `ERROR_MESSAGE` login, samakan + waspada timing (OWASP) | Hardening |
| **A-12** | **Lockout-as-DoS** — lockout per-akun 5/15m bisa dipakai kunci korban | CAPTCHA/backoff setelah N gagal; jaga forgot-password tetap jalan saat terkunci | Hardening |
| **A-13** | **RabbitMQ revocation idempotensi** — consumer `USER_DEACTIVATED` harus idempotent + rekonsiliasi bila event hilang | Pastikan handler idempotent + dead-letter/retry | Hardening |

---

## 3. Urutan Eksekusi (dependency-aware)

1. **A-2** (money, diff kecil, berdiri sendiri) — paling urgent, kebocoran uang aktif.
2. **A-1** (security, 1 compare) + **A-6** (1-line TTL bug) — cepat, berdampak besar.
3. **A-3** (FE bootstrap `/me`) — reuse endpoint existing, tutup gap masuk shell.
4. **A-5** (mutex) — cegah race wallet/subscription.
5. **A-7, A-8** — hardening.
6. **A-4, A-9, A-10** — butuh **Phase 0 Change Intake** (ubah behavior) → Reviewer Gate A.
7. **A-11, A-12, A-13** — hardening backlog.

---

## 4. Klasifikasi Governance

- **Bug-fix root-cause (tanpa Phase 0):** A-1, A-2, A-3, A-5, A-6, A-7, A-8 — memperbaiki perilaku salah/bocor, bukan behavior baru.
- **Change Intake (Phase 0 wajib):** A-4 (subscription gating request-time = behavior baru), A-9 (ubah semantik logout), A-10 (kebijakan timeout baru). Masuk `auth-flow-redesign-change-intake.md` → Reviewer Gate A.
- **Zero-perf constraint:** A-4 gating WAJIB via JWT claim (bukan DB hit per-request) — sesuai standing preference. Session check sudah pakai cache; jangan tambah round-trip.

---

## 5. Koreksi atas Asumsi Sebelumnya

- **F-6 (review awal) di-downgrade:** dugaan "ada guard JWT-only" **tidak terbukti** — gateway `jwt.strategy.ts:64` cek session cache per-request. Access-token gap hanya relevan bila ada service yang verify JWT lokal tanpa lewat gateway (perlu audit per-service, tapi gateway aman).
- **AUTH-08 (proration) & AUTH-09 (quota)** dari audit lama: **sudah tertangani** di kode saat ini (calculateProration + QuotaUsageService). Tutup/turunkan severity.
- **AUTH-12 (double-credit)** & **AUTH-04 (no mutex)**: **masih open**, confirmed code-verified (A-2, A-5).

> **Next:** Reviewer Gate atas Assessment ini; angkat A-4/A-9/A-10 ke Open Question `auth-flow-redesign-change-intake.md` §6; A-2 eskalasi ke Eng Lead (money bug aktif).
