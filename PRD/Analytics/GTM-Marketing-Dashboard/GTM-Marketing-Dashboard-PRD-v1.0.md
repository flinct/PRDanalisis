# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: GTM Marketing Dashboard — Phase 1: UTM Attribution & Registration Funnel  
**Product Manager**: Dany Christian  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: TBD  

---

## **1. Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-08-13 | Dany Christian | Initial PRD — Phase 1: UTM attribution capture on registration + dashboard display. |

---

## **2. Overview**

| Item | Description |
|------|-------------|
| Purpose | SatuInbox tidak punya visibilitas terhadap sumber asal user yang mendaftar. Tanpa UTM tracking, keputusan alokasi budget marketing dilakukan secara blind. Feature ini menambahkan marketing source attribution pada proses registrasi dan menampilkannya di dashboard. |
| Scope | Phase 1: UTM capture di registration flow, penyimpanan di Auth schema, aggregation endpoint, dan dashboard page. |
| Key Capabilities | 1) Capture `utm_source`, `utm_campaign`, `utm_content` dari URL saat user mendaftar. 2) Simpan attribution data di Auth document. 3) Aggregation query: group by source → campaign → content, hitung register count. 4) Dashboard page dengan tabel + filter tanggal. |
| Outcome | Marketing team dapat melihat campaign mana yang menghasilkan registrasi terbanyak, sehingga bisa mengoptimasi alokasi budget. |

### **Scope Definition**

| In Scope | Out of Scope |
|----------|-------------|
| UTM parameter capture (`utm_source`, `utm_campaign`, `utm_content`) | Sales/Lead module integration — tidak relevan untuk scope ini |
| `marketingSource` embedded field di Auth schema | Shipping/ongkir tracking — tidak relevan untuk SaaS |
| Register API contract change (optional UTM fields) | Request Demo flow — future addition (Phase 3) |
| Aggregation endpoint di analytics-service | External ad platform integration (Google/Meta Ads API) — Phase 2 |
| Dashboard page: tabel Source \| Campaign \| Content \| Register Count | Conversion API upload (feed conversions balik ke ad platforms) |
| Date range filter di dashboard | Multi-touch attribution model — Phase 1 pakai last-touch |
| Empty state handling | Cost per lead, impressions, clicks — butuh external API (Phase 2) |

---

## **3. Problem Statement**

| ID | Problem | Impact |
|----|---------|--------|
| PS-001 | SatuInbox tidak memiliki UTM tracking pada registration flow. Tidak ada field yang mengaitkan user ke sumber marketing. | Marketing tidak tahu campaign mana yang efektif. Budget dialokasikan tanpa data. |
| PS-002 | Tidak ada halaman yang menampilkan data registrasi per marketing source. | Management tidak punya visibility terhadap ROI per channel. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
|-----------|-----------|
| Setiap registrasi baru memiliki marketing source attribution | 100% registrasi setelah go-live memiliki `marketingSource` field (atau null untuk direct/organic tanpa UTM) |
| Marketing team dapat melihat distribusi registrasi per source | Dashboard menampilkan tabel dengan group by source → campaign → content + register count |
| Data dapat difilter berdasarkan rentang tanggal | User dapat pilih date range dan melihat data yang sesuai |

---

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|-------------------|
| US-001 | P0 | As a **marketing team member**, I want to see how many registrations came from each ad source (Google Ads, Meta Ads, TikTok, Organic) so that I can evaluate campaign effectiveness. | 1. Given user membuka dashboard, When halaman load, Then tabel menampilkan baris per kombinasi source/campaign/content dengan register count. 2. Given tidak ada data UTM, When filter aktif, Then baris "organic/direct" ditampilkan dengan count yang sesuai. |
| US-002 | P0 | As a **marketing team member**, I want to filter the dashboard by date range so that I can analyze performance per period. | 1. Given dashboard terbuka, When user pilih start date dan end date, Then tabel menampilkan data hanya untuk registrasi dalam rentang tersebut. 2. Given user tidak memilih date range, When halaman load, Then default menampilkan data 30 hari terakhir. |
| US-003 | P0 | As a **system**, I want to capture UTM parameters from the registration URL and store them with the auth record so that attribution data is persisted. | 1. Given user mengakses `/register?utm_source=google_ads&utm_campaign=search_kw&utm_content=text_brand`, When user submit registrasi, Then Auth document memiliki `marketingSource: { source: "google_ads", campaign: "search_kw", content: "text_brand" }`. 2. Given user mengakses `/register` tanpa UTM params, When user submit registrasi, Then `marketingSource` tidak di-set (null/undefined). |
| US-004 | P1 | As a **marketing team member**, I want to see a summary KPI strip above the table showing total register and breakdown per source so that I can get a quick overview. | 1. Given dashboard terbuka, When data tersedia, Then KPI strip menampilkan: Total Register, Top Source name + count, jumlah source unik. 2. Given filter date range aktif, When data berubah, Then KPI strip ter-update sesuai filter. |
| US-005 | P1 | As a **marketing team member**, I want the table to show "—" or 0 for combinations with no data so that the table structure is always consistent. | 1. Given source "tiktok_ads" memiliki 0 registrasi di range tertentu, When tabel di-render, Then baris tetap muncul dengan count 0 atau baris tidak muncul (tergantung filter "show zero" toggle). |

