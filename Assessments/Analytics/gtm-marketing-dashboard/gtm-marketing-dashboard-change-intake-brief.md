# Change Intake Brief: GTM Marketing Dashboard

> **Artifact Type:** Change Intake Brief  
> **Source Request / BRD:** User request (2026-08-13) + image mockup (Source | Campaign | Content | Lead/Request Demo) + HTML reference (Ticket #2175 — Lincah GTM Marketing Dashboard)  
> **Artifact Path:** `Assessments/Analytics/gtm-marketing-dashboard/gtm-marketing-dashboard-change-intake-brief.md`  
> **Version:** `v1.0`  
> **Previous Version:** `none`  
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`  
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`, `Assessments/Analytics/gtm-marketing-dashboard/gtm-dashboard-analysis.md`  
> **Tanggal Intake:** 2026-08-13  
> **Status:** Draft

---

## 0. Ringkasan Update Brief

- Initial version — first intake for GTM Marketing Dashboard feature
- Scope: marketing source attribution on registration + display data in dashboard + external ad platform integration
- Out of scope: sales/Lead module, shipping/ongkir, Request Demo (future addition)
- Routing: ROUTE_NEW_PRD (no existing PRD, no existing implementation)

---

## 1. Request Snapshot

**Request Summary:** SatuInbox ingin membuat halaman GTM (Go-To-Market) Marketing Dashboard yang menampilkan data marketing attribution — sumber traffic (Google Ads, Meta Ads, TikTok Ads, Organic), campaign, content/creative, dan jumlah lead/register per kombinasi tersebut.

**Business Problem:** Saat ini SatuInbox tidak memiliki visibilitas terhadap sumber asal user yang mendaftar. Tidak ada UTM tracking, tidak ada attribution, tidak ada cara untuk mengetahui campaign mana yang menghasilkan registrasi terbanyak. Tanpa data ini, keputusan alokasi budget marketing dilakukan secara blind.

**Target User / Role / Stakeholder:**
- Marketing team — melihat performa campaign per platform
- PM / Management — melihat ROI per source
- Admin SatuInbox — mengkonfigurasi integrasi ad platform

**Expected Outcome:**
- Dashboard yang menampilkan: Source | Campaign | Content | Register Count (dan nanti: Request Demo)
- Data internal dari auth-service (register) yang sudah diberi attribution (utm_source, utm_campaign, utm_content)
- Integrasi dengan Google Ads dan Meta Ads API untuk menampilkan cost/impressions/clicks per campaign

**Urgency / Why Now:**
- Marketing spend tanpa attribution = waste. Butuh visibility untuk optimasi budget.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `NEW_FEATURE` |
| Primary Domain | `Analytics` (crosses Auth, Subscription) |
| Request Shape | Add |
| Initial Complexity Signal | Medium — Phase 1 (UTM capture + dashboard) Low, Phase 2 (external API) Medium-High |
| Needs Split? | Yes — 3 phases recommended |

### Classification Rationale
- Tidak ada PRD existing untuk marketing attribution atau GTM dashboard
- Tidak ada UTM tracking di codebase manapun (verified: zero hits on `utm_*` fields)
- Auth schema ada tapi tanpa source attribution — perlu field baru
- Subscription schema ada tapi tanpa source attribution
- Sales/Lead module **di-exclude** dari scope (user explicit: "jangan ambil dari modul sales, tidak relevan")
- Shipping/ongkir **di-exclude** dari scope (user explicit: "ongkir gausah masuk, ga relevan sama satuinbox")

---

## 3. Current State Verification

### 3.1 PRD Status
| Item | Finding |
|------|---------|
| Relevant existing PRD | **Tidak ada** — tidak ada PRD untuk marketing attribution, GTM dashboard, atau ad integration |
| PRD status | Not found |
| PRD treatment candidate | New PRD |

### 3.2 Implementation Status
| Surface | Finding | Evidence / Source |
|---------|---------|-------------------|
| FE | Not found — tidak ada halaman GTM/marketing dashboard | `Memory/CLAUDE-fe.md` — tidak ada route/marketing related |
| BE | Not found — tidak ada UTM fields, tidak ada marketing attribution collection | Verified: `grep -r "utm_source\|utm_campaign\|utm_content"` = zero hits across all services |
| Runtime / Current Behavior | Zero attribution. Auth registration hanya simpan `email, username, password, fullName, phone`. Subscription hanya simpan `companyId, packageId, status`. Tidak ada field yang mengaitkan user ke sumber marketing. | `apps/auth-service/src/app/app.service.ts` register() method, `apps/payment-service/src/app/schemas/subscription.schema.ts` |

### 3.3 Related Sources
- `Memory/global-memory.md`: Tidak ada mention marketing attribution
- `Memory/CLAUDE-be.md`: Auth service (port 50050), payment service, analytics service confirmed exist
- `Memory/CLAUDE-fe.md`: Widget app (port 3001), admin dashboard routes confirmed exist
- `Assessments/Analytics/gtm-marketing-dashboard/gtm-dashboard-analysis.md`: Full analysis file created in this session — data mapping, schema proposals, external API requirements

---

## 4. Scope Boundary

### 4.1 In Scope
- **Phase 1 — UTM Attribution Capture:**
  - Tambah `marketingSource` embedded field di Auth schema (source, campaign, content, capturedAt)
  - Capture UTM params dari URL di FE registration flow → pass ke register API → simpan di Auth doc
  - Tambah aggregation endpoint di analytics-service (group by source → campaign → content, count registers)
  - Dashboard FE: tabel Source | Campaign | Content | Register Count
- **Phase 2 — External Ad Platform Integration:**
  - Google Ads API integration (pull cost, impressions, clicks per campaign)
  - Meta Ads API integration (pull cost, impressions, clicks per campaign)
  - Dashboard: tambah kolom Cost, CPL (Cost per Lead), Impressions, Clicks
- **Phase 3 (future) — Request Demo:**
  - Tambah "Request Demo" action/form
  - Dashboard: tambah kolom Request Demo count

### 4.2 Out of Scope
- **Sales/Lead module** — user explicit: "jangan ambil dari modul sales, tidak relevan"
- **Shipping/ongkir** — user explicit: "ongkir gausah masuk, ga relevan sama satuinbox"
- **Paket Dibuat → Pickup → Delivered funnel** — shipping lifecycle tracking, tidak relevan untuk SaaS
- **TikTok Ads API** — Phase 1 & 2 focus Google + Meta dulu (TikTok opsional, paling mudah diintegrasikan nanti)
- **Conversion API upload** (feed conversions balik ke ad platforms) — future enhancement
- **Multi-touch attribution model** — Phase 1 pakai last-touch (sederhana), revisit nanti
- **Request Demo form/flow** — "bisa di tambahkan nanti" (user explicit)

### 4.3 Protected Existing Behavior
- Auth registration flow (`register()`) tidak boleh rusak — `marketingSource` adalah optional field, registration tanpa UTM tetap harus jalan
- Subscription creation flow tidak boleh terganggu
- Widget functionality tidak boleh terganggu
- Semua existing API contract tidak boleh berubah — ini additive only

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | Auth schema additive field only, no lifecycle change |
| RBAC / visibility / assignment | No | Dashboard visibility bisa pakai existing RBAC (Admin only initially) |
| API / webhook / socket / queue / cron | Yes | Register API contract berubah (tambah optional UTM params). Ads sync = new cron job. |
| SLA / reporting / export | Yes | Dashboard baru = reporting surface baru |
| Migration / rollback / feature flag | Low | `marketingSource` optional field, backward compatible. Tidak perlu migration. |
| Existing regression scope | Low | Registration flow regression test perlu update kalau API contract berubah |

### Early Blast-Radius Notes
- Auth register proto (`RegisterRequest`) perlu tambah optional UTM fields — ini backward compatible
- FE registration page perlu capture URL params — no BE change selain accept new fields
- analytics-service adalah service baru untuk marketing queries (atau tambah module di service existing)
- Ads API integration = service-side only, tidak affect existing user-facing behavior

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_NEW_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | PRD baru — GTM Marketing Dashboard |
| Can Proceed to PRD? | Yes — scope sudah cukup jelas untuk Phase 1. Phase 2 & 3 bisa di-PRD-kan terpisah atau dijadikan sections. |

### Routing Rationale
- Tidak ada PRD existing yang relevan
- Feature benar-benar baru: tidak ada UTM tracking, tidak ada marketing dashboard, tidak ada ad integration
- Scope sudah di-clarify: auth + subs data, exclude sales/shipping, phased approach
- Change class jelas: NEW_FEATURE
- Cukup matang untuk mulai PRD Phase 1

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner |
|----|----------------|----------------|-----------|-------|
| OQ-01 | Apakah `marketingSource` di-embed di Auth schema atau collection terpisah? | Mempengaruhi schema design dan aggregation query. Embed lebih simple, collection terpisah lebih flexible untuk multi-touchpoint. | No — bisa diputuskan saat PRD. Recommendation: embed di Auth untuk Phase 1 (ponytail). | PM + BE |
| OQ-02 | Dashboard baru halaman di admin panel SatuInbox, atau halaman terpisah? | Mempengaruhi routing FE dan auth. | No — default: halaman baru di admin panel. | PM + FE |
| OQ-03 | Untuk external API (Google/Meta Ads), credentials siapa yang dipakai? Per-tenant atau single global? | Per-tenant = setiap company punya ad accounts sendiri. Global = satu akun ads untuk semua. | Yes untuk Phase 2 design. Tidak blocking Phase 1. | PM |
| OQ-04 | Attribution model: first-touch atau last-touch? | Jika user register dari Google lalu revisit via Meta, siapa yang dapat credit? | No — default last-touch untuk Phase 1. | PM |
| OQ-05 | Request Demo flow seperti apa? Form? Button? Redirect? | Akan mempengaruhi schema dan tracking nanti. | No — out of scope Phase 1, revisit saat Phase 3. | PM |

---

## 8. Approval / Alignment Targets

| Target | Needed For | Status | Notes |
|--------|------------|--------|-------|
| PM (Dany Christian) | Scope lock, phase priority | Pending | Brief ini sedang dikirim ke PM |
| Engineering Lead (Naftal Yunior) | Technical direction — schema design, service placement | Pending | Perlu review embed vs separate collection |
| Marketing Stakeholder | Business intent — apa yang mau di-track, ad platform mana yang dipakai | Pending | Confirm Google + Meta priority, TikTok later |

---

## 9. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD | `PRD/Analytics/GTM-Marketing-Dashboard/` | source scope, phase breakdown, current-state baseline, OQ decisions |
| Assessment Report | `Assessments/Analytics/gtm-marketing-dashboard/` | impact flags, protected behavior, external API requirements |
| QA Pre-Implementation Review | `Assessments/Analytics/gtm-marketing-dashboard/` | impact flags, regression scope (auth register flow) |
| Automation Mapping | TBD | UTM capture → auth register → aggregation query traceability |

---

## 10. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-08-13 | Initial brief created — Phase 1/2/3 scope defined, 5 open questions | Dany Christian (via orchestrator analysis) |
