# **Product Requirement Document (PRD)**

**Feature:** Account Channel Event Log for WhatsApp Web  
**Product Manager:** TBD  
**Engineering Lead:** TBD  
**Design Lead:** TBD  
**Contributors:** Engineering Team, QA Team, Design Team  
**Version:** v1.2

---

## **1. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.2 | 2026-06-02 | PRD Analysis | Closed v1.1 re-analysis gaps: Redis session fallback TTL and staleness recovery, CREATED idempotency key typo, Supervisor scope resolution failure mode, suspend event ordering, FAILED status dependency, `dedupWindowMs` semantics, and duplicate CONNECTED pre-emit dedup. |
| v1.1 | 2026-06-02 | PRD Analysis | Closed QA gaps: connection session architecture, event status semantics, dedup window, idempotency key format, Supervisor RBAC dependency, metadata whitelist, and global endpoint Phase 1 scope. |
| v1.0 | 2026-06-02 | PRD Analysis | Initial PRD based on Account Channel Event Log analysis. |

---

## **2. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide an immutable lifecycle event log for WhatsApp Web account channels so Admin and Supervisor can investigate account creation, initialization, QR scan, connection, disconnection, suspension, and active lifetime. |
| Scope | WhatsApp Web account channel lifecycle in Settings -> Channels -> WhatsApp Web. Covers per-account event timeline, lifetime summary, filtering, RBAC, and backend event capture. |
| Key Capabilities | Capture `CREATED`, `INIT`, `SCAN`, `CONNECTED`, `DISCONNECTED`, `SUSPENDED`; calculate lifetime from `CONNECTED` to `DISCONNECTED`; show timeline per account; store actor, reason, timestamp, session id, and safe metadata. |
| Outcome | Faster incident investigation, clearer account uptime visibility, better audit trail for channel operations, and fewer undocumented disconnect/suspend cases. |

---

## **3. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Admin can only see current account connection status, not lifecycle history. | Disconnect incidents are hard to investigate. |
| PS-002 | There is no historical reason for disconnected or suspended account channels. | Support and engineering cannot easily distinguish manual logout, timeout, conflict, banned number, or network loss. |
| PS-003 | Account active lifetime is not visible. | Operations cannot measure how long an account stayed connected before failure. |
| PS-004 | Account lifecycle events are not stored as an append-only audit trail. | Compliance and operational accountability are weak. |

---

## **4. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve account lifecycle visibility | 100 percent of supported lifecycle events are stored after feature activation. |
| Reduce time to investigate account disconnects | Admin can identify last disconnect time and reason in <= 30 seconds from account detail. |
| Provide reliable lifetime tracking | Completed connection sessions show duration with correct `CONNECTED` and `DISCONNECTED` pairing. |
| Preserve platform stability | Event logging must not block create, init, connect, disconnect, or suspend flows. |

---

## **5. Event Definitions**

| Event | Trigger | Actor | Description |
| ----- | ----- | ----- | ----- |
| `CREATED` | Account channel is successfully created. | User | First lifecycle event after account is added to SatuInbox. |
| `INIT` | WhatsApp instance initialization starts. | User or System | Connection process starts, but account may not be connected yet. |
| `SCAN` | QR is confirmed scanned or auth/pairing success signal is detected. | User or System | Must not be emitted only because QR was generated or refreshed. |
| `CONNECTED` | WhatsApp Web session is open and ready to send/receive messages. | System | Starts an active connection session and lifetime timer. |
| `DISCONNECTED` | WhatsApp Web session is closed or connection is lost. | User or System | Ends an active connection session and stores disconnect reason. |
| `SUSPENDED` | Account is blocked from use by Admin or system policy. | User or System | Requires confirmation whether suspend action already exists. |

`LIFETIME` is not an event. It is calculated from `CONNECTED` to `DISCONNECTED` using the same connection session.

---

