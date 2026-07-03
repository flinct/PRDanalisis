# Assessment Report: Referral Subscription System and SuperAdmin Global Company Access

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `User request in chat: (1) sistem referral dengan kode referral buatan user, reward penambahan subscription berjalan untuk referrer, org pengguna kode mendapat subscription gratis dengan durasi yang bisa diatur superAdmin; (2) superAdmin bisa akses bebas ke semua company di SatuInbox; clarification added: referrer must see referral approval status after onboarding, and superAdmin scope is phased (phase 1 company list/search + new company banner + owner display + approve onboarding company, phase 2 impersonate read-only + audit log, phase 3 write mode + quick admin action like change permission)`
> **Assessment Artifact Path:** `Assessments/cross-domain/referral-subscription-and-superadmin-global-access/referral-subscription-and-superadmin-global-access-qa-assessment.md`
> **Version:** `v1.1`
> **Previous Version:** `Assessments/cross-domain/referral-subscription-and-superadmin-global-access/versions/referral-subscription-and-superadmin-global-access-qa-assessment-v1.0.md`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-22
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Versi ini mempertahankan keputusan **split feature**.
- Track referral diperjelas: referrer perlu melihat **status referral setelah onboarding**, minimal `pending review / approved / rejected`.
- Track superAdmin diperjelas menjadi roadmap **3 phase**:
  - Phase 1: company list/search, new company badge, owner display, approve onboarding company
  - Phase 2: impersonation, read-only, audit log
  - Phase 3: write mode, quick admin action seperti change permission
- Perubahan ini menurunkan ambiguity scope, tetapi tidak mengubah kesimpulan bahwa kedua feature harus dipisah agar aman.

---

## 1. Overview

**Feature / Issue:**
1. Sistem referral: user membuat kode referral sendiri; saat kode dipakai, subscription referrer bertambah otomatis, dan org yang memakai kode mendapat subscription gratis; durasi reward diatur superAdmin; referrer juga harus bisa melihat status referral setelah proses onboarding/approval.
2. SuperAdmin bisa mengakses semua company yang dibuat di SatuInbox, dengan scope delivery bertahap.

**Objective:**
- Menambah growth loop berbasis referral yang terhubung ke lifecycle onboarding dan subscription.
- Menyediakan operational surface untuk superAdmin tanpa merusak tenant isolation yang saat ini single-tenant.

**Business Context:**
Dari struktur SatuInbox saat ini:
- Domain billing/subscription sudah hidup di **payment-service**.
- Sistem voucher sudah ada dan mendukung `freeMonths`, `tokenCredit`, serta redemption log.
- FE billing/subscription juga sudah ada di settings/subscriptions.
- Role `SUPER_ADMIN` sudah ada dan punya wildcard permission `ALL_ACCESS`.
- Company approval flow sudah ada di `company-service` / API Gateway (`approveCompany`, `rejectCompany`).
- Company listing sudah ada di **company-service gRPC** (`ListCompanies`, `GetCompany`), tetapi belum ditemukan surface HTTP/FE super-admin yang siap pakai.
- Session FE dan hampir semua service runtime masih **single-tenant context** (`companyId + organizationId`).

**Scope In:**
- Analisa impact structure SatuInbox untuk referral system.
- Analisa impact structure SatuInbox untuk superAdmin global company access.
- Rekomendasi bentuk implementasi FE/BE/API/DB/RBAC.
- Rekomendasi pembagian phase implementasi.

**Scope Out:**
- Implementasi code.
- UI mockup final.
- Estimasi sprint detail.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `SPLIT_FEATURE`

**Decision Class:** `NO_GO`

**Decision Statement:**
> Arah bisnis valid, tetapi dua permintaan ini tidak aman bila dijadikan satu paket implementasi. Referral harus diposisikan sebagai lane billing/onboarding dengan state tracking sendiri, sedangkan superAdmin global access harus diposisikan sebagai platform-admin lane dengan delivery bertahap dan tenant switch yang diaudit.

### 2.2 Required Actions Before Development

