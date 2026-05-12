# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Public ID Prefix and Sequential Numbering for Conversation and Ticket  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 23 Jan 2026 | Yusril Ibnu Maulana | Initial PRD for public ID format: Conversation uses CV, Ticket uses TK, sequential numbering starts from 0\. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a consistent, human-readable public ID for Conversation and Ticket for UI, search, exports, and customer references. |
| Scope | Implement new public ID formats with sequential numbering and ensure uniqueness per tenant. |

| In Scope | Out of Scope |
| ----- | ----- |
| Conversation public ID format `CV-{n}`. | Replace internal immutable IDs (UUID). |
| Ticket public ID format `TK-{n}`. | Migration of external systems data beyond assigning new public IDs. |
| Sequential numbering starts at `0` and increments by `1`. | Cross-tenant global numbering. |
| Atomic uniqueness under concurrent creation. | Custom per-team numbering schemes. |
| Backfill for existing records without public ID. | UI redesign of Conversation and Ticket pages. |

---

## **3\. Problem Statement**

| \# | Problem | Impact |
| ----- | ----- | ----- |
| 1 | Conversation and Ticket identifiers are inconsistent and sometimes not user-friendly. | Slower support operations, harder coordination, higher mis-reference risk. |
| 2 | No standard rule for numbering growth when digit length increases. | Confusion in exports, reports, and verbal references. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Standardize human-readable IDs. | 100 percent of Conversations and Tickets display a public ID in UI and exports. |
| Ensure uniqueness at scale. | 0 duplicated public IDs per tenant measured via audit checks. |
| Minimize operational friction. | Reduce time to locate an item by ID in search by 30 percent within 30 days. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an agent, I want to reference a Conversation by a short ID so that I can coordinate faster with my team. | 1\. Given a Conversation exists, When I open its detail, Then I see its public ID in format `CV-{n}`. 2\. Given I copy the public ID, When I paste it into global search, Then the Conversation is found. 3\. Given I search a non-existing public ID, When I submit search, Then the system shows an empty state and no wrong result is returned. |
| US-002 | P0 | As a supervisor, I want Ticket IDs to be consistent so that reporting and escalation are unambiguous. | 1\. Given a Ticket exists, When I open its detail, Then I see its public ID in format `TK-{n}`. 2\. Given I export tickets, When export completes, Then each row includes the Ticket public ID. 3\. Given two tickets are created concurrently, When both are saved, Then each has a unique public ID within the tenant. |
| US-003 | P0 | As an admin, I want numbering to start from 0 and grow naturally so that there is no hard limit. | 1\. Given a new tenant with zero Conversations, When the first Conversation is created, Then its public ID is `CV-0`. 2\. Given `CV-9` exists, When the next Conversation is created, Then its public ID is `CV-10`. 3\. Given a Ticket sequence reaches `TK-99`, When the next Ticket is created, Then its public ID is `TK-100`. |
| US-004 | P1 | As an operator, I want older data to be assignable so that every record can be referenced consistently. | 1\. Given an existing Conversation has no public ID, When backfill runs, Then a public ID is assigned and stored permanently. 2\. Given backfill assigns IDs, When I refresh the UI, Then the public ID is shown consistently across all surfaces. 3\. Given backfill fails for a record, When I view the item, Then the UI shows a fallback label and the error is logged for retry. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Public ID Format | FR-001: System MUST generate Conversation public ID with prefix `CV-` plus an integer counter. FR-002: System MUST generate Ticket public ID with prefix `TK-` plus an integer counter. FR-003: System MUST store public ID as immutable once assigned. FR-004: System MUST treat prefixes as uppercase for display and storage. |
| Numbering Rules | FR-005: System MUST start the sequence at `0` for each tenant and entity type when no prior public IDs exist. FR-006: System MUST increment by `1` for each new item within the same tenant and entity type. FR-007: System MUST allow digit length to grow naturally with base-10 representation without a maximum digit cap. FR-008: System MUST NOT reuse public IDs even if an item is deleted or merged. |
| Uniqueness and Concurrency | FR-009: System MUST guarantee uniqueness of public ID per tenant and entity type under concurrent creation. FR-010: System MUST fail the creation if a unique constraint is violated and MUST retry generation automatically up to 3 times before returning an error. |
| Surfaces | FR-011: System MUST display public ID on Conversation detail and Ticket detail. FR-012: System MUST include public ID in exports for Conversations and Tickets where those exports exist. FR-013: System MUST support searching by exact public ID for Conversations and Tickets. |
| Backfill | FR-014: System MUST provide a backfill process to assign public IDs for existing records missing public ID. FR-015: Backfill MUST be idempotent and MUST NOT change already-assigned public IDs. FR-016: Backfill MUST preserve ordering by assigning from the next available counter based on the current maximum per tenant and entity type. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Sequence lock contention | Retry public ID generation up to 3 times with small randomized delay. | Show toast: `Gagal membuat ID. Coba lagi.` |
| EH-002 | Unique constraint violation | Regenerate next counter and retry up to 3 times. | No user action required unless all retries fail. |
| EH-003 | Backfill partial failure | Mark record as pending retry and continue processing others. | On affected item show label: `ID belum tersedia` |
| EH-004 | Search invalid format | Reject search input that does not match `CV-[0-9]+` or `TK-[0-9]+`. | Show inline error: `Format ID tidak valid` |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Tenant has legacy IDs with different prefixes in UI history. | System shows new public ID field where available and does not attempt to rewrite historical text. |
| EC-002 | Item cloned or duplicated. | Clone MUST receive a new public ID from the next sequence number. |
| EC-003 | Cross-tenant data move. | Moved item MUST receive a new public ID in the destination tenant and preserve old public ID only in internal audit log. |
| EC-004 | Backfill runs while new items are created. | System MUST ensure no collisions by reserving counters atomically during assignment. |
| EC-005 | Very large counters. | System MUST support counters beyond 32-bit range and continue rendering as base-10 string. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Conversation Detail Header | Show public ID label near title. | 1\. User opens Conversation detail. 2\. Header shows `CV-{n}`. 3\. User can copy ID from a copy button. | US-001, US-003 |
| Ticket Detail Header | Show public ID label near title. | 1\. User opens Ticket detail. 2\. Header shows `TK-{n}`. 3\. User can copy ID from a copy button. | US-002, US-003 |
| Global Search | Support exact match search by public ID. | 1\. User enters `CV-10` or `TK-10`. 2\. System routes to the matching entity result list or directly opens detail if unique. | US-001, US-002 |
| Fallback State | When public ID missing due to backfill pending or failure. | 1\. User opens detail. 2\. UI shows `ID belum tersedia` and keeps the page usable. | US-004 |

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| conversation\_public\_id | string | `CV-0` | Must match regex `^CV-[0-9]+$` | Yes |
| ticket\_public\_id | string | `TK-0` | Must match regex `^TK-[0-9]+$` | Yes |
| search\_input | string | `CV-10` | If starts with `CV-` must match `^CV-[0-9]+$`. If starts with `TK-` must match `^TK-[0-9]+$`. | No |

