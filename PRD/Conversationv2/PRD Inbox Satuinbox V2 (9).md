# **Product Requirement Document (PRD)**

**Feature:** Omnichannel Inbox / Conversation Room

| Product Manager | Yusril Ibnu Maulana |
| :---- | :---- |
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
| v1.1 | 03 Sep 2025 | Yusril Ibnu Maulana | Aligned with standard template: Added Target Personas, Impact to Problem Statement, Timeline to OKRs, numbered User Stories with priorities, Functional Requirements, Non-Functional Requirements, UI/UX Requirements, Dependencies & Risks. Converted content to tables. Clarified chat text area submit capabilities (Ctrl+V, drag & drop). Enhanced error handling, SLA, and automation features. |

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Define requirements for the **conversation room** in SatuInbox, enabling real-time, contextual, and collaborative communication for Indonesian businesses, with a focus on efficient agent-customer interactions. |
| **Key Capabilities** | Header with controls, contextual customer info, differentiated chat bubbles, inline reply-to, message status indicators, attachments (Ctrl+V, drag & drop), private notes, customer profile hover, ticket creation, thread search, automation (quick replies, welcome messages), assignment workflows, tagging, priority, logging, internal read receipts, rich cards, and robust error handling. |
| **Outcome** | Enhanced customer-agent interactions with clear identity, real-time updates, contextual insights, seamless collaboration, and flexible tools to improve productivity and SLA compliance. |
| **Target Personas** | \- **Agent**: Engages with customers, needs clear UI, quick actions, and automation. \- **Admin/Supervisor**: Monitors chats, assigns tasks, ensures SLA compliance. \- **Developer**: Integrates via APIs, requires extensible logging and error handling. |

---

## **2 | Problem Statement**

| \# | Problem Description | Impact |
| ----- | ----- | ----- |
| 1 | Agents struggle to differentiate conversations without consistent identity and header details. | Increases response time and errors, reducing customer satisfaction. |
| 2 | Lack of contextual customer information reduces effectiveness in handling chats. | Forces agents to seek external data, slowing workflows and increasing errors. |
| 3 | Limited collaboration tools (private notes, tagging) reduce efficiency in multi-agent handling. | Causes redundant work or miscommunication, impacting service quality. |
| 4 | No consistent retry/recovery for message delivery and session errors. | Leads to message loss or session disruptions, affecting reliability. |
| 5 | Missing support for advanced content (rich cards, inline replies) and flexible input (Ctrl+V, drag & drop). | Limits interaction quality and agent efficiency, especially for multimedia. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) | Timeline |
| ----- | ----- | ----- |
| Provide clear contextual header and controls | 100% conversations display correct identity, avatar, and channel icon (verified via logs). | Q3 2025 |
| Improve delivery reliability | ≥99% messages delivered successfully, with retries for failures (log analysis). | Q3 2025 |
| Enable collaborative workflows | ≥70% of conversations include private notes, tagging, or handovers (adoption tracking). | Q4 2025 |
| Support SLA and escalation visibility | ≥95% of resolved vs ongoing chats categorized correctly (monitoring dashboards). | Q4 2025 |
| Enhance search and retrieval | Search results within ≤2s, with keyword highlight and filters (performance tests). | Q3 2025 |

---

## **4 | User Stories & Acceptance Criteria**

User stories are prioritized: P0 (Must-have for MVP), P1 (High priority enhancements), P2 (Future iterations). Priorities rechecked based on business impact (P0 for core functionality and reliability; P1 for productivity tools; P2 for advanced features).

