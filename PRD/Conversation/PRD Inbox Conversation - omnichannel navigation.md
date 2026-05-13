# **Product Requirement Document (PRD)**

**Feature:** Omnichannel Inbox / Inbox Navigation

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.2 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 28 Aug 2025 | Yusril Ibnu Maulana | Initial draft with overview, problems, OKRs, success metrics, user stories, UI structure, error handling, future considerations, and limitations. |
| v1.1 | 01 Sep 2025 | Resky | Added UI structure section for navigation. |
| v1.2 | 03 Sep 2025 | Yusril Ibnu Maulana | Aligned with standard template: Added Target Personas, Impact to Problem Statement, Timeline to OKRs, numbered User Stories with priorities, Functional Requirements, Non-Functional Requirements, UI/UX Requirements, Dependencies & Risks. Converted content to tables where applicable. Rechecked priorities based on business impact (P0: Core navigation and reliability; P1: Productivity enhancements; P2: Scalability features). Integrated UI structure into UI/UX Requirements; expanded Error Handling and Limitations. |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide a structured and flexible **Inbox Navigation** system for SatuInbox, enabling agents, supervisors, and admins to quickly access, organize, and manage conversations across multiple inboxes and teams for Indonesian businesses. |
| **Key Capabilities** | Main navigation (Your Inbox, All, Star, Unassigned, Closed, Spam), team inbox filters with CRUD, drag & drop assignment, multi-select operations, unread vs total counters, persistent scroll & filter states, hover tooltips, accessibility, quick search, socket-based real-time updates, lazy loading, and caching. |
| **Outcome** | Faster conversation access, improved team collaboration, scalable performance for large enterprises, real-time navigation updates without reload, and efficient inbox management across multiple teams. |
| **Target Personas** | \- **Admin/Supervisor**: Configures team inboxes, assigns chats, needs analytics and real-time updates. \- **Agent**: Navigates inboxes, manages chats, requires intuitive UI and persistent states. \- **Developer**: Integrates via APIs, needs scalable and extensible navigation logic. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Agents struggle to quickly locate conversations across multiple team inboxes. | Increases time to respond, reducing agent efficiency and customer satisfaction. |
| 2 | Lack of persistent states (scroll, filters) causes inefficiency when switching between inboxes. | Forces agents to reapply filters or scroll, disrupting workflow and increasing frustration. |
| 3 | No shared mechanism to mark or star important conversations across teams. | Hinders collaboration, as key chats are not easily accessible to supervisors or teams. |
| 4 | Manual refresh needed to reflect updates; poor real-time experience. | Delays visibility of new messages or status changes, impacting SLA adherence. |
| 5 | Limited accessibility and navigation efficiency for agents handling many inboxes. | Excludes users with disabilities and slows navigation for high-volume teams. |
| 6 | Performance may degrade with a high number of team inbox filters (\>20) without lazy loading/caching. | Causes lag or crashes, affecting large enterprises with many teams. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Enable fast and intuitive inbox navigation | Agents access target inbox within ≤2 clicks (measured via user testing). | Q3 2025 |
| Improve team collaboration | ≥80% of supervisors use Starred Inbox within first 3 months (adoption tracking). | Q4 2025 |
| Ensure state persistence across sessions | 100% filters and scroll positions retained per inbox (verified via logs). | Q3 2025 |
| Real-time updates | Navigation reflects changes (new messages, counts) ≤2 seconds (monitoring metrics). | Q3 2025 |
| Maintain scalability | Navigation supports ≥20 team inboxes with lazy loading & caching (performance tests). | Q3 2025 |

---

## 4 | User Stories & Acceptance Criteria

User stories are prioritized: P0 (Must-have for MVP), P1 (High priority enhancements), P2 (Future iterations). Priorities rechecked based on business impact (P0 for core navigation and reliability to prevent delays; P1 for productivity tools; P2 for advanced scalability).

