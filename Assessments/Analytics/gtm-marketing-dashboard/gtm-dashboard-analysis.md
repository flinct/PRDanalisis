# GTM Marketing Dashboard — Data & Integration Analysis
**Ticket #2175 | 2026-08-13**

---

## 1. Internal Data Mapping

### Funnel Stage → Existing Data Model

| Funnel Stage | Service | Collection | Key Fields | Status |
|---|---|---|---|---|
| **Register** | auth-service (port 50050) | `auths` + `users` | `Auth.createdAt`, `User.fullName`, `User.email`, `User.phone` | ✅ EXISTS |
| **Verified** | auth-service | `auths` | `Auth.emailVerified` (boolean), `Auth.emailVerifiedAt` (Date) | ✅ EXISTS |
| **Create Order** | payment-service | `subscriptions` | `Subscription.createdAt`, `Subscription.packageId`, `Subscription.status` | ✅ EXISTS (as subscription creation) |
| **Paket Dibuat** | company-service | `shipping_credentials` | Credential setup = first shipping integration configured | ⚠️ PARTIAL (only credential setup, no actual order tracking) |
| **Pickup/Dikirim** | — | — | Not tracked internally; external vendor API only | ❌ MISSING |
| **Delivered** | — | — | Not tracked internally; external vendor API only | ❌ MISSING |
| **Total Ongkir** | — | — | No revenue/cost aggregation exists | ❌ MISSING |

### Critical Finding: No Shipping Lifecycle Tracking

SatuInbox's `company-service` stores **shipping vendor credentials** (JNE, JNT, Lincah API keys) but does NOT track:
- Individual shipments/orders
- Shipment status changes (created → picked up → in transit → delivered)
- Shipping cost/revenue (ongkir)

The `ShippingCredential` schema (`apps/company-service/src/app/schemas/shipping-credential.schema.ts`) only stores:
```typescript
vendorCode: string      // "jne", "jnt", "lincah"
name: string            // display name
encryptedCredentials: string  // encrypted API keys
isActive: boolean
environment: string     // "production", "staging"
```

The `ShippingVendor` schema is master data for vendor metadata (name, logo, credential field definitions).

**Implication**: The downstream funnel stages (Paket Dibuat → Pickup → Delivered) and Total Ongkir **cannot be powered by existing internal data**. They require either:
- New internal order/shipment tracking collection, OR
- Direct polling of external shipping vendor APIs (JNE/JNT/Lincah tracking endpoints)

> ⚠️ **Note**: "Paket Dibuat" mapped to `shipping_credentials` is a semantic stretch — credential setup ≠ package created. This stage should be renamed to **"Shipping Configured"** or removed from the funnel until real order tracking exists.

### Auth Onboarding Flow (what EXISTS)

The registration → approval flow uses `OnboardingStatusEnum`:
```
ONBOARDING → WAITING_APPROVAL → APPROVED (or REJECTED)
```
- `register()` in `auth-service` creates `User` (people-service) + `Auth` (auth-service)
- Email verification sets `auth.emailVerified = true` and `auth.emailVerifiedAt = new Date()`
- Company registration emits `COMPANY_REGISTERED` event → triggers `WAITING_APPROVAL`
- Admin approval sets status to `APPROVED`

**This maps well to Register → Verified but diverges from the funnel after that.**

### What the Simple Table Mockup Needs (Lead/Request Demo)

The user's simpler mockup: Source | Campaign | Content | Lead/Request Demo

This maps directly to:
- **Lead** = `sales-service` → `Lead` collection (`apps/sales-service/src/app/schemas/lead.schema.ts`)
  - `Lead.pipelineStatus`: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON → LOST
  - `Lead.contact` (LeadContact): contactId, name, phone, email
  - `Lead.amount`: deal value
  - `Lead.tags`: categorization
  - `Lead.teamInbox`: assignment routing

**For the simpler "Lead/Request Demo" table, the sales-service Lead data is sufficient IF UTM attribution is added.**

---

## 2. UTM/Attribution Gap

### Current State: ZERO UTM tracking

No `utm_source`, `utm_campaign`, `utm_content` fields exist anywhere:
- Not in `Auth` schema
- Not in `User` schema  
- Not in `ClientContact` schema
- Not in `Conversation` schema (has `widgetProperties.widgetTopics` but no UTM)
- Not in `Lead` schema
- Not in any event/payload DTO

