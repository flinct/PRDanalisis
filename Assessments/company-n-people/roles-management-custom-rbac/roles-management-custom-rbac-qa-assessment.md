# Assessment Report: Roles Management & Custom RBAC

> **Assessment Type:** Type 1 — Feature Development Analysis  
> **Owner:** Analyst  
> **Source PRD / Source Input:** `PRD/Company n people/PRD Setting - Role management.md`  
> **Assessment Artifact Path:** `Assessments/company-n-people/roles-management-custom-rbac/roles-management-custom-rbac-qa-assessment.md`  
> **Version:** `v1.2`  
> **Previous Version:** `Assessments/company-n-people/roles-management-custom-rbac/versions/roles-management-custom-rbac-qa-assessment-v1.1.md`  
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`  
> **Reference Context:** `Memory/global-memory.md`, `Assessments/reference/contact-context-visibility.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`  
> **Tanggal Analisa:** 2026-06-22  
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Revisi dari v1.1 dengan tambahan **owner-ceiling-aware role authoring** yang berasal dari governance superAdmin.
- Menambahkan constraint bahwa tenant-side role editor hanya boleh menampilkan permission milik owner company dan save di atas owner ceiling wajib diblok.
- Menandai bahwa perubahan role management sekarang bergantung pada **company permission governance** lintas PRD, bukan hanya role CRUD lokal.
- Keputusan tetap: **REVISE_PRD**.

---

## 1. Overview

**Feature / Issue:**  
Roles Management & Custom RBAC untuk create/edit/delete/duplicate role, default roles, grouped permission editor, visibility scope, dan data privacy masking.

**Objective:**  
Memberi admin editor role yang lebih mudah dipahami tanpa harus mengelola raw permission keys secara manual, sambil tetap menjaga keamanan, konsistensi scope akses, dan governance lintas modul.

**Business Context:**  
Current product sudah punya role-sensitive behavior di Conversation, Ticket, Contacts, Analytics, Broadcast, Leads, Team Inbox, dan Settings. Karena itu perubahan RBAC editor akan mempengaruhi **runtime authorization**, **data visibility**, **masking**, **session refresh**, **query scoping**, **auditability**, dan sekarang juga **owner-ceiling-aware authoring constraints** di banyak modul sekaligus.

**Scope In:**
- Custom role CRUD.
- Edit default role tertentu.
- Grouped permission UI.
- Visibility scope per modul.
- Data privacy mode untuk phone/email.
- Audit log perubahan role.
- Propagasi role ke member yang sudah assigned.
- Hidden permission options berdasarkan owner ceiling.
- Block save untuk permission di atas owner ceiling.

**Scope Out:**
- Per-user permission override.
- Conditional policy by channel/tag/time.
- External IAM / SSO / SCIM.
- Field-level policy generic beyond current grouped model.
- Cross-workspace role template sharing.

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `REVISE_PRD`

**Decision Class:** `NO_GO`

**Decision Statement:**
> Arah feature ini benar dan bernilai tinggi, tetapi belum aman untuk langsung dibawa ke versi berikutnya karena masih ada gap mendasar pada contract enforcement, migration, scope resolution, permission propagation, owner-ceiling filtering, middleware/gateway authorization choke point, dan privacy masking lintas-surface. Tanpa penguncian kontrak tersebut, risiko access leak, stale permission, privilege drift, partial update, dan regression lintas service terlalu besar.

### 2.2 Required Actions Before Development

- [ ] Kunci **single source of truth** untuk mapping `UI permission group -> raw permission keys -> effective runtime resolver`.
- [ ] Definisikan **effective permission resolution order**: role -> module scope -> team inbox membership -> assignment state -> area scope -> data privacy -> suspension/tenant state.
- [ ] Tambahkan **API / event contract** untuk role CRUD, role assignment change, audit emission, `roleUpdated` propagation, session refresh/invalidation, dan permission cache invalidation.
- [ ] Putuskan secara eksplisit apakah permission di-**embed di token**, diambil **realtime**, atau memakai **hybrid snapshot + refresh policy**.
- [ ] Tambahkan **migration plan** untuk existing roles, existing members, default-role baseline, permission key drift, dan fallback kalau ada unknown permission.
- [ ] Definisikan **server-side masking contract** untuk phone/email di UI, API response, search, export, audit view, notification payload, dan socket events.
- [ ] Tambahkan **service ownership matrix** agar jelas mana concern People, Auth, API Gateway, Company/Team, Channel/Contacts, dan FE Settings.
- [ ] Koreksi metadata PRD agar sesuai konvensi workspace: **Product Manager = Dany Christian**, **Engineering Lead = Naftal Yunior**.
- [ ] Kunci contract **owner ceiling -> visible permission options -> blocked save behavior** agar FE filtering dan BE validation memakai source of truth yang sama.
- [ ] Definisikan handling untuk **legacy role data** yang masih menyimpan permission di atas owner ceiling.

### 2.3 Key Blocking Reasons / Conditions

- Belum ada kontrak tegas untuk propagation permission ke session aktif.
- Belum ada definisi migration/backfill untuk role lama dan member lama.
- Scope visibility baru belum dipetakan final ke model existing Conversation/Ticket/Contacts/Analytics.
- Data privacy masking masih terlalu UI-oriented; belum jelas enforcement server-side di semua surface.
- PRD belum mendefinisikan failure mode untuk permission mapping drift, dependency rule drift, dan partial update lintas service.
- Enforcement choke point pada **API Gateway / authorization middleware / guard layer** belum dijelaskan.
- Belum ada definisi tegas bagaimana hidden-option filtering FE dan block-save BE tetap sinkron terhadap owner ceiling.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Critical
- **Risk Level:** Critical
- **Primary Impact Areas:** Backend / API / UI / RBAC / Database / Auth / Gateway / Contacts / Analytics / Ticket / Conversation / Audit / Migration / Integration

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Workspace harus selalu punya 3 default roles: Admin, Supervisor, Agent. | PRD Section 5, US-003; FR-001 |
| BR-02 | Admin tetap full access dan permission-nya tidak boleh diedit. | US-004; FR-006; FR-046 |
| BR-03 | Supervisor dan Agent boleh diedit permission matrix-nya. | US-005; FR-005 |
| BR-04 | Permission editor harus berbasis group/module, bukan raw permission keys. | US-006; FR-014–FR-017 |
| BR-05 | Visibility scope dan action permission harus dipisah. | US-007; FR-018–FR-030 |
| BR-06 | Dependency rules wajib divalidasi sebelum save. | US-008; FR-039–FR-045 |
| BR-07 | Privacy masking phone/email harus mengikuti role. | US-009; FR-035–FR-038 |
| BR-08 | Semua mutasi role harus tercatat di audit log. | US-013; FR-059–FR-061 |
| BR-09 | Tenant-side role editor hanya boleh menampilkan permission yang dimiliki company owner. | US-014; FR-050–FR-054 |
| BR-10 | Tenant-side save di atas owner ceiling harus diblok. | US-014; EH-013 |

### 3.2 Acceptance Criteria

- Role baru dapat dibuat, diedit, diduplikasi, dan dihapus sesuai guardrail.
- Default role tetap terlindungi.
- Permission invalid combination tidak bisa disimpan.
- Perubahan role diterapkan ke assigned members dengan latency yang terdefinisi dan mekanisme yang jelas.
- Masking phone/email berlaku konsisten di semua surface yang relevan.
- Permission yang tidak dimiliki owner company tidak boleh muncul di tenant-side editor.
- Payload stale yang mencoba menyimpan permission di atas owner ceiling harus gagal konsisten di backend.

### 3.3 Assumptions

- Model member saat ini adalah **single role per member**, bukan multi-role.
- Existing authorization runtime memakai permission resolver yang bisa diperluas tanpa redesign total auth stack.
- Existing feature scopes (conversation, ticket, contact, analytics) akan tetap memakai konsep team/assigned/queue, bukan diganti total.
- Company owner ceiling adalah governance input yang datang dari superAdmin lane, bukan dari tenant-side role settings.

### 3.4 Clarifications Needed

- Apakah satu member hanya boleh punya **satu role** di Phase 1?
- Apakah evaluasi permission final terjadi di **API Gateway**, **people-service**, atau hybrid token + service check?
- Apakah role change harus **force refresh** session/token atau cukup background refresh berbasis version bump?
- Apakah mode seperti `all_except_team` memang perlu di Phase 1, atau sebaiknya ditunda karena kompleksitas tinggi?
- Apakah Contacts akan mengikuti model `area scope + visibility scope` yang sudah ada di `contact-context-visibility.md`, atau PRD ini membuat abstraction baru?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- Product sudah memiliki role-sensitive behavior lintas modul.
- Canonical global memory saat ini mengenali pembatasan area/scope seperti Sales vs Operational dan Super Admin bypass.
- Contacts sudah punya requirement visibility server-side: `module permission -> area scope -> visibility scope -> team inbox -> data privacy masking`.
- Backend arsitektur menggunakan **CASL** di `people-service`; tidak ada standalone `rbac-service` meski env RBAC DB key ada.
- **API Gateway adalah satu-satunya public surface** dan sudah berperan pada validation, AuthN/AuthZ, dan routing.
- FE punya `proxy.ts` permission middleware dan memakai `role.permissions` untuk conditional render / route guard, sehingga FE juga ikut terkena dampak walau bukan source of truth.
- `people-service` memegang users/members/roles, sedangkan ownership `teams / shifts / org structures` lebih dekat ke `company-service` menurut reference architecture.
- PRD Member existing masih menyatakan akses page `Anggota tim` admin-only; integrasi dengan custom role granularity belum dijelaskan.

### 4.2 Proposed State (To-Be)

- Admin mengelola role dari grouped editor.
- Role menjadi source konfigurasi visibility + action + privacy masking.
- Default roles tetap ada, tetapi Supervisor/Agent dapat diubah.
- Runtime authorization lintas modul harus membaca hasil resolver role baru secara konsisten.
- Session, guard, cache, dan scoped query harus ikut sinkron saat role berubah.

### 4.3 State Transition / Data Flow Notes

- **Role create/edit/delete** bukan hanya write ke People/Role data, tetapi memicu perubahan ke member assignment, permission cache/session state, UI menu visibility, endpoint guard result, query scoping, dan data masking.
- **Role update** harus diperlakukan sebagai change pada governance policy, bukan sekadar settings form.
- **Data privacy** tidak boleh berhenti di FE label; harus ikut mempengaruhi source response, export, search hit rendering, audit visibility, dan realtime payload.
- Jika propagation antar service/event gagal sebagian, sistem bisa jatuh ke state berbahaya: role tersimpan, tetapi enforcement lama masih aktif.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Settings Roles, Member Settings, Invite Member, Conversation, Ticket, Contacts, Broadcast, Analytics, Leads | Semua modul yang memakai role/scope/masking | HIGH | Wajib relation note lintas modul + regression matrix per modul |
| Database | Role schema, permission matrix storage, default-role baseline, role assignment history, audit payload | People/role persistence dan referensi member | HIGH | Tambahkan schema/versioning plan dan fallback untuk unknown permission |
| API | Role CRUD, role assignment update, permission refresh, audit event, list/detail filters | API Gateway + people-service + consumer modul | HIGH | Definisikan endpoint, request/response, versioning, dan error contract |
| UI/UX | Role editor, member role selector, menu visibility, disabled state, masking state | Settings FE dan seluruh surface terproteksi | HIGH | UI hanya refleksi; enforcement utama tetap server-side |
| Security / RBAC | Authorization resolution, least privilege, default-role protection, tenant isolation | Seluruh protected action | HIGH | Resolver tunggal + contract tests + deny-by-default untuk unknown permission |
| Performance | Permission resolution, scoped query filtering, cache invalidation | Request path di modul-modul high traffic | MEDIUM | Permission snapshot/versioning dan scoped cache design |
| Integration | Session/auth, WebSocket updates, audit logging, export/reporting | Auth flow, audit-service, realtime payload, analytics | HIGH | Event contract + permission version bump + socket payload review |
| Reporting / Analytics | Visibility mode analytics dan export access | Statistics pages, CSV/export, dashboard cards | HIGH | Definisikan apakah analytics scope agregat boleh team/self; hindari cross-team leakage |
| Financial / Operational | Salah konfigurasi role bisa block operasional atau membuka data sensitif | Daily ops dan compliance | HIGH | Safe default, preview impact, warning on assigned-member count |

### 5.1 Service-Level Impact Matrix

| Service / Layer | Impact | Level | Kenapa penting | Notes / Correction |
|---|---:|---|---|---|
| People Service | 5 | Critical | Menjadi source of truth untuk role, member-role relation, permission schema, default role logic | Masukan user valid. Ini pusat perubahan struktural RBAC. |
| Auth Service | 5 | Critical | Mengontrol JWT/session/cache dan enforcement freshness saat runtime | Masukan user valid. Keputusan token vs realtime fetch sangat menentukan behavior. |
| API Gateway / Authorization Middleware / Guard Layer | 5 | Critical | Semua request publik lewat sini; ini choke point untuk decode token, inject context, authorize endpoint/module/action/scope | Ini tambahan penting. Lebih tepat diposisikan sebagai **layer enforcement**, bukan service terpisah. |
| Conversation Service | 4 | High | Visibility inbox, assign/claim, reply, close, scoped query | Masukan user valid. Scope mismatch di sini langsung terasa ke operasional harian. |
| Ticket Service | 4 | High | Queue, claim, return-to-queue, resolve/reassign, dependency-heavy workflow | Masukan user valid. Ticket punya dependency rule paling rawan drift. |
| Management Settings + FE Permission Middleware | 4 | High | Entry point editor role, grouping/toggle/dependency UI, route/menu visibility | Masukan user valid, tapi tetap bukan source of truth. |
| Channel / Client Contact Surface | 4 | High | Privacy masking phone/email, contact list/detail/picker, response payload | Ini tambahan dari assessment: user input belum menyorot service/surface contact secara cukup eksplisit. |
| Company / Team / Team Inbox Dependency | 3 | Medium | Team membership, shift/team references, excluded team scope, queue/team visibility | Concern user valid, tetapi ownership teknis lebih dekat ke cross-service dependency, bukan murni subdomain People. |

### 5.2 Middleware / Choke-Point Impact Notes

- Sebelum custom RBAC, authorization bisa lebih sederhana: authenticated vs not authenticated.
- Setelah custom RBAC, layer enforcement harus mengecek **module enabled**, **action allowed**, **visibility scope**, dan kemungkinan **data privacy mode**.
- Karena API Gateway adalah public choke point, bug di layer ini dapat menghasilkan dua failure mode berbahaya:
  - **over-authorize** → akses terbuka terlalu luas.
  - **over-deny** → workflow operasional patah walau role valid.

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Roles Management UI | people-service role model | API sync | UI -> BE | CRUD role dan permission mapping source of truth |
| Member Management | Roles Management | Lifecycle / API | Member -> Role | Ubah role member harus ikut refresh effective access |
| Conversation access | Role scope + team membership + assignment | Shared state / query scope | Runtime -> Resolver | Scope baru harus match current convo nav semantics |
| Ticket access | Role scope + queue/assigned/team logic | Shared state / query scope | Runtime -> Resolver | `claim`, `return_to_queue`, `assigned_plus_queue` perlu rule final |
| Contacts visibility | Role + area scope + masking | Shared policy | Runtime -> Resolver | Sudah punya evaluation order sendiri di feature memory |
| Analytics access | Role scope + team/company scope | Query scope | Runtime -> Resolver | Agregat analytics rawan data leak jika scope ambigu |
| Broadcast / Leads / Settings | Role action flags | API guard | Runtime -> Resolver | Perlu mapping yang stabil dan terdokumentasi |
| Audit logging | Role mutation events | Async event | Role -> Audit | Wajib old/new matrix diff |
| Session/Auth | Permission refresh / invalidation | Auth/session | Role -> Session | Harus lock apakah token refresh, version bump, atau force logout |
| Team / Team Inbox dependency | Team membership + excluded team selectors | Cross-service data dependency | Runtime -> Resolver | Wajib clear ownership antara People vs Company/Team domain |

### 6.2 Shared Resources / Event Mapping

- Shared resolver untuk permission/mode/scope.
- Shared member identity + team inbox membership.
- Shared menu visibility dan route guard FE.
- Shared audit/event pipeline.
- Shared search/export/report surfaces yang berpotensi membocorkan data jika masking hanya di FE.
- Event propagation minimal yang perlu dipikirkan: `role.created`, `role.updated`, `role.deleted`, `member.role.changed`, `permission.version.bumped`.

### 6.3 Cross-Service Failure Modes

- **Permission sync issue:** People sudah update role, Auth/Gateway masih baca cache lama.
- **Broken dependency rules:** UI valid tetapi backend invalid, atau sebaliknya.
- **Partial update:** role tersimpan, tetapi member snapshot / auth cache / route guard belum ikut refresh.
- **Delete role issue:** role terhapus, member masih refer ke role lama.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Role diubah tetapi session aktif masih punya permission lama (stale access) | High | Critical | Critical | Permission versioning + token/session refresh policy + integration test multi-tab |
| R-02 | Masking hanya diterapkan di FE, tetapi API/export/socket masih mengirim data full | Medium | Critical | Critical | Enforce masking server-side + audit/export regression suite |
| R-03 | Mapping grouped UI ke raw permission keys drift dari implementasi backend | Medium | High | High | Single mapping registry + contract test + fail-closed |
| R-04 | Migration existing role/member salah sehingga user kehilangan akses atau dapat akses berlebih | Medium | Critical | Critical | Dry-run migration + diff report + rollback plan |
| R-05 | Visibility mode ambigu (`all_except_team`, queue/team/self) menghasilkan query scope tidak konsisten | High | High | High | Simplify Phase 1 scope atau lock explicit resolver truth table |
| R-06 | Default role display name diubah dan mencampur identity logical role vs cosmetic label | Medium | High | High | Pakai immutable internal role slug/key + editable display label terpisah |
| R-07 | Concurrent edit antar admin menimpa perubahan tanpa sadar | Medium | Medium | Medium | Optimistic locking/version field + conflict UI |
| R-08 | Team inbox dihapus/berubah tapi role masih refer ke scope lama | Medium | Medium | Medium | Referential validation + invalid state review queue |
| R-09 | Role update sukses di People tetapi gagal propagate ke Auth/Gateway cache | High | Critical | Critical | Event-driven propagation + retry mechanism + observability per hop |
| R-10 | Dependency rules diverge antara FE Settings dan backend validator | High | High | High | Backend-only source of truth; FE hanya refleksi/preview |
| R-11 | Bug di authorization middleware / guard membuat request salah di-allow atau salah di-deny | Medium | Critical | Critical | Gateway contract tests + shadow validation + deny-by-default policy |

### 7.2 Worst-Case Scenarios

- Agent memperoleh akses data client full karena masking leak di export/API/socket.
- Supervisor/Agent kehilangan akses runtime karena migration baseline salah.
- Conversation/Ticket queue semantics rusak karena permission scope tidak match current view model.
- Session lama tetap bisa mengakses endpoint sensitif setelah role diturunkan.
- Middleware/gateway salah inject context sehingga semua downstream service menerima authorization context yang salah.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Role create/edit/delete/duplicate.
- Default role protection.
- Dependency validation.
- Member role reassignment.
- Phone/email masking per role.
- Menu visibility + direct URL block.
- Permission behavior di gateway/guard layer untuk module/action/scope.

### 8.2 Regression Scope
- Member settings.
- Invite member flow.
- Conversation list/room/detail access.
- Ticket list/detail/queue/claim flows.
- Contacts list/detail/picker.
- Analytics pages and exports.
- Broadcast, Leads, Settings subsections.
- Audit log creation.
- FE proxy / menu guard consistency.

### 8.3 Integration Scope
- Role mutation -> session refresh/invalidation.
- Role mutation -> route guard + API guard alignment.
- Role mutation -> scoped query results.
- Role mutation -> socket/live update payload visibility.
- Role mutation -> audit event persistence.
- Role mutation -> event propagation retry path.
- Old token vs new token behavior setelah role downgrade/upgrade.

### 8.4 UAT / Business Validation
- Admin membuat role operasional baru tanpa bantuan engineering.
- Supervisor custom role tetap bisa melihat data sesuai team scope.
- Agent custom role tidak bisa melihat full phone/email.
- Role downgrade user aktif langsung membatasi akses.
- Role delete yang masih dipakai member selalu diblok sebelum ada reassignment.

### 8.5 Automation Candidates
- Default role protection.
- Stale session invalidation / refresh.
- Contacts masking across list/detail/search/export.
- Ticket queue permission matrix.
- Direct URL/API denial consistency.
- Gateway authorization matrix per role/scope.

---

## 9. Production Safety

- **Rollback Strategy:** simpan backup role matrix dan member-role assignment sebelum migration; rollback harus bisa restore role baseline + session policy.
- **Feature Toggle Requirement:** ya, untuk editor UI dan runtime resolver migration path.
- **Backward Compatibility Notes:** existing raw permission keys tidak boleh putus; grouped UI hanyalah abstraction di atas permission lama atau versioned permission registry.
- **Staged Rollout Recommendation:** internal sandbox -> selected tenant -> wider rollout.
- **Monitoring / Alerting Needs:** unauthorized spikes, 403 spikes, masking mismatch alerts, role save failure, permission resolution errors, propagation retry failure, permission-version mismatch.
- **Logging / Audit Gaps:** perlu log structured untuk role diff, affected member count, session invalidation result, permission resolver fallback, dan propagation hop result (People -> Auth/Gateway).

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Apakah model Phase 1 single-role-per-member atau multi-role? | Mengubah total desain resolver dan UI | Yes |
| OQ-02 | Di mana resolver efektif dijalankan: token claim, API Gateway, people-service, atau hybrid? | Menentukan contract, performance, cache, dan consistency | Yes |
| OQ-03 | Bagaimana policy refresh session saat role berubah? | Menentukan stale-permission risk | Yes |
| OQ-04 | Apakah `all_except_team` benar-benar dibutuhkan di Phase 1? | Scope ini paling rawan ambiguity dan regression | Yes |
| OQ-05 | Apakah masking berlaku juga untuk export, webhook, audit UI, search result, dan socket payload? | Privacy leak risk | Yes |
| OQ-06 | Bagaimana migration existing roles, existing members, dan unknown permissions dilakukan? | Menentukan release safety | Yes |
| OQ-07 | Apakah default role name editable hanya display label atau identity logical role juga berubah? | Mencegah semantic drift | Yes |
| OQ-08 | Bagaimana role ini berinteraksi dengan Contact area scope (operational/sales) yang sudah punya rule sendiri? | Mencegah konflik model RBAC | Yes |
| OQ-09 | Siapa owner final untuk team/team-inbox visibility dependency: People, Company, atau shared resolver? | Menentukan boundary service dan source of truth | Yes |
| OQ-10 | Bagaimana middleware/gateway membaca permission: embedded snapshot, cache lookup, atau service call? | Menentukan latency, stale risk, dan failure mode | Yes |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Feature ini menyentuh **governance layer** aplikasi, jadi tidak cukup dinilai sebagai settings page.
- Existing PRD sudah cukup kuat di level UX/editor, tetapi belum cukup kuat di level **runtime contract**.
- Masukan baru soal **People/Auth/Gateway choke point** valid dan justru memperkuat alasan kenapa feature ini belum aman di-`PROCEED`.
- Gap paling kritis ada di permission enforcement, migration, privacy, middleware/gateway authorization, dan consistency lintas service/surface.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `REVISE_PRD` |
| Owner for Follow-up | PM / Analyst / FE / BE / Cross-team |
| Required Revisions | Tambahkan API/event contract, migration plan, session refresh policy, privacy enforcement contract, scope resolver truth table, service ownership matrix, dan metadata correction |
| Suggested Delivery Strategy | Split menjadi Phase 1A (role editor + stable mapping + protected defaults + People/Auth/Gateway contract) dan Phase 1B (expanded scope models + advanced exclusions + broader masking surfaces) |
| Earliest Safe Next Step | PRD revision + design/engineering alignment workshop |

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-018–FR-023 | Visibility scope per module | Resolver truth table belum final dan berpotensi conflict dengan existing scope model | RBAC / Query scope | Pending | Open |
| FR-025 | Action row mapping to backend permission keys | Belum ada single source of truth mapping registry + drift risk tinggi | Mapping / API / FE-BE consistency | Pending | Open |
| FR-035–FR-038 | Phone/email privacy masking | Belum ada contract server-side lintas API/export/socket/search | Privacy / Security | Pending | Open |
| FR-039–FR-045 | Dependency rules | Rule belum cukup lengkap untuk semua queue/team/assigned permutations dan ownership validator belum jelas | Validation / Ticket / Conversation | Pending | Open |
| FR-050–FR-053 | Immediate inheritance to assigned members | Session invalidation / refresh mechanism belum didefinisikan | Auth / Runtime access | Pending | Open |
| FR-054–FR-056 | Auditability | Event contract dan diff payload belum didefinisikan | Audit / Compliance | Pending | Open |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-22 | Initial assessment created (v1.0) | Hermes |
| 2026-06-22 | Revised with service-level impact analysis, gateway/middleware choke-point analysis, and corrected team dependency framing (v1.1) | Hermes |
