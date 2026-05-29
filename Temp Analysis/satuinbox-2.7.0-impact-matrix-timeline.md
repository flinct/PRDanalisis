# SatuInbox prod-2.7.0 Impact Matrix and Timeline

Tanggal analisis: 2026-05-29

Scope OpenProject: SatuInbox `prod-2.7.0`, 68 work package.

Status count:

| Status | Count |
|---|---:|
| In progress | 2 |
| Waiting Merge Request | 1 |
| Specified | 18 |
| In specification | 9 |
| Confirmed | 9 |
| New | 29 |

Estimasi memakai person-days remaining:

| Role | Meaning |
|---|---|
| FS | Fullstack work, web FE + BE |
| Mob | Mobile-specific work/regression |
| QA | Test case, functional test, retest, regression for that ticket |
| TL | Architecture, review, merge gate, release risk control |

## Capacity Assumption

Team:

| Role | Headcount | Gross capacity/week |
|---|---:|---:|
| Fullstack | 2 | 10 FS-days |
| Mobile | 1 | 5 Mob-days |
| QA+PM | 1 | 5 QA/PM-days |
| Tech Lead | 1 | 5 TL-days |

Recommended effective weekly allocation with incoming bug buffer:

| Role | Planned release work | Bug/intake buffer | Review/PM/support |
|---|---:|---:|---:|
| Fullstack | 7.5 FS-days | 2.0 FS-days | 0.5 FS-days |
| Mobile | 4.0 Mob-days | 0.75 Mob-days | 0.25 Mob-days |
| QA+PM | 3.0 QA-days | 1.0 QA-day | 1.0 PM/grooming day |
| Tech Lead | 3.0 TL-days | 1.0 TL-day | 1.0 architecture/release day |

## Full 68 Ticket Matrix

