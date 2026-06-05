# Test Framework: Contact Area Context & RBAC Visibility

Source: `PRD Contact - context and visibility.md` (update feature)
Impact base: `PRD Contact.md` (existing production behavior)

---

## TEST GROUP: CCT-AREA — Area Context Basic CRUD

### CCT-AREA-001: Create Area Context on new contact creation

Prerequisites: Admin role, workspace with at least one active Team Inbox.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Login as Admin | Dashboard loaded |
| 2 | Open Contacts page | Contacts list shown |
| 3 | Click "Buat kontak" | Create contact form opens |
| 4 | Fill all required fields (name, sourceChannel, sourceValue) | Fields valid |
| 5 | Select Team Inbox from dropdown | Team Inbox selected |
| 6 | Click "Simpan" | Contact created |
| 7 | Verify in DB: `contact` table | New row with contactId |
| 8 | Verify in DB: `contact_area_context` table | Row exists with: contactId, area=operational, teamInboxId, status=active |
| 9 | Verify in DB: `contact_reference` table | Row exists with: sourceType=manual |

### CCT-AREA-002: Create Area Context from Sales flow (via Leads)

Prerequisites: Admin with Sales area role, Lead module enabled.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Lead create form | Lead form displayed |
| 2 | Click contact picker | Picker opens, shows Sales contacts only |
| 3 | Click "Buat kontak baru" | Create contact form opens in Sales context |
| 4 | Enter new unique phone number | Field valid |
| 5 | Save contact | Contact created |
| 6 | Verify DB: `contact_area_context` | Row exists with area=sales, source=lead |

### CCT-AREA-003: Multiple Area Contexts for one Global Contact

Prerequisites: Existing contact with Operational Area Context only.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Lead create | Lead form |
| 2 | Enter identifier that matches existing Operational contact | Duplicate detected |
| 3 | Click "Tambahkan ke Sales" | Sales Area Context created |
| 4 | Verify DB: same contactId now has 2 rows in `contact_area_context` | One operational, one sales, different teamInboxId |

### CCT-AREA-004: Cannot create duplicate Area Context (same contact+area+team)

Prerequisites: Contact already has active Area Context for Team Inbox A.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Attempt to create same contact+area+teamInboxId combination | Operation rejected |
| 2 | Verify error message | "Kontak sudah ada di area ini" (EH-006) |
| 3 | Verify DB: no duplicate row created | Single active context remains |

### CCT-AREA-005: Deactivate Area Context

Prerequisites: Contact has active Area Context.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Deactivate Area Context via API or admin panel | Context status set to inactive |
| 2 | Login as user with scope that previously could see this contact | Contact no longer visible in list |
| 3 | Verify DB: status changed to inactive | No hard delete |

---

## TEST GROUP: CCT-DUP — Duplicate Identifier Handling

### CCT-DUP-001: Duplicate identifier in Sales flow — prompt and add to Sales

Prerequisites: Existing contact in Operational context with phone number +628xx.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Navigate to Sales contact creation | Form displayed |
| 2 | Enter phone number +628xx (already exists in Operational) | Field valid |
| 3 | Submit form | Duplicate detected. Prompt appears: "Kontak sudah tersedia" |
| 4 | Verify prompt has action button "Tambahkan ke Sales" | Button visible |
| 5 | Click "Tambahkan ke Sales" | Sales Area Context created. No new Global Contact. |
| 6 | Verify DB: same contactId, new area_context with area=sales | Both contexts coexist |

### CCT-DUP-002: Duplicate identifier in Operational flow — prompt and use existing

Prerequisites: Existing contact in Sales context with phone number +628yy.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Operational contact create form | Form displayed |
| 2 | Enter phone number +628yy (already exists in Sales) | Field valid |
| 3 | Submit form | Duplicate detected. Prompt: "Kontak sudah tersedia" |
| 4 | Verify prompt has action "Gunakan Kontak Ini" | Action visible, NOT "Tambahkan ke Sales" |
| 5 | Click "Gunakan Kontak Ini" | Operational Area Context created for existing Global Contact |

