# **PATCH PRODUCT REQUIREMENT DOCUMENT — Statistic Parameter Improvement**

> **Feature**: Statistic Parameter Improvement — Filter Consistency Fix + New Metric Parameters
> **Author**: Dany Christian
> **Product Manager**: Dany Christian
> **Engineering Lead**: Naftal Yunior
> **Product**: SatuInbox
> **Domain**: Analytics
> **Version**: v1.0
> **Status**: Draft
> **Source Brief**: `Assessments/cross-domain/agent-statistic-access/statistic-parameter-improvement-change-intake-brief.md` v1.0
> **Rules Applied**: `Rules/prd-writing-rule.md`
> **Related PRD**: `PRD/Analytics/*`, `PRD/Analytics/Statistic/PRD Analytics - agent statistic access.md` (Patch 1)

---

## **1. Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD patch: filter consistency fix (CsatSection zero filter, Responsiveness date-only), unified StatisticFilter `mode` prop, channel/platform dropdown, conversation new parameters (priority, spam, junked, group), ticket new parameters (priority, type, channel), CSAT channel breakdown + response rate. Open Questions 5 item. |
| v1.1 | 2026-08-14 | Dany Christian | Prototype findings added: Responsiveness summary is 5 cards not 3 — Wait Time in Queue + RLT are orphaned existing BE data never surfaced (PS-007, FR-002a); SLA breakdown/summary values differ per tab (per-domain metricType, PS-002 update); T1→T4 timeline documented (Appendix H); RLT SLA breakdown explicitly out-of-scope → Patch 4; OQ-P2-06 added. |

---

## **2. Overview**

| Item | Description |
|------|-------------|
| Purpose | Merapihkan konsistensi filter di halaman statistic (6 section) dan menambah parameter/metric baru berdasarkan inventory codebase. Filter fix menutup gap CsatSection tanpa filter, Responsiveness date-only, dan hook 8 param yang hanya render 3. Parameter baru menambah dimensi conversation (priority, spam, junked, group), ticket (priority, type, channel), dan CSAT (channel breakdown, response rate) ke pipeline daily-metrics. |
| Scope | Filter fix (CsatSection, Responsiveness, unified component, channel dropdown), conversation new parameters, ticket new parameters, CSAT new parameters, doc sync. |
| Key Capabilities | (1) Semua section punya filter konsisten via unified `StatisticFilter` mode. (2) CsatSection punya filter + selfContext. (3) Responsiveness re-enable team + agent filter. (4) Channel/platform dropdown ter-render (hook sudah support). (5) Conversation priority/spam/junked/group tampil. (6) Ticket priority/type/channel tampil. (7) CSAT channel breakdown + response rate tampil. |
| Outcome | Filter konsisten = 6/6 section punya filter yang sesuai. Parameter baru ter-expose dari schema yang sudah ada. Foundation untuk Patch 3 (interactive dashboard). |

### **Scope Definition**

| In Scope | Out of Scope |
|----------|-------------|
| CsatSection: tambah `<StatisticFilter>` + selfContext | Patch 1 (guard fix + backfill) — PRD terpisah |
| Responsiveness: re-enable team + agent filter | Patch 3 (interactive dashboard / drill-down) — PRD terpisah |
| Unified `StatisticFilter`: 3 boolean hide → `mode` prop | Per-stage SLA / SLA pause/hold time |
| Channel/platform dropdown per section (hook support, UI belum render) | Shift-hours variant untuk conversation (unless OQ-P2-05 = yes) |
| Conversation: priority, spam, junked, group di daily-metrics pipeline | FE automated test backfill (0 test infrastructure) |
| Ticket: priority, type, channel di daily-metrics pipeline | New statistic sections di StatisticNav (6 section tetap) |
| CSAT: channel breakdown + response rate display | Per-stage SLA / SLA pause/hold time |
| Responsiveness: expose Avg Wait Time in Queue + Avg Response Lead Time (RLT) as raw informational cards (no SLA breakdown) | RLT SLA In/Over breakdown cards — requires new SLA target definition (`SLASettingMetricEnum` has only `FIRST_RESPONSE_TIME` and `TIME_TO_CLOSE`, no RLT/Wait Time option) — moved to separate **Patch 4 (RLT & Wait Time SLA Tracking)**, NOT included here. |
| Doc sync PRD Analytics | |

---

## **3. Problem Statement**

