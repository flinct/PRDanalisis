# Test Framework: Contact Area Context & RBAC Visibility

Source: `PRD Contact - context and visibility.md` (update feature)

Total test cases: **53**

| ENV | Passed | Failed | On Test | Need to Test |
|:----|-------:|-------:|--------:|-------------:|
| DEV | 0 | 0 | 0 | 53 |
| Staging | 0 | 0 | 0 | 53 |
| Prod | 0 | 0 | 0 | 53 |

---

## TEST GROUP: CCT-AREA — Area Context Basic CRUD

### CCT-AREA-001 · Create Area Context on new contact creation

| | |
|:--|:--|
| **Pre-Condition** | Admin role, workspace with at least one active Team Inbox. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Login as Admin
2. Open Contacts page
3. Click "Buat kontak"
4. Fill all required fields (name, sourceChannel, sourceValue)
5. Select Team Inbox from dropdown
6. Click "Simpan"
7. Verify in DB: `contact` table
8. Verify in DB: `contact_area_context` table
9. Verify in DB: `contact_reference` table

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Dashboard loaded | | Need to Test | | Need to Test |
| Contacts list shown | | Need to Test | | Need to Test |
| Create contact form opens | | Need to Test | | Need to Test |
| Fields valid | | Need to Test | | Need to Test |
| Team Inbox selected | | Need to Test | | Need to Test |
| Contact created | | Need to Test | | Need to Test |
| New row with contactId | | Need to Test | | Need to Test |
| Row exists with: contactId, area=operational, teamInboxId, status=active | | Need to Test | | Need to Test |
| Row exists with: sourceType=manual | | Need to Test | | Need to Test |

---

### CCT-AREA-002 · Create Area Context from Sales flow (via Leads)

| | |
|:--|:--|
| **Pre-Condition** | Admin with Sales area role, Lead module enabled. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Lead create form
2. Click contact picker
3. Click "Buat kontak baru"
4. Enter new unique phone number
5. Save contact
6. Verify DB: `contact_area_context`

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Lead form displayed | | Need to Test | | Need to Test |
| Picker opens, shows Sales contacts only | | Need to Test | | Need to Test |
| Create contact form opens in Sales context | | Need to Test | | Need to Test |
| Field valid | | Need to Test | | Need to Test |
| Contact created | | Need to Test | | Need to Test |
| Row exists with area=sales, source=lead | | Need to Test | | Need to Test |

---

### CCT-AREA-003 · Multiple Area Contexts for one Global Contact

| | |
|:--|:--|
| **Pre-Condition** | Existing contact with Operational Area Context only. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Navigate to Lead create
2. Enter identifier that matches existing Operational contact
3. Click "Tambahkan ke Sales"
4. Verify DB: same contactId now has 2 rows in `contact_area_context`

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Lead form | | Need to Test | | Need to Test |
| Duplicate detected | | Need to Test | | Need to Test |
| Sales Area Context created | | Need to Test | | Need to Test |
| One operational, one sales, different teamInboxId | | Need to Test | | Need to Test |

---

### CCT-AREA-004 · Cannot create duplicate Area Context (same contact+area+team)

| | |
|:--|:--|
| **Pre-Condition** | Contact already has active Area Context for Team Inbox A. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Attempt to create same contact+area+teamInboxId combination
2. Verify error message
3. Verify DB: no duplicate row created

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Operation rejected | | Need to Test | | Need to Test |
| "Kontak sudah ada di area ini" (EH-006) | | Need to Test | | Need to Test |
| Single active context remains | | Need to Test | | Need to Test |

---

### CCT-AREA-005 · Deactivate Area Context

| | |
|:--|:--|
| **Pre-Condition** | Contact has active Area Context. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Deactivate Area Context via API or admin panel
2. Login as user with scope that previously could see this contact
3. Verify DB: status changed to inactive

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Context status set to inactive | | Need to Test | | Need to Test |
| Contact no longer visible in list | | Need to Test | | Need to Test |
| No hard delete | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-DUP — Duplicate Identifier Handling

### CCT-DUP-001 · Duplicate identifier in Sales flow — prompt and add to Sales