## **6. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to see lifecycle history for a WhatsApp account so I can investigate connection issues. | 1. Given I open an account detail, When I open `Log Aktivitas`, Then I see events sorted by newest first. 2. Given the account has disconnect events, When the timeline renders, Then each disconnect shows timestamp and reason. 3. Given the account has no event, When I open the tab, Then I see an empty state instead of an error. |
| US-002 | P0 | As an Admin, I want the system to record account lifecycle events automatically. | 1. Given an account is created, When creation succeeds, Then one `CREATED` event is stored. 2. Given init starts, When `InitInstance` is called, Then one `INIT` event is stored. 3. Given Baileys opens a session, When connection state is open, Then one `CONNECTED` event is stored with a `connectionSessionId`. 4. Given Baileys closes a session, When connection state is close, Then one `DISCONNECTED` event is stored with reason and session id when available. |
| US-003 | P0 | As an Admin, I want to see how long an account stayed connected so I can measure uptime per session. | 1. Given a completed session, When the log shows `DISCONNECTED`, Then it displays lifetime from matching `CONNECTED` to `DISCONNECTED`. 2. Given an account is currently connected, When I view its summary, Then it shows `Aktif sejak X`. 3. Given an account has never connected, When I view lifetime, Then the UI shows `Belum pernah connected` or equivalent empty state. |
| US-004 | P1 | As an Admin, I want to filter account event logs so I can find specific incidents quickly. | 1. Given I select event type filters, When logs load, Then only matching event types appear. 2. Given I set a date range, When logs load, Then only events within the range appear. 3. Given filters return no data, When results render, Then the empty state explains no matching log was found. |
| US-005 | P0 | As a Supervisor, I want to view only account logs within my Team Inbox scope. | 1. Given I am a Supervisor, When I open an account within my scope, Then I can view its logs. 2. Given I open an account outside my scope, When the API is called, Then access is denied or no scoped data is returned. |
| US-006 | P0 | As an Agent, I must not access account channel event logs. | 1. Given I am an Agent, When I open WhatsApp Web settings, Then `Log Aktivitas` is not visible. 2. Given I call the event log endpoint directly, Then the API returns access denied. |
| US-007 | P0 | As Engineering, I need event logging to be idempotent and safe during reconnect loops. | 1. Given Baileys emits repeated close events within the dedup window, Then only one visible `DISCONNECTED` event is stored. 2. Given RabbitMQ retries the same event payload, Then the consumer does not create duplicate event logs. 3. Given reconnect happens quickly, Then event order is based on `occurredAt`, not consumer write time. |

---

## **7. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Event Capture | FR-001: System MUST record `CREATED` after successful account channel creation. FR-002: System MUST record `INIT` when WhatsApp instance initialization starts. FR-003: System MUST record `SCAN` only when QR scan or auth/pairing success is technically confirmed. FR-004: System MUST record `CONNECTED` when WhatsApp session is open. FR-005: System MUST record `DISCONNECTED` when WhatsApp session closes. FR-006: System MUST record `SUSPENDED` when account is suspended, if suspend action exists in scope. |
| Event Payload | FR-007: Each event MUST include `companyId`, `organizationId`, `accountChannelId`, `eventType`, `occurredAt`, `actorType`, and `sourceService`. FR-008: Events SHOULD include account name and phone number snapshots. FR-009: `CONNECTED` and `DISCONNECTED` MUST include `connectionSessionId` when available. FR-010: `DISCONNECTED` MUST include disconnect `reason` and sanitized `reasonDetail` when available. FR-011: Events MUST include `idempotencyKey` for duplicate prevention. |
| Lifetime | FR-012: System MUST calculate completed session lifetime from `CONNECTED` to matching `DISCONNECTED`. FR-013: System MUST calculate active lifetime from last `CONNECTED` to current time when no matching `DISCONNECTED` exists. FR-014: System SHOULD provide total lifetime by summing completed sessions in the queried range. |
| Timeline UI | FR-015: UI MUST show event timeline per account. FR-016: Timeline MUST sort by `occurredAt` descending. FR-017: Timeline MUST display event type, timestamp, actor, reason, and lifetime when relevant. FR-018: UI MUST support filtering by event type and date range. FR-019: UI MUST support pagination or load more. |
| Access Control | FR-020: Admin can view all account logs within their company/organization. FR-021: Supervisor can view only account logs in their Team Inbox scope, validated server-side via Team Inbox to account channel mapping from `channel-service` or `company-service`. FR-022: Agent cannot view logs and cannot access event log endpoints. FR-023: API MUST enforce RBAC and tenant scope server-side. |
| Reliability | FR-024: Event write MUST be async and must not block lifecycle operation. FR-025: Duplicate disconnect from reconnect loop MUST be deduplicated using default 5 seconds window, configurable via `ACCOUNT_CHANNEL_DISCONNECT_DEDUP_WINDOW_MS`. FR-026: Event consumer MUST be idempotent on retry. FR-027: QR refresh every 30 seconds MUST NOT create repeated `SCAN` logs. FR-031: Duplicate `CONNECTED` while an active session exists MUST be skipped before RMQ emit, not only deduplicated at storage. |
| Retention | FR-028: Retention policy MUST be confirmed before enabling TTL deletion. FR-029: If retention is approved, TTL MUST be configurable by environment or policy. |
| Metadata Safety | FR-030: System MUST persist only allowlisted metadata keys and strip any credential, token, QR payload, pairing code, raw session object, or stack trace before storage. |

