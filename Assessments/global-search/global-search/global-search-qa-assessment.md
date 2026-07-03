# QA Assessment Report: Shared Attribute Discovery & Related Record Suggestions

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Source PRD / Source Input:** `PRD/Conversationv2/PRD - Global Search (Conversation + Ticket).md`
> **Assessment Artifact Path:** `Assessments/global-search/global-search/global-search-qa-assessment.md`
> **Version:** `v2.3`
> **Previous Version:** `Assessments/global-search/global-search/versions/global-search-qa-assessment-v2.2.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/prd-writing-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `Memory/comprehensive-undeveloped-features-analysis.md`
> **Tanggal Analisa:** 2026-06-15
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- **v1.0–v1.2:** fokus pada **generic Global Search** lintas Conversation + Ticket, termasuk message-body search, drawer UX, dan cross-collection search pipeline.
- **v2.0:** feature direframe menjadi **shared-attribute discovery roadmap** berbasis identifier bisnis seperti `AWB`, `Order ID`, `Tracking Number`.
- **v2.1:** UX surface diperjelas: hasil pencarian Phase 1 menggunakan **popup modal centered overlay** sebagai primary surface, bukan drawer.
- **v2.2:** Diagram visual di Section 4 dikembalikan agar perbandingan **Current State vs Proposed State** lebih mudah dibaca. Diagram sekarang mencakup current fragmented state, phased target model, recommended delivery model, dan one-engine-many-consumers principle.
- **v2.3:** Analisa ekspansi ke **actionable search** ditambahkan. Temuan utama:
  - per-item open ke Conversation Room + Detail aman dan selaras dengan objective
  - bulk selection **tidak disarankan lintas domain** pada versi pertama
  - auto-tag berbasis hasil search **lebih aman sebagai system relation label / system tag terpisah**, bukan langsung reuse tag manual existing
  - filter by tag perlu dipisah antara **manual tags** dan **system relation tags** agar tetap usable
- Generic search **bukan lagi tujuan utama**. Search sekarang diposisikan sebagai **Phase 1 discovery surface** untuk mendeteksi record terkait sebelum grouping/handling lanjutan.
- Fase roadmap baru:
  - **Phase 1:** Global Search Suggestions lintas Ticket + Conversation berdasarkan shared attributes.
  - **Phase 2:** Automatic Ticket Tagging + grouped/related ticket visibility.
  - **Phase 3:** Automatic Conversation Tagging + related conversation visibility.
- Revisi ini **mengurangi scope generic search** tetapi **meningkatkan interconnection risk** karena sekarang feature overlap langsung dengan PRD `Related Tickets and Ticket Merge Suggestion`, `Related Conversations Grouping`, dan `Conversation Custom Attributes`.

---

## 1. Overview

**Feature / Issue:** Shared Attribute Discovery & Related Record Suggestions

**Objective:**
Memungkinkan agent menemukan, menghubungkan, dan memahami tiket/percakapan yang berbagi business attribute yang sama (misalnya AWB, Order ID, Tracking Number) agar handling customer lebih konsisten, tidak duplikatif, dan lebih traceable.

**Business Context:**
- Saat ini identifier operasional seperti AWB atau Order ID tersebar di custom attributes, custom fields, atau message context.
- Agent sering menangani kasus baru tanpa tahu bahwa ticket atau conversation lain dengan konteks bisnis yang sama sudah ada.
- Satu customer journey bisa pecah ke banyak channel, banyak ticket, dan banyak conversation.
- Workspace sudah punya arah fitur `Related Tickets` dan `Related Conversations`, tetapi discovery surface lintas domain belum ada.
- Maka Global Search tidak lagi cukup didefinisikan sebagai pencarian generik; ia harus menjadi **entry point untuk relationship discovery**.

**Scope In (reframed):**
- Search lintas Ticket + Conversation berbasis shared business attributes.
- Match explanation (`Matched by`, `Matched value`) untuk menjelaskan kenapa record muncul.
- Suggestion surface untuk menemukan existing record sebelum user membuat atau menangani case baru.
- Roadmap alignment menuju automatic tagging di Ticket dan Conversation.
- Reuse dan sinkronisasi dengan PRD `Related Tickets and Ticket Merge Suggestion` serta `Related Conversations Grouping`.

**Scope Out (untuk PRD ini):**
- Generic free-text search sebagai core objective.
- Full message history discovery sebagai fokus utama.
- AI semantic search atau fuzzy matching.
- Merge logic detail Ticket/Conversation di PRD ini.
- Full implementation detail Phase 2 dan Phase 3 — harus dipatch di PRD domain masing-masing.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `SPLIT_FEATURE`

**Decision Class:** `NO_GO`

**Decision Statement:**
> Ekspansi Global Search menjadi **actionable search** valid, tetapi **tidak aman** jika dimasukkan sebagai satu paket perubahan dalam PRD Phase 1 yang sekarang. Per-item open masih selaras dengan discovery surface. Namun bulk selection, auto-tag dari hasil search, dan perbaikan filter by tag sudah masuk ke domain **mutation + taxonomy + filter governance**, sehingga harus dipecah menjadi delivery terpisah: (A) Actionable Search Navigation, (B) System Relation Tags / Labels, dan (C) Tag Filter UX improvement.

### 2.2 Required Actions Before Development

- [ ] **Split scope** menjadi 3 paket:
  - **A. Actionable Search Navigation**: per-item open, result-level actions, selection UX
  - **B. System Relation Tags / Labels**: auto-tag model, lifecycle, audit, visibility
  - **C. Tag Filter UX Improvement**: filter discoverability, manual vs system tag separation
- [ ] **Putuskan selection model v1**: rekomendasi **per-domain only** (`Conversation` dan `Ticket` dipilih & dieksekusi terpisah), bukan satu bulk bucket lintas domain.
- [ ] **Putuskan representasi auto-tag**: gunakan **system relation label** atau **system tag** terpisah dari tag manual existing.
- [ ] **Definisikan naming model** untuk system relation tags/labels:
  - display label: `AWB • <value>`, `Order ID • <value>`, `Tracking • <value>`
  - internal key: `rel.<attribute_key>.<normalized_value>`
- [ ] **Patch PRD Tag Management dan Auto Tag** jika ingin reuse infra tag existing, karena model saat ini didesain untuk taxonomy terbatas, bukan unbounded identifier-generated tags.
- [ ] **Patch search PRD** untuk menambah action model, tetapi JANGAN langsung commit bulk cross-domain mutation sebelum semantics disepakati.
- [ ] **Review filter by tag UX**: pisahkan `Manual Tags` vs `System Relation Tags`, tambah exact value search, recent chips, dan one-click filter from result.

### 2.3 Key Blocking Reasons / Conditions

- **Condition 1:** Current PRD Phase 1 masih discovery-only. Bulk action dan auto-tag berarti feature sekarang punya mutation side effects yang belum didefinisikan.
- **Condition 2:** Bulk selection lintas domain (`Conversation` + `Ticket` dalam satu selected bucket) akan mencampur dua entity model, dua permission scope, dan dua action semantics yang berbeda.
- **Condition 3:** Reuse Tag Management existing secara langsung berisiko menciptakan **tag explosion**, karena setiap nilai AWB/Order ID berpotensi menjadi tag unik baru.
- **Condition 4:** Filter by tag existing akan cepat menjadi noisy jika manual tags dan generated identifier-tags dicampur dalam satu filter surface.
- **Condition 5:** Jika shared-attribute registry, tag lifecycle, dan filter UX belum jelas, hasil mutation akan sulit diaudit, sulit dibersihkan, dan mudah drift dari data source.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Critical
- **Risk Level:** High
- **Primary Impact Areas:** Search, Ticket, Conversation, Custom Attributes, Custom Fields, Tag Management, Auto Tag System, Filter UX, RBAC, Data Model, Observability

---

## 3. Requirement Summary

### 3.1 Reframed Business Rules

| BR ID | Business Rule | Source / Rationale |
|------|---------------|--------------------|
| BR-01 | Shared business attributes (AWB, Order ID, Tracking Number, etc.) menjadi basis relationship discovery lintas Ticket dan Conversation. | User direction 2026-06-15 |
| BR-02 | Phase 1 harus fokus pada **discovery**: menemukan existing records sebelum create/handle baru. | User direction 2026-06-15 |
| BR-03 | Phase 2 dan Phase 3 harus menggunakan mekanisme matching yang sama dengan Phase 1 agar suggestion, tagging, dan grouping konsisten. | User direction + cross-feature consistency |
| BR-04 | Ticket dan Conversation harus bisa menjelaskan **kenapa** suatu record dianggap related (`Matched by`, `Matched value`). | Existing related PRDs |
| BR-05 | Matching harus exact/normalized terlebih dahulu; fuzzy/semantic keluar dari scope. | Existing related PRDs |
| BR-06 | Global Search sekarang adalah **relationship-discovery surface**, bukan generic enterprise search engine. | Reframed scope |

### 3.2 Key Analysis Finding

1. **Arah baru lebih tepat secara bisnis** dibanding generic search, karena langsung meng-address duplicate handling dan fragmented customer context.
2. **PRD lama terlalu lebar** untuk objective baru: message-body search, generic ranking, dan broad result model akan menambah biaya tanpa langsung menyelesaikan shared-context problem.
3. **Phase 2 dan 3 bukan sekadar enhancement UI** — keduanya mengubah tagging model, related-record visibility, dan mungkin persistence/data model.
4. **Ada overlap kuat** dengan PRD existing:
   - Related Tickets and Merge
   - Related Conversations Grouping
   - Conversation Custom Attributes
5. **Roadmap ini harus menjaga satu engine matching** agar tidak lahir tiga versi logic berbeda antara search, ticket, dan conversation.

### 3.3 Assumptions

| ID | Assumption | Risk if Wrong |
|----|------------|---------------|
| A-01 | Shared attribute values tersedia di minimal salah satu sumber: custom fields, custom attributes, properties, atau indexed metadata. | Discovery surface kosong / lemah |
| A-02 | Exact-match normalization cukup untuk Phase 1. | Banyak kasus terkait tidak terdeteksi |
| A-03 | Existing Ticket/Conversation detail surfaces cukup untuk menampilkan related/grouped info di fase berikutnya. | Butuh redesign UI lebih besar |
| A-04 | Auto-tags dapat dibedakan jelas dari manual tags. | User bingung, audit sulit |

### 3.4 Clarifications Needed

| ID | Clarification | Why It Matters |
|----|---------------|----------------|
| CL-01 | Apakah shared attributes dikonfigurasi di level workspace seperti `Related Match Keys`, atau hardcoded daftar global? | Menentukan fleksibilitas dan governance |
| CL-02 | Apakah auto-tag dihasilkan saat create/update saja, atau juga melalui backfill historical data? | Menentukan migration dan rollout |
| CL-03 | Apakah auto-tag boleh diedit/hapus manual oleh agent? | Menentukan ownership tag dan audit |
| CL-04 | Jika satu record punya beberapa identifier (mis. 3 AWB), apakah semua jadi tag? | Menentukan explosion risk di tag UI |
| CL-05 | Jika Ticket dan Conversation sama-sama punya AWB yang match, mana yang jadi “primary handling anchor”? | Menentukan UX navigation dan future grouping logic |
| CL-06 | Apakah user ingin bulk select berlaku lintas domain atau per-domain? | Menentukan selection state, action bar, permission checks, dan audit model |
| CL-07 | Apakah auto-tag harus menjadi tag nyata di Tag Management, atau cukup system relation label yang tampil seperti tag? | Menentukan blast radius taxonomy, filter UX, dan data cleanup |
| CL-08 | Jika satu record punya 10 identifier berbeda, apakah semua harus ditampilkan/dijadikan tag? | Menentukan chip overload dan filter usability |

### 3.5 Actionable Search Expansion Analysis

| Requested Change | Analysis | Recommendation |
|------------------|----------|----------------|
| 1. Per-item click → Conversation Room + Detail | Aman dan selaras dengan current popup search objective. Hanya memperjelas navigation target. | **Proceed**. Untuk Conversation result, buka Room + Detail state sekaligus. Untuk Ticket result, buka Ticket Detail. |
| 2. Bulk select | Ini sudah mengubah search dari discovery surface menjadi operational mutation surface. Cross-domain selection akan mempersulit permission, audit, dan action semantics. | **Per-domain only untuk v1**. User boleh select beberapa Conversation ATAU beberapa Ticket, tapi action dieksekusi per section/domain. Jangan campur dalam satu selected bucket lintas domain. |
| 3. Bulk action → auto-tag | Valid secara bisnis, tetapi risk tinggi jika langsung memakai tag model existing. Setiap AWB/Order ID unik bisa menciptakan ledakan tag. | Gunakan **system relation label** atau **system tag terpisah**. Jangan langsung jadikan setiap identifier sebagai manual tag global. |
| 4. Dampak auto-tag | Menyentuh search, tagging, filtering, audit, analytics, cleanup, dan possibly migration/backfill. | Perlakukan sebagai paket feature terpisah, bukan sekadar action tambahan di popup search. |
| 5. Filter by tag improvement | Wajib dibenahi kalau system-generated tags ikut tampil. Tanpa pemisahan, filter akan noisy dan susah dipakai. | Tambahkan `Manual Tags` vs `System Relation Tags`, exact-value search, recent filter chips, quick filter dari hasil search. |

#### 3.5.1 Bulk Selection Model Recommendation

**Rekomendasi final: per-domain only di versi pertama.**

Alasan:
- `Conversation` dan `Ticket` punya lifecycle, RBAC, dan bulk semantics berbeda.
- Existing product juga memperlakukan bulk action per domain (Conversation list punya bulk actions sendiri, Ticket list juga punya bulk actions sendiri).
- Jika user select lintas domain dalam satu bucket, action seperti tag apply, close, assign, atau reopen akan jadi ambigu.

**Model yang disarankan:**
- Section `Percakapan` punya checkbox sendiri + bulk bar sendiri.
- Section `Tiket` punya checkbox sendiri + bulk bar sendiri.
- Search popup boleh menampilkan kedua section sekaligus, tetapi selection state tetap terpisah.

#### 3.5.2 Auto-Tag Naming Recommendation

**Jangan pakai nama seperti:**
- `autotag_awb_1234`
- `shared_attr_ORD7788`
- `RELATION_AWB_JNE123456`

**Nama yang readable untuk user-facing chip:**
- `AWB • JNE123456789`
- `Order ID • ORD-7788`
- `Tracking • SPX9981`

**Internal key yang disarankan:**
- `rel.awb.jne123456789`
- `rel.order_id.ord7788`
- `rel.tracking.spx9981`

**Rekomendasi istilah produk:**
- user-facing category: **Tag Relasi Otomatis**
- internal model: **system relation tag** atau **relation label**

#### 3.5.3 Kenapa Lebih Aman Pakai System Relation Label daripada Tag Existing

PRD Tag Management dan Auto Tag existing didesain untuk:
- taxonomy tag terbatas
- nama tag manual yang reusable
- visibility `Conversation`, `Ticket`, atau `All`
- filtering berbasis daftar tag yang relatif stabil

Sedangkan identifier-generated tags akan:
- berjumlah sangat besar (1 AWB = 1 tag unik)
- cepat mengotori global tag registry
- sulit dibersihkan saat value berubah
- berisiko melewati batas panjang/validasi nama tag di beberapa modul
- membuat filter dan analytics jadi noisy

**Kesimpulan:**
> tampilkan seperti tag di UI, tetapi secara model lebih aman dipisah sebagai `system relation labels/tags`.

#### 3.5.4 Filter by Tag Improvement Recommendation

Jika auto-tag/system relation label diterapkan, filter by tag existing perlu diperbaiki dengan minimal 4 hal:

1. **Pisahkan jenis filter**
   - `Manual Tags`
   - `System Relation Tags`

2. **Support exact-value filter search**
   - user bisa ketik `AWB-1234`
   - dropdown suggestion langsung menampilkan `AWB • AWB-1234`

3. **Quick filter from result**
   - dari result card, klik chip `AWB • AWB-1234` → filter semua hasil/search/list ke value itu

4. **Recent / pinned system relation filters**
   - memudahkan user yang berulang kali cek identifier sama

Tanpa improvement ini, filter existing akan cepat overload dan sulit dipakai.

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- Search lintas domain baru berada di level konsep generic global search.
- Related Tickets belum developed.
- Related Conversations belum developed.
- Conversation Custom Attribute Collections masih dicatat undeveloped di memory.
- Tidak ada consistent cross-domain shared-attribute discovery surface.
- Tidak ada automatic tagging system untuk shared-attribute grouping.

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CURRENT STATE (AS-IS)                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Customer issue / business context                                   │
│  e.g. AWB-1234, Order-7788, Tracking XYZ                             │
│                  │                                                   │
│                  ├──────────────────────┬──────────────────────┐     │
│                  ▼                      ▼                      ▼     │
│        Conversation System      Ticket System          Agent Handling │
│        ┌──────────────────┐     ┌──────────────────┐   ┌───────────┐ │
│        │ custom attrs     │     │ custom fields    │   │ Agent must│ │
│        │ properties       │     │ title/desc       │   │ guess where│ │
│        │ messages         │     │ replies          │   │ to search  │ │
│        └──────────────────┘     └──────────────────┘   └───────────┘ │
│                 │                       │                    │         │
│        ❌ no shared discovery    ❌ no shared discovery      ❌ no     │
│        ❌ no auto-tagging        ❌ no auto-tagging          unified   │
│        ❌ related conversations  ❌ related tickets          context    │
│           not implemented           not implemented                    │
│                                                                      │
│  Result: fragmented case context, duplicate handling, low traceability│
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Proposed State (To-Be)

#### Phase 1 — Shared Attribute Global Search Suggestions
User memasukkan identifier seperti `AWB-1234` → system mencari Ticket + Conversation yang memiliki attribute/value yang sama → hasil tampil sebagai suggestions dengan alasan match.

#### Phase 2 — Automatic Ticket Tagging + Related Ticket Visibility
Saat shared attribute terdeteksi di Ticket → system menghasilkan system-tag/derived-tag → Ticket Module menampilkan grouped/related ticket information berdasarkan tag dan/atau match key tersebut.

#### Phase 3 — Automatic Conversation Tagging + Related Conversation Visibility
Saat shared attribute terdeteksi di Conversation → system menghasilkan system-tag/derived-tag → Conversation Module menampilkan related conversation context dan navigasi terkait.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PROPOSED STATE (TO-BE)                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Shared business attribute                                            │
│  e.g. AWB-1234                                                        │
│                  │                                                   │
│                  ▼                                                   │
│        ┌──────────────────────────────┐                              │
│        │ Shared Matching Engine       │                              │
│        │ - exact normalized match     │                              │
│        │ - same rules cross-domain    │                              │
│        │ - same explanation source    │                              │
│        └──────────────┬───────────────┘                              │
│                       │                                              │
│       ┌───────────────┼────────────────┬────────────────────────┐    │
│       ▼               ▼                ▼                        ▼    │
│  Phase 1         Phase 2          Phase 3                 Future     │
│  Search          Ticket           Conversation            Consumers   │
│  Suggestions     Auto-Tagging     Auto-Tagging            (analytics, │
│  + popup         + grouped        + related visibility    audits, etc)│
│  results         ticket context   + navigation                       │
│                                                                      │
│  Output principle:                                                   │
│  matchedBy + matchedValue + RBAC-safe result + reusable logic        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.3 Recommended Delivery Model

| Phase | Goal | Delivery Shape |
|------|------|----------------|
| Phase 1 | Discovery | Reframe current Global Search PRD menjadi attribute-centric search suggestions |
| Phase 2 | Ticket actionability | Patch `Related Tickets and Ticket Merge Suggestion` + ticket tagging/display behavior |
| Phase 3 | Conversation actionability | Patch `Related Conversations Grouping` + conversation tagging/display behavior |

```
┌──────────────────────────────────────────────────────────────────────┐
│                      RECOMMENDED DELIVERY MODEL                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Phase 1: DISCOVERY                                                  │
│  Search popup / full-page fallback                                   │
│  └─ goal: find related records before action                         │
│                                                                      │
│  Phase 2: TICKET ACTIONABILITY                                       │
│  Patch Related Tickets PRD                                           │
│  └─ goal: auto-tag + grouped/related ticket visibility               │
│                                                                      │
│  Phase 3: CONVERSATION ACTIONABILITY                                 │
│  Patch Related Conversations PRD                                     │
│  └─ goal: auto-tag + related conversation visibility                 │
│                                                                      │
│  Rule:                                                               │
│  DO NOT build 3 separate matching logics.                            │
│  Build 1 shared engine, then phase consumers on top.                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.4 Key Architectural Principle

