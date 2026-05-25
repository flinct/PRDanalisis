# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Private Bot Farm Warming System \- Conversation Engine (WhatsApp Web)  
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2026-02-05 | Yusril Ibnu | Initial PRD for detailed warming mechanism, network topology, transcript generation, and send simulation. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a controlled internal conversation engine for tenant-owned WhatsApp Web accounts to increase account trust signals and reduce early instability risk. |
| Outcome | Human-like warming interactions that avoid detectable patterns, do not enter Omnichannel Inbox, and remain admin-governed. |

| In Scope | Out of Scope |
| ----- | ----- |
| Account enrollment into Warming Network with minimum 2 eligible accounts. | Messaging to customers or external contacts. |
| Small-world network topology for DM and group conversations. | Fully random pairing across all numbers. |
| Daily transcript supply, queue, and usage assignment. | Manual writing of transcripts by users as the main flow. |
| Humanization send simulation: split bubbles, variable delays, optional quoted replies, presence simulation. | Advanced AI workflow builder for multi-step reasoning. |
| Content variation rules: typo then correction, slang style, continuity tags, sticker and image injection. | File uploader for custom media packs in MVP. |
| Warming levels (1 to 5 stars), manual edit, auto-level-up option, auto-reset to level 1 on banned. | Making banned reset configurable. |
| Settings tab for auto-level-up, daily cap per level, max concurrent, group ratio. | Tenant-configurable retention policy. |
| Logs of messages sent and transcript usage per account. | Showing warming conversations inside Agent inbox. |

---

## **3\. Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Warming that follows fixed schedules and fixed pairing patterns is easier to detect. | Higher restriction and ban risk. |
| 2 | Pure random pairing can create closed-loop patterns and repeated cycles. | Pattern repetition increases risk and reduces realism. |
| 3 | Wall-of-text messages and uniform bubble sizes look bot-like. | Lower humanization and higher spam scoring signals. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Reduce detectable patterns | No repeated closed-loop cycle of length 3 within 24 hours for the same trio of accounts. |
| Improve realism | 90% of outgoing warming messages use human-like timing and bubble grouping rules. |
| Increase stability progression | 70% of warming-enabled accounts increase at least 1 level within 14 days when auto-level-up is ON. |
| Keep agents unaffected | 0 warming conversations visible in Agent Omnichannel Inbox lists, search, counters, and notifications. |

---

## **5\. User Stories and Acceptance Criteria**

### **Admin**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to enroll multiple connected numbers into the Warming Network so that the system can run warming conversations. | 1\. Given Warming is enabled, When I click "Mulai Warming" on an account, Then the account becomes "Running" and is added to the Warming Network. 2\. Given fewer than 2 eligible accounts are Running, When I try to start another account, Then the system starts it but the engine remains auto-paused with reason "Akun kurang dari minimum". 3\. Given an account is disconnected, When I click "Mulai Warming", Then the system blocks and shows "Akun belum tersambung". 4\. Given an account is banned or restricted, When I click "Mulai Warming", Then the system blocks and shows "Akun dibatasi". |
| US-002 | P0 | As an Admin, I want the system to automatically build safe conversation relations so that numbers do not form closed-loop patterns. | 1\. Given 10 running accounts exist, When the engine builds relations, Then each account is connected to 2 to 4 other accounts only. 2\. Given relations are built, When the engine schedules conversations, Then it avoids a 3-account closed loop repeating within 24 hours. 3\. Given relations are built, When the engine runs, Then cross-cluster interactions exist but are limited and not fully connected. |
| US-003 | P0 | As an Admin, I want daily transcripts available in a queue so that warming messages remain varied and human-like. | 1\. Given today transcripts are available, When I open "Transkrip Harian", Then I see a queue of transcript titles with status "Queue", "Active", or "Expired". 2\. Given I click "Get New Transcript", When the system succeeds, Then new transcript items are appended to the queue with status "Queue". 3\. Given I click "Get New Transcript", When the system fails, Then I see "Gagal ambil transkrip baru". |
| US-004 | P0 | As an Admin, I want to view a transcript in a popup so that I can validate content before it is used. | 1\. Given a transcript exists, When I click "View", Then a modal opens and shows the transcript content. 2\. Given the modal is open, When I close it, Then I return to the same scroll position in the queue list. 3\. Given a transcript is Expired, When I click "View", Then the modal opens and shows "Konten transkrip sudah kedaluwarsa". |
| US-005 | P0 | As an Admin, I want to mark a transcript as expired so that it will not be used again. | 1\. Given a transcript status is "Queue", When I click "Mark as Expired", Then the status becomes "Expired" and it is no longer eligible for assignment. 2\. Given a transcript status is "Active", When I click "Mark as Expired", Then the status becomes "Expired" and any future scheduling stops using it. 3\. Given the action fails, When I retry, Then the system retries and shows "Gagal mengubah status. Coba lagi". |
| US-006 | P0 | As an Admin, I want to edit account level (1 to 5 stars) so that daily caps and schedules follow my manual tagging. | 1\. Given I open the account row actions, When I change level, Then level updates immediately and applies on the next scheduling cycle. 2\. Given an account is banned, When the system detects it, Then level auto-resets to 1 without admin action. 3\. Given I am not Admin, When I attempt to edit level, Then the system blocks and shows "Akses ditolak". |
| US-007 | P0 | As an Admin, I want settings for auto-level-up, daily cap per level, and max concurrent so that warming risk can be controlled. | 1\. Given I open "Settings", When I toggle auto-level-up ON, Then the system starts tracking safe-days and promotes levels based on configured thresholds. 2\. Given auto-level-up is OFF, When safe-days pass, Then no automatic promotion occurs. 3\. Given I update daily cap per level, When scheduling runs, Then caps are enforced per account based on its level. 4\. Given I update max concurrent, When scheduling runs, Then the system limits concurrent sends to that value. |

