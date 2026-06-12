# QA Assessment Report: WhatsApp Web Outbound Anti-Ban Guard

> **Assessment Type:** Type 1 — Feature Development Analysis
> **Source PRD / Source Input:** `PRD/Whatsapp web v2/PRD WA Web Outbound Anti-Ban Guard.md`
> **Assessment Artifact Path:** `Assessments/whatsapp-web/wa-outbound-anti-ban-guard/wa-outbound-anti-ban-guard-qa-assessment.md`
> **Version:** `v1.2`
> **Previous Version:** `Assessments/whatsapp-web/wa-outbound-anti-ban-guard/wa-outbound-anti-ban-guard-qa-assessment.md@v1.0`
> **Rules Applied:** `Rules/qa-analysis-rule.md`, `Rules/impact-analysis-rule.md`, `Rules/workflow-rule.md`, `Rules/prd-writing-rule.md`
> **Reference Memory:** `Memory/global-memory.md`, `Memory/CLAUDE-fe.md`, `Memory/CLAUDE-be.md`, companion docs in `Assessments/whatsapp-web/wa-outbound-anti-ban-guard/` and `Test/whatsapp-web/`
> **Tanggal Analisa:** 2026-06-11
> **Status:** Reviewed

---

## 0. Ringkasan Perubahan Analisa

- Assessment disinkronkan ke PRD v0.2 yang sekarang memfokuskan feature ke **text-only protected manual resend guard** dan **duplicate broadcast traceability**.
- Concern lama tentang generic paste/burst operator scoring diturunkan; fokus utama sekarang adalah user resend exact same broadcast text dari conversation room saat system-managed broadcast masih aktif atau recent.
- Klarifikasi role IT Support sudah masuk: IT Support adalah **internal dashboard user** tanpa special override authority di luar product surface yang sudah developed.
- Open questions berkurang, tetapi keputusan inti masih belum sepenuhnya locked: fingerprint normalization, manual vs broadcast precedence, in-flight behavior saat safe mode aktif, source of truth health signal, dan actual send-point coordination di `whatsapp` (Baileys) service.
- Technical analysis terbaru menambahkan temuan penting: UI outbound dan broadcast outbound masih bisa overlap di actual Baileys send path walau business guardrail dan traceability sudah benar. Karena itu sender-level serialized queue di `whatsapp` service menjadi bagian dari design lock yang relevan untuk anti-ban safety.
- Companion artifacts sudah disejajarkan dengan PRD baru:
  - `Test/whatsapp-web/wa-outbound-anti-ban-qa-test-spec.md` v1.3
  - `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md` v1.3

---

## 1. Overview

**Feature / Issue:** WhatsApp Web Outbound Anti-Ban Guard

**Objective:** Mencegah unsafe manual resend atas exact same broadcast text dari conversation room ketika system-managed broadcast masih menangani delivery yang sama, sekaligus meningkatkan traceability untuk duplicate broadcast incidents yang root cause-nya masih unknown.

**Business Context:** Broadcast sudah diatur oleh admin dan existing SatuInbox flow sudah memiliki queueing, timing, serta retry/repeat handling. Masalah utamanya adalah sebagian user bypass SOP dengan copy-paste text broadcast dan mengirim manual dari conversation room. Ini dapat berbenturan dengan outbound system-managed flow dan menaikkan suspension risk. Secara paralel, ada indikasi duplicate broadcast 2x beruntun dari system flow existing, tetapi root cause riilnya belum confirmed sehingga observability dan traceability menjadi requirement inti.

**Scope In:**
- WhatsApp Web **text-only** outbound untuk Phase 1
- exact-text manual resend detection terhadap related broadcast yang masih active atau recent
- warning / cooldown / queue / block policy untuk protected resend
- duplicate dispatch traceability dengan correlation ID, dispatch source, dan attempt lineage
- sender safe mode dan existing sender eligibility integration
- Admin / IT Support / authorized log viewers audit visibility melalui dashboard product surface

**Scope Out:**
- attachment, media, template, dan non-text outbound
- generic paste-heavy / burst-risk scoring di luar konteks broadcast resend
- fuzzy semantic similarity detection
- AI rewrite / humanization redesign
- special override control untuk IT Support di luar developed dashboard surfaces
- non-WhatsApp channels

---

## 2. Decision Summary

### 2.1 Final Decision

**Decision Enum:** `REVISE_PRD`

**Decision Class:** `NO_GO`