| | |
|:--|:--|
| **Pre-Condition** | Existing contact in Operational context with phone number +628xx. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Navigate to Sales contact creation
2. Enter phone number +628xx (already exists in Operational)
3. Submit form
4. Verify prompt has action button "Tambahkan ke Sales"
5. Click "Tambahkan ke Sales"
6. Verify DB: same contactId, new area_context with area=sales

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Form displayed | | Need to Test | | Need to Test |
| Field valid | | Need to Test | | Need to Test |
| Duplicate detected. Prompt appears: "Kontak sudah tersedia" | | Need to Test | | Need to Test |
| Button visible | | Need to Test | | Need to Test |
| Sales Area Context created. No new Global Contact. | | Need to Test | | Need to Test |
| Both contexts coexist | | Need to Test | | Need to Test |

---

### CCT-DUP-002 · Duplicate identifier in Operational flow — prompt and use existing

| | |
|:--|:--|
| **Pre-Condition** | Existing contact in Sales context with phone number +628yy. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Operational contact create form
2. Enter phone number +628yy (already exists in Sales)
3. Submit form
4. Verify prompt has action "Gunakan Kontak Ini"
5. Click "Gunakan Kontak Ini"

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Form displayed | | Need to Test | | Need to Test |
| Field valid | | Need to Test | | Need to Test |
| Duplicate detected. Prompt: "Kontak sudah tersedia" | | Need to Test | | Need to Test |
| Action visible, NOT "Tambahkan ke Sales" | | Need to Test | | Need to Test |
| Operational Area Context created for existing Global Contact | | Need to Test | | Need to Test |

---

### CCT-DUP-003 · Duplicate prompt with masked data (no full data permission)

| | |
|:--|:--|
| **Pre-Condition** | User without "Can view Client Data" permission. Existing contact has phone +628zz. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open contact create form
2. Enter phone +628zz
3. Submit form
4. Verify phone is masked (e.g., +628******89)
5. Verify no area/history details exposed in prompt

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Form displayed | | Need to Test | | Need to Test |
| Field valid | | Need to Test | | Need to Test |
| Duplicate detected. Prompt appears | | Need to Test | | Need to Test |
| Masked per FR-025 | | Need to Test | | Need to Test |
| Only masked identifier shown | | Need to Test | | Need to Test |

---

### CCT-DUP-004 · Duplicate identifier with no permission to reuse

| | |
|:--|:--|
| **Pre-Condition** | User role without Client Contacts access. Existing contact exists. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Attempt to create contact with existing identifier
2. Verify error
3. Contact creation blocked

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Duplicate detected | | Need to Test | | Need to Test |
| "Kontak sudah tersedia, tetapi Anda tidak memiliki akses" (EH-002) | | Need to Test | | Need to Test |
| No new contact created | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-RBAC — Visibility Scope

### CCT-RBAC-001 · Admin sees all contacts (Area Scope=all, Visibility=all)

| | |
|:--|:--|
| **Pre-Condition** | Admin role with Area Scope=all, Visibility=all. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Contacts page
2. Verify count includes both Operational and Sales contacts
3. Open contact detail for a contact with both areas
4. Verify all references (conv, ticket, lead) visible

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| All contacts (Sales + Operational) visible | | Need to Test | | Need to Test |
| No filter applied | | Need to Test | | Need to Test |
| Both area badges visible ("Sales", "Operasional") | | Need to Test | | Need to Test |
| Full history shown | | Need to Test | | Need to Test |

---

### CCT-RBAC-002 · Supervisor Operational sees only Operational contacts

| | |
|:--|:--|
| **Pre-Condition** | Supervisor role, Area Scope=operational, Visibility Scope=team. Team Inbox scope = Team A. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Contacts page
2. Search by phone of a Sales-only contact
3. Attempt direct URL to Sales-only contact
4. Open Operational contact

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Only Operational contacts in Team A shown | | Need to Test | | Need to Test |
| Contact not in results | | Need to Test | | Need to Test |
| "Akses ditolak" | | Need to Test | | Need to Test |
| Can view and edit | | Need to Test | | Need to Test |

---

### CCT-RBAC-003 · Sales Agent sees only own and assigned Sales contacts

