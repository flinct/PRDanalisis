# Assessment Report: Visitor Analytics for SatuInbox

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `User request in chat: section baru bernama Visitor Analytics, diatur per company, fokus utama Monthly Visitors, opsional Monthly Active Users`
> **Assessment Artifact Path:** `Assessments/cross-domain/ga4-monthly-user-visit/ga4-monthly-user-visit-qa-assessment.md`
> **Version:** `v1.2`
> **Previous Version:** `Assessments/cross-domain/ga4-monthly-user-visit/versions/ga4-monthly-user-visit-qa-assessment-v1.1.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`
> **Tanggal Analisa:** 2026-06-19
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Nama section dikunci menjadi **Visitor Analytics**.
- Scope tenancy dikunci menjadi **per company**, bukan global campur atau per organization default.
- Fokus metric fase awal dipersempit menjadi **Monthly Visitors** sebagai metric utama.
- **Monthly Active Users** dinaikkan menjadi metric tambahan yang diinginkan jika bisa diambil dari GA4 pada fase yang sama.
- Dengan klarifikasi ini, ambiguity produk berkurang, tetapi kebutuhan integrasi FE + API Gateway + analytics-service + GA4 Data API tetap tinggi.

---

## 1. Overview

**Feature / Issue:**
Menambahkan section baru bernama **Visitor Analytics** pada halaman Analytics SatuInbox untuk menampilkan metrik bulanan berbasis Google Analytics 4, dengan fokus utama pada **Monthly Visitors** dan tambahan **Monthly Active Users** bila tersedia.

**Objective:**
Menyediakan visibility traffic/visitor per company langsung di dalam halaman analytics SatuInbox tanpa user harus membuka dashboard GA4 terpisah.

**Business Context:**
Halaman analytics SatuInbox saat ini sudah memiliki section internal berbasis data pre-aggregated internal system. Dari inspeksi FE, section yang ada sekarang adalah:
- `conversations`
- `ticket`
- `responsiveness`
- `member-performance`
- `broadcast`
- `offline-report`

Karena targetnya adalah section internal baru di halaman analytics, maka implementasi tidak cukup dengan memasang snippet GA4 di FE. Snippet hanya mengirim data ke Google. Agar data tampil di SatuInbox, produk perlu menambahkan jalur pembacaan report dari GA4 ke backend internal.

**Scope In:**
- Penambahan section baru `Visitor Analytics` di analytics page SatuInbox
- Tracking data ke GA4 dari surface yang dipilih
- Pengambilan report dari GA4 ke backend SatuInbox
- Penyajian metric **Monthly Visitors** per company
- Penyajian metric **Monthly Active Users** per company jika memungkinkan pada fase yang sama
- Guardrail privacy / anti-PII
- Company-level configuration / mapping

**Scope Out:**
- Implementasi code final
- Dashboard marketing attribution penuh
- BigQuery / Looker Studio full reporting
- Penggantian analytics-service internal existing
- Billing/commercial analytics

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Feature dapat dilanjutkan dengan arah yang sekarang lebih jelas: section bernama **Visitor Analytics**, scope **per company**, metric utama **Monthly Visitors**, dan metric tambahan **Monthly Active Users**. Namun implementasi tetap harus diposisikan sebagai **analytics section integration**, bukan sekadar FE tracking, karena SatuInbox tetap membutuhkan read path dari GA4 ke internal analytics page.

### 2.2 Required Actions Before Development

- [ ] Kunci definisi **Monthly Visitors** sebagai metric utama. Rekomendasi: map ke **GA4 Users / Total Users**, bukan Sessions.
- [ ] Kunci definisi **Monthly Active Users** sebagai metric tambahan. Rekomendasi: map ke **GA4 Active Users**.
- [ ] Putuskan surface yang ditrack untuk section ini: `apps/widget`, `apps/omnichannel`, domain public lain, atau kombinasi.
- [ ] Putuskan apakah Visitor Analytics hanya menampilkan company-wide summary atau juga comparison/filter tambahan.
- [ ] Tambahkan backend connector dari `analytics-service` ke **GA4 Data API**.
- [ ] Tentukan company-level property/stream mapping strategy.
- [ ] Tetapkan policy no-PII untuk seluruh event yang dikirim ke GA4.
- [ ] Tentukan consent/cookie strategy untuk surface yang ditrack.

