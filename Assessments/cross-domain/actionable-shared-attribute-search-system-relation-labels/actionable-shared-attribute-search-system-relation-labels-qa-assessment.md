# Assessment Report: Actionable Shared Attribute Search & System Relation Labels

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis  
> **Owner:** Analyst  
> **Source PRD / Source Input:** `PRD/Conversationv2/PRD - Actionable Shared Attribute Search and System Relation Labels.md`  
> **Assessment Artifact Path:** `Assessments/cross-domain/actionable-shared-attribute-search-system-relation-labels/actionable-shared-attribute-search-system-relation-labels-qa-assessment.md`  
> **Version:** `v1.0`  
> **Previous Version:** `none`  
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`  
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `Assessments/reference/conversation-prd-cross-analysis.md`  
> **Tanggal Analisa:** 2026-06-19  
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Initial assessment untuk PRD dedicated yang memisahkan **actionable shared-attribute search** dari PRD discovery-only sebelumnya.
- PRD ini sudah menutup blocker utama dari assessment `Assessments/global-search/global-search/global-search-qa-assessment.md` v2.3, yaitu kebutuhan memisahkan mutation-oriented scope dari PRD discovery Phase 1.
- Namun, risiko sekarang bergeser dari **scope framing** ke **execution contract**: storage model, removal/correction policy, batch outcome policy, filter surface scope, dan source-of-truth shared attribute registry.
- Keputusan final bukan lagi `SPLIT_FEATURE`, tetapi belum aman menjadi `PROCEED` penuh. Rekomendasi saat ini: `PROCEED_WITH_CAUTION` setelah pre-dev locks diselesaikan.

---

## 1. Overview

**Feature / Issue:**
Actionable Shared Attribute Search & System Relation Labels

**Objective:**
Mengubah shared-attribute discovery menjadi surface yang bisa langsung dipakai untuk action aman per domain: buka record terkait, pilih record terkait per domain, lalu menerapkan **system relation labels** berbasis identifier bisnis seperti AWB, Order ID, atau Tracking Number tanpa mencemari manual tag taxonomy.

**Business Context:**
- PRD pendahulu `PRD - Global Search (Conversation + Ticket).md` v2.1 memosisikan search sebagai **discovery-only** surface.
- Assessment pendahulu `Assessments/global-search/global-search/global-search-qa-assessment.md` v2.3 menyimpulkan bahwa actionable mutation, system-generated tags, dan filter governance terlalu lebar jika dipaksa masuk ke paket discovery Phase 1.
- PRD baru ini sudah mengambil langkah yang benar dengan membuat **dokumen terpisah** untuk actionable search + relation labels.
- Dari evidence FE/BE yang disampling:
  - manual tag CRUD memang sudah ada (`apps/company-service/src/app/schemas/tag.schema.ts`, `apps/api-gateway/src/app/company/tag.controller.ts`, `apps/omnichannel/services/tag/tag.service.ts`, `apps/omnichannel/components/pages/settings/ManageTagSettingPage.tsx`)
  - attach/remove tag existing di Conversation dan Ticket masih berbasis **manual tag id** (`useConversationTagActions.ts`, `useTicketTagActions.ts`, `AddTagTicketDto`)
  - tidak ditemukan evidence langsung untuk **system relation label model**, endpoint `search/relation-labels/apply`, atau engine `Auto Tagging` yang sudah aktif pada sampel FE/BE yang diperiksa
- Artinya PRD ini bukan extension ringan atas flow yang sudah ada; ini adalah **new cross-domain mutation layer** yang berdiri di atas discovery engine dan berdampingan dengan manual tag system.

**Scope In:**
- Per-item open dari search result ke Conversation Room + Detail, atau Ticket Detail.
- Per-domain checkbox selection dan bulk action bar terpisah untuk `Percakapan` dan `Tiket`.
- Bulk apply **system relation labels** berbasis current shared attribute context.
- Readable relation label naming (`AWB • JNE123456789`) dan machine-safe key (`rel.awb.jne123456789`).
- Quick filter / relation filter support yang tetap RBAC-safe.
- Relation notes ke Global Search, Related Tickets, Related Conversations, Auto Tag, dan Tag Management.

**Scope Out:**
- Mixed-domain bulk mutation dalam satu action bucket.
- Merge, regroup, unlink, atau relation graph editing.
- Reuse langsung lifecycle Auto Tag rule engine.
- Reuse langsung manual Tag Management CRUD sebagai owner system relation labels.
- AI semantic matching, fuzzy scoring, atau auto-merge.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Arah PRD sudah benar dan materially lebih siap dibanding versi actionable scope yang masih menempel pada Global Search. Namun development baru aman dimulai jika 5 kontrak inti dikunci lebih dulu: source-of-truth attribute registry + normalizer, persistence model relation label, remove/correction path, partial-success batch policy, dan quick-filter surface scope. Tanpa itu, feature berisiko drift antara search engine, mutation engine, dan manual tag system.

### 2.2 Required Actions Before Development

- [ ] Lock **shared attribute registry + normalization contract** yang dipakai bersama oleh discovery engine dan bulk apply engine.
- [ ] Lock **system relation label persistence model**: embedded per record vs dedicated association store, termasuk unique key dan provenance fields.
- [ ] Lock **manual correction / removal path** untuk relation label yang salah apply atau sudah stale.
- [ ] Lock **batch outcome policy**: record inaccessible harus `skip` atau `block`, dan bagaimana partial success dirender + diaudit.
- [ ] Lock **quick-filter scope v1**: hanya popup search, atau juga Conversation List / Ticket List / detail surfaces.
- [ ] Refine **API response contract** agar mengembalikan success/skipped/failed records secara eksplisit per domain.
- [ ] Jalankan rollout di bawah **feature flag** dengan audit + latency monitoring khusus karena feature ini menambah mutation baru lintas dua domain.

### 2.3 Key Blocking Reasons / Conditions

- Current PRD sudah memisahkan scope dari discovery-only search, tetapi belum mengunci **bagaimana relation label hidup setelah dibuat**.
- Existing tag flows masih berbasis **manual tag id**; relation label model baru belum punya kontrak attach/remove yang setara.
- PRD masih menyisakan cabang keputusan `skip atau block` untuk inaccessible records. Ini tidak boleh dibiarkan terbuka saat implementasi.
- Quick filter masih didefinisikan terlalu umum. Jika surface v1 tidak dibatasi, blast radius FE akan melebar ke search, conversation list, ticket list, dan detail surface sekaligus.
- Jika relation label dapat dibuat tetapi tidak punya correction/removal path, satu bulk action yang salah bisa meninggalkan jejak data yang sulit dibersihkan.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** Search, Conversation, Ticket, API Gateway, Data Model, RBAC, Audit/Observability, Filter UX, Tag Governance

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Shared-attribute discovery boleh naik level menjadi actionable flow, tetapi bulk execution tetap harus dipisah per domain. | PRD FR-005–FR-015, prior assessment v2.3 |
| BR-02 | System relation labels tidak boleh diperlakukan sebagai manual tags biasa. | PRD FR-016–FR-022, Relation Notes 17.4–17.5 |
| BR-03 | Naming user-facing harus readable, tetapi internal key harus deterministic dan machine-safe. | PRD FR-019–FR-020 |
| BR-04 | Dedupe harus bekerja per target record + relation key. | PRD FR-021, NFR Reliability |
| BR-05 | Mutation harus RBAC-safe per selected record, bukan hanya aman pada level result visibility. | PRD FR-013–FR-015, Permission Matrix |
| BR-06 | Reuse relation context melalui quick filter boleh masuk, tetapi tidak boleh merusak manual tag filter governance. | PRD FR-023–FR-025 |
| BR-07 | Adjacent features (Related Tickets, Related Conversations, Auto Tag, Tag Management) tetap boundary terpisah dan tidak boleh diam-diam diubah di PRD ini. | Relation Notes Section 17 |
| BR-08 | Discovery engine dan apply engine harus memakai normalizer yang identik agar label yang dibuat konsisten dengan result reason yang ditampilkan. | PRD Dependencies & Risks, prior search assessment |

### 3.2 Acceptance Criteria Assessment

**Yang sudah kuat di PRD:**
- Scope boundary jelas: tidak ada mixed-domain action bucket, tidak mengubah Auto Tag/Tag Management secara langsung.
- Relation notes sudah rapi dan mengikuti pola yang benar.
- Naming system relation labels sudah cukup jelas untuk FE dan audit.
- UX open action untuk Conversation/Ticket sudah konkret dan selaras dengan objective.
- Pembedaan `display label` vs `internal key` sudah membantu dedupe dan observability.

**Yang masih lemah / belum locked:**
- `FR-014` dan `EH-001` masih menyisakan dua mode keputusan (`skip` atau `block`).
- `FR-016` menyatakan relation label harus disimpan terpisah dari manual tag registry behavior, tetapi model persistence aktual belum dikunci.
- `FR-022` menyebut dedicated relation-label area, tetapi belum menunjuk exact UI surfaces dan ownership-nya.
- `FR-023`–`FR-025` masih terlalu luas untuk v1 karena `current result/list surface` belum dibatasi.
- Data lifecycle belum menjelaskan correction/removal path untuk stale labels.

### 3.3 Assumptions

- Shared-attribute discovery engine dari PRD pendahulu akan tersedia lebih dulu atau bersamaan.
- Approved shared-attribute keys punya satu registry/contract bersama.
- Conversation dan Ticket masing-masing bisa menerima relation-label mutation tanpa harus mem-bypass visibility scope existing.
- System relation labels akan punya model data terpisah dari manual tag registry, meskipun UI-nya mungkin berbentuk chip mirip tag.

### 3.4 Clarifications Needed

- Apakah relation labels **removable manually** oleh user berizin, atau immutable setelah dibuat?
- Apakah v1 quick filter hanya berlaku di **search popup**, atau juga di list/detail domain?
- Apakah batch policy final adalah **best effort with partial success** atau **all-or-nothing per domain batch**?
- Apakah attribute registry diwarisi dari shared discovery/search config, atau ada daftar approved keys baru khusus feature ini?
- Jika satu record punya beberapa matched identifiers pada pencarian yang sama, label mana yang dipakai untuk apply ketika user menjalankan bulk action?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- Search shared-attribute yang terdokumentasi sebelumnya masih discovery-oriented.
- Tag Management existing adalah registry manual berbasis `tagId`, lalu Conversation/Ticket attach/remove tag berdasarkan `tagId` tersebut.
- Sampel schema tag existing hanya menunjukkan metadata registry manual (`name`, `clientCount`, `ticketCount`, audit flags), belum model khusus provenance relation labels.
- Related Tickets dan Related Conversations masih tercatat undeveloped di memory workspace.
- Tidak ada evidence langsung untuk endpoint relation-label bulk apply atau system relation label storage model pada sampel FE/BE yang diperiksa.

```text
CURRENT

