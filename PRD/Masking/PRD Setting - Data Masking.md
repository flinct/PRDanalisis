# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Sensitive Data Masking for Open API and Custom Fields (v1.0)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 23 Jan 2026 | Yusril Ibnu Maulana | Initial PRD for sensitive data masking on Open API, Ticket Custom Fields, and Conversation Additional Fields. |

---

## **2\. Overview**

This feature allows teams to mark specific custom fields and custom properties as sensitive and enforce masking across Dashboard, Export, and Open API. Masking is enforced server-side so restricted users and restricted API credentials cannot access raw values via network inspection.

| In Scope | Out of Scope |
| ----- | ----- |
| Mark Ticket Custom Fields as sensitive. | Masking phone and email inside free-text message bodies. |
| Mark Conversation Additional Fields as sensitive. | Encryption vault, tokenization, key management. |
| Define Sensitive Keys for Open API custom properties for Team Inbox and Ticket. | Audit logs for who accessed what and when. |
| Role policy with 2 levels per role: Full or Masking. | Field-level approvals or multi-step review. |
| Open API response masking with no raw leakage for restricted access. | Automatic detection of sensitive values. |
| Export respects the same masking policy. | Advanced search on masked sensitive fields beyond last4 for phone. |

---

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Custom fields and custom properties can contain sensitive values and are returned in Dashboard, Export, and Open API. | Data can be exposed to roles and integrations that do not require full visibility. |
| Masking implemented only in frontend is insufficient. | Users can inspect API responses and obtain raw values. |
| Open API consumers may retrieve sensitive fields without clear controls. | Increases leakage risk across integrations and shared API keys. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Provide simple sensitive data controls for custom data surfaces. | Owner and Admin can mark fields as sensitive and set per-role access in under 2 minutes. |
| Prevent sensitive value leakage beyond intended access. | For Masking access, raw values are not present anywhere in Open API payloads and exports. |
| Preserve integration usability without over-complexity. | Open API includes a stable masked representation plus metadata to signal masked state. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Owner, I can set sensitive access per role to Full or Masking so sensitive fields follow our privacy policy. | 1\. Given I am an Owner, When I set a role policy to Masking and save, Then that role sees masked sensitive values in Dashboard views. 2\. Given I am an Owner, When that role exports data, Then the export contains masked sensitive values only. 3\. Given I am an Owner, When that role calls Open API, Then Open API returns masked representation and does not include raw values anywhere. 4\. Given I am an Owner, When I set a role policy to Full and save, Then that role receives raw values in Dashboard, Export, and Open API responses. |
| US-002 | P0 | As an Admin, I can mark a Ticket Custom Field as sensitive so its values are protected. | 1\. Given I am an Admin, When I enable "Data sensitif" on a Ticket Custom Field and save, Then its values follow the role policy on all surfaces. 2\. Given I am an Admin, When a role with Masking access views a ticket, Then the sensitive custom field value is masked. 3\. Given I am an Admin, When a role with Full access views a ticket, Then the sensitive custom field value is shown raw. |
| US-003 | P0 | As an Admin, I can mark a Conversation Additional Field as sensitive so its values are protected. | 1\. Given I am an Admin, When I enable "Data sensitif" on a Conversation Additional Field and save, Then its values follow the role policy on all surfaces. 2\. Given a role policy is Masking, When the role loads conversation details via Dashboard, Then the value is masked. 3\. Given a role policy is Masking, When the role loads conversation details via Open API, Then raw value is not returned anywhere in payload. |
| US-004 | P0 | As an Owner or Admin, I can define Sensitive Keys for Open API custom properties so specific keys are always treated as sensitive. | 1\. Given I am an Owner or Admin, When I add a key to Sensitive Keys for Team Inbox and save, Then any property with that key follows sensitive masking rules. 2\. Given I am an Owner or Admin, When I add a key to Sensitive Keys for Ticket and save, Then any property with that key follows sensitive masking rules. 3\. Given I am an Owner or Admin, When I remove a key and save, Then new responses no longer treat that key as sensitive. |
| US-005 | P0 | As an Agent, I can view masked sensitive values but cannot obtain raw values from any Dashboard or API response. | 1\. Given my role policy is Masking, When I open a ticket or conversation, Then sensitive fields display in masked format. 2\. Given my role policy is Masking, When I inspect browser Network responses, Then raw sensitive values are not present anywhere in payload. 3\. Given my role policy is Masking, When I export tickets or conversations, Then export contains masked sensitive values only. |
| US-006 | P0 | As an API consumer using an API credential with Masking access, I can still use Open API without seeing raw sensitive values. | 1\. Given my API credential policy is Masking, When I call Open API for tickets or conversations, Then response includes masked representation and metadata indicating masked state. 2\. Given my API credential policy is Masking, When I attempt to filter by a sensitive field value, Then the API rejects the request with a clear error. 3\. Given my API credential policy is Masking, When I fetch lists and details, Then no raw sensitive values appear anywhere in the payload. |
| US-007 | P1 | As an Agent with Masking access, I can search phone sensitive fields by last4 digits when the field type is phone. | 1\. Given my role policy is Masking, When I search phone with exactly 4 digits, Then matching results are returned and displayed masked. 2\. Given my role policy is Masking, When I search phone with non-4-digit input, Then no full matching occurs and the system shows guidance. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Access Policy | 1\. FR-001: System MUST support exactly 2 access levels for sensitive data per role: Full and Masking. 2\. FR-002: System MUST apply the same role policy to Dashboard, Export, and Open API for sensitive fields. 3\. FR-003: Default role policy MUST be Owner Full, Admin Full, Supervisor Full, Agent Masking. 4\. FR-004: Only Owner and Admin MUST be able to change sensitive data policies and field sensitivity flags. |
| Sensitive Field Configuration | 1\. FR-010: Ticket Custom Field definition MUST support a boolean flag "is\_sensitive". 2\. FR-011: Conversation Additional Field definition MUST support a boolean flag "is\_sensitive". 3\. FR-012: Open API custom properties MUST support Sensitive Keys lists for Team Inbox context and Ticket context. 4\. FR-013: Sensitive Keys matching MUST be exact and case-insensitive for key name comparison. 5\. FR-014: Sensitive Keys MUST be evaluated server-side for every response and export. |
| Server-side Enforcement | 1\. FR-020: For Masking access, server MUST NOT return raw values for any sensitive field in any response payload. 2\. FR-021: For Masking access, server MUST NOT return raw values in alternate fields including but not limited to "raw\_value", "normalized", "original", "debug", or nested objects. 3\. FR-022: For Masking access, export generation MUST use the same masking rules and MUST NOT include raw values. 4\. FR-023: For Masking access, sensitive values MUST NOT appear in URLs, query params, or pagination cursors. |
| Open API Response Contract | 1\. FR-030: Open API MUST include "is\_sensitive" boolean for Ticket Custom Fields, Conversation Additional Fields, and custom properties that match Sensitive Keys. 2\. FR-031: Open API MUST include "is\_masked" boolean in each sensitive field item. 3\. FR-032: For Full access, Open API MUST return "value" as the original typed value. 4\. FR-033: For Masking access, Open API MUST return "value" as null and MUST return "display\_value" as a masked string. 5\. FR-034: For Masking access, Open API MUST return "has\_value" boolean to indicate whether a value exists without revealing it. 6\. FR-035: Open API list and detail endpoints for tickets and conversations MUST follow the same rules. |
| Masking Formats | 1\. FR-040: Phone masking MUST preserve country code if present and MUST show only last 4 digits. 2\. FR-041: Phone masked example MUST follow pattern "+62 \*\*\*\* \*\*\*\* 7890". 3\. FR-042: Email masking MUST show first 3 characters of local-part and MUST mask domain while keeping TLD visible. 4\. FR-043: Email masked examples MUST follow pattern "joh\*\*\*@***.com" and "joh***@***.co.id".\<br\>5. FR-044: Generic string masking MUST show first 3 characters plus "***" plus last 2 characters when length is 6 or more. 6\. FR-045: Generic string masking MUST show first 1 character plus "\*\*\*" when length is less than 6\. 7\. FR-046: Non-string types marked as sensitive MUST use display\_value "Tersembunyi". |
| Search and Filtering | 1\. FR-050: For Masking access, filtering by sensitive field raw value MUST be blocked in Dashboard and Open API. 2\. FR-051: For Masking access, filtering attempts MUST return a clear error message and MUST not fallback to partial matching. 3\. FR-052: For Masking access, phone last4 search MUST be supported only when field type is phone and the input is exactly 4 digits. 4\. FR-053: For Full access, existing filtering behavior MAY remain unchanged. |
| Export | 1\. FR-060: Export MUST apply role policy to Ticket Custom Fields, Conversation Additional Fields, and sensitive custom properties. 2\. FR-061: For Masking access, export MUST write masked strings in export cells and MUST not include raw values in hidden metadata. 3\. FR-062: Export MUST include columns consistently even when values are masked or null. |
| Data Retention and Updates | 1\. FR-070: Changing a field to sensitive MUST apply immediately to new Dashboard loads, new exports, and new Open API responses. 2\. FR-071: Changing a field from sensitive to non-sensitive MUST apply immediately to new responses and exports. 3\. FR-072: Existing stored raw values MAY remain stored as-is in database since this feature controls exposure, not storage. |