### CCT-DUP-003: Duplicate prompt with masked data (no full data permission)

Prerequisites: User without "Can view Client Data" permission. Existing contact has phone +628zz.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open contact create form | Form displayed |
| 2 | Enter phone +628zz | Field valid |
| 3 | Submit form | Duplicate detected. Prompt appears |
| 4 | Verify phone is masked (e.g., +628******89) | Masked per FR-025 |
| 5 | Verify no area/history details exposed in prompt | Only masked identifier shown |

### CCT-DUP-004: Duplicate identifier with no permission to reuse

Prerequisites: User role without Client Contacts access. Existing contact exists.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Attempt to create contact with existing identifier | Duplicate detected |
| 2 | Verify error | "Kontak sudah tersedia, tetapi Anda tidak memiliki akses" (EH-002) |
| 3 | Contact creation blocked | No new contact created |

---

## TEST GROUP: CCT-RBAC — Visibility Scope

### CCT-RBAC-001: Admin sees all contacts (Area Scope=all, Visibility=all)

Prerequisites: Admin role with Area Scope=all, Visibility=all.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Contacts page | All contacts (Sales + Operational) visible |
| 2 | Verify count includes both Operational and Sales contacts | No filter applied |
| 3 | Open contact detail for a contact with both areas | Both area badges visible ("Sales", "Operasional") |
| 4 | Verify all references (conv, ticket, lead) visible | Full history shown |

### CCT-RBAC-002: Supervisor Operational sees only Operational contacts

Prerequisites: Supervisor role, Area Scope=operational, Visibility Scope=team. Team Inbox scope = Team A.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Contacts page | Only Operational contacts in Team A shown |
| 2 | Search by phone of a Sales-only contact | Contact not in results |
| 3 | Attempt direct URL to Sales-only contact | "Akses ditolak" |
| 4 | Open Operational contact | Can view and edit |

### CCT-RBAC-003: Sales Agent sees only own and assigned Sales contacts

Prerequisites: Sales Agent role, Area Scope=sales, Visibility Scope=own_and_assigned.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Sales contact list | Only contacts created by this user OR linked to assigned Leads shown |
| 2 | Another Sales Agent's contact | Not visible |
| 3 | Contact linked to a Lead assigned to this user | Visible with reason label "Assigned ke saya" |
| 4 | Contact created by this user | Visible with reason label "Dibuat oleh saya" |

### CCT-RBAC-004: Agent without Client Contacts enabled

Prerequisites: Agent role, Client Contacts module disabled.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Contacts page | "Akses ditolak" (preserves old behavior) |
| 2 | Attempt direct URL to any contact | "Akses ditolak" |

### CCT-RBAC-005: Agent with Client Contacts enabled (own_and_assigned)

Prerequisites: Agent role, Client Contacts enabled, Area Scope=operational, Visibility Scope=own_and_assigned.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Contacts page | Contacts page loads (new behavior) |
| 2 | Verify only own/assigned contacts shown | Filtered list |
| 3 | Contact not owned or assigned | Not visible |

### CCT-RBAC-006: Contact outside Team Inbox scope

Prerequisites: Supervisor with Team Inbox A scope. Contact only has Area Context for Team Inbox B.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Contacts page | Contact does not appear |
| 2 | Attempt direct URL to that contact | "Akses ditolak" |
| 3 | Verify no hidden count or metadata exposed | No indication the contact exists |

### CCT-RBAC-007: Role configuration — Area Scope save and validation

Prerequisites: Admin with role management access.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Role Detail | Role form displayed |
| 2 | Enable Client Contacts | Contact Area Scope + Contact Visibility Scope fields appear |
| 3 | Set Area Scope = "Sales", save | Role saved successfully |
| 4 | Login as user with that role | Only Sales contacts visible |
| 5 | Set Area Scope = invalid value (e.g., blank) | Save blocked: "Area kontak tidak valid" |
| 6 | Visibility Scope = blank for non-Admin | Auto-defaults to `own_and_assigned` |