**Decision Statement:**
> PRD sekarang jauh lebih tajam dan lebih implementable daripada versi sebelumnya, tetapi masih belum cukup locked untuk implementation-final approval. Feature boleh lanjut untuk planning, breakdown teknis, dan test design, namun keputusan desain inti yang mempengaruhi determinism dan cross-service behavior masih harus dikunci terlebih dahulu.

### 2.2 Required Actions Before Development

- [ ] Lock canonical fingerprint normalization untuk exact text comparison
- [ ] Lock precedence rule antara manual room send vs system-managed broadcast ketika collide pada recipient yang sama
- [ ] Lock actual send-point serialization strategy per sender di `whatsapp` (Baileys) service, termasuk sender key, priority rule UI vs broadcast, dan gap semantics
- [ ] Lock in-flight behavior ketika sender safe mode / restriction aktif di tengah proses
- [ ] Confirm source of truth dan producer untuk sender restriction / health-state signal
- [ ] Confirm apakah tenant isolation akan tetap cukup di NFR/API scope yang sekarang atau perlu explicit FR tambahan
- [ ] Lock queue overflow, retry semantics, dan observability minimum untuk sender-level outbound queue

### 2.3 Key Blocking Reasons / Conditions

- Exact-text guard akan tetap ambigu jika normalization rule tidak dipin secara canonical.
- Collision rule manual vs broadcast masih bisa diimplementasikan berbeda oleh FE / validation service / worker.
- Technical analysis menunjukkan actual send point di `whatsapp` (Baileys) service masih dapat mengizinkan UI outbound dan broadcast overlap dalam hitungan milidetik jika sender-level serialization tidak dipaksa pada titik socket send.
- Duplicate investigation traceability sudah kuat di PRD, tetapi root-cause resolution workflow tetap bergantung pada owner signal dan evidence model yang konsisten.
- Safe mode masih menyisakan ambiguity terhadap attempt yang sudah in-flight.
- Queue overflow, retry semantics, dan observability untuk sender-level outbound queue belum dikunci sehingga implementasi berisiko menghasilkan hot-loop retry atau blind operational slowdown.

### 2.4 Complexity and Risk Snapshot

- **Complexity Level:** High
- **Risk Level:** High
- **Primary Impact Areas:** Backend, Worker/Queue, Actual Send-Point Coordination, API Contract, Auditability, Dashboard Visibility, Sender Health, Automation Scope

---

## 3. Requirement Summary

### 3.1 Business Rules

| BR ID | Business Rule | Source |
|------|---------------|--------|
| BR-01 | System-managed broadcast remains the source of truth for outbound handling within the protected Phase 1 scope. | Overview, US-001, FR-014 to FR-020 |
| BR-02 | Manual resend of the **exact same text** to the same recipient while related broadcast handling is still active or recent must produce deterministic policy action. | US-001, US-003, FR-014 to FR-020 |
| BR-03 | Retry and unknown post-dispatch states must not trigger blind resend. | FR-008 to FR-011 |
| BR-04 | Suspected duplicate broadcast incidents must be traceable through correlation ID, dispatch source, and attempt lineage before root cause is classified. | US-002, FR-024 to FR-028 |
| BR-05 | IT Support uses only existing SatuInbox dashboard surfaces for monitoring and incident review; no special override path is assumed. | Overview, Permission Matrix, US-008 |

### 3.2 Acceptance Criteria

- Protected resend behavior is deterministic for exact same text, same recipient, and related active/recent broadcast context.
- Monitor / warning / queue / strict behavior is visible and explainable without exposing internal formulas to operator.
- Reconciliation pending never causes blind resend.
- Duplicate-suspected incidents are traceable enough to distinguish likely system duplicate vs manual resend after evidence review.
- Existing sender eligibility and outbound limit logic remain authoritative.

### 3.3 Assumptions

- Existing broadcast queue, timing, retry/repeat handling, sender eligibility, and account health are canonical dependencies.
- Phase 1 is locked to **text-only** outbound.
- IT Support uses existing dashboard and developed product features only.
- sixV2Automation covers deterministic UI/E2E subset only; backend-heavy traces remain in integration/harness lanes.

### 3.4 Clarifications Needed

- What is the canonical normalization rule for exact text comparison?
- What wins when manual room send and system-managed broadcast collide on the same recipient?
- What happens to already in-flight sends when sender safe mode or restriction activates?
- Which service/event stream owns health-state truth?
- Is current tenant-isolation framing sufficient, or does implementation need one more explicit functional statement?

---

## 4. Current State vs Proposed State

### 4.1 Current State (As-Is)

