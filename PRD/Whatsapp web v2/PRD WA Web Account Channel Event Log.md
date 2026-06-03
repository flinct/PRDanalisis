# **Product Requirement Document (PRD)**

**Feature:** Account Channel Event Log for WhatsApp Web  
**Product Manager:** TBD  
**Engineering Lead:** TBD  
**Design Lead:** TBD  
**Contributors:** Engineering Team, QA Team, Design Team  
**Version:** v1.5

---

## **1. Revision History**

| Version | Date       | Author       | Changes                                                                                                                                                                                                                                                                       |
| ------- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.5    | 2026-06-02 | PRD Analysis | Added Redash `Whatsapp Session` dashboard compatibility requirements, analytics projection fields, terminal/transient disconnect classification, and dashboard support test cases.                                                                                            |
| v1.4    | 2026-06-02 | PRD Analysis | Added explicit QA test cases mapped to event capture, lifetime/session, RBAC, edge cases, concurrency, regression, and smoke coverage.                                                                                                                                        |
| v1.3    | 2026-06-02 | PRD Analysis | Added `RE_INIT` event coverage, resolved lifetime scope as per-session until `DISCONNECTED`, updated event taxonomy, FRs, session rules, idempotency format, edge cases, metrics, open questions, and appendix.                                                               |
| v1.2    | 2026-06-02 | PRD Analysis | Closed v1.1 re-analysis gaps: Redis session fallback TTL and staleness recovery, CREATED idempotency key typo, Supervisor scope resolution failure mode, suspend event ordering, FAILED status dependency, `dedupWindowMs` semantics, and duplicate CONNECTED pre-emit dedup. |
| v1.1    | 2026-06-02 | PRD Analysis | Closed QA gaps: connection session architecture, event status semantics, dedup window, idempotency key format, Supervisor RBAC dependency, metadata whitelist, and global endpoint Phase 1 scope.                                                                             |
| v1.0    | 2026-06-02 | PRD Analysis | Initial PRD based on Account Channel Event Log analysis.                                                                                                                                                                                                                      |

---

## **2. Overview**

| Item             | Description                                                                                                                                                                                                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose          | Provide an immutable lifecycle event log for WhatsApp Web account channels so Admin and Supervisor can investigate account creation, initialization, QR scan, connection, disconnection, suspension, and active lifetime.                            |
| Scope            | WhatsApp Web account channel lifecycle in Settings -> Channels -> WhatsApp Web. Covers per-account event timeline, lifetime summary, filtering, RBAC, and backend event capture.                                                                     |
| Key Capabilities | Capture `CREATED`, `INIT`, `RE_INIT`, `SCAN`, `CONNECTED`, `DISCONNECTED`, `SUSPENDED`; calculate per-session lifetime from `CONNECTED` to `DISCONNECTED`; show timeline per account; store actor, reason, timestamp, session id, and safe metadata. |
| Outcome          | Faster incident investigation, clearer account uptime visibility, better audit trail for channel operations, and fewer undocumented disconnect/suspend cases.                                                                                        |

---

## **3. Problem Statement**

| ID     | Problem                                                                       | Impact                                                                                                              |
| ------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| PS-001 | Admin can only see current account connection status, not lifecycle history.  | Disconnect incidents are hard to investigate.                                                                       |
| PS-002 | There is no historical reason for disconnected or suspended account channels. | Support and engineering cannot easily distinguish manual logout, timeout, conflict, banned number, or network loss. |
| PS-003 | Account active lifetime is not visible.                                       | Operations cannot measure how long an account stayed connected before failure.                                      |
| PS-004 | Account lifecycle events are not stored as an append-only audit trail.        | Compliance and operational accountability are weak.                                                                 |

---

## **4. Objectives and Key Results**

| Objective                                      | Key Result                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Improve account lifecycle visibility           | 100 percent of supported lifecycle events are stored after feature activation.                   |
| Reduce time to investigate account disconnects | Admin can identify last disconnect time and reason in <= 30 seconds from account detail.         |
| Provide reliable lifetime tracking             | Completed connection sessions show duration with correct `CONNECTED` and `DISCONNECTED` pairing. |
| Preserve platform stability                    | Event logging must not block create, init, connect, disconnect, or suspend flows.                |

---

## **5. Event Definitions**

