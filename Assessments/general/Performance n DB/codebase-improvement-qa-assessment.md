# Assessment Report — Pemetaan Masalah SAPX ke Codebase FE/BE SatuInbox

| Metadata | Value |
|---|---|
| Assessment Type | Incident-driven codebase improvement analysis |
| Source Issue | Surat komplain PT SAPX (SAP.pdf) — 33 incident, 4 masalah utama |
| Artifact Path | `assessments/sapx/codebase-improvement/codebase-improvement-qa-assessment.md` |
| Version | v1.0 |
| Previous Version | — |
| Rules Applied | `qa-analysis-rule.md`, `impact-analysis-rule.md` |
| Reference Context | `.claude/memory/claude-be.md`, `.claude/memory/claude-fe.md`, `.claude/memory/global-memory.md` |
| Repo Analyzed | BE: `backend/` (NestJS Nx microservices, v2.7.0) · FE: `frontend/` (Next.js 16 Turborepo, v2.7.0) |
| Analysis Date | 2026-07-15 |
| Author | Dany Christian |
| Status | Draft |

---

## 1. Overview

Analisa lanjutan dari deck "SAPX Analisa Permasalahan dan Prioritas Perbaikan SatuInbox". Empat masalah utama dari komplain SAPX dipetakan ke kode aktual di repo FE dan BE lokal untuk menghasilkan rekomendasi improvement konkret per file.

Empat masalah SAPX:
1. **Blank / stuck / error saat load** (P1)
2. **Delay sinkronisasi pesan 10–20 menit** (P2)
3. **Routing salah — chat masuk ke agent status Break/Day-Off** (P1)
4. **Gangguan CRM + attachment gagal/rusak** (P2)

## 2. Decision Summary

