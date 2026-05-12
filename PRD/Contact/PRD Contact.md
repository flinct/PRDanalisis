# **Product Requirement Document (PRD)**

**Feature**: Contacts Module (Contacts Page \+ Contact Editor in Conversation and Ticket)  
**Product Manager**: Yusril Ibnu  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

Prototype Ref: [https://chatgpt.com/canvas/shared/697ac4680d20819192ed94d1da2f85fd](https://chatgpt.com/canvas/shared/697ac4680d20819192ed94d1da2f85fd) 

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2026-01-29 | Yusril | Initial PRD for Contacts page aligned to prototype and access rules. |

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Provide a centralized Contacts module to manage contact identity, channel identifiers, and segmentation tags. Enable contact editing directly from Conversation Detail and Ticket Detail to reduce context switching and keep data fresh for future Broadcast and Sales Pipeline usage. |
| Scope | Includes Contacts page list and detail side panel, shared tag assignment, embedded Contact panel on Conversation Detail and Ticket Detail (view, link, create minimal, edit), and entry points to Broadcast create in a new tab with prefilled targets. |

| In Scope | Out of Scope |
| ----- | ----- |
| Contacts list table with search, filter (tags, source channel), and sorting. | Bulk import/export, deduplication, merge contacts. |
| Contact detail side panel with edit and chat history. | Sales pipeline UI and pipeline stage logic. |
| Inline tag assignment from Contacts list and from embedded Contact panel. | Full omnichannel channel connection setup and credential management. |
| Embedded Contact panel on Conversation Detail and Ticket Detail: view, link existing contact, create minimal contact, edit contact. | Group chat contacts (multi-participant) as first-class model (handled as limited case). |
| “Kirim pesan” entry opens Broadcast create page in new tab with prefilled contact and selected channel target (permission-gated). | Broadcast builder UI, delivery reporting, template authoring. |

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Contact data is scattered across conversations, tickets, and manual notes. | Slow follow-ups, inconsistent personalization, and poor continuity across channels. |
| Segmentation tags are not consistently applied at the contact level. | Hard to target Broadcast later and hard to prioritize accounts/leads. |
| Users must leave the operational screen (Conversation/Ticket) to update contact info. | High friction, lower data quality, and slower daily operations. |

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve contact data readiness for Broadcast and future Sales Pipeline. | 90% of contacts have valid primary channel identifier (value \+ type) within 30 days. |
| Reduce time to update contact context during operations. | Median time from opening Conversation Detail to updating contact field under 20 seconds. |
| Improve segmentation quality with tags. | 80% of active contacts have at least 1 tag (visibility \= All) within 30 days. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin, I want to access Contacts page so that I can manage contacts across the workspace. | 1\. Given I am Admin, When I open Contacts page, Then I can view the contacts list. 2\. Given I open a contact detail, Then I can edit and save fields. 3\. Given I try to open an existing contact by URL, Then access is allowed. |
| US-002 | P0 | As a Supervisor, I want to access Contacts page for my Team Inbox scope so that I can manage relevant contacts. | 1\. Given I am Supervisor, When I open Contacts page, Then I only see contacts within my Team Inbox scope. 2\. Given I try to open a contact outside scope by direct URL, Then I see "Akses ditolak". 3\. Given I open a contact within scope, Then I can edit and save fields. |
| US-003 | P0 | As an Agent, I want to be blocked from Contacts page so that access is controlled. | 1\. Given I am Agent, When I open Contacts page, Then I see "Akses ditolak". 2\. Given I try to open contact detail by direct URL, Then I see "Akses ditolak". 3\. Given I see the error page, Then I can click "Kembali". |
| US-004 | P0 | As an Admin or Supervisor, I want to search contacts by name, office, and primary contact so that I can find contacts quickly. | 1\. Given I type in search, Then the list filters by name, office, and primary contact value. 2\. Given search has no match, Then I see "Tidak ada kontak". 3\. Given I clear search, Then the list returns to previous filter state. |
| US-005 | P0 | As an Admin or Supervisor, I want to filter contacts by tags (visibility \= All) so that I can segment outreach. | 1\. Given I select one or more tags, Then the list only shows contacts that match all selected tags. 2\. Given I click "Reset", Then tag filter is cleared. 3\. Given the filter is active, When I refresh page, Then state persists for the session. |
| US-006 | P0 | As an Admin or Supervisor, I want to filter contacts by source channel so that I can review contacts by acquisition channel. | 1\. Given I select a source channel, Then list only shows contacts with that channel present. 2\. Given I set source channel to "All", Then contacts from all channels are shown. 3\. Given filter is active, Then current selection is visible when reopening Filters. |
| US-007 | P0 | As an Admin or Supervisor, I want to assign tags from the list so that I can update segmentation without opening detail. | 1\. Given I open tags selector in a row, Then I can add or remove multiple tags. 2\. Given I change tags, When I click outside, Then changes are saved and persist after refresh. 3\. Given the contact is blocked, Then tag assignment is still allowed. |
| US-008 | P1 | As an Admin or Supervisor, I want to create a new tag from the UI so that tagging stays flexible. | 1\. Given I type a tag name that does not exist, Then I see "Buat tag baru". 2\. Given I confirm create, Then new tag is available and applied. 3\. Given tag name invalid or duplicate (case-insensitive), Then I see "Nama tag tidak valid" or "Tag sudah ada". |
| US-009 | P0 | As an Admin or Supervisor, I want to open contact detail in a side panel so that I can view and edit without losing list context. | 1\. Given I click a contact row, Then a side panel opens with tabs "Detail informasi" and "Riwayat chat". 2\. Given I close the panel, Then I return to same scroll position. 3\. Given contact does not exist, Then I see "Kontak tidak ditemukan". |
| US-010 | P0 | As an Admin or Supervisor, I want contact detail edit with explicit save so that edits are controlled. | 1\. Given I edit a field, When I do not click "Simpan", Then changes are not persisted. 2\. Given I click "Simpan", Then values persist and reflect in list. 3\. Given validation fails, Then save is blocked and errors shown. |
| US-011 | P0 | As an Admin or Supervisor, I want a “Kirim pesan” entry so that I can start outreach via Broadcast flow. | 1\. Given I have broadcast permission, When I click "Kirim pesan", Then I see available channel targets only. 2\. Given I select a target, Then a new tab opens to Broadcast create with prefilled contactId and target channel. 3\. Given I lack permission, Then "Kirim pesan" is hidden. |
| US-012 | P0 | As an Admin or Supervisor, I want to open the conversation room so that I can continue chat in Inbox. | 1\. Given chat history item exists, When I click "Buka percakapan", Then I navigate to Inbox with room opened. 2\. Given room missing, Then I see "Percakapan tidak tersedia". 3\. Given I go back from Inbox, Then contact panel remains open for same contact. |
| US-013 | P1 | As an Admin or Supervisor, I want blocked contacts to be visible but de-emphasized so that I can avoid outreach mistakes. | 1\. Given a contact is blocked, Then "blocked" label appears muted near the name. 2\. Given blocked, Then "Kirim pesan" is disabled and shows "Kontak diblokir". 3\. Given blocked, Then editing fields and tags is still allowed. |
| US-014 | P0 | As an Admin or Supervisor, I want to view and edit contact directly in Conversation Detail so that I can update context while working. | 1\. Given I open Conversation Detail, Then I see a "Kontak" section with contact summary. 2\. Given I click "Edit kontak", Then contact editor opens and save persists. 3\. Given I edit contact from Conversation Detail, Then Contacts page shows updated data. |
| US-015 | P0 | As an Admin or Supervisor, I want to link or create a contact from Conversation Detail when none exists. | 1\. Given no contact linked, Then I see "Hubungkan kontak" and "Buat kontak". 2\. Given I choose "Buat kontak", Then form is prefilled from conversation sender identity (if available). 3\. Given I link an existing contact, Then conversation shows linked contact immediately. |
| US-016 | P0 | As an Admin or Supervisor, I want to view and edit contact directly in Ticket Detail so that I can keep ticket context consistent. | 1\. Given I open Ticket Detail, Then I see a "Kontak" section with contact summary. 2\. Given ticket has no contact, Then I can "Hubungkan kontak" or "Buat kontak". 3\. Given I save changes, Then updated data is reflected across related conversations. |
| US-017 | P0 | As an Agent, I want contact data to be masked in Conversation/Ticket when I do not have client data permission. | 1\. Given I am Agent, Then contact identifiers (phone, email, usernames) are masked in UI. 2\. Given I try to edit contact, Then edit controls are hidden and I see "Tidak punya akses". 3\. Given I open Broadcast entry point, Then it is hidden. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Roles and Access | 1\. FR-001: System MUST use roles Admin, Supervisor, Agent for this feature. 2\. FR-002: System MUST deny Contacts page access for Agent. 3\. FR-003: System MUST allow Admin to view and edit all contacts. 4\. FR-004: System MUST allow Supervisor to view and edit contacts only within Supervisor Team Inbox scope. 5\. FR-005: System MUST enforce access control server-side for list, detail, link, and all write operations. 6\. FR-006: System MUST gate viewing unmasked contact identifiers by permission Can view Client Data. 7\. FR-007: System MUST gate “Kirim pesan” by Send Broadcast Message permission. |
| Contact Data Model and Identity | 1\. FR-008: System MUST store one Contact entity per person with multiple channel identifiers. 2\. FR-009: System MUST enforce uniqueness per workspace for each channel identifier (whatsapp, email, telegram, instagram, facebook) to prevent duplicates in v1. 3\. FR-010: System MUST store sourceChannel and sourceValue (the primary identifier) per contact. 4\. FR-011: System MUST compute displayName as name if present, otherwise fallback to sourceValue. |
| Supervisor Scope Mapping | 1\. FR-012: System MUST maintain contact.teamInboxIds as a derived set from associated conversations and tickets. 2\. FR-013: Supervisor contact visibility MUST be allowed if intersection(contact.teamInboxIds, supervisor.teamInboxIds) is non-empty. 3\. FR-014: Updates to teamInboxIds MUST happen when a conversation or ticket is created or moved to another Team Inbox. |
| Contact List | 1\. FR-015: System MUST render contacts as a table with horizontal scroll allowed. 2\. FR-016: System MUST show columns: Name, Office, Primary Contact, Last Activity, Created, Tags, Action. 3\. FR-017: System MUST show business type as a chip under office name when present. 4\. FR-018: System MUST show blocked indicator text "blocked" near name when isBlocked is true. 5\. FR-019: System MUST show dates in Asia/Jakarta format for display. |
| Search, Filters, Sorting | 1\. FR-020: System MUST support search across displayName, officeName, and sourceValue. 2\. FR-021: System MUST provide filter by tags (visibility \= All) with multi select. 3\. FR-022: System MUST provide filter by source channel with single select including "All". 4\. FR-023: System MUST default sort by Last Activity desc. 5\. FR-024: System MUST allow clearing search and resetting filters independently. |
| Tags System | 1\. FR-025: System MUST reuse global tag registry (name, color, visibility) for contacts tag assignment. 2\. FR-026: System MUST allow assigning up to 10 tags per contact. 3\. FR-027: Contacts module MUST only allow tags with visibility \= All. 4\. FR-028: System MUST support creating a new tag from Contacts UI (P1) with validation and case-insensitive uniqueness. |
| Contact Detail Side Panel | 1\. FR-029: System MUST open contact detail in a right side panel when a row is clicked. 2\. FR-030: Panel MUST provide tabs: "Detail informasi" and "Riwayat chat". 3\. FR-031: Panel MUST allow editing fields with explicit "Simpan" and "Reset". 4\. FR-032: Panel MUST show dirty state and disable "Simpan" when no changes exist. 5\. FR-033: Panel MUST mask identifiers for users without Can view Client Data permission. |
| Embedded Contact Panel in Conversation Detail | 1\. FR-034: System MUST show "Kontak" section in Conversation Detail right panel. 2\. FR-035: If conversation.contactId exists, section MUST display contact summary and provide "Edit kontak" for allowed roles. 3\. FR-036: If no contactId, section MUST provide "Hubungkan kontak" and "Buat kontak" for allowed roles. 4\. FR-037: Create contact MUST prefill sourceChannel and sourceValue from conversation sender identity when available. 5\. FR-038: Link contact MUST allow searching existing contacts by identifier or name and set conversation.contactId on confirm. |
| Embedded Contact Panel in Ticket Detail | 1\. FR-039: System MUST show "Kontak" section in Ticket Detail. 2\. FR-040: Ticket contact MUST be derived from ticket.contactId if present; otherwise from linked conversation.contactId if exists. 3\. FR-041: If no contact linked, section MUST provide "Hubungkan kontak" and "Buat kontak" for allowed roles. 4\. FR-042: Link and create flows MUST match Conversation Detail behavior. |
| Broadcast Entry Points | 1\. FR-043: System MUST show "Kirim pesan" only to users with Send Broadcast Message permission. 2\. FR-044: System MUST hide channel targets with missing contact data. 3\. FR-045: System MUST disable "Kirim pesan" for blocked contacts and show "Kontak diblokir". 4\. FR-046: Selecting a target MUST open a new browser tab to Broadcast create page with prefilled contactId and target channel. |
| Chat History and Deep Link | 1\. FR-047: "Riwayat chat" MUST show list of rooms associated with the contact. 2\. FR-048: Each item MUST provide "Buka percakapan" that navigates to Inbox and opens the room. 3\. FR-049: Deep link MUST enforce existing Inbox access rules. |
| Audit and Traceability | 1\. FR-050: System MUST record actor and timestamp for contact edits and tag changes. 2\. FR-051: System MUST record actor and timestamp for contact link changes (conversation.contactId, ticket.contactId). 3\. FR-052: System MUST store timezone Asia/Jakarta for display and reporting fields where applicable. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Permission | Block Contacts page for Agent. | "Akses ditolak". Tombol "Kembali". |
| EH-002 | Permission | Block Supervisor access outside Team Inbox scope (list, detail, write). | "Akses ditolak". |
| EH-003 | Permission | Hide edit controls when user lacks Can view Client Data. | "Tidak punya akses". |
| EH-004 | Validation | Prevent save when identifier invalid format (phone, email, username). | "Format tidak valid". Highlight field. |
| EH-005 | Validation | Prevent save when identifier duplicates existing contact in workspace. | "Kontak dengan data ini sudah ada". |
| EH-006 | Action | Disable "Kirim pesan" when no channel available. | Tooltip "Tidak ada channel". |
| EH-007 | Action | Disable "Kirim pesan" for blocked contact. | "Kontak diblokir". |
| EH-008 | Navigation | Room missing when opening conversation. | "Percakapan tidak tersedia". Tombol "Tutup". |
| EH-009 | Network | Save failed on contact edit or tag update. | "Gagal menyimpan. Coba lagi". Tombol "Coba lagi". |
| EH-010 | Data | Contact not found. | "Kontak tidak ditemukan". Tombol "Tutup". |
| EH-011 | Conflict | Contact updated with stale version. | "Data berubah. Muat ulang". Tombol "Muat ulang". |

## **8\. Edge Cases**

| ID | Scenario | Expected System Behavior | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EC-001 | Supervisor loses Team Inbox role while page is open. | Next request denies reads and writes. | "Akses ditolak". |
| EC-002 | Conversation sender identity missing (no phone/email). | Disable "Buat kontak" prefill, allow manual entry. | "Data pengirim tidak lengkap". |
| EC-003 | Ticket created without conversation link. | Ticket contact section allows link or create manually. | No special message. |
| EC-004 | Contact edited in embedded panel while Contacts page open. | Latest write wins, other views refresh on next fetch. | Toast "Data diperbarui". |
| EC-005 | Two users create same tag simultaneously. | Server enforces uniqueness, returns existing tag. | "Tag sudah ada". |
| EC-006 | Blocked toggled off then user opens send menu. | Send becomes available immediately after refresh. | No special message. |
| EC-007 | User clicks row while interacting with tags selector. | Stop propagation on interactive cells. | No special message. |
| EC-008 | Group conversation (multiple participants). | Show contact section in read-only limited mode, link/create disabled in v1. | "Grup belum didukung". |

## **9\. UI and UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Contacts Header | Title "Contacts", search input, Filters button. | 1\. Open Contacts. 2\. Search/filter. 3\. Open detail. | US-001, US-002, US-004, US-005, US-006 |
| Filters Popover | Filter by Source channel and Tags (visibility All). Reset button. | 1\. Open Filters. 2\. Select filters. 3\. Apply and persist for session. | US-005, US-006 |
| Contacts Table | Scrollable table. Default sort Last Activity desc. Row clickable. | 1\. Scan list. 2\. Click row. 3\. Detail panel opens. | US-009 |
| Inline Tags Selector | Multi-select tags, immediate save. Optional "Buat tag baru" (P1). | 1\. Open selector. 2\. Select tags. 3\. Auto-save and toast. | US-007, US-008 |
| Blocked Indicator | Muted "blocked" label near name. | 1\. User sees status. 2\. Avoid outreach mistakes. | US-013 |
| Contact Detail Side Panel | Header with identity, "Kirim pesan" (if allowed), created date. Tabs: Detail, Riwayat chat. | 1\. Open panel. 2\. Edit fields, save/reset. 3\. Open chat room. | US-009, US-010, US-011, US-012 |
| Conversation Detail Contact Section | In Conversation right panel, section label "Kontak", summary, actions: Edit, Link, Create. | 1\. Open conversation detail. 2\. View contact. 3\. Edit/link/create. | US-014, US-015, US-017 |
| Ticket Detail Contact Section | In Ticket detail, same "Kontak" section behavior. | 1\. Open ticket detail. 2\. View or link contact. 3\. Edit and save. | US-016, US-017 |
| Empty/Loading/Error States | List empty "Tidak ada kontak". Detail missing "Kontak tidak ditemukan". Permission "Akses ditolak". | 1\. Predictable state. 2\. Clear next action. | US-003, US-004, US-009 |

## **10\. Field and Validation**

| Entity | Field | Type | Required | Validation Rules | UI Label (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Contact | name | Text | No | Max 80 chars, trim whitespace. | Nama |
| Contact | officeName | Text | No | Max 80 chars, trim whitespace. | Nama kantor |
| Contact | title | Text | No | Max 60 chars. | Jabatan |
| Contact | businessType | Text | No | Max 60 chars. | Jenis usaha |
| Contact | address | Text | No | Max 200 chars. | Alamat |
| Contact | sourceChannel | Enum | Yes | Must be one of the configured channels. | Sumber channel |
| Contact | sourceValue | Text | Yes | Must be valid for selected sourceChannel. Unique within the workspace. | Kontak utama |
| Contact | whatsapp | Text | No | E.164 format, max 20 chars, unique if present. | WhatsApp |
| Contact | email | Text | No | RFC email format, max 120 chars, unique if present. | Email |
| Contact | telegram | Text | No | Starts with "@", max 64 chars, unique if present. | Telegram |
| Contact | instagram | Text | No | Starts with "@", max 64 chars, unique if present. | Instagram |
| Contact | facebook | Text | No | Max 120 chars, unique if present. | Facebook |
| Contact | officePhone | Text | No | E.164 format, max 20 chars. | Telepon kantor |
| Contact | tags | List of Tag IDs | No | Max 10\. Only tags with visibility \= All allowed. | Tag |
| Contact | isBlocked | Boolean | Yes | Default false. | Diblokir |
| Conversation | contactId | ID | No | Must reference existing contact if set. | Kontak |
| Ticket | contactId | ID | No | Must reference existing contact if set. | Kontak |
| Tag | name | Text | Yes | Min 2, max 24, letters/numbers/dash, case-insensitive unique. | Nama tag |
| Tag | color | Enum | Yes | Must be allowed palette. | Warna |
| Tag | visibility | Enum | Yes | All, Conversation, Ticket. Contacts uses All only. | Visibilitas |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | 1\. Contacts list load under 2 seconds for 500 contacts in scope. 2\. Contact panel load in Conversation/Ticket under 500 ms after detail open (cached fetch allowed). |
| Reliability | 1\. Writes MUST be idempotent within 10 seconds (same payload). 2\. Updates MUST use optimistic concurrency to prevent lost updates (stale version rejected). |
| Security | 1\. RBAC and scope checks enforced server-side for all endpoints. 2\. Audit log immutable for contact changes and link changes. |
| Privacy | 1\. Mask contact identifiers for users without Can view Client Data permission. 2\. No raw identifiers leaked via API responses to unauthorized roles. |
| Accessibility | 1\. Table rows keyboard navigable. 2\. Side panel traps focus, ESC closes panel. |
| Observability | Track events: open\_contacts\_list, open\_contact\_detail, save\_contact, update\_contact\_tags, create\_tag, link\_contact\_conversation, link\_contact\_ticket, open\_broadcast\_from\_contact, open\_inbox\_room\_from\_contact. |

## **12\. Dependencies and Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Permission alignment with Can view Client Data and Send Broadcast | Product, Eng | Data leak or blocked workflows | Enforce server-side gating and UI masking, add tests per role. |
| Supervisor scope definition for contacts | Product | Over/under exposure of contacts | Use derived teamInboxIds with clear update triggers and backfill job. |
| Unique constraint on channel identifiers may block legitimate duplicates | Product | Operational friction | Provide clear error with suggestion to search and link existing contact. |
| Inbox deep link contract for opening room | Engineering | Broken navigation | Define stable URL contract and fallback to Inbox home. |
| Broadcast create prefill contract | Engineering | Wrong target channel | Strict validation on Broadcast load, show error "Data penerima tidak valid". |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Contact edit adoption in ops | 40% of Conversation Detail opens by Admin/Supervisor result in at least 1 contact view or edit | 30 days | Event logs |
| Data readiness | 90% contacts have valid sourceChannel \+ sourceValue | 30 days | Contact records |
| Tag adoption | 80% active contacts have at least 1 tag | 30 days | Contact records |
| Broadcast initiation | 50% of contact detail opens trigger "Kirim pesan" | 30 days | Event logs |
| Permission violations blocked | 100% unauthorized attempts blocked | Ongoing | Security logs |

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Bulk import and export | Faster onboarding for large databases. |
| Deduplication and merge | Prevent double outreach and fragmented history. |
| Sales pipeline integration | Reuse contactId as the primary key across deals. |
| Custom properties (Open API) | Enrich contact with domain-specific attributes without schema bloat. |
| Group contacts | Support WA groups and multi-participant mapping. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| No import/export in v1 | Manual setup for large lists. |
| No merge/dedupe | Errors handled by uniqueness constraints, but no consolidation workflow. |
| Contacts page blocked for Agent | Agents cannot manage contacts from centralized page. |
| Group conversations limited | Multi-participant mapping deferred. |

## **16\. Appendix**

| Item | Content |
| ----- | ----- |
| Glossary | 1\. Contact: Person record with channel identifiers and tags. 2\. sourceChannel: Primary channel type for the contact. 3\. sourceValue: Primary identifier value for the contact. 4\. Room: Conversation thread in Inbox. 5\. Team Inbox scope: Contacts visible to Supervisor based on derived teamInboxIds. |

