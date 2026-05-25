# **Product Requirement Document (PRD)**

**Feature:** Omnichannel Inbox / Conversation Detail

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
| **Engineering Lead** | Naftal |
| **Design Lead**  | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v2.1 |
| **Last Updated** | September 03, 2025 |
| **TRD** |  |

---

## Revision History

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 28 Aug 2025 | Yusril Ibnu Maulana | Initial draft Conversation Detail aligned with Omnichannel Inbox. |
| v2.0 | 03 Sep 2025 | Yusril Ibnu Maulana | Standardized format, expanded user stories, acceptance criteria, success metrics, error handling, and limitations. |
| v2.1 | 09 Sep 2025 | Yusril Ibnu Maulana | Updated structure per new design: reminder button in header, clearer states (Unassigned vs Assigned), attributes split (read-only API vs editable custom fields), Live Chat dynamic properties, timeline with audit log. |

---

1. ## Overview

| Item | Description |
| ----- | ----- |
| **Feature** | Conversation Detail Panel |
| **Purpose** | Provide a structured, real-time panel in Omnichannel Inbox for agents and supervisors to view and manage conversation metadata, assignees, SLA countdowns, attributes, tags, notes, media, files, and history — reducing context switching and improving SLA compliance. |
| **Key Capabilities** | \- Display conversation number, Team Inbox (single), multi-assignee list, channel & contact info, timestamps, SLA countdown, and **Add Reminder** button. \- Attributes section: read-only properties from Open API (channel defaults \+ custom). \- Custom Fields (editable, P2 roadmap). \- Tags system with 2-way sync (WhatsApp). \- Timeline history with integrated Audit Logs (Supervisor+ only). \- Internal notes, media & files panel. |
| **Outcome** | Agents and supervisors gain complete context in one place, reducing resolution time ≥20%, increasing SLA adherence, and improving collaboration via reminders, notes, and audit tracking. |

---

2. ## Problem Statement

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Agents lack a consolidated detail panel for conversation metadata, SLA, and reminders. | Causes SLA breaches due to missing context and slower handling. |
| 2 | Attributes are inconsistent across channels (e.g., Live Chat vs WhatsApp) and custom properties are not visible. | Agents provide incomplete responses, reducing service quality. |
| 3 | No clear differentiation between **Unassigned** and **Assigned** state. | Leads to confusion in ownership, delayed response, and unclear SLA countdown. |
| 4 | Reminders cannot be created directly in conversation detail. | Important follow-ups missed, reducing accountability and productivity. |
| 5 | Limited visibility into audit logs (restricted to global views). | Compliance audits harder; supervisors lack real-time visibility into lifecycle actions. |
| 6 | No structured way to extend editable custom fields. | Business teams cannot enrich context flexibly, causing reliance on external tools. |

---

3. ## Objectives & Key Results

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Unify conversation metadata & SLA visibility | 100% conversations show Team Inbox, assignees, channel/contact, timestamps, SLA countdown. | Q4 2025 |
| Enable reminders directly in Conversation Detail | ≥80% of follow-up reminders created from conversation header. | Q4 2025 |
| Standardize attributes across channels | All Live Chat conversations show default fields (Name, Phone, Email, Location, OS, Browser) \+ dynamic properties. | Q4 2025 |
| Improve tag synchronization | ≥95% tags sync within ≤5s across WhatsApp Web/Business. | Q4 2025 |
| Enhance accountability & compliance | ≥90% of lifecycle events recorded in Timeline \+ Audit Logs. | Q4 2025 |
| Support performance & scalability | Panel loads ≤1s with up to 200 attributes; ≥99% SLA countdown accuracy. | Q4 2025 |

---

4. ## Success Metrics

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| **Metadata Accuracy** | 100% conversations show correct Team Inbox, assignees, channel info. | Log analysis (ELK Stack) |
| **Reminder Adoption** | ≥80% reminders set directly from conversation detail. | Google Analytics event tracking |
| **Tag Sync Latency** | ≤5s (avg.) | Prometheus metrics |
| **Audit Coverage** | ≥90% lifecycle actions captured in logs | Audit log system |
| **Load Performance** | Panel load ≤1s with 200 attributes | Session tracking (GA/Prometheus) |
| **User Satisfaction (CSAT)** | ≥4/5 | Post-feature survey |