---

## TEST GROUP: CCT-CONV — Conversation Integration

### CCT-CONV-001: Inbound conversation matches existing Global Contact

Prerequisites: Existing contact with phone +628xx in workspace. Contact has Operational Area Context in Team Inbox A. Inbound conversation arrives for Team Inbox A.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Customer sends message from phone +628xx | Inbound conversation created |
| 2 | Verify the conversation sender resolusi | System matches to existing Global Contact (contactId) |
| 3 | Verify conversation.contactId is set to existing contactId | Contact linked |
| 4 | Verify no new Global Contact created | Single contact in DB |
| 5 | Verify Operational Area Context already exists (was created earlier) | No duplicate context |
| 6 | Open Conversation Detail > "Kontak" section | Contact summary displayed with existing data |

### CCT-CONV-002: Inbound conversation from new identifier (auto-create + Area Context)

Prerequisites: No existing contact with this phone number. Inbound conversation arrives for Operational Team Inbox A.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Customer sends message from NEW phone number | Inbound conversation created |
| 2 | Verify system creates new Global Contact | New contactId in `contact` table |
| 3 | Verify `contact_area_context` created | Row with: area=operational, teamInboxId=Team A, source=inbound |
| 4 | Verify `contact_reference` created | Row with: sourceType=conversation, sourceId=conversationId |
| 5 | Verify sourceChannel and sourceValue prefilled from sender identity | Contact has correct primary identifier |
| 6 | Open Conversation Detail > "Kontak" section | Shows "Hubungkan kontak" (already auto-linked? Check FR-057: should resolve), actually since auto-matched, should show contact summary |

### CCT-CONV-003: Inbound conversation from Sales channel (Area Context = sales)

Prerequisites: Sales Team Inbox configured. Inbound conversation arrives.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Customer sends message to Sales channel (e.g., Sales WhatsApp) | Inbound conversation created |
| 2 | Verify new contact created (if new identifier) | New Global Contact |
| 3 | Verify Area Context created with area=sales | Correct area assignment |
| 4 | If identifier exists only in Operational, verify system does NOT create Sales Area Context automatically (EC-009 says move does not auto-create) | Check: FR-019 auto-creates Operational context; FR-018 auto-creates Sales on Lead. Inbound to Sales channel should create Sales context per channel assignment |

Note: Conflict detection needed here — FR-019 says create Operational on inbound operational context, but what about inbound to Sales channel? Implicitly should create Sales Area Context. Verify with PM.

### CCT-CONV-004: Conversation Detail contact section — Admin view

Prerequisites: Admin role. Conversation linked to a contact.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Conversation Detail | Right panel shows "Kontak" section |
| 2 | Verify contact summary displayed | Name, primary contact, area badge |
| 3 | Click "Edit kontak" | Contact editor opens |
| 4 | Edit name field, click "Simpan" | Changes persist, reflected in Contacts page |
| 5 | Verify identifier fields not masked | Full value shown (Admin has data permission) |

### CCT-CONV-005: Conversation Detail contact section — Agent view with masking

Prerequisites: Agent role, assigned to conversation. Agent does NOT have "Can view Client Data" permission.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open assigned Conversation Detail | "Kontak" section visible |
| 2 | Verify contact summary shows masked identifiers | Phone: +628******89 |
| 3 | Verify "Edit kontak" is hidden | "Tidak punya akses" (FR-033, EH-003) |
| 4 | Verify "Kirim pesan" is hidden | Not visible (US-017 AC3) |

### CCT-CONV-006: Conversation Detail — link existing contact when none linked

