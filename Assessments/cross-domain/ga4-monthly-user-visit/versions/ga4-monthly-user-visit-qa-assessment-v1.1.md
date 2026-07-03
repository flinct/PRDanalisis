# Assessment Report: GA4 Analytics Section for Monthly User Visit in SatuInbox

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `User request in chat: Google Analytics dipakai untuk menambahkan section baru di analytics SatuInbox`
> **Assessment Artifact Path:** `Assessments/cross-domain/ga4-monthly-user-visit/ga4-monthly-user-visit-qa-assessment.md`
> **Version:** `v1.1`
> **Previous Version:** `Assessments/cross-domain/ga4-monthly-user-visit/versions/ga4-monthly-user-visit-qa-assessment-v1.0.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`
> **Tanggal Analisa:** 2026-06-19
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Scope berubah dari **sekadar pasang GA4 tracking** menjadi **menambah section baru di halaman Analytics SatuInbox**.
- Dampak naik dari FE-only tracking prep menjadi **FE + API Gateway + analytics-service + Google Analytics Data API integration**.
- Keputusan tetap `PROCEED_WITH_CAUTION`, tetapi kompleksitas dan risiko naik karena sekarang Google Analytics bukan cuma data collector, melainkan juga **data source untuk internal analytics section**.

---

## 1. Overview

**Feature / Issue:**
Menambahkan section baru di halaman Analytics SatuInbox untuk menampilkan metrik bulanan dari Google Analytics 4, dengan fokus awal pada “monthly user visit / MUV”.

**Objective:**
Menentukan apa saja yang harus disiapkan agar section baru ini bisa tampil di analytics SatuInbox secara benar, aman, dan konsisten dengan pola analytics internal yang sudah ada.

**Business Context:**
Halaman analytics SatuInbox saat ini sudah memiliki section internal berbasis data pre-aggregated milik system sendiri. Dari hasil inspeksi FE, section yang ada sekarang adalah:
- `conversations`
- `ticket`
- `responsiveness`
- `member-performance`
- `broadcast`
- `offline-report`

Jika ingin menambah section baru berbasis GA4, maka implementasi **tidak cukup** dengan menempel snippet `gtag.js` di frontend. Snippet hanya mengirim data ke GA4. Agar data itu muncul sebagai section baru di analytics SatuInbox, harus ada **mekanisme pembacaan data GA4 kembali ke produk** melalui backend/API internal.

**Scope In:**
- Penambahan section baru pada analytics SatuInbox
- Pengumpulan data via GA4 tag/snippet
- Pengambilan data report dari GA4 ke SatuInbox
- Definisi metric untuk monthly visit / monthly users
- Pengamanan privacy / anti-PII
- Penentuan arsitektur FE-BE untuk section baru

**Scope Out:**
- Implementasi code final
- Dashboard Looker Studio / BigQuery penuh
- Marketing attribution / campaign attribution
- Penggantian analytics-service internal existing
- Reporting komersial/billing tenant

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Feature boleh dilanjutkan, tetapi jalur implementasinya harus diposisikan sebagai **analytics section integration**, bukan sekadar FE tracking. Google tag saja tidak cukup. Tim harus menyiapkan source-of-truth metric, jalur pengambilan data GA4 ke backend SatuInbox, serta guardrail tenant/privacy sebelum development.

### 2.2 Required Actions Before Development

- [ ] Putuskan arti “MUV”: **Sessions**, **Total Users**, atau **Active Users**.
- [ ] Putuskan apakah section baru ini menampilkan **customer/public traffic**, **dashboard agent usage**, atau keduanya.
- [ ] Tentukan nama section final, misalnya `Visitor Analytics`, `Traffic Analytics`, atau `Website Analytics`.
- [ ] Tentukan source surface yang ditrack: `apps/widget`, `apps/omnichannel`, domain public lain, atau kombinasi.
- [ ] Tentukan arsitektur baca data: **analytics-service → GA4 Data API** sebagai jalur rekomendasi.
- [ ] Tentukan credential strategy untuk read access GA4: **service account / OAuth app-to-app**, bukan panggilan langsung dari browser.
- [ ] Putuskan apakah property/stream GA4 bersifat global atau per-tenant/per-organization.
- [ ] Tetapkan policy no-PII: email, phone, fullName, contact name, message body, token tidak boleh masuk GA.
- [ ] Tentukan kebutuhan consent mode / cookie banner untuk domain yang ditrack.

