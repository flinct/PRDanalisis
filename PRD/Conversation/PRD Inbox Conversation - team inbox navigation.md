# Team Inbox

**Feature:** Omnichannel Inbox / Team Inbox Navigation

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v2.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 28 Aug 2025 | Yusril Ibnu Maulana | Initial draft with overview, problems, OKRs, user stories, error handling, future considerations, and limitations. |
| v2.0 | 03 Sep 2025 | Yusril Ibnu Maulana | Updated with key capabilities, success metrics, and refined user stories. |
| v2.1 | 03 Sep 2025 | Yusril Ibnu Maulana | Aligned to standard template. Added Impact to Problem Statement, Timeline to OKRs, numbered User Stories, Functional Requirements, Non-Functional Requirements, UI/UX Requirements table, Dependencies & Risks, enhanced Success Metrics with tools. Added Form Field Details & Validation for creation/editing. Rechecked priorities (P0: Core navigation and creation; P1: Collaboration and SLA; P2: Advanced usability). Improved error handling with negative scenarios, added workarounds for limitations. Ensured consistency with Omnichannel Inbox suite (e.g., Inbox Navigation, Conversation List). |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Enable collaborative navigation and management of Team Inboxes within the Omnichannel Inbox sidebar, supporting inline creation, organization, tagging, SLA setup, role assignments, and real-time chat reassignment via drag & drop. |
| **Key Capabilities** | Sidebar with Team Inboxes, inline "+ Team Inbox" button, drag & drop reorder/move, tags for categorization, per-inbox SLA (days/hours/minutes), roles (Supervisor: full view; Member: assigned only), counters (Unread/Ongoing/Resolved), mentions for notifications. |
| **Outcome** | Streamlined team collaboration in Omnichannel Inbox, reducing navigation friction by ≥30%, enhancing workload visibility, and ensuring real-time sync without separate settings pages. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | No direct sidebar grouping/navigation for team-based conversations. | Increases context-switching, leading to slower agent response times and higher error rates in multi-team environments. |
| 2 | Team Inbox creation/management requires separate settings, causing workflow interruptions. | Adds friction, reducing admin efficiency and delaying team setups for new projects. |
| 3 | Inefficient multi-team membership handling. | Limits scalability for agents in multiple roles, causing siloed views and missed collaborations. |
| 4 | Manual, inconsistent chat reassignment across teams. | Prone to errors like duplicate assignments, increasing resolution delays and compliance risks. |
| 5 | Missing sidebar tags/SLA indicators. | Reduces at-a-glance visibility, leading to overlooked breaches and poor prioritization. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Centralize Team Inbox management in sidebar | 100% of Team Inboxes creatable/editable via sidebar. | Q4 2025 |
| Enable quick inline creation | Team Inbox creation in ≤3 clicks; ≥95% success rate. | Q4 2025 |
| Support multi-team membership | ≥90% agents in multiple inboxes without conflicts. | Q4 2025 |
| Simplify reassignment and unassignment | Drag & drop in \<2s; 100% accurate unassignment on move. | Q4 2025 |
| Enhance visibility with tags/SLA | SLA countdowns/tags visible in 100% of applicable views. | Q4 2025 |

---

## **4 | User Stories & Acceptance Criteria**

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As an Admin, I want to create Team Inboxes directly from the sidebar so that setup is seamless. | \- "+ Team Inbox" button in sidebar opens inline modal. \- Fields: Name, Tags, SLA, Supervisors/Members. \- Save adds to sidebar instantly. \- Negative: Duplicate name shows "Nama sudah ada". |
| US-2 | P0 | As a Supervisor, I want to assign roles (Supervisors/Members) to Team Inboxes for access control. | \- Add/remove members; Supervisors see all chats, Members see assigned only. \- Real-time sync across users.  \- Negative: Invalid user shows "Pengguna tidak ditemukan"; RBAC blocks unauthorized. |
| US-3 | P0 | As an Agent, I want to view all relevant chats in my Team Inboxes for quick access. | \- Chats filtered by membership.  \- Counters: Unread, Ongoing, Resolved per inbox.  \- Negative: No membership shows empty view with "Tidak ada akses". |
| US-4 | P1 | As an Agent, I want to drag & drop chats between Team Inboxes for easy reassignment. | \- Drag & drop supported; resets to Unassigned in new inbox, clears old assignment.  \- \<2s sync.  \- Negative: Drop fail (e.g., offline) queues action; shows "Gagal pindah, coba lagi". |
| US-5 | P1 | As a Supervisor, I want Team Inbox Tags for better categorization. | \- Multi-tags as chips in sidebar/detail. \- Hover tooltip for full name.  \- Negative: Max 10 tags; exceed shows "Batas tag tercapai". |
| US-6 | P1 | As an Admin, I want per-Team Inbox SLA configuration for tailored deadlines. | \- Composite: days/hours/minutes.  \- Applies to new/ongoing; breach flagged red.  \- Negative: Invalid format (e.g., negative) prevents save with "Format SLA tidak valid". |
| US-7 | P1 | As an Agent, I want filters inside Team Inboxes for targeted views. | \- By tag, SLA, member.  \- "Reset Filters" button.  \- Negative: No results shows "Tidak ada hasil". |
| US-8 | P1 | As an Agent, I want team mentions in notes for group notifications. | \- "@TeamInboxName" notifies all members real-time. \- Negative: Invalid team shows "Tim tidak ditemukan". |
| US-9 | P2 | As a Supervisor, I want to reorder Team Inboxes in the sidebar for personalization. | \- Drag & drop reorder; per-user save.  \- Negative: Conflict (e.g., multi-user) syncs latest. |
| US-10 | P2 | As an Admin, I want to duplicate/delete Team Inboxes from sidebar for maintenance. | \- Duplicate copies SLA/tags/members.  \- Delete team inbox shot confirmation dialog.  \- Negative: Archive with active chats prompts confirmation. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Creation & Editing** | \- Inline modal for create/edit: Name, Tags, SLA, Roles.  \- Real-time addition to sidebar.  \- Negative: Validation fails block save. |
| **Role Management** | \- Supervisors: Full chat view; Members: Assigned only.  \- Multi-membership support.  \- Negative: Role conflict (e.g., demote self) prevented. |
| **Navigation & Counters** | \- Sidebar lists with counters (Unread/Ongoing/Resolved). \- Filters/tags/SLA indicators.  \- Negative: High volume (\>1000) uses auto load more virtual scrolling. |
| **Reassignment** | \- Drag & drop: Unassign old, reset new.  \- Mentions are notified via sockets.  \- Negative: Offline queues; concurrent moves merge. |
| **Archiving/Duplicating** | \- Archive: Hide from active; retain data.  \- Duplicate: Copy all except chats.  \- Negative: Active chats in archive prompt migration. |