5. ## User Stories & Acceptance Criteria

### 5.1 User Stories

| ID | As a | I want | So that |
| ----- | ----- | ----- | ----- |
| **US-01** | Supervisor / Admin | To assign a team inbox and one or more assignees to a conversation | The right agents can handle the conversation efficiently. |
| **US-02** | Supervisor / Admin | To view SLA information (*First Response Due*, *Time to Close Due*) | I can monitor whether conversations are within the SLA. |
| **US-03** | Supervisor / Admin | To set reminders for ongoing conversations | Agents get notified to follow up on conversations on time. |
| **US-04** | Agent | To see conversation attributes (ID, channel, channel name/number for WhatsApp Web) | I can identify the conversation context quickly. |
| **US-05** | Agent / Supervisor | To see the client’s data (name, masked phone, email, location, OS, browser) | I can provide personalized and accurate support. |
| **US-06** | Agent / Supervisor | To manage tags for conversations | I can categorize and filter conversations easily. |
| **US-07** | Agent / Supervisor | To track conversation events | I can understand the conversation flow and any updates. |
|  | Agent / Supervisor | To view **all past conversations** with the client | I can understand the full context of the conversation and previous interactions. |
| **US-08** | Agent / Supervisor | To add, edit, and view internal conversation notes | I can document important information for team reference. |
| **US-09** | Agent | To pin important messages within a conversation | Key messages are easy to access and follow up on. |
| **US-10** | Agent / Client | To view and access media (images, audio, video) and file attachments | I can fully understand context and have all necessary documents. |
| **US-11** | Supervisor / Admin | To view related conversations | I can track all related conversations for a better overview. |
| **US-12** | Supervisor / Admin | To view broadcast history of conversations | I can monitor any mass communication for auditing and follow-up. |
| **US-13** | Supervisor / Admin | To add custom attributes from external APIs | I can enrich conversations with business-specific data. |

### 5.1 Acceptance Criteria

| ID | Feature / Function | Acceptance Criteria |
| ----- | ----- | ----- |
| **AC-01** | Assignee & Assignment | When a team inbox and assignees are selected, the conversation must update immediately and display all assigned agents. \- Team Inbox: always single, mandatory. \- Assignees: multi-select, chips with avatar \+ name. \- **Unassigned state**: show label `Unassigned` \+ button **“Assign dNow” (Tetapkan Agent)**. \- **Assigned state**: show assigned agents; allow add/remove. |
| **AC-02** | SLA Information | First Response Due and Time to Close Due must be displayed based on SLA settings; any changes in SLA should update the timestamps. \- First Response Due: countdown timer appears only when **Unassigned**. \- Time to Close Due: countdown until SLA resolution. \- Negative: expired SLA shows red badge **“SLA terlewati”**. |
| **AC-03** | Reminder | Reminders will appear **only if the feature is activated** and **only for the user who activated it**. |
| **AC-04** | Conversation Attributes | \- Conversation ID \- Channel Source (WhatsApp Web, Live Chat) \- If it's from WhatsApp Web, the WhatsApp number and name will be displayed. \- Dynamic Attributes (ex. SAP AWB)  must be visible and accurate. If it is another channel such as LiveChat, then the Channel Name and Channel Number will not appear. |
| **AC-05** | Client Data | Client information should be displayed with proper masking where required; missing optional data should not break the UI. \- Client Name \- Client Phone Number (default Masked for Agent) \- Client Email \- Client Location (if allowed) \- Client OS (if any) \- Client Browser (if any) |
| **AC-06** | Tags | Users must be able to add, edit, and remove tags; changes should persist immediately. |
| **AC-07** | Conversation Events | All events (assignment, SLA changes, status updates, etc.) must be logged and visible in chronological order. |
| **AC-08** | Conversation History | The system must display **all past conversations** between the agent and the client in chronological order, including messages from previous sessions. |
| **AC-09** | Conversation Notes | Agents must be able to add/edit internal notes, and notes should be visible to users with proper permission. |
| **AC-10** | Pinned Messages | Pinned messages must appear in a dedicated section and clicking them should jump to the original message in the conversation. |
| **AC-11** | Media | Images, videos, and audio must be viewable inline with the option to download; unsupported formats should show a proper error message. |
| **AC-12** | Files | Files must be downloadable and viewable; uploading must validate file type and size. |
| **AC-13** | Related Conversations | Related conversations must be linked and navigable from the current conversation. |
| **AC-14** | Broadcast History | All broadcasts must be logged and accessible for auditing; timestamps and recipient information should be accurate. |
| **AC-15** | Custom Attributes | Custom attributes pulled from external APIs must appear correctly and update dynamically when the source data changes. |

