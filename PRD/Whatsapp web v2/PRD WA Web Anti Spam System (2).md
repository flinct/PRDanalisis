# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Private Bot Farm Warming System (WhatsApp Web)  
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

Prototype: [https://chatgpt.com/canvas/shared/6984284782a88191bafcd848d1378d0b](https://chatgpt.com/canvas/shared/6984284782a88191bafcd848d1378d0b) 

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2026-02-05 | Yusril Ibnu | Init |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide an optional add-on to warm up tenant-owned WhatsApp Web accounts using internal, private conversations to reduce early instability risk and reduce restriction risk. |
| Outcome | Accounts become production-ready faster while warming noise never appears in Omnichannel Inbox and agent notifications. |

| In Scope | Out of Scope |
| ----- | ----- |
| Dedicated Warming page with tabs: "Akun & Aktivitas", "Transkrip Harian", "Pengaturan". | AI-generated message creation. |
| Start warming per account and run multiple accounts concurrently. | Warming with external contacts or customers. |
| Auto pairing inside a tenant "warming network" with minimum 2 eligible accounts. | Manual buddy or manual pair assignment in UI. |
| Humanized message sending: bubble split by sentence grouping, delays, optional quoted replies. | Complex workflow builder. |
| Transcript queue per day with status and modal view (JSON). | Copy export, transcript date filters. |
| Editable level (1 to 5\) with stars and optional auto level up. | Custom retention controls in UI. |
| Warming logs show what messages were sent within retention window. | Showing warming conversations in Omnichannel Inbox. |

---

## **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Newly added WhatsApp Web accounts can be unstable if used immediately at scale. | Higher disconnect and restriction risk, disrupts operations. |
| 2 | Warming activity can create inbox noise if treated like normal conversations. | Agent distraction and unread counters become noisy. |
| 3 | Global retention is too long for synthetic warming data. | Storage bloat with low business value. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve account readiness | 80% of new accounts used in warming reach level 3 or higher within 14 days. |
| Keep inbox clean | 0 warming messages appear in Omnichannel Inbox lists, search, counters, notifications. |
| Reduce operational risk | 95% of warming runs finish daily schedule without manual intervention. |

---

## **5\. User Stories and Acceptance Criteria**

### **Admin**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to enable or disable Warming so that I control whether the add-on runs. | 1\. Given I am Admin, When I open "Pengaturan", Then I can toggle "Warming" ON or OFF. 2\. Given Warming is OFF, When I attempt "Mulai Warming" on any account, Then the system blocks and shows "Warming belum diaktifkan". 3\. Given Warming is ON, When I toggle it OFF, Then all running warming schedules stop scheduling new messages and show note "Berhenti". |
| US-002 | P0 | As an Admin, I want to start warming for one WhatsApp account so that it joins the internal warming network. | 1\. Given Warming is ON and the account is "Tersambung", When I click "Mulai Warming", Then the account note becomes "Running" and status becomes "Warming". 2\. Given the tenant has fewer than 2 eligible accounts, When I click "Mulai Warming", Then the system blocks and shows "Minimal 2 akun untuk warming". 3\. Given the account is "Terputus", When I click "Mulai Warming", Then the system blocks and shows "Akun belum tersambung". 4\. Given the account note is "Banned", When I click "Mulai Warming", Then the system blocks and shows "Akun dibatasi". |
| US-003 | P0 | As an Admin, I want to stop warming for an account so that it no longer sends warming messages. | 1\. Given an account is "Running", When I click "Hentikan", Then the note becomes "Stopped" and no new warming messages are scheduled for that account. 2\. Given an account is "Running", When I click "Hentikan", Then the account remains available for normal operations outside warming. 3\. Given I am not Admin, When I attempt to stop warming, Then the system blocks and shows "Akses ditolak". |
| US-004 | P0 | As an Admin, I want to reconnect a disconnected account so that it can become eligible again. | 1\. Given an account is "Terputus", When I click "Reconnect", Then the system starts the existing reconnect flow and shows "Sedang reconnect". 2\. Given reconnect succeeds, When the account becomes "Tersambung", Then "Mulai Warming" becomes available if tenant eligibility is met. 3\. Given reconnect fails, When the system returns an error, Then it shows "Gagal reconnect". |
| US-005 | P0 | As an Admin, I want to view warming activity logs so that I know exactly what messages were sent. | 1\. Given an account has warming activity, When I open the logs section in "Akun & Aktivitas", Then I can see message events including timestamp, sender account, receiver account, and message preview. 2\. Given a log event is older than retention, When I view it, Then message content is hidden and shows "Konten sudah dihapus". 3\. Given a send attempt fails, When I view logs, Then I can see the failure reason category and retry count. |
| US-006 | P0 | As an Admin, I want to manage transcript queue so that the system always has varied daily conversations. | 1\. Given I open "Transkrip Harian", When the page loads, Then I see a list ordered by status: "Queue", "Active", "Used", "Expired". 2\. Given I click "View", When modal opens, Then I see transcript JSON including steps and delays in read-only format. 3\. Given I click "Mark as expired" on a transcript, When I confirm, Then the status becomes "Expired" and it is never assigned again. 4\. Given I click "Get New Transcript", When the system cannot generate, Then it shows "Gagal membuat transkrip". |
| US-007 | P0 | As an Admin, I want to set and edit account level (1 to 5\) so that warming limits reflect account maturity. | 1\. Given I am Admin, When I change level stars for an account, Then the new level is saved and immediately affects daily caps for next scheduling cycle. 2\. Given I set a level outside 1 to 5, When I save, Then the system blocks and shows "Level tidak valid". 3\. Given an account becomes "Banned", When the system detects it, Then the level is automatically set to 1 and cannot be overridden by configuration. |
| US-008 | P0 | As an Admin, I want to configure warming settings in a dedicated tab so that operations stay safe and predictable. | 1\. Given I open "Pengaturan", When I edit "Max concurrent", Then the system validates and saves it. 2\. Given I open "Pengaturan", When I edit daily cap per level, Then the system validates and saves each level cap. 3\. Given I enable "Auto level up", When an account has been stable for the required days, Then the system increases level by 1 up to level 5\. 4\. Given I disable "Auto level up", When time passes, Then no account level changes automatically. |

### **Supervisor**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-009 | P1 | As a Supervisor, I want to view warming status and logs read-only so that I understand readiness without changing anything. | 1\. Given I am Supervisor, When I open the Warming page, Then I can view tables and modal content but cannot click actions that change state. 2\. Given I click an action button, When the system evaluates permission, Then it blocks and shows "Akses ditolak". |

### **Agent**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-010 | P0 | As an Agent, I should never see warming conversations in Omnichannel Inbox so that my work stays focused. | 1\. Given warming conversations exist, When I open Omnichannel Inbox, Then warming items never appear in list, search, counters, notifications. 2\. Given a ticket automation exists, When warming messages arrive, Then they do not create tickets or assignments. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Tenant Enablement and RBAC | FR-001: System MUST provide tenant-level toggle for Warming enablement. FR-002: System MUST restrict all state-changing actions to Admin only. FR-003: System MUST allow Supervisor read-only access to status, transcripts, and logs. FR-004: System MUST hide Warming page access for Agent role. |
| Account Eligibility and States | FR-005: System MUST define account connection states: "Tersambung", "Terputus". FR-006: System MUST define warming note states: "Running", "Stopped", "Banned". FR-007: System MUST block starting warming if account is "Terputus". FR-008: System MUST block starting warming if note is "Banned". FR-009: System MUST enforce minimum 2 eligible accounts for warming network at all times. FR-010: System MUST auto stop scheduling if eligible warming accounts drop below 2 and show reason "Minimal 2 akun untuk warming". |
| Pairing and Scheduling | FR-011: System MUST auto pair eligible accounts inside the same tenant without user selecting pairs. FR-012: System MUST rotate pairs to avoid repeating the same pair for the whole day when more than 2 accounts are running. FR-013: System MUST enforce "Max concurrent" across the tenant for active schedules. FR-014: System MUST enforce per-account daily cap based on its current level. FR-015: System MUST reset daily counters at 00:00 Asia/Jakarta. |
| Humanized Message Sending | FR-016: System MUST split messages by sentence boundaries first and never split inside a sentence. FR-017: System MUST group 1 to 3 sentences into a single bubble with randomized grouping while respecting max length per bubble. FR-018: System MUST send variable typing delays and pauses between bubbles to simulate human behavior. FR-019: System MUST optionally send quoted replies using a randomized rule per bubble. FR-020: System MUST vary minor typos and abbreviations from a controlled list to avoid repetitive patterns. |
| Sentence Split Guardrails | FR-021: System MUST avoid sentence split on common Indonesian abbreviations and address patterns, including "Jl.", "No.", "Rt.", "Rw.", "Kec.", "Kab.", "Prov.", "Bp.", "Ibu", "Tn.", "Ny.", "dr.", "s.d.", "dll.", "dsb.", "a.n.", "u.p.", and numeric decimals like "3.14". FR-022: System MUST avoid splitting inside URLs and email addresses. |
| Transcript System | FR-023: System MUST maintain daily transcript items with statuses: "Queue", "Active", "Used", "Expired". FR-024: System MUST ensure each "Active" transcript is assigned to exactly one pair at a time. FR-025: System MUST store "Used by" and "Pair" as read-only metadata and display it as JSON in modal view. FR-026: System MUST provide a global "Get New Transcript" action to replenish "Queue". FR-027: System MUST allow Admin to mark any transcript as "Expired" and block future assignment. |
| Logging and Audit | FR-028: System MUST log each send attempt with timestamp, sender, receiver, transcript reference, and result status. FR-029: System MUST log message preview for UI within retention window. FR-030: System MUST log restriction events and auto set note "Banned". |
| Inbox Suppression | FR-031: System MUST classify all warming traffic as "Warming Conversation" and exclude it from Omnichannel Inbox queries, search, counters, notifications, SLA, assignment, and ticket rules. |
| Data Retention | FR-032: System MUST delete warming message content automatically using system-defined retention between 7 and 14 days without tenant configuration UI. FR-033: System MUST retain minimal audit logs for 12 months even after message content deletion. |
| Billing and Usage Counting | FR-034: System MUST count warming usage as 1 warming run per account per day for billing purposes regardless of bubble splitting count and quoted reply usage. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| ERR-001 | Permission Denied | Block action and do not change state. | "Akses ditolak". |
| ERR-002 | Warming Disabled | Block warming start actions. | "Warming belum diaktifkan". |
| ERR-003 | Not Enough Accounts | Block start if fewer than 2 eligible accounts. | "Minimal 2 akun untuk warming". |
| ERR-004 | Account Disconnected | Block start and stop scheduling when disconnect occurs. | "Akun belum tersambung". |
| ERR-005 | Account Restricted | Block start and auto set note and level. | "Akun dibatasi". |
| ERR-006 | Limit Exceeded | Throttle or skip scheduling until next day or capacity frees. | "Batas warming tercapai". |
| ERR-007 | Transcript Empty | Stop scheduling and request replenishment. | "Transkrip habis". |
| ERR-008 | Transcript Generate Failed | Keep existing queue and show failure. | "Gagal membuat transkrip". |
| ERR-009 | System Error | Fail safe by stopping only warming scheduler, keep inbox unaffected. | "Terjadi kesalahan. Silakan coba lagi". |

---

## **8\. Edge Cases**

| ID | Edge Case Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Admin turns Warming OFF while messages are mid-flight. | System stops scheduling new messages and completes or safely aborts in-flight sends, then logs outcome. |
| EC-002 | Eligible accounts drop from 2 to 1 due to disconnect. | System auto stops scheduling for all accounts and shows reason "Minimal 2 akun untuk warming". |
| EC-003 | Transcript marked "Expired" while "Active". | System completes current step safely, then prevents next steps and reassigns a new transcript. |
| EC-004 | Two admins click "Mulai Warming" on the same account at the same time. | System is idempotent and results in one Running state only. |
| EC-005 | Daily reset occurs during a long delay schedule. | Counters reset at midnight and next scheduling cycle recalculates caps safely. |
| EC-006 | Message split fails due to abnormal punctuation. | System sends the step as a single bubble and logs "Split fallback". |
| EC-007 | Quoted reply fails due to missing referenced message. | System retries once without quote and logs "Quote fallback". |
| EC-008 | Account becomes Banned mid-day. | System stops that account immediately, sets level 1, logs restriction, and prevents restart. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Warming Page Header | Toggle "Warming" and button "Add New Number" disabled. | 1\. Admin opens page. 2\. Toggle ON enables actions. | US-001 |
| Tab "Akun & Aktivitas" | Table of accounts with columns: Name, Number, Level (stars), Status, Note, Last activity, Actions. Note colors: Running green, Banned red, Terputus grey. | 1\. Admin views accounts. 2\. Click "Mulai Warming" or "Hentikan". 3\. Click "Reconnect" for disconnected accounts. | US-002, US-003, US-004, US-007 |
| Activity Logs (within Akun & Aktivitas) | Table showing message events, supports viewing per account context, message preview within retention. | 1\. Admin scrolls logs. 2\. Sees success and failures with reasons. | US-005 |
| Tab "Transkrip Harian" | Table ordered by status: Queue, Active, Used, Expired. Columns: Title, Status, Used by, Pair, Created at, Actions. Global button "Get New Transcript". | 1\. Admin opens tab. 2\. Click "View" opens modal with JSON and delay steps. 3\. Click "Mark as expired" changes status. | US-006 |
| Transcript View Modal | Read-only JSON viewer shows transcript steps, including delays, and assignment fields. No copy button. | 1\. Click "View". 2\. Modal shows JSON. 3\. Close modal. | US-006 |
| Tab "Pengaturan" | Controls: Max concurrent, Auto level up toggle, Stable days threshold, Daily cap per level (table). | 1\. Admin edits values. 2\. Save validates and persists. | US-008 |
| Empty States | Clear states for missing eligibility or empty transcript. | 1\. If not enough accounts show "Minimal 2 akun untuk warming". 2\. If transcript empty show "Transkrip habis". | US-002, US-006 |
| No Agent UI Changes | Agents never see warming content anywhere in inbox. | 1\. Agent opens inbox. 2\. No warming items appear. | US-010 |

---

## **10\. Field & Validation**

| Field Name | Type | Example Value | Validation Rule | Required |
| ----- | ----- | ----- | ----- | ----- |
| Warming Enabled | Boolean | ON | Admin only. | Yes |
| Account Level | Integer (1 to 5\) | 3 | Must be 1 to 5\. Admin can edit. Auto set to 1 when Banned. | Yes |
| Max Concurrent | Integer | 10 | Min 1\. Max 200\. | Yes |
| Auto Level Up | Boolean | ON | If OFF, no automatic level changes. | Yes |
| Stable Days Threshold | Integer (days) | 7 | Min 1\. Max 60\. Applied for each level up step. | Yes |
| Daily Cap Level 1 | Integer | 10 | Min 1\. Max 500\. | Yes |
| Daily Cap Level 2 | Integer | 20 | Min 1\. Max 500\. Must be greater than or equal level 1\. | Yes |
| Daily Cap Level 3 | Integer | 35 | Min 1\. Max 500\. Must be greater than or equal level 2\. | Yes |
| Daily Cap Level 4 | Integer | 50 | Min 1\. Max 500\. Must be greater than or equal level 3\. | Yes |
| Daily Cap Level 5 | Integer | 70 | Min 1\. Max 500\. Must be greater than or equal level 4\. | Yes |
| Transcript Status | Enum | Queue | Queue, Active, Used, Expired. System managed except Admin can mark Expired. | System |
| Transcript Content | JSON | `{ "steps": [...] }` | Must be valid JSON. Read-only in UI. | System |
| Used By | JSON | `{ "accountId": "...", "delayMs": 120000 }` | Read-only. | System |
| Pair | JSON | `{ "withAccountId": "...", "delayMs": 120000 }` | Read-only. | System |
| Warming Retention | Integer days | 14 | System-managed between 7 and 14\. Not editable. | System |

---

## **11\. Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | Start or stop warming reflects in UI within 5 seconds. Logs query returns within 3 seconds for last 7 days. |
| Availability | Warming scheduler failure must not impact Omnichannel Inbox availability. |
| Reliability | 95% of scheduled warming steps succeed without manual intervention. |
| Security | RBAC enforced on every action and data access path. |
| Privacy | Warming content deleted by system retention and excluded from agent access paths. |
| Observability | Metrics per tenant: active warming accounts, send success rate, restriction events, transcript queue depth. |

---

## **12\. Dependencies & Risks**

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| WhatsApp behavior changes for automated sending | Medium | High | Tenant kill switch, strict caps, fast disable of scheduler. |
| Restriction detection ambiguity | Medium | High | Conservative classification, immediate stop on suspected restriction, clear admin logs. |
| Transcript repetition patterns | Medium | Medium | Daily queue, per-pair uniqueness rules, admin expire control. |
| Warming leakage into inbox | Low | High | Enforce exclusion at ingestion, storage tagging, and query layers with automated tests. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Level Up Rate | 80% accounts reach level 3+ in 14 days | Monthly | Warming logs and account level history |
| Restriction Rate | Lower than baseline without warming by 20% | Quarterly | Restriction events |
| Inbox Noise | 0 warming items visible to agents | Weekly | Automated tests, QA checks |
| Transcript Health | Queue never drops to 0 during business hours | Weekly | Transcript queue metrics |

---

## **14\. Future Considerations**

| Topic | Why it matters |
| ----- | ----- |
| Automated transcript generation pipeline | Reduce manual transcript maintenance and improve diversity. |
| Warming health score per account | Faster decision for promotion to production use. |
| Multi-profile strategies | Different schedules for different tenant risk profiles. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Only tenant-owned accounts | Cannot warm using external contacts. |
| No manual pairing | Less control for special operational patterns, but keeps UI simple. |
| No custom retention controls | Tenants cannot keep warming content longer by design. |

---

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| Warming | Controlled internal activity between tenant-owned accounts to improve early account readiness. |
| Warming Network | The set of tenant accounts with note "Running" that can be paired automatically. |
| Transcript Harian | Predefined daily conversation script stored as JSON with delays and steps. |
| Ghost Mode | Always-on suppression so warming traffic never appears in Omnichannel Inbox and notifications. |
| Banned | System-detected restriction state that forces level 1 and blocks warming start. |

| Reference | Notes |
| ----- | ----- |
| Baileys quoted reply option | Baileys supports quoted replies via sendMessage options `{ quoted: message }` |