---

## **5.1 | Form Field Details & Validation**

| Field Name | Type | Example Value | Validation | Required/Optional |
| ----- | ----- | ----- | ----- | ----- |
| Nama Team Inbox | Freetext (string) | "Tim Penjualan" | \- Max 50 chars.  \- Alphanumeric/spaces. \- No duplicates. | Required |
| Team Inbox Tags | Multi-select | \["Jabodetabek", "Prioritas"\] | \- From global list. \- Max 10\.  \- No duplicates. | Optional |
| SLA (First Response) | Composite (days/hours/minutes) | "0 hari, 2 jam, 30 menit" | \- Non-negative integers.  \- Min 1 menit. | Optional (default inherit) |
| SLA (Resolution) | Composite (days/hours/minutes) | "1 hari, 0 jam, 0 menit" | \- Non-negative integers. \- Min 1 menit. | Optional (default inherit) |
| Supervisors | Multi-select dropdown | \["Supervisor1", "Supervisor2"\] | \- From active users.  \- Min 1\.  \- No self-conflict. | Required |
| Members | Multi-select dropdown | \["Agent1", "Agent2"\] | \- From active users.  \- No overlap with Supervisors if restricted. | Optional |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- Sidebar load \<1s for 50 inboxes. \- Drag & drop \<2s. \- Handle 500 concurrent users. |
| **Scalability** | \- Support 1,000+ inboxes per tenant. \- Horizontal scaling for sockets. |
| **Reliability** | \- ≥99% sync success. \- Idempotent actions; retry failures. |
| **Security** | \- RBAC: Admin create/edit; Supervisor assign. \- Encrypt member data; UU ITE compliance. |
| **Observability** | \- Metrics: Creation time, drag failures (Prometheus). \- Logs: JSON in ELK for searches. |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Sidebar Navigation** | List of Team Inboxes with counters, tags (chips), SLA icons. Reorder via drag & drop. | Open Inbox → sidebar loads inboxes. Hover shows details. Drag inbox to reorder. |
| **Creation Modal** | Inline form: Name, Tags, SLA, Roles. Preview counters. | Click "+ Team Inbox" → fill/save. Real-time validation. Success: Adds to list. |
| **Filters Section** | Dropdowns for tag/SLA/member. Reset button. | Select filter → list updates dynamically. No results: Empty state message. |
| **Drag & Drop Interface** | Highlight drop zones; confirmation toast on success. | Drag chat → drop on inbox. Unassign old; notify if mentioned. |
| **Archive/Duplicate Buttons** | In context menu per inbox. Confirmation modals. | Right-click inbox → select action. Duplicate: New inbox appears; Archive: Removes from view. |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Validation Error | Prevent submit; highlight fields. | "Nama sudah ada" or "Format SLA tidak valid". |
| Assignment Failure | Rollback; log internally. | "Gagal menambahkan anggota". |
| Drag & Drop Fail | Queue retry; fallback to manual move. | "Gagal memindahkan chat, coba lagi". |
| Permission Denied | Hide elements; redirect if forced. | "Akses ditolak". |
| Server Error | Auto-retry with backoff; use cache. | "Gagal memuat Team Inbox. Silakan coba lagi." |
| Offline Scenario | Queue actions; sync on reconnect. | "Tidak ada koneksi. Aksi akan disinkronkan nanti." |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Omnichannel Inbox for chat context. \- Role Management for RBAC. \- SLA Settings for inheritance. \- Conversation List for counters. |
| **External** | \- WebSocket libraries for real-time sync. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Sync Delays in High Load | Medium | High | Optimize sockets; add queuing. |
| Role Conflicts During Assign | Low | Medium | Enforce validation; audit logs. |
| Data Loss on Archive | Medium | High | Confirmation prompts; backups. |

---

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| SLA Compliance per Team | ≥95% | ELK log analysis. |
| Multi-Team Membership | ≥70% agents in ≥2 inboxes | Google Analytics. |
| Creation Time | ≤3 clicks | Session tracking (Google Analytics). |
| Reassignment Accuracy | 100% | Audit logs. |
| Tag/Mention Usage | ≥80% by supervisors | Prometheus metrics. |
| User Satisfaction (CSAT) | ≥4/5 | Post-feature survey. |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| Auto-routing rules (tags/channel). | P1 |
| Team analytics dashboard. | P1 |
| Assignment algorithms (Round Robin). | P2 |
| Escalation notifications (email/Slack). | P2 |
| HRIS/SSO integration for membership. | P2 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Reassignment always unassigns. | Manual reassign post-move. | P1 |
| SLA granularity to minutes. | Use custom scripts for seconds. | P2 |
| Tags not global by default. | Admin duplicates manually. | P2 |