---

## **11\. Non-Functional Requirements**

| Area | Requirement |
| ----- | ----- |
| Performance | Public ID generation MUST add no more than 50 ms p95 to create flows. |
| Reliability | Public ID generation MUST succeed at least 99.9 percent of the time. |
| Security | Public IDs MUST not expose internal UUIDs or sensitive metadata. |
| Observability | System MUST log creation failures, retry counts, and backfill failures per tenant. |
| Data Integrity | Public IDs MUST be unique per tenant and entity type enforced by database constraint. |

---

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Existing exports and search implementations | Engineering | Missing surfaces cause partial rollout. | Audit all export and search endpoints and add public ID fields. |
| Legacy data without public IDs | Engineering | UI inconsistency during transition. | Run backfill job and show fallback UI until complete. |
| Concurrency spikes | Engineering | Duplicate IDs if non-atomic increment. | Enforce atomic counter reservation and unique constraint. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Coverage of public ID | 100 percent for newly created items | Day 1 after release | DB audit |
| Duplicate public ID incidents | 0 | Monthly | Error logs and DB constraint violations |
| Search by ID success rate | 95 percent | 30 days | Search analytics |
| Backfill completion | 99.9 percent records assigned | 7 days | Backfill job logs |

---

## **14\. Future Considerations**

| Topic | Why it matters |
| ----- | ----- |
| Configurable prefixes per workspace | Some enterprise customers may request custom prefixes. |
| Unified entity ID field `entity_public_id` | Simplifies templating and notifications across entity types. |
| Check-digit or short hash suffix | Helps reduce typos in manual references. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Public IDs are sequential per tenant and can imply volume. | Some customers may infer activity scale. |
| Deletions do not reclaim numbers. | Gaps can appear in sequences. |

---

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Glossary | Public ID: Human-readable identifier for UI and operations. Internal ID: Immutable UUID for system references. |
| Examples | Conversation: `CV-0`, `CV-1`, `CV-10`. Ticket: `TK-0`, `TK-1`, `TK-100`. |
| UI Copy | `ID Percakapan ID Tiket Salin ID ID belum tersedia Format ID tidak valid Gagal membuat ID. Coba lagi.` |

