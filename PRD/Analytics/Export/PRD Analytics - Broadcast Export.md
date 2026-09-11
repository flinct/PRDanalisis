# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Broadcast Export (Recipient + Campaign Level)
**Product Manager**: Dany Christian
**Engineering Lead**: Naftal Yunior
**Design Lead**: TBD
**Version**: v2.0
**TRD**: `trd/trd-advance-export-phase-3-broadcast-export.md` (to be created)
**Link**: #3191 (Phase-C advance export - Broadcast Export)
**Contributors**: Dany Christian

## **1. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD for Sub-PRD C: broadcast export dengan recipient-level + campaign-level granularity, broadcast-specific filters, dan redirect dari Broadcast page. |
| v2.0 | 2026-08-19 | Dany Christian | Tech-review revisions: (B-01) status vocabulary dikoreksi ke `BroadcastStatusEnum` 12 nilai backend + FE display mapping table, semua count columns di §10.2/FR-022/FR-031/Appendix A disesuaikan; (B-02) campaign grouping pakai `batchId` (PRD-A v2.1) bukan `broadcastId`, metadata kampanye dari `batchName`/`BroadcastBatch.name`; (B-03) Broadcast Channel dan Source dipisah jadi 2 filter terpisah (platform vs type); (B-04) US-013 INVALID_REQUEST rows DEFERRED — tidak ada domain record saat ini, hapus FR-025 requestId fallback, EH-008, EC-001, 4 baris Appendix B; (B-05) cap 20K dipertahankan, EC-004 dikoreksi jadi rejection, KPI 1M row dihapus, 4 user story edge case ditambah; (B-06) untestable ACs diperbaiki — US-008 AC2 pakai vocabulary nyata + batchId, US-009 pakai StatisticPermission, US-014 AC2 selaras FR-009 cleared, US-010 AC3 pakai job doc bukan audit log; (B-07) FR-034..037 ditulis ulang sebagai new FE work dengan URL param contract table; (B-08) NFR group Async Job & Delivery ditambah, FR-044 tutup live maskPii gap, consent line di §15; (B-09) EH-007/EH-010/expiry dipromosi ke P1 user story; (B-10) metrics + feature flag sebagai shared platform dependency di §12; nit 1..24 applied: metadata header lengkap, 30→31 hari, attemptNumber clarification, column count dikoreksi ke 20, Appendix B + Source column, templateUsed ObjectId note, messageContent truncation, N-query fan-out note, senderNumber de-flag PII, KR 100%→80%, KR file-size dihapus, EC-005/EC-010 column count fixed, Jenis Laporan→Tipe Laporan, UI-copy table Appendix F ditambah, BroadcastStatusField = extension bukan component baru, §14 cross-ref §2, Appendix A syntax fix + Stage 3 completed, Appendix B Source column added, escaped-markdown artifacts cleaned. |

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Extend the configurable column export system (PRD-B) to the broadcast domain dengan broadcast-specific UX: recipient-level dan campaign-level granularity toggle, broadcast-specific filters (channel, source, status, creator, team inbox), dan redirect dari Broadcast page. Supersedes legacy §17 "Default Broadcast" fixed-template approach. |
| Scope | Broadcast domain in column picker dengan recipient-level dan campaign-level export modes. Broadcast-specific filter UI. Campaign-level aggregation pipeline. Redirect dari Broadcast > Messages > Export. Feature-flagged migration dari §17 legacy template. |
| Key Capabilities | (1) Recipient-level granularity: 1 row = 1 broadcast recipient dari `broadcastexportdata`. (2) Campaign-level granularity: 1 row = 1 broadcast campaign dengan aggregate counts, grouped by `batchId` (PRD-A v2.1). (3) Broadcast-specific filters: Broadcast Channel (platform), Source (type), broadcast status, creator, team inbox, date type selector. (4) Integrasi dengan PRD-B column picker, query builder, dan SheetJS in-memory XLSX (20K cap). (5) Feature-flagged coexistence dengan §17 legacy template selama migrasi. |
| Outcome | Admin dan Supervisor dapat export broadcast data di granularity recipient atau campaign, dengan configurable column selection dan broadcast-specific filtering, menggantikan fixed-template approach. |
| Phase Slug | `advance-export-phase-3-broadcast-export` |

### **Scope Definition**

| In Scope | Out of Scope | Owned By |
| ----- | ----- | ----- |
| Broadcast domain column picker (registry `domainId = broadcast`) | Column registry definition dan population | PRD-B |
| Granularity toggle: Per Penerima (recipient-level) vs Per Kampanye (campaign-level) | Dynamic query builder core infrastructure | PRD-B |
| Broadcast-specific filters: Broadcast Channel, Source, status, creator, team inbox, date type | XLSX generation infrastructure (SheetJS) | PRD-B |
| Campaign-level aggregation pipeline (MongoDB `$group` by `batchId`) | `broadcastexportdata` collection schema + sync pipeline | PRD-A |
| Column set untuk campaign-level (aggregate columns) | Conversation/ticket export | PRD-B |
| Redirect dari Broadcast > Messages > Export dengan URL param prefill | SAP 4-sheet template | Sub-PRD D |
| Feature-flagged migration dari §17 legacy template | User-saved presets (P2 — future) |  |
| Campaign-level computed columns di column registry | Email delivery of export results | §14 Future |
| FR-044: maskPii gap closed for broadcast row mapper | Scheduled/recurring exports | §14 Future |

**Cross-phase dependencies (dari PRD-A v2.1):**
- `broadcastexportdata` must exist dengan fields: `batchId` (campaign key = `BroadcastBatch._id`), `batchName` (clean dari `BroadcastBatch.name`), `broadcastId` (recipient PK = `Broadcast._id`), `broadcastChannel` (= `Broadcast.platform`: whatsapp_web/whatsapp_api), `source` (= `Broadcast.type`: manual/import/open-api), `status` (raw `BroadcastStatusEnum` 12 values).
- PRD-B column registry, column picker, query builder, SheetJS XLSX, job pipeline.

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Broadcast export saat ini menggunakan fixed "Default Broadcast" template (§17) — 20 kolom hardcoded, user tidak bisa memilih subset. | Users harus export semua 20 kolom meski hanya butuh beberapa, menghasilkan file yang besar. |
| PS-002 | Tidak ada campaign-level broadcast export — hanya recipient-level data yang tersedia. | Manager/Supervisor yang butuh ringkasan performa kampanye (total penerima, success rate, failure count) harus aggregate manual dari recipient-level export di spreadsheet. |
| PS-003 | Broadcast export tidak terintegrasi dengan PRD-B column picker. | Broadcast tertinggal saat conversation dan ticket export migrasi ke configurable columns, menciptakan UX yang tidak konsisten. |
| PS-004 | Tidak ada broadcast-specific date type selection. | Users tidak bisa membedakan filter berdasarkan `createdAt` (kapan broadcast dibuat) vs `scheduledAt` (kapan dijadwalkan). |
| PS-005 | Tidak ada filter creator atau team inbox pada configurable export untuk broadcast. | Users tidak bisa narrowing broadcast exports ke kreator/team tertentu tanpa post-export filtering. |

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enable configurable column selection untuk broadcast exports | ≥ 80% of new broadcast export jobs use column picker (vs legacy template) dalam 30 hari post-launch. |
| Provide campaign-level broadcast summaries | Users dapat export 1-row-per-campaign dengan aggregate counts tanpa manual spreadsheet aggregation. |
| Maintain PII governance untuk broadcast PII fields | 100% broadcast jobs yang mengandung kolom PII (recipientNumber, recipientName) memerlukan explicit user acknowledgment sebelum submit. |
| Preserve existing broadcast export reliability | Job completion rate ≥ 98% (matching existing offline-report KPI). |

