# Presentasi: Cara Repo PRD Analysis Bekerja untuk QA

---

## 1. Tujuan Repo

Repo workspace analisis PRD membantu QA memahami fitur sebelum membuat strategi test.

Fokus:

- Membaca PRD sistematis.
- Menemukan business rule eksplisit dan implisit.
- Mendeteksi gap, conflict, ambiguity, regression risk, impact lintas fitur.
- Menyimpan pemahaman penting ke memory. Analisis berikutnya tidak mulai dari nol.
- Menjaga rules dan memory berkembang incremental.

---

## 2. Struktur Utama Repo

```text
PRD/
Rules/
Memory/
Temp Analysis/
Test/
```

- `PRD/`: sumber requirement product, dikelompokkan per domain atau fitur.
- `Rules/`: aturan kerja agent saat menganalisis PRD, membandingkan PRD, impact analysis, menulis memory, test case.
- `Memory/`: konteks reusable dari analisis sebelumnya.
- `Temp Analysis/`: hasil analisis sementara. Belum tentu canonical memory.
- `Test/`: dokumen test atau validasi QA dari hasil analisis.

---

## 3. Peran Rules

Rules instruksi operasional.

Rules menjawab:

- Analisis PRD harus lihat aspek apa?
- Kapan perlu comparison antar PRD?
- Bagaimana mengukur impact lintas modul?
- Pengetahuan mana masuk global memory?
- Pengetahuan mana hanya feature memory?
- Apa tidak boleh disimpan sebagai memory?
- Bagaimana test case dibuat tanpa scope creep?

---

## 4. File Rules Penting

- `workflow-rule.md`: urutan kerja wajib sebelum task.
- `analisa-prd-rule.md`: format dan fokus analisis satu PRD.
- `prd-comparison-rule.md`: aturan membandingkan dua PRD.
- `impact-analysis-rule.md`: aturan mencari blast radius perubahan.
- `memory-routing-rule.md`: aturan routing analisis ke global memory, feature memory, atau tidak disimpan.
- `global-memory-write-rule.md`: aturan menulis canonical memory lintas fitur.
- `global-memory-update-rule.md`: aturan update global memory aman.
- `memory-write-rule.md`: aturan mengubah analisis PRD menjadi feature memory ringkas.
- `memory-update-rule.md`: aturan merge memory lama dengan insight baru.
- `test-case-rule.md`: aturan membuat dan update test case.

---

## 5. Peran Memory

Memory pengetahuan jangka panjang dari hasil analisis.

Memory membantu QA dan AI agent:

- Tidak perlu baca ulang semua PRD dari awal.
- Memakai baseline behavior sudah disepakati.
- Mendeteksi konflik saat PRD baru berbeda dengan rule lama.
- Menjaga konsistensi istilah, status, lifecycle, RBAC, dependency.
- Mempercepat impact analysis dan regression mapping.

---

## 6. Jenis Memory

### Global Memory

`Memory/global-memory.md` sumber canonical untuk rule stabil lintas fitur.

Contoh:

- Domain: customer service live chat platform dengan WhatsApp integration.
- Contact: satu global contact per customer. Phone number unique identifier.
- Room: status implementation truth `open` dan `closed`.
- Assignment: `participants` sumber assignee.
- SLA: dihitung real-time/service-side. Tidak disimpan langsung di conversation document.
- Chat list: search dan filter scoped oleh RBAC aktif.
- Open risks: cross-division leakage, queue sync inconsistency, unresolved SLA behavior.

### Feature Memory

Feature memory menyimpan analisis detail per domain.

Contoh:

- `Memory/conversation-prd-cross-analysis.md`
- `Memory/conversation-undeveloped-features-analysis.md`
- `Memory/contact-context-visibility.md`
- `Memory/sla-conversation-ticket.md`

---

## 7. Prinsip Routing Memory

Simpan ke `global-memory.md` jika pengetahuan:

- Reusable lintas fitur.
- Mendefinisikan behavior system-wide.
- Mendefinisikan lifecycle atau state machine bersama.
- Mendefinisikan RBAC bersama.
- Mendefinisikan shared integration behavior.
- Menjadi canonical workflow rule.
- Sering dirujuk banyak feature memory.

