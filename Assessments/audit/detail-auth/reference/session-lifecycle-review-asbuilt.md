# Review Existing Auth Session Lifecycle — Code-Verified (As-Built)

> **Scope:** review implementasi existing untuk login, token invalidation, refresh token, inactive-user-without-logout.
> **Evidence:** BE `omnichannel-satuinbox-be` branch `v2.7.0` commit `3e2d9bc1` — code-verified.
> **Status:** DRAFT bagian as-built. Bagian "best-practice industri + rekomendasi" menyusul dari deep-research (`deleg_5fd86623`), lalu di-merge jadi Assessment Report.
> **Tanggal:** 2026-10-02 | Analyst (PM: Dany Christian, Eng Lead: Naftal Yunior)

---

## 1. Login & Session Creation

**Alur (`local.strategy.ts`):** `validateInput` → `authenticateUser` → `getAuthRecord` → `validateAccountStatus` → `verifyPassword` → (sukses) create session.

| Aspek | As-built | Bukti |
|---|---|---|
| Lockout | 5 attempts → lock 15 menit (`lockUntil`) | `base.constant.ts:13-15` `LIMIT_LOGIN_ATTEMPTS=5`, `MINUTES_IN_LOGIN_LOCK=15`; `local.strategy.ts:347` `loginAttempts >= LIMIT` |
| Gate status login | `lockUntil`, `!isActive` (AUTH_DISABLED), `!emailVerified` (AUTH_NOT_VERIFIED) | `local.strategy.ts:222-233` |
| Reset attempts | Direset saat login sukses | `local.strategy.ts:263-271` |
| Session fields | sessionId, accessToken, refreshToken, ipAddress, userAgent, deviceId, deviceInfo, location, isActive, lastActivity, expiresAt, invalidatedAt, reason | `session.schema.ts` |
| Token TTL | access **15m**, refresh **7d** | `jwt-token.service.ts:47-48` |

**Catatan:** lockout fixed-window 15m (bukan exponential backoff). Perlu cek di research apakah lockout per-account rawan DoS-lockout (attacker kunci akun korban) — mitigasi OWASP biasanya IP+account combo / backoff.

---

## 2. Token Invalidation / Logout / Force-Logout

| Aspek | As-built | Bukti |
|---|---|---|
| Logout | `deleteAllSessionsByUserId` (hapus SEMUA sesi user, bukan hanya current) | `app.controller.ts:176` |
| Force-logout + reason | `setSessionInvalidationReason(userId, reason)` set `invalidatedAt`+`reason`; `getAndClearSessionInvalidationReason` one-time read → toast FE | `session.service.ts:332-350` |
| Reason enum | `MEMBER_DELETED, PASSWORD_RESET, ROLE_CHANGED, SUBSCRIPTION_EXPIRED` + `SESSION_INVALIDATION_MESSAGES` | `libs/common/.../enums/index.ts:1577-1594` |
| Model revocation | **Server-side session (stateful)** — JWT divalidasi terhadap session DB/cache, jadi bisa dicabut sebelum expiry | `refresh.strategy.ts:94-95` |

**Temuan:**
- **F-1 (Medium): Logout menghapus SEMUA sesi, bukan current session saja.** `deleteAllSessionsByUserId` di `/logout` → user logout di 1 device = ter-logout di semua device. Mungkin disengaja, tapi tak sesuai ekspektasi umum "logout this device".
- **F-2 (Medium): Refresh token disimpan PLAINTEXT di DB.** `session.schema.ts:45 refreshToken: string` tanpa hashing. Bila DB bocor, refresh token langsung dapat dipakai. Best practice: simpan hash.
- **F-3 (Low): `deactivateUser` hapus sesi tapi tak set reason** → FE tak tahu kenapa ter-logout (lihat §4).

---

## 3. Refresh Token Rotation

**Alur (`refresh.strategy.ts:88-108` + `app.controller.ts:195,909`):**
1. `verifyRefreshToken(token)` → payload (sub, sessionId)
2. `getSession(payload.sessionId)` → reject bila `!session || !session.isActive`
3. `handleSessionUpdate` → `updateTokenPair` generate access+refresh BARU → `updateSession` timpa token lama.

| Aspek | As-built | Verdict |
|---|---|---|
| Rotation | YA — tiap refresh generate pasangan baru, timpa lama | OK |
| **Reuse-detection** | **TIDAK ADA** | ❌ **GAP KRITIS** |
| Refresh token family/lineage | Tidak ada | ❌ |

