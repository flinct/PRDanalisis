# Agent Instruction — Wajib Dibaca Sebelum Eksekusi

Ini adalah **system prompt replacement**. Agent wajib mengikuti workflow ini di **setiap sesi**, tanpa terkecuali. Tidak ada tugas yang boleh dikerjakan tanpa membaca rule yang sesuai.

---

## Step 0: Muat Konteks Tambahan

Selain rule, agent WAJIB tahu keberadaan:

- **`WORKFLOW_CONTEXT.md`** — konteks onboarding lengkap: arsitektur 3-repo, automation bridge pipeline, page objects index, commands cheatsheet, environment accounts
- **`Memory/qa-tooling.md`** — dokumentasi testcase-browser.html (QA Browser) + server.js (QA Agent) — fitur aktif, mode, arsitektur frontend, SSE format
- **Global author rule:** untuk semua penulisan document, author/owner/created by harus pakai nama user: **Dany Christian**

## Step 1: Deteksi Tipe Tugas

Begitu user memberi prompt, klasifikasikan ke salah satu tipe berikut:

| Jika user bilang... | Tipe Tugas |
|---|---|
| tambah fitur / ubah fitur / hapus fitur / improvement / enhancement / extension / existing PRD / belum developed / out of scope | REQUIREMENT LIFECYCLE |
| buat PRD / tulis PRD / draft PRD / create PRD / write PRD / PRD baru | PRD WRITING |
| analisa / analyze / review PRD / cek PRD / analisis | ANALYSIS |
| buat memory / tulis memory / simpan ke memory / update memory | MEMORY WRITE |
| bandingkan / compare / perbedaan / perbandingan | COMPARISON |
| test case / test scenario / test steps / test plan / QA test / regression / UAT / uji / testing | TEST CASE |
| bug / perbaiki bug / error / issue / defect | BUG FIX |
| impact / dampak / efek samping / blast radius | IMPACT ANALYSIS |
| feature / fitur baru /开发 | FEATURE DEV |

Jika user memberi perintah yang tidak eksplisit (misal: "tolong review PRD ini", "cek apakah ada masalah"), tetap klasifikasikan ke tipe tugas yang paling sesuai.

> **Jika ragu: muat SEMUA rule dari `Rules/`.**

---

## Step 2: Muat Rule Berdasarkan Tipe Tugas

### Untuk SEMUA tipe tugas (wajib):

1. `Rules/workflow-rule.md` — execution order dan prioritas
2. `Rules/structure-rule.md` — repository structure, termasuk lokasi artefak permanen di `Assessments/` dan script helper di `Scripts/`
3. `Memory/README.md` — memory index, tahu file mana yang ada dan fungsinya
4. `Assessments/README.md` — aturan artefak analisa permanen dan versioning bila tugas menyentuh hasil analisa yang ingin dipersist

### REQUIREMENT LIFECYCLE / CHANGE INTAKE:

```
Rules/requirements-lifecycle-rule.md → WAJIB. Phase 0 change intake & classification untuk request tambah/ubah/buang/revive behavior.
Rules/impact-analysis-rule.md        → Muat jika request diduga menyentuh shared behavior, removal, atau blast radius besar.
Assessments/templates/Setup/change-intake-brief-template.md → Template artifact Phase 0 yang dipersist di `Assessments/`.
```

### ANALYSIS / PRD / FEATURE DEV:

```
Rules/requirements-lifecycle-rule.md → WAJIB jika request menambah / mengubah / membuang behavior, atau mereferensikan PRD lama / undeveloped feature.
Rules/qa-analysis-rule.md         → WAJIB hanya ketika task benar-benar sudah masuk analisa formal / Assessment Report lane.
Rules/impact-analysis-rule.md     → Untuk cek blast radius.
Assessments/templates/qa-assessment-report-template.md → Template artefak permanen assessment.
Assessments/templates/Setup/assessment-report-template.md → Operational wrapper untuk Assessment Report milik Analyst.
```

**Guardrail penting:**
Jika user masih melengkapi story untuk feature yang sama — misalnya menambah actor definition, flow detail, exception, fallback, integration contract, routing detail, atau menjawab open questions pada brief aktif — maka tetap gunakan **REQUIREMENT LIFECYCLE lane** dan update `Change Intake Brief` dulu. Perlakukan juga input yang **mengklarifikasi user story sebelumnya** atau **mengklarifikasi use case sebelumnya** sebagai refinement untuk brief aktif, kecuali user jelas membuka request baru. Jangan lompat ke Assessment Report hanya karena user memakai kata seperti "lanjut", "analisa", atau "update assessment".

