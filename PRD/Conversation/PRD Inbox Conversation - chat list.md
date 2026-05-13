# **Product Requirement Document (PRD)**

**Feature:** Omnichannel Inbox / Chat List

| Launch Date | 9 June 2025 |
| :---- | :---- |
| **Product Manager** | Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 28 Aug 2025 | Yusril Ibnu Maulana | Initial draft with overview, problems, OKRs, success metrics, user stories, error handling, future considerations, and limitations. |
| v1.1 | 03 Sep 2025 | Yusril Ibnu Maulana | Aligned with standard template: Added Target Personas, Impact to Problem Statement, Timeline to OKRs, numbered User Stories with priorities, Functional Requirements, Non-Functional Requirements, UI/UX Requirements, Dependencies & Risks. Converted content to tables where applicable. Rechecked priorities based on business impact (P0: Core list functionality and reliability; P1: Productivity enhancements; P2: Advanced features). Enhanced SLA indicators, search/filter capabilities, and error handling. |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Define requirements for the **Chat List** in SatuInbox, providing agents with fast, intuitive, and real-time access to conversations across channels for Indonesian businesses, ensuring efficient prioritization and collaboration. |
| **Key Capabilities** | Status tabs (Unassigned, Ongoing, Resolved), stateful scroll, quick assign, tagging, channel-specific identity, delivery/read indicators, real-time updates via socket, hover profile preview, advanced search & filter, bulk actions, sorting, SLA/resolved indicators, presence indicators, lazy loading, caching, and infinite scroll. |
| **Outcome** | Faster chat access, improved navigation efficiency, clear workload monitoring, contextual visibility (linked tickets), real-time collaboration, and compliance with SLA through visual indicators, all optimized for high-volume enterprise use. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Agents cannot easily manage and prioritize conversations across different statuses (Unassigned, Ongoing, Resolved). | Delays response times, reducing customer satisfaction and SLA adherence. |
| 2 | Lack of consistent identity and customer context reduces efficiency. | Forces agents to open chats for context, slowing workflows and increasing errors. |
| 3 | No clear SLA or resolution indicators in chat list, reducing visibility of urgent cases. | Leads to missed deadlines, impacting service quality and compliance. |
| 4 | Real-time collaboration visibility (who is viewing) is missing, causing double handling. | Results in redundant work, confusing customers and agents. |
| 5 | Performance issues may occur when loading large chat volumes (\>10k). | Causes lag or crashes, disrupting operations for large enterprises. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Provide structured status-based navigation | 100% of chats categorized into Unassigned, Ongoing, or Resolved (verified via logs). | Q3 2025 |
| Enhance efficiency with quick actions | ≥70% of agents use Assign to Me in Unassigned chats (adoption tracking). | Q4 2025 |
| Improve SLA compliance | ≥95% overdue chats flagged correctly (monitoring dashboards). | Q4 2025 |
| Enable rich metadata & context | Hover profile available for 100% conversations (user testing). | Q3 2025 |
| Ensure high performance | Chat list loads ≤1s for up to 1000 items, supports lazy loading & caching for 10k+ (performance tests). | Q3 2025 |
| Improve collaboration | ≥70% of chats show presence indicator when multiple agents view the same chat (log analysis). | Q4 2025 |

---

