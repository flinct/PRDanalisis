# Automation Mapping - WhatsApp Web Outbound Anti-Ban Guard

> **Artifact Type:** Automation Mapping  
> **Source PRD:** `PRD/Whatsapp web v2/PRD WA Web Outbound Anti-Ban Guard.md`  
> **Artifact Path:** `Test/whatsapp-web/wa-outbound-anti-ban-automation-mapping.md`  
> **Companion Artifact:** `Test/whatsapp-web/wa-outbound-anti-ban-qa-test-spec.md`  
> **Version:** `v1.1`  
> **Status:** Reviewed — candidate mapping synchronized with QA test spec automation fields

---
## Recommendation

Automation in `sixV2Automation` is best focused on stable UI/E2E coverage. Concurrency, worker crash, reconciliation, degraded dependency, and performance cases should stay in backend or integration harnesses.

## Proposed Playwright Spec Split

| Proposed File | Main Scope | Suggested Page Objects |
| ----- | ----- | ----- |
| `playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js` | Manual room send duplicate, warning, cooldown, safe normal path | `AuthPage`, `InboxPage` |
| `playwright/tests/e2e/conversation/wa-outbound-anti-ban-broadcast.spec.js` | Broadcast overlap dedupe and rollout-safe broadcast checks | `AuthPage`, `BroadcastPage`, optionally `InboxPage` |
| `playwright/tests/e2e/conversation/wa-outbound-anti-ban-settings.spec.js` | Anti-ban settings validation and monitor-only rollout | `AuthPage`, `AccountWhatsappPage` |
| `playwright/tests/e2e/rbac/wa-outbound-anti-ban-rbac.spec.js` | Audit visibility, masking, tenant isolation, role access | `AuthPage`, `AccountWhatsappPage` |
| `playwright/tests/e2e/conversation/wa-outbound-anti-ban-account-guard.spec.js` | Sender eligibility, stickiness, and failover if fixture support exists | `AuthPage`, `InboxPage`, `AccountWhatsappPage` |

## Candidate Matrix

| TC-ID | Scenario | Candidate for sixV2Automation | Proposed Target | Page Objects | Status | Notes |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| TC-WA-ABG-001 | Manual duplicate via double click | Yes | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js | AuthPage, InboxPage | Ready | Deterministic UI flow; good Playwright candidate |
| TC-WA-ABG-002 | Manual duplicate from two tabs | Yes | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js | AuthPage, InboxPage | Ready | Parallel pages in one test |
| TC-WA-ABG-003 | Broadcast overlap dedupe | Conditional | playwright/tests/e2e/conversation/wa-outbound-anti-ban-broadcast.spec.js | AuthPage, BroadcastPage | Pending | Needs stable broadcast audience fixture with overlap |
| TC-WA-ABG-004 | Recipient-level locking | No | N/A | N/A | Manual / Backend Harness | Needs worker-level race injection; not Playwright-first |
| TC-WA-ABG-005 | Reconciliation pending | No | N/A | N/A | Manual / Backend Harness | Needs downstream timeout injection |
| TC-WA-ABG-006 | Reconciliation confirms sent | No | N/A | N/A | Manual / Backend Harness | Better as API/integration test |
| TC-WA-ABG-007 | Reconciliation confirms failed | No | N/A | N/A | Manual / Backend Harness | Better as API/integration test |
| TC-WA-ABG-008 | Paste-heavy warning mode | Conditional | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js | AuthPage, InboxPage | Pending | Needs paste event instrumentation and stable thresholds |
| TC-WA-ABG-009 | Paste-heavy strict mode | Conditional | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js | AuthPage, InboxPage | Pending | Possible if policy UI + thresholds are testable |
| TC-WA-ABG-010 | Cooldown enforcement | Conditional | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js | AuthPage, InboxPage | Pending | Depends on deterministic cooldown trigger |
| TC-WA-ABG-011 | Safe normal send path | Yes | playwright/tests/e2e/conversation/wa-outbound-anti-ban-manual.spec.js | AuthPage, InboxPage | Ready | High-value regression candidate |
| TC-WA-ABG-012 | Sender safe mode on restriction | No | N/A | N/A | Manual / Backend Harness | Needs account-state event injection |
| TC-WA-ABG-013 | Sender ineligible by outbound limit | Conditional | playwright/tests/e2e/conversation/wa-outbound-anti-ban-account-guard.spec.js | AuthPage, AccountWhatsappPage, InboxPage | Pending | Candidate if sender eligibility can be arranged by fixture |
| TC-WA-ABG-014 | Invalid config safe fallback | Yes | playwright/tests/e2e/conversation/wa-outbound-anti-ban-settings.spec.js | AuthPage, AccountWhatsappPage | Ready | UI/API setting validation candidate |
| TC-WA-ABG-015 | Monitor-only mode | Yes | playwright/tests/e2e/conversation/wa-outbound-anti-ban-settings.spec.js | AuthPage, AccountWhatsappPage, InboxPage | Ready | Good rollout regression candidate |
| TC-WA-ABG-016 | Audit log visibility and masking | Conditional | playwright/tests/e2e/rbac/wa-outbound-anti-ban-rbac.spec.js | AuthPage, AccountWhatsappPage | Pending | Assumes anti-ban log UI exists |
| TC-WA-ABG-017 | Stale lock recovery | No | N/A | N/A | Manual / Backend Harness | Worker crash / TTL recovery not suited to Playwright |
| TC-WA-ABG-018 | Multipart partial-stop | No | N/A | N/A | Manual / Backend Harness | Needs multi-part logical send failure injection |
| TC-WA-ABG-019 | Sender stickiness healthy session | Conditional | playwright/tests/e2e/conversation/wa-outbound-anti-ban-account-guard.spec.js | AuthPage, InboxPage | Pending | Needs sender attribution visible and stable setup |
| TC-WA-ABG-020 | Failover only on ineligibility | Conditional | playwright/tests/e2e/conversation/wa-outbound-anti-ban-account-guard.spec.js | AuthPage, AccountWhatsappPage, InboxPage | Pending | Needs deterministic failover fixture |
| TC-WA-ABG-021 | Validation performance | No | N/A | N/A | Not for Playwright | Use API/performance tool |
| TC-WA-ABG-022 | Safe degradation on audit failure | No | N/A | N/A | Manual / Backend Harness | Needs dependency failure injection |
| TC-WA-ABG-023 | RBAC masking and Bahasa UX | Yes | playwright/tests/e2e/rbac/wa-outbound-anti-ban-rbac.spec.js | AuthPage, AccountWhatsappPage | Ready | Strong UI/RBAC localization candidate |
| TC-WA-ABG-024 | Cross-tenant isolation | Conditional | playwright/tests/e2e/rbac/wa-outbound-anti-ban-rbac.spec.js | AuthPage, AccountWhatsappPage | Pending | Needs two-tenant fixture in automation env |

## Summary

- **Ready now in Playwright:** 6 cases (`001, 002, 011, 014, 015, 023`).
- **Near-ready / conditional UI automation:** 1 case (`016`) if anti-ban log UI exists immediately, plus 8 additional pending cases that still need deterministic fixtures or UI surface.
- **Not suitable for sixV2Automation alone:** 9 backend-heavy cases covering concurrency, retry, reconciliation, resilience, and performance.


## Alignment Notes

- QA test spec automation fields now mirror this mapping file.
- Manual TSV remains the execution artifact and intentionally does not carry automation metadata.
- Playwright-ready coverage is limited to deterministic UI/E2E cases; backend-heavy cases stay outside sixV2Automation.