Prerequisites: Conversation with no contactId. Existing contact available.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Conversation Detail with no contact | "Kontak" section shows "Hubungkan kontak" and "Buat kontak" |
| 2 | Click "Hubungkan kontak" | Contact search picker opens |
| 3 | Search by name or identifier | Results filtered by user's Area + Visibility scope |
| 4 | Select an Operational contact | Confirm link |
| 5 | Verify conversation.contactId set | Contact linked |
| 6 | Verify Area Context exists for this area+teamInbox (created if missing) | Context created if new teamInbox |

### CCT-CONV-007: Conversation Detail — create contact when none linked

Prerequisites: Conversation with no contactId. Sender identity available (phone).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Conversation Detail with no contact | "Hubungkan kontak" and "Buat kontak" shown |
| 2 | Click "Buat kontak" | Create form prefilled with sender phone + channel |
| 3 | Fill additional fields (name, office) | Valid form |
| 4 | Click "Simpan" | New contact created |
| 5 | Verify Area Context created with area matching conversation's Team Inbox | Context row exists |
| 6 | Verify conversation.contactId points to new contact | Linked |

### CCT-CONV-008: Conversation assigned to Agent who cannot see contact in centralized Contacts

Prerequisites: Agent with Visibility Scope=own_and_assigned. Contact was created by another user. No Lead/conv/ticket assigned to this Agent links to this contact. But this Agent IS assigned to the conversation.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Assign conversation to Agent | Agent receives assignment |
| 2 | Agent opens Conversation Detail | Contact summary visible (FR-060: MAY see summary) |
| 3 | Agent opens Contacts page | Contact NOT visible (not own/assigned) |
| 4 | Agent attempts to open full contact detail from conversation | If no full data permission, "Akses ditolak" (FR-061) |

### CCT-CONV-009: Conversation moved between Team Inboxes

Prerequisites: Existing Operational Area Context for Team Inbox A. Conversation is moved to Team Inbox B (also Operational).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Move conversation from Team Inbox A to Team Inbox B | Move succeeds |
| 2 | Verify `contact_reference` captures teamInboxId=B (captures at time of reference, might be immutable per FR-013) | Need clarity: FR-012 says teamInboxIdAtSourceTime — immutable after creation |
| 3 | Verify Area Context for Team Inbox A still active (not auto-deleted per EC-009) | No auto-change |

### CCT-CONV-010: Sender identity missing (no phone/email)

Prerequisites: Inbound conversation arrives without identifiable sender data.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Conversation Detail | No contact linked |
| 2 | Click "Buat kontak" | Form opens WITHOUT prefill (EC-002) |
| 3 | Verify warning: "Data pengirim tidak lengkap" | Message displayed |
| 4 | User can manually enter contact data | Manual entry works |


## TEST GROUP: CCT-TKT — Ticket Integration

### CCT-TKT-001: Ticket with contactId — direct link

Prerequisites: Existing contact. Ticket created with explicit contactId.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create ticket with contactId = existing contact | Ticket created |
| 2 | Open Ticket Detail | "Kontak" section shows contact summary |
| 3 | Verify area badge matches ticket's Team Inbox area | Badge displayed |
| 4 | Click "Edit kontak" | Edit allowed for Admin/Supervisor |

### CCT-TKT-002: Ticket without contactId, derived from linked conversation

Prerequisites: Ticket created from a conversation. Conversation has contactId linked.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create ticket from conversation (conversation has contact) | Ticket created |
| 2 | Verify ticket.contactId may be set, or derived from conversation.contactId | Per FR-040: derived if ticket.contactId missing |
| 3 | Open Ticket Detail | Contact section shows same contact as conversation |
| 4 | Verify any change to contact in ticket propagates | Note: FR-042 says update reflected across "related conversations" |

### CCT-TKT-003: Ticket without contact, no linked conversation