| ID | Problem | Impact |
|----|---------|--------|
| PS-001 | CsatSection tidak memiliki `<StatisticFilter>` dan tidak passing `selfContext` — section ini satu-satunya dari 6 yang tanpa filter sama sekali. | Data CSAT tampil tanpa filter — tidak konsisten dengan section lain. Agent `READ_OWN` tidak bisa filter CSAT sendiri via UI (hanya rely BE guard). |
| PS-002 | ResponsivenessSection menggunakan `hideTeamFilter=true` dan `hideAgentFilter=true` — hanya tampil date filter. **Section ini kompleks:** 3 summary cards (Avg Response Time, Avg FRT, Avg TTC) dengan change indicators, SLA Breakdown section (2-column grid: In SLA green / Over SLA red × 3 metrics: FRT SLA, TTC SLA, Closed Rate/Solving SLA — masing-masing dengan count + percent), 3 tabs (All / Conversations / Ticket via `ResponsivenessType` filter), dan 3 charts (`BarChartResponseTimeByTime`, `LineChartAvgFirstResponseTimeByTime`, `LineChartAvgTimeToCloseByTime`). Hook `useResponsivenessSection` menggunakan `useStatisticFilter` yang **sudah support teamId + agentId**, tapi UI menyembunyikan filter tersebut. **SLA breakdown data (FRT/TTC/Solving SLA in-over count+%) sudah ada di codebase** — di-compute via RMQ call ke conversation-service/ticket-service di `responsiveness-analytics.service.ts:521-534`. Ini bukan parameter baru, tapi existing data yang filter-inconsistent. **Fix = purely UI:** hapus `hideTeamFilter` + `hideAgentFilter=true`. **Update (prototype finding):** SLA breakdown value juga BUKAN satu nilai gabungan — BE menyimpan `metricType` per-domain (`conversation_frt` vs `ticket_frt`, dst. sebagai enum value terpisah di `ResponsivenessMetricType`), jadi summary card dan SLA breakdown **menampilkan nilai berbeda per tab** (All/Conversations/Ticket) dan switching tab harus re-fetch/re-render dataset per-domain, bukan sekadar filter client-side dari satu dataset. | Supervisor/Agent tidak bisa filter responsiveness per-team atau per-agent di UI. SLA breakdown per-agent/per-team tidak bisa dilihat meskipun data sudah ada di backend. Data menampilkan aggregate semua agent. Jika switching tab diimplementasi sebagai filter client-side (bukan re-fetch per-domain), nilai yang tampil salah. |
| PS-007 | **[NEW — prototype finding]** Summary Responsiveness seharusnya 5 card, bukan 3 — 2 metric sudah ter-compute dan tersimpan di BE tapi tidak pernah sampai ke FE ("orphaned data"): (1) **Average Wait Time in Queue** — field `waitTimeInQueueMs` sudah ada di `conversation-sla-metrics.schema.ts:102`, dihitung di `conversation-sla-metrics.repository.ts:189` (`firstAgentAssignmentAt − firstCustomerMessageAt`). (2) **Average Response Lead Time (RLT)** — field `rltMs` sudah ada di `conversation-sla-metrics.schema.ts:109`, dihitung via `calculateRltMs()` (`conversation-sla-metrics.service.ts:666`, `businessMsBetween(firstAgentAssignmentAt, agentReplyAt)`, office-hours aware, fallback wall-clock di luar jam kerja). Root cause: kedua field ini ada di conversation-service's `conversation-sla-metrics` collection tapi **tidak pernah dimasukkan ke `ResponsivenessMetricType` enum** (`responsiveness-metrics.schema.ts` di analytics-service) — sehingga tidak pernah masuk ke pre-aggregated collection analytics-service, dan tidak pernah sampai ke FE. Ini gap arsitektur yang berbeda dari filter-hiding bug PS-002 di atas. | Data wait time & agent responsiveness pasca-assignment (RLT) sudah tersedia tapi sepenuhnya invisible di statistic — user tidak tahu berapa lama conversation menunggu di antrian sebelum diambil agent, atau berapa lama agent merespon setelah assignment. |
| PS-003 | `useStatisticFilter` hook support 8 URL param (`agentId, channelId, endDate, memberAgentId, platformId, source, startDate, teamId, type`) tapi `StatisticFilter` component hanya render 3 (date, team, agent). 5 param dead code. | Channel dan platform filter tidak bisa dipakai user meskipun hook sudah support. |
| PS-004 | Conversation priority, spam, junked, group data sudah ada di schema (`conversation.priority`, `isSpam`, `isJunked`, `isGroup`) tapi tidak dihitung di daily-metrics pipeline. | Admin tidak bisa melihat breakdown per priority, spam count, junked count, atau group vs non-group. Data tersembunyi di database. |
| PS-005 | Ticket priority (`TicketPriorityEnum`) dan ticket type (`ticket-type.schema.ts`) belum ada sebagai dimensi di `ticketdailymetrics`. | Tidak ada visibilitas per-priority atau per-type di statistic ticket. Breakdown hanya ada di raw collection. |
| PS-006 | CSAT `perChannel` sudah ada di response type (`CsatMetricsResponse`) tapi belum tentu populated/ditampilkan. Response rate (`totalResponses/totalSent`) belum di-expose sebagai card terpisah. | Channel breakdown CSAT dan response rate tidak terlihat di UI. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
|-----------|-----------|
| Filter konsisten di semua 6 section | KR-1: 6/6 section statistic punya filter yang sesuai (CsatSection punya filter, Responsiveness punya team+agent) setelah deploy ver2.9/3.0 |
| Unified filter component | KR-2: `StatisticFilter` menggunakan `mode` prop (mengganti 3 boolean hide) di semua section yang pakai filter |
| Channel/platform filter available | KR-3: Channel dan platform dropdown ter-render di section yang relevan (hook param `channelId`/`platformId` tidak lagi dead code) |
| Conversation parameter ter-expose | KR-4: Conversation daily-metrics menghitung priority breakdown, spam count, junked count, group vs non-group |
| Ticket parameter ter-expose | KR-5: Ticket daily-metrics menghitung per-priority, per-type, per-channel breakdown |
| CSAT parameter ter-expose | KR-6: CSAT channel breakdown populated dan response rate tampil sebagai card |

---

## **5. User Stories & Acceptance Criteria**

| ID | Role | Story | Acceptance Criteria |
|----|------|-------|---------------------|
| US-001 | Admin | Saya ingin melihat breakdown conversation per priority (urgent, high, medium, low) di halaman statistic | Given admin membuka section Conversations, When memilih rentang date, Then card/grafik breakdown per priority tampil (urgent, high, medium, low) dengan count masing-masing |
| US-002 | Admin | Saya ingin melihat jumlah conversation spam dan junked di statistic | Given admin membuka section Conversations, When data tersedia, Then count spam dan junked tampil di scoreboard/conversation summary |
| US-003 | Admin | Saya ingin melihat split conversation group vs non-group | Given admin membuka section Conversations, Then terlihat split group vs non-group conversation |
| US-004 | Admin | Saya ingin filter data CSAT berdasarkan tanggal dan agent (seperti section lain) | Given admin membuka section CSAT, When section terbuka, Then filter date + agent (via StatisticFilter) tampil dan bisa digunakan |
| US-005 | Admin | Saya ingin filter responsiveness per-team dan per-agent | Given admin membuka section Responsiveness, When section terbuka, Then filter date + team + agent tampil (bukan date-only) |
| US-006 | Admin | Saya ingin melihat ticket breakdown per priority | Given admin membuka section Ticket, Then card breakdown per priority tampil |
| US-007 | Admin | Saya ingin melihat ticket breakdown per ticket type/category | Given admin membuka section Ticket, Then card breakdown per type tampil |
| US-008 | Admin | Saya ingin filter statistic berdasarkan channel/platform | Given admin membuka section yang relevan (Conversations/Ticket/CSAT), Then dropdown channel dan platform tampil dan bisa dipilih |
| US-009 | Admin | Saya ingin melihat CSAT response rate | Given admin membuka section CSAT, Then response rate (totalResponses/totalSent) tampil sebagai card/percentage |

---

## **6. Functional Requirements**