## **5. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to select "Broadcast" as Tipe Laporan so I can export broadcast data dari Offline Report page. | 1. Given I open the Offline Report page, When I select "Broadcast" as Tipe Laporan, Then the column picker shows broadcast-domain columns grouped by category. 2. Given I switch from "Broadcast" ke "Tiket", When the picker reloads, Then broadcast-specific filters tersembunyi dan column selections cleared. 3. Given I select "Broadcast", When the form updates, Then broadcast-specific filters (Broadcast Channel, Source, status, creator, team inbox, granularity, date type) muncul. |
| US-002 | P0 | As an Admin, I want to choose between recipient-level dan campaign-level granularity so I can export data at the right level of detail. | 1. Given I select "Broadcast", When I view the Granularity toggle, Then I see "Per Penerima" dan "Per Kampanye". 2. Given I select "Per Kampanye", When the column picker updates, Then campaign-level aggregate columns ditampilkan: Total Penerima, Terkirim, Sedang Dikirim, Terjadwal, Gagal, Dibatalkan, Nomor Tidak Valid, Tingkat Keberhasilan. 3. Given I switch dari "Per Kampanye" ke "Per Penerima", When the picker reloads, Then recipient-level columns ditampilkan dan campaign-level selections cleared. |
| US-003 | P0 | As an Admin, I want to pick specific broadcast columns dari searchable list so I can export only the data I need. | 1. Given the column picker is open untuk Broadcast domain, When I search "status", Then semua broadcast columns dengan "status" di display name atau description ditampilkan. 2. Given I expand category "Status & Siklus Hidup", When I view columns, Then I see broadcast status fields dengan checkboxes. 3. Given I select 8 columns, When I submit the job, Then XLSX berisi hanya 8 kolom tersebut sebagai header, dalam urutan yang dipilih. |
| US-004 | P0 | As an Admin, I want to filter broadcast exports by Broadcast Channel so I can separate WhatsApp API dan WhatsApp Web records. | 1. Given I select "Broadcast", When I view the Broadcast Channel filter, Then I see multi-select dengan options "WhatsApp API" (`whatsapp_api`) dan "WhatsApp Web" (`whatsapp_web`). 2. Given I select "WhatsApp API", When I submit, Then hanya broadcast records dari platform `whatsapp_api` yang diexport. 3. Given I leave Broadcast Channel empty, When I submit, Then semua channels dalam scope diinclude. |
| US-004a | P1 | As an Admin, I want to filter broadcast exports by Source so I can separate manual, import, dan Open API-originated broadcasts. | 1. Given I select "Broadcast", When I view the Source filter, Then I see multi-select dengan options "Manual" (`manual`), "Import" (`import`), "Open API" (`open-api`). 2. Given I select "Open API", When I submit, Then hanya broadcasts yang dibuat via Open API integration yang diexport. 3. Given I leave Source empty, When I submit, Then semua sources diinclude. |
| US-005 | P0 | As an Admin, I want to filter broadcast exports by broadcast status so I can focus on specific delivery statuses. | 1. Given I select "Broadcast", When I open the Status filter, Then I see display statuses: Terkirim (delivered), Sedang Dikirim (sending: pending+processing+sent), Terjadwal (scheduled: schedule), Gagal (failed), Tidak Valid (invalid), Dibatalkan (canceled). 2. Given I select "Gagal" dan "Tidak Valid", When I submit, Then hanya rows dengan backend statuses dalam grup tersebut yang diexport. 3. Given I leave Status empty, When I submit, Then semua broadcast statuses diinclude. |
| US-006 | P0 | As an Admin, I want to choose between createdAt dan scheduledAt as the date type so I can filter by when the broadcast was created or scheduled. | 1. Given I select "Broadcast", When I view the Date Type selector, Then I see "Tanggal Dibuat" (createdAt) dan "Tanggal Terjadwal" (scheduledAt). 2. Given I select "Tanggal Terjadwal" dan set a date range, When I submit, Then hanya broadcasts yang dijadwalkan dalam range tersebut yang diexport. 3. Given I select "Tanggal Dibuat", When I submit, Then date range memfilter berdasarkan broadcast creation time. |
| US-007 | P0 | As an Admin, I want to filter by Creator dan Team Inbox so I can export broadcasts untuk person atau team tertentu. | 1. Given I select "Broadcast", When I open the Creator filter, Then I see multi-select of users yang membuat broadcasts dalam permission scope saya. 2. Given I select specific creators, When I submit, Then hanya broadcasts yang dibuat oleh user tersebut yang diexport. 3. Given I select a Team Inbox, When I submit, Then hanya broadcasts dari team inbox tersebut yang diinclude. |
| US-008 | P0 | As an Admin, I want campaign-level exports to show aggregate counts per broadcast campaign so I can see broadcast performance at a glance. | 1. Given I select "Per Kampanye" granularity, When the XLSX is generated, Then each row represents one broadcast campaign (grouped by `batchId`). 2. Given a broadcast campaign (`batchId=X`) sent to 1000 recipients — 800 `delivered`, 150 `failed`, 50 `invalid`, 0 non-terminal — When exported, Then row shows: Total Penerima=1000, Terkirim=800, Gagal=150, Tidak Valid=50, Tingkat Keberhasilan=80.00%, dan Campaign Status=Selesai (semua recipients di terminal state). 3. Given I select campaign-level columns [batchName, totalRecipients, successCount, failedCount], When exported, Then headers use Bahasa display names dari registry. |
| US-008a | P1 | As an Admin, I want exports to clearly indicate whether a campaign is still in progress so I do not misread a partial successRate. | 1. Given a campaign has 200 `delivered`, 0 `failed`, 800 `pending`/`processing` (non-terminal), When exported at campaign-level, Then Campaign Status = "Berlangsung" dan successRate ditampilkan sebagai partial (e.g. 20.00% dari total 1000). 2. Given Campaign Status = "Berlangsung", When I read the XLSX, Then kolom `campaignStatus` menunjukkan "Berlangsung" sehingga saya tahu aggregat belum final. 3. Given all recipients di terminal state (delivered/failed/invalid/canceled), When exported, Then `campaignStatus` = "Selesai". |
| US-008b | P1 | As an Admin, I want to filter campaign-level exports to show only campaigns with failures so I can prioritize follow-up. | 1. Given I am in campaign-level granularity, When I apply filter Status = "Gagal", Then hanya campaigns yang memiliki setidaknya 1 recipient dengan status `failed` yang diexport. 2. Given no failures exist for the selected date range, When exported, Then headers-only XLSX dengan pesan "Tidak ada data dengan kriteria ini". |
| US-008c | P1 | As an Admin, I want clear feedback when my campaign export hits the row cap so I know to narrow my filters. | 1. Given my filter returns more than 20,000 recipient rows untuk recipient-level export, When I submit, Then job rejected dengan pesan "Jumlah data melebihi batas 20.000 baris. Persempit filter tanggal atau gunakan export Per Kampanye untuk ringkasan". 2. Given I switch to campaign-level, When I submit, Then aggregation runs (campaign count typically <<20K). 3. Given campaign-level aggregation result exceeds 20K rows (sangat jarang, >20K unique batches), When exported, Then same cap error dengan saran "persempit rentang tanggal". |
| US-008d | P1 | As an Admin, I want to understand how deleted or expired campaigns appear in exports so I can trust the data. | 1. Given a broadcast batch was deleted dari operational store, When I export broadcastexportdata within its 180-day retention window, Then recipient rows MASIH muncul (analytics collection adalah independent source for export — operational delete tidak otomatis hapus analytics). 2. Given `batchName` is null untuk orphaned rows (batch sudah tidak ada), When exported at campaign-level, Then campaign row ditampilkan dengan batchName = "-" bukan error. 3. Given `expireAt` sudah lewat (>180 hari), When exported, Then rows tersebut tidak muncul (TTL index sudah hapus). |
| US-009 | P0 | As a Supervisor, I want broadcast export scoped to my permission so I do not export other team's broadcast data. | 1. Given I am a Supervisor dengan `StatisticPermission.READ_TEAM`, When I submit a broadcast export job, Then hanya broadcasts yang terkait dengan Team Inbox dalam scope saya yang diexport. Row-level scoping pada `broadcastexportdata` berdasarkan `teamInboxIdAtSendTime` untuk role READ_TEAM adalah **new work** (saat ini enforcement hanya di job-list visibility, bukan row-level filter). 2. Given I am a Supervisor, When I view the Creator filter, Then saya hanya melihat creators dalam Team Inbox scope saya. 3. Given I am a Supervisor, When I view the job list, Then saya hanya melihat broadcast export jobs milik saya sendiri. |
| US-010 | P0 | As an Admin, I want PII columns flagged with a warning so I can make an informed decision before exporting recipient phone numbers. | 1. Given I select recipientNumber dan recipientName, When I attempt to submit, Then PII confirmation dialog muncul. 2. Given I cancel the PII confirmation, When the dialog closes, Then PII columns deselected. 3. Given I confirm the PII warning, When submission proceeds, Then acknowledgment disimpan pada job document di `parameters.piiAcknowledgedBy` (userId) dan `parameters.piiAcknowledgedAt` (timestamp) — bukan pada audit log (tidak ada audit sink saat ini). |
| US-011 | P0 | As an Admin, I want the redirect dari Broadcast > Messages > Export to prefill the report type and filters so I can quickly export. | 1. Given I click Export dari Broadcast > Messages page, When the Offline Report page opens, Then Tipe Laporan adalah "Broadcast" (prefilled via URL param `create=broadcast`). 2. Given the redirect passes filter params sesuai URL contract di §10.1, When the form loads, Then Date Range, Status, Broadcast Channel, Source, Creator, dan Team Inbox prefilled dari param yang valid. 3. Given I review the prefilled values, When I modify them, Then updated values digunakan untuk export job. |
| US-012 | P1 | As an Admin, I want the export XLSX to contain exactly the columns I selected in the order I selected them with Bahasa display names as headers. | 1. Given I select columns [batchName, broadcastChannel, recipientNumber, status], When the XLSX is generated, Then headers are [Nama Kampanye, Channel Broadcast, Nomor Penerima, Status] dalam urutan tersebut. 2. Given a field value is null untuk satu row, When exported, Then cell menampilkan "-". 3. Given I select campaign-level columns, When exported, Then aggregate column headers menggunakan Bahasa display names (Total Penerima, Terkirim, Gagal, dll.). |
| US-014 | P1 | As an Admin, I want the column picker to remember my last broadcast selection so I do not have to re-pick columns every time. | 1. Given I previously exported broadcast dengan columns [A, B, C], When I open the column picker untuk Broadcast domain lagi, Then columns tersebut pre-selected. 2. Given I switch granularity, When the picker reloads, Then column selections CLEARED (sesuai FR-009 — selections tidak valid lintas granularity; saved selections per granularity disimpan terpisah di localStorage). |
| US-015 | P1 | As an Admin, I want a clear notification when my export job file expires so I know to re-run the export. | 1. Given a completed export file, When 7 hari telah berlalu sejak job selesai, Then file deleted dan link menjadi invalid (expired). 2. Given I click a Download link setelah file expired, When the request fails, Then UI menampilkan "File export sudah kedaluwarsa (7 hari). Buat ulang laporan untuk data terbaru". 3. Given I submit a new export job, When processing selesai, Then download link valid selama 7 hari. |
| US-016 | P1 | As an Admin, I want to understand aggregation failure clearly so I know how to recover. | 1. Given campaign-level aggregation times out atau exceeds memory, When job fails, Then job status = FAILED dengan pesan "Gagal membuat laporan. Coba kurangi rentang tanggal atau gunakan filter yang lebih spesifik". 2. Given I retry dengan narrower date range (e.g. 7 hari vs 31 hari), When I submit, Then aggregation likely completes. 3. Given the result set is empty setelah aggregation, When job completes, Then XLSX dengan headers-only digenerate dengan pesan "Laporan selesai tanpa data". |

