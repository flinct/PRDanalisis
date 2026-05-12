# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Conversation SLA Settings Per Channel  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-19 | Yusril | Initial PRD for conversation default SLA with reminder and pause policy. |
| v2.0 | 2026-04-10 | Yusril | Transform default global conversation SLA into per-channel conversation SLA. Added migration rules, per-channel reminders, channel support matrix, new workspace defaults, and WA Web Group TTC limitation. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide channel-specific conversation SLA settings with a shared global policy so each channel can use response and resolution targets that match its operational speed. |
| Scope | Replace the legacy single global conversation SLA model with per-channel SLA cards, a shared policy section, migration from old settings, and standard defaults for new workspaces. |

| In Scope | Out of Scope |
| ----- | ----- |
| Conversation SLA only. | Ticket SLA configuration. |
| Per-channel FRT and TTC configuration. | Team Inbox SLA overrides. |
| One reminder per metric per channel. | Multiple reminders per metric. |
| Shared global policy for Waiting on Customer and AUX behavior. | Custom recipients by team. |
| Migration from old global conversation SLA to per-channel conversation SLA. | Apply changes to active SLA cycles. |
| Standard default SLA values for new workspaces. | Per-agent SLA configuration. |
| In-app reminder and breach notification. | Email, SMS, push, Slack notification. |
| Dashboard summary for at risk and breached conversations. | Advanced analytics redesign. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | One global conversation SLA does not reflect the operational speed difference between synchronous and asynchronous channels. | Users either over-tighten slow channels or over-loosen fast channels. |
| PS-002 | Legacy settings are global only, so moving to per-channel SLA risks breaking existing tenants if migration is unclear. | Existing customers may lose baseline enforcement or experience inconsistent SLA behavior after release. |
| PS-003 | Some channels such as WA Web Group do not support a normal conversation close lifecycle. | TTC becomes misleading and causes false breach reporting if enabled without channel capability checks. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Introduce channel-aware SLA configuration. | 100 percent of supported conversation channels have configurable SLA settings after release. |
| Preserve existing tenant behavior during migration. | 100 percent of migrated workspaces keep equivalent SLA values for new cycles after migration. |
| Improve SLA fit by channel type. | Reduce breached conversation rate by 15 percent within 30 days for new workspaces using standard defaults. |
| Keep reminder behavior simple and actionable. | At least 98 percent of reminder notifications are delivered successfully within 30 days. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to configure conversation SLA per channel so that each channel follows an appropriate response and resolution target. | 1\. Given I open page "SLA untuk Percakapan", When the page loads, Then I see one shared "Kebijakan" section and one SLA card for each supported conversation channel. 2\. Given I edit FRT or TTC in one channel card, When I click "Simpan perubahan", Then only future SLA cycles for that channel use the new values. 3\. Given I enter an invalid value, When I try to save, Then the system blocks save and shows inline validation in Bahasa Indonesia. |
| US-002 | P0 | As an Admin, I want to set one reminder for each SLA metric in each channel so that the system can warn before SLA breach. | 1\. Given a metric reminder is inactive, When I click the reminder button, Then I can activate it from the reminder popover. 2\. Given a reminder is active, When remaining time becomes less than or equal to the configured reminder offset, Then the system sends one in-app reminder notification for that metric in that SLA cycle. 3\. Given reminder duration is equal to or greater than SLA duration, When I try to save, Then the system blocks save and shows "Pengingat harus lebih kecil dari durasi SLA". |
| US-003 | P0 | As an Admin, I want a shared policy for Waiting on Customer and AUX mode so that channel cards stay simple and runtime behavior stays consistent. | 1\. Given toggle "Jeda SLA TTC saat menunggu balasan pelanggan" is enabled, When a conversation enters Waiting on Customer, Then TTC pauses for supported channels. 2\. Given toggle "Hitung SLA saat agen dalam mode AUX" is disabled, When the assigned agent enters AUX mode, Then running conversation SLA pauses according to the supported metrics for that conversation. 3\. Given a policy toggle changes, When I save, Then only future SLA cycles use the new policy snapshot. |
| US-004 | P0 | As an existing customer, I want my old global conversation SLA to be migrated automatically so that I keep the same baseline behavior after release. | 1\. Given my workspace already has legacy global conversation SLA, When migration runs, Then the system creates per-channel SLA records using equivalent legacy values for supported channels. 2\. Given WA Web Group does not support TTC, When migration runs, Then FRT is migrated and TTC stays disabled for WA Web Group. 3\. Given migration is completed, When I open "SLA untuk Percakapan", Then I see my migrated values instead of empty defaults. |
| US-005 | P0 | As a new customer, I want recommended default channel SLA values so that I can start using the product without manual SLA setup. | 1\. Given my workspace has no previous conversation SLA settings, When the workspace is created, Then the system seeds standard per-channel SLA defaults. 2\. Given I never edit the seeded defaults, When a new conversation starts, Then the SLA cycle uses the seeded value for its channel. 3\. Given a channel metric is unsupported, When defaults are seeded, Then that metric is stored as disabled. |
| US-006 | P0 | As a Supervisor, I want reminder and breach notifications so that I can intervene on risky conversations. | 1\. Given I supervise the current team scope of the conversation at trigger time, When reminder or breach is triggered, Then I receive an in-app notification with customer name, channel, and metric. 2\. Given I do not have access to the conversation at trigger time, When the trigger occurs, Then I do not receive the notification. 3\. Given I open the notification, When I click it, Then it deep links to the conversation detail. |
| US-007 | P0 | As an Assignee, I want reminder and breach notifications so that I can respond before SLA is missed. | 1\. Given I am the current assignee at trigger time, When reminder or breach is triggered, Then I receive an in-app notification with remaining time or overdue time and metric name. 2\. Given the conversation is unassigned at trigger time, When reminder or breach is triggered, Then no assignee notification is sent. 3\. Given the assignee changes before trigger time, When the trigger occurs, Then only the current assignee receives the notification. |
| US-008 | P0 | As an Admin or Supervisor, I want unsupported channel metrics to be clearly disabled so that I do not configure misleading SLA rules. | 1\. Given I open WA Web Group card, When I view TTC row, Then the metric is disabled and shows helper text that it is not supported for group conversations. 2\. Given a metric is disabled for a channel, When I try to edit it, Then the system prevents editing. 3\. Given a conversation uses a channel with unsupported TTC, When SLA cycle starts, Then TTC is not created for that cycle. |
| US-009 | P1 | As a Supervisor, I want at risk and breached conversation summaries so that I can prioritize urgent work. | 1\. Given there are at risk conversations in my accessible scope, When I open dashboard, Then I see card "SLA Hampir Terlewat" with count. 2\. Given there are breached conversations in my accessible scope, When I open dashboard, Then I see card "SLA Terlewat" with count. 3\. Given I click one summary card, When the filtered list opens, Then it is sorted by urgency for the selected state. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Permissions | 1\. FR-001: System MUST allow only Admin to edit and save conversation SLA settings per channel. 2\. FR-002: System MUST allow Supervisor to view conversation SLA settings as read only. 3\. FR-003: System MUST block unauthorized save attempts and show "Akses ditolak". |
| Channel Scope | 1\. FR-004: System MUST support channel-specific conversation SLA cards for Widget, WhatsApp API, WA Web Group, WhatsApp Web, Instagram, Facebook Messenger, Telegram, and Email. 2\. FR-005: System MUST identify the effective conversation SLA channel from the conversation source and subtype at cycle start. 3\. FR-006: System MUST treat WA Web Group as a distinct SLA channel from WhatsApp Web 1:1. |
| Supported Metrics | 1\. FR-007: System MUST support FRT and TTC as the only conversation SLA metrics in this release. 2\. FR-008: System MUST allow both FRT and TTC for Widget, WhatsApp API, WhatsApp Web, Instagram, Facebook Messenger, Telegram, and Email. 3\. FR-009: System MUST allow FRT only for WA Web Group. 4\. FR-010: System MUST disable TTC configuration and runtime creation for WA Web Group. |
| Shared Policy | 1\. FR-011: System MUST provide shared policy toggle "Jeda SLA TTC saat menunggu balasan pelanggan". 2\. FR-012: System MUST apply this toggle only to TTC and MUST NOT pause FRT because of Waiting on Customer. 3\. FR-013: System MUST provide shared policy toggle "Hitung SLA saat agen dalam mode AUX". 4\. FR-014: If AUX counting is disabled, System MUST pause active supported metrics while the assigned agent is in AUX mode. 5\. FR-015: If AUX counting is enabled, System MUST continue active supported metrics during AUX mode. |
| Metric Duration Configuration | 1\. FR-016: System MUST store each SLA duration as value plus unit. 2\. FR-017: Allowed units for SLA duration MUST be Menit, Jam, and Hari. 3\. FR-018: SLA duration value MUST be an integer from 1 to 999\. 4\. FR-019: System MUST normalize stored durations to minutes for validation and runtime deadline calculation. |
| Reminder Configuration | 1\. FR-020: System MUST allow one reminder per metric per channel. 2\. FR-021: Reminder configuration MUST be opened from the metric row reminder button. 3\. FR-022: Reminder popover MUST support two states only, active and inactive. 4\. FR-023: When reminder is inactive, System MUST treat the metric as having no reminder. 5\. FR-024: When reminder is active, System MUST require reminder value and reminder unit. 6\. FR-025: Allowed reminder units MUST be Menit, Jam, and Hari. 7\. FR-026: Reminder value MUST be an integer from 1 to 999\. 8\. FR-027: System MUST normalize reminder value to minutes for validation and runtime trigger calculation. 9\. FR-028: System MUST enforce normalized reminder duration \< normalized SLA duration for the same metric. |
| Reminder Button Behavior | 1\. FR-029: If reminder is inactive, metric row button MUST show "Pengingat". 2\. FR-030: If reminder is active, metric row button MUST show a compact human-readable offset such as "55 menit" or "1 jam". 3\. FR-031: Reminder popover title MUST be "Pengingat". 4\. FR-032: Reminder popover active state MUST show label "Aktif". 5\. FR-033: Reminder popover inactive state MUST show label "Nonaktif". 6\. FR-034: Reminder popover field label MUST be "Waktu pengingat". |
| SLA Start and Completion Rules | 1\. FR-035: System MUST start a conversation SLA cycle when the conversation is first assigned to an agent. 2\. FR-036: System MUST consider FRT completed when the first agent message visible to the customer is sent after SLA start. 3\. FR-037: System MUST ignore internal notes for FRT completion. 4\. FR-038: System MUST consider TTC completed when the conversation is set to resolved or closed status for channels that support TTC. 5\. FR-039: System MUST NOT create TTC for a channel that does not support TTC. |
| Snapshot and Applicability | 1\. FR-040: System MUST apply updated channel SLA settings only to new SLA cycles created after save. 2\. FR-041: System MUST snapshot channel, metric durations, reminder configs, Waiting on Customer policy, and AUX policy at SLA cycle start. 3\. FR-042: Active SLA cycles MUST remain unchanged after settings are edited. 4\. FR-043: System MUST preserve legacy active cycles during migration without recalculation. |
| Reminder Trigger | 1\. FR-044: System MUST trigger reminder when remaining time is less than or equal to the configured reminder offset and the metric is not completed. 2\. FR-045: System MUST send at most one reminder notification per metric per SLA cycle. 3\. FR-046: System MUST NOT send reminder while the metric is paused. 4\. FR-047: System MUST re-evaluate reminder eligibility when the metric resumes. 5\. FR-048: System MUST send reminder after resume if remaining time is still less than or equal to the configured reminder offset and reminder has not been sent yet. |
| Breach Trigger | 1\. FR-049: System MUST mark a metric as breached when current time exceeds the metric deadline while the metric is not paused. 2\. FR-050: System MUST send at most one breach notification per metric per SLA cycle. 3\. FR-051: System MUST support breach even if reminder is inactive. |
| Notification Recipients | 1\. FR-052: System MUST send reminder and breach notifications to all supervisors in the current accessible team scope of the conversation at trigger time. 2\. FR-053: System MUST send reminder and breach notifications to the current assignee at trigger time. 3\. FR-054: System MUST send notifications only to supervisors if the conversation is unassigned at trigger time. |
| Dashboard Summary | 1\. FR-055: System MUST show "SLA Hampir Terlewat" summary for supervisors in their accessible scope. 2\. FR-056: System MUST show "SLA Terlewat" summary for supervisors in their accessible scope. 3\. FR-057: At risk list MUST sort by smallest remaining minutes first. 4\. FR-058: Breached list MUST sort by largest overdue minutes first. |
| Migration for Existing Workspaces | 1\. FR-059: For workspaces with legacy global conversation SLA, System MUST create per-channel SLA records during migration. 2\. FR-060: System MUST copy legacy FRT duration to all supported channels, including WA Web Group. 3\. FR-061: System MUST copy legacy TTC duration to all TTC-supported channels only. 4\. FR-062: System MUST NOT create TTC config for WA Web Group during migration. 5\. FR-063: System MUST copy legacy reminder configuration to matching metrics for all supported target channels. 6\. FR-064: System MUST copy legacy Waiting on Customer and AUX policy values into the new shared policy section. 7\. FR-065: System MUST make migration idempotent so rerun does not duplicate config. 8\. FR-066: System MUST record an audit log for migration with workspace id, migration timestamp, source model version, and result status. |
| Defaults for New Workspaces | 1\. FR-067: For workspaces with no prior conversation SLA settings, System MUST seed recommended defaults at workspace creation. 2\. FR-068: Seeded defaults MUST follow the standard matrix defined in Appendix. 3\. FR-069: If a channel is unsupported or not yet enabled in the workspace, System MAY keep the seeded record inactive until the channel becomes available. |
| Auditability | 1\. FR-070: System MUST record audit log entries when any channel SLA or shared policy value is updated. 2\. FR-071: Audit logs MUST include old value, new value, actor, timestamp, workspace time zone, source page, and affected channels. 3\. FR-072: System MUST record reminder activation and deactivation as part of settings change audit logs. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Validation | Block save if SLA duration value is empty. | Show inline error "Durasi wajib diisi". |
| EH-002 | Validation | Block save if SLA duration value is outside 1 to 999\. | Show inline error "Nilai durasi harus 1 sampai 999". |
| EH-003 | Validation | Block save if reminder is active and reminder value is empty. | Show inline error "Waktu pengingat wajib diisi". |
| EH-004 | Validation | Block save if normalized reminder duration is greater than or equal to normalized SLA duration. | Show inline error "Pengingat harus lebih kecil dari durasi SLA". |
| EH-005 | Validation | Block save if channel metric is unsupported. | Disable field and show helper text "Belum didukung untuk kanal ini". |
| EH-006 | Permission | Block save if user is not Admin. | Show toast "Akses ditolak". |
| EH-007 | Save Failure | Keep current page state unchanged and allow retry. | Show toast "Gagal menyimpan. Coba lagi.". |
| EH-008 | Migration Failure | Keep legacy global config as source of truth until migration succeeds. | Show admin banner "Migrasi SLA belum selesai". |
| EH-009 | Notification Delivery | Retry failed reminder or breach delivery up to 3 times with backoff. | No user-facing error on sender side. |
| EH-010 | Missing Waiting on Customer Status | If canonical status cannot be resolved, treat Waiting on Customer pause as disabled for that conversation. | Log internally. No UI error shown to end user. |
| EH-011 | Missing AUX State | If AUX state cannot be resolved, continue timer to avoid hidden pause. | Log internally. No UI error shown to end user. |
| EH-012 | Unsupported TTC Migration | Skip TTC creation for WA Web Group during migration. | Show disabled TTC row after migration. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Reminder threshold is reached exactly when conversation enters Waiting on Customer. | TTC pauses immediately. Reminder is not sent until resume and still eligible. | No extra UI beyond timer behavior. |
| EC-002 | Conversation resumes and TTC remaining time is already negative. | System marks TTC breached immediately and sends one breach notification. | Conversation appears in "SLA Terlewat". |
| EC-003 | Conversation becomes unassigned before reminder trigger. | Reminder and breach continue. Assignee notification is skipped. Supervisor notification still sends. | No assignee shown in notification. |
| EC-004 | Assignee changes before trigger time. | Recipients are recalculated at trigger time. Only current assignee receives notification. | Notification reflects latest assignee. |
| EC-005 | First agent reply is sent before FRT reminder time. | FRT completes. No FRT reminder is sent. | No reminder toast or notification. |
| EC-006 | Conversation closes before TTC reminder time. | TTC completes. No TTC reminder is sent. | No reminder notification. |
| EC-007 | Admin saves new per-channel values while active cycles exist. | Active cycles remain unchanged because of snapshot rule. | Show toast "SLA berhasil diperbarui". |
| EC-008 | Legacy global config exists but one channel was never enabled before migration. | Per-channel record is still created. It becomes usable once the channel is active. | Card may appear inactive or read only until channel activation. |
| EC-009 | Legacy global TTC exists for WA Web Group. | Migration ignores TTC for WA Web Group. FRT only is migrated. | TTC row remains disabled with helper text. |
| EC-010 | New workspace is created with no custom SLA changes. | System seeds standard defaults automatically. | Page shows prefilled values. |
| EC-011 | Reminder is active and admin switches SLA duration unit. | System re-validates normalized duration and reminder immediately. | Validation updates inline. |
| EC-012 | Reminder is active and admin switches reminder unit. | System re-validates normalized reminder against normalized SLA duration immediately. | Validation updates inline. |
| EC-013 | Channel is removed from product entitlement after values exist. | Existing settings are retained but not used until entitlement returns. | Card shows inactive or unavailable state. |
| EC-014 | WA Web Group conversation is resolved by unsupported external action. | System does not create TTC retroactively because channel TTC remains unsupported. | No TTC shown in UI for that conversation. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Settings Page | Page title "SLA untuk Percakapan". Shows shared policy card and channel cards below it. | 1\. Admin opens "Pengaturan". 2\. Admin opens "SLA". 3\. Admin sees policy section and channel cards. 4\. Admin edits values and saves. | US-001, US-003, US-004, US-005 |
| Policy Card | Shared section labeled "Kebijakan". Shows toggle "Jeda SLA TTC saat menunggu balasan pelanggan" and toggle "Hitung SLA saat agen dalam mode AUX". | 1\. Admin changes one or both toggles. 2\. Admin saves changes. 3\. Future cycles use updated policy. | US-003 |
| Channel Card | One card per channel with channel icon, channel name, FRT row, and TTC row when supported. | 1\. Admin opens a card. 2\. Admin edits metric values. 3\. Admin saves page. | US-001, US-008 |
| Metric Row | Each row contains metric label, duration input, duration unit dropdown, and reminder button. | 1\. User edits SLA duration. 2\. User selects "Menit", "Jam", or "Hari". 3\. User optionally opens reminder popover. | US-001, US-002 |
| Disabled Metric Row | Unsupported metric row is read only with helper text. | 1\. User sees disabled TTC on WA Web Group. 2\. User cannot edit the row. | US-008 |
| Reminder Popover Inactive | Popover title "Pengingat". Shows inactive state with toggle label "Nonaktif". No time fields shown. | 1\. User clicks reminder button. 2\. Popover opens in inactive state if no reminder exists. 3\. User may activate it. | US-002 |
| Reminder Popover Active | Popover title "Pengingat". Shows active state "Aktif", field label "Waktu pengingat", value input, unit dropdown, and validation message if invalid. | 1\. User activates reminder. 2\. User enters value and unit. 3\. User closes popover or saves page. | US-002 |
| Confirmation Modal | Modal title "Terapkan perubahan SLA?". Shows summary of changed channels and shared policy values. Buttons "Batal" and "Terapkan". | 1\. User clicks "Simpan perubahan". 2\. System opens confirmation modal. 3\. User confirms changes. | US-001, US-003 |
| Toast Success | Toast "SLA berhasil diperbarui". | Shown after successful save. | US-001 |
| Toast Error | Toast "Gagal menyimpan. Coba lagi.". | Shown after failed save. | US-001 |
| Migration Banner | Admin-only banner if migration is pending or failed. | 1\. Admin opens page. 2\. System shows migration state. 3\. Banner disappears after success. | US-004 |
| In-App Notification Item | Reminder and breach notification item with customer name, channel name, metric name, and deep link. | 1\. Recipient opens notifications. 2\. Recipient clicks item. 3\. System opens conversation detail. | US-006, US-007 |
| Dashboard Cards | Supervisor dashboard cards "SLA Hampir Terlewat" and "SLA Terlewat". | 1\. Supervisor opens dashboard. 2\. Supervisor sees counts. 3\. Supervisor opens filtered list. | US-009 |
| Empty State | Empty cards or lists show no-item messages. | Show "Tidak ada percakapan yang hampir terlewat" or "Tidak ada percakapan yang terlewat". | US-009 |
| Loading State | Skeleton for policy card, channel cards, and dashboard summaries. | Shown until data is loaded. | US-001, US-009 |

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| Channel | Enum | WhatsApp API | Must be one of the supported conversation SLA channels. | Yes |
| Metric | Enum | FRT | Allowed values are FRT and TTC. Metric availability depends on channel support. | Yes |
| SLA duration value | Integer | 60 | 1 to 999\. | Yes |
| SLA duration unit | Enum | Menit | Menit, Jam, Hari. | Yes |
| Reminder active | Boolean | Aktif | Default false. | No |
| Reminder value | Integer | 50 | Required if reminder active. 1 to 999\. | Conditional |
| Reminder unit | Enum | Menit | Menit, Jam, Hari. | Conditional |
| Waiting on Customer TTC pause | Boolean | Aktif | Shared policy toggle. Default false. | No |
| AUX counting | Boolean | Nonaktif | Shared policy toggle. Default false. | No |
| Reminder button display text | String | 55 menit | Derived from active reminder value and unit. If inactive show "Pengingat". | Derived |
| WA Web Group TTC support | Boolean | Nonaktif | Always false in this release. | Derived |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Settings page load completes within 800 ms for a typical workspace. Save action succeeds or returns actionable error within 3 seconds. |
| Reliability | Migration must be idempotent. Reminder and breach delivery retries up to 3 times. Save success rate target is at least 99 percent. |
| Security | RBAC must be enforced on both UI and server side for settings changes. |
| Observability | Track settings load, save success, save failure, migration status, reminders sent, breaches sent, and unsupported metric usage. |
| Accessibility | All fields must be keyboard navigable with visible focus. Popover and modal must support focus trap and escape close. |
| Localization | All UI labels and messages must be Bahasa Indonesia only. |
| Time Zone | Deadlines, remaining time, and reminder triggers use workspace time zone. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| In-app notification module | Product, Engineering | Reminder and breach visibility depends on this module. | Retry delivery. Keep dashboard summaries as fallback visibility. |
| Canonical Waiting on Customer status | Product, Engineering | TTC pause cannot work without a stable status mapping. | Lock one canonical status before release. |
| Canonical AUX state | Product, Engineering | AUX policy becomes inconsistent without one source of truth. | Lock one canonical AUX state model before release. |
| Legacy migration failure | Engineering | Existing tenants may see missing per-channel settings. | Keep legacy global config until migration succeeds. |
| Unsupported TTC on WA Web Group | Product | Wrong expectation if not clearly disabled. | Disable TTC in config and runtime. Add helper text. |
| High volume notifications | Product | Users may ignore reminder signals. | Keep only one reminder and one breach notification per metric per cycle. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Per-channel settings coverage | 100 percent of supported channels configurable | 30 days | Settings audit logs |
| Migration success rate | At least 99 percent of legacy workspaces migrated successfully | 30 days | Migration logs |
| Reminder delivered rate | At least 98 percent | 30 days | Notification delivery logs |
| Save success rate | At least 99 percent | 30 days | Audit and error logs |
| Breached conversation rate for new workspaces | Minus 15 percent vs baseline | 30 days | SLA events summary |
| Pause usage adoption | At least 30 percent of workspaces enable Waiting on Customer TTC pause | 60 days | Settings telemetry |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Multiple reminders per metric | Different teams may need more than one warning threshold. |
| Apply changes to active cycles | Some customers may want immediate policy changes without waiting for new cycles. |
| Channel groups or reusable SLA profiles | Larger organizations may want one template applied to many channels. |
| Additional metrics such as next reply SLA | Some teams may need more granular responsiveness control. |
| Escalation routing after breach | Additional roles may need automatic notification after prolonged breach. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Only one reminder per metric | Reduced flexibility for complex operations. |
| Team Inbox SLA override is excluded | Channel cards remain simpler, but some org structures may want another override layer later. |
| WA Web Group does not support TTC | Group conversation resolution cannot be tracked through TTC in this release. |
| Settings changes do not affect active SLA cycles | Users must wait for new cycles to use new values. |

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Glossary | FRT means First Response Time. TTC means Time to Close. Reminder offset means time before deadline. Waiting on Customer means the conversation is waiting for customer reply. AUX means the assigned agent is in away or auxiliary status. |
| Migration Rule Summary | Existing legacy global values are copied into per-channel config for supported metrics. Shared policies are copied into the new policy card. Active cycles stay unchanged. |
| Channel Support Matrix | Widget: FRT yes, TTC yes. WhatsApp API: FRT yes, TTC yes. WA Web Group: FRT yes, TTC no. WhatsApp Web: FRT yes, TTC yes. Instagram: FRT yes, TTC yes. Facebook Messenger: FRT yes, TTC yes. Telegram: FRT yes, TTC yes. Email: FRT yes, TTC yes. |
| New Workspace Standard Defaults | Widget: FRT 5 Menit, TTC 30 Menit, reminder FRT 3 Menit, reminder TTC 10 Menit. WhatsApp API: FRT 15 Menit, TTC 8 Jam, reminder FRT 10 Menit, reminder TTC 1 Jam. WA Web Group: FRT 30 Menit, TTC disabled, reminder FRT 10 Menit. WhatsApp Web: FRT 15 Menit, TTC 8 Jam, reminder FRT 10 Menit, reminder TTC 1 Jam. Instagram: FRT 15 Menit, TTC 8 Jam, reminder FRT 10 Menit, reminder TTC 1 Jam. Facebook Messenger: FRT 15 Menit, TTC 8 Jam, reminder FRT 10 Menit, reminder TTC 1 Jam. Telegram: FRT 15 Menit, TTC 8 Jam, reminder FRT 10 Menit, reminder TTC 1 Jam. Email: FRT 60 Menit, TTC 24 Jam, reminder FRT 15 Menit, reminder TTC 4 Jam. |
| Key UI Labels | "SLA untuk Percakapan", "Kebijakan", "Jeda SLA TTC saat menunggu balasan pelanggan", "Hitung SLA saat agen dalam mode AUX", "Waktu respon pertama", "Waktu penyelesaian", "Pengingat", "Aktif", "Nonaktif", "Waktu pengingat", "Simpan perubahan", "Terapkan perubahan SLA?", "Batal", "Terapkan", "SLA berhasil diperbarui", "Gagal menyimpan. Coba lagi.", "Belum didukung untuk kanal ini", "Tidak ada percakapan yang hampir terlewat", "Tidak ada percakapan yang terlewat". |

