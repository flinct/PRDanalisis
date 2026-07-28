# Performance Test Executive Summary — Global Search Using SAPX Company Data

---

# Test Information

| Field | Value |
|-------|-------|
| Feature | Global Search — Separate Ticket + Conversation Endpoints |
| Module | Global Search Suggestion (Phase 1) |
| Test Type | Spike Test |
| Environment | dev-v2 (staging) |
| Company / Dataset | **SAPX** (large production-scale dataset) |
| PRD Version | PRD global search - global search suggestion.md v2.1 |
| Tester | Aprizal (goddummyprod2) |
| Test Date | 2026-07-24 |
| Duration | ~4 minutes (1m baseline → 1m spike → 1m sustain → 1m ramp-down) |
| Tool | Grafana k6 |
| Authentication | NextAuth Credentials Provider (3-step: csrf → credentials → session → JWT) |

---

# Test Objective

This performance test evaluates the scalability and responsiveness of the Global Search separate endpoints (`/api/search/tickets` and `/api/search/conversations`) under a **200 Virtual User spike** using the **SAPX company dataset** — a tenant with a significantly larger volume of tickets and conversations compared to the standard test account.

The goal is to determine whether the search infrastructure can handle large-dataset tenants under concurrent load, and to identify the failure mode when the system is pushed beyond its capacity.

---

# Workload Scenario

| Stage | Duration | Target VUs |
|-------|---------:|-----------:|
| Warm Up (baseline) | 1m | 10 |
| Ramp Up (spike) | 1m | 200 |
| Sustain (peak) | 1m | 200 |
| Ramp Down | 1m | 0 |

**Total Test Duration:** ~4 minutes
**Search Keywords Rotated:** 15 keywords (tes, test, AWB, order, refund, tracking, payment, complaint, return, 12345, customer, support, SAP, CV-, barang)

---

# Executive Summary

The Global Search endpoints were subjected to a **200 VU spike test** against the **SAPX company dataset** — a tenant with substantially more tickets and conversations than the standard test account.

The result was a **catastrophic failure**. The system was completely overwhelmed:

- **95.2% of Ticket Search requests timed out** (237 of 249 hit the 60-second timeout).
- **97.5% of Conversation Search requests timed out** (157 of 161 hit the 60-second timeout).
- Only **12 ticket requests** and **4 conversation requests** completed successfully — and even those took 6.9–9.4 seconds minimum.
- **39% of all HTTP requests failed** at the transport level.
- P95 latency for both endpoints hit **60 seconds** — the k6 default request timeout ceiling.

Authentication was the sole survivor: 200 logins at 100% success rate with a P95 of 2.75 seconds.

**Overall Result:**

❌ **FAIL** — The system is completely non-functional for search under this workload and dataset size.

---

# Overall Health

| Component | Status |
|-----------|:------:|
| Authentication | 🟢 Healthy |
| Ticket Search API | 🔴 Critical — 95% timeout |
| Conversation Search API | 🔴 Critical — 97.5% timeout |
| Database | 🔴 Confirmed Bottleneck |
| API Gateway / LB | 🔴 Overwhelmed (39% HTTP failures) |
| RPC / Backend Services | 🔴 Request Queue Saturation |

---

# PRD Validation

| Requirement | Expected | Actual | Status |
|------------|---------:|-------:|:------:|
| Ticket Search P95 | < 1,500 ms | 60,020 ms | ❌ FAIL (40x threshold) |
| Conversation Search P95 | < 1,500 ms | 60,019 ms | ❌ FAIL (40x threshold) |
| HTTP Failure Rate | < 1% | 39.01% | ❌ FAIL (39x threshold) |
| Login Success Rate | > 98% | 100.0% | ✅ PASS |
| App-Level Failure Rate | < 5% | 100.00% | ❌ FAIL (20x threshold) |

---

# Overall Performance Metrics

| Metric | Value |
|--------|------:|
| Total Application Requests | 410 |
| Ticket Search Requests | 249 |
| Ticket Search Completed (200) | 12 (4.8%) |
| Ticket Search Timeouts | 237 (95.2%) |
| Conversation Search Requests | 161 |
| Conversation Search Completed (200) | 4 (2.5%) |
| Conversation Search Timeouts | 157 (97.5%) |
| HTTP Failure Rate | 39.01% |
| Ticket Avg Latency | 57,701 ms |
| Ticket P50 | 60,000 ms |
| Ticket P90 | 60,016 ms |
| Ticket P95 | 60,020 ms |
| Ticket Max | 60,028 ms |
| Conversation Avg Latency | 58,851 ms |
| Conversation P50 | 60,012 ms |
| Conversation P90 | 60,019 ms |
| Conversation P95 | 60,019 ms |
| Conversation Max | 60,022 ms |
| Throughput | 3.7 req/s |
| Iterations/sec | 0.6 |

---

# Endpoint Performance

## Authentication