---

## **6. Functional Requirements**

| Category | Requirements |
|----------|-------------|
| **UTM Capture — FE** | FR-001 [P0]: FE registration page MUST parse `utm_source`, `utm_campaign`, `utm_content` dari URL query parameters saat halaman `/register` di-load. FR-002 [P0]: FE MUST menyimpan UTM params di `sessionStorage` saat halaman load (bukan localStorage — sessionStorage lebih aman per-tab). FR-003 [P0]: FE MUST mengirim UTM params sebagai optional fields di payload registrasi. FR-004 [P0]: Jika UTM params tidak ada di URL atau sessionStorage, FE MUST mengirim registrasi tanpa UTM fields (backward compatible). |
| **UTM Capture — BE** | FR-005 [P0]: `RegisterRequest` proto/interface MUST ditambah optional fields: `utmSource?: string`, `utmCampaign?: string`, `utmContent?: string`. FR-006 [P0]: Auth schema MUST ditambah embedded field `marketingSource` dengan tipe `{ source: string, campaign: string, content: string, capturedAt: Date }`. Field ini optional — registration tanpa UTM tetap berhasil. FR-007 [P0]: auth-service `register()` method MUST menyimpan `marketingSource` dari request ke Auth document jika field tersedia. FR-008 [P1]: `marketingSource` values MUST di-trim dan lowercase untuk konsistensi aggregation. |
| **Aggregation — BE** | FR-009 [P0]: analytics-service MUST menyediakan endpoint `GET /api/v1/marketing/dashboard` yang menerima query params `startDate` dan `endDate` (ISO date string). FR-010 [P0]: Endpoint MUST mengembalikan array of `{ source, campaign, content, registerCount }` yang di-group dari Auth collection. FR-011 [P0]: Query MUST filter by `companyId` (tenant isolation) berdasarkan user context yang sedang login. FR-012 [P1]: Endpoint MUST mengembalikan summary: `totalRegisters`, `topSource`, `uniqueSources`. FR-013 [P1]: Default date range: 30 hari terakhir jika `startDate`/`endDate` tidak di-specify. |
| **Dashboard — FE** | FR-014 [P0]: Dashboard page MUST menampilkan tabel dengan kolom: Source, Campaign, Content, Register Count. FR-015 [P0]: Data di tabel MUST di-group: baris pertama per source (summary), baris kedua per campaign (nested di bawah source), baris ketiga per content (nested di bawah campaign). FR-016 [P0]: Dashboard MUST menyediakan date range picker. FR-017 [P1]: Dashboard MUST menampilkan KPI strip: Total Register, Top Source + count, jumlah unique sources. FR-018 [P1]: Tabel MUST di-sort descending by register count (source level). |
| **Access & RBAC** | FR-019 [P0]: Dashboard hanya dapat di-akses oleh user dengan role Admin atau Super Admin. FR-020 [P1]: Data yang ditampilkan MUST ter-scope by companyId dari user yang login (tenant isolation). |
| **Backward Compatibility** | FR-021 [P0]: Registrasi yang terjadi sebelum feature ini go-live TIDAK memiliki `marketingSource`. Aggregation query MUST meng-handle dokumen tanpa `marketingSource` sebagai "Untracked" source. FR-022 [P0]: Registrasi tanpa UTM params (direct access, organic) MUST tetap berhasil tanpa error. |

---

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
|----|------|---------|-------|
| EH-001 | Validation — invalid UTM value | Jika UTM value mengandung karakter non-printable atau > 500 chars, trim ke 500 chars dan strip non-printable. Tidak reject registration. | Tidak ada UI impact — silent normalization. |
| EH-002 | Runtime — aggregation timeout | Jika aggregation query timeout (> 5s), return error 503 dengan message "Data sedang dimuat, coba beberapa saat lagi." | FE menampilkan error toast + retry button. |
| EH-003 | Runtime — empty result | Jika tidak ada data di date range yang dipilih, return empty array. | Tabel menampilkan empty state: "Belum ada data registrasi pada periode ini." |
| EH-004 | Permission — unauthorized | Jika user bukan Admin/Super Admin, return 403. | FE redirect ke dashboard utama atau tampilkan "Akses ditolak". |

