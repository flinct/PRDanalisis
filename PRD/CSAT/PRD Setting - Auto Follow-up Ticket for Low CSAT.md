# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Auto Follow-up Ticket for Low CSAT  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal Yunior  
**Design Lead**: Resky Fernanda Witanto  
**Version**: v1.0  
**Last Updated**: 2026-01-29 (Asia/Jakarta)

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-29 | Yusril Ibnu Maulana | Initial PRD for auto follow-up ticket when CSAT is low. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Convert low CSAT responses into actionable follow-up by auto-creating a new ticket, with consistent defaults and complete CSAT context. |
| Scope | Auto-create follow-up ticket when CSAT score \<= threshold. Works for Ticket-based CSAT and Conversation-only CSAT. Configurable ticket type (Conversation-only), required field defaults, and assignment rules. |

### **Scope Definition**

| In Scope | Out of Scope |
| ----- | ----- |
| Auto-create follow-up ticket when CSAT score is low and toggle is enabled. | Full workflow builder (multi-step automation). |
| Source entity: Ticket Resolved CSAT and Conversation Closed CSAT. | Advanced routing conditions (tags, priority, SLA conditions). |
| For Ticket source: follow-up ticket type MUST match original ticket type. | Auto-refund/compensation flows. |
| For Conversation source (no ticket): Admin selects follow-up ticket type. | Analytics dashboards (handled in separate PRD). |
| Required fields defaulting (freetext, option, image, date). | Custom field types beyond the 4 supported. |
| Default title and description templates (editable). | Complex agent assignment logic (round-robin, skill-based). |

---

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Low CSAT is captured but not consistently converted into follow-up work. | Slow recovery, churn risk. |
| PS-002 | Conversation-only cases lack a standardized escalation path when CSAT is low. | Missed follow-up, inconsistent escalation. |
| PS-003 | Manual follow-up ticket creation is inconsistent in content and required fields. | Poor traceability, incomplete data for supervisors. |

---

## **4\. Objectives and Key Results**

| ID | Objective | Key Result |
| ----- | ----- | ----- |
| OKR-001 | Make low CSAT operational by default patterns, not manual steps. | \>= 80% of low CSAT responses produce a follow-up ticket when enabled. |
| OKR-002 | Ensure follow-up tickets have complete context. | 100% follow-up tickets include CSAT score, optional reason, and source reference. |
| OKR-003 | Avoid duplicate/invalid auto-creation. | 0 duplicate follow-up tickets per CSAT response (idempotent). |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to enable/disable auto follow-up ticket for low CSAT so that I control escalation volume. | 1\. Given toggle is OFF, when low CSAT is submitted, then no follow-up ticket is created. 2\. Given toggle is ON, when low CSAT is submitted, then a follow-up ticket is created once. |
| US-002 | P0 | As an Admin, I want to set the low CSAT threshold so that escalation matches my policy. | 1\. Threshold range is 1-5, default 2\. 2\. Ticket creation triggers when score \<= threshold. |
| US-003 | P0 | As an Admin, I want Conversation-only follow-ups to use a chosen ticket type so that required fields are predictable. | 1\. Enabling Conversation follow-up requires selecting exactly one Ticket Type. 2\. If not selected, save is blocked and feature cannot be enabled. |
| US-004 | P0 | As a Supervisor, I want the follow-up ticket title and description to include CSAT context so that triage is faster. | 1\. Ticket includes CSAT score and reason (if provided). 2\. Ticket includes source entity reference and closure timestamp. |
| US-005 | P0 | As an Admin, I want required ticket fields to be auto-filled so that auto-created tickets never fail validation. | 1\. For Ticket-source follow-ups, required fields copy from the original ticket. 2\. For Conversation-source follow-ups, required fields use configured default values. |
| US-006 | P1 | As an Admin, I want to configure assignment target so that follow-up goes to the right owner. | 1\. Admin can choose Unassigned or Specific Agent(s). 2\. Team Inbox follows the source Team Inbox automatically. |
| US-007 | P0 | As Engineering/QA, I need idempotency so retries do not create duplicate tickets. | 1\. Same CSAT response cannot create more than one follow-up ticket even on retries. |

