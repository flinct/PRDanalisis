# Performance Testing Analysis — WhatsApp Group Mention

## Arsitektur yang Terlibat

```
FE Composer (@) → API load participants → BE participant service
    → send message + mention metadata → WhatsApp outbound
    → inbound mention render → timeline highlight + tooltip
```

## 1. Participant List Loading (Critical Path)

| Aspek         | Detail                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| **Endpoint**  | Load group participants saat agent ketik `@`                                   |
| **Risiko**    | WA group bisa punya 100-256 anggota. Payload besar = picker lambat             |
| **Test**      | Load participant list untuk group kecil (10), sedang (50), besar (256 anggota) |
| **Metrik**    | TTFB participant API, time-to-interactive picker, memory footprint di FE       |
| **Edge case** | Participant load gagal → auto-retry within 2s (FR-004). Test retry under load  |

## 2. Mention Send Path — Server-Side Validation

| Aspek        | Detail                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Endpoint** | Send message dengan mention metadata → BE validate against group membership                                                      |
| **Risiko**   | Validasi mention target = query ke WA participant data per message. 100 mentions × N concurrent agents = N×100 validation checks |
| **Test**     | Send dengan 1, 10, 50, 100 mentions. Concurrent: 5, 10, 20 agents sending mentions simultaneously                                |
| **Metrik**   | Send latency p50/p95, drop rate (invalid mentions), BE CPU/memory spike                                                          |
| **Boundary** | Max 100 mentions per message (EC-005). Test 101 → block                                                                          |

## 3. Inbound Mention Rendering

| Aspek      | Detail                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| **Path**   | Inbound WA group message dengan mentions → timeline render → highlight + tooltip                      |
| **Risiko** | Message dengan banyak mention = DOM heavy rendering. Jika metadata missing → fallback plain text path |
| **Test**   | Render 100 messages, masing-masing 1-100 mentions. Measure frame drops, scroll jank                   |
| **Metrik** | Render time per message, DOM node count, memory growth over 1000 messages                             |

## 4. Socket + Invalidation Loop (Existing Storm Pattern)

Ini yang **paling kritis** — karena SatuInbox sudah punya pola pending storm di `/conversation` endpoints.

| Aspek       | Detail                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Risiko**  | Mention send di WA group → new message event → socket broadcast → FE invalidation refetch. Jika banyak agent sekaligus kirim mention di group yang sama, ini bisa trigger cascade refetch                    |
| **Test**    | Pakai `storm-reproducer.js` yang sudah ada + flood mention-heavy messages ke group conversation. Monitor apakah `/conversation`, `/conversation/count`, `/conversation/filter-count` mengalami refetch storm |
| **Metrik**  | Refetch count per subscriber per minute, p95 latency endpoints di atas, socket event count                                                                                                                   |
| **Tooling** | `inbound-rmq-flood.js` (Pool A existing conversation) + `storm-reproducer.js` — sudah ada di `sixV2Automation/scripts/`                                                                                      |

## 5. Participant Metadata Staleness

| Aspek      | Detail                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Risiko** | Metadata peserta di-cache/denormalized. Participant leave group setelah picker dibuka → mention invalid on send (EC-002) |
| **Test**   | Open picker → mutate participant list (leave/add) → send. Measure staleness window                                       |
| **Metrik** | Time from participant change to metadata consistency, drop rate under rapid group mutation                               |

## 6. Observability Baseline (FR-022, FR-023)

| Aspek           | Detail                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Requirement** | Mention usage metrics per workspace + log participant load/send failures                     |
| **Test**        | Verify metrics exist under load. Failures logged dengan reason category, bukan generic error |

## 7. Shared Resource Contention

| Aspek      | Detail                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Risiko** | Mention validation = additional DB/gRPC call per message. Di atas existing conversation traffic, ini nambah pressure ke shared MongoDB + Redis pool |
| **Test**   | Baseline: flood tanpa mention → flood dengan mention. Compare p95 semua conversation endpoints                                                      |
| **Metrik** | Delta p95 `/conversation`, `/conversation/count`, `/conversation/history` dengan vs tanpa mention traffic                                           |

## Rangkuman: Test Matrix

| Test                                              | Tool                  | Priority | Risk                        |
| ------------------------------------------------- | --------------------- | -------- | --------------------------- |
| Participant list load latency (10/50/256 members) | k6 / Playwright       | **P0**   | Picker unusable if slow     |
| Concurrent mention send (N agents × M mentions)   | k6 + RMQ flood        | **P0**   | Send path bottleneck        |
| Socket storm with mention traffic                 | `storm-reproducer.js` | **P0**   | Existing pending storm risk |
| Timeline render 100 mentions/message              | Playwright perf trace | P1       | FE jank                     |
| Shared resource contention delta                  | k6 before/after       | P1       | Silent degradation          |
| Metadata staleness window                         | Manual + timing       | P2       | Edge case                   |
| Max 100 mention boundary                          | Automated             | P2       | Guard clause check          |

## Rekomendasi Eksekusi

Test P0 duluan — participant load, concurrent send, dan socket storm. Ketiga ini punya existing tooling (`inbound-rmq-flood.js`, `storm-reproducer.js`, k6) jadi tinggal extend dengan mention-specific payloads, gak perlu bikin dari nol.

## Open Question

Apakah BE mention validation jalan inline (synchronous di send path) atau async (queue + callback)? Ini menentukan apakah test concurrent send perlu tunggu response atau cukup measure queue depth. Kalau PRD bilang "validate server-side against group membership" (FR-010), itu kemungkinan sync = bottleneck langsung di send latency.
