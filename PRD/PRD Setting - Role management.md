# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Roles Management & Custom RBAC  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-04-09 | Yusril Ibnu Maulana | Initial PRD for create role, edit role, default roles, custom RBAC, and data privacy access. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a structured and user-friendly Roles Management system so admins can create, edit, and manage access control without directly handling raw permission keys. |
| Scope | Support default roles, custom roles, grouped permission UI, visibility scope selection, action checkboxes, data privacy masking, dependency validation, and role assignment safety. |

### **Scope**

| In Scope | Out of Scope |
| ----- | ----- |
| Create new custom role. | Per-user permission override outside role assignment. |
| Edit existing roles. | Field-level permission rules beyond current grouped model. |
| Keep Admin, Supervisor, and Agent as default roles. | Dynamic approval workflow for role changes. |
| Protect default roles from deletion. | SCIM, SSO role sync, and external IAM integration. |
| Make Supervisor and Agent editable. | Historical retroactive permission recomputation for past audit views. |
| Lock Admin as full access and non-editable permission set. | Advanced conditional policies based on tags, channel, or time. |
| Configure grouped RBAC by module. | Backend raw permission editor for end users. |
| Configure data privacy access for phone and email. | Additional privacy fields beyond phone and email. |
| Persist role audit logs. | Cross-workspace shared role templates. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Raw permission keys are too technical for admins to configure safely. | High risk of misconfiguration, support dependency, and inconsistent roles. |
| PS-002 | Existing roles are not managed in a single, structured role editor. | Slow onboarding, poor governance, and limited scalability for new business needs. |
| PS-003 | Default roles are needed for fast setup, but some of them also require controlled customization. | Teams cannot adapt access to their workflow without manual engineering support. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Provide a complete role editor for admins. | 100% of role creation and role updates can be completed from Roles Settings without backend intervention. |
| Make RBAC easier to understand. | Reduce average time to configure a role to under 10 minutes in usability testing. |
| Preserve safe system defaults. | 0 deletions of protected default roles and 0 unauthorized changes to Admin full access. |
| Support flexible operational setup. | At least 80% of workspaces use either edited default roles or at least 1 custom role within 60 days. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to create a new custom role so that I can support different operational teams. | 1\. Given I open Roles Settings, When I click “Buat role”, Then a role detail page opens with role name, description, and permission sections. 2\. Given I enter a valid role name and save, When creation succeeds, Then the new role appears in the roles list and can be assigned to members. 3\. Given I try to save without a valid role name, When validation runs, Then the system blocks save and shows “Nama role wajib diisi”. |
| US-002 | P0 | As an Admin, I want to edit an existing custom role so that I can update access when workflows change. | 1\. Given I open an existing custom role, When I change name, description, or permissions, Then I can save the updated role. 2\. Given I save valid changes, When the request succeeds, Then the updated permissions apply to all members using that role. 3\. Given the save fails, When the request returns an error, Then the previous configuration remains unchanged and an error message is shown. |
| US-003 | P0 | As an Admin, I want the system to provide 3 default roles so that a workspace can start quickly. | 1\. Given a new workspace or existing workspace with roles enabled, When I open Roles Settings, Then I see Admin, Supervisor, and Agent roles by default. 2\. Given these default roles exist, When I view the role list, Then they are clearly marked as default roles. 3\. Given a default role exists, When I try to delete it, Then deletion is blocked with “Role bawaan tidak dapat dihapus”. |
| US-004 | P0 | As an Admin, I want Admin role permissions locked to full access so that the highest role always remains safe and predictable. | 1\. Given I open the Admin role, When I view permissions, Then all modules show full access selected. 2\. Given I try to modify Admin permissions, When interaction occurs, Then permission controls are disabled or read-only. 3\. Given I edit Admin role name or description, When save succeeds, Then non-permission metadata updates are saved. |
| US-005 | P0 | As an Admin, I want Supervisor and Agent default roles to be editable so that I can adapt them to team operations. | 1\. Given I open Supervisor or Agent role, When I edit permissions, Then the permission controls are available. 2\. Given I save valid changes, When the request succeeds, Then all assigned members inherit the updated access. 3\. Given I do not have permission to manage roles, When I open the page, Then the page is blocked or read-only. |
| US-006 | P0 | As an Admin, I want grouped permission sections so that RBAC is easier to understand than raw permission keys. | 1\. Given I open role detail, When the page loads, Then permissions are grouped into modules such as Inbox, Ticket, Broadcast, Analytics, Client Contacts, Lead, Settings, and Data Privacy. 2\. Given a module has visibility scope, When shown, Then scope uses radio options with helper descriptions. 3\. Given a module has actions, When shown, Then actions use checkboxes with a section-level “Pilih semua”. |
| US-007 | P0 | As an Admin, I want visibility scope and actions separated so that access is clear and safer to configure. | 1\. Given I configure Inbox, Ticket, Analytics, or Client Contacts, When I choose a visibility option, Then only one visibility option can be active at a time. 2\. Given I configure module actions, When I check or uncheck an action, Then the change affects only that action group. 3\. Given a module is disabled by top switch, When off, Then all nested settings in that section are disabled. |
| US-008 | P0 | As an Admin, I want dependency rules enforced automatically so that invalid permission combinations cannot be saved. | 1\. Given I enable “Claim tickets”, When required dependencies are missing, Then the system auto-enables or blocks incompatible states based on defined rules. 2\. Given I select “Assigned tickets only”, When I inspect ticket actions, Then actions that require queue or team-level scope are disabled if not valid. 3\. Given the final configuration is invalid, When I click save, Then the system blocks save and highlights the invalid dependency. |
| US-009 | P0 | As an Admin, I want data privacy settings for phone and email so that sensitive information can be masked or shown in full per role. | 1\. Given I open Data Privacy section, When configuring Phone, Then I can choose exactly one option: “Full” or “Masked”. 2\. Given I open Data Privacy section, When configuring Email, Then I can choose exactly one option: “Full” or “Masked”. 3\. Given a role is set to Masked, When members using that role view contact data, Then phone or email is masked in the product UI. |
| US-010 | P1 | As an Admin, I want to duplicate a role so that I can create similar roles faster. | 1\. Given I open a role action menu, When I click “Duplikasi role”, Then a new draft role is created from the selected role. 2\. Given duplicated role opens, When shown, Then the name is prefilled and requires a unique final name before saving. 3\. Given duplicated role save succeeds, When completed, Then the new role is independent from the source role. |
| US-011 | P1 | As an Admin, I want to delete custom roles so that old or unused roles can be removed. | 1\. Given I open a custom role action menu, When I click “Hapus role”, Then a confirmation dialog appears. 2\. Given the role is assigned to active members, When I confirm deletion, Then the system blocks deletion until those members are reassigned to another role. 3\. Given the role is unassigned, When deletion succeeds, Then the role disappears from the role list and an audit record is created. |
| US-012 | P1 | As an Admin, I want to restrict all sections quickly so that I can create a minimal role faster. | 1\. Given I open role detail, When I click “Batasi semua”, Then all module switches turn off except mandatory protected defaults for the Admin role. 2\. Given I use “Batasi semua” on a non-Admin role, When completed, Then the role becomes highly restricted but still saveable if minimum required fields are valid. 3\. Given I use “Batasi semua”, When the action completes, Then the UI shows the new restricted state immediately. |
| US-013 | P1 | As an Admin, I want audit logs for role changes so that permission changes are traceable. | 1\. Given I create, edit, duplicate, or delete a role, When the action succeeds, Then an audit entry is stored with actor, timestamp, role name, and changed fields. 2\. Given a permission matrix changes, When saved, Then audit captures old and new values. 3\. Given an action fails, When no data changes, Then no success audit is created. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Role Model | FR-001: System MUST provide exactly 3 default roles: Admin, Supervisor, and Agent. FR-002: System MUST mark default roles distinctly in the role list. FR-003: System MUST allow creation of unlimited custom roles within workspace policy limits. FR-004: System MUST allow editing role name and description for all roles, including default roles. FR-005: System MUST allow permission editing for Supervisor and Agent default roles. FR-006: System MUST NOT allow permission editing for Admin role. FR-007: System MUST NOT allow deletion of Admin, Supervisor, or Agent default roles. FR-008: System MUST allow deletion only for custom roles that are not currently assigned to any member. |
| Role Detail Form | FR-009: Role detail page MUST contain role name and description fields. FR-010: Role name MUST be required. FR-011: Role description MUST be optional. FR-012: Changes MUST remain draft until user clicks “Simpan”. FR-013: “Batal” MUST discard unsaved changes and return to last saved state or previous page based on navigation origin. |
| Permission Grouping | FR-014: Permissions MUST be grouped by module in separate accordion sections. FR-015: Initial modules in scope MUST include Inbox, Ticket, Broadcast, Analytics, Client Contacts, Lead, Settings, and Data Privacy. FR-016: Each module MUST support a top-level enable or disable switch, except where always-on module behavior is required by design. FR-017: Disabled modules MUST collapse or render nested controls non-interactive. |
| Visibility Scope Pattern | FR-018: Modules with scoped visibility MUST use radio controls and allow exactly one selection. FR-019: Inbox visibility MUST support: All conversations, Pull conversations, Conversations assigned to them or their teams only, and All conversations except assigned to selected team inbox. FR-020: Ticket visibility MUST support: All tickets, Team tickets, Assigned tickets only, and Assigned tickets plus team queue. FR-021: Analytics visibility MUST support: All statistics, Team statistics, Assigned only, and All statistics except assigned to selected team inbox. FR-022: Client Contacts visibility MUST support: All client contacts, Team client contacts, and Own client contacts. FR-023: Visibility option descriptions MUST explain the resulting scope in simple language. |
| Action Pattern | FR-024: Modules with action permissions MUST use checkboxes under an “Actions” section. FR-025: Each action row MUST map to one or more backend permission keys. FR-026: Section-level “Pilih semua” MUST only affect actions in that module section and MUST NOT affect visibility radios. FR-027: Broadcast section MUST support actions for Create broadcasts, Update broadcasts, and Delete broadcasts. FR-028: Lead section MUST support actions for Create leads, Update all leads, Update own leads, Update team leads, Delete leads, and Change team inbox. FR-029: Settings section MUST support grouped actions for general settings and nested settings items as per design. FR-030: Data Privacy MUST use radio controls, not checkboxes, for Phone and Email masking modes. |
| Ticket Permissions | FR-031: Inbox module MUST support action permissions for Send messages, Change status, Manage assignee, Manage macros, Manage notes, Mark as read, Mark as spam, Pin conversation, Pin message, Reopen conversation, Star conversation, View client data, Take screenshot, Assign conversation, Edit own message, Delete own message, Edit team message, and Delete team message. FR-032: Ticket visibility and ticket action permissions MUST integrate with Ticket Access behavior defined in the ticket RBAC design. FR-033: “Claim tickets” MUST represent taking unassigned tickets from team queue. FR-034: “Return tickets to queue” MUST represent removing assignment and moving ticket back to unassigned queue. |
| Data Privacy | FR-035: Phone privacy MUST support exactly two modes: Full and Masked. FR-036: Email privacy MUST support exactly two modes: Full and Masked. FR-037: Selecting Masked MUST hide full values in all affected product surfaces for users with that role. FR-038: Selecting Full MUST allow full display subject to module access and client data visibility rules. |
| Dependency Rules | FR-039: System MUST validate permission dependencies before save. FR-040: “Claim tickets” MUST require ticket visibility mode that includes queue access. FR-041: “Assign tickets” MUST require Ticket visibility mode All tickets or Team tickets or Assigned tickets plus team queue, depending on final policy mapping. FR-042: “Return tickets to queue” MUST require Ticket action Claim tickets or Assign tickets, based on final permission dependency rule. FR-043: “Pull conversations” visibility mode MUST expose queue-oriented conversation handling behavior. FR-044: If a visibility or action selection becomes invalid due to another change, the UI MUST auto-disable or block save with clear guidance. FR-045: System MUST ensure at least one valid visibility mode remains selected in modules that require scoped access. |
| Default Role Rules | FR-046: Admin role MUST always resolve to full access for all configurable modules in scope. FR-047: Supervisor default role MUST ship with a predefined matrix that can later be edited by admin users. FR-048: Agent default role MUST ship with a predefined matrix that can later be edited by admin users. FR-049: Default role matrices MUST be documented and visible to product, design, QA, and engineering for consistent rollout. |
| Role Assignment Safety | FR-050: When a role is edited and saved, all members assigned to that role MUST inherit the new role permissions immediately or at next permission refresh within defined latency. FR-051: System MUST show a warning before saving changes that affect existing members. FR-052: When deleting a custom role, system MUST prevent deletion if any member is still assigned to that role. FR-053: System MUST require reassignment to another existing role before deletion of an assigned custom role. |
| Auditability | FR-054: System MUST store audit logs for create, edit, duplicate, and delete role actions. FR-055: Audit entries MUST include actor, role identifier, role name, changed fields, timestamp, and result status. FR-056: Audit entries MUST include permission matrix differences for role updates. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Missing role name | Prevent save. Highlight role name field. | Show “Nama role wajib diisi”. |
| EH-002 | Duplicate role name | Prevent save if name already exists in same workspace. | Show “Nama role sudah digunakan”. |
| EH-003 | Invalid permission dependency | Prevent save and identify invalid item. | Show “Pengaturan role tidak valid”. |
| EH-004 | Attempt to delete default role | Block delete action. | Show “Role bawaan tidak dapat dihapus”. |
| EH-005 | Attempt to edit Admin permissions | Disable controls and keep state unchanged. | Show read-only UI. |
| EH-006 | Delete custom role still assigned | Block delete until members are reassigned. | Show “Role masih dipakai anggota”. |
| EH-007 | Failed role save | Keep draft state. Preserve user changes in UI. | Show “Gagal menyimpan role. Coba lagi”. |
| EH-008 | Failed role load | Show retry state. | Show “Gagal memuat detail role”. |
| EH-009 | Unauthorized access | Block page access or show read-only if policy allows. | Show “Akses ditolak”. |
| EH-010 | Invalid excluded team inbox | Prevent save or clear invalid value if deleted externally. | Show “Team inbox tidak valid”. |
| EH-011 | Permission mapping missing | Block save and log internal error. | Show “Konfigurasi permission tidak tersedia”. |
| EH-012 | Restrict all action failed | Keep previous state and restore UI. | Show “Gagal membatasi semua permission”. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Workspace has only 3 default roles and no custom roles. | Page still loads normally. | Role list shows only Admin, Supervisor, Agent. |
| EC-002 | Admin edits Supervisor while another admin edits same role. | Last valid save wins or conflict is surfaced based on system concurrency policy. | Show conflict guidance if supported. |
| EC-003 | A team inbox selected in a visibility exclusion rule is later deleted. | Role becomes invalid until reviewed or auto-cleared based on final backend rule. | Highlight affected selector. |
| EC-004 | A custom role is duplicated from Admin. | New role copies current effective configuration but remains editable and deletable. | Name field prefilled and must be unique. |
| EC-005 | Restrict all is used on Supervisor or Agent. | All editable modules turn off or minimal state remains valid. | UI updates immediately. |
| EC-006 | Phone is Masked but Email is Full. | Mixed privacy modes are allowed. | UI keeps each section independent. |
| EC-007 | A module switch is off but previous actions were selected. | Previous actions remain stored in draft only if product wants restore-on-reenable, otherwise cleared on switch off. | Must be consistent across all modules. |
| EC-008 | A role with excluded team visibility is assigned to users with no team membership. | Result follows explicit scope rules and may return empty data. | No crash. Empty states still valid. |
| EC-009 | A role has analytics access but no report download capability if report action exists later. | Page remains accessible with limited actions. | Read-only analytics UI if needed. |
| EC-010 | A member using a role is active in session when role changes. | Access refreshes without requiring manual logout beyond standard session policy. | Non-blocking refresh behavior. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Roles List | List of roles with default role indicator, custom role indicator, and action menu. | Admin opens Roles page, reviews role list, selects a role or clicks “Buat role”. | US-001, US-003, US-011 |
| Role Detail Header | Page title, save, cancel, restrict all, and role metadata summary. | Admin edits role then clicks “Simpan” or “Batal”. | US-001, US-002, US-012 |
| Role Metadata Card | Form card for “Nama role” and “Deskripsi”. | Admin fills role name and description before configuring permissions. | US-001, US-002 |
| Inbox Section | Accordion for conversation visibility and actions. | Admin selects one visibility radio and checks actions. | US-006, US-007 |
| Ticket Section | Accordion for ticket visibility and actions including claim flow and queue behavior. | Admin selects one visibility radio and checks ticket actions. | US-006, US-007, US-008 |
| Broadcast Section | Accordion for broadcast actions only. | Admin enables or disables broadcast actions. | US-006 |
| Analytics Section | Accordion for analytics visibility only, with no empty enabled state. | Admin selects analytics visibility or turns module off. | US-006 |
| Client Contacts Section | Accordion for client contact visibility and actions. | Admin configures contacts scope and CRUD actions. | US-006 |
| Lead Section | Accordion for lead actions. | Admin configures lead actions. | US-006 |
| Settings Section | Accordion for settings actions, including nested items for grouped system settings. | Admin expands settings and selects relevant management permissions. | US-006 |
| Data Privacy Section | Accordion for Phone and Email masking rules using radio inputs. | Admin selects “Full” or “Masked” for each data type. | US-009 |
| Default Role Protection UI | Non-deletable state and Admin permission lock state. | Admin sees protected states on default roles and read-only Admin permissions. | US-003, US-004 |
| Duplicate Role Flow | Action menu item that opens duplicated role draft. | Admin duplicates then renames and saves. | US-010 |
| Delete Role Confirmation | Confirmation modal with member assignment warning. | Admin clicks delete and sees blocking or confirmation state. | US-011 |
| Empty State | Empty state for role list if only defaults or if custom roles absent. | Page still shows default roles and a CTA to create new role. | US-001 |
| Error State | Error state for failed role detail or failed role list load. | User sees retry action and preserved last safe state if available. | US-002, US-013 |

