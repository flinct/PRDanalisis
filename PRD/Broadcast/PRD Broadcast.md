# **Product Requirement Document (PRD)**

**Feature:** Broadcast System 

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v2.0 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## **Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 31 Aug 2025 | Yusril Ibnu | Initial draft with overview, problems, OKRs, high-level features, user stories, status model, system behavior, logging, and testing notes. |
| v2.0 | 03 Sep 2025 | Yusril Ibnu | Split into core documents (excluding API and dedicated anti-spam sections). Aligned to standard template. Added Impact to Problem Statement, Timeline to OKRs, numbered User Stories, Functional Requirements, Non-Functional Requirements, UI/UX Requirements table (minimal for backend focus), Dependencies & Risks, enhanced Success Metrics with tools. Rechecked priorities based on business impact (P0: Resilience and delivery; P1: Customization and monitoring; P2: Advanced optimizations). Improved error handling with negative scenarios, added workarounds for limitations. Ensured consistency with Omnichannel Inbox (e.g., room handling, properties). Integrated status model into Functional Requirements. |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Build a resilient broadcast core for WhatsApp Web, focusing on human-like simulation, quota enforcement, failover mechanisms, and integration with Inbox for seamless message routing and history management. |
| **Key Capabilities** | Inbox routing (ALL/REPLY\_ONLY), room history append, multi-device/library/backup failover, rotator for numbers, tiered quotas, delays/simulations, spintax/multi-message variation, template support, properties enrichment, logging/alerts, status lifecycle. |
| **Outcome** | Secure, efficient broadcasts with minimal ban risk, high completion rates (≥95%), natural behavior simulation, and full traceability in Inbox, enabling scalable campaigns without disruptions. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Broadcasts flood Inbox or conflict with rooms without proper routing. | Overloads agents, causes duplicate rooms, and disrupts workflows, increasing resolution time by ≥20%. |
| 2 | Lack of visibility into quotas, ETA, and statuses. | Leads to unexpected failures, poor planning, and compliance issues with anti-spam policies. |
| 3 | Single points of failure in devices/libraries/numbers halt campaigns. | Results in incomplete deliveries, lost messages, and user frustration during high-volume sends. |
| 4 | Static messages without variation appear robotic. | Increases ban risks from WhatsApp, reducing system reliability and account longevity. |
| 5 | No reusable templates or property enrichment for context. | Hinders personalization, complicating Inbox auto-rules and agent handling of replies. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Implement resilient delivery mechanisms | ≥95% broadcasts complete despite failures in one slot/library/number. | Q4 2025 |
| Enforce anti-spam and human simulation | \<10% bans from over-limits or unnatural patterns. | Q4 2025 |
| Integrate seamlessly with Inbox | 100% broadcasts append to existing rooms without duplicates. | Q4 2025 |
| Provide transparency via statuses and logs | 100% campaigns track ETA, quotas, and per-recipient statuses. | Q4 2025 |
| Enable message customization | ≥70% broadcasts use templates/spintax for variation. | Q4 2025 |

---

