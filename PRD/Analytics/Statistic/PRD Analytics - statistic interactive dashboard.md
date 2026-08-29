# **PATCH PRODUCT REQUIREMENT DOCUMENT — Statistic Interactive Dashboard (Drill-Down)**

> **Feature**: Statistic Interactive Dashboard (Drill-Down) — Card Clickable, Navigate-with-Filter, Drill Endpoint, Modal Result
> **Author**: Dany Christian
> **Product Manager**: Dany Christian
> **Engineering Lead**: Naftal Yunior
> **Product**: SatuInbox
> **Domain**: Analytics + Conversation + Ticket
> **Version**: v1.0
> **Status**: Draft
> **Source Brief**: `Assessments/cross-domain/agent-statistic-access/statistic-interactive-dashboard-change-intake-brief.md` v1.0
> **Rules Applied**: `Rules/prd-writing-rule.md`
> **Related PRD**: `PRD/Analytics/*`, `PRD/Conversationv2/*`, `PRD/ticketv2/*`
> **Dependencies**: Patch 1 (Agent Statistic Access — guard fix, data leak), Patch 2 (Parameter Improvement — filter fix + parameter completeness)

---

## **1. Revision History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0 | 2026-08-12 | Dany Christian | Initial PRD patch: StatisticCard clickable, navigate-with-filter (conversation + ticket), generic drill endpoint (`POST /analytics/drill`), modal result component, date-range consistency, card-to-filter mismatch mapping, phased rollout (3a→3b→3c→3d), permission reuse, error handling, edge cases. |
| v1.1 | 2026-08-19 | Dany Christian | Patch 4 alignment: added `in_sla_rlt`/`over_sla_rlt` as new drill metric placeholders (FR-011, §12.3, Appendix B) — domain=conversation only per Patch 4 Change Intake Brief OQ-05; note Patch 4 dependency (schema+enum must exist first); RLT SLA breakdown hidden in tab Ticket. |

---

## **2. Overview**

| Item | Description |
|------|-------------|
| Purpose | Membuat KPI card di halaman Statistic menjadi interactive — user dapat mengklik card untuk melihat data aktual (conversation/ticket list) di balik angka, baik melalui navigate-with-filter ke halaman list maupun modal drill-down dengan generic drill endpoint. |
| Scope | StatisticCard onClick wiring, navigate-with-filter conversation (Fase 3a) dan ticket (Fase 3b), generic drill endpoint `POST /analytics/drill` (Fase 3c), modal result component, date-range consistency injection, advanced drill by-channel/by-tag (Fase 3d). |
| Key Capabilities | (1) StatisticCard clickable dengan hover state, keyboard accessible, aria attributes. (2) Card dengan filter paritet → navigate ke halaman list dengan filter pre-filled. (3) Card tanpa filter paritet → modal drill via generic endpoint. (4) Agent self-scope terjaga — drill menerapkan scope yang sama dengan analytics endpoint. (5) Date-range dari StatisticFilter wajib di-inject ke setiap drill action. |
| Outcome | User dapat mengklik KPI card dan langsung melihat data aktual. Angka di card KONSISTEN dengan data di drill result. Agent hanya melihat data miliknya sendiri. |

### **Scope Definition**

| In Scope | Out of Scope |
|----------|-------------|
| StatisticCard: onClick prop, cursor-pointer, hover state, aria, keyboard accessible | Patch 1 (guard fix + backfill) — PRD terpisah |
| Conversation navigate-with-filter: total/open/closed/unassigned (Fase 3a) | Patch 2 (filter fix + parameter improvement) — PRD terpisah |
| Ticket navigate-with-filter: total/active/closed/reopened/unassigned (Fase 3b) | Metric rasio (SLA rate %, response rate, one-touch %) = non-clickable |
| Generic drill endpoint: `POST /analytics/drill` — parametric, 1 endpoint untuk semua metric | Perubahan metric count endpoint existing |
| Modal drill result component (Fase 3c) | New StatisticNav sections |
| Card replied conversations, overdue SLA, SLA met, CSAT good/bad, closed with screenshot (Fase 3c) | Interactive charts (bukan cuma card) |
| Date-range consistency: StatisticFilter → drill injection | |
| Advanced drill: by-channel/by-tag navigate, member performance drill (Fase 3d) | |

---

## **3. Problem Statement**

| ID | Problem | Impact |
|----|---------|--------|
| PS-001 | KPI card di halaman Statistic adalah plain `<div>` tanpa interaktivitas — tidak ada onClick, cursor-pointer, hover state, maupun keyboard access. User melihat angka di card tapi tidak bisa langsung mengakses data aktual di balik angka tersebut. | User harus manual buka halaman conversation/ticket dan filter sendiri (jika tahu filter yang tepat). Friction tinggi, especially untuk metric tanpa filter paritet (replied conversations, overdue SLA). |
| PS-002 | Tidak ada generic drill endpoint. Metric card = count agregat tanpa document ID (hooks mengembalikan `number` saja). Untuk card yang tidak punya filter paritet di list page (replied conversations, overdue SLA, SLA met, closed with screenshot), user tidak memiliki cara untuk melihat data aktual. | Card yang paling sering di-inspect oleh PM/Supervisor (replied conversations, SLA compliance) justru tidak bisa di-drill. |
| PS-003 | Date-range dari StatisticFilter tidak di-inject ke drill/navigate action. Jika user navigate ke conversation list tanpa date-range, angka di card (yang menghitung dalam rentang tanggal) akan berbeda dengan jumlah conversation yang tampil di list. | Inkonsistensi angka — user melihat "10 replied conversations" di card tapi list menampilkan 50 conversation (semua waktu). Confusion dan trust issue. |
| PS-004 | `StatisticCard` props tidak memiliki `onClick` — developer yang ingin menambahkan interaksi harus mengubah komponen molekul yang digunakan di banyak tempat. | Technical debt: perubahan kecil membutuhkan refactor besar karena komponen tidak extensible. |
| PS-005 | Conversation filter store (`conversationFilter.store.ts`) hanya expose subset field (status, read, sort, search). Untuk navigate-with-filter, field seperti `startDate`, `endDate`, `unassign`, `channel` perlu di-inject ke store atau URL param. | Filter tidak lengkap saat navigate — user melihat list tanpa date-range, angka tidak match. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
|-----------|-----------|
| KPI card interaktif | KR-1: 100% clickable KPI card (sesuai scope card mapping) memiliki cursor-pointer, hover state, keyboard accessible, aria-label |
| Data aktual di balik angka | KR-2: User dapat mengklik KPI card dan melihat list data aktual (navigate atau modal) dalam ≤ 2 klik |
| Konsistensi angka card ↔ drill | KR-3: Angka di drill result (`totalFromMetric`) = angka di KPI card (± 0 tolerance) dalam date-range yang sama |
| Agent self-scope terjaga | KR-4: 0 kasus drill result menampilkan data agent lain untuk user `READ_OWN` (setelah Patch 1 guard fix landing) |
| Phased delivery | KR-5: Fase 3a+3b (navigate) dan Fase 3c (drill endpoint + modal) ter-deliver dalam sprint terpisah tanpa regression |