6. ## Field-Level Details & Validation

Design Link : [https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5106-15066\&t=zsTnU3AYdbaq0zGo-11](https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5106-15066&t=zsTnU3AYdbaq0zGo-11) 

| Section | Field Name | Type | Example Value | Validation | Req/Opt |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **Assignee** | Team Inbox ✅ | Dropdown / Text | “Support Team A” | Harus sesuai daftar team inbox aktif | Required |
|  | Assignee(s) ✅ | Multi-Select | \[“Agent A”, “Agent B”\] | User harus valid & aktif | Required |
|  | First Response Due ✅ | DateTime / Badge | `2025-09-08T14:30:00Z` | Auto-generate dari SLA config | Optional |
|  | Time to Close Due ✅ | DateTime / Badge | `2025-09-08T20:00:00Z` | Auto-generate dari SLA config | Optional |
|  | Reminder (if On) ✅ | Toggle / Boolean | `true` | Default \= false | Optional |
| **Conversation Attributes** | Conversation ID ✅ | Text / ID | `CONV-20250908-001` | Unique, auto-generated | Required |
|  | Channel ✅ | Enum / Icon | WhatsApp, Live Chat, Email | Harus salah satu channel yang tersedia | Required |
|  | Channel Name (WA Web Only) ✅ | Text | “WhatsApp Web” | Hanya muncul untuk channel WhatsApp Web | Optional |
|  | Channel Number (WA Web Only) ✅ | Phone Number | `+6281234567890` | Format E.164 | Optional |
|  | Started At ✅ | DateTime | `10 Sep 2025 09:15 WIB` | ISO format | Required |
|  | Custom Attributes (Dynamic) ✅ | Key-Value Pair | `Example {“OrderID”: “12345”}` | Valid sesuai definisi Open API | Optional |
|  | Custom Attributes (Customize) P2 ✅ | Key-Value Pair | `Example {“Priority”: “High”}` | Ditentukan oleh user / admin | Optional |
| **Client Data** | Client Name ✅ | Text | “John Doe” | Min 2 chars, max 100 chars | Required |
|  | Client Phone Number (Masked) ✅ | Phone | `+62812••••7890` | Format E.164, masking tengah | Optional |
|  | Client Email ✅ | Email | `john.doe@email.com` | Format valid email | Optional |
|  | Client Location (if allowed) ✅ | Text / Geo | “Jakarta, Indonesia” | Opsional, tergantung izin | Optional |
|  | Client OS (if any) ✅ | Text | “Android 14” | Tidak wajib, auto-detect jika ada | Optional |
|  | Client Browser (if any) ✅ | Text | “Chrome 128” | Tidak wajib, auto-detect jika ada | Optional |
| **Tags** | Tags ✅ | Multi-Select | \[“VIP”, “Returning Customer”\] | Harus dari daftar tag aktif | Optional |
| **Conversation Notes** | Notes ✅ | Text Area | “Customer requested refund” | Max 1000 chars | Optional |
| **Conversation History** | Message Timeline ✅ | Conversation List | Client Name, Last Messages, and Conversation Status | Auto-generated | Required |
| **Pinned Messages** | Pinned List ✅ | List | “Agent B: Please follow up on this” | Auto-generated | Optional |
| **Media** | Media Files ✅ | Gallery / List | `image001.png`, `video001.mp4` | Valid file format (png, jpg, mp4, etc.) | Optional |
| **Files** | File Attachments ✅ | List / Table | `invoice.pdf`, `contract.docx` | Valid file format (pdf, docx, xlsx, etc.) | Optional |
| **Conversation Events** | Event List ✅ | Timeline | “Agent A assigned ticket (09:20)” | Auto-generated | Required |
| **Related Conversations** | Related IDs  | List / Link | \[“CONV-20250907-004”\] | ID harus valid & ada di sistem | Optional |
| **Broadcast History** | Broadcast List  | Timeline / Log | “Promo sent to \+62812345 on 07 Sep” | Auto-generated dari sistem broadcast | Optional |