### **Supervisor**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-008 | P1 | As a Supervisor, I want read-only visibility of warming status and logs so that I can monitor readiness without changing configuration. | 1\. Given I open the warming page, When I view accounts, Then I can see status, level, and last activity as read-only. 2\. Given I click "View" transcript, When the modal opens, Then I can read it but cannot mark expired or get new transcripts. 3\. Given I attempt admin actions, When I click them, Then the system blocks and shows "Akses ditolak". |

### **Agent**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-009 | P0 | As an Agent, I should not be impacted by warming so that customer operations remain clean. | 1\. Given warming conversations exist, When I open Omnichannel Inbox, Then I do not see them in list, search, filters, or counters. 2\. Given warming messages arrive, When notifications are evaluated, Then no agent notification is sent. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Eligibility and Enrollment | FR-001: System MUST allow Admin to start warming per account with a single action labeled "Mulai Warming". FR-002: System MUST block start if account is disconnected. FR-003: System MUST block start if account is banned or restricted. FR-004: System MUST auto-pause the warming engine if eligible running accounts count is less than 2\. FR-005: System MUST support multiple running accounts in parallel. |
| Account States | FR-006: System MUST support account warming status states: Off, Running, Paused, Disconnected, Banned. FR-007: System MUST display Disconnected status in gray, Running note in green, Banned note in red. FR-008: System MUST expose a per-account "Reconnect" action when status is Disconnected. |
| Level Model | FR-009: System MUST support level 1 to 5 represented as stars. FR-010: Admin MUST be able to edit level manually for any non-banned account. FR-011: System MUST reset level to 1 automatically when an account becomes banned or restricted. FR-012: System MUST maintain safe-days counter per account when not banned and not disconnected. |
| Auto Level Up | FR-013: System MUST provide Auto Level Up toggle in Settings. FR-014: When Auto Level Up is ON, System MUST promote level when safe-days meets threshold for current level. FR-015: Threshold days per level MUST be configurable by Admin in Settings. FR-016: When Auto Level Up is OFF, System MUST not promote levels automatically. |
| Network Topology | FR-017: System MUST build a small-world style relation graph with clusters. FR-018: Default cluster size MUST be 3 to 6 accounts. FR-019: Each account MUST have 2 to 4 relations maximum at any time. FR-020: Cross-cluster relations MUST exist but be limited to 10% to 20% of total relations. FR-021: System MUST prevent repeated closed-loop cycle of length 3 within a rolling 24-hour window. FR-022: System MUST rotate or rebuild relations at least once every 7 days, with randomized day-time per tenant. |
| Conversation Types | FR-023: System MUST support DM conversations and group conversations. FR-024: Group conversation membership MUST be 3 to 4 accounts per group. FR-025: System MUST limit group usage by ratio per day, configurable in Settings as percentage of total messages. |
| Transcript Supply | FR-026: System MUST generate transcripts once per day per tenant and store them into a queue. FR-027: Transcript generation time MUST occur within a system-controlled morning window and MUST be randomized per tenant daily. FR-028: Admin MUST be able to request more transcripts via "Get New Transcript". FR-029: Each transcript MUST include a Title, Message List, Intended Type (DM or Group), and Style Tags. FR-030: Each transcript MUST include per-message delay values stored as JSON and shown as read-only. |
| Transcript Status and Assignment | FR-031: System MUST support transcript statuses: Queue, Active, Expired. FR-032: System MUST assign transcripts to accounts based on relation graph and conversation type. FR-033: A transcript MAY be used by multiple accounts in the same day, but content MUST be varied by message-level perturbation rules. FR-034: System MUST store "used\_by" and "pair" fields as read-only JSON and show them in UI. FR-035: Admin MUST be able to mark any transcript as Expired. |
| Content Humanization Rules | FR-036: System MUST inject controlled human error patterns, including a typo followed by correction message prefixed with an asterisk. FR-037: System MUST support slang style variation via Style Tag per transcript, including Neutral, Jaksel, Jowo, Casual. FR-038: System MUST support continuity tags so that a subset of transcripts reference a previous-day topic for the same relation pair or group. FR-039: System MUST include non-text messages at low frequency, including stickers and images, controlled by Settings percentages. |
| Send Simulation | FR-040: System MUST split long text into multiple bubbles using sentence-boundary rules. FR-041: System MUST only split at sentence boundaries and MUST not split within protected abbreviation patterns. FR-042: Protected abbreviation patterns MUST include common Indonesian forms, including Bp., Ibu., Tn., Ny., Dr., Jl., No., Rt., Rw., Ds., Kec., Kab., Prov., s.d., dkk., dll., dsb., a.n., and single-letter initials like "A.". FR-043: System MUST group 1 to 3 sentences per bubble with randomized grouping to avoid fixed patterns. FR-044: System MUST apply variable delay based on bubble length and random jitter per message. FR-045: System MUST optionally use quoted replies to previous messages with dynamic probability per conversation to increase realism. FR-046: System MUST optionally emit composing and paused presence signals aligned with delays. |
| Dynamic Operating Hours | FR-047: System MUST assign a daily operating window per account with randomized start time and duration. FR-048: Operating window MUST vary per account daily to avoid time-of-day synchronization spikes. FR-049: System MUST schedule execution across the full day queue and MUST avoid sending bursts at the same minute for many accounts. |
| Caps and Rate Control | FR-050: System MUST enforce daily cap per account based on its level. FR-051: System MUST enforce max concurrent sends per tenant as configured in Settings. FR-052: System MUST stop scheduling new sends for an account when its daily cap is reached and record an event in logs. |
| Safety and Failure Handling | FR-053: System MUST pause scheduling for an account when it becomes disconnected and record reason "Disconnected". FR-054: System MUST stop scheduling for an account when it becomes banned and record reason "Banned". FR-055: System MUST re-evaluate topology after any ban event and reduce relations for banned nodes to zero. |
| Logs and Audit | FR-056: System MUST log every outgoing warming message with account, conversation type, transcript id, and outcome status. FR-057: System MUST log daily summary per account: attempted, success, failed, paused, cap\_reached. FR-058: Logs MUST be visible in "Akun dan Aktivitas" table without exposing raw customer inbox views. |
| Omnichannel Suppression | FR-059: System MUST label warming conversations so they never appear in Omnichannel Inbox list, search, counters, SLA rules, assignment rules, and ticket creation. |
| Billing Counting | FR-060: System MUST count split bubbles as a single logical transcript execution for internal pricing and usage reporting. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| ERR-001 | Permission Denied | Block non-admin write actions. | "Akses ditolak". |
| ERR-002 | Account Disconnected | Block start and show reconnect action. | "Akun belum tersambung". |
| ERR-003 | Account Banned | Block start and auto-reset level. | "Akun dibatasi". |
| ERR-004 | Insufficient Accounts | Auto-pause engine when eligible running accounts less than 2\. | "Akun kurang dari minimum". |
| ERR-005 | Get Transcript Failed | Retry with backoff up to 3 times. | "Gagal ambil transkrip baru". |
| ERR-006 | View Transcript Expired | Show placeholder content only. | "Konten transkrip sudah kedaluwarsa". |
| ERR-007 | Mark Expired Failed | Keep previous status and allow retry. | "Gagal mengubah status. Coba lagi". |
| ERR-008 | Cap Reached | Stop scheduling for that account for the day. | "Batas harian tercapai". |
| ERR-009 | Send Failure | Mark message failed and re-queue at most 1 retry with jitter. | "Gagal kirim. Sistem akan coba lagi". |