The only "source tracking" pattern that exists is `AssignmentSourceEnum` on conversations:
```typescript
enum AssignmentSourceEnum { manual, self_pull, system, bulk }
```
This tracks HOW a conversation was assigned, not WHERE the user came from.

### Where to Capture UTM Parameters

**Capture Point 1: Widget (primary entry point for new leads)**
- File: `apps/widget/src/app/schemas/widget-setting.schema.ts`
- The widget is embedded via `<script>` tag on customer websites
- Widget connects via WebSocket with `licenseKey` authentication
- Add UTM capture when the widget session starts

**Capture Point 2: Registration Flow (for direct signups)**
- File: `apps/auth-service/src/app/app.service.ts` → `register()` method
- Currently accepts: `{ email, username, password, fullName, phone }`
- Add UTM fields to `RegisterRequest` proto and pass through

**Capture Point 3: API Gateway (for lead form submissions)**
- File: `apps/api-gateway/src/app/sales/lead.controller.ts`
- Lead creation endpoint needs UTM passthrough

### Database Schema Needed

**Option A: New `marketing_attribution` collection (RECOMMENDED)**

```typescript
// New file: apps/analytics-service/src/app/schemas/marketing-attribution.schema.ts

@Schema({ timestamps: true })
export class MarketingAttribution extends Document {
  @Prop({ required: true, type: SchemaTypes.ObjectId })
  companyId: Types.ObjectId;

  @Prop({ required: true, type: SchemaTypes.ObjectId })
  organizationId: Types.ObjectId;

  // UTM Parameters
  @Prop({ index: true, type: String }) utmSource: string;    // google_ads, meta_ads, tiktok_ads, organic
  @Prop({ index: true, type: String }) utmCampaign: string;  // search_shipper_kw, pmax_seller_online
  @Prop({ index: true, type: String }) utmContent: string;   // text_brand, video_sapx
  @Prop({ type: String }) utmMedium: string;                 // cpc, social, email
  @Prop({ type: String }) utmTerm: string;                   // keyword

  // Attribution
  @Prop({ type: String }) landingPage: string;
  @Prop({ type: String }) referrer: string;
  @Prop({ type: String }) gclid: string;     // Google Click ID
  @Prop({ type: String }) fbclid: string;    // Facebook Click ID
  @Prop({ type: String }) ttclid: string;    // TikTok Click ID

  // Funnel Progression (denormalized for fast aggregation)
  @Prop({ type: SchemaTypes.ObjectId }) userId: Types.ObjectId;
  @Prop({ type: SchemaTypes.ObjectId }) contactId: Types.ObjectId;
  @Prop({ type: SchemaTypes.ObjectId }) leadId: Types.ObjectId;
  
  @Prop({ default: false, type: Boolean }) registered: boolean;
  @Prop({ type: Date }) registeredAt: Date;
  @Prop({ default: false, type: Boolean }) verified: boolean;
  @Prop({ type: Date }) verifiedAt: Date;
  @Prop({ default: false, type: Boolean }) createdOrder: boolean;
  @Prop({ type: Date }) orderCreatedAt: Date;
  @Prop({ default: false, type: Boolean }) packageCreated: boolean;
  @Prop({ type: Date }) packageCreatedAt: Date;
  @Prop({ default: false, type: Boolean }) pickedUp: boolean;
  @Prop({ type: Date }) pickedUpAt: Date;
  @Prop({ default: false, type: Boolean }) delivered: boolean;
  @Prop({ type: Date }) deliveredAt: Date;
  @Prop({ type: Number }) ongkir: number;     // shipping cost/revenue
}

MarketingAttributionSchema.index({ utmSource: 1, utmCampaign: 1, utmContent: 1 });
MarketingAttributionSchema.index({ companyId: 1, createdAt: -1 });
MarketingAttributionSchema.index({ userId: 1 });
MarketingAttributionSchema.index({ contactId: 1 });
```

**Option B: Embed UTM on existing User/Contact (simpler but less flexible)**

Add to `User` schema (people-service):
```typescript
@Prop({ type: MarketingSourceSchema }) marketingSource?: MarketingSource;
```