## **6. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| **Domain Registration** | FR-001 [P0]: System MUST support `domainId = broadcast` dalam column picker, query builder, dan export job pipeline. FR-002 [P0]: System MUST register broadcast-domain columns di `exportcolumnregistry` untuk recipient-level dan campaign-level granularity. FR-003 [P0]: Recipient-level columns MUST map 1:1 ke `broadcastexportdata` collection fields (PRD-A §10.3 — semua fields termasuk `batchId`, `batchName`, `broadcastId`, `broadcastChannel`, `source`). FR-004 [P0]: Campaign-level columns MUST include aggregate computed columns yang tidak ada di collection (totalRecipients, successCount, dll. — lihat Appendix A). |
| **Granularity Toggle** | FR-005 [P0]: System MUST provide "Granularity" toggle pada Broadcast export form dengan values "Per Penerima" (recipient-level) dan "Per Kampanye" (campaign-level). FR-006 [P0]: Default granularity MUST be "Per Penerima". FR-007 [P0]: Ketika granularity berubah, system MUST reload column picker dengan columns sesuai granularity yang dipilih. FR-008 [P0]: System MUST store selected granularity dalam job parameter snapshot. FR-009 [P0]: Column selections MUST be CLEARED when granularity changes — columns valid untuk satu granularity tidak valid untuk yang lain. localStorage menyimpan selections terpisah per granularity (satu set untuk recipient, satu set untuk campaign). |
| **Broadcast-Specific Filters** | FR-010 [P0]: System MUST show a Broadcast Channel multi-select filter dengan values `whatsapp_api` ("WhatsApp API") dan `whatsapp_web` ("WhatsApp Web") ketika Tipe Laporan = Broadcast. Values dari `BroadcastPlatformEnum` (`libs/common/src/lib/enums/index.ts:705`). FR-010a [P1]: System MUST show a separate Source multi-select filter dengan values `manual` ("Manual"), `import` ("Import"), `open-api` ("Open API") ketika Tipe Laporan = Broadcast. Values dari `BroadcastTypeEnum` (enums:1218). FR-011 [P0]: Broadcast status filter MUST use the FE display status grouping (lihat tabel di bawah), di-translate ke backend `BroadcastStatusEnum` sebelum query. FR-012 [P0]: System MUST provide Creator multi-select filter dari `creatorUserId`/`creatorName` values di `broadcastexportdata` dalam tenant + permission scope requester. FR-013 [P0]: System MUST provide Team Inbox multi-select filter dari `teamInboxIdAtSendTime`/`teamInboxNameAtSendTime` dalam permission scope requester. FR-014 [P0]: System MUST provide Date Type selector dengan options "Tanggal Dibuat" (maps ke `createdAt`) dan "Tanggal Terjadwal" (maps ke `scheduledAt`). FR-015 [P0]: Default Date Type = "Tanggal Dibuat". FR-016 [P0]: Semua broadcast-specific filters disimpan dalam job parameter snapshot. FR-017 [P0]: Empty Broadcast Channel selection = all channels dalam scope. FR-017a [P1]: Empty Source selection = all sources. FR-018 [P0]: Empty Status selection = all statuses. FR-019 [P0]: Empty Creator selection = all creators dalam scope. FR-020 [P0]: Empty Team Inbox selection = all team inboxes dalam scope. |
| **Status Display Mapping** | FR-011a [P0]: Broadcast Status filter menggunakan display-level grouping berikut, ditranslate ke backend `BroadcastStatusEnum` sebelum query ke `broadcastexportdata.status`: Terkirim (`delivered`), Sedang Dikirim (`pending`, `processing`, `sent`), Terjadwal (`schedule`), Gagal (`failed`), Tidak Valid (`invalid`), Dibatalkan (`canceled`). Status backend `raw`, `text_processing`, `text_processed`, `retry` tidak diexpose sebagai filter option (internal processing states). Note: saat ini legacy export filter hanya mengekspos 4 status — PRD ini memperluas ke 6 display status dengan mapping yang proper. |
| **Campaign-Level Aggregation** | FR-021 [P0]: Ketika granularity = "Per Kampanye", system MUST execute MongoDB aggregation pipeline yang groups `broadcastexportdata` rows by `batchId` (PRD-A v2.1 — bukan `broadcastId`; `broadcastId` adalah recipient PK, bukan campaign key). FR-022 [P0]: Campaign-level aggregation MUST produce per-campaign aggregate counts: `totalRecipients`, `successCount` (delivered), `inProgressCount` (pending+processing+sent), `scheduledCount` (schedule), `failedCount` (failed), `canceledCount` (canceled), `invalidCount` (invalid). FR-022a [P0]: Campaign-level aggregation MUST derive `campaignStatus`: "Selesai" jika tidak ada recipients dalam non-terminal state (`raw`, `text_processing`, `text_processed`, `schedule`, `pending`, `processing`, `sent`, `retry`); "Berlangsung" jika ada. FR-023 [P0]: Campaign-level rows MUST carry batch-level metadata dari PRD-A v2.1 `broadcastexportdata` batch fields: `batchId`, `batchName` (clean campaign name dari `BroadcastBatch.name` — BUKAN `$first: "$broadcastName"` yang per-recipient), `broadcastChannel`, `source`, `createdAt`, `scheduledAt`, `creatorUserId`, `creatorName`, `teamInboxIdAtSendTime`, `teamInboxNameAtSendTime`, `senderAccountName`, `templateUsed`. FR-024 [P0]: Campaign-level aggregation MUST scoped by tenant + filter criteria (date range, channel, source, status, creator, team inbox). FR-025 [P0]: Campaign-level aggregation groups by `{companyId, organizationId, batchId}`. |
| **Query Builder Extension** | FR-026 [P0]: Dynamic query builder (PRD-B) MUST support broadcast-specific filter parameters: `broadcastChannel[]` (maps ke `broadcastexportdata.broadcastChannel`), `source[]` (maps ke `broadcastexportdata.source`), `creatorUserIds[]`, `teamInboxIds[]`, `dateType` (createdAt atau scheduledAt). FR-027 [P0]: Ketika `dateType = scheduledAt`, query builder MUST filter pada field `scheduledAt` untuk date range. FR-028 [P0]: Ketika `dateType = scheduledAt` dan `scheduledAt` adalah null (broadcast non-scheduled), rows tersebut MUST be excluded. FR-029 [P0]: Ketika granularity = "Per Kampanye", query builder MUST switch ke aggregation pipeline mode (group + project) bukan simple find + project. |
| **Column Registry — Campaign-Level** | FR-030 [P0]: System MUST register campaign-level computed columns di `exportcolumnregistry` dengan `domainId = broadcast` dan `granularity = campaign` discriminator. FR-031 [P0]: Campaign-level columns MUST include (22 total): `batchId`, `batchName`, `broadcastChannel`, `source`, `createdAt`, `scheduledAt`, `creatorUserId`, `creatorName`, `teamInboxIdAtSendTime`, `teamInboxNameAtSendTime`, `senderAccountName`, `templateUsed`, `campaignStatus` (derived), `totalRecipients`, `successCount`, `inProgressCount`, `scheduledCount`, `failedCount`, `canceledCount`, `invalidCount`, `successRate`. Note: `senderNumber` di-include di campaign level — ia adalah nomor pengirim milik company, bukan PII penerima (lihat FR-041 + §11 Privacy). FR-032 [P0]: Recipient-level columns MUST NOT appear di picker saat granularity = "Per Kampanye". FR-033 [P0]: Campaign-level columns MUST NOT appear di picker saat granularity = "Per Penerima". |
| **Redirect dari Broadcast Page** | FR-034 [P0]: System MUST add an Export action button di Broadcast > Messages page (tidak ada saat ini — `ManageBroadcastMessagePage.tsx` hanya memiliki "Bulk Broadcast" dan "New Broadcast"). Pattern mengikuti ticket: `router.push('/statistic?section=offline-report&create=broadcast')`. FR-035 [P0]: Offline Report page MUST membaca nilai dari URL param `create` untuk preselect tab Tipe Laporan. Saat ini hanya cek presence dan selalu default ke Ticket tab (`useCreateReportModal.ts:62`) — ini MUST diubah untuk membaca nilai "broadcast" dan preselect Broadcast tab. FR-036 [P1]: Offline Report page MUST seed `react-hook-form` defaults dari URL params sesuai contract di §10.1, bukan dari `BROADCAST_DEFAULT_VALUES` hardcoded constant. Semua 3 perubahan ini adalah **new FE work**, bukan reuse. FR-037 [P0]: User MUST dapat review dan edit prefilled values sebelum submit. |
| **Backward Compatibility** | FR-038 [P0]: Selama migrasi, legacy "Default Broadcast" template (§17) MUST terus berfungsi parallel dengan configurable column approach. FR-039 [P0]: System MUST support kedua creation paths: (a) legacy template-based dan (b) configurable column-based (`domainId = broadcast`, `columns[]`, `granularity`). FR-040 [P0]: Ketika `columns[]` disediakan dengan `domainId = broadcast`, system MUST use configurable path. Ketika legacy path digunakan tanpa `columns[]`, system MUST use template path. |
| **PII Handling** | FR-041 [P0]: Recipient-level PII fields: `recipientNumber`, `recipientName` MUST be flagged `isPII: true` dalam column registry. `senderNumber` MUST NOT be flagged PII — ia adalah nomor pengirim milik company (bukan data penerima), diekspor pada level campaign dengan tepat. FR-042 [P0]: PII confirmation flow MUST match PRD-B — acknowledgment disimpan pada job document di `parameters.piiAcknowledgedBy`/`parameters.piiAcknowledgedAt`. Additive: PII ack + existing `privacy:view_full_phone` permission masking. FR-043 [P0]: Campaign-level exports MUST NOT include recipient-level PII columns (recipientNumber, recipientName tidak tersedia di campaign level). NFR-012: Campaign-level exports MUST NOT expose individual recipient PII. FR-044 [P0]: Broadcast row mapper MUST honour `maskPii` parameter — `recipientNumber` dan `recipientName` MUST be masked ketika user tidak memiliki `privacy:view_full_phone`/`privacy:view_full_email`. Saat ini ada live gap: processor compute `shouldMaskPii` tapi mapper ignores it (`broadcast-export.service.ts:299 // mask pii not used in broadcast for now`). FR ini menutup gap tersebut. |
| **US-013 — DEFERRED** | US-013 (export INVALID_REQUEST rows untuk audit Open API integration issues) DEFERRED ke follow-up phase. No domain record exists today — rejected Open API requests dibuang oleh DTO validation sebelum persistence; failed batch creation di-rollback (`broadcast.service.ts:433-434`). Producing INVALID_REQUEST rows requires a new `broadcast.invalidRequest` event dari broadcast-service atau api-gateway. Sampai event tersebut ada, FR-025 requestId fallback, EH-008, EC-001 dari v1.0 dihapus. Raise sebagai PRD-A change request di future phase. |

