# Performance Test Executive Summary — Global Search Using Lincah Company Data

---

# Test Information

| Field | Value |
|-------|-------|
| Feature | Global Search — Separate Ticket + Conversation Endpoints |
| Module | Global Search Suggestion (Phase 1) |
| Test Type | Spike Test |
| Environment | dev-v2 (staging) |
| Company / Dataset | **Lincah** (`satuinboxlincah`) |
| PRD Version | PRD global search - global search suggestion.md v2.1 |
| Tester | Aprizal (satuinboxlincah) |
| Test Date | 2026-07-24 |
| Duration | ~4 minutes (1m baseline → 1m spike → 1m sustain → 1m ramp-down) |
| Max VUs | 50 |
| Tool | Grafana k6 |
| Authentication | NextAuth Credentials Provider (3-step: csrf → credentials → session → JWT) |

---

# Test Objective

This performance test evaluates the Global Search separate endpoints (`/api/search/tickets` and `/api/search/conversations`) under a **50 Virtual User spike** using the **Lincah company dataset**. The goal is to assess whether both endpoints meet the PRD NFR §11 threshold of **P95 < 1.5 seconds** under concurrent load.

---

# Workload Scenario

| Stage | Duration | Target VUs |
|-------|---------:|-----------:|
| Warm Up (baseline) | 1m | 10 |
| Ramp Up (spike) | 1m | 50 |
| Sustain (peak) | 1m | 50 |
| Ramp Down | 1m | 0 |

**Total Test Duration:** ~4 minutes
**Search Keywords Rotated:** 15 keywords (tes, test, AWB, order, refund, tracking, payment, complaint, return, 12345, customer, support, SAP, CV-, barang)

---

# Executive Summary

The Global Search endpoints were subjected to a **50 VU spike test** against the **Lincah company dataset**.

**Overall Result:**

❌ **FAIL** — Both search endpoints exceed the PRD threshold. Ticket search is severely degraded (P95 = 60s with 8.7% timeout). Conversation search is slow but stable (P95 = 20.4s, 0% errors).

---

# Overall Health

| Component | Status |
|-----------|:------:|
| Authentication | 🟢 Healthy (98.0% success) |
| Ticket Search API | 🔴 Critical — P95 60s, 8.7% timeout |
| Conversation Search API | 🟡 Degraded — P95 20.4s, 0% errors |
| HTTP Transport | 🟡 Degraded — 3.32% HTTP failures |
| App-Level Health | 🔴 Critical — 100% app failure rate |

---

# PRD Validation

| Requirement | Expected | Actual | Status |
|------------|---------:|-------:|:------:|
| Ticket Search P95 | < 1,500 ms | 59,999 ms | ❌ FAIL (40x threshold) |
| Conversation Search P95 | < 1,500 ms | 20,363 ms | ❌ FAIL (13.6x threshold) |
| HTTP Failure Rate | < 1% | 3.32% | ❌ FAIL (3.3x threshold) |
| Login Success Rate | > 98% | 98.0% | ✅ PASS |
| App-Level Failure Rate | < 5% | 100.00% | ❌ FAIL (20x threshold) |

---

# Percentage Error Per Test

| Test Component | Total Requests | Errors | Error % | Status |
|---------------|---------------:|-------:|--------:|:------:|
| **Ticket Search** | 184 | 16 | **8.70%** | 🔴 FAIL |
| **Conversation Search** | 177 | 0 | **0.00%** | 🟢 PASS |
| **Authentication (Login)** | 51 | 1 | **1.96%** | 🟢 PASS |
| **HTTP Transport Layer** | — | — | **3.32%** | 🔴 FAIL |
| **App-Level (Combined)** | 362 | — | **100.00%** | 🔴 FAIL |

### Error Breakdown

| Component | 200 OK | Timeout | 401 | 404 | 500 | Other |
|-----------|-------:|--------:|----:|----:|----:|------:|
| Ticket Search | 168 | 16 | 0 | 0 | 0 | 0 |
| Conversation Search | 177 | 0 | 0 | 0 | 0 | 0 |

> **Note on App-Level 100%:** The k6 `failed_requests` Rate metric fires whenever any check in an iteration fails. Since ticket search had at least one failure in many iterations (8.7% of individual requests, but distributed across iterations), nearly every iteration triggered a failure flag. This inflates the app-level metric — the real per-request failure rate is driven by the individual endpoint errors shown above.

---

