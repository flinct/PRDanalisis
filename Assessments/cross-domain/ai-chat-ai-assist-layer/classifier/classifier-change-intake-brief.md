# Change Intake Brief — Lincah AI Chat Assist Classifier

## 1. Request Metadata
- **Request Name**: Lincah AI Chat Assist Classifier
- **Feature Slug**: `classifier-lincah-ai-chat-assist`
- **Domain**: `crossdomain/ai-chaat-ai-assist`
- **Request Type**: New feature / classifier and response-governance layer
- **Requested By**: User
- **Analyst**: Dany Christian
- **Date**: 2026-07-16
- **Status**: Draft v0

---

## 2. Problem Statement
Lincah membutuhkan chatbot AI yang bisa menjawab cepat untuk kebutuhan customer/seller sebelum perlu bantuan CS manusia, tetapi tetap dibatasi ketat agar tidak keluar dari pengetahuan yang sudah disediakan.

Problem utama yang harus dicegah:
1. AI menjawab di luar knowledge pack Lincah.
2. AI terdengar natural tetapi mengarang langkah/SOP.
3. AI tidak bisa membedakan pertanyaan edukasi umum vs kendala operasional aktif.
4. AI terlalu cepat eskalasi ke CS padahal masih bisa dibantu otomatis.
5. AI menunjukkan ketidaksanggupan secara eksplisit saat ditanya di luar scope.

---

## 3. Desired Outcome
Classifier dan response-governance layer harus memungkinkan AI untuk:
- menjawab cepat untuk pertanyaan/keluhan yang masih bisa ditangani dari knowledge pack;
- memberi langkah yang aman bila memang ada SOP/flow yang mendukung;
- tetap terdengar human, singkat, dan relevan;
- menolak hal di luar scope secara halus tanpa mengaku tidak mampu;
- mengarahkan ke CS manusia hanya bila memang perlu.

---

## 4. Business Goal
- Mengurangi beban CS untuk pertanyaan umum dan kasus operasional ringan.
- Meningkatkan first-response speed ke customer/seller.
- Menjaga akurasi jawaban agar tetap sesuai SOP/knowledge internal Lincah.
- Menurunkan risiko hallucination dan jawaban bebas di luar domain.

---

## 5. Primary Users / Audience
### Phase 1
- **Seller / customer external** yang bertanya seputar layanan Lincah.

### Phase 2
- **CS internal / operator internal** yang membutuhkan arahan SOP atau routing kasus.

> Catatan: audience harus diperlakukan sebagai dimensi klasifikasi terpisah. Jawaban ke seller external tidak boleh membocorkan detail SOP/pic internal.

---

## 6. In-Scope Knowledge Source
Knowledge source awal diambil dari folder:
- `New folder/Lincah_Breakdown/README.md`
- `00_Overview.md`
- `01_Logistics_Basics.md`
- `02_Shipping_Flow.md`
- `03_Logistics_Glossary.md`
- `04_Operational_Teams.md`
- `05_Lincah_Platform.md`
- `06_CS_Flow.md`
- `07_Reference_Links*.md`
- `Flow_Cek_Dana_Seller.md`
- `Flow_CS_Penyesuaian_Ongkos_Kirim_Seller.md`
- `Flow_CS_VOID_Pesanan_3PL.md`
- `Flow_Pengiriman_Barang_Breakdown.md`
- `Alur_Pendaftaran_Akun_Breakdown.md`

---

## 7. Explicit Scope Boundary
AI hanya boleh membantu topik yang punya dukungan knowledge dari domain Lincah, terutama:
- pengiriman / shipment;
- order;
- COD / remittance / dana seller;
- claim;
- void;
- rate / ongkir;
- dashboard seller;
- account / pickup / payment / withdrawal;
- informasi umum layanan/logistik Lincah;
- pertanyaan pre-sales yang memang tertulis di knowledge source.

Di luar itu, AI harus melakukan polite redirect ke area bantuan Lincah yang didukung.

---