### 2.3 Key Blocking Reasons / Conditions

- Jalur **read-back** dari GA4 ke analytics page belum ada.
- Company-level scoping perlu model konfigurasi yang jelas: satu company satu property, satu company satu stream, atau satu property shared dengan discriminator.
- Surface tracking belum dikunci. Tanpa itu, angka Monthly Visitors bisa salah konteks.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** UI, Backend, API, Reporting, Security/RBAC, Integration, Operational

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Section baru harus bernama **Visitor Analytics**. | User clarification |
| BR-02 | Scope section adalah **per company**. | User clarification |
| BR-03 | Metric utama fase awal adalah **Monthly Visitors**. | User clarification |
| BR-04 | **Monthly Active Users** menjadi metric tambahan yang diinginkan bila dapat diambil pada implementasi yang sama. | User clarification |
| BR-05 | Data harus ditampilkan di analytics SatuInbox melalui endpoint internal, bukan browser memanggil GA report API langsung. | Current architecture + security rule |
| BR-06 | Credential untuk baca data GA4 harus disimpan server-side. | Security rule |
| BR-07 | PII tidak boleh dikirim ke GA4. | Privacy rule |
| BR-08 | Visitor Analytics sebaiknya mengikuti pola UX analytics existing, termasuk loading/error/optional freshness indicator. | Existing analytics shell |

### 3.2 Acceptance Criteria

- Nav analytics menampilkan menu **Visitor Analytics**.
- Section Visitor Analytics menampilkan minimal:
  - **Monthly Visitors**
  - **Monthly Active Users** (jika fase awal disetujui)
- Payload data diambil dari endpoint internal SatuInbox.
- Hasil section ter-scope **per company**.
- Tidak ada credential GA yang bocor ke FE.
- Tidak ada field PII pada payload tracking ke GA.

### 3.3 Assumptions

- “Monthly Visitors” diinginkan sebagai **unique visitors/users bulanan**, bukan jumlah session bulanan.
- “Monthly Active Users” diinginkan sebagai secondary metric untuk engagement signal.
- Company adalah boundary bisnis utama untuk section ini.
- Existing analytics section tetap dipertahankan; Visitor Analytics adalah tambahan.

### 3.4 Clarifications Needed

- Surface mana yang mewakili visitor yang ingin dihitung: widget/public only, dashboard only, atau kombinasi?
- Apakah Monthly Visitors perlu ditampilkan dengan comparison previous month?
- Apakah section fase awal cukup berupa summary cards, atau perlu chart trend bulanan juga?
- Apakah satu company bisa punya lebih dari satu tracked domain/property?

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
- Artinya, Visitor Analytics akan membutuhkan perubahan pada:
  - `VALID_SECTIONS`
  - nav menu
  - render switch
  - translation keys

#### FE Analytics Data Pattern
- FE analytics mengikuti pola `useStatisticApi.ts` dengan endpoint internal `/analytics/*`.
- FE freshness hook existing memakai `useFetchAnalyticsLastUpdated(type)`.
- Type analytics metadata saat ini hanya mengenal:
  - `conversation`
  - `ticket`
  - `responsiveness`
  - `member`
  - `broadcast`

#### BE Analytics Architecture
- Tersedia `analytics-service` dedicated dengan DB `satuinbox_analytics`.
- `analytics.proto` saat ini belum punya service/contract khusus Visitor Analytics.
- `AnalyticsMetadataService` juga belum punya type untuk visitor analytics.
- API Gateway sudah memiliki controller untuk analytics existing, tetapi belum ada route khusus visitor analytics.