| ID | Status | Requirement source | Requirement summary | Impact modules | Impact | Risk/dependency | FS | Mob | QA | TL |
|---:|---|---|---|---|---|---|---:|---:|---:|---:|
| 1708 | In progress | OP + Analytics PRD | Offline Report job status refreshes after submit, pagination, and navigation without manual reload. | FE Analytics, React Query cache, analytics-service, API Gateway | Medium | Cache invalidation, polling/socket fallback | 1.0 | 0 | 0.75 | 0.25 |
| 168 | In progress | OP + Add-ons/Billing PRD | Enable paid Telegram Bot channel for inbound conversation and agent replies. | Add-ons, Conversation, Channel, Telegram adapter, People, Notification, Payment | Critical | New channel integration, webhook, billing, SLA/contact integration | 18.0 | 4.0 | 6.0 | 3.0 |
| 1820 | Waiting MR | OP + BE memory | Upgrade Baileys to v7 rc-10 and verify WhatsApp Web flows. | whatsapp service, session, message, broadcast, conversation events | Critical | Library breaking changes can break send/receive/connect | 0.5 | 0 | 1.5 | 0.25 |
| 1836 | Confirmed | OP | Lead reassignment syncs instantly to assigned agent and notification counter. | Leads, sales-service, notification-service, Socket.IO | High | Socket race, stale state across sessions | 3.0 | 0 | 1.5 | 0.5 |
| 1834 | Confirmed | OP + Contact PRD | Existing Contact tab shows clear empty state when no Sales contacts exist. | Leads contact picker UI | Low | Copy/design consistency | 0.5 | 0 | 0.25 | 0.25 |
| 1823 | Confirmed | OP + Contact PRD | Leads contact form validates numeric phone max 20 and valid email/company email. | Leads form, sales-service, people-service validation | Medium | FE/BE validation alignment, existing invalid data | 1.5 | 0 | 0.75 | 0.25 |
| 1814 | Confirmed | OP | Lead filter checkbox does not overlap text. | Leads filter UI | Low | Responsive layout regression | 0.5 | 0 | 0.25 | 0.25 |
| 1625 | Confirmed | OP | Visit Detail Decision section matches design. | Leads visit detail modal | Low | Design reference dependency | 0.75 | 0 | 0.5 | 0.25 |
| 1619 | Confirmed | OP | Visit History Planned column badges are neatly arranged. | Leads visit history table | Low | Table responsive regression | 0.5 | 0 | 0.25 | 0.25 |
| 1572 | Confirmed | OP | Notification subscription timestamps use local app time, not UTC. | Notification center, notification-service, payment events | Medium | Timezone standardization, avoid double conversion | 1.0 | 0 | 0.75 | 0.25 |
| 1271 | Confirmed | OP + Subscription PRD | QRIS Pay Invoice loads QR code, timer, and amount successfully. | Subscription payment modal, payment-service, QRIS gateway | Critical | External gateway, prod credentials, idempotent payment state | 3.0 | 0 | 2.0 | 0.75 |
| 1207 | Confirmed | OP + Subscription/Broadcast PRD | Broadcast is blocked when token balance is Rp0 or insufficient. | Broadcast, payment-service token ledger, API Gateway | Critical | Revenue leakage, send-vs-deduct race | 2.5 | 0 | 1.5 | 0.5 |
| 271 | Specified | OP + Conversation/Ticket PRDs | Add internal/team mentions with realtime notification, access checks, dedupe, and mention sorting. | Conversation, Ticket, Notification, Socket, RBAC | Critical | Socket fanout, access grant, indexing | 20.0 | 4.0 | 8.0 | 3.5 |
| 1633 | Specified | OP + Ticket Related/Merge PRD | Detect, relate, and merge duplicate tickets under main/sub ticket grouping. | Ticket, search, timeline, notification | High | No undo, idempotent merge, grouped list | 24.0 | 0 | 8.0 | 3.0 |
| 1632 | Specified | OP + Related Conversations PRD | Group related conversations by exact match keys with grouped list/room tabs. | Conversation, search, notification, settings | Critical | Match-key config, unread/sort aggregation | 26.0 | 3.0 | 9.0 | 3.5 |
| 1417 | Specified | OP + RBAC PRD | CRUD roles/RBAC with grouped permissions, privacy modes, and propagation. | People, Auth, middleware, all modules | Critical | Migration, stale cache/token, permission mismatch | 32.0 | 2.0 | 12.0 | 5.0 |
| 1293 | Specified | OP + Auto Reply PRD | Send bot auto-replies for outside office hours/no-agent using conversation/ticket templates. | Conversation, Ticket, Office Hours, Scheduler, Messaging | High | Presence accuracy, SLA exclusion, duplicate sends | 18.0 | 1.0 | 7.0 | 2.5 |
| 574 | Specified | OP + WA Import Mode PRD | Queue-connect WA Web accounts and configure Full/Whitelist/Exclude import modes. | Channel, WhatsApp, Conversation, Contacts, Audit | High | QR races, old data migration, 5k targets | 26.0 | 0 | 10.0 | 3.5 |
| 501 | Specified | OP + WA Account Pools PRD | Add General/Group/Backup account pools with auto failover and rotation. | WA Settings, Channel, Broadcast sender selection | High | Atomic rotation, status accuracy, quota caps | 22.0 | 0 | 8.0 | 3.0 |
| 266 | Specified | OP + WA Group Mention PRD | Mention WA group participants from composer with metadata validation. | Conversation composer, WA Web connector | Medium | Stale participants, large groups, invalid targets | 12.0 | 3.0 | 5.0 | 1.5 |
| 556 | Specified | OP + Broadcast docs | Flag conversations after 3 broadcasts for automation visibility. | Conversation, Broadcast, Automation | Medium | Accurate count, idempotent flagging | 8.0 | 1.0 | 3.0 | 1.0 |
| 554 | Specified | OP + Broadcast/Conversation docs | Block close when no customer response and broadcast count below 3. | Conversation status, Broadcast history, Automation | High | False blocking, response detection, close race | 10.0 | 2.0 | 4.0 | 1.5 |
| 486 | Specified | OP + CSAT PRD | Auto-create follow-up ticket when CSAT score is below threshold. | CSAT, Ticket, Notification, Settings | High | Required defaults, active-ticket duplicate | 14.0 | 0 | 6.0 | 2.0 |
| 400 | Specified | OP + assignment refs | Auto-assign entities based on configured field-change rules. | Ticket, Conversation, Custom Fields, Assignment | High | Rule loops, eligibility, audit/source handling | 16.0 | 1.0 | 6.0 | 2.0 |
| 393 | Specified | OP + auto-close refs | Configure auto-closure rules for ticket/conversation lifecycle. | Ticket, Conversation, Scheduler, Team Inbox | High | Reopen races, timeout accuracy, status side effects | 16.0 | 1.0 | 6.0 | 2.0 |
| 373 | Specified | OP | Track Meta disabled/restricted states and block failing sends/broadcasts. | Channel, WA API, IG, Messenger, Broadcast, Composer | High | Error-code mapping, healthchecks, no retry loops | 14.0 | 2.0 | 5.0 | 2.0 |
| 287 | Specified | OP + Auto Tag PRD | Auto-apply tags to conversation/ticket from keyword rules. | Tags, Conversation, Ticket, Settings | Medium | False positives, rule performance, tag visibility | 14.0 | 0 | 5.0 | 2.0 |
| 279 | Specified | OP + Analytics Survey PRD | Add Post Survey analytics KPIs, insights, response table/export. | Analytics, Survey, Export, RBAC | Medium | Dynamic columns, scope, historical snapshots | 12.0 | 0 | 4.0 | 1.5 |
| 276 | Specified | OP + CSAT/Post Survey docs | Close automation sends client notification, CSAT reminder, and survey invite. | Automation, Ticket, Conversation, Messaging, Analytics | Critical | Idempotency, token/security, scheduling, WA/email delivery | 28.0 | 2.0 | 11.0 | 4.0 |
| 223 | Specified | OP + Contact/Search docs | Conversation/ticket can search by client email with privacy-safe results. | Conversation search, Ticket search, Contact, Masking | Medium | Email index, masked-role restrictions | 6.0 | 2.0 | 3.0 | 1.0 |
| 1292 | In specification | OP + Collaborator PRD | Add collaborator role for Conversation/Ticket: view/internal notes only. | Conversation, Ticket, RBAC, composer, activity log | High | Role overlap, assignee promotion atomicity | 16.0 | 4.0 | 7.0 | 2.5 |
| 1286 | In specification | OP + Transcript Email PRD | Customer replies to livechat transcript email create/auto-link Email conversation as Primary. | Livechat transcript, Email, linked conversations, SLA, audit | High | Duplicate linking, default email config, Email SLA | 18.0 | 3.0 | 7.0 | 3.0 |
| 1288 | In specification | OP + User Identity PRD | Standardize Display Name/Username/Email and support login by email or username. | People, Auth, Member settings, Conversation display/cache | Critical | Username scope conflict, migration/backfill | 20.0 | 5.0 | 8.0 | 3.5 |
| 553 | In specification | OP | Enforce session-scoped Broadcast list/detail visibility by Team Inbox at send time. | Broadcast list/detail/export, RBAC session, Team Inbox | High | 403 vs 404, null/unassigned row policy | 7.0 | 0 | 3.0 | 1.0 |
| 403 | In specification | OP | Add analytics for single-select dropdown custom fields. | Analytics, Custom Fields, Ticket, Conversation, aggregate jobs | Medium | Aggregate performance, stable option IDs | 10.0 | 0 | 4.0 | 1.5 |
| 398 | In specification | OP + Team Inbox HUD PRD | Team Inbox member HUD/drawer with presence, search/filter, add/remove, auto-unassign. | Team Inbox, Presence, People, Conversation assignment | High | Presence freshness, auto-unassign side effects | 12.0 | 2.0 | 5.0 | 2.0 |
| 391 | In specification | OP + Escalation Notes PRD | Require internal escalation notes for configured metadata changes. | Ticket, Conversation, update APIs, timeline/audit | High | API validation breakage, automation bypass | 11.0 | 2.0 | 5.0 | 2.0 |
| 371 | In specification | OP | Show bubble time, sticky date indicator, dynamic scroll date, date separators. | Conversation timeline UI, timestamp formatter, virtual scroll | Medium | Timezone/label behavior needs grooming | 5.0 | 2.0 | 2.0 | 0.5 |
| 272 | In specification | OP | Secure attachments in internal notes with limits, previews, ACL downloads. | Conversation/Ticket notes, media, storage, signed URLs, ACL | High | Attachment limit conflict, private storage cleanup | 14.0 | 4.0 | 6.0 | 2.5 |
| 1959 | New | OP only | Support HEIC/HEIF file compatibility. | Media, attachments, mobile picker | Medium | Mime/security handling | 3.0 | 1.0 | 1.5 | 0.5 |
| 1940 | New | OP | Mobile partial search returns earlier matching results. | Mobile search, search API | Medium | Search API vs local filter behavior | 1.0 | 2.0 | 1.0 | 0.25 |
| 1132 | New | OP + Ownership Decoupling PRD | Block/route reopen for deleted/disconnected WA Web sender. | Conversation, WA Web, Team Inbox, Audit | High | Complex reopen condition matrix | 4.0 | 0 | 2.0 | 0.5 |
| 1705 | New | OP | Fix notification click behavior and D-3 payment reminder. | Notification, Payment, Notification center | High | Scheduler and click handler overlap | 3.5 | 0 | 1.5 | 0.5 |
| 1452 | New | OP | Conversation cannot load at 500 messages. | Conversation room, message API | High | Repro thin, pagination/limit performance | 2.5 | 0 | 1.0 | 0.5 |
| 1192 | New | OP | Alert when archiving used tags. | Tag settings, Conversation/Ticket tags | Medium | Product decision for used tag archive | 1.5 | 0 | 0.75 | 0.25 |
| 1904 | New | OP | Flow Depth handles member without Team Inbox access. | Analytics, RBAC, Team Inbox | Medium | Awaiting senior confirmation | 1.5 | 0 | 0.75 | 0.5 |
| 1896 | New | OP | WA Web disconnected/suspended list syncs with status summary. | WA Web settings/account groups | Medium | Status source-of-truth | 2.5 | 0 | 1.0 | 0.5 |
| 1892 | New | OP | Team Inbox edit modal refreshes latest account state after save. | Team Inbox settings, cache/state | Medium | Stale cache | 1.5 | 0 | 1.0 | 0.25 |
| 1891 | New | OP | Contacts page shows access restriction for user without Team Inbox. | Contacts RBAC, Team Inbox scope | High | Permission vs empty state precedence | 2.0 | 0 | 1.0 | 0.25 |
| 1866 | New | OP | Notification search trims whitespace and refreshes pagination metadata. | Notification list/search | Low | Pagination state sync | 2.0 | 0 | 1.0 | 0.25 |
| 1783 | New | OP only | Statistics interactive improvement. | Analytics/statistics | Medium | Needs grooming; no detail | 2.0 | 0 | 1.0 | 0.5 |
| 1778 | New | OP only | Broadcast Email and redirect Livechat to Broadcast. | Broadcast, Email, Livechat/Contacts | High | Scope thin, cross-channel send | 5.0 | 0 | 2.0 | 1.0 |
| 1757 | New | OP | Paste clipboard image in chatbox. | Conversation composer, Media | Medium | Browser paste, upload security | 2.5 | 0 | 1.0 | 0.5 |
| 1133 | New | OP | Fix org member self-edit, delete action, and search state issues. | Member, Auth, People, Audit | High | Security and delete side effects | 4.0 | 0 | 2.0 | 0.75 |
| 1129 | New | OP | Reset voucher when package/plan changes. | Subscription, Payment, Voucher UI | High | Billing correctness | 1.5 | 0 | 1.0 | 0.25 |
| 1777 | New | OP only | Grouping WAG by tags. | WA group, Tags, Conversation list | Medium | Needs grooming, no PRD | 4.0 | 0 | 2.0 | 1.0 |
| 1746 | New | OP | Confirmation modal before deleting WA Web account. | WA Web account lifecycle | Medium | Delete side effects | 1.25 | 0 | 0.75 | 0.25 |
| 1696 | New | OP only | Bulk archive tags/labels. | Tag settings | Low | Thin requirement | 2.5 | 0 | 1.0 | 0.5 |
| 1239 | New | OP | Add Channel column to broadcast history. | Broadcast history list | Low | Column/export consistency | 1.0 | 0 | 0.5 | 0.25 |
| 857 | New | OP only | Security proven: upload file, anti hijack. | Media, Security, Storage | Critical | Needs threat model, no requirement detail | 4.0 | 1.0 | 2.0 | 1.0 |
| 548 | New | OP only | Preserve chat history and conditionally skip verification/probing automation. | Conversation history, Automation | High | Needs workflow decision | 5.0 | 1.0 | 2.0 | 1.0 |
| 420 | New | OP only | Offline/unstable connection UI and standby mode socket. | FE shell, sockets, Conversation | Medium | Needs grooming | 3.0 | 1.5 | 1.5 | 0.5 |
| 419 | New | OP only | Compact inbox sidebar and responsive UI. | Inbox navigation, responsive UI | Low | Needs design detail | 2.5 | 0 | 1.0 | 0.5 |
| 418 | New | OP only | Improve broadcast minicard and filter state UI. | Broadcast list UI/state | Low | Needs design detail | 2.0 | 0 | 1.0 | 0.5 |
| 417 | New | OP only | Improve sidebar menu state. | Main/sidebar navigation | Low | Needs design detail | 1.5 | 0 | 0.75 | 0.25 |
| 412 | New | OP only | Download files from sidebar. | Conversation/Ticket detail files | Medium | ACL/download behavior | 2.0 | 0 | 1.0 | 0.5 |
| 188 | New | OP only | Set V2 as default and remove legacy version. | Platform routing, Conversation/Ticket/WA Web | Critical | Needs cutover/migration/rollback plan | 6.0 | 1.0 | 3.0 | 1.5 |
| 182 | New | OP only | Full Conversation/Ticket reminder with notification, icon, and sort by remind. | Reminder, Notification, Conversation/Ticket | High | Engine plus UI sorting | 5.0 | 1.0 | 2.5 | 1.0 |

