# Presentasi: Cara Repo PRD Analysis Bekerja untuk QA

---

## 1. Tujuan Repo

Repo ini dipakai sebagai workspace analisis PRD untuk membantu QA memahami fitur sebelum membuat strategi test.

Fokus utamanya:

- Membaca PRD secara sistematis.
- Menemukan business rule eksplisit dan implisit.
- Mendeteksi gap, conflict, ambiguity, regression risk, dan impact lintas fitur.
- Menyimpan pemahaman penting ke memory agar analisis berikutnya tidak selalu mulai dari nol.
- Menjaga rules dan memory tetap berkembang secara incremental.

---

## 2. Struktur Utama Repo

```text
PRD/
Rules/
Memory/
Temp Analysis/
Test/
```

- `PRD/`: sumber requirement dari product, dikelompokkan per domain atau fitur.
- `Rules/`: aturan kerja agent/analyst saat menganalisis PRD, membandingkan PRD, membuat impact analysis, menulis memory, dan membuat test case.
- `Memory/`: konteks reusable yang sudah diringkas dari analisis sebelumnya.
- `Temp Analysis/`: hasil analisis sementara atau output kerja detail yang belum tentu menjadi canonical memory.
- `Test/`: dokumen test atau validasi QA yang dibuat dari hasil analisis.

---

## 3. Peran Rules

Rules adalah instruksi operasional.

Rules menjawab pertanyaan:

- Analisis PRD harus melihat aspek apa saja?
- Kapan perlu comparison antar PRD?
- Bagaimana mengukur impact lintas modul?
- Pengetahuan mana yang masuk global memory?
- Pengetahuan mana yang hanya masuk feature memory?
- Apa yang tidak boleh disimpan sebagai memory?
- Bagaimana test case dibuat tanpa scope creep?

---

## 4. File Rules Penting

- `workflow-rule.md`: urutan kerja wajib sebelum menjalankan task.
- `analisa-prd-rule.md`: format dan fokus analisis satu PRD.
- `prd-comparison-rule.md`: aturan membandingkan dua PRD atau dua versi requirement.
- `impact-analysis-rule.md`: aturan mencari blast radius perubahan.
- `memory-routing-rule.md`: aturan menentukan hasil analisis masuk ke global memory, feature memory, atau tidak disimpan.
- `global-memory-write-rule.md`: aturan menulis canonical memory yang berlaku lintas fitur.
- `global-memory-update-rule.md`: aturan update global memory secara aman.
- `memory-write-rule.md`: aturan mengubah analisis PRD menjadi feature memory yang ringkas.
- `memory-update-rule.md`: aturan merge memory lama dengan insight baru.
- `test-case-rule.md`: aturan membuat dan update test case.

---

## 5. Peran Memory

Memory adalah pengetahuan jangka panjang dari hasil analisis.

Memory membantu QA dan AI agent agar:

- Tidak perlu membaca ulang semua PRD dari awal.
- Memakai baseline behavior yang sudah disepakati.
- Mendeteksi konflik saat PRD baru berbeda dengan rule lama.
- Menjaga konsistensi istilah, status, lifecycle, RBAC, dan dependency.
- Mempercepat impact analysis dan regression mapping.

---

## 6. Jenis Memory

### Global Memory

`Memory/global-memory.md` adalah sumber canonical untuk rule yang stabil dan berlaku lintas fitur.

Contoh isi:

- Domain produk: customer service live chat platform dengan WhatsApp integration.
- Contact: satu global contact per customer, phone number sebagai unique identifier.
- Room chat: status implementation truth memakai `open` dan `closed`.
- Assignment: `participants` adalah sumber assignee.
- SLA: dihitung real-time/service-side, bukan disimpan langsung di conversation document.
- Chat list: search dan filter harus scoped oleh RBAC aktif.
- Open risks: cross-division leakage, queue sync inconsistency, unresolved SLA behavior.

### Feature Memory

Feature memory menyimpan analisis detail per domain atau fitur.

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
- Sering dirujuk oleh banyak feature memory.

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

Berdasarkan `Rules/workflow-rule.md`, setiap task harus mengikuti urutan ini:

1. Read semua rule yang applicable dari folder `Rules/`.
2. Read `Memory/global-memory.md`.
3. Read feature memory yang relevan dari folder `Memory/`.
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

QA memilih PRD atau fitur yang ingin dianalisis.

Contoh:

- Conversation Room.
- Chat List.
- Contact Visibility.
- SLA Conversation.
- Broadcast.
- Ticket.

### Step 2: Baca Rules yang Relevan

Minimal rules untuk QA analysis:

- `workflow-rule.md`
- `analisa-prd-rule.md`
- `impact-analysis-rule.md`
- `memory-routing-rule.md`
- `test-case-rule.md`

Jika membandingkan PRD lama dan baru, tambahkan:

- `prd-comparison-rule.md`

Jika hasil analisis akan disimpan ke memory, tambahkan:

- `memory-write-rule.md`
- `memory-update-rule.md`
- `global-memory-write-rule.md`
- `global-memory-update-rule.md`

---

## 10. Flow Analisis PRD untuk QA

Saat menganalisis PRD, QA tidak hanya membaca acceptance criteria.

QA harus mencari:

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

Output analisis harus berupa structured engineering understanding, bukan rewrite PRD.

---

## 11. Flow Impact Analysis

Impact analysis dilakukan setelah PRD analysis atau PRD comparison.

Tujuannya mencari blast radius.

Area yang dicek:

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

Setiap finding diberi level:

- `LOW`: isolated, tidak punya downstream effect.
- `MEDIUM`: berdampak ke satu atau dua modul terkait.
- `HIGH`: berdampak ke banyak modul, butuh migration, atau mengubah shared behavior.

---

## 12. Flow Test Case untuk QA

Test case dibuat setelah PRD analysis dan impact analysis.

Aturan penting:

- Test case harus sesuai boundary PRD.
- Test case harus cover acceptance criteria.
- Test case harus cover edge case dari analisis.
- Regression test ditambahkan berdasarkan impact analysis.
- Jangan menulis test case untuk behavior speculative atau undefined.
- Jangan memasukkan implementation detail ke test steps.
- Existing test ID dipertahankan kecuali behavior berubah fundamental.
- Test case obsolete ditandai deprecated, bukan langsung dihapus tanpa konfirmasi.

Struktur test case:

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
  -> comparison jika ada PRD lama atau PRD terkait
  -> impact analysis
  -> identifikasi regression scope
  -> buat atau update test case
  -> route insight ke memory
  -> update memory secara incremental
```

Output yang dihasilkan:

- Analisis PRD.
- Daftar conflict dan open question.
- Impact analysis.
- Regression scope.
- Test cases.
- Memory update jika insight stabil dan reusable.

---

## 14. Cara Rules Berkembang

Rules berkembang saat cara kerja analisis perlu distandarkan lebih baik.

Contoh pemicu update rules:

- QA menemukan pola gap yang sering muncul.
- Format output analisis perlu diperjelas.
- Ada risiko baru yang belum tercakup, misalnya audit log atau event ordering.
- Test case sering melebar dari scope PRD.
- Memory sering terduplikasi atau salah routing.

Prinsip update rules:

- Tambahkan aturan yang reusable.
- Jangan membuat rules terlalu spesifik untuk satu fitur.
- Jangan mengubah rules tanpa memahami dampaknya ke workflow lain.
- Rules harus membantu konsistensi, bukan menambah noise.

---

## 15. Cara Memory Berkembang

Memory berkembang dari hasil analisis yang sudah cukup stabil.

Flow update memory:

```text
Insight ditemukan
  -> cek apakah reusable atau feature-specific
  -> bandingkan dengan global memory dan feature memory lama
  -> deteksi conflict
  -> route ke global memory atau feature memory
  -> update section yang relevan saja
  -> jangan regenerate dari nol
```

Aturan penting:

- Global memory harus evolve incremental.
- Jangan overwrite global memory secara blind.
- Jika PRD baru contradict dengan global memory, flag inconsistency.
- Existing canonical rule dipertahankan sampai ada explicit confirmation.
- Feature memory tidak boleh menduplikasi canonical rule.
- Temporary assumption tidak boleh menjadi memory permanen.

---

## 16. Contoh Perkembangan Memory

Contoh insight dari PRD Conversation:

- PRD lama memakai status `Ongoing` dan `Resolved`.
- Implementasi memakai `open` dan `closed`.
- Setelah dikonfirmasi sebagai implementation truth, global memory menyimpan canonical rule: conversation status adalah `open` / `closed`.

Dampak untuk QA:

- Test case tidak boleh menganggap `Ongoing` / `Resolved` sebagai status backend canonical.
- Jika UI masih memakai wording lama, QA harus membedakan UI label dan actual state.
- Regression harus memastikan Chat List, Room, Detail, dan API konsisten memakai state yang sama.

---

## 17. Cara Menggunakan Memory Saat QA Testing

Sebelum menyusun test strategy, QA membaca memory untuk mendapatkan baseline.

Contoh pertanyaan yang dijawab memory:

- Apa canonical status conversation?
- Apakah assignee berasal dari field `assignedTo` atau `participants`?
- Apakah SLA disimpan atau dihitung real-time?
- Apakah search harus mengikuti RBAC scope?
- Apakah solved atau closed room bisa dimutasi?
- Area mana yang regression sensitive?

Dengan baseline ini, QA bisa membedakan:

- Requirement baru.
- Existing canonical behavior.
- Conflict antar PRD.
- Open question yang perlu clarification.
- Regression scope yang wajib dites.

---

## 18. QA Mindset di Repo Ini

QA berperan sebagai system risk detector, bukan hanya test executor.

Hal yang harus aktif dicari:

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

- Mulai dari global memory sebelum membaca detail PRD.
- Jangan percaya satu PRD sebagai single source jika fitur menyentuh shared entity.
- Selalu cek feature memory untuk conflict dan historical reasoning.
- Pisahkan confirmed rule, assumption, dan open question.
- Jangan membuat test case untuk behavior yang belum didefinisikan.
- Untuk HIGH impact, tulis mitigation atau validation tambahan.
- Update memory hanya untuk insight yang stabil dan reusable.
- Jangan menyalin raw PRD ke memory.

---

## 20. Ringkasan

Repo ini bekerja sebagai sistem knowledge loop untuk QA PRD analysis.

```text
Rules mengatur cara berpikir
PRD menjadi input requirement
Analysis menemukan behavior, risk, dan gap
Impact Analysis menentukan blast radius
Test Case mengubah insight menjadi validasi QA
Memory menyimpan pengetahuan stabil untuk analisis berikutnya
```

Manfaat utama untuk QA:

- Analisis lebih konsisten.
- Regression scope lebih jelas.
- Conflict antar PRD lebih cepat terlihat.
- Test case lebih terarah.
- Knowledge tidak hilang setelah satu sesi analisis.
- Rules dan memory terus berkembang tanpa merusak canonical understanding.