---

## **8. UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Account Detail Log Tab | Tab or section named `Log Aktivitas` inside WhatsApp Web account detail/drawer. | User opens account row, selects `Log Aktivitas`, and sees timeline events. | US-001, US-003 |
| Timeline Event Item | Single event row showing event type, timestamp, actor, reason, and metadata summary when safe. | User scans latest event and expands details if available. | US-001 |
| Lifetime Badge | Badge or summary text showing active lifetime or latest completed lifetime. | For connected account show `Aktif sejak X`; for disconnected account show latest completed session duration. | US-003 |
| Filter Bar | Event type multi-select and date range filter. | User applies filters and timeline refreshes. | US-004 |
| Empty State | Empty state for no logs or no filter result. | User sees clear explanation and optional reset filter action. | US-001, US-004 |
| Permission State | Hide log tab for unauthorized roles. | Agent does not see event log entry point. | US-006 |

Recommended Phase 1 data fetching:

| Strategy | Decision |
| ----- | ----- |
| Fetch on tab open | Required. |
| Refetch while tab is open | Every 30 seconds is acceptable. |
| Invalidate on existing connection status socket update | Recommended if available. |
| Dedicated realtime event-log socket | Out of scope for Phase 1 unless required by PM. |

---

## **9. Field and Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| event_id | String | evt_123 | System generated. Unique. | Yes |
| company_id | String | cmp_123 | Must come from auth context. | Yes |
| organization_id | String | org_123 | Must come from auth context. | Yes |
| account_channel_id | String | acc_123 | Must reference account channel in tenant scope. | Yes |
| account_channel_name | String | CS Jakarta 01 | Snapshot at event time. | Yes |
| phone_number | String | +628123456789 | E.164 if available. | Optional |
| event_type | Enum | CONNECTED | Allowed: `CREATED`, `INIT`, `SCAN`, `CONNECTED`, `DISCONNECTED`, `SUSPENDED`. | Yes |
| event_status | Enum | SUCCESS | Phase 1 stores `SUCCESS` by default. `FAILED` is allowed only when the producer has an explicit lifecycle failure signal. Deduped/skipped events are not persisted as event logs. | Yes |
| occurred_at | Timestamp | 2026-06-02T09:14:00+07:00 | Timestamp from producer, not consumer. | Yes |
| actor_type | Enum | system | Allowed: `user`, `system`. | Yes |
| actor_user_id | String | usr_123 | Required only for user-triggered event when available. | Optional |
| connection_session_id | String | sess_abc | Required for paired connected/disconnected session when available. | Conditional |
| reason | Enum | TIMEOUT | Required for `DISCONNECTED` when known. | Conditional |
| reason_detail | String | Connection timed out | Sanitized. Must not contain credentials, tokens, keys, stack trace. | Optional |
| duration_ms | Number | 123000 | Stored on `DISCONNECTED` when paired session exists. | Optional |
| source_service | Enum | whatsapp-service | Allowed: `channel-service`, `whatsapp-service`, `system`. | Yes |
| idempotency_key | String | acc_123:CONNECTED:sess_abc | Unique per event write. See Section 9.2. | Yes |
| metadata | Object | `{ trigger: "auto_restore" }` | Allowlisted safe metadata only. See Section 9.4. | Optional |