## Estimate Summary

| Batch | FS | Mob | QA | TL | Total person-days |
|---|---:|---:|---:|---:|---:|
| In progress + Confirmed + Waiting MR | 32.75 | 4.0 | 16.0 | 6.75 | 59.5 |
| Specified | 318.0 | 24.0 | 120.0 | 44.5 | 506.5 |
| In specification | 113.0 | 22.0 | 47.0 | 18.5 | 200.5 |
| New | 79.75 | 8.5 | 38.5 | 16.0 | 142.75 |
| All 68 tickets | 543.5 | 58.5 | 221.5 | 85.75 | 909.25 |

## Recalculated Duration

If all 68 tickets must be delivered:

| Mode | Formula bottleneck | Duration |
|---|---|---:|
| No bug buffer, QA parallel | max(FS 543.5/10, QA 221.5/4, Mob 58.5/5, TL 85.75/4) | 56-58 weeks |
| With 20-25% bug buffer, QA parallel | max(FS 543.5/7.5, QA 221.5/3, Mob 58.5/4, TL 85.75/3) | 74-78 weeks |
| With QA waiting until end | Dev stream + QA stream | 115+ weeks |

Conclusion: QA must run parallel. The realistic all-scope estimate with incoming bug buffer is around 15-18 months for this team size.