## **7. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Granularity value missing atau invalid. Reject job creation. | "Pilih granularity: Per Penerima atau Per Kampanye". |
| EH-002 | Validation | Columns dipilih tidak valid untuk granularity yang dipilih. Reject. | "Kolom tidak tersedia untuk granularity yang dipilih". |
| EH-003 | Validation | Broadcast Channel berisi value yang tidak ada di `BroadcastPlatformEnum` (whatsapp_api, whatsapp_web). Reject. | "Channel broadcast tidak valid". |
| EH-003a | Validation | Source berisi value yang tidak ada di `BroadcastTypeEnum` (manual, import, open-api). Reject. | "Source broadcast tidak valid". |
| EH-004 | Validation | Status filter berisi value yang tidak ada di display status grouping (Terkirim, Sedang Dikirim, Terjadwal, Gagal, Tidak Valid, Dibatalkan). Reject. | "Status tidak valid untuk broadcast". |
| EH-005 | Validation | Date Type missing atau invalid. Reject. | "Pilih tipe tanggal: Tanggal Dibuat atau Tanggal Terjadwal". |
| EH-006 | Validation | Creator atau Team Inbox filter values di luar permission scope requester. Reject. | "Akses ditolak". |
| EH-007 | Processing | Campaign-level aggregation pipeline times out atau exceeds memory. Mark job FAILED. | "Gagal membuat laporan. Coba kurangi rentang tanggal atau gunakan filter yang lebih spesifik". (lihat US-016) |
| EH-009 | PII | User selects PII columns tanpa confirm. Block submission. | "Konfirmasi kolom PII diperlukan". |
| EH-010 | Empty Result | Broadcast job selesai dengan zero matching rows. | Headers-only XLSX. "Laporan selesai tanpa data". (lihat US-016 AC3) |
| EH-011 | Duplicate | Identical job (same requester, domain, columns, filters, granularity) sudah active. Block creation. MAX_ACTIVE_JOBS_PER_CHANNEL=1. | "Permintaan yang sama masih diproses". |
| EH-012 | Permission | Supervisor submit broadcast export dengan filters di luar scope. System re-scope di processing time. | Jika zero rows setelah scoping, job selesai dengan headers-only XLSX. |
| EH-013 | Stale Column | Column di-deactivate antara job creation dan processing. Mark job FAILED. | "Kolom tidak tersedia: {displayName}". |

## **8. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-002 | User switch dari "Per Kampanye" ke "Per Penerima" setelah select 10 campaign-level columns | Column picker clear selections dan reload recipient-level columns. | Brief loading state, lalu picker tampilkan recipient columns tanpa pre-selection. |
| EC-003 | User pilih "Tanggal Terjadwal" tapi sebagian besar broadcasts tidak terjadwal (scheduledAt = null) | Rows tersebut excluded dari date-filtered result. Export mungkin lebih sedikit rows dari expected. | Tidak ada error. User pilih scheduledAt filter — non-scheduled broadcasts sengaja excluded. |
| EC-004 | Campaign-level export dengan 20K+ unique `batchId` dalam filter range | Aggregation result melebihi cap. Job rejected dengan pesan "Jumlah campaign melebihi batas 20.000 baris. Persempit rentang tanggal." | Error message jelas, bukan silent fail. (Sangat jarang — 20K unique campaigns dalam 31 hari.) |
| EC-005 | Recipient-level export, filter returns >20K rows | Job rejected dengan error: BROADCAST_EXPORT_LIMIT=20_000 enforced oleh `broadcast-export.service.ts`. | "Jumlah data melebihi batas 20.000 baris. Persempit filter tanggal atau gunakan export Per Kampanye untuk ringkasan". |
| EC-006 | User select broadcast domain tapi PRD-B infrastructure belum deployed | Job creation blocked oleh feature flag. | "Fitur export konfigurabel belum tersedia. Gunakan template Default Broadcast". |
| EC-007 | Redirect dari Broadcast page dengan filter values yang sudah tidak valid (e.g. deleted team inbox) | Invalid filter values silently dropped. User melihat form editable dengan valid values prefilled. | Optional banner: "Beberapa filter tidak tersedia". |
| EC-008 | Legacy "Default Broadcast" template job submit saat configurable column system aktif | Kedua paths berjalan parallel. Job list menampilkan "Template: Default Broadcast" untuk legacy jobs. | Backward compatible. |
| EC-009 | User select >50 columns untuk recipient-level broadcast export | Warning: "Anda memilih lebih dari 50 kolom. Proses export mungkin lebih lama." Job tetap proceed. | Warning toast, non-blocking. |
| EC-011 | Date type selector tidak visible untuk domain conversation/ticket | Date Type selector adalah broadcast-specific. Conversation/ticket selalu pakai "Tanggal Dibuat". | Date Type selector tersembunyi untuk non-broadcast domains. Broadcast adalah exception karena ada scheduledAt use case yang real — domain lain belum butuh ini (ticket punya ticketTypeId/stageTypes, conversation punya excludeJunked/excludeSpam — domain-specific filter adalah norm). |
| EC-012 | Supervisor's Team Inbox scope berubah antara job creation dan job processing | Processing menggunakan scope current saat eksekusi, bukan creation time. Job mungkin produce lebih sedikit rows dari expected. | Tidak ada error. |

## **9. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Tipe Laporan Selector | Extended untuk include "Broadcast" bersama "Tiket" dan "Percakapan". (Sesuai i18n key `report-type` → "Tipe Laporan"; UI adalah tab, bukan dropdown — `CreateReportModal.tsx:47-60`) | Memilih "Broadcast" trigger broadcast filter panel + column picker reload. | US-001 |
| Granularity Toggle | New component: radio button atau segmented control dengan "Per Penerima" dan "Per Kampanye". Visible hanya saat Tipe Laporan = Broadcast. | Changing granularity clear selections dan reload column picker dengan column set yang sesuai. | US-002 |
| Column Picker (Broadcast) | Same PRD-B column picker component, loaded dengan broadcast-domain columns filtered by selected granularity. | User browse/search broadcast columns, check desired columns. | US-003, US-008 |
| Broadcast Channel Filter | Multi-select dropdown. Options: "WhatsApp API" (`whatsapp_api`), "WhatsApp Web" (`whatsapp_web`). Visible hanya untuk Broadcast. | User select satu atau lebih channels. Empty = all. | US-004 |
| Source Filter | Multi-select dropdown. Options: "Manual" (`manual`), "Import" (`import`), "Open API" (`open-api`). Visible hanya untuk Broadcast. | User select source. Empty = all. | US-004a |
| Broadcast Status Filter | Extension dari komponen `BroadcastStatusField` yang sudah ada (saat ini expose 4 statuses) — diperluas ke 6 display groups: Terkirim, Sedang Dikirim, Terjadwal, Gagal, Tidak Valid, Dibatalkan. Visible hanya untuk Broadcast. | User select satu atau lebih display status groups. Empty = all. | US-005 |
| Date Type Selector | Radio atau segmented control: "Tanggal Dibuat" / "Tanggal Terjadwal". Visible hanya untuk Broadcast. | User select date type. Date range filter berlaku pada type yang dipilih. | US-006 |
| Creator Filter | Multi-select dropdown dengan search. Populated dari broadcastexportdata creator values dalam scope. | User select satu atau lebih creators. Empty = all. | US-007 |
| Team Inbox Filter | Multi-select dropdown dengan search. Populated dari broadcastexportdata team inbox values dalam scope. | User select satu atau lebih team inboxes. Empty = all. | US-007 |
| PII Confirmation Dialog | Same PRD-B dialog. Triggered saat recipientNumber atau recipientName dipilih (recipient-level only). | User review PII columns dan confirm atau cancel. | US-010 |
| Redirected Export State | Dari Broadcast > Messages > Export (button baru), page load dengan Broadcast prefilled dan filters populated dari URL params. | User review dan edit prefilled values sebelum submit. | US-011 |
| Loading State | Column picker tampilkan skeleton/shimmer saat registry loads untuk domain + granularity yang dipilih. | Brief loading pada granularity change. | — |
| Empty State | "Tidak ada kolom tersedia" jika registry returns empty untuk granularity yang dipilih. | Shown saat registry query gagal atau tidak ada results. | — |

## **10. Field & Validation**