---

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
|----|----------|-------------------|-------|
| EC-001 | User mendaftar tanpa UTM params di URL | `marketingSource` tidak di-set. Dokumen Auth tetap created normal. | N/A — tidak ada impact ke user. |
| EC-002 | User mendaftar dengan hanya sebagian UTM params (misal `utm_source` saja, tanpa `utm_campaign`) | Simpan yang ada. `utmCampaign` dan `utmContent` null/undefined. | Aggregation menampilkan "—" untuk campaign/content yang null. |
| EC-003 | UTM params sangat panjang (> 500 chars) | Truncate ke 500 chars, strip non-printable. | Silent. |
| EC-004 | Banyak registrasi dari source yang sama dalam waktu singkat (bot/spam) | Aggregation menghitung semua — tidak ada bot filter di Phase 1. | Data mungkin inflated. Note: bot filter adalah Phase 2 concern. |
| EC-005 | Date range sangat besar (> 1 tahun) | Query tetap jalan tapi mungkin lambat. | Loading indicator. Jika timeout, tampilkan EH-002. |
| EC-006 | User refresh halaman `/register` (UTM params hilang dari sessionStorage) | sessionStorage persist per-tab selama tab belum ditutup. Jika tab ditutup dan dibuka baru, UTM hilang — registrasi dianggap organic. | Tidak ada UI impact. |
| EC-007 | Pre-go-live registrations tidak punya `marketingSource` | Aggregation menampilkan baris "Untracked" untuk dokumen tanpa `marketingSource`. | Baris "Untracked" di tabel. |

---

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
|-----------|-------------|---------|----------------------|
| **GTM Dashboard Page** | Halaman baru di bawah route `/statistic/marketing` | User navigasi ke Statistic → Marketing. Halaman load data berdasarkan default 30 hari. | US-001, US-002, US-004 |
| **Date Range Picker** | Two-input date picker (start + end) di atas tabel | User pilih tanggal, data otomatis refresh. | US-002 |
| **KPI Strip** | 3 kartu: Total Register, Top Source + count, Unique Sources | Auto-update saat filter berubah. | US-004 |
| **Attribution Table** | Tabel dengan kolom: Source, Campaign, Content, Register Count | Data di-group bertingkat (source → campaign → content). Sort descending by count. | US-001, US-005 |
| **Empty State** | Tampil ketika tidak ada data di range yang dipilih | Illustration + text "Belum ada data registrasi pada periode ini." + button "Reset filter". | US-001 |
| **Loading State** | Skeleton loader saat data fetching | Skeleton bars mengikuti layout tabel. | — |

### **Navigation Placement**

Dashboard GTM Marketing ditempatkan di **halaman Super Admin** (bukan halaman Statistic regular).

Path: `/super-admin/marketing-dashboard` (atau sesuai routing super admin yang sudah ada).

Hanya dapat diakses oleh Super Admin role.

---

## **10. Field & Validation**

### **10.1 New Fields — Auth Schema (BE)**

| Field | Type | Example | Validation | Required | Default |
|-------|------|---------|-----------|----------|---------|
| `marketingSource.source` | `string` (max 500 chars) | `"google_ads"` | Trim, lowercase, strip non-printable | No (optional embedded) | `undefined` |
| `marketingSource.campaign` | `string` (max 500 chars) | `"search_shipper_kw"` | Trim, lowercase, strip non-printable | No | `undefined` |
| `marketingSource.content` | `string` (max 500 chars) | `"text_brand"` | Trim, lowercase, strip non-printable | No | `undefined` |
| `marketingSource.capturedAt` | `Date` | `"2026-08-13T10:00:00Z"` | Auto-set saat registration | Auto | `new Date()` |

### **10.2 Changed Fields — RegisterRequest Proto (BE)**

| Field | Type | Example | Validation | Required | Default |
|-------|------|---------|-----------|----------|---------|
| `utmSource` | `string?` | `"google_ads"` | Optional, max 500 chars | No | `undefined` |
| `utmCampaign` | `string?` | `"search_shipper_kw"` | Optional, max 500 chars | No | `undefined` |
| `utmContent` | `string?` | `"text_brand"` | Optional, max 500 chars | No | `undefined` |

### **10.3 Aggregation Response Shape (BE API)**

```typescript
interface MarketingDashboardResponse {
  summary: {
    totalRegisters: number;
    topSource: string | null;
    uniqueSources: number;
  };
  data: Array<{
    source: string;        // "google_ads" | "meta_ads" | "tiktok_ads" | "organic" | "Untracked"
    campaign: string;      // "search_shipper_kw" | "—" 
    content: string;       // "text_brand" | "—"
    registerCount: number;
  }>;
}
```

---

## **11. Non-Functional Requirements**

| Category | Requirement |
|----------|-------------|
| Performance | Aggregation query MUST return within 3 seconds for 30-day range dengan < 100K auth records. |
| Performance | Dashboard page MUST render initial load within 2 seconds (skeleton → data). |
| Security | Endpoint MUST ter-isolasi by `companyId` (tenant isolation). Data company A tidak boleh terlihat oleh company B. |
| Security | Dashboard hanya accessible oleh Admin / Super Admin role. |
| Privacy | UTM params adalah non-PII (campaign metadata). Tidak ada PII tambahan yang disimpan. |
| Observability | Aggregation query MUST logged dengan query execution time. Jika > 5s, log warning. |
| Backward Compatibility | `marketingSource` field optional — existing Auth documents tanpa field ini tetap valid. Registration tanpa UTM params tetap berjalan normal. |