---

## **6\. Functional Requirements**

| Category | Requirement Details |
| ----- | ----- |
| **Trigger and eligibility** | \- FR-001: System MUST evaluate follow-up creation when a CSAT response is successfully stored. \- FR-002: System MUST create follow-up ticket only if auto-create toggle is enabled AND csat\_score \<= threshold. \- FR-003: System MUST be idempotent using a stable key (tenant\_id \+ csat\_response\_id). |
| **Source entity resolution** | \- FR-004: If CSAT is associated with a Ticket, follow-up source MUST be that Ticket (Ticket precedence). \- FR-005: If CSAT is from Conversation Closed with no Ticket, system MUST create a new Ticket from that Conversation using existing "Create Ticket from Conversation List" behavior (auto-fetch last 3-5 messages). |
| **Ticket creation constraints alignment** | \- FR-006: Follow-up ticket MUST be created using standard ticket creation requirements, including Conversation ID, Linked Messages, and Template ID (Ticket Type) as applicable. \- FR-007: New follow-up ticket MUST start in the standard ticket state machine (Submitted as initial). |
| **Ticket type selection** | \- FR-008: For Ticket-source follow-up, follow-up Ticket Type MUST match the original Ticket Type. \- FR-009: For Conversation-source follow-up, Admin MUST select exactly one Ticket Type in settings (required to enable Conversation follow-up). |
| **Required fields defaulting** | \- FR-010: Supported required field types for defaulting: freetext, option (single select), image, date. \- FR-011: For Ticket-source follow-up, system MUST copy required field values from the original ticket. \- FR-012: For Conversation-source follow-up, system MUST fill required fields using Admin-configured default values. \- FR-013: System MUST block enabling Conversation follow-up if any required field default value is missing for the selected Ticket Type. |
| **Assignment and Team Inbox** | \- FR-014: Follow-up ticket Team Inbox MUST equal the source Team Inbox (Ticket team inbox for Ticket-source, Conversation team inbox for Conversation-source). \- FR-015: Admin MUST be able to configure Assign To: Unassigned OR Specific Agent. \- FR-016: If selected agent is inactive, system MUST create ticket as Unassigned and log assignment failure. (Assigned Agent must be active user.) |
| **Default title and description templates** | \- FR-017: System MUST provide default Title and Description templates for follow-up ticket. \- FR-018: Admin MUST be able to customize Title and Description templates (plain text only). \- FR-019: Templates MUST support system variables (see Section 10). Missing variables render as empty. |
| **Linking and audit trail** | \- FR-020: Follow-up ticket MUST store a reference to the CSAT response and the source entity (Ticket or Conversation). \- FR-021: All auto-creation actions MUST appear in the ticket timeline (audit trail). |
| **Notifications** | \- FR-022: Follow-up ticket creation MUST trigger standard "new ticket" notifications for Admins and assigned agent (if any). |
| **Permissions** | \- FR-023: Only Owner/Admin can configure follow-up settings. Agents cannot access settings. (Match CSAT settings permission pattern.) |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Ticket creation failed | Retry up to 3 times with exponential backoff. If still fails, mark as failed and create internal alert log. | "Gagal membuat tiket follow-up otomatis. Silakan buat tiket manual." |
| EH-002 | Template fetch failed | Retry x3. If still fails, do not create ticket and log error. (Template ID is required.) | "Template tiket tidak tersedia. Coba lagi nanti." |
| EH-003 | Duplicate context (active ticket exists) | Block creation and log. (System should not create another active ticket on the same conversation if rules forbid it.) | Tidak ditampilkan ke customer. Internal toast: "Percakapan sudah memiliki tiket aktif." |
| EH-004 | Invalid defaults for required fields | Block enabling feature until defaults complete. | "Lengkapi default value untuk field wajib sebelum mengaktifkan." |
| EH-005 | Assignment error | Create ticket as Unassigned, log the invalid assignee. (Invalid assignee is prevented in normal flows.) | "Assignee tidak valid. Tiket dibuat tanpa penanggung jawab." |