| Event          | Trigger                                                                                                                                 | Actor          | Description                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CREATED`      | Account channel is successfully created.                                                                                                | User           | First lifecycle event after account is added to SatuInbox.                                                                                        |
| `INIT`         | WhatsApp instance initialization starts.                                                                                                | User or System | Connection process starts, but account may not be connected yet.                                                                                  |
| `RE_INIT`      | Account has stored credentials/session data, but current session is not ready. System or Admin starts restore using stored credentials. | User or System | Different from `INIT`: no QR or pairing required. If restore succeeds, next event is `CONNECTED`; if restore fails, next event is `DISCONNECTED`. |
| `SCAN`         | QR is confirmed scanned or auth/pairing success signal is detected.                                                                     | User or System | Must not be emitted only because QR was generated or refreshed.                                                                                   |
| `CONNECTED`    | WhatsApp Web session is open and ready to send/receive messages.                                                                        | System         | Starts an active connection session and lifetime timer.                                                                                           |
| `DISCONNECTED` | WhatsApp Web session is closed or connection is lost.                                                                                   | User or System | Ends an active connection session and stores disconnect reason.                                                                                   |
| `SUSPENDED`    | Account is blocked from use by Admin or system policy.                                                                                  | User or System | Requires confirmation whether suspend action already exists.                                                                                      |

`LIFETIME` is not an event. Phase 1 lifetime is per-session only: start at `CONNECTED`, end at `DISCONNECTED` for the same connection session. `DISCONNECTED` includes normal disconnect and suspend-driven disconnect with reason `AUTO_SUSPEND`.

---

## **6. User Stories and Acceptance Criteria**

| ID     | Priority | User Story                                                                                                  | Acceptance Criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | -------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-001 | P0       | As an Admin, I want to see lifecycle history for a WhatsApp account so I can investigate connection issues. | 1. Given I open an account detail, When I open `Log Aktivitas`, Then I see events sorted by newest first. 2. Given the account has disconnect events, When the timeline renders, Then each disconnect shows timestamp and reason. 3. Given the account has no event, When I open the tab, Then I see an empty state instead of an error.                                                                                                                                    |
| US-002 | P0       | As an Admin, I want the system to record account lifecycle events automatically.                            | 1. Given an account is created, When creation succeeds, Then one `CREATED` event is stored. 2. Given init starts, When `InitInstance` is called, Then one `INIT` event is stored. 3. Given Baileys opens a session, When connection state is open, Then one `CONNECTED` event is stored with a `connectionSessionId`. 4. Given Baileys closes a session, When connection state is close, Then one `DISCONNECTED` event is stored with reason and session id when available. |
| US-003 | P0       | As an Admin, I want to see how long an account stayed connected so I can measure uptime per session.        | 1. Given a completed session, When the log shows `DISCONNECTED`, Then it displays lifetime from matching `CONNECTED` to `DISCONNECTED`. 2. Given an account is currently connected, When I view its summary, Then it shows `Aktif sejak X`. 3. Given an account has never connected, When I view lifetime, Then the UI shows `Belum pernah connected` or equivalent empty state.                                                                                            |
| US-004 | P1       | As an Admin, I want to filter account event logs so I can find specific incidents quickly.                  | 1. Given I select event type filters, When logs load, Then only matching event types appear. 2. Given I set a date range, When logs load, Then only events within the range appear. 3. Given filters return no data, When results render, Then the empty state explains no matching log was found.                                                                                                                                                                          |
| US-005 | P0       | As a Supervisor, I want to view only account logs within my Team Inbox scope.                               | 1. Given I am a Supervisor, When I open an account within my scope, Then I can view its logs. 2. Given I open an account outside my scope, When the API is called, Then access is denied or no scoped data is returned.                                                                                                                                                                                                                                                     |
| US-006 | P0       | As an Agent, I must not access account channel event logs.                                                  | 1. Given I am an Agent, When I open WhatsApp Web settings, Then `Log Aktivitas` is not visible. 2. Given I call the event log endpoint directly, Then the API returns access denied.                                                                                                                                                                                                                                                                                        |
| US-007 | P0       | As Engineering, I need event logging to be idempotent and safe during reconnect loops.                      | 1. Given Baileys emits repeated close events within the dedup window, Then only one visible `DISCONNECTED` event is stored. 2. Given RabbitMQ retries the same event payload, Then the consumer does not create duplicate event logs. 3. Given reconnect happens quickly, Then event order is based on `occurredAt`, not consumer write time.                                                                                                                               |

---

## **7. Functional Requirements**

| Category        | Requirements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event Capture   | FR-001: System MUST record `CREATED` after successful account channel creation. FR-002: System MUST record `INIT` when WhatsApp instance initialization starts for fresh setup or QR/pairing flow. FR-003: System MUST record `SCAN` only when QR scan or auth/pairing success is technically confirmed. FR-004: System MUST record `CONNECTED` when WhatsApp session is open. FR-005: System MUST record `DISCONNECTED` when WhatsApp session closes. FR-006: System MUST record `SUSPENDED` when account is suspended, if suspend action exists in scope. FR-032: System MUST record `RE_INIT` when a restore attempt starts using existing stored credentials/session data and no QR or pairing is required. |
| Event Payload   | FR-007: Each event MUST include `companyId`, `organizationId`, `accountChannelId`, `eventType`, `occurredAt`, `actorType`, and `sourceService`. FR-008: Events SHOULD include account name and phone number snapshots. FR-009: `CONNECTED` and `DISCONNECTED` MUST include `connectionSessionId` when available. FR-010: `DISCONNECTED` MUST include disconnect `reason` and sanitized `reasonDetail` when available. FR-011: Events MUST include `idempotencyKey` for duplicate prevention.                                                                                                                                                                                                                    |
| Lifetime        | FR-012: System MUST calculate completed session lifetime from `CONNECTED` to matching `DISCONNECTED`. FR-013: System MUST calculate active lifetime from last `CONNECTED` to current time when no matching `DISCONNECTED` exists. FR-014: Total lifetime across sessions is out of scope for Phase 1 and MAY be added in future analytics.                                                                                                                                                                                                                                                                                                                                                                      |
| Timeline UI     | FR-015: UI MUST show event timeline per account. FR-016: Timeline MUST sort by `occurredAt` descending. FR-017: Timeline MUST display event type, timestamp, actor, reason, and lifetime when relevant. FR-018: UI MUST support filtering by event type and date range. FR-019: UI MUST support pagination or load more.                                                                                                                                                                                                                                                                                                                                                                                        |
| Access Control  | FR-020: Admin can view all account logs within their company/organization. FR-021: Supervisor can view only account logs in their Team Inbox scope, validated server-side via Team Inbox to account channel mapping from `channel-service` or `company-service`. FR-022: Agent cannot view logs and cannot access event log endpoints. FR-023: API MUST enforce RBAC and tenant scope server-side.                                                                                                                                                                                                                                                                                                              |
| Reliability     | FR-024: Event write MUST be async and must not block lifecycle operation. FR-025: Duplicate disconnect from reconnect loop MUST be deduplicated using default 5 seconds window, configurable via `ACCOUNT_CHANNEL_DISCONNECT_DEDUP_WINDOW_MS`. FR-026: Event consumer MUST be idempotent on retry. FR-027: QR refresh every 30 seconds MUST NOT create repeated `SCAN` logs. `RE_INIT` flow MUST NOT emit `SCAN` because no QR or pairing occurs. FR-031: Duplicate `CONNECTED` while an active session exists MUST be skipped before RMQ emit, not only deduplicated at storage.                                                                                                                               |
| Retention       | FR-028: Retention policy MUST be confirmed before enabling TTL deletion. FR-029: If retention is approved, TTL MUST be configurable by environment or policy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Metadata Safety | FR-030: System MUST persist only allowlisted metadata keys and strip any credential, token, QR payload, pairing code, raw session object, or stack trace before storage.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Analytics and Redash Support | FR-033: Event data MUST support the existing Redash dashboard `Whatsapp Session`, including active sessions, average session age, daily login/logout trend, terminal logout rate, transient disconnect rate, logout reason breakdown, top disconnecting numbers, and session stability metrics. FR-034: `DISCONNECTED` events MUST provide a normalized disconnect classification: `TERMINAL`, `TRANSIENT`, or `UNKNOWN`. FR-035: System SHOULD provide or maintain a BI-friendly projection/view for session analytics without requiring Redash to infer session pairing from raw events only. |

---

## **8. UI and UX Requirements**

| Component              | Description                                                                                    | UX Flow                                                                                                      | Related User Story IDs |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------- |
| Account Detail Log Tab | Tab or section named `Log Aktivitas` inside WhatsApp Web account detail/drawer.                | User opens account row, selects `Log Aktivitas`, and sees timeline events.                                   | US-001, US-003         |
| Timeline Event Item    | Single event row showing event type, timestamp, actor, reason, and metadata summary when safe. | User scans latest event and expands details if available.                                                    | US-001                 |
| Lifetime Badge         | Badge or summary text showing active lifetime or latest completed lifetime.                    | For connected account show `Aktif sejak X`; for disconnected account show latest completed session duration. | US-003                 |
| Filter Bar             | Event type multi-select and date range filter.                                                 | User applies filters and timeline refreshes.                                                                 | US-004                 |
| Empty State            | Empty state for no logs or no filter result.                                                   | User sees clear explanation and optional reset filter action.                                                | US-001, US-004         |
| Permission State       | Hide log tab for unauthorized roles.                                                           | Agent does not see event log entry point.                                                                    | US-006                 |

Recommended Phase 1 data fetching:

| Strategy                                               | Decision                                        |
| ------------------------------------------------------ | ----------------------------------------------- |
| Fetch on tab open                                      | Required.                                       |
| Refetch while tab is open                              | Every 30 seconds is acceptable.                 |
| Invalidate on existing connection status socket update | Recommended if available.                       |
| Dedicated realtime event-log socket                    | Out of scope for Phase 1 unless required by PM. |

---

## **9. Field and Validation**

| Field                 | Type      | Example                       | Validation                                                                                                                                                                        | Required    |
| --------------------- | --------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| event_id              | String    | evt_123                       | System generated. Unique.                                                                                                                                                         | Yes         |
| company_id            | String    | cmp_123                       | Must come from auth context.                                                                                                                                                      | Yes         |
| organization_id       | String    | org_123                       | Must come from auth context.                                                                                                                                                      | Yes         |
| account_channel_id    | String    | acc_123                       | Must reference account channel in tenant scope.                                                                                                                                   | Yes         |
| account_channel_name  | String    | CS Jakarta 01                 | Snapshot at event time.                                                                                                                                                           | Yes         |
| phone_number          | String    | +628123456789                 | E.164 if available.                                                                                                                                                               | Optional    |
| event_type            | Enum      | CONNECTED                     | Allowed: `CREATED`, `INIT`, `RE_INIT`, `SCAN`, `CONNECTED`, `DISCONNECTED`, `SUSPENDED`.                                                                                          | Yes         |
| event_status          | Enum      | SUCCESS                       | Phase 1 stores `SUCCESS` by default. `FAILED` is allowed only when the producer has an explicit lifecycle failure signal. Deduped/skipped events are not persisted as event logs. | Yes         |
| occurred_at           | Timestamp | 2026-06-02T09:14:00+07:00     | Timestamp from producer, not consumer.                                                                                                                                            | Yes         |
| actor_type            | Enum      | system                        | Allowed: `user`, `system`.                                                                                                                                                        | Yes         |
| actor_user_id         | String    | usr_123                       | Required only for user-triggered event when available.                                                                                                                            | Optional    |
| connection_session_id | String    | sess_abc                      | Required for paired connected/disconnected session when available.                                                                                                                | Conditional |
| reason                | Enum      | TIMEOUT                       | Required for `DISCONNECTED` when known.                                                                                                                                           | Conditional |
| disconnect_classification | Enum | TRANSIENT | Derived for `DISCONNECTED`: `TERMINAL`, `TRANSIENT`, or `UNKNOWN`. Used by Redash terminal/transient disconnect widgets. | Conditional |
| reason_detail         | String    | Connection timed out          | Sanitized. Must not contain credentials, tokens, keys, stack trace.                                                                                                               | Optional    |
| duration_ms           | Number    | 123000                        | Stored on `DISCONNECTED` when paired session exists.                                                                                                                              | Optional    |
| analytics_event_date  | Date      | 2026-06-02                    | Derived from `occurred_at` in tenant/reporting timezone for daily Redash grouping.                                                                                                | Optional    |
| source_service        | Enum      | whatsapp-service              | Allowed: `channel-service`, `whatsapp-service`, `system`.                                                                                                                         | Yes         |
| idempotency_key       | String    | acc_123:CONNECTED:sess_abc    | Unique per event write. See Section 9.2.                                                                                                                                          | Yes         |
| metadata              | Object    | `{ trigger: "auto_restore" }` | Allowlisted safe metadata only. See Section 9.4.                                                                                                                                  | Optional    |

### **9.1 Connection Session Architecture**

`connectionSessionId` MUST be generated and owned by `whatsapp-service` because `whatsapp-service` is the source of truth for Baileys connection lifecycle.

| Step                    | Rule                                                                                                                                                                                                                                                                                                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONNECTED` event       | When Baileys emits `connection = open` and no active session exists, `whatsapp-service` generates a UUID `connectionSessionId`.                                                                                                                                                                                                         |
| Active session storage  | `whatsapp-service` stores `{ connectionSessionId, connectedAt }` in Redis key `evt:session:{accountChannelId}`.                                                                                                                                                                                                                         |
| `RE_INIT` start         | `RE_INIT` marks that a restore attempt has started using stored credentials. It MUST NOT create a new `connectionSessionId`. Session is created only after Baileys confirms `connection = open` and `CONNECTED` is emitted.                                                                                                             |
| `RE_INIT` success       | Baileys emits `connection = open`, then normal `CONNECTED` flow creates a new session.                                                                                                                                                                                                                                                  |
| `RE_INIT` failure       | Baileys emits `connection = close`, then normal `DISCONNECTED` flow emits an orphan `DISCONNECTED` if no active session key exists.                                                                                                                                                                                                     |
| Session key TTL         | Session key TTL MUST be configurable via `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS`. Default value is 7 days (`604800000` ms) as a practical stale-key fallback independent from audit log retention policy. The key MUST also be deleted on normal disconnect/delete.                                                                     |
| Duplicate `CONNECTED`   | If `evt:session:{accountChannelId}` exists and is not stale, system MUST skip creating a new session and MUST skip emitting duplicate `CONNECTED` to RabbitMQ.                                                                                                                                                                          |
| Stale session recovery  | If `evt:session:{accountChannelId}` is older than `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS` or otherwise fails active-session validation, system MUST treat it as stale, emit an orphan `DISCONNECTED` for the stale session with `metadata.orphan = true`, delete the stale key, then create a new session for the incoming `CONNECTED`. |
| `DISCONNECTED` event    | `whatsapp-service` reads `evt:session:{accountChannelId}`, reuses the same `connectionSessionId`, calculates `duration_ms = disconnectedAt - connectedAt`, emits `DISCONNECTED`, then deletes the Redis session key.                                                                                                                    |
| Missing session key     | If Redis session key is missing, emit `DISCONNECTED` as orphan with `metadata.orphan = true`, no `duration_ms`, and no blocking error.                                                                                                                                                                                                  |
| Auto-restore            | Auto-restore emits `CONNECTED` with `actor_type = system` and `metadata.trigger = auto_restore`.                                                                                                                                                                                                                                        |
| Suspend while connected | If a connected account is suspended, system MUST close the active session first and emit `DISCONNECTED` with `reason = AUTO_SUSPEND`, then emit `SUSPENDED`. `duration_ms` is calculated from `CONNECTED` to this `DISCONNECTED`, not to `SUSPENDED`.                                                                                   |