Jika agent tidak yakin apakah input baru masih klarifikasi story/use case sebelumnya atau sudah menjadi request baru, agent WAJIB tanya balik sebelum mengubah lane atau stage.

### PRD WRITING:

```
Rules/requirements-lifecycle-rule.md → WAJIB jika PRD menyentuh existing feature, enhancement, removal, atau revive PRD lama.
Rules/prd-writing-rule.md         → WAJIB. Template dan framework penulisan PRD.
Rules/qa-analysis-rule.md         → Untuk memastikan requirement testable dan lengkap.
Rules/impact-analysis-rule.md     → Jika PRD menyentuh flow/entity existing atau cross-feature dependency.
```

### BUG FIX:

```
Rules/qa-analysis-rule.md         → Type 2: Bug Fix Analysis.
Rules/impact-analysis-rule.md     → Blast radius dan regression.
```

### IMPACT ANALYSIS:

```
Rules/impact-analysis-rule.md     → WAJIB. Impact dimensions.
Rules/qa-analysis-rule.md         → Mandatory Impact Dimensions + Risk Analysis.
```

### COMPARISON (PRD vs PRD):

```
Rules/prd-comparison-rule.md      → WAJIB. Framework compare.
Rules/qa-analysis-rule.md         → Interconnection analysis jika PRD saling terkait.
```

### TEST CASE:

```
Rules/test-case-rule.md           → WAJIB. QA test writing, steps, coverage, execution support.
Rules/qa-analysis-rule.md         → WAJIB. Source analysis dan Test Specification Layer.
Rules/impact-analysis-rule.md     → Jika test perlu regression, rollout, rollback, atau cross-feature coverage.
Rules/automation-bridge-rule.md   → Jika test case TSV akan disinkronkan ke repo automation.
Assessments/templates/Setup/qa-pre-implementation-review-template.md  → Untuk QA review sebelum coding.
Assessments/templates/Setup/qa-post-implementation-validation-template.md → Untuk QA validation setelah coding.
Assessments/templates/Setup/automation-mapping-template.md → Untuk companion mapping requirement ↔ automation.
```

Output test case tidak terbatas pada TSV. Jika feature belum punya generator bridge, simpan juga companion docs di `Test/<domain>/` sebagai `*-qa-test-spec.md` dan `*-automation-mapping.md`.

### MEMORY WRITE:

```
Rules/memory-routing-rule.md      → WAJIB. Tahu konten masuk global atau feature memory.
Rules/memory-write-rule.md        → Jika akan menulis memory baru.
Rules/memory-update-rule.md       → Jika akan update feature memory yang sudah ada.
Rules/global-memory-write-rule.md → Jika akan menulis global memory baru.
Rules/global-memory-update-rule.md→ Jika akan update global memory.
```

---

## Step 3: Muat Konteks Produk

Setelah rule terbaca, muat konteks:

1. `Memory/global-memory.md` — canonical product rules, dependency, open risks
2. `Memory/reference-index.md` — index reusable PRD analysis references yang disimpan di `Assessments/reference/`
3. File memory relevan dari `Memory/` — feature-local baseline yang masih dipakai ulang
4. File reference analysis relevan dari `Assessments/reference/` — deep-dive comparison / cross-PRD reasoning saat dibutuhkan

Gunakan `Memory/README.md` dan `Memory/reference-index.md` untuk navigasi cepat ke file yang tepat.

### Kapan harus muat `Memory/CLAUDE-be.md`

Muat jika tugas menyentuh salah satu dari:
- Mengecek apakah fitur sudah diimplementasi di BE
- Impact analysis yang perlu tahu service boundary, gRPC contract, atau RabbitMQ pattern
- Bug fix yang butuh verifikasi schema, enum, atau data model BE
- Feature dev yang perlu tahu service mana yang harus diubah / proto baru
- Test case yang butuh cross-check BE endpoint atau event pattern

### Kapan harus muat `Memory/CLAUDE-fe.md`

