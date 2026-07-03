# Requirements Lifecycle Rules

Purpose:
Govern **Phase 0 — Change Intake & Classification** sebelum agent menulis PRD, membuat Assessment Report, atau menyusun test strategy untuk request yang **menambah**, **mengubah**, **membuang**, atau **mengaktifkan kembali** behavior di SatuInbox.

---

# Core Principle

Jangan langsung lompat dari user story / permintaan user ke PRD, QA analysis, atau test case.

Untuk setiap request yang menyentuh product behavior, agent WAJIB lebih dulu memastikan:

1. ini **feature baru**, **additive improvement**, **behavior change**, **deprecation/removal**, atau **revive undeveloped PRD**
2. current state di PRD / FE / BE seperti apa
3. scope perubahan apa yang benar-benar diminta
4. existing behavior apa yang harus tetap dipertahankan
5. route rule berikutnya apa yang benar

Tujuan rule ini adalah **mencegah scope creep**, **mencegah duplicate PRD**, dan **mencegah perubahan existing feature dilakukan tanpa diskusi detail**.

---

# When To Execute

Rule ini MUST dijalankan ketika:

- ada user story / request feature baru
- ada request enhancement / improvement / extension
- ada request mengubah behavior feature existing
- ada request membuang, menonaktifkan, menyederhanakan, atau mengganti behavior lama
- ada request yang menyebut PRD lama / PRD existing / fitur belum developed / partial implementation
- ada request yang berpotensi mengubah scope product yang sudah ada

Rule ini MAY skip untuk:

- typo atau wording fix tanpa perubahan behavior
- formatting document tanpa perubahan requirement
- pure cosmetic copy change tanpa perubahan state, permission, validation, atau contract

---

# Phase 0 — Change Intake & Classification

## Step 0A — Capture Minimal Request Context

Kumpulkan minimal informasi berikut:

- request summary
- business problem yang ingin diselesaikan
- target user / role yang terdampak
- expected outcome
- urgency / alasan perubahan dibutuhkan sekarang

Jika input user masih kabur, jangan langsung membuat PRD. Masukkan ketidakjelasan itu ke daftar open questions.

## Step 0B — Verify Current State First

Sebelum menentukan route, baca baseline berikut:

1. `Memory/global-memory.md`
2. PRD source yang relevan di `PRD/`
3. `Memory/reference-index.md` dan reference analysis yang relevan di `Assessments/reference/`
4. `Memory/comprehensive-undeveloped-features-analysis.md` dan/atau feature undeveloped analysis lain bila request mungkin sebenarnya adalah fitur yang sudah pernah dispesifikasikan tapi belum developed
5. `Memory/CLAUDE-fe.md` dan `Memory/CLAUDE-be.md` bila perlu verifikasi status implementasi FE / BE

Verifikasi current state minimal harus menjawab:

- apakah capability ini sudah ada di PRD?
- apakah capability ini sudah ada di FE?
- apakah capability ini sudah ada di BE?
- apakah statusnya shipped, partial, undeveloped, deprecated, atau hanya documented?
- apakah request ini menyentuh entity / lifecycle / RBAC / API yang shared?

## Step 0C — Mandatory Questions

## Step 0C.5 — Refinement Loop for Same Request

Jika user masih membicarakan **feature/request yang sama** dan menambahkan salah satu dari berikut:

- definisi actor / stakeholder
- alur end-to-end
- scope boundary
- istilah / glossary
- exception / fallback / failure path
- dependency eksternal / integration detail
- channel / role / routing clarification
- hal yang menjawab open questions pada brief aktif
- detail untuk **mengklarifikasi user story sebelumnya**
- detail untuk **mengklarifikasi use case sebelumnya**

maka perlakukan ini sebagai **refinement dari Change Intake Brief yang sama**, BUKAN otomatis pindah ke PRD, BRD, atau Assessment Report.

Aturan wajib:

1. update `latest/current Change Intake Brief` terlebih dahulu
2. jangan membuat Assessment Report baru hanya karena user menambah detail
3. jangan menganggap scope sudah settled bila clarifications masih mengubah model actor, lifecycle, visibility, routing, dependency, fallback, atau maksud user story sebelumnya
4. jika route saat ini `SPLIT_REQUEST` atau `HOLD_NEEDS_DISCOVERY`, tetap berada di Phase 0 sampai keputusan route berikutnya benar-benar siap
5. setelah update brief, berhenti sejenak dan konfirmasi ke user sebelum naik ke tahap berikutnya, meskipun agent melihat indikasi bahwa BRD / PRD / Assessment bisa dimulai
6. jika agent **tidak bisa menentukan** apakah input baru adalah:
   - klarifikasi untuk user story / use case sebelumnya, atau
   - request baru / sub-request baru / perubahan scope baru,
   maka agent WAJIB **tanya balik** ke user sebelum mengubah route atau naik tahap

**Default interpretation:**
- "lanjut"
- "update assessment"
- "tambahkan detail ini"
- "sebenarnya flow-nya begini"
- "actor-nya begini"
- "maksud user story sebelumnya adalah..."
- "use case sebelumnya itu..."

untuk feature yang sudah punya brief aktif = **update brief dulu**, bukan lompat ke artifact downstream.


Gunakan pertanyaan berikut sebagai checklist wajib.

### A. Identity of Change

1. Request ini termasuk **menambah**, **mengubah**, **membuang**, atau **revive** behavior lama?
2. Problem nyata apa yang ingin diselesaikan?
3. Siapa user / role / stakeholder yang terdampak?
4. Outcome bisnis atau operasional apa yang diharapkan?

### B. Current State Verification

5. Fitur atau behavior ini sudah ada di SatuInbox atau belum?
6. Jika sudah ada, sumber kebenaran sekarang apa: PRD, FE, BE, atau runtime behavior existing?
7. Jika ada PRD lama, apakah PRD itu sudah di-develop, baru partial, atau belum diimplementasi sama sekali?
8. Apakah request ini sebenarnya overlap dengan fitur undeveloped yang sudah pernah dianalisis?
9. Domain owner utamanya apa: Conversation, Ticket, WhatsApp Web, Broadcast, Contact, Auth, Analytics, dll?

### C. Scope Boundary

10. Apa yang benar-benar berubah?
11. Apa yang secara eksplisit **tidak** berubah?
12. Existing behavior apa yang harus tetap dipertahankan?
13. Role, screen, API, event, atau data apa saja yang masuk scope?
14. Apakah request ini tampak kecil tetapi sebenarnya menyentuh beberapa domain sekaligus?

### D. Blast-Radius Early Screen

15. Apakah perubahan menyentuh shared entity, lifecycle, state machine, atau SLA?
16. Apakah perubahan menyentuh RBAC, visibility scope, assignment, search/filter scope, atau reporting/export?
17. Apakah perubahan menyentuh API, webhook, socket, queue, cron, atau contract lain?
18. Apakah perlu migration, feature flag, rollout bertahap, atau rollback plan?
19. Existing test / regression area mana yang hampir pasti terdampak?

### E. Route & Governance

20. Ini seharusnya menjadi PRD baru, patch/addendum, rewrite PRD, revive PRD lama, atau deprecation/removal plan?
21. Apakah request perlu dipecah menjadi beberapa phase atau beberapa PRD?
22. Stakeholder apa yang perlu approve keputusan scope ini?
23. Pertanyaan mana yang blocking dan wajib dijawab sebelum lanjut?
24. Jika jawaban kritis belum ada, apakah request harus di-`HOLD_NEEDS_DISCOVERY`?

---

# Change Classification

Gunakan klasifikasi berikut.

