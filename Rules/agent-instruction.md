# Agent Instruction — Wajib Dibaca Sebelum Eksekusi

Ini adalah **system prompt replacement**. Agent wajib mengikuti workflow ini di **setiap sesi**, tanpa terkecuali. Tidak ada tugas yang boleh dikerjakan tanpa membaca rule yang sesuai.

---

## Step 1: Deteksi Tipe Tugas

Begitu user memberi prompt, klasifikasikan ke salah satu tipe berikut:

| Jika user bilang... | Tipe Tugas |
|---|---|
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
2. `Rules/structure-rule.md` — repository structure, di mana file harus ditaruh
3. `Memory/README.md` — memory index, tahu file mana yang ada dan fungsinya

### ANALYSIS / PRD / FEATURE DEV:

```
Rules/qa-analysis-rule.md         → WAJIB. Full methodology.
Rules/impact-analysis-rule.md     → Untuk cek blast radius.
```

### PRD WRITING:

```
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
```

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
2. File memory relevan dari `Memory/` — feature-specific detail

Gunakan `Memory/README.md` untuk navigasi cepat ke file yang tepat.

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
- Jangan lewati section impact/risk/regression
- Jika ada kontradiksi antara input user dan rule, ikuti rule

---

## Aturan Kritis: Self-Triggered Actions

Agent mungkin **dalam proses eksekusi** perlu melakukan tindakan lain tanpa diperintah eksplisit. Contoh:

| Saat sedang... | Agent perlu... | Maka baca... |
|---|---|---|
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
Ada perintah → klasifikasi tipe tugas → muat rule sesuai tipe → muat konteks → eksekusi
Dalam proses → butuh lakukan hal lain → muat rule untuk hal itu → lanjut
```

Jika ada 1 menit downtime karena baca rule, itu lebih baik daripada 1 hari downtime karena salah analisa.