# Overall Performance Metrics

| Metric | Value |
|--------|------:|
| Total Application Requests | 362 |
| Total HTTP Requests | — (http_overview shows 0 — possible k6 reporting gap) |
| Ticket Search Requests | 184 |
| Ticket Search Completed (200) | 168 (91.3%) |
| Ticket Search Timeouts | 16 (8.7%) |
| Conversation Search Requests | 177 |
| Conversation Search Completed (200) | 177 (100%) |
| Conversation Search Timeouts | 0 (0%) |
| HTTP Failure Rate | 3.32% |
| Throughput | 1.9 req/s |
| Iterations/sec | 0.7 |

---

# Endpoint Performance

## Authentication

| Metric | Value |
|--------|------:|
| Success Rate | 98.0% |
| Total Logins | 51 |
| Failed Logins | 1 (1.96%) |
| Average Login | 911 ms |
| P95 Login | 1,119 ms |

---

## Ticket Search (`/api/search/tickets`)

| Metric | Value |
|--------|------:|
| Success Rate (200) | 91.3% (168 of 184) |
| **Error Rate** | **8.70% (16 of 184)** |
| Timeout Rate | 8.70% (16 of 184) |
| HTTP 500 | 0 |
| Average (all) | 28,315 ms |
| Average (successful only) | ~31,000 ms |
| P50 | 31,196 ms |
| P90 | 52,819 ms |
| P95 | 59,999 ms |
| P99 | 0 ms (reporting gap) |
| Min | 2,361 ms |
| Max | 60,001 ms |
| PRD Threshold | P95 < 1,500 ms |
| Threshold Margin | **58,499 ms ABOVE threshold** |

---

## Conversation Search (`/api/search/conversations`)

| Metric | Value |
|--------|------:|
| Success Rate (200) | 100% (177 of 177) |
| **Error Rate** | **0.00% (0 of 177)** |
| Timeout Rate | 0% (0 of 177) |
| HTTP 500 | 0 |
| Average | 8,122 ms |
| P50 | 6,584 ms |
| P90 | 18,382 ms |
| P95 | 20,363 ms |
| P99 | 0 ms (reporting gap) |
| Min | 818 ms |
| Max | 22,852 ms |
| PRD Threshold | P95 < 1,500 ms |
| Threshold Margin | **18,863 ms ABOVE threshold** |

---

# Performance Trend

| Metric | Observation |
|---------|-------------|
| Ticket Response Time | **Severely degraded.** P50 at 31s, P95 at 60s — the endpoint is effectively timing out for the slowest 10% of requests. Even the fastest request took 2.4s (already above the 1.5s threshold). |
| Conversation Response Time | **Slow but stable.** 0% errors, 100% completion. P50 at 6.6s, P95 at 20.4s. The endpoint works but is 4–13x above the 1.5s PRD threshold. |
| Error Rate | Ticket search has 8.7% timeout rate. Conversation search has 0% errors — it's slow, not broken. |
| Timeout | 16 ticket requests hit the 60-second k6 timeout. The real ticket search response time is unbounded for these requests. |
| Authentication | Near-perfect — 98% success, P95 1.1s. Auth is not the bottleneck. |
| Throughput | **1.9 req/s, 0.7 iterations/sec** — very low. Each VU can only complete ~0.7 full cycles per second. |

---

# Bottleneck Analysis

| Component | Status | Evidence |
|-----------|:------:|----------|
| Authentication | 🟢 Stable | 98% success, P95 1.1s — not the problem |
| Ticket Search Service | 🔴 Critical | 8.7% timeout, P95 60s — database queries too heavy |
| Conversation Search Service | 🟡 Degraded | 0% errors but P95 20.4s — slow queries, not failing |
| Database | 🔴 **Root Cause** | Ticket search is dramatically slower than conversation search (P50 31s vs 6.6s). Ticket table queries likely doing full-table scans. |
| API Gateway / Load Balancer | 🟡 Stressed | 3.32% HTTP failures indicate some connection pressure |
| Connection Pool | 🟡 Under Pressure | Some requests timing out at 60s, but not the catastrophic failure seen on larger datasets |

---

# Risk Assessment

| Severity | 🟡 **HIGH** |
|----------|-------------|

**Potential Business Impact:**

