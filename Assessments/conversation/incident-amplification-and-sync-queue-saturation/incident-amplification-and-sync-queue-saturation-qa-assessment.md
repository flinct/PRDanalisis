# Assessment Report: Incident Amplification and Sync Queue Saturation

> **Assessment Type:** Type 2 — Bug Fix Analysis + Type 3 — Interconnection Analysis
> **Owner:** Analyst
> **Source PRD / Source Input:** `incident report/2026-07-20-pk10-00-conversation-event-storm.md`, `incident report/2026-07-20-pk12-10-rmq-sync-history-saturation.md`, session analysis 2026-07-20
> **Source Change Intake Brief:** `not-applicable`
> **Assessment Artifact Path:** `Assessments/conversation/incident-amplification-and-sync-queue-saturation/incident-amplification-and-sync-queue-saturation-qa-assessment.md`
> **Version:** `v1.0`
> **Previous Version:** `none`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`
> **Reference Context:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`
> **Tanggal Analisa:** 2026-07-20
> **Status:** Draft

---

## 0. Ringkasan Perubahan Analisa

- Initial version untuk menggabungkan dua insiden produksi dalam satu baseline assessment.
- Menetapkan bahwa incident 10:00 dan 12:10 berada pada jalur sistem yang sama tetapi punya root trigger berbeda.
- Menetapkan phase fixing, phase testing, diagram arsitektur masalah, dan urutan prioritas fix.

---

## 1. Overview

**Feature / Issue:**

Dua insiden produksi pada modul Conversation / inbound processing:
- 10:00 WIB — conversation blank/loading karena event amplification + invalidation storm
- 12:10 WIB — blank total karena sync history bulk men-saturasi queue shared dengan inbound realtime

**Objective:**

Menentukan akar masalah gabungan, blast radius, urutan fix, strategi testing, dan fase delivery agar incident tidak berulang.

**Business Context:**

Conversation adalah hot path utama operasional agent. Gangguan pada jalur inbound, counter, assignment, dan socket bukan hanya mempengaruhi UI conversation, tetapi juga SLA handling, ticket linkage, unread state, dan penerimaan pesan pelanggan lintas tenant.

**Change Class / Routing Decision from Brief:**

Bug fix multi-module, high blast radius, cross-team, production safety critical.

**Protected Existing Behavior from Brief:**

- Inbound realtime lintas channel tetap diproses tanpa delay material.
- History sync tetap bisa dilakukan saat onboarding company baru.
- Assignment flow, unread/counter accuracy, dan socket live update tetap berfungsi setelah fix.
- Blast radius tenant A tidak boleh lagi menular ke tenant B melalui queue atau FE amplification.

**Scope In:**
- Queue separation sync vs realtime
- History sync fast-path behavior
- FE socket event handling
- FE counter refresh behavior
- FE reconnect invalidation behavior
- Retry policy pada detail conversation
- Testing and rollout strategy

**Scope Out:**
- Tenant DB isolation penuh
- Rewrite total conversation-service architecture
- Full PRD rewrite untuk sync onboarding flow
- Capacity planning infra jangka panjang di luar mitigasi incident

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `PROCEED_WITH_CAUTION`

**Decision Class:** `CONDITIONAL_GO`

**Decision Statement:**
> Fix harus lanjut dalam beberapa fase, bukan satu big-bang delivery. Queue separation dan history fast-path adalah blocker utama untuk keselamatan produksi. FE amplification fix harus ikut dalam wave awal karena jika hanya queue dipisah, incident 10:00 masih dapat berulang saat traffic realtime tinggi.

### 2.2 Required Actions Before Development

- [ ] Lock root-cause scope: incident 10:00 = event amplification; incident 12:10 = shared queue saturation + event amplification as amplifier.
- [ ] Audit nama queue aktual dan routing publisher/consumer di BE sebelum implementasi split queue.
- [ ] Sepakati definisi produk bahwa history sync **bukan** inbound realtime live event.
- [ ] Sepakati phase fixing dan phase testing lintas FE / BE / QA / DevOps.