---

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
|--------------------|-------|--------|-----------|
| Auth schema change — embed `marketingSource` | BE | Schema additive, backward compatible. Tidak perlu migration. | Optional field, existing documents unaffected. |
| RegisterRequest proto change | BE + FE | API contract berubah (tambah optional fields). | Optional fields — consumer yang tidak kirim UTM tetap compatible. |
| Analytics-service aggregation | BE | Service perlu query Auth collection lintas service (analytics → auth DB). | Gunakan direct MongoDB connection dari analytics-service ke auth database, atau buat aggregation di auth-service dan expose via gRPC. |
| FE registration page change | FE | Tambah URL parsing + sessionStorage logic. | Minimal change — 1 utility function + 2 lines di registerSubmit. |
| Bot/spam traffic | Product | Data mungkin inflated tanpa bot filter. | Phase 1 accept risk. Bot filter di Phase 2. |
| Pre-go-live data gap | Product | Dashboard kosong untuk data sebelum go-live (hanya "Untracked"). | Accept — data akan terisi secara natural seiring waktu. Backfill dari existing Auth.createdAt sebagai "Untracked" di Phase 1. |

---

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
|-----|--------|-------------|------------|
| Registrasi dengan attribution | > 80% registrasi baru memiliki `marketingSource` setelah UTM dipasang di semua campaign URLs | 30 hari post go-live | Auth collection — count where `marketingSource` exists |
| Dashboard adoption | Marketing team membuka dashboard minimal 1x/minggu | Per bulan | Page view analytics |
| Campaign optimization | Setidaknya 1 keputusan budget reallocation berdasarkan data dashboard | 60 hari post go-live | Manual — PM confirmation |

---

## **14. Future Considerations**

| Topic | Why It Matters Later |
|-------|---------------------|
| **Phase 2 — External Ad Platform Integration** | Pull cost/impressions/clicks dari Google Ads API dan Meta Ads API. Tambah kolom Cost, CPL, Impressions, Clicks di dashboard. Perlu OAuth2 setup + developer token. |
| **Phase 2.5 — Conversion API Upload** | Feed conversion data balik ke Google/Meta via Conversion API. Tanpa ini, ad platform optimization tetap blind. Perlu `gclid`/`fbclid` capture. |
| **Phase 3 — Request Demo** | Tambah "Request Demo" form/action. Dashboard dapat kolom "Request Demo" count. |
| **Phase 3 — Multi-touch Attribution** | User bisa punya > 1 attribution record (multi-device, retargeting). Perlu model: first-touch, last-touch, atau linear. |
| **Bot Filter** | Filter bot/spam registration dari attribution data. |
| **TikTok Ads Integration** | TikTok Marketing API paling mudah (no review). Tambah sebagai source. |

---

## **15. Limitations**

| Limitation | Impact |
|-----------|--------|
| Hanya menangkap 3 UTM params (`source`, `campaign`, `content`). `utm_medium` dan `utm_term` tidak di-capture di Phase 1. | Dashboard tidak bisa filter by medium (cpc, social, email). Dapat ditambah di Phase 2. |
| UTM params hilang jika user menutup tab dan membuka tab baru untuk register. sessionStorage per-tab. | Sebagian traffic mungkin masuk "Untracked" meskipun sebenarnya dari campaign. |
| Tidak ada bot filter. | Data mungkin inflated oleh bot registration. |
| Pre-go-live data hanya bisa di-tag sebagai "Untracked". | Historical data tidak bisa di-attribusi retroactively. |
| Aggregation query langsung ke Auth collection. Belum ada materialized view atau caching. | Untuk volume > 100K records, perlu optimasi index atau cache layer. |

---

## **16. Appendix**

### **Glossary**

| Term | Definition |
|------|-----------|
| UTM (Urchin Tracking Module) | Parameter URL yang digunakan untuk melacak sumber traffic marketing. Format: `?utm_source=X&utm_campaign=Y&utm_content=Z`. |
| Attribution | Proses mengaitkan registrasi/user ke sumber marketing asal. |
| Organic | Traffic yang datang tanpa UTM params — direct access, search engine, atau referral tanpa campaign tag. |
| CPL (Cost Per Lead) | Biaya per lead/register. Formula: total spend / total registers. Phase 2. |

### **Assumptions**

| ID | Assumption |
|----|-----------|
| A-001 | Marketing team akan memasang UTM params di SEMUA campaign URLs (Google Ads, Meta Ads, TikTok Ads) sebelum atau saat go-live. Tanpa UTM di URL campaign, data tidak ter-capture. |
| A-002 | SatuInbox registration page adalah satu-satunya entry point untuk new user registration. Jika ada entry point lain (API, invite), UTM tidak ter-capture di entry point tersebut. |
| A-003 | Analytics-service punya akses ke Auth collection MongoDB (direct atau via gRPC). |