## **10\. Field & Validation**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| Role Name | Text | 1\. Required. 2\. Unique within workspace. 3\. Min 2 characters. 4\. Max 50 characters. 5\. Must trim leading and trailing spaces. | Yes |
| Description | Textarea | 1\. Optional. 2\. Max 300 characters. 3\. Plain text only. | No |
| Module Enabled | Switch | 1\. Boolean per module. 2\. Off disables nested controls. | No |
| Inbox Visibility | Radio | 1\. Exactly one option when module enabled. 2\. If “All conversations except assigned to” selected, team inbox selector is required. | Conditional |
| Inbox Excluded Team Inbox | Dropdown search | 1\. Required only for exclusion mode. 2\. Must be a valid active team inbox ID. | Conditional |
| Ticket Visibility | Radio | 1\. Exactly one option when module enabled. 2\. “Assigned tickets \+ team queue” enables queue-aware scope. | Conditional |
| Analytics Visibility | Radio | 1\. Exactly one option when module enabled. | Conditional |
| Client Contacts Visibility | Radio | 1\. Exactly one option when module enabled. | Conditional |
| Action Checkbox | Checkbox | 1\. Boolean. 2\. Must satisfy dependency rules before save. | No |
| Phone Privacy | Radio | 1\. Must be Full or Masked. 2\. Exactly one value. | Yes |
| Email Privacy | Radio | 1\. Must be Full or Masked. 2\. Exactly one value. | Yes |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Role list load P95 \<= 2 seconds. Role detail load P95 \<= 2 seconds. Save action P95 \<= 2 seconds. |
| Reliability | Permission changes must be applied consistently to all assigned members with 99.9% successful propagation. |
| Security | Only authorized admins can create, edit, duplicate, or delete roles. Admin role permissions are protected from unauthorized modification. |
| Observability | All role mutations must emit structured audit logs and traceable events. |
| Accessibility | All radio buttons, checkboxes, switches, and accordions must support keyboard navigation and visible focus states. |
| Scalability | System must support at least 100 roles per workspace without degraded role list performance. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Permission mapping layer between grouped UI and raw backend keys | Engineering | High | Maintain a single source of truth mapping table and QA regression tests. |
| Existing role model compatibility with new grouped RBAC UI | Engineering | High | Provide migration logic for default roles and current assigned members. |
| Misconfiguration by admins | Product | Medium | Use safe defaults, helper text, dependency validation, and protected default roles. |
| Concurrency on role editing | Engineering | Medium | Add versioning or conflict resolution strategy. |
| Missing dependency rules | Product and Engineering | High | Define and enforce explicit validation before save. |
| Data privacy masking inconsistency across modules | Engineering | High | Centralize masking behavior at permission resolution layer. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Role creation success rate | \>= 95% | 30 days | Product analytics |
| Average time to configure a role | \<= 10 minutes | 30 days | UX study and event tracking |
| Default role protection incidents | 0 | Ongoing | Audit logs |
| Role save error rate | \< 2% | Ongoing | Backend logs |
| Workspaces using custom roles | \>= 80% | 60 days | Product analytics |
| Unauthorized role mutation attempts blocked | 100% | Ongoing | Security logs |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Role presets beyond Admin, Supervisor, Agent | Faster setup for Finance, QA, Broadcast Operator, and other business functions. |
| Raw permission preview for advanced admins | Better debugging and governance for enterprise customers. |
| Import and export role templates | Faster multi-workspace rollout. |
| Audit history viewer in UI | Easier permission governance for admins. |
| Conditional permissions | Support more advanced enterprise policy needs. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Admin permissions are intentionally locked. | Reduces flexibility but keeps top-level governance safe. |
| Default roles cannot be deleted. | Some customers may want full replacement, but this is blocked to preserve safe onboarding. |
| Grouped RBAC abstracts raw backend permission keys. | Advanced debugging may require internal tooling. |
| Data privacy only covers phone and email in this phase. | Other PII masking remains outside this scope. |

