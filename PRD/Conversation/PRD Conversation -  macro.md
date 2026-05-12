# Macro Templates

**Feature:** Template Pesan (Macros) – Shortcut-Based Quick Replies  
**Contributors:** Yusril Ibnu  
**Version:** v1.0  
**Last Updated:** 29 Aug 2025

---

## **1 | Overview**

| Item | Description |
| ----- | ----- |
| **Purpose** | Provide reusable message templates (macros) that agents can insert instantly in conversations via a shortcut (e.g., /thankyou), reducing response time and ensuring message consistency. |
| **Key Capabilities** | Template list & search, create/edit/delete templates, define shortcut & message, dynamic variables (e.g., customer name), categorization (folders), visibility settings (global vs team), and quick insertion in chats. |
| **Outcome** | Faster agent responses, standardized communication, lower typing effort, and improved customer satisfaction. |

---

## **2 | Problem Statement**

| \# | Problem Description |
| ----- | ----- |
| 1 | Agents repeatedly type the same responses, causing delays and inconsistency. |
| 2 | No centralized repository for common answers; knowledge is siloed across agents. |
| 3 | Absence of dynamic placeholders leads to generic replies that must be manually personalized. |
| 4 | Agents cannot quickly find or manage existing templates. |
| 5 | Templates cannot be scoped per team or channel, leading to clutter. |

---

## **3 | Objectives & Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Standardize common responses | ≥ 80 % of frequently asked questions answered via macros. |
| Reduce agent response time | Avg. response insertion \< 2 seconds after typing shortcut. |
| Increase template discoverability | ≥ 70 % search success rate (templates found via search) |
| Improve personalization | ≥ 90 % macros include dynamic placeholders (e.g., customer name). |
| Ensure governance | 100 % templates created/edited only by authorized roles. |

---

## **4 | Success Metrics**

| Category | Metric | Target |
| ----- | ----- | ----- |
| Efficiency | Avg. time saved per response | ≥ 3 s |
| Usage | \# macros used per agent per day | ≥ 5 |
| Quality | % messages using correct variables | ≥ 95 % |
| Governance | % templates with proper ownership & visibility | 100 % |
| Satisfaction | Agent satisfaction with macro feature (survey) | ≥ 4/5 |

---

## **5 | User Stories & Acceptance Criteria**

| Pri | User Story | Acceptance Criteria |
| ----- | ----- | ----- |
| **P0** | As an Admin, I want to view all message templates in a searchable list. | – List displays columns **Shortcut** and **Message**. – Search by shortcut or text updates results in ≤ 1 s. – List sorted alphabetically or by last updated. |
| **P0** | As an Admin, I want to create a new template. | – **Shortcut** input required; must start with / and be unique. – **Message** input required; multiline supported. – Optional: choose folder/category. – Optional: choose visibility (Global or Team/Channel). – Save button enabled only when required fields valid. – On save, template appears in list. |
| **P0** | As an Admin, I want to edit an existing template. | – Edit modal pre-fills **Shortcut** and **Message**. – Shortcut must remain unique (validation). – Save updates the list immediately. – Cancel closes modal without changes. |
| **P0** | As an Admin, I want to delete a template. | – Delete action available via row menu (three dots). – Requires confirmation (Yes/No). – On confirm, template removed from list. |
| **P0** | As an Agent, I want to insert a template quickly in chat using a shortcut. | – Typing / in the chat input brings up auto-complete list of templates. – Selecting a template inserts the message with dynamic variables replaced (e.g., customer name auto‑filled). |
| **P1** | As an Admin, I want to add dynamic variables to templates. | – Variables available: customer name, order number, estimated delivery, agent name, etc. – Variables inserted via {variable} tokens or selection list in the editor. – Validation ensures variables exist. – When sending, placeholders are replaced with actual data; if missing data, fallback text displayed (e.g., “customer”). |
| **P1** | As a Supervisor, I want to categorize templates. | – Ability to assign template to a category/folder (e.g., “Shipping”, “Greeting”, “Complaint”). – Category filter available in list. |
| **P1** | As a Supervisor, I want to scope template visibility. | – Visibility options: **Global (all teams)**, **Channel-specific (WhatsApp, Live Chat)**, or **Team-specific**. – Agents only see templates relevant to their channel/team. |
| **P2** | As an Admin, I want version history of templates. | – Track who edited what and when. – Ability to revert to previous version. |
| **P3** | As an Admin, I want to bulk import/export templates. | – Support CSV/Excel import with columns **shortcut, message, category, visibility**. – Export current templates to CSV. |

