# Assessment Report: GA4 Monthly User Visit for SatuInbox

> **Assessment Type:** Type 1 — Feature Development Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `User request in chat: implement Google Analytics snippet to show MUV / monthly user visit in SatuInbox`
> **Assessment Artifact Path:** `Assessments/cross-domain/ga4-monthly-user-visit/ga4-monthly-user-visit-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-19
> **Status:** Superseded

---

## 0. Ringkasan Perubahan Analisa

- Initial version.
- Belum ada implementasi Google Analytics terdeteksi di FE repo.
- Keputusan awal: boleh lanjut sebagai discovery + implementation prep, tetapi definisi metric dan tracking scope harus diputuskan dulu.

---

## 1. Overview

**Feature / Issue:**
Implementasi Google Analytics 4 pada SatuInbox untuk membaca metrik bulanan yang saat ini disebut user sebagai “MUV / monthly user visit”.

**Objective:**
Menentukan apa saja yang harus disiapkan sebelum memasang Google Analytics snippet ke SatuInbox agar hasil metrik valid, tidak bocor PII, dan tidak rancu dengan analytics internal SatuInbox.

**Business Context:**
SatuInbox sudah memiliki analytics internal produk pada route `apps/omnichannel/app/[locale]/(main)/statistic/` dan API `/api/analytics/`, tetapi itu adalah product analytics internal, bukan web analytics GA4. Implementasi GA4 akan menambah lapisan analytics eksternal berbasis page/event tracking.

**Scope In:**
- Persiapan implementasi GA4 pada `apps/omnichannel`
- Persiapan implementasi GA4 pada `apps/widget`
- Definisi metric bulanan: visits vs unique users
- Privacy, consent, dan anti-PII guardrail
- Penentuan injection point, env var, dan event baseline

**Scope Out:**
- Implementasi code final
- Dashboard Looker Studio / BigQuery detail
- Tag Manager server-side
- Multi-touch attribution marketing
- Billing/commercial reporting berbasis tenant

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Implementasi GA4 di SatuInbox dapat dilanjutkan, tetapi belum boleh langsung dipasang hanya berdasarkan snippet `gtag('config', 'G-...')`. Tim harus lebih dulu memutuskan apa arti “MUV” di konteks SatuInbox, app surface mana yang dihitung, dan aturan privacy/PII yang berlaku.

### 2.2 Required Actions Before Development

- [ ] Putuskan definisi metric: **Monthly Visits (sessions)** atau **Monthly Unique Users/Visitors (users)**.
- [ ] Putuskan scope tracking: **dashboard agent (`apps/omnichannel`)**, **widget customer (`apps/widget`)**, **marketing/public site**, atau kombinasi.
- [ ] Putuskan apakah internal staff / dev / staging traffic harus dikecualikan.
- [ ] Siapkan Measurement ID GA4 per stream/surface.
- [ ] Tetapkan policy: **no email, no phone, no message content, no contact name** ke GA.
- [ ] Tentukan apakah consent banner / consent mode wajib secara legal untuk domain yang ditrack.

### 2.3 Key Blocking Reasons / Conditions

- Istilah “MUV” masih ambigu: bisa berarti **visits**, **sessions**, **total users**, atau **active users**.
- SatuInbox punya dua permukaan berbeda: dashboard internal agent dan widget customer-facing.
- Data session auth mengandung identitas user/organization; tanpa guardrail bisa berisiko mengirim PII ke GA.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Medium
- **Risk Level:** Medium
- **Primary Impact Areas:** UI, Reporting, Integration, Security/RBAC, Operational

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Tim wajib menentukan apakah target metric adalah monthly visits/sessions atau monthly unique users/visitors. | User request + GA4 metric definition need |
| BR-02 | Tracking harus dipisahkan per app surface: dashboard internal dan widget/public tidak boleh otomatis dicampur tanpa keputusan analitik. | FE structure `apps/omnichannel`, `apps/widget` |
| BR-03 | PII tidak boleh dikirim ke GA4, termasuk email, nomor telepon, nama contact, isi pesan, dan token. | Privacy requirement + GA4 best practice |
| BR-04 | Implementasi harus memakai env var / config, bukan hardcoded Measurement ID di banyak file. | FE maintainability |
| BR-05 | Harus ada baseline page tracking dan, jika dibutuhkan, custom events untuk business journey. | GA4 implementation need |
| BR-06 | Jika consent diwajibkan, tag analytics harus mengikuti consent state sebelum firing penuh. | Google privacy / consent guidance |

### 3.2 Acceptance Criteria

- Ada keputusan eksplisit tentang arti metrik bulanan yang ingin dibaca.
- Ada keputusan eksplisit tentang domain/app surface yang ditrack.
- Ada daftar event minimum dan parameter yang boleh dikirim.
- Tidak ada PII yang dikirim ke GA4.
- Measurement ID tersimpan di environment config.
- Tracking tervalidasi via GA DebugView / Tag Assistant sebelum production rollout.

### 3.3 Assumptions

- Target awal adalah FE web tracking, bukan app native.
- User saat ini baru meminta persiapan implementasi, belum meminta code final.
- GA4 menjadi tool utama, bukan pengganti analytics-service internal SatuInbox.

### 3.4 Clarifications Needed

- Apakah “monthly user visit” yang dimaksud adalah **traffic user ke website/widget** atau **agent usage ke dashboard**?
- Apakah dashboard internal mau dihitung sebagai product adoption metric?
- Apakah per-tenant breakdown dibutuhkan di GA4?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- Tidak ditemukan referensi `gtag`, `googletagmanager`, `google analytics`, atau `GoogleAnalytics` pada FE repo.
- Root injection point yang paling masuk akal saat ini:
  - `apps/omnichannel/app/[locale]/layout.tsx`
  - `apps/widget/app/[locale]/layout.tsx`
- Dashboard internal memakai layout utama di `apps/omnichannel/app/[locale]/(main)/layout.tsx`.
- SatuInbox sudah punya analytics internal pada route statistik dan service `/api/analytics/`; ini berbeda dari GA4 web analytics.
- Session auth FE membawa data user yang sensitif secara analitik: `id`, `email`, `fullName`, `organization`, `role`, `phone` melalui NextAuth options file `apps/omnichannel/app/api/auth/[...nextauth]/authOption.ts`.
- Ada service privacy policy update di FE (`services/privacy/action-update-privacy-policy.service.ts`), tetapi belum ada bukti implementasi consent banner/cookie consent untuk GA.

### 4.2 Proposed State (To-Be)

- Tambah GA4 config terpusat berbasis env var, misalnya terpisah untuk dashboard dan widget.
- Pasang Google tag di root layout sesuai surface yang dipilih.
- Gunakan wrapper helper/provider untuk:
  - init dataLayer
  - fire page_view
  - fire custom events terpilih
  - set user properties non-PII bila dibutuhkan
- Pisahkan stream/property bila dashboard internal dan widget customer ingin diukur terpisah.
- Terapkan consent/privacy policy jika domain atau region mewajibkan.
- Validasi tracking via DebugView/Tag Assistant sebelum production.

### 4.3 State Transition / Data Flow Notes

`Browser page/app route` → `GA init in root layout` → `page_view + enhanced measurement/custom events` → `GA4 property / stream` → `GA reports (Users, Active Users, Sessions, Views)`

Jika butuh user context:

`NextAuth session` → `sanitized analytics mapper` → `non-PII user_properties/custom dimensions` → `GA4`

Guardrail wajib:

`session.email / phone / fullName / message content` **must never flow to GA4**.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Tambah analytics tag/provider dan helper tracking | `apps/omnichannel`, `apps/widget`, root layouts | MEDIUM | Buat wrapper tunggal agar tidak sebar snippet di banyak file |
| Database | Tidak wajib untuk basic GA4 | Tidak ada DB internal yang harus berubah | LOW | Jika nanti butuh consent audit/internal config, baru pertimbangkan BE/DB |
| API | Tidak wajib untuk basic page tracking | API internal tidak perlu berubah | LOW | Jika ingin server-side measurement atau tenant config, definisikan fase lanjutan |
| UI/UX | Bisa perlu cookie banner/notice | Layout global, footer/privacy area | MEDIUM | Tentukan legal/privacy policy dulu |
| Security / RBAC | Risiko kirim PII dari session ke GA | NextAuth session, user context mapping | HIGH | Buat allowlist field aman; jangan kirim email/phone/name/message text |
| Performance | Tambah third-party script | Initial page load, runtime tracking | LOW | Lazy/defer loading, minimal custom events |
| Integration | Integrasi dengan GA4 property/stream, consent mode, possibly cross-domain | Google Tag, admin GA, domain setup | MEDIUM | Pisahkan env per environment dan per surface |
| Reporting / Analytics | Potensi salah tafsir metric “MUV” | Dashboard/report business | HIGH | Lock definisi metric sebelum implementasi |
| Financial / Operational | Tidak ada dampak billing inti, tetapi bisa memengaruhi keputusan produk jika metric salah | PM/Product reporting | MEDIUM | Dokumentasikan metric glossary |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Omnichannel dashboard tracking | `apps/omnichannel/app/[locale]/layout.tsx` | UI root injection | Dashboard → Layout | Kandidat utama pasang global tag |
| Dashboard authenticated event enrichment | `app/api/auth/[...nextauth]/authOption.ts` session shape | Auth/session context | Dashboard → Auth | Sanitasi ketat sebelum jadi analytics property |
| Widget tracking | `apps/widget/app/[locale]/layout.tsx` | UI root injection | Widget → Layout | Untuk customer/public visits |
| Widget livechat journey events | `apps/widget/app/[locale]/livechat/layout.tsx` | UI + interaction events | Widget → Livechat | Relevan bila ingin track widget open/start conversation |
| Privacy handling | privacy policy service/module | Operational / legal | Tracking → Privacy | Belum bukti consent mode/banner |
| Internal product analytics | `/api/analytics/`, route `/statistic/` | Reporting coexistence | GA ↔ internal analytics | Jangan campur definisi metric |

### 6.2 Shared Resources / Event Mapping

- Shared global layout menjadi titik injeksi paling aman.
- Shared auth session adalah sumber risiko utama PII leakage.
- Shared reporting vocabulary perlu dijaga agar “GA visits/users” tidak disalahartikan sebagai KPI internal statistik agent.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Tim mengira “MUV” = sessions, padahal bisnis butuh unique users | High | High | High | Tulis glossary metric dan lock definisi sebelum dev |
| R-02 | Dashboard agent dan widget customer tercampur dalam satu stream | Medium | High | High | Pisahkan stream/property atau wajib custom dimension surface |
| R-03 | Email/phone/fullName ikut terkirim ke GA | Medium | Critical | Critical | Sanitized mapper + no-PII review + QA network verification |
| R-04 | Staging/dev traffic mencemari production data | High | Medium | High | Env-specific Measurement ID + domain filters |
| R-05 | Tracking tidak akurat di SPA route changes | Medium | Medium | Medium | Verifikasi page_view/history change via DebugView |
| R-06 | Legal/privacy issue karena consent belum diatur | Medium | High | High | Putuskan consent mode/policy sebelum prod |
| R-07 | PM membaca metric GA sebagai pengganti analytics-service internal | Medium | Medium | Medium | Bedakan use case: traffic analytics vs operational analytics |

### 7.2 Worst-Case Scenarios

- Data GA production penuh noise karena dev/staging/internal staff ikut tercatat.
- PII user/contact terkirim ke Google Analytics.
- Product decision salah karena metric yang dibaca ternyata sessions, bukan unique users.
- Dashboard internal dan widget customer tidak bisa dibedakan saat reporting bulanan.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Tag hanya aktif pada environment dan surface yang disetujui.
- `page_view` terkirim saat initial load.
- `page_view`/history-based tracking bekerja saat route berubah.
- Custom events hanya mengirim parameter allowlisted.
- Measurement ID yang benar terpakai per environment.

### 8.2 Regression Scope
- Layout global tidak rusak setelah injeksi script.
- Auth/session flow NextAuth tidak terganggu.
- Widget loading dan socket connect tidak terganggu.
- Route progress/provider existing tidak bentrok dengan analytics init.

### 8.3 Integration Scope
- DebugView menerima event dari dashboard/widget.
- Consent update memengaruhi firing behavior jika consent mode dipakai.
- Cross-domain behavior tervalidasi jika ada multi-domain flow.

### 8.4 UAT / Business Validation
- PM dapat membaca report bulanan dan membedakan metric Users vs Sessions.
- PM dapat membedakan dashboard agent traffic vs widget/public traffic.
- Internal staff filtering/exclusion tervalidasi.

### 8.5 Automation Candidates
- Smoke check presence of GA script by environment.
- Network assertion bahwa `page_view` terkirim saat page load/route change.
- Assertion bahwa parameter terlarang (email/phone) tidak pernah muncul pada analytics payload.

---

## 9. Production Safety

- **Rollback Strategy:** matikan via env/config flag atau hapus injection wrapper dari root layout.
- **Feature Toggle Requirement:** disarankan, minimal env-based enable/disable untuk dashboard dan widget secara terpisah.
- **Backward Compatibility Notes:** basic GA4 tidak harus mengubah API/DB existing.
- **Staged Rollout Recommendation:** mulai dari satu surface dulu, idealnya widget/public atau satu dashboard stream terpisah.
- **Monitoring / Alerting Needs:** DebugView, Tag Assistant, sampled live verification setelah release.
- **Logging / Audit Gaps:** belum ada bukti consent audit/internal analytics config log untuk GA changes.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | “MUV” yang dimaksud apakah Sessions, Total Users, atau Active Users? | Menentukan apakah report bulanan valid | Yes |
| OQ-02 | Surface mana yang mau dihitung: dashboard internal, widget, marketing site, atau semuanya? | Menentukan injection point dan stream strategy | Yes |
| OQ-03 | Apakah internal agent/staff traffic harus dihitung atau dikecualikan? | Mengubah interpretasi KPI adoption vs external traffic | Yes |
| OQ-04 | Apakah per-tenant / per-organization breakdown dibutuhkan di GA? | Menentukan custom dimension vs tool lain | No |
| OQ-05 | Apakah consent mode wajib untuk domain ini? | Menentukan kebutuhan legal/UI/cookie flow | Yes |
| OQ-06 | Apakah ingin satu stream gabungan atau stream terpisah per app surface? | Menentukan struktur pelaporan dan noise control | Yes |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Secara teknis, implementasi GA4 di FE SatuInbox relatif sederhana karena titik injeksi global sudah jelas.
- Risiko utamanya bukan coding, tetapi definisi metric dan privacy.
- Jika tujuan utamanya adalah **traffic/customer visits**, GA4 lebih cocok dipasang di widget/public surface.
- Jika tujuan utamanya adalah **agent product adoption**, dashboard internal bisa ditrack, tetapi hasilnya harus dibaca sebagai internal product usage, bukan customer traffic.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / Analyst / FE |
| Required Revisions | Definisikan metric glossary, tracking surface, privacy guardrail, consent requirement |
| Suggested Delivery Strategy | Phase split |
| Earliest Safe Next Step | Additional discovery + mini PRD/implementation note |

**Suggested phase split:**
1. **Phase 1 — Discovery**: lock metric definition, scope surface, privacy rule.
2. **Phase 2 — Basic Tracking**: page_view + enhanced measurement pada surface terpilih.
3. **Phase 3 — Custom Events**: login success, widget open, start conversation, broadcast/template usage, dll jika benar-benar dibutuhkan.

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | Tampilkan metric bulanan dari GA4 | Metric masih ambigu; harus lock definisi Users vs Sessions | Reporting | Pending | Pending |
| FR-02 | Pasang GA4 ke surface relevan | Root layout dashboard/widget siap jadi injection point | UI/Integration | Pending | Pending |
| FR-03 | Aman dari PII leakage | Session auth mengandung field sensitif | Security | Pending | Pending |
| FR-04 | Data production bersih | Env dan stream separation wajib | Operational | Pending | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-19 | Initial assessment created | Hermes |