| | |
|:--|:--|
| **Pre-Condition** | Sales Agent role, Area Scope=sales, Visibility Scope=own_and_assigned. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Sales contact list
2. Another Sales Agent's contact
3. Contact linked to a Lead assigned to this user
4. Contact created by this user

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Only contacts created by this user OR linked to assigned Leads shown | | Need to Test | | Need to Test |
| Not visible | | Need to Test | | Need to Test |
| Visible with reason label "Assigned ke saya" | | Need to Test | | Need to Test |
| Visible with reason label "Dibuat oleh saya" | | Need to Test | | Need to Test |

---

### CCT-RBAC-004 · Agent without Client Contacts enabled

| | |
|:--|:--|
| **Pre-Condition** | Agent role, Client Contacts module disabled. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Contacts page
2. Attempt direct URL to any contact

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| "Akses ditolak" (preserves old behavior) | | Need to Test | | Need to Test |
| "Akses ditolak" | | Need to Test | | Need to Test |

---

### CCT-RBAC-005 · Agent with Client Contacts enabled (own_and_assigned)

| | |
|:--|:--|
| **Pre-Condition** | Agent role, Client Contacts enabled, Area Scope=operational, Visibility Scope=own_and_assigned. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Contacts page
2. Verify only own/assigned contacts shown
3. Contact not owned or assigned

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Contacts page loads (new behavior) | | Need to Test | | Need to Test |
| Filtered list | | Need to Test | | Need to Test |
| Not visible | | Need to Test | | Need to Test |

---

### CCT-RBAC-006 · Contact outside Team Inbox scope

| | |
|:--|:--|
| **Pre-Condition** | Supervisor with Team Inbox A scope. Contact only has Area Context for Team Inbox B. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Contacts page
2. Attempt direct URL to that contact
3. Verify no hidden count or metadata exposed

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Contact does not appear | | Need to Test | | Need to Test |
| "Akses ditolak" | | Need to Test | | Need to Test |
| No indication the contact exists | | Need to Test | | Need to Test |

---

### CCT-RBAC-007 · Role configuration — Area Scope save and validation

| | |
|:--|:--|
| **Pre-Condition** | Admin with role management access. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Role Detail
2. Enable Client Contacts
3. Set Area Scope = "Sales", save
4. Login as user with that role
5. Set Area Scope = invalid value (e.g., blank)
6. Visibility Scope = blank for non-Admin

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Role form displayed | | Need to Test | | Need to Test |
| Contact Area Scope + Contact Visibility Scope fields appear | | Need to Test | | Need to Test |
| Role saved successfully | | Need to Test | | Need to Test |
| Only Sales contacts visible | | Need to Test | | Need to Test |
| Save blocked: "Area kontak tidak valid" | | Need to Test | | Need to Test |
| Auto-defaults to `own_and_assigned` | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-CONV — Conversation Integration

### CCT-CONV-001 · Inbound conversation matches existing Global Contact

| | |
|:--|:--|
| **Pre-Condition** | Existing contact with phone +628xx in workspace. Contact has Operational Area Context in Team Inbox A. Inbound conversation arrives for Team Inbox A. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Customer sends message from phone +628xx
2. Verify the conversation sender resolusi
3. Verify conversation.contactId is set to existing contactId
4. Verify no new Global Contact created
5. Verify Operational Area Context already exists (was created earlier)
6. Open Conversation Detail > "Kontak" section

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Inbound conversation created | | Need to Test | | Need to Test |
| System matches to existing Global Contact (contactId) | | Need to Test | | Need to Test |
| Contact linked | | Need to Test | | Need to Test |
| Single contact in DB | | Need to Test | | Need to Test |
| No duplicate context | | Need to Test | | Need to Test |
| Contact summary displayed with existing data | | Need to Test | | Need to Test |

---

### CCT-CONV-002 · Inbound conversation from new identifier (auto-create + Area Context)

| | |
|:--|:--|
| **Pre-Condition** | No existing contact with this phone number. Inbound conversation arrives for Operational Team Inbox A. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Customer sends message from NEW phone number
2. Verify system creates new Global Contact
3. Verify `contact_area_context` created
4. Verify `contact_reference` created
5. Verify sourceChannel and sourceValue prefilled from sender identity
6. Open Conversation Detail > "Kontak" section

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Inbound conversation created | | Need to Test | | Need to Test |
| New contactId in `contact` table | | Need to Test | | Need to Test |
| Row with: area=operational, teamInboxId=Team A, source=inbound | | Need to Test | | Need to Test |
| Row with: sourceType=conversation, sourceId=conversationId | | Need to Test | | Need to Test |
| Contact has correct primary identifier | | Need to Test | | Need to Test |
| Shows "Hubungkan kontak" (already auto-linked? Check FR-057: should resolve), actually since auto-matched, should show contact summary | | Need to Test | | Need to Test |