## **16\. Appendix**

### Appendix A. Default Role Protection Rules

| Rule | Description |
| ----- | ----- |
| Protected Roles | Admin, Supervisor, and Agent are system default roles. |
| Deletion | Protected roles cannot be deleted. |
| Permission Edit | Admin permissions cannot be edited. Supervisor and Agent permissions can be edited. |
| Metadata Edit | Name and description can be edited for all default roles. |

### Appendix B. Default Role Matrix: Admin

| Item | Value |
| ----- | ----- |
| Role Type | Default Role |
| Editable Permissions | No |
| Deletable | No |
| Section Switches | All ON |
| Visibility | Highest access selected in all scoped modules |
| Actions | All ON |
| Data Privacy | Phone \= Full, Email \= Full |
| Variables | All available system variables, including all Ticket RBAC variables currently supported by the role system |

---

### Appendix C. Default Role Matrix: Supervisor

#### C.1 Section Switches

| Module | State | Variable |
| ----- | ----- | ----- |
| Inbox | ON | `conversation:*` |
| Ticket | ON | `ticket:*` |
| Broadcast | ON | `broadcast:*` |
| Analytics | ON | `statistic:*` |
| Client Contacts | ON | `client_contact:*` |
| Lead | ON | `lead:*` |
| Settings | ON | `setting:*` |
| Data Privacy | ON | `privacy:*` |

