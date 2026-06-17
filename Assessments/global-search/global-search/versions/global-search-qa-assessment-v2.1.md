# QA Assessment Report: Shared Attribute Discovery & Related Record Suggestions

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Source PRD / Source Input:** `PRD/Conversationv2/PRD - Global Search (Conversation + Ticket).md`
> **Assessment Artifact Path:** `Assessments/global-search/global-search/global-search-qa-assessment.md`
> **Version:** `v2.1`
> **Previous Version:** `Assessments/global-search/global-search/versions/global-search-qa-assessment-v2.0.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/prd-writing-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `Memory/comprehensive-undeveloped-features-analysis.md`
> **Tanggal Analisa:** 2026-06-15
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- **v1.0–v1.2:** fokus pada **generic Global Search** lintas Conversation + Ticket, termasuk message-body search, drawer UX, dan cross-collection search pipeline.
- **v2.0:** feature direframe menjadi **shared-attribute discovery roadmap** berbasis identifier bisnis seperti `AWB`, `Order ID`, `Tracking Number`.
- **v2.1:** UX surface diperjelas: hasil pencarian Phase 1 menggunakan **popup modal centered overlay** sebagai primary surface, bukan drawer.
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

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Arah baru ini valid dan lebih kuat secara bisnis dibanding generic global search, **asal** diposisikan sebagai roadmap bertahap, bukan satu feature monolitik. Phase 1 boleh lanjut sebagai discovery/search suggestions berbasis shared attributes. Phase 2 dan Phase 3 harus diperlakukan sebagai patch lanjutan ke PRD Ticket dan Conversation yang sudah ada, bukan ditumpuk sekaligus di PRD ini.

### 2.2 Required Actions Before Development

- [ ] **Reframe PRD**: ubah Global Search menjadi **Phase 1: Shared Attribute Discovery** dengan objective yang attribute-centric, bukan generic search-centric.
- [ ] **Define source of truth untuk shared attributes**: field mana saja yang boleh jadi match key lintas domain (`awb`, `order_id`, `tracking_number`, dll.).
- [ ] **Putuskan lifecycle auto-tagging**: tag bersifat derived/system-generated atau persisted/manual-editable?
- [ ] **Patch existing domain PRDs** untuk Phase 2 dan 3:
  - `PRD Ticket - Related Tickets and Ticket Merge Suggestion.md`
  - `PRD Ticket - Omnichannel Inbox - Related Conversations Grouping.md`
- [ ] **Konfirmasi status implementasi Collections** pada Conversation Custom Attributes, karena phase ini mengandalkan attribute-level matching dan memory saat ini masih mencatat collections sebagai undeveloped.
- [ ] **Putuskan exact-match normalization** untuk identifier (strip dash, uppercase, whitespace normalization, alias field mapping).

### 2.3 Key Blocking Reasons / Conditions

- **Condition 1:** Jangan campur generic message-body search sebagai objective utama jika target bisnisnya adalah related-record discovery berbasis shared attributes.
- **Condition 2:** Auto-tagging Ticket/Conversation tidak boleh didefinisikan samar — harus jelas source, trigger, update, removal, audit, dan manual override.
- **Condition 3:** Related Tickets dan Related Conversations sudah punya PRD sendiri. PRD ini tidak boleh menduplikasi atau menimpa behavior domain tersebut tanpa patch eksplisit.
- **Condition 4:** Jika shared-attribute registry belum jelas, hasil suggestion akan tidak konsisten antar domain.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** Search, Ticket, Conversation, Custom Attributes, Custom Fields, RBAC, UI/UX, Data Model, Observability

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

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- Search lintas domain baru berada di level konsep generic global search.
- Related Tickets belum developed.
- Related Conversations belum developed.
- Conversation Custom Attribute Collections masih dicatat undeveloped di memory.
- Tidak ada consistent cross-domain shared-attribute discovery surface.
- Tidak ada automatic tagging system untuk shared-attribute grouping.

### 4.2 Proposed State (To-Be)

#### Phase 1 — Shared Attribute Global Search Suggestions
User memasukkan identifier seperti `AWB-1234` → system mencari Ticket + Conversation yang memiliki attribute/value yang sama → hasil tampil sebagai suggestions dengan alasan match.

#### Phase 2 — Automatic Ticket Tagging + Related Ticket Visibility
Saat shared attribute terdeteksi di Ticket → system menghasilkan system-tag/derived-tag → Ticket Module menampilkan grouped/related ticket information berdasarkan tag dan/atau match key tersebut.

#### Phase 3 — Automatic Conversation Tagging + Related Conversation Visibility
Saat shared attribute terdeteksi di Conversation → system menghasilkan system-tag/derived-tag → Conversation Module menampilkan related conversation context dan navigasi terkait.

### 4.3 Recommended Delivery Model

| Phase | Goal | Delivery Shape |
|------|------|----------------|
| Phase 1 | Discovery | Reframe current Global Search PRD menjadi attribute-centric search suggestions |
| Phase 2 | Ticket actionability | Patch `Related Tickets and Ticket Merge Suggestion` + ticket tagging/display behavior |
| Phase 3 | Conversation actionability | Patch `Related Conversations Grouping` + conversation tagging/display behavior |

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
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / FE / BE / QA / Cross-team |
| Required Revisions | Reframe current PRD menjadi attribute-centric Phase 1; pindahkan detail Phase 2/3 ke patch PRD domain masing-masing |
| Suggested Delivery Strategy | Roadmap 3 fase dengan one shared matching engine |
| Earliest Safe Next Step | Rewrite PRD current file menjadi Shared Attribute Discovery Phase 1 + roadmap alignment section |

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

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-15 | Initial generic Global Search assessment created | QA Analysis |
| 2026-06-15 | Reframed to Shared Attribute Discovery & Related Record Suggestions roadmap | QA Analysis |