---

## **5. User Stories & Acceptance Criteria**

| ID | Role | Story | Acceptance Criteria |
|----|------|-------|---------------------|
| US-001 | Admin | Saya ingin mengklik card "Open Conversations" dan langsung melihat daftar conversation yang statusnya open dalam rentang tanggal yang saya pilih di StatisticFilter | Given Admin membuka halaman Statistic dengan date-range 1-31 Jul 2026, When mengklik card "Open Conversations: 15", Then navigate ke halaman `/conversation` dengan filter status=open dan startDate=1 Jul, endDate=31 Jul terisi. Jumlah conversation = 15 (sesuai card). |
| US-002 | Admin | Saya ingin mengklik card "Replied Conversations" dan melihat daftar conversation yang sudah di-reply | Given Admin membuka halaman Statistic, When mengklik card "Replied Conversations: 20", Then modal terbuka menampilkan 20 conversation (via drill endpoint) dengan informasi dasar (subject, status, assignee, date). Pagination tersedia. |
| US-003 | Agent | Saya ingin mengklik card "Closed Conversations" dan hanya melihat conversation saya yang closed | Given Agent (`READ_OWN`) membuka Statistic, When mengklik card "Closed Conversations: 5", Then navigate ke `/conversation` dengan status=close, date-range terisi, dan hanya 5 conversation miliknya yang tampil. |
| US-004 | Supervisor | Saya ingin mengklik card "Overdue SLA" di ticket section dan melihat ticket yang overdue | Given Supervisor membuka Statistic, When mengklik card "Overdue SLA: 3", Then modal terbuka menampilkan 3 ticket dengan SLA status overdue. |
| US-005 | Admin | Saya ingin menggunakan keyboard (Tab + Enter) untuk mengakses KPI card interactive | Given Admin navigasi dengan keyboard, When Tab ke card dan tekan Enter, Then behavior sama dengan mouse click (navigate atau modal). |
| US-006 | Admin | Saya ingin card metric rasio (SLA rate %, one-touch rate) tetap non-clickable | Given Admin melihat halaman Statistic, When hover ke card "SLA Achievement Rate: 85%", Then cursor default (bukan pointer), tidak ada hover state interactive, card non-clickable. |

---

## **6. Functional Requirements**

| ID | Priority | System Behavior | Acceptance Criteria |
|----|----------|----------------|---------------------|
| FR-001 | P0 | System **MUST** menambahkan prop `onClick?: () => void` pada `StatisticCard` component. Component **MUST** merender sebagai `<div role="button" tabIndex={0}>` saat `onClick` ada, atau plain `<div>` saat tidak ada (backward compatible). | 1. Given `StatisticCard` tanpa `onClick`, When render, Then output = plain `<div>` tanpa cursor-pointer (perilaku existing, tidak berubah). 2. Given `StatisticCard` dengan `onClick`, When render, Then output = `<div role="button" tabIndex={0} className="cursor-pointer">` dengan hover state visual. 3. Given user keyboard-only, When Tab ke card dengan `onClick` dan tekan Enter/Space, Then `onClick` terpanggil. |
| FR-002 | P0 | System **MUST** menambahkan hover state visual pada `StatisticCard` yang interactive: slight elevation/shadow atau border color change. | 1. Given card interactive, When mouse hover, Then visual feedback terlihat (e.g., shadow-lg atau border-primary). 2. Given card non-interactive (tanpa `onClick`), When hover, Then tidak ada perubahan visual. |
| FR-003 | P0 | System **MUST** menambahkan `aria-label` pada `StatisticCard` interactive: `aria-label="Drill down: {label}: {value}"`. | 1. Given card "Open Conversations: 15" dengan onClick, When inspect, Then `aria-label="Drill down: Open Conversations: 15"`. |
| FR-004 | P0 | System **MUST** meng-inject date-range dari `StatisticFilter` (startDate, endDate) ke setiap navigate action conversation/ticket. Date-range **MUST** di-pass via URL parameter (bukan direct Zustand store mutation). | 1. Given StatisticFilter date-range = 1-31 Jul 2026, When user klik card conversation "Open Conversations: 15", Then URL navigate = `/conversation?status=open&startDate=2026-07-01&endDate=2026-07-31`. 2. Given halaman `/conversation` load dengan URL param startDate/endDate, Then conversation list ter-filter sesuai date-range. |
| FR-005 | P0 | System **MUST** navigate ke halaman `/conversation` dengan URL params yang merepresentasikan filter: `status`, `startDate`, `endDate`, `unassign`. Page **MUST** membaca URL params dan apply filter saat mount. | 1. Given card "Closed Conversations: 10", When klik, Then navigate `/conversation?status=close&startDate=...&endDate=...`. 2. Given page `/conversation` load, Then filter store ter-set dari URL params. 3. Given conversation list load, Then hasil filter = 10 (sesuai card). |
| FR-006 | P0 | System **MUST** mengimplementasikan navigate-with-filter untuk conversation cards: TOTAL_CONVERSATIONS (date-only), OPEN_CONVERSATIONS (status=open+date), CLOSED_CONVERSATIONS (status=close+date), UNASSIGNED_CONVERSATIONS (unassign=true+date). | 1. Given masing-masing card, When klik, Then navigate ke `/conversation` dengan URL params yang benar. 2. Given Agent `READ_OWN`, When klik card, Then navigate + filter self-scoped (BE guard enforcement). |
| FR-007 | P1 | System **MUST** mengimplementasikan navigate-with-filter untuk ticket cards: Total (date), Active (status=active+date), Closed (status=close+date), Reopened (status=reopened+date), Unassigned (unassign+date). | 1. Given masing-masing card ticket, When klik, Then navigate ke halaman ticket dengan URL params yang benar. 2. Given Agent, When klik, Then self-scoped via BE guard. |
| FR-008 | P0 | System **MUST** mengimplementasikan generic drill endpoint: `POST /analytics/drill`. Endpoint menerima `metric` (string parametric) dan mengembalikan document list, bukan count. | 1. Given request `{ metric: 'replied_conversations', startDate, endDate, page: 1, limit: 20 }`, When call, Then response = `{ items: Conversation[], pagination: { total, page, limit, totalPages }, totalFromMetric: number }`. 2. Given `totalFromMetric` = 20, Then card "Replied Conversations: 20" = KONSISTEN. |
| FR-009 | P0 | System **MUST** menerapkan `PermissionsGuard` (permission: `StatisticPermission.READ | READ_OWN | READ_TEAM | ALL`) pada drill endpoint. System **MUST** menggunakan `isSelfOnlyScope()` → `resolveAgentId` untuk scope enforcement. | 1. Given user tanpa permission statistic, When call drill endpoint, Then HTTP 403. 2. Given Agent `READ_OWN`, When call drill endpoint, Then hanya data miliknya yang dikembalikan. 3. Given Admin `ALL`, When call, Then data semua agent. |
| FR-010 | P0 | System **MUST** mengimplementasikan modal drill result component. Modal menampilkan list conversation/ticket dari drill endpoint, dengan pagination. Modal **MUST** terbuka saat user mengklik card yang tidak memiliki filter paritet. | 1. Given card "Replied Conversations: 20" (tanpa filter "replied" di list page), When klik, Then modal terbuka menampilkan 20 conversation dengan pagination. 2. Given modal open, When user tutup (ESC atau click outside), Then modal close. |
| FR-011 | P1 | System **MUST** mendukung metric berikut pada drill endpoint: `replied_conversations`, `closed_with_screenshot`, `overdue_sla_tickets`, `sla_met_tickets`, `csat_good`, `csat_bad`, `in_sla_frt`, `over_sla_frt`, `in_sla_ttc`, `over_sla_ttc`, `in_sla_solving`, `over_sla_solving`, `in_sla_rlt`, `over_sla_rlt` (2 metric terakhir **depends on Patch 4 — RLT & Wait Time SLA Tracking**, lihat catatan di bawah). Responsiveness SLA breakdown metric **WAJIB** menerima `domain` param (`conversation` \| `ticket` \| `all`) agar query disesuaikan dengan tab aktif di `SLABreakdownSection.tsx`. RLT SLA metric **HANYA valid untuk `domain=conversation`** — RLT tidak punya logic di ticket-service (lihat Patch 4 Change Intake Brief OQ-05), request dengan `domain=ticket` untuk metric RLT harus return 400 atau empty result (TBD saat implementasi Patch 4). | 1. Given masing-masing metric, When call drill, Then query pipeline mereproduksi definisi metric yang SAMA dengan count endpoint. 2. Given `totalFromMetric`, Then = angka di card (konsisten). 3. Given metric SLA breakdown dengan `domain=conversation`, When call drill, Then hanya conversation data yang dikembalikan. 4. Given metric `in_sla_rlt`/`over_sla_rlt` dengan `domain=ticket`, When call drill, Then request ditolak atau return empty (RLT tidak ada di domain ticket). |
| FR-012 | P1 | System **MUST** menandai card metric rasio (SLA achievement rate, one-touch rate, response rate) sebagai **non-clickable**: tanpa `onClick`, cursor default, tanpa hover state interactive. | 1. Given card rasio, When render, Then tidak ada cursor-pointer, tidak ada hover state. |
| FR-013 | P1 | System **MUST** menandai card count non-list (TOTAL_REPLY_SENT = count message, TOTAL_SCREENSHOTS = count screenshot) sebagai **non-clickable**. | 1. Given card TOTAL_REPLY_SENT, When render, Then non-clickable (bukan conversation list). |
| FR-014 | P2 | System **MUST** mengimplementasikan navigate-with-filter untuk card by-channel/by-tag di conversation section. | 1. Given card "WhatsApp Conversations: 30", When klik, Then navigate ke `/conversation?channel=whatsapp&startDate=...&endDate=...`. |
| FR-015 | P2 | System **MUST** mengimplementasikan drill untuk member performance per-agent (TBD — navigate to detail atau modal). | 1. Given card member performance, When klik, Then TBD (pending OQ decision). |