#### C.2 Visibility Selectors

| Module | Selected Option | Variable |
| ----- | ----- | ----- |
| Inbox | All conversations | `conversation_access_mode=all`, `conversation:read`, `conversation:pull` |
| Ticket | All tickets | `ticket_access_mode=all`, `ticket:read`, `ticket:read_team`, `ticket:read_assigned`, `ticket:view_queue` |
| Analytics | All statistics | `analytics_access_mode=all`, `statistic:read` |
| Client Contacts | All client contacts | `client_contact_access_mode=all`, `client_contact:read` |
| Data Privacy \- Phone | Full | `phone_privacy_mode=full`, `privacy:view_full_phone` |
| Data Privacy \- Email | Full | `email_privacy_mode=full`, `privacy:view_full_email` |

#### C.3 Actions

| Module | Action | State | Variable |
| ----- | ----- | ----- | ----- |
| Inbox | Send messages | ON | `conversation:send_message` |
| Inbox | Manage assignee | ON | `conversation:manage_asignee` |
| Inbox | Manage macros | ON | `conversation:manage_macros` |
| Inbox | Manage notes | ON | `conversation:manage_notes` |
| Inbox | Change status | ON | `conversation:change_status` |
| Inbox | Mark as read | ON | `conversation:mark_read` |
| Inbox | Mark as spam | ON | `conversation:mark_spam` |
| Inbox | Pin conversation | ON | `conversation:pin_convo` |
| Inbox | Pin message | ON | `conversation:pin_message` |
| Inbox | Reopen conversation | ON | `conversation:reopen` |
| Inbox | Star conversation | ON | `conversation:star` |
| Inbox | View client data | ON | `conversation:read_client_data` |
| Inbox | Take screenshot | ON | `conversation:take_screenshot` |
| Inbox | Assign conversation | ON | `conversation:assign` |
| Inbox | Edit team message | ON | `conversation:edit_team_message` |
| Inbox | Delete team message | ON | `conversation:delete_team_message` |
| Ticket | Create tickets | ON | `ticket:create` |
| Ticket | Update tickets | ON | `ticket:update` |
| Ticket | Change ticket status | ON | `ticket:change_status` |
| Ticket | Assign tickets | ON | `ticket:assign` |
| Ticket | Claim tickets | ON | `ticket:claim` |
| Ticket | Return tickets to queue | ON | `ticket:return_to_queue` |
| Ticket | Send ticket messages | ON | `ticket:send_message` |
| Ticket | Delete tickets | ON | `ticket:delete` |
| Broadcast | View broadcasts | ON | `broadcast:read` |
| Broadcast | Create broadcasts | ON | `broadcast:create` |
| Broadcast | Update broadcasts | ON | `broadcast:update` |
| Broadcast | Delete broadcasts | ON | `broadcast:delete` |
| Client Contacts | Create client contacts | ON | `client_contact:create` |
| Client Contacts | Update client contacts | ON | `client_contact:update` |
| Client Contacts | Delete client contacts | ON | `client_contact:delete` |
| Lead | Create leads | ON | `lead:create` |
| Lead | Update all leads | ON | `lead:update` |
| Lead | Update own leads | ON | `lead:update_own` |
| Lead | Update team leads | ON | `lead:update_team` |
| Lead | Delete leads | ON | `lead:delete` |
| Lead | Change team inbox | ON | `lead:change_team_inbox` |
| Settings | Manage general settings | ON | `setting:manage_general_setting` |
| Settings | Manage live chat settings | ON | `setting:manage_live_chat` |
| Settings | Manage shared macro settings | ON | `setting:manage_shared_macro` |
| Settings | Manage tags | ON | `setting:manage_tags` |
| Settings | Manage team inbox | ON | `setting:manage_team_inbox` |
| Settings | Manage WhatsApp Web settings | ON | `setting:manage_whatsapp_web` |
| Settings | Manage roles settings | ON | `roles:*`, `roles:read` |
| Settings | Manage account channel | ON | `account_channel:*` |
| Settings | Manage members settings | ON | `member:*` |
| Settings | Manage teams | ON | `team:*` |
| Settings | Manage shift hours | ON | `shift_hours:*` |
| Settings | Manage ticket type settings | ON | `ticket_type:*` |
| Settings | Manage macros | ON | `macro:*` |
| Settings | Manage assignment settings | ON | `assignment:*` |
| Settings | Manage company | ON | `company:*` |
| Settings | Manage widget settings | OFF | `setting:manage_widget` |
| Settings | Manage add-ons settings | OFF | `setting:manage_addons` |
| Settings | Manage subscription settings | OFF | `setting:manage_subscription` |
| Settings | Manage webhook settings | OFF | `setting:manage_webhook` |
| Settings | Manage shipping settings | OFF | `setting:manage_shipping` |
| Settings | Manage SLA settings | OFF | `setting:manage_sla` |
| Settings | Manage CSAT settings | OFF | `setting:csat` |
| Settings | Manage ticket type settings via setting namespace | OFF | `setting:manage_ticket_type` |
| Settings | Manage members settings via setting namespace | OFF | `setting:manage_member` |