- [ ] Pisahkan menjadi **Track A — Referral Subscription System** dan **Track B — SuperAdmin Global Company Access**.
- [ ] Lock siapa yang boleh membuat referral code; rekomendasi Phase 1: role billing-authorized, bukan semua member.
- [ ] Lock referral status model yang terlihat oleh referrer setelah onboarding.
- [ ] Lock kapan reward referee aktif: setelah company approved, atau setelah subscription milestone tertentu.
- [ ] Lock policy referrer reward saat referrer sedang expired.
- [ ] Untuk superAdmin, pertahankan roadmap bertahap: approval/list dulu, impersonation read-only berikutnya, write mode terakhir.
- [ ] Tambahkan audit/logging untuk semua action superAdmin dan semua reward grant referral.

### 2.3 Key Blocking Reasons / Conditions

- Referral dual-reward tidak sama dengan voucher existing.
- Tenant model existing sangat bergantung pada `companyId + organizationId` per session.
- FE super-admin portal belum ditemukan walau route constant ada.
- Company list gRPC ada, tetapi HTTP exposure + admin FE surface belum siap.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Critical
- **Risk Level:** Critical
- **Primary Impact Areas:** Backend, API, Database, RBAC, Security, Financial/Operational, Audit, UI/UX, Integration

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | User/tenant dapat memiliki kode referral sendiri. | User request |
| BR-02 | Saat referral valid dipakai, referrer mendapat tambahan subscription. | User request |
| BR-03 | Org yang memakai kode referral mendapat subscription gratis. | User request |
| BR-04 | Durasi reward dapat diatur superAdmin. | User request |
| BR-05 | Referrer harus bisa melihat status referral setelah proses onboarding. | User clarification |
| BR-06 | SuperAdmin phase 1 mencakup company list/search, banner new company, owner display, approve onboarding company. | User clarification |
| BR-07 | SuperAdmin phase 2 mencakup impersonation, read-only, audit log. | User clarification |
| BR-08 | SuperAdmin phase 3 mencakup write mode dan quick admin action seperti change permission. | User clarification |
| BR-09 | Tenant isolation existing tidak boleh dirusak. | Current architecture |
| BR-10 | Reward referral harus idempotent dan audit-able. | QA / financial safety |

### 3.2 Acceptance Criteria

- Tersedia entity referral code milik tenant/referrer.
- Tersedia referral status timeline yang bisa dilihat referrer.
- Tersedia state onboarding-linked status minimal `pending review`, `approved`, `rejected`.
- Referred org bisa menerima benefit gratis sesuai policy.
- Referrer mendapat extension benefit sesuai event qualification yang dikunci.
- SuperAdmin phase 1 bisa melihat company list dan approve onboarding.
- SuperAdmin phase 2 bisa masuk tenant target dalam mode read-only dengan audit.
- SuperAdmin phase 3 bisa menjalankan write action tertentu secara terkontrol.

### 3.3 Assumptions

- Reward finansial tetap jatuh ke **company / organization subscription**, bukan ke user personal.
- Referral code kemungkinan dipakai di flow onboarding/subscription, bukan di dalam inbox operasional.
- “Approve / not approve setelah onboarding” berarti company approval menjadi milestone penting dalam referral state.
- Write mode superAdmin tidak langsung dibutuhkan di phase 1.

### 3.4 Clarifications Needed

- Siapa tepatnya yang boleh membuat/edit referral code?
- Apakah reward referee aktif langsung saat company approved, atau setelah langkah subscription tambahan?
- Apakah 1 company hanya boleh punya 1 active code di phase 1?
- Apakah phase 3 write mode superAdmin hanya change permission dulu atau juga include billing/member/team action lain?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

#### Track A — Referral / Billing
- Tidak ditemukan modul referral khusus di BE/FE/PRD workspace.
- Payment domain sudah punya subscription lifecycle, manual expire, voucher preview + redemption, FE billing manage package.
- Voucher existing hanya memodelkan benefit untuk tenant yang redeem, belum dual-sided referrer/referee.
- Ada method `extendSubscriptionPeriod(...)` untuk extension subscription, tetapi belum ada ledger referral khusus.
- Company onboarding/approval existing sudah ada di domain company.

#### Track B — SuperAdmin Global Access
- `SUPER_ADMIN` role sudah seeded dan punya wildcard permission.
- Beberapa endpoint tertentu sudah superAdmin-only, misalnya manual expire subscription.
- Company-service sudah punya `ListCompanies` dan `GetCompany` di gRPC.
- API Gateway company controller saat ini fokus ke register/approve/reject/webhook/csat; belum menjadi platform-admin portal.
- Session auth FE masih single-tenant.
- FE punya route constant `super-admin`, tetapi belum ditemukan implementasi halaman operasional yang lengkap.