---

## **7. Permission Matrix**

| Role | Drill Conversation (navigate) | Drill Ticket (navigate) | Drill via Modal (drill endpoint) | Scope Enforcement |
|------|------------------------------|------------------------|--------------------------------|-------------------|
| Agent (`READ_OWN`) | ✅ Navigate + filter self-scoped (BE guard) | ✅ Navigate + filter self-scoped | ✅ Modal — data miliknya saja | `isSelfOnlyScope=true` → `resolveAgentId` force `user.id` |
| Supervisor (`READ_TEAM`) | ✅ Navigate + filter team-scoped | ✅ Navigate + filter team-scoped | ✅ Modal — data team | `resolveTeamId` filter by team |
| Admin (`READ`) | ✅ Navigate + filter all data | ✅ Navigate + filter all data | ✅ Modal — data semua agent | No scope restriction |
| Admin/Supervisor (`ALL`) | ✅ Navigate + filter all data | ✅ Navigate + filter all data | ✅ Modal — data semua agent | No scope restriction, wildcard cover |
| User tanpa permission statistic | ❌ Card non-clickable / 403 di drill | ❌ Card non-clickable / 403 di drill | ❌ 403 di drill endpoint | PermissionsGuard block |

> **Catatan:** Permission drill endpoint = sama dengan permission view statistic (reuse `statistic:read | read_own | read_team | all_access`). Tidak ada permission baru yang dibutuhkan. Navigate-with-filter tidak melewati drill endpoint — navigasi ke halaman list existing yang sudah memiliki guard sendiri.

---

## **8. Error Handling**

| ID | Type | Handling | UI/UX |
|----|------|---------|-------|
| EH-001 | Drill endpoint — user tanpa permission statistic | System **MUST** mengembalikan HTTP 403 dengan response body `{"statusCode":403,"message":"Insufficient permissions"}` (standar error SatuInbox). | Modal tidak terbuka. Card menampilkan toast error standar. |
| EH-002 | Drill endpoint — metric string tidak valid | System **MUST** mengembalikan HTTP 400 dengan response body `{"statusCode":400,"message":"Invalid metric: {metric}"}`. | FE menampilkan toast "Data tidak tersedia untuk card ini". |
| EH-003 | Drill endpoint — query timeout (large dataset, complex aggregate) | System **MUST** timeout dalam 10 detik, mengembalikan HTTP 503 dengan message "Drill query timeout, silakan coba dengan rentang tanggal lebih kecil". | FE menampilkan toast error dengan saran perkecil date-range. |
| EH-004 | Navigate-with-filter — halaman target gagal load (500 error) | Standard error handling halaman conversation/ticket. Tidak ada handling khusus dari statistic page. | Halaman target menampilkan error state standard. |
| EH-005 | Modal drill — pagination gagal (page > totalPages) | System **MUST** mengembalikan HTTP 200 dengan `items: []` dan pagination yang valid (page clamped ke totalPages). | FE menampilkan "Tidak ada data lagi" dengan button kembali ke page sebelumnya. |
| EH-006 | Date-range tidak tersedia di StatisticFilter (user belum set filter) | System **MUST** menggunakan default date-range: 30 hari terakhir (startDate = today - 30d, endDate = today). | Navigate/modal tetap jalan dengan date-range default. Toast optional: "Menggunakan rentang 30 hari terakhir". |
| EH-007 | Drill endpoint — scope resolution gagal (selfOnly tapi userId tidak ada) | System **MUST** mengembalikan HTTP 403 "Insufficient permissions — scope resolution failed". | FE menampilkan error toast. |

