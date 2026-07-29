# PRODUCT REQUIREMENT DOCUMENT

**Feature**: Sync Contact from Third-Party Open API
**Product Manager**: TBD
**Engineering Lead**: Naftal Yunior
**Design Lead**: TBD
**Contributors**: Engineering Team, QA Team, Design Team
**Version**: v1.2
**TRD**: — (to be written as `trd/trd-sync-contact-third-party.md`)

---

## 1. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-07-29 | Requirement analysis → PRD | Initial PRD for per-company third-party contact sync: organization-level setting, permission-gated sync trigger, background batched pull, Redis-backed page cursor, contact upsert with Sales area context. |
| v1.1 | 2026-07-29 | Open questions resolved | **Insert-only** (skip existing contacts, never update). Area Context created for **all** the syncing user's Team Inboxes — Team Inbox selector removed. Area Context is still created for skipped (already-existing) contacts. `pageSize` is now **configurable** per company. Cursor invalidated on configuration change. Address stays a single string — no structured address fields anywhere. No sync-run history surface. No completion notification (button state only). Setting page placed under **Settings → Developer**. |
| v1.2 | 2026-07-29 | Remaining questions resolved | Sync records retained **30 days** then auto-purged via a TTL index. `pageSize` upper bound set to **100** (range 1–100). Confirmation dialog states the **count** of affected Team Inboxes, not their names. No open questions remain. |

---

## 2. Overview

| Item | Description |
|---|---|
| **Purpose** | Let a company pull its customer base from an external system (e.g. Lincah / order platform Open API) into SatuInbox Global Contacts, so agents can start conversations with people who already exist in the company's commerce system without manual entry or CSV work. |
| **Scope** | (1) A per-company **Sync Contact** setting stored on the `organizations` document — API URI, token header key, token value, page size, and a configurable list of identifier field mappings. (2) A **Sync** button on the Contacts page that creates a sync record and hands off to a background worker. (3) A **background batched pull** (`page` + `pageSize`) that resumes from a Redis-cached page cursor and expires weekly. (4) **Insert-only** contact creation flagged as sync-sourced in `metaData`, with a `sales` Area Context for **every Team Inbox the triggering user belongs to**, and `channelId` forced to the company's WhatsApp Web channel. |
| **Key Capabilities** | Org-scoped integration setting with encrypted token, permission-gated setting management (`setting:manage_sync_contact`) and sync execution (`client_contact:sync_contact_third_party`), non-blocking background sync, resumable pagination cursor with TTL, insert-only contact creation (existing contacts never modified), address fallback (lastOrder → firstOrder → null), latest-run status for button state. |
| **Outcome** | A company with thousands of external customers gets them into Global Contacts in one click, repeatable weekly, without ever overwriting data already in SatuInbox and without the agent waiting on a long-running request. |

### Scope Definition

