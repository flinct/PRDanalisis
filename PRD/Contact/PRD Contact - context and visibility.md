# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Contact Area Context and RBAC Visibility  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-05-05 Asia/Jakarta | Yusril Ibnu Maulana | Initial PRD for Global Contact, Area Context, duplicate handling, Client Contacts RBAC visibility, Leads integration, and Broadcast recipient scope. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Keep one global contact identity per customer while separating Sales and Operational visibility through Area Context and RBAC visibility rules. |
| Scope | This feature updates Contacts, Leads, Broadcast recipient selection, Conversation and Ticket contact linking, and Roles Management for safer contact visibility without duplicating contacts. |

| In Scope | Out of Scope |
| ----- | ----- |
| One Global Contact per unique identifier in a workspace. | Separate Sales Contact collection. |
| Contact Area Context for Sales and Operational areas. | Contact merge and deduplication tooling. |
| Team Inbox scoped contact context. | Team Inbox Type field. |
| Role Area Scope in RBAC. | Per-user permission override outside role assignment. |
| Client Contacts visibility modes: own and assigned, team, all. | Advanced conditional permission by tag, channel, time, or custom rule. |
| Duplicate contact prompt with "Gunakan Kontak Ini" and "Tambahkan ke Sales". | Auto Sales Candidate workflow. |
| Leads contact picker scoped to Sales contacts. | Full CRM pipeline redesign. |
| Broadcast recipient picker scoped by Area Context and RBAC. | Broadcast creation redesign. |
| Server-side enforcement for list, detail, picker, and direct URL access. | Historical retroactive permission recomputation. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Contacts currently behave like a global all-view, so Sales can be exposed to noisy CS and Ops contacts. | Sales teams waste time filtering irrelevant contacts and can accidentally broadcast to the wrong audience. |
| PS-002 | Duplicating contacts by Sales and Operational context would split chat history and confuse conversation linking. | The same customer may appear as multiple records, causing broken history, wrong context, and duplicate outreach. |
| PS-003 | A unique phone number blocks Sales from adding a contact that already exists from CS or Ops. | Sales users get stuck even when they should be able to use the same customer identity for Leads. |
| PS-004 | Supervisor and Agent visibility needs different levels of access. | Supervisors need team-level visibility, while Agents should only see their own and assigned contacts. |
| PS-005 | Broadcast recipient selection can leak contacts across Sales and Operational teams if it only uses global contacts. | Users may send messages to contacts outside their business area or Team Inbox scope. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Preserve one customer identity across Inbox, Ticket, Leads, and Broadcast. | 100% of conversations, tickets, leads, and broadcasts link to the same Global Contact when identifier matches. |
| Reduce Sales contact noise. | Sales users see 0 Operational-only contacts by default in Leads and Broadcast recipient picker. |
| Prevent duplicate contact creation. | 100% duplicate identifier attempts show an existing contact prompt instead of creating a duplicate. |
| Improve RBAC clarity. | Admins can configure Contact Area Scope and Contact Visibility Scope in under 5 minutes during usability testing. |
| Protect team-level visibility. | 0 successful unauthorized contact list, detail, picker, or direct URL access outside allowed Area and Team Inbox scope. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As a system, I want to keep one Global Contact per unique identifier so that customer history remains connected. | 1\. Given a contact identifier already exists in the workspace, When a user attempts to create a contact with the same identifier, Then the system does not create a new Global Contact. 2\. Given the existing identifier belongs to a contact with conversation history, When the contact is reused in another area, Then the same `contactId` is used. 3\. Given the identifier is new, When a user creates a contact, Then the system creates one Global Contact and one Area Context for the current flow. |
| US-002 | P0 | As a Sales Agent, I want to add an existing Operational contact to Sales so that I can create a Lead without duplicate contact data. | 1\. Given I input a phone number that already exists in Operational area, When I submit the contact form from a Sales flow, Then I see "Kontak sudah tersedia". 2\. Given the duplicate prompt appears, When I click "Tambahkan ke Sales", Then the system creates a Sales Area Context for the same Global Contact. 3\. Given I do not have permission to view full client data, When the duplicate prompt appears, Then the phone and email are masked according to Data Privacy rules. |
| US-003 | P0 | As an Operational user, I want to use an existing Sales contact in Operational context so that support history stays connected. | 1\. Given I input a phone number that already exists in Sales area, When I submit the contact form from an Operational flow, Then I see "Kontak sudah tersedia". 2\. Given I click "Gunakan Kontak Ini", Then the system creates an Operational Area Context for the same Global Contact. 3\. Given I cancel the prompt, Then no new Area Context is created. |
| US-004 | P0 | As a Sales Agent, I want to see only contacts I created or contacts assigned to me so that I do not see other agents' contacts. | 1\. Given my role has Area Scope Sales and Visibility Scope own and assigned, When I open Sales contacts, Then I only see Sales contacts created by me or linked to my assigned Leads, Conversations, or Tickets. 2\. Given another Sales Agent created a contact and it is not assigned to me, When I search contacts, Then the contact does not appear. 3\. Given I input the same identifier manually, When the system detects an existing Global Contact, Then I can use the existing contact without seeing restricted history. |
| US-005 | P0 | As a Sales Supervisor, I want to see only Sales contacts in my Team Inbox scope so that I cannot see contacts from other Sales teams. | 1\. Given my role has Area Scope Sales and Visibility Scope team, When I open Contacts, Then I see contacts with Sales Area Context inside my accessible Team Inbox scope only. 2\. Given a Sales contact belongs to another Team Inbox, When I open it by direct URL, Then I see "Akses ditolak". 3\. Given a contact has Sales contexts in two Team Inboxes and I have access to one of them, When I open the contact, Then I only see the context and references allowed by my Team Inbox scope. |
| US-006 | P0 | As an Operational Supervisor, I want to see only Operational contacts in my Team Inbox scope so that Ops and CS data stays separated from Sales. | 1\. Given my role has Area Scope Operational and Visibility Scope team, When I open Contacts, Then I see contacts with Operational Area Context inside my accessible Team Inbox scope only. 2\. Given a contact only has Sales Area Context, When I search Contacts, Then it does not appear. 3\. Given I open a Sales-only contact by direct URL, Then I see "Akses ditolak". |
| US-007 | P0 | As an Admin, I want to configure Contact Area Scope in Roles so that each role sees only the correct business area. | 1\. Given I open Role Detail, When Client Contacts is enabled, Then I can select one Area Scope: "Operasional", "Sales", or "Semua". 2\. Given I select "Sales", When the role is saved, Then members using that role only see Sales Area Context contacts unless another module grants contextual access. 3\. Given I select "Semua", When the role is saved, Then members using that role can access all areas subject to Contact Visibility Scope and module permissions. |
| US-008 | P0 | As an Admin, I want to configure Contact Visibility Scope in Roles so that Agent, Supervisor, and Admin access remains predictable. | 1\. Given I open Client Contacts permission section, When I choose contact visibility, Then I can select only one option: "Kontak yang dibuat sendiri dan assigned ke saya", "Kontak dalam Team Inbox saya", or "Semua kontak". 2\. Given I select "Kontak yang dibuat sendiri dan assigned ke saya", When the role is saved, Then users only see own and assigned contacts. 3\. Given I select "Kontak dalam Team Inbox saya", When the role is saved, Then users see contacts in their accessible Team Inbox scope only. |
| US-009 | P0 | As a Sales user, I want Leads contact picker to show only Sales-eligible contacts so that I do not pick noisy Operational contacts. | 1\. Given I open Lead create or edit form, When I open contact picker, Then only Sales Area Context contacts allowed by my visibility scope appear. 2\. Given a contact only has Operational Area Context, When I search it in Lead contact picker, Then it does not appear by default. 3\. Given I input an Operational contact identifier manually, When it already exists, Then I see "Kontak sudah tersedia" and can click "Tambahkan ke Sales" if I have permission. |
| US-010 | P0 | As a Broadcast user, I want recipient selection to follow my Contact Area Scope so that broadcasts do not target the wrong area. | 1\. Given my role has Area Scope Sales, When I open Broadcast recipient picker, Then I only see Sales contacts allowed by my visibility scope. 2\. Given my role has Area Scope Operational, When I open Broadcast recipient picker, Then I only see Operational contacts allowed by my visibility scope. 3\. Given my role has Area Scope All, When I open Broadcast recipient picker, Then I can filter by "Operasional", "Sales", or "Semua". |
| US-011 | P0 | As a user, I want conversation and ticket contact linking to reuse Global Contact so that history does not split. | 1\. Given an inbound conversation arrives from an identifier that already exists, When the system links the sender, Then it links to the existing Global Contact. 2\. Given the conversation belongs to an allowed Operational flow, When the contact does not have Operational Area Context, Then the system creates or updates Operational Area Context according to policy. 3\. Given the user lacks access to the contact area, When the conversation is assigned to the user, Then the user can see contact summary only within assigned conversation context and masking rules. |
| US-012 | P0 | As a user, I want area-specific access to contact history so that I do not see history outside my role scope. | 1\. Given I open a contact with both Sales and Operational contexts, When my role is Sales only, Then I see Sales references only. 2\. Given I open a contact with both Sales and Operational contexts, When my role is Operational only, Then I see Operational references only. 3\. Given I have Area Scope All, When I open the contact, Then I can see all allowed references subject to Team Inbox and data privacy permissions. |
| US-013 | P1 | As an Admin, I want area and visibility badges in Contacts so that users understand why a contact appears. | 1\. Given I view the contact list, When a contact has an area context, Then the UI shows an area badge such as "Sales" or "Operasional". 2\. Given a contact is visible because of assigned Lead, Conversation, or Ticket, When I view the contact, Then the UI shows a short reason label. 3\. Given a contact is not visible due to permission, When the list loads, Then the contact is not shown and no hidden count is exposed. |
| US-014 | P1 | As an Admin, I want audit logs for Area Context changes so that contact visibility changes are traceable. | 1\. Given a user creates an Area Context, When the action succeeds, Then the audit log stores actor, contactId, area, teamInboxId, source, and timestamp. 2\. Given a user reuses an existing contact through duplicate prompt, When the action succeeds, Then the audit log records that no duplicate Global Contact was created. 3\. Given an Area Context action fails, When no data changes, Then no success audit entry is created. |
| US-015 | P1 | As a user, I want clear empty states so that I know why contacts are missing. | 1\. Given Sales contact picker has no available contact, When it loads, Then I see "Tidak ada kontak sales". 2\. Given Operational contact picker has no available contact, When it loads, Then I see "Tidak ada kontak operasional". 3\. Given my role has no Team Inbox access, When Contacts loads, Then I see "Belum ada akses ke Team Inbox". |
| US-016 | P1 | As an Admin, I want migration to preserve existing contacts and permissions so that rollout is safe. | 1\. Given existing contacts exist before migration, When migration runs, Then no duplicate contact is created. 2\. Given existing contact identifiers are unique, When migration runs, Then they remain unique. 3\. Given existing Contacts visibility used Team Inbox scope, When migration runs, Then equivalent Operational Area Context is created where possible. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Global Contact Identity | FR-001: System MUST maintain one Global Contact per unique identifier in a workspace. FR-002: System MUST enforce uniqueness for `workspaceId + identifierType + identifierValue`. FR-003: System MUST NOT create duplicate Global Contacts when an identifier already exists. FR-004: System MUST link Conversations, Tickets, Leads, and Broadcast references to the same `contactId` when identifier matches. FR-005: System MUST preserve existing chat history by linking all references to Global Contact and not to area-specific contact records. |
| Contact Area Context | FR-006: System MUST support Contact Area Context as a separate record from Global Contact. FR-007: Contact Area Context MUST support area values `operational` and `sales` in MVP. FR-008: Contact Area Context MUST include `contactId`, `area`, `teamInboxId`, `createdBy`, `source`, `status`, `createdAt`, and `lastActivityAt`. FR-009: System MUST enforce uniqueness for `contactId + area + teamInboxId` when status is active. FR-010: System MUST allow one Global Contact to have multiple Area Contexts. |
| Contact References | FR-011: System MUST store contact references for `conversation`, `ticket`, `lead`, `broadcast`, and `manual` source types. FR-012: Contact references MUST include `contactId`, `area`, `teamInboxIdAtSourceTime`, `sourceType`, `sourceId`, `createdBy`, and `createdAt`. FR-013: Contact references MUST be immutable after creation except for soft-delete or correction by Admin policy. FR-014: Contact references MUST be used to filter history shown in Contact Detail by role and scope. |
| Area Context Creation Rules | FR-015: System MUST create Area Context when a user creates a new contact from a Sales or Operational flow. FR-016: System MUST create Sales Area Context when a user confirms "Tambahkan ke Sales". FR-017: System MUST create current area context when a user confirms "Gunakan Kontak Ini". FR-018: System MUST create Sales Area Context when a Lead is created for an existing Global Contact and Sales context is missing. FR-019: System MUST create or update Operational Area Context when an inbound conversation is handled in an Operational context. FR-020: System MUST NOT create Area Context when a user only views, searches, or previews a contact. |
| Duplicate Identifier Handling | FR-021: If a duplicate identifier is detected, system MUST show an existing contact prompt instead of a blocking duplicate error. FR-022: Duplicate prompt in Sales flow MUST show action "Tambahkan ke Sales". FR-023: Duplicate prompt in non-Sales flow MUST show action "Gunakan Kontak Ini". FR-024: Duplicate prompt MUST NOT expose restricted contact history or restricted area details. FR-025: Duplicate prompt MUST apply Phone and Email masking based on Data Privacy permission. FR-026: If user confirms reuse, system MUST link to existing Global Contact and create Area Context only if missing. |
| RBAC Area Scope | FR-027: Roles Management MUST add Contact Area Scope to Client Contacts permission section. FR-028: Contact Area Scope MUST support `operational`, `sales`, and `all`. FR-029: UI labels MUST be "Operasional", "Sales", and "Semua". FR-030: Contact Area Scope MUST limit contact visibility after module permission is evaluated. FR-031: Contact Area Scope MUST NOT grant module access by itself. |
| RBAC Visibility Scope | FR-032: Client Contacts visibility MUST support `own_and_assigned`, `team`, and `all`. FR-033: `own_and_assigned` MUST be the lowest visibility level in this scope. FR-034: `own_and_assigned` MUST include contacts created by the user within the selected area. FR-035: `own_and_assigned` MUST include contacts linked to Leads assigned to the user. FR-036: `own_and_assigned` MUST include contacts linked to Conversations assigned to the user. FR-037: `own_and_assigned` MUST include contacts linked to Tickets assigned to the user. FR-038: `team` MUST include contacts with Area Context where `teamInboxId` is inside the user's accessible Team Inbox scope. FR-039: `all` MUST include all contacts inside allowed Area Scope subject to module permissions and data privacy. |
| Contacts Page Visibility | FR-040: Contacts list MUST be filtered server-side by Contact Area Scope, Contact Visibility Scope, Team Inbox scope, and Data Privacy permission. FR-041: Direct URL access MUST apply the same visibility rules as list access. FR-042: Contact Detail MUST show only allowed Area Contexts and allowed References. FR-043: Contact search MUST search only contacts allowed by the user's resolved scope. FR-044: Users MUST NOT see hidden count or hidden metadata for contacts outside scope. |
| Leads Integration | FR-045: Lead contact picker MUST show only Sales Area Context contacts allowed by the user's Contact Visibility Scope. FR-046: Creating a Lead with an existing Operational-only contact MUST require user confirmation through "Tambahkan ke Sales". FR-047: Lead creation MUST link to the existing Global Contact when identifier matches. FR-048: Lead creation MUST create Sales Area Context if missing. FR-049: Lead detail MUST respect existing Lead RBAC and Contact Area Context rules. |
| Broadcast Integration | FR-050: Broadcast recipient picker MUST use the same contact visibility resolver as Contacts. FR-051: Broadcast recipient picker MUST filter recipients by Contact Area Scope. FR-052: Broadcast recipient picker MUST filter recipients by Contact Visibility Scope. FR-053: Broadcast recipient picker MUST filter recipients by Team Inbox scope when visibility is `team`. FR-054: Broadcast recipient picker MUST allow Area filter only for roles with Contact Area Scope `all`. FR-055: Broadcast send MUST store contact reference with area and `teamInboxIdAtSourceTime`. FR-056: Broadcast list and detail permission MUST remain server-side enforced. |
| Conversation and Ticket Integration | FR-057: Conversation sender identity matching MUST resolve to existing Global Contact when possible. FR-058: Ticket contact link MUST resolve to existing Global Contact when possible. FR-059: Contact summary inside Conversation and Ticket MUST respect assigned entity access and Data Privacy masking. FR-060: A user assigned to a Conversation or Ticket MAY see the contact summary for that assigned entity even if the centralized Contacts list would not show the contact. FR-061: Opening full Contact Detail from assigned Conversation or Ticket MUST still enforce Contact Detail permission and scope. |
| Data Privacy | FR-062: Phone and Email display MUST use existing Data Privacy modes Full and Masked. FR-063: Duplicate prompts MUST use masking when user lacks full data permission. FR-064: Search result display MUST use masking when user lacks full data permission. FR-065: System MUST NOT expose restricted Area Context names, team names, or history through masked duplicate prompt. |
| Migration | FR-066: Existing contacts MUST remain Global Contacts. FR-067: Existing contact identifiers MUST remain unique. FR-068: Existing `contact.teamInboxIds` behavior MUST be migrated or mapped to Operational Area Context where applicable. FR-069: Existing Admin role SHOULD map to Contact Area Scope `all` and Visibility Scope `all`. FR-070: Existing Supervisor role SHOULD map to Contact Area Scope `operational` and Visibility Scope `team`. FR-071: Existing Agent role SHOULD map to Contact Area Scope `operational` and Visibility Scope `own_and_assigned` if Client Contacts access is enabled. FR-072: Migration MUST NOT grant broader access than existing permissions. |
| Auditability | FR-073: System MUST audit Area Context create, update, deactivate, and reuse actions. FR-074: System MUST audit duplicate identifier reuse decisions. FR-075: System MUST audit Role Area Scope and Contact Visibility Scope changes. FR-076: Audit entries MUST include actor, contactId, area, teamInboxId, source, previous value, new value, timestamp, and result status where applicable. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Duplicate identifier | Show reuse prompt and block duplicate Global Contact creation. | "Kontak sudah tersedia". |
| EH-002 | Duplicate identifier without permission to reuse | Block reuse and show safe message. | "Kontak sudah tersedia, tetapi Anda tidak memiliki akses". |
| EH-003 | Invalid identifier format | Prevent save and highlight field. | "Format kontak tidak valid". |
| EH-004 | Missing Team Inbox for Area Context | Prevent context creation. | "Team Inbox wajib dipilih". |
| EH-005 | No Team Inbox access | Return empty state or block action. | "Belum ada akses ke Team Inbox". |
| EH-006 | Area Context already exists | Reuse existing active context and do not create duplicate context. | "Kontak sudah ada di area ini". |
| EH-007 | Unauthorized contact list access | Return no data or denied response based on endpoint. | "Akses ditolak". |
| EH-008 | Unauthorized contact detail URL | Block detail and do not expose metadata. | "Akses ditolak". |
| EH-009 | Unauthorized Broadcast recipient access | Exclude recipient from picker and block send if forced. | "Penerima tidak dapat digunakan". |
| EH-010 | Unauthorized Lead contact selection | Block contact selection and keep form open. | "Kontak tidak tersedia untuk prospek". |
| EH-011 | Area Scope missing in Role | Save with safe default `operational` for non-Admin roles. | No error. |
| EH-012 | Area Scope invalid in Role | Prevent role save. | "Area kontak tidak valid". |
| EH-013 | Visibility Scope missing in Role | Save with safe default `own_and_assigned` for non-Admin roles. | No error. |
| EH-014 | Visibility Scope invalid in Role | Prevent role save. | "Akses kontak tidak valid". |
| EH-015 | Area Context save failed | Keep previous state and allow retry. | "Gagal menyimpan area kontak. Coba lagi". |
| EH-016 | Role save failed | Keep draft state and allow retry. | "Gagal menyimpan role. Coba lagi". |
| EH-017 | Stale contact data | Block save and ask user to reload. | "Data berubah. Muat ulang". |
| EH-018 | Hidden contact in search | Do not show hidden contact and do not reveal why it is hidden. | No message. |
| EH-019 | Contact reference missing | Show fallback reference state. | "Referensi tidak tersedia". |
| EH-020 | Permission mapping unavailable | Block save and log internal error. | "Konfigurasi permission tidak tersedia". |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Same phone exists in Operational and Sales context. | System keeps one Global Contact with two Area Contexts. | Show allowed area badges only. |
| EC-002 | Sales Agent adds phone that exists in another Sales Agent's context. | Duplicate prompt appears with masked data. Reuse creates context only if allowed. | "Kontak sudah tersedia". |
| EC-003 | Sales Agent searches for another agent's contact. | Contact does not appear unless linked to assigned work. | No hidden count. |
| EC-004 | Supervisor Sales Jakarta opens Sales Bandung contact. | Access is denied because Team Inbox scope does not match. | "Akses ditolak". |
| EC-005 | Operational user tries to broadcast to Sales-only contact. | Contact is excluded from recipient picker and blocked if forced. | "Penerima tidak dapat digunakan". |
| EC-006 | Sales user tries to broadcast to Operational-only contact. | Contact is excluded from recipient picker and blocked if forced. | "Penerima tidak dapat digunakan". |
| EC-007 | Admin with Area Scope All opens contact with both areas. | Admin sees all allowed contexts and references. | Area filter available. |
| EC-008 | Contact has active Lead but no explicit Sales Area Context due to legacy data. | System creates or backfills Sales Area Context during migration or on first access. | No user interruption. |
| EC-009 | Conversation is moved from Operational Team Inbox to Sales Team Inbox. | Global Contact remains the same. Area Context is not auto-created unless policy or user action creates it. | No duplicate contact. |
| EC-010 | Conversation is assigned to Agent but contact is outside centralized contact visibility. | Agent sees contact summary inside assigned conversation but cannot open full Contact Detail unless permitted. | "Akses ditolak" on full detail. |
| EC-011 | Lead is assigned to Agent after contact was created by another user. | Contact becomes visible to Agent under own and assigned mode. | No special message. |
| EC-012 | Lead is unassigned from Agent. | Contact disappears from Agent list unless created by Agent or linked to another assigned entity. | List refreshes normally. |
| EC-013 | Team Inbox membership changes while user is viewing Contacts. | Next request uses updated permission and may remove contacts from view. | "Data berubah. Muat ulang" if save is attempted. |
| EC-014 | Duplicate prompt appears but existing contact has restricted area data. | Prompt shows safe summary only and masks restricted identifiers. | No restricted history shown. |
| EC-015 | Contact has no Area Context after migration. | Admin can see it in review view. Non-Admin cannot see it until context is created. | "Area kontak belum tersedia". |
| EC-016 | Broadcast recipient was valid when selected but invalid before send. | Send validation removes blocked recipient and asks user to review. | "Beberapa penerima tidak dapat digunakan". |
| EC-017 | User has Broadcast permission but Client Contacts module is off. | Broadcast recipient picker still uses resolved contact visibility from system policy and does not expose Contacts page. | No direct Contacts link. |
| EC-018 | User has Client Contacts access but no full phone permission. | Contact list and duplicate prompt show masked phone. | Masked value shown. |
| EC-019 | Contact is blocked. | Contact may be visible if scope allows, but Broadcast action is disabled. | "Kontak diblokir". |
| EC-020 | Area Context is deactivated. | Contact no longer appears for that area unless another active context or assigned entity exists. | No special message. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Contact Area Scope in Role Detail | Radio group inside Client Contacts section. Labels: "Operasional", "Sales", "Semua". | Admin opens Role Detail, enables Client Contacts, selects area scope, and saves. | US-007, US-008 |
| Contact Visibility Scope in Role Detail | Radio group inside Client Contacts section. Labels: "Kontak yang dibuat sendiri dan assigned ke saya", "Kontak dalam Team Inbox saya", "Semua kontak". | Admin selects contact visibility level and sees helper text. | US-008 |
| Role Helper Text | Explains that Area Scope filters data area and does not grant module permission. | Admin reads before saving role. | US-007, US-008 |
| Duplicate Contact Prompt | Modal or inline panel when identifier already exists. | User enters existing phone, system shows prompt, user chooses "Tambahkan ke Sales", "Gunakan Kontak Ini", or "Batal". | US-002, US-003, US-009 |
| Sales Contact Picker | Searchable picker for Leads and Broadcast Sales flows. | User searches only Sales contacts within allowed scope. Empty state if none. | US-009, US-010 |
| Operational Contact Picker | Searchable picker for Operational flows and Broadcast Operational flows. | User searches only Operational contacts within allowed scope. Empty state if none. | US-003, US-010 |
| Contact Area Badges | Badges on Contact Detail and list where useful. Labels: "Operasional", "Sales". | User sees why a contact is visible. | US-012, US-013 |
| Contact Visibility Reason | Small label on Contact Detail or list for assigned visibility. | User sees "Dibuat oleh saya" or "Assigned ke saya" where relevant. | US-004, US-013 |
| Contact References Section | Section in Contact Detail showing allowed references only. | User views conversations, tickets, leads, and broadcasts allowed by role and scope. | US-012 |
| Broadcast Recipient Area Filter | Area filter visible only when role area scope is `all`. Labels: "Operasional", "Sales", "Semua". | Admin filters recipient picker by area. | US-010 |
| Empty State | Empty state by area. | User sees "Tidak ada kontak sales", "Tidak ada kontak operasional", or "Belum ada akses ke Team Inbox". | US-015 |
| Permission Denied State | Blocked state for direct URL or restricted detail. | User sees "Akses ditolak". | US-005, US-006, US-012 |
| Audit Log Event | Audit row for area context or role scope changes. | Admin reviews audit trail. | US-014 |

