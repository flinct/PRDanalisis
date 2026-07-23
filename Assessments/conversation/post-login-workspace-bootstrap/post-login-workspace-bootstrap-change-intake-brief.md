# Change Intake Brief: Post-Login Workspace Bootstrap and Conversation Gate

> **Domain:** Conversation / Auth / Workspace Bootstrap
> **Feature Type:** Existing behavior change
> **Requester:** Dany Christian
> **Analyst:** Dany Christian
> **Engineering Lead:** Naftal Yunior
> **Tanggal Brief:** 2026-07-20
> **Status:** Draft

## 0. Ringkasan Update Brief

- Request awal: ubah flow existing `login > direct ke Conversation` menjadi `login > landing/loading > Conversation`.
- Landing page dimaksudkan sebagai screen transisi untuk menyiapkan workspace user sebelum masuk ke Conversation.
- Klarifikasi lanjutan: organization sudah diketahui saat login; 1 user saat ini hanya punya 1 organization.
- Klarifikasi lanjutan: bila round robin enabled, phase loading tetap menjalankan proses round robin di backend.
- Klarifikasi lanjutan: yang dimaksud `all message` bukan preload seluruh message body, tetapi lookup seluruh conversation eligible untuk round robin sebelum page 1 Conversation ditampilkan.
- User meminta artefak assessment dengan 2-3 phase, termasuk phase 1 FE-first dengan progress loading acak 15-45 detik sambil proses RR BE tetap jalan.

## 1. Request Snapshot

### Original Request

Flow existing:
- login
- user langsung diarahkan ke halaman Conversation

Suggestion flow:
- login
- user tidak diarahkan ke Conversation terlebih dahulu
- user masuk ke landing page berupa loading + progress bar
- loading mensimulasikan proses persiapan workspace user
- setelah loading selesai, baru halaman Conversation ditampilkan

### Refined Request

Phase 1 yang diminta:
- setelah login, user masuk ke landing/loading page
- landing page menampilkan progress loading acak 15-45 detik
- pada saat yang sama, backend tetap menjalankan round robin bila config enabled
- secara backend user sudah dianggap aktif setelah login, namun belum masuk ke workspace Conversation
- user baru bisa mengakses halaman Conversation setelah progress selesai

Phase lanjutan:
- implementasi yang disarankan untuk mengganti fake loading menjadi readiness flow yang lebih deterministik
- tetap sertakan open questions dalam assessment

## 2. Change Classification

- **Change Type:** `BEHAVIOR_CHANGE`
- **Primary Domain:** `Conversation`
- **Secondary Domains:** `Auth`, `Assignment / Round Robin`, `Workspace Bootstrap`, `Realtime / Count`
- **Decision Scope:** `Cross-domain`
- **Risk Level:** `High`

### Classification Rationale
- Mengubah contract post-login routing dari direct workspace access menjadi gated workspace access.
- Menambahkan dependency operasional backend (round robin assignment execution) ke fase setelah login.
- Berpotensi mengubah assignment timing, perceived login completion, dan visibility data saat first render Conversation.
- Menyentuh shared behavior lintas auth, conversation list, count, member, setting, dan potensi socket/realtime sync.

## 3. Current State Verification

### Current Flow
- User login sukses.
- User langsung diarahkan ke halaman Conversation.
- Bootstrap data workspace terjadi di dalam halaman Conversation.
- Bila round robin punya trigger existing, trigger tersebut tidak dieksplisitkan dalam request ini.

### Confirmed Current Assumptions
- Saat ini setiap user hanya memiliki 1 organization.
- Organization seharusnya sudah ditentukan saat login.
- Multi-organization adalah future scope, bukan target phase awal ini.
- `roundRobinConfig.enabled === true` berarti proses RR melakukan execute assignment, bukan sekadar load config.
- `all message` pada request awal sebenarnya berarti lookup seluruh conversation eligible untuk RR, bukan fetch seluruh message body.
- Setelah RR selesai, halaman Conversation tetap hanya menampilkan page 1 list.

## 4. Problem Statement