---

### CCT-CONV-003 · Inbound conversation from Sales channel (Area Context = sales)

| | |
|:--|:--|
| **Pre-Condition** | Sales Team Inbox configured. Inbound conversation arrives. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Customer sends message to Sales channel (e.g., Sales WhatsApp)
2. Verify new contact created (if new identifier)
3. Verify Area Context created with area=sales
4. If identifier exists only in Operational, verify system does NOT create Sales Area Context automatically (EC-009 says move does not auto-create)

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Inbound conversation created | | Need to Test | | Need to Test |
| New Global Contact | | Need to Test | | Need to Test |
| Correct area assignment | | Need to Test | | Need to Test |
| Check: FR-019 auto-creates Operational context; FR-018 auto-creates Sales on Lead. Inbound to Sales channel should create Sales context per channel assignment | | Need to Test | | Need to Test |

---

### CCT-CONV-004 · Conversation Detail contact section — Admin view

| | |
|:--|:--|
| **Pre-Condition** | Admin role. Conversation linked to a contact. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Conversation Detail
2. Verify contact summary displayed
3. Click "Edit kontak"
4. Edit name field, click "Simpan"
5. Verify identifier fields not masked

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Right panel shows "Kontak" section | | Need to Test | | Need to Test |
| Name, primary contact, area badge | | Need to Test | | Need to Test |
| Contact editor opens | | Need to Test | | Need to Test |
| Changes persist, reflected in Contacts page | | Need to Test | | Need to Test |
| Full value shown (Admin has data permission) | | Need to Test | | Need to Test |

---

### CCT-CONV-005 · Conversation Detail contact section — Agent view with masking

| | |
|:--|:--|
| **Pre-Condition** | Agent role, assigned to conversation. Agent does NOT have "Can view Client Data" permission. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open assigned Conversation Detail
2. Verify contact summary shows masked identifiers
3. Verify "Edit kontak" is hidden
4. Verify "Kirim pesan" is hidden

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| "Kontak" section visible | | Need to Test | | Need to Test |
| Phone: +628******89 | | Need to Test | | Need to Test |
| "Tidak punya akses" (FR-033, EH-003) | | Need to Test | | Need to Test |
| Not visible (US-017 AC3) | | Need to Test | | Need to Test |

---

### CCT-CONV-006 · Conversation Detail — link existing contact when none linked

| | |
|:--|:--|
| **Pre-Condition** | Conversation with no contactId. Existing contact available. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Conversation Detail with no contact
2. Click "Hubungkan kontak"
3. Search by name or identifier
4. Select an Operational contact
5. Verify conversation.contactId set
6. Verify Area Context exists for this area+teamInbox (created if missing)

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| "Kontak" section shows "Hubungkan kontak" and "Buat kontak" | | Need to Test | | Need to Test |
| Contact search picker opens | | Need to Test | | Need to Test |
| Results filtered by user's Area + Visibility scope | | Need to Test | | Need to Test |
| Confirm link | | Need to Test | | Need to Test |
| Contact linked | | Need to Test | | Need to Test |
| Context created if new teamInbox | | Need to Test | | Need to Test |

---

### CCT-CONV-007 · Conversation Detail — create contact when none linked

| | |
|:--|:--|
| **Pre-Condition** | Conversation with no contactId. Sender identity available (phone). |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Conversation Detail with no contact
2. Click "Buat kontak"
3. Fill additional fields (name, office)
4. Click "Simpan"
5. Verify Area Context created with area matching conversation's Team Inbox
6. Verify conversation.contactId points to new contact

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| "Hubungkan kontak" and "Buat kontak" shown | | Need to Test | | Need to Test |
| Create form prefilled with sender phone + channel | | Need to Test | | Need to Test |
| Valid form | | Need to Test | | Need to Test |
| New contact created | | Need to Test | | Need to Test |
| Context row exists | | Need to Test | | Need to Test |
| Linked | | Need to Test | | Need to Test |

