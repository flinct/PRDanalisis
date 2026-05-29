# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Conversation and Ticket Response Metrics Tracking  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead:** Sabrina

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-05-18 | Yusril Ibnu Maulana | Initial PRD for Response Lead Time and Wait Time tracking, live metric timer, database persistence, and Offline Report export. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Add Response Lead Time and Wait Time tracking for Conversation Inbox and Ticket System so operations can separate customer queue delay from staff handling delay. |
| Scope | Phase 1 includes database persistence, live metric timer in detail pages, and Offline Report export. Phase 1 does not include alert, reminder, breach, escalation, or new SLA configuration for these metrics. |

| In Scope | Out of Scope |
| ----- | ----- |
| Track T1, T2, and T3 event timestamps. | New SLA configuration for RLT or Wait Time. |
| Calculate Response Lead Time. | SLA breach for RLT or Wait Time. |
| Calculate Wait Time in Queue. | Reminder notification for RLT or Wait Time. |
| Store raw and adjusted duration values. | Escalation flow for RLT or Wait Time. |
| Show live metric timer in Conversation Detail. | Email, push, sound, or in-app alert for RLT or Wait Time. |
| Show live metric timer in Ticket Detail when ticket is linked to a customer conversation. | Dashboard analytics widgets. |
| Support Conversation Inbox metrics. | Queue prioritization changes. |
| Support customer-facing Ticket metrics through linked conversation context. | Internal-only ticket response SLA. |
| Mark internal-only tickets as Not Applicable. | New ticket status taxonomy. |
| Add metric columns to Offline Report Download for Ticket and Conversation exports. | CSV export. |
| Preserve existing FRT and TTC behavior. | Any change to existing FRT and TTC deadline, reminder, or breach logic. |

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Existing response visibility does not clearly separate queue delay from staff handling delay. | Teams cannot identify whether slow first response is caused by routing, unassigned queue, assignment delay, AUX, reassignment, or agent handling. |
| RLT and Wait Time are not stored as structured metrics. | Operations cannot audit or export these metrics reliably. |
| Agents and Supervisors cannot see these timing metrics during active handling. | They must wait for reports or infer manually from timestamps. |
| Internal-only tickets can be mixed with customer-facing tickets if metrics are forced globally. | Reporting becomes misleading and can unfairly measure agent performance. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve operational visibility. | 100 percent of eligible conversations store RLT and Wait Time metric records. |
| Make metrics visible during active handling. | 100 percent of eligible active conversations show the relevant live metric timer in Conversation Detail. |
| Support linked ticket context. | 100 percent of linked customer-facing tickets show inherited response metrics from the linked conversation. |
| Keep Phase 1 safe. | Zero alert, reminder, breach, escalation, or notification rules are added for RLT and Wait Time. |
| Improve reporting completeness. | Ticket and Conversation Offline Reports include RLT and Wait Time columns. |
| Avoid misleading ticket metrics. | 100 percent of internal-only tickets show response metric status as Not Applicable. |
| Improve auditability. | 100 percent of metric records store source timestamps, calculation state, and quality flags. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a Supervisor, I want to see Wait Time in reports so I can identify how long customers wait before an agent is assigned. | 1\. Given an eligible conversation has a first customer inbound message, When the conversation is assigned or claimed by the first agent, Then the system stores Wait Time using T2 minus T1. 2\. Given the conversation is never assigned, When the report is generated, Then Wait Time is empty and metric status shows "Incomplete". 3\. Given the conversation has invalid or missing source timestamp, When the report is generated, Then Wait Time is empty and quality flag explains the missing event. |
| US-002 | P0 | As a Supervisor, I want to see Response Lead Time so I can measure staff handling time after assignment. | 1\. Given an eligible conversation is assigned to an agent, When the first successful customer-facing reply is sent, Then the system stores RLT using T3 minus T2. 2\. Given the first reply is an internal note, When metrics are calculated, Then the internal note is ignored and T3 is not completed. 3\. Given the first reply fails to send, When metrics are calculated, Then the failed reply is ignored and T3 is not completed. |
| US-003 | P0 | As an Operations Lead, I want RLT and Wait Time to be tracked without changing SLA breach behavior so rollout risk stays low. | 1\. Given RLT or Wait Time exceeds any value, When the metric is stored, Then no SLA breach is created. 2\. Given RLT or Wait Time exists, When reminder jobs run, Then no reminder is sent for these metrics. 3\. Given existing FRT or TTC SLA runs, When RLT and Wait Time tracking is enabled, Then existing FRT and TTC behavior remains unchanged. |
| US-004 | P0 | As a Supervisor, I want reassignment cases handled consistently so reports cannot be manipulated by reassignment. | 1\. Given agent A is assigned and no customer-facing reply has been sent, When the conversation is reassigned to agent B, Then primary RLT still starts from the first agent assignment time. 2\. Given agent B sends the first customer-facing reply, When the report is generated, Then first responder is agent B and first assignee snapshot still includes agent A. 3\. Given reassignment happens after the first customer-facing reply, When metrics are recalculated, Then FRT, RLT, and Wait Time do not change. |
| US-005 | P0 | As a Supervisor, I want multi-assignee cases handled fairly so attribution is clear. | 1\. Given multiple assignees are added at the same time, When the first customer-facing reply is sent, Then RLT starts from the earliest assignment event. 2\. Given one of multiple assignees sends the first customer-facing reply, When the report is generated, Then first responder is the replying agent. 3\. Given multiple assignees exist but none reply, When the report is generated, Then RLT remains incomplete. |
| US-006 | P0 | As a Supervisor, I want AUX impact reflected only when it is valid so staff handling metrics stay fair. | 1\. Given all assigned agents are in AUX and workspace policy excludes AUX from SLA time, When adjusted RLT is calculated, Then eligible AUX pause duration is excluded. 2\. Given at least one assigned agent is available, When another assigned agent is in AUX, Then RLT is not paused only because one agent is in AUX. 3\. Given workspace policy counts AUX time, When adjusted RLT is calculated, Then AUX time remains included. |
| US-007 | P0 | As a Supervisor, I want Snooze and Waiting on Customer handled safely so metrics match actual response responsibility. | 1\. Given a conversation is snoozed after assignment and before first reply, When adjusted RLT is calculated, Then valid snooze pause intervals are excluded only if the existing SLA pause policy allows the interval to pause response timing. 2\. Given the status is Waiting on Customer before any customer-facing reply, When metrics are calculated, Then the system stores a quality flag because this is an unusual state. 3\. Given Wait Time is measured before first assignment, When snooze or AUX occurs later, Then Wait Time does not change. |
| US-008 | P0 | As a Supervisor, I want ticket response metrics only when the ticket is customer-facing so internal tickets are not misreported. | 1\. Given a ticket is linked to a customer conversation, When the first customer-facing reply is sent from Conversation Inbox or Ticket reply UI, Then the ticket can use the linked conversation response metrics. 2\. Given a ticket is internal-only and has no linked customer conversation, When the report is generated, Then RLT and Wait Time show "Tidak berlaku". 3\. Given a ticket is linked after the first response already happened, When the report is generated, Then the ticket references completed conversation metrics and does not create a second first response cycle. |
| US-009 | P0 | As an Admin or Supervisor, I want Offline Report Download to include RLT and Wait Time columns so I can export the metrics. | 1\. Given I export Conversation using Default Conversation, When the XLSX is generated, Then metric columns are included after existing base conversation columns. 2\. Given I export Ticket using Default Ticket, When the XLSX is generated, Then metric columns are included after existing ticket SLA columns. 3\. Given a metric is Not Applicable or Incomplete, When the XLSX is generated, Then the cell value uses a stable readable value instead of zero. |
| US-010 | P0 | As an Auditor, I want metric source timestamps and quality flags stored so I can validate calculation accuracy. | 1\. Given a metric is calculated, When the record is stored, Then T1, T2, T3, raw duration, adjusted duration, metric status, and quality flags are saved. 2\. Given a source event is updated by a correction job, When recalculation runs, Then the metric record keeps the previous calculation timestamp and stores the latest calculation timestamp. 3\. Given an impossible duration is detected, When the metric is stored, Then the status is Invalid and the duration is not exported as zero. |
| US-011 | P0 | As an Agent or Supervisor, I want to see live Wait Time and RLT timers in Conversation Detail so I can monitor response handling before downloading reports. | 1\. Given a conversation is not assigned yet, When I open Conversation Detail, Then I see "Waktu Antre" running from T1 until first agent assignment. 2\. Given a conversation has been assigned but no customer-facing reply has been sent, When I open Conversation Detail, Then I see "Waktu Kerja Staf" running from T2 until T3. 3\. Given the first customer-facing reply has been sent, When I open Conversation Detail, Then the timer stops and displays the final duration. 4\. Given RLT or Wait Time is running, When the value grows high, Then no alert, notification, breach badge, sound, or escalation is triggered for these metrics in Phase 1\. |
| US-012 | P0 | As an Agent or Supervisor, I want linked Ticket Detail to show the same response timers so I can understand the ticket response context. | 1\. Given a ticket is linked to a customer conversation, When I open Ticket Detail, Then I see the linked conversation Wait Time and RLT values. 2\. Given the ticket is internal-only, When I open Ticket Detail, Then the metric section shows "Tidak berlaku". 3\. Given the ticket is linked after the first response is completed, When I open Ticket Detail, Then it shows the completed linked conversation metric and does not create a new first response cycle. |
| US-013 | P1 | As a Supervisor, I want adjusted and raw RLT to be distinguishable so I can audit pause effects. | 1\. Given adjusted RLT excludes valid pause intervals, When I open the tooltip or export report, Then I can see raw RLT, adjusted RLT, and excluded pause duration. 2\. Given no pause interval applies, When the metric is displayed, Then adjusted RLT equals raw RLT. 3\. Given pause data is incomplete, When the metric is displayed, Then the system keeps raw RLT and stores a quality flag. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Metric Scope | FR-001: System MUST track RLT and Wait Time for eligible customer-facing conversations. FR-002: System MUST track RLT and Wait Time for tickets linked to customer conversations. FR-003: System MUST mark internal-only tickets as Not Applicable for RLT and Wait Time. FR-004: System MUST NOT create SLA breach, reminder, alert, notification, or escalation for RLT and Wait Time in Phase 1\. FR-005: System MUST NOT modify existing FRT and TTC configuration, deadline, reminder, or breach behavior. FR-006: System MUST expose metrics through Conversation Detail, linked Ticket Detail, database persistence, and Offline Report export. |
| Timestamp Definitions | FR-007: System MUST define T1 as first customer inbound message received by server for the active conversation session. FR-008: System MUST define T2 as first successful assignment or claim to at least one active agent. FR-009: System MUST define T3 as first successful customer-facing agent reply accepted by the system for delivery. FR-010: System MUST store first\_queue\_or\_team\_bucket\_at separately for diagnostic use. FR-011: System MUST NOT use internal notes, private notes, failed replies, draft replies, bot-only system messages, or system events as T3. FR-012: System MUST use server time as the source of truth for all timestamp calculations. |
| Metric Calculations | FR-013: System MUST calculate Wait Time raw as T2 minus T1. FR-014: System MUST calculate RLT raw as T3 minus T2. FR-015: System SHOULD calculate Assignment Wait Time as T2 minus first\_queue\_or\_team\_bucket\_at when first\_queue\_or\_team\_bucket\_at exists. FR-016: System SHOULD calculate Routing Latency as first\_queue\_or\_team\_bucket\_at minus T1 when first\_queue\_or\_team\_bucket\_at exists. FR-017: System MUST store duration values in seconds. FR-018: System MUST export duration values in HH:MM:SS format. FR-019: System MUST set metric status to Completed only when all required timestamps exist and duration is not negative. FR-020: System MUST set metric status to Incomplete when T1 exists but T2 or T3 is missing. FR-021: System MUST set metric status to Invalid when calculated duration is negative or timestamp ordering is impossible. FR-022: System MUST set metric status to Not Applicable when ticket is internal-only. |
| Raw and Adjusted Durations | FR-023: System MUST store raw duration for RLT and Wait Time. FR-024: System MUST store adjusted duration for RLT. FR-025: System MUST keep Wait Time adjusted equal to Wait Time raw in Phase 1 unless Product explicitly adds queue pause policy later. FR-026: System MUST exclude valid pause intervals from adjusted RLT only when existing SLA pause policy supports the pause reason. FR-027: System MUST store total excluded pause seconds for adjusted RLT. FR-028: System MUST store quality flags when adjusted duration differs from raw duration. FR-029: System MUST never overwrite raw duration when adjusted duration changes. |
| Live Metric Timer | FR-030: System MUST display Wait Time live timer in Conversation Detail when T1 exists and T2 is not completed. FR-031: System MUST stop Wait Time live timer when T2 is completed. FR-032: System MUST display RLT live timer in Conversation Detail when T2 exists and T3 is not completed. FR-033: System MUST stop RLT live timer when T3 is completed. FR-034: System MUST display final duration after timer stops. FR-035: System MUST update the visible timer at least every 1 second on the client while using server time as source of truth. FR-036: System MUST correct client timer drift when server timestamp updates are received. FR-037: System MUST show "Belum tersedia" when required source timestamp is missing. FR-038: System MUST show "Tidak berlaku" for internal-only tickets. FR-039: System MUST NOT trigger alert, reminder, breach, escalation, notification, sound, or red warning badge from RLT or Wait Time in Phase 1\. |
| Timer Mode | FR-040: System MUST treat RLT and Wait Time display as informational live metric timer in Phase 1\. FR-041: System MAY show the existing FRT due countdown near these metrics when FRT SLA exists. FR-042: System MUST NOT create a separate RLT or Wait Time deadline in Phase 1\. FR-043: System MUST NOT infer RLT or Wait Time breach from existing FRT deadline. FR-044: System MUST clearly separate existing SLA countdown from RLT and Wait Time informational timers. |
| Assignment and Reassignment | FR-045: System MUST use first agent assignment time as T2 for primary Wait Time and RLT. FR-046: System MUST NOT reset primary RLT when reassignment happens before first customer-facing reply. FR-047: System MUST NOT change completed RLT, Wait Time, or FRT after T3 is completed. FR-048: System MUST store first\_assignee\_ids\_snapshot at T2. FR-049: System MUST store first\_responder\_agent\_id at T3. FR-050: System SHOULD store latest\_assignment\_before\_reply\_at for diagnostic reporting. FR-051: System SHOULD store latest\_assignee\_rlt\_seconds as T3 minus latest\_assignment\_before\_reply\_at when available. FR-052: System MUST store a quality flag when unassignment or reassignment happens between T2 and T3. |
| Multi-Assignee | FR-053: System MUST support multiple assignees for metric attribution. FR-054: System MUST use earliest assignment event as T2 when multiple agents are assigned at the same time. FR-055: System MUST store all assignees present at T2 in first\_assignee\_ids\_snapshot. FR-056: System MUST attribute first response to the agent who sends the first customer-facing reply. FR-057: System MUST NOT duplicate metric rows per assignee in Phase 1\. FR-058: System MUST export first assignee snapshot and first responder separately. |
| Unassigned and Queue Behavior | FR-059: System MUST keep Wait Time running until first agent assignment or claim. FR-060: System MUST keep Wait Time incomplete when no agent assignment exists. FR-061: System MUST NOT treat Team Inbox routing alone as agent assignment. FR-062: System MUST store first\_queue\_or\_team\_bucket\_at when the conversation enters a routable Team Inbox or Unassigned queue. FR-063: System MUST store assignment\_wait\_time\_seconds when both first\_queue\_or\_team\_bucket\_at and T2 exist. FR-064: System MUST continue showing Wait Time while conversation is unassigned. FR-065: System MUST start RLT only after an agent assignment exists. |
| AUX Behavior | FR-066: System MUST evaluate AUX impact only for adjusted RLT. FR-067: System MUST NOT pause Wait Time because of AUX. FR-068: System MUST exclude AUX intervals from adjusted RLT only when the workspace policy excludes AUX time. FR-069: System MUST NOT exclude AUX intervals when at least one assigned agent is available and eligible to reply. FR-070: System MUST store aux\_excluded\_seconds when AUX time is excluded. FR-071: System MUST store quality flag when AUX state data is missing or incomplete. |
| Snooze, Hold, and Waiting on Customer | FR-072: System MUST evaluate Snooze, Hold, and Waiting on Customer only for adjusted RLT. FR-073: System MUST exclude pause intervals only when the existing SLA pause policy treats the state as paused. FR-074: System MUST store a quality flag when Waiting on Customer occurs before first customer-facing reply. FR-075: System MUST NOT pause Wait Time for Snooze, Hold, or Waiting on Customer in Phase 1\. FR-076: System MUST keep raw duration unchanged even when adjusted duration excludes pause time. FR-077: System MUST merge overlapping pause intervals before adjusted duration is calculated. |
| Conversation Inbox | FR-078: System MUST create or update one response metric record per active conversation session. FR-079: System MUST calculate metrics from server-side events only. FR-080: System MUST support all customer-facing channels that can receive inbound customer messages and send agent replies. FR-081: System MUST keep metric records linked to conversation\_id and session\_id when session model exists. FR-082: System MUST recalculate metric records idempotently when a missing event arrives late. FR-083: System MUST show the metric section only to users who can view the conversation. |
| Ticket System | FR-084: System MUST create ticket response metric reference when a ticket is linked to a customer conversation. FR-085: System MUST inherit completed conversation response metrics when ticket is linked after T3. FR-086: System MUST allow T3 from Ticket reply UI only if the reply is customer-facing and linked to the same customer conversation. FR-087: System MUST mark internal-only tickets as Not Applicable. FR-088: System MUST show Not Applicable in export instead of zero for internal-only tickets. FR-089: System MUST store linked\_conversation\_id for ticket metric traceability. FR-090: System MUST use primary linked conversation only in Phase 1 when multiple conversation links exist. FR-091: System MUST not create separate response metric cycles for internal-only tickets. |
| Database Persistence | FR-092: System MUST persist source timestamps, duration values, metric status, quality flags, and calculation timestamp. FR-093: System MUST store metric records in a queryable structure for detail pages and export. FR-094: System MUST keep metric calculation idempotent per conversation session and ticket id. FR-095: System MUST store created\_at and updated\_at for metric records. FR-096: System MUST store calculated\_at for latest calculation run. FR-097: System MUST retain metric records for the same retention period as the parent conversation or ticket. FR-098: System MUST preserve metric records for audit even when active UI timer is no longer shown. |
| Offline Report Download | FR-099: System MUST add RLT and Wait Time columns to Default Conversation export. FR-100: System MUST add RLT and Wait Time columns to Default Ticket export. FR-101: System MUST include metric columns in Ticket Type templates after default ticket columns and before custom fields. FR-102: System MUST NOT add new filters for RLT or Wait Time in Phase 1\. FR-103: System MUST keep existing date range, employee, status, template, and permission behavior. FR-104: System MUST export "Tidak berlaku" for Not Applicable metrics. FR-105: System MUST export "-" for incomplete timestamps. FR-106: System MUST export "Invalid" for invalid metric duration. FR-107: System MUST include metric quality flags in export to support audit review. FR-108: System MUST append new columns without reordering existing base columns. |
| Backfill | FR-109: System SHOULD backfill metrics for records where required events are available. FR-110: System MUST mark backfilled records with calculation\_source equal to "backfill". FR-111: System MUST leave metrics incomplete when historical events are missing. FR-112: System MUST NOT infer missing T2 or T3 from UI display timestamps when source event logs are unavailable. FR-113: System MUST NOT overwrite existing completed metric records unless recalculation uses a newer valid event source. |
| Audit and Timeline | FR-114: System MUST log metric source events in conversation or ticket timeline when the parent feature already supports timeline events. FR-115: System MUST capture assignment, reassignment, unassignment, first customer-facing reply, pause, resume, and metric recalculation events. FR-116: System MUST make metric calculation auditable by linking metric values to source event timestamps. FR-117: System MUST not expose sensitive internal calculation data to users without proper permission. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Missing T1 | Do not calculate RLT or Wait Time. Store metric status Invalid. | Export shows "Invalid". Quality flag shows "missing\_t1". |
| EH-002 | Missing T2 | Keep Wait Time and RLT incomplete. | UI shows "Belum tersedia". Export shows "-". Quality flag shows "missing\_t2". |
| EH-003 | Missing T3 | Keep RLT incomplete. Wait Time can be completed if T2 exists. | UI keeps RLT timer running if T2 exists. Export shows RLT as "-". |
| EH-004 | Negative duration | Mark metric as Invalid. Do not export zero. | UI and export show "Invalid". |
| EH-005 | Failed customer reply | Ignore failed reply as T3. Wait for first successful customer-facing reply. | No user-facing error. Timer keeps running. |
| EH-006 | Internal note used before reply | Do not treat internal note as T3. | No user-facing error. Timer keeps running. |
| EH-007 | Permission issue during report download | Reuse existing Offline Report permission re-check. | "Akses ditolak". |
| EH-008 | Metric unavailable during report generation | Complete report with metric cells as "-". Store job warning internally. | No blocking. Job completes. |
| EH-009 | Metric calculation timeout | Use stored metric values if available. Mark unavailable fields as "-". | No blocking. Job completes. |
| EH-010 | Backfill cannot find event history | Mark metric as Incomplete with backfill quality flag. | Export shows "-". |
| EH-011 | Ticket has no linked conversation | Mark ticket response metric as Not Applicable. | UI and export show "Tidak berlaku". |
| EH-012 | Multiple linked conversations in Phase 1 | Use primary linked conversation. Add quality flag. | Export includes "multiple\_links\_primary\_used". |
| EH-013 | AUX state missing | Do not exclude AUX from adjusted RLT. Add quality flag. | Export still completes. |
| EH-014 | Pause interval overlap | Merge overlapping pause intervals before adjusted calculation. | No user-facing error. |
| EH-015 | Report file generation failure | Reuse existing Offline Report failed job behavior. | "Gagal membuat laporan". |
| EH-016 | Timer source missing | Do not start timer. Show incomplete state. | "Belum tersedia". |
| EH-017 | Internal-only ticket | Do not show live timer. Mark as Not Applicable. | "Tidak berlaku". |
| EH-018 | Client clock drift | Use server timestamp and correct timer value on next sync. | No user-facing error. |
| EH-019 | Timer update delay | Keep last known timer value and resync silently. | No blocking. |
| EH-020 | Metric invalid | Stop timer and show invalid state. | "Invalid". |
| EH-021 | Existing FRT overdue while RLT or Wait Time is running | Existing FRT behavior may show overdue. RLT and Wait Time must not trigger their own alert. | No new RLT or Wait Time alert. |
| EH-022 | User loses access while viewing timer | Hide metric section when parent conversation or ticket access is revoked. | "Akses ditolak" if full page is blocked. |
| EH-023 | Socket disconnected | Continue client-side timer using latest server timestamp and resync after reconnect. | Optional non-blocking connection indicator. |
| EH-024 | Duplicate event received | Ignore duplicate event during calculation. | No user-facing error. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Customer sends multiple messages before assignment. | T1 remains the first inbound message of the active session. | No visible change. |
| EC-002 | Agent is assigned and immediately unassigned before first reply. | T2 remains first assignment time. RLT keeps running until T3. | Export quality flag can show "unassigned\_after\_t2". |
| EC-003 | Reassignment happens before first reply. | Primary RLT does not reset. First responder is the agent who replies. | Export shows first assignee snapshot and first responder. |
| EC-004 | Reassignment happens after first reply. | Completed metrics remain unchanged. | No visible change. |
| EC-005 | Multiple assignees added at once. | T2 uses earliest assignment event. Assignee snapshot stores all assigned users. | Export joins names with comma. |
| EC-006 | Team Inbox assigned but no agent assigned. | first\_queue\_or\_team\_bucket\_at is stored. T2 remains empty. | Wait Time keeps running until first agent assignment. |
| EC-007 | Agent replies from Ticket UI for linked ticket. | T3 is valid if the message is customer-facing and linked to the same conversation. | Export shows metric source as "Ticket Reply UI". |
| EC-008 | Ticket created after conversation already had first reply. | Ticket inherits completed conversation metrics. | No duplicate first response cycle. |
| EC-009 | Internal-only ticket is resolved. | RLT and Wait Time remain Not Applicable. TTC and stage SLA remain valid. | UI and export show "Tidak berlaku". |
| EC-010 | Conversation is snoozed before first reply. | Raw RLT includes snooze time. Adjusted RLT excludes it only if existing SLA pause policy says it should pause. | Export includes pause seconds. |
| EC-011 | Agent is in AUX but another assignee is available. | Adjusted RLT does not pause only because one assignee is in AUX. | No visible change. |
| EC-012 | All assignees are in AUX and policy excludes AUX. | Adjusted RLT excludes eligible AUX interval. | Export includes aux\_excluded\_seconds. |
| EC-013 | Waiting on Customer is set before first reply. | Metric calculation continues. Quality flag is stored. | Export includes "waiting\_customer\_before\_first\_reply". |
| EC-014 | Conversation is moved to another Team Inbox before first reply. | Metrics continue from original T1 and T2. Team attribution can follow report scope rules. | Export shows latest Inbox and quality flag "team\_moved\_before\_reply". |
| EC-015 | Customer reply arrives after resolved and new session is created. | New session gets new T1 and separate metric record. | Previous session remains completed. |
| EC-016 | Imported historical conversation has no assignment event. | Backfill leaves T2 missing. Metrics remain incomplete. | Export shows "-". |
| EC-017 | Agent sends first reply but provider accepts it later. | T3 uses successful system or provider accepted timestamp, not button click time. | Timer stops only after success event. |
| EC-018 | Duplicate event is received. | Metric calculation remains idempotent and does not duplicate rows. | No visible change. |
| EC-019 | Conversation is unassigned. | Show Wait Time running from T1. Do not show RLT as running. | "Waktu Antre" active. |
| EC-020 | Conversation is assigned but no reply yet. | Freeze Wait Time. Start RLT timer from T2. | "Waktu Kerja Staf" active. |
| EC-021 | First customer-facing reply is sent. | Stop RLT timer and store final value. | Show completed duration. |
| EC-022 | First reply fails. | Keep RLT timer running. | No success state. |
| EC-023 | Internal note is added before reply. | Keep RLT timer running. | No success state. |
| EC-024 | Ticket is internal-only. | Do not start response timers. | "Tidak berlaku". |
| EC-025 | Ticket is linked after first reply. | Show completed linked conversation metric. | No new timer cycle. |
| EC-026 | Existing FRT becomes overdue while RLT timer runs. | Existing FRT overdue behavior can apply. RLT does not create separate alert. | Only existing FRT indicator appears. |
| EC-027 | T2 missing but T3 exists. | Do not calculate RLT. Show quality flag. | "Belum tersedia". |
| EC-028 | Conversation reopened into new session. | Start new timer cycle for new session only. | Previous session remains completed. |
| EC-029 | Ticket has multiple linked conversations. | Use primary linked conversation only in Phase 1\. | Tooltip and export show quality flag. |
| EC-030 | Conversation has bot reply before agent reply. | Bot reply does not complete RLT unless Product explicitly marks it as customer-facing agent equivalent. | Timer continues. |
| EC-031 | Agent sends reply while offline and message remains pending. | T3 is not completed until successful send event. | Timer continues. |
| EC-032 | Assignment is done by auto-routing. | If the event assigns a real agent, T2 is completed. If only Team Inbox is assigned, T2 remains empty. | Wait Time continues until real agent assignment. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Conversation Detail Response Metrics | Compact metric section in Conversation Detail showing "Waktu Antre" and "Waktu Kerja Staf". | User opens active conversation and sees the currently relevant timer. | US-011 |
| Wait Time Timer | Label "Waktu Antre". Runs from T1 until T2. | Before assignment, value increases live. After assignment, value freezes as final duration. | US-001, US-011 |
| RLT Timer | Label "Waktu Kerja Staf". Runs from T2 until T3. | After assignment, value increases live. After first customer-facing reply, value freezes as final duration. | US-002, US-011 |
| Existing FRT Context | Existing FRT countdown remains visible as current SLA context. | User can compare end-to-end FRT with Wait Time and RLT. | US-003, US-011 |
| No Alert State | No red warning, sound, toast, breach badge, or reminder for RLT and Wait Time. | Timer can keep running without triggering notification. | US-003, US-011 |
| Ticket Detail Response Metrics | Metric section in Ticket Detail for linked customer conversation. | User opens linked ticket and sees same values from the linked conversation. | US-008, US-012 |
| Internal-only Ticket State | Show "Tidak berlaku" instead of timer. | User opens internal-only ticket and understands response metrics do not apply. | US-008, US-012 |
| Metric Tooltip | Tooltip explains source timestamps and calculation state. | Hover over metric to see T1, T2, T3, raw duration, adjusted duration, and quality flag. | US-010, US-011, US-012, US-013 |
| Loading State | Show skeleton or "Memuat metrik". | Timer appears after source timestamps load. | US-011, US-012 |
| Missing Data State | Show "Belum tersedia". | Missing T1, T2, or T3 does not break the UI. | US-010, US-011 |
| Invalid State | Show "Invalid" with tooltip. | User sees that the metric is not reliable because timestamp order is invalid. | US-010 |
| Offline Report Columns | Existing Ticket and Conversation exports include metric columns. | User downloads XLSX and reviews final stored values. | US-009 |
| Permission Scope | Metric section follows the same permission as parent conversation or ticket. | If user cannot access parent item, metric is hidden or blocked. | US-010, US-012 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required | Default |
| ----- | ----- | ----- | ----- | ----- | ----- |
| conversation\_id | String | CNV-88921 | Must reference valid conversation. | Required for conversation metrics | None |
| ticket\_id | String | TK-6749104949 | Must reference valid ticket when metric is ticket-scoped. | Conditional | None |
| linked\_conversation\_id | String | CNV-88921 | Required for linked customer-facing ticket metric. | Conditional | Empty |
| session\_id | String | SES-123 | Required if session model exists. | Conditional | Empty |
| metric\_scope | Enum | Conversation | Conversation, Ticket. | Required | Conversation |
| metric\_status | Enum | Completed | Completed, Incomplete, Invalid, Not Applicable. | Required | Incomplete |
| metric\_source | Enum | Conversation Inbox | Conversation Inbox, Ticket Reply UI, Backfill, Recalculation, Not Applicable. | Required | Conversation Inbox |
| first\_customer\_inbound\_at | Datetime | 2026-05-18 09:01:00 | Must be server received timestamp. | Required for eligible metrics | Empty |
| first\_queue\_or\_team\_bucket\_at | Datetime | 2026-05-18 09:01:02 | Must not be earlier than T1. | Optional | Empty |
| first\_agent\_assigned\_at | Datetime | 2026-05-18 09:03:00 | Must not be earlier than T1. | Required for completed Wait Time and RLT | Empty |
| first\_customer\_reply\_at | Datetime | 2026-05-18 09:05:30 | Must not be earlier than first\_agent\_assigned\_at. | Required for completed RLT | Empty |
| wait\_time\_raw\_seconds | Integer | 120 | Must be greater than or equal to 0\. | Conditional | Empty |
| wait\_time\_adjusted\_seconds | Integer | 120 | Same as raw in Phase 1\. | Conditional | Same as raw |
| rlt\_raw\_seconds | Integer | 150 | Must be greater than or equal to 0\. | Conditional | Empty |
| rlt\_adjusted\_seconds | Integer | 90 | Must be greater than or equal to 0 and less than or equal to raw. | Conditional | Same as raw |
| rlt\_excluded\_pause\_seconds | Integer | 60 | Must be greater than or equal to 0\. | Optional | 0 |
| aux\_excluded\_seconds | Integer | 30 | Must be greater than or equal to 0\. | Optional | 0 |
| first\_assignee\_ids\_snapshot | List | USR-1, USR-2 | Users must exist at calculation time or be preserved as historical IDs. | Optional | Empty |
| first\_assignee\_names\_snapshot | List | John Doe, Jane Doe | Names must reflect snapshot at T2 when available. | Optional | Empty |
| first\_responder\_agent\_id | String | USR-2 | Must match user who sent first customer-facing reply. | Conditional | Empty |
| first\_responder\_name | String | Jane Doe | Must match first\_responder\_agent\_id display name at T3 when available. | Optional | Empty |
| latest\_assignment\_before\_reply\_at | Datetime | 2026-05-18 09:04:00 | Must not be earlier than T2. | Optional | Empty |
| latest\_assignee\_rlt\_seconds | Integer | 90 | Must be greater than or equal to 0\. | Optional | Empty |
| assignment\_wait\_time\_seconds | Integer | 118 | Requires first\_queue\_or\_team\_bucket\_at and T2. | Optional | Empty |
| routing\_latency\_seconds | Integer | 2 | Requires first\_queue\_or\_team\_bucket\_at. | Optional | Empty |
| quality\_flags | List | missing\_t2 | Must use controlled flag names. | Optional | Empty |
| calculation\_source | Enum | realtime | realtime, backfill, recalculation. | Required | realtime |
| calculated\_at | Datetime | 2026-05-18 09:06:00 | Must be server timestamp. | Required | Current calculation time |
| display\_wait\_time\_timer | Boolean | true | True when T1 exists, T2 is empty, and metric is eligible. | Derived | false |
| display\_rlt\_timer | Boolean | true | True when T2 exists and T3 is empty. | Derived | false |
| timer\_display\_mode | Enum | running | running, completed, incomplete, invalid, not\_applicable. | Derived | incomplete |
| timer\_display\_label | String | Waktu Kerja Staf | Must use Bahasa Indonesia. | Derived | Empty |
| timer\_display\_value | Duration | 00:05:21 | HH:MM:SS. Must never show zero for unavailable values. | Derived | "-" |
| timer\_server\_started\_at | Datetime | 2026-05-18 09:03:00 | Must use server timestamp. | Conditional | Empty |
| timer\_server\_stopped\_at | Datetime | 2026-05-18 09:05:30 | Required when timer is completed. | Conditional | Empty |
| timer\_quality\_tooltip | String | T2 belum tersedia | Must explain missing or adjusted metric clearly. | Optional | Empty |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Metric calculation must add less than 100 ms P95 to message, assignment, and status event processing. |
| Performance | Timer display must update every 1 second without blocking chat interaction. |
| Performance | Offline Report generation must not exceed existing report time by more than 10 percent for the same row count. |
| Reliability | Metric calculation must be idempotent per conversation session and ticket id. |
| Reliability | Duplicate events must not create duplicate metric rows. |
| Reliability | Timer must recover after socket reconnect using latest server timestamp. |
| Security | Metric export must follow existing report RBAC and Team Inbox scope. |
| Privacy | Metric records must not expose message content beyond existing export rules. |
| Observability | Track metric calculation success rate, incomplete rate, invalid rate, timer render rate, and report column fill rate. |
| Accessibility | Timer labels must be readable by screen readers and must not rely only on color. |
| Localization | Export fallback values and UI messages must use Bahasa Indonesia where user-facing. |
| Time Zone | Exported datetime values must use workspace timezone, default Asia/Jakarta. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Assignment events must be reliable. | Engineering | T2 can be missing, causing incomplete metrics and timer issues. | Store assignment and claim events as durable audit events. |
| Message delivery success event must be clear. | Engineering | T3 can be wrong if send click is used instead of successful send. | Use successful customer-facing send event only. |
| Existing pause policy may not cover every Snooze or AUX case. | Product and Engineering | Adjusted RLT may be disputed. | Store raw duration, adjusted duration, and quality flags. |
| Historical data may lack T2 or T3. | Engineering | Backfill coverage may be incomplete. | Mark backfill status clearly and do not infer missing events. |
| Multi-assignee attribution can be misunderstood. | Product and Design | Agent performance debate. | Export first assignee snapshot and first responder separately. |
| Internal-only tickets may pollute response metrics. | Product and Engineering | Misleading ticket reports. | Use Not Applicable status and never export zero. |
| Offline Report column changes may affect downstream spreadsheets. | Product | Customer templates may break. | Append columns after existing base columns. Do not reorder existing columns. |
| Timer can be misread as SLA breach countdown. | Product and Design | Users may assume RLT or Wait Time has breach logic. | Label as informational metric. Do not use breach color or alert copy. |
| Socket delay can make timer look inaccurate. | Engineering | User trust issue. | Use server timestamp and correct drift on sync. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Eligible conversation metric creation rate | 99 percent | 30 days | Metric records |
| Completed Wait Time rate for assigned conversations | 98 percent | 30 days | Metric records |
| Completed RLT rate for replied conversations | 98 percent | 30 days | Metric records |
| Conversation Detail timer render coverage | 99 percent of eligible active conversations | 30 days | Frontend telemetry |
| Linked Ticket Detail metric render coverage | 99 percent of eligible linked tickets | 30 days | Frontend telemetry |
| Internal-only ticket false metric rate | 0 percent | 30 days | Ticket report QA |
| Offline Report metric column availability | 100 percent | 30 days | Export validation |
| Invalid metric rate | Under 1 percent | 30 days | Metric quality logs |
| Backfill false inference rate | 0 percent | Backfill period | QA sampling |
| Timer drift correction rate | 99 percent corrected within 5 seconds after reconnect | 30 days | Client telemetry |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| RLT and Wait Time dashboard widgets | Supervisors may need real-time queue monitoring. |
| RLT and Wait Time SLA thresholds | Teams may want breach rules after metric quality is proven. |
| Queue-level SLA | Wait Time can become a staffing and routing SLA. |
| Per-channel benchmarks | WhatsApp, Email, and Live Chat may need different operational targets. |
| Agent-level fairness model | Multi-assignee and reassignment attribution may need deeper analytics. |
| Additional metrics | Assignment Wait Time and Routing Latency may become first-class metrics. |
| Custom report filters | Users may later filter by RLT bucket or Wait Time bucket. |
| Alert and reminder support | Operations may want pre-breach reminders after thresholds are defined. |
| Team Inbox SLA policy extension | Different teams may need different RLT or queue targets. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Phase 1 has live timer and export only. | Users can monitor elapsed handling time, but there is no alert or breach action. |
| RLT and Wait Time have no independent threshold. | Timer is informational and must not be interpreted as a standalone SLA breach. |
| Historical backfill depends on available events. | Older records may show incomplete metrics. |
| Wait Time adjusted equals raw in Phase 1\. | Queue pause policy is not modeled yet. |
| Only primary linked conversation is used for ticket metrics. | Tickets linked to multiple conversations may not show all response contexts. |
| No dashboard widget in Phase 1\. | Metrics are visible in detail pages and Offline Report only. |
| Multi-assignee attribution is simplified. | One metric row is stored per conversation session, not per assignee. |
| Timer accuracy depends on server timestamp availability. | Missing source events show incomplete state. |