**Temuan:**
- **F-4 (HIGH): Tidak ada reuse-detection.** `validate()` hanya cek `session.isActive`, **tidak membandingkan token yang dikirim dengan `session.refreshToken` tersimpan.** Konsekuensi: kalau refresh token lama dicuri lalu dipakai, selama sesi masih `isActive` token lama **tetap bisa menukar** (verifyRefreshToken hanya cek signature+expiry, bukan apakah token = token terbaru). OAuth 2.0 Security BCP (RFC 9700) mewajibkan reuse-detection: token lama dipakai lagi = indikasi theft → revoke seluruh family. **Rotation tanpa reuse-detection memberi rasa aman palsu.**
  - Fix lazy: di `validate()`, bandingkan `token === session.refreshToken` (atau hash). Mismatch (padahal sesi aktif) = reuse → `deleteAllSessionsByUserId` + alarm.
- **F-5 (Medium): BUG — refresh memperpendek masa sesi.** Login set session `expiresAt = now + ONE_WEEK` (`app.controller.ts:814`), tapi `handleSessionUpdate` (refresh) set `expiresAt = now + ONE_DAY` dengan komentar salah `// One Week` (`:923`). Jadi begitu user refresh, sesi malah tinggal 1 hari, bukan 7. Sliding window tak konsisten.

---

## 4. Inactive-User-Without-Logout (revoke saat user sedang login)

**Alur (`app.controller.ts:741 deactivateUser`):**
`deactivateAuthByUserId` (soft: `auth.isActive=false`, `:360`) → `deleteAllSessionsByUserId` (paksa logout) → emit `USER_DEACTIVATED` → people-service set `member.isActive=false` + `currentState.status=LOGOUT`.

| Aspek | As-built | Verdict |
|---|---|---|
| Cabut sesi saat aktif | YA — hapus semua sesi | OK |
| Propagasi lintas service | YA — event `USER_DEACTIVATED` (RabbitMQ) | OK |
| Reaktivasi | `activateUser` → `isActive=true` | OK |

**Temuan:**
- **F-6 (HIGH): Gap window access-token.** Sesi dihapus, tapi **access token (15m) yang sudah di tangan user masih valid** sampai expiry bila ada endpoint yang hanya verify JWT signature **tanpa** cek session store. Perlu konfirmasi: apakah SEMUA guard downstream cek session/cache per-request, atau ada yang trust JWT saja? Bila ada yang trust JWT → user nonaktif masih bisa akses s/d 15m. (Butuh research: pola enforcement + angka OWASP idle/absolute timeout.)
- **F-3/F-7 (Low): `deactivateUser` tak set invalidation reason** → FE tak munculkan toast "akun dinonaktifkan", user cuma tiba-tiba ter-logout tanpa penjelasan. Tambah reason `USER_DEACTIVATED` ke enum.
- **F-8 (info): Idle vs absolute timeout belum ada kebijakan tegas.** `lastActivity` disimpan tapi tak terlihat dipakai untuk idle-timeout enforcement. (Butuh research angka rekomendasi.)
- **F-9 (HIGH): FE percaya session cookie lokal tanpa re-validate → user nonaktif bisa masuk shell app.** Gejala dilaporkan: user yang sudah dinonaktifkan, karena masih punya session di browser, **loading animation di-skip** dan langsung "login". Root cause code-verified di FE (`data-cy`/`7632dd92`):
  - NextAuth pakai **JWT strategy** (default) → session = cookie self-contained di browser. Callback `jwt`/`session` (`authOption.ts:32-112`) **hanya copy token, tak pernah round-trip ke server** untuk cek sesi masih ada / `isActive`.
  - **Tak ada `middleware.ts`** dan tak ada `getServerSession` guard di root layout (`app/[locale]/layout.tsx`). Gate masuk murni `useSession()` client → cookie valid-signature = `status: 'authenticated'` → render app, **loading di-skip**.
  - Mekanisme signout **ADA tapi REAKTIF** (`useAxiosPrivateApi.ts:72-110`): hanya jalan saat ada **request API yang gagal** — `SESSION_INVALIDATED` → signOut, atau `401` → refresh → gagal → signOut. Sebelum request API pertama, **tak ada yang mengusir** user nonaktif dari shell.
  - **Konsekuensi:** jendela waktu user nonaktif/di-logout-paksa tetap bisa masuk & melihat shell app (hingga request API pertama men-trigger 401). Ini sisi-FE dari F-6 (server: access-token gap; FE: cookie tak di-revalidate).