Where `MarketingSource` is:
```typescript
@Schema({ _id: false })
export class MarketingSource {
  @Prop({ type: String }) source: string;
  @Prop({ type: String }) campaign: string;
  @Prop({ type: String }) content: string;
  @Prop({ type: String }) medium: string;
  @Prop({ type: String }) clickId: string;  // gclid/fbclid/ttclid
  @Prop({ type: Date }) capturedAt: Date;
}
```

**Recommendation**: Option A (separate collection) — cleaner for aggregation queries, doesn't bloat User/Contact docs, supports multiple touchpoints per user.

### Attribution Chain

```
[Ad Click] → [UTM captured in widget/registration] → marketing_attribution._id
                                                        ↓
[User registers] → marketingAttributionId stored on User
[User verified]  → update marketingAttribution.verified = true
[User creates order/subscription] → update marketingAttribution.createdOrder = true
[Shipment created] → update marketingAttribution.packageCreated = true
[Shipment picked up] → update marketingAttribution.pickedUp = true
[Shipment delivered] → update marketingAttribution.delivered = true
```

The attribution ID propagates through the user's journey via their `userId`/`contactId`.

---

## 3. External Data Sources — Integration Requirements

### 3.1 Google Ads API

**API**: Google Ads API v17+ (REST: `googleads.googleapis.com`)

**Auth Setup**:
1. Create Google Cloud project → enable Google Ads API
2. OAuth2 credentials (web app type) → `client_id`, `client_secret`, `refresh_token`
3. Developer Token — apply via Google Ads API Center (requires approval, takes 1-2 days for test access, up to weeks for basic/standard)
4. Manager Account (MCC) ID — to access linked ad accounts

**Required Endpoints**:
```
POST https://googleads.googleapis.com/v17/customers/{customerId}/googleAds:searchStream
```

**GAQL Query for campaign performance**:
```sql
SELECT 
  campaign.id, campaign.name, campaign.status,
  campaign.advertising_channel_type,
  metrics.impressions, metrics.clicks, metrics.cost_micros,
  metrics.conversions, metrics.conversions_value,
  segments.date
FROM campaign 
WHERE segments.date BETWEEN '2026-01-01' AND '2026-12-31'
  AND campaign.status != 'REMOVED'
```

**GAQL Query for ad-level (utm_content mapping)**:
```sql
SELECT
  ad_group_ad.ad.id, ad_group_ad.ad.name,
  ad_group_ad.ad.type,
  campaign.name, ad_group.name,
  metrics.impressions, metrics.clicks, metrics.cost_micros
FROM ad_group_ad
WHERE segments.date BETWEEN '2026-01-01' AND '2026-12-31'
```

**Config needed** (store in env/secrets):
```env
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=        # e.g., "123-456-7890"
GOOGLE_ADS_LOGIN_CUSTOMER_ID=  # MCC ID
```

**Proto for gRPC**: Add `google-ads.proto` to `libs/proto-types/` with:
```protobuf
message GoogleAdsCampaign {
  string campaign_id = 1;
  string campaign_name = 2;
  int64 impressions = 3;
  int64 clicks = 4;
  int64 cost_micros = 5;
  string date = 6;
}
```

**Key mapping**: Google Ads campaign names should follow a convention that maps to `utm_campaign`. UTM parameters are typically appended to destination URLs:
```
https://satuinbox.com/signup?utm_source=google_ads&utm_campaign=search_shipper_kw&utm_content=text_brand
```

### 3.2 Meta (Facebook) Ads API

**API**: Meta Marketing API v21.0 (`graph.facebook.com/v21.0`)

**Auth Setup**:
1. Create Meta App at developers.facebook.com
2. App Review process — request `ads_read` permission (takes 1-7 days for review)
3. Generate long-lived access token via OAuth2 flow
4. System User token (recommended for server-to-server) — create in Business Manager → System Users → generate token with `ads_read` scope

**Required Endpoints**:
```
GET /v21.0/act_{ad_account_id}/campaigns?fields=id,name,status,objective,daily_budget
GET /v21.0/act_{ad_account_id}/insights?fields=campaign_name,impressions,clicks,spend,actions&time_increment=1&date_preset=last_30d
GET /v21.0/act_{ad_account_id}/adsets?fields=id,name,targeting
GET /v21.0/act_{ad_account_id}/ads?fields=id,name,creative
```

**Insights endpoint (main reporting)**:
```
GET /v21.0/act_{ad_account_id}/insights
  ?fields=campaign_name,adset_name,ad_name,impressions,clicks,spend,actions,action_values
  &level=ad
  &time_increment=1
  &time_range={"since":"2026-01-01","until":"2026-12-31"}
  &breakdowns=publisher_platform
```