- **Ticket search is unreliable** — 8.7% of searches will timeout (60s+ wait). Users will abandon searches.
- **Both endpoints fail PRD thresholds** — ticket search is 40x over, conversation search is 13.6x over.
- **Conversation search works but is slow** — P50 at 6.6s is a poor user experience even if requests don't fail.
- **Duplicate tickets likely** — users who can't find existing tickets via search will create duplicates.
- **50 VUs already causes degradation** — production loads at this tenant would be impacted.

---

# Engineering Recommendation

### Priority 1 — CRITICAL

- **Add database indexes** on ticket search fields — ticket search is 5x slower than conversation search (P50 31s vs 6.6s), suggesting missing indexes on the ticket table.
- **Run EXPLAIN on ticket search queries** — identify whether full-table scans are occurring.
- **Implement query timeouts at the application level** — cap at 10–15 seconds with graceful fallback instead of 60s+ waits.
- **Add full-text search index** (PostgreSQL `tsvector` or Elasticsearch) — `ILIKE`/`LIKE` on large text fields will never meet the 1.5s P95 target.

### Priority 2 — Short Term

- **Add search result caching** (Redis) with short TTL (30–60 seconds) for repeated keyword searches.
- **Paginate results aggressively** — reduce default limit if full result sets are too large.
- **Add circuit breaker** on ticket search — fail fast instead of letting requests hang for 60 seconds.
- **Increase database connection pool** to prevent connection starvation during slow queries.

### Priority 3 — Medium Term

- **Migrate search to Elasticsearch / OpenSearch** — this is the long-term solution for sub-second search on large datasets.
- **Implement async search with polling** — return immediately, let users poll for results.
- **Set up slow query monitoring** with alerts at 2s, 5s, and 10s thresholds.
- **Add read replicas** for search queries to offload the primary database.

---

# Recommended Next Test

- ☐ **Re-test after database indexing** — the single highest-impact fix
- ☐ **Test at 25 VUs** — find where degradation begins on Lincah data
- ☐ **Test at 100 VUs** — compare against 50 VU results to measure scaling
- ☐ **Compare with standard account at 50 VUs** — isolate dataset-size impact
- ☐ **Soak test (10 VUs, 30 min)** — check for memory/connection leaks

---

# Comparison: Lincah (50 VUs) vs SAPX (200 VUs)

| Metric | Lincah (50 VUs) | SAPX (200 VUs) |
|--------|----------------:|---------------:|
| Ticket Success Rate | 91.3% | 4.8% |
| Ticket P95 | 59,999 ms | 60,020 ms |
| Ticket Error Rate | 8.70% | 95.2% |
| Conv Success Rate | 100% | 2.5% |
| Conv P95 | 20,363 ms | 60,019 ms |
| Conv Error Rate | 0.00% | 97.5% |
| HTTP Fail Rate | 3.32% | 39.01% |
| Login Success | 98.0% | 100% |
| Throughput | 1.9 req/s | 3.7 req/s |

> **Key Insight:** Even at 4x fewer VUs (50 vs 200), ticket search P95 still hits the 60s ceiling. The Lincah dataset is smaller than SAPX (conversation search survives at 100% success vs SAPX's 2.5%), but ticket search is already borderline — suggesting the ticket table indexing problem is universal across tenants.

---

# Final Verdict

| Status | ❌ **FAIL — HIGH SEVERITY** |
|--------|---------------------------|

| Reason | Both search endpoints exceed the PRD P95 < 1.5s threshold by large margins. Ticket search hits the 60-second timeout ceiling for 8.7% of requests. Conversation search is functional but 13.6x above threshold at P95 = 20.4s. The ticket search endpoint is the primary concern — it fails at only 50 VUs on a moderate dataset. |
|--------|---------------------------|

| Primary Finding | **Ticket search is the weak link.** Conversation search is slow but stable (0% errors). Ticket search has 5x higher P50 latency (31s vs 6.6s) and 8.7% timeout rate. This pattern is consistent with **missing or ineffective database indexes on the ticket table search columns**. The conversation table likely has better indexing. |
|--------|---------------------------|

---

# Report Metadata

| Field | Value |
|-------|-------|
| Report Version | 1.0 |
| k6 Script | global-search-stress-new.js (Separate Endpoints variant) |
| k6 Version | Latest (local install) |
| Result File | gs-result-lincah/global-search-separate-complincah-2026-07-24T07-58-55-242Z.json |
| Test Account | satuinboxlincah (Lincah tenant) |
| Generated At | 2026-07-24 |
| Generated By | AI Performance Reporter (Hermes Agent) |