- Admin-managed broadcast already exists with queue/timing/retry handling.
- User can still resend broadcast text manually from conversation room, creating SOP-violation risk.
- Duplicate broadcast incidents may already happen in production-like flow, but traceability is not yet strong enough to isolate root cause quickly.

### 4.2 Proposed State (To-Be)

- Manual resend of exact same protected broadcast text is detected and handled before unsafe duplicate delivery occurs.
- Dashboard-visible audit and trace data are sufficient for Admin, IT Support, and other authorized anti-ban log viewers incident review.
- Duplicate-suspected incidents follow an explicit investigation state path instead of remaining ambiguous log fragments.

### 4.3 State Transition / Data Flow Notes

- Manual room send and system-managed broadcast converge on shared dedupe, validation, and recipient-lock boundaries.
- Protected resend may transition through `WARNED_RESEND`, `QUEUED_RESEND`, or `BLOCKED_MANUAL_RESEND` before any dispatch happens.
- Duplicate incidents now have a separate investigation lifecycle: `DUPLICATE_BROADCAST_SUSPECTED` → `CONFIRMED_SYSTEM_DUPLICATE` / `CONFIRMED_MANUAL_RESEND`.
- Unknown dispatch result still must move into `RECONCILIATION_PENDING`, not resend blindly.

---

## 5. Impact Analysis

| Dimension | What Changes | What Is Affected | Impact Level | Mitigation / Notes |
|----------|---------------|------------------|--------------|--------------------|
| Module | Anti-ban feature is narrowed to protected resend guard + duplicate traceability | conversation room send path, broadcast worker, audit UI | HIGH | Better than generic operator-risk scope, but still cross-module |
| Database | New traceability artifacts and protected resend metadata are emphasized | audit persistence, trace records, reconciliation links | MEDIUM | Ensure schema stability for correlation metadata |
| API | Validation and audit contracts now need dispatch source and related broadcast reference | FE validation path, logs, support tooling | HIGH | Keep additive contract design |
| UI/UX | Operator message becomes more specific and understandable | conversation room warning/block states | MEDIUM | Bahasa UX now aligns better with actual problem |
| Security / RBAC | IT Support scope is clarified as dashboard-only read path | support dashboards, tenant visibility | MEDIUM | Server-side enforcement still mandatory |
| Performance | Validation and sender-level outbound serialization may increase effective send spacing and backlog under active traffic | send latency, queue depth, per-sender throughput | HIGH | Lock gap semantics relative to existing human-presence delay and monitor throughput impact |
| Integration | Manual room send relies on fresh broadcast state and trace linkage, while actual Baileys send point now becomes a required coordination boundary | worker state, queue state, `whatsapp` service send path, audit flow | HIGH | Must avoid stale state and force sender-level serialization at the final send point |
| Reporting / Analytics | Duplicate-suspected metrics, dispatch lineage, and outbound queue observability become part of operational safety | support investigation quality, queue monitoring, anti-spam diagnostics | HIGH | Add queue-depth, wait-time, overflow, and actual inter-send gap observability |
| Operational | Better alignment to real incident pattern reduces overbuilding risk | PM / QA / Engineering workflow | HIGH | Scope is now more actionable, but design locks still needed |

---

## 6. Dependency Analysis

### 6.1 Dependency Matrix

| Feature / Module | Depends On | Dependency Type | Direction | Notes |
|------------------|------------|-----------------|-----------|-------|
| Manual resend guard | conversation room manual send flow | sync UI/API | UI -> validation service | must carry text fingerprint + recipient + dispatch source |
| Protected resend evaluation | broadcast queue / recent-attempt state | sync read / cached state | validation -> broadcast state | stale state is a major risk |
| Duplicate investigation traceability | audit / trace store | async + read | worker -> logging/support | correlation ID must survive across retries |
| Actual sender pacing / serialization | `whatsapp` / Baileys send path | in-process queue / runtime coordination | UI outbound + broadcast outbound -> sender queue | sender key and single-instance assumption must be locked |
| Sender safe mode | account health / restriction signal | event / status feed | producer -> anti-ban guard | exact source owner still needs lock |
| Dashboard visibility | existing SatuInbox logs/views | API/UI | BE -> UI | IT Support remains dashboard-bound |
| Automation readiness | UI surfaces + deterministic fixtures | test dependency | QA -> automation | protected resend cases need active/recent broadcast fixture; queue behavior needs backend harness coverage |

### 6.2 Shared Resources / Event Mapping

