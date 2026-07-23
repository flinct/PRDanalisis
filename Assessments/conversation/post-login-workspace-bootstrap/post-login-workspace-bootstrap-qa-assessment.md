# Assessment Report: Post-Login Workspace Bootstrap and Conversation Gate

> **Domain:** Conversation / Auth / Workspace Bootstrap
> **Feature Name:** Post-Login Workspace Bootstrap and Conversation Gate
> **Related Brief:** `Assessments/conversation/post-login-workspace-bootstrap/post-login-workspace-bootstrap-change-intake-brief.md`
> **Analyst:** Dany Christian
> **Engineering Lead:** Naftal Yunior
> **Tanggal Analisa:** 2026-07-20
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Existing behavior direct `login > Conversation` dianalisa untuk diubah menjadi `login > landing/loading > Conversation`.
- Klarifikasi terbaru mengubah asumsi penting: fake loading Phase 1 bukan purely cosmetic; selama landing berjalan, RR backend tetap dieksekusi bila config enabled.
- Organization dianggap sudah resolved saat login untuk current scope 1 user = 1 organization.
- `all message` pada request awal diinterpretasi ulang sebagai lookup semua conversation eligible untuk RR, bukan preload semua message body.
- User meminta assessment memuat 2-3 phase, dengan Phase 1 sebagai FE-first gate dan phase berikutnya sebagai implementasi yang lebih direkomendasikan.
- Diagram `Current vs Proposed State` disatukan kembali ke file assessment agar review presentasi cukup buka satu artefak.

---

## 1. Overview

### 1.1 Current Flow
- User login sukses.
- User langsung diarahkan ke halaman Conversation.
- Workspace bootstrap terjadi di dalam halaman Conversation.
- Jika RR atau assignment adjustment terjadi, user berpotensi melihat state workspace sebelum assignment stabil.

### 1.2 Proposed Direction
- User login sukses.
- User diarahkan ke landing/loading page terlebih dahulu.
- Selama landing, sistem menjalankan persiapan workspace; untuk Phase 1 progress masih acak 15-45 detik.
- Bila `roundRobinConfig.enabled === true`, backend tetap menjalankan RR assignment selama fase ini.
- User baru boleh mengakses halaman Conversation setelah gate progress selesai.

### 1.3 Core Intent
Intent utama bukan hanya polish UI, tetapi menahan akses ke workspace sampai ada jendela waktu untuk RR backend berjalan dan menstabilkan first visible workspace state.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

### 2.2 Decision Rationale

Feature ini boleh lanjut sebagai phased delivery, tetapi dengan batasan penting:
- Phase 1 boleh dipakai sebagai transitional gate, bukan final architecture.
- Phase 1 tidak boleh diposisikan sebagai indikator readiness backend yang akurat karena progress masih berbasis timer acak.
- Phase 2 wajib mengganti timer gate menjadi readiness-aware orchestration bila feature terbukti dibutuhkan.
- RR-on-login adalah side effect operasional dengan blast radius besar; concurrency, timeout, dedup, dan fallback tidak boleh dibiarkan implicit.

### 2.3 Required Actions Before Development

1. Lock scope RR-on-login: per-user / per-team / per-org.
2. Lock behavior saat timer selesai tetapi RR belum selesai.
3. Lock behavior saat RR selesai lebih cepat dari timer.
4. Lock policy refresh / multi-tab / concurrent login.
5. Lock fallback saat RR gagal atau timeout.
6. Tambahkan observability minimum di Phase 1 agar evaluasi phase selanjutnya punya data nyata.

---

## 3. Current vs Proposed State

### 3.1 Current State

```text
CURRENT STATE

┌─────────────────┐
│ Login Success   │
└────────┬────────┘
         │
         v
┌──────────────────────────┐
│ Redirect to Conversation │
└────────┬─────────────────┘
         │
         v
┌──────────────────────────┐
│ Conversation Page Mount  │
└────────┬─────────────────┘
         │
         ├─ Fetch page 1 conversation list
         ├─ Fetch count
         ├─ Fetch filter
         ├─ Fetch member
         ├─ Fetch setting
         │
         v
┌──────────────────────────┐
│ User sees workspace      │
│ while state may still    │
│ be changing              │
└──────────────────────────┘
```

### 3.2 Proposed State — Phase 1

```text
PROPOSED STATE — PHASE 1

┌─────────────────┐
│ Login Success   │
└────────┬────────┘
         │
         v
┌──────────────────────────┐
│ User marked active in BE │
└────────┬─────────────────┘
         │
         v
┌──────────────────────────┐
│ Redirect to Landing Gate │
└────────┬─────────────────┘
         │
         ├─ FE shows random progress 15–45s
         ├─ BE runs RR if enabled
         │
         v
┌──────────────────────────┐
│ Progress complete        │
└────────┬─────────────────┘
         │
         v
┌──────────────────────────┐
│ Redirect to Conversation │
│ page 1                   │
└──────────────────────────┘
```