**Config needed**:
```env
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=          # System User long-lived token
META_AD_ACCOUNT_ID=         # act_XXXXXXXXX
META_PIXEL_ID=              # for conversion tracking
```

**App Review requirements**:
- `ads_read` — read ad account data
- `ads_management` — if bidirectional sync needed
- Business verification may be required for `ads_read`

**URL tag convention**: Meta ads use URL parameters for UTM:
```
https://satuinbox.com/signup?utm_source=meta_ads&utm_campaign=pmax_seller_online&utm_content=carousel_sapx
```
Set via `url_tags` field in ad creative or ad set level.

### 3.3 TikTok Ads API

**API**: TikTok Marketing API v1.3 (`business-api.tiktok.com/open_api/v1.3`)

**Auth Setup**:
1. Register at business-api.tiktok.com/portal
2. Create app → get `app_id` and `secret`
3. OAuth2 flow to get `access_token` and `refresh_token`
4. No app review required for basic reporting (unlike Meta)

**Required Endpoints**:
```
POST /report/integrated/get/
  - Body: {
      advertiser_id: "xxx",
      report_type: "BASIC",
      dimensions: ["campaign_id", "adgroup_id", "ad_id", "stat_time_day"],
      metrics: ["spend", "impressions", "clicks", "conversion", "cost_per_conversion"],
      data_level: "AUCTION_AD",
      lifetime: false,
      start_date: "2026-01-01",
      end_date: "2026-12-31"
    }

GET /campaign/get/?advertiser_id=xxx&page_size=100
GET /adgroup/get/?advertiser_id=xxx&campaign_id=xxx&page_size=100
GET /ad/get/?advertiser_id=xxx&adgroup_id=xxx&page_size=100
```

**Config needed**:
```env
TIKTOK_APP_ID=
TIKTOK_APP_SECRET=
TIKTOK_ACCESS_TOKEN=
TIKTOK_ADVERTISER_ID=
```

**TikTok UTM**: Set via `tracking_url` on ad level:
```
https://satuinbox.com/signup?utm_source=tiktok_ads&utm_campaign=new_lincahid_sapx_45&utm_content=video_sapx
```

### 3.4 Integration Summary Table

| Platform | Auth Complexity | App Review | Rate Limits | Reporting Granularity |
|---|---|---|---|---|
| Google Ads | High (developer token + OAuth2 + MCC) | Yes (1-2 days test, weeks standard) | 15,000 operations/day | Campaign → Ad Group → Ad → Keyword |
| Meta Ads | Medium (System User token) | Yes (`ads_read`, 1-7 days) | 200 calls/user/hour | Campaign → Ad Set → Ad |
| TikTok Ads | Low (OAuth2, no review) | No | 10 requests/second | Campaign → Ad Group → Ad |

---

## 4. Implementation Recommendation

### Phase 1: Internal UTM Capture + Attribution (2-3 weeks)

**Goal**: Capture where users come from and track funnel progression internally.

**Files to modify**:

1. **NEW**: `apps/analytics-service/src/app/schemas/marketing-attribution.schema.ts`
   - `MarketingAttribution` schema as defined in Section 2

2. **MODIFY**: `libs/proto-types/src/lib/auth.proto`
   - Add `utm_source`, `utm_campaign`, `utm_content` fields to `RegisterRequest`

3. **MODIFY**: `apps/auth-service/src/app/app.service.ts`
   - In `register()`: accept UTM params, create `MarketingAttribution` record
   - In `validateAndUpdateEmailToken()`: update attribution `verified = true`

4. **MODIFY**: `apps/widget/src/app/services/widget.service.ts`
   - Accept UTM params in widget WebSocket init message
   - Store UTM on conversation creation or contact creation

5. **MODIFY**: `apps/api-gateway/src/app/sales/lead.controller.ts`
   - Accept UTM params in lead creation DTO
   - Link lead to marketing attribution record

6. **NEW**: `apps/analytics-service/src/app/services/marketing-funnel.service.ts`
   - Aggregation queries: groupBy source → campaign → content
   - Count registers, verified, orders per attribution group
   - Expose via gRPC for dashboard consumption