| Change Class | Use When | Typical Signals | Default PRD Treatment |
|---|---|---|---|
| `NEW_FEATURE` | Capability belum ada di PRD existing dan bukan turunan langsung dari flow lama | feature benar-benar baru, entity/workflow baru, module baru | PRD baru |
| `ADDITIVE_IMPROVEMENT` | Menambah capability di atas feature existing tanpa mengganti core behavior | filter baru, action tambahan, metadata tambahan, visibility tambahan yang masih kompatibel | patch/addendum jika tetap scoped |
| `BEHAVIOR_CHANGE` | Mengubah logic, state transition, permission, search scope, SLA, assignment, atau behavior existing | perubahan cara kerja existing, bukan sekadar tambah opsi | patch/addendum + mandatory impact analysis; rewrite jika model berubah besar |
| `DEPRECATION_OR_REMOVAL` | Menghapus, mematikan, menyederhanakan, merge, atau mengganti behavior lama | remove menu/action, stop sync, replace old flow, sunset behavior | deprecation/removal plan + impact analysis dulu |
| `REVIVE_UNDEVELOPED_PRD` | PRD atau analysis sudah pernah ada tetapi FE/BE belum shipped atau baru partial | fitur lama yang terdokumentasi, item dari undeveloped feature list, dormant PRD | buka ulang PRD existing, verifikasi status, lalu tentukan patch vs rewrite |
| `MIXED_REQUEST` | Satu request mencampur new feature + behavior change + removal atau beberapa domain sekaligus | user story melebar, banyak capability berbeda, impact lintas module | split request sebelum lanjut |

---

# PRD Treatment Decision Rules

Gunakan aturan keputusan berikut:

1. **Jika tidak ada PRD relevan sama sekali** → route ke `ROUTE_NEW_PRD`.
2. **Jika PRD ada dan perubahan scoped, additive, serta tidak mengubah core model** → route ke `ROUTE_PATCH_EXISTING_PRD`.
3. **Jika PRD ada tetapi perubahan mengubah core model atau >30% isi PRD** → route ke `ROUTE_REWRITE_EXISTING_PRD`.
4. **Jika PRD ada tetapi feature belum di-develop / baru partial** → klasifikasikan dulu sebagai `REVIVE_UNDEVELOPED_PRD`, baru tentukan patch vs rewrite.
5. **Jika request membuang atau men-deprecate behavior lama** → route ke `ROUTE_DEPRECATION_REMOVAL`, dan impact analysis harus didahulukan.
6. **Jika satu request mencampur beberapa change class** → route ke `SPLIT_REQUEST`.
7. **Jika current state atau requirement inti masih kabur** → route ke `HOLD_NEEDS_DISCOVERY`.

---

# Scope Guardrails

Rule ini WAJIB menerapkan guardrail berikut:

- Perubahan pada **shared entity, lifecycle, state machine, SLA, assignment, RBAC, API/event contract, report/export, notification, migration, atau deprecation** tidak boleh dianggap change kecil tanpa impact analysis.
- `In Scope` dan `Out of Scope` harus ditentukan di Phase 0 sebelum PRD ditulis.
- Existing behavior yang harus tetap dipertahankan harus ditulis eksplisit sebagai **Protected Existing Behavior**.
- Undefined behavior harus ditulis sebagai **open question**, bukan diasumsikan diam-diam.
- Jika request tampak seperti feature baru tetapi sebenarnya sudah ada sebagai **undeveloped PRD**, jangan buat PRD duplikat tanpa evaluasi lineage.
- Jika request mencampur beberapa domain atau beberapa objective sekaligus, lebih aman **split** daripada memaksa satu PRD besar.
- Behavior change pada fitur yang sudah shipped hampir tidak pernah aman dilewatkan tanpa `impact-analysis-rule.md`.

---

# Artifact Storage Rules

Persist artifact Phase 0 dengan aturan berikut:

- latest/current brief path: `Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md`
- versi sebelumnya dipindah ke `Assessments/<domain>/<feature-slug>/versions/<feature-slug>-change-intake-brief-vX.Y.md`
- brief dan Assessment Report harus hidup di **folder feature yang sama** agar lineage mudah ditelusuri
- gunakan template `Assessments/templates/Setup/change-intake-brief-template.md`
- downstream artifacts wajib mereferensikan path brief ini bila request berasal dari requirement lifecycle lane
- jika ada perubahan scope di tengah jalan, **update brief ini dulu** sebelum PRD, Assessment Report, QA review, atau test artifacts direvisi
- setiap perubahan substantif WAJIB memperbarui `Version` pada artifact aktif
- setiap perubahan substantif WAJIB menambah ringkasan update / change summary / change log yang menjelaskan apa yang berubah
- jangan biarkan content berubah tanpa jejak versi dan ringkasan perubahan