### 4.2 Proposed State (To-Be)

#### Track A — Referral Subscription System
Rekomendasi bentuk implementasi:
1. Referral menjadi bounded context baru di payment domain.
2. Reuse building blocks voucher/billing hanya pada bagian yang cocok.
3. Tambah entity inti:
   - `referral_program_config`
   - `referral_code`
   - `referral_case` / `referral_redemption`
   - `referral_reward_grant`
4. Tambah status visibility untuk referrer, minimal:
   - `code_shared`
   - `used_on_signup`
   - `onboarding_in_progress`
   - `onboarding_submitted`
   - `company_approved`
   - `company_rejected`
   - `reward_granted`
5. Referrer membutuhkan halaman/list untuk memonitor status referral setelah onboarding.
6. Company approval event dari onboarding menjadi dependency penting untuk memindahkan status referral.

#### Track B — SuperAdmin Global Company Access
Rekomendasi bentuk implementasi per phase:
- **Phase 1**
  - company list/search
  - `new company` badge/banner
  - owner user displayed di company list
  - approve onboarding company
- **Phase 2**
  - tenant impersonation / switch context
  - read-only mode
  - audit log
- **Phase 3**
  - write mode
  - quick admin action seperti change permission

### 4.3 State Transition / Data Flow Notes

#### Referral flow recommended
`Referrer creates code` → `new company uses code` → `onboarding in progress` → `onboarding submitted` → `superAdmin approves/rejects company` → `referrer sees approved/rejected status` → `reward logic executes per policy` → `audit log`

#### SuperAdmin access flow recommended
`SUPER_ADMIN login` → `Platform Admin company list` → `review new company + owner` → `approve onboarding` → `(phase 2) choose tenant` → `backend issues impersonation context` → `tenant UI opens in read-only mode` → `(phase 3) controlled write actions` → `audit log`

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Tambah referral engine + admin company portal + impersonation | payment-service, company-service, api-gateway, auth-service/session, FE billing/settings/admin | HIGH | Pisah track dan phase |
| Database | Entity referral baru + reward ledger + admin activity / config references | `satuinbox_payment`, `satuinbox_company`, audit data | HIGH | Gunakan ledger/audit model |
| API | Endpoint referral create/list/status + company admin list/approve + impersonation/switch | API Gateway + gRPC contracts | HIGH | Contract baru bertahap |
| UI/UX | Referral monitoring page, company list page, status badge, impersonation banner | settings/subscriptions FE, new super-admin FE | HIGH | Flag per phase |
| Security / RBAC | Cross-tenant access + reward mutation + approve onboarding | auth-service, guards, token/session, audit | CRITICAL | Least privilege + audit + explicit mode |
| Performance | Company list/search, referral status list, reward processing | company-service, payment-service | MEDIUM | Pagination, indexes, cache ringan |
| Integration | Company approval event ↔ referral status, payment reward ↔ subscription lifecycle | company-service, payment-service, maybe notification-service | HIGH | Event contract jelas |
| Reporting / Analytics | Referral funnel stats dan super-admin activity | analytics/audit/reporting | MEDIUM | Structured logging |
| Financial / Operational | Subscription extension dan free subscription mengubah entitlement | billing cycles, quota, member access | CRITICAL | Ledger + reconciliation |
| Concurrency | Duplicate reward, duplicate onboarding approval handling, multiple admin switch sessions | payment/company/auth | CRITICAL | Idempotency + unique indexes + audit |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Referral code creation | payment-service config + billing-authorized role | API + DB | FE settings/subscriptions → payment-service | Creator RBAC harus jelas |
| Referral status monitoring | company approval lifecycle | sync/event | company-service → referral state | Core clarification baru |
| Referrer reward grant | active subscription lifecycle | DB + service logic | referral reward → subscription service | Butuh ledger bonus |
| Referee free subscription | billing cycle / subscription creation | DB + service logic | referral qualification → billing/subscription | Jangan bypass payment-service |
| Company list/search | company-service `ListCompanies` | gRPC read | super-admin FE → API Gateway → company-service | Phase 1 |
| Approve onboarding company | existing company approval flow | mutation | super-admin FE → API Gateway → company-service | Phase 1 |
| Tenant switch / impersonation | auth/session/token | auth + security | FE platform admin → API Gateway/auth-service | Phase 2 |
| Read-only enforcement | route/ui + backend guards | FE + BE | impersonation context → downstream modules | Phase 2 |
| Write quick actions | permission and mutation surfaces | FE + BE | super-admin mode → target modules | Phase 3 |