### **9.1 Connection Session Architecture**

`connectionSessionId` MUST be generated and owned by `whatsapp-service` because `whatsapp-service` is the source of truth for Baileys connection lifecycle.

| Step | Rule |
| ----- | ----- |
| `CONNECTED` event | When Baileys emits `connection = open` and no active session exists, `whatsapp-service` generates a UUID `connectionSessionId`. |
| Active session storage | `whatsapp-service` stores `{ connectionSessionId, connectedAt }` in Redis key `evt:session:{accountChannelId}`. |
| Session key TTL | Session key TTL MUST be configurable via `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS`. Default value is 7 days (`604800000` ms) as a practical stale-key fallback independent from audit log retention policy. The key MUST also be deleted on normal disconnect/delete. |
| Duplicate `CONNECTED` | If `evt:session:{accountChannelId}` exists and is not stale, system MUST skip creating a new session and MUST skip emitting duplicate `CONNECTED` to RabbitMQ. |
| Stale session recovery | If `evt:session:{accountChannelId}` is older than `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS` or otherwise fails active-session validation, system MUST treat it as stale, emit an orphan `DISCONNECTED` for the stale session with `metadata.orphan = true`, delete the stale key, then create a new session for the incoming `CONNECTED`. |
| `DISCONNECTED` event | `whatsapp-service` reads `evt:session:{accountChannelId}`, reuses the same `connectionSessionId`, calculates `duration_ms = disconnectedAt - connectedAt`, emits `DISCONNECTED`, then deletes the Redis session key. |
| Missing session key | If Redis session key is missing, emit `DISCONNECTED` as orphan with `metadata.orphan = true`, no `duration_ms`, and no blocking error. |
| Auto-restore | Auto-restore emits `CONNECTED` with `actor_type = system` and `metadata.trigger = auto_restore`. |
| Suspend while connected | If a connected account is suspended, system MUST close the active session first and emit `DISCONNECTED` with `reason = AUTO_SUSPEND`, then emit `SUSPENDED`. `duration_ms` is calculated from `CONNECTED` to this `DISCONNECTED`, not to `SUSPENDED`. |

### **9.2 Idempotency Key Format**

Every emitted event MUST include deterministic `idempotency_key` so RabbitMQ retries do not duplicate event logs.

| Event | Format |
| ----- | ----- |
| `CREATED` | `{accountChannelId}:CREATED:{occurredAtUnixMs}` |
| `INIT` | `{accountChannelId}:INIT:{requestId\|occurredAtUnixMs}` |
| `SCAN` | `{accountChannelId}:SCAN:{connectionAttemptId\|occurredAtUnixMs}` |
| `CONNECTED` | `{accountChannelId}:CONNECTED:{connectionSessionId}` |
| `DISCONNECTED` | `{accountChannelId}:DISCONNECTED:{connectionSessionId\|occurredAtUnixMs}` |
| `SUSPENDED` | `{accountChannelId}:SUSPENDED:{requestId\|occurredAtUnixMs}` |

`requestId` or `connectionAttemptId` SHOULD be used when available. `occurredAtUnixMs` is the fallback for events without a request identifier.

### **9.3 Event Status Semantics**

| Status | Phase 1 Behavior |
| ----- | ----- |
| `SUCCESS` | Default status for lifecycle events that actually occurred and were stored. |
| `FAILED` | Reserved for explicit lifecycle failure signals only, such as confirmed scan/auth failure if backend can detect it. Do not infer failure from missing next event. In Phase 1, `FAILED` for `SCAN` is emitted only if OQ-003 confirms a reliable Baileys scan/auth failure signal. |
| `SKIPPED` | Not persisted in Phase 1. Deduped events are counted in observability metrics, not stored as event logs. |

### **9.4 Metadata Whitelist**

Only the following metadata keys may be stored:

| Key | Allowed Values / Notes |
| ----- | ----- |
| `trigger` | `manual`, `auto_restore`, `reconnect`, `policy` |
| `connectionMethod` | `qr`, `pairing_code`, `credential_restore` |
| `slotIndex` | Numeric slot index if multi-slot is available |
| `library` | Example: `baileys` |
| `libraryVersion` | Connector library version |
| `reasonCode` | Sanitized disconnect code |
| `orphan` | Boolean for orphan `DISCONNECTED` without active session |
| `dedupWindowMs` | Optional. Store only on `DISCONNECTED` events where the producer evaluated disconnect deduplication. Do not fill on unrelated event types. |

The consumer MUST strip all other keys before saving. Metadata MUST NOT include credentials, tokens, QR payload, pairing code, raw Baileys auth state, raw session object, or stack trace.

---

## **10. Error Handling**

| Code | Scenario | Handling | User Message |
| ----- | ----- | ----- | ----- |
| 403-ACEL01 | Agent accesses event log endpoint. | Deny request. Log security event if needed. | `Akses ditolak.` |
| 403-ACEL02 | Supervisor accesses account outside scope. | Deny request or return no scoped result based on API convention. | `Akses ditolak.` |
| 404-ACEL03 | Account channel not found. | Return not found. Do not reveal cross-tenant existence. | `Akun tidak ditemukan.` |
| 400-ACEL04 | Invalid date range. | Block query and show validation message. | `Rentang tanggal tidak valid.` |
| 400-ACEL05 | Invalid event type filter. | Ignore invalid value or reject request based on API convention. | `Tipe event tidak valid.` |
| 500-ACEL06 | Event log query failed. | Show retry state. | `Gagal memuat log aktivitas. Coba lagi.` |
| 500-ACEL07 | Lifetime summary failed. | Hide lifetime summary and keep timeline usable. | `Gagal memuat durasi aktif.` |
| 202-ACEL08 | Event emit failed but lifecycle action succeeded. | Do not fail main operation; log internal error for retry/monitoring. | No user-facing error unless operation itself fails. |
| 503-ACEL09 | Supervisor team scope resolution dependency unavailable. | Fail closed. Do not query audit logs. Return service unavailable and allow retry. API Gateway MAY use cached scope for up to 5 minutes if cache is fresh and tenant-scoped. | `Gagal memvalidasi akses tim. Coba lagi.` |

---

## **11. Edge Cases**

| ID | Case | Handling |
| ----- | ----- | ----- |
| EC-001 | QR is generated or refreshed every 30 seconds. | Do not create `SCAN` event. Only `INIT` is logged unless scan/auth success is confirmed. |
| EC-002 | QR is generated but never scanned. | Timeline shows `INIT` only. Lifetime remains empty. |
| EC-003 | QR is scanned but connection fails before open. | Log `SCAN` only if scan is confirmed. Do not log `CONNECTED`. Optionally record failed status if backend has reliable signal. |
| EC-004 | Auto-restore connects account after service restart. | Log `CONNECTED` with `actorType = system` and `metadata.trigger = auto_restore`. |
| EC-005 | Baileys emits repeated close events. | Deduplicate repeated `DISCONNECTED` within the configured window. |
| EC-006 | Account has multiple connect/disconnect cycles. | Show each completed session and calculate total lifetime if requested. |
| EC-007 | Account has `DISCONNECTED` without known `CONNECTED`. | Store as orphan debug event only if useful. Mark metadata as orphan. |
| EC-008 | Account is suspended while connected. | Close the active session first, emit `DISCONNECTED` with `reason = AUTO_SUSPEND`, calculate `duration_ms`, then emit `SUSPENDED`. |
| EC-009 | Event consumer retries after crash. | Idempotency key prevents duplicate event log. |
| EC-010 | Retention TTL removes old connected event but disconnected event remains. | Lifetime query must handle missing pair gracefully. Retention policy must consider this risk before activation. |

---

## **12. Non-Functional Requirements**