---

### CCT-CONV-008 · Conversation assigned to Agent who cannot see contact in centralized Contacts

| | |
|:--|:--|
| **Pre-Condition** | Agent with Visibility Scope=own_and_assigned. Contact was created by another user. No Lead/conv/ticket assigned to this Agent links to this contact. But this Agent IS assigned to the conversation. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Assign conversation to Agent
2. Agent opens Conversation Detail
3. Agent opens Contacts page
4. Agent attempts to open full contact detail from conversation

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Agent receives assignment | | Need to Test | | Need to Test |
| Contact summary visible (FR-060: MAY see summary) | | Need to Test | | Need to Test |
| Contact NOT visible (not own/assigned) | | Need to Test | | Need to Test |
| If no full data permission, "Akses ditolak" (FR-061) | | Need to Test | | Need to Test |

---

### CCT-CONV-009 · Conversation moved between Team Inboxes

| | |
|:--|:--|
| **Pre-Condition** | Existing Operational Area Context for Team Inbox A. Conversation is moved to Team Inbox B (also Operational). |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Move conversation from Team Inbox A to Team Inbox B
2. Verify `contact_reference` captures teamInboxId=B (captures at time of reference, might be immutable per FR-013)
3. Verify Area Context for Team Inbox A still active (not auto-deleted per EC-009)

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Move succeeds | | Need to Test | | Need to Test |
| Need clarity: FR-012 says teamInboxIdAtSourceTime — immutable after creation | | Need to Test | | Need to Test |
| No auto-change | | Need to Test | | Need to Test |

---

### CCT-CONV-010 · Sender identity missing (no phone/email)

| | |
|:--|:--|
| **Pre-Condition** | Inbound conversation arrives without identifiable sender data. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Conversation Detail
2. Click "Buat kontak"
3. Verify warning: "Data pengirim tidak lengkap"
4. User can manually enter contact data

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| No contact linked | | Need to Test | | Need to Test |
| Form opens WITHOUT prefill (EC-002) | | Need to Test | | Need to Test |
| Message displayed | | Need to Test | | Need to Test |
| Manual entry works | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-TKT — Ticket Integration

### CCT-TKT-001 · Ticket with contactId — direct link

| | |
|:--|:--|
| **Pre-Condition** | Existing contact. Ticket created with explicit contactId. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Create ticket with contactId = existing contact
2. Open Ticket Detail
3. Verify area badge matches ticket's Team Inbox area
4. Click "Edit kontak"

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Ticket created | | Need to Test | | Need to Test |
| "Kontak" section shows contact summary | | Need to Test | | Need to Test |
| Badge displayed | | Need to Test | | Need to Test |
| Edit allowed for Admin/Supervisor | | Need to Test | | Need to Test |

---

### CCT-TKT-002 · Ticket without contactId, derived from linked conversation

| | |
|:--|:--|
| **Pre-Condition** | Ticket created from a conversation. Conversation has contactId linked. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Create ticket from conversation (conversation has contact)
2. Verify ticket.contactId may be set, or derived from conversation.contactId
3. Open Ticket Detail
4. Verify any change to contact in ticket propagates

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Ticket created | | Need to Test | | Need to Test |
| Per FR-040: derived if ticket.contactId missing | | Need to Test | | Need to Test |
| Contact section shows same contact as conversation | | Need to Test | | Need to Test |
| Note: FR-042 says update reflected across "related conversations" | | Need to Test | | Need to Test |

---

### CCT-TKT-003 · Ticket without contact, no linked conversation

| | |
|:--|:--|
| **Pre-Condition** | Standalone ticket (no conversation origin). No contactId. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Ticket Detail with no contact
2. Click "Hubungkan kontak"
3. Link existing contact
4. Click "Buat kontak" (alternative)

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| "Kontak" section shows "Hubungkan kontak" and "Buat kontak" | | Need to Test | | Need to Test |
| Contact picker opens, filtered by user's Area + Visibility scope | | Need to Test | | Need to Test |
| Ticket.contactId set | | Need to Test | | Need to Test |
| Create form opens (no prefill since no sender) | | Need to Test | | Need to Test |

---

### CCT-TKT-004 · Ticket contact edit — admin

