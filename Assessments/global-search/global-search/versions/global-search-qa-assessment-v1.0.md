# QA Assessment Report: Global Search — Unified Conversation & Ticket Search

> **Assessment Type:** Type 1 — Feature Development Analysis
> **Source PRD / Source Input:** `PRD/Conversationv2/PRD - Global Search (Conversation + Ticket).md`
> **Assessment Artifact Path:** `Assessments/global-search/global-search/global-search-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/structure-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `Memory/CLAUDE-be.md`, `Memory/CLAUDE-fe.md`
> **Tanggal Analisa:** 2026-06-15
> **Status:** Superseded (replaced by v1.1)

---

## 0. Ringkasan Perubahan Analisa

- Initial version — analisa pertama untuk PRD Global Search v1.0.
- PRD ditulis dengan sangat baik: 10 user stories, 46 functional requirements, 8 error handler, 12 edge cases, NFR lengkap.
- Risiko utama: dependency ke conversation-service dan ticket-service untuk gRPC `SearchGlobal` yang belum ada, serta MongoDB text index.
- Decision: `PROCEED_WITH_CAUTION` — PRD siap, tetapi perlu pastikan 2 gRPC endpoint + text index siap sebelum development FE dimulai.

---

## 1. Overview

**Feature / Issue:** Global Search — Unified Conversation & Ticket Search

**Objective:** Memberikan satu halaman pencarian terpadu (`/search`) dimana agent dan supervisor dapat mencari di seluruh Conversation dan Ticket dengan satu kata kunci.

**Business Context:**
- Saat ini agent harus menebak apakah data yang dicari ada di Conversation atau Ticket sebelum mencari
- Agent harus navigasi ke halaman yang berbeda jika tebakan salah
- Custom attributes dan custom fields hanya bisa dicari di halaman list masing-masing

**Scope In:** Search across Conversation and Ticket with keyword highlighting, relevance ranking, RBAC scoping, click-through navigation.

**Scope Out:** Fuzzy search, AI semantic search, Broadcast/Contact domain search, export, analytics dashboard.

---

## 2. Decision Summary

**Decision Enum:** `PROCEED_WITH_CAUTION`
**Decision Class:** `CONDITIONAL_GO`

### Required Actions Before Development

- [ ] Define proto contract `SearchGlobal` di `conversation.proto` dan `ticket.proto`
- [ ] Benchmark MongoDB text index dengan production-volume data
- [ ] Konfirmasi status Custom Attributes BE
- [ ] Resolve Open Questions Q1-Q5

### Complexity and Risk Snapshot
- **Complexity Level:** Medium
- **Risk Level:** Medium
- **Primary Impact Areas:** Backend, API, UI, Database, RBAC, Performance

---

## 3. Requirement Summary

### Key Requirements
- 10 user stories (US-001 s.d. US-010) dengan acceptance criteria Given-When-Then
- 46 functional requirements (FR-001 s.d. FR-046)
- 8 error handlers (EH-001 s.d. EH-008)
- 12 edge cases (EC-001 s.d. EC-012)
- 9 NFR categories completed

### Critical Dependencies
- conversation-service `SearchGlobal` gRPC (BLOCKER)
- ticket-service `SearchGlobal` gRPC (BLOCKER)
- MongoDB text index pada conversations + messages + tickets
- Custom Attributes data model deployment

### Open Questions from PRD
- Q1: Advanced filter Phase 1 atau Phase 2?
- Q2: Message search window value (500?)
- Q3: "Muat lebih banyak" per domain independent atau simultaneous?
- Q4: Cross-reference linked ticket/conversation?
- Q5: Quoted exact phrase support?

---

## 4. Current State vs Proposed State

### Current State
Agent harus menebak domain → navigasi ke halaman tepat → cari → jika tidak ketemu → navigasi ulang.

### Proposed State
Satu halaman `/search` → search lintas domain → hasil grouped (Percakapan + Tiket) → click result → navigasi langsung.

### Data Flow
```
User keyword → API Gateway → parallel gRPC (conversation + ticket) → MongoDB text index → aggregate → FE render
```

---

## 5. Impact Analysis

| Dimension | Impact Level | Notes |
|----------|--------------|-------|
| Module | MEDIUM | 2 service baru terlibat, isolated addition |
| Database | MEDIUM | Text index baru pada 4 collection |
| API | MEDIUM | Endpoint baru, backward compatible |
| UI/UX | MEDIUM | Halaman baru, tidak mengubah existing |
| Security / RBAC | HIGH | Server-side enforcement critical |
| Performance | HIGH | P95 latency target 1.5s |
| Integration | LOW | Internal gRPC only |
| Reporting | LOW | Anonymized search logs |

---

## 6. Risk Analysis

| Risk | Level | Mitigation |
|------|-------|------------|
| Text index memperlambat write | HIGH | Benchmark staging; staggered rollout |
| gRPC timeout dataset besar | HIGH | 500 message window; 5s timeout; partial result |
| RBAC scope inkonsistensi | HIGH | Same middleware as Chat List + Ticket List |
| Custom attributes belum deployed | MEDIUM | Fallback: search available fields only |

---

## 7. Recommendation

| Item | Value |
|------|-------|
| Final Decision | PROCEED_WITH_CAUTION |
| Delivery Strategy | Full scope with feature toggle; partial launch possible |
| Earliest Next Step | Define proto contract + confirm Custom Attributes status |

_This v1.0 is superseded. See v1.1 for the complete analysis with Search Pipeline Architecture (Section 4.4)._