---

## **8\. Edge Cases**

| ID | Edge Case Scenario | Expected Behavior |  
 |---|---|  
 | EC-001 | Many accounts started within the same minute. | System staggers operating windows and prevents synchronized bursts. |  
 | EC-002 | Graph rebuild occurs while messages are queued. | In-flight messages continue. Future schedules use the new topology only. |  
 | EC-003 | A trio of accounts naturally forms a loop via cross-links. | System breaks the loop by removing one relation and reassigning cross-link. |  
 | EC-004 | Transcript queue runs out mid-day. | System auto-requests additional transcripts and pauses scheduling if unavailable. |  
 | EC-005 | Group chat creation fails for a scheduled group transcript. | System falls back to DM transcript and logs the fallback event. |  
 | EC-006 | Abbreviation causes false sentence split. | Protected pattern list prevents split. If still split, bubble is merged and logged as "split\_corrected". |  
 | EC-007 | Account level edited while account is running. | New caps and schedule weights apply on the next scheduling cycle. |  
 | EC-008 | Account becomes banned after partially executing a transcript. | Stop remaining messages for that transcript and mark transcript execution as partial. |  
 | EC-009 | Operating window ends while transcript still active. | Remaining messages are postponed to the next available window or expired if too old. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Warming Page Tabs | Three tabs: "Akun dan Aktivitas", "Transkrip Harian", "Settings". | 1\. Admin opens warming page. 2\. Admin navigates tabs. | US-001, US-003, US-007 |
