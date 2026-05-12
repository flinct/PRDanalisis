# **Product Requirement Document (PRD)**

**Feature:** Broadcast System \- Anti-Spam

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
| v1.0 | 31 Aug 2025 | Yusril Ibnu | Initial extraction from main Broadcast PRD focusing on anti-spam elements like quotas, delays, and simulations. |
| v2.0 | 03 Sep 2025 | Yusril Ibnu | Aligned to standard template. Added Impact to Problem Statement, Timeline to OKRs, numbered User Stories, Functional Requirements, Non-Functional Requirements, UI/UX Requirements table (minimal for backend focus), Dependencies & Risks, enhanced Success Metrics with tools. Rechecked priorities based on business impact (P0: Quota enforcement and delays; P1: Variation and rotators). Improved error handling with negative scenarios, added workarounds for limitations. Ensured consistency with Core Broadcast and Omnichannel Inbox (e.g., quotas tied to Team Inbox numbers). |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Implement anti-spam mechanisms in the Broadcast System to minimize ban risks, simulate natural human behavior, enforce tiered limits, and ensure compliant sending patterns for WhatsApp Web. |
| **Key Capabilities** | Tiered daily quotas by account age, randomized limits, human-like delays (per-message/batch/concurrent), spintax for variation, rotator for number switching, quota checks with backups, alerts on violations. |
| **Outcome** | Reduced account bans (\<10%), compliant broadcasts simulating organic usage, and proactive monitoring to maintain system integrity and user trust. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Unenforced sending limits lead to over-sending and bans. | Results in account suspensions, disrupting operations and incurring recovery costs. |
| 2 | Robotic sending patterns (no delays/variation) trigger anti-spam detections. | Increases ban rates, eroding platform reliability and user confidence. |
| 3 | Static number usage without rotation exhausts quotas quickly. | Causes campaign failures mid-run, leading to incomplete deliveries and manual interventions. |
| 4 | Lack of alerts on quota/violations. | Delays responses to issues, amplifying risks and compliance failures. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Enforce tiered quotas to prevent over-sending | 100% broadcasts respect randomized daily limits; \<10% bans from quotas. | Q4 2025 |
| Simulate human behavior to evade detections | All sends include delays/variations; ≥95% campaigns undetected as spam. | Q4 2025 |
| Implement rotation and backups for continuity | ≥95% quota exhausts handled via rotators/backups without halts. | Q4 2025 |
| Provide alerts for proactive monitoring | 100% violations trigger alerts to dashboard/Google Chat. | Q4 2025 |

---

## **4 | User Stories & Acceptance Criteria**

| \# | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-1 | P0 | As an Admin, I want tiered quotas based on account age to limit sends. | \- Tiers 1-6 assigned by age; randomized daily caps. \- Block on exceed with 403 error. \- Response includes tier/quota details. \- Negative: Age unknown defaults to Tier 1 (safest). |
| US-2 | P0 | As an Admin, I want human-like delays to mimic natural patterns. | \- Per-message: Typing (5-6 char/s) \+ random 3-8s. \- Batch: Pause after 50 (180-240s). \- Concurrent: Random 2-7s. \- Negative: Calc error uses fixed min delays. |
| US-3 | P1 | As an Admin, I want spintax for message variation to avoid repetition. | \- Parse {opt1|Opt2} |
| US-4 | Pcl1 | As an Admin, I want number rotators to distribute load. | \- Switch after N messages/X time (configurable). \- Eligible backups only (no Auto Move). \- Negative: No rotators available blocks or alerts. |
| US-5 | P0 | As an Admin, I want quota checks with backups on exhaust. | \- If main exceeds, try backups. \- Enforce per number/day. \- Negative: All exhausted rejects campaign. |
| US-6 | P0 | As a Supervisor, I want alerts on quota/ban violations. | \- Notify dashboard \+ Google Chat on exceed/ban. \- Include details (number, reason). \- Negative: Alert fail retries up to 3x. |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Quota Enforcement** | \- Tier assignment by age; randomized caps. \- Check on send; block/reject if exceeded. \- Integrate with Team Inbox numbers. \- Negative: Data inconsistency defaults to safe limits. |
| **Delays & Simulation** | \- Typing/random/batch/concurrent delays. \- Shuffle recipients. \- Negative: High concurrency throttles to prevent spikes. |
| **Variation & Rotation** | \- Spintax parsing for uniqueness. \- Rotator: N messages/X time switches. \- Negative: Rotation fail falls back to main. |
| **Alerts** | \- Trigger on quota/ban; send to dashboard/Google Chat. \- Log violations. \- Negative: Delivery fail queues for retry. |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- Quota checks \<100ms. \- Delays non-blocking via queues. |
| **Scalability** | \- Handle 1,000+ numbers; per-tenant quotas. |
| **Reliability** | \- ≥99% quota accuracy; redundant checks. |
| **Security** | \- Encrypt quota data; RBAC for configs. \- Comply with WhatsApp policies. |
| **Observability** | \- Metrics: Ban rates, delay averages (Prometheus). \- Alerts: Real-time on violations. |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Quota Dashboard** | Badges for tier/limit/left per number. | Admin views → real-time updates. Hover for history. |
| **Alert Panel** | Toasts/banners for violations. | On event → show with details; dismiss logs it. |
| **Config Editor** | Sliders for rotator N/X; spintax preview. | Edit → validate; save applies to future sends. |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Quota Exceeded | Try backups; reject if all. | "Batas harian tercapai". |
| Invalid Spintax | Reject payload. | "Sintaks spintax tidak valid". |
| Rotation Fail | Fallback to main. | "Gagal rotasi, menggunakan nomor utama". |
| Alert Delivery Fail | Retry 3x; log. | "Gagal kirim alert, dicoba ulang". |
| Delay Calc Error | Use min defaults. | "Kesalahan delay, menggunakan nilai minimum". |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Core Broadcast for integration. \- Team Inbox for numbers/backups. \- WhatsApp Libraries for bans. |
| **External** | \- Google Chat for alerts. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ban from Patterns | Medium | High | Tune delays/variations; monitor bans. |
| Quota Miscalculation | Low | Medium | Redundant checks; audits. |
| Alert Overload | Medium | Low | Throttle alerts; batch notifications. |

---

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| Ban Rate | \<10% | Prometheus monitoring. |
| Quota Compliance | 100% | ELK log analysis. |
| Variation Usage | ≥70% spintax | Google Analytics. |
| Alert Response Time | \<5s | Session tracking. |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| AI pattern detection evasion. | P1 |
| Custom quota tiers per tenant. | P1 |
| Ban prediction analytics. | P2 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Randomized quotas vary daily. | Check status pre-send. | P2 |
| Delays add to ETA. | Split large campaigns. | N/A |
| Rotators limited to backups. | Configure more numbers. | P1 |