### **9.2 Idempotency Key Format**

Every emitted event MUST include deterministic `idempotency_key` so RabbitMQ retries do not duplicate event logs.

| Event          | Format                                                                          |
| -------------- | ------------------------------------------------------------------------------- |
| `CREATED`      | `{accountChannelId}:CREATED:{occurredAtUnixMs}`                                 |
| `INIT`         | `{accountChannelId}:INIT:{requestId\|occurredAtUnixMs}`                         |
| `RE_INIT`      | `{accountChannelId}:RE_INIT:{requestId\|connectionAttemptId\|occurredAtUnixMs}` |
| `SCAN`         | `{accountChannelId}:SCAN:{connectionAttemptId\|occurredAtUnixMs}`               |
| `CONNECTED`    | `{accountChannelId}:CONNECTED:{connectionSessionId}`                            |
| `DISCONNECTED` | `{accountChannelId}:DISCONNECTED:{connectionSessionId\|occurredAtUnixMs}`       |
| `SUSPENDED`    | `{accountChannelId}:SUSPENDED:{requestId\|occurredAtUnixMs}`                    |

`requestId` or `connectionAttemptId` SHOULD be used when available. `occurredAtUnixMs` is the fallback for events without a request identifier.

### **9.3 Event Status Semantics**

| Status    | Phase 1 Behavior                                                                                                                                                                                                                                                                  |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SUCCESS` | Default status for lifecycle events that actually occurred and were stored.                                                                                                                                                                                                       |
| `FAILED`  | Reserved for explicit lifecycle failure signals only, such as confirmed scan/auth failure if backend can detect it. Do not infer failure from missing next event. In Phase 1, `FAILED` for `SCAN` is emitted only if OQ-003 confirms a reliable Baileys scan/auth failure signal. |
| `SKIPPED` | Not persisted in Phase 1. Deduped events are counted in observability metrics, not stored as event logs.                                                                                                                                                                          |

### **9.4 Metadata Whitelist**

Only the following metadata keys may be stored:

| Key                | Allowed Values / Notes                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `trigger`          | `manual`, `auto_restore`, `reconnect`, `policy`                                                                                            |
| `connectionMethod` | `qr`, `pairing_code`, `credential_restore`                                                                                                 |
| `slotIndex`        | Numeric slot index if multi-slot is available                                                                                              |
| `library`          | Example: `baileys`                                                                                                                         |
| `libraryVersion`   | Connector library version                                                                                                                  |
| `reasonCode`       | Sanitized disconnect code                                                                                                                  |
| `orphan`           | Boolean for orphan `DISCONNECTED` without active session                                                                                   |
| `dedupWindowMs`    | Optional. Store only on `DISCONNECTED` events where the producer evaluated disconnect deduplication. Do not fill on unrelated event types. |

The consumer MUST strip all other keys before saving. Metadata MUST NOT include credentials, tokens, QR payload, pairing code, raw Baileys auth state, raw session object, or stack trace.

---

## **10. Error Handling**

| Code       | Scenario                                                 | Handling                                                                                                                                                                    | User Message                                        |
| ---------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 403-ACEL01 | Agent accesses event log endpoint.                       | Deny request. Log security event if needed.                                                                                                                                 | `Akses ditolak.`                                    |
| 403-ACEL02 | Supervisor accesses account outside scope.               | Deny request or return no scoped result based on API convention.                                                                                                            | `Akses ditolak.`                                    |
| 404-ACEL03 | Account channel not found.                               | Return not found. Do not reveal cross-tenant existence.                                                                                                                     | `Akun tidak ditemukan.`                             |
| 400-ACEL04 | Invalid date range.                                      | Block query and show validation message.                                                                                                                                    | `Rentang tanggal tidak valid.`                      |
| 400-ACEL05 | Invalid event type filter.                               | Ignore invalid value or reject request based on API convention.                                                                                                             | `Tipe event tidak valid.`                           |
| 500-ACEL06 | Event log query failed.                                  | Show retry state.                                                                                                                                                           | `Gagal memuat log aktivitas. Coba lagi.`            |
| 500-ACEL07 | Lifetime summary failed.                                 | Hide lifetime summary and keep timeline usable.                                                                                                                             | `Gagal memuat durasi aktif.`                        |
| 202-ACEL08 | Event emit failed but lifecycle action succeeded.        | Do not fail main operation; log internal error for retry/monitoring.                                                                                                        | No user-facing error unless operation itself fails. |
| 503-ACEL09 | Supervisor team scope resolution dependency unavailable. | Fail closed. Do not query audit logs. Return service unavailable and allow retry. API Gateway MAY use cached scope for up to 5 minutes if cache is fresh and tenant-scoped. | `Gagal memvalidasi akses tim. Coba lagi.`           |

---

## **11. Edge Cases**

| ID     | Case                                                                      | Handling                                                                                                                          |
| ------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| EC-001 | QR is generated or refreshed every 30 seconds.                            | Do not create `SCAN` event. Only `INIT` is logged unless scan/auth success is confirmed.                                          |
| EC-002 | QR is generated but never scanned.                                        | Timeline shows `INIT` only. Lifetime remains empty.                                                                               |
| EC-003 | QR is scanned but connection fails before open.                           | Log `SCAN` only if scan is confirmed. Do not log `CONNECTED`. Optionally record failed status if backend has reliable signal.     |
| EC-004 | Auto-restore connects account after service restart.                      | Log `CONNECTED` with `actorType = system` and `metadata.trigger = auto_restore`.                                                  |
| EC-005 | Baileys emits repeated close events.                                      | Deduplicate repeated `DISCONNECTED` within the configured window.                                                                 |
| EC-006 | Account has multiple connect/disconnect cycles.                           | Show each completed session and calculate total lifetime if requested.                                                            |
| EC-007 | Account has `DISCONNECTED` without known `CONNECTED`.                     | Store as orphan debug event only if useful. Mark metadata as orphan.                                                              |
| EC-008 | Account is suspended while connected.                                     | Close the active session first, emit `DISCONNECTED` with `reason = AUTO_SUSPEND`, calculate `duration_ms`, then emit `SUSPENDED`. |
| EC-009 | Event consumer retries after crash.                                       | Idempotency key prevents duplicate event log.                                                                                     |
| EC-010 | Retention TTL removes old connected event but disconnected event remains. | Lifetime query must handle missing pair gracefully. Retention policy must consider this risk before activation.                   |
| EC-011 | `RE_INIT` triggered but stored session data is invalid or expired.        | Emit `RE_INIT`, then emit orphan `DISCONNECTED` when restore fails. Admin may need fresh `INIT` with QR.                          |
| EC-012 | `RE_INIT` and `INIT` happen sequentially.                                 | Record both flows: `RE_INIT` failure -> `DISCONNECTED`, then Admin-triggered `INIT` for fresh QR setup.                           |
| EC-013 | Service restart triggers `RE_INIT` for many accounts.                     | Each account gets its own `RE_INIT` event. Producers must emit async and rely on idempotency key to prevent duplicate storage.    |

---

## **12. Non-Functional Requirements**

| Attribute     | Target                                                                                                                                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance   | Event log query p95 <= 500 ms for one account with limit 50 and indexed filters.                                                                                                                                                                |
| Reliability   | Event logging is async and does not block lifecycle actions. Consumer is idempotent.                                                                                                                                                            |
| Scalability   | Support high account count tenants through pagination and indexed queries.                                                                                                                                                                      |
| Security      | Strict tenant scope and RBAC. No sensitive credentials or raw session payload in event logs.                                                                                                                                                    |
| Observability | Monitor queue depth, consumer error rate, write latency, duplicate skipped count, API latency, and Supervisor scope-resolution failures. Dedup skips SHOULD increment a metric counter such as `account_channel_event_log_dedup_skipped_total`. |
| Accessibility | Timeline icons must have labels, filter and pagination must be keyboard navigable.                                                                                                                                                              |
| Retention     | Configurable retention. TTL must not be enabled before PM/Legal approval.                                                                                                                                                                       |

### **12.1 Redash Dashboard Compatibility**

Existing public Redash dashboard: `Whatsapp Session`.

Current Redash widgets discovered from the dashboard definition:

| Redash Query | Widget / Metric | Required Support From PRD |
| ------------ | --------------- | -------------------------- |
| `WhatsApp Session History - Currently Active Sessions` | Active connected sessions | `CONNECTED` without matching `DISCONNECTED`, active Redis session, and/or BI session projection. |
| `WhatsApp Session History - Average Session Age` | Average active/completed session age | `CONNECTED.occurred_at`, `DISCONNECTED.occurred_at`, `duration_ms`. |
| `WhatsApp Session History - Daily Login vs Logout Trend` | Daily logins/logouts/terminal logouts | `CONNECTED` as login, `DISCONNECTED` as logout, `disconnect_classification = TERMINAL` for terminal logout. |
| `WhatsApp Session History - Logout Rate Per Day (Terminal Only)` | Terminal logout rate | `DISCONNECTED` reason mapping and terminal classification. |
| `WhatsApp Session History - Transient Disconnect Rate Per Day` | Transient disconnect rate | `DISCONNECTED` reason mapping and transient classification. |
| `WhatsApp Session History - Logout Reason Breakdown` | Logout reason distribution | Normalized `reason` and sanitized `reason_detail`. |
| `WhatsApp Session History - Top Disconnecting Numbers` | Numbers with most disconnects | `phone_number`, `account_channel_id`, `account_channel_name`, `DISCONNECTED` event count. |
| `WhatsApp Session History - Session Stability Metrics` | Stability summary | Session count, disconnect count, duration, terminal/transient classification. |

PRD must preserve these dashboard capabilities and fill gaps not covered by Redash:

| Gap in Current Redash | PRD Complement |
| --------------------- | -------------- |
| Redash focuses on session login/logout metrics, not complete lifecycle. | Product event log adds `CREATED`, `INIT`, `RE_INIT`, `SCAN`, `SUSPENDED`. |
| Redash is aggregate/dashboard oriented. | Product UI provides per-account timeline and investigation detail. |
| Redash does not enforce product RBAC. | API Gateway enforces tenant, Admin, Supervisor, Agent access. |
| Redash does not show actor/audit context. | Event payload stores `actor_type`, `actor_user_id`, source service, metadata. |
| Redash cannot reliably infer lifecycle attempts without explicit events. | PRD adds `INIT`, `RE_INIT`, and `SCAN` events. |
| Redash may need stable session pairing. | PRD defines `connectionSessionId`, Redis session key, stale recovery, and `duration_ms`. |

Recommended analytics projection for Redash/BI:

| Field | Description |
| ----- | ----------- |
| `company_id`, `organization_id` | Tenant scope. |
| `account_channel_id`, `account_channel_name`, `phone_number` | Account identity. |
| `connection_session_id` | Session pairing key. |
| `connected_at` | Timestamp from `CONNECTED`. |
| `disconnected_at` | Timestamp from `DISCONNECTED`, nullable for active session. |
| `duration_ms` | Completed session duration. |
| `is_active` | True if connected without matched disconnect. |
| `disconnect_reason` | Normalized disconnect reason. |
| `disconnect_classification` | `TERMINAL`, `TRANSIENT`, `UNKNOWN`. |
| `last_event_type`, `last_event_at` | Latest lifecycle state. |
| `analytics_event_date` | Reporting date for daily aggregation. |

---

## **13. Dependencies and Risks**

| Type     | Item                                  | Risk                                                                                                              | Mitigation                                                                                                                                                                                                  |
| -------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Internal | `audit-service`                       | Existing audit requirements may conflict with 90-day TTL.                                                         | Confirm retention policy before enabling TTL.                                                                                                                                                               |
| Internal | `whatsapp` service connection handler | Changes may affect critical reconnect/auto-restore flow.                                                          | Add only async emit, use feature flag, test with Baileys mock/simulator.                                                                                                                                    |
| Internal | `channel-service` suspend action      | `SUSPENDED` may not exist yet.                                                                                    | Confirm before sprint; if absent, treat as additional backend scope.                                                                                                                                        |
| Internal | RabbitMQ                              | Consumer retry may duplicate events.                                                                              | Use `idempotencyKey` and unique index.                                                                                                                                                                      |
| Internal | Redis                                 | Dedup key collision or missing namespace.                                                                         | Use dedicated namespace such as `evt:disconnected:{accountChannelId}`.                                                                                                                                      |
| Internal | Redis active session key              | Missing, stale, or expired session key can break deterministic lifetime pairing or block future `CONNECTED`.      | Store `evt:session:{accountChannelId}` on `CONNECTED`, default TTL 7 days, delete on `DISCONNECTED`, and run stale-session recovery before new `CONNECTED` emit.                                            |
| Internal | Team Inbox to account mapping         | Supervisor scope validation requires knowing whether an account channel belongs to Supervisor's Team Inbox scope. | API Gateway must validate against `channel-service` or `company-service` before querying audit logs. If dependency is unavailable, fail closed with 503 or use fresh tenant-scoped cache for max 5 minutes. |
| Internal | Redash / BI session projection        | Existing Redash widgets may break or diverge if new event model changes login/logout semantics. | Preserve `CONNECTED = login`, `DISCONNECTED = logout`, provide `disconnect_classification`, and maintain BI-friendly projection/view. |
| Product  | `SCAN` timing                         | Baileys may not expose exact scan event.                                                                          | Use auth/pairing success signal if available; otherwise fallback to `CONNECTED` metadata or revise event name.                                                                                              |
| Security | Raw error detail exposure             | Baileys error may contain internal or sensitive info.                                                             | Sanitize `reasonDetail` before save.                                                                                                                                                                        |
| Security | Metadata exposure                     | Free-form metadata can accidentally store sensitive session data.                                                 | Enforce metadata whitelist from Section 9.4 in audit-service consumer.                                                                                                                                      |

---

## **14. Success Metrics**

| KPI                                  | Target                                                                        | Time Window                 | Data Source                               |
| ------------------------------------ | ----------------------------------------------------------------------------- | --------------------------- | ----------------------------------------- |
| Lifecycle event capture completeness | >= 99 percent of supported events after feature flag enabled                  | First 30 days               | Audit event log count vs producer metrics |
| Event log query latency              | p95 <= 500 ms                                                                 | Ongoing                     | API metrics                               |
| Duplicate disconnect suppression     | Duplicate visible disconnects reduced by >= 90 percent during reconnect loops | First 30 days               | Dedup skipped count and event logs        |
| Disconnect investigation time        | Admin finds last disconnect reason in <= 30 seconds                           | UAT and post-release sample | Product/UX test                           |
| Event consumer success rate          | >= 99 percent                                                                 | Ongoing                     | Audit-service metrics                     |
| `RE_INIT` success rate               | Percentage of `RE_INIT` events followed by `CONNECTED` within 60 seconds      | First 30 days               | Account channel event log                 |
| Redash dashboard continuity          | Existing `Whatsapp Session` widgets continue to populate after event-log rollout | First 30 days and release validation | Redash dashboard/query validation |

---

## **15. Rollout and Production Safety**

Use feature flag:

```text
ENABLE_ACCOUNT_CHANNEL_EVENT_LOG=false
```

| Step | Action                                                                         |
| ---- | ------------------------------------------------------------------------------ |
| 1    | Deploy audit-service schema, consumer, and indexes.                            |
| 2    | Deploy API Gateway endpoints and RBAC guard.                                   |
| 3    | Deploy FE log tab behind permission and feature flag.                          |
| 4    | Deploy channel-service and whatsapp-service producers with flag off.           |
| 5    | Enable flag in staging and run smoke/regression tests.                         |
| 6    | Enable flag in production for limited tenant if supported.                     |
| 7    | Monitor RabbitMQ queue depth, consumer errors, write latency, and API latency. |

Rollback:

| Action                     | Result                                        |
| -------------------------- | --------------------------------------------- |
| Disable feature flag       | Stop new event emission.                      |
| Hide FE tab                | Remove user-facing surface.                   |
| Stop audit consumer        | Main account channel flow remains unaffected. |
| Revert producer deployment | No existing data migration required.          |

---

## **16. Future Considerations**

| Idea                                            | Benefit                                                    |
| ----------------------------------------------- | ---------------------------------------------------------- |
| Global event log page for all accounts          | Easier incident investigation across fleets.               |
| Export CSV/XLSX                                 | Compliance and support handover.                           |
| Notification on disconnect/suspend              | Faster operational reaction to outages.                    |
| Uptime analytics dashboard                      | Fleet reliability reporting.                               |
| Total lifetime across multiple sessions         | Fleet uptime analysis beyond Phase 1 per-session lifetime. |
| Dedicated realtime Socket.IO event for timeline | Faster UI updates without polling.                         |
| Support non-WhatsApp channels                   | Unified channel lifecycle audit.                           |

---

## **17. Limitations**

| Limitation                                      | Impact                                                         | Workaround                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| No backfill for old lifecycle events            | Timeline starts after feature activation.                      | Display empty state for older accounts.                                          |
| `SCAN` depends on available Baileys signal      | May be unavailable or approximated.                            | Use `CONNECTED` metadata fallback or revise taxonomy.                            |
| Export excluded from Phase 1                    | Users cannot download logs initially.                          | Add Phase 2 export if PM approves.                                               |
| Notification excluded from Phase 1              | Admin must check UI manually.                                  | Add Phase 2 notification-service integration.                                    |
| Retention not finalized                         | TTL cannot be safely enabled.                                  | Keep retention configurable and disabled until approved.                         |
| Global event log endpoint excluded from Phase 1 | Users can only view logs per account, not across all accounts. | Add `GET /api/account-channels/event-logs` and global UI in Phase 2 if approved. |
| Total lifetime excluded from Phase 1            | Users see per-session lifetime only, not accumulated uptime.   | Add total lifetime summary in analytics or Phase 2.                              |

---

## **18. Open Questions**

| ID     | Question                                                    | Impact                                                                                                                                           | Owner            |
| ------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| OQ-001 | Does `suspendAccountChannel` already exist?                 | Determines whether `SUSPENDED` is event-only or requires new action.                                                                             | Engineering      |
| OQ-002 | What is the final retention policy?                         | Determines TTL and compliance behavior.                                                                                                          | PM / Legal       |
| OQ-003 | What exact Baileys signal proves QR was scanned?            | Determines correctness of `SCAN`.                                                                                                                | Engineering      |
| OQ-004 | Lifetime scope confirmation                                 | Resolved: Phase 1 displays per-session lifetime only. Start = `CONNECTED`, end = `DISCONNECTED`.                                                 | PM               |
| OQ-005 | Is export CSV/XLSX required in Phase 1?                     | Adds endpoint and FE effort.                                                                                                                     | PM               |
| OQ-006 | Should `DISCONNECTED` or `SUSPENDED` trigger notifications? | Adds notification-service dependency.                                                                                                            | PM               |
| OQ-007 | Should event taxonomy be generic for future channels?       | Affects schema naming and service ownership.                                                                                                     | PM / Engineering |
| OQ-008 | Should `SCAN` become `PAIRED` when Pairing Code exists?     | Affects future enum design.                                                                                                                      | PM / Engineering |
| OQ-009 | How should `whatsapp-service` detect `RE_INIT` condition?   | Determines whether detection occurs at service startup, Baileys auto-restore interception, Admin reconnect, scheduled reconnect, or all of them. | Engineering      |
| OQ-010 | Should `RE_INIT` have a dedicated dedup window?             | Prevents duplicate restore attempts from service restart loops.                                                                                  | Engineering      |

---

## **19. Appendix**

### **19.1 Connection Session Pairing Rules**

| Rule                                   | Expected Behavior                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| New `CONNECTED` with no active session | Generate new `connectionSessionId`.                                                            |
| `RE_INIT` does not start a session     | `RE_INIT` only marks that restore attempt has started. Session is created only on `CONNECTED`. |
| Duplicate `CONNECTED` while active     | Do not create a new session unless prior session is closed.                                    |
| `DISCONNECTED` with active session     | Use active `connectionSessionId` and calculate `durationMs`.                                   |
| `DISCONNECTED` without active session  | Store as orphan only if useful for debugging.                                                  |
| Auto-restore                           | Store `CONNECTED` with `actorType = system` and `metadata.trigger = auto_restore`.             |

### **19.2 Disconnect Reason Enum**

| Reason            | Meaning                                           |
| ----------------- | ------------------------------------------------- |
| `LOGOUT_MANUAL`   | Admin/user manually logs out or stops session.    |
| `TIMEOUT`         | Session timed out.                                |
| `CONFLICT`        | WhatsApp session conflict or logged in elsewhere. |
| `BANNED`          | WhatsApp number is banned or blocked by provider. |
| `CONNECTION_LOST` | Network or transport issue.                       |
| `AUTO_SUSPEND`    | System policy suspended account automatically.    |
| `UNKNOWN`         | Reason cannot be mapped.                          |

### **19.3 Smoke Test Checklist**

| Step                                                | Expected Result                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Create account                                      | `CREATED` event appears.                                                                                |
| Init connection                                     | `INIT` event appears.                                                                                   |
| Service restart or reconnect with saved credentials | `RE_INIT` event appears with `actorType = system` and `metadata.trigger = auto_restore` or `reconnect`. |
| `RE_INIT` succeeds                                  | `RE_INIT` is followed by `CONNECTED` within expected timeframe.                                         |
| `RE_INIT` fails                                     | `RE_INIT` is followed by orphan `DISCONNECTED`.                                                         |
| Scan/connect account                                | `SCAN` appears only if confirmed; `CONNECTED` appears when session opens.                               |
| Disconnect/logout                                   | `DISCONNECTED` appears with reason and lifetime.                                                        |
| Query timeline                                      | REST endpoint returns 200 with paginated data.                                                          |
| Agent access                                        | API returns access denied and UI hides tab.                                                             |

---

## **20. Test Cases**

### **20.1 Event Capture Test Cases**

| TC ID       | Priority | Scenario                                     | Preconditions                                                                 | Steps                                                                                                              | Expected Result                                                                                                                                     |
| ----------- | -------- | -------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ACEL-001 | P0       | Capture `CREATED` event                      | Admin is authenticated and has permission to create WhatsApp account channel. | 1. Create a new WhatsApp Web account channel. 2. Open account event log.                                           | One `CREATED` event is stored with correct tenant, account, actor, and `occurred_at`.                                                               |
| TC-ACEL-002 | P0       | Capture fresh `INIT` event                   | Account exists and has no ready session.                                      | 1. Admin starts connect flow that requires QR/pairing. 2. Open account event log.                                  | One `INIT` event is stored. No `SCAN` event is stored until scan/auth success is confirmed.                                                         |
| TC-ACEL-003 | P0       | QR refresh does not create `SCAN`            | Account is in QR connect flow.                                                | 1. Open QR modal. 2. Wait for multiple QR auto-refresh cycles. 3. Query event log.                                 | QR refresh creates no `SCAN` events. Timeline contains `INIT` only until scan/auth success occurs.                                                  |
| TC-ACEL-004 | P0       | Capture `SCAN` only when confirmed           | Reliable Baileys scan/auth success signal is available.                       | 1. Start fresh `INIT`. 2. Scan QR successfully. 3. Query event log.                                                | One `SCAN` event appears after confirmed scan/auth success, not before.                                                                             |
| TC-ACEL-005 | P0       | Capture `CONNECTED` event                    | Account is initialized and Baileys emits `connection = open`.                 | 1. Complete connection flow. 2. Query event log.                                                                   | One `CONNECTED` event is stored with `connection_session_id`, `actor_type = system`, and correct idempotency key.                                   |
| TC-ACEL-006 | P0       | Capture `DISCONNECTED` event                 | Account is connected.                                                         | 1. Trigger disconnect/logout/network close. 2. Query event log.                                                    | One `DISCONNECTED` event is stored with mapped reason, sanitized reason detail, matching `connection_session_id` when available, and `duration_ms`. |
| TC-ACEL-007 | P0       | Capture `SUSPENDED` for disconnected account | Suspend action exists and account is not connected.                           | 1. Suspend account. 2. Query event log.                                                                            | One `SUSPENDED` event is stored. No forced `DISCONNECTED` is required because account was already not connected.                                    |
| TC-ACEL-008 | P0       | Capture suspend while connected              | Suspend action exists and account is connected.                               | 1. Suspend connected account. 2. Query event log.                                                                  | System emits `DISCONNECTED` with `reason = AUTO_SUSPEND` first, calculates `duration_ms`, then emits `SUSPENDED`.                                   |
| TC-ACEL-009 | P0       | Capture `RE_INIT` restore attempt            | Account has stored credentials/session data but current session is not ready. | 1. Trigger restore via service restart, auto-restore, scheduled reconnect, or Admin reconnect. 2. Query event log. | One `RE_INIT` event appears with `connectionMethod = credential_restore`. It does not create `connection_session_id`.                               |
| TC-ACEL-010 | P0       | `RE_INIT` success flow                       | Stored credentials are valid.                                                 | 1. Trigger `RE_INIT`. 2. Wait until Baileys emits `connection = open`. 3. Query event log.                         | Timeline shows `RE_INIT` followed by `CONNECTED` within expected timeframe. Session is created only on `CONNECTED`.                                 |
| TC-ACEL-011 | P1       | `RE_INIT` failure flow                       | Stored credentials are invalid or expired.                                    | 1. Trigger `RE_INIT`. 2. Wait for Baileys close/failure. 3. Query event log.                                       | Timeline shows `RE_INIT` followed by orphan `DISCONNECTED` without `duration_ms`. Admin can initiate fresh `INIT` with QR afterward.                |

### **20.2 Lifetime and Session Test Cases**

| TC ID       | Priority | Scenario                                       | Preconditions                                                                                             | Steps                                                                | Expected Result                                                                                                            |
| ----------- | -------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| TC-ACEL-012 | P0       | Completed session lifetime                     | Account has `CONNECTED` and matching `DISCONNECTED`.                                                      | 1. Connect account. 2. Disconnect account. 3. Open event log.        | `DISCONNECTED.duration_ms` equals `DISCONNECTED.occurred_at - CONNECTED.occurred_at` for the same `connection_session_id`. |
| TC-ACEL-013 | P0       | Active session lifetime                        | Account is currently connected.                                                                           | 1. Connect account. 2. Keep session active. 3. Open account detail.  | UI shows active lifetime as `now - CONNECTED.occurred_at`.                                                                 |
| TC-ACEL-014 | P1       | No lifetime before first connect               | Account has only `CREATED` and/or `INIT`.                                                                 | 1. Open account detail. 2. Check lifetime area.                      | UI shows `Belum pernah connected` or equivalent empty state.                                                               |
| TC-ACEL-015 | P1       | Multiple sessions display per-session lifetime | Account has multiple `CONNECTED -> DISCONNECTED` cycles.                                                  | 1. Connect and disconnect account twice. 2. Open event log.          | Each `DISCONNECTED` row shows its own per-session lifetime. Total accumulated lifetime is not required in Phase 1.         |
| TC-ACEL-016 | P0       | Stale Redis session recovery                   | Redis contains stale `evt:session:{accountChannelId}` older than `ACCOUNT_CHANNEL_ACTIVE_SESSION_TTL_MS`. | 1. Trigger new `CONNECTED`. 2. Query event log.                      | System emits orphan `DISCONNECTED` for stale session, deletes stale key, then creates a new session and emits `CONNECTED`. |
| TC-ACEL-017 | P1       | Missing Redis session key on disconnect        | Account disconnects but active Redis session key is missing.                                              | 1. Remove session key. 2. Trigger Baileys close. 3. Query event log. | `DISCONNECTED` is stored as orphan with `metadata.orphan = true` and no `duration_ms`; lifecycle flow does not crash.      |

### **20.3 UI, Filter, and RBAC Test Cases**

| TC ID       | Priority | Scenario                                | Preconditions                                                         | Steps                                                                      | Expected Result                                                                                                                       |
| ----------- | -------- | --------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ACEL-018 | P0       | Admin views event log timeline          | Admin has access to WA Web settings.                                  | 1. Open WhatsApp Web account detail. 2. Open `Log Aktivitas`.              | Timeline appears sorted by `occurred_at desc` and displays event type, timestamp, actor, reason, and lifetime when relevant.          |
| TC-ACEL-019 | P1       | Filter by event type                    | Account has multiple event types.                                     | 1. Open log tab. 2. Filter by `DISCONNECTED`.                              | Only `DISCONNECTED` events are shown.                                                                                                 |
| TC-ACEL-020 | P1       | Filter by date range                    | Account has events across multiple dates.                             | 1. Apply date range. 2. Query timeline.                                    | Only events within selected date range are shown.                                                                                     |
| TC-ACEL-021 | P1       | Pagination or load more                 | Account has more events than first page limit.                        | 1. Open log tab. 2. Click load more or navigate page.                      | Next page loads distinct older events without duplicates.                                                                             |
| TC-ACEL-022 | P0       | Agent cannot access event log           | User role is Agent.                                                   | 1. Open WA Web settings. 2. Call event log endpoint directly.              | `Log Aktivitas` tab is hidden and endpoint returns access denied.                                                                     |
| TC-ACEL-023 | P0       | Supervisor scoped account access        | Supervisor has Team Inbox scope containing account.                   | 1. Login as Supervisor. 2. Open in-scope account log.                      | Event log loads successfully.                                                                                                         |
| TC-ACEL-024 | P0       | Supervisor out-of-scope access denied   | Supervisor does not have Team Inbox scope for account.                | 1. Login as Supervisor. 2. Open out-of-scope account log or call endpoint. | API denies access or returns no scoped data according to convention. No data leakage.                                                 |
| TC-ACEL-025 | P1       | Supervisor scope dependency unavailable | `channel-service` or `company-service` scope resolver is unavailable. | 1. Login as Supervisor. 2. Query event log.                                | API fails closed with `503-ACEL09` or uses fresh tenant-scoped cache up to 5 minutes. Audit logs are not queried without valid scope. |

### **20.4 Security and Data Sanitization Test Cases**

| TC ID       | Priority | Scenario                       | Preconditions                                                  | Steps                                                                    | Expected Result                                                                                                                                                 |
| ----------- | -------- | ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ACEL-026 | P0       | Tenant isolation               | Account belongs to another company/organization.               | 1. Auth as user from different tenant. 2. Query account event log by ID. | API returns not found, access denied, or empty scoped result. No cross-tenant data is exposed.                                                                  |
| TC-ACEL-027 | P0       | Sanitize `reason_detail`       | Baileys error contains stack trace or sensitive internal data. | 1. Trigger disconnect with raw error. 2. Inspect stored log.             | Stored `reason_detail` contains only sanitized code/message. No stack trace, credential, token, key, QR payload, pairing code, or raw session object is stored. |
| TC-ACEL-028 | P1       | Metadata allowlist enforcement | Producer emits metadata with allowed and disallowed keys.      | 1. Emit event payload with extra metadata keys. 2. Inspect stored log.   | Only allowlisted metadata keys are stored. Disallowed keys are stripped by consumer.                                                                            |
| TC-ACEL-029 | P1       | Append-only event log          | Authenticated Admin attempts update/delete path if available.  | 1. Attempt to update or delete event log through API.                    | No update/delete endpoint exists, or request is rejected. Event log remains immutable.                                                                          |

### **20.5 Concurrency, Idempotency, and Resilience Test Cases**

| TC ID       | Priority | Scenario                                       | Preconditions                                                         | Steps                                                                                           | Expected Result                                                                                       |
| ----------- | -------- | ---------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| TC-ACEL-030 | P0       | Duplicate `DISCONNECTED` dedup                 | Account is connected and Baileys emits multiple close events rapidly. | 1. Emit 5 close events within `ACCOUNT_CHANNEL_DISCONNECT_DEDUP_WINDOW_MS`. 2. Query event log. | Only one visible `DISCONNECTED` event is stored. Dedup skip counter increments.                       |
| TC-ACEL-031 | P0       | Duplicate `CONNECTED` pre-emit dedup           | Active Redis session key already exists.                              | 1. Baileys emits duplicate `connection = open`. 2. Query event log and producer metrics.        | Producer skips duplicate `CONNECTED` before RMQ emit. No duplicate storage is needed.                 |
| TC-ACEL-032 | P0       | RabbitMQ consumer retry idempotency            | Same event payload is delivered more than once.                       | 1. Replay identical event payload with same `idempotency_key`. 2. Inspect stored logs.          | Only one document exists due to unique `idempotency_key`. Consumer retry is safe.                     |
| TC-ACEL-033 | P1       | Concurrent Admin init attempts                 | Two Admin tabs trigger connect/init for same account.                 | 1. Trigger `INIT` from two tabs close together. 2. Query timeline.                              | Both `INIT` attempts may be logged if they have distinct request IDs. Connection state remains valid. |
| TC-ACEL-034 | P1       | Service restart triggers many `RE_INIT` events | Multiple accounts have stored credentials and no ready session.       | 1. Restart whatsapp-service. 2. Observe event logs and RabbitMQ.                                | Each eligible account gets a `RE_INIT` event. System remains stable and event writes stay async.      |

### **20.6 Regression and Smoke Test Cases**

| TC ID       | Priority | Scenario                                        | Preconditions                                        | Steps                                                                          | Expected Result                                                                                                                      |
| ----------- | -------- | ----------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| TC-ACEL-035 | P0       | Create flow unaffected by logging failure       | Event log producer/consumer is unavailable.          | 1. Disable event consumer or simulate RMQ emit failure. 2. Create account.     | Account creation succeeds. Error is logged internally and main flow is not blocked.                                                  |
| TC-ACEL-036 | P0       | Init/connect flow unaffected by logging failure | Event log producer/consumer is unavailable.          | 1. Start connect flow. 2. Complete QR/connection if possible.                  | Connect flow remains functional. Event logging failure does not break Baileys lifecycle.                                             |
| TC-ACEL-037 | P0       | Existing connection status UI remains working   | WA Web settings has connected/disconnected accounts. | 1. Open WA Web settings. 2. Trigger connection status changes.                 | Existing status cards/table/socket updates continue to work.                                                                         |
| TC-ACEL-038 | P0       | Smoke test full happy path                      | Feature flag enabled and dependencies healthy.       | 1. Create account. 2. Init. 3. Scan/connect. 4. Disconnect. 5. Query timeline. | Timeline shows `CREATED`, `INIT`, optional `SCAN`, `CONNECTED`, `DISCONNECTED` with reason and lifetime.                             |
| TC-ACEL-039 | P0       | Feature flag disabled                           | `ENABLE_ACCOUNT_CHANNEL_EVENT_LOG=false`.            | 1. Perform lifecycle operations. 2. Open UI and query endpoint.                | Producers skip event emission. UI hides tab or shows disabled/empty state according to implementation. Main flow remains unaffected. |