### **10.1 Job Creation Payload (Broadcast-Specific Additions)**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| `domainId` | string enum | `broadcast` | Harus `broadcast` untuk flow ini. | Yes | — |
| `columns` | string[] | `["batchName", "recipientNumber", "status"]` | Min 1 item. Semua values harus exist dan active di `exportcolumnregistry` untuk `domainId = broadcast` + granularity yang dipilih. | Yes | — |
| `granularity` | string enum | `recipient` | Harus `recipient` atau `campaign`. | Yes | `recipient` |
| `filters.broadcastChannel` | string[] | `["whatsapp_api"]` | Valid values: `whatsapp_api`, `whatsapp_web` (`BroadcastPlatformEnum`). | No | All channels |
| `filters.source` | string[] | `["open-api", "manual"]` | Valid values: `manual`, `import`, `open-api` (`BroadcastTypeEnum`). | No | All sources |
| `filters.status` | string[] | `["Terkirim", "Gagal"]` | Valid values: display group names (Terkirim, Sedang Dikirim, Terjadwal, Gagal, Tidak Valid, Dibatalkan). Ditranslate ke backend enum sebelum query. | No | All statuses |
| `filters.creatorUserIds` | string[] | `["USR-123"]` | Harus dalam permission scope requester. | No | All creators |
| `filters.teamInboxIds` | string[] | `["TIN-123"]` | Harus dalam permission scope requester. | No | All teams |
| `filters.dateType` | string enum | `createdAt` | Harus `createdAt` atau `scheduledAt`. | Yes | `createdAt` |
| `filters.dateRange.start` | Date | `2026-03-01T00:00:00+07:00` | Valid datetime. Harus sebelum end. | Yes | — |
| `filters.dateRange.end` | Date | `2026-03-31T23:59:59+07:00` | Valid datetime. Range ≤ 31 hari inklusif (MAX_DATE_RANGE_DAYS = 31, `report-job.constant.ts:4`). | Yes | — |
| `piiAcknowledged` | boolean | `true` | Required `true` saat ada column dengan `isPII: true`. Only applicable untuk recipient-level. | Conditional | `false` |
| `parameters.piiAcknowledgedBy` | string | `"userId-123"` | Auto-set dari requester userId saat piiAcknowledged = true. | Conditional | null |
| `parameters.piiAcknowledgedAt` | Date | `2026-08-19T10:00:00Z` | Auto-set timestamp saat piiAcknowledged = true. | Conditional | null |

**Redirect URL Param Contract (dari Broadcast > Messages > Export button):**

| Param | Type | Maps To Form Field | Behavior Saat Invalid |
| ----- | ----- | ----- | ----- |
| `create` | string | Tipe Laporan tab selector | Jika nilai bukan `broadcast`/`ticket`/`conversation`, ignored (default Ticket) |
| `section` | string | Section selector | Harus `offline-report`, jika tidak default ke first section |
| `filter.channel` | string[] (comma-separated) | Broadcast Channel filter | Nilai yang tidak ada di `BroadcastPlatformEnum` silently dropped |
| `filter.source` | string[] (comma-separated) | Source filter | Nilai yang tidak ada di `BroadcastTypeEnum` silently dropped |
| `filter.status` | string[] (comma-separated) | Status filter (display groups) | Nilai yang tidak ada di display group list silently dropped |
| `filter.dateStart` | ISO8601 | Date Range start | Jika invalid parse, ignored (form kosong) |
| `filter.dateEnd` | ISO8601 | Date Range end | Jika invalid parse, ignored (form kosong) |
| `filter.creatorUserIds` | string[] (comma-separated) | Creator filter | Nilai yang tidak dalam scope silently dropped |
| `filter.teamInboxIds` | string[] (comma-separated) | Team Inbox filter | Nilai yang tidak dalam scope silently dropped |

Note: Invalid params silently dropped. Optional banner "Beberapa filter tidak tersedia" shown jika ada yang dropped (EC-007).

### **10.2 Campaign-Level Aggregate Column Definitions**

| fieldPath | displayName | dataType | category | Description | isComputed | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| `batchId` | ID Kampanye | string | Informasi Kampanye | `BroadcastBatch._id` — unique campaign key (PRD-A v2.1). | false | — |
| `batchName` | Nama Kampanye | string | Informasi Kampanye | `BroadcastBatch.name` — clean campaign name. Bukan per-recipient `Broadcast.name`. | false | Null → "-" |
| `broadcastChannel` | Channel Broadcast | string | Informasi Kampanye | Platform: `whatsapp_api` atau `whatsapp_web`. | false | — |
| `source` | Source | string | Informasi Kampanye | Type: `manual`, `import`, atau `open-api`. | false | — |
| `createdAt` | Tanggal Dibuat | Date | Informasi Kampanye | Waktu batch dibuat. | false | — |
| `scheduledAt` | Tanggal Terjadwal | Date | Informasi Kampanye | Waktu batch dijadwalkan (null untuk non-scheduled). | false | Null → "-" |
| `creatorUserId` | ID Pembuat | string | Informasi Kampanye | User ID kreator. | false | — |
| `creatorName` | Nama Pembuat | string | Informasi Kampanye | Display name kreator. | false | — |
| `teamInboxIdAtSendTime` | ID Team Inbox | string | Informasi Kampanye | Team inbox yang digunakan saat send. | false | — |
| `teamInboxNameAtSendTime` | Nama Team Inbox | string | Informasi Kampanye | Nama team inbox. | false | — |
| `senderAccountName` | Nama Akun Pengirim | string | Informasi Kampanye | Nama akun WhatsApp pengirim. | false | — |
| `senderNumber` | Nomor Pengirim | string | Informasi Kampanye | Nomor WA pengirim (milik company — bukan PII penerima). | false | Bukan PII |
| `templateUsed` | Template Digunakan | string | Informasi Kampanye | ObjectId dari template (`doc.templateId`). Resolution ke nama template adalah tanggung jawab sync pipeline di PRD-A (denormalize template name saat sync). | false | ObjectId → resolve di PRD-A |
| `campaignStatus` | Status Kampanye | string | Statistik Kampanye | "Selesai" jika tidak ada recipients di non-terminal state; "Berlangsung" jika masih ada. Derived saat aggregation. | true | — |
| `totalRecipients` | Total Penerima | number | Statistik Kampanye | Total rows di-group per `batchId`. | true | — |
| `successCount` | Terkirim | number | Statistik Kampanye | Count di mana `status = delivered`. | true | — |
| `inProgressCount` | Sedang Dikirim | number | Statistik Kampanye | Count di mana `status IN (pending, processing, sent)`. | true | — |
| `scheduledCount` | Terjadwal | number | Statistik Kampanye | Count di mana `status = schedule`. | true | — |
| `failedCount` | Gagal | number | Statistik Kampanye | Count di mana `status = failed`. | true | — |
| `canceledCount` | Dibatalkan | number | Statistik Kampanye | Count di mana `status = canceled`. | true | — |
| `invalidCount` | Tidak Valid | number | Statistik Kampanye | Count di mana `status = invalid`. | true | — |
| `successRate` | Tingkat Keberhasilan | number | Statistik Kampanye | `successCount / totalRecipients * 100` (persentase, 2 desimal). Jika `totalRecipients = 0`, tampilkan "-" (bukan 0%). | true | Denominator guard |

Total: 22 kolom di campaign-level (13 metadata + 9 aggregate/computed).

## **11. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| **Performance** | NFR-001: Recipient-level broadcast export MUST have comparable throughput ke conversation/ticket export untuk query path yang sama. Catatan: saat ini ada N-query gRPC fan-out untuk recipient name resolution (`broadcast-export.service.ts:257-289` — up to 20K cross-service calls per job). Jika PRD-A men-denormalisasi `recipientName` ke `broadcastexportdata`, fan-out ini hilang — stated sebagai Phase-1 benefit. NFR-002: Campaign-level aggregation MUST complete dalam MAX(2× recipient-level query time, 30s timeout). NFR-003: Column registry query untuk broadcast domain MUST return < 200ms p95. NFR-004: Granularity toggle column picker reload MUST render < 500ms. |
| **Reliability** | NFR-005: Broadcast export job MUST be idempotent per job ID. NFR-006: Column validation MUST dilakukan di job creation time DAN job processing time. NFR-007: Campaign-level aggregation MUST handle `batchId=null` rows gracefully tanpa pipeline failure (null batchId → grouped under synthetic key `{companyId}:{organizationId}:NO_BATCH`). |
| **Security** | NFR-008: Semua broadcast export queries MUST scoped by `companyId` + `organizationId`. NFR-009: PII column selection untuk recipient-level MUST memerlukan user acknowledgment. NFR-010: Supervisor scope MUST enforced di query time. NFR-016: Broadcast Advance Export tersedia untuk semua subscription tier. Hanya SAP preset yang memerlukan Enterprise + PKS. |
| **Privacy** | NFR-011: Recipient-level PII fields (`recipientNumber`, `recipientName`) MUST menampilkan explicit warning + PII ack sebelum submit. Masking via `privacy:view_full_phone`/`privacy:view_full_email` permissions additive dengan ack dialog. NFR-012: Campaign-level exports MUST NOT expose individual recipient PII (`recipientNumber`, `recipientName`). `senderNumber` diperbolehkan di campaign level (nomor pengirim milik company). |
| **Async Job & Delivery** | NFR-013: Export job mengikuti pipeline async: `CreateReportJob` (REST/gRPC) → RMQ `EXPORT_REPORT_JOB_PROCESS` → `ExportJobProcessor` (broadcast-service) → S3 upload → `EXPORT_REPORT_JOB_RESULT`. NFR-013a: Broadcast export generation berjalan INLINE di processor (tidak ada worker thread, berbeda dengan ticket/conversation yang pakai worker thread — `broadcast-export.service.ts:331`). Campaign-level aggregation berjalan di atas inline path ini — jika aggregation lambat, processor blocked. TRD harus evaluate apakah campaign aggregation perlu timeout guard yang eksplisit di processor level. NFR-013b: Progress feedback adalah one-shot flip QUEUED → PROCESSING (satu kali emit saat job mulai). Tidak ada percentage/row-count progress. EC-004's "Progress indicator shows processing status" merujuk ke status badge "Sedang Diproses" (static), bukan progress bar. NFR-014: File retention: 7 hari (`EXPIRATION_DELAY_MS = 604800000`). Presigned URL: 15 menit. Setelah expiry, download link invalid → user harus buat job baru. NFR-015: Rate limits: MAX_JOBS_PER_HOUR=10 per user, MAX_ACTIVE_JOBS_PER_CHANNEL=1, MAX_DATE_RANGE_DAYS=31. |
| **Localization** | NFR-017: Semua broadcast-specific UI labels, filter labels, column display names, dan error messages MUST dalam Bahasa Indonesia. Semua copy MUST melalui `next-intl` — lihat Appendix F untuk UI-copy table dengan i18n keys. |
| **Observability** | NFR-018: Job metrics yang diinginkan (untuk masa depan): `granularity`, `column_count`, `row_count`, `generation_duration_ms`, `aggregation_duration_ms` (campaign), `group_count` (campaign), `file_size_bytes`, `domain`, `status`. NFR-018a: Platform dependency — tidak ada prom-client/OTel/APM di `backend/package.json`. Metrics belum dapat diemit saat ini. Interim: structured log entries yang mengandung fields di atas pada job completion. Shared platform gap dengan Phase-1 dan Phase-2 — fix once, cross-reference. Owner: Eng Lead. |