---

### Appendix D. Default Role Matrix: Agent

#### D.1 Section Switches

| Module | State | Variable |
| ----- | ----- | ----- |
| Inbox | ON | `conversation:*` |
| Ticket | ON | `ticket:*` |
| Broadcast | ON | `broadcast:*` |
| Analytics | OFF | `statistic:*` |
| Client Contacts | OFF | `client_contact:*` |
| Lead | OFF | `lead:*` |
| Settings | OFF | `setting:*` |
| Data Privacy | ON | `privacy:*` |

#### D.2 Visibility Selectors

| Module | Selected Option | Variable |
| ----- | ----- | ----- |
| Inbox | Pull conversations | `conversation_access_mode=pull`, `conversation:read`, `conversation:pull` |
| Ticket | Assigned tickets \+ team queue | `ticket_access_mode=assigned_plus_queue`, `ticket:read`, `ticket:read_assigned`, `ticket:view_queue` |
| Data Privacy \- Phone | Masked | `phone_privacy_mode=masked` |
| Data Privacy \- Email | Masked | `email_privacy_mode=masked` |

#### D.3 Actions

| Module | Action | State | Variable |
| ----- | ----- | ----- | ----- |
| Inbox | Send messages | ON | `conversation:send_message` |
| Inbox | Manage assignee | OFF | `conversation:manage_asignee` |
| Inbox | Manage macros | OFF | `conversation:manage_macros` |
| Inbox | Manage notes | OFF | `conversation:manage_notes` |
| Inbox | Change status | ON | `conversation:change_status` |
| Inbox | Mark as read | ON | `conversation:mark_read` |
| Inbox | Mark as spam | ON | `conversation:mark_spam` |
| Inbox | Pin conversation | ON | `conversation:pin_convo` |
| Inbox | Pin message | ON | `conversation:pin_message` |
| Inbox | Reopen conversation | ON | `conversation:reopen` |
| Inbox | Star conversation | ON | `conversation:star` |
| Inbox | View client data | OFF | `conversation:read_client_data` |
| Inbox | Take screenshot | ON | `conversation:take_screenshot` |
| Inbox | Assign conversation | ON | `conversation:assign` |
| Inbox | Edit own message | ON | `conversation:edit_own_message` |
| Inbox | Delete own message | ON | `conversation:delete_own_message` |
| Ticket | Create tickets | ON | `ticket:create` |
| Ticket | Update tickets | ON | `ticket:update` |
| Ticket | Change ticket status | ON | `ticket:change_status` |
| Ticket | Assign tickets | OFF | `ticket:assign` |
| Ticket | Claim tickets | ON | `ticket:claim` |
| Ticket | Return tickets to queue | OFF | `ticket:return_to_queue` |
| Ticket | Send ticket messages | ON | `ticket:send_message` |
| Ticket | Delete tickets | OFF | `ticket:delete` |
| Broadcast | View broadcasts | ON | `broadcast:read` |
| Broadcast | Create broadcasts | OFF | `broadcast:create` |
| Broadcast | Update broadcasts | OFF | `broadcast:update` |
| Broadcast | Delete broadcasts | OFF | `broadcast:delete` |
| Client Contacts | Create client contacts | OFF | `client_contact:create` |
| Client Contacts | Update client contacts | OFF | `client_contact:update` |
| Client Contacts | Delete client contacts | OFF | `client_contact:delete` |
| Lead | Create leads | OFF | `lead:create` |
| Lead | Update all leads | OFF | `lead:update` |
| Lead | Update own leads | OFF | `lead:update_own` |
| Lead | Update team leads | OFF | `lead:update_team` |
| Lead | Delete leads | OFF | `lead:delete` |
| Lead | Change team inbox | OFF | `lead:change_team_inbox` |
| Settings | Manage general settings | OFF | `setting:manage_general_setting` |
| Settings | Manage live chat settings | OFF | `setting:manage_live_chat` |
| Settings | Manage shared macro settings | OFF | `setting:manage_shared_macro` |
| Settings | Manage tags | OFF | `setting:manage_tags` |
| Settings | Manage team inbox | OFF | `setting:manage_team_inbox` |
| Settings | Manage WhatsApp Web settings | OFF | `setting:manage_whatsapp_web` |
| Settings | Manage roles settings | OFF | `roles:*` |
| Settings | View roles | ON | `roles:read` |
| Settings | Read account channel | ON | `account_channel:read` |
| Settings | View shift hours | ON | `shift_hours:read` |
| Settings | View ticket types | ON | `ticket_type:read` |
| Settings | View macros | ON | `macro:read` |
| Settings | View assignments | ON | `assignment:read` |
| Settings | View members | ON | `member:read` |
| Settings | View teams | ON | `team:read` |
| Settings | Update company | ON | `company:update` |

