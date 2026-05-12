# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: CSAT Inline Closing Survey  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: Resky Fernanda Witanto

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-15 | Yusril Ibnu Maulana | Init |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Collect CSAT in the same channel when a Ticket becomes Resolved or a Conversation becomes Closed. |
| Scope | One CSAT submission per entity. Rating 1 to 5 plus optional reason text. Admin-configurable per entity and per channel. |

**Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Inline CSAT prompt sent after Ticket Resolved and or Conversation Closed. | Auto-Notification after close and routing matrix. |
| Channel coverage for Livechat, WhatsApp Official, WhatsApp Web, Instagram DM, Facebook Messenger, Email. | Analytics dashboard and report exports. |
| CSAT rating 1 to 5 plus optional reason. | Multi-question survey builder beyond 2 questions. |
| Customizable CSAT copy per channel with variables including custom fields and custom attributes. | Compensation workflows and refunds. |
| Low score automation to create follow up ticket. | Advanced assignment logic for follow up ticket. |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | CSAT capture is inconsistent after resolution across channels. | Teams lack reliable service quality signals. |
| PS-002 | Low satisfaction is not consistently converted into follow up actions. | Recovery is slow and churn risk increases. |

---

## **4\. Objectives and Key Results**

| ID | Objective | Key Result |
| ----- | ----- | ----- |
| OKR-001 | Increase CSAT capture after resolution. | CSAT prompt created for at least 90 percent of eligible closures. |
| OKR-002 | Improve response rate. | CSAT response rate at least 25 percent within 30 days. |
| OKR-003 | Make low CSAT actionable. | At least 80 percent of low CSAT responses create a follow up ticket when enabled. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to enable CSAT for Ticket and or Conversation so that I can control where CSAT is collected. | 1\. Given CSAT is enabled for Ticket, When a Ticket becomes Resolved, Then the system sends a CSAT prompt in the same channel. 2\. Given CSAT is enabled for Conversation, When a Conversation becomes Closed, Then the system sends a CSAT prompt in the same channel. 3\. Given CSAT is disabled for an entity type, When that entity closes, Then no CSAT prompt is sent. 4\. Given CSAT is disabled for a channel, When an eligible entity closes in that channel, Then no CSAT prompt is sent. |
| US-002 | P0 | As a Customer, I want to submit a CSAT rating quickly so that feedback is easy. | 1\. Given a CSAT prompt is shown, When the customer submits a rating 1 to 5, Then the system stores the rating and confirms success. 2\. Given a CSAT response already exists for the same entity, When the customer submits again, Then the system rejects the duplicate and shows confirmation that it was already received. 3\. Given the customer sends an invalid rating, When the system receives it, Then the system asks the customer to send a valid value 1 to 5\. |
| US-003 | P0 | As a Customer, I want to optionally provide a reason so that I can explain my rating. | 1\. Given the customer submitted a rating, When the customer provides a reason text, Then the system stores the reason with the CSAT response. 2\. Given the customer submitted a rating, When the customer skips the reason, Then the system completes CSAT without a reason. 3\. Given the customer sends a reason before rating, When the system receives it, Then the system asks for rating first and does not store the reason. |
| US-004 | P1 | As an Admin, I want CSAT copy to be customizable per channel so that it matches my brand and context. | 1\. Given Admin edits CSAT prompt copy for a channel, When saved, Then future CSAT prompts use the updated copy. 2\. Given Admin uses variables in the copy, When the prompt is sent, Then variables resolve using entity data. 3\. Given Admin leaves copy empty, When saved, Then the system falls back to default copy. |
| US-005 | P0 | As a Supervisor, I want low CSAT to optionally create a follow up ticket so that actions are guaranteed. | 1\. Given auto create follow up ticket is enabled and score is less than or equal to threshold, When CSAT is submitted, Then a follow up ticket is created and linked to the source entity. 2\. Given auto create is disabled, When low CSAT is submitted, Then no follow up ticket is created. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Triggers and eligibility | FR-001: System MUST trigger CSAT when Ticket stage category becomes Resolved. FR-002: System MUST trigger CSAT when Conversation status becomes Closed. FR-003: System MUST allow enabling CSAT for Ticket only, Conversation only, or both. FR-004: System MUST allow enabling CSAT per channel. FR-005: System MUST create at most one CSAT response per entity using key tenant\_id, entity\_type, entity\_id. FR-006: System MUST be idempotent for repeated close events and retries. FR-007: System MUST mark an entity as not eligible if there is no customer identifier for the source channel. |
| Channel delivery and input modes | FR-008: System MUST support all channels: Livechat, WhatsApp Official, WhatsApp Web, Instagram DM, Facebook Messenger, Email. FR-009: System MUST send CSAT prompt in the same channel as the closed entity. FR-010: System MUST support two inline input modes per channel capability. 1\. Interactive options when supported by the channel integration. 2\. Text reply input when interactive options are not supported. FR-011: For text reply mode, system MUST accept only values 1, 2, 3, 4, 5\. FR-012: For text reply mode, system MUST ignore other messages and prompt the user with validation guidance. |
| Survey content | FR-013: System MUST collect CSAT rating scale from 1 to 5\. FR-014: System MUST collect optional reason text after rating submission. FR-015: System MUST store reason text up to 1000 characters. FR-016: System MUST strip HTML and store plain text only for reason. |
| Templates and variables | FR-017: System MUST provide default copy per channel for rating prompt and reason prompt. FR-018: System MUST allow Admin to customize copy per channel. FR-019: System MUST support system variables in copy. 1\. agent\_name. 2\. customer\_name. 3\. reference\_id. 4\. entity\_type. 5\. entity\_id. FR-020: System MUST support variables from Ticket custom fields when entity\_type is Ticket. FR-021: System MUST support variables from Conversation custom attributes when entity\_type is Conversation. FR-022: If a variable value is missing, system MUST render it as empty and still send the message. |
| Data capture | FR-023: System MUST store CSAT prompt record with metadata snapshot. 1\. tenant\_id. 2\. entity\_type and entity\_id. 3\. conversation\_id when available. 4\. source\_channel. 5\. team\_inbox\_id when available. 6\. customer identifier for the channel. 7\. last\_handling\_agent\_id when available. 8\. prompt\_sent\_at and status. FR-024: System MUST store CSAT response record. 1\. csat\_score. 2\. csat\_reason. 3\. submitted\_at. 4\. submit\_channel. 5\. link to prompt record. |
| Low score follow up | FR-025: System MUST support low score threshold setting from 1 to 5 with default 2\. FR-026: System MUST support toggle to auto create follow up ticket for low score. FR-027: System MUST create follow up ticket when score is less than or equal to threshold and auto create is enabled. FR-028: Follow up ticket MUST include CSAT score, reason, channel, timestamps, and source entity reference. |
| Permissions | FR-029: System MUST restrict CSAT settings access to Owner and Admin. FR-030: System MUST hide CSAT settings entry points from Agent role. FR-031: System MUST show access denied message when a non permitted user attempts to access CSAT settings via direct URL. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI and UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Prompt send failed | Retry up to 3 times within 5 minutes. Mark as failed after retries. | No customer message. Log failure. |
| EH-002 | Invalid rating input | Do not store. Ask for valid rating. | "Nilai tidak valid. Silakan pilih 1 sampai 5." |
| EH-003 | Duplicate submission | Store first only. Reject subsequent submissions. | "Feedback sudah diterima. Terima kasih." |
| EH-004 | Reason submit failed | Allow retry once. Do not delete stored rating. | "Terjadi kesalahan. Silakan coba lagi." |
| EH-005 | Follow up ticket creation failed | Do not block CSAT storage. Log and alert internal users. | "Gagal membuat tiket otomatis. Silakan buat tiket secara manual." |
| EH-006 | Permission denied | Block access. | "Anda tidak memiliki akses ke halaman ini." |