| In Scope | Out of Scope |
|---|---|
| One sync integration configuration per company/organization, stored on `organizations`. | Multiple simultaneous third-party providers per company. |
| Bearer-style token auth via a configurable header key + value. | OAuth 2.0, mTLS, HMAC-signed, or refresh-token based third-party auth. |
| Configurable identifier field mapping (source JSON key → SatuInbox contact field), multiple entries. | Arbitrary transformation/expression mapping (concatenation, formatting, conditionals). |
| Configurable `pageSize` per company (default 100). | Cursor/token-based third-party pagination, or webhook/push ingestion. |
| Manual, user-triggered sync from the Contacts page. | Automatic scheduled/cron sync. |
| Background batched pull with `page` and `pageSize` query params. | Updating existing contacts — the sync **never** writes to a contact that already exists. |
| Resume cursor (last page + pageSize) in Redis, keyed by company + Team Inbox, TTL-expiring. | Persisting the page cursor in MongoDB. |
| Sync record with `in_progress` / `done` / `failed` status, used for button state. | A sync run history page or per-run detail view. |
| Insert new Global Contact with `metaData` sync flag and forced WhatsApp Web `channelId`. | Creating conversations, tickets, or leads from synced contacts. |
| `sales` Area Context for every Team Inbox of the triggering user — including for contacts that were skipped as already existing. | Choosing which Team Inbox the sync applies to (it always covers all of the user's teams). |
| Address fallback: `lastOrderAddress` → `firstOrderAddress` → `null`, stored as a single string. | Structured address fields (province / city / district) anywhere on the contact record. |
| Sync button state reflecting an in-progress run. | Real-time progress bar, socket progress push, or completion notification. |
| Two new RBAC permissions and their role seeding. | Reworking the existing contact RBAC / contact scope model. |
| Push direction only: third party → SatuInbox. | Two-way sync or pushing SatuInbox contacts back to the third party. |

---

## 3. Problem Statement

| ID | Problem | Impact |
|---|---|---|
| PS-001 | A company's customer base already lives in its order/commerce platform, but SatuInbox Global Contacts start empty. | Agents cannot search or open a contact until that customer has messaged in at least once. Outbound-first workflows (sales follow-up, broadcast targeting) are blocked. |
| PS-002 | The only way to get bulk contacts in today is manual creation, one record at a time. | Onboarding a company with thousands of customers is impractical; data entry errors and duplicates are guaranteed. |
| PS-003 | Every external platform names its fields differently (`id`, `phoneNumber`, `phone`, `msisdn`) and caps page size differently. | A hardcoded integration only works for one partner; each new partner needs a code change and a release. |
| PS-004 | Pulling several thousand records takes minutes; doing it inside an HTTP request would time out. | Without a background job the sync either fails halfway or blocks the agent's browser tab. |
| PS-005 | Re-running a full sync every week re-reads pages that have not changed. | Wasted third-party API quota and unnecessary load; risk of hitting partner rate limits. |
| PS-006 | Imported contacts must be visible to the right teams and reachable on the right channel, or they are dead records. | A contact with no Area Context or no channel cannot be found by the Sales team and cannot be messaged on WhatsApp. |
| PS-007 | Data already curated inside SatuInbox (agent-edited names, aliases, tags) must not be clobbered by an external system. | An overwriting sync would silently destroy agent work on every weekly run. |

---

## 4. Objectives and Key Results

| Objective | Key Result |
|---|---|
| Bulk-load external contacts without manual entry. | 100% of *new* records returned by the configured third-party endpoint are inserted into Global Contacts in a single sync run. |
| Never destroy data already in SatuInbox. | 0 writes to any pre-existing contact record across all sync runs. |
| Keep the sync non-blocking for the agent. | Sync trigger responds in under 1 second; the agent can navigate away immediately. |
| Make the integration configurable per company, no code change. | A new partner endpoint, page size, and field mapping can be onboarded entirely from the Settings UI. |
| Avoid duplicate contacts across repeated syncs. | Re-running a sync on unchanged data creates 0 new contact records. |
| Make synced contacts visible to the right teams. | Every Team Inbox of the triggering user has an active `sales` Area Context for every record the run touched, new or already existing. |
| Reduce redundant third-party calls on weekly re-syncs. | A sync run started within the cursor TTL resumes from the last completed page instead of page 1. |
| Keep credentials safe. | The token value is never returned in plaintext by any read API and is stored encrypted at rest. |

---

## 5. User Stories and Acceptance Criteria

| ID | Priority | User Story | Acceptance Criteria |
|---|---|---|---|
| US-001 | P0 | As an Admin, I want to configure my company's contact-sync integration so the system knows where to pull contacts from. | 1. Given I hold `setting:manage_sync_contact`, When I open Settings → Developer → Sync Kontak, Then I can enter API URI, token header key, token value, page size, and one or more field mappings. 2. Given I save a valid configuration, When the save succeeds, Then the setting is persisted on my organization and a success toast is shown. 3. Given I lack the permission, When I try to open the page, Then the menu item is hidden and direct navigation is denied. |
| US-002 | P0 | As an Admin, I want the token stored securely and masked after saving. | 1. Given I saved a token, When I reopen the setting page, Then the token value is masked (e.g. `••••••••1234`) and never returned in plaintext by the API. 2. Given I want to rotate the token, When I type a new value and save, Then the old value is replaced. 3. Given I leave the masked token untouched, When I save other fields, Then the stored token is unchanged. |
| US-003 | P0 | As an Admin, I want to map the third-party response fields to SatuInbox contact fields, with multiple mappings. | 1. Given the response contains `id` and `phone`, When I add mappings `id → referenceId` and `phone → phone`, Then both are applied to every synced record. 2. Given I try to save without a mapping targeting `referenceId`, When I submit, Then validation blocks the save with a clear message. 3. Given I map two source keys to the same target field, When I submit, Then validation blocks the save. |
| US-004 | P0 | As an Admin, I want to set the page size to match what my partner's API allows. | 1. Given my partner caps pages at 50, When I set `pageSize` to 50 and save, Then every sync request uses `pageSize=50`. 2. Given I enter a value outside the allowed range, When I submit, Then validation blocks the save. 3. Given I change `pageSize`, When the next sync runs, Then it starts from page 1 because the cached cursor is invalidated. |
| US-005 | P0 | As an Admin, I want to verify the configuration before running a real sync. | 1. Given a filled form, When I click "Test Koneksi", Then the system calls page 1 with `pageSize=1` and reports success plus a preview of the first mapped record. 2. Given the endpoint returns 401/403, When the test runs, Then an explicit "token ditolak" error is shown. 3. Given the endpoint is unreachable or times out, When the test runs, Then a connection error is shown and nothing is saved as verified. |
| US-006 | P0 | As an Agent/Supervisor with sync rights, I want a Sync button on the Contacts page so I can pull contacts on demand. | 1. Given I hold `client_contact:sync_contact_third_party` and the company has an enabled sync configuration, When I open Contacts, Then a "Sync Kontak" button is visible in the page header. 2. Given I lack the permission, When I open Contacts, Then the button is not rendered and the trigger endpoint returns 403. 3. Given the company has no sync setting configured, When I open Contacts, Then the button is hidden. |
| US-007 | P0 | As an Agent, I want clicking Sync to return immediately and run in the background. | 1. Given I click "Sync Kontak" and confirm, When the request succeeds, Then a sync record is created with status `in_progress` and the response returns within 1 second. 2. Given the sync is running, When I look at the button, Then it is disabled and labelled "Sedang sinkronisasi...". 3. Given I navigate away and come back, When the run is still active, Then the button still shows the in-progress state. |
| US-008 | P0 | As an Agent, I want to be prevented from starting a second sync while one is running. | 1. Given a run with status `in_progress` exists for my company, When I (or anyone in the company) trigger a sync, Then the request is rejected with a clear "sinkronisasi sedang berjalan" message. 2. Given the previous run finished, When I trigger again, Then a new run is created. |
| US-009 | P0 | As an Agent, I want to know when the sync finished and what it did. | 1. Given a run completes, When I revisit the Contacts page, Then the button returns to its idle state and the last run summary (finished time, records inserted/skipped) is shown next to it. 2. Given a run fails, When I revisit the page, Then the failure reason is surfaced and the button is enabled again for retry. |
| US-010 | P0 | As an Admin, I want the sync to never overwrite contacts that already exist in SatuInbox. | 1. Given a contact with the same identity already exists, When the sync encounters that source record, Then no field on the existing contact is written and the record is counted as skipped. 2. Given I edited a synced contact's name by hand, When the next sync runs, Then my edit survives. 3. Given a run completes over an unchanged dataset, When I review the summary, Then inserted = 0 and skipped = total. |
| US-011 | P0 | As a Sales user, I want synced contacts to appear in the Sales contact list of every team I belong to. | 1. Given I belong to three Team Inboxes, When I run a sync, Then each inserted contact gets an active `sales` Area Context for all three Team Inboxes. 2. Given a source record matched an already-existing contact, When the run processes it, Then the Area Contexts for my teams are still created even though the contact itself was skipped. 3. Given the Area Context already exists for a team, When the run re-processes it, Then the existing context is reused and `lastActivityAt` is refreshed — no duplicate. |
| US-012 | P0 | As an Agent, I want synced contacts to be messageable on WhatsApp. | 1. Given the company has an active WhatsApp Web channel, When a contact is inserted, Then `channelId` is set to that channel. 2. Given the company has no active WhatsApp Web channel, When I trigger a sync, Then the trigger is rejected with a clear error and no run is created. |
| US-013 | P1 | As an Admin, I want re-running a weekly sync to be cheap. | 1. Given a previous run completed page N within the cursor TTL, When a new run starts, Then it resumes from page N+1. 2. Given the cursor TTL has expired, When a new run starts, Then it starts from page 1 to pick up records missed earlier. 3. Given I changed the API URI, field mappings, or page size, When a new run starts, Then it starts from page 1. |
| US-014 | P1 | As an Admin, I want to see the address of a synced contact when the source has one. | 1. Given the source record has `lastOrderAddress`, When the contact is inserted, Then that value is stored as the contact address string. 2. Given `lastOrderAddress` is absent but `firstOrderAddress` exists, When the contact is inserted, Then `firstOrderAddress` is used. 3. Given neither exists, When the contact is inserted, Then address is left empty. |
| US-015 | P1 | As a data owner, I want to know which contacts came from the sync. | 1. Given a contact was inserted by a sync, When I inspect the record, Then `metaData` carries a sync flag, the provider/source identifier, the external id, and the sync timestamp. |

---

## 6. Functional Requirements

### 6.1 Sync Setting (per company / organization)

| Category | Requirements |
|---|---|
| Storage | **FR-001 [P0]**: System MUST store the sync configuration on the `organizations` document (company-service) as a nested object, one configuration per organization. **FR-002 [P0]**: System MUST scope every read/write of the configuration by `companyId` + `organizationId`. |
| Fields | **FR-003 [P0]**: The configuration MUST contain: `isEnabled` (boolean), `apiUri` (string), `tokenHeaderKey` (string), `tokenValue` (encrypted string), `pageSize` (integer), `fieldMappings` (array of `{ sourceKey, targetField }`), and derived metadata (`lastTestedAt`, `updatedBy`, `updatedAt`). **FR-004 [P0]**: `fieldMappings` MUST accept multiple entries (e.g. `id → referenceId`, `phoneNumber → phone`). |
| Page size | **FR-005 [P0]**: `pageSize` MUST be configurable per company, defaulting to 100. **FR-006 [P0]**: `pageSize` MUST be validated within a bounded range of **1–100** — 100 is both the default and the maximum, so the setting exists to accommodate partners with a *lower* page cap, never to raise it. |
| Allowed targets | **FR-007 [P0]**: `targetField` MUST be restricted to a fixed allowlist: `referenceId`, `phone`, `name`, `email`, `alias`, `username`. **FR-008 [P0]**: A mapping targeting `referenceId` MUST be present; save MUST fail otherwise. **FR-009 [P0]**: Duplicate `targetField` entries MUST be rejected. |
| Permission | **FR-010 [P0]**: Reading and writing the configuration MUST require `setting:manage_sync_contact`. **FR-011 [P0]**: A new permission action `manage_sync_contact` MUST be added to `PermissionActionEnum` and exposed as `SettingPermission.MANAGE_SYNC_CONTACT`. **FR-012 [P0]**: The permission MUST be seeded to the roles that already receive setting-management permissions (e.g. OWNER/ADMIN/SUPERVISOR per existing seeding policy). |
| Credential safety | **FR-013 [P0]**: `tokenValue` MUST be encrypted at rest using the existing `CryptoService` (same approach as shipping credentials). **FR-014 [P0]**: No read API may return `tokenValue` in plaintext; responses MUST return a masked representation only. **FR-015 [P0]**: `apiUri` MUST be validated as an absolute `https://` URL. **FR-016 [P0]**: The system MUST reject `apiUri` values resolving to loopback, link-local, or private network ranges (SSRF guard). **FR-017 [P0]**: `tokenValue` MUST never be written to application logs. |
| Cursor invalidation | **FR-018 [P0]**: Saving a change to `apiUri`, `fieldMappings`, or `pageSize` MUST invalidate all cached page cursors for that company so the next run starts from page 1. |
| Test connection | **FR-019 [P1]**: System SHOULD provide a "test connection" action that calls the configured endpoint with `page=1&pageSize=1` and returns success/failure plus a preview of the first mapped record. **FR-020 [P1]**: The test action MUST NOT write any contact data and MUST NOT touch the cursor. |

### 6.2 Sync Trigger

| Category | Requirements |
|---|---|
| Entry point | **FR-021 [P0]**: System MUST expose a "Sync Kontak" action in the Contacts page header. **FR-022 [P0]**: The action MUST be visible only when the user holds `client_contact:sync_contact_third_party` AND the company has an enabled sync configuration. |
| Permission | **FR-023 [P0]**: A new permission action `sync_contact_third_party` MUST be added to `PermissionActionEnum` and exposed as `ClientContactPermission.SYNC_THIRD_PARTY` (`client_contact:sync_contact_third_party`). **FR-024 [P0]**: The trigger endpoint MUST enforce this permission server-side; hiding the button is not sufficient. |
| Team scope | **FR-025 [P0]**: The run MUST target **all** Team Inboxes the triggering user belongs to within the current organization. The user MUST NOT be asked to choose one. **FR-026 [P0]**: The resolved Team Inbox list MUST be snapshotted onto the sync record at trigger time; teams the user joins or leaves mid-run do not affect the in-flight run. **FR-027 [P0]**: A user belonging to zero Team Inboxes MUST be rejected at trigger time. |
| Preconditions | **FR-028 [P0]**: Trigger MUST fail with a descriptive error when: no sync configuration exists, the configuration is disabled, no active WhatsApp Web channel exists for the company, or the user has no Team Inbox. |
| Job creation | **FR-029 [P0]**: On a valid trigger the system MUST create a sync record with status `in_progress` and return it immediately (target < 1s). **FR-030 [P0]**: The actual fetching MUST happen in a background process (RabbitMQ-driven worker), never inside the HTTP request. **FR-031 [P0]**: The sync record MUST store: `companyId`, `organizationId`, `teamInboxIds[]`, `channelId`, `triggeredBy`, `status`, `startPage`, `pageSize`, `lastCompletedPage`, `totalRecords`, counters (`processed`, `inserted`, `skippedExisting`, `skippedInvalid`, `failed`, `areaContextsCreated`), `failureReason`, `startedAt`, `completedAt`. |
| Concurrency | **FR-032 [P0]**: At most one `in_progress` sync record may exist per (`companyId`, `organizationId`); a second trigger from any user in that company MUST be rejected with a conflict error. **FR-033 [P0]**: A run stuck in `in_progress` beyond a configurable staleness threshold (default 60 minutes) MUST be auto-marked `failed` so users can retry. |
| Status polling | **FR-034 [P0]**: System MUST expose an endpoint returning the latest sync record for the user's company so the UI can render button state. **FR-035 [P0]**: The Contacts page MUST poll that endpoint while a run is `in_progress` (default every 10 seconds) and stop polling once terminal. **FR-036 [P0]**: System MUST NOT expose a list of historical runs — only the latest record. |
| Retention *(IDs continue after FR-097 so existing requirement IDs stay stable)* | **FR-098 [P0]**: Sync records MUST be retained for 30 days and then purged automatically via a Mongo TTL index on an `expiresAt` field (same mechanism as the existing export-report job records). **FR-099 [P0]**: `expiresAt` MUST be set at creation time so a run that never reaches a terminal status is still eligible for cleanup. **FR-100 [P0]**: Purging a sync record MUST NOT affect the contacts or Area Contexts it created, nor the Redis cursors. |

### 6.3 Background Fetch & Pagination

| Category | Requirements |
|---|---|
| Request shape | **FR-037 [P0]**: The worker MUST call the configured `apiUri` with query parameters `page` and `pageSize`. **FR-038 [P0]**: `pageSize` MUST be taken from the company's configuration (default 100). **FR-039 [P0]**: The worker MUST send the token as a single header using the configured `tokenHeaderKey` and the decrypted `tokenValue`. **FR-040 [P0]**: The worker MUST use a snapshot of the configuration taken at run start for the entire run. |
| Response contract | **FR-041 [P0]**: The worker MUST read records from the `data` array of the response and continue while `hasNextPage` is `true`. **FR-042 [P0]**: The worker MUST record `total` from the first page into the sync record as `totalRecords`. **FR-043 [P0]**: A response missing `data` or not parseable as JSON MUST fail the run with a descriptive reason. |
| Loop control | **FR-044 [P0]**: The worker MUST process pages sequentially, committing all records of page N before advancing to page N+1. **FR-045 [P0]**: The worker MUST stop when `hasNextPage` is `false`, when `data` is empty, or when a configurable maximum page count (default 1000) is reached. **FR-046 [P1]**: The worker SHOULD apply a small inter-page delay (default 200ms) to stay inside partner rate limits. |
| Resilience | **FR-047 [P0]**: A page request failing with a retryable error (network error, 429, 5xx) MUST be retried with exponential backoff (default 3 attempts). **FR-048 [P0]**: After retries are exhausted the run MUST be marked `failed` with the failing page number and reason; already-committed pages MUST remain committed and the cursor MUST retain the last successful page. **FR-049 [P0]**: A non-retryable error (401/403/404) MUST fail the run immediately with an explicit reason. **FR-050 [P0]**: Each page request MUST have a timeout (default 30 seconds). |
| Completion | **FR-051 [P0]**: When the last page is processed, the run status MUST be set to `done` with `completedAt` and final counters. |

### 6.4 Page Cursor (cache only)

| Category | Requirements |
|---|---|
| Storage | **FR-052 [P0]**: The resume cursor MUST be stored in Redis only. It MUST NOT be persisted in MongoDB. **FR-053 [P0]**: The cursor key MUST be scoped by `companyId` + `teamInboxId` (e.g. `contact:sync:cursor:<companyId>:<teamInboxId>`) — one cursor per Team Inbox. **FR-054 [P0]**: The cursor value MUST contain at least `lastCompletedPage`, `pageSize`, and `lastSyncedAt`. |
| Multi-team resume | **FR-055 [P0]**: Because a run covers all of the triggering user's Team Inboxes, `startPage` MUST be `min(lastCompletedPage)` across those Team Inboxes, plus 1. **FR-056 [P0]**: If any Team Inbox in scope has no cursor, the run MUST start at page 1 so that team gets full coverage. **FR-057 [P0]**: After each successfully committed page, the cursor MUST be written for **every** Team Inbox in scope, refreshing each TTL. |
| Reset & mismatch | **FR-058 [P0]**: When a cached `pageSize` differs from the run's `pageSize`, that cursor MUST be discarded and the run MUST start at page 1. **FR-059 [P0]**: When a run reaches the last page (`hasNextPage = false`), the cursors for all Team Inboxes in scope MUST be reset so the next run after TTL starts clean. |
| Expiry | **FR-060 [P0]**: The cursor MUST carry a TTL (default 7 days, configurable) so an expired cursor forces a full re-read from page 1, picking up records that were added at earlier pages since the last run. |
| Cache unavailability | **FR-061 [P0]**: If Redis is unavailable, the run MUST still proceed starting from page 1 (correctness over efficiency), and the degradation MUST be logged. |

### 6.5 Contact Insert (insert-only) & Area Context

| Category | Requirements |
|---|---|
| Identity | **FR-062 [P0]**: Each source record MUST be matched against existing contacts on the existing unique index (`channelId`, `referenceId`), where `referenceId` comes from the mapping targeting `referenceId`. **FR-063 [P0]**: A record whose mapped `referenceId` is missing or empty MUST be skipped and counted in `skippedInvalid`. |
| Insert-only | **FR-064 [P0]**: When no contact exists for that identity, the system MUST **insert** a new contact. **FR-065 [P0]**: When a contact already exists for that identity, the system MUST **skip the write entirely** — no field on the existing contact may be created, modified, or cleared — and count it in `skippedExisting`. **FR-066 [P0]**: This applies regardless of how the existing contact was created (manual, WhatsApp conversation, or a previous sync). **FR-067 [P0]**: The insert MUST be race-safe: a duplicate-key error caused by a concurrent write MUST be handled as "already exists" (counted in `skippedExisting`), not as a failure. |
| Channel | **FR-068 [P0]**: `channelId` MUST be forced to the company's active WhatsApp Web channel for every inserted contact, regardless of source data. **FR-069 [P0]**: When more than one active WhatsApp Web channel exists, the system MUST use a deterministic selection rule (oldest active channel) and record the chosen `channelId` on the sync record. |
| Mapped fields | **FR-070 [P0]**: All configured `fieldMappings` MUST be applied on insert. Unmapped source keys MUST NOT be written to first-class contact fields. **FR-071 [P0]**: When `phone` is mapped and present, `phoneLast4` MUST be derived using the existing helper. **FR-072 [P0]**: `null` and empty-string source values MUST be omitted from the inserted document rather than written as empty values. |
| Address | **FR-073 [P0]**: The contact address MUST be resolved as `lastOrderAddress` → `firstOrderAddress` → empty, and stored in the existing single `address` string field. **FR-074 [P0]**: The resolved address MUST be whitespace-normalized (newlines and repeated spaces collapsed), trimmed, and truncated to the schema maximum (200 characters). **FR-075 [P0]**: An address shorter than the schema minimum (4 characters) MUST be treated as empty. **FR-076 [P0]**: The system MUST NOT add structured address fields (province / city / district) to the contact schema, and MUST NOT store the source's address components. |
| Sync flag | **FR-077 [P0]**: `metaData` on the inserted contact MUST carry the sync provenance: a flag identifying third-party sync as the source, the external record id, the sync record id, and the sync timestamp. **FR-078 [P1]**: Non-address extra source attributes (e.g. `userPrefix`, `isPostpaid`) MAY be preserved under a namespaced key inside `metaData`. |
| Area Context | **FR-079 [P0]**: For every source record processed — whether inserted or skipped as already existing — the system MUST create-or-reuse an active Area Context per Team Inbox in scope, with `area = sales`, `teamInboxId` = each of the triggering user's Team Inboxes, `createdBy` = the triggering user, and a `source` value identifying the third-party sync. **FR-080 [P0]**: Re-processing MUST reuse the existing active context (refreshing `lastActivityAt`) rather than creating a duplicate, per the existing unique index on (`area`, `contactId`, `status`, `teamInboxId`). **FR-081 [P0]**: Records skipped as `skippedInvalid` MUST NOT produce an Area Context. **FR-082 [P0]**: The count of Area Contexts newly created MUST be tracked on the sync record. |
| Tenancy | **FR-083 [P0]**: Every inserted contact and Area Context MUST carry the triggering company's `companyId` and `organizationId`. |
| Counting | **FR-084 [P0]**: The run MUST count `processed`, `inserted`, `skippedExisting`, `skippedInvalid`, `failed`, and `areaContextsCreated`, and persist the totals on the sync record. **FR-085 [P0]**: A single record failing MUST NOT abort the page; it MUST be counted as `failed` and logged with its external id. |

### 6.6 UI Behaviour

| Category | Requirements |
|---|---|
| Settings page | **FR-086 [P0]**: System MUST provide a Sync Contact settings page under **Settings → Developer**, alongside Shipping Credentials and Webhook. **FR-087 [P0]**: The navigation entry MUST be hidden for users lacking `setting:manage_sync_contact`. **FR-088 [P0]**: The mapping editor MUST support add/remove rows, with `targetField` chosen from the allowlist. **FR-089 [P0]**: The page MUST expose `pageSize` as an editable numeric field with the allowed range surfaced in helper text. |
| Contacts page | **FR-090 [P0]**: The "Sync Kontak" button MUST sit in the Contacts page header next to the existing create-contact action. **FR-091 [P0]**: A confirmation dialog MUST precede the run, stating that contacts will be added to the Sales area of all the user's Team Inboxes — referring to them by **count only, not by name** — and that existing contacts will not be modified. **FR-092 [P0]**: While a run is `in_progress`, the button MUST be disabled and show the in-progress label. **FR-093 [P0]**: On transition to a terminal status the button MUST return to idle and the contacts table MUST be refetched. **FR-094 [P0]**: The last run outcome (finish time and inserted/skipped counts, or the failure reason) MUST be shown near the button. |
| Feedback | **FR-095 [P0]**: Trigger success and every failure path MUST surface a toast. **FR-096 [P0]**: System MUST NOT send an in-app notification or email on completion — the button state and inline summary are the only completion signal. **FR-097 [P0]**: All user-facing copy MUST go through next-intl with both `en` and `id` messages. |

---

## 7. Error Handling

| ID | Type | Handling | UI/UX |
|---|---|---|---|
| EH-001 | Sync setting not configured / disabled | Trigger rejected. No run created. | Button hidden; if invoked directly: "Integrasi sync kontak belum dikonfigurasi." |
| EH-002 | User lacks `client_contact:sync_contact_third_party` | Endpoint returns 403. | Button not rendered. |
| EH-003 | User lacks `setting:manage_sync_contact` | Setting endpoints return 403. | Settings menu item hidden. |
| EH-004 | No active WhatsApp Web channel for the company | Trigger rejected; no run created. | "Belum ada channel WhatsApp Web aktif. Hubungkan channel terlebih dahulu." |
| EH-005 | Triggering user belongs to no Team Inbox | Trigger rejected; no run created. | "Anda belum tergabung di Team Inbox mana pun." |
| EH-006 | Sync already `in_progress` for the company | Trigger rejected with conflict. | "Sinkronisasi sedang berjalan. Tunggu hingga selesai." |
| EH-007 | Third-party returns 401/403 | Run marked `failed`, reason = auth rejected. Cursor untouched. | "Token ditolak oleh API pihak ketiga. Periksa pengaturan token." |
| EH-008 | Third-party returns 404 / wrong URI | Run marked `failed`, reason = endpoint not found. | "Endpoint tidak ditemukan. Periksa URI API." |
| EH-009 | Third-party returns 429 or 5xx | Retry with exponential backoff (3 attempts); if still failing, mark run `failed` at that page. Committed pages remain. | "Sinkronisasi gagal di halaman N. Coba lagi nanti." |
| EH-010 | Request timeout (>30s per page) | Treated as retryable; same backoff path as EH-009. | Same as EH-009. |
| EH-011 | Malformed / non-JSON response, or missing `data` array | Run marked `failed`, reason = invalid response shape. No partial page committed. | "Format respons API tidak sesuai." |
| EH-012 | Record missing mapped `referenceId` | Skip record, increment `skippedInvalid`, no Area Context, continue page. | No blocking error; counted in run summary. |
| EH-013 | Contact already exists | Skip the contact write, increment `skippedExisting`, still ensure Area Contexts for all teams in scope. | Counted in run summary as "dilewati". |
| EH-014 | Duplicate-key error on insert (concurrent write race) | Treat as already-existing: count in `skippedExisting`, ensure Area Contexts, continue. | No user-facing error. |
| EH-015 | Single record insert failure (validation/DB, non-duplicate) | Increment `failed`, log external id, continue page. | Run can still complete as `done` with a non-zero failed count. |
| EH-016 | Area Context creation fails for one team | Increment `failed` for that record, log team + contact id, continue with remaining teams and records. | Counted in run summary. |
| EH-017 | Address exceeds schema max length | Truncate to 200 characters. | No error surfaced. |
| EH-018 | Redis unavailable when reading/writing the cursor | Proceed from page 1; log degradation; do not fail the run. | No user-facing error. |
| EH-019 | Worker crash / process restart mid-run | Run remains `in_progress` until the staleness sweep marks it `failed`; cursors keep the last committed page so a retry resumes. | "Sinkronisasi terakhir tidak selesai. Coba lagi." |
| EH-020 | `apiUri` fails SSRF/URL validation on save | Save rejected. | "URI API harus HTTPS dan tidak boleh mengarah ke jaringan internal." |
| EH-021 | Duplicate `targetField`, missing `referenceId` mapping, or out-of-range `pageSize` on save | Save rejected with field-level errors. | Inline validation on the affected fields. |

---

## 8. Edge Cases

| ID | Scenario | Expected Behavior | UI/UX |
|---|---|---|---|
| EC-001 | Source record has no `phone` (e.g. the `febry@lincah.id` sample). | Contact is still inserted keyed by `referenceId`; `phone` and `phoneLast4` are omitted. | Contact row shows an empty phone cell. |
| EC-002 | Source record has `phone: null`. | Field omitted on insert. Never written as an empty value. | No error. |
| EC-003 | Two source records share the same `phone` but different `id`. | Two distinct contacts are inserted (identity is `referenceId`). | Duplicate phone numbers may appear in the list. Phone-level dedupe is out of scope. |
| EC-004 | A source record's phone matches an existing WhatsApp-originated contact, but the `referenceId` differs. | A separate contact is inserted — the identity check is on `(channelId, referenceId)`, not phone. | Documented limitation; merge tooling is a future consideration. |
| EC-005 | The source record's data changed since it was first synced (e.g. renamed). | The existing contact is skipped; the new value is **not** applied. Field changes never propagate. | Documented limitation. |
| EC-006 | Third party returns fewer records on page N than `pageSize` but `hasNextPage` is `true`. | Continue to page N+1; trust `hasNextPage`. | No user-facing effect. |
| EC-007 | `hasNextPage` is `true` forever (partner bug / infinite pagination). | The max-page guard (default 1000) stops the run and marks it `done` with a truncation note logged. | Run summary notes truncation. |
| EC-008 | The third-party dataset shrank, so the cached cursor points past the end. | The resumed page returns an empty `data` array; the run completes as `done` and the cursors are reset. | Run reports 0 processed. |
| EC-009 | Cursor TTL expires between weekly runs. | Next run starts at page 1. Existing contacts are skipped; only genuinely new records are inserted, and Area Contexts are refreshed across the whole dataset. | Longer run; 0 duplicates. |
| EC-010 | Admin changes `apiUri`, `fieldMappings`, or `pageSize`. | All cursors for the company are invalidated; the next run starts at page 1. | No user-facing error. |
| EC-011 | A second user from a different Team Inbox runs the sync after the first user already imported everything. | Every contact is skipped as existing, but Area Contexts are created for the second user's teams — so their teams now see the contacts. `inserted = 0`, `areaContextsCreated > 0`. | Summary reflects 0 new contacts but the teams gain visibility. |
| EC-012 | The triggering user belongs to many Team Inboxes (e.g. 10). | One Area Context per contact per team is created — 10 contexts per contact. Cursors are written for all 10 teams. | Longer run; documented volume implication. |
| EC-013 | A user's Team Inbox membership changes mid-run. | The run uses the snapshot taken at trigger time. | No mid-run behavior change. |
| EC-014 | Two users in the same company trigger simultaneously. | The second trigger is rejected by the company-level concurrency guard. | "Sinkronisasi sedang berjalan." |
| EC-015 | The triggering user is deactivated mid-run. | The run continues to completion; `createdBy` on the Area Contexts remains the original user. | No user-facing effect. |
| EC-016 | The WhatsApp Web channel is disconnected mid-run. | The run continues (channel binding is a data reference, not a live requirement). | Contacts remain messageable once the channel reconnects. |
| EC-017 | Address contains newlines/carriage returns (present in samples). | Whitespace is normalized before storing. | Address renders on one line. |
| EC-018 | Source has `lastOrderAddress` absent but `firstOrderAddress` present (and vice versa). | Fallback order `lastOrderAddress` → `firstOrderAddress` → empty is applied. | — |
| EC-019 | Source has order province/city/district but no address string. | Address is left empty. Components are intentionally discarded. | — |
| EC-020 | Source `name` is empty but `email` exists. | Contact is inserted with no name; the list falls back to phone/email display. | Existing empty-name display behavior applies. |
| EC-021 | Re-sync of an unchanged dataset. | `inserted = 0`, `skippedExisting = total`. | Run summary shows 0 new contacts. |
| EC-022 | Setting is edited while a run is in flight. | The in-flight run keeps using the configuration snapshot it started with; cursor invalidation affects the next run only. | No mid-run behavior change. |
| EC-023 | Third party returns `page` as a string (`"1"` in the sample) rather than a number. | Response `page` is parsed leniently; the worker's own counter is authoritative. | No error. |

---

## 9. UI & UX Requirements

| Component | Description | UX Flow | Related User Story IDs |
|---|---|---|---|
| **Settings → Developer → Sync Kontak** | Form page next to Shipping Credentials and Webhook. Sections: Koneksi (URI, token header key, token value, page size), Pemetaan Field (repeatable rows), Test Koneksi. | Admin opens Settings → Developer → Sync Kontak → fills connection → adds mappings → tests → saves. | US-001, US-002, US-003, US-004, US-005 |
| **Token field** | Password-style input. After save it renders masked with a "Ubah" affordance; leaving it untouched preserves the stored value. | Admin rotates the token only when needed. | US-002 |
| **Page size field** | Numeric input, default 100, max 100. Helper text states the 1–100 range, notes that 100 is the maximum, and warns that changing the value restarts the sync from page 1. | Admin lowers it when the partner caps pages below 100. | US-004, US-013 |
| **Field mapping editor** | Repeatable rows: source key text input → target field select (allowlist). Add/remove row buttons. At least one row targeting `referenceId` is required. | Admin adds `id → referenceId`, `phone → phone`, etc. | US-003 |
| **Test Koneksi result** | Inline result panel: success badge + preview table of the first mapped record, or an error message with the failure category. | Admin verifies before saving/running. | US-005 |
| **"Sync Kontak" button (Contacts header)** | Secondary button next to "Tambah Kontak", with a sync icon. Hidden without permission or configuration. | Agent clicks → confirm dialog → run starts. | US-006, US-007 |
| **Confirmation dialog** | States that contacts will be added to the Sales area of **all** the user's Team Inboxes, and that contacts already in SatuInbox will be skipped and left unchanged. Refers to the affected teams by **count only** (e.g. "3 Team Inbox") — no team names, no Team Inbox selector. | Agent reads the scope → confirms. | US-007, US-010, US-011 |
| **In-progress button state** | Disabled button, spinner icon, label "Sedang sinkronisasi...". Persisted across navigation via status polling. | Agent sees the same state on every visit until the run ends. | US-007, US-008 |
| **Last run summary** | Helper text next to the button: last finished time and inserted/skipped counts, or the failure reason. Latest run only — no history list. | Agent understands the outcome without opening another page. | US-009 |
| **Toasts** | Success on trigger ("Sinkronisasi dimulai"), success on completion detection, error toasts for every rejection path. No push/email notification. | Standard app toast placement. | US-007, US-009 |
| **Contact table refresh** | On transition to `done`, the contacts query is invalidated and refetched. | New contacts appear without a manual reload. | US-009 |

**All user-facing copy goes through next-intl with `en` and `id` messages; primary UI language is Bahasa Indonesia.**

---

## 10. Field & Validation

### Sync setting fields

| Field | Type | Example | Validation | Required | Default |
|---|---|---|---|---|---|
| `isEnabled` | Boolean | `true` | — | Required | `false` |
| `apiUri` | String | `https://open-api.partner.id/v1/contacts` | Absolute `https://` URL. Max 500 chars. Not loopback/private/link-local. Change invalidates cursors. | Required | — |
| `tokenHeaderKey` | String | `x-api-key` | Valid HTTP header token characters. 1–100 chars. | Required | — |
| `tokenValue` | String (encrypted) | `sk_live_...` | 1–2000 chars. Encrypted at rest. Masked on read. Never logged. | Required | — |
| `pageSize` | Integer | `100` | Integer 1–100 (100 is both default and max). Change invalidates cursors. | Required | `100` |
| `fieldMappings[].sourceKey` | String | `id`, `phoneNumber` | 1–100 chars. Top-level JSON key of a record. Unique within the array. | Required | — |
| `fieldMappings[].targetField` | Enum | `referenceId` | One of `referenceId`, `phone`, `name`, `email`, `alias`, `username`. Unique within the array. Must include `referenceId`. Change invalidates cursors. | Required | — |
| `lastTestedAt` | Date | `2026-07-29T10:00:00Z` | Set by the test action. | Derived | `null` |

### Sync record fields

| Field | Type | Example | Validation | Required | Default |
|---|---|---|---|---|---|
| `status` | Enum | `in_progress` | One of `in_progress`, `done`, `failed`. | Required | `in_progress` |
| `teamInboxIds` | ObjectId[] | `["66f...", "66g..."]` | Snapshot of all Team Inboxes of the triggering user. Length ≥ 1. | Required | — |
| `channelId` | ObjectId | `66a...` | Must be an active WhatsApp Web channel of the company. | Required | — |
| `triggeredBy` | ObjectId | `66b...` | User id from the request context. | Required | — |
| `pageSize` | Integer | `100` | Snapshot of the configured page size at run start. | Required | `100` |
| `startPage` | Integer | `13` | ≥ 1. Derived from the minimum cursor across teams in scope. | Required | `1` |
| `lastCompletedPage` | Integer | `64` | ≥ 0. Updated after each committed page. | Derived | `0` |
| `totalRecords` | Integer | `6343` | ≥ 0. Taken from the first page's `total`. | Derived | `0` |
| `processed` | Integer | `6343` | ≥ 0. Records read from the source. | Derived | `0` |
| `inserted` | Integer | `6210` | ≥ 0. New contacts created. | Derived | `0` |
| `skippedExisting` | Integer | `128` | ≥ 0. Contacts already present — untouched. | Derived | `0` |
| `skippedInvalid` | Integer | `4` | ≥ 0. Records with no usable `referenceId`. | Derived | `0` |
| `failed` | Integer | `1` | ≥ 0. Records that errored during insert or context creation. | Derived | `0` |
| `areaContextsCreated` | Integer | `12420` | ≥ 0. New Area Contexts across all teams in scope. | Derived | `0` |
| `failureReason` | String | `third_party_unauthorized` | Set only when `status = failed`. | Optional | `null` |
| `startedAt` / `completedAt` | Date | `2026-07-29T10:00:00Z` | `completedAt` set on terminal status. | Derived | — |
| `expiresAt` | Date | `2026-08-28T10:00:00Z` | Set at creation to `startedAt + 30 days`. Backed by a Mongo TTL index. | Derived | `startedAt + 30d` |

### Runtime constants

| Name | Value | Notes |
|---|---|---|
| `SYNC_PAGE_SIZE_DEFAULT` | 100 | Default when the company has not set one. |
| `SYNC_PAGE_SIZE_MIN` / `MAX` | 1 / 100 | Validation bounds for the configurable page size. The max equals the default — the setting only allows going lower. |
| `SYNC_RECORD_RETENTION` | 30 days | TTL on sync records before automatic purge. |
| `SYNC_CURSOR_TTL` | 7 days | Configurable; matches the weekly re-sync cadence. |
| `SYNC_PAGE_TIMEOUT` | 30 seconds | Per third-party page request. |
| `SYNC_PAGE_RETRY_ATTEMPTS` | 3 | Exponential backoff on retryable errors. |
| `SYNC_INTER_PAGE_DELAY` | 200 ms | Rate-limit courtesy delay. |
| `SYNC_MAX_PAGES` | 1000 | Runaway-pagination guard. |
| `SYNC_STALE_THRESHOLD` | 60 minutes | After this, an `in_progress` run is swept to `failed`. |
| `SYNC_STATUS_POLL_INTERVAL` | 10 seconds | Frontend polling while a run is active. |

### Sample mapping against the provided payload

| Source key | Target | Notes |
|---|---|---|
| `id` | `referenceId` | Required mapping; also stored in `metaData` as the external id. |
| `phone` | `phone` | `phoneLast4` derived. `null` values omitted. |
| `name` | `name` | — |
| `email` | `email` | — |
| `lastOrderAddress` → `firstOrderAddress` | `address` | Fixed fallback rule, not user-configurable. Normalized, trimmed, truncated to 200 chars. Single string only. |
| `userPrefix`, `isPostpaid` | `metaData.<namespace>` | Optionally preserved as raw attributes (FR-078). |
| `firstOrderProvince/City/District`, `lastOrderProvince/City/District`, `firstOrderAt`, `lastOrderAt` | *(discarded)* | Structured address components are intentionally not stored (FR-076). |
| — | `channelId` | Forced to the company's active WhatsApp Web channel. |
| — | Area Context | `area = sales`, one per Team Inbox of the triggering user. |

---

## 11. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Sync trigger endpoint responds in under 1 second (p95); it only writes the sync record and emits the background event. |
| Performance | Status-poll endpoint responds in under 300ms (p95). |
| Throughput | A 6,500-record dataset (≈65 pages at `pageSize=100`) completes within 10 minutes under normal partner latency, for a user with up to 3 Team Inboxes. |
| Scalability | Page size is bounded (max 100); memory usage per page is bounded and independent of the total dataset size. |
| Scalability | Area Context writes scale as `records × teams in scope` — the worker MUST batch these writes rather than issuing one round trip per (record, team) pair. |
| Scalability | Concurrent runs are limited to one per company + organization; multiple companies may sync in parallel. |
| Reliability | Insert-only semantics make the run idempotent — re-running over identical data produces no duplicate contacts and no duplicate Area Contexts. |
| Reliability | No sync run may modify a pre-existing contact document under any circumstance. |
| Reliability | Committed pages survive a mid-run failure; retry resumes from the cursor rather than restarting. |
| Reliability | Redis unavailability degrades efficiency (full re-read) but never correctness. |
| Security | `tokenValue` encrypted at rest, masked on read, never logged, never returned to the frontend in plaintext. |
| Security | `apiUri` restricted to HTTPS and validated against SSRF (no loopback/private/link-local targets). |
| Security | Both permissions enforced server-side on every endpoint; UI gating is presentation only. |
| Security | Every read/write scoped by `companyId` + `organizationId`. |
| Observability | Log per run: `syncRecordId`, `companyId`, `organizationId`, `teamInboxIds`, `page`, `pageDurationMs`, per-page counters, terminal status, failure reason. Never log the token or full contact PII. |
| Observability | Metrics: run count, run duration, records processed/inserted/skipped/failed, Area Contexts created, third-party error rate by status code, cursor hit rate (resumed vs. full re-read). |
| Localization | All copy available in `en` and `id`. |
| Accessibility | Sync button, confirmation dialog, and settings form fully keyboard navigable with visible focus states; the disabled in-progress state exposes an accessible label. |

---

## 12. Dependencies & Risks

| Dependency or Risk | Owner | Impact | Mitigation |
|---|---|---|---|
| **Dependency**: New permission actions seeded to existing roles (DB migration script). | Engineering | Without seeding, nobody can configure or run the sync. | Ship the seeding script with the release, following the existing `tools/scripts/db` pattern. |
| **Dependency**: Organization schema extension in company-service + gRPC contract for reading the sync setting. | Engineering | Worker cannot read the configuration. | Define the proto change early; regenerate proto types before implementation. |
| **Dependency**: Resolving the triggering user's Team Inbox list. | Engineering | Area Contexts cannot be created without it. | Reuse the existing team-membership lookup in people-service. |
| **Dependency**: An active WhatsApp Web channel per company. | Product/Ops | Sync is blocked for companies without one. | Explicit precondition error; document it in onboarding. |
| **Dependency**: Redis availability for the cursor. | Infrastructure | Loss of resume efficiency. | Graceful degradation to page 1 (FR-061). |
| **Dependency**: Third-party API stability and rate limits. | Partner | Failed or throttled runs. | Backoff + retry, inter-page delay, configurable page size, explicit failure reasons. |
| **Risk**: Third-party response shape differs from the reference sample (`data`, `page`, `total`, `hasNextPage`). | Engineering | Sync fails for a non-conforming partner. | v1 fixes the envelope contract and fails loudly (EH-011); configurable envelope paths are a future consideration. |
| **Risk**: Insert-only means source-side corrections never reach SatuInbox. | Product | Stale names/phones persist indefinitely once a contact exists. | Accepted trade-off to protect agent-curated data (PS-007). Documented as a limitation; a future opt-in "refresh existing" mode can revisit it. |
| **Risk**: Area Context volume — `contacts × teams` rows. | Engineering | Collection growth for users in many teams (EC-012). | Batch the writes; monitor `contactareacontexts` size; the existing unique index keeps it bounded and duplicate-free. |
| **Risk**: Duplicate contacts when a synced person already exists under a different identity. | Product | Agents see two records for one person. | Documented limitation (EC-004); merge/dedupe tooling deferred. |
| **Risk**: Large sync floods the contacts collection and slows list queries. | Engineering | Degraded Contacts page performance for big tenants. | Existing contact indexes cover company/org/phone/referenceId; benchmark list queries at 100k+ contacts before rollout. |
| **Risk**: Token leakage through logs or error payloads. | Engineering/Security | Credential compromise. | Explicit no-log rule (FR-017), masked responses, redaction check in code review. |
| **Risk**: SSRF via a user-supplied `apiUri`. | Security | Internal network probing from the worker. | URL allowlist rules and private-range rejection (FR-016). |
| **Risk**: Company-level concurrency lock blocks a second user who needs Area Contexts for their teams. | Product | Temporary wait only — they can run once the active run finishes. | Clear "sedang berjalan" messaging; runs are short relative to the weekly cadence. |
| **Risk**: Stale `in_progress` runs permanently blocking new syncs. | Engineering | Users cannot retry. | Staleness sweep (FR-033). |

---

## 13. Success Metrics

| KPI | Target | Time Window | Data Source |
|---|---|---|---|
| Sync run success rate (`done` / total runs) | ≥ 95% | 30 days after release | Sync record aggregation |
| New records successfully inserted per run | ≥ 99% of not-yet-existing records returned by the third party | 30 days after release | Run counters |
| Writes to pre-existing contacts | 0 | Ongoing | Contact update audit / run counters |
| Duplicate contacts created on re-sync | 0 | Per run | Run counters (`inserted` on an unchanged dataset) |
| Trigger endpoint p95 latency | < 1 second | Ongoing | Application monitoring |
| Full sync duration for ~6,500 records | < 10 minutes | Ongoing | Run duration metric |
| Cursor hit rate (runs resumed vs. restarted) | ≥ 70% of runs within the TTL window resume | 30 days after release | Cache metrics |
| Companies with a configured sync integration | Baseline then monitor | 60 days after release | Organization settings |
| Third-party auth failures (401/403) | < 2% of runs | Ongoing | Run failure reasons |

---

## 14. Future Considerations

| Topic | Why It Matters Later |
|---|---|
| Opt-in "refresh existing contacts" mode | The insert-only rule protects agent edits but freezes source corrections; an explicit, field-scoped refresh could resolve that safely. |
| Scheduled/automatic weekly sync (cron) | Removes the manual click entirely; the TTL design already assumes a weekly cadence. |
| Configurable response envelope paths (`data`, `page`, `hasNextPage`) | Onboards partners whose response shape differs without a code change. |
| Multiple sync integrations per company | Companies that pull contacts from more than one external system. |
| Incremental sync via `updatedSince` | Far cheaper than page-based re-reads once the partner supports it. |
| Phone-level dedupe / contact merge | Resolves the synced-vs-WhatsApp duplicate case (EC-004). |
| Sync run history + per-record error report | Deliberately excluded from v1; useful once volumes grow and admins need to debug bad source rows. |
| Configurable `area` and target channel | Some companies will want `operational` contexts or a non-WhatsApp channel. |
| Mapping to tags / custom attributes | Richer segmentation for broadcast and sales targeting. |
| Real-time progress via WebSocket | Replaces polling with a live progress bar for very large datasets. |
| Two-way sync (SatuInbox → third party) | Keeps the external system current when agents edit contacts. |

---

## 15. Limitations

| Limitation | Impact |
|---|---|
| **Insert-only** — an existing contact is never updated. | Source-side corrections (renamed customer, new phone) never propagate. Only genuinely new records are added. |
| Contact identity is `(channelId, referenceId)` only. | The same person under a different external id, or already present from a WhatsApp conversation, becomes a second record (EC-003, EC-004). |
| One sync configuration per organization. | Companies with two source systems must pick one for v1. |
| Response envelope is fixed to `{ success, data[], page, total, hasPrevPage, hasNextPage }`. | Non-conforming partners cannot be onboarded without a code change. |
| Auth is a single static header key/value. | OAuth, HMAC, and refresh-token partners are unsupported. |
| The page cursor lives only in Redis. | A cache flush costs efficiency (full re-read), never correctness. |
| Sync is manual only. | Weekly refresh depends on someone clicking the button. |
| Area Context always covers all of the triggering user's teams and only `area = sales`. | A user in many teams generates many contexts; operational teams never gain visibility from a sync. |
| One run at a time per company. | A second user must wait for the active run before their teams gain Area Contexts. |
| Address is a single truncated string (200 chars max); structured components are discarded. | Long source addresses lose their tail; province/city/district are not queryable. |
| `channelId` is always the company's WhatsApp Web channel. | Companies whose customers are reachable only on another channel get a WhatsApp-bound record. |
| No run history and no per-record error visibility in the UI. | Admins see the latest run's aggregate counters only. |
| Sync records are purged after 30 days. | No long-term record of what a sync did. The contacts and Area Contexts it created are unaffected. |
| `pageSize` cannot exceed 100. | Partners that would allow larger pages cannot be used to speed up a run. |
| No completion notification. | The agent must revisit the Contacts page to see the outcome. |

---

## 16. Appendix

### Glossary

| Term | Definition |
|---|---|
| Sync setting | The per-organization third-party contact integration configuration stored on the `organizations` document. |
| Sync record (run) | A single execution of the sync, with status `in_progress` / `done` / `failed` and per-run counters. Only the latest is exposed. |
| Page cursor | The Redis-only marker of the last successfully committed page for a company + Team Inbox, with a TTL. |
| Field mapping | A `sourceKey → targetField` pair applied to every record returned by the third party. |
| Area Context | The existing SatuInbox record that makes a Global Contact visible to a specific `area` (`sales` / `operational`) within a Team Inbox. |
| Teams in scope | All Team Inboxes the triggering user belongs to, snapshotted at trigger time. |
| Insert-only | The rule that the sync may create contacts but may never write to a contact that already exists. |
| Sync flag | The provenance marker written into `clientcontacts.metaData` identifying a record as third-party sourced. |

### UI Labels (Bahasa Indonesia)

| Label | Usage |
|---|---|
| "Sync Kontak" | Contacts page button (idle) and Settings navigation item |
| "Sedang sinkronisasi..." | Contacts page button (running) |
| "Kontak akan ditambahkan ke area Sales di {count} Team Inbox Anda. Kontak yang sudah ada tidak akan diubah." | Confirmation dialog body (count only, no team names) |
| "Sinkronisasi dimulai" | Trigger success toast |
| "Sinkronisasi selesai — {inserted} kontak baru, {skipped} dilewati" | Completion summary |
| "Sinkronisasi gagal. {reason}" | Failure summary |
| "Sinkronisasi sedang berjalan. Tunggu hingga selesai." | Concurrent trigger rejection |
| "Integrasi sync kontak belum dikonfigurasi." | Missing configuration |
| "Belum ada channel WhatsApp Web aktif. Hubungkan channel terlebih dahulu." | Missing WhatsApp Web channel |
| "Anda belum tergabung di Team Inbox mana pun." | User has no team |
| "Token ditolak oleh API pihak ketiga. Periksa pengaturan token." | 401/403 from partner |
| "Format respons API tidak sesuai." | Invalid response shape |
| "URI API" / "Key Header Token" / "Nilai Token" / "Jumlah Data per Halaman" | Settings form labels |
| "Mengubah nilai ini akan memulai sinkronisasi dari halaman pertama." | Page size / URI / mapping change helper text |
| "Pemetaan Field" / "Tambah Pemetaan" | Mapping editor labels |
| "Test Koneksi" | Settings test action |

### Sample third-party response (reference contract)

```json
{
  "success": true,
  "data": [
    {
      "id": "6a4dd2c021144a3aae7854b9",
      "email": "wever88339@duvips.com",
      "phone": "6281234567",
      "name": "tester cbd 13",
      "userPrefix": "Z7JK",
      "firstOrderProvince": null,
      "firstOrderCity": null,
      "firstOrderDistrict": null,
      "lastOrderAddress": "Jl. Kartini No. 129, RT 04/RW 01, Kel. Cicendo, Setiabudi, Kota Jakarta Selatan, DKI Jakarta",
      "lastOrderAt": "2026-07-21T09:35:54.180Z",
      "lastOrderProvince": "DKI Jakarta",
      "lastOrderCity": "Kota Jakarta Selatan",
      "lastOrderDistrict": "Setiabudi"
    }
  ],
  "page": "1",
  "total": 6343,
  "hasPrevPage": false,
  "hasNextPage": true
}
```

Outbound request per page:

```text
GET {apiUri}?page={n}&pageSize={configuredPageSize}
{tokenHeaderKey}: {tokenValue}
Accept: application/json
```

### API Contracts (Summary — proposed, TRD confirms)

#### `GET /settings/sync-contact` — read configuration

Permission: `setting:manage_sync_contact`

```json
{
  "success": true,
  "data": {
    "isEnabled": true,
    "apiUri": "https://open-api.partner.id/v1/contacts",
    "tokenHeaderKey": "x-api-key",
    "tokenValueMasked": "••••••••4f2a",
    "pageSize": 100,
    "fieldMappings": [
      { "sourceKey": "id", "targetField": "referenceId" },
      { "sourceKey": "phone", "targetField": "phone" },
      { "sourceKey": "name", "targetField": "name" },
      { "sourceKey": "email", "targetField": "email" }
    ],
    "lastTestedAt": "2026-07-29T09:55:00Z",
    "updatedAt": "2026-07-29T09:55:00Z"
  }
}
```

#### `PUT /settings/sync-contact` — upsert configuration

Permission: `setting:manage_sync_contact`. Omitting `tokenValue` preserves the stored token. Changing `apiUri`, `pageSize`, or `fieldMappings` invalidates all cached cursors for the company.

#### `POST /settings/sync-contact/test` — test connection

Permission: `setting:manage_sync_contact`. Calls the endpoint with `page=1&pageSize=1`; writes nothing and does not touch the cursor.

#### `POST /client-contact/sync` — trigger a sync run

Permission: `client_contact:sync_contact_third_party`. No request body — the team scope is derived from the authenticated user.

```json
// response 201
{
  "success": true,
  "data": {
    "id": "66f9c1d2e3f4a5b6c7d80011",
    "status": "in_progress",
    "teamInboxIds": ["66f1a2b3c4d5e6f70819aabb", "66f1a2b3c4d5e6f70819aacc"],
    "channelId": "66a0b1c2d3e4f5a6b7c80022",
    "startPage": 13,
    "pageSize": 100,
    "startedAt": "2026-07-29T10:00:00Z"
  }
}
```

#### `GET /client-contact/sync/status` — latest run only

Permission: `client_contact:sync_contact_third_party`

```json
{
  "success": true,
  "data": {
    "id": "66f9c1d2e3f4a5b6c7d80011",
    "status": "done",
    "totalRecords": 6343,
    "processed": 6343,
    "inserted": 6210,
    "skippedExisting": 128,
    "skippedInvalid": 4,
    "failed": 1,
    "areaContextsCreated": 12420,
    "lastCompletedPage": 64,
    "startedAt": "2026-07-29T10:00:00Z",
    "completedAt": "2026-07-29T10:07:41Z",
    "failureReason": null
  }
}
```

#### Backend surface (proposed)

| Concern | Placement |
|---|---|
| Sync setting storage + CRUD + encryption | company-service (`organizations` document, `CryptoService`) |
| Sync record + contact insert + Area Context | people-service (owns `clientcontacts` and `contactareacontexts`) |
| Background worker (third-party HTTP pull, pagination loop, cursor) | people-service RabbitMQ consumer |
| Team Inbox membership resolution | people-service (teams / team-members) |
| WhatsApp Web channel resolution | channel-service via gRPC |
| HTTP surface (settings + trigger + status) | api-gateway |
| Page cursor | Redis, key `contact:sync:cursor:<companyId>:<teamInboxId>`, TTL 7 days |

#### Frontend surface (proposed)

| Concern | Placement |
|---|---|
| Settings page | `frontend/apps/omnichannel/app/[locale]/(main)/settings/developer/sync-contact/page.tsx` |
| Sync button + confirmation dialog + status polling | `frontend/apps/omnichannel/components/pages/contacts/ManageContactsPage.tsx` and molecules under `components/molecules/contacts/sync/` |
| Query/mutation hooks | `services/people/` using `useQueryWithSession` + `useAxiosPrivateApi` |
| Copy | `frontend/packages/i18n/src/translations/` (`contact` + `settings` namespaces, `en` + `id`) |

### Permissions Added

| Permission | Resource | Action | Gates |
|---|---|---|---|
| `setting:manage_sync_contact` | `setting` | `manage_sync_contact` (new) | Read/write the sync configuration; Settings → Developer menu visibility. |
| `client_contact:sync_contact_third_party` | `client_contact` | `sync_contact_third_party` (new) | Trigger a sync run; read run status; Sync button visibility. |

### Resolved Decisions (v1.1)

| # | Decision |
|---|---|
| D1 | The run creates Area Contexts for **all** Team Inboxes the triggering user belongs to. No Team Inbox selector in the UI. |
| D2 | Address is stored only as the existing single `address` string. No structured province/city/district fields on the schema, and the source's address components are discarded. |
| D3 | **Insert-only.** If a contact already exists it is skipped — never updated, never upserted. |
| D4 | A skipped (already-existing) contact still gets Area Contexts created for the triggering user's teams, so a second user from different teams can bring existing contacts into their teams' Sales list. |
| D5 | No sync run history surface. Only the latest run is exposed, for button state and the inline summary. |
| D6 | Changing `apiUri`, `fieldMappings`, or `pageSize` invalidates the cached cursors — the next run restarts from page 1. |
| D7 | `pageSize` is configurable per company (default 100) — bounds refined in D13. |
| D8 | No completion notification — the button state and inline summary are sufficient. |
| D9 | The setting page lives under **Settings → Developer**, next to Shipping Credentials. |
| D10 | *(Derived from D1)* Cursors stay keyed by company + Team Inbox. A run resumes from the **minimum** `lastCompletedPage` across the teams in scope and writes the cursor for **all** of them after each page, so no team ever misses coverage. |
| D11 | *(Derived from D1)* The concurrency lock is per company + organization rather than per Team Inbox, since a run now spans multiple teams. |
| D12 | Sync records are retained for **30 days**, then purged automatically by a Mongo TTL index. Purging never touches the contacts, Area Contexts, or Redis cursors. |
| D13 | `pageSize` range is **1–100**; 100 is both the default and the maximum. The setting exists to accommodate partners with a lower page cap, not to raise throughput. |
| D14 | The confirmation dialog states the **count** of affected Team Inboxes only — no team names. |

### Assumptions

| # | Assumption |
|---|---|
| A1 | The third-party endpoint accepts `page` and `pageSize` as query parameters and returns the reference envelope shown above. |
| A2 | The third-party API authenticates with a single static header (key + value); no token refresh is required. |
| A3 | The external `id` is stable across syncs, making it a safe `referenceId`. |
| A4 | Every company running a sync has exactly one active WhatsApp Web channel (or accepts the deterministic oldest-active rule). |
| A5 | Weekly is the intended cadence, which is why the cursor TTL defaults to 7 days. |
| A6 | Synced contacts belong to the Sales area only; no operational-area requirement in v1. |
| A7 | The existing `(channelId, referenceId)` unique index is the sole identity check for "already exists". |
| A8 | The existing unique index on (`area`, `contactId`, `status`, `teamInboxId`) makes Area Context creation idempotent. |
| A9 | Contact volumes per company stay within the range the current Contacts list and indexes already handle (tens of thousands). |
| A10 | Existing `metaData` on a contact is safe to write on insert and is not schema-validated. |
| A11 | Users typically belong to a small number of Team Inboxes (single digits), keeping Area Context fan-out bounded. |

### Open Questions

None outstanding as of v1.2 — every question raised in v1.0 and v1.1 is answered in the Resolved Decisions table above (D1–D14). This PRD is ready to drive a TRD.

### References

| Item | Path |
|---|---|
| Organization schema (setting host) | `backend/apps/company-service/src/app/schemas/organization.schema.ts` |
| Encrypted-credential precedent | `backend/apps/company-service/src/app/schemas/shipping-credential.schema.ts`, `.../services/shipping-credential.service.ts` |
| Client Contact schema | `backend/apps/people-service/src/app/schemas/client-contact.schema.ts` |
| Contact Area Context schema | `backend/apps/people-service/src/app/schemas/contact-area-context.schema.ts` |
| Contact write path (to be bypassed by insert-only logic) | `backend/apps/people-service/src/app/services/client-contact.service.ts` (`upsertContact`) |
| Area Context upsert precedent | `backend/apps/people-service/src/app/repositories/contact-area-context.repository.ts` (`upsertActiveContext`) |
| Contact HTTP surface | `backend/apps/api-gateway/src/app/client-contact/client-contact.controller.ts` |
| Permission constants | `backend/libs/common/src/lib/constants/default-permission.constant.ts`, `backend/libs/common/src/lib/enums/index.ts` |
| Background job precedent (status + worker) | `backend/apps/analytics-service/src/app/schemas/export-report-job.schema.ts`, `backend/apps/conversation-service/src/app/processors/export-job.processor.ts` |
| Cache TTL / key prefix enums | `backend/libs/cache/src/lib/enums/cache.enum.ts` |
| Contacts page (Sync button host) | `frontend/apps/omnichannel/components/pages/contacts/ManageContactsPage.tsx` |
| Developer settings siblings | `frontend/apps/omnichannel/app/[locale]/(main)/settings/developer/` (`shipping-credentials`, `webhook`) |
| Frontend RBAC types | `frontend/apps/omnichannel/types/rbac.ts` |