---

## **9. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
|----|----------|-------------------|-------|
| EC-001 | User klik card yang sangat cepat (double-click / rapid click) | Debounce: navigate hanya sekali. Modal: prevent double-open. | FE: single navigate/modal action, ignore rapid subsequent clicks. |
| EC-002 | Date-range di StatisticFilter kosong atau belum diset (user baru buka halaman) | Default: 30 hari terakhir. Card drill menggunakan date-range default. | Optional toast "Menggunakan rentang 30 hari terakhir". |
| EC-003 | Agent `READ_OWN` klik card "Total Conversations" — drill result = 0 (agent belum punya conversation) | Navigate berhasil, conversation list kosong (empty state standard halaman target). Modal drill: empty state "Tidak ada data". | Empty state standard sesuai halaman target. |
| EC-004 | Card dengan value = 0 (e.g., "Overdue SLA: 0") | Card **tetap clickable** (jika termasuk scope clickable). Drill result = empty list. | Card clickable normal. Empty state di halaman target / modal. |
| EC-005 | StatisticFilter date-range berubah setelah modal drill terbuka | Modal menampilkan data dari date-range saat modal dibuka (snapshot). User perlu tutup modal dan klik ulang untuk date-range baru. | Modal tidak auto-refresh saat filter berubah. (TBD — OQ decision: auto-refresh vs snapshot). |
| EC-006 | Navigate ke halaman conversation/ticket yang sudah memiliki filter aktif (user sebelumnya sudah set filter) | URL params dari card drill **override** filter yang sudah ada di page (baru diset). Filter store di-reset sesuai URL params dari drill. | Filter di halaman target berubah sesuai drill action. Previous filter hilang. |
| EC-007 | Card ratio (SLA %) diklik oleh user yang menggunakan screen reader | Card non-interactive — screen reader tidak meng-announce sebagai button. Tidak ada action. | `role="button"` dan `tabIndex` tidak ada di card non-interactive. |
| EC-008 | Drill endpoint dipanggil tanpa Patch 1 guard fix landing (guard belum active) | **Hard dependency.** Guard fix dari Patch 1 **WAJIB** sudah di-prod sebelum drill endpoint bisa di-deploy. Jika belum: drill endpoint TIDAK BOLEH di-deploy (data leak risk). | N/A — deployment control. |
| EC-009 | Conversation page belum support URL param untuk startDate/endDate | **Prerequisite.** Fase 3a membutuhkan halaman `/conversation` bisa membaca `startDate` dan `endDate` dari URL. Jika belum: perlu Patch 2 filter fix landing duluan. | N/A — dependency check. |
| EC-010 | User membuka modal drill, lalu navigate away (browser back / sidebar click) | Modal tertutup (unmount). Tidak ada data loss concern (drill = read-only). | Modal unmount clean, tidak ada orphan state. |
| EC-011 | Drill endpoint response `totalFromMetric` berbeda dengan card value (race condition: data berubah antara card fetch dan drill fetch) | Documented limitation: count bisa berubah dalam window beberapa detik. FE **MUST NOT** menampilkan error untuk perbedaan ≤ 1. | Tidak ada UI error. Document di Limitations section. |

---

## **10. UI & UX Requirements**

| Component | Behavior | Permission Gate | States |
|-----------|----------|----------------|--------|
| StatisticCard (interactive) | `cursor-pointer`, hover shadow/border change, `role="button"`, `tabIndex={0}`, `aria-label="Drill down: {label}: {value}"` | Card tampil untuk semua user dengan statistic permission. Clickability: hanya card dengan `onClick` prop. | Default: card normal. Hover: shadow-lg / border-primary. Focus: outline ring. Active: scale-down subtle. Loading (drill fetching): spinner di card atau skeleton. |
| StatisticCard (non-interactive) | Plain `<div>`, cursor default, no hover, no role/tabIndex. | Same visibility. | Default: card normal. No hover/focus/active interactive states. |
| Conversation navigate | Click card → `router.push('/conversation?status=...&startDate=...&endDate=...')` | Navigate target: guard halaman conversation (ConversationPermission.READ) | Loading: halaman target skeleton. Error: halaman target error state. Empty: "Belum ada conversation" standard. |
| Ticket navigate | Click card → `router.push('/ticket?status=...&startDate=...&endDate=...')` | Navigate target: guard halaman ticket | Same pattern. |
| Modal drill (Fase 3c) | Click card → modal overlay, fetch drill endpoint, tampilkan list conversation/ticket. Pagination. Close: ESC / click outside / X button. | `StatisticPermission.READ | READ_OWN | READ_TEAM | ALL` | Loading: skeleton list di modal. Empty: "Tidak ada data". Error: toast. |
| Modal drill — list item | Tampilkan informasi dasar: ID, subject/title, status, assignee, created date, last updated. Klik item → navigate ke detail. | Same as modal. | Loading: skeleton row. Error: row error state. |
| StatisticFilter date-range indicator | Saat date-range berubah, card drill menggunakan date-range baru (next click). | N/A | Date-range tampil di filter bar. |

---

## **11. Field & Validation**

