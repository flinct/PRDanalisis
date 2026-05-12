# **Product Requirement Document (PRD)**

**Feature:** Ticket Type & Template  
 **Product:** SatuInbox

| Role | Name |
| ----- | ----- |
| **Product Manager** | Yusril Ibnu Maulana |
| **Engineering Lead** | Naftal |
| **Design Lead** | Resky |
| **Contributors** | Engineering Team, QA Team, Design Team |
| **Version** | v1.1 |
| **Last Updated** | October 2025 |

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | Oct 2025 | Yusril Ibnu Maulana | Initial draft — Ticket Template PRD |
| v1.1 | Oct 2025 | Yusril Ibnu Maulana | Updated with mockup-based structure: custom fields, state configuration, and title autofill section. |
| v1.2 | 08 Jan 2025 | Yusril Ibnu Maulana | Patch v1.2 Custom Field Ready Only Toggle |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| **Feature** | Ticket Type & Template |
| **Purpose** | To provide a unified system for creating, editing, and managing Ticket Types based on reusable templates. Users can instantly adopt predefined templates or customize their own with specific fields and workflow states. |
| **Key Capabilities** | \- Create new Ticket Types using base templates (e.g., “Shipping Ticket”, “Refund Request”). \- TBD\- Add, edit, or remove **Custom Attributes (Fields)** with type, default value, and validation.\- Define **Ticket States** within status categories (Submitted, In Progress, Waiting on Customer, Resolved).\- Enable **Autofill Title Field** for quick reference and ticket naming consistency.\- Manage field visibility, order, and required status directly from UI. |
| **Outcome** | Accelerates setup time for new workflows while maintaining structure and SLA tracking alignment across all ticket types. |

---

## **3\. Problem Statement**

| \# | Problem | Impact |
| ----- | ----- | ----- |
| 1 | Creating ticket structures manually is time-consuming. | Delays workflow setup and onboarding. |
| 2 | Ticket data fields differ between teams or clients. | Causes inconsistent reporting and data fragmentation. |
| 3 | No visual builder for configuring ticket states and field order. | Users rely on engineering or JSON configuration. |
| 4 | No automated title generation from key fields (like AWB or case number). | Tickets are hard to identify in conversation lists. |

---

## **4\. Objectives & Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Simplify creation of ticket workflows | Create new Ticket Type in ≤ 2 minutes |
| Enable consistent ticket data | 90% of new tickets based on standardized fields |
| Support dynamic customization | 100% Ticket Type fields editable from UI |
| Auto-generate clear ticket naming | 100% of tickets have a visible, readable title |

---

## **6\. User Stories & Acceptance Criteria**

### **6.1 User Stories**

| ID | As a | I want to | So that |
| ----- | ----- | ----- | ----- |
| US-01 | Admin | Create a new Ticket Type from an existing template | I can reuse standard ticket formats |
| US-02 | Admin | Add or edit fields in the ticket builder | I can capture information relevant to my workflow |
| US-03 | Admin | Configure state groups (Submitted, In Progress, Waiting on Customer, Resolved) | My team can match ticket stages to business flow |
| US-04 | Admin | Reorder or delete custom fields | I can adjust layout without redoing the form |
| US-05 | Admin | Toggle required or optional per field | I can control what agents must fill |
| US-06 | Admin | Set one field as Title Autofill | Ticket titles are automatically descriptive (e.g., “AWB 123456”) |
| US-07 | Agent | See tickets generated with proper field structure | I can input consistent information quickly |
| US-08 | Parent Account | Manage base templates shared across multiple clients | I can ensure consistent ticket data organization |

---

### **6.2 Acceptance Criteria**

| ID | Feature / Function | Acceptance Criteria |
| ----- | ----- | ----- |
| AC-01 | Template List | Default templates appear upon first system setup (e.g., “Shipping Ticket”, “Refund Request”). \- TBD |
| AC-02 | Create New Ticket Type | Clicking “Create Ticket Type” opens the form builder with fields, title autofill, and state configuration. |
| AC-03 | Add Custom Field | Supports field types: **Text, List Option, Date, Image**. |
| AC-04 | Field Behavior | Each field supports default value, description, and Required toggle. |
| AC-05 | Header Field | At least one field can be designated as *Header Field* for list display. |
| AC-06 | Title Autofill | Admin selects one field for title autofill (e.g., “AWB” → “Ticket: AWB 123456”). |
| AC-07 | State Group | Admin can add, rename, or delete sub-states within each category (Submitted / In Progress / Waiting on Customer / Resolved). |
| AC-08 | Field Validation | Prevent saving if duplicate field names or missing header field. |
| AC-09 | Template Sync | Ticket Type fields changes apply to Ticket Types using that template. |

---