- `contentFingerprint`, `recipientFingerprint`, and `relatedBroadcastReference` are shared decision inputs between manual resend and broadcast flow.
- `dispatchCorrelationId` and attempt lineage are shared between validation, worker, reconciliation, and support review.
- sender-level outbound queue state (`highPriority`, `lowPriority`, `lastSentAt`, overflow signal) becomes a runtime coordination resource once actual send-point serialization is adopted.
- account restriction / safe-mode event affects sender availability across manual and broadcast paths.

---

## 7. Risk Analysis

### 7.1 Risk Matrix

| Risk ID | Scenario | Likelihood | Severity | Level | Mitigation |
|---------|----------|------------|----------|-------|------------|
| R-01 | Exact-text normalization differs across services | High | High | Critical | Lock canonical normalization in PRD and API contract |
| R-02 | Manual vs broadcast collision precedence differs by implementation path | Medium | High | High | Define winner rule explicitly |
| R-03 | Broadcast active/recent state is stale during validation | Medium | High | High | Use canonical queue/attempt state with clear freshness rule |
| R-04 | Sender-level actual send point remains unserialized in `whatsapp` / Baileys service | High | High | Critical | Lock sender queue strategy, sender key identity, and UI-high vs broadcast-low priority rule before implementation |
| R-05 | Gap semantics, overflow handling, or retry behavior of sender-level queue are under-specified | Medium | High | High | Define whether 3–8s is effective inter-send gap, prevent hot-loop retries on overflow, and require queue observability |
| R-06 | Safe-mode event source is inconsistent or delayed | Medium | High | High | Confirm producer and owner before build |
| R-07 | Duplicate investigation evidence is incomplete under degraded logging | Medium | Medium | Medium | Preserve fallback trace path and degraded alert |

### 7.2 Worst-Case Scenarios

- User resend is allowed while active broadcast still processes the same recipient, causing duplicate customer contact.
- UI outbound and broadcast outbound still overlap at the same Baileys sender socket, producing burst cadence that looks spammy even though upstream validation exists.
- Sender-level queue overflows or retries incorrectly and creates hot-loop reprocessing / backlog collapse.
- System duplicate is misclassified as manual resend because trace data is incomplete.
- Safe mode activates late and new sends continue unsafely.
- Support can open logs but still cannot determine source of duplicate incident.

---

## 8. Test Strategy

### 8.1 Functional Scope
- Use `Test/whatsapp-web/wa-outbound-anti-ban-qa-test-spec.md` v1.3 as current execution blueprint.
- Focus manual resend warning/block, cooldown/re-evaluation, safe normal manual path, and duplicate trace visibility.

### 8.2 Regression Scope
- Normal conversation-room manual send outside protected resend scope
- broadcast overlap dedupe
- sender eligibility / outbound limit
- sender stickiness / failover boundaries
- monitor-only rollout behavior

### 8.3 Integration Scope
- recipient lock behavior
- reconciliation pending / sent / failed resolution
- duplicate investigation resolution states
- audit persistence degradation
- sender safe mode event handling
- sender-level outbound queue serialization for UI + broadcast convergence in `whatsapp` / Baileys service
- queue overflow, dispose, and retry semantics under backlog pressure

### 8.4 UAT / Business Validation
- internal rollout policy / feature-flag behavior
- operator comprehension of protected resend warning/block
- IT Support dashboard review of dispatch lineage

### 8.5 Automation Candidates
- Use `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md` v1.3 as active automation companion.
- Playwright-ready subset remains limited to deterministic UI/E2E cases.

---

## 9. Production Safety

- **Rollback Strategy:** Policy-driven rollout via config; feature can be softened to `monitor_only`.
- **Feature Toggle Requirement:** Mandatory for staged rollout.
- **Backward Compatibility Notes:** Must not weaken outbound limit, sender eligibility, or existing sender selection safeguards.
- **Staged Rollout Recommendation:** trace-only monitor → warning-only → soft-block → strict.
- **Monitoring / Alerting Needs:** protected resend warnings/blocks, duplicate-suspected count, reconciliation backlog, sender safe-mode count, trace completeness, sender-queue depth, overflow count, actual inter-send gap, and wait time by priority.
- **Logging / Audit Gaps:** normalization rule, freshness rule for recent broadcast state, health-signal owner, sender queue key identity, gap semantics, and overflow/retry observability still need lock.

---

## 10. Open Questions