## **12. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| PRD-A v2.1: `broadcastexportdata` harus ada dengan `batchId`, `batchName`, `broadcastChannel` (platform), `source` (type), `status` (real BroadcastStatusEnum). | Engineering (PRD-A) | **Blocking.** Campaign-level feature tidak bisa dibangun tanpa `batchId`. Status count columns tidak bisa diimplementasi tanpa status vocabulary yang benar. | Feature-flag: broadcast configurable export hanya enabled setelah PRD-A broadcast backfill complete dan v2.1 schema di-deploy. |
| PRD-B: Column registry, column picker UI, dynamic query builder, SheetJS XLSX (20K cap) harus tersedia. | Engineering (PRD-B) | **Blocking untuk configurable path.** Legacy template path tetap sebagai fallback. | Feature-flag coexistence. PRD-C extends PRD-B — tidak bisa ship sebelum PRD-B core ready. |
| Campaign-level MongoDB aggregation performance pada large datasets. | Engineering | Aggregation pada millions of broadcast rows mungkin lambat. Broadcast generation berjalan inline (tidak pakai worker thread) — campaign aggregation di atas inline path ini adalah processing risk. | Compound index `{companyId, organizationId, batchId, status}` di PRD-A. 31-day cap. Timeout guard di processor. |
| FR-044: maskPii gap — `broadcast-export.service.ts:299` saat ini ignore maskPii. | Engineering | **Live privacy gap.** Recipient phone numbers diexport unmasked tanpa peduli permissions. | FR-044 required sebelum launch. Fix: mapper harus check dan apply masking sesuai `shouldMaskPii` dari processor. |
| US-013 INVALID_REQUEST rows — DEFERRED. | Product | Capability audit Open API integration issues tidak tersedia di phase ini. | Raise sebagai PRD-A change request (perlu `broadcast.invalidRequest` domain event). No impact pada scope saat ini. |
| Shared platform gap: metrics observability + feature-flag mechanism. | Eng Lead | NFR-018 metrics dan feature flag memerlukan infra yang belum ada (no prom-client, no general per-company flag service). | Structured logging sebagai interim untuk metrics. Feature flag via `company.features.broadcastConfigurableExportEnabled` (ops-set, sama pola dengan SAP gate di PRD-D). Cross-phase fix: Phase-1, 2, 3, 4 semua butuh ini — fix once. |
| New FE work: Export button di Broadcast > Messages, offline-report tab-read via `create` param, react-hook-form seeding dari URL params. | Engineering (Frontend) | Jika tidak di-implement, redirect dari broadcast page tidak akan prefill apapun. | Spec URL param contract di §10.1 (sudah dilakukan). Integration test redirect flow. |
| PRD-A `templateUsed` berisi ObjectId, bukan template name. | Engineering (PRD-A) | Campaign-level template metadata tidak human-readable tanpa resolution. | PRD-A sync pipeline SHOULD denormalize template name dari BroadcastTemplate pada sync. Jika tidak, `templateUsed` di export menampilkan ObjectId string — noted di §10.2. |

## **13. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Broadcast configurable export adoption rate | ≥ 80% of new broadcast export jobs use column picker (vs legacy template) | 30 hari post-launch | Job creation logs (`columns[]` present vs not) |
| Campaign-level export usage | ≥ 20% of broadcast export jobs use campaign-level granularity | 30 hari post-launch | Job creation logs (`granularity` field) |
| PII acknowledgment rate | 100% recipient-level PII-containing jobs memiliki `parameters.piiAcknowledgedBy` set | Ongoing | Job document query |
| Job completion rate (broadcast configurable path) | ≥ 98% | 30 hari post-launch | Job status (structured logs, interim; metrics system saat tersedia) |

## **14. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| User-saved presets untuk broadcast columns | Power users ingin save dan reuse broadcast column selections lintas export jobs (P2 — deferred dari PRD-B). |
| Campaign-level drill-down | Dari campaign-level export, users mungkin ingin click-through ke recipient-level detail untuk specific campaign. |
| Scheduled broadcast exports | Recurring broadcast exports (daily/weekly campaign summaries) delivered via email. (Note: ini adalah future capability — §2 Scope Definition secara eksplisit menyatakan "Email delivery of export results" adalah Out of Scope untuk phase ini, konsisten, tidak contradictory.) |
| US-013: INVALID_REQUEST rows | Export rejected Open API requests untuk audit. Memerlukan `broadcast.invalidRequest` domain event baru di broadcast-service atau api-gateway. Raise sebagai PRD-A change request. |
| Campaign-level dashboard integration | Campaign-level aggregation bisa feed ke broadcast performance dashboard beyond just export. |
| Real-time campaign-level aggregation | Jika campaign-level stats dibutuhkan near-real-time, pre-aggregated collection lebih preferred dari on-demand aggregation. |
| maskPii for broadcast (FR-044 implemented) | Setelah FR-044 ship, pertimbangkan consent line untuk recipient contact data — saat ini consent diatur upstream di broadcast-send time, out of scope untuk export (lihat §15). |

## **15. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Campaign-level aggregation adalah on-demand MongoDB aggregation, bukan pre-computed. | Campaign-level exports mungkin lebih lambat dari recipient-level untuk large datasets. Aggregation timeout = 30s (EH-007). |
| Campaign-level aggregate values mencerminkan state `broadcastexportdata` di query time. | Jika sync lag ada, recent broadcasts mungkin memiliki incomplete aggregate counts. Ditandai di `campaignStatus` = "Berlangsung" jika masih ada non-terminal recipients. |
| Export cap: 20K rows per job (`BROADCAST_EXPORT_LIMIT = 20_000`). | Recipient-level exports dengan >20K rows di-reject. Campaign-level sangat jarang mencapai cap ini. User harus narrow filter range. |
| `messageContent` dipotong di 1000 karakter (`CONTENT_MAX_LENGTH = 1000`, `broadcast-export.constant.ts:8`). | Pesan panjang akan terpotong di XLSX. Users yang butuh full message harus lookup di operational system. |
| `templateUsed` berisi ObjectId string, bukan template name yang human-readable. | Users akan melihat ID bukan nama template kecuali PRD-A sync pipeline men-denormalisasi nama template. |
| Recipient name resolution saat ini adalah N-query gRPC fan-out (up to 20K calls per job). | Performance bottleneck pada large exports. Jika PRD-A men-denormalisasi `recipientName` ke `broadcastexportdata`, bottleneck ini hilang. |
| `attemptNumber` = `doc.retryCount` = retry-until-reply counter, bukan send attempt counter. | Column `attemptNumber` dalam export mengukur jumlah retry untuk mendapat reply dari recipient, bukan berapa kali pesan dikirim. Semantics yang berbeda dari apa yang mungkin user harapkan. |
| Granularity column picker mengandalkan registry schema extension (`granularity` discriminator). | Sampai PRD-B registry mendukung discriminator ini, column filtering mungkin menggunakan category-based workaround. |
| Date Type selector broadcast-specific. | Conversation dan ticket tidak punya toggle ini. Domain-specific filters adalah norm (ticket: ticketTypeId/stageTypes; conversation: excludeJunked/excludeSpam) — broadcast adalah contoh tambahan, bukan special case. |
| Redirect prefill tergantung pada Broadcast page passing correct URL params. | Jika source page tidak pass filters, prefill partial. Params yang tidak valid silently dropped (lihat §10.1 URL param contract). |
| Consent untuk recipient contact data diatur upstream di broadcast-send time. | Out of scope untuk export — user yang menerima broadcast sudah memberikan consent pada level pengiriman. Export hanya mengambil data yang sudah ada. |
| `broadcastexportdata` memiliki TTL 180 hari, independent dari operational store. | Data analytics dapat berisi rows untuk batch yang sudah dihapus dari operational store (EC-004 US-008d). Sebaliknya, data >180 hari tidak muncul di export meski masih ada di operational. |
| Legacy §17 template dan configurable path coexist selama migrasi. | Users mungkin melihat dua paths untuk broadcast export sementara. Clear UI labeling required. |

## **16. Appendix**

### **A. Campaign-Level Aggregation Pipeline Specification**

MongoDB aggregation pipeline untuk `granularity = campaign`:

```javascript
// Stage 1: Match — tenant scope + filters
{
  $match: {
    companyId: "<companyId>",         // ObjectId
    organizationId: "<organizationId>", // ObjectId
    // Date filter pada dateType yang dipilih (createdAt atau scheduledAt)
    [dateTypeField]: { $gte: startDate, $lte: endDate },
    // Optional filters
    ...(broadcastChannel.length && { broadcastChannel: { $in: broadcastChannel } }),
    ...(source.length && { source: { $in: source } }),
    ...(backendStatuses.length && { status: { $in: backendStatuses } }), // translated dari display groups
    ...(creatorUserIds.length && { creatorUserId: { $in: creatorUserIds } }),
    ...(teamInboxIds.length && { teamInboxIdAtSendTime: { $in: teamInboxIds } })
  }
}

// Stage 2: Group by batchId (PRD-A v2.1 campaign key)
{
  $group: {
    _id: {
      companyId: "$companyId",
      organizationId: "$organizationId",
      batchId: "$batchId"          // BroadcastBatch._id — campaign key
    },
    // Batch-level metadata (stable across all recipients in a batch — same value per PRD-A v2.1)
    batchName: { $first: "$batchName" },         // BroadcastBatch.name, clean
    broadcastChannel: { $first: "$broadcastChannel" }, // platform, stable per batch
    source: { $first: "$source" },               // type, stable per batch
    createdAt: { $first: "$createdAt" },
    scheduledAt: { $first: "$scheduledAt" },
    creatorUserId: { $first: "$creatorUserId" },
    creatorName: { $first: "$creatorName" },
    teamInboxIdAtSendTime: { $first: "$teamInboxIdAtSendTime" },
    teamInboxNameAtSendTime: { $first: "$teamInboxNameAtSendTime" },
    senderAccountName: { $first: "$senderAccountName" },
    senderNumber: { $first: "$senderNumber" },
    templateUsed: { $first: "$templateUsed" },
    // Aggregate counts — menggunakan real BroadcastStatusEnum values
    totalRecipients: { $sum: 1 },
    successCount: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
    inProgressCount: { $sum: { $cond: [{ $in: ["$status", ["pending", "processing", "sent"]] }, 1, 0] } },
    scheduledCount: { $sum: { $cond: [{ $eq: ["$status", "schedule"] }, 1, 0] } },
    failedCount: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
    canceledCount: { $sum: { $cond: [{ $eq: ["$status", "canceled"] }, 1, 0] } },
    invalidCount: { $sum: { $cond: [{ $eq: ["$status", "invalid"] }, 1, 0] } },
    // For campaignStatus derivation
    nonTerminalCount: {
      $sum: {
        $cond: [
          { $in: ["$status", ["raw", "text_processing", "text_processed", "schedule", "pending", "processing", "sent", "retry"]] },
          1,
          0
        ]
      }
    }
  }
}

// Stage 3: AddFields — computed fields
{
  $addFields: {
    successRate: {
      $cond: [
        { $eq: ["$totalRecipients", 0] },
        null,   // → render as "-" in XLSX (US-012 AC2 null → "-")
        { $round: [{ $multiply: [{ $divide: ["$successCount", "$totalRecipients"] }, 100] }, 2] }
      ]
    },
    campaignStatus: {
      $cond: [{ $gt: ["$nonTerminalCount", 0] }, "Berlangsung", "Selesai"]
    }
  }
}

// Stage 4: Project — hanya columns yang user pilih + rename _id
{
  $project: {
    _id: 0,
    batchId: "$_id.batchId",
    // Conditionally include each field based on user's column selection
    // Implementation: build $project spec from user's columns[] array
    // e.g. if user selected ["batchName", "totalRecipients", "successRate", "campaignStatus"]:
    batchName: 1,
    totalRecipients: 1,
    successRate: 1,
    campaignStatus: 1
    // ...other selected columns
    // nonTerminalCount EXCLUDED from output (internal computation only)
  }
}
```

**$project spec construction rule (Stage 4 normative):**
- Ambil `columns[]` dari job params
- Build `$project` object: `{ _id: 0, batchId: "$_id.batchId", ...columns.reduce((acc, col) => ({...acc, [col]: 1}), {}) }`
- `nonTerminalCount` selalu excluded (internal)
- `batchId` selalu included sebagai `"$_id.batchId"` (rename dari group key)

**Performance notes:**
- Pipeline benefited dari compound index: `{companyId, organizationId, batchId, status}` (PRD-A TRD concern).
- Dengan indexing yang proper dan 31-day cap, aggregation expected selesai < 30s untuk typical workload.
- Jika > 30s timeout, job FAILED dengan EH-007. User diminta narrow filter range.

### **B. Mapping: §17 Default Broadcast Columns → PRD-A `broadcastexportdata` Fields**

| §17 Column (XLSX Header) | PRD-A `broadcastexportdata` fieldPath | Source | PRD-C Recipient-Level | PRD-C Campaign-Level |
| ----- | ----- | ----- | ----- | ----- |
| broadcastId | `broadcastId` | Exists in Broadcast (`Broadcast._id`) | ✅ | ✅ (via `_id.batchId` → `batchId` lebih relevan) |
| broadcastName | `broadcastName` | Exists in Broadcast (`Broadcast.name`, per-recipient suffixed) | ✅ | ❌ — pakai `batchName` dari `BroadcastBatch.name` |
| broadcastChannel | `broadcastChannel` | Exists in Broadcast (`Broadcast.platform`) | ✅ | ✅ |
| source | `source` | Exists in Broadcast (`Broadcast.type`) | ✅ | ✅ |
| createdAt | `createdAt` | Exists in Broadcast | ✅ | ✅ |
| scheduledAt | `scheduledAt` | Exists in Broadcast | ✅ | ✅ |
| creatorUserId | `creatorUserId` | Exists in Broadcast | ✅ | ✅ |
| creatorName | `creatorName` | Exists in Broadcast | ✅ | ✅ |
| teamInboxIdAtSendTime | `teamInboxIdAtSendTime` | Exists in Broadcast | ✅ | ✅ |
| teamInboxNameAtSendTime | `teamInboxNameAtSendTime` | Exists in Broadcast | ✅ | ✅ |
| senderAccountName | `senderAccountName` | Exists in Broadcast | ✅ | ✅ |
| senderNumber | `senderNumber` | Exists in Broadcast (company-owned number, bukan PII) | ✅ | ✅ |
| recipientNumber | `recipientNumber` (PII) | Exists in Broadcast | ✅ | ❌ (tidak di campaign level) |
| recipientName | `recipientName` (PII) | Exists in Broadcast | ✅ | ❌ (tidak di campaign level) |
| status | `status` | Exists in Broadcast (raw `BroadcastStatusEnum`) | ✅ | ❌ (digantikan aggregate counts) |
| reason | `reason` | Exists in Broadcast | ✅ | ❌ (tidak di campaign level) |
| attemptNumber | `attemptNumber` | Exists in Broadcast (`Broadcast.retryCount` — retry-until-reply counter, bukan send attempts) | ✅ | ❌ (tidak di campaign level) |
| templateUsed | `templateUsed` | Exists in Broadcast (`doc.templateId` → ObjectId string) | ✅ | ✅ (ObjectId; PRD-A resolve name jika perlu) |
| messageContent | `messageContent` | Exists in Broadcast (dipotong di 1000 chars) | ✅ | ❌ (tidak di campaign level) |
| attributesJson | `attributesJson` | Exists in Broadcast | ✅ | ❌ (tidak di campaign level) |
| *(new)* batchId | `batchId` | Requires PRD-A v2.1 (`BroadcastBatch._id`) | ✅ | ✅ |
| *(new)* batchName | `batchName` | Requires PRD-A v2.1 (`BroadcastBatch.name`) | ✅ | ✅ |
| *(new)* campaignStatus | *computed* | Derived (nonTerminalCount > 0) | ❌ | ✅ |
| *(new)* totalRecipients | *computed* | Derived ($sum: 1) | ❌ | ✅ |
| *(new)* successCount | *computed* | Derived (status=delivered) | ❌ | ✅ |
| *(new)* inProgressCount | *computed* | Derived (status IN pending,processing,sent) | ❌ | ✅ |
| *(new)* scheduledCount | *computed* | Derived (status=schedule) | ❌ | ✅ |
| *(new)* failedCount | *computed* | Derived (status=failed) | ❌ | ✅ |
| *(new)* canceledCount | *computed* | Derived (status=canceled) | ❌ | ✅ |
| *(new)* invalidCount | *computed* | Derived (status=invalid) | ❌ | ✅ |
| *(new)* successRate | *computed* | Derived (successCount/totalRecipients*100) | ❌ | ✅ |
| requestId | *(schema-ready, null)* | Requires PRD-A + `broadcast.invalidRequest` event (DEFERRED) | — | — |
| idempotencyKey | *(schema-ready, null)* | Requires PRD-A + domain event (DEFERRED) | — | — |
| requestPayloadJson | *(schema-ready, null)* | Requires PRD-A + domain event (DEFERRED) | — | — |
| failureSource | *(schema-ready, null)* | Requires PRD-A + domain event (DEFERRED) | — | — |

Note: §17 FIXED_HEADERS memiliki tepat **20 kolom** (`broadcast-export.service.ts:40-61`). PS-001 v1.0 menyebut "22 kolom" — ini tidak akurat; angka yang benar adalah 20 kolom existing + 2 PRD-A v2.1 baru (`batchId`, `batchName`).

### **C. Glossary**

| Term | Definition |
| ----- | ----- |
| Granularity | Level export. "Per Penerima" = 1 row per broadcast recipient. "Per Kampanye" = 1 row per broadcast campaign dengan aggregate counts. |
| Recipient-level | Mode export di mana setiap row di XLSX merepresentasikan satu broadcast recipient, dengan fields langsung dari `broadcastexportdata`. |
| Campaign-level | Mode export di mana setiap row merepresentasikan satu broadcast campaign (1 `batchId`), dengan aggregated counts dari semua recipients dalam campaign tersebut. |
| `batchId` | `BroadcastBatch._id` — campaign key. Satu campaign = satu `batchId`, banyak recipients. PRD-A v2.1 field. |
| `broadcastId` | `Broadcast._id` — recipient row PK. Satu recipient dalam satu campaign = satu `broadcastId`. |
| `batchName` | `BroadcastBatch.name` — nama campaign yang clean. Berbeda dari `broadcastName` (per-recipient, suffixed dengan nomor penerima). PRD-A v2.1 field. |
| `broadcastexportdata` | PRD-A analytics collection yang menyimpan row-level broadcast recipient data, synced dari broadcast-service domain pull. |
| §17 Legacy Template | Existing "Default Broadcast" fixed-template export yang didefinisikan di §17 `PRD Analytics - offline report download.md`. Superseded oleh configurable column approach PRD ini. |
| Column Registry | PRD-B `exportcolumnregistry` collection yang mendefinisikan available columns per domain dengan metadata. |
| `BroadcastStatusEnum` | Backend enum (12 values: raw, text_processing, text_processed, schedule, pending, processing, sent, delivered, failed, retry, invalid, canceled). Yang disimpan di `broadcastexportdata.status`. |
| Display Status Group | FE-level status grouping (6 groups: Terkirim, Sedang Dikirim, Terjadwal, Gagal, Tidak Valid, Dibatalkan) yang di-translate ke backend enum sebelum query. |

