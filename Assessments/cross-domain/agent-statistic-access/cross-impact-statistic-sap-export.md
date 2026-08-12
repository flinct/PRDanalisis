# Cross-Impact Analysis: Statistic Patches × SAP Report Export

> **Artifact Type:** Cross-Impact Analysis
> **Author / Owner:** Dany Christian
> **Date:** 2026-08-12
> **Status:** Draft
> **Source:**
> - Statistic 3-Patch Decomposition: `Assessments/cross-domain/agent-statistic-access/statistic-3-patch-decomposition-analysis.md`
> - SAP Brief (cross-domain, v1.0): `Assessments/cross-domain/sap-report-export/sap-report-export-change-intake-brief.md`
> - SAP Brief (general, v3.0): `Assessments/general/sap-report-export/sap-report-export-change-intake-brief.md`

---

## 0. Ringkasan

Intersection antara 3-patch statistic roadmap dan SAP Report Export = **sempit tapi kritis di 1 titik: export RBAC.**

- **Patch 1 (Agent Statistic Access)** introduces `statistic:export` permission yang menggate SEMUA export operations di `export-report-job.controller.ts`. Ini langsung mempengaruhi SAP export.
- **Patch 2 (Parameter Improvement)** dan **Patch 3 (Interactive Dashboard)** = **zero direct impact** ke SAP export. Mereka bekerja di layer statistik (aggregated daily-metrics), SAP export butuh layer row-level (Sub-PRD A). Berbeda layer, tidak konflik.

---

## 1. Titik Intersection: Export RBAC

### 1.1 Apa yang Patch 1 ubah

Patch 1 (GAP-5) introduces `StatisticPermission.EXPORT` (`statistic:export`) dan mengubah gate 4 export operations di `export-report-job.controller.ts`:
- **Before:** `@RequirePermissions([StatisticPermission.READ])`
- **After:** `@RequirePermissions([StatisticPermission.EXPORT])`

Artinya: role yang tadinya bisa export (karena punya `statistic:read`) **akan kehilangan akses export** kecuali di-backfill `statistic:export`.

### 1.2 SAP Brief alignment

SAP brief (general v3.0) Protected Existing Behavior §4.3:
> "RBAC: Admin+Supervisor only, Agent denied, Supervisor scoped ke Team Inbox."

SAP brief (cross-domain v1.0) OQ-01:
> "Role Agent boleh export SAP report juga, atau tetap Admin/Supervisor?"

### 1.3 Cross-Impact

| Scenario | Patch 1 Effect | SAP Brief Alignment |
|----------|---------------|---------------------|
| Admin/Supervisor punya `statistic:all_access` | Wildcard `statistic:*` otomatis cover `statistic:export` via `permission.guard.ts:39` → **export tetap jalan** | ✅ Align (Admin/Supervisor tetap bisa export) |
| Role dengan `statistic:read` (tanpa ALL) | Gate pindah READ→EXPORT → **export terblokir** kecuali di-backfill `statistic:export` | ⚠️ Perlu backfill (sudah di-scope di Patch 1 FR-007) |
| Agent (`statistic:read_own`) | Tidak dapat `statistic:export` → **export tersembunyi** | ✅ Align (SAP brief: "Agent denied") |
| SAP export Sub-PRD D | Pakai export infrastruktur LAMA (existing `export-report-job`) → **terpengaruh** oleh gate change | ⚠️ **CRITICAL** — Sub-PRD D harus menggunakan `statistic:export` atau permission yang konsisten |
| SAP export Sub-PRD A/B (new infra) | Pakai export infrastructure BARU (analytics row-level) → perlu definisi RBAC sendiri | ⚠️ **WAJIB reuse `statistic:export`** atau buat permission baru yang konsisten |

### 1.4 Rekomendasi

1. **Patch 1 harus landing duluan** sebelum SAP Sub-PRD D ships. Kalau SAP preset ships dengan gate `StatisticPermission.READ` (lama), dan Patch 1 belum landing → SAP preset kehilangan RBAC consistency.
2. **SAP Sub-PRD A/B (new export infra) WAJIB reuse `statistic:export` permission** — jangan buat permission export terpisah. Satu permission key untuk semua export surfaces.
3. **Backfill `statistic:export` (Patch 1 FR-007)** sudah mengcover role yang butuh export. Pastikan SAP brief OQ-01 resolution aligns: Agent = no export, Admin/Supervisor = export (via ALL wildcard atau explicit `statistic:export` grant).

---

## 2. Non-Intersections (Zero Impact)