---

# Output Format — Change Intake Brief

Setelah Phase 0 selesai, persist artifact **Change Intake Brief** menggunakan template berikut dan isi minimal di bawah ini:

```md
## Phase 0 — Change Intake Brief

- Request Summary:
- Change Class:
- Current State Verification:
  - PRD:
  - FE:
  - BE:
  - Runtime / shipped status:
- Related Sources:
- In Scope:
- Out of Scope:
- Protected Existing Behavior:
- Impact Flags:
- Blocking Questions:
- Routing Decision:
- Next Rules To Load:
```

Catatan:
- `Change Intake Brief` adalah artifact wajib untuk request yang menambah, mengubah, membuang, atau merevive behavior / PRD lama.
- Brief ini menjadi baseline reusable untuk BRD discussion, PRD, Assessment Report, QA review, dan perubahan lanjutan.
- Jika scope berubah, update file latest/current brief terlebih dahulu lalu pindahkan versi sebelumnya ke `versions/`.
- Setiap update substantif wajib menaikkan `Version` di file aktif dan memperbarui ringkasan perubahan di bagian update history / change log.
- Yang wajib bukan hanya isi Phase 0 eksplisit, tapi juga **path artifact-nya stabil dan direferensikan downstream**.

---

# Routing Matrix

| Routing Decision | Use When | Next Rules To Load | Expected Next Output |
|---|---|---|---|
| `ROUTE_NEW_PRD` | Capability benar-benar baru dan belum punya PRD relevan | `prd-writing-rule.md` → `qa-analysis-rule.md` → `impact-analysis-rule.md` | Change Intake Brief + PRD baru + Assessment Report |
| `ROUTE_PATCH_EXISTING_PRD` | Existing PRD tetap valid, perubahan scoped, dan core model tidak berubah | `prd-writing-rule.md` (Patch/Addendum) → `qa-analysis-rule.md` → `impact-analysis-rule.md` | Change Intake Brief + Patch/Addendum + Assessment Report |
| `ROUTE_REWRITE_EXISTING_PRD` | Existing PRD berubah besar atau core model bergeser | `prd-writing-rule.md` (rewrite) → `qa-analysis-rule.md` → `impact-analysis-rule.md` | Change Intake Brief + PRD rewrite + Assessment Report |
| `ROUTE_REVIVE_UNDEVELOPED_PRD` | PRD/analysis lama ada, tetapi feature belum shipped atau baru partial | baca PRD existing + undeveloped analysis + `Memory/CLAUDE-fe.md` / `Memory/CLAUDE-be.md`, lalu tentukan patch atau rewrite path | Change Intake Brief + decision brief + PRD patch/rewrite decision |
| `ROUTE_DEPRECATION_REMOVAL` | Request menghapus, mematikan, merge, atau replace behavior lama | `impact-analysis-rule.md` dulu → `qa-analysis-rule.md` → bila perlu `prd-writing-rule.md` untuk patch/deprecation plan | Change Intake Brief + removal/deprecation analysis + updated spec |
| `SPLIT_REQUEST` | Satu request mencampur beberapa objective / domain / change class | rule ini dulu, lalu buat route terpisah per sub-request | Change Intake Brief + beberapa lane / beberapa PRD / beberapa assessment |
| `HOLD_NEEDS_DISCOVERY` | Current state, stakeholder intent, atau risk kritis belum jelas | rule ini dulu, lanjutkan discovery / clarification sebelum PRD | persisted brief + open questions + discovery follow-up |

---

# Relationship To Other Rules

