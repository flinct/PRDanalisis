# **Product Requirement Document (PRD)**

**Feature:** Omnichannel Inbox

| Launch Date | 9 June 2025 |
| :---- | :---- |
| **Product Manager** | Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 28 Aug 2025 | Yusril Ibnu Maulana | Initial draft with overview, problems, OKRs, success metrics, user stories, channel support, connection management, presence, add-ons, integrations, error handling, future considerations, concerns, and limitations. |
| v1.1 | 03 Sep 2025 | Yusril Ibnu Maulana | Improved structure per standard template: Added Target Personas, Impact to Problem Statement, Timeline to OKRs, numbered User Stories with priorities, Functional Requirements, Non-Functional Requirements, UI/UX Requirements, Dependencies & Risks. Converted content to tables where applicable. Rechecked priorities based on business impact (P0: Core unification and reliability; P1: Enhancements for productivity; P2: Future scalability). Integrated channel support, session management, etc., into Functional Requirements. |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Define the global requirements for **Omnichannel Inbox** in SatuInbox, enabling enterprise-grade scalability, compliance, and a unified communication experience across multiple channels for Indonesian businesses. |
| **Key Capabilities** | Unified inbox for all channels, channel filtering, unified tagging, multi-session support, connection & session management, presence & notification, add-ons (e.g., screenshot, censoring), ticketing integration, broadcast integration, security & compliance (e.g., retention, audit logs). |
| **Outcome** | Ensure seamless omnichannel communication, robust session handling, enhanced productivity, SLA-compliance monitoring, and scalable operations across multiple companies and tenants. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Agents lack a single inbox view to manage cross-channel communications effectively. | Increases context-switching time, leading to lower productivity and higher error rates. |
| 2 | No clear multi-session management, leading to conflicts when multiple WhatsApp numbers or tenants are active. | Causes session takeovers or outages, disrupting operations and frustrating agents. |
| 3 | Lack of unified tagging and filtering across channels, making it hard to classify and track conversations. | Results in poor organization, delayed responses, and non-compliance with business processes. |
| 4 | No standardized connection status indicators, reducing agent visibility into service stability. | Leads to undetected issues, prolonging downtime and affecting customer satisfaction. |
| 5 | Limited retention and compliance handling for enterprise-grade requirements. | Risks legal non-compliance (e.g., UU ITE), data loss, or audit failures. |
| 6 | No direct integration with ticketing and broadcast systems from the inbox, slowing down workflows. | Creates silos, increasing manual work and reducing overall efficiency. |
| 7 | No global audit logs and rate limiting, impacting compliance and reliability. | Exposes system to abuse, with limited traceability for security incidents. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Provide a unified inbox across all supported channels | 100% of conversations visible in a single dashboard (measured via user testing). | Q3 2025 |
| Enable multi-session and multi-tenant support | Zero session conflicts across environments (Dev vs Prod, multi-company) (tracked in logs). | Q3 2025 |
| Improve agent efficiency | ≥90% of agents report reduced switching effort between channels (post-launch survey). | Q4 2025 |
| Ensure compliance and retention | 100% chats retained for at least 6 months, auto-archived after 6 months, auto-deleted after 12 months (audit logs). | Q3 2025 |
| Improve SLA adherence | ≥95% SLA breaches flagged in real-time (monitoring dashboards). | Q4 2025 |
| Guarantee performance at scale | Inbox supports ≥50k conversations across channels with query response ≤3s (performance tests). | Q3 2025 |

---

## **4 | User Stories & Acceptance Criteria**

