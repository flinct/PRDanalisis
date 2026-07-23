# Classifier Schema — Lincah AI Chat Assist

## 1. Purpose
Schema ini mendefinisikan cara request user diklasifikasi, diroute, dan diputuskan apakah harus:
- dijawab langsung;
- diminta klarifikasi;
- diarahkan secara halus ke scope yang didukung;
- dieskalasikan ke CS manusia.

Tujuan utama: menjaga AI tetap menjawab hanya dari knowledge pack Lincah, tetap natural, dan tidak keluar context.

---

## 2. High-Level Pipeline
```text
User Query
  ↓
Query Normalization
  ↓
Intent + Topic + Task + Audience Classification
  ↓
Entity Extraction + Validation
  ↓
Hybrid Retrieval (Keyword + Vector + Reranker)
  ↓
Evidence Validation (Priority + Version + Freshness + Agreement)
  ↓
Decision Gate
  ├─ High confidence   → Answer
  ├─ Medium confidence → Clarify
  └─ Low confidence    → Redirect / Escalate
  ↓
Response Validation
  ↓
User
```

---

## 3. Classification Dimensions

### 3.1 Intent
```yaml
intent:
  - general_knowledge
  - support_operational
  - sales_prepurchase
  - out_of_scope_hidden
```

#### Definition
- `general_knowledge`
  - edukasi/penjelasan umum tentang istilah, flow, fitur, atau proses.
- `support_operational`
  - masalah aktif, kendala, komplain, status macet, dana belum masuk, void, claim, dsb.
- `sales_prepurchase`
  - pertanyaan sebelum memakai layanan: coverage, promo, rate, capability, integrasi/API bila ada source.
- `out_of_scope_hidden`
  - query di luar domain Lincah atau tidak punya basis knowledge yang aman untuk dijawab.

#### Intent priority when overlap
```text
support_operational > sales_prepurchase > general_knowledge > out_of_scope_hidden
```

---

### 3.2 Topic
```yaml
topic:
  - shipment
  - order
  - cod
  - claim
  - void
  - rate
  - dashboard
  - account
  - payment
  - withdrawal
  - pickup
  - api
  - promo
  - coverage
  - glossary
  - general_platform
```

#### Topic notes
- `shipment`: pickup, transit, hub, last mile, POD, status kirim.
- `cod`: dana seller, remittance, settlement, pembayaran COD.
- `void`: pembatalan order/pengiriman yang sudah diproses.
- `withdrawal`: WD balance, invoice status, kode WD.
- `api`: hanya bila knowledge mendukung. Jika tidak ada evidence kuat, turunkan ke redirect.

---

### 3.3 Task
```yaml
task:
  - explain
  - troubleshoot
  - guide
  - lookup
  - compare
  - clarify
```

#### Task meaning
- `explain`: menjelaskan definisi/konsep/alur.
- `troubleshoot`: menangani masalah aktif.
- `guide`: memberi langkah SOP/how-to.
- `lookup`: mencari status/arti field/arti data berdasarkan identifier.
- `compare`: membandingkan opsi/rate/flow bila source ada.
- `clarify`: meminta data yang kurang secara sempit.

---

### 3.4 Audience
```yaml
audience:
  - seller_external
  - cs_internal
```

#### Audience rule
- `seller_external`
  - jawaban customer-safe;
  - tidak tampilkan PIC internal, sheet internal, atau jargon sensitif.
- `cs_internal`
  - boleh lebih eksplisit soal SOP internal, routing, PIC, tooling, dan jalur eskalasi.

---

## 4. Entity Extraction and Validation

### 4.1 Entity types
```yaml
entities:
  - tracking_number
  - order_id
  - invoice_code
  - wd_code
  - courier
  - shipment_date
  - seller_name
  - buyer_name
  - screenshot_reference
```

### 4.2 Validation rule
Entity tidak cukup diekstrak. Harus divalidasi.

Contoh:
- `wd_code`: pola `WD...`
- `invoice_code`: pola `BLN...` atau `BLNFU...`
- `courier`: harus cocok dengan daftar kurir yang dikenal di source
- tracking number/order id: minimal lolos format dasar dan tidak kosong/acak

Jika invalid:
- jangan gunakan untuk reasoning seolah valid;
- minta ulang field yang spesifik.

---

## 5. Query Normalization
Normalization dilakukan sebelum klasifikasi dan retrieval.

Contoh normalisasi:
- typo ringan;
- singkatan: `resi`, `wd`, `cod`, `rts`;
- sinonim: `dana belum masuk` = `remittance pending`; `batal kirim` = `void`; `ongkir beda` = `rate adjustment`.

Tujuan:
- menaikkan akurasi classifier;
- memperbaiki retrieval untuk dokumen SOP/flow.

---

## 6. Retrieval Schema

### 6.1 Retrieval mode
```text
BM25 / keyword search
+ vector search
+ reranker
= top 3–5 evidence chunks
```

### 6.2 Chunk metadata
Setiap chunk knowledge minimal punya metadata:

