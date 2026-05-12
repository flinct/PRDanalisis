# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Ticket Type SLA Metrics (FRT, TTC) and Stage SLA Reminder  
**Product Manager:** Yusril Ibnu Maulana  
**Engineering Lead:** Naftal  
**Design Lead:** Resky  
**Contributors:** Engineering Team, QA Team, Design Team

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-19 | Yusril | Initial PRD for Ticket Type SLA Metrics and Stage SLA Reminder with global pause policy. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Add FRT and TTC configuration to Ticket Type settings. Add 1 reminder per SLA metric and per stage. Add global pause policy for ticket SLA. |
| Scope | Patch the existing Ticket Type create and edit UI. Extend ticket SLA evaluation to include FRT, TTC, and stage reminder. |
| **In Scope** | **Out of Scope** |
| Add new section "Metrik SLA" in Ticket Type settings with FRT and TTC duration and reminder. | Multiple reminders per metric. |
| Add global toggle "Jeda SLA saat menunggu balasan pelanggan" that applies to FRT, TTC, and all stage SLAs. | Per-stage pause configuration. |
| Add optional reminder input for each stage SLA. | New notification channels like email, SMS, or push notification. |
| Validate duration and reminder rules on save. | SLA removal workflow and escalation chain. |
| In-app notifications for reminder and breach to Supervisor and Assignee. | SLA analytics dashboards beyond basic counts and lists. |

## **3\. Problem Statement**