## **10\. Field & Validation**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| Contact Identifier Type | Enum | 1\. Allowed values include WhatsApp, Email, Telegram, Instagram, Facebook, and other supported channels. 2\. Must be valid for selected channel. 3\. Required when adding identifier. | Yes |
| Contact Identifier Value | Text | 1\. Required. 2\. Trim leading and trailing spaces. 3\. Unique by workspace, type, and value. 4\. Format validation follows channel type. 5\. Duplicate triggers reuse prompt. | Yes |
| Contact Area | Enum | 1\. Allowed values: `operational`, `sales`. 2\. UI labels: "Operasional", "Sales". 3\. Required for Area Context. | Yes |
| Area Context Team Inbox | Dropdown | 1\. Must be active. 2\. Must be inside user's accessible Team Inbox scope. 3\. Required when creating Area Context. 4\. Must not create duplicate active context for same contact, area, and Team Inbox. | Yes |
| Area Context Source | Enum | 1\. Allowed values: `inbound`, `manual`, `manual_sales_add`, `lead`, `broadcast`, `ticket`, `system`. 2\. Auto-filled by flow. 3\. Not editable by standard users. | Yes |
| Area Context Status | Enum | 1\. Allowed values: `active`, `inactive`. 2\. Default value is `active`. 3\. Inactive context is excluded from default visibility. | Yes |
| Role Contact Area Scope | Enum | 1\. Allowed values: `operational`, `sales`, `all`. 2\. UI labels: "Operasional", "Sales", "Semua". 3\. Admin role defaults to `all`. 4\. Non-Admin default is `operational`. | Yes |
| Role Contact Visibility Scope | Enum | 1\. Allowed values: `own_and_assigned`, `team`, `all`. 2\. UI labels must be Bahasa Indonesia. 3\. Lowest allowed visibility is `own_and_assigned`. 4\. Non-Admin default is `own_and_assigned` for Agent-like roles. | Yes |
| Contact Reference Source Type | Enum | 1\. Allowed values: `conversation`, `ticket`, `lead`, `broadcast`, `manual`. 2\. Required for reference creation. 3\. Immutable after creation except Admin correction policy. | Yes |
| Contact Reference Source ID | Text | 1\. Required. 2\. Must point to valid source record. 3\. Must be hidden if user lacks access to source record. | Yes |
| Display Name | Text | 1\. Optional. 2\. Max 100 characters. 3\. Trim spaces. 4\. Fallback to masked identifier if missing. | No |
| Area Alias Name | Text | 1\. Optional. 2\. Max 100 characters. 3\. Applies only within allowed area context. 4\. Does not overwrite global display name. | No |
| Duplicate Prompt Action | Enum | 1\. Allowed values: reuse, add\_to\_sales, cancel. 2\. `add_to_sales` appears only in Sales flow. 3\. `reuse` appears in non-Sales flow. 4\. Cancel creates no context. | Conditional |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Contact list and picker P95 response time must be under 2 seconds for 100,000 contacts with indexed area and team scope. |
| Security | Contact list, detail, picker, Lead selection, Broadcast recipient selection, and direct URL access must be server-side enforced. |
| Privacy | Phone and email must respect existing Data Privacy Full or Masked modes in all views, prompts, search results, and exports. |
| Reliability | Duplicate reuse and Area Context creation must be idempotent for repeated submits within 30 seconds. |
| Scalability | System must support one Global Contact with at least 20 Area Contexts and 500 references without detail page failure. |
| Observability | System must log access denied, duplicate reuse, Area Context changes, and Broadcast recipient filtering outcomes. |
| Accessibility | Role radios, duplicate prompt actions, contact picker, and area filters must support keyboard navigation and visible focus states. |
| Auditability | All Area Context and RBAC scope changes must be traceable with actor and timestamp. |

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Existing Contacts model uses one Contact entity per person and unique identifiers | Engineering | High | Keep Global Contact unchanged and add Area Context as additive layer. |
| Existing Contacts page currently denies Agent access by default | Product and Engineering | Medium | Update RBAC to allow Agent only when Client Contacts is enabled with own and assigned visibility. |
| Existing RBAC has Client Contacts visibility modes | Engineering | High | Extend existing model instead of creating a new permission system. |
| Existing Lead permissions use own, team, and all concepts | Engineering | Medium | Align Contact Visibility Scope with Lead visibility language. |
| Broadcast currently enforces Team Inbox and server-side access in history | Engineering | High | Reuse server-side enforcement for recipient picker and send validation. |
| Misconfigured roles can expose contacts | Product and Design | High | Use safe defaults, helper text, and no broader access on migration. |
| Duplicate prompt may expose hidden contact existence | Product and Engineering | Medium | Show safe generic prompt with masked data and no hidden area history. |
| Area Context created too aggressively can make contacts noisy again | Product | High | Create Area Context only through explicit rules and not on view or search. |
| Migration may broaden access unintentionally | Engineering | High | Default to operational and own and assigned unless existing permission clearly supports broader access. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Duplicate Global Contact creation rate | 0 for matching identifier | Ongoing | Backend logs |
| Sales contact noise rate | Less than 1% Operational-only contacts shown in Sales picker | 30 days | QA sampling and product analytics |
| Unauthorized contact access | 0 successful unauthorized list, detail, picker, or URL access | Ongoing | Security logs |
| Duplicate prompt completion rate | At least 80% of duplicate attempts result in reuse or add to area | 30 days | Product analytics |
| Broadcast recipient scope accuracy | 100% QA pass for Sales and Operational recipient pickers | UAT | QA tracker |
| Role configuration success rate | At least 95% successful saves for Contact Area Scope and Visibility Scope | 30 days | Product analytics |
| Contact list P95 load time | Under 2 seconds | Ongoing | Performance monitoring |
| Support tickets about contact visibility confusion | Less than 5 per month | 60 days | Support logs |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Sales Candidate workflow | Allows CS or Ops to suggest contacts for Sales without creating a Lead immediately. |
| Area-specific custom fields | Allows Sales and Operational teams to store different labels without changing global contact fields. |
| Contact merge tool | Useful if legacy duplicates exist from historical data. |
| Advanced area types | Future values such as Finance, Retention, or Partner may be needed. |
| Historical area filter for Admin | Helps audit old relationships without showing historical contacts by default. |
| Raw permission preview | Helps enterprise admins debug RBAC configuration. |
| Bulk Area Context import | Useful when onboarding large Sales contact lists. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| MVP supports only Operational and Sales areas. | Other business areas must use Operational or wait for future expansion. |
| Contact merge is not included. | Existing duplicates from older data may need manual handling outside this feature. |
| Area Context is not created from view or search only. | Users must explicitly add or use a contact in a flow before it appears in that area. |
| Agent centralized Contacts access depends on RBAC enablement. | Workspaces that keep Client Contacts off for Agent will preserve current blocked behavior. |
| Duplicate prompt reveals that a contact exists. | The prompt must stay generic and masked to reduce data exposure. |
| Role-level visibility does not support per-user exceptions. | Users needing different access require a different role. |

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| References | Contacts PRD already defines one Contact entity per person with multiple channel identifiers and uniqueness per workspace. It also defines Contact editing from Conversation and Ticket, Broadcast entry points, masking, and server-side access control. |
| References | Custom RBAC PRD already defines grouped permission sections, Client Contacts visibility, Broadcast actions, Lead actions, and Data Privacy modes for Phone and Email. This PRD extends that model rather than replacing it. |
| References | Broadcast History PRD already requires server-side permission enforcement, Team Inbox filtering, and no unauthorized broadcast detail access. Recipient picker and send validation must follow the same enforcement principle. |
| Glossary | 1\. Global Contact: One customer identity record shared across Inbox, Ticket, Lead, and Broadcast. 2\. Contact Identifier: Phone, email, username, or channel identifier used to match a customer. 3\. Area Context: Business-area visibility record attached to a Global Contact. 4\. Operational Area: CS, Ops, Support, and general inbox workflows. 5\. Sales Area: Leads, prospects, sales visits, and Sales broadcast workflows. 6\. Contact Reference: Link between a Global Contact and a source object such as conversation, ticket, lead, broadcast, or manual action. 7\. Own and Assigned: Lowest contact visibility level that includes contacts created by the user or linked to work assigned to the user. 8\. Team Scope: Visibility based on accessible Team Inbox membership. |
| UI Labels | "Area kontak", "Operasional", "Sales", "Semua", "Akses kontak", "Kontak yang dibuat sendiri dan assigned ke saya", "Kontak dalam Team Inbox saya", "Semua kontak", "Kontak sudah tersedia", "Tambahkan ke Sales", "Gunakan Kontak Ini", "Batal", "Tidak ada kontak sales", "Tidak ada kontak operasional", "Belum ada akses ke Team Inbox", "Akses ditolak", "Penerima tidak dapat digunakan", "Kontak tidak tersedia untuk prospek", "Kontak diblokir". |
| Default Role Recommendation | Admin: Area Scope `all`, Visibility Scope `all`. Supervisor: Area Scope `operational`, Visibility Scope `team`. Agent: Area Scope `operational`, Visibility Scope `own_and_assigned` if Client Contacts is enabled. Sales Supervisor custom role: Area Scope `sales`, Visibility Scope `team`. Sales Agent custom role: Area Scope `sales`, Visibility Scope `own_and_assigned`. |
| Permission Principle | Module permission is evaluated first. Contact Area Scope limits business area. Contact Visibility Scope limits ownership or team level. Team Inbox scope limits team boundary. Data Privacy controls whether phone and email are Full or Masked. |