### **D. Open Questions**

| ID | Question | Current Assumption | Impact If Wrong |
| ----- | ----- | ----- | ----- |
| OQ-P3-01 | Status vocabulary — RESOLVED via PRD-A v2.1. | `broadcastexportdata.status` menyimpan raw `BroadcastStatusEnum` (12 nilai). Display grouping dilakukan di PRD-C FR-011a. | N/A — resolved. |
| OQ-P3-02 | Campaign key — RESOLVED via PRD-A v2.1. | `batchId = BroadcastBatch._id`. Campaign-level `$group` by `batchId`. | N/A — resolved. |
| OQ-P3-03 | Channel vs source — RESOLVED. | Dua filter terpisah: Broadcast Channel (platform) + Source (type). | N/A — resolved. |
| OQ-P3-04 | US-013 scope — DEFERRED. | INVALID_REQUEST rows tidak ada saat ini. Future phase + PRD-A event. | Impact minimal: US-013 audit capability tidak tersedia. |
| OQ-P3-05 | 20K row cap — RETAINED. | `BROADCAST_EXPORT_LIMIT = 20_000` dipertahankan. EC-004 rewritten sebagai rejection. | Jika cap perlu dilifting, butuh streaming writer (PRD-B decision, sama seperti OQ-P2-02). |
| OQ-P3-06 | In-progress campaign semantics. | `campaignStatus` derived column (FR-022a): "Berlangsung" jika ada non-terminal recipients. `successRate` ditampilkan sebagai partial dengan `campaignStatus = Berlangsung` sebagai indicator. | Jika stakeholder butuh `successRate` hanya dari completed campaigns, filter `campaignStatus = Selesai` dan re-run export. |
| OQ-P3-07 | Deleted/archived campaigns. | Analytics TTL 180d independent dari operational. Orphaned recipient rows dieksport dengan `batchName = "-"` (US-008d). | Jika operational delete harus sync ke analytics, butuh delete-event di PRD-A (currently out of scope). |
| OQ-P3-08 | maskPii gap. | FR-044 menutup gap ini. Recipient phones MUST masked sesuai `privacy:view_full_phone` permission. | FR-044 adalah required pre-launch (live privacy gap). |
| OQ-P3-09 | senderNumber PII flag — RESOLVED. | De-flagged: company-owned number, bukan PII penerima. Diexport di campaign level. FR-041 updated. | Jika security review membutuhkan senderNumber di-flag, update FR-041 dan hapus dari Appendix B campaign column. |
| OQ-P3-10 | Progress feedback. | Static badge "Sedang Diproses" (one-shot flip). Tidak ada percentage progress. | Jika UX butuh real progress, perlu perubahan signifikan di processor + RMQ pipeline (future enhancement). |
| OQ-P3-11 | Feature-flag mechanism. | `company.features.broadcastConfigurableExportEnabled` (ops-set, sama pola SAP). General per-company flag bukan infra yang ada — initial implementation via manual ops flag. Eng Lead owns. | Jika flag granularity yang lebih fine-grained dibutuhkan, shared flag service perlu dibangun (cross-phase concern). |
| OQ-P3-12 | Redirect URL param contract — RESOLVED. | Contract table di §10.1. Invalid params silently dropped + optional banner. | N/A — resolved. |

### **E. Source References**

| Reference | Path (dalam PRDanalisis workspace) | Relevance |
| ----- | ----- | ----- |
| PRD-A v2.1: Export Row-Level Collections | `PRD/Analytics/Export/PRD Analytics - Export Row-Level Collections (Foundation) v2.0.md` | `broadcastexportdata` schema v2.1 (§10.3): `batchId`, `batchName`, real `BroadcastStatusEnum`, corrected `broadcastChannel`/`source`, corrected `rowKey`. |
| PRD-B v2.0: Configurable Column Export | `PRD/Analytics/Export/PRD Analytics - Configurable Column Export v2.0.md` | Column registry, column picker UI, dynamic query builder, SheetJS XLSX, job creation payload, PII ack mechanism. |
| Offline Report Download + §17 Addendum | `PRD/Analytics/PRD Analytics - offline report download.md` | Existing export UX, RBAC, retention, §17 broadcast addendum. |
| Change Intake Brief v3.0 | `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md` | Scope definition, OQ answers. |
| Tech Review Phase-3 | `PRD/Analytics/Export/review tech/review-advance-export-phase-3.md` | Source of all B-01..B-10 dan nit 1..24 yang diterapkan di v2.0. |

Note: Path-path di atas berada dalam **PRDanalisis workspace repo** (`C:\Users\MyBook SAGA 12\Desktop\PRDanalisis`), bukan di BE repo `omnichannel-satuinbox-be`.

### **F. UI Copy Table (Bahasa Indonesia + i18n Keys)**

Semua copy MUST melalui `next-intl`. Keys prefix: `statistic.broadcast-export.*`

| Key | Bahasa Indonesia | Context |
| ----- | ----- | ----- |
| `statistic.broadcast-export.granularity.label` | Granularity | Toggle label |
| `statistic.broadcast-export.granularity.recipient` | Per Penerima | Toggle option 1 |
| `statistic.broadcast-export.granularity.campaign` | Per Kampanye | Toggle option 2 |
| `statistic.broadcast-export.filter.channel.label` | Channel Broadcast | Filter label |
| `statistic.broadcast-export.filter.channel.whatsapp_api` | WhatsApp API | Option |
| `statistic.broadcast-export.filter.channel.whatsapp_web` | WhatsApp Web | Option |
| `statistic.broadcast-export.filter.source.label` | Source | Filter label |
| `statistic.broadcast-export.filter.source.manual` | Manual | Option |
| `statistic.broadcast-export.filter.source.import` | Import | Option |
| `statistic.broadcast-export.filter.source.open_api` | Open API | Option |
| `statistic.broadcast-export.filter.status.label` | Status Broadcast | Filter label |
| `statistic.broadcast-export.filter.status.delivered` | Terkirim | Display group |
| `statistic.broadcast-export.filter.status.sending` | Sedang Dikirim | Display group |
| `statistic.broadcast-export.filter.status.scheduled` | Terjadwal | Display group |
| `statistic.broadcast-export.filter.status.failed` | Gagal | Display group |
| `statistic.broadcast-export.filter.status.invalid` | Tidak Valid | Display group |
| `statistic.broadcast-export.filter.status.canceled` | Dibatalkan | Display group |
| `statistic.broadcast-export.filter.date-type.label` | Tipe Tanggal | Filter label |
| `statistic.broadcast-export.filter.date-type.created` | Tanggal Dibuat | Option |
| `statistic.broadcast-export.filter.date-type.scheduled` | Tanggal Terjadwal | Option |
| `statistic.broadcast-export.filter.creator.label` | Pembuat | Filter label |
| `statistic.broadcast-export.filter.team-inbox.label` | Team Inbox | Filter label |
| `statistic.broadcast-export.error.cap-exceeded` | Jumlah data melebihi batas 20.000 baris. Persempit filter tanggal atau gunakan export Per Kampanye untuk ringkasan. | Error message |
| `statistic.broadcast-export.error.campaign-cap-exceeded` | Jumlah kampanye melebihi batas 20.000 baris. Persempit rentang tanggal. | Error message |
| `statistic.broadcast-export.error.aggregation-timeout` | Gagal membuat laporan. Coba kurangi rentang tanggal atau gunakan filter yang lebih spesifik. | EH-007 |
| `statistic.broadcast-export.error.empty-result` | Laporan selesai tanpa data. | EH-010 |
| `statistic.broadcast-export.error.pii-required` | Konfirmasi kolom PII diperlukan. | EH-009 |
| `statistic.broadcast-export.file-expired` | File export sudah kedaluwarsa (7 hari). Buat ulang laporan untuk data terbaru. | US-015 |
| `statistic.broadcast-export.campaign-status.done` | Selesai | campaignStatus value |
| `statistic.broadcast-export.campaign-status.in-progress` | Berlangsung | campaignStatus value |
| `statistic.broadcast-export.redirect-filter-dropped` | Beberapa filter tidak tersedia. | EC-007 optional banner |
| `statistic.broadcast-export.column.batch-id` | ID Kampanye | Column header |
| `statistic.broadcast-export.column.batch-name` | Nama Kampanye | Column header |
| `statistic.broadcast-export.column.campaign-status` | Status Kampanye | Column header |
| `statistic.broadcast-export.column.total-recipients` | Total Penerima | Column header |
| `statistic.broadcast-export.column.success-count` | Terkirim | Column header |
| `statistic.broadcast-export.column.in-progress-count` | Sedang Dikirim | Column header |
| `statistic.broadcast-export.column.scheduled-count` | Terjadwal | Column header |
| `statistic.broadcast-export.column.failed-count` | Gagal | Column header |
| `statistic.broadcast-export.column.canceled-count` | Dibatalkan | Column header |
| `statistic.broadcast-export.column.invalid-count` | Tidak Valid | Column header |
| `statistic.broadcast-export.column.success-rate` | Tingkat Keberhasilan | Column header |