### 2.3 Key Blocking Reasons / Conditions

- Queue topology produksi belum dibuktikan via config readback pada artifact ini.
- Belum ada keputusan final apakah history sync boleh memicu assignment/counter/socket seperti live inbound.
- Belum ada staging replay besar yang mendekati 12.886 conversation + 144k message.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** Critical
- **Risk Level:** Critical
- **Primary Impact Areas:** Backend / Queue / API / UI / Performance / Operational / Automation / Integration

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | Inbound realtime harus tetap hidup walau history sync besar sedang berjalan | incident 12:10 |
| BR-02 | History sync tidak boleh mematikan fitur tenant lain | incident 12:10 |
| BR-03 | Satu inbound live tidak boleh memicu refetch dan invalidation berlebihan di FE | incident 10:00 |
| BR-04 | Notification lightweight tidak boleh memicu full active-conversation pipeline | incident 10:00 |
| BR-05 | Reconnect socket tidak boleh memaksa full app refetch | incident 10:00 |
| BR-06 | Blast radius antar-tenant harus diperkecil pada jalur queue dan FE hot path | gabungan |

### 3.2 Acceptance Criteria

- Realtime inbound tetap terproses saat sync history besar berlangsung.
- Sync history masuk jalur queue terpisah dari inbound realtime.
- Payload `isHistorySync=true` tidak memicu auto-pull, counter per-message, socket emit per-message, atau ticket realtime side-effect.
- FE tidak lagi melakukan delayed `/count` refetch setelah counter socket payload diterima.
- FE reconnect hanya invalidate query relevan, bukan global.
- `notification.new.message` hanya update lightweight state, bukan full active-message flow.
- Skenario burst realtime tenant A tidak lagi membuat tenant B blank/loading.
- Skenario bulk sync 6 channel tidak lagi mematikan inbound channel lain.

### 3.3 Assumptions

- RabbitMQ tetap dipakai sebagai transport utama inbound path.
- Sync history source dapat menambahkan metadata/flag pada payload.
- Existing FE behavior untuk unread/badge dapat dipisah dari full message render logic.
- Beberapa metric/counter boleh menjadi eventual-consistent selama bulk sync selama inbound live tetap sehat.

### 3.4 Clarifications Needed

- Apakah history sync harus pernah tampil sebagai live event ke agent, atau cukup muncul sebagai imported data setelah selesai?
- Apakah assignment otomatis untuk history sync memang diinginkan produk?
- Apakah ticket sync untuk history message memang dibutuhkan?
- Berapa SLA penerimaan inbound realtime saat sync besar berjalan?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

**Insiden 10:00 path:**
- 1 inbound live dapat menghasilkan beberapa downstream event.
- FE memproses `message` dan `notification.new.message` secara overlap.
- Counter socket payload masih memicu `/count` refetch 1 detik kemudian.
- Reconnect socket meng-invalidate semua query.
- Shared server/DB membuat tenant lain terkena efek.

**Insiden 12:10 path:**
- History sync dan inbound realtime berbagi queue yang sama.
- 144k+ history message diproses lewat full realtime pipeline.
- Sync 6 channel paralel menyebabkan backlog besar.
- Realtime inbound tenant lain tertahan di belakang backlog.
- Recovery butuh restart RabbitMQ manual.

### 4.2 Proposed State (To-Be)

- Queue inbound realtime dan queue history sync dipisah.
- History sync pakai fast-path dan skip realtime hooks berat.
- FE hanya melakukan update minimum per event.
- Reconnect invalidate scoped per query family.
- Counter refresh gunakan socket payload sebagai source utama, bukan forced refetch.
- Delivery dilakukan bertahap: containment → stabilization → hardening.

### 4.3 State Transition / Data Flow Notes

#### Diagram A — Current failure path