Current flow direct-to-Conversation berpotensi menimbulkan dua gap:
1. Workspace bisa tampil saat backend masih menyiapkan assignment / state penting untuk Conversation.
2. User bisa masuk ke workspace sebelum proses RR backend selesai, sehingga first visible state dapat berubah setelah page tampil.

Request ini ingin menambah landing gate setelah login untuk memberi waktu menjalankan RR dan menahan akses ke Conversation sampai progress gate selesai.

## 5. Desired Outcome

- User tidak langsung masuk ke Conversation setelah login.
- User melihat screen transisi yang menjelaskan workspace sedang disiapkan.
- Jika RR enabled, RR backend tetap berjalan pada fase ini.
- User baru masuk ke Conversation setelah gate loading selesai.
- Phase 1 dapat shipped lebih cepat sebagai FE-first transitional solution.
- Phase lanjutan mengarah ke readiness model yang lebih akurat dan operasional lebih aman.

## 6. In Scope

### Phase 1 Candidate Scope
- Routing login success ke landing/loading page.
- FE progress/loading bar dengan durasi acak 15-45 detik.
- Trigger atau coexistence dengan RR execution di backend selama landing berjalan.
- Gate akses ke halaman Conversation sampai progress selesai.
- Messaging UI yang menjelaskan workspace sedang disiapkan.

### Later Phase Candidate Scope
- Replace fake timer dengan readiness-driven progress/state.
- Definisi dependency bootstrap yang benar-benar blocking vs non-blocking.
- Error handling, retry, timeout, dedup, dan observability RR-on-login.
- Pengamanan concurrency untuk multi-user login, multi-tab, dan refresh.

## 7. Out of Scope

- Multi-organization selection flow.
- Full preload seluruh message body conversation.
- Re-architecture penuh round robin di luar kebutuhan post-login gate, kecuali direkomendasikan di phase lanjutan.
- Page 1 Conversation pagination redesign.

## 8. Business / Operational Risks Observed Early

- RR execution adalah side effect write, bukan sekadar bootstrap read.
- Fake loading 15-45 detik bisa selesai sebelum RR benar-benar selesai, atau sebaliknya RR selesai jauh lebih cepat dari progress gate.
- Login success dan workspace access tidak lagi identik; perlu definisi state baru.
- Potensi concurrency tinggi jika banyak agent login bersamaan.
- Potensi mismatch antara perceived readiness di FE dan actual assignment readiness di BE.

## 9. Initial Open Questions

### Blocking / High Priority
1. Scope RR saat login: per-user, per-team, atau per-organization?
2. Jika banyak user login bersamaan, apakah RR harus single-flight / dedup atau boleh paralel?
3. RR existing saat ini sudah event-driven atau belum? Jika sudah, kenapa masih perlu RR-on-login?
4. Eligible conversation untuk RR saat login apa saja persisnya?
5. Kalau progress 15-45 detik selesai tapi RR backend belum selesai, apakah user tetap boleh masuk ke Conversation?
6. Kalau RR backend selesai lebih cepat dari progress acak, apakah user tetap harus menunggu sampai timer selesai?
7. Fallback saat RR gagal / timeout apa? Block, retry, atau allow partial access?

### Medium Priority
8. Jika user refresh saat landing, progress restart atau resume?
9. Multi-tab / multi-device login akan share RR job yang sama atau memicu job terpisah?
10. Bila RR disabled, apakah landing page tetap tampil atau login langsung ke Conversation?
11. Volume conversation realistis per organization berapa, untuk sizing durasi RR?
12. Apakah loading organization perlu tetap ditampilkan sebagai step UI walau organization sudah resolved saat login?

## 10. Proposed Next Artifact

- **Assessment Report** dengan phased recommendation:
  - Phase 1: FE-first loading gate dengan RR tetap berjalan di BE
  - Phase 2: readiness-aware bootstrap gate
  - Phase 3: optional architecture hardening / trigger correction jika diperlukan

## 11. Stage Transition Note

Brief ini dibuat sebagai baseline Phase 0 agar assessment berikutnya punya sumber perubahan yang jelas. Karena masih ada open questions penting, assessment harus ditandai minimal `Draft` dan memuat asumsi secara eksplisit.