| Field | Type | Required | Default | Validation | Notes |
|-------|------|----------|---------|------------|-------|
| `StatisticCard.onClick` | `() => void \| undefined` | No | `undefined` | Jika ada → interactive mode. Jika tidak → plain div (backward compatible). | Props baru, additive, tidak break existing. |
| `StatisticCard.ariaLabel` | `string` | No | auto-generated `"Drill down: {label}: {value}"` jika `onClick` ada | String | Bisa override manual jika perlu. |
| Drill request `metric` | `string` (enum) | Yes | N/A | Harus salah satu dari: `replied_conversations`, `closed_with_screenshot`, `overdue_sla_tickets`, `sla_met_tickets`, `csat_good`, `csat_bad`, `in_sla_frt`, `over_sla_frt`, `in_sla_ttc`, `over_sla_ttc`, `in_sla_solving`, `over_sla_solving` (extensible) | Validasi di BE: unknown metric → 400. |
| Drill request `domain` | `string` (enum) | No | `all` | `conversation` \| `ticket` \| `all` — hanya relevan untuk SLA breakdown metrics. Menentukan target query sesuai tab aktif di `SLABreakdownSection.tsx`. | Diabaikan untuk metric non-SLA-breakdown. |
| Drill request `startDate` | `ISO 8601 string` | Yes | N/A | Valid date, ≤ endDate | Sama dengan format KPI count endpoint. |
| Drill request `endDate` | `ISO 8601 string` | Yes | N/A | Valid date, ≥ startDate | Sama. |
| Drill request `teamId` | `string` | No | `undefined` | Valid ObjectId (jika ada) | Filter by team. |
| Drill request `agentId` | `string` | No | auto-resolved jika `isSelfOnlyScope=true` | Valid ObjectId (jika ada) | Force ke `user.id` jika self-only. |
| Drill request `page` | `number` | No | `1` | Integer ≥ 1 | Pagination. |
| Drill request `limit` | `number` | No | `20` | Integer 1-100 | Max 100 per page. |
| Drill response `totalFromMetric` | `number` | Yes | N/A | Harus ≥ 0 | Untuk verify konsistensi dengan card. FE bisa compare ±1 tolerance. |

---

## **12. API / Event Contract**

### **12.1 New Drill Endpoint**

| Endpoint | Method | Controller | Guard | Permission |
|----------|--------|-----------|-------|------------|
| `/analytics/drill` | POST | `analytics.controller.ts` (atau controller baru `drill-analytics.controller.ts`) | `PermissionsGuard` | `StatisticPermission.READ | READ_OWN | READ_TEAM | ALL` |

**Request Body:**

```json
{
  "metric": "replied_conversations",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2026-07-31T23:59:59.999Z",
  "teamId": "optional-team-id",
  "agentId": "optional-agent-id",
  "domain": "all",
  "page": 1,
  "limit": 20
}
```

**Response Body (Success):**

```json
{
  "items": [
    {
      "_id": "conversation-id-1",
      "subject": "Subject text",
      "status": "close",
      "assignee": { "_id": "agent-id", "name": "Agent Name" },
      "createdAt": "2026-07-15T08:00:00.000Z",
      "updatedAt": "2026-07-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "totalFromMetric": 20
}
```

**Response Body (Error — Invalid Metric):**

```json
{
  "statusCode": 400,
  "message": "Invalid metric: unknown_metric"
}
```

**Response Body (Error — Permission Denied):**

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

**Scope Enforcement:**

```
isSelfOnlyScope() === true  → force agentId = req.user.id (ignore request body agentId)
isSelfOnlyScope() === false → honor request body agentId (if provided) or return all data
```

> **Konsistensi:** Pipeline query drill endpoint **WAJIB** menggunakan definisi metric yang SAMA dengan count endpoint (e.g., `useFetchConversationReplyMetrics` → replied = conversation yang sudah punya reply dari agent). Beda hanya di proyeksi (return document list, bukan count).

### **12.2 Navigate URL Params Contract**

| Card | Navigate Target | URL Params |
|------|----------------|------------|
| TOTAL_CONVERSATIONS | `/conversation` | `?startDate=...&endDate=...` |
| OPEN_CONVERSATIONS | `/conversation` | `?status=open&startDate=...&endDate=...` |
| CLOSED_CONVERSATIONS | `/conversation` | `?status=close&startDate=...&endDate=...` |
| UNASSIGNED_CONVERSATIONS | `/conversation` | `?unassign=true&startDate=...&endDate=...` |
| Total Ticket | `/ticket` | `?startDate=...&endDate=...` |
| Active Ticket | `/ticket` | `?status=active&startDate=...&endDate=...` |
| Closed Ticket | `/ticket` | `?status=close&startDate=...&endDate=...` |
| Reopened Ticket | `/ticket` | `?status=reopened&startDate=...&endDate=...` |
| Unassigned Ticket | `/ticket` | `?unassign=true&startDate=...&endDate=...` |

> **Catatan:** Halaman target (`/conversation`, `/ticket`) **WAJIB** mendukung URL params `startDate`, `endDate`, `status`, `unassign` sebagai initial filter. Ini dependency ke Patch 2 (filter fix).

### **12.3 Card-to-Filter Mapping (Complete)**

| Card | Action | Filter / Metric | Clickable? |
|------|--------|----------------|------------|
| **Conversation: TOTAL_CONVERSATIONS** | Navigate | date-range only | ✅ Yes |
| **Conversation: OPEN_CONVERSATIONS** | Navigate | status=open + date | ✅ Yes |
| **Conversation: CLOSED_CONVERSATIONS** | Navigate | status=close + date | ✅ Yes |
| **Conversation: UNASSIGNED_CONVERSATIONS** | Navigate | unassign=true + date | ✅ Yes |
| **Conversation: REPLIED_CONVERSATIONS** | Modal (drill endpoint) | metric=`replied_conversations` | ✅ Yes |
| Conversation: TOTAL_REPLY_SENT | — | count message, bukan conversation | ❌ Non-clickable |
| Conversation: TOTAL_SCREENSHOTS | — | count screenshot | ❌ Non-clickable |
| **Conversation: CLOSED_WITH_SCREENSHOT** | Modal (drill endpoint) | metric=`closed_with_screenshot` | ✅ Yes |
| **Ticket: Total** | Navigate | date-range only | ✅ Yes |
| **Ticket: Active** | Navigate | status=active + date | ✅ Yes |
| **Ticket: Closed** | Navigate | status=close + date | ✅ Yes |
| **Ticket: Reopened** | Navigate | status=reopened + date | ✅ Yes |
| **Ticket: Unassigned** | Navigate | unassign=true + date | ✅ Yes |
| **Ticket: Overdue SLA** | Modal (drill endpoint) | metric=`overdue_sla_tickets` | ✅ Yes |
| **Ticket: SLA Met** | Modal (drill endpoint) | metric=`sla_met_tickets` | ✅ Yes |
| Ticket: One-touch rate | — | ratio derived | ❌ Non-clickable |
| Ticket: SLA Achievement rate | — | ratio derived | ❌ Non-clickable |
| **Responsiveness: In SLA FRT** | Modal (drill endpoint) | metric=`in_sla_frt` | ✅ Yes |
| **Responsiveness: Over SLA FRT** | Modal (drill endpoint) | metric=`over_sla_frt` | ✅ Yes |
| **Responsiveness: In SLA TTC** | Modal (drill endpoint) | metric=`in_sla_ttc` | ✅ Yes |
| **Responsiveness: Over SLA TTC** | Modal (drill endpoint) | metric=`over_sla_ttc` | ✅ Yes |
| **Responsiveness: In SLA Solving** | Modal (drill endpoint) | metric=`in_sla_solving` | ✅ Yes |
| **Responsiveness: Over SLA Solving** | Modal (drill endpoint) | metric=`over_sla_solving` | ✅ Yes |
| **Responsiveness: In SLA RLT** | Modal (drill endpoint) | metric=`in_sla_rlt` (domain=conversation only) | ✅ Yes — **depends Patch 4** |
| **Responsiveness: Over SLA RLT** | Modal (drill endpoint) | metric=`over_sla_rlt` (domain=conversation only) | ✅ Yes — **depends Patch 4** |