User stories are prioritized: P0 (Must-have for MVP), P1 (High priority enhancements), P2 (Future iterations). Priorities rechecked based on business impact (P0 for core unification/reliability to prevent disruptions; P1 for productivity tools; P2 for advanced features).

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As an Agent, I want to see all my omnichannel chats in one inbox so that I can manage communications efficiently. | \- Unified Inbox shows all conversations with channel indicators. \- Conversations update in real-time via socket. \- Infinite scroll with high performance (≥1000 conversations load in \<1s). |
| US-2 | P0 | As an Agent, I want to filter chats by channel (WhatsApp, Live Chat, IG, Marketplace, etc.) so that I can focus on specific sources. | \- Multi-select channel filter available. \- "Reset Filters" button restores default. \- State persists per tab/session (saved in cookies). |
| US-3 | P0 | As an Agent, I want to tag conversations across channels so that I can organize and track them. | \- Tags can be added/removed. \- Tags are visible as badges in chat list. \- Integration with WhatsApp Business Tag ensures 2-way sync. \- If sync error: show toast “Gagal sinkronisasi tag”. |
| US-4 | P0 | As an Agent, I want to manage multiple WhatsApp numbers in one dashboard so that sessions are seamless. | \- Multi-session login supported. \- Session switcher dropdown available. \- Detect expired token & show error “Sesi WA perlu login ulang”. |
| US-5 | P0 | As an Agent, I want to manage WhatsApp Group conversations so that group interactions are handled properly. | \- Group shows participant list & sender name. \- Dropdown session switcher available if linked to \>1 number. \- Group chat cannot be resolved (manual tracking required). |
| US-6 | P0 | As an Agent, I want to know if my session is disconnected or unstable so that I can respond quickly. | \- Show Connection Lost or Degraded Network indicators. \- Auto-retry with exponential backoff. \- Display retry button. |
| US-7 | P0 | As an Admin, I want isolation between companies and environments so that data is secure. | \- Dev vs Prod isolation enforced. \- Multi-company separation ensured. \- Unique Group ID enforced across tenants. |
| US-8 | P1 | As an Agent, I want to get notified for new messages so that I don't miss updates. | \- Browser tab title changes on new message. \- Audio notification plays. \- Red unread badge counter increments. \- Optional push notification if enabled. |
| US-9 | P1 | As an Admin, I want sensitive data censored for non-admin roles so that privacy is maintained. | \- Phone numbers masked (e.g., 08xxxx1234). \- Full number visible only for Admin/Super Admin. |
| US-10 | P1 | As an Agent, I want to capture and send chat screenshots to SAP so that external integrations work smoothly. | \- Screenshot button appears if SAP add-on is enabled. \- Image is captured in PNG. \- Automatically sent via API to SAP. |
| US-11 | P1 | As an Agent, I want presence indicators for better collaboration so that interactions feel real-time. | \- Active and Away Indicator \- Typing indicator for both agents and customers. \- Connection quality indicator (jaringan lambat). |
| US-12 | P2 | As an Admin, I want chat retention to comply with company policy so that data is managed automatically. | \- Chats stored ≥6 months. \- Auto-archived after 6 months. \- Auto-deleted after 12 months. \- Archived chats retrievable within 3 seconds. |
| US-13 | P2 | As an Agent, I want to create a ticket directly from chat so that workflows are integrated. | \- Create Ticket option available. \- Ticket automatically linked to conversation. \- Ticket appears in Ticket System with reference ID. |
| US-14 | P2 | As an Agent, I want to send broadcast messages across channels so that campaigns are efficient. | \- Broadcast UI available. \- Supports multiple channels at once. \- Auto-tag campaign enabled. |
| US-15 | P2 | As an Admin, I want placeholder support for Email & Social Media channels so that future integrations are prepared. | \- Email chats show subject \+ sender. \- Social Media chats show username/handle. \- Placeholder AC ensures smooth transition when roadmap delivered. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Channel Support** | \- WhatsApp: Official API for 1:1; Baileys for multi-login and groups (dropdown switcher; no resolution for groups). \- Live Chat: Web widget embeddable; labeled “Live Chat”; multi-domain. \- Email (V2.5): Show subject \+ sender. \- Social Media (V3): Show username/handle. \- Marketplace (V3): Support Shopee, Tokopedia, etc. |
| **Connection & Session Management** | \- Indicators: Connection Lost, Degraded Network. \- WhatsApp: Multi-login; detect expired tokens; prompt relogin. \- Session Takeover: Auto-disable old session; show notification. \- Isolation: Dev/Prod separated; multi-company enforced; unique Group IDs. |
| **Presence & Notification** | \- Indicators: Online/offline, typing, network quality. \- Notifications: Audio for new messages; tab title change. |
| **Add-ons & Extra Features** | \- Screenshot (SAP): Capture PNG; send via API. \- Censoring: Mask phones for non-admins. \- Retention: Store ≥6 months; archive after 6; delete after 12\. \- Audit Logging: Log login/logout, takeovers, failed attempts. |
| **Ticketing & Broadcast Integration** | \- Ticketing: Create from chat; link to conversation. \- Broadcast: Multi-channel send; auto-tag campaigns. |
| **General** | \- Unified View: Real-time socket updates; infinite scroll. \- Filtering/Tagging: Multi-select filters; badges; WhatsApp sync. \- Resolved Rooms: Create new history on resolution; archive old. |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- Query response ≤3s for ≥50k conversations. \- Socket reconnection ≤5s. |
| **Scalability** | \- Support ≥50k conversations per tenant. \- Horizontal scaling for sockets and DB queries. |
| **Reliability** | \- Zero session conflicts. \- Auto-retry for connections; 99.9% uptime SLO. |
| **Security** | \- RBAC for censoring and access. \- Audit logs for all events; comply with UU ITE. \- Rate limiting to prevent abuse. |
| **Observability** | \- Metrics: SLA breaches, query times (Prometheus/Grafana). \- Logs: Structured JSON for audits. |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Unified Inbox Dashboard** | List view with channel icons, tags as badges, unread counters. Infinite scroll. | Agent opens Inbox; real-time updates via socket; filter by channel/tags. |
| **Filter Panel** | Multi-select dropdown for channels; reset button. | Click filter icon; select channels; state persists in cookies. |
| **conversation room** | Conversation timeline with presence (typing/online), indicators (network). | Select chat; see messages, tags; add tags via button. |
| **Session Switcher** | Dropdown for multi-sessions/groups. | In group chats: Select sender identity; auto-detect conflicts. |
| **Notifications** | Audio alert, tab title change, toasts for errors/takeovers. | On new message: Play sound, update title; on error: Show toast. |
| **Add-ons** | Screenshot button (if enabled); masked fields for non-admins. | Click screenshot: Capture and send; sensitive data auto-masked. |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Invalid Session | Prompt relogin; auto-disable old. | "Sesi WA perlu login ulang." |
| Network Unstable | Auto-retry; show indicator. | "Jaringan tidak stabil." |
| Session Takeover | Disable session; notify. | "Sesi Anda telah digantikan oleh login baru." |
| Unauthorized Access | Block action; redirect. | "Akses ditolak." |
| Rate Limit Reached | Throttle requests; wait. | "Terlalu banyak request, coba beberapa saat lagi." |
| Server Error | Log internally; retry. | "Gagal memuat inbox. Silakan coba lagi." |
| Sync Failure | Retry sync; toast error. | "Gagal sinkronisasi, coba ulangi." |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- WhatsApp Web Integration for sessions. \- Ticket System for integrations. \- Broadcast System for multi-channel sends. |
| **External** | \- WhatsApp Libraries (Baileys, Cloud API) – For multi-login and groups. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Session Conflicts | Medium | High | Enforce unique IDs; weekly tests. |
| Performance Bottlenecks | Medium | High | Load test with 50k convos; optimize queries. |
| Compliance Changes | Low | High | Monitor UU ITE updates; flexible retention configs. |

