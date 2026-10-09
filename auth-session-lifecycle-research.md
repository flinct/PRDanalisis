# Riset Keamanan Siklus Hidup Auth & Sesi — Acuan Review SatuInbox

Lingkup: stack SatuInbox (NestJS, JWT access + refresh token dengan rotation, session store MongoDB, cache session Redis, event RabbitMQ). Semua klaim kunci diberi URL sumber. Klaim yang tidak bisa saya konfirmasi ke sumber otoritatif ditandai **(tidak terkonfirmasi)**.

Kerangka standar yang jadi rujukan utama:
- OWASP Authentication Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Session Management Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP JSON Web Token Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html
- RFC 9700 (OAuth 2.0 Security BCP, BCP 240, Jan 2025; meng-update RFC 6749/6750/6819) — https://www.rfc-editor.org/rfc/rfc9700.html
- RFC 7009 (OAuth 2.0 Token Revocation) — https://www.rfc-editor.org/rfc/rfc7009.html
- RFC 6819 (OAuth 2.0 Threat Model) — https://www.rfc-editor.org/rfc/rfc6819.html
- NIST SP 800-63B-4 — https://pages.nist.gov/800-63-4/sp800-63b.html
- Auth0 Refresh Token Rotation — https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
- Okta Refresh tokens guide — https://developer.okta.com/docs/guides/refresh-tokens/main/

## 1. LOGIN & SESSION CREATION