> **Satu engine matching, banyak consumer.**
>
> Matching logic shared-attribute harus menjadi satu reusable rule/service/pipeline yang dipakai oleh:
> 1. Global Search Suggestions
> 2. Ticket auto-tagging
> 3. Conversation auto-tagging
> 4. Related Ticket suggestions
> 5. Related Conversation suggestions

Jika tiap surface membuat logic matching sendiri, hasil relation akan saling bertentangan.

```
┌──────────────────────────────────────────────────────────────────────┐
│                   ONE MATCHING ENGINE, MANY CONSUMERS               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    Shared Matching Engine                            │
│         (normalization + approved keys + ranking policy)             │
│                              │                                       │
│      ┌───────────────────────┼───────────────────────┐               │
│      ▼                       ▼                       ▼               │
│  Search Suggestions     Ticket Auto-Tags      Conversation Auto-Tags │
│      │                       │                       │               │
│      ▼                       ▼                       ▼               │
│ Related Search UI      Related Ticket UX      Related Conversation UX│
│                                                                      │
│  BAD PATTERN TO AVOID:                                               │
│  Search logic A ≠ Ticket logic B ≠ Conversation logic C              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Search bukan lagi surface generik; jadi consumer dari related-record discovery | Search UI, ticketing, conversation, detail surfaces | HIGH | Harus jelas boundary Phase 1 vs 2 vs 3 |
| Database | Potensi field/tag derived baru dan index shared-attribute | tickets, conversations, custom attribute storage, custom field storage | HIGH | Jangan commit persistence model sebelum lifecycle tag diputuskan |
| API | Search response perlu `matchFields`, `matchedBy`, `matchedValue`, mungkin `relatedCount` | API Gateway, ticket-service, conversation-service | HIGH | Gunakan schema konsisten lintas domain |
| UI/UX | Result card bukan sekadar hasil search; harus menjelaskan relation reason | Search popup/page, ticket detail, conversation detail | HIGH | `Matched by` dan `Matched value` wajib konsisten; popup menghindari konflik dengan right-side drawers/widgets |
| Security / RBAC | Related suggestions lintas domain tetap harus hormati visibility per domain | Search, ticket detail, conversation detail | HIGH | Jangan expose existence di luar scope role |
| Performance | Matching shared attributes lebih murah daripada message-body search, tapi tagging/backfill bisa mahal | Search pipeline, indexing, migration jobs | MEDIUM | Prioritaskan exact indexed fields di Phase 1 |
| Integration | Overlap langsung dengan existing related-ticket dan related-conversation PRDs | Product spec consistency | HIGH | Patch PRD domain, jangan diverge |
| Reporting / Analytics | Tagging dan grouping akan memengaruhi future analytics | Analytics, audit, support traceability | MEDIUM | Tambahkan observability sejak Phase 1 |
| Operational | Agent akan mengandalkan suggestion untuk mencegah duplicate handling | Workflow handling customer | HIGH | False-positive/false-negative harus dimonitor |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Phase 1 Search Suggestions | Shared attribute registry / match keys | Config + logic | Search → Config | Core dependency |
| Phase 1 Search Suggestions | Custom Attributes / Custom Fields searchability | Data/index | Search → storage/index | AWB-like values must be indexed |
| Phase 2 Ticket Tagging | Phase 1 matching logic | Logic reuse | Ticket → shared matcher | Jangan reimplement sendiri |
| Phase 2 Ticket Visibility | `Related Tickets and Ticket Merge Suggestion` PRD | Product dependency | Ticket tagging → related ticket UX | Must patch existing PRD |
| Phase 3 Conversation Tagging | Phase 1 matching logic | Logic reuse | Conversation → shared matcher | Same rules as ticket |
| Phase 3 Conversation Visibility | `Related Conversations Grouping` PRD | Product dependency | Conversation tagging → related conversation UX | Must patch existing PRD |
| Cross-phase consistency | Exact normalization rules | Rule dependency | All consumers → shared rules | AWB / order id normalization |

### 6.2 Shared Resources / Event Mapping

Potential shared resources:
- match key configuration / registry
- search indexes for shared attributes
- system tag generation logic
- audit trail for derived-tag add/remove events
- optional background backfill jobs

Potential event surfaces (future):
- `ticket.shared-attribute.detected`
- `conversation.shared-attribute.detected`
- `ticket.system-tag.updated`
- `conversation.system-tag.updated`

> Belum wajib di Phase 1, tetapi jika Phase 2/3 ingin near-real-time, event strategy harus dipikirkan dari awal.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Search, Ticket, dan Conversation memakai logic matching yang berbeda | Medium | Critical | HIGH | Satu shared matcher / one rule source |
| R-02 | Auto-tags tidak punya lifecycle jelas saat attribute berubah/hilang | High | High | HIGH | Tentukan add/update/remove/backfill rules sebelum implementasi |
| R-03 | False positive: record dianggap related hanya karena nilai lemah | Medium | High | HIGH | Batasi ke high-confidence identifiers dulu (AWB, order_id, tracking_number) |
| R-04 | False negative: record terkait tidak muncul karena normalisasi tidak konsisten | High | Medium | HIGH | Definisikan exact normalization standard lintas domain |
| R-05 | Tag explosion jika semua identifier jadi tag manual-like | Medium | Medium | MEDIUM | Bedakan system tags vs display chips vs hidden relation metadata |
| R-06 | Phase 2/3 mengulang spec existing related PRDs dan menciptakan konflik | Medium | High | HIGH | Patch PRD existing, jangan rewrite behavior diam-diam |
| R-07 | Collections di conversation belum siap → source matching tidak lengkap | Medium | Medium | MEDIUM | Phase 1 support single fields dulu; collections jadi conditional enhancement |
| R-08 | Agent melihat record terkait yang tidak bisa dia buka | Low | Critical | HIGH | Result visibility dan actionable navigation harus tetap RBAC-safe |

### 7.2 Worst-Case Scenarios

1. **Mismatch engine:** Search bilang related, tetapi Ticket/Conversation tidak menunjukkan relation yang sama.
2. **Tag drift:** Tag tetap ada meski AWB sudah berubah atau field dihapus.
3. **Spec fragmentation:** Search roadmap, Related Tickets PRD, dan Related Conversations PRD berkembang ke tiga model bisnis yang berbeda.

---

## 8. Test Strategy

### 8.1 Functional Scope

- Search by shared attribute (`AWB-1234`, `ORDER-88`, tracking number)
- Suggestion results muncul lintas Ticket dan Conversation
- `Matched by` dan `Matched value` akurat
- Exact normalized match (dash/space/case variations)
- No cross-tenant leakage
- No out-of-scope role leakage
- Ticket/Conversation tanpa match tidak muncul sebagai related suggestion

### 8.2 Regression Scope

- Existing Ticket search relevance
- Existing Conversation search behavior
- Existing tag rendering in Ticket and Conversation
- Existing Related Tickets PRD assumptions
- Existing Related Conversations PRD assumptions
- Existing Custom Attributes searchability

### 8.3 Integration Scope

- Search ↔ shared attribute registry
- Search ↔ ticket custom fields
- Search ↔ conversation custom attributes
- Future shared matcher ↔ ticket tagging
- Future shared matcher ↔ conversation tagging

### 8.4 UAT / Business Validation

- Agent menerima customer baru dengan AWB yang sama seperti case lama → system menyarankan ticket/conversation terkait.
- Agent dapat memahami kenapa suggestion muncul tanpa membuka semuanya.
- Supervisor dapat melihat grouping/related behavior konsisten di fase lanjutan.

### 8.5 Automation Candidates

- Search exact normalized attribute match
- Multi-result grouping suggestions lintas domain
- RBAC-scoped suggestion list
- Attribute change → tag recalculation (Phase 2/3)
- Historical backfill job correctness (jika dipakai)

---

## 9. Production Safety

- **Rollback Strategy:**
  - Phase 1: disable shared-attribute suggestion popup via feature flag.
  - Phase 2/3: disable auto-tag generation independently per domain.
- **Feature Toggle Requirement:**
  - `SHARED_ATTRIBUTE_DISCOVERY_ENABLED`
  - `TICKET_AUTO_ATTRIBUTE_TAGGING_ENABLED`
  - `CONVERSATION_AUTO_ATTRIBUTE_TAGGING_ENABLED`
- **Backward Compatibility Notes:**
  - Existing manual tags harus tetap aman.
  - Related Ticket / Related Conversation flows existing tidak boleh broken jika auto-tag belum aktif.
- **Staged Rollout Recommendation:**
  - Phase 1 search-only canary terlebih dahulu.
  - Phase 2 ticket tagging setelah accuracy cukup.
  - Phase 3 conversation tagging terakhir, karena overlap lebih tinggi dengan list/room/detail behavior.
- **Monitoring / Alerting Needs:**
  - suggestion shown rate
  - suggestion click/open rate
  - false positive feedback rate
  - false negative escalation rate
  - system-tag generated/removed counts
- **Logging / Audit Gaps:**
  - log matched attribute key
  - log matched value hash / masked value
  - log rule version / normalization version
  - log tag add/remove source = `system`

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Shared attribute list dikonfigurasi workspace-level atau global fixed list? | Menentukan governance dan flexibility | Yes |
| OQ-02 | Auto-tag bersifat persisted atau derived-on-read? | Menentukan data model, audit, cleanup | Yes |
| OQ-03 | Collections di Conversation wajib masuk Phase 1 atau optional? | Menentukan completeness vs delivery speed | Yes |
| OQ-04 | Manual tags dan system tags dipisah atau disatukan? | Menentukan UX, filtering, analytics | Yes |
| OQ-05 | Apakah generic message-body search masih ingin dipertahankan di PRD ini? | Jika ya, scope naik drastis dan objective bercampur | Yes |
| OQ-06 | Siapa yang menjadi primary handling anchor jika 1 AWB muncul di banyak Ticket + Conversation? | Menentukan future navigation model | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

Arah baru ini **lebih strategic** daripada generic global search karena langsung menyelesaikan duplicate handling dan business-context fragmentation. Namun, ini bukan lagi feature search biasa — ini adalah **cross-domain relationship discovery program**.

Karena itu, feature tidak boleh dikerjakan sebagai satu PRD search generik dengan tambahan tagging di belakangnya. Ia harus dibangun sebagai:
1. **Phase 1 discovery surface**
2. **Phase 2 ticket actionability**
3. **Phase 3 conversation actionability**

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `SPLIT_FEATURE` |
| Owner for Follow-up | PM / FE / BE / QA / Cross-team |
| Required Revisions | Tambahkan addendum khusus Actionable Search. Pisahkan: (1) per-item navigation, (2) per-domain bulk selection, (3) system relation tags/labels, (4) tag filter UX improvements. |
| Suggested Delivery Strategy | **Split 3 paket**: A. Actionable Search Navigation, B. System Relation Tags / Labels, C. Tag Filter UX Improvement |
| Earliest Safe Next Step | Tulis addendum PRD untuk **Actionable Search Navigation only** terlebih dahulu; jangan commit auto-tag dan cross-domain bulk action di revisi yang sama |

---

## 12. Traceability Matrix

| Req / Direction | Finding | Impact Area | Test Case | Status |
|-----------------|---------|-------------|-----------|--------|
| Phase 1 search suggestions | Valid as discovery surface | Search, UX, API | TC-SAD-001 | Pending |
| Shared attribute matching | Must be one reusable logic | Search, Ticket, Conversation | TC-SAD-002 | Pending |
| Ticket auto-tagging | Needs lifecycle definition | Ticket, Data, Audit | TC-SAD-003 | Pending |
| Conversation auto-tagging | Needs lifecycle definition | Conversation, Data, Audit | TC-SAD-004 | Pending |
| Existing related PRD reuse | Must patch, not duplicate | Product consistency | TC-SAD-005 | Pending |
| Collections dependency | Still unclear from current state | Conversation custom attributes | TC-SAD-006 | Pending |
| Per-item open to room+detail | Safe to proceed | Search, Navigation, Detail surface | TC-SAD-007 | Pending |
| Bulk selection model | Must be per-domain first | Search, RBAC, Bulk UX | TC-SAD-008 | Pending |
| System relation tags/labels | Safer than global manual tag reuse | Tag Management, Auto Tag, Data Model | TC-SAD-009 | Pending |
| Tag filter UX split | Manual vs system tag separation required | Filter UX, Search, Ticket, Conversation | TC-SAD-010 | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-15 | Initial generic Global Search assessment created | QA Analysis |
| 2026-06-15 | Reframed to Shared Attribute Discovery & Related Record Suggestions roadmap | QA Analysis |
| 2026-06-15 | Added actionable search expansion analysis: per-item open, per-domain bulk select, system relation tags, and tag filter UX recommendations | QA Analysis |