---

## **7\. UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Sensitive Access Policy | Settings screen to set Full or Masking per role for sensitive data. | 1\. User opens "Pengaturan". 2\. User opens "Privasi Data". 3\. User updates access per role for "Data sensitif". 4\. User clicks "Simpan". 5\. System shows success message "Perubahan berhasil disimpan". | US-001 |
| Ticket Custom Field Builder | Toggle to mark a custom field as sensitive. | 1\. User opens "Pengaturan". 2\. User opens "Ticket". 3\. User opens "Custom Field". 4\. User edits a field. 5\. User toggles "Data sensitif". 6\. User clicks "Simpan". | US-002 |
| Conversation Additional Field Builder | Toggle to mark an additional conversation field as sensitive. | 1\. User opens "Pengaturan". 2\. User opens "Percakapan". 3\. User opens "Field Tambahan". 4\. User edits a field. 5\. User toggles "Data sensitif". 6\. User clicks "Simpan". | US-003 |
| Sensitive Keys for Open API | Management UI for sensitive key list for Team Inbox and Ticket custom properties. | 1\. User opens "Pengaturan". 2\. User opens "Developer". 3\. User opens "Open API". 4\. User opens "Kunci Data Sensitif". 5\. User adds key in input "Tambah kunci". 6\. User clicks "Tambah". 7\. User clicks "Simpan". | US-004 |
| Masked Value Display | Unified display pattern for masked values in ticket and conversation details. | 1\. User opens a ticket or conversation detail. 2\. System renders sensitive fields based on policy. 3\. If masked, system shows masked string or "Tersembunyi". 4\. If blocked, system shows "Tidak punya akses". | US-005 |
| Search Guidance | Guidance for phone last4 search when Masking access applies. | 1\. User opens list view search. 2\. User types input. 3\. If input is not 4 digits, show "Masukkan 4 digit terakhir nomor telepon". 4\. If input is 4 digits, run search and show masked results. | US-007 |

