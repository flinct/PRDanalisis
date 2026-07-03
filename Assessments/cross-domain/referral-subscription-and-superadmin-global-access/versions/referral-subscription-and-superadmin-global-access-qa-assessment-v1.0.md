# Assessment Report: Referral Subscription System and SuperAdmin Global Company Access

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `User request in chat: (1) sistem referral dengan kode referral buatan user, reward penambahan subscription berjalan untuk referrer, org pengguna kode mendapat subscription gratis dengan durasi yang bisa diatur superAdmin; (2) superAdmin bisa akses bebas ke semua company di SatuInbox`
> **Assessment Artifact Path:** `Assessments/cross-domain/referral-subscription-and-superadmin-global-access/referral-subscription-and-superadmin-global-access-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-22
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Initial version.
- Scope user mengandung **2 feature lane berbeda**: growth/billing referral dan platform-admin cross-tenant access.
- Assessment ini merekomendasikan **split feature lane**, bukan 1 implementasi besar sekaligus.
- Temuan utama: SatuInbox sudah punya pondasi billing/subscription/voucher dan role `SUPER_ADMIN`, tetapi **belum punya modul referral end-to-end** dan **belum punya tenant-switch / impersonation flow** untuk akses lintas company.

---

## 1. Overview

**Feature / Issue:**
1. Sistem referral: user membuat kode referral sendiri; saat kode dipakai, subscription referrer bertambah otomatis, dan org yang memakai kode mendapat subscription gratis; durasi reward diatur superAdmin.
2. SuperAdmin bisa mengakses semua company yang dibuat di SatuInbox.

**Objective:**
- Menambah growth loop berbasis referral tanpa merusak model billing/subscription existing.
- Menyediakan capability operasional bagi superAdmin untuk support/monitor/manage tenant lintas company tanpa membuka kebocoran data lintas tenant.

**Business Context:**
Dari struktur SatuInbox saat ini:
- Domain billing/subscription sudah hidup di **payment-service**.
  - `apps/payment-service/src/app/schemas/subscription.schema.ts`
  - `apps/payment-service/src/app/services/subscription.service.ts`
- Sistem voucher sudah ada dan sudah mendukung preview benefit seperti `freeMonths` dan `tokenCredit`.
  - `apps/payment-service/src/app/schemas/voucher.schema.ts`
  - `apps/payment-service/src/app/schemas/voucher-redemption.schema.ts`
  - `apps/payment-service/src/app/services/voucher.service.ts`
- FE billing/subscription juga sudah ada.
  - `apps/omnichannel/services/billing/use-get-subscription.service.ts`
  - `apps/omnichannel/components/molecules/settings/billing/manage-package/ManagePackage.tsx`
- Role `SUPER_ADMIN` sudah ada dan punya wildcard permission `ALL_ACCESS`.
  - `apps/auth-service/src/app/seeders/role.seed.ts`
  - `libs/common/src/lib/constants/default-permission.constant.ts`
- Company listing sudah ada di **company-service gRPC** (`ListCompanies`, `GetCompany`), tetapi **belum ditemukan HTTP exposure di API Gateway**.
  - `proto/company.proto`
  - `apps/company-service/src/app/controllers/company.controller.ts`
  - `apps/api-gateway/src/app/company/company.controller.ts` saat ini berisi register / approve / reject / webhook / csat, belum expose list company.
- Session FE dan hampir semua service runtime masih **single-tenant context**.
  - NextAuth session membawa satu `company` dan satu `organization`.
  - Banyak service memvalidasi `companyId + organizationId` secara mandatory.
  - `apps/omnichannel/app/api/auth/[...nextauth]/authOption.ts`
  - `libs/common/src/lib/utils/error.utils.ts`

**Scope In:**
- Analisa impact structure SatuInbox untuk referral system.
- Analisa impact structure SatuInbox untuk superAdmin global company access.
- Rekomendasi bentuk implementasi FE/BE/API/DB/RBAC.
- Rekomendasi pembagian fase implementasi.

**Scope Out:**
- Penulisan PRD final detail.
- Implementasi code.
- UI mockup final.
- Detail estimation sprint/jam kerja.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `SPLIT_FEATURE`

**Decision Class:** `NO_GO`

**Decision Statement:**
> Arah bisnisnya valid, tetapi 2 permintaan ini tidak aman bila digabung jadi satu paket implementasi. Referral subscription bisa dibangun di lane billing/growth dengan leverage pondasi voucher/subscription existing, sedangkan superAdmin global access harus dibangun sebagai **platform-admin tenant switch / impersonation flow**, bukan bypass tenant scope mentah. Implementasi aman mensyaratkan pemisahan scope, contract, dan rollout.

### 2.2 Required Actions Before Development

- [ ] Pisahkan menjadi **Track A — Referral Subscription** dan **Track B — SuperAdmin Global Company Access**.
- [ ] Lock siapa yang boleh membuat referral code: rekomendasi **company billing owner / role dengan `MANAGE_SUBSCRIPTION`**, bukan semua member biasa.
- [ ] Lock event kualifikasi referral: rekomendasi reward aktif saat **subscription referred company benar-benar terbentuk/qualified**, bukan sekadar input code.
- [ ] Lock policy referrer reward: apakah hanya untuk **subscription yang sedang aktif** atau boleh menjadi **pending credit** bila referrer belum aktif.
- [ ] Untuk superAdmin, desain **tenant switch / impersonation** yang diaudit, bukan query global tanpa tenant.
- [ ] Tambahkan audit/logging untuk semua action superAdmin dan grant reward referral.

### 2.3 Key Blocking Reasons / Conditions

- Referral dual-reward **tidak sama** dengan voucher existing; voucher sekarang hanya menguntungkan tenant yang menebus code.
- Tenant model existing sangat mengandalkan `companyId + organizationId` di session dan `userContext`; ini bertabrakan dengan ide “akses bebas” bila diartikan sebagai bypass global.
- FE punya konstanta route `super-admin`, tetapi **tidak ditemukan implementasi halaman super-admin actual** pada inspeksi file FE.
- Company listing tersedia di company-service gRPC, tetapi **belum ditemukan exposure yang siap dipakai FE super-admin** di API Gateway.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Critical
- **Risk Level:** Critical
- **Primary Impact Areas:** Backend, API, Database, RBAC, Security, Financial/Operational, Audit, UI/UX, Integration

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | User bisa memiliki / membuat kode referral sendiri. | User request |
| BR-02 | Saat kode referral digunakan dan valid, referrer mendapat tambahan durasi subscription. | User request |
| BR-03 | Org yang menggunakan kode referral mendapat subscription gratis. | User request |
| BR-04 | Durasi reward/gratis dapat diatur superAdmin. | User request |
| BR-05 | SuperAdmin harus bisa mengakses semua company di SatuInbox. | User request |
| BR-06 | Billing/subscription tetap harus menjaga tenant boundary, audit trail, dan status subscription lifecycle existing. | Current architecture |
| BR-07 | Global access superAdmin tidak boleh merusak enforcement `companyId + organizationId` pada service existing. | Current architecture |
| BR-08 | Reward referral harus idempotent; satu redemption tidak boleh menggandakan benefit. | QA / financial safety |
| BR-09 | Self-referral dan abuse path harus dicegah. | QA / financial safety |

### 3.2 Acceptance Criteria

- Tersedia entity referral code milik tenant/referrer.
- Tersedia validasi code sebelum activation flow.
- Referred org bisa menerima benefit gratis sesuai policy.
- Referrer mendapat extension benefit hanya sekali per redemption yang qualified.
- SuperAdmin bisa membuka daftar company dan masuk ke tenant target secara aman.
- Semua action lintas-tenant oleh superAdmin tercatat di audit log.
- Tidak ada data leakage lintas company akibat bypass tenant scope.

### 3.3 Assumptions

- “User” pada referral lebih tepat dimodelkan sebagai **user dalam tenant yang mewakili company**, sementara reward finansial tetap jatuh ke **company / organization subscription**, bukan ke member personal.
- “Subscription yang sedang berjalan” berarti referrer idealnya punya active subscription saat reward dikreditkan.
- “Org yang menggunakan kode” paling aman untuk Phase 1 dibatasi ke **new company / first qualifying subscription**.

### 3.4 Clarifications Needed

- Siapa yang boleh membuat/edit referral code: semua user, admin company, atau hanya billing owner?
- Apakah 1 company boleh punya banyak referral code, atau hanya 1 aktif?
- Apakah reward bulan untuk referrer dan referee sama atau berbeda?
- Apakah referred company harus bayar dulu untuk qualify, atau langsung bisa dapat free subscription tanpa payment?
- Jika referrer sedang expired, reward langsung mengaktifkan lagi atau menjadi saldo/pending reward?
- SuperAdmin access itu read-only default, atau langsung boleh write juga?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

#### Track A — Referral / Billing
- Tidak ditemukan modul referral khusus di BE/FE/PRD workspace.
- Payment domain sudah punya:
  - subscription lifecycle (`ACTIVE`, `CANCELLED`, `EXPIRED`, dst.)
  - manual expire untuk superAdmin
  - voucher preview + redemption
  - FE billing manage package + voucher validation
- Voucher existing sudah mendukung:
  - `effects.freeMonths`
  - `effects.tokenCredit`
  - redemption log/idempotency per company + voucher code
- Tetapi voucher existing saat ini **hanya memodelkan benefit untuk tenant yang redeem**, belum benefit untuk referrer.
- Ada method `extendSubscriptionPeriod(subscriptionId, newEndDate)` yang bisa dipakai untuk extension benefit, tetapi tidak ada ledger referral khusus.

#### Track B — SuperAdmin Global Access
- `SUPER_ADMIN` role sudah seeded dan punya `ALL_ACCESS` permission wildcard.
- Beberapa endpoint tertentu memang sudah superAdmin-only, misalnya manual expire subscription.
- Company-service sudah punya `ListCompanies` dan `GetCompany` di gRPC.
- FE punya route constant `super-admin`, tetapi tidak ditemukan file route/page operasional super-admin pada hasil pencarian.
- Session auth FE masih membawa satu company dan satu organization.
- Banyak service/repository menganggap tenant context wajib (`companyId`, `organizationId`).

### 4.2 Proposed State (To-Be)

#### Track A — Referral Subscription System
Rekomendasi bentuk implementasi:
1. **Referral tetap menjadi bounded context baru di payment domain**, bukan hanya rename voucher.
2. Reuse billing/voucher building blocks seperlunya untuk preview benefit referee.
3. Tambah entity inti:
   - `referral_program_config`
   - `referral_code`
   - `referral_redemption`
   - `referral_reward_grant` atau ledger bonus subscription
4. Qualification event direkomendasikan:
   - **Phase 1:** reward diberikan saat referred tenant mencapai event yang dikunci, misalnya subscription pertama berhasil dibuat/diaktifkan.
5. Referrer reward direkomendasikan sebagai:
   - update `subscription.endDate` + `gracePeriodDate` melalui service payment existing
   - plus ledger audit agar perubahan durasi tidak “silent edit”
6. Referee reward direkomendasikan sebagai:
   - reuse invoice/subscription flow existing dengan `freeMonths` / zero-amount billing handling
   - atau grant subscription bonus langsung, tetapi tetap melalui payment-service agar lifecycle konsisten

#### Track B — SuperAdmin Global Company Access
Rekomendasi bentuk implementasi:
1. **Jangan** membuat semua service membaca global data tanpa tenant.
2. Tambahkan **Platform Admin Portal**:
   - list company
   - company detail summary
   - action “Masuk sebagai tenant ini” / “Switch context”
3. Tambahkan **impersonation / tenant switch token**:
   - session baru tetap single-tenant
   - tetapi membawa `actorUserId`, `actorRole=SUPER_ADMIN`, `impersonatedCompanyId`, `impersonatedOrganizationId`
4. Semua layar existing tetap bekerja dengan model single-tenant yang sudah ada.
5. FE wajib menampilkan banner jelas: sedang melihat sebagai company X / organization Y.
6. Write access sebaiknya bisa dikontrol terpisah dari read access.

### 4.3 State Transition / Data Flow Notes

#### Referral flow recommended
`Company admin opens referral page` → `create/update referral code` → `new tenant enters code on subscription path` → `code preview/validate` → `qualification event reached` → `grant referee benefit` + `extend referrer subscription` + `audit log`

#### SuperAdmin access flow recommended
`SUPER_ADMIN login` → `Platform Admin Portal` → `list companies` → `choose company/org` → `backend issues impersonation context` → `existing tenant UI loads with switched company/org context` → `audit log all access/actions`

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Tambah referral engine + super-admin portal/switcher | payment-service, api-gateway, auth-service/session, company-service, FE billing/settings | HIGH | Pisah Track A/B |
| Database | Entity referral baru + reward ledger + possible config table | `satuinbox_payment`, mungkin audit data | HIGH | Gunakan ledger/audit model, jangan direct edit tanpa histori |
| API | Endpoint baru referral create/validate/redeem/stats + super-admin list/switch | API Gateway + gRPC contracts | HIGH | Contract baru, jangan overload endpoint existing sembarang |
| UI/UX | Page referral, billing integration, super-admin company selector, impersonation banner | settings/subscriptions FE, platform admin FE | HIGH | Feature flag + explicit UX state |
| Security / RBAC | Cross-tenant access dan reward mutation | auth-service, guards, audit, token/session | CRITICAL | Impersonation token + audit + least privilege |
| Performance | Company list/search + referral validation + reward processing | company-service, payment-service | MEDIUM | Pagination, cache ringan, idempotent reward job |
| Integration | Payment-service ↔ people-service deactivation/reactivation edges, notification-service for reward messages | internal gRPC/event flows | HIGH | Pastikan event/compensation flow jelas |
| Reporting / Analytics | Referral stats, reward usage, super-admin activity reporting | analytics/audit/reporting | MEDIUM | Tambah event/log structured |
| Financial / Operational | Subscription extension mengubah entitlement dan mungkin invoice total | billing cycles, quota, member access | CRITICAL | Ledger + reconciliation + rollback plan |
| Concurrency | Duplicate redeem, parallel qualification, multiple super-admin switches | payment-service, session handling | CRITICAL | Unique indexes, idempotency key, transactional reward grant |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Referral code creation | payment-service config + company/member context | API + DB | FE billing/settings → payment-service | Creator RBAC harus jelas |
| Referral code validation | billing pricing/voucher-like preview | sync service | FE subscription page → payment-service | Bisa reuse pattern voucher validation |
| Referrer subscription extension | active subscription lifecycle | DB + service logic | referral reward → subscription service | Butuh ledger bonus |
| Referee free subscription | billing cycle / subscription creation | DB + service logic | referral redemption → subscription create/billing | Jangan bypass payment-service |
| Reward notifications | notification-service | async event | payment-service → notification-service | Optional phase 1 |
| SuperAdmin company list | company-service `ListCompanies` | gRPC read | platform admin FE → API Gateway → company-service | Endpoint gateway belum ada |
| SuperAdmin tenant switch | auth/session/token | auth + security | FE platform admin → API Gateway/auth-service | Butuh impersonation contract |
| Existing tenant screens | single-tenant session context | session/RBAC | impersonation context → seluruh modul | Ini alasan jangan bypass tenant filter langsung |

### 6.2 Shared Resources / Event Mapping

- Shared subscription lifecycle existing: `startDate`, `endDate`, `gracePeriodDate`, `isActive`, `status`.
- Shared voucher primitives existing: code uniqueness, freeMonths, tokenCredit, redemption log.
- Shared tenant context existing: hampir semua service memakai `companyId + organizationId`.
- Shared people-service edge: subscription expiry saat ini bisa menonaktifkan member organization; referral/reactivation perlu policy jelas bila menyentuh tenant expired.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Self-referral / abuse antar account terkait | High | High | Critical | Cegah same company / same owner identity / suspicious rule |
| R-02 | Referral reward tergandakan karena retry / race condition | Medium | Critical | Critical | Unique index + idempotent reward grant + transaction |
| R-03 | Referrer reward diterapkan ke subscription expired tanpa policy jelas | Medium | High | High | Phase 1 batasi ke active subscription atau simpan pending credit resmi |
| R-04 | Free subscription referee mem-bypass billing lifecycle dan bikin data invoice/report tidak sinkron | Medium | Critical | Critical | Semua grant lewat payment-service + billing ledger |
| R-05 | SuperAdmin melihat/menulis data tenant salah karena context switch tidak eksplisit | Medium | Critical | Critical | Impersonation banner + explicit target selector + audit |
| R-06 | Developer mencoba bypass tenant filter global | Medium | Critical | Critical | Jangan ubah semua service jadi tenant-optional; pakai switched single-tenant token |
| R-07 | API Gateway buka company list tanpa guard ketat | Medium | High | High | SUPER_ADMIN only + pagination + audit |
| R-08 | Tidak ada audit detail untuk reward/grant/admin access | High | High | High | Structured audit wajib |
| R-09 | Banyak code referral per company bikin ownership reward membingungkan | Medium | Medium | Medium | Phase 1 satu company satu active code |
| R-10 | Referral code mengubah invoice jadi nol, tapi activation/payment confirmation flow tidak siap | Medium | High | High | Uji zero-amount billing path secara eksplisit |

### 7.2 Worst-Case Scenarios

- Company menerima extension reward dua kali untuk satu redemption.
- SuperAdmin membuka tenant A tetapi action tercatat/terjadi di tenant B.
- Data lintas company bocor karena query global tanpa tenant boundary.
- Free subscription membuat member access aktif/nonaktif tidak sinkron dengan subscription state.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Create / update / disable referral code.
- Validate referral code pada subscription flow.
- Grant referee free benefit.
- Grant referrer extension benefit.
- SuperAdmin list company.
- SuperAdmin switch tenant.
- Banner / indicator impersonation muncul konsisten.

### 8.2 Regression Scope
- Subscription create/cancel/manual-expire existing tidak rusak.
- Voucher validation existing tidak rusak.
- Settings/subscription FE existing tetap jalan.
- Existing tenant screens tetap bekerja normal dengan session biasa.

### 8.3 Integration Scope
- Payment-service ↔ billing cycle ↔ voucher/referral reward.
- Payment-service ↔ people-service untuk edge expired/reactivated tenant bila nanti didukung.
- API Gateway ↔ company-service list companies.
- Auth/session ↔ impersonation token ↔ FE session update.

### 8.4 UAT / Business Validation
- Company admin bisa melihat dan membagikan code referral miliknya.
- Referred company mendapat benefit sesuai rule superAdmin.
- Referrer melihat tambahan subscription secara jelas dan terukur.
- SuperAdmin bisa mencari company, masuk ke context tenant, dan keluar lagi tanpa ambiguity.

### 8.5 Automation Candidates
- API contract tests referral create/validate/redeem.
- Idempotency tests parallel redeem.
- FE E2E billing/referral happy path.
- FE E2E super-admin switch tenant.
- Security tests akses company list dan impersonation hanya untuk SUPER_ADMIN.

---

## 9. Production Safety

- **Rollback Strategy:** feature flag terpisah untuk Track A dan Track B; bisa matikan referral tanpa mematikan billing core, dan matikan super-admin switch tanpa mematikan login tenant biasa.
- **Feature Toggle Requirement:** wajib untuk kedua track.
- **Backward Compatibility Notes:** jangan ubah contract tenant existing menjadi optional/global; tambahkan contract baru.
- **Staged Rollout Recommendation:**
  - Track A: internal pilot + limited tenants
  - Track B: read-only impersonation dulu, write access belakangan
- **Monitoring / Alerting Needs:** duplicate reward, failed reward grant, impersonation failures, cross-tenant access anomalies.
- **Logging / Audit Gaps:** saat ini belum ada evidence flow audit khusus untuk referral reward dan tenant impersonation; harus ditambah.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Siapa yang boleh membuat referral code? | Menentukan RBAC dan ownership reward | Yes |
| OQ-02 | Satu company boleh punya berapa active referral code? | Menentukan model data dan UX | Yes |
| OQ-03 | Reward referee dan referrer apakah bulan yang sama atau terpisah? | Menentukan config model | Yes |
| OQ-04 | Qualification event referral apa? input code, invoice created, payment success, atau subscription active? | Menentukan anti-fraud dan timing reward | Yes |
| OQ-05 | Jika referrer expired, reward tetap diberikan sekarang atau jadi pending credit? | Menentukan lifecycle bonus | Yes |
| OQ-06 | SuperAdmin access default read-only atau langsung read-write? | Menentukan safety level | Yes |
| OQ-07 | Company access cukup level company atau harus pilih organization juga? | Session context existing memakai dua identifier | Yes |
| OQ-08 | Perlu statistik referral (usage, conversion, reward ledger) di Phase 1 atau tidak? | Menentukan reporting scope | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- **Referral** cukup dekat dengan payment/voucher/subscription existing sehingga aman dijadikan lane pertama.
- **SuperAdmin global access** jauh lebih berisiko karena menyentuh auth, session, tenant isolation, dan audit; ini tidak boleh dicampur dengan billing referral dalam satu delivery.
- Pondasi voucher bisa membantu untuk sisi **referee benefit preview**, tetapi **dual-sided reward** dan **user-owned custom code** tetap memerlukan referral model baru.
- Role `SUPER_ADMIN` sudah ada, sehingga pekerjaan utamanya bukan membuat role baru, melainkan membuat **platform-admin operational surface** yang kompatibel dengan tenant architecture sekarang.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `SPLIT_FEATURE` |
| Owner for Follow-up | PM / Analyst / BE / FE / Security |
| Required Revisions | Lock referral qualification policy, reward policy, super-admin access mode, tenant-switch contract |
| Suggested Delivery Strategy | 2-track phased delivery |
| Earliest Safe Next Step | Tulis 2 PRD terpisah atau 1 PRD parent dengan 2 child tracks |

**Recommended delivery split:**

### Track A — Referral Subscription System
**Phase 1**
- 1 company = 1 active referral code
- creator dibatasi ke billing-authorized role
- referred tenant = first qualifying subscription only
- referrer reward = hanya untuk active subscription
- superAdmin config global reward months
- no pending bonus wallet yet

**Phase 2**
- multiple codes / campaign labels
- pending reward credit
- referral analytics dashboard
- anti-fraud scoring lebih lanjut

### Track B — SuperAdmin Global Company Access
**Phase 1**
- company list/search
- tenant switch / impersonation
- read-only mode
- visible banner + audit log

**Phase 2**
- scoped write mode
- quick actions (billing assist, config assist)
- cross-tenant operational dashboard

**Recommended implementation ownership:**
- Referral core: `payment-service`
- Company list source: `company-service`
- Session switch / impersonation: `auth-service` + `api-gateway`
- FE admin shell: `apps/omnichannel` new `super-admin` lane

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | User bisa membuat kode referral | Perlu entity referral code + creator RBAC | BE / RBAC / UI | Pending | Pending |
| FR-02 | Referrer mendapat tambahan subscription berjalan | Bisa reuse extension logic subscription, tapi butuh reward ledger | Billing / Financial | Pending | Pending |
| FR-03 | Referee mendapat subscription gratis | Bisa leverage voucher/free-month style flow, tetapi harus tetap lewat payment lifecycle | Billing / API | Pending | Pending |
| FR-04 | Durasi reward diatur superAdmin | Perlu config model dan admin surface | BE / UI / RBAC | Pending | Pending |
| FR-05 | SuperAdmin akses semua company | Harus lewat tenant switch / impersonation, bukan bypass global | Security / Auth / RBAC | Pending | Pending |
| FR-06 | Existing tenant flow tetap aman | Session single-tenant harus dipertahankan | Security / Regression | Pending | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial assessment created | Hermes |
| 2026-06-22 | Recommendation locked to split referral lane vs super-admin lane | Hermes |