### 6.2 Shared Resources / Event Mapping

- Shared subscription lifecycle: `startDate`, `endDate`, `gracePeriodDate`, `isActive`, `status`.
- Shared voucher primitives: code uniqueness, freeMonths, tokenCredit, redemption log.
- Shared company onboarding lifecycle: register → approve/reject.
- Shared tenant context: hampir semua service memakai `companyId + organizationId`.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Self-referral / abuse | High | High | Critical | Cegah same company / same owner identity |
| R-02 | Referral reward tergandakan | Medium | Critical | Critical | Unique index + idempotent reward grant |
| R-03 | Referral status tidak sinkron dengan company approval | Medium | High | High | Event mapping company approved/rejected harus eksplisit |
| R-04 | Free subscription referee bypass billing lifecycle | Medium | Critical | Critical | Semua grant lewat payment-service |
| R-05 | SuperAdmin approve atau impersonate tenant salah | Medium | Critical | Critical | Explicit target confirmation + audit |
| R-06 | Developer bypass tenant filter global | Medium | Critical | Critical | Tetap single-tenant via switched context |
| R-07 | Company list terbuka tanpa guard SUPER_ADMIN | Medium | High | High | Guard ketat + pagination + audit |
| R-08 | Tidak ada audit detail untuk reward / impersonation / write mode | High | High | High | Structured audit wajib |
| R-09 | Write mode phase 3 terlalu cepat masuk sebelum read-only stabil | Medium | High | High | Phased gate, jangan lompat phase |

### 7.2 Worst-Case Scenarios

- Referrer melihat referral `approved`, tetapi reward tidak pernah grant karena state mapping putus.
- SuperAdmin mengakses tenant yang salah dan melakukan mutation.
- Data lintas company bocor karena implementasi global-scope mentah.
- Free subscription memicu akses tenant aktif/nonaktif yang tidak sinkron.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Create / update / disable referral code.
- Referral status list for referrer.
- Onboarding-linked status transition (`pending` / `approved` / `rejected`).
- Referee free benefit.
- Referrer extension benefit.
- SuperAdmin list company/search/new badge/owner display.
- Approve onboarding company.
- Phase 2 impersonation read-only.
- Phase 3 write action gating.

### 8.2 Regression Scope
- Subscription create/cancel/manual-expire existing tidak rusak.
- Voucher validation existing tidak rusak.
- Company register/approve/reject existing tidak rusak.
- Existing tenant screens tetap bekerja normal dengan session biasa.

### 8.3 Integration Scope
- Company approval ↔ referral status update.
- Payment-service ↔ billing cycle ↔ referral reward.
- API Gateway ↔ company-service list/approve.
- Auth/session ↔ impersonation token ↔ FE session update.

### 8.4 UAT / Business Validation
- Referrer bisa melihat status referral pasca onboarding.
- SuperAdmin bisa melihat company baru dan owner dengan jelas.
- SuperAdmin phase 1 dapat approve onboarding tanpa butuh impersonation.
- Phase 2 read-only mode jelas terlihat di FE.
- Phase 3 mutation dibatasi hanya pada action yang diizinkan.

### 8.5 Automation Candidates
- API contract tests referral status transition.
- Idempotency tests parallel reward grant.
- FE E2E company list/search/approve onboarding.
- FE E2E impersonation read-only banner.
- Security tests akses company list dan impersonation hanya untuk SUPER_ADMIN.

---

## 9. Production Safety

- **Rollback Strategy:** feature flag terpisah untuk Track A dan Track B, dan juga per phase superAdmin.
- **Feature Toggle Requirement:** wajib.
- **Backward Compatibility Notes:** tenant contract existing tetap single-tenant; extension dibuat via contract baru.
- **Staged Rollout Recommendation:**
  - Track A: pilot internal / terbatas
  - Track B phase 1 lebih dulu
  - phase 2 setelah audit + session switch stabil
  - phase 3 terakhir