### 2.1 Patch 2 ↔ SAP Export

| Aspect | Statistic Patch 2 | SAP Export (Sub-PRD A) | Conflict? |
|--------|-------------------|----------------------|-----------|
| Data layer | Aggregated daily-metrics (`conversationdailymetrics`, `ticketdailymetrics`) | Row-level NEW collections (`conversationexportdata`, `ticketexportdata`) | ❌ Tidak — berbeda layer |
| New metrics | Priority, spam, junked, group, CSAT channel breakdown | Row-level fields (35+27+6+9 SAP columns) | ❌ Tidak — berbeda granularity |
| Filter | StatisticFilter (date, team, agent, channel, platform) | Export filter (date range, employee, status) | ❌ Tidak — berbeda component |
| UI | Statistic page (6 sections) | Offline Report Download page | ❌ Tidak — berbeda halaman |

**Verdict: Zero conflict.** Patch 2 menambah display di halaman statistik. SAP export baca dari layer berbeda (row-level baru). SAP brief §5A gap analysis **mengkonfirmasi** ini: daily-metrics = "dashboard adequate, export NOT adequate" — mereka memang layer terpisah.

### 2.2 Patch 3 ↔ SAP Export

| Aspect | Statistic Patch 3 | SAP Export | Conflict? |
|--------|-------------------|-----------|-----------|
| Drill-down | KPI card → conversation/ticket list (navigate or modal) | Full dataset export → XLSX download | ❌ Tidak — berbeda UX pattern |
| API | `POST /analytics/drill` (card click → list) | Export job queue → XLSX | ❌ Tidak — berbeda endpoint + pipeline |
| Scope | Filtered subset (paginated list) | Full dataset (169k+ baris) | ❌ Tidak — berbeda scale |

**Verdict: Zero conflict.** Drill-down = interactive, small result set, real-time. SAP export = async, large dataset, job-based.

---

## 3. Dependency Graph (Updated)

```
PATCH 1 (Agent Statistic Access)          PATCH 2 (Parameter Improvement)
   [guard fix + statistic:export]            [filter fix + new metrics]
           │                                          │
           │          ← paralel-safe →                │
           │                                          │
           ├──→ SAP Sub-PRD D (SAP preset)            │
           │    [MUST use statistic:export]            │
           │                                          │
           └──────────┬───────────────────────────────┘
                      │
                      ▼
           PATCH 3 (Interactive Dashboard)
           [drill-down, depend P1+P2]

SAP Sub-PRD A (row-level collections) — INDEPENDEN dari statistic patches
SAP Sub-PRD B (column registry)       — depend Sub-PRD A
SAP Sub-PRD C (broadcast export)      — depend Sub-PRD A
SAP Sub-PRD D (SAP preset)            — depend Sub-PRD A + Patch 1 (statistic:export RBAC)
```

**Key:** Patch 1 `statistic:export` = **RBAC prasyarat** untuk SAP Sub-PRD D (dan semua export surfaces baru). Sub-PRD A/B/C = independen dari statistic patches.

---

## 4. Action Items

| # | Action | Owner | Urgency |
|---|--------|-------|---------|
| 1 | Pastikan Patch 1 `statistic:export` permission di-adopt oleh SAP Sub-PRD D (dan Sub-PRD A/B untuk new export infra) | PM + Eng Lead | Before SAP Sub-PRD D PRD |
| 2 | Backfill `statistic:export` (Patch 1 FR-007) covers role yang butuh export — align dengan SAP brief OQ-01 | PM | During Patch 1 |
| 3 | SAP Sub-PRD A/B new export infra: definisikan RBAC yang REUSE `statistic:export`, jangan buat permission baru | PM + Eng Lead | During SAP Sub-PRD A PRD |
| 4 | Tidak ada perubahan scope di Patch 1/2/3 yang diperlukan — zero conflict confirmed | — | N/A |

---

## 5. Ringkasan untuk PM

**Satu kalimat:** Patch 1 introduces `statistic:export` permission yang menggate SEMUA export. SAP export pakai infrastruktur export yang sama → SAP brief harus align dengan `statistic:export`. Ini sudah resolved di Patch 1 scope (backfill FR-007), tapi perlu dipastikan SAP Sub-PRD D adopt permission yang sama. Patch 2 dan 3 = zero impact ke SAP export (berbeda data layer).

**Tidak ada scope change** yang diperlukan di kedua belah pihak. Cuma perlu alignment RBAC saat SAP Sub-PRD D mulai PRD.