---

## Ringkasan Temuan (as-built)

| ID | Sev | Temuan | Area |
|---|---|---|---|
| F-4 | **HIGH** | Rotation tanpa reuse-detection (token theft tak terdeteksi) | Refresh |
| F-6 | **HIGH** | Access-token masih valid s/d 15m setelah sesi dicabut (bila ada guard JWT-only) | Revocation |
| F-9 | **HIGH** | FE percaya cookie NextAuth lokal tanpa re-validate → user nonaktif masuk shell (loading di-skip) | Revocation (FE) |
| F-2 | Medium | Refresh token plaintext di DB | Invalidation |
| F-5 | Medium | Bug: refresh perpendek sesi 7d→1d (komentar salah) | Refresh |
| F-1 | Medium | Logout hapus semua sesi (bukan current device) | Logout |
| F-3/F-7 | Low | `deactivateUser` tak set reason → tak ada toast FE | Revocation |
| F-8 | Info | Idle/absolute timeout policy belum tegas | Session |

> **Yang SUDAH BAGUS:** stateful session (bisa revoke pre-expiry), rotation, lockout, email-verified gate, event-driven propagation lintas service, reason→toast mechanism, access TTL pendek (15m).

---

## Rekomendasi per Temuan (standar-backed)

Deep-research best-practice (OWASP / RFC 9700 / RFC 7009 / NIST SP 800-63B-4 / Auth0 / Okta) dipetakan ke tiap temuan. Full research: lihat lampiran di bawah.

| ID | Temuan | Rekomendasi | Standar |
|---|---|---|---|
| **F-4** | Rotation tanpa reuse-detection | Di `refresh.strategy.validate()`, bandingkan token kirim vs `session.refreshToken`. Mismatch padahal sesi aktif = reuse → `deleteAllSessionsByUserId` + log security event + paksa re-auth (revoke seluruh family). | RFC 9700 §2.2.2 (rotation/sender-constrained **MUST** untuk public client), §4.14.2 (reuse detection); Auth0 token-family; Okta `detect_reuse` |
| **F-6** | Access-token valid s/d 15m setelah sesi dicabut | Pastikan **tiap request** verifikasi status sesi ke session store/cache, bukan hanya signature JWT. Cache TTL ≤ access-token TTL (15m). Konfirmasi tak ada guard JWT-only. | RFC 7009 §5 (access token tak otomatis mati saat refresh dicabut); OWASP Session (invalidate server-side) |
| **F-9** | FE percaya cookie lokal → user nonaktif masuk shell (loading skip) | Validasi sesi **saat bootstrap**, bukan hanya reaktif saat request gagal. Opsi lazy → berat: (a) **lightweight `/auth/me` (atau validate-session) saat app mount**, gate loading pada hasilnya, bukan cuma `useSession().status`; (b) `middleware.ts` + `getServerSession` untuk server-side gate; (c) pindah ke NextAuth **database session strategy** (revoke langsung efektif, tapi ubah arsitektur + per-request DB hit — timbang zero-perf). Rekomendasi: (a) — reuse endpoint existing, diff kecil, 1 fetch saat mount. | RFC 7009 §5; OWASP Session (invalidate server-side, jangan percaya token valid-signature sebagai bukti sesi aktif) |
| **F-2** | Refresh token plaintext di DB | Simpan **hash** (SHA-256) refresh token, lookup via indeks hash. Dump DB tak langsung = account takeover. | RFC 9700 §4.14.1 (kerahasiaan refresh token saat storage) |
| **F-5** | Bug refresh perpendek sesi 7d→1d | `handleSessionUpdate` (`:923`) ganti `CacheTTLEnum.ONE_DAY` → `ONE_WEEK` (sesuaikan komentar) ATAU definisikan sliding+absolute cap eksplisit. | RFC 9700 §4.14.2 (idle + absolute); Okta (lifetime inherited) |
| **F-1** | Logout hapus semua sesi | Putuskan produk: "logout this device" = hapus **current** sessionId saja; sediakan "logout all devices" terpisah + daftar sesi aktif + remote-terminate. | OWASP Session (daftar sesi aktif + remote terminate) |
| **F-3/F-7** | `deactivateUser` tak set reason | Tambah `USER_DEACTIVATED` ke `SessionInvalidationReasonEnum` + pesan; set reason sebelum hapus sesi → FE toast. | OWASP Session (log/alasan privilege change) |
| **F-8** | Idle/absolute timeout belum tegas | Definisikan: idle 15–30m (app low-risk) atau 2–5m (high-value), absolute 4–8 jam, **enforce server-side** pakai `lastActivity`. | OWASP Session #session-expiration; NIST AAL2 24 jam / 1 jam idle |