---

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| Session Conflict Incidents | 0 per quarter | Audit logs. |
| Avg. Time to Locate Conversation | ≤3 seconds | User session tracking (Google Analytics). |
| Retention Policy Adherence | 100% | Compliance audits (ELK Stack). |
| Agent Channel Switching Frequency | ↓50% | Usage analytics. |
| SLA Breach Detection Accuracy | 100% | Monitoring (Prometheus/Grafana). |
| % of Agents Using Filters & Tags | ≥80% | Feature adoption tracking. |
| Query Response with 50k Conversations | ≤3s | Performance tests. |
| Socket Reconnection Recovery | ≤5s | Real-time metrics. |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| Real-time auto-refresh inbox without manual reload. | P1 |
| Saved filter presets per agent/team. | P1 |
| Unified reporting across channels (chat volume, SLA, tags). | P2 |
| AI-driven auto-tagging and conversation routing. | P2 |
| Omnichannel sentiment analysis & CSAT tracking. | P2 |
| Mobile app parity with web features. | P1 |
| Cross-channel thread linking (merge same customer conversations across channels). | P2 |
| Agent load balancing & auto-routing by workload. | P1 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Group chat sessions cannot be resolved. | Agents must track resolution manually. | P2 |
| Retention hardcoded to 6/12 months. | Custom retention per tenant may be added later. | P1 |
| Broadcast auto-tagging limited to predefined campaign rules. | Advanced campaign tagging planned in roadmap. | P2 |
| Email & Social Media integration planned for future roadmap only. | Placeholder AC defined until delivery. | N/A |