### Pola yang direkomendasikan
- **Lockout berbasis akun, bukan IP.** OWASP: penghitung kegagalan login harus dikaitkan ke akun itu sendiri, bukan IP sumber, supaya penyerang tidak bisa menghindar dengan banyak IP. Parameter yang harus ditentukan: lockout threshold, observation window, dan lockout duration. (https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout)
- **Exponential lockout lebih disarankan daripada durasi tetap.** OWASP: alih-alih lockout durasi tetap (mis. 10 menit), sebagian aplikasi memakai exponential lockout yang dimulai sangat singkat (mis. 1 detik) lalu berlipat ganda setiap kegagalan. (sumber sama, #account-lockout)
- **Backoff bertingkat sebagai alternatif.** NIST SP 800-63B-4 §3.2.2 (Rate Limiting/Throttling): verifier SHALL membatasi percobaan gagal berturut-turut pada satu akun, dan MAY memakai teknik seperti membuat pengguna menunggu makin lama ketika mendekati batas (contoh diberikan NIST: 30 detik sampai satu jam). NIST juga menetapkan batas atas disable authenticator pada 100 percobaan gagal berturut-turut. (https://pages.nist.gov/800-63-4/sp800-63b.html)
- **Cegah DoS akibat lockout.** OWASP mengingatkan lockout bisa dipakai menyerang pengguna lain (menutup akun korban); mitigasinya memberi jalur pemulihan seperti forgotten-password tetap bisa dipakai meski akun terkunci, dan memakai CAPTCHA sebagai kontrol defense-in-depth setelah beberapa kegagalan. (https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#captcha)
- **Anti-account-enumeration.** OWASP: untuk login, reset, dan registrasi, aplikasi harus mengembalikan pesan error generik tanpa membedakan apakah user ID/password salah, akun tidak ada, atau akun terkunci/disabled; tujuannya mencegah discrepancy factor (CWE-204). Perhatikan juga discrepancy dari waktu proses (timing attack). (https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses)
- **Session fixation: regenerate session/token saat privilege berubah.** OWASP: session ID harus di-renew setelah perubahan level privilege — terutama pada autentikasi (anonymous ke authenticated), juga password change, permission change, dan peralihan role ke admin; session ID lama harus diabaikan dan dihancurkan. Ini wajib untuk mencegah session fixation. (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#renew-the-session-id-after-any-privilege-level-change)
- **Praktik session management pendukung.** OWASP: pakai mekanisme strict (hanya terima ID yang dibuat server, tolak ID dari URL/user); batasi dan enkripsi session store at rest; log siklus hidup sesi (create/renew/destroy, login/logout, privilege change, timeout). (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- **Binding ke properti klien hanya sebagai deteksi.** OWASP: binding session ID ke IP/User-Agent/sertifikat disarankan untuk mendeteksi anomali dan bisa memicu alert/terminate, tetapi TIDAK bisa dipercaya sebagai kontrol keras karena NAT, proxy korporat, dan UA spoofing mudah dipakai penyerang. (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#binding-the-session-id-to-other-user-properties)
- **Concurrent session policy.** OWASP merekomendasikan aplikasi memberi kemampuan melihat daftar sesi aktif, memantau concurrent logons, menyediakan fitur remote terminate, dan menyimpan logbook (IP, User-Agent, waktu login, idle time). Angka konkret batas sesi paralel tidak ditetapkan OWASP — itu keputusan produk **(tidak terkonfirmasi** ada angka normatif).

### Pitfall / anti-pattern
- Counter failed-login hanya per IP → brute force tersebar mudah lolos.
- Lockout fixed tanpa proteksi DoS → vektor lockout-as-DoS terhadap user sah.
- Pesan error spesifik atau respons time berbeda antara user-ada vs user-tidak-ada → enumerasi.
- Memakai ulang session/token pra-login sebagai token post-login, atau menerima session ID dari URL → session fixation.
- Mengandalkan binding IP/UA sebagai kontrol keamanan keras → memutus pengguna mobile/NAT, sementara penyerang tetap bisa bypass.
- Menyimpan session (dan refresh token) dalam bentuk plaintext di store/cache.

### Standar relevan
OWASP Authentication & Session Management Cheat Sheets; NIST SP 800-63B-4 §3.2.2 (rate limiting) dan tabel AAL (lihat Topik 4); RFC 6819 (threat model, kini di-update RFC 9700 — https://www.rfc-editor.org/rfc/rfc9700.html).

## 2. TOKEN INVALIDATION / LOGOUT / FORCE-LOGOUT

### Masalah inheren JWT stateless
OWASP JWT Cheat Sheet: JWT sering disarankan untuk sesi stateless, tetapi untuk sesi pengguna dibutuhkan solusi pengelolaan invalidasi sesi; ini bisa dilakukan dengan deny list sesi/token — dan begitu ada deny list, sesi tidak lagi sepenuhnya stateless sehingga manfaat stateless bisa hilang; OWASP menyarankan mempertimbangkan sistem session biasa (ikuti Session Management Cheat Sheet). (https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html#considerations-about-using-jwts)

### Pola yang direkomendasikan
- **Server-side session/allowlist + validasi per request.** Untuk arsitektur seperti SatuInbox (sessionId + isActive + invalidatedAt + reason di MongoDB, cache di Redis), invalidation menjadi efektif hanya kalau tiap request memverifikasi status sesi ke sumber otoritatif (store/cache), bukan hanya percaya pada JWT yang valid secara kriptografis. Dasar normatifnya: OWASP mewajibkan invalidation sisi server saat logout dan saat sesi kedaluwarsa. (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#logout-button)
- **Denylist yang benar memakai jti + iss.** OWASP JWT: deny list tipikal diimplementasikan berdasarkan klaim jti dan iss. Peringatan penting: memakai raw JWT ATAU hash JWT (SHA-256(token)) sebagai key denylist TIDAK aman karena bisa di-bypass via JWT malleability (parsing longgar, atau malleability tanda tangan ECDSA). (https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html#jwt-denylist)
- **Alternatif skala besar: Token Status List (TSL).** OWASP JWT: bila issuer perlu mencabut JWT, TSL mengagregasi status banyak token dalam bentuk terkompresi dan konsumen token mengeceknya. (https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html#jwt-revocation)
- **Access token TTL pendek.** RFC 9700 §4.14: refresh token justru menambah keamanan karena membuat AS dapat menerbitkan access token berumur pendek dan scope terbatas, sehingga mengurangi dampak kebocoran access token. (https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14) Angka TTL detik/menit konkret tidak ditetapkan RFC **(tidak terkonfirmasi** ada nilai normatif; ini kebijakan risiko).
- **Token/session versioning (praktik).** Menaikkan versi sesi/token per user saat password change, role change, atau deaktivasi, lalu menolak token dengan versi lama, adalah praktik industri yang umum untuk memberi efek revoke cepat; kepuasan normatifnya berasal dari kewajiban invalidasi sesi saat perubahan privilege (OWASP, #renew-the-session-id-after-any-privilege-level-change) dan kebutuhan invalidation sesi JWT (OWASP JWT #considerations-about-using-jwts). Istilah token versioning tidak disebut eksplisit sebagai norma di sumber yang saya ambil **(tidak terkonfirmasi** sebagai standar formal).
- **Force-logout yang benar.** RFC 9700 §4.14.2: AS MAY mencabut refresh token otomatis pada security event seperti password change atau logout di AS. RFC 7009 §2: revoke request menginvalidasi token tersebut dan, bila berlaku, token lain yang berbasis authorization grant yang sama beserta grant-nya. Jadi force-logout admin sebaiknya = tandai sesi invalid + alasan + balas event, sekaligus cabut refresh token; dan karena access token yang sudah terbit tidak otomatis mati (lihat gap di bawah), validasi sesi per request adalah penopang utamanya.
- **Simpan refresh token dalam bentuk hash (praktik industri, bukan kutipan standar).** RFC 9700 §4.14.1 mensyaratkan kerahasiaan refresh token saat transit dan saat disimpan (confidentiality in transit and storage). (https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14.1) Menyimpan hash (mis. SHA-256) alih-alih token mentah sehingga dump DB tidak langsung memberi account takeover adalah praktik umum di industri, tetapi kalimat eksplisit yang menyuruh hashing refresh token tidak saya temukan di OWASP/RFC yang diambil **(tidak terkonfirmasi** sebagai norma eksplisit). Catatan teknis: karena refresh token opaque ber-entropi tinggi (tidak bisa di-brute force), hash cepat memadai dan pencarian dilakukan via indeks hash; ini inferensi, bukan kutipan.

### Pitfall / anti-pattern
- Logout hanya menghapus token di client sementara token tetap valid sampai exp.
- Denylist di-key dengan raw token atau SHA-256(token) → bypass malleability (OWASP JWT #jwt-denylist).
- Refresh token disimpan plaintext → kebocoran DB = pengambilalihan akun (melanggar syarat kerahasiaan storage RFC 9700 §4.14.1).
- Force-logout hanya mencabut refresh token, sementara access token masih hidup sampai exp (RFC 7009 §5, lihat Topik 4).
- Menghapus sesi di Mongo tetapi cache Redis/gateway masih memegang status lama → sesi yang sudah dicabut tetap lolos.

### Standar relevan
RFC 9700 §4.14.1/§4.14.2, RFC 7009 §2 (https://www.rfc-editor.org/rfc/rfc7009.html#section-2), OWASP JWT Cheat Sheet (#jwt-revocation, #jwt-denylist), OWASP Session Management (#logout-button).

## 3. REFRESH TOKEN ROTATION

### Pola yang direkomendasikan
- **Wajib untuk public client: sender-constrained ATAU rotation.** RFC 9700 §2.2.2: refresh token untuk public client MUST sender-constrained atau memakai refresh token rotation. (https://www.rfc-editor.org/rfc/rfc9700.html#section-2.2.2)
- **Definisi rotation + reuse detection.** RFC 9700 §4.14.2: AS menerbitkan refresh token baru pada setiap respons refresh; refresh token sebelumnya diinvalidasi tetapi informasi relasi tetap disimpan. Jika refresh token dicuri dan dipakai oleh penyerang maupun client sah, salah satunya akan mempresent token yang sudah invalid → AS mengetahui terjadi breach; AS tidak bisa menentukan pihak mana yang sah, tetapi akan mencabut refresh token aktif, menghentikan serangan dengan konsekuensi client sah harus mendapat authorization grant baru. (https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14.2)
- **Family/lineage.** RFC 9700 implementation note: grant dapat di-encode ke dalam refresh token sehingga AS dapat menentukan grant dan semua refresh token yang perlu dicabut; AS MUST memastikan integritas nilai token (mis. levat tanda tangan). (sumber sama, §4.14.2) Auth0 menyebutnya token family: semua refresh token turunan dari refresh token awal diinvalidasi seketika saat reuse terdeteksi, dan semua request ditolak sampai pengguna re-authentication. (https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation#automatic-reuse-detection)
- **Perilaku reuse detection yang terukur.** Okta: saat refresh token yang sudah dipakai dipakai lagi, AS otomatis mendeteksi reuse dan langsung menginvalidasi refresh token terbaru plus semua access token yang diterbitkan sejak user terautentikasi; tersedia System Log event (app.oauth2.as.token.detect_reuse). (https://developer.okta.com/docs/guides/refresh-tokens/main/)
- **Grace period kecil untuk race condition client.** Okta menyediakan grace period 0–60 detik (default 30 detik) ketika rotation aktif, agar token sebelumnya masih valid sesaat setelah rotate — ditujukan untuk masalah jaringan klien. (sumber sama)
- **TTL: idle + absolute.** RFC 9700 §4.14.2: refresh token SHOULD expire bila client tidak aktif (tidak dipakai memperoleh access token baru) selama kurun waktu tertentu; durasi ditentukan AS. Okta: refresh token lifetime default Unlimited, namun kedaluwarsa setiap tujuh hari jika tidak dipakai (idle), dan ketika rotation terjadi tanggal kedaluwarsa tetap sama — lifetime diwarisi dari refresh token awal (absolute). (source Okta di atas) Ini konsisten dengan filosofi idle + absolute timeout OWASP di Topik 4.

### Pitfall / anti-pattern
- Rotation tanpa reuse detection → pencurian token tidak pernah terdeteksi.
- Reuse detection tanpa pencabutan seluruh family → hanya satu token mati, penyerang tetap aktif (Auth0: invalidasi seluruh token family).
- Grace period panjang → melemahkan deteksi; Okta membatasi maksimal 60 detik.
- Sliding TTL tanpa batas absolut → sesi bisa hidup selamanya.
- Hanya menyimpan token terakhir tanpa menyimpan hash token lama yang sudah invalid → reuse tidak bisa dideteksi (family/lineage hilang).
- Refresh paralel dari beberapa tab tanpa serialisasi di client → false-positive reuse detection dan user ter-logout (alasan grace period Okta).
- Rotation dianggap hanya untuk public client; RFC 9700 memakai MUST untuk public client, tetapi rotation + reuse detection tetap praktik baik untuk client confidential karena tetap mengurangi dampak kebocoran.

### Standar relevan
RFC 9700 §2.2.2 dan §4.14.x (https://www.rfc-editor.org/rfc/rfc9700.html#refresh_token_protection), RFC 6749 (grant refresh_token, error invalid_grant — https://www.rfc-editor.org/rfc/rfc6749.html), RFC 6819 (§5.2.2.x rotation/revocation), Auth0 & Okta docs di atas.

## 4. INACTIVE-USER-WITHOUT-LOGOUT & REVOKASI SESI SAAT USER AKTIF

### Idle timeout vs absolute timeout (angka rekomendasi)
- OWASP Session Management: semua sesi harus punya idle timeout dan absolute timeout. Rentang umum idle timeout: 2–5 menit untuk aplikasi high-value, 15–30 menit untuk aplikasi low risk. Absolute timeout bergantung durasi pemakaian; untuk aplikasi pekerja kantor sepanjang hari, rentang yang layak 4–8 jam. Timeout WAJIB di-enforce di sisi server (kalau client yang menegakkan, penyerang bisa memanipulasi). (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration)
- OWASP juga mengenal renewal timeout: session ID di-renew secara berkala di tengah sesi, independen dari aktivitas, untuk mempersempit jendela hijack. (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#renewal-timeout)
- NIST SP 800-63B-4 (tabel AAL, reauthentication recommended): AAL1 30 hari (overall); AAL2 24 jam overall + 1 jam inactivity; AAL3 12 jam overall + 15 menit inactivity. NIST: session SHALL dihentikan ketika salah satu timeout kedaluwarsa; aktivitas sesi mereset inactivity timeout; reauthentication sukses mereset kedua timeout. (https://pages.nist.gov/800-63-4/sp800-63b.html)

### Gap real-time revocation (user masih login)
- RFC 7009 §5 secara eksplisit menyatakan: jika AS tidak mendukung access token revocation, access token TIDAK akan langsung invalid ketika refresh token terkait dicabut; deployment harus memperhitungkan ini dalam analisis risiko. (https://www.rfc-editor.org/rfc/rfc7009.html#section-5)
- RFC 7009 §2: client yang patuh RFC 6749 harus siap menghadapi invalidation token tak terduga kapan saja — resource owner bisa mencabut grant atau AS bisa menginvalidasi token untuk mitigasi ancaman. (https://www.rfc-editor.org/rfc/rfc7009.html#section-2)
- Konsekuensi desain: mencabut/menghapus sesi user yang sedang login (mis. admin menonaktifkan user) tidak otomatis mematikan access token JWT yang sudah terbit. Agar efeknya seketika, request berikutnya harus memverifikasi status sesi ke store otoritatif (MongoDB/Redis) — inilah alasan allowlist sesi + TTL cache yang pendek lebih andal daripada mengandalkan exp JWT. Dukungan OWASP: session harus di-invalidate di sisi server, dan aplikasi sebaiknya menyediakan daftar sesi aktif dengan kemampuan remote terminate. (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#automatic-session-expiration)
- Propagasi ke microservices: tidak ada RFC yang mengatur pola propagasi event revocation. Rekomendasi arsitektur yang lazim (dan selaras dengan RFC 7009 §2 soal kesiapan menghadapi invalidation tak terduga): (a) validasi terpusat di gateway/API terhadap session store atau token introspection; (b) publish event revocation (RabbitMQ) agar cache lokal tiap service di-invalidasi; (c) jangan memperlakukan JWT yang valid secara tanda tangan sebagai bukti sesi masih aktif. Pola event-driven ini praktik arsitektur, bukan norma standar **(tidak terkonfirmasi** sebagai standar formal).

### Stale permission setelah role/deactivation change
- OWASP: session ID harus di-renew saat perubahan privilege (password change, permission change, peralihan ke admin), session ID lama diabaikan dan dihancurkan. (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#renew-the-session-id-after-any-privilege-level-change)
- Implikasi untuk SatuInbox: deaktivasi user yang sedang login harus menghapus semua sesi (Mongo) + membersihkan cache (Redis) + mencabut refresh token + memulai token/session version baru, dan role change harus memperlakukan sesi lama sebagai tidak valid. Tanpa itu, klaim role di access token lama tetap dipakai sampai exp (stale permission).
- Praktik: ambil otorisasi/role dari sumber otoritatif (atau cache dengan TTL sangat pendek) alih-alih sepenuhnya percaya klaim role di token berumur panjang; ini mitigasi praktik **(tidak terkonfirmasi** sebagai norma eksplisit di sumber yang diambil).

### Pitfall / anti-pattern
- Hanya idle timeout tanpa absolute timeout → penyerang bisa menjaga sesi hidup dengan aktivitas berkala (OWASP: idle timeout tidak membatasi attacker yang sudah hijack).
- Timeout hanya di client (dapat dimanipulasi).
- Admin menonaktifkan user hanya dengan mengubah flag DB, sementara access token JWT masih valid sampai exp (RFC 7009 §5).
- Role change tidak diikuti renewable/invalidasi sesi → stale permission.
- Sesi dihapus di Mongo tetapi masih hidup di cache Redis/gateway → revoke tidak efektif; cache harus di-invalidate dan TTL-nya tidak lebih panjang dari masa berlaku access token.
- Event revocation di RabbitMQ tanpa idempotensi/fallback (republish, TTL, polling rekonsiliasi) → state antar service bisa drift.

### Standar relevan
OWASP Session Management (#session-expiration, #idle-timeout, #absolute-timeout, #renewal-timeout, #renew-the-session-id-after-any-privilege-level-change), NIST SP 800-63B-4 (AAL reauth + session timeouts), RFC 7009 §2 dan §5.

## Tabel Ringkas: Rekomendasi vs Pitfall

| Topik | Rekomendasi (dengan sumber) | Pitfall / anti-pattern | Standar |
|---|---|---|---|
| 1. Login & session creation | Lockout per akun + exponential backoff (OWASP Auth #account-lockout); NIST: batasi percobaan gagal, delay bertambah sampai 1 jam (SP 800-63B-4 §3.2.2); pesan error generik (OWASP #authentication-responses); regenerate token saat privilege change (OWASP Session #renew-the-session-id-after-any-privilege-level-change); binding IP/UA hanya untuk deteksi | Counter per IP; lockout tanpa proteksi DoS; pesan error/timing berbeda; reuse session ID pra-login (session fixation); binding IP sebagai kontrol keras; simpan token plaintext | OWASP Auth & Session; NIST SP 800-63B-4; RFC 6819 |
| 2. Invalidation / logout / force-logout | Validasi sesi server-side per request (allowlist); denylist via jti+iss, jangan raw/SHA-256(token) (OWASP JWT #jwt-denylist); TSL untuk skala besar; access token TTL pendek (RFC 9700 §4.14); revoke refresh token pada password change/logout (RFC 9700 §4.14.2; RFC 7009 §2); hash refresh token sebelum simpan (praktik; RFC 9700 §4.14.1 mensyaratkan kerahasiaan storage) | Logout hanya di client; denylist di-key raw token/hash token; refresh token plaintext di DB; force-logout tanpa validasi access token; cache/gateway masih memegang sesi lama | RFC 9700 §4.14.x; RFC 7009; OWASP JWT |
| 3. Refresh token rotation | Rotation + reuse detection wajib untuk public client (RFC 9700 §2.2.2, §4.14.2); revoke seluruh token family saat reuse (Auth0); invalidate refresh token terbaru + semua access token sejak auth (Okta); grace period 0–60 s (Okta); TTL idle + absolute cap (RFC 9700 §4.14.2; Okta lifetime) | Rotation tanpa reuse detection; reuse detection tanpa family revocation; grace period panjang; sliding TTL tanpa absolute; tidak menyimpan hash token lama/lineage; refresh paralel tanpa serialisasi client | RFC 9700 §2.2.2/§4.14; RFC 6749; Auth0 & Okta docs |
| 4. Revocation saat user aktif / inactive-without-logout | Idle 2–5 menit (high-value) atau 15–30 menit (low risk), absolute 4–8 jam, enforced server-side (OWASP Session #session-expiration); NIST AAL1 30 hari, AAL2 24 jam/1 jam idle, AAL3 12 jam/15 menit idle; revoke = hapus semua sesi + invalidate cache + cabut refresh token + naikkan versi token; validasi terpusat + event revocation (praktik) | Idle tanpa absolute; timeout di client; hanya ubah flag DB tanpa mematikan access token (RFC 7009 §5); stale permission pasca role change; sesi hidup di cache; event tanpa idempotensi/fallback | OWASP Session; NIST SP 800-63B-4; RFC 7009 §2 & §5 |

## Catatan penerapan untuk review SatuInbox
- **Yang sudah sejalan:** access + refresh JWT, rotation, session tersimpan di MongoDB dengan isActive/lastActivity/expiresAt/invalidatedAt/reason, cache Redis, lockout failed-attempts, force-logout dengan alasan, dan penghapusan sesi saat user dinonaktifkan — semuanya cocok dengan pola di atas.
- **Yang perlu dipastikan saat review:** (1) apakah reuse detection benar-benar mencabut seluruh family dan menyimpan hash token yang sudah invalid; (2) apakah refresh token mentah disimpan di DB (sebaiknya hash); (3) apakah tiap request memverifikasi status sesi (bukan hanya memvalidasi tanda tangan JWT) sehingga force-logout efektif sebelum exp; (4) apakah cache Redis di-invalidate bersamaan dengan penghapusan sesi dan TTL-nya tidak melebihi access token; (5) apakah ada absolute timeout di samping idle timeout; (6) apakah semua endpoint login memakai pesan error generik; (7) apakah consumers RabbitMQ idempotent dan punya rekonsiliasi bila event hilang.

Sumber yang saya akses langsung: OWASP Authentication/Session/JWT Cheat Sheets, RFC 9700, RFC 7009, NIST SP 800-63B-4, Auth0 Refresh Token Rotation, Okta Refresh tokens guide, Auth0 Token Best Practices.