### **Open Questions**

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| OQ-01 | Aggregation di auth-service langsung atau analytics-service? Direct DB access vs gRPC? | BE | Open |
| OQ-02 | Apakah perlu `utm_medium` di Phase 1? User belum request tapi ini field standar UTM. | PM | Open |
| OQ-03 | Page di Super Admin — sesuaikan routing super admin yang sudah ada. | FE | Open |
| OQ-04 | Untuk Google/Meta Ads — credentials per-tenant atau single global account? | PM | Open (Phase 2) |

---

## **17. Phase 2 — Ad Platform Connection & Internal Event Tracking**

> Section ini mendeskripsikan Phase 2 yang menghubungkan dashboard dengan data eksternal (Google Ads, Meta Ads) dan data internal SatuInbox (owner registered, member registered, subscription).

### **17.1 Problem**

Phase 1 hanya menampilkan Register Count dari data internal. Dashboard belum bisa menampilkan:
- **Spend/Cost** — berapa budget yang dihabiskan per campaign
- **Impressions/Clicks** — berapa orang melihat dan mengklik iklan
- **CPL** — cost per lead = spend ÷ register
- **Internal events** — owner registration, member invitation, subscription creation sebagai funnel stages

### **17.2 Scope Phase 2**

| In Scope | Out of Scope |
|----------|-------------|
| Google Ads API integration — pull campaign spend, impressions, clicks | Conversion API upload (feed conversions balik ke ad platforms) |
| Meta Ads API integration — pull campaign spend, impressions, clicks | TikTok Ads API (opsional, bisa ditambah mudah) |
| Ads credential management page di Super Admin | Multi-touch attribution model |
| Cron job daily sync ad performance data | Real-time sync (daily polling cukup) |
| Internal event tracking: Owner Registered, Member Registered, Subscription Created | — |
| Dashboard: tambah kolom Spend, CPL, Impressions, Clicks | — |
| Dashboard: tambah baris/kartu internal event counts | — |

### **17.3 Ad Platform Connection Flow**

```
Super Admin → Settings → Ad Platform Credentials
  → Masukkan Google Ads credentials (Developer Token + OAuth2)
  → Masukkan Meta Ads credentials (System User Token + Ad Account ID)
  → Credentials disimpan encrypted (reuse pattern ShippingCredential)
  → Cron job harian: pull data → simpan ke ads_performance collection
  → Dashboard query join ads_performance + auths by campaign name
```

### **17.4 Google Ads API Setup**

| Item | Detail |
|------|--------|
| API | Google Ads API v17+ (REST: `googleads.googleapis.com`) |
| Auth | OAuth2 (web app) + Developer Token + MCC Account ID |
| Approval | Developer Token: 1-2 hari (test access), berminggu (standard access) |
| Endpoint | `POST /v17/customers/{customerId}/googleAds:searchStream` |
| Data pulled | `campaign.id`, `campaign.name`, `metrics.impressions`, `metrics.clicks`, `metrics.cost_micros`, `segments.date` |
| Env vars | `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID` (MCC) |
| Rate limit | 15,000 ops/day (Basic), 1,500,000 ops/day (Standard) |

**GAQL Query:**
```sql
SELECT campaign.id, campaign.name, campaign.status,
  metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions,
  segments.date
FROM campaign
WHERE segments.date BETWEEN '{startDate}' AND '{endDate}'
  AND campaign.status != 'REMOVED'
```

### **17.5 Meta Ads API Setup**

| Item | Detail |
|------|--------|
| API | Meta Marketing API v21.0 (`graph.facebook.com/v21.0`) |
| Auth | System User Token (Business Manager → System Users → Generate Token with `ads_read` scope) |
| Approval | App Review: `ads_read` permission (1-7 hari) |
| Endpoint | `GET /v21.0/act_{ad_account_id}/insights` |
| Data pulled | `campaign_name`, `impressions`, `clicks`, `spend`, `actions`, `date_start` |
| Env vars | `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_PIXEL_ID` |
| Rate limit | ~200 calls/user/hour (varies) |

**Insights Query:**
```
GET /v21.0/act_{ad_account_id}/insights
  ?fields=campaign_name,adset_name,impressions,clicks,spend,actions
  &level=ad
  &time_increment=1
  &time_range={"since":"{startDate}","until":"{endDate}"}
```

### **17.6 Ads Performance Collection (BE)**

```typescript
// New: apps/analytics-service/src/app/schemas/ads-performance.schema.ts

@Schema({ timestamps: true })
export class AdsPerformance extends Document {
  @Prop({ required: true, index: true }) companyId: Types.ObjectId;
  @Prop({ required: true, index: true }) organizationId: Types.ObjectId;
  @Prop({ required: true, index: true }) platform: string;       // 'google_ads' | 'meta_ads' | 'tiktok_ads'
  @Prop({ required: true }) campaignId: string;                   // platform-specific campaign ID
  @Prop({ required: true, index: true }) campaignName: string;    // should match utm_campaign value
  @Prop({ required: true, index: true }) date: string;            // 'YYYY-MM-DD'
  @Prop({ default: 0 }) impressions: number;
  @Prop({ default: 0 }) clicks: number;
  @Prop({ default: 0 }) spend: number;                            // in IDR (Rupiah)
  @Prop({ default: 0 }) conversions: number;
}

AdsPerformanceSchema.index({ companyId: 1, platform: 1, date: -1 });
AdsPerformanceSchema.index({ companyId: 1, campaignName: 1, date: -1 });
```