---

7. ## Functional Requirements

| ID | Requirement Category | Functional Requirement | Notes |
| ----- | ----- | ----- | ----- |
| **FR-01** | **Assignee & Assignment** | The system **must allow admin or supervisor to assign a team inbox and assignees to a conversation.** | Assigning the team inbox and assignees manually or automatically. |
| **FR-02** | **Assignee & Assignment** | The system **must allow multiple assignees to be assigned to a single conversation.** | Multiple assignees should be selectable. |
| **FR-03** | **Assignee & Assignment** | The system **must display *First Response Due* and *Time to Close Due* information.** | Dates and times generated based on the SLA configuration. |
| **FR-04** | **Assignee & Assignment** | The system **must provide reminders if the *Reminder* feature is activated.** | Reminders should appear based on SLA configuration. |
| **FR-05** | **Conversation Attributes** | The **system must display a unique conversation ID.** | It must be auto-generated for each conversation. |
| **FR-06** | **Conversation Attributes** | The system **must display the channel from which the conversation originated, along with channel name and number for WhatsApp Web.** | It must include all available channels (WhatsApp, Live Chat, etc.). |
| **FR-07** | **Conversation Attributes** | The **system must store the start time of the conversation and allow adjustments based on the channel.** | It must auto-generate and adjust based on the channel used. |
| **FR-08** | **Client Data** | The s**ystem must collect and display client data such as name, phone number (masked), and email.** | Data displayed must be valid, and phone numbers should be masked when necessary. |
| **FR-09** | **Client Data** | The system **must display client location information if permitted by the client.** | Must comply with user consent and privacy policies. Auto-detect if Available |
| **FR-10** | **Client Data** | The system **must display information related to the client's operating system and browser.** | **Auto-detect if available, not mandatory.** |
| **FR-11** | **Tags** | The system **must allow adding, editing, and removing tags** for conversations. | Tags can be multiple and should allow dynamic editing. |
| **FR-12** | **Conversation Events** | The system **must log and display all changes** occurring in the conversation. | Every status change, assignee update, or event should be logged. |
| **FR-13** | **Conversation History** | The system must store and display **all past conversations** between the agent and the client in chronological order. | Should include all messages exchanged historically, not only the current session |
| **FR-14** | **Conversation Notes** | The system **must allow Agents to add, edit, and pin internal notes in the conversation. Supervisor and Admin able to mention other Agents from notes.** | Internal notes for team reference, with appropriate authorization. |
| **FR-15** | **Pinned Messages** | The system must **allow pinning** important messages for easy access. | Important messages can be pinned by agents and admins. |
| **FR-16** | **Media** | The system **must allow sending, storing, and playing media (images and videos)** within the conversation. | Should support various media formats commonly used. |
| **FR-17** | **Files** | The system **must allow file upload and download such as PDFs, Word, and Excel documents**. | Supports various file formats relevant to the conversation. |
| **FR-18** | **Related Conversations** | The system must allow linking related or connected conversations within one conversation. | Should support linking related conversations with relevant IDs. |
| **FR-19** | **Broadcast History** | The system must store and display broadcast history performed within the conversation. | Can be used to track broader communication actions. |
| **FR-20** | **Custom Attributes** | The system must allow adding custom attributes within conversations retrieved from external APIs. | Required for fulfilling specific business needs. |