### 2.3 Key Blocking Reasons / Conditions

- “MUV” masih ambigu secara metric.
- Snippet GA4 hanya menyelesaikan **write path** ke Google, belum menyelesaikan **read path** ke analytics SatuInbox.
- Analytics architecture existing di SatuInbox berbasis endpoint internal `/api/analytics/*`, sehingga section baru harus mengikuti pattern itu agar UX dan permission tetap konsisten.
- Tenant scoping SatuInbox bersifat mandatory di backend; ini bisa bentrok jika GA property ternyata global dan tidak punya pemisahan tenant yang jelas.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** UI, Backend, API, Reporting, Security/RBAC, Integration, Operational

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Section baru harus hidup di analytics SatuInbox, bukan sekadar redirect ke dashboard GA eksternal. | User clarification |
| BR-02 | Metric utama yang disebut “MUV” harus dipetakan ke definisi GA4 yang eksplisit. | User clarification + GA4 metric ambiguity |
| BR-03 | Data untuk section baru harus dapat diambil melalui API internal SatuInbox dengan pola yang konsisten dengan analytics existing. | FE/BE analytics architecture |
| BR-04 | Browser tidak boleh memanggil GA report API langsung dengan credential sensitif. | Security / architecture rule |
| BR-05 | Jika analytics ditampilkan per tenant/per organization, harus ada strategi pemetaan tenant ke GA property/stream atau strategi filter yang setara. | Tenant-scoped BE rule |
| BR-06 | Tidak boleh ada PII yang dikirim ke GA4. | Privacy rule |
| BR-07 | Section baru sebaiknya punya metadata freshness (`last updated`) seperti section analytics lain agar UX konsisten. | Existing analytics metadata pattern |

### 3.2 Acceptance Criteria

- Section baru muncul di nav analytics SatuInbox.
- Section baru memiliki minimal 1 endpoint internal yang mengembalikan data GA4 yang telah disanitasi.
- FE tidak menyimpan credential GA read access.
- Metric utama memiliki definisi eksplisit dan label yang tidak ambigu.
- Data dapat dibedakan minimal berdasarkan surface yang ditrack.
- Jika pattern UX existing memakai freshness indicator, section baru juga punya `lastUpdatedAt`.

### 3.3 Assumptions

- Tujuan user adalah membuat **internal analytics view** di SatuInbox.
- GA4 dipakai sebagai data source web/product traffic tertentu, bukan satu-satunya analytics platform SatuInbox.
- Existing analytics section tetap dipertahankan dan section baru adalah tambahan, bukan pengganti.

### 3.4 Clarifications Needed

- “Monthly user visit” di sini maksudnya **kunjungan bulanan** atau **user unik bulanan**?
- Mau dihitung untuk **widget/customer traffic**, **dashboard agent usage**, atau dua-duanya?
- Section baru cukup summary bulanan, atau perlu chart trend, source breakdown, device/platform, dan comparison previous period?
- Kebutuhannya global company-level atau per organization/per tenant?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

#### FE Analytics Page
- `ManageStatisticPage.tsx` saat ini hanya mengenal section:
  - `conversations`
  - `broadcast`
  - `ticket`
  - `responsiveness`
  - `member-performance`
  - `offline-report`
- `StatisticNav.tsx` juga hanya menyediakan menu untuk 6 section tersebut.
- Artinya, section baru harus menyentuh:
  - daftar `VALID_SECTIONS`
  - render switch section
  - side navigation menu
  - translation keys terkait label section

#### FE Analytics Data Pattern
- FE analytics memakai pattern service internal melalui `useStatisticApi.ts`.
- Existing endpoint pattern berada di bawah:
  - `/analytics/conversation/*`
  - `/analytics/ticket/*`
  - `/analytics/responsiveness/*`
  - `/analytics/member/*`
  - `/analytics/broadcast/*`
  - `/analytics/last-updated`
- FE juga memiliki `useFetchAnalyticsLastUpdated(type)` dengan type terbatas pada:
  - `conversation`
  - `ticket`
  - `responsiveness`
  - `member`
  - `broadcast`

#### BE Analytics Architecture
- Ada `analytics-service` khusus dengan DB sendiri `satuinbox_analytics`.
- `analytics.proto` saat ini mendefinisikan service untuk:
  - Conversation analytics
  - Ticket analytics
  - Member analytics
  - Responsiveness analytics
  - Broadcast analytics
  - Analytics metadata
  - Export report job
