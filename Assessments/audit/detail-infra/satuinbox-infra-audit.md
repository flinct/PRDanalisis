# SatuInbox — Consolidated Audit Report

> **⚠️ ORPHAN / BELUM DIREKONSILIASI.** Ini audit infra/DevOps independen (4-stream, 69 temuan: Critical 10/High 22/Medium 25/Low 12) yang **TIDAK di-fold ke master register** dan tidak dirujuk di reading-list §1. Temuan uniknya (committed secrets di git, wildcard CORS, API Gateway single-replica SPOF, no alerting, zero FE test coverage) **tidak ada di register** — sebagian time-sensitive (secrets = active risk). Severity scale beda dari register (Critical/High vs Catastrophe/Major). Status: **Track G kandidat** — butuh keputusan fold-vs-historical (lihat reading-list §5). Sampai itu, JANGAN anggap register mencakup temuan file ini.

**Date:** 2026-09-02  
**Auditor:** Hermes Agent (4 parallel audit streams, consolidated)  
**Repos:** omnichannel-satuinbox-be, omnichannel-satuinbox-fe, CI-Satuinbox

---

## Executive Summary

SatuInbox is a **well-architected omnichannel CRM** with 20 microservices (NestJS/Nx), gRPC+mTLS inter-service communication, RabbitMQ async messaging, MongoDB 8.0, and Next.js frontend. The architecture fundamentals are strong: DB-per-domain, good service separation, gRPC proto contracts, Swagger annotations, and solid DevOps documentation.

**The risk is not architectural — it's operational maturity.** The codebase has committed secrets, no alerting, zero real test coverage on FE, stub e2e tests on BE, wildcard CORS, and the API Gateway is a single-replica SPOF. These are fixable, but several are time-sensitive (secrets in git = active risk).

### Severity Distribution

| Severity | Count | Domains |
|----------|-------|---------|
| **Critical** | 10 | Security (3), Architecture (3), Code Quality (1), Docs (3) |
| **High** | 22 | Security (5), Architecture (9), Code Quality (3), Docs (5) |
| **Medium** | 25 | Security (5), Architecture (6), Code Quality (3), Docs (11) |
| **Low** | 12 | Security (3), Architecture (5), Code Quality (3), Docs (1) |
| **Total** | **69** | |

### Overall Scores

| Domain | Score | Notes |
|--------|-------|-------|
| Architecture | 7/10 | Well-structured, good separation. SPOFs are the concern. |
| Security | 4/10 | Committed secrets, CORS wildcard, no network policies. |
| Code Quality | 4/10 | God-objects, 0% FE tests, 10% BE coverage, 1300+ `any` types. |
| Documentation | 5/10 | Great top-level READMEs. Zero per-service docs. |
| Observability | 5/10 | Metrics stack deployed. No alerting. No distributed tracing. |
| Scalability | 6/10 | HPA+VPA+spot mix. WhatsApp stateful limitation. |
| Reliability | 5/10 | PDBs exist. No circuit breakers, no canary deploys. |
| Backup/DR | 5/10 | Strategy documented but unverified. 24h RPO. |

---

## 1. CRITICAL Findings (Do This Week)

### S-1. Committed Secrets in Git
**Domain:** Security  
**Files:** `docker/local/.env` (tracked), `docker/local/atlas-search/conversation-indexes.sh` (hardcoded Mongo password), `docker/dev/docker-compose.yml` (Redash + Mongo passwords)  
**Impact:** Anyone with repo access has DB passwords and API keys.  
**Fix:** `git rm --cached`, rotate ALL exposed credentials, add to `.gitignore`. 30 min.  
**Ref:** t_4544c1c3 C-1, C-2, C-3

### S-2. No Alerting Rules — Blind Production
**Domain:** Observability  
**Detail:** Prometheus collects metrics but zero PrometheusRule CRDs exist. Nobody gets paged.  
**Impact:** Failures go undetected until customers report them.  
**Fix:** Add alertmanager: pod-not-ready >5min, MongoDB RS unhealthy, gRPC error >5%, memory >85%. 1 day.  
**Ref:** t_f652d37d IV-1