Simpan ke feature memory jika pengetahuan:

- Feature-specific.
- Berisi local edge case.
- Berisi dependency khusus fitur.
- Berisi UI behavior lokal.
- Berisi risiko lokal fitur.
- Berisi business rule khusus fitur.

Jangan persist jika isinya:

- Raw PRD text.
- Generated test cases.
- Temporary assumptions.
- Speculative reasoning.
- Verbose explanation.
- One-off exception.
- Implementation noise.

---

## 8. Urutan Kerja Wajib

Berdasarkan `Rules/workflow-rule.md`, setiap task ikuti urutan:

1. Read applicable rule dari `Rules/`.
2. Read `Memory/global-memory.md`.
3. Read feature memory relevan dari `Memory/`.
4. Execute task.

Canonical truth order:

1. Global memory.
2. Feature memory.
3. PRD content.
4. Runtime inference.
5. Temporary assumptions.

---

## 9. Flow QA Menggunakan Repo Ini

### Step 1: Tentukan Scope

QA memilih PRD atau fitur.

Contoh:

- Conversation Room.
- Chat List.
- Contact Visibility.
- SLA Conversation.
- Broadcast.
- Ticket.

### Step 2: Baca Rules Relevan

Minimal untuk QA analysis:

- `workflow-rule.md`
- `analisa-prd-rule.md`
- `impact-analysis-rule.md`
- `memory-routing-rule.md`
- `test-case-rule.md`

Tambah jika bandingkan PRD:

- `prd-comparison-rule.md`

Tambah jika simpan ke memory:

- `memory-write-rule.md`
- `memory-update-rule.md`
- `global-memory-write-rule.md`
- `global-memory-update-rule.md`

---

## 10. Flow Analisis PRD untuk QA

QA tidak hanya baca acceptance criteria.

QA harus cari:

- Feature purpose.
- Core business rules.
- State transitions.
- Dependencies.
- Data impact.
- API impact.
- UI/UX impact.
- RBAC impact.
- Risk areas.
- Edge cases.
- Regression areas.
- Open questions.

Output: structured engineering understanding, bukan rewrite PRD.

---

## 11. Flow Impact Analysis

Impact analysis setelah PRD analysis atau PRD comparison.

Tujuan: cari blast radius.

Area dicek:

- Direct impact.
- Indirect impact.
- Hidden dependencies.
- Data consistency.
- Synchronization risks.
- Backward compatibility.
- Performance implications.
- Operational flow disruption.
- Automation test impact.
- Monitoring dan logging impact.

Level finding:

- `LOW`: isolated, tidak punya downstream effect.
- `MEDIUM`: berdampak satu atau dua modul terkait.
- `HIGH`: berdampak banyak modul, butuh migration, atau ubah shared behavior.

---

## 12. Flow Test Case untuk QA

Test case setelah PRD analysis dan impact analysis.

Aturan:

- Test case sesuai boundary PRD.
- Test case cover acceptance criteria.
- Test case cover edge case dari analisis.
- Regression test tambah berdasarkan impact analysis.
- Jangan tulis test case untuk behavior speculative atau undefined.
- Jangan masukkan implementation detail ke test steps.
- Existing test ID dipertahankan kecuali behavior berubah fundamental.
- Test case obsolete ditandai deprecated. Jangan langsung hapus tanpa konfirmasi.

Struktur:

- ID.
- Scenario description.
- Prerequisites atau test data.
- Steps.
- Expected result.

---

## 13. Contoh Flow End-to-End QA

```text
PRD baru masuk
  -> baca workflow rule
  -> baca global memory
  -> baca feature memory terkait
  -> analisis PRD
  -> comparison jika ada PRD lama atau terkait
  -> impact analysis
  -> identifikasi regression scope
  -> buat atau update test case
  -> route insight ke memory
  -> update memory incremental
```

Output:

- Analisis PRD.
- Daftar conflict dan open question.
- Impact analysis.
- Regression scope.
- Test cases.
- Memory update jika insight stabil dan reusable.

---

## 14. Cara Rules Berkembang