**Tambahan non-temuan (hardening, dari research):**
- **Account enumeration:** pastikan pesan error login generik (user-salah vs tak-ada vs terkunci tak dibedakan) + waspadai timing. (OWASP Auth #authentication-responses) — perlu verifikasi `ERROR_MESSAGE` di login.
- **Lockout DoS:** lockout per-akun 5/15m rawan lockout-as-DoS korban; pertimbangkan CAPTCHA/backoff + jaga jalur forgot-password tetap jalan saat terkunci. (OWASP Auth #captcha)
- **RabbitMQ revocation idempotensi:** consumer `USER_DEACTIVATED` harus idempotent + punya rekonsiliasi bila event hilang (drift state antar service).

### Prioritas fix
1. **F-4 reuse-detection** (HIGH, diff kecil — satu compare di validate).
2. **F-6 per-request session check** (HIGH — audit guard downstream, server).
3. **F-9 FE bootstrap session-validate** (HIGH — `/auth/me` saat mount, gate loading; sisi-FE dari F-6).
4. **F-5 TTL bug** (Medium, 1-line).
5. F-2 hash refresh token, F-3 reason, F-1 scope logout, F-8 timeout policy.

> **Change classification:** F-1/F-5/F-8 ubah behavior → **Phase 0 Change Intake** (`change-management.md`). F-2/F-3/F-4/F-6 = security hardening bug-fix (root-cause, bukan behavior baru). Promote file ini → Assessment Report formal setelah Reviewer Gate.

---

## Lampiran: Deep-Research Best-Practice (bersitasi)

> Sumber worker: OWASP Authentication/Session/JWT Cheat Sheets, RFC 9700 (OAuth 2.0 Security BCP), RFC 7009 (Token Revocation), RFC 6819, NIST SP 800-63B-4, Auth0 & Okta refresh-token docs.

### Angka kunci (untuk keputusan PM)
- **Lockout:** per-akun (bukan IP); exponential backoff > durasi tetap. NIST: delay bertambah s/d 1 jam, hard-disable 100 attempts. (OWASP Auth #account-lockout; NIST §3.2.2)
- **Access token TTL:** pendek (angka bukan norma; kebijakan risiko — 15m as-built = wajar). (RFC 9700 §4.14)
- **Refresh rotation grace period:** 0–60 detik (Okta default 30s) untuk race multi-tab.
- **Idle timeout:** 2–5m high-value / 15–30m low-risk. **Absolute:** 4–8 jam kerja kantoran. (OWASP #session-expiration)
- **NIST AAL:** AAL1 30 hari; AAL2 24 jam overall + 1 jam idle; AAL3 12 jam + 15m idle.

### Inti per topik
1. **Login:** lockout per-akun + backoff; error generik (anti-enumeration CWE-204); regenerate session saat privilege change (anti-fixation); binding IP/UA hanya untuk deteksi anomali, bukan kontrol keras (NAT/proxy/spoof).
2. **Invalidation:** JWT stateless tak bisa dicabut pre-expiry → butuh server-side session/allowlist + validasi per-request (as-built SatuInbox sudah stateful = sejalan). Denylist pakai `jti`+`iss`, JANGAN raw/SHA-256(token) (malleability). Access TTL pendek. Revoke refresh pada password-change/logout (RFC 9700 §4.14.2, RFC 7009 §2).
3. **Rotation:** reuse-detection **wajib** untuk public client (RFC 9700 §2.2.2); reuse = revoke seluruh **family** (Auth0), invalidate refresh terbaru + semua access-token sejak auth (Okta); idle + absolute TTL.
4. **Revocation saat aktif:** RFC 7009 §5 — access token TIDAK otomatis mati saat refresh dicabut → request berikut HARUS cek session store. Deaktivasi = hapus semua sesi (Mongo) + invalidate cache (Redis, TTL ≤ access TTL) + cabut refresh + versi baru. Role change → sesi lama invalid (cegah stale permission). Propagasi event-driven (RabbitMQ) = praktik arsitektur, butuh idempotensi + rekonsiliasi.

Full report tersimpan di transcript worker `deleg_5fd86623`; ringkasan di atas cukup untuk Assessment + PRD v0.