### 3.3 Proposed State — Recommended Later Direction

```text
PROPOSED STATE — RECOMMENDED LATER DIRECTION

┌─────────────────┐
│ Login Success   │
└────────┬────────┘
         │
         v
┌──────────────────────────┐
│ Post-login bootstrap     │
│ orchestrator             │
└────────┬─────────────────┘
         │
         ├─ RR trigger / RR status explicit
         ├─ Blocking readiness checked
         ├─ Non-blocking data deferred
         │
         v
┌──────────────────────────┐
│ Conversation opens when  │
│ readiness or fallback    │
│ policy is satisfied      │
└──────────────────────────┘
```

### 3.4 Key Difference Summary
- **Current:** login langsung membuka workspace.
- **Phase 1:** login membuka landing gate dulu, sambil RR backend tetap berjalan.
- **Later Direction:** landing gate tidak lagi berbasis timer acak, tetapi readiness state yang nyata.

---

## 4. Scope and Assumptions

### 4.1 Locked Assumptions
- Current scope: 1 user hanya punya 1 organization.
- Organization sudah ditentukan saat login.
- Multi-organization adalah future scope.
- RR execution hanya relevan jika `roundRobinConfig.enabled === true`.
- RR melakukan execute assignment, bukan hanya read config.
- Page yang tampil setelah gate tetap Conversation list page 1.
- `all message` berarti lookup semua conversation eligible RR, bukan preload message body.

### 4.2 Assessment Assumptions
- Landing page berada di antara auth success dan Conversation route.
- User dianggap active di backend segera setelah login sukses, walau FE belum membuka workspace.
- RR execution bisa mulai sebelum user melihat halaman Conversation.
- Tidak ada perubahan target phase ini ke multi-org selector.

---

## 5. Impact Analysis

### 5.1 Auth and Routing Impact
**Impact Level:** High

- Contract login berubah dari direct workspace access menjadi gated workspace access.
- Harus ada state baru antara `authenticated` dan `workspace-ready`.
- Deep link, refresh, browser back, dan session restore perlu definisi ulang.
- Jika progress screen mandatory, auth success tidak lagi identik dengan usable workspace.

### 5.2 Round Robin / Assignment Impact
**Impact Level:** High

- RR menjadi dependency pasca-login, bukan murni background concern.
- RR adalah side effect write; berarti login flow sekarang memicu perubahan assignment data.
- Risiko race condition tinggi jika banyak agent login bersamaan.
- Bila RR scope tidak dibatasi, satu login berpotensi memicu full-org rebalance yang besar.

### 5.3 Conversation Data Loading Impact
**Impact Level:** High

- Lookup semua conversation eligible RR berpotensi mahal pada org besar.
- Walau page render tetap page 1, RR mungkin perlu scan dataset jauh lebih besar dari yang akan ditampilkan.
- Jika RR berjalan lama, fake timer bisa selesai sebelum backend siap.

### 5.4 Count / Filter / Member / Setting Impact
**Impact Level:** Medium

- Secara business, screen ini memposisikan count/filter/member/setting sebagai bagian dari “workspace preparation”.
- Namun tidak semua dependency harus blocking untuk membuka page 1 Conversation.
- Tanpa klasifikasi blocking vs non-blocking, phase lanjutan berisiko over-blocking dan memperlambat masuk workspace tanpa manfaat setara.

### 5.5 Realtime / Socket Impact
**Impact Level:** Medium to High

- Harus ditentukan kapan socket/connect lifecycle dimulai.
- Jika socket hidup saat gate belum selesai, event bisa datang sebelum list/count state siap.
- Jika socket ditunda sampai Conversation mount, snapshot pertama bisa stale beberapa detik.

### 5.6 UX / Perception Impact
**Impact Level:** High

- Positif: user tidak melihat workspace setengah siap.
- Negatif: user dipaksa menunggu meski RR mungkin selesai cepat atau bahkan tidak dibutuhkan.
- Fake progress 15-45 detik mudah dipersepsikan sebagai artificial delay jika tanpa penjelasan step/status yang jujur.

### 5.7 Operational / Observability Impact
**Impact Level:** High

- Harus ada metric untuk:
  - login success time
  - landing duration
  - RR triggered / skipped
  - RR duration
  - timer finish before RR
  - RR finish before timer
  - RR timeout / fail
  - conversation access granted
- Tanpa metric ini, phase 2 akan didesain berdasarkan persepsi, bukan data.

### 5.8 QA / Regression Impact
**Impact Level:** High