## **16\. Appendix**

### **A. Glossary**

| Term | Definition |
| ----- | ----- |
| T1 | First customer inbound message received by server for the active conversation session. |
| T2 | First successful assignment or claim to at least one active agent. |
| T3 | First successful customer-facing agent reply accepted by the system for delivery. |
| FRT | First Response Time. Existing metric calculated from T3 minus T1. |
| RLT | Response Lead Time. New Phase 1 metric calculated from T3 minus T2. |
| Wait Time in Queue | New Phase 1 metric calculated from T2 minus T1. |
| Assignment Wait Time | Diagnostic metric calculated from T2 minus first\_queue\_or\_team\_bucket\_at. |
| Routing Latency | Diagnostic metric calculated from first\_queue\_or\_team\_bucket\_at minus T1. |
| Raw Duration | Duration without excluding pause intervals. |
| Adjusted Duration | Duration after excluding valid pause intervals based on existing policy. |
| Internal-only Ticket | Ticket without linked customer conversation and without customer-facing reply capability. |
| Customer-facing Reply | Agent message sent to customer through supported channel, not an internal note. |
| Live Metric Timer | Informational timer shown in UI using server timestamps. It is not a breach countdown. |

### **B. Formula Summary**

| Metric | Formula | Phase 1 Display |
| ----- | ----- | ----- |
| FRT | T3 minus T1 | Existing behavior. |
| Wait Time in Queue | T2 minus T1 | Live timer before first assignment. Final duration after T2. |
| RLT | T3 minus T2 | Live timer after first assignment. Final duration after T3. |
| Assignment Wait Time | T2 minus first\_queue\_or\_team\_bucket\_at | Optional diagnostic export column. |
| Routing Latency | first\_queue\_or\_team\_bucket\_at minus T1 | Optional diagnostic export column. |
| RLT Pause Duration | rlt\_raw\_seconds minus rlt\_adjusted\_seconds | Audit column. |