---

## **8\. Edge Cases**

| ID | Edge Case | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | CSAT submitted twice (duplicate) | Only first CSAT response is used. Follow-up ticket created at most once per csat\_response\_id. |
| EC-002 | CSAT low score arrives after long delay | Follow-up ticket still created if CSAT response is accepted by CSAT module rules. |
| EC-003 | Source ticket was Resolved but conversation has another active ticket | Follow-up creation blocked (EH-003). |
| EC-004 | Conversation-source follow-up but selected Ticket Type changed after save | Use current Ticket Type definition at creation time, but block creation if required defaults no longer valid. |
| EC-005 | Required image field configured but no default image provided | Block enabling Conversation follow-up until a default image is provided. |
| EC-006 | Auto-create enabled for Ticket only, Conversation only, or both | System applies settings only to enabled entity scopes. |

---

## **9\. UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Follow-up settings block (inside CSAT settings) | Section to configure low score follow-up ticket behavior. | 1\. Admin opens CSAT settings. 2\. Scroll to "Tiket Follow-up Otomatis". | US-001, US-002 |
| Entity scope toggles | Toggle apply for Ticket CSAT, Conversation CSAT, or both. | 1\. Admin selects entity scope. 2\. Save. | US-001 |
| Ticket Type selector (Conversation-source) | Dropdown to select exactly one Ticket Type for Conversation-only follow-ups. | 1\. Enable Conversation follow-up. 2\. Select Ticket Type. | US-003 |
| Required defaults editor | Auto-generated list of required fields for selected Ticket Type with default value input per field. | 1\. System loads required fields from Ticket Type. 2\. Admin fills defaults. 3\. Save enabled. | US-005 |
| Assignment selector | Choose Unassigned or Specific Agent. Team Inbox shown as read-only "follows source". | 1\. Admin picks assignment mode. 2\. Save. | US-006 |
| Title and description template editor | Inputs with "Reset to default" and variable helper. | 1\. Admin edits text. 2\. Preview. 3\. Save. | US-004 |

### **UI Copy (Bahasa Indonesia only)**

| Context | Copy |
| ----- | ----- |
| Section title | "Tiket Follow-up Otomatis (CSAT Rendah)" |
| Toggle label | "Buat tiket follow-up otomatis jika nilai CSAT rendah" |
| Threshold label | "Batas nilai rendah" |
| Ticket type label | "Ticket Type untuk follow-up dari Conversation" |
| Defaults label | "Default value untuk field wajib" |
| Assignment label | "Assign ke" |
| Team inbox hint | "Team Inbox mengikuti sumber (otomatis)" |
| Title template label | "Template judul tiket" |
| Description template label | "Template deskripsi tiket" |
| Save blocked | "Lengkapi konfigurasi sebelum menyimpan." |

---

## **10\. Field and Validation**

### **10.1 Settings Fields**

| Field | Type | Validation Rules | Required |
| ----- | ----- | ----- | ----- |
| low\_score\_threshold | Integer | 1-5, default 2 | Yes |
| auto\_create\_followup\_enabled | Boolean | true/false | Yes |
| followup\_scope\_ticket | Boolean | true/false | Yes |
| followup\_scope\_conversation | Boolean | true/false | Yes |
| conversation\_followup\_ticket\_type\_id | String | Required if followup\_scope\_conversation is true | Conditional |
| required\_defaults\_by\_field\_key | Object | Must cover all required fields for conversation\_followup\_ticket\_type\_id | Conditional |
| assign\_mode | Enum | unassigned, specific\_agent | Yes |
| assign\_agent\_id | String | Must be active user if specific\_agent | Conditional |
| title\_template | String | Max 200 chars, plain text | Yes |
| description\_template | String | Max 5000 chars, plain text | Yes |

### **10.2 Follow-up Ticket Metadata Fields (stored in ticket metadata)**