- Rule ini **tidak menggantikan** `prd-writing-rule.md`, `qa-analysis-rule.md`, `impact-analysis-rule.md`, atau `test-case-rule.md`.
- Rule ini adalah **Phase 0 gate** sebelum rule-rule tersebut dijalankan untuk request yang menyentuh behavior produk.
- Setelah route dipilih, agent WAJIB memuat rule downstream yang relevan.
- Reviewer Gate A / B / C dan Requirement Package Freeze tetap mengikuti `workflow-rule.md`.

---

# Fast Heuristics

Gunakan heuristik cepat berikut:

- Kalau user bilang **"tambah"** pada feature existing → curigai `ADDITIVE_IMPROVEMENT` dulu, lalu cek apakah sebenarnya `BEHAVIOR_CHANGE`.
- Kalau user bilang **"ubah"** → default curigai `BEHAVIOR_CHANGE`, bukan change kecil.
- Kalau user bilang **"hapus" / "buang" / "nonaktifkan"** → default route ke `ROUTE_DEPRECATION_REMOVAL`.
- Kalau user bilang **"dulu pernah ada PRD-nya" / "fitur ini belum developed"** → default curigai `REVIVE_UNDEVELOPED_PRD`, bukan `NEW_FEATURE`.
- Kalau request menyentuh **assignment, status, SLA, visibility, search scope, reporting, export, notification, API/event** → mandatory impact analysis.

---

# Stage Map — Wajib Jelas Urutannya

Gunakan urutan ini untuk request yang menyentuh behavior produk:

## Stage 0 — Change Intake / Refinement
Tujuan:
- memahami request
- klasifikasi change class
- verifikasi current state
- lock in-scope / out-of-scope awal
- tulis protected existing behavior
- kumpulkan open questions

Output wajib:
- `Change Intake Brief`

Jika user masih menambah detail untuk request yang sama:
- tetap di Stage 0
- update brief yang sama
- **jangan** naik tahap otomatis

## Stage 1 — Final Stage Transition Confirmation Layer
Setelah brief diupdate dan agent merasa ada indikasi bisa lanjut:
- **jangan langsung lanjut**
- tampilkan ringkasan singkat status artefak/stage saat ini
- sebutkan kandidat tahap berikutnya (BRD / PRD / Assessment / split)
- jelaskan kenapa kandidat tahap itu terlihat relevan
- lakukan **final transition validation** berikut:
  1. validasi dulu readiness tahap saat ini
  2. jelaskan apa yang sudah locked
  3. jelaskan apa yang masih open
  4. jelaskan risiko bila naik tahap sekarang
  5. minta konfirmasi user
- **baru pindah tahap setelah user menegaskan lanjut**

Tanpa lapisan konfirmasi final ini, jangan pindah tahap walaupun agent merasa requirement sudah cukup.

Jika user meminta naik tahap:
- aturan di atas tetap wajib dijalankan penuh
- tidak ada bypass hanya karena user terlihat sudah menginginkan next stage

## Stage 2 — BRD / Requirement Framing
Gunakan bila user ingin kebutuhan bisnis dirapikan dulu sebelum requirement produk detail.

## Stage 3 — PRD Writing
Gunakan bila user memang minta requirement produk detail atau scope sudah cukup matang untuk spesifikasi produk.

## Stage 4 — Assessment Report
Gunakan bila user meminta analisa formal, review risiko, go/no-go, impact, atau ketika workflow berikutnya memang membutuhkan assessment formal.

## Stage 5 — QA / Test / Automation
Gunakan setelah requirement package cukup matang.

# Summary

```
User request menyentuh behavior produk
→ jalankan Stage 0 / Phase 0 Change Intake
→ persist / update Change Intake Brief
→ jika request yang sama masih bertambah detail atau mengklarifikasi user story/use case sebelumnya: tetap di Stage 0
→ jika agent tidak yakin input baru itu masih klarifikasi story lama atau request baru: tanya balik user dulu
→ setelah brief cukup matang: STOP, jelaskan kandidat next stage
→ jalankan final stage transition confirmation layer:
   - validate readiness
   - jelaskan locked
   - jelaskan open
   - jelaskan risiko naik sekarang
   - minta konfirmasi
→ baru pindah ke BRD / PRD / Assessment sesuai arahan user yang sudah ditegaskan
```