Shared attribute search
        |
        v
Grouped results (view only)
        |
        +--> User opens Ticket manually
        |
        +--> User opens Conversation manually
        |
        +--> If user wants persistent marker, current system only knows manual tag flows by tagId
```

### 4.2 Proposed State (To-Be)

- Search result menjadi actionable.
- User dapat:
  - buka Ticket/Conversation langsung
  - pilih banyak result **per domain**
  - apply system relation label dari shared attribute context saat itu
- Relation label tampil terpisah dari manual tag taxonomy.
- Quick filter membantu reuse relation context tanpa menggabungkan manual vs system taxonomy.

```text
PROPOSED

Shared attribute discovery
        |
        v
Actionable result popup
        |
        +--> Open result directly
        |
        +--> Select Conversation results -----> Apply relation label (conversation batch)
        |
        +--> Select Ticket results -----------> Apply relation label (ticket batch)
                                              |
                                              v
                           Dedicated system relation label model + audit + quick filter
```

### 4.3 State Transition / Data Flow Notes

1. User search dengan shared attribute.
2. Discovery engine mengembalikan `matchedBy`, `matchedValue`, dan result grouping per domain.
3. FE membuka record langsung atau menyimpan selection state per domain.
4. Saat bulk apply dijalankan, FE mengirim domain + selected ids + relation attribute context.
5. API Gateway meneruskan ke domain execution path yang sesuai.
6. Domain service memvalidasi access, dedupe, idempotency, lalu menulis relation label dan audit outcome.
7. FE merefresh detail/result chips dan, bila v1 quick filter diaktifkan, menawarkan shortcut filter sesuai scope yang disepakati.

**Gap utama di flow ini:** langkah 6 belum punya persistence + correction contract yang fully locked.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Search bukan lagi discovery-only; ada mutation path baru per domain. | Search popup, Conversation, Ticket, audit, filter UX. | HIGH | Keep execution per domain. Jangan buat mixed-domain service layer di v1. |
| Database | Perlu model persistence baru untuk relation labels atau association records. | Conversation records, Ticket records, atau dedicated relation-label store. | HIGH | Lock data model + unique key + cleanup/correction path sebelum dev. |
| API | Perlu endpoint bulk apply baru dan response partial-success yang eksplisit. | API Gateway, conversation-service, ticket-service, FE action handlers. | HIGH | Kembalikan arrays success/skipped/failed, bukan hanya counts. |
| UI/UX | Result rows, bulk bars, relation chips, quick filter states bertambah. | Search popup, Conversation Detail, Ticket Detail, possibly list filters. | HIGH | Batasi quick filter v1 agar blast radius FE tidak melebar. |
| Security / RBAC | View permission tidak otomatis sama dengan mutation permission. | Agent/Supervisor/Admin mutation rules per record. | HIGH | Validate mutation scope per target record. Audit denied/skipped outcomes. |
| Performance | Bulk apply menambah write amplification sampai 50 records per batch. | Gateway latency, domain write path, detail refresh. | MEDIUM | Cap batch = 50, dedupe in memory, use bulk write + async audit if needed. |
| Integration | Feature bergantung pada discovery engine, normalization, audit, and filter surfaces. | Shared attribute registry, analytics, audit trail, list filters. | HIGH | One shared normalizer. One audit vocabulary. |
| Reporting / Analytics | System relation labels bisa memengaruhi filter reuse metrics dan future reporting. | Product analytics, filter reuse signals, integrity checks. | MEDIUM | Pisahkan telemetry manual tag vs system relation label. |
| Financial / Operational | Bukan area finansial langsung, tetapi salah label bisa menyesatkan operational handling. | Agent workflow, duplicate-case handling. | MEDIUM | Provide correction/removal path dan partial-success transparency. |
| Concurrency | Duplicate clicks / repeated batch apply dapat menulis label sama berkali-kali jika tidak dijaga. | Conversation/Ticket mutation path, audit records. | HIGH | Enforce unique constraint per record + relationLabelKey. Idempotent writes wajib. |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Actionable Search Popup | Shared Attribute Discovery / Global Search | API + UI state | Search -> Discovery | Reuses result composition and match reason. |
| Conversation Relation Label Apply | Conversation mutation path | API + DB write | Search -> Conversation | Existing conversation tag flow is manual-tag-id based; relation label path is new. |
| Ticket Relation Label Apply | Ticket mutation path | API + DB write | Search -> Ticket | Existing ticket tag flow is manual-tag-id based; relation label path is new. |
| System Relation Label Model | Shared attribute registry / normalizer | Logic contract | Search <-> Label engine | Must use same normalized key as discovery. |
| Quick Filter / Relation Filter | Existing filter surfaces | UI + state | Label engine -> Filter surfaces | Must preserve current RBAC/filter boundary. |
| Audit / Observability | Audit logging + product analytics | Event/log | Mutation -> Audit | Needs actor, domain, targetId, relationLabelKey, outcome. |
| Manual Tag Management | Existing tag registry | Boundary dependency | Adjacent only | Constraint, not ownership model. Current registry not designed for unbounded identifier-generated labels. |

### 6.2 Shared Resources / Event Mapping

- **Shared attribute registry / normalization rule** dipakai di discovery dan apply.
- **API Gateway** menjadi fan-out point untuk per-domain execution.
- **Conversation/Ticket detail surfaces** berpotensi jadi tempat render relation chips.
- **Audit trail** harus menerima event `relation_label_applied`, `relation_label_skipped`, `relation_label_failed`, dan jika correction diizinkan nanti, `relation_label_removed`.
- **Filter state stores** berpotensi terdampak jika quick filter masuk ke Conversation List atau Ticket List.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Discovery engine dan apply engine memakai normalizer berbeda sehingga label key tidak sesuai dengan hasil search. | Medium | High | High | Satu shared normalization library + contract tests lintas search/apply. |
| R-02 | User salah bulk apply ke banyak record tetapi system relation label tidak punya remove/correction path. | Medium | High | High | Wajib definisikan correction/removal flow sebelum rollout. |
| R-03 | Inaccessible records sebagian di-skip tetapi UX/audit tidak transparan, memicu kebingungan dan distrust. | Medium | High | High | Kunci batch policy final + response detail per record. |
| R-04 | Implementasi mencoba reuse manual tag registry langsung, lalu registry dipenuhi identifier unik. | Medium | High | High | Keep separate system relation label model. Jangan create manual tags per identifier. |
| R-05 | Repeated clicks / retries menulis duplicate label atau duplicate audit rows. | Medium | High | High | Unique key per target + idempotent write + deduped audit semantics. |
| R-06 | Quick filter v1 terlalu lebar dan memaksa perubahan besar ke list filters lintas modul. | Medium | Medium | Medium | Batasi v1 ke search popup atau satu downstream surface yang dipilih eksplisit. |
| R-07 | Conversation result open + Detail default open berbenturan dengan existing overlay state atau route state. | Low | Medium | Medium | Reuse existing room/detail routing contract dan add focused FE regression. |

### 7.2 Worst-Case Scenarios

- 1 bulk action salah menempelkan relation label ke puluhan record tanpa rollback/correction path.
- Result search menunjukkan `Matched by` tertentu, tetapi label yang dibuat memakai key/value berbeda karena normalizer drift.
- FE menampilkan relation chips seperti manual tags, lalu user menganggap chip itu bisa dikelola dari Tag Management padahal model datanya terpisah.
- Quick filter bocor keluar dari current RBAC scope atau current active list scope.

---

## 8. Test Strategy

### 8.1 Functional Scope

- Open Conversation result -> Room + Detail visible by default.
- Open Ticket result -> Ticket Detail.
- Popup closes on navigation and restores session search state on reopen.
- Per-domain selection counters and bulk bars appear independently.
- Bulk apply relation label succeeds for accessible records only.
- Duplicate apply remains idempotent on same target + relationLabelKey.
- Relation chip naming follows readable display and machine key rules.

### 8.2 Regression Scope

- Conversation detail tag/chip rendering area.
- Ticket detail tag/chip rendering area.
- Existing manual tag add/remove flows must remain unchanged.
- Existing discovery-only search behavior and session-state restore.
- Existing RBAC visibility boundaries in search results and list filters.

### 8.3 Integration Scope

- Search result metadata -> bulk apply payload consistency.
- Gateway -> conversation/ticket service execution path.
- Audit logging per outcome type.
- Idempotency and duplicate request handling.
- Quick filter state propagation to chosen downstream surface.

### 8.4 UAT / Business Validation

- Agent searches AWB lalu membuka result terkait tanpa kehilangan context.
- Agent memilih beberapa Conversation records dan memberi relation label yang sama secara aman.
- Agent memilih beberapa Ticket records dan mendapat hasil parsial yang transparan saat sebagian gagal/ter-skip.
- Supervisor memahami perbedaan manual tag vs relation label dari UI tanpa harus membuka Settings Tag Management.

### 8.5 Automation Candidates

- Open result navigation flow per domain.
- Selection-state separation between `Percakapan` and `Tiket`.
- Idempotent apply on repeated action.
- Partial-success rendering with skipped/inaccessible targets.
- Quick filter from relation chip on chosen v1 surface.

---

## 9. Production Safety

- **Rollback Strategy:** Disable feature flag for actionable bulk apply and quick filter; keep discovery/open-only path alive. If labels already written, cleanup path or compensating script must be prepared before rollout.
- **Feature Toggle Requirement:** Mandatory. Minimal split flags: `actionable_search_open`, `relation_label_bulk_apply`, `relation_label_quick_filter`.
- **Backward Compatibility Notes:** Existing manual tag CRUD and attach/remove flows must remain untouched.
- **Staged Rollout Recommendation:** Internal workspace / limited tenant rollout first, then broader rollout after audit and latency review.
- **Monitoring / Alerting Needs:** p95 apply latency, partial-failure rate, duplicate-attempt rate, skipped-record rate, apply volume by attribute key.
- **Logging / Audit Gaps:** Need actor, domain, target ids, relationLabelKey, matched attribute source, skipped reason, failure reason, and request trace id.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Di mana system relation labels disimpan: embedded di record, collection terpisah, atau hybrid association model? | Menentukan schema, indexing, dedupe, cleanup, dan query strategy. | Yes |
| OQ-02 | Apakah relation labels bisa dihapus/dikoreksi manual? Jika ya, oleh role siapa dan dari surface mana? | Menentukan recovery path saat user salah bulk apply atau data source berubah. | Yes |
| OQ-03 | Final batch policy untuk inaccessible records: `skip` atau `block`? | Menentukan UX, audit, API contract, dan test expectation. | Yes |
| OQ-04 | Shared attribute registry final berasal dari mana? | Menentukan apakah search dan apply betul-betul memakai key set yang sama. | Yes |
| OQ-05 | Quick filter v1 berlaku di surface mana? | Menentukan blast radius FE dan kapan feature dianggap selesai. | Yes |
| OQ-06 | Jika satu result matched by beberapa key tetapi user apply dari satu search context, key mana yang dipakai untuk relation label final? | Menentukan determinism label creation. | Yes |
| OQ-07 | Apakah relation labels akan ikut tampil di list cards, hanya di detail, atau keduanya? | Menentukan scope UI dan performance expectations. | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- PRD ini **sudah memperbaiki framing** dibanding actionable scope yang sebelumnya masih menempel pada PRD Global Search.
- Relation notes sudah kuat dan membantu menjaga boundary dengan Related Tickets, Related Conversations, Auto Tag, dan Tag Management.
- Risiko utama bukan lagi “scope terlalu generic”, melainkan **kontrak teknis dan operasional yang belum dikunci**.
- Karena current manual tag system terbukti masih berbasis registry `tagId`, relation label model baru tidak boleh diasumsikan otomatis compatible dengan existing manual tag flows.
- Dengan pre-dev locks yang tepat, feature ini layak lanjut. Tanpa pre-dev locks itu, implementasi sangat mudah drift antara FE state, gateway contract, domain writes, dan audit semantics.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / Analyst / FE / BE / Cross-team |
| Required Revisions | Lock registry + normalizer, persistence model, correction/removal path, batch policy, quick-filter scope, response contract |
| Suggested Delivery Strategy | Deliver in 2 internal build steps within the same PRD lane: (1) direct-open + per-domain selection shell, (2) relation-label apply + controlled quick filter |
| Earliest Safe Next Step | PRD revision with explicit pre-dev locks, then reviewer early review |

---

## 12. Traceability Matrix

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-001–FR-004 | Result open + popup close + session restore | Clear and aligned with discovery objective. | UI / FE Routing | Pending | Ready with caution |
| FR-005–FR-009 | Per-domain selection model | Good boundary. Prevents mixed-domain ambiguity. | UI / State / RBAC | Pending | Ready |
| FR-013–FR-015 | Bulk safety and idempotency | Needs final skipped-vs-blocked policy and per-record response contract. | API / RBAC / Audit | Pending | Needs revision |
| FR-016–FR-022 | System relation label model | Strong direction, but persistence and removal/correction model still missing. | Data Model / UI / Audit | Pending | Needs revision |
| FR-023–FR-025 | Quick filter / reuse support | Valid but too wide for v1 unless target surfaces are locked. | FE / Filter UX / RBAC | Pending | Needs revision |
| FR-026–FR-029 | Explicit non-changes | Good and necessary boundary protection. | Scope Governance | Pending | Ready |
| EH-001 / FR-014 | Permission handling in batch | Open branch (`skip` or `block`) must be resolved before build. | API / UX / Audit | Pending | Blocking clarification |
| NFR Reliability / Observability | Idempotent apply + audit counts | Achievable, but requires explicit unique key + detailed audit fields. | Database / Observability | Pending | Needs revision |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-19 | Initial assessment created | Hermes Analyst |