#### GA Integration Status
- Tidak ditemukan implementasi `gtag`, `GA4`, `googletagmanager`, atau Google Analytics client library pada FE/BE repo.
- Belum ada:
  - write path ke GA4
  - read path dari GA4
  - company-level GA mapping config

### 4.2 Proposed State (To-Be)

#### FE
- Tambah section baru `visitor-analytics` pada analytics page.
- Tambah komponen baru, misalnya:
  - `components/molecules/statistic/visitor-analytics/VisitorAnalyticsSection.tsx`
- Tambah service hook baru, misalnya:
  - `services/statistic/visitorAnalytics.service.ts`
- Tambah type response baru di `types/statistic.ts`.
- Tambah optional freshness indicator jika ingin konsisten dengan section lain.

#### BE
- Tambah route internal baru, misalnya:
  - `/analytics/visitor/summary`
- Tambah gRPC contract baru pada `analytics.proto`, atau extend analytics service yang ada.
- Tambah service baru / method baru pada `analytics-service` untuk memanggil **GA4 Data API**.
- Tambah company-level configuration mapping untuk menghubungkan company dengan GA property/stream.
- Tambah cache / snapshot opsional agar UI tidak selalu live hit Google.

#### GA4 Collection Layer
- Pasang Google tag di surface yang dipilih.
- Track minimal page-level events yang cukup untuk membentuk metric Users/Active Users.
- Gunakan env/config terpusat.

### 4.3 State Transition / Data Flow Notes

**Write path**
`Tracked surface` → `GA4 tag/snippet` → `GA4 property/stream`

**Read path**
`Visitor Analytics section` → `FE statistic service` → `API Gateway /analytics/visitor/*` → `analytics-service` → `GA4 Data API` → `normalized per-company payload` → `FE cards`

**Optional cached path**
`GA4 Data API` → `analytics-service cache/snapshot` → `internal endpoint` → `FE`

**Company scope note**
Karena requirement sudah dikunci **per company**, maka source mapping dan payload response harus berorientasi pada `companyId` sebagai boundary utama. `organizationId` hanya dipakai bila nanti ada breakdown lanjutan, bukan sebagai owner utama metric fase awal.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Tambah FE section + BE endpoint + analytics-service connector | `ManageStatisticPage`, `StatisticNav`, `useStatisticApi`, `analytics-service`, `api-gateway` | HIGH | Ikuti pattern analytics existing |
| Database | Tidak wajib DB baru untuk fase awal, tetapi mungkin perlu cache/metadata | `satuinbox_analytics` / cache layer | MEDIUM | Mulai live-query + cache ringan |
| API | Perlu route dan contract baru untuk Visitor Analytics | Gateway + proto + analytics-service | HIGH | Tambah route baru, jangan rusak `/analytics/*` existing |
| UI/UX | Tambah nav item, cards, empty/error/loading state | Analytics page FE | MEDIUM | Reuse pola section analytics existing |
| Security / RBAC | Credential GA read access dan scoping per company | backend config | HIGH | Backend-only credential, strict company mapping |
| Performance | GA API bisa lambat dan quota-bound | analytics-service latency | MEDIUM | Cache, timeout policy, fallback state |
| Integration | Integrasi dengan GA4 Data API dan company mapping | Google API + tenant model | HIGH | Lock company mapping strategy dari awal |
| Reporting / Analytics | Risiko salah label antara Visitors vs Sessions | PM / analytics semantics | HIGH | Label eksplisit dan glossary metric |
| Financial / Operational | Ada cost/quota/support overhead | ops/support | MEDIUM | Scope awal summary-only |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Visitor Analytics FE section | `ManageStatisticPage.tsx`, `StatisticNav.tsx` | UI composition | FE section → analytics shell | Tambah nav item + render branch |
| Visitor Analytics FE data hook | `useStatisticApi.ts`, `types/statistic.ts` | FE data pattern | FE section → shared statistics infra | Harus konsisten dengan pattern existing |
| Visitor Analytics BE endpoint | API Gateway analytics controllers | REST → gRPC | FE → Gateway → analytics-service | Route baru disarankan |
| Visitor Analytics service logic | `analytics-service` | Internal service | Gateway → analytics-service | Tempat terbaik untuk GA report integration |
| GA report fetch | GA4 Data API | External integration | analytics-service → Google | Bukan browser direct call |
| Company-level source mapping | `companyId` tenant context | Data partition | analytics-service ↔ company scope | Requirement inti dari user |
| Tracking source data | FE layouts / tracked surfaces | Client collection | Surface → GA4 | Perlu agar report punya data |
| Freshness metadata | `AnalyticsMetadataService` | Optional UX dependency | FE freshness → BE metadata | Tambahkan type baru jika dipakai |