```yaml
chunk_metadata:
  document: string
  section: string
  version: string
  updated_at: date
  effective_date: date
  expiry_date: date|null
  intent: string
  topic: string
  audience: [string]
  keywords: [string]
  source_priority: integer
```

---

## 7. Source Priority Rule
Saat beberapa source tersedia, prioritas awal:

```text
1. SOP / flow operasional khusus
2. Platform feature doc
3. FAQ / dated reference link notes
4. Glossary
5. Overview / basic intro
```

Interpretasi untuk current pack:
- `Flow_*.md` dan `06_CS_Flow.md` = prioritas tinggi
- `05_Lincah_Platform.md` = tinggi-menengah
- `07_Reference_Links*.md` = menengah, terutama untuk pointer/link/date-based notes
- `03_Logistics_Glossary.md` = menengah-rendah
- `00/01/02/04` = rendah, sebagai context/base explanation

Jika dokumen bentrok:
1. ambil source priority lebih tinggi;
2. jika setara, ambil yang lebih baru;
3. jika tetap bentrok, jangan jawab final — clarify atau escalate.

---

## 8. Decision Gate

### 8.1 Confidence inputs
Confidence gabungan dihitung dari:
- confidence classifier;
- kualitas entity;
- retrieval score;
- agreement antar chunk;
- source priority;
- freshness/versi;
- jumlah evidence chunk yang mendukung jawaban yang sama.

### 8.2 Decision rule
```yaml
decision:
  high_confidence: answer
  medium_confidence: clarify
  low_confidence: redirect_or_escalate
```

### 8.3 Clarification policy
Hanya minta informasi yang relevan dengan kasus.

Allowed examples:
- nomor resi;
- order ID;
- kode WD/invoice;
- nama kurir;
- tanggal kirim;
- screenshot error.

Forbidden:
- pertanyaan melebar;
- meminta user cerita ulang terlalu panjang tanpa arah.

---

## 9. Escalation Rule

### 9.1 Escalate when
- user butuh bantuan manusia;
- kasus high-risk/high-touch;
- tindakan perlu sistem internal/manual review;
- evidence tetap lemah setelah retry/clarify;
- ada potensi fraud/finance/system bug;
- stuck beberapa turn tanpa progress.

### 9.2 Escalation payload
Saat eskalasi, payload minimal:
```yaml
escalation_payload:
  summary: string
  intent: string
  topic: string
  task: string
  audience: string
  entities: object
  evidence_docs: [string]
  unresolved_reason: string
```

---

## 10. Response Mode Policy

### 10.1 Answer
Syarat:
- in-scope;
- evidence cukup;
- tidak ada konflik kritis.

### 10.2 Clarify
Syarat:
- in-scope;
- evidence parsial;
- perlu identifier/data tambahan.

### 10.3 Redirect
Syarat:
- out-of-scope;
- atau in-scope tapi pertanyaan terlalu umum/tidak actionable dan tidak ada evidence cukup.

Redirect harus halus, contoh:
- arahkan ke area bantuan Lincah yang memang didukung;
- tawarkan topik yang bisa dibantu;
- jangan bilang AI tidak tahu/tidak mampu.

### 10.4 Escalate
Syarat:
- manual handling diperlukan;
- risiko tinggi;
- SLA/keputusan operasional final perlu manusia.

---

## 11. Special Routing Heuristics

### 11.1 Support beats how-to
Kalau ada sinyal masalah aktif, treat sebagai `support_operational` walau bentuknya seperti pertanyaan cara.

Contoh:
- “cara withdraw” → `general_knowledge` / `guide`
- “withdraw saya belum masuk” → `support_operational` / `troubleshoot`

### 11.2 Hidden out-of-scope
Query bisa kelihatan mirip domain, tetapi tetap out-of-scope bila:
- meminta opini umum non-Lincah;
- minta coding/teknis non-domain;
- minta kebijakan yang tidak ada di source;
- membawa topik di luar layanan logistik Lincah.

### 11.3 Audience override
Kalau channel/session sudah diketahui internal, `audience=cs_internal` harus menang atas inferensi teks.

---

## 12. Logging Schema
```yaml
log_record:
  query: string
  normalized_query: string
  intent: string
  topic: string
  task: string
  audience: string
  entities: object
  entity_validation: object
  retrieved_chunks: [string]
  confidence: number
  decision: answer|clarify|redirect|escalate
  response_template: string
  fallback_used: boolean
  escalation_used: boolean
```

---

## 13. Example Output Schema
```yaml
classification_result:
  intent: support_operational
  topic: cod
  task: troubleshoot
  audience: seller_external
  entities:
    wd_code: WD123456
    courier: null
  confidence: 0.82
  decision: answer
  next_action: provide_safe_steps
```

---

## 14. Minimum v1 Principle
- Jangan buat multi-agent kompleks dulu.
- Cukup 1 pipeline berlapis dengan classifier, retrieval, dan constrained response.
- Buka ruang ekspansi nanti jika volume/complexity naik.
