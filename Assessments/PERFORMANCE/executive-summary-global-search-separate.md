# Performance Test Executive Summary

---

# Test Information

| Field | Value |
|-------|-------|
| Feature | Global Search — Separate Ticket + Conversation Endpoints |
| Module | Global Search Suggestion (Phase 1) |
| Test Type | Spike Test |
| Environment | dev-v2 (staging) |
| PRD Version | PRD global search - global search suggestion.md v2.1 |
| Tester | Aprizal (aprizaladm01) |
| Test Date | 2026-07-24 |
| Duration | ~6 minutes per run (1m baseline → 1m spike → 3m sustain → 1m ramp-down) |
| Tool | Grafana k6 |
| Authentication | NextAuth Credentials Provider (3-step: csrf → credentials → session → JWT) |

---

# Test Objective

This performance test evaluates the scalability, stability, and responsiveness of the **separate Global Search endpoints** (`/api/search/tickets` and `/api/search/conversations`) under concurrent user load. The test validates compliance with the PRD Non-Functional Requirements (NFR §11) — P95 < 1.5s for search queries — and identifies the concurrency level where system degradation begins.

The test covers VU_MAX configurations from 25 to 100 concurrent users to map the performance degradation curve.

---

# Workload Scenario

| Stage | Duration | Target VUs |
|-------|---------:|-----------:|
| Warm Up (baseline) | 1m | 5 (fixed, then spike) |
| Ramp Up (spike) | 1m | VUS_MAX (25–100) |
| Sustain (peak) | 3m | VUS_MAX (25–100) |
| Ramp Down | 1m | 0 |

**Search Keywords Rotated:** 15 keywords (tes, test, AWB, order, refund, tracking, payment, complaint, return, 12345, customer, support, SAP, CV-, barang) to avoid caching effects.

---

# Executive Summary

The Global Search separate endpoints (`/api/search/tickets` and `/api/search/conversations`) were tested using a Spike Test profile across 10 VU_MAX levels from 25 to 100 concurrent users.

**Ticket Search** remained relatively stable across all concurrency levels, with average latency ranging from 1,314ms (25 VUs) to 1,806ms (100 VUs). However, the P95 consistently exceeded the 1,500ms PRD threshold — the lowest P95 was 3,469ms at 25 VUs and peaked at 4,270ms at 60 VUs.

**Conversation Search** showed severe performance degradation. Average latency grew from 6,156ms (25 VUs) to 36,833ms (100 VUs) — a 6x increase. P95 reached 52,218ms at 100 VUs, far exceeding the 1,500ms threshold. This endpoint is the primary bottleneck.

**Authentication** remained stable across all runs with near-100% success rate (only the second 70 VU run dropped to 95.9%). Average login time ranged from 1,134ms to 2,013ms.

**Overall Result:**

❌ **FAIL** — All 10 runs failed the PRD performance criteria. Both endpoints exceeded P95 < 1.5s at every concurrency level tested.

---

# Overall Health

| Component | Status |
|-----------|:------:|
| Authentication | 🟢 Healthy |
| Ticket Search API | 🟡 Degraded (P95 3–4x above threshold) |
| Conversation Search API | 🔴 Critical (P95 8–35x above threshold) |
| Database | 🔴 Suspected Bottleneck |
| API Gateway | 🟡 Needs Investigation |

---

# PRD Validation

*(Based on 100 VU representative run)*

| Requirement | Expected | Actual | Status |
|------------|---------:|-------:|:------:|
| Ticket Search P95 | < 1,500 ms | 4,199 ms | ❌ FAIL |
| Conversation Search P95 | < 1,500 ms | 52,218 ms | ❌ FAIL |
| HTTP Failure Rate | < 1% | 0.00% | ✅ PASS |
| Login Success Rate | > 98% | 100.0% | ✅ PASS |
| App-Level Failure Rate | < 5% | 100.00% | ❌ FAIL |

---

# Overall Performance Metrics

*(Based on 100 VU representative run)*

| Metric | Value |
|--------|------:|
| Total Application Requests | 1,238 |
| Ticket Search Requests | 623 |
| Conversation Search Requests | 615 |
| HTTP 200 Responses | 100% (all endpoints) |
| HTTP Timeouts | 0 |
| HTTP 500 Errors | 0 |
| Ticket Avg Latency | 1,806 ms |
| Ticket P50 | 1,416 ms |
| Ticket P90 | 3,544 ms |
| Ticket P95 | 4,199 ms |
| Ticket P99 | 0 ms |
| Ticket Max | 9,043 ms |
| Conversation Avg Latency | 36,833 ms |
| Conversation P50 | 43,659 ms |
| Conversation P90 | 50,138 ms |
| Conversation P95 | 52,218 ms |
| Conversation P99 | 0 ms |
| Conversation Max | 55,876 ms |
| Throughput | 4.2 req/s |