### 6.2 Shared Resources / Event Mapping

- Shared FE statistics shell memakai `section=` query pattern; Visitor Analytics harus kompatibel.
- Shared backend tenant context sudah membawa `companyId`; ini cocok untuk requirement per company.
- Shared analytics metadata type belum mengenal visitor analytics.
- Shared event tracking layer belum ada sama sekali untuk GA4.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Monthly Visitors ternyata diimplementasikan sebagai Sessions | Medium | High | High | Lock metric mapping: Visitors = Users/Total Users |
| R-02 | FE mencoba baca report GA langsung dari browser | Medium | Critical | Critical | Semua read access lewat backend |
| R-03 | Company scoping tidak jelas dan data tercampur | Medium | High | High | Gunakan company-level mapping strategy eksplisit |
| R-04 | Surface tracking salah, angka visitor tidak sesuai ekspektasi bisnis | High | High | High | Lock tracked surfaces sebelum coding |
| R-05 | PII terkirim ke GA4 | Medium | Critical | Critical | Sanitized event mapper + QA payload verification |
| R-06 | GA API lambat atau kena quota | Medium | Medium | Medium | Cache + summary-only query + graceful fallback |
| R-07 | Monthly Active Users tidak tersedia pada struktur awal karena query/report belum dipersiapkan | Low | Medium | Low/Medium | Jadikan optional but planned metric |
| R-08 | Section baru live tapi kosong karena write path ada, read path belum siap | Medium | High | High | Release section hanya saat dua jalur siap |

### 7.2 Worst-Case Scenarios

- Visitor Analytics tampil tetapi angka sebenarnya adalah sessions, bukan visitors unik.
- Data visitor antar company tercampur.
- Credential GA exposure terjadi karena shortcut implementasi dari FE.
- Product menganggap section “broken” karena tracking sudah jalan tetapi backend read path belum ada.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Nav analytics menampilkan `Visitor Analytics`.
- Query param `section=visitor-analytics` membuka section dengan benar.
- Endpoint internal baru mengembalikan payload summary per company.
- Section minimal menampilkan:
  - Monthly Visitors
  - Monthly Active Users (jika fase awal diaktifkan)
- Error/loading/empty state tampil benar.

### 8.2 Regression Scope
- Section existing tidak rusak.
- `useStatisticApi` existing queries tetap berjalan.
- Analytics navigation dan routing existing tidak berubah perilakunya.

### 8.3 Integration Scope
- FE tracking mengirim data ke GA4 dari surface terpilih.
- analytics-service berhasil mengambil summary data dari GA4 Data API.
- Company-level mapping memilih source yang benar.
- Timeout/quota/failure dari GA API menghasilkan fallback aman.

### 8.4 UAT / Business Validation
- User dapat melihat Monthly Visitors per company langsung di SatuInbox.
- Jika tersedia, user dapat melihat Monthly Active Users per company pada section yang sama.
- Angka yang tampil dipahami sebagai visitor metric, bukan ticket/conversation metric.
- Jika ada comparison period, angka previous month tervalidasi.

### 8.5 Automation Candidates
- FE smoke test nav + section rendering.
- API contract test `/analytics/visitor/summary`.
- Integration test mapper GA4 response → internal summary payload.
- Network/payload assertion bahwa PII tidak pernah dikirim ke GA.

---

## 9. Production Safety