- `AnalyticsMetadataService` di BE hanya mengenal type:
  - `broadcast`
  - `conversation`
  - `member`
  - `responsiveness`
  - `ticket`

#### GA Integration Status
- Tidak ditemukan implementasi `gtag`, `googletagmanager`, `google analytics`, `GA4`, atau client library Google Analytics di FE/BE repo.
- Artinya belum ada:
  - write path ke GA4
  - read path dari GA4
  - credential/config untuk GA4 Data API

### 4.2 Proposed State (To-Be)

#### FE
- Tambah section baru pada analytics page, misalnya `ga4-traffic` atau `visitor-analytics`.
- Tambah komponen section baru, misalnya:
  - `components/molecules/statistic/visitor-analytics/VisitorAnalyticsSection.tsx`
- Tambah service hook baru di FE, misalnya:
  - `services/statistic/visitorAnalytics.service.ts`
- Tambah nav entry dan translation key.
- Jika dibutuhkan, tambahkan `lastUpdated` type baru untuk section ini.

#### BE
- Tambah controller/API gateway untuk route baru, misalnya:
  - `/analytics/visitor/*`
  - atau `/analytics/ga4/*`
- Tambah gRPC contract baru di `analytics.proto` atau extend service yang ada.
- Tambah logic di `analytics-service` untuk memanggil **Google Analytics Data API**.
- Tambah config credential/property mapping.
- Opsional: tambahkan cache atau snapshot storage agar request UI tidak selalu hit GA API langsung.

#### GA4 Collection Layer
- Pasang Google tag di surface yang dipilih:
  - `apps/omnichannel/app/[locale]/layout.tsx`
  - `apps/widget/app/[locale]/layout.tsx`
- Track `page_view` dan event minimum yang dibutuhkan.
- Gunakan env var / centralized config.

### 4.3 State Transition / Data Flow Notes

**Write path:**
`Browser surface` → `GA4 tag/snippet` → `GA4 property/stream`

**Read path untuk analytics section:**
`SatuInbox analytics page` → `FE statistic service` → `API Gateway /analytics/...` → `analytics-service` → `GA4 Data API` → `normalized response` → `FE section cards/charts`

**Optional cached path:**
`GA4 Data API` → `analytics-service cache / snapshot / pre-aggregation` → `internal endpoint` → `FE`

**Key point:**
Section internal analytics membutuhkan **dua jalur**:
1. **collection path** ke GA4
2. **reporting path** dari GA4 kembali ke SatuInbox

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Tambah analytics section baru di FE + service BE baru | `ManageStatisticPage`, `StatisticNav`, `useStatisticApi`, `analytics-service`, `api-gateway` | HIGH | Ikuti pattern analytics existing; jangan bikin bypass khusus di FE |
| Database | Bisa tanpa DB baru untuk fase awal, tetapi mungkin perlu cache/snapshot/metadata | `satuinbox_analytics` atau cache layer | MEDIUM | Fase 1 bisa live-query + cache ringan; fase 2 baru pre-aggregate bila perlu |
| API | Perlu endpoint internal baru untuk section | API Gateway `/analytics/...`, proto contract, analytics-service | HIGH | Gunakan contract konsisten dengan section analytics lain |
| UI/UX | Tambah menu, state section, cards/charts, empty state, loading, freshness | Analytics page FE | MEDIUM | Ikuti pola section existing agar UX seragam |
| Security / RBAC | Credential GA read access dan potensi PII leakage | backend config, FE event mapper | HIGH | Credential di backend only; strict allowlist parameter |
| Performance | Panggilan ke GA API bisa lambat / quota-bound | analytics-service latency, FE loading | MEDIUM | Tambah caching, summary-only query, batasi dimensions/metrics awal |
| Integration | Integrasi dengan GA4 Data API dan property/stream mapping | Google API, env config, tenant model | HIGH | Mulai dari 1 property sederhana dulu; hindari multi-tenant GA logic premature |
| Reporting / Analytics | Risiko salah label metric dan konflik definisi dengan analytics internal | PM report, analytics page semantics | HIGH | Gunakan label eksplisit: Sessions / Users / Active Users |
| Financial / Operational | Ada quota/API operational concern dan support burden | support/devops/product ops | MEDIUM | Pantau quota, timeout, fallback UI |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Visitor analytics section FE | `ManageStatisticPage.tsx`, `StatisticNav.tsx` | UI composition | FE section → Analytics shell | Tambah valid section + nav item + render branch |
| Visitor analytics FE data hook | `useStatisticApi.ts`, types/statistic.ts | FE service pattern | FE section → shared statistics infra | Konsisten dengan query hooks existing |
| Last updated/freshness | `analyticsLastUpdated.service.ts`, `AnalyticsMetadataService` | API + metadata | FE freshness → BE metadata | Jika section baru pakai freshness badge, type baru harus ditambah |
| Internal analytics endpoint | API Gateway analytics controllers | REST → gRPC | FE → Gateway → analytics-service | Section baru sebaiknya punya route sendiri |
| GA report fetching | Google Analytics Data API | External integration | analytics-service → Google | Tidak boleh dari browser langsung |
| Tracking data collection | FE layouts (`apps/omnichannel`, `apps/widget`) | Client integration | Surface → GA4 | Diperlukan agar data tersedia di GA4 |
| Tenant scoping | `companyId`, `organizationId` backend rule | Security / data partition | analytics-service ↔ tenant model | Perlu keputusan apakah metric global atau tenant-scoped |