### **C. Offline Report Column Additions**

| Report Type | Template | New Column Header | Example | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Conversation | Default Conversation | First Customer Message At | 2026-05-18 09:01:00 | T1. |
| Conversation | Default Conversation | First Queue At | 2026-05-18 09:01:02 | first\_queue\_or\_team\_bucket\_at. |
| Conversation | Default Conversation | First Assigned At | 2026-05-18 09:03:00 | T2. |
| Conversation | Default Conversation | First Customer Reply At | 2026-05-18 09:05:30 | T3. |
| Conversation | Default Conversation | Wait Time in Queue | 00:02:00 | T2 minus T1. |
| Conversation | Default Conversation | Response Lead Time | 00:02:30 | T3 minus T2. |
| Conversation | Default Conversation | RLT Adjusted | 00:01:30 | Excludes valid pause intervals. |
| Conversation | Default Conversation | RLT Pause Duration | 00:01:00 | Total excluded pause time. |
| Conversation | Default Conversation | First Assignee | John Doe, Jane Doe | Snapshot at T2. |
| Conversation | Default Conversation | First Responder | Jane Doe | Agent who sent T3. |
| Conversation | Default Conversation | Metric Status | Completed | Completed, Incomplete, Invalid, Not Applicable. |
| Conversation | Default Conversation | Metric Quality Flags | aux\_excluded | Comma-separated flags. |
| Ticket | Default Ticket | Linked Conversation ID | CNV-88921 | Empty for internal-only ticket. |
| Ticket | Default Ticket | Response Metric Source | Conversation Inbox | Conversation Inbox, Ticket Reply UI, Not Applicable. |
| Ticket | Default Ticket | First Customer Message At | 2026-05-18 09:01:00 | T1 if applicable. |
| Ticket | Default Ticket | First Assigned At | 2026-05-18 09:03:00 | T2 if applicable. |
| Ticket | Default Ticket | First Customer Reply At | 2026-05-18 09:05:30 | T3 if applicable. |
| Ticket | Default Ticket | Wait Time in Queue | 00:02:00 | "Tidak berlaku" for internal-only ticket. |
| Ticket | Default Ticket | Response Lead Time | 00:02:30 | "Tidak berlaku" for internal-only ticket. |
| Ticket | Default Ticket | RLT Adjusted | 00:01:30 | "Tidak berlaku" for internal-only ticket. |
| Ticket | Default Ticket | Metric Status | Completed | Completed, Incomplete, Invalid, Not Applicable. |
| Ticket | Default Ticket | Metric Quality Flags | linked\_after\_reply | Comma-separated flags. |