| Attribute | Target |
| ----- | ----- |
| Performance | Event log query p95 <= 500 ms for one account with limit 50 and indexed filters. |
| Reliability | Event logging is async and does not block lifecycle actions. Consumer is idempotent. |
| Scalability | Support high account count tenants through pagination and indexed queries. |
| Security | Strict tenant scope and RBAC. No sensitive credentials or raw session payload in event logs. |
| Observability | Monitor queue depth, consumer error rate, write latency, duplicate skipped count, API latency, and Supervisor scope-resolution failures. Dedup skips SHOULD increment a metric counter such as `account_channel_event_log_dedup_skipped_total`. |
| Accessibility | Timeline icons must have labels, filter and pagination must be keyboard navigable. |
| Retention | Configurable retention. TTL must not be enabled before PM/Legal approval. |

---

## **13. Dependencies and Risks**

| Type | Item | Risk | Mitigation |
| ----- | ----- | ----- | ----- |
| Internal | `audit-service` | Existing audit requirements may conflict with 90-day TTL. | Confirm retention policy before enabling TTL. |
| Internal | `whatsapp` service connection handler | Changes may affect critical reconnect/auto-restore flow. | Add only async emit, use feature flag, test with Baileys mock/simulator. |
| Internal | `channel-service` suspend action | `SUSPENDED` may not exist yet. | Confirm before sprint; if absent, treat as additional backend scope. |
| Internal | RabbitMQ | Consumer retry may duplicate events. | Use `idempotencyKey` and unique index. |
| Internal | Redis | Dedup key collision or missing namespace. | Use dedicated namespace such as `evt:disconnected:{accountChannelId}`. |
| Internal | Redis active session key | Missing, stale, or expired session key can break deterministic lifetime pairing or block future `CONNECTED`. | Store `evt:session:{accountChannelId}` on `CONNECTED`, default TTL 7 days, delete on `DISCONNECTED`, and run stale-session recovery before new `CONNECTED` emit. |
| Internal | Team Inbox to account mapping | Supervisor scope validation requires knowing whether an account channel belongs to Supervisor's Team Inbox scope. | API Gateway must validate against `channel-service` or `company-service` before querying audit logs. If dependency is unavailable, fail closed with 503 or use fresh tenant-scoped cache for max 5 minutes. |
| Product | `SCAN` timing | Baileys may not expose exact scan event. | Use auth/pairing success signal if available; otherwise fallback to `CONNECTED` metadata or revise event name. |
| Security | Raw error detail exposure | Baileys error may contain internal or sensitive info. | Sanitize `reasonDetail` before save. |
| Security | Metadata exposure | Free-form metadata can accidentally store sensitive session data. | Enforce metadata whitelist from Section 9.4 in audit-service consumer. |

---

## **14. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Lifecycle event capture completeness | >= 99 percent of supported events after feature flag enabled | First 30 days | Audit event log count vs producer metrics |
| Event log query latency | p95 <= 500 ms | Ongoing | API metrics |
| Duplicate disconnect suppression | Duplicate visible disconnects reduced by >= 90 percent during reconnect loops | First 30 days | Dedup skipped count and event logs |
| Disconnect investigation time | Admin finds last disconnect reason in <= 30 seconds | UAT and post-release sample | Product/UX test |
| Event consumer success rate | >= 99 percent | Ongoing | Audit-service metrics |

---

## **15. Rollout and Production Safety**

Use feature flag:

```text
ENABLE_ACCOUNT_CHANNEL_EVENT_LOG=false
```

| Step | Action |
| ----- | ----- |
| 1 | Deploy audit-service schema, consumer, and indexes. |
| 2 | Deploy API Gateway endpoints and RBAC guard. |
| 3 | Deploy FE log tab behind permission and feature flag. |
| 4 | Deploy channel-service and whatsapp-service producers with flag off. |
| 5 | Enable flag in staging and run smoke/regression tests. |
| 6 | Enable flag in production for limited tenant if supported. |
| 7 | Monitor RabbitMQ queue depth, consumer errors, write latency, and API latency. |

Rollback:

| Action | Result |
| ----- | ----- |
| Disable feature flag | Stop new event emission. |
| Hide FE tab | Remove user-facing surface. |
| Stop audit consumer | Main account channel flow remains unaffected. |
| Revert producer deployment | No existing data migration required. |