Prerequisites: Standalone ticket (no conversation origin). No contactId.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Ticket Detail with no contact | "Kontak" section shows "Hubungkan kontak" and "Buat kontak" |
| 2 | Click "Hubungkan kontak" | Contact picker opens, filtered by user's Area + Visibility scope |
| 3 | Link existing contact | Ticket.contactId set |
| 4 | Click "Buat kontak" (alternative) | Create form opens (no prefill since no sender) |

### CCT-TKT-004: Ticket contact edit — admin

Prerequisites: Admin role. Ticket with linked contact.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Ticket Detail, click "Edit kontak" | Contact editor opens |
| 2 | Edit name field | Field editable |
| 3 | Save | Changes persist in contact table |
| 4 | Open same contact in Contacts page | Changes reflected |

### CCT-TKT-005: Ticket contact view — agent with masking

Prerequisites: Agent role assigned to ticket. No "Can view Client Data" permission.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open assigned Ticket Detail | Contact section visible |
| 2 | Verify identifiers masked | Phone/email masked |
| 3 | Verify edit controls hidden | "Tidak punya akses" |

### CCT-TKT-006: Ticket contact derived from conversation — conversation contact is outside user's scope

Prerequisites: User is assigned to ticket. Ticket derives contact from conversation. User does NOT have access to the conversation itself (different Team Inbox).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Ticket Detail | Contact summary visible (assigned to ticket grants access per FR-060) |
| 2 | Try to click through to conversation from contact history | If conversation outside scope, "Percakapan tidak tersedia" or "Akses ditolak" |


## TEST GROUP: CCT-BRD — Broadcast Integration

### CCT-BRD-001: Broadcast recipient picker — Operational scope

Prerequisites: User with Area Scope=operational, Visibility Scope=team.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Broadcast create | Recipient picker available |
| 2 | Open contact picker | Only Operational contacts in Team Inbox scope shown |
| 3 | No Sales contacts appear | Filtered correctly |
| 4 | Select Operational contact | Contact added as recipient |

### CCT-BRD-002: Broadcast recipient picker — Sales scope

Prerequisites: User with Area Scope=sales, Visibility Scope=team.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Broadcast create | Recipient picker available |
| 2 | Open contact picker | Only Sales contacts in Team Inbox scope shown |
| 3 | No Operational contacts appear | Filtered correctly |

### CCT-BRD-003: Broadcast recipient picker — Area Scope = all (area filter visible)

Prerequisites: User with Area Scope=all.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Broadcast create | Recipient picker with area filter |
| 2 | Filter = "Operasional" | Only Operational contacts shown |
| 3 | Filter = "Sales" | Only Sales contacts shown |
| 4 | Filter = "Semua" | All contacts shown |

### CCT-BRD-004: Broadcast send validates contact area at send time

Prerequisites: Broadcast created with contacts, but before send, contact's area context changed or user's role changed.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Create broadcast with valid contacts | Draft saved |
| 2 | Change user role to remove area access (Admin changes role) | Permission updated |
| 3 | Attempt to send broadcast | Send validation rejects blocked recipients: "Beberapa penerima tidak dapat digunakan" (EC-016) |
| 4 | Review recipient list | Blocked contacts flagged |

### CCT-BRD-005: "Kirim pesan" from Contact Detail — blocked contact

Prerequisites: Contact with isBlocked=true.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Contact Detail for blocked contact | "Kirim pesan" button is disabled |
| 2 | Verify tooltip/title | "Kontak diblokir" (EH-007) |


## TEST GROUP: CCT-LD — Leads Integration

### CCT-LD-001: Lead contact picker — Sales only

Prerequisites: User with Sales scope.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Lead create form | Lead form displayed |
| 2 | Click contact picker | Picker opens, shows Sales contacts only |
| 3 | Search for Operational-only contact | Not found (US-009) |
| 4 | Select Sales contact | Contact linked to Lead |

### CCT-LD-002: Lead creation with existing Operational-only contact