- Semua test login flow berubah.
- Harus tambah coverage untuk progress gate, refresh, timeout, RR disabled, RR fail, concurrent login, dan eventual page render.
- Automation tidak bisa hanya assert redirect ke Conversation lagi.

---

## 6. Risks and Failure Modes

### 6.1 Phase 1 Fake-Readiness Risk
- Timer acak 15-45 detik bukan sumber kebenaran readiness.
- Timer bisa selesai saat RR belum selesai.
- Timer bisa masih berjalan saat RR sudah selesai jauh lebih dulu.
- User trust turun jika progress terasa tidak terkait kondisi sistem sebenarnya.

### 6.2 Concurrency Risk
- Multi-user login bersamaan bisa memicu RR job bertumpuk.
- Multi-tab / refresh bisa memicu duplicate trigger jika tidak ada dedup.
- Jika RR scope luas, beban DB/service bisa naik tajam di jam login massal.

### 6.3 Partial Completion Risk
- Sebagian assignment bisa selesai, sebagian belum, lalu user tetap masuk workspace.
- Tanpa status RR yang eksplisit, UI sulit menjelaskan apakah workspace sudah stabil atau masih berubah.

### 6.4 Timeout / Failure Policy Gap
- Belum ada keputusan apakah RR failure harus block access.
- Belum ada keputusan apa yang terjadi jika timer selesai tapi RR stuck.
- Belum ada keputusan apakah fallback adalah retry, skip, banner warning, atau allow access with degraded state.

### 6.5 Architecture Smell Risk
- Jika alasan RR-on-login adalah menutup gap trigger RR existing, ada risiko login dipakai sebagai workaround untuk masalah event-driven RR yang seharusnya dibenahi di source.
- Phase 2 harus menilai apakah login gate memang final design atau hanya transitional mitigation.

---

## 7. Phased Recommendation

## 7.1 Phase 1 — FE Gate + BE RR Coexistence

### Objective
Kirim perubahan cepat agar user tidak langsung masuk ke Conversation, sambil memberi jendela waktu bagi RR backend untuk berjalan setelah login.

### Scope
- Login success redirect ke landing/loading page.
- FE progress bar / loading state berdurasi acak 15-45 detik.
- Jika RR enabled, BE RR tetap dijalankan setelah login karena user sudah dianggap active.
- User hanya bisa masuk ke Conversation setelah progress selesai.
- Setelah gate selesai, tampilkan Conversation page 1.

### Why This Phase Exists
- Memberi ruang delivery cepat.
- Memisahkan perubahan routing/UX dulu dari orkestrasi readiness backend penuh.
- Dapat dipakai untuk validasi apakah menahan akses ke workspace memang memperbaiki first-use perception.

### Mandatory Controls
- Wajib tambahkan instrumentation basic.
- Wajib definisikan policy saat RR belum selesai ketika timer habis.
- Wajib tampilkan copy yang jujur: workspace sedang disiapkan, bukan menjanjikan semua data pasti selesai.
- Wajib log apakah RR skipped karena config disabled.

### Acceptable Limitation
- Progress tidak merefleksikan readiness aktual.
- Phase ini transitional, bukan end-state.

### QA Focus
- Redirect login ke landing.
- Timer within configured range.
- Conversation inaccessible before progress complete.
- RR enabled vs disabled path.
- Refresh / reopen browser behavior.
- Timer done + RR not done behavior.

---

## 7.2 Phase 2 — Readiness-Aware Bootstrap Gate

### Objective
Ganti fake progress dengan bootstrap gate yang tahu dependency mana blocking dan mana non-blocking.

### Scope
- Tentukan readiness contract pasca-login.
- RR status jadi explicit state, bukan hanya background assumption.
- Conversation dibuka berdasarkan condition yang terdefinisi, bukan timer acak.
- Pisahkan blocking vs non-blocking dependency:
  - blocking candidate: auth valid, org resolved, minimal conversation assignment state / RR decision state
  - non-blocking candidate: secondary count, full member hydration, non-critical setting

### Recommended Direction
- Bila RR benar-benar wajib sebelum workspace dipakai, gunakan RR job state / acknowledgement, bukan fake timer.
- Bila RR tidak harus full complete sebelum page 1 tampil, izinkan partial open dengan explicit banner/state.
- Prefer targeted readiness daripada “load everything”.

### Benefits
- UX lebih jujur.
- Delay lebih sesuai kondisi nyata.
- Lebih mudah debug mismatch antara FE progress dan BE state.

### Dependencies
- Jawaban untuk open questions blocking.
- Minimal observability hasil Phase 1.
- Kejelasan RR trigger architecture existing.

---

## 7.3 Phase 3 — Round Robin Trigger Hardening / Architectural Cleanup

### Objective
Pastikan RR-on-login tidak menjadi workaround permanen untuk trigger RR yang semestinya event-driven.