### **17.7 Credential Management (BE)**

Reuse `company-service/ShippingCredential` pattern:

```typescript
// New: apps/analytics-service/src/app/schemas/ad-platform-credential.schema.ts

@Schema({ timestamps: true })
export class AdPlatformCredential extends Document {
  @Prop({ required: true, index: true }) companyId: Types.ObjectId;
  @Prop({ required: true }) platform: string;               // 'google_ads' | 'meta_ads'
  @Prop({ required: true }) encryptedCredentials: string;   // AES-256 encrypted JSON
  @Prop({ default: true }) isActive: boolean;
  @Prop({ type: Date }) lastSyncAt: Date;
  @Prop({ type: String }) lastSyncStatus: string;           // 'success' | 'error'
  @Prop({ type: String }) lastSyncError: string;
}
```

### **17.8 Cron Job — Daily Sync**

```
Schedule: 0 2 * * * (setiap jam 02:00)
Flow:
  1. Query semua active AdPlatformCredential
  2. Per credential: decrypt → call platform API → fetch yesterday's data
  3. Upsert ke AdsPerformance collection (companyId + platform + campaignId + date)
  4. Update lastSyncAt + lastSyncStatus
  5. Jika error: log + update lastSyncError, retry next day
```

### **17.9 Internal Event Tracking**

Dashboard juga menampilkan data internal SatuInbox yang bukan dari ad platform:

| Internal Event | Source Collection | Query |
|---------------|-------------------|-------|
| **Owner Registered** | `auths` (where user creates company) | Count `auth.createdAt` grouped by date, filter where `companyId` created in same flow |
| **Member Registered** | `auths` (where user joins existing company via invite) | Count `auth.createdAt` where invitation flow, grouped by date |
| **Email Verified** | `auths` | Count where `emailVerifiedAt` exists, grouped by date |
| **Subscription Created** | `subscriptions` | Count `subscription.createdAt` grouped by date, where `subscriptionType = NEW_SUBSCRIPTION` |

Internal events ditampilkan sebagai section terpisah di dashboard, bukan di tabel ad attribution.

### **17.10 Dashboard Phase 2 — Tampilan yang Ditambah**

```
┌─────────────────────────────────────────────────────┐
│ KPI Strip (Phase 1 + Phase 2)                       │
│ Total Register │ Top Source │ Total Spend │ Avg CPL  │
├─────────────────────────────────────────────────────┤
│ Internal SatuInbox Metrics                          │
│ ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ Owner    │ Member   │ Email    │ Subs     │       │
│ │ Reg: 120 │ Reg: 340 │ Ver: 80% │ New: 45  │       │
│ └──────────┴──────────┴──────────┴──────────┘       │
├─────────────────────────────────────────────────────┤
│ Ad Attribution Table (existing + 2 kolom baru)      │
│ Source │ Campaign │ Content │ Register │Spend│ CPL  │
├─────────────────────────────────────────────────────┤
│ Charts (existing)                                    │
│ Doughnut (source dist) │ Line (weekly trend)         │
└─────────────────────────────────────────────────────┘
```

### **17.11 Dependencies — Phase 2**

| Dependency | Owner | Lead Time |
|-----------|-------|-----------|
| Google Ads Developer Token | Marketing / PM | **Mulai di Phase 1** — 1-2 hari test, berminggu standard |
| Meta App Review (`ads_read`) | Marketing / PM | **Mulai di Phase 1** — 1-7 hari review |
| OAuth2 flow implementation | BE | 3-5 hari per platform |
| Credential encryption | BE | Reuse ShippingCredential pattern, 1-2 hari |
| Cron job infra | BE / DevOps | RabbitMQ scheduler atau NestJS `@nestjs/schedule`, 1 hari |

### **17.12 Phase 2 User Stories**

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|-------------------|
| US-P2-001 | P0 | As a **super admin**, I want to connect Google Ads and Meta Ads accounts so that the dashboard can pull spend data. | 1. Given admin di Settings, When masukkan credentials, Then credentials tersimpan encrypted. 2. Given credentials valid, When cron job jalan, Then data berhasil di-pull dan tersimpan. |
| US-P2-002 | P0 | As a **marketing team member**, I want to see Spend and CPL columns alongside Register count so that I can evaluate cost effectiveness per campaign. | 1. Given Google Ads connected, When dashboard di-load, Then kolom Spend dan CPL terisi dari data Google Ads. 2. Given campaign tidak ada data spend, Then tampilkan "—". |
| US-P2-003 | P0 | As a **super admin**, I want to see internal SatuInbox metrics (Owner Registered, Member Registered, Email Verified, Subscription Created) so that I can track platform growth alongside marketing. | 1. Given dashboard di-load, Then section "Internal Metrics" menampilkan 4 kartu dengan data dari collection internal. |
| US-P2-004 | P1 | As a **super admin**, I want to see sync status per connected platform so that I know if data is fresh. | 1. Given Google Ads connected, When last sync sukses, Then tampilkan "Last sync: 2 jam lalu ✓". 2. Given sync gagal, Then tampilkan error + "Retry besok". |