### **D. Controlled Quality Flags**

| Flag | Meaning |
| ----- | ----- |
| missing\_t1 | First customer inbound timestamp is missing. |
| missing\_t2 | First agent assignment timestamp is missing. |
| missing\_t3 | First customer-facing reply timestamp is missing. |
| invalid\_timestamp\_order | Timestamp order creates negative duration. |
| backfilled | Metric was calculated from historical events. |
| unassigned\_after\_t2 | Conversation became unassigned after first assignment and before first reply. |
| reassigned\_before\_reply | Conversation was reassigned before first customer-facing reply. |
| multiple\_assignees\_at\_t2 | More than one agent was assigned at T2. |
| aux\_excluded | AUX interval was excluded from adjusted RLT. |
| aux\_state\_missing | AUX state could not be evaluated. |
| snooze\_excluded | Snooze interval was excluded from adjusted RLT. |
| waiting\_customer\_before\_first\_reply | Waiting on Customer occurred before first customer-facing reply. |
| team\_moved\_before\_reply | Team Inbox changed before first customer-facing reply. |
| multiple\_links\_primary\_used | Ticket has multiple linked conversations and Phase 1 used the primary link. |
| internal\_only\_ticket | Ticket is internal-only and response metrics are Not Applicable. |
| ticket\_reply\_ui\_t3 | T3 came from customer-facing Ticket reply UI. |
| bot\_reply\_ignored | Bot reply was ignored for T3. |