| Priority | User Story | Acceptance Criteria | Preview |
| ----- | ----- | ----- | ----- |
| P0 | As an Agent, I want to see user identity and channel details in the header so I can identify the customer. | \- Channel icon shown. \- Identity rules: WhatsApp 1:1 (phone/alias/contact name), WhatsApp Group (group name), Live Chat (name or “Guest” \+ ID) | Room Header Components [Figma](https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5163-6384&t=VZF3Zq1KjFoevLT9-11) |
| P0 | As an Agent, I want **quick access to controls in the header** so I can manage chats efficiently. | \- Buttons: Screenshot (if add-on active), Close (ongoing assigned chats), More (⋮) menu (alias change, hold/resume, reminder). \- Actions update instantly (\<1s). | Room Header Components [Figma](https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5163-6384&t=VZF3Zq1KjFoevLT9-11) |
| P0 | As an Agent, I want to see **online/offline presence** if supported by channel so I know customer status. | \- Presence indicator (green) shown only if channel supports it (e.g., WhatsApp, Live Chat). \- Updates via socket. | Room Header Component[Figma](https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5163-6384&t=VZF3Zq1KjFoevLT9-11) |
| P0 | As an Agent, **I want to see which agents are typing** in the room so I avoid conflicts. | \- Typing indicator shows agent names (max 5). \- \>5 agents shows “and x more”. \- Updates real-time via socket. | Message Component [Figma](https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5208-30772&t=VZF3Zq1KjFoevLT9-11) |
| P0 | As an Agent, **I want message bubbles clearly distinguished** so I can follow conversations. | \- Agent vs client bubbles visually distinct (color/alignment). \- Private notes styled separately (e.g., yellow background). \- Timestamp: Relative (e.g., “3h ago”) for \<7 days, full date otherwise. \- Inline reply-to shows referenced message above. | Message component / Components [Figma](https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5208-30746&t=VZF3Zq1KjFoevLT9-11) |
| P0 | As an Agent, **I want see delivery/read status indicators** so I know message status. | \- Pending: Loading spinner. \- Sent: ✓. \- Delivered: ✓✓ grey. \- Read: ✓✓ blue. \- Error: Red. \- Retry: Clickable icon \- Auto-retry every 5s (max 3 attempts). \- Inactive channel prompts relogin popup. | Message component / Figma parts / Message status [Figma](https://www.figma.com/design/h3UJGzxuD9hYTpUtGFSZKB/Satudesign-Components-V2.0.0?node-id=5208-30772&t=VZF3Zq1KjFoevLT9-11) |
| P0 | As an Agent, **I want to set reminders in the chat header** so I don’t miss follow-ups. | \- Reminder modal: One-time (date+time) or recurring (hourly/daily/weekly/monthly). \- Visible in Conversation Details. \- Notifications sent via browser/push at scheduled time. | Set reminder flow[Figma](https://www.figma.com/design/RAAuLaQKUufWMWWEm0kMb9/-V2--Satuinbox-Web-Specs?node-id=1508-304967&t=mlKnKNk9BPQTEqv9-11) |
| P0 | As an Agent, I want to set reminders log  in the chat room history so I know reminder context | \- Show Reminder set info and upcoming reminder. | Info for Reminder set in Conversation room.[Figma](https://www.figma.com/design/RAAuLaQKUufWMWWEm0kMb9/-V2--Satuinbox-Web-Specs?node-id=1508-304936&t=mlKnKNk9BPQTEqv9-11) |
| P0 | As an Agent, **I want to able to choose actions so I can manage conversations** efficiently. | \- Actions: Copy, Pin Conversation, Copy Link to Message (Nice to have). \- Multi-select for bulk actions (e.g., copy multiple messages). \- Actions logged; failures show toast. | Conversation room quick action list[Figma](https://www.figma.com/design/RAAuLaQKUufWMWWEm0kMb9/-V2--Satuinbox-Web-Specs?node-id=1508-308446&t=mlKnKNk9BPQTEqv9-11) |
| P1 | As an Agent, **I want to hold/resume a chat from the header** so I can manage workload. | \- Header buttons: Snooze (requires optional note), Resume. \- Resume restores SLA timer. \- Hold status visible in Chat List and header. |  |
| P1 | As an Agent, I want to create tickets directly from chats so I can escalate issues. | \- Option on single/multi-select messages. \- Ticket auto-linked to chat; appears in Ticket System with reference ID. |  |
| P1 | As an Agent, I want to search inside a chat thread so I can find specific messages. | \- Search bar highlights keywords. \- Next/Previous navigation. \- Result counter shown. \- Filter by date (calendar picker). |  |
| P1 | As an Agent, I want to send/receive various content and attachments so I can communicate flexibly. | \- Support: Text, images, audio, video, documents, voice notes. \- Max size: 100MB. \- Invalid format/size shows toast “Gagal mengunggah file. Periksa ukuran/format.” \- Download prompts confirmation. |  |
| P1 | As an Agent, I want enhanced chat UX with flexible input methods so I can work efficiently. | \- Ctrl+V pastes text/images from clipboard. \- Drag & drop files into text area. \- Auto-expand text area on input. \- Emoji picker available. \- Call indicator if client calls. \- Disappearing messages supported (channel-dependent). |  |
| P1 | As an Agent, I want automation support so I can reduce manual work. | \- Bot auto-reply outside working hours. \- Welcome message during working hours. \- Quick Reply (Macro) templates selectable via dropdown. |  |
| P2 | As an Agent, I want tagging and priority support so I can organize chats. | \- Add tags to bubbles; searchable. \- Priority via star icon in header. \- Tags/priority persist in session. |  |
| P2 | As an Agent, I want detailed logging so I can audit actions. | \- Log: Handover, open/close, tagging, internal read receipts. \- Logs accessible to Admin/Supervisor in audit panel. |  |
| P2 | As an Agent, I want to share structured content via rich cards so I can enhance interactions. | \- Rich cards in Live Chat: Image, title, description, up to 3 buttons. \- Carousel format for multiple cards. \- Triggered via API; not supported in WhatsApp. |  |

---

## **5 | Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Header** | \- Display: Avatar (fallback to channel icon), channel icon, identity (per channel rules). \- Controls: Screenshot (if add-on), Resolve, Hold/Resume, Reminder, More (⋮) menu (alias change). \- SLA countdown: Color-coded, pauses on Hold. \- Reminder modal: One-time/recurring options. |
| **Presence** | \- Online/offline indicator (channel-dependent). \- Typing indicator: Shows up to 5 agent names; “and x more” for \>5. \- Updates via socket. |
| **Chat Bubbles** | \- Agent vs client: Distinct color/alignment. \- Private notes: Yellow background, agent-only. \- Timestamp: Relative (\<7 days) or full date. \- Inline reply-to: Shows referenced message. |
| **Message Status** | \- Pending (spinner), Sent (✓), Delivered (✓✓ grey), Read (✓✓ blue), Failed (red with retry). \- Auto-retry: 3 attempts, 5s interval. \- Inactive channel: Relogin popup. |
| **Chat Actions** | \- Reply, Copy, Pin Chat, Copy Link to Message. \- Multi-select for bulk copy. \- Log actions; show failure toasts. |
| **Ticket Creation** | \- Option on single/multi-select messages. \- Auto-links to chat; generates reference ID. |
| **Thread Search** | \- Highlights keywords; Next/Previous navigation. \- Shows result count; date filter via calendar. |
| **Attachments** | \- Support: Text, images, audio, video, documents, voice notes. \- Max 100MB; validate format/size. \- Download requires confirmation. |
| **Chat UX** | \- Ctrl+V: Paste text/images. \- Drag & drop: Files into text area. \- Auto-expand text area. \- Emoji picker; call indicator; disappearing messages (channel-dependent). |
| **Automation** | \- Bot auto-reply (outside hours). \- Welcome message (working hours). \- Quick Reply templates via dropdown. |
| **Assignment Workflows** | \- Show: Assigned to, Opened by, Closed by. \- Status: Unassigned → Ongoing → Resolved. \- Resolved chats reopen on new message. \- Archive retrievable. |
| **Tagging & Priority** | \- Tags on bubbles; searchable. \- Priority via star icon; persists in session. |
| **Logging** | \- Log: Handover, open/close, tagging, read receipts. \- Accessible to Admin/Supervisor. |
| **Rich Cards** | \- Live Chat only: Image, title, description, up to 3 buttons. \- Carousel format; API-triggered. |

**Chat Text Area Submit Capabilities**

| Capability | Details |
| ----- | ----- |
| **Text Input** | \- Free text input; supports multiline. \- Max 2000 characters per message. \- Auto-expand on input (up to 5 lines). |
| **Ctrl+V Paste** | \- Paste text or images from clipboard. \- Text: Inserts directly into text area. \- Image: Converts to attachment (jpg/png, ≤100MB). \- Invalid format/size shows toast “Format tidak valid atau ukuran melebihi 100MB”. |
| **Drag & Drop** | \- Drag files (images, audio, video, documents) into text area. \- Shows preview before upload. \- Max 100MB; validate format (jpg, png, mp3, mp4, pdf, docx). \- Invalid files show toast “File tidak didukung atau melebihi 100MB”. |
| **Emoji Picker** | \- Button to open emoji picker. \- Supports standard Unicode emojis. \- Inserted at cursor position. |
| **Quick Reply** | \- Dropdown for Quick Reply templates. \- Templates editable by Admin/Supervisor. \- Inserts template text into text area. |
| **Send Action** | \- Enter key or Send button submits. \- Ctrl+Enter adds new line. \- Disabled if text area empty or file upload in progress. |

---

## **6 | Non-Functional Requirements**

| Category | Details |
| ----- | ----- |
| **Performance** | \- conversation room load ≤1s. \- Message send ≤1s; socket updates ≤2s. \- Search results ≤2s. |
| **Scalability** | \- Support ≥10k messages per chat thread. \- Horizontal scaling for sockets and DB. |
| **Reliability** | \- ≥99% message delivery success. \- Auto-retry for failures; 99.9% uptime SLO. |
| **Security** | \- RBAC: Restrict delete/resolve by role. \- Encrypt attachments (AES-256). \- Comply with UU ITE. |
| **Accessibility** | \- WCAG 2.1 AA: ARIA labels for bubbles, controls. \- ≥5 keyboard shortcuts (e.g., send, search). |
| **Observability** | \- Metrics: Delivery success, load times (Prometheus). \- Logs: Structured JSON for actions, failures (ELK Stack). |

---

## **7 | UI/UX Requirements**

| Component | Description | UX Flow |
| ----- | ----- | ----- |
| **Header** | Shows avatar, channel icon, identity, SLA countdown, controls (Screenshot, Resolve, Hold/Resume, Reminder, More). | Click chat card to open; hover avatar for profile; click controls for actions. |
| **Chat Bubbles** | Agent (right, blue), client (left, grey), private notes (yellow). Inline reply-to above message. | Scroll to view; click reply-to to jump to referenced message. |
| **Text Area** | Input with Ctrl+V, drag & drop, emoji picker, Quick Reply dropdown, Send button. Auto expand text area. | Type/paste/drag files; select Quick Reply; press Enter to send. |
| **Indicators** | Presence (online/offline), typing (agent names), status (sent/delivered/read/failed), SLA (color-coded). | Hover for tooltips; real-time updates via socket. |
| **Search** | Bar with keyword highlight, Next/Previous, date filter. | Type query; navigate results; filter by date. |
| **Actions** | Context menu (Reply, Copy, Pin, Copy Link); multi-select for bulk. | Right-click message for menu; select multiple for bulk actions. |
| **Ticket Creation** | Button on message/multi-select; links to Ticket System. | Click to create; ticket ID shown in chat. |

---

## **8 | Error Handling**

| Error Type | Handling | User Message (Bahasa Indonesia) |
| ----- | ----- | ----- |
| Failed Assign/Handover | Rollback; log event. | "Gagal assign/handover." |
| Connection Lost | Auto-retry; show banner. | "Koneksi terputus." \+ Retry button. |
| Degraded Network | Auto-retry; show banner. | "Jaringan tidak stabil." |
| WA Session Expired | Prompt relogin; pause actions. | "Sesi WA perlu login ulang." \+ CTA Relogin. |
| Attachment Upload Failed | Reject file; log failure. | "Gagal mengunggah file. Periksa ukuran/format." |
| Rich Card Invalid Payload | Reject card; log error. | "Format rich card tidak valid." |
| Server Error | Retry; fallback to cached state. | "Gagal memuat chat. Silakan coba lagi." |

---

## **9 | Dependencies & Risks**

| Dependency | Details |
| ----- | ----- |
| **Internal** | \- Omnichannel Inbox for chat data and socket updates. \- WhatsApp Web Integration for status and relogin. \- Ticket System for ticket creation. |
| **External** | \- WhatsApp Libraries (Baileys, Cloud API) for messages/sync. \- WebSocket library for real-time updates. |

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Socket Update Lag | Medium | High | Optimize WebSocket; fallback to polling. |
| Attachment Upload Failures | Medium | Medium | Validate formats/size client-side; retry uploads. |
| SLA Misconfiguration | Low | High | Validate SLA settings; provide defaults. |

---

## **10 | Success Metrics**

| Metric | Target | Measurement Tool |
| ----- | ----- | ----- |
| Successful Message Delivery Rate | ≥99% | Log analysis (ELK Stack). |
| Avg. Time to Locate Message | ≤2s | User session tracking (Google Analytics). |
| % of Chats with Notes/Tagging | ≥70% | Feature adoption tracking. |
| % of Chats Auto-Reopened | 100% | Monitoring (Prometheus/Grafana). |
| conversation room Load Time | ≤1s | Performance tests. |
| % of Chats with Hover Profile Used | ≥70% | Usage analytics. |

---

## **11 | Future Considerations**

| Consideration | Priority |
| ----- | ----- |
| AI-powered sentiment detection and escalation triggers. | P1 |
| Rich media previews (inline video, docs). | P2 |
| Threaded replies (nested) in addition to inline. | P2 |
| Inline SLA countdown timer animations. | P2 |
| Agent performance insights per chat (response time, notes). | P1 |

---

## **12 | Limitations**

| Limitation | Workaround | Priority to Address |
| ----- | ----- | ----- |
| Some channels may not support presence. | Show indicator only when supported. | P2 |
| Max file size 15MB. | Share larger files externally. | P2 |
| Disappearing messages depend on channel. | Mark unsupported channels in UI. | P2 |
| Rich cards supported only in Live Chat. | Use text \+ attachments for other channels. | P2 |