```text
                    CURRENT FAILURE PATH

       Live Inbound / History Sync (shared hot path)
                       |
                       v
                +--------------+
                | Shared Queue  |
                +------+-------+
                       |
                       v
         +-------------------------------+
         | inbound-message.processor      |
         | full realtime behavior always  |
         +---+------------+-----------+---+
             |            |           |
             v            v           v
        auto-pull      counter     socket emit
             |            |           |
             +------------+-----------+
                          |
                          v
                    API Gateway fanout
                     /              \
                    v                v
               message      notification.new.message
                    \              /
                     v            v
                    FE overlapping handlers
                           |
            +--------------+----------------+
            |              |                |
            v              v                v
      invalidate many   /count refetch   reconnect invalidate all
            \              |                /
             +-------------+---------------+
                           |
                           v
                     request storm / blank
```

#### Diagram B — Target safe path

```text
                       TARGET SAFE PATH

          +-------------------+     +-------------------+
          | History Sync      |     | Realtime Inbound  |
          +---------+---------+     +---------+---------+
                    |                         |
                    v                         v
          +-------------------+     +-------------------+
          | sync queue        |     | realtime queue    |
          +---------+---------+     +---------+---------+
                    |                         |
                    v                         v
          +-------------------+     +-------------------+
          | sync consumer     |     | realtime consumer |
          | fast-path only    |     | full live path    |
          +---------+---------+     +---------+---------+
                    |                         |
                    |                  +------+------+
                    |                  | API Gateway |
                    |                  +------+------+ 
                    |                         |
                    |               +---------+----------+
                    |               |                    |
                    v               v                    v
        batch completion event   message        notification.light
                                                   |
                                                   v
                                            unread/badge only
```

#### Diagram C — Fix phasing

```text
PHASE 1  Containment
- split queue sync vs realtime
- history sync fast-path
- remove delayed count refetch
- scope reconnect invalidate
- slim notification handler

PHASE 2  Stabilization
- reduce retry detail
- batch counter updates
- rate limit sync publisher
- consumer backpressure / pause
- monitoring alerts

PHASE 3  Hardening
- dedicated history import architecture
- company-level throttling
- repeatable load/replay suite
- tenant isolation roadmap
```

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Queue routing, inbound processor, FE socket handlers | conversation-service, api-gateway, FE conversation page | HIGH | Phase rollout + smoke per phase |
| Database | Reduced pressure pattern, possible eventual consistency for bulk sync counters | conversation, message, counter collections | HIGH | Keep correctness checks post-sync |
| API | FE count fetch cadence and reconnect behavior change | conversation count/detail/list APIs | HIGH | Compare pre/post RPS and latency |
| UI/UX | Less aggressive refresh, lower blank risk | conversation list, header, chat input | HIGH | Verify unread and active room freshness |
| Security / RBAC | No planned rule change | view scope and role visibility | LOW | Regression only |
| Performance | Large positive impact if successful | queue depth, socket event rate, DB load | HIGH | Must instrument before rollout |
| Integration | Sync source must set `isHistorySync` or route key equivalent | channel/onboarding integration | HIGH | Blocking integration contract |
| Reporting / Analytics | Counter/event timing may become less noisy / more eventual | dashboards and incident metrics | MEDIUM | Note changed semantics |
| Financial / Operational | Agent productivity, SLA handling, inbound continuity | support operation | HIGH | Priority business protection |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| FE conversation socket handler | api-gateway socket events | event | inbound | Event contract overlap is root problem |
| FE count/list/detail queries | conversation APIs | API | inbound | Storm creates repeated HTTP pressure |
| api-gateway websocket service | conversation-service emitted events | async event | inbound | Fanout policy multiplies cost |
| inbound-message.processor | RabbitMQ queue topology | queue | inbound | Shared queue is root issue 12:10 |
| history sync source | publisher routing / payload metadata | integration | outbound | Must distinguish sync vs live |
| auto-pull flow | new conversation event path | lifecycle | bidirectional | Must not run for historical import |
| counter system | inbound and pull events | shared state | bidirectional | Must not update per historical message |

### 6.2 Shared Resources / Event Mapping