7. **Frontend**: Landing page / registration page
   - Capture `utm_source`, `utm_campaign`, `utm_content` from URL query params
   - Store in localStorage, pass to registration API call
   - Also capture `gclid`, `fbclid`, `ttclid` for conversion API callbacks

**Quick win for the simple table**: Just count Leads grouped by `marketingSource.source` — no shipping stages needed for Lead/Request Demo tracking.

### Phase 2: Ads API Integration (3-4 weeks)

**Goal**: Pull cost/impression data from ad platforms to calculate ROI.

1. **NEW**: `apps/analytics-service/src/app/services/ads-integration/`
   - `google-ads.service.ts` — OAuth2 + GAQL queries
   - `meta-ads.service.ts` — Graph API insights
   - `tiktok-ads.service.ts` — Marketing API reporting
   - `ads-sync.scheduler.ts` — Cron job (daily) to pull previous day's data

2. **NEW**: `apps/analytics-service/src/app/schemas/ads-performance.schema.ts`
   - Store synced ad spend/impressions/clicks per campaign per day
   - Fields: `platform`, `campaignId`, `campaignName`, `date`, `spend`, `impressions`, `clicks`, `conversions`

3. **Config**: Add ad platform credentials to environment config
   - Store in encrypted config (similar to `ShippingCredential.encryptedCredentials` pattern)
   - Admin UI for entering API credentials per platform

4. **Frontend**: Dashboard page
   - Table: Source | Campaign | Content | Lead | Spend | CPL (Cost per Lead) | Delivered Rate

### Phase 3: Full Dashboard with Shipping Funnel (4-6 weeks)

**Goal**: Complete funnel through shipping lifecycle with Total Ongkir.

**Prerequisite**: SatuInbox must have internal order/shipment tracking. Currently it doesn't — it only stores shipping vendor credentials. Two options:

**Option A: Internal Order Tracking (build it)**
1. NEW collection: `orders` in a new or existing service
   - Fields: `userId`, `contactId`, `marketingAttributionId`, `vendorCode`, `trackingNumber`, `status` (created/picked_up/in_transit/delivered), `ongkir`, `createdAt`, `deliveredAt`
2. Update shipping integration code to create order records when shipments are booked
3. Aggregate ongkir from delivered orders grouped by marketing attribution

**Option B: Vendor API Polling (pull it)**
1. Poll JNE/JNT/Lincah tracking APIs periodically
2. Match tracking numbers to users via conversation sessionDetails
3. Update marketing attribution when status changes
4. `ponytail:` fragile — vendor APIs change, rate limits vary, matching is imprecise

**Recommendation**: Option A — internal order tracking is the correct foundation. Shipping vendor integrations should emit order events that get persisted.

**Frontend**: Full dashboard with:
- Funnel chart: Register → Verified → Create Order → Paket Dibuat → Pickup → Delivered
- Source filter (Google/Meta/TikTok/Organic)
- Drill-down per source → campaign → content
- KPIs: Register count, Verified count, Delivered count, Delivered Rate %, Total Ongkir
- Date range picker
- Export to CSV

---

## Appendix: Proto Definitions Needed

```protobuf
// libs/proto-types/src/lib/marketing.proto

service MarketingService {
  rpc GetFunnelReport(FunnelReportRequest) returns (FunnelReportResponse);
  rpc GetCampaignPerformance(CampaignPerformanceRequest) returns (CampaignPerformanceResponse);
  rpc SyncAdsData(SyncAdsRequest) returns (SyncAdsResponse);
}

message FunnelReportRequest {
  string company_id = 1;
  string organization_id = 2;
  string start_date = 3;
  string end_date = 4;
  optional string utm_source = 5;
  optional string utm_campaign = 6;
}

message FunnelReportResponse {
  repeated SourceGroup sources = 1;
}

message SourceGroup {
  string utm_source = 1;
  int64 register_count = 2;
  int64 verified_count = 3;
  int64 order_count = 4;
  int64 package_created_count = 5;
  int64 pickup_count = 6;
  int64 delivered_count = 7;
  double delivered_rate = 8;
  int64 total_ongkir = 9;
  repeated CampaignGroup campaigns = 10;
}

message CampaignGroup {
  string utm_campaign = 1;
  // ... same metrics ...
  repeated ContentGroup contents = 10;
}

message ContentGroup {
  string utm_content = 1;
  int64 register = 2;
  int64 verified = 3;
  int64 create_order = 4;
  int64 paket_dibuat = 5;
  int64 pickup = 6;
  int64 delivered = 7;
  int64 ongkir = 8;
}
```