## **7\. Field-Level Details & Validation**

| Section | Field Name | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Ticket Type Info | Ticket Type Name | Text | “Shipping Ticket” | 3–50 characters | Yes |
| Custom Attributes | Field Name | Text | “Issue Description” | Unique per template | Yes |
|  | Field Type | Enum | Text, List Option, Date, Image | Must match input type | Yes |
|  | Required Toggle | Boolean | On / Off | Validation enforced | Yes |
|  | Default Value | Text | “N/A” | Optional | No |
|  | Description | Text | “Enter issue details” | Max 100 chars | No |
| Title Autofill | Autofill Field | Dropdown | “AWB Number” | Must select existing field | Optional |
| State Builder | Category | Enum | **Submitted, In Progress, Waiting on Customer, Resolved** | Predefined | Yes |
| shipp | State Name | Text | “Eskalasi CS”, “Menunggu AWB” | Unique per category | Yes |

---

## **8\. Functional Requirements**

| ID | Category | Functional Requirement | Notes |
| ----- | ----- | ----- | ----- |
| FR-01 | Ticket Type Management | System displays predefined templates on setup (Shipping, Refund, Inquiry). | Default templates \- TBD |
| FR-02 | Field Builder | Admin can add, edit, reorder, or delete custom fields. | Drag & drop supported |
| FR-03 | State Builder | Admin can manage state names within each category. | Add / delete / rename |
| FR-04 | Autofill Title | Admin can enable Title Autofill using one field. | Optional feature |
| FR-05 | Validation | Save blocked if header field missing or duplicate names exist. | Inline validation |
| FR-06 | Version Control | Each edit saves version history with `template_version_id`. | Stored in audit log |
| FR-07 | Integration with Ticketing | Ticket creation uses field and state config from chosen type. | Real-time mapping |
| FR-08 | Role Permissions | Only Admin and Parent Account can create/edit Ticket Types. | Role-based |

---

## **9\. Error Handling**

| Error Type | Scenario | Handling | Message (EN) |
| ----- | ----- | ----- | ----- |
| Missing Header Field | No field marked as header | Block save | “Please select a header field.” |
| Duplicate Field | Field name already used | Prevent save | “Field name must be unique.” |
| Invalid Autofill Field | Autofill field not found | Disable option | “Autofill field not available.” |
| State Conflict | Duplicate sub-state name | Highlight conflict | “State name already exists.” |
| Sync Failure | Failed to push update | Retry 3x, log error | “Ticket Type sync failed.” |

---

## **10\. Dependencies & Risks**

### **Dependencies**

| Module | Description |
| ----- | ----- |
| **Ticketing Module** | Uses Ticket Type definition to generate structured tickets. |
| **Template Service** | Stores and syncs template configuration. |
| **Audit Log** | Records template version and field changes. |

### **Risks**

| Risk | Probability | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Incorrect field mapping | Medium | High | Validation rules & version IDs |
| Overlapping state names | Low | Medium | Unique validation per category |
| Version mismatch | Medium | Medium | Auto-sync queue |
| Over-customization by users | Low | Medium | Lock base templates for view-only |

---

## **11\. Future Considerations**

| Feature | Priority | Description |
| ----- | ----- | ----- |
| Conditional Field Logic | P2 | Show or hide fields based on values. |
| State-based SLA | P1 | Link each state to a separate SLA rule. |
| Template Sharing | P2 | Export/import templates across organizations. |
| Field Group Tabs | P3 | Visual grouping for long forms. |

---

## **12\. Limitations**

| Limitation | Workaround | Priority |
| ----- | ----- | ----- |
| No conditional logic between fields | Use manual field description | P2 |
| No field dependencies | Must fill manually | P3 |
| Default templates editable by Admin only | Intentional design | P1 |

# **Patch (v1.2) — Custom Field Read-only Toggle**

**Document:** Ticket Type & Template PRD  
**Version:** v1.2  
**Patch Date:** 2026-01-08  
**Change Owner:** Yusril Ibnu Maulana

---

### **1\) Summary**

Add a new per-field configuration **Read-only** (default **OFF**) in Ticket Type custom fields.  
 If **ON**, the field:

* **can be filled only on ticket creation**  
* **cannot be edited afterward** (inline edit disabled in Ticket Detail / forms)  
* remains visible as plain text

If **OFF**, field behaves editable anytime based on existing rules.

---