- Shared resource #1: RabbitMQ queue path for sync + live inbound
- Shared resource #2: FE query cache for count/list/detail
- Shared resource #3: Socket company-room fanout
- Shared resource #4: shared DB and server capacity across tenants
- Event classes involved:
  - `message`
  - `notification.new.message`
  - `conversation.pulled`
  - `conversation.counter`
  - reconnect invalidation cascade

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Split queue done wrong, realtime messages routed to sync queue | Medium | Critical | Critical | Audit queue names + staging replay before prod |
| R-02 | `isHistorySync` contract missing from some publishers | High | High | Critical | Add routing validation / fallback logging |
| R-03 | FE slim notification handler breaks unread or badge updates | Medium | High | High | Regression on unread, badge, active room |
| R-04 | Removing delayed `/count` refetch leaves stale count in edge case | Medium | Medium | Medium | Compare socket payload correctness first |
| R-05 | Reconnect scoped invalidate misses some required refresh path | Medium | Medium | Medium | Explicit query-key verification |
| R-06 | Historical conversations remain unassigned after fast-path | High | High | Critical | Separate post-sync assignment strategy |
| R-07 | Counter semantics drift during history sync | High | Medium | High | Rebuild/batch counter after sync |
| R-08 | Ops deploy only FE fix, leaving queue issue unresolved | Medium | Critical | Critical | Enforce phased rollout checklist |

### 7.2 Worst-Case Scenarios

- Large onboarding sync still enters live queue path and reproduces SEV-1.
- FE fixes reduce UI storm but BE queue saturation still blocks all inbound.
- History sync no longer blocks system but leaves thousands of imported conversations unassigned without follow-up job.
- Reconnect fix misses critical refresh path and creates hidden stale UI bug.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Routing live inbound to realtime queue
- Routing history sync to sync queue
- `isHistorySync` skip behavior
- FE socket handling split between full and lightweight events
- Counter update behavior without forced refetch
- Reconnect scoped invalidation

### 8.2 Regression Scope
- Conversation list refresh
- Active room message arrival
- Unread badge and counts
- Assignment / auto-pull
- Ticket-linked message behavior
- Multi-tenant visibility and no-cross-tenant blast

### 8.3 Integration Scope
- Sync publisher → queue routing
- Queue consumer → processor path
- Processor → api-gateway event contract
- FE socket handlers → query cache effects

### 8.4 UAT / Business Validation
- Agent still sees new live message immediately
- Company onboarding sync completes without blocking other tenants
- Imported history appears in system without causing operational outage

### 8.5 Automation Candidates
- FE network/socket counter probe for event amplification
- Queue routing replay for live vs history payload
- Multi-tenant soak: tenant A storm, tenant B idle
- Bulk sync + live inbound parallel replay

### 8.6 Test Phases

#### Phase T1 — Logic verification
- Verify queue routing for live vs history
- Verify `isHistorySync` skips heavy hooks
- Verify FE no longer delayed-refetches `/count`
- Verify reconnect no longer global invalidates

#### Phase T2 — Service/load verification
- Replay incident 10:00 style realtime burst
- Replay incident 12:10 style 6-channel history sync
- Run tenant A storm + tenant B idle scenario

#### Phase T3 — Recovery verification
- Socket reconnect during burst
- Pause/resume sync consumer
- DB latency stress light test
- Confirm no RMQ restart needed for recovery

#### Diagram D — Testing matrix

```text
+----------------------+-------------------------+---------------------------+
| Scenario             | Before Fix              | Expected After Fix        |
+----------------------+-------------------------+---------------------------+
| Realtime burst       | count spam, blank UI    | stable UI, lower RPS      |
| Sync 6 channels      | full outage             | sync isolated, live OK    |
| Socket reconnect     | full app refetch        | scoped refresh only       |
| Tenant A storm       | Tenant B ikut lambat    | Tenant B tetap sehat      |
| RMQ backlog tinggi   | restart manual needed   | live path tetap berjalan  |
+----------------------+-------------------------+---------------------------+
```

---

## 9. Production Safety