Prerequisites: Existing contact has only Operational Area Context. Sales user creates Lead with that contact's phone.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Enter existing Operational contact's phone in Lead form | Duplicate detected |
| 2 | Prompt appears: "Kontak sudah tersedia" | Prompt shown |
| 3 | Click "Tambahkan ke Sales" | Sales Area Context created |
| 4 | Lead created with existing Global Contact | No duplicate contact |

### CCT-LD-003: Lead contact picker — no contacts available

Prerequisites: No contacts with Sales Area Context in user's scope.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Lead contact picker | Picker opens |
| 2 | Verify empty state | "Tidak ada kontak sales" (US-015) |


## TEST GROUP: CCT-PRV — Data Privacy

### CCT-PRV-001: Phone masking in Contacts list

Prerequisites: User without "Can view Client Data" permission. Contact has phone +6281234567890.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Contacts page | Phone column shows masked value (e.g., +628******90) |
| 2 | Open Contact Detail | Phone masked in detail view |

### CCT-PRV-002: Identifier masking in Conversation Detail

Prerequisites: Agent without data permission. Conversation has linked contact with phone and email.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Conversation Detail > "Kontak" section | Phone masked, email masked |
| 2 | Click "Edit kontak" | Not allowed: "Tidak punya akses" |

### CCT-PRV-003: Identifier masking in duplicate prompt

Prerequisites: User without data permission. Existing contact has phone.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Attempt create contact with existing phone | Duplicate prompt shown |
| 2 | Verify phone in prompt is masked | Only masked value visible |
| 3 | Verify no area or history data exposed in prompt | Only safe summary |


## TEST GROUP: CCT-MIG — Migration

### CCT-MIG-001: Legacy contacts get Operational Area Context

Prerequisites: Workspace has existing contacts with teamInboxIds populated.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run migration | Migration completes successfully |
| 2 | Verify for each legacy contact: contact_area_context created | Row with area=operational, teamInboxId from legacy data |
| 3 | Verify no contact lost | All contactIds preserved |
| 4 | Verify no duplicate Global Contact created | Zero new global contacts |

### CCT-MIG-002: Legacy contacts without teamInboxIds

Prerequisites: Workspace has contacts where teamInboxIds is empty (e.g., created by Admin before team inbox existed).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run migration | Migration completes |
| 2 | Verify these contacts do NOT get Area Context | No auto-created context |
| 3 | Verify Admin can still access via review view | Admin-only review available (EC-015) |
| 4 | Non-Admin user attempts to access | Not visible (no Area Context) |

### CCT-MIG-003: Migration idempotent

Prerequisites: Migration already completed once.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run migration again | No duplicate Area Context created |
| 2 | Verify error handling | Graceful skip or success with 0 changes |

### CCT-MIG-004: Admin role gets Area Scope=all, Visibility=all after migration

Prerequisites: Default Admin role before migration.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run migration | Admin role updated (FR-069) |
| 2 | Verify Contact Area Scope = all | Set correctly |
| 3 | Verify Contact Visibility Scope = all | Set correctly |
| 4 | Login as Admin | All contacts visible (no regression) |

### CCT-MIG-005: Agent role migration does not grant broader access

Prerequisites: Agent role before migration had no Contacts access.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Run migration | Agent role keeps Client Contacts off (FR-072: no broader access) |
| 2 | Login as Agent | Contacts page still blocked |


## TEST GROUP: CCT-CNC — Concurrency

### CCT-CNC-001: Duplicate prompt race — two users same identifier

Prerequisites: Two Admin users. No existing contact with identifier X.

| Step | Action | Expected |
|------|--------|----------|
| 1 | User A and User B simultaneously open create contact form | Both forms valid |
| 2 | Both enter same identifier X | Both submit |
| 3 | Both submit at approximately same time | One succeeds, one gets duplicate prompt |
| 4 | User who gets prompt clicks "Gunakan Kontak Ini" | Area Context created for user's team |
| 5 | Verify only ONE Global Contact exists | Single contactId |