## Recommended Release Cut

Because many `Specified`, `In specification`, and `New` tickets are large cross-service features or still need grooming, recommended release strategy:

| Release cut | Content | Duration with buffer |
|---|---|---:|
| RC-A Stabilization | In progress + Waiting MR + Confirmed + committed high-risk New bug fixes | 6-8 weeks |
| RC-B Core Foundation | RBAC #1417, Identity #1288, Broadcast access #553, Payment/Broadcast guardrails | +8-10 weeks |
| RC-C Collaboration/WA | Telegram, Import Modes, Related Conversation/Ticket, Mention, Collaborator | +20-28 weeks |
| RC-D Automation/Analytics/New backlog | Automation, reminders, survey analytics, low-detail New items | +20-30 weeks |

## QA Parallel Plan

QA must start at Day 0 per ticket, not at the end.

| Workstream day | Developer activity | QA+PM activity |
|---|---|---|
| Day 0 | Technical grooming and API/schema breakdown | Requirement read, AC lock, test matrix, data needs |
| Day 1-2 | BE/API/schema/event implementation | API contract review, test data, negative case prep |
| Day 3-4 | FE integration and socket/cache handling | Partial API/UI smoke, early bug logging |
| Day 5 | Dev self-test and handover | Functional test, cross-role test |
| Day 6 | Fix QA findings | Retest and regression slice |
| Day 7 | Merge candidate | Mini regression and sign-off note |

For feature >10 FS-days, split into vertical slices and QA each slice every 2-3 days.

## Bug Buffer Policy

Weekly incoming bug handling:

| Severity | Handling |
|---|---|
| Production/payment/security/data loss | Pull into active week; drop lower-priority New item |
| Regression from active ticket | Same sprint, owned by ticket developer |
| New normal/low bug | Goes to buffer queue; only picked if 20-25% buffer remains |
| Ambiguous New feature | Needs grooming, not counted as committed release scope |