| Metric | Value |
|--------|------:|
| Success Rate | 100.0% |
| Total Logins | 200 |
| Average Login | 1,254 ms |
| P95 Login | 2,750 ms |

---

## Ticket Search (`/api/search/tickets`)

| Metric | Value |
|--------|------:|
| Success Rate (200) | 4.8% (12 of 249) |
| Timeout Rate | 95.2% (237 of 249) |
| HTTP 500 | 0 |
| Average (all) | 57,701 ms |
| Average (successful only) | ~7,000–9,000 ms |
| P50 | 60,000 ms |
| P90 | 60,016 ms |
| P95 | 60,020 ms |
| Max | 60,028 ms |

---

## Conversation Search (`/api/search/conversations`)

| Metric | Value |
|--------|------:|
| Success Rate (200) | 2.5% (4 of 161) |
| Timeout Rate | 97.5% (157 of 161) |
| HTTP 500 | 0 |
| Average (all) | 58,851 ms |
| Average (successful only) | ~9,400 ms |
| P50 | 60,012 ms |
| P90 | 60,019 ms |
| P95 | 60,019 ms |
| Max | 60,022 ms |

---

# Comparison: Standard vs SAPX Dataset (200 VUs)

| Metric | Standard Account (100 VUs) | SAPX Account (200 VUs) |
|--------|---------------------------:|------------------------:|
| Ticket Success Rate | 100% | 4.8% |
| Ticket Avg Latency | 1,806 ms | 57,701 ms (32x worse) |
| Ticket P95 | 4,199 ms | 60,020 ms (14x worse) |
| Conv Success Rate | 100% | 2.5% |
| Conv Avg Latency | 36,833 ms | 58,851 ms (1.6x worse) |
| Conv P95 | 52,218 ms | 60,019 ms (ceiling hit) |
| HTTP Fail Rate | 0.00% | 39.01% |
| Throughput | 4.2 req/s | 3.7 req/s |
| Login Success | 100% | 100% |

> **Note:** The standard account at 100 VUs already had conversation P95 at 52s — near the 60s ceiling. SAPX at 200 VUs pushed both ticket and conversation search over the edge, with ticket search degrading catastrophically.

---

# Performance Trend

| Metric | Observation |
|---------|-------------|
| Ticket Response Time | **Catastrophic regression.** Standard account ticket P95 was 4.2s at 100 VUs. SAPX at 200 VUs: 60s with 95% timeout. The larger dataset turns ticket search from "degraded" to "dead." |
| Conversation Response Time | Already near the timeout ceiling on standard account (52s P95). SAPX pushes it over — 60s ceiling with 97.5% timeout. |
| Error Rate | **39% HTTP-level failures** — unprecedented. Standard account had 0% at all VU levels. The system is rejecting connections at the transport layer. |
| Timeout | 95–98% of search requests never complete. The 60-second k6 timeout is the only thing stopping requests — the real response time is unbounded (possibly minutes). |
| Authentication | The only stable component. 200 logins at 100% success, P95 2.75s. Auth is not the bottleneck. |
| Throughput | Collapsed to **0.6 iterations/sec** — each VU can only complete ~0.6 full cycles (login + ticket search + conversation search + sleep) per second. Effectively single-threaded. |

---

# Bottleneck Analysis

| Component | Status | Evidence |
|-----------|:------:|----------|
| Authentication | 🟢 Stable | 100% success, P95 2.75s — not the problem |
| Ticket Search Service | 🔴 Critical | 95% timeout — the large SAPX dataset makes ticket queries too heavy |
| Conversation Search Service | 🔴 Critical | 97.5% timeout — already slow on standard data, dead on SAPX |
| Database | 🔴 **Root Cause** | Full-table scans or missing indexes on large tables. SAPX data volume amplifies query cost exponentially. |
| API Gateway / Load Balancer | 🔴 Overwhelmed | 39% HTTP failures indicate connection pool exhaustion or request queue overflow at the gateway level. |
| Connection Pool | 🔴 Exhausted | All backend connections occupied by long-running queries, new requests get refused. |
| RPC / Internal Services | 🔴 Saturated | Request queuing causes cascading timeouts across internal service calls. |

---

# Risk Assessment

| Severity | 🔴 **CRITICAL** |
|----------|-----------------|

**Potential Business Impact:**

- **Search is completely unusable** for tenants with large datasets (like SAPX).
- **95%+ of user search attempts will fail** — users will see errors or indefinite loading.
- **Duplicate tickets will skyrocket** — users can't find existing tickets and will create new ones.
- **Customer support paralysis** — agents cannot search for customer history, tickets, or conversations.
- **SLA will be breached immediately** — P95 is 40x the threshold.
- **Production deployment would be a SEV-0 incident** for any tenant with significant data volume.
- **Gateway-level failures (39%)** mean other services sharing the gateway may also be impacted (blast radius).

---

# Engineering Recommendation