---

8. ## Error Handling (Extended)

| Error Type | Scenario | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| **Missing Data** | Channel contact, attributes, or timestamps not returned | Fallback placeholder, auto-retry | “Data tidak tersedia. Silakan refresh.” |
| **Invalid Format** | Wrong date/time, field type mismatch | Prevent submit, highlight error field | “Format tidak valid.” |
| **Exceed Limit** | Tags \>20, pinned \>10, file \>25MB | Block action, show toast | “Batas tercapai (misalnya: 20 tag).” |
| **Permission Denied** | Agent tries to edit custom fields, sticky notes, or audit logs | Hide/disable element | “Akses ditolak.” |
| **Sync Failure** | WhatsApp tag sync error | Queue retry, log internally | “Gagal sinkronisasi tag. Coba lagi.” |
| **Reminder Invalid** | Invalid date/time for reminder | Reject save, show toast | “Tanggal tidak valid.” |
| **Attachment Upload Failed** | Network or size error on media/files/notes | Retry option | “Gagal unggah file. Coba lagi.” |
| **Server Error** | API or DB failure when loading details | Retry with exponential backoff; fallback cache | “Gagal memuat detail percakapan. Silakan coba lagi.” |
| **Conflict (Edit Lock)** | Another user edited same field simultaneously | Prompt refresh; suggest reload | “Data diubah oleh pengguna lain. Silakan refresh.” |
| **Duplicate Linking** | Linking conversation already linked | Block action | “Percakapan sudah terhubung.” |
| **No History** | Room history not available | Show placeholder | “Tidak ada riwayat.” |
| **Sticky Note Limit** | Supervisor tries to add more than one sticky note | Block action | “Hanya 1 catatan sticky diizinkan.” |

## ---

9. ## Dependencies & Risks

### Dependencies

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Omnichannel Inbox framework (chat list, room, ticketing). \- SLA configuration module (FRT, Time to Close). \- Tag collection & sync service (Baileys / WAB). \- Audit log service & storage. \- Reminder scheduler & notification system. |
| **External** | \- Open API providers for Attributes (e.g., CRM, Live Chat form data). \- WhatsApp Business API / Baileys library for tag synchronization. \- External calendar/timezone services (optional, for reminder accuracy). |

### Risks

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| SLA countdown desync (client vs server time). | Medium | High | Enforce server time as source of truth, auto-correct client clock skew. |
| Attribute overload from API (too many fields \>200). | Medium | Medium | Implement lazy loading, collapsible sections, and pagination for properties. |
| Tag sync latency \>5s. | Medium | High | Async retry queue, warning badge, Prometheus monitoring. |
| Data privacy breach (PII exposed). | Low | High | Role-based masking, encryption, log redaction. |
| Reminder notifications missed. | Low | Medium | Retry scheduler, fallback to push \+ email. |
| Audit logs incomplete (socket loss). | Low | High | Backup to DB transaction logs, retry sync. |

---

10. ## Future Considerations

| Consideration | Priority |
| ----- | ----- |
| Editable **Custom Fields** (agents can add fields dynamically from UI). | P2 |
| SLA **visual countdown progress bar**. | P2 |
| AI-driven insights (sentiment detection, churn risk). | P1 |
| Export conversation detail (PDF/CSV). | P1 |
| Cross-channel linking (same customer across WhatsApp \+ Email \+ Live Chat). | P2 |
| Advanced reminder options (team-wide reminders, escalation alerts). | P2 |
| Real-time collaborative editing for attributes. | P1 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| **Custom Fields** not yet editable (P2 only). | Business teams must request Admin to add via config. | P2 |
| **Max 20 tags per conversation**. | Encourage use of attributes for extra categorization. | P2 |
| **Audit Logs** view restricted to Supervisor+. | Agents can request via Supervisor if needed. | N/A |
| **Degradation when \>200 attributes**. | Lazy load \+ split tabs; advise on limits. | P2 |
| **Room history** not available for group chats. | Manual search by group name. | P1 |