## **4 | User Stories & Acceptance Criteria**

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As an Agent, I want to navigate between Unassigned, Ongoing, and Resolved chats so I can prioritize my work. | \- Tabs for Unassigned, Ongoing, Resolved with counters. \- Count \>99 shows “99+”. \- Counters update in real-time via socket. \- Tab switch \<1s. |
| US-2 | P0 | As an Agent, I want my scroll position and selection to persist per tab so I don’t lose context. | \- Scroll position saved per tab in cookies/local storage. \- Selected chats persist until changed. \- Restore on tab revisit within session. |
| US-3 | P0 | As an supervisor, I want to quickly assign chats to myself so I can start working immediately. | \- “Assign to Me” button visible in Unassigned chats. \- Action updates instantly (\<1s). \- Failed assign shows toast “Gagal assign/handover”. |
| US-4 | P0 | As an Agent, I want to see conversation identity clearly per channel so I can identify customers quickly. | \- WhatsApp 1:1: Phone (masked for non-admins), alias if set, contact name \+ number if enabled. \- WhatsApp Group: Group name \+ sender in preview. \- Live Chat: Name or “Guest” \+ ID. \- Social Media: Username/handle \+ display name if available. \- Marketplace: Buyer account or masked ID. |
| US-6 | P0 | As an Agent, I want to view delivery/read indicators in chat list so I know message status. | \- ✓ \= sent; ✓✓ grey \= delivered; ✓✓ blue \= read. \- Agent’s last reply shows agent name. \- Notes highlighted with agent name. |
| US-7 | P0 | As an Agent, I want to view channel icon on every chat list item so I can identify the source. | \- Channel badge (e.g., WhatsApp, Live Chat) on each chat card. \- Consistent icons across list. |
| US-8 | P0 | As an Agent, I want to see tags in the chat list so I can filter and prioritize. | \- Tags shown as chips. \- \>3 tags shows “+x” (max \+99) indicator. \- Hover displays full tag list. |
| US-9 | P0 | As an Agent, I want to see the last chat preview and timestamp so I can gauge recency. | \- Preview shows last message (truncated at 50 chars). \- Timestamp: Relative (e.g., “3h ago”) for \<7 days; full date otherwise. |
| US-10 | P1 | As an Agent, I want quick actions on each chat item so I can manage efficiently. | \- Context menu: Mark as Unread, Delete/Hide (role-restricted). \- Delete logs action; shows toast on failure. |
| US-5 | P1 | As an Agent, I want to preview customer context from the chat list so I can assess priority without opening. | \- Hover on identity/avatar shows mini profile (sender info, last 3 tickets with status). \- Profile loads ≤1s. \- Tickets link to Ticket System. |
| US-11 | P1 | As an Agent, I want to search and filter chats flexibly so I can find specific conversations. | \- Search by name, number, alias, chat content, custom properties. \- Filters: All, Unread (with count) and Read \- Advanced Filters: Agent, Tag, Channel, Status, SLA (Overdue, Near Due), Channel. \- Highlight keywords in results. \- Reset Filters button available. |
| US-12 | P1 | As an Agent, I want bulk actions on multiple chats so I can manage efficiently. | \- Multi-select via checkboxes. \- Bulk actions: Handover, Assign, Delete (role-restricted). \- Show selected count. \- Failed action shows toast with retry option. |
| US-13 | P0 | As an Agent, I want to see if a chat is on Hold so I can manage my workload. | \- Hold indicator (icon) on chat card. \- Tooltip shows who set Hold and timestamp. \- Filter for “On Hold / Not On Hold”. |
| US-14 | P0 | As an Agent, I want to see SLA countdown with colors so I can prioritize chats. | \- SLA countdown on each chat card. \- Colors: Green (\>50%), Yellow (≤50% & \>10%), Red (≤10% or overdue). \- Configurable via Settings. |
| US-15 | P1 | As an Agent, I want sorting and priority marking so I can organize chats. | \- Sort by: Most Recent, Longest Waiting, Mentions, Reminder. \- Sorting persists in session. |
| US-16 | P1 | As an Agent, I want to know if another agent is viewing the same chat so I avoid double handling. | \- Presence indicator (avatar/icon) when ≥2 agents view chat. \- Updates real-time via socket. \- Tooltip shows agent names. |
| US-17 | P2 | As an Agent, I want SLA and resolved indicators on chats so I can track status. | \- SLA breach: Red warning icon. \- Resolved: Green check icon. \- Icons visible on all relevant chats. |
| US-18 | P2 | As an Agent, I want loading and sync indicators so I know system status. | \- Loading spinner during pagination. \- Sync indicator during WhatsApp sync. \- Non-blocking UX. |
| US-19 | P0 | As an Agent, I want to see real-time typing status in chat list so I know active conversations. | \- Typing indicator (dots) when customer/agent is active. \- Updates via socket; fades after 5s inactivity. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Status Tabs** | \- Tabs: Unassigned, Ongoing, Resolved. \- Counters update via socket; cap at “99+”. \- Switch time \<1s. |
| **State Persistence** | \- Save scroll position, selections, and filters per tab in cookies/local storage. \- Restore on revisit within session. |
| **Quick Assign** | \- “Assign to Me” button in Unassigned tab. \- Updates DB instantly; logs failures. \- Rollback on error. |
| **Identity Display** | \- WhatsApp 1:1: Phone (masked for non-admins), alias, or contact name. \- WhatsApp Group: Group name \+ sender. \- Live Chat: Name or “Guest” \+ ID. \- Social Media: Username/handle \+ display name. \- Marketplace: Buyer account or masked ID. |
| **Context Preview** | \- Hover on identity/avatar shows mini profile (sender info, last 3 tickets). \- Load time ≤1s; links to Ticket System. |
| **Delivery/Read Indicators** | \- Sent: ✓; Delivered: ✓✓ grey; Read: ✓✓ blue. \- Agent replies/notes show agent name; notes highlighted. |
| **Channel Icons** | \- Display badge for channel (e.g., WhatsApp, Live Chat) on each card. \- Consistent iconography across list. |
| **Tagging** | \- Show tags as chips; \>3 tags shows “+x”. \- Hover shows full list; sync with WhatsApp Business API. |
| **Chat Preview** | \- Last message truncated at 50 chars. \- Timestamp: Relative (\<7 days) or full date. |
| **Quick Actions** | \- Context menu:  Mark as read Close conversation Set Reminder Assign to Star conversation Pin for me Mark as Spam Delete (Admin/Owner Only) \- Log actions; show failure toasts. |
| **Search & Filter** | \- Search: Name, number, alias, content, custom properties. \- Filters: Agent, Tag, Channel, Status, SLA. \- Highlight keywords; Reset Filters button. |
| **Bulk Actions** | \- Multi-select checkboxes;  \- Actions: Mark as read Close conversation Set Reminder Assign to Star conversation Pin for me Mark as Spam Delete (Admin/Owner Only) \- Show selected count; log success and failures with retry. |
| **Hold Indicator** | \- Icon on chat card; tooltip with who set Hold and timestamp. \- Filter for Hold status. |
| **SLA Indicators** | \- Countdown timer on each card. \- Colors: Green (\>50%), Yellow (≤50% & \>10%), Red (≤10% or overdue). \- Configurable in Settings. |
| **Sorting & Priority** | \- Sort by: Date Started, Waiting Since, Priority. \- Priority via star icon; persists in session. |
| **Presence Indicators** | \- Avatar/icon for ≥2 agents viewing chat. \- Real-time updates; tooltip with agent names. |
| **Status Indicators** | \- SLA breach: Red warning icon. \- Resolved: Green check icon. \- Visible on all relevant chats. |
| **Loading/Sync** | \- Spinner for pagination; sync indicator for WhatsApp. \- Non-blocking UX. |
| **Typing Indicators** | \- Show typing dots for active customer/agent. \- Update via socket; fade after 5s. |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- Load ≤1s for 1000 chats; ≤3s for 10k+ with lazy loading. \- Socket updates ≤2s latency. |
| **Scalability** | \- Support ≥10k chats per tenant. \- Horizontal scaling for DB queries and sockets. |
| **Reliability** | \- Zero conflicts in assignments. \- Auto-retry for sync failures; 99.9% uptime SLO. |
| **Security** | \- RBAC: Delete restricted by role. \- Mask sensitive data (e.g., phones) for non-admins. \- Comply with UU ITE. |
| **Accessibility** | \- WCAG 2.1 AA: ARIA labels for indicators, filters. \- ≥5 keyboard shortcuts (e.g., select, assign). |
| **Observability** | \- Metrics: Load times, SLA accuracy (Prometheus). \- Logs: Structured JSON for actions, failures (ELK Stack). |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Status Tabs** | Tabs for Unassigned, Ongoing, Resolved with counters (red unread, normal total). | Click tab to switch; counters update instantly; “99+” for high counts. |
| **Chat Card** | Shows identity, channel icon, tags, preview, timestamp, delivery/read indicators, SLA countdown, presence, hold status. | Click card to open chat; hover for profile preview; right-click for context menu. |
| **Quick Actions** | “Assign to Me” button (Unassigned); context menu for Mark as Unread, Delete. | Click “Assign to Me” to claim; right-click for menu; toasts for failures. |
| **Search & Filter** | Search bar \+ filter panel (Agent, Tag, Channel, Status, SLA). | Type in search; select filters; reset via button; results highlight keywords. |
| **Bulk Actions** | Checkbox for multi-select; toolbar for Handover, Assign, Delete. | Select chats; click toolbar action; confirm in popup; show selected count. |
| **Indicators** | SLA (color-coded timer), Hold (icon \+ tooltip), Presence (avatar), Typing (dots). | Hover for tooltips; real-time updates via socket; non-blocking UX. |
| **Loading States** | Spinner for pagination; sync indicator for WhatsApp. | Scroll to load more; sync shows non-blocking animation. |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Failed Assign/Handover | Rollback to previous state; log event. | "Gagal assign/handover." |
| Invalid Filter | Reset to default; highlight invalid input. | "Filter tidak valid." |
| Server Error | Retry with backoff; fallback to cached data. | "Gagal memuat daftar chat. Silakan coba lagi." |
| Sync Error | Retry sync; show toast. | "Gagal sinkronisasi dengan WhatsApp." |
| Rate Limit Exceeded | Throttle actions; wait timer. | "Terlalu banyak request, coba beberapa saat lagi." |
| DB Query Timeout | Fallback to cached state; retry. | "Koneksi lambat, coba lagi nanti." |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Omnichannel Inbox for chat data and socket updates. \- WhatsApp Web Integration for delivery/sync indicators. \- Ticket System for context previews. |
| **External** | \- WhatsApp Libraries (Baileys, Cloud API) for sync and identity. \- WebSocket library for real-time updates. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Socket Sync Lag | Medium | High | Optimize WebSocket; fallback to polling. |
| Performance with 10k+ Chats | Medium | High | Test with 10k+ chats; implement lazy loading and caching. |
| SLA Misconfiguration | Low | High | Validate SLA settings; provide default configs. |

---

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| Avg. Time to Locate Chat | ≤2s | User session tracking (Google Analytics). |
| SLA Overdue Detection | 100% | Monitoring (Prometheus/Grafana). |
| % of Users Using Quick Actions | ≥70% | Feature adoption tracking. |
| Load Time for ≤1000 Chats | ≤1s | Performance tests. |
| Load Time for ≥10k Chats | ≤2s | Performance tests with caching. |
| Latency for Socket Updates  | ≤2s | Real-time metrics. |
| % of Chats with Presence Indicators | ≥70% | Log analysis |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| AI-driven chat prioritization (sentiment \+ SLA). | P1 |
| Saved search & filter presets per user. | P1 |
|  |  |
| Advanced reporting on SLA compliance and workload. | P2 |
| Enhanced visual indicators (e.g., SLA countdown timer animations). | P2 |
| Mobile-optimized chat list UX with offline caching. | P1 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Only predefined identity rules per channel. | Allow alias/overrides via settings. | P2 |
| Bulk delete limited by role & policy. | Supervisors/Admins perform cleanup. | P2 |
| SLA breach icon only shows after SLA is configured. | Ensure SLA settings are always maintained. | P1 |
| Rich profile context limited to hover preview. | Full details available in Chat Details panel. | P2 |