---

## Appendix: Key File References

| Purpose | Path |
|---|---|
| Auth registration | `apps/auth-service/src/app/app.controller.ts` (L259-265) |
| Auth schema (emailVerified) | `apps/auth-service/src/app/schemas/auth.schema.ts` (L37-56) |
| User schema | `apps/people-service/src/app/schemas/user.schema.ts` |
| ClientContact schema | `apps/people-service/src/app/schemas/client-contact.schema.ts` |
| Lead schema (sales pipeline) | `apps/sales-service/src/app/schemas/lead.schema.ts` |
| Conversation schema | `apps/conversation-service/src/app/schemas/conversation.schema.ts` |
| Widget settings | `apps/widget/src/app/schemas/widget-setting.schema.ts` |
| Shipping credentials | `apps/company-service/src/app/schemas/shipping-credential.schema.ts` |
| Shipping vendor master | `apps/company-service/src/app/schemas/shipping-vendor.schema.ts` |
| Subscription (order analog) | `apps/payment-service/src/app/schemas/subscription.schema.ts` |
| Onboarding status enum | `libs/common/src/lib/enums/index.ts` |
| Lead pipeline enum | `libs/common/src/lib/enums/index.ts` |
| Analytics service schemas | `apps/analytics-service/src/app/schemas/` |
| Widget controller | `apps/widget/src/app/controllers/widget.controller.ts` |
| API gateway leads | `apps/api-gateway/src/app/sales/lead.controller.ts` |
| API gateway shipping | `apps/api-gateway/src/app/company/shipping-credential.controller.ts` |

---

## Reviewer Notes (PASS with additions)

### Schema Fixes
- Add compound index: `{ companyId: 1, organizationId: 1, createdAt: -1 }`
- `ongkir` field on attribution doc is architecturally wrong — shipping cost is per-shipment. **Aggregate from orders at query time**, don't denormalize a running total. Remove `ongkir` from `MarketingAttribution` or rename to `totalOngkir` with explicit `$inc` update semantics.
- One user can have **multiple attribution records** (multi-device, retargeting). Dashboard must decide **attribution model**: first-touch, last-touch, or linear.

### API Integration Additions
- **Conversion API upload**: collecting `gclid`/`fbclid`/`ttclid` without feeding conversions BACK to ad platforms is half the value. Add **Phase 2.5: Conversion Upload** — Google Enhanced Conversions, Meta Conversions API (CAPI), TikTok Events API.
- **API versions**: Google Ads v17 → use latest stable at implementation time. Same for Meta v21.0.
- **Rate limits are approximate**: Google Basic=15K ops/day, Standard=1.5M/day. Meta is per-app, varies. Mark as estimates.
- **Webhook option**: All 3 platforms support real-time notifications (Google Change Status, Meta Webhooks, TikTok Callbacks). Daily cron is simpler but note the alternative.

### Timeline Adjustments
- **Phase 2 timeline doesn't account for API approval lead times.** Google Ads developer token: 1-2 days test, weeks for standard. Meta `ads_read` review: 1-7 days. **Start approval process during Phase 1** — don't wait until Phase 2 begins.
- **Phase 3 should split**: "Build order tracking feature" (4-6 weeks) is separate from "Build dashboard on top" (2-3 weeks).

### Missing Risks
1. **PDPA/GDPR compliance** — storing UTM + click IDs + referrer is personal data processing. Need consent, retention policy, right-to-deletion.
2. **Widget rollout risk** — customers with cached widget scripts won't capture UTM until they re-embed. Version bump + migration plan needed.
3. **Bot/spam traffic** — filter bot registrations from attribution data or dashboard counts are inflated.
4. **Data backfill** — dashboard will be empty for weeks after go-live. Backfill existing `Auth.createdAt` / `Lead.createdAt` as "organic/untracked" source.
5. **Multi-device attribution** — UTM params lost on refresh. localStorage works single-device; cross-device needs first-party cookie or server-side session linking.

### Quick Win Refinement
For the simple **Lead/Request Demo table**, embed `marketingSource` directly on Lead schema (Option B style) — faster than the full `marketing_attribution` collection. Use full collection only for the complete funnel dashboard.