- **Rollback Strategy:** sembunyikan nav item Visitor Analytics via feature flag dan matikan endpoint baru tanpa mengubah analytics existing.
- **Feature Toggle Requirement:** sangat disarankan.
- **Backward Compatibility Notes:** tambahkan route baru; jangan mengubah contract existing.
- **Staged Rollout Recommendation:** summary cards dulu. Chart/trend belakangan.
- **Monitoring / Alerting Needs:** endpoint latency, GA API error rate, quota failure, empty-data anomaly.
- **Logging / Audit Gaps:** butuh logging fetch time dan source mapping per company.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Surface mana yang dihitung untuk Visitor Analytics: widget/public, dashboard, atau kombinasi? | Menentukan validitas Monthly Visitors | Yes |
| OQ-02 | Monthly Visitors perlu comparison previous month atau cukup single monthly number dulu? | Menentukan payload fase 1 | No |
| OQ-03 | Monthly Active Users masuk fase 1 atau fase 1.5/2? | Menentukan scope implementation awal | No |
| OQ-04 | Satu company punya satu property/stream atau bisa lebih dari satu? | Menentukan mapping config | Yes |
| OQ-05 | Perlu freshness label `last updated` atau tidak? | Menentukan metadata extension | No |
| OQ-06 | Consent mode wajib untuk surface yang ditrack? | Menentukan legal/UI scope | Yes |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Dengan klarifikasi user, sekarang desain produk lebih tajam: **Visitor Analytics**, **per company**, **Monthly Visitors first**, **Monthly Active Users optional**.
- Ini membuat metric strategy lebih masuk akal dibanding mencoba menampilkan semua metric GA sekaligus.
- Jalur implementasi terbaik tetap:
  - FE tracking ke GA4
  - BE `analytics-service` baca summary dari GA4 Data API
  - FE Visitor Analytics consume endpoint internal

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / Analyst / FE / BE |
| Required Revisions | Lock tracked surface, lock company mapping, lock metric mapping Visitors vs Active Users |
| Suggested Delivery Strategy | Phase split |
| Earliest Safe Next Step | Mini PRD / technical design note untuk Visitor Analytics |

**Recommended Phase 1 payload minimal:**
- `monthlyVisitors`
- `monthlyActiveUsers` (optional but recommended)
- `periodStart`
- `periodEnd`
- `comparisonPreviousMonth` (optional)
- `lastUpdatedAt` (optional)

**Recommended metric mapping:**
- **Monthly Visitors** → GA4 `Users / Total Users`
- **Monthly Active Users** → GA4 `Active Users`

**Recommended phase split:**
1. **Phase 1 — Definition**
   - lock tracked surfaces
   - lock company mapping
   - lock metric labels
2. **Phase 2 — Collection Layer**
   - pasang GA4 tag di surface terpilih
3. **Phase 3 — Read Layer**
   - analytics-service ambil summary per company dari GA4 Data API
4. **Phase 4 — UX Extension**
   - trend chart, comparison, freshness, caching improvement

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | Tambah section `Visitor Analytics` | FE analytics shell harus ditambah nav + valid section + render branch | UI | Pending | Pending |
| FR-02 | Tampilkan Monthly Visitors per company | Perlu backend read path + company mapping | API / Integration | Pending | Pending |
| FR-03 | Tampilkan Monthly Active Users bila memungkinkan | Bisa ditambahkan sebagai secondary summary metric | Reporting | Pending | Pending |
| FR-04 | Data aman dan credential tidak bocor | Read access harus backend-only | Security | Pending | Pending |
| FR-05 | Data scoped per company | Source mapping dan payload harus company-oriented | Security / Operational | Pending | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-19 | Initial assessment created | Hermes |
| 2026-06-19 | Scope revised: from basic GA4 tracking prep to internal analytics section integration | Hermes |
| 2026-06-19 | Requirement clarified: section name Visitor Analytics, company-scoped, primary metric Monthly Visitors, optional Monthly Active Users | Hermes |
