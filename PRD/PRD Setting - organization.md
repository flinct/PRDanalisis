# Organization ID

## Introduction

| Aspect | Detail |
| ----- | ----- |
| **Feature Name** | Organization ID |
| **Objective** | Provide a unique identifier for each organization to be used in APIs, customer support troubleshooting, and as a parent reference for all entities (users, tickets, chats, tracking). |
| **Target Audience** | Developers (API integration), Customer Support Team (troubleshooting), Admin/Parent Account (monitoring & configuration). |
| **Scope** | \- Auto-generated ID with format `org_xxxxxxxx` (short alphanumeric \+ prefix). \- Immutable, even if the organization name changes. \- Displayed in dashboard and API responses. \- Usable as a filter parameter in API requests. |

---

1. ## User Stories

| ID | Role | User Story |
| ----- | ----- | ----- |
| PA-01 | Parent Account | As a Parent Account, I want to see the Organization ID in the dashboard so I can share it with support when troubleshooting. |
| PA-02 | Parent Account | As a Parent Account, I want the Organization ID to be immutable so I can rely on it as a consistent reference even if the organization name changes. |
| DEV-01 | Developer | As a Developer, I want to use the Organization ID in API requests to filter and retrieve data specific to one organization. |
| DEV-02 | Developer | As a Developer, I want the Organization ID to be unique and standardized so I can integrate it safely with external systems. |
| CS-01 | Customer Support | As a Support Agent, I want to quickly search organizations using the Organization ID so I can resolve customer issues faster. |
| CS-02 | Customer Support | As a Support Agent, I want the Organization ID to be displayed in all organization-related tickets and logs so I can trace activities accurately. |

2. ## Acceptance Criteria

| ID | Feature | Criteria | Pass/Fail Conditions |
| ----- | ----- | ----- | ----- |
| AC-ORG-01 | Organization ID Generation | System must generate a unique Organization ID automatically when a new organization is created. | A new Organization ID with format `org_xxxxxxxx` is returned in the response. |
| AC-ORG-02 | Uniqueness | Organization ID must be globally unique across all organizations. | No duplicate ID exists in the database. |
| AC-ORG-03 | Immutability | Organization ID must not change even if organization details (e.g., name) are updated. | Updating organization name does not alter the existing Organization ID. |
| AC-ORG-04 | API Response | Organization ID must appear in all API responses related to organization data. | API response includes the correct Organization ID. |
| AC-ORG-05 | Support Reference | Organization ID must be searchable in the internal dashboard for support troubleshooting. | Support team can input Organization ID and retrieve organization data successfully. |

3. ## Functional Requirements

| ID | Requirement Category | Functional Requirement | Priority | Notes |
| ----- | ----- | ----- | ----- | ----- |
| FR-ORG-01 | Organization ID Creation | System must automatically generate a unique Organization ID when a new organization is created. | High | Format: `org_xxxxxxxx` (prefix \+ 8 alphanumeric). |
| FR-ORG-02 | Uniqueness | Organization ID must be globally unique across the system. | High | Use base62/random generator to avoid duplication. |
| FR-ORG-03 | Immutability | Organization ID must remain unchanged even if organization details are updated. | High | Prevents inconsistencies in API and logs. |
| FR-ORG-04 | API Integration | Organization ID must be included in all organization-related API responses. | High | Example: `/api/org/{organization_id}/tickets`. |
| FR-ORG-05 | API Request Support | System must allow filtering and retrieving data by Organization ID in API requests. | Medium | Example: `GET /api/tickets?organization_id=org_ab12cd34`. |
| FR-ORG-06 | Dashboard Display | Organization ID must be visible in the Admin dashboard for reference. | Medium | Shown in organization profile & support tools. |
| FR-ORG-07 | Support Search | Organization ID must be searchable in internal tools for customer support. | Medium | Enables quick troubleshooting. |

4. ## Non-Functional Requirements

| ID | Category | Description |
| ----- | ----- | ----- |
| NFR-ORG-01 | Security | Organization ID must not contain sensitive data and should not be guessable (no sequential IDs). |
| NFR-ORG-02 | Compatibility | Organization ID must be supported across APIs, logs, and dashboards without breaking existing integrations. |
| NFR-ORG-03 | Performance | Lookup or filtering by Organization ID must return results in ≤ 1 second for 95% of requests. |
| NFR-ORG-04 | Reliability | Organization ID must remain consistent and valid throughout the lifetime of the organization. |
| NFR-ORG-05 | Logging & Audit | All API requests using Organization ID must be logged for auditing and debugging purposes. |
| NFR-ORG-06 | Scalability | System must support generating and managing Organization IDs for at least 100,000 organizations without collision. |

5. ## Data Field

| Field Name | Type | Description | Required | Example |
| ----- | ----- | ----- | ----- | ----- |
| organization\_id | String | Unique identifier for the organization. Auto-generated in format `org_` \+ 8 alphanumeric characters. | Yes | `org_ab12cd34` |
| organization\_name | String | Registered name of the organization. | Yes | `PT Logistik Nusantara` |
| created\_at | DateTime | Timestamp when the organization was created. | Yes | `2025-09-22T10:00:00Z` |
| updated\_at | DateTime | Timestamp when the organization data was last updated. | No | `2025-09-22T12:00:00Z` |
| status | Enum | Current status of the organization. | Yes | `Active`, `Inactive` |

6. ## System Flow

| Step | Description | Condition/Notes |
| ----- | ----- | ----- |
| 1 | Admin/Parent creates a new organization via dashboard or API. | Input includes organization name and admin details. |
| 2 | System validates input. | Ensures required fields are provided. |
| 3 | System generates a unique `organization_id`. | Format: `org_xxxxxxxx` (random alphanumeric, base62). |
| 4 | System saves the organization record in the database. | Includes `organization_id`, `organization_name`, `created_at`, etc. |
| 5 | API/Dashboard returns the new organization data. | Response contains `organization_id` for reference. |
| 6 | Organization ID becomes immutable. | Any update to name or details will not affect the ID. |

7. ## Examples

### API Response (Success – Create Organization)

| `{   "organization_id": "org_ab12cd34",   "organization_name": "PT Logistik Nusantara",   "status": "Active",   "created_at": "2025-09-22T10:00:00Z" }` |
| :---- |

### API Response (Error – Duplicate Name Allowed, ID Always Unique)

| `{   "organization_id": "org_xy91kz82",   "organization_name": "PT Logistik Nusantara",   "status": "Active",   "created_at": "2025-09-22T10:01:00Z" }` |
| :---- |

Even if two organizations register with the same name, **Organization ID remains unique**.

### API Response (Error – Invalid Request)

| `{   "error": "Organization name is required",   "code": 400 }` |
| :---- |