## 8. Non-Goals / Out of Scope
- AI menjawab pertanyaan umum bebas seperti asisten serbaguna.
- AI menjawab coding, opini, konsultasi hukum/keuangan umum, atau domain di luar Lincah.
- AI mengambil keputusan operasional final tanpa evidence.
- AI membuka SOP internal sensitif atau PIC internal ke seller external.
- AI membuat langkah baru yang tidak ada di source.

---

## 9. Required Behaviors
1. **Constrained answer only**
   - Jawaban harus berbasis evidence yang diambil dari knowledge source.
2. **Human-like response**
   - Bahasa natural, singkat, sopan, tidak kaku, tidak terlalu robotik.
3. **No out-of-context answer**
   - Jika query di luar context, AI tidak boleh menjawab bebas.
4. **No explicit incapability disclosure**
   - Jika query di luar context, AI harus redirect halus ke area yang didukung tanpa mengatakan “saya tidak tahu / saya tidak bisa”.
5. **Deflect before escalate**
   - Selama evidence cukup dan langkah aman tersedia, AI harus mencoba membantu dulu sebelum handoff ke CS.
6. **Guided step allowed**
   - AI boleh memberikan langkah bertahap, tetapi hanya bila langkah tersebut ada di SOP/flow source.
7. **Escalation when needed**
   - Jika kasus butuh tindakan manusia, missing evidence, atau high-risk case, AI harus menyiapkan handoff ke CS.

---

## 10. Required Classification Dimensions
Request masuk minimal harus diklasifikasi menjadi:

```yaml
intent: general_knowledge | support_operational | sales_prepurchase | out_of_scope_hidden
topic: shipment | order | cod | claim | void | rate | dashboard | account | payment | withdrawal | pickup | api | promo | coverage | glossary
task: explain | troubleshoot | guide | lookup | compare | clarify
audience: seller_external | cs_internal
```

Priority order bila overlap:
1. `support_operational`
2. `sales_prepurchase`
3. `general_knowledge`
4. `out_of_scope_hidden`

---

## 11. Required Decision Policy
- **High confidence**: jawab langsung.
- **Medium confidence**: minta klarifikasi sempit yang relevan.
- **Low confidence**: redirect halus atau eskalasi ke CS sesuai tipe kasus.

Clarification hanya boleh meminta info operasional relevan, contoh:
- nomor resi;
- order ID;
- invoice / kode WD;
- kurir;
- tanggal pengiriman;
- screenshot kendala.

---

## 12. Escalation Trigger
Eskalasi ke CS manusia dilakukan jika:
- kasus butuh tindakan manual/internal;
- evidence tidak cukup setelah retry retrieval/clarification;
- user eksplisit meminta bantuan manusia;
- ada indikasi issue high-risk (fraud, dana, void urgent, bug sistem);
- sudah ada beberapa turn tanpa progress penyelesaian.

---

## 13. Risk / Open Concern
- Knowledge pack campuran antara FAQ, flow, glossary, dan link operasional → perlu source priority.
- Ada potensi konflik antar dokumen → model tidak boleh memilih sendiri.
- Ada sinyal domain melebar dari dokumen pendaftaran akun → perlu dibatasi agar classifier tetap logistics-first.
- Seller external vs CS internal butuh jawaban berbeda → audience routing wajib.

---

## 14. Initial Recommendation
Arsitektur minimum yang disarankan:
1. Router / classifier;
2. hybrid retrieval + evidence validation;
3. constrained responder + response validator;
4. escalation hook ke CS.

Tidak perlu multi-agent kompleks di fase awal. Satu pipeline berlapis sudah cukup.

---

## 15. Output Artifact Needed
Dokumen yang dibutuhkan pada fase ini:
- `classifier-change-intake-brief.md`
- `classifier-schema.md`
- `classifier-spec.md`

---

## 16. Acceptance Direction
Draft classifier dianggap siap direview bila sudah mendefinisikan:
- scope knowledge;
- class taxonomy;
- routing rule;
- answer vs clarify vs redirect vs escalate gate;
- response guardrail;
- source priority;
- audience split;
- explicit out-of-scope handling.