### 6.2 Shared Resources / Event Mapping

- Shared FE statistics shell: section baru harus kompatibel dengan URL `section=` pattern.
- Shared analytics metadata: jika ada `last updated`, typenya harus ditambah di FE + BE.
- Shared auth/session: raw session fields tidak boleh ikut dikirim ke GA.
- Shared analytics terminology: section baru tidak boleh membingungkan user dengan KPI conversation/ticket existing.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Tim menganggap snippet saja cukup untuk membuat section analytics | High | High | High | Tegaskan arsitektur 2-path: write + read |
| R-02 | FE mencoba call GA report API langsung dari browser | Medium | Critical | Critical | Semua read access lewat backend |
| R-03 | Metric “MUV” salah label | High | High | High | Tampilkan label eksplisit Users / Sessions / Active Users |
| R-04 | Dashboard internal dan widget/public tercampur | Medium | High | High | Pisah property/stream atau tag surface dimension |
| R-05 | GA property global tidak kompatibel dengan tenant scoping SatuInbox | Medium | High | High | Putuskan global-vs-tenant strategy sejak awal |
| R-06 | PII terkirim ke GA4 | Medium | Critical | Critical | Sanitized event mapper + QA payload verification |
| R-07 | GA API quota/latency membuat section lambat | Medium | Medium | Medium | Cache, summary-only query, graceful loading/fallback |
| R-08 | Freshness indicator tidak sinkron dengan real data age | Medium | Medium | Medium | Definisikan source lastUpdated: GA fetch time vs cache refresh time |

### 7.2 Worst-Case Scenarios

- Section baru live tetapi selalu kosong karena data hanya dikirim ke GA tanpa jalur read-back.
- Credential atau access token GA terekspos di FE.
- Product membaca angka Sessions sebagai Unique Users dan mengambil keputusan yang salah.
- Tenant A melihat angka gabungan tenant lain karena property scoping tidak jelas.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Nav analytics menampilkan section baru.
- Query param `section=` dapat membuka section baru dengan benar.
- FE berhasil memanggil endpoint internal baru.
- Endpoint mengembalikan payload valid untuk cards/charts.
- Section menampilkan empty state/loading/error state dengan benar.
- Jika freshness dipakai, `lastUpdatedAt` tampil dan source-nya benar.

### 8.2 Regression Scope
- Section existing (`conversation`, `ticket`, `responsiveness`, `member-performance`, `broadcast`, `offline-report`) tidak rusak.
- `useStatisticApi` existing queries tetap bekerja.
- Side navigation analytics tidak berubah perilakunya.
- Routing statistik existing tidak broken.

### 8.3 Integration Scope
- FE tracking benar-benar mengirim event ke GA4.
- analytics-service bisa membaca report dari GA4 Data API.
- Credential loading/env config bekerja di environment target.
- Timeout/quota/failure dari GA API ditangani dengan fallback yang aman.

### 8.4 UAT / Business Validation
- PM bisa membaca metrik bulanan langsung di SatuInbox tanpa buka GA dashboard terpisah.
- PM paham beda Sessions vs Users vs Active Users.
- PM dapat membedakan dashboard traffic vs widget/public traffic bila dua surface dipakai.
- Jika tenant-scoped, angka yang tampil sesuai tenant yang login.

### 8.5 Automation Candidates
- FE section navigation smoke test.
- API contract test untuk endpoint visitor analytics.
- Integration test untuk mapper response GA4 → payload internal.
- Assertion bahwa field PII tidak pernah dikirim dalam payload tracking atau returned payload.