- **Rollback Strategy:** deploy per phase; FE changes can rollback independently from queue split; queue split rollout must preserve old bindings until cutover confirmed.
- **Feature Toggle Requirement:** recommended for history fast-path and notification-light mode if existing code allows clean gating; if not, use staged deploy + canary.
- **Backward Compatibility Notes:** history sync publisher must remain compatible until all consumers support new route/flag.
- **Staged Rollout Recommendation:** Wave 1 FE containment → Wave 2 queue split + history fast-path → Wave 3 stabilization hardening.
- **Monitoring / Alerting Needs:** queue depth, unacked, consumer utilisation, `/count` RPS, socket reconnect rate, company-level socket event rate.
- **Logging / Audit Gaps:** need explicit logs showing whether message entered sync vs realtime path and whether hooks skipped due to `isHistorySync`.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | Apa nama queue aktual dan binding/routing key prod untuk live inbound vs sync history? | Required before safe queue split | Yes |
| OQ-02 | Apakah history sync memang boleh memicu assignment agent? | Defines skip behavior and post-sync job | Yes |
| OQ-03 | Apakah history sync perlu socket live event per message? | Major performance and UX decision | Yes |
| OQ-04 | Apakah ticket sync untuk history message dibutuhkan? | Affects fast-path scope | Yes |
| OQ-05 | Berapa banyak imported conversation 12:10 yang masih unassigned? | Measures hidden post-incident debt | No |
| OQ-06 | Berapa SLA maksimal inbound realtime saat sync besar berjalan? | Needed for success criteria | No |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- Incident 10:00 membuktikan jalur realtime saat ini terlalu amplifying.
- Incident 12:10 membuktikan queue architecture saat ini tidak aman untuk onboarding volume besar.
- Mengatasi salah satu tanpa yang lain hanya mengurangi gejala, bukan menutup outage class.
- Fix harus dipisah fase supaya blast radius deployment kecil dan hasil per-wave dapat diukur.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `PROCEED_WITH_CAUTION` |
| Owner for Follow-up | PM / FE / BE / QA / DevOps |
| Required Revisions | queue contract, history sync behavior contract, testing gate |
| Suggested Delivery Strategy | Phase split |
| Earliest Safe Next Step | Design review + queue audit + wave 1 FE containment |

### 11.3 Recommended Fix Phases

#### Phase 1 — Containment
- Split queue sync vs realtime
- Add history fast-path (`isHistorySync` or equivalent route)
- Remove delayed `/count` refetch
- Scope reconnect invalidate
- Slim `notification.new.message` to lightweight path

#### Phase 2 — Stabilization
- Reduce retry on detail query
- Batch counter updates for sync path
- Rate limit sync publisher
- Add consumer backpressure / pause strategy
- Add alerting for queue and event amplification

#### Phase 3 — Hardening
- Dedicated history import architecture
- Company-level throttling / worker budgeting
- Repeatable replay/load suite as release gate
- Tenant isolation roadmap

### 11.4 Indicative Timeline

| Track | Estimasi |
|------|----------|
| Phase 1 fixing | 2–4 hari kerja |
| Phase 1 testing | 2 hari |
| Phase 2 fixing | 3–5 hari kerja |
| Phase 2 testing | 2–3 hari |
| Phase 3 hardening | 1–2 minggu |

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-01 | Realtime inbound isolated from history sync | Shared queue is root issue 12:10 | Queue / Ops | TC-Q-01 | Pending |
| FR-02 | History sync skip live side-effects | Current processor treats history as live inbound | Backend / Performance | TC-BE-02 | Pending |
| FR-03 | FE should not amplify one inbound into many requests | Current FE does delayed count refetch + overlap handlers | Frontend / API | TC-FE-03 | Pending |
| FR-04 | Reconnect should not refresh whole app | Global invalidate creates storm | Frontend / Performance | TC-FE-04 | Pending |
| FR-05 | Tenant B must survive tenant A load | Shared resources currently leak blast radius | Multi-tenant / Ops | TC-E2E-05 | Pending |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-07-20 | Initial assessment created | Dany Christian |