> **Catatan Responsiveness SLA Breakdown:** Card-card di atas berasal dari komponen `SLABreakdownSection.tsx` di section Responsiveness — **berbeda** dari ticket SLA cards (Overdue SLA, SLA Met, SLA Active) yang ada di section Ticket. Responsiveness SLA breakdown per-metric (FRT, TTC, Solving/Closed Rate, **RLT** — RLT depends Patch 4), bukan per-ticket. Data source: `responsiveness-analytics.service.ts` → `getResponsivenessSLABreakdown()` → RMQ call ke conversation-service/ticket-service. Response shape: `{ frtSla: { inSlaCount, inSlaPercent, overSlaCount, overSlaPercent }, ttcSla: {...}, closedRateSla: {...}, rltSla: {...} (depends Patch 4) }`. SLA breakdown section memiliki tabs: All / Conversations / Ticket — drill endpoint **WAJIB** menerima `domain` param (`conversation` | `ticket` | `all`) agar tab aktif saat drill menentukan target query. **RLT SLA breakdown HANYA tampil di tab Conversations (atau All yang meng-aggregate conversation) — tab Ticket: baris RLT di-hide** karena ticket-service tidak punya RLT assignment-based logic (lihat Patch 4 Change Intake Brief OQ-05).

---

## **13. Migration & Rollout Plan**

| Area | Plan | Owner | Validation | Rollback |
|------|------|-------|------------|----------|
| **StatisticCard onClick prop (Fase 3a)** | Tambah `onClick?` prop ke `StatisticCard.tsx`. Backward compatible: tanpa `onClick` = behavior existing. Tambah cursor-pointer, hover, aria, tabIndex conditional. | FE Engineering | QA: card tanpa onClick = unchanged. Card dengan onClick = interactive (hover, keyboard, click). Unit test: render with/without onClick. | Hapus `onClick` prop dari card wiring. Component tetap punya prop tapi tidak dipanggil. Zero risk. |
| **Conversation navigate-with-filter (Fase 3a)** | Wire onClick conversation cards → `router.push('/conversation?status=...&startDate=...&endDate=...')`. Inject date-range dari StatisticFilter. Page `/conversation` baca URL params. | FE Engineering | QA: click "Open Conversations" → navigate ke /conversation dengan filter yang benar. Jumlah conversation = sesuai card (±0). | Hapus onClick wiring. Card kembali non-interactive. |
| **Ticket navigate-with-filter (Fase 3b)** | Sama pattern dengan Fase 3a untuk ticket cards. | FE Engineering | QA: click "Active Ticket" → navigate ke ticket page dengan filter. | Hapus onClick wiring. |
| **Drill endpoint (Fase 3c)** | `POST /analytics/drill` di analytics controller. Generic, parametric. Guard: PermissionsGuard + isSelfOnlyScope. Query: reuse pipeline dari analytics-service. | BE Engineering | QA: call drill dengan valid metric → response valid. Invalid metric → 400. No permission → 403. Self-scope → data miliknya only. `totalFromMetric` = card value (konsisten). | Hapus endpoint route. Zero impact ke existing analytics. |
| **Modal drill component (Fase 3c)** | FE modal component: overlay, list, pagination, close. Wire card onClick (non-paritet cards) → open modal → fetch drill endpoint → render list. | FE + BE Engineering | QA: click "Replied Conversations" → modal open → list tampil → pagination jalan → close modal. | Hapus modal component import. Card kembali non-interactive. |
| **Advanced drill (Fase 3d)** | By-channel/by-tag navigate, member performance drill. | FE Engineering | QA: click card by-channel → navigate dengan channel filter. | Hapus wiring. |
| **Prerequisite check** | SEBELUM Fase 3a di-deploy: verifikasi Patch 1 guard fix sudah di-prod. Verifikasi Patch 2 filter fix (URL params support di halaman conversation/ticket) sudah di-prod. | Engineering + PM | Gate check: `git tag --contains` untuk Patch 1 & 2 merge commits. | N/A — blocker, tidak deploy tanpa prerequisite. |
| **Rollout Stages** | 1. Fase 3a (conversation navigate) — feature flag optional. 2. Fase 3b (ticket navigate). 3. Fase 3c (drill endpoint + modal). 4. Fase 3d (advanced). Setiap fase: deploy → smoke test → next fase. | Engineering + PM | Per-fase smoke test. Regression: halaman conversation/ticket existing tidak break. | Per-fase rollback: hapus onClick wiring + hapus drill endpoint. |

---

## **14. Non-Functional Requirements**

| Category | Requirement |
|----------|------------|
| Performance | Drill endpoint **MUST** response dalam ≤ 3 detik untuk dataset ≤ 10K documents. Timeout hard limit = 10 detik. |
| Performance | StatisticCard onClick handler **MUST** ≤ 1ms (hanya trigger navigate / open modal, tidak ada sync processing). |
| Performance | Modal drill list render **MUST** menggunakan virtualized list jika item > 50 (reuse pattern existing di conversation list). |
| Security | Drill endpoint **MUST** melewati PermissionsGuard + isSelfOnlyScope — **sama persis** dengan analytics endpoint lain. Tidak ada scope bypass. |
| Security | Agent self-scope **MUST** terjaga: `resolveAgentId` force `user.id` saat `isSelfOnlyScope=true`. Request body `agentId` di-override. |
| Security | Navigate-with-filter: URL params tidak boleh mengandung sensitive data. Status, date-range, unassign = non-sensitive. |
| Reliability | Date-range injection **MUST** konsisten: StatisticFilter value = value yang di-inject ke drill/navigate. Tidak ada window untuk stale value. |
| Observability | Drill endpoint **MUST** log metric, userId, companyId, response time (ms), total result count. |
| Accessibility | StatisticCard interactive **MUST** accessible: `role="button"`, `tabIndex={0}`, keyboard Enter/Space, `aria-label`. WCAG 2.1 AA compliance. |
| Backward Compatibility | `StatisticCard` tanpa `onClick` prop **MUST** render identik dengan behavior saat ini (plain div, no cursor-pointer, no hover). Zero regression. |

---

## **15. Success Metrics**