### Appendix E. UI Label to System Variable Translation Matrix

#### Appendix E.1 Status Legend

| Status | Meaning |
| ----- | ----- |
| Existing | Already exists in current system permission model. |
| New | New permission added in this RBAC redesign. |

---

#### Appendix E.2 Section Header Switch Mapping

| Module | UI Element Type | UI Label | System Variable / Resolver | Status |
| ----- | ----- | ----- | ----- | ----- |
| Inbox | Section switch | Inbox | `conversation:*` | New |
| Ticket | Section switch | Ticket | `ticket:*` | Existing |
| Broadcast | Section switch | Broadcast | `broadcast:*` | Existing |
| Analytics | Section switch | Analytics | `statistic:*` | Existing |
| Client Contacts | Section switch | Client Contacts | `client_contact:*` | Existing |
| Lead | Section switch | Lead | `lead:*` | Existing |

---

### Appendix E.3 Inbox Translation Matrix

#### A. Visibility

| UI Label | UI Element Type | System Variable / Resolver | Raw Permission Mapping |
| ----- | ----- | ----- | ----- |
| All conversations | Radio | `conversation_access_mode = all` | `conversation:read` |
| Pull conversations | Radio | `conversation_access_mode = pull` | `conversation:read`, `conversation:pull` |
| Conversations assigned to them or their teams only | Radio | `conversation_access_mode = assigned_or_team_only` | `conversation:readconversation:read_team` |
| All conversations except assigned to | Radio | `conversation_access_mode = all_except_team` | `conversation:read` |
| Select or search Team inbox | Dropdown | `conversation_access_excluded_team_ids` | \- |