### **3\) User Stories & Acceptance Criteria (Patch)**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-09 | P0 | As an Admin, I want to mark a custom field as read-only so it can only be set once at creation. | 1\) Read-only toggle exists per field and default OFF. 2\) When ON and saved, the setting persists in template config. |
| US-10 | P0 | As an Agent, I want to fill read-only fields during ticket creation so the initial data is captured. | 1\) Read-only fields appear in create form like normal. 2\) If required=true, creation blocks when empty. |
| US-11 | P0 | As an Agent, I should not be able to edit read-only fields after creation to prevent data tampering. | 1\) Inline edit is disabled after creation for read-only fields. 2\) API rejects updates with a structured error. 3\) UI shows disabled state \+ message. |

---

### **4\) Functional Requirements (Patch)**

| ID | Category | Functional Requirement | Notes |
| ----- | ----- | ----- | ----- |
| FR-09 | Field Builder | System MUST provide a **Read-only toggle** per custom field. | Default OFF |
| FR-10 | Field Config Persistence | System MUST store `read_only` boolean in template field schema. | Stored per field |
| FR-11 | Ticket Creation | System MUST allow setting read-only field values during ticket creation. | Same UI control as field type |
| FR-12 | Post-create Mutability | System MUST prevent editing a read-only field after ticket creation. | Applies to UI \+ API |
| FR-13 | Validation | If `required=true` and `read_only=true`, value MUST be provided at creation time. | No later “fix” allowed |
| FR-14 | Audit | System MUST record activity event when read-only field is set at creation. | Normal create event |
| FR-15 | API Enforcement | Ticket update API MUST reject payloads attempting to change read-only fields. | See errors |

---

### **5\) Data Model / Contract Patch**

**Custom field schema (template config)**

* Add: `read_only: boolean` (default false)

---

### **6\) Error Handling (Patch)**

| Error Type | Scenario | Handling | Message (EN) |
| ----- | ----- | ----- | ----- |
| Read-only violation | Update request tries to modify read-only field after create | Reject with 409 (or 422\) | “Field is read-only after creation.” |
| Missing required read-only | Create ticket without required read-only field | Block create | “Please fill required fields.” |

**Suggested API error**

`{`  
  `"error": {`  
    `"code": "read_only_field",`  
    `"message": "Field is read-only after creation.",`  
    `"details": {`  
      `"field_key": "awb"`  
    `}`  
  `}`  
`}`

---

### **8\) Notes / UX Behavior**

* In Ticket Detail, read-only fields render as **plain text** (not input).  
* If a field is `read_only=true` and empty (allowed only if not required), it stays empty and still cannot be edited later.

# **Patch (v1.3) — Custom Field Types: Gallery and Files**

**Document:** Ticket Type & Template PRD  
**Version:** v1.3  
**Patch Date:** 2026-04-10  
**Change Owner:** Yusril Ibnu Maulana

---

### **1\) Summary**

Add two new custom field types in Ticket Type builder:

1. Gallery  
2. Files

Gallery is used for multiple images in one field.

1. Supports up to 20 images per field value.  
2. Accepted formats: jpg, jpeg, png, webp.  
3. System auto-resizes uploaded images.  
4. System auto-compresses uploaded images.  
5. Default value is not supported.

Files is used for multiple document attachments in one field.

1. Supports up to 20 files per field value.  
2. Max file size is 10 MB per file.  
3. Accepted formats: pdf, doc, docx, xls, xlsx, csv, ppt, pptx, txt, md, markdown, rtf, odt, ods, odp.  
4. Script, executable, and archive formats are blocked.  
5. Default value is not supported.

Existing Image field remains single-image and unchanged.

---

### **2\) Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Add Gallery field type | Auto convert existing Image fields |
| Add Files field type | File content search or OCR |
| Multi upload support per field | Preview for all document types |
| Presence based filter for Gallery and Files | Filename search |
| View Settings support in ticket type tab | Global filter in All tab |

---

### **3\) User Stories & Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-12 | P0 | As an Admin, I want to add a Gallery field so that I can store multiple images in one field. | 1\. Given I am in builder, When I add Gallery, Then field is created. 2\. Given field exists, When configuring, Then I can set label, description, Required, Read-only. 3\. Given field type is Gallery, Then default value is disabled. |
| US-13 | P0 | As an Admin, I want to add a Files field so that I can store multiple documents in one field. | 1\. Given I am in builder, When I add Files, Then field is created. 2\. Given field exists, When configuring, Then I can set label, description, Required, Read-only. 3\. Given field type is Files, Then default value is disabled. |
| US-14 | P0 | As an Agent, I want to upload multiple images so that evidence can be grouped. | 1\. Given Gallery field, When uploading, Then max 20 images allowed. 2\. Given valid upload, Then system auto resize and compress. 3\. Given invalid file or exceed limit, Then rejected with error. |
| US-15 | P0 | As an Agent, I want to upload multiple files so that documents can be attached. | 1\. Given Files field, When uploading, Then max 20 files allowed. 2\. Given file \>10MB, Then rejected. 3\. Given blocked type, Then rejected. |
| US-16 | P0 | As an Agent, I want fields to appear in View Settings only in specific ticket type. | 1\. Given ticket type tab, When open View Settings, Then Gallery and Files visible. 2\. Given All tab, Then fields not shown. 3\. Given enabled column, Then table shows attachment indicator. |
| US-17 | P0 | As an Agent, I want to filter by attachment presence. | 1\. Given ticket type tab, When filter Gallery, Then options are Ada gambar and Tidak ada gambar. 2\. Given ticket type tab, When filter Files, Then options are Ada file and Tidak ada file. 3\. Given All tab, Then filters not shown. |
| US-18 | P0 | As an Agent, I want Required and Read-only to behave consistently. | 1\. Given Required field, When empty, Then save blocked. 2\. Given Read-only, When after creation, Then cannot edit. 3\. Given empty and not required, Then stays empty and locked. |