Rules berkembang saat cara kerja analisis perlu distandarisasi.

Pemicu update:

- QA menemukan pola gap sering muncul.
- Format output analisis perlu diperjelas.
- Ada risiko baru belum tercakup (misal audit log, event ordering).
- Test case sering melebar dari scope PRD.
- Memory sering terduplikasi atau salah routing.

Prinsip update:

- Tambah aturan reusable.
- Jangan buat rules terlalu spesifik untuk satu fitur.
- Jangan ubah rules tanpa pahami dampak ke workflow lain.
- Rules bantu konsistensi, bukan tambah noise.

---

## 15. Cara Memory Berkembang

Memory berkembang dari analisis cukup stabil.

Flow update:

```text
Insight ditemukan
  -> cek reusable atau feature-specific
  -> bandingkan dengan global memory dan feature memory lama
  -> deteksi conflict
  -> route ke global memory atau feature memory
  -> update section relevan saja
  -> jangan regenerate dari nol
```

Aturan:

- Global memory evolve incremental.
- Jangan overwrite global memory blind.
- Jika PRD baru contradict global memory, flag inconsistency.
- Existing canonical rule dipertahankan sampai explicit confirmation.
- Feature memory tidak boleh duplikasi canonical rule.
- Temporary assumption tidak boleh jadi memory permanen.

---

## 16. Contoh Perkembangan Memory

Insight dari PRD Conversation:

- PRD lama pakai status `Ongoing` dan `Resolved`.
- Implementasi pakai `open` dan `closed`.
- Setelah dikonfirmasi sebagai implementation truth, global memory simpan canonical: status conversation `open` / `closed`.

Dampak QA:

- Test case tidak boleh anggap `Ongoing` / `Resolved` sebagai status backend canonical.
- Jika UI masih pakai wording lama, QA bedakan UI label dan actual state.
- Regression harus pastikan Chat List, Room, Detail, API konsisten pakai state sama.

---

## 17. Cara Menggunakan Memory Saat QA Testing

Sebelum test strategy, QA baca memory untuk baseline.

Pertanyaan dijawab memory:

- Apa canonical status conversation?
- Assignee dari `assignedTo` atau `participants`?
- SLA disimpan atau dihitung real-time?
- Search harus ikut RBAC scope?
- Solved atau closed room bisa dimutasi?
- Area mana regression sensitive?

Dengan baseline, QA bedakan:

- Requirement baru.
- Existing canonical behavior.
- Conflict antar PRD.
- Open question perlu clarification.
- Regression scope wajib dites.

---

## 18. QA Mindset

QA berperan sebagai system risk detector, bukan test executor.

Hal aktif dicari:

- Ambiguity.
- Contradiction.
- Missing lifecycle rule.
- Missing RBAC rule.
- Incomplete API contract.
- Data model mismatch.
- State transition loophole.
- Race condition.
- Cross-feature regression.
- Backward compatibility risk.
- Monitoring atau audit gap.

---

## 19. Praktik Baik untuk QA

- Mulai dari global memory sebelum baca detail PRD.
- Jangan percaya satu PRD sebagai single source jika fitur sentuh shared entity.
- Selalu cek feature memory untuk conflict dan historical reasoning.
- Pisahkan confirmed rule, assumption, open question.
- Jangan buat test case untuk behavior belum didefinisikan.
- Untuk HIGH impact, tulis mitigation atau validation tambahan.
- Update memory hanya untuk insight stabil dan reusable.
- Jangan salin raw PRD ke memory.

---

## 20. Ringkasan

Repo sistem knowledge loop untuk QA PRD analysis.

```text
Rules atur cara berpikir
PRD jadi input requirement
Analysis temukan behavior, risk, gap
Impact Analysis tentukan blast radius
Test Case ubah insight jadi validasi QA
Memory simpan pengetahuan stabil untuk analisis berikutnya
```

Manfaat QA:

- Analisis lebih konsisten.
- Regression scope lebih jelas.
- Conflict antar PRD lebih cepat terlihat.
- Test case lebih terarah.
- Knowledge tidak hilang setelah satu sesi.
- Rules dan memory terus berkembang tanpa rusak canonical understanding.