---

## **18. Phase 3 — GA4 Web Analytics, Leads, ROAS/CAC**

> Section ini scope terluas: butuh GA4 property baru (belum pernah ada di SatuInbox), lead capture form baru, dan cross-collection join (ads spend × subscription revenue). Jangan mulai sebelum Phase 2 selesai — masing masing bagian di bawah independen, bisa dikerjakan paralel/terpisah.

### **18.1 Problem**

Phase 1+2 cover funnel Register→Verified→Subscription dan cost per-campaign (Spend, CPL). Belum bisa jawab:
- Berapa **visitor** yang datang ke landing page SatuInbox sebelum register? (funnel Visitor→Register→Leads)
- Berapa **Leads** (orang minta demo, belum daftar)?
- Berapa **Total/New/Active User** berbasis web traffic (GA4) — beda dari Register count?
- **ROAS** (revenue per rupiah spend) dan **CAC** (cost per paying customer) — bukan cuma cost per lead

### **18.2 Gap Ditemukan (grep FE repo)**

| Cek | Hasil |
|-----|-------|
| GA4/gtag.js terpasang di FE | ❌ **Tidak ada** — grep `gtag`, `googletagmanager`, `G-XXXXXXX` di seluruh `omnichannel-satuinbox-fe` nihil |
| Auth schema punya `lastLoginAt`/`lastActiveAt` | ❌ **Tidak ada** — schema hanya punya `createdAt`, `emailVerifiedAt` |
| Request Demo / lead capture form | ❌ **Tidak ada** — grep `RequestDemo`, `leadCapture` nihil di FE maupun BE |

Kesimpulan: Phase 3 bukan "tambah kolom dashboard" — perlu instrumentasi baru di 3 tempat berbeda.

### **18.3 Scope Phase 3 (3 sub-bagian independen)**

**A. GA4 Web Analytics**
| Item | Detail |
|------|--------|
| Setup | Buat GA4 property baru di Google Analytics, pasang `gtag.js` di landing page SatuInbox (bukan di app dashboard — app butuh login, GA4 buat visitor publik) |
| Metrik ditarik | `totalUsers`, `newUsers`, `activeUsers` (GA4 native — definisi GA4: session dalam 5 menit terakhir), `sessions`, `engagementRate` |
| API | GA4 Data API (`analyticsdata.googleapis.com`) — Service Account credential, bukan OAuth user |
| Funnel stage terisi | **Visitor** (dari GA4 `totalUsers`/`sessions` di halaman landing sebelum register) |

**B. Leads (Request Demo)**
| Item | Detail |
|------|--------|
| FE | Form baru "Request Demo" di landing page (bukan bagian register flow) — field minimal: nama, email, perusahaan, phone |
| BE | Collection baru `demo_requests` — **bukan sales module** (dari koreksi user sebelumnya: sales tidak relevan). Endpoint terpisah di analytics-service atau service baru kecil |
| UTM | Sama seperti register — capture `utm_source/campaign/content` dari URL saat submit form |
| Funnel stage terisi | **Leads** (Visitor → Register → Leads, sesuai urutan yang diminta user — dicatat sebagai alternate/parallel path ke Register, bukan strictly sequential) |

**C. ROAS & CAC (cross-collection join)**
| Item | Detail |
|------|--------|
| Prasyarat | Phase 2 selesai (`ads_performance.spend` per campaign harus ada) |
| Join | `ads_performance` (spend by campaign+date) ⋈ `auths.marketingSource` (siapa register dari campaign) ⋈ `subscriptions` (siapa bayar + `pricePerUnit`) |
| ROAS formula | `SUM(subscription revenue attributed to campaign) / SUM(ad spend campaign)` |
| CAC formula | `SUM(ad spend campaign) / COUNT(DISTINCT paying customer dari campaign itu)` |
| Limitation | Attribution model **last-touch** (keputusan Phase 1) — kalau user daftar dari Google Ads tapi upgrade subscription 3 bulan kemudian tanpa UTM baru, tetap di-attribute ke Google Ads original. Revenue jangka panjang (LTV) di luar scope. |

### **18.4 Active User — 2 Definisi Ditampilkan Terpisah**

Diputuskan tampilkan keduanya, bukan pilih salah satu — beda pertanyaan yang dijawab:

| Label di Dashboard | Sumber | Definisi |
|---|---|---|
| **Active User (Web)** | GA4 `activeUsers` | Orang yang buka website/landing page SatuInbox (visitor, belum tentu customer) |
| **Active User (Produk)** | Auth collection, field baru `lastLoginAt` | Customer yang benar-benar login ke aplikasi SatuInbox |