| ID | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| US-01 | As an Agent, **I want to see all my omnichannel chats in one inbox** so that I can manage communications efficiently | Agent can view all conversations across supported channels in a single inbox view. |
| US-02 | As an Agent, **I want to filter chats by channel (WhatsApp, Live Chat, IG, Marketplace, etc.)** so that I can focus on specific sources | Agent can filter inbox by channel; only conversations from the selected channel appear. |
| US-03 | As an Agent, **I want to tag conversations across channels** so that I can organize and track them | Agent can add, edit, and remove tags; tags are persisted across channels. |
| US-04 | As an Agent, **I want to manage multiple WhatsApp numbers in one dashboard** so that sessions are seamless | Agent can log in and manage multiple WhatsApp numbers within the same dashboard. |
| US-05 | As an Agent, **I want to manage WhatsApp Group conversations** so that group interactions are handled properly | Group conversations appear in inbox and can be managed like 1:1 chats. |
| US-06 | As an Agent, **I want to know if my session is disconnected or unstable** so that I can respond quickly | Agent is notified if their WhatsApp session is disconnected or unstable. |
| US-07 | As an Admin, **I want isolation between companies and environments** so that data is secure | Data from one company/environment is not visible to other companies/environments. |
| US-08 | As an Agent, **I want to get notified for new messages** so that I don't miss updates | Agent receives real-time notifications for new incoming messages. |
| US-09 | As an Admin, **I want sensitive data censored for non-admin roles** so that privacy is maintained | Sensitive fields (e.g., phone numbers, emails) are masked for non-admin roles. |
| US-10 | As an Agent, **I want to capture and send chat screenshots to SAP** so that external integrations work smoothly | Agent can capture chat screenshots and send them to SAP; confirmation is logged. |
| US-11 | As an Agent, **I want presence indicators for better collaboration** so that interactions feel real-time | Agent can see presence status (Active, Away, On Break, etc.) of other team members. |
| US-12 | As an Admin, **I want chat retention to comply with company policy** so that data is managed automatically | System automatically archives or deletes chats based on configured company retention policy. |
| US-13 | As an Agent, **I want to convert an existing conversation into a ticket** so that the conversation context is preserved and workflows in the Ticket System remain integrated | Agent can convert a conversation into a ticket; ticket is linked back to conversation. |
| US-14 | As an Agent, **I want to send broadcast messages across channels** so that campaigns are efficient | Agent can send broadcast messages across multiple channels; recipients and results are logged. |
| US-15 | As an Admin, **I want placeholder support for Email & Social Media channels** so that future integrations are prepared | System supports placeholder objects for Email & Social Media channels for future use. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Main Navigation** | \- Menu items: Your Inbox (agent-assigned chats), Unassigned, Closed, All Conversation, Starred (team-shared), Spam. \- Instant tab switching (\<1s). \- Starred items synced across team via DB. |
| **Team Inbox Management** | \- CRUD for Admin/Supervisor: Create (name, assign agents), Rename, Edit (update agents/rules), Duplicate, Delete, Reorder (drag & drop). \- Changes propagate live via socket. \- Delete requires confirmation. |
| **Chat Assignment** | \- Drag & drop: Move chat to Team Inbox with confirmation. \- Multi-select: Batch assign/handover via checkbox selection. \- Rollback on failure; log events. |
| **Counters** | \- Unread: Red badge, real-time socket updates. \- Total: Normal font, updated with unread. \- Tooltip: Breakdown (Unassigned, Ongoing, Resolved). |
| **State Persistence** | \- Save scroll position and filters per inbox in cookies/local storage. \- Restore on tab revisit. |
| **Real-Time Updates** | \- Use WebSocket for counters, list, and state changes. \- Latency ≤2s for updates. |
| **Quick Search** | \- Filterable search bar for inbox/team names. \- Results clickable to navigate instantly. |
| **Accessibility** | \- ≥5 keyboard shortcuts (e.g., tab switch, search). \- ARIA labels for counters, menus. \- WCAG 2.1 AA compliance. |
| **Scalability** | \- Lazy load inboxes \>20. \- Cache menu state to avoid reloads. \- Optimize DB queries for 50+ inboxes. |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- Tab switch \<1s. \- Navigation load ≤2s for 50+ inboxes. \- Socket updates ≤2s latency. |
| **Scalability** | \- Support ≥20 team inboxes per tenant. \- Horizontal scaling for WebSocket and DB. |
| **Reliability** | \- Zero conflicts in inbox assignments. \- Auto-retry for failed updates; 99.9% uptime SLO. |
| **Security** | \- RBAC: Only Admin/Supervisor manage inboxes. \- Audit logs for CRUD and assignments. \- Comply with UU ITE for data protection. |
| **Accessibility** | \- WCAG 2.1 AA: ARIA labels, keyboard navigation. \- Screen reader support for menus and counters. |
| **Observability** | \- Metrics: Navigation latency, assignment success (Prometheus). \- Logs: Structured JSON for audits (ELK Stack). |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Navigation Menu** | Sidebar with sections: Main (Your Inbox, Unassigned, Closed, All, Starred, Spam), Channels (Live Chat, WhatsApp Web), Team Inboxes (dynamic list). | Agent opens sidebar; click tab to switch; real-time counter updates via socket. |
| **Team Inbox Management** | CRUD interface for Admin/Supervisor: Form for Create/Edit; drag & drop for reorder; delete button with confirmation. | Admin clicks “+ Create Team Inbox”; fill form; reorder via drag; delete with popup. |
| **Chat Assignment** | Drag & drop zone on inbox list; multi-select checkboxes for batch actions. | Drag chat to Team Inbox; confirm popup; or select multiple, click “Assign”. |
| **Counters** | Red badge for unread; normal font for total; hover tooltip for breakdown. | Hover counter to see breakdown; updates reflect instantly on new messages. |
| **Quick Search** | Search bar at top of sidebar; filters as typing. | Type inbox name; select result to navigate instantly. |
| **Empty/Error States** | Illustration \+ text for empty; retry button for errors. | No chats: Show “Tidak ada percakapan di sini”; error: Show retry \+ message. |