| | |
|:--|:--|
| **Pre-Condition** | Admin role. Ticket with linked contact. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Ticket Detail, click "Edit kontak"
2. Edit name field
3. Save
4. Open same contact in Contacts page

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Contact editor opens | | Need to Test | | Need to Test |
| Field editable | | Need to Test | | Need to Test |
| Changes persist in contact table | | Need to Test | | Need to Test |
| Changes reflected | | Need to Test | | Need to Test |

---

### CCT-TKT-005 · Ticket contact view — agent with masking

| | |
|:--|:--|
| **Pre-Condition** | Agent role assigned to ticket. No "Can view Client Data" permission. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open assigned Ticket Detail
2. Verify identifiers masked
3. Verify edit controls hidden

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Contact section visible | | Need to Test | | Need to Test |
| Phone/email masked | | Need to Test | | Need to Test |
| "Tidak punya akses" | | Need to Test | | Need to Test |

---

### CCT-TKT-006 · Ticket contact derived from conversation — conversation contact is outside user's scope

| | |
|:--|:--|
| **Pre-Condition** | User is assigned to ticket. Ticket derives contact from conversation. User does NOT have access to the conversation itself (different Team Inbox). |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Ticket Detail
2. Try to click through to conversation from contact history

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Contact summary visible (assigned to ticket grants access per FR-060) | | Need to Test | | Need to Test |
| If conversation outside scope, "Percakapan tidak tersedia" or "Akses ditolak" | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-BRD — Broadcast Integration

### CCT-BRD-001 · Broadcast recipient picker — Operational scope

| | |
|:--|:--|
| **Pre-Condition** | User with Area Scope=operational, Visibility Scope=team. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Broadcast create
2. Open contact picker
3. No Sales contacts appear
4. Select Operational contact

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Recipient picker available | | Need to Test | | Need to Test |
| Only Operational contacts in Team Inbox scope shown | | Need to Test | | Need to Test |
| Filtered correctly | | Need to Test | | Need to Test |
| Contact added as recipient | | Need to Test | | Need to Test |

---

### CCT-BRD-002 · Broadcast recipient picker — Sales scope

| | |
|:--|:--|
| **Pre-Condition** | User with Area Scope=sales, Visibility Scope=team. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Broadcast create
2. Open contact picker
3. No Operational contacts appear

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Recipient picker available | | Need to Test | | Need to Test |
| Only Sales contacts in Team Inbox scope shown | | Need to Test | | Need to Test |
| Filtered correctly | | Need to Test | | Need to Test |

---

### CCT-BRD-003 · Broadcast recipient picker — Area Scope = all (area filter visible)

| | |
|:--|:--|
| **Pre-Condition** | User with Area Scope=all. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Broadcast create
2. Filter = "Operasional"
3. Filter = "Sales"
4. Filter = "Semua"

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Recipient picker with area filter | | Need to Test | | Need to Test |
| Only Operational contacts shown | | Need to Test | | Need to Test |
| Only Sales contacts shown | | Need to Test | | Need to Test |
| All contacts shown | | Need to Test | | Need to Test |

---

### CCT-BRD-004 · Broadcast send validates contact area at send time

| | |
|:--|:--|
| **Pre-Condition** | Broadcast created with contacts, but before send, contact's area context changed or user's role changed. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Create broadcast with valid contacts
2. Change user role to remove area access (Admin changes role)
3. Attempt to send broadcast
4. Review recipient list

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Draft saved | | Need to Test | | Need to Test |
| Permission updated | | Need to Test | | Need to Test |
| Send validation rejects blocked recipients: "Beberapa penerima tidak dapat digunakan" (EC-016) | | Need to Test | | Need to Test |
| Blocked contacts flagged | | Need to Test | | Need to Test |

---

### CCT-BRD-005 · "Kirim pesan" from Contact Detail — blocked contact

| | |
|:--|:--|
| **Pre-Condition** | Contact with isBlocked=true. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Contact Detail for blocked contact
2. Verify tooltip/title

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| "Kirim pesan" button is disabled | | Need to Test | | Need to Test |
| "Kontak diblokir" (EH-007) | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-LD — Leads Integration

### CCT-LD-001 · Lead contact picker — Sales only