### S-3. API Gateway: Single Replica SPOF
**Domain:** Architecture  
**Detail:** Sole HTTP/WebSocket entry point. No HPA configured. VPA only.  
**Impact:** Any gateway pod crash = complete outage for all traffic.  
**Fix:** Add HPA (min 2 replicas). 1 hour.  
**Ref:** t_f652d37d I-1

### S-4. WhatsApp Service: Single Replica SPOF
**Domain:** Architecture  
**Detail:** Stateful Baileys sessions pinned to heavy node group. Cannot scale horizontally.  
**Impact:** Pod crash = all WhatsApp sessions lost. Recovery requires re-authentication.  
**Fix:** Implement session persistence for fast recovery. Long-term: migrate to WA Business API for non-critical accounts.  
**Ref:** t_f652d37d I-2

### S-5. CORS Wildcard Origin
**Domain:** Security  
**Files:** `apps/api-gateway/src/main.ts:70-77` (REST), WebSocket gateways (ticket, notification, conversation)  
**Detail:** If `CORS_ORIGINS` env var unset → `'*'` returned. Also, env var name mismatch (plural vs singular in `.env.example`).  
**Impact:** Any domain can make authenticated cross-origin requests.  
**Fix:** Default to production domain. Fix env var name. 30 min.  
**Ref:** t_4544c1c3 H-3, H-4; t_f652d37d III-1

### S-6. FE: Zero Test Coverage
**Domain:** Code Quality  
**Detail:** 1 test file for 1,777 source files. No test runner configured. No jest/vitest/playwright.  
**Impact:** No safety net for frontend changes. Regressions ship silently.  
**Fix:** Add Vitest, write critical-path tests (auth flow, conversation list). 1-2 days.  
**Ref:** t_865726e9 (top finding)

### S-7. BE E2E Tests Are All Stubs
**Domain:** Documentation / Quality  
**Detail:** 18 e2e test apps exist but all test a non-existent `/api` endpoint. 0% real e2e coverage.  
**Impact:** False confidence in test suite. No integration validation.  
**Fix:** Replace with real integration tests starting with auth-service. 2-3 days.  
**Ref:** t_1e8f8b8c

### S-8. Zero Per-Service Documentation
**Domain:** Documentation  
**Detail:** 0 of 38 services have READMEs. In a 19-microservice architecture, this is onboarding kryptonite.  
**Fix:** Standard template, start with conversation-service. 2-3 days.  
**Ref:** t_1e8f8b8c

### S-9. No CHANGELOG / Release Process
**Domain:** Documentation  
**Detail:** No CHANGELOG.md, no semantic versioning, no release notes process.  
**Fix:** Adopt keepachangelog.com format. Retroactively add from git history. 0.5 day setup.  
**Ref:** t_1e8f8b8c

### S-10. EKS Public Endpoint Enabled
**Domain:** Security (Infrastructure)  
**Detail:** Cluster API is internet-accessible. Private access disabled.  
**Fix:** Enable private access, use VPN/bastion for kubectl. 1 day.  
**Ref:** t_f652d37d III-4

---

## 2. HIGH Findings (Do This Month)

### Security
| ID | Finding | File/Detail | Fix Effort |
|----|---------|-------------|------------|
| H-S1 | No express-mongo-sanitize middleware | Pattern constants defined but unused | 1 hr |
| H-S2 | Unescaped `$regex` with user input (10+ locations) | channel-service, widget, payment-service, ticket-service, etc. | 2-3 hrs |
| H-S3 | Swagger exposed in production without auth | `api-gateway/src/main.ts:153-195` | 15 min |
| H-S4 | SSL redirect disabled | `ssl-redirect: 'false'` in ingress | 5 min |
| H-S5 | MongoDB TLS disabled for client connections | VPC traffic unencrypted | 1 day |