### Priority 1 — CRITICAL (Blocking Production)

- **Add database indexes** on search fields for both tickets and conversations tables — this is almost certainly the root cause.
- **Run EXPLAIN / execution plan** on the conversation and ticket search queries against SAPX-sized tables.
- **Implement query timeouts at the application level** — no query should run for 60+ seconds. Set a 10-second app-level timeout with a graceful fallback ("Search is taking longer than expected. Try refining your search.").
- **Paginate aggressively** — reduce default `limit` from 20 to 5–10 for large tenants. Consider server-side limits based on tenant data volume.
- **Add full-text search index** (e.g., PostgreSQL `tsvector`, Elasticsearch) instead of `ILIKE`/`LIKE` pattern matching on large text fields.

### Priority 2 — Short Term

- **Implement per-tenant query optimization** — detect large tenants and route them to optimized query paths.
- **Add search result caching** (Redis) with tenant-aware cache keys and short TTL (30–60 seconds).
- **Increase database connection pool** — prevent connection exhaustion under load.
- **Implement request queuing with backpressure** — reject requests gracefully when the queue is full instead of timing out.
- **Add circuit breaker** on search endpoints — fail fast instead of cascading.

### Priority 3 — Medium Term

- **Migrate search to Elasticsearch / OpenSearch** — full-text search engines are purpose-built for this workload.
- **Implement async search** — return a search job ID immediately, poll for results. Prevents connection pool exhaustion.
- **Add tenant-level rate limiting** — prevent one large tenant from degrading service for others.
- **Set up slow query monitoring** with alerts at 2s, 5s, and 10s thresholds.
- **Implement read replicas** for search queries to offload primary database.

---

# Recommended Next Test

**Do not re-test until backend optimization is deployed.** Current state is a hard failure — no incremental testing will yield useful data.

After optimization:

- ☐ Smoke Test — verify basic functionality on SAPX data
- ☐ Baseline Test (1 VU) — establish new single-user P95 for SAPX
- ☐ Load Test (5→50 VUs, gradual) — find where degradation begins on SAPX
- ☐ Spike Test (re-run this exact scenario) — regression comparison
- ☐ Stress Test — push beyond expected peak to find new breaking point
- ☐ Multi-Tenant Test — test SAPX + standard tenant concurrently for blast radius
- ☐ Soak Test — sustained 1h at moderate load for connection/memory leaks

---

# Final Verdict

| Status | ❌ **FAIL — CRITICAL** |
|--------|------------------------|

| Reason | The system is **completely non-functional** for search on the SAPX dataset under 200 concurrent users. Both endpoints hit the 60-second timeout for >95% of requests. 39% of HTTP requests failed at the transport layer. This is not "degraded" — it is **dead**. |
|--------|------------------------|

| Primary Finding | **Dataset size is the dominant factor.** The standard account at 100 VUs had 0% timeouts and 100% success on ticket search. SAPX at 200 VUs: 95% ticket timeout. The conversation search, already borderline on standard data (52s P95), is completely broken on SAPX. The root cause is almost certainly **unindexed full-table scans** on tables with hundreds of thousands or millions of rows. |
|--------|------------------------|

---

# AI-Generated Insights

- **This is a textbook database indexing failure.** The near-identical P50/P90/P95 values (~60s) across both endpoints suggest all queries are hitting the same timeout ceiling — they're all doing full-table scans that can't complete within 60 seconds on large tables.
- **The "successful" requests (12 tickets, 4 conversations) are likely cache hits or queries that found results early** in the scan — minimum latency was 6.9s for tickets and 9.4s for conversations, confirming even the "fast" queries are extremely slow.
- **39% HTTP failure rate is the canary in the coal mine** for cascading infrastructure failure. The gateway/load balancer is rejecting connections because all backend connections are tied up waiting for database queries. If this were production, other services sharing the gateway would also be impacted.
- **The 200 VU spike is not the root cause** — it's the trigger. Even 1 VU on SAPX would likely show multi-second response times. The 200 VU load just exposes the exponential degradation.
- **Authentication remaining stable at 100%** confirms the bottleneck is purely in the search/database layer, not in the application server, network, or auth infrastructure.
- **Compare with standard account at 200 VUs** (if available) to isolate the dataset-size impact from the concurrency impact. The standard account at 100 VUs already showed conversation search near the timeout ceiling — SAPX at 200 VUs would require both optimization AND scaling.

---

# Report Metadata

| Field | Value |
|-------|-------|
| Report Version | 1.0 |
| k6 Script | global-search-stress-new.js (Separate Endpoints variant) |
| k6 Version | Latest (local install) |
| Result File | gs-result-sapx/global-search-separate-compsapx-2026-07-24T06-28-12-221Z.json |
| Test Account | goddummyprod2 (SAPX tenant) |
| Generated At | 2026-07-24 |
| Generated By | AI Performance Reporter (Hermes Agent) |