## **4 | User Stories & Acceptance Criteria**

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As an Admin, I want inbox routing options so that broadcasts integrate smoothly. | \- "inboxMode": "ALL" shows all messages in Inbox; "REPLY\_ONLY" hides broadcasts, shows replies only. \- Default: ALL. \- Negative: Invalid mode rejects with error. |
| US-2 | P0 | As an Admin, I want broadcasts to respect room history to avoid duplicates. | \- Append to existing room if contact active. \- No new rooms created. \- Negative: No room found creates one silently. |
| US-3 | P0 | As an Admin, I want multi-device support for continuity. | \- Auto-switch Device 1 → 2 on disconnect. \- If all fail, fallback to backup. \- Negative: All inactive halts with alert. |
| US-4 | P0 | As an Admin, I want library failover for reliability. | \- Try main → secondary → backup\_3 → backup\_4. \- Abstract labels in logs. \- Negative: Failover exhaust rejects send. |
| US-5 | P0 | As an Admin, I want backup/rotator when quotas exhaust. | \- Switch to eligible backups (no Auto Move). \- Rotator: After N messages/X days. \- Negative: No backups available blocks campaign. |
| US-6 | P0 | As an Admin, I want tiered quotas based on age to prevent bans. | \- Tiers 1-6 with randomized daily limits. \- Block on exceed with 403\. \- Negative: Age data missing defaults to Tier 1\. |
| US-7 | P0 | As an Admin, I want human-like delays to mimic natural sending. | \- Per-message: Typing (5-6 char/s) \+ random 3-8s. \- Batch: Pause after 50 (180-240s). \- Random order/concurrent delays (2-7s). \- Negative: Delay calc error uses min values. |
| US-8 | P1 | As an Admin, I want spintax for message variation. | \- Parse {opt1 |
| US-9 | P1 | As an Admin, I want template support for reusability. | \- Load by templateId; include spintax/variables. \- Exclusive with raw message if set. \- Negative: Not found returns 404\. |
| US-10 | P1 | As an Admin, I want custom properties for context. | \- Enrich messages (string/number/bool/object). \- Display in Inbox; trigger auto-moves. \- Negative: Invalid JSON rejects. |
| US-11 | P1 | As an Agent, I want reply context from broadcasts. | \- Attach original properties to replies. \- Link to broadcastId. \- Negative: Property mismatch logs warning. |
| US-12 | P0 | As an Admin, I want lifecycle statuses for tracking. | \- Recipient: queued/pending/sent/failed/invalid\_contact/cancelled (forward-only). \- Campaign: in\_progress/completed/cancelled/failed. \- Negative: Backward transition impossible. |
| US-13 | P0 | As an Admin, I want progress/ETA monitoring. | \- Compute ETA from delays/batches. \- Progress % and quotas tracked. \- Negative: ETA drift \>10% triggers recalibration. |
| US-14 | P0 | As an Admin, I want detailed logging for audits. | \- Per-campaign/recipient: spintax, delays, connection, ETA. \- Retention: 90 days. \- Negative: Log fail uses fallback storage. |
| US-15 | P0 | As a Supervisor, I want alerts on failures. | \- On ban/quota: Notify dashboard \+ Google Chat. \- Include details (broadcastId, reason). \- Negative: Alert delivery fail retries. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Routing & Room Handling** | \- ALL: Route all to Inbox; REPLY\_ONLY: Replies only. \- Always append to existing room. \- Negative: Room conflict merges. |
| **Resilience & Failover** | \- Multi-device (slots 1-2); libraries (main/secondary/backup\_3/4). \- Auto-switch on disconnect/fail/ban. \- Rotator: Configurable N messages/X time. \- Negative: Exhaust all → fail campaign. |
| **Quota & Anti-Spam** | \- Tiers by age; randomized daily caps. \- Enforce on send; reject if exceeded. \- Negative: Quota data corrupt defaults safe min. |
| **Simulation & Variation** | \- Delays: Per-message/batch/concurrent. \- Spintax parsing; multi-body random pick. \- Shuffle recipients. \- Negative: High volume shuffles in batches. |
| **Templates & Properties** | \- Load templates with variables/spintax. \- Merge properties; enrich messages. \- Negative: Template mismatch rejects. |
| **Lifecycle & Monitoring** | \- Status transitions: queued → pending → sent/failed/etc. \- ETA from remaining delays. \- Logging: Detailed per-event. \- Alerts: On critical failures. \- Negative: Status stuck triggers timeout. |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- Send handoff ≤1.5s. \- Status query ≤600ms. \- Handle 10,000+ recipients. |
| **Scalability** | \- Horizontal workers; tenant queues. \- Support 1,000+ campaigns/day. |
| **Reliability** | \- At-least-once delivery; idempotent keys. \- Durable queues. \- ≥99% uptime. |
| **Security** | \- Tenant isolation; RBAC for access. \- Audit all events. \- Comply with anti-spam laws. |
| **Observability** | \- Metrics: Sends/min, failures, fallbacks (Prometheus). \- Alerts: Google Chat for bans. |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Broadcast Dashboard** | List campaigns with status, progress bar, ETA, quota badges. | Admin opens → real-time updates via sockets. Click campaign → details (logs, recipients). |
| **Template Editor** | Form for templateId, body with spintax preview. | Create/edit → validate syntax; save with variables. |
| **Alert Notifications** | Toasts for failures; dashboard banners for quotas. | On event → show toast; click for logs. |
| **Status Viewer** | Table of recipients with filters (status, connection). | Query → paginate results; export CSV. |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Quota Exceeded | Block send; try backups. | "Batas harian tercapai". |
| Failover Exhaust | Reject campaign. | "Tidak ada koneksi cadangan". |
| Invalid Spintax | Reject payload. | "Sintaks spintax tidak valid". |
| Room Conflict | Merge/append. | "Konflik ruang, digabungkan". |
| Status Stuck | Timeout/retry. | "Status tertunda, coba lagi". |
| Log Failure | Fallback storage. | "Gagal log, dicoba ulang". |
| Offline | Queue actions. | "Tidak ada koneksi, akan disinkron". |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Omnichannel Inbox for routing/rooms. \- WhatsApp Libraries (Baileys) for delivery. \- Team Inbox for numbers/quotas. |
| **External** | \- Google Chat for alerts. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ban from Over-Sending | Medium | High | Strict quotas; simulations; monitoring. |
| Failover Delays | Low | Medium | Optimize switches; test thresholds. |
| Log Overload | Medium | High | Retention policies; scalable storage. |

---

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| Completion Rate | ≥95% | ELK log analysis. |
| Ban Rate | \<10% | Prometheus alerts. |
| Template Usage | ≥70% | Google Analytics. |
| ETA Accuracy | Drift \<10% | Session tracking. |
| Failover Success | 100% switches | Audit logs. |
| User CSAT | ≥4/5 | Post-campaign survey. |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| Multi-channel support (beyond WhatsApp). | P1 |
| AI-optimized rotators/delays. | P1 |
| Advanced analytics (delivery rates). | P2 |
| Integration with CRM for properties. | P2 |
| Scheduled broadcasts. | P2 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Phase 1: WhatsApp Web only. | Use APIs for other channels. | P1 |
| Quotas randomized daily. | Monitor via status. | N/A |
| Max 50 batch without pause. | Split large campaigns. | P2 |