---

## **8\. Edge Cases**

| ID | Edge Case | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Ticket becomes Resolved, then reopened, then Resolved again | Send CSAT once per Ticket entity\_id. |
| EC-002 | Conversation becomes Closed, then reopened, then Closed again | Send CSAT once per Conversation entity\_id. |
| EC-003 | Customer replies with rating long after prompt | Accept only within 14 days from prompt\_sent\_at. Otherwise ignore and do not store. |
| EC-004 | Customer sends reason before rating | Do not store reason. Ask for rating first. |
| EC-005 | Multiple agents handled the case | Store last\_handling\_agent\_id. Optionally store handled\_agent\_ids if available. |
| EC-006 | Channel supports interactive options but customer replies by text | Accept text rating 1 to 5\. |
| EC-007 | Customer tries to change rating after submit | Keep first rating. Respond with duplicate message. |
| EC-008 | Customer identifier missing for the channel | Mark not eligible. Do not send prompt. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| CSAT Settings page | Toggles for entity scope and per channel enablement. Inputs for low score threshold and auto create follow up ticket. Copy editor per channel with variable helper. | 1\. Admin opens settings. 2\. Admin selects Ticket and or Conversation. 3\. Admin enables channels. 4\. Admin edits copy. 5\. Admin saves and sees success toast. | US-001 US-004 US-005 |
| Inline CSAT prompt message | Message containing rating request. Supports interactive options when available. Supports text reply mode. | 1\. Case closes. 2\. System sends prompt in same channel. 3\. Customer submits rating 1 to 5\. 4\. System confirms and asks optional reason. | US-002 US-003 |
| Optional reason prompt | Follow up message asking for optional reason. Includes skip guidance. | 1\. Customer submits rating. 2\. System asks reason and explains it is optional. 3\. Customer submits reason or ignores. 4\. System sends thank you confirmation. | US-003 |
| Validation response message | Message shown when customer submits invalid rating. | 1\. Customer sends invalid value. 2\. System responds with validation copy. 3\. Customer can retry. | US-002 |
| Access denied state | Page shown when user lacks permission for settings. | 1\. User opens settings without permission. 2\. System blocks and shows access denied copy. | US-001 |