| Field | Type | Validation Rules | Required |
| ----- | ----- | ----- | ----- |
| csat\_response\_id | String | Must exist and belong to tenant | Yes |
| csat\_score | Integer | 1-5 | Yes |
| csat\_reason | String | Max 1000 chars, plain text | No |
| source\_entity\_type | Enum | Ticket, Conversation | Yes |
| source\_entity\_id | String | Must exist and belong to tenant | Yes |
| source\_reference\_id | String | Ticket ID or Conversation ID shown to users | Yes |
| resolved\_at | Datetime | ISO | Yes |
| customer\_name | String | Snapshot | No |
| customer\_phone | String | Snapshot | No |
| customer\_email | String | Snapshot | No |
| handled\_agent\_ids | Array | Snapshot, can be empty | No |
| last\_handling\_agent\_id | String | Snapshot | No |
| source\_team\_inbox\_id | String | Snapshot | No |

### **10.3 Template Variables (available in title/description)**

* {reference\_id}

* {entity\_type}

* {entity\_id}

* {resolved\_at}

* {csat\_score}

* {csat\_reason}

* {customer\_name}

* {customer\_phone}

* {customer\_email}

* {last\_handling\_agent\_name}

* {handled\_agent\_names}

---

## **Default Title and Description Templates**

**Title (default):**  
 `[Follow-up] Low CSAT {reference_id} ({csat_score}/5)`

**Description (default):**

1. `Follow-up created from low CSAT.`

2. \`\`

3. `Source: {entity_type} {reference_id}`

4. `Resolved at: {resolved_at}`

5. `CSAT: {csat_score}/5`

6. `Reason: {csat_reason}`

7. \`\`

8. `Customer: {customer_name} {customer_phone} {customer_email}`

9. `Handled by: {handled_agent_names}`

10. `Last handled by: {last_handling_agent_name}`

(Stored as plain text, line breaks preserved.)

---

## **11\. Non-Functional Requirements**

| Area | Requirement |
| ----- | ----- |
| Performance | Follow-up ticket creation attempt starts within 5 seconds after CSAT response stored. |
| Reliability | Must be idempotent per csat\_response\_id. Retries must not duplicate tickets. |
| Availability | 99.9% monthly for follow-up creation pipeline. |
| Security | Tenant isolation for all CSAT and ticket data. |
| Observability | Log events: followup\_create\_attempt, followup\_created, followup\_failed, assignment\_failed, blocked\_active\_ticket. |
| Auditability | Follow-up creation and assignment must appear in ticket timeline. |

---

## **12\. Dependencies and Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Ticket creation requires Conversation ID, Linked Messages, Template ID | Engineering | High | Reuse existing ticket creation pipeline and validations. |
| Conversation already has active ticket | Product, Engineering | Medium | Block creation and log (EH-003). |
| Template Service changes required fields | Engineering | Medium | Validate defaults at save time and at runtime before creation. |
| Ticket noise volume | Product | Medium | Default OFF. Clear warning in settings. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Follow-up creation rate (when enabled) | \>= 80% of low CSAT | 30 days | followup\_created / low\_csat\_count |
| Follow-up ticket validity | 99% created without validation failure | 30 days | error logs |
| Mean time to first follow-up action | \-20% vs baseline | 30 days | ticket timeline |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Assignment modes (exclude last agent, supervisor routing) | Reduce bias, improve accountability. |
| Follow-up ticket type mapping per Team Inbox | More control for orgs with multiple workflows. |
| Optional auto-tagging for follow-up tickets | Easier reporting and triage. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Only 4 field types supported for required defaults (freetext, option, image, date) | Some ticket types may not be eligible for Conversation-source follow-up. |
| No advanced routing conditions | Less flexible than workflow engine, but simpler for current target ops. |

---

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| Low CSAT | CSAT score \<= configured threshold. |
| Follow-up ticket | A new ticket auto-created to recover low satisfaction cases. |
| Conversation-source follow-up | Follow-up created from Conversation Closed when no ticket exists. |
| Ticket-source follow-up | Follow-up created using the resolved ticket as the source. |