| | |
|:--|:--|
| **Pre-Condition** | User with Sales scope. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Lead create form
2. Click contact picker
3. Search for Operational-only contact
4. Select Sales contact

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Lead form displayed | | Need to Test | | Need to Test |
| Picker opens, shows Sales contacts only | | Need to Test | | Need to Test |
| Not found (US-009) | | Need to Test | | Need to Test |
| Contact linked to Lead | | Need to Test | | Need to Test |

---

### CCT-LD-002 · Lead creation with existing Operational-only contact

| | |
|:--|:--|
| **Pre-Condition** | Existing contact has only Operational Area Context. Sales user creates Lead with that contact's phone. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Enter existing Operational contact's phone in Lead form
2. Prompt appears: "Kontak sudah tersedia"
3. Click "Tambahkan ke Sales"
4. Lead created with existing Global Contact

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Duplicate detected | | Need to Test | | Need to Test |
| Prompt shown | | Need to Test | | Need to Test |
| Sales Area Context created | | Need to Test | | Need to Test |
| No duplicate contact | | Need to Test | | Need to Test |

---

### CCT-LD-003 · Lead contact picker — no contacts available

| | |
|:--|:--|
| **Pre-Condition** | No contacts with Sales Area Context in user's scope. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Lead contact picker
2. Verify empty state

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Picker opens | | Need to Test | | Need to Test |
| "Tidak ada kontak sales" (US-015) | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-PRV — Data Privacy

### CCT-PRV-001 · Phone masking in Contacts list

| | |
|:--|:--|
| **Pre-Condition** | User without "Can view Client Data" permission. Contact has phone +6281234567890. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Contacts page
2. Open Contact Detail

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Phone column shows masked value (e.g., +628******90) | | Need to Test | | Need to Test |
| Phone masked in detail view | | Need to Test | | Need to Test |

---

### CCT-PRV-002 · Identifier masking in Conversation Detail

| | |
|:--|:--|
| **Pre-Condition** | Agent without data permission. Conversation has linked contact with phone and email. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Open Conversation Detail > "Kontak" section
2. Click "Edit kontak"

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Phone masked, email masked | | Need to Test | | Need to Test |
| Not allowed: "Tidak punya akses" | | Need to Test | | Need to Test |

---

### CCT-PRV-003 · Identifier masking in duplicate prompt

| | |
|:--|:--|
| **Pre-Condition** | User without data permission. Existing contact has phone. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Attempt create contact with existing phone
2. Verify phone in prompt is masked
3. Verify no area or history data exposed in prompt

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Duplicate prompt shown | | Need to Test | | Need to Test |
| Only masked value visible | | Need to Test | | Need to Test |
| Only safe summary | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-MIG — Migration

### CCT-MIG-001 · Legacy contacts get Operational Area Context

| | |
|:--|:--|
| **Pre-Condition** | Workspace has existing contacts with teamInboxIds populated. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Run migration
2. Verify for each legacy contact: contact_area_context created
3. Verify no contact lost
4. Verify no duplicate Global Contact created

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Migration completes successfully | | Need to Test | | Need to Test |
| Row with area=operational, teamInboxId from legacy data | | Need to Test | | Need to Test |
| All contactIds preserved | | Need to Test | | Need to Test |
| Zero new global contacts | | Need to Test | | Need to Test |

---

### CCT-MIG-002 · Legacy contacts without teamInboxIds

| | |
|:--|:--|
| **Pre-Condition** | Workspace has contacts where teamInboxIds is empty (e.g., created by Admin before team inbox existed). |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Run migration
2. Verify these contacts do NOT get Area Context
3. Verify Admin can still access via review view
4. Non-Admin user attempts to access

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Migration completes | | Need to Test | | Need to Test |
| No auto-created context | | Need to Test | | Need to Test |
| Admin-only review available (EC-015) | | Need to Test | | Need to Test |
| Not visible (no Area Context) | | Need to Test | | Need to Test |

---

### CCT-MIG-003 · Migration idempotent

| | |
|:--|:--|
| **Pre-Condition** | Migration already completed once. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Run migration again
2. Verify error handling

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| No duplicate Area Context created | | Need to Test | | Need to Test |
| Graceful skip or success with 0 changes | | Need to Test | | Need to Test |

---

### CCT-MIG-004 · Admin role gets Area Scope=all, Visibility=all after migration