- **Final Decision Enum:** `PROCEED_WITH_CAUTION`
- **Decision Class:** `CONDITIONAL_GO`
- **Decision Statement:** Root cause tiap masalah teridentifikasi di level kode dengan confidence tinggi; perbaikan dapat langsung diprioritaskan, namun beberapa temuan (contact sync, delivery receipt) masih perlu verifikasi log produksi.
- **Risk Level:** HIGH (masalah #2 dan #3 menyentuh pipeline inbound message dan assignment — area regression-sensitive per global memory)
- **Primary Impact Areas:** whatsapp service (Baileys), conversation-service (inbound processor + assignment), people-service (member status cache), media-service, api-gateway, FE error handling & session flow

---

## 3. Masalah #1 — Blank / Stuck / Error Saat Load

| # | Temuan | File | Prioritas |
|---|---|---|---|
| 1.1 | Tidak ada `error.tsx` / `global-error.tsx` di App Router — unhandled error → component tree crash → blank screen | `frontend/apps/omnichannel/app/[locale]/` (tidak ada error.tsx) | HIGH |
| 1.2 | `<Suspense fallback={null}>` di root layout — loading lambat tampak blank | `frontend/apps/omnichannel/app/[locale]/layout.tsx:64` | HIGH |
| 1.3 | Axios instance tanpa `timeout` — gateway hang = FE menunggu tanpa batas | `frontend/packages/helpers/src/axiosHelper.ts` | HIGH |
| 1.4 | gRPC call di gateway tanpa `timeout()` operator — downstream lambat = gateway hang | `backend/apps/api-gateway/src/app/conversation/conversation.controller.ts:191,216,251,288,326` | CRITICAL |
| 1.5 | React Query tanpa `retry` config — transient failure langsung error | `frontend/packages/react-query/src/helpers/makeQueryClientHelper.ts` | MEDIUM |
| 1.6 | Redis cache get/set tanpa try-catch — Redis down = error 500, bukan fallback ke DB | `backend/libs/cache/src/lib/services/redis-cache.service.ts:67-112` | HIGH |
| 1.7 | Providers tanpa ErrorBoundary wrapper | `frontend/apps/omnichannel/providers/Providers.tsx` | HIGH |
| 1.8 | Socket connect failure tidak punya fallback UI; 429 rate-limit tanpa handling khusus; unsafe cast error handler | `providers/SocketProviders.tsx`, `throw-service-error.ts:25` | MEDIUM |

**Improvement inti:** error boundary global + per-route, Suspense fallback bermakna, timeout Axios (10s) + gRPC (5s), graceful degradation Redis, retry 2x dengan backoff di React Query.

## 4. Masalah #2 — Delay Sync Pesan 10–20 Menit

| # | Temuan | File | Prioritas |
|---|---|---|---|
| 2.1 | Media download Baileys **blocking secara sinkron** sebelum pesan di-emit ke RabbitMQ — media besar bisa menahan pipeline 5–15 menit | `backend/apps/whatsapp/src/app/services/whatsapp-message.service.ts:552-573` | HIGH |
| 2.2 | `channel.ack()` dilakukan **sebelum** socket emit — kalau emit gagal, pesan tidak pernah sampai FE dan tidak ada retry | `backend/apps/conversation-service/src/app/processors/inbound-message.processor.ts:293` | HIGH |
| 2.3 | Blocking gRPC (team lookup + contact artifacts) di critical path penyimpanan pesan (+2–5 detik/pesan) | `backend/apps/conversation-service/src/app/services/conversation.service.ts:387-402` | MEDIUM |
| 2.4 | Socket emit fire-and-forget tanpa timeout/retry/ack — gateway down = pesan hilang di FE | `inbound-message.processor.ts:447` | MEDIUM |
| 2.5 | RabbitMQ `prefetchCount=10` — satu pesan media lambat memblok antrean saat burst | `backend/libs/common/src/lib/config/configurations/rabbit-mq.config.ts` | MEDIUM |

**Improvement inti:** decouple media processing dari inbound path (emit pesan dulu, attachment async), pindah ack setelah emit / pola acknowledged delivery, fire-and-forget-kan team & contact enrichment, pisahkan queue media vs teks + naikkan prefetch, FE fallback polling/refetch saat socket silent-fail.

## 5. Masalah #3 — Misrouting ke Agent Break/Day-Off

| # | Temuan | File | Prioritas |
|---|---|---|---|
| 3.1 | Member status di-cache dengan TTL **ONE_DAY (24 jam)** — agent Break masih terbaca READY oleh auto-pull | `backend/apps/people-service/src/app/services/member.service.ts:2331,2347` | HIGH (root cause utama) |
| 3.2 | `updateMemberStatus()` **tidak invalidate cache** — status baru menunggu TTL expire | `member.service.ts:1882+` | HIGH |
| 3.3 | Race window ±2 menit: auto-pull cron (interval 2 menit) baca status stale saat agent baru klik Break | `backend/apps/conversation-service/src/app/services/auto-pull-cron.service.ts:15` | HIGH |
| 3.4 | Tidak ada re-check status fresh tepat sebelum atomic assignment | `conversation.service.ts:3806-3820,4167-4189` | MEDIUM |
| 3.5 | Manual assignment (`assignConversation`) tidak cek status agent sama sekali — supervisor bisa assign ke agent Break | `conversation.service.ts:2041-2129` | MEDIUM |
| 3.6 | Tidak ada event `AGENT_STATUS_CHANGED` antar service — sinkronisasi 100% andalkan TTL cache | conversation-service (design gap) | MEDIUM |
| 3.7 | FE optimistic update status tanpa konfirmasi BE | `frontend/apps/omnichannel/components/molecules/main-side-nav/SideNavFooter.tsx` | LOW |

**Improvement inti:** TTL status → FIVE_MINUTES + cache invalidation on update, re-check status fresh sebelum assign, emit event status change (RabbitMQ) untuk invalidasi lintas service, tambah guard status di manual assignment.

## 6. Masalah #4 — Gangguan CRM + Attachment Gagal/Rusak

| # | Temuan | File | Prioritas |
|---|---|---|---|
| 4.1 | Inbound media gagal upload → `return null` silent, pesan tersimpan **tanpa attachment** (tampak rusak permanen) | `backend/apps/whatsapp/src/app/services/whatsapp-message.service.ts:546-594` | CRITICAL |
| 4.2 | Mismatch limit: file 20MB + protobuf encoding ≈ 26.6MB mendekati limit gRPC 30MB — upload file besar gagal dengan error generic | `backend/apps/api-gateway/src/app/media/media.controller.ts:198`, `proto/media.proto:69` | CRITICAL |
| 4.3 | Presigned URL expire **15 menit** — media chat history jadi "rusak" setelah 15 menit | `backend/apps/media-service/src/constants/config.constant.ts:3`, `frontend/.../api/media/[token]/route.ts:29-33` | HIGH |
| 4.4 | Outbound media send Baileys tanpa retry & tanpa update status gagal — customer tidak terima media tapi status "sent" | `whatsapp-message.service.ts:425-515` | HIGH |
| 4.5 | Multi-file upload berhenti di error pertama tanpa partial-success response | `backend/apps/media-service/src/app/app.service.ts:161-207` | MEDIUM |
| 4.6 | Gap validasi FE↔BE (magic bytes tidak dicek, error BE generic), HEIC conversion tanpa fallback, contact sync error handling belum jelas | `heic-converter.ts:11-23`, `media.controller.ts:186-188`, `whatsapp-message.service.ts:637-730` | MEDIUM |

**Improvement inti:** retry + dead-letter untuk media inbound, streaming upload gRPC atau turunkan limit efektif ke 15MB, token media persisten / refresh on 403, retry outbound + status `DELIVERY_FAILED`, partial-success response untuk multi-file.

---

## 7. Prioritas Lintas Masalah (Roadmap Perbaikan)

### Gelombang 1 — Quick wins berdampak besar (0–7 hari)
1. **[#3]** TTL member status ONE_DAY → FIVE_MINUTES + invalidate cache saat `updateMemberStatus` — perbaikan misrouting terbesar dengan perubahan terkecil.
2. **[#1]** Tambah `error.tsx` + `global-error.tsx` + ErrorBoundary + Suspense fallback — menghilangkan blank screen.
3. **[#1]** Timeout Axios (10s) dan gRPC `timeout(5000)` di gateway.
4. **[#4]** Retry (3x exp backoff) untuk media inbound & outbound; hentikan silent `return null`.

### Gelombang 2 — Perbaikan struktural (8–30 hari)
5. **[#2]** Decouple media download dari inbound message path (emit dulu, attachment async).
6. **[#2]** Pindahkan `channel.ack()` setelah socket emit / acknowledged delivery; pisahkan queue media vs teks.
7. **[#3]** Event `AGENT_STATUS_CHANGED` via RabbitMQ + re-check fresh sebelum assignment + guard di manual assign.
8. **[#4]** Streaming upload gRPC / limit efektif 15MB; presigned URL TTL 24 jam atau token refresh.
9. **[#1]** Graceful fallback Redis down; retry config React Query.

### Verifikasi produksi yang disarankan
- Histogram durasi consumer `message.inbound.*` (berapa % >1 menit?)
- Log kegagalan socket emit & frekuensi reconnect FE
- Log kegagalan upload/download media per hari
- Audit assignment: berapa chat ter-assign ke agent non-READY per minggu

## 8. Traceability

| Masalah SAPX | Temuan | Area | Status |
|---|---|---|---|
| Blank/stuck load | 1.1–1.8 | FE app router, axios, gateway, Redis | Identified |
| Delay sync 10–20m | 2.1–2.5 | whatsapp svc, inbound processor, RMQ | Identified |
| Misrouting Break/DO | 3.1–3.7 | people-service cache, auto-pull, assignment | Identified |
| CRM + attachment | 4.1–4.6 | media-service, Baileys media, FE upload | Identified |

## 9. Change Log

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-07-15 | Dany Christian | Initial assessment — pemetaan 4 masalah SAPX ke codebase FE/BE dengan rekomendasi improvement per file. |