| Problem Description | Impact |
| ----- | ----- |
| Ticket Type settings only support stage SLA duration. FRT and TTC are not configurable at ticket type level. | Teams cannot standardize response and resolution expectations per ticket type. |
| No pre-breach reminder exists for stage SLA. | Users react late and miss SLA. |
| Waiting on customer time can inflate SLA, causing false breaches. | SLA loses trust and becomes ignored. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Enable consistent SLA configuration per ticket type. | 100% of ticket types can define FRT and TTC. |
| Reduce SLA breaches with proactive reminders. | Decrease breached tickets by 15% within 30 days of release. |
| Improve SLA fairness with pause on waiting customer reply. | Reduce false breach complaints by 30% within 30 days. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to configure ticket type SLA metrics (FRT and TTC) so that each ticket type has clear response and resolution expectations. | 1\. Given I am an Admin, When I open Ticket Type create or edit page, Then I see a section labeled "Metrik SLA" with fields for "Waktu Respon Pertama" and "Waktu Penyelesaian". 2\. Given I input valid values, When I click "Simpan" or "Create", Then the system saves the ticket type and stores the SLA configuration for that ticket type. 3\. Given I input invalid values, When I attempt to save, Then the system blocks saving and shows inline validation errors in Bahasa Indonesia. |
| US-002 | P0 | As an Admin, I want to set 1 reminder per SLA metric so that Supervisor and Assignee are warned before breach. | 1\. Given reminder is set for FRT, When remaining time reaches the reminder offset, Then the system sends 1 in-app notification to Supervisor and current Assignee for that ticket. 2\. Given reminder is set for TTC, When remaining time reaches the reminder offset, Then the system sends 1 in-app notification to Supervisor and current Assignee for that ticket. 3\. Given reminder offset is equal to or greater than the SLA duration, When I attempt to save, Then the system blocks saving and shows "Pengingat harus lebih kecil dari durasi SLA". |
| US-003 | P0 | As an Admin, I want a global pause policy so that SLA timers do not count time while waiting for customer reply. | 1\. Given the toggle "Jeda SLA saat menunggu balasan pelanggan" is enabled, When a ticket enters status "Waiting on Customer", Then the system pauses FRT, TTC, and stage SLA timers for that ticket. 2\. Given SLA is paused, When the ticket leaves status "Waiting on Customer", Then the system resumes timers and preserves remaining time accurately. 3\. Given the toggle is disabled, When the ticket enters status "Waiting on Customer", Then SLA timers continue running. |
| US-004 | P0 | As an Admin, I want to configure stage SLA reminder so that users are warned before a stage SLA breach. | 1\. Given a stage has an SLA duration and reminder configured, When remaining stage SLA time reaches the reminder offset, Then the system sends 1 in-app notification to Supervisor and current Assignee. 2\. Given a stage does not have an SLA duration, When I view that stage row, Then the reminder input is disabled and cannot be saved. 3\. Given stage reminder offset is equal to or greater than the stage SLA duration, When I attempt to save, Then the system blocks saving and shows "Pengingat harus lebih kecil dari durasi SLA". |
| US-005 | P0 | As a Supervisor, I want to receive reminder and breach notifications so that I can intervene before SLA is missed. | 1\. Given I am a Supervisor with access to the ticket, When an SLA reminder triggers, Then I receive an in-app notification that deep links to the ticket detail. 2\. Given I am a Supervisor with access to the ticket, When an SLA breach occurs, Then I receive an in-app notification with status "Reminder" and deep link to the ticket detail. 3\. Given I do not have access to the ticket, When an SLA reminder or breach triggers, Then I do not receive any notification. |
| US-006 | P0 | As an Assignee, I want to receive reminder and breach notifications so that I can prioritize urgent tickets. | 1\. Given I am the current Assignee, When an SLA reminder triggers, Then I receive an in-app notification with remaining minutes and the metric name. 2\. Given I am reassigned before the trigger, When the reminder triggers, Then only the new Assignee receives the notification. 3\. Given the ticket is unassigned at trigger time, When a reminder triggers, Then the Assignee notification is not sent. |
| US-007 | P1 | As a Supervisor, I want to see at risk and breached ticket counts so that I can prioritize the most urgent tickets. | 1\. Given there are breached tickets in my scope, When I open the ticket dashboard summary area, Then I see a count for "SLA Terlewat". 2\. Given there are at risk tickets in my scope, When I open the ticket dashboard summary area, Then I see a count for "SLA Hampir Terlewat". 3\. Given I click the summary item, When the ticket list opens, Then it is pre-filtered and sorted by urgency. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Permissions | 1\. FR-001: System MUST allow only Admin to create and edit Ticket Type SLA settings. 2\. FR-002: System MUST allow Supervisor to view Ticket Type SLA settings as read-only. 3\. FR-003: System MUST deny Agent access to Ticket Type settings pages. |
| Ticket Type SLA Metrics | 1\. FR-004: System MUST add a "Metrik SLA" section to Ticket Type settings with FRT and TTC fields. 2\. FR-005: System MUST support FRT duration configured per ticket type. 3\. FR-006: System MUST support TTC duration configured per ticket type. 4\. FR-007: System MUST support exactly 1 reminder per metric for FRT and TTC. |
| Global Pause Policy | 1\. FR-008: System MUST provide a global toggle "Jeda SLA saat menunggu balasan pelanggan" on Ticket Type settings. 2\. FR-009: System MUST default the toggle to enabled for new ticket types. 3\. FR-010: System MUST apply the pause policy to FRT, TTC, and all stage SLAs for tickets using that ticket type. |
| Stage SLA and Reminder | 1\. FR-011: System MUST keep existing per-stage SLA duration inputs. 2\. FR-012: System MUST add an optional reminder input per stage SLA. 3\. FR-013: System MUST disable stage reminder input when the stage SLA duration is empty. 4\. FR-014: System MUST support exactly 1 reminder per stage SLA. |
| SLA Start, Stop, and Status Rules | 1\. FR-015: System MUST start SLA tracking for a ticket when the ticket is created and enters a non-resolved status. 2\. FR-016: System MUST consider SLA running only when the ticket status is "Submitted" or "In Progress". 3\. FR-017: System MUST pause SLA timers when ticket status is "Waiting on Customer" and pause toggle is enabled. 4\. FR-018: System MUST stop SLA timers when ticket status is "Resolved" or equivalent resolved status. 5\. FR-019: System MUST start a new SLA cycle when a ticket is reopened. |
| FRT Completion | 1\. FR-020: System MUST mark FRT as completed when the first agent response is sent after SLA cycle start. 2\. FR-021: System MUST not treat internal notes as agent response for FRT completion. 3\. FR-022: System MUST treat a manual ticket created without a customer message as starting FRT from ticket creation time. |
| TTC Completion | 1\. FR-023: System MUST mark TTC as completed when ticket transitions into a resolved status. 2\. FR-024: System MUST not trigger TTC reminder or breach after TTC is completed. |
| Stage SLA Accumulation | 1\. FR-025: System MUST measure stage SLA as cumulative time spent in the stage across multiple entries. 2\. FR-026: System MUST exclude paused intervals from stage SLA cumulative time when pause is enabled. 3\. FR-027: System MUST reset stage SLA cumulative time when a new SLA cycle starts on reopen. |
| Reminder Trigger Rules | 1\. FR-028: System MUST trigger a reminder when remaining time is less than or equal to the reminder offset and the metric is not completed. 2\. FR-029: System MUST send at most 1 reminder per metric per SLA cycle per ticket. 3\. FR-030: System MUST not send reminder while SLA is paused and MUST re-evaluate on resume. |
| Breach Trigger Rules | 1\. FR-031: System MUST mark a metric as breached when current time exceeds the deadline while SLA is running and not paused. 2\. FR-032: System MUST send at most 1 breach notification per metric per SLA cycle per ticket. 3\. FR-033: System MUST support breach even if reminder is not configured. |
| Notification Recipients | 1\. FR-034: System MUST notify all Supervisors who have access to the ticket at trigger time. 2\. FR-035: System MUST notify the current Assignee at trigger time. 3\. FR-036: System MUST notify Supervisors only when ticket is unassigned at trigger time. |
| Settings Persistence and Snapshot | 1\. FR-037: System MUST snapshot SLA configuration into each new ticket SLA cycle at cycle start. 2\. FR-038: System MUST not retroactively change active ticket SLA cycles when the ticket type settings are edited. 3\. FR-039: System MUST store an audit log entry when Ticket Type SLA settings are created or updated. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block save when FRT duration is empty or invalid. | Show inline "Durasi wajib diisi". |
| EH-002 | Validation | Block save when TTC duration is empty or invalid. | Show inline "Durasi wajib diisi". |
| EH-003 | Validation | Block save when duration is outside allowed range. | Show inline "Nilai durasi harus 1 sampai 999". |
| EH-004 | Validation | Block save when reminder is set and reminder is not less than duration. | Show inline "Pengingat harus lebih kecil dari durasi SLA". |
| EH-005 | Permission | Block create or update when user is not Admin. | Show toast "Akses ditolak". |
| EH-006 | Save failure | Do not change saved data. Allow retry. | Show toast "Gagal menyimpan. Coba lagi.". |
| EH-007 | Notification delivery | Retry delivery up to 3 times. Do not block SLA processing. | No sender-side UI error. |
| EH-008 | Invalid status mapping | If ticket enters unknown status, treat SLA as running only for known statuses. Log internally. | No user-facing error. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Ticket enters "Waiting on Customer" exactly at reminder threshold. | Pause immediately. Do not send reminder until resume and still eligible. | No extra UI beyond correct timer behavior. |
| EC-002 | Ticket resumes from pause and remaining time is already negative. | Mark breach immediately and send breach notification once. | Ticket appears in "SLA Terlewat" list. |
| EC-003 | Ticket is reassigned before reminder triggers. | Recipient is the new Assignee at trigger time. | Notification shows current assignee context. |
| EC-004 | Ticket becomes unassigned before reminder triggers. | Send notification to Supervisors only. | Notification excludes assignee. |
| EC-005 | Stage is left and re-entered multiple times. | Stage SLA time accumulates across entries within the same SLA cycle. | Remaining time reflects cumulative time. |
| EC-006 | Ticket is resolved before TTC reminder time. | Do not send TTC reminder. TTC is completed. | No notification. |
| EC-007 | Ticket is reopened after resolved. | Start a new SLA cycle. Reset reminders and breaches for the new cycle. | New cycle behaves like a fresh ticket. |
| EC-008 | Stage has no SLA duration but user previously entered reminder. | Clear reminder value on save or block until duration exists. | Show inline "Isi durasi SLA dulu". |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Ticket Type Create and Edit Page | Patch existing layout by adding SLA Metrics section above Stages section. | 1\. Admin opens Ticket Type create or edit page. 2\. Admin scrolls to "Metrik SLA". 3\. Admin configures FRT and TTC and reminders. 4\. Admin configures pause toggle. 5\. Admin configures stage SLA and reminders. 6\. Admin clicks "Create" or "Simpan". | US-001, US-002, US-003, US-004 |
| Section "Metrik SLA" | Two rows for FRT and TTC with duration input and reminder input. | 1\. Admin sets duration. 2\. Admin optionally sets reminder minutes. | US-001, US-002 |
| Global Pause Toggle | Checkbox "Jeda SLA saat menunggu balasan pelanggan" with helper text. Default enabled for new ticket type. | 1\. Admin toggles checkbox. 2\. Admin saves. | US-003 |
| Stage Row Reminder Input | Add a reminder input next to stage SLA input. Disabled if stage SLA duration empty. | 1\. Admin enters stage SLA duration. 2\. Admin enters reminder minutes. | US-004 |
| Helper Text for Pause and Waiting Stage | If pause is enabled, show helper text near stage list that time in "Menunggu balasan pelanggan" does not count. | 1\. Admin sees explanation without extra configuration. | US-003 |
| Confirmation Modal | Reuse existing save confirmation pattern if present. Show summary of SLA changes. | 1\. Admin clicks save. 2\. Modal appears "Simpan perubahan SLA?". 3\. Admin confirms. | US-001 |
| Inline Validation States | Show error text under invalid inputs. Highlight fields. | 1\. User enters invalid value. 2\. UI shows error. 3\. Save is blocked. | US-001, US-002, US-004 |
| In-app Notification Item | Notification for reminder and breach. Includes metric name and deep link to ticket. | 1\. Supervisor or Assignee opens notification list. 2\. Click opens ticket detail. | US-005, US-006 |
| Ticket Summary Counts | Minimal summary area showing "SLA Hampir Terlewat" and "SLA Terlewat" counts for tickets. | 1\. Supervisor opens ticket list area. 2\. Sees counts. 3\. Click applies filters. | US-007 |
| Loading and Empty States | Skeleton for settings sections. Empty state for summary counts when 0\. | 1\. Show skeleton while loading. 2\. Show "Tidak ada tiket yang hampir terlewat" when count 0\. | US-007 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| FRT duration value | Integer | 60 | 1 to 999\. | Yes |
| FRT duration unit | Enum | Menit | Menit, Jam, Hari. | Yes |
| FRT reminder minutes | Integer | 10 | Optional. If set, 1 to 999\. Must be less than FRT duration in minutes. | No |
| TTC duration value | Integer | 240 | 1 to 999\. | Yes |
| TTC duration unit | Enum | Menit | Menit, Jam, Hari. | Yes |
| TTC reminder minutes | Integer | 30 | Optional. If set, 1 to 999\. Must be less than TTC duration in minutes. | No |
| Pause toggle | Boolean | Aktif | Default enabled for new ticket type. | No |
| Stage SLA duration value | Integer | 120 | Optional. If set, 1 to 999\. | No |
| Stage SLA duration unit | Enum | Menit | Menit, Jam, Hari. | Yes when duration is set |
| Stage reminder minutes | Integer | 15 | Optional. Enabled only if stage duration is set. Must be less than stage duration in minutes. | No |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Ticket list summary counts must load within 800 ms for typical workspace. |
| Reliability | Reminder and breach triggers must be idempotent and not duplicate per metric per cycle. |
| Security | Permission checks must be enforced server-side for Ticket Type edits and notification access scope. |
| Observability | Track count of reminders sent, breaches sent, pause time total, and save failures. |
| Accessibility | All inputs must be keyboard navigable with visible focus and proper labels. |
| Localization | All UI labels and messages must be Bahasa Indonesia only. |
| Time Zone | Deadline and remaining time must use workspace time zone. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ticket status taxonomy must include "Waiting on Customer" consistently | Product, Engineering | Pause rule may not work as expected | Define canonical waiting status and ensure transitions use it. |
| Notification delivery reliability | Engineering | Users miss reminders | Retry 3 times and surface counts in list view as fallback. |
| User confusion for stage SLA on waiting status when pause is enabled | Product, Design | Misconfigured SLAs | Add helper text and disable stage reminder if stage duration is empty. |
| High notification volume | Product | Noise and reduced trust | Single reminder per metric and strict dedupe per cycle. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Ticket breach rate reduction | 15% decrease | 30 days | SLA event logs |
| Reminder delivery success | 98% | 30 days | Notification logs |
| False breach complaints | 30% decrease | 30 days | Support tickets and feedback tags |
| Config completion rate | 60% of ticket types have FRT and TTC configured | 60 days | Settings telemetry |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Multiple reminders per metric | Some teams want 30 and 10 minute warnings. |
| Escalation routing | Notify additional roles if breach persists for N minutes. |
| Per team overrides for ticket type SLA | Different teams may handle the same ticket type with different staffing. |
| SLA reporting | Trend views for FRT, TTC, and stage bottlenecks. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Only 1 reminder per metric or stage | Reduced flexibility for complex operations. |
| Global pause only for waiting customer reply | Cannot pause for other reasons without future enhancement. |
| Ticket type SLA changes do not affect active SLA cycles | Existing tickets keep old SLA config until next cycle. |

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Glossary | FRT is First Response Time. TTC is Time to Close. Reminder is a pre-breach warning sent when remaining time is below an offset. Waiting on Customer is waiting for customer reply. |