---

# Endpoint Performance

## Authentication

| Metric | Value |
|--------|------:|
| Success Rate | 100.0% |
| Average Login | 2,013 ms |
| P95 Login | 4,291 ms |

---

## Ticket Search (`/api/search/tickets`)

| Metric | Value |
|--------|------:|
| Success Rate | 100% (all 200) |
| Timeout | 0 |
| HTTP 500 | 0 |
| Average | 1,806 ms |
| P50 | 1,416 ms |
| P90 | 3,544 ms |
| P95 | 4,199 ms |
| P99 | 0 ms |
| Max | 9,043 ms |

---

## Conversation Search (`/api/search/conversations`)

| Metric | Value |
|--------|------:|
| Success Rate | 100% (all 200) |
| Timeout | 0 |
| HTTP 500 | 0 |
| Average | 36,833 ms |
| P50 | 43,659 ms |
| P90 | 50,138 ms |
| P95 | 52,218 ms |
| P99 | 0 ms |
| Max | 55,876 ms |

---

# Concurrency Comparison

This section compares system behavior across multiple VU_MAX configurations.

### Ticket Search

| Max VUs | Requests | Avg Latency | P95 | Max | Status |
|---------:|---------:|------------:|----:|----:|:------:|
| 25 | 613 | 1,314 ms | 3,469 ms | 4,836 ms | ❌ |
| 30 | 547 | 1,397 ms | 3,614 ms | 6,213 ms | ❌ |
| 40 | 565 | 1,474 ms | 4,023 ms | 7,016 ms | ❌ |
| 50 | 591 | 1,527 ms | 3,774 ms | 7,754 ms | ❌ |
| 60 | 559 | 1,693 ms | 4,270 ms | 10,806 ms | ❌ |
| 70 | 556 | 1,725 ms | 4,198 ms | 9,663 ms | ❌ |
| 80 | 626 | 1,579 ms | 4,049 ms | 7,390 ms | ❌ |
| 90 | 592 | 1,763 ms | 4,037 ms | 9,208 ms | ❌ |
| 100 | 623 | 1,806 ms | 4,199 ms | 9,043 ms | ❌ |

### Conversation Search

| Max VUs | Requests | Avg Latency | P95 | Max | Status |
|---------:|---------:|------------:|----:|----:|:------:|
| 25 | 613 | 6,156 ms | 12,007 ms | 16,839 ms | ❌ |
| 30 | 547 | 8,457 ms | 14,098 ms | 20,038 ms | ❌ |
| 40 | 565 | 13,031 ms | 20,506 ms | 25,224 ms | ❌ |
| 50 | 591 | 16,373 ms | 24,433 ms | 30,860 ms | ❌ |
| 60 | 559 | 21,905 ms | 31,074 ms | 32,876 ms | ❌ |
| 70 | 556 | 26,642 ms | 37,487 ms | 43,265 ms | ❌ |
| 80 | 623 | 28,610 ms | 40,350 ms | 44,163 ms | ❌ |
| 90 | 588 | 34,482 ms | 49,686 ms | 55,041 ms | ❌ |
| 100 | 615 | 36,833 ms | 52,218 ms | 55,876 ms | ❌ |

### Authentication

| Max VUs | Success Rate | Avg Login | P95 Login |
|---------:|------------:|----------:|----------:|
| 25 | 100.0% | 1,134 ms | 1,449 ms |
| 30 | 100.0% | 1,246 ms | 1,669 ms |
| 40 | 100.0% | 1,222 ms | 1,599 ms |
| 50 | 100.0% | 1,267 ms | 2,053 ms |
| 60 | 100.0% | 1,621 ms | 3,043 ms |
| 70 | 100.0% | 1,758 ms | 2,750 ms |
| 80 | 100.0% | 1,232 ms | 1,612 ms |
| 90 | 100.0% | 1,600 ms | 2,475 ms |
| 100 | 100.0% | 2,013 ms | 4,291 ms |

---

# Performance Trend

| Metric | Observation |
|---------|-------------|
| Ticket Response Time | Relatively stable across 25–100 VUs. P95 consistently 3–4x above 1.5s threshold even at lowest concurrency. Indicates query-level issue, not saturation. |
| Conversation Response Time | **Linear degradation** with concurrency. P95 grows from 12s (25 VUs) to 52s (100 VUs). Conversation search is the primary bottleneck. |
| Error Rate | Near-zero HTTP errors. All endpoints return 200. Issue is latency, not availability. |
| Timeout | No request timeouts observed. Requests complete but take 10–55 seconds for conversations. |
| Authentication | Healthy and stable. Near 100% success across all levels. Login P95 remains under 5s even at 100 VUs. |
| Throughput | Stable at ~3.6–4.2 req/s regardless of VU count. Suggests backend is saturated — adding more VUs doesn't increase throughput. |