---

## 9. Production Safety

- **Rollback Strategy:** sembunyikan section baru via feature flag/nav toggle dan matikan endpoint baru tanpa memengaruhi analytics existing.
- **Feature Toggle Requirement:** sangat disarankan, minimal toggle untuk menyalakan section baru secara terpisah dari existing analytics page.
- **Backward Compatibility Notes:** jangan ubah contract existing `/analytics/*`; tambahkan route baru.
- **Staged Rollout Recommendation:** mulai dengan summary-only section, bukan chart kompleks penuh.
- **Monitoring / Alerting Needs:** error rate endpoint baru, latency fetch GA API, quota failure, empty-data anomaly.
- **Logging / Audit Gaps:** perlu logging jelas untuk fetch success/fail dan timestamp refresh bila section memakai cached data.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | “MUV” = Sessions, Total Users, atau Active Users? | Menentukan metric utama section | Yes |
| OQ-02 | Section ini untuk widget/public traffic, dashboard usage, atau dua-duanya? | Menentukan tracking surface dan label bisnis | Yes |
| OQ-03 | Data ditampilkan global atau tenant-scoped? | Menentukan property strategy dan security boundary | Yes |
| OQ-04 | Perlu chart trend, breakdown source/device/channel, atau cukup monthly cards dulu? | Menentukan scope fase 1 | Yes |
| OQ-05 | Property/stream GA4 bersifat tunggal atau per tenant/per brand/domain? | Menentukan mapping config | Yes |
| OQ-06 | Perlu freshness label `last updated` seperti analytics existing? | Menentukan metadata extension FE+BE | No |
| OQ-07 | Consent mode wajib untuk surface yang ditrack? | Menentukan legal/UI scope | Yes |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Karena targetnya sekarang adalah **section baru di SatuInbox analytics**, maka problem utamanya bukan lagi “cara kirim data ke GA”, melainkan **bagaimana SatuInbox membaca dan menyajikan data GA secara internal**.
- Arsitektur paling aman dan paling konsisten dengan codebase saat ini adalah:
  - FE tracking ke GA4
  - BE `analytics-service` membaca GA4 report via server-side integration
  - FE analytics page consume endpoint internal baru
- Menampilkan data GA di internal analytics tanpa backend connector akan menghasilkan design yang rapuh, tidak aman, dan tidak konsisten dengan section analytics existing.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / Analyst / FE / BE |
| Required Revisions | Lock metric definition, choose data source scope, define tenant strategy, define backend connector pattern |
| Suggested Delivery Strategy | Phase split |
| Earliest Safe Next Step | Mini PRD / technical design note untuk analytics section baru |

**Recommended delivery phases:**
1. **Phase 1 — Definition**
   - lock metric: Sessions vs Users vs Active Users
   - lock scope: widget/public vs dashboard
   - lock section name and cards
2. **Phase 2 — Collection Layer**
   - pasang GA4 tag di surface terpilih
   - validasi event baseline
3. **Phase 3 — Read Layer**
   - tambah endpoint internal di analytics-service untuk ambil summary dari GA4 Data API
   - tampilkan summary cards di section baru
4. **Phase 4 — Extension**
   - trend chart, source/device breakdown, comparison previous month, caching/freshness improvements

**Recommended Phase 1 payload minimal untuk section baru:**
- Monthly Sessions
- Monthly Users
- Monthly Active Users
- Monthly Views
- comparison vs previous month
- optional `lastUpdatedAt`

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | Tambah section baru di analytics SatuInbox | FE analytics shell harus ditambah nav + valid section + render branch | UI | Pending | Pending |
| FR-02 | Tampilkan monthly user visit dari GA4 | Snippet saja tidak cukup; perlu backend read path | Integration / API | Pending | Pending |
| FR-03 | Data aman dan tidak expose credential | Read access harus backend-only | Security | Pending | Pending |
| FR-04 | Konsisten dengan analytics page existing | Endpoint dan metadata pattern harus mengikuti existing analytics architecture | API / UX | Pending | Pending |
| FR-05 | Jika tenant-scoped, data tidak bocor lintas tenant | Property/config strategy harus jelas | Security / Operational | Pending | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-19 | Initial assessment created | Hermes |
| 2026-06-19 | Scope revised: from basic GA4 tracking prep to internal analytics section integration | Hermes |