**UI Structure**

| Section | Sub-Menu | Description | Count Badge |
| ----- | ----- | ----- | ----- |
| **Main Section** | All Conversation | Shows all incoming chats/tickets across channels. | ✅ Total count all chats/tickets |
|  | Your Inbox | Shows chats assigned to the agent. | ✅ Total count assigned chats/tickets |
|  | Unassigned | Shows chats/tickets not assigned to any agent. | ✅ Count unassigned chats/tickets |
|  | Closed | Shows resolved/closed chats/tickets. | ✅ Count closed tickets |
|  | Starred | Shows chats/tickets marked as favorite (⭐). | ✅ Count starred tickets |
|  | Spam | Shows chats detected as spam. | ❌ No count |
| **Channels** | Live Chat | Shows conversations from Live Chat channel. | ✅ Total count per category |
|  | WhatsApp Web | Shows conversations from WhatsApp Web channel. | ✅ Total count per category |
| **Team Inboxes** | \[Team Name\] | Custom inbox for specific team (e.g., CS Customer, CS Kurir). | ✅ Count per category in team |
|  | \+ Create Team Inbox | Option to create new Team Inbox (Admin/Supervisor only). | ❌ No count |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Failed Assign/Handover | Rollback to previous state; log event. | "Gagal assign/handover." |
| Invalid Filter | Reset to default; highlight invalid input. | "Filter tidak valid." |
| Session Expired | Prompt relogin; pause actions. | "Sesi berakhir, silakan login ulang." |
| Server Error | Retry with backoff; log internally. | "Gagal memuat navigasi. Silakan coba lagi." |
| Rate Limit Exceeded | Throttle actions; wait timer. | "Terlalu banyak request, coba beberapa saat lagi." |
| DB Query Timeout | Fallback to cached state; retry. | "Koneksi lambat, coba lagi nanti." |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Omnichannel Inbox for chat data and socket updates. \- WhatsApp Web Integration for session management. \- Team Inbox Settings for filter configurations. |
| **External** | \- WebSocket library for real-time updates. \- WhatsApp Libraries (Baileys) for channel data. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Socket Update Lag | Medium | High | Optimize WebSocket; fallback to polling. |
| Scalability with Many Inboxes | Medium | High | Test with 50+ inboxes; implement lazy loading. |
| Accessibility Gaps | Low | Medium | Audit for WCAG 2.1 AA; user testing with screen readers. |

---

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| Avg. Clicks to Open Inbox | ≤2 | User session tracking (Google Analytics). |
| % of Sessions with Saved Filters/Scroll | 100% | Log analysis (ELK Stack). |
| % of Users Leveraging Team Inbox Features | ≥70% | Feature adoption tracking. |
| Latency of Counters/State Sync | ≤2 seconds | Monitoring (Prometheus/Grafana). |
| \# of Keyboard Shortcuts Supported | ≥5 | QA testing reports. |
| Max Team Inboxes Handled Without Lag | ≥20 | Performance tests. |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| Advanced filter presets per user and team. | P1 |
| Analytics on team inbox usage and chat distribution. | P2 |
| AI-driven inbox routing recommendations. | P2 |
| Mobile-friendly inbox navigation redesign. | P1 |
| Customizable navigation layout per agent. | P2 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Only Admin/Supervisor can manage filters. | Agents request changes via Admin. | P2 |
| No custom counter beyond Unread/Total. | Use hover tooltip for breakdown details. | P2 |
| Keyboard shortcuts limited to web app. | Roadmap: Extend to mobile app. | P1 |
| Navigation performance may degrade \>50 team inboxes. | Use lazy loading \+ caching to mitigate. | P1 |