Muat jika tugas menyentuh salah satu dari:
- Mengecek apakah fitur sudah diimplementasi di FE
- Impact analysis yang perlu tahu component tree, Zustand store, atau service hook
- Bug fix yang butuh verifikasi routing, state management, atau socket event FE
- Feature dev yang perlu tahu component mana yang harus diubah / hook baru
- Test case yang butuh cross-check FE component mapping atau URL routing

---

## Step 4: Eksekusi

Gunakan rule yang sudah dimuat sebagai **metodologi kerja**, bukan sekadar referensi.

- Output harus sesuai struktur yang ditentukan rule
- Hasil analisis yang bersifat decision-bearing harus dipermanenkan sebagai Assessment Report di `Assessments/`, **tetapi hanya setelah task benar-benar masuk tahap analisa formal, bukan saat masih refinement Change Intake Brief**
- Setiap perubahan substantif pada artifact permanen WAJIB menaikkan `Version` dan memperbarui ringkasan perubahan / change history
- Jangan lewati section impact/risk/regression
- Jika user masih menambah detail untuk request yang sama, update brief dulu lalu konfirmasi sebelum lanjut tahap berikutnya
- Perpindahan stage apa pun WAJIB melewati final stage-transition confirmation layer: validasi readiness, jelaskan locked, jelaskan open, jelaskan risiko naik sekarang, lalu minta konfirmasi eksplisit
- Jika user meminta naik tahap, layer konfirmasi final yang sama tetap wajib. Tidak ada bypass.
- Jika agent tidak yakin apakah input baru masih klarifikasi user story/use case sebelumnya atau request baru, tanya balik dulu
- Jika ada kontradiksi antara input user dan rule, ikuti rule

---

## Aturan Kritis: Self-Triggered Actions

Agent mungkin **dalam proses eksekusi** perlu melakukan tindakan lain tanpa diperintah eksplisit. Contoh:

| Saat sedang... | Agent perlu... | Maka baca... |
|---|---|---|
| Menerima user story / request change feature | Menentukan ini feature baru, improvement, behavior change, removal, atau revive PRD lama | requirements-lifecycle-rule.md |
| Menganalisa PRD | Menyimpan temuan ke memory | Memory rules |
| Menulis PRD | Mengecek struktur, testability, dan impact | prd-writing-rule.md, qa-analysis-rule.md, impact-analysis-rule.md |
| Membuat QA test / steps | Menyusun coverage, traceability, execution support | test-case-rule.md, qa-analysis-rule.md |
| Membuat / update test case TSV | Mengikuti template `SatuInbox Test Case Scenario V2` | test-case-rule.md |
| Membuat test case | Merevisi analisa karena ada temuan baru | qa-analysis-rule.md |
| Memperbaiki bug | Mengecek dampak ke modul lain | impact-analysis-rule.md |
| Membandingkan PRD | Analisa interkoneksi | qa-analysis-rule.md |
| Menganalisa PRD / bug / impact | Verifikasi status implementasi BE | Memory/CLAUDE-be.md |
| Menganalisa PRD / bug / impact | Verifikasi status implementasi FE | Memory/CLAUDE-fe.md |

**Setiap kali agent akan:**
- Mengkaji request tambah / ubah / buang feature → baca `requirements-lifecycle-rule.md`
- Menentukan feature baru vs improvement vs removal vs revive PRD → baca `requirements-lifecycle-rule.md`
- Menganalisa sesuatu → baca `qa-analysis-rule.md`
- Menulis PRD → baca `prd-writing-rule.md`
- Menulis/update file → baca memory rules
- Membandingkan → baca `prd-comparison-rule.md`
- Membuat test case → baca `test-case-rule.md`
- Membuat atau update test case TSV → baca `test-case-rule.md`
- Mengecek dampak → baca `impact-analysis-rule.md`
- Verifikasi implementasi BE → baca `Memory/CLAUDE-be.md`
- Verifikasi implementasi FE → baca `Memory/CLAUDE-fe.md`

Tidak ada "saya sudah tahu, tidak perlu baca ulang". **Setiap tindakan = baca rule yang sesuai.**

---

## Ringkasan Sederhana

```
Ada perintah → klasifikasi tipe tugas → jika menyentuh behavior produk jalankan Phase 0 requirement lifecycle → muat rule sesuai tipe → muat konteks → eksekusi
Dalam proses → butuh lakukan hal lain → muat rule untuk hal itu → lanjut
```

Jika ada 1 menit downtime karena baca rule, itu lebih baik daripada 1 hari downtime karena salah analisa.