#### B. Actions

| UI Label | UI Element Type | System Variable | Status |
| ----- | ----- | ----- | ----- |
| Send messages | Checkbox | `conversation:send_message` | Existing |
| Edit team message | Checkbox | `conversation:edit_team_message` | Existing |
| Delete team message | Checkbox | `conversation:delete_team_message` | Existing |
| Edit own message | Checkbox | `conversation:edit_own_message` | Existing |
| Delete own message | Checkbox | `conversation:delete_own_message` | Existing |
| Assign conversation | Checkbox | `conversation:assign` | Existing |
| Change status | Checkbox | `conversation:change_status` | Existing |
| Manage assignee | Checkbox | `conversation:manage_asignee` | Existing |
| Manage macros | Checkbox | `conversation:manage_macros` | Existing |
| Manage notes | Checkbox | `conversation:manage_notes` | Existing |
| Mark as read | Checkbox | `conversation:mark_read` | Existing |
| Mark as spam | Checkbox | `conversation:mark_spam` | Existing |
| Pin conversation | Checkbox | `conversation:pin_convo` | Existing |
| Pin message | Checkbox | `conversation:pin_message` | Existing |
| Reopen conversation | Checkbox | `conversation:reopen` | Existing |
| Star conversation | Checkbox | `conversation:star` | Existing |
| View client data | Checkbox | `conversation:read_client_data` | Existing |
| Take screenshot (Addons) | Checkbox | `conversation:take_screenshot` | Existing |

---

### Appendix E.5 Ticket Translation Matrix

#### A. Visibility

| UI Label | UI Element Type | System Variable / Resolver | Raw Permission Mapping |
| ----- | ----- | ----- | ----- |
| All tickets | Radio | `ticket_access_mode = all` | `ticket:read` |
| Team tickets | Radio | `ticket_access_mode = team` | `ticket:read`, `ticket:read_team` |
| Assigned tickets only | Radio | `ticket_access_mode = assigned_only` | `ticket:read`, `ticket:read_assigned` |
| Assigned tickets \+ team queue | Radio | `ticket_access_mode = assigned_plus_queue` | `ticket:read`, `ticket:read_assigned`, `ticket:view_queue` |

#### B. Actions

| UI Label | UI Element Type | System Variable | Status | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Create tickets | Checkbox | `ticket:create` | Existing |  |
| Update tickets | Checkbox | `ticket:update` | Existing |  |
| Assign tickets | Checkbox | `ticket:assign` | Existing |  |
| Claim tickets | Checkbox | `ticket:claim` | New | New workflow permission for unassigned queue. |
| Return tickets to queue | Checkbox | `ticket:return_to_queue` | New | New workflow permission for unassign to queue. |
| Send ticket messages | Checkbox | `ticket:send_message` | Existing |  |
| Delete tickets | Checkbox | `ticket:delete` | Existing |  |

#### C. New Ticket Permissions Summary

| Variable | Status | Description |
| ----- | ----- | ----- |
| `ticket:read_team` | New | Allows viewing tickets within assigned team inbox scope. |
| `ticket:read_assigned` | New | Allows viewing only tickets assigned directly to the member. |
| `ticket:view_queue` | New | Allows access to unassigned ticket queue in team scope. |
| `ticket:claim` | New | Allows taking tickets from unassigned queue. |
| `ticket:return_to_queue` | New | Allows moving assigned tickets back to unassigned queue. |

---

### Appendix E.6 Broadcast Translation Matrix

| UI Label | UI Element Type | System Variable | Status | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Create broadcasts | Checkbox | `broadcast:create` | Existing |  |
| Update broadcasts | Checkbox | `broadcast:update` | Existing |  |
| Delete broadcasts | Checkbox | `broadcast:delete` | Existing |  |
| View broadcasts | Implicit read | `broadcast:read` | Existing | Not shown in final UI because module switch already implies minimal readable access. |

