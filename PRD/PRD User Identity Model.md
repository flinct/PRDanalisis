# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: User Identity Model (Display Name, Username, Email, Login Behavior)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: TBA  
**Design Lead**: TBA

---

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-10 | PM Assistant | Initial PRD for identity model and login behavior |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Standardize user identity model with clear separation between Display Name, Username, and Email, and enable login via single identifier field. |
| Scope | Improve usability, admin operability, and searchability across member management and authentication. |

| In Scope | Out of Scope |
| ----- | ----- |
| Display Name, Username, Email model | Password reset flow |
| Login using username or email | Authentication provider integration |
| Member list visibility and search | SSO or OAuth |
| Role-based edit permissions | Session management |

---

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| User identity fields are unclear and overlapping | Confusion in login and UI display |
| Member list lacks username and email visibility | Difficult admin troubleshooting |
| Search is limited to display name | Inefficient user lookup |
| Username edit is not controlled | Risk of identity inconsistency |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Improve login flexibility | ≥95% successful login without admin intervention |
| Improve admin operability | Reduce user lookup time to \<5 seconds |
| Improve identity clarity | 0 ambiguity between display name and login identifier |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a user, I want to login using email or username so that I can access easily. | 1\. Given user enters email, When login, Then system authenticates. 2\. Given user enters username, When login, Then system authenticates. 3\. Given invalid identifier, When login, Then show error "Email atau username tidak ditemukan". 4\. Given correct identifier but wrong password, When login, Then show error "Password salah". |
| US-002 | P0 | As a user, I want a display name so that my name is shown publicly. | 1\. Given user updates display name, When saved, Then UI reflects new name. 2\. Given empty display name, When save, Then block with error "Nama tampilan wajib diisi". |
| US-003 | P0 | As an admin, I want username as internal login identifier so that accounts are consistent. | 1\. Given username exists in same tenant, When create, Then reject with error. 2\. Given username edited by admin, When saved, Then update login identifier. 3\. Given non-admin edit attempt, When edit username, Then show "Akses ditolak". |
| US-004 | P1 | As a user, I want to optionally use email so that I can receive notifications. | 1\. Given user adds email, When valid, Then save successfully. 2\. Given invalid email format, When save, Then show "Format email tidak valid". |
| US-005 | P0 | As an admin, I want to search members by multiple identifiers so that I can find users quickly. | 1\. Given search input matches display name, When search, Then show result. 2\. Given matches username, When search, Then show result. 3\. Given matches email, When search, Then show result. 4\. Given no match, When search, Then show empty state. |
| US-006 | P0 | As an admin, I want to see username and email in member list so that I can manage users effectively. | 1\. Given member list loads, Then show display name, username, email. 2\. Given email empty, Then show "-" placeholder. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Identity Model | FR-001: System MUST support 3 identity fields: Display Name, Username, Email. |
| Identity Rules | FR-002: Username MUST be unique per tenant. |
| Identity Rules | FR-003: Username MUST allow only alphanumeric and underscore. |
| Identity Rules | FR-004: Username MUST NOT be in email format. |
| Identity Rules | FR-005: Email is optional except for Owner role. |
| Login | FR-006: System MUST support login via single input field. |
| Login | FR-007: System MUST detect input as email or username automatically. |
| Login | FR-008: System MUST prioritize exact match for username before email fallback. |
| Display Name | FR-009: Users MUST be able to edit Display Name. |
| Username | FR-010: Only Admin MUST be able to edit Username. |
| Username | FR-011: System MUST log username changes in audit logs. |
| Email | FR-012: Users MUST be able to add or edit Email. |
| Member List | FR-013: Member list MUST display Display Name, Username, Email. |
| Member List | FR-014: System MUST support search by Display Name, Username, Email. |
| Member List | FR-015: Search MUST be case insensitive. |
| Member List | FR-016: Search MUST return partial match results. |
| Validation | FR-017: System MUST validate username uniqueness on create and update. |
| Validation | FR-018: System MUST validate email format if provided. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Invalid Username | Reject input | "Username hanya boleh huruf, angka, dan underscore" |
| EH-002 | Duplicate Username | Block submission | "Username sudah digunakan" |
| EH-003 | Invalid Email | Reject input | "Format email tidak valid" |
| EH-004 | Unauthorized Edit | Block action | "Akses ditolak" |
| EH-005 | Login Not Found | Reject login | "Email atau username tidak ditemukan" |
| EH-006 | Wrong Password | Reject login | "Password salah" |

---

## **8\. Edge Cases**

| ID | Scenario | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Username changed while user active | Force re-login | "Sesi berakhir, silakan login ulang" |
| EC-002 | Username similar to email format | Reject creation | "Username tidak boleh format email" |
| EC-003 | Multiple users with same display name | Allow | No restriction |
| EC-004 | Email empty | Allow except owner | Show "-" in UI |
| EC-005 | Search input empty | Return full list | Default state |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Login Input | Single field for email or username | User input identifier → click login → validate → success or error | US-001 |
| Profile Settings | Edit Display Name and Email | User open settings → edit → save → show success | US-002, US-004 |
| Member List Table | Show identity columns | Load list → display name, username, email → searchable | US-005, US-006 |
| Search Bar | Multi-field search | Input keyword → filter results in real time | US-005 |
| Username Field (Admin) | Editable only by admin | Admin edit → save → update identity | US-003 |

---

## **10\. Field & Validation**

| Field | Type | Validation | Required |
| ----- | ----- | ----- | ----- |
| Display Name | String | Min 1 char, max 100 char | Yes |
| Username | String | Alphanumeric \+ underscore only, unique per tenant | Yes |
| Email | String | Valid email format | Optional (Required for Owner) |
| Login Identifier | String | Accept email or username | Yes |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Search response \<2 seconds |
| Security | Username and email stored securely |
| Reliability | 99.9% login success rate |
| Audit | All username changes logged |
| Accessibility | Keyboard navigable forms |

---

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Existing auth system | Engineering | High | Backward compatibility |
| Username migration | Engineering | Medium | Data validation script |
| User confusion | Product | Medium | Clear UI labeling |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Source |
| ----- | ----- | ----- | ----- |
| Login success rate | ≥95% | 30 days | Auth logs |
| Search success rate | ≥98% | 30 days | Analytics |
| Admin lookup time | \<5 sec | 30 days | UX test |

---

## **14\. Future Considerations**

| Topic | Reason |
| ----- | ----- |
| SSO login | Enterprise need |
| Username alias | Flexibility |
| Email verification | Security improvement |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Email optional | Cannot rely on email-based recovery |
| Username immutable by user | Requires admin intervention |

---

## **16\. Appendix**

| Term | Definition |
| ----- | ----- |
| Display Name | Public-facing user name |
| Username | Internal login identifier |
| Email | Optional login and notification identifier |