**FR baru:** Auth schema perlu tambah `@Prop({ type: Date }) lastLoginAt?: Date` — di-update setiap kali login sukses (auth-service login handler). Field kecil, dampak minim, tapi WAJIB untuk Active User (Produk) — tanpa ini datanya tidak ada sama sekali.

### **18.5 Dashboard Phase 3 — Tambahan Visual**

```
Visit Journey:  Visitor (GA4) → Register (Auth) → Leads (demo_requests)
                [dari 3 collection berbeda — tampil sbg 3-step funnel bar]

Ads Efficiency: Klik │ Impression │ CPM │ CTR │ CPR │ ROAS │ CAC │ Total Spend
                [8 metrik — 6 pertama dari Ads API langsung, ROAS+CAC dari join]

User Journey:   Total User (GA4) │ New User (GA4) │ Active User Web (GA4) │ Active User Produk (Auth.lastLoginAt)
```

### **18.6 Phase 3 User Stories**

| ID | Priority | User Story | Acceptance Criteria |
|----|----------|------------|-------------------|
| US-P3-001 | P0 | As a **marketing team**, I want to see Visitor count from GA4 before Register so that I understand top-of-funnel drop-off. | 1. Given GA4 property terpasang, When dashboard load, Then funnel menampilkan Visitor → Register → Leads dengan conversion % antar step. |
| US-P3-002 | P0 | As a **marketing team**, I want a Request Demo form separate from registration so that leads who aren't ready to sign up are still captured. | 1. Given user submit form Request Demo, Then data tersimpan di `demo_requests` dengan UTM attribution. 2. Given form di-submit tanpa UTM, Then tetap tersimpan tanpa marketingSource. |
| US-P3-003 | P1 | As a **marketing team**, I want to see ROAS and CAC per campaign so that I can evaluate real revenue efficiency, not just lead cost. | 1. Given campaign punya spend dan subscription revenue terhubung, When dashboard load, Then ROAS dan CAC dihitung dan ditampilkan. 2. Given campaign belum ada subscription terhubung, Then tampilkan "—" bukan 0 atau error. |
| US-P3-004 | P1 | As a **super admin**, I want to see both web-based and product-based Active User counts so that I can distinguish site traffic from real product usage. | 1. Given GA4 dan Auth.lastLoginAt tersedia, When dashboard load, Then dua kartu terpisah ditampilkan: "Active User (Web)" dan "Active User (Produk)". |

### **18.7 Dependencies & Effort — Phase 3**

| Dependency | Owner | Catatan |
|-----------|-------|---------|
| GA4 property + gtag.js di landing page | Marketing/FE | Property baru — belum pernah ada, mulai dari nol |
| GA4 Data API Service Account | BE/DevOps | Beda dari OAuth — service account credential, sekali setup |
| `demo_requests` collection + endpoint | BE | Service baru kecil ATAU tambahan endpoint di analytics-service — bukan sales-service |
| Request Demo form (FE) | FE | Komponen baru di landing page |
| `Auth.lastLoginAt` field + update di login handler | BE | Perubahan kecil, 1-2 jam — cek dulu apakah ada privacy/PDPA concern nyimpen histori login |
| ROAS/CAC aggregation query | BE | Query 3-way join, perlu index tambahan di `ads_performance.campaignName` + `auths.marketingSource.campaign` |

### **18.8 Terminology Correction (dari referensi Lincah report)**

| Istilah user | Istilah benar/klarifikasi |
|---|---|
| "CPM (cost per mail)" | **Cost Per Mille** — biaya per 1.000 impression, bukan "mail". Standar istilah ads industry. |
| "CAC (customer accutition cost)" | **Customer Acquisition Cost** — typo di brief, sudah dikoreksi di seluruh dokumen ini. |

---

### **References**

| Item | Path |
|------|------|
| Change Intake Brief | `Assessments/Analytics/gtm-marketing-dashboard/gtm-marketing-dashboard-change-intake-brief.md` |
| Analysis File | `Assessments/Analytics/gtm-marketing-dashboard/gtm-dashboard-analysis.md` |
| Auth Schema (BE) | `apps/auth-service/src/app/schemas/auth.schema.ts` |
| RegisterRequest Proto | `libs/proto-types/src/lib/auth.ts` (line 140) |
| Register Service (BE) | `apps/auth-service/src/app/app.service.ts` → `register()` |
| Register Form (FE) | `apps/omnichannel/components/molecules/register/RegisterForm.tsx` |
| useRegisterForm Hook | `apps/omnichannel/hooks/auth/useRegisterForm.ts` |
| Register Service Hook (FE) | `apps/omnichannel/services/useActionAuth.service.ts` → `useRegister()` |
| Statistic Page (FE) | `apps/omnichannel/app/[locale]/(main)/statistic/page.tsx` |
| HTML Mockup Reference | `gtm-marketing-dashboard__1_.html` (Ticket #2175 — Lincah, visual reference only) |
| Lincah Weekly Report Reference | `PRD/Analytics/GTM-Marketing-Dashboard/Reports - Lincah Summary Report.pdf` (template struktur report, bukan sumber data literal) |