---

## **8\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Error Handling | If a non-authorized role attempts to change sensitive policy or field sensitivity, system blocks the action. | Show "Anda tidak punya akses" and keep previous state. |
| EH-002 | Error Handling | If a Masking access request attempts to filter by sensitive field value, system rejects the request. | Dashboard shows "Filter tidak didukung untuk data sensitif". Open API returns an error message "Filter not allowed for sensitive fields". |
| EH-003 | Error Handling | If export is requested by a Masking role and includes sensitive fields, export completes with masked values only. | No warning needed. If export fails, show "Ekspor gagal. Coba lagi". |
| EH-004 | Error Handling | If Sensitive Keys input is invalid, system blocks save. | Show "Format kunci tidak valid". |
| EH-005 | Edge Case | Duplicate Sensitive Key added. | Show "Kunci sudah ada" and do not add a duplicate row. |
| EH-006 | Edge Case | Sensitive Key contains spaces or special characters not allowed. | Block and show "Gunakan huruf, angka, atau garis bawah". |
| EH-007 | Edge Case | Sensitive field value is empty or null. | Display "-" and set has\_value false. |
| EH-008 | Edge Case | Email has no dot in domain so TLD is unknown. | Mask as "joh\*\*\*@\*\*\*" without TLD. |
| EH-009 | Edge Case | Phone has fewer than 4 digits after normalization. | Display "\*\*\*\*" and set has\_value true if original had a value. |
| EH-010 | Edge Case | A custom property key is not in Sensitive Keys list but contains sensitive data. | System treats it as non-sensitive in v1. Risk documented in Limitations. |