### **E. UI Copy**

| Context | Copy |
| ----- | ----- |
| Wait Time label | "Waktu Antre" |
| RLT label | "Waktu Kerja Staf" |
| Metric section title | "Metrik Respons" |
| Loading metric | "Memuat metrik" |
| Missing metric value | "Belum tersedia" |
| Not applicable metric | "Tidak berlaku" |
| Empty export value | "-" |
| Invalid metric value | "Invalid" |
| Report processing failure | "Gagal membuat laporan" |
| Access denied | "Akses ditolak" |
| Processing status | "Diproses" |
| Completed status | "Selesai" |
| Expired status | "Kedaluwarsa" |
| Tooltip for no alert | "Metrik ini hanya untuk pemantauan. Belum ada alert atau SLA breach." |

### **F. Recommended UI Placement**

| Page | Placement | Content |
| ----- | ----- | ----- |
| Conversation Detail | Near existing SLA countdown or assignee section. | "Waktu Antre", "Waktu Kerja Staf", metric status, tooltip. |
| Ticket Detail | Near ticket SLA or linked conversation context. | Linked conversation response metric values. |
| Offline Report Download | No new filter. | Existing export includes additional columns. |
| Dashboard | Not included in Phase 1\. | No widget or chart. |

### **G. State Display Matrix**

| State | Wait Time Display | RLT Display | Notes |
| ----- | ----- | ----- | ----- |
| T1 exists and no T2 | Running | "Belum tersedia" | Customer is waiting for assignment. |
| T2 exists and no T3 | Completed | Running | Agent handling time is active. |
| T3 exists | Completed | Completed | First response cycle is finished. |
| Missing T1 | Invalid | Invalid | Cannot calculate source timing. |
| Internal-only ticket | "Tidak berlaku" | "Tidak berlaku" | Ticket has no customer-facing response metric. |
| Reopened new session | New cycle | New cycle | Previous session remains completed. |