### Architecture
| ID | Finding | Detail | Fix Effort |
|----|---------|--------|------------|
| H-A1 | Email service: single replica, VPA only | IMAP polling is single-threaded per account | Accept limitation |
| H-A2 | Single NAT Gateway | All outbound traffic through one GW | Add redundant NAT |
| H-A3 | No circuit breaker pattern on gRPC | Gateway hangs on downstream failures | 1 day |
| H-A4 | RabbitMQ DLX only on conversation-service | Other services silently drop messages | Audit all queues |
| H-A5 | No NetworkPolicies between services | Any pod → any pod | 1 day |
| H-A6 | Backup CronJob unverified | Strategy documented, deployment unconfirmed | 5 min verify |
| H-A7 | 24h RPO on MongoDB backups | Daily = up to 24h data loss | Add oplog/PITR |

### Code Quality
| ID | Finding | Detail | Fix Effort |
|----|---------|--------|------------|
| H-Q1 | BE 10.1% test coverage | 156 test files for 1,547 source files | Ongoing |
| H-Q2 | 20 god-objects (up to 6,854 lines) | conversation.service.ts = 6,854 lines, 185 try-catches | Incremental refactor |
| H-Q3 | 1,315 `any` types (no-explicit-any disabled) | ESLint rule intentionally disabled | Enable + fix incrementally |

### Documentation
| ID | Finding | Detail | Fix Effort |
|----|---------|--------|------------|
| H-D1 | No CONTRIBUTING.md | Branch naming, commit conventions, PR process undocumented | 0.5 day |
| H-D2 | No error code/response format doc | Standard error shape undocumented | 1 day |
| H-D3 | No onboarding guide | Beyond README setup sections | 1 day |
| H-D4 | audit-service JSDoc at 42% | Lowest coverage of any service | 0.5 day |
| H-D5 | No ADR format | Major architectural decisions undocumented | 1-2 days |

---

## 3. Medium Findings (This Quarter)

| Domain | ID | Finding | Effort |
|--------|-----|---------|--------|
| Security | M-S1 | Helmet default config, security constants unused | 30 min |
| Security | M-S2 | gRPC exception filter leaks internal errors | 1 hr |
| Security | M-S3 | Inconsistent bcrypt rounds (10 vs 12) | 5 min |
| Security | M-S4 | Docker services run as root | 1 hr |
| Security | M-S5 | 10,000 RPS rate limit too high for CRM | Per-endpoint tuning |
| Architecture | M-A1 | Redis cluster mode undocumented | Verify + configure |
| Architecture | M-A2 | RabbitMQ cluster/quorum undocumented | Verify + configure |
| Architecture | M-A3 | RI expires March 2027 (~$270/mo increase) | Budget planning |
| Architecture | M-A4 | Spot node PDBs missing for non-critical services | 1 hr |
| Architecture | M-A5 | PDB channel-service too aggressive (minAvailable: 3) | 5 min |
| Architecture | M-A6 | No canary/blue-green deployment strategy | Evaluate Argo Rollouts |
| Code Quality | M-Q1 | 995 try-catch blocks, no centralized error handling | Incremental |
| Code Quality | M-Q2 | Oversized FE components | Incremental refactor |
| Code Quality | M-Q3 | crypto-js usage (consider Web Crypto API) | Low priority |
| Documentation | M-D1 | FE packages have no READMEs (7 packages) | 0.5 day |
| Documentation | M-D2 | Webhook events undocumented | 1-2 days |
| Documentation | M-D3 | Rate limiting undocumented | 0.5 day |
| Documentation | M-D4 | No incident RCA template | 0.5 day |
| Documentation | M-D5 | No glossary (domain terms) | 0.5 day |
| Documentation | M-D6 | CI-Satuinbox has no README | 0.5 day |
| Documentation | M-D7 | Grafana default credentials in docs | Rotate + remove |

---

## 4. Low Findings