| OQ ID | Question | Why It Matters | Blocking? |
|------|----------|----------------|-----------|
| OQ-01 | What is the canonical normalization rule for exact text comparison? | Determines whether protected resend is deterministic | Yes |
| OQ-02 | What wins in manual vs broadcast same-recipient collision? | Cross-service behavior must be deterministic | Yes |
| OQ-03 | What sender identity becomes the throttle / queue key at the actual Baileys send point? | Needed to ensure one logical sender cannot still burst through multiple execution contexts | Yes |
| OQ-04 | Is the 3–8s pacing requirement defined as effective inter-send gap or as extra delay on top of existing human-presence simulation? | Directly affects throughput, latency, and implementation correctness | Yes |
| OQ-05 | What happens to in-flight sends after safe mode activates? | Prevents partial or inconsistent sender behavior | Yes |
| OQ-06 | Which service owns restriction / health-state truth? | Needed for fast and correct safe-mode enforcement | Yes |
| OQ-07 | Should tenant isolation be elevated further from current PRD/API wording? | Security clarity and implementation certainty | No |
| OQ-08 | How should sender-queue overflow, retry semantics, and minimum observability be defined? | Prevents hot-loop retries, hidden backlog, and opaque runtime behavior | Yes |

---

## 11. Recommendation

### 11.1 Recommendation Rationale

- PRD v0.2 is materially better aligned with the real incident pattern.
- Scope is now tighter, more testable, and less likely to cause overbuilt anti-operator heuristics.
- QA test spec and automation mapping are now aligned with the updated PRD direction.
- Remaining blockers are still real and still define core system determinism.

### 11.2 Operational Recommendation

| Item | Value |
|------|-------|
| Final Decision Enum | `REVISE_PRD` |
| Decision Class | `NO_GO` |
| Owner for Follow-up | PM + QA + BE lead |
| Required Revisions | Lock normalization, collision precedence, sender-level send-point coordination, in-flight safe mode, health-state ownership, and queue runtime semantics before implementation |
| Suggested Delivery Strategy | Finalize decision gaps, then proceed with trace-first staged rollout plus sender-level queue proof-of-behavior in `whatsapp` service |
| Earliest Safe Next Step | PRD / technical design lock workshop focused on normalization, precedence, sender queue key + gap semantics, in-flight safe mode, and health-state ownership |

---

## 12. Traceability Matrix

PRD Requirement → Analysis Finding → Impact Area → Test Case ID → Status

| Req ID | Requirement | Finding | Impact Area | Test Case | Status |
|--------|-------------|---------|-------------|-----------|--------|
| FR-001 to FR-004 | Idempotency and duplicate suppression | Normalization rule still open | Backend / Worker | TC-WA-ABG-001, 002, 003 | Conditional |
| FR-005 to FR-007 | Recipient locking | Same-recipient collision still needs explicit precedence rule | Worker / Broadcast / Manual send | TC-WA-ABG-004, 017 | Conditional |
| FR-008 to FR-011 | Retry / reconciliation | Strong QA coverage exists | Reliability | TC-WA-ABG-005, 006, 007 | Covered |
| FR-014 to FR-020 | Protected manual resend guard and enforcement policy | Scope now clear, but normalization + precedence still blocking | UI / Policy / Validation | TC-WA-ABG-008 to 011, 015 | Covered with design lock required |
| FR-021 to FR-023 | Sender safe mode and eligibility | Signal owner and in-flight behavior still open | Sender health / Integration | TC-WA-ABG-012, 013, 019, 020 | Conditional |
| FR-024 to FR-025 | Duplicate investigation traceability | Investigation model is good, but depends on evidence completeness | Audit / Trace / Support | TC-WA-ABG-016, 018, 022 | Covered with rollout caution |
| FR-026 to FR-028 | Audit and support visibility | IT Support role clarified, dashboard visibility still depends on UI maturity | RBAC / Audit / Dashboard | TC-WA-ABG-016, 023, 024 | Covered with design clarification |
| FR-029 to FR-030 | Internal rollout / safe fallback | Internal config path is usable, but no tenant-facing settings page should be assumed | Internal config / API / rollout | TC-WA-ABG-014, 015 | Covered with scope clarification |
| Technical Design Addendum | Actual send-point sender serialization in `whatsapp` / Baileys | Business guardrail alone is insufficient if UI + broadcast still overlap at socket send point | `whatsapp` runtime / queue / anti-spam safety | Backend harness / queue unit tests (planned) | Conditional |

---

## 13. Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-10 | Initial promoted QA assessment created from final gap review | Hermes Agent |
| 2026-06-11 | Assessment synchronized to PRD v0.3, QA test spec v1.3, and automation mapping v1.3, including permission-based log access clarification | Hermes Agent |
| 2026-06-12 | Assessment updated with Baileys sender-level send-point coordination technical finding and queue-related design locks | Hermes Agent |