| Akun dan Aktivitas Table | Table shows account, status note, level stars, daily cap, last activity, actions. | 1\. Admin clicks "Mulai Warming". 2\. Status updates to Running. 3\. If disconnected, Admin clicks "Reconnect". | US-001, US-006 |
| Status Colors | Disconnected gray. Running note green. Banned note red. | 1\. Admin views status column. 2\. Admin identifies risky accounts quickly. | US-001 |
| Level Editor | Inline edit level stars per account for Admin only. | 1\. Admin edits stars. 2\. Level updates and applies next cycle. | US-006 |
| Transkrip Harian Queue | List with Title, Status, Used By JSON, Pair JSON, actions View and Mark as Expired. Global "Get New Transcript" button above list. | 1\. Admin clicks "Get New Transcript". 2\. New items appear as Queue. 3\. Admin clicks "View" to open modal. 4\. Admin clicks "Mark as Expired" to disable reuse. | US-003, US-004, US-005 |
| View Transcript Modal | Popup modal with transcript title and message list with delays. Read-only. | 1\. Admin clicks "View". 2\. Modal opens. 3\. Admin closes modal. | US-004 |
| Settings Panel | Editable settings for auto-level-up, safe-days thresholds, daily cap per level, max concurrent, DM vs group ratio, sticker and image ratio. | 1\. Admin updates settings. 2\. Next scheduling cycle uses new values. | US-007 |
| Empty States | Clear empty states when no accounts running or no transcripts. | 1\. If no accounts running show "Belum ada akun warming". 2\. If no transcripts show "Belum ada transkrip". | US-001, US-003 |
| Supervisor Read-only Mode | Disable all write actions and show tooltips. | 1\. Supervisor views page. 2\. Buttons disabled with "Akses ditolak". | US-008 |

---

## **10\. Field & Validation**