---

## **6 | Field-Level Details & Validation**

| Field | Type | Validation Rules | Example |
| ----- | ----- | ----- | ----- |
| **Shortcut** | String | Required; starts with /; alphanumeric & underscores; ≤ 30 chars; unique within visibility scope | /thankyou |
| **Message** | Text | Required; supports multiline; ≤ 2000 chars | “Halo {customer\_name}, terima kasih atas pesanan Anda\!” |
| **Category** | Enum | Optional; created by Admin; may nest | “Greetings” |
| **Visibility** | Enum | Global, Channel-specific, Team-specific | “Channel: WhatsApp” |
| **Variables** | Tokens | {customer\_name}, {order\_number}, {agent\_name}, {estimated\_delivery}, etc. | N/A |

---

## **7 | UX Flow**

1. **Navigate to Templates**: Admin/Supervisor opens **Settings → Template Pesan**.

2. **View/Search**: List of templates appears; admin uses search bar or category filter.

3. **Create**: Click **Template Baru** → modal opens; admin enters Shortcut, Message, selects variables via dropdown, chooses category & visibility → Save.

4. **Edit**: Click pencil icon on a row → modal with current values; admin edits fields → Save.

5. **Delete**: Click three dots → “Delete” → confirmation modal → confirm → template removed.

6. **Use in Chat**: Agent types / in chat; suggestions pop up; selects a template; message inserted with variables replaced.

---

## **8 | Non-Functional Requirements**

* **Performance**: List actions (search/filter) respond ≤ 1 s for up to 1000 templates.

* **Real-time**: Changes propagate across all agent views within 5 s.

* **Reliability**: Save actions succeed or provide clear error messages; data stored in persistent DB.

* **Security**: RBAC ensures only authorized roles can create/edit/delete; audit log records changes.

* **Localization**: UI and default templates support Bahasa Indonesia and English.

---

## **9 | Error Handling**

| Code | Scenario | UI Message |
| ----- | ----- | ----- |
| **400‑TM01** | Shortcut blank or invalid | “Shortcut harus diisi dan dimulai dengan ‘/’.” |
| **400‑TM02** | Shortcut already exists | “Shortcut sudah digunakan. Gunakan nama lain.” |
| **400‑TM03** | Message blank | “Pesan template tidak boleh kosong.” |
| **400‑TM04** | Invalid variable token | “Variabel tidak dikenal: {variable}.” |
| **403‑TM05** | Insufficient permissions | “Anda tidak memiliki izin untuk mengubah template ini.” |
| **500‑TM06** | Server error saving template | “Gagal menyimpan template. Coba lagi nanti.” |

---

## **10 | Future Considerations**

| \# | Consideration |
| ----- | ----- |
| 1 | Rich content templates (images, buttons, attachments). |
| 2 | AI‑suggested replies based on conversation context. |
| 3 | Analytics dashboard for template usage & performance. |
| 4 | Multi‑language template variants (auto‑detected). |
| 5 | Integration with external CMS or knowledge base. |

---

## **11 | Limitations**

| Limitation | Work-around |
| ----- | ----- |
| No rich media in messages (text only). | For now, agents manually attach files. |
| Template editing does not update messages already sent. | Manual follow‑up corrections. |
| Limited variables available. | Expand variable list in future releases. |