### CCT-CNC-002: Migration + admin role edit concurrently

Prerequisites: Migration running. Admin concurrently edits role.

| Step | Action | Expected |
|------|--------|----------|
| 1 | Start migration | Migration in progress |
| 2 | Admin opens Role Detail and changes Contact Visibility Scope | Save attempted |
| 3 | Verify system handles conflict | Either: queue edit until migration completes, or reject edit with retry message (EH-016) |

### CCT-CNC-003: Team Inbox membership changes while viewing Contacts

Prerequisites: User viewing Contacts page. Admin removes user's Team Inbox membership.

| Step | Action | Expected |
|------|--------|----------|
| 1 | User opens Contacts page | Contact list loaded |
| 2 | Admin removes user from Team Inbox A | Membership changed |
| 3 | User performs any action (scroll, click, search) | Next API request returns updated data (EC-013: contacts removed from view) |
| 4 | If user has dirty form and tries to save | "Data berubah. Muat ulang" (EH-017) |


## TEST GROUP: CCT-API — API Contract (Breaking Changes)

### CCT-API-001: POST /api/v1/contacts — duplicate returns prompt, not error

Prerequisites: Existing contact with identifier X.

| Step | Action | Expected |
|------|--------|----------|
| 1 | POST /contacts with existing identifier X | Status 200/209 (not 4xx) |
| 2 | Response body contains prompt object | `{ status: "duplicate", prompt: { action: "add_to_sales" or "use_existing" }, contactId: existingId }` |
| 3 | Old API client expecting error | Client should handle new response shape |

### CCT-API-002: GET /api/v1/contacts — new filter params

Prerequisites: Multiple contacts with different areas.

| Step | Action | Expected |
|------|--------|----------|
| 1 | GET /contacts?area=sales | Only Sales contacts returned |
| 2 | GET /contacts?area=operational | Only Operational contacts returned |
| 3 | GET /contacts without area param | Default: filtered by user's Area Scope |
| 4 | Old API client expecting unfiltered list | Response now filtered (breaking) |


## REGRESSION TEST SCOPE (Impact from existing PRD)

These tests verify old behaviors are NOT broken by the update:

| ID | Old Behavior | Test |
|----|-------------|------|
| REG-001 | Agent blocked from Contacts page (Client Contacts disabled) | Agent without access → "Akses ditolak" |
| REG-002 | Admin can view and edit all contacts | Admin with all/all → full access |
| REG-003 | Search by name, office, primary contact | Search still works across allowed scope |
| REG-004 | Filter by tags (visibility=All) | Tag filter still works, combined with area filter |
| REG-005 | Filter by source channel | Channel filter still works |
| REG-006 | Contact detail side panel with tabs | Detail panel still opens with Detail info + Chat history |
| REG-007 | Inline tag assignment from list | Tag inline edit still works |
| REG-008 | "Buka percakapan" from chat history | Deep link to Inbox still works |
| REG-009 | Create tag from UI | Tag creation still works |
| REG-010 | Contact detail "Save" and "Reset" buttons | Explicit save still works |


## TEST DATA REQUIREMENTS SUMMARY

| Entity | Minimum Data Needed |
|--------|-------------------|
| Workspace | 1 workspace with 3+ Team Inboxes |
| Roles | Admin, Supervisor (Operational), Supervisor (Sales), Agent (no Contacts), Agent (with Contacts), Sales Agent |
| Contacts | 10+ contacts across Operational and Sales areas, some with dual-area, some blocked, some without Team Inbox |
| Conversations | 5+ conversations, some linked to contacts, some with no contact, some inbound from new/existing identifiers |
| Tickets | 5+ tickets, some with direct contactId, some derived from conversation, some standalone |
| Leads | 3+ leads linked to contacts with Sales area |
| Broadcasts | 2+ broadcasts (drafts), some with area-scoped recipients |
| Users | 5+ test user accounts matching all role types above |