| KPI | Target | Time Window | Data Source |
|-----|--------|-------------|-------------|
| Card interactivity | 100% clickable card (sesuai scope) memiliki cursor-pointer, hover, keyboard access | Post-deploy Fase 3a | QA manual: visual check + keyboard test. |
| Drill consistency | `totalFromMetric` = card value (±0 tolerance) untuk 100% drill action | Post-deploy Fase 3c | QA: click 10 card, verify count match. |
| Drill response time | P95 ≤ 3 detik | Post-deploy Fase 3c, ongoing | BE log: drill endpoint response time. |
| Agent self-scope leak | 0 kasus drill result menampilkan data agent lain untuk `READ_OWN` | Post-deploy, ongoing | QA: Agent drill → verify data = miliknya only. |
| User adoption | ≥ 50% admin/supervisor yang membuka Statistic menggunakan drill dalam 30 hari pertama | 30 hari post-deploy | Analytics: click event count on StatisticCard onClick. |
| Regression | 0 regression di halaman conversation/ticket setelah navigate-with-filter deploy | Post-deploy Fase 3a+3b | QA: conversation/ticket page existing functionality unchanged. |

---

## **16. Limitations**

| Limitation | Impact |
|-----------|--------|
| Race condition: count di card bisa berubah antara fetch card dan fetch drill (data berubah dalam beberapa detik) | `totalFromMetric` mungkin berbeda ±1 dari card value. Documented, acceptable. FE: jangan tampilkan error untuk perbedaan ≤ 1. |
| Drill endpoint = query ulang aggregate pipeline, bukan lookup by ID. Pipeline harus mereproduksi definisi metric yang sama persis. | Jika definisi metric berubah di count endpoint tapi tidak di drill endpoint → inkonsistensi. Mitigasi: shared pipeline function. |
| Modal drill = snapshot date-range saat modal dibuka. Tidak auto-refresh saat StatisticFilter berubah. | User perlu tutup modal dan klik ulang untuk date-range baru. UX acceptable, mitigate di Fase 3d (jika perlu). |
| Non-clickable card (ratio, count non-list) = user tetap tidak bisa drill. | Acceptable: ratio bukan "list" natural. Document. |
| Patch 1 + Patch 2 = hard dependency. Drill endpoint dan navigate-with-filter TIDAK BOLEH di-deploy sebelum dependency landing. | Deployment gate: verifikasi prerequisite sebelum merge. |
| FE automated test tidak tersedia (0 test infrastructure di FE) | Drill flow tanpa automated safety net. Mitigasi: manual QA checklist per-fase. |
| `StatisticCard` component digunakan di banyak tempat — onClick wiring hanya di statistic page, bukan global. | Card di tempat lain tetap non-interactive. Correct behavior. |

---

## **17. Future Considerations**

| Item | Current Status | Future Action |
|------|---------------|---------------|
| Interactive charts (bukan cuma card) | Out of scope | Defer: chart drill-down (line chart, bar chart click → data) |
| Auto-refresh modal saat date-range berubah | Snapshot (Fase 3c) | Evaluate: modal live-update vs snapshot UX preference |
| Drill endpoint cache | Tidak ada cache | Evaluate: cache drill result per (metric, dateRange, userId, teamId) jika response time degrade |
| Member performance drill navigate vs modal | TBD (Fase 3d) | Decision pending: navigate ke detail page atau modal per-agent drill |
| Export drill result | Out of scope | Evaluate: "Export drill result" button di modal |
| StatisticCard skeleton loading state | Tidak ada | Evaluate: loading state di card saat drill fetch in-progress |
| FE automated test for drill flow | 0 test | Defer ke QA initiative: unit test StatisticCard onClick + integration test drill endpoint |

---

## **18. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
|-------------------|-------|--------|------------|
| **Dep:** Patch 1 (Agent Statistic Access — guard fix) **WAJIB** sudah di-prod | Engineering (Naftal) | Drill endpoint tanpa guard = data leak. **Hard blocker.** | Gate check: verifikasi Patch 1 merge + deploy sebelum Fase 3c merge. |
| **Dep:** Patch 2 (Parameter Improvement — filter fix) **WAJIB** sudah di-prod | Engineering (Naftal) | Halaman conversation/ticket tanpa URL param support = navigate-with-filter tidak jalan. **Hard blocker untuk Fase 3a+3b.** | Gate check: verifikasi Patch 2 merge + deploy sebelum Fase 3a merge. |
| **Dep:** Halaman `/conversation` dan `/ticket` support URL params `startDate`, `endDate`, `status`, `unassign` | FE Engineering (Patch 2 scope) | Tanpa ini: navigate ke halaman tanpa filter ter-apply. | Verify: URL params test di halaman target. |
| **Risk:** StatisticCard onClick wiring impact ke card di tempat lain (jika card digunakan di halaman lain) | FE Engineering | Card di halaman lain berubah behavior. | Mitigasi: `onClick` prop = optional, default undefined. Card tanpa `onClick` = unchanged. Verify: grep semua usage StatisticCard. |
| **Risk:** Drill pipeline tidak mereproduksi count pipeline secara akurat | BE Engineering | Angka drill ≠ angka card. User confusion. | Mitigasi: shared pipeline function antara count dan drill. `totalFromMetric` = self-check. |
| **Risk:** Conversation/ticket page URL param support belum selesai (Patch 2 delay) | Engineering | Fase 3a+3b ter-block. | Fallback: Fase 3c (drill modal) tidak ter-block — bisa di-deploy duluan. |
| **Risk:** Timeline phased delivery — Fase 3a-3d dalam sprint terpisah | PM + Engineering | Feature ter-deliver parsial, UX tidak lengkap. | Acceptable: phased UX. Fase 3a+3b = value sudah terasa (majority card clickable). |

---

## **19. Appendix**

### **A. StatisticCard Props Specification (Before → After)**

**Before (Current):**

```tsx
interface StatisticCardProps {
  label: string;
  value: string | number;
  changes?: string;
  status?: 'up' | 'down';
  className?: string;
  indicate?: boolean;
}
```

**After (Patch 3):**

```tsx
interface StatisticCardProps {
  label: string;
  value: string | number;
  changes?: string;
  status?: 'up' | 'down';
  className?: string;
  indicate?: boolean;
  onClick?: () => void;           // NEW — optional, backward compatible
  ariaLabel?: string;              // NEW — optional, auto-generated from label+value if onClick
}
```

### **B. Drill Metric Enum (Draft)**