### Candidate Scope
- Audit trigger RR existing.
- Tentukan apakah login adalah trigger primer, trigger sekunder, atau hanya fallback.
- Tambahkan dedup, lock, idempotency, cycle/job identity.
- Tangani multi-tab, concurrent login, dan retry semantics.
- Optimasi eligible conversation lookup agar tidak full-scan tak perlu.

### When Needed
- Jika Phase 1/2 menunjukkan RR-on-login menimbulkan beban besar.
- Jika ditemukan conversation unassigned terjadi karena gap trigger lain.
- Jika multi-agent login memicu contention atau duplicate assignment behavior.

---

## 8. Recommended Guardrails

1. Jangan claim progress sebagai readiness aktual di Phase 1.
2. Jangan jadikan count/filter/member/setting semuanya blocking tanpa evidence kebutuhan.
3. Jangan biarkan refresh / multi-tab memicu RR tanpa dedup policy.
4. Jangan menganggap login-triggered RR otomatis aman hanya karena user sudah active di backend.
5. Jangan treat Phase 1 sebagai final solution; harus ada success metric untuk memutuskan lanjut ke Phase 2 atau redesign.

---

## 9. QA and Test Strategy

### 9.1 Pre-Implementation Focus
- Review acceptance criteria login gate.
- Review fallback matrix untuk RR enabled/disabled/fail/timeout.
- Review timer-vs-RR behavior.
- Review access control ke Conversation sebelum gate selesai.

### 9.2 Test Areas
- Login success lands on loading page.
- Loading duration rule respected.
- RR disabled path.
- RR enabled path.
- RR fail path.
- RR timeout path.
- Timer done before RR completion.
- RR done before timer completion.
- Browser refresh during loading.
- Multi-tab login same user.
- Concurrent login many users same org.
- Direct navigation to Conversation before gate finished.

### 9.3 Automation Candidate Notes
- FE automation untuk route gating dan timer bounds.
- API/integration test untuk RR trigger side effect.
- Load/concurrency test untuk org-level login burst jika RR scope lebih dari per-user.

---

## 10. Open Questions

### 10.1 Blocking Questions
1. Scope RR-on-login final: per-user, per-team, atau per-organization?
2. Saat progress selesai tapi RR backend belum selesai, apakah user tetap boleh masuk Conversation?
3. Saat RR selesai lebih cepat dari progress, apakah user tetap harus menunggu sampai timer habis?
4. Jika RR gagal atau timeout, apa fallback final?
5. Concurrent login behavior: apakah RR harus dedup / single-flight?
6. Refresh / multi-tab behavior: resume existing gate/job atau trigger ulang?

### 10.2 Important But Non-Blocking Yet
7. RR existing saat ini sudah event-driven atau tidak?
8. Kenapa conversation masih perlu diproses RR saat login, bukan cukup dari trigger existing?
9. Eligible conversation criteria persis apa?
10. Volume conversation realistis per org berapa?
11. Jika RR disabled, apakah landing tetap tampil atau login direct ke Conversation?
12. Apakah loading organization tetap akan tampil sebagai langkah UI walau org sudah resolved?

---

## 11. Recommendation

Feature ini layak diteruskan sebagai **phased initiative**, bukan single-shot implementation.

- **Phase 1** boleh jalan untuk delivery cepat dengan status **transitional**, selama semua stakeholder paham bahwa progress 15-45 detik adalah gate UX, bukan readiness truth.
- **Phase 2** direkomendasikan sebagai target utama karena menyelesaikan mismatch antara visible progress dan kondisi backend nyata.
- **Phase 3** kemungkinan diperlukan bila RR-on-login ternyata menutup gap arsitektur RR existing, terutama bila trigger existing belum cukup atau concurrency jadi masalah nyata.

### Final Recommendation Statement
- **Proceed sekarang:** ya, untuk Phase 1 dengan kontrol minimum dan observability.
- **Proceed Phase 2 sekarang:** hanya setelah blocking questions minimal terjawab.
- **Treat as final design:** tidak. Phase 1 tidak cukup aman dijadikan solusi akhir.

---

## 12. Suggested Success Metrics

- Penurunan keluhan first-load inconsistency setelah login.
- Persentase session di mana timer selesai sebelum RR selesai.
- Persentase session di mana RR selesai sebelum timer selesai.
- Median time dari login success ke Conversation access.
- Error / timeout rate RR-on-login.
- Duplicate RR trigger rate untuk same user/org/session window.

---

## 13. Artifact Status Note

Assessment ini sengaja disimpan dalam status `Draft` karena beberapa keputusan inti RR-on-login masih open. Artefak ini cukup untuk memulai diskusi scope dan phase planning, tetapi belum cukup untuk final implementation freeze phase lanjutan tanpa jawaban open questions di atas.