---

### **4\) Functional Requirements**

| ID | Category | Requirement | Notes |
| ----- | ----- | ----- | ----- |
| FR-16 | Field Types | System MUST add Gallery and Files as new field types |  |
| FR-17 | Gallery Limit | System MUST limit Gallery to 20 images | Per field |
| FR-18 | Gallery Format | System MUST accept jpg, jpeg, png, webp | Allowlist |
| FR-19 | Gallery Optimization | System MUST auto resize and compress images |  |
| FR-20 | Files Limit | System MUST limit Files to 20 items | Per field |
| FR-21 | File Size | System MUST limit file size to 10 MB per file |  |
| FR-22 | File Format | System MUST allow only safe document formats | Allowlist |
| FR-23 | Security | System MUST block script, executable, archive files |  |
| FR-24 | Field Config | System MUST support label, description, Required, Read-only |  |
| FR-25 | Default Value | System MUST disable default value for Gallery and Files |  |
| FR-26 | Required Rule | System MUST require at least 1 item if Required is ON |  |
| FR-27 | Read-only Rule | System MUST prevent edit after creation if Read-only is ON |  |
| FR-28 | Ticket UI | System MUST display Gallery as thumbnails |  |
| FR-29 | Ticket UI | System MUST display Files as list with metadata |  |
| FR-30 | Table Column | System MUST show Gallery and Files columns only in ticket type tab |  |
| FR-31 | Table Cell | System MUST show compact indicator with count |  |
| FR-32 | Filters | System MUST support presence-based filters only |  |
| FR-33 | Filter Scope | System MUST not show filters in All tab |  |
| FR-34 | Compatibility | System MUST not break existing Image field |  |

---

### **5\) Data Model Patch**

Add new field types:

* gallery  
* files

Gallery constraints:

* max\_items: 20  
* allowed\_formats: jpg, jpeg, png, webp  
* auto\_resize: true  
* auto\_compress: true  
* default\_value\_supported: false

Files constraints:

* max\_items: 20  
* max\_size\_mb: 10  
* allowed\_formats: document types only  
* blocked\_types: script, executable, archive  
* default\_value\_supported: false

---

### **6\) Error Handling**

| Error | Scenario | Handling | Message |
| ----- | ----- | ----- | ----- |
| Gallery limit | \>20 images | Reject extra | Maksimal 20 gambar |
| Files limit | \>20 files | Reject extra | Maksimal 20 file |
| File size | \>10MB | Reject file | Ukuran file melebihi 10 MB |
| Invalid image | Non image upload | Reject | Format gambar tidak didukung |
| Invalid file | Blocked type | Reject | Format file tidak didukung |
| Required empty | No upload | Block save | Field wajib harus diisi |
| Read-only edit | Modify after create | Reject | Field ini hanya bisa dibaca |
| Partial upload | Mixed success | Partial accept | Sebagian file gagal diunggah |
| Upload fail | Network error | Retry | Gagal mengunggah file |

---

### **7\) Edge Cases**

| ID | Scenario | Behavior |
| ----- | ----- | ----- |
| EC-01 | Existing Image field | Remains unchanged |
| EC-02 | Mixed valid and invalid upload | Partial success |
| EC-03 | Remove last item on Required field | Block save |
| EC-04 | Switch to All tab | Columns hidden |
| EC-05 | Filter applied then switch tab | Filter reset |
| EC-06 | Read-only empty field | Stay empty |
| EC-07 | Duplicate filenames | Allowed |
| EC-08 | No preview support | Show metadata only |

---

### **8\) UX Notes**

1. Add New Fields includes Gallery and Files.  
2. Default value input hidden for both types.  
3. Gallery shows thumbnails.  
4. Files shows list with name and size.  
5. Table shows icon with count.  
6. Empty value shows dash.  
7. Filters only support presence.  
8. No search or OCR included.