| Metric Key | Source Domain | Description | Card Reference |
|-----------|--------------|-------------|----------------|
| `replied_conversations` | Conversation | Conversation yang sudah di-reply oleh agent | REPLIED_CONVERSATIONS |
| `closed_with_screenshot` | Conversation | Conversation closed yang memiliki screenshot | CLOSED_WITH_SCREENSHOT |
| `overdue_sla_tickets` | Ticket | Ticket yang SLA-nya overdue | Overdue SLA |
| `sla_met_tickets` | Ticket | Ticket yang SLA-nya terpenuhi | SLA Met |
| `csat_good` | CSAT | Conversation dengan CSAT rating positif (TBD: threshold) | CSAT Good |
| `csat_bad` | CSAT | Conversation dengan CSAT rating negatif (TBD: threshold) | CSAT Bad |
| `in_sla_frt` | Responsiveness | Conversation/ticket yang FRT-nya dalam SLA target | In SLA FRT |
| `over_sla_frt` | Responsiveness | Conversation/ticket yang FRT-nya melebihi SLA target | Over SLA FRT |
| `in_sla_ttc` | Responsiveness | Conversation/ticket yang TTC-nya dalam SLA target | In SLA TTC |
| `over_sla_ttc` | Responsiveness | Conversation/ticket yang TTC-nya melebihi SLA target | Over SLA TTC |
| `in_sla_solving` | Responsiveness | Conversation/ticket yang solving rate-nya dalam SLA | In SLA Solving |
| `over_sla_solving` | Responsiveness | Conversation/ticket yang solving rate-nya over SLA | Over SLA Solving |
| `in_sla_rlt` | Responsiveness | Conversation yang RLT-nya dalam SLA target (**domain=conversation only**, depends Patch 4) | In SLA RLT |
| `over_sla_rlt` | Responsiveness | Conversation yang RLT-nya melebihi SLA target (**domain=conversation only**, depends Patch 4) | Over SLA RLT |

> Extensible: metric baru ditambahkan dengan menambah case di drill endpoint handler + mendaftarkan pipeline query.
> **Catatan Patch 4 dependency:** Metric `in_sla_rlt` dan `over_sla_rlt` hanya dapat diimplementasi setelah Patch 4 (RLT & Wait Time SLA Tracking) mendefinisikan `RLTConfiguredMs` / `RLTSlAMet` di schema dan `CONVERSATION_RLT` di `ResponsivenessMetricType` enum. Sementara itu, kedua metric ini terdaftar di sini sebagai placeholder agar Patch 3 tidak perlu re-patch saat Patch 4 selesai.

### **C. Date-Range Injection Approach (OQ-P3-06 — TBD)**

| Approach | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **URL Parameter** | Safer — tidak mutate global state. Bookmarkable. Back/forward browser work. Lebih explicit. | Halaman target perlu baca URL params. | **Rekomendasi** — safer default. |
| **Zustand Store Mutation** | Lebih direct — filter langsung ter-set tanpa URL parsing. | Mutation = implicit side-effect. Back/forward browser break. Risk impact ke halaman conversation jika store di-mutate dari luar. | Alternative — perlu evaluate impact ke halaman target. |

> **Decision: TBD — Open (PM decision) OQ-P3-06.** PRD ini mengasumsikan URL Parameter approach (safer) sebagai default. Jika PM memilih Zustand store mutation, perlu update FR-004 dan Edge Cases.

### **D. Open Questions Summary**

| OQ | Question | Status | Impact on PRD |
|----|----------|--------|---------------|
| OQ-P3-01 | Card mana yang WAJIB clickable? | **TBD — Open (PM decision)** | Menentukan final card scope di FR-006, FR-007, FR-012, FR-013 |
| OQ-P3-02 | Metric rasio non-clickable? | **TBD — Open (PM decision)** | Jika rasio clickable: perlu drill endpoint untuk ratio breakdown |
| OQ-P3-03 | Generic vs per-metric drill endpoint? | **TBD — Open (PM decision)** | Mengubah arsitektur drill endpoint. PRD asumsi generic (1 endpoint). |
| OQ-P3-04 | Navigate vs modal per-card? | **TBD — Open (PM decision)** | Mengubah UX pattern. PRD asumsi: navigate (filter paritet), modal (no filter). |
| OQ-P3-05 | Replied conversations = P0 drill? | **TBD — Open (PM decision)** | Menentukan prioritas fase. Jika P0: Fase 3c perlu dipercepat. |
| OQ-P3-06 | Date-range injection: URL param vs Zustand store? | **TBD — Open (PM decision)** | Mengubah implementasi FR-004. PRD asumsi URL param. |

### **E. Glossary**

| Term | Definition |
|------|-----------|
| `StatisticCard` | Component molekul di `components/molecules/StatisticCard.tsx` — card yang menampilkan KPI metric (label + value). |
| Drill endpoint | Generic endpoint `POST /analytics/drill` — mengembalikan document list untuk metric tertentu (bukan count). |
| Navigate-with-filter | Pattern: klik card → navigate ke halaman list (conversation/ticket) dengan URL params filter pre-filled. |
| Modal drill | Pattern: klik card → buka modal overlay → fetch drill endpoint → tampilkan list di modal. |
| Filter paritet | Kondisi di mana filter di halaman list bisa mereproduksi definisi metric card (e.g., status=open + date = open conversations). |
| `totalFromMetric` | Field di drill response yang mengembalikan count total — untuk verifikasi konsistensi dengan card value. |
| `isSelfOnlyScope()` | Utility function di `analytics-scope.util.ts` yang menentukan apakah user hanya boleh melihat data sendiri (Agent `READ_OWN`). |
| Non-clickable card | Card metric rasio atau count non-list yang tidak memiliki "daftar" natural — tidak interactive. |

### **F. References**

- Change Intake Brief: `Assessments/cross-domain/agent-statistic-access/statistic-interactive-dashboard-change-intake-brief.md` v1.0
- Extensions Analysis: `Assessments/cross-domain/agent-statistic-access/agent-statistic-dashboard-extensions-analysis.md`
- 3-Patch Decomposition: `Assessments/cross-domain/agent-statistic-access/statistic-3-patch-decomposition-analysis.md`
- Parameter Inventory: `Assessments/cross-domain/agent-statistic-access/statistic-parameter-inventory-conversation-ticket.md`
- Patch 1 PRD: `PRD/Analytics/Statistic/PRD Analytics - agent statistic access.md`
- PRD Role Management: `PRD/Company n people/PRD Setting - Role management.md`
- BE repo: `omnichannel-satuinbox-be`
- FE repo: `omnichannel-satuinbox-fe`
- StatisticCard: `components/molecules/StatisticCard.tsx` (1636 chars, plain div)
- ConversationFilter type: `conversation.ts:79`
- ConversationFilter store: `conversationFilter.store.ts` (Zustand — subset)
- useAnalyticsAccessMode: `useAnalyticsAccessMode.ts:76-83`
- analytics-scope util: `analytics-scope.util.ts:21`