| Domain | Finding |
|--------|---------|
| Security | Redis eval() method accepts arbitrary Lua scripts |
| Security | Extended query parser without size limits |
| Security | mTLS: manual cert generation exists alongside cert-manager |
| Architecture | Node updateConfig.maxUnavailable: 1 (slow MongoDB rolling) |
| Architecture | Spot termination handler webhook URL empty |
| Architecture | Cross-region DR not implemented |
| Architecture | Redis backup strategy missing (acceptable for cache) |
| Architecture | Database schema rollback procedures undocumented |
| Code Quality | console.log pollution in production |
| Code Quality | bcrypt + argon2 coexistence (pick one) |
| Code Quality | Duplicate constants across services |
| Documentation | No glossary, no incident post-mortem template |

---

## 5. Priority Roadmap

### Week 1 — Stop the Bleeding
1. **Rotate exposed credentials** and remove secrets from git (S-1)
2. **Fix CORS** to production domain only (S-5)
3. **Enable SSL redirect** on ingress (H-S4)
4. **Verify MongoDB backup CronJob** is running (H-A6)
5. **Add basic Prometheus alerting** — pod-not-ready, MongoDB RS, gRPC errors (S-2)
6. **Scale API Gateway** to min 2 replicas (S-3)

### Month 1 — Harden
7. Add NetworkPolicies (default-deny) (H-A5)
8. Add application health endpoints (/healthz, /readyz) to all services
9. Enable MongoDB TLS for client connections (H-S5)
10. Add gRPC circuit breakers + timeouts (H-A3)
11. Audit RabbitMQ queues for missing DLX (H-A4)
12. Apply escapeRegex() to all $regex with user input (H-S2)
13. Add express-mongo-sanitize middleware (H-S1)
14. Gate Swagger behind NODE_ENV check (H-S3)
15. Add FE test runner + critical-path tests (S-6)
16. Replace BE e2e stubs with real integration tests (S-7)
17. Write CONTRIBUTING.md (H-D1)
18. Enable EKS private access (S-10)

### Quarter 1 — Mature
19. Implement distributed tracing (OpenTelemetry + Jaeger/Tempo)
20. Add per-service READMEs (S-8)
21. Adopt CHANGELOG format (S-9)
22. Introduce ADR format (H-D5)
23. Evaluate canary deploys (Argo Rollouts)
24. Plan for RI expiry (March 2027)
25. Reduce rate limits to per-endpoint tiers

---

## 6. What's Already Good

- **Architecture fundamentals:** DB-per-domain, gRPC+mTLS, good service separation, 22 proto contracts
- **BE README:** Verified against code, complete service map, env vars, troubleshooting
- **DevOps docs:** 32 files covering K8s, MongoDB, monitoring, rollback
- **JSDoc:** 72.4% coverage across 1,436 TS files — respectable for this codebase size
- **Security foundations:** Helmet enabled, class-validator with whitelist, Argon2 defaults, webhook signature verification, mTLS between services
- **Infrastructure:** HPA+VPA+Cluster Autoscaler, spot instance mix, PDBs configured, Node Termination Handler
- **Monitoring stack deployed:** Prometheus, Grafana, Loki, Promtail, MongoDB Exporter, YACE

---

## 7. Audit Scope & Methodology

| Audit Stream | Task ID | Files Audited | Key Metric |
|-------------|---------|---------------|------------|
| Architecture & Infrastructure | t_f652d37d | 18 K8s/infra files + full repo structure | 4 C + 9 H + 12 M + 6 L |
| Security | t_4544c1c3 | Full BE codebase static analysis | 3 C + 5 H + 5 M + 3 L |
| Code Quality & Testing | t_865726e9 | 3,324 source files (BE: 1,547, FE: 1,777) | 1 C + 3 H + 3 M + 3 L |
| Documentation & Product | t_1e8f8b8c | All repos, READMEs, docs/, Swagger | 3 C + 5 H + 11 M + 1 L |

---

*Consolidated by Hermes Agent from 4 parallel audit streams.*