| | |
|:--|:--|
| **Pre-Condition** | Default Admin role before migration. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Run migration
2. Verify Contact Area Scope = all
3. Verify Contact Visibility Scope = all
4. Login as Admin

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Admin role updated (FR-069) | | Need to Test | | Need to Test |
| Set correctly | | Need to Test | | Need to Test |
| Set correctly | | Need to Test | | Need to Test |
| All contacts visible (no regression) | | Need to Test | | Need to Test |

---

### CCT-MIG-005 · Agent role migration does not grant broader access

| | |
|:--|:--|
| **Pre-Condition** | Agent role before migration had no Contacts access. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Run migration
2. Login as Agent

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Agent role keeps Client Contacts off (FR-072: no broader access) | | Need to Test | | Need to Test |
| Contacts page still blocked | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-CNC — Concurrency

### CCT-CNC-001 · Duplicate prompt race — two users same identifier

| | |
|:--|:--|
| **Pre-Condition** | Two Admin users. No existing contact with identifier X. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. User A and User B simultaneously open create contact form
2. Both enter same identifier X
3. Both submit at approximately same time
4. User who gets prompt clicks "Gunakan Kontak Ini"
5. Verify only ONE Global Contact exists

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Both forms valid | | Need to Test | | Need to Test |
| Both submit | | Need to Test | | Need to Test |
| One succeeds, one gets duplicate prompt | | Need to Test | | Need to Test |
| Area Context created for user's team | | Need to Test | | Need to Test |
| Single contactId | | Need to Test | | Need to Test |

---

### CCT-CNC-002 · Migration + admin role edit concurrently

| | |
|:--|:--|
| **Pre-Condition** | Migration running. Admin concurrently edits role. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. Start migration
2. Admin opens Role Detail and changes Contact Visibility Scope
3. Verify system handles conflict

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Migration in progress | | Need to Test | | Need to Test |
| Save attempted | | Need to Test | | Need to Test |
| Either: queue edit until migration completes, or reject edit with retry message (EH-016) | | Need to Test | | Need to Test |

---

### CCT-CNC-003 · Team Inbox membership changes while viewing Contacts

| | |
|:--|:--|
| **Pre-Condition** | User viewing Contacts page. Admin removes user's Team Inbox membership. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. User opens Contacts page
2. Admin removes user from Team Inbox A
3. User performs any action (scroll, click, search)
4. If user has dirty form and tries to save

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Contact list loaded | | Need to Test | | Need to Test |
| Membership changed | | Need to Test | | Need to Test |
| Next API request returns updated data (EC-013: contacts removed from view) | | Need to Test | | Need to Test |
| "Data berubah. Muat ulang" (EH-017) | | Need to Test | | Need to Test |

---

## TEST GROUP: CCT-API — API Contract (Breaking Changes)

### CCT-API-001 · POST /api/v1/contacts — duplicate returns prompt, not error

| | |
|:--|:--|
| **Pre-Condition** | Existing contact with identifier X. |
| **Test Type** | NEGATIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. POST /contacts with existing identifier X
2. Response body contains prompt object
3. Old API client expecting error

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Status 200/209 (not 4xx) | | Need to Test | | Need to Test |
| `{ status: "duplicate", prompt: { action: "add_to_sales" or "use_existing" }, contactId: existingId }` | | Need to Test | | Need to Test |
| Client should handle new response shape | | Need to Test | | Need to Test |

---

### CCT-API-002 · GET /api/v1/contacts — new filter params

| | |
|:--|:--|
| **Pre-Condition** | Multiple contacts with different areas. |
| **Test Type** | POSITIVE |
| **Tester** | |
| **Date** | |
| **Status DEV** | Need to Test |
| **Status Staging** | — |
| **Status Prod** | Need to Test |

**Steps**

1. GET /contacts?area=sales
2. GET /contacts?area=operational
3. GET /contacts without area param
4. Old API client expecting unfiltered list

| Expected Result | Actual Result | DEV | Staging | Prod |
|:----------------|:--------------|:----|:--------|:-----|
| Only Sales contacts returned | | Need to Test | | Need to Test |
| Only Operational contacts returned | | Need to Test | | Need to Test |
| Default: filtered by user's Area Scope | | Need to Test | | Need to Test |
| Response now filtered (breaking) | | Need to Test | | Need to Test |

---