| Field Name | Type | Example Value | Validation Rule | Required |
| ----- | ----- | ----- | ----- | ----- |
| Account Warming Status | Enum | Running | Off, Running, Paused, Disconnected, Banned. | System |
| Level | Integer | 3 | Min 1\. Max 5\. Admin editable unless Banned. | Yes |
| Safe Days | Integer | 12 | Non-negative integer. Resets on banned. Pauses on disconnected. | System |
| Daily Cap | Integer | 25 | Derived from level settings. Hard block after reached. | System |
| Max Concurrent Sends | Integer | 10 | Min 1\. Max 100\. | Yes |
| Auto Level Up | Boolean | ON | Admin only. | Yes |
| Safe Days Thresholds | Map | {1:3,2:5,3:7,4:10} | Each threshold min 1\. Max 30\. Must be increasing by level. | Yes |
| DM vs Group Ratio | Integer Percent | 80 | Min 0\. Max 100\. | Yes |
| Sticker Ratio | Integer Percent | 8 | Min 0\. Max 30\. | Yes |
| Image Ratio | Integer Percent | 2 | Min 0\. Max 10\. | Yes |
| Transcript Status | Enum | Queue | Queue, Active, Expired. | System |
| Transcript Title | String | "Ngopi sore" | Max 60 chars. | System |
| Used By | JSON Text | {"account":"+62xxx","date":"2026-02-05"} | Read-only. | System |
| Pair | JSON Text | {"peer":"+62yyy","type":"dm","delay\_ms":\[1200,800\]} | Read-only. | System |

---

## **11\. Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| Performance | Scheduling cycle must complete within 30 seconds for 200 running accounts per tenant. |
| Reliability | 95% of scheduled messages should be delivered or fail with a logged reason. |
| Safety | The engine must auto-pause on widespread failures above 30% within 30 minutes. |
| Security | RBAC enforced on every write action and settings change. |
| Observability | Metrics: send success rate, ban rate, retry rate, cap reached rate, topology rebuild count. |
| UX | Admin UI updates should reflect status change within 5 seconds. |

---

## **12\. Dependencies & Risks**

| Risk | Probability | Impact | Mitigation |  
 |---|---|---|  
 | WhatsApp behavior changes affect quoted replies or presence signals | Medium | High | Make quoted and presence optional by config with safe fallback to plain sends. |  
 | Over-humanization increases variability but creates content risk | Low | Medium | Keep content categories safe, avoid sensitive topics, cap slang intensity by tag. |  
 | Transcript supply becomes repetitive | Medium | Medium | Enforce uniqueness score per day and rotate topic tags across clusters. |  
 | Network topology still forms emergent loops | Low | High | Add loop-detection in rolling window and break edges automatically. |  
 | Media sending triggers higher risk | Medium | Medium | Keep media ratio low and limit to stickers first in MVP. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Closed-loop repeat rate | 0 repeats within 24 hours per trio | Weekly | Topology and scheduling logs |
| Message realism compliance | 90% messages follow bubble, delay, presence rules | Weekly | Send logs and simulator audit |
| Level progression | 70% running accounts increase at least 1 level in 14 days | Monthly | Level history table |
| Ban rate | Below baseline of non-warmed accounts by 20% | Monthly | Account status events |
| Agent inbox noise | 0 warming conversations visible | Weekly | Inbox QA checks |

---

## **14\. Future Considerations**

| Topic | Why it matters |
| ----- | ----- |
| Persona per account | Better consistency per number to reduce style drift. |
| Topic memory beyond 7 days | More natural continuity for long-lived warming networks. |
| Tenant media pack | Higher realism with tenant-specific memes and stickers. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No custom media pack in MVP | Media realism limited to system-provided sticker or image set. |
| Continuity is tag-based, not deep reasoning | Follow-ups are limited to predefined topic memory rules. |
| Auto-reset level on banned is fixed | Admin cannot override reset behavior. |

---

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| Warming Network | A set of tenant-owned accounts enrolled to generate internal interactions. |
| Small-world Topology | Clustered relation graph with limited cross-links to reduce detectable patterns. |
| Closed-loop Pattern | Repeated cycle of interactions among the same small set of accounts within a short window. |
| Transcript | A structured conversation script with delays and message types for DM or group. |
| Quoted Reply | A message that references a previous message as a reply to increase realism. |
| Presence Signal | A typing indicator pattern emitted before sending messages. |