---

### Appendix E.7 Analytics Translation Matrix

#### A. Visibility

| UI Label | UI Element Type | System Variable / Resolver | Raw Permission Mapping |
| ----- | ----- | ----- | ----- |
| All statistics | Radio | `analytics_access_mode = all` | `statistic:read` |
| Team statistics | Radio | `analytics_access_mode = team` | `statistic:read` |
| Assigned only | Radio | `analytics_access_mode = assigned_only` | `statistic:read` |
| All statistics except assigned to | Radio | `analytics_access_mode = all_except_team` | `statistic:read` |
| Select or search Team inbox | Dropdown | `analytics_access_excluded_team_ids` | \- |

---

### Appendix E.8 Client Contacts Translation Matrix

#### A. Visibility

| UI Label | UI Element Type | System Variable / Resolver | Raw Permission Mapping |
| ----- | ----- | ----- | ----- |
| All client contacts | Radio | `client_contact_access_mode = all` | `client_contact:read` |
| Team client contacts | Radio | `client_contact_access_mode = team` | `client_contact:read_team` |
| Own client contacts | Radio | `client_contact_access_mode = own` | `client_contact:read_own` |

#### B. Actions

| UI Label | UI Element Type | System Variable | Status | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Create client contacts | Checkbox | `client_contact:create` | Existing |  |
| Update client contacts | Checkbox | `client_contact:update` | Existing |  |
| Delete client contacts | Checkbox | `client_contact:delete` | Existing |  |

---

### Appendix E.9 Lead Translation Matrix

| UI Label | UI Element Type | System Variable | Status | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Create leads | Checkbox | `lead:create` | Existing |  |
| Update all leads | Checkbox | `lead:update` | Existing |  |
| Update own leads | Checkbox | `lead:update_own` | Existing |  |
| Update team leads | Checkbox | `lead:update_team` | Existing |  |
| Delete leads | Checkbox | `lead:delete` | Existing |  |
| Change team inbox | Checkbox | `lead:change_team_inbox` | Existing |  |

#### Lead Visibility Reference

| UI Concept | System Variable / Resolver | Raw Permission Mapping |
| ----- | ----- | ----- |
| All leads | `lead_access_mode = all` | `lead:read` |
| Team leads | `lead_access_mode = team` | `lead:read_team` |
| Own leads only | `lead_access_mode = own` | `lead:read_own` |

---

### Appendix E.10 Settings Translation Matrix

#### A. Settings Header and Composite Mapping

| UI Label | UI Element Type | System Variable / Resolver | Status | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Manage roles settings | Checkbox | `roles:*`, `roles:read` | Existing | Full role management area. |
| Manage shift hours | Checkbox | `shift_hours:*` | Existing | Group shortcut for shift hour management. |
| Manage assignment settings | Checkbox | `assignment:*` | Existing | Group shortcut for assignment settings. |
| Manage account channel | Checkbox | `account_channel:*` | Existing | Group shortcut for account channel management. |

#### B. Settings Items

| UI Label | UI Element Type | System Variable | Status | Notes |
| ----- | ----- | ----- | ----- | ----- |
| Manage general settings | Checkbox | `setting:manage_general_setting` | Existing |  |
| Manage members settings | Checkbox | `setting:manage_member` | Existing |  |
| Manage tags | Checkbox | `setting:manage_tags` | Existing |  |
| Manage team inbox | Checkbox | `setting:manage_team_inbox` | Existing |  |
| Manage shared macro settings | Checkbox | `setting:manage_shared_macro` | Existing |  |
| Manage ticket type settings | Checkbox | `setting:manage_ticket_type` | Existing |  |
| Manage SLA settings | Checkbox | `setting:manage_sla` | Existing |  |
| Manage CSAT settings | Checkbox | `setting:csat` | Existing |  |
| Manage widget settings | Checkbox | `setting:manage_widget` | Existing |  |
| Manage WhatsApp Web settings | Checkbox | `setting:manage_whatsapp_web` | Existing |  |
| Manage add-ons settings | Checkbox | `setting:manage_addons` | Existing |  |
| Manage subscription settings | Checkbox | `setting:manage_subscription` | Existing |  |
| Manage webhook settings | Checkbox | `setting:manage_webhook` | Existing |  |
| Manage shipping settings | Checkbox | `setting:manage_shipping` | Existing |  |

---

### Appendix E.11 Data Privacy Translation Matrix

#### A. Phone

| UI Label | UI Element Type | System Variable / Resolver | Raw Permission Mapping |
| ----- | ----- | ----- | ----- |
| Full | Radio | `phone_privacy_mode = full` | `privacy:view_full_phone` |
| Masked | Radio | `phone_privacy_mode = masked` | \- |

#### B. Email

| UI Label | UI Element Type | System Variable / Resolver | Raw Permission Mapping |
| ----- | ----- | ----- | ----- |
| Full | Radio | `email_privacy_mode = full` | `privacy:view_full_email` |
| Masked | Radio | `email_privacy_mode = masked` | \- |

---

### **Appendix G. Glossary**

| Term | Definition |
| ----- | ----- |
| Default Role | A system-provided role that exists by default in every workspace. |
| Custom Role | A role created by admin users for workspace-specific needs. |
| Visibility | The data scope a role can access in a module. |
| Action | A specific operation allowed in a module. |
| Masked | Sensitive data is partially hidden in the UI. |
| Full | Sensitive data is shown without masking. |