---

## **16. Future Considerations**

| Idea | Benefit |
| ----- | ----- |
| Global event log page for all accounts | Easier incident investigation across fleets. |
| Export CSV/XLSX | Compliance and support handover. |
| Notification on disconnect/suspend | Faster operational reaction to outages. |
| Uptime analytics dashboard | Fleet reliability reporting. |
| Dedicated realtime Socket.IO event for timeline | Faster UI updates without polling. |
| Support non-WhatsApp channels | Unified channel lifecycle audit. |

---

## **17. Limitations**

| Limitation | Impact | Workaround |
| ----- | ----- | ----- |
| No backfill for old lifecycle events | Timeline starts after feature activation. | Display empty state for older accounts. |
| `SCAN` depends on available Baileys signal | May be unavailable or approximated. | Use `CONNECTED` metadata fallback or revise taxonomy. |
| Export excluded from Phase 1 | Users cannot download logs initially. | Add Phase 2 export if PM approves. |
| Notification excluded from Phase 1 | Admin must check UI manually. | Add Phase 2 notification-service integration. |
| Retention not finalized | TTL cannot be safely enabled. | Keep retention configurable and disabled until approved. |
| Global event log endpoint excluded from Phase 1 | Users can only view logs per account, not across all accounts. | Add `GET /api/account-channels/event-logs` and global UI in Phase 2 if approved. |

---

## **18. Open Questions**

| ID | Question | Impact | Owner |
| ----- | ----- | ----- | ----- |
| OQ-001 | Does `suspendAccountChannel` already exist? | Determines whether `SUSPENDED` is event-only or requires new action. | Engineering |
| OQ-002 | What is the final retention policy? | Determines TTL and compliance behavior. | PM / Legal |
| OQ-003 | What exact Baileys signal proves QR was scanned? | Determines correctness of `SCAN`. | Engineering |
| OQ-004 | Should lifetime display per-session, total, or both? | Affects UI and API response. | PM |
| OQ-005 | Is export CSV/XLSX required in Phase 1? | Adds endpoint and FE effort. | PM |
| OQ-006 | Should `DISCONNECTED` or `SUSPENDED` trigger notifications? | Adds notification-service dependency. | PM |
| OQ-007 | Should event taxonomy be generic for future channels? | Affects schema naming and service ownership. | PM / Engineering |
| OQ-008 | Should `SCAN` become `PAIRED` when Pairing Code exists? | Affects future enum design. | PM / Engineering |

---

## **19. Appendix**

### **19.1 Connection Session Pairing Rules**

| Rule | Expected Behavior |
| ----- | ----- |
| New `CONNECTED` with no active session | Generate new `connectionSessionId`. |
| Duplicate `CONNECTED` while active | Do not create a new session unless prior session is closed. |
| `DISCONNECTED` with active session | Use active `connectionSessionId` and calculate `durationMs`. |
| `DISCONNECTED` without active session | Store as orphan only if useful for debugging. |
| Auto-restore | Store `CONNECTED` with `actorType = system` and `metadata.trigger = auto_restore`. |

### **19.2 Disconnect Reason Enum**

| Reason | Meaning |
| ----- | ----- |
| `LOGOUT_MANUAL` | Admin/user manually logs out or stops session. |
| `TIMEOUT` | Session timed out. |
| `CONFLICT` | WhatsApp session conflict or logged in elsewhere. |
| `BANNED` | WhatsApp number is banned or blocked by provider. |
| `CONNECTION_LOST` | Network or transport issue. |
| `AUTO_SUSPEND` | System policy suspended account automatically. |
| `UNKNOWN` | Reason cannot be mapped. |

### **19.3 Smoke Test Checklist**

| Step | Expected Result |
| ----- | ----- |
| Create account | `CREATED` event appears. |
| Init connection | `INIT` event appears. |
| Scan/connect account | `SCAN` appears only if confirmed; `CONNECTED` appears when session opens. |
| Disconnect/logout | `DISCONNECTED` appears with reason and lifetime. |
| Query timeline | REST endpoint returns 200 with paginated data. |
| Agent access | API returns access denied and UI hides tab. |
