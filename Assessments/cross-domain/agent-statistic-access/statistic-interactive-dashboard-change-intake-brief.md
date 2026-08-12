# Change Intake Brief: Statistic Interactive Dashboard (Drill-Down)

> **Artifact Type:** Change Intake Brief
> **Source Request / BRD:** Diskusi PM (Dany Christian) — decompose statistic roadmap, 2026-08-12
> **Artifact Path:** `Assessments/cross-domain/agent-statistic-access/statistic-interactive-dashboard-change-intake-brief.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/requirements-lifecycle-rule.md`, `Rules/workflow-rule.md`, `Rules/impact-analysis-rule.md`
> **Supporting Context:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`, `PRD/Analytics/*`, `Assessments/cross-domain/agent-statistic-access/agent-statistic-dashboard-extensions-analysis.md`, `Assessments/cross-domain/agent-statistic-access/statistic-3-patch-decomposition-analysis.md`, `Assessments/cross-domain/agent-statistic-access/statistic-parameter-inventory-conversation-ticket.md`
> **Tanggal Intake:** 2026-08-12
> **Status:** Draft
> **Author:** Dany Christian

---

## 0. Ringkasan Update Brief

- Initial version. Request: membuat KPI card di halaman statistic bisa diklik → menampilkan data aktual (conversation/ticket list) sesuai card yang diklik.
- Klasifikasi: `NEW_FEATURE`. Routing: `ROUTE_NEW_PRD`.
- Hard problem: metric card = count agregat tanpa ID. Drill butuh query ulang yang mereproduksi definisi metric.
- Depend ke Patch 1 (guard fix — data leak) + Patch 2 (filter rapih + parameter lengkap).

---

## 1. Request Snapshot

**Request Summary:** KPI card di halaman statistic bisa diklik → menampilkan 10 conversation aktual (atau N ticket, dll). Misal: card "Percakapan sudah dibalas: 10" → klik → tampilkan 10 conversation tersebut, entah navigate ke halaman conversation dengan filter, atau modal/popup baru di statistic.

**Business Problem:** User melihat angka di statistic tapi tidak bisa langsung lihat data di balik angka. Harus manual buka halaman conversation/ticket dan filter sendiri (kalau tahu filternya).

**Target User / Role / Stakeholder:** Admin, Supervisor, Agent (sesuai RBAC statistic). Agent drill-down = wajib self-scoped.

**Expected Outcome:**
1. KPI card yang "bisa di-drill" = clickable (cursor pointer, hover state, keyboard accessible).
2. Klik → data aktual tampil (navigate atau modal) dengan konsistensi angka (tepat N sesuai card).
3. Agent self-scope terjaga — drill tidak bocorkan data agent lain.
4. Card yang tidak punya "daftar" natural (ratio, average) = non-clickable.

**Urgency / Why Now:** UX enhancement, depend ke P1 + P2. Target ver3.0+.

---

## 2. Change Classification

| Item | Value |
|------|-------|
| Change Class | `NEW_FEATURE` |
| Primary Domain | Analytics + Conversation + Ticket |
| Request Shape | Add (interactive behavior + drill endpoint + modal/list UI) |
| Initial Complexity Signal | Medium-Large (phased) |
| Needs Split? | Phased internally (3a navigate → 3b ticket navigate → 3c modal+drill endpoint → 3d advanced) |

### Classification Rationale
- Menambah behavior baru: card yang tadinya statik → clickable → menampilkan list/navigate.
- Bukan improvement karena tidak memperbaiki yang ada, melainkan menambah interaksi baru.
- Butuh BE drill endpoint baru (generic, parametric) untuk card yang tidak punya filter paritet di conversation/ticket list.
- Butuh FE: `StatisticCard` onClick wiring + modal component + store hydration (navigate).

---

## 3. Current State Verification

### 3.1 StatisticCard (VERIFIED)
- `components/molecules/StatisticCard.tsx` — plain `<div>`, **TIDAK ada** onClick / Link / cursor-pointer.
- Props: `{label, value, changes?, status?, className?, indicate?}`.
- Need: tambah `onClick?` prop, cursor-pointer, aria attributes.

### 3.2 Metric Data Source (VERIFIED)
- KPI card diisi 3 hook: `useFetchConversationTotalMetrics`, `useFetchConversationReplyMetrics`, `useFetchConversationScreenshotMetrics`.
- Return **count saja** (`data.repliedConversations: number` dst). **Tidak ada conversation ID.**
- Sama untuk ticket: `TicketCountsResponse` = counts only.

### 3.3 Conversation List Filter (VERIFIED)
- FE type `ConversationFilter` (conversation.ts:79): support `status, statusRead, channel, platform, tags, participants, assign, unassign, startDate, endDate, team, priority, isJunked, isFavorite, isSpam, search, sort`.
- FE Zustand store (`conversationFilter.store.ts`): cuma expose `status, read, sort, search` — **subset** dari type.
- BE DTO (`getConversations.dto.ts`): terima SEMUA field di ConversationFilter type + `startDate, endDate`.
- BE guard: `ConversationPermission.READ` + `buildGetConversationPayload` inject `role.code + userId`.

### 3.4 Card-to-Filter Mismatch Analysis

| KPI Card | Filter conversation list yang cocok | Bisa drill bersih? |
|---|---|---|
| TOTAL_CONVERSATIONS | `startDate/endDate` | ⚠️ Butuh date-range (DTO support, store belum expose) |
| OPEN_CONVERSATIONS | `status=open` + date-range | ⚠️ Sama |
| CLOSED_CONVERSATIONS | `status=close` + date-range | ⚠️ Sama |
| UNASSIGNED_CONVERSATIONS | `unassign=true` + date-range | ⚠️ Sama |
| **REPLIED_CONVERSATIONS** | **TIDAK ADA** filter `replied` di list DTO | ❌ Butuh drill endpoint |
| TOTAL_REPLY_SENT | count message, bukan conversation | ❌ Non-clickable |
| TOTAL_SCREENSHOTS | count screenshot | ❌ Non-clickable |
| CLOSED_WITH_SCREENSHOT | **TIDAK ADA** filter screenshot | ❌ Butuh drill endpoint |

### 3.5 Ticket Card-to-Filter Mismatch

| KPI Ticket Card | Filter ticket list | Bisa drill bersih? |
|---|---|---|
| Total ticket | date-range | ⚠️ Butuh date-range |
| Active / in-progress | status filter + date | ⚠️ |
| Closed / resolved | status filter + date | ⚠️ |
| Reopened | status filter + date | ⚠️ |
| Unassigned | unassign + date | ⚠️ |
| Overdue SLA | **TIDAK ADA** filter | ❌ Butuh drill endpoint |
| SLA met | **TIDAK ADA** filter | ❌ Butuh drill endpoint |
| One-touch | ratio derived | ❌ Non-clickable |
| SLA achievement rate | ratio derived | ❌ Non-clickable |

---

## 4. Scope Boundary

### 4.1 In Scope

**Fase 3a — FE clickable + navigate (conversation):**
- `StatisticCard` tambah onClick prop + cursor-pointer + hover + aria.
- Store hydration: extend conversation filter store atau URL param injection untuk `status + startDate + endDate`.
- Conversation card open/closed/unassigned/total → navigate ke `/conversation` dengan filter terisi.
- Date-range wajib dibawa dari statistic filter supaya angka konsisten.

**Fase 3b — FE clickable + navigate (ticket):**
- Ticket card total/active/closed/reopened/unassigned → navigate ke ticket page dengan filter.
- Sama pattern dengan 3a.

**Fase 3c — Modal + drill endpoint (card tanpa filter paritet):**
- BE: `POST /analytics/drill` — generic endpoint, parametric (`metric: string, startDate, endDate, teamId?, agentId?, page, limit`).
- Guard: PermissionsGuard (statistic:read | read_own | read_team | all). Scope: `isSelfOnlyScope()` → `resolveAgentId`.
- Query: reuse analytics-service aggregate pipeline, return document list (bukan count).
- Konsistensi: pakai DEFINISI METRIC YANG SAMA dengan count endpoint.
- FE: modal component tampilkan list result (reuse row conversation/ticket existing).
- Card: replied conversation, overdue SLA, SLA met, CSAT good/bad, SLA breakdown.

**Fase 3d — Advanced drill:**
- Card by-channel/by-tag (conversation) → navigate + filter.
- Member performance per-agent drill → TBD (perlu decision: navigate to detail atau modal).

### 4.2 Out of Scope
- **Patch 1 (Agent Statistic Access)** — guard fix + backfill.
- **Patch 2 (Parameter Improvement)** — filter fix + new metrics.
- Card metric rasio (SLA rate %, response rate, one-touch %) = **non-clickable** — bukan "list" natural.
- Perubahan metric endpoint existing (count tetap count, drill = endpoint terpisah).
- New statistic sections di StatisticNav.
- Interactive charts (bukan cuma card).

### 4.3 Protected Existing Behavior
- Metric count existing tetap tampil (card tetap menampilkan angka).
- Filter statistic existing tetap jalan.
- RBAC self-scope tetap jalan.
- Conversation/ticket list page existing tidak berubah (tetap reusable sebagai navigate target).

---

## 5. Early Impact Flags

| Area | Flag | Notes |
|------|------|-------|
| Shared entity / lifecycle / state | No | Drill = read-only, tidak mutate |
| RBAC / visibility / assignment | **Yes** | Drill wajib self-scoped untuk agent. DEPEND Patch 1 guard fix. |
| API / webhook / socket / queue / cron | **Yes** | Drill endpoint baru (`POST /analytics/drill`) |
| SLA / reporting / export | No | Export tidak terpengaruh |
| Migration / rollback / feature flag | Yes (minor) | Drill endpoint = additive, rollback = hapus endpoint |
| Existing regression scope | Medium | Pastikan navigate + filter injection tidak break conversation/ticket list |

### Blast-Radius Notes
- **RBAC dependency:** drill endpoint wajib lewat guard fix (Patch 1). Kalau guard belum landing → drill bisa bocor data. **Hard dependency.**
- **Date-range konsistensi:** navigate-with-filter tanpa date-range → angka beda → bug report. Date-range WAJIB di-inject.
- **Filter store injection:** mengubah conversation filter store = risiko impact ke halaman conversation. Rekomendasi: URL param injection (bukan direct store mutation) — lebih aman.
- **Drill endpoint scope:** generic endpoint (1 endpoint, parametric) lebih maintainable daripada N endpoint per-metric.

---

## 6. Routing Decision

| Item | Value |
|------|-------|
| Routing Decision | `ROUTE_NEW_PRD` |
| Recommended Next Rules | `Rules/prd-writing-rule.md`, `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md` |
| Recommended Next Artifact | PRD baru: Interactive Statistic Dashboard |
| Can Proceed to PRD? | Ya — brief ini cukup matang untuk draft PRD |

### Routing Rationale
- NEW_FEATURE: menambah behavior baru (clickable → drill).
- Bukan addendum karena tidak memperbaiki yang ada.
- PRD terpisah dari Patch 1 dan Patch 2 supaya rilis tidak saling menghambat.

---

## 7. Blocking Questions & Decisions Needed

| ID | Question / Gap | Why It Matters | Blocking? | Owner | Status |
|----|----------------|----------------|-----------|-------|--------|
| OQ-P3-01 | Card mana yang WAJIB clickable? (rekomendasi: open/closed/unassigned/replied) | Menentukan scope fase | **Yes** | PM | Open |
| OQ-P3-02 | Metric rasio (SLA rate %, response rate) = non-clickable? | Menentukan scope | **Yes** | PM | Open |
| OQ-P3-03 | Drill endpoint generic (1 endpoint, parametric) vs per-metric endpoint? | Arsitektur | **Yes** | Eng Lead | Open |
| OQ-P3-04 | Navigate-with-filter vs modal — setuju per-card approach (navigate utk card bersih, modal utk card butuh drill endpoint)? | UX pattern | **Yes** | PM | Open |
| OQ-P3-05 | "Replied conversations" = P0 drill target? (contoh PM yang paling sering dipakai, tapi paling sulit — butuh drill endpoint) | Prioritas | Medium | PM | Open |
| OQ-P3-06 | Date-range injection: URL param (lebih aman) vs Zustand store mutation (lebih direct)? | Technical approach | Medium | Eng Lead | Open |

---

## 8. Downstream Reuse Map

| Downstream Artifact | Path | How This Brief Is Reused |
|---------------------|------|--------------------------|
| PRD Interactive Dashboard | TBD | source: scope, drill approach, per-card mapping, BE endpoint spec |
| QA Pre-Implementation | TBD | drill consistency test strategy, RBAC validation |
| Extensions Analysis | `agent-statistic-dashboard-extensions-analysis.md` | feasibility grounding, per-card mismatch analysis |
| 3-Patch Decomposition | `statistic-3-patch-decomposition-analysis.md` | dependency, phasing, effort |

---

## 9. BE Drill Endpoint Design (Draft)

```
POST /analytics/drill
Body: {
  metric: 'replied_conversations' | 'overdue_sla_tickets' | 'csat_good' | ...,
  startDate: ISO string,
  endDate: ISO string,
  teamId?: string,
  agentId?: string,
  page: number,
  limit: number
}
Response: {
  items: Conversation[] | Ticket[],
  pagination: { total, page, limit, totalPages },
  totalFromMetric: number  // untuk verify konsistensi dengan card
}

Guard: PermissionsGuard (StatisticPermission.READ | READ_OWN | READ_TEAM | ALL)
Scope: isSelfOnlyScope() → resolveAgentId force user.id (sama dengan analytics endpoint lain)
Query: reuse analytics-service pipeline yang SAMA dengan count endpoint, beda proyeksi (return list, bukan count)
Konsistensi: totalFromMetric WAJIB = angka yang tampil di card (query = definisi metric yang sama)
```

---

## 10. Effort Sizing & Phasing

| Fase | Isi | Effort | Dependencies |
|------|-----|--------|-------------|
| **3a** | StatisticCard onClick + navigate conversation (open/closed/unassigned/total + date-range injection) | M | Patch 1 (guard), Patch 2 (filter fix) |
| **3b** | Navigate ticket (total/active/closed/reopened/unassigned) | M | 3a (pattern established) |
| **3c** | Modal + drill endpoint (replied, overdue SLA, SLA met, CSAT good/bad) | L | 3a (UI pattern), Patch 1 (guard) |
| **3d** | Advanced: by-channel/by-tag navigate, member-performance drill | M | 3c |
| **Total** | | **M-L** | 5-8d dev + 2-3d QA (phased) |

---

## 11. Open Questions Summary

| OQ | Blocking? | Status |
|----|-----------|--------|
| OQ-P3-01: Card mana yang clickable? | Yes | Open |
| OQ-P3-02: Rasio non-clickable? | Yes | Open |
| OQ-P3-03: Generic vs per-metric drill endpoint? | Yes | Open |
| OQ-P3-04: Navigate vs modal per-card? | Yes | Open |
| OQ-P3-05: Replied = P0 drill? | Medium | Open |
| OQ-P3-06: Date-range injection approach? | Medium | Open |

---

## 12. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-08-12 | v1.0 | Initial brief: interactive dashboard decomposed from Patch 1 brief v1.6. Source: extensions analysis + 3-patch decomposition + parameter inventory + codebase verified anchors. | Dany Christian |