**UI Copy (Bahasa Indonesia only)**

| Context | Copy |
| ----- | ----- |
| Prompt title | "Survei Kepuasan" |
| Rating prompt | "Seberapa puas Anda dengan layanan kami? Pilih nilai 1 sampai 5." |
| Reason prompt | "Boleh ceritakan alasannya? Ini opsional." |
| Success | "Terima kasih atas feedback Anda." |
| Duplicate | "Feedback sudah diterima. Terima kasih." |
| Invalid rating | "Nilai tidak valid. Silakan pilih 1 sampai 5." |
| Permission denied | "Anda tidak memiliki akses ke halaman ini." |
| Settings save success | "Pengaturan berhasil disimpan." |

---

## **10\. Field & Validation**

| Field | Type | Validation Rules | Required |
| ----- | ----- | ----- | ----- |
| tenant\_id | String | Must match current tenant context. | Yes |
| entity\_type | Enum | Ticket or Conversation. | Yes |
| entity\_id | String | Must exist and belong to tenant. | Yes |
| conversation\_id | String | Must exist and belong to tenant when present. | No |
| source\_channel | Enum | Livechat, WhatsApp Official, WhatsApp Web, Instagram DM, Facebook Messenger, Email. | Yes |
| csat\_score | Integer | Must be 1 to 5\. | If submitted |
| csat\_reason | String | Max 1000 chars. Plain text only. | No |
| prompt\_sent\_at | Datetime | Set when prompt is sent successfully. | Yes |
| response\_submitted\_at | Datetime | Set on first valid submission. Immutable. | If submitted |
| low\_score\_threshold | Integer | Range 1 to 5\. Default 2\. | Yes |
| auto\_create\_followup\_ticket | Boolean | True or false. | Yes |
| channel\_enabled | Boolean | True or false per channel. | Yes |
| entity\_enabled | Boolean | True or false per entity type. | Yes |

---

## **11\. Non-Functional Requirements**

| Area | Requirement |
| ----- | ----- |
| Performance | CSAT prompt attempt starts within 5 seconds after close event. |
| Reliability | Duplicate close events must not create duplicate prompts. |
| Availability | 99.9 percent monthly for CSAT prompt and response handling. |
| Security | Tenant isolation for all CSAT data access. |
| Privacy | Store reason as plain text. Do not include customer identifiers in logs shown to non privileged roles. |
| Observability | Log events for prompt sent, prompt failed, response submitted, duplicate rejected, follow up ticket creation result. |
| Accessibility | Interactive options must be keyboard accessible in Livechat widget. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Channel capability variance for inline input | Engineering | Medium | Support interactive options and text reply mode for all channels. |
| Channel outbound restrictions at close time | Product | Medium | Mark not eligible or failed with clear internal logs. |
| Poor copy customization causing low response | Product | Medium | Provide strong default copy and variable helper. |
| Follow up ticket noise for low score | Product | Medium | Threshold setting and toggle. Default off for auto create if needed. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| CSAT prompt coverage | \>= 90 percent | 30 days | CSAT prompt records vs eligible closures. |
| CSAT response rate | \>= 25 percent | 30 days | CSAT responses vs prompts sent. |
| Average CSAT | \>= 4.2 | 30 days | Mean score of responses. |
| Low score follow up rate | \>= 80 percent | 30 days | Follow up tickets vs low CSAT responses when enabled. |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Auto-Notification after close | Improve completion for customers who ignore inline CSAT. |
| Analytics dashboard | Enable performance tracking by channel, team inbox, and agent. |
| Multi-language survey copy | Improve response rate for non Indonesian customers. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Inline CSAT depends on channel input capabilities | Some channels may default to text reply only. |
| No auto-notification in this PRD | Response rate may remain low for some cohorts. |
| One response per entity | Customers cannot update rating after submission. |

---

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| CSAT | Customer satisfaction rating collected after resolution. |
| Inline CSAT | Customer submits rating within the same channel without leaving the conversation. |
| Low score | CSAT score less than or equal to configured threshold. |