| ID | Priority | System Behavior | Acceptance Criteria |
|----|----------|----------------|---------------------|
| FR-001 | P0 | System **MUST** menambahkan `<StatisticFilter>` component ke CsatSection dengan `selfContext` (untuk agent `READ_OWN`). | 1. Given admin membuka CSAT section, Then filter date + team + agent tampil. 2. Given agent `READ_OWN` membuka CSAT section, Then filter lock ke self (SelfFilterChip isLocked). 3. Given user memilih filter date, Then data CSAT ter-filter sesuai pilihan. |
| FR-002 | P0 | System **MUST** me-re-enable team dan agent filter di ResponsivenessSection — hapus `hideTeamFilter=true` dan `hideAgentFilter=true`. | 1. Given admin membuka Responsiveness section, Then filter date + team + agent tampil (bukan date-only). 2. Given user memilih team, Then data responsiveness ter-filter per-team. 3. Given user memilih agent, Then data ter-filter per-agent. |
| FR-002a | P1 | **[NEW]** System **MUST** menambahkan 2 summary card informational baru di ResponsivenessSection: **Average Wait Time in Queue** (dari field `waitTimeInQueueMs` yang sudah tersimpan) dan **Average Response Lead Time (RLT)** (dari field `rltMs` yang sudah tersimpan). Card ini raw average value saja — **TIDAK** ada SLA in/over breakdown (lihat scope note di §2 dan §19.A). Membutuhkan penambahan `waitTimeInQueue` dan `responseLeadTime` ke `ResponsivenessMetricType` enum di analytics-service agar data mengalir dari conversation-sla-metrics ke pre-aggregated collection. | 1. Given data `waitTimeInQueueMs` tersedia di conversation-sla-metrics, Then card "Average Wait Time in Queue" tampil dengan nilai rata-rata. 2. Given data `rltMs` tersedia, Then card "Average Response Lead Time" tampil dengan nilai rata-rata. 3. Given tidak ada SLA target untuk kedua metric ini, Then card tidak menampilkan breakdown In SLA/Over SLA — hanya raw average. 4. Card mengikuti filter date/team/agent yang sama seperti 3 card existing. |
| FR-003 | P0 | System **MUST** merefaktor `StatisticFilter` props dari 3 boolean hide (`hideTeamFilter`, `hideAgentFilter`, `hideXFilter`) ke single `mode` prop yang mendefinisikan filter visibility per section. | 1. Given `mode="full"`, Then date + team + agent + channel/platform tampil. 2. Given `mode="date-team"`, Then date + team tampil. 3. Given `mode="date-only"`, Then hanya date tampil. 4. Given `mode="self"`, Then date + self chip (locked) tampil. 5. Backward compatible: boolean props masih berfungsi jika `mode` tidak diset (deprecated). |
| FR-004 | P1 | System **MUST** menambahkan channel (`channelId`) dan platform (`platformId`) dropdown ke `StatisticFilter` component — hook `useStatisticFilter` sudah support, UI belum render. | 1. Given `mode` meng-include channel filter, Then dropdown channel tampil dengan daftar channel yang tersedia. 2. Given user memilih channel, Then URL param `channelId` ter-set dan data ter-filter. 3. Given `mode` meng-include platform filter, Then dropdown platform tampil. |
| FR-005 | P0 | System **MUST** menambahkan dimensi `priority` ke conversation daily-metrics pipeline — breakdown count per priority value (urgent, high, medium, low, none). | 1. Given conversation dengan priority "urgent" ada di rentang date, Then `byPriority[]` di daily-metrics berisi entry `{priority: "urgent", count: N}`. 2. Given tidak ada conversation dengan priority tertentu, Then entry untuk priority tersebut tidak muncul atau count=0. 3. Backward compatible: field `byPriority[]` default empty array jika belum ada data. |
| FR-006 | P0 | System **MUST** menambahkan count `spam`, `junked`, `group`, `nonGroup` ke conversation daily-metrics schema. | 1. Given conversation dengan `isSpam=true` ada di rentang date, Then `counts.spam` bertambah. 2. Given conversation dengan `isJunked=true`, Then `counts.junked` bertambah. 3. Given conversation dengan `isGroup=true`, Then `counts.group` bertambah. 4. Given `isGroup=false`, Then `counts.nonGroup` bertambah. 5. Backward compatible: field baru default 0. |
| FR-007 | P1 | System **MUST** menambahkan dimensi `priority` ke ticket daily-metrics pipeline — breakdown per `TicketPriorityEnum`. | 1. Given ticket dengan priority "high" ada, Then `byPriority[]` berisi `{priority: "high", count: N}`. 2. Default empty array jika belum ada data. |
| FR-008 | P1 | System **MUST** menambahkan dimensi `ticketType` dan `channel`/`platform` ke ticket daily-metrics pipeline. | 1. Given ticket dengan type "complaint" ada, Then `byType[]` berisi `{type: "complaint", count: N}`. 2. Given ticket dari platform "whatsapp" ada, Then `byPlatform[]` berisi `{platform: "whatsapp", count: N}`. 3. Default empty array. |
| FR-009 | P1 | System **MUST** mem-populate CSAT channel breakdown (`perChannel`) dan menambahkan card response rate. | 1. Given CSAT dengan `channelPlatformCode` ada, Then `perChannel[]` di response ter-populate. 2. Response rate ditampilkan: `totalResponses / totalSent` sebagai percentage. 3. `perChannel` type sudah ada di `CsatMetricsResponse` — pastikan data ter-populate. |
| FR-010 | P1 | System **MUST** menampilkan card/grafik baru di UI untuk setiap parameter baru (conversation priority, spam, junked, group; ticket priority, type, channel; CSAT channel, response rate). | 1. Given data tersedia di daily-metrics, Then card/grafik tampil di section yang sesuai. 2. Given data tidak tersedia (empty state), Then card menampilkan 0 atau "Belum ada data". 3. Given filter diubah, Then card/grafik update sesuai filter. |

---

## **7. Permission Matrix**

> **Catatan:** Permission matrix **tidak berubah** dari Patch 1 (`PRD Analytics - agent statistic access.md`). Patch 2 = filter consistency + parameter addition, bukan permission change. Scope enforcement (`isSelfOnlyScope`, `resolveAgentId`, `resolveTeamId`) tetap berlaku.

