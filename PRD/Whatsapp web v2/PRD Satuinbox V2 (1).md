# **Product Requirement Document (PRD)**

**Feature:** WhatsApp Web Integration (Overview)

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
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
| v1.0 | 30 Aug 2025 | Yusril Ibnu | Initial draft with overview, problems, OKRs, features, future considerations, and limitations. |
| v1.1 | 03 Sep 2025 | Yusril Ibnu | Improved structure: Added Revision History, User Personas, User Stories & AC (with numbering and priorities), Functional Requirements, Non-Functional Requirements, UI/UX Requirements, Error Handling, Dependencies & Risks, and Success Metrics. Converted content to tables where applicable for clarity. Rechecked priorities based on business impact (P0: Core resilience; P1: Enhancements; P2: Nice-to-have). |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide a resilient, scalable, and anti-spam **WhatsApp Web Integration** for SatuInbox, an omnichannel messaging app targeted at Indonesian businesses. The system supports **multi-device per number**, **multi-library connectors**, **auto-switch logic for sessions & numbers**, **broadcast rotation**, and **human-like send simulation** to ensure compliance with WhatsApp policies, high stability, and fault tolerance. This feature enables seamless messaging without disruptions, reducing ban risks and improving agent productivity. |
| **Key Capabilities** | Multi-device QR scan and pairing, multiple library connectors (Baileys as primary, WhatsAppWebJS as backup, extensible for future), auto-switch for sessions/numbers on failure, backup numbers without auto-move, broadcast rotator by count/time, presence/read sync, pin/star/disappearing messages sync, random delays for concurrent sends, group/session isolation, credential persistence, and real-time alerts for bans/failures. |
| **Outcome** | Achieve high uptime (\>99%), simulate natural user behavior to minimize spam flags, deliver seamless experiences under failures, and build an extensible architecture for evolving WhatsApp APIs. |
| **Target Personas** | \- **Admin/Supervisor**: Manages accounts, monitors sessions, needs alerts and analytics for uptime. \- **Agent**: Handles chats, requires stable sessions without rescans. \- **Developer**: Integrates via APIs, needs extensible libraries and logs. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | WhatsApp Web sessions are unstable, often timing out or logging out due to network issues or policy changes. | Leads to manual rescans, downtime, and lost productivity for agents. |
| 2 | Reliance on a single library (e.g., Baileys) leaves no fallback if it breaks due to WhatsApp updates. | Causes full channel outages, affecting broadcast and chat reliability. |
| 3 | Banned or failed numbers block operations without automatic failover to backups. | Disrupts business continuity, especially for high-volume broadcasts. |
| 4 | Broadcasts from one account risk bans without rotation across numbers. | Increases spam detection, limiting scalability for large campaigns. |
| 5 | Lack of natural simulation (e.g., presence, read receipts, random delays) makes sends appear bot-like. | Heightens ban risks and reduces message delivery rates. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Ensure resilient multi-device sessions | ≥95% session recoveries without manual rescan (measured via logs). | Q4 2025 |
| Guarantee uptime with multi-library fallback | ≥99% WhatsApp channel uptime, even if primary library fails (SLO via monitoring). | Q4 2025 |
| Minimize downtime with backup numbers | ≥90% operational continuity via auto-switch to backups (tracked in audit logs). | Q4 2025 |
| Ensure natural & human-like message flow | 100% concurrent sends include 2–7s random delay; \<5% ban rate from simulations. | Q1 2026 |
| Improve visibility & alerting | 100% failures/bans notified to internal Google Chat and client dashboard within 60s. | Q4 2025 |

---

## **4 | User Stories & Acceptance Criteria**