- **Monitoring / Alerting Needs:** referral state mismatch, duplicate reward, onboarding approval failures, impersonation failures, forbidden write attempt di read-only mode.
- **Logging / Audit Gaps:** audit khusus referral status, reward grant, company approval by superAdmin, impersonation session, dan write mode action wajib ditambah.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Siapa yang boleh membuat referral code? | Menentukan RBAC dan ownership reward | Yes |
| OQ-02 | Company approval langsung mengaktifkan reward referee, atau hanya update status referral? | Menentukan event qualification | Yes |
| OQ-03 | Referrer reward grant saat company approved atau saat subscription milestone berikutnya? | Menentukan anti-fraud dan timing reward | Yes |
| OQ-04 | Phase 1 referral cukup 1 company 1 code? | Menentukan model data awal | Yes |
| OQ-05 | Phase 3 write mode superAdmin mencakup action apa saja selain change permission? | Menentukan blast radius phase 3 | Yes |
| OQ-06 | Company access cukup level company atau harus pilih organization juga? | Session context existing memakai dua identifier | Yes |
| OQ-07 | Perlu statistik referral di phase 1 atau cukup status list dulu? | Menentukan reporting scope | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Clarification user membuat split delivery semakin kuat.
- Referral sekarang jelas perlu terhubung ke onboarding approval visibility, bukan sekadar voucher redemption.
- SuperAdmin sekarang punya roadmap phase yang lebih realistis: approval/list dulu, impersonation read-only berikutnya, write mode terakhir.
- Ini selaras dengan arsitektur existing yang single-tenant dan belum punya mature platform-admin shell.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `SPLIT_FEATURE` |
| Owner for Follow-up | PM / Analyst / BE / FE / Security |
| Required Revisions | Lock referral qualification, referral status timeline, phase 3 write scope, tenant-switch contract |
| Suggested Delivery Strategy | 2-track phased delivery |
| Earliest Safe Next Step | Tulis 2 PRD terpisah sesuai clarification terbaru |

**Recommended delivery split:**

### Track A — Referral Subscription System
**Phase 1**
- 1 company = 1 active referral code
- creator dibatasi ke billing-authorized role
- referral status list untuk referrer
- onboarding-linked approval status visible
- reward policy dikunci terhadap approval/subscription milestone
- superAdmin config global reward months

**Phase 2**
- multiple codes / campaign labels
- pending reward credit
- referral analytics dashboard
- anti-fraud scoring lanjut

### Track B — SuperAdmin Global Company Access
**Phase 1**
- company list/search
- new company badge/banner
- owner display
- approve onboarding company

**Phase 2**
- impersonation / tenant switch
- read-only mode
- visible banner
- audit log

**Phase 3**
- scoped write mode
- quick admin action seperti change permission

**Recommended implementation ownership:**
- Referral core: `payment-service`
- Company approval/list source: `company-service`
- Session switch / impersonation: `auth-service` + `api-gateway`
- FE admin shell: `apps/omnichannel` new `super-admin` lane

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | User bisa membuat kode referral | Perlu entity referral code + creator RBAC | BE / RBAC / UI | Pending | Pending |
| FR-02 | Referrer melihat status pasca onboarding | Perlu referral status model yang terkait company approval | BE / UI / Integration | Pending | Pending |
| FR-03 | Referrer mendapat tambahan subscription | Bisa reuse extension logic subscription, tapi butuh reward ledger | Billing / Financial | Pending | Pending |
| FR-04 | Referee mendapat subscription gratis | Harus lewat payment lifecycle existing | Billing / API | Pending | Pending |
| FR-05 | SuperAdmin phase 1 company list/search + approve | Perlu company admin portal surface | FE / API / Company | Pending | Pending |
| FR-06 | SuperAdmin phase 2 impersonation read-only | Harus lewat tenant switch, bukan bypass global | Security / Auth / RBAC | Pending | Pending |
| FR-07 | SuperAdmin phase 3 write mode | Harus dibatasi per action dan diaudit | Security / Mutation | Pending | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial assessment created | Hermes |
| 2026-06-22 | Recommendation locked to split referral lane vs super-admin lane | Hermes |
| 2026-06-22 | Updated with referral onboarding-status visibility and phased superAdmin scope | Hermes |