| Role | View Statistik Sendiri | View Statistik Team | View Semua Statistik | Export Report | Filter Baru (channel/platform) | Scope Enforcement |
|------|----------------------|--------------------|--------------------|--------------|-------------------------------|--------------------|
| Agent (`READ_OWN`) | ✅ Allowed | ❌ Hidden | ❌ Hidden | ❌ Hidden | ✅ Available (filtered by scope) | `isSelfOnlyScope=true` |
| Supervisor (`READ_TEAM`) | ✅ Allowed | ✅ Allowed | ❌ Hidden | ✅ Allowed (jika punya `statistic:export`) | ✅ Available | `resolveTeamId` filter by team |
| Admin (`READ`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed (jika punya `statistic:export`) | ✅ Available | No scope restriction |
| Admin/Supervisor (`ALL`) | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed (wildcard cover) | ✅ Available | No scope restriction |
| User tanpa permission statistic | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | ❌ 403 | PermissionsGuard block semua |

> Tidak ada permission baru. Filter fix = UI consistency, bukan permission change. Parameter baru = additive dimensi di pipeline yang sudah ada.

---

## **8. Error Handling**

| ID | Type | Handling | UI/UX |
|----|------|---------|-------|
| EH-001 | Pipeline error — daily-metrics gagal menghitung dimensi baru (priority, spam, dll) | System **MUST** tetap menghitung dimensi existing (counts, replies, screenshots) meskipun dimensi baru gagal. Dimensi baru = additive, tidak boleh mem-blocking dimensi existing. Error logged per-dimensi. | Card/grafik untuk dimensi yang gagal = empty state. Dimensi lain tetap tampil normal. |
| EH-002 | Filter channel/platform — daftar channel kosong atau API gagal | System **MUST** menampilkan dropdown kosong dengan placeholder "Semua channel" (default = no filter). Jangan block page render karena dropdown gagal load. | Dropdown tampil dengan placeholder. Data section tetap tampil tanpa filter channel. |
| EH-003 | CsatSection filter selfContext — `selfUserId` belum resolved | Sama dengan Patch 1 EC-006: FE **MUST NOT** menampilkan data sebelum selfContext terpasang. Loading state ditampilkan. | Prevent flash data orang lain. |
| EH-004 | Responsiveness filter re-enable — data berubah karena sebelumnya unfiltered | Perilaku ini **intended**. Tidak ada error handling khusus. Perlu QA dan release note. | Data berubah sesuai filter yang dipilih. "Semua" = perilaku lama. |
| EH-005 | `StatisticFilter` mode refactoring — backward compatibility | System **MUST** mendukung boolean props lama jika `mode` tidak diset. Deprecation warning di console dev, bukan breaking change. | Tidak ada perubahan UI — perilaku sama. |

---

## **9. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
|----|----------|-------------------|-------|
| EC-001 | CsatSection dengan `isSelfOnly=true` (agent READ_OWN) | `StatisticFilter` lock ke self (SelfFilterChip isLocked). Data hanya milik agent. | Filter tampil tapi team/agent di-lock. |
| EC-002 | Responsiveness filter re-enable untuk pertama kali | Data sebelumnya tampil semua agent (date-only). Setelah re-enable, default = semua (no filter selected). Behavior identical sampai user memilih filter. | Default state = no change. |
| EC-003 | Conversation tanpa priority (null/undefined) | `byPriority[]` mengelompokkan ke entry `{priority: "none", count: N}` atau tidak menampilkan entry. | Card "Tanpa Priority" atau tidak ditampilkan (tergantung OQ). |
| EC-004 | Ticket tanpa type (null/undefined) | `byType[]` mengelompokkan ke entry `{type: "none", count: N}`. | Card "Tanpa Tipe" atau tidak ditampilkan. |
| EC-005 | Channel dropdown — tenant hanya punya 1 channel | Dropdown tetap tampil dengan 1 opsi + "Semua". | Dropdown available tapi tidak krusial. |
| EC-006 | New parameter tapi data kosong di date range | Card/grafik menampilkan 0 atau empty state "Belum ada data". | Empty state, bukan error. |
| EC-007 | Filter refactoring — page dengan 3 boolean props lama | Backward compatible: boolean props masih berfungsi. Deprecation warning di dev mode. | Behavior identik. |
| EC-008 | Response rate = 0/0 (totalSent = 0) | Response rate = 0% atau "N/A" (division by zero guard). | Tampilkan "—" atau "N/A". |
| EC-009 | `isSelfOnly=true` + channel filter | Channel filter tetap available. Scope enforcement tetap apply (data di-scope ke agent sendiri, lalu filter channel). | Filter channel + self lock = data agent sendiri per channel. |

---

## **10. UI & UX Requirements**

| Component | Behavior | Permission Gate | States |
|-----------|----------|----------------|--------|
| CsatSection + StatisticFilter | Tambah `<StatisticFilter>` di atas CSAT cards. `selfContext` passed untuk agent `READ_OWN`. | `statistic:read*` | Loading: skeleton filter. Empty: filter visible, data empty. Error: fallback |
| ResponsivenessSection | Full structure: `ResponsivenessSection.tsx` → `StatisticFilter` (currently date-only), Tabs (All/Conversations/Ticket — **per-domain metricType, re-fetch on switch, not client-side filter**), `ResponsivenessFilterOptions`, `ResponsivenessSummaryContent`. SummaryContent = **5** `StatisticCards` (Avg Response Time, Avg FRT, **Avg Wait Time in Queue [NEW]**, **Avg RLT [NEW]**, Avg TTC — all with change indicators) + `SLABreakdownSection` (2-col grid: In SLA green / Over SLA red × FRT SLA, TTC SLA, Closed Rate SLA — each with count+percent; Wait Time/RLT excluded, no SLA target exists) + 3 charts (`BarChartResponseTimeByTime`, `LineChartAvgFirstResponseTimeByTime`, `LineChartAvgTimeToCloseByTime`). **Bug:** `hideTeamFilter` + `hideAgentFilter=true` prevents filtering SLA breakdown per agent/team. **Fix:** remove hide flags — hook already supports. SLA data already computed via RMQ in `responsiveness-analytics.service.ts:521-534`. See Appendix G/H for timeline + orphaned-metric detail. | `statistic:read*` | Loading: skeleton. Error: fallback |
| StatisticFilter (unified) | Refactor: `mode` prop replaces 3 boolean hide. Mode options: `full`, `date-team`, `date-only`, `self`. | N/A (component) | Loading: skeleton. |
| StatisticFilter — channel dropdown | Tambah dropdown channel di section yang relevan (Conversations, Ticket, CSAT). Hook sudah support `channelId`. | N/A | Loading: skeleton. Empty: placeholder "Semua channel" |
| StatisticFilter — platform dropdown | Tambah dropdown platform di section yang relevan. Hook sudah support `platformId`. | N/A | Loading: skeleton. Empty: placeholder "Semua platform" |
| ConversationsSection — priority chart | Card/grafik breakdown per priority (urgent, high, medium, low, none). | Self-scope apply | Loading: skeleton. Empty: "Belum ada data" |
| ConversationsSection — spam/junked card | Count card: spam, junked. | Self-scope apply | Loading: skeleton. Empty: 0 |
| ConversationsSection — group split | Card: group vs non-group. | Self-scope apply | Loading: skeleton. Empty: 0 |
| TicketSection — priority chart | Card/grafik breakdown per priority. | Self-scope apply | Loading: skeleton. Empty: "Belum ada data" |
| TicketSection — type chart | Card/grafik breakdown per ticket type. | Self-scope apply | Loading: skeleton. Empty: "Belum ada data" |
| TicketSection — channel chart | Card/grafik breakdown per platform/channel (mirip conversation `byPlatform`). | Self-scope apply | Loading: skeleton. Empty: "Belum ada data" |
| CsatSection — channel breakdown | Card/grafik CSAT per channel. | Self-scope apply | Loading: skeleton. Empty: "Belum ada data" |
| CsatSection — response rate card | Card percentage: `totalResponses / totalSent`. | Self-scope apply | Loading: skeleton. Empty: "N/A" |

---

## **11. Field & Validation**

| Field | Type | Required | Default | Validation | Notes |
|-------|------|----------|---------|------------|-------|
| `StatisticFilter.mode` | `enum` (`full`, `date-team`, `date-only`, `self`) | Yes (new prop) | `full` | Harus salah satu dari enum values | Mengganti `hideTeamFilter`, `hideAgentFilter`, boolean props. Backward compatible: props lama masih jalan. |
| `ConversationDailyMetrics.byPriority[]` | `Array<{priority: string, count: number}>` | No | `[]` | priority ∈ TicketPriorityEnum values + `"none"` | Additive field. Default empty array. |
| `ConversationDailyMetrics.counts.spam` | `number` | No | `0` | >= 0 | Additive field. |
| `ConversationDailyMetrics.counts.junked` | `number` | No | `0` | >= 0 | Additive field. |
| `ConversationDailyMetrics.counts.group` | `number` | No | `0` | >= 0 | Additive field. |
| `ConversationDailyMetrics.counts.nonGroup` | `number` | No | `0` | >= 0 | Additive field. |
| `TicketDailyMetrics.byPriority[]` | `Array<{priority: string, count: number}>` | No | `[]` | priority ∈ TicketPriorityEnum | Additive field. |
| `TicketDailyMetrics.byType[]` | `Array<{type: string, count: number}>` | No | `[]` | type dari ticket-type schema | Additive field. |
| `TicketDailyMetrics.byPlatform[]` | `Array<{platform: string, count: number}>` | No | `[]` | platform dari existing channel | Additive field. Mirip conversation `byPlatform[]`. |
| `CsatMetricsResponse.perChannel[]` | `Array<{channelCode: string, count: number, avgRating: number}>` | No | `[]` | Sudah ada di type, pastikan populated | Existing field, belum tentu populated. |
| `CsatMetricsResponse.responseRate` | `number` (0–1) | No | `0` | 0 <= x <= 1 | Derived: totalResponses / totalSent. Division by zero guard. |

---

## **12. API / Event Contract**

### **12.1 No New Endpoints**

Patch 2 **tidak menambah endpoint baru**. Semua perubahan di pipeline BE (analytics-service) yang mengisi daily-metrics dan response yang sudah ada.

### **12.2 Daily-Metrics Schema Changes (Additive)**

**`conversationdailymetrics` — new fields:**

| Field Path | Type | Default | Description |
|------------|------|---------|-------------|
| `byPriority[]` | `Array<{priority: string, count: number}>` | `[]` | Breakdown per conversation.priority |
| `counts.spam` | `number` | `0` | Count where isSpam=true |
| `counts.junked` | `number` | `0` | Count where isJunked=true |
| `counts.group` | `number` | `0` | Count where isGroup=true |
| `counts.nonGroup` | `number` | `0` | Count where isGroup=false |

**`ticketdailymetrics` — new fields:**

| Field Path | Type | Default | Description |
|------------|------|---------|-------------|
| `byPriority[]` | `Array<{priority: string, count: number}>` | `[]` | Breakdown per ticket.priority (TicketPriorityEnum) |
| `byType[]` | `Array<{type: string, count: number}>` | `[]` | Breakdown per ticket type/category |
| `byPlatform[]` | `Array<{platform: string, count: number}>` | `[]` | Breakdown per ticket platform/channel |

### **12.3 CSAT Response Enhancement**

| Field | Change | Notes |
|-------|--------|-------|
| `perChannel[]` | Pastikan populated dari `channelPlatformCode`/`channelId` | Sudah ada di type, pipeline belum populate |
| `responseRate` | Derived field: `totalResponses / totalSent` | FE compute dari existing data, atau BE tambah |

### **12.4 Existing Endpoint Response (unchanged)**

Semua endpoint analytics existing (`/analytics/*`, `/analytics/member/*`, `/analytics/responsiveness/*`, `/analytics/ticket/*`, `/analytics/broadcast/*`, `/analytics/metadata/*`) — response contract tidak berubah. Yang berubah: payload di dalam response (dimensi baru di daily-metrics).

### **12.5 Filter URL Params (already supported by hook)**

| Param | Hook Support | UI Render (Before) | UI Render (After) |
|-------|-------------|-------------------|-------------------|
| `startDate` | ✅ | ✅ | ✅ |
| `endDate` | ✅ | ✅ | ✅ |
| `teamId` | ✅ | ✅ (some sections) | ✅ (all relevant) |
| `agentId` | ✅ | ✅ (some sections) | ✅ (all relevant) |
| `channelId` | ✅ | ❌ | ✅ (dropdown added) |
| `platformId` | ✅ | ❌ | ✅ (dropdown added) |
| `source` | ✅ | ❌ | TBD |
| `type` | ✅ | ❌ | TBD |

---

## **13. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
|------|------|-------|------------|----------|
| **Filter Refactor (FR-003)** | Refactor `StatisticFilter` props dari 3 boolean ke `mode` enum. Backward compatible — boolean props masih fungsi jika `mode` tidak diset. | Engineering (FE) | Unit test: mode `full`, `date-team`, `date-only`, `self` masing-masing render filter yang benar. Backward: boolean props lama masih jalan. | Revert ke boolean props. |
| **CsatSection Filter (FR-001)** | Tambah `<StatisticFilter>` ke CsatSection. Pass `selfContext`. | Engineering (FE) | QA: admin buka CSAT → filter tampil. Agent buka CSAT → self filter locked. Data ter-filter. | Hapus `<StatisticFilter>` dari CsatSection. |
| **Responsiveness Re-enable (FR-002)** | Hapus `hideTeamFilter=true` dan `hideAgentFilter=true` dari ResponsivenessSection. | Engineering (FE) | QA: team + agent filter tampil di Responsiveness. Default = semua (no change). | Tambah kembali `hideTeamFilter=true` dan `hideAgentFilter=true`. |
| **Channel/Platform Dropdown (FR-004)** | Tambah dropdown channel dan platform ke StatisticFilter. Render per `mode`. | Engineering (FE) | QA: dropdown tampil di section yang relevan. Select channel → data ter-filter. | Hapus dropdown, flag `renderChannel=false`. |
| **Conversation Pipeline (FR-005, FR-006)** | Tambah dimensi `byPriority[]`, `counts.spam`, `counts.junked`, `counts.group`, `counts.nonGroup` ke aggregation pipeline daily-metrics conversation. | Engineering (BE) | QA: data baru muncul di daily-metrics. Card tampil di FE. Existing data tidak berubah. | Schema additive — hapus field baru (backward compatible). Pipeline tanpa dimensi baru. |
| **Ticket Pipeline (FR-007, FR-008)** | Tambah dimensi `byPriority[]`, `byType[]`, `byPlatform[]` ke aggregation pipeline daily-metrics ticket. | Engineering (BE) | QA: data baru muncul. Card tampil. | Schema additive — hapus field baru. |
| **CSAT Enhancement (FR-009)** | Pastikan `perChannel[]` populated. Tambah `responseRate` computation. | Engineering (BE) | QA: channel breakdown tampil. Response rate card tampil. | Hapus responseRate card. perChannel = kosong (default). |
| **UI Cards (FR-010)** | Tambah card/grafik baru di Conversations, Ticket, CSAT sections. | Engineering (FE) | QA: semua card tampil. Empty state benar. Filter sinkron. | Hapus card/grafik baru. |
| **Backfill** | Tidak diperlukan. Field baru additive dengan default (0/[]). Pipeline akan mengisi data baru pada next aggregation cycle. | N/A | N/A | N/A |
| **Rollout Stages** | 1. Deploy BE (schema additive + pipeline). 2. Deploy FE (filter refactor + new cards). 3. Monitor 24 jam. 4. Jika issue: FE revert filter, BE remove pipeline dimensi. | Engineering + PM | Smoke test: semua 6 section punya filter yang benar. Card baru tampil. Data existing tidak berubah. | FE: revert filter. BE: hapus pipeline dimensi. Schema additive aman (field baru diabaikan). |

---

## **14. Non-Functional Requirements**

| Category | Requirement |
|----------|------------|
| Performance | Dimensi baru di pipeline **MUST NOT** menambah aggregation time > 10% dari baseline. Pipeline sudah meng-scan collection yang sama — dimensi tambahan = group-by clause tambahan. |
| Performance | Channel/platform dropdown load **MUST** < 200ms. Data dari metadata endpoint yang sudah ada. |
| Backward Compatibility | Semua field baru di daily-metrics schema **MUST** punya default value (0 atau []). Dokumen lama tanpa field baru tidak break query. |
| Backward Compatibility | `StatisticFilter` boolean props lama **MUST** masih berfungsi setelah refactor. Deprecation = warning, bukan breaking. |
| Observability | Pipeline error per dimensi baru **MUST** logged (dimensi name, error, date, companyId). Jangan block dimensi lain. |
| Reliability | New dimensi bersifat additive — gagal hitung dimensi priority tidak boleh mengganggu dimensi existing (counts, replies, dll). |

---

## **15. Success Metrics**

| KPI | Target | Time Window | Data Source |
|-----|--------|-------------|-------------|
| Section dengan filter konsisten | 6/6 section punya filter yang sesuai | Post-deploy ver2.9/3.0 | Manual check: setiap section punya StatisticFilter (atau inline filter) |
| CsatSection punya filter | CsatSection = yes (sebelumnya 0) | Post-deploy | Code review + QA |
| Responsiveness punya team+agent | Responsiveness = date + team + agent (sebelumnya date-only) | Post-deploy | Code review + QA |
| Conversation new parameter visible | 4 parameter baru tampil (priority, spam, junked, group) | Post-deploy | QA: card/grafik tampil |
| Ticket new parameter visible | 3 parameter baru tampil (priority, type, channel) | Post-deploy | QA: card/grafik tampil |
| CSAT new parameter visible | 2 parameter baru tampil (channel breakdown, response rate) | Post-deploy | QA: card tampil |
| Existing data tidak berubah | 0 regression di metric existing | Post-deploy | Compare metric pre/post deploy: counts, replies, SLA unchanged |

---

## **16. Limitations**

| Limitation | Impact |
|-----------|--------|
| FE automated test tidak di-backfill (0 test infrastructure) | Filter refactor dan card baru tanpa FE safety net. Risk: regression di UI flow analytics. Mitigasi: manual QA checklist. |
| Shift-hours variant untuk conversation belum included | Ticket sudah punya shift-hours variant, conversation belum. Defers ke OQ-P2-05. |
| OQ-P2-01 s/d OQ-P2-05 belum resolved | Scope filter per section dan beberapa parameter bisa berubah tergantung keputusan PM. PRD ditulis dengan asumsi "semua section relevant" — bisa narrow down. |
| Pipeline dimensi baru = backfill data historis tidak included | Data baru hanya mulai dari deploy date. Data historis tidak punya breakdown priority/type. Mitigasi: acceptable untuk statistic harian. |
| `perChannel` di CSAT response type sudah ada tapi belum verified populated | Perlu verify pipeline CSAT service apakah `perChannel` sudah ter-isi atau perlu pipeline fix. |

---

## **17. Future Considerations**

| Item | Current Status | Future Action |
|------|---------------|---------------|
| Patch 3 — Interactive Dashboard / Drill-down | Belum dimulai | Patch 3 depend ke Patch 2: lebih banyak card = lebih banyak yang bisa di-klik |
| Per-stage SLA / SLA pause/hold time | Out of scope | Defer — L effort, schema change besar |
| Shift-hours variant untuk conversation | Ticket sudah punya | Evaluate: OQ-P2-05. Jika yes, conversation ikut punya shift-hours |
| Resolved conversation (vs closed) | `conversation.resolvedAt` ada | Perlu definisi: resolved vs closed. Defer. |
| FE automated test backfill | 0 test infrastructure | Defer ke QA initiative |
| `StatisticFilter` boolean props deprecation cleanup | Props lama masih jalan (backward compat) | Hapus boolean props setelah semua section migrasi ke `mode` |
| Source filter (`source` param di hook) | Hook support, belum di-render | Evaluate: perlu source filter (conversation vs ticket) di CSAT section? |

---

## **18. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
|-------------------|-------|--------|------------|
| **Dep:** Patch 1 (Agent Statistic Access) sudah di-prod atau selesai | Engineering (Naftal) | Patch 2 assume guard fix + backfill sudah jalan. Filter refactor build di atas self-scope yang sudah fix. | Patch 1 = blocker. Deploy Patch 2 setelah Patch 1 merge. |
| **Dep:** Analytics-service pipeline architecture | Engineering (BE) | Penambahan dimensi ke daily-metrics pipeline perlu mengikuti pattern existing (`byTag[]`, `byPlatform[]`). | Pattern sudah established — reuse. |
| **Risk:** Filter refactor break existing filter behavior | Engineering (FE) | Backward compatibility critical — boolean props lama harus masih jalan. | Unit test backward compat. Deprecation path, bukan hard cut. |
| **Risk:** Pipeline dimensi baru tambah aggregation time | Engineering (BE) | Response time analytics endpoint naik. | Benchmark pre/post. Dimensi tambahan = group-by clause, bukan collection scan baru. |
| **Risk:** CsatSection filter re-enable mengubah data yang terlihat | PM + QA | Data CSAT yang tadinya unfiltered sekarang ter-filter (saat user pilih filter). **Intended** tapi perlu QA. | Release note. Default = semua (no filter = perilaku lama). |
| **Risk:** OQ belum resolved → scope bisa berubah | PM | 5 Open Questions bisa mengubah scope. | PRD ditulis dengan scope terluas. PM resolve OQ sebelum dev start. |

---

## **19. Appendix**

### **A. Open Questions (TBD — Open, PM Decision)**

| ID | Question | Scope Impact | Blocking? | Status |
|----|----------|-------------|-----------|--------|
| OQ-P2-01 | Channel/platform filter di SEMUA section atau hanya section yang relevan? | Menentukan section mana yang render channel/platform dropdown | Yes (scope filter) | **Open — PM decision** |
| OQ-P2-02 | Responsiveness: team + agent filter di-re-enable atau emang sengaja di-hide? | Jika sengaja di-hide → scope filter fix berkurang | Yes (scope filter) | **Open — PM decision** |
| OQ-P2-03 | Ticket priority + type breakdown = P0 atau P1? | Effort M, value tinggi. Jika P0 → scope bertambah | Medium | **Open — PM decision** |
| OQ-P2-04 | CSAT channel breakdown: perlu sekarang atau defer? | Effort kecil (S). Jika defer → CSAT hanya response rate | Low | **Open — PM decision** |
| OQ-P2-05 | Shift-hours variant untuk conversation: perlu? | Ticket sudah punya. Jika yes → scope bertambah (M effort) | Low | **Open — PM decision** |
| OQ-P2-06 | Wait Time in Queue dan RLT — masuk sebagai summary card baru di Patch 2 (raw average saja, tanpa SLA breakdown), atau ditunda sampai Patch 4 kalau mau sekalian dengan SLA target? | Menentukan apakah FR-002a masuk Patch 2 atau digeser seluruhnya ke Patch 4 | Yes (scope Responsiveness) | **Open — PM decision** |

### **B. Filter State Inventory (Current — Before Patch 2)**

| Section | Current Filter | Problem | After Patch 2 |
|---------|---------------|---------|---------------|
| Conversations | date + team + agent (`<StatisticFilter>`) | channel/platform hook support tapi tidak render | date + team + agent + channel + platform |
| Ticket | date + team + agent (`<StatisticFilter>`) | channel/platform hook support tapi tidak render | date + team + agent + channel + platform |
| Responsiveness | **date ONLY** (`hideTeamFilter` + `hideAgentFilter=true`) | team + agent filter hilang | date + team + agent |
| Member Performance | inline (date + agent) | tanpa `<StatisticFilter>` component | (no change — inline) |
| CSAT | **TANPA FILTER** | zero filter, no selfContext | date + team + agent (+ selfContext for READ_OWN) |
| Broadcast | date + team (`hideAgentFilter`) | agent hilang | (evaluate per OQ) |

### **C. Parameter Inventory Summary (Patch 2 Scope)**

**Conversation (🟡 quick win):**

| Parameter | Source Field | Effort |
|-----------|------------|--------|
| Per priority | `conversation.priority` | S |
| Spam count | `conversation.isSpam` | S |
| Junked count | `conversation.isJunked` | S |
| Group vs non-group | `conversation.isGroup` | S |

**Ticket (🔵 butuh compute):**

| Parameter | Source Field | Effort |
|-----------|------------|--------|
| Per priority | `ticket.priority` (TicketPriorityEnum) | M |
| Per type/category | `ticket-type.schema.ts` | M |
| Per channel/platform | `ticket.platform` | M |

**CSAT (🟡):**

| Parameter | Source Field | Effort |
|-----------|------------|--------|
| Per channel breakdown | `channelPlatformCode`, `channelId` | S |
| Response rate | derived: `totalResponses/totalSent` | S |

### **D. `StatisticFilter` Mode Specification**

| Mode | Renders | Target Section |
|------|---------|---------------|
| `full` | date + team + agent + channel + platform | Conversations, Ticket |
| `date-team-agent` | date + team + agent | Responsiveness (after re-enable) |
| `date-team` | date + team | Broadcast (existing behavior) |
| `date-only` | date only | (deprecation fallback) |
| `self` | date + self chip (locked) | CSAT (agent READ_OWN) |

### **E. Glossary**

| Term | Definition |
|------|-----------|
| `StatisticFilter` | React component yang render filter bar di halaman statistic (date, team, agent, channel, platform). |
| `useStatisticFilter` | React hook yang sync filter state ke URL params. Support 8 param: agentId, channelId, endDate, memberAgentId, platformId, source, startDate, teamId, type. |
| `selfContext` | Context yang meng-identifikasi user saat ini untuk self-scope filtering. Di-pass ke StatisticFilter agar agent `READ_OWN` melihat data sendiri. |
| `mode` | Single prop baru di StatisticFilter yang mendefinisikan kombinasi filter yang tampil. Mengganti 3 boolean hide props. |
| `byPriority[]` | Array dimensi baru di daily-metrics schema — breakdown count per priority value. |
| `byType[]` | Array dimensi baru di ticket daily-metrics — breakdown per ticket type/category. |
| `perChannel[]` | Array di CSAT response type — breakdown CSAT per channel/platform. Sudah ada di type, perlu populated. |
| Daily-metrics pipeline | Aggregation pipeline di analytics-service yang mengisi collection `conversationdailymetrics` dan `ticketdailymetrics` per hari. |

### **F. References**

- Change Intake Brief: `Assessments/cross-domain/agent-statistic-access/statistic-parameter-improvement-change-intake-brief.md` v1.0
- Parameter Inventory: `Assessments/cross-domain/agent-statistic-access/statistic-parameter-inventory-conversation-ticket.md`
- Patch 1 PRD: `PRD/Analytics/Statistic/PRD Analytics - agent statistic access.md`
- 3-Patch Decomposition: `Assessments/cross-domain/agent-statistic-access/statistic-3-patch-decomposition-analysis.md`
- FE StatisticFilter: `apps/omnichannel/components/statistic/StatisticFilter.tsx`
- FE useStatisticFilter hook: `apps/omnichannel/hooks/useStatisticFilter.ts`
- BE ConversationDailyMetrics: `apps/analytics-service/src/app/schemas/conversation-daily-metrics.schema.ts`
- BE TicketDailyMetrics: `apps/analytics-service/src/app/schemas/ticket-daily-metrics.schema.ts`
- BE CsatMetricsResponse: `libs/common/src/lib/database/schemas/base-csat.schema.ts`

### **G. Responsiveness Section — Component Tree & SLA Breakdown**

> **Context:** SLA breakdown data already exists in the codebase — computed via RMQ call to conversation-service/ticket-service in `responsiveness-analytics.service.ts:521-534`. This is NOT a new parameter to add. The only change needed is UI filter re-enable (remove `hideTeamFilter` + `hideAgentFilter`).
>
> **Prototype update:** summary content is actually **5 cards, not 3** — 2 metrics (Wait Time in Queue, RLT) are computed and stored BE-side but never surfaced (see PS-007, FR-002a). Also: SLA breakdown + summary values are **per-domain** (differ across All/Conversations/Ticket tabs), not one shared dataset filtered client-side (see PS-002 update).

```
ResponsivenessSection.tsx
├── StatisticFilter (date-only currently — hideTeamFilter + hideAgentFilter=true)
├── Tabs — ResponsivenessType filter (All / Conversations / Ticket)
│   └── switching tab re-fetches distinct per-domain metricType values
│       (e.g. conversation_frt vs ticket_frt) — NOT a client-side filter
├── ResponsivenessFilterOptions
└── ResponsivenessSummaryContent.tsx
    ├── 5× StatisticCards — summary
    │   ├── Average Response Time (ART) (+ change indicator) — existing
    │   ├── Average First Response Time (FRT) (+ change indicator) — existing
    │   ├── Average Wait Time in Queue (+ change indicator) — [NEW, FR-002a] raw avg, no SLA breakdown
    │   ├── Average Response Lead Time (RLT) (+ change indicator) — [NEW, FR-002a] raw avg, no SLA breakdown
    │   └── Average Time to Close (TTC) (+ change indicator) — existing
    ├── SLABreakdownSection.tsx
    │   └── 2-column grid × 3 metrics (unchanged — Wait Time/RLT excluded, no SLA target exists yet):
    │       ├── In SLA (green) / Over SLA (red)
    │       ├── FRT SLA → count + percent
    │       ├── TTC SLA → count + percent
    │       └── Closed Rate / Solving SLA → count + percent
    └── 3× Charts
        ├── BarChartResponseTimeByTime
        ├── LineChartAvgFirstResponseTimeByTime
        └── LineChartAvgTimeToCloseByTime
```

**Key insight:** `useResponsivenessSection` hook uses `useStatisticFilter` (supports `teamId`, `agentId`) but the UI hides those filters. The fix is purely UI — remove hide flags. No backend changes needed for filter re-enable.

### **H. Responsiveness Timeline (T1 → T4) — Metric Definitions**

```
T1                          T2                              T3                       T4
firstCustomerMessageAt ──▶ firstAgentAssignmentAt ──▶ agentReplyAt ──▶ ... ──▶ closedAt
        │                          │                        │                    │
        └── Wait Time in Queue ────┘                        │                    │
        │        (T2 − T1, wall-clock)                      │                    │
        │                          └── Response Lead Time ──┘                    │
        │                                (T2 − T3, business/office-hours time,   │
        │                                 falls back to wall-clock outside       │
        │                                 office hours)                         │
        └── First Response Time (FRT) ─────────────────────┘                    │
                 (T1 − T3, raw wall-clock, minus pausedMs — different formula    │
                  from RLT despite overlapping range)                           │
        └── Time to Close (TTC) ──────────────────────────────────────────────┘
                 (T4 − conversationCreatedAt, minus pausedMs)
```

| Metric | Range | Field | Computed by | Formula | Status |
|--------|-------|-------|-------------|---------|--------|
| Average Response Time (ART) | per-reply | — | `computeResponseMs()` — `agent-conversation-metrics.service.ts:300` | `replyAt − lastUserMessageAt`, averaged per reply | Existing, shown |
| Average First Response Time (FRT) | T1 → T3 | — | `calculateFrtMs()` — `conversation-sla-metrics.service.ts:649` | `agentReplyAt − firstCustomerMessageAt − pausedMs` | Existing, shown |
| Average Wait Time in Queue | T1 → T2 | `waitTimeInQueueMs` — `conversation-sla-metrics.schema.ts:102` | `conversation-sla-metrics.repository.ts:189` | `firstAgentAssignmentAt − firstCustomerMessageAt` | **Orphaned — not shown** |
| Average Response Lead Time (RLT) | T2 → T3 | `rltMs` — `conversation-sla-metrics.schema.ts:109` | `calculateRltMs()` — `conversation-sla-metrics.service.ts:666` | `businessMsBetween(firstAgentAssignmentAt, agentReplyAt)` (office-hours aware, wall-clock fallback) | **Orphaned — not shown** |
| Average Time to Close (TTC) | conversationCreatedAt → T4 | — | `calculateTtcMs()` — `conversation-sla-metrics.service.ts:939` | `closedAt − conversationCreatedAt − pausedMs` | Existing, shown |

**Why FRT ≠ RLT:** both roughly cover "how fast did the agent respond", but FRT measures from the customer's first message (T1→T3, raw wall-clock), while RLT measures from assignment (T2→T3, business-time aware). They can diverge significantly when queue wait is long or replies land outside office hours.

**Orphaned data root cause:** `waitTimeInQueueMs` and `rltMs` are computed and stored in conversation-service's `conversation-sla-metrics` collection, but neither value is included in `ResponsivenessMetricType` enum (`responsiveness-metrics.schema.ts`, analytics-service) — so neither reaches the pre-aggregated collection or the FE. Fixing this (FR-002a) requires extending that enum; adding SLA in/over breakdown on top of that is out of scope for Patch 2 (see §2 Scope Definition, §19.A OQ-P2-06) — deferred to Patch 4.