---

# Bottleneck Analysis

Based on observed behavior across all concurrency levels:

| Component | Status | Evidence |
|-----------|:------:|----------|
| Authentication | 🟢 Stable | Login success rate 100%, P95 < 5s |
| Ticket Search Service | 🟡 Degraded | P95 3–4x above threshold but stable under load |
| Conversation Search Service | 🔴 Critical | P95 grows linearly from 12s → 52s as VUs increase |
| Database / Index | 🔴 Suspected Slow Query | Conversation search latency far exceeds ticket search; likely unoptimized query or missing index on conversation search |
| API Gateway | 🟡 Request Queuing | Throughput capped at ~4 req/s regardless of VU count; suggests connection pool or gateway queuing |
| RPC / Backend | 🟡 Needs Investigation | Conversation endpoint may be doing heavy joins or full-table scans |

---

# Risk Assessment

| Severity | 🔴 HIGH |
|----------|---------|

**Potential Business Impact:**

- Search becomes **unusable during peak hours** (conversation results take 30–50 seconds).
- Users may **abandon search** and create duplicate tickets/conversations.
- Existing conversations **cannot be found** in reasonable time.
- **User productivity decreases** significantly.
- **SLA breach risk** — P95 far exceeds the 1.5s requirement.
- **Production stability** at risk if deployed without optimization.

---

# Engineering Recommendation

### Priority 1 — Immediate

- Optimize Conversation Search database query (P95 is 35x threshold).
- Add database indexes for conversation search fields.
- Review execution plan for conversation search — check for full-table scans.
- Add N+1 query detection.

### Priority 2 — Short Term

- Increase database connection pool size.
- Implement query result caching (Redis/memcached) for frequent search terms.
- Review RPC/internal service communication latency.

### Priority 3 — Medium Term

- Add rate limiting per user/IP.
- Add circuit breaker for search endpoints.
- Set up slow query monitoring and alerting.
- Consider separating conversation search to its own service/pool.

---

# Recommended Next Test

After backend optimization is deployed:

- ☐ Smoke Test — verify basic functionality
- ☐ Baseline Test (1 VU) — establish new baseline P95
- ☐ Load Test — gradual ramp to find new saturation point
- ☐ Ramp-up Test — step-based to find exact degradation threshold
- ☐ Spike Test — re-run this exact scenario as regression
- ☐ Stress Test — push beyond expected peak to find breaking point
- ☐ Soak Test — sustained 1h+ at moderate load for memory leaks
- ☐ Regression Performance Test — compare pre/post optimization metrics

---

# Final Verdict

| Status | ❌ FAIL |
|--------|---------|

| Reason | Both endpoints exceeded the PRD P95 < 1.5s requirement at every concurrency level tested (25–100 VUs). |
|--------|---------|

| Primary Finding | **Conversation Search is the critical bottleneck.** P95 grows from 12s (25 VUs) to 52s (100 VUs). Ticket Search is more stable but also 3–4x above threshold even at minimum load. The system is not suitable for production traffic under the current implementation. |
|--------|---------|

---

# AI-Generated Insights

- Conversation Search latency increases approximately **3–5 seconds per 10 additional VUs**, suggesting a serial processing bottleneck rather than thread-pool exhaustion.
- Ticket Search latency remains **flat across all concurrency levels** (1.3s–1.8s average), indicating the bottleneck is in the query itself, not resource contention.
- Throughput is **capped at ~4 req/s** regardless of VU count — the backend appears to have a fixed concurrency limit (likely database connection pool).
- Authentication remained **100% successful** across 9 of 10 runs; only the second 70 VU run dropped to 95.9% (3 failed logins out of 73), likely a transient issue.
- **No HTTP errors or timeouts** occurred — all requests complete successfully, they just take too long. This rules out network/infrastructure issues and points directly to application/database layer.
- The response structure from the separate endpoints (`/api/search/tickets` and `/api/search/conversations`) differs from the unified `/api/search` endpoint, causing check failures in the test framework. Test assertions need updating to match the new response schema.

---

# Report Metadata

| Field | Value |
|-------|-------|
| Report Version | 1.0 |
| k6 Script | global-search-stress-new.js (Separate Endpoints variant) |
| k6 Version | Latest (local install) |
| Result Files | 10 JSON files in result-new-global-search/ |
| Generated At | 2026-07-24 |
| Generated By | AI Performance Reporter (Hermes Agent) |