User stories are prioritized:   
P0 (Must-have for MVP),  
P1 (High priority enhancements),   
P2 (Future iterations).

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As an Admin, I want multi-device connections per number so that sessions remain active even if one device logs out. | \- Each number supports at least 2 slots (Device 1, Device 2). \- Auto-switch to backup slot on logout. \- QR/Pairing Code auto-refreshes every 30s while active. \- Slot states displayed: ✅ Aktif, ❌ Disconnected, “Tidak di set”. |
| US-2 | P0 | As a Developer, I want multi-library connectors so that the system fails over if the primary library breaks. | \- Libraries: Baileys (primary), WhatsAppWebJS (backup). \- Auto-switch on failure detection. \- Pre-check WhatsApp ID existence during account addition. \- Extensible config for adding L3+ libraries. |
| US-3 | P0 | As an Agent, I want auto-switch for sessions and numbers so that chats continue seamlessly on failures. | \- Auto-switch to other slot on timeout/disconnect. \- Switch to backup number if all slots fail or banned. \- Backup numbers exclude auto-move enabled ones. \- Session switch events logged in Team Inbox. |
| US-4 | P1 | As an Admin, I want broadcast rotation so that sends distribute across numbers to avoid bans. | \- Configurable by message count (e.g., switch every 100\) or time (daily/weekly). \- Rotator selects from eligible pool. \- Integrates with Broadcast PRD for tiering/rate limits. |
| US-5 | P1 | As an Agent, I want presence and message sync so that interactions feel natural. | \- Update typing/online presence. \- Sync read receipts, pin/unpin (last chat), star/unstar. \- Delete messages only on WA side. \- Support disappearing messages with notices. |
| US-6 | P1 | As a System, I want human-like send simulation so that concurrent sends avoid spam flags. | \- Enforce 2–7s random delay on simultaneous sends. \- Show single tick during delay. \- Use library APIs for typing indicators. |
| US-7 | P0 | As an Admin, I want alerts and monitoring so that I can respond to issues quickly. | \- Ban/failure alerts to Google Chat and dashboard. \- Status changes broadcast to Google Chat first, then UI. |
| US-8 | P0 | As a Developer, I want session and group isolation so that environments don't conflict. | \- Isolate Dev/Staging vs Production. \- Use scoped IDs: {company\_id}:{number}:{group\_id}. \- User selects session for duplicate groups across numbers/companies. |
| US-9 | P1 | As an Admin, I want credential persistence so that valid sessions don't require rescans. | \- Sync full history ON by default. \- Cache group metadata. \- Auto-save credentials on creds.update. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Multi-Device Connections** | \- System maintains multiple slots per number. \- On logout event (via library callback), trigger auto-switch to next active slot. \- QR/Pairing refresh via timed API calls (30s interval). |
| **Multi-Library Connectors** | \- Config file defines primary/backup libraries. \- Failure detection: Monitor heartbeat; switch on error codes (e.g., 401 unauthorized). \- Pre-check: API call to WhatsApp verify ID before saving account. |
| **Auto Switch Sessions**  | \- Event-driven: On disconnect, query other slots; if none, query backups. \- Backup eligibility: Filter numbers where auto-move \= false. \- Log format: Timestamp, event type, from/to (slot/number), stored in Team Inbox DB. |
| **Auto Switch Numbers** | \- Event-driven: On disconnect, query other slots; if none, query backups. \- Backup eligibility: Filter numbers where auto-move \= false. \- Log format: Timestamp, event type, from/to (slot/number), stored in Team Inbox DB. |
| **Broadcast Rotator** | \- Rotation logic: Counter-based (increment per send) or time-based (cron job). \- Pool selection: Query active numbers, prioritize by load. \- Integration: Hook into Broadcast API for quota checks. |
| **Presence & Message Sync** | \- Presence: Update on user activity via WebSocket. \- Sync: Use library events for read/pin/star/delete/disappearing. \- Disappearing: Add system notice bubble if message expires. |
| **Human-Like Send Simulation** | \- Queue concurrent sends; apply random delay (Math.random() \* 5 \+ 2 seconds). \- UI: Show pending tick; update to delivered post-delay. |
| **Alerts & Monitoring** | \- Detection: Library error hooks trigger alerts. \- Notification: Webhook to Google Chat; in-app toast for clients. \- Priority: Google Chat first (async), then UI sync. |
| **Session & Group Isolation** | \- DB scoping: Prefix IDs with environment (dev/prod). \- Conflict resolution: UI dropdown for user selection on duplicate groups. |
| **Credential Persistence** | \- Storage: Secure DB (encrypted); auto-persist on library creds.upd ate event. \- History sync: Enable full fetch on login if credentials valid. |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- Session switch \<5s. \- Alert delivery \<60s. \- Handle 1,000 concurrent sends with delays. |
| **Scalability** | \- Support 100+ numbers per tenant. \- Horizontal scaling for workers handling switches. |
| **Reliability** | \- 99.9% uptime SLO. \- At-least-once delivery for alerts; idempotent switches. |
| **Security** | \- Encrypt credentials (AES-256). \- RBAC: Admins only for configs; audit all switches. \- Comply with Indonesian UU ITE for data protection. |
| **Observability** | \- Metrics: Uptime, switch counts, ban rates (via Prometheus). \- Logs: Structured JSON in Team Inbox. |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Account List Dashboard** | Table view: Columns for Number, Slots (states with icons), Library, Status. Search/filter by active/inactive. | Admin navigates to Channels \> WhatsApp Web \> List. Click row to edit; real-time updates via sockets for state changes. |
| **Add/Edit Account Modal** | Form: Name, Number, Slots (dropdown for QR/Pairing), Backup config, Rotator settings. Visual preview of states. | Step 1: Input details. Step 2: Scan QR (auto-refresh). Success: Toast "Terhubung"; auto-next slot. |
| **Alerts Notification** | In-app banner/toast for failures; Google Chat card with details (number, reason, timestamp). | On event: Immediate pop-up; clickable to view logs in Team Inbox. |
| **conversation room Integration** | Presence indicators (typing dots, online badge); delay spinner with single tick. | Agent types message; on concurrent, show "Menunggu..." with timer. |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Session Timeout | Auto-switch to backup; log event. | "Sesi timeout. Beralih ke perangkat cadangan." |
| Library Failure | Switch to backup library; alert Google Chat. | "Koneksi gagal. Beralih ke library cadangan." |
| Number Banned | Switch to backup number; notify client. | "Nomor diblokir. Menggunakan nomor cadangan." |
| Duplicate Group | Prompt user selection via dropdown. | "Grup duplikat terdeteksi. Pilih sesi yang diinginkan." |
| Credential Invalid | Trigger rescan QR; prevent sends. | "Kredensial tidak valid. Silakan scan ulang QR." |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Omnichannel Inbox for session logs. \- Broadcast System for rotator integration. \- Open API for developer extensibility. |
| **External** | \- WhatsApp Libraries (Baileys, WhatsAppWebJS) – Risk: Updates breaking compatibility (mitigate with weekly tests). |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| WhatsApp Policy Changes | Medium | High | Monitor updates; have hybrid Cloud API as future fallback. |
| Ban Rate Increase | Low | High | Enforce simulations; A/B test delays. |
| Scalability Bottlenecks | Medium | Medium | Load test with 1k sessions; optimize DB queries. |

---

## **10 | Success Metrics**

Expand on OKRs with tracking methods.

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| Session Recovery Rate | ≥95% | Log analysis (e.g., via ELK Stack). |
| Channel Uptime | ≥99% | Monitoring (Prometheus/Grafana). |
| Ban/Failure Alerts Delivered | 100% | Audit logs and Google Chat webhooks. |
| User Satisfaction (CSAT) | ≥4/5 | Post-launch survey for admins/agents. |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| Load balancing chat distribution across device slots. | P2 |
| Hybrid support with WhatsApp Cloud API. | P1 |
| Supervisor dashboard for session & number usage analytics. | P2 |
| Extended audit trail export (currently view-only). | P1 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Pairing Code limited to one slot at a time. | Use QR for parallel slots. | P2 |
| Supervisor cannot export logs directly. | View-only in Team Inbox; export via API. | P1 |
| Broadcast anti-spam logic (warm-up, tier caps) not included. | Covered in separate Broadcast PRD. | N/A |

