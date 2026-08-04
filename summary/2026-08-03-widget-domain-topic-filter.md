# Summary: 2026-08-03 — Widget Domain-Based Topic Filter

## Tanggal
2026-08-03

## Judul Session
Brainstorm & Change Intake: Widget Domain-Based Topic Filter

## Tujuan / Request Utama
User ingin widget topic bisa di-set berdasarkan website mana widget itu di-load (origin domain). Brainstorm → breakdown approach B (domain filter on topic assignment) → impact analysis → change intake brief.

## Ringkasan Progres / Keputusan

### Brainstorm Phase
- Trace full widget topic flow: Widget embed → `GET /account-channel/topics` (open API) → gRPC → Channel Service aggregation on `AccountChannel.widgetProperties.widgetTopics[]` → returns all topics
- Identified 3 approaches: A (multiple accounts), B (domain filter), C (domain mapping in widget settings)
- User chose **Approach B**

### Approach B Breakdown
- Add `allowedDomains: string[]` to `WidgetTopicInfo` schema (channel-service)
- Filter in MongoDB aggregation `$elemMatch` when origin domain provided
- Open API endpoint accepts `?domain=` query param
- Widget embed passes `window.location.origin`
- FE admin form gets domain input field

### User Decisions (confirmed)
- Q1: Exact domain match (no wildcards)
- Q2: Domain input on widget account create/update modal at `/settings/channels/widget?tab=widget-account`
- Q3: Default visible everywhere, only filter when domain field is set

### Change Classification
- `ADDITIVE_IMPROVEMENT` — optional field on existing schema, no core model change
- `ROUTE_PATCH_EXISTING_PRD`

### Impact Summary
- **Blast radius:** LOW — touches 1 schema, 1 aggregation pipeline, 1 API endpoint, 1 FE form, 1 embed script
- **Backward compatible:** empty/missing `allowedDomains` = all domains (current behavior preserved)
- **Protected:** all existing CRUD flows, widget conversation flow, topic usage check, cascade delete

## Status Terakhir / Next Step
- Brief persisted at `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md`
- Status: **Scoped** — ready for PRD patch or direct implementation
- Open question: OQ-04 — widget embed script location (separate repo or inside FE monorepo) → **Answered: inside FE monorepo** (`apps/widget/scripts/widget/widget.ts`)
- Widget package impact: **negligible** — embed script +40 bytes (19.6KB → ~19.6KB, budget 60KB). Topic filtering is server-side.
- PRD patch created at `PRD/Widget/PRD Widget - Domain Topic Filter Patch.md` (v1.2)
- Base PRD revision history updated
- Next: QA Assessment (if needed) or direct implementation

---

## Transkrip Percakapan

### Turn 1 — User
> bisa ga widget topic itu di set berdasarkan di website mana topic itu bisa di buka?
> brainstorming dulu

### Turn 1 — Assistant
Brainstorming: widget topic per website/origin.

**Konsep:** Widget topic di-assign berdasarkan website mana customer membuka widget itu.

**3 Pendekatan:**
1. Multiple Account Channels (zero code change)
2. Domain Filter di Topic Assignment (surgical)
3. Domain Mapping di Widget Settings (over-engineered)

Pertanyaan: Q1 topic = existing or new? Q2 mapping dari mana? Q3 behavior sekarang?

### Turn 2 — User
> q1, widget topic, udah ada
> q2, per account channel ketika buat account widget
> q3, liat ke code base nya, harusnya widget di embed, nanti get topic berdasarkan license

### Turn 2 — Assistant
Traced full flow:
- `WidgetTopicInfo` in account-channel schema: `{ topicId, topicName, subTopic }`
- Widget settings: `{ licenseKey, livechatWidgetSettings, marketplaceWidgetSettings }`
- Widget open API: `GET /account-channel/topics` → aggregation on all widget topics for company
- No domain concept exists today
- Recommended Approach B

### Turn 3 — User
> breakdown dengan skema B

### Turn 3 — Assistant
Detailed 5 touchpoints:
1. Schema: add `allowedDomains` to `WidgetTopicInfo`
2. Proto: add field to message
3. Channel Service: filter in aggregation `$elemMatch`
4. API Gateway: accept `?domain=` query param
5. Widget embed: pass `window.location.origin`
6. Admin FE: domain input field

Effort: ~1 hour, ~7 files

### Turn 4 — User
> q1, exact match
> q2, domain input ketika buat akun widget, path >> /settings/channels/widget?tab=widget-account
> q3, default, visible everwhere, add to specific domain ketika domain input terisi
> brainstorm lagi impact dan implementasi ny bakaal mengubah kemana saja, testing nya seperti apa
> lalu buat briefnya

### Turn 4 — Assistant
Full impact analysis:
- Traced FE form: `ActionAccountWidgetModal.tsx` → schema `CreateWidgetAccountSchema.ts` → hook `useWidgetAccountAction.ts` → API
- Traced BE DTO: `WidgetTopicDto` in `create-account-channel.dto.ts`, types in `types/index.ts`
- Traced aggregation: `buildTopicMatchStage` → `buildTopicGroupStage` → `buildTopicPipeline`
- Created comprehensive brief with:
  - 8 BE touchpoints, 5 FE touchpoints
  - 4 unit tests, 8 integration tests, 5 E2E tests
  - Regression scope
  - One open question (OQ-04: widget embed script location)

Brief persisted at `Assessments/widget/widget-domain-topic-filter/widget-domain-topic-filter-change-intake-brief.md`