---

## **9\. Non Functional Requirements**

| Category | Requirement | Target |
| ----- | ----- | ----- |
| Security | For Masking access, raw sensitive values are never returned in Open API responses and exports. | 0 occurrences in automated response scanning tests. |
| Privacy | Sensitive exposure must be consistent across surfaces. | 100 percent parity across Dashboard, Export, Open API. |
| Performance | Masking should not materially increase response time for list endpoints. | No measurable regression in p95 for list responses. |
| Reliability | Policy changes apply to new requests consistently. | Policy applied on next fetch without manual refresh in most flows. |
| Observability | Track counts of masked responses per endpoint and export job type. | Basic counters available in monitoring. |

---

## **10\. Dependencies and Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Custom Field system must support new "is\_sensitive" flag. | Engineering | Medium | Add migration and default false for existing fields. |
| Open API schema changes required for masked representation. | Engineering | High | Introduce additive fields "display\_value", "is\_masked", "has\_value" while keeping existing structure for Full access. |
| Export pipeline may bypass policy evaluation. | Engineering | High | Apply policy in export generation layer and add export content tests. |
| Sensitive Keys may be misconfigured. | PM | Medium | Provide UI examples and validation, and add clear descriptions. |

---

## **11\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Masking access never receives raw sensitive values. | 0 violations | Continuous | Automated tests and monitoring checks. |
| Admin adoption of sensitive field flags. | 30 percent of tenants with custom fields | 60 days | Settings telemetry. |
| Export parity with policy. | 100 percent pass rate | 30 days | QA automation. |

---

## **12\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Field-specific masking strategies | Different industries require different masking levels per field. |
| Hidden access level | Some tenants may require stronger privacy than masking. |
| Sensitive value detection | Reduce risk from unregistered keys and accidental leakage. |
| Search on sensitive fields with secure indexing | Enable safe exact match without revealing values. |

---

## **13\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Unknown custom property keys not listed in Sensitive Keys are not protected in v1. | Sensitive data may leak if teams do not register keys. |
| Masking protects exposure, not storage. | Raw values remain stored in database unless separate storage hardening is implemented. |
| Free-text message content is out of scope. | Sensitive data in messages is not masked by this feature. |
| Masked access reduces filtering capability on sensitive fields. | Some workflows may require Full access or alternative search patterns. |

---

## **14\. Appendix**

| Item | Details |
| ----- | ----- |
| Default role policy | Owner Full, Admin Full, Supervisor Full, Agent Masking. |
| Masking examples | Phone: \+6281234567890 becomes \+62 \*\*\*\* \*\*\*\* 7890\. Email: john.doe@gmail.com becomes joh\*\*\*@***.com. Generic: ABCDEFGH becomes A\*\*\*\*\******GH**. |
| Glossary | Sensitive field: custom field or custom property key marked for protected exposure. Masking access: returns masked display\_value and null value for sensitive data. Full access: returns raw typed value. |

